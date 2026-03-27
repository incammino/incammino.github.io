#!/usr/bin/env node
'use strict';
/*
  fetch-gospels.js — scarica vangeli romano + ambrosiano
  Romano:     Evangelizo API lang=IT (affidabile, supporta date future)
  Ambrosiano: scraping homepage "oggi" — funziona solo per la data corrente,
              quindi la GitHub Action giornaliera salva giorno per giorno.
              Date già salvate vengono saltate; date future restano col fallback romano.

  Uso: node fetch-gospels.js [giorni]   default=30
*/
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const {URL} = require('url');

const OUTPUT = path.join(__dirname,'gospels.json');
const EVA    = 'https://feed.evangelizo.org/v2/reader.php';
const DAYS   = parseInt(process.argv[2])||30;
const DELAY  = 500;
const sleep  = ms => new Promise(r=>setTimeout(r,ms));

function isoDate(d){return d.toISOString().slice(0,10);}
function evaDate(d){
  return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
}

/* ── HTTP helper with redirect + timeout ── */
function httpGet(rawUrl, hops=8){
  return new Promise((resolve,reject)=>{
    let parsedUrl;
    try { parsedUrl=new URL(rawUrl); } catch(e){ return reject(e); }
    const lib = parsedUrl.protocol==='https:'?https:http;
    const opts = {
      hostname: parsedUrl.hostname,
      port:     parsedUrl.port||undefined,
      path:     parsedUrl.pathname+parsedUrl.search,
      timeout:  25000,
      headers:{
        'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
        'Accept':'text/html,application/xhtml+xml,*/*;q=0.9',
        'Accept-Language':'it-IT,it;q=0.9,en;q=0.5',
        'Accept-Encoding':'identity',
        'Cache-Control':'no-cache',
      }
    };
    const req=lib.get(opts, res=>{
      if([301,302,303,307,308].includes(res.statusCode)&&res.headers.location&&hops>0){
        let loc=res.headers.location;
        if(!loc.startsWith('http')) loc=parsedUrl.origin+loc;
        res.resume(); return resolve(httpGet(loc,hops-1));
      }
      let d=''; res.setEncoding('utf8');
      res.on('data',c=>d+=c);
      res.on('end',()=>resolve(d));
    });
    req.on('error',reject);
    req.on('timeout',()=>{req.destroy();reject(new Error('timeout: '+rawUrl));});
  });
}

/* ── Text cleaner ── */
function clean(raw){
  return (raw||'')
    .replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&nbsp;/g,' ').replace(/&apos;/g,"'").replace(/&quot;/g,'"')
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(n))
    .replace(/Copyright[^\n]*/gi,'').replace(/Per ricevere il Vangelo[^\n]*/gi,'')
    .replace(/vangelodelgiorno\.org[^\n]*/gi,'').replace(/evangelizo\.org[^\n]*/gi,'')
    .split('\n').map(l=>l.trim()).filter(l=>l.length>0).join('\n');
}

/* ── Evangelizo API helper ── */
async function evaGet(params){
  const url=`${EVA}?${new URLSearchParams(params)}`;
  return clean(await httpGet(url));
}

/* ── Romano (Evangelizo, supporta qualsiasi data entro 30gg) ── */
async function fetchRomano(ds){
  const base={date:ds,lang:'IT'};
  const [ref,text,ct,ca,cb]=await Promise.all([
    evaGet({...base,type:'reading_lt',content:'GSP'}),
    evaGet({...base,type:'reading',content:'GSP'}),
    evaGet({...base,type:'comment_t'}),
    evaGet({...base,type:'comment_a'}),
    evaGet({...base,type:'comment'}),
  ]);
  /* Alcuni giorni evangelizo mette il testo del commento in comment_t anziche comment
     (es. testi poetici / non patristici senza autore classico) */
  const commentText  = cb.length > 30 ? cb : ct.length > 30 ? ct : '';
  const commentTitle = cb.length > 30 ? ct : '';
  return {reference:ref, text, commentTitle, commentAuthor:ca, commentText};
}

/* ── Extract gospel text from HTML ── */
function extractGospel(html){
  if(!html||html.length<200) return null;

  let ref='';
  const refPatterns=[
    /Dal\s+Vangelo\s+di\s+Ges[^\n<"]{5,100}/i,
    /Dal\s+Vangelo\s+secondo\s+[^\n<"]{5,80}/i,
    /Vangelo\s+secondo\s+[^\n<"]{5,80}/i,
  ];
  for(const p of refPatterns){const m=html.match(p);if(m){ref=clean(m[0]).slice(0,140);break;}}

  const containers=[
    /<div[^>]+class="[^"]*entry-content[^"]*"[^>]*>([\s\S]{200,12000}?)<\/div>/i,
    /<div[^>]+class="[^"]*td-post-content[^"]*"[^>]*>([\s\S]{200,12000}?)<\/div>/i,
    /<div[^>]+class="[^"]*post-content[^"]*"[^>]*>([\s\S]{200,12000}?)<\/div>/i,
    /<div[^>]+class="[^"]*single[^"]*[^"]*"[^>]*>([\s\S]{200,12000}?)<\/div>/i,
    /<div[^>]+class="[^"]*content[^"]*"[^>]*>([\s\S]{300,15000}?)<\/div>/i,
    /<article[^>]*>([\s\S]{300,20000}?)<\/article>/i,
    /<main[^>]*>([\s\S]{300,20000}?)<\/main>/i,
  ];

  const skipLine = /^(menu|nav|abbonati|newsletter|seguici|contatti|cerca|home|categoria|tag|share|commenta|login|registr|cookie|privacy|facebook|twitter|instagram|youtube|\d{1,2}\/\d{1,2}|\d{4}$)/i;

  for(const re of containers){
    const m=html.match(re);
    if(!m) continue;
    const lines=clean(m[1]).split('\n')
      .filter(l=>l.length>30&&!skipLine.test(l.trim()))
      .slice(0,40);
    if(lines.length>=3&&lines.join(' ').length>200){
      return {reference:ref||'Vangelo — Rito Ambrosiano',text:lines.join('\n')};
    }
  }
  return null;
}

/* ── Ambrosiano: solo homepage "oggi" ──────────────────────────────────────
   Nessuna fonte pubblica offre URL per-data per l'ambrosiano:
   - evangelizo non supporta il rito ambrosiano
   - vangelodelgiorno.org e una SPA React (richiede JS, httpGet restituisce vuoto)
   - missaleambrosianum.it e chiesadimilano.it restituiscono 404
   Soluzione: fetchiamo la homepage "oggi" solo per la data corrente.
   La GitHub Action giornaliera accumula giorno per giorno.
   Le date future rimangono col fallback romano finche non arriva il loro giorno.
────────────────────────────────────────────────────────────────────────── */
const POLLUTION_RE = /(ALL'INIZIO DELL'ASSEMBLEA|A CONCLUSIONE DELLA LITURGIA|Gradisci, o Padre|veramente cosa buona e giusta|Ascolta, Signore, la voce|perdona le nostre colpe)/i;

async function fetchAmbrosiano(d){
  /* Fetcha solo se e oggi — le homepage mostrano solo il giorno corrente */
  if(isoDate(d) !== isoDate(new Date())) return null;

  const sources = [
    'https://www.laparola.it/ambrosiano/',
    'http://www.apostolesacrocuore.org/vangelo-oggi-ambrosiano.php',
  ];

  for(const url of sources){
    try{
      const html = await httpGet(url);
      if(POLLUTION_RE.test(html)) continue;
      const result = extractGospel(html);
      if(result && result.text.length > 100) return result;
    }catch(e){}
    await sleep(200);
  }
  return null;
}

/* ── Main ── */
async function main(){
  let gospels={};
  if(fs.existsSync(OUTPUT)){try{gospels=JSON.parse(fs.readFileSync(OUTPUT,'utf8'));}catch(_){}}

  const dates=[];
  for(let i=-1;i<=DAYS;i++){const d=new Date();d.setDate(d.getDate()+i);dates.push(new Date(d));}

  let dl=0,sk=0,err=0,ambReal=0;
  console.log(`\n  Gospel Fetcher | ${DAYS} giorni | ${isoDate(dates[0])} -> ${isoDate(dates[dates.length-1])}\n`);

  for(let i=0;i<dates.length;i++){
    const d=dates[i], iso=isoDate(d), ds=evaDate(d);
    const ex=gospels[iso];
    const romanOk=ex?.romano?.text?.length>20;

    const ambText=ex?.ambrosiano?.text||'';
    const ambPolluted=POLLUTION_RE.test(ambText);
    const ambOk=ambText.length>20
      && !ex?.ambrosiano?.reference?.includes('rito romano')
      && !ambPolluted;

    /* Valida solo se il commento e presente */
    const commentOk=(ex?.romano?.commentText?.length||0)>20;

    if(romanOk&&ambOk&&commentOk){sk++;process.stdout.write(`\r  [${i+1}/${dates.length}] skip ${iso}`);continue;}

    process.stdout.write(`\r  [${i+1}/${dates.length}] fetch ${iso}...          `);

    try{
      const romano=romanOk&&commentOk?ex.romano:await fetchRomano(ds);
      if(!romano.text||romano.text.length<20) throw new Error('romano empty');
      if(!(romanOk&&commentOk)) await sleep(DELAY);

      let amb=ambOk?ex.ambrosiano:null;
      if(!ambOk){
        try{
          amb=await fetchAmbrosiano(d);
          if(amb){ambReal++;process.stdout.write(` [amb OK]`);}
        }catch(e){}
        await sleep(DELAY/2);
      }

      gospels[iso]={
        romano,
        ambrosiano:amb
          ?{...amb,commentTitle:romano.commentTitle,commentAuthor:romano.commentAuthor,commentText:romano.commentText}
          :{reference:romano.reference+' (rito romano)',text:romano.text,
            commentTitle:romano.commentTitle,commentAuthor:romano.commentAuthor,commentText:romano.commentText},
      };
      dl++;
      if(dl%5===0) fs.writeFileSync(OUTPUT,JSON.stringify(gospels,null,2),'utf8');
    }catch(e){
      err++;
      process.stdout.write(`\n  ERR ${iso}: ${e.message}\n`);
    }
  }

  const sorted=Object.fromEntries(
    Object.entries(gospels).filter(([,v])=>v.romano?.text).sort(([a],[b])=>a.localeCompare(b))
  );
  fs.writeFileSync(OUTPUT,JSON.stringify(sorted,null,2),'utf8');
  const kb=Math.round(fs.statSync(OUTPUT).size/1024);
  const tot=Object.keys(sorted).length;
  const ambTot=Object.values(sorted).filter(v=>!v.ambrosiano?.reference?.includes('rito romano')).length;
  console.log(`\n\n  Scaricati:${dl} | Saltati:${sk} | Errori:${err}`);
  console.log(`  Totale:${tot} | Ambrosiano reale:${ambTot} | ${kb}KB\n`);
}
main().catch(e=>{console.error(e);process.exit(1);});

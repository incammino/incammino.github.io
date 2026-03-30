/* AMDG app.js */
'use strict';

var DEFAULT_PRAYERS = [
  {"id":"mattino","emoji":"\u2600","tag":"Mattino","name":"Guidami, Signore","isDefault":true,"text":"Signore, guidami in questo nuovo giorno, perch\u00e9 io possa riconoscere e abbracciare ci\u00f2 che \u00e8 bene e sconfiggere ci\u00f2 che \u00e8 male e le tentazioni che incontrer\u00f2.\n\nAiutami a far s\u00ec che tutto il mio lavoro e lo studio siano efficaci strumenti per Te, e manda lo Spirito Santo su di me per consigliarmi e guidarmi in ogni cosa.\n\nPer intercessione di Carlo Acutis, non dimenticarti di questo tuo servo.\n\nAmen."},
  {"id":"angelus","emoji":"\ud83d\udd14","tag":"Mezzogiorno","name":"Angelus Domini","isDefault":true,"text":"SPECIAL"},
  {"id":"tentazione","emoji":"\u2694","tag":"Tentazione","name":"Coraggio e Forza","isDefault":true,"text":"Signore Ges\u00f9, donami coraggio e forza in questo momento di tentazione. Aiutami a riconoscere ci\u00f2 che \u00e8 veramente bene e a non distrarmi n\u00e9 cedere a compromessi ingannevoli.\n\nFa\u2019 che sia in questi attimi, quando tutto sembra vacillare, che la mia fede si riveli e cresca.\n\nMaria, Madre potente, intercedi per me e proteggimi dal peccato.\n\nAmen."},
  {"id":"caduta","emoji":"\ud83d\udd4a","tag":"Dopo la Caduta","name":"Rialzami, Signore","isDefault":true,"text":"Signore, tu hai visto la mia lotta e sai che non volevo cadere, eppure sono caduto. Il mio cuore \u00e8 confuso e mi sento debole, ma non voglio allontanarmi da Te proprio adesso.\n\nPerdonami, Signore. Rialzami ancora una volta. Non lasciare che la mia caduta diventi disperazione o che il nemico mi convinca che ormai \u00e8 tutto perduto.\n\nTu conosci la mia fragilit\u00e0 meglio di me: insegnami a ricominciare con pi\u00f9 umilt\u00e0, con pi\u00f9 vigilanza e con pi\u00f9 fiducia nella Tua grazia.\n\nRimettimi in piedi, Signore, e guidami di nuovo sulla Tua strada.\n\nAmen."},
  {"id":"inizio","emoji":"\u270f","tag":"Prima di un Impegno","name":"Tutto a Te","isDefault":true,"text":"Ges\u00f9, mentre inizio ci\u00f2 che mi accingi a farmi vivere, ti affido tutto me stesso. Guidami affinch\u00e9 tutto ci\u00f2 che faccio possa servirTi davvero.\n\nIllumina i miei pensieri e guidami nelle scelte, fa\u2019 che ogni mio sforzo diventi strumento per Te.\n\nAmen."},
  {"id":"maria","emoji":"\ud83c\udf39","tag":"Mariana","name":"Santa Maria, Madre di Dio","isDefault":true,"text":"Santa Maria, Madre di Dio, tu che mai trascuri chi ti chiama, rendimi saldo nella fede e pronto al servizio di Dio. Fa\u2019 che la mia vita sia uno strumento nelle mani di Dio.\n\nIn questo momento affido a te i miei pensieri e desideri. Guida i miei passi, rafforza la mia volont\u00e0, e rendimi capace di compiere il bene che vuoi. Mantienimi saldo nelle prove, fai brillare la tua luce dove c\u2019\u00e8 oscurit\u00e0, e insegnami a camminare con coraggio sulla via della fede.\n\nAmen."},
  {"id":"de_grandmaison","emoji":"\ud83e\udec0","tag":"Padre Léonce de Grandmaison","name":"Preghiera alla Madre di Dio","isDefault":true,"text":"Santa Maria,\nmadre di Dio,\nconservami un cuore di fanciullo,\npuro e limpido come acqua di sorgente.\n\nOttienimi un cuore semplice,\nche non si ripieghi ad assaporare le proprie tristezze;\nun cuore magnanimo nel donarsi,\nfacile alla compassione;\nun cuore fedele e generoso,\nche non dimentichi alcun bene\ne non serbi rancore di alcun male.\n\nFormami un cuore dolce e umile\nche ami senza esigere di essere riamato,\ncontento di scomparire in altri cuori,\nsacrificandosi davanti al Tuo Divin Figlio;\nun cuore grande e indomabile,\ncosì che nessuna ingratitudine lo possa chiudere\ne nessuna indifferenza lo possa stancare;\nun cuore tormentato dalla Gloria di Cristo,\nferito dal Suo amore,\ncon una piaga che non si rimargini\nse non in cielo.\n\nAmen."},
  {"id":"sera","emoji":"\ud83c\udf19","tag":"Sera","name":"Ti Adoro, Mio Dio","isDefault":true,"text":"Ti adoro mio Dio e ti amo con tutto il cuore, ti ringrazio di avermi creato fatto cristiano e conservato in questo giorno, perdonami il male oggi commesso e se qualche bene ho compiuto accettalo custodiscimi nel riposo e liberami dai pericoli la grazia tua sia sempre con me e con tutti i miei cari.\n\nAmen."}
];

/* ── Helpers ── */
var html = document.documentElement;
function todayISO() { return new Date().toISOString().slice(0,10); }
function todayFmt() { var t=new Date(); return ''+t.getFullYear()+String(t.getMonth()+1).padStart(2,'0')+String(t.getDate()).padStart(2,'0'); }
function fmtDate(iso) { try { return new Date(iso).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'}); } catch(e) { return ''; } }

/* ── Theme ── */
var themeBtn = document.getElementById('theme-toggle');
html.setAttribute('data-theme', localStorage.getItem('amdg_theme')||'dark');
if(themeBtn) themeBtn.addEventListener('click', function() {
  var next = html.getAttribute('data-theme')==='dark'?'light':'dark';
  html.setAttribute('data-theme',next); localStorage.setItem('amdg_theme',next);
});

/* ── Date ── */
var dateEl = document.getElementById('site-date');
if(dateEl) dateEl.textContent = new Date().toLocaleDateString('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

/* ── Giussani ── */
function loadGiussani() {
  var el=document.getElementById('giussani-text'), src=document.getElementById('giussani-source');
  if(!el||!src) return;
  if(typeof GIUSSANI==='undefined'||!GIUSSANI.length){el.innerHTML='<p>Caricamento...</p>';return;}
  var doy=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0).getTime())/86400000);
  var q=GIUSSANI[doy%GIUSSANI.length];
  el.innerHTML='';
  q.text.split('\n').filter(function(p){return p.trim();}).forEach(function(t){var p=document.createElement('p');p.textContent=t;el.appendChild(p);});
  src.textContent=q.source;
}
document.addEventListener('DOMContentLoaded', loadGiussani);

/* ── Supabase ── */
var SUPA = null, currentUser = null;

function initSupabase() {
  if(typeof SUPABASE_URL==='undefined'||!SUPABASE_URL||SUPABASE_URL.length<10) return;
  if(typeof supabase==='undefined') return;
  SUPA = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  /* Get current session immediately on load */
  SUPA.auth.getSession().then(function(res) {
    currentUser = (res.data && res.data.session) ? res.data.session.user : null;
    updateAuthUI();
    if(currentUser) {
      loadAllUserData();
    }
  });

  SUPA.auth.onAuthStateChange(function(event, session) {
    currentUser = session ? session.user : null;
    updateAuthUI();
    if(currentUser) {
      loadAllUserData();
    } else {
      showLoggedOutState();
    }
  });
}
initSupabase();

function toEmail(username) { return username.trim().toLowerCase() + '@amdg.app'; }

function updateAuthUI() {
  var btn=document.getElementById('auth-btn'), lbl=document.getElementById('auth-btn-label');
  var notesBtn=document.getElementById('notes-btn');
  if(!btn||!lbl) return;

  /* Personal sections */
  var personalSections = document.querySelectorAll('.personal-section');
  var loginPrompt = document.getElementById('login-prompt');
  var prayerControls = document.querySelectorAll('.prayer-edit-btn, #add-prayer-btn, #reset-prayers-btn');
  var streakBar = document.getElementById('streak-bar');

  if(currentUser) {
    btn.classList.add('logged-in');
    lbl.textContent = (currentUser.email||'').replace('@amdg.app','') || 'Account';
    if(notesBtn) notesBtn.style.display='flex';
    personalSections.forEach(function(s){s.style.display='';});
    if(loginPrompt) loginPrompt.classList.add('hidden');
    prayerControls.forEach(function(b){b.style.display='';});
    if(streakBar) streakBar.style.display='block';
  } else {
    btn.classList.remove('logged-in');
    lbl.textContent = 'Accedi';
    if(notesBtn) notesBtn.style.display='none';
    personalSections.forEach(function(s){s.style.display='none';});
    if(loginPrompt) loginPrompt.classList.remove('hidden');
    prayerControls.forEach(function(b){b.style.display='none';});
    if(streakBar) streakBar.style.display='none';
  }
}

function showLoggedOutState() {
  window._cloudIntentions = [];
  window._cloudPrayers = null;
  window._cloudNotes = [];
  var intList=document.getElementById('int-list');
  if(intList) intList.innerHTML='';
  var notePreviewList = document.getElementById('note-preview-list');
  if(notePreviewList) notePreviewList.innerHTML='';
  renderPrayers();
  renderStreak();
  updateAuthUI();
}

async function loadAllUserData() {
  await Promise.all([
    loadIntentionsFromCloud(),
    loadPrayersFromCloud(),
    loadStreakFromCloud(),
    loadNotesPreview()
  ]);
  recordVisit(); /* Register today's visit before rendering */
  renderIntentions();
  renderPrayers();
  renderStreak();
  renderNotesPreview();
}

/* ── Auth Modal ── */
var authOverlay = document.getElementById('auth-overlay');
var isRegister = false;

function openAuth() { if(authOverlay) authOverlay.classList.remove('hidden'); }
function closeAuth() { if(authOverlay) authOverlay.classList.add('hidden'); }

var authBtn = document.getElementById('auth-btn');
var authClose = document.getElementById('auth-close');

var WELCOME_KEY='amdg_welcome_v1';
var welcomeOverlay=document.getElementById('welcome-overlay');
var welcomeProceedBtn=document.getElementById('welcome-proceed');

function hasSeenWelcome(){ return localStorage.getItem(WELCOME_KEY)==='1'; }
function markWelcomeSeen(){ localStorage.setItem(WELCOME_KEY,'1'); }

function openAuthWithWelcome(){
  if(!hasSeenWelcome()){
    if(welcomeOverlay) welcomeOverlay.classList.remove('hidden');
  } else {
    openAuth();
  }
}

if(welcomeProceedBtn) welcomeProceedBtn.addEventListener('click',function(){
  markWelcomeSeen();
  if(welcomeOverlay) welcomeOverlay.classList.add('hidden');
  openAuth();
});
if(welcomeOverlay) welcomeOverlay.addEventListener('click',function(e){
  if(e.target===welcomeOverlay){
    markWelcomeSeen();
    welcomeOverlay.classList.add('hidden');
  }
});

if(authBtn) authBtn.addEventListener('click', function() {
  if(currentUser) {
    if(confirm('Vuoi uscire dal tuo account?')) {
      if(SUPA) SUPA.auth.signOut();
    }
  } else { openAuthWithWelcome(); }
});
if(authClose) authClose.addEventListener('click', closeAuth);
if(authOverlay) authOverlay.addEventListener('click', function(e){ if(e.target===authOverlay) closeAuth(); });

var loginPromptBtn = document.getElementById('login-prompt-btn');
if(loginPromptBtn) loginPromptBtn.addEventListener('click', openAuthWithWelcome);

var authSwitch = document.getElementById('auth-switch');
if(authSwitch) authSwitch.addEventListener('click', function() {
  isRegister = !isRegister;
  var title=document.getElementById('auth-title'), sub=document.getElementById('auth-submit');
  if(title) title.textContent = isRegister?'Crea Account':'Accedi';
  if(sub) sub.textContent = isRegister?'Crea Account':'Accedi';
  authSwitch.innerHTML = isRegister?'Hai gi\u00e0 un account? <strong>Accedi</strong>':'Non hai un account? <strong>Crea account</strong>';
  var ae=document.getElementById('auth-error'); if(ae) ae.classList.add('hidden');
});

var authForm = document.getElementById('auth-form');
if(authForm) authForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  if(!SUPA) { showAuthErr('Supabase non configurato. Aggiungi le credenziali in config.js'); return; }
  var userInput = document.getElementById('auth-user');
  var pwInput = document.getElementById('auth-password');
  var sub = document.getElementById('auth-submit');
  var username = (userInput?userInput.value:'').trim();
  var pw = pwInput?pwInput.value:'';
  if(!username || username.length<3) { showAuthErr('Nome utente troppo corto (min. 3 caratteri)'); return; }
  if(!/^[a-zA-Z0-9_]+$/.test(username)) { showAuthErr('Solo lettere, numeri e _ nel nome utente'); return; }
  var email = toEmail(username);
  sub.disabled=true; sub.textContent='...';
  try {
    var result;
    if(isRegister) {
      result = await SUPA.auth.signUp({email:email, password:pw, options:{emailRedirectTo:null, data:{username:username}}});
      if(result.error) throw result.error;
      var signIn = await SUPA.auth.signInWithPassword({email:email, password:pw});
      if(signIn.error) {
        showAuthErr('Account creato! Ora accedi con le stesse credenziali.');
        sub.disabled=false; sub.textContent='Crea Account'; return;
      }
    } else {
      result = await SUPA.auth.signInWithPassword({email:email, password:pw});
      if(result.error) throw result.error;
    }
    closeAuth();
  } catch(err) {
    var msg = err.message||'Errore.';
    if(msg.includes('Invalid login')) msg='Nome utente o password errati.';
    if(msg.includes('already registered')) msg='Nome utente gi\u00e0 esistente. Accedi o scegli un altro nome.';
    showAuthErr(msg);
  }
  sub.disabled=false; sub.textContent=isRegister?'Crea Account':'Accedi';
});

function showAuthErr(msg) {
  var ae=document.getElementById('auth-error');
  if(ae){ae.textContent=msg; ae.classList.remove('hidden');}
}

/* ── Gospel ── */
var currentRite='romano', gospelsCache=null;
var LINKS={romano:'https://www.vaticannews.va/it/vangelo-del-giorno-e-parola-del-giorno.html',ambrosiano:'https://www.chiesadimilano.it/letture-rito-ambrosiano'};

function decodeHtmlEntities(str){
  var map={'&rsquo;':'\u2019','&lsquo;':'\u2018','&rdquo;':'\u201D','&ldquo;':'\u201C',
    '&agrave;':'\u00E0','&egrave;':'\u00E8','&igrave;':'\u00EC','&ograve;':'\u00F2','&ugrave;':'\u00F9',
    '&aacute;':'\u00E1','&eacute;':'\u00E9','&iacute;':'\u00ED','&oacute;':'\u00F3','&uacute;':'\u00FA',
    '&Agrave;':'\u00C0','&Egrave;':'\u00C8','&Igrave;':'\u00CC','&Ograve;':'\u00D2','&Ugrave;':'\u00D9',
    '&amp;':'&','&lt;':'<','&gt;':'>','&nbsp;':' ','&apos;':"'",'&quot;':'"',
    '&laquo;':'\u00AB','&raquo;':'\u00BB','&ndash;':'\u2013','&mdash;':'\u2014',
    '&hellip;':'\u2026','&bull;':'\u2022'};
  str=(str||'').replace(/&[a-zA-Z]+;/g,function(e){return map[e]!==undefined?map[e]:e;});
  str=str.replace(/&#(\d+);/g,function(_,n){return String.fromCharCode(parseInt(n,10));});
  str=str.replace(/&#x([0-9a-fA-F]+);/g,function(_,h){return String.fromCharCode(parseInt(h,16));});
  return str;
}
function cleanText(raw){
  return decodeHtmlEntities(raw||'')
    .replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'')
    .replace(/Copyright[^\n]*/gi,'').replace(/Per ricevere il Vangelo[^\n]*/gi,'')
    .replace(/vangelodelgiorno\.org[^\n]*/gi,'')
    .replace(/Compagnia Apostole[^\n]*/gi,'').replace(/Condividi su[^\n]*/gi,'')
    .replace(/Letture del giorno[^\n]*/gi,'').replace(/Archivio[^\n]*/gi,'')
    .replace(/Fonte ufficiale[^\n]*/gi,'').replace(/Dove siamo[^\n]*/gi,'')
    .split('\n').map(function(l){return l.trim();}).filter(function(l){return l.length>0;}).join('\n');
}
function fillEl(el,text){
  el.innerHTML='';
  cleanText(text).split('\n').filter(function(p){return p.trim();}).forEach(function(t){var p=document.createElement('p');p.textContent=t;el.appendChild(p);});
}
/* Extract only the gospel pericope from ambrosiano text */
function extractGospelOnly(raw){
  var cleaned=cleanText(raw||'');
  var lines=cleaned.split('\n');
  /* Strategy: find "In quel tempo" or "Lettura del Vangelo" as the definitive gospel start.
     "Vangelo secondo X" alone is too broad (it appears as a title at the top too). */
  var start=-1, end=-1;
  for(var i=0;i<lines.length;i++){
    var l=lines[i];
    if(start===-1){
      /* Look for the precise start markers */
      if(/In quel tempo/i.test(l) ||
         /^Lettura del Vangelo/i.test(l) ||
         /^Dal Vangelo/i.test(l)){
        start=i;
      }
    } else {
      /* Stop at audio URLs, section headers, or liturgical prayers that follow the gospel */
      if(/^https?:\/\//i.test(l) ||
         /^A CONCLUSIONE/i.test(l) ||
         /^Gradisci/i.test(l) ||
         /^È veramente cosa buona/i.test(l) ||
         /^Ascolta, Signore/i.test(l) ||
         /^Il Signore si ricord/i.test(l) ||
         /^Signore, non disperdere/i.test(l) ||
         /^Parola del Signore/i.test(l)){
        end=i; break;
      }
    }
  }
  if(start===-1){
    /* Last resort: try to find "In quel tempo" more broadly */
    for(var j=0;j<lines.length;j++){
      if(/In quel tempo|in quel tempo/i.test(lines[j])){start=j;break;}
    }
  }
  if(start===-1) return cleaned; /* nothing matched, return all */
  return lines.slice(start, end===-1?undefined:end).join('\n');
}

var gLoad=document.getElementById('gospel-loading'),gContent=document.getElementById('gospel-content'),gError=document.getElementById('gospel-error');
var gRef=document.getElementById('gospel-reference'),gText=document.getElementById('gospel-text'),gLink=document.getElementById('gospel-source-link');
var errLinks=document.getElementById('error-links'),retryBtn=document.getElementById('retry-btn');
var cSection=document.getElementById('comment-section'),cTitle=document.getElementById('comment-title'),cText=document.getElementById('comment-text'),cAuth=document.getElementById('comment-author');

function showLoading(){if(gLoad)gLoad.classList.remove('hidden');if(gContent)gContent.classList.add('hidden');if(gError)gError.classList.add('hidden');}
function showContent(data,rite){
  if(gLoad)gLoad.classList.add('hidden');if(gError)gError.classList.add('hidden');
  if(gRef)gRef.textContent=cleanText(data.reference)||'Vangelo del Giorno';
  /* For ambrosiano, extract only the gospel pericope */
  if(rite==='ambrosiano') fillEl(gText, extractGospelOnly(data.text));
  else if(gText) fillEl(gText,data.text);
  if(gLink)gLink.href=LINKS[rite];
  /* Show comment for both rites; for ambrosiano label it as romano */
  if(cSection){
    var ct=cleanText(data.commentText||'');
    if(ct.length>30){
      var commentLabel=rite==='romano'?'Commento al Vangelo':'Commento al Vangelo Romano';
      if(cTitle)cTitle.textContent=cleanText(data.commentTitle)||commentLabel;
      /* Show the rite label as a small note for ambrosiano */
      var cTag=cSection.querySelector('.comment-tag');
      if(cTag)cTag.textContent=commentLabel;
      if(cAuth)cAuth.textContent=cleanText(data.commentAuthor)?'\u2014 '+cleanText(data.commentAuthor):'';
      if(cText)fillEl(cText,data.commentText);
      cSection.classList.remove('hidden');
    } else {
      cSection.classList.add('hidden');
    }
  }
  if(gContent)gContent.classList.remove('hidden');
}
function showError(rite){
  if(gLoad)gLoad.classList.add('hidden');if(gContent)gContent.classList.add('hidden');
  if(errLinks){errLinks.innerHTML='';var links=rite==='romano'?[{t:'Vatican News',u:LINKS.romano}]:[{t:'La Parola Ambrosiano',u:LINKS.ambrosiano}];links.forEach(function(l){var a=document.createElement('a');a.href=l.u;a.textContent=l.t;a.target='_blank';a.rel='noopener noreferrer';errLinks.appendChild(a);});}
  if(gError)gError.classList.remove('hidden');
}
var POLLUTION_RE=/ALL'INIZIO DELL'ASSEMBLEA|A CONCLUSIONE DELLA LITURGIA|Gradisci, o Padre|veramente cosa buona e giusta|Ascolta, Signore, la voce|perdona le nostre colpe/i;
async function fromFile(rite){
  if(!gospelsCache){var r=await fetch('./gospels.json?v='+todayISO());if(!r.ok)throw new Error('no file');gospelsCache=await r.json();}
  var entry=gospelsCache[todayISO()];if(!entry)throw new Error('no date');
  var data=entry[rite];if(!data||!data.text)throw new Error('no text');
  if(POLLUTION_RE.test(data.text))throw new Error('polluted'); /* bad homepage data — fall through to API */
  return data;
}
var PROXY='https://api.allorigins.win/raw?url=',EVA='https://feed.evangelizo.org/v2/reader.php';
async function evaFetch(p){var qs=Object.keys(p).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(p[k]);}).join('&');var r=await fetch(PROXY+encodeURIComponent(EVA+'?'+qs));if(!r.ok)throw new Error('HTTP '+r.status);return(await r.text()).trim();}
async function fromAPI(){
  var d=todayFmt(),l='IT';
  var res=await Promise.all([
    evaFetch({date:d,lang:l,type:'reading_lt',content:'GSP'}),
    evaFetch({date:d,lang:l,type:'reading',content:'GSP'}),
    evaFetch({date:d,lang:l,type:'comment_t'}),
    evaFetch({date:d,lang:l,type:'comment_a'}),
    evaFetch({date:d,lang:l,type:'comment'})
  ]);
  if(!res[1]||res[1].length<20) throw new Error('empty');
  // Fallback: alcuni giorni il testo finisce in comment_t
  var commentText  = (res[4]&&res[4].length>30) ? res[4] : (res[2]&&res[2].length>30) ? res[2] : '';
  var commentTitle = (res[4]&&res[4].length>30) ? res[2] : '';
  return {reference:res[0], text:res[1], commentTitle:commentTitle, commentAuthor:res[3], commentText:commentText};
}
async function loadGospel(rite){
  showLoading();
  try{var data,ok=false;try{data=await fromFile(rite);ok=true;}catch(e){}
  if(!ok){data=await fromAPI();}
  showContent(data,rite);}catch(err){showError(rite);}
}
document.querySelectorAll('.rite-tab').forEach(function(btn){btn.addEventListener('click',function(){var rite=btn.dataset.rite;if(rite===currentRite)return;currentRite=rite;document.querySelectorAll('.rite-tab').forEach(function(b){b.classList.toggle('active',b.dataset.rite===rite);b.setAttribute('aria-pressed',b.dataset.rite===rite?'true':'false');});loadGospel(rite);});});
if(retryBtn)retryBtn.addEventListener('click',function(){loadGospel(currentRite);});
document.addEventListener('DOMContentLoaded',function(){loadGospel(currentRite);});

/* ── Prayers ── */
var PRAYER_KEY='amdg_prayers_v3';
function getPrayers(){
  /* When logged in, merge cloud prayers with any new defaults */
  if(currentUser && window._cloudPrayers) {
    return mergeDefaultsIntoPrayers(JSON.parse(JSON.stringify(window._cloudPrayers)));
  }
  return JSON.parse(JSON.stringify(DEFAULT_PRAYERS));
}
function savePrayersLocal(a){ if(currentUser) localStorage.setItem(PRAYER_KEY,JSON.stringify(a)); }

/* ── Merge nuove preghiere di default nell'elenco dell'utente ──
   Quando aggiungi una nuova preghiera a DEFAULT_PRAYERS, questa funzione
   la inserisce in testa alla lista di ogni utente che non ce l'ha già. */
function mergeDefaultsIntoPrayers(userPrayers) {
  var userIds = userPrayers.map(function(p){ return p.id; });
  var newDefaults = DEFAULT_PRAYERS.filter(function(dp){
    return userIds.indexOf(dp.id) === -1;
  });
  if(!newDefaults.length) return userPrayers;
  // Le nuove preghiere di default vanno in testa alla lista
  return newDefaults.concat(userPrayers);
}
async function loadPrayersFromCloud(){
  if(!SUPA||!currentUser)return;
  try{
    var r=await SUPA.from('settings').select('prayers').eq('user_id',currentUser.id).single();
    if(r.data&&r.data.prayers){
      /* Aggiungi le nuove preghiere di default che l'utente non ha ancora */
      var merged=mergeDefaultsIntoPrayers(r.data.prayers);
      if(merged.length!==r.data.prayers.length){
        /* Sono state aggiunte nuove preghiere: salva subito nel cloud */
        await savePrayersToCloud(merged);
      }
      window._cloudPrayers=merged;
      localStorage.setItem(PRAYER_KEY,JSON.stringify(merged));
    }
  }catch(e){}
}
async function savePrayersToCloud(a){
  if(!SUPA||!currentUser)return;
  window._cloudPrayers=a;
  try{await SUPA.from('settings').upsert({user_id:currentUser.id,prayers:a},{onConflict:'user_id'});}catch(e){}
}
function makeAngelusBody(){
  return '<div class="angelus-grid"><div class="angelus-col"><span class="lang-badge">Italiano</span><div class="angelus-verses"><p><span class="verse-v">V.</span> L\u2019Angelo del Signore port\u00f2 l\u2019annunzio a Maria</p><p><span class="verse-r">R.</span> E la Vergine concep\u00ec per opera dello Spirito Santo.</p><p class="verse-italic">Ave Maria\u2026</p><p><span class="verse-v">V.</span> Eccomi, sono la serva del Signore.</p><p><span class="verse-r">R.</span> Mi accada secondo la tua parola.</p><p class="verse-italic">Ave Maria\u2026</p><p><span class="verse-v">V.</span> E il Verbo si è fatto carne.</p><p><span class="verse-r">R.</span> Ed ad abita in mezzo a noi.</p><p class="verse-italic">Ave Maria\u2026</p><p><span class="verse-v">V.</span> Prega per noi, santa Madre di Dio.</p><p><span class="verse-r">R.</span> Perch\u00e9 siamo fatti degni delle promesse di Cristo.</p><p class="verse-prayer">Preghiamo. Infondi nel nostro spirito la Tua grazia, o Padre; Tu, che nell\u2019annunzio dell\u2019angelo ci hai rivelato l\u2019incarnazione del Tuo Figlio, per la Sua passione e la Sua croce guidaci alla gloria della risurrezione. Per Cristo nostro Signore.</p><p class="amen">Amen.</p></div></div><div class="angelus-divider"></div><div class="angelus-col"><span class="lang-badge lang-badge--de">Deutsch</span><div class="angelus-verses"><p><span class="verse-v">V.</span> Der Engel des Herrn brachte Maria die Botschaft, und sie empfing vom Heiligen Geist.</p><p><span class="verse-r">R.</span> Gegr\u00fc\u00dfet seist du, Maria\u2026</p><p><span class="verse-v">V.</span> Maria sprach: Siehe, ich bin eine Magd des Herrn, mir geschehe nach Deinem Wort.</p><p><span class="verse-r">R.</span> Gegr\u00fc\u00dfet seist du, Maria\u2026</p><p><span class="verse-v">V.</span> Und das Wort ist Fleisch geworden und hat unter uns gewohnt.</p><p><span class="verse-r">R.</span> Gegr\u00fc\u00dfet seist du, Maria\u2026</p><p><span class="verse-v">V.</span> Bitte f\u00fcr uns, o heilige Gottsgeb\u00e4rerin,</p><p><span class="verse-r">R.</span> auf dass wir w\u00fcrdig werden der Verhe\u00dfungen Christi.</p><p class="verse-prayer">Lasset uns beten: Allm\u00e4chtiger Gott, gie\u00dfe deine Gnade in unsere Herzen ein. Durch die Botschaft des Engels haben wir die Menschwerdung Christi, deines Sohnes, erkannt. Lass uns durch sein Leiden und Kreuz zur Herrlichkeit der Auferstehung gelangen. Darum bitten wir durch Christus, unseren Herrn.</p><p class="amen">Amen.</p></div></div></div>';
}
function makePrayerBody(p){
  if(p.id==='angelus')return makeAngelusBody();
  var out='';
  p.text.split('\n').filter(function(l){return l.trim();}).forEach(function(line){
    if(line.trim()==='Amen.'||line.trim()==='Amen')out+='<p class="amen">Amen.</p>';
    else out+='<p>'+line.replace(/</g,'&lt;')+'</p>';
  });
  return out;
}
function renderPrayers(){
  var list=document.getElementById('prayers-list');if(!list)return;
  var prayers=getPrayers();list.innerHTML='';
  var loggedIn=!!currentUser;
  /* Drag handle SVG (grip icon) — only shown when logged in */
  var GRIP='<span class="prayer-drag-handle" title="Trascina per riordinare"><svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true"><circle cx="3" cy="3" r="1.5"/><circle cx="7" cy="3" r="1.5"/><circle cx="3" cy="8" r="1.5"/><circle cx="7" cy="8" r="1.5"/><circle cx="3" cy="13" r="1.5"/><circle cx="7" cy="13" r="1.5"/></svg></span>';
  prayers.forEach(function(p,idx){
    var item=document.createElement('div');item.className='prayer-item';
    item.dataset.idx=idx; /* used by SortableJS onEnd to rebuild order */
    var dragHandle=loggedIn?GRIP:'';
    var editBtn=loggedIn?'<button class="prayer-edit-btn" data-idx="'+idx+'" title="Modifica">\u270f</button>':'';
    item.innerHTML='<div class="prayer-toggle-row">'+dragHandle+'<button class="prayer-toggle" aria-expanded="false"><span class="prayer-icon">'+p.emoji+'</span><span class="prayer-info"><span class="prayer-tag">'+p.tag+'</span><span class="prayer-name">'+p.name+'</span></span><span class="prayer-chevron" aria-hidden="true"></span></button>'+editBtn+'</div><div class="prayer-body hidden">'+makePrayerBody(p)+'</div>';
    list.appendChild(item);
    var toggle=item.querySelector('.prayer-toggle'),body=item.querySelector('.prayer-body');
    toggle.addEventListener('click',function(){var isOpen=toggle.getAttribute('aria-expanded')==='true';list.querySelectorAll('.prayer-item').forEach(function(i){if(i!==item){i.classList.remove('open');var t=i.querySelector('.prayer-toggle'),b=i.querySelector('.prayer-body');if(t)t.setAttribute('aria-expanded','false');if(b)b.classList.add('hidden');}});toggle.setAttribute('aria-expanded',isOpen?'false':'true');body.classList.toggle('hidden',isOpen);item.classList.toggle('open',!isOpen);});
    if(loggedIn){
      var editEl=item.querySelector('.prayer-edit-btn');
      if(editEl)editEl.addEventListener('click',function(){openPE(idx);});
    }
  });
  /* Show/hide add & reset buttons based on login */
  var addBtn=document.getElementById('add-prayer-btn'),resetBtn=document.getElementById('reset-prayers-btn');
  if(addBtn)addBtn.style.display=loggedIn?'':'none';
  if(resetBtn)resetBtn.style.display=loggedIn?'':'none';
  /* ── SortableJS: drag-to-reorder ── */
  if(loggedIn && typeof Sortable!=='undefined'){
    Sortable.create(list,{
      handle:'.prayer-drag-handle',
      animation:200,
      ghostClass:'prayer-drag-ghost',
      chosenClass:'prayer-drag-chosen',
      dragClass:'prayer-drag-active',
      onEnd:function(evt){
        if(evt.oldIndex===evt.newIndex)return;
        /* Rebuild prayers array in the new DOM order using stored data-idx */
        var snapshot=getPrayers();
        var reordered=[];
        list.querySelectorAll('.prayer-item').forEach(function(el){
          reordered.push(snapshot[parseInt(el.dataset.idx)]);
        });
        window._cloudPrayers=reordered;
        savePrayersLocal(reordered);
        savePrayersToCloud(reordered);
        renderPrayers(); /* refresh data-idx attributes */
      }
    });
  }
}

var peOverlay=document.getElementById('pe-overlay'),peEditIdx=-1;
function openPE(idx){peEditIdx=idx;var prayers=getPrayers();var p=idx>=0&&idx<prayers.length?prayers[idx]:null;document.getElementById('pe-title').textContent=p?'Modifica Preghiera':'Nuova Preghiera';document.getElementById('pe-emoji').value=p?p.emoji:'\u2728';document.getElementById('pe-tag').value=p?p.tag:'';document.getElementById('pe-name').value=p?p.name:'';document.getElementById('pe-text').value=p?(p.id==='angelus'?'(Angelus \u2014 testo fisso)':p.text):'';var del=document.getElementById('pe-delete');if(del)del.classList.toggle('hidden',!p);if(peOverlay)peOverlay.classList.remove('hidden');}
function closePE(){if(peOverlay)peOverlay.classList.add('hidden');peEditIdx=-1;}
var peClose=document.getElementById('pe-close'),peCancel=document.getElementById('pe-cancel');
if(peClose)peClose.addEventListener('click',closePE);if(peCancel)peCancel.addEventListener('click',closePE);
if(peOverlay)peOverlay.addEventListener('click',function(e){if(e.target===peOverlay)closePE();});
var peForm=document.getElementById('pe-form');
if(peForm)peForm.addEventListener('submit',function(e){
  e.preventDefault();
  if(!currentUser){openAuth();return;}
  var prayers=getPrayers();
  var nd={emoji:document.getElementById('pe-emoji').value||'\u2728',tag:document.getElementById('pe-tag').value,name:document.getElementById('pe-name').value,text:document.getElementById('pe-text').value};
  if(peEditIdx>=0&&peEditIdx<prayers.length)Object.assign(prayers[peEditIdx],nd);
  else prayers.push({id:'c'+Date.now(),isDefault:false,emoji:nd.emoji,tag:nd.tag,name:nd.name,text:nd.text});
  savePrayersLocal(prayers);savePrayersToCloud(prayers);renderPrayers();closePE();
});
var peDel=document.getElementById('pe-delete');
if(peDel)peDel.addEventListener('click',function(){if(!confirm('Eliminare questa preghiera?'))return;var prayers=getPrayers();if(peEditIdx>=0)prayers.splice(peEditIdx,1);savePrayersLocal(prayers);savePrayersToCloud(prayers);renderPrayers();closePE();});
var addPBtn=document.getElementById('add-prayer-btn');if(addPBtn)addPBtn.addEventListener('click',function(){if(!currentUser){openAuth();return;}openPE(-1);});
var resetPBtn=document.getElementById('reset-prayers-btn');
if(resetPBtn)resetPBtn.addEventListener('click',function(){if(!currentUser){openAuth();return;}if(!confirm('Ripristinare le preghiere predefinite?'))return;var def=JSON.parse(JSON.stringify(DEFAULT_PRAYERS));savePrayersLocal(def);savePrayersToCloud(def);renderPrayers();});
document.addEventListener('DOMContentLoaded',renderPrayers);

/* ── Intentions (cloud only, visible only when logged in) ── */
async function loadIntentionsFromCloud(){
  if(!SUPA||!currentUser)return;
  try{
    var r=await SUPA.from('intentions').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false});
    if(r.data) window._cloudIntentions=r.data;
    else window._cloudIntentions=[];
  }catch(e){window._cloudIntentions=[];}
}
function getInts(){return window._cloudIntentions||[];}

function renderIntentions(){
  var list=document.getElementById('int-list'),empty=document.getElementById('int-empty');
  if(!list||!empty)return;
  var arr=getInts();list.innerHTML='';
  if(!arr.length){empty.classList.remove('hidden');return;}
  empty.classList.add('hidden');
  arr.forEach(function(item){
    var isAbundant=!!item.abundant;
    var isDone=!!item.done;
    var stateClass=isAbundant?' int-abundant':isDone?' int-done':'';
    var div=document.createElement('div');div.className='int-item'+stateClass;
    var statusLabel=isAbundant?'<span class="int-esaudita int-sovrabb">\u2022 Sovrabbondanza \u2726</span>':isDone?'<span class="int-esaudita">\u2022 Esaudita \u2713</span>':'';
    var noteHtml=isAbundant&&item.abundant_note?'<p class="int-abundant-note">\u201C'+item.abundant_note.replace(/</g,'&lt;')+'\u201D</p>':'';
    var actionsHtml;
    if(isAbundant||isDone){
      actionsHtml='<button class="int-btn int-reopen-btn" data-id="'+item.id+'" title="Riapri">\u21b7</button><button class="int-btn int-del-btn" data-id="'+item.id+'" title="Elimina">\u00d7</button>';
    } else {
      actionsHtml='<button class="int-btn int-done-btn" data-id="'+item.id+'" title="Segna come esaudita">\u2713</button><button class="int-btn int-abundant-btn" data-id="'+item.id+'" title="Compiuta con sovrabbondanza">\u2726</button><button class="int-btn int-del-btn" data-id="'+item.id+'" title="Elimina">\u00d7</button>';
    }
    div.innerHTML='<div class="int-dot"></div><div class="int-body"><p class="int-text">'+item.text.replace(/</g,'&lt;')+'</p><p class="int-date">'+fmtDate(item.created_at)+' '+statusLabel+'</p>'+noteHtml+'</div><div class="int-actions">'+actionsHtml+'</div>';
    list.appendChild(div);
  });

  list.querySelectorAll('.int-done-btn').forEach(function(btn){
    btn.addEventListener('click',async function(){
      var id=btn.dataset.id;
      var arr=getInts();
      var foundIdx=arr.findIndex(function(i){return i.id===id;});
      if(foundIdx>=0){
        arr[foundIdx].done=true;
        arr[foundIdx].abundant=false;
        arr[foundIdx].abundant_note='';
        window._cloudIntentions=arr;
        if(SUPA&&currentUser){
          try{await SUPA.from('intentions').update({done:true,abundant:false,abundant_note:''}).eq('id',id).eq('user_id',currentUser.id);}catch(e){}
        }
        renderIntentions();
      }
    });
  });

  list.querySelectorAll('.int-reopen-btn').forEach(function(btn){
    btn.addEventListener('click',async function(){
      var id=btn.dataset.id;
      var arr=getInts();
      var foundIdx=arr.findIndex(function(i){return i.id===id;});
      if(foundIdx>=0){
        arr[foundIdx].done=false;
        arr[foundIdx].abundant=false;
        arr[foundIdx].abundant_note='';
        window._cloudIntentions=arr;
        if(SUPA&&currentUser){
          try{await SUPA.from('intentions').update({done:false,abundant:false,abundant_note:''}).eq('id',id).eq('user_id',currentUser.id);}catch(e){}
        }
        renderIntentions();
      }
    });
  });

  list.querySelectorAll('.int-abundant-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      openAbundantModal(btn.dataset.id);
    });
  });

  list.querySelectorAll('.int-del-btn').forEach(function(btn){
    btn.addEventListener('click',async function(){
      if(!confirm('Eliminare questa intenzione?'))return;
      var id=btn.dataset.id;
      window._cloudIntentions=getInts().filter(function(i){return i.id!==id;});
      if(SUPA&&currentUser){
        try{await SUPA.from('intentions').delete().eq('id',id).eq('user_id',currentUser.id);}catch(e){}
      }
      renderIntentions();
    });
  });
}

/* ── Abundant Modal ── */
var abundantOverlay=document.getElementById('abundant-overlay');
var abundantPendingId=null;

function openAbundantModal(intentionId){
  abundantPendingId=intentionId;
  var inp=document.getElementById('abundant-note-input');
  if(inp)inp.value='';
  if(abundantOverlay)abundantOverlay.classList.remove('hidden');
}
function closeAbundantModal(){
  if(abundantOverlay)abundantOverlay.classList.add('hidden');
  abundantPendingId=null;
}

var abundantClose=document.getElementById('abundant-close');
var abundantCancel=document.getElementById('abundant-cancel');
var abundantSave=document.getElementById('abundant-save');
if(abundantClose)abundantClose.addEventListener('click',closeAbundantModal);
if(abundantCancel)abundantCancel.addEventListener('click',closeAbundantModal);
if(abundantOverlay)abundantOverlay.addEventListener('click',function(e){if(e.target===abundantOverlay)closeAbundantModal();});
if(abundantSave)abundantSave.addEventListener('click',async function(){
  var id=abundantPendingId;if(!id)return;
  var note=(document.getElementById('abundant-note-input')?document.getElementById('abundant-note-input').value.trim():'');
  var arr=getInts();
  var foundIdx=arr.findIndex(function(i){return i.id===id;});
  if(foundIdx>=0){
    arr[foundIdx].done=true;
    arr[foundIdx].abundant=true;
    arr[foundIdx].abundant_note=note;
    window._cloudIntentions=arr;
    if(SUPA&&currentUser){
      try{await SUPA.from('intentions').update({done:true,abundant:true,abundant_note:note}).eq('id',id).eq('user_id',currentUser.id);}catch(e){}
    }
    renderIntentions();
  }
  closeAbundantModal();
});

var intInput=document.getElementById('int-input'),intChars=document.getElementById('int-chars'),intAddBtn=document.getElementById('int-add-btn');
if(intInput&&intChars)intInput.addEventListener('input',function(){intChars.textContent=intInput.value.length;});
if(intAddBtn)intAddBtn.addEventListener('click',async function(){
  if(!currentUser){openAuth();return;}
  var text=(intInput?intInput.value:'').trim();if(!text)return;
  if(SUPA&&currentUser){
    try{
      var r=await SUPA.from('intentions').insert({user_id:currentUser.id,text:text.slice(0,500),done:false}).select().single();
      if(r.data){window._cloudIntentions=[r.data].concat(getInts());}
    }catch(e){}
  }
  if(intInput){intInput.value='';if(intChars)intChars.textContent='0';}
  renderIntentions();
});
if(intInput)intInput.addEventListener('keydown',function(e){if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)&&intAddBtn)intAddBtn.click();});
document.addEventListener('DOMContentLoaded',function(){if(currentUser)renderIntentions();});

/* ── Notes Preview (on main page) ── */
window._cloudNotes = [];

async function loadNotesPreview(){
  if(!SUPA||!currentUser)return;
  try{
    var r=await SUPA.from('notes').select('id,title,content,updated_at,created_at').eq('user_id',currentUser.id).order('updated_at',{ascending:false}).limit(6);
    window._cloudNotes=r.data||[];
  }catch(e){window._cloudNotes=[];}
}

function renderNotesPreview(){
  var section=document.getElementById('notes-preview-section');
  var list=document.getElementById('note-preview-list');
  if(!section||!list)return;
  var notes=window._cloudNotes||[];
  if(!notes.length){
    list.innerHTML='<p class="note-preview-empty">Nessun appunto ancora. Inizia a scrivere nella pagina Appunti.</p>';
    return;
  }
  list.innerHTML='';
  notes.forEach(function(note){
    var preview=(note.content||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,120);
    var dateStr='';try{dateStr=new Date(note.updated_at||note.created_at).toLocaleDateString('it-IT',{day:'numeric',month:'short'});}catch(e){}
    var card=document.createElement('div');card.className='note-preview-card';
    card.innerHTML='<div class="note-preview-header"><span class="note-preview-title">'+(note.title||'Senza titolo').replace(/</g,'&lt;')+'</span><span class="note-preview-date">'+dateStr+'</span></div><div class="note-preview-body hidden"><p class="note-preview-text">'+(preview||'\u2014').replace(/</g,'&lt;')+'</p></div><button class="note-preview-toggle" aria-expanded="false"><span class="note-preview-toggle-icon"></span></button>';
    list.appendChild(card);
    var toggleBtn=card.querySelector('.note-preview-toggle');
    var body=card.querySelector('.note-preview-body');
    toggleBtn.addEventListener('click',function(){
      var open=toggleBtn.getAttribute('aria-expanded')==='true';
      toggleBtn.setAttribute('aria-expanded',open?'false':'true');
      body.classList.toggle('hidden',open);
      card.classList.toggle('expanded',!open);
    });
  });
}

/* ── Streak (cloud only when logged in) ── */
var STREAK_KEY='amdg_streak_v2';
function getVisits(){
  if(currentUser) try{return JSON.parse(localStorage.getItem(STREAK_KEY+'_'+currentUser.id)||'[]');}catch(e){return[];}
  return [];
}
function saveVisitsLocal(a,uid){localStorage.setItem(STREAK_KEY+'_'+uid,JSON.stringify(a));}
async function loadStreakFromCloud(){
  if(!SUPA||!currentUser)return;
  try{
    var r=await SUPA.from('streak').select('visits').eq('user_id',currentUser.id).single();
    if(r.data&&r.data.visits){
      var merged=Array.from(new Set([].concat(getVisits(),r.data.visits)));
      saveVisitsLocal(merged,currentUser.id);
    }
  }catch(e){}
}
async function saveStreakToCloud(a){
  if(!SUPA||!currentUser)return;
  try{await SUPA.from('streak').upsert({user_id:currentUser.id,visits:a},{onConflict:'user_id'});}catch(e){}
}
function recordVisit(){
  if(!currentUser)return;
  var today=todayISO(),arr=getVisits();
  if(!arr.includes(today)){arr.push(today);saveVisitsLocal(arr,currentUser.id);saveStreakToCloud(arr);}
}
function renderStreak(){
  var bar=document.getElementById('streak-bar');if(!bar)return;
  if(!currentUser){bar.innerHTML='';return;}
  var arr=getVisits().sort();var today=todayISO();var total=arr.length;
  var streak=0;var cur=new Date();
  while(true){var iso=cur.toISOString().slice(0,10);if(arr.includes(iso)){streak++;cur.setDate(cur.getDate()-1);}else break;}
  var allDays=[];
  if(arr.length>0){var start=new Date(arr[0]);var end=new Date(today);var d=new Date(start);while(d<=end){allDays.push(d.toISOString().slice(0,10));d.setDate(d.getDate()+1);}}
  else allDays=[today];
  var streakTxt=streak>=2?streak+' giorni':streak===1?'Qui oggi':'';
  bar.innerHTML='<div class="streak-wrap"><div class="streak-header"><span class="streak-label">Il tuo cammino \u2014 '+total+' '+(total===1?'giornata':'giornate')+'</span>'+(streakTxt?'<span class="streak-count">'+streakTxt+'</span>':'')+' </div><div class="streak-scroll" id="ss"><div class="streak-dots" id="sd"></div></div></div>';
  var sd=bar.querySelector('#sd');
  allDays.forEach(function(iso){var dot=document.createElement('div');dot.className='streak-dot';dot.title=iso;if(iso===today)dot.classList.add('today');else if(arr.includes(iso))dot.classList.add('visited');sd.appendChild(dot);});
  var sc=bar.querySelector('#ss');if(sc)setTimeout(function(){sc.scrollLeft=sc.scrollWidth;},50);
}

/* Render on load */
document.addEventListener('DOMContentLoaded',function(){
  renderPrayers();
  updateAuthUI();
});

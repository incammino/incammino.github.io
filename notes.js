/* AMDG notes.js */
'use strict';

var html = document.documentElement;
var themeBtn = document.getElementById('theme-toggle');
html.setAttribute('data-theme', localStorage.getItem('amdg_theme')||'dark');
if(themeBtn) themeBtn.addEventListener('click', function(){
  var next=html.getAttribute('data-theme')==='dark'?'light':'dark';
  html.setAttribute('data-theme',next); localStorage.setItem('amdg_theme',next);
});

/* ── Supabase ── */
var SUPA=null, currentUser=null, allNotes=[], currentNoteId=null, currentSort='updated';

function initSupabase(){
  if(typeof SUPABASE_URL==='undefined'||!SUPABASE_URL||SUPABASE_URL.length<10) {
    console.warn('AMDG: SUPABASE_URL non configurato in config.js');
    return;
  }
  if(typeof supabase==='undefined') {
    console.error('AMDG: libreria supabase-js non caricata');
    return;
  }
  try {
    SUPA=supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'amdg_sb_auth'
      }
    });
  } catch(e) {
    console.error('AMDG: errore createClient Supabase (chiave non valida?):', e);
    return;
  }

  /* Immediately check existing session */
  SUPA.auth.getSession().then(function(res){
    currentUser=(res.data&&res.data.session)?res.data.session.user:null;
    updateAuthUI();
    if(currentUser) loadNotes();
    else showLoginPrompt();
  }).catch(function(e){ console.error('AMDG: getSession error:', e); });

  SUPA.auth.onAuthStateChange(function(event,session){
    currentUser=session?session.user:null;
    updateAuthUI();
    if(currentUser) loadNotes();
    else showLoginPrompt();
  });
}

document.addEventListener('DOMContentLoaded', initSupabase);

function toEmail(u){ return u.trim().toLowerCase()+'@amdg.app'; }

function updateAuthUI(){
  var btn=document.getElementById('auth-btn'),lbl=document.getElementById('auth-btn-label');
  if(!btn||!lbl)return;
  if(currentUser){
    btn.classList.add('logged-in');
    lbl.textContent=(currentUser.email||'').replace('@amdg.app','');
  } else {
    btn.classList.remove('logged-in');
    lbl.textContent='Accedi';
  }
}

/* ── Auth Modal ── */
var authOverlay=document.getElementById('auth-overlay'),isRegister=false;
function openAuth(){ if(authOverlay) authOverlay.classList.remove('hidden'); }
function closeAuth(){ if(authOverlay) authOverlay.classList.add('hidden'); }

var authBtn=document.getElementById('auth-btn');
var authClose=document.getElementById('auth-close');
if(authBtn) authBtn.addEventListener('click',function(){
  if(currentUser){if(confirm('Uscire dal tuo account?')){if(SUPA)SUPA.auth.signOut();}}
  else openAuth();
});
if(authClose) authClose.addEventListener('click',closeAuth);
if(authOverlay) authOverlay.addEventListener('click',function(e){if(e.target===authOverlay)closeAuth();});

var authSwitch=document.getElementById('auth-switch');
if(authSwitch) authSwitch.addEventListener('click',function(){
  isRegister=!isRegister;
  var t=document.getElementById('auth-title'),s=document.getElementById('auth-submit');
  if(t)t.textContent=isRegister?'Crea Account':'Accedi';
  if(s)s.textContent=isRegister?'Crea Account':'Accedi';
  authSwitch.innerHTML=isRegister?'Hai gi\u00e0 un account? <strong>Accedi</strong>':'Non hai un account? <strong>Crea account</strong>';
  var ae=document.getElementById('auth-error');if(ae)ae.classList.add('hidden');
});

var authForm=document.getElementById('auth-form');
if(authForm) authForm.addEventListener('submit', async function(e){
  e.preventDefault();
  if(!SUPA){showAuthErr('Configura Supabase in config.js');return;}
  var u=document.getElementById('auth-user'),p=document.getElementById('auth-password'),s=document.getElementById('auth-submit');
  var username=(u?u.value:'').trim(),pw=p?p.value:'',email=toEmail(username);
  s.disabled=true;s.textContent='...';
  try{
    var res;
    if(isRegister){
      res=await SUPA.auth.signUp({email:email,password:pw,options:{emailRedirectTo:null,data:{username:username}}});
      if(res.error)throw res.error;
      var si=await SUPA.auth.signInWithPassword({email:email,password:pw});
      if(si.error){showAuthErr('Account creato! Ora accedi.');s.disabled=false;s.textContent='Crea Account';return;}
    } else {
      res=await SUPA.auth.signInWithPassword({email:email,password:pw});
      if(res.error)throw res.error;
    }
    closeAuth();
  } catch(err){
    var m=err.message||'Errore.';
    if(m.includes('Invalid login'))m='Nome utente o password errati.';
    if(m.includes('already registered'))m='Nome utente gi\u00e0 esistente.';
    showAuthErr(m);
  }
  s.disabled=false;s.textContent=isRegister?'Crea Account':'Accedi';
});
function showAuthErr(m){var ae=document.getElementById('auth-error');if(ae){ae.textContent=m;ae.classList.remove('hidden');}}

var notesLoginBtn=document.getElementById('notes-login-btn');
if(notesLoginBtn) notesLoginBtn.addEventListener('click',openAuth);

/* ── Notes CRUD ── */
async function loadNotes(){
  if(!SUPA||!currentUser)return;
  showSidebarLoading();
  try{
    var r=await SUPA.from('notes').select('*').eq('user_id',currentUser.id).order('updated_at',{ascending:false});
    if(r.error) throw r.error;
    allNotes=r.data||[];
    renderSidebar();
    showEmptyState();
    hideLoginPrompt();
  }catch(e){
    console.error('loadNotes error:',e);
    var msg='Errore nel caricamento.';
    if(e&&e.message){
      if(e.message.includes('relation')||e.message.includes('does not exist')) msg='Tabella non trovata: esegui il SQL di setup in Supabase.';
      else if(e.message.includes('JWT')||e.message.includes('auth')) msg='Sessione scaduta. Riaccedi.';
    }
    showSidebarError(msg);
  }
}

function showLoginPrompt(){
  var lp=document.getElementById('notes-login-prompt'),sl=document.getElementById('notes-list-sidebar');
  if(lp)lp.classList.remove('hidden');
  if(sl)sl.innerHTML='';
  showEmptyState();
}
function hideLoginPrompt(){
  var lp=document.getElementById('notes-login-prompt');
  if(lp)lp.classList.add('hidden');
}
function showSidebarLoading(){
  var sl=document.getElementById('notes-list-sidebar');
  if(sl)sl.innerHTML='<p style="padding:1rem;font-size:0.82rem;color:var(--t3);font-style:italic;text-align:center;">Caricamento\u2026</p>';
}
function showSidebarError(msg){
  var sl=document.getElementById('notes-list-sidebar');
  if(sl)sl.innerHTML='<p style="padding:1rem;font-size:0.82rem;color:var(--red);font-style:italic;">'+(msg||'Errore nel caricamento.')+'</p>';
}

function renderSidebar(){
  var list=document.getElementById('notes-list-sidebar');
  if(!list)return;
  var notes=[].concat(allNotes);
  if(currentSort==='title') notes.sort(function(a,b){return(a.title||'').localeCompare(b.title||'');});
  else if(currentSort==='created') notes.sort(function(a,b){return new Date(b.created_at||0)-new Date(a.created_at||0);});
  else notes.sort(function(a,b){return new Date(b.updated_at||b.created_at||0)-new Date(a.updated_at||a.created_at||0);});

  list.innerHTML='';
  if(!notes.length){
    list.innerHTML='<p style="padding:1.25rem;font-size:0.82rem;color:var(--t3);font-style:italic;text-align:center;">Nessun appunto ancora.</p>';
    return;
  }
  notes.forEach(function(note){
    var div=document.createElement('div');
    div.className='note-sidebar-item'+(currentNoteId===note.id?' active':'');
    var preview=(note.content||'').replace(/<[^>]+>/g,' ').trim().slice(0,60);
    div.innerHTML='<p class="note-sb-title">'+(note.title||'Senza titolo').replace(/</g,'&lt;')+'</p><p class="note-sb-preview">'+(preview||'\u2014').replace(/</g,'&lt;')+'</p>';
    div.addEventListener('click',function(){openNote(note.id);});
    list.appendChild(div);
  });
}

document.querySelectorAll('.sort-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    currentSort=btn.dataset.sort;
    document.querySelectorAll('.sort-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    renderSidebar();
  });
});

function showEmptyState(){
  var es=document.getElementById('notes-empty-state'),ed=document.getElementById('notes-editor');
  if(es)es.classList.remove('hidden');
  if(ed)ed.classList.add('hidden');
  currentNoteId=null;
}

function openNote(id){
  var note=allNotes.find(function(n){return n.id===id;});
  if(!note)return;
  currentNoteId=id;
  var es=document.getElementById('notes-empty-state'),ed=document.getElementById('notes-editor');
  if(es)es.classList.add('hidden');
  if(ed)ed.classList.remove('hidden');
  var ti=document.getElementById('notes-title-input'),ce=document.getElementById('notes-content-editor');
  if(ti)ti.value=note.title||'';
  if(ce)ce.innerHTML=note.content||'';
  updateEditorMeta(note.updated_at||note.created_at);
  renderSidebar();
  if(ce)ce.focus();
}

function updateEditorMeta(ts){
  var meta=document.getElementById('notes-editor-meta');
  if(!meta)return;
  if(!ts){meta.textContent='';return;}
  try{
    var d=new Date(ts);
    meta.textContent=d.toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }catch(e){meta.textContent='';}
}

/* ── New note ── */
var newNoteBtn=document.getElementById('new-note-btn');
var emptyNewBtn=document.getElementById('notes-empty-new');
function createNewNote(){
  if(!currentUser){openAuth();return;}
  var es=document.getElementById('notes-empty-state'),ed=document.getElementById('notes-editor');
  if(es)es.classList.add('hidden');
  if(ed)ed.classList.remove('hidden');
  currentNoteId=null;
  var ti=document.getElementById('notes-title-input'),ce=document.getElementById('notes-content-editor');
  if(ti){ti.value='';ti.focus();}
  if(ce)ce.innerHTML='';
  var meta=document.getElementById('notes-editor-meta');if(meta)meta.textContent='Nuovo appunto';
  renderSidebar();
}
if(newNoteBtn) newNoteBtn.addEventListener('click',createNewNote);
if(emptyNewBtn) emptyNewBtn.addEventListener('click',createNewNote);

/* ── Toolbar ── */
document.querySelectorAll('.toolbar-btn').forEach(function(btn){
  btn.addEventListener('mousedown',function(e){
    e.preventDefault(); /* Keep focus in editor */
    var cmd=btn.dataset.cmd;
    if(cmd==='highlight') document.execCommand('hiliteColor',false,'rgba(232,168,32,0.35)');
    else document.execCommand(cmd,false,null);
  });
});

/* ── Save ── */
var saveBtn=document.getElementById('notes-save-btn');
var saveStatus=document.getElementById('notes-save-status');
var isSaving=false;

async function saveCurrentNote(){
  if(!currentUser){openAuth();return;}
  if(!SUPA){
    if(saveStatus){saveStatus.textContent='Sincronizzazione non disponibile.';setTimeout(function(){saveStatus.textContent='';},3000);}
    return;
  }
  if(isSaving)return;
  var ti=document.getElementById('notes-title-input'),ce=document.getElementById('notes-content-editor');
  if(!ti||!ce)return;
  var title=ti.value.trim()||'Senza titolo';
  var content=ce.innerHTML||'';
  var now=new Date().toISOString();

  isSaving=true;
  if(saveStatus){saveStatus.textContent='Salvataggio\u2026';}

  try{
    if(currentNoteId){
      /* Update existing */
      var upd=await SUPA.from('notes')
        .update({title:title, content:content, updated_at:now})
        .eq('id',currentNoteId)
        .eq('user_id',currentUser.id)
        .select()
        .single();
      if(upd.error) throw upd.error;
      var idx=allNotes.findIndex(function(n){return n.id===currentNoteId;});
      if(idx>=0){allNotes[idx].title=title;allNotes[idx].content=content;allNotes[idx].updated_at=now;}
    } else {
      /* Insert new */
      var ins=await SUPA.from('notes')
        .insert({user_id:currentUser.id, title:title, content:content})
        .select()
        .single();
      if(ins.error) throw ins.error;
      if(ins.data){
        allNotes.unshift(ins.data);
        currentNoteId=ins.data.id;
        updateEditorMeta(ins.data.updated_at||ins.data.created_at);
      }
    }
    renderSidebar();
    if(saveStatus){
      saveStatus.textContent='Salvato \u2713';
      setTimeout(function(){saveStatus.textContent='';},2500);
    }
    updateEditorMeta(now);
  } catch(err){
    console.error('Save error:', err);
    var msg='Errore nel salvataggio.';
    if(err&&err.message){
      if(err.message.includes('relation') || err.message.includes('does not exist')) msg='Tabella non trovata: esegui il SQL di setup in Supabase.';
      else if(err.message.includes('JWT') || err.message.includes('auth')) msg='Sessione scaduta. Riaccedi.';
      else if(err.message.includes('permission') || err.message.includes('policy')) msg='Permesso negato. Controlla le policy RLS in Supabase.';
      else msg='Errore: '+err.message;
    }
    if(saveStatus) saveStatus.textContent=msg;
  }
  isSaving=false;
}

if(saveBtn) saveBtn.addEventListener('click',saveCurrentNote);

/* Ctrl+S */
document.addEventListener('keydown',function(e){
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();saveCurrentNote();}
});

/* Auto-save after typing pauses */
var autoSaveTimer=null;
var contentEditor=document.getElementById('notes-content-editor');
var titleInput=document.getElementById('notes-title-input');
function scheduleAutoSave(){
  if(!currentNoteId&&!(titleInput&&titleInput.value.trim()))return; /* Don't auto-save if new and empty */
  clearTimeout(autoSaveTimer);
  autoSaveTimer=setTimeout(function(){
    if(currentUser) saveCurrentNote();
  },3000);
}
if(contentEditor)contentEditor.addEventListener('input',scheduleAutoSave);
if(titleInput)titleInput.addEventListener('input',scheduleAutoSave);

/* ── Delete ── */
var deleteBtn=document.getElementById('notes-delete-btn');
if(deleteBtn) deleteBtn.addEventListener('click',async function(){
  if(!currentNoteId||!SUPA||!currentUser) return;
  if(!confirm('Eliminare questo appunto definitivamente?')) return;
  try{
    var del=await SUPA.from('notes').delete().eq('id',currentNoteId).eq('user_id',currentUser.id);
    if(del.error) throw del.error;
    allNotes=allNotes.filter(function(n){return n.id!==currentNoteId;});
    showEmptyState();
    renderSidebar();
  }catch(e){alert('Errore nell\'eliminazione.');}
});

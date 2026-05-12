// ── AUTH ──────────────────────────────────────────────────────
function _authShow(which){
  ['login','register','forgot'].forEach(t=>{
    const el=document.getElementById('auth-'+t+'-form'); if(el) el.style.display=t===which?'block':'none';
  });
  const split=document.getElementById('auth-split');
  const title=document.getElementById('as-title');
  const sub=document.getElementById('as-sub');
  const sw=document.getElementById('as-switch');
  if(which==='register'){
    split?.classList.add('swap');
    if(title)title.textContent='Willkommen!';
    if(sub)sub.textContent='Schon ein Konto?';
    if(sw)sw.textContent='Anmelden';
  } else {
    split?.classList.remove('swap');
    if(title)title.textContent='Willkommen zurück';
    if(sub)sub.textContent='Noch kein Konto?';
    if(sw)sw.textContent='Registrieren';
  }
  const msg=document.getElementById('auth-msg'); if(msg){msg.textContent='';msg.classList.remove('err');}
}
function switchAuthTab(tab){ _authShow(tab==='magic'?'login':tab); }
function authSwitchMode(){
  const reg=document.getElementById('auth-register-form');
  _authShow(reg && reg.style.display!=='none' ? 'login':'register');
}
function authShowForgot(){ _authShow('forgot'); }
function authShowLogin(){ _authShow('login'); }
function authMsg(m,ok){const el=document.getElementById('auth-msg');if(!el)return;el.textContent=m;el.classList.toggle('err',!ok);}

// Password show/hide + hands-over-eyes
function authTogglePw(id,btn){
  const inp=document.getElementById(id); if(!inp)return;
  const showing=inp.type==='text';
  inp.type=showing?'password':'text';
  _authHands(!showing);
  if(btn){
    btn.innerHTML = showing
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.77 19.77 0 0 1 4.22-5.36"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-3.17 4.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  }
}
function _authHands(up){
  const h=document.getElementById('av-hands'); if(!h)return;
  h.classList.toggle('hidden', !up);
}

// Eye tracking — pupils follow cursor
let _authEyeBound=false;
function _authBindEyes(){
  if(_authEyeBound) return;
  const stage=document.getElementById('av-stage'); if(!stage) return;
  _authEyeBound=true;
  const pl=document.getElementById('av-pupil-l');
  const pr=document.getElementById('av-pupil-r');
  const eyes=[{el:pl,cx:96,cy:132},{el:pr,cx:144,cy:132}];
  const MAX=4.5;
  function move(e){
    const r=stage.getBoundingClientRect();
    if(!r.width) return;
    const sx=r.width/240, sy=r.height/300;
    const mx=(e.clientX-r.left)/sx, my=(e.clientY-r.top)/sy;
    eyes.forEach(eye=>{
      const dx=mx-eye.cx, dy=my-eye.cy;
      const d=Math.hypot(dx,dy)||1;
      const tx=(dx/d)*Math.min(MAX,d/10);
      const ty=(dy/d)*Math.min(MAX,d/10);
      if(eye.el) eye.el.style.transform=`translate(${tx}px,${ty}px)`;
    });
  }
  window.addEventListener('mousemove',move,{passive:true});
  window.addEventListener('touchmove',ev=>{if(ev.touches&&ev.touches[0])move(ev.touches[0]);},{passive:true});
}
const _origOpenModal_auth=window.openModal;
window.openModal=function(id){
  if(typeof _origOpenModal_auth==='function') _origOpenModal_auth(id);
  if(id==='auth-modal'){ _authShow('login'); _authHands(false); requestAnimationFrame(_authBindEyes); }
};

async function doLogin(){
  const email=document.getElementById('login-email')?.value.trim();
  const pw=document.getElementById('login-pw')?.value;
  if(!email||!pw){authMsg('Bitte alle Felder ausfüllen');return;}
  authMsg('Anmelden...');
  try{
    const{data,error}=await sb.auth.signInWithPassword({email,password:pw});
    if(error)throw error;
    await hydrateSession(data.session);
    closeModal('auth-modal'); toast('✓ Willkommen zurück!');
  }catch(e){authMsg('Fehler: '+e.message);}
}
async function doRegister(){
  const username=document.getElementById('reg-username')?.value.trim();
  const email=document.getElementById('reg-email')?.value.trim();
  const pw=document.getElementById('reg-pw')?.value;
  const pw2=document.getElementById('reg-pw2')?.value;
  if(!username||!email||!pw){authMsg('Bitte alle Felder ausfüllen');return;}
  if(pw.length<6){authMsg('Passwort mind. 6 Zeichen');return;}
  if(pw2!==undefined && pw2!==pw){authMsg('Passwörter stimmen nicht überein');return;}
  authMsg('Registrieren...',true);
  try{
    const{data,error}=await sb.auth.signUp({email,password:pw,options:{data:{username},emailRedirectTo:window.location.origin}});
    if(error)throw error;
    authMsg('✓ Konto erstellt! Bitte E-Mail bestätigen.',true);
  }catch(e){authMsg('Fehler: '+e.message);}
}
async function doMagicLink(){
  const email=document.getElementById('magic-email')?.value.trim();
  if(!email){authMsg('E-Mail eingeben');return;}
  try{await sb.auth.signInWithOtp({email});authMsg('✓ Magic Link gesendet!',true);}catch(e){authMsg('Fehler: '+e.message);}
}
async function doForgotPw(){
  const email=document.getElementById('forgot-email')?.value.trim();
  if(!email){authMsg('E-Mail eingeben');return;}
  try{await sb.auth.resetPasswordForEmail(email,{redirectTo:location.href});authMsg('✓ Reset-Link gesendet!',true);}catch(e){authMsg('Fehler: '+e.message);}
}
async function doLogout(){
  await flushLocalSync({force:true});
  await sb.auth.signOut();
  currentUser=null;
  updateUserUi(null);
  loadState();
  toast('Abgemeldet');
}
function updateUserUi(user){
  const loggedIn=!!user;
  document.getElementById('um-name').textContent=user?.username||'Gast';
  document.getElementById('um-email').textContent=user?.email||'';
  document.getElementById('um-logout').style.display=loggedIn?'flex':'none';
  document.querySelector('[onclick="closeUserMenu();openModal(\'auth-modal\')"]').style.display=loggedIn?'none':'flex';
  const avHtml = getUserAvatar(user, 32);
  document.getElementById('avatar-btn').innerHTML=avHtml;
  updateCurrencyDisplay();
  updateNavIcons();
}
async function hydrateSession(session){
  if(session?.user){
    const uid=session.user.id;
    const{data:prof}=await sb.from('profiles').select('*').eq('id',uid).maybeSingle();

    const serverXp = prof?.xp_data && typeof prof.xp_data==='object' ? prof.xp_data : {};
    const localXp = lsGet('kivo_xp','{}');
    const mergedXp = mergeMaxMap(localXp, serverXp);
    lsSet('kivo_xp', mergedXp);

    const serverCoins = parseInt(prof?.currency||0)||0;
    const localCoins = parseInt(lsGet('kivo_currency','0'))||0;
    const mergedCoins = Math.max(serverCoins, localCoins);
    lsSet('kivo_currency', mergedCoins);
    userCurrency = mergedCoins;

    const serverItems = Array.isArray(prof?.items) ? prof.items : [];
    const localItems = lsGet('kivo_items','[]');
    const mergedItems = mergeUniqueList(localItems, serverItems);
    lsSet('kivo_items', mergedItems);
    userItems = mergedItems;

    const serverPass = (prof?.pass_data && typeof prof.pass_data==='object') ? prof.pass_data : {};
    const localPass = lsGet('kivo_pass','{}');
    const mergedPass = mergePassState(serverPass, localPass);
    lsSet('kivo_pass', mergedPass);

    const mergedUsername = lsGet('kivo_username','""') || prof?.username || session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
    lsSet('kivo_username', mergedUsername);

    const serverThemeMode = window.KivoTheme?.normalizeMode?.(prof?.chat_data?.settings?.theme_mode || 'system') || 'system';
    const rawLocalThemeMode = lsGet('kivo_theme_mode','"system"');
    const localThemeMode = window.KivoTheme?.normalizeMode?.(rawLocalThemeMode || 'system') || 'system';
    const mergedThemeMode = localThemeMode || serverThemeMode || 'system';
    window.KivoTheme?.setThemeMode?.(mergedThemeMode, {persist:true});

    const mergedAvatarData = lsGet('kivo_avatar_data','null') || prof?.avatar_data || null;
    if(mergedAvatarData) lsSet('kivo_avatar_data', mergedAvatarData);
    const mergedAvatarUrl = getScopedString('kivo_avatar_url','') || prof?.avatar_url || '';
    if(mergedAvatarUrl) lsSet('kivo_avatar_url', mergedAvatarUrl);

    currentUser={id:uid,email:session.user.email,username:mergedUsername,is_dev:!!prof?.is_dev,avatar_data:mergedAvatarData||null,avatar_url:mergedAvatarUrl||null,theme_mode:mergedThemeMode};
    if(prof?.is_dev){document.getElementById('rb-coding')?.style.setProperty('display','flex');}

    const{data:poolRows}=await sb.from('pools').select('*').eq('user_id',uid);
    const customFromServer={};
    (poolRows||[]).forEach(row=>{if(row.lang&&row.name&&row.data){if(!customFromServer[row.lang])customFromServer[row.lang]={};customFromServer[row.lang][row.name]=row.data;}});
    const localCustom = lsGet('kivo_custom','{}') || {};
    const mergedCustom = JSON.parse(JSON.stringify(customFromServer));
    for(const [lang,pools] of Object.entries(localCustom)){
      if(!mergedCustom[lang]) mergedCustom[lang]={};
      for(const [name,obj] of Object.entries(pools||{})) mergedCustom[lang][name]=obj;
    }
    lsSet('kivo_custom', mergedCustom);
    if(JSON.stringify(mergedCustom)!==JSON.stringify(customFromServer)) syncPools();

    const{data:progRows}=await sb.from('progress').select('*').eq('user_id',uid);
    const mergedProgress={};
    (progRows||[]).forEach(row=>{ if(row.pool_key) mergedProgress[row.pool_key]=Array.isArray(row.known_ids)?row.known_ids:[]; });
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key||!key.startsWith('kivo_kn_')) continue;
      const raw=localStorage.getItem(key);
      if(raw===null) continue;
      const val=safeJsonParse(raw, null);
      if(val===null) continue;
      const poolKey=key.slice('kivo_kn_'.length);
      mergedProgress[poolKey]=_mergeUnique(mergedProgress[poolKey]||[], val);
    }
    Object.entries(mergedProgress).forEach(([poolKey,ids])=>lsSet('kivo_kn_'+poolKey,ids));
    if(JSON.stringify(mergedProgress)!==JSON.stringify(Object.fromEntries((progRows||[]).map(r=>[r.pool_key,Array.isArray(r.known_ids)?r.known_ids:[]])))) syncProgress();

    const{data:chatProf}=await sb.from('profiles').select('chat_data').eq('id',uid).maybeSingle();
    const localChats = lsGet(AI_CHAT_STORAGE_KEY,'{}') || {};
    const serverChats = chatProf?.chat_data && typeof chatProf.chat_data==='object' ? chatProf.chat_data : {};
    const mergedChats = _mergeChatPayload(serverChats, localChats);
    const mergedChatData = {
      ...serverChats,
      ...mergedChats,
      settings: {
        ...(serverChats?.settings && typeof serverChats.settings === 'object' ? serverChats.settings : {}),
        theme_mode: mergedThemeMode,
      },
    };
    lsSet(AI_CHAT_STORAGE_KEY, mergedChatData);
    lsSet(AI_CHAT_ACTIVE_KEY, mergedChats.activeId || '');
    if(JSON.stringify(mergedChatData)!==JSON.stringify(serverChats)) syncChats();

    const profileChanged =
      mergedCoins !== serverCoins ||
      JSON.stringify(mergedItems) !== JSON.stringify(serverItems) ||
      JSON.stringify(mergedPass) !== JSON.stringify(serverPass) ||
      JSON.stringify(mergedXp) !== JSON.stringify(serverXp) ||
      mergedUsername !== (prof?.username || session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User') ||
      mergedAvatarUrl !== (prof?.avatar_url || '') ||
      JSON.stringify(mergedAvatarData || null) !== JSON.stringify(prof?.avatar_data || null) ||
      mergedThemeMode !== serverThemeMode;
    if(profileChanged) syncProfile();

    loadState();
    updateUserUi(currentUser);
    checkPendingFriendReqs();
  } else {
    currentUser=null;
    const fallbackMode = window.KivoTheme?.normalizeMode?.(lsGet('kivo_theme_mode','"system"') || 'system') || 'system';
    window.KivoTheme?.setThemeMode?.(fallbackMode, {persist:true});
    updateUserUi(null);
    loadState();
  }
}

async function initAuth(){
  const{data:{session}}=await sb.auth.getSession();
  await hydrateSession(session);
  sb.auth.onAuthStateChange((event,session)=>{setTimeout(()=>hydrateSession(session),0);});
}

async function checkPendingFriendReqs(){
  if(!currentUser)return;
  try{const{data}=await sb.from('friendships').select('id').eq('friend_id',currentUser.id).eq('status','pending');document.getElementById('friend-notif').classList.toggle('show',(data||[]).length>0);}catch(e){}
}




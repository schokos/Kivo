// ── PROFILE SYNC (currency / items / pass_data) ───────────────
let _profileSyncTimer = null;
let _profileSyncPending = false;
async function _doProfileSync(){
  if(!currentUser) return;
  _profileSyncPending = false;
  try {
    const passRaw = lsGet('kivo_pass','{}');
    const itemsArr = lsGet('kivo_items','[]');
    await sb.from('profiles').update({
      currency: parseInt(userCurrency)||0,
      items: itemsArr,
      pass_data: passRaw||{},
      release_seen_tag: currentUser.release_seen_tag || null,
      updated_at: new Date().toISOString(),
    }).eq('id', currentUser.id);
  } catch(e){ /* offline-tolerant */ }
}
function syncProfile(){
  if(!currentUser) return;
  _profileSyncPending = true;
  if(_profileSyncTimer) clearTimeout(_profileSyncTimer);
  _profileSyncTimer = setTimeout(_doProfileSync, 600);
}
window.addEventListener('beforeunload', ()=>{ if(_profileSyncPending) _doProfileSync(); });
const LOCAL_SYNC_DEBOUNCE_MS = 1200;
function safeJsonParse(raw, fallback) {
  try {
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
const _localSyncDirty = { profile:false, pools:false, progress:false, chats:false };
let _localSyncTimer = null;
let _localSyncInFlight = null;

function _markLocalDirty(kind){
  if(!currentUser) return;
  _localSyncDirty[kind] = true;
  if(_localSyncTimer) clearTimeout(_localSyncTimer);
  _localSyncTimer = setTimeout(()=>{ void flushLocalSync(); }, LOCAL_SYNC_DEBOUNCE_MS);
}

function _clearLocalDirty(kind){ _localSyncDirty[kind] = false; }
function _hasLocalDirty(){ return Object.values(_localSyncDirty).some(Boolean); }

function _mergeUnique(a,b){
  return Array.from(new Set([...(Array.isArray(a)?a:[]), ...(Array.isArray(b)?b:[])]));
}

function mergeMaxMap(localMap = {}, serverMap = {}) {
  const merged = { ...(serverMap || {}) };
  for (const [k, v] of Object.entries(localMap || {})) {
    const localVal = Number(v || 0);
    const serverVal = Number(merged[k] || 0);
    merged[k] = Math.max(serverVal, localVal);
  }
  return merged;
}

function mergeUniqueList(primary = [], secondary = []) {
  return _mergeUnique(primary, secondary);
}

function mergePassState(serverPass = {}, localPass = {}) {
  const serverClaimed = serverPass?.claimed || {};
  const localClaimed = localPass?.claimed || {};
  return {
    ...serverPass,
    ...localPass,
    claimed: {
      free: _mergeUnique(localClaimed.free, serverClaimed.free),
      pro: _mergeUnique(localClaimed.pro, serverClaimed.pro),
    },
    proOwned: !!(serverPass?.proOwned || localPass?.proOwned),
  };
}

function _mergeChatPayload(serverPayload={}, localPayload={}) {
  const serverSessions = serverPayload.sessions && typeof serverPayload.sessions === 'object' ? serverPayload.sessions : {};
  const localSessions = localPayload.sessions && typeof localPayload.sessions === 'object' ? localPayload.sessions : {};
  const mergedSessions = {};
  const ids = new Set([...Object.keys(serverSessions), ...Object.keys(localSessions)]);
  for (const id of ids) {
    const s = serverSessions[id];
    const l = localSessions[id];
    if (!s) mergedSessions[id] = l;
    else if (!l) mergedSessions[id] = s;
    else {
      const st = Number(s.updatedAt || s.createdAt || 0);
      const lt = Number(l.updatedAt || l.createdAt || 0);
      mergedSessions[id] = lt >= st ? l : s;
    }
  }
  const mergedOrder = [];
  const addOrder = order => { for (const id of (Array.isArray(order)?order:[])) if (mergedSessions[id] && !mergedOrder.includes(id)) mergedOrder.push(id); };
  addOrder(localPayload.order);
  addOrder(serverPayload.order);
  for (const id of Object.keys(mergedSessions)) if (!mergedOrder.includes(id)) mergedOrder.push(id);
  const activeId = localPayload.activeId && mergedSessions[localPayload.activeId]
    ? localPayload.activeId
    : (serverPayload.activeId && mergedSessions[serverPayload.activeId] ? serverPayload.activeId : (mergedOrder[0] || null));
  return { activeId, order: mergedOrder, sessions: mergedSessions };
}

async function _syncProfileToServer(){
  if(!currentUser) return false;
  try{
    const xpData = lsGet('kivo_xp','{}') || {};
    const currency = parseInt(lsGet('kivo_currency','0')) || 0;
    const items = lsGet('kivo_items','[]') || [];
    const passData = lsGet('kivo_pass','{}') || {};
    const avatarUrl = getScopedString('kivo_avatar_url', '') || currentUser.avatar_url || '';
    const avatarData = currentUser.avatar_data || null;
    const username = currentUser.username || '';
    const releaseSeenTag = currentUser.release_seen_tag || null;
    const themeMode = window.KivoTheme?.normalizeMode?.(lsGet('kivo_theme_mode','"system"') || currentUser.theme_mode || 'system') || 'system';
    const { data:profileRow, error:profileErr } = await sb.from('profiles').select('chat_data').eq('id', currentUser.id).maybeSingle();
    if(profileErr) throw profileErr;
    const baseChatData = profileRow?.chat_data && typeof profileRow.chat_data === 'object' ? profileRow.chat_data : {};
    const chatDataWithTheme = {
      ...baseChatData,
      settings: {
        ...(baseChatData.settings && typeof baseChatData.settings === 'object' ? baseChatData.settings : {}),
        theme_mode: themeMode,
      },
    };
    const payload = {
      username,
      avatar_url: avatarUrl || null,
      avatar_data: avatarData,
      xp_data: xpData,
      xp_total: Object.values(xpData).reduce((a,b)=>a+Number(b||0),0),
      streak: calcStreak(),
      currency,
      items: Array.isArray(items)?items:[],
      pass_data: passData,
      release_seen_tag: releaseSeenTag,
      chat_data: chatDataWithTheme,
      updated_at: new Date().toISOString(),
    };
    const { error } = await sb.from('profiles').update(payload).eq('id', currentUser.id);
    if(error) throw error;
    currentUser.avatar_data = avatarData || currentUser.avatar_data || null;
    currentUser.avatar_url = avatarUrl || currentUser.avatar_url || null;
    currentUser.theme_mode = themeMode;
    return true;
  }catch(e){
    console.warn('[SYNC] profile failed', e);
    return false;
  }
}

async function _syncPoolsToServer(){
  if(!currentUser) return false;
  try{
    const custom = lsGet('kivo_custom','{}') || {};
    const wanted = new Set();
    for(const [lang,pools] of Object.entries(custom)){
      for(const [name,data] of Object.entries(pools||{})){
        if(BUILTIN[lang]?.[name]) continue;
        const id = currentUser.id+'_'+esc(mkKey(lang,name));
        wanted.add(id);
        const { error } = await sb.from('pools').upsert({id,user_id:currentUser.id,lang,name,data,updated_at:new Date().toISOString()});
        if(error) throw error;
      }
    }
    const { data:rows, error } = await sb.from('pools').select('id').eq('user_id',currentUser.id);
    if(error) throw error;
    for(const row of rows||[]){
      if(!wanted.has(row.id)){
        const { error:delErr } = await sb.from('pools').delete().eq('id',row.id);
        if(delErr) throw delErr;
      }
    }
    return true;
  }catch(e){
    console.warn('[SYNC] pools failed', e);
    return false;
  }
}

async function _syncProgressToServer(){
  if(!currentUser) return false;
  try{
    const prefix = 'kivo_kn_';
    const wanted = new Set();
    const rowsToSave = [];
    for(let i=0;i<localStorage.length;i++){
      const key = localStorage.key(i);
      if(!key || !key.startsWith(prefix)) continue;
      const raw = localStorage.getItem(key);
      if(raw===null) continue;
      const val = safeJsonParse(raw, null);
      if(val===null) continue;
      const poolKey = key.slice(prefix.length);
      wanted.add(poolKey);
      rowsToSave.push({user_id:currentUser.id,pool_key:poolKey,known_ids:Array.isArray(val)?val:[],updated_at:new Date().toISOString()});
    }
    for(const row of rowsToSave){
      const { error } = await sb.from('progress').upsert(row);
      if(error) throw error;
    }
    const { data:rows, error } = await sb.from('progress').select('pool_key').eq('user_id',currentUser.id);
    if(error) throw error;
    for(const row of rows||[]){
      if(!wanted.has(row.pool_key)){
        const { error:delErr } = await sb.from('progress').delete().eq('user_id',currentUser.id).eq('pool_key',row.pool_key);
        if(delErr) throw delErr;
      }
    }
    return true;
  }catch(e){
    console.warn('[SYNC] progress failed', e);
    return false;
  }
}

async function _syncChatsToServer(){
  if(!currentUser) return false;
  try{
    const localPayload = lsGet(AI_CHAT_STORAGE_KEY,'{}') || {};
    const { data:prof, error } = await sb.from('profiles').select('chat_data').eq('id',currentUser.id).maybeSingle();
    if(error) throw error;
    const serverPayload = prof?.chat_data && typeof prof.chat_data==='object' ? prof.chat_data : {};
    const merged = _mergeChatPayload(serverPayload, localPayload);
    const themeMode = window.KivoTheme?.normalizeMode?.(lsGet('kivo_theme_mode','"system"') || currentUser.theme_mode || serverPayload?.settings?.theme_mode || 'system') || 'system';
    const nextChatData = {
      ...serverPayload,
      ...merged,
      settings: {
        ...(serverPayload?.settings && typeof serverPayload.settings === 'object' ? serverPayload.settings : {}),
        theme_mode: themeMode,
      },
    };
    const { error:updErr } = await sb.from('profiles').update({chat_data:nextChatData, updated_at:new Date().toISOString()}).eq('id',currentUser.id);
    if(updErr) throw updErr;
    lsSet(AI_CHAT_STORAGE_KEY, nextChatData);
    lsSet(AI_CHAT_ACTIVE_KEY, nextChatData.activeId || '');
    return true;
  }catch(e){
    console.warn('[SYNC] chats failed', e);
    return false;
  }
}

async function flushLocalSync({force=false}={}){
  if(!currentUser) return;
  if(_localSyncInFlight) return _localSyncInFlight;
  if(!force && !_hasLocalDirty()) return;
  if(_localSyncTimer){ clearTimeout(_localSyncTimer); _localSyncTimer=null; }
  const run = (async()=>{
    if(force || _localSyncDirty.profile){ if(await _syncProfileToServer()) _clearLocalDirty('profile'); }
    if(force || _localSyncDirty.pools){ if(await _syncPoolsToServer()) _clearLocalDirty('pools'); }
    if(force || _localSyncDirty.progress){ if(await _syncProgressToServer()) _clearLocalDirty('progress'); }
    if(force || _localSyncDirty.chats){ if(await _syncChatsToServer()) _clearLocalDirty('chats'); }
  })();
  _localSyncInFlight = run;
  try{ await run; } finally {
    _localSyncInFlight = null;
    if(!force && _hasLocalDirty()){
      if(_localSyncTimer) clearTimeout(_localSyncTimer);
      _localSyncTimer = setTimeout(()=>{ void flushLocalSync(); }, LOCAL_SYNC_DEBOUNCE_MS);
    }
  }
}

function syncProfile(){ _markLocalDirty('profile'); }
function syncPools(){ _markLocalDirty('pools'); }
function syncPoolToServer(){ _markLocalDirty('pools'); }
function syncProgress(){ _markLocalDirty('progress'); }
function syncChats(){ _markLocalDirty('chats'); }
window.addEventListener('pagehide', ()=>{ void flushLocalSync({force:true}); });
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') void flushLocalSync({force:true}); });
const mkKey = (l,p) => l+'|||'+p;
const spKey = k => { const x=String(k||'').split('|||'); return {l:x[0]||'',p:x[1]||''}; };
const esc = s => s.replace(/[^a-z0-9]/gi,'_');
const shuf = arr => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };

function getPoolObj(key) { if(!key) return null; const {l,p}=spKey(key); return POOLS[l]?.[p]||null; }
function getKnownIds(key) { return lsGet('kivo_kn_'+key,'[]'); }
function flattenPool(poolObj) {
  if(!poolObj) return [];
  if(Array.isArray(poolObj)) return poolObj.map((v,i)=>({...v,id:i}));
  const pairs=[];
  for(const [cat,ps] of Object.entries(poolObj.subcats||{}))
    for(const p of ps) pairs.push({de:p[0],en:p[1],cat});
  return pairs;
}

function loadState() {
  const custom = currentUser ? lsGet('kivo_custom','{}') : {};
  POOLS = JSON.parse(JSON.stringify(BUILTIN));
  for(const [l,ps] of Object.entries(custom)) {
    if(!POOLS[l]) POOLS[l]={};
    for(const [p,obj] of Object.entries(ps)) POOLS[l][p]=obj;
  }
  mistakeLog = lsGet('kivo_ml','{}');
  sessions = lsGet('kivo_sess','[]');
  const saved = lsGet('kivo_ak','""');
  if(saved && getPoolObj(saved)) activeKey=saved;
  else { const l=Object.keys(POOLS)[0]; activeKey=l?mkKey(l,Object.keys(POOLS[l])[0]):null; }
  buildVocab();
}

function buildVocab() {
  const pool=getPoolObj(activeKey); if(!pool) return;
  const knIds=getKnownIds(activeKey);
  const flat=flattenPool(pool);
  vocab=flat.map((v,i)=>({...v,id:i,known:knIds.includes(i)}));
  updateHomeStats();
  const {l,p}=spKey(activeKey);
  document.getElementById('home-pool-name').textContent=p;
}

function saveKnown() { lsSet('kivo_kn_'+activeKey,vocab.filter(v=>v.known).map(v=>v.id)); syncProgress(); }
function saveCustom() {
  const custom={};
  for(const [l,ps] of Object.entries(POOLS))
    for(const [p,obj] of Object.entries(ps))
      if(!BUILTIN[l]?.[p]){if(!custom[l])custom[l]={};custom[l][p]=obj;}
  lsSet('kivo_custom',custom); syncPools();
}
function setActivePool(key) {
  activeKey=key; lsSet('kivo_ak',key); buildVocab();
}


// No longer doing health checks// ── XP SYSTEM ────────────────────────────────────────────────
// Münzen kommen NUR durch (a) abgeschlossene Quests und (b) Level-Ups (+10 pro Stufe).
// XP selbst geben keine Münzen mehr.
function _xpToLevel(xp){ return Math.max(1, Math.floor((xp||0)/500)+1); }
async function addXp(pts, reason='learn') {
  const prevLevel = _xpToLevel(getTotalXp());
  // Quest-Tracking (außer wenn die XP selbst aus einer Quest stammen, sonst Endlos-Loop)
  if(reason!=='quest'){
    const s=getQuestState(); s.daily.xp=(s.daily.xp||0)+pts; s.weekly.xp=(s.weekly.xp||0)+pts; saveQuestState(s);
  }
  const today=new Date().toISOString().slice(0,10);
  const xp=lsGet('kivo_xp','{}');
  xp[today]=(xp[today]||0)+pts; lsSet('kivo_xp',xp);
  _handleLevelUp(prevLevel, _xpToLevel(getTotalXp()));
  updateCurrencyDisplay();
  calcStreak(); updateHomeStats();
  syncProfile();
  if(reason!=='quest') trackQuest('xp',pts);
}
function _handleLevelUp(prev, now){
  if(now<=prev) return;
  const gained = now-prev;
  const reward = gained * levelUpReward();
  userCurrency = (parseInt(lsGet('kivo_currency','0'))||0) + reward;
  lsSet('kivo_currency', userCurrency);
  syncProfile();
  toast(`${ic('star',14)} Level ${now}! +${reward} Münzen`);
  // Pass-Items neu anzeigen
  if(document.getElementById('screen-pass')?.classList.contains('active')) renderPass();
}
function getTotalXp() { return Object.values(lsGet('kivo_xp','{}')).reduce((a,b)=>a+b,0); }
function calcStreak() {
  const xp=lsGet('kivo_xp','{}'); const today=new Date(); let s=0;
  for(let i=0;i<365;i++) { const d=new Date(today); d.setDate(d.getDate()-i); const k=d.toISOString().slice(0,10); if(xp[k]&&xp[k]>0)s++; else if(i>0)break; }
  lsSet('kivo_streak',s); return s;
}
function updateCurrencyDisplay() {
  const el=document.getElementById('currency-pill');
  const val=document.getElementById('currency-val');
  if(el) el.style.display=currentUser?'flex':'none';
  if(val) val.textContent=userCurrency;
}
async function syncXpToServer() { return flushLocalSync(); }




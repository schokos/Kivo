// â”€â”€ CONFIG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Shared bootstrap modules are loaded before app.js from index.html.
const { SUPABASE_URL, SUPABASE_ANON_KEY, sb, edgeHeaders } = window.KivoSupabase;

// â”€â”€ POOLS (empty â€” custom pools loaded from server after login) â”€â”€
const BUILTIN = {};

// â”€â”€ STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let POOLS = {};
let activeKey = null;
let vocab = [];
let mistakeLog = {};
let sessions = [];
let currentUser = null;
let fpFriendIds = [];
let fpTab = 'board';
let gapVocab = [];
let confirmCb = null;
let cIdx = 0, cDeck = [], cFlipped = false;
let qIdx = 0, qDeck = [], qOk = 0, qNo = 0;
let tIdx = 0, tDeck = [], tOk = 0, tNo = 0;
let mPairs = [], mSel = null, mFound = 0;
let toastTimer = null;
let userCurrency = 0;
let userItems = [];
let equippedItems = [];
let selectedCourseLang = null;

// â”€â”€ ICON LIBRARY (Lucide-style inline SVGs) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Ersetzt alle Emojis durch konsistente Stroke-Icons.
const ICONS = {
  coin:    '<circle cx="12" cy="12" r="9"/><path d="M12 6v12M9 9h4.5a2 2 0 0 1 0 4H9.5a2 2 0 0 0 0 4H15"/>',
  flame:   '<path d="M12 2c1 4 5 5 5 10a5 5 0 1 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-6 1-9z"/>',
  target:  '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  zap:     '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  trophy:  '<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M5 4H3v3a3 3 0 0 0 3 3M19 4h2v3a3 3 0 0 1-3 3"/>',
  book:    '<path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  cards:   '<rect x="3" y="6" width="13" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  check:   '<polyline points="20 6 9 17 4 12"/>',
  cross:   '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  medal:   '<circle cx="12" cy="14" r="6"/><path d="M8 14l-2-8 6 4 6-4-2 8"/>',
  lock:    '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock:  '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7-2.5"/>',
  star:    '<polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2"/>',
  crown:   '<path d="M3 18h18l-2-10-4 4-3-7-3 7-4-4-2 10z"/>',
  gift:    '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  sparkles:'<path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/>',
  users:   '<circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9.5" r="2.4"/><path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M15 19c0-2.3 1.6-4 3.5-4s2.5 1.3 2.5 3"/>',
  rocket:  '<path d="M5 19l-2 2M9 15l-3 3M14 4s5 0 6 6c-6 1-6 6-6 6L8 10s5 0 6-6z"/><path d="M14 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>',
  pen:     '<path d="M12 19l7-7 3 3-7 7H12v-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18"/>',
  shield:  '<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/>',
  party:   '<path d="M3 21l4-12 9 9-13 3z"/><path d="M14 3l1 2M19 4l-1 2M21 9l-2 1M16 12l2 2"/>',
  fire:    '<path d="M12 2c1 4 5 5 5 10a5 5 0 1 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 1-6 1-9z"/>',
};
// Render Lucide-Style SVG. Inline fÃ¼r use-anywhere im innerHTML.
function ic(name, size=14, extra=''){
  const p=ICONS[name]||ICONS.star;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;${extra}">${p}</svg>`;
}
// Pass-Helfer
function levelUpReward(){ return 10; }

// â”€â”€ STORAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const { lsGet, lsSet, getScopedString } = window.KivoStorage;


// â”€â”€ SCREEN ROUTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SCREEN_TITLES = { home:'Dashboard', courses:'Kurse', challenges:'Challenges', community:'Community', cards:'Karteikarten', quiz:'Quiz', typing:'Tippen', matching:'Zuordnen', overview:'Pool-Verwaltung', stats:'Statistiken', gap:'KI-LÃ¼ckentext', aibot:'KI-Assistent', profile:'Profil', shop:'Belohnungen', pass:'Lern-Pass' };

function goTo(name, opts={}) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.rail-btn[data-s]').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.bn-item[data-s]').forEach(b=>b.classList.remove('active'));
  document.getElementById('screen-'+name)?.classList.add('active');
  document.getElementById('rb-'+name)?.classList.add('active');
  document.querySelector(`.bn-item[data-s="${name}"]`)?.classList.add('active');
  document.getElementById('tb-title').textContent = SCREEN_TITLES[name]||name.toUpperCase();
  closeUserMenu();
  if(name==='cards')    initCards();
  else if(name==='quiz')    startQuiz();
  else if(name==='typing')  startTyping();
  else if(name==='matching') startMatch();
  else if(name==='courses')  renderCourses();
  else if(name==='challenges') renderChallenges();
  else if(name==='community') renderCommunity();
  else if(name==='overview') renderOverview();
  else if(name==='stats')   renderStats();
  else if(name==='gap')     generateGapText();
  else if(name==='aibot')   renderAiBot();
  else if(name==='profile'&&!opts.keepProfileContent) renderProfile();
  else if(name==='shop')    renderShop();
  else if(name==='pass')    renderPass();
  else if(name==='home')    updateHomeStats();
}

// â”€â”€ TOAST & CONFIRM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toast(msg) {
  const wrap=document.getElementById('toast-wrap');
  const el=document.createElement('div'); el.className='k-toast'; el.textContent=msg;
  wrap.appendChild(el); setTimeout(()=>el.remove(),2800);
}
function confirm2(title, msg) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirm-overlay');
    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent = msg;

    overlay.classList.add('open');

    const close = (result) => {
      overlay.classList.remove('open');

      okBtn.onclick = null;
      if (cancelBtn) cancelBtn.onclick = null;

      resolve(result);
    };

    okBtn.onclick = () => close(true);

    if (cancelBtn) {
      cancelBtn.onclick = () => close(false);
    }

    // optional: Klick auf Hintergrund = cancel
    overlay.onclick = (e) => {
      if (e.target === overlay) close(false);
    };
  });
}

function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// â”€â”€ USER MENU â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toggleUserMenu() {
  document.getElementById('user-menu').classList.toggle('open');
}
function closeUserMenu() { document.getElementById('user-menu').classList.remove('open'); }
document.addEventListener('click', e => {
  if(!e.target.closest('#avatar-btn') && !e.target.closest('#dash-avatar-btn') && !e.target.closest('#user-menu')) closeUserMenu();
});


// â”€â”€ SHARE URL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function checkShareUrl(){
  const params=new URLSearchParams(location.search);
  const shareKey=params.get('share');
  if(!shareKey)return;
  const{l,p}=spKey(decodeURIComponent(shareKey));
  if(POOLS[l]?.[p]){setActivePool(decodeURIComponent(shareKey));toast('Pool "'+p+'" aktiviert!');}
}

// â”€â”€ PWA MANIFEST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function(){
  const manifest={name:'Kivo',short_name:'Kivo',description:'Kivo Lernplattform',start_url:'.',display:'standalone',background_color:'#1E1E1E',theme_color:'#1E1E1E',icons:[{src:'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="32" fill="#1E1E1E"/><circle cx="96" cy="88" r="44" fill="#6AC28A"/><text x="96" y="104" font-size="44" text-anchor="middle" fill="#1E1E1E" font-family="sans-serif" font-weight="900">K</text></svg>'),sizes:'192x192',type:'image/svg+xml'}]};
  const link=document.createElement('link');link.rel='manifest';link.href=URL.createObjectURL(new Blob([JSON.stringify(manifest)],{type:'application/json'}));document.head.appendChild(link);
})();


window.addEventListener('DOMContentLoaded', () => {
  userCurrency = parseInt(lsGet('kivo_currency','0'))||0;
  loadState();
  initAuth();
  checkShareUrl();
  updateNavIcons();
  initAiChatPersistence();
});

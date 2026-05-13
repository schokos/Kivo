// Shop rotiert taeglich um 10 Uhr. Vor 10 Uhr zaehlt der Vortag.
function getShopDayKey(){
  const now=new Date();
  const cutoff=new Date(now.getFullYear(),now.getMonth(),now.getDate(),10,0,0);
  const d=now<cutoff?new Date(now.getTime()-24*60*60*1000):now;
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function getNextShopRotation(){
  const now=new Date();
  const next=new Date(now.getFullYear(),now.getMonth(),now.getDate(),10,0,0);
  if(now>=next) next.setDate(next.getDate()+1);
  return next;
}
// deterministische Pseudo-Zufallsfunktion (Mulberry32) basierend auf einem Seed
function _seededShuffle(arr, seedStr){
  let h=2166136261; for(const c of seedStr)h=Math.imul(h^c.charCodeAt(0),16777619);
  let s=h>>>0;
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){
    s=(s+0x6D2B79F5)>>>0;
    let t=Math.imul(s^(s>>>15),1|s);
    t=(t+Math.imul(t^(t>>>7),61|t))^t;
    const r=((t^(t>>>14))>>>0)/4294967296;
    const j=Math.floor(r*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function getDailyShopItems(count=6){
  return _seededShuffle(SHOP_ITEMS,getShopDayKey()).slice(0,count);
}


// ── SHOP ──────────────────────────────────────────────────────
const CAT_LABEL = {hair:'Frisur',glasses:'Brille',hat:'Kopfbedeckung',beard:'Bart',outfit:'Outfit',bg:'Hintergrund'};

let shopCountdownInterval = null;

function _fmtRotationCountdown() {
  const target = getNextShopRotation();
  const now = new Date();

  const diff = target - now;

  if (diff <= 0) return '00m 00s';

  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];

  if (days > 0) parts.push(days + 'd');

  if (hours > 0 || days > 0) {
    parts.push(String(hours).padStart(2, '0') + 'h');
  }

  parts.push(String(minutes).padStart(2, '0') + 'm');
  parts.push(String(seconds).padStart(2, '0') + 's');

  return parts.join(' ');
}

function startShopCountdown() {

  // Vorheriges Interval sauber stoppen
  if (shopCountdownInterval) {
    clearInterval(shopCountdownInterval);
  }

  const countdownEl = document.getElementById('shop-rotation-countdown');

  if (!countdownEl) return;

  function updateCountdown() {

    const remaining = getNextShopRotation() - new Date();

    countdownEl.textContent = _fmtRotationCountdown();

    // Wenn Rotation erreicht wurde
    if (remaining <= 0) {

      clearInterval(shopCountdownInterval);

      // Shop neu laden
      renderShop();
    }
  }

  updateCountdown();

  shopCountdownInterval = setInterval(updateCountdown, 1000);
}

function renderShop() {
  const el=document.getElementById('shop-content'); if(!el)return;

  if(!currentUser){
    el.innerHTML=`<div class="k-card" style="text-align:center;padding:42px"><div style="color:var(--lime);margin-bottom:12px">${ic('lock',42)}</div><div style="font-size:14px;font-weight:800;margin-bottom:8px">Anmeldung erforderlich</div><button class="btn btn-lime" onclick="openModal('auth-modal')">Anmelden</button></div>`;
    return;
  }

  userCurrency=parseInt(lsGet('kivo_currency','0'))||0;
  userItems=lsGet('kivo_items','[]');
  const dailyItems = getDailyShopItems(6);
  el.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
      <div style="font-size:10px;color:var(--muted)">Münzen verdienst du durch Quests &amp; Level-Ups.</div>
      ${currentUser?`<button class="btn btn-sm btn-lime" style="margin-left:auto;display:inline-flex;align-items:center;gap:6px" onclick="openAvatarBuilder()">${ic('pen',13)} Avatar gestalten</button>`:''}
    </div>
    <div class="k-card-sm" style="margin-bottom:14px;background:var(--lime-d2);border-color:color-mix(in srgb,#6AC28A 35%,transparent)">
      <div style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:var(--lime)">
        ${ic('calendar',16)} Tages-Angebot
      </div>
      <div style="font-size:10px;color:var(--muted);margin-top:4px">
        Der Shop rotiert in
        <span id="shop-rotation-countdown"></span>
        und zeigt dann neue Items.
      </div>
    </div>
    <div class="k-section-title">Heutige Items</div>
    <div class="shop-grid">${dailyItems.map(it=>{
      const owned=userItems.includes(it.id);
      return `<div class="shop-item ${owned?'owned':''}" onclick="${owned?'':`buyItem('${it.id}')`}">
        <div class="shop-item-icon" style="color:var(--lime)">${ic('sparkles',28)}</div>
        <div class="shop-item-name">${it.name}</div>
        <div style="font-size:9px;color:var(--muted);margin-bottom:4px">${CAT_LABEL[it.cat]||''}</div>
        <div style="font-size:9px;color:var(--muted);margin-bottom:6px">${it.desc}</div>
        ${owned?`<div class="tag lime" style="display:inline-flex;align-items:center;gap:4px">${ic('check',11)} Im Besitz</div>`:`<div class="shop-item-price" style="display:inline-flex;align-items:center;gap:4px">${ic('coin',12)} ${it.price}</div>`}
      </div>`;
    }).join('')}</div>
    <div style="margin-top:18px;padding:12px;background:var(--panel-2);border:1px solid var(--line);border-radius:var(--r);font-size:11px;color:var(--muted);text-align:center;display:flex;align-items:center;justify-content:center;gap:6px">
      ${ic('sparkles',13)} Gekaufte Items findest du im <strong style="color:var(--text)">Avatar-Builder</strong> als neue Optionen.
    </div>`;
  startShopCountdown();
}

async function buyItem(id) {
  if(!currentUser){toast('Bitte zuerst anmelden');return;}
  const it=SHOP_ITEMS.find(i=>i.id===id); if(!it)return;
  if(userItems.includes(id)){toast('Bereits im Besitz');return;}
  if(userCurrency<it.price){toast('Nicht genug Münzen! ('+it.price+' benötigt)');return;}
  const ok = await confirm2(
    'Item kaufen?',
    it.name+' für '+it.price+' Münzen kaufen?'
  );

  if(ok){
    userCurrency -= it.price;
    lsSet('kivo_currency', userCurrency);

    userItems.push(id);
    lsSet('kivo_items', userItems);
    syncProfile();

    toast(it.name+' gekauft! Verfügbar im Avatar-Builder.');

    renderShop();
    updateCurrencyDisplay();
  }
}



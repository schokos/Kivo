// ── PASS SYSTEM ──────────────────────────────────────────────
// Free Pass: alle 5 Level 1 Item, festgelegt.
// Pro Pass: jedes Level 1 Item. Kostet einmalig 1000 Münzen.
// Belohnungen werden manuell beansprucht.
const PASS_MAX_LEVEL = 50;
const PASS_PRO_PRICE = 1000;

// Deterministische Auswahl der Belohnungs-Items pro Level
function _passItemFor(level, track){
  // unterschiedlicher Pool je Track, deterministisch sortiert
  const ordered = [...SHOP_ITEMS].sort((a,b)=>a.id.localeCompare(b.id));
  const offset = track==='pro' ? 7 : 3;
  return ordered[(level*offset + (track==='pro'?1:0)) % ordered.length];
}
function passLevels(){
  const arr=[];
  for(let lvl=2; lvl<=PASS_MAX_LEVEL; lvl++){
    const free = (lvl%5===0) ? _passItemFor(lvl,'free') : null;
    const pro  = _passItemFor(lvl,'pro');
    arr.push({lvl, free, pro});
  }
  return arr;
}
function getPassState(){
  const raw=lsGet('kivo_pass','{}');
  if(!raw.claimed) raw.claimed={free:[],pro:[]};
  if(typeof raw.proOwned!=='boolean') raw.proOwned=false;
  return raw;
}
function savePassState(s){ lsSet('kivo_pass',s); syncProfile(); }
async function buyProPass(){
  const s=getPassState();
  if(s.proOwned){toast('Pro Pass ist bereits aktiv');return;}
  if(userCurrency<PASS_PRO_PRICE){toast('Nicht genug Münzen ('+PASS_PRO_PRICE+' nötig)');return;}
    const ok = await confirm2(
      'Pro Pass kaufen?',
      'Pro Pass für '+PASS_PRO_PRICE+' Münzen freischalten? Du erhältst dann auf jedem Level eine Belohnung.'
    );

    if(ok){
      userCurrency -= PASS_PRO_PRICE;
      lsSet('kivo_currency', userCurrency); syncProfile();

      s.proOwned = true;
      savePassState(s);

      toast('Pro Pass aktiviert!');
      renderPass();
      updateCurrencyDisplay();
    }
}
function claimPass(track, lvl){
  const s=getPassState();
  const userLvl=_xpToLevel(getTotalXp());
  if(lvl>userLvl){toast('Erst Level '+lvl+' erreichen');return;}
  if(track==='pro' && !s.proOwned){toast('Pro Pass erforderlich');return;}
  const claimed=s.claimed[track]||[];
  if(claimed.includes(lvl)){toast('Bereits beansprucht');return;}
  const reward = track==='free' ? _passItemFor(lvl,'free') : _passItemFor(lvl,'pro');
  if(!reward) return;
  // Item gewähren (auch wenn schon im Inventar - dann +50 Münzen statt Duplikat)
  userItems = lsGet('kivo_items','[]');
  if(userItems.includes(reward.id)){
    userCurrency += 50; lsSet('kivo_currency',userCurrency);
    toast(reward.name+' bereits besessen — +50 Münzen!');
  } else {
    userItems.push(reward.id);
    lsSet('kivo_items',userItems);
    toast(reward.name+' freigeschaltet!');
  }
  syncProfile();
  claimed.push(lvl); s.claimed[track]=claimed; savePassState(s);
  renderPass(); updateCurrencyDisplay();
}

function renderPass(){
  const el=document.getElementById('pass-content'); if(!el) return;
  if(!currentUser){
    el.innerHTML=`<div class="k-card" style="text-align:center;padding:42px"><div style="color:var(--lime);margin-bottom:12px">${ic('lock',42)}</div><div style="font-size:14px;font-weight:800;margin-bottom:8px">Anmeldung erforderlich</div><button class="btn btn-lime" onclick="openModal('auth-modal')">Anmelden</button></div>`;
    return;
  }
  const xp=getTotalXp(); const lvl=_xpToLevel(xp);
  const s=getPassState();
  const levels=passLevels();
  const nextXp=lvl*500; const lvlStart=(lvl-1)*500;
  const lvlPct=Math.round((xp-lvlStart)/(nextXp-lvlStart)*100);
  const userOwnedItems=lsGet('kivo_items','[]');

  const headerHtml=`
    <div class="k-card" style="margin-bottom:12px;background:linear-gradient(135deg,var(--lime-d2),var(--panel))">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--muted)">Level ${lvl} · ${xp.toLocaleString()} / ${nextXp.toLocaleString()} XP</div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="currency-pill" style="display:inline-flex;align-items:center;gap:6px">${ic('coin',13)} ${userCurrency}</div>
          ${s.proOwned
            ? `<span class="tag lime" style="display:inline-flex;align-items:center;gap:4px">${ic('crown',11)} Pro aktiv</span>`
            : `<button class="btn btn-sm btn-lime" style="display:inline-flex;align-items:center;gap:6px" onclick="buyProPass()">${ic('crown',12)} Pro Pass · ${PASS_PRO_PRICE} ${ic('coin',11)}</button>`}
        </div>
      </div>
      <div class="daily-goal-bar" style="margin-top:8px"><div class="daily-goal-fill" style="width:${Math.max(4,lvlPct)}%"></div></div>
    </div>
    <div style="font-size:11px;color:var(--muted);margin-bottom:10px;display:flex;align-items:center;gap:6px">${ic('sparkles',12)} Free Pass: alle 5 Level eine Belohnung. Pro Pass: jedes Level eine extra Belohnung.</div>
  `;

  const rowHtml=levels.map(({lvl:L,free,pro})=>{
    const reached = L<=lvl;
    const renderTier=(item,track)=>{
      if(!item) return `<div class="pass-tier empty"><span style="opacity:.3">—</span></div>`;
      const claimed = (s.claimed[track]||[]).includes(L);
      const owned = userOwnedItems.includes(item.id);
      const locked = !reached || (track==='pro' && !s.proOwned);
      const cls = claimed?'claimed':(reached?(track==='pro'&&!s.proOwned?'locked':'ready'):'locked');
      return `<div class="pass-tier ${cls}" ${!locked&&!claimed?`onclick="claimPass('${track}',${L})"`:''} title="${item.name}">
        <div class="pass-tier-ico" style="color:${claimed?'var(--lime)':'var(--text)'}">${ic(track==='pro'?'crown':'gift',20)}</div>
        <div class="pass-tier-name">${item.name}</div>
        <div class="pass-tier-status">
          ${claimed?`<span class="tag lime" style="display:inline-flex;align-items:center;gap:3px">${ic('check',10)} Erhalten</span>`
            : locked?`<span class="tag" style="display:inline-flex;align-items:center;gap:3px">${ic('lock',10)} ${track==='pro'&&!s.proOwned?'Pro':'Lvl '+L}</span>`
            : `<span class="tag orange" style="display:inline-flex;align-items:center;gap:3px">${ic('gift',10)} Claim</span>`}
          ${owned&&!claimed?`<span class="tag" style="margin-left:4px;font-size:8px">+50 ${ic('coin',9)}</span>`:''}
        </div>
      </div>`;
    };
    return `<div class="pass-row ${reached?'reached':''}">
      <div class="pass-lvl">${L}</div>
      <div class="pass-tracks">
        ${renderTier(free,'free')}
        ${renderTier(pro,'pro')}
      </div>
    </div>`;
  }).join('');

  el.innerHTML = headerHtml + `<div class="pass-track-head"><div></div><div style="display:flex;gap:10px;font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.5px"><div style="flex:1;text-align:center">Free</div><div style="flex:1;text-align:center;color:${s.proOwned?'var(--lime)':'var(--muted)'}">Pro</div></div></div><div class="pass-list">${rowHtml}</div>`;
}



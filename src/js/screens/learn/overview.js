// ── OVERVIEW ──────────────────────────────────────────────────
function renderOverview() {
  const el=document.getElementById('overview-content'); if(!el)return;
  let html='';
  for(const [lang,pools] of Object.entries(POOLS)) {
    html+=`<div class="k-section-title" style="margin-top:10px">${lang}</div>`;
    for(const [pname,poolObj] of Object.entries(pools)) {
      const key=mkKey(lang,pname);
      const flat=flattenPool(poolObj);
      const kn=getKnownIds(key).length;
      const pct=flat.length?Math.round(kn/flat.length*100):0;
      const due=srDueCount(key);
      const isActive=key===activeKey;
      html+=`<div class="pool-row ${isActive?'active-pool':''}" onclick="setActivePool('${key}');renderOverview();buildVocab()">
        <div style="flex:1">
          <div class="pool-row-name">${pname} ${isActive?'<span class="tag lime" style="margin-left:4px">Aktiv</span>':''}</div>
          <div class="pool-row-sub">${flat.length} Vokabeln · ${pct}% gekonnt ${due>0?`<span class="sr-badge">${due} fällig</span>`:''}</div>
        </div>
        <div class="pool-mini-bar"><div class="pool-mini-fill" style="width:${pct}%"></div></div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          ${!BUILTIN[lang]?.[pname]?`<button class="btn btn-sm btn-blue" onclick="event.stopPropagation();openEditPoolModal('${key}')" title="Bearbeiten">✎</button>`:''}
          <button class="btn btn-sm" onclick="event.stopPropagation();sharePool('${key}')" title="Teilen">🔗</button>
          ${!BUILTIN[lang]?.[pname]?`<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deletePool('${key}')" title="Löschen">✕</button>`:''}
        </div>
      </div>`;
    }
  }
  el.innerHTML=html;
}

function openNewPoolModal(presetLang='', presetName='') {
  document.getElementById('npm-title').textContent='Neuer Pool';
  document.getElementById('new-pool-content').innerHTML=`
    <div class="k-group"><label class="k-label">Kurs- / Pool-Name</label><input class="k-input" id="np-name" value="${String(presetName || '').replace(/"/g,'&quot;')}" placeholder="z.B. Spanisch Alltag"></div>
    <div class="k-group"><label class="k-label">Sprache / Fach</label><input class="k-input" id="np-lang" value="${String(presetLang || 'Englisch').replace(/"/g,'&quot;')}" placeholder="Englisch / Spanisch / ..."></div>
    <div class="k-group"><label class="k-label">Vokabeln (ein Paar pro Zeile: Deutsch = Englisch)</label><textarea class="k-input" id="np-pairs" rows="8" placeholder="Hund = Dog&#10;Katze = Cat&#10;Haus = House"></textarea></div>
    <button class="btn btn-lime" style="width:100%" onclick="saveNewPool()">Kurs erstellen</button>`;
  openModal('new-pool-modal');
}

function openEditPoolModal(key) {
  const {l,p}=spKey(key); const pool=getPoolObj(key); if(!pool)return;
  const pairs=flattenPool(pool).map(v=>`${v.de} = ${v.en}`).join('\n');
  document.getElementById('npm-title').textContent='Pool bearbeiten';
  document.getElementById('new-pool-content').innerHTML=`
    <div class="k-group"><label class="k-label">Kurs- / Pool-Name</label><input class="k-input" id="np-name" value="${p.replace(/"/g,'&quot;')}"></div>
    <div class="k-group"><label class="k-label">Sprache</label><input class="k-input" id="np-lang" value="${l.replace(/"/g,'&quot;')}"></div>
    <div class="k-group"><label class="k-label">Vokabeln (ein Paar pro Zeile: Deutsch = Englisch)</label><textarea class="k-input" id="np-pairs" rows="10">${pairs}</textarea></div>
    <button class="btn btn-lime" style="width:100%" onclick="saveEditedPool('${key}')">Änderungen speichern</button>`;
  openModal('new-pool-modal');
}

function saveNewPool() {
  const name=(document.getElementById('np-name')?.value||'').trim();
  const lang=(document.getElementById('np-lang')?.value||'Englisch').trim();
  const raw=(document.getElementById('np-pairs')?.value||'');
  if(!name){toast('Bitte Pool-Name eingeben');return;}
  const pairs=raw.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const[de,...en]=l.split('=');return[de.trim(),en.join('=').trim()];}).filter(([d,e])=>d&&e);
  if(!pairs.length){toast('Keine gültigen Vokabeln');return;}
  if(!POOLS[lang])POOLS[lang]={};
  POOLS[lang][name]={subcats:{[name]:pairs}};
  saveCustom();
  if(currentUser) syncPoolToServer(lang,name);
  closeModal('new-pool-modal'); renderOverview(); setActivePool(mkKey(lang,name));
  if(document.getElementById('screen-courses')?.classList.contains('active')) renderCourses();
  toast('✓ Pool "'+name+'" erstellt!');
}

async function saveEditedPool(oldKey) {
  const old=spKey(oldKey);
  const name=(document.getElementById('np-name')?.value||'').trim();
  const lang=(document.getElementById('np-lang')?.value||'Englisch').trim();
  const raw=(document.getElementById('np-pairs')?.value||'');
  if(!name){toast('Bitte Pool-Name eingeben');return;}
  const pairs=raw.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const[de,...en]=l.split('=');return[de.trim(),en.join('=').trim()];}).filter(([d,e])=>d&&e);
  if(!pairs.length){toast('Keine gültigen Vokabeln');return;}
  if(!POOLS[lang])POOLS[lang]={};
  if((old.l!==lang||old.p!==name)&&POOLS[old.l]?.[old.p]){delete POOLS[old.l][old.p];if(!Object.keys(POOLS[old.l]).length)delete POOLS[old.l];}
  POOLS[lang][name]={subcats:{[name]:pairs}}; saveCustom(); await syncPoolToServer(lang,name);
  activeKey=mkKey(lang,name); lsSet('kivo_ak',activeKey); closeModal('new-pool-modal'); loadState(); renderOverview(); if(document.getElementById('screen-courses')?.classList.contains('active')) renderCourses(); toast('✓ Pool gespeichert');
}

async function syncPoolToServer(lang,name) {
  if(!currentUser)return;
  syncPools();
}

async function deletePool(key) {
  const ok = await confirm2(
    'Pool löschen?',
    'Alle Fortschritte für diesen Pool werden entfernt.'
  );

  if(ok){
    const {l,p}=spKey(key);
    delete POOLS[l][p]; if(!Object.keys(POOLS[l]).length)delete POOLS[l];
    saveCustom(); if(activeKey===key){const lk=Object.keys(POOLS)[0];activeKey=lk?mkKey(lk,Object.keys(POOLS[lk])[0]):null;}
    buildVocab(); renderOverview(); if(document.getElementById('screen-courses')?.classList.contains('active')) renderCourses(); toast('Pool gelöscht');
  }
}

function sharePool(key) {
  const {l,p}=spKey(key);
  const url=location.origin+location.pathname+'?share='+encodeURIComponent(key)+'&u='+(currentUser?.id||'');
  navigator.clipboard?.writeText(url).then(()=>toast('🔗 Link kopiert!')).catch(()=>toast(url));
}


// ── PHOTO IMPORT (temporarily disabled) ──────────────────────
function handlePhotoFile(){ toast('Foto-Import ist vorübergehend deaktiviert.'); }
function handlePhotoDrop(){ toast('Foto-Import ist vorübergehend deaktiviert.'); }
async function doPhotoScan(){ toast('Foto-Import ist vorübergehend deaktiviert.'); }




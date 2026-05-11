// â”€â”€ OVERVIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          <div class="pool-row-sub">${flat.length} Vokabeln Â· ${pct}% gekonnt ${due>0?`<span class="sr-badge">${due} fÃ¤llig</span>`:''}</div>
        </div>
        <div class="pool-mini-bar"><div class="pool-mini-fill" style="width:${pct}%"></div></div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          ${!BUILTIN[lang]?.[pname]?`<button class="btn btn-sm btn-blue" onclick="event.stopPropagation();openEditPoolModal('${key}')" title="Bearbeiten">âœŽ</button>`:''}
          <button class="btn btn-sm" onclick="event.stopPropagation();sharePool('${key}')" title="Teilen">ðŸ”—</button>
          ${!BUILTIN[lang]?.[pname]?`<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deletePool('${key}')" title="LÃ¶schen">âœ•</button>`:''}
        </div>
      </div>`;
    }
  }
  el.innerHTML=html;
}

function openNewPoolModal() {
  document.getElementById('npm-title').textContent='Neuer Pool';
  document.getElementById('new-pool-content').innerHTML=`
    <div class="k-group"><label class="k-label">Pool-Name</label><input class="k-input" id="np-name" placeholder="z.B. Spanisch Alltag"></div>
    <div class="k-group"><label class="k-label">Sprache</label><input class="k-input" id="np-lang" value="Englisch" placeholder="Englisch / Spanisch / ..."></div>
    <div class="k-group"><label class="k-label">Vokabeln (ein Paar pro Zeile: Deutsch = Englisch)</label><textarea class="k-input" id="np-pairs" rows="8" placeholder="Hund = Dog&#10;Katze = Cat&#10;Haus = House"></textarea></div>
    <button class="btn btn-lime" style="width:100%" onclick="saveNewPool()">Pool erstellen</button>`;
  openModal('new-pool-modal');
}

function openEditPoolModal(key) {
  const {l,p}=spKey(key); const pool=getPoolObj(key); if(!pool)return;
  const pairs=flattenPool(pool).map(v=>`${v.de} = ${v.en}`).join('\n');
  document.getElementById('npm-title').textContent='Pool bearbeiten';
  document.getElementById('new-pool-content').innerHTML=`
    <div class="k-group"><label class="k-label">Pool-Name</label><input class="k-input" id="np-name" value="${p.replace(/"/g,'&quot;')}"></div>
    <div class="k-group"><label class="k-label">Sprache</label><input class="k-input" id="np-lang" value="${l.replace(/"/g,'&quot;')}"></div>
    <div class="k-group"><label class="k-label">Vokabeln (ein Paar pro Zeile: Deutsch = Englisch)</label><textarea class="k-input" id="np-pairs" rows="10">${pairs}</textarea></div>
    <button class="btn btn-lime" style="width:100%" onclick="saveEditedPool('${key}')">Ã„nderungen speichern</button>`;
  openModal('new-pool-modal');
}

function saveNewPool() {
  const name=(document.getElementById('np-name')?.value||'').trim();
  const lang=(document.getElementById('np-lang')?.value||'Englisch').trim();
  const raw=(document.getElementById('np-pairs')?.value||'');
  if(!name){toast('Bitte Pool-Name eingeben');return;}
  const pairs=raw.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const[de,...en]=l.split('=');return[de.trim(),en.join('=').trim()];}).filter(([d,e])=>d&&e);
  if(!pairs.length){toast('Keine gÃ¼ltigen Vokabeln');return;}
  if(!POOLS[lang])POOLS[lang]={};
  POOLS[lang][name]={subcats:{[name]:pairs}};
  saveCustom();
  if(currentUser) syncPoolToServer(lang,name);
  closeModal('new-pool-modal'); renderOverview(); setActivePool(mkKey(lang,name));
  toast('âœ“ Pool "'+name+'" erstellt!');
}

async function saveEditedPool(oldKey) {
  const old=spKey(oldKey);
  const name=(document.getElementById('np-name')?.value||'').trim();
  const lang=(document.getElementById('np-lang')?.value||'Englisch').trim();
  const raw=(document.getElementById('np-pairs')?.value||'');
  if(!name){toast('Bitte Pool-Name eingeben');return;}
  const pairs=raw.split('\n').map(l=>l.trim()).filter(Boolean).map(l=>{const[de,...en]=l.split('=');return[de.trim(),en.join('=').trim()];}).filter(([d,e])=>d&&e);
  if(!pairs.length){toast('Keine gÃ¼ltigen Vokabeln');return;}
  if(!POOLS[lang])POOLS[lang]={};
  if((old.l!==lang||old.p!==name)&&POOLS[old.l]?.[old.p]){delete POOLS[old.l][old.p];if(!Object.keys(POOLS[old.l]).length)delete POOLS[old.l];}
  POOLS[lang][name]={subcats:{[name]:pairs}}; saveCustom(); await syncPoolToServer(lang,name);
  activeKey=mkKey(lang,name); lsSet('kivo_ak',activeKey); closeModal('new-pool-modal'); loadState(); renderOverview(); toast('âœ“ Pool gespeichert');
}

async function syncPoolToServer(lang,name) {
  if(!currentUser)return;
  syncPools();
}

async function deletePool(key) {
  const ok = await confirm2(
    'Pool lÃ¶schen?',
    'Alle Fortschritte fÃ¼r diesen Pool werden entfernt.'
  );

  if(ok){
    const {l,p}=spKey(key);
    delete POOLS[l][p]; if(!Object.keys(POOLS[l]).length)delete POOLS[l];
    saveCustom(); if(activeKey===key){const lk=Object.keys(POOLS)[0];activeKey=lk?mkKey(lk,Object.keys(POOLS[lk])[0]):null;}
    buildVocab(); renderOverview(); toast('Pool gelÃ¶scht');
  }
}

function sharePool(key) {
  const {l,p}=spKey(key);
  const url=location.origin+location.pathname+'?share='+encodeURIComponent(key)+'&u='+(currentUser?.id||'');
  navigator.clipboard?.writeText(url).then(()=>toast('ðŸ”— Link kopiert!')).catch(()=>toast(url));
}


// â”€â”€ PHOTO IMPORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let photoBase64='', photoMime='';
function handlePhotoFile(inp){
  const file=inp.files[0]; if(!file)return;
  photoMime=file.type||'image/jpeg';
  const reader=new FileReader();
  reader.onload=e=>{
    const result = e.target?.result;
    if(!result || typeof result !== 'string'){
      toast('Bild konnte nicht geladen werden');
      return;
    }
    photoBase64=result.split(',')[1]||'';
    const prev=document.getElementById('photo-preview');
    prev.src=result; prev.style.display='block';
  };
  reader.readAsDataURL(file);
}

function handlePhotoDrop(e){
  e.preventDefault(); document.getElementById('drop-zone').classList.remove('drag-over');
  const file=e.dataTransfer.files[0]; if(!file)return;
  const inp=document.getElementById('photo-file-inp'); const dt=new DataTransfer(); dt.items.add(file); inp.files=dt.files; handlePhotoFile(inp);
}

async function doPhotoScan(){
  if(!photoBase64){toast('Bitte zuerst ein Bild hochladen');return;}
  const poolName=(document.getElementById('photo-pool-name')?.value||'Foto-Import').trim();
  const btn=document.getElementById('photo-scan-btn'); btn.disabled=true; btn.textContent='Scannt...';
  const status=document.getElementById('photo-status');
  status.textContent='KI analysiert Bild...'; status.style.color='var(--muted)';
  try{
    let pairs=[];
    const r=await fetch(SUPABASE_URL+'/functions/v1/scan-vocab',{method:'POST',headers:await edgeHeaders(),body:JSON.stringify({image:photoBase64,mime:photoMime})});
    if(!r.ok)throw new Error('Foto-Scan Backend nicht erreichbar');
    const d=await r.json(); pairs=d.pairs||[];
    if(!pairs.length){status.textContent='âš  Keine Vokabeln erkannt';btn.disabled=false;btn.textContent='ðŸ” KI scannen';return;}
    const lang='Foto-Import';
    if(!POOLS[lang])POOLS[lang]={};
    POOLS[lang][poolName]={subcats:{[poolName]:pairs}};
    saveCustom(); if(currentUser)syncPoolToServer(lang,poolName);
    loadState(); setActivePool(mkKey(lang,poolName));
    status.textContent=`âœ“ ${pairs.length} Vokabelpaare erkannt!`; status.style.color='var(--lime)';
    closeModal('photo-modal'); toast('âœ“ Pool "'+poolName+'" mit '+pairs.length+' Paaren erstellt!');
  }catch(e){status.textContent='âš  Fehler: '+e.message; status.style.color='var(--danger)';}
  btn.disabled=false; btn.textContent='ðŸ” KI scannen';
}


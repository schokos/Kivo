// -- PROFILE ---------------------------------------------------
// =================== AVATAR-ITEMS / SHOP ===================
// Items werden auf den Avatar angewendet. Jedes Item hat eine Kategorie und einen "value"
// der dann im Avatar-State (z.B. hair, glasses, hat, beard, outfit, bg) gesetzt wird.
const SHOP_ITEMS = [
  // FRISUREN (zusaetzlich zu den Standard-Frisuren)
  {id:'hair_long',  cat:'hair',    value:'long',    icon:'??',  name:'Lange Haare',     price:40, desc:'Schulterlange Haare'},
  {id:'hair_curly', cat:'hair',    value:'curly',   icon:'??',  name:'Locken',          price:45, desc:'Lockige Mähne'},
  {id:'hair_buzz',  cat:'hair',    value:'buzz',    icon:'??',  name:'Buzzcut',         price:25, desc:'Sehr kurzer Schnitt'},
  {id:'hair_mohawk',cat:'hair',    value:'mohawk',  icon:'??',  name:'Mohawk',          price:60, desc:'Punk-Style'},
  {id:'hair_bald',  cat:'hair',    value:'bald',   icon:'??',  name:'Glatze',          price:15, desc:'Klar im Kopf'},

  // BRILLEN
  {id:'gl_round',   cat:'glasses', value:'round',   icon:'??',  name:'Runde Brille',    price:35, desc:'Klassisch rund'},
  {id:'gl_square',  cat:'glasses', value:'square',  icon:'??',  name:'Eckige Brille',   price:35, desc:'Nerdy chic'},
  {id:'gl_sun',     cat:'glasses', value:'sun',     icon:'???',  name:'Sonnenbrille',    price:55, desc:'Cool bleiben'},
  {id:'gl_visor',   cat:'glasses', value:'visor',   icon:'??',  name:'Visor',           price:75, desc:'Cyberpunk-Style'},

  // KOPFBEDECKUNGEN
  {id:'hat_cap',    cat:'hat',     value:'cap',     icon:'??',  name:'Cap',             price:30, desc:'Lässige Kappe'},
  {id:'hat_beanie', cat:'hat',     value:'beanie',  icon:'??',  name:'Beanie',          price:35, desc:'Warme Mütze'},
  {id:'hat_crown',  cat:'hat',     value:'crown',   icon:'??',  name:'Krone',           price:120,desc:'Königlich'},
  {id:'hat_top',    cat:'hat',     value:'top',     icon:'??',  name:'Zylinder',        price:90, desc:'Sehr fein'},

  // BART
  {id:'bd_stub',    cat:'beard',   value:'stub',    icon:'??',  name:'Stoppelbart',     price:20, desc:'Drei-Tage-Bart'},
  {id:'bd_full',    cat:'beard',   value:'full',    icon:'?????', name:'Vollbart',        price:40, desc:'Buschig'},
  {id:'bd_mous',    cat:'beard',   value:'mous',    icon:'?????', name:'Schnurrbart',     price:30, desc:'Klassisch'},

  // OUTFITS (Farben fuer das Hemd)
  {id:'out_red',    cat:'outfit',  value:'#A33B2E', icon:'??',  name:'Rotes Outfit',    price:25, desc:'Auffällig'},
  {id:'out_purple', cat:'outfit',  value:'#7A4FB0', icon:'??',  name:'Lila Outfit',     price:30, desc:'Königlich'},
  {id:'out_gold',   cat:'outfit',  value:'#C9892F', icon:'??',  name:'Goldenes Outfit', price:50, desc:'Champion'},
  {id:'out_white',  cat:'outfit',  value:'#E8E1D3', icon:'?',  name:'Weißes Outfit',   price:35, desc:'Elegant'},

  // HINTERGRUENDE
  {id:'bg_sunset',  cat:'bg',      value:'#4a3a26', icon:'??',  name:'Sonnenuntergang', price:40, desc:'Warmer Hintergrund'},
  {id:'bg_purple',  cat:'bg',      value:'#3a2645', icon:'??',  name:'Galaxie',         price:40, desc:'Lila Nacht'},
  {id:'bg_ocean',   cat:'bg',      value:'#26454a', icon:'??',  name:'Ozean',           price:40, desc:'Tiefes Blau'},
  {id:'bg_rose',    cat:'bg',      value:'#4a2638', icon:'??',  name:'Rosé',            price:40, desc:'Romantisch'},
  {id:'bg_night',   cat:'bg',      value:'#2D2D2D', icon:'??',  name:'Mitternacht',     price:30, desc:'Dunkel & edel'},
];


// =================== AVATAR BUILDER ===================
const AB_OPTS = {
  bg:        ['#19201C','#293D35','#121712'],         // Standard-Hintergruende (frei)
  skin:      ['#F2C9A0','#E5B48C','#C99A75','#A77A5A','#7B5237','#4F3322'],
  hair_color:['#2B1B12','#5C3A21','#8B5A2B','#C9892F','#D9B382','#E8E1D3','#3A3A3A','#A33B2E','#4A2E5A'],
  hair:      ['short'],                               // Standard-Frisur (frei)
  eyes:      ['normal','happy','wink','sleepy','star'],
  mouth:     ['smile','grin','neutral','smirk','open'],
  outfit:    ['#36544A','#6BB592','#262E2A'],         // Standard-Outfits (frei)
  glasses:   ['none'],
  hat:       ['none'],
  beard:     ['none'],
};
const AB_DEFAULT = {bg:'#19201C',skin:'#E5B48C',hair_color:'#2B1B12',hair:'short',eyes:'normal',mouth:'smile',outfit:'#36544A',glasses:'none',hat:'none',beard:'none'};
let _abState = {...AB_DEFAULT};

// Liefert die fuer den User verfuegbaren Optionen einer Kategorie
// (Standard-Optionen aus AB_OPTS + alle gekauften Items derselben Kategorie).
// Devs (is_dev) erhalten automatisch ALLE Items dieser Kategorie ohne Kauf.
function abAvailable(cat){
  const isDev=!!currentUser?.is_dev;
  const owned=isDev?SHOP_ITEMS.map(i=>i.id):lsGet('kivo_items','[]');
  const fromShop=SHOP_ITEMS.filter(it=>it.cat===cat && owned.includes(it.id)).map(it=>it.value);
  return [...(AB_OPTS[cat]||[]), ...fromShop];
}

function renderCustomAvatar(d, size=200){
  if(!d) return '';
  const s = {...AB_DEFAULT, ...d};
  // hair paths
  const hair = {
    short:  `<path d="M60 95 Q60 50 100 48 Q140 50 140 95 L140 78 Q120 62 100 62 Q80 62 60 78 Z" fill="${s.hair_color}"/>`,
    curly:  `<g fill="${s.hair_color}"><circle cx="70" cy="70" r="14"/><circle cx="86" cy="58" r="14"/><circle cx="104" cy="54" r="15"/><circle cx="122" cy="60" r="14"/><circle cx="134" cy="76" r="13"/><path d="M60 92 Q60 70 100 68 Q140 70 140 92 L140 84 Q100 74 60 84 Z"/></g>`,
    long:   `<path d="M55 100 Q55 50 100 48 Q145 50 145 100 L145 140 L132 138 L132 90 Q120 75 100 75 Q80 75 68 90 L68 138 L55 140 Z" fill="${s.hair_color}"/>`,
    buzz:   `<path d="M65 88 Q65 60 100 58 Q135 60 135 88 L135 80 Q100 70 65 80 Z" fill="${s.hair_color}" opacity=".85"/>`,
    mohawk: `<path d="M92 40 L108 40 L112 92 L88 92 Z" fill="${s.hair_color}"/>`,
    bald:   ``
  }[s.hair]||'';
  // eyes
  const eye = (cx)=>{
    if(s.eyes==='happy')   return `<path d="M${cx-7} 112 Q${cx} 104 ${cx+7} 112" stroke="#1a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    if(s.eyes==='wink' && cx>100) return `<path d="M${cx-7} 112 Q${cx} 106 ${cx+7} 112" stroke="#1a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    if(s.eyes==='sleepy')  return `<path d="M${cx-8} 110 Q${cx} 116 ${cx+8} 110" stroke="#1a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    if(s.eyes==='star')    return `<path d="M${cx} 104 L${cx+2} 110 L${cx+8} 110 L${cx+3} 114 L${cx+5} 120 L${cx} 116 L${cx-5} 120 L${cx-3} 114 L${cx-8} 110 L${cx-2} 110 Z" fill="#FFD75A" stroke="#1a1a1a" stroke-width="1"/>`;
    return `<g><circle cx="${cx}" cy="112" r="6" fill="#fff"/><circle cx="${cx}" cy="113" r="3.2" fill="#1a1a1a"/></g>`;
  };
  // mouth
  const mouth = {
    smile:  `<path d="M88 138 Q100 148 112 138" stroke="#3a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    grin:   `<path d="M86 134 Q100 152 114 134 Z" fill="#3a1a1a"/><path d="M88 136 L112 136" stroke="#fff" stroke-width="1.5"/>`,
    neutral:`<line x1="90" y1="140" x2="110" y2="140" stroke="#3a1a1a" stroke-width="2.5" stroke-linecap="round"/>`,
    smirk:  `<path d="M88 140 Q100 144 112 136" stroke="#3a1a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    open:   `<ellipse cx="100" cy="140" rx="6" ry="5" fill="#3a1a1a"/>`
  }[s.mouth]||'';
  // beard (vor mund layern)
  const beard = {
    none: ``,
    stub: `<path d="M78 138 Q100 152 122 138 Q120 148 100 152 Q80 148 78 138 Z" fill="#3a2218" opacity=".4"/>`,
    full: `<path d="M70 130 Q70 158 100 158 Q130 158 130 130 Q130 148 100 152 Q70 148 70 130 Z" fill="#3a2218"/>`,
    mous: `<path d="M86 132 Q100 138 114 132 Q108 130 100 132 Q92 130 86 132 Z" fill="#3a2218"/>`,
  }[s.beard]||'';
  // glasses
  const glasses = {
    none: ``,
    round: `<g fill="none" stroke="#1a1a1a" stroke-width="2.2"><circle cx="86" cy="112" r="9"/><circle cx="114" cy="112" r="9"/><line x1="95" y1="112" x2="105" y2="112"/></g>`,
    square: `<g fill="none" stroke="#1a1a1a" stroke-width="2.2"><rect x="76" y="104" width="20" height="16" rx="2"/><rect x="104" y="104" width="20" height="16" rx="2"/><line x1="96" y1="112" x2="104" y2="112"/></g>`,
    sun:   `<g><rect x="76" y="104" width="20" height="14" rx="3" fill="#1a1a1a"/><rect x="104" y="104" width="20" height="14" rx="3" fill="#1a1a1a"/><line x1="96" y1="111" x2="104" y2="111" stroke="#1a1a1a" stroke-width="2.2"/></g>`,
    visor: `<path d="M68 108 Q100 100 132 108 L132 116 Q100 110 68 116 Z" fill="#6AC28A" stroke="#1a1a1a" stroke-width="1.5"/>`,
  }[s.glasses]||'';
  // hat (nach hair, vor glasses)
  const hat = {
    none: ``,
    cap:    `<g><path d="M55 78 Q60 56 100 54 Q140 56 145 78 Q145 70 100 68 Q55 70 55 78 Z" fill="#A33B2E"/><path d="M50 80 L100 78 L100 84 Q72 84 50 80 Z" fill="#A33B2E"/></g>`,
    beanie: `<path d="M58 82 Q58 50 100 48 Q142 50 142 82 Q142 70 100 68 Q58 70 58 82 Z" fill="#7A4FB0"/><path d="M55 82 L145 82 L145 90 L55 90 Z" fill="#5A3A8A"/>`,
    crown:  `<g fill="#FFD75A" stroke="#C9892F" stroke-width="1.5"><path d="M68 70 L78 50 L88 65 L100 45 L112 65 L122 50 L132 70 L132 78 L68 78 Z"/><circle cx="78" cy="50" r="2" fill="#A33B2E"/><circle cx="100" cy="45" r="2.5" fill="#A33B2E"/><circle cx="122" cy="50" r="2" fill="#A33B2E"/></g>`,
    top:    `<g fill="#1a1a1a"><rect x="72" y="40" width="56" height="35" rx="2"/><ellipse cx="100" cy="76" rx="38" ry="5"/><rect x="72" y="64" width="56" height="4" fill="#A33B2E"/></g>`,
  }[s.hat]||'';
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs><radialGradient id="abg" cx="30%" cy="25%"><stop offset="0%" stop-color="${s.bg}" stop-opacity="1.2"/><stop offset="100%" stop-color="${s.bg}"/></radialGradient></defs>
    <rect width="200" height="200" fill="url(#abg)"/>
    <path d="M40 200 Q40 160 100 158 Q160 160 160 200 Z" fill="${s.outfit}"/>
    <path d="M70 162 Q100 172 130 162 L128 158 Q100 168 72 158 Z" fill="${s.skin}" opacity=".4"/>
    <rect x="92" y="148" width="16" height="14" fill="${s.skin}"/>
    <ellipse cx="100" cy="110" rx="38" ry="42" fill="${s.skin}"/>
    <ellipse cx="62" cy="115" rx="5" ry="8" fill="${s.skin}"/>
    <ellipse cx="138" cy="115" rx="5" ry="8" fill="${s.skin}"/>
    ${hair}
    ${eye(86)} ${eye(114)}
    <path d="M100 118 Q98 126 100 130 Q103 132 105 130" stroke="#3a1a1a" stroke-width="1.5" fill="none" opacity=".5" stroke-linecap="round"/>
    ${mouth}
    ${beard}
    ${glasses}
    ${hat}
  </svg>`;
}

function openAvatarBuilder(){
  if(!currentUser){toast('Bitte zuerst anmelden');return;}
  _abState = {...AB_DEFAULT, ...(currentUser.avatar_data||{})};
  _abRender();
  openModal('avatar-builder-modal');
}

function _abRender(){
  document.getElementById('ab-preview').innerHTML = renderCustomAvatar(_abState, 180);
  const ctrls = document.getElementById('ab-controls');
  const swatch = (key, val) => `<div class="ab-sw ${_abState[key]===val?'sel':''}" style="background:${val}" onclick="abSet('${key}','${val}')"></div>`;
  const tile = (key, val) => `<div class="ab-tile ${_abState[key]===val?'sel':''}" onclick="abSet('${key}','${val}')" title="${val}">${_abMiniIcon(key,val)}</div>`;
  // Item-basierte Optionen ziehen aus AB_OPTS + gekaufte Items.
  const bgs=abAvailable('bg'), hairs=abAvailable('hair'), outfits=abAvailable('outfit');
  const glasses=abAvailable('glasses'), hats=abAvailable('hat'), beards=abAvailable('beard');
  ctrls.innerHTML = `
    <div class="ab-section"><div class="ab-section-title">Hintergrund</div><div class="ab-swatches">${bgs.map(c=>swatch('bg',c)).join('')}</div></div>
    <div class="ab-section"><div class="ab-section-title">Hautton</div><div class="ab-swatches">${AB_OPTS.skin.map(c=>swatch('skin',c)).join('')}</div></div>
    <div class="ab-section"><div class="ab-section-title">Frisur</div><div class="ab-tiles">${hairs.map(h=>tile('hair',h)).join('')}</div></div>
    <div class="ab-section"><div class="ab-section-title">Haarfarbe</div><div class="ab-swatches">${AB_OPTS.hair_color.map(c=>swatch('hair_color',c)).join('')}</div></div>
    <div class="ab-section"><div class="ab-section-title">Augen</div><div class="ab-tiles">${AB_OPTS.eyes.map(e=>tile('eyes',e)).join('')}</div></div>
    <div class="ab-section"><div class="ab-section-title">Mund</div><div class="ab-tiles">${AB_OPTS.mouth.map(m=>tile('mouth',m)).join('')}</div></div>
    <div class="ab-section"><div class="ab-section-title">Brille</div><div class="ab-tiles">${glasses.map(g=>tile('glasses',g)).join('')}</div></div>
    <div class="ab-section"><div class="ab-section-title">Kopfbedeckung</div><div class="ab-tiles">${hats.map(h=>tile('hat',h)).join('')}</div></div>
    <div class="ab-section"><div class="ab-section-title">Bart</div><div class="ab-tiles">${beards.map(b=>tile('beard',b)).join('')}</div></div>
    <div class="ab-section"><div class="ab-section-title">Outfit</div><div class="ab-swatches">${outfits.map(c=>swatch('outfit',c)).join('')}</div></div>
    <div style="font-size:10px;color:var(--muted);margin-top:8px">Mehr Optionen freischalten? Schau im <a onclick="closeModal('avatar-builder-modal');goTo('shop')" style="color:var(--lime);cursor:pointer;text-decoration:underline">Shop</a> vorbei!</div>
  `;
}
function _abMiniIcon(key, val){
  const mini = {..._abState, [key]:val, bg:'#1b3528'};
  return renderCustomAvatar(mini, 64);
}
function abSet(key, val){ _abState[key]=val; _abRender(); }
function abRandomize(){
  const r = arr=>arr[Math.floor(Math.random()*arr.length)];
  _abState = {
    bg:r(abAvailable('bg')), skin:r(AB_OPTS.skin), hair_color:r(AB_OPTS.hair_color),
    hair:r(abAvailable('hair')), eyes:r(AB_OPTS.eyes), mouth:r(AB_OPTS.mouth),
    outfit:r(abAvailable('outfit')),
    glasses:r(abAvailable('glasses')), hat:r(abAvailable('hat')), beard:r(abAvailable('beard')),
  };
  _abRender();
}
async function saveAvatarBuilder(){
  if(!currentUser){toast('Nicht angemeldet');return;}
  const msg=document.getElementById('ab-msg');
  msg.textContent='Speichere...';
  try{
    currentUser.avatar_data=_abState;
    lsSet('kivo_avatar_data', _abState);
    syncProfile();
    msg.textContent='? Gespeichert';
    toast('? Avatar gespeichert');
    // Dashboard- + Header-Avatar sofort aktualisieren
    const html = getUserAvatar(currentUser, 40);
    const ab = document.getElementById('avatar-btn'); if(ab) ab.innerHTML = html;
    updateNavIcons();
    setTimeout(()=>{closeModal('avatar-builder-modal');renderProfile();},500);
  }catch(e){msg.textContent='Fehler: '+(e.message||e);}
}

function renderProfile(targetUser=null) {
  const el=document.getElementById('profile-content'); if(!el)return;
  const user=targetUser||currentUser;
  if(!user&&!targetUser){
    el.innerHTML=`<div class="k-card" style="text-align:center;padding:40px">
      <div style="font-size:40px;margin-bottom:12px">${'??'}</div>
      <div style="font-size:14px;margin-bottom:8px">Noch nicht angemeldet</div>
      <button class="btn btn-lime" onclick="openModal('auth-modal')">Jetzt anmelden</button>
    </div>`;
    return;
  }
  const xp=currentUser?getTotalXp():0, streak=currentUser?calcStreak():0;
  const av=getScopedString('kivo_avatar_'+(user?.username||''),'')||getScopedString('kivo_avatar_url','');
  const items=currentUser?lsGet('kivo_items','[]'):[];
  const equipped=lsGet('kivo_equipped','[]');
  el.innerHTML=`
    <div class="profile-hero">
      <div class="profile-av" id="prof-av">${getUserAvatar(user, 64)}</div>
      <div style="flex:1">
        <div style="font-size:20px;font-weight:800;margin-bottom:4px">${user?.username||'Gast'}</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:8px">${user?.email||''}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <div style="text-align:center"><div style="font-size:18px;font-weight:700;color:var(--lime)">${xp.toLocaleString()}</div><div style="font-size:9px;color:var(--muted)">XP</div></div>
          <div style="text-align:center"><div style="font-size:18px;font-weight:700;color:var(--orange)">${streak}</div><div style="font-size:9px;color:var(--muted)">Streak</div></div>
          <div style="text-align:center"><div style="font-size:18px;font-weight:700">${sessions.length}</div><div style="font-size:9px;color:var(--muted)">Sessions</div></div>
        </div>
      </div>
      ${currentUser?`<button class="btn btn-sm" onclick="document.getElementById('avatar-inp').click()">??</button><input type="file" id="avatar-inp" accept="image/*" style="display:none" onchange="uploadAvatar(this)">`:'' }
    </div>

    <!-- Gekaufte Avatar-Items -->
    <div class="k-card-sm" style="margin-bottom:12px">
      <div class="k-section-title">Avatar-Items</div>
      <div class="profile-items-row" id="equipped-row">
        ${(()=>{const owned=lsGet('kivo_items','[]');const its=SHOP_ITEMS.filter(i=>owned.includes(i.id));return its.length?its.map(it=>`<div class="profile-item-badge" title="${it.name}">${it.icon}</div>`).join(''):'<div style="font-size:11px;color:var(--muted)">Noch keine Items — kaufe welche im Shop und gestalte deinen Avatar!</div>'})()}
      </div>
      ${currentUser?`<button class="btn btn-sm btn-lime" style="margin-top:8px" onclick="openAvatarBuilder()">?? Avatar gestalten</button>`:''}
    </div>

    <!-- Stats Vergleich (wenn eigenes Profil oder Freundesprofil) -->
    ${currentUser?`
    <div class="k-card-sm" style="margin-bottom:12px">
      <div class="k-section-title">Statistiken</div>
      ${renderStatsVs(null)}
    </div>`:'' }

  ${currentUser ? `
    <div class="k-card-sm" role="region" aria-label="Benutzereinstellungen">
      <div class="k-section-title">Einstellungen</div>
      <div class="k-group">
        <label class="k-label" for="prof-uname">Nutzername ändern</label>
        <div style="display:flex;gap:6px">
          <input
            class="k-input"
            id="prof-uname"
            value="${currentUser?.username || ''}"
            aria-label="Neuer Nutzername"
            style="flex:1"
          >
          <button
            class="btn btn-ok btn-sm"
            onclick="changeUsername()"
            aria-label="Nutzername speichern"
          >Speichern</button>
        </div>
        <label class="k-label" for="sett-pw">Passwort ändern</label>
        <div style="display:flex;gap:6px">
          <input
            class="k-input"
            id="sett-pw"
            type="password"
            placeholder="Neues Passwort"
            aria-label="Neues Passwort"
            style="flex:1"
          >
          <button
            class="btn btn-ok btn-sm"
            onclick="changePw()"
            aria-label="Passwort speichern"
          >Speichern</button>
        </div>
      </div>
      <button
        class="btn btn-danger btn-sm"
        onclick="doLogout()"
        aria-label="Abmelden"
      >? Abmelden</button>
    </div>
  ` : ''}
  `;
}

// -- SETTINGS --------------------------------------------------

    
async function changePw(){
  const pw=document.getElementById('sett-pw')?.value;
  if(!pw||pw.length<6){toast('Mind. 6 Zeichen');return;}
  try{await sb.auth.updateUser({password:pw});toast('? Passwort geändert');}catch(e){toast('Fehler: '+e.message);}
}
function saveNvKey(){ toast('KI-Schlüssel werden serverseitig verwaltet'); }


function getUserAvatar(user, size = 24) {
  const defaultIcon = `
    <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="4"></circle>
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7"></path>
    </svg>
  `;

  const avatarData = user?.avatar_data || lsGet('kivo_avatar_data', 'null');
  const savedAvatar = user?.avatar_url || getScopedString(`kivo_avatar_${user?.username || ''}`, '') || lsGet('kivo_avatar_url', '""');

  if (avatarData) return renderCustomAvatar(avatarData, size);
  if (savedAvatar) return `<img src="${savedAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" alt="Profilbild">`;

  return defaultIcon;
}

function updateNavIcons() {
  const navIconEl = document.getElementById('profile-nav-icon');
  const railIconEl = document.getElementById('profile-rail-icon');

  const iconHtml = getUserAvatar(currentUser, 24);

  if (navIconEl) navIconEl.innerHTML = iconHtml;
  if (railIconEl) railIconEl.innerHTML = iconHtml;
}

function renderStatsVs(otherProfile) {
  const myXp=getTotalXp(), myStreak=calcStreak(), myKnown=vocab.filter(v=>v.known).length;
  if(!otherProfile) return `
    <div class="vs-bar"><div class="vs-lbl" style="font-size:10px;color:var(--muted)">XP</div><div class="vs-bars"><div class="vs-bar-me" style="width:${Math.min(100,myXp/10)}px"></div></div><div style="font-size:10px;color:var(--lime);min-width:40px;text-align:right">${myXp}</div></div>
    <div class="vs-bar"><div class="vs-lbl" style="font-size:10px;color:var(--muted)">Streak</div><div class="vs-bars"><div class="vs-bar-me" style="width:${Math.min(100,myStreak*8)}px"></div></div><div style="font-size:10px;color:var(--orange);min-width:40px;text-align:right">${myStreak}d</div></div>
    <div class="vs-bar"><div class="vs-lbl" style="font-size:10px;color:var(--muted)">Gekonnt</div><div class="vs-bars"><div class="vs-bar-me" style="width:${Math.min(100,myKnown*5)}px"></div></div><div style="font-size:10px;color:var(--lime);min-width:40px;text-align:right">${myKnown}</div></div>`;
  // Comparison with another user
  const theirXp=otherProfile.xp_total||0, theirStreak=otherProfile.streak||0;
  const maxXp=Math.max(myXp,theirXp,1), maxS=Math.max(myStreak,theirStreak,1);
  return `
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:9px;color:var(--muted)"><span style="color:var(--lime)">? Du</span><span style="color:var(--blue)">? ${otherProfile.username}</span></div>
    <div class="vs-bar"><div class="vs-lbl">XP</div><div class="vs-bars"><div class="vs-bar-me" style="width:${Math.round(myXp/maxXp*120)}px"></div><div class="vs-bar-them" style="width:${Math.round(theirXp/maxXp*120)}px"></div></div><div style="font-size:9px;color:var(--muted);min-width:60px;text-align:right">${myXp} / ${theirXp}</div></div>
    <div class="vs-bar"><div class="vs-lbl">Streak</div><div class="vs-bars"><div class="vs-bar-me" style="width:${Math.round(myStreak/maxS*120)}px"></div><div class="vs-bar-them" style="width:${Math.round(theirStreak/maxS*120)}px"></div></div><div style="font-size:9px;color:var(--muted);min-width:60px;text-align:right">${myStreak}d / ${theirStreak}d</div></div>`;
}

async function uploadAvatar(inp) {
  const file=inp.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=async e=>{
    const url=e.target.result;
    lsSet('kivo_avatar_url', url);
    currentUser.avatar_url = url;
    syncProfile();
    document.getElementById('prof-av').innerHTML = getUserAvatar(currentUser, 64);
    const imgHtml = getUserAvatar(currentUser, 32);
    document.getElementById('avatar-btn').innerHTML = imgHtml;
    updateNavIcons();
    toast('? Profilbild gespeichert');
  };
  reader.readAsDataURL(file);
}

async function changeUsername() {
  if(!currentUser)return;
  const newName=(document.getElementById('prof-uname')?.value||'').trim();
  const msg=document.getElementById('uname-msg');
  if(!newName||newName.length<3){if(msg)msg.textContent='Mind. 3 Zeichen';return;}
  if(!/^[a-zA-Z0-9_.-]+$/.test(newName)){if(msg)msg.textContent='Nur a-z 0-9 _ . -';return;}
  if(msg)msg.textContent='Prüfe...';
  try {
    const {data:ex}=await sb.from('profiles').select('id').eq('username',newName).neq('id',currentUser.id).maybeSingle();
    if(ex){if(msg)msg.textContent='Bereits vergeben';return;}
    currentUser.username=newName;
    lsSet('kivo_username', newName);
    syncProfile();
    document.getElementById('um-name').textContent=newName;
    if(msg)msg.textContent='? Gespeichert!';
    toast('? Nutzername geändert');
  } catch(e){if(msg)msg.textContent='Fehler: '+e.message;}
}






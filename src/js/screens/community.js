// ── COMMUNITY HUB ──────────────────────────────────────────────
function withTimeout(promise, ms = 8000, label = 'Request timeout') {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(label)), ms)
  );

  return Promise.race([promise, timeout]);
}

async function renderCommunity() {
  const el = document.getElementById('community-content');
  if (!el) return;

  if (!currentUser) {
    el.innerHTML = `
      <div class="k-card" style="text-align:center;padding:42px">
        <div style="font-size:42px;margin-bottom:12px">👥</div>
        <div style="font-size:14px;font-weight:800;margin-bottom:8px">
          Anmeldung erforderlich
        </div>
        <button class="btn btn-lime" onclick="openModal('auth-modal')">
          Anmelden
        </button>
      </div>
    `;
    return;
  }

  el.innerHTML = makeLoadingHTML(
    'Community wird geladen...',
    30,
    'loading'
  );

  try {
    const { data: links } = await withTimeout(
      sb
        .from('friendships')
        .select('friend_id,user_id,status')
        .or(
          'user_id.eq.' + currentUser.id +
          ',friend_id.eq.' + currentUser.id
        ),
      8000,
      'Freunde konnten nicht geladen werden'
    );

    el.innerHTML = makeLoadingHTML(
      'Freunde werden geladen...',
      60,
      'loading'
    );

    const accepted = (links || []).filter(f => f.status === 'accepted');

    const friendIds = accepted.map(f =>
      f.user_id === currentUser.id
        ? f.friend_id
        : f.user_id
    );

    const { data: friends } = friendIds.length
      ? await withTimeout(
          sb.rpc('get_public_profiles', { _ids: friendIds }),
          8000,
          'Profile konnten nicht geladen werden'
        )
      : { data: [] };

    el.innerHTML = makeLoadingHTML(
      'Leaderboard wird geladen...',
      85,
      'loading'
    );

    const { data: global } = await withTimeout(
      sb.rpc('get_global_leaderboard', { _limit: 5 }),
      8000,
      'Leaderboard konnte nicht geladen werden'
    );

    const friendHtml = (friends || []).length
      ? (friends || []).map(p => `
        <div class="friend-row">

          <div class="f-av profile-link"
               onclick="viewFriendProfile('${p.id}','${p.username || ''}')">

            ${p.avatar_url
              ? `<img src="${p.avatar_url}">`
              : (p.username || '?')[0].toUpperCase()
            }

          </div>

          <div class="f-info profile-link"
               onclick="viewFriendProfile('${p.id}','${p.username || ''}')">

            <div class="f-name">${p.username || '?'}</div>

            <div class="f-pts">
              ⚡ ${(p.xp_total || 0).toLocaleString()}
              · 🔥 ${p.streak || 0}d
            </div>

          </div>

        </div>
      `).join('')
      : `
        <div style="font-size:11px;color:var(--muted);padding:10px 0">
          Noch keine Freunde.
        </div>

        <button class="btn btn-lime btn-sm"
                onclick="openFriendPanel();switchFpTab('social')">
          Freund hinzufügen
        </button>
      `;

    const globalHtml = (global || []).map((p, i) => `
      <div class="friend-row ${currentUser && p.id === currentUser.id ? 'me' : ''}">

        <div class="f-rank
          ${i === 0 ? 'rank-1' : ''}
          ${i === 1 ? 'rank-2' : ''}
          ${i === 2 ? 'rank-3' : ''}">

          ${i === 0 ? '🥇'
            : i === 1 ? '🥈'
            : i === 2 ? '🥉'
            : '#' + (i + 1)
          }

        </div>

        <div class="f-info ${p.id !== currentUser.id ? 'profile-link' : ''}"
          ${p.id !== currentUser.id
            ? `onclick="viewFriendProfile('${p.id}','${p.username || ''}')"`
            : ''
          }>

          <div class="f-name">
            ${p.username || '?'}

            ${p.id === currentUser.id
              ? '<span class="tag lime">Du</span>'
              : ''
            }
          </div>

          <div class="f-pts">
            ⚡ ${(p.xp_total || 0).toLocaleString()}
          </div>

        </div>

      </div>
    `).join('');

    el.innerHTML = `
      <div class="community-grid">

        <div class="k-card">

          <div style="font-size:17px;font-weight:850;margin-bottom:12px">
            Freunde
          </div>

          ${friendHtml}

        </div>

        <div class="k-card">

          <div style="font-size:17px;font-weight:850;margin-bottom:12px">
            Global Leaderboard
          </div>

          ${globalHtml || `
            <div style="font-size:11px;color:var(--muted)">
              Noch keine Einträge.
            </div>
          `}

          <button class="btn btn-ghost btn-sm"
                  style="margin-top:10px"
                  onclick="openFriendPanel();switchFpTab('global')">
            Top 10 öffnen
          </button>

        </div>

      </div>
    `;

  } catch (e) {
    const msg =
      e.message === 'Freunde konnten nicht geladen werden'
      || e.message === 'Profile konnten nicht geladen werden'
      || e.message === 'Leaderboard konnte nicht geladen werden'
        ? e.message
        : 'Unbekannter Fehler';

    el.innerHTML = makeLoadingHTML(
      'Fehler beim Laden',
      0,
      'error',
      '',
      msg
    );
  }
}


// ── FRIEND PANEL ──────────────────────────────────────────────
function openFriendPanel() {
  document.getElementById('fp-overlay').classList.add('open');
  document.getElementById('fp-panel').classList.add('open');
  loadFriendPanel();
}
function closeFriendPanel() {
  document.getElementById('fp-overlay').classList.remove('open');
  document.getElementById('fp-panel').classList.remove('open');
}
function switchFpTab(tab) {
  fpTab=tab;
  document.querySelectorAll('.fp-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('fpt-'+tab)?.classList.add('active');
  ['board','global','social','pools'].forEach(t=>{
    const e=document.getElementById('fp-'+t+'-content'); if(e)e.style.display=t===tab?'':'none';
  });
  if(tab==='global')loadGlobalLb();
  else if(tab==='pools')loadFpPools();
}

async function loadFriendPanel() {
  // Prüfung von currentUser ganz am Anfang
  if (!currentUser) {
    const authHtml = `
      <div style="text-align:center;padding:30px">
        <div style="font-size:36px;margin-bottom:10px">🔒</div>
        <div style="font-size:12px;margin-bottom:12px">Anmeldung erforderlich</div>
        <button class="btn btn-lime btn-sm" onclick="closeFriendPanel();openModal('auth-modal')">Anmelden</button>
      </div>`;
    document.getElementById('fp-board-content').innerHTML = authHtml;
    document.getElementById('fp-social-content').innerHTML = authHtml;
    return;
  }

  // Lade-Animation anzeigen
  document.getElementById('fp-board-content').innerHTML = makeLoadingHTML('Lade...', undefined, 'loading');

  try {
    // XP synchronisieren
    await syncXpToServer();

    // Freundschaften abfragen
    const { data: links } = await sb
      .from('friendships')
      .select('friend_id,user_id,status')
      .or(`user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`);

    // Akzeptierte Freundschaften filtern
    const accepted = (links || []).filter(f => f.status === 'accepted');
    fpFriendIds = accepted.map(f => f.user_id === currentUser.id ? f.friend_id : f.user_id);

    // Ausstehende Anfragen (für Badge)
    const pendingIn = (links || []).filter(f => f.status === 'pending' && f.friend_id === currentUser.id);
    const badge = document.getElementById('fp-req-badge');
    if (badge) {
      badge.textContent = pendingIn.length;
      badge.style.display = pendingIn.length > 0 ? '' : 'none';
    }
    document.getElementById('friend-notif').classList.toggle('show', pendingIn.length > 0);

    // Profile aller Freunde + aktueller User abfragen
    const allIds = [...fpFriendIds, currentUser.id];
    const { data: profs } = await sb.rpc('get_public_profiles', { _ids: allIds });
    const sorted = (profs || []).sort((a, b) => (b.xp_total || 0) - (a.xp_total || 0));

    // Eigene XP und Streak berechnen
    const myXp = getTotalXp();
    const myStreak = calcStreak();

    // Rang-Emoji und CSS-Klasse zuweisen
    const rEmoji = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1);
    const rClass = i => i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';

    // Board-HTML generieren (Freundesliste)
    let boardHtml;
    if (sorted.length <= 1) {
      boardHtml = `
        <div style="text-align:center;padding:24px">
          <div style="font-size:32px;margin-bottom:10px">👥</div>
          <div style="font-size:12px;margin-bottom:10px">Noch keine Freunde</div>
          <button class="btn btn-lime btn-sm" onclick="switchFpTab('social')">➕ Freund hinzufügen</button>
        </div>`;
    } else {
      boardHtml = sorted.map((p, i) => {
        const isMe = p.id === currentUser.id;
        const xp = isMe ? myXp : (p.xp_total || 0);
        const streak = isMe ? myStreak : (p.streak || 0);
        const av = p.avatar_url
          ? `<img src="${p.avatar_url}">`
          : (p.username || '?')[0].toUpperCase();
        const isFriend = fpFriendIds.includes(p.id);
        const profileAction = !isMe ? `onclick="viewFriendProfile('${p.id}','${p.username || ''}')"` : '';

        return `
          <div class="friend-row ${isMe ? 'me' : ''}">
            <div class="f-rank ${rClass(i)}">${rEmoji(i)}</div>
            <div class="f-av ${!isMe ? 'profile-link' : ''}" ${profileAction}>${av}</div>
            <div class="f-info ${!isMe ? 'profile-link' : ''}" ${profileAction}>
              <div class="f-name">${p.username || '?'} ${isMe ? '<span class="tag lime">Du</span>' : ''}</div>
              <div class="f-pts">⚡ ${xp.toLocaleString()} · ${streak >= 2 ? '🔥' : '📅'} ${streak}d</div>
            </div>
            ${isFriend && !isMe ? `<button class="btn btn-danger btn-sm" onclick="fpRemove('${p.id}')">✗</button>` : ''}
          </div>`;
      }).join('');
    }
    document.getElementById('fp-board-content').innerHTML = boardHtml;

    // Social-Tab-HTML generieren
    let socialHtml = '';

    // Eingehende Freundesanfragen
    if (pendingIn.length > 0) {
      const uids = pendingIn.map(p => p.user_id);
      const { data: rp } = await sb.rpc('get_public_profiles', { _ids: uids });
      socialHtml = `
        <div class="k-section-title" style="margin-bottom:8px">Eingehende Anfragen</div>
        ${(rp || []).map(p => `
          <div class="friend-req-row" style="display:flex;align-items:center;gap:8px;padding:10px;background:var(--panel-2);border:1px solid var(--line);border-radius:var(--r-sm);margin-bottom:6px">
            <div class="f-av" style="width:28px;height:28px;font-size:10px">${(p.username || '?')[0].toUpperCase()}</div>
            <span style="flex:1;font-size:11px">${p.username}</span>
            <button class="btn btn-ok btn-sm" onclick="fpAccept('${p.id}')">✓</button>
            <button class="btn btn-danger btn-sm" onclick="fpDecline('${p.id}')">✗</button>
          </div>`).join('')}
        <div style="height:14px"></div>`;
    }

    // Pool-Einladungen abfragen
    const { data: poolInvs } = await sb
      .from('pool_shares')
      .select('id,pool_name,from_username,data')
      .eq('to_user_id', currentUser.id)
      .eq('accepted', false);

    // Pool-Einladungen anzeigen
    if ((poolInvs || []).length > 0) {
      socialHtml += `
        <div class="k-section-title" style="margin-bottom:8px">Pool-Einladungen</div>
        ${(poolInvs || []).map(inv => `
          <div class="pool-inv-row" style="display:flex;align-items:center;gap:8px;padding:10px;background:var(--panel-2);border:1px solid var(--line);border-radius:var(--r-sm);margin-bottom:6px">
            <span style="font-size:16px">📚</span>
            <div style="flex:1">
              <div style="font-size:11px;font-weight:600">${inv.pool_name}</div>
              <div style="font-size:9px;color:var(--muted)">von ${inv.from_username}</div>
            </div>
            <button class="btn btn-ok btn-sm" onclick="acceptPoolInv('${inv.id}','${inv.pool_name}',this)">✓</button>
            <button class="btn btn-danger btn-sm" onclick="declinePoolInv('${inv.id}')">✗</button>
          </div>`).join('')}
        <div style="height:14px"></div>`;
    } else {
      socialHtml += `<div style="font-size:11px;color:var(--muted);padding:20px;text-align:center">Keine neuen Einladungen</div>`;
    }

    // Freund hinzufügen-Formular
    socialHtml += `
      <div class="k-section-title" style="margin-bottom:8px">Freund hinzufügen</div>
      <div style="display:flex;gap:7px;margin-bottom:8px">
        <input class="k-input" id="fp-search" placeholder="Nutzername...">
        <button class="btn btn-lime btn-sm" onclick="fpAdd()">Senden</button>
      </div>
      <div id="fp-add-res"></div>`;

    document.getElementById('fp-social-content').innerHTML = socialHtml;

  } catch (e) {
    document.getElementById('fp-board-content').innerHTML = `
      <div style="font-size:11px;color:var(--danger);padding:20px;text-align:center">
        ⚠ ${e.message}
      </div>`;
  }
}

async function loadGlobalLb() {
  const el=document.getElementById('fp-global-content'); if(!el)return;
  el.innerHTML = makeLoadingHTML('Lade...', undefined, 'loading');
  try {
    const{data:profs}=await sb.rpc('get_global_leaderboard',{_limit:10});
    const rEmoji=i=>i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1);
    const rClass=i=>i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'';
    el.innerHTML='<div class="k-section-title" style="margin-bottom:8px">Global Top 10</div>'
      +(profs||[]).map((p,i)=>{
        const isMe=currentUser&&p.id===currentUser.id;
        const av=p.avatar_url?`<img src="${p.avatar_url}">`:(p.username||'?')[0].toUpperCase();
        const profileAction=!isMe?`onclick="viewFriendProfile('${p.id}','${p.username||''}')"`:'';
        return `<div class="friend-row ${isMe?'me':''}">
          <div class="f-rank ${rClass(i)}">${rEmoji(i)}</div>
          <div class="f-av ${!isMe?'profile-link':''}" ${profileAction}>${av}</div>
          <div class="f-info ${!isMe?'profile-link':''}" ${profileAction}><div class="f-name">${p.username||'?'} ${isMe?'<span class="tag lime">Du</span>':''}</div><div class="f-pts">⚡ ${(p.xp_total||0).toLocaleString()} · ${(p.streak||0)>=2?'🔥':'📅'} ${p.streak||0}d</div></div>
        </div>`;
      }).join('');
  } catch(e){
    el.innerHTML = makeLoadingHTML('Fehler', 0, 'error', '', e.message);
  }
}

async function loadFpPools() {
  const el=document.getElementById('fp-pools-content'); if(!el)return;
  if(!currentUser){el.innerHTML=`<div style="text-align:center;padding:30px"><div style="font-size:36px;margin-bottom:10px">🔒</div><div style="font-size:12px;margin-bottom:12px">Anmeldung erforderlich</div><button class="btn btn-lime btn-sm" onclick="closeFriendPanel();openModal('auth-modal')">Anmelden</button></div>`;return;}
  if(!fpFriendIds.length){el.innerHTML='<div style="padding:20px;font-size:11px;color:var(--muted)">Keine Freunde vorhanden</div>';return;}
  const{data:fProfs}=await sb.rpc('get_public_profiles',{_ids:fpFriendIds});
  const friendMap=Object.fromEntries((fProfs||[]).map(p=>[p.id,p.username]));
  let poolOpts='<option value="">Pool wählen...</option>';
  for(const[lang,pools] of Object.entries(POOLS))
    for(const[pname] of Object.entries(pools))
      poolOpts+=`<option value="${esc(mkKey(lang,pname))}" data-key="${mkKey(lang,pname)}" data-name="${pname}">${pname} (${lang})</option>`;
  el.innerHTML=`
    <div class="k-section-title" style="margin-bottom:8px">Pool an Freund senden</div>
    <div class="k-group"><select class="k-input" id="fp-pool-sel">${poolOpts}</select></div>
    <div class="k-group"><select class="k-input" id="fp-friend-sel"><option value="">Freund wählen...</option>${Object.entries(friendMap).map(([id,n])=>`<option value="${id}">${n}</option>`).join('')}</select></div>
    <button class="btn btn-lime" style="width:100%" onclick="sendPool()">📤 Pool senden</button>
    <div id="fp-pool-res" style="margin-top:8px;font-size:10px"></div>`;
}

async function fpAdd() {
  const uname=(document.getElementById('fp-search')?.value||'').trim();
  const res=document.getElementById('fp-add-res');
  if(!uname){if(res)res.innerHTML='<div style="color:var(--danger)">Nutzername eingeben</div>';return;}
  if(uname===currentUser.username){if(res)res.innerHTML='<div style="color:var(--orange)">Das bist du 😄</div>';return;}
  if(res)res.innerHTML='<div style="color:var(--muted)">Suche...</div>';
  try {
    const{data:found}=await sb.rpc('search_public_profile',{_username:uname});
    const p=Array.isArray(found)?found[0]:found;
    if(!p){if(res)res.innerHTML=`<div style="color:var(--danger)">${uname} nicht gefunden</div>`;return;}
    const{data:ex}=await sb.from('friendships').select('id,status').or(`and(user_id.eq.${currentUser.id},friend_id.eq.${p.id}),and(user_id.eq.${p.id},friend_id.eq.${currentUser.id})`).maybeSingle();
    if(ex){if(res)res.innerHTML=`<div style="color:var(--orange)">${ex.status==='pending'?'Anfrage gesendet ⏳':'Bereits befreundet ✓'}</div>`;return;}
    await sb.from('friendships').insert({user_id:currentUser.id,friend_id:p.id,status:'pending'});
    if(res)res.innerHTML=`<div style="color:var(--lime)">✓ Anfrage an ${uname} gesendet!</div>`;
    document.getElementById('fp-search').value='';
  } catch(e){if(res)res.innerHTML=`<div style="color:var(--danger)">${e.message}</div>`;}
}

async function fpAccept(uid){
  try{await sb.from('friendships').update({status:'accepted'}).eq('user_id',uid).eq('friend_id',currentUser.id);toast('✓ Freundschaft angenommen!');loadFriendPanel();}catch(e){toast(e.message);}
}
async function fpDecline(uid){
  try{await sb.from('friendships').delete().eq('user_id',uid).eq('friend_id',currentUser.id);toast('Abgelehnt');loadFriendPanel();}catch(e){toast(e.message);}
}
async function fpRemove(uid){
  confirm2('Freund entfernen?','Diese Person wird entfernt.',async()=>{
    try{await sb.from('friendships').delete().or(`and(user_id.eq.${currentUser.id},friend_id.eq.${uid}),and(user_id.eq.${uid},friend_id.eq.${currentUser.id})`);toast('Entfernt');loadFriendPanel();}catch(e){toast(e.message);}
  });
}

async function sendPool(){
  const sel=document.getElementById('fp-pool-sel'); const toId=document.getElementById('fp-friend-sel')?.value;
  const res=document.getElementById('fp-pool-res');
  const poolKey=sel?.options[sel.selectedIndex]?.dataset?.key||''; const poolName=sel?.options[sel.selectedIndex]?.dataset?.name||'';
  if(!poolKey||!toId){if(res)res.innerHTML='<span style="color:var(--danger)">Bitte Pool und Freund wählen</span>';return;}
  const pool=getPoolObj(poolKey);
  try{
    await sb.from('pool_shares').insert({from_user_id:currentUser.id,from_username:currentUser.username,to_user_id:toId,pool_key:esc(poolKey),pool_name:poolName,data:pool,accepted:false,created_at:new Date().toISOString()});
    if(res)res.innerHTML='<span style="color:var(--lime)">✓ Pool gesendet!</span>'; toast('📤 Pool gesendet!');
  }catch(e){if(res)res.innerHTML=`<span style="color:var(--danger)">${e.message}</span>`;}
}

async function acceptPoolInv(invId,poolName,btn){
  try{
    const{data:inv}=await sb.from('pool_shares').select('data,pool_name').eq('id',invId).maybeSingle();
    if(!inv?.data){toast('Fehler: Daten fehlen');return;}
    const lang='Import'; const name=inv.pool_name||poolName;
    if(!POOLS[lang])POOLS[lang]={};
    POOLS[lang][name]=inv.data; saveCustom();
    if(currentUser)await syncPoolToServer(lang,name);
    await sb.from('pool_shares').update({accepted:true}).eq('id',invId);
    loadState(); toast('✓ Pool "'+name+'" übernommen!'); loadFriendPanel();
  }catch(e){toast(e.message);}
}
async function declinePoolInv(invId){
  try{await sb.from('pool_shares').update({accepted:true}).eq('id',invId);toast('Abgelehnt');loadFriendPanel();}catch(e){toast(e.message);}
}

async function viewFriendProfile(uid,username){
  closeFriendPanel();
  try{
    const{data:rows}=await sb.rpc('get_public_profiles',{_ids:[uid]});
    const p=Array.isArray(rows)?rows[0]:rows;
    if(currentUser&&p?.id===currentUser.id){goTo('profile');return;}
    const el=document.getElementById('profile-content');
    const av=p?.avatar_url?`<img src="${p.avatar_url}">`:(username||'?')[0].toUpperCase();
    el.innerHTML=`
      <button class="btn btn-sm btn-ghost" onclick="loadFriendPanel()" style="margin-bottom:12px">← Zurück</button>
      <div class="profile-hero">
        <div class="profile-av">${av}</div>
        <div style="flex:1">
          <div style="font-size:20px;font-weight:8C00;margin-bottom:4px">${p?.username||username}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
            <div style="text-align:center"><div style="font-size:18px;font-weight:700;color:var(--lime)">${(p?.xp_total||0).toLocaleString()}</div><div style="font-size:9px;color:var(--muted)">XP</div></div>
            <div style="text-align:center"><div style="font-size:18px;font-weight:700;color:var(--orange)">${p?.streak||0}</div><div style="font-size:9px;color:var(--muted)">Streak</div></div>
          </div>
        </div>
      </div>
      <div class="k-card-sm"><div class="k-section-title">Vergleich mit dir</div>${renderStatsVs(p)}</div>`;
    goTo('profile',{keepProfileContent:true});
  }catch(e){toast('Fehler: '+e.message);}
}



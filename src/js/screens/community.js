// ── COMMUNITY HUB ──────────────────────────────────────────────
function withTimeout(promise, ms = 8000, label = 'Request timeout') {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(label)), ms)
  );

  return Promise.race([promise, timeout]);
}

let latestReleaseCache = null;
let latestReleaseCacheAt = 0;
let latestReleaseListCache = [];
let latestReleaseListCacheAt = 0;
let latestReleaseSelectedTag = null;
const GITHUB_RELEASES_URL = 'https://api.github.com/repos/schokos/Kivo/releases';
const GITHUB_ISSUES_URL = 'https://github.com/schokos/Kivo/issues';
const WHATSNEW_ACTIVE_TAG_KEY = 'kivo_whatsnew_active_tag';

function openFeedbackIssues() {
  window.open(GITHUB_ISSUES_URL, '_blank', 'noopener,noreferrer');
}

function getReleaseSeenTag() {
  return currentUser?.release_seen_tag || '';
}

function formatReleaseDate(release) {
  const dt = release?.published_at || release?.created_at;
  if (!dt) return '';
  try {
    return new Date(dt).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: '2-digit'
    });
  } catch (e) {
    return '';
  }
}

function getStoredWhatsNewTag() {
  return localStorage.getItem(WHATSNEW_ACTIVE_TAG_KEY) || '';
}

function setStoredWhatsNewTag(tag) {
  if (tag) localStorage.setItem(WHATSNEW_ACTIVE_TAG_KEY, tag);
  else localStorage.removeItem(WHATSNEW_ACTIVE_TAG_KEY);
}

function getReleaseTag(release) {
  return release?.tag_name || release?.name || '';
}

function getLocalReleaseFallback() {
  return [{
    tag_name: 'local',
    name: 'Offline Release-Hinweis',
    body: 'Release-Notizen konnten nicht von GitHub geladen werden. Bitte später erneut versuchen.',
    published_at: new Date().toISOString()
  }];
}

async function fetchReleaseFeed(force = false) {
  const now = Date.now();
  if (!force && latestReleaseListCache.length && now - latestReleaseListCacheAt < 5 * 60 * 1000) {
    return latestReleaseListCache;
  }
  try {
    const res = await withTimeout(
      fetch(GITHUB_RELEASES_URL, {
        headers: { Accept: 'application/vnd.github+json' }
      }),
      8000,
      'GitHub API Timeout'
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`);
    const releases = await res.json();
    if (!Array.isArray(releases)) throw new Error('GitHub API: Invalid response format');
    const sorted = releases
      .filter(r => r && !r.draft && !r.prerelease)
      .sort((a, b) => {
        const at = new Date(a.published_at || a.created_at || 0).getTime();
        const bt = new Date(b.published_at || b.created_at || 0).getTime();
        return bt - at;
      });
    latestReleaseListCache = sorted;
    latestReleaseListCacheAt = now;
    latestReleaseCache = sorted[0] || null;
    latestReleaseCacheAt = now;
    return sorted;
  } catch (err) {
    if (latestReleaseListCache.length) return latestReleaseListCache;
    const fallback = getLocalReleaseFallback();
    latestReleaseListCache = fallback;
    latestReleaseListCacheAt = now;
    latestReleaseCache = fallback[0] || null;
    latestReleaseCacheAt = now;
    return fallback;
  }
}

function renderWhatsNewReleaseList(releases, activeTag) {
  const el = document.getElementById('wn-list');
  if (!el) return;
  if (!releases.length) {
    el.innerHTML = '<div class="wn-empty">Keine veröffentlichte Release-Version gefunden.</div>';
    return;
  }
  el.innerHTML = releases.map((release, idx) => {
    const tag = getReleaseTag(release);
    const title = release.name || release.tag_name || `Release ${idx + 1}`;
    const date = formatReleaseDate(release);
    const active = tag && tag === activeTag;
    return `
      <button class="wn-item ${active ? 'active' : ''}" onclick="openWhatsNewRelease(${JSON.stringify(tag)})">
        <div class="wn-item-title">${escapeHtml(title)}</div>
        <div class="wn-item-tag">${escapeHtml(tag || 'ohne Tag')}${date ? ' · ' + escapeHtml(date) : ''}</div>
      </button>
    `;
  }).join('');
}

function renderWhatsNewReleaseDetail(release) {
  const el = document.getElementById('wn-content');
  if (!el) return null;
  if (!release) {
    el.innerHTML = '<div class="wn-empty">Kein Release ausgewählt.</div>';
    return null;
  }
  const releaseId = getReleaseTag(release);
  const releaseTitle = release.name || release.tag_name || 'Neues Update';
  const releaseDate = formatReleaseDate(release);
  const notes = release.body || '_Keine Release-Notes verfügbar._';
  const meta = [release.tag_name ? `Tag ${release.tag_name}` : '', releaseDate ? `Veröffentlicht ${releaseDate}` : '']
    .filter(Boolean)
    .join(' · ');

  el.innerHTML = `
    <div class="k-card-sm" style="margin-bottom:12px">
      <div class="release-head">
        <div class="k-section-title" style="margin-bottom:0">What's new</div>
        <div style="font-size:16px;font-weight:800">${escapeHtml(releaseTitle)}</div>
        <div class="release-meta">${escapeHtml(meta || 'Neueste Release-Notizen von GitHub')}</div>
      </div>
      <div class="release-body">${renderMarkdown(notes)}</div>
      <div class="wn-mobile-actions" style="margin-top:12px">
        <button class="btn btn-ghost btn-sm mobile-only" onclick="openFeedbackIssues()">Feedback abgeben</button>
      </div>
    </div>`;

  if (releaseId && currentUser && getReleaseSeenTag() !== releaseId) {
    currentUser.release_seen_tag = releaseId;
    syncProfile();
  }
  return release;
}

async function loadWhatsNew(options = {}) {
  const listEl = document.getElementById('wn-list');
  const contentEl = document.getElementById('wn-content');
  if (!listEl || !contentEl) return null;
  listEl.innerHTML = `<div class="wn-empty" style="display:flex;align-items:center;justify-content:center;min-height:140px">${makeLoadingHTML("Lade What's New...", undefined, 'loading')}</div>`;
  contentEl.innerHTML = makeLoadingHTML("Lade What's New...", undefined, 'loading');
  try {
    const releases = options.releases || await fetchReleaseFeed(!!options.force);
    if (!releases.length) {
      renderWhatsNewReleaseList([], '');
      contentEl.innerHTML = `
        <div class="k-card-sm" style="text-align:center;padding:24px">
          <div class="k-section-title">What's new</div>
          <div style="font-size:12px;color:var(--muted)">Keine veröffentlichte Release-Version gefunden.</div>
        </div>`;
      return null;
    }
    const activeTag = options.releaseTag || latestReleaseSelectedTag || getStoredWhatsNewTag() || getReleaseTag(releases[0]);
    latestReleaseSelectedTag = activeTag;
    setStoredWhatsNewTag(activeTag);
    renderWhatsNewReleaseList(releases, activeTag);
    const activeRelease = releases.find(r => getReleaseTag(r) === activeTag) || releases[0];
    if (!activeRelease) return null;
    return renderWhatsNewReleaseDetail(activeRelease);
  } catch (e) {
    const errMsg = e.message || 'Unbekannter Fehler';
    listEl.innerHTML = '<div class="wn-empty">Fehler beim Laden</div>';
    contentEl.innerHTML = `
      <div class="k-card-sm" style="text-align:center;padding:24px">
        <div class="k-section-title">What's new</div>
        <div style="font-size:12px;color:var(--danger);margin-bottom:10px">Release-Notizen konnten nicht geladen werden.</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:12px">Fehler: ${escapeHtml(errMsg)}</div>
        <button class="btn btn-sm btn-lime" onclick="loadWhatsNew({force:true})">Erneut versuchen</button>
      </div>`;
    return null;
  }
}

function openWhatsNewRelease(tag) {
  if (!tag) return;
  latestReleaseSelectedTag = tag;
  setStoredWhatsNewTag(tag);
  loadWhatsNew({ releaseTag: tag });
}

function openWhatsNewPanel(options = {}) {
  if (!currentUser) {
    openModal('auth-modal');
    return;
  }
  closeFriendPanel();
  document.getElementById('wn-overlay')?.classList.add('open');
  document.getElementById('wn-panel')?.classList.add('open');
  loadWhatsNew(options);
}

function closeWhatsNewPanel() {
  document.getElementById('wn-overlay')?.classList.remove('open');
  document.getElementById('wn-panel')?.classList.remove('open');
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
  closeWhatsNewPanel();
  document.getElementById('fp-overlay').classList.add('open');
  document.getElementById('fp-panel').classList.add('open');
  loadFriendPanel();
}
function closeFriendPanel() {
  document.getElementById('fp-overlay').classList.remove('open');
  document.getElementById('fp-panel').classList.remove('open');
}
function switchFpTab(tab, opts = {}) {
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



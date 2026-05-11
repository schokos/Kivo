// ── COURSE HUB ─────────────────────────────────────────────────
function poolCountForLang(lang){return Object.keys(POOLS[lang]||{}).length;}
function courseIconForLang(lang){
  const key = String(lang || '').toLowerCase();
  if(key.includes('engl')) return '🇬🇧';
  if(key.includes('deut')) return '🇩🇪';
  if(key.includes('span')) return '🇪🇸';
  if(key.includes('franz')) return '🇫🇷';
  if(key.includes('ital')) return '🇮🇹';
  if(key.includes('portug')) return '🇵🇹';
  if(key.includes('japan')) return '🇯🇵';
  if(key.includes('korea')) return '🇰🇷';
  if(key.includes('china') || key.includes('mandarin')) return '🇨🇳';
  if(key.includes('mathe')) return '📐';
  if(key.includes('bio')) return '🧬';
  if(key.includes('chem')) return '⚗️';
  if(key.includes('phys')) return '🔭';
  return '📘';
}
function renderCourses() {
  const el=document.getElementById('courses-content'); if(!el)return;
  const langs=Object.keys(POOLS);
  if(!selectedCourseLang||!POOLS[selectedCourseLang]) selectedCourseLang=langs[0]||null;
  if(!langs.length){el.innerHTML=`<div class="k-card" style="text-align:center;padding:42px"><div style="font-size:42px;margin-bottom:12px">▣</div><div style="font-size:14px;font-weight:800;margin-bottom:8px">Noch keine Kurse</div><div style="font-size:11px;color:var(--muted);margin-bottom:14px">Erstelle zuerst einen eigenen Pool.</div><button class="btn btn-lime btn-sm" onclick="openNewPoolModal()">+ Kurs erstellen</button></div>`;return;}
  const langCards=langs.map((lang)=>`<div class="language-card ${lang===selectedCourseLang?'active':''}" onclick="selectCourseLang('${lang.replace(/'/g,"\\'")}')"><div style="font-size:30px;margin-bottom:18px">${courseIconForLang(lang)}</div><div class="tile-title">${lang}</div><div class="tile-sub">${poolCountForLang(lang)} Pool${poolCountForLang(lang)===1?'':'s'}</div></div>`).join('');
  const pools=Object.entries(POOLS[selectedCourseLang]||{});
  const poolCards=pools.map(([pname,poolObj])=>{const key=mkKey(selectedCourseLang,pname);const flat=flattenPool(poolObj);const pct=flat.length?Math.round(getKnownIds(key).length/flat.length*100):0;return `<div class="learn-card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:10px"><div><div style="font-size:14px;font-weight:850">${pname}</div><div class="tile-sub">${flat.length} Vokabeln · ${pct}% gelernt</div></div>${key===activeKey?'<span class="tag lime">Aktiv</span>':''}</div><div class="daily-goal-bar"><div class="daily-goal-fill" style="width:${pct}%"></div></div><div class="btn-row"><button class="btn btn-lime btn-sm" onclick="setActivePool('${key}');goTo('cards')">Karteikarten</button><button class="btn btn-sm" onclick="setActivePool('${key}');goTo('quiz')">Quiz</button><button class="btn btn-sm" onclick="setActivePool('${key}');goTo('typing')">Tippen</button><button class="btn btn-sm" onclick="setActivePool('${key}');goTo('matching')">Zuordnen</button><button class="btn btn-ghost btn-sm" onclick="setActivePool('${key}');goTo('gap')">KI</button></div></div>`}).join('');
  el.innerHTML=`<div class="language-grid">${langCards}</div><div class="course-grid-head"><div style="font-size:18px;font-weight:900">${selectedCourseLang||'Kurse'} lernen</div><button class="btn btn-ghost btn-sm" onclick="goTo('overview')">Pools bearbeiten</button></div><div class="learning-grid">${poolCards}</div>`;
}
function selectCourseLang(lang){selectedCourseLang=lang;renderCourses();}



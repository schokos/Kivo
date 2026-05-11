// â”€â”€ STATISTICS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderStats() {
  const el=document.getElementById('stats-content'); if(!el)return;
  const streak=calcStreak(), totalXp=getTotalXp(), xpData=lsGet('kivo_xp','{}');
  const t=vocab.length, k=vocab.filter(v=>v.known).length;
  const heatCells=[];
  const today=new Date();
  for(let i=83;i>=0;i--){
    const d=new Date(today);d.setDate(d.getDate()-i);
    const key=d.toISOString().slice(0,10); const pts=xpData[key]||0;
    let lvl=pts>=100?4:pts>=50?3:pts>=20?2:pts>0?1:0;
    heatCells.push(`<div class="hm-cell l${lvl}" title="${key}: ${pts} XP"></div>`);
  }
  let poolRows='';
  for(const[lang,pools] of Object.entries(POOLS)) for(const[pname,poolObj] of Object.entries(pools)){
    const key=mkKey(lang,pname); const flat=flattenPool(poolObj); const kn=getKnownIds(key).length;
    const pct=flat.length?Math.round(kn/flat.length*100):0; const due=srDueCount(key);
    poolRows+=`<div class="pool-prog-row"><span class="ppr-name">${pname}</span>${due>0?`<span class="sr-badge">${due} fÃ¤llig</span>`:''}<div class="ppr-bar"><div class="ppr-fill" style="width:${pct}%"></div></div><span class="ppr-pct">${pct}%</span></div>`;
  }
  const avg=sessions.length?Math.round(sessions.reduce((a,s)=>a+s.pct,0)/sessions.length):0;
  el.innerHTML=`
    <div class="stats-grid">
      <div class="stat-box"><div style="margin-bottom:3px;color:var(--orange)">${ic(streak>=3?'flame':'calendar',22)}</div><div class="stat-big" style="color:var(--orange)">${streak}</div><div class="stat-lbl">Streak</div></div>
      <div class="stat-box"><div style="margin-bottom:3px;color:var(--lime)">${ic('zap',22)}</div><div class="stat-big" style="color:var(--lime)">${totalXp.toLocaleString()}</div><div class="stat-lbl">XP</div></div>
      <div class="stat-box"><div style="margin-bottom:3px;color:var(--lime)">${ic('check',22)}</div><div class="stat-big" style="color:var(--lime)">${k}</div><div class="stat-lbl">Gekonnt</div></div>
      <div class="stat-box"><div style="margin-bottom:3px">${ic('book',22)}</div><div class="stat-big">${t}</div><div class="stat-lbl">Gesamt</div></div>
      <div class="stat-box"><div style="margin-bottom:3px;color:var(--blue)">${ic('target',22)}</div><div class="stat-big" style="color:var(--blue)">${avg}%</div><div class="stat-lbl">Ã˜ Quiz</div></div>
      <div class="stat-box"><div style="margin-bottom:3px;color:var(--purple)">${ic('rocket',22)}</div><div class="stat-big" style="color:var(--purple)">${sessions.length}</div><div class="stat-lbl">Sessions</div></div>
    </div>
    <div class="k-card" style="margin-bottom:12px">
      <div class="k-section-title">LernaktivitÃ¤t (12 Wochen)</div>
      <div class="hm-wrap">${heatCells.join('')}</div>
      <div style="display:flex;gap:4px;align-items:center;margin-top:8px;font-size:9px;color:var(--muted)">wenig <div class="hm-cell"></div><div class="hm-cell l1"></div><div class="hm-cell l2"></div><div class="hm-cell l3"></div><div class="hm-cell l4"></div> viel</div>
    </div>
    <div class="k-card" style="margin-bottom:12px">
      <div class="k-section-title">Pool-Fortschritt</div>
      ${poolRows||'<div style="font-size:11px;color:var(--muted)">Noch keine Pools</div>'}
    </div>
    ${sessions.length?`<div class="k-card"><div class="k-section-title">Quiz-Verlauf (letzte ${Math.min(10,sessions.length)} Sessions)</div><div style="display:flex;align-items:flex-end;gap:4px;height:50px;margin-top:8px">${sessions.slice(-10).map(s=>{const h=Math.max(8,Math.round(s.pct/100*44));return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px"><div style="width:100%;border-radius:3px 3px 0 0;height:${h}px;background:${s.pct>=70?'var(--lime)':s.pct>=40?'var(--orange)':'var(--danger)'};min-height:3px"></div><div style="font-size:8px;color:var(--muted)">${s.pct}%</div></div>`;}).join('')}</div></div>`:''}`;
}


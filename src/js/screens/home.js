function updateHomeStats() {
  const t=vocab.length, k=vocab.filter(v=>v.known).length;
  // Daily-Quest-Fortschritt fÃ¼r Dashboard-Karte
  const dDone=dailyQuestsDone();
  const dTotal=DAILY_QUESTS.length;
  document.getElementById('hm-k').textContent=dDone;
  document.getElementById('hm-t').textContent=dTotal;
  document.getElementById('hm-bar').style.width=Math.round(dDone/dTotal*100)+'%';
  document.getElementById('hm-sr').textContent=srDueCount(activeKey);
  const s=calcStreak();
  const xpTotal=getTotalXp();
  const level=Math.max(1,Math.floor(xpTotal/500)+1);
  const levelStart=(level-1)*500, next=level*500, levelPct=Math.round((xpTotal-levelStart)/(next-levelStart)*100);
  document.getElementById('hm-streak-top').textContent=s;
  document.getElementById('hm-xp').textContent=xpTotal.toLocaleString();
  document.getElementById('hm-level').textContent=level;
  document.getElementById('hm-next-xp').textContent=next.toLocaleString();
  document.getElementById('hm-ring').style.setProperty('--ring-pct',Math.max(4,levelPct)+'%');
  document.getElementById('currency-val-home').textContent=userCurrency;
  document.getElementById('home-user-name').textContent=currentUser?.username||'Lerner';
  // Heute gesammelte XP (nur Anzeige)
  const today=new Date().toISOString().slice(0,10);
  const xpData=lsGet('kivo_xp','{}');
  const todayXp=xpData[today]||0;
  const lbl=document.getElementById('hm-goal-lbl'); if(lbl) lbl.textContent=todayXp+' XP heute';
  // Pool-Fortschrittsbalken (Aktueller Pool)
  const poolPct=t>0?Math.round(k/t*100):0;
  const poolBar=document.getElementById('daily-goal-fill'); if(poolBar) poolBar.style.width=poolPct+'%';
  // Sessions mini
  const rec=sessions.slice(-5);
  document.getElementById('hm-sessions').innerHTML=rec.length?rec.map(s=>`<span style="margin-right:6px">${s.pct}% (${s.ok}âœ“)</span>`).join(''):'Noch keine Sessions';
}

function saveDailyGoal(){ /* deprecated */ }


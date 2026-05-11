// â”€â”€ DAILY / WEEKLY QUESTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Trackt Lernfortschritt pro Tag/Woche. Quests sind feste Ziele, die durch
// normale Lernaktionen erfÃ¼llt werden (kein extra Klick nÃ¶tig).
// Belohnungen werden EINMAL pro Quest-Periode automatisch ausgezahlt.
const DAILY_QUESTS = [
  {id:'q_cards',  icon:'cards',  name:'10 Karten lernen',     target:10, metric:'cards',   xp:15, coins:5},
  {id:'q_quiz',   icon:'target', name:'Quiz oder Tipp-Runde', target:1,  metric:'sessions',xp:20, coins:8},
  {id:'q_streak', icon:'flame',  name:'Heute aktiv lernen',   target:5,  metric:'xp',      xp:10, coins:5},
];
const WEEKLY_QUESTS = [
  {id:'wq_xp',      icon:'trophy', name:'250 XP sammeln',           target:250, metric:'xp',      xp:50, coins:25},
  {id:'wq_sess',    icon:'book',   name:'5 Lern-Sessions',          target:5,   metric:'sessions',xp:40, coins:20},
  {id:'wq_streak',  icon:'zap',    name:'5-Tage-Streak',            target:5,   metric:'streak',  xp:60, coins:30},
];
function _todayKey(){ return new Date().toISOString().slice(0,10); }
function _weekKey(){
  const d=new Date(); const onejan=new Date(d.getFullYear(),0,1);
  const week=Math.ceil(((d-onejan)/86400000+onejan.getDay()+1)/7);
  return d.getFullYear()+'-W'+String(week).padStart(2,'0');
}
function getQuestState(){
  const raw=lsGet('kivo_quests','{}');
  const tk=_todayKey(), wk=_weekKey();
  if(raw.day!==tk) raw.daily={cards:0,sessions:0,xp:0,claimed:[]}, raw.day=tk;
  if(raw.week!==wk) raw.weekly={cards:0,sessions:0,xp:0,claimed:[]}, raw.week=wk;
  return raw;
}
function saveQuestState(s){ lsSet('kivo_quests',s); }
function questProgress(q, scope){
  const s=getQuestState();
  if(q.metric==='streak') return Math.min(q.target, calcStreak());
  return Math.min(q.target, (scope==='weekly'?s.weekly:s.daily)[q.metric]||0);
}
function trackQuest(metric, amount=1){
  const s=getQuestState();
  s.daily[metric]=(s.daily[metric]||0)+amount;
  s.weekly[metric]=(s.weekly[metric]||0)+amount;
  saveQuestState(s);
  // auto-claim
  [...DAILY_QUESTS.map(q=>['daily',q]),...WEEKLY_QUESTS.map(q=>['weekly',q])].forEach(([scope,q])=>{
    const claimed=(scope==='weekly'?s.weekly.claimed:s.daily.claimed)||[];
    if(claimed.includes(q.id)) return;
    if(questProgress(q,scope)>=q.target){
      claimed.push(q.id);
      if(scope==='weekly') s.weekly.claimed=claimed; else s.daily.claimed=claimed;
      saveQuestState(s);
      // belohnen (XP via addXp, MÃ¼nzen direkt)
      if(q.coins){ userCurrency+=q.coins; lsSet('kivo_currency',userCurrency); syncProfile(); updateCurrencyDisplay(); }
      if(q.xp){ addXp(q.xp,'quest'); }
      toast(`${ic('check',13)} Quest: ${q.name} (+${q.xp} XP, +${q.coins} ${ic('coin',13)})`);
    }
  });
  updateHomeStats();
  if(document.getElementById('screen-challenges')?.classList.contains('active')) renderChallenges();
}
function dailyQuestsDone(){
  const s=getQuestState();
  return DAILY_QUESTS.filter(q=>questProgress(q,'daily')>=q.target).length;
}


// â”€â”€ CHALLENGE HUB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderChallenges(){
  const el=document.getElementById('challenges-content'); if(!el)return;
  const renderQuest=(q,scope)=>{
    const prog=questProgress(q,scope);
    const done=prog>=q.target;
    const pct=Math.round(prog/q.target*100);
    return `<div class="quest-row" style="${done?'opacity:.7':''}">
      <div class="quest-icon" style="color:var(--lime)">${ic(q.icon,22)}</div>
      <div style="flex:1">
        <div class="f-name">${q.name}</div>
        <div class="f-pts">${prog} / ${q.target} ${done?`Â· ${ic('check',11)} erledigt`:''}</div>
        <div class="daily-goal-bar" style="margin-top:6px"><div class="daily-goal-fill" style="width:${pct}%"></div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
        <span class="tag lime">+${q.xp} XP</span>
        <span class="tag orange">+${q.coins} ${ic('coin',11)}</span>
      </div>
    </div>`;
  };
  const dDone=dailyQuestsDone();
  el.innerHTML=`
    <div class="quest-grid">
      <div class="k-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="font-size:17px;font-weight:850;display:flex;align-items:center;gap:8px;color:var(--text)"><span style="color:var(--lime)">${ic('target',18)}</span> Daily Quests</div>
          <span class="tag ${dDone===DAILY_QUESTS.length?'lime':''}">${dDone} / ${DAILY_QUESTS.length}</span>
        </div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:10px">Reset um Mitternacht. Belohnungen werden automatisch ausgezahlt.</div>
        ${DAILY_QUESTS.map(q=>renderQuest(q,'daily')).join('')}
        <button class="btn btn-lime" style="width:100%;margin-top:14px" onclick="goTo('courses')">Jetzt lernen</button>
      </div>
      <div class="k-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="font-size:17px;font-weight:850;display:flex;align-items:center;gap:8px;color:var(--text)"><span style="color:var(--orange)">${ic('trophy',18)}</span> Weekly Quests</div>
          <span class="tag">Diese Woche</span>
        </div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:10px">GrÃ¶ÃŸere Belohnungen â€” eine Woche Zeit.</div>
        ${WEEKLY_QUESTS.map(q=>renderQuest(q,'weekly')).join('')}
      </div>
    </div>`;
}


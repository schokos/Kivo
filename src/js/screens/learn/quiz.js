// ── QUIZ ──────────────────────────────────────────────────────
function startQuiz() {
  qDeck=shuf(vocab); qIdx=0; qOk=0; qNo=0;
  renderQuiz();
}
function renderQuiz() {
  const el=document.getElementById('quiz-area');
  if(qIdx>=qDeck.length){endQuiz();return;}
  const v=qDeck[qIdx];
  const d2e=document.getElementById('quiz-d2e')?.checked;
  const q=d2e?v.de:v.en, correct=d2e?v.en:v.de;
  const others=shuf(vocab.filter(x=>x.id!==v.id)).slice(0,3).map(x=>d2e?x.en:x.de);
  const opts=shuf([correct,...others]);
  const pct=Math.round(qIdx/qDeck.length*100);
  el.innerHTML=`
    <div class="quiz-hdr">
      <div style="font-size:11px;color:var(--muted)">Frage ${qIdx+1} / ${qDeck.length}</div>
      <div class="quiz-scores"><span style="color:var(--lime)">✓ ${qOk}</span> <span style="color:var(--danger)">✗ ${qNo}</span></div>
    </div>
    <div class="quiz-progress"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
    <div class="quiz-q-text">${q}</div>
    <div class="quiz-opts">${opts.map(o=>`<button class="quiz-opt" onclick="answerQuiz('${esc(o)}','${esc(correct)}',this)">${o}</button>`).join('')}</div>
    <div class="quiz-fb" id="quiz-fb"></div>
    <div style="display:flex;gap:8px"><button class="btn btn-sm" onclick="startQuiz()">↺ Neu</button></div>`;
}
function answerQuiz(chosen,correct,btn) {
  document.querySelectorAll('.quiz-opt').forEach(b=>b.disabled=true);
  const v=qDeck[qIdx];
  if(chosen===correct) {
    btn.classList.add('good'); qOk++;
    document.getElementById('quiz-fb').textContent='✓ Richtig!';
    document.getElementById('quiz-fb').style.color='var(--lime)';
    v.known=true; vocab[v.id].known=true; saveKnown(); updateHomeStats();
    srUpdate(activeKey,v.id,4);
  } else {
    btn.classList.add('bad');
    document.querySelectorAll('.quiz-opt').forEach(b=>{if(b.textContent===correct.replace(/_/g,' ')||b.onclick?.toString().includes(correct))b.classList.add('good');});
    qNo++; document.getElementById('quiz-fb').textContent='✗ Richtig: '+correct.replace(/_/g,' ');
    document.getElementById('quiz-fb').style.color='var(--danger)';
    mistakeLog[v.de]=(mistakeLog[v.de]||0)+1; lsSet('kivo_ml',mistakeLog);
    srUpdate(activeKey,v.id,1);
  }
  setTimeout(()=>{qIdx++;renderQuiz();},900);
}
function endQuiz() {
  const el=document.getElementById('quiz-area');
  const pct=qDeck.length?Math.round(qOk/qDeck.length*100):0;
  sessions.push({ok:qOk,no:qNo,n:qDeck.length,pct}); lsSet('kivo_sess',sessions); trackQuest('sessions',1);
  el.innerHTML=`
    <div class="quiz-result">
      <div class="big-score" style="color:${pct>=70?'var(--lime)':pct>=40?'var(--orange)':'var(--danger)'}">${pct}%</div>
      <div style="margin:10px 0;font-size:14px;color:var(--muted)">${qOk} richtig · ${qNo} falsch · ${qDeck.length} gesamt</div>
      <div style="font-size:13px;margin-bottom:18px;color:var(--lime)">+${qOk*5} XP verdient!</div>
      <button class="btn btn-lime" onclick="startQuiz()">↺ Nochmal</button>
      <button class="btn btn-sm" style="margin-left:8px" onclick="goTo('stats')">📊 Statistiken</button>
    </div>`;
  updateHomeStats();
}



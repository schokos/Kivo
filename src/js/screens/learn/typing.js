// â”€â”€ TYPING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function startTyping() {
  tDeck=shuf(vocab); tIdx=0; tOk=0; tNo=0; renderTyping();
}
function renderTyping() {
  const el=document.getElementById('typing-area');
  if(tIdx>=tDeck.length){endTyping();return;}
  const v=tDeck[tIdx];
  el.innerHTML=`
    <div style="font-size:10px;color:var(--muted);margin-bottom:8px">Frage ${tIdx+1} / ${tDeck.length} Â· âœ“ ${tOk} âœ— ${tNo}</div>
    <div class="t-word">${v.de}</div>
    <input class="t-input" id="t-inp" placeholder="Englische Ãœbersetzung..." autocomplete="off" spellcheck="false" onkeydown="if(event.key==='Enter')checkTyping()">
    <div class="t-hint" id="t-hint"></div>
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn btn-sm" onclick="showTypingHint()">ðŸ’¡ Tipp</button>
      <button class="btn btn-lime btn-sm" onclick="checkTyping()">PrÃ¼fen âœ“</button>
      <button class="btn btn-sm" onclick="tIdx++;renderTyping()">Ãœberspringen â†’</button>
    </div>`;
  setTimeout(()=>document.getElementById('t-inp')?.focus(),50);
}
function showTypingHint() {
  const v=tDeck[tIdx]; const hint=v.en.slice(0,Math.max(1,Math.ceil(v.en.length*.4)))+'â€¦';
  document.getElementById('t-hint').textContent='ðŸ’¡ '+hint; document.getElementById('t-hint').style.color='var(--muted)';
}
function checkTyping() {
  const inp=document.getElementById('t-inp'); if(!inp)return;
  const v=tDeck[tIdx]; const val=inp.value.trim().toLowerCase(); const ans=v.en.toLowerCase().trim();
  const ok=val===ans||levenshtein(val,ans)<=Math.floor(ans.length*.2);
  if(ok){
    inp.className='t-input t-ok'; document.getElementById('t-hint').textContent='âœ“ Richtig!'; document.getElementById('t-hint').style.color='var(--lime)';
    tOk++; v.known=true; vocab[v.id].known=true; saveKnown(); updateHomeStats(); srUpdate(activeKey,v.id,4);
  } else {
    inp.className='t-input t-no'; document.getElementById('t-hint').textContent='âœ— Richtig: '+v.en; document.getElementById('t-hint').style.color='var(--danger)';
    tNo++; mistakeLog[v.de]=(mistakeLog[v.de]||0)+1; lsSet('kivo_ml',mistakeLog); srUpdate(activeKey,v.id,1);
  }
  setTimeout(()=>{tIdx++;renderTyping();},1000);
}
function endTyping() {
  const el=document.getElementById('typing-area');
  const pct=tDeck.length?Math.round(tOk/tDeck.length*100):0;
  sessions.push({ok:tOk,no:tNo,n:tDeck.length,pct}); lsSet('kivo_sess',sessions); trackQuest('sessions',1);
  el.innerHTML=`<div class="quiz-result">
    <div class="big-score" style="color:${pct>=70?'var(--lime)':pct>=40?'var(--orange)':'var(--danger)'}">${pct}%</div>
    <div style="margin:10px 0;font-size:14px;color:var(--muted)">${tOk} richtig Â· ${tNo} falsch</div>
    <div style="color:var(--lime);font-size:13px;margin-bottom:18px">+${tOk*5} XP!</div>
    <button class="btn btn-lime" onclick="startTyping()">â†º Nochmal</button></div>`;
  updateHomeStats();
}
function levenshtein(a,b) {
  const m=a.length,n=b.length; const dp=Array.from({length:m+1},(_,i)=>[i,...Array(n).fill(0)]);
  for(let j=0;j<=n;j++)dp[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}


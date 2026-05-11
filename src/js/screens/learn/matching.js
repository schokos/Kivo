// â”€â”€ MATCHING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function startMatch() {
  mFound = 0; 
  mSel = null;
  const el = document.getElementById('matching-area');
  const picks = shuf(vocab).slice(0, 8);
  
  document.getElementById('mc-tot').textContent = picks.length;
  document.getElementById('mc-cnt').textContent = 0;

  const leftSide = shuf(picks.map(v => ({ ...v, _side: 'de' })));
  const rightSide = shuf(picks.map(v => ({ ...v, _side: 'en' })));

  mPairs = [...leftSide, ...rightSide];

  const leftColumnHtml = leftSide.map((v, i) => 
    `<button class="match-card" id="mc-${i}" onclick="pickMatch(${i})">${v.de}</button>`
  ).join('');

  const rightColumnHtml = rightSide.map((v, i) => {
    const globalIndex = i + leftSide.length;
    return `<button class="match-card" id="mc-${globalIndex}" onclick="pickMatch(${globalIndex})">${v.en}</button>`;
  }).join('');

  el.innerHTML = `
    <div class="match-container">
      <div class="match-column">${leftColumnHtml}</div>
      <div class="match-column">${rightColumnHtml}</div>
    </div>
  `;
}
function pickMatch(i) {
  const v=mPairs[i]; const el=document.getElementById('mc-'+i);
  if(el.classList.contains('mm')) return;
  if(mSel && mSel.idx===i) { el.classList.remove('ms'); mSel=null; return; }
  if(!mSel) { el.classList.add('ms'); mSel={v,el,idx:i}; return; }
  if(mSel.v.id===v.id && mSel.v._side!==v._side) {
    el.classList.add('mm'); mSel.el.classList.add('mm'); el.classList.remove('ms');
    mFound++; document.getElementById('mc-cnt').textContent=mFound;
    addXp(5); srUpdate(activeKey,v.id,4);
    mSel=null;
    if(mFound===mPairs.length/2) setTimeout(()=>{toast('ðŸŽ‰ Alle Paare! +'+mPairs.length/2*5+' XP');startMatch();},600);
  } else {
    el.classList.add('mw'); mSel.el.classList.add('mw');
    setTimeout(()=>{el.classList.remove('mw','ms');mSel.el.classList.remove('mw','ms');mSel=null;},600);
  }
}



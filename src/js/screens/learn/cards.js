// â”€â”€ SPACED REPETITION (SM-2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const srKey=(pk,id)=>'kivo_sr_'+esc(pk)+'_'+id;
function srGet(pk,id) { return lsGet(srKey(pk,id),'{"ef":2.5,"interval":1,"due":0,"reps":0}'); }
function srUpdate(pk,id,quality,awardXp=true) {
  let {ef,interval,reps}=srGet(pk,id);
  if(quality<3){reps=0;interval=1;}
  else{if(reps===0)interval=1;else if(reps===1)interval=6;else interval=Math.round(interval*ef);reps++;ef=Math.max(1.3,ef+0.1-(5-quality)*(0.08+(5-quality)*0.02));}
  lsSet(srKey(pk,id),{ef,interval,due:Date.now()+interval*86400000,reps});
  if(awardXp) addXp(quality>=3?5:1);
  trackQuest('cards',1);
}
function srDueCount(pk) {
  const flat=flattenPool(getPoolObj(pk));
  return flat.filter((_,i)=>srGet(pk,i).due<=Date.now()).length;
}

// â”€â”€ FLASHCARDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initCards() {
  const skip=document.getElementById('skip-known')?.checked;
  cDeck=shuf(vocab.filter(v=>!skip||!v.known));
  cIdx=0; cFlipped=false;
  if(!cDeck.length){document.getElementById('screen-cards').innerHTML+='';toast('Keine Karten!');return;}
  renderCard();
}
function renderCard() {
  if(!cDeck.length)return;
  const v=cDeck[cIdx]; cFlipped=false;
  const fc=document.getElementById('fc'); fc.classList.remove('flipped');
  document.getElementById('fc-front-word').textContent=v.de;
  document.getElementById('fc-back-word').textContent=v.en;
  document.getElementById('fc-cat-hint').textContent=v.cat||'';
  document.getElementById('fc-counter').textContent=(cIdx+1)+' / '+cDeck.length;
  document.getElementById('fc-prog').style.width=Math.round((cIdx+1)/cDeck.length*100)+'%';
  document.getElementById('fc-btns').style.display='none';
}
function flipCard() {
  cFlipped=!cFlipped;
  document.getElementById('fc').classList.toggle('flipped',cFlipped);
  document.getElementById('fc-btns').style.display=cFlipped?'flex':'none';
}
function navCard(dir) {
  cIdx=Math.max(0,Math.min(cDeck.length-1,cIdx+dir));
  cFlipped=false; renderCard();
}
function setKnown(val) {
  if(!cDeck.length) return;
  const cur=cDeck[cIdx]; cur.known=val; vocab[cur.id].known=val;
  saveKnown(); updateHomeStats(); toast(val?'âœ“ Gekonnt!':'âœ— Nicht gekonnt');
  srUpdate(activeKey,cur.id,val?4:1,false); // no XP for flashcards
  if(cIdx<cDeck.length-1) { cIdx++; renderCard(); }
  else toast('ðŸŽ‰ Alle Karten durch!');
}


import{ENEMIES}from'./combat.js';
import{decorateItemElement}from'./item-rarity.js';

const view=document.querySelector('#view');
const openAreas=new Map([['Greenvale',true]]);
const clampPortrait=n=>Math.max(1,Math.min(25,Math.round(Number(n)||1)));
const portraitPath=n=>`assets/character_portrait_${String(clampPortrait(n)).padStart(2,'0')}.png`;

function collectionProgress(g){
  const total=ENEMIES.reduce((sum,enemy)=>sum+g.collectionItems(enemy).length,0);
  const acquired=ENEMIES.reduce((sum,enemy)=>sum+g.collectionObtainedCount(enemy),0);
  return{acquired,total};
}

function fixHome(g){
  const avatar=view.querySelector('.home-avatar');
  if(avatar){
    const index=clampPortrait(g.state.portraitIndex),src=portraitPath(index);
    if(avatar.dataset.homePortrait!==String(index)){
      avatar.dataset.homePortrait=String(index);
      avatar.innerHTML=`<img src="${src}" alt="${String(g.state.playerName||'Adventurer').replace(/["<>]/g,'')} portrait">`;
    }
  }
  view.querySelectorAll('.home-equip-slot:not(.empty)').forEach(slot=>{
    const title=slot.title||'';
    const split=title.indexOf(':');
    const itemName=split>=0?title.slice(split+1).trim():'';
    if(itemName)decorateItemElement(slot,itemName);
  });
}

function fixCollection(g){
  const panel=[...view.querySelectorAll('.panel')].find(p=>p.querySelector('h2')?.textContent==='Collection Log');
  if(panel){
    const{acquired,total}=collectionProgress(g),cards=[...panel.querySelectorAll('.collection-summary .card')];
    if(cards[1]){
      const strong=cards[1].querySelector('strong'),small=cards[1].querySelector('small');
      if(strong)strong.textContent=`${acquired.toLocaleString()} / ${total.toLocaleString()}`;
      if(small)small.textContent='Collections acquired';
    }
    if(cards[2]){
      const strong=cards[2].querySelector('strong'),small=cards[2].querySelector('small');
      if(strong)strong.textContent=g.completedCollections().toLocaleString();
      if(small)small.textContent='Enemy logs complete';
    }
  }
  view.querySelectorAll('details.collection-area').forEach(details=>{
    const name=details.querySelector('.collection-area-title strong')?.textContent?.trim();
    if(!name)return;
    if(!openAreas.has(name))openAreas.set(name,details.open);
    else if(details.open!==openAreas.get(name))details.open=openAreas.get(name);
    if(details.dataset.persistOpen==='1')return;
    details.dataset.persistOpen='1';
    details.addEventListener('toggle',()=>openAreas.set(name,details.open));
  });
}

function fixLanding(g){
  const{acquired,total}=collectionProgress(g);
  document.querySelectorAll('.landing-stat').forEach(row=>{
    const label=row.querySelector('span'),value=row.querySelector('strong');
    if(label?.textContent?.trim()==='Collection Log'||label?.textContent?.trim()==='Collections Acquired'){
      label.textContent='Collections Acquired';
      if(value)value.textContent=`${acquired.toLocaleString()} / ${total.toLocaleString()}`;
    }
  });
}

let queued=false;
function queue(){
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;const g=window.__elderwildGame;if(!g)return;fixHome(g);fixCollection(g);fixLanding(g)});
}
new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});
window.addEventListener('elderwild-game-state',queue);
window.addEventListener('elderwild-portrait-changed',queue);
window.addEventListener('pageshow',queue);
queue();

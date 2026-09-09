import{ENEMIES}from'./combat.js';

const style=document.createElement('style');
style.textContent=`.equipment-item-button.rarity-item{box-shadow:none!important}`;
document.head.append(style);

const view=document.querySelector('#view');
function fixCollectionProgress(){
  const g=window.__elderwildGame;if(!g)return;
  const panel=[...view.querySelectorAll('.panel')].find(p=>p.querySelector('h2')?.textContent==='Collection Log');
  const value=panel?.querySelector('.collection-summary .card:nth-child(2) strong');
  if(!value)return;
  const total=ENEMIES.reduce((sum,enemy)=>sum+g.collectionItems(enemy).length,0);
  const found=ENEMIES.reduce((sum,enemy)=>sum+g.collectionObtainedCount(enemy),0);
  const text=`${found} / ${total}`;
  if(value.textContent!==text)value.textContent=text;
}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;fixCollectionProgress()})}
new MutationObserver(queue).observe(view,{childList:true,subtree:true});
window.addEventListener('elderwild-game-state',queue);
window.addEventListener('pageshow',queue);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)queue()});
queue();

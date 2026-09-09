import{ENEMIES,enemyAttackSpeed,traitDescription}from'./combat.js';
import{makeSprite}from'./sprite-ui.js';
import{decorateItemElement}from'./item-rarity.js';

const view=document.querySelector('#view');
const game=()=>window.__elderwildGame;
const combatLevel=e=>Math.max(1,Math.floor((e.attack+e.strength+e.defense+e.hp)/4));
const style=document.createElement('style');
style.textContent=`
.enemy-select-card{display:grid!important;gap:9px!important;padding:10px!important;background:linear-gradient(180deg,#1d2521ef,#111713f5)!important}
.enemy-select-head{display:grid;grid-template-columns:54px minmax(0,1fr) auto;gap:10px;align-items:center}.enemy-select-art{width:54px;height:54px;display:grid;place-items:center;border:1px solid #40584a;border-radius:8px;background:#0d1310;overflow:hidden}.enemy-select-art .game-sprite{transform:scale(1.55);image-rendering:pixelated}.enemy-select-title strong{display:block;font-size:15px;color:#edf4ef}.enemy-select-title small{display:block;margin-top:2px;color:#97a59d;font-size:10px}.enemy-select-level{text-align:right}.enemy-select-level strong{display:block;color:#72d88d;font-size:18px}.enemy-select-level small{font-size:9px;color:#8d9a92;text-transform:uppercase}.enemy-select-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}.enemy-select-stat{padding:5px 3px;text-align:center;border:1px solid #30443a;border-radius:6px;background:#0f1512}.enemy-select-stat strong{display:block;font-size:12px}.enemy-select-stat small{display:block;font-size:8px;color:#8e9b93;text-transform:uppercase}.enemy-select-meta{display:flex;flex-wrap:wrap;gap:5px}.enemy-select-chip{padding:3px 6px;border:1px solid #3b5144;border-radius:999px;background:#101713;color:#a7b5ab;font-size:9px}.enemy-select-chip.accent{border-color:#50765d;color:#8de9a7}.enemy-select-drop-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.enemy-select-drop{min-height:56px;padding:5px;border:1px solid #30443a;border-radius:6px;background:#0d1310;text-align:center;display:grid;place-items:center;gap:2px}.enemy-select-drop .game-sprite{width:27px;height:27px}.enemy-select-drop strong{font-size:8px;line-height:1.1;overflow:hidden;text-overflow:ellipsis;max-width:100%}.enemy-select-drop small{font-size:8px;color:#8f9d95}.enemy-select-drop.unknown{background:#090c0a;border-color:#222c26;color:#59645e}.enemy-select-collection{display:flex;justify-content:space-between;gap:8px;font-size:10px;color:#97a59d}.enemy-select-collection strong{color:#dce7df}.enemy-select-card>.enemy-actions{margin-top:0}.enemy-select-card>.enemy-actions button{min-height:38px}@media(max-width:390px){.enemy-select-head{grid-template-columns:46px minmax(0,1fr) auto}.enemy-select-art{width:46px;height:46px}.enemy-select-drop-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
`;
document.head.append(style);

function decorate(){
  const g=game(),c=g?.state?.combat;if(!g||c?.active||c?.respawning)return;
  for(const card of view.querySelectorAll('.area-enemy-list>.activity-card')){
    if(card.dataset.selectionPolished==='1')continue;
    const btn=card.querySelector('[data-enemy]');const name=btn?.dataset.enemy;if(!name)continue;
    const enemy=ENEMIES.find(e=>e.name===name);if(!enemy)continue;
    card.dataset.selectionPolished='1';card.classList.add('enemy-select-card');
    const actions=card.querySelector('.enemy-actions');
    const locked=btn.disabled;
    const head=document.createElement('div');head.className='enemy-select-head';
    const art=document.createElement('div');art.className='enemy-select-art';const spr=makeSprite?.('enemies',enemy.name);if(spr)art.append(spr);else art.textContent=enemy.icon||'•';
    const title=document.createElement('div');title.className='enemy-select-title';title.innerHTML=`<strong>${enemy.name}</strong><small>${locked?'Requirements not met':`${enemyAttackSpeed(enemy)} tick attack · ${(enemyAttackSpeed(enemy)*.6).toFixed(1)}s`}</small>`;
    const lvl=document.createElement('div');lvl.className='enemy-select-level';lvl.innerHTML=`<strong>${combatLevel(enemy)}</strong><small>Combat</small>`;head.append(art,title,lvl);
    const stats=document.createElement('div');stats.className='enemy-select-stats';stats.innerHTML=`<div class="enemy-select-stat"><strong>${enemy.hp}</strong><small>HP</small></div><div class="enemy-select-stat"><strong>${enemy.attack}</strong><small>Atk</small></div><div class="enemy-select-stat"><strong>${enemy.strength}</strong><small>Str</small></div><div class="enemy-select-stat"><strong>${enemy.defense}</strong><small>Def</small></div>`;
    const meta=document.createElement('div');meta.className='enemy-select-meta';meta.innerHTML=`<span class="enemy-select-chip accent">Weak to ${enemy.weakness}</span>${(enemy.traits||[]).length?enemy.traits.map(t=>`<span class="enemy-select-chip" title="${traitDescription(t)}">${t}</span>`).join(''):'<span class="enemy-select-chip">No special traits</span>'}`;
    const drops=document.createElement('div');drops.className='enemy-select-drop-grid';
    for(const drop of enemy.drops.slice(0,8)){
      const known=g.hasDiscoveredItem(drop.item),box=document.createElement('div');box.className=`enemy-select-drop ${known?'':'unknown'}`;
      if(known){const icon=makeSprite?.('items',drop.item);if(icon)box.append(icon);const label=document.createElement('strong');label.textContent=drop.item;const chance=document.createElement('small');chance.textContent=drop.chance<.01?`${(drop.chance*100).toFixed(3)}%`:`${(drop.chance*100).toFixed(1)}%`;box.append(label,chance);decorateItemElement(box,drop.item)}else box.innerHTML='<strong>???</strong><small>Undiscovered</small>';
      drops.append(box);
    }
    const items=g.collectionItems(enemy),got=g.collectionObtainedCount(enemy),collection=document.createElement('div');collection.className='enemy-select-collection';collection.innerHTML=`<span>Collection <strong>${got} / ${items.length}</strong></span><span>Kills <strong>${g.getKillCount(enemy.name).toLocaleString()}</strong></span>`;
    // Replace the old text-heavy left column while preserving the working Fight/Auto buttons.
    [...card.children].filter(ch=>ch!==actions).forEach(ch=>ch.remove());card.prepend(head,stats,meta,drops,collection);if(actions)card.append(actions);
  }
}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}
new MutationObserver(queue).observe(view,{childList:true,subtree:true});window.addEventListener('elderwild-game-state',queue);queue();

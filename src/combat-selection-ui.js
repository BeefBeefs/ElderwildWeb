import{ENEMIES,enemyAttackSpeed,traitDescription}from'./combat.js';
import{makeSprite}from'./sprite-ui.js';
import{decorateItemElement}from'./item-rarity.js';

const view=document.querySelector('#view');
const game=()=>window.__elderwildGame;
const combatLevel=e=>Math.max(1,Math.floor((e.attack+e.strength+e.defense+e.hp)/4));
const style=document.createElement('style');
style.textContent=`
.enemy-select-card{display:grid!important;gap:10px!important;padding:12px!important;background:linear-gradient(180deg,#1d2521ef,#111713f5)!important}
.enemy-select-head{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;width:100%}.enemy-select-art{width:82px;height:82px;display:grid;place-items:center;border:1px solid #40584a;border-radius:10px;background:#0d1310;overflow:hidden}.enemy-select-art .game-sprite{transform:scale(2);image-rendering:pixelated}.enemy-select-title{width:100%;text-align:center}.enemy-select-title .game-sprite{display:none!important}.enemy-select-title strong{display:block;font-size:17px;color:#edf4ef}.enemy-select-level{text-align:center}.enemy-select-level strong{display:inline;color:#72d88d;font-size:16px}.enemy-select-level small{margin-left:5px;font-size:9px;color:#8d9a92;text-transform:uppercase}.enemy-select-requirement{width:100%;padding:7px 9px;border:1px solid #9a4747;border-radius:7px;background:#351b1b;color:#ff8a8a;font-size:11px;font-weight:800;text-align:center}.enemy-select-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;width:100%}.enemy-select-stat{padding:6px 3px;text-align:center;border:1px solid #30443a;border-radius:6px;background:#0f1512}.enemy-select-stat strong{display:block;font-size:12px}.enemy-select-stat small{display:block;font-size:8px;color:#8e9b93;text-transform:uppercase}.enemy-select-meta{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:6px;width:100%;text-align:center}.enemy-select-chip{padding:5px 8px;border:1px solid #3b5144;border-radius:999px;background:#101713;color:#a7b5ab;font-size:10px}.enemy-select-chip.accent{border-color:#50765d;color:#8de9a7}.enemy-select-drop-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.enemy-select-drop{min-height:56px;padding:5px;border:1px solid #30443a;border-radius:6px;background:#0d1310;text-align:center;display:grid;place-items:center;gap:2px}.enemy-select-drop .game-sprite{width:27px;height:27px}.enemy-select-drop strong{font-size:8px;line-height:1.1;overflow:hidden;text-overflow:ellipsis;max-width:100%}.enemy-select-drop small{font-size:8px;color:#8f9d95}.enemy-select-drop.unknown{background:#090c0a;border-color:#222c26;color:#59645e}.enemy-select-collection{display:flex;justify-content:space-between;gap:8px;font-size:10px;color:#97a59d}.enemy-select-collection strong{color:#dce7df}.enemy-select-card>.enemy-actions{margin-top:0}.enemy-select-card>.enemy-actions button{min-height:38px}@media(max-width:390px){.enemy-select-art{width:74px;height:74px}.enemy-select-drop-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
`;
document.head.append(style);

function decorate(){
  const g=game(),c=g?.state?.combat;if(!g||c?.active||c?.respawning)return;
  for(const card of view.querySelectorAll('.area-enemy-list>.activity-card')){
    const btn=card.querySelector('[data-enemy]');const name=btn?.dataset.enemy;if(!name)continue;
    const enemy=ENEMIES.find(e=>e.name===name);if(!enemy)continue;
    if(card.dataset.selectionPolished==='1'){
      card.querySelectorAll('.enemy-extra-meta:not(.active-enemy-meta)').forEach(el=>el.remove());
      const head=card.querySelector('.enemy-select-head');if(head)head.querySelectorAll('.game-sprite').forEach((el,i)=>{if(i>0)el.remove()});
      continue;
    }
    card.dataset.selectionPolished='1';card.classList.add('enemy-select-card');
    const actions=card.querySelector('.enemy-actions'),locked=btn.disabled;
    const head=document.createElement('div');head.className='enemy-select-head';
    const art=document.createElement('div');art.className='enemy-select-art';const spr=makeSprite?.('enemies',enemy.name);if(spr)art.append(spr);else art.textContent=enemy.icon||'•';
    const title=document.createElement('div');title.className='enemy-select-title';title.innerHTML=`<strong>${enemy.name}</strong>`;
    const lvl=document.createElement('div');lvl.className='enemy-select-level';lvl.innerHTML=`<strong>${combatLevel(enemy)}</strong><small>Combat</small>`;head.append(art,title,lvl);
    const requirement=locked&&enemy.requirement?Object.assign(document.createElement('div'),{className:'enemy-select-requirement',textContent:`Requires ${enemy.requirement.skill} ${enemy.requirement.level}`}):null;
    const stats=document.createElement('div');stats.className='enemy-select-stats';stats.innerHTML=`<div class="enemy-select-stat"><strong>${enemy.hp}</strong><small>HP</small></div><div class="enemy-select-stat"><strong>${enemy.attack}</strong><small>Atk</small></div><div class="enemy-select-stat"><strong>${enemy.strength}</strong><small>Str</small></div><div class="enemy-select-stat"><strong>${enemy.defense}</strong><small>Def</small></div>`;
    const meta=document.createElement('div');meta.className='enemy-select-meta';meta.innerHTML=`<span class="enemy-select-chip accent">Weak to ${enemy.weakness}</span><span class="enemy-select-chip">${enemyAttackSpeed(enemy)} tick attack · ${(enemyAttackSpeed(enemy)*.6).toFixed(1)}s</span>${(enemy.traits||[]).length?enemy.traits.map(t=>`<span class="enemy-select-chip" title="${traitDescription(t)}">${t}</span>`).join(''):'<span class="enemy-select-chip">No special traits</span>'}`;
    const drops=document.createElement('div');drops.className='enemy-select-drop-grid';
    for(const drop of enemy.drops.slice(0,8)){const known=g.hasDiscoveredItem(drop.item),box=document.createElement('div');box.className=`enemy-select-drop ${known?'':'unknown'}`;if(known){const icon=makeSprite?.('items',drop.item);if(icon)box.append(icon);const label=document.createElement('strong');label.textContent=drop.item;const chance=document.createElement('small');chance.textContent=drop.chance<.01?`${(drop.chance*100).toFixed(3)}%`:`${(drop.chance*100).toFixed(1)}%`;box.append(label,chance);decorateItemElement(box,drop.item)}else box.innerHTML='<strong>???</strong><small>Undiscovered</small>';drops.append(box)}
    const items=g.collectionItems(enemy),got=g.collectionObtainedCount(enemy),collection=document.createElement('div');collection.className='enemy-select-collection';collection.innerHTML=`<span>Collection <strong>${got} / ${items.length}</strong></span><span>Kills <strong>${g.getKillCount(enemy.name).toLocaleString()}</strong></span>`;
    [...card.children].filter(ch=>ch!==actions).forEach(ch=>ch.remove());const parts=[head];if(requirement)parts.push(requirement);parts.push(stats,meta,drops,collection);card.prepend(...parts);if(actions)card.append(actions);
  }
}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}new MutationObserver(queue).observe(view,{childList:true,subtree:true});window.addEventListener('elderwild-game-state',queue);queue();

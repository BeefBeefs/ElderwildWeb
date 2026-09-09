import{ENEMIES,enemyAttackSpeed,traitDescription}from'./combat.js';
import{makeSprite}from'./sprite-ui.js';
import{decorateItemElement}from'./item-rarity.js';

const view=document.querySelector('#view');
const game=()=>window.__elderwildGame;
const combatLevel=e=>Math.max(1,Math.floor((e.attack+e.strength+e.defense+e.hp)/4));
const style=document.createElement('style');
style.textContent=`
.enemy-select-card{display:grid!important;gap:7px!important;padding:8px!important;background:linear-gradient(180deg,#1d2521ef,#111713f5)!important}
.enemy-select-head{display:grid;grid-template-columns:58px minmax(0,1fr);gap:8px;align-items:center;width:100%;text-align:left}.enemy-select-art{width:58px;height:58px;display:grid;place-items:center;border:1px solid #40584a;border-radius:8px;background:#0d1310;overflow:hidden}.enemy-select-art .game-sprite{transform:scale(1.55);image-rendering:pixelated}.enemy-select-title{min-width:0;text-align:left}.enemy-select-title .game-sprite{display:none!important}.enemy-select-title strong{display:block;font-size:14px;line-height:1.1;color:#edf4ef;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.enemy-select-level{display:flex;align-items:center;flex-wrap:wrap;gap:5px;margin-top:4px}.enemy-select-level strong{display:inline;color:#72d88d;font-size:13px}.enemy-select-level small{font-size:8px;color:#8d9a92;text-transform:uppercase}.enemy-select-kc{padding:2px 5px;border:1px solid #40584a;border-radius:999px;background:#101713;color:#a7b5ab;font-size:8px;font-weight:800}.enemy-select-kc b{color:#edf4ef}.enemy-select-requirement{width:100%;padding:5px 7px;border:1px solid #9a4747;border-radius:6px;background:#351b1b;color:#ff8a8a;font-size:10px;font-weight:800;text-align:center}.enemy-select-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;width:100%}.enemy-select-stat{padding:4px 2px;text-align:center;border:1px solid #30443a;border-radius:5px;background:#0f1512}.enemy-select-stat strong{display:block;font-size:11px}.enemy-select-stat small{display:block;font-size:7px;color:#8e9b93;text-transform:uppercase}.enemy-select-meta{display:flex;justify-content:flex-start;align-items:center;flex-wrap:wrap;gap:4px;width:100%;text-align:left}.enemy-select-chip{padding:3px 6px;border:1px solid #3b5144;border-radius:999px;background:#101713;color:#a7b5ab;font-size:8px}.enemy-select-chip.accent{border-color:#50765d;color:#8de9a7}.enemy-select-drop-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}.enemy-select-drop{min-height:44px;padding:3px;border:1px solid #30443a;border-radius:5px;background:#0d1310;text-align:center;display:grid;place-items:center;gap:1px}.enemy-select-drop .game-sprite{width:22px;height:22px}.enemy-select-drop strong{font-size:7px;line-height:1.05;overflow:hidden;text-overflow:ellipsis;max-width:100%}.enemy-select-drop small{font-size:7px;color:#8f9d95}.enemy-select-drop.unknown{background:#090c0a;border-color:#222c26;color:#59645e}.enemy-select-collection{display:flex;justify-content:space-between;gap:8px;font-size:9px;color:#97a59d}.enemy-select-collection strong{color:#dce7df}.enemy-select-card>.enemy-actions{margin-top:0;gap:5px}.enemy-select-card>.enemy-actions button{min-height:32px;padding:6px 7px!important;font-size:10px}@media(max-width:390px){.enemy-select-head{grid-template-columns:52px minmax(0,1fr)}.enemy-select-art{width:52px;height:52px}.enemy-select-drop-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
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
      const kc=head?.querySelector('.enemy-select-kc b');if(kc)kc.textContent=g.getKillCount(enemy.name).toLocaleString();
      continue;
    }
    card.dataset.selectionPolished='1';card.classList.add('enemy-select-card');
    const actions=card.querySelector('.enemy-actions'),locked=btn.disabled,kills=g.getKillCount(enemy.name);
    const head=document.createElement('div');head.className='enemy-select-head';
    const art=document.createElement('div');art.className='enemy-select-art';const spr=makeSprite?.('enemies',enemy.name);if(spr)art.append(spr);else art.textContent=enemy.icon||'•';
    const info=document.createElement('div');info.className='enemy-select-title';info.innerHTML=`<strong>${enemy.name}</strong><div class="enemy-select-level"><strong>${combatLevel(enemy)}</strong><small>Combat</small><span class="enemy-select-kc">KC <b>${kills.toLocaleString()}</b></span></div>`;head.append(art,info);
    const requirement=locked&&enemy.requirement?Object.assign(document.createElement('div'),{className:'enemy-select-requirement',textContent:`Requires ${enemy.requirement.skill} ${enemy.requirement.level}`}):null;
    const stats=document.createElement('div');stats.className='enemy-select-stats';stats.innerHTML=`<div class="enemy-select-stat"><strong>${enemy.hp}</strong><small>HP</small></div><div class="enemy-select-stat"><strong>${enemy.attack}</strong><small>Atk</small></div><div class="enemy-select-stat"><strong>${enemy.strength}</strong><small>Str</small></div><div class="enemy-select-stat"><strong>${enemy.defense}</strong><small>Def</small></div>`;
    const meta=document.createElement('div');meta.className='enemy-select-meta';meta.innerHTML=`<span class="enemy-select-chip accent">Weak ${enemy.weakness}</span><span class="enemy-select-chip">${enemyAttackSpeed(enemy)}t · ${(enemyAttackSpeed(enemy)*.6).toFixed(1)}s</span>${(enemy.traits||[]).length?enemy.traits.map(t=>`<span class="enemy-select-chip" title="${traitDescription(t)}">${t}</span>`).join(''):'<span class="enemy-select-chip">No traits</span>'}`;
    const drops=document.createElement('div');drops.className='enemy-select-drop-grid';
    for(const drop of enemy.drops.slice(0,8)){const known=g.hasDiscoveredItem(drop.item),box=document.createElement('div');box.className=`enemy-select-drop ${known?'':'unknown'}`;if(known){const icon=makeSprite?.('items',drop.item);if(icon)box.append(icon);const label=document.createElement('strong');label.textContent=drop.item;const chance=document.createElement('small');chance.textContent=drop.chance<.01?`${(drop.chance*100).toFixed(3)}%`:`${(drop.chance*100).toFixed(1)}%`;box.append(label,chance);decorateItemElement(box,drop.item)}else box.innerHTML='<strong>???</strong><small>Unknown</small>';drops.append(box)}
    const items=g.collectionItems(enemy),got=g.collectionObtainedCount(enemy),collection=document.createElement('div');collection.className='enemy-select-collection';collection.innerHTML=`<span>Collection <strong>${got} / ${items.length}</strong></span><span>KC <strong>${kills.toLocaleString()}</strong></span>`;
    [...card.children].filter(ch=>ch!==actions).forEach(ch=>ch.remove());const parts=[head];if(requirement)parts.push(requirement);parts.push(stats,meta,drops,collection);card.prepend(...parts);if(actions)card.append(actions);
  }
}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}new MutationObserver(queue).observe(view,{childList:true,subtree:true});window.addEventListener('elderwild-game-state',queue);queue();

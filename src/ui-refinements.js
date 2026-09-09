import{ITEM_TYPES}from'./items.js';
const view=document.querySelector('#view');
const style=document.createElement('style');
style.textContent=`
.equipment-slot.compact-equipment-slot{display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;min-width:0!important}
.equipment-slot.compact-equipment-slot>.equipment-item-button{order:1!important;min-height:54px!important;height:54px!important;padding:5px!important;display:flex!important;align-items:center!important;justify-content:center!important}
.equipment-slot.compact-equipment-slot>strong{order:2!important;margin:3px 0 0!important;font-size:9px!important;color:#a7b5ab!important;text-align:center!important}
.equipment-slot.compact-equipment-slot::after{content:attr(data-equipped-name);order:3;display:block;min-width:0;margin-top:1px;color:#72d88d;font-size:9px;line-height:1.15;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.equipment-slot.compact-equipment-slot:not(.has-equipped)::after{color:#78857d}
.equipment-slot.compact-equipment-slot>small.muted{display:none!important}
.ew-area-hero{min-height:96px!important;margin-bottom:8px!important}
.ew-area-hero-copy{padding:14px 12px 7px!important}
.ew-area-hero h2{font-size:18px!important;line-height:1.05!important}
.ew-area-hero p{margin-top:2px!important;font-size:10px!important;line-height:1.15!important}
.ew-area-badge{margin-bottom:2px!important;padding:2px 6px!important;font-size:8px!important}
@media(min-width:700px){.ew-area-hero{min-height:125px!important}}
`;
document.head.append(style);
function updateEquipmentLabels(){view.querySelectorAll('.equipment-slot.compact-equipment-slot').forEach(slot=>{const button=slot.querySelector('.equipment-item-button'),name=button?.dataset.itemName||button?.title||'';slot.dataset.equippedName=name||'Empty'})}
function selectBestFood(){const g=window.__elderwildGame;if(!g)return;const foods=g.state.inventory.filter(item=>item.quantity>0&&item.type===ITEM_TYPES.FOOD&&(Number(item.healing)||0)>0);if(!foods.length)return;foods.sort((a,b)=>(Number(b.healing)||0)-(Number(a.healing)||0)||(Number(b.value)||0)-(Number(a.value)||0)||(Number(b.quantity)||0)-(Number(a.quantity)||0));const best=foods[0],current=g.selectedFood?.();if(current?.name===best.name)return;if(g.selectFood?.(best)!==false){g.save?.();g.onChange?.()}}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;updateEquipmentLabels()})}
new MutationObserver(queue).observe(view,{childList:true,subtree:true});window.addEventListener('elderwild-game-state',queue);window.addEventListener('elderwild-auto-equip',()=>setTimeout(selectBestFood,0));queue();

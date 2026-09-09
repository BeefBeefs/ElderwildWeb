const view=document.querySelector('#view');
let lastSignature='';
function inventorySignature(){const g=window.__elderwildGame;if(!g)return'';const inv=(g.state.inventory||[]).filter(i=>i.quantity>0).map(i=>`${i.name}|${i.quantity}|${i.upgradeLevel||0}`).join(';');const equip=(g.equippedItems?.()||[]).map(i=>`${i.slot}|${i.name}|${i.upgradeLevel||0}`).sort().join(';');const food=g.selectedFood?.();return`${inv}#${equip}#${food?`${food.name}|${food.quantity}`:''}`}
function markStable(){view.querySelectorAll('.inventory-slot.compact-item-slot,.equipment-slot.compact-equipment-slot').forEach(slot=>slot.dataset.inventoryRenderStable='1')}
const innerHTML=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
if(innerHTML?.get&&innerHTML?.set&&!window.__elderwildInventoryInnerHTMLGuard){window.__elderwildInventoryInnerHTMLGuard=true;Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,enumerable:innerHTML.enumerable,get(){return innerHTML.get.call(this)},set(value){if(value===''&&this?.dataset?.inventoryRenderStable==='1'&&(this.classList?.contains('compact-item-slot')||this.classList?.contains('compact-equipment-slot')))return;innerHTML.set.call(this,value)}})}
function sync(){const sig=inventorySignature();if(sig!==lastSignature){lastSignature=sig;view.querySelectorAll('[data-inventory-render-stable]').forEach(slot=>delete slot.dataset.inventoryRenderStable);requestAnimationFrame(markStable);return}markStable()}
new MutationObserver(sync).observe(view,{childList:true,subtree:true});window.addEventListener('elderwild-game-state',sync);sync();

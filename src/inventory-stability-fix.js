const view=document.querySelector('#view');
let lastSignature='';
const isStableSlot=el=>el?.dataset?.inventoryRenderStable==='1'&&(el.classList?.contains('compact-item-slot')||el.classList?.contains('compact-equipment-slot'));
function inventorySignature(){const g=window.__elderwildGame;if(!g)return'';const inv=(g.state.inventory||[]).filter(i=>i.quantity>0).map(i=>`${i.name}|${i.quantity}|${i.upgradeLevel||0}`).join(';');const equip=(g.equippedItems?.()||[]).map(i=>`${i.slot}|${i.name}|${i.upgradeLevel||0}`).sort().join(';');const food=g.selectedFood?.();return`${inv}#${equip}#${food?`${food.name}|${food.quantity}`:''}`}
function markStable(){view.querySelectorAll('.inventory-slot.compact-item-slot,.equipment-slot.compact-equipment-slot').forEach(slot=>slot.dataset.inventoryRenderStable='1')}
const htmlDescriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
if(htmlDescriptor?.get&&htmlDescriptor?.set&&!window.__elderwildInventoryDomGuard){
  window.__elderwildInventoryDomGuard=true;
  const nativeAppend=Element.prototype.append,nativeInsertAdjacentHTML=Element.prototype.insertAdjacentHTML;
  Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,enumerable:htmlDescriptor.enumerable,get(){return htmlDescriptor.get.call(this)},set(value){
    if(isStableSlot(this)){
      if(value==='')return;
      if(this.classList.contains('compact-equipment-slot')&&typeof value==='string'&&value.startsWith('<strong>')){
        const first=this.firstElementChild;if(first?.tagName==='STRONG'&&value===first.outerHTML)return;
      }
    }
    htmlDescriptor.set.call(this,value);
  }});
  Element.prototype.append=function(...nodes){
    if(isStableSlot(this)){
      for(const node of nodes){
        if(node instanceof Element&&(node.classList.contains('inventory-item-button')||node.classList.contains('equipment-item-button'))){
          const existing=this.querySelector(':scope > .inventory-item-button,:scope > .equipment-item-button');
          if(existing&&existing.title===node.title)return;
        }
      }
    }
    return nativeAppend.apply(this,nodes);
  };
  Element.prototype.insertAdjacentHTML=function(position,html){
    if(isStableSlot(this)&&position==='beforeend'&&typeof html==='string'&&html.includes('muted')&&html.includes('Empty')&&this.querySelector(':scope > small.muted'))return;
    return nativeInsertAdjacentHTML.call(this,position,html);
  };
}
function sync(){const sig=inventorySignature();if(sig!==lastSignature){lastSignature=sig;view.querySelectorAll('[data-inventory-render-stable]').forEach(slot=>delete slot.dataset.inventoryRenderStable);requestAnimationFrame(markStable);return}markStable()}
new MutationObserver(sync).observe(view,{childList:true,subtree:true});window.addEventListener('elderwild-game-state',sync);sync();

const view=document.querySelector('#view');
const style=document.createElement('style');
style.textContent=`.inventory-slot.compact-item-slot{height:78px!important;min-height:78px!important;max-height:78px!important;overflow:hidden!important}.inventory-slot.compact-item-slot>.inventory-item-button{height:76px!important;min-height:76px!important;max-height:76px!important;box-sizing:border-box!important}`;
document.head.append(style);
function trimSlots(){view.querySelectorAll('.inventory-slot.compact-item-slot').forEach(slot=>{const buttons=[...slot.children].filter(el=>el.classList?.contains('inventory-item-button'));buttons.slice(1).forEach(el=>el.remove())});view.querySelectorAll('.equipment-slot.compact-equipment-slot').forEach(slot=>{const buttons=[...slot.children].filter(el=>el.classList?.contains('equipment-item-button'));buttons.slice(1).forEach(el=>el.remove())})}
let queued=false;function sync(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;trimSlots()})}
new MutationObserver(sync).observe(view,{childList:true,subtree:true});window.addEventListener('elderwild-game-state',sync);sync();

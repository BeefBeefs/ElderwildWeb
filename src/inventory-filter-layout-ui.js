const style=document.createElement('style');
style.textContent=`
.inventory-primary-row{display:grid!important;grid-template-columns:minmax(76px,.8fr) minmax(0,3.2fr)!important;gap:7px!important;align-items:start!important;margin:1px 0 7px!important}
.inventory-primary-row>.inventory-filter{width:100%!important;min-width:0!important;height:38px!important;padding:7px 8px!important;font-size:11px!important}
.inventory-primary-row>.inventory-sort-row{margin:0!important;padding:0!important;min-width:0!important}
.inventory-filters.inventory-category-row{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:7px!important;overflow:visible!important;padding:0 0 9px!important;width:100%!important}
.inventory-filters.inventory-category-row>.inventory-filter{width:100%!important;min-width:0!important;min-height:40px!important;padding:8px 4px!important;font-size:10px!important;white-space:normal!important;line-height:1.1!important}
@media(max-width:420px){.inventory-primary-row{grid-template-columns:minmax(70px,.8fr) minmax(0,3.2fr)!important}.inventory-filters.inventory-category-row{gap:5px!important}.inventory-filters.inventory-category-row>.inventory-filter{font-size:9px!important;padding:8px 2px!important}}
`;
document.head.append(style);

const view=document.querySelector('#view');
function arrange(){
 const heading=[...view.querySelectorAll('h2')].find(h=>h.textContent.trim()==='Inventory');
 if(!heading)return;
 const panel=heading.closest('.panel')||heading.parentElement;
 const filters=panel?.querySelector('.inventory-filters');
 const sort=panel?.querySelector('.inventory-sort-row');
 if(!filters||!sort)return;
 let primary=panel.querySelector('.inventory-primary-row');
 if(!primary){primary=document.createElement('div');primary.className='inventory-primary-row';sort.before(primary)}
 const all=filters.querySelector('[data-filter="all"]');
 if(all&&all.parentElement!==primary)primary.append(all);
 if(sort.parentElement!==primary)primary.append(sort);
 filters.classList.add('inventory-category-row');
 [...filters.querySelectorAll('.inventory-filter')].filter(b=>b.dataset.filter!=='all').forEach(b=>filters.append(b));
 if(filters.previousElementSibling!==primary)primary.after(filters);
}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;arrange()})}
new MutationObserver(queue).observe(view,{childList:true,subtree:true});window.addEventListener('elderwild-game-state',queue);queue();

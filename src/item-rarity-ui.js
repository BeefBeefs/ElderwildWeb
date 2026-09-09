import'./landing-ui.js';
import{decorateItemElement,itemRarity,rarityColor}from'./item-rarity.js';

const style=document.createElement('style');
style.textContent=`
.rarity-item{position:relative!important;box-shadow:inset 0 0 0 2px var(--item-rarity)!important;border-color:var(--item-rarity)!important}
.inventory-slot.compact-item-slot.rarity-item,.equipment-slot.compact-equipment-slot.rarity-item{border:2px solid var(--item-rarity)!important;box-shadow:0 0 0 1px #0008,inset 0 0 9px color-mix(in srgb,var(--item-rarity) 13%,transparent)!important}
.inventory-item-button.rarity-item,.equipment-item-button.rarity-item{box-shadow:inset 0 0 0 2px var(--item-rarity)!important;border-radius:4px!important}
.inventory-detail-art.rarity-item{border:2px solid var(--item-rarity)!important;box-shadow:inset 0 0 10px color-mix(in srgb,var(--item-rarity) 12%,transparent)!important}
.inventory-detail-head h3.rarity-name,.combat-loot-row.rarity-item span,.drop-row.rarity-item span:first-child{color:var(--item-rarity)!important}
.combat-loot-row.rarity-item,.drop-row.rarity-item{border:1px solid var(--item-rarity)!important;border-radius:5px!important;box-shadow:inset 0 0 7px color-mix(in srgb,var(--item-rarity) 9%,transparent)!important}
.rarity-item[data-rarity="Common"]{--item-rarity:#fff}.rarity-item[data-rarity="Uncommon"]{--item-rarity:#62C7FF}.rarity-item[data-rarity="Rare"]{--item-rarity:#C882FF}.rarity-item[data-rarity="VeryRare"]{--item-rarity:#FF87C2}.rarity-item[data-rarity="SuperRare"]{--item-rarity:#FFD24A}.rarity-item[data-rarity="MegaRare"]{--item-rarity:#FF6868}
`;
document.head.append(style);
const view=document.querySelector('#view');
function clean(s){return String(s||'').replace(/^×\s*\d+\s*/,'').replace(/\s+×\s*\d+$/,'').trim()}
function decorate(){
  view.querySelectorAll('.inventory-item-button[title],.equipment-item-button[title]').forEach(button=>{
    const name=button.title;decorateItemElement(button,name);decorateItemElement(button.closest('.inventory-slot,.equipment-slot'),name);
  });
  const modal=document.querySelector('.inventory-detail-modal:not(.hidden)');
  if(modal){const title=modal.querySelector('.inventory-detail-head h3'),name=clean(title?.textContent);if(name){const art=modal.querySelector('.inventory-detail-art');decorateItemElement(art,name);title?.classList.add('rarity-name');if(title)title.style.color=rarityColor(name)}}
  view.querySelectorAll('.combat-loot-row').forEach(row=>{const name=clean(row.querySelector('span')?.textContent?.replace(/ \+\d+$/,''));if(name)decorateItemElement(row,name)});
  view.querySelectorAll('.drop-row:not(.unknown)').forEach(row=>{const first=row.querySelector('span:first-child');const name=clean(first?.textContent);if(name&&name!=='???')decorateItemElement(row,name)});
}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}
new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});
window.addEventListener('elderwild-game-state',queue);queue();

import{ENEMIES}from'./combat.js';

// ScapeRunner rarity palette. An item's display rarity is the rarest drop tier
// it has anywhere in the game, so shared items look consistent on every screen.
export const RARITY={
  Common:{rank:0,color:'#FFFFFF'},
  Uncommon:{rank:1,color:'#62C7FF'},
  Rare:{rank:2,color:'#C882FF'},
  VeryRare:{rank:3,color:'#FF87C2'},
  SuperRare:{rank:4,color:'#FFD24A'},
  MegaRare:{rank:5,color:'#FF6868'}
};
export function rarityForChance(chance){
  chance=Number(chance)||0;
  if(chance<=.0001)return'MegaRare';
  if(chance<=.001)return'SuperRare';
  if(chance<=.01)return'VeryRare';
  if(chance<=.05)return'Rare';
  if(chance<=.25)return'Uncommon';
  return'Common';
}
const rarityByItem=new Map();
for(const enemy of ENEMIES)for(const drop of enemy.drops||[]){
  const rarity=rarityForChance(drop.chance),old=rarityByItem.get(drop.item);
  if(!old||RARITY[rarity].rank>RARITY[old].rank)rarityByItem.set(drop.item,rarity);
}
export function itemRarity(name){return rarityByItem.get(String(name).replace(/ \+\d+$/,''))||'Common'}
export function rarityColor(name){return RARITY[itemRarity(name)].color}
export function decorateItemElement(element,name){
  if(!element||!name)return element;
  const rarity=itemRarity(name),color=RARITY[rarity].color;
  element.dataset.rarity=rarity;
  element.style.setProperty('--item-rarity',color);
  element.classList.add('rarity-item');
  return element;
}
window.__elderwildItemRarity={itemRarity,rarityColor,decorateItemElement,RARITY};

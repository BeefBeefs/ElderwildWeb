import{Game}from'./game.js';
import{SKILLS}from'./data.js';
import{getItem}from'./items.js';

export const SKILLING_PETS=[
  {skill:'Fishing',item:'Heron',minimum:1000},
  {skill:'Mining',item:'Rocky',minimum:1000},
  {skill:'Woodcutting',item:'Beaver',minimum:1000},
  {skill:'Agility',item:'Squirrel',minimum:1000},
  {skill:'Thieving',item:'Raccoon',minimum:10000},
  {skill:'Crafting',item:'Golem',minimum:10000},
  {skill:'Fletching',item:'Arrow Eagle',minimum:10000},
  {skill:'Farming',item:'Tangleroot',minimum:10000}
];

export function skillingPetForSkill(skillName){return SKILLING_PETS.find(p=>p.skill===skillName)||null}
export function skillingPetDropDenominator(skillName,activity){const pet=skillingPetForSkill(skillName);if(!pet||!activity)return Infinity;const xpMultiplier=Math.max(1,(Number(activity.xp)||0)/25);return Math.max(pet.minimum,200000/Math.pow(xpMultiplier,2.3))}
function normalize(state){state.skillingPets=[...new Set(Array.isArray(state.skillingPets)?state.skillingPets.filter(Boolean):[])];return state}

if(!Game.prototype.__skillingPetsPatched){
  const originalLoad=Game.prototype.load,originalReset=Game.prototype.reset,originalTickActivity=Game.prototype.tickActivity;
  Game.prototype.load=function(...args){return normalize(originalLoad.apply(this,args))};
  Game.prototype.reset=function(...args){const result=originalReset.apply(this,args);this.state.skillingPets=[];this.save();return result};
  Game.prototype.skillingPetForSkill=function(skillName){return skillingPetForSkill(skillName)};
  Game.prototype.skillingPetDropDenominator=function(skillName,activity){return skillingPetDropDenominator(skillName,activity)};
  Game.prototype.hasSkillingPet=function(itemName){return this.state.skillingPets?.includes(itemName)||this.state.inventory?.some(i=>i?.name===itemName&&i?.type==='Pet'&&i.quantity>0)};
  Game.prototype.recordSkillingPet=function(itemName){if(!this.state.skillingPets)this.state.skillingPets=[];if(!this.state.skillingPets.includes(itemName))this.state.skillingPets.push(itemName)};
  Game.prototype.tryAwardSkillingPet=function(skillName,activity){
    const pet=skillingPetForSkill(skillName);if(!pet||this.hasSkillingPet(pet.item))return null;
    const denominator=skillingPetDropDenominator(skillName,activity),chance=1/denominator;
    if(Math.random()>=chance)return null;
    const item=getItem(pet.item);if(!this.addItem(item,1))return null;
    this.recordSkillingPet(pet.item);
    const attempts=Math.max(1,Number(this.state.skills?.[skillName]?.actions)||1);
    this.recordLuckiestDrop?.(pet.item,attempts,chance,`${skillName} actions`);
    this.save();
    window.dispatchEvent(new CustomEvent('elderwild-rare-drop',{detail:{item:pet.item,quantity:1,chance,baseChance:chance,source:`${skillName} pet`}}));
    window.dispatchEvent(new CustomEvent('elderwild-skilling-pet',{detail:{skillName,item:pet.item,chance}}));
    return pet.item;
  };
  Game.prototype.tickActivity=function(...args){
    const active=this.state.activity?{...this.state.activity}:null,skillName=active?.skillName;
    const before=skillName?Number(this.state.skills?.[skillName]?.actions)||0:0;
    const result=originalTickActivity.apply(this,args);
    if(!active||!skillName)return result;
    const after=Number(this.state.skills?.[skillName]?.actions)||0;
    if(after<=before)return result;
    const skill=SKILLS.find(s=>s.name===skillName),activity=skill?.activities?.find(a=>a.name===active.activityName);
    if(activity)this.tryAwardSkillingPet(skillName,activity);
    return result;
  };
  Game.prototype.__skillingPetsPatched=true;
}

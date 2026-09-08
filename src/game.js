import{SKILLS,TICK_MS}from'./data.js';
import{getItem,ITEM_TYPES,createUpgrade,stackKey}from'./items.js';

const SAVE_KEY='elderwild-web-save-v2';
const LEGACY_SAVE_KEY='elderwild-web-save-v1';
export const STARTING_SLOTS=28;

export function xpForLevel(level){if(level<=1)return 0;let total=0;for(let l=2;l<=Math.min(level,99);l++){total+=Math.floor((l-1)+300*Math.pow(2,(l-1)/7));}return Math.floor(total/4)}
export function levelForXp(xp){let level=1;for(let l=2;l<=99;l++){if(xp>=xpForLevel(l))level=l;else break}return level}

function freshState(){return{version:2,playerName:'Adventurer',skills:Object.fromEntries(SKILLS.map(s=>[s.name,{xp:0,actions:0}])),inventory:[],slotCapacity:STARTING_SLOTS,equipment:{},activity:null,lastSavedAt:Date.now()}}
function normalizeEntry(raw){if(!raw)return null;if(typeof raw==='string')return{...getItem(raw),quantity:1};const base=getItem(raw.name);return{...base,...raw,quantity:Math.max(0,raw.quantity||0)}}
function migrateLegacy(saved){const base=freshState();const inventory=Object.entries(saved.inventory||{}).filter(([,q])=>q>0).map(([name,quantity])=>({...getItem(name),quantity}));return{...base,...saved,version:2,skills:{...base.skills,...saved.skills},inventory,slotCapacity:STARTING_SLOTS,equipment:{},activity:null}}

export class Game{
  constructor(onChange=()=>{}){this.onChange=onChange;this.state=this.load();this.timer=null}
  load(){try{let raw=localStorage.getItem(SAVE_KEY);if(!raw){const legacy=localStorage.getItem(LEGACY_SAVE_KEY);if(!legacy)return freshState();const migrated=migrateLegacy(JSON.parse(legacy));localStorage.setItem(SAVE_KEY,JSON.stringify(migrated));return migrated}const saved=JSON.parse(raw);const base=freshState();return{...base,...saved,skills:{...base.skills,...saved.skills},inventory:Array.isArray(saved.inventory)?saved.inventory.map(normalizeEntry).filter(Boolean):[],slotCapacity:Math.max(STARTING_SLOTS,saved.slotCapacity||STARTING_SLOTS),equipment:{...base.equipment,...saved.equipment},activity:null}}catch{return freshState()}}
  save(){this.state.lastSavedAt=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(this.state))}
  reset(){localStorage.removeItem(SAVE_KEY);localStorage.removeItem(LEGACY_SAVE_KEY);this.stopActivity(false);this.state=freshState();this.save();this.onChange()}
  setName(name){this.state.playerName=(name||'Adventurer').trim().slice(0,24)||'Adventurer';this.save();this.onChange()}
  getSkill(name){const data=SKILLS.find(s=>s.name===name);const state=this.state.skills[name]||{xp:0,actions:0};return{...data,...state,level:levelForXp(state.xp)}}
  totalLevel(){return SKILLS.reduce((sum,s)=>sum+this.getSkill(s.name).level,0)}
  usedSlots(){return this.state.inventory.filter(e=>e.quantity>0&&e.type!==ITEM_TYPES.CURRENCY&&e.type!==ITEM_TYPES.PET).length}
  findStack(item){const key=stackKey(item);return this.state.inventory.find(e=>stackKey(e)===key)}
  canAddItem(item){return item.type===ITEM_TYPES.CURRENCY||item.type===ITEM_TYPES.PET||!!this.findStack(item)||this.usedSlots()<this.state.slotCapacity}
  addItem(nameOrItem,quantity=1){const item=typeof nameOrItem==='string'?getItem(nameOrItem):nameOrItem;if(quantity<=0||!this.canAddItem(item))return false;const existing=this.findStack(item);if(existing)existing.quantity+=quantity;else this.state.inventory.push({...item,quantity});this.save();return true}
  removeItem(item,quantity=1){const existing=this.findStack(item);if(!existing||quantity<=0||existing.quantity<quantity)return false;existing.quantity-=quantity;if(existing.quantity<=0)this.state.inventory=this.state.inventory.filter(e=>e!==existing);this.save();return true}
  combineEquipment(item){const existing=this.findStack(item);if(!existing||existing.type!==ITEM_TYPES.EQUIPMENT||existing.quantity<2||(existing.upgradeLevel||0)>=10)return false;const upgraded=createUpgrade(existing);const sourceWillRemain=existing.quantity>2;const target=this.findStack(upgraded);if(!target&&sourceWillRemain&&this.usedSlots()>=this.state.slotCapacity)return false;existing.quantity-=2;if(existing.quantity<=0)this.state.inventory=this.state.inventory.filter(e=>e!==existing);if(target)target.quantity++;else this.state.inventory.push({...upgraded,quantity:1});this.save();this.onChange();return true}
  startActivity(skillName,activityName){const skill=this.getSkill(skillName);const activity=skill.activities.find(a=>a.name===activityName);if(!activity||skill.level<activity.level)return false;if(activity.item&&!this.canAddItem(getItem(activity.item)))return false;this.state.activity={skillName,activityName,tick:0,totalTicks:activity.ticks};this.startLoop();this.save();this.onChange();return true}
  startLoop(){if(this.timer)return;this.timer=setInterval(()=>this.tick(),TICK_MS)}
  stopActivity(notify=true){if(this.timer){clearInterval(this.timer);this.timer=null}this.state.activity=null;this.save();if(notify)this.onChange()}
  tick(){const active=this.state.activity;if(!active)return;const skillDef=SKILLS.find(s=>s.name===active.skillName);const activity=skillDef?.activities.find(a=>a.name===active.activityName);if(!activity){this.stopActivity();return}active.tick++;if(active.tick>=active.totalTicks){if(activity.item&&!this.canAddItem(getItem(activity.item))){this.stopActivity();return}active.tick=0;const skillState=this.state.skills[active.skillName];skillState.xp+=activity.xp;skillState.actions=(skillState.actions||0)+1;if(activity.item)this.addItem(activity.item,1);this.save()}this.onChange()}
}

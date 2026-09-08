import{SKILLS,TICK_MS}from'./data.js';

const SAVE_KEY='elderwild-web-save-v1';

export function xpForLevel(level){if(level<=1)return 0;let total=0;for(let l=2;l<=Math.min(level,99);l++){total+=Math.floor((l-1)+300*Math.pow(2,(l-1)/7));}return Math.floor(total/4)}
export function levelForXp(xp){let level=1;for(let l=2;l<=99;l++){if(xp>=xpForLevel(l))level=l;else break}return level}

function freshState(){return{version:1,playerName:'Adventurer',skills:Object.fromEntries(SKILLS.map(s=>[s.name,{xp:0,actions:0}])),inventory:{},activity:null,lastSavedAt:Date.now()}}

export class Game{
  constructor(onChange=()=>{}){this.onChange=onChange;this.state=this.load();this.timer=null}
  load(){try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return freshState();const saved=JSON.parse(raw);const base=freshState();return{...base,...saved,skills:{...base.skills,...saved.skills},inventory:{...base.inventory,...saved.inventory},activity:null}}catch{return freshState()}}
  save(){this.state.lastSavedAt=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(this.state))}
  reset(){localStorage.removeItem(SAVE_KEY);this.stopActivity(false);this.state=freshState();this.save();this.onChange()}
  setName(name){this.state.playerName=(name||'Adventurer').trim().slice(0,24)||'Adventurer';this.save();this.onChange()}
  getSkill(name){const data=SKILLS.find(s=>s.name===name);const state=this.state.skills[name]||{xp:0,actions:0};return{...data,...state,level:levelForXp(state.xp)}}
  totalLevel(){return SKILLS.reduce((sum,s)=>sum+this.getSkill(s.name).level,0)}
  startActivity(skillName,activityName){const skill=this.getSkill(skillName);const activity=skill.activities.find(a=>a.name===activityName);if(!activity||skill.level<activity.level)return false;this.state.activity={skillName,activityName,tick:0,totalTicks:activity.ticks};this.startLoop();this.save();this.onChange();return true}
  startLoop(){if(this.timer)return;this.timer=setInterval(()=>this.tick(),TICK_MS)}
  stopActivity(notify=true){if(this.timer){clearInterval(this.timer);this.timer=null}this.state.activity=null;this.save();if(notify)this.onChange()}
  tick(){const active=this.state.activity;if(!active)return;const skillDef=SKILLS.find(s=>s.name===active.skillName);const activity=skillDef?.activities.find(a=>a.name===active.activityName);if(!activity){this.stopActivity();return}active.tick++;if(active.tick>=active.totalTicks){active.tick=0;const skillState=this.state.skills[active.skillName];skillState.xp+=activity.xp;skillState.actions=(skillState.actions||0)+1;if(activity.item)this.state.inventory[activity.item]=(this.state.inventory[activity.item]||0)+1;this.save()}this.onChange()}
}

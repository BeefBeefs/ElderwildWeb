import{Game,xpForLevel}from'./game.js';
const CURRENT_MARKER='elderwild-web-schema-v4',SAVE_KEY='elderwild-web-save-v2',LEGACY_SAVE_KEY='elderwild-web-save-v1',BACKUP_KEY='elderwild-web-save-backup-v2',HP10_XP=xpForLevel(10),EXPORT_FORMAT='elderwild-web-save';

// Schema markers are informational only. Never delete a playable save merely
// because a marker is missing; Game.load already handles the supported legacy format.
if(localStorage.getItem(CURRENT_MARKER)!=='1')localStorage.setItem(CURRENT_MARKER,'1');
function validJson(raw){if(!raw)return false;try{const value=JSON.parse(raw);return!!value&&typeof value==='object'}catch{return false}}
function validateState(state){if(!state||typeof state!=='object')throw new Error('Save data is not an object.');if(!state.skills||typeof state.skills!=='object')throw new Error('Save is missing skills.');if(!Array.isArray(state.inventory))throw new Error('Save is missing inventory data.');if(!state.collectionLog||typeof state.collectionLog!=='object')throw new Error('Save is missing collection data.');if(!state.combat||typeof state.combat!=='object')throw new Error('Save is missing combat data.');return state}

// Recover a damaged primary snapshot from the last known-good browser backup.
const primary=localStorage.getItem(SAVE_KEY),backup=localStorage.getItem(BACKUP_KEY);
if(primary&&!validJson(primary)&&validJson(backup)){localStorage.setItem(SAVE_KEY,backup);sessionStorage.setItem('elderwild-save-recovered','1')}

if(!Game.prototype.__saveSafetyPatched){
 const originalSave=Game.prototype.save,originalReset=Game.prototype.reset;
 Game.prototype.save=function(...args){try{const current=localStorage.getItem(SAVE_KEY);if(validJson(current))localStorage.setItem(BACKUP_KEY,current)}catch{}return originalSave.apply(this,args)};
 Game.prototype.exportSaveObject=function(){return{format:EXPORT_FORMAT,formatVersion:1,exportedAt:new Date().toISOString(),state:JSON.parse(JSON.stringify(this.state))}};
 Game.prototype.exportSaveText=function(){return JSON.stringify(this.exportSaveObject(),null,2)};
 Game.prototype.importSaveText=function(text){const parsed=JSON.parse(text),state=validateState(parsed?.format===EXPORT_FORMAT?parsed.state:parsed),current=localStorage.getItem(SAVE_KEY);if(validJson(current))localStorage.setItem(BACKUP_KEY,current);localStorage.setItem(SAVE_KEY,JSON.stringify(state));this.state=this.load();this.save();this.onChange();window.dispatchEvent(new CustomEvent('elderwild-save-imported'));return true};
 Game.prototype.restoreBackup=function(){const raw=localStorage.getItem(BACKUP_KEY);if(!raw)throw new Error('No browser backup is available.');validateState(JSON.parse(raw));localStorage.setItem(SAVE_KEY,raw);this.state=this.load();this.save();this.onChange();window.dispatchEvent(new CustomEvent('elderwild-save-restored'));return true};
 Game.prototype.hasBrowserBackup=function(){return validJson(localStorage.getItem(BACKUP_KEY))};
 Game.prototype.reset=function(...args){localStorage.removeItem(BACKUP_KEY);return originalReset.apply(this,args)};
 Game.prototype.__saveSafetyPatched=true;
}

if(!Game.prototype.__hp10Patched){
 const originalLoad=Game.prototype.load,originalReset=Game.prototype.reset;
 Game.prototype.load=function(...args){const state=originalLoad.apply(this,args);state.skills??={};const hp=state.skills.HP||{xp:0,actions:0};state.skills.HP={...hp,xp:Math.max(HP10_XP,Number(hp.xp)||0),actions:Number(hp.actions)||0};return state};
 Game.prototype.reset=function(...args){const result=originalReset.apply(this,args);this.state.skills.HP={...(this.state.skills.HP||{}),xp:HP10_XP,actions:0};this.save();this.onChange();return result};
 Game.prototype.__hp10Patched=true;
}
export{HP10_XP,SAVE_KEY,BACKUP_KEY,CURRENT_MARKER};

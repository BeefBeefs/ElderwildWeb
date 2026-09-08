import{Game,xpForLevel}from'./game.js';
const CURRENT_MARKER='elderwild-web-schema-v3',SAVE_KEY='elderwild-web-save-v2',LEGACY_SAVE_KEY='elderwild-web-save-v1',HP10_XP=xpForLevel(10);
if(localStorage.getItem(CURRENT_MARKER)!=='1'){
  localStorage.removeItem(LEGACY_SAVE_KEY);
  localStorage.removeItem(SAVE_KEY);
  localStorage.setItem(CURRENT_MARKER,'1');
}
if(!Game.prototype.__hp10Patched){
  const originalLoad=Game.prototype.load,originalReset=Game.prototype.reset;
  Game.prototype.load=function(...args){
    const state=originalLoad.apply(this,args);
    state.skills??={};
    const hp=state.skills.HP||{xp:0,actions:0};
    state.skills.HP={...hp,xp:Math.max(HP10_XP,Number(hp.xp)||0),actions:Number(hp.actions)||0};
    return state;
  };
  Game.prototype.reset=function(...args){
    const result=originalReset.apply(this,args);
    this.state.skills.HP={...(this.state.skills.HP||{}),xp:HP10_XP,actions:0};
    this.save();
    this.onChange();
    return result;
  };
  Game.prototype.__hp10Patched=true;
}
export{HP10_XP};

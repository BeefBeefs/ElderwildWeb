import{Game}from'./game.js';
import{randomQuantity}from'./combat.js';

const AUTO_FIGHT_DELAY_TICKS=12;
const emptyLuckiest=()=>({itemName:'',attempts:0,chance:0,source:''});
function normalizeLuckiest(raw){return raw&&typeof raw==='object'?{itemName:String(raw.itemName||''),attempts:Math.max(0,Number(raw.attempts)||0),chance:Math.max(0,Number(raw.chance)||0),source:String(raw.source||'')} : emptyLuckiest()}

if(!Game.prototype.__pass2LootPatched){
  const originalLoad=Game.prototype.load;
  const originalReset=Game.prototype.reset;

  Game.prototype.load=function(...args){
    window.__elderwildGame=this;
    const state=originalLoad.apply(this,args);
    state.luckiestDrop=normalizeLuckiest(state.luckiestDrop);
    return state;
  };

  Game.prototype.reset=function(...args){
    const result=originalReset.apply(this,args);
    this.state.luckiestDrop=emptyLuckiest();
    this.save();
    this.onChange();
    return result;
  };

  Game.prototype.globalDropBoostPercent=function(){return this.completedCollections()*.1};
  Game.prototype.effectiveDropChance=function(baseChance){return Math.max(0,Math.min(1,(Number(baseChance)||0)*(1+this.globalDropBoostPercent()/100)))};
  Game.prototype.recordLuckiestDrop=function(itemName,attempts,chance,source){
    chance=Number(chance)||0;
    if(chance<=0)return false;
    const current=normalizeLuckiest(this.state.luckiestDrop);
    if(current.itemName&&current.chance>0&&chance>=current.chance)return false;
    this.state.luckiestDrop={itemName:String(itemName||''),attempts:Math.max(1,Number(attempts)||1),chance,source:String(source||'')};
    return true;
  };

  Game.prototype.resolveVictory=function(enemy){
    const c=this.state.combat,drops=[],rareEvents=[];
    const wasComplete=this.isCollectionComplete(enemy);
    const attempts=this.getKillCount(enemy.name)+1;

    for(const drop of enemy.drops){
      const effectiveChance=this.effectiveDropChance(drop.chance);
      if(Math.random()>effectiveChance)continue;
      const quantity=randomQuantity(drop.min,drop.max);
      if(!this.addItem(drop.item,quantity))continue;

      drops.push(`${quantity}× ${drop.item}`);
      this.recordLuckiestDrop(drop.item,attempts,effectiveChance,`${enemy.name} kills`);
      this.recordCollectionDrop(drop.item);

      if(effectiveChance<=.01){
        rareEvents.push({item:drop.item,quantity,chance:effectiveChance,baseChance:drop.chance,enemyName:enemy.name});
      }
    }

    const becameComplete=!wasComplete&&this.isCollectionComplete(enemy);
    this.recordCollectionKill(enemy.name);

    const result=`Defeated ${enemy.name}${drops.length?` — ${drops.join(', ')}`:' — no drops'}.`;
    c.active=false;c.enemyName=null;c.enemyHP=0;c.playerTick=0;c.enemyTick=0;
    if(c.autoFightEnabled&&c.playerHP>0){
      c.respawning=true;c.respawnEnemyName=enemy.name;c.respawnTicks=AUTO_FIGHT_DELAY_TICKS;
      c.lastLog=`${result} Auto-fight resumes in ${AUTO_FIGHT_DELAY_TICKS} ticks.`;
      this.startLoop();
    }else{
      c.autoFightEnabled=false;c.respawning=false;c.respawnEnemyName=null;c.respawnTicks=0;c.lastLog=result;
      this.maybeStopLoop();
    }

    this.save();
    for(const detail of rareEvents)window.dispatchEvent(new CustomEvent('elderwild-rare-drop',{detail}));
    if(becameComplete)window.dispatchEvent(new CustomEvent('elderwild-collection-complete',{detail:{enemyName:enemy.name,boostPercent:this.globalDropBoostPercent()}}));
  };

  Game.prototype.__pass2LootPatched=true;
}

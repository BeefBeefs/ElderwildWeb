import{Game}from'./game.js';
import{ENEMIES,COMBAT_STYLES,styledAttack,styledStrength,styledDefense,weaknessAttack,weaknessDamage,reduceIncoming,reduceEnemyIncoming,enemyAttackLevel,enemyDefenseLevel,enemyAttackSpeed,enemyRegenAmount,rollHit,maxHit}from'./combat.js';

export const COMBAT_ABILITIES={
  Precise:{style:COMBAT_STYLES.ATTACK,label:'Precise',description:'Next attack gets +25% accuracy'},
  Power:{style:COMBAT_STYLES.STRENGTH,label:'Power',description:'Next hit deals 50% more damage'},
  Guard:{style:COMBAT_STYLES.DEFENSE,label:'Guard',description:'Next hit taken deals 50% less damage'}
};
export const ABILITY_COOLDOWN_TICKS=30;

if(!Game.prototype.__combatAbilitiesPatched){
  const originalStartFight=Game.prototype.startFight;
  Game.prototype.startFight=function(...args){const result=originalStartFight.apply(this,args);if(result){this.state.combat.primedAbility=null;this.state.combat.abilityCooldown=0;this.save();this.onChange()}return result};
  const originalSetStyle=Game.prototype.setCombatStyle;
  Game.prototype.setCombatStyle=function(style){originalSetStyle.apply(this,arguments);const c=this.state.combat,a=COMBAT_ABILITIES[c.primedAbility];if(a&&a.style!==style){c.primedAbility=null;this.save();this.onChange()}};
  Game.prototype.activateCombatAbility=function(name){const c=this.state.combat,a=COMBAT_ABILITIES[name];if(!c.active||!a||a.style!==c.style||c.primedAbility||Number(c.abilityCooldown)>0)return false;c.primedAbility=name;c.abilityCooldown=ABILITY_COOLDOWN_TICKS;this.save();this.onChange();return true};

  Game.prototype.tickCombat=function(){
    const c=this.state.combat,enemy=ENEMIES.find(e=>e.name===c.enemyName);if(!enemy){this.stopFight(false);return}
    if(Number(c.abilityCooldown)>0)c.abilityCooldown=Math.max(0,Number(c.abilityCooldown)-1);
    if(c.autoEatCooldown>0)c.autoEatCooldown--;this.tryAutoEat();c.playerTick++;c.enemyTick++;
    const style=c.style,baseAtk=weaknessAttack(enemy,style,styledAttack(this.effectiveAttack(),style)),str=styledStrength(this.effectiveStrength(),style),def=styledDefense(this.effectiveDefense(),style);
    if(c.playerTick>=this.attackSpeed()){
      c.playerTick=0;let atk=baseAtk;const precise=c.primedAbility==='Precise';if(precise){atk=Math.ceil(atk*1.25);c.primedAbility=null}
      let damage=rollHit(atk,enemyDefenseLevel(enemy),maxHit(str));
      if(damage>0){if(c.primedAbility==='Power'){damage=Math.ceil(damage*1.5);c.primedAbility=null}damage=weaknessDamage(enemy,style,damage);damage=reduceEnemyIncoming(enemy,damage)}
      c.enemyHP=Math.max(0,c.enemyHP-damage);c.lastLog=damage?`You hit ${enemy.name} for ${damage}.`:`You miss ${enemy.name}.`;
      if(damage>0){this.state.skills[style].xp+=damage*4;this.state.skills.HP.xp+=damage}
      if(c.enemyHP<=0){this.resolveVictory(enemy);return}
    }
    if(c.active&&c.enemyTick>=enemyAttackSpeed(enemy)){
      c.enemyTick=0;let damage=rollHit(enemyAttackLevel(enemy),def,maxHit(enemy.strength));damage=reduceIncoming(style,damage);
      if(damage>0&&c.primedAbility==='Guard'){damage=Math.max(0,Math.floor(damage*.5));c.primedAbility=null}
      c.playerHP=Math.max(0,c.playerHP-damage);let regen=0;if(damage>0){regen=enemyRegenAmount(enemy);if(regen>0)c.enemyHP=Math.min(enemy.hp,c.enemyHP+regen)}
      c.lastLog=damage?`${enemy.name} hits you for ${damage}.${regen?` It regenerates ${regen} HP.`:''}`:`${enemy.name} misses you.`;
      if(c.playerHP<=0){c.lastLog=`You were defeated by ${enemy.name}.`;c.active=false;c.enemyName=null;c.autoFightEnabled=false;c.respawning=false;c.respawnEnemyName=null;c.respawnTicks=0;c.primedAbility=null;c.abilityCooldown=0;this.maybeStopLoop();this.save();return}
      this.tryAutoEat()
    }
    this.save()
  };
  Game.prototype.__combatAbilitiesPatched=true;
}

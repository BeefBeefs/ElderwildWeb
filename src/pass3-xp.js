import{Game}from'./game.js';
import{ENEMIES}from'./combat.js';

function skillXpPercent(level){return Math.min(10,Math.floor(Math.max(1,Number(level)||1)/10))}
function combatXpPercent(playerCombatLevel,enemyCombatLevel){return Math.min(10,Math.max(0,Math.floor(((Number(playerCombatLevel)||0)-(Number(enemyCombatLevel)||0))/20)))}
function enemyCombatLevel(enemy){return Math.max(1,Math.floor(((Number(enemy?.attack)||0)+(Number(enemy?.strength)||0)+(Number(enemy?.defense)||0)+(Number(enemy?.hp)||0))/4))}

if(!Game.prototype.__pass3XpPatched){
  Game.prototype.skillXpBonusPercent=function(skillName){return skillXpPercent(this.getSkill(skillName).level)};
  Game.prototype.skillXpMultiplier=function(skillName){return 1+this.skillXpBonusPercent(skillName)/100};
  Game.prototype.combatLevel=function(){return Math.max(1,Math.floor((this.effectiveAttack()+this.effectiveStrength()+this.effectiveDefense()+this.maxHP())/4))};
  Game.prototype.combatXpBonusPercent=function(enemy){return combatXpPercent(this.combatLevel(),enemyCombatLevel(enemy))};
  Game.prototype.combatXpMultiplier=function(enemy){return 1+this.combatXpBonusPercent(enemy)/100};

  const originalTickActivity=Game.prototype.tickActivity;
  Game.prototype.tickActivity=function(){
    const active=this.state.activity;
    if(!active)return originalTickActivity.apply(this,arguments);
    const skillState=this.state.skills[active.skillName],before=Number(skillState?.xp)||0;
    originalTickActivity.apply(this,arguments);
    const after=Number(skillState?.xp)||0,baseGain=after-before;
    if(baseGain<=0)return;
    const bonus=baseGain*(this.skillXpMultiplier(active.skillName)-1);
    if(bonus>0){skillState.xp+=bonus;this.save()}
  };

  const originalTickCombat=Game.prototype.tickCombat;
  Game.prototype.tickCombat=function(){
    const enemyName=this.state.combat?.enemyName,enemy=ENEMIES.find(e=>e.name===enemyName);
    if(!enemy)return originalTickCombat.apply(this,arguments);
    const style=this.state.combat.style,hpState=this.state.skills.HP,styleState=this.state.skills[style];
    const hpBefore=Number(hpState?.xp)||0,styleBefore=Number(styleState?.xp)||0;
    originalTickCombat.apply(this,arguments);
    const multiplier=this.combatXpMultiplier(enemy);
    if(multiplier<=1)return;
    const hpGain=(Number(hpState?.xp)||0)-hpBefore,styleGain=(Number(styleState?.xp)||0)-styleBefore;
    let changed=false;
    if(hpGain>0){hpState.xp+=hpGain*(multiplier-1);changed=true}
    if(styleGain>0){styleState.xp+=styleGain*(multiplier-1);changed=true}
    if(changed)this.save();
  };

  Game.prototype.__pass3XpPatched=true;
}

export{skillXpPercent,combatXpPercent,enemyCombatLevel};

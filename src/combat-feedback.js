import{Game}from'./game.js';
import{ENEMIES}from'./combat.js';

if(!Game.prototype.__combatFeedbackPatched){
 const originalTick=Game.prototype.tickCombat;
 Game.prototype.tickCombat=function(){
  const c=this.state.combat,enemy=ENEMIES.find(e=>e.name===c.enemyName),style=c?.style;
  const hpBefore=Number(c?.playerHP)||0,enemyBefore=Number(c?.enemyHP)||0,styleXp=Number(this.state.skills?.[style]?.xp)||0,hpXp=Number(this.state.skills?.HP?.xp)||0;
  const result=originalTick.apply(this,arguments);
  if(enemy){
   const enemyAfter=Number(c.enemyHP)||0,playerAfter=Number(c.playerHP)||0;
   const dealt=Math.max(0,enemyBefore-enemyAfter),taken=Math.max(0,hpBefore-playerAfter);
   const styleGain=Math.max(0,(Number(this.state.skills?.[style]?.xp)||0)-styleXp),hpGain=Math.max(0,(Number(this.state.skills?.HP?.xp)||0)-hpXp);
   if(dealt||taken||styleGain||hpGain)window.dispatchEvent(new CustomEvent('elderwild-combat-feedback',{detail:{enemyName:enemy.name,dealt,taken,style,styleXp:styleGain,hpXp:hpGain,enemyHP:enemyAfter,playerHP:playerAfter}}));
  }
  return result;
 };
 const originalVictory=Game.prototype.resolveVictory;
 Game.prototype.resolveVictory=function(enemy){
  const before=new Map(this.state.inventory.map(i=>[`${i.name}|${i.upgradeLevel||0}`,Number(i.quantity)||0]));
  const killsBefore=this.getKillCount(enemy.name);const result=originalVictory.apply(this,arguments),loot=[];
  for(const item of this.state.inventory){const key=`${item.name}|${item.upgradeLevel||0}`,gain=(Number(item.quantity)||0)-(before.get(key)||0);if(gain>0)loot.push({name:item.name,quantity:gain,upgradeLevel:item.upgradeLevel||0})}
  window.dispatchEvent(new CustomEvent('elderwild-combat-victory',{detail:{enemyName:enemy.name,killCount:Math.max(killsBefore+1,this.getKillCount(enemy.name)),loot,autoFight:!!this.state.combat.autoFightEnabled,respawnTicks:Number(this.state.combat.respawnTicks)||0}}));return result;
 };
 Game.prototype.__combatFeedbackPatched=true;
}

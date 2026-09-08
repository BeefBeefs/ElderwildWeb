import{Game}from'./game.js';
import{ENEMIES,enemyAttackSpeed}from'./combat.js';

if(!Game.prototype.__combatMiniBarPatched){
  const originalSave=Game.prototype.save;
  Game.prototype.save=function(...args){
    window.__elderwildGame=this;
    const result=originalSave.apply(this,args);
    window.dispatchEvent(new CustomEvent('elderwild-game-state',{detail:this.state}));
    return result;
  };
  Game.prototype.__combatMiniBarPatched=true;
}

const style=document.createElement('style');
style.textContent=`.combat-mini-bar{position:fixed;left:8px;right:8px;bottom:62px;z-index:7;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px 9px;align-items:center;padding:9px;background:#1b211e;border:1px solid #4f735d;border-radius:10px;box-shadow:0 5px 20px #000a;cursor:pointer}.combat-mini-copy{min-width:0}.combat-mini-copy strong{display:block;color:#72d88d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.combat-mini-copy span{display:block;color:#a7b5ab;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.combat-mini-copy .game-sprite{width:32px;height:32px;min-width:32px;background-repeat:no-repeat;image-rendering:pixelated;image-rendering:crisp-edges}.combat-mini-health{grid-column:1/2;display:grid;gap:4px}.combat-mini-hp-row{display:grid;grid-template-columns:minmax(72px,auto) 1fr;gap:6px;align-items:center;font-size:10px;color:#c8d3cb}.combat-mini-track{height:7px;background:#243027;border:1px solid #3d5846;border-radius:99px;overflow:hidden}.combat-mini-fill{height:100%;background:#57c879;transition:width .12s linear}.combat-mini-fill.enemy{background:#a84d4d}.combat-mini-actions{grid-column:2;grid-row:1/3;display:grid;gap:5px;width:76px}.combat-mini-actions button{width:100%;padding:7px 4px;font-size:10px;border:1px solid #4f735d;border-radius:6px;background:#27332c}.combat-mini-actions button.active{color:#7ee99b;border-color:#65cc82}.combat-mini-actions .run{background:#4a2626;border-color:#754141}@media(min-width:700px){.combat-mini-bar{max-width:870px;margin:auto;bottom:70px}}`;
document.head.appendChild(style);

const bar=document.createElement('section');
bar.id='combat-mini-bar';bar.className='combat-mini-bar hidden';bar.setAttribute('aria-live','polite');
bar.innerHTML=`<div class="combat-mini-copy"><strong id="combat-mini-name"></strong><span id="combat-mini-status"></span></div><div class="combat-mini-health"><div class="combat-mini-hp-row"><span id="combat-mini-player-text"></span><div class="combat-mini-track"><div id="combat-mini-player-fill" class="combat-mini-fill"></div></div></div><div class="combat-mini-hp-row"><span id="combat-mini-enemy-text"></span><div class="combat-mini-track"><div id="combat-mini-enemy-fill" class="combat-mini-fill enemy"></div></div></div></div><div class="combat-mini-actions"><button id="combat-mini-auto">Auto</button><button id="combat-mini-run" class="run">Run</button></div>`;
document.querySelector('#app')?.appendChild(bar);

const nameEl=bar.querySelector('#combat-mini-name'),statusEl=bar.querySelector('#combat-mini-status'),playerText=bar.querySelector('#combat-mini-player-text'),enemyText=bar.querySelector('#combat-mini-enemy-text'),playerFill=bar.querySelector('#combat-mini-player-fill'),enemyFill=bar.querySelector('#combat-mini-enemy-fill'),autoBtn=bar.querySelector('#combat-mini-auto'),runBtn=bar.querySelector('#combat-mini-run');
const pct=(value,max)=>Math.max(0,Math.min(100,max>0?value/max*100:0));
function openCombat(){document.querySelector('.nav-button[data-view="combat"]')?.click()}
function setEnemyTitle(enemy,fallback='Enemy'){
  const label=enemy?.name||fallback,sprite=enemy?window.__elderwildMakeSprite?.('enemies',enemy.name):null;
  nameEl.classList.toggle('sprite-label',!!sprite);nameEl.replaceChildren();
  if(sprite)nameEl.append(sprite,document.createTextNode(label));else nameEl.textContent=label;
}
function render(){
  const game=window.__elderwildGame,c=game?.state?.combat;
  if(!game||!c||(!c.active&&!c.respawning)){bar.classList.add('hidden');return}
  bar.classList.remove('hidden');
  if(c.respawning){
    const enemy=ENEMIES.find(e=>e.name===c.respawnEnemyName),max=game.maxHP();
    setEnemyTitle(enemy,c.respawnEnemyName||'Enemy');
    statusEl.textContent=`Respawning · ${c.respawnTicks} tick${c.respawnTicks===1?'':'s'} remaining`;
    playerText.textContent=`You ${c.playerHP}/${max} HP`;playerFill.style.width=`${pct(c.playerHP,max)}%`;
    enemyText.textContent=`Respawn ${12-c.respawnTicks}/12`;enemyFill.style.width=`${pct(12-c.respawnTicks,12)}%`;
    autoBtn.textContent='Stop Auto';autoBtn.classList.add('active');runBtn.textContent='View';return;
  }
  const enemy=ENEMIES.find(e=>e.name===c.enemyName);if(!enemy){bar.classList.add('hidden');return}
  const playerSpeed=game.attackSpeed(),enemySpeed=enemyAttackSpeed(enemy),max=game.maxHP();
  setEnemyTitle(enemy,enemy.name);
  statusEl.textContent=`Atk ${Math.min(c.playerTick,playerSpeed)}/${playerSpeed} · Enemy ${Math.min(c.enemyTick,enemySpeed)}/${enemySpeed}${c.autoFightEnabled?' · AUTO':''}`;
  playerText.textContent=`You ${c.playerHP}/${max} HP`;playerFill.style.width=`${pct(c.playerHP,max)}%`;
  enemyText.textContent=`${enemy.name} ${c.enemyHP}/${enemy.hp}`;enemyFill.style.width=`${pct(c.enemyHP,enemy.hp)}%`;
  autoBtn.textContent=c.autoFightEnabled?'Auto On':'Auto';autoBtn.classList.toggle('active',c.autoFightEnabled);runBtn.textContent='Run';
}
bar.addEventListener('click',event=>{if(!event.target.closest('button'))openCombat()});
autoBtn.addEventListener('click',event=>{event.stopPropagation();const game=window.__elderwildGame,c=game?.state?.combat;if(game&&c)game.setAutoFightEnabled(!c.autoFightEnabled)});
runBtn.addEventListener('click',event=>{event.stopPropagation();const game=window.__elderwildGame,c=game?.state?.combat;if(!game||!c)return;if(c.active)game.stopFight();else openCombat()});
window.addEventListener('elderwild-game-state',render);
setInterval(render,250);
render();

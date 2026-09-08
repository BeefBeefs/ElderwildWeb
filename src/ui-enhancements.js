import{ENEMIES}from'./combat.js';
import'./combat-mini-bar.js';
import'./settings-save-ui.js';

const AREAS=[
  {tier:1,name:'Greenvale',description:'Bright grasslands, lakes, and castle countryside.'},
  {tier:2,name:'Mirewood',description:'Gloomy, overgrown swamp and dead forest.'},
  {tier:3,name:'Frostpeak',description:'Snowy mountains and frozen mines.'},
  {tier:4,name:'Emberfall',description:'Volcanic wasteland and lava fields.'},
  {tier:5,name:'Sandswept Ruins',description:'Ancient desert civilization and buried temples.'},
  {tier:6,name:'The Astral Reach',description:'Floating islands, purple skies, and arcane ruins.'},
  {tier:7,name:'The Umbral Expanse',description:'Corrupted realm beneath the black sun.'}
];
function enhanceCombatStyles(){document.querySelectorAll('.settings-row').forEach(row=>{if(row.querySelector('[data-style]'))row.classList.add('combat-style-selector')})}
function findEnemyList(){return[...document.querySelectorAll('.activity-list')].find(list=>[...list.children].some(child=>child.querySelector?.('[data-enemy],[data-auto-enemy]')))}
function enhanceEnemyAreas(){const list=findEnemyList();if(!list||list.dataset.areaGrouped==='true')return;list.dataset.areaGrouped='true';const cards=[...list.children],byName=new Map();cards.forEach(card=>{const button=card.querySelector('[data-enemy],[data-auto-enemy]'),name=button?.dataset.enemy||button?.dataset.autoEnemy;if(name)byName.set(name,card)});list.innerHTML='';AREAS.forEach(area=>{const areaEnemies=ENEMIES.filter(enemy=>enemy.tier===area.tier),details=document.createElement('details');details.className='area-group';if(area.tier===1)details.open=true;const summary=document.createElement('summary');summary.innerHTML=`<span><strong>${area.name}</strong><small>${area.description}</small></span><span class="area-count">${areaEnemies.length}</span>`;details.appendChild(summary);const body=document.createElement('div');body.className='area-enemy-list';if(areaEnemies.length===0)body.innerHTML='<p class="muted area-pending">Enemy data pending migration.</p>';else areaEnemies.forEach(enemy=>{const card=byName.get(enemy.name);if(card)body.appendChild(card)});details.appendChild(body);list.appendChild(details)})}
let queued=false;function enhance(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhanceCombatStyles();enhanceEnemyAreas()})}new MutationObserver(enhance).observe(document.querySelector('#view'),{childList:true,subtree:true});enhance();

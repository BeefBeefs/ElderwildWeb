import{ENEMIES}from'./combat.js';
import{ITEMS}from'./items.js';
import{SKILLS}from'./data.js';

const manifestUrl=new URL('../assets/sprite-manifest.json',import.meta.url);
let manifest=window.__elderwildPreloadCache?.manifest||null;
if(!manifest){try{manifest=await fetch(manifestUrl,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(`Sprite manifest ${r.status}`);return r.json()})}catch(error){console.warn('Sprite manifest unavailable',error)}}

const style=document.createElement('style');
style.textContent=`.game-sprite{display:inline-block;width:32px;height:32px;min-width:32px;vertical-align:middle;background-repeat:no-repeat;image-rendering:pixelated;image-rendering:crisp-edges}.skill-sprite{width:24px;height:24px;min-width:24px;background-size:24px 24px!important}.sprite-label{display:inline-flex!important;align-items:center;gap:7px}.sprite-label>.game-sprite{flex:0 0 32px}.sprite-label>.skill-sprite{flex-basis:24px}.combat-mini-copy .sprite-label{display:flex!important}.rare-item.sprite-label{justify-content:center}.drop-row .sprite-label{gap:5px}.equipment-slot .game-sprite,.inventory-slot .game-sprite{flex:0 0 32px}.skill-icon{display:inline-flex;align-items:center;vertical-align:middle}.activity-copy #activity-name.sprite-label{display:flex!important}`;
document.head.appendChild(style);

const slug=value=>String(value).replace(/ \+\d+$/,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
const enemyNames=[...ENEMIES.map(e=>e.name)].sort((a,b)=>b.length-a.length);
const itemNames=[...new Set(Object.values(ITEMS).map(i=>i?.name).filter(Boolean).map(name=>name.replace(/ \+\d+$/,'')))].sort((a,b)=>b.length-a.length);
const skillNames=SKILLS.map(s=>s.name);
const atlasUrl={};
if(manifest){for(const key of ['enemies','items']){const group=manifest[key];if(group)atlasUrl[key]=new URL('../'+group.image,import.meta.url).href}}

function entryFor(kind,name){if(!manifest)return null;const group=manifest[kind],prefix=kind==='enemies'?'enemy_':'item_';return group?.entries?.[`${prefix}${slug(name)}.png`]||null}
function makeSprite(kind,name){
  if(kind==='skills'){
    if(!skillNames.includes(name))return null;
    const el=document.createElement('span');el.className='game-sprite skill-sprite';el.setAttribute('aria-hidden','true');el.title=name;
    el.style.backgroundImage=`url("${new URL(`../assets/skills/skill_${slug(name)}.png`,import.meta.url).href}")`;el.style.backgroundPosition='center';el.style.backgroundSize='24px 24px';return el;
  }
  const group=manifest?.[kind],entry=entryFor(kind,name);if(!group||!entry)return null;const el=document.createElement('span');el.className='game-sprite';el.setAttribute('aria-hidden','true');el.title=name;el.style.backgroundImage=`url("${atlasUrl[kind]}")`;el.style.backgroundPosition=`-${entry.x}px -${entry.y}px`;el.style.backgroundSize=`${group.width}px ${group.height}px`;return el;
}
window.__elderwildMakeSprite=makeSprite;
function findName(text,names){const value=String(text||'').trim();return names.find(name=>value===name||value.endsWith(` ${name}`)||value.startsWith(`${name} `)||value.startsWith(`${name} ·`)||value.startsWith(`${name} ×`))||null}
function decorate(el,kind,name){if(!el||el.dataset.spriteEnhanced==='1')return;const sprite=makeSprite(kind,name);if(!sprite)return;const original=el.textContent.trim();let label=original;if(original===name||original.endsWith(` ${name}`))label=name;el.textContent='';el.classList.add('sprite-label');el.append(sprite,document.createTextNode(label));el.dataset.spriteEnhanced='1'}
function decorateEnemy(el){if(!el||el.dataset.spriteEnhanced==='1')return;const name=findName(el.textContent,enemyNames);if(name)decorate(el,'enemies',name)}
function decorateItem(el){if(!el||el.dataset.spriteEnhanced==='1'||el.closest('.drop-row.unknown'))return;const name=findName(el.textContent,itemNames);if(name)decorate(el,'items',name)}
function skillFromText(text){const value=String(text||'');return skillNames.find(name=>value.includes(name))||null}
function decorateSkillText(el,skill,label){if(!el||el.dataset.skillSpriteEnhanced==='1')return;const sprite=makeSprite('skills',skill);if(!sprite)return;el.textContent='';el.classList.add('sprite-label');el.append(sprite,document.createTextNode(label));el.dataset.skillSpriteEnhanced='1'}
function enhanceSkills(root=document){
  root.querySelectorAll?.('#view [data-skill]').forEach(card=>{const skill=card.dataset.skill,icon=card.querySelector('.skill-icon');if(!skill||!icon||icon.querySelector('.skill-sprite'))return;const sprite=makeSprite('skills',skill);if(sprite)icon.replaceChildren(sprite)});
  root.querySelectorAll?.('#view .panel .grid .card strong').forEach(el=>{if(el.closest('[data-skill]'))return;const skill=skillFromText(el.textContent);if(skill)decorateSkillText(el,skill,skill)});
  root.querySelectorAll?.('#view h2').forEach(el=>{const skill=skillFromText(el.textContent);if(!skill||!el.textContent.includes('Level'))return;const original=el.textContent.trim(),index=original.indexOf(skill);decorateSkillText(el,skill,index>=0?original.slice(index):original)});
  const skillHeading=[...root.querySelectorAll?.('#view h2')||[]].find(el=>el.textContent.includes('Level')),activeSkill=skillHeading?skillFromText(skillHeading.textContent):null;
  if(activeSkill)root.querySelectorAll?.('#view .activity-card').forEach(card=>{const btn=card.querySelector('[data-activity]'),label=card.querySelector('strong');if(btn&&label)decorateSkillText(label,activeSkill,btn.dataset.activity)});
  const activity=document.querySelector('#activity-name');if(activity&&!activity.querySelector('.skill-sprite')){const skill=skillFromText(activity.textContent);if(skill){const text=activity.textContent.trim(),sprite=makeSprite('skills',skill);if(sprite){activity.classList.add('sprite-label');activity.replaceChildren(sprite,document.createTextNode(text))}}}
}
function enhance(root=document){
  enhanceSkills(root);
  root.querySelectorAll?.('#view .activity-card strong,#view .card .skill-row strong,#view h3').forEach(decorateEnemy);
  root.querySelectorAll?.('#view .inventory-slot .skill-row strong,#view .equipment-slot span,#view .drop-row span:first-child,.rare-notification .rare-item').forEach(decorateItem);
  root.querySelectorAll?.('.offline-summary li,.offline-summary-row,.offline-loot-row').forEach(decorateItem);
}
let queued=false;function queueEnhance(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance(document)})}
new MutationObserver(queueEnhance).observe(document.body,{childList:true,subtree:true});
window.addEventListener('elderwild-game-state',queueEnhance);
window.addEventListener('elderwild-rare-drop',()=>setTimeout(queueEnhance,0));
enhance(document);
export{makeSprite};

import{SKILLS}from'./data.js';
import{xpForLevel}from'./game.js';
import{makeSprite}from'./sprite-ui.js';

const style=document.createElement('style');
style.textContent=`
.skill-detail-page{position:relative;overflow:hidden;background:linear-gradient(180deg,#18201ccc,#111613ee)!important;backdrop-filter:blur(1px)}
.skill-detail-page>h2,.skill-detail-page>p{display:none}
.skill-detail-hero{display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;align-items:center;padding:12px;margin-bottom:12px;border:1px solid #4f735d;border-radius:10px;background:linear-gradient(180deg,#223028e6,#151c18e8);box-shadow:0 10px 24px #0006}
.skill-detail-icon{width:58px;height:58px;display:grid;place-items:center;border:1px solid #4f735d;border-radius:10px;background:#0f1512}
.skill-detail-icon .game-sprite{transform:scale(1.45);transform-origin:center}
.skill-detail-title{min-width:0}.skill-detail-title h2{display:block!important;margin:0 0 2px;color:#72d88d!important;font-size:24px}.skill-detail-level{font-weight:800;color:#edf4ef}.skill-detail-xp{display:flex;justify-content:space-between;gap:10px;margin-top:5px;font-size:11px;color:#a7b5ab}.skill-detail-hero .xpbar{margin-top:6px;height:12px!important}
.skill-detail-section-title{margin:8px 0 7px;color:#72d88d;font-size:15px;letter-spacing:.08em;text-transform:uppercase}
.skill-detail-page .activity-list{display:grid;gap:8px}
.skill-detail-page .activity-card{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px;border-radius:9px;background:linear-gradient(180deg,#19211dcc,#111713e8)!important}
.skill-detail-page .activity-card.skill-active{border-color:#57c879!important;box-shadow:0 0 0 1px #57c87933 inset,0 0 12px #57c8791f}
.skill-detail-page .activity-card.locked{opacity:.58}
.skill-activity-name{display:flex;align-items:center;gap:6px;font-weight:800;color:#edf4ef}.skill-activity-meta{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px}.skill-chip{padding:3px 6px;border:1px solid #3a5144;border-radius:999px;background:#101612;color:#a7b5ab;font-size:10px}.skill-chip.reward{border-color:#345b48;color:#7ee99b}.skill-chip.locked{border-color:#704949;color:#d97979}.skill-active-badge{display:inline-block;margin-top:5px;padding:3px 7px;border-radius:999px;background:#214b31;color:#8ff0a9;font-size:10px;font-weight:800}
.skill-detail-page .activity-card>.action-button{min-width:78px}.skill-detail-page .activity-card.skill-active>.action-button{border-color:#68d789!important;color:#8ff0a9!important}
#back-skills.skill-detail-back{margin-bottom:9px;background:#1a241f!important}
@media(max-width:420px){.skill-detail-hero{grid-template-columns:46px minmax(0,1fr)}.skill-detail-icon{width:46px;height:46px}.skill-detail-title h2{font-size:21px}.skill-detail-page .activity-card{grid-template-columns:1fr}.skill-detail-page .activity-card>.action-button{width:100%}}
`;
document.head.appendChild(style);

const view=document.querySelector('#view');
const game=()=>window.__elderwildGame;
const pct=(v,max)=>Math.max(0,Math.min(100,max>0?v/max*100:0));
function progress(skill){const base=xpForLevel(skill.level),next=skill.level>=99?base:xpForLevel(skill.level+1);return skill.level>=99?100:pct(skill.xp-base,next-base)}
function findSkill(){const panel=view.querySelector('.panel'),h2=panel?.querySelector('h2');if(!panel||!h2||!view.querySelector('#back-skills'))return null;const text=h2.textContent||'';return SKILLS.find(s=>text.includes(s.name))||null}
function decorate(){const def=findSkill(),g=game();if(!def||!g){if(!view.querySelector('#back-skills'))document.documentElement.style.removeProperty('--page-art');return}document.documentElement.style.setProperty('--page-art',"url('assets/backgrounds/background_skill.png')");const panel=view.querySelector('.panel');if(!panel||panel.dataset.skillDetailEnhanced===def.name)return;panel.dataset.skillDetailEnhanced=def.name;panel.classList.add('skill-detail-page');document.querySelector('#back-skills')?.classList.add('skill-detail-back');
 const skill=g.getSkill(def.name),base=xpForLevel(skill.level),next=skill.level>=99?base:xpForLevel(skill.level+1),remaining=skill.level>=99?0:Math.max(0,next-skill.xp),hero=document.createElement('div');hero.className='skill-detail-hero';const iconWrap=document.createElement('div');iconWrap.className='skill-detail-icon';const icon=makeSprite('skills',def.name);if(icon)iconWrap.appendChild(icon);else iconWrap.textContent=def.icon||'•';const info=document.createElement('div');info.className='skill-detail-title';info.innerHTML=`<h2>${def.name}</h2><div class="skill-detail-level">Level ${skill.level}${skill.level>=99?' · MAX':''}</div><div class="skill-detail-xp"><span>${Math.floor(skill.xp).toLocaleString()} XP</span><span>${skill.level>=99?'Maximum level':`${Math.ceil(remaining).toLocaleString()} XP to ${skill.level+1}`}</span></div><div class="xpbar"><div class="xpfill" style="width:${progress(skill)}%"></div></div>`;hero.append(iconWrap,info);panel.insertBefore(hero,panel.querySelector('.activity-list'));
 const title=document.createElement('div');title.className='skill-detail-section-title';title.textContent='Activities';panel.insertBefore(title,panel.querySelector('.activity-list'));
 const active=g.state.activity;for(const card of panel.querySelectorAll('.activity-card')){const btn=card.querySelector('[data-activity]'),activity=def.activities.find(a=>a.name===btn?.dataset.activity);if(!activity)continue;const isActive=active?.skillName===def.name&&active?.activityName===activity.name;card.classList.toggle('skill-active',!!isActive);const copy=card.firstElementChild;if(copy){const seconds=Math.max(.6,(Number(activity.ticks)||1)*.6),perHour=3600/seconds,xpHour=Math.floor(perHour*(Number(activity.xp)||0));copy.innerHTML=`<div class="skill-activity-name"><span>${activity.icon||''}</span><span>${activity.name}</span></div><div class="skill-activity-meta"><span class="skill-chip ${skill.level<activity.level?'locked':''}">Level ${activity.level}</span><span class="skill-chip">${activity.xp} XP/action</span><span class="skill-chip">${seconds.toFixed(1)}s</span><span class="skill-chip">${xpHour.toLocaleString()} XP/hr</span>${activity.item?`<span class="skill-chip reward">${activity.item} · ${Math.floor(perHour).toLocaleString()}/hr</span>`:''}</div>${isActive?'<span class="skill-active-badge">TRAINING NOW</span>':''}`;}if(btn&&isActive)btn.textContent='Training';}
}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}new MutationObserver(queue).observe(view,{childList:true,subtree:true});window.addEventListener('elderwild-game-state',()=>{const panel=view.querySelector('.skill-detail-page');if(panel)panel.removeAttribute('data-skill-detail-enhanced');queue()});document.querySelectorAll('.nav-button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.view!=='skills')document.documentElement.style.removeProperty('--page-art')}));queue();

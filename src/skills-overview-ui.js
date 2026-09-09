import{xpForLevel}from'./game.js';
import{makeSprite}from'./sprite-ui.js';

const view=document.querySelector('#view');
const game=()=>window.__elderwildGame;
const pct=(value,max)=>Math.max(0,Math.min(100,max>0?value/max*100:0));
const fmt=n=>Math.floor(Number(n)||0).toLocaleString();

const style=document.createElement('style');
style.textContent=`
.skills-overview-page{display:grid;gap:12px}
.skills-overview-page>h2{margin:0;text-align:center;font-size:26px;letter-spacing:.06em;text-transform:uppercase}
.skills-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
.skills-summary-card{padding:9px 7px;border:1px solid #3d5145;border-radius:9px;background:linear-gradient(180deg,#202923e8,#141a16ea);text-align:center}
.skills-summary-card strong{display:block;color:#edf4ef;font-size:16px}.skills-summary-card small{display:block;margin-top:2px;color:#93a199;font-size:9px;text-transform:uppercase;letter-spacing:.07em}
.skills-overview-grid{display:grid!important;grid-template-columns:1fr!important;gap:7px!important}
.skills-overview-card{width:100%;display:grid!important;gap:7px!important;padding:10px!important;text-align:left!important;border-color:#3b5044!important;background:linear-gradient(180deg,#1c241fe8,#111713ed)!important;box-shadow:0 5px 13px #0003}
.skills-overview-card.training{border-color:#57c879!important;box-shadow:0 0 0 1px #57c8792f inset,0 5px 16px #0005}
.skills-card-head{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:9px;align-items:center}
.skills-card-icon{width:38px;height:38px;display:grid;place-items:center;border:1px solid #385043;border-radius:8px;background:#0e1411;overflow:hidden}.skills-card-icon .game-sprite{transform:scale(1.1);transform-origin:center}
.skills-card-name{min-width:0}.skills-card-name strong{display:block;color:#edf4ef;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.skills-card-name small{display:block;margin-top:1px;color:#93a199;font-size:10px}
.skills-card-level{min-width:43px;text-align:right}.skills-card-level strong{display:block;color:#72d88d;font-size:20px;line-height:1}.skills-card-level small{font-size:9px;color:#839189;text-transform:uppercase}
.skills-card-progress-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center}.skills-card-progress-row .xpbar{height:10px!important;margin:0!important}.skills-card-progress-row>small{min-width:70px;text-align:right;color:#9aa79f;font-size:9px}
.skills-card-footer{display:flex;justify-content:space-between;gap:8px;align-items:center;min-height:20px}.skills-card-meta{display:flex;gap:5px;flex-wrap:wrap}.skills-card-chip{padding:2px 6px;border:1px solid #34483d;border-radius:999px;background:#0f1512;color:#9ba8a0;font-size:9px}.skills-card-open{color:#7ee99b;font-size:10px;font-weight:800;white-space:nowrap}.skills-overview-card.training .skills-card-open{padding:3px 7px;border-radius:999px;background:#214b31;color:#96f3ad}
.skills-live{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:center;margin-top:1px;padding-top:7px;border-top:1px solid #2d4035}.skills-live-copy strong{display:block;color:#8ff0a9;font-size:10px}.skills-live-copy small{display:block;color:#89968e;font-size:9px}.skills-live .progress-track{height:6px!important;margin-top:4px}.skills-live-tick{font-size:10px;color:#7ee99b;font-weight:800}
@media(min-width:620px){.skills-overview-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:360px){.skills-summary{grid-template-columns:1fr}.skills-card-head{grid-template-columns:32px minmax(0,1fr) auto}.skills-card-icon{width:32px;height:32px}}
`;
document.head.appendChild(style);

function skillProgress(skill){
  if(skill.level>=99)return{percent:100,remaining:0};
  const base=xpForLevel(skill.level),next=xpForLevel(skill.level+1);
  return{percent:pct(skill.xp-base,next-base),remaining:Math.max(0,next-skill.xp)};
}

function decorate(){
  const g=game(),panel=view.querySelector('.panel');
  if(!g||!panel||view.querySelector('#back-skills'))return;
  const cards=[...panel.querySelectorAll('button[data-skill]')];
  if(!cards.length||panel.dataset.skillsOverview==='1')return;
  panel.dataset.skillsOverview='1';
  panel.classList.add('skills-overview-page');
  const grid=cards[0].parentElement;
  if(grid)grid.classList.add('skills-overview-grid');

  const totalXp=g.state.skills.reduce((sum,s)=>sum+(Number(s.xp)||0),0);
  const maxTotal=g.state.skills.length*99;
  const active=g.state.activity;
  const summary=document.createElement('div');
  summary.className='skills-summary';
  summary.innerHTML=`<div class="skills-summary-card"><strong>${g.totalLevel().toLocaleString()} / ${maxTotal.toLocaleString()}</strong><small>Total level</small></div><div class="skills-summary-card"><strong>${fmt(totalXp)}</strong><small>Total XP</small></div><div class="skills-summary-card"><strong>${active?active.skillName:'Idle'}</strong><small>${active?'Training now':'Current activity'}</small></div>`;
  panel.querySelector('h2')?.after(summary);

  for(const card of cards){
    const skill=g.getSkill(card.dataset.skill),progress=skillProgress(skill),isActive=active?.skillName===skill.name;
    card.classList.add('skills-overview-card');
    card.classList.toggle('training',isActive);
    const iconWrap=document.createElement('div');iconWrap.className='skills-card-icon';
    const sprite=makeSprite?.('skills',skill.name);if(sprite)iconWrap.append(sprite);else iconWrap.textContent=skill.icon||'•';
    const head=document.createElement('div');head.className='skills-card-head';
    const name=document.createElement('div');name.className='skills-card-name';name.innerHTML=`<strong>${skill.name}</strong><small>${fmt(skill.xp)} XP</small>`;
    const level=document.createElement('div');level.className='skills-card-level';level.innerHTML=`<strong>${skill.level}</strong><small>Level</small>`;
    head.append(iconWrap,name,level);
    const progressRow=document.createElement('div');progressRow.className='skills-card-progress-row';progressRow.innerHTML=`<div class="xpbar"><div class="xpfill" style="width:${progress.percent}%"></div></div><small>${skill.level>=99?'MAX LEVEL':`${fmt(progress.remaining)} XP left`}</small>`;
    const footer=document.createElement('div');footer.className='skills-card-footer';
    footer.innerHTML=`<div class="skills-card-meta"><span class="skills-card-chip">${fmt(skill.actions||0)} actions</span><span class="skills-card-chip">${skill.activities.length} activities</span></div><span class="skills-card-open">${isActive?`Training ${skill.name}`:`Train ${skill.name} ›`}</span>`;
    card.replaceChildren(head,progressRow,footer);
    if(isActive){
      const live=document.createElement('div');live.className='skills-live';
      const actionPct=pct(active.tick,active.totalTicks);
      live.innerHTML=`<div class="skills-live-copy"><strong>${active.activityName}</strong><small>Current action progress</small><div class="progress-track"><div class="progress-fill" style="width:${actionPct}%"></div></div></div><div class="skills-live-tick">${active.tick}/${active.totalTicks}</div>`;
      card.append(live);
    }
  }
}

let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;decorate()})}
new MutationObserver(queue).observe(view,{childList:true,subtree:true});
window.addEventListener('elderwild-game-state',queue);
document.querySelector('.nav-button[data-view="skills"]')?.addEventListener('click',()=>setTimeout(queue,0));
queue();

import{SKILLING_PETS}from'./skilling-pets.js';
import{makeSprite}from'./sprite-ui.js';

const style=document.createElement('style');
style.textContent=`.skilling-pets-panel{margin-top:14px}.skilling-pets-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.skilling-pet-card{display:flex;align-items:center;gap:9px;padding:9px;border:1px solid #35493d;border-radius:8px;background:#121714;opacity:.62}.skilling-pet-card.owned{opacity:1;border-color:#65cc82;box-shadow:0 0 0 1px #57c87944 inset}.skilling-pet-card .game-sprite{flex:0 0 32px}.skilling-pet-copy{min-width:0;display:grid;gap:2px}.skilling-pet-copy strong{color:#edf4ef}.skilling-pet-card.owned .skilling-pet-copy strong{color:#72d88d}.skilling-pet-copy small{color:#91a096}@media(max-width:420px){.skilling-pets-grid{grid-template-columns:1fr}}`;
document.head.appendChild(style);

function enhanceCollection(){const game=window.__elderwildGame;if(!game)return;const panel=[...document.querySelectorAll('#view .panel')].find(el=>el.querySelector('h2')?.textContent==='Collection Log');if(!panel)return;let section=panel.querySelector('.skilling-pets-panel');if(!section){section=document.createElement('section');section.className='skilling-pets-panel';const list=panel.querySelector('.activity-list');list?.insertAdjacentElement('beforebegin',section);if(!section.isConnected)panel.appendChild(section)}section.innerHTML=`<h3>Skilling Pets</h3><div class="skilling-pets-grid"></div>`;const grid=section.querySelector('.skilling-pets-grid');for(const pet of SKILLING_PETS){const owned=game.hasSkillingPet?.(pet.item);const card=document.createElement('div');card.className=`skilling-pet-card${owned?' owned':''}`;const sprite=makeSprite('items',pet.item);if(sprite)card.appendChild(sprite);const copy=document.createElement('div');copy.className='skilling-pet-copy';const title=document.createElement('strong');title.textContent=owned?pet.item:'???';const meta=document.createElement('small');meta.textContent=`${pet.skill} pet${owned?' · Obtained':' · Not obtained'}`;copy.append(title,meta);card.appendChild(copy);grid.appendChild(card)}}
let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhanceCollection()})}
new MutationObserver(queue).observe(document.querySelector('#view'),{childList:true,subtree:true});
window.addEventListener('elderwild-game-state',queue);
window.addEventListener('elderwild-skilling-pet',queue);
queue();

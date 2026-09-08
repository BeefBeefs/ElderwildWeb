export const COMBAT_STYLES={ATTACK:'Attack',STRENGTH:'Strength',DEFENSE:'Defense'};

export const ENEMIES=[
  {name:'Chicken',icon:'🐔',tier:1,hp:1,attack:1,strength:1,defense:1,attackSpeed:8,weakness:COMBAT_STYLES.ATTACK,drops:[
    {item:'Feathers',chance:1,min:1,max:3},{item:'Raw Chicken',chance:.5,min:1,max:1},{item:'Bones',chance:.75,min:1,max:1},{item:'Animal Hide',chance:.01,min:1,max:1}]},
  {name:'Big Chicken',icon:'🐓',tier:1,hp:5,attack:2,strength:2,defense:2,attackSpeed:8,weakness:COMBAT_STYLES.STRENGTH,drops:[
    {item:'Feathers',chance:1,min:2,max:6},{item:'Raw Chicken',chance:.75,min:1,max:2},{item:'Bones',chance:1,min:1,max:1},{item:'Animal Hide',chance:.01,min:1,max:2},{item:'Bronze Sword',chance:.001,min:1,max:1}]},
  {name:'Moss-Covered Goblin',icon:'👺',tier:1,hp:10,attack:3,strength:3,defense:2,attackSpeed:7,weakness:COMBAT_STYLES.DEFENSE,requirement:{skill:'Woodcutting',level:5},drops:[
    {item:'Goblin Ear',chance:.75,min:1,max:2},{item:'Goblin Tooth',chance:.5,min:1,max:3},{item:'Coins',chance:.8,min:2,max:10},{item:'Goblin Blade',chance:.01,min:1,max:1},{item:'Goblin Crown',chance:.001,min:1,max:1}]}
];

export function hitChance(attack,defense){attack=Math.max(1,attack);defense=Math.max(1,defense);return Math.max(.05,Math.min(.95,attack/(attack+defense)))}
export function maxHit(strength){return Math.max(1,Math.floor(strength/3)+1)}
export function rollHit(attack,defense,max){return Math.random()<hitChance(attack,defense)?Math.floor(Math.random()*(max+1)):0}
export function weaknessAttack(enemy,style,attack){return enemy.weakness===style?Math.ceil(attack*1.25):attack}
export function weaknessDamage(enemy,style,damage){return enemy.weakness===style?Math.max(1,Math.ceil(damage*1.25)):damage}
export function styledAttack(level,style){return style===COMBAT_STYLES.ATTACK?Math.ceil(level*1.10):level}
export function styledStrength(level,style){return style===COMBAT_STYLES.STRENGTH?Math.ceil(level*1.15):level}
export function styledDefense(level,style){return style===COMBAT_STYLES.DEFENSE?Math.ceil(level*1.15):level}
export function reduceIncoming(style,damage){return style===COMBAT_STYLES.DEFENSE?Math.max(0,Math.floor(damage*.90)):damage}
export function randomQuantity(min,max){return min+Math.floor(Math.random()*(max-min+1))}

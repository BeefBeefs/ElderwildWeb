export const TICK_MS=600;
export const ACTIVITY_SPEED_MULTIPLIER=10/3;
export const effectiveActivityTicks=sourceTicks=>Math.max(1,Math.ceil(Math.max(1,Number(sourceTicks)||1)*ACTIVITY_SPEED_MULTIPLIER));
const activity=(name,icon,level,xp,sourceTicks,item)=>({name,icon,level,xp,sourceTicks,ticks:effectiveActivityTicks(sourceTicks),...(item?{item}:{})});

export const SKILLS=[
  {name:'Fishing',icon:'🦈',activities:[
    activity('Shrimp','🦐',1,10,6,'Raw Shrimp'),
    activity('Trout','🐟',20,50,9,'Raw Trout'),
    activity('Salmon','🐟',30,70,9,'Raw Salmon'),
    activity('Lobster','🦞',40,100,10,'Raw Lobster'),
    activity('Swordfish','🐟',50,140,12,'Raw Swordfish'),
    activity('Shark','🦈',76,200,17,'Raw Shark')]},
  {name:'Mining',icon:'⛏️',activities:[
    activity('Copper','🟤',1,10,5,'Copper Ore'),
    activity('Tin','🟤',1,10,5,'Tin Ore'),
    activity('Iron','🟤',15,35,9,'Iron Ore'),
    activity('Coal','🟤',30,50,10,'Coal'),
    activity('Mithril','🟤',55,80,14,'Mithril Ore'),
    activity('Adamantite','🟤',70,95,17,'Adamantite Ore'),
    activity('Runite','🟤',85,125,20,'Runite Ore')]},
  {name:'Woodcutting',icon:'🪓',activities:[
    activity('Normal Tree','🌳',1,25,7,'Logs'),
    activity('Oak','🌳',15,37,9,'Oak Logs'),
    activity('Willow','🌳',30,67,10,'Willow Logs'),
    activity('Yew','🌳',60,175,17,'Yew Logs'),
    activity('Magic Tree','🌳',75,250,20,'Magic Logs')]},
  {name:'Agility',icon:'🏃',activities:[
    activity('Gnome Agility Course','🏃',1,86,100),
    activity('Varrock Agility Course','🏃',30,175,100),
    activity('Canifis Agility Course','🏃',40,240,100),
    activity("Seers' Village Agility Course",'🏃',60,570,100),
    activity('Ardougne Agility Course','🏃',90,793,100)]},
  {name:'Thieving',icon:'🥷',activities:[
    activity('Pickpocket Villager','🧑',1,12,5,'Coins'),
    activity('Steal from Market Stall','🏪',20,55,9,'Coins'),
    activity('Pilfer Silk Stall','🧵',45,120,12,'Silk'),
    activity('Crack Palace Chest','🗝️',75,260,17,'Jeweled Relic')]},
  {name:'Crafting',icon:'🧵',activities:[
    activity('Shape Clay Pot','🏺',1,15,5,'Clay'),
    activity('Craft Leather Gloves','🧤',20,60,9,'Crafted Leather Gloves'),
    activity('String Sapphire Amulet','📿',50,135,12,'Sapphire Amulet'),
    activity('Craft Dragonhide Body','🐉',80,290,17,'Dragonhide Body')]},
  {name:'Fletching',icon:'🏹',activities:[
    activity('Cut Arrow Shafts','🪵',1,12,5,'Arrow Shafts'),
    activity('Make Headless Arrows','🏹',20,55,9,'Headless Arrows'),
    activity('Fletch Willow Shortbow','🏹',40,115,12,'Willow Shortbow'),
    activity('Fletch Magic Longbow','🏹',75,250,17,'Magic Longbow')]},
  {name:'Farming',icon:'🌱',activities:[
    activity('Harvest Potatoes','🥔',1,14,7,'Potato'),
    activity('Harvest Herb Patch','🌿',25,65,10,'Grimy Herb'),
    activity('Harvest Watermelons','🍉',50,145,14,'Watermelon'),
    activity('Tend Magic Sapling','🌱',80,310,20,'Magic Sapling')]},
  {name:'HP',icon:'❤️',activities:[]},
  {name:'Attack',icon:'⚔️',activities:[]},
  {name:'Strength',icon:'💪',activities:[]},
  {name:'Defense',icon:'🛡️',activities:[]}
];

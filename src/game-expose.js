import{Game}from'./game.js';
if(!Game.prototype.__instanceExposePatched){
  const originalLoad=Game.prototype.load;
  Game.prototype.load=function(...args){
    const state=originalLoad.apply(this,args);
    window.__elderwildGame=this;
    return state;
  };
  const originalSave=Game.prototype.save;
  Game.prototype.save=function(...args){
    window.__elderwildGame=this;
    return originalSave.apply(this,args);
  };
  Game.prototype.__instanceExposePatched=true;
}

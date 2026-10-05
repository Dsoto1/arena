/* 178-v89mkt — the market while COMMODUS is in the arena (his note, 2026-10-05). Commodus already locks Crowd Favor (03-engine
   cfAllowed/commodusIn), so the 3 CF unlock was greyed "Crowd Favor is locked"; now it says why, plainly:
   • Market window (106 openMarket → modal 'Market of Flavius'): Unlock market and every Buy at level N are disabled with
     "Closed — Commodus is in the arena" (also a market opened earlier in the same turn, before he arrived).
   • Crowd Favor window (163): the Unlock market tile says the same.
   • FREE PICKS still work (offerings, cards and rewards that give "a level N weapon / armor" — 03 marketRoll → 106 marketBuy75
     with opt.only): while he is in, no d4 — the gladiator CHOOSES outright from that level's side (the Market Choice path:
     the board's slot pick for humans, the best piece for CPUs). Market Choice itself is not used up by it. */
const mktShut89=()=>{try{return !!(S&&!S.over&&typeof commodusIn==='function'&&commodusIn())}catch(e){return false}};
{const base=modal;modal=function(title,body,btns,opt){try{
    if(title===_T('Market of Flavius')&&Array.isArray(btns)&&mktShut89())
      btns=btns.map(b=>b&&(b.value==='unlock'||/^b[123]$/.test(b.value))?{...b,disabled:true,sub:_T('Closed — Commodus is in the arena')}:b);
    if(typeof body==='string'&&mktShut89()&&body.includes('cf88mb'))
      body=body.replace(/(<img[^>]*class="cf88mb"[\s\S]*?)(Unlock market for this turn)/,`$1$2 · ${_T('closed while Commodus is in the arena')}`)}catch(e){console.error(e)}
  return base.call(this,title,body,btns,opt)}}
{const base=marketBuy75;marketBuy75=async function(player,lv,opt={}){
  if(!opt||!opt.only||!mktShut89()||!player)return base.apply(this,arguments);
  const had=player.mchoice;player.mchoice=true;
  log(_T`The market is closed while Commodus is in the arena — ${nm(player)} chooses outright at level ${lv}.`);
  const L0=log;log=function(h,...r){if(typeof h==='string'&&h.includes('Market Choice'))h=h.replace('uses Market Choice for slot',_T('picks slot'));return L0.call(this,h,...r)}; /* the borrowed Market Choice path names itself in the log */
  try{return await base.call(this,player,lv,{...opt,free:false})}finally{player.mchoice=had;log=L0}}}

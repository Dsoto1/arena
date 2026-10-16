/* =====================================================================
   347-v103beta.js — v1.03 BETA fixes (his beta notes B1–B6, tools/plans/v103/NOTES.md). Kill switch: localStorage flavius_v103eoff=1.
   B1  the Rete: 07-ui's drawPlayer / drawNPC stroke a turquoise ring (#62d0c0) under a netted piece. 312 now draws the net itself (thrown, then WRAPPED
       over the piece), so the ring is redundant. drawPlayer / drawNPC are wrapped: while 312 paints nets (bst100Mode() != 'off' and the beasts
       module on) the unit's `netted` flag reads false for the duration of the draw only (restored in finally). Where no net picture is drawn
       (kill switch flavius_beasts100off=1, HEADLESS / sims) the ring stays.
   B2  Challenges' "wild" twist (310 DC100_TW.wild) is plain: "🐺 Wild: every beast hunts you" on the card, the strip and the results; and the pre-match
       briefing (301 bf100Rules wrapper) shows every twist of the running challenge as a rule card.
   B3  Crowd Favor window: "Unlock market for this turn" is disabled WITH THE REASON when openMarket would refuse (challenge twist nomarket, or the
       event's noMarket) — wrapper on modal for the 'Crowd Favor' grid (163 openCrowd builds it), so no CF is spent on a refused unlock.
   B4  Main menu → Manager mode submenu: 310's "📅 Challenges" entry belongs to the Play Now submenu only; a modal wrapper drops any 'dc100' button
       from the Manager submenu.
   B5  Play Now top bar: the 🎲 die ([data-pnrand90].pn98dice) is centred in its button on both axes (inline-flex).
   B6  Manager rail: the Infirmary oval counts GLADIATORS of the player's house that need treatment (injured and not treated this week — 345's trt103 —
       or still missing a limb and not booked for regrowth), each once; a fighter leaves the count when treated. 108's bed-waiting addition (which counted
       the same fighters twice) is replaced; 145's Road lock (0 while the Road is locked) is kept. Ludus checklists / banner use the same function.
   Test tv103e.
   ===================================================================== */
const V103E={on:(()=>{try{return localStorage.getItem('flavius_v103eoff')!=='1'}catch(e){return true}})()};

/* ---------- B1 · no ring under a netted piece when the 3D net is drawn ---------- */
const v103eNetDrawn=()=>{try{return V103E.on&&typeof BST100!=='undefined'&&BST100.on&&typeof bst100Mode==='function'&&bst100Mode()!=='off'}catch(e){return false}};
for(const nm of ['drawPlayer','drawNPC']){try{
  const base=eval(nm);if(typeof base!=='function')continue;
  const wrapped=function(u){if(!u||!u.netted||!v103eNetDrawn())return base.apply(this,arguments);
    u.netted=false;try{return base.apply(this,arguments)}finally{u.netted=true}};
  if(nm==='drawPlayer')drawPlayer=wrapped;else drawNPC=wrapped}catch(e){console.error(e)}}

/* ---------- B2 · the twists named plainly + shown in the briefing ---------- */
try{if(typeof DC100_TW!=='undefined'&&V103E.on&&DC100_TW.wild){DC100_TW.wild.ic='🐺';DC100_TW.wild.n=()=>_T('Wild: every beast hunts you');DC100_TW.wild.d=()=>_T('Every beast on the sand hunts you from the start.')}}catch(e){console.error(e)}
if(typeof bf100Rules==='function'){const base=bf100Rules;bf100Rules=function(){const R=base.apply(this,arguments);
  try{if(V103E.on&&S&&S.daily100&&Array.isArray(S.daily100.tw)&&S.daily100.tw.length&&typeof DC100_TW!=='undefined'){
    const T=S.daily100.tw.map(k=>DC100_TW[k]).filter(Boolean).map(t=>[t.ic,t.n(),t.d(),'ev']);
    return [...T,...R].slice(0,6)}}catch(e){console.error(e)}return R}}

/* ---------- B3 · Crowd Favor: no unlock offered when the market is refused ---------- */
function v103eMarketWhy(){try{if(typeof dc100Has==='function'&&dc100Has('nomarket'))return _T('closed in this challenge');
  const ev=typeof EV==='function'?EV():null;if(ev&&ev.noMarket)return _T('no market in this event')}catch(e){}return ''}
{const base=modal;modal=function(title,body,buttons,opt){
  try{if(V103E.on&&title===_T('Crowd Favor')&&opt&&Array.isArray(opt.grid)){const why=v103eMarketWhy();
    if(why)opt=Object.assign({},opt,{grid:opt.grid.map(g=>g&&g.value==='mk'?Object.assign({},g,{disabled:true,label:String(g.label).replace(/<small>[\s\S]*?<\/small>/,'<small>'+esc(why)+'</small>')}):g)})}}catch(e){console.error(e)}
  /* B4 · the Challenges entry belongs to the Play Now submenu only */
  try{if(V103E.on&&Array.isArray(buttons)&&buttons.some(b=>b&&b.value==='dc100')&&typeof sand100Titles==='function'&&title===sand100Titles()[1])buttons=buttons.filter(b=>!(b&&b.value==='dc100'))}catch(e){console.error(e)}
  return base.call(this,title,body,buttons,opt)}}
/* ---------- B6 · the Infirmary oval counts fighters needing care ---------- */
function v103eNeedIds(){const w=W_(),m=me();if(!w||!m)return [];
  const t=typeof trt103==='function'?trt103:()=>false;
  return rosterOf(m).filter(g=>g&&g.alive!==false&&((g.inj&&!g.inj.war)||(g.severed||[]).length)&&!t(g,w)).map(g=>g.id)}
{const base=infirmNeed73;infirmNeed73=function(){
  if(!V103E.on)return base.apply(this,arguments);
  try{const w=W_();if(!w||!me())return 0;if(typeof roadLocked76==='function'&&roadLocked76(w))return 0;return v103eNeedIds().length}catch(e){return base.apply(this,arguments)}}}

/* ---------- B5 · the die, centred ---------- */
if(V103E.on){const css=document.createElement('style');css.textContent=`
.pn98go .pn98dice,.pn100 .pn98go .pn98dice{display:inline-flex;align-items:center;justify-content:center;line-height:1;text-align:center}
.pn98go .pn98dice>span[aria-hidden="true"]{display:block;line-height:1;margin:0;padding:0}`;
  document.head.appendChild(css)}

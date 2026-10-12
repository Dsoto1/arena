/* =====================================================================
   315-v100bal — v1.0 PLAY NOW BALANCE (his three picks from tools/plans/balance100/REPORT.md; digital house rules)
   P1  DAMNATIO: (a) the printed Damnatio (and a custom copy of it, `pelt10_95`) is pelted only every OTHER Resolve — skipped on odd
       rotations (the measured variant); the gate is `pelt100Turn`, called by resolvePhase in 04-rules. Other "Hated by the crowd"
       custom classes are pelted every Resolve as before. (b) loadout gains Iron Helm (galea, head) + Belt I (balteus1, chest).
       Card text edited in place: 02-data CLASSES.damnatio.ab, 109 CLS_CARD_TXT76.damnatio. Drafted events unchanged (drafted players are never pelted).
   P2  AMAZONIA: no off-hand Falcata in the printed starting loadout (still in the market). Her printed card art still shows it.
   P3  SEATS BY LOT: Chariot turn order, Orpheus starting corners and Golden Eagle's first team are SEEDED lots drawn in a seedOpening
       wrapper (shuffle = the event's seeded RNG: same seed = same lot, identical on every online client); one log line each.
   ONLINE UNCHANGED: 111-onlcore / server kits are not touched; the page-side kit builder (onlKits92) and online loadouts (giveLoadout
   while S.onl) see the OLD Damnatio armor and Amazonia's Falcata, so the page stays in step with the server.
   ===================================================================== */
const BAL100={dam0:CLASSES.damnatio.armor.map(a=>[...a]),amaL0:CLASSES.amazonia.L};
CLASSES.damnatio.armor=[['galea','head'],['balteus1','chest'],...CLASSES.damnatio.armor];
delete CLASSES.amazonia.L;
/* pelt100Turn — false on the rotations a printed Damnatio is spared (odd ones: the first pelt comes in rotation 2). */
function pelt100Turn(p){return !(pelt10_95(p)&&((S.rotation|0)%2===1))}
/* online keeps the old class data for kits and loadouts */
function bal100Old(fn){const D=CLASSES.damnatio,A=CLASSES.amazonia,da=D.armor,al=A.L;D.armor=BAL100.dam0;if(BAL100.amaL0)A.L=BAL100.amaL0;try{return fn()}finally{D.armor=da;if(BAL100.amaL0){if(al===undefined)delete A.L;else A.L=al}}}
if(typeof onlKits92==='function'){const base=onlKits92;onlKits92=function(){const a=arguments,t=this;return bal100Old(()=>base.apply(t,a))}}
{const base=giveLoadout;giveLoadout=function(player){const a=arguments,t=this;if(typeof S!=='undefined'&&S&&S.onl)return bal100Old(()=>base.apply(t,a));return base.apply(t,a)}}
/* P3 — the lots */
{const base=seedOpening;seedOpening=function(config){
  try{if(S&&!config.order){
    if(EV().kind==='chariot'&&S.order.length>1){S.order=shuffle([...S.order]);S.cur=S.order[0];
      log(_T`🎲 The lots are drawn: ${nm(S.players[S.cur])} drives first.`)}
    else if(EV().kind==='orpheus'&&S.players.length>1&&!(config.seats||[]).some(s=>s&&s.start)){
      const ps=S.players,st=shuffle(ps.map(p=>[...p.start]));ps.forEach((p,i)=>{p.start=st[i];p.r=st[i][0];p.c=st[i][1]});
      log(_T`🎲 The lots are drawn for the corners: ${ps.map(p=>nm(p)+' '+tl(p.start[0],p.start[1])).join(', ')}.`)}
    else if(EV().kind==='eagle'&&EV().teams){
      const teams=shuffle([...new Set(S.players.map(p=>p.team))].sort());const k=Math.max(0,S.order.findIndex(id=>S.players[id].team===teams[0]));
      S.order=[...S.order.slice(k),...S.order.slice(0,k)];S.cur=S.order[0];
      log(_T`🎲 The lots are drawn: Team ${esc(String(teams[0]))} takes the first turn.`)}}}catch(e){if(window.ERR92&&console.error)console.error(e)}
  return base.apply(this,arguments)}}

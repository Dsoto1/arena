/* =====================================================================
   325-V101REPLAY0 · THE REPLAY HARNESS'S PROBE (v1.01, Phase 0 of tools/plans/layers100/PLAN.md) — TEST ONLY
   =====================================================================
   tools/replay/record.js and tools/replay/check.js read what a match ENDED WITH, at the same point while recording (a real match) and
   while playing it back (309's rp100Play): the entry of gameOver. Off unless localStorage flavius_replay0=1 (the harness sets it), so a
   player's page does nothing here. Observes only: never writes S, the dice, the log or onlHash.
   RP0.cap  = {S, from} — opened at the FIRST beginTurn of each S (the moment 309 cuts the opening snapshot), from = S.logLines length then
   RP0.last = {h onlHash, rng RNG.s, turns, ri, rot, win [names], reason, log [lines since the opening: "turn|cls|text"], th [turnNo:onlHash at the
              start of every beginTurn = the per-turn state hashes], res [per seat], npcs}
   ===================================================================== */
const RP0={on:(()=>{try{return localStorage.getItem('flavius_replay0')==='1'}catch(e){return false}})(),cap:null,last:null,n:0};
/* a seat at the end: what the rules decided about it (no display fields) */
function rp0Seat(p){const sum=o=>Object.values(o||{}).reduce((a,v)=>a+(+v||0),0);
  return [p.name,p.cls,p.team||'',p.alive?1:0,p.exited?1:0,Math.round((p.cf||0)*100)/100,p.coin|0,sum(p.hp),sum(p.ap),p.keys|0,(p.items||[]).length,p.wR&&p.wR.key||'',p.wL&&p.wL.key||'',(p.trophies||[]).length]}
function rp0Capture(winners,reason){const c=RP0.cap;if(!c||c.S!==S||c.done)return;c.done=1;
  const L=(S.logLines||[]).slice(c.from).map(l=>`${l.turn}|${l.cls||''}|${String(l.text||'').replace(/\s+/g,' ').trim()}`);
  RP0.last={h:(()=>{try{return onlHash()}catch(e){return ''}})(),rng:RNG?RNG.s:null,turns:S.turnNo,ri:S.ri,rot:S.rotation,
    win:(winners||[]).map(w=>typeof w==='number'?S.players[w]:w).filter(Boolean).map(p=>p.name),reason:String(reason||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),
    log:L,th:c.th.slice(),res:S.players.map(rp0Seat),npcs:(S.npcs||[]).map(n=>[n.t,n.r,n.c,n.hp,n.alive?1:0])};RP0.n++}
if(RP0.on){
  {const base=beginTurn;beginTurn=function(){try{if(S&&!S.over){if(!RP0.cap||RP0.cap.S!==S)RP0.cap={S,from:(S.logLines||[]).length,th:[]};
    const c=RP0.cap;if(!c.done&&c.th.length<4000)c.th.push(S.turnNo+':'+onlHash())}}catch(e){}return base.apply(this,arguments)}}
  {const base=gameOver;gameOver=function(winners,reason){try{if(S&&!S.overShown)rp0Capture(winners,reason)}catch(e){console.error(e)}return base.apply(this,arguments)}}
}

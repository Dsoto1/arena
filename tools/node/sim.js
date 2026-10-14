/* tools/node/sim.js — a HEADLESS simEvent in Node (v1.01 wave 2, Phase D1): the built page in tools/node/page.js's stub, the game's own
   13-sim simEvent (HEADLESS on: no log, no windows, no waits), the same CPU seats tools/tests/t12.js uses.
   Usage: node tools/node/sim.js <event|all> [seed=1] [page=flavius-arena.html] [--reps N] [--json]
     prints per sim: winners · reason · turns/rotations · the end state hash (onlHash) and RNG.s at gameOver · ms
   Library: simIn(P, ev, seed) → result (P = an open page from page.js) */
'use strict';
const path=require('path');const {openGame}=require('./page.js');
const ROOT=path.resolve(__dirname,'..','..');
const EVENTS_ALL=['democritus','egidious','cassian','gauntlet','triumviratus','orpheus','goldenEagle','familia','juggernaut','ludus','chariot','naumachia','commodus'];
/* t12's seats: classes in a fixed order (the event's own list first), minds normal/hard/easy, teams as the event wants */
const CFG=`(ev,seed)=>{const E=EVENTS[ev];
  let n={gauntlet:1,triumviratus:3,naumachia:6,chariot:5,commodus:3,familia:6,goldenEagle:6,juggernaut:4,orpheus:4,ludus:4}[ev]||4;
  let cls=['slave','soldier','royalty','hero','veteranus','amazonia','venatore','damnatio'];if(E.classes)cls=E.classes;if(E.noVenatore)cls=cls.filter(c=>c!=='venatore');cls=cls.slice(0,n);
  const seats=cls.map((c,i)=>({cls:c,cpu:true,diff:['normal','hard','easy'][i%3],team:E.coop?'A':E.teams==='jugg'?(i===0?'J':'T'):E.teams?(i%2?'B':'A'):undefined}));
  return {ev,loc:E.loc,seed,seats,opts:{mods:true,mandata:true,optOffers:true,eaglePot:true,spect:ev==='democritus'?4:0}}}`;
async function simIn(P,ev,seed){const t0=process.hrtime.bigint();P.G.__simOut=null;
  P.ev(`(async()=>{let end=null;const g=gameOver;gameOver=function(w,reason){if(!end&&S&&S.sim)try{end={h:onlHash(),rng:RNG?RNG.s:null}}catch(e){}return g.apply(this,arguments)};
    try{const r=await simEvent((${CFG})(${JSON.stringify(ev)},${+seed}),{maxTurns:700,timeoutMs:600000});window.__simOut={r,end}}catch(e){window.__simOut={err:String(e&&e.stack||e)}}finally{gameOver=g}})()`);
  await P.until(()=>!!P.G.__simOut,3600000);const o=P.G.__simOut;const ms=Number(process.hrtime.bigint()-t0)/1e6;
  if(!o)return {ev,seed,ok:false,err:'did not finish',ms};if(o.err)return {ev,seed,ok:false,err:o.err.slice(0,400),ms};
  const r=o.r||{};const names=Object.fromEntries((r.rows||[]).map(x=>[x.id,x.name+' ('+x.cls+')']));
  return {ev,seed,ok:true,win:(r.winners||[]).map(id=>names[id]||id),reason:String(r.reason||'').replace(/<[^>]*>/g,'').slice(0,80),turns:r.turns,rot:r.rotations,h:o.end&&o.end.h,rng:o.end&&o.end.rng,ms:Math.round(ms*10)/10}}
async function openSim(page,o={}){const P=await openGame({page:page||path.join(ROOT,'flavius-arena.html'),ls:{flavius_firstrun:'shown',flavius_first100off:'1'},verbose:o.verbose});
  await P.until(()=>P.G.FLAVIUS_READY,60000);P.ev('menuHide();if(CUR_MODAL)CUR_MODAL.done(null)');return P}
module.exports={simIn,openSim,EVENTS_ALL};

if(require.main===module){const a=process.argv.slice(2);const json=a.includes('--json');const ri=a.indexOf('--reps');const reps=ri>=0?+a[ri+1]:1;
  const rest=a.filter((x,i)=>!x.startsWith('--')&&!(ri>=0&&i===ri+1));const page=rest.find(x=>/\.html$/.test(x));const pos=rest.filter(x=>!/\.html$/.test(x));
  const evs=!pos[0]||pos[0]==='all'?EVENTS_ALL:pos[0].split(',');const seed=+(pos[1]||1);
  (async()=>{const T0=Date.now();const P=await openSim(page,{verbose:!!process.env.NODE_VERBOSE});const tLoad=Date.now()-T0;let bad=0;const times=[];
    for(const ev of evs)for(let k=0;k<reps;k++){const r=await simIn(P,ev,seed+k);if(!r.ok)bad++;times.push(r.ms);
      if(json)console.log(JSON.stringify(r));else console.log((r.ok?'ok    ':'FAIL  ')+ev.padEnd(13)+` seed ${r.seed}`+(r.ok?` · ${r.turns} turns, ${r.rot} rotations · win ${r.win.join(', ')||'—'} · ${r.h} rng ${r.rng} · ${r.ms} ms`:` · ${r.err}`))}
    const errs=P.errors.map(e=>String(e&&e.message||e));P.close();
    if(!json)console.log(`page load ${tLoad} ms · ${times.length} sims · avg ${Math.round(times.reduce((a,b)=>a+b,0)/Math.max(1,times.length))} ms`+(errs.length?` · page errors ${JSON.stringify(errs.slice(0,3)).slice(0,300)}`:''));
    process.exitCode=bad?1:0;process.exit()})()}

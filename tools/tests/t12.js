const { chromium } = require('playwright');
/* t12 — every event played by CPU. perf100 (2026-10-11): all events but ONE per shard run as headless sims (simEvent, 50-300 ms each, same
   seats/options/end checks as before); the one `ui` event per shard is still played on screen at Fast (its 1 s poll is now a 200 ms
   condition wait) so the screen path keeps its coverage. argv[3] = a comma list of events (on screen, like before), none = every shard's plan in one run, or
   shard:a|b|c — the suite runs the three shards t12a/b/c in parallel (each a stub that sets shard:x). SHARDS are balanced by the on-screen
   event's time (naumachia 21 s, gauntlet 31 s, orpheus 36 s) plus the sims; every event in exactly one shard. */
const ALL_EVS=['democritus','egidious','cassian','gauntlet','triumviratus','orpheus','goldenEagle','familia','juggernaut','ludus','chariot','naumachia','commodus'];
const SHARDS={a:{ui:'naumachia',sims:['democritus','familia','triumviratus','chariot']},b:{ui:'gauntlet',sims:['egidious','juggernaut','ludus','commodus']},c:{ui:'orpheus',sims:['cassian','goldenEagle']}};
{const all=Object.values(SHARDS).flatMap(x=>[x.ui,...x.sims]);if(all.length!==ALL_EVS.length||ALL_EVS.some(e=>all.filter(x=>x===e).length!==1)){console.log('ERRS ["t12 SHARDS must hold every event exactly once"]');process.exit(1)}}
const sh=/^shard:([a-z])$/.exec(process.argv[3]||'');
const PLAN=sh?SHARDS[sh[1]]:process.argv[3]?{sims:[],all:process.argv[3].split(',')}:{all:Object.values(SHARDS).map(x=>x.ui),sims:Object.values(SHARDS).flatMap(x=>x.sims)}; /* no argument = every shard's plan in one run; a comma list = those events on screen */
const reps=+(process.argv[4]||1);
/* page side: the seats of an event (as before) and the end summary (the log counts t12 always printed) */
const CFG=(ev)=>{const E=EVENTS[ev];
  let n={gauntlet:1,triumviratus:3,naumachia:6,chariot:5,commodus:3,familia:6,goldenEagle:6,juggernaut:4,orpheus:4,ludus:4}[ev]||4;
  let cls=['slave','soldier','royalty','hero','veteranus','amazonia','venatore','damnatio'];if(E.classes)cls=E.classes;if(E.noVenatore)cls=cls.filter(c=>c!=='venatore');cls=cls.slice(0,n);
  const seats=cls.map((c,i)=>({cls:c,cpu:true,diff:['normal','hard','easy'][i%3],team:E.coop?'A':E.teams==='jugg'?(i===0?'J':'T'):E.teams?(i%2?'B':'A'):undefined}));
  return {ev,loc:E.loc,seats,opts:{mods:true,mandata:true,optOffers:true,eaglePot:true,spect:ev==='democritus'?4:0}}};
const SUMMARY=(over)=>{const L=S.logLines.map(l=>l.text);const c=re=>L.filter(x=>re.test(x)).length;
  return {over,rot:S.rotation,turns:S.turnNo,ri:S.ri,deck:S.deck.length,win:L.filter(x=>/wins|win |everyone loses|No gladiator/.test(x)).slice(-1)[0]?.slice(0,80),
    reveals:c(/ reveals /),giftLines:L.filter(x=>/ gives .* (to|for)/.test(x)).slice(0,3),forcedL:L.filter(x=>/decree/.test(x)).length,mf:c(/Mandati Flavi:/),gifts:c(/ gives /),aggroSwitch:c(/turns its aggro/),truce:c(/agree to a truce/),forced:c(/all truces are broken/),restless:c(/restless/i),tele:c(/Telemachus/),endgame:c(/Flavius Rule is in play/),boar:c(/Boar/),market:c(/buys/),hist:Object.keys(S.hist).length}};
(async()=>{
 const b=await chromium.launch();const FAIL=[];
 const open=async(errs)=>{const pg=await b.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('console: '+m.text())});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000}).catch(()=>{});return pg};
 const report=(ev,res,errs,T0,tag)=>{console.log(ev.padEnd(13),tag,JSON.stringify(res),errs.slice(0,3).join(' | '),`(${Math.round((Date.now()-T0)/1000)}s)`);
  if(errs.length)FAIL.push(ev+': '+errs[0]);else if(!res||!res.over)FAIL.push(ev+': did not finish')};
 /* the on-screen events: the real UI at Fast, polled by condition */
 for(const ev of PLAN.all||[PLAN.ui])if(ev)for(let r=0;r<reps;r++){
  const T0=Date.now();const errs=[];const pg=await open(errs);
  await pg.evaluate(([ev,CFG])=>{$('#modal').hidden=true;SPEED='fast';SPEEDMUL.fast=0;startEvent(eval('('+CFG+')')(ev));SPEED='fast'},[ev,CFG.toString()]);
  const end=await pg.waitForFunction(()=>S&&S.over,null,{timeout:300000,polling:200}).then(()=>true).catch(()=>false);
  const res=await pg.evaluate(([f])=>eval('('+f+')')(S.over),[SUMMARY.toString()]).catch(()=>null);
  report(ev,res,errs,T0,'ui ');await pg.close()}
 /* the headless sims: one page for the shard's events, one simEvent each */
 if(PLAN.sims&&PLAN.sims.length){const errs=[];const pg=await open(errs);
  for(const ev of PLAN.sims)for(let r=0;r<reps;r++){
   const T0=Date.now();const n0=errs.length;
   const res=await pg.evaluate(async([ev,CFG,SUM])=>{const cfg=eval('('+CFG+')')(ev);const sum=eval('('+SUM+')');let cap=null;
     /* take the summary while the sim's S is still the live one (simEvent restores the game's own S right after) */
     let sim=null;Object.defineProperty(cfg,'sim',{configurable:true,get(){return sim},set(v){sim=v;const d=v.done;v.done=r=>{try{cap=sum(!!r||S.over)}catch(e){cap={over:false,err:String(e)}}return d(r)}}});
     try{await simEvent(cfg,{maxTurns:700,timeoutMs:60000})}catch(e){return {over:false,err:String(e&&e.message||e)}}return cap},[ev,CFG.toString(),SUMMARY.toString()]);
   if(res&&res.err)errs.push(ev+': '+res.err);
   report(ev,res,errs.slice(n0),T0,'sim')}
  await pg.close()}
 await b.close();
 console.log('ERRS '+JSON.stringify(FAIL));
 if(FAIL.length)process.exitCode=1;
})();

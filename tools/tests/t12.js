const { chromium } = require('playwright');
/* t12 — every event played by CPU sims (one page each). argv[3] = a comma list of events, or shard:a|b|c — the suite runs the
   three shards t12a/b/c in parallel (each a stub that sets shard:x). SHARDS are balanced by each event's time alone
   (2026-10-05, s: democritus 97 egidious 96 familia 77 juggernaut 64 cassian 61 chariot 54 triumviratus 48 ludus 43
   goldenEagle 42 orpheus 36 commodus 35 gauntlet 31 naumachia 21 → ~240 s a shard); every event in exactly one shard. */
const ALL_EVS=['democritus','egidious','cassian','gauntlet','triumviratus','orpheus','goldenEagle','familia','juggernaut','ludus','chariot','naumachia','commodus'];
const SHARDS={a:['democritus','familia','triumviratus','naumachia'],b:['egidious','juggernaut','ludus','gauntlet'],c:['cassian','chariot','goldenEagle','orpheus','commodus']};
{const all=Object.values(SHARDS).flat();if(all.length!==ALL_EVS.length||ALL_EVS.some(e=>all.filter(x=>x===e).length!==1)){console.log('ERRS ["t12 SHARDS must hold every event exactly once"]');process.exit(1)}}
const sh=/^shard:([a-z])$/.exec(process.argv[3]||'');
const EVS=sh?SHARDS[sh[1]]:process.argv[3]?process.argv[3].split(','):ALL_EVS;
const reps=+(process.argv[4]||1);
(async()=>{
 const b=await chromium.launch();
 for(const ev of EVS)for(let r=0;r<reps;r++){
  const T0=Date.now();const pg=await b.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('console: '+m.text())});
  await pg.goto('file://'+process.argv[2]); await pg.waitForTimeout(700);
  await pg.evaluate((ev)=>{$('#modal').hidden=true;SPEED='fast';SPEEDMUL.fast=0;const E=EVENTS[ev];
    let n={gauntlet:1,triumviratus:3,naumachia:6,chariot:5,commodus:3,familia:6,goldenEagle:6,juggernaut:4,orpheus:4,ludus:4}[ev]||4;
    let cls=['slave','soldier','royalty','hero','veteranus','amazonia','venatore','damnatio'];if(E.classes)cls=E.classes;if(E.noVenatore)cls=cls.filter(c=>c!=='venatore');cls=cls.slice(0,n);
    const seats=cls.map((c,i)=>({cls:c,cpu:true,diff:['normal','hard','easy'][i%3],team:E.coop?'A':E.teams==='jugg'?(i===0?'J':'T'):E.teams?(i%2?'B':'A'):undefined}));
    startEvent({ev,loc:E.loc,seats,opts:{mods:true,mandata:true,optOffers:true,eaglePot:true,spect:ev==='democritus'?4:0}});SPEED='fast'},ev);
  let t=0;for(;t<150;t++){await pg.waitForTimeout(1000);if(await pg.evaluate(()=>S.over)||errs.length)break}
  const res=await pg.evaluate(()=>{const L=S.logLines.map(l=>l.text);const c=re=>L.filter(x=>re.test(x)).length;
    return {over:S.over,rot:S.rotation,turns:S.turnNo,ri:S.ri,deck:S.deck.length,win:L.filter(x=>/wins|win |everyone loses|No gladiator/.test(x)).slice(-1)[0]?.slice(0,80),
      reveals:c(/ reveals /),giftLines:L.filter(x=>/ gives .* (to|for)/.test(x)).slice(0,3),forcedL:L.filter(x=>/decree/.test(x)).length,mf:c(/Mandati Flavi:/),gifts:c(/ gives /),aggroSwitch:c(/turns its aggro/),truce:c(/agree to a truce/),forced:c(/all truces are broken/),restless:c(/restless/i),tele:c(/Telemachus/),endgame:c(/Flavius Rule is in play/),boar:c(/Boar/),market:c(/buys/),hist:Object.keys(S.hist).length}});
  console.log(ev.padEnd(13),JSON.stringify(res),errs.slice(0,3).join(' | '),`(${Math.round((Date.now()-T0)/1000)}s)`);
  await pg.close();
 }
 await b.close();
})();

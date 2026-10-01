const { chromium } = require('playwright');
const EVS=process.argv[3]?process.argv[3].split(','):['democritus','egidious','cassian','gauntlet','triumviratus','orpheus','goldenEagle','familia','juggernaut','ludus','chariot','naumachia','commodus'];
const reps=+(process.argv[4]||1);
(async()=>{
 const b=await chromium.launch();
 for(const ev of EVS)for(let r=0;r<reps;r++){
  const pg=await b.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('console: '+m.text())});
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
  console.log(ev.padEnd(13),JSON.stringify(res),errs.slice(0,3).join(' | '));
  await pg.close();
 }
 await b.close();
})();

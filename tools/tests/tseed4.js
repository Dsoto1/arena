const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage();
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);
await pg.click('#mClose');
const r=await pg.evaluate(async()=>{
  const seats=()=>[{cls:'soldier',cpu:true,diff:'normal'},{cls:'hero',cpu:true,diff:'hard'},{cls:'amazonia',cpu:true,diff:'easy'},{cls:'venatore',cpu:true,diff:'normal'}];
  const sig=r2=>JSON.stringify({t:r2.turns,rows:r2.rows.map(x=>[x.f,x.alive,x.kp,x.pots])});
  const seeds=[31415,8675309,99991,123456,1,42,777,31337,2026,55555,808,4096];
  const fails=[];
  for(const sd of seeds){
    const c=()=>({ev:'democritus',loc:6,seats:seats(),opts:{mods:true,mandata:true,optOffers:true,eaglePot:true,spect:16},seed:sd});
    const a=await simEvent(c()),b2=await simEvent(c());
    if(sig(a)!==sig(b2))fails.push({sd,t1:a.turns,t2:b2.turns});
  }
  // different events too
  for(const [ev,sd] of [['egidious',31415],['cassian',8675309],['goldenEagle',424242]]){
    const c=()=>({ev,loc:3,seats:seats(),opts:{mods:true,mandata:true,optOffers:true,eaglePot:true,spect:24},seed:sd});
    const a=await simEvent(c()),b2=await simEvent(c());
    if(sig(a)!==sig(b2))fails.push({ev,sd,t1:a.turns,t2:b2.turns});
  }
  return {pairs:15,fails};
});
console.log(JSON.stringify(r));
await b.close()})();

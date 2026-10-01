const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
const r=await pg.evaluate(async()=>{newWorld({type:'custom',mgr:{name:'T',ludus:'L',city:'Roma',color:'#c00',p:{...MGR_PRESETS.balanced[1]},portrait:{}}});const w=W_();
  const h1=nightHTML();const m1=h1.match(/Tickets sold<\/i><b>🎟 ([^<]*)/);w.hours=Math.max(0,w.hours-6);const h2=nightHTML();const m2=h2.match(/Tickets sold<\/i><b>🎟 ([^<]*)/);
  for(let i=0;i<3;i++)await runBoutSim(i);const rh=nightResultsHTML();return {m1:m1&&m1[1],m2:m2&&m2[1],trend:/class="up">▲/.test(h2),spark:/class="spark"/.test(h2),att:(rh.match(/🏟 [^<]*/g)||[]).slice(0,3)}});
console.log(JSON.stringify(r),errs.slice(0,3));await b.close()})();

const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:950}});
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_mm100off','1')});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());await pg.goto('file://'+process.argv[2],{waitUntil:'domcontentloaded',timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY);await pg.waitForTimeout(2500);
for(const t of [4.0,17.0,28.6]){await pg.evaluate(t=>{MM.plan.duel=true;MM.plan.tEnd=34;if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}MM.t0=performance.now()-t*1000;mmLoop();if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}},t);
const el=await pg.$('#mmCv');await el.screenshot({path:process.argv[3]+'/flat_'+t+'.png'})}await b.close()})();

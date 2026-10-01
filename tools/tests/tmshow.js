const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:950}});
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(500);
await pg.evaluate(()=>{MM.plan.duel=true;MM.plan.tEnd=34});
const t0=Date.now();const shots=[11.8,13.2,15.0,16.6,18.6,21.2,23.4,26.5,28.9,32.5];
for(const s of shots){const w=s*1000-(Date.now()-t0);if(w>0)await pg.waitForTimeout(w);const el=await pg.$('#mmCv');await el.screenshot({path:`ms_${s}.png`})}
const raf=await pg.evaluate(()=>MM.raf);await pg.waitForTimeout(2500);const raf2=await pg.evaluate(()=>MM.raf);
console.log('raf',raf,raf2,errs.slice(0,5));await b.close()})();

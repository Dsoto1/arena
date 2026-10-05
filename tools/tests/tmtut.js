const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const careers0=await pg.evaluate(async()=>(await Store.list('mgrCareers')).length);
await pg.click('[data-mm82="tut"]');await pg.waitForTimeout(200);await pg.click('[data-mm="learnmgr"]');await pg.waitForTimeout(1500);
const log=[];const st=()=>pg.evaluate(()=>({step:MTUT.step,tab:MGR.tab,spot:(document.querySelector('.tutspot')||{}).className||null}));
const next=async()=>{await pg.evaluate(()=>{const b=document.querySelector('[data-mt="next"]');b&&b.click()});await pg.waitForTimeout(500)};
const tab=async id=>{await pg.evaluate(id=>document.querySelector(`[data-mg="tab"][data-id="${id}"]`).click(),id);await pg.waitForTimeout(700)};
log.push(await st());await pg.screenshot({path:'mtut_a.png'});await next();log.push(await st());await next();
await tab('roster');log.push(await st());await next();await tab('recruit');await next();await tab('practice');await next();await tab('night');log.push(await st());await pg.screenshot({path:'mtut_b.png'});await next();
// enter a fighter in the first bout that offers one
await pg.evaluate(()=>{const b=document.querySelector('[data-mg="enter"]');b&&b.click()});await pg.waitForTimeout(1200);log.push(await st());
await pg.evaluate(()=>{const b=document.querySelector('[data-mg="simall"]');b&&b.click()});for(let i=0;i<40;i++){if(await pg.evaluate(()=>MTUT.step>=12))break;await pg.waitForTimeout(500)}
log.push(await st());await next();await tab('league');log.push(await st());
await pg.evaluate(()=>document.querySelector('[data-mg="endask"]').click());await pg.waitForTimeout(800);
await pg.evaluate(()=>{const b=document.querySelector('[data-mg="endweek"]');b&&b.click()});for(let i=0;i<30;i++){if(await pg.evaluate(()=>MTUT.step>=16))break;await pg.waitForTimeout(500)}
log.push(await st());await next();await pg.waitForTimeout(800);
const fin=await pg.evaluate(async()=>({title:document.getElementById('mTitle').textContent,btns:[...document.querySelectorAll('#mBtns button')].map(b=>b.textContent),world:!!MGR.world,careers:(await Store.list('mgrCareers')).length,done:localStorage.getItem('flavius_mtutDone')}));
await pg.screenshot({path:'mtut_c.png'});
console.log(JSON.stringify({careers0,log,fin}),errs.slice(0,4));await b.close()})();

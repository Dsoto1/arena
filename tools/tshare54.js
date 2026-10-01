const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:950}});await ctx.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));const miss=[];pg.on('requestfailed',r=>miss.push(r.url().slice(0,80)));
await pg.goto('file:///tmp/sharetest39/flavius-rule-arena-v0.54.html');await pg.waitForTimeout(3500);
const o=await pg.evaluate(()=>({menu:!document.getElementById('mainMenu').hidden,logo:document.querySelector('.mmlogo').naturalWidth>0,ver:document.querySelector('.brand .ed').textContent,card:cardStyle('w:gladius').includes('data:image')}));
await pg.screenshot({path:'share39.png'});
console.log(JSON.stringify(o),'missing',miss.filter(u=>/assets\//.test(u)).length,errs.slice(0,3));await b.close()})();

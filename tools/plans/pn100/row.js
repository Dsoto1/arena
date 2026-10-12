/* node tools/plans/pn100/row.js <page> — the event row at 1440 and 390 → row_1440.png, row_390.png */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const page=path.resolve(process.argv[2]);const b=await chromium.launch();
for(const [w,h,n] of [[1440,900,'row_1440'],[390,844,'row_390']]){const pg=await b.newPage({viewport:{width:w,height:h}});await pg.route(/fonts\.g/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async()=>{for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}openSetup(true)});await pg.waitForTimeout(1200);
console.log(n,await pg.evaluate(()=>({doc:document.documentElement.scrollWidth,w:innerWidth})));
await pg.screenshot({path:__dirname+'/'+n+'.png'})}
await b.close()})();

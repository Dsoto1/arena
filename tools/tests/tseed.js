const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{openHall('events')});await pg.waitForTimeout(1200);
const btn=await pg.evaluate(()=>!!document.querySelector('[data-seedrun]'));
await pg.click('[data-seedrun]');await pg.waitForTimeout(2500);await pg.screenshot({path:'seed.png'});
for(let i=0;i<120;i++){if(await pg.evaluate(()=>!window._seeding))break;await pg.waitForTimeout(1000)}
await pg.waitForTimeout(2000);
const r=await pg.evaluate(async()=>({n:Object.keys((await Store.getDoc('hall','eventRecords'))||{}).length,btnAfter:!!document.querySelector('[data-seedrun]')}));
console.log(btn,JSON.stringify(r),errs.slice(0,3));await b.close()})();

const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1100}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{openStudio('gear')});await pg.waitForTimeout(800);
await pg.click('[data-cwt="thr"]');await pg.waitForTimeout(300);
await pg.click('[data-cwf="s.both"]');await pg.waitForTimeout(300);
const r=await pg.evaluate(()=>({st:ST.cw.stats,tiles:[...document.querySelectorAll('.icot.on b')].map(x=>x.textContent),card:[...document.querySelectorAll('#cwPrev title')].map(t=>t.textContent)}));
await pg.evaluate(()=>document.querySelector('.icogrid').scrollIntoView());await pg.waitForTimeout(200);
await pg.screenshot({path:'ico.png'});
console.log(JSON.stringify(r),errs.slice(0,3));await b.close()})();

const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1500,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1500);
await pg.evaluate(()=>{SETTINGS.briefing=true;const b=document.getElementById('mBody');b.scrollTop=9999;window.scrollTo(0,500)});
await pg.click('#goBtn');await pg.waitForTimeout(2500);
const o=await pg.evaluate(()=>({title:document.getElementById('mTitle').textContent,scroll:window.scrollY,turn:S.turnNo}));
await pg.screenshot({path:'go45.png'});
await pg.click('#mBtns button');await pg.waitForTimeout(1500);o.after=await pg.evaluate(()=>({turn:S.turnNo,ph:S.phase}));
console.log(JSON.stringify(o),'ERRS',errs.slice(0,4));await b.close()})();

const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{startEvent({ev:'juggernaut',loc:6,seats:['soldier','hero','slave','royalty'].map((c,i)=>({cls:c,cpu:true,team:i===0?'J':'T'})),opts:{spect:24}});});
await pg.waitForTimeout(1500);await pg.evaluate(()=>{SPEED='snap';S.snap=true});
for(let i=0;i<200;i++){if(await pg.evaluate(()=>S.over))break;await pg.waitForTimeout(250)}
await pg.waitForTimeout(2500);
const r=await pg.evaluate(()=>({sp:(S.spect||[]).length,seated:(S.spect||[]).filter(s=>s._x!=null).length,gone:(S.spect||[]).filter(s=>s.gone).length,special:isSpecialShow(),over:S.over,tosses:(S.tosses||[]).length,ev:S.evKey}));
await pg.evaluate(()=>{const m=document.getElementById('modal');m.hidden=true});await pg.waitForTimeout(300);
const box=await pg.evaluate(()=>{const r=cv.getBoundingClientRect();return {x:r.left,y:r.top,width:r.width,height:r.height}});await pg.screenshot({path:'toss.png',clip:box});
console.log(JSON.stringify(r),errs.slice(0,3));await b.close()})();

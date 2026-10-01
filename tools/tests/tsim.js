const { chromium } = require('playwright');
(async()=>{
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:950}});
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
const res={};
for(const ev of ['gauntlet']){
await pg.evaluate((ev)=>{SPEED='fast';SPEEDMUL.fast=0;startEvent({ev,loc:6,seats:[{cls:'soldier',cpu:false},{cls:'hero',cpu:true,diff:'hard'},{cls:'slave',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:'auto'}});},ev);
await pg.waitForTimeout(2500);
// dismiss rule popups
for(let i=0;i<6;i++){await pg.evaluate(()=>{const b=document.querySelector('#mBtns button');if(b&&!document.querySelector('#modal').hidden)b.click()});await pg.waitForTimeout(300)}
res[ev+'_btnVisible']=await pg.evaluate(()=>!document.querySelector('#btnSimEnd').hidden);
await pg.evaluate(()=>{simToEnd(true)});
for(let i=0;i<120;i++){const o=await pg.evaluate(()=>S.over);if(o)break;await pg.evaluate(()=>{const m=document.querySelector('#modal');if(m&&!m.hidden){const b=document.querySelector('#mBtns button');if(b)b.click()}});await pg.waitForTimeout(500)}
res[ev+'_over']=await pg.evaluate(()=>({o:S.over,ph:S.phase,b:S.busy,rot:S.rotation,cur:cur().name,cpu:S.players.map(p=>p.cpu),alive:S.players.map(p=>p.alive),modal:!document.querySelector('#modal').hidden,mt:document.querySelector('#modal h2,#modal .mtitle')?.textContent}));
await pg.reload();await pg.waitForTimeout(1500);
}
console.log(JSON.stringify(res));console.log(errs.slice(0,5));await b.close();})();

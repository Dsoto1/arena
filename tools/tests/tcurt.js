const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{startEvent({ev:'democritus',loc:6,seats:['soldier','hero'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});SPEED='pause'});
await pg.waitForTimeout(500);const clip={x:380,y:150,width:260,height:140};
const box=await pg.evaluate(()=>{const r=cv.getBoundingClientRect();return {x:r.left,y:r.top}});
await pg.screenshot({path:'curt_a.png',clip:{x:box.x+300,y:box.y,width:300,height:120}});
const v1=await pg.evaluate(()=>curtainV());await pg.waitForTimeout(4600);
await pg.screenshot({path:'curt_b.png',clip:{x:box.x+300,y:box.y,width:300,height:120}});const v2=await pg.evaluate(()=>curtainV());
console.log(v1.toFixed(2),v2.toFixed(2),errs.slice(0,3));await b.close()})();

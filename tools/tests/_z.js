const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1500);
const r=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();SPEED='fast';SPEEDMUL.fast=0;startEvent({ev:'democritus',loc:6,seats:[{cls:'slave',cpu:true},{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  await new Promise(r=>setTimeout(r,800));S.ri=2;draw();await new Promise(r=>setTimeout(r,1500));const z1=DUEL.z;simToEnd(true);for(let i=0;i<200&&!S.over;i++)await new Promise(r=>setTimeout(r,200));
  await new Promise(r=>setTimeout(r,2500));return {z1,over:S.over,z2:DUEL.z,zoomIn:S.zoomIn,duel:duelZoneOn()}});
console.log(JSON.stringify(r),errs.slice(0,3));await b.close()})();

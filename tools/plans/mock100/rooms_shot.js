/* node tools/plans/mock100/rooms_shot.js — rooms.html: #roster #yard #infirmary at 1440x900 + #phone-* at 390x844 (scrolled) */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();
for(const [h,W,H] of [['roster',1440,900],['yard',1440,900],['infirmary',1440,900],['phone-roster',390,844],['phone-yard',390,844],['phone-infirmary',390,844]]){
 const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:W<600?2:1});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+path.resolve(__dirname,'rooms.html')+'#'+h);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(600);
 const nm=`rooms_${h}_${W}`;await pg.screenshot({path:path.resolve(__dirname,nm+'.png')});
 const m=await pg.evaluate(()=>{const d=document.querySelector('.dos');return {sw:d.scrollWidth>d.clientWidth+1,sh:d.scrollHeight,ch:d.clientHeight}});
 if(W<600){let k=1;for(let y=H-140;y<m.sh&&k<7;y+=H-140){await pg.evaluate(y=>document.querySelector('.dos').scrollTop=y,y);await pg.waitForTimeout(150);await pg.screenshot({path:path.resolve(__dirname,`${nm}_${++k}.png`)})}}
 console.log(nm,JSON.stringify(m),errs);await pg.close()}
await b.close()})();

/* node tools/plans/mock100/recruit3_shot.js — screenshots recruit3.html (#scout #court #offer at 1440x900, #phone + #scout/#offer at 390x844, scrolled) */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();
for(const [h,W,H] of [['scout',1440,900],['court',1440,900],['offer',1440,900],['phone',390,844],['scout',390,844],['offer',390,844]]){
 const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:W<600?2:1});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+path.resolve(__dirname,'recruit3.html')+'#'+h);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(500);
 const nm=`recruit3_${h}_${W}`;await pg.screenshot({path:path.resolve(__dirname,nm+'.png')});
 const m=await pg.evaluate(()=>{const d=document.querySelector('.dos');return {sw:document.documentElement.scrollWidth>innerWidth||d.scrollWidth>d.clientWidth+1,sh:d.scrollHeight,ch:d.clientHeight,wrap:[...document.querySelectorAll('.one')].filter(e=>e.offsetParent&&e.scrollWidth>e.clientWidth+1).length}});
 if(W<600){let k=1;for(let y=H-140;y<m.sh&&k<6;y+=H-140){await pg.evaluate(y=>document.querySelector('.dos').scrollTop=y,y);await pg.waitForTimeout(150);await pg.screenshot({path:path.resolve(__dirname,`${nm}_${++k}.png`)})}}
 console.log(nm,JSON.stringify(m),errs);await pg.close()}
await b.close()})();

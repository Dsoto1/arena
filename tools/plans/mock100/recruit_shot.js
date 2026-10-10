/* node tools/plans/mock100/recruit_shot.js — screenshots recruit.html states (1440x900 + 390x844, phone also scrolled) */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();
const shots=[['chart',1440,900],['chart',390,844],['scout',1440,900],['court',1440,900],['offer',1440,900],['phone',390,844],['scout',390,844],['offer',390,844]];
for(const [h,W,H] of shots){const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:W<600?2:1});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+path.resolve(__dirname,'recruit.html')+'#'+h);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(400);
 const nm=`recruit_${h}_${W}`;
 if(W>600&&h!=='chart'){await pg.evaluate(h=>{const d=document.querySelector('.dos');const t=document.querySelector(h==='scout'?'.prof':'.steps');d.scrollTop=h==='scout'?0:t.offsetTop-300},h)}
 await pg.screenshot({path:path.resolve(__dirname,nm+'.png')});
 if(W>600&&h==='court'){await pg.evaluate(()=>{const d=document.querySelector('.dos');d.scrollTop=d.scrollHeight});await pg.waitForTimeout(150);await pg.screenshot({path:path.resolve(__dirname,nm+'_2.png')})}
 const ov=await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.querySelector('.dos').scrollWidth>document.querySelector('.dos').clientWidth+1);
 if(W<600){for(const [i,sel] of [[2,'.steps'],[3,'.pane:not([style]) .r3, .pane .notes']].entries()){}
  const tot=await pg.evaluate(()=>document.querySelector('.dos').scrollHeight);let k=1;for(let y=H-120;y<tot&&k<5;y+=H-120){await pg.evaluate(y=>document.querySelector('.dos').scrollTop=y,y);await pg.waitForTimeout(150);await pg.screenshot({path:path.resolve(__dirname,`${nm}_${++k}.png`)})}}
 console.log(nm,'hscroll',ov,'errs',errs);await pg.close()}
await b.close()})();

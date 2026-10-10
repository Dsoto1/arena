/* node tools/plans/mock100/bubbles_shot.js — screenshots of bubbles.html at 1440x900 and 390x844 (dpr 2) */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const url='file://'+path.resolve(__dirname,'bubbles.html');
for(const [w,h,tag] of [[1440,900,'1440'],[390,844,'390']]){const pg=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:w<600?2:1});
 await pg.goto(url);await pg.waitForLoadState('networkidle').catch(()=>{});await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(500);
 await pg.screenshot({path:path.join(__dirname,`bubbles_mock_${tag}_full.png`),fullPage:true});
 const caps=await pg.$$('.cap');let i=0;for(const c of caps){i++;const y=await c.evaluate(e=>e.getBoundingClientRect().top+scrollY);
  await pg.evaluate(y=>scrollTo(0,y-10),y);await pg.waitForTimeout(150);await pg.screenshot({path:path.join(__dirname,`bubbles_mock_${tag}_s${i}.png`)})}
 const sw=await pg.evaluate(()=>document.documentElement.scrollWidth);console.log(tag,'scrollWidth',sw);await pg.close()}
await b.close()})();

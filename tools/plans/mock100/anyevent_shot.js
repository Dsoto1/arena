/* Shots of the any-event mock: node tools/plans/mock100/anyevent_shot.js */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [W,H,dpr] of [[1440,900,1],[390,844,2]]){const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:dpr});
await pg.goto('file://'+__dirname+'/anyevent.html');await pg.waitForTimeout(600);
await pg.screenshot({path:__dirname+`/anyevent_${W}.png`,fullPage:true});
const ov=await pg.evaluate(()=>document.documentElement.scrollWidth-innerWidth);console.log(W,'overflow',ov);await pg.close()}
await b.close()})();

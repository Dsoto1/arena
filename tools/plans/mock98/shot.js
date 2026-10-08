/* node tools/plans/mock98/shot.js <page.html#hash> <out.png> [width] [height] — screenshots a mock page */
const {chromium}=require('playwright');(async()=>{const [,,page,out,w,h]=process.argv;const b=await chromium.launch();
const W=+(w||1440),H=+(h||900);const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:W<600?2:1});
await pg.goto('file://'+require('path').resolve(__dirname,page.split('#')[0])+(page.includes('#')?'#'+page.split('#')[1]:''));
await pg.waitForLoadState('networkidle').catch(()=>{});await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(400);
await pg.screenshot({path:require('path').resolve(__dirname,out)});await b.close()})();

/* node tools/plans/mock100/banner_shot.js — screenshots banner.html at 1440×900 and 390×844 (full page + the designer + each tab) */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();
for(const [W,H,tag] of [[1440,900,'1440'],[390,844,'390']]){const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:W<600?2:1});
  const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
  await pg.goto('file://'+path.resolve(__dirname,'banner.html'));await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(700);
  await pg.screenshot({path:path.resolve(__dirname,`banner_${tag}.png`)});
  await pg.screenshot({path:path.resolve(__dirname,`banner_${tag}_full.png`),fullPage:true});
  const sec=async(sel,name)=>{const el=await pg.$(sel);if(el)await el.screenshot({path:path.resolve(__dirname,`banner_${tag}_${name}.png`)})};
  await sec('#today','today');await sec('.studio','designer');await sec('#sets','sets');await sec('.qa','quality');
  if(W>600){for(const t of ['pat','emb','trim']){await pg.click(`[data-t="${t}"]`);if(t==='trim'){await pg.fill('#wear','60');await pg.dispatchEvent('#wear','input');await pg.click('[data-k="velarium"]')}await pg.waitForTimeout(200);await sec('.studio','designer_'+t)}}
  console.log(tag,'errors',JSON.stringify(errs));await pg.close()}
await b.close()})();

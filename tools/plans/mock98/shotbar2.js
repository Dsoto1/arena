/* node tools/plans/mock98/shotbar2.js — screenshots actionbar2.html → bar2_choice / bar2_action / bar2_390 / bar2_detail / bar2_page */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();
const f='file://'+path.resolve(__dirname,'actionbar2.html');const o=n=>path.resolve(__dirname,n);
for(const [dsf,shots] of [[1,[['#sChoice','bar2_choice.png'],['#sAction','bar2_action.png']]],[2,[['#sPhone','bar2_390.png'],['#barAct','bar2_detail.png']]]]){
 const pg=await b.newPage({viewport:{width:1100,height:1500},deviceScaleFactor:dsf});await pg.goto(f);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(300);
 for(const [sel,out] of shots)await (await pg.$(sel)).screenshot({path:o(out)});
 if(dsf===1)await pg.screenshot({path:o('bar2_page.png'),fullPage:true});await pg.close()}
await b.close()})();

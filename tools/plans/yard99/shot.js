/* node tools/plans/yard99/shot.js <page> <prefix> : Training Yard shots at 1440 / 1280 / 390 */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
for(const [w,h] of [[1440,900],[1280,800],[390,844]]){const pg=await b.newPage({viewport:{width:w,height:h}});await pg.route(/fonts\.g/,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();
    for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(300);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=600;
    for(const g of rosterOf(m)){g.inj=null;g.fat=0;g.restWk=null}MGR.tab='practice';MGR_REDRAW();for(let i=0;i<40&&!document.querySelector('.y92c');i++)await W8(100)});
  await pg.waitForTimeout(500);await pg.screenshot({path:`tools/plans/yard99/${process.argv[3]}_${w}.png`,fullPage:false});
  await pg.evaluate(()=>{const c=document.querySelector('.y92grid');c&&c.scrollIntoView({block:'start'})});await pg.waitForTimeout(300);
  await pg.screenshot({path:`tools/plans/yard99/${process.argv[3]}_${w}_b.png`});await pg.close()}
await b.close()})()

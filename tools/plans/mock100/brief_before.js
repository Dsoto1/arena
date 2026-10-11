/* node tools/plans/mock100/brief_before.js — BEFORE shots of today's event briefing (Democritus + Golden Eagle) at 1440 and 390 */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const out=__dirname+'/';
for(const [ev,tag] of [['democritus','classic'],['goldenEagle','special']])for(const [W,H,sfx] of [[1440,900,''],[390,844,'_390']]){
const pg=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:W<600?2:1});
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(__dirname,'../../../flavius-arena.html'));
await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});await pg.waitForTimeout(800);
await pg.evaluate(ev=>{SETTINGS.briefing=true;CFG.ev=ev;CFG.loc=EVENTS[ev].loc;CFG.n=EVENTS[ev].min;openSetup(true)},ev);await pg.waitForTimeout(1500);
await pg.evaluate(ev=>{CFG.ev=ev;CFG.loc=EVENTS[ev].loc;const g=document.getElementById('goBtn');g&&g.click()},ev);
await pg.waitForFunction(()=>document.querySelector('#modal:not([hidden]) .brief'),null,{timeout:30000}).catch(e=>console.log('nobrief',ev,W));
await pg.waitForTimeout(1200);
await pg.screenshot({path:out+'brief_before_'+tag+sfx+'.png'});
console.log(ev,W,await pg.evaluate(()=>document.querySelector('.brname')&&document.querySelector('.brname').textContent));
await pg.close()}
await b.close()})();

const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1000);await pg.evaluate(()=>{window.travelOK=()=>true;window.travelBlock=()=>false});await pg.click('#mClose');
await pg.evaluate(()=>{newWorld({type:'pre',key:MGR_PRE[0].key});openManager()});await pg.waitForTimeout(500);
await pg.evaluate(()=>{MGR.tab='night';MGR_REDRAW()});await pg.waitForTimeout(300);
await pg.click('[data-mg="city"]');await pg.waitForTimeout(400);
// v1.05 (360-v105mw): walking the host city's square counts as setting off, so it asks first — confirm
await pg.evaluate(()=>{const y=document.querySelector('.ask76bg [data-ask76="1"]');if(y)y.click()});await pg.waitForTimeout(1000);
await pg.evaluate(()=>cityHorns());await pg.waitForTimeout(600);
await pg.evaluate(()=>cityEnterArena());await pg.waitForTimeout(1500);
const l1=await pg.evaluate(()=>{const w=W_();const btn=document.querySelector('[data-mg="city"]');
  return {lock:w.night.hornsLock,btnDisabled:btn?btn.disabled:null}});
// direct attempt to re-open the square must refuse
const l2=await pg.evaluate(()=>{openCitySquare(W_().night.loc,{prematch:true});return {cityOpen:!!CITY.open,toast:(document.getElementById('mToast')||{}).textContent||''}});
// simulate the locked bout → square unlocks
await pg.evaluate(()=>{const b2=[...document.querySelectorAll('#mgrBody button')].find(x=>/Simulate it/.test(x.textContent));if(b2)b2.click()});
await pg.waitForTimeout(4000);
const l3=await pg.evaluate(()=>{const w=W_();const n=w.night;const btn=document.querySelector('[data-mg="city"]');
  return {boutDone:n.bouts[n.hornsLock]?n.bouts[n.hornsLock].done:null,btnDisabled:btn?btn.disabled:null,tab:MGR.tab}});
await pg.screenshot({path:'lock33.png',clip:{x:100,y:40,width:1300,height:800}});
console.log(JSON.stringify({l1,l2,l3}),errs.slice(0,4));await b.close()})();

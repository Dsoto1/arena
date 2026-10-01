const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{newWorld({type:'pre',key:MGR_PRE[0].key});openManager()});await pg.waitForTimeout(700);
await pg.evaluate(()=>{MGR.tab='me';MGR_REDRAW()});await pg.waitForTimeout(500);
await pg.screenshot({path:process.argv[3]||'lan_before.png',fullPage:false});
const cols=await pg.evaluate(()=>[...document.querySelectorAll('.lan3>div')].map(d=>Math.round(d.getBoundingClientRect().height)));
// presets on the creation screen
await pg.evaluate(()=>{MGR.world=null;MGR_REDRAW()});await pg.waitForTimeout(300);
await pg.evaluate(()=>{const b2=document.querySelector('[data-mg="create"]');b2&&b2.click()});await pg.waitForTimeout(400);
await pg.evaluate(()=>{const d=document.querySelector('details.card2');if(d)d.open=true;document.querySelector('[data-mg="nmrulepre"][data-id="hard"]').click()});await pg.waitForTimeout(400);
const hard=await pg.evaluate(()=>[...document.querySelectorAll('[data-nmrule]')].map(x=>x.dataset.nmrule+'='+x.value).join(' '));
console.log(JSON.stringify({cols,hard}),errs.slice(0,3));await b.close()})();

const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});await pg.evaluate(()=>{window.travelOK=()=>true;window.travelBlock=()=>false});await pg.click('#mClose');
const mode=process.argv[3]||'crew';
await pg.evaluate(()=>{newWorld({type:'pre',key:MGR_PRE[0].key});openManager()});
/* each step keeps its old pause, then polls for the state it needs (the regression runs 3 tests at once: timers stretch) */
const until=async(fn,ms=30000)=>{const t0=Date.now();while(Date.now()-t0<ms){if(await pg.evaluate(fn).catch(()=>false))return true;await pg.waitForTimeout(200)}return false};
await pg.waitForTimeout(600);await until(()=>!!document.querySelector('#mgrBody'));
await pg.evaluate(()=>{MGR.tab='night';MGR_REDRAW()});await pg.waitForTimeout(300);await until(()=>!!document.querySelector('#mgrBody [data-mg="watch"]'));
await pg.evaluate(()=>{const b2=[...document.querySelectorAll('#mgrBody [data-mg="watch"]')][0];b2.click()});
await pg.waitForTimeout(1500);await until(()=>typeof S!=='undefined'&&!!S&&!!S.players&&!!S.mgrCtx);await pg.evaluate(()=>{window.__spd0=SPEED;SPEED='pause'});
/* the opening windows are answered until the bout is under way (time-boxed, not counted: under load each round takes longer) */
for(const T_=Date.now();Date.now()-T_<180000;){const st=await pg.evaluate(()=>({ph:S&&S.phase,modal:!document.getElementById('modal').hidden}));if(st.ph&&st.ph!=='setup')break;
  if(st.modal)await pg.evaluate(()=>{const bs=[...document.querySelectorAll('#mBtns .btn,#mBody .btn')].filter(x=>!x.disabled);const p2=bs.find(x=>x.classList.contains('primary'))||bs[0];if(p2)p2.click()});await pg.waitForTimeout(400)}
{const ph=await pg.evaluate(()=>S&&S.phase);if(!ph||ph==='setup')console.log('STILL IN SETUP',ph)}
await pg.evaluate(()=>{const m=document.getElementById('modal');if(m)m.hidden=true;const a=S.players.filter(p=>p.alive);for(let i=1;i<a.length;i++)eliminate(a[i],{type:'player',p:a[0]})});
/* under load the pause can catch a CPU step half way (S.busy): that step only finishes — and only then checks the end — once the
   arena runs again, so it is let go in that case (no check depends on the pause) */
await pg.evaluate(()=>{if(S.busy&&SPEED==='pause')SPEED=window.__spd0||'normal'});
if(!await until(()=>!!S.over,120000))console.log('NOT OVER',JSON.stringify(await pg.evaluate(()=>({ph:S.phase,turn:S.turnNo,cur:cur()&&cur().name,alive:S.players.filter(p=>p.alive).length,busy:S.busy,speed:SPEED,modal:!document.getElementById('modal').hidden,title:($('#mTitle')||{}).textContent}))));
/* the results window (with its buttons) arrives after the horns and fanfare */
/* (under load the horns, fanfare and laurels stretch past a minute: wait for the window itself, 3 min at most) */
await pg.waitForTimeout(3000);if(!await until(()=>!document.getElementById('modal').hidden&&[...document.querySelectorAll('#mBtns .btn')].some(x=>/Watch the crew/.test(x.textContent)),180000))
  console.log('NO RESULTS WINDOW',JSON.stringify(await pg.evaluate(()=>({modal:!document.getElementById('modal').hidden,title:($('#mTitle')||{}).textContent,btns:[...document.querySelectorAll('#mBtns .btn')].map(x=>x.textContent.slice(0,30)),over:!!(S&&S.over),ph:S&&S.phase,clean:!!(S&&S.clean)}))));
const res=await pg.evaluate(()=>({title:$('#mTitle').textContent.slice(0,50),btns:[...document.querySelectorAll('#mBtns .btn')].map(x=>x.textContent.slice(0,40))}));
console.log('RESULTS',JSON.stringify(res));
if(mode==='now'){await pg.evaluate(()=>{const bb=[...document.querySelectorAll('#mBtns .btn')].find(x=>/Return to Match Week/.test(x.textContent));bb.click()});await pg.waitForTimeout(2500)}
else{await pg.evaluate(()=>{const bb=[...document.querySelectorAll('#mBtns .btn')].find(x=>/Watch the crew/.test(x.textContent));bb.click()});
  await pg.waitForTimeout(5500);const hud=await pg.evaluate(()=>{const h=document.getElementById('cleanHUD');return h?h.textContent:null});console.log('HUD',hud);
  await pg.screenshot({path:'hud35.png',clip:{x:0,y:40,width:1100,height:700}});
  for(let i=0;i<40;i++){await pg.waitForTimeout(1500);const o=await pg.evaluate(()=>!document.getElementById('modal').hidden&&/Manager/.test($('#mTitle').textContent));if(o)break}}
const end=await pg.evaluate(()=>({title:$('#mTitle').textContent.slice(0,30),modal:!document.getElementById('modal').hidden,tab:MGR.tab,full:document.getElementById('modal').classList.contains('full'),boutDone:W_().night.bouts[0].done,clean:!!S.clean,hud:!!document.getElementById('cleanHUD')}));
console.log('END',JSON.stringify(end));console.log('ERRS',errs.slice(0,5));await b.close()})();

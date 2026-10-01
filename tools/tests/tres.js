const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2000);
await pg.evaluate(()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');
  const seats=[{cls:'slave',cpu:true,diff:'easy'},{cls:'soldier',cpu:true},{cls:'amazonia',cpu:true,diff:'easy'},{cls:'hero',cpu:true}].map(s=>({...s,pers:finalPers(s)}));
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:0}});});
await pg.waitForTimeout(1500);await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);simToEnd()});await pg.waitForTimeout(600);await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(b=>/Sim to end/.test(b.textContent));b&&b.click()});
for(let i=0;i<60;i++){await pg.waitForTimeout(1000);const t=await pg.evaluate(()=>S&&S.over&&!document.getElementById('modal').hidden&&!!document.querySelector('.rcard'));if(t)break}
await pg.waitForTimeout(800);await pg.screenshot({path:'res54.png'});
const o=await pg.evaluate(()=>[...document.querySelectorAll('#mBtns button')].map(b=>b.textContent.slice(0,40)));console.log(JSON.stringify(o));
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(b=>/Save all/.test(b.textContent));b&&b.click()});await pg.waitForTimeout(1200);
console.log(await pg.evaluate(()=>[...document.querySelectorAll('#mBtns button')].map(b=>b.textContent.slice(0,40)+(b.disabled?'[d]':'')).join(' | ')));
console.log(errs.slice(0,3));await b.close()})();

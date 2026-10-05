const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await pg.evaluate(()=>{document.getElementById('modal').hidden=true;POPPED.add('firstTurn');
  const seats=[{cls:'slave',cpu:true,diff:'easy',name:'A'},{cls:'soldier',cpu:false,name:'Me'},{cls:'amazonia',cpu:true,diff:'easy',name:'C'}].map(s=>({...s,pers:finalPers(s)}));
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts}});});
await pg.waitForTimeout(1500);
await pg.evaluate(()=>{SPEED='step'});
let bars=0,caps=[];
for(let i=0;i<80;i++){const st=await pg.evaluate(()=>{const el=document.getElementById('stepBar');return {vis:!!el&&!el.hidden,txt:el?el.textContent.slice(0,140):'',hum:humanTurn(),ph:S.phase,modal:!document.getElementById('modal').hidden}});
  if(st.modal){await pg.evaluate(()=>{const b=document.querySelector('#mBtns button');b&&b.click()})}
  if(st.vis){bars++;if(caps.length<3)caps.push(st.txt);if(bars===2)await pg.screenshot({path:'step_a.png'});await pg.keyboard.press('Space')}
  if(st.hum&&(st.ph==='choice')&&bars>2)break;await pg.waitForTimeout(250)}
await pg.waitForTimeout(600);
const r=await pg.evaluate(()=>({hum:humanTurn(),ph:S.phase,glow:[...document.querySelectorAll('.sugglow')].map(x=>x.dataset.act),dock:document.getElementById('hintDock').innerText.slice(0,400)}));
await pg.screenshot({path:'step_b.png'});
console.log(bars,JSON.stringify(caps),JSON.stringify(r),errs.slice(0,5));
await b.close()})();

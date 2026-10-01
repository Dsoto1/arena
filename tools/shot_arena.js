const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const W=+(process.argv[3]||1920);const pg=await b.newPage({viewport:{width:W,height:1050}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1500);
await pg.evaluate(()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');SPEED='fast';
  const seats=[{cls:'slave',cpu:true,diff:'easy',name:'A'},{cls:'soldier',cpu:false,name:'Me'},{cls:'amazonia',cpu:true,diff:'easy',name:'C'}].map(s=>({...s,pers:finalPers(s)}));
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:'auto'}});});
for(let i=0;i<60;i++){const st=await pg.evaluate(()=>({hum:humanTurn(),ph:S.phase,busy:S.busy,modal:!document.getElementById('modal').hidden}));
 if(st.modal){await pg.evaluate(()=>{const b=document.querySelector('#mBtns button');b&&b.click()})}
 if(st.hum&&st.ph==='choice'&&!st.busy){await pg.evaluate(()=>takeChoice(cur(),'coin'));}
 if(st.hum&&st.ph==='action'&&!st.busy&&!st.modal)break;await pg.waitForTimeout(300)}
await pg.waitForTimeout(800);
await pg.screenshot({path:process.argv[4]||'arena_now.png',fullPage:true});
console.log('ERRS',errs.slice(0,5));await b.close()})();

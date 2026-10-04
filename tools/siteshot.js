/* siteshot.js — the advert shot for flaviusrule.com/play.html, retaken every release (tools/release.sh → share/arena_shot.webp;
   the game zip ships it as play/arena_shot.webp and flavius.sh game uploads it).
   node tools/siteshot.js <page> <out.png>   (release.sh converts it to a 1200-wide webp) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1600,height:917}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{localStorage.setItem('flavius_firstrun','shown')});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2000);
await pg.evaluate(()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');SPEED='fast';
  const seats=['royalty','soldier','amazonia','hero'].map((cls,i)=>({cls,cpu:true,diff:'normal'}));seats.forEach(s=>s.pers=finalPers(s));
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:'auto'}})});
/* let the CPUs play a few turns so the sand has beasts, blood and gear on it */
const t0=Date.now();let turns=0;
while(Date.now()-t0<60000){const st=await pg.evaluate(()=>({t:S.turnNo|0,ph:S.phase,busy:S.busy,modal:!!CUR_MODAL,over:!!S.over}));
  if(st.over)break;if(st.modal)await pg.evaluate(()=>{const b=document.querySelector('#mBtns button');b&&b.click()});
  if(st.t>=7&&st.ph==='action'&&!st.modal)break;await pg.waitForTimeout(250)}
await pg.evaluate(()=>{SPEED='slow';for(const id of ['cardShow','bubbles','wbubs'])document.getElementById(id)&&(document.getElementById(id).innerHTML='')});
for(let i=0;i<30;i++){if(await pg.evaluate(()=>!FX.length&&!FXL.length&&!CUR_MODAL))break;await pg.waitForTimeout(200)}
await pg.evaluate(()=>{FX.length=0;FXL.length=0;draw()});await pg.waitForTimeout(300);
await pg.screenshot({path:process.argv[3]||'arena_shot.png'});
console.log('SHOT',process.argv[3],'ERRS',errs.slice(0,3));await b.close()})();

/* arena_lib.js — shared Playwright setup for the arena look test (look100, prefix arena_). Pictures only. */
const {chromium}=require('playwright');const path=require('path');
const PAGE=path.resolve(__dirname,'../../../flavius-arena.html');
async function open(o={}){const b=o.browser||await chromium.launch();
  const ctxo=o.phone?{viewport:{width:844,height:390},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}};
  const pg=await b.newPage(ctxo);await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+PAGE);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  return {b,pg,errs}}
/* start an all-CPU event at a location and let it run a few turns, then pause */
async function startAt(pg,loc,turns=5){
  await pg.evaluate(loc=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');SPEED='fast';
    const seats=['royalty','soldier','amazonia','hero'].map(cls=>({cls,cpu:true,diff:'normal'}));seats.forEach(s=>s.pers=finalPers(s));
    startEvent({ev:'democritus',loc,seats,opts:{...CFG.opts,spect:'auto'}})},loc);
  const t0=Date.now();
  while(Date.now()-t0<60000){const st=await pg.evaluate(()=>({t:S.turnNo|0,ph:S.phase,modal:!!CUR_MODAL,over:!!S.over}));
    if(st.over)break;if(st.modal)await pg.evaluate(()=>{const b=document.querySelector('#mBtns button');b&&b.click()});
    if(st.t>=turns&&st.ph==='action'&&!st.modal)break;await pg.waitForTimeout(250)}
  await pg.evaluate(()=>{SPEED='pause';for(const id of ['cardShow','bubbles','wbubs'])document.getElementById(id)&&(document.getElementById(id).innerHTML='')});
  for(let i=0;i<30;i++){if(await pg.evaluate(()=>!FX.length&&!FXL.length&&!CUR_MODAL))break;await pg.waitForTimeout(200)}
  await pg.evaluate(()=>{FX.length=0;FXL.length=0;draw()});await pg.waitForTimeout(300)}
async function zoom(pg,z){await pg.evaluate(z=>{CAM.z=z>1?z:null;S.zoomIn=z>1;CAM.fr=null;draw();draw()},z);await pg.waitForTimeout(250);await pg.evaluate(()=>{draw()})}
async function canvasShot(pg,file,clip){const r=await pg.evaluate(()=>{const b=cv.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}});
  await pg.screenshot({path:file,clip:clip||r});return r}
module.exports={open,startAt,zoom,canvasShot,PAGE};

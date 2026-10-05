/* v0.89 166-v89fix: a window opened straight from the boot (like Online after the sign-in return) closes back to the main menu,
   never onto the unplayed background arena; a finished event keeps its board. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};
  menuHide();MM.fromMenu=false;r.bgPhase=S&&S.phase;
  const p=modal('Test','<p>x</p>',[{label:'Close',value:'c'}]);await W8(300);CUR_MODAL.done('c');await p;await W8(900);
  r.menuBack=!document.getElementById('mainMenu').hidden;
  /* a played event that ended keeps its board */
  menuHide();startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:true},{cls:'soldier',cpu:true}],opts:{spect:0}});await W8(800);while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}
  S.over=true;MM.fromMenu=false;const p2=modal('Test2','<p>y</p>',[{label:'Close',value:'c'}]);await W8(300);CUR_MODAL.done('c');await p2;await W8(900);
  r.boardKept=document.getElementById('mainMenu').hidden;
  /* a draft started from the menu never drops back to the menu while the CPUs pick (the 72-v59 launch watchdog fired after 15 s) */
  menuShow();SPEED='slow';MM.launchedAt=0;
  mmLaunch(()=>startEvent({ev:'naumachia',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}}),'x');
  let menuSeen=false;await W8(1500);for(let i=0;i<120;i++){await W8(250);if(!document.getElementById('mainMenu').hidden)menuSeen=true;
    if(CUR_MODAL){const t=(document.getElementById('mTitle')||{}).textContent||'';const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');
      if(lit&&/Draft/.test(t))lit.click();else{const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];const bb=bs.find(x=>/To the sand|Got it|Begin|Start/.test(x.textContent))||bs[0];if(bb)bb.click()}}
    if(S&&S.phase!=='setup')break}
  r.draftNoMenu=!menuSeen;r.started=S.phase;return r});
const m=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(200)}
  menuHide();openSetup(true);await W8(1500);const chip=document.querySelector('#mBody [data-mind76]');if(!chip)return {none:true};const i=+chip.dataset.mind76;
  const keep=document.querySelector('#mBody .pn75 img');const d0=CFG.seats[i].diff,t0=chip.textContent;chip.click();await W8(400);
  return {changed:CFG.seats[i].diff!==d0,label:chip.isConnected&&chip.textContent!==t0,noRedraw:!!keep&&keep.isConnected}});
o.mind=m;const miss=[];if(!m.changed||!m.label||!m.noRedraw)miss.push('mind chip without a redraw '+JSON.stringify(m));if(!o.menuBack)miss.push('menu after a boot window');if(!o.boardKept)miss.push('finished board kept');if(!o.draftNoMenu)miss.push('menu during the draft');
console.log(JSON.stringify({o,miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

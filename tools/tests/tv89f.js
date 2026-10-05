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
  r.boardKept=document.getElementById('mainMenu').hidden;return r});
const miss=[];if(!o.menuBack)miss.push('menu after a boot window');if(!o.boardKept)miss.push('finished board kept');
console.log(JSON.stringify({o,miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

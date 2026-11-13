/* WebKit probe (2026-11-13, tv106d 5a on webkit.yml): which events does ONE touch tap on the board canvas deliver, and how many clicks?
   Run on GitHub: webkit.yml dispatch, tests = "../ci/wkprobe". Prints the sequence and exits 1 on purpose (the job then shows 40 lines). */
const {chromium}=require('../tests/_browser');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900},hasTouch:true});const pg=await c.newPage();
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
const info=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true}],opts:{spect:0}});await W8(1500);SPEED='pause';
  window.__ev=[];const t0=performance.now();for(const t of ['touchstart','touchend','pointerdown','pointerup','mousedown','mouseup','click','dblclick'])
    window.addEventListener(t,e=>{window.__ev.push([t,Math.round(performance.now()-t0),e.pointerType===undefined?'-':(e.pointerType||'""'),e.constructor.name,e.target&&(e.target.id||e.target.tagName),e.isTrusted?1:0,e.detail].join(' '))},true);
  const r=cv.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,ua:navigator.userAgent.slice(-40),mtp:navigator.maxTouchPoints,ots:'ontouchstart' in window,pe:!!window.PointerEvent}});
console.log('INFO',JSON.stringify(info));
for(let i=0;i<2;i++){await pg.evaluate(()=>{window.__ev.push('--- tap')});await pg.touchscreen.tap(info.x,info.y);await pg.waitForTimeout(900)}
const ev=await pg.evaluate(()=>window.__ev);for(const l of ev)console.log(l);
console.log('CLICKS per tap',ev.filter(l=>/^click /.test(l)).length/2);await b.close();process.exit(1)})();

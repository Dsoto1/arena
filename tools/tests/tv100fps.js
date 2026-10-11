/* tv100fps — v1.0 frame meter (288-v100fps): off by default (no rAF loop, no element), the Settings switch turns it on,
   numbers are sane, click expands, a hidden tab stops the loop, off again stops it. Screenshots: tools/plans/fps100/. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const mk=async(w,h)=>{const pg=await b.newPage({viewport:{width:w,height:h}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(w+':'+String(e)));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');
    window.__raf=0;const r=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>{if(cb&&cb.name==='fps100Tick')window.__raf++;return r(cb)}});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});return pg};
const fs=require('fs');const dir=require('path').join(__dirname,'..','plans','fps100');fs.mkdirSync(dir,{recursive:true});
for(const [w,h] of [[1440,900],[390,780]]){
  const pg=await mk(w,h);const W8=ms=>pg.waitForTimeout(ms);
  const a=await pg.evaluate(async()=>{await new Promise(r=>setTimeout(r,800));return {def:!SETTINGS.fps100,el:!!document.getElementById('fps100'),raf:window.__raf,on:F100.on}});
  ok(a.def&&!a.el&&a.raf===0&&!a.on,w+' off by default '+JSON.stringify(a));
  /* the Settings switch */
  const s=await pg.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W(100)}
    openSettings();await W(700);const i=document.querySelector('#setBody input[data-set="fps100"]');const o={has:!!i,tip:!!(i&&i.dataset.tip)};
    if(i){i.click();await W(1500)}o.on=!!SETTINGS.fps100;o.el=!!document.getElementById('fps100');o.raf=window.__raf;return o});
  ok(s.has&&s.tip&&s.on&&s.el&&s.raf>0,w+' switch on '+JSON.stringify(s));
  await pg.evaluate(async()=>{while(CUR_MODAL){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,100))}});await W8(1500);
  const v=await pg.evaluate(()=>{const e=document.getElementById('fps100');const r=e.getBoundingClientRect();const st=F100.stat||{};return {fps:+e.querySelector('.fv').textContent,worst:st.worst,n:st.n,txt:e.querySelector('.f2').textContent,
    inView:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,cx:(r.left+r.right)/2/innerWidth,w:r.width}});
  ok(v.fps>=1&&v.fps<=250&&v.n>5&&v.worst>0&&v.worst<2000&&v.inView,w+' numbers '+JSON.stringify(v));
  ok(v.cx<0.35||v.cx>0.65,w+' not in the centre');
  const c1=await pg.evaluate(()=>{const e=document.getElementById('fps100');e.click();return !e.querySelector('.f3').hidden});
  ok(c1,w+' expands');await pg.screenshot({path:dir+'/meter_'+w+'.png'});
  /* hidden tab stops the loop */
  const h1=await pg.evaluate(async()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));await new Promise(r=>setTimeout(r,300));
    const n=window.__raf;await new Promise(r=>setTimeout(r,500));const stopped=window.__raf===n&&!F100.raf;delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));await new Promise(r=>setTimeout(r,500));return {stopped,back:window.__raf>n}});
  ok(h1.stopped&&h1.back,w+' hidden pause '+JSON.stringify(h1));
  /* off again */
  const off=await pg.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.fps100=false;applySettings();await W(300);const n=window.__raf;await W(500);
    return {el:!!document.getElementById('fps100'),raf:F100.raf,frozen:window.__raf===n,on:F100.on}});
  ok(!off.el&&!off.raf&&off.frozen&&!off.on,w+' off again '+JSON.stringify(off));
  await pg.close()}
const bad=errs.filter(e=>!/ResizeObserver/.test(e));
console.log(miss.length||bad.length?'FAIL '+JSON.stringify(miss):'OK');console.log('ERRS',JSON.stringify(bad));await b.close();process.exit(miss.length||bad.length?1:0)})();

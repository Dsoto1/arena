/* v1.15c WHEEL ZOOM (433-v115czoom): wheel over #cv zooms ~10% a notch (1..2.4), down returns to null + S.zoomIn false; the page never scrolls
   over the sand; ctrl+wheel zooms and the page scale stays 1; a wheel over the side panel / log does not zoom; a modal open = no zoom;
   kill switch flavius_v115czoomoff=1 = nothing; frame cost while wheel-zooming is close to the same zoom set directly (pinch path). ERRS []. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const open=async(ls)=>{const cx=await b.newContext({viewport:{width:1440,height:900}});const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  await pg.goto(await require(path.join(__dirname,'..','perf95','serve.js'))(page));
  await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
const start=(pg,seed)=>pg.evaluate(async seed=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}menuHide()
  SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
  for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}
  SPEED='pause';await W8(300);CAM.z=null;S.zoomIn=false;return !!S},seed);
const st=pg=>pg.evaluate(()=>({z:CAM.z,zi:S.zoomIn,sy:scrollY,vs:window.visualViewport?window.visualViewport.scale:1}));
const fr=pg=>pg.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const hover=async pg=>{const bx=await pg.evaluate(()=>{const r=cv.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+Math.min(r.height/2,300)}});await pg.mouse.move(bx.x,bx.y)};

const pg=await open();ok(await start(pg,7),'0 started');await hover(pg);
await pg.evaluate(()=>window.scrollTo(0,0));
await pg.mouse.wheel(0,-100);await fr(pg);let s=await st(pg);
ok(s.z&&Math.abs(s.z-1.1)<0.02&&s.zi===true,'1 one notch up = x1.1 '+JSON.stringify(s));
await pg.mouse.wheel(0,-100);await fr(pg);s=await st(pg);ok(s.z&&Math.abs(s.z-1.21)<0.03,'2 two notches = x1.21 '+JSON.stringify(s));
for(let i=0;i<14;i++){await pg.mouse.wheel(0,-100);await fr(pg)}s=await st(pg);ok(s.z&&Math.abs(s.z-2.4)<0.001,'3 caps at 2.4 '+JSON.stringify(s));
ok(s.sy===0,'4 page did not scroll '+s.sy);
await pg.evaluate(()=>{CAM.z=null;S.zoomIn=false});await fr(pg);
for(let i=0;i<10;i++)await pg.mouse.wheel(0,-10);await fr(pg);s=await st(pg);ok(s.z&&Math.abs(s.z-1.1)<0.02,'5 ten small events = one notch '+JSON.stringify(s));
for(let i=0;i<12;i++){await pg.mouse.wheel(0,100);await fr(pg)}s=await st(pg);ok(s.z==null&&s.zi===false,'6 wheel down returns to 1 (null, zoomIn false) '+JSON.stringify(s));
await pg.keyboard.down('Control');await pg.mouse.wheel(0,-100);await pg.keyboard.up('Control');await fr(pg);s=await st(pg);
ok(s.z&&s.z>1.05&&s.vs===1,'7 ctrl+wheel zooms the board, page scale stays 1 '+JSON.stringify(s));
await pg.evaluate(()=>{CAM.z=null;S.zoomIn=false});
const side=await pg.evaluate(()=>{const e=document.querySelector('aside.side');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:Math.min(r.top+40,innerHeight-20)}});
if(side){await pg.mouse.move(side.x,side.y);await pg.mouse.wheel(0,-200);await fr(pg);s=await st(pg);ok(s.z==null,'8 wheel over the side panel does not zoom '+JSON.stringify(s))}
await hover(pg);await pg.evaluate(()=>{modal('t','<p>x</p>',[{label:'ok',value:1}])});await pg.waitForTimeout(200);
await pg.mouse.wheel(0,-100);await fr(pg);s=await st(pg);ok(s.z==null,'9 no zoom with a modal open '+JSON.stringify(s));
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(1)});await pg.waitForTimeout(200);

const perf=await pg.evaluate(async()=>{const raf=()=>new Promise(r=>requestAnimationFrame(r));const q=(a,p)=>{a=a.slice().sort((x,y)=>x-y);return +a[Math.floor((a.length-1)*p)].toFixed(1)};
  const run=async mode=>{CAM.z=null;S.zoomIn=false;await raf();const t=[];let last=performance.now();
    for(let i=0;i<14;i++){if(mode==='wheel')cv.dispatchEvent(new WheelEvent('wheel',{deltaY:-100,bubbles:true,cancelable:true}));else{CAM.z=Math.min(2.4,(CAM.z||1)*1.1);S.zoomIn=true;draw()}
      await raf();const n=performance.now();t.push(n-last);last=n}
    for(let i=0;i<14;i++){if(mode==='wheel')cv.dispatchEvent(new WheelEvent('wheel',{deltaY:100,bubbles:true,cancelable:true}));else{CAM.z=(CAM.z||1)/1.1;if(CAM.z<1.03)CAM.z=null;S.zoomIn=!!CAM.z;draw()}
      await raf();const n=performance.now();t.push(n-last);last=n}return t};
  const a=await run('pinch'),w=await run('wheel'),a2=await run('pinch'),w2=await run('wheel');
  return {pinch:q(a.concat(a2),.95),wheel:q(w.concat(w2),.95),pm:q(a.concat(a2),.5),wm:q(w.concat(w2),.5)}});
ok(perf.wheel<=perf.pinch+16,'10 wheel frame p95 within +16 ms of the pinch path '+JSON.stringify(perf));

const k=await open({flavius_v115czoomoff:'1'});ok(await start(k,7),'11 started (off)');await hover(k);await k.mouse.wheel(0,-100);await fr(k);s=await st(k);ok(s.z==null,'12 kill switch: no zoom '+JSON.stringify(s));

console.log('PERF',JSON.stringify(perf));console.log('ERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));await b.close();process.exit(errs.length||miss.length?1:0)})();

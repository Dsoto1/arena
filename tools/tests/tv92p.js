/* v0.92 204-v92perf soak: the UI sweeps run from one heartbeat, idle mode pauses the endless CSS animations and slows the sweeps,
   a clean return drops stale board effects; compressed "hours" (thousands of heartbeats with every sweep due) on a paused all-CPU
   match, the main menu and an idle Manager must not grow the heap, the DOM or the task table. Idle busy time (CDP TaskDuration over
   10 s) is compared with the same scene on a page where the pass is off (localStorage flavius_perf92off=1). */
const {chromium}=require('playwright');
const PAGE=process.argv[2];
async function open(b,off){const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(off=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(off)localStorage.setItem('flavius_perf92off','1')},off);
  await pg.goto('file://'+PAGE);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  const cdp=await pg.context().newCDPSession(pg);await cdp.send('Performance.enable');return {pg,cdp,errs}}
const metric=(m,k)=>m.find(x=>x.name===k).value;
async function busy(P,ms){const m0=(await P.cdp.send('Performance.getMetrics')).metrics;await P.pg.waitForTimeout(ms);const m1=(await P.cdp.send('Performance.getMetrics')).metrics;
  return Math.round((metric(m1,'TaskDuration')-metric(m0,'TaskDuration'))*1000/(ms/1000))}
async function heap(P){await P.cdp.send('HeapProfiler.collectGarbage');const m=(await P.cdp.send('Performance.getMetrics')).metrics;return metric(m,'JSHeapUsedSize')}
/* a paused all-CPU match on the sand */
const MATCH=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SPEED='fast';startEvent({ev:'democritus',loc:6,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
  for(let i=0;i<120;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8)break}
  SPEED='pause';await W8(1500);return S.phase};
(async()=>{const b=await chromium.launch();const out={},miss=[];
  /* --- baseline: the pass off --- */
  const B=await open(b,true);out.offPatched=await B.pg.evaluate(()=>PERF92.off&&PERF92.tasks.length===0);
  await B.pg.evaluate(MATCH);await B.pg.waitForTimeout(3000);out.offBusy=await busy(B,10000);const errsB=B.errs;await B.pg.close();
  /* --- the pass on --- */
  const P=await open(b,false);const {pg}=P;
  out.tasks0=await pg.evaluate(()=>PERF92.tasks.length);if(out.tasks0<20)miss.push('sweeps not managed: '+out.tasks0);
  out.phase=await pg.evaluate(MATCH);await pg.waitForTimeout(3000);
  out.activeBusy=await busy(P,10000);
  /* v0.93 the layer manager (219-v93layers): per-layer draw times on the paused match (printed; the run must be in order) */
  out.layers93=await pg.evaluate(()=>{if(typeof LAYERS93==='undefined')return null;LAYERS93.reset();const t0=performance.now();for(let i=0;i<30;i++)draw();const R=LAYERS93.report();
    return {on:R.on,frames:R.frames,orderErr:R.orderErr,unknown:R.unknown,drawMs:+((performance.now()-t0)/30).toFixed(2),rows:R.rows.map(x=>x.cached?`${x.name} ${x.hits}/${x.misses} paint ${x.paintMs} blit ${x.blitMs}`:`${x.name} ${x.avg} (max ${x.max})`)}});
  if(out.layers93){const L=out.layers93;console.log('layers93 ms/frame '+L.drawMs+' — '+L.rows.join(' · '));if(!(L.on&&L.frames>=30))miss.push('layer manager did not run '+JSON.stringify(L));if(L.orderErr||L.unknown)miss.push('layers out of order '+L.orderErr+'/'+L.unknown)}
  await pg.evaluate(()=>{PERF92.lastInput=PERF92.lastAct=performance.now()-PERF92_IDLE_MS-5000;perf92Beat(true)});await pg.waitForTimeout(1500);
  out.idle=await pg.evaluate(()=>PERF92.idle&&document.body.classList.contains('idle92'));if(!out.idle)miss.push('idle mode did not start');
  out.idleBusy=await busy(P,10000);
  out.stillIdle=await pg.evaluate(()=>PERF92.idle);if(!out.stillIdle)miss.push('idle mode woke without input');
  out.runningAnims=await pg.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);
  /* wake on input */
  await pg.mouse.move(400,300);await pg.mouse.move(420,320);await pg.waitForTimeout(300);out.woke=await pg.evaluate(()=>!PERF92.idle&&!document.body.classList.contains('idle92'));if(!out.woke)miss.push('input did not wake');
  /* clean return: stale effects dropped, one redraw, every sweep once */
  out.ret=await pg.evaluate(()=>{FX.push({r:3,c:3,text:'old',color:'#fff',t0:performance.now()-60000,dur:1500});const r0=PERF92.returns,runs0=PERF92.runs;
    document.dispatchEvent(new Event('visibilitychange'));return {ret:PERF92.returns-r0,stale:FX.some(f=>f.text==='old'),swept:PERF92.runs-runs0>=PERF92.tasks.length}});
  if(!out.ret.ret||out.ret.stale||!out.ret.swept)miss.push('clean return '+JSON.stringify(out.ret));
  /* compressed hours: 3 scenes × 3600 heartbeats with every sweep due (= an hour each at the idle rate) */
  const soak=async label=>{await pg.evaluate(()=>{try{if(S&&S.phase!=='setup')render()}catch(e){}}); /* v0.96: settle the scene first (the 233 bar has more nodes than the old dock, so the first render after S.over shrank the DOM by ~70) */const h0=await heap(P);const n0=await pg.evaluate(()=>document.getElementsByTagName('*').length);const t0=await pg.evaluate(()=>PERF92.tasks.length);
    await pg.evaluate(async()=>{for(let i=0;i<3600;i++){for(const t of PERF92.tasks)t.last=-1e9;if(i%2)PERF92.seq++;perf92Beat(true);if(i%300===0){try{if(S&&S.phase!=='setup')render()}catch(e){}await new Promise(r=>setTimeout(r,0))}}});
    const h1=await heap(P);const n1=await pg.evaluate(()=>document.getElementsByTagName('*').length);const t1=await pg.evaluate(()=>PERF92.tasks.length);
    const r={heapMB:+((h1-h0)/1e6).toFixed(2),nodes:n1-n0,tasks:t1-t0};out['soak_'+label]=r;
    if(r.heapMB>4)miss.push(label+' heap grew '+r.heapMB+' MB');if(Math.abs(r.nodes)>30)miss.push(label+' DOM grew '+r.nodes);if(r.tasks>0)miss.push(label+' tasks grew '+r.tasks)};
  await soak('match');
  await pg.evaluate(async()=>{S.over=true;menuShow();await new Promise(r=>setTimeout(r,800))});await soak('menu');
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));menuHide();openManager();for(let i=0;i<50&&typeof MGR_REDRAW!=='function';i++)await W8(200);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(1000)});
  out.mgrRail=await pg.evaluate(()=>!!document.querySelector('.mtabs .mcount.c73'));if(!out.mgrRail)miss.push('Manager rail ovals missing');
  await soak('manager');
  /* idle numbers: idle mode must be clearly lighter than the same scene without the pass */
  if(!(out.idleBusy<out.offBusy*0.5))miss.push(`idle busy ${out.idleBusy} ms/s not clearly below the unmanaged ${out.offBusy} ms/s`);
  console.log(`busy ms/s — unmanaged ${out.offBusy} · managed active ${out.activeBusy} · managed idle ${out.idleBusy}`);
  console.log(JSON.stringify({out,miss}));const errs=[...errsB,...P.errs];console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

/* tools/bench/gpu107.js — v1.07 beta 3 (tools/plans/v107/PERF.md "beta 3: CPU Fast on a GPU canvas"): WHERE THE GPU TIME GOES.
   Chromium runs with its GPU path on SwiftShader (accelerated 2D canvas + GPU raster, real scrollbars). The all-CPU match (Democritus at
   Pompeii, seed 4242, 8 CPU seats) is set up and PAUSED; then the board is redrawn once every animation frame (the raw draw, no coalescing)
   for --secs seconds per variant, and we read: fps, the GPU process's thread time per drawn frame (trace RunTask on CrGpuMain / Viz threads),
   and the main thread's wait on GPU back-pressure. Variants (--only a,b,…; default all): none · each draw layer off (LAYERS93.debugOff) ·
   lightoff / lightlight (399 Lighting) · idle (nothing drawn: the page's own cost) · render (render() a frame instead of draw()).
     node tools/bench/gpu107.js <page> [--secs 3] [--z 1] [--dpr 1] [--plain] [--ls k=v,…] [--only none,pieces]
   --plain = no GPU flags (the CPU raster), for comparison. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]||'flavius-arena.html');
const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};const flag=k=>A.includes('--'+k);
const SECS=+opt('secs',3),Z=+opt('z',1),DPR=+opt('dpr',1),ONLY=String(opt('only','')).split(',').filter(Boolean);
const LS={flavius_light106auto:'0',flavius_light106:'full'};for(const kv of String(opt('ls','')).split(',').filter(Boolean)){const i=kv.indexOf('=');LS[kv.slice(0,i)]=kv.slice(i+1)}
const GPU=['--use-gl=angle','--use-angle=swiftshader','--enable-gpu-rasterization','--ignore-gpu-blocklist','--enable-accelerated-2d-canvas','--enable-unsafe-swiftshader'];
const LAY=['rim','stands','tiles','walls','floor','decals','highlights','pieces','overlays','crowdtop','flavius','fx','under','deco','top','light','sky','wear'];
/* CPU seconds burnt by Chromium's processes by type (utime+stime from /proc; SwiftShader rasterises on the GPU process's own worker threads) */
const procCPU=()=>{const o={gpu:0,renderer:0,browser:0,other:0};for(const d of fs.readdirSync('/proc')){if(!/^\d+$/.test(d))continue;let cl='';try{cl=fs.readFileSync('/proc/'+d+'/cmdline','utf8')}catch(e){continue}
  if(!/chrom|headless_shell/i.test(cl))continue;let st;try{st=fs.readFileSync('/proc/'+d+'/stat','utf8')}catch(e){continue}const f=st.slice(st.lastIndexOf(')')+2).split(' ');const t=(+f[11]+ +f[12])*10;
  const k=/--type=gpu-process/.test(cl)?'gpu':/--type=renderer/.test(cl)?'renderer':/--type=/.test(cl)?'other':'browser';o[k]+=t}return o};
const VARS=['idle','none','render','rendernodraw','drawx2','nopots',...LAY,'lightoff','lightlight'].filter(v=>!ONLY.length||ONLY.includes(v));
(async()=>{const serve=require(path.join(__dirname,'..','perf95','serve.js'));const url=await serve(PAGE);
  const b=await chromium.launch(flag('plain')?{}:{args:GPU,ignoreDefaultArgs:['--hide-scrollbars']});
  const cx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:DPR});await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in ls)localStorage.setItem(k,ls[k])},LS);
  const pg=await cx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.goto(url,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
  await pg.evaluate(async z=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
    while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
    const cls=['soldier','hero','royalty','venatore','amazonia','veteranus','slave','damnatio'];
    startEvent({ev:'democritus',loc:6,seed:4242,seats:cls.map(c=>({cls:c,cpu:true})),opts:{}});SPEED='normal';
    for(let i=0;i<200;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6)break}
    if(z>=1.9){CAM.z=z;S.zoomIn=true}else if(z>1)S.zoomIn=true;
    await W8(4000);SPEED='pause';setInterval(close,300);await W8(1500)},Z);
  if(opt('css',''))await pg.addStyleTag({content:opt('css','')});
  if(opt('nohas','')){const n=await pg.evaluate(re=>{re=new RegExp(re);let n=0;const walk=list=>{for(let i=list.length-1;i>=0;i--){const r=list[i];if(r.cssRules&&!r.selectorText)walk(r.cssRules);else if(r.selectorText&&r.selectorText.includes(':has(')&&re.test(r.selectorText)){try{(r.parentRule||r.parentStyleSheet).deleteRule(i);n++}catch(e){}}}};
    for(const sh of document.styleSheets){try{walk(sh.cssRules)}catch(e){}}return n},opt('nohas',''));console.log('removed :has rules',n)}
  const rows=[];
  for(const v of VARS){
    await pg.evaluate(v=>{const L=window.G107||(window.G107={});L.v=v;
      if(v==='lightoff'){L.ov=L106.ov;L106.ov='off'}else if(v==='lightlight'){L.ov=L106.ov;L106.ov='light'}else if(!['none','idle','render','rendernodraw','drawx2','nopots'].includes(v))LAYERS93.debugOff(v,true)},v);
    await pg.waitForTimeout(400);
    const TF=path.join(os.tmpdir(),'gpu107-'+process.pid+'.json');await b.startTracing(pg,{path:TF,categories:['devtools.timeline','disabled-by-default-devtools.timeline','gpu','cc'].concat(flag('paints')?['disabled-by-default-devtools.timeline.invalidationTracking']:[])});
    let cdp=null;if(flag('profile')){cdp=await cx.newCDPSession(pg);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:250});await cdp.send('Profiler.start')}
    const pc0=procCPU();
    await pg.evaluate(secs=>new Promise(res=>{const L=window.G107;L.n=0;L.fr=[];const t0=performance.now();let last=t0;
      const tick=t=>{L.fr.push(t-last);last=t;if(L.v==='render')render();else if(L.v==='rendernodraw'){const d=draw;draw=()=>{};try{render()}finally{draw=d}}else if(L.v==='nopots'){const d=drawPot;drawPot=function(){};try{(typeof PACE96!=='undefined'&&PACE96.base?PACE96.base:draw)()}finally{drawPot=d}}else if(L.v==='drawx2'){const f=typeof PACE96!=='undefined'&&PACE96.base?PACE96.base:draw;f();f()}else if(L.v!=='idle')(typeof PACE96!=='undefined'&&PACE96.base?PACE96.base:draw)();L.n++;
        if(performance.now()-t0<secs*1000)requestAnimationFrame(tick);else res()};requestAnimationFrame(tick)}),SECS);
    const pc1=procCPU();
    await b.stopTracing();
    if(cdp){const {profile}=await cdp.send('Profiler.stop');const byId={};profile.nodes.forEach(n=>byId[n.id]=n);const par={};profile.nodes.forEach(n=>(n.children||[]).forEach(c=>par[c]=n.id));
      const self={},inc={};const dt=profile.timeDeltas;profile.samples.forEach((id,i)=>{const cf=byId[id].callFrame;const k=(cf.functionName||'(anon)')+(cf.url?':'+(cf.lineNumber+1):'');self[k]=(self[k]||0)+(dt[i]||0);
        const seen=new Set();for(let x=id;x!=null;x=par[x]){const c2=byId[x].callFrame;if(!c2.url)continue;const kk=(c2.functionName||'(anon)')+':'+(c2.lineNumber+1);if(seen.has(kk))continue;seen.add(kk);inc[kk]=(inc[kk]||0)+(dt[i]||0)}});
      console.log('   self: '+Object.entries(self).sort((x,y)=>y[1]-x[1]).slice(0,16).map(([k,v2])=>k+' '+(v2/1000).toFixed(0)).join(' | '));
      console.log('   incl: '+Object.entries(inc).sort((x,y)=>y[1]-x[1]).slice(0,40).map(([k,v2])=>k+' '+(v2/1000).toFixed(0)).join(' | '))}
    const q=await pg.evaluate(()=>{const L=window.G107;const a=L.fr.slice(1).sort((x,y)=>x-y);const sum=L.fr.slice(1).reduce((x,y)=>x+y,0);
      if(L.v==='lightoff'||L.v==='lightlight')L106.ov=L.ov;else if(!['none','idle','render','rendernodraw','drawx2','nopots'].includes(L.v))LAYERS93.debugOff(L.v,false);
      return {n:a.length,fps:+(1000*a.length/Math.max(1,sum)).toFixed(1),p50:+(a[a.length>>1]||0).toFixed(1)}});
    const ev=JSON.parse(fs.readFileSync(TF)).traceEvents;fs.unlinkSync(TF);const tn={};for(const e of ev)if(e.ph==='M'&&e.name==='thread_name')tn[e.pid+':'+e.tid]=e.args.name;
    let gpu=0,main=0,bp=0;for(const e of ev){if(e.ph!=='X')continue;const n=tn[e.pid+':'+e.tid]||'';
      if(e.name==='RunTask'&&/CrGpuMain|VizCompositor/.test(n))gpu+=(e.tdur!=null?e.tdur:e.dur)/1000;
      if(e.name==='RunTask'&&/CrRendererMain/.test(n))main+=(e.tdur!=null?e.tdur:e.dur)/1000;
      if(/GPU backpressure|ReadbackImagePixels/.test(e.name)&&/CrRendererMain/.test(n))bp+=e.dur/1000}
    if(flag('paints')){const P={};for(const e of ev){if(e.name!=='Paint'||!e.args||!e.args.data)continue;const d=e.args.data;const c=d.clip||[];const w=c.length?Math.abs(c[2]-c[0]):0,h=c.length?Math.abs(c[5]-c[1]):0;
        const k='layer '+(d.layerId||'?')+' node '+(d.nodeId||'?')+' '+Math.round(w)+'x'+Math.round(h);const o=P[k]||(P[k]={n:0,area:0});o.n++;o.area+=w*h}
      const I={};for(const e of ev){if(!/Invalidation/.test(e.name)||!e.args||!e.args.data)continue;const d=e.args.data;const k=e.name+' '+(d.nodeName||'')+' '+(d.reason||'')+' '+(d.invalidationSet?'set':'');I[k]=(I[k]||0)+1}
      console.log(Object.entries(I).sort((x,y)=>y[1]-x[1]).slice(0,25).map(([k,n])=>'   INV '+n+'x '+k.slice(0,200)).join('\n'));console.log(Object.entries(P).sort((x,y)=>y[1].area-x[1].area).slice(0,12).map(([k,v2])=>'   PAINT '+v2.n+'x '+k).join('\n'))}
    if(flag('self')){const mainEv=ev.filter(e=>e.ph==='X'&&e.dur&&/CrRendererMain/.test(tn[e.pid+':'+e.tid]||'')).sort((a,b)=>a.ts-b.ts||b.dur-a.dur);const st=[];const self={};
      for(const e of mainEv){while(st.length&&st[st.length-1].ts+st[st.length-1].dur<=e.ts)st.pop();if(st.length){const p=st[st.length-1];p._c=(p._c||0)+e.dur}e._chain=st.map(x=>x.name+(x.args&&x.args.data&&x.args.data.functionName?'['+x.args.data.functionName+':'+x.args.data.lineNumber+']':'')).slice(-3).join('>');st.push(e)}
      for(const e of mainEv){const v2=(e.dur-(e._c||0))/1000;if(v2>0){const k=e.name+(e.args&&e.args.data&&e.args.data.functionName?' '+e.args.data.functionName+':'+e.args.data.lineNumber:'')+'  <'+e._chain;self[k]=(self[k]||0)+v2}}
      console.log(Object.entries(self).sort((x,y)=>y[1]-x[1]).slice(0,14).map(([k,v2])=>'   self '+v2.toFixed(0).padStart(6)+'ms '+k.slice(0,260)).join('\n'))}
    {const R={};for(const e of ev){if(e.ph!=='X'||!/^(RasterTask|TileManager::RasterTask|RasterDecoderImpl::DoRasterCHROMIUM|RasterDecoderImpl::DoEndRasterCHROMIUM|ProduceCanvasResource|PaintLayerCompositor|Paint)$/.test(e.name))continue;const k=e.name+' @'+(tn[e.pid+':'+e.tid]||'?').replace(/\d+$/,'');const o=R[k]||(R[k]={n:0,ms:0});o.n++;o.ms+=e.dur/1000}
      if(flag('raster'))console.log(Object.entries(R).sort((x,y)=>y[1].ms-x[1].ms).slice(0,8).map(([k,o])=>'   RASTER '+(o.ms/Math.max(1,q.n)).toFixed(1)+'ms/frame '+(o.n/Math.max(1,q.n)).toFixed(1)+'x/frame '+k).join('\n'))}
    const r={v,fps:q.fps,p50:q.p50,gpuProcMs:Math.round((pc1.gpu-pc0.gpu)/Math.max(1,q.n)),rendProcMs:Math.round((pc1.renderer-pc0.renderer)/Math.max(1,q.n)),gpuPerFrame:+(gpu/Math.max(1,q.n)).toFixed(1),mainPerFrame:+(main/Math.max(1,q.n)).toFixed(1),waitPerFrame:+(bp/Math.max(1,q.n)).toFixed(1)};rows.push(r);
    console.log(v.padEnd(11),`fps ${String(r.fps).padStart(5)} p50 ${String(r.p50).padStart(6)} ms · GPU thread ${String(r.gpuPerFrame).padStart(6)} ms/frame · main CPU ${String(r.mainPerFrame).padStart(5)} · main waits on GPU ${r.waitPerFrame} · GPU process CPU ${r.gpuProcMs} ms/frame · renderer CPU ${r.rendProcMs} ms/frame`)}
  console.log('ERRS',JSON.stringify(errs));if(opt('json',''))fs.writeFileSync(opt('json',''),JSON.stringify(rows,null,1));await b.close();process.exit(errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});

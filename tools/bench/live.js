/* tools/bench/live.js — v1.07 WHOLE-FRAME BENCHMARK OF LIVE PLAY (tools/plans/v107/PERF.md).
   A real CPU match (Democritus at Pompeii, seed 4242, 8 CPU seats of the 8 printed classes, Normal speed, Animations On, stands +
   spectators on) is played for --secs seconds after --warm seconds; every animation frame is timed:
     frame = the requestAnimationFrame interval (the WHOLE frame: script, style/layout, paint, the board canvas, the compositor's wait)
     js    = the board paint inside that frame: the sum of the drawLayers93 calls (219: every layer of draw(); draw() itself may only schedule)
   --flush adds a 1-px getImageData after each draw (forces the canvas raster on the main thread; on this no-GPU box = the CPU raster).
   --gpu runs Chromium with its GPU paths on SwiftShader (accelerated 2D canvas + GPU raster, as on a laptop with a GPU — in software,
     so slower; it shows the GPU-path costs: read-backs, uploads). Without it: the box's CPU raster (no GPU here).
   --profile samples the main thread (CDP Profiler, 250 µs) over the measured window and prints the top self-time functions.
   Configs (--only a,b,…): desk 1440×900 @1 · hd 1440×900 @2 (devicePixelRatio 2) · phone 844×390 @2 (landscape, mobile, touch)
     × flat / z14 ("Zoom in", 1.4× — the camera follows whoever acts: pans + glides) / z2 (a pinch to 2×), plus
     desk-z14-hover (the pointer sweeps the tiles round the acting fighter, a tile every 90 ms: 07-ui hover text + redraw) and
     desk-z14-nobase / desk-z2-nobase (Settings "Show token bases" off: 321's base clean-up), desk-z14-aim / desk-z2-aim (a human soldier mid-attack, the pointer moving between two beasts and the sand: 396's ring, outline, tag).
   Lighting: desk/hd Full, phone its default (Light), auto-drop off (flavius_light106auto=0) so a run never changes mode midway.
   --speed fast|normal|slow (default normal): the CPU speed (beta 3: the all-CPU match at Fast).
     node tools/bench/live.js <page> [--secs 6] [--warm 3] [--only desk-flat,desk-z2] [--flush] [--profile] [--mem] [--ls k=v,…] [--json FILE]
   v1.08c: phone3-flat / phone3-z14 = a 390×844 phone at DPR 3; --mem = the figure pipeline's decoded picture memory (MEM below) per config.
   The machine load (/proc/loadavg) is printed before and after; other jobs may share this box — compare like for like, several runs. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]||'flavius-arena.html');
const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};const flag=k=>A.includes('--'+k);
const SECS=+opt('secs',6),WARM=+opt('warm',3),ONLY=String(opt('only','')).split(',').filter(Boolean),JSONF=opt('json',''),FLUSH=flag('flush'),PROF=flag('profile');
const LS={flavius_light106auto:'0'};for(const kv of String(opt('ls','')).split(',').filter(Boolean)){const i=kv.indexOf('=');LS[kv.slice(0,i)]=kv.slice(i+1)}
const load=()=>{const l=fs.readFileSync('/proc/loadavg','utf8').split(' ');return {l1:+l[0],cpus:os.cpus().length}};
const VIEWS={desk:{viewport:{width:1440,height:900},deviceScaleFactor:1},hd:{viewport:{width:1440,height:900},deviceScaleFactor:2},
  phone:{viewport:{width:844,height:390},deviceScaleFactor:2,isMobile:true,hasTouch:true},
  phone3:{viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true}};   /* v1.08c: a 390-px phone at DPR 3 (portrait) */
const CONFIGS=[
  {name:'desk-flat',view:'desk',z:1},{name:'desk-z14',view:'desk',z:1.4},{name:'desk-z2',view:'desk',z:2},
  {name:'desk-z14-hover',view:'desk',z:1.4,hover:1},{name:'desk-z14-aim',view:'desk',z:1.4,aim:1},{name:'desk-z2-aim',view:'desk',z:2,aim:1},
  {name:'desk-z14-nobase',view:'desk',z:1.4,nobase:1},{name:'desk-z2-nobase',view:'desk',z:2,nobase:1},
  {name:'hd-flat',view:'hd',z:1},{name:'hd-z14',view:'hd',z:1.4},{name:'hd-z2',view:'hd',z:2},
  {name:'phone-flat',view:'phone',z:1},{name:'phone-z14',view:'phone',z:1.4},{name:'phone-z2',view:'phone',z:2},
  {name:'phone3-flat',view:'phone3',z:1},{name:'phone3-z14',view:'phone3',z:1.4}];

/* ---- in-page ---- */
const START=async cfg=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
  while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;if(cfg.nobase)SETTINGS.bases101=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  const cls=['soldier','hero','royalty','venatore','amazonia','veteranus','slave','damnatio'];
  const seats=cfg.aim?[{cls:'soldier'},...['hero','royalty','venatore'].map(c=>({cls:c,cpu:true}))]:cls.map(c=>({cls:c,cpu:true}));
  startEvent({ev:'democritus',loc:6,seed:4242,seats,opts:cfg.aim?{spect:0}:{}});
  for(let i=0;i<200;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6)break}
  window.BLIVE={iv:setInterval(close,300)};
  if(cfg.aim){SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);close()}
    if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){close();await W8(150)}
    XRAY='off';const pl=[[6,4],[11,11],[12,11],[11,12]];S.players.forEach((p,i)=>{p.r=pl[i][0];p.c=pl[i][1]});
    const bs=S.npcs.filter(n=>n.alive&&!n.out&&n.t!=='zora'&&n.tamedBy==null);window.__A=bs[0];window.__B=bs[1];
    bs[0].r=6;bs[0].c=5;bs[1].r=5;bs[1].c=4;bs[0].hp=bs[1].hp=99;const away=[[0,0],[12,12],[0,1],[1,0],[12,0]];bs.slice(2).forEach((n,i)=>{n.r=away[i][0];n.c=away[i][1]});
    for(const n of S.npcs)if(n.t==='zora'){n.r=0;n.c=12}
    const p=cur();p.attacks=0;p.hitTargets=new Set();p.armUses={R:0,L:0};const src=attackSources(p)[0];S.mode='atk'+src.arm+(src.thr?'T':'');
    SPEED='normal';render()}
  else SPEED=cfg.speed||'normal';
  if(cfg.z>=1.9){CAM.z=cfg.z;S.zoomIn=true}else if(cfg.z>1)S.zoomIn=true;
  for(let i=0;i<10;i++){draw();await W8(40)}
  return {canv:[...document.querySelectorAll('canvas')].filter(c=>c.offsetParent||c.getClientRects().length).map(c=>(c.id||c.className||c.parentElement.className||'?').toString().slice(0,20)+':'+c.width+'x'+c.height),TW,dpr:devicePixelRatio,cv:[cv.width,cv.height],z:typeof duelCam==='function'?+duelCam().toFixed(2):1,light:typeof l106Mode==='function'?l106Mode():null,players:S.players.length}};
/* --probe: who calls the costly canvas APIs during the measured window (count + ms by the first page frame of the stack) */
const PROBE=()=>{const P=window.PROBE107={on:false,c:{}};const where=()=>{const L=String(new Error().stack).split('\n').slice(3).map(s=>s.trim());const f=L.find(s=>/at \S+ \(http/.test(s))||L[0]||'';return f.replace(/\(https?:\/\/[^)]*:(\d+):\d+\)/,':$1')};
  const rec=(k,ms)=>{if(!P.on)return;const w=k+' '+where();const e=P.c[w]||(P.c[w]={n:0,ms:0});e.n++;e.ms+=ms};
  const cib=window.createImageBitmap;window.createImageBitmap=function(){const t=performance.now();const r=cib.apply(this,arguments);rec('createImageBitmap',performance.now()-t);return r};
  for(const C of [CanvasRenderingContext2D,OffscreenCanvasRenderingContext2D]){const g=C.prototype.getImageData;C.prototype.getImageData=function(){const t=performance.now();const r=g.apply(this,arguments);rec(arguments[2]*arguments[3]>4?'getImageData':'getImageData(tiny)',performance.now()-t);return r}}
  const ce=document.createElement;document.createElement=function(n){if(String(n).toLowerCase()==='canvas')rec('newCanvas',0);return ce.apply(this,arguments)};
  for(const k of ['width','height']){const d=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,k);Object.defineProperty(HTMLCanvasElement.prototype,k,{get:d.get,set(v){if(this!==window.cv)rec('canvas.'+k+'=',0);d.set.call(this,v)},configurable:true})}
  const fl=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'filter');Object.defineProperty(CanvasRenderingContext2D.prototype,'filter',{get:fl.get,set(v){if(v&&v!=='none')rec('filter='+String(v).slice(0,20),0);fl.set.call(this,v)},configurable:true});
  const sb=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'shadowBlur');Object.defineProperty(CanvasRenderingContext2D.prototype,'shadowBlur',{get:sb.get,set(v){if(v>0)rec('shadowBlur',0);sb.set.call(this,v)},configurable:true})};
/* --fn a,b,…: wrap these page functions (function / let globals) with a counter + timer (inclusive ms, outermost call only) */
const FNWRAP=names=>{const F=window.FN107={on:false,c:{}};const out=[];window.__fw=(name,f)=>function(){if(!F.on)return f.apply(this,arguments);const e=F.c[name]||(F.c[name]={n:0,ms:0,d:0});
    if(e.d)return f.apply(this,arguments);e.d=1;const t=performance.now();try{return f.apply(this,arguments)}finally{e.ms+=performance.now()-t;e.n++;e.d=0}};
  for(const n of names){try{if(typeof (0,eval)(n)!=='function'){out.push(n+':none');continue}(0,eval)(n+'=window.__fw('+JSON.stringify(n)+','+n+')');out.push(n)}catch(e){out.push(n+':'+e.message.slice(0,40))}}return out};
/* --who: which callers ask for draw() during the window (the stack frame just above the outermost draw wrapper) */
const WHO=()=>{const W=window.WHO107={on:false,c:{}};const base=draw;let d=0;draw=function(){if(!W.on||d)return base.apply(this,arguments);d=1;try{const L=String(new Error().stack).split('\n').slice(2,5).map(s=>s.trim().replace(/\(https?:\/\/[^)]*:(\d+):\d+\)/,':$1').replace(/^at /,'')).join(' < ');W.c[L]=(W.c[L]||0)+1}catch(e){}try{return base.apply(this,arguments)}finally{d=0}}};
const ARM=flush=>{if(window.WHO107){window.WHO107.c={};window.WHO107.on=true}if(window.FN107){window.FN107.c={};window.FN107.on=true}const B=window.BLIVE;if(window.PROBE107){window.PROBE107.c={};window.PROBE107.on=true}B.fr=[];B.js=[];B.dn=[];B.long=[];B.cur=0;B.cnt=0;B.stop=false;
  if(!B.wrapped){B.wrapped=1;const base=drawLayers93;const g=cv.getContext('2d');drawLayers93=function(){if(B.depth)return base.apply(this,arguments);B.depth=1;const t=performance.now();
      try{return base.apply(this,arguments)}finally{if(B.flush)g.getImageData(0,0,1,1);B.cur+=performance.now()-t;B.cnt++;B.depth=0}}}
  B.flush=!!flush;
  if(!B.obs){B.obs=1;try{new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(window.BLIVE.long&&!window.BLIVE.stop)window.BLIVE.long.push(e.duration)})).observe({entryTypes:['longtask']})}catch(e){}}
  let last=performance.now();const tick=()=>{const t=performance.now();B.fr.push(t-last);B.js.push(B.cur);B.dn.push(B.cnt);B.cur=0;B.cnt=0;last=t;if(!B.stop)requestAnimationFrame(tick)};
  requestAnimationFrame(()=>{last=performance.now();B.cur=0;B.cnt=0;requestAnimationFrame(tick)});
  try{for(const k in LAYERS93.stats)delete LAYERS93.stats[k];for(const k in LAYERS93.cache)delete LAYERS93.cache[k]}catch(e){}try{B.z99=JSON.stringify(Z99.stats)}catch(e){}B.errs=[];if(!B.ce){B.ce=1;const ce=console.error;console.error=function(...a){try{if(B.errs&&B.errs.length<20)B.errs.push(a.map(x=>x&&x.stack?String(x.stack).slice(0,300):String(x)).join(' '))}catch(e){}return ce.apply(this,a)}}
  try{if(typeof L106!=='undefined'&&L106.st)for(const k in L106.st)L106.st[k]=0}catch(e){}
  if(typeof P107!=='undefined'&&P107.st)for(const k in P107.st)P107.st[k]=0;
  B.t0=performance.now();B.turn0=S.turnNo};
const READ=()=>{const B=window.BLIVE;B.stop=true;const el=(performance.now()-B.t0)/1000;
  const q=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);return s.length?+s[Math.min(s.length-1,Math.floor(p*(s.length-1)))].toFixed(2):0};
  const fr=B.fr.slice(1),js=B.js.slice(1),dn=B.dn.slice(1);
  let lay={};try{for(const k in LAYERS93.stats){const s=LAYERS93.stats[k];if(s.n)lay[k]=+s.avg.toFixed(2)}}catch(e){}
  return {fps:+(fr.length/el).toFixed(1),frame:{p50:q(fr,.5),p95:q(fr,.95),max:q(fr,1)},over25:fr.filter(x=>x>25).length,over50:fr.filter(x=>x>50).length,n:fr.length,
    js:{p50:q(js,.5),p95:q(js,.95),max:q(js,1),mean:+(js.reduce((a,b)=>a+b,0)/Math.max(1,js.length)).toFixed(2)},drawsPerFrame:+(dn.reduce((a,b)=>a+b,0)/Math.max(1,dn.length)).toFixed(2),
    long:B.long.length,longMs:Math.round(B.long.reduce((a,b)=>a+b,0)),turns:(S.turnNo|0)-(B.turn0|0),TW,z:typeof duelCam==='function'?+duelCam().toFixed(2):1,lay,
    errs:B.errs,p107:typeof P107!=='undefined'?JSON.stringify(P107.st):null,fxd:typeof B95!=='undefined'&&B95.fxCx&&B95.fxCx._p107?B95.fxCx._p107.dirty:null,who:window.WHO107?Object.entries(window.WHO107.c).sort((a,b)=>b[1]-a[1]).slice(0,14):null,fn:window.FN107?Object.entries(window.FN107.c).sort((a,b)=>b[1].ms-a[1].ms).map(([k,v])=>k+' '+v.n+'x '+v.ms.toFixed(1)+'ms'):null,cache:(()=>{try{return LAYERS93.report().rows.filter(r=>r.cached&&(r.misses||r.hits)).map(r=>r.name+' '+r.hits+'h/'+r.misses+'m paint '+r.paintMs)}catch(e){return null}})(),z99:(()=>{try{return B.z99+' → '+JSON.stringify(Z99.stats)}catch(e){return null}})(),probe:window.PROBE107?Object.entries(window.PROBE107.c).sort((a,b)=>b[1].n-a[1].n).slice(0,25).map(([k,v])=>[k,v.n,+v.ms.toFixed(1)]):null,l106:typeof L106!=='undefined'&&L106.st?{...L106.st}:null,p107:typeof P107!=='undefined'&&P107.st?{...P107.st}:null}};
/* --mem (v1.08c): decoded picture memory held by the figure pipeline (MB = px × 4 / 1e6): sheets (<img> + per-row ImageBitmaps, 311 printed +
   on-device, 312 beasts), pre-scaled cells (311 AN100CC, 312 BST100.cc), clean-ups (321 BS101 / 334 G6 / 346 B103), corpses (404), W3 copies (406),
   every <canvas> on the page, and the JS heap (performance.memory). An estimate: the browser may hold more (GPU copies) or less (discarded decodes). */
const MEM=()=>{const px=o=>{try{return o?(o.naturalWidth||o.width||0)*(o.naturalHeight||o.height||0):0}catch(e){return 0}};const mb=n=>+(n*4/1e6).toFixed(1);const out={};
  try{let sh=0,bm=0,n=0;const seen=new Set();for(const M of [AN100.src,AN100.dev])if(M)for(const [,s] of M)for(const set of ['move','act']){const o=s[set];if(!o)continue;
      for(const im of [o.img,o.whole])if(im&&!seen.has(im)){seen.add(im);sh+=px(im);n++}for(const k in (o.bm||{})){const b=o.bm[k];if(b&&b.bm&&!seen.has(b.bm)){seen.add(b.bm);bm+=px(b.bm)}}}
    out.figSheets=mb(sh);out.figRowBitmaps=mb(bm);out.figSheetN=n}catch(e){}
  try{let t=0;for(const k in BST100.img)t+=px(BST100.img[k]);out.beastSheets=mb(t)}catch(e){}
  try{let t=0;for(const [,c] of AN100CC)t+=px(c);out.figCells=mb(t);out.figCellN=AN100CC.size}catch(e){}
  try{let t=0;for(const [,e] of BST100.cc)t+=px(e&&e.c);out.beastCells=mb(t)}catch(e){}
  try{let t=0;for(const [,e] of CV107.lie)t+=px(e&&e.c);out.corpses=mb(t)}catch(e){}
  try{let t=0;for(const [,c] of G6.cache)t+=px(c&&c.c||c);for(const [,c] of B103.cache)t+=px(c&&c.c||c);out.beastClean=mb(t)}catch(e){}
  try{let t=0;for(const c of W3.live){const R=W3.rec.get(c);if(R&&R.bm)t+=px(R.bm)}out.w3Bitmaps=mb(t)}catch(e){}
  try{let t=0;for(const c of document.querySelectorAll('canvas'))t+=px(c);out.pageCanvases=mb(t)}catch(e){}
  out.heapMB=performance.memory?Math.round(performance.memory.usedJSHeapSize/1e6):null;out.x2=typeof X108!=='undefined'?{on:X108.on,why:X108.why}:null;return out};
/* the pointer's targets: tiles round the acting fighter (hover), or the two beasts' bodies and an empty tile (aim) */
const POINTS=aim=>{const R=cv.getBoundingClientRect();const out=[];
  if(aim){for(const n of [window.__A,window.__B]){if(!n)continue;const m=center(n.r,n.c);out.push({x:R.left+m.x,y:R.top+m.y-TH*0.6})}const e=center(8,8);out.push({x:R.left+e.x,y:R.top+e.y});return out}
  const p=cur();if(!p||p.r==null)return out;for(const [dr,dc] of [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,-1],[2,0],[0,2]]){const r=p.r+dr,c=p.c+dc;if(r<0||c<0||r>=N||c>=N)continue;const m=center(r,c);out.push({x:R.left+m.x,y:R.top+m.y})}return out};

(async()=>{const serve=require(path.join(__dirname,'..','perf95','serve.js'));const url=await serve(PAGE);const b=await chromium.launch(flag('gpu')?{args:['--use-gl=angle','--use-angle=swiftshader','--enable-gpu-rasterization','--ignore-gpu-blocklist','--enable-accelerated-2d-canvas','--enable-unsafe-swiftshader'],ignoreDefaultArgs:['--hide-scrollbars']}:{});
  const res={page:path.basename(PAGE),ls:LS,secs:SECS,warm:WARM,flush:FLUSH,load0:load(),at:new Date().toISOString(),runs:[]};const errs=[];
  console.log('load before',JSON.stringify(res.load0),FLUSH?'FLUSH':'');
  for(const cfg of CONFIGS){if(ONLY.length&&!ONLY.includes(cfg.name))continue;
    const ls={...LS};if(!cfg.view.startsWith('phone')&&!ls.flavius_light106)ls.flavius_light106='full';
    const cx=await b.newContext(VIEWS[cfg.view]);await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
    await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in ls)localStorage.setItem(k,ls[k])},ls);
    const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(cfg.name+': '+e.message));await pg.goto(url,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
    if(flag('probe'))await pg.evaluate(PROBE);const st=await pg.evaluate(START,{...cfg,speed:opt('speed','normal')});if(flag('who'))await pg.evaluate(WHO);if(opt('fn',''))console.log('   wrapped',JSON.stringify(await pg.evaluate(FNWRAP,String(opt('fn','')).split(','))));await pg.waitForTimeout(WARM*1000);
    let cdp=null;if(PROF){cdp=await cx.newCDPSession(pg);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:250});await cdp.send('Profiler.start')}
    const CPUF=flag('cpu')&&!flag('trace')?path.join(os.tmpdir(),'live107c-'+process.pid+'.json'):null;if(CPUF)await b.startTracing(pg,{path:CPUF,categories:['devtools.timeline','disabled-by-default-devtools.timeline']});
    const TRF=flag('trace')?path.join(os.tmpdir(),'live107-'+process.pid+'.json'):null;if(TRF)await b.startTracing(pg,{path:TRF,categories:['devtools.timeline','disabled-by-default-devtools.timeline','blink','cc','gpu','skia','blink.canvas']});
    await pg.evaluate(ARM,FLUSH);
    if(opt('ablate','')){ /* --ablate a,b,…: in this one page, the whole frame with each layer / cached sub-layer off (LAYERS93.debugOff), 2 rounds interleaved */
      const L=String(opt('ablate','')).split(',');const rows={};const AF=path.join(os.tmpdir(),'live107a-'+process.pid+'.json');
      const EXP={fxclear:[()=>{window.__fx=B95.fxCx.clearRect;B95.fxCx.clearRect=function(){}},()=>{B95.fxCx.clearRect=window.__fx}],
        nolift:[()=>{window.__hl=LIGHT106.hlLift;LIGHT106.hlLift=0},()=>{LIGHT106.hlLift=window.__hl}],lightoff:[()=>{window.__ov=L106.ov;L106.ov='off'},()=>{L106.ov=window.__ov}],
        lightlight:[()=>{window.__ov=L106.ov;L106.ov='light'},()=>{L106.ov=window.__ov}],perfoff:[()=>{P107.off=true},()=>{P107.off=false}]};
      for(const rnd of [0,1])for(const k of ['none',...L]){if(EXP[k])await pg.evaluate(EXP[k][0]);else if(k!=='none')await pg.evaluate(k=>LAYERS93.debugOff(k,true),k);
        await pg.waitForTimeout(300);await b.startTracing(pg,{path:AF,categories:['devtools.timeline','disabled-by-default-devtools.timeline','cc','gpu','blink.canvas']});
        await pg.evaluate(ARM,FLUSH);await pg.waitForTimeout(SECS*500);const q=await pg.evaluate(READ);await b.stopTracing();
        if(EXP[k])await pg.evaluate(EXP[k][1]);else if(k!=='none')await pg.evaluate(k=>LAYERS93.debugOff(k,false),k);
        const ev=JSON.parse(fs.readFileSync(AF)).traceEvents;fs.unlinkSync(AF);let pc=0,pn=0,main=0;const tn={};for(const e of ev)if(e.ph==='M'&&e.name==='thread_name')tn[e.pid+':'+e.tid]=e.args.name;
        for(const e of ev){if(e.ph!=='X'||!/CrRendererMain/.test(tn[e.pid+':'+e.tid]||''))continue;if(/ProduceCanvasResource/.test(e.name)){pc+=(e.tdur||e.dur)/1000;pn++}if(e.name==='RunTask')main+=(e.tdur||0)/1000}
        (rows[k]=rows[k]||[]).push(`raster ${(pc/Math.max(1,q.n)).toFixed(1)}ms/fr main ${(main/Math.max(1,q.n)).toFixed(1)}ms/fr js ${q.js.mean} (${q.n}fr ${pn}res)`)}
      console.log(cfg.name,'ABLATE per rAF frame: canvas raster at commit (ProduceCanvasResource thread time) · main-thread CPU · board paint js mean (2 rounds):');for(const k in rows)console.log('   '+k.padEnd(12),rows[k].join('  '));await cx.close();continue}
    if(opt('trend','')){ /* --trend N: N windows of --secs each, one after another in the same match: does the frame get slower as the match goes on? */
      for(let i=0;i<+opt('trend','');i++){await pg.evaluate(ARM,FLUSH);await pg.waitForTimeout(SECS*1000);const q=await pg.evaluate(READ);
        const x=await pg.evaluate(()=>({heap:performance.memory?Math.round(performance.memory.usedJSHeapSize/1e6):null,blood:(S.blood||[]).length,fx:FX.length,hit:typeof HITFX!=='undefined'?HITFX.length:null,piles:(S.piles||[]).length,turn:S.turnNo,ri:S.ri,
          alive:S.players.filter(p=>p.alive).length,npcs:S.npcs.filter(n=>n.alive).length,l106cc:typeof L106!=='undefined'?L106.cc.size:null,an:typeof AN100!=='undefined'?AN100.stats.cells:null,dom:document.getElementsByTagName('*').length,log:(document.getElementById('log')||{children:[]}).children.length}));
        console.log(cfg.name,'t+'+((i+1)*SECS)+'s',`fps ${q.fps} frame p50 ${q.frame.p50} p95 ${q.frame.p95} js p50 ${q.js.p50} p95 ${q.js.p95} long ${q.long}/${q.longMs}ms`,JSON.stringify(x),JSON.stringify(q.lay))}
      await cx.close();continue}
    const t0=Date.now();let k=0;
    while(Date.now()-t0<SECS*1000){if(cfg.hover||cfg.aim){const P=await pg.evaluate(POINTS,!!cfg.aim);if(P.length){const p=P[k++%P.length];await pg.mouse.move(p.x,p.y,{steps:3})}await pg.waitForTimeout(cfg.aim?160:90)}else await pg.waitForTimeout(250)}
    const r=await pg.evaluate(READ);if(flag('mem')){r.mem=await pg.evaluate(MEM);console.log('   mem',JSON.stringify(r.mem))}let top=null;if(flag('canv'))console.log('   canvases',JSON.stringify(st.canv));
    if(CPUF){await b.stopTracing();const ev=JSON.parse(fs.readFileSync(CPUF)).traceEvents;fs.unlinkSync(CPUF);const tn={};const rp=new Set();
      for(const e of ev)if(e.ph==='M'&&e.name==='thread_name'){tn[e.pid+':'+e.tid]=e.args.name;if(e.args.name==='CrRendererMain')rp.add(e.pid)}
      /* CPU (thread) time of the renderer's top-level tasks: robust when other jobs share the box; ms per second and per frame */
      const cpu={main:0,comp:0,pool:0};let t0=Infinity,t1=0;for(const e of ev){if(e.ph!=='X'||e.name!=='RunTask'||e.tdur==null||!rp.has(e.pid))continue;const n=tn[e.pid+':'+e.tid]||'?';
        const k=/CrRendererMain/.test(n)?'main':/Compositor/.test(n)?'comp':/Raster|ImageDecode|ThreadPool/.test(n)?'pool':null;if(!k)continue;cpu[k]+=e.tdur/1000;if(k==='main'){t0=Math.min(t0,e.ts);t1=Math.max(t1,e.ts+e.dur)}}
      const secs=(t1-t0)/1e6||SECS;r.cpu={mainPerS:Math.round(cpu.main/secs),compPerS:Math.round(cpu.comp/secs),poolPerS:Math.round(cpu.pool/secs),mainPerFrame:+(cpu.main/Math.max(1,r.n)).toFixed(1)}}
    if(TRF){await b.stopTracing();const ev=JSON.parse(fs.readFileSync(TRF)).traceEvents;fs.unlinkSync(TRF);const tn={};for(const e of ev)if(e.ph==='M'&&e.name==='thread_name')tn[e.pid+':'+e.tid]=e.args.name;
      /* wall ms of complete events per thread kind (main / compositor / raster+pool), top names; nested events counted in each (read as "time inside") */
      const agg={};for(const e of ev){if(e.ph!=='X'||!e.dur)continue;const n=tn[e.pid+':'+e.tid]||'?';const th=/CrRendererMain/.test(n)?'main':/Compositor/.test(n)?'comp':/Raster|ThreadPool|ImageDecode/.test(n)?'pool':/VizCompositor|CrGpuMain|GPU/.test(n)?'viz':null;if(!th)continue;
        const k=th+' '+e.name;const a=agg[k]||(agg[k]={n:0,ms:0});a.n++;a.ms+=e.dur/1000}
      /* main-thread SELF thread-time per event name (children subtracted) */
      const mainEv=ev.filter(e=>e.ph==='X'&&e.dur&&/CrRendererMain/.test(tn[e.pid+':'+e.tid]||'')).sort((a,b)=>a.ts-b.ts||b.dur-a.dur);const st=[];const self={};
      for(const e of mainEv){while(st.length&&st[st.length-1].ts+st[st.length-1].dur<=e.ts)st.pop();const td=e.tdur!=null?e.tdur:e.dur;if(st.length){const p=st[st.length-1];p._c=(p._c||0)+td}st.push(e);e._td=td}
      for(const e of mainEv){const v=(e._td-(e._c||0))/1000;if(v>0){const k=e.name+(e.name==='FunctionCall'&&e.args&&e.args.data?' '+(e.args.data.functionName||'')+':'+(e.args.data.lineNumber||''):'');self[k]=(self[k]||0)+v}}
      if(flag('pcr')){const P=mainEv.filter(e=>/ProduceCanvasResource/.test(e.name)).slice(0,12);console.log('   PCR samples',JSON.stringify(P.map(e=>[Math.round(e.ts/1000)%100000,+(e.dur/1000).toFixed(1),e.args]))) ;
        const kids={};for(const e of mainEv){if(e.ts>=P[0].ts&&e.ts<=P[0].ts+P[0].dur&&e!==P[0]){kids[e.name]=(kids[e.name]||0)+e.dur/1000}}console.log('   inside first PCR',JSON.stringify(kids))}
      if(flag('rb')){ /* --rb: the call chain of every blocking GPU read-back (ReadbackImagePixels / WaitForCmd / Finish) on the main thread */
        const st2=[];for(const e of mainEv){while(st2.length&&st2[st2.length-1].ts+st2[st2.length-1].dur<=e.ts)st2.pop();st2.push(e);
          if(/ReadbackImagePixels|CommandBufferHelper::Finish|GetImageData|WaitForCmd/.test(e.name)&&e.dur>2000)console.log('   RB',(e.dur/1000).toFixed(0)+'ms',st2.map(x=>x.name+(x.name==='RunTask'&&x.args?JSON.stringify(x.args).slice(0,160):'')+(x.args&&x.args.data?'['+(x.args.data.functionName||x.args.data.type||'')+':'+(x.args.data.lineNumber||'')+']':'')).join(' > ').slice(0,900))}}
      if(flag('decodes')){const D={};for(const e of ev){if(e.ph!=='X'||!/Decode Image|ImageDecodeTask|Decode LazyPixelRef|GpuImageDecodeCache::DecodeImage|ImageFrameGenerator::decode$/.test(e.name))continue;const k=e.name+' '+JSON.stringify(e.args||{}).slice(0,160);const d=D[k]||(D[k]={n:0,ms:0});d.n++;d.ms+=e.dur/1000}
        console.log(Object.entries(D).sort((x,y)=>y[1].ms-x[1].ms).slice(0,20).map(([k,v])=>'   DEC '+v.n+'x '+v.ms.toFixed(0)+'ms '+k).join('\n'))}
      r.self=Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,30).map(([k,v])=>[k,+v.toFixed(0)]);
      r.trace=Object.entries(agg).sort((a,b)=>b[1].ms-a[1].ms).slice(0,40).map(([k,v])=>[k,v.n,+v.ms.toFixed(0)])}
    if(cdp){const {profile}=await cdp.send('Profiler.stop');const self={};const byId={};profile.nodes.forEach(n=>byId[n.id]=n);const dt=profile.timeDeltas;let tot=0;
      profile.samples.forEach((id,i)=>{const n=byId[id];const cf=n.callFrame;const kk=(cf.functionName||'(anon)')+(cf.url?' :'+(cf.lineNumber+1)+':'+(cf.columnNumber+1):'');self[kk]=(self[kk]||0)+(dt[i]||0);tot+=dt[i]||0});
      top=Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,28).map(([k,v])=>[k,+(v/1000).toFixed(0),+(100*v/tot).toFixed(1)]);
      /* inclusive (total) time per page function: each sample counts once for every distinct function on its stack */
      const par={};profile.nodes.forEach(n=>(n.children||[]).forEach(c=>par[c]=n.id));const inc={};
      profile.samples.forEach((id,i)=>{const seen=new Set();for(let x=id;x!=null;x=par[x]){const cf=byId[x].callFrame;if(!cf.url)continue;const kk=(cf.functionName||'(anon)')+' :'+(cf.lineNumber+1);if(seen.has(kk))continue;seen.add(kk);inc[kk]=(inc[kk]||0)+(dt[i]||0)}});
      if(flag('natives')){const N={};profile.samples.forEach((id,i)=>{const n=byId[id];const f=n.callFrame.functionName;if(!/^(drawImage|getImageData|toBlob|toDataURL|createImageBitmap|putImageData|fillRect|clearRect|fill|stroke)$/.test(f))return;
          const ch=[];for(let x=par[id];x!=null&&ch.length<4;x=par[x]){const cf=byId[x].callFrame;if(cf.url)ch.push((cf.functionName||'(anon)')+':'+(cf.lineNumber+1))}const k=f+' < '+ch.join(' < ');N[k]=(N[k]||0)+(dt[i]||0)});
        console.log(Object.entries(N).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,v])=>'   NATIVE '+(v/1000).toFixed(0)+'ms '+k).join('\n'))}
      r.incl=Object.entries(inc).sort((a,b)=>b[1]-a[1]).slice(0,45).map(([k,v])=>[k,+(v/1000).toFixed(0)])}
    res.runs.push({key:cfg.name+(FLUSH?' flush':''),cfg:cfg.name,st,...r,top});
    console.log((cfg.name+(FLUSH?' flush':'')).padEnd(22),`fps ${r.fps} frame p50 ${r.frame.p50} p95 ${r.frame.p95} max ${r.frame.max} (>25ms ${r.over25}, >50ms ${r.over50}/${r.n}) js p50 ${r.js.p50} p95 ${r.js.p95} max ${r.js.max} draws/frame ${r.drawsPerFrame} long ${r.long}/${r.longMs}ms TW ${r.TW} z ${r.z} light ${st.light}`);
    if(r.cpu)console.log('   CPU (thread time) main',r.cpu.mainPerS,'ms/s · per rAF frame',r.cpu.mainPerFrame,'ms · compositor',r.cpu.compPerS,'ms/s · raster/decode pool',r.cpu.poolPerS,'ms/s');
    console.log('   layers',JSON.stringify(r.lay),r.l106&&r.l106.n?`L106 ${(r.l106.ms/r.l106.n).toFixed(2)}ms/pass (static ${(r.l106.tStatic/r.l106.n).toFixed(2)} figs ${(r.l106.tFig/r.l106.n).toFixed(2)} contact ${(r.l106.tCont/r.l106.n).toFixed(2)}) builds ${r.l106.builds}`:'',r.p107?'P107 '+JSON.stringify(r.p107):'');
    if(r.self)console.log(r.self.map(([k,ms])=>'   self '+String(ms).padStart(6)+'ms '+k).join('\n'));
    if(r.trace&&flag('traceall'))console.log(r.trace.map(([k,n,ms])=>'   trace '+String(ms).padStart(6)+'ms '+String(n).padStart(6)+'x '+k).join('\n'));
    if(r.who)console.log(r.who.map(([k,n])=>'   who '+String(n).padStart(5)+' '+k).join('\n'));
    if(r.fn)console.log('   fn',JSON.stringify(r.fn));
    if(flag('p107'))console.log('   P107',r.p107,'fx95 dirty',r.fxd);
    if(r.cache)console.log('   caches',JSON.stringify(r.cache),'z99',r.z99);
    if(r.errs&&r.errs.length)console.log('   console.error',JSON.stringify(r.errs.slice(0,3)));
    if(r.probe)console.log(r.probe.map(([k,n,ms])=>'   probe '+String(n).padStart(5)+'x '+String(ms).padStart(7)+'ms '+k).join('\n'));
    if(r.incl)console.log('   inclusive: '+r.incl.map(([k,v])=>k+' '+v).join(' | '));
    if(top)console.log(top.map(([k,v,p])=>'   '+String(v).padStart(6)+'ms '+String(p).padStart(5)+'% '+k).join('\n'));
    await cx.close()}
  res.load1=load();console.log('load after',JSON.stringify(res.load1));console.log('ERRS',JSON.stringify(errs));
  if(JSONF){fs.mkdirSync(path.dirname(path.resolve(JSONF)),{recursive:true});fs.writeFileSync(JSONF,JSON.stringify(res,null,1))}
  await b.close();process.exit(errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});

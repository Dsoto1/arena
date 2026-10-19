/* =====================================================================
   405-v107perf2 — v1.07 beta 3: CPU FAST ON A GPU CANVAS + THE FRAME RECORDER (his beta-3 note 4, 2026-10-19: "all animations slow it
   down still"; Hand to CPU + CPU speed Fast → 0–10 fps on his laptop). DISPLAY ONLY: rules, dice (RNG), S, the log, saves and the online
   hash are untouched — nothing here calls rand() or sends anything. Method + numbers: tools/plans/v107/PERF.md "beta 3"
   (tools/bench/live.js --gpu --speed fast, tools/bench/gpu107.js).
   • Q1 FACES ENCODED WITHOUT A GPU READ-BACK. 268's face cache turns each new SVG face into a JPEG in idle time: it drew the face on a
     plain canvas and called toBlob. On a GPU-drawn page that canvas lives on the GPU, so toBlob read it back and the main thread waited for
     the GPU to finish EVERYTHING queued, the board's frames too (Chromium's GPU path on SwiftShader: 0.8–2 s a face, 4 a 6-s window of
     an all-CPU Fast match). The canvas is now made {willReadFrequently:true} (kept in memory): the same pixels, no wait.
   • Q2 "is the board shown?" (312's bst100Live, asked on every beast tick / schedule / draw) comes from a ResizeObserver on the board
     instead of reading cv.offsetParent (a forced layout after each panel update: 3 % of the main thread at Fast in the CPU profile).
   • Q3 THE FRAME RECORDER (288's frame meter): "⏺ 10 s" records 10 s of frame intervals, long tasks and long animation frames (with the
     scripts Chromium names), the time spent in the main areas (draw, render, light, figure cells, clean-ups, faces, saves, AI, aim, log,
     audio, stands, bus) and the costly canvas calls (new canvases, read-backs, toBlob / toDataURL, createImageBitmap, image loads), plus
     zoom, screen ratio, lighting, speed, browser and GPU names; then saves flavius-perf-<date>.json and shows one line. The wrappers are
     put in place when the recording starts and taken out when it ends: nothing runs while it is off.
   Kill switch: localStorage flavius_v107perf2off=1 (Q1 + Q2 back to the beta-3 path, no record button). Stats P107B.st. Test tv107r.
   ===================================================================== */
const P107B={off:(()=>{try{return localStorage.getItem('flavius_v107perf2off')==='1'}catch(e){return false}})(),st:{faces:0,shownRO:0}};

/* ---------- Q1 · 268's face → JPEG on a canvas kept in memory ---------- */
if(!P107B.off&&typeof r99Step==='function'&&typeof R99!=='undefined'){
  r99Step=function(){let e=R99.q.shift();while(e&&e.dead)e=R99.q.shift();if(!e){R99.busy--;return}const t0=performance.now();
    const next=()=>{R99.busy--;R99.stats.ms+=performance.now()-t0;if(R99.q.length)r99Pump()};
    const im=new Image();im.decoding='async';
    im.onload=()=>{try{const c=document.createElement('canvas');c.width=e.W;c.height=e.H;c.getContext('2d',{willReadFrequently:true}).drawImage(im,0,0,e.W,e.H);P107B.st.faces++;
        c.toBlob(b=>{if(!b||e.dead){if(!b)R99.stats.fail++;next();return}const fr=new FileReader();fr.onload=()=>{if(!e.dead&&typeof fr.result==='string'){e.url=fr.result;e.svgUrl=null;R99.stats.png++;
            document.querySelectorAll(`image[data-f99="${e.id}"]`).forEach(n=>n.setAttribute('href',e.url))}next()};fr.onerror=()=>{R99.stats.fail++;next()};fr.readAsDataURL(b)},'image/jpeg',.92)}
      catch(err){R99.stats.fail++;R99.png=false;R99.q.length=0;next()}};
    im.onerror=()=>{R99.stats.fail++;next()};im.src=e.url}}

/* ---------- Q2 · the board's "shown" from a ResizeObserver (no forced layout) ---------- */
if(!P107B.off&&typeof bst100Live==='function'&&typeof BST100!=='undefined'&&typeof ResizeObserver==='function'){const base=bst100Live;const V=P107B.vis={v:null};
  const shown=()=>{if(V.v==null){const c=document.getElementById('cv');V.v=!!(c&&c.offsetParent);
      if(c&&!V.ro){V.ro=new ResizeObserver(en=>{const r=en[en.length-1].contentRect;V.v=r.width>0&&r.height>0;P107B.st.shownRO++});V.ro.observe(c)}}return V.v};
  bst100Live=function(){if(P107B.off)return base.apply(this,arguments);try{if(!BST100.on||HEADLESS||!S||S.sim||S.ed94||document.hidden)return false;if(!shown())return false;
    if(BST100.ghosts.length||BST100.nets.length||BST100.tosses.length||BST100.puffs.length)return true;return S.npcs.some(n=>n.alive&&!n.out&&BST100.last.has(n.id))}catch(e){return false}}}

/* ---------- Q5 · figure cells kept in memory end to end ---------- */
/* 401 P3 made a cell canvas {willReadFrequently} only when 346 sharpens it (up-scaled). The others (down-scaled cells, 312's beast cells,
   321's base clean-up, 404's lying corpse) were GPU canvases on a GPU page — and the clean-ups that READ them (334 g6Proc, 346 b103Proc /
   b103Wall, 396/403 outline, 404's colour picks) draw them into in-memory canvases: each such drawImage is a synchronous GPU read-back
   (measured: 2.2 s on SwiftShader for one board-sized copy). Every canvas these functions make is now in memory, so a new cell (a new pose,
   a fall, a corpse — many a second at Fast) never waits for the GPU; the board uploads each finished cell once. Same pixels. */
P107B.cellsOn=true /* tests / bench: false = 401's rule */;P107B.cells=['an100CellCanvas','bst100CellCanvas','g6Scaled','b103Scaled','bs101Proc','cv107Lie'];
if(!P107B.off&&typeof P107!=='undefined'&&!P107.off&&'wrf' in P107){for(const nm of P107B.cells){try{const base=(0,eval)(nm);if(typeof base!=='function')continue;
    window.__p107bw=function(){if(P107B.off||!P107B.cellsOn)return base.apply(this,arguments);P107.wrf++;try{return base.apply(this,arguments)}finally{P107.wrf--}};(0,eval)(nm+'=window.__p107bw');window.__p107bw=null}catch(e){window.__p107bw=null}}}

/* ---------- Q3 · the recorder ---------- */
const REC107={on:false,secs:10 /* TWEAK: seconds recorded */,t0:0,tm:0,raf:0,last:0,fr:[],slow:[],long:[],loaf:[],iv:[],a:{},fa:{},c:{},undo:[],obs:[],turn0:0,res:null,
  AREAS:{draw:['drawLayers93'],render:['render'],light:['l106Pass','l106Build'],cells:['an100CellCanvas','bst100CellCanvas','an100Bm','cv107Lie'],
    clean:['bs101Proc','sh103Sharpen','g6Proc','b103Proc','b103Wall','aim106Outline'],faces:['r99Step','face99'],save:['matchSlotPut','matchAutosave'],
    ai:['cpuChoice','cpuScoreAttack','cpuTactic','cpuGoals','dangerMap','atkPlan','shouldRetreat','cpuMind'],aim:['aim106Wound','aim106Chance','aim106Best'],
    log:['log'],audio:['snd100Fire'],stands:['drawStands']}};
/* a page function (function / let global) timed while recording; put back at the end */
function rec107Wrap(name,area){let orig;try{orig=(0,eval)(name)}catch(e){return}if(typeof orig!=='function')return;const R=REC107;
  const A=R.a[area]||(R.a[area]={n:0,ms:0,max:0,d:0});
  const w=function(){if(!R.on||A.d)return orig.apply(this,arguments);A.d=1;const t=performance.now();
    try{return orig.apply(this,arguments)}finally{const dt=performance.now()-t;A.d=0;A.n++;A.ms+=dt;if(dt>A.max)A.max=dt;R.fa[area]=(R.fa[area]||0)+dt;if(dt>=1&&R.iv.length<40000)R.iv.push([area,t,t+dt])}};
  try{window.__rec107=w;(0,eval)(name+'=window.__rec107');window.__rec107=null;R.undo.push(()=>{try{if((0,eval)(name)===w){window.__rec107=orig;(0,eval)(name+'=window.__rec107');window.__rec107=null}}catch(e){}})}catch(e){window.__rec107=null}}
/* a prototype / object method counted (and, for the slow ones, timed) while recording */
function rec107Count(obj,key,label,timed){if(!obj)return;const d=Object.getOwnPropertyDescriptor(obj,key);if(!d||typeof d.value!=='function')return;const f=d.value,R=REC107;
  const w=function(){if(R.on){const c=rec107Hit(label);if(timed){const t=performance.now();try{return f.apply(this,arguments)}finally{c.ms+=performance.now()-t}}}return f.apply(this,arguments)};
  obj[key]=w;R.undo.push(()=>{if(obj[key]===w)obj[key]=f})}
function rec107Setter(proto,key,label,test){if(!proto)return;const d=Object.getOwnPropertyDescriptor(proto,key);if(!d||!d.set)return;const R=REC107;
  Object.defineProperty(proto,key,{configurable:true,enumerable:d.enumerable,get:d.get,set(v){if(R.on&&(!test||test(this,v)))rec107Hit(label);d.set.call(this,v)}});
  R.undo.push(()=>Object.defineProperty(proto,key,d))}
/* who asked (the first two page functions on the stack; only for the counted calls, only while recording) */
function rec107Where(){try{const L=String(new Error().stack).split('\n').slice(3).map(x=>x.trim()).filter(x=>/^at \S/.test(x)&&!/rec107|<anonymous>|^at (new )?Promise/.test(x));
  return L.slice(0,2).map(x=>x.replace(/^at /,'').replace(/\s*\(.*$/,'').replace(/^Object\./,'')).join(' < ')||'?'}catch(e){return '?'}}
function rec107Hit(label,ms){const R=REC107;const c=R.c[label]||(R.c[label]={n:0,ms:0,by:{}});c.n++;if(ms)c.ms+=ms;const w=rec107Where();if(Object.keys(c.by).length<24||c.by[w])c.by[w]=(c.by[w]||0)+1;return c}
function rec107Install(){const R=REC107;
  for(const area in R.AREAS)for(const nm of R.AREAS[area])rec107Wrap(nm,area);
  if(typeof BUS!=='undefined'&&BUS&&typeof BUS.emit==='function'){const f=BUS.emit;const A=R.a.bus||(R.a.bus={n:0,ms:0,max:0,d:0});
    BUS.emit=function(){if(!R.on||A.d)return f.apply(this,arguments);A.d=1;const t=performance.now();try{return f.apply(this,arguments)}finally{const dt=performance.now()-t;A.d=0;A.n++;A.ms+=dt;if(dt>A.max)A.max=dt;R.fa.bus=(R.fa.bus||0)+dt;if(dt>=1&&R.iv.length<40000)R.iv.push(['bus',t,t+dt])}};
    R.undo.push(()=>{if(BUS.emit!==f)BUS.emit=f})}
  const ce=document.createElement;document.createElement=function(n){if(R.on&&/^canvas$/i.test(n))rec107Hit('newCanvas');return ce.apply(this,arguments)};
  R.undo.push(()=>{document.createElement=ce});
  for(const C of [window.CanvasRenderingContext2D,window.OffscreenCanvasRenderingContext2D])if(C)rec107Count(C.prototype,'getImageData','getImageData',true);
  if(window.HTMLCanvasElement){rec107Count(HTMLCanvasElement.prototype,'toBlob','toBlob',true);rec107Count(HTMLCanvasElement.prototype,'toDataURL','toDataURL',true);
    for(const k of ['width','height'])rec107Setter(HTMLCanvasElement.prototype,k,'canvasResize',(el,v)=>el.id!=='cv'||+v!==el[k])}
  if(window.OffscreenCanvas)rec107Count(OffscreenCanvas.prototype,'convertToBlob','convertToBlob',true);
  if(typeof window.createImageBitmap==='function'){const f=window.createImageBitmap;window.createImageBitmap=function(s){if(R.on)rec107Hit('createImageBitmap('+((s&&s.constructor&&s.constructor.name)||'?')+')');return f.apply(this,arguments)};
    R.undo.push(()=>{window.createImageBitmap=f})}
  if(window.HTMLImageElement)rec107Setter(HTMLImageElement.prototype,'src','imageLoad');
  /* read-back risks: a canvas NOT kept in memory read (getImageData / toBlob / toDataURL) or drawn into one that is — on a GPU page each
     one waits for the GPU (counted as readback?, with who asked) */
  if(window.CanvasRenderingContext2D){const P=CanvasRenderingContext2D.prototype,mem=new WeakMap();
    const inMem=c=>{if(!c||!c.width||!c.height)return true;let v=mem.get(c);if(v==null){try{const g=c.getContext&&c.getContext('2d');v=!g||!!(g.getContextAttributes&&g.getContextAttributes().willReadFrequently)}catch(e){v=true}mem.set(c,v)}return v};
    const di=P.drawImage;P.drawImage=function(s){if(R.on&&s&&s instanceof HTMLCanvasElement&&this.canvas&&inMem(this.canvas)&&!inMem(s))rec107Hit('readback?');return di.apply(this,arguments)};
    const gi=P.getImageData;P.getImageData=function(){if(R.on&&!inMem(this.canvas))rec107Hit('readback?');return gi.apply(this,arguments)};
    R.undo.push(()=>{if(P.drawImage!==di)P.drawImage=di;if(P.getImageData!==gi)P.getImageData=gi})}
  if(window.HTMLCanvasElement)for(const k of ['toBlob','toDataURL']){const P=HTMLCanvasElement.prototype,f=P[k];
    P[k]=function(){if(R.on){let m=true;try{const g=this.getContext('2d');m=!g||!!g.getContextAttributes().willReadFrequently}catch(e){}if(!m)rec107Hit('readback?')}return f.apply(this,arguments)};R.undo.push(()=>{if(P[k]!==f)P[k]=f})}}
function rec107Uninstall(){const u=REC107.undo;REC107.undo=[];while(u.length)try{u.pop()()}catch(e){}}
function rec107Areas(t0,t1){const o={};for(const [a,s,e] of REC107.iv){if(e<=t0||s>=t1)continue;o[a]=+((o[a]||0)+Math.min(e,t1)-Math.max(s,t0)).toFixed(1)}return o}
function rec107Gpu(){try{const c=document.createElement('canvas');const gl=c.getContext('webgl')||c.getContext('experimental-webgl');if(!gl)return null;
  const x=gl.getExtension('WEBGL_debug_renderer_info');const o={vendor:x?gl.getParameter(x.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),renderer:x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
  const l=gl.getExtension('WEBGL_lose_context');if(l)l.loseContext();return o}catch(e){return null}}
function rec107Tick(ts){const R=REC107;R.raf=0;if(!R.on)return;if(R.last){const dt=ts-R.last;R.fr.push(+dt.toFixed(1));if(dt>50&&R.slow.length<60)R.slow.push({t:Math.round(R.last-R.t0),ms:+dt.toFixed(1),areas:Object.fromEntries(Object.entries(R.fa).map(([k,v])=>[k,+v.toFixed(1)]))})}
  R.last=ts;R.fa={};rec107Btn();R.raf=requestAnimationFrame(rec107Tick)}
function rec107Start(){const R=REC107;if(R.on||P107B.off)return;Object.assign(R,{on:true,t0:performance.now(),last:0,fr:[],slow:[],long:[],loaf:[],iv:[],a:{},fa:{},c:{},res:null});
  try{R.turn0=typeof S!=='undefined'&&S?S.turnNo|0:0}catch(e){R.turn0=0}
  rec107Install();
  for(const [type,keep] of [['longtask',e=>R.long.push({t:Math.round(e.startTime-R.t0),ms:Math.round(e.duration),s:e.startTime,attr:(e.attribution||[]).map(a=>a.containerType+':'+(a.containerName||a.containerSrc||a.name||'')).join(' ')})],
    ['long-animation-frame',e=>{if(R.loaf.length<200)R.loaf.push({t:Math.round(e.startTime-R.t0),ms:Math.round(e.duration),blocking:Math.round(e.blockingDuration||0),render:Math.round(e.renderStart?e.startTime+e.duration-e.renderStart:0),styleLayout:Math.round(e.styleAndLayoutStart?e.startTime+e.duration-e.styleAndLayoutStart:0),
      scripts:(e.scripts||[]).slice(0,8).map(s=>({ms:Math.round(s.duration),fn:s.sourceFunctionName||'',inv:String(s.invoker||'').slice(0,60),type:s.invokerType||'',pos:s.sourceCharPosition,layout:Math.round(s.forcedStyleAndLayoutDuration||0)}))})}]]){
    try{if(PerformanceObserver.supportedEntryTypes&&!PerformanceObserver.supportedEntryTypes.includes(type))continue;const o=new PerformanceObserver(l=>{if(R.on)l.getEntries().forEach(keep)});o.observe({type,buffered:false});R.obs.push(o)}catch(e){}}
  R.raf=requestAnimationFrame(rec107Tick);R.tm=setTimeout(rec107Stop,R.secs*1000);rec107Btn()}
function rec107Stop(){const R=REC107;if(!R.on)return;const el=performance.now()-R.t0;
  for(const o of R.obs)try{const rest=o.takeRecords?o.takeRecords():[];o.disconnect()}catch(e){}R.obs=[];R.on=false;clearTimeout(R.tm);if(R.raf)cancelAnimationFrame(R.raf);R.raf=0;rec107Uninstall();
  const fr=R.fr.slice(1),srt=fr.slice().sort((a,b)=>a-b),q=p=>srt.length?srt[Math.min(srt.length-1,Math.floor(p*(srt.length-1)))]:0;
  const areas={};for(const [k,v] of Object.entries(R.a))if(v.n)areas[k]={calls:v.n,ms:Math.round(v.ms),perS:+(v.ms*1000/el).toFixed(1),max:+v.max.toFixed(1)};
  for(const l of R.long){l.areas=rec107Areas(l.s,l.s+l.ms);delete l.s}
  let g={};try{g={zoom:typeof duelCam==='function'?+duelCam().toFixed(2):1,light:typeof l106Mode==='function'?l106Mode():null,speed:typeof SPEED!=='undefined'?SPEED:null,
    anim:typeof SETTINGS!=='undefined'?{anim:SETTINGS.anim,fx:SETTINGS.fx,motion:SETTINGS.motion,reduce:SETTINGS.reduceMotion}:null,
    event:typeof S!=='undefined'&&S?{ev:(()=>{try{const e=EV();return e&&(e.id||e.name)||null}catch(x){return null}})(),round:S.ri,turns:(S.turnNo|0)-R.turn0,players:(S.players||[]).length,cpu:(S.players||[]).filter(p=>p.cpu).length,over:!!S.over,onl:!!S.onl}:null,
    screen:typeof fps100Screen==='function'?fps100Screen():null}}catch(e){}
  let lay=null;try{lay=LAYERS93.report().rows.filter(r=>r.n).sort((a,b)=>b.avg-a.avg).slice(0,14).map(r=>({name:r.name,avg:+r.avg.toFixed(2),max:+(r.max||0).toFixed(1),cached:!!r.cached}))}catch(e){}
  const res={kind:'flavius-perf',v:1,game:typeof GAME_VER!=='undefined'?GAME_VER:null,at:new Date().toISOString(),secs:+(el/1000).toFixed(1),
    ua:navigator.userAgent,gpu:rec107Gpu(),cores:navigator.hardwareConcurrency||null,memGB:navigator.deviceMemory||null,dpr:window.devicePixelRatio||1,
    view:{w:innerWidth,h:innerHeight},canvas:typeof cv!=='undefined'&&cv?{w:cv.width,h:cv.height}:null,...g,
    frames:{n:fr.length,fps:+(fr.length*1000/el).toFixed(1),p50:q(.5),p95:q(.95),max:q(1),over33:fr.filter(x=>x>33.4).length,over50:fr.filter(x=>x>50).length,intervals:fr},
    areas,slowFrames:R.slow,longTasks:R.long,longFrames:R.loaf,counts:R.c,layers:lay,p107:typeof P107!=='undefined'&&P107.st?{...P107.st}:null,p107b:{...P107B.st},
    note:'areas = inclusive ms (draw holds light, cells, stands, clean-ups; render may call draw); slowFrames.areas = ms in the frame before it'};
  R.res=res;let top=Object.entries(areas).sort((a,b)=>b[1].ms-a[1].ms)[0];
  const lt=R.long.reduce((s,l)=>s+l.ms,0);
  R.line=_T`${res.frames.fps} fps · ${_T('slowest')} ${Math.round(res.frames.max)} ms · ${R.long.length} ${_T('long tasks')} (${lt} ms)`+(top?` · ${_T('most')}: ${top[0]} ${top[1].perS} ms/s`:'');
  try{const d=new Date(),p=n=>String(n).padStart(2,'0');const name=`flavius-perf-${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.json`;
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(res,null,1)],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();
    setTimeout(()=>{try{URL.revokeObjectURL(a.href);a.remove()}catch(e){}},4000);R.file=name}catch(e){console.error(e)}
  rec107Btn();return res}
/* the button + its line in 288's meter */
function rec107Btn(){const e=typeof F100!=='undefined'&&F100.el;if(!e||P107B.off)return;let b=e.querySelector('.r107b');
  if(!b){b=document.createElement('button');b.type='button';b.className='r107b';b.setAttribute('data-r107','');e.querySelector('.f1').appendChild(b);
    const ln=document.createElement('div');ln.className='r107l';ln.hidden=true;e.appendChild(ln)}
  const R=REC107;const left=Math.max(0,Math.ceil(R.secs-(performance.now()-R.t0)/1000));
  const txt=R.on?`⏺ ${left} s`:_T`⏺ ${R.secs} s`;if(b.textContent!==txt)b.textContent=txt;b.classList.toggle('on',R.on);
  b.title=R.on?_T('Recording… keep playing'):_T('Record 10 s of play into a report file');
  const ln=e.querySelector('.r107l');if(ln){const t=!R.on&&R.line?R.line+(R.file?' · '+_T('saved'):''):'';ln.hidden=!t;if(ln.textContent!==t)ln.textContent=t}}
if(!P107B.off&&typeof fps100Build==='function'){const base=fps100Build;fps100Build=function(){const r=base.apply(this,arguments);try{rec107Btn()}catch(e){console.error(e)}return r};
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.r107b');if(!b)return;e.stopPropagation();e.preventDefault();if(REC107.on)rec107Stop();else rec107Start()},true);
  if(typeof F100!=='undefined'&&F100.el)rec107Btn();
  const st=document.createElement('style');st.textContent=`#fps100 .r107b{margin-left:4px;background:none;border:1px solid #5a4a30;color:#eee;border-radius:4px;font:600 10px/1.2 system-ui,sans-serif;padding:1px 4px;cursor:pointer}
#fps100 .r107b.on{color:#ff7a6a;border-color:#a33}#fps100 .r107l{font-weight:400;font-size:10px;opacity:.9;margin-top:2px;white-space:normal}#fps100 .r107l[hidden]{display:none}`;document.head.appendChild(st)}

/* ---------- Q4 · 230's panel patch without taking the panels out of the page ---------- */
/* p95Patch swapped each live panel (#status, #rosterHd, #roster, #board, #npcPanel, #turnInd) for an empty twin while render() wrote, then
   put the live one back after patching it: every render took six panels out of the page and back in, so each was laid out, styled (the
   :has() rules up to <html>) and PAINTED WHOLE again (≈29 raster tiles a render) — on a GPU page that is GPU raster 4 times a second
   while a CPU acts. Now the live panel stays where it is (its id parked) and the twin is written in a hidden holder at the top of <body>
   (first in document order, so the render's own lookups find the twin's elements first); the patch then changes only what changed.
   Off with the module's kill switch, or P107B.hold=false. */
P107B.hold=true;P107B.st.hold=0;
if(!P107B.off&&typeof p95Patch==='function'&&typeof P95!=='undefined'){const base=p95Patch;
  p95Patch=function(ids,fn,self,args){if(!P107B.hold||P107B.off||!P95.on||P95.noPatch||HEADLESS)return base.apply(this,arguments);
    let H=document.getElementById('p107hold');if(!H){H=document.createElement('div');H.id='p107hold';H.hidden=true;H.setAttribute('aria-hidden','true')}
    if(H!==document.body.firstChild)document.body.insertBefore(H,document.body.firstChild);
    const sw=[];const act=document.activeElement;
    for(const id of ids){if(P95.act[id])continue;const live=document.getElementById(id);if(!live||!live.parentNode)continue;
      const fresh=live.cloneNode(false);live.removeAttribute('id');H.appendChild(fresh);P95.act[id]=1;sw.push([id,live,fresh])}
    try{return fn.apply(self,args)}
    finally{
      if(sw.some(x=>x[0]==='board'))try{if(typeof panelStatsUp==='function')panelStatsUp()}catch(e){}
      for(const [id,live,fresh] of sw){delete P95.act[id];if(fresh.parentNode)fresh.parentNode.removeChild(fresh);live.id=id;
        try{morph95Attrs(live,fresh);morph95Kids(live,fresh)}catch(e){console.error(e);while(live.firstChild)live.removeChild(live.firstChild);while(fresh.firstChild)live.appendChild(fresh.firstChild)}}
      P95.n.patched++;P107B.st.hold++;
      try{if(act&&act!==document.body&&act.isConnected&&document.activeElement!==act&&sw.some(x=>x[1].contains(act)))act.focus({preventScroll:true})}catch(e){}}}}

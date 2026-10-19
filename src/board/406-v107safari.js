/* =====================================================================
   406-v107safari — v1.07 beta 4: SAFARI (WebKit) FRAME RATE (his two recorder reports, Safari 26.6 / macOS / DPR 2: a PAUSED match at
   5 fps and Slow at 4.5 fps while our JS is 2–5 ms a frame; the same Mac in Chrome: fine, ~30 fps at Fast). DISPLAY ONLY: rules, dice
   (RNG), S, the log, saves and the online hash are untouched — nothing here calls rand() or sends anything. Notes + numbers:
   tools/plans/v107/PERF.md "beta 4: Safari reports" (tools/bench/webkit.js; .github/workflows/webkit-bench.yml).
   • W1 BOARD RESOLUTION ON SAFARI. Safari draws a 2D canvas with CoreGraphics on the CPU (in its GPU process, so it never shows as our JS):
     each board draw rasterises the 2060×1418 canvas (the ~15 board-sized stone / light / sky layers with source-atop / destination-over,
     the crowd, the pieces). The cost grows with the device pixels: on WebKit the board's canvases use a device ratio capped at W1.cap
     (1.5: 0.56× the pixels of a 2× screen); when the drawn frames stay slow (median > W1.slowMs over W1.n frames that drew) it drops once
     to 1 for the rest of the visit. Done by giving the page a capped window.devicePixelRatio (every canvas sizes from it; the DOM's own
     text and pictures stay sharp). Chrome / Firefox: untouched. localStorage flavius_v107dpr = a fixed cap (e.g. 2 = off, 1 = 1×).
   • W2 THE GUIDE'S GOLD TILE DOES NOT REDRAW THE BOARD EVERY FRAME (all browsers). 29's drawSugTile pulsed the ring by asking for a whole
     board draw every animation frame for as long as the suggestion stood — a paused match, the human thinking, drew the full board
     60 times a second (Safari: every frame of the paused report drew). Now the ring on the sand is drawn still (its middle size), and the
     pulse is a small gold ring over the tile animated by the compositor (CSS transform + opacity), shown only when nothing stands on the
     tile. Reduce motion / Animations Off: the still ring only.
   • W3 IN-MEMORY CELLS HANDED TO THE BOARD AS BITMAPS (WebKit). 401 P3 / 405 Q5 keep the figure cells {willReadFrequently} (read back for
     the clean-ups). On WebKit such a canvas lives in the page's process while the board lives in the GPU process: every board draw sent
     each cell over again. A cell that held still for 2 draws is copied once into an ImageBitmap (createImageBitmap, no read-back) and the
     board draws that; any change to the cell (a sharpen, a clean-up, a resize) drops the copy. Unused copies are closed.
   • W4 THE RECORDER (405 Q3) FOR SAFARI: who asked (Safari's stack format), who called draw() ("draw()" in counts), the page's canvases
     > 256 px, running CSS animations (document.getAnimations), board draws and drawImage sources per frame, TW / board size changes,
     the device ratio used, and the #perf=… switches of this load (00b-perf's PERF_SW). Pseudo-switch "animoff" = Animations Off for the load.
   Kill switch: localStorage flavius_v107safarioff=1 (or #perf=v107safarioff). flavius_v107safariforce=1 = the WebKit path in any browser
   (tests / bench). Stats P107S.st. Test tv107s.
   ===================================================================== */
const P107S={off:(()=>{try{return localStorage.getItem('flavius_v107safarioff')==='1'}catch(e){return false}})(),
  webkit:(()=>{try{if(localStorage.getItem('flavius_v107safariforce')==='1')return true}catch(e){}const u=navigator.userAgent||'';
    return /AppleWebKit/.test(u)&&!/Chrome|Chromium|CriOS|FxiOS|EdgiOS|Edg\/|OPR\/|Android/.test(u)&&!window.chrome})(),
  st:{dprDrop:0,sugStill:0,sugOver:0,bm:0,bmDraw:0,bmDrop:0,bmClose:0,cvDraw:0}};
const PERF_SWL=typeof PERF_SW!=='undefined'?PERF_SW:[];

/* ---------- W1 · the board's device ratio on WebKit ---------- */
const W1={cap:1.5 /* TWEAK: WebKit cap */,low:1,slowMs:45 /* TWEAK: median ms of a drawn frame that drops to 1× */,n:40,fixed:null,real:null,t:[],dropped:false};
(()=>{if(P107S.off||!P107S.webkit)return;try{const v=parseFloat(localStorage.getItem('flavius_v107dpr'));if(v>0)W1.fixed=v}catch(e){}
  let o=window,d=null;while(o&&!(d=Object.getOwnPropertyDescriptor(o,'devicePixelRatio')))o=Object.getPrototypeOf(o);if(!d||!d.get)return;
  W1.real=()=>d.get.call(window);
  try{Object.defineProperty(window,'devicePixelRatio',{configurable:true,get(){const r=W1.real()||1;const c=W1.fixed||(W1.dropped?W1.low:W1.cap);return Math.min(r,c)}})}catch(e){W1.real=null}})();
function w1Used(){try{return window.devicePixelRatio||1}catch(e){return 1}}
function w1Real(){try{return W1.real?W1.real():(window.devicePixelRatio||1)}catch(e){return 1}}
/* one drop to 1× when the frames that drew stay slow (sampled with the next animation frame after a board draw) */
if(!P107S.off&&P107S.webkit&&W1.real&&typeof draw==='function'){const base=draw;let pend=0,last=0;
  draw=function(){const r=base.apply(this,arguments);try{if(!W1.dropped&&!W1.fixed&&!pend&&!HEADLESS&&S&&w1Real()>W1.low){pend=requestAnimationFrame(ts=>{pend=0;
      if(last&&ts-last<1000){W1.t.push(ts-last);if(W1.t.length>=W1.n){const a=W1.t.slice().sort((x,y)=>x-y),m=a[a.length>>1];W1.t=[];
          if(m>W1.slowMs){W1.dropped=true;P107S.st.dprDrop++;requestAnimationFrame(()=>{try{if(S)draw()}catch(e){}})}}}last=ts})}}catch(e){}return r}}

/* ---------- W2 · the Guide's ring: still on the sand, the pulse over it ---------- */
const W2={el:null,seen:false,key:''};
function w2Css(){if(document.getElementById('w2css107'))return;const st=document.createElement('style');st.id='w2css107';
  st.textContent=`#sug107{position:absolute;pointer-events:none;border:2px solid #f0cf7d;border-radius:50%;box-shadow:0 0 8px 1px rgba(240,207,125,.75);z-index:3;
  will-change:transform,opacity;animation:sug107 1.4s ease-in-out infinite alternate;transform-origin:50% 50%}
#sug107[hidden]{display:none}@keyframes sug107{from{transform:scale(1);opacity:.95}to{transform:scale(1.14);opacity:.35}}
@media (prefers-reduced-motion:reduce){#sug107{display:none}}`;document.head.appendChild(st)}
function w2Hide(){if(W2.el&&!W2.el.hidden){W2.el.hidden=true;W2.key=''}}
function w2Show(t){try{const still=(typeof animOn==='function'&&!animOn())||(typeof reduceMotion==='function'&&reduceMotion())||(typeof SPEED!=='undefined'&&SPEED==='snap');
    const occ=[...(S.players||[]),...(S.npcs||[])].some(x=>x&&x.alive!==false&&!x.out&&!x.exited&&!x.underground&&x.r===t.r&&x.c===t.c);
    const cover=(typeof CUR_MODAL!=='undefined'&&CUR_MODAL)||document.body.classList.contains('chromeoff');
    if(still||occ||cover||!cv||!cv.offsetParent){w2Hide();return}
    const m=center(t.r,t.c),b=cv.getBoundingClientRect(),k=b.width/(cv.width/(window.devicePixelRatio||1)||b.width)||1;
    const w=TW*0.86*k,h=TW*0.43*k,x=b.left+scrollX+m.x*k-w/2,y=b.top+scrollY+m.y*k-h/2;
    if(x+w<b.left+scrollX||y+h<b.top+scrollY||x>b.right+scrollX||y>b.bottom+scrollY){w2Hide();return}
    if(!W2.el){w2Css();const e=document.createElement('div');e.id='sug107';e.setAttribute('aria-hidden','true');e.hidden=true;document.body.appendChild(e);W2.el=e}
    const key=[x,y,w,h].map(v=>v.toFixed(1)).join(',');if(key!==W2.key){W2.key=key;const s=W2.el.style;s.left=x.toFixed(1)+'px';s.top=y.toFixed(1)+'px';s.width=w.toFixed(1)+'px';s.height=h.toFixed(1)+'px'}
    if(W2.el.hidden){W2.el.hidden=false;P107S.st.sugOver++}}catch(e){w2Hide()}}
if(!P107S.off&&typeof drawSugTile==='function'&&typeof GUIDE!=='undefined'){const base=drawSugTile;
  drawSugTile=function(){if(P107S.off||!S||!S.sugTile||S.over)return base.apply(this,arguments);
    const pn=performance.now;performance.now=function(){return 700};   /* the ring's middle size (ph = 0.5) */
    try{return base.apply(this,arguments)}finally{performance.now=pn;if(GUIDE.raf){cancelAnimationFrame(GUIDE.raf);GUIDE.raf=0}W2.seen=true;P107S.st.sugStill++}}
  const bd=draw;draw=function(){W2.seen=false;const r=bd.apply(this,arguments);try{if(W2.seen&&S&&S.sugTile&&!S.over&&!HEADLESS)w2Show(S.sugTile);else w2Hide()}catch(e){}return r};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)w2Hide()})}

/* ---------- W3 · in-memory cells drawn as ImageBitmaps (WebKit) ---------- */
const W4={draws:0,di:{},tw:{},cvs:{}};
const W3={on:!P107S.off&&(P107S.webkit||PERF_SWL.includes('v107bmall'))&&typeof createImageBitmap==='function'&&typeof HTMLCanvasElement!=='undefined',
  rec:new WeakMap(),live:new Set(),n:0,keep:600 /* TWEAK: board draws a copy may go unused before it is closed */};
if(!P107S.off&&typeof HTMLCanvasElement!=='undefined'){const P=HTMLCanvasElement.prototype,gc=P.getContext,dW=Object.getOwnPropertyDescriptor(P,'width'),dH=Object.getOwnPropertyDescriptor(P,'height');
  const MUT=['fill','stroke','fillRect','strokeRect','clearRect','fillText','strokeText','drawImage','putImageData','reset'];
  const bump=c=>{c.__v107=(c.__v107|0)+1;const R=W3.rec.get(c);if(R&&R.bm){try{R.bm.close()}catch(e){}R.bm=null;P107S.st.bmDrop++}};
  /* an in-memory canvas is marked (__w107: the recorder names it); on the W3 path its changes are counted (__v107) */
  P.getContext=function(type,opt){const g=gc.apply(this,arguments);try{if(g&&type==='2d'&&!this.__w107&&((opt&&opt.willReadFrequently)||(typeof P107!=='undefined'&&P107.wrf>0&&opt==null))){
      const c=this;c.__w107=1;c.__v107=0;if(W3.on){
      for(const m of MUT){const f=g[m];if(typeof f==='function')g[m]=function(){bump(c);return f.apply(this,arguments)}}
      if(dW&&dH){Object.defineProperty(c,'width',{configurable:true,get(){return dW.get.call(this)},set(v){bump(this);dW.set.call(this,v)}});
        Object.defineProperty(c,'height',{configurable:true,get(){return dH.get.call(this)},set(v){bump(this);dH.set.call(this,v)}})}}}}catch(e){}return g};
  /* the board's own context (on the prototype: 321's bs101Patch puts its own ctx.drawImage over any instance wrapper and calls the
     prototype's): a held-still in-memory canvas → its bitmap copy (W3), and the recorder's count of what the board draws (W4) */
  const C2=CanvasRenderingContext2D.prototype,di=C2.drawImage;
  C2.drawImage=function(s){if(this!==ctx||!s)return di.apply(this,arguments);
    if(typeof REC107!=='undefined'&&REC107.on){let k=s instanceof HTMLCanvasElement?(s.__w107?'canvas(in memory)':'canvas'):s.constructor?s.constructor.name:'?';if(s.width*s.height>=512*512)k+=' big';W4.di[k]=(W4.di[k]||0)+1}
    if(s.__w107&&W3.on&&!P107S.off){let R=W3.rec.get(s);if(!R){R={bm:null,v:-1,seen:0,pend:false,used:0};W3.rec.set(s,R)}
      R.used=W3.n;if(R.bm&&R.v===s.__v107&&R.w===s.width&&R.h===s.height){P107S.st.bmDraw++;const a=Array.prototype.slice.call(arguments);a[0]=R.bm;return di.apply(this,a)}
      if(R.seen!==s.__v107+1){R.seen=s.__v107+1;R.cnt=1}else R.cnt++;
      if(R.cnt>=2&&!R.pend&&s.width&&s.height){R.pend=true;const v=s.__v107,w=s.width,h=s.height;
        createImageBitmap(s).then(bm=>{R.pend=false;if(s.__v107!==v||s.width!==w||s.height!==h){bm.close();return}if(R.bm)try{R.bm.close()}catch(e){}R.bm=bm;R.v=v;R.w=w;R.h=h;W3.live.add(s);P107S.st.bm++},()=>{R.pend=false;R.cnt=-1e9})}
      P107S.st.cvDraw++}
    return di.apply(this,arguments)};
  /* close copies the board has not drawn for a while */
  if(W3.on&&typeof draw==='function'){const base=draw;draw=function(){W3.n++;if(W3.n%120===0)for(const s of W3.live){const R=W3.rec.get(s);if(!R||!R.bm){W3.live.delete(s);continue}
      if(W3.n-R.used>W3.keep){try{R.bm.close()}catch(e){}R.bm=null;W3.live.delete(s);P107S.st.bmClose++}}return base.apply(this,arguments)}}}

/* ---------- W5 · the board canvas is not re-sized to its own size every draw (WebKit) ---------- */
/* 07's draw() sets cv.width / cv.height on every draw, the same values almost always: a canvas reset (state + pixels) that WebKit may
   treat as a new surface. Same size → the context's own reset() (the same state and pixels, the surface kept); another size → as before. */
const W5={on:!P107S.off&&P107S.webkit&&typeof ctx!=='undefined'&&ctx&&typeof ctx.reset==='function'&&typeof cv!=='undefined'&&!!cv&&!PERF_SWL.includes('w5off')};
if(W5.on){const P=HTMLCanvasElement.prototype;for(const k of ['width','height']){const d=Object.getOwnPropertyDescriptor(P,k);if(!d||!d.set)continue;
  try{Object.defineProperty(cv,k,{configurable:true,get(){return d.get.call(this)},set(v){if(!P107S.off&&+v===d.get.call(this)){P107S.st.sameSize=(P107S.st.sameSize|0)+1;ctx.reset();return}d.set.call(this,v)}})}catch(e){}}}

/* ---------- pseudo-switch: Animations Off for this load ---------- */
if(PERF_SWL.includes('animoff')&&typeof animOn==='function'){animOn=function(){return false}}

/* ---------- W4 · the recorder, Safari-aware ---------- */

if(typeof rec107Where==='function'){
  /* Chrome "at fn (url)" and Safari / Firefox "fn@url" stacks: the first two page functions that are not the recorder's */
  rec107Where=function(){try{const L=String(new Error().stack).split('\n').map(x=>x.trim()).filter(Boolean).map(x=>{let m=/^at (?:new )?([^\s(]+)/.exec(x);if(m)return m[1];m=/^([^@\s]*)@/.exec(x);return m?m[1]||'(anon)':null})
      .filter(n=>n&&!/rec107|w4|^(w|draw|base)$|^__|^(anonymous|<anonymous>|Promise|\(anon\))$/.test(n)).map(n=>n.replace(/^Object\./,''));return L.slice(0,2).join(' < ')||'?'}catch(e){return '?'}}}
if(typeof rec107Install==='function'&&typeof REC107!=='undefined'){const base=rec107Install;
  rec107Install=function(){const r=base.apply(this,arguments);const R=REC107;Object.assign(W4,{draws:0,di:{},tw:{},cvs:{}});
    try{const d0=draw;const w=function(){if(R.on){W4.draws++;rec107Hit('draw()')}const x=d0.apply(this,arguments);if(R.on)try{W4.tw[TW]=(W4.tw[TW]||0)+1;const k=cv.width+'x'+cv.height;W4.cvs[k]=(W4.cvs[k]||0)+1}catch(e){}return x};
      draw=w;R.undo.push(()=>{if(draw===w)draw=d0})}catch(e){}
    return r}}
/* extra fields for 405's report (rec107Stop spreads rec107Extra()) */
function rec107Extra(){const o={switches:PERF_SWL.slice()};try{const fr=Math.max(1,(REC107.fr||[]).length);
    const cs=[...document.querySelectorAll('canvas')].filter(c=>c.width>256||c.height>256).slice(0,16).map(c=>({id:c.id||c.className||'',w:c.width,h:c.height,css:c.isConnected?Math.round(c.clientWidth)+'x'+Math.round(c.clientHeight):'off-page'}));
    let an=[];try{an=document.getAnimations()}catch(e){}const names={};for(const a of an){const t=a.effect&&a.effect.target;const k=(a.animationName||a.transitionProperty||'?')+'@'+(t?(t.id||String(t.className||'').split(' ')[0]||t.tagName):'');names[k]=(names[k]||0)+1}
    o.page={dprReal:w1Real(),dprUsed:w1Used(),dprDropped:W1.dropped,webkit:P107S.webkit,canvases:cs,cssAnims:an.length,animOn:Object.entries(names).slice(0,20),
      boardDraws:W4.draws,drawsPerFrame:+(W4.draws/fr).toFixed(2),drawnPerFrame:+(Object.values(W4.di).reduce((s,v)=>s+v,0)/fr).toFixed(1),
      drawnKinds:Object.fromEntries(Object.entries(W4.di).map(([k,v])=>[k,+(v/Math.max(1,W4.draws)).toFixed(1)])),tw:W4.tw,boardSizes:W4.cvs,sugTile:!!(S&&S.sugTile)};
    o.p107s={...P107S.st}}catch(e){o.extraErr=String(e)}return o}

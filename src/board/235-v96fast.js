/* =========================================================
   235-v96fast — FAST THAT FLOWS (v0.96 follow-up). Display only: rules, dice, log, S and the online hash are untouched.
   1 FRAME PACING: 232-v96board item 9 ran a Fast move (movePlayer / npcWalk) with SPEEDMUL.fast = 0 — the whole step chain was one
     long task, the browser could not present a frame and the piece teleported. Now, at Fast, each step's sleep() waits ONE animation
     frame (02-data SLEEP_HOOK → pace96Frame: requestAnimationFrame, a setTimeout fallback when the tab is hidden or rAF stalls), and the
     board draws asked for during the step are folded into that frame (one draw a frame) — the piece glides tile by tile and a 4-tile
     move takes ~4 frames. Pause holds (sleep's own pause poll runs first), a speed change mid-move takes effect at the next step.
     Never in HEADLESS / sims / snap (fast96 says no) nor online (S.onl keeps 232's batch, lockstep timing unchanged).
     Kill switch localStorage flavius_pace96off=1 → 232's jump.
   2 DRAW COALESCING at Fast while a CPU acts (230's p95Defer: offline, no window, no input in 400 ms): draw() calls between frames are
     folded into one requestAnimationFrame draw (render's deferred path called draw() on top of the step draws: ~2 draws a frame).
   3 TILES LAYER CACHE: the 'tiles' layer (169 tiles: fill, grain, shade, scars, seams, grid; ~40% of a board draw) is painted once into
     an offscreen canvas keyed by everything it reads (canvas size + transform, the iso projection = camera / zoom / pan / ROT89, theme
     tile colours, the event state object, the round's zone, beast zones, the arena's scars, sand settings, light board) and blitted after.
     A changed key (the camera easing) repaints it the same way that frame, so a moving and a still board never differ by a pixel.
     Naumachia, chariots and the Event Designer always paint directly. Kill switch localStorage flavius_tiles96off=1.
     Equality vs the switch off: painted on a clear canvas then composited, so anti-aliased pixels (tile seams, the board's outer edge)
     may differ by ±1-2 levels (8-bit rounding of the blend; ~0.2% of the values); fully covered pixels are identical (tv96f measures it).
   ========================================================= */
const PACE96={on:true,coal:true,depth:0,dirty:0,moves:0,frames:0,draws:0,coalesced:0,raf:0,base:null,at:0,maxStep:0};
try{PACE96.on=localStorage.getItem('flavius_pace96off')!=='1';PACE96.coal=PACE96.on}catch(e){}
const pace96=()=>PACE96.on&&typeof fast96==='function'&&fast96()&&!(S&&S.onl);
/* pace96Frame — resolves at the next animation frame, after drawing the board once if a step asked for it */
function pace96Frame(){return new Promise(res=>{let done=false;
  const go=()=>{if(done)return;done=true;PACE96.frames++;PACE96.at=performance.now();
    if(PACE96.dirty&&!document.hidden){PACE96.dirty=0;PACE96.draws++;try{PACE96.base()}catch(e){console.error(e)}}res()};
  if(document.hidden){setTimeout(go,0);return}
  requestAnimationFrame(go);setTimeout(go,100) /* TWEAK: rAF stalled (background, throttled) → go on anyway */})}
/* maxStep (tests): the longest stretch a move ran without yielding — from a frame (or the move's start) to its next wait */
SLEEP_HOOK=ms=>{if(!PACE96.depth||HEADLESS||SPEED!=='fast')return null;if(PACE96.at)PACE96.maxStep=Math.max(PACE96.maxStep,performance.now()-PACE96.at);return pace96Frame()};
{const base=fast96Batch;fast96Batch=async function(fn){if(!pace96())return base.apply(this,arguments);if(PACE96.depth)return fn();
  PACE96.depth++;PACE96.moves++;PACE96.at=performance.now();
  try{return await fn()}finally{PACE96.depth--;if(!PACE96.depth&&PACE96.at)PACE96.maxStep=Math.max(PACE96.maxStep,performance.now()-PACE96.at);if(!PACE96.depth)PACE96.at=0;if(!PACE96.depth&&PACE96.dirty){PACE96.dirty=0;PACE96.draws++;try{PACE96.base()}catch(e){console.error(e)}}}}}
function coal96(){try{return PACE96.coal&&!HEADLESS&&SPEED==='fast'&&typeof p95Defer==='function'&&p95Defer()}catch(e){return false}}
{const base=draw;PACE96.base=function(){return base.apply(this,arguments)};
  draw=function(){
    if(PACE96.depth&&SPEED==='fast'&&!(typeof CUR_MODAL!=='undefined'&&CUR_MODAL)){PACE96.dirty=1;return}
    if(coal96()){PACE96.coalesced++;if(!PACE96.raf)PACE96.raf=requestAnimationFrame(()=>{PACE96.raf=0;if(PACE96.depth&&PACE96.dirty)return;try{base()}catch(e){console.error(e)}});return}
    if(PACE96.raf){cancelAnimationFrame(PACE96.raf);PACE96.raf=0}
    return base.apply(this,arguments)}}

/* ---------------- 3 · the tiles layer cache ---------------- */
const TILES96={on:true,key:null,last:null,cv:null,tmp:null,st:null,hits:0,builds:0,direct:0,ids:new WeakMap(),nid:0};
try{TILES96.on=localStorage.getItem('flavius_tiles96off')!=='1'}catch(e){}
function tiles96Sid(o){if(!o||typeof o!=='object')return 0;let v=TILES96.ids.get(o);if(!v){v=++TILES96.nid;TILES96.ids.set(o,v)}return v}
function tiles96Key(){const t=ctx.getTransform(),a=iso(0,0),b=iso(0,1),c=iso(1,0),f=v=>Math.round(v*1000)/1000;const z=[];
  for(const n of S.npcs)if(n.zone&&n.alive&&n.tamedBy==null)z.push(n.t+':'+n.zone.join(','));
  return [cv.width,cv.height,f(t.a),f(t.b),f(t.c),f(t.d),f(t.e),f(t.f),f(a.x),f(a.y),f(b.x),f(b.y),f(c.x),f(c.y),f(TW),f(TH),N,
    TB.tileA,TB.tileB,TB.outZone,TB.grid,tiles96Sid(S),S.loc,S.locKey,RD().zone,S.zoneFull?1:0,z.join(';'),
    typeof SAND83!=='undefined'?SAND83.grain+','+SAND83.shade:'',typeof SCAR83!=='undefined'?SCAR83.share+','+SCAR83.alpha:'',
    typeof AR91!=='undefined'?AR91.z:'',typeof ROT89!=='undefined'?ROT89.k:0,typeof lite84On==='function'&&lite84On()?1:0].join('|')}
function tiles96Can(c,w,h){if(!c)c=document.createElement('canvas');if(c.width!==w||c.height!==h){c.width=w;c.height=h}return c}
/* tiles96Paint — paint-or-reuse wrapper of draw()'s own 'tiles' paint */
function tiles96Paint(paint){const T=TILES96;
  try{if(!T.on||HEADLESS||!S||(typeof isNaum==='function'&&isNaum())||(typeof isChariot==='function'&&isChariot())||S.ed94){T.key=T.last=null;return paint()}}catch(e){return paint()}
  let key;try{key=tiles96Key()}catch(e){T.key=T.last=null;return paint()}
  const W=cv.width,H=cv.height;
  if(key===T.key&&T.cv){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.drawImage(T.cv,0,0);ctx.restore();
    const s=T.st;if(s){ctx.fillStyle=s.fs;ctx.strokeStyle=s.ss;ctx.lineWidth=s.lw}tilePath(N-1,N-1);T.hits++;T.last=key;return}
  if(key!==T.last)T.direct++; /* the camera is moving: rebuilt every frame (never reused), painted the same way so frames match */
  T.tmp=tiles96Can(T.tmp,W,H);T.cv=tiles96Can(T.cv,W,H);const tg=T.tmp.getContext('2d'),cg=T.cv.getContext('2d');
  ctx.save();ctx.setTransform(1,0,0,1,0,0);tg.setTransform(1,0,0,1,0,0);tg.clearRect(0,0,W,H);tg.drawImage(cv,0,0);ctx.clearRect(0,0,W,H);ctx.restore();
  try{paint()}finally{T.st={fs:ctx.fillStyle,ss:ctx.strokeStyle,lw:ctx.lineWidth};
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    cg.setTransform(1,0,0,1,0,0);cg.clearRect(0,0,W,H);cg.drawImage(cv,0,0);
    ctx.clearRect(0,0,W,H);ctx.drawImage(T.tmp,0,0);ctx.drawImage(T.cv,0,0);ctx.restore()}
  T.key=key;T.last=key;T.builds++}
{const base=drawLayers93;drawLayers93=function(layers){
  if(TILES96.on&&Array.isArray(layers))layers=layers.map(l=>l&&l[0]==='tiles'?['tiles',()=>tiles96Paint(l[1])]:l);
  return base.call(this,layers)}}


/* ---------------- 4 · tile corners on whole device pixels (his note: seams flicker while zooming) ---------------- */
/* At a fractional zoom every tile corner sat between pixels, so the grid line between two tiles was drawn 1 px crisp in one frame and
   2 px half-strength the next, and the anti-aliased tile edges (fill, grain, shade, the 210 seam stroke) changed with it — the seams
   shimmered as the camera scaled. tilePath now puts its four corners on whole device pixels (through the current transform, when it
   is unrotated); neighbours compute the same corners, so they still meet exactly. Used by every layer that traces a tile (tiles,
   highlights, zones, floor marks), so they all stay aligned. Kill switch localStorage flavius_snap96off=1. */
const SNAP96={on:true};
try{SNAP96.on=localStorage.getItem('flavius_snap96off')!=='1'}catch(e){}
{const base=tilePath;tilePath=function(r,c,inset=0){if(!SNAP96.on||HEADLESS)return base.apply(this,arguments);
  const t=ctx.getTransform();if(t.b||t.c||!t.a||!t.d)return base.apply(this,arguments);
  const {x,y}=iso(r,c);const w=TW/2-inset,h=TH/2-inset/2,cx=x,cy=y+TH/2;
  const X=v=>(Math.round(t.a*v+t.e)-t.e)/t.a,Y=v=>(Math.round(t.d*v+t.f)-t.f)/t.d;
  ctx.beginPath();ctx.moveTo(X(cx),Y(cy-h));ctx.lineTo(X(cx+w),Y(cy));ctx.lineTo(X(cx),Y(cy+h));ctx.lineTo(X(cx-w),Y(cy));ctx.closePath()}}
/* the grid line between tiles: a 1 px anti-aliased diagonal is one crisp dark pixel at one zoom and two half-dark pixels at the next;
   drawn GRID96.w wide at GRID96.a of its strength it carries the same ink but never thins out (07-ui reads GRID96). Same kill switch. */
const GRID96={on:SNAP96.on,w:1.6,a:0.66}; /* TWEAK: width (px) and strength (keep w × a ≈ 1) */

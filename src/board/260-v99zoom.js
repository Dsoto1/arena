/* =========================================================
   260-v99zoom — v0.99 ZOOMED IN, SMOOTH AND STEADY (his two notes). Display only: rules, dice, S and the online hash are untouched.
   MEASURED BEFORE (all-CPU Democritus 1440x900, Normal, 8 s): unzoomed 33 fps · draw 4.7 ms · tiles layer 0.06 ms (cache hit);
     zoomed x1.8 11-14 fps · p50 frame 48-69 ms · p95 170-230 ms · draw 27-33 ms · tiles layer 22 ms — ~140 tiles rebuilds in 170 draws.
   1 CHOPPY — ROOT CAUSES and fixes:
     a 235's tiles cache (TILES96) is keyed by the iso projection, which holds the board origin OX/OY. Zoomed in, the follow camera (86
       camFocus) eases toward whoever acts, so OX/OY change nearly every frame → the 169 tiles (fill, grain, shade, scars, seam stroke,
       grid) were repainted every frame. FIX: zoomed, the tiles layer is painted ONCE for the whole board in its own frame (origin on whole
       device pixels, board + margin) and each frame only slides it by the camera offset (whole device pixels — 86/208 round the zoomed
       origin). Rebuilt only when what it shows changes (zoom, size, theme, zones, state…), never for the camera; while the zoom itself
       eases (duel lean-in, pen camera) frames paint directly (235's path) until it holds. 07-ui's ctx is a const, so the board frame is
       painted on the board canvas itself in screen-sized passes (origin moved per pass, each pass copied out as a chunk), inside one task.
     b Blitting big cached CANVASES (these tiles, 192's padded stone layers, 194's wear layer) made Chrome's next flush of the board (the
       corpses' filter, Flavius's box) 8-20 ms dearer every frame once the image bytes drawn in a frame passed a budget (zoomed: the
       padded layers and the board-sized wear layer). FIX (z99Put): those layers are blitted as ImageBitmap PIECES (Z99.part² px) cut once
       per key (after Z99.uses blits of that key), only the on-screen part of each.
     c Zoomed, the follow camera asks for a draw every frame on top of the step / render draws (~1.5 draws a frame): while a CPU acts at
       Normal/Slow a second draw in one frame is folded into the next animation frame (Fast has 235's coalescing).
   2 SEAMS FLICKER — ROOT CAUSE: each frame's tiles were a fresh paint, and 235's SNAP96 rounded every tile corner on its ABSOLUTE device
     position — corners on half pixels (TW x zoom gives exact halves) rounded up in one frame and down in the next as float noise from the
     moving origin flipped the tie: neighbouring seams jumped 1 px against each other; the rim's big polygons are clipped by the canvas
     edge and their edges anti-aliased differently as the board moved. FIX: the cached layer is the same pixels slid by whole pixels;
     zoomed, corners round on their offset from the board origin with a fixed tie bias; with the stands off the rim rides in the tiles
     cache (with the stands on they cover its edges, and it is painted with snapped corners).
   3 Reduce motion: the follow camera jumps to the acting gladiator instead of easing.
   Kill switch localStorage flavius_zoom99off=1 (235's per-frame paint, absolute snapping, canvas blits). Stats Z99.stats (tv99z).
   ========================================================= */
const Z99={ch:[],part:256 /* TWEAK: ImageBitmap piece side (px) */,uses:3 /* TWEAK: blits of one key before it is cut */,bmOn:true /* tests: false = blit the canvases themselves */,on:true,cache:true /* tests: false = snapping only, no board-frame cache */,cv:null,tmp:null,key:null,rox:0,roy:0,st:null,tw:null,twPrev:null,maxPx:24e6,
  stats:{builds:0,hits:0,direct:0,fallback:0,lastMs:0,bitmaps:0}};
try{Z99.on=localStorage.getItem('flavius_zoom99off')!=='1'}catch(e){}
const z99Zoomed=()=>typeof AR91!=='undefined'&&(AR91.z||1)>1.001;
/* whole device pixel origin under a pure scale transform (the zoomed draw rounds OX/OY to device pixels) */
function z99Whole(t){if(t.b||t.c||!t.a||!t.d)return false;const bx=t.a*OX+t.e,by=t.d*OY+t.f;return Math.abs(bx-Math.round(bx))<1e-6&&Math.abs(by-Math.round(by))<1e-6}
function z99Use(){try{if(!Z99.on||HEADLESS||!S||!TILES96.on)return false;if((typeof isNaum==='function'&&isNaum())||(typeof isChariot==='function'&&isChariot())||S.ed94)return false;
  if(!z99Zoomed())return false;const t=ctx.getTransform();return !t.e&&!t.f&&t.a===t.d&&z99Whole(t)}catch(e){return false}}

/* ---- 2 · tile corners rounded on their offset from the board origin (zoomed) ---- */
{const base=tilePath;tilePath=function(r,c,inset=0){
  if(!Z99.on||HEADLESS||typeof SNAP96==='undefined'||!SNAP96.on||!z99Zoomed())return base.apply(this,arguments);
  const t=ctx.getTransform();if(!z99Whole(t))return base.apply(this,arguments);
  const BX=Math.round(t.a*OX+t.e),BY=Math.round(t.d*OY+t.f);
  const {x,y}=iso(r,c);const w=TW/2-inset,h=TH/2-inset/2,cx=x,cy=y+TH/2;
  const X=v=>(BX+Math.round(t.a*(v-OX)+1e-7)-t.e)/t.a,Y=v=>(BY+Math.round(t.d*(v-OY)+1e-7)-t.f)/t.d; /* TWEAK: the tie bias */
  ctx.beginPath();ctx.moveTo(X(cx),Y(cy-h));ctx.lineTo(X(cx+w),Y(cy));ctx.lineTo(X(cx),Y(cy+h));ctx.lineTo(X(cx-w),Y(cy));ctx.closePath()}}

/* ---- 1 · the zoomed tiles layer in the board's own frame ---- */
const Z99_ST=['fillStyle','strokeStyle','lineWidth','globalAlpha','globalCompositeOperation','font','textAlign','textBaseline','lineCap','lineJoin','miterLimit',
  'imageSmoothingEnabled','shadowBlur','shadowColor','shadowOffsetX','shadowOffsetY','lineDashOffset','filter'];
function z99Save(){const o={t:ctx.getTransform(),dash:ctx.getLineDash()};for(const k of Z99_ST)o[k]=ctx[k];return o}
function z99Restore(o){ctx.setTransform(o.t);ctx.setLineDash(o.dash);for(const k of Z99_ST)try{ctx[k]=o[k]}catch(e){}}
/* the key: 235's key with the board origin taken out (the camera never rebuilds) */
function z99Key(){const ox=OX,oy=OY;OX=0;OY=0;try{return tiles96Key()+'|'+(window.devicePixelRatio||1)+'|'+(Z99.rimIn?'rim:'+TB.rim:'')}finally{OX=ox;OY=oy}}
/* blit only the part of a board-frame canvas that lands on the screen (identity transform; whole device pixels) */
function z99Draw(src,dx,dy){const x0=Math.max(0,-dx),y0=Math.max(0,-dy),x1=Math.min(src.width,cv.width-dx),y1=Math.min(src.height,cv.height-dy);
  if(x1>x0&&y1>y0)ctx.drawImage(src,x0,y0,x1-x0,y1-y0,dx+x0,dy+y0,x1-x0,y1-y0)}
/* z99Put — blit a cached canvas holder {cv,key} unscaled at whole device pixels (identity transform), as ImageBitmap PIECES of at most
   Z99.part² pixels once they are ready. Blitting the cached canvases themselves made Chrome's next flush of the board (the corpses' filter,
   Flavius's box) 8-20 ms dearer every frame zoomed (the tiles, 192's padded stone layers, 194's wear layer — and a single big ImageBitmap of
   the 2 M-pixel wear layer at x2.2 still cost ~8 ms); small finished pictures cost a plain copy. The pieces are cut once per key (async —
   the canvas itself is blitted until they land); a new key drops them. */
function z99Bits(h){const c=h&&h.cv;if(!c||!Z99.on||!Z99.bmOn||typeof createImageBitmap!=='function'||h.key==null)return null;
  const B=h._b99;if(B&&B.k===h.key&&B.c===c&&B.w===c.width&&B.h===c.height)return B.ready?B.parts:null;
  /* only a picture that stays: cut once the same key has been blitted Z99.uses times (192's stone layers re-key as the camera travels) */
  const U=h._b99u&&h._b99u.k===h.key&&h._b99u.c===c?h._b99u:(h._b99u={k:h.key,c,n:0});if(++U.n<Z99.uses)return null;
  z99Drop(h);const k=h.key,W=c.width,H=c.height,P=Z99.part,nb={k,c,w:W,h:H,parts:[],ready:false};h._b99=nb;
  /* one copy of the canvas (one read-back), then the pieces cut from that copy */
  try{createImageBitmap(c).then(full=>{if(h._b99!==nb){full.close();return}const jobs=[];
      for(let y=0;y<H;y+=P)for(let x=0;x<W;x+=P)jobs.push(createImageBitmap(full,x,y,Math.min(P,W-x),Math.min(P,H-y)).then(bm=>({bm,x,y})));
      return Promise.all(jobs).then(parts=>{full.close();if(h._b99!==nb){for(const p of parts)p.bm.close();return}nb.parts=parts;nb.ready=true;Z99.stats.bitmaps++})})
    .catch(()=>{if(h._b99===nb)h._b99=null})}catch(e){h._b99=null}
  return null}
function z99Drop(h){const B=h&&h._b99;if(B){for(const p of B.parts)try{p.bm.close()}catch(e){}h._b99=null}}
function z99Put(h,dx,dy){const P=z99Bits(h);if(!P){z99Draw(h.cv,dx,dy);return}for(const p of P)z99Draw(p.bm,dx+p.x,dy+p.y)}
/* z99Img — drawImage(h.cv, x, y, w, h) in the current transform; unscaled (pure scale transform, the canvas drawn at its own pixel size on
   whole device pixels) it goes through z99Put */
function z99Img(h,x,y,w,hh){const c=h.cv,t=ctx.getTransform();
  if(Z99.on&&!t.b&&!t.c&&Math.abs(w*t.a-c.width)<1e-6&&Math.abs(hh*t.d-c.height)<1e-6){const X=x*t.a+t.e,Y=y*t.d+t.f;
    if(Math.abs(X-Math.round(X))<1e-6&&Math.abs(Y-Math.round(Y))<1e-6){ctx.save();ctx.setTransform(1,0,0,1,0,0);z99Put(h,Math.round(X),Math.round(Y));ctx.restore();return}}
  ctx.drawImage(c,x,y,w,hh)}
function z99Blit(){const dpr=ctx.getTransform().a;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';if(ctx.filter!=='none')ctx.filter='none';
  const dx=Math.round((OX-Z99.rox)*dpr),dy=Math.round((OY-Z99.roy)*dpr);for(const c of Z99.ch)z99Put(c,dx+c.x,dy+c.y);ctx.restore();
  const s=Z99.st;if(s){ctx.fillStyle=s.fs;ctx.strokeStyle=s.ss;ctx.lineWidth=s.lw}tilePath(N-1,N-1) /* leave the path where the paint left it */}
function z99Build(paint,key){const t0=performance.now();const st=z99Save();const dpr=st.t.a;const W0=cv.width,H0=cv.height;
  const m=Math.ceil(TW)+24 /* the rim reaches 16 px out and TW×0.35 + 10 down */;const BW=Math.ceil((N*TW+2*m)*dpr),BH=Math.ceil((N*TH+2*m)*dpr);
  if(BW*BH>Z99.maxPx)return false;
  const rox=Math.round((m+N*TW/2)*dpr)/dpr,roy=Math.round(m*dpr)/dpr;
  Z99.tmp=tiles96Can(Z99.tmp,W0,H0);const tg=Z99.tmp.getContext('2d');tg.setTransform(1,0,0,1,0,0);tg.clearRect(0,0,W0,H0);tg.drawImage(cv,0,0);
  const ox=OX,oy=OY;let ok=true;const old=Z99.ch;Z99.ch=[];let n=0;
  /* the board is painted in screen-sized passes on the board canvas itself (07-ui's ctx is a const), each pass with the origin moved so
     that one piece of the board frame lands on the screen, and copied out as a CHUNK. The visible canvas is never resized (resizing it
     to the board's size and back left Chrome's next flushes — a filter, Flavius's box — ~15 ms dearer every frame) */
  try{for(let y=0;y<BH&&ok;y+=H0)for(let x=0;x<BW&&ok;x+=W0){const w=Math.min(W0,BW-x),h=Math.min(H0,BH-y);
      ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W0,H0);z99Restore(st);OX=rox-x/dpr;OY=roy-y/dpr;
      try{if(Z99.rimIn&&Z99.rimPaint)Z99.rimPaint();paint()}catch(e){console.error(e);ok=false}
      Z99.st={fs:ctx.fillStyle,ss:ctx.strokeStyle,lw:ctx.lineWidth};
      const c=old[n]||{cv:null,key:null};n++;c.key=null;c.cv=tiles96Can(c.cv,w,h);c.x=x;c.y=y;const g=c.cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);
      g.drawImage(cv,0,0,w,h,0,0,w,h);Z99.ch.push(c)}}
  finally{OX=ox;OY=oy;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W0,H0);ctx.drawImage(Z99.tmp,0,0);z99Restore(st)}
  Z99.cv=Z99.ch.length?Z99.ch[0].cv:null;Z99.stats.passes=n;
  if(!ok){Z99.key=null;return false}
  for(const c of Z99.ch)c.key=key+'|'+c.x+','+c.y;for(const c of old.slice(n))z99Drop(c);
  Z99.rox=rox;Z99.roy=roy;Z99.key=key;Z99.stats.builds++;Z99.stats.lastMs=performance.now()-t0;return true}
{const base=tiles96Paint;tiles96Paint=function(paint){
  const tw=TW;Z99.twPrev=Z99.tw;Z99.tw=tw;
  /* a rim left to this layer (stands off) is painted here when the cache is not used */
  const rimDirect=()=>{if(Z99.rimIn&&Z99.rimPaint){Z99.rimIn=false;try{z99Rim(Z99.rimPaint)}catch(e){console.error(e)}}};
  if(!Z99.cache||!z99Use()){Z99.key=null;rimDirect();return base.apply(this,arguments)}
  let key;try{key=z99Key()}catch(e){Z99.stats.fallback++;rimDirect();return base.apply(this,arguments)}
  if(key===Z99.key&&Z99.cv){Z99.stats.hits++;return z99Blit()}
  /* the zoom itself is moving (lean-in, pen camera): paint directly until it holds */
  if(Z99.twPrev!==tw){Z99.stats.direct++;rimDirect();return base.apply(this,arguments)}
  if(!z99Build(paint,key)){Z99.stats.fallback++;rimDirect();return base.apply(this,arguments)}
  return z99Blit()}}

/* ---- 2b · the board's rim, zoomed. Its big polygons run off the screen and the rasteriser clips them against the canvas, so a moved board gave
   the rim's edges different anti-aliasing every frame. With the stands on they cover those edges; with the STANDS OFF nothing is painted
   between the rim and the tiles, so the rim goes into the tiles' board-frame cache (painted under them, slid with them: pixel-exact).
   Otherwise it is painted with its corners on whole device pixels from the board origin (a board-sized rim image of its own would add
   to the image bytes of 1b every frame). ---- */
function z99Rim(paint){if(!Z99.on||HEADLESS||!z99Zoomed())return paint();const t=ctx.getTransform();if(!z99Whole(t)||t.a!==t.d)return paint();
  const BX=Math.round(t.a*OX+t.e),BY=Math.round(t.d*OY+t.f);const X=v=>(BX+Math.round(t.a*(v-OX)+1e-7)-t.e)/t.a,Y=v=>(BY+Math.round(t.d*(v-OY)+1e-7)-t.f)/t.d;
  const P=(p,dx,dy)=>({x:X(p.x+dx),y:Y(p.y+dy)});const tA=isoFix(0,0),tB=isoFix(0,N),tC=isoFix(N,N),tD=isoFix(N,0),k=TW*0.35;
  const poly=(pts,fs)=>{ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();ctx.fillStyle=fs;ctx.fill()};
  poly([P(tA,0,-10),P(tB,16,0),P(tC,0,10),P(tD,-16,0)],TB.rim);
  poly([P(tD,-16,0),P(tC,0,10),P(tC,0,10+k),P(tD,-16,k)],shade(TB.rim,-0.3));
  poly([P(tC,0,10),P(tB,16,0),P(tB,16,k),P(tC,0,10+k)],shade(TB.rim,-0.45))}
{const base=drawLayers93;drawLayers93=function(layers){
  Z99.rimIn=false;Z99.rimPaint=null;
  if(Z99.on&&Array.isArray(layers))layers=layers.map(l=>l&&l[0]==='rim'?['rim',()=>{Z99.rimPaint=l[1];
    if(Z99.cache&&!STANDS&&!(typeof LAYERS93!=='undefined'&&LAYERS93.dbg.has('tiles'))&&z99Use()){Z99.rimIn=true;return}z99Rim(l[1])}]:l);
  return base.call(this,layers)}}

/* ---- 1b · one board draw a frame while a CPU acts zoomed in (Normal/Slow): the follow camera asks for a draw every frame while it eases
   (86 CAM.raf) ON TOP of the step / render draws, ~1.5 draws a frame zoomed vs 0.7 unzoomed. A second draw in the same frame is folded
   into the next animation frame (230's p95Defer: offline, a CPU's turn, no window, no input in 400 ms; Fast is 235's) ---- */
const Z99F={inFrame:false,tick:0,raf:0};Z99.stats.coalesced=0;
{const base=draw;
  const run=()=>{Z99F.inFrame=true;if(!Z99F.tick)Z99F.tick=requestAnimationFrame(()=>{Z99F.tick=0;Z99F.inFrame=false});return base()};
  draw=function(){
    if(!Z99.on||HEADLESS||SPEED==='fast'||!z99Zoomed()||!(typeof p95Defer==='function'&&p95Defer())){if(Z99F.raf){cancelAnimationFrame(Z99F.raf);Z99F.raf=0}return base.apply(this,arguments)}
    if(Z99F.inFrame){Z99.stats.coalesced++;if(!Z99F.raf)Z99F.raf=requestAnimationFrame(()=>{Z99F.raf=0;try{run()}catch(e){console.error(e)}});return}
    if(Z99F.raf){cancelAnimationFrame(Z99F.raf);Z99F.raf=0}
    return run()}}

/* ---- 3 · Reduce motion: the follow camera jumps instead of easing ---- */
if(typeof camFocus==='function'){const base=camFocus;camFocus=function(){try{if(Z99.on&&typeof reduceMotion==='function'&&reduceMotion()&&S&&typeof cur==='function'){const p=cur();if(p&&p.r!=null){CAM.fr=p.r;CAM.fc=p.c}}}catch(e){}
  return base.apply(this,arguments)}}
/* 192's stone layers (208's padded reference frame) blit as pieces too — 208's ar91Blit + 219's stats, in one */
if(typeof ar91Blit==='function'){const base=ar91Blit;ar91Blit=function(L,op){if(!Z99.on||!L||!L.cv||typeof AR91==='undefined')return base.apply(this,arguments);
  if(AR91.noStatic&&!op)return;let name=null;for(const k in AR91.L)if(AR91.L[k]===L){name=k;break}
  const LM=typeof LAYERS93!=='undefined'&&LAYERS93.on;if(name&&LM&&LAYERS93.dbg.has(name))return;const t0=performance.now();
  const dpr=window.devicePixelRatio||1;ctx.save();ctx.setTransform(1,0,0,1,0,0);if(op)ctx.globalCompositeOperation=op;
  const dx=-(L.px||0)+(L.ox==null?0:(OX-L.ox)*dpr),dy=-(L.py||0)+(L.oy==null?0:(OY-L.oy)*dpr);z99Put(L,Math.round(dx),Math.round(dy));ctx.restore();
  if(name&&LM)layers93C(name).blitMs=performance.now()-t0}}

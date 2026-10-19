/* =====================================================================
   401-v107perf — v1.07 FRAME RATE IN MATCHES, ZOOMED AND NOT (his v1.07 beta-1 note 2: "fix the frame rate, especially when zoomed";
   CLAUDE.md frame target ≈16 ms laptop / 30+ fps phone). DISPLAY ONLY: rules, dice (RNG), S, the log, saves and the online hash are
   untouched — nothing here calls rand() or sends anything. Method + numbers: tools/plans/v107/PERF.md (tools/bench/live.js).
   • P1 SHEET ROWS DECODED OFF THE MAIN THREAD. 311's an100Bm cut each action's rows with createImageBitmap(<img>, rect): Chrome decodes
     the WHOLE sheet synchronously on the main thread for an <img> source — 100–150 ms a call (measured: 3–5 a 6-s window of live play in
     every config, ≈ 500 ms, the worst frames of the match; the v1.06 light pass asks first, so it was booked there). Now the sheet's
     bytes are fetched once (the HTTP cache / the share build's data URI) and the rows are cut with createImageBitmap(Blob, rect), which
     decodes on a worker thread; the same pixels, the same "decoding: idle / still meanwhile" path. file:// (no fetch) or a failed fetch
     → 311's own path. 311's an100Trim lets the bytes go with the rows.
   • P2 THE v1.06 LIGHT PASS, CHEAPER TO RASTERISE (399 split out l106DrawStatic / l106DrawFigs for this): the static shadow layer is drawn
     1:1 on whole device pixels (≤ ½ px shift — a soft shadow) and only its pieces that hold pixels (399 now keeps the rects it painted);
     the highlight lift's anti-aliased clip is cut to the pieces / figure shadows that touch a highlighted tile (399's clip was a huge evenodd
     rect = a whole-canvas mask, twice for the layer and twice for the figures, every frame a tile was highlighted). A layer made while the
     zoom eased (another size inside 399's 3% step) is rebuilt once the zoom holds.
   • P3 READ-BACK CELLS IN MEMORY: canvases made by 346's sharpened cells (up-scaled: zoomed / 2× screens), 321 / 334 / 346 / 398's base
     clean-ups and 396's outline get {willReadFrequently:true} — on a GPU-drawn page each getImageData of a GPU canvas waited for the GPU.
   • P4 the #fx95 number overlay is not cleared again while blank (no whole-canvas re-upload every frame).
   • P5 312's bst100Live reads the board's offsetParent (a layout) once an animation frame instead of on every beast tick.
   Kill switch: localStorage flavius_v107perfoff=1 (every item back to the v1.07 beta-1 path). Stats P107.st. Test tv107p.
   ===================================================================== */
const P107={off:(()=>{try{return localStorage.getItem('flavius_v107perfoff')==='1'}catch(e){return false}})(),
  blob:new Map(),chunk:128 /* TWEAK: device px a piece of the static light layer */,noStatic:false,
  st:{bm:0,blob:0,blobFail:0,fallback:0,static:0,staticScaled:0,rebuild:0,pieces:0,figClip:0}};
/* the sheet's bytes: Blob when fetched, null while fetching, false when they cannot be fetched (file://, offline, error) */
function p107Blob(url){if(!url)return false;let e=P107.blob.get(url);if(e)return e.b;e={b:null};P107.blob.set(url,e);
  if(typeof fetch!=='function'||/^file:/i.test(url)||(location&&location.protocol==='file:'&&!/^(data|blob):/i.test(url))){e.b=false;return false}
  fetch(url).then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.blob()}).then(b=>{e.b=b;P107.st.blob++;try{an100Kick(true)}catch(x){}},
    ()=>{e.b=false;P107.st.blobFail++;try{an100Kick(true)}catch(x){}});
  return null}
/* ---------- P1 · 311's rows from the bytes, off the main thread ---------- */
if(!P107.off&&typeof an100Bm==='function'){const base=an100Bm;an100Bm=function(s,set,name){
  try{const o=s&&s[set];if(HEADLESS||!o||!o.meta||!o.meta.rows[name]||o.bm[name]||!s.cls||typeof createImageBitmap!=='function')return base.apply(this,arguments);
    const src=an100Sheet(s,set);if(!src)return null;   /* the sheet is still loading: 311 answers null too */
    if(typeof HTMLImageElement==='undefined'||!(src instanceof HTMLImageElement))return base.apply(this,arguments);
    const url=src.currentSrc||src.src,bl=p107Blob(url);if(bl===false){P107.st.fallback++;return base.apply(this,arguments)}if(!bl)return null;
    const R=o.meta.rows[name],y0=R[0][0],y1=R[R.length-1][0]+R[R.length-1][2],w=Math.max(...R.map(r=>r[1]*8));
    o.bm[name]=1;
    createImageBitmap(bl,0,y0,w,y1-y0).then(bm=>{if(o.bm[name]!==1){try{bm.close()}catch(x){}return}o.bm[name]={bm,y0};AN100.stats.bm++;P107.st.bm++;an100Kick(true)},
      ()=>{if(o.bm[name]===1)delete o.bm[name];const e=P107.blob.get(url);if(e)e.b=false;P107.st.blobFail++;an100Kick(true)});
    return null}catch(e){return base.apply(this,arguments)}}}
if(!P107.off&&typeof an100Trim==='function'){const base=an100Trim;an100Trim=function(){const r=base.apply(this,arguments);try{for(const [k,e] of P107.blob)if(e.b)P107.blob.delete(k)}catch(e){}return r}}
/* ---------- P2 · the v1.06 light pass: the static layer in aligned pieces, the lift clip kept small ---------- */
/* the layer's pieces that hold pixels (399 keeps the rects it painted, device px): a grid of P107.chunk², runs on a row merged */
function p107Chunks(Ly){if(Ly.p107)return Ly.p107;const c=Ly.c,CS=P107.chunk,nx=Math.ceil(c.width/CS),ny=Math.ceil(c.height/CS),on=new Uint8Array(nx*ny);
  for(const [x,y,w,h] of Ly.rects){const i0=Math.max(0,Math.floor((x-3)/CS)),i1=Math.min(nx-1,Math.floor((x+w+3)/CS)),j0=Math.max(0,Math.floor((y-3)/CS)),j1=Math.min(ny-1,Math.floor((y+h+3)/CS));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)on[j*nx+i]=1}
  const L=[];for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){if(!on[j*nx+i])continue;let k=i;while(k+1<nx&&on[j*nx+k+1])k++;
    const x=i*CS,y=j*CS;L.push([x,y,Math.min(c.width,(k+1)*CS)-x,Math.min(c.height,(j+1)*CS)-y]);i=k}
  return Ly.p107={L,area:L.reduce((s,r)=>s+r[2]*r[3],0)/(c.width*c.height)}}
/* the highlight lift (399 l106Lifted) for a list of device-px pieces: drawn outside the tiles at full strength, inside at (1 − lift), the clip
   first cut to the pieces' bounding box (an anti-aliased clip makes a mask the size of its bounds: 399's huge evenodd rect made it the whole canvas,
   twice a pass) */
function p107Lift(t,hp,items,draw,a1,a2){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const it of items){x0=Math.min(x0,it[0]);y0=Math.min(y0,it[1]);x1=Math.max(x1,it[0]+it[2]);y1=Math.max(y1,it[1]+it[3])}
  x0=Math.floor(x0)-1;y0=Math.floor(y0)-1;x1=Math.ceil(x1)+1;y1=Math.ceil(y1)+1;if(x1<=x0||y1<=y0)return;
  const Wd=cv.width*4+TW*40;const out=new Path2D();out.rect(-Wd,-Wd,Wd*3,Wd*3);out.addPath(hp.p);
  for(const inside of [false,true]){ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.beginPath();ctx.rect(x0,y0,x1-x0,y1-y0);ctx.clip();ctx.setTransform(t);
    if(inside)ctx.clip(hp.p);else ctx.clip(out,'evenodd');ctx.globalAlpha=inside?a2:a1;draw(inside);ctx.restore()}}
if(!P107.off&&typeof l106DrawStatic==='function'){const base=l106DrawStatic;l106DrawStatic=function(Ly,hp){
  if(P107.off||P107.noStatic||!Ly||!Ly.c||!Ly.rects)return base.apply(this,arguments);
  try{const t=ctx.getTransform();if(t.b||t.c||Math.abs(t.a-t.d)>1e-9)return base.apply(this,arguments);const ds=t.a;
    const c0=center(0,0),X=c0.x+Ly.rx*TW,Y=c0.y+Ly.ry*TW,W=Ly.rw*TW;
    if(Math.abs((Ly.ds||0)-ds)>1e-6||Math.abs(W*ds-Ly.c.width)>1.5){P107.st.staticScaled++;
      /* built for another size inside 399's 3% step (it was made while the zoom eased): once the zoom holds, have it rebuilt at this size */
      if(!(typeof zoom103Moving==='function'&&zoom103Moving())&&L106.layer===Ly){L106.layer=null;P107.st.rebuild++;try{requestAnimationFrame(()=>{try{if(S&&!HEADLESS)draw()}catch(e){}})}catch(e){}}
      return base.apply(this,arguments)}   /* this frame: 399's scaled draw */
    const DX=Math.round(X*ds+t.e),DY=Math.round(Y*ds+t.f),K=p107Chunks(Ly).L,cw=cv.width,ch=cv.height;
    const hb=hp?[hp.b[0]*ds+t.e-2,hp.b[1]*ds+t.f-2,hp.b[2]*ds+t.e+2,hp.b[3]*ds+t.f+2]:null;const inner=[];
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;
    for(const [sx,sy,w,h] of K){const dx=DX+sx,dy=DY+sy;if(dx>=cw||dy>=ch||dx+w<=0||dy+h<=0)continue;
      if(hb&&dx<hb[2]&&dx+w>hb[0]&&dy<hb[3]&&dy+h>hb[1]){inner.push([dx,dy,w,h,sx,sy]);continue}
      ctx.drawImage(Ly.c,sx,sy,w,h,dx,dy,w,h);P107.st.pieces++}
    ctx.restore();
    if(inner.length)p107Lift(t,hp,inner,()=>{ctx.setTransform(1,0,0,1,0,0);for(const [dx,dy,w,h,sx,sy] of inner)ctx.drawImage(Ly.c,sx,sy,w,h,dx,dy,w,h);P107.st.pieces+=inner.length},1,1-LIGHT106.hlLift);
    if(!hp)ctx.globalAlpha=1;   /* 399 leaves the alpha at 1 when nothing is highlighted (the contacts below read it) */
    P107.st.static++}catch(e){console.error(e)}}}
/* the figure + beast shadows: only the ones touching a highlighted tile go through the clip */
if(!P107.off&&typeof l106DrawFigs==='function'){const base=l106DrawFigs;l106DrawFigs=function(ops,hp,L){if(P107.off||!hp)return base.apply(this,arguments);
  try{const t=ctx.getTransform();if(t.b||t.c)return base.apply(this,arguments);const b=hp.b,near=[],dev=[];
    ctx.save();ctx.globalAlpha=L.cast;for(const op of ops){if(l106Hit(op[1],op[2],op[3],op[4],b)){near.push(op);dev.push([op[1]*t.a+t.e,op[2]*t.d+t.f,op[3]*t.a,op[4]*t.d])}else ctx.drawImage(...op)}ctx.restore();
    if(near.length)p107Lift(t,hp,dev,()=>{for(const op of near)ctx.drawImage(...op)},L.cast,(1-LIGHT106.hlLift)*L.cast);P107.st.figClip+=near.length}catch(e){console.error(e)}}}
/* ---------- P3 · cells whose pixels are read back stay in memory (no GPU read-back stall) ---------- */
/* 346's unsharp mask (an up-scaled cell: zoomed or a 2× screen), 321's / 334's / 346's / 398's base clean-ups and 396's outline read a cell's
   pixels (getImageData) right after painting it. On a GPU-drawn page a canvas that size lives on the GPU, so every read waits for the GPU to
   finish everything queued (measured with Chromium's GPU path on SwiftShader, desk zoom 2: 3 sharpens 2.3 s). A canvas made inside these
   functions gets {willReadFrequently:true} (kept in memory: the read is a copy, the board uploads the finished cell once) — the same pixels. */
P107.wrf=0;P107.st.wrf=0;
if(!P107.off&&typeof HTMLCanvasElement!=='undefined'){const gc=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,opt){if(P107.wrf>0&&type==='2d'&&opt==null){P107.st.wrf++;return gc.call(this,type,{willReadFrequently:true})}return gc.apply(this,arguments)};
  const mk=(base,when)=>function(){if(P107.off||(when&&!when.apply(this,arguments)))return base.apply(this,arguments);P107.wrf++;try{return base.apply(this,arguments)}finally{P107.wrf--}};
  const sharpens=up=>typeof V103C!=='undefined'&&!V103C.off&&up>V103C.sharpMin;const dsN=()=>{try{return typeof ds103==='function'?ds103():1}catch(e){return 1}};
  const W={an100CellCanvas:(im,k,fx,sy,w,h,s)=>sharpens(s*dsN()),bst100CellCanvas:(im,me,f,r,s)=>sharpens(s*dsN()),g6Scaled:(pc,me,s)=>sharpens(s*dsN()),b103Scaled:(pc,me,s)=>sharpens(s*dsN()),
    bs101Proc:(img,sx,sy,sw,sh,f,ax,ay,ppm,mode)=>mode===2,g6Proc:null,b103Proc:null,b103Wall:null,aim106Outline:null};
  for(const nm in W){try{const base=(0,eval)(nm);if(typeof base!=='function')continue;window.__p107w=mk(base,W[nm]);(0,eval)(nm+'=window.__p107w');window.__p107w=null}catch(e){}}}
/* ---------- P5 · one layout read a frame for 312's "is the board shown?" ---------- */
/* bst100Live asked cv.offsetParent on every beast tick / schedule / draw: a forced layout each time the panels had just changed (render()).
   The answer is kept for the current animation frame (document.timeline.currentTime); the rest of 312's test is unchanged. */
if(!P107.off&&typeof bst100Live==='function'&&typeof BST100!=='undefined'){const base=bst100Live;const V={t:-1,v:false};
  const shown=()=>{const t=document.timeline&&document.timeline.currentTime;if(t!=null&&t===V.t)return V.v;const c=document.getElementById('cv');V.v=!!(c&&c.offsetParent);V.t=t==null?-1:t;return V.v};
  bst100Live=function(){if(P107.off)return base.apply(this,arguments);try{if(!BST100.on||HEADLESS||!S||S.sim||S.ed94||document.hidden)return false;if(!shown())return false;
    if(BST100.ghosts.length||BST100.nets.length||BST100.tosses.length||BST100.puffs.length)return true;return S.npcs.some(n=>n.alive&&!n.out&&BST100.last.has(n.id))}catch(e){return false}}}
/* ---------- P4 · the floating-number overlay (227 #fx95) is not cleared while it is already blank ---------- */
/* 227's drawFX wrapper and 277's h100Paint clear the board-sized overlay on every board draw, numbers or not: the browser then re-uploads /
   re-composites a whole transparent canvas every frame. A clear of a canvas nothing was drawn on since the last full clear is skipped
   (no pixel changes: it is already transparent). */
if(!P107.off&&typeof fx95Cv==='function'){const base=fx95Cv;fx95Cv=function(){const c=base.apply(this,arguments);try{const g=typeof B95!=='undefined'&&B95.fxCx;
    if(c&&g&&!g._p107){g._p107={dirty:true};const D=g._p107;
      for(const m of ['fill','stroke','fillRect','strokeRect','fillText','strokeText','drawImage','putImageData']){const f=g[m];if(typeof f==='function')g[m]=function(){D.dirty=true;return f.apply(this,arguments)}}
      const cr=g.clearRect;g.clearRect=function(x,y,w,h){if(!D.dirty&&!P107.off){P107.st.fxSkip=(P107.st.fxSkip|0)+1;return}const r=cr.apply(this,arguments);
        try{const t=this.getTransform(),cv2=this.canvas;if(!t.b&&!t.c&&x*t.a+t.e<=0&&y*t.d+t.f<=0&&(x+w)*t.a+t.e>=cv2.width&&(y+h)*t.d+t.f>=cv2.height)D.dirty=false}catch(e){}return r}}}catch(e){}return c}}

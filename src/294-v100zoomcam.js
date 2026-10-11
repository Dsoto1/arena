/* =========================================================
   294-v100zoomcam — v1.0 ZOOMED CAMERA WITHOUT HITCHES (his note: the board still stutters zoomed in — the camera following the pieces,
   panning, pinching). Display only: rules, dice, S and the online hash are untouched.
   MEASURED (tools/perf95/zoomab.js: a paused zoomed board, the camera panned along a path one step a frame; zoomlay.js: one repaint):
     draw() zoomed with every layer cached ≈ unzoomed (4-6 ms), but every ~0.18 screen of camera travel 208's stone layers (192: under,
     deco, top, light — padded 20% round the screen) took a NEW reference frame and repainted all four: one draw 2-25× the median
     (100-390 ms on the loaded test box, its first blits then cut fresh ImageBitmap pieces again — 260's z99Put). A turn change sends the
     camera across the board: 3-6 such repaints per trip = the stutter. Pinch / zoom toggles / the duel lean-in repaint all of them (and
     260 paints the tiles directly) every frame while the zoom moves.
   1 ONE REFERENCE PER ZOOM: zoomed by z, the whole arena is exactly z × the unzoomed canvas (draw() fits the arena to it), so the stone
     layers are painted in a frame that holds the WHOLE arena (padding (z−1)/2 + Z100.m round the screen, the reference origin chosen
     so the arena's box fills it, on whole device pixels). The camera only slides it — never a repaint while panning. At FREE_ZOOM 1.4 that is
     (1.4+0.2)² = 2.6 screens a layer (208's 20% padding: 1.96). Above Z100.maxK (z² — pinch to 2.4) the canvases would be too big: 208's margin stays,
     but a new reference is centred on where the camera is GOING (the acting gladiator), not where it is: one repaint per trip.
   2 ZOOM IN MOTION (pinch, 🔍 toggles, the duel lean-in, the pen camera): while TW changes from one frame to the next, the last crisp
     stone layers and 260's tiles chunks are drawn SCALED (no repaint); once the zoom holds for Z100.hold ms the crisp layers are
     painted again (one repaint, as before). Steady frames are pixel-identical to before.
   3 ONE DRAW A FRAME (zoomed, a CPU acting at Normal): the camera's and the effects' rAF draws fell in one frame (1.7 draws a frame);
     a second draw with the same document.timeline time waits for the next frame (230's p95Defer: offline, CPU's turn, no window, no input).
   Kill switch localStorage flavius_zoomcam100off=1. Stats Z100.stats (tv100z).
   ========================================================= */
const Z100={on:true,m:0.1 /* TWEAK: extra margin round the whole arena (screen share): the side stairs reach past the unzoomed canvas */,maxK:2.25 /* TWEAK: z² above which the whole-arena frame is too big (memory: (z+2m)² screens a layer; FREE_ZOOM 1.4 → 2.56) */,
  hold:160 /* TWEAK: ms after the last zoom change before the crisp layers are repainted */,u:null,d:0,n:0,twLast:0,twAt:-9,force:false,st:0,ft:null,fr:0,
  stats:{refs:0,whole:0,dest:0,scaled:0,tscaled:0}};
try{Z100.on=localStorage.getItem('flavius_zoomcam100off')!=='1'}catch(e){}
/* the unzoomed origin of this draw: draw() sets TW/OX/OY unzoomed right before it asks duelCam for the zoom */
{const base=draw;draw=function(){
  /* 3 · one draw a frame: zoomed, while a CPU acts, the follow camera's rAF draw and the effects loop's rAF draw land in the SAME frame
     (measured: 1.7 draws a frame, 50 of 96 frames drew twice) — a second draw in one frame (same document.timeline time) is folded
     into the next frame */
  if(Z100.on&&!HEADLESS&&!Z100.force&&SPEED!=='fast'&&z99Zoomed()&&typeof p95Defer==='function'&&p95Defer()){const ft=document.timeline&&document.timeline.currentTime;
    if(ft!=null){if(ft===Z100.ft){Z100.stats.folded=(Z100.stats.folded||0)+1;if(!Z100.fr)Z100.fr=requestAnimationFrame(()=>{Z100.fr=0;try{draw()}catch(e){console.error(e)}});return}Z100.ft=ft}}
  if(Z100.fr){cancelAnimationFrame(Z100.fr);Z100.fr=0}
  Z100.d=1;Z100.n++;try{return base.apply(this,arguments)}finally{Z100.d=0}}}
{const base=duelCam;duelCam=function(){if(Z100.d===1){Z100.d=2;try{Z100.u={tw:TW,ox:OX,oy:OY}}catch(e){}}return base.apply(this,arguments)}}
/* is the zoom moving? TW changed in this draw or the one before (counted in draws, not ms: a slow frame must not count as "settled");
   the settle draw (Z100.hold ms after the last change) paints crisp */
function z100Moving(){if(Z100.force)return false;if(Math.abs(TW-Z100.twLast)>1e-6){Z100.twLast=TW;Z100.twAt=Z100.n}return Z100.n-Z100.twAt<=1}
function z100Settle(){if(Z100.st)clearTimeout(Z100.st);Z100.st=setTimeout(()=>{Z100.st=0;Z100.force=true;try{if(!HEADLESS&&S)draw()}catch(e){}finally{Z100.force=false}},Z100.hold)}

/* ---- 1 · the stone layers' reference frame ---- */
if(typeof ar92Ref==='function'){const base=ar92Ref;ar92Ref=function(){
  if(!Z100.on||HEADLESS||!ar91Zoomed()||!Z100.u||!Z100.u.tw)return base.apply(this,arguments);
  const dpr=window.devicePixelRatio||1,W=cv.width/dpr,H=cv.height/dpr,z=TW/Z100.u.tw;
  if(z*z<=Z100.maxK){const p=(z-1)/2+Z100.m;const rd=v=>Math.round(v*dpr)/dpr;
    const ox=rd(W/2-z*(W/2-Z100.u.ox)),oy=rd(H/2-z*(H/2-Z100.u.oy));const R=AR92.ref;
    if(R&&R.tw===TW&&R.p===p&&R.w===cv.width&&R.h===cv.height&&R.ox===ox&&R.oy===oy)return R;
    Z100.stats.refs++;Z100.stats.whole++;return (AR92.ref={ox,oy,tw:TW,p,w:cv.width,h:cv.height,id:++AR92.n})}
  /* too far in for the whole arena: 208's margin, a new reference centred on the camera's destination */
  const R0=AR92.ref,r=base.apply(this,arguments);if(r===R0)return r;
  try{const p=r.p,c=typeof cur==='function'?cur():null;if(c&&c.r!=null&&CAM&&CAM.fr!=null){
      const dOX=OX+(c.r-CAM.fr-(c.c-CAM.fc))*TW/2,dOY=OY-((c.c-CAM.fc)+(c.r-CAM.fr))*TH/2;const mx=W*p*0.85,my=H*p*0.85;
      const cl=(v,a,m)=>Math.max(a-m,Math.min(a+m,v));r.ox=Math.round(cl(dOX,OX,mx)*dpr)/dpr;r.oy=Math.round(cl(dOY,OY,my)*dpr)/dpr;Z100.stats.dest++}}catch(e){}
  Z100.stats.refs++;return r}}

/* ---- 2 · zoom in motion: the last crisp layers, scaled ---- */
/* a cached holder {cv,key} drawn scaled by s with its top-left at (dx,dy) device px (identity transform): through 260's ImageBitmap pieces when they
   are cut (a big canvas drawn scaled every frame was the cost: 4-10× an unscaled blit), each piece on whole pixels so no hairline opens */
function z100PutS(h,dx,dy,s){const P=typeof z99Bits==='function'?z99Bits(h):null;
  if(!P){ctx.drawImage(h.cv,dx,dy,h.cv.width*s,h.cv.height*s);return}
  for(const p of P){const x0=Math.round(dx+s*p.x),y0=Math.round(dy+s*p.y),x1=Math.round(dx+s*(p.x+p.bm.width)),y1=Math.round(dy+s*(p.y+p.bm.height));
    if(x1<=0||y1<=0||x0>=cv.width||y0>=cv.height||x1<=x0||y1<=y0)continue;ctx.drawImage(p.bm,x0,y0,x1-x0,y1-y0)}}
function z100Scaled(L){return L&&L.cv&&L.tw&&L.ox!=null&&Math.abs(L.tw-TW)>1e-6}
if(typeof ar91Layer==='function'){const base=ar91Layer;ar91Layer=function(name,key,paint){
  const L=AR91.L[name];
  if(Z100.on&&!HEADLESS&&name!=='sky'&&L&&L.key&&L.key!==key&&L.tw&&L.ox!=null&&z100Moving()){
    /* keep the old picture; its blit scales it (ar91Blit below) */
    const s=TW/L.tw;if(s>0.5&&s<2){if(L.raw){const mx=x=>OX+s*(x-L.pox),my=y=>OY+s*(y-L.poy);L.sx=NaN;
        L.out={fires:L.raw.fires.map(f=>({...f,x:mx(f.x),y:my(f.y),h:f.h*s,w:f.w*s})),walls:L.raw.walls.map(w=>({...w,a:{x:mx(w.a.x),y:my(w.a.y)},b:{x:mx(w.b.x),y:my(w.b.y)}}))}}
      Z100.stats.scaled++;z100Settle();return L}}
  const r=base.apply(this,arguments);if(r&&r.key===key&&name!=='sky'&&r.tw!==TW&&r.pox===OX&&r.poy===OY)r.tw=TW;return r}}
if(typeof ar91Blit==='function'){const base=ar91Blit;ar91Blit=function(L,op){
  if(!Z100.on||!z100Scaled(L))return base.apply(this,arguments);
  if(AR91.noStatic&&!op)return;const dpr=window.devicePixelRatio||1,s=TW/L.tw;ctx.save();ctx.setTransform(1,0,0,1,0,0);if(op)ctx.globalCompositeOperation=op;
  /* layer pixel u ↔ point rel = (u − px)/dpr − ox at the old scale; now at OX + s·rel */
  const dx=dpr*OX-s*((L.px||0)+dpr*L.ox),dy=dpr*OY-s*((L.py||0)+dpr*L.oy);z100PutS(L,dx,dy,s);ctx.restore()}}
/* 260's zoomed tiles: while the zoom moves, the last board-frame chunks scaled instead of a direct repaint of 169 tiles */
if(typeof tiles96Paint==='function'&&typeof Z99!=='undefined'){const base=tiles96Paint;tiles96Paint=function(paint){
  if(!Z100.on||HEADLESS||!Z99.on||!Z99.cache||!Z99.ch.length||!Z99.key||!Z100.tw99||Math.abs(Z100.tw99-TW)<1e-6||!z100Moving()||!z99Zoomed()||
     (typeof isNaum==='function'&&isNaum())||(typeof isChariot==='function'&&isChariot())||S.ed94){const r=base.apply(this,arguments);if(Z99.key&&Z99.key!==Z100.k99){Z100.k99=Z99.key;Z100.tw99=TW;Z100.o99={x:OX,y:OY}}return r}
  /* the chunks were painted with the board origin at (Z99.rox, Z99.roy) in the board frame at Z100.tw99 */
  const s=TW/Z100.tw99;if(!(s>0.5&&s<2))return base.apply(this,arguments);
  const dpr=ctx.getTransform().a;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';if(ctx.filter!=='none')ctx.filter='none';
  for(const c of Z99.ch){const x=dpr*OX+s*(c.x-dpr*Z99.rox),y=dpr*OY+s*(c.y-dpr*Z99.roy);z100PutS(c,x,y,s)}ctx.restore();
  tilePath(N-1,N-1);Z100.stats.tscaled++;z100Settle()}}
/* 194's wear layer (blood trickles, scuffs, stains, settled rubble) is keyed by TW: while the zoom moves, its last bake is drawn scaled
   (rubble still settling is drawn live as before) */
if(typeof wear91Layer==='function'&&typeof WEAR91_C!=='undefined'){const base=wear91Layer;wear91Layer=function(rubble){
  const C=WEAR91_C;
  if(Z100.on&&!HEADLESS&&WEAR91.on&&S&&C.cv&&C.key&&C.tw&&Math.abs(C.tw-TW)>1e-6&&C.sid===sid91()&&z100Moving()){const s=TW/C.tw;
    if(s>0.5&&s<2){const rubs=(rubble||[]).filter(rb=>rb&&rb.r!=null);const live=rubs.filter(settling91);
      if(!live.length){const dpr=ctx.getTransform().a;ctx.save();ctx.setTransform(1,0,0,1,0,0);
        /* the bake's css point (bx, by) sat at bx − ox from the board origin */
        z100PutS(C,Math.round(dpr*(OX+s*(C.bx-C.ox))),Math.round(dpr*(OY+s*(C.by-C.oy))),s*dpr*C.bw/C.cv.width);ctx.restore();Z100.stats.wscaled=(Z100.stats.wscaled||0)+1;z100Settle();return}}}
  const n=WEAR91.bakes;const r=base.apply(this,arguments);if(WEAR91.bakes!==n){C.tw=TW;C.sid=sid91()}return r}}

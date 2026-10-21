/* =====================================================================
   403-v107fix — v1.07 beta-2 fixes (his notes 2026-10-19, tools/plans/v106/NOTES.md last line). DISPLAY ONLY: rules, dice (RNG), S, the
   log, saves and the online hash are untouched — nothing here calls rand() or sends anything.
   • F1 THE AIM OUTLINE HUGS THE FIGURE. 396's aim106Outline ringed the figure's images by drawing them 12 times at R = 2·DPR device px
     from EVERY pixel with any alpha: the 3D cells (311 / 312 / 346 sharpened, up-scaled when zoomed or on 2× screens) carry a soft,
     semi-transparent rim (measured: at zoom 2 / DPR 2 ≈ 4 500 rim pixels of alpha 1–100 round a 24 000-px body), so the red band sat
     2 CSS px beyond the faintest rim pixel and over the figure's own dark ink — a halo a few px too big. Now the silhouette is the
     VISIBLE body (alpha ≥ F107.cut), the band is F107.w CSS px wide (1.5 → 1.5 px at DPR 1, 3 device px at DPR 2, the same at every zoom:
     the cells are already drawn at the zoomed size), 16 taps (+8 inner for wide bands, no gaps at thin limbs), and the body's soft rim
     is punched twice so the ink stays readable through the red. Same cache (key unchanged), same depth slot, same tag anchor (fig.top),
     built once per drawn cell. tv106d / tv106g unchanged.
   • F2 NO BOARD RESIZE WHEN A WINDOW OPENS. modal() puts body.modal-open {overflow:hidden} (no scroll bleed): on a screen with real
     scrollbars (Windows / Linux desktops; headless test browsers hide them, so the benches never saw it) the page's scrollbar vanished,
     the board column grew by its width (955 → 970 px at 1440×900), and every size-keyed board layer, light layer and sharpened cell was
     rebuilt — then again when the window closed. An attack that asks "Raise the shield?" per hit = two full rebuilds a question
     (measured here: 6 board resizes for 3 asks, 133–300 ms frames, 33 fps over the exchange; his laptop: "slowest 415 ms", ~4 fps).
     Now while body.modal-open is on and the page is taller than the window, html gets scrollbar-gutter:stable (html.sg107): the gutter
     stays, the layout width does not change, nothing is rebuilt. No visual change (overlay scrollbars and pages without a scrollbar:
     nothing happens). Verified absent while a prompt is open (the brief's other suspects): no backdrop-filter / blur over the board,
     no box-shadow / filter animation on the window, no board redraw under it (0 draws per frame: modal() pauses the match), no aim /
     tooltip / bubble layout per frame, no render loop.
   • F3 (beta 4) THE OUTLINE FROM WHAT IS REALLY DRAWN: with bases off, 321 draws a base-less cell lower than the call 396 recorded, so
     the ring floated above the figure and took the cut base in (bigger). The figure's NATIVE draw calls are recorded now (see F3 below).
   • F4 (v1.08b, his "zora outline was slightly off") THE OUTLINE FOLLOWS THE SHARPENED CELL: 346 sharpens an up-scaled cell IN PLACE (unsharp mask on RGB
     and alpha) — when the budget is spent or the zoom is easing it draws the cell unsharpened and sharpens it a few frames later, on the SAME canvas. The
     cache key named the canvas, so the ring built from the unsharpened alpha stayed (≈2 % of its pixels off the sharpened body, most on Zora, the biggest
     cell, zoomed / DPR 2). The key now carries the cell's sharpen state (img._sh103), so the ring is rebuilt once when the cell is sharpened.
   Kill switch localStorage flavius_v107fixoff=1 (every item back to the beta-2 path). Stats F107.st. Test tv107f.
   ===================================================================== */
const F107={off:(()=>{try{return localStorage.getItem('flavius_v107fixoff')==='1'}catch(e){return false}})(),
  cut:128 /* TWEAK: alpha that counts as the body's edge */,w:1.5 /* TWEAK: band width in CSS px */,st:{built:0,gutter:0}};
/* ---------- F1 · the outline sprite ---------- */
if(!F107.off&&typeof aim106Outline==='function'){const base=aim106Outline;
  aim106Outline=function(fig){if(F107.off)return base.apply(this,arguments);
    const ops=fig.ops,o0=ops[0].m,dpr=window.devicePixelRatio||1;
    const key=ops.map(o=>[aim106Id(o.img),o.sx,o.sy,o.sw,o.sh,o.dx.toFixed(1),o.dy.toFixed(1),o.dw.toFixed(1),o.dh.toFixed(1),o.m.slice(0,4).map(v=>v.toFixed(3)).join(','),(o.m[4]-o0[4]).toFixed(1),(o.m[5]-o0[5]).toFixed(1),(o0[4]%1).toFixed(1),(o0[5]%1).toFixed(1),o.img._sh103||0].join(':')).join('|')+'#f107';
    let sp=AIM106.oc.get(key);
    if(!sp){const bb=fig.bb,R=Math.max(1.25,F107.w*dpr),pad=Math.ceil(R)+2,w=Math.ceil(bb.x1-bb.x0)+2*pad,h=Math.ceil(bb.y1-bb.y0)+2*pad;if(w<=0||h<=0||w>4096||h>4096)return;
      const ox=Math.floor(bb.x0)-pad,oy=Math.floor(bb.y0)-pad;
      const sil=document.createElement('canvas');sil.width=w;sil.height=h;const g=sil.getContext('2d',{willReadFrequently:true});
      for(const o of ops){g.setTransform(o.m[0],o.m[1],o.m[2],o.m[3],o.m[4]-ox,o.m[5]-oy);try{g.drawImage(o.img,o.sx,o.sy,o.sw,o.sh,o.dx,o.dy,o.dw,o.dh)}catch(e){}}
      g.setTransform(1,0,0,1,0,0);
      /* the visible body: alpha ≥ cut → opaque, the rest → clear (the soft rim no longer widens the ring); the body's real top for the tag */
      const core=document.createElement('canvas');core.width=w;core.height=h;const cg=core.getContext('2d');let ty=0,ok=false;
      try{const D=g.getImageData(0,0,w,h),d=D.data,M=cg.createImageData(w,h),m=M.data;let top=-1;
        for(let i=3,p=0;i<d.length;i+=4,p++){if(d[i]>=F107.cut){m[i-3]=255;m[i]=255;if(top<0)top=(p/w)|0}}
        cg.putImageData(M,0,0);ty=top>=0?top:0;ok=top>=0}catch(e){}
      if(!ok){cg.drawImage(sil,0,0)} /* tainted / empty: the plain images (396's look) */
      const out=document.createElement('canvas');out.width=w;out.height=h;const q=out.getContext('2d');
      const taps=[[R,16]];if(R>2)taps.push([R/2,8]);
      for(const [r,n] of taps)for(let i=0;i<n;i++){const a=i/n*Math.PI*2;q.drawImage(core,Math.cos(a)*r,Math.sin(a)*r)}
      q.globalCompositeOperation='source-in';q.fillStyle='rgba(255,64,44,0.95)';q.fillRect(0,0,w,h);
      q.globalCompositeOperation='destination-out';q.drawImage(core,0,0);q.drawImage(sil,0,0);q.drawImage(sil,0,0);q.globalCompositeOperation='source-over';
      sp={cv:out,ox:ox-o0[4],oy:oy-o0[5],ty};AIM106.oc.set(key,sp);AIM106.stats.built++;F107.st.built++;if(AIM106.oc.size>8)AIM106.oc.delete(AIM106.oc.keys().next().value)}
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=0.9*aim106Pulse();ctx.drawImage(sp.cv,Math.round(o0[4]+sp.ox),Math.round(o0[5]+sp.oy));ctx.restore();
    fig.outlined=true;fig.top=o0[5]+sp.oy+sp.ty}}
/* ---------- F3 · the outline is built from the images REALLY drawn (beta-4 note: the ring floated above the figure, a bit too big) ----------
   396's aim106Rec records each ctx.drawImage of the target figure BEFORE 321's own drawImage patch (bs101Patch) runs; with Settings →
   bases off that patch swaps in the cell with the base cut out (bs101Proc) and draws it BS101.FAM.T·ppm LOWER (the feet on the tile floor,
   v1.02 G6), so the outline was the old cell — base included (a bigger silhouette) — at the old height (it sat up by the base's thickness,
   ≈ 3.5 mm: the head ring above the helmet). Now the native drawImage calls of that figure (BS101.nat, which every patched call ends in)
   are what is recorded: image, source rect, dest rect, transform exactly as drawn this frame (glide / push / hit poses included, they are
   on the transform); a call that never reaches BS101.nat (no 321 patch in place) keeps 396's record. Same cache key (it now names the
   cut cell), same hit test (the body is the drawn one). */
function f107Op(g,A){const img=A[0];if(!img||A.length<3)return null;let sx=0,sy=0,sw,sh,dx,dy,dw,dh;const W=img.width||img.naturalWidth||0,H=img.height||img.naturalHeight||0;
  if(A.length>=9){sx=A[1];sy=A[2];sw=A[3];sh=A[4];dx=A[5];dy=A[6];dw=A[7];dh=A[8]}else if(A.length>=5){sw=W;sh=H;dx=A[1];dy=A[2];dw=A[3];dh=A[4]}else{sw=W;sh=H;dx=A[1];dy=A[2];dw=W;dh=H}
  if(!(sw>0&&sh>0&&dw&&dh))return null;const m=g.getTransform();return {img,sx,sy,sw,sh,dx,dy,dw,dh,m:[m.a,m.b,m.c,m.d,m.e,m.f]}}
if(!F107.off&&typeof aim106Rec==='function'){const base0=aim106Rec;
  aim106Rec=function(base,self,args,u){
    if(F107.off||!AIM106.rec||!u||typeof BS101==='undefined')return base0.apply(this,arguments);
    const k=u.r*N+u.c,h=AIM106.tmap.get(k);if(!h||h.target.ref!==u)return base.apply(self,args);
    if(typeof bs101Patch==='function'&&!AIM106.inRec)try{bs101Patch()}catch(e){}
    const ops=[],prev=ctx.drawImage,nat0=BS101.nat;let depth=0,tap=0;
    if(nat0)BS101.nat=function(){if(depth>0&&this===ctx){try{const o=f107Op(this,arguments);if(o){ops.push(o);tap++}}catch(e){}}return nat0.apply(this,arguments)};
    AIM106.inRec=true;
    ctx.drawImage=function(){let o=null;try{o=f107Op(this,arguments)}catch(e){}const t0=tap;depth++;
      try{return prev.apply(this,arguments)}finally{depth--;if(tap===t0&&o)ops.push(o)}};
    let r;try{r=base.apply(self,args)}finally{ctx.drawImage=prev;if(nat0)BS101.nat=nat0;AIM106.inRec=false}
    AIM106.stats.rec++;F107.st.nat=(F107.st.nat|0)+tap;
    const fig={u,k,ops,bb:aim106BB(ops)};AIM106.figs.push(fig);
    try{const s=aim106Shown();if(s&&s.ref===u&&ops.length)aim106Outline(fig)}catch(e){console.error(e)}
    return r}}
/* ---------- F2 · the scrollbar's gutter stays while a window is open ---------- */
function f107Gutter(){try{const html=document.documentElement,b=document.body;if(!b)return;
  const want=!F107.off&&b.classList.contains('modal-open')&&html.scrollHeight>html.clientHeight+1;
  if(want!==html.classList.contains('sg107')){html.classList.toggle('sg107',want);if(want)F107.st.gutter++}}catch(e){}}
if(!F107.off){
  const st=document.createElement('style');st.textContent='html.sg107{scrollbar-gutter:stable}';document.head.appendChild(st);
  /* the class flips inside modal()'s own task; a MutationObserver answers before the next layout is painted, so the width never changes */
  try{if(document.body&&typeof MutationObserver==='function')new MutationObserver(f107Gutter).observe(document.body,{attributes:true,attributeFilter:['class']})}catch(e){}}

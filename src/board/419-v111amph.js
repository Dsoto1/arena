/* =====================================================================
   419-V111AMPH · v1.11 art PREVIEW — THE AMPHITHEATRE (his concept 2026-10-22; tools/plans/v111/AMPH.md, decisions 11a–14a)
   =====================================================================
   ON since v1.11a (his "release it", 2026-10-22). Kill switch localStorage flavius_amph111off=1 (read once at load): then NOTHING here
   is installed (no wrapper, no image load) — the game is byte-for-byte v1.11's behaviour. (Before v1.11a it was an opt-in preview.)
   DISPLAY ONLY: no rules, no dice, nothing in S, saves or the online hash, no text (no i18n).
   WHAT: the baked 3D surround (tools/art/amph111: three.js, rendered offline at the game's exact 2:1 projection, tile corner (0,0) =
   (OX, OY), one tile = TW) painted FIRST in 192's cached 'under' layer, so the board, its walls/plaques, the inner stands, the live
   spectators and Flavius's banner all lie on top exactly as today. Layers (assets/amph111_*.webp, ~0.5 MB in all, frame in
   assets/amph111.json): stone / bench / cloth are luminance, tinted per arena (13a: the stone = ar91Mat().cap, the benches =
   THEME.standB, the banners = the arena's THEMES99 blood colour) and ADDED ('lighter') with the fixed-colour layer + the flames —
   the bake's alpha is exact coverage (rendered 2×, box-filtered), so the sum has no seams. The composite is cached per arena + size.
   A vignette (darker + less saturated away from the sand) keeps the eye on the board (VISUAL POLISH RULE). NIGHT: 189's grade
   darkens it with everything else; the 'glow' layer (the few braziers' light, black elsewhere) is added after the grade.
   Skipped: the ludus (pen / exhibitions), the Light board / Quality Low (lite84On), Lighting Off. Per frame: 0 by day (the under layer
   is cached), one blit at night. Phones (TW·dpr < 80) compose at half size (decoded memory ≈ 5 MB instead of 17).
   PASS 7 (his front picture, 1a 2a): the near façade + grand stair; the stair's pillars + braziers painted again over the game's
   stands corner from the cached 'deco' layer (the 'front' mask).
   PASS 8 final (his pick (c) + raised view, 2026-10-22): the bottom corners and below the stair are GROUND only — paving at the façade's
   foot, three steps down to street level, fading into a dark warm haze (no night sky below the arena); the stair's light = two small
   pools on its top steps (make.js --variant ground, the default). Framing: today's in every window (the pass 7 tall-window canvas
   growth and its kill switch flavius_amph111frameoff are gone).
   ===================================================================== */
const AMPH111={on:false,img:{},meta:null,comp:null,key:'',ms:0};
AMPH111.on=true;try{AMPH111.on=localStorage.getItem('flavius_amph111off')!=='1'}catch(e){}
if(AMPH111.on&&typeof ar91Under==='function'){
  const L5=['stone','bench','cloth','fixed','fire','glow'];
  /* the frame (tw0, xl, yt, w, h) — same numbers as assets/amph111.json (make.js writes both) */
  AMPH111.meta={tw0:112,xl:11.5,xr:11.5,yt:3.6,yb:10.9,w:2576,h:1624,front:[1097,1172,382,302]};
  /* FRAMING: today's everywhere (pass 8 final, his pick 2026-10-22 — REPLACES pass 7's tall-window canvas growth): the canvas, TW, OX
     and OY are exactly the flag-off numbers in every window; the stair's foot may be below the canvas edge. */
  const img=k=>typeof ar91Img==='function'?ar91Img(ar91Asset('amph111_'+k+'.webp')):null;
  const ready=()=>L5.every(k=>(AMPH111.img[k]=img(k)))&&!!(AMPH111.img.front=img('front'));
  const skip=()=>{try{return !ar91On()||ar91Lud()||(typeof lite84On==='function'&&lite84On())||(typeof l106Mode==='function'&&l106Mode()==='off')}catch(e){return true}};
  function amphTints(){let k=6;try{k=(typeof THEME!=='undefined'&&THEME.arena99)||S.locIdx||6}catch(e){}let P=null;try{P=THEMES99.P[k]}catch(e){}
    return {stone:ar91Mat().cap,bench:(typeof THEME!=='undefined'&&(THEME.standB||THEME.standA))||'#82302a',cloth:(P&&P.ui&&P.ui.blood)||AR91RED}}
  function amphTint(im,col,W,H){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
    g.drawImage(im,0,0,W,H);g.globalCompositeOperation='multiply';g.fillStyle=col;g.fillRect(0,0,W,H);g.globalCompositeOperation='destination-in';g.drawImage(im,0,0,W,H);return c}
  function amphComp(){const M=AMPH111.meta,t=amphTints(),dpr=window.devicePixelRatio||1,k=TW*dpr<80?0.5:1;const key=[t.stone,t.bench,t.cloth,k].join('|');
    if(AMPH111.comp&&AMPH111.key===key)return AMPH111.comp;const t0=performance.now();
    const W=Math.round(M.w*k),H=Math.round(M.h*k),I=AMPH111.img;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
    g.globalCompositeOperation='lighter';g.drawImage(amphTint(I.stone,t.stone,W,H),0,0);g.drawImage(amphTint(I.bench,t.bench,W,H),0,0);g.drawImage(amphTint(I.cloth,t.cloth,W,H),0,0);
    g.drawImage(I.fixed,0,0,W,H);g.drawImage(I.fire,0,0,W,H);
    /* recede: less saturated, then darker, from 9 TW round the board's middle (an ellipse squashed like the iso floor) */
    const cx=M.xl*M.tw0*k,cy=(M.yt+3.25)*M.tw0*k,r0=9*M.tw0*k,r1=16*M.tw0*k;
    const grad=(a,rgb)=>{const gr=g.createRadialGradient(cx,cy,r0,cx,cy,r1);gr.addColorStop(0,`rgba(${rgb},0)`);gr.addColorStop(1,`rgba(${rgb},${a})`);return gr};
    g.save();g.translate(cx,cy);g.scale(1,0.62);g.translate(-cx,-cy);
    g.globalCompositeOperation='saturation';g.fillStyle=grad(0.3,'128,120,110');g.fillRect(-W,-H,W*3,H*4);
    g.globalCompositeOperation='source-atop';g.fillStyle=grad(0.3,'22,14,8');g.fillRect(-W,-H,W*3,H*4);g.restore();
    /* the saturation pass also filled the transparent sky: cut back to the bake's own coverage */
    const a=document.createElement('canvas');a.width=W;a.height=H;const ag=a.getContext('2d');for(const n of ['stone','bench','cloth','fixed','fire'])ag.drawImage(I[n],0,0,W,H);
    g.globalCompositeOperation='destination-in';g.drawImage(a,0,0);
    AMPH111.comp=c;AMPH111.key=key;AMPH111.ms=performance.now()-t0;return c}
  /* place a bake-frame image so its (xl, yt) point lands on (OX, OY) at the current TW (zoom and size follow for free) */
  function amphPlace(g,im){const M=AMPH111.meta,s=TW/M.tw0;g.drawImage(im,OX-M.xl*TW,OY-M.yt*TW,M.w*s,M.h*s)}
  /* v1.11a (419): AMPH111.under(g) = what the wrapper adds under 192's painter (tv100r: the cached layer = this + the bare 192 functions) */
  AMPH111.under=function(g){try{if(!skip()&&ready())amphPlace(g,amphComp())}catch(e){console.error(e)}};
  {const base=ar91Under;ar91Under=function(g){AMPH111.under(g);return base.apply(this,arguments)}}
  /* PASS 7 FRONT: the stair's two pillars + their braziers + banners stand IN FRONT of the game's stands corner (his picture), but the
     bake is painted under the game. So their pixels (the composite cut to the 'front' coverage mask, a 382×302 box) are painted once
     more at the end of 192's cached 'deco' layer (after the benches, before the spectators): 0 cost per frame. */
  function amphFront(){const M=AMPH111.meta,c=amphComp(),k=c.width/M.w,[x,y,w,h]=M.front;const key=AMPH111.key;if(AMPH111.fc&&AMPH111.fk===key)return AMPH111.fc;
    const W=Math.max(1,Math.round(w*k)),H=Math.max(1,Math.round(h*k)),f=document.createElement('canvas');f.width=W;f.height=H;const g=f.getContext('2d');
    g.drawImage(c,x*k,y*k,w*k,h*k,0,0,W,H);g.globalCompositeOperation='destination-in';g.drawImage(AMPH111.img.front,0,0,W,H);AMPH111.fc=f;AMPH111.fk=key;return f}
  if(typeof ar91DecoPaint==='function'){const base=ar91DecoPaint;ar91DecoPaint=function(g){const r=base.apply(this,arguments);
    try{if(!skip()&&ready()){const M=AMPH111.meta,s=TW/M.tw0,[x,y,w,h]=M.front;g.drawImage(amphFront(),OX-M.xl*TW+x*s,OY-M.yt*TW+y*s,w*s,h*s)}}catch(e){console.error(e)}return r}}
  /* v1.11a (419) ZOOMED: 294's whole-arena frame holds the arena's box + Z100.m, but the surround reaches the screen's edges: panned to a
     corner the cached 'under' / 'deco' layers end inside the view (a flat band where the stair and the façade go on, tv100z 3c). The
     uncovered strips (≤ 4 rects, device px) are painted straight from the composite before the layer's own blit; 0 when the layer
     covers the screen (unzoomed, 208's margin). Follows 208's and 294's (scaled) blit placement. */
  function amphRect(L){const dpr=window.devicePixelRatio||1;
    if(typeof Z100!=='undefined'&&Z100.on&&typeof z100Scaled==='function'&&z100Scaled(L)){const s=TW/L.tw;
      return [dpr*OX-s*((L.px||0)+dpr*L.ox),dpr*OY-s*((L.py||0)+dpr*L.oy),L.cv.width*s,L.cv.height*s]}
    return [Math.round(-(L.px||0)+(L.ox==null?0:(OX-L.ox)*dpr)),Math.round(-(L.py||0)+(L.oy==null?0:(OY-L.oy)*dpr)),L.cv.width,L.cv.height]}
  function amphOutside(L,im,bx,by,bw,bh){const W=cv.width,H=cv.height,[lx,ly,lw,lh]=amphRect(L);const x0=Math.max(0,lx),y0=Math.max(0,ly),x1=Math.min(W,lx+lw),y1=Math.min(H,ly+lh);
    if(x0<=0&&y0<=0&&x1>=W&&y1>=H)return;
    const M=AMPH111.meta,dpr=window.devicePixelRatio||1,u=dpr*TW/M.tw0,X0=dpr*(OX-M.xl*TW)+bx*u,Y0=dpr*(OY-M.yt*TW)+by*u,kx=im.width/bw,ky=im.height/bh;
    const R=x1<=x0||y1<=y0?[[0,0,W,H]]:[[0,0,W,y0],[0,y1,W,H-y1],[0,y0,x0,y1-y0],[x1,y0,W-x1,y1-y0]];
    ctx.save();ctx.setTransform(1,0,0,1,0,0);
    for(let [x,y,w,h] of R){const a=Math.max(x,X0),b=Math.max(y,Y0),c=Math.min(x+w,X0+bw*u),d=Math.min(y+h,Y0+bh*u);if(c-a<1||d-b<1)continue;
      ctx.drawImage(im,(a-X0)/u*kx,(b-Y0)/u*ky,(c-a)/u*kx,(d-b)/u*ky,a,b,c-a,d-b)}
    ctx.restore()}
  {const base=ar91Blit;ar91Blit=function(L,op){
    try{if(!op&&L&&L.cv&&typeof AR91!=='undefined'&&!AR91.noStatic&&(L===AR91.L.under||L===AR91.L.deco)&&!skip()&&ready()){const nm=L===AR91.L.under?'under':'deco';
      if(!(typeof LAYERS93!=='undefined'&&LAYERS93.on&&LAYERS93.dbg.has(nm))){const M=AMPH111.meta;
        if(nm==='under')amphOutside(L,amphComp(),0,0,M.w,M.h);else{const [x,y,w,h]=M.front;amphOutside(L,amphFront(),x,y,w,h)}}}}catch(e){console.error(e)}
    return base.apply(this,arguments)}}
  /* the glow is mostly black: find the lit cells once (a 1/8 thumbnail, 16×10 grid) and add only those each night frame */
  function amphCells(){if(AMPH111.cells)return AMPH111.cells;const M=AMPH111.meta,im=AMPH111.img.glow;let out=null;
    try{const w=Math.ceil(M.w/8),h=Math.ceil(M.h/8),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(im,0,0,w,h);
      const d=g.getImageData(0,0,w,h).data,GX=16,GY=10,cw=Math.ceil(w/GX),ch=Math.ceil(h/GY);out=[];
      for(let j=0;j<GY;j++){let run=null;for(let i=0;i<=GX;i++){let lit=false;
        if(i<GX)for(let y=j*ch;y<Math.min(h,(j+1)*ch)&&!lit;y++)for(let x=i*cw;x<Math.min(w,(i+1)*cw);x++){const o=(y*w+x)*4;if(d[o]+d[o+1]+d[o+2]>9){lit=true;break}}
        if(lit){if(!run)run={i0:i};run.i1=i}else if(run){out.push({x:run.i0*cw*8,y:j*ch*8,w:(run.i1-run.i0+1)*cw*8,h:ch*8});run=null}}}}
    catch(e){out=[{x:0,y:0,w:M.w,h:M.h}]} /* a tainted canvas (file://): the whole layer */
    for(const r of out){r.w=Math.min(r.w,M.w-r.x);r.h=Math.min(r.h,M.h-r.y)}
    return (AMPH111.cells=out)}
  if(typeof night91Sand==='function'){const base=night91Sand;night91Sand=function(){const r=base.apply(this,arguments);
    try{if(night91On()&&!skip()&&ready()){const M=AMPH111.meta,s=TW/M.tw0,x0=OX-M.xl*TW,y0=OY-M.yt*TW,G=amphGlowAt(s);ctx.save();ctx.globalCompositeOperation='lighter';
      /* v1.11a: the lit cells come from a copy pre-scaled to this TW × device pixels, so each night frame is a 1:1 copy (scaling the
         2576-px bake every frame cost ~16 ms on a CPU raster, tv91r) */
      for(const c of amphCells())if(c.w>0&&c.h>0)ctx.drawImage(G.c,c.x*G.k,c.y*G.k,c.w*G.k,c.h*G.k,x0+c.x*s,y0+c.y*s,c.w*s,c.h*s);ctx.restore()}}catch(e){console.error(e)}return r}}
  function amphGlowAt(s){const M=AMPH111.meta,t=ctx.getTransform?ctx.getTransform():{a:1},k=s*(Math.abs(t.a)||1),key=k.toFixed(4)+'|'+AMPH111.key;
    if(AMPH111.gc&&AMPH111.gk===key)return AMPH111.gc;const c=document.createElement('canvas');c.width=Math.max(1,Math.round(M.w*k));c.height=Math.max(1,Math.round(M.h*k));
    c.getContext('2d').drawImage(AMPH111.img.glow,0,0,c.width,c.height);AMPH111.gc={c,k:c.width/M.w};AMPH111.gk=key;return AMPH111.gc}
}

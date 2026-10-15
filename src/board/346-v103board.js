/* =====================================================================
   346-v103board.js — v1.03 · 3D TOKENS + STUDIO GEAR (his v1.02 notes T1–T6, S1; tools/plans/v103/NOTES.md). Kill switch: localStorage
   flavius_v103coff=1 (every item below goes back to v1.02; T1's smaller beasts live in the assets).
   T1  bears / lions / wolves smaller, lions slimmer: RE-RENDERED sheets (tools/plans/look100/beast5_rig.js SIZE103 + SLIM103 → `node
       tools/art/anim100b/make.js leo leaena ursa brutum valencia moechus`): bears ×0.8, lions ×0.82 with the body/mane/legs 0.8 (Leaena 0.84)
       as wide, wolves ×0.88. Nothing in code (312 reads the new BEAST100_META cells); the bases keep their tile sizes.
   T2  "Show token bases" OFF now takes the base off EVERY figure:
       • 312's sheets: 334's G6 flood took only a LOW-SATURATION top — Tholo's / Commodus's cream top failed its gate (and some of Tholo's facings
         found no seed) → the base stayed. Tholo + Commodus (`B103_HUM`) → `b103Proc`: 334's g6Geom; the wall band + the rim's ink line cut whole,
         the top flooded only where its own colour runs on smoothly (ink lines / colour steps stop it — legs and cloth stay), pockets that never
         leave the oval, the oval's thin ink line; a facing whose cape blends into the top keeps only the top (wall gone). Snakes (`B103_WALL`) →
         334's G6 + the yellow rim band cleared (`b103Wall`). Wolves, Zora, lions, bears keep 334's G6 (it works there).
       • sculpted figures (custom beasts / custom humanoids, sculpt-token characters, 176 lit figures): drawn from a figureSVG WITHOUT its
         base ellipses (`_nb103` on the spec → its own cache entries; tokenImg / 176's sc3dCanvas swap the spec while drawFigureTok draws).
   T3  the seat-colour arc on a token's base rim (311 / 222): on the THIN base (321 BS101 0.85) the line is 0.6 as thick and sits on the
       squeezed wall; with bases off it is not drawn (07's ring under the piece stays). `rim103(k)`.
   T4  Tunnel button (and its placeholder) says WHY it cannot be used: `tun103Why(p)` — missing a limb ("Can't crawl through — missing a
       limb"), no Arena Key, carrying the chest, no tunnel next to you, no free exit. On the button's tip + aria-label + its hidden <small>.
   T5  Telemachus Interdico!: 259 already put 210's atk92Why on the dimmed weapon buttons; gaps closed: the ◎ Focus / ↗ Throw docks and the
       Attack placeholders also carry the reason, and the attack group header's tip names it.
   T6  BLURRY EDGES — measured (tools/plans/v103: tv103c 6): the printed classes' sheets are rendered at 2.6 px/mm; a token is drawn at
       TW·0.8/25.4 px/mm × the device ratio — 0.68× at 1440×900 / 1×, but 1.36× zoomed or on a 2× screen (UP-scaled). On top of that
       the pre-scaled cell (311 an100CellCanvas, 3% size steps) was drawn AGAIN at w·s (≠ its own size) and at fractional positions → a
       second bilinear resample every frame = the soft edge in BOTH views. 312's beast cells ignored the device ratio entirely (a 2×
       screen up-scaled a 1× cell). Fix (display only): `sh103Blit` draws a pre-scaled cell at its OWN size on whole device pixels (the
       base point stays put; ≤1.5% size from the 3% steps), 312/334 cells are made at the device ratio, and an up-scaled cell
       (> 1.05×) gets a light unsharp mask once when cached (≤ 2 a frame, never while the zoom eases; file:// pages cannot read pixels → skipped).
   S1  Creator Studio → Gear: Weapons, Armor and Trophies join 335's designer frame (header, numbered tabs, cards, preview pinned right,
       sticky checks + Save, "📜 Your … · N" tab). They were left out because D102_ON listed only the Fighters/Arena designers (Gear sat on
       247's old st98 tab bar). Insignia keeps its own tabbed bench (304a: kind cards + Cloth/Pattern/Emblem/… tabs).
   Display only: never S, dice, RNG, the log or onlHash. Test tv103c.
   ===================================================================== */
const V103C={off:(()=>{try{return localStorage.getItem('flavius_v103coff')==='1'}catch(e){return false}})(),
  st:{blit:0,sharp:0,sharpSkip:0,proc:0,procFail:0,nb:0},sharpMax:2,sharpAmt:0.55,sharpMin:1.05,frame:{t:0,n:0,tw:0,twAt:0}};
const bases103=()=>{try{return typeof bs101Mode==='function'?bs101Mode():1}catch(e){return 1}};

/* ---------------- T6 · sharp cells ---------------- */
/* the canvas transform's scale (the device ratio × any zoom on ctx) */
const ds103=()=>{try{const t=ctx.getTransform();return Math.max(0.25,Math.hypot(t.a,t.b)||1)}catch(e){return 1}};
/* sh103Blit — draw a PRE-SCALED cell at its own size, its top-left on a whole device pixel, the anchor (ax, ay) kept where the caller wanted it */
function sh103Blit(c,dx,dy,dw,dh,ax,ay){if(V103C.off||!c||!c.width)return false;try{const t=ctx.getTransform();if(t.b||t.c)return false;const sx=t.a||1,sy=t.d||1;
  const nw=c.width/sx,nh=c.height/sy;if(!(dw>0)||Math.abs(nw/dw-1)>0.06)return false;   /* not a pre-scaled cell of this size */
  const r=nw/dw,x0=ax-(ax-dx)*r,y0=ay-(ay-dy)*(nh/dh);const X=(Math.round(sx*x0+t.e)-t.e)/sx,Y=(Math.round(sy*y0+t.f)-t.f)/sy;
  ctx.drawImage(c,X,Y,nw,nh);V103C.st.blit++;return true}catch(e){return false}}
/* the zoom is easing when TW changed within the last two draws */
function zoom103Moving(){const F=V103C.frame;return F.n-F.twAt<=2}
{const base=draw;draw=function(){const F=V103C.frame;F.n++;try{if(Math.abs((typeof TW!=='undefined'?TW:0)-F.tw)>1e-6){F.tw=TW;F.twAt=F.n}}catch(e){}return base.apply(this,arguments)}}
/* sh103Sharpen — a light unsharp mask (3×3) on RGB and alpha, in place; false when the pixels cannot be read */
function sh103Sharpen(c){try{const g=c.getContext('2d');const W=c.width,H=c.height;if(W<3||H<3)return true;const id=g.getImageData(0,0,W,H),d=id.data,o=new Uint8ClampedArray(d);const a=V103C.sharpAmt;
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=(y*W+x)*4;if(!o[i+3]&&!o[i+3-4]&&!o[i+3+4]&&!o[i+3-W*4]&&!o[i+3+W*4])continue;
    for(let ch=0;ch<4;ch++){const k=i+ch;const bl=(o[k-4]+o[k+4]+o[k-W*4]+o[k+W*4]+o[k-4-W*4]+o[k+4-W*4]+o[k-4+W*4]+o[k+4+W*4]+o[k]*8)/16;d[k]=o[k]+a*(o[k]-bl)}}
  g.putImageData(id,0,0);return true}catch(e){return false}}
/* sh103Maybe — sharpen a freshly cached up-scaled cell (budget per frame; the rest wait for a later draw) */
function sh103Maybe(c,up){if(V103C.off||!c||c._sh103||HEADLESS)return c;if(!(up>V103C.sharpMin)){c._sh103=1;return c}
  const F=V103C.frame,now=performance.now();if(now-F.t>12){F.t=now;F.k=0}
  if(zoom103Moving()||(F.k||0)>=V103C.sharpMax){V103C.st.sharpSkip++;if(!F.raf)F.raf=requestAnimationFrame(()=>{F.raf=0;try{if(S&&!HEADLESS)draw()}catch(e){}});return c}
  F.k=(F.k||0)+1;c._sh103=sh103Sharpen(c)?1:2;if(c._sh103===1)V103C.st.sharp++;return c}
if(!V103C.off&&typeof an100CellCanvas==='function'){const base=an100CellCanvas;an100CellCanvas=function(im,key0,fx,sy,w,h,s){const c=base.apply(this,arguments);
  try{if(c&&w)sh103Maybe(c,c.width/w)}catch(e){}return c}}
/* 312: the beast cell made at the device ratio too (its draw call puts it back at css size) */
if(!V103C.off&&typeof bst100CellCanvas==='function'){const base=bst100CellCanvas;bst100CellCanvas=function(im,me,face,row,s){const ds=ds103();
  const e=base.call(this,im,me,face,row,s*ds);try{if(e&&e.c)sh103Maybe(e.c,e.c.width/me[0])}catch(x){}return e}}
if(!V103C.off&&typeof g6Scaled==='function'){const base=g6Scaled;g6Scaled=function(pc,me,s,face,row,key){const ds=ds103();const c=base.call(this,pc,me,s*ds,face,row,key);
  try{if(c)sh103Maybe(c,c.width/me[0])}catch(x){}return c}}

/* ---------------- T3 · the rim ring ---------------- */
/* k = screen px per mm of the base; returns {w,dy} or null (no base → no ring on it) */
function rim103(k){const old={w:Math.max(1.5,2.3*k),dy:1.35*k};if(V103C.off)return old;const m=bases103();if(m===2)return null;
  if(m===1){const th=typeof BS101!=='undefined'?BS101.thin:0.85;return {w:Math.max(1,2.3*k*0.6),dy:(1.35+3.5*(1-th))*k}}return old}

/* ---------------- T2 · bases off on every figure ---------------- */
const B103={cache:new Map(),max:200};
/* the base-less cell of a 312 round-base sheet, or null */
function b103Proc(im,M,me,face,row){const key=im.src.slice(-70)+'|'+face+'|'+row;let c=B103.cache.get(key);if(c!==undefined)return c;c=null;
  try{const W=me[0],H=me[1],cx=me[2],cy=me[3];const src=document.createElement('canvas');src.width=W;src.height=H;const sg=src.getContext('2d');sg.drawImage(im,face*W,row*H,W,H,0,0,W,H);
    const id=sg.getImageData(0,0,W,H),d0=id.data,G=g6Geom(M,face),T=G.T;
    const q=(dx,dy)=>{const u=G.inv[0][0]*dx+G.inv[0][1]*dy,v=G.inv[1][0]*dx+G.inv[1][1]*dy;return u*u+v*v};
    const inTop=(x,y,m)=>q(x+0.5-cx,y+0.5-cy)<=(1+m)*(1+m);const rr=(x,y)=>Math.sqrt(q(x+0.5-cx,y+0.5-cy));
    const inAll=(x,y,m)=>{const dx=x+0.5-cx,dy=y+0.5-cy,k=(1+m)*(1+m);if(q(dx,dy)<=k||q(dx,dy-T)<=k)return true;for(let f=0.25;f<1;f+=0.25)if(q(dx,dy-T*f)<=k)return true;return false};
    const pt=(t,k,oy)=>{const A=G.A;return [cx+k*(A[0][0]*Math.cos(t)+A[0][1]*Math.sin(t)),cy+oy+k*(A[1][0]*Math.cos(t)+A[1][1]*Math.sin(t))]};
    const px=(x,y)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>=H)return null;const i=(y*W+x)*4;return d0[i+3]>200?[d0[i],d0[i+1],d0[i+2]]:null};
    const top=[];for(let i=0;i<36;i++){const t=i*Math.PI/18;for(const k of [0.8,0.9]){const p=pt(t,k,0),c2=px(p[0],p[1]);if(c2)top.push(c2)}}
    const med=L=>{if(L.length<4)return null;const m=[0,1,2].map(ch=>L.map(p=>p[ch]).sort((a,b)=>a-b)[L.length>>1]);const C=L.filter(p=>(p[0]-m[0])**2+(p[1]-m[1])**2+(p[2]-m[2])**2<=48*48);return C.length>=Math.max(3,L.length*0.3)?C:null};
    const tp=med(top)||[];
    const tT=30*30;
    const x0=Math.max(0,Math.floor(cx-M.base[0]*M.px*0.62-6)),x1=Math.min(W,Math.ceil(cx+M.base[0]*M.px*0.62+6)),y0=Math.max(0,Math.floor(cy-M.base[0]*M.px*0.45)),y1=Math.min(H,Math.ceil(cy+T+M.base[0]*M.px*0.45));
    const area=Math.PI*(M.base[0]/2*M.px)*(M.base[1]/2*M.px)*0.5+(M.base[0]*M.px)*T;
    /* the wall band (in front of / below the top oval, inside the cylinder) goes whole, with the rim's ink line; the top surface only where its
       own colour runs on smoothly from there (an ink line or a colour step stops it: legs and cloth standing on it stay). topOn=false: the wall alone. */
    const run=topOn=>{const d=new Uint8ClampedArray(d0);
      const near=(i,t)=>{for(const p of tp){const a=d[i]-p[0],b=d[i+1]-p[1],e=d[i+2]-p[2];if(a*a+b*b+e*e<=t)return true}return false};
      const lum=i=>0.3*d[i]+0.59*d[i+1]+0.11*d[i+2];
      const wallAt=(x,y)=>!inTop(x,y,0.0)&&y+0.5>=cy-2;
      const ink=(i,x,y)=>{const r0=rr(x,y);return r0>0.86&&r0<=1.02&&y+0.5>=cy-2&&lum(i)<110};
      const ok=(i,x,y,j)=>d[i+3]>=30&&(wallAt(x,y)||ink(i,x,y)||(topOn&&inTop(x,y,0.03)&&near(i,tT)&&(j==null||!near(j,tT)||Math.abs(lum(i)-lum(j))<=14)));
      const edge=(x,y)=>{for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H)return true;if(d[(Y*W+X)*4+3]<30)return true}return false};
      const seen=new Uint8Array(W*H),st=[];
      for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(!inAll(x,y,0.04))continue;const i=(y*W+x)*4;if(!ok(i,x,y)||!edge(x,y))continue;seen[y*W+x]=1;st.push(x,y)}
      let removed=0;while(st.length){const y=st.pop(),x=st.pop();const i0=(y*W+x)*4;
        for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+a,Y=y+b;if(X<x0||Y<y0||X>=x1||Y>=y1||seen[Y*W+X])continue;if(!inAll(X,Y,0.04))continue;const i=(Y*W+X)*4;if(!ok(i,X,Y,i0))continue;seen[Y*W+X]=1;st.push(X,Y)}
        d[i0+3]=0;removed++}
      if(!removed||removed>area*1.6)return null;
      if(topOn){/* pockets (between the feet): a top-coloured patch that never leaves the top oval */
        const tP=18*18,done=new Uint8Array(W*H);
        for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const j=y*W+x,i=j*4;if(done[j]||d[i+3]<30||!inTop(x,y,-0.05)||!near(i,tP))continue;
          const comp=[],S2=[x,y];done[j]=1;let out=false;while(S2.length){const yy=S2.pop(),xx=S2.pop();comp.push(yy*W+xx);if(!inTop(xx,yy,-0.02))out=true;if(comp.length>4000){out=true;break}
            for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=xx+a,Y=yy+b;if(X<0||Y<0||X>=W||Y>=H)continue;const k2=Y*W+X;if(done[k2])continue;const i2=k2*4;if(d[i2+3]<30||!near(i2,tP))continue;done[k2]=1;S2.push(X,Y)}}
          if(!out)for(const k2 of comp)d[k2*4+3]=0}}
      /* what is left of the rim: in the wall band anything touching the cut; on the oval's line only thin dark ink (≥5 empty neighbours) */
      for(let pass=0;pass<3;pass++){const kill=[];for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*W+x)*4;if(d[i+3]<30||!inAll(x,y,0.07))continue;const w=wallAt(x,y),r0=rr(x,y);if(!w&&!(r0>0.86&&r0<1.16))continue;
          let e=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const X=x+a,Y=y+b;if(X<0||Y<0||X>=W||Y>=H||d[(Y*W+X)*4+3]<30)e++}
          if(w?e>0:(e>=5&&lum(i)<120))kill.push(i)}
        for(const i of kill)d[i+3]=0}
      /* the oval's own ink line where it ran behind the cut top: a thin dark run with the cut both above and below it */
      {const kill=[];const em=(x,y)=>y<0||y>=H||d[(y*W+x)*4+3]<30;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*W+x)*4;if(d[i+3]<30)continue;const r0=rr(x,y);if(!(r0>0.84&&r0<1.16)||lum(i)>=130)continue;
        if((em(x,y-1)||em(x,y-2)||em(x,y-3))&&(em(x,y+1)||em(x,y+2)||em(x,y+3)))kill.push(i)}for(const i of kill)d[i+3]=0}
      return d};
    let d=tp.length?run(true):null;if(!d)d=run(false);
    if(!d){B103.cache.set(key,null);V103C.st.procFail++;return null}
    id.data.set(d);c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').putImageData(id,0,0);V103C.st.proc++}catch(e){c=null;V103C.st.procFail++}
  B103.cache.set(key,c);if(B103.cache.size>B103.max)B103.cache.delete(B103.cache.keys().next().value);return c}
/* which 312 sheets take which path with bases off: the humanoids' cream tops → b103Proc; the snakes → 334's G6 + the yellow rim band cleared
   (G6 left the band's lower arc); wolves, Zora, lions, bears keep 334's G6 untouched (it already works there) */
const B103_HUM=['tholo','commodus'],B103_WALL=['glykon','arenosus'];
function b103Wall(im,M,me,face,row){const key='w|'+im.src.slice(-70)+'|'+face+'|'+row;let c=B103.cache.get(key);if(c!==undefined)return c;c=null;
  try{const g=typeof g6Proc==='function'?g6Proc(im,M,me,face,row):null;if(g){const W=me[0],H=me[1],cx=me[2],cy=me[3],G=g6Geom(M,face),T=G.T;
    const q=(dx,dy)=>{const u=G.inv[0][0]*dx+G.inv[0][1]*dy,v=G.inv[1][0]*dx+G.inv[1][1]*dy;return u*u+v*v};
    c=document.createElement('canvas');c.width=W;c.height=H;const cg=c.getContext('2d');cg.drawImage(g,0,0);const id=cg.getImageData(0,0,W,H),d=id.data;
    for(let y=Math.max(0,Math.floor(cy-2));y<H;y++)for(let x=0;x<W;x++){const dx=x+0.5-cx,dy=y+0.5-cy;if(q(dx,dy)<=0.98)continue;let inC=false;for(let f=0;f<=1.001;f+=0.25)if(q(dx,dy-T*f)<=1.12*1.12){inC=true;break}if(inC)d[(y*W+x)*4+3]=0}
    cg.putImageData(id,0,0);V103C.st.proc++}}catch(e){c=null;V103C.st.procFail++}
  B103.cache.set(key,c);if(B103.cache.size>B103.max)B103.cache.delete(B103.cache.keys().next().value);return c}
const B103SC=new Map();
function b103Scaled(pc,me,s,key){const ds=ds103(),q=Math.round(Math.log(s*ds)*33),sq=Math.exp(q/33);const k=key+'|s'+q;let c=B103SC.get(k);if(c){B103SC.delete(k);B103SC.set(k,c);return c}
  c=document.createElement('canvas');c.width=Math.max(1,Math.round(me[0]*sq));c.height=Math.max(1,Math.round(me[1]*sq));const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(pc,0,0,me[0],me[1],0,0,c.width,c.height);
  B103SC.set(k,c);while(B103SC.size>160)B103SC.delete(B103SC.keys().next().value);return sh103Maybe(c,c.width/me[0])}
/* 312's cell with bases off: round bases through b103Proc (outer to 334's wrapper, which keeps the long bases) */
if(!V103C.off&&typeof bst100Cell==='function'){const base=bst100Cell;bst100Cell=function(k,face,pose,x,y,opt){
  if(bases103()!==2)return base.apply(this,arguments);
  try{const M=BEAST100_META[k];if(!M||!M.base||!(B103_HUM.includes(k)||B103_WALL.includes(k)))return base.apply(this,arguments);
    let im=null,me=null,row=-1;if(pose.act){im=bst100Img(k,1);if(im){me=M.aw;row=M.ar.indexOf(pose.name)}}
    if(!im||row<0){im=bst100Img(k,0);if(!im)return base.apply(this,arguments);me=M.iw;row=M.ir.indexOf(pose.name);if(row<0)row=Math.max(0,M.ir.indexOf('idle0'))}
    if(typeof g6Readable==='function'&&!g6Readable(im))return base.apply(this,arguments);
    const f=face||0,pc=B103_HUM.includes(k)?b103Proc(im,M,me,f,row):b103Wall(im,M,me,f,row);if(!pc)return base.apply(this,arguments);
    const s=bst100Scale(M),cc=b103Scaled(pc,me,s,im.src.slice(-70)+'|'+f+'|'+row);
    ctx.save();if(opt&&opt.dim)ctx.globalAlpha*=opt.dim;if(opt&&opt.alpha!=null)ctx.globalAlpha*=opt.alpha;if(opt&&opt.filter)ctx.filter=opt.filter;
    if(!sh103Blit(cc,x-me[2]*s,y-me[3]*s,me[0]*s,me[1]*s,x,y))ctx.drawImage(cc,x-me[2]*s,y-me[3]*s,me[0]*s,me[1]*s);ctx.restore();
    BST100.stats.cells++;V103C.st.nb++;return y-M.iw[3]*s}catch(e){console.error(e);return base.apply(this,arguments)}}}
/* sculpted figures: the same figure without its base ellipses (figureSVG's three base ellipses, 176's SC3D_BASE_RE) */
const B103_BASE_RE=/<ellipse cx="50" cy="160" rx="31" ry="9" fill="[^"]*"\/><ellipse cx="50" cy="157" rx="31" ry="9" fill="[^"]*" stroke="[^"]*" stroke-width="[^"]*"\/><ellipse cx="50" cy="156" rx="24" ry="5\.5" fill="[^"]*" opacity="\.6"\/>/;
if(!V103C.off&&typeof figureSVG==='function'){const base=figureSVG;figureSVG=function(spec){const s=base.apply(this,arguments);
  try{if(spec&&spec._nb103&&typeof s==='string')return s.replace(B103_BASE_RE,'')}catch(e){}return s}}
const NB103={in:0,map:new WeakMap()};
const nb103Spec=sp=>{let nb=NB103.map.get(sp);if(!nb){nb=Object.assign({},sp,{_nb103:1});NB103.map.set(sp,nb)}return nb};
/* while a board piece is drawn with bases off, the figure images it asks for are the base-less twins (own cache keys) */
if(!V103C.off&&typeof drawFigureTok==='function'){const base=drawFigureTok;drawFigureTok=function(sp){
  if(!sp||sp.t93||typeof sp!=='object'||bases103()!==2)return base.apply(this,arguments);NB103.in++;try{return base.apply(this,arguments)}finally{NB103.in--}}}
if(!V103C.off&&typeof tokenImg==='function'){const base=tokenImg;tokenImg=function(spec){if(NB103.in&&spec&&typeof spec==='object'&&!spec.t93&&!spec._nb103){V103C.st.nb++;return base.call(this,nb103Spec(spec))}return base.apply(this,arguments)}}
if(!V103C.off&&typeof sc3dCanvas==='function'){const base=sc3dCanvas;sc3dCanvas=function(spec,key,pxH){if(NB103.in&&spec&&typeof spec==='object'&&!spec.t93&&!spec._nb103){V103C.st.nb++;return base.call(this,nb103Spec(spec),key+'|nb103',pxH)}return base.apply(this,arguments)}}

/* ---------------- T4 · why the tunnel is shut ---------------- */
function tun103Why(p){try{if(!p||!S||!S.tunnels||!S.tunnels.length)return '';if(tunnelExits(p).length)return '';
  if(weak(p,'noTunnel'))return _T('Your class never uses the tunnels');
  if(!allLimbs(p))return _T('Can’t crawl through — missing a limb');
  if(p.carrying)return _T('Can’t take the Arena Chest down a tunnel');
  if(p.keys<1)return _T('Needs an Arena Key');
  if(!S.tunnels.some(t=>tunnelUsable(t)&&cheb(p,t)<=1))return _T('Stand next to an open tunnel');
  return _T('No free exit to surface at')}catch(e){return ''}}
function tun103Apply(p){const why=tun103Why(p);if(!why)return;
  for(const b of document.querySelectorAll('#actions [data-act="m-tunnel"][disabled],#actions .ph-m-tunnel,#actions .acts button[data-act="m-tunnel"][disabled]')){
    if(b.dataset.tip!==why)b.dataset.tip=why;b.title=why;const al=b.getAttribute('aria-label')||'';if(al.indexOf(why)<0)b.setAttribute('aria-label',(al.split(' — ')[0]||_T('Tunnel'))+' — '+why);
    const sm=b.querySelector('small');if(sm&&sm.textContent!==why)sm.textContent=why}}
/* ---------------- T5 · Telemachus on every attack control ---------------- */
function atk103Apply(p){if(typeof atk92Why!=='function'||!(S.active&&S.active.telemachus))return;const why=atk92Why(p);if(!why)return;
  for(const b of document.querySelectorAll('#actions [data-g96="atk"] button[disabled],#actions [data-g96="atk"] .ph96b,#actions .wpn98 button[disabled],#actions .dock98 button[disabled],#actions [data-act="focus"][disabled],#actions [data-act="none"]')){
    const t=b.dataset.tip||'';if(t.indexOf(why)<0)b.dataset.tip=(t?t+'<br>':'')+why;b.title=why;const al=b.getAttribute('aria-label')||'';if(al.indexOf(why)<0)b.setAttribute('aria-label',(al?al.replace(/ — [^—]*$/,'')+' — ':'')+why)}
  const hd=document.querySelector('#actions [data-g96="atk"] .hd96');if(hd&&hd.dataset.tip!==why)hd.dataset.tip=why}
if(!V103C.off&&typeof render==='function'){const base=render;render=function(){const r=base.apply(this,arguments);
  try{if(S&&!HEADLESS&&S.phase==='action'){const p=cur();if(p&&!p.cpu){tun103Apply(p);atk103Apply(p)}}}catch(e){console.error(e)}return r}}

/* ---------------- S1 · the Gear designers in 335's frame ---------------- */
if(!V103C.off&&typeof D102_SPEC!=='undefined'&&typeof D102!=='undefined'&&!D102.off){
  const W={sg:'.trstudio',sgSel:'#cwPrev',kick:()=>_T`⚔ Weapon designer`,nameSel:'input[data-cwf="name"]',blank:()=>_T('New weapon'),
    chip:R=>({t:d102Txt(R,'.trstudio .formgrid select, .df99 .formgrid select'),c:'#b8bec8'}),
    split:()=>[['.scbench',_T`✏️ Sculpt`]],titles:{},
    tabs:()=>[{k:'wbasic',t:_T`Basics`,s:_T`name · level · colours`,m:/^$/},{k:'wsculpt',t:_T`Sculpt`,s:_T`shapes on the preview`,m:/Sculpt/i,lay:'one'},
      {k:'wicons',t:_T`Card icons`,s:_T`attack · range · abilities`,m:/icon|card/i,lay:'one'}],
    first:()=>_T`⚔ The weapon`,list:()=>_T`📜 Your weapons · ${(CUSTOM.weapons||[]).length}`,
    checks:R=>[[!!d102Val(R,'input[data-cwf="name"]'),_T('Name')]]};
  const A={sg:'.trstudio',sgSel:'#caPiece',kick:()=>_T`🛡 Armor designer`,nameSel:'input[data-caf="name"]',blank:()=>_T('New armor'),
    chip:R=>({t:d102Txt(R,'select[data-caf="slot"]')||'',c:'#b08a5a'}),
    split:()=>[['.scbench',_T`✏️ Sculpt`],['#x92Tray',_T`✨ Extras`],['.calevels',_T`📶 Level`]],titles:{},
    tabs:()=>[{k:'abasic',t:_T`Basics`,s:_T`name · equip point · level`,m:/^$|Level/i,big:/Level/i},{k:'asculpt',t:_T`Sculpt`,s:_T`shapes on the preview`,m:/Sculpt/i,lay:'one'},
      {k:'aextra',t:_T`Extras`,s:_T`crests · studs · wear`,m:/Extras/i,lay:'one'}],
    first:()=>_T`🛡 The piece`,list:()=>_T`📜 Your armor · ${(CUSTOM.armor||[]).length}`,
    checks:R=>[[!!d102Val(R,'input[data-caf="name"]'),_T('Name')]]};
  const TR={sg:'.trstudio',sgSel:'#trPrev',kick:()=>_T`🏆 Trophy designer`,nameSel:'input[data-trf="name"]',blank:()=>_T('New trophy'),
    chip:R=>({t:d102Txt(R,'select[data-trf="metal"]'),c:'#c9a44a'}),
    split:()=>[['.scbench',_T`✏️ Sculpt`]],titles:{},
    tabs:()=>[{k:'tbasic',t:_T`Basics`,s:_T`name · material · rewards`,m:/^$/},{k:'tsculpt',t:_T`Sculpt`,s:_T`shapes on the preview`,m:/Sculpt/i,lay:'one'}],
    first:()=>_T`🏆 The trophy`,list:()=>_T`📜 Your trophies · ${(CUSTOM.trophies||[]).length}`,
    checks:R=>[[!!d102Val(R,'input[data-trf="name"]'),_T('Name')]]};
  Object.defineProperty(D102_SPEC,'gear',{configurable:true,enumerable:true,get:()=>typeof ST!=='undefined'&&ST.gearSub==='a'?A:W});
  D102_SPEC.trophies=TR;
  if(typeof ST98_ON!=='undefined')for(const k of ['gear','trophies']){const i=ST98_ON.indexOf(k);if(i>=0)ST98_ON.splice(i,1)}
  /* New / Edit / Copy jump back to the first tab */
  document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;if(t.closest('#studio [data-gs="wnew"],#studio [data-gs="anew"],#studio [data-trs="new"],#studio [data-cr="edit"],#studio [data-cr="copy"]'))try{DF99.jump=Date.now()}catch(x){}},true);
  const st=document.createElement('style');st.id='v103c-css';st.textContent=`
.df99.d102-gear .df99pv .scart,.df99.d102-trophies .df99pv .scart{max-width:100%}
.df99.d102-gear .df99pv #cwArt{width:260px;max-width:100%;height:auto;aspect-ratio:1}
.df99.d102-gear .df99pv .cwprev{max-width:100%}
.df99.d102-gear .df99in .icogrid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.df99.d102-gear .df99pv .cavbox{justify-self:stretch;text-align:left}`;document.head.appendChild(st)}

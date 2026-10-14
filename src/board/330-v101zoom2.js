/* =========================================================
   330-v101zoom2 — v1.01 ZOOM WITHOUT THE HITCH, PRE-BAKED WHILE IDLE (his note "zoom stutter", PLAN item 10a, his pick 3a 2026-10-14).
   Display only: rules, dice, RNG, S and the online hash are untouched; zoom stays available online.
   MEASURED BEFORE (tools/perf95/zoombake.js: paused 4-seat Democritus + 48 spectators over http, 🔍 clicked after 2.5 s quiet, every frame of 2.2 s timed):
     zoom IN: worst draw 74–156 ms — the settle repaints the four stone layers (192 under/deco/top/light, 321 spreads them one a frame), 260's
       zoomed tiles bake (z99Build, 50–120 ms alone) and 194's wear; AND every frame of the 1.1 s ease painted the 169 tiles directly (235's cache
       rebuilt 16–19 times: 260 forgets its zoomed chunks while unzoomed, so 294's "scaled last chunks" path had nothing to scale).
     zoom OUT: worst draw 37–53 ms — the unzoomed tiles cache had been overwritten by those direct frames, and the stone layers repaint.
   THE FIX — the zoom level the player is likely to use next (the other of zoomed / unzoomed, at the current camera target) is painted in
   advance, in small pieces while the board is idle, into a SECOND SLOT of each cache; the draw that needs it swaps it in instead of painting:
     1 stone layers: ZB101.alt[name] beside AR91.L[name]; a key match swaps the holders (the one left goes to the second slot, so toggling back
       is free too). 208's reference frames are reused when one with the same geometry exists (ZB101.refMap), so the keys meet.
     2 zoomed tiles (260 Z99 chunks): kept while unzoomed (not forgotten), pre-baked for the next zoom-in — so the ease draws them scaled (294)
       and the settle hits; unzoomed tiles (235 TILES96): a second slot keeps the unzoomed bake through the zoomed frames, pre-baked when stale.
     3 wear (194): a second slot, swapped by key (the key is 194's, rebuilt in zb101WearKey — keep the two in step).
   IDLE ONLY: requestIdleCallback (timeout ZB101.timeout; setTimeout where there is none) after a draw; work only while nobody touched the
   page for ZB101.quietMs, no CPU acting (unless paused), no window, no zoom/camera ease, tab visible, not idle92 (204: the page sleeps then),
   never HEADLESS / sims / lessons-only boards (naumachia, chariot, designer, pen). Each slice ≤ ZB101.budget ms: layers and tiles are painted
   in horizontal BANDS (a clip on whole device rows — pixels inside a band are the same as one paint), each band sized from the last one's
   time (ZB101.target). Memory: the second slots stay under ZB101.maxPx device pixels (a phone at dpr 3 gets the biggest layers only).
   MEASURED AFTER (same script, pre-bake on vs off alternated in one page): zoom IN worst draw 83–94 → 13–36 ms, sum of draws 938–971 → 171–198 ms;
   zoom OUT 37–63 → 11–37 ms; a pinch to 1.3 is unchanged (there is no level to guess). Pre-bake ≈ 130–160 ms of work in ~15–50 slices, median
   ~7 ms (a first band can take a GC pause). Bands differ from one paint only by edge anti-aliasing (< 0.6% of pixels, ≤ 24 levels; Skia rasterises
   a path clipped to a band slightly differently) — ZB101.whole (a set of layer names) paints those in one piece, exact.
   Kill switch localStorage flavius_zoombake101off=1 (the wrappers pass straight through). Stats ZB101.stats (tv101z).
   ========================================================= */
const ZB101={on:true,budget:8 /* TWEAK: ms of pre-bake work in one idle slice */,target:5 /* TWEAK: ms a band aims at */,quietMs:500 /* TWEAK: no input this long before baking */,
  timeout:1500,rows0:16 /* the first band of a piece (rows) */,maxPx:32e6 /* TWEAK: device pixels the second slots may hold */,alt:{},t96:null,t96u:false,wear:null,wearNone:null,job:null,ric:0,chkAt:-1e9,
  inB:false,tst:null,tilesPaint:null,sig:'',
  stats:{slices:0,bands:0,maxSlice:0,sumMs:0,pieces:{ar:0,z99:0,t96:0,wear:0},swaps:0,swapsBy:{ar:0,t96:0,wear:0,z99:0},aborts:0,checks:0,checkMs:0,skipMem:0}};
try{ZB101.on=localStorage.getItem('flavius_zoombake101off')!=='1'}catch(e){}
ZB101.drop=function(){for(const k in ZB101.alt){const A=ZB101.alt[k];if(A){try{z99Drop(A)}catch(e){}if(A.cv){A.cv.width=0;A.cv.height=0}}}ZB101.alt={};ZB101.refMap.clear();ZB101.t96=null;ZB101.wear=null;ZB101.wearNone=null;ZB101.job=null;ZB101.sig=''};
const ZB101_NAMES=['under','top','deco','light'];
function zb101Ok(){try{return ZB101.on&&!HEADLESS&&typeof AR91!=='undefined'&&typeof Z100!=='undefined'&&typeof Z99!=='undefined'&&typeof TILES96!=='undefined'}catch(e){return false}}

/* ---------------- the second slots ---------------- */
/* 208's reference frame: a new one with the same geometry as a recent one IS that one (same id → the keys painted for it still match) */
/* (ZB101.refMap: id → reference; kept while a cached layer's key names it, plus the newest few — the zoom's ease makes one a frame) */
ZB101.refMap=new Map();
function zb101RefIds(){const ids=new Set();const add=h=>{const m=h&&h.key&&/\|r(\d+)\|/.exec(h.key);if(m)ids.add(+m[1])};
  if(typeof AR91!=='undefined')for(const k in AR91.L)add(AR91.L[k]);for(const k in ZB101.alt)add(ZB101.alt[k]);if(ZB101.job&&ZB101.job.K&&ZB101.job.K.ref)ids.add(ZB101.job.K.ref.id);return ids}
if(typeof ar92Ref==='function'){const base=ar92Ref;ar92Ref=function(){const prev=AR92.ref;let r=base.apply(this,arguments);if(!ZB101.on||!r||r===prev||ZB101.refMap.get(r.id)===r)return r;
  for(const q of ZB101.refMap.values())if(q!==r&&q.tw===r.tw&&q.p===r.p&&q.w===r.w&&q.h===r.h&&q.ox===r.ox&&q.oy===r.oy){AR92.ref=q;if(r.id===AR92.n)AR92.n-- /* the new one is dropped: its id is free again (AR92.n counts real new frames) */;return q}
  ZB101.refMap.set(r.id,r);
  if(ZB101.refMap.size>24){const keep=zb101RefIds();const all=[...ZB101.refMap.keys()];const newest=new Set(all.slice(-8));for(const id of all)if(!keep.has(id)&&!newest.has(id))ZB101.refMap.delete(id)}
  return r}}
/* stone layers: a key that waits in the second slot is swapped in (nothing painted) */
if(typeof ar91Layer==='function'){const base=ar91Layer;ar91Layer=function(name,key,paint){
  if(ZB101.on&&!ZB101.inB&&name!=='sky'){const A=ZB101.alt[name],L=AR91.L[name];
    if(A&&A.key===key&&(!L||L.key!==key)){AR91.L[name]=A;if(L){try{z99Drop(L)}catch(e){}ZB101.alt[name]=L}else delete ZB101.alt[name];ZB101.stats.swaps++;ZB101.stats.swapsBy.ar++}}
  return base.apply(this,arguments)}}
/* tiles: 260 forgets its zoomed chunks on every unzoomed frame (Z99.key=null) — kept now (the key holds everything they show); 235's unzoomed
   bake moves to the second slot before a zoomed frame paints over it, and comes back by key */
if(typeof tiles96Paint==='function'){const base=tiles96Paint;tiles96Paint=function(paint){
  if(!ZB101.on||ZB101.inB||HEADLESS)return base.apply(this,arguments);
  const T=TILES96;let zoomed=false;try{zoomed=z99Zoomed()}catch(e){}
  try{if(zoomed){if(T.key&&ZB101.t96u&&T.cv&&!(ZB101.t96&&ZB101.t96.key===T.key)){const A=ZB101.t96;ZB101.t96={cv:T.cv,key:T.key,st:T.st};T.cv=A&&A.cv||null;T.key=T.last=null;ZB101.t96u=false}}
    else if(ZB101.t96&&ZB101.t96.key&&T.on&&S&&!(typeof isNaum==='function'&&isNaum())&&!(typeof isChariot==='function'&&isChariot())&&!S.ed94){const z0=AR91.z;if(z0>1&&z0<=1.001)AR91.z=1;let k;try{k=tiles96Key()}finally{AR91.z=z0}
      if(k!==T.key&&ZB101.t96.key===k){const A=ZB101.t96;ZB101.t96={cv:T.cv,key:T.key,st:T.st};T.cv=A.cv;T.key=T.last=k;T.st=A.st;ZB101.stats.swaps++;ZB101.stats.swapsBy.t96++}}}catch(e){console.error(e)}
  /* the first / last frames of a zoom ease (1 < z ≤ 1.001: TW not scaled yet) are the unzoomed board but keyed (and the sand grain scaled) by
     that z — one 235 rebuild each way; they are painted at z = 1 (the grain 0.1% off for a frame or two) */
  const z0=AR91.z;const tr=!zoomed&&z0>1&&z0<=1.001;if(tr)AR91.z=1;
  const k99=Z99.key;let r;try{r=base.apply(this,arguments)}finally{if(tr)AR91.z=z0}
  if(!zoomed){if(Z99.key==null&&k99)Z99.key=k99;ZB101.t96u=!!T.key}
  return r}}
/* wear: 194's own key (zb101WearKey mirrors it) picks the second slot */
const ZB101_WF=['cv','key','ox','oy','bx','by','bw','bh','tw','sid','_b99','_b99u'];
function zb101WearKey(rubble){const lite=wear91Lite();const w=wear91St();const dr=drains91();const rubs=(rubble||[]).filter(rb=>rb&&rb.r!=null);const live=rubs.filter(settling91),still=rubs.filter(rb=>!live.includes(rb));
  const dpr=window.devicePixelRatio||1;
  return [sid91(),TW,typeof ROT89!=='undefined'?ROT89.k:0,dpr,lite?1:0,SETTINGS.gore===false?0:1,w?w.ver:0,S.rotation|0,(S.blood||[]).length,(S.blood||[]).map(b=>b.seed).slice(-3).join('.'),
    still.map(rb=>rb.r+','+rb.c+','+rb.dr+','+rb.dc).join(';'),dr.map(d=>Math.round(d.x-OX)+'/'+Math.round(d.y-OY)).join(';'),stone91()?1:0,(typeof TB!=='undefined'&&TB.tileA)||'',(typeof THEME!=='undefined'&&THEME.pillar)||''].join('|')}
function zb101WearSwap(A){const C=WEAR91_C,cur={};for(const f of ZB101_WF){cur[f]=C[f];C[f]=A[f]}return cur}
if(typeof wear91Layer==='function'&&typeof WEAR91_C!=='undefined'){const base=wear91Layer;wear91Layer=function(rubble){
  if(ZB101.on&&!ZB101.inB&&ZB101.wear&&WEAR91.on&&S){try{const k=zb101WearKey(rubble);
    if(k!==WEAR91_C.key&&ZB101.wear.key===k){const old=zb101WearSwap(ZB101.wear);try{z99Drop(old)}catch(e){}ZB101.wear=old.key?old:null;ZB101.stats.swaps++;ZB101.stats.swapsBy.wear++}}catch(e){console.error(e)}}
  return base.apply(this,arguments)}}
/* the raw tiles paint and the canvas state it starts from (the pre-bake paints with the same) */
if(typeof drawLayers93==='function'){const base=drawLayers93;drawLayers93=function(layers){
  if(ZB101.on&&!ZB101.inB&&Array.isArray(layers))layers=layers.map(l=>{if(!l||l[0]!=='tiles')return l;ZB101.tilesPaint=l[1];
    return ['tiles',function(){try{ZB101.tst=z99Save()}catch(e){}return l[1].apply(this,arguments)}]});
  return base.call(this,layers)}}

/* ---------------- the target: the other zoom level, as draw() will set it ---------------- */
function zb101Target(){
  if(!S||!Z100.u||!Z100.u.tw||(typeof CAM!=='undefined'&&CAM.z)||S.pen76||S.exhib||(typeof ar91Lud==='function'&&ar91Lud()))return null;
  if((typeof isNaum==='function'&&isNaum())||(typeof isChariot==='function'&&isChariot())||S.ed94)return null;
  const dpr=window.devicePixelRatio||1,wrap=cv.parentElement;const Wd=wrap&&wrap.clientWidth?wrap.clientWidth:cv.width/dpr,Hd=parseFloat(cv.style.height)||cv.height/dpr;const u=Z100.u;
  if((AR91.z||1)>1.001){const z=DUEL.z+(1-DUEL.z)*1;if(z>1.001)return null;
    return {zoomed:false,z,TW:u.tw,TH:u.tw/2,OX:u.ox,OY:u.oy,det:false,Wd,Hd}}
  if(typeof duelZoneOn==='function'&&duelZoneOn())return null; /* the duel leans in to 1.75: past 294's whole-arena frame */
  const z=DUEL.z+(FREE_ZOOM-DUEL.z)*1;if(z<=1.05||z*z>Z100.maxK)return null;
  const TWz=u.tw*z,THz=TWz/2;let OX=Wd/2,OY=Hd*0.56-N*THz/2;
  if(!(typeof SETTINGS!=='undefined'&&SETTINGS.cam88===false)&&!S.over){const p=typeof cur==='function'?cur():null;
    if(p&&p.r!=null){let r=p.r,c=p.c;if(typeof ROT89!=='undefined'&&ROT89.k&&typeof rot89==='function'){const v=rot89(r,c,ROT89.k);r=v[0];c=v[1]}OX=Wd/2-(c-r)*TWz/2;OY=Hd*0.5-(c+r)*THz/2}}
  OX=Math.round(OX*dpr)/dpr;OY=Math.round(OY*dpr)/dpr;
  return {zoomed:true,z,TW:TWz,TH:THz,OX,OY,det:typeof ar91On==='function'&&ar91On(),Wd,Hd}}
/* run fn with the board globals set to the target G (everything put back after; the board canvas's state too) */
function zb101With(G,fn){const dpr=window.devicePixelRatio||1;
  const s={TW,TH,OX,OY,z:AR91.z,det:AR91.det,ref:AR92.ref,l93:typeof LAYERS93!=='undefined'?LAYERS93.on:null,c:z99Save(),rimIn:Z99.rimIn};
  TW=G.TW;TH=G.TH;OX=G.OX;OY=G.OY;AR91.z=G.z;AR91.det=G.det;if(s.l93!=null)LAYERS93.on=false;ZB101.inB=true;ctx.setTransform(dpr,0,0,dpr,0,0);
  try{return fn()}finally{TW=s.TW;TH=s.TH;OX=s.OX;OY=s.OY;AR91.z=s.z;AR91.det=s.det;AR92.ref=s.ref;if(s.l93!=null)LAYERS93.on=s.l93;Z99.rimIn=s.rimIn;z99Restore(s.c);ZB101.inB=false}}
/* the keys each cache will ask for at the target */
function zb101Keys(G){return zb101With(G,()=>{const o={};
  if(typeof ar91On==='function'&&ar91On()){const K=ar91Key();o.ref=AR92.ref;o.under=K;o.deco=K+'|'+ar91DecoKey();o.top=K+'|'+(AR91.det?1:0);if(!(typeof night91On==='function'&&night91On()))o.light=K}
  if(G.zoomed){if(Z99.on&&Z99.cache&&ZB101.tilesPaint&&z99Use()){Z99.rimIn=!STANDS&&!!Z99.rimPaint&&!(typeof LAYERS93!=='undefined'&&LAYERS93.dbg&&LAYERS93.dbg.has('tiles'));o.rimIn=Z99.rimIn;o.z99=z99Key()}}
  else if(TILES96.on&&ZB101.tilesPaint)o.t96=tiles96Key();
  if(typeof WEAR91!=='undefined'&&WEAR91.on)o.wear=zb101WearKey(S.rubble);
  return o})}
function zb101Px(){let n=0;for(const k in ZB101.alt){const A=ZB101.alt[k];if(A&&A.cv)n+=A.cv.width*A.cv.height}if(ZB101.t96&&ZB101.t96.cv)n+=ZB101.t96.cv.width*ZB101.t96.cv.height;return n}
/* what is missing at the target */
function zb101Plan(G,K){const P=[];
  for(const name of ZB101_NAMES){const key=K[name];if(!key)continue;const L=AR91.L[name],A=ZB101.alt[name];if((L&&L.key===key)||(A&&A.key===key))continue;P.push({k:'ar',name,key})}
  if(K.z99&&Z99.key!==K.z99)P.push({k:'z99',key:K.z99});
  if(K.t96&&TILES96.key!==K.t96&&!(ZB101.t96&&ZB101.t96.key===K.t96))P.push({k:'t96',key:K.t96});
  if(K.wear&&WEAR91_C.key!==K.wear&&!(ZB101.wear&&ZB101.wear.key===K.wear)&&ZB101.wearNone!==K.wear)P.push({k:'wear',key:K.wear});
  return P}

/* ---------------- the pieces, band by band ---------------- */
/* band height from the last bands: ms ≈ a + b·rows, a = the cheapest band seen (the paint walking everything), b smoothed; at most ×2 a band */
function zb101Rows(pc,left){const T=Math.min(ZB101.target,left);const lo=pc.k==='ar'?8:24;if(!pc.ms)return Math.min(pc.rows||32,pc.H);
  pc.mn=Math.min(pc.mn||1e9,pc.ms);const a=pc.mn,b0=Math.max(0,(pc.ms-a)/Math.max(1,pc.rows));pc.b=pc.b==null?b0:pc.b*0.6+b0*0.4;
  let r=T-a>0.5&&pc.b>0.0005?Math.floor((T-a)/pc.b):pc.rows*2;r=Math.max(lo,Math.min(pc.H,r,pc.rows*2));return r}
function zb101Paint(name){const W=ZB101.G;
  if(name==='under')return g=>ar91Under(g);if(name==='deco')return g=>ar91DecoPaint(g);if(name==='top')return (g,out)=>ar91TopPaint(g,out);return g=>ar91LightPaint(g,W.Wd,W.Hd)}
/* one band of a stone layer into its second-slot holder (208's ar91Layer, clipped to rows y0..y1) */
function zb101ArBand(pc,left){const dpr=window.devicePixelRatio||1;
  if(!pc.H0){const R=AR92.ref;const p=R.p,px=Math.round(cv.width*p),py=Math.round(cv.height*p),cw=cv.width+2*px,ch=cv.height+2*py;
    if(zb101Px()+cw*ch-((ZB101.alt[pc.name]&&ZB101.alt[pc.name].cv)?ZB101.alt[pc.name].cv.width*ZB101.alt[pc.name].cv.height:0)>ZB101.maxPx){ZB101.stats.skipMem++;return 'skip'}
    const c2=document.createElement('canvas');c2.width=cw;c2.height=ch;c2.getContext('2d').clearRect(0,0,1,1);pc.H0={cv:c2,key:'',px,py,ox:R.ox,oy:R.oy,ref:R};pc.H=ch;pc.y=0;pc.rows=ZB101.rows0;return 'more' /* the canvas's own slice */}
  const H=pc.H0,g=H.cv.getContext('2d');const rows=zb101Rows(pc,left),y0=pc.y,y1=Math.min(pc.H,y0+rows);const t0=performance.now();
  const tex=ar91Tex();g.save();g.setTransform(1,0,0,1,0,0);g.beginPath();g.rect(0,y0,H.cv.width,y1-y0);g.clip();
  g.setTransform(dpr,0,0,dpr,H.px+(H.ox-OX)*dpr,H.py+(H.oy-OY)*dpr);AR91PAT=tex?g.createPattern(tex,'repeat'):null;const out={fires:[],walls:[]};
  try{zb101Paint(pc.name)(g,out)}catch(e){console.error(e)}finally{AR91PAT=null;g.restore()}
  if(!H.raw)H.raw=out;H.tex=!!tex;pc.ms=performance.now()-t0;pc.rows=y1-y0;pc.y=y1;
  if(pc.y<pc.H)return 'more';
  Object.assign(H,{key:pc.key,out:H.raw,pox:OX,poy:OY,sx:OX,sy:OY,tw:TW});delete H.ref;
  const old=ZB101.alt[pc.name];if(old&&old!==AR91.L[pc.name]){try{z99Drop(old)}catch(e){}if(old.cv){old.cv.width=0;old.cv.height=0}}
  ZB101.alt[pc.name]=H;ZB101.stats.pieces.ar++;return 'done'}
/* the board canvas's context, pointed at another canvas for one band: 07-ui's ctx is a const that every paint uses, so for the band every
   method and property of it is an own property forwarding to g (deleted after — the prototype's own come back). Painting the tiles on the board
   canvas itself and copying them out (260/235's way) costs two read-backs of the screen a band (~5 ms each in software raster). */
const ZB101_CTXK=(()=>{const o=[];try{const P=CanvasRenderingContext2D.prototype;for(const k of Object.getOwnPropertyNames(P)){if(k==='constructor')continue;const d=Object.getOwnPropertyDescriptor(P,k);
  if(d&&typeof d.value==='function')o.push([k,0]);else if(d&&d.get)o.push([k,d.set?1:2])}}catch(e){}return o})();
const ZB101_DRAW=new Set(['fill','stroke','fillRect','strokeRect','fillText','strokeText','drawImage','putImageData','clip']);
function zb101Point(g,skip){for(const [k,t] of ZB101_CTXK){if(t===0){const f=g[k];ctx[k]=ZB101_DRAW.has(k)?function(){if(skip())return;return f.apply(g,arguments)}:function(){return f.apply(g,arguments)}}
  else Object.defineProperty(ctx,k,{configurable:true,enumerable:false,get(){return g[k]},set(v){if(t===1)g[k]=v}})}}
function zb101Unpoint(){for(const [k] of ZB101_CTXK)delete ctx[k]}
/* one band (rows y0..y1 of dst) of a tiles bake: the raw tiles paint (07-ui's 'tiles' layer) with the board origin at (ox, oy), clipped */
function zb101TileBand(pc,dst,ox,oy,w,left,rim){const dpr=window.devicePixelRatio||1;const rows=zb101Rows(pc,left);const y0=pc.yc,y1=Math.min(pc.hc,y0+rows),hh=y1-y0;const t0=performance.now();
  const st=ZB101.tst||z99Save();const s0={OX,OY};const g=dst.getContext('2d');
  g.save();g.setTransform(1,0,0,1,0,0);g.clearRect(0,y0,w,hh);g.beginPath();g.rect(0,y0,w,hh);g.clip();
  /* a tile wholly outside the band is not painted at all (it would be clipped away): tilePath marks it, and while it is marked fill/stroke and
     136/210's per-tile sand, scars and seam stroke (drawShipTile) do nothing — the save/restore pairs still run */
  const tp0=tilePath,dst0=drawShipTile,X0=-dpr*TW,X1=w+dpr*TW;let off=false;
  const out=(r,c)=>{const p=iso(r,c);const t=g.getTransform();const m=t.d*TW*0.6;const ya=t.d*p.y+t.f,yb=t.d*(p.y+TH)+t.f,xa=t.a*(p.x-TW/2)+t.e,xb=t.a*(p.x+TW/2)+t.e;
    return yb+m<y0||ya-m>y1||xb+m<X0||xa-m>X1};
  tilePath=function(r,c){off=out(r,c);if(off)return;return tp0.apply(this,arguments)};drawShipTile=function(){if(off)return;return dst0.apply(this,arguments)};
  zb101Point(g,()=>off);
  try{z99Restore({...st,t:new DOMMatrix([dpr,0,0,dpr,0,0])});OX=ox;OY=oy;if(rim&&Z99.rimPaint)Z99.rimPaint();ZB101.tilesPaint();pc.st={fs:g.fillStyle,ss:g.strokeStyle,lw:g.lineWidth}}
  catch(e){console.error(e);pc.bad=true}
  finally{zb101Unpoint();tilePath=tp0;drawShipTile=dst0;OX=s0.OX;OY=s0.OY;g.restore()}
  pc.ms=performance.now()-t0;pc.rows=hh;pc.yc=y1;return pc.yc>=pc.hc}
/* 260's zoomed tiles: the board frame in screen-sized chunks (z99Build's layout), each chunk in bands */
function zb101Z99(pc,left){const dpr=window.devicePixelRatio||1;
  if(!pc.ch){const W0=cv.width,H0=cv.height;const m=Math.ceil(TW)+24;const BW=Math.ceil((N*TW+2*m)*dpr),BH=Math.ceil((N*TH+2*m)*dpr);if(BW*BH>Z99.maxPx)return 'skip';
    pc.rox=Math.round((m+N*TW/2)*dpr)/dpr;pc.roy=Math.round(m*dpr)/dpr;pc.ch=[];for(let y=0;y<BH;y+=H0)for(let x=0;x<BW;x+=W0){const w=Math.min(W0,BW-x),h=Math.min(H0,BH-y);
      const c2=document.createElement('canvas');c2.width=w;c2.height=h;pc.ch.push({cv:c2,key:null,x,y})}pc.i=0;pc.yc=0;pc.hc=pc.ch[0].cv.height;pc.rows=ZB101.rows0;pc.H=pc.hc}
  const c=pc.ch[pc.i];if(zb101TileBand(pc,c.cv,pc.rox-c.x/dpr,pc.roy-c.y/dpr,c.cv.width,left,ZB101.K.rimIn)){pc.i++;if(pc.i<pc.ch.length){pc.yc=0;pc.hc=pc.H=pc.ch[pc.i].cv.height}}
  if(pc.bad)return 'skip';if(pc.i<pc.ch.length)return 'more';
  for(const o of Z99.ch)try{z99Drop(o)}catch(e){}for(const o of pc.ch)o.key=pc.key+'|'+o.x+','+o.y;
  Z99.ch=pc.ch;Z99.cv=pc.ch[0].cv;Z99.rox=pc.rox;Z99.roy=pc.roy;Z99.key=pc.key;Z99.st=pc.st;Z99.stats.passes=pc.ch.length;
  Z100.k99=pc.key;Z100.tw99=TW;Z100.o99={x:OX,y:OY};ZB101.stats.pieces.z99++;return 'done'}
/* 235's unzoomed tiles: the screen in bands, into the second slot */
function zb101T96(pc,left){if(!pc.dst){const c2=document.createElement('canvas');c2.width=cv.width;c2.height=cv.height;pc.dst=c2;pc.yc=0;pc.hc=pc.H=cv.height;pc.rows=ZB101.rows0}
  const fin=zb101TileBand(pc,pc.dst,OX,OY,cv.width,left,false);if(pc.bad)return 'skip';if(!fin)return 'more';
  ZB101.t96={cv:pc.dst,key:pc.key,st:pc.st};ZB101.stats.pieces.t96++;return 'done'}
/* 194's wear bake at the target, into the second slot (one piece: it is small) */
function zb101Wear(pc){if((S.rubble||[]).some(rb=>rb&&rb.r!=null&&settling91(rb)))return 'skip';
  const C=WEAR91_C,keep=zb101WearSwap({cv:document.createElement('canvas'),key:''});const zi=z99Img;
  const W=WEAR91,sv={stats:W.stats,bakeStats:W.bakeStats,lastBakeMs:W.lastBakeMs,lastMs:W.lastMs,bakes:W.bakes};let got=null;
  try{z99Img=function(){};wear91Layer(S.rubble);if(C.key===pc.key){got={};for(const f of ZB101_WF)got[f]=C[f];got.tw=TW;got.sid=sid91()}}
  finally{z99Img=zi;zb101WearSwap(keep);Object.assign(W,sv)}
  if(got){ZB101.wear=got;ZB101.stats.pieces.wear++}else ZB101.wearNone=pc.key;return 'done'}
function zb101Step(pc,left){if(pc.k==='ar')return zb101ArBand(pc,left);if(pc.k==='z99')return zb101Z99(pc,left);if(pc.k==='t96')return zb101T96(pc,left);return zb101Wear(pc)}

/* ---------------- the idle scheduler ---------------- */
function zb101Allowed(){try{if(!zb101Ok()||!S||S.over||S.phase==='setup'||S.snap||S.sim||S.tutorial)return false;
  if(document.hidden||(typeof PERF92!=='undefined'&&(PERF92.idle||PERF92.hidden)))return false;
  if(typeof CUR_MODAL!=='undefined'&&CUR_MODAL)return false;if(S.busy&&SPEED!=='pause')return false;
  const p=typeof cur==='function'?cur():null;if(p&&p.cpu&&SPEED!=='pause')return false;
  if(typeof PERF92!=='undefined'&&performance.now()-(PERF92.lastInput||0)<ZB101.quietMs)return false;
  if(Z100.st||(typeof Z101!=='undefined'&&Z101.raf)||(typeof DUEL!=='undefined'&&(DUEL.raf||performance.now()-DUEL.t0<1200))||(typeof CAM!=='undefined'&&CAM.raf))return false;
  return true}catch(e){return false}}
function zb101Ask(){if(ZB101.ric)return;const go=dl=>{ZB101.ric=0;try{zb101Idle(dl)}catch(e){console.error(e)}};
  ZB101.ric=typeof requestIdleCallback==='function'?requestIdleCallback(go,{timeout:ZB101.timeout}):setTimeout(()=>go(null),250)}
function zb101Kick(){if(!ZB101.on||ZB101.ric||HEADLESS)return;const now=performance.now();if(!ZB101.job&&now-ZB101.chkAt<1000)return;if(!zb101Allowed())return;zb101Ask()}
function zb101Idle(dl){if(!zb101Allowed()){if(ZB101.job)ZB101.stats.aborts++;return}
  const t0=performance.now();const lim=dl&&!dl.didTimeout?Math.min(ZB101.budget,dl.timeRemaining()):ZB101.budget;if(lim<2){zb101Ask();return}
  const G=zb101Target();if(!G){ZB101.job=null;ZB101.chkAt=t0;return}
  /* the keys at the target (≈0.2 ms): a job whose keys changed starts again */
  let J=ZB101.job;if(J&&t0-J.at<400&&J.G.zoomed===G.zoomed){ZB101.G=J.G;ZB101.K=J.K;return zb101Work(J,t0,lim)}
  const K=zb101Keys(G);ZB101.stats.checks++;const sig=JSON.stringify([G.zoomed,G.TW,G.OX,G.OY,K.under,K.deco,K.top,K.light,K.z99,K.t96,K.wear]);ZB101.chkAt=t0;
  if(!J||J.sig!==sig){J=ZB101.job={sig,G,K,P:zb101Plan(G,K)}}J.at=t0;
  ZB101.stats.checkMs=Math.max(ZB101.stats.checkMs,performance.now()-t0);
  if(!J.P.length){ZB101.job=null;return}
  if(performance.now()-t0>2){zb101Slice(t0);zb101Ask();return} /* the check filled this slice: the work goes in the next */
  ZB101.G=J.G;ZB101.K=J.K;zb101Work(J,t0,lim)}
function zb101Slice(t0){const ms=performance.now()-t0,S1=ZB101.stats;S1.slices++;S1.sumMs+=ms;S1.maxSlice=Math.max(S1.maxSlice,ms);(S1.sl||(S1.sl=[])).push(Math.round(ms*10)/10);if(S1.sl.length>300)S1.sl.shift()}
function zb101Work(J,t0,lim){let bands=0;const G=J.G,K=J.K;
  zb101With(G,()=>{if(K.ref)AR92.ref=K.ref;
    while(J.P.length){const left=lim-(performance.now()-t0);const pc=J.P[0];if(left<1.5||(pc.ms&&pc.ms>left*1.6&&bands))break;
      const tb=performance.now();const r=zb101Step(pc,left);bands++;ZB101.stats.bands++;{const k=pc.k+(pc.name?':'+pc.name:''),P=ZB101.stats.per||(ZB101.stats.per={}),q=P[k]||(P[k]={n:0,ms:0,min:1e9,max:0}),d=performance.now()-tb;q.n++;q.ms=Math.round((q.ms+d)*10)/10;q.min=Math.min(q.min,Math.round(d*10)/10);q.max=Math.max(q.max,Math.round(d*10)/10);if(ZB101.trace)ZB101.trace.push(k+':'+(pc.rows|0)+':'+d.toFixed(1)) /* ZB101.trace=[] → per band name:rows:ms (profiling) */}if(r!=='more')J.P.shift()}});
  zb101Slice(t0);
  if(J.P.length)zb101Ask();else ZB101.job=null}
/* is the other zoom level ready? (tests) */
ZB101.ready=function(){const G=zb101Target();if(!G)return null;const K=zb101Keys(G);return zb101Plan(G,K).map(p=>p.k+(p.name?':'+p.name:''))};
{const base=draw;draw=function(){const r=base.apply(this,arguments);if(ZB101.on&&!ZB101.inB)try{zb101Kick()}catch(e){}return r}}

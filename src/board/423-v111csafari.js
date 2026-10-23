/* =====================================================================
   423-v111csafari — v1.11c SAFARI FOLLOW-UP (his first v1.11b Safari ⏺, 2026-10-22: Safari 26.6 Mac, DPR 1.5, ZOOMED 1.4, Lighting light,
   4-CPU match, Normal: 32.9 fps, p50 17 ms, p95 99 ms). DISPLAY ONLY: rules, dice (RNG), S, the log, saves and the online hash are
   untouched — nothing here calls rand() or sends anything. Same pixels: every cached picture is the calls the old path drew (zoomed
   frames while the camera moves: within a whole-pixel slide's raster wobble, Z1).
   WHY (the recording): 420's v111 block read hit / miss / flush 0 in every range and pots 0 — S1 + S2 never ran; every big slow frame
   (100–190 ms) held one 346 sh103Sharpen (getImageData + an unsharp loop, ≈ 50 ms each, 11 a 10 s); 396's aim106Body read one pixel
   back per hover test (24 getImageData a 10 s). getImageData in all: 915 ms / 10 s.
   ROOT CAUSES of "S1 did nothing": (a) 420's s111OK() refused every zoomed board (AR91.z > 1.001) — the zoomed board's camera moves on
   most draws (86 camFocus eases 18% a draw, so an ease is ~20 draws), and 420's caches compared calls absolutely (a moved camera = a new
   picture); (b) zoomed, 260's rim wrapper paints the rim itself (z99Rim) and never calls the rim layer, so 420's M / R1 range never began;
   (c) the jugs (S2) were keyed by their device box: a camera move = a new key every draw, never a hit (and never the live back-off).
   • Z1 THE STILL BOARD, ZOOMED — CAMERA-RELATIVE. While zoomed (OX/OY on whole device pixels, 07-ui rounds them) 420's ranges run with
     zoomed entries of their own and every call is compared RELATIVE TO THE CAMERA: each coordinate is taken to device pixels through the
     transform at that call and the camera's device offset taken off; a picture blitted 1:1 and cut to the screen (260 z99Draw: the stone
     layers, the tiles chunks, the light) compares as the whole picture at its board place; gradients / patterns by where they land on the
     device (a linear gradient by its place along its own line; 313/321's huge "all but the board" rects as one token).
     CAMERA HOLDING (the same camera as the board draw before): 420's exact screen picture — every call (the strips too) replayed at the
     screen's own place; equal calls → one blit. CAMERA MOVING: equal calls (the camera only slid by whole pixels) → ONE blit from a
     BOARD-FRAME picture (BF) that holds the range for the window and a margin (Z1.margin a side, stretched toward where the camera is
     going: 4.56 × its last step = the rest of 86's ease); different (or the window left the BF) → the calls replayed into the BF (the cut
     blits whole) and blitted. Anything that is not a pure slide (a culled spectator coming into view, a chunk entering the screen, the
     jugs' screen-seeded speckles) changes the calls → a miss, never a wrong picture. A slide is not bit-exact in Skia's raster: a long edge
     crossing the screen edge rasterises a few levels differently (tv111c: max 11–18 on ≤ 0.05% of pixels, mean ≈ 0.05) — the same wobble
     a live frame has from one camera step to the next; holding frames are exact (≤ 8, as tv111s). The sky (192, fixed to the screen,
     destination-over) ends the range before it and stays live.
     419's Amphitheatre strips (the composite painted straight into the screen edges the cached under / deco layers do not reach — fixed
     to the screen) are not in the BF: they are drawn live, before the BF blit, in their own order, when nothing else in the range is
     under them or blends over them with another mode (checked call by call on device boxes); otherwise that draw is live (exact).
     Begins at z99Rim (or the stands / tiles layer when 260 keeps the rim in the tiles cache). 420's hysteresis back-off (Z1.rest).
   • Z2 THE JUGS ZOOMED: keyed by their place on the BOARD (device pixels from the camera) + box size, compared relative to their box.
   • Z3 SHARPEN OFF THE MAIN THREAD: 346's unsharp mask of an up-scaled cell runs in a Worker (346's own sh103Sharpen source, unchanged,
     on an OffscreenCanvas): the cell is copied with createImageBitmap (no read-back), the result comes back as pixels and is put into the
     same cell (putImageData — the same call the sync path ends with = the same pixels; tv111c). Until then (1–3 frames) the cell draws
     unsharpened, as 346 already did when its 2-a-frame budget was spent. Anything made from the cell meanwhile (321's base clean-up
     cache, 412's jobs for it, 396's outline sprites) is dropped when the pixels land, so it is made again from the sharp cell. No Worker /
     no OffscreenCanvas 2D / a worker error: the cell is sharpened on the main thread only once the board is quiet (no board draw for
     Z3.quietMs), never inside a busy frame.
   • Z4 AIM HIT MASKS: 396's body test (one 1-px read-back per figure image per hover) reads each image's source rectangle ONCE (per
     image × rectangle × content version) into an alpha mask (alpha > 40, as before); later tests are array look-ups.
   • Z5 THE RECORDER (405 ⏺): a "v111c" block — zoomed board draws, hit / miss / flush / live per zoomed range + hit %, hits while the
     camera moved, strips drawn live, the BF size; jugs zoomed; sharpen jobs + main-thread sharpen ms (~0 expected); aim mask builds / hits.
   Only on WebKit (406 P107S.webkit; flavius_v107safariforce=1 = any browser) and never HEADLESS; Z1/Z2 need 420 on.
   Kill switch localStorage flavius_v111csoff=1 (or #perf=v111csoff): nothing installed — exactly v1.11b. flavius_v111cbfoff=1: zoomed
   frames with a moving camera draw live (A/B for the board-frame picture). Stats V111C.st. Bench
   tools/bench/safari111.js --zoom 1.4 --only b,c. Test tv111c.
   ===================================================================== */
const V111C={off:(()=>{try{return localStorage.getItem('flavius_v111csoff')==='1'||(typeof PERF_SWL!=='undefined'&&PERF_SWL.includes('v111csoff'))}catch(e){return false}})(),
  on:false,zOn:false,zNow:false,cam:null,pcam:null,noPot:false,began:false,gr:new WeakMap(),
  st:{zDraws:0,zRanges:0,noCam:0,movHit:0,exactHit:0,exactBuild:0,strips:0,stripFail:0,stripDraws:0,builds:0,buildMs:0,bfPx:0,
    sh:{async:0,done:0,same:0,fail:0,idle:0,pend:0,mainMs:0,mainN:0,late:0},aim:{tests:0,built:0,hits:0,taint:0}}};
V111C.on=!V111C.off&&typeof P107S!=='undefined'&&!P107S.off&&!!P107S.webkit&&typeof CanvasRenderingContext2D!=='undefined';
V111C.zOn=V111C.on&&typeof V111!=='undefined'&&V111.on&&typeof RG111!=='undefined'&&typeof rg111Begin==='function'&&typeof S1_111!=='undefined';
const Z1_111C={margin:0.2 /* TWEAK: BF margin round the window (share of the screen, each side) */,lead:4.56 /* 86's ease: the rest of an ease = 0.82/0.18 × the last step */,
  rest:60 /* TWEAK: board draws live after 3 misses in 4 (doubling while it keeps failing) */,
  maxPx:16e6 /* TWEAK: device pixels all zoomed pictures may hold (~64 MB) */,drop:240 /* board draws unused before a zoomed picture is let go */,
  bf:(()=>{try{return localStorage.getItem('flavius_v111cbfoff')!=='1'}catch(e){return true}})() /* A/B: false = only the still (screen) picture zoomed, moving frames live */};
const S1Z_111C={M:{st:rg111Stat(),rest:Z1_111C.rest},R1:{st:rg111Stat(),rest:Z1_111C.rest},R2:{st:rg111Stat(),rest:Z1_111C.rest},D:{st:rg111Stat(),rest:Z1_111C.rest}};
const S2Z_111C={map:new Map(),max:48,st:rg111Stat()};
/* camera-relative numbers on a fine grid shifted off the round values (a half pixel / a 1.5 scale never sits on a rounding edge) */
const v111cQ=v=>Math.round(v*4096+0.37),v111cQ6=v=>Math.round(v*1048576+0.37);
function v111cZoomed(){try{return typeof AR91!=='undefined'&&(AR91.z||1)>1.001}catch(e){return false}}
/* 420's s111OK without its zoom refusal */
function v111cOKz(){try{if(!V111.on||!V111.live||HEADLESS||!S||S.ed94||S.snap)return false;return cv.width>0}catch(e){return false}}

/* ---------------- Z1 · camera-relative calls ---------------- */
/* gradients: the arguments (coordinates are taken through the transform where the gradient is USED) and where the stops start in 420's tag */
if(V111C.zOn){const base=rg111Tag;rg111Tag=function(k,g,a){const r=base.apply(this,arguments);try{if(k!=='createPattern'){const d=RG111.gd.get(g);V111C.gr.set(g,{k,a:Array.prototype.slice.call(a),n:d?d.s.length:0})}}catch(e){}return r}}
function v111cStyleTag(v){const R=RG111;
  if(typeof CanvasGradient!=='undefined'&&v instanceof CanvasGradient){const G=V111C.gr.get(v),d=R.gd.get(v);return G&&d?'g'+G.k+'|'+d.s.slice(G.n):'g#'+rg111Id(v)}
  if(typeof CanvasPattern!=='undefined'&&v instanceof CanvasPattern)return R.pd.get(v)||('p#'+rg111Id(v));return null}
const V111C_GLOBAL=new Set(['copy','source-in','source-out','destination-in','destination-atop']);
const V111C_NOTOK=new Set(['setTransform','translate','scale','rotate','transform','resetTransform']);
/* where a fill / stroke style lands on the device (a gradient's points, a pattern's matrix), relative to the camera */
function v111cGeo(C,T,m,which){const R=RG111;let v;try{v=R.OGET[which].call(R.sink)}catch(e){return}if(!v||typeof v!=='object')return;const cx=C.norm.cx,cy=C.norm.cy;
  const X=(x,y)=>v111cQ(m[0]*x+m[2]*y+m[4]-cx),Y=(x,y)=>v111cQ(m[1]*x+m[3]*y+m[5]-cy);
  if(typeof CanvasGradient!=='undefined'&&v instanceof CanvasGradient){const G=V111C.gr.get(v);if(!G){C.zbad='grad';return}const a=G.a;
    T.push('G',v111cQ6(m[0]),v111cQ6(m[1]),v111cQ6(m[2]),v111cQ6(m[3]));
    /* a linear gradient only varies along its own line: its start is kept as the place along that line (a slide across it is the same paint) */
    if(G.k==='createLinearGradient'){const x0=m[0]*a[0]+m[2]*a[1]+m[4]-cx,y0=m[1]*a[0]+m[3]*a[1]+m[5]-cy,dx=m[0]*(a[2]-a[0])+m[2]*(a[3]-a[1]),dy=m[1]*(a[2]-a[0])+m[3]*(a[3]-a[1]),L2=Math.hypot(dx,dy)||1;
      T.push(v111cQ(dx),v111cQ(dy),v111cQ((x0*dx+y0*dy)/L2))}
    else if(G.k==='createRadialGradient')T.push(X(a[0],a[1]),Y(a[0],a[1]),a[2],X(a[3],a[4]),Y(a[3],a[4]),a[5]);
    else T.push(a[0],X(a[1],a[2]),Y(a[1],a[2]));return}
  if(typeof CanvasPattern!=='undefined'&&v instanceof CanvasPattern){const p=R.pm.get(v)||[1,0,0,1,0,0];
    T.push('Q',v111cQ6(m[0]*p[0]+m[2]*p[1]),v111cQ6(m[1]*p[0]+m[3]*p[1]),v111cQ6(m[0]*p[2]+m[2]*p[3]),v111cQ6(m[1]*p[2]+m[3]*p[3]),
      v111cQ(m[0]*p[4]+m[2]*p[5]+m[4]-cx),v111cQ(m[1]*p[4]+m[3]*p[5]+m[5]-cy))}}
const V111C_INF=[-1e9,-1e9,1e9,1e9];
const v111cHuge=b=>{const W=cv.width,H=cv.height;return b[0]<=-4*W&&b[1]<=-4*H&&b[2]>=5*W&&b[3]>=5*H};
/* one recorded call → its camera-relative tokens (+ its device box for the strip check) */
function v111cTok(C,k,a,m,j){const R=RG111,T=C.tok,cx=C.norm.cx,cy=C.norm.cy;
  if(V111C_NOTOK.has(k))return;
  const pb=C.zp,grow=(X,Y)=>{if(X<pb[0])pb[0]=X;if(Y<pb[1])pb[1]=Y;if(X>pb[2])pb[2]=X;if(Y>pb[3])pb[3]=Y};
  const P=(x,y)=>{const X=m[0]*x+m[2]*y+m[4],Y=m[1]*x+m[3]*y+m[5];T.push(v111cQ(X-cx),v111cQ(Y-cy));if(pb)grow(X,Y)};
  const L=()=>T.push(v111cQ6(m[0]),v111cQ6(m[1]),v111cQ6(m[2]),v111cQ6(m[3]));
  const sc=Math.sqrt(Math.max(m[0]*m[0]+m[1]*m[1],m[2]*m[2]+m[3]*m[3]));
  const corners=(x,y,w,h)=>{const b=[1e9,1e9,-1e9,-1e9];for(const [u,v] of [[x,y],[x+w,y],[x,y+h],[x+w,y+h]]){const X=m[0]*u+m[2]*v+m[4],Y=m[1]*u+m[3]*v+m[5];
    if(X<b[0])b[0]=X;if(Y<b[1])b[1]=Y;if(X>b[2])b[2]=X;if(Y>b[3])b[3]=Y}return b};
  const box=(b,e,glob)=>{let gco='source-over';try{gco=R.OGET.globalCompositeOperation.call(R.sink)}catch(x){}const g=V111C_GLOBAL.has(gco);
    const q=g||C.zfx||!b?V111C_INF:[b[0]-e,b[1]-e,b[2]+e,b[3]+e];C.zb.push({j,b:q,so:gco==='source-over'&&!C.zfx&&!glob})};
  const lw=()=>{let w=1,ml=10;try{w=R.OGET.lineWidth.call(R.sink);ml=R.OGET.miterLimit.call(R.sink)}catch(x){}return w*sc*Math.max(1,ml)/2+2};
  T.push(k);
  switch(k){
    case 'beginPath':C.zp=[1e9,1e9,-1e9,-1e9];return;
    case 'moveTo':case 'lineTo':P(a[0],a[1]);return;
    case 'quadraticCurveTo':P(a[0],a[1]);P(a[2],a[3]);return;
    case 'bezierCurveTo':P(a[0],a[1]);P(a[2],a[3]);P(a[4],a[5]);return;
    case 'arcTo':P(a[0],a[1]);P(a[2],a[3]);T.push(a[4]);L();if(pb){const r=a[4]*sc;grow(pb[0]-r,pb[1]-r);grow(pb[2]+r,pb[3]+r)}return;
    case 'rect':{const b=corners(a[0],a[1],a[2],a[3]);
      /* a rectangle far beyond the screen and any BF on every side (313/321's "everything but the board" clips) is the same everywhere it can show */
      if(!m[1]&&!m[2]&&v111cHuge(b)){T.push('R*',Math.sign(a[2]),Math.sign(a[3]));L();if(pb){grow(-1e9,-1e9);grow(1e9,1e9)}return}
      P(a[0],a[1]);T.push(a[2],a[3]);L();if(pb){grow(b[0],b[1]);grow(b[2],b[3])}return}
    case 'roundRect':{P(a[0],a[1]);T.push(a[2],a[3]);const r=a[4];T.push(Array.isArray(r)?'a'+r.join(','):r&&typeof r==='object'?'o'+[r.x,r.y].join(','):r);L();
      if(pb){const b=corners(a[0],a[1],a[2],a[3]);grow(b[0],b[1]);grow(b[2],b[3])}return}
    case 'arc':P(a[0],a[1]);for(let i=2;i<a.length;i++)T.push(a[i]);L();if(pb){const X=m[0]*a[0]+m[2]*a[1]+m[4],Y=m[1]*a[0]+m[3]*a[1]+m[5],r=a[2]*sc;grow(X-r,Y-r);grow(X+r,Y+r)}return;
    case 'ellipse':P(a[0],a[1]);for(let i=2;i<a.length;i++)T.push(a[i]);L();if(pb){const X=m[0]*a[0]+m[2]*a[1]+m[4],Y=m[1]*a[0]+m[3]*a[1]+m[5],r=Math.max(a[2],a[3])*sc;grow(X-r,Y-r);grow(X+r,Y+r)}return;
    case 'fill':case 'stroke':case 'clip':{let p2=false;for(const x of a){if(typeof Path2D!=='undefined'&&x instanceof Path2D){p2=true;T.push('P'+rg111Id(x));L();T.push(v111cQ(m[4]-cx),v111cQ(m[5]-cy))}else T.push(x)}
      if(k==='clip')return;L();v111cGeo(C,T,m,k==='fill'?'fillStyle':'strokeStyle');
      const b=p2||!C.zp||C.zp[0]>C.zp[2]?null:C.zp;box(b,k==='fill'?1:lw());return}
    case 'fillRect':case 'strokeRect':case 'clearRect':{P(a[0],a[1]);T.push(a[2],a[3]);L();if(k!=='clearRect')v111cGeo(C,T,m,k==='fillRect'?'fillStyle':'strokeStyle');
      box(corners(a[0],a[1],a[2],a[3]),k==='strokeRect'?lw():1,k==='clearRect');return}
    case 'fillText':case 'strokeText':T.push(String(a[0]));P(a[1],a[2]);T.push(a[3]);L();v111cGeo(C,T,m,k==='fillText'?'fillStyle':'strokeStyle');box(null,0);return;
    case 'drawImage':return v111cImg(C,a,m,j,box,corners);
    case 'save':case 'restore':case 'closePath':return;
    default:for(const x of a){const t=rg111Tok(x);if(t===null){C.zbad='obj:'+k;return}T.push(t)}if(R.DRAW.has(k))box(null,0)}}
/* drawImage relative to the camera; 419's strips are kept aside (drawn live) */
function v111cImg(C,a,m,j,box,corners){const R=RG111,T=C.tok,cx=C.norm.cx,cy=C.norm.cy,s=a[0],n=a.length;
  const W=s.naturalWidth||s.videoWidth||s.width||0,H=s.naturalHeight||s.videoHeight||s.height||0;
  let sx=0,sy=0,sw=W,sh=H,dx,dy,dw=W,dh=H;if(n>=9){sx=a[1];sy=a[2];sw=a[3];sh=a[4];dx=a[5];dy=a[6];dw=a[7];dh=a[8]}else if(n>=5){dx=a[1];dy=a[2];dw=a[3];dh=a[4]}else{dx=a[1];dy=a[2]}
  const id=m[0]===1&&m[1]===0&&m[2]===0&&m[3]===1;
  /* 419's Amphitheatre strips: fixed to the screen, drawn live before the BF blit (identity transform, plain source-over, no clip / shadow) */
  if(typeof AMPH111!=='undefined'&&s&&(s===AMPH111.comp||s===AMPH111.fc)){let gco='',fl='none',al=1,sm=true,sq='low';
    try{gco=R.OGET.globalCompositeOperation.call(R.sink);if(R.OGET.filter)fl=R.OGET.filter.call(R.sink);al=R.OGET.globalAlpha.call(R.sink);sm=R.OGET.imageSmoothingEnabled.call(R.sink);if(R.OGET.imageSmoothingQuality)sq=R.OGET.imageSmoothingQuality.call(R.sink)}catch(x){}
    T.pop();C.ztok.push(rg111SrcKey(s),m.join(','),Array.prototype.join.call(a,','),gco,fl,al,sm,sq);   /* compared as they are by the still (screen) picture */
    if(!(id&&!m[4]&&!m[5]&&gco==='source-over'&&fl==='none'&&!C.zfx&&!C.zclips.length&&!C.clip0)){C.zbadS='strip';return}
    C.zs.push({j,a:Array.prototype.slice.call(a),al,sm,sq,b:[dx,dy,dx+dw,dy+dh]});C.zss.add(j);return}
  const key=rg111SrcKey(s);
  /* a 1:1 blit on whole device pixels whose source rectangle is exactly the picture cut to the screen (260's z99Draw) = the whole picture at its place */
  if(n>=9&&id&&sw===dw&&sh===dh){const ox=dx+m[4]-sx,oy=dy+m[5]-sy;
    if(ox===Math.round(ox)&&oy===Math.round(oy)){const ex0=Math.max(0,-ox),ex1=Math.min(W,cv.width-ox),ey0=Math.max(0,-oy),ey1=Math.min(H,cv.height-oy);
      if(sx===ex0&&sx+sw===ex1&&sy===ey0&&sy+sh===ey1){T.push('F',key,ox-cx,oy-cy);C.zu.set(j,{W,H,x:dx-sx,y:dy-sy});box([ox+sx,oy+sy,ox+sx+sw,oy+sy+sh],0);return}}}
  T.push('I',key,v111cQ6(m[0]),v111cQ6(m[1]),v111cQ6(m[2]),v111cQ6(m[3]),v111cQ(m[0]*dx+m[2]*dy+m[4]-cx),v111cQ(m[1]*dx+m[3]*dy+m[5]-cy),dw,dh,sx,sy,sw,sh);
  box(corners(dx,dy,dw,dh),1)}
if(V111C.zOn){const base=rg111Op;rg111Op=function(i,k,f,args,kind,isPath,isTf){const R=RG111,C=R.cur;
  if(!C||!C.norm||kind===1||kind===2||kind===3)return base.apply(this,arguments);
  if(C.tfm!==C.tfv){C.tfm=C.tfv;const t=R.ORIG.getTransform.call(R.sink);C.m=[t.a,t.b,t.c,t.d,t.e,t.f]}
  const m=C.m,tl=C.tok.length,ol=C.ops.length;const r=base.apply(this,arguments);
  if(R.cur!==C||!R.on||C.flushed||C.ops.length===ol)return r;
  C.tok.length=tl;try{v111cTok(C,k,args,m,ol)}catch(e){C.zbad='tok'}
  if(k==='clip')C.zclips.push(C.depth);else if(k==='restore'&&C.zclips.length)C.zclips=C.zclips.filter(d=>d<=C.depth);
  return r}}
if(V111C.zOn){const base=rg111Set;rg111Set=function(i,k,v){const R=RG111,C=R.cur,tl=C?C.tok.length:0;const r=base.apply(this,arguments);
  if(C&&C.norm&&R.cur===C&&R.on){if(v&&typeof v==='object'&&C.tok.length===tl+2){const t=v111cStyleTag(v);if(t)C.tok[tl+1]=t}
    if((k==='shadowBlur'||k==='shadowOffsetX'||k==='shadowOffsetY')&&v)C.zfx=1;else if(k==='filter'&&v&&v!=='none')C.zfx=1}
  return r}}
if(V111C.zOn&&typeof CanvasPattern!=='undefined'&&CanvasPattern.prototype.setTransform){const f=CanvasPattern.prototype.setTransform;CanvasPattern.prototype.setTransform=function(){
  const C=RG111.cur,tl=C?C.tok.length:0;const r=f.apply(this,arguments);if(C&&C.norm&&C.tok.length===tl+3&&C.tok[tl]==='PT')C.tok.length=tl+2;return r}}
/* a range's opening tokens without the camera (its transform's translation, a sprite's box corner) */
function v111cNormBegin(C){const T=C.tok;T[4]=0;T[5]=0;if(C.box){const i=T.length-5;if(T[i]==='x'){T[i+1]=0;T[i+2]=0}}
  C.zs=[];C.ztok=[];C.zbadS=0;C.zss=new Set();C.zb=[];C.zp=null;C.zclips=[];C.zu=new Map();C.zfx=0;C.zbad=0;C.tfm=-1;
  try{const R=RG111,g=k=>R.OGET[k]?R.OGET[k].call(R.sink):0;if(g('shadowBlur')||g('shadowOffsetX')||g('shadowOffsetY')||(R.OGET.filter&&g('filter')!=='none'))C.zfx=1}catch(e){C.zfx=1}}

/* ---------------- Z1 · the zoomed ranges ---------------- */
if(V111C.zOn){const base=s111OK;s111OK=function(){if(!v111cZoomed())return base.apply(this,arguments);return V111C.zNow&&!V111C.noPot&&v111cOKz()}}
if(V111C.zOn){const base=s111Begin;s111Begin=function(name){const b4=S1_111.cur;base.apply(this,arguments);const C=S1_111.cur;
  if(C&&C!==b4&&V111C.zNow&&V111C.cam){C.bf=true;C.norm={cx:V111C.cam.x,cy:V111C.cam.y};v111cNormBegin(C);V111C.st.zRanges++;if(name==='M'||name==='R1')V111C.began=true}}}
if(V111C.zOn){const base=rg111End;rg111End=function(C){if(C&&C.bf)return v111cEnd(C);return base.apply(this,arguments)}}
/* the BF's place (camera-relative device px): the window + margin, stretched toward the rest of the camera's ease */
function v111cRect(cx,cy,W,H){const mg=Z1_111C.margin,BW=Math.ceil(W*(1+2*mg)),BH=Math.ceil(H*(1+2*mg));const p=V111C.pcam,k=Z1_111C.lead;
  const fresh=p&&p.f===V111.frame-1;   /* the camera's step from the board draw just before */
  const one=(c,pc,S,B)=>{const mm=Math.round(S*0.06),room=Math.max(0,B-S-2*mm);let d=fresh?k*(c-pc):0;d=Math.max(-room,Math.min(room,d));
    const q=c+d,lo=Math.min(-c,-q),hi=Math.max(S-c,S-q);let x=Math.round((lo+hi)/2-B/2);return Math.min(-c,Math.max(x,S-c-B))};
  return {x:one(cx,p?p.x:cx,W,BW),y:one(cy,p?p.y:cy,H,BH),w:BW,h:BH}}
/* the strips can go under the BF only if no call before them touches them and none after blends over them with another mode */
function v111cStripsOK(C){for(const s of C.zs){const sb=s.b;for(const o of C.zb){const b=o.b;if(b[2]<=sb[0]||b[0]>=sb[2]||b[3]<=sb[1]||b[1]>=sb[3])continue;if(o.j<s.j||!o.so)return false}}return true}
/* replay into the BF: 419's strips left out, 260's cut blits whole */
function v111cPlay(g,C,dx,dy){const R=RG111,O=R.ORIG,M=R.M,P=R.P,ops=C.ops,sk=C.zss,uc=C.zu;
  for(let j=0;j<ops.length;j+=2){const i=ops[j],a=ops[j+1];
    if(i===1e6){if(a.p.setTransform)a.p.setTransform(a.m?new DOMMatrix(a.m):undefined);continue}
    if(i<0){let v=a;if(v&&v.p111){v=a.p111;if(a.m&&v.setTransform)v.setTransform(new DOMMatrix(a.m))}R.OSET[P[-1-i]].call(g,v);continue}
    if(sk.has(j))continue;const k=M[i];
    if(k==='setTransform'||k==='resetTransform'){let m;if(k==='resetTransform')m=[1,0,0,1,0,0];else if(a.length>=6)m=a.slice(0,6);else{const q=a[0]||{};m=[q.a,q.b,q.c,q.d,q.e,q.f]}
      O.setTransform.call(g,m[0],m[1],m[2],m[3],m[4]-dx,m[5]-dy);continue}
    const u=uc.get(j);if(u){O.drawImage.call(g,a[0],0,0,u.W,u.H,u.x,u.y,u.W,u.H);continue}
    O[k].apply(g,a)}}
function v111cState(g,O,R){O.setTransform.call(g,1,0,0,1,0,0);R.OSET.globalAlpha.call(g,1);R.OSET.globalCompositeOperation.call(g,'source-over');
  if(R.OSET.filter)try{R.OSET.filter.call(g,'none')}catch(e){}R.OSET.shadowColor.call(g,'rgba(0,0,0,0)')}
/* memory: the zoomed pictures stay under Z1.maxPx device pixels — the board-frame pictures of ranges not drawn this board draw go first */
function v111cPx(){let n=0;for(const k in S1Z_111C){const E=S1Z_111C[k];if(E.cv)n+=E.cv.width*E.cv.height;if(E.sc)n+=E.sc.width*E.sc.height}return n}
function v111cRoom(E,need){let have=v111cPx()-(E.cv?E.cv.width*E.cv.height:0);if(have+need<=Z1_111C.maxPx)return true;
  const L=Object.values(S1Z_111C).filter(o=>o!==E&&o.cv&&o.used!==V111.frame).sort((a,b)=>(a.used|0)-(b.used|0));
  for(const o of L){have-=o.cv.width*o.cv.height;o.cv.width=0;o.cv.height=0;o.cv=null;o.g=null;o.tok=null;o.r=null;V111C.st.memDrop=(V111C.st.memDrop|0)+1;if(have+need<=Z1_111C.maxPx)return true}
  return false}
function v111cEnd(C){const R=RG111,O=R.ORIG,E=C.ent,S1=E.st,X=V111C.st;R.cur=null;
  if(C.flushed){S1.flush++;rg111Hist(E,false);return}
  R.on=false;const live=why=>{S1.vol++;const V=X.vol||(X.vol={});V[why]=(V[why]|0)+1;try{rg111Play(ctx,C,0,0,0)}catch(e){console.error(e)}rg111Hist(E,false)};
  if(C.zbad||(C.needOvr&&!C.ovr))return live(C.zbad||'mode');
  const W=cv.width,H=cv.height,cx=C.norm.cx,cy=C.norm.cy,p=V111C.pcam,still=!!(p&&p.x===cx&&p.y===cy);
  const done=hit=>{E.used=V111.frame;S1.ops+=C.nDraw;S1.blits++;if(hit){S1.hit++;V111.st.blitsSaved+=Math.max(0,C.nBig-1);V111.st.opsSaved+=Math.max(0,C.nDraw-1)}else S1.miss++;
    if(C.depth>0||C.clip0)rg111Restate(C);else rg111Carry(C);rg111Hist(E,hit)};
  /* 1 · the camera holds: the screen picture (420's way — every call, the strips too, replayed at the screen's own place: exact) */
  if(E.sc&&E.scam&&E.scam.x===cx&&E.scam.y===cy&&E.sc.width===W&&E.sc.height===H&&rg111Eq(E.stok,C.tok)&&rg111Eq(E.sstr,C.ztok)){X.exactHit++;rg111Blit(E.sc,0,0);return done(true)}
  if(still||C.zbadS){if(!E.sc){E.sc=document.createElement('canvas');E.sg=E.sc.getContext('2d')}
    if(E.sc.width!==W||E.sc.height!==H){E.sc.width=W;E.sc.height=H}else{O.setTransform.call(E.sg,1,0,0,1,0,0);O.clearRect.call(E.sg,0,0,W,H)}
    let bad=false;O.save.call(E.sg);try{rg111State(E.sg,C.s0,0,0);rg111Play(E.sg,C,0,0,0)}catch(e){console.error(e);bad=true}finally{O.restore.call(E.sg)}
    if(bad){E.stok=null;return live('replay')}
    E.stok=C.tok;E.sstr=C.ztok;E.scam={x:cx,y:cy};X.exactBuild++;rg111Blit(E.sc,0,0);return done(false)}
  /* 2 · the camera moves: the board-frame picture slid under it (419's strips live first, when they commute) */
  if(!Z1_111C.bf)return live('bfoff');
  const strips=C.zs.length>0;if(strips){X.strips++;if(!v111cStripsOK(C)){X.stripFail++;return live('strips')}}
  const r=E.r,inside=!!(E.cv&&r&&E.cv.width===r.w&&-cx>=r.x&&-cy>=r.y&&W-cx<=r.x+r.w&&H-cy<=r.y+r.h);
  const hit=inside&&rg111Eq(E.tok,C.tok);
  if(!hit&&!v111cRoom(E,Math.ceil(W*(1+2*Z1_111C.margin))*Math.ceil(H*(1+2*Z1_111C.margin))))return live('mem');
  if(!hit){const t0=performance.now(),q=v111cRect(cx,cy,W,H);if(!E.cv){E.cv=document.createElement('canvas');E.g=E.cv.getContext('2d')}
    if(E.cv.width!==q.w||E.cv.height!==q.h){E.cv.width=q.w;E.cv.height=q.h}else{O.setTransform.call(E.g,1,0,0,1,0,0);O.clearRect.call(E.g,0,0,q.w,q.h)}
    let bad=false;O.save.call(E.g);try{rg111State(E.g,C.s0,cx+q.x,cy+q.y);v111cPlay(E.g,C,cx+q.x,cy+q.y)}catch(e){console.error(e);bad=true}finally{O.restore.call(E.g)}
    if(bad){E.tok=null;E.r=null;return live('replay')}
    E.tok=C.tok;E.r=q;X.builds++;X.buildMs+=performance.now()-t0}
  else{X.movHit++}
  O.save.call(ctx);v111cState(ctx,O,R);
  try{for(const s of C.zs){R.OSET.globalAlpha.call(ctx,s.al);R.OSET.imageSmoothingEnabled.call(ctx,s.sm);if(R.OSET.imageSmoothingQuality)R.OSET.imageSmoothingQuality.call(ctx,s.sq);O.drawImage.apply(ctx,s.a);X.stripDraws++}
    R.OSET.globalAlpha.call(ctx,1);const q=E.r;O.drawImage.call(ctx,E.cv,-cx-q.x,-cy-q.y,W,H,0,0,W,H)}finally{O.restore.call(ctx)}
  return done(hit)}

/* the draw: zoomed entries in 420's place for this board draw (420's split / begin / end logic runs on them unchanged) */
if(V111C.zOn){const base=drawLayers93;drawLayers93=function(layers){
  if(!Array.isArray(layers)||!v111cZoomed()||!v111cOKz())return base.apply(this,arguments);
  let cam=null;try{const t=RG111.ORIG.getTransform.call(ctx);const x=OX*t.a+t.e,y=OY*t.d+t.f;if(!t.b&&!t.c&&Math.abs(x-Math.round(x))<1e-6&&Math.abs(y-Math.round(y))<1e-6)cam={x:Math.round(x),y:Math.round(y)}}catch(e){}
  if(!cam){V111C.st.noCam++;return base.apply(this,arguments)}
  V111C.st.zDraws++;const keep={M:S1_111.M,R1:S1_111.R1,R2:S1_111.R2,D:S1_111.D};Object.assign(S1_111,S1Z_111C);V111C.zNow=true;V111C.cam=cam;V111C.began=false;
  const begin=f=>function(){try{if(!V111C.began&&!S1_111.cur&&!RG111.cur&&s111OK())s111Begin(rg111Ready(S1_111.M)?'M':'R1')}catch(e){}return f.apply(this,arguments)};
  const L=layers.map(l=>Array.isArray(l)&&(l[0]==='stands'||l[0]==='tiles')&&typeof l[1]==='function'?[l[0],begin(l[1]),...l.slice(2)]:l);
  try{return base.call(this,L)}finally{Object.assign(S1_111,keep);V111C.zNow=false;cam.f=V111.frame;V111C.pcam=cam;V111C.cam=null}}}
/* zoomed, 260 paints the rim itself (the rim layer is never called): the still board begins here */
if(V111C.zOn&&typeof z99Rim==='function'){const base=z99Rim;z99Rim=function(){try{if(V111C.zNow&&!V111C.began&&!S1_111.cur&&!RG111.cur&&s111OK())s111Begin(rg111Ready(S1_111.M)?'M':'R1')}catch(e){}return base.apply(this,arguments)}}
/* the sky is fixed to the screen: zoomed, the still board ends before it (the sky stays live, destination-over as before) */
if(V111C.zOn&&typeof ar91Blit==='function'){const base=ar91Blit;ar91Blit=function(L){try{if(V111C.zNow&&S1_111.cur&&S1_111.cur.bf&&typeof AR91!=='undefined'&&L===AR91.L.sky)s111End('M')}catch(e){}return base.apply(this,arguments)}}

/* ---------------- Z2 · the jugs zoomed ---------------- */
if(V111C.zOn&&typeof drawPot==='function'){const base=drawPot;drawPot=function(x,y,s,eagle){
  if(!V111C.zNow||RG111.on||RG111.cur||!(s>4))return base.apply(this,arguments);
  let C=null;try{const t=RG111.ORIG.getTransform.call(ctx),cam=V111C.cam;
    if(!t.b&&!t.c&&cam&&v111cOKz()){const xx=x+(typeof POT105!=='undefined'&&POT105.dx||0),m=Math.max(4,s*0.08);
      const x0=Math.floor((xx-s*0.62-m)*t.a+t.e),y0=Math.floor((y-s*1.02-m)*t.d+t.f),x1=Math.ceil((xx+s*0.62+m)*t.a+t.e),y1=Math.ceil((y+s*0.3+m)*t.d+t.f);
      const key=(eagle?'e':'j')+(x0-cam.x)+','+(y0-cam.y)+','+(x1-x0)+','+(y1-y0);let E=S2Z_111C.map.get(key);
      if(!E){E={st:S2Z_111C.st,rest:240};S2Z_111C.map.set(key,E);if(S2Z_111C.map.size>S2Z_111C.max)S2Z_111C.map.delete(S2Z_111C.map.keys().next().value)}else{S2Z_111C.map.delete(key);S2Z_111C.map.set(key,E)}
      if(rg111Ready(E)){C=rg111Begin('pot',E,[x0,y0,x1-x0,y1-y0]);if(C){C.kind='sprite';C.norm={cx:x0,cy:y0};v111cNormBegin(C)}}}}catch(e){C=null}
  if(!C){V111C.noPot=true;try{return base.apply(this,arguments)}finally{V111C.noPot=false}}
  try{return base.apply(this,arguments)}finally{rg111End(C)}}}

/* memory: a zoomed picture not used for 600 board draws lets its canvas go */
if(V111C.zOn){const base=draw;draw=function(){if(V111.frame%60===0){for(const k in S1Z_111C){const E=S1Z_111C[k];if(E.cv&&V111.frame-(E.used|0)>Z1_111C.drop){E.cv.width=0;E.cv.height=0;E.cv=null;E.g=null;E.tok=null;E.r=null}if(E.sc&&V111.frame-(E.used|0)>Z1_111C.drop){E.sc.width=0;E.sc.height=0;E.sc=null;E.sg=null;E.stok=null}}
    for(const [k,E] of S2Z_111C.map)if(V111.frame-(E.used|0)>Z1_111C.drop)S2Z_111C.map.delete(k)}return base.apply(this,arguments)}}


/* ---------------- Z3 · sharpen off the main thread ---------------- */
const Z3_111C={on:false,w:null,ok:null,id:0,jobs:new Map(),maxPend:24 /* TWEAK: cells in flight */,quietMs:220 /* TWEAK: no board draw this long = quiet (the fallback) */,idleQ:[],idleT:0,
  src:typeof sh103Sharpen==='function'?sh103Sharpen.toString():''};
Z3_111C.on=V111C.on&&!!Z3_111C.src&&typeof sh103Maybe==='function'&&typeof V103C!=='undefined'&&!V103C.off;
function z3Worker(){const Z=Z3_111C;if(Z.w)return Z.w;if(Z.ok===false)return null;
  try{if(location.protocol==='file:'||typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined'||typeof createImageBitmap!=='function'){Z.ok=false;return null}
    const src=`const V103C={sharpAmt:0.55};const sh103Sharpen=${Z.src};
self.onmessage=e=>{const q=e.data;let buf=null,err=0,same=false;try{V103C.sharpAmt=q.amt;const oc=new OffscreenCanvas(q.W,q.H);const g=oc.getContext('2d',{willReadFrequently:true});if(!g)throw new Error('2d');
  g.drawImage(q.bm,0,0);try{q.bm.close()}catch(x){}let out=null;const sh={width:q.W,height:q.H,getContext:()=>({getImageData:(a,b,c,d)=>g.getImageData(a,b,c,d),putImageData:id=>{out=id}})};
  const ok=sh103Sharpen(sh);if(!ok)err=1;else if(out)buf=out.data.buffer;else same=true}catch(x){err=String(x&&x.message||x)==='2d'?2:1}
  self.postMessage({id:q.id,buf,err,same},buf?[buf]:[])};`;
    const u=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));const w=new Worker(u);
    w.onmessage=e=>z3Done(e.data);w.onerror=()=>{Z.ok=false;try{w.terminate()}catch(x){}Z.w=null;for(const J of Z.jobs.values())z3Fallback(J.c);Z.jobs.clear();V111C.st.sh.pend=0};
    Z.w=w;Z.ok=true;return w}catch(e){Z.ok=false;return null}}
/* the sharp pixels land: the same putImageData the sync path ends with; whatever was made from the soft cell is made again */
function z3Land(c){c.__sh111c=(c.__sh111c|0)+1;
  try{if(typeof BS101!=='undefined'&&BS101.cache)BS101.cache.delete(c)}catch(e){}
  try{if(typeof RB108!=='undefined'&&RB108.pend){const P=RB108.pend.get(c);if(P){for(const J of P.values()){for(const [id,j] of RB108.jobs)if(j===J)RB108.jobs.delete(id);RB108.npend=Math.max(0,RB108.npend-1)}RB108.pend.delete(c)}}}catch(e){}
  try{if(typeof AIM106!=='undefined'&&AIM106.oc)AIM106.oc.clear()}catch(e){}
  if(!Z3_111C.raf)Z3_111C.raf=requestAnimationFrame(()=>{Z3_111C.raf=0;try{if(S&&!HEADLESS)draw()}catch(e){}})}
function z3Done(m){const Z=Z3_111C,J=Z.jobs.get(m.id),T=V111C.st.sh;if(!J)return;Z.jobs.delete(m.id);T.pend=Z.jobs.size;const c=J.c;
  if(m.err===2){Z.ok=false;T.fail++;z3Fallback(c);return}
  if(m.err){c._sh103=2;T.fail++;return}   /* unreadable pixels (346's sync path: false → 2) */
  if(c.width!==J.W||c.height!==J.H){T.late++;c._sh103=0;return}
  if(m.same){c._sh103=1;T.same++;return}
  try{c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(m.buf),J.W,J.H),0,0);c._sh103=1;V103C.st.sharp++;T.done++;z3Land(c)}catch(e){c._sh103=2;T.fail++}}
/* no worker: the main thread sharpens only on a quiet board */
function z3Fallback(c){const Z=Z3_111C;c._sh103=3;Z.idleQ.push(c);if(!Z.idleT)Z.idleT=setTimeout(z3Idle,Z.quietMs)}
function z3Idle(){const Z=Z3_111C;Z.idleT=0;const last=typeof V111!=='undefined'?V111.lastDraw:0;
  if(performance.now()-last<Z.quietMs){Z.idleT=setTimeout(z3Idle,Z.quietMs);return}
  const c=Z.idleQ.shift();if(c){const t0=performance.now();c._sh103=sh103Sharpen(c)?1:2;if(c._sh103===1){V103C.st.sharp++;z3Land(c)}V111C.st.sh.idle++;V111C.st.sh.mainMs+=performance.now()-t0}
  if(Z.idleQ.length)Z.idleT=setTimeout(z3Idle,60)}
if(Z3_111C.on){const base=sh103Maybe;sh103Maybe=function(c,up){const Z=Z3_111C;
  if(!c||c._sh103||HEADLESS||V103C.off||!(up>V103C.sharpMin)||zoom103Moving())return base.apply(this,arguments);
  const W=c.width,H=c.height;if(W<3||H<3)return base.apply(this,arguments);
  if(!z3Worker()){z3Fallback(c);return c}
  if(Z.jobs.size>=Z.maxPend){V103C.st.sharpSkip++;return c}   /* tried again on a later draw */
  const id=++Z.id;c._sh103=3;Z.jobs.set(id,{c,W,H});V111C.st.sh.async++;V111C.st.sh.pend=Z.jobs.size;
  try{createImageBitmap(c,{premultiplyAlpha:'premultiply'}).then(bm=>{const w=z3Worker();if(!w||!Z.jobs.has(id)){try{bm.close()}catch(x){}return}w.postMessage({id,bm,W,H,amt:V103C.sharpAmt},[bm])},
    ()=>{if(Z.jobs.delete(id)){c._sh103=2;V111C.st.sh.fail++}})}catch(e){Z.jobs.delete(id);z3Fallback(c)}
  return c}}
/* main-thread sharpen time (the recorder's 'sharpen' area is the same function; this counts outside recordings too) */
if(V111C.on&&typeof sh103Sharpen==='function'){const base=sh103Sharpen;sh103Sharpen=function(){const t0=performance.now();try{return base.apply(this,arguments)}finally{V111C.st.sh.mainN++;V111C.st.sh.mainMs+=performance.now()-t0}}}

/* ---------------- Z4 · aim hit masks ---------------- */
const Z4_111C={on:V111C.zOn&&typeof aim106Body==='function'&&typeof AIM106!=='undefined',m:new WeakMap(),n:0,max:64,lru:[]};
/* a picture's content version (420 counts every drawing call on a 2D context; Z3 counts the sharp pixels landing) */
function z4Ver(im){if(im instanceof HTMLCanvasElement){const g=RG111.ctxOf.get(im);return (g?g.__v111v|0:'?')+':'+(im.__v111w|0)+':'+(im.__sh111c|0)+':'+im.width+'x'+im.height}
  if(im instanceof HTMLImageElement)return im.complete?im.naturalWidth+'x'+im.naturalHeight:null;if(typeof ImageBitmap!=='undefined'&&im instanceof ImageBitmap)return 'b'+im.width;return null}
function z4Mask(img,rx,ry,rw,rh){const Z=Z4_111C,v=z4Ver(img);if(v==null)return null;const k=rx+','+ry+','+rw+','+rh+'|'+v;let M=Z.m.get(img);if(!M){M=new Map();Z.m.set(img,M)}
  let o=M.get(k);if(o){V111C.st.aim.hits++;return o}
  o={x:rx,y:ry,w:rw,h:rh,a:null,taint:false};
  try{const c=document.createElement('canvas');c.width=rw;c.height=rh;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,rx,ry,rw,rh,0,0,rw,rh);
    const d=g.getImageData(0,0,rw,rh).data,a=new Uint8Array(rw*rh);for(let i=0,p=3;i<a.length;i++,p+=4)a[i]=d[p]>40?1:0;o.a=a}catch(e){o.taint=true}
  M.set(k,o);V111C.st.aim.built++;Z.lru.push([img,k]);if(Z.lru.length>Z.max){const [im0,k0]=Z.lru.shift();const M0=Z.m.get(im0);if(M0)M0.delete(k0)}return o}
if(Z4_111C.on){const base=aim106Body;aim106Body=function(fig,X,Y){if(!fig||!fig.ops)return base.apply(this,arguments);V111C.st.aim.tests++;
  for(let i=fig.ops.length-1;i>=0;i--){const o=fig.ops[i],m=o.m,det=m[0]*m[3]-m[1]*m[2];if(!det)continue;
    const px=X-m[4],py=Y-m[5],ux=(m[3]*px-m[2]*py)/det,uy=(-m[1]*px+m[0]*py)/det;
    const fx=(ux-o.dx)/o.dw,fy=(uy-o.dy)/o.dh;if(fx<0||fy<0||fx>=1||fy>=1)continue;
    const sx=Math.floor(o.sx+fx*o.sw),sy=Math.floor(o.sy+fy*o.sh);
    const W=o.img.naturalWidth||o.img.width||0,H=o.img.naturalHeight||o.img.height||0;
    const rx=Math.max(0,Math.floor(o.sx)),ry=Math.max(0,Math.floor(o.sy)),rw=Math.min(W,Math.ceil(o.sx+o.sw))-rx,rh=Math.min(H,Math.ceil(o.sy+o.sh))-ry;
    const M=rw>0&&rh>0&&rw*rh<=4e6?z4Mask(o.img,rx,ry,rw,rh):null;
    if(!M){/* not cacheable: 396's one-pixel read */const r=base.call(this,{ops:[o]},X,Y);if(r)return true;continue}
    if(M.taint){AIM106.stats.taint++;return true}   /* tainted (file://): the image's rectangle counts, as 396 */
    const lx=sx-M.x,ly=sy-M.y;if(lx>=0&&ly>=0&&lx<M.w&&ly<M.h&&M.a[ly*M.w+lx])return true}
  return false}}

/* ---------------- Z5 · the recorder's v111c block ---------------- */
function v111cSnap(){const o=JSON.parse(JSON.stringify(V111C.st));for(const k in S1Z_111C)o['z'+k]={...S1Z_111C[k].st};o.zpot={...S2Z_111C.st};return o}
if(V111C.on&&typeof rec107Start==='function'){const base=rec107Start;rec107Start=function(){V111C.rec0=v111cSnap();return base.apply(this,arguments)}}
if(V111C.on&&typeof rec107Extra==='function'){const base=rec107Extra;rec107Extra=function(){const o=base.apply(this,arguments)||{};try{o.v111c=v111cReport()}catch(e){o.v111c={err:String(e)}}return o}}
function v111cReport(){const a=V111C.rec0||{},b=v111cSnap();const d=(x,y)=>{const o={};for(const k in y){const v=y[k];o[k]=typeof v==='number'?+(v-(+(x&&x[k])||0)).toFixed(1):v&&typeof v==='object'?d(x&&x[k],v):v}return o};
  const rate=s=>{const n=s.hit+s.miss+s.flush+s.vol;return n?+(s.hit*100/n).toFixed(1):null};const D=d(a,b);
  let px=0;for(const k in S1Z_111C){const E=S1Z_111C[k];if(E.cv)px+=E.cv.width*E.cv.height;if(E.sc)px+=E.sc.width*E.sc.height}
  return {on:V111C.on,zoom:V111C.zOn,board:{M:D.zM,R1:D.zR1,R2:D.zR2,D:D.zD,hitPct:{M:rate(D.zM),R1:rate(D.zR1),R2:rate(D.zR2),D:rate(D.zD)}},pots:{...D.zpot,hitPct:rate(D.zpot),cached:S2Z_111C.map.size},
    zoomedDraws:D.zDraws,stillHits:D.exactHit,stillBuilds:D.exactBuild,movingHits:D.movHit,noCam:D.noCam,strips:{frames:D.strips,live:D.stripDraws,fail:D.stripFail},builds:D.builds,buildMs:D.buildMs,vol:D.vol||{},bfMpx:+(px/1e6).toFixed(2),
    sharpen:{worker:Z3_111C.ok,...D.sh,pend:Z3_111C.jobs.size},aim:D.aim,
    note:'zoomed ranges compared relative to the camera; hit = one blit from the board-frame picture; sharpen.mainMs = sharpen on the main thread (≈0 with the worker)'}} /* i18n:skip */

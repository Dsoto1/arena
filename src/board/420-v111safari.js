/* =====================================================================
   420-v111safari — v1.11 SAFARI 2D FIXES (owner's pick 2a, 2026-10-22; tools/plans/v111/NOTES.md, GL-SPIKE.md). DISPLAY ONLY: rules,
   dice (RNG), S, the log, saves and the online hash are untouched — nothing here calls rand() or sends anything. Same pixels: every item
   below draws exactly what the old path drew (tools/bench/safari111.js compares the same moment drawn both ways, test tv111s).
   WHY: Safari draws the 2D board with CoreGraphics in its GPU process; his recordings (Lighting Full, 4-player Democritus, 26 fps, p95
   130–140 ms) show our JS at 3–15 ms a draw while each board draw costs the GPU process 40–150 ms: ~15 board-sized layer blits (several
   source-atop / destination-over), ~225 ImageBitmap pieces (260's z99 cut every big layer into 256² pieces) and ~1,100 path / rect calls
   (683 fillRect from the jugs alone) every draw — plus 196 createImageBitmap(ImageBitmap) calls ≈ 400 ms / 10 s re-cutting those pieces.
   • S1 THE STILL BOARD, CACHED. From the rim to the sky (rim · stands: 192 UNDER, the benches + their texture, 192 DECO, 418's planks ·
     the tiles · 192 TOP, LIGHT (source-atop), SKY (destination-over)) nothing moves between frames. Those layers still RUN every frame
     (every key, stat and side effect as before) but their calls on the board's context are RECORDED instead of drawn (state calls go to a
     1×1 "sink" context so every read — getTransform, fillStyle, measureText — answers as before); at the end the recording is compared,
     call by call and argument by argument, with the one that built the cache: identical → ONE blit of the cached picture; different →
     the recording is replayed onto the cache canvas (the same calls, same order, same start state = the same pixels) and blitted.
     Pictures drawn in a range are compared by identity + content version (every 2D context's drawing calls bump its version), bitmaps
     by identity, gradients / patterns by what they were made of. Anything a recording cannot reproduce — the board itself read back
     (235's tiles rebuild copies #cv), getImageData / reset on the board, a picture changed after it was drawn, a nested board draw,
     an object it cannot compare — "flushes": the calls so far are replayed onto the board at once and the rest of the range draws live
     (exact, as before). A range that keeps changing (a live crowd, flames, a moving camera) is left live for a while (hysteresis).
     When the stands' live crowd sits between the layers, the range splits in two: rim…planks and tiles…top (light + sky live).
   • S2 THE JUGS AS PICTURES. Each Blessings jug (192's drawPot: ~70 rects + 15 paths) is recorded the same way and kept as a small
     picture per jug (its device-pixel box, whole-pixel offset): identical calls → one drawImage. Only plain source-over drawing is
     cached (a jug drawn with another blend mode, a moving jug — 371's shake — just draws live).
   • S3 NO BITMAP PIECES ON WEBKIT. 260's z99 cut each big cached layer into 256² ImageBitmaps (a Chrome-zoom fix): on Safari that is
     ~35 drawImage per layer per draw and the re-cuts cost 400 ms / 10 s of createImageBitmap. The whole canvas is blitted instead
     (Z99.bmOn = false: the same pixels at the same whole-pixel place). #perf=v111z99 keeps the pieces (A/B).
   • S4 THE NUMBER OVERLAY HIDDEN WHILE BLANK. 227's board-sized #fx95 canvas (floating numbers) is visibility:hidden while nothing is on
     it (401 P4 tracks that): one composited layer less on most frames.
   • S5 DEVICE FIGURE BAKES OFF THE BUSY FRAMES. 311's on-device sheet renders (Studio / online / gear-true figures: 8 renders, read-backs
     and a shadow row per pose frame, 21 frames per 10 s in his recording) wait for a quiet board (no board draw for S5.quietMs, or the
     board not shown: menus, briefing, curtain) and start right after a frame; at most S5.maxWait ms of waiting (progress guaranteed).
     The IndexedDB cache across bouts stays 311's. Small direct edit in 311 (an100Pump's yields read window.an111Yield, "v1.11 (420)").
   • S6 THE RECORDER (405 ⏺): a "v111" block — what was cached, hit / miss / flush / live per range, board-sized blits and drawing calls
     kept off the board per draw, bake waits; and the clean-up areas split ("sharpen", "thin", "cellmk") so the next Safari recording
     names what the cells / clean bursts are.
   Only on WebKit (406 P107S.webkit; flavius_v107safariforce=1 = any browser, for the bench / tests) and never HEADLESS.
   Kill switch localStorage flavius_v111soff=1 (or #perf=v111soff): nothing installed — exactly v1.10 (the recorder's v111 block then reads
   on:false). Stats V111.st, V111.live = false draws the old way for this load (bench / tests). Bench tools/bench/safari111.js. Test tv111s.
   ===================================================================== */
const V111={off:(()=>{try{return localStorage.getItem('flavius_v111soff')==='1'}catch(e){return false}})(),on:false,live:true /* bench / tests: false = draw the old way this load */,
  frame:0,lastDraw:0,st:{M:null,R1:null,R2:null,pot:null,flush:{},z99:false,fxHide:0,fxShow:0,bake:{waits:0,ms:0,maxed:0,quiet:0},draws:0,blitsSaved:0,opsSaved:0}};
V111.on=!V111.off&&typeof P107S!=='undefined'&&!P107S.off&&!!P107S.webkit&&typeof ctx!=='undefined'&&!!ctx&&typeof cv!=='undefined'&&!!cv&&typeof CanvasRenderingContext2D!=='undefined';

/* ---------------- the recorder engine (S1 / S2) ---------------- */
const RG111={on:false,cur:null,sink:null,ids:new WeakMap(),idn:0,ctxOf:new WeakMap(),gd:new WeakMap(),pd:new WeakMap(),pm:new WeakMap(),fontEp:0,
  M:[],MI:{},P:[],PI:{},ORIG:{},OSET:{},OGET:{}};
const rg111Id=o=>{let i=RG111.ids.get(o);if(!i){i=++RG111.idn;RG111.ids.set(o,i)}return i};
function rg111Stat(){return {hit:0,miss:0,flush:0,live:0,vol:0,ops:0,blits:0}}
if(V111.on){(()=>{const P=CanvasRenderingContext2D.prototype,R=RG111;
  const DRAW=new Set(['fill','stroke','fillRect','strokeRect','clearRect','fillText','strokeText','drawImage','putImageData','drawFocusIfNeeded']);
  const READ=new Set(['getTransform','measureText','isPointInPath','isPointInStroke','getLineDash','getContextAttributes','isContextLost','createImageData']);
  const MK=new Set(['createLinearGradient','createRadialGradient','createConicGradient','createPattern']);
  const BAD=new Set(['getImageData','reset']);
  const PATH=new Set(['beginPath','moveTo','lineTo','closePath','quadraticCurveTo','bezierCurveTo','arcTo','rect','roundRect','arc','ellipse']);
  const TF=new Set(['setTransform','translate','scale','rotate','transform','resetTransform','restore']);
  for(const k of Object.getOwnPropertyNames(P)){if(k==='constructor')continue;const d=Object.getOwnPropertyDescriptor(P,k);if(!d)continue;
    if(typeof d.value==='function'){const f=d.value,i=R.M.length;R.M.push(k);R.MI[k]=i;R.ORIG[k]=f;const isDraw=DRAW.has(k),kind=BAD.has(k)?3:READ.has(k)?1:MK.has(k)?2:isDraw?4:0,isPath=PATH.has(k),isTf=TF.has(k);
      P[k]=function(){if(this===ctx){if(R.on)return rg111Op(i,k,f,arguments,kind,isPath,isTf)}
        else if(isDraw||k==='reset'){this.__v111v=(this.__v111v|0)+1;if(R.on)rg111Touch(this,arguments,k)}
        if(kind===2){const g=f.apply(this,arguments);if(g)try{rg111Tag(k,g,arguments)}catch(e){}return g}
        return f.apply(this,arguments)}}
    else if(d.get&&d.set&&k!=='canvas'){const i=R.P.length;R.P.push(k);R.PI[k]=i;R.OSET[k]=d.set;R.OGET[k]=d.get;
      Object.defineProperty(P,k,{configurable:true,enumerable:d.enumerable,
        get(){return R.on&&this===ctx?d.get.call(R.sink):d.get.call(this)},
        set(v){if(R.on&&this===ctx){rg111Set(i,k,v);return}d.set.call(this,v)}})}}
  /* a pattern's own transform (123's bench texture sets it per bench): kept with the pattern, replayed with it; changed while a range uses it →
     recorded in the range's calls (in order) */
  if(typeof CanvasPattern!=='undefined'&&CanvasPattern.prototype.setTransform){const f=CanvasPattern.prototype.setTransform;CanvasPattern.prototype.setTransform=function(m){
    let a=null;try{a=m?[m.a,m.b,m.c,m.d,m.e,m.f]:null;R.pm.set(this,a)}catch(e){}
    if(R.on&&R.cur&&R.cur.usedP.has(this)){const C=R.cur;C.tok.push('PT',rg111Id(this),a?a.join(','):'');C.ops.push(1e6,{p:this,m:a})}return f.apply(this,arguments)}}
  if(typeof CanvasGradient!=='undefined'){const G=CanvasGradient.prototype,f=G.addColorStop;G.addColorStop=function(o,c){const t=R.gd.get(this);if(t)t.s+='|'+o+','+c;return f.call(this,o,c)}}
  /* which 2D context a canvas has (its content version lives on the context) */
  const H=HTMLCanvasElement.prototype,gc=H.getContext;H.getContext=function(type){const g=gc.apply(this,arguments);try{if(g){if(type==='2d'){if(!R.ctxOf.has(this))R.ctxOf.set(this,g)}else this.__v111x=1}}catch(e){}return g};
  for(const k of ['width','height']){const d=Object.getOwnPropertyDescriptor(H,k);if(!d||!d.set)continue;
    Object.defineProperty(H,k,{configurable:true,enumerable:d.enumerable,get:d.get,set(v){this.__v111w=(this.__v111w|0)+1;if(R.on&&(this===cv||(R.cur&&R.cur.usedC.has(this))))rg111Flush('resize');d.set.call(this,v)}})}
  for(const k of ['toDataURL','toBlob']){const f=H[k];if(typeof f==='function')H[k]=function(){if(R.on&&this===cv)rg111Flush('read');return f.apply(this,arguments)}}
  if(typeof ImageBitmap!=='undefined'&&ImageBitmap.prototype.close){const f=ImageBitmap.prototype.close;ImageBitmap.prototype.close=function(){if(R.on&&R.cur&&R.cur.usedB.has(this))rg111Flush('close');return f.apply(this,arguments)}}
  if(typeof window.createImageBitmap==='function'){const f=window.createImageBitmap;window.createImageBitmap=function(s){if(R.on&&s===cv)rg111Flush('read');return f.apply(this,arguments)}}
  try{if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',()=>{R.fontEp++})}catch(e){}
  const sc=document.createElement('canvas');sc.width=1;sc.height=1;R.sink=gc.call(sc,'2d');
  R.ST=R.P.filter(k=>{try{return R.OGET[k].call(ctx)!==undefined}catch(e){return false}});   /* the state a range starts from */
  R.DRAW=DRAW;R.PATH=PATH})()}
function rg111Tag(k,g,a){const R=RG111;if(k==='createPattern'){R.pd.set(g,'p'+rg111SrcKey(a[0])+'/'+a[1]);return}R.gd.set(g,{s:k[6]+Array.prototype.join.call(a,',')})}
/* a picture's identity + content (no side effects) */
function rg111SrcKey(o){if(!o||typeof o!=='object')return String(o);
  if(o instanceof HTMLCanvasElement){const g=RG111.ctxOf.get(o);return 'c'+rg111Id(o)+':'+(g?g.__v111v|0:'?')+':'+(o.__v111w|0)+':'+(o.__v107|0)+':'+o.width+'x'+o.height}
  if(o instanceof HTMLImageElement)return 'i'+rg111Id(o)+':'+(o.complete?o.naturalWidth+'x'+o.naturalHeight:0);
  if(typeof ImageBitmap!=='undefined'&&o instanceof ImageBitmap)return 'b'+rg111Id(o)+':'+o.width;
  return 'o'+rg111Id(o)}
/* an argument as a comparable token; null = cannot compare (flush) */
function rg111Tok(v){const t=typeof v;if(t==='number')return v===v?v:'NaN';if(t!=='object'||v===null)return v;const R=RG111,C=R.cur;
  if(typeof CanvasGradient!=='undefined'&&v instanceof CanvasGradient){const d=R.gd.get(v);return d?'g'+d.s:'g#'+rg111Id(v)}
  if(typeof CanvasPattern!=='undefined'&&v instanceof CanvasPattern){if(C)C.usedP.add(v);const m=R.pm.get(v);return (R.pd.get(v)||('p#'+rg111Id(v)))+'@'+(m?m.join(','):'')}
  if(v instanceof HTMLCanvasElement){if(v===cv||v.__v111x)return null;const g=R.ctxOf.get(v);if(!g)return null;C.usedC.add(v);C.usedG.add(g);return rg111SrcKey(v)}
  if(v instanceof HTMLImageElement)return rg111SrcKey(v);
  if(typeof ImageBitmap!=='undefined'&&v instanceof ImageBitmap){C.usedB.add(v);return rg111SrcKey(v)}
  if(typeof Path2D!=='undefined'&&v instanceof Path2D)return 'P'+rg111Id(v);
  if(typeof DOMMatrixReadOnly!=='undefined'&&v instanceof DOMMatrixReadOnly)return 'm'+[v.a,v.b,v.c,v.d,v.e,v.f].join(',');
  if(Array.isArray(v)&&v.every(x=>typeof x==='number'))return 'a'+v.join(',');
  return null}
/* a call on the board's context inside a range */
function rg111Op(i,k,f,args,kind,isPath,isTf){const R=RG111,C=R.cur;
  if(kind===3){rg111Flush(k);return f.apply(ctx,args)}
  if(kind===1)return f.apply(R.sink,args);
  if(kind===2){const g=f.apply(R.sink,args);if(g)try{rg111Tag(k,g,args)}catch(e){}return g}
  const n=args.length,tk=C.tok;tk.push(i,n);for(let j=0;j<n;j++){const t=rg111Tok(args[j]);if(t===null){tk.length-=2+j;rg111Flush('obj:'+k);return f.apply(ctx,args)}tk.push(t)}
  C.ops.push(i,Array.prototype.slice.call(args));
  if(kind===4){C.nDraw++;if(k==='drawImage'){const s=args[0];if(s&&s.width*s.height>=262144)C.nBig++}return}
  if(k==='save')C.depth++;else if(k==='restore'){if(C.depth<=0){rg111Flush('restore');return f.apply(ctx,args)}C.depth--}
  else if(k==='clip'&&C.depth===0)C.clip0=true;
  if(isTf)C.tfv++;if(isPath){if(k==='beginPath'){C.pth=C.ops.length-2;C.ptf.length=0;C.ptfv=-1}C.ptf.push(C.tfv===C.ptfv?null:(C.ptfv=C.tfv,R.ORIG.getTransform.call(R.sink)))}
  return f.apply(R.sink,args)}
function rg111Set(i,k,v){const R=RG111,C=R.cur;const t=rg111Tok(v);if(t===null){rg111Flush('obj:'+k);R.OSET[k].call(ctx,v);return}
  C.tok.push(-1-i,t);C.ops.push(-1-i,typeof CanvasPattern!=='undefined'&&v instanceof CanvasPattern?{p111:v,m:R.pm.get(v)}:v);if(k==='globalCompositeOperation'&&v!=='source-over')C.ovr=false;R.OSET[k].call(R.sink,v)}
/* a drawing call on another context while a range records: a picture the range already used is about to change → flush first */
function rg111Touch(g,args,k){const C=RG111.cur;if(!C)return;if(C.usedG.has(g)){rg111Flush('changed');return}
  if((k==='drawImage')&&args[0]===cv)rg111Flush('read')}
/* start a range: o = {kind:'board'|'over'|'sprite', st (stats), ent (cache entry), box?} */
function rg111Begin(name,ent,box){const R=RG111;if(R.on||R.cur||!V111.live)return null;const O=R.ORIG;
  const C={name,ent,box:box||null,tok:[],ops:[],usedC:new Set(),usedG:new Set(),usedB:new Set(),usedP:new Set(),depth:0,clip0:false,ovr:true,nDraw:0,nBig:0,tfv:0,ptfv:-1,pth:-1,ptf:[],flushed:false,st:null};
  const t=O.getTransform.call(ctx),s0={t,p:R.ST.map(k=>R.OGET[k].call(ctx)),dash:O.getLineDash.call(ctx)};C.s0=s0;
  try{O.reset?O.reset.call(R.sink):(R.sink.canvas.width=1)}catch(e){}
  O.setTransform.call(R.sink,t);for(let j=0;j<R.ST.length;j++){try{R.OSET[R.ST[j]].call(R.sink,s0.p[j])}catch(e){}}O.setLineDash.call(R.sink,s0.dash);
  R.cur=C;C.tok.push(t.a,t.b,t.c,t.d,t.e,t.f,R.fontEp,'d'+s0.dash.join(','),cv.width,cv.height);for(const v of s0.p){const x=rg111Tok(v);C.tok.push(x===null?'?'+rg111Id(v):x)}
  if(box)C.tok.push('x',box[0],box[1],box[2],box[3]);
  if(s0.p[R.ST.indexOf('globalCompositeOperation')]!=='source-over')C.ovr=false;
  R.on=true;return C}
/* replay recorded calls onto g (dx, dy: a whole-device-pixel shift for a sprite) */
function rg111Play(g,C,from,dx,dy){const R=RG111,O=R.ORIG,M=R.M,P=R.P,ops=C.ops;
  for(let j=from;j<ops.length;j+=2){const i=ops[j],a=ops[j+1];
    if(i===1e6){if(a.p.setTransform)a.p.setTransform(a.m?new DOMMatrix(a.m):undefined);continue}
    if(i<0){let v=a;if(v&&v.p111){v=a.p111;if(a.m&&v.setTransform)v.setTransform(new DOMMatrix(a.m))}R.OSET[P[-1-i]].call(g,v);continue}
    const k=M[i];if((dx||dy)&&(k==='setTransform'||k==='resetTransform')){let m;if(k==='resetTransform')m=[1,0,0,1,0,0];else if(a.length>=6)m=a.slice(0,6);else{const q=a[0]||{};m=[q.a,q.b,q.c,q.d,q.e,q.f]}
      O.setTransform.call(g,m[0],m[1],m[2],m[3],m[4]-dx,m[5]-dy);continue}
    O[k].apply(g,a)}}
function rg111State(g,s0,dx,dy){const R=RG111,O=R.ORIG,t=s0.t;O.setTransform.call(g,t.a,t.b,t.c,t.d,t.e-(dx||0),t.f-(dy||0));
  for(let j=0;j<R.ST.length;j++){try{R.OSET[R.ST[j]].call(g,s0.p[j])}catch(e){}}O.setLineDash.call(g,s0.dash)}
/* flush: the calls so far drawn on the board now (its state is still the range's start state), the rest of the range live */
function rg111Flush(why){const R=RG111,C=R.cur;if(!R.on||!C)return;R.on=false;C.flushed=true;V111.st.flush[why]=(V111.st.flush[why]|0)+1;
  try{rg111Play(ctx,C,0,0,0)}catch(e){console.error(e)}}
/* the end state of the sink → the board: transform, properties, dash, and the current path (rebuilt in its own transforms) */
function rg111Carry(C){const R=RG111,O=R.ORIG,g=ctx,s=R.sink;const t=O.getTransform.call(s);
  if(C.pth>=0){O.beginPath.call(g);let q=0;for(let j=C.pth;j<C.ops.length;j+=2){const i=C.ops[j];if(i<0)continue;const k=R.M[i];if(!R.PATH.has(k))continue;const m=C.ptf[q++];
      if(m)O.setTransform.call(g,m);O[k].apply(g,C.ops[j+1])}}
  O.setTransform.call(g,t);for(const k of R.ST){try{R.OSET[k].call(g,R.OGET[k].call(s))}catch(e){}}O.setLineDash.call(g,O.getLineDash.call(s))}
function rg111Blit(cvs,x,y){const R=RG111,O=R.ORIG,g=ctx;O.save.call(g);O.setTransform.call(g,1,0,0,1,0,0);R.OSET.globalAlpha.call(g,1);R.OSET.globalCompositeOperation.call(g,'source-over');
  if(R.OSET.filter)try{R.OSET.filter.call(g,'none')}catch(e){}R.OSET.shadowColor.call(g,'rgba(0,0,0,0)');O.drawImage.call(g,cvs,x,y);O.restore.call(g)}
const rg111Eq=(a,b)=>{if(!a||a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true};
/* end a range: hit → one blit; miss → replay into the cache, blit; flushed → nothing (it drew live) */
function rg111End(C){const R=RG111;if(!C||R.cur!==C)return;const E=C.ent,S1=E.st;R.cur=null;
  if(C.flushed){S1.flush++;rg111Hist(E,false);return}
  R.on=false;
  const ok=(C.kind!=='sprite'&&!C.needOvr)||C.ovr;
  if(!ok){S1.vol++;try{rg111Play(ctx,C,0,0,0)}catch(e){console.error(e)}rg111Hist(E,false);return}   /* exact: the calls drawn now, in order (the board's state is the start state) */
  let hit=rg111Eq(E.tok,C.tok)&&E.cv;
  if(!hit){const W=C.box?C.box[2]:cv.width,H2=C.box?C.box[3]:cv.height,dx=C.box?C.box[0]:0,dy=C.box?C.box[1]:0;
    if(!E.cv){E.cv=document.createElement('canvas');E.g=E.cv.getContext('2d')}
    if(E.cv.width!==W||E.cv.height!==H2){E.cv.width=W;E.cv.height=H2}else{R.ORIG.setTransform.call(E.g,1,0,0,1,0,0);R.ORIG.clearRect.call(E.g,0,0,W,H2)}
    let bad=false;R.ORIG.save.call(E.g);try{rg111State(E.g,C.s0,dx,dy);rg111Play(E.g,C,0,dx,dy)}catch(e){console.error(e);bad=true}finally{R.ORIG.restore.call(E.g)}
    if(bad){E.tok=null;S1.vol++;try{rg111Play(ctx,C,0,0,0)}catch(e){}rg111Hist(E,false);return}
    E.tok=C.tok;S1.miss++}
  else{S1.hit++;V111.st.blitsSaved+=Math.max(0,C.nBig-1);V111.st.opsSaved+=Math.max(0,C.nDraw-1)}
  E.used=V111.frame;S1.ops+=C.nDraw;S1.blits++;rg111Blit(E.cv,C.box?C.box[0]:0,C.box?C.box[1]:0);
  if(C.depth>0||C.clip0)rg111Restate(C);else rg111Carry(C);rg111Hist(E,hit)}
/* a range that ends inside its own save levels / with a clip of its own (399 ends the decals range inside l106Pass's save): every state
   call replayed on the board after the blit — the same stack, clips, transform and path as the old path left */
function rg111Restate(C){const R=RG111,O=R.ORIG,ops=C.ops;for(let j=0;j<ops.length;j+=2){const i=ops[j],a=ops[j+1];if(i===1e6)continue;
  if(i<0){R.OSET[R.P[-1-i]].call(ctx,a&&a.p111?a.p111:a);continue}const k=R.M[i];if(R.DRAW.has(k))continue;O[k].apply(ctx,a)}}
/* hysteresis: 3 misses in the last 4 ends → live for E.rest board draws (doubling while it keeps failing, back to E.rest0 on a hit) */
function rg111Hist(E,hit){if(E.rest0==null)E.rest0=E.rest||90;if(hit)E.rest=E.rest0;E.h=((E.h||0)<<1|(hit?0:1))&15;const m=(E.h&1)+(E.h>>1&1)+(E.h>>2&1)+(E.h>>3&1);
  if(m>=3){E.until=V111.frame+(E.rest||90);E.rest=Math.min((E.rest||90)*2,E.rest0*16);E.h=0;E.st.live++}}
const rg111Ready=E=>!E.until||V111.frame>=E.until;

/* ---------------- S1 · the still board ---------------- */
const S1_111={M:{st:rg111Stat(),rest:120},R1:{st:rg111Stat(),rest:120},R2:{st:rg111Stat(),rest:120},D:{st:rg111Stat(),rest:120},cur:null,mode:''};
V111.st.M=S1_111.M.st;V111.st.R1=S1_111.R1.st;V111.st.R2=S1_111.R2.st;V111.st.D=S1_111.D.st;
function s111OK(){try{if(!V111.on||!V111.live||HEADLESS||!S||S.ed94||S.snap)return false;if(typeof AR91!=='undefined'&&AR91.z>1.001)return false;return cv.width>0}catch(e){return false}}
function s111Begin(name){const E=S1_111[name];if(!rg111Ready(E))return;const C=rg111Begin(name,E,null);if(C){C.kind='board';if(name==='R2'||name==='D')C.needOvr=true;S1_111.cur=C}}
function s111End(name){const C=S1_111.cur;if(C&&C.name===name){S1_111.cur=null;rg111End(C)}}
if(V111.on&&typeof drawLayers93==='function'){const base=drawLayers93;drawLayers93=function(layers){
  if(!Array.isArray(layers)||!s111OK())return base.apply(this,arguments);
  const split=!rg111Ready(S1_111.M);S1_111.mode=split?'split':'M';
  const L=layers.map(l=>{if(!Array.isArray(l)||typeof l[1]!=='function')return l;const n=l[0],f=l[1];
    if(n==='rim')return [n,function(){s111Begin(split?'R1':'M');return f.apply(this,arguments)},...l.slice(2)];
    if(n==='stands'&&split)return [n,function(){try{return f.apply(this,arguments)}finally{s111End('R1');s111Begin('R2')}},...l.slice(2)];   /* (235 runs the 'tiles' paint only on a rebuild: R2 starts here) */
    if(n==='walls')return [n,function(){try{return f.apply(this,arguments)}finally{s111End('M');s111End('R2')}},...l.slice(2)];
    if(n==='floor')return [n,function(){s111End('M');s111End('R1');s111End('R2');s111Begin('D');return f.apply(this,arguments)},...l.slice(2)];
    if(n==='highlights'||n==='pieces')return [n,function(){s111End('D');return f.apply(this,arguments)},...l.slice(2)];
    return l});
  try{return base.call(this,L)}finally{if(S1_111.cur){const C=S1_111.cur;S1_111.cur=null;if(RG111.cur===C){rg111Flush('open');RG111.cur=null}}}}}
/* the ends inside the walls / stands: after the sky (or the top in split mode), before the live flames, after the deco + planks */
if(V111.on&&typeof ar91Blit==='function'){const base=ar91Blit;ar91Blit=function(L){const r=base.apply(this,arguments);try{if(S1_111.cur&&typeof AR91!=='undefined'){
    if(L===AR91.L.sky)s111End('M');else if(L===AR91.L.top)s111End('R2')}}catch(e){}return r}}
if(V111.on&&typeof ar91Flames==='function'){const base=ar91Flames;ar91Flames=function(){s111End('M');s111End('R2');return base.apply(this,arguments)}}
/* the floor marks + decals (rubble, 194 WEAR, piles, blood, the chest) + 399's static shadow layer: one more picture, ending before the live cast shadows */
if(V111.on&&typeof l106DrawStatic==='function'){const base=l106DrawStatic;l106DrawStatic=function(){try{return base.apply(this,arguments)}finally{s111End('D')}}}
if(V111.on&&typeof ar91Deco==='function'){const base=ar91Deco;ar91Deco=function(){try{return base.apply(this,arguments)}finally{s111End('R1')}}}

/* ---------------- S2 · the jugs as pictures ---------------- */
const S2_111={map:new Map(),max:48,st:rg111Stat()};V111.st.pot=S2_111.st;
if(V111.on&&typeof drawPot==='function'){const base=drawPot;drawPot=function(x,y,s,eagle){
  if(RG111.on||RG111.cur||!s111OK()||!(s>4))return base.apply(this,arguments);
  let C=null;try{const t=RG111.ORIG.getTransform.call(ctx);if(t.b||t.c)return base.apply(this,arguments);
    const xx=x+(typeof POT105!=='undefined'&&POT105.dx||0),m=Math.max(4,s*0.08);   /* 192's jug: x ± 0.45 s, y − 0.9 s … y + 0.15 s (+ 409's glint); the eagle round is smaller */
    const x0=Math.floor((xx-s*0.62-m)*t.a+t.e),y0=Math.floor((y-s*1.02-m)*t.d+t.f),x1=Math.ceil((xx+s*0.62+m)*t.a+t.e),y1=Math.ceil((y+s*0.3+m)*t.d+t.f);
    const key=(eagle?'e':'j')+x0+','+y0+','+(x1-x0)+','+(y1-y0);let E=S2_111.map.get(key);
    if(!E){E={st:S2_111.st,rest:240};S2_111.map.set(key,E);if(S2_111.map.size>S2_111.max){const k0=S2_111.map.keys().next().value;S2_111.map.delete(k0)}}
    else{S2_111.map.delete(key);S2_111.map.set(key,E)}
    if(!rg111Ready(E))return base.apply(this,arguments);
    C=rg111Begin('pot',E,[x0,y0,x1-x0,y1-y0]);if(C)C.kind='sprite'}catch(e){C=null}
  try{return base.apply(this,arguments)}finally{if(C)rg111End(C)}}}

/* ---------------- the board draw: frame count, a nested draw flushes, S4 ---------------- */
if(V111.on&&typeof draw==='function'){const base=draw;draw=function(){if(RG111.on)rg111Flush('nested');V111.frame++;V111.lastDraw=performance.now();V111.st.draws++;
  if(V111.frame%300===0)s111Drop();const r=base.apply(this,arguments);try{s111Fx()}catch(e){}return r}}
/* memory: a board picture not used for 600 board draws (the other mode, a match left) lets its canvas go */
function s111Drop(){for(const k of ['M','R1','R2','D']){const E=S1_111[k];if(E.cv&&V111.frame-(E.used|0)>600){E.cv.width=0;E.cv.height=0;E.cv=null;E.g=null;E.tok=null}}
  for(const [k,E] of S2_111.map)if(V111.frame-(E.used|0)>600){S2_111.map.delete(k)}}
/* 321's base clean-up keeps the prototype's drawImage it first saw: make sure that is this module's (a call that skipped the recorder would draw out of order) */
if(V111.on&&typeof BS101!=='undefined'&&BS101.nat)BS101.nat=CanvasRenderingContext2D.prototype.drawImage;
function s111Fx(){if(typeof B95==='undefined'||!B95.fxCv||!B95.fxCx)return;const D=B95.fxCx._p107;if(!D)return;const hide=!D.dirty,c=B95.fxCv;
  if(c.__v111h!==hide){c.__v111h=hide;c.style.visibility=hide?'hidden':'';if(hide)V111.st.fxHide++;else V111.st.fxShow++}}

/* ---------------- S3 · no ImageBitmap pieces on WebKit ---------------- */
if(V111.on&&typeof Z99!=='undefined'&&!(typeof PERF_SWL!=='undefined'&&PERF_SWL.includes('v111z99'))){Z99.bmOn=false;V111.st.z99=true}

/* ---------------- S5 · device bakes wait for a quiet board ---------------- */
const S5_111={quietMs:220 /* TWEAK: no board draw for this long = quiet */,maxWait:5000 /* TWEAK: ms at most */};
window.an111Yield=V111.on?function(){const t0=performance.now(),B=V111.st.bake;B.waits++;
  return new Promise(ok=>{const go=()=>{B.ms+=performance.now()-t0;requestAnimationFrame(()=>setTimeout(ok,0))};
    const shown=()=>{try{const c=document.getElementById('cv');return !!(S&&!S.over&&c&&c.offsetParent&&!document.hidden&&!CUR_MODAL)}catch(e){return false}};
    const tick=()=>{const now=performance.now();if(!shown()||now-V111.lastDraw>=S5_111.quietMs){if(!shown())B.quiet++;go();return}
      if(now-t0>=S5_111.maxWait){B.maxed++;go();return}setTimeout(tick,60)};tick()})}:null;

/* ---------------- S6 · the recorder's v111 block ---------------- */
if(V111.on&&typeof REC107!=='undefined'&&REC107.AREAS){Object.assign(REC107.AREAS,{sharpen:['sh103Sharpen'],thin:['bs101Proc'],cellmk:['an100CellCanvas','bst100CellCanvas']})}
function v111Snap(){return JSON.parse(JSON.stringify(V111.st))}
if(typeof rec107Start==='function'){const base=rec107Start;rec107Start=function(){V111.rec0=v111Snap();return base.apply(this,arguments)}}
if(typeof rec107Extra==='function'){const base=rec107Extra;rec107Extra=function(){const o=base.apply(this,arguments)||{};try{o.v111=v111Report()}catch(e){o.v111={err:String(e)}}return o}}
function v111Report(){const a=V111.rec0||{},b=v111Snap(),d=(x,y)=>{const o={};for(const k in y)o[k]=typeof y[k]==='number'?+(y[k]-((x&&x[k])|0)).toFixed(1):y[k];return o};
  const draws=Math.max(1,b.draws-(a.draws|0)),rate=s=>{const n=s.hit+s.miss+s.flush+s.vol;return n?+(s.hit*100/n).toFixed(1):null};
  const M=d(a.M,b.M),R1=d(a.R1,b.R1),R2=d(a.R2,b.R2),D=d(a.D,b.D),pot=d(a.pot,b.pot);
  return {on:V111.on,live:V111.live,mode:S1_111.mode,board:{M,R1,R2,D,hitPct:{M:rate(M),R1:rate(R1),R2:rate(R2),D:rate(D)}},pots:{...pot,hitPct:rate(pot),cached:S2_111.map.size},
    flush:d(a.flush,b.flush),boardDraws:draws,bigBlitsSavedPerDraw:+((b.blitsSaved-(a.blitsSaved|0))/draws).toFixed(2),drawCallsSavedPerDraw:+((b.opsSaved-(a.opsSaved|0))/draws).toFixed(1),
    z99Pieces:!b.z99,fx95:{hidden:B95Hidden(),hide:b.fxHide-(a.fxHide|0),show:b.fxShow-(a.fxShow|0)},bake:d(a.bake,b.bake),
    note:'board ranges: M = rim…sky in one picture; split = R1 rim…planks + R2 crowd…top (a live crowd between); D = floor marks…static shadows. hit = one blit for the range'}} /* i18n:skip */
function B95Hidden(){try{return !!(B95.fxCv&&B95.fxCv.__v111h)}catch(e){return null}}

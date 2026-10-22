/* =====================================================================
   419-v111gl — v1.11 SPIKE: THE BOARD THROUGH WebGL (his 1a 2a 3a, 2026-10-22: a 2–3 day spike that measures Safari before v1.11 is
   built; tools/plans/v111/GL-SPIKE.md). OPT-IN ONLY: off unless localStorage flavius_gl111=1 or the page address ends in #perf=gl111
   (00b-perf turns that into the same key for one load). Off = nothing here is installed: no hook, no canvas, the 2D board as before.
   DISPLAY ONLY: rules, dice (RNG), S, the log, saves and the online hash are untouched — nothing here calls rand() or sends anything.
   Why: Safari's 2D canvas runs in its GPU process and rasterises with CoreGraphics; every board draw re-composites ~15 board-sized cached
   layers (stone under/deco/top, LIGHT source-atop, SKY destination-over, tiles, wear, night grade, shadow + torch layers) plus ~150 small
   drawImage and ~1100 path/rect calls. Here the board's drawImage calls are routed into WebGL as textured quads instead:
   • PLANES (level 1+): a drawImage on the board whose SOURCE is board-sized (≥ GL111.planeFrac of the board canvas — the cached layers
     LAYERS93 watches: 192 AR91.L, 235 TILES96, 194 WEAR91_C, 189 NIGHT91, 399 L106.layer, 409 V108) is drawn by a WebGL canvas BELOW
     #cv (#gl111p), each source uploaded as a texture only when its content revision changes; the plane canvas is not touched at all when
     the list of planes, their revisions and places are the same as last draw (skips). source-over / source-atop / destination-over /
     lighter / multiply / screen / destination-in / destination-out map to blend functions.
   • SPRITES (level 2, default): every other drawImage of the 'pieces' layer (figures, beasts, props, corpses: 311/312/321/346/404 cells)
     goes to a second WebGL canvas ABOVE #cv (#gl111s), streamed in the 2D path's painter's order, batched while the texture stays.
   • Everything else (paths, rects, text, the crowd sprites, highlights, lighting passes' vector parts, overlays, Flavius, duel) stays on
     #cv in between. Known order changes (spike): 2D content of layers BELOW a plane now lies above it (crowd over the stand walls, zone
     tints / floor marks over the near wall); 2D content of 'pieces' and the later layers (pots drawn in code, tethers, rings, the duel
     vignette) lies UNDER the sprites; clipped / filtered / shadowed drawImage calls stay 2D. Zoomed boards (duelCam > 1: 260/330 chunks
     copy #cv) and Naumachia / Chariot tiles are drawn 2D as before (the GL canvases are hidden for that draw).
   • Measured: GL111.st (board draws, GL draw calls, texture uploads + bytes, planes / sprites routed, skips, fall-backs by reason, JS ms
     of the routing + GL work); 405's recorder report carries gl111:{on, ctx, drawsPerFrame, texUploadsPerS, msPerFrame, …}.
   • Level: localStorage flavius_gl111lv = 1 (planes only) | 2 (planes + sprites, default) — #perf=gl111,gl111lv:1. flavius_gl111v1=1
     forces WebGL1. Context loss / any GL error → back to the 2D board for the visit (GL111.err says why); a
     cross-origin (tainted) picture cannot be a texture: that source stays 2D (fall-back 'tainted' — a file:// page taints them all).
   Dev / tests: GL111.set(true|false) switches at run time; GL111.dbgRead = true reads a few plane pixels after each GL draw (lit).
   Bench tools/bench/gl111.js · test tv111gl.
   ===================================================================== */
const GL111={want:false,lv:2,on:false,hooks:false,type:null,P:null,Q:null,cur:null,inDraw:false,clip:[],clipped:false,planes:[],
  planeFrac:0.45 /* TWEAK: a source this share of the board canvas (or more) is a plane */,key:'',sig:'',qUsed:false,qHad:false,
  ids:new WeakMap(),nid:0,taint:new WeakSet(),err:null,dbgRead:false,lit:-1,proto0:null,
  st:{draws:0,glDraws:0,uploads:0,upBytes:0,planes:0,sprites:0,skips:0,fall:{},ms:0,lost:0,hidden:0}};
try{GL111.want=localStorage.getItem('flavius_gl111')==='1';const v=parseInt(localStorage.getItem('flavius_gl111lv'),10);if(v===1||v===2)GL111.lv=v}catch(e){}

/* ---------- the renderer: one WebGL context drawing textured quads ---------- */
function gl111Mk(c){const opt={alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:false};try{if(localStorage.getItem('flavius_gl111keep')==='1')opt.preserveDrawingBuffer=true}catch(e){}
  let gl=null,type=null,v1=false;try{v1=localStorage.getItem('flavius_gl111v1')==='1'}catch(e){}
  if(!v1)try{gl=c.getContext('webgl2',opt);if(gl)type='webgl2'}catch(e){gl=null}
  if(!gl)try{gl=c.getContext('webgl',opt)||c.getContext('experimental-webgl',opt);if(gl)type='webgl1'}catch(e){gl=null}
  if(!gl)return null;
  const sh=(k,src)=>{const s=gl.createShader(k);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('gl111 shader: '+gl.getShaderInfoLog(s));return s};
  const pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 p;attribute vec2 t;attribute float a;varying vec2 vt;varying float va;void main(){vt=t;va=a;gl_Position=vec4(p,0.0,1.0);}'));
  gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,'#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nuniform sampler2D s;varying vec2 vt;varying float va;void main(){gl_FragColor=texture2D(s,vt)*va;}'));
  gl.bindAttribLocation(pr,0,'p');gl.bindAttribLocation(pr,1,'t');gl.bindAttribLocation(pr,2,'a');gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('gl111 link: '+gl.getProgramInfoLog(pr));
  gl.useProgram(pr);gl.uniform1i(gl.getUniformLocation(pr,'s'),0);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.enableVertexAttribArray(0);gl.enableVertexAttribArray(1);gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(0,2,gl.FLOAT,false,20,0);gl.vertexAttribPointer(1,2,gl.FLOAT,false,20,8);gl.vertexAttribPointer(2,1,gl.FLOAT,false,20,16);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.enable(gl.BLEND);gl.activeTexture(gl.TEXTURE0);
  const R={c,gl,type,pr,buf,cap:1024,arr:new Float32Array(1024*30),n:0,tex:new Map(),bytes:0,frame:0,max:gl.getParameter(gl.MAX_TEXTURE_SIZE)||4096,bT:null,bOp:null,W:1,H:1,lost:false};
  gl.bufferData(gl.ARRAY_BUFFER,R.arr.byteLength,gl.DYNAMIC_DRAW);
  c.addEventListener('webglcontextlost',e=>{e.preventDefault();R.lost=true;GL111.st.lost++;gl111Fail('context lost')});
  return R}
const GL111_BLEND={'source-over':1,'source-atop':1,'destination-over':1,lighter:1,multiply:1,screen:1,'destination-in':1,'destination-out':1};
function gl111Blend(gl,op){switch(op){
  case 'source-atop':gl.blendFuncSeparate(gl.DST_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ZERO,gl.ONE);break;
  case 'destination-over':gl.blendFunc(gl.ONE_MINUS_DST_ALPHA,gl.ONE);break;
  case 'lighter':gl.blendFunc(gl.ONE,gl.ONE);break;
  case 'multiply':gl.blendFuncSeparate(gl.DST_COLOR,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);break;  /* exact over an opaque destination */
  case 'screen':gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_COLOR);break;
  case 'destination-in':gl.blendFunc(gl.ZERO,gl.SRC_ALPHA);break;
  case 'destination-out':gl.blendFunc(gl.ZERO,gl.ONE_MINUS_SRC_ALPHA);break;
  default:gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA)}}
/* a source's content revision: pictures by address, bitmaps never change, canvases by the counters bumped on every change (ours: __g111,
   406's __v107) — a canvas without a counter (made before the hooks) is uploaded again every GL draw (counted as an upload) */
function gl111Rev(s,R){if(typeof HTMLImageElement!=='undefined'&&s instanceof HTMLImageElement)return (s.currentSrc||s.src)+'|'+s.naturalWidth;
  if(typeof ImageBitmap!=='undefined'&&s instanceof ImageBitmap)return 'b'+s.width+'x'+s.height;
  return (s.__g111===undefined?'f'+R.frame:'g'+s.__g111)+'.'+(s.__v107|0)+'.'+s.width+'x'+s.height}
function gl111Dim(s){const w=s.naturalWidth||s.videoWidth||s.width||0,h=s.naturalHeight||s.videoHeight||s.height||0;return [w,h]}
function gl111Tex(R,s){const gl=R.gl;let e=R.tex.get(s);const rev=gl111Rev(s,R);
  if(e&&e.rev===rev){e.used=R.frame;return e}
  if(!e){e={t:gl.createTexture(),rev:null,w:0,h:0,bytes:0,used:R.frame};R.tex.set(s,e);gl.bindTexture(gl.TEXTURE_2D,e.t);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)}
  else gl.bindTexture(gl.TEXTURE_2D,e.t);
  R.bT=null;const [w,h]=gl111Dim(s);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,s);
  R.bytes+=w*h*4-e.bytes;e.bytes=w*h*4;e.w=w;e.h=h;e.rev=rev;e.used=R.frame;GL111.st.uploads++;GL111.st.upBytes+=w*h*4;return e}
/* textures not drawn for a while are deleted (the sources may be gone) */
function gl111Sweep(R){if(R.frame%120)return;for(const [s,e] of R.tex)if(R.frame-e.used>240){try{R.gl.deleteTexture(e.t)}catch(x){}R.bytes-=e.bytes;R.tex.delete(s)}}
function gl111Begin(R,W,H){const gl=R.gl;R.frame++;R.n=0;R.bT=null;R.bOp=null;R.W=W;R.H=H;if(R.c.width!==W)R.c.width=W;if(R.c.height!==H)R.c.height=H;
  gl.viewport(0,0,W,H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT)}
function gl111Batch(R){if(!R.n)return;const gl=R.gl;gl.bindBuffer(gl.ARRAY_BUFFER,R.buf);gl.bufferSubData(gl.ARRAY_BUFFER,0,R.arr.subarray(0,R.n*30));
  gl.drawArrays(gl.TRIANGLES,0,R.n*6);GL111.st.glDraws++;R.n=0}
/* one quad: q = [source, sx, sy, sw, sh, x0,y0, x1,y1, x2,y2, x3,y3 (device px: top-left, top-right, bottom-left, bottom-right), alpha, op] */
function gl111Quad(R,q){const gl=R.gl,s=q[0];
  /* the pending batch is drawn BEFORE any bind / upload: it must use the texture (and content) it was queued with */
  const pe=R.tex.get(s);if(!pe||pe.t!==R.bT||pe.rev!==gl111Rev(s,R)||q[14]!==R.bOp||R.n>=R.cap)gl111Batch(R);
  let e;try{e=gl111Tex(R,s)}catch(x){if(x&&x.name==='SecurityError'){GL111.taint.add(s);gl111Fall('tainted');return false}throw x}
  if(e.t!==R.bT){gl.bindTexture(gl.TEXTURE_2D,e.t);R.bT=e.t}if(q[14]!==R.bOp){gl111Blend(gl,q[14]);R.bOp=q[14]}
  const W=R.W,H=R.H,u0=q[1]/e.w,v0=q[2]/e.h,u1=(q[1]+q[3])/e.w,v1=(q[2]+q[4])/e.h,a=q[13];
  const X=x=>x/W*2-1,Y=y=>1-y/H*2;const A=R.arr;let o=R.n*30;
  const put=(x,y,u,v)=>{A[o++]=X(x);A[o++]=Y(y);A[o++]=u;A[o++]=v;A[o++]=a};
  put(q[5],q[6],u0,v0);put(q[7],q[8],u1,v0);put(q[9],q[10],u0,v1);put(q[7],q[8],u1,v0);put(q[11],q[12],u1,v1);put(q[9],q[10],u0,v1);R.n++;return true}

/* ---------- the canvases: planes under #cv, sprites over it (same box, same device size) ---------- */
function gl111Css(){if(document.getElementById('gl111css'))return;const st=document.createElement('style');st.id='gl111css';
  st.textContent='#cv.gl111on{position:relative}#gl111p,#gl111s{position:absolute;pointer-events:none;left:0;top:0}#gl111p[hidden],#gl111s[hidden]{display:none}body.chromeoff #gl111s{display:none}';
  document.head.appendChild(st)}
function gl111Canvas(id,before){const wrap=cv.parentElement;if(!wrap)return null;let c=document.getElementById(id);
  if(!c){c=document.createElement('canvas');c.id=id;c.setAttribute('aria-hidden','true');c.hidden=true}
  if(c.parentElement!==wrap||(before?c.nextSibling!==cv:cv.nextSibling!==c))wrap.insertBefore(c,before?cv:cv.nextSibling);return c}
function gl111Place(){const dpr=window.devicePixelRatio||1,key=cv.width+'x'+cv.height+'@'+dpr+'/'+innerWidth+'x'+innerHeight+'/'+(cv.style.height||'');
  if(key===GL111.key)return;GL111.key=key;const w=cv.clientWidth,h=cv.clientHeight,l=cv.offsetLeft+'px',t=cv.offsetTop+'px';
  for(const R of [GL111.P,GL111.Q])if(R){const s=R.c.style;s.width=w+'px';s.height=h+'px';s.left=l;s.top=t}}
function gl111Show(on){for(const R of [GL111.P,GL111.Q])if(R&&R.c.hidden===on)R.c.hidden=!on;if(cv.classList.contains('gl111on')!==on)cv.classList.toggle('gl111on',on);if(!on)GL111.st.hidden++}

/* ---------- the hooks (installed only when the spike is on) ---------- */
function gl111Hooks(){if(GL111.hooks)return;GL111.hooks=true;
  /* every 2D canvas made from now on counts its changes (__g111) — the board's own context is left alone */
  const MUT=['fill','stroke','fillRect','strokeRect','clearRect','fillText','strokeText','drawImage','putImageData','reset'];
  const bump=c=>{c.__g111=(c.__g111|0)+1};
  const inst=(c,g)=>{if(!g||g.__g111i||c===cv)return;try{g.__g111i=1;if(c.__g111===undefined)c.__g111=0;for(const m of MUT){const f=g[m];if(typeof f==='function')g[m]=function(){bump(c);return f.apply(this,arguments)}}}catch(e){}};
  for(const C of [window.HTMLCanvasElement,window.OffscreenCanvas])if(C){const P=C.prototype,gc=P.getContext;
    P.getContext=function(type){const g=gc.apply(this,arguments);if(type==='2d')inst(this,g);return g};
    for(const k of ['width','height']){const d=Object.getOwnPropertyDescriptor(P,k);if(d&&d.set)Object.defineProperty(P,k,{configurable:true,enumerable:d.enumerable,get:d.get,set(v){if(this.__g111!==undefined)this.__g111++;d.set.call(this,v)}})}}
  /* the board context's clip state (a clipped draw stays 2D) */
  const P2=CanvasRenderingContext2D.prototype;
  for(const [k,fn] of [['save',()=>GL111.clip.push(GL111.clipped)],['restore',()=>{GL111.clipped=GL111.clip.length?GL111.clip.pop():false}],['clip',()=>{GL111.clipped=true}],['reset',()=>{GL111.clip=[];GL111.clipped=false}]]){
    const f=P2[k];if(typeof f!=='function')continue;P2[k]=function(){if(this===ctx&&GL111.inDraw)fn();return f.apply(this,arguments)}}
  /* the board's drawImage: routed into GL, or the 2D path as before */
  const di=P2.drawImage;GL111.proto0=di;
  P2.drawImage=function(s){if(this!==ctx||!GL111.inDraw||!s)return di.apply(this,arguments);const t0=performance.now();let r=0;
    try{r=gl111Route(this,arguments)}catch(e){gl111Fail(e);r=0}
    GL111.st.ms+=performance.now()-t0;return r?undefined:di.apply(this,arguments)};
  try{if(typeof BS101!=='undefined'&&BS101.nat===di)BS101.nat=P2.drawImage}catch(e){}
  /* 260 cuts a cached board-sized layer into ImageBitmap pieces for the 2D blit (z99Put): in a GL frame the whole canvas goes in one
     drawImage instead — one texture, one quad (a fall-back draws the same pixels in 2D) */
  if(typeof z99Put==='function'){const b=z99Put;z99Put=function(h,dx,dy){if(GL111.on&&GL111.inDraw&&h&&h.cv&&h.cv.width*h.cv.height>=GL111.planeFrac*cv.width*cv.height){ctx.drawImage(h.cv,dx,dy);return}return b.apply(this,arguments)}}
  /* which layer is painting (219's manager asks each layer's off() just before it runs, and records it just after) */
  try{for(const n in LAYERS93.byName){const d=LAYERS93.byName[n],o=d.off;d.off=function(){const v=o.apply(this,arguments);GL111.cur=v?null:n;return v}}}catch(e){}
  if(typeof layers93Rec==='function'){const b=layers93Rec;layers93Rec=function(){GL111.cur=null;return b.apply(this,arguments)}}}
function gl111Fall(why){GL111.st.fall[why]=(GL111.st.fall[why]||0)+1;return 0}
/* returns 1 when the call was taken by GL (the 2D call is skipped), 0 for the 2D path */
function gl111Route(g,a){const s=a[0];const [SW,SH]=gl111Dim(s);if(!SW||!SH)return 0;
  const big=SW*SH>=GL111.planeFrac*cv.width*cv.height,plane=big;
  if(!plane&&!(GL111.lv>=2&&GL111.Q&&GL111.cur==='pieces'))return 0;
  const op=g.globalCompositeOperation;if(!GL111_BLEND[op]||(!plane&&op!=='source-over'&&op!=='lighter'))return gl111Fall('op:'+op);
  if(GL111.clipped)return gl111Fall(plane?'clip:plane':'clip');
  if(g.filter&&g.filter!=='none')return gl111Fall('filter');
  if((g.shadowBlur>0||g.shadowOffsetX||g.shadowOffsetY)&&!/^rgba\(\d+, \d+, \d+, 0\)$|^transparent$/.test(g.shadowColor))return gl111Fall('shadow');
  const R=plane?GL111.P:GL111.Q;if(!R||R.lost)return 0;if(GL111.taint.has(s))return gl111Fall('tainted');if(SW>R.max||SH>R.max)return gl111Fall('size');
  if(typeof s.close==='function'&&!(s.width>0))return 0;
  let sx=0,sy=0,sw=SW,sh=SH,dx,dy,dw,dh;
  if(a.length>=9){sx=a[1];sy=a[2];sw=a[3];sh=a[4];dx=a[5];dy=a[6];dw=a[7];dh=a[8]}else if(a.length>=5){dx=a[1];dy=a[2];dw=a[3];dh=a[4]}else{dx=a[1];dy=a[2];dw=SW;dh=SH}
  if(!(sw&&sh&&dw&&dh))return 1;   /* nothing to draw (2D draws nothing either) */
  const m=g.getTransform(),x0=dx,y0=dy,x1=dx+dw,y1=dy+dh;
  const q=[s,sx,sy,sw,sh,m.a*x0+m.c*y0+m.e,m.b*x0+m.d*y0+m.f,m.a*x1+m.c*y0+m.e,m.b*x1+m.d*y0+m.f,m.a*x0+m.c*y1+m.e,m.b*x0+m.d*y1+m.f,m.a*x1+m.c*y1+m.e,m.b*x1+m.d*y1+m.f,g.globalAlpha,op];
  if(plane){GL111.planes.push(q);GL111.st.planes++;return 1}
  /* sprites stream in painter's order (an upload between two quads of one canvas keeps each quad's own content) */
  if(!GL111.qUsed){GL111.qUsed=true;gl111Begin(R,cv.width,cv.height)}
  if(!gl111Quad(R,q))return 0;GL111.st.sprites++;return 1}
function gl111Sid(o){let v=GL111.ids.get(o);if(!v){v=++GL111.nid;GL111.ids.set(o,v)}return v}
/* end of a board draw: the planes (only when something changed), the sprites' last batch */
function gl111Flush(){const P=GL111.P,Q=GL111.Q,W=cv.width,H=cv.height;
  if(P&&!P.lost){const L=GL111.planes;let sig=W+'x'+H,blind=false;
    for(const q of L){const rv=gl111Rev(q[0],P);if(rv[0]==='f')blind=true;sig+='|'+gl111Sid(q[0])+':'+rv+':'+q.slice(1,15).map(v=>typeof v==='number'?Math.round(v*100):v).join(',')}
    if(sig===GL111.sig&&!GL111.dirty&&!blind)GL111.st.skips++;   /* a canvas without a change counter is never trusted */
    else{GL111.sig=sig;GL111.dirty=false;gl111Begin(P,W,H);let bad=0;for(const q of L)if(!gl111Quad(P,q))bad++;if(bad){GL111.sig='';setTimeout(()=>{try{if(S)draw()}catch(x){}},0)}gl111Batch(P);gl111Sweep(P);
      if(GL111.dbgRead){const gl=P.gl,px=new Uint8Array(4);let lit=0;for(let i=1;i<=5;i++)for(let j=1;j<=5;j++){gl.readPixels(Math.floor(W*i/6),Math.floor(H*j/6),1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);if(px[3]>0)lit++}GL111.lit=lit;GL111.glErr=gl.getError()}}}
  if(Q&&!Q.lost){if(GL111.qUsed){gl111Batch(Q);gl111Sweep(Q);GL111.qHad=true}else if(GL111.qHad){gl111Begin(Q,W,H);GL111.qHad=false}}}
function gl111FrameOK(){try{if(HEADLESS||!S||S.sim||!cv.width||!cv.parentElement)return false;if(typeof duelCam==='function'&&duelCam()>1.001)return false;
  if(typeof isNaum==='function'&&isNaum())return false;if(typeof isChariot==='function'&&isChariot())return false;return true}catch(e){return false}}

/* ---------- on / off ---------- */
function gl111Fail(e){GL111.err=String(e&&e.message||e).slice(0,200);try{console.warn('gl111 → 2D:',GL111.err)}catch(x){}gl111Off();setTimeout(()=>{try{if(S&&!HEADLESS)draw()}catch(x){}},0)}
function gl111On(){if(GL111.on)return true;try{gl111Hooks();gl111Css();
    const pc=gl111Canvas('gl111p',true);GL111.P=GL111.P&&!GL111.P.lost?GL111.P:gl111Mk(pc);if(!GL111.P)throw new Error('no WebGL');GL111.type=GL111.P.type;
    if(GL111.lv>=2){const qc=gl111Canvas('gl111s',false);GL111.Q=GL111.Q&&!GL111.Q.lost?GL111.Q:gl111Mk(qc);if(!GL111.Q)throw new Error('no WebGL (sprites)')}
    GL111.on=true;GL111.err=null;GL111.key='';GL111.sig='';return true}catch(e){GL111.err=String(e&&e.message||e).slice(0,200);gl111Off();return false}}
function gl111Off(){GL111.on=false;GL111.inDraw=false;GL111.sig='';
  for(const k of ['P','Q']){const R=GL111[k];if(!R)continue;try{const x=R.gl.getExtension('WEBGL_lose_context');if(x&&!R.lost)x.loseContext()}catch(e){}try{R.c.remove()}catch(e){}GL111[k]=null}
  try{cv.classList.remove('gl111on')}catch(e){}}
GL111.set=function(on){if(on){GL111.want=true;gl111On()}else{GL111.want=false;gl111Off()}try{if(S&&!HEADLESS)draw()}catch(e){}return GL111.on};

/* the rim (a filled polygon UNDER the whole sand, painted first) would cover the GL tiles from #cv: in a GL frame it is painted once per
   view into its own board-sized canvas (painted on the still-empty #cv, copied out, cleared) and drawn as a plane */
GL111.rim={c:null,key:''};
function gl111Rim(paint){const W=cv.width,H=cv.height,R=GL111.rim;let key='';
  try{key=[W,H,OX,OY,TW,N,typeof TB!=='undefined'?TB.rim:'',typeof ROT89!=='undefined'?ROT89.k:0,window.devicePixelRatio||1].join('|')}catch(e){return paint()}
  if(!R.c)R.c=document.createElement('canvas');
  if(key!==R.key||R.c.width!==W||R.c.height!==H){paint();if(R.c.width!==W)R.c.width=W;if(R.c.height!==H)R.c.height=H;const g=R.c.getContext('2d');
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);g.drawImage(cv,0,0);R.key=key;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.restore()}
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.drawImage(R.c,0,0);ctx.restore()}

/* ---------- the board draw ---------- */
if(typeof drawLayers93==='function'){const base=drawLayers93;drawLayers93=function(){
  if(!GL111.want||HEADLESS)return base.apply(this,arguments);
  if(!GL111.on&&!GL111.err&&!gl111On())return base.apply(this,arguments);
  if(!GL111.on)return base.apply(this,arguments);
  GL111.ran=true;if(!gl111FrameOK()){gl111Show(false);GL111.sig='';return base.apply(this,arguments)}
  GL111.inDraw=true;GL111.clip=[];GL111.clipped=false;GL111.planes=[];GL111.qUsed=false;GL111.cur=null;GL111.st.draws++;
  const a=Array.prototype.slice.call(arguments);if(Array.isArray(a[0]))a[0]=a[0].map(l=>l&&l[0]==='rim'&&typeof l[1]==='function'?['rim',()=>gl111Rim(l[1]),...l.slice(2)]:l);
  let r;try{r=base.apply(this,a)}finally{GL111.inDraw=false;GL111.cur=null;const t0=performance.now();
    try{if(GL111.on){gl111Place();gl111Flush();gl111Show(true)}}catch(e){gl111Fail(e)}GL111.st.ms+=performance.now()-t0}
  return r}}
/* a draw that paints no board (menu, no event) hides the GL canvases */
if(typeof draw==='function'){const base=draw;draw=function(){if(!GL111.on)return base.apply(this,arguments);GL111.ran=false;const r=base.apply(this,arguments);
  try{if(!GL111.ran&&!HEADLESS){gl111Show(false);GL111.sig=''}}catch(e){}return r}}

/* ---------- 405's recorder: the gl111 block ---------- */
GL111.r0=null;
function gl111Snap(){return {t:performance.now(),...GL111.st,fall:{...GL111.st.fall}}}
function gl111Report(){const a=GL111.r0||{t:0,draws:0,glDraws:0,uploads:0,upBytes:0,planes:0,sprites:0,skips:0,ms:0,fall:{}},b=gl111Snap();const secs=Math.max(0.001,(b.t-a.t)/1000),n=Math.max(1,b.draws-a.draws);
  const fall={};for(const k in b.fall){const v=b.fall[k]-(a.fall[k]||0);if(v)fall[k]=+(v/n).toFixed(2)}
  const tex=[GL111.P,GL111.Q].filter(Boolean).reduce((s,R)=>s+R.bytes,0);
  return {on:GL111.on,want:GL111.want,lv:GL111.lv,ctx:GL111.type,err:GL111.err,boardDraws:b.draws-a.draws,drawsPerFrame:+((b.glDraws-a.glDraws)/n).toFixed(2),
    texUploadsPerS:+((b.uploads-a.uploads)/secs).toFixed(1),texMBPerS:+((b.upBytes-a.upBytes)/secs/1048576).toFixed(1),msPerFrame:+((b.ms-a.ms)/n).toFixed(2),
    planesPerFrame:+((b.planes-a.planes)/n).toFixed(1),spritesPerFrame:+((b.sprites-a.sprites)/n).toFixed(1),planeSkips:b.skips-a.skips,fallPerFrame:fall,
    texMB:+(tex/1048576).toFixed(1),textures:[GL111.P,GL111.Q].filter(Boolean).map(R=>R.tex.size),lost:b.lost,
    note:'per frame = per board draw (drawLayers93); drawsPerFrame = WebGL draw calls; msPerFrame = JS ms of the routing + GL work'}} /* i18n:skip */
if(typeof rec107Start==='function'){const b=rec107Start;rec107Start=function(){GL111.r0=gl111Snap();return b.apply(this,arguments)}}
if(typeof rec107Extra==='function'){const b=rec107Extra;rec107Extra=function(){const o=b.apply(this,arguments);try{o.gl111=gl111Report()}catch(e){o.gl111={err:String(e)}}return o}}

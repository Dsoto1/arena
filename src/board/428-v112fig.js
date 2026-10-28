/* =====================================================================
   428-v112fig — v1.12 FIGURES FROM TURN ONE (his A1a–A6a, 2026-10-23; docs/decisions.md "v1.12+ scope", tools/plans/v112/NOTES.md).
   DISPLAY ONLY: rules, dice (rand / pickOne / rnd), S, the log, saves, onlHash and the online lockstep are untouched — nothing here calls
   rand(), writes S or sends anything. No server change (A5a: each device bakes its own sheets, as before).
   WHY: Studio, online and gear-true figures (311 an100Dev → an100Pump) are baked ON THE DEVICE and show 400's still until done — often most
   of a new look's first match; the bake's 2D pixel passes (tok93 sheetSteps grab / halve / alphaBox getImageData, 311 shadowRow's
   read-backs) cost ~740 ms per 10 s on Safari mid-match.
   • D1 (A2a) THE PIXEL WORK IN A WORKER: 311's an100Pump is replaced by the same pump whose renders go through f112Render — a copy of
     311's AN100L.render where each yaw is still drawn by three.js ON THE MAIN THREAD (one yaw = one task: its own WebGL renderer with
     tok93's settings, the same ortho camera, sun, outline and yaw), then handed to ONE Worker as an ImageBitmap (createImageBitmap, no
     read-back); the Worker does grab → halve → alpha box → the frame's cut (tok93 sheetSteps' arithmetic), the ground-shadow row (311
     shadowRow: halve, box > 4, blur(0.5px) cut) and the packed sheets + their WebP (OffscreenCanvas.convertToBlob, as toBlob) and sends
     back blobs + metas. Same pixels as the main-thread path (tv112f compares both sheets pixel by pixel). Shaders are compiled with
     compileAsync before the first yaw. No Worker / no OffscreenCanvas 2D / a worker error: 311's main-thread render, as before.
     (three.js inside the Worker was not ported: tok93 builds the figure from the page's DOM / ImageData — out of scope.)
   • D2 (A3a) WARM-UP BEFORE THE MATCH: when the briefing opens (05-flow startEvent → eventBriefing(true); an online joiner: onlJoinMatch)
     311's an100Snap runs right away (display only, reads p), so every seat's MOVE sheet (yours first) bakes behind the briefing; when the
     briefing closes and some are not ready, a small "Preparing the figures…" card waits at most 3 s (6 s on a phone), then the still and
     the bake goes on in the background. HEADLESS, sims, tutorials, Animations Off, Reduce motion: no wait (the early start stays).
   • A4a WebKit (406 P107S.webkit; flavius_v107safariforce=1) without the Worker path (OffscreenCanvas 2D needs Safari 17): bakes run only
     inside the warm-up window (briefing + wait); a bake still running when the match starts stops at its next frame and is PARKED until the
     next event's warm-up; in the match the still (cached sheets from IndexedDB still load).
   • D3 THE RECORDER (405 ⏺): a "v112f" block — sheets baked (worker / main), bake ms per sheet, main-thread bake ms + its longest slice,
     figures shown as stills / stand-ins (count + seconds until their sheet landed), warm-up waits (ms, capped), parked / blocked bakes, worker state.
   IndexedDB stays 311's (flavius_anim100, ≤ AN100.dbMax = 24 sheets); no new download bytes (the Worker is a Blob URL).
   Kill switch localStorage flavius_v112figoff=1 (or #perf=v112figoff): nothing installed — exactly v1.12. Test switch flavius_v112fignowk=1
   = as if the Worker path were missing. Stats F112.st. Test tv112f.
   ===================================================================== */
const F112={off:(()=>{try{return localStorage.getItem('flavius_v112figoff')==='1'||(typeof PERF_SWL!=='undefined'&&PERF_SWL.includes('v112figoff'))}catch(e){return false}})(),
  noWk:(()=>{try{return localStorage.getItem('flavius_v112fignowk')==='1'}catch(e){return false}})(),
  on:false,webkit:false,w:null,wOK:null,probe:null,jid:0,jobs:new Map(),RF:null,RS:null,PLANE:null,
  warm:null,warmOn:false,park:[],asking:null,lastKey:new WeakMap(),stillT:new Map(),card:null,
  capMs:3000 /* TWEAK: longest warm-up wait after the briefing, desktop */,capPhone:6000 /* TWEAK: on a phone */,jobMs:30000 /* a worker job's time-out */,
  st:{sheets:0,wk:0,main:0,bakeMs:0,mainMs:0,mainMax:0,log:[],stills:{n:0,ms:0},warm:{n:0,waits:0,waitMs:0,capped:0,ready:0,skipped:0},
    parked:0,blocked:0,wfail:0,wErr:'',slice:0 /* the longest main-thread bake slice so far (worker path) */}};
F112.on=!F112.off&&typeof AN100!=='undefined'&&typeof AN100L!=='undefined'&&typeof an100Pump==='function'&&typeof an100Got==='function'&&typeof AN100L.render==='function';
F112.webkit=typeof P107S!=='undefined'&&!!P107S.webkit;
const f112Now=()=>performance.now();

/* i18n:skip-begin (v1.14: the Worker source and its failure reasons are code/diagnostics, not UI) */
/* ---------------- the Worker (one, made on first need; a Blob URL — nothing downloaded) ---------------- */
const F112_WSRC=`const J=new Map();
const mk=(w,h)=>new OffscreenCanvas(w,h);
const halve=c=>{const d=mk(Math.ceil(c.width/2),Math.ceil(c.height/2));const g=d.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(c,0,0,d.width,d.height);return d};
const box=(c,th)=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let x0=1e9,y0=1e9,x1=-1,y1=-1;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>th){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}return [x0,y0,x1,y1]};
const job=j=>{let o=J.get(j);if(!o){o={cells:{},sh:{},rows:[],shr:[]};J.set(j,o)}return o};
const pix=c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height);return {w:c.width,h:c.height,b:d.data.buffer}};
self.onmessage=async e=>{const q=e.data;try{
  if(q.t==='probe'){let ok=false;try{const c=mk(2,2);ok=!!c.getContext('2d')&&typeof c.convertToBlob==='function'}catch(x){}self.postMessage({t:'probe',ok});return}
  const o=job(q.j);
  if(q.t==='cell'){let c=mk(q.S,q.S);c.getContext('2d').drawImage(q.bm,0,0,q.S,q.S,0,0,q.S,q.S);try{q.bm.close()}catch(x){}
    for(let k=q.ss;k>1;k/=2)c=halve(c);(o.cells[q.ri]||(o.cells[q.ri]=[]))[q.k]={c,box:box(c,8)};return}
  if(q.t==='frame'){const cells=o.cells[q.ri],AX=q.AX,AY=q.AY;delete o.cells[q.ri];let L=0,Rr=0,T=0,Bm=0;
    for(const {box} of cells){L=Math.max(L,AX-box[0]);Rr=Math.max(Rr,box[2]+1-AX);T=Math.max(T,AY-box[1]);Bm=Math.max(Bm,box[3]+1-AY)}
    const half=Math.ceil(Math.max(L,Rr))+1,w=half*2,top=Math.ceil(T)+1,h=top+Math.ceil(Bm)+1;const x0=Math.floor(AX)-half,y0=Math.floor(AY)-top;
    const out=mk(w*cells.length,h),g=out.getContext('2d');cells.forEach(({c},i)=>g.drawImage(c,x0,y0,w,h,i*w,0,w,h));
    o.rows.push({name:q.name,c:out,m:[w,h,+(AX-x0).toFixed(1),+(AY-y0).toFixed(1)]});return}
  if(q.t==='shc'){let c=mk(q.S,q.S);c.getContext('2d').drawImage(q.bm,0,0);try{q.bm.close()}catch(x){}
    for(let k=q.ss;k>1;k/=2)c=halve(c);(o.sh[q.ri]||(o.sh[q.ri]=[]))[q.k]=c;return}
  if(q.t==='shrow'){const cells=o.sh[q.ri],AX=q.AX,AY=q.AY;delete o.sh[q.ri];let x0=1e9,y0=1e9,x1=-1,y1=-1;
    for(const c of cells){const b=box(c,4);if(b[0]<x0)x0=b[0];if(b[2]>x1)x1=b[2];if(b[1]<y0)y0=b[1];if(b[3]>y1)y1=b[3]}
    if(x1<0){x0=Math.floor(AX);y0=Math.floor(AY);x1=x0+1;y1=y0+1}
    x0=Math.max(0,x0-2);y0=Math.max(0,y0-2);x1+=3;y1+=3;let w=x1-x0,h=y1-y0;w+=w&1;h+=h&1;
    const row=mk(w*8,h),g=row.getContext('2d');g.filter='blur(0.5px)';
    cells.forEach((c,i)=>{g.save();g.beginPath();g.rect(i*w,0,w,h);g.clip();g.drawImage(c,x0,y0,w,h,i*w,0,w,h);g.restore()});
    o.shr.push({name:q.name,c:row,m:[w,h,+(AX-x0).toFixed(1),+(AY-y0).toFixed(1)]});return}
  if(q.t==='drop'){J.delete(q.j);return}
  if(q.t==='done'){J.delete(q.j);const rows=o.rows;
    const W=Math.max(...rows.map(r=>r.c.width)),H=rows.reduce((s,r)=>s+r.c.height+1,0);
    const cv=mk(W,H),g=cv.getContext('2d');let y=0;const meta={v:q.v,pxmm:q.pxmm,set:q.set,rows:{}};if(q.limb)meta.limb=q.limb;
    for(const r of rows){g.drawImage(r.c,0,y);(meta.rows[r.name]||(meta.rows[r.name]=[])).push([y,r.m[0],r.m[1],+r.m[2],+r.m[3]]);y+=r.c.height+1}
    let sv=null,sm=null;if(o.shr.length){const S2=o.shr;const W2=Math.max(...S2.map(r=>r.c.width)),H2=S2.reduce((s,r)=>s+r.c.height+2,0);sv=mk(W2+(W2&1),H2);const g2=sv.getContext('2d');
      sm={v:q.v,pxmm:q.shPxmm,set:q.set+'_sh',rows:{}};let y2=0;for(const r of S2){g2.drawImage(r.c,0,y2);(sm.rows[r.name]||(sm.rows[r.name]=[])).push([y2,...r.m]);y2+=r.c.height+2}}
    const enc=c=>c.convertToBlob({type:'image/webp',quality:0.8}).catch(()=>c.convertToBlob({type:'image/png'}));
    const shb=sv?await enc(sv):null,b=await enc(cv);
    self.postMessage({t:'done',j:q.j,b,meta,shb,sm,pix:q.keep?pix(cv):null,shpix:q.keep&&sv?pix(sv):null});return}
}catch(x){self.postMessage({t:'err',j:q.j,err:String(x&&x.message||x)})}};`;
function f112Worker(){const F=F112;if(F.w)return F.w;if(F.wOK===false)return null;
  try{if(F.noWk||typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined'||typeof createImageBitmap!=='function'||typeof Blob==='undefined'){F.wOK=false;return null}
    const u=URL.createObjectURL(new Blob([F112_WSRC],{type:'text/javascript'}));const w=new Worker(u);
    w.onmessage=e=>f112Msg(e.data);w.onerror=e=>{f112WFail('worker error '+(e&&e.message||''));try{e.preventDefault()}catch(x){}};F.w=w;return w}catch(e){f112WFail(String(e&&e.message||e));return null}}
function f112WFail(why){const F=F112;F.wOK=false;F.st.wfail++;F.st.wErr=String(why||'').slice(0,120);try{if(F.w)F.w.terminate()}catch(x){}F.w=null;
  if(F.probeOk){F.probeOk(false);F.probeOk=null}for(const J of F.jobs.values())J.no(new Error('f112worker'));F.jobs.clear()}
/* is the Worker path there? (one probe: OffscreenCanvas 2D + convertToBlob inside the Worker) */
function f112Probe(){const F=F112;if(F.wOK!==null)return Promise.resolve(F.wOK);if(F.probe)return F.probe;
  const w=f112Worker();if(!w)return Promise.resolve(false);F.probe=new Promise(ok=>{F.probeOk=ok});
  setTimeout(()=>{if(F.wOK===null)f112WFail('probe time-out')},5000);w.postMessage({t:'probe'});return F.probe}
function f112Msg(m){const F=F112;if(!m)return;if(m.t==='probe'){if(!m.ok){f112WFail('no OffscreenCanvas 2D in the worker');return}if(F.wOK===null)F.wOK=true;if(F.probeOk){F.probeOk(F.wOK);F.probeOk=null}return}
  const J=F.jobs.get(m.j);if(!J)return;F.jobs.delete(m.j);clearTimeout(J.tm);if(m.t==='err'){J.no(new Error('f112worker: '+m.err));return}J.ok(m)}
/* i18n:skip-end */

/* ---------------- D1 · the device render: three.js here, pixels in the Worker ---------------- */
const F112_MM=32.5/1.85,F112_BASEH=3.2/F112_MM,F112_YAW=[0,45,90,135,180,-135,-90,-45],F112_D2R=Math.PI/180;   /* tok93.js MM_PER_M, BASE_H, MINI_YAW, D2R */
function f112GL(shadow,w,h){const T=window.THREE93||window.THREE,F=F112,k=shadow?'RS':'RF';let R=F[k];
  if(!R){const o={antialias:true,alpha:true,preserveDrawingBuffer:true};
    /* an OffscreenCanvas renderer (Chrome, Safari 17+): transferToImageBitmap hands the frame over without waiting for the GPU here */
    if(F.oc!==false&&typeof OffscreenCanvas!=='undefined'){try{R=new T.WebGLRenderer(Object.assign({canvas:new OffscreenCanvas(Math.max(1,w),Math.max(1,h))},o));R.__oc=1}catch(e){R=null;F.oc=false}}
    if(!R)R=new T.WebGLRenderer(o);R.outputColorSpace=T.SRGBColorSpace;R.setClearColor(0x000000,0);R.setPixelRatio(1);
    if(shadow){R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
      F.PLANE=new T.Mesh(new T.PlaneGeometry(8,8),new T.ShadowMaterial({opacity:1,color:0x000000}));F.PLANE.rotation.x=-Math.PI/2;F.PLANE.position.y=-F112_BASEH;F.PLANE.receiveShadow=true}
    F[k]=R}
  if(R.domElement.width!==w||R.domElement.height!==h)R.setSize(w,h,false);return R}
/* the frame just drawn as an ImageBitmap (OffscreenCanvas: no copy and no GPU wait on this thread) */
function f112Bm(R){const c=R.domElement;if(R.__oc&&typeof c.transferToImageBitmap==='function'){try{return Promise.resolve(c.transferToImageBitmap())}catch(e){}}return createImageBitmap(c)}
/* one job in the Worker (its answer arrives as a promise) */
function f112Job(){const F=F112,j=++F.jid;let J;const p=new Promise((ok,no)=>{J={ok,no,p:null,tm:0}});J.p=p;J.arm=()=>{J.tm=setTimeout(()=>{if(F.jobs.delete(j))J.no(new Error('f112worker: time-out'))},F.jobMs)};F.jobs.set(j,J);p.catch(()=>{});return {j,J}}
function f112Post(m,tr){const w=F112.w;if(!w)throw new Error('f112worker');w.postMessage(m,tr||[])}
/* a main-thread clock: only the synchronous slices between awaits count */
function f112Clock(){const C={t:f112Now(),ms:0,max:0,cut(){const d=f112Now()-C.t;C.ms+=d;if(d>C.max)C.max=d;if(d>F112.st.slice)F112.st.slice=d},go(){C.t=f112Now()},async w(p){C.cut();try{return await p}finally{C.go()}}};return C}
const f112Tick=()=>new Promise(ok=>setTimeout(ok,0));
const f112Frame=()=>new Promise(ok=>{if(document.hidden||typeof requestAnimationFrame!=='function')setTimeout(ok,0);else requestAnimationFrame(()=>setTimeout(ok,0))});
/* the figure's 8 yaws of the current pose (tok93 sheetSteps, fit off) → the Worker cuts the frame */
async function f112Cells(api,C,j,ri,name,so,yy){const T=window.THREE93||window.THREE,D=api._dbg,scene=D.scene,turn=D.turn,B=D.B;
  const s=Object.assign({ss:2,el:30,pxmm:3.143,outlinePx:0.85},so);const ppm=s.pxmm*F112_MM*s.ss,S=Math.ceil(2.9*ppm/4)*4;
  const sun=scene.children.find(l=>l.isDirectionalLight&&!(l.userData&&l.userData.l106));
  const target=new T.Vector3(0,0.82,0),hw=S/2/ppm,hh=S/2/ppm,cam=new T.OrthographicCamera(-hw,hw,hh,-hh,0.01,50),d=10;
  cam.position.set(target.x,target.y+Math.sin(s.el*F112_D2R)*d,target.z+Math.cos(s.el*F112_D2R)*d);cam.lookAt(target);cam.updateMatrixWorld();cam.updateProjectionMatrix();
  const lightFor=()=>{if(!sun)return;const dir=new T.Vector3(-0.55,0.85,0.55).applyQuaternion(cam.quaternion);sun.position.copy(cam.position).add(dir.multiplyScalar(5));
    sun.target.position.copy(cam.position).add(new T.Vector3(0,0,-10).applyQuaternion(cam.quaternion));sun.target.updateMatrixWorld()};
  lightFor();B.setOutline(s.outlinePx*s.ss/ppm);let r=f112GL(false,S,S);
  const anc=new T.Vector3(0,-F112_BASEH,0).project(cam),AX=(anc.x*0.5+0.5)*S/s.ss,AY=(-anc.y*0.5+0.5)*S/s.ss;
  if(C.cmp&&C.cmp.f){C.cmp.f=0;try{if(r.compileAsync)await C.w(r.compileAsync(scene,cam))}catch(e){}}   /* shaders compiled off the frame (KHR_parallel_shader_compile where there is one) */
  const sent=[];
  for(let k=0;k<F112_YAW.length;k++){const yaw=F112_YAW[k];lightFor();B.setOutline(s.outlinePx*s.ss/ppm);r=f112GL(false,S,S);
    const hid=[];for(let i=2;i<turn.children.length;i++){const o=turn.children[i];if(o!==B.group&&o.visible){hid.push(o);o.visible=false}}   /* tok93 hideHandles: the pose editor's handles */
    try{turn.rotation.y=yaw*F112_D2R;turn.updateMatrixWorld(true);r.render(scene,cam)}finally{for(const o of hid)o.visible=true}
    turn.rotation.y=0;turn.updateMatrixWorld(true);
    sent.push(f112Bm(r).then(bm=>f112Post({t:'cell',j,ri,k,bm,S,ss:s.ss},[bm])));
    await C.w(yy())}   /* one yaw a task (the last one too: the shadow / the next pose start in a task of their own) */
  await C.w(Promise.all(sent));f112Post({t:'frame',j,ri,name,AX,AY})}
/* the ground shadow of the current pose (311 shadowRow), one yaw a task; the Worker boxes and cuts the row */
async function f112Shadow(api,C,j,ri,name,pxmm,ss,yy){const T=window.THREE93||window.THREE,D=api._dbg,sc=D.scene,turn=D.turn,B=D.B,MM=32.5/1.85,BASE_H=3.2/MM;
  if(!AN100L.light.key)throw new Error('shadowRow without light()');
  const ppm=pxmm*MM*ss,S=Math.ceil(4.8*ppm/4)*4;const R2=f112GL(true,S,S),PLANE=F112.PLANE;
  const tgt=new T.Vector3(0.7,0.3,0.3),hw=S/2/ppm,cam=new T.OrthographicCamera(-hw,hw,hw,-hw,0.01,50),d=10,el=30*Math.PI/180;
  cam.position.set(tgt.x,tgt.y+Math.sin(el)*d,tgt.z+Math.cos(el)*d);cam.lookAt(tgt);cam.updateMatrixWorld();cam.updateProjectionMatrix();
  const anc=new T.Vector3(0,-BASE_H,0).project(cam),AX=(anc.x*0.5+0.5)*S/ss,AY=(-anc.y*0.5+0.5)*S/ss;
  const on=()=>{const keep=[];turn.children.forEach(o=>{if(o!==B.group){keep.push([o,'v',o.visible]);o.visible=false}});
    const mats=new Map();B.group.traverse(o=>{if(o.isMesh){keep.push([o,'c',o.castShadow]);o.castShadow=true;
      for(const m of [].concat(o.material||[]))if(!mats.has(m)){mats.set(m,[m.colorWrite,m.depthWrite]);m.colorWrite=false;m.depthWrite=false}}});sc.add(PLANE);
    return ()=>{sc.remove(PLANE);turn.rotation.y=0;turn.updateMatrixWorld(true);for(const k of keep){if(k[1]==='v')k[0].visible=k[2];else k[0].castShadow=k[2]}for(const [m,v] of mats){m.colorWrite=v[0];m.depthWrite=v[1]}}};
  if(C.cmp&&C.cmp.s){C.cmp.s=0;const off=on();try{if(R2.compileAsync)await C.w(R2.compileAsync(sc,cam))}catch(e){}finally{off()}}
  const sent=[];
  for(let k=0;k<F112_YAW.length;k++){const yaw=F112_YAW[k];const off=on();
    try{turn.rotation.y=yaw*Math.PI/180;turn.updateMatrixWorld(true);R2.render(sc,cam);sent.push(f112Bm(R2).then(bm=>f112Post({t:'shc',j,ri,k,bm,S,ss},[bm])))}finally{off()}
    await C.w(yy())}   /* one yaw a task (the last one too: the shadow / the next pose start in a task of their own) */
  await C.w(Promise.all(sent));f112Post({t:'shrow',j,ri,name,AX,AY})}
/* f112Render — 311's AN100L.render with the pixel passes in the Worker → {b, meta, sh:{b,m}|null, pix?, shpix?} */
async function f112Render(api,set,o,C){const AL=AN100L,T3=window.THREE93||window.THREE;const B=api.B,rig=api.rig,G=B.group;
  if(!f112Worker())throw new Error('f112worker');
  const p0=G.position.clone(),q0=G.quaternion.clone(),s0=G.scale.x;const pxmm=o.pxmm||2.6;
  let W8=api._an100w;if(W8===undefined){W8=null;try{if(B.kit&&B.kit.rigid){W8=B.kit.rigid(new T3.SphereGeometry(0.045,12,8),B.kit.makeToon('#8c1410'),'sR',B.kit.P('eR'),null);W8.visible=false}}catch(e){W8=null}api._an100w=W8}
  api.setPose(api.specPose(AL.ROWS.idle[0]));let f=1;try{f=api.fitTile({shaft:false}).f||1}catch(e){}
  const SC=s0*Math.min(1,f);const LB=o.limb&&AL.LOST[o.limb];let CAP=null;
  if(LB){const ck='_an100c_'+o.limb;CAP=api[ck];if(CAP===undefined){CAP=null;try{if(B.kit&&B.kit.rigid){CAP=B.kit.rigid(new T3.SphereGeometry(LB.r,14,10),B.kit.makeToon('#8c1410'),LB.cap,B.kit.P(LB.b),null);CAP.visible=false}}catch(e){CAP=null}api[ck]=CAP}}
  const lim=on=>{if(LB&&rig.bones[LB.b]){const k=on?0.02:1;rig.bones[LB.b].scale.set(k,k,k)}if(CAP){CAP.visible=!!on;if(CAP.userData.ink)CAP.userData.ink.visible=!!on}};
  const setF=(spec)=>{G.quaternion.copy(q0);G.position.copy(p0);G.scale.setScalar(SC);if(rig.bones.eR)rig.bones.eR.scale.set(1,1,1);if(W8)W8.visible=false;lim(false);
    api.setPose(api.specPose(spec));lim(true);
    if(spec.sever){if(rig.bones.eR)rig.bones.eR.scale.set(0.02,0.02,0.02);if(W8)W8.visible=true}
    if(spec.rot){const q=new T3.Quaternion().setFromAxisAngle(new T3.Vector3(1,0,0),spec.rot*Math.PI/180);const piv=new T3.Vector3(...(spec.piv||[0,0,0])).multiplyScalar(SC);
      G.quaternion.copy(q);G.position.copy(p0).add(piv.clone().sub(piv.clone().applyQuaternion(q)));G.position.y+=(spec.lift||0)*SC;G.position.z+=(spec.dz||0)*SC}
    G.updateMatrixWorld(true)};
  const RS=LB?AL.SEVR(o.limb)[set]:null;const names=o.rows||(RS?Object.keys(RS):AL.SETS[set]),rowOf=n=>RS?RS[n]:AL.ROWS[n];
  const {j,J}=f112Job();const yy=o.yaw||f112Tick;let ri=0;C.cmp={f:1,s:1};
  const unlit=o.light?AL.light(api,o.light):null;
  try{for(const name of names){for(let i=0;i<rowOf(name).length;i++){setF(rowOf(name)[i]);
      await f112Cells(api,C,j,ri,name,Object.assign({pxmm,ss:o.ss||2,fit:false},o.outlinePx?{outlinePx:o.outlinePx}:{}),yy);
      if(o.shadow)await f112Shadow(api,C,j,ri,name,o.shadow.pxmm||pxmm/2,o.shadow.ss||2,yy);ri++;
      if(o.yield)await C.w(o.yield());if(o.abort&&o.abort())throw new Error('an100abort')}}}
  catch(e){try{F112.jobs.delete(j);clearTimeout(J.tm);f112Post({t:'drop',j})}catch(x){}
    if(e&&(e.message==='an100abort'||/^f112worker/.test(e.message||'')))throw e;throw new Error('f112worker: '+String(e&&e.message||e))}   /* anything else on this path: 311's own path from now on */
  finally{if(unlit)unlit();G.quaternion.copy(q0);G.position.copy(p0);G.scale.setScalar(s0);if(rig.bones.eR)rig.bones.eR.scale.set(1,1,1);if(W8)W8.visible=false;lim(false);G.updateMatrixWorld(true);
    try{api.setPose(api.specPose(AL.ROWS.idle[0]))}catch(e){}}
  f112Post({t:'done',j,v:AL.VER,pxmm,set,limb:LB?o.limb:'',shPxmm:o.shadow?(o.shadow.pxmm||pxmm/2):0,keep:!!o.keep});J.arm();
  let m;try{m=await C.w(J.p)}catch(e){throw /^f112worker/.test(e&&e.message||'')?e:new Error('f112worker: '+String(e&&e.message||e))}return {b:m.b,meta:m.meta,sh:m.shb?{b:m.shb,m:m.sm}:null,pix:m.pix,shpix:m.shpix}}

/* ---------------- the pump (311 an100Pump, its renders through f112Render; A4a parking) ---------------- */
/* A4a: WebKit without the Worker path bakes only inside the warm-up window */
function f112Blocked(){const F=F112;return F.webkit&&F.wOK===false&&!F.warmOn}
function f112Yield(){return F112.warmOn?f112Tick():(window.an111Yield||an100Idle)()}
function f112Park(it){F112.park.push(it);F112.st.parked++}
async function f112PumpImpl(){if(AN100.qBusy)return;AN100.qBusy=true;const F=F112;
  try{for(;;){const it=AN100.q.length?AN100.q.shift():AN100.qa.shift();if(!it)break;const s=it.s,set=it.set;
      const rec=await an100DBGet(s.key);
      if(rec&&rec.v===AN100L.VER&&rec[set]&&rec[set].b){an100Got(s,set,rec[set].b,rec[set].m,rec[set].sh);continue}
      if(!an100DevOK())continue;
      await f112Probe();
      if(f112Blocked()){f112Park(it);F.st.blocked++;continue}
      for(let w=0;w<240&&(typeof T93!=='undefined'&&(T93.busy||T93.conv));w++)await new Promise(r=>setTimeout(r,500));
      await f112Yield();if(typeof HEADLESS!=='undefined'&&HEADLESS){(set==='move'?AN100.q:AN100.qa).unshift(it);await new Promise(r=>setTimeout(r,1000));continue}
      if(f112Blocked()){f112Park(it);F.st.blocked++;continue}
      const useW=F.wOK===true;const C=f112Clock();
      try{const t0=an100Now();const api=await C.w(t93Load());if(typeof T93!=='undefined'&&T93.busy){(set==='move'?AN100.q:AN100.qa).unshift(it);continue}
        api.apply({look:s.parts.look,gear:s.parts.gear,pose:api.presets[0][2],grip:s.parts.grip||{}});
        const LT=AN100.noLight?null:an100Light();
        const abort=()=>(set==='act'&&AN100.q.length>0)||f112Blocked();
        const opt={pxmm:AN100_PX,ss:2,yield:f112Yield,abort,limb:s.limb||undefined,light:LT,shadow:LT?{pxmm:AN100_PX/2,ss:2}:null};
        let blob,meta,sh;
        if(useW){opt.yaw=()=>F.warmOn?f112Tick():f112Frame();const r=await f112Render(api,set,opt,C);blob=r.b;meta=r.meta;sh=r.sh}
        else{const r=await C.w(AN100L.render(api,set,opt));
          const shb=r.sh?await C.w(new Promise(ok=>r.sh.canvas.toBlob(b=>ok(b),'image/webp',0.8))):null;sh=shb?{b:shb,m:r.sh.meta}:null;
          blob=await C.w(new Promise(ok=>r.canvas.toBlob(b=>ok(b),'image/webp',0.8)))||await C.w(new Promise(ok=>r.canvas.toBlob(ok,'image/png')));meta=r.meta}
        C.cut();an100Got(s,set,blob,meta,sh);const ms=Math.round(an100Now()-t0);AN100.stats.renders++;AN100.stats.renderMs.push(ms);(AN100.stats.renderLog||(AN100.stats.renderLog=[])).push({key:s.key,set,limb:s.limb,ms});
        const T=F.st;T.sheets++;if(useW)T.wk++;else T.main++;T.bakeMs+=ms;
        /* the old path's main-thread time is not split into slices (tok93 / 311 run them): only the worker path's is counted */
        if(useW){T.mainMs+=C.ms;if(C.max>T.mainMax)T.mainMax=C.max}
        if(T.log.length<60)T.log.push({key:s.key.slice(0,14),set,limb:s.limb||'',ms,main:useW?Math.round(C.ms):null,max:useW?+C.max.toFixed(1):null,wk:useW,warm:F.warmOn});
        await an100DBMerge(s.key,set,{b:blob,m:meta,sh})}
      catch(e){if(e&&e.message==='an100abort'){if(f112Blocked())f112Park(it);else AN100.qa.unshift(it);AN100.stats.aborts=(AN100.stats.aborts||0)+1;continue}
        if(e&&/^f112worker/.test(e.message||'')){if(F.wOK!==false)f112WFail(e.message);(set==='move'?AN100.q:AN100.qa).unshift(it);continue}   /* the Worker failed: this sheet again on the main-thread path (or parked, A4a) */
        if(!AN100.noLight&&an100Light()){AN100.noLight=1;(set==='move'?AN100.q:AN100.qa).unshift(it);continue}
        AN100.devFail=String(e&&e.message||e);AN100.q.length=0;AN100.qa.length=0;break}}}
  finally{AN100.qBusy=false}}
if(F112.on){an100Pump=f112PumpImpl}

/* ---------------- which device sheet each figure waits for (the warm-up's list, the stills count) ---------------- */
if(F112.on&&typeof an100Dev==='function'){const base=an100Dev;an100Dev=function(parts,limb){const r=base.apply(this,arguments);
  try{if(parts){const k=an100DevKey(parts,limb);if(F112.asking)F112.asking.keys.add(k);if(AN100.cur)F112.lastKey.set(AN100.cur,k)}}catch(e){}return r}}
if(F112.on){const base=an100Got;an100Got=function(s,set){const r=base.apply(this,arguments);
  try{if(set==='move'&&s&&F112.stillT.has(s.key)){F112.st.stills.ms+=f112Now()-F112.stillT.get(s.key);F112.stillT.delete(s.key)}}catch(e){}return r}}
/* a figure drawn while its device sheet bakes: 400's still, or (a gear-true printed class) its class's prebuilt stand-in */
if(F112.on&&typeof an100DrawP==='function'){const base=an100DrawP;an100DrawP=function(){const p=AN100.cur;const t=base.apply(this,arguments);
  try{if(t!=null&&p){const k=F112.lastKey.get(p),s=k&&AN100.dev.get(k);if(s&&!s.ready&&!F112.stillT.has(k)){F112.stillT.set(k,f112Now());F112.st.stills.n++}}}catch(e){}return t}}
function f112StillFlush(){const now=f112Now();for(const [k,t] of F112.stillT)F112.st.stills.ms+=now-t;F112.stillT.clear()}

/* ---------------- D2 · warm-up before the match ---------------- */
function f112Phone(){try{return (typeof isPhone==='function'&&isPhone())||(typeof l106Phone==='function'&&l106Phone())}catch(e){return false}}
function f112NoWait(){try{if(typeof animOn==='function'&&!animOn())return true;if(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')return true;
    if(typeof reduceMotion==='function'&&reduceMotion())return true;if(S&&S.tutorial)return true;if(typeof MTUT!=='undefined'&&MTUT.on)return true}catch(e){}return false}
/* the MOVE sheets the warm-up's figures still wait for */
function f112Pending(w){if(!w||AN100.devFail)return [];const out=[];for(const k of w.keys){const s=AN100.dev.get(k);if(s&&!s.ready)out.push(k)}return out}
function f112WarmStart(){const F=F112;try{if(!F.on||HEADLESS||typeof S==='undefined'||!S||S.sim||!an100On()||!an100DevOK())return null}catch(e){return null}
  if(F.warm&&F.warm.G===S)return F.warm;
  f112StillFlush();const w={G:S,t0:f112Now(),keys:new Set(),end:0};F.warm=w;F.warmOn=true;F.st.warm.n++;
  if(F.webkit)f112Probe();
  for(const it of F.park.splice(0)){it.s.queued=1;(it.set==='move'?AN100.q:AN100.qa).push(it)}
  F.asking=w;try{an100Snap()}catch(e){}finally{F.asking=null}
  /* this match's figures first (a parked sheet of an earlier event after them) */
  const mine=it=>w.keys.has(it.s.key)?0:1;AN100.q.sort((a,b)=>mine(a)-mine(b));
  try{an100Pump()}catch(e){}
  return w}
function f112WarmEnd(w){const F=F112;if(!w||w.end)return;w.end=f112Now();if(F.warm===w)F.warmOn=false;f112Card(false);
  if(!f112Pending(w).length)F.st.warm.ready++}
function f112Card(on){const F=F112;try{if(!on){if(F.card){F.card.remove();F.card=null}return}
  if(F.card)return;const wrap=typeof cv!=='undefined'&&cv&&cv.parentElement;if(!wrap)return;const d=document.createElement('div');d.id='fig112';d.className='fig112';d.setAttribute('role','status');
  d.textContent=_T('Preparing the figures…');wrap.appendChild(d);F.card=d}catch(e){}}
/* after the briefing: wait for the MOVE sheets, at most capMs (capPhone on a phone) */
async function f112WarmWait(w){const F=F112;if(!w||w.end)return;
  if(!f112Pending(w).length||f112NoWait()||w.G!==S){if(f112Pending(w).length)F.st.warm.skipped++;f112WarmEnd(w);return}
  const cap=f112Phone()?F.capPhone:F.capMs,t0=f112Now();F.st.warm.waits++;f112Card(true);
  try{while(w.G===S&&!S.over&&f112Pending(w).length&&f112Now()-t0<cap)await new Promise(r=>setTimeout(r,60))}
  finally{const ms=f112Now()-t0;F.st.warm.waitMs+=ms;w.waitMs=ms;if(f112Pending(w).length&&ms>=cap-1)F.st.warm.capped++;f112WarmEnd(w)}}
if(F112.on&&typeof eventBriefing==='function'){const base=eventBriefing;eventBriefing=async function(opening){if(!opening)return base.apply(this,arguments);
  let w=null;try{w=f112WarmStart()}catch(e){}
  try{return await base.apply(this,arguments)}finally{if(w)try{await f112WarmWait(w)}catch(e){f112WarmEnd(w)}}}}
/* an online joiner: the bake starts with the host's snapshot; nothing waits (the match is the host's), the window closes after the cap */
if(F112.on&&typeof onlJoinMatch==='function'){const base=onlJoinMatch;onlJoinMatch=async function(){const r=await base.apply(this,arguments);
  try{const w=f112WarmStart();if(w){w.join=1;setTimeout(()=>f112WarmEnd(w),f112Phone()?F112.capPhone:F112.capMs)}}catch(e){}return r}}
/* the first turn always closes the window (a briefing path that never returned, a new event) */
if(F112.on&&typeof BUS!=='undefined')BUS.on('turn.begin',e=>{try{if(e&&!e.sim&&F112.warm&&!F112.warm.end&&F112.warm.G===S&&!F112.warm.join)f112WarmEnd(F112.warm)}catch(x){}});
if(F112.on&&typeof gameOver==='function'){const base=gameOver;gameOver=function(){try{f112StillFlush()}catch(e){}return base.apply(this,arguments)}}
if(F112.on){try{const st=document.createElement('style');st.textContent=`.fig112{position:absolute;left:50%;bottom:14%;transform:translateX(-50%);z-index:7;padding:6px 14px;border-radius:8px;
background:rgba(20,13,8,.82);color:#f1e3c4;font-weight:600;font-size:14px;line-height:1.3;letter-spacing:.02em;border:1px solid rgba(214,180,110,.55);pointer-events:none;white-space:nowrap}`;(document.head||document.documentElement).appendChild(st)}catch(e){}}

/* ---------------- D3 · the recorder's v112f block ---------------- */
function f112Snap(){const T=F112.st;return {sheets:T.sheets,wk:T.wk,main:T.main,bakeMs:T.bakeMs,mainMs:T.mainMs,stills:T.stills.n,stillMs:T.stills.ms+[...F112.stillT.values()].reduce((s,t)=>s+f112Now()-t,0),
  waits:T.warm.waits,waitMs:T.warm.waitMs,capped:T.warm.capped,parked:T.parked,blocked:T.blocked,logN:T.log.length}}
function f112Report(){const a=F112.rec0||{},b=f112Snap(),d=k=>+((b[k]||0)-(a[k]||0)).toFixed(1);
  return {on:F112.on,worker:F112.wOK,webkit:F112.webkit,wErr:F112.st.wErr||'',sheets:d('sheets'),workerSheets:d('wk'),mainSheets:d('main'),bakeMs:d('bakeMs'),mainBakeMs:d('mainMs'),
    mainSliceMax:+F112.st.mainMax.toFixed(1),perSheet:F112.st.log.slice(a.logN||0).map(x=>[x.set+(x.limb?':'+x.limb:''),x.ms,x.main,x.wk?'w':'m']),
    stills:d('stills'),stillSecs:+(d('stillMs')/1000).toFixed(1),warmWaits:d('waits'),warmWaitMs:d('waitMs'),warmCapped:d('capped'),parked:d('parked'),blocked:d('blocked'),
    queued:AN100.q.length+AN100.qa.length,park:F112.park.length}}
if(F112.on&&typeof rec107Start==='function'){const base=rec107Start;rec107Start=function(){F112.rec0=f112Snap();return base.apply(this,arguments)}}
if(F112.on&&typeof rec107Extra==='function'){const base=rec107Extra;rec107Extra=function(){const o=base.apply(this,arguments)||{};try{o.v112f=f112Report()}catch(e){o.v112f={err:String(e)}}return o}}

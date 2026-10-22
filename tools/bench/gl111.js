/* tools/bench/gl111.js — v1.11 WebGL board SPIKE benchmark (419-v111gl, tools/plans/v111/GL-SPIKE.md).
   The same all-CPU match (Democritus at Pompeii, seed 4242, 4 CPU seats: soldier hero royalty venatore, Normal speed, Lighting Full, stands
   on) is played for --secs seconds (default 15) after --warm seconds (3), once per config, each in a fresh page:
     2d     the 2D board as shipped                     gl     flavius_gl111=1 (planes + sprites)
     2d-sf  2d + flavius_v107safariforce=1 (WebKit path)   gl-sf  gl + safariforce        gl1  flavius_gl111lv=1 (planes only)
   Numbers: 405's recorder (rec107Start/Stop: fps, frame p50/p95, the draw area = drawLayers93 incl. the GL work, 2D drawImage per
   frame) + its gl111 block; FLUSH = 24 board draws each forced to raster at once (1-px read of #cv, then of the GL canvases): "2D canvas"
   = what the 2D canvas still costs to raster (the part Safari's CoreGraphics does), "GL" = SwiftShader drawing the quads. SHOTS = the
   same moment with GL off / on, composed in the page, compared pixel by pixel (PNGs in --out).
   Served over http (tools/perf95/serve.js: from file:// every picture is cross-origin and cannot be a texture).
   THIS BOX HAS NO GPU: WebGL runs on SwiftShader (software GL on the CPU — slower than the 2D CPU raster it replaces), the 2D canvas is
   CPU-rastered (accelerated 2D canvas off: on SwiftShader it runs at ~1 fps; --gpu turns that path on anyway). Absolute numbers and the
   GL cost mean nothing for a Mac — read the 2D-side ratios of ONE run (2D drawImage / frame, 2D raster ms). Safari is the truth: his ⏺
   recording with #perf=gl111.
     node tools/bench/gl111.js [page] [--secs 15] [--warm 3] [--only 2d,gl,gl1,2d-sf,gl-sf] [--dpr 1] [--gpu] [--out DIR] [--json FILE]
   --out: where the PNGs go (default: the OS temp dir; never the repo). */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]&&!A[0].startsWith('--')?A[0]:'flavius-arena.html');
const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};const flag=k=>A.includes('--'+k);
const SECS=+opt('secs',15),WARM=+opt('warm',3),DPR=+opt('dpr',1),OUT=opt('out',path.join(os.tmpdir(),'gl111bench')),JSONF=opt('json','');
const CFG={'2d':{},'gl':{flavius_gl111:'1'},'2d-sf':{flavius_v107safariforce:'1'},'gl-sf':{flavius_gl111:'1',flavius_v107safariforce:'1'},'gl1':{flavius_gl111:'1',flavius_gl111lv:'1'}};
const ONLY=String(opt('only','2d,gl,2d-sf,gl-sf')).split(',').filter(k=>CFG[k]);
const SWGL=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],CPU2D=[...SWGL,'--disable-accelerated-2d-canvas','--disable-gpu-rasterization'],GPU=['--use-gl=angle',...SWGL,'--enable-gpu-rasterization','--enable-accelerated-2d-canvas'];
const load=()=>+fs.readFileSync('/proc/loadavg','utf8').split(' ')[0];
const START=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
  while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:4242,seats:['soldier','hero','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{}});
  for(let i=0;i<200;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6)break}
  window.__gl111iv=setInterval(close,300);SPEED='normal';
  return {light:typeof l106Mode==='function'?l106Mode():null,cv:[cv.width,cv.height],dpr:devicePixelRatio,gl:typeof GL111!=='undefined'?{on:GL111.on,ctx:GL111.type,err:GL111.err}:null}};
/* FLUSH: 24 board draws one after another, each forced to raster now (a 1-px read of #cv, and of each GL canvas when on) — the
   raster work a board draw costs, on this box's CPU raster / SwiftShader (the part Safari does in its GPU process). ms per draw p50/p95. */
const FLUSH=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const g=cv.getContext('2d');const t=[],t2=[],tg=[];const px=new Uint8Array(4);
  for(let i=0;i<24;i++){await W8(30);try{if(typeof RZ99!=='undefined')RZ99.n=0}catch(e){}const t0=performance.now();draw();g.getImageData(0,0,1,1);const t1=performance.now();
    if(typeof GL111!=='undefined'&&GL111.on)for(const R of [GL111.P,GL111.Q])if(R)R.gl.readPixels(0,0,1,1,R.gl.RGBA,R.gl.UNSIGNED_BYTE,px);const t3=performance.now();t.push(t3-t0);t2.push(t1-t0);tg.push(t3-t1)}
  const q=(a,k)=>{a.sort((x,y)=>x-y);return +a[k].toFixed(1)};return {p50:q(t,12),p95:q(t,22),d2:q(t2,12),gl:q(tg,12)}};
const REC=async secs=>{REC107.secs=secs+5;rec107Start();await new Promise(r=>setTimeout(r,secs*1000));const res=rec107Stop();
  const f=res.frames,d=res.areas.draw||{calls:0,ms:0};
  return {fps:f.fps,p50:f.p50,p95:f.p95,max:f.max,over33:f.over33,frames:f.n,boardDraws:d.calls,jsPerFrame:+(d.ms/Math.max(1,f.n)).toFixed(2),jsPerDraw:+(d.ms/Math.max(1,d.calls)).toFixed(2),
    drawnPerFrame:res.page?res.page.drawnPerFrame:null,gl111:res.gl111||null,long:res.longTasks.length}};
/* the same moment with GL off and on: the board's canvases composed in the page in ONE task (no game step, no popup in between) */
const SHOTS=async(pg,dir,tag)=>{const r=await pg.evaluate(()=>{clearInterval(window.__gl111iv);try{localStorage.setItem('flavius_gl111keep','1')}catch(e){}
    const now=()=>{try{if(typeof RZ99!=='undefined')RZ99.n=0}catch(e){}draw()};
    const comp=ids=>{const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const g=c.getContext('2d',{willReadFrequently:true});
      for(const id of ids){const e=document.getElementById(id);if(e&&!e.hidden)g.drawImage(e,0,0)}return c};
    GL111.set(false);now();const a=comp(['cv']);GL111.set(true);now();const b=comp(['gl111p','cv','gl111s']);
    const A=a.getContext('2d').getImageData(0,0,a.width,a.height).data,B=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let sum=0,big=0;
    for(let i=0;i<A.length;i+=4){const d=(Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2]))/3;sum+=d;if(d>40)big++}
    const n=a.width*a.height;return {w:a.width,h:a.height,meanAbs:+(sum/n).toFixed(2),over40pct:+(big*100/n).toFixed(2),a:a.toDataURL('image/png'),b:b.toDataURL('image/png')}});
  for(const [k,u] of [['2d',r.a],['gl',r.b]])fs.writeFileSync(path.join(dir,tag+'-'+k+'.png'),Buffer.from(u.split(',')[1],'base64'));delete r.a;delete r.b;return r};
(async()=>{fs.mkdirSync(OUT,{recursive:true});const url=await require(path.join(__dirname,'..','perf95','serve.js'))(PAGE);const b=await chromium.launch({args:flag('gpu')?GPU:CPU2D});const rows=[];
  console.log(`gl111 bench · ${PAGE} · ${SECS}s after ${WARM}s · dpr ${DPR} · ${flag('gpu')?'--gpu (SwiftShader GL + accelerated 2D on SwiftShader)':'SwiftShader GL, CPU 2D raster'} · load ${load()}`);
  for(const name of ONLY){const ctxB=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:DPR,acceptDownloads:false});const pg=await ctxB.newPage();const errs=[];
    pg.on('pageerror',e=>errs.push(String(e).slice(0,200)));await pg.route(/fonts\./,r=>r.abort());
    await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_light106auto','0');
      for(const k in ls)localStorage.setItem(k,ls[k])},CFG[name]);
    await pg.goto(url,{timeout:180000,waitUntil:'domcontentloaded'});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
    const st=await pg.evaluate(START);await pg.waitForTimeout(WARM*1000);const l0=load();
    const r=await pg.evaluate(REC,SECS);r.flush=await pg.evaluate(FLUSH);const gl=await pg.evaluate(()=>typeof GL111!=='undefined'?{on:GL111.on,ctx:GL111.type,err:GL111.err,lit:GL111.lit,fall:GL111.st.fall}:null);
    let diff=null;if(/^gl/.test(name)&&gl&&gl.on)try{diff=await SHOTS(pg,OUT,name)}catch(e){diff={err:String(e).slice(0,120)}}
    else await pg.locator('.canvas-wrap').screenshot({path:path.join(OUT,name+'.png')}).catch(()=>{});
    const row={name,...r,start:st,glState:gl,diff,errs,load:[l0,load()]};rows.push(row);
    const g=r.gl111;console.log(`${name.padEnd(6)} fps ${String(r.fps).padStart(5)} · p50 ${r.p50} p95 ${r.p95} max ${r.max} · board draws ${r.boardDraws} · js/frame ${r.jsPerFrame} ms · js/draw ${r.jsPerDraw} ms · flush/draw p50 ${r.flush.p50} p95 ${r.flush.p95} ms (2D canvas ${r.flush.d2} + GL ${r.flush.gl}) · 2D drawImage/frame ${r.drawnPerFrame}`+
      (g&&g.on?` · GL ${g.ctx}: ${g.drawsPerFrame} draws/board draw, ${g.planesPerFrame} planes + ${g.spritesPerFrame} sprites, uploads ${g.texUploadsPerS}/s (${g.texMBPerS} MB/s), gl ms/draw ${g.msPerFrame}, skips ${g.planeSkips}, tex ${g.texMB} MB`:(g&&g.err?' · GL err '+g.err:''))+
      (diff?(diff.err?' · shot err '+diff.err:` · shot diff 2d↔gl mean ${diff.meanAbs}, >40: ${diff.over40pct}%`):'')+(errs.length?' · ERRS '+errs.length:''));
    await ctxB.close()}
  await b.close();if(JSONF)fs.writeFileSync(JSONF,JSON.stringify(rows,null,1));console.log('shots:',OUT)})();

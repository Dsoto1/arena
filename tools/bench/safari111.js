/* tools/bench/safari111.js — v1.11 "Safari 2D fixes" benchmark (420-v111safari). The same all-CPU match as tools/bench/gl111.js
   (Democritus at Pompeii, seed 4242, 4 CPU seats soldier hero royalty venatore, Normal speed, Lighting Full, stands on, spectators
   'auto' like Play Now's default — --spect 0 = gl111's empty stands) on the WebKit
   path (flavius_v107safariforce=1: 406's 1.5× cap, W3 bitmaps, W5 …) at his Mac's window (1800×1040 @2 → board at 1.5×). The device
   figure renders (311 GEAR-TRUE / Studio sheets) are allowed in headless (flavius_anim100dev=1) so the mid-match baking shows as on Safari.
   Configs (each a fresh page, fresh IndexedDB):
     old   flavius_v111soff=1 (the v1.10 path)      new   420 on
   Numbers per --secs window (after --warm): 405's recorder (fps, p50/p95, areas, counts: getImageData n / ms, newCanvas, canvasResize,
   createImageBitmap), drawImage / path / rect calls per board draw on #cv (counted over 24 forced draws), FLUSH = those draws forced to
   raster (1-px read of #cv) p50 ms, and the 420 v111 block. SHOTS (new only): the same moment drawn with 420 on / off (V111.live) and
   compared pixel by pixel (mean |Δ| over RGB, % pixels with Δ > 40), --shots N moments (odd ones in the split mode: R1 + R2).
   --bake: one gear-true figure (hero in another kit) queued for an on-device sheet render at the start (311 an100Dev), with no
   requestIdleCallback (Safari has none) — the mid-match bake his recordings show (sheetSteps / alphaBox / shadowRow).
   THIS BOX HAS NO GPU: absolute fps mean nothing for a Mac; read the counts and the ratios inside one run. Safari is the truth (his ⏺).
   v1.11c (423-v111csafari): --zoom 1.4 = the match zoomed in (S.zoomIn, FREE_ZOOM; another value = CAM.z) with the Amphitheatre on (default);
   configs b = flavius_v111csoff=1 (v1.11b) and c = 423 on (--only b,c). Each window also prints main-thread sharpen ms (405's 'sharpen' area),
   getImageData by caller, and the v111c block (zoomed hit % still / moving, jugs, sharpen jobs, aim masks). SHOTS zoomed (c): the same moment
   cached vs live with the camera MOVING (board-frame picture) and HOLDING (screen picture), clock frozen.
     node tools/bench/safari111.js [page] [--secs 10] [--warm 4] [--only old,new|b,c] [--zoom 1.4] [--spect auto|N] [--bake] [--shots 3] [--out DIR] [--json FILE]  */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]&&!A[0].startsWith('--')?A[0]:'flavius-arena.html');
const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};
const BAKE=A.includes('--bake');const SPECT=(v=>v==='auto'?v:+v)(opt('spect','auto')),SECS=+opt('secs',10),WARM=+opt('warm',4),NSHOT=+opt('shots',3),OUT=opt('out',path.join(os.tmpdir(),'safari111')),JSONF=opt('json','');
const BASE={flavius_v107safariforce:'1',flavius_anim100dev:'1'};
const CFG={old:{...BASE,flavius_v111soff:'1'},new:{...BASE},b:{...BASE,flavius_v111csoff:'1'},c:{...BASE}};const ZOOM=+opt('zoom',1);
const ONLY=String(opt('only','old,new')).split(',').filter(k=>CFG[k]);
const ARGS=['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-accelerated-2d-canvas','--disable-gpu-rasterization'];
const load=()=>+fs.readFileSync('/proc/loadavg','utf8').split(' ')[0];
const START=async ([SP,BK,ZM])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
  while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:4242,seats:['soldier','hero','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:SP}});
  for(let i=0;i<200;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6)break}
  window.__s111iv=setInterval(close,300);SPEED='normal';
  if(ZM>1){if(Math.abs(ZM-FREE_ZOOM)<1e-6)S.zoomIn=true;else CAM.z=ZM;draw()}
  if(BK){try{const parts={look:Object.assign({},AN100_LOOK.hero),gear:an100GearOf([['cassis','head'],['ornate','chest'],['wraps','larm']],'gladius','')};an100Dev(parts);window.__bk=parts}catch(e){window.__bkErr=String(e)}}
  return {light:typeof l106Mode==='function'?l106Mode():null,cv:[cv.width,cv.height],dpr:devicePixelRatio,v111:typeof V111!=='undefined'?V111.on:null,v111c:typeof V111C!=='undefined'?V111C.on:null,zoom:typeof AR91!=='undefined'?AR91.z:null}};
const REC=async secs=>{REC107.secs=secs+5;rec107Start();await new Promise(r=>setTimeout(r,secs*1000));const res=rec107Stop();
  const f=res.frames,d=res.areas.draw||{calls:0,ms:0},c=res.counts||{},n=k=>c[k]?c[k].n:0,ms=k=>c[k]?Math.round(c[k].ms):0;
  const cib=Object.keys(c).filter(k=>/^createImageBitmap/.test(k)).reduce((o,k)=>(o[k.replace('createImageBitmap','')]=[c[k].n,Math.round(c[k].ms)],o),{});
  return {fps:f.fps,p50:f.p50,p95:f.p95,max:f.max,over50:f.over50,frames:f.n,boardDraws:d.calls,drawMs:d.calls?+(d.ms/d.calls).toFixed(1):0,
    areas:Object.fromEntries(Object.entries(res.areas).map(([k,v])=>[k,[v.calls,v.ms,v.max]])),
    gid:[n('getImageData'),ms('getImageData')],gidBy:c.getImageData?c.getImageData.by:{},newCanvas:n('newCanvas'),resize:n('canvasResize'),resizeBy:c.canvasResize?c.canvasResize.by:{},cib,
    drawnPerDraw:res.page?res.page.drawnPerFrame/Math.max(0.01,res.page.drawsPerFrame):null,kinds:res.page?res.page.drawnKinds:null,an:res.an100||null,v111:res.v111||null,v111c:res.v111c||null,turns:res.event&&res.event.turns,
    sharpenMs:res.areas.sharpen?res.areas.sharpen.ms:0,zoom:res.zoom}};
/* calls on the board's context per board draw (24 draws, each forced to raster) */
const CALLS=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const P=CanvasRenderingContext2D.prototype,K=['drawImage','fillRect','strokeRect','fill','stroke','fillText','strokeText','clip','putImageData'],o={},keep={};let on=false;
  /* only the calls that reach the board: 420's recorded (redirected) calls are not counted, its blits / replays (RG111.ORIG) are */
  const R=typeof RG111!=='undefined'&&RG111.ORIG?RG111:null,keepO={};
  for(const k of K){const f=P[k];keep[k]=f;o[k]=0;P[k]=function(){if(on&&this===ctx&&!(R&&R.on))o[k]++;return f.apply(this,arguments)}}
  if(R)for(const k of K){const f=R.ORIG[k];keepO[k]=f;R.ORIG[k]=function(){if(on&&this===ctx)o[k]++;return f.apply(this,arguments)}}
  const t=[];const pd=window.p95Defer,zf=typeof Z100!=='undefined'?Z100.force:null;window.p95Defer=()=>false;if(zf!==null)Z100.force=true;   /* v1.11c: zoomed, 260 / 294 fold a second draw in one frame — every counted draw must draw */
  try{for(let i=0;i<24;i++){await W8(40);on=true;const t0=performance.now();draw();on=false;ctx.getImageData(0,0,1,1);t.push(performance.now()-t0)}}
  finally{for(const k of K)P[k]=keep[k];if(R)for(const k of K)R.ORIG[k]=keepO[k];window.p95Defer=pd;if(zf!==null)Z100.force=zf}
  t.sort((a,b)=>a-b);for(const k of K)o[k]=+(o[k]/24).toFixed(1);o.paths=+(o.fill+o.stroke+o.fillRect+o.strokeRect).toFixed(1);o.flushP50=+t[12].toFixed(1);o.flushP95=+t[22].toFixed(1);return o};
/* the same moment drawn with 420 live and not, composed in ONE task */
const SHOT=async split=>{clearInterval(window.__s111iv);const M=S1_111.M,u0=M.until;M.until=split?V111.frame+1e6:0;S1_111.D.until=0;const h0=JSON.stringify([V111.st.M.hit,V111.st.R1.hit,V111.st.R2.hit,V111.st.D.hit,V111.st.pot.hit]);let h1='';const now=()=>{draw()};const grab=()=>{const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(cv,0,0);return c};
  const T0=performance.now;let tt=T0.call(performance);performance.now=()=>tt;   /* frozen clock: flames / crowd / glides drawn at the same instant */
  let a,b;try{V111.live=false;now();a=grab();V111.live=true;now();now();b=grab();h1=JSON.stringify([V111.st.M.hit,V111.st.R1.hit,V111.st.R2.hit,V111.st.D.hit,V111.st.pot.hit])}finally{M.until=u0;performance.now=T0;V111.live=true;window.__s111iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},300)}
  const D1=a.getContext('2d').getImageData(0,0,a.width,a.height).data,D2=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let sum=0,big=0;
  for(let i=0;i<D1.length;i+=4){const d=(Math.abs(D1[i]-D2[i])+Math.abs(D1[i+1]-D2[i+1])+Math.abs(D1[i+2]-D2[i+2]))/3;sum+=d;if(d>40)big++}
  const n=a.width*a.height;return {mode:split?'split':'M',hits:h0+'→'+h1,meanAbs:+(sum/n).toFixed(3),over40pct:+(big*100/n).toFixed(3),a:a.toDataURL('image/png'),b:b.toDataURL('image/png')}};
/* v1.11c zoomed: the same moment cached vs live, camera MOVING (one ease step: the board-frame picture) then HOLDING (the screen picture) */
const SHOTZ=async moving=>{clearInterval(window.__s111iv);const T0=performance.now;let tt=T0.call(performance);performance.now=()=>tt;const pd=window.p95Defer,zf=Z100.force;window.p95Defer=()=>false;Z100.force=true;
  for(const k in S1Z_111C)S1Z_111C[k].until=0;const grab=()=>{const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;c.getContext('2d',{willReadFrequently:true}).drawImage(cv,0,0);return c};
  const st=()=>JSON.stringify([V111C.st.movHit,V111C.st.exactHit]);let a,b,h0,h1;
  try{const p=cur();if(moving){CAM.fr=p.r+1;CAM.fc=p.c-0.7;draw()}else{CAM.fr=p.r;CAM.fc=p.c;draw();draw()}   /* moving: one ease step first (the board-frame picture is made), the next is a slide */
    const s1={fr:CAM.fr,fc:CAM.fc};h0=st();draw();h1=st();b=grab();CAM.fr=s1.fr;CAM.fc=s1.fc;V111.live=false;draw();a=grab()}
  finally{V111.live=true;performance.now=T0;window.p95Defer=pd;Z100.force=zf;window.__s111iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},300)}
  const D1=a.getContext('2d').getImageData(0,0,a.width,a.height).data,D2=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let sum=0,mx=0,n8=0;
  for(let i=0;i<D1.length;i+=4){const d=Math.max(Math.abs(D1[i]-D2[i]),Math.abs(D1[i+1]-D2[i+1]),Math.abs(D1[i+2]-D2[i+2]),Math.abs(D1[i+3]-D2[i+3]));sum+=d;if(d>mx)mx=d;if(d>8)n8++}
  const n=a.width*a.height;return {mode:moving?'zoom-moving':'zoom-still',hits:'[moving,still] '+h0+'→'+h1,meanAbs:+(sum/n).toFixed(3),max:mx,over8px:n8,a:a.toDataURL('image/png'),b:b.toDataURL('image/png')}};
(async()=>{fs.mkdirSync(OUT,{recursive:true});const url=await require(path.join(__dirname,'..','perf95','serve.js'))(PAGE);const b=await chromium.launch({args:ARGS});const rows=[];
  console.log(`safari111 bench · ${PAGE} · ${SECS}s after ${WARM}s · 1800×1040 @2 (WebKit path → 1.5×) · load ${load()}`);
  for(const name of ONLY){const cx=await b.newContext({viewport:{width:1800,height:1040},deviceScaleFactor:2,acceptDownloads:false});const pg=await cx.newPage();const errs=[];
    pg.on('pageerror',e=>errs.push(String(e).slice(0,200)));await pg.route(/fonts\./,r=>r.abort());
    await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_light106auto','0');
      for(const k in ls)if(k!=='noric')localStorage.setItem(k,ls[k]);if(ls.noric)try{delete window.requestIdleCallback;window.requestIdleCallback=undefined}catch(e){}},BAKE?{...CFG[name],noric:1}:CFG[name]);
    await pg.goto(url,{timeout:180000,waitUntil:'domcontentloaded'});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
    const st=await pg.evaluate(START,[SPECT,BAKE,ZOOM]);await pg.waitForTimeout(WARM*1000);const l0=load();
    const r=await pg.evaluate(REC,SECS);r.calls=await pg.evaluate(CALLS);const r2=await pg.evaluate(REC,SECS);
    const shots=[];const zc=ZOOM>1&&name==='c';if(name==='new'||zc)for(let i=0;i<NSHOT;i++){if(i)await pg.waitForTimeout(2500);try{const s=zc?await pg.evaluate(SHOTZ,i%2===0):await pg.evaluate(SHOT,i%2===1);
        for(const [k,u] of [['off',s.a],['on',s.b]])fs.writeFileSync(path.join(OUT,`shot${i}-${k}.png`),Buffer.from(u.split(',')[1],'base64'));delete s.a;delete s.b;shots.push(s)}catch(e){shots.push({err:String(e).slice(0,160)})}}
    const bake=BAKE?await pg.evaluate(()=>({err:window.__bkErr||null,renders:AN100.stats.renders,renderMs:AN100.stats.renderMs,log:(AN100.stats.renderLog||[]).map(x=>x.set+':'+x.ms),q:AN100.q.length,qa:AN100.qa.length,fail:AN100.devFail||null,v111:typeof V111!=='undefined'?V111.st.bake:null})):null;
    const row={name,start:st,w1:r,w2:r2,shots,bake,errs,load:[l0,load()]};if(bake)console.log(name+' bake '+JSON.stringify(bake));rows.push(row);
    for(const [w,x] of [['w1',r],['w2',r2]]){const c=x.v111c;console.log(`${name.padEnd(4)} ${w} sharpen(main) ${x.sharpenMs} ms · getImageData by ${JSON.stringify(x.gidBy)}`+(c?` · v111c zoomed draws ${c.zoomedDraws} hit% ${JSON.stringify(c.board.hitPct)} still ${c.stillHits}/${c.stillBuilds} moving ${c.movingHits} builds ${c.builds} (${c.buildMs} ms) strips ${JSON.stringify(c.strips)} vol ${JSON.stringify(c.vol)} pots ${c.pots.hitPct}% · sharpen ${JSON.stringify(c.sharpen)} · aim ${JSON.stringify(c.aim)} · BF ${c.bfMpx} Mpx`:''))}
    for(const [w,x] of [['w1',r],['w2',r2]])console.log(`${name.padEnd(4)} ${w} fps ${x.fps} p50 ${x.p50} p95 ${x.p95} max ${x.max} · board draws ${x.boardDraws} draw ${x.drawMs} ms · getImageData ${x.gid[0]}/${x.gid[1]} ms · newCanvas ${x.newCanvas} · resize ${x.resize} · cIB ${JSON.stringify(x.cib)} · drawImage/draw ${x.drawnPerDraw&&x.drawnPerDraw.toFixed(0)} · areas cells ${JSON.stringify(x.areas.cells||'')} clean ${JSON.stringify(x.areas.clean||'')} · turns ${x.turns}`);
    console.log(`${name.padEnd(4)} calls/draw ${JSON.stringify(r.calls)}`+(shots.length?` · shots ${JSON.stringify(shots)}`:'')+(errs.length?' · ERRS '+JSON.stringify(errs):''));
    await cx.close()}
  await b.close();if(JSONF)fs.writeFileSync(JSONF,JSON.stringify(rows,null,1));console.log('shots:',OUT)})();

/* v1.07 FRAME RATE (401-v107perf; tools/plans/v107/PERF.md). Checks:
   (1) P1 a live 8-seat CPU match over http: 311's sheet rows are decoded from the sheet's BYTES (createImageBitmap(Blob, …)) — never from an
       <img> (Chrome decodes an <img> source on the main thread: 100–150 ms a call); the rows arrive and the figures draw (P107.st.bm ≥ 2, no
       fallback), the shadows follow (399's pass runs);
   (2) P2 the board LOOKS THE SAME with 401 on and off (tools/bench/board.js's forged frame, clock frozen, Math.random seeded; highlighted tiles
       up, so the lift clip is used): at zoom 1, 1.4 and 2 the canvases differ by at most a few levels on a few pixels (the static light layer is
       drawn on whole device pixels in pieces: P107.st.static / pieces grow);
   (3) P3 zoomed to 2 the new up-scaled cells are made with willReadFrequently (P107.st.wrf grows) and 346 still sharpens them;
   (4) P4 the #fx95 overlay: a blank overlay is not cleared again (P107.st.fxSkip grows), a floating number still shows on it and is wiped
       after it ends; (5) kill switch flavius_v107perfoff=1 → P107.off, 311's own <img> path, no skipped clear.
   node tools/tests/tv107p.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const {SCENE,SET,FREEZE,THAW}=require(path.join(__dirname,'..','bench','board.js'));
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,400))};
const open=async(ls,view)=>{const c=await b.newContext(view||{viewport:{width:1440,height:900}});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in o)localStorage.setItem(k,o[k]);
    /* which sources createImageBitmap is given */
    window.CIB107={img:0,blob:0,other:0};const cib=window.createImageBitmap;window.createImageBitmap=function(s){if(typeof HTMLImageElement!=='undefined'&&s instanceof HTMLImageElement)CIB107.img++;else if(s instanceof Blob)CIB107.blob++;else CIB107.other++;return cib.apply(this,arguments)}},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}try{menuHide()}catch(e){}});return pg};
const LS={flavius_light106:'full',flavius_light106auto:'0'};
/* a live CPU match: 8 seats, Normal speed, zoomed in; ~8 s of play */
const live=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
  SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:4242,seats:['soldier','hero','royalty','venatore','amazonia','veteranus','slave','damnatio'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
  for(let i=0;i<200;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6)break}
  SPEED='normal';S.zoomIn=true;const iv=setInterval(close,300);const t0=performance.now();while(performance.now()-t0<8000)await W8(250);clearInterval(iv);SPEED='pause';
  let rows=0;for(const s of AN100.src.values())for(const set of ['move','act'])for(const k in (s[set]&&s[set].bm)||{})if(s[set].bm[k]&&s[set].bm[k].bm)rows++;
  return {st:{...P107.st},cib:{...CIB107},rows,off:P107.off,l106:L106.st.n,turns:S.turnNo}});

/* ---- 1 · rows from the bytes ---- */
let pg=await open(LS);const L1=await live(pg);
ok(!L1.off&&L1.st.bm>=2&&L1.rows>=2&&L1.st.fallback===0&&L1.cib.img===0&&L1.cib.blob>=2,'1 rows decoded from the sheet bytes, never an <img> '+JSON.stringify(L1));
ok(L1.l106>0,'1 the light pass ran '+L1.l106);
await pg.context().close();

/* ---- 2 + 3 · the same look, on and off; zoom 2 makes read-back cells in memory ---- */
pg=await open({...LS,flavius_x2off:'1'});await pg.evaluate(SCENE);   /* v1.08b: the 1× sheets (phones, the download) — 410's 2× cells are not up-scaled at zoom 2, so 3 needs the 1× path */
const PAIR=()=>{const read=()=>cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
  P107.off=false;BENCH.tick();draw();draw();const on=read();P107.off=true;BENCH.tick();draw();draw();const off=read();P107.off=false;draw();
  let mx=0,n8=0;for(let i=0;i<on.length;i+=4)for(let k=0;k<3;k++){const d=Math.abs(on[i+k]-off[i+k]);if(d>mx)mx=d;if(d>8){n8++;break}}
  return {max:mx,over8:+(100*n8/(on.length/4)).toFixed(3),hl:HL.size}};
const res2={};
for(const [zn,m] of [['z1',{}],['z14',{zoom:1}],['z2',{zoom:1,pz:2}]]){const w0=await pg.evaluate(()=>({wrf:P107.st.wrf,sharp:V103C.st.sharp}));await pg.evaluate(SET,m);
  await pg.evaluate(FREEZE);const r=await pg.evaluate(PAIR);await pg.evaluate(THAW);const w1=await pg.evaluate(()=>({wrf:P107.st.wrf,sharp:V103C.st.sharp,static:P107.st.static,pieces:P107.st.pieces}));res2[zn]={...r,w0,w1}}
for(const zn in res2){const r=res2[zn];ok(r.hl>=9&&r.over8<=0.5&&r.max<=64,`2 ${zn}: 401 on vs off — at most a few levels on a few pixels `+JSON.stringify(r))}
ok(res2.z2.w1.static>0&&res2.z2.w1.pieces>0,'2 the static light layer drawn in pieces '+JSON.stringify(res2.z2.w1));
ok(res2.z2.w1.wrf>res2.z2.w0.wrf&&res2.z2.w1.sharp>res2.z2.w0.sharp,'3 zoom 2: new up-scaled cells made with willReadFrequently and sharpened '+JSON.stringify([res2.z2.w0,res2.z2.w1]));

/* ---- 4 · the overlay ---- */
const r4=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const c=fx95Cv(),g=B95.fxCx;const a=()=>{const d=g.getImageData(0,0,c.width,c.height).data;let s=0;for(let i=3;i<d.length;i+=4)s+=d[i];return s};
  FX.length=0;for(let i=0;i<4;i++)draw();const s0=P107.st.fxSkip|0;for(let i=0;i<5;i++)draw();const s1=P107.st.fxSkip|0;const blank=a();
  FX.push({r:6,c:6,text:'−3',color:'#ff6b5a',t0:performance.now(),dur:700});draw();await W8(60);draw();const shown=a();
  await W8(800);draw();draw();const after=a();return {skips:s1-s0,blank,shown,after}});
ok(r4.skips>=4&&r4.blank===0&&r4.shown>0&&r4.after===0,'4 the blank overlay is not cleared again; a number still shows and is wiped '+JSON.stringify(r4));
await pg.context().close();

/* ---- 5 · kill switch ---- */
pg=await open({...LS,flavius_v107perfoff:'1'});const L5=await live(pg);
ok(L5.off&&L5.st.bm===0&&L5.cib.img>=1&&!(L5.st.fxSkip>0),'5 kill switch: 311 own path, nothing of 401 '+JSON.stringify(L5));
await pg.context().close();

await b.close();srv.close();console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});

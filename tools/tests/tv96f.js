/* v0.96 FAST THAT FLOWS (235-v96fast): 1 tiles-layer cache ON == OFF pixels (only anti-aliased board-edge pixels may differ by a
   rounding step), cache hit on a still board; 2 a Fast move yields a frame per step (several draws, no stretch > 100 ms without
   yielding, done quickly), Normal unchanged; 3 a Fast all-CPU stretch: no step chain over 100 ms; 4 a seeded all-CPU event at Fast
   rolls the same dice and writes the same log with the module on and off. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto(await require(path.join(__dirname,'..','perf95','serve.js'))(page)); /* http: a file:// canvas cannot be read back */await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
/* start — an all-CPU Democritus (seeded when asked); waits until the setup windows are gone */
const start=(seed)=>pg.evaluate(async seed=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='pause';const cfg={ev:'democritus',loc:6,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}};if(seed!=null)cfg.seed=seed;
  startEvent(cfg);
  for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}
  return !!S},seed);
ok(await start(null),'0 started');
/* load calibration: a step = its logic + at most one board draw, so on a loaded machine the 100 ms limit grows with a draw's cost */
const DRAW=await pg.evaluate(async()=>{SPEED='pause';await new Promise(r=>setTimeout(r,300));const t=performance.now();for(let i=0;i<6;i++){draw();ctx.getImageData(0,0,1,1)}return (performance.now()-t)/6});
const LIM=Math.max(100,Math.round(DRAW*5));

/* ---- 1 tiles cache ON == OFF ---- */
const p1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SPEED='pause';await W8(400);
  /* only the rim and the tiles: the other layers carry clocks (torches, crowd, fx) */
  const others=LAYERS93.defs.map(d=>d[0]).filter(n=>n!=='rim'&&n!=='tiles');others.forEach(n=>LAYERS93.dbg.add(n));
  const grab=()=>{draw();return ctx.getImageData(0,0,cv.width,cv.height).data};
  TILES96.on=false;const off=grab(),off2=grab();TILES96.on=true;grab();grab();const h0=TILES96.hits;const on=grab();const hit=TILES96.hits>h0;
  others.forEach(n=>LAYERS93.dbg.delete(n));draw();
  let n=0,max=0,inner=0,noise=0;const W=cv.width;const a=iso(0,0);
  for(let i=0;i<off.length;i++){if(off[i]!==off2[i])noise++;const d=Math.abs(off[i]-on[i]);if(d){n++;if(d>max)max=d;const px=i>>2,x=px%W,y=(px/W)|0;
      /* inside the board diamond, a tile in from its edge */const rr=((y-a.y)/TH-(x-a.x)/TW),cc=((y-a.y)/TH+(x-a.x)/TW);if(rr>1&&rr<N-1&&cc>1&&cc<N-1)inner++}}
  return {n,max,inner,noise,total:off.length,hit,builds:TILES96.builds}});
ok(p1.hit,'1a a still board reuses the cached tiles '+JSON.stringify(p1));
ok(p1.max<=2,'1b ON vs OFF: at most 2 levels apart (8-bit rounding on anti-aliased seams and the board edge) '+JSON.stringify(p1));
ok(p1.noise===0&&p1.n<p1.total*0.005,'1c only a few pixels differ (under 0.5%), and a plain redraw is stable '+JSON.stringify(p1));

/* ---- 5 seams hold still while zooming (snapped tile corners + the wider, fainter grid line) ---- */
const p5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SPEED='pause';
  const others=LAYERS93.defs.map(d=>d[0]).filter(n=>n!=='tiles');others.forEach(n=>LAYERS93.dbg.add(n));const keep=[SAND83.grain,SAND83.shade,SCAR83.alpha];SAND83.grain=SAND83.shade=SCAR83.alpha=0;
  const walk=()=>{const fr=[];for(let z=1.2;z<=1.4;z+=0.008){CAM.z=z;S.zoomIn=true;draw();const d=ctx.getImageData(0,0,cv.width,cv.height).data,W=cv.width,H=cv.height;const pts=[];
      for(let r=2;r<10;r++)for(let c=2;c<10;c++){const a=iso(r,c+1),b=iso(r+1,c+1);for(let f=0.2;f<=0.8;f+=0.15){const x=Math.round(a.x+(b.x-a.x)*f),y=a.y+(b.y-a.y)*f;let mn=1e9,ref=0;
        for(let k=-4;k<=4;k++){const yy=Math.round(y+k);if(x<1||yy<1||x>=W||yy>=H){mn=-1;break}const i=(yy*W+x)*4,L=d[i]*.3+d[i+1]*.59+d[i+2]*.11;if(Math.abs(k)===4)ref+=L/2;else mn=Math.min(mn,L)}pts.push(mn<0?null:ref-mn)}}
      fr.push(pts)}
    let j=0,n=0;for(let i=1;i<fr.length;i++)fr[i].forEach((v,k)=>{const u=fr[i-1][k];if(v!=null&&u!=null){j+=Math.abs(v-u);n++}});return n?j/n:0};
  const on=walk();SNAP96.on=GRID96.on=false;const off=walk();SNAP96.on=GRID96.on=true;CAM.z=null;S.zoomIn=false;
  SAND83.grain=keep[0];SAND83.shade=keep[1];SCAR83.alpha=keep[2];others.forEach(n=>LAYERS93.dbg.delete(n));draw();return {on:+on.toFixed(2),off:+off.toFixed(2)}});
ok(p5.on>0&&p5.on<p5.off*0.6,'5 seams jump less from frame to frame while zooming '+JSON.stringify(p5));

/* ---- 2 a Fast move yields a frame per step ---- */
const p2=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const p=S.players[0];
  let n=0;const off=BUS.on('draw.after',()=>n++);
  const path=()=>{const out=[];let r=p.r,c=p.c;for(const [dr,dc] of [[0,1],[0,1],[0,1],[0,1],[0,-1],[0,-1],[0,-1],[0,-1],[1,0],[1,0],[-1,0],[-1,0]]){const nr=r+dr,nc=c+dc;if(nr<0||nc<0||nr>=N||nc>=N||pillarAt(nr,nc)||unitAt(nr,nc)||spikeAt(nr,nc))continue;out.push(nr*N+nc);r=nr;c=nc}return out};
  const run=async(sp,on)=>{SPEED=sp;PACE96.on=on;PACE96.coal=on;p.mv=8;const pa=path().slice(0,4);n=0;PACE96.maxStep=0;let gap=0,last=performance.now(),stop=false;
    const tick=()=>{const t=performance.now();gap=Math.max(gap,t-last);last=t;if(!stop)requestAnimationFrame(tick)};requestAnimationFrame(tick);
    const t0=performance.now();await movePlayer(p,pa);const ms=performance.now()-t0;stop=true;await W8(50);return {steps:pa.length,draws:n,ms:Math.round(ms),maxStep:Math.round(PACE96.maxStep),gap:Math.round(gap)}};
  o.normal=await run('normal',true);o.fast=await run('fast',true);o.fastOld=await run('fast',false);PACE96.on=PACE96.coal=true;off();SPEED='pause';o.mul=SPEEDMUL.fast;return o});
ok(p2.fast.steps>=3&&p2.fast.draws>=p2.fast.steps-1,'2a Fast: about one draw per step (the piece glides) '+JSON.stringify(p2.fast));
ok(p2.fast.maxStep<LIM,'2b Fast: no step chain runs '+LIM+' ms (100 ms, more on a loaded machine) without yielding '+JSON.stringify(p2.fast));
ok(p2.fast.ms<Math.max(600,LIM*6)&&p2.fast.ms<p2.normal.ms,'2c Fast: the move is quick (and quicker than Normal) '+JSON.stringify(p2));
ok(p2.normal.draws>=p2.normal.steps,'2d Normal still draws every step '+JSON.stringify(p2.normal));
ok(p2.fastOld.ms<p2.fast.ms&&p2.fastOld.maxStep===0,'2e switched off: the old jump (no frame waits) '+JSON.stringify(p2.fastOld));
ok(p2.mul===0.18,'2f speeds untouched '+p2.mul);

/* ---- 3 a Fast all-CPU stretch: no step chain over 100 ms ---- */
const p3=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));PACE96.maxStep=0;const m0=PACE96.moves,t0=S.turnNo;SPEED='fast';
  const fr=[];let last=performance.now(),stop=false;const tick=()=>{const t=performance.now();fr.push(t-last);last=t;if(!stop)requestAnimationFrame(tick)};requestAnimationFrame(tick);
  const iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},300);await W8(6000);clearInterval(iv);stop=true;SPEED='pause';await W8(300);fr.sort((a,b)=>a-b);
  return {frameP50:Math.round(fr[fr.length>>1]||0),moves:PACE96.moves-m0,turns:S.turnNo-t0,maxStep:Math.round(PACE96.maxStep),hits:TILES96.hits,coalesced:PACE96.coalesced}});
ok(p3.moves>=2&&p3.turns>=2,'3a CPUs moved at Fast '+JSON.stringify(p3));
/* the machine's pace during this stretch (other jobs share the cores): a step may take a few of its frames */
{const L3=Math.max(LIM,p3.frameP50*4);ok(p3.maxStep<L3,'3b no move ran '+L3+' ms without yielding '+JSON.stringify(p3))}

/* ---- 4 the same dice and log at Fast, module on vs off: each run in a fresh browser holding the same saved storage (the world and
   the seed's recorded opening — 05-flow seedOpening — from a warm-up run), the module switched off by its kill switches ---- */
const run4=async(page0,on)=>{const ok0=await page0.evaluate(async seed=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
    for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}return !!S},424242);
  /* from turn 2: how much of turn 1 ran before the hooks went on depends on the machine */
  const r=await page0.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const L=[],R=[];
    const lb=log;log=function(h){if(S&&S.turnNo>=2&&S.turnNo<=10)L.push(S.turnNo+' '+String(h).replace(/<[^>]+>/g,''));return lb.apply(this,arguments)};
    const offT=BUS.on('turn.begin',e=>{if(e.turnNo<=10)R.push(e.turnNo+':'+RNG.s)});
    SPEED='fast';const iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},200);
    for(let i=0;i<600&&!(S.over||S.turnNo>10);i++)await W8(100);clearInterval(iv);SPEED='pause';log=lb;offT();
    return {L,R,turn:S.turnNo,pace:PACE96.on,tiles:TILES96.on,moves:PACE96.moves}});r.ok0=ok0;return r};
await run4(pg,true);
const store=await pg.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});
const fresh=async on=>{const cx=await b.newContext({viewport:{width:1440,height:900}});const q=await cx.newPage();q.on('pageerror',e=>errs.push(e.message));await q.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await q.addInitScript(([st,on])=>{if(sessionStorage.getItem('tv96f'))return;sessionStorage.setItem('tv96f','1');Object.defineProperty(navigator,'webdriver',{get:()=>false});
    for(const k in st)localStorage.setItem(k,st[k]);if(!on){localStorage.setItem('flavius_pace96off','1');localStorage.setItem('flavius_tiles96off','1')}},[store,on]);
  await q.goto(await require(path.join(__dirname,'..','perf95','serve.js'))(page));await q.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  const r=await run4(q,on);await cx.close();return r};
const A=await fresh(true),B=await fresh(false);
const fl=x=>x.L.filter(l=>!/seed \d|seed <b>/.test(l));
ok(A.ok0&&B.ok0&&A.R.length>=8&&A.pace&&A.tiles&&!B.pace&&!B.tiles&&A.moves>0&&B.moves===0,'4a both seeded runs played, kill switches work '+JSON.stringify({a:A.R.length,b:B.R.length,ta:A.turn,tb:B.turn,A:[A.pace,A.tiles,A.moves],B:[B.pace,B.tiles,B.moves]}));
ok(JSON.stringify(A.R)===JSON.stringify(B.R),'4b same dice at every turn ON vs OFF '+JSON.stringify({A:A.R.slice(0,4),B:B.R.slice(0,4)}));
{const a=fl(A),b2=fl(B);let k=0;while(k<a.length&&a[k]===b2[k])k++;ok(a.length===b2.length&&k===a.length,'4c same log ON vs OFF (first difference at '+k+'/'+a.length+': '+JSON.stringify([a[k],b2[k]])+')')}

const newErr=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m):[],mark).catch(()=>[]);
ok(!newErr.length,'no new errors logged '+JSON.stringify(newErr).slice(0,300));
console.log(JSON.stringify({DRAW,LIM,p5,p1,p2,p3,a:A.R.length,b:B.R.length}));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

/* v1.11c — SAFARI FOLLOW-UP (423-v111csafari; his first v1.11b Safari ⏺, zoomed 1.4). On the WebKit path (flavius_v107safariforce=1,
   DPR 2 → 1.5) in an all-CPU Democritus with spectators, ZOOMED IN (S.zoomIn, FREE_ZOOM) with the Amphitheatre on (the default), checks:
   (1) the zoomed caches are used: zoomed board draws run 420's ranges on 423's zoomed entries; while the camera MOVES (86's ease) the
       board-frame picture hits (moving hits), once it HOLDS the screen picture hits (still hits); the floor / decals range (D) hits too;
   (2) the same pixels: the same moment drawn live (V111.live false) and cached, the clock frozen — camera holding: max channel
       difference ≤ 8, mean < 0.2 (as tv111s); camera moving (a slide of the board-frame picture): mean < 0.2, under 0.05% of the pixels
       over 8 and none over 32 (Skia's raster of a long edge that crosses the screen edge is not bit-exact under a whole-pixel slide —
       the same wobble a live frame has from one camera step to the next);
   (3) sharpen never on the main thread: zoomed play sharpens cells in the Worker (jobs done > 0, main-thread sharpen calls 0), and the
       worker's pixels are the sync sh103Sharpen's exactly (max difference 0);
   (4) aim hit masks: 396's body test answers exactly as a one-pixel read would, and a second pass reads nothing back;
   (5) the recorder report carries the v111c block (zoomed hit %, still / moving hits, sharpen.mainMs, aim);
   (6) kill switch flavius_v111csoff=1: nothing installed (V111C.on false, zoomed ranges never begin, 346's sh103Maybe unwrapped);
       Chromium's own path (no WebKit force): off too.
   node tools/tests/tv111c.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,600))};
const open=async(ls,dpr)=>{const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr||1,acceptDownloads:true});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await c.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');localStorage.setItem('flavius_light106auto','0');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  await pg.goto(URL0,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});return {c,pg}};
/* an all-CPU Democritus with spectators at Normal speed, played past its first turns, then zoomed in */
const START=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
  while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:4242,seats:['soldier','hero','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:'auto'}});SPEED='normal';
  for(let i=0;i<400;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6&&S.turnNo>=2)break}
  window.__iv=setInterval(close,300);S.zoomIn=true;draw();return {turn:S.turnNo,spect:(S.spect||[]).length,amph:typeof AMPH111!=='undefined'&&AMPH111.on}};
/* the same moment cached vs live, clock frozen, every draw drawn (no folding); moving = one ease step made the board-frame picture first */
const SHOT=async moving=>{clearInterval(window.__iv);const T0=performance.now;let tt=T0.call(performance);performance.now=()=>tt;const pd=window.p95Defer,zf=Z100.force;window.p95Defer=()=>false;Z100.force=true;
  for(const k in S1Z_111C)S1Z_111C[k].until=0;const grab=()=>{const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;c.getContext('2d',{willReadFrequently:true}).drawImage(cv,0,0);return c};
  const st=()=>[V111C.st.movHit,V111C.st.exactHit];let a,b,h0,h1,z;
  try{const p=cur();if(moving){CAM.fr=p.r+1;CAM.fc=p.c-0.7;draw()}else{CAM.fr=p.r;CAM.fc=p.c;draw();draw()}
    const s1={fr:CAM.fr,fc:CAM.fc};h0=st();draw();h1=st();z=AR91.z;b=grab();CAM.fr=s1.fr;CAM.fc=s1.fc;V111.live=false;draw();a=grab()}
  finally{V111.live=true;performance.now=T0;window.p95Defer=pd;Z100.force=zf;window.__iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},300)}
  const A=a.getContext('2d').getImageData(0,0,a.width,a.height).data,B=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let sum=0,mx=0,n8=0;
  for(let i=0;i<A.length;i+=4){const d=Math.max(Math.abs(A[i]-B[i]),Math.abs(A[i+1]-B[i+1]),Math.abs(A[i+2]-B[i+2]),Math.abs(A[i+3]-B[i+3]));sum+=d;if(d>mx)mx=d;if(d>8)n8++}
  const n=A.length/4;return {moving,zoom:z,movHit:h1[0]-h0[0],stillHit:h1[1]-h0[1],mean:+(sum/n).toFixed(4),max:mx,over8pct:+(n8*100/n).toFixed(4)}};
try{
  {const {c,pg}=await open({flavius_v107safariforce:'1'},2);const st=await pg.evaluate(START);ok(st.turn>=2&&st.amph,'match started, zoomed, Amphitheatre on '+JSON.stringify(st));
    await pg.waitForTimeout(1500);
    /* ---- 1 · zoomed play, then a camera ease drawn frame by frame ---- */
    const r=await pg.evaluate(async()=>{const s0=v111cSnap();await new Promise(r=>setTimeout(r,4000));
      const pd=window.p95Defer;window.p95Defer=()=>false;Z100.force=true;SPEED='pause';const p=cur();CAM.fr=p.r+1.5;CAM.fc=p.c-1;
      try{for(let i=0;i<16;i++){draw();await new Promise(r=>requestAnimationFrame(r))}for(let i=0;i<6;i++){CAM.fr=p.r;CAM.fc=p.c;draw();await new Promise(r=>requestAnimationFrame(r))}}finally{window.p95Defer=pd;Z100.force=false;SPEED='normal'}
      const s1=v111cSnap(),h=k=>s1[k].hit-s0[k].hit;
      return {on:V111C.on,zOn:V111C.zOn,z:AR91.z,zDraws:s1.zDraws-s0.zDraws,M:h('zM'),R1:h('zR1'),R2:h('zR2'),D:h('zD'),moving:s1.movHit-s0.movHit,still:s1.exactHit-s0.exactHit,
        builds:s1.builds-s0.builds,strips:s1.strips-s0.strips,stripDraws:s1.stripDraws-s0.stripDraws,shJobs:s1.sh.done-s0.sh.done,shMain:s1.sh.mainN-s0.sh.mainN,worker:Z3_111C.ok}});
    ok(r.on&&r.zOn&&r.z>1.3&&r.zDraws>10,'WebKit path zoomed: 423 on, zoomed board draws '+JSON.stringify(r));
    ok((r.M>0||(r.R1>0&&r.R2>0))&&r.D>0,'zoomed: the still board and the decals picture come from their caches '+JSON.stringify({M:r.M,R1:r.R1,R2:r.R2,D:r.D}));
    ok(r.moving>=8&&r.still>=1,'zoomed: hits while the camera moves (board-frame picture) and once it holds (screen picture) '+JSON.stringify({moving:r.moving,still:r.still,builds:r.builds,strips:r.strips}));
    ok(r.worker===true&&r.shJobs>0&&r.shMain===0,'sharpen in the Worker, never on the main thread '+JSON.stringify({worker:r.worker,jobs:r.shJobs,main:r.shMain}));
    /* ---- 2 ---- */
    for(const mv of [false,true,false,true]){await pg.waitForTimeout(600);const s=await pg.evaluate(SHOT,mv);
      if(mv)ok(s.movHit>0&&s.mean<0.2&&s.over8pct<0.05&&s.max<=32,'camera moving: board-frame slide ≈ live '+JSON.stringify(s));
      else ok(s.stillHit>0&&s.max<=16&&s.over8pct<0.002&&s.mean<0.2 /* v1.11d: a handful of speckle pixels inside a jug (<=0.001% of the frame, max 15) differ in sub-pixel phase now the speckles are pinned to the jug */,'camera holding: same pixels as live '+JSON.stringify(s))}
    /* ---- 3 · worker pixels = the sync unsharp mask ---- */
    const w=await pg.evaluate(async()=>{let src=null;for(const c of AN100CC.values()){if(c.width>40&&c.height>60){src=c;break}}if(!src)return {err:'no cell'};
      const mk=()=>{const c=document.createElement('canvas');c.width=Math.round(src.width*1.3);c.height=Math.round(src.height*1.3);const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingQuality='high';g.drawImage(src,0,0,c.width,c.height);return c};
      const A=mk(),B=mk();const n0=V111C.st.sh.mainN;sh103Sharpen(A);const n1=V111C.st.sh.mainN;
      const zm=V103C.frame.twAt;V103C.frame.twAt=-99;sh103Maybe(B,1.3);V103C.frame.twAt=zm;const queued=B._sh103===3;
      for(let i=0;i<100&&B._sh103===3;i++)await new Promise(r=>setTimeout(r,50));
      const a=A.getContext('2d').getImageData(0,0,A.width,A.height).data,b=B.getContext('2d').getImageData(0,0,B.width,B.height).data;let mx=0,ch=0;
      const C0=mk().getContext('2d').getImageData(0,0,A.width,A.height).data;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d>mx)mx=d;if(a[i]!==C0[i])ch++}
      return {w:A.width,h:A.height,queued,state:B._sh103,max:mx,changed:ch,syncCounted:n1-n0}});
    ok(w.queued&&w.state===1&&w.max===0&&w.changed>0&&w.syncCounted===1,'worker sharpen = sync sh103Sharpen, pixel for pixel '+JSON.stringify(w));
    /* ---- 4 · aim hit masks ---- */
    const m=await pg.evaluate(()=>{let img=null;for(const c of AN100CC.values()){if(c.width>40&&c.height>60){img=c;break}}if(!img)return {err:'no cell'};
      const fig={ops:[{img,sx:0,sy:0,sw:img.width,sh:img.height,dx:100,dy:50,dw:img.width,dh:img.height,m:[1,0,0,1,0,0]}]};
      const g=document.createElement('canvas');g.width=img.width;g.height=img.height;const gx=g.getContext('2d',{willReadFrequently:true});gx.drawImage(img,0,0);const d=gx.getImageData(0,0,g.width,g.height).data;
      const P=CanvasRenderingContext2D.prototype,gi=P.getImageData;let reads=0;P.getImageData=function(){reads++;return gi.apply(this,arguments)};
      let wrong=0,n=0,r1=0;try{for(let pass=0;pass<2;pass++){for(let y=0;y<img.height;y+=3)for(let x=0;x<img.width;x+=3){const got=aim106Body(fig,100+x+0.5,50+y+0.5),exp=d[(y*img.width+x)*4+3]>40;if(got!==exp)wrong++;n++}if(!pass)r1=reads}}
      finally{P.getImageData=gi}return {n,wrong,readsFirst:r1,readsSecond:reads-r1,built:V111C.st.aim.built,hits:V111C.st.aim.hits}});
    ok(m.n>100&&m.wrong===0&&m.readsFirst<=1&&m.readsSecond===0,'aim masks: same answers as a pixel read, read back once '+JSON.stringify(m));
    /* ---- 5 ---- */
    const dl=pg.waitForEvent('download',{timeout:30000});await pg.evaluate(()=>{SETTINGS.fps100=true;applySettings();REC107.secs=2;rec107Start()});
    const d=await dl;const f=path.join(os.tmpdir(),'tv111c-'+process.pid+'.json');await d.saveAs(f);const j=JSON.parse(fs.readFileSync(f,'utf8'));fs.unlinkSync(f);const v=j.v111c;
    ok(v&&v.on===true&&v.board&&v.board.hitPct&&'stillHits' in v&&'movingHits' in v&&v.sharpen&&typeof v.sharpen.mainMs==='number'&&v.aim,'recorder: v111c block '+JSON.stringify(v&&{hit:v.board.hitPct,still:v.stillHits,moving:v.movingHits,sh:v.sharpen,aim:v.aim}));
    await c.close()}
  /* ---- 6 ---- */
  {const {c,pg}=await open({flavius_v107safariforce:'1',flavius_v111csoff:'1'},2);await pg.evaluate(START);await pg.waitForTimeout(2500);
    const r=await pg.evaluate(()=>({on:V111C.on,zOn:V111C.zOn,ranges:V111C.st.zRanges,hits:Object.values(S1Z_111C).reduce((s,e)=>s+e.st.hit+e.st.miss,0),maybe:sh103Maybe.toString().includes('z3Worker'),v111:V111.on}));
    ok(r.on===false&&r.zOn===false&&r.ranges===0&&r.hits===0&&!r.maybe&&r.v111===true,'kill switch: nothing installed (420 still on) '+JSON.stringify(r));await c.close()}
  {const {c,pg}=await open({});const r=await pg.evaluate(()=>({on:V111C.on,wk:P107S.webkit}));ok(r.on===false&&r.wk===false,'Chromium\'s own path: off '+JSON.stringify(r));await c.close()}
}catch(e){errs.push(String(e&&e.stack||e))}
await b.close();srv.close();console.log('ERRS',JSON.stringify(errs));if(miss.length)console.log('MISSING',JSON.stringify(miss));process.exit(errs.length||miss.length?1:0)})();

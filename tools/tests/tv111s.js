/* v1.11 — SAFARI 2D FIXES (420-v111safari; tools/plans/v111/NOTES.md, tools/bench/safari111.js). On the WebKit path
   (flavius_v107safariforce=1, DPR 2 → 1.5) in an all-CPU Democritus with spectators, checks:
   (1) the caches are used: the still board (M, or R1 + R2 when split), the floor / decals picture (D) and the jugs hit; 260's bitmap pieces
       are off (Z99.bmOn false, no createImageBitmap(ImageBitmap)); the drawing calls that reach the board per draw fall (< 300);
   (2) no read-back of the board in steady play: no getImageData on the board's context; a device bake waits through window.an111Yield;
   (3) the same pixels: the same moment drawn the old way (V111.live false) and with the caches (M mode, split mode, and a forced tiles
       rebuild — 235 copies #cv, the range flushes): max channel difference ≤ 8, mean < 0.2 (8-bit rounding where a picture is composed first);
   (4) the recorder report carries the v111 block; areas sharpen / thin / cellmk exist;
   (5) kill switch flavius_v111soff=1: nothing installed (V111.on false, pieces back on, the canvas prototype untouched); Chromium's own
       path (no WebKit force): off too.
   node tools/tests/tv111s.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,500))};
const open=async(ls,dpr)=>{const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr||1,acceptDownloads:true});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await c.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');localStorage.setItem('flavius_light106auto','0');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return {c,pg}};
/* an all-CPU Democritus with spectators at Normal speed, played past its first turns */
const START=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
  while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:4242,seats:['soldier','hero','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:'auto'}});SPEED='normal';
  for(let i=0;i<400;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6&&S.turnNo>=2)break}
  window.__iv=setInterval(close,300);return {turn:S.turnNo,spect:(S.spect||[]).length}};
/* the same moment, old way vs cached, composed in one task with the clock frozen */
const SHOT=async([split,rebuild])=>{const T0=performance.now;let tt=T0.call(performance);performance.now=()=>tt;const M=S1_111.M,u0=M.until;M.until=split?V111.frame+1e6:0;S1_111.D.until=0;
  const grab=()=>{const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;c.getContext('2d',{willReadFrequently:true}).drawImage(cv,0,0);return c};let a,b,f0,f1;
  try{V111.live=false;draw();a=grab();V111.live=true;draw();f0=V111.st.flush.read|0;if(rebuild)TILES96.key=null;draw();f1=V111.st.flush.read|0;b=grab()}finally{M.until=u0;performance.now=T0;V111.live=true}
  const A=a.getContext('2d').getImageData(0,0,a.width,a.height).data,B=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let sum=0,mx=0;
  for(let i=0;i<A.length;i+=4){const d=Math.max(Math.abs(A[i]-B[i]),Math.abs(A[i+1]-B[i+1]),Math.abs(A[i+2]-B[i+2]),Math.abs(A[i+3]-B[i+3]));sum+=d;if(d>mx)mx=d}
  return {split,rebuild,mean:+(sum/(A.length/4)).toFixed(4),max:mx,flushed:f1-f0,mode:S1_111.mode}};
try{
  {const {c,pg}=await open({flavius_v107safariforce:'1'},2);const st=await pg.evaluate(START);ok(st.turn>=2,'match started '+JSON.stringify(st));
    await pg.waitForTimeout(3000);
    /* ---- 1 + 2 ---- */
    const r=await pg.evaluate(async()=>{const P=CanvasRenderingContext2D.prototype,gi=P.getImageData,cib=window.createImageBitmap;let onBoard=0,bmbm=0,calls=0,draws=0,on=false;
      P.getImageData=function(){if(this===ctx)onBoard++;return gi.apply(this,arguments)};window.createImageBitmap=function(s){if(typeof ImageBitmap!=='undefined'&&s instanceof ImageBitmap)bmbm++;return cib.apply(this,arguments)};
      const K=['drawImage','fillRect','fill','stroke','strokeRect','fillText','clip'],keep={},keepO={};
      for(const k of K){const f=P[k];keep[k]=f;P[k]=function(){if(on&&this===ctx&&!RG111.on)calls++;return f.apply(this,arguments)}}
      for(const k of K){const f=RG111.ORIG[k];keepO[k]=f;RG111.ORIG[k]=function(){if(on&&this===ctx)calls++;return f.apply(this,arguments)}}
      const s0=JSON.parse(JSON.stringify(V111.st));
      try{for(let i=0;i<12;i++){await new Promise(r=>setTimeout(r,120));on=true;draw();on=false;draws++}await new Promise(r=>setTimeout(r,1500))}
      finally{P.getImageData=gi;window.createImageBitmap=cib;for(const k of K){P[k]=keep[k];RG111.ORIG[k]=keepO[k]}}
      const s1=V111.st,h=k=>s1[k].hit-s0[k].hit;
      return {on:V111.on,z99:Z99.bmOn,M:h('M'),R1:h('R1'),R2:h('R2'),D:h('D'),pot:h('pot'),onBoard,bmbm,callsPerDraw:+(calls/draws).toFixed(1),yieldFn:typeof window.an111Yield,
        rgProto:P.drawImage.toString().includes('rg111Op'),mode:S1_111.mode}});
    ok(r.on&&r.z99===false&&r.bmbm===0,'WebKit path: 420 on, no bitmap pieces, no createImageBitmap(ImageBitmap) '+JSON.stringify(r));
    ok((r.M>0||(r.R1>0&&r.R2>0))&&r.D>0&&r.pot>0,'the still board, the decals picture and the jugs come from their caches '+JSON.stringify(r));
    ok(r.callsPerDraw<300,'drawing calls reaching the board per draw < 300 (v1.10: ~1,200) '+r.callsPerDraw);
    ok(r.onBoard===0&&r.yieldFn==='function','no getImageData on the board in steady play; device bakes wait via an111Yield '+JSON.stringify({onBoard:r.onBoard,y:r.yieldFn}));
    /* ---- 3 ---- */
    for(const arg of [[false,false],[true,false],[false,true]]){await pg.waitForTimeout(700);const s=await pg.evaluate(SHOT,arg);
      ok(s.max<=8&&s.mean<0.2&&(!arg[1]||s.flushed>0),'same pixels old ↔ cached '+JSON.stringify(s))}
    /* ---- 4 ---- */
    const dl=pg.waitForEvent('download',{timeout:20000});await pg.evaluate(()=>{SETTINGS.fps100=true;applySettings();REC107.secs=2;rec107Start()});
    const d=await dl;const f=path.join(os.tmpdir(),'tv111s-'+process.pid+'.json');await d.saveAs(f);const j=JSON.parse(fs.readFileSync(f,'utf8'));fs.unlinkSync(f);
    ok(j.v111&&j.v111.on===true&&j.v111.board&&j.v111.board.hitPct&&typeof j.v111.bigBlitsSavedPerDraw==='number'&&j.v111.z99Pieces===false,'recorder: v111 block '+JSON.stringify(j.v111&&{mode:j.v111.mode,hit:j.v111.board.hitPct,big:j.v111.bigBlitsSavedPerDraw,calls:j.v111.drawCallsSavedPerDraw,pots:j.v111.pots.hitPct}));
    const ar=await pg.evaluate(()=>['sharpen','thin','cellmk'].filter(k=>k in REC107.AREAS));ok(ar.length===3,'recorder areas sharpen / thin / cellmk '+JSON.stringify(ar));
    await c.close()}
  /* ---- 5 ---- */
  {const {c,pg}=await open({flavius_v107safariforce:'1',flavius_v111soff:'1'},2);await pg.evaluate(START);await pg.waitForTimeout(1000);
    const r=await pg.evaluate(()=>({on:V111.on,z99:Z99.bmOn,proto:CanvasRenderingContext2D.prototype.drawImage.toString().includes('rg111Op'),M:RG111.M.length,y:window.an111Yield}));
    ok(r.on===false&&r.z99===true&&!r.proto&&r.M===0&&r.y===null,'kill switch: nothing installed '+JSON.stringify(r));await c.close()}
  {const {c,pg}=await open({});const r=await pg.evaluate(()=>({on:V111.on,z99:Z99.bmOn,wk:P107S.webkit}));
    ok(r.on===false&&r.z99===true&&r.wk===false,'Chromium\'s own path: off '+JSON.stringify(r));await c.close()}
}catch(e){errs.push(String(e&&e.stack||e))}
await b.close();srv.close();console.log('ERRS',JSON.stringify(errs));if(miss.length)console.log('MISSING',JSON.stringify(miss));process.exit(errs.length||miss.length?1:0)})();

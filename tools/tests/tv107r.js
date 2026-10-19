/* v1.07 beta 3 — CPU FAST ON A GPU CANVAS + THE FRAME RECORDER (405-v107perf2; tools/plans/v107/PERF.md "beta 3"). Checks:
   (1) Q3 the recorder: a live 8-seat CPU match at Fast over http, frame meter on; "⏺ 3 s" (REC107.secs shortened) records, the page offers
       flavius-perf-<date>.json; the report holds frames (n, fps, intervals), areas (draw + render timed), long tasks, counts, layers, zoom, dpr,
       lighting, speed 'fast', the browser string and the GPU key; the meter shows the one-line summary;
   (2) zero cost when off: before and after a recording the page's functions and the canvas prototypes are the SAME objects (the wrappers are
       taken out: drawLayers93, render, log, BUS.emit, document.createElement, getImageData, toBlob, createImageBitmap, the image src setter);
   (3) Q1 a new face is turned into a JPEG on a canvas kept in memory (P107B.st.faces grows, the entry's url becomes a JPEG data: URL);
   (4) Q2 bst100Live's "board shown" follows a ResizeObserver: the board hidden → false; shown again → the observer says true;
   (5) kill switch flavius_v107perf2off=1 → P107B.off, no record button, 268's own face step.
   node tools/tests/tv107r.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const os=require('os');const RD=async d=>{const f=path.join(os.tmpdir(),'tv107r-'+process.pid+'-'+Date.now()+'.json');await d.saveAs(f);const t=fs.readFileSync(f,'utf8');fs.unlinkSync(f);return JSON.parse(t)};
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,400))};
const open=async ls=>{const c=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await c.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return {c,pg}};
const START=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
  while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  const cls=['soldier','hero','royalty','venatore','amazonia','veteranus','slave','damnatio'];
  startEvent({ev:'democritus',loc:6,seed:4242,seats:cls.map(c=>({cls:c,cpu:true})),opts:{}});SPEED='fast';
  for(let i=0;i<200;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6)break}window.__iv=setInterval(close,300);
  SETTINGS.fps100=true;applySettings();await W8(800);return !!document.querySelector('#fps100 .r107b')};
const IDS=()=>{const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');return [drawLayers93,render,log,BUS.emit,document.createElement,CanvasRenderingContext2D.prototype.getImageData,HTMLCanvasElement.prototype.toBlob,window.createImageBitmap,d.set,typeof matchSlotPut==='function'?matchSlotPut:null,typeof aim106Wound==='function'?aim106Wound:null]};
try{
  /* ---- 1 + 2 ---- */
  {const {c,pg}=await open({flavius_light106:'full',flavius_light106auto:'0'});
    ok(await pg.evaluate(START),'the frame meter shows the record button');
    await pg.evaluate(IDS=>{window.__ids0=(0,eval)('('+IDS+')')()},IDS.toString());
    ok(await pg.evaluate(()=>!REC107.on&&REC107.undo.length===0),'not recording: no wrapper in place');
    await pg.evaluate(()=>{REC107.secs=3});
    const dl=pg.waitForEvent('download',{timeout:20000});await pg.click('#fps100 .r107b');
    const mid=await pg.evaluate(()=>({on:REC107.on,n:REC107.undo.length,wrapped:drawLayers93!==window.__ids0[0],txt:document.querySelector('#fps100 .r107b').textContent}));
    ok(mid.on&&mid.n>10&&mid.wrapped&&/⏺/.test(mid.txt),'recording: wrappers in place, the button counts down '+JSON.stringify(mid));
    const d=await dl;ok(/^flavius-perf-\d{8}-\d{6}\.json$/.test(d.suggestedFilename()),'the page offers '+d.suggestedFilename());
    const j=await RD(d);
    ok(j.kind==='flavius-perf'&&j.v===1&&j.secs>=2.5&&j.secs<6,'report kind / version / length '+j.secs+' s');
    ok(j.frames&&j.frames.n>5&&j.frames.fps>0&&Array.isArray(j.frames.intervals)&&j.frames.intervals.length===j.frames.n&&j.frames.p50>0,'frames '+JSON.stringify({n:j.frames.n,fps:j.frames.fps,p50:j.frames.p50,max:j.frames.max}));
    ok(j.areas&&j.areas.draw&&j.areas.draw.calls>0&&j.areas.draw.ms>=0&&j.areas.render&&j.areas.render.calls>0,'areas timed: draw '+JSON.stringify(j.areas.draw)+' render '+JSON.stringify(j.areas.render)+' all '+Object.keys(j.areas).join(','));
    ok(Array.isArray(j.longTasks)&&Array.isArray(j.longFrames)&&Array.isArray(j.slowFrames)&&j.counts&&typeof j.counts==='object','long tasks '+j.longTasks.length+', long frames '+j.longFrames.length+', counts '+JSON.stringify(j.counts));
    ok(j.speed==='fast'&&j.light==='full'&&j.zoom>=1&&j.dpr===1&&/Chrome|HeadlessChrome/.test(j.ua)&&'gpu' in j&&j.view.w===1440&&Array.isArray(j.layers)&&j.layers.length>0,'context: '+JSON.stringify({speed:j.speed,light:j.light,zoom:j.zoom,dpr:j.dpr,gpu:j.gpu,ev:j.event}));
    ok(j.event&&j.event.players===8&&j.event.cpu===8,'event: 8 CPU seats');
    const after=await pg.evaluate(IDS=>{const now=(0,eval)('('+IDS+')')();const bad=now.map((f,i)=>f===window.__ids0[i]?null:i).filter(x=>x!=null);
      return {bad,on:REC107.on,undo:REC107.undo.length,nat:/native code/.test(CanvasRenderingContext2D.prototype.getImageData.toString())&&/native code/.test(String(document.createElement)),line:(document.querySelector('#fps100 .r107l')||{}).textContent||''}},IDS.toString());
    ok(!after.on&&after.undo===0&&after.bad.length===0&&after.nat,'after: every wrapper taken out (same functions as before) '+JSON.stringify({bad:after.bad,nat:after.nat}));
    ok(/fps/.test(after.line)&&/long tasks/.test(after.line),'the meter shows the summary: '+after.line);
    /* a second recording works too and stops on a click */
    await pg.evaluate(()=>{REC107.secs=10});const dl2=pg.waitForEvent('download',{timeout:20000});await pg.click('#fps100 .r107b');await pg.waitForTimeout(1200);await pg.click('#fps100 .r107b');
    const d2=await dl2;const j2=await RD(d2);ok(j2.secs<6&&j2.frames.n>2,'a click stops it early: '+j2.secs+' s');
    ok(await pg.evaluate(()=>!document.querySelector('#fps100 .f3')||document.querySelector('#fps100 .f3').hidden),'the record button does not toggle the meter details');
    /* ---- 3 ---- */
    const f=await pg.evaluate(async()=>{const n0=P107B.st.faces,p0=R99.stats.png;const e=r99Get('tv107r-'+Date.now(),()=>'<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="#c33"/></svg>',24,24);
      for(let i=0;i<150&&!/^data:image\/jpeg/.test(e.url);i++)await new Promise(r=>setTimeout(r,100));return {faces:P107B.st.faces-n0,png:R99.stats.png-p0,url:e.url.slice(0,22)}});
    ok(f.faces>=1&&f.png>=1&&/^data:image\/jpeg/.test(f.url),'Q1 a new face is encoded on a canvas in memory '+JSON.stringify(f));
    /* ---- 4 ---- */
    const v=await pg.evaluate(async()=>{const fr=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));bst100Live();await fr();const a=P107B.vis.v;
      const w=cv.parentElement;const d0=w.style.display;w.style.display='none';await fr();const hid=bst100Live();const vh=P107B.vis.v;w.style.display=d0;await fr();await fr();return {a,hid,vh,back:P107B.vis.v,ro:P107B.st.shownRO}});
    ok(v.a===true&&v.hid===false&&v.vh===false&&v.back===true&&v.ro>=2,'Q2 the board shown / hidden follows the observer '+JSON.stringify(v));
    /* ---- 4b · Q4 the panels stay in the page while render() patches them ---- */
    const h=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SPEED='pause';await W8(400);
      const one=async()=>{const b0=document.getElementById('board'),ids=['status','roster','board','npcPanel'].map(i=>document.getElementById(i));let out=0;
        const mo=new MutationObserver(l=>{for(const r of l)for(const n of r.removedNodes)if(ids.includes(n))out++});for(const e of ids)if(e&&e.parentNode)mo.observe(e.parentNode,{childList:true});
        const h0=P107B.st.hold;P95.inp=performance.now();render();await W8(50);mo.disconnect();
        return {out,same:document.getElementById('board')===b0,dup:document.querySelectorAll('#board').length,hold:P107B.st.hold-h0,inHold:(document.getElementById('p107hold')||{childElementCount:0}).childElementCount,txt:document.getElementById('board').textContent.length}};
      const on=await one();P107B.hold=false;const off=await one();P107B.hold=true;SPEED='fast';return {on,off}});
    ok(h.on.out===0&&h.on.same&&h.on.dup===1&&h.on.hold>=1&&h.on.inHold===0&&h.on.txt>20,'Q4 render() patches the panels in place (none taken out) '+JSON.stringify(h.on));
    ok(h.off.out>0&&h.off.same&&h.off.dup===1,'Q4 off (P107B.hold=false): 230\'s swap takes them out and back '+JSON.stringify(h.off));
    await c.close()}
  /* ---- 5 ---- */
  {const {c,pg}=await open({flavius_v107perf2off:'1'});const hasBtn=await pg.evaluate(START);
    const k=await pg.evaluate(()=>({off:P107B.off,src:/willReadFrequently/.test(String(r99Step)),vis:!!P107B.vis}));
    ok(!hasBtn&&k.off&&!k.src&&!k.vis,'kill switch: no record button, 268 / 401 paths '+JSON.stringify(k));await c.close()}
}catch(e){errs.push('TEST '+e.message)}
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.concat(miss.map(m=>'MISS '+m.slice(0,80)))));await b.close();srv.close();process.exit(errs.length||miss.length?1:0)})();

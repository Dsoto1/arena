/* v1.07 beta 4 — SAFARI FRAME RATE (406-v107safari; tools/plans/v107/PERF.md "beta 4: Safari reports"). Checks:
   (1) #perf=… switches: the page address #perf=v107perf2off,light106:off reads them for this load only (PERF_SW, P107B.off,
       l106Mode 'off'), nothing is written to localStorage; a plain load has none;
   (2) W2 the Guide's gold tile: a paused match with S.sugTile on a free tile draws the board ONCE, not every frame (≤ 2 draws in 1 s),
       GUIDE.raf stays 0, the compositor ring #sug107 shows over the tile; the tile cleared → the ring hides; kill switch → the old
       every-frame redraw (> 8 draws in 1 s);
   (3) W1 / W3 on the WebKit path (flavius_v107safariforce=1, DPR 2): devicePixelRatio is capped at 1.5 and the board canvas is sized from it;
       flavius_v107dpr=2 → no cap; in-memory cells reach the board as ImageBitmaps (P107S.st.bm, bmDraw grow); Chromium's own path: no cap;
   (4) W4 the recorder report carries switches, page (dprUsed, canvases, cssAnims, boardDraws, drawnKinds) and p107s; counts['draw()'];
       Safari's "fn@url" stack lines are read by rec107Where.
   node tools/tests/tv107s.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,400))};
const open=async(ls,hash,dpr)=>{const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr||1,acceptDownloads:true});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await c.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');localStorage.setItem('flavius_light106auto','0');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  await pg.goto(URL0+(hash||''));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return {c,pg}};
/* a 4-seat match (1 human + 3 CPU) played at Fast to the human's turn, then paused */
const START=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
  while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:4242,seats:[{cls:'soldier',cpu:false},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{}});SPEED='fast';
  for(let i=0;i<900;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6&&S.turnNo>1&&!cur().cpu&&(S.phase==='choice'||S.phase==='action'))break}
  SPEED='pause';window.__iv=setInterval(close,300);await W8(600);return {phase:S.phase,cpu:cur().cpu}};
/* draws in one second with a free tile suggested */
const SUG=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));let t=null;
  for(let r=4;r<9&&!t;r++)for(let c=4;c<9&&!t;c++){const occ=[...S.players,...S.npcs].some(x=>x.alive!==false&&x.r===r&&x.c===c);const tile=S.board&&S.board[r]&&S.board[r][c];if(!occ&&(!tile||!tile.pillar))t={r,c}}
  for(let i=0;i<60&&typeof CURTAIN!=='undefined'&&performance.now()-CURTAIN.t0<CURTAIN.dur+300;i++)await W8(100);   /* 16's curtain opening (a 2.6-s draw loop of its own) */
  S.sugTile=t;draw();await W8(300);let n=0;const d=draw;draw=function(){n++;return d.apply(this,arguments)};await W8(1000);draw=d;
  const el=document.getElementById('sug107');return {t,n,raf:GUIDE.raf,shown:!!(el&&!el.hidden),box:el?[el.style.width,el.style.height]:null}};
try{
  /* ---- 1 ---- */
  {const {c,pg}=await open({},'#perf=v107perf2off,light106:off');
    const r=await pg.evaluate(()=>({sw:PERF_SW,off:P107B.off,raw:Object.keys(localStorage).filter(k=>/v107perf2off|light106$/.test(k)),light:L106.ov}));
    ok(r.sw.join()==='v107perf2off,light106:off'&&r.off===true&&r.raw.length===0&&r.light==='off','#perf= switches for this load only '+JSON.stringify(r));await c.close()}
  {const {c,pg}=await open({});const r=await pg.evaluate(()=>({sw:PERF_SW,off:P107B.off,s:P107S.off,wk:P107S.webkit,dpr:devicePixelRatio}));
    ok(r.sw.length===0&&!r.off&&!r.s&&!r.wk&&r.dpr===1,'plain load: no switches, Chromium is not the WebKit path '+JSON.stringify(r));
    /* ---- 2 ---- */
    const st=await pg.evaluate(START);ok(st.cpu===false,'the human\'s turn, paused '+JSON.stringify(st));
    const s=await pg.evaluate(SUG);
    ok(s.t&&s.n<=2&&!s.raf&&s.shown,'W2 a suggested tile does not redraw the board every frame; the pulse ring shows '+JSON.stringify(s));
    const h=await pg.evaluate(async()=>{S.sugTile=null;draw();await new Promise(r=>setTimeout(r,100));const el=document.getElementById('sug107');return !el||el.hidden});
    ok(h,'W2 no suggestion → the ring hides');
    /* ---- 4 ---- */
    const where=await pg.evaluate(()=>{const E=window.Error;let out;window.Error=function(){return {stack:'Error\nrec107Where@http://x/f.html:1:2\nrec107Hit@http://x/f.html:1:3\nbs101Proc@http://x/f.html:9:9\nan100Cell@http://x/f.html:9:9\n@http://x/f.html:1:1'}};try{out=rec107Where()}finally{window.Error=E}return out});
    ok(where==='bs101Proc < an100Cell','W4 Safari stack lines read: '+where);
    const dl=pg.waitForEvent('download',{timeout:20000});await pg.evaluate(()=>{SETTINGS.fps100=true;applySettings();REC107.secs=2;rec107Start();setTimeout(()=>{try{S.sugTile={r:0,c:0};draw();draw()}catch(e){}},300)});
    const d=await dl;const f=path.join(os.tmpdir(),'tv107s-'+process.pid+'.json');await d.saveAs(f);const j=JSON.parse(fs.readFileSync(f,'utf8'));fs.unlinkSync(f);
    ok(Array.isArray(j.switches)&&j.page&&j.page.dprUsed===1&&Array.isArray(j.page.canvases)&&j.page.canvases.some(x=>x.id==='cv')&&typeof j.page.cssAnims==='number'&&j.page.boardDraws>=2&&j.page.drawnKinds&&j.p107s&&j.counts['draw()']&&j.counts['draw()'].n>=2,
      'W4 report: switches, page, p107s, draw() callers '+JSON.stringify({page:{...j.page,canvases:j.page.canvases.length,animOn:undefined},draw:j.counts['draw()']}));
    await c.close()}
  {const {c,pg}=await open({flavius_v107safarioff:'1'});await pg.evaluate(START);const s=await pg.evaluate(SUG);
    ok(s.n>8,'kill switch: the old every-frame redraw '+JSON.stringify(s));await c.close()}
  /* ---- 3 ---- */
  {const {c,pg}=await open({flavius_v107safariforce:'1',flavius_v107dpr:'1.5'},'',2);await pg.evaluate(START);
    const r=await pg.evaluate(async()=>{for(let i=0;i<8;i++){draw();await new Promise(r=>requestAnimationFrame(r))}await new Promise(r=>setTimeout(r,500));for(let i=0;i<4;i++){draw();await new Promise(r=>requestAnimationFrame(r))}
      return {dpr:devicePixelRatio,real:w1Real(),cw:cv.width,css:cv.clientWidth,st:{...P107S.st}}});
    ok(r.dpr===1.5&&r.real===2&&Math.abs(r.cw-r.css*1.5)<=1,'W1 WebKit path: the board at 1.5× on a 2× screen '+JSON.stringify({dpr:r.dpr,real:r.real,cw:r.cw,css:r.css}));
    ok(r.st.bm>0&&r.st.bmDraw>0,'W3 in-memory cells drawn as bitmaps '+JSON.stringify(r.st));await c.close()}
  {const {c,pg}=await open({flavius_v107safariforce:'1',flavius_v107dpr:'2'},'',2);const r=await pg.evaluate(()=>devicePixelRatio);ok(r===2,'flavius_v107dpr=2: no cap ('+r+')');await c.close()}
}catch(e){errs.push('EXC '+e.message)}
await b.close();srv.close();console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(errs.length||miss.length?1:0)})();

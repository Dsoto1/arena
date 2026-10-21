/* tv108c — v1.08c item 0b (412-v108cread): the bases-off clean-up (321 bs101Off) reads its pixels off the main thread on WebKit.
   An all-CPU match, Normal speed, Settings → Show token bases OFF, served over http, DPR 2:
   1 WebKit path (flavius_v107safariforce=1, 406's cap held at 1.5): new cells go to the worker (RB108.st.async/done grow, no fail), the
     main thread's bs101Off read-backs are fewer than the cells made (only a figure's very first base-less cell stays sync), the worker's
     pixels are BYTE-IDENTICAL to 321's sync path on the same source pixels (every finished job re-made sync from a copy of its source);
   2 Chromium's own path: 412 idle (no async, no interim) — 321's sync path;
   3 kill switch flavius_rb108off=1 on the WebKit path: no async; no page errors anywhere.
   node tools/tests/tv108c.js <page> → MISS [] ERRS [] exit 0. */
const {chromium}=require('playwright');const path=require('path'),http=require('http'),fs=require('fs');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const root=path.dirname(page);const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.mp3':'audio/mpeg'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+path.basename(page);
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m.slice(0,500));if(!c)miss.push(m)};
const run=async ls=>{const cx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');localStorage.setItem('flavius_light106auto','0');for(const k in ls)localStorage.setItem(k,ls[k])},ls);
  const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message));await pg.goto(URL0,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
  const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
    while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}SETTINGS.briefing=false;SETTINGS.bases101=false;applySettings();try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
    /* a copy of each source the worker is sent (its pixels at that moment), and each finished job */
    const cib=window.createImageBitmap,copies=new Map(),jobs=[];window.createImageBitmap=function(src,...a){try{if(a.length===4&&src&&src.width){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d',{willReadFrequently:true}).drawImage(src,0,0);copies.set(src,c)}}catch(e){}return cib.apply(this,arguments)};
    if(typeof rb108Done==='function'){const d=rb108Done;rb108Done=function(m){const J=RB108.jobs.get(m.id);const r=d.apply(this,arguments);if(J&&m.ok&&jobs.length<40){const map=BS101.cache.get(J.img);jobs.push({J,c:map&&map.get(J.key),copy:copies.get(J.img)})}return r}}
    const gi=CanvasRenderingContext2D.prototype.getImageData;let main=0;CanvasRenderingContext2D.prototype.getImageData=function(){if(/bs101Off/.test(String(new Error().stack)))main++;return gi.apply(this,arguments)};
    const cls=['soldier','hero','royalty','venatore','amazonia','veteranus','slave','damnatio'];
    startEvent({ev:'democritus',loc:6,seed:4242,seats:cls.map(c=>({cls:c,cpu:true})),opts:{}});SPEED='normal';
    for(let i=0;i<200;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6)break}const iv=setInterval(close,300);S.zoomIn=true;
    const s0={...BS101.stats};await W8(14000);clearInterval(iv);SPEED='pause';await W8(800);const s1={...BS101.stats};CanvasRenderingContext2D.prototype.getImageData=gi;
    /* byte-identical: 321's sync path (412 off) on the copy of the job's source */
    let same=0,diff=0,checked=0,first=null;const off0=RB108.off;RB108.off=true;
    try{for(const {J,c,copy} of jobs){if(!c||!copy)continue;checked++;const a=J.a.slice();a[0]=copy;const s=bs101Proc.apply(null,a);
      const A=c.getContext('2d').getImageData(0,0,c.width,c.height).data,B=s.getContext('2d').getImageData(0,0,s.width,s.height).data;
      let n=0;if(A.length!==B.length)n=-1;else for(let i=0;i<A.length;i++)if(A[i]!==B[i])n++;if(n===0&&c._off===s._off)same++;else{diff++;if(!first)first={n,w:c.width,h:c.height,offA:c._off,offB:s._off}}}}finally{RB108.off=off0}
    return {st:typeof RB108!=='undefined'?{...RB108.st}:null,on:typeof rb108On==='function'&&rb108On(),proc:s1.proc-s0.proc,main,checked,same,diff,first,webkit:typeof P107S!=='undefined'&&P107S.webkit,dpr:devicePixelRatio}});
  await cx.close();return r};
const wk=await run({flavius_v107safariforce:'1',flavius_v107dpr:'1.5'});console.log('wk',JSON.stringify(wk));
ok(wk.on&&wk.st&&wk.st.async>=3&&wk.st.done>=3&&!wk.st.fail,'1 WebKit path: new cells go to the worker '+JSON.stringify(wk.st));
ok(wk.main<wk.proc,`1 main-thread bs101Off read-backs (${wk.main}) < cells made (${wk.proc})`);
ok(wk.checked>=3&&wk.diff===0,`1 the worker's pixels = 321's sync path: ${wk.same}/${wk.checked} identical `+JSON.stringify(wk.first));
const ch=await run({});console.log('chromium',JSON.stringify(ch));
ok(!ch.on&&ch.st&&!ch.st.async&&!ch.st.interim&&ch.proc>0&&ch.main>=ch.proc,'2 Chromium: 412 idle, 321 sync '+JSON.stringify(ch));
const ks=await run({flavius_v107safariforce:'1',flavius_v107dpr:'1.5',flavius_rb108off:'1'});console.log('off',JSON.stringify(ks));
ok(!ks.on&&ks.st&&!ks.st.async&&!ks.st.interim,'3 kill switch: no worker '+JSON.stringify(ks.st));
srv.close();await b.close();console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});

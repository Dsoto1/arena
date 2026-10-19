/* tv95p — v0.95 PERFORMANCE (230-v95perf). Served over http (so the sprite-sheet cut-outs can be made, as on the site).
   1 · the same all-CPU Democritus (seed 9595) at FAST for 12 s under a Chrome trace, once with the pass OFF (localStorage
       flavius_perf95off=1 — the v0.94 behaviour) and once ON: image decodes (count and ms of decoding a second) and the frame p50 stay under ceilings set from
       the v0.95 after-numbers with a wide margin, and ON spends far less time decoding than OFF (the comparison holds on a loaded machine too).
       ON: the panels were patched in place, renders were coalesced while CPUs acted, cut-outs were made and the fighter panel shows
       them (blob: images), no speech bubbles at Fast;
   2 · the patched panels hold what a plain innerHTML render gives (P95.noPatch) for the same state (attributes sorted; the lit
       figures' id prefixes and what 138 / 220's observers add later — term spans, contrast lift, data-en84 — left out);
   3 · Slow → Fast during a long sleep() finishes at Fast's pace; Pause holds a sleep; a plain Normal sleep keeps its length;
   4 · no page errors. Prints the numbers (PERF lines). */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SECS=12;
async function run(off){const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
  await pg.addInitScript(off=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(off)localStorage.setItem('flavius_perf95off','1')},off);
  pg.on('pageerror',e=>errs.push((off?'OFF ':'')+e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    startEvent({ev:'democritus',loc:6,seed:9595,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:'auto'}});
    for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8)break}
    window.T95={frames:[],stop:0,bubs:0};setInterval(()=>{if(CUR_MODAL&&!T95.stop)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},300);
    SPEED='fast';for(let i=0;i<40&&(CUT95.busy||CUT95.q.length||i<15);i++)await W8(200); /* the cut-outs are made once, at the start */
    for(const k in P95.n)P95.n[k]=0;let last=performance.now();const tick=()=>{const t=performance.now();T95.frames.push(t-last);last=t;if(!T95.stop)requestAnimationFrame(tick)};requestAnimationFrame(tick);
    setInterval(()=>{const bx=document.getElementById('bubbles');if(bx&&bx.children.length&&SPEED==='fast'&&!T95.stop)T95.bubs++},200)});
  await b.startTracing(pg,{categories:['devtools.timeline','disabled-by-default-devtools.timeline']});
  await pg.waitForTimeout(SECS*1000);const buf=await b.stopTracing();
  const ev=JSON.parse(buf.toString()).traceEvents;const decAll=ev.filter(e=>e.name==='Decode Image'||e.name==='Decode LazyPixelRef');
  /* v1.07: what is budgeted is MAIN-THREAD decoding (it stalls frames). 401's createImageBitmap(Blob) cut-outs and the raster workers decode on
     ThreadPoolForegroundWorker threads: those are counted apart (dpsAll, a runaway guard) and not against the main-thread ceilings. */
  const mainKey=new Set(ev.filter(e=>e.ph==='M'&&e.name==='thread_name'&&e.args&&e.args.name==='CrRendererMain').map(e=>e.pid+':'+e.tid));const dec=decAll.filter(e=>mainKey.has(e.pid+':'+e.tid));
  const r=await pg.evaluate(()=>{T95.stop=1;const f=T95.frames.slice(1).sort((a,b)=>a-b);const q=p=>f[Math.floor(f.length*p)]||0;
    const blob=[...document.querySelectorAll('#board [style*="blob:"],#board image[href^="blob:"],#npcPanel [style*="blob:"]')].length;
    return {fps:f.length,p50:q(.5),p95:q(.95),n:{...P95.n},cut:{made:CUT95.made,fail:CUT95.fail},blob,bubs:T95.bubs,turn:S.turnNo}});
  r.dps=+(dec.length/SECS).toFixed(2);r.dpsAll=+(decAll.length/SECS).toFixed(2);r.decMs=Math.round(dec.reduce((a,e)=>a+(e.dur||0)/1000,0));r.decMsAll=Math.round(decAll.reduce((a,e)=>a+(e.dur||0)/1000,0));r.fps=Math.round(r.fps/SECS);r.p50=Math.round(r.p50);r.p95=Math.round(r.p95);
  console.log('PERF '+(off?'OFF ':'ON  ')+JSON.stringify(r));return {pg,r}}
const OFF=await run(true);await OFF.pg.close();const {pg,r}=await run(false);
/* TWEAK: the ceilings. Measured v0.95 (http, all-CPU Fast, 4 shared cores): ON 5–11 small decodes/s = 15–60 ms of decoding a second,
   OFF 29–40/s = 700–1000 ms a second; frame p50 ON 51–60 ms vs OFF 83–120 (quiet machine), both ~2× on a loaded one */
const dms=r.decMs/SECS,dmsAll=r.decMsAll/SECS,offDms=OFF.r.decMsAll/SECS;
ok(r.dps<=25,'main-thread decodes/s '+r.dps+' > 25');ok(r.dpsAll<=90,'all decodes/s '+r.dpsAll+' > 90 (workers included)');ok(dms<=150,'main-thread decoding '+Math.round(dms)+' ms/s > 150');ok(dmsAll<=Math.max(60,offDms*0.3),'decoding ON '+Math.round(dmsAll)+' ms/s (all threads) not under 30% of OFF '+Math.round(offDms));
ok(r.p50<=Math.max(160,OFF.r.p50*1.3),'frame p50 '+r.p50+' ms (OFF '+OFF.r.p50+')');
ok(r.n.patched>0,'panels never patched');ok(r.n.deferred>0,'no render was coalesced at Fast');ok(r.n.kept>0,'no node kept by the patch');
ok(r.cut.made>0,'no cut-outs made');ok(r.blob>0,'the fighter panel shows no cut-out');ok(r.bubs===0,'speech bubbles at Fast');
ok(OFF.r.n.patched===0&&OFF.r.cut.made===0,'the kill switch did not turn the pass off');
/* 2 · the patch gives what innerHTML gives */
const same=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SPEED='pause';await W8(800);for(let i=0;i<40&&(S.busy||typeof fxRAF!=='undefined'&&fxRAF);i++)await W8(100);
  const ids=['status','rosterHd','roster','board','npcPanel','turnInd'];
  const canon=x=>{if(x.nodeType===3)return x.nodeValue;if(x.nodeType!==1)return '';if(x.tagName==='SPAN'&&x.classList.contains('gt84'))return x.textContent;
    const at=Array.from(x.attributes).filter(a=>a.name!=='data-en84'&&a.name!=='data-lift93'&&a.name!=='translate'/* 138's translate=no marks land on an observer's schedule: late on a slow runner */).map(a=>a.name+'='+a.value.replace(/s3h[0-9a-z]+/g,'').replace(/(^|;\s*)color:\s*(rgb\([^)]*\)|var\(--[\w-]+\)|#[0-9a-f]{3,8})/gi,'$1color:*').replace(/\s+/g,'').replace(/;$/,'')).sort();
    let s='<'+x.tagName+' '+at.join(' ')+'>';for(const c of x.childNodes)s+=canon(c);return s+'</>'};
  const snap=()=>ids.map(id=>{const e=document.getElementById(id);return e?canon(e):''});
  render();render();await W8(500);const a=snap();P95.noPatch=true;render();await W8(500);const b2=snap();P95.noPatch=false;render();await W8(500);const c=snap();
  const bad=ids.filter((id,i)=>a[i]!==b2[i]||c[i]!==b2[i]);let at='';if(bad.length){const i=ids.indexOf(bad[0]);const x=a[i]!==b2[i]?a[i]:c[i],y=b2[i];let k=0;while(k<x.length&&x[k]===y[k])k++;at=bad[0]+': '+x.slice(Math.max(0,k-80),k+80)+' ||| '+y.slice(Math.max(0,k-80),k+80)}
  return {bad,at,len:b2.join('').length}});
console.log('SAME '+JSON.stringify(same));ok(!same.bad.length,'patched panels differ from innerHTML: '+same.at);ok(same.len>2000,'panels empty');
/* 3 · speed changes take effect at once */
const sl=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
  SPEED='slow';let t0=performance.now();const p1=sleep(2000).then(()=>performance.now()-t0);await W8(300);SPEED='fast';const fastMs=await p1;
  SPEED='normal';t0=performance.now();let done=0;const p2=sleep(400).then(()=>{done=performance.now()-t0});await W8(50);SPEED='pause';await W8(900);const held=!done;SPEED='normal';await p2;
  SPEED='normal';t0=performance.now();await sleep(600);const plain=performance.now()-t0;SPEED='pause';return {fastMs:Math.round(fastMs),held,afterPause:Math.round(done),plain:Math.round(plain)}});
console.log('SLEEP '+JSON.stringify(sl));
ok(sl.fastMs<2600,'Slow→Fast sleep took '+sl.fastMs+' ms (Slow alone: 5200)');ok(sl.held,'Pause did not hold a sleep');ok(sl.plain>=590&&sl.plain<1800,'Normal sleep(600) took '+sl.plain);
console.log('ERRS',JSON.stringify(errs));console.log(miss.length?'FAIL '+miss.join(' · '):'ALL OK');
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});

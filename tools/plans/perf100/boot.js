/* perf100 audit — boot cost. node tools/plans/perf100/boot.js [runs=2]
   (1) the real page over http: trace (v8 compile/parse + EvaluateScript), DOMContentLoaded, load, FLAVIUS_READY, main menu up;
   (2) the instrumented copy (.perf100-boot.html from mkboot.py): top-level time per module + timers armed before the menu. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os');
const R=path.resolve(__dirname,'..','..','..');const serve=require(path.join(R,'tools/perf95/serve.js'));
const RUNS=+(process.argv[2]||2);
const INIT=()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');
  const W={si:0,st:0,raf:0,mo:0,ls:0};window.__B=W;const si=window.setInterval,st=window.setTimeout,raf=window.requestAnimationFrame,MO=window.MutationObserver,ael=EventTarget.prototype.addEventListener;
  window.setInterval=function(){W.si++;return si.apply(this,arguments)};window.setTimeout=function(){W.st++;return st.apply(this,arguments)};
  window.requestAnimationFrame=function(){W.raf++;return raf.apply(this,arguments)};window.MutationObserver=function(cb){W.mo++;return new MO(cb)};window.MutationObserver.prototype=MO.prototype;
  EventTarget.prototype.addEventListener=function(){W.ls++;return ael.apply(this,arguments)};
  const t0=performance.now();const iv=si(()=>{const m=document.getElementById('mainMenu');if(m&&!m.hidden&&!W.menuAt){W.menuAt=performance.now();W.atMenu={...W}}if(window.FLAVIUS_READY&&!W.readyAt){W.readyAt=performance.now();W.atReady={si:W.si,st:W.st,raf:W.raf,mo:W.mo,ls:W.ls}}},10)};
(async()=>{const b=await chromium.launch();const res={runs:[]};
 for(let r=0;r<RUNS;r++){const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,x=>x.abort());await pg.addInitScript(INIT);
  const tr=path.join(os.tmpdir(),'perf100-boot.json');await b.startTracing(pg,{path:tr,categories:['devtools.timeline','v8','disabled-by-default-v8.compile','blink.user_timing','loading']});
  await pg.goto(await serve(path.join(R,'flavius-arena.html')));await pg.waitForFunction(()=>window.__B.readyAt&&window.__B.menuAt,null,{timeout:90000}).catch(()=>{});
  const nav=await pg.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),menu:Math.round(window.__B.menuAt),ready:Math.round(window.__B.readyAt),
    nodes:document.getElementsByTagName('*').length,heapMB:+(performance.memory?performance.memory.usedJSHeapSize/1e6:0).toFixed(1),B:window.__B,res:performance.getEntriesByType('resource').length,
    resKB:Math.round(performance.getEntriesByType('resource').reduce((a,e)=>a+(e.transferSize||e.encodedBodySize||0),0)/1024)}});
  await b.stopTracing();const ev=JSON.parse(fs.readFileSync(tr)).traceEvents;const agg={};for(const e of ev){if(e.ph!=='X'||!e.dur)continue;if(!/Compile|Parse|EvaluateScript|v8.run|FunctionCall|ParseHTML|UpdateLayoutTree|Layout|Paint|Decode/.test(e.name))continue;agg[e.name]=agg[e.name]||{n:0,ms:0};agg[e.name].n++;agg[e.name].ms+=e.dur/1000}
  for(const k in agg)agg[k].ms=Math.round(agg[k].ms);nav.trace=agg;res.runs.push(nav);await pg.close()}
 /* instrumented: per-module top-level time */
 const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,x=>x.abort());await pg.addInitScript(INIT);
 await pg.goto(await serve(path.join(R,'.perf100-boot.html')));await pg.waitForFunction(()=>window.__B.readyAt,null,{timeout:90000}).catch(()=>{});
 res.mods=await pg.evaluate(()=>{const m=performance.getEntriesByType('mark').filter(x=>x.name.startsWith('M>'));const o=[];for(let i=0;i<m.length-1;i++)o.push([m[i].name.slice(2),+(m[i+1].startTime-m[i].startTime).toFixed(1)]);
   return {first:+m[0].startTime.toFixed(0),end:+m[m.length-1].startTime.toFixed(0),total:+(m[m.length-1].startTime-m[0].startTime).toFixed(0),top:o.sort((a,b)=>b[1]-a[1]).slice(0,25),n:o.length,over5:o.filter(x=>x[1]>5).length,under1:o.filter(x=>x[1]<1).length,
     readyAt:Math.round(window.__B.readyAt),menuAt:Math.round(window.__B.menuAt||0)}});
 await b.close();console.log(JSON.stringify(res,null,1));fs.writeFileSync(path.join(__dirname,'boot.json'),JSON.stringify(res,null,1))})();

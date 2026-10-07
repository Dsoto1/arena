/* v0.95 perf: Chrome trace totals by event (incl. image decodes). node tools/perf95/trace.js <page> '{"speed":"fast","spect":1,"secs":8}' */
const {chromium}=require('playwright');
const path=require('path');
const PAGE=path.resolve(process.argv[2]||'flavius-arena.html');
const SCEN=JSON.parse(process.argv[3]||'{"speed":"normal","spect":1,"secs":8}');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());
await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},JSON.parse(process.env.LS||'{}')); /* LS='{"flavius_perf95off":"1"}' sets page flags */
await pg.goto(await require('./serve.js')(PAGE));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async sc=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:sc.spect?{}:{spect:0}});
  for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8)break}
  SPEED=sc.speed;setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},300)},SCEN);
await pg.waitForTimeout(2000);const TURN0=await pg.evaluate(()=>S.turnNo);
await b.startTracing(pg,{path:(process.env.TRACE_OUT||require('os').tmpdir()+'/perf95-trace.json'),categories:['devtools.timeline','disabled-by-default-devtools.timeline']});
await pg.waitForTimeout(SCEN.secs*1000);await b.stopTracing();
const ev=JSON.parse(require('fs').readFileSync((process.env.TRACE_OUT||require('os').tmpdir()+'/perf95-trace.json'))).traceEvents;
const main=ev.filter(e=>e.name==='TracingStartedInBrowser'||1);const agg={};const tn0={};for(const e of ev)if(e.ph==='M'&&e.name==='thread_name')tn0[e.pid+':'+e.tid]=e.args.name;{const c=ev.filter(e=>e.ph==='X'&&e.name==='Commit'&&tn0[e.pid+':'+e.tid]==='CrRendererMain');console.log('COMMIT '+JSON.stringify({n:c.length,ms:Math.round(c.reduce((a,e)=>a+e.dur/1000,0)),avg:+(c.reduce((a,e)=>a+e.dur/1000,0)/Math.max(1,c.length)).toFixed(1)}))}
for(const e of ev){if(e.ph!=='X'||!e.dur)continue;const k=e.name;agg[k]=agg[k]||{n:0,ms:0};agg[k].n++;agg[k].ms+=e.dur/1000}
console.log(Object.entries(agg).sort((a,b)=>b[1].ms-a[1].ms).slice(0,25).map(([k,v])=>`${v.ms.toFixed(0).padStart(7)}ms ${String(v.n).padStart(6)} ${k}`).join('\n'));
const cs={};for(const e of ev){if(e.name==='UpdateLayoutTree'&&e.args&&e.args.elementCount){cs.n=(cs.n||0)+1;cs.el=(cs.el||0)+e.args.elementCount}}console.log('style recalcs',cs);{const d=ev.filter(e=>e.name==='Decode Image'||e.name==='Decode LazyPixelRef');console.log('DECODES '+JSON.stringify({n:d.length,perS:+(d.length/SCEN.secs).toFixed(2),ms:Math.round(d.reduce((a,e)=>a+(e.dur||0)/1000,0))}))}
{/* CPU time (thread time, not wall: robust on a loaded machine) of the renderer's top-level tasks, by thread, per second; turns played */
  const tn={};const rp=new Set();for(const e of ev)if(e.ph==='M'&&e.name==='thread_name'){tn[e.pid+':'+e.tid]=e.args.name;if(e.args.name==='CrRendererMain')rp.add(e.pid)}const cpu={};
  for(const e of ev){if(e.ph!=='X'||e.name!=='RunTask'||e.tdur==null||!rp.has(e.pid))continue;const n=tn[e.pid+':'+e.tid]||'?';if(!/CrRendererMain|Compositor|Raster|ImageDecode|ThreadPool/.test(n))continue;const k=/CrRendererMain/.test(n)?'main':/Compositor/.test(n)?'comp':'pool';cpu[k]=(cpu[k]||0)+e.tdur/1000}
  for(const k in cpu)cpu[k]=Math.round(cpu[k]/SCEN.secs);const turns=await pg.evaluate(()=>S.turnNo)-TURN0;console.log('CPU '+JSON.stringify({msPerS:cpu,turns,msPerTurn:Math.round((cpu.main||0)*SCEN.secs/Math.max(1,turns))}))}
await b.close()})();

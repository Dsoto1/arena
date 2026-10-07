/* v0.95 perf: fps, frame p50/p95, long tasks, busy %, hot functions (CDP sampling). node tools/perf95/prof.js <page> '{"speed":"fast","spect":1,"secs":15}' */
const {chromium}=require('playwright');
const path=require('path');
const PAGE=path.resolve(process.argv[2]||'flavius-arena.html');
const SCEN=JSON.parse(process.argv[3]||'{"speed":"normal","spect":1,"secs":25}');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto(await require('./serve.js')(PAGE));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const cdp=await pg.context().newCDPSession(pg);await cdp.send('Performance.enable');
await pg.evaluate(async sc=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  window.PRF95X={n:{},ms:{},frames:[],long:[]};
  const wrap=k=>{const f=window[k];if(typeof f!=='function')return;window[k]=function(){const t=performance.now();try{return f.apply(this,arguments)}finally{const d=performance.now()-t;PRF95X.n[k]=(PRF95X.n[k]||0)+1;PRF95X.ms[k]=(PRF95X.ms[k]||0)+d}}};
  ['render','draw','renderBubbles','log','caption','renderTurnInd','sideApply','standsDrawerHTML','drawStands','drawFX','spectatorsAct','computeHL','renderBoard','boardHTML','avatarSVG','MGR_REDRAW'].forEach(wrap);
  new PerformanceObserver(l=>l.getEntries().forEach(e=>PRF95X.long.push(e.duration))).observe({entryTypes:['longtask']});
  startEvent({ev:'democritus',loc:6,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:sc.spect?{}:{spect:0}});
  for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8)break}
  SPEED=sc.speed;window.PRF95X.t0=performance.now();for(const k in PRF95X.n){PRF95X.n[k]=0;PRF95X.ms[k]=0}PRF95X.long.length=0;
  let last=performance.now();const tick=()=>{const t=performance.now();PRF95X.frames.push(t-last);last=t;if(!PRF95X.stop)requestAnimationFrame(tick)};requestAnimationFrame(tick);
  setInterval(()=>{if(CUR_MODAL&&!PRF95X.stop)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},300);
},SCEN);
await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});await cdp.send('Profiler.start');const m0=(await cdp.send('Performance.getMetrics')).metrics;await pg.waitForTimeout(SCEN.secs*1000);const {profile}=await cdp.send('Profiler.stop');{const self={};const byId={};profile.nodes.forEach(n=>byId[n.id]=n);const dt=profile.timeDeltas;profile.samples.forEach((id,i)=>{const n=byId[id];const k=(n.callFrame.functionName||'(anon)')+' '+(n.callFrame.url||'').split('/').pop().slice(0,12)+':'+n.callFrame.lineNumber;self[k]=(self[k]||0)+(dt[i]||0)});const top=Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,30);console.log(top.map(([k,v])=>(v/1000).toFixed(0).padStart(6)+'ms '+k).join('\n'))}const m1=(await cdp.send('Performance.getMetrics')).metrics;
const met=(m,k)=>m.find(x=>x.name===k).value;
const r=await pg.evaluate(()=>{PRF95X.stop=1;const f=PRF95X.frames.slice(1).sort((a,b)=>a-b);const q=p=>f[Math.floor(f.length*p)]||0;const el=(performance.now()-PRF95X.t0)/1000;
  const fn={};for(const k in PRF95X.n)if(PRF95X.n[k])fn[k]=`${(PRF95X.n[k]/el).toFixed(1)}/s ${(PRF95X.ms[k]/PRF95X.n[k]).toFixed(1)}ms avg ${(PRF95X.ms[k]/el/10).toFixed(1)}%`;
  let lay=null;try{const R=LAYERS93.report();lay=R.rows.slice(0,14).map(x=>`${x.name}:${x.ms??x.paintMs}`).join(' ')}catch(e){}
  return {fps:(PRF95X.frames.length/el).toFixed(0),p50:q(.5).toFixed(0),p95:q(.95).toFixed(0),over50:f.filter(x=>x>50).length,long:PRF95X.long.length,longMs:Math.round(PRF95X.long.reduce((a,b)=>a+b,0)),round:S.ri,turns:S.turnNo||S.turn,spect:(S.spect||[]).length,fn,lay}});
r.busyPct=Math.round((met(m1,'TaskDuration')-met(m0,'TaskDuration'))*100/SCEN.secs);r.layout=Math.round((met(m1,'LayoutDuration')-met(m0,'LayoutDuration'))*1000);r.style=Math.round((met(m1,'RecalcStyleDuration')-met(m0,'RecalcStyleDuration'))*1000);r.script=Math.round((met(m1,'ScriptDuration')-met(m0,'ScriptDuration'))*1000);
console.log(JSON.stringify({SCEN,...r},null,1));await b.close()})();

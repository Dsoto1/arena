/* v0.99 ONE FACE phase 2 — list screens before/after: node tools/plans/face99/perf2.js <before.html> <after.html> [rounds]
   For each page: a seeded Manager world; each list screen (roster, recruiting, league, Your ludus, Studio characters list) redrawn 12 times
   (2 warm-ups) — the time from the redraw call to the next frame painted (layout + paint included, CDP TaskDuration per redraw), plus a 6 s
   scroll of the recruiting list (busy ms per second). Pages alternate per round so machine load hits both alike. */
const {chromium}=require('playwright');const path=require('path');
const pages=[process.argv[2],process.argv[3]].map(p=>path.resolve(p));const ROUNDS=+(process.argv[4]||2);
const metric=(m,k)=>m.find(x=>x.name===k).value;
(async()=>{const b=await chromium.launch();const res={};
for(let round=0;round<ROUNDS;round++)for(const P of pages){const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','0')});
  await pg.goto('file://'+P,{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  const cdp=await pg.context().newCDPSession(pg);await cdp.send('Performance.enable');
  const busy=async fn=>{const m0=(await cdp.send('Performance.getMetrics')).metrics;const t=Date.now();await fn();const m1=(await cdp.send('Performance.getMetrics')).metrics;return {task:(metric(m1,'TaskDuration')-metric(m0,'TaskDuration'))*1000,wall:Date.now()-t}};
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));let sd=95;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(600)});
  const name=P===pages[0]?'before':'after';const R=res[name]=res[name]||{};
  for(const tab of ['roster','recruit','league','ludus','studio']){
    await pg.evaluate(async tab=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(tab==='studio'){while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}menuHide();openStudio();await W8(800);ST.tab='chars';ST.view='list';
        for(let i=0;i<24;i++){const c=blankChar();c.name='Face '+i;c.portrait=randomPortrait(i%3===0);CUSTOM.chars.push(c)}studioRedraw();await W8(500)}else{MGR.tab=tab;MGR_REDRAW();await W8(400)}
      if(typeof R99!=='undefined')for(let i=0;i<300&&(R99.q.length||R99.busy);i++)await W8(100)},tab);
    const once=()=>pg.evaluate(async tab=>{if(tab==='studio')studioRedraw();else MGR_REDRAW();document.body.offsetHeight;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))},tab);
    await once();await once();const runs=[];for(let i=0;i<10;i++)runs.push((await busy(once)).task);runs.sort((a,b)=>a-b);
    const faces=await pg.evaluate(()=>document.querySelectorAll('.portrait,svg.sface').length);
    (R[tab]=R[tab]||[]).push({p50:+runs[5].toFixed(1),min:+runs[0].toFixed(1),faces})}
  /* scroll the recruiting list (the longest face list) */
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}menuHide();openManager();await W8(900);MGR.tab='recruit';MGR_REDRAW();await W8(800)});
  const sc=await busy(()=>pg.evaluate(async()=>{const box=document.getElementById('mBody');const t0=performance.now();let d=1;while(performance.now()-t0<6000){box.scrollTop+=d*40;if(box.scrollTop+box.clientHeight>=box.scrollHeight-2||box.scrollTop<=0)d=-d;await new Promise(r=>requestAnimationFrame(r))}}));
  (R.scroll=R.scroll||[]).push(Math.round(sc.task/(sc.wall/1000)));
  const ld=await pg.evaluate(()=>typeof R99!=='undefined'?{...R99.stats,entries:R99.map.size,buildMs:+FACE2.stats.buildMs.toFixed(0),builds:FACE2.stats.build}:null);if(ld)(R.cache=R.cache||[]).push(ld);
  await pg.close();console.error('done',name,round)}
console.log(JSON.stringify(res,null,1));await b.close()})();

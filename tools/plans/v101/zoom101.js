/* v1.01 G20 — the zoom hitch: A/B in ONE page (so machine load hits both alike). A paused 4-seat Democritus with 48 spectators; the Zoom button is
   clicked, 60 frames are timed, 1.2 s later it is clicked back; Z101.on = false (294's one big settle) vs true (321's one layer a frame), alternated N times.
   Prints per variant: the longest draw, the longest frame gap, the sum of draws over 60 frames, the slices. node tools/plans/v101/zoom101.js <page> [reps]
   (the page over http, like the site; relative numbers matter — absolute ones scale with the machine's load) */
const {chromium}=require('playwright');const serve=require('../../perf95/serve.js');
const PAGE=process.argv[2]||'flavius-arena.html',REPS=+(process.argv[3]||4);
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>console.log('PAGEERR',e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto(await serve(PAGE),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed:11,seats:['hero','soldier','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:48}});
  for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8&&cur()===S.players[0]&&!S.busy)break}
  SPEED='pause';await W8(2500)});
const R={false:[],true:[]};
for(let rep=0;rep<REPS;rep++)for(const on of [false,true]){
  const r=await pg.evaluate(async on=>{const raf=()=>new Promise(r=>requestAnimationFrame(r));const W8=ms=>new Promise(r=>setTimeout(r,ms));Z101.on=on;const out=[];
    for(const lab of ['in','out']){const ds=[],gaps=[];const d0=draw;draw=function(){const t=performance.now();const r=d0.apply(this,arguments);ds.push(performance.now()-t);return r};
      let last=performance.now();document.getElementById('btnZoom').click();for(let i=0;i<60;i++){await raf();const n=performance.now();gaps.push(n-last);last=n}
      draw=d0;await W8(1500);out.push({lab,maxDraw:Math.round(Math.max(...ds)),maxGap:Math.round(Math.max(...gaps)),sumDraw:Math.round(ds.reduce((a,x)=>a+x,0)),n:ds.length})}
    return out},on);R[on].push(...r)}
const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.floor((s.length-1)/2)]};
for(const on of [false,true]){const a=R[on];console.log((on?'sliced (321)':'one settle (294)').padEnd(16),'maxDraw med',med(a.map(x=>x.maxDraw)),'max',Math.max(...a.map(x=>x.maxDraw)),'| maxGap med',med(a.map(x=>x.maxGap)),'| sum of draws med',med(a.map(x=>x.sumDraw)),'| draws',med(a.map(x=>x.n)))}
for(const on of [false,true])for(const lab of ['in','out']){const a=R[on].filter(x=>x.lab===lab);console.log((on?'sliced':'one settle').padEnd(11),('zoom '+lab).padEnd(9),'maxDraw med',med(a.map(x=>x.maxDraw)),'| maxGap med',med(a.map(x=>x.maxGap)),'| sum of draws med',med(a.map(x=>x.sumDraw)))}
console.log(JSON.stringify(R));await b.close()})();

/* v1.01 (330-v101zoom2) — the zoom hitch with and without the idle pre-bake, A/B in ONE page (machine load hits both alike).
   A paused 4-seat Democritus with 48 spectators (your turn, nothing moving). Per variant and rep: wait IDLE ms (the pre-bake's chance), click 🔍,
   time every frame for WIN ms (the 1.1 s ease + the settle), wait, click back, the same. Then a PINCH: CAM.z stepped 1 → 1.3 (not the 🔍 level) over 20 frames, held, timed.
   Prints per variant: worst draw, worst frame gap, the sum of draws, stone-reference / tiles builds during the window, and the pre-bake's slices.
   node tools/perf95/zoombake.js <page> [reps]   (http like the site; relative numbers matter) */
const {chromium}=require('playwright');const serve=require('./serve.js');
const PAGE=process.argv[2]||'flavius-arena.html',REPS=+(process.argv[3]||3),IDLE=+(process.env.IDLE||2500),WIN=+(process.env.WIN||2200);
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>console.log('PAGEERR',e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto(await serve(PAGE),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed:11,seats:['hero','soldier','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:48}});
  for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8&&cur()===S.players[0]&&!S.busy)break}
  SPEED='pause';await W8(2500)});
const VARS=[false,true];const R={false:[],true:[]};
for(let rep=0;rep<REPS;rep++)for(const on of VARS){
  const r=await pg.evaluate(async([on,IDLE,WIN])=>{const raf=()=>new Promise(r=>requestAnimationFrame(r));const W8=ms=>new Promise(r=>setTimeout(r,ms));
    if(typeof ZB101!=='undefined'){ZB101.on=on;ZB101.drop()}const out=[];
    const cnt=()=>{const o={z99:Z99.stats.builds,t96:TILES96.builds,wear:typeof WEAR91!=='undefined'?WEAR91.bakes:0};const C=typeof LAYERS93!=='undefined'?LAYERS93.cache||{}:{};
      for(const k of ['under','deco','top','light'])o[k]=C[k]?C[k].misses:0;return o};
    const diff=(a,b)=>Object.keys(b).filter(k=>b[k]!==a[k]).map(k=>k+(b[k]-a[k]>1?'×'+(b[k]-a[k]):'')).join(',');
    const timed=async(lab,act)=>{await W8(IDLE);const ds=[],gaps=[];const c0=cnt(),s0=typeof ZB101!=='undefined'?ZB101.stats.swaps:0;const d0=draw;let worst={ms:0,w:''};
      draw=function(){const a=cnt();const t=performance.now();const r=d0.apply(this,arguments);const ms=performance.now()-t;ds.push(ms);if(ms>worst.ms)worst={ms:Math.round(ms),w:diff(a,cnt())};return r};
      let last=performance.now();const t0=last;let run=true;const rec=(async()=>{while(run){await raf();const n=performance.now();gaps.push(n-last);last=n}})();
      await act();while(performance.now()-t0<WIN)await W8(50);run=false;await rec;
      draw=d0;const c1=cnt();out.push({lab,maxDraw:Math.round(Math.max(0,...ds)),maxGap:Math.round(Math.max(...gaps)),sumDraw:Math.round(ds.reduce((a,x)=>a+x,0)),n:ds.length,
        built:diff(c0,c1),worst:worst.ms+':'+worst.w,swaps:typeof ZB101!=='undefined'?ZB101.stats.swaps-s0:0})};
    await timed('in',async()=>document.getElementById('btnZoom').click());
    await timed('out',async()=>document.getElementById('btnZoom').click());
    await timed('pinch',async()=>{for(let i=1;i<=20;i++){CAM.z=1+0.3*i/20;S.zoomIn=true;draw();await raf()}});
    CAM.z=null;S.zoomIn=false;draw();await W8(1500);return out},[on,IDLE,WIN]);R[on].push(...r)}
const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.floor((s.length-1)/2)]};
for(const on of VARS)for(const lab of ['in','out','pinch']){const a=R[on].filter(x=>x.lab===lab);
  console.log((on?'pre-bake ON ':'pre-bake OFF').padEnd(13),lab.padEnd(6),'worst draw med',med(a.map(x=>x.maxDraw)),'max',Math.max(...a.map(x=>x.maxDraw)),'| worst gap med',med(a.map(x=>x.maxGap)),
    '| sum of draws med',med(a.map(x=>x.sumDraw)),'| swaps',med(a.map(x=>x.swaps)));for(const x of a)console.log('     built',x.built,'| worst draw',x.worst)}
const st=await pg.evaluate(()=>typeof ZB101!=='undefined'?ZB101.stats:null);console.log('ZB101.stats',JSON.stringify(st));
if(process.env.RAW)console.log(JSON.stringify(R));await b.close()})();

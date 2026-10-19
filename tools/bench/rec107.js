/* tools/bench/rec107.js — v1.07 beta 3: the in-game recorder (405 REC107) driven by a script, as the owner would use it, so a run here
   gives the same report file he sends. An all-CPU Play Now match (Democritus at Pompeii, seed 4242, 8 CPU seats) at --speed (fast),
   --warm seconds of play first, then --secs of recording; prints a digest (areas, long tasks with their areas, counts and who asked).
     node tools/bench/rec107.js <page> [--gpu] [--speed fast] [--z 1] [--dpr 1] [--warm 6] [--secs 10] [--ls k=v,…] [--pre 'js to run before recording'] [--json FILE]
   --gpu = Chromium's GPU path on SwiftShader (accelerated 2D canvas, GPU raster, real scrollbars). */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]||'flavius-arena.html');
const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};const flag=k=>A.includes('--'+k);
const LS={flavius_light106auto:'0',flavius_light106:'full'};for(const kv of String(opt('ls','')).split(',').filter(Boolean)){const i=kv.indexOf('=');LS[kv.slice(0,i)]=kv.slice(i+1)}
const GPU=['--use-gl=angle','--use-angle=swiftshader','--enable-gpu-rasterization','--ignore-gpu-blocklist','--enable-accelerated-2d-canvas','--enable-unsafe-swiftshader'];
(async()=>{const serve=require(path.join(__dirname,'..','perf95','serve.js'));const url=await serve(PAGE);
  const b=await chromium.launch(flag('gpu')?{args:GPU,ignoreDefaultArgs:['--hide-scrollbars']}:{ignoreDefaultArgs:['--hide-scrollbars']});
  const cx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:+opt('dpr',1)});await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in ls)localStorage.setItem(k,ls[k])},LS);
  const pg=await cx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.goto(url,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
  const res=await pg.evaluate(async o=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
    while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
    const cls=['soldier','hero','royalty','venatore','amazonia','veteranus','slave','damnatio'];
    startEvent({ev:'democritus',loc:6,seed:4242,seats:cls.map(c=>({cls:c,cpu:true})),opts:{}});SPEED=o.speed;
    for(let i=0;i<200;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6)break}setInterval(close,300);
    if(o.z>=1.9){CAM.z=o.z;S.zoomIn=true}else if(o.z>1)S.zoomIn=true;
    SETTINGS.fps100=true;applySettings();await W8(o.warm*1000);
    if(o.pre)(0,eval)(o.pre);if(typeof REC107==='undefined')return null;REC107.secs=o.secs;rec107Start();await W8(o.secs*1000+600);const r=REC107.res;if(!r)return null;return {...r,frames:{...r.frames,intervals:undefined}}},
    {pre:opt('pre',''),speed:opt('speed','fast'),z:+opt('z',1),warm:+opt('warm',6),secs:+opt('secs',10)});
  if(!res){console.log('no report (405 off?)');process.exit(1)}
  console.log(`${flag('gpu')?'GPU':'plain'} speed ${res.speed} z ${res.zoom} dpr ${res.dpr} light ${res.light} · fps ${res.frames.fps} p50 ${res.frames.p50} p95 ${res.frames.p95} max ${res.frames.max} >50ms ${res.frames.over50}/${res.frames.n} · turns ${res.event&&res.event.turns}`);
  console.log('areas ms/s: '+Object.entries(res.areas).sort((a,b)=>b[1].ms-a[1].ms).map(([k,v])=>`${k} ${v.perS} (${v.calls}x, max ${v.max})`).join(' · '));
  const lt=res.longTasks;console.log(`long tasks ${lt.length} · ${lt.reduce((s,l)=>s+l.ms,0)} ms`);for(const l of lt.slice().sort((a,b)=>b.ms-a.ms).slice(0,8))console.log(`   ${l.ms} ms @${l.t} ${JSON.stringify(l.areas)}`);
  for(const f of res.longFrames.slice().sort((a,b)=>b.ms-a.ms).slice(0,5))console.log(`   LoAF ${f.ms} ms blocking ${f.blocking} render ${f.render} style+layout ${f.styleLayout} scripts ${JSON.stringify(f.scripts.slice(0,4))}`);
  for(const [k,v] of Object.entries(res.counts))console.log(`   count ${k} ${v.n}x ${v.ms?v.ms.toFixed(1)+'ms':''} ${JSON.stringify(Object.entries(v.by||{}).sort((a,b)=>b[1]-a[1]).slice(0,5))}`);
  console.log('ERRS',JSON.stringify(errs));if(opt('json',''))fs.writeFileSync(opt('json',''),JSON.stringify(res,null,1));await b.close();process.exit(errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});

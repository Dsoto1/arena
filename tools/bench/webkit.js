/* tools/bench/webkit.js — v1.07 beta 4: his Safari reports (tools/plans/v107/PERF.md "beta 4") replayed in a WebKit (or Chromium) page.
   A Play Now match like his (Democritus at Pompeii, seed 4242, 4 seats: 1 human + 3 CPU, Lighting Light, Animations On), 1920×990 at DPR 2,
   recorded with the in-game recorder (405 REC107) for --secs: once PAUSED (the human's turn, CPU paused) and once at SLOW (the CPUs play).
   Each config runs with every --ab variant: a #perf=… hash (406's page-load-only kill switches), "" = the page as shipped.
     node tools/bench/webkit.js <page> [--browser webkit|chromium] [--configs pause,slow] [--ab ',v107safarioff'] [--warm 4] [--secs 10]
       [--w 1920] [--h 990] [--dpr 2] [--sug 0|1] [--json FILE]
   paused: when the Guide's hint is a button (no gold tile), --sug 1 (default) puts its gold tile on 6,6 — his paused report drew the board every frame.
   --ab is a ';'-separated list of hash variants, each a ','-separated switch list ('' = none), e.g. --ab ';v107safarioff;v107safarioff,v107perfoff'.
   Prints fps / frame p50 / p95 / max, the recorder's areas and counts, the page's canvases and running CSS animations, per run.
   WebKit on Linux has no GPU (software canvas), so the fps are not his Mac's; the WebKit-only CSS / canvas costs and the cache churn show. */
const pw=require('playwright');const fs=require('fs'),path=require('path');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]&&!A[0].startsWith('--')?A[0]:'flavius-arena.html');
const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};
const BR=opt('browser','webkit'),CONF=String(opt('configs','pause,slow')).split(',').filter(Boolean),AB=String(opt('ab',';v107safarioff')).split(';');
const W=+opt('w',1920),H=+opt('h',990),DPR=+opt('dpr',2),WARM=+opt('warm',4),SECS=+opt('secs',10);
(async()=>{const serve=require(path.join(__dirname,'..','perf95','serve.js'));const url=await serve(PAGE);
  const b=await pw[BR].launch(BR==='chromium'?{ignoreDefaultArgs:['--hide-scrollbars']}:{});const out=[];
  for(const conf of CONF)for(const ab of AB){
    const cx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:DPR});await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
    await cx.addInitScript(()=>{try{Object.defineProperty(navigator,'webdriver',{get:()=>false})}catch(e){}localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');
      localStorage.setItem('flavius_light106','light');localStorage.setItem('flavius_light106auto','0')});
    const pg=await cx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
    await pg.goto(url+(ab?'#perf='+ab:''),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
    const r=await pg.evaluate(async o=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
      while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
      const pause=o.conf==='pause';
      startEvent({ev:'democritus',loc:6,seed:4242,seats:[{cls:'soldier',cpu:!pause},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{}});
      /* paused like his report: the human's turn (the Guide's hints on), the CPUs paused; slow: the CPUs play */
      SPEED=pause?'fast':'slow';
      for(let i=0;i<900;i++){await W8(100);close();if(S&&S.phase!=='setup'&&i>6&&(!pause||(!cur().cpu&&(S.phase==='choice'||S.phase==='action')&&S.turnNo>1)))break}
      if(pause){SPEED='pause';try{render();if(!S.sugTile&&o.sug){S.sugTile={r:6,c:6};draw()}}catch(e){}}   /* --sug 0: no forged Guide tile when the hint is a button */setInterval(close,300);
      SETTINGS.fps100=true;applySettings();await W8(o.warm*1000);if(typeof REC107==='undefined')return null;REC107.secs=o.secs;rec107Start();await W8(o.secs*1000+700);
      const x=REC107.res;return x?{...x,frames:{...x.frames,intervals:undefined},slowFrames:undefined}:null},{conf,warm:WARM,secs:SECS,sug:opt('sug','1')!=='0'});
    if(!r){console.log(`${conf} [${ab||'as shipped'}] no report`);await cx.close();continue}
    const f=r.frames;console.log(`\n== ${BR} ${conf} [#perf=${ab||'(none)'}] switches ${JSON.stringify(r.switches||[])} · fps ${f.fps} p50 ${f.p50} p95 ${f.p95} max ${f.max} >50ms ${f.over50}/${f.n}`);
    console.log('areas ms/s: '+Object.entries(r.areas||{}).sort((a,b)=>b[1].ms-a[1].ms).map(([k,v])=>`${k} ${v.perS} (${v.calls}x)`).join(' · '));
    console.log('counts: '+Object.entries(r.counts||{}).map(([k,v])=>`${k} ${v.n}${v.ms?' '+Math.round(v.ms)+'ms':''}`).join(' · '));
    for(const [k,v] of Object.entries(r.counts||{}))if(v.by)console.log(`   ${k} by ${JSON.stringify(Object.entries(v.by).sort((a,b)=>b[1]-a[1]).slice(0,4))}`);
    if(r.page)console.log(`page: cssAnims ${r.page.cssAnims} ${JSON.stringify(r.page.animOn||[])} · canvases>256 ${JSON.stringify(r.page.canvases)} · drawn/frame ${r.page.drawnPerFrame} (${JSON.stringify(r.page.drawnKinds||{})})`);
    console.log(`p107 ${JSON.stringify(r.p107)} p107b ${JSON.stringify(r.p107b)} safari ${JSON.stringify(r.p107s||null)}`);
    console.log('ERRS',JSON.stringify(errs));out.push({browser:BR,conf,ab,res:r,errs});await cx.close()}
  if(opt('json',''))fs.writeFileSync(opt('json',''),JSON.stringify(out,null,1));await b.close();process.exit(out.some(o=>o.errs.length)?1:0)})().catch(e=>{console.error(e);process.exit(2)});

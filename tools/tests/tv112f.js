/* v1.12 FIGURES FROM TURN ONE (428-v112fig). Checks:
   1 SAME PIXELS: one custom figure (a soldier with a trident) — 311's main-thread AN100L.render vs 428's f112Render (three.js here, the
     pixel passes in the Worker): the move sheet's idle row and a severed (rarm) idle row, figure + ground shadow, pixel for pixel, same metas;
   2 A CUSTOM-LOOK MATCH on the WebKit path (flavius_v107safariforce=1, flavius_anim100dev=1): the warm-up starts at the briefing, waits at
     most 3 s (+ slack), the first turn follows; the seat's figure is drawn as the still while its sheet bakes, then its device sheet
     replaces it; the bake ran in the Worker (no main-thread getImageData / canvas copies from tok93 sheetSteps / 311 shadowRow / grab /
     halve / alphaBox); the recorder's v112f block;
   3 A4a — the same on WebKit WITHOUT the Worker path (flavius_v112fignowk=1): it bakes on the main thread inside the warm-up only; once the
     match starts the bake stops at its next frame and is parked (no more main-thread bake pixel passes), the still stays;
   4 the kill switch (flavius_v112figoff=1): 311's own pump (its pixel passes on the main thread mid-match), nothing of 428 installed.
   Prints the main-thread 2D bake ms per 10 s (old vs new). node tools/tests/tv112f.js <page> → ERRS [] and exit 0. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m);console.log((c?'ok   ':'FAIL ')+String(m).slice(0,500))};
const open=async ls=>{const cx=await b.newContext({viewport:{width:1440,height:900}});await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());const pg=await cx.newPage();
  pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');localStorage.setItem('flavius_anim100dev','1');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  await pg.goto('file://'+page,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
  /* the main-thread 2D pixel passes of a bake: getImageData / drawImage called from tok93's sheetSteps helpers or 311's shadowRow */
  await pg.evaluate(()=>{const P=CanvasRenderingContext2D.prototype,gi=P.getImageData,di=P.drawImage;const B=window.__bk={n:0,ms:0,gid:0,log:[]};
    const from=()=>{const s=String(new Error().stack);return /\b(alphaBox|grab|halve|shadowRow|sheetSteps|shadowSheet)\b/.test(s)};
    P.getImageData=function(){const t=performance.now();try{return gi.apply(this,arguments)}finally{if(from()){B.n++;B.gid++;B.ms+=performance.now()-t;B.log.push([performance.now(),performance.now()-t])}}};
    P.drawImage=function(s){if(!(s instanceof HTMLCanvasElement||(typeof OffscreenCanvas!=='undefined'&&s instanceof OffscreenCanvas)))return di.apply(this,arguments);const t=performance.now();try{return di.apply(this,arguments)}finally{if(from()){B.n++;B.ms+=performance.now()-t;B.log.push([performance.now(),performance.now()-t])}}}});
  return {cx,pg}};
/* a 4-seat CPU match whose seat 0 (a soldier) carries a trident: a gear-true figure baked on this device */
const START=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  const gl=giveLoadout;giveLoadout=function(p){const r=gl.apply(this,arguments);try{if(p&&p.id===0)p.wR=mkW('trident')}catch(e){}return r};
  SETTINGS.briefing=false;const t0=performance.now();
  startEvent({ev:'democritus',loc:6,seed:99,seats:[{cls:'soldier',cpu:true},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  for(let i=0;i<200&&!(S&&S.turnNo>=1);i++){await W8(50);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  const tTurn=Math.round(performance.now()-t0);giveLoadout=gl;SPEED='pause';window.__iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},300);
  const P=S.players[0],g=AN100.gear.get(P)||{};const key=[...AN100.dev.keys()].find(k=>!/:/.test(k.slice(2)));
  return {tTurn,kit:g.kit,key,devKeys:[...AN100.dev.keys()],warm:typeof F112!=='undefined'?{...F112.st.warm,on:F112.on,slice:Math.round(F112.st.slice),cur:F112.warm&&{waitMs:Math.round(F112.warm.waitMs||0),keys:[...F112.warm.keys]}}:null}};
/* draw a few frames and say what seat 0 wore */
const LOOK=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));AN100.trace=[];for(let i=0;i<6;i++){draw();await W8(40)}const P=S.players[0];
  const src=[...new Set(AN100.trace.filter(x=>x.id===P.id&&x.src).map(x=>x.src))];AN100.trace=null;return {src,still:typeof F112!=='undefined'?{n:F112.st.stills.n,pend:[...F112.stillT.keys()]}:null}};
/* bake on for up to `secs`, stopping when seat 0's move sheet landed; the 2D bake passes on the main thread per 10 s */
const BAKE=async([key,secs,stopPark])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const B=window.__bk;const n0=B.n,ms0=B.ms,t0=performance.now();
  for(;;){const s=AN100.dev.get(key);if(s&&s.ready)break;if(AN100.devFail)break;if(stopPark&&F112.park.length)break;if(performance.now()-t0>secs*1000)break;draw();await W8(250)}
  const el=performance.now()-t0,s=AN100.dev.get(key);return {ready:!!(s&&s.ready),secs:+(el/1000).toFixed(1),n:B.n-n0,ms:Math.round(B.ms-ms0),per10:+((B.ms-ms0)*10000/el).toFixed(1),fail:AN100.devFail,
    log:(AN100.stats.renderLog||[]).slice(-4)}};

/* ---- 1 same pixels ---- */
{const {cx,pg}=await open({});
  const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}
    const C0=CLASSES.soldier;const parts={look:Object.assign({},AN100_LOOK.soldier,{cloth:CLOTH100.soldier||''}),gear:an100GearOf(C0.armor.map(x=>[x[0],x[1]]),'trident',null)};
    const api=await t93Load();api.apply({look:parts.look,gear:parts.gear,pose:api.presets[0][2],grip:{}});const LT=an100Light();
    const diff=(x,y)=>{if(!x||!y||x.length!==y.length)return 'size';let n=0,mx=0;for(let i=0;i<x.length;i++){const d=Math.abs(x[i]-y[i]);if(d){n++;if(d>mx)mx=d}}return n?{n,mx}:0};
    const px=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    await AN100L.render(api,'move',{pxmm:AN100_PX,ss:2,light:LT,shadow:{pxmm:AN100_PX/2,ss:2},rows:['idle']});   /* the very first render of a figure differs by a few pixels in itself (old vs old) */
    await f112Probe();const out={wOK:F112.wOK};
    for(const limb of ['','rarm']){const opt={pxmm:AN100_PX,ss:2,light:LT,shadow:{pxmm:AN100_PX/2,ss:2},rows:['idle'],limb:limb||undefined};
      const A=await AN100L.render(api,'move',opt);const C=f112Clock();const B=await f112Render(api,'move',Object.assign({},opt,{keep:1}),C);
      out[limb||'whole']={meta:JSON.stringify(A.meta)===JSON.stringify(B.meta),shmeta:JSON.stringify(A.sh.meta)===JSON.stringify(B.sh.m),fig:diff(px(A.canvas),new Uint8ClampedArray(B.pix.b)),
        sh:diff(px(A.sh.canvas),new Uint8ClampedArray(B.shpix.b)),size:[A.canvas.width,A.canvas.height,B.pix.w,B.pix.h],blob:B.b&&B.b.type,main:Math.round(C.ms)}}
    return out});
  ok(r.wOK===true,'1a the Worker path is there (OffscreenCanvas 2D in a Worker) '+JSON.stringify(r.wOK));
  for(const k of ['whole','rarm'])ok(r[k]&&r[k].meta&&r[k].shmeta&&r[k].fig===0&&r[k].sh===0&&r[k].blob==='image/webp','1b '+k+': the Worker sheet = the main-thread sheet, pixel for pixel (figure + shadow, metas) '+JSON.stringify(r[k]));
  await cx.close()}

/* ---- 2 a custom-look match on the WebKit path, the Worker bakes ---- */
let NEW={};{const {cx,pg}=await open({flavius_v107safariforce:'1'});
  const st=await pg.evaluate(START);ok(st.kit===false&&!!st.key,'2a seat 0 (trident) is a gear-true figure baked on this device '+JSON.stringify(st).slice(0,300));
  ok(st.warm&&st.warm.on&&st.warm.n===1&&st.warm.cur&&st.warm.cur.keys.includes(st.key),'2b the warm-up started before the first turn with seat 0\'s move sheet '+JSON.stringify(st.warm));
  ok(st.warm&&st.warm.waits===1&&st.warm.cur.waitMs<=3000+st.warm.slice+400&&st.tTurn<=3000+2*st.warm.slice+3000,'2c the wait after the briefing is at most 3 s (+ the bake slice running when it ran out: SwiftShader slices are seconds long), then the first turn '+JSON.stringify({wait:st.warm&&st.warm.cur.waitMs,slice:st.warm&&st.warm.slice,capped:st.warm&&st.warm.capped,tTurn:st.tTurn}));
  const l0=await pg.evaluate(LOOK);ok(!l0.src.includes(st.key)&&l0.still&&l0.still.n>=1&&l0.still.pend.includes(st.key),'2d meanwhile seat 0 wears the still / its class stand-in (counted) '+JSON.stringify(l0));
  const bk=await pg.evaluate(BAKE,[st.key,420,false]);
  const l1=await pg.evaluate(LOOK);
  const f=await pg.evaluate(()=>({st:{sheets:F112.st.sheets,wk:F112.st.wk,main:F112.st.main,mainMax:+F112.st.mainMax.toFixed(1),stills:F112.st.stills.n,stillMs:Math.round(F112.st.stills.ms)},rep:rec107Extra().v112f,lt:F112.st.log.slice(0,3)}));
  ok(bk.ready&&l1.src.length===1&&l1.src[0]===st.key&&l1.still.pend.length===0,'2e then its device sheet replaces the still '+JSON.stringify({bk,l1}));
  ok(f.st.wk>=1&&f.st.main===0&&bk.n===0,'2f the bake ran in the Worker: no main-thread getImageData / canvas copies from the bake '+JSON.stringify({f:f.st,n:bk.n,ms:bk.ms}));
  ok(f.rep&&f.rep.on===true&&f.rep.worker===true&&f.rep.sheets>=1&&f.rep.perSheet.length>=1&&typeof f.rep.mainBakeMs==='number'&&f.rep.stills>=1&&f.rep.stillSecs>0&&f.rep.warmWaits>=1,'2g the recorder\'s v112f block '+JSON.stringify(f.rep).slice(0,500));
  NEW={bk,f:f.st,wait:st.warm&&st.warm.cur.waitMs};await cx.close()}

/* ---- 3 A4a: WebKit without the Worker path ---- */
{const {cx,pg}=await open({flavius_v107safariforce:'1',flavius_v112fignowk:'1'});
  const st=await pg.evaluate(START);const w=await pg.evaluate(()=>({wOK:F112.wOK,warmOn:F112.warmOn}));
  ok(w.wOK===false&&w.warmOn===false&&st.warm&&st.warm.cur.waitMs<=3000+8000,'3a no Worker path; the warm-up window closed with the wait '+JSON.stringify({w,wait:st.warm&&st.warm.cur.waitMs}));
  const bk=await pg.evaluate(BAKE,[st.key,90,true]);
  const after=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const n0=window.__bk.n;for(let i=0;i<20;i++){draw();await W8(250)}
    return {n:window.__bk.n-n0,park:F112.park.length,parked:F112.st.parked,q:AN100.q.length,qa:AN100.qa.length,still:F112.st.stills.n,ready:[...AN100.dev.values()].some(s=>s.ready)}});
  ok(!bk.ready&&after.park>=1&&after.n===0&&after.still>=1&&!after.ready,'3b the bake stopped at its frame once the match began and is parked; no more main-thread bake passes; the still stays '+JSON.stringify({bk:{n:bk.n,secs:bk.secs},after}));
  await cx.close()}

/* ---- 4 the kill switch: 311's own pump, its pixel passes on the main thread ---- */
let OLD={};{const {cx,pg}=await open({flavius_v107safariforce:'1',flavius_v112figoff:'1'});
  const k=await pg.evaluate(()=>({on:F112.on,pump:an100Pump.toString().includes('an111Yield')&&!an100Pump.toString().includes('f112'),card:!!document.getElementById('fig112')}));
  ok(k.on===false&&k.pump,'4a kill switch: 428 not installed, 311\'s pump '+JSON.stringify(k));
  const st=await pg.evaluate(START);ok(!!st.key&&st.tTurn<2500,'4b no warm-up wait '+JSON.stringify({tTurn:st.tTurn}));
  const bk=await pg.evaluate(BAKE,[st.key,40,false]);ok(bk.n>0,'4c the old path runs its pixel passes on the main thread mid-match '+JSON.stringify({n:bk.n,ms:bk.ms,per10:bk.per10}));
  OLD={bk};await cx.close()}
console.log('BEFORE/AFTER main-thread 2D bake passes per 10 s (SwiftShader; Safari\'s ⏺ is the truth): old '+OLD.bk.per10+' ms ('+OLD.bk.n+' calls in '+OLD.bk.secs+' s) · new '+NEW.bk.per10+' ms ('+NEW.bk.n+' calls in '+NEW.bk.secs+' s); new worker sheets '+JSON.stringify(NEW.f)+' wait '+NEW.wait+' ms');
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

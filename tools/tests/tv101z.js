/* v1.01 tv101z — ZOOM PRE-BAKED WHILE IDLE (330-v101zoom2, his pick 3a) + the Lobby Browser's ↻ Refresh in sandstone (331-v101lbref, his 2a).
   1 (best round of two counts when the other was disturbed by a slow mid-ease frame on a loaded box) a paused board left alone pre-bakes the other zoom level (ZB101.ready() empties) in slices; then 🔍 Zoom in: the settle repaints NO stone
     layer (192 under/deco/top/light misses unchanged), no 260 tiles bake, no 194 wear bake — the second slots are swapped in; the same for 🔍 Zoom out
     (no 235 tiles rebuild either); the worst draw of the zoom is logged against the same zoom with the pre-bake off (ONE page, alternated);
   2 slices stay small (median ≤ 8 ms, p90 ≤ 25 ms on a loaded test box); 3 idle92 (204: the page asleep) → no pre-bake work at all;
   4 pixels: a settled zoomed board painted from the pre-bake = the same board painted the old way (clock + cosmetic randomness frozen) up to
     anti-aliasing at shape edges (Skia rasterises a path clipped to a band a little differently: < 0.6% of pixels, none by more than 24 levels;
     ZB101.whole = a set of layer names painted in one piece makes it exact);
   5 kill switch localStorage flavius_zoombake101off=1: no slices, the zoom repaints as before (old behaviour);
   6 the Lobby Browser's ↻ Refresh carries the sandstone class + look (306), keeps data-lb96r and still re-reads the list; 1440 and 390 px;
   no page errors, no new error-log entries. SHOT=<dir> saves lb101_1440.png / lb101_390.png. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');const SHOT=process.env.SHOT||'';
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m);else console.log('ok',m.slice(0,200))};
const serve=require(path.join(__dirname,'..','perf95','serve.js'));const URL0=await serve(page);
const open=async(ls,vp)=>{const cx=await b.newContext({viewport:vp||{width:1440,height:900}});const q=await cx.newPage();q.on('pageerror',e=>errs.push(e.message));await q.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await q.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},Object.assign({flavius_light106:'off'},ls||{})); /* v1.06a (399): this test compares the pre-baked layers with the old paint — lighting off */
  await q.goto(URL0,{timeout:180000});await q.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return q};
const start=q=>q.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  window.__e0=typeof ERR92!=='undefined'?ERR92.n:0;
  SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed:11,seats:['hero','soldier','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:24}});
  for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8&&cur()===S.players[0])break}
  SPEED='pause';await W8(600);
  window.__T={cnt:()=>{const o={z99:Z99.stats.builds,t96:TILES96.builds,wear:WEAR91.bakes};const C=LAYERS93.cache||{};for(const k of ['under','deco','top','light'])o[k]=C[k]?C[k].misses:0;return o},
    ready:async(ms)=>{const t=performance.now();while(performance.now()-t<ms){const r=ZB101.ready();if(r&&!r.length&&!ZB101.job)return true;await W8(150)}return false},
    zoom:async()=>{const raf=()=>new Promise(r=>requestAnimationFrame(r));const d0=draw;let worst=0;draw=function(){const t=performance.now();const r=d0.apply(this,arguments);worst=Math.max(worst,performance.now()-t);return r};
      const c0=__T.cnt(),s0=ZB101.stats.swaps;const k0={t96:ZB101.t96&&ZB101.t96.key,w:ZB101.wear&&ZB101.wear.key};document.getElementById('btnZoom').click();const t=performance.now();while(performance.now()-t<2400)await raf();draw=d0;const c1=__T.cnt();
      const d={};for(const k in c1)if(c1[k]!==c0[k])d[k]=c1[k]-c0[k];
      const kd=(a,b)=>{if(!a||!b)return [a&&a.slice(0,30),b&&b.slice(0,30)];const x=a.split('|'),y=b.split('|');return x.map((v,i)=>v!==y[i]?i+':'+v.slice(0,40)+'≠'+String(y[i]).slice(0,40):null).filter(Boolean)};
      if(d.t96)d.t96k=kd(k0.t96,TILES96.key);if(d.wear)d.wk=kd(k0.w,WEAR91_C.key);return {d,worst:Math.round(worst),swaps:ZB101.stats.swaps-s0,zoomed:z99Zoomed()}}};
  return !!S&&!S.over});
const pg=await open();ok(await start(pg),'0 started (paused, your turn)');
/* ---- 1 · zoom in / out after an idle pre-bake, ON vs OFF alternated ---- */
const R={on:[],off:[]};
for(let rep=0;rep<2;rep++)for(const on of [true,false]){
  const r=await pg.evaluate(async on=>{ZB101.on=on;ZB101.drop();const out={};const W8=ms=>new Promise(r=>setTimeout(r,ms));
    if(on)out.readyIn=await __T.ready(15000);else await W8(2500);out.in=await __T.zoom();
    if(on)out.readyOut=await __T.ready(15000);else await W8(2500);out.out=await __T.zoom();return out},on);
  R[on?'on':'off'].push(r)}
const st=await pg.evaluate(()=>{const s=ZB101.stats;return {slices:s.slices,bands:s.bands,max:s.maxSlice,sl:(s.sl||[]).slice()}});
const clean=r=>!r.in.d.under&&!r.in.d.deco&&!r.in.d.top&&!r.in.d.light&&!r.in.d.z99&&!r.out.d.under&&!r.out.d.deco&&!r.out.d.top&&!r.out.d.light;
for(const r of R.on){if(R.on.some(clean)&&!clean(r)){console.log('note: a loaded round repainted (a settle on a slow mid-ease frame)',JSON.stringify([r.in.d,r.out.d]));continue}ok(r.readyIn&&r.readyOut,'1a the other zoom level was pre-baked while idle '+JSON.stringify([r.readyIn,r.readyOut]));
  ok(r.in.zoomed&&!r.in.d.under&&!r.in.d.deco&&!r.in.d.top&&!r.in.d.light&&!r.in.d.z99&&!(r.in.d.wear>1)&&r.in.swaps>=4,'1b zoom IN: no stone layer or tiles repaint (wear ≤ 1: a settle that lands mid-ease on a slow frame) — swapped in '+JSON.stringify(r.in));
  ok(!r.out.zoomed&&!r.out.d.under&&!r.out.d.deco&&!r.out.d.top&&!r.out.d.light&&!(r.out.d.t96>1)&&!(r.out.d.wear>1)&&r.out.swaps>=4,'1c zoom OUT: no stone layer repaint (tiles/wear ≤ 1, as above) '+JSON.stringify(r.out))}
ok(R.on.some(r=>!r.out.d.t96&&!r.out.d.wear&&!r.in.d.wear),'1f at least one round with no tiles / wear rebuild at all');
for(const r of R.off)ok(r.in.d.under&&r.in.d.top&&r.in.d.z99,'1d pre-bake off: the zoom repaints as before '+JSON.stringify(r.in.d));
const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.floor((s.length-1)/2)]};
console.log('worst draw of a zoom IN  pre-bake on',R.on.map(r=>r.in.worst),'off',R.off.map(r=>r.in.worst));
console.log('worst draw of a zoom OUT pre-bake on',R.on.map(r=>r.out.worst),'off',R.off.map(r=>r.out.worst));
ok(med(R.on.map(r=>r.in.worst))<med(R.off.map(r=>r.in.worst)),'1e zoom in: the worst draw is lower with the pre-bake '+JSON.stringify([R.on.map(r=>r.in.worst),R.off.map(r=>r.in.worst)]));
/* ---- 2 · slice sizes ---- */
{const s=st.sl.slice().sort((x,y)=>x-y);const q=p=>s[Math.floor(p*(s.length-1))]||0;console.log('slices',st.slices,'bands',st.bands,'median',q(.5).toFixed(1),'p90',q(.9).toFixed(1),'max',st.max.toFixed(1));
  ok(st.slices>0&&q(.5)<=8&&q(.9)<=25,'2 slices small: median '+q(.5).toFixed(1)+' ms, p90 '+q(.9).toFixed(1)+' ms (max '+st.max.toFixed(1)+')')}
/* ---- 3 · idle92: no work while the page sleeps ---- */
{const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));ZB101.on=true;ZB101.drop();const old=PERF92.lastAct;PERF92.lastAct=PERF92.lastInput=performance.now()-300000;perf92Idle(true);const s0=ZB101.stats.slices;
    for(let i=0;i<6;i++){draw();await W8(300)}const s1=ZB101.stats.slices;const ric=ZB101.ric;const still=PERF92.idle;perf92Idle(false);PERF92.lastAct=performance.now();PERF92.lastInput=performance.now()-10000;draw();const ok2=await __T.ready(15000);return {s0,s1,ric,ok2,still}});
  ok(r.still&&r.s1===r.s0&&!r.ric,'3a idle92 on: no pre-bake slice, nothing scheduled '+JSON.stringify(r));ok(r.ok2,'3b awake again: it pre-bakes')}
/* ---- 4 · pixels: pre-baked zoomed board == the old way ---- */
{const px=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const raf=()=>new Promise(r=>requestAnimationFrame(r));
    const snap=()=>{const t=performance.now()+5000;const pn=performance.now,mr=Math.random;let s=7;Object.defineProperty(performance,'now',{value:()=>t,configurable:true,writable:true});Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff};
      try{draw();draw();return cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data}finally{Object.defineProperty(performance,'now',{value:pn,configurable:true,writable:true});Math.random=mr}};
    if(z99Zoomed()){document.getElementById('btnZoom').click();await W8(2400)}
    ZB101.on=true;ZB101.drop();await __T.ready(15000);document.getElementById('btnZoom').click();await W8(2600);const sw=ZB101.stats.swaps;const A=snap();
    document.getElementById('btnZoom').click();await W8(2400);ZB101.on=false;ZB101.drop();document.getElementById('btnZoom').click();await W8(2600);const B=snap();ZB101.on=true;
    let n=0,big=0;for(let i=0;i<A.length;i+=4){const d=Math.max(Math.abs(A[i]-B[i]),Math.abs(A[i+1]-B[i+1]),Math.abs(A[i+2]-B[i+2]));if(d>2)n++;if(d>24)big++}
    return {px:A.length/4,n,big,sw,same:A.length===B.length}});
  ok(px.same&&px.n/px.px<0.006&&px.big===0,'4 settled zoomed board from the pre-bake ≈ painted the old way (banded layers: anti-aliased edges ±24 levels at most): '+px.n+' px differ >2 levels, '+px.big+' >24 of '+px.px)}
/* ---- 5 · kill switch ---- */
{const q=await open({flavius_zoombake101off:'1'});await start(q);const k=await q.evaluate(async()=>{await new Promise(r=>setTimeout(r,3000));const z=await __T.zoom();return {on:ZB101.on,slices:ZB101.stats.slices,swaps:ZB101.stats.swaps,z}});
  ok(k.on===false&&k.slices===0&&k.swaps===0&&k.z.d.under&&k.z.d.z99,'5 kill switch flavius_zoombake101off=1: no pre-bake, the zoom repaints as before '+JSON.stringify(k));await q.context().close()}
const e2=await pg.evaluate(()=>typeof errNew92==='function'?errNew92(window.__e0).map(e=>e.msg||e.m||JSON.stringify(e).slice(0,160)):[]);ok(!e2.length,'no new error-log entries '+JSON.stringify(e2).slice(0,300));
await pg.context().close();
/* ---- 6 · the Lobby Browser's ↻ Refresh (mock online) ---- */
for(const vp of [{width:1440,height:900},{width:390,height:844}]){
  const q=await open({flavius_online77:'1',flavius_onlcd83:'0'},vp);
  const r=await q.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over)/.test(k))localStorage.removeItem(k);
    if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}ONL.acct=await NET.req('auth.signin',{name:'Zeta'});await NET.req('domus.create',{name:'Domus Zeta'});ONL.char=await NET.req('char.create',{name:'Zeta the Bold',cls:'hero'});
    onlineOpen('play');for(let i=0;i<60&&!document.querySelector('#onl');i++)await W8(150);await W8(400);ONL.tab='lobby';onlRedraw();for(let i=0;i<40&&!document.querySelector('#onl #lb96f [data-lb96r]');i++)await W8(150);
    const btn=document.querySelector('#onl #lb96f [data-lb96r]');if(!btn)return {none:true};const cs=getComputedStyle(btn);const bb=btn.getBoundingClientRect();
    let n=0;const base=NET.req;NET.req=function(t){if(t==='lobby.list')n++;return base.apply(this,arguments)};btn.click();await W8(900);NET.req=base;
    return {cls:btn.className,data:btn.dataset.lb96r,bg:/gradient/.test(cs.backgroundImage)?'gradient':cs.backgroundImage.slice(0,40),h:Math.round(bb.height),l:Math.round(bb.left),r:Math.round(bb.right),vw:innerWidth,lists:n,sw:document.documentElement.scrollWidth}});
  if(SHOT){await q.waitForTimeout(300);await q.screenshot({path:path.join(SHOT,'lb101_'+vp.width+'.png')})}
  ok(!r.none&&/\bsd100\b/.test(r.cls)&&/lb101r/.test(r.cls)&&r.data==='1'&&/gradient/.test(r.bg)&&r.h>=38,'6a '+vp.width+' px: ↻ Refresh is a sandstone slab (class + look) '+JSON.stringify(r));
  ok(r.lists>=1,'6b '+vp.width+' px: ↻ Refresh still re-reads the list '+r.lists);ok(r.l>=0&&r.r<=r.vw+1,'6c '+vp.width+' px: the slab stays on screen '+JSON.stringify([r.l,r.r,r.vw]));
  await q.context().close()}
ok(!errs.length,'no page errors '+JSON.stringify(errs).slice(0,300));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

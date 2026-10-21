/* v1.0 tv100z — ZOOMED CAMERA WITHOUT HITCHES (294-v100zoomcam; his note: the board still stutters zoomed in — the camera following
   the pieces, panning, pinching). One page (load hits every variant alike), paused board, the camera driven like 86's follow camera:
   1 a camera trip across the board (the 18% easing toward each corner, as at turn changes) repaints NO stone layer and no tiles cache
     (Z100 on), where 208's margin repainted all four layers several times (Z100 off) — the cause;
   2 frame budget relative to unzoomed: zoomed panning draw p50 ≤ 1.6× unzoomed + 2 ms, p95 ≤ 2.5× + 4 ms, and no draw over 6× its median
     + 12 ms (best of 3 rounds: a loaded test box spikes any one); a pinch (TW changing every frame) costs far less than before;
   3 pixels steady: frames aligned by the camera shift barely change while panning (stone layers included), fewer than with Z100 off;
     the whole-arena frame covers everything 208 painted (corner views, block means); a scaled pinch frame ≈ the crisp one at that zoom,
     and the crisp layers come back once the zoom holds;
   4 zooming mid-action (Normal + Fast): seeded dice and log unchanged by the zoom, nothing left pending, a settled zoomed board rebuilds
     nothing, at Normal second draws in one frame are folded; 5 kill switch localStorage flavius_zoomcam100off=1; no new errors. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m);else console.log('ok',m.slice(0,160))};
const open=async(ls)=>{const cx=await b.newContext({viewport:{width:1440,height:900}});const q=await cx.newPage();q.on('pageerror',e=>errs.push(e.message));await q.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await q.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  await q.goto(await require(path.join(__dirname,'..','perf95','serve.js'))(page),{timeout:180000});await q.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return q};
const start=(q,seed)=>q.evaluate(async seed=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
  for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>6)break}
  SPEED='pause';await W8(400);return !!S},seed);
const pg=await open();const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
ok(await start(pg,11),'0 started');
/* in-page helpers: the follow camera driven by hand, clock + cosmetic randomness frozen when asked */
await pg.evaluate(()=>{window.__T={};const T=window.__T;
  T.cf=camFocus;T.drive=on=>{camFocus=on?function(Wd,Hd){if(!S)return null;return {r:CAM.fr,c:CAM.fc,x:Wd/2,y:Hd*0.5}}:T.cf};
  T.trip=n=>{const G=[[1,1],[11,11],[1,11],[11,1],[6,6],[0,12]];let r=6,c=6;const p=[];for(let i=0;i<n;i++){const g=G[Math.floor(i*G.length/n)];r+=(g[0]-r)*0.18;c+=(g[1]-c)*0.18;p.push([r,c])}return p};
  T.freeze=()=>{let s=12345;const t=performance.now(),d=Date.now();T._pn=performance.now;T._dn=Date.now;T._mr=Math.random;Object.defineProperty(performance,'now',{value:()=>t,configurable:true,writable:true});
    Date.now=()=>d;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}};
  T.thaw=()=>{Object.defineProperty(performance,'now',{value:T._pn,configurable:true,writable:true});Date.now=T._dn;Math.random=T._mr};
  T.q=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.floor(p*(s.length-1))]}});

/* ---- 3a/3b first, on the fresh board ---- */
/* 3a aligned frames while panning (stands + stone + tiles; the crowd frozen) */
const still=on=>pg.evaluate(async on=>{const T=window.__T;Z100.on=on;S.zoomIn=true;CAM.z=null;T.drive(true);{const p0=T.trip(36)[0];CAM.fr=p0[0];CAM.fc=p0[1]}for(let i=0;i<15;i++){draw();await new Promise(r=>setTimeout(r,100))} /* the zoom eases to FREE_ZOOM first */const keep=['rim','stands','tiles','walls'] /* the layers this module caches (pillar shadows in 'floor' blend differently as the board moves, Z100 on or off) */;
  const others=LAYERS93.defs.map(d=>d[0]).filter(n=>!keep.includes(n));others.forEach(n=>LAYERS93.dbg.add(n));const P=T.trip(36);
  const sky=ar91SkyPaint;ar91SkyPaint=()=>{};if(AR91.L.sky){AR91.L.sky.key='';z99Drop(AR91.L.sky)} /* the sky is screen-fixed: it does not slide with the board */;
  T.freeze();const fr=[];try{for(let i=0;i<5;i++){CAM.fr=P[0][0];CAM.fc=P[0][1];draw()}
    for(const [r,c] of P){CAM.fr=r;CAM.fc=c;draw();const dpr=devicePixelRatio;fr.push({ox:Math.round(OX*dpr),oy:Math.round(OY*dpr),d:ctx.getImageData(0,0,cv.width,cv.height).data,W:cv.width,H:cv.height})}}finally{T.thaw()}
  let tot=0,diff=0,big=0;
  for(let i=1;i<fr.length;i++){const A=fr[i-1],B=fr[i];const dx=B.ox-A.ox,dy=B.oy-A.oy;
    for(let y=60;y<B.H-60;y+=3)for(let x=40;x<B.W-40;x+=3){const xa=x-dx,ya=y-dy;if(xa<0||ya<0||xa>=A.W||ya>=A.H)continue;const ib=(y*B.W+x)*4,ia=(ya*A.W+xa)*4;tot++;
      const dd=Math.abs(B.d[ib]-A.d[ia])+Math.abs(B.d[ib+1]-A.d[ia+1])+Math.abs(B.d[ib+2]-A.d[ia+2]);if(dd>6)diff++;if(dd>40)big++}}
  ar91SkyPaint=sky;if(AR91.L.sky){AR91.L.sky.key='';z99Drop(AR91.L.sky)}others.forEach(n=>LAYERS93.dbg.delete(n));T.drive(false);Z100.on=true;return {tot,diff,big}},on);
{const A=await still(true),F=await still(false);
  ok(A.big<=A.tot*0.002&&A.diff<=A.tot*0.01,'3a panning zoomed: the board, stone and stands hold still under the camera '+JSON.stringify({on:A}));
  ok(A.diff<=F.diff,'3b … no more change than with 208\'s margin '+JSON.stringify({on:A,off:F}))}
/* ---- 1 + 2 a camera trip: rebuilds and draw cost, zoomed (on/off) vs unzoomed, 3 rounds ---- */
const trip=(mode,n)=>pg.evaluate(async([mode,n])=>{const T=window.__T;const raf=()=>new Promise(r=>requestAnimationFrame(r));
  Z100.on=mode!=='off';CAM.z=null;S.zoomIn=mode!=='flat';T.drive(true);const P=T.trip(n);
  for(let i=0;i<14;i++){CAM.fr=P[0][0];CAM.fc=P[0][1];draw();await new Promise(r=>setTimeout(r,100))} /* the zoom eases in (1.1 s) */
  for(let i=0;i<4;i++){draw();await raf()}
  const a0=AR92.n,z0=Z99.stats.builds,D=[];let rebuild=0;
  for(const [r,c] of P){CAM.fr=r;CAM.fc=c;const a=AR92.n,t=performance.now();draw();D.push(performance.now()-t);if(AR92.n!==a)rebuild++;await raf()}
  T.drive(false);Z100.on=true;const med=T.q(D,.5);
  return {p50:+med.toFixed(2),p95:+T.q(D,.95).toFixed(2),max:+Math.max(...D).toFixed(2),refs:AR92.n-a0,rebuild,z99:Z99.stats.builds-z0,zoomed:z99Zoomed()}},[mode,n]);
const R=[];for(let k=0;k<3;k++)R.push({flat:await trip('flat',72),on:await trip('on',72),off:await trip('off',72)});
console.log('trips',JSON.stringify(R));
ok(R.every(r=>r.on.zoomed&&r.on.refs===0&&r.on.z99===0),'1a a camera trip zoomed repaints no stone layer and no tiles cache '+JSON.stringify(R.map(r=>r.on)));
ok(R.every(r=>r.off.rebuild>=2),'1b … where 208\'s margin repainted the stone layers several times a trip (the stutter) '+JSON.stringify(R.map(r=>r.off.rebuild)));
{const best=k=>Math.min(...R.map(r=>r.on[k])),bf=k=>Math.min(...R.map(r=>r.flat[k]));const fit=R.map(r=>r.on.max<=r.on.p50*6+12);
  ok(best('p50')<=bf('p50')*1.6+2,'2a zoomed panning draw p50 within 1.6x unzoomed + 2 ms '+JSON.stringify({on:best('p50'),flat:bf('p50')}));
  ok(best('p95')<=bf('p95')*2.5+4,'2b zoomed panning draw p95 within 2.5x unzoomed + 4 ms '+JSON.stringify({on:best('p95'),flat:bf('p95')}));
  ok(fit.some(x=>x),'2c no zoomed panning draw over 6x its median + 12 ms (one clean round of 3) '+JSON.stringify(R.map(r=>[r.on.p50,r.on.max])))}
/* a pinch: the zoom changes every frame */
const pinch=on=>pg.evaluate(async on=>{const T=window.__T;const raf=()=>new Promise(r=>requestAnimationFrame(r));Z100.on=on;S.zoomIn=true;T.drive(true);const p=cur();CAM.fr=p.r;CAM.fc=p.c;
  CAM.z=1.4;for(let i=0;i<6;i++){draw();await raf()}const D=[];const s0=Z100.stats.scaled;
  for(let i=0;i<30;i++){CAM.z=1.3+0.5*Math.abs(Math.sin(i/9));const t=performance.now();draw();D.push(performance.now()-t);await raf()}
  T.drive(false);Z100.on=true;CAM.z=null;return {p50:+T.q(D,.5).toFixed(2),p95:+T.q(D,.95).toFixed(2),scaled:Z100.stats.scaled-s0}},on);
{const P=[];for(let k=0;k<2;k++)P.push({on:await pinch(true),off:await pinch(false)});console.log('pinch',JSON.stringify(P));
  ok(P.every(p=>p.on.scaled>0)&&Math.min(...P.map(p=>p.on.p50))<Math.min(...P.map(p=>p.off.p50))*0.6,'2d a pinch draws the last layers scaled: far cheaper than repainting them '+JSON.stringify(P))}

/* ---- 3 pixels ---- */
/* 3c the whole-arena frame covers everything 208 painted: corner views, 16x16 block means (texture phase differs by a few px; a missing wall would not) */
const corner=pg.evaluate(async()=>{const T=window.__T;S.zoomIn=true;CAM.z=null;T.drive(true);for(let i=0;i<15;i++){draw();await new Promise(r=>setTimeout(r,100))} /* the zoom eases in */const keep=['rim','stands','tiles','walls'];
  const others=LAYERS93.defs.map(d=>d[0]).filter(n=>!keep.includes(n));others.forEach(n=>LAYERS93.dbg.add(n));const out=[];
  const grab=on=>{Z100.on=on;AR92.ref=null;for(const k in AR91.L)AR91.L[k].key='';draw();draw();const B=8,W=cv.width,H=cv.height,d=ctx.getImageData(0,0,W,H).data,m=[];
    for(let y=0;y+16<=H;y+=16)for(let x=0;x+16<=W;x+=16){let s=0;for(let yy=y;yy<y+16;yy+=2)for(let xx=x;xx<x+16;xx+=2){const i=(yy*W+xx)*4;s+=d[i]+d[i+1]+d[i+2]}m.push(s/64/3)}return m};
  T.freeze();try{for(const [r,c] of [[0,0],[0,12],[12,12],[12,0],[6,6]]){CAM.fr=r;CAM.fc=c;const a=grab(true),f=grab(false);let bad=0,worst=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-f[i]);if(d>24)bad++;if(d>worst)worst=d}
    out.push({rc:r+','+c,bad,n:a.length,worst:Math.round(worst)})}}finally{T.thaw()}
  others.forEach(n=>LAYERS93.dbg.delete(n));T.drive(false);Z100.on=true;return out});
{const C=await corner;ok(C.every(c=>c.bad<=c.n*0.004),'3c the whole-arena frame shows everything 208 painted at every corner '+JSON.stringify(C))}
/* 3d a scaled pinch frame ≈ the crisp frame at that zoom; crisp again once the zoom holds */
const p3d=await pg.evaluate(async()=>{const T=window.__T;const W8=ms=>new Promise(r=>setTimeout(r,ms));S.zoomIn=true;T.drive(true);const p=cur();CAM.fr=p.r;CAM.fc=p.c;
  const keep=['rim','stands','tiles','walls','floor','decals'];const others=LAYERS93.defs.map(d=>d[0]).filter(n=>!keep.includes(n));others.forEach(n=>LAYERS93.dbg.add(n));
  const blk=()=>{const W=cv.width,H=cv.height,d=ctx.getImageData(0,0,W,H).data,m=[];for(let y=0;y+16<=H;y+=16)for(let x=0;x+16<=W;x+=16){let s=0;for(let yy=y;yy<y+16;yy+=2)for(let xx=x;xx<x+16;xx+=2){const i=(yy*W+xx)*4;s+=d[i]+d[i+1]+d[i+2]}m.push(s/192)}return m};
  CAM.z=1.4;for(let i=0;i<4;i++)draw();await W8(400);draw();const s0=Z100.stats.scaled;
  T.freeze();let sc,cr,scaledNow;try{CAM.z=1.46;draw();scaledNow=Z100.stats.scaled>s0;sc=blk();Z100.force=true;draw();Z100.force=false;cr=blk()}finally{T.thaw()}
  let bad=0;for(let i=0;i<sc.length;i++)if(Math.abs(sc[i]-cr[i])>30)bad++;
  await W8(Z100.hold+250);const crisp=AR91.L.under&&AR91.L.under.tw===TW;
  others.forEach(n=>LAYERS93.dbg.delete(n));T.drive(false);CAM.z=null;draw();return {scaledNow,bad,n:sc.length,crisp}});
ok(p3d.scaledNow&&p3d.bad<=p3d.n*0.02,'3d a scaled pinch frame matches the crisp frame at that zoom '+JSON.stringify(p3d));
ok(p3d.crisp,'3e the crisp layers come back once the zoom holds '+JSON.stringify(p3d));
const newErr=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m):[],mark).catch(()=>[]);
ok(!newErr.length,'no new errors logged '+JSON.stringify(newErr).slice(0,300));
await pg.context().close();

/* ---- 4 zooming mid-action: deterministic guards ---- */
const run=async(speed,zoom)=>{const q=await open();await start(q,11);
  return q.evaluate(async([speed,zoom])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
    const L=[],R=[];const lb=log;log=function(h){if(S&&S.turnNo>=2&&S.turnNo<=5)L.push(S.turnNo+' '+String(h).replace(/<[^>]+>/g,''));return lb.apply(this,arguments)};
    const offT=BUS.on('turn.begin',e=>{if(e.turnNo<=5)R.push(e.turnNo+':'+RNG.s)});
    SPEED=speed;const iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},200);
    await W8(1000);
    if(zoom){for(let k=0;k<5;k++){S.zoomIn=!S.zoomIn;draw();await W8(250)}S.zoomIn=true;draw()}
    /* v1.08c: pause AT a turn boundary (BUS turn.begin of turn 6, before any move starts). Pausing from a 100 ms poll could land
       inside a CPU move's fast96Batch (Fast: PACE96.depth 1, the paused step never returns) → "4d nothing left pending" failed (CI). */
    await new Promise(res=>{let done=false;const fin=()=>{if(done)return;done=true;SPEED='pause';offP();clearTimeout(tm);clearInterval(chk);res()};
      const offP=BUS.on('turn.begin',e=>{if(e.turnNo>5)fin()});const tm=setTimeout(fin,90000);const chk=setInterval(()=>{if(S.over)fin()},100)});
    offT();log=lb;clearInterval(iv);
    const o={L,R,turn:S.turnNo,zoomed:z99Zoomed()};
    for(let i=0;i<100&&(S.busy||CAM.raf||(typeof PACE96!=='undefined'&&PACE96.depth));i++)await W8(100);
    await W8(3000);const st0={...Z99.stats},t0=TILES96.builds,ar0=AR92.n;
    let draws=0,breath=0;const b0=draw;draw=function(){draws++;
      /* v1.0 wave 8: the 3D stand-ins (311) and beasts (312) breathe on their own pose clocks (a draw at each pose boundary, a few a second,
         none in idle92) — those are the animation, not the camera; the zoom machinery itself must ask for nothing */
      const st=String(new Error().stack||'');if(/an100Tick|bst100Tick/.test(st))breath++;return b0.apply(this,arguments)};await W8(2000);draw=b0;
    o.idleDraws=draws-breath;o.breathDraws=breath;o.builds=Z99.stats.builds-st0.builds;o.t96=TILES96.builds-t0;o.ar=AR92.n-ar0;
    o.flags={z99raf:Z99F.raf,tick:Z99F.tick,inFrame:Z99F.inFrame,pace:PACE96.raf,depth:PACE96.depth,dirty:PACE96.dirty,settle:Z100.st,fold:Z100.fr};o.folded=Z100.stats.folded||0;
    return o},[speed,zoom]).finally(()=>q.context().close())};
for(const sp of ['normal','fast']){
  const A=await run(sp,false),B=await run(sp,true);
  ok(A.turn>=4&&B.turn>=4,sp+' 4a both runs played '+JSON.stringify([A.turn,B.turn]));
  ok(B.zoomed,sp+' 4b the zoomed run ends zoomed');
  ok(B.idleDraws<=2&&A.idleDraws<=2,sp+' 4c a paused board asks for no draws '+JSON.stringify([A.idleDraws,B.idleDraws]));
  ok(A.breathDraws<=16&&B.breathDraws<=16,sp+' 4c … and the stand-ins\' / beasts\' breathing is a few draws a second, not a frame loop '+JSON.stringify([A.breathDraws,B.breathDraws]));
  ok(!B.flags.z99raf&&!B.flags.tick&&!B.flags.inFrame&&!B.flags.pace&&!B.flags.depth&&!B.flags.dirty&&!B.flags.settle&&!B.flags.fold,sp+' 4d nothing left pending after the zooms '+JSON.stringify(B.flags));
  if(sp==='normal')ok(B.folded>0,sp+' 4h zoomed while CPUs act: a second draw in one frame waits for the next frame '+B.folded);
  ok(B.builds===0&&B.t96===0&&B.ar===0,sp+' 4e a settled zoomed board rebuilds nothing '+JSON.stringify({builds:B.builds,t96:B.t96,ar:B.ar}));
  const n=Math.min(A.R.length,B.R.length);ok(n>=3&&A.R.slice(0,n).join()===B.R.slice(0,n).join(),sp+' 4f seeded dice state per turn unchanged by the zoom '+JSON.stringify([A.R,B.R]));
  const m=Math.min(A.L.length,B.L.length,60);ok(m>=10&&A.L.slice(0,m).join('\n')===B.L.slice(0,m).join('\n'),sp+' 4g log unchanged by the zoom (first '+m+' lines)');
}
/* ---- 5 kill switch ---- */
{const q=await open({flavius_zoomcam100off:'1'});await start(q,11);const k=await q.evaluate(async()=>{S.zoomIn=true;draw();const a=AR92.n;const p=cur();
    for(let i=0;i<30;i++){CAM.fr=p.r+(i%2?6:-6)*0.3;CAM.fc=p.c;draw()}return {on:Z100.on,stats:Z100.stats}});
  ok(k.on===false&&k.stats.whole===0&&k.stats.scaled===0,'5 kill switch flavius_zoomcam100off=1 '+JSON.stringify(k));await q.context().close()}
ok(!errs.length,'no page errors '+JSON.stringify(errs).slice(0,300));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

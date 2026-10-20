/* v1.08 NIGHT TORCHES · SAND GRAIN + PLANKS + JUG GLINT · DEPTH (409-v108light; tools/plans/v108/MOCKUP.md, his answers 1a–8a). Checks:
   (1) on by default; the prototype 407 and its runtime METAL pass are gone (no cell wrapper, no knob); (2) night: the sand next to a rim
   torch is WARMER (R − B) than with flavius_v108torchoff (the pools baked into 189's grade); (3) day: the torches change nothing (pixels
   identical with the torch item killed) — and the day board does carry the baked grain / depth (differs with mat + depth killed);
   (4) Lighting Off = none of v1.08 (pixels identical to all three items killed), Light = the pools + flames but no torch shadows, Full =
   torch shadows too (the merged layer holds more pieces than 399's); (5) Reduce motion: the flames hold still (rim-light flicker factors
   and a pool's pixels identical in two frames 0.4 s apart), normally they move; (6) the kill switches (localStorage) turn each item off
   and give back 189's own pools; (7) ZOOM-EASE GUARD: while a night zoom eases the grade additions are NOT re-painted per frame (laid in
   scaled: reuses ≥ 5, sharp re-bakes ≤ 2), no torch-layer build step runs in a moving frame, our work a frame stays small (median < 1.5 ms, p90 < 4 ms);
   after the view holds: one sharp re-bake and the torch layer built in pieces (each step < 16 ms); (8) no console errors.
   node tools/tests/tv108l.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const TYPES={'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,400))};
const open=async(ls,view)=>{const c=await b.newContext(view||{viewport:{width:1440,height:900}});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|Failed to load resource/.test(m.text()))errs.push('console: '+m.text().slice(0,200))});
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');localStorage.setItem('flavius_light106auto','0');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}try{menuHide()}catch(e){}});return pg};
/* a paused match on Pompeii (12 pillars), the gladiators in the middle; helpers: FRZ (frozen clock + seeded Math.random: still frames),
   HASH (the board's pixels), WARM (R − B round the sand tiles next to the rim torches, off pieces / pillars) */
const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;SETTINGS.calm=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='pause';
  const pl=[[6,5],[5,6],[7,7],[6,8]];S.players.forEach((p,i)=>{p.r=pl[i][0];p.c=pl[i][1];p._fr=null});S.npcs=[];
  window.T108={
    frz(){if(window.__pn)return;let s=12345;const t=performance.now();window.__pn=performance.now;window.__mr=Math.random;Object.defineProperty(performance,'now',{value:()=>t,configurable:true,writable:true});Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}},
    thaw(){if(!window.__pn)return;Object.defineProperty(performance,'now',{value:window.__pn,configurable:true,writable:true});Math.random=window.__mr;window.__pn=null},
    hash(){const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let h=0;for(let i=0;i<d.length;i+=3)h=(h*31+d[i])|0;return h},
    still(){T108.thaw();T108.frz();for(let i=0;i<3;i++)draw();const h=T108.hash();T108.thaw();return h},
    edge(){const out=[];const busy=(r,c)=>S.players.some(p=>p.alive&&p.r===r&&p.c===c)||S.pillars.some(q=>q.r===r&&q.c===c)||(S.chest&&S.chest.r===r&&S.chest.c===c);
      for(const [r,c] of [[0,4],[0,8],[4,0],[8,0],[N-1,4],[N-1,8],[4,N-1],[8,N-1],[0,3],[3,0],[N-1,3],[3,N-1],[0,9],[9,0]])if(!busy(r,c))out.push([r,c]);return out},
    warm(tiles){const g=cv.getContext('2d'),dpr=devicePixelRatio||1;let s=0,n=0;for(const [r,c] of tiles){const m=center(r,c);for(const [ox,oy] of [[-.2,0],[.2,0],[0,-.08],[0,.08]]){const d=g.getImageData(Math.round((m.x+ox*TW)*dpr),Math.round((m.y+oy*TW)*dpr),1,1).data;s+=d[0]-d[2];n++}}return n?s/n:0},
    async set(o){if('light' in o){SETTINGS.light106=o.light;applySettings()}if('kill' in o){for(const k of ['torch','mat','depth'])V108.kill[k]=o.kill.includes(k)}if('night' in o)S.night=!!o.night;for(let i=0;i<4;i++){draw();await W8(40)}}};
  render();for(let i=0;i<30;i++){draw();await W8(60)}
  return {human:humanTurn(),pillars:S.pillars.length,mode:l106Mode(),sig:V108.sig}});

let pg=await open();const st=await start(pg);
ok(st.human&&st.pillars>=8&&st.mode==='full'&&st.sig==='111','0 a paused match on Pompeii, Lighting Full, all three v1.08 items on '+JSON.stringify(st));

/* ---- 1 · no prototype, no metal pass ---- */
const d1=await pg.evaluate(()=>({proto:typeof v108Has,metal:typeof v108Metal,knob:'metal' in V108K,cell:/v108/.test(String(an100CellCanvas)),beast:typeof bst100CellCanvas==='function'&&/v108/.test(String(bst100CellCanvas)),
  st:'metal' in V108.st,flag:(()=>{try{localStorage.setItem('flavius_v108proto','1');return true}catch(e){return false}})()}));
ok(d1.proto==='undefined'&&d1.metal==='undefined'&&!d1.knob&&!d1.cell&&!d1.beast&&!d1.st,'1 the prototype (407) and its runtime metal pass are not in the build '+JSON.stringify(d1));

/* ---- 2 · night: warm pools at the rim ---- */
const d2=await pg.evaluate(async()=>{SETTINGS.calm=true;await T108.set({night:1,kill:[]});const tiles=T108.edge();T108.frz();draw();draw();const on=T108.warm(tiles);T108.thaw();
  await T108.set({kill:['torch']});T108.frz();draw();draw();const off=T108.warm(tiles);T108.thaw();await T108.set({kill:[]});
  return {tiles:tiles.length,on:+on.toFixed(1),off:+off.toFixed(1),torches:NIGHT91.torches.length,lights:v108Spots().length,night:night91On()}});
ok(d2.night&&d2.tiles>=4&&d2.on>d2.off+6&&d2.torches>=8&&d2.torches===d2.lights,'2 night: the sand by the rim torches is warmer than with flavius_v108torchoff (R−B) '+JSON.stringify(d2));

/* ---- 3 · day: the torches change nothing; the grain / depth are there ---- */
const d3=await pg.evaluate(async()=>{await T108.set({night:0,kill:[]});const a=T108.still(),p0=V108.st.pools;await T108.set({kill:['torch']});const b=T108.still();
  await T108.set({kill:['mat','depth']});const c=T108.still();await T108.set({kill:[]});const a2=T108.still();return {same:a===b,again:a===a2,matDepth:a!==c,pools:V108.st.pools-p0,night:night91On()}});
ok(!d3.night&&d3.again&&d3.same&&d3.pools===0,'3a day: the torch item changes no pixel (no pools by day) '+JSON.stringify(d3));
ok(d3.matDepth,'3b day: the board carries the baked grain / planks / depth (differs with mat + depth killed) '+JSON.stringify(d3));

/* ---- 4 · Lighting Off / Light / Full ---- */
const d4=await pg.evaluate(async()=>{const o={};await T108.set({night:1,light:'off',kill:[]});o.offItems=['torch','mat','depth'].map(k=>v108Item(k));const a=T108.still();
  await T108.set({kill:['torch','mat','depth']});const bb=T108.still();o.offSame=a===bb;
  await T108.set({light:'light',kill:[]});V108.tl=null;const f0=V108.st.figN;for(let i=0;i<6;i++){draw();await new Promise(r=>setTimeout(r,30))}
  o.light={mode:l106Mode(),tl:!!V108.tl,lastF:!!(V108.lastF&&V108.lastF.length>=8&&V108.lastF.length===v108Spots().length),items:v108Item('torch')};
  await T108.set({light:'full'});for(let i=0;i<20&&!(V108.tl&&!V108.tb);i++){draw();await new Promise(r=>setTimeout(r,40))}
  o.full={mode:l106Mode(),tl:!!V108.tl,merged:V108.tl&&V108.tl.rects&&L106.layer?V108.tl.rects.length-L106.layer.rects.length:0,steps:V108.st.tlSteps};return o});
ok(d4.offItems.join()==='false,false,false'&&d4.offSame,'4a Lighting Off = none of v1.08 (pixels identical to all three killed) '+JSON.stringify(d4));
ok(d4.light.mode==='light'&&!d4.light.tl&&d4.light.lastF&&d4.light.items,'4b Light = the pools + flames, no torch shadow layer '+JSON.stringify(d4.light));
ok(d4.full.mode==='full'&&d4.full.tl&&d4.full.merged>=8,'4c Full = the torch shadows of the pillars merged into the static layer '+JSON.stringify(d4.full));

/* ---- 5 · Reduce motion: still flames ---- */
const d5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const g=cv.getContext('2d'),dpr=devicePixelRatio||1;const t=T108.edge()[0];const m=center(t[0],t[1]);
  const blk=()=>Array.from(g.getImageData(Math.round(m.x*dpr)-6,Math.round(m.y*dpr)-6,12,12).data).join(',');
  const two=async calm=>{SETTINGS.calm=calm;draw();const f0=(V108.lastF||[]).join(),p0=blk();await W8(400);draw();return {fSame:f0===(V108.lastF||[]).join(),pSame:p0===blk(),flick:night91Flick()}};
  const n=await two(false),r=await two(true);return {normal:n,reduce:r}});
ok(!d5.normal.fSame&&d5.normal.flick,'5a the flames flicker normally '+JSON.stringify(d5.normal));
ok(d5.reduce.fSame&&d5.reduce.pSame&&!d5.reduce.flick,'5b Reduce motion: flicker factors and a pool'+"'"+'s pixels identical 0.4 s apart '+JSON.stringify(d5.reduce));

/* ---- 7 · zoom-ease guard (night, Full) ---- */
const d7=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const raf=()=>new Promise(r=>requestAnimationFrame(r));SETTINGS.calm=true;
  const cam=S.players[0];try{camFocus=function(Wd,Hd){return {r:cam.r,c:cam.c,x:Wd/2,y:Hd*0.5}}}catch(e){}
  await W8(400);for(let i=0;i<4;i++){draw();await raf()}
  /* every board draw (ours, the settle timer's, the build's own) logged: moving?, a sharp grade re-bake?, a torch-layer step?, our ms */
  const log=[];const D0=draw;draw=function(){const a=V108.st.bakeNight,s=V108.st.tlSteps,tw=TW;const r=D0.apply(this,arguments);
    log.push({mv:v108Moving(),tw:Math.abs(TW-tw)>1e-6||log.length&&Math.abs(TW-log[log.length-1].TW)>1e-6,TW,sharp:V108.st.bakeNight-a,step:V108.st.tlSteps-s,fw:V108.fw,ms:V108.tlLog.length?V108.tlLog[V108.tlLog.length-1]:0});return r};
  const s0={...V108.st};V108.tlLog=[];S.zoomIn=!S.zoomIn;let still=0,last=TW;
  try{for(let i=0;i<200&&still<40;i++){await raf();draw();if(Math.abs(TW-last)>1e-6){last=TW;still=0}else still++;if(still>12&&V108.tl&&!V108.tb&&!(NIGHT91.cache&&NIGHT91.cache.v108s))break}}finally{draw=D0}
  const mvF=log.filter(f=>f.mv),q=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);return s.length?+s[Math.floor(p*(s.length-1))].toFixed(2):null};
  const e={draws:log.length,moving:mvF.length,twSteps:log.filter(f=>f.tw).length,reuse:V108.st.nightReuse-s0.nightReuse,mvSharp:mvF.reduce((a,f)=>a+f.sharp,0),mvSteps:mvF.reduce((a,f)=>a+f.step,0),
    med:q(mvF.map(f=>f.fw),.5),p90:q(mvF.map(f=>f.fw),.9)};
  e.after={sharp:log.filter(f=>!f.mv).reduce((a,f)=>a+f.sharp,0),tl:!!(V108.tl&&!V108.tb),steps:V108.tlLog.length,stepMax:V108.tlLog.length?Math.max(...V108.tlLog):0,scaledLeft:!!(NIGHT91.cache&&NIGHT91.cache.v108s)};
  S.zoomIn=!S.zoomIn;for(let i=0;i<30;i++){await raf();draw()}return e});
ok(d7.twSteps>=5&&d7.reuse>=5&&d7.mvSharp<=1&&d7.mvSteps===0,'7a zoom ease at night: the grade additions laid in scaled (not re-painted a frame: ≤ 1 sharp re-bake while moving), no torch-layer step while moving '+JSON.stringify(d7));
ok(d7.med<1.5&&d7.p90<4,'7b zoom ease: our work a moving frame median < 1.5 ms, p90 < 4 ms '+JSON.stringify({med:d7.med,p90:d7.p90}));
ok(d7.after.sharp>=1&&d7.after.tl&&!d7.after.scaledLeft&&d7.after.steps>=1&&d7.after.stepMax<16,'7c the view holds: one sharp re-bake + the torch layer built in pieces (each < 16 ms) '+JSON.stringify(d7.after));
await pg.context().close();

/* ---- 6 · kill switches ---- */
pg=await open({flavius_v108torchoff:'1',flavius_v108matoff:'1',flavius_v108depthoff:'1'});await start(pg);
const d6=await pg.evaluate(async()=>{await T108.set({night:1});const p0=V108.st.pools;for(let i=0;i<3;i++)draw();
  return {kill:V108.kill,sig:V108.sig,items:['torch','mat','depth'].map(k=>v108Item(k)),pools:V108.st.pools-p0,torches:NIGHT91.torches.length,bakes:V108.st.bakeNight+V108.st.bakeDay}});
ok(d6.kill.torch&&d6.kill.mat&&d6.kill.depth&&d6.sig==='000'&&d6.pools===0&&d6.torches>=8&&d6.bakes===0,'6 kill switches flavius_v108torchoff / matoff / depthoff = 189'+"'"+'s own pools, nothing baked '+JSON.stringify(d6));
await pg.context().close();

await b.close();srv.close();console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});

/* tools/bench/board.js — v1.06 BOARD DRAW BENCHMARK (lighting brief phase 1–2; tools/plans/v106/BASELINE.md).
   One fixed, packed arena (forged from a seeded Democritus at Pompeii, seed 4242): 8 gladiators of the 8 printed classes in a tight
   cluster, 6 beasts (2 bears, 2 wolves, 2 snakes), 12 pillars with their Blessing jugs, the chest, rubble, an elimination's blood,
   the soldier mid-SLASH on the bear (the slash row's 2nd frame, re-stamped every frame), a floating damage number, his gold turn ring,
   9 move tiles + 1 attack tile (computeHL forged). Animations On (Normal speed, no Reduce motion), offline, stands on.
   Measures performance.now() around draw() for many frames (each after a rAF, like the game), two passes:
     js    = the draw() call itself (Chrome records the canvas commands; rasterisation is deferred)
     flush = draw() + a 1-pixel getImageData (forces the canvas to rasterise now) — run AFTER the js pass, because readbacks may move
             the canvas off the GPU path for the rest of the page's life.
   Configs: desk 1440×900 @1x and phone 390×844 @2x (mobile, touch) × day / night × flat / zoomed (Zoom in, camera on the soldier).
   Also prints the layer manager's per-layer averages (219 LAYERS93) and, when the v1.06a light pass runs, its own time (399 L106.st).
     node tools/bench/board.js <page> [--frames 120] [--warm 20] [--ls key=val,key=val] [--shots DIR --tag NAME] [--only desk|phone|desk2x,…] [--json FILE]
   v1.07: --ablate [--zooms 1,1.4,2] [--dprs 2] = the forced-flush cost of each layer / cached sub-layer (all on − that one off; LAYERS93.debugOff),
   --dprs 2 adds a desk view at that devicePixelRatio (desk2x); a zoom of 1.9+ is a pinch (CAM.z), 1.4 is "Zoom in".
   --ls sets localStorage before load (e.g. flavius_light106=full|light|off forces the v1.06a Lighting mode, flavius_light106auto=0 keeps Full;
   desk defaults to Full, phone to Light). --shots saves a frozen-clock PNG
   of the board canvas per config + the overlay-contrast numbers (highlight pixels vs the same pixels without the highlight).
   The machine load (/proc/loadavg, nproc) is printed before and after: other builders may share this box. Served over http
   (tools/perf95/serve.js) so sprite sheets read back like on the site. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),os=require('os');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]||'flavius-arena.html');
const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};
const ABL=A.includes('--ablate'),ZOOMS=String(opt('zooms','')).split(',').filter(Boolean).map(Number),DPRS=String(opt('dprs','')).split(',').filter(Boolean).map(Number);
const FRAMES=+opt('frames',120),WARM=+opt('warm',20),SHOTS=opt('shots',''),TAG=opt('tag','run'),ONLY=opt('only',''),JSONF=opt('json','');
const LS={};for(const kv of String(opt('ls','')).split(',').filter(Boolean)){const i=kv.indexOf('=');LS[kv.slice(0,i)]=kv.slice(i+1)}
const load=()=>{const l=fs.readFileSync('/proc/loadavg','utf8').split(' ');return {l1:+l[0],l5:+l[1],l15:+l[2],cpus:os.cpus().length}};
const VIEWS={desk:{viewport:{width:1440,height:900},deviceScaleFactor:1},phone:{viewport:{width:390,height:844},deviceScaleFactor:+opt('phonedpr',2) /* v1.08c: --phonedpr 3 */,isMobile:true,hasTouch:true}};

/* ---- in-page: the forged scene ---- */
const SCENE=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
  while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}SPEED='pause';
  startEvent({ev:'democritus',loc:6,seed:4242,seats:['soldier','hero','royalty','venatore','amazonia','veteranus','slave','damnatio'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
  for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>6)break}
  SPEED='pause';await W8(300);while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}
  /* the packed centre: [class, r, c, face-from (dr,dc)] — every tile off the pillars and the chest */
  const PL={soldier:[6,5,1,0],hero:[5,6,1,-1],royalty:[7,5,0,-1],venatore:[6,7,-1,0],amazonia:[4,6,1,1],veteranus:[8,7,0,1],slave:[5,7,1,0],damnatio:[7,6,-1,-1]};
  for(const p of S.players){const q=PL[p.cls];if(!q)continue;p.r=q[0];p.c=q[1];p._fr=p.r+q[2];p._fc=p.c+q[3];p._face=null}
  const NP=[['bear',5,5],['bear',7,7],['wolf',3,5],['wolf',4,7],['snake',8,6],['snake',9,5]];const used=new Set();
  for(const [t,r,c] of NP){const n=S.npcs.find(n=>n.t===t&&!used.has(n));if(!n)continue;used.add(n);n.r=r;n.c=c;n.alive=true;n.out=false;n._fr=r;n._fc=c+1;n._face=null}
  S.rubble=[{r:9,c:7,dr:0,dc:1}];S.blood=[{r:9,c:4,kind:'elim',seed:7,rot84:S.rotation|0},{r:5,c:4,kind:'limb',seed:11,rot84:S.rotation|0}];
  const sol=S.players.find(p=>p.cls==='soldier');S.cur=S.players.indexOf(sol);
  p95Defer=function(){return false}; /* deferral only re-schedules a paint (230/260); the bench wants every draw() to paint */
  const H=[[6,4,1],[6,3,2],[6,2,3],[5,4,1],[5,3,2],[7,4,1],[7,3,2],[8,5,2],[8,3,3]];
  const baseHL=computeHL;computeHL=function(){baseHL.apply(this,arguments);if(!window.BENCH_HL)return;for(const [r,c,k] of H)HL.set(r*N+c,{t:'move',cost:k});HL.set(5*N+5,{t:'atk',target:{r:5,c:5}})};
  window.BENCH_HL=true;
  window.BENCH={sol,tick(){try{const s=an100St(sol);s.act='slash';s.t0=performance.now()-AN100.poseMs*1.5}catch(e){}
      if(!FX.some(f=>f.bench))FX.push({r:5,c:5,text:'−2',color:'#ff6b5a',t0:performance.now(),dur:1e9,bench:1});else for(const f of FX)if(f.bench)f.t0=performance.now()-300}};
  camFocus=function(Wd,Hd){return {r:6,c:5.5,x:Wd/2,y:Hd*0.5}};
  for(let i=0;i<10;i++){BENCH.tick();draw();await W8(60)}
  return {players:S.players.length,npcs:S.npcs.filter(n=>n.alive).length,pillars:S.pillars.length,TW,dpr:devicePixelRatio,cv:[cv.width,cv.height],
    an100:typeof AN100!=='undefined'?AN100.stats.cells:null,soldierSheet:(()=>{try{return !!an100Bm(an100SrcFor(sol,null),'move','idle')}catch(e){return false}})()}};
const SET=async(mode)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));S.night=!!mode.night;S.zoomIn=!!mode.zoom;try{CAM.z=mode.pz||null}catch(e){}
  const t0=performance.now();while(performance.now()-t0<1400){BENCH.tick();draw();await W8(30)} /* the zoom eases in/out over 1.1 s */
  return {TW,z:typeof DUEL!=='undefined'?+DUEL.z.toFixed(3):1,night:night91On()}};
const MEASURE=async({n,warm,flush})=>{const raf=()=>new Promise(r=>requestAnimationFrame(r));const D=[],L=[];let painted=0;
  const g=flush?cv.getContext('2d'):null;
  const LP=[];const hasL=typeof L106!=='undefined'&&L106.st;
  for(let i=0;i<warm+n;i++){await raf();BENCH.tick();if(hasL&&i===warm){for(const k of ['ms','n','tStatic','tFig','tCont','builds','figs','contacts'])L106.st[k]=0} /* v1.06a: the light pass counted after the warm-up (a zoom change before a config rebuilds its layer) */
    const f0=LAYERS93.frames,l0=hasL?L106.st.ms:0;const t=performance.now();draw();if(flush)g.getImageData(0,0,1,1);const d=performance.now()-t;
    if(i>=warm){D.push(d);if(LAYERS93.frames>f0)painted++;if(hasL)LP.push(L106.st.ms-l0)}}
  const q=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);return +s[Math.min(s.length-1,Math.floor(p*(s.length-1)))].toFixed(2)};
  const lay={};for(const k of ['stands','tiles','walls','floor','decals','highlights','pieces','overlays','fx'])if(LAYERS93.stats[k])lay[k]=+LAYERS93.stats[k].avg.toFixed(2);
  const l106=typeof L106!=='undefined'&&L106.st&&L106.st.n?(()=>{const t=L106.st,n=Math.max(1,t.n),f=v=>+((v||0)/n).toFixed(3);return {ms:f(t.ms),p50:LP.length?q(LP,.5):null,p95:LP.length?q(LP,.95):null,n:t.n,mode:l106Mode(),static:f(t.tStatic),fig:f(t.tFig),contact:f(t.tCont),builds:t.builds,figs:+(t.figs/n).toFixed(1)}})():null;if(l106){for(const k of ['ms','n','tStatic','tFig','tCont','builds','figs','contacts'])L106.st[k]=0}
  return {p50:q(D,.5),p95:q(D,.95),max:q(D,1),mean:+(D.reduce((a,b)=>a+b,0)/D.length).toFixed(2),painted,n:D.length,layers:lay,l106}};
/* frozen clock + cosmetic randomness, for still pictures and the contrast read-back */
const FREEZE=()=>{let s=12345;const t=performance.now();window.__pn=performance.now;window.__mr=Math.random;Object.defineProperty(performance,'now',{value:()=>t,configurable:true,writable:true});
  Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}};
const THAW=()=>{Object.defineProperty(performance,'now',{value:window.__pn,configurable:true,writable:true});Math.random=window.__mr};
/* overlay contrast: pixels inside the forged highlight tiles (off the cost digit, off pieces) with and without the highlight, and the
   un-highlighted floor next to them; WCAG relative luminance contrast */
const CONTRAST=()=>{const dpr=devicePixelRatio||1,g=cv.getContext('2d');const lum=([r,gg,b])=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(gg)+0.0722*f(b)};
  const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
  const pts=[];for(const [k,h] of HL){const r=Math.floor(k/N),c=k%N;if(typeof unitAt==='function'&&unitAt(r,c))continue;const m=center(r,c);
    for(const [ox,oy] of [[-.22,0],[.22,0],[-.15,-.07],[.15,-.07],[-.15,.07],[.15,.07]])pts.push({t:h.t,k,x:m.x+ox*TW,y:m.y+oy*TW})}
  const read=()=>pts.map(p=>{const d=g.getImageData(Math.round(p.x*dpr),Math.round(p.y*dpr),1,1).data;return [d[0],d[1],d[2]]});
  BENCH.tick();window.BENCH_HL=true;draw();const on=read();window.BENCH_HL=false;draw();const off=read();window.BENCH_HL=true;draw();
  const rows={};pts.forEach((p,i)=>{const R=rows[p.k]||(rows[p.k]={t:p.t,k:p.k,cr:[],on:[],off:[]});R.cr.push(cr(on[i],off[i]));R.on.push(lum(on[i]));R.off.push(lum(off[i]))});
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;const out=Object.values(rows).map(R=>({t:R.t,tile:tl(Math.floor(R.k/N),R.k%N),cr:+avg(R.cr).toFixed(3),Lon:+avg(R.on).toFixed(3),Loff:+avg(R.off).toFixed(3)}));
  return {tiles:out,meanCR:+avg(out.map(o=>o.cr)).toFixed(3),minCR:+Math.min(...out.map(o=>o.cr)).toFixed(3)}};

module.exports={SCENE,SET,MEASURE,FREEZE,THAW,VIEWS,CONTRAST};
if(require.main===module)(async()=>{const serve=require(path.join(__dirname,'..','perf95','serve.js'));const url=await serve(PAGE);const b=await chromium.launch();
  const res={page:path.basename(PAGE),ls:LS,frames:FRAMES,warm:WARM,load0:load(),at:new Date().toISOString(),runs:[]};const errs=[];
  console.log('load before',JSON.stringify(res.load0),'ls',JSON.stringify(LS));
  if(DPRS.length)for(const d of DPRS)VIEWS['desk'+d+'x']={viewport:{width:1440,height:900},deviceScaleFactor:d};
  for(const vk of Object.keys(VIEWS)){if(ONLY&&!ONLY.split(',').includes(vk))continue;
    const cx=await b.newContext(VIEWS[vk]);await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
    await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in ls)localStorage.setItem(k,ls[k])},LS);
    const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(vk+': '+e.message));await pg.goto(url,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
    const sc=await pg.evaluate(SCENE);console.log(vk,'scene',JSON.stringify(sc));
    if(ABL){ /* --ablate: the forced-flush cost of each layer / cached sub-layer = (all on) − (that one off), per zoom (--zooms 1,1.4,2) */
      const names=['stands','under','deco','tiles','walls','top','light','sky','floor','decals','wear','highlights','pieces','overlays','fx'];
      for(const z of (ZOOMS.length?ZOOMS:[1,1.4,2])){const m=z<=1?{name:'z1'}:z<1.9?{name:'z'+z,zoom:1}:{name:'z'+z,zoom:1,pz:z};await pg.evaluate(SET,m);
        const one=async off=>{await pg.evaluate(o=>{for(const k of o)LAYERS93.debugOff(k,true)},off);await pg.evaluate(SET,m);const r=await pg.evaluate(MEASURE,{n:Math.max(20,FRAMES>>1),warm:8,flush:true});await pg.evaluate(o=>{for(const k of o)LAYERS93.debugOff(k,false)},off);return r.p50};
        const all=await one([]);const row={all};for(const k of names)row[k]=+(all-await one([k])).toFixed(1);const empty=await one(names);row.rest=empty;
        console.log(vk,m.name,'flush p50 all',all,'ms · saved with each one off:',JSON.stringify(row));res.runs.push({key:vk+' '+m.name+' ablate',view:vk,ablate:row})}
      await cx.close();continue}
    const modes=[{name:'day-flat'},{name:'day-zoom',zoom:1},{name:"night-flat",night:1},{name:'night-zoom',night:1,zoom:1}];
    const rows={};
    for(const flush of [false,true])for(const m of modes){const st=await pg.evaluate(SET,m);const r=await pg.evaluate(MEASURE,{n:FRAMES,warm:WARM,flush});
      const key=vk+' '+m.name+' '+(flush?'flush':'js');rows[key]={...r,TW:st.TW,z:st.z};res.runs.push({key,view:vk,mode:m.name,flush,...r,TW:st.TW,z:st.z});
      console.log(key.padEnd(26),`p50 ${r.p50}  p95 ${r.p95}  max ${r.max}  painted ${r.painted}/${r.n}`,r.l106?`L106 ${r.l106.mode} ${r.l106.ms} ms/pass p50 ${r.l106.p50} p95 ${r.l106.p95} (static ${r.l106.static} figs ${r.l106.fig} [${r.l106.figs}/pass] contact ${r.l106.contact}; layer builds ${r.l106.builds})`:'','layers',JSON.stringify(r.layers))}
    if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});
      for(const m of modes){const st=await pg.evaluate(SET,m);console.log("set",m.name,JSON.stringify(st));await pg.evaluate(FREEZE);const c=await pg.evaluate(CONTRAST);await pg.evaluate(()=>draw());
        const el=await pg.evaluateHandle(()=>cv);const f=path.join(SHOTS,`${TAG}_${vk}_${m.name}.png`);await el.screenshot({path:f});await pg.evaluate(THAW);
        res.runs.push({key:vk+' '+m.name+' contrast',view:vk,mode:m.name,contrast:c});console.log('shot',f,'contrast mean',c.meanCR,'min',c.minCR,JSON.stringify(c.tiles.map(t=>t.tile+':'+t.cr)))}}
    await cx.close()}
  res.load1=load();console.log('load after',JSON.stringify(res.load1));console.log('ERRS',JSON.stringify(errs));
  if(JSONF){fs.mkdirSync(path.dirname(path.resolve(JSONF)),{recursive:true});fs.writeFileSync(JSONF,JSON.stringify(res,null,1))}
  await b.close();process.exit(errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});

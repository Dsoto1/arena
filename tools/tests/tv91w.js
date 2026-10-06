/* v0.91 WEAR AND LIFE (194-v91wear): a toppled pillar leaves drawn rubble (drums + chips) and a stump, no page errors; blood at the
   edge of the sand runs a trickle out toward a drain (192's ar91Drains, or a stand-in when it is missing) and fades with the blood;
   walked tiles turn darker; a scuff where an attack happened; Light board skips the trickles and the wear (rubble stays); the board
   turned (ROT89) draws without errors; Reduce motion = no settling; draw() time on a busy late board with and without the layer.
   SHOT=dir saves screenshots. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const out={};const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:SHOT?3:1});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
/* an event, paused; the pillar image loaded; drains: 192's own, else a stand-in two per side */
const st=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:['hero','soldier','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<40;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>4)break}
  SPEED='pause';SETTINGS.lite84='off';try{menuHide()}catch(e){}
  window.__stub=typeof ar91Drains!=='function'||!ar91Drains().length;
  if(window.__stub)window.ar91Drains=()=>{const o=[];const G=0.32,M=N-0.5+G;for(const c of [3,9]){o.push({...center(-0.5-G,c),r:-1,c},{...center(M,c),r:N,c})}for(const r of [3,9]){o.push({...center(r,-0.5-G),r,c:-1},{...center(r,M),r,c:N})}return o};
  for(let i=0;i<40&&!miniImg('pillar');i++)await W8(100);
  /* a quiet board: nobody near the spots the test paints */
  return {stub:window.__stub,img:!!miniImg('pillar'),pillars:S.pillars.length,phase:S.phase}});
out.start=st;ok(st.pillars>0,'0 the event has pillars');ok(st.img,'0 the pillar image loaded');
/* pixel helpers */
await pg.evaluate(()=>{window.__px=(x,y,w,h)=>{const g=cv.getContext('2d');const d=window.devicePixelRatio||1;return g.getImageData(Math.round(x*d),Math.round(y*d),Math.max(1,Math.round(w*d)),Math.max(1,Math.round(h*d))).data};
  window.__diff=(A,B)=>{let s=0;for(let i=0;i<A.length;i+=4)s+=Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2]);return s/(A.length/4)};
  window.__lum=A=>{let s=0;for(let i=0;i<A.length;i+=4)s+=0.299*A[i]+0.587*A[i+1]+0.114*A[i+2];return s/(A.length/4)};
  window.__mc=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},100);
  window.__top=async(p,pl)=>{const c=p.cpu;p.cpu=true;try{await Promise.race([doTopple(p,pl),new Promise(r=>setTimeout(r,5000))])}finally{p.cpu=c}};
  window.__park=()=>{/* move every piece to the far corner area so nothing covers the spots */let k=0;for(const p of S.players){p.r=12;p.c=12-k;k++}for(const n of S.npcs)if(n.alive){n.r=11;n.c=12-(k++%6)}}});
/* ======== 1. topple a pillar: rubble chunks + stump ======== */
const T=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));__park();
  /* a pillar with a free tile on one side and two in bounds on the other */
  let pick=null;for(const pl of S.pillars){for(const [dr,dc] of [[1,0],[0,1],[-1,0],[0,-1]]){const fr=pl.r-dr,fc=pl.c-dc;if(!inB(fr,fc)||!inB(pl.r+dr*2,pl.c+dc*2)||pillarAt(fr,fc))continue;pick={pl,dr,dc,fr,fc};break}if(pick)break}
  if(!pick)return {none:true};const p=S.players[0];p.r=pick.fr;p.c=pick.fc;p.mv=9;
  const calm0=SETTINGS.calm;SETTINGS.calm=false;await __top(p,pick.pl);SETTINGS.calm=calm0;__park();
  draw();const settling=WEAR91.stats.live+(RUB84.t.get(S.rubble[S.rubble.length-1])!=null?1:0);await W8(1700);draw();const s=WEAR91.stats;const rb=S.rubble[S.rubble.length-1];
  const m=center(rb.r,rb.c);const box=[m.x-TW*0.4,m.y-TW*0.5,TW*0.8,TW*0.65];const on=__px(...box);WEAR91.on=false;draw();const off=__px(...box);WEAR91.on=true;draw();
  const m1=center(rb.r+rb.dr,rb.c+rb.dc);const b1=[m1.x-TW*0.4,m1.y-TW*0.35,TW*0.8,TW*0.5];const on1=__px(...b1);WEAR91.on=false;draw();const off1=__px(...b1);WEAR91.on=true;draw();
  window.__rb=rb;return {settling,stumps:s.stumps,drums:s.drums,chips:s.chips,cached:s.cached,err:WEAR91.err||null,dStump:__diff(on,off),dDrum:__diff(on1,off1),tile:[rb.r,rb.c,rb.dr,rb.dc]}});
out.topple=T;ok(!T.none,'1 a pillar to topple');ok(T.settling>=1,'1 the rubble settles (live) right after the fall');
ok(T.stumps===1,'1 a stump is drawn');ok(T.drums>=1,'1 drum sections drawn');ok(T.chips>=4,'1 chips drawn');ok(T.cached,'1 the settled rubble is baked');
ok(T.dStump>6,'1 the stump changes the pillar tile '+(T.dStump||0).toFixed(1));ok(T.dDrum>6,'1 the drum changes the next tile '+(T.dDrum||0).toFixed(1));ok(!T.err,'1 no layer error '+T.err);
if(SHOT){const c=await pg.evaluate(()=>{const m=center(__rb.r+__rb.dr*0.6,__rb.c+__rb.dc*0.6);const r=cv.getBoundingClientRect();return {x:r.left+m.x-TW*1.8,y:r.top+m.y-TW*1.4,w:TW*3.6,h:TW*2.4}});
  await pg.screenshot({path:path.join(SHOT,'tv91w_rubble.png'),clip:{x:Math.max(0,c.x),y:Math.max(0,c.y),width:c.w,height:c.h}})}
/* ======== 2. blood at the edge: a trickle toward a drain, a stain, it fades ======== */
const B=await pg.evaluate(()=>{__park();S.blood=[];const r=0,c=4;bloodAt(r,c,'elim');bloodAt(r,c,'limb');draw();const s={...WEAR91.stats};
  /* sample just outside the edge, between the pool and the gully */
  const E=center(-0.62,c+0.0);const box=[E.x-TW*0.3,E.y-TW*0.25,TW*0.6,TW*0.4];
  const on=__px(...box);WEAR91.on=false;draw();const off=__px(...box);WEAR91.on=true;draw();const d0=__diff(on,off);
  const rot0=S.rotation;S.rotation=rot0+4;draw();const on4=__px(...box);WEAR91.on=false;draw();const off4=__px(...box);WEAR91.on=true;S.rotation=rot0;draw();const d4=__diff(on4,off4);
  return {trickles:s.trickles,stains:s.stains||0,drains:s.drains,d0,d4,err:WEAR91.err||null}});
out.blood=B;ok(B.trickles>=1,'2 a trickle is drawn');ok(B.drains>=1,'2 drains known');ok(B.stains>=1,'2 the drain that took blood is stained');
ok(B.d0>3,'2 the trickle shows past the edge '+B.d0.toFixed(1));ok(B.d4<B.d0*0.7,`2 it fades with the blood (${B.d0.toFixed(1)} → ${B.d4.toFixed(1)})`);
if(SHOT){const c=await pg.evaluate(()=>{const m=center(0,4);const r=cv.getBoundingClientRect();return {x:r.left+m.x-TW*1.8,y:r.top+m.y-TW*1.5,w:TW*3.6,h:TW*2.4}});
  await pg.screenshot({path:path.join(SHOT,'tv91w_trickle.png'),clip:{x:Math.max(0,c.x),y:Math.max(0,c.y),width:c.w,height:c.h}})}
/* ======== 3. walked tiles turn darker; a clash leaves a scuff ======== */
const Wk=await pg.evaluate(async()=>{__park();const p=S.players[1];const path=[[6,2],[6,3],[6,4],[6,5],[6,6]];const lum0=(()=>{draw();const m=center(6,4);return __lum(__px(m.x-TW*0.15,m.y-TW*0.06,TW*0.3,TW*0.12))})();
  for(let k=0;k<6;k++)for(const [r,c] of (k%2?[...path].reverse():path)){p.r=r;p.c=c;draw()}
  __park();draw();const m=center(6,4);const lum1=__lum(__px(m.x-TW*0.15,m.y-TW*0.06,TW*0.3,TW*0.12));
  const w=WEAR91_S.get(S);const cnt=w.cnt[6*N+4];
  /* a clash: doAttack's scuff (target out of reach of the rules: the counter is recorded before the rules run) */
  const sc0=w.scuff[8*N+8];const a=S.players[2],t=S.players[3];a.r=8;a.c=8;t.r=8;t.c=9;
  try{const src=(attackSources(a)||[])[0];if(src)await doAttack(a,src,{kind:'player',ref:t,key:'p'+t.id,r:t.r,c:t.c})}catch(e){}
  __park();draw();return {lum0,lum1,cnt,wear:WEAR91.stats.wear,scuff:w.scuff[8*N+8]-sc0,scuffs:WEAR91.stats.scuffs||0}});
out.walk=Wk;ok(Wk.cnt>=6,'3 steps counted on the path '+Wk.cnt);ok(Wk.lum1<Wk.lum0-2,`3 the walked tile is darker (${Wk.lum0.toFixed(1)} → ${Wk.lum1.toFixed(1)})`);ok(Wk.scuff>=1&&Wk.scuffs>=1,'3 a scuff where the attack happened');
/* ======== 4. Light board skips the trickles and the wear; the rubble stays ======== */
const Lt=await pg.evaluate(()=>{const v0=SETTINGS.lite84;SETTINGS.lite84='on';draw();const s={...WEAR91.stats};SETTINGS.lite84=v0;draw();return {lite:s.lite,trickles:s.trickles||0,wear:s.wear||0,scuffs:s.scuffs||0,stumps:s.stumps||0,chips:s.chips||0}});
out.lite=Lt;ok(Lt.lite&&!Lt.trickles&&!Lt.wear&&!Lt.scuffs,'4 Light board: no trickles, no wear');ok(Lt.stumps===1&&Lt.chips>0,'4 Light board keeps the rubble');
/* ======== 5. turned board: every quarter draws; the stump follows the turned tile ======== */
const Rt=await pg.evaluate(()=>{const want=rot89Want;const res=[];const g=cv.getContext('2d');
  for(let k=0;k<4;k++){rot89Want=()=>k;draw();const rb=__rb;const m=center(rb.r,rb.c);const on=__px(m.x-TW*0.3,m.y-TW*0.4,TW*0.6,TW*0.5);WEAR91.on=false;draw();const off=__px(m.x-TW*0.3,m.y-TW*0.4,TW*0.6,TW*0.5);WEAR91.on=true;draw();
    res.push({k:ROT89.k,stumps:WEAR91.stats.stumps,d:+__diff(on,off).toFixed(1),err:WEAR91.err||null})}
  rot89Want=want;draw();return res});
out.rot=Rt;ok(Rt.every(r=>r.stumps===1&&r.d>6&&!r.err),'5 every quarter turn draws the stump in place '+JSON.stringify(Rt));
/* ======== 6. Reduce motion: no settling ======== */
const Rm=await pg.evaluate(async()=>{__park();const pl=S.pillars.find(pl=>[[1,0],[0,1],[-1,0],[0,-1]].some(([dr,dc])=>inB(pl.r-dr,pl.c-dc)&&!pillarAt(pl.r-dr,pl.c-dc)));if(!pl)return {none:true};
  const [dr,dc]=[[1,0],[0,1],[-1,0],[0,-1]].find(([dr,dc])=>inB(pl.r-dr,pl.c-dc)&&!pillarAt(pl.r-dr,pl.c-dc));const p=S.players[0];p.r=pl.r-dr;p.c=pl.c-dc;p.mv=9;
  const c0=SETTINGS.calm;SETTINGS.calm=true;await __top(p,pl);__park();draw();const live=WEAR91.stats.live;SETTINGS.calm=c0;return {live,stumps:WEAR91.stats.stumps}});
out.calm=Rm;ok(!Rm.none&&Rm.live===0&&Rm.stumps===2,'6 Reduce motion: the rubble lies still at once '+JSON.stringify(Rm));
/* ======== 7. a busy late board: draw() cost ======== */
const P=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
  /* a third pillar down, blood all over (edges too), worn paths everywhere, scuffs */
  const pl=S.pillars.find(pl=>[[1,0],[0,1],[-1,0],[0,-1]].some(([dr,dc])=>inB(pl.r-dr,pl.c-dc)&&!pillarAt(pl.r-dr,pl.c-dc)));
  if(pl){const [dr,dc]=[[1,0],[0,1],[-1,0],[0,-1]].find(([dr,dc])=>inB(pl.r-dr,pl.c-dc)&&!pillarAt(pl.r-dr,pl.c-dc));const p=S.players[0];p.r=pl.r-dr;p.c=pl.c-dc;p.mv=9;const c0=SETTINGS.calm;SETTINGS.calm=true;await __top(p,pl);SETTINGS.calm=c0}
  for(let i=0;i<70;i++){const r=Math.floor(Math.random()*N),c=Math.floor(Math.random()*N);bloodAt(r,c,['elim','limb','drop'][i%3])}
  for(let i=0;i<16;i++){const e=i%4;const t=Math.floor(Math.random()*N);bloodAt(e===0?0:e===1?N-1:t,e===2?0:e===3?N-1:t,'limb')}
  const w=WEAR91_S.get(S);for(let i=0;i<N*N;i++){if(Math.random()<0.55)w.cnt[i]+=Math.random()*14;if(Math.random()<0.12)w.scuff[i]+=1+Math.floor(Math.random()*3)}w.ver++;
  S.rotation=(S.rotation|0)+3;/* late in the event */
  for(let i=0;i<S.players.length;i++){const p=S.players[i];p.r=3+i*2;p.c=4+i}
  const time=(n)=>{draw();const t0=performance.now();for(let i=0;i<n;i++)draw();return (performance.now()-t0)/n};
  /* warm every cache first (the crowd's sprites build on the first frames), then alternate on/off and keep the best of each */
  for(let i=0;i<40;i++)draw();let on=1e9,off=1e9,layer=0;for(let k=0;k<4;k++){const a=time(10);if(a<on){on=a;layer=WEAR91.lastMs}WEAR91.on=false;off=Math.min(off,time(10));WEAR91.on=true}
  /* worst case: the bake every frame (wear changes each draw) */
  const t0=performance.now();for(let i=0;i<10;i++){w.ver++;draw()}const rebake=(performance.now()-t0)/10;
  draw();return {on:+on.toFixed(2),off:+off.toFixed(2),layer:+layer.toFixed(3),rebake:+rebake.toFixed(2),bakeMs:+WEAR91.lastBakeMs.toFixed(2),stats:WEAR91.stats,blood:S.blood.length,rubble:S.rubble.length,err:WEAR91.err||null}});
out.perf=P;ok(!P.err,'7 no layer error');ok(P.on<P.off+4,`7 the baked layer is cheap (${P.on} vs ${P.off} ms)`);ok(P.stats.trickles>=4,'7 trickles on the busy board');
if(SHOT){await pg.screenshot({path:path.join(SHOT,'tv91w_late.png')});
  const c=await pg.evaluate(()=>{const m=center(6,6);const r=cv.getBoundingClientRect();return {x:r.left+m.x-TW*4,y:r.top+m.y-TW*2.5,w:TW*8,h:TW*5}});
  await pg.screenshot({path:path.join(SHOT,'tv91w_paths.png'),clip:{x:Math.max(0,c.x),y:Math.max(0,c.y),width:c.w,height:c.h}})}
/* ======== 8. the clean-up crew clears rubble: the stump goes with it ======== */
const Cl=await pg.evaluate(()=>{const n0=S.rubble.length;S.rubble=S.rubble.slice(1);draw();const s=WEAR91.stats.stumps||0;return {n0,stumps:s,left:S.rubble.length,isArr:Array.isArray(S.rubble)}});
out.clean=Cl;ok(Cl.stumps===Cl.left,'8 one stump per rubble left '+JSON.stringify(Cl));ok(Cl.isArr,'8 S.rubble is the real list again after draw');
await ctx.close();
console.log(JSON.stringify(out));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();

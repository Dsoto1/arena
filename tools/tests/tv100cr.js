/* v1.0 THE 3D CROWD (313-v100crowd): 1 the sheets (6 looks + 8 class stand-ins) load and the stands draw from them (one cached sprite a
   spectator, 193's seats/ring/hover data kept); 2 the cheers (209) and the stand-ups (283) still happen and pick the 3D poses; 3 zoomed:
   bigger sprites, and nothing paints over the sand (pixels inside the board identical with and without the crowd, flat and zoomed);
   4 the city forum walkers are the same 3D people (walk rows while they move), ambient (no hover); 5 Reduce motion: no stand-ups, the
   forum stands still; 6 the kill switch = 193 exactly (no 3D frames); 7 seeded dice + log identical ON vs OFF; 8 PERF ON vs OFF (crowd ms
   per frame and whole draw, flat and zoomed). Served over http (pixel reads). SHOT=dir saves screenshots. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[],miss=[],out={};const ok=(c,n)=>{if(!c)miss.push(n);else console.log('ok',n.slice(0,180))};const SHOT=process.env.SHOT||'';
const open=async(ls)=>{const cx=await b.newContext({viewport:{width:1440,height:900}});await cx.route(/fonts\./,r=>r.abort());
  await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return {pg,cx}};
const start=(pg,o)=>pg.evaluate(async(o)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(100)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{applySettings()}catch(e){}SPEED='pause';
  startEvent({ev:o.ev||'egidious',loc:o.loc||0,seed:o.seed,seats:['royalty','soldier','hero','venatore'].map((c,i)=>({cls:c,cpu:o.allCpu?true:i!==0})),opts:{spect:o.spect==null?48:o.spect}});
  for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}SPEED='pause';return !!S},o);
const ready=(pg)=>pg.waitForFunction(()=>CR100_SKEYS.every(k=>CR100.ready[k]),null,{timeout:30000}).then(()=>true,()=>false);

/* ---------------- 1-3: stands ---------------- */
const A=await open({});await start(A.pg,{});
const rdy=await ready(A.pg);
const R1=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const W=WALKS91.get(S);if(W)W.done=true;for(const sp of S.spect){sp._sa100=null;sp._cu92=0;sp.mood=60}draw();
  const meta=Object.keys(CROWD100_META.a).sort();const f0=CR100.frames;draw();
  return {meta,frames:CR100.frames-f0,seen:CR91.seen.length,n:S.spect.filter(s=>!s.gone).length,cnt:CR100.cnt,last:CR100.last,hits:CR100.hits,miss:CR100.miss,b:CR100.lastB,sheet:CROWD100_META.a.s0.w+'x'+CROWD100_META.a.s0.h}});
out.stands=R1;ok(rdy,'1 the six crowd sheets load');ok(R1.meta.length===14&&R1.meta.includes('s5')&&R1.meta.includes('c_damnatio'),'1 meta: 6 looks + 8 classes '+R1.meta.join(','));
ok(R1.frames===1,'1 the stands draw the 3D crowd');ok(R1.seen>=20&&R1.seen===R1.n,`1 every seated spectator drawn (${R1.seen}/${R1.n})`);ok((R1.cnt.sit||0)>=R1.n*0.8,'1 at rest they sit '+JSON.stringify(R1.cnt));
ok(R1.last<25,'1 crowd ms a frame '+R1.last.toFixed(2));
if(SHOT)await A.pg.screenshot({path:path.join(SHOT,'tv100cr_stands.png')});
/* 2 cheers + stand-ups */
const R2=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const now=performance.now();
  for(const sp of S.spect.slice(0,12))cheer92Start(sp,now,4);draw();const cheer=Object.assign({},CR100.cnt);
  for(const sp of S.spect){sp._cu92=0;sp._sa100=null}crowdReact('elim',{v:S.players[1],killer:S.players[0]});await W8(700);draw();const stand=Object.assign({},CR100.cnt);const sat=CR100.sat;
  const m0=CR100.miss;for(let i=0;i<4;i++)draw();const newSp=CR100.miss-m0;
  for(const sp of S.spect)sp.mood=0;const p0=CHEER92.p;CHEER92.p=[0,0,0,0,0];await W8(3400);CHEER92.p=p0;draw();const after=Object.assign({},CR100.cnt);return {cheer,stand,sat,after,newSp,standing:S.spect.filter(sp=>stand100Is(sp,performance.now())).length}});
out.cheer=R2;const up=c=>(c.sitcheer||0)+(c.sitfist||0)+(c.standcheer||0)+(c.standfist||0)+(c.stand||0);
ok(up(R2.cheer)>=10,'2 a burst (209) raises arms '+JSON.stringify(R2.cheer));ok((R2.stand.stand||0)+(R2.stand.standcheer||0)+(R2.stand.standfist||0)+R2.sat>=3,'2 an elimination stands them up (283) '+JSON.stringify(R2.stand)+' seated-for-the-sand '+R2.sat);
ok(R2.newSp===0,'2 the poses are cached sprites '+R2.newSp);ok(up(R2.after)===0,'2 they sit again '+JSON.stringify(R2.after));
if(SHOT){await A.pg.evaluate(async()=>{const now=performance.now();for(const sp of S.spect){if(Math.random()<0.4)cheer92Start(sp,now,4);if(Math.random()<0.25)stand100Start(sp,now,0)}draw()});await A.pg.screenshot({path:path.join(SHOT,'tv100cr_cheer.png')})}
/* 3 nothing over the sand: pixels inside the board identical with and without the crowd (everyone standing + cheering), flat and zoomed */
const sandSame=()=>A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const g=cv.getContext('2d');const now=performance.now();
  for(const sp of S.spect){sp._cu92=now+60000;sp._cp92=2;sp._sa100=now-1;sp._sb100=now+60000}
  const pts=[];const T=()=>ctx.getTransform();const grab=()=>{draw();const M=CR91.T||T();const out=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++){const m=center(r,c);for(const [dx,dy] of [[0,0],[-0.3,0],[0.3,0],[0,-0.3],[0,0.3]]){const p=M.transformPoint(new DOMPoint(m.x+dx*TW,m.y+dy*TH));
      const x=Math.round(p.x),y=Math.round(p.y);if(x<0||y<0||x>=cv.width||y>=cv.height)continue;const d=g.getImageData(x,y,1,1).data;out.push(d[0]+','+d[1]+','+d[2])}}return out};
  const on=grab();const keep=S.spect;S.spect=[];let off;try{off=grab()}finally{S.spect=keep}
  let bad=0;for(let i=0;i<on.length;i++)if(on[i]!==off[i]){const a=on[i].split(',').map(Number),c=off[i].split(',').map(Number);if(Math.max(Math.abs(a[0]-c[0]),Math.abs(a[1]-c[1]),Math.abs(a[2]-c[2]))>6)bad++}
  for(const sp of S.spect){sp._cu92=0;sp._sa100=null}return {n:on.length,bad,sat:CR100.sat,clipped:CR100.clipped,cnt:CR100.cnt,z:typeof CAM!=='undefined'?CAM.z:1,b:CR100.lastB}});
const F1=await sandSame();out.sandFlat=F1;ok(F1.n>500&&F1.bad===0,'3 flat: nothing over the sand ('+F1.bad+' of '+F1.n+' samples changed; seated for the sand '+F1.sat+', clipped '+F1.clipped+')');
const Z=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const b0=CR100.lastB;CAM.z=2.2;S.zoomIn=true;for(let i=0;i<40;i++){draw();await W8(30)}return {b0,b:CR100.lastB,z:CAM.z}});
const F2=await sandSame();out.sandZoom=Object.assign(F2,Z);ok(Z.b>Z.b0*1.3,`3 zoomed: bigger sprites (${Z.b0} → ${Z.b})`);ok(F2.bad===0,'3 zoomed: nothing over the sand ('+F2.bad+' of '+F2.n+')');
if(SHOT)await A.pg.screenshot({path:path.join(SHOT,'tv100cr_zoom.png')});
await A.pg.evaluate(async()=>{CAM.z=null;S.zoomIn=false;for(let i=0;i<30;i++){draw();await new Promise(r=>setTimeout(r,20))}});
/* 8 PERF ON vs OFF (one page: CR100.on toggled; 193's sprites warm too) */
const P=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const now=performance.now();for(const sp of S.spect){sp._cu92=0;sp._sa100=null}
  const meas=(n)=>{const c0=CR91.ms;const t=performance.now();for(let i=0;i<n;i++)draw();return {draw:(performance.now()-t)/n,crowd:(CR91.ms-c0)/n}};
  const res={};for(const z of [1,2]){CAM.z=z>1?z:null;S.zoomIn=z>1;for(let i=0;i<30;i++){draw();await W8(16)}const on=[],off=[];
    for(let k=0;k<4;k++){CR100.on=true;meas(4);on.push(meas(16));CR100.on=false;meas(4);off.push(meas(16))}CR100.on=true;
    const md=a=>{const s=a.slice().sort((x,y)=>x-y);return s[s.length>>1]};res['z'+z]={on:{draw:md(on.map(x=>x.draw)),crowd:md(on.map(x=>x.crowd))},off:{draw:md(off.map(x=>x.draw)),crowd:md(off.map(x=>x.crowd))}}}
  CAM.z=null;S.zoomIn=false;draw();return res});
out.perf=P;console.log('PERF crowd ON vs OFF (ms a frame, medians)',JSON.stringify(P));
for(const z of ['z1','z2'])ok(P[z].on.crowd<=P[z].off.crowd*1.6+1.5&&P[z].on.draw<=P[z].off.draw*1.25+3,`8 ${z} crowd ${P[z].on.crowd.toFixed(2)} vs ${P[z].off.crowd.toFixed(2)} ms, draw ${P[z].on.draw.toFixed(1)} vs ${P[z].off.draw.toFixed(1)} ms`);
/* 5a Reduce motion: no stand-ups, no bursts drawn */
const C=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(const sp of S.spect){sp._cu92=0;sp._sa100=null}SETTINGS.calm=true;crowdReact('elim',{v:S.players[1],killer:S.players[0]});await W8(900);draw();const c=Object.assign({},CR100.cnt);SETTINGS.calm=false;return c});
out.calm=C;ok(up(C)===0,'5 Reduce motion: everyone sits still '+JSON.stringify(C));
/* 7a the crowd never touches the dice: RNG.s unchanged over walk-ins, bursts, stand-ups, zoom and many draws */
const D7=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const s0=RNG.s;const f0=CR100.frames;const now=performance.now();
  WALKS91.delete(S);for(const sp of S.spect){if(Math.random()<0.5)cheer92Start(sp,now,4);if(Math.random()<0.3)stand100Start(sp,now,Math.random()*300)}
  for(let i=0;i<40;i++){if(i===20){CAM.z=2;S.zoomIn=true}draw();await W8(30)}CAM.z=null;S.zoomIn=false;draw();return {same:RNG.s===s0,frames:CR100.frames-f0}});
out.dice=D7;ok(D7.same&&D7.frames>=40,'7a the crowd draws never move the dice ('+D7.frames+' frames)');

/* ---------------- 4 the city forum ---------------- */
const Cy=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));try{gameOver&&0}catch(e){}openCitySquare(6);for(let i=0;i<60&&(!CITY.open||CITY.warm100);i++)await W8(150);
  for(let i=0;i<60&&!cr100CityReady();i++)await W8(100);CR100C.rows={};CR100C.n=0;await W8(4000);const rows=Object.assign({},CR100C.rows);
  const fig=CITY.npcs.filter(n=>n.kind!=='beast');const canv=fig.filter(n=>{const k='fg'+(n.g?n.g.id:n.id);return cityImg(k,'') instanceof HTMLCanvasElement}).length;
  /* ambient: a pointer over a walker hovers nothing */
  const n0=fig.find(n=>n._x!=null);let hov=null;if(n0){const R=CITY.cv.getBoundingClientRect();const k=R.width/CITY.cv.width;CITY.cv.dispatchEvent(new MouseEvent('mousemove',{clientX:R.left+n0._x*k,clientY:R.top+(n0._y-CITY.TW*0.5)*k,bubbles:true}));await W8(100);hov=CITY.hover&&CITY.hover.kind}
  return {open:CITY.open,ready:cr100CityReady(),figs:fig.length,canv,rows,n:CR100C.n,hov,seeded:CR100C.seeded,kinds:[...new Set(fig.map(n=>n.kind))]}});
out.city=Cy;const walkN=Object.keys(Cy.rows).filter(k=>/^walk/.test(k)).reduce((s,k)=>s+Cy.rows[k],0);
ok(Cy.open&&Cy.ready&&Cy.canv===Cy.figs&&Cy.figs>5,`4 every forum figure is a 3D sprite (${Cy.canv}/${Cy.figs}; ${Cy.kinds})`);ok(walkN>0&&(Cy.rows.stand||0)>0,'4 walkers step, the rest stand '+JSON.stringify(Cy.rows));
ok(!Cy.hov||Cy.hov==='bldg','4 ambient: no hover on a walker '+Cy.hov);
if(SHOT)await A.pg.screenshot({path:path.join(SHOT,'tv100cr_city.png')});
const Cc=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.calm=true;await W8(600);CR100C.rows={};await W8(2500);const r=Object.assign({},CR100C.rows);SETTINGS.calm=false;return r});
out.cityCalm=Cc;ok(!Object.keys(Cc).some(k=>/^walk/.test(k))&&(Cc.stand||0)>0,'5 Reduce motion: the forum stands still '+JSON.stringify(Cc));
const newErr=await A.pg.evaluate(()=>typeof ERR92!=='undefined'?(ERR92.list||ERR92.ring||[]).filter(e=>/crowd|cr100/i.test(JSON.stringify(e))).length:0);ok(newErr===0,'no crowd errors in the error log '+newErr);
await A.cx.close();

/* ---------------- 6 the kill switch ---------------- */
{const K=await open({flavius_crowd100off:'1'});await start(K.pg,{});const r=await K.pg.evaluate(async()=>{await new Promise(r=>setTimeout(r,800));const W=WALKS91.get(S);if(W)W.done=true;const m0=CR91.miss;draw();draw();
    return {on:CR100.on,frames:CR100.frames,loaded:Object.keys(CR100.img).length,seen:CR91.seen.length,miss:CR91.miss-m0}});
  out.kill=r;ok(!r.on&&r.frames===0&&r.loaded===0&&r.seen>=20,'6 kill switch: 193 draws, no sheet loaded '+JSON.stringify(r));await K.cx.close()}

/* ---------------- 7 seeded dice + log ON == OFF ---------------- */
const SP7=+(process.env.SP7||0); /* with spectators even two kill-switch runs differ (their acts follow the clock) — so 0 here, and the crowd's own draws are checked against RNG.s in 7a */const run=async off=>{const C=await open(off?{flavius_crowd100off:'1'}:{});await start(C.pg,{seed:313313,allCpu:true,ev:'democritus',loc:6,spect:SP7});
  const res=await C.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const L=[],R=[];
    const lb=log;log=function(h){if(S&&S.turnNo>=2&&S.turnNo<=8)L.push(S.turnNo+' '+String(h).replace(/<[^>]+>/g,''));return lb.apply(this,arguments)};
    const offT=BUS.on('turn.begin',e=>{if(e.turnNo<=8)R.push(e.turnNo+':'+RNG.s)});
    SPEED='fast';const iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},200);
    for(let i=0;i<1500&&!(S.over||S.turnNo>8);i++)await W8(100);clearInterval(iv);SPEED='pause';log=lb;offT();return {L,R,turn:S.turnNo,frames:CR100.frames}});await C.cx.close();return res};
const ON=await run(false),OFF=await run(true);const fl=x=>x.L.filter(l=>!/seed \d|seed <b>/.test(l));
ok(ON.R.length>=3&&OFF.R.length>=3,'7 both seeded runs played ('+ON.R.length+' / '+OFF.R.length+' turns; 3D frames '+ON.frames+' / '+OFF.frames+')');
ok(JSON.stringify(ON.R)===JSON.stringify(OFF.R),'7 same dice ON vs OFF '+JSON.stringify([ON.R,OFF.R]));
{const a=fl(ON),c=fl(OFF);let i=0;while(i<a.length&&a[i]===c[i])i++;ok(a.length===c.length&&i===a.length,'7 same log ON vs OFF (first difference at '+i+'/'+a.length+': '+JSON.stringify([a[i],c[i]])+')')}
console.log(JSON.stringify(out));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();

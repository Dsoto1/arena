/* v0.99 ZOOMED IN, SMOOTH AND STEADY (260-v99zoom): 1 pixel sanity — the board-frame tiles cache == a direct paint (±2 levels on
   anti-aliased seams); 2 the cache is reused while the camera eases (no rebuild per camera step); 3 seams + rim hold still while the camera
   eases (frames aligned by the camera shift: ON ≈ 0 pixels change, far fewer than with the kill switch); 4 a zoomed draw with a moving camera
   costs far less than before and stays near an unzoomed draw; 5 live all-CPU Normal: zoomed frame times within a margin of unzoomed;
   6 Reduce motion: the follow camera jumps; 7 kill switch localStorage flavius_zoom99off=1; no new errors. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const open=async(ls)=>{const cx=await b.newContext({viewport:{width:1440,height:900}});const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  await pg.goto(await require(path.join(__dirname,'..','perf95','serve.js'))(page)); /* http: a file:// canvas cannot be read back */
  await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
const start=(pg,seed)=>pg.evaluate(async seed=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
  for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}
  SPEED='pause';await W8(300);return !!S},seed);
const pg=await open();const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
ok(await start(pg,7),'0 started');

/* ---- 1 pixel sanity: cache vs direct paint (rim + tiles only: the other layers carry clocks) ---- */
const p1=await pg.evaluate(async()=>{const keep=['rim','tiles'];const others=LAYERS93.defs.map(d=>d[0]).filter(n=>!keep.includes(n));others.forEach(n=>LAYERS93.dbg.add(n));
  CAM.z=1.8;S.zoomIn=true;const p=cur();const at=()=>{CAM.fr=p.r;CAM.fc=p.c};
  const grab=()=>{at();draw();return ctx.getImageData(0,0,cv.width,cv.height).data};
  Z99.cache=false;const off=grab(),off2=grab();Z99.cache=true;grab();grab();const b0=Z99.stats.builds,h0=Z99.stats.hits;const on=grab();
  let n=0,max=0,noise=0,big=0,sum=0;for(let i=0;i<off.length;i++){if(off[i]!==off2[i])noise++;const d=Math.abs(off[i]-on[i]);sum+=d;if(d){n++;if(d>max)max=d;if(d>2)big++}}
  others.forEach(n=>LAYERS93.dbg.delete(n));return {n,max,noise,big,mean:+(sum/off.length).toFixed(3),total:off.length,hit:Z99.stats.hits>h0,rebuilt:Z99.stats.builds>b0,zoomed:z99Zoomed()}});
ok(p1.zoomed&&p1.hit&&!p1.rebuilt,'1a zoomed: a still board reuses the board-frame tiles '+JSON.stringify(p1));
/* the cache moves the edge-shade gradients' dither with the board (±1 level) and tiles cut by the screen edge anti-alias a little differently */
ok(p1.noise===0&&p1.mean<0.15&&p1.big<p1.total*0.001,'1b cache == direct paint (dither ±1, under 0.1% of values off by more than 2) '+JSON.stringify(p1));

/* ---- 2 + 3 the camera eases: no rebuilds, seams and rim stand still (frames aligned by the board shift) ---- */
const walk=(on,keep,stands)=>pg.evaluate(async([on,keep,stands])=>{const st0=STANDS;STANDS=stands;const others=LAYERS93.defs.map(d=>d[0]).filter(n=>!keep.includes(n));others.forEach(n=>LAYERS93.dbg.add(n));
  Z99.on=on;const out={};const b0=Z99.stats.builds;
  for(const z of [1.4,1.8,2.2]){CAM.z=z;S.zoomIn=true;draw();draw();const p=cur();const fr=[];const bz=Z99.stats.builds;
    for(let i=0;i<14;i++){CAM.fr=p.r-3+i*0.137;CAM.fc=p.c+2-i*0.091;draw();const dpr=devicePixelRatio;fr.push({ox:Math.round(OX*dpr),oy:Math.round(OY*dpr),d:ctx.getImageData(0,0,cv.width,cv.height).data,W:cv.width,H:cv.height})}
    let tot=0,diff=0,big=0;
    for(let i=1;i<fr.length;i++){const A=fr[i-1],B=fr[i];const dx=B.ox-A.ox,dy=B.oy-A.oy;
      for(let y=40;y<B.H-40;y+=2)for(let x=40;x<B.W-40;x+=2){const xa=x-dx,ya=y-dy;if(xa<0||ya<0||xa>=A.W||ya>=A.H)continue;const ib=(y*B.W+x)*4,ia=(ya*A.W+xa)*4;
        if(B.d[ib+3]===0&&A.d[ia+3]===0)continue;tot++;const pa=A.d[ia+3]/255,pb=B.d[ib+3]/255;
        const dd=Math.abs(B.d[ib]*pb-A.d[ia]*pa)+Math.abs(B.d[ib+1]*pb-A.d[ia+1]*pa)+Math.abs(B.d[ib+2]*pb-A.d[ia+2]*pa)+Math.abs(B.d[ib+3]-A.d[ia+3]);if(dd>3)diff++;if(dd>30)big++}}
    out[z]={tot,diff,big,builds:Z99.stats.builds-bz}}
  Z99.on=true;STANDS=st0;others.forEach(n=>LAYERS93.dbg.delete(n));CAM.z=null;S.zoomIn=false;draw();return out},[on,keep,stands]);
/* stands off: the rim lies bare beside the sand (with the stands on they cover its edges — 3c) */
const ON=await walk(true,['rim','tiles','floor'],false),OFF=await walk(false,['rim','tiles','floor'],false),ONS=await walk(true,['rim','stands','tiles','floor'],true);
{const s=o=>Object.values(o).reduce((a,v)=>({diff:a.diff+v.diff,big:a.big+v.big,tot:a.tot+v.tot,builds:a.builds+v.builds}),{diff:0,big:0,tot:0,builds:0});const a=s(ON),f=s(OFF);
  ok(a.builds===0,'2 the camera easing never rebuilds the zoomed tiles '+JSON.stringify(ON));
  ok(a.big===0&&a.diff<a.tot*0.0005,'3a seams + rim stand still while the camera eases (ON) '+JSON.stringify({on:a}));
  ok(f.diff>a.diff*5+20,'3b … where the old per-frame paint shimmered (OFF) '+JSON.stringify({on:a,off:f}));
  const c=s(ONS);ok(c.builds===0&&c.big<=c.tot*0.0002,'3c stands on: the board holds still too (the crowd may stir) '+JSON.stringify(ONS))}

/* ---- 4 draw cost with a moving camera: zoomed ON vs OFF vs unzoomed (paused board, mid-game) ---- */
await pg.evaluate(async()=>{SPEED='fast';const iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},200);await new Promise(r=>setTimeout(r,5000));clearInterval(iv);SPEED='pause';await new Promise(r=>setTimeout(r,500))});
const p4=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const cost=async(z,on)=>{Z99.on=on;CAM.z=z||null;S.zoomIn=!!z;draw();draw();await W8(50);const p=cur();const t0=performance.now();
    for(let i=0;i<24;i++){CAM.fr=p.r-1+i*0.05;CAM.fc=p.c+1-i*0.04;draw()}ctx.getImageData(0,0,1,1);return (performance.now()-t0)/24};
  const r={};r.flat=await cost(0,true);r.off=await cost(1.8,false);r.on=await cost(1.8,true);r.flat2=await cost(0,true);r.on2=await cost(1.8,true);
  Z99.on=true;CAM.z=null;S.zoomIn=false;draw();for(const k in r)r[k]=+r[k].toFixed(2);return r});
{const flat=Math.min(p4.flat,p4.flat2),on=Math.min(p4.on,p4.on2);
  ok(on<p4.off*0.5,'4a a zoomed draw with a moving camera costs under half of the old one '+JSON.stringify(p4));
  ok(on<flat*3+4,'4b … and stays near an unzoomed draw '+JSON.stringify(p4))}

/* ---- 5 live all-CPU Normal: zoomed vs unzoomed frame times ---- */
const live=z=>pg.evaluate(async z=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));CAM.z=z||null;S.zoomIn=!!z;SPEED='normal';const iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},250);
  await W8(800);const fr=[];let last=performance.now(),stop=false;const tick=()=>{const t=performance.now();fr.push(t-last);last=t;if(!stop)requestAnimationFrame(tick)};requestAnimationFrame(tick);
  await W8(4000);stop=true;clearInterval(iv);SPEED='pause';await W8(200);fr.sort((a,b)=>a-b);const q=p=>fr[Math.floor(fr.length*p)]||0;
  return {fps:+(fr.length/4).toFixed(1),p50:+q(.5).toFixed(1),p95:+q(.95).toFixed(1),over:!!S.over}},z);
const L0=await live(0),L1=await live(1.8),L0b=await live(0);
{/* against the mean of the two unzoomed runs (the run before and after; a loaded machine swings either one) */const u={fps:(L0.fps+L0b.fps)/2,p50:(L0.p50+L0b.p50)/2,p95:(L0.p95+L0b.p95)/2};
  ok(L1.over||L0.over||(L1.fps>=u.fps*0.5&&L1.p50<=u.p50*2+15),'5 zoomed all-CPU Normal: frame times within a margin of unzoomed '+JSON.stringify({unzoomed:[L0,L0b],zoomed:L1}))}

/* ---- 6 Reduce motion: the camera jumps to the acting gladiator ---- */
const p6=await pg.evaluate(()=>{const calm=SETTINGS.calm;SETTINGS.calm=true;CAM.z=1.8;S.zoomIn=true;const p=cur();CAM.fr=p.r-4;CAM.fc=p.c+4;draw();const r={fr:CAM.fr,fc:CAM.fc,r:p.r,c:p.c};
  SETTINGS.calm=false;CAM.fr=p.r-4;CAM.fc=p.c+4;draw();r.easeFr=CAM.fr;SETTINGS.calm=calm;CAM.z=null;S.zoomIn=false;draw();return r});
ok(p6.fr===p6.r&&p6.fc===p6.c&&p6.easeFr!==p6.r,'6 Reduce motion: the follow camera jumps (it eases otherwise) '+JSON.stringify(p6));

const newErr=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m):[],mark).catch(()=>[]);
ok(!newErr.length,'no new errors logged '+JSON.stringify(newErr).slice(0,300));

/* ---- 7 kill switch ---- */
const pk=await open({flavius_zoom99off:'1'});await start(pk,7);
const p7=await pk.evaluate(()=>{CAM.z=1.8;S.zoomIn=true;draw();draw();const p=cur();for(let i=0;i<4;i++){CAM.fr=p.r-1+i*0.3;draw()}const r={on:Z99.on,builds:Z99.stats.builds,hits:Z99.stats.hits,t96:TILES96.builds};CAM.z=null;S.zoomIn=false;draw();return r});
ok(!p7.on&&p7.builds===0&&p7.hits===0&&p7.t96>=3,'7 flavius_zoom99off=1: back to the per-frame paint '+JSON.stringify(p7));

console.log(JSON.stringify({p1,ON,OFF,ONS,p4,L0,L1,L0b,p6,p7}));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

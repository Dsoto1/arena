/* v1.01 workstream E (311 + 312 + 323-v101proj): 1 the sheets carry the new rows (idle 1 still frame, walk 8, act slash/sweep/thrust/throw,
   no limp/cower); 2 the attack row follows the weapon (blades random slash/sweep/thrust, heavy heads no poke, spears thrust, a throw throws,
   bows the old row) and never touches the dice; 3 G6: a standing gladiator holds idle:0 (no breathing, no cower with a beast hunting him,
   no limp on a hurt leg) and the clock goes quiet; standing beasts hold idle0; 4 G12: the walk row steps through ≥4 frames on a move;
   5 G10 VFX: a sword attack draws the slash arc after the pieces, none at Fast for a CPU / under Reduce motion; 6 G13: projectiles in
   flight get a ground shadow + trail + lit paint, arrows fly a higher arc; the kill switch = 55's drawing; no new errors. SHOT=dir → shots. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
/* ---- 1 meta ---- */
const s1=await pg.evaluate(()=>{const o={};for(const k of AN100.CLS){const M=ANIM100_META[k];const ar=M.act.rows,mr=M.move.rows;
    o[k]={idle:mr.idle.length,walk:mr.walk.length,slash:(ar.slash||[]).length,sweep:(ar.sweep||[]).length,thrust:(ar.thrust||[]).length,throw:(ar.throw||[]).length,limp:!!ar.limp,cower:!!ar.cower,v:M.act.v}}
  return {o,sets:AN100L.SETS,ver:AN100L.VER}});
ok(Object.values(s1.o).every(x=>x.idle===1&&x.walk===8&&x.slash===4&&x.sweep===4&&x.thrust===4&&x.throw===4&&!x.limp&&!x.cower&&x.v===2),'1 every class: idle 1 + walk 8 | slash/sweep/thrust/throw 4 each, no limp/cower '+JSON.stringify(s1));
/* a seeded Democritus, seat 0 human soldier, at its Action phase */
const st=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SETTINGS.calm=false;startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';
  for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}
  while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}
  SPEED='normal';const ready=()=>['soldier','hero'].every(k=>{const s=AN100.src.get('p:'+k);return s&&s.move.bm.idle&&s.move.bm.idle!==1});
  for(let i=0;i<100&&!ready();i++){draw();await W8(150)}
  window.__samp=async ms=>{const end=performance.now()+ms;while(performance.now()<end){draw();await new Promise(r=>setTimeout(r,20))}};
  window.__lay=()=>{const P=S.players[0],Q=S.players[1];const T=[[6,2],[6,3],[6,4],[7,3],[5,3],[7,4],[5,4],[6,5],[6,6]];const far=[];for(let c=0;c<N;c++){far.push([0,c]);far.push([N-1,c])}
    const busy=(r,c)=>S.players.some(p=>p.alive&&p.r===r&&p.c===c)||S.npcs.some(n=>n.alive&&n.r===r&&n.c===c)||S.pillars.some(p=>p.r===r&&p.c===c);
    for(const [r,c] of T){S.pillars=S.pillars.filter(p=>!(p.r===r&&p.c===c));S.spikes=S.spikes.filter(s=>!(s.r===r&&s.c===c));S.floor=(S.floor||[]).filter(f=>!(f.r===r&&f.c===c));
      for(const u of [...S.players,...S.npcs])if(u.alive&&u.r===r&&u.c===c&&u!==P&&u!==Q){const f=far.find(([a,b2])=>!busy(a,b2));u.r=f[0];u.c=f[1]}}
    for(const n of S.npcs)if(n.alive&&Math.max(Math.abs(n.r-6),Math.abs(n.c-3))<=3){const f=far.find(([a,b2])=>!busy(a,b2));n.r=f[0];n.c=f[1]}
    P.r=6;P.c=2;Q.r=6;Q.c=3;P.mv=8;render();draw();return {P,Q}};
  return {human:humanTurn(),phase:S.phase,ready:ready()}});
ok(st.human&&st.ready,'0 the human is to act, sheets decoded '+JSON.stringify(st));
/* ---- 2 the attack row by weapon ---- */
const s2=await pg.evaluate(()=>{const P=S.players[0];const r0=RNG.s;const pick=(k,thr,n=60)=>{const w=mkW(k);const o={};for(let i=0;i<n;i++){const r=an100AtkRow(P,{w,thr:!!thr},{r:P.r,c:P.c+1});o[r]=(o[r]||0)+1}return o};
  const o={gladius:pick('gladius'),pugio:pick('pugio'),axe:pick('axe'),hasta:pick('hasta'),hastaThr:pick('hasta',1),pilum:pick('pilum'),jade:pick('jade'),trident:pick('trident'),bow:pick('bow'),knives:pick('knives')};
  return {o,rng:RNG.s===r0}});
const K=o=>Object.keys(o).sort().join();
ok(K(s2.o.gladius)==='slash,sweep,thrust'&&K(s2.o.pugio)==='slash,sweep,thrust','2a blades pick slash / sweep / thrust at random '+JSON.stringify(s2.o));
ok(K(s2.o.axe)==='slash,sweep','2b heavy heads never poke '+JSON.stringify(s2.o.axe));
ok(['hasta','pilum','jade','trident'].every(k=>K(s2.o[k])==='thrust')&&K(s2.o.hastaThr)==='throw'&&K(s2.o.knives)==='throw','2c spears poke, a real throw throws '+JSON.stringify(s2.o));
ok(K(s2.o.bow)==='attack'&&s2.rng,'2d a bow keeps the old row; the dice never moved '+JSON.stringify(s2));
/* ---- 3 G6 no idle motion ---- */
const s3=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));__lay();SPEED='normal';const P=S.players[0];await __samp(400);
  /* a wild beast hunting him within 2 tiles (the old cower) + a hurt leg (the old limp) */
  const n=S.npcs.find(x=>x.alive&&!x.out);let beast=false;if(n){n.r=6;n.c=0;n.aggro=S.players.indexOf(P);n.tamedBy=null;beast=true}
  const keep=P.hp.rleg;P.hp.rleg=1;AN100.trace=[];await __samp(1600);const ps=[...new Set(AN100.trace.filter(x=>x.id===P.id&&x.pose).map(x=>x.pose))];AN100.trace=null;
  const pose=an100Pose(P,AN100.src.get('p:soldier'));
  /* the clock goes quiet: no frames while nothing moves */
  await W8(500);const f0=AN100.stats.frames;await W8(1500);const frames=AN100.stats.frames-f0;
  const bp=[...new Set([...BST100.last.values()].map(x=>x.pose))];
  P.hp.rleg=keep;if(n){n.aggro=null;n.r=0;n.c=N-1}
  return {ps,next:pose.next,frames,beast,bp}});
ok(s3.ps.length&&s3.ps.every(x=>x==='idle:0')&&s3.next===Infinity&&s3.beast,'3a standing: idle:0 only (no breathing, no cower near a hunting beast, no limp) '+JSON.stringify(s3));
ok(s3.frames<=1,'3b a still board: the gladiator clock draws nothing ('+s3.frames+' frames in 1.5 s)');
ok(!s3.bp.length||s3.bp.every(x=>x==='idle0'),'3c standing beasts hold idle0 '+JSON.stringify(s3.bp));
/* ---- 4 G12 the walk row steps ---- */
const s4=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const {P}=__lay();await W8(200);AN100.trace=[];SPEED='slow';P.mv=8;
  const mv=movePlayer(P,[5*N+2,4*N+2,4*N+3]);let dn=false;mv.then(()=>dn=true);while(!dn){draw();await W8(16)}await __samp(500);SPEED='normal';
  const ps=AN100.trace.filter(x=>x.id===P.id&&x.pose).map(x=>x.pose);AN100.trace=null;
  /* the pose clock alone (no board draws — a loaded machine draws only a few frames a tile): one glide of 300 ms walks half a stride */
  const sa=an100St(P),src=AN100.src.get('p:soldier');const seen=new Set();
  for(const off of [5,80,155,230]){const t0=performance.now()-off;sa.gd=300;sa.gt0=t0;sa.ws=t0;const q=an100Pose(P,src);seen.add(q.name+':'+q.i)}sa.gd=0;
  return {at:[P.r,P.c],walk:[...new Set(ps.filter(x=>/^walk/.test(x)))],last:ps[ps.length-1],clock:[...seen]}});
ok(s4.walk.length>=2&&/^idle:0$/.test(s4.last||''),'4a a move steps the walk row, then the still stance '+JSON.stringify(s4));
ok(s4.clock.filter(x=>/^walk:[0-3]$/.test(x)).length===4,'4b one tile\'s glide = half the 8-frame stride (walk 0–3) '+JSON.stringify(s4.clock));
/* ---- 5 G10 slash VFX ---- */
const s5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const {P,Q}=__lay();Q.r=6;Q.c=3;P.r=6;P.c=2;render();draw();
  const t={kind:'player',ref:Q,key:'p'+Q.id,r:Q.r,c:Q.c};const g={w:Object.assign(mkW('gladius'),{key:'gladius'})};
  const one=async()=>{AN100.poseMs=300;AN100.trace=[];AN100.vfx=[];const row=an100AtkRow(P,g,t);an100Act(P,row);an100Slash(P,row,g,t);const n0=AN100.vfx.length;await __samp(1400);
    const v=AN100.trace.filter(x=>x.id===P.id&&x.vfx).map(x=>x.vfx);AN100.trace=null;AN100.poseMs=120;return {row,n0,v:[...new Set(v)],left:AN100.vfx.length}};
  const o={};o.normal=await one();
  /* a real doAttack (the wrapper starts the row + the arc) */
  AN100.vfx=[];const src=attackSources(P).find(s=>s.w&&s.w.key==='gladius')||attackSources(P)[0];let real=null;if(src){const v0=AN100.stats.vfx||0;await doAttack(P,src,t);real={key:src.w&&src.w.key,vfx:(AN100.stats.vfx||0)-v0,acts:AN100.stats.acts}}o.real=real;
  /* Fast + a CPU attacker: no arc; Reduce motion: no arc */
  SPEED='fast';AN100.vfx=[];an100Slash(Q,'slash',g,{r:P.r,c:P.c});o.fastCpu=AN100.vfx.length;SPEED='normal';
  SETTINGS.calm=true;AN100.vfx=[];an100Slash(P,'slash',g,t);o.calm=AN100.vfx.length;SETTINGS.calm=false;
  AN100.vfx=[];an100Slash(P,'attack',g,t);o.bowRow=AN100.vfx.length;
  return o});
ok(s5.normal.n0===1&&s5.normal.v.length===1&&s5.normal.left===0,'5a a sword swing draws its arc after the pieces, then it is gone '+JSON.stringify(s5.normal));
ok(s5.real&&s5.real.vfx===1,'5b a real sword attack starts a swing row + the arc '+JSON.stringify(s5.real));
ok(s5.fastCpu===0&&s5.calm===0&&s5.bowRow===0,'5c no arc for a CPU at Fast, under Reduce motion, or for a non-swing row '+JSON.stringify(s5));
/* ---- 6 G13 projectiles ---- */
const s6=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const {P,Q}=__lay();Q.r=6;Q.c=6;render();draw();const z=Object.assign({},V101P.stats);
  projectile('arrow',()=>scr(P,0.62),()=>scr(Q,0.6),{arc:0.08,dur:900});const arc=PROJ[PROJ.length-1].arc;await __samp(450);
  const mid=Object.assign({},V101P.stats);await __samp(700);return {on:V101P.on,arc,shadows:mid.shadows-z.shadows,trails:mid.trails-z.trails,missiles:mid.missiles-z.missiles,left:PROJ.length}});
ok(s6.on&&s6.arc>=0.17&&s6.shadows>0&&s6.trails>0&&s6.missiles>0&&s6.left===0,'6a an arrow flies a higher arc with a ground shadow, a trail and the lit paint '+JSON.stringify(s6));
if(process.env.SHOT){const fs=require('fs');fs.mkdirSync(process.env.SHOT,{recursive:true});
  await pg.evaluate(async()=>{SPEED='pause';try{S.zoomIn=true}catch(e){}AN100_VFX.life=30;const {P,Q}=__lay();Q.r=6;Q.c=3;render();draw();await new Promise(r=>setTimeout(r,500))});
  for(const [nm,row,ms] of [['slash','slash',330],['sweep','sweep',330],['thrust','thrust',300],['throw','throw',260]]){
    await pg.evaluate(async([row,ms])=>{const P=S.players[0],Q=S.players[1];const t={r:Q.r,c:Q.c};AN100.vfx=[];SPEED='normal';an100Act(P,row);an100Slash(P,row,{w:mkW('gladius')},t);
      const end=performance.now()+ms;while(performance.now()<end){draw();await new Promise(r=>setTimeout(r,16))}SPEED='pause'},[row,ms]);
    await pg.screenshot({path:path.join(process.env.SHOT,'v101_'+nm+'.png')})}
  await pg.evaluate(async()=>{const P=S.players[0],Q=S.players[1];Q.r=6;Q.c=7;render();SPEED='normal';projectile('arrow',()=>scr(P,0.62),()=>scr(Q,0.6),{dur:1400});projectile('spear',()=>scr(Q,0.62),()=>scr(P,0.6),{arc:0.25,dur:1400});
    const end=performance.now()+600;while(performance.now()<end){draw();await new Promise(r=>setTimeout(r,16))}SPEED='pause'});
  await pg.screenshot({path:path.join(process.env.SHOT,'v101_projectiles.png')});
  await pg.evaluate(()=>{try{S.zoomIn=false;AN100_VFX.life=2.4}catch(e){}draw()})}
const newErr=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m):[],mark).catch(()=>[]);
ok(!newErr.length,'no new errors logged '+JSON.stringify(newErr).slice(0,300));
/* ---- 7 the projectile kill switch = 55's drawing ---- */
{const cx=await b.newContext({viewport:{width:1440,height:900}});const q=await cx.newPage();q.on('pageerror',e=>errs.push(e.message));await q.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await q.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_proj101off','1')});
  await q.goto('file://'+page,{timeout:180000});await q.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
  const k=await q.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed:777,seats:['soldier','hero','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
    for(let i=0;i<20;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
    const P=S.players[0],Q=S.players[1];projectile('arrow',()=>scr(P,0.62),()=>scr(Q,0.6),{arc:0.08,dur:600});const arc=PROJ.length?PROJ[PROJ.length-1].arc:-1;for(let i=0;i<10;i++){draw();await W8(30)}
    return {on:V101P.on,arc,stats:V101P.stats}});
  ok(!k.on&&k.arc===0.08&&k.stats.missiles===0&&k.stats.shadows===0,'7 kill switch: 55\'s projectiles exactly '+JSON.stringify(k));await cx.close()}
console.log(JSON.stringify({s1:Object.keys(s1.o).length,s2,s3,s4,s5,s6}));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

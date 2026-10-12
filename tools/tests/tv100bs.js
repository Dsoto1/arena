/* v1.0 ANIMATED 3D BEASTS (312-v100beasts): 1 every system beast has its two sheets (idle+walk, actions; spider one) and they decode to
   the meta's size; 2 a beast on the sand draws its sheet cell (idle, staggered), not the old token; 3 poses: walk + a glide while npcWalk
   moves it (ends on the rule's tile, no offset left), attack (npcAct), hit (hurtNPC), die (a ghost: die frames, then gone); 4 effects:
   the spider swarm uses the modelled spider, the Rete flies then stays wrapped while netted, Fortuna's Bounty tosses its two offerings
   (hidden until they land); 5 Fast = still + glide (no poses), Reduce motion = still (no glide), To the end = still, idle92 = no
   breathing draws, a hidden tab = no loop, the kill switch = no wrappers; 6 the seeded dice + log ON == OFF (Normal, all CPU, beasts on
   the sand); 7 PERF: a frame with 8 beasts ON vs OFF, and the idle scheduler's draw rate; no new errors. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const open=async(off)=>{const cx=await b.newContext({viewport:{width:1440,height:900}});const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await pg.addInitScript(([off])=>{if(sessionStorage.getItem('tv100bs'))return;sessionStorage.setItem('tv100bs','1');Object.defineProperty(navigator,'webdriver',{get:()=>false});
    localStorage.setItem('flavius_firstrun','shown');if(off)localStorage.setItem('flavius_beasts100off','1');else localStorage.removeItem('flavius_beasts100off')},[off]);
  await pg.goto('file://'+page,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return {pg,cx}};
const start=(pg,allCpu,seed)=>pg.evaluate(async([allCpu,seed])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{applySettings()}catch(e){}SPEED='pause';
  const cfg={ev:'democritus',loc:6,seats:['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:!!allCpu})),opts:{spect:0}};if(seed!=null)cfg.seed=seed;startEvent(cfg);
  for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}return !!S},[allCpu,seed]);
/* the same beasts on both runs (mkNPC: uid in step) */
const BEASTS=`[['lion','Leo',4,4],['lion','Leaena',4,8],['bear','Ursa',8,3],['wolf','Valencia',8,8],['snake','Glykon',6,11],['zora','Zora',10,6],['tholo','Tholo',2,6],['commodus','Commodus',11,10],['bear','Brutum',6,1],['wolf','Moechus',10,2],['snake','Arenosus',2,11]]`;

/* ---------------- ON ---------------- */
const A=await open(false);const pg=A.pg;const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
ok(await start(pg,false),'0 event started');
/* 1 sheets */
const sh=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const want=['leo','leaena','ursa','brutum','valencia','moechus','glykon','arenosus','zora','tholo','commodus'];
  const o={missing:[],bad:[],on:BST100.on,keys:Object.keys(BEAST100_META)};for(const k of [...want,'spider']){const M=BEAST100_META[k];if(!M||!M.iw||(k!=='spider'&&!M.aw)){o.missing.push(k);continue}bst100Img(k,0);if(M.aw)bst100Img(k,1)}
  for(let i=0;i<150&&Object.values(BST100.img).some(im=>!im._ok&&!im._bad);i++)await W8(100);
  for(const [id,im] of Object.entries(BST100.img)){const k=id.replace(/_act$/,''),M=BEAST100_META[k],me=/_act$/.test(id)?M.aw:M.iw;
    if(!im._ok||im.naturalWidth!==me[0]*8||im.naturalHeight!==me[1]*me[4])o.bad.push([id,im._ok,im.naturalWidth,im.naturalHeight,me])}
  o.rows=want.map(k=>BEAST100_META[k]&&[BEAST100_META[k].ir.length,BEAST100_META[k].ar.length]).filter(Boolean);return o});
ok(sh.on&&!sh.missing.length&&!sh.bad.length,'1a every system beast has its sheets, decoded to size '+JSON.stringify({missing:sh.missing,bad:sh.bad}));
ok(sh.rows.every(r=>r[0]===10&&r[1]===13),'1b idle 4 + walk 6 | attack 5 + hit 3 + die 5 (23 frames) '+JSON.stringify(sh.rows));
/* 2 on the board */
const bd=await pg.evaluate(async(BE)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SPEED='normal';SETTINGS.calm=false;SETTINGS.fx=true;S.npcs=[];
  for(const p of S.players){p.r=12;p.c=S.players.indexOf(p)*3+1}
  for(const [t,k,r,c] of eval(BE))S.npcs.push(mkNPC(t,k,r,c));BST100.last.clear();BST100.stats.poses={};render();draw();await W8(1300);draw();
  /* SETTLED first: SPEED normal lets any CPU seats ahead of the human play their turns (moves, attacks = draws every frame), and a loaded box
     takes seconds — the idle rate is measured on the human's own turn with nothing resolving */
  const cpuT=S.players.filter(p=>p.cpu).length;for(let i=0;i<200&&(S.busy||!cur()||cur().cpu||(typeof fxRAF!=='undefined'&&fxRAF)||(typeof CAM!=='undefined'&&CAM.raf));i++)await W8(100);
  /* …and the crowd's walk-in (193, drawn by 313: a 30 fps loop for ~7 s from the first shown frame, paused by stalls — on a loaded box it was
     still walking when the rate was taken: 25.5/s in CI run 39) */
  const walkOn=()=>{try{const W=walkState91();return !!(W&&!W.done)}catch(e){return false}};let wk=0;for(;wk<250&&walkOn();wk++)await W8(100);
  await W8(600);const who={cur:cur()&&cur().cpu?'cpu':'human',busy:!!S.busy,cpuT,walkWait:wk*100,walking:walkOn()};
  const keys=new Set([...BST100.last.values()].map(x=>x.k));const poses=new Set([...BST100.last.values()].map(x=>x.pose));
  const d0=BST100.stats.draws;await W8(2000);const rate=(BST100.stats.draws-d0)/2;
  /* the heartbeat recomputes PERF92.idle every beat: hold it on while measuring */
  const hold=setInterval(()=>{PERF92.idle=true},20);PERF92.idle=true;await W8(400);const d1=BST100.stats.draws;await W8(1500);const rateIdle=(BST100.stats.draws-d1)/1.5;clearInterval(hold);PERF92.idle=false;
  return {keys:[...keys],poses:[...poses],rate,rateIdle,mode:bst100Mode(),who}},BEASTS);
ok(bd.keys.length>=11&&bd.mode==='full','2a every beast drew its sheet cell '+JSON.stringify(bd.keys));
ok(bd.poses.some(p=>/^idle[1-3]$/.test(p))&&bd.poses.every(p=>/^idle\d$/.test(p)),'2b standing beasts breathe (idle poses, staggered) '+JSON.stringify(bd.poses));
ok(bd.rate>=1.5&&bd.rate<=8,'2c idle scheduler: a few draws a second, not a frame loop ('+bd.rate+'/s '+JSON.stringify(bd.who)+')');
ok(bd.rateIdle<=1,'2d idle92: the breathing waits ('+bd.rateIdle+'/s)');
/* 3 poses */
const po=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const P=S.players;SPEED='normal';
  const n=S.npcs.find(x=>x.key==='Leo');const tr=BST100.trace=[];BST100.stats.glides=0;
  const goal=[[4,7]];await npcWalk(n,goal,3);o.tile=[n.r,n.c];await W8(400);draw();
  o.walk=tr.filter(x=>/^walk/.test(x.pose||'')).length;o.glide=tr.filter(x=>x.glide).length;o.glides=BST100.stats.glides;const last=BST100.last.get(n.id);
  const m=center(n.r,n.c);o.end=last?[Math.round(last.x-m.x),Math.round(last.y-m.y),last.pose]:null;o.offLeft=!!bst100Off(n,BST100.anim.get(n),performance.now());
  /* attack: a CPU gladiator next to it (no defend window) */
  const v=P[1];v.cpu=true;v.r=n.r;v.c=n.c+1;BST100.trace=[];await npcAct(n,v,true);await W8(800);o.attack=BST100.trace.filter(x=>/^attack/.test(x.pose||'')).map(x=>x.pose);
  /* hit */
  BST100.trace=[];const w=S.npcs.find(x=>x.key==='Valencia');hurtNPC(w,1,P[0],'t');await W8(500);o.hit=BST100.trace.filter(x=>x.id===w.id&&/^hit/.test(x.pose||'')).map(x=>x.pose);
  /* die */
  const g=S.npcs.find(x=>x.key==='Glykon');const d0=BST100.stats.poses.die||0;hurtNPC(g,99,P[0],'t');o.ghost=BST100.ghosts.length;await W8(900);o.die=(BST100.stats.poses.die||0)-d0;
  await W8(2600);o.ghostAfter=BST100.ghosts.length;o.alive=g.alive;BST100.trace=null;v.cpu=false;return o});
ok(JSON.stringify(po.tile)==='[4,7]'&&po.walk>=2&&po.glide>=2&&po.glides>=1,'3a walking: walk poses + glides '+JSON.stringify(po));
ok(po.end&&Math.abs(po.end[0])<=1&&Math.abs(po.end[1])<=1&&!po.offLeft,'3b the walk ends on the rule\'s tile, no offset left '+JSON.stringify(po.end));
ok(po.attack.length>=1,'3c npcAct plays the attack frames '+JSON.stringify(po.attack));
ok(po.hit.length>=1,'3d hurtNPC plays the hit frames '+JSON.stringify(po.hit));
ok(po.ghost===1&&po.die>=2&&po.ghostAfter===0&&!po.alive,'3e a killed beast plays its die frames as a ghost, then goes '+JSON.stringify({g:po.ghost,die:po.die,after:po.ghostAfter}));
/* 4 effects */
const fx=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const P=S.players;SPEED='normal';
  const s0=BST100.stats.swarms;hitFlash(P[2].r,P[2].c,'spiders');await W8(600);o.swarm=BST100.stats.swarms-s0;o.hitfx=HITFX.filter(h=>h.kind==='spiders').length;
  /* the Rete: P[0] throws over Leaena */
  S.cur=0;const u=S.npcs.find(x=>x.key==='Leaena');const n0=BST100.stats.nets;u.netted=true;log('test: the net');o.net=BST100.stats.nets-n0;o.flying=BST100.nets.length;
  await W8(1400);const w0=BST100.stats.wraps||0;draw();await W8(100);draw();o.wraps=(BST100.stats.wraps||0)-w0;o.flyingAfter=BST100.nets.length;u.netted=false;draw();
  /* Fortuna's Bounty, no card left to draw */
  S.deck=[];const f0=(S.floor||[]).length,t0=BST100.stats.tosses;await resolveDrawn(P[0],'fortuna');const items=S.floor.slice(f0);o.toss=BST100.stats.tosses-t0;o.items=items.length;
  o.hidden=items.filter(f=>BST100.hideF.has(f)).length;o.hiddenTok=items.length?drawFloorTok(items[0],center(items[0].r,items[0].c)):null;await W8(1900);o.hiddenAfter=items.filter(f=>BST100.hideF.has(f)).length;o.puffs=BST100.puffs.length;
  return o});
ok(fx.swarm>=1&&fx.hitfx>=1,'4a the spider swarm draws the modelled spiders '+JSON.stringify(fx));
ok(fx.net===1&&fx.flying===1&&fx.wraps>=1&&fx.flyingAfter===0,'4b the Rete is thrown, then stays wrapped '+JSON.stringify(fx));
ok(fx.toss===2&&fx.items===2&&fx.hidden===2&&fx.hiddenTok===true&&fx.hiddenAfter===0,'4c Fortuna\'s Bounty tosses its two offerings, shown when they land '+JSON.stringify(fx));
/* 5 speeds */
const sp=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const n=S.npcs.find(x=>x.key==='Ursa');
  const walk=async()=>{BST100.trace=[];BST100.stats.glides=0;await npcWalk(n,[[n.r,n.c+2]],3);await W8(500);const t=BST100.trace;BST100.trace=null;
    return {glides:BST100.stats.glides,poses:[...new Set(t.filter(x=>x.pose).map(x=>x.pose))]}};
  SPEED='fast';o.fast=await walk();o.fastMode=bst100Mode();
  const a0=BST100.stats.poses.attack||0;bst100Act(n,'attack');await W8(400);o.fastAtk=(BST100.stats.poses.attack||0)-a0;
  SPEED='normal';SETTINGS.calm=true;o.calm=await walk();o.calmMode=bst100Mode();SETTINGS.calm=false;
  SPEED='snap';o.snap=bst100Mode();SPEED='normal';
  const h=Object.getOwnPropertyDescriptor(Document.prototype,'hidden');Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});o.hiddenLive=bst100Live();delete document.hidden;o.liveBack=bst100Live();
  return o});
ok(sp.fastMode==='fast'&&sp.fast.glides>=1&&sp.fast.poses.every(p=>p==='idle0')&&sp.fastAtk===0,'5a Fast: still (idle0) + glide, no action poses '+JSON.stringify(sp.fast)+' atk '+sp.fastAtk);
ok(sp.calmMode==='still'&&sp.calm.glides===0&&sp.calm.poses.every(p=>p==='idle0'),'5b Reduce motion: the still cell, no glide '+JSON.stringify(sp.calm));
ok(sp.snap==='still','5c To the end: still');
ok(sp.hiddenLive===false&&sp.liveBack===true,'5d a hidden tab: no loop '+JSON.stringify([sp.hiddenLive,sp.liveBack]));
/* 7 PERF: one frame (draw + raster) with 11 beasts, ON vs runtime OFF, a few rounds */
const pf=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const fr=()=>new Promise(r=>requestAnimationFrame(r));SPEED='normal';
  for(const n of S.npcs)n.alive=true;BST100.ghosts=[];BST100.nets=[];BST100.tosses=[];BST100.puffs=[];
  const meas=async on=>{BST100.on=on;await fr();await fr();const T=[];for(let i=0;i<24;i++){const t=performance.now();draw();await fr();T.push(performance.now()-t)}T.sort((a,b)=>a-b);return T[Math.floor(T.length/2)]};
  const r={on:[],off:[]};for(let k=0;k<3;k++){r.on.push(await meas(true));r.off.push(await meas(false))}BST100.on=true;
  const med=a=>a.slice().sort((x,y)=>x-y)[1];return {on:+med(r.on).toFixed(1),off:+med(r.off).toFixed(1),cellMs:+(BST100.stats.ms/Math.max(1,BST100.stats.cells)).toFixed(3)}});
ok(pf.on<=pf.off*1.35+3,'7 a frame with 11 beasts ON vs OFF '+JSON.stringify(pf));
const newErr=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m):[],mark).catch(()=>[]);
ok(!newErr.length,'no new errors logged '+JSON.stringify(newErr).slice(0,300));
await A.cx.close();

/* ---------------- kill switch ---------------- */
const K=await open(true);ok(await start(K.pg,false),'0b event started (off)');
const ks=await K.pg.evaluate(()=>({on:BST100.on,fig:/bst100Piece/.test(drawFigureTok.toString()),mini:/bst100Piece/.test(miniDraw.toString()),npc:/bst100/.test(drawNPC.toString()),fx:/bst100/.test(drawFX.toString())}));
ok(!ks.on&&!ks.fig&&!ks.mini&&!ks.npc&&!ks.fx,'5e kill switch: nothing wrapped '+JSON.stringify(ks));await K.cx.close();

/* ---------------- 6 the same dice and log ON vs OFF (Normal, all CPU, seeded, beasts aggro on the sand) ---------------- */
const run=async off=>{const C=await open(off);
  /* the beasts go on the sand inside startEvent (event.start: before any turn), the same on both runs */
  await C.pg.evaluate(BE=>{window.__L=[];const lb=log;log=function(h){if(S&&S.turnNo>=2&&S.turnNo<=7)__L.push(S.turnNo+' '+String(h).replace(/<[^>]+>/g,''));return lb.apply(this,arguments)};
    const off=BUS.on('event.start',()=>{off();for(const [t,k,r,c] of eval(BE).slice(0,6)){if(S.npcs.some(n=>n.r===r&&n.c===c)||S.players.some(p=>p.r===r&&p.c===c))continue;const n=mkNPC(t,k,r,c);n.aggro=S.players[S.npcs.length%4].id;n.aggroWhy='test';S.npcs.push(n)}})},BEASTS);
  const okS=await start(C.pg,true,616161);
  const res=await C.pg.evaluate(async(BE)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const L=__L,R=[];
    const offT=BUS.on('turn.begin',e=>{if(e.turnNo<=7)R.push(e.turnNo+':'+RNG.s)});
    SPEED='normal';const iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},200);
    for(let i=0;i<1500&&!(S.over||S.turnNo>7);i++)await W8(100);clearInterval(iv);SPEED='pause';offT();
    return {L,R,turn:S.turnNo,cells:typeof BST100!=='undefined'?BST100.stats.cells:0,poses:typeof BST100!=='undefined'?BST100.stats.poses:null}},BEASTS);await C.cx.close();res.ok=okS;return res};
const ON=await run(false),OFF=await run(true);const fl=x=>x.L.filter(l=>!/seed \d|seed <b>/.test(l));
ok(ON.ok&&OFF.ok&&ON.R.length>=3&&ON.cells>0,'6a both seeded runs played, beasts drawn ON '+JSON.stringify([ON.R.length,OFF.R.length,ON.turn,OFF.turn,ON.cells,ON.poses]));
ok(JSON.stringify(ON.R)===JSON.stringify(OFF.R),'6b same dice ON vs OFF '+JSON.stringify([ON.R.slice(0,3),OFF.R.slice(0,3)]));
{const a=fl(ON),c=fl(OFF);let i=0;while(i<a.length&&a[i]===c[i])i++;ok(a.length===c.length&&i===a.length,'6c same log ON vs OFF (first difference at '+i+'/'+a.length+': '+JSON.stringify([a[i],c[i]])+')')}
console.log(JSON.stringify({bd,po,fx,sp,pf,poses:ON.poses}));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

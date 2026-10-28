/* v1.0 PUSH ANIMATION (294-v100push): 1 a push animates — the shoved piece's drawn position passes through several intermediate points
   over several frames and ends on the rule's tile, the pusher lunges and ends on its rule tile with no offset left; a CPU push (cpuTactic's
   pick) animates the same way; 2 the spike damage lands AFTER the slide; 3 Reduce motion = the instant jump; 4 Fast = one paced frame for a CPU, the full shove for your own;
   5 the same three pushes (gladiator onto a spike, pillar, beast) from one snapshot with the module on and off: same log, same dice,
   same state; 6 a pillar push; no new errors. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
/* a seeded Democritus, seat 0 human; snap through the CPUs to the human's Action phase, then pause the clock of the event (nothing runs) */
const st=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'hero'},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';
  for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}
  while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}
  SPEED='normal';await W8(300);
  window.__snap={txt:JSON.stringify(S,(k,v)=>v instanceof Set?{__set:[...v]}:v instanceof Map?{__map:[...v]}:v),rng:RNG.s,uid};
  return {phase:S.phase,human:humanTurn(),cur:S.cur,npcs:S.npcs.filter(n=>n.alive).length,pillars:S.pillars.length,on:PUSH100.on}});
ok(st.human&&st.phase==='action'&&st.on,'0 the human is to act, module on '+JSON.stringify(st));

/* the scenario: restore the snapshot, lay out the pieces, push three times. Returns what happened. */
await pg.evaluate(()=>{
  window.__restore=()=>{const sn=window.__snap;const fresh=JSON.parse(sn.txt,(key,v)=>v&&typeof v==='object'&&!Array.isArray(v)?(v.__set?new Set(v.__set):v.__map?new Map(v.__map):v):v);
    for(const p of fresh.players){const c=p._cf!=null?p._cf:(p.cf||0);delete p.cf;p._cf=c;cfTrack(p)}S=fresh;RNG.s=sn.rng>>>0;uid=sn.uid;
    PUSH100.wob.clear();PUSH100.dust.length=0;PUSH100.scrapes.length=0;PUSH100.live.clear();render();draw()};
  window.__layout=()=>{const P=S.players[0],Q=S.players[1];const keep=new Set([P,Q]);
    const T=[[6,2],[6,3],[6,4],[7,3],[8,3],[8,4],[9,5],[7,2],[5,3],[7,4],[9,3],[10,5]];const far=[];for(let c=0;c<N;c++){far.push([0,c]);far.push([N-1,c])}
    const busy=(r,c)=>S.players.some(p=>p.alive&&p.r===r&&p.c===c)||S.npcs.some(n=>n.alive&&n.r===r&&n.c===c)||S.pillars.some(p=>p.r===r&&p.c===c);
    for(const [r,c] of T){S.pillars=S.pillars.filter(p=>!(p.r===r&&p.c===c));S.spikes=S.spikes.filter(s=>!(s.r===r&&s.c===c));S.floor=(S.floor||[]).filter(f=>!(f.r===r&&f.c===c));
      for(const u of [...S.players,...S.npcs])if(u.alive&&u.r===r&&u.c===c&&!keep.has(u)){const f=far.find(([a,b2])=>!busy(a,b2));u.r=f[0];u.c=f[1]}}
    if(S.tiles)for(const [r,c] of T)if(S.tiles[r]&&S.tiles[r][c]&&S.tiles[r][c].water)S.tiles[r][c].water=false;
    P.r=6;P.c=2;Q.r=6;Q.c=3;Q.alive=true;S.spikes.push({r:6,c:4});P.mv=20;
    const pl=S.pillars[0]||null;if(pl){pl.r=7;pl.c=3}
    const n=S.npcs.find(x=>x.alive&&!x.out&&x.tamedBy==null)||null;if(n){n.r=8;n.c=4;S.spikes.push({r:9,c:5})}
    render();draw();return {P,Q,pl,n}};
  window.__run=async(opt={})=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const L=[];const lb=log;log=function(h){L.push(String(h).replace(/<[^>]+>/g,''));return lb.apply(this,arguments)};
    const hb=hurt;let spikeAt0=0;hurt=function(v,loc,d,src,pre){if(String(pre||'').includes('spike')&&!spikeAt0)spikeAt0=performance.now();return hb.apply(this,arguments)};
    const out={pushes:[]};
    let P0=null,cpu0=false;try{const {P,Q,pl,n}=__layout();P0=P;cpu0=P.cpu;if(opt.cpu)P.cpu=true;
      /* 1 the gladiator onto the spike */
      const t1=pushTargets(P).find(t=>t.u===Q);
      if(opt.trace)PUSH100.trace=[];const a0=PUSH100.anims,f0=PUSH100.frames,t0=performance.now();
      await doPush(P,t1);
      out.pushes.push({ms:Math.round(performance.now()-t0),anims:PUSH100.anims-a0,frames:PUSH100.frames-f0,slideEnd:PUSH100.lastSlideEnd,spike:spikeAt0,
        P:[P.r,P.c],Q:[Q.r,Q.c],offP:push100At(P)&&!!push100At(P).a,qFinal:center(Q.r,Q.c),trace:PUSH100.trace||null});
      PUSH100.trace=null;
      if(opt.one)return out;
      /* 2 the pillar */
      if(pl){const t2=pushTargets(P).find(t=>t.pl===pl);out.pl=!!t2;if(t2){const a1=PUSH100.anims;if(opt.trace)PUSH100.trace=[];await doPush(P,t2);out.pushes.push({anims:PUSH100.anims-a1,pl:[pl.r,pl.c],P:[P.r,P.c],trace:PUSH100.trace});PUSH100.trace=null}}
      /* 3 the beast onto a spike — the CPU's own pick (cpuTactic scores an enemy onto spikes 10) */
      if(n){const wasCpu=P.cpu,wd=P.diff;P.cpu=true;if(P.diff==='easy')P.diff='normal';const tac=cpuTactic(P);P.cpu=wasCpu;P.diff=wd;
        const t3=tac&&tac.kind==='push'&&tac.t.u===n?tac.t:pushTargets(P).find(t=>t.u===n);out.cpuPick=!!(tac&&tac.t&&tac.t.u===n);out.n=!!t3;
        if(t3){const a2=PUSH100.anims;await doPush(P,t3);out.pushes.push({anims:PUSH100.anims-a2,n:[n.r,n.c,n.aggro,n.hp],P:[P.r,P.c]})}}
      await W8(50)}
    finally{log=lb;hurt=hb;if(P0)P0.cpu=cpu0}
    out.L=L;out.rng=RNG.s;
    out.sig=JSON.stringify([S.players.map(p=>[p.r,p.c,p.alive,p.hp,p.ap,p.mv,p.coin,Math.round(p.cf||0)]),S.npcs.map(n=>[n.t,n.r,n.c,n.hp,n.alive,n.aggro]),S.pillars.map(p=>[p.r,p.c,(p.pots||[]).length]),S.spikes,S.turnNo,S.phase]);
    out.full=JSON.stringify(S,(k,v)=>typeof k==='string'&&(k[0]==='_'||k==='bubbles'||k==='blood')?undefined:v instanceof Set?[...v]:v instanceof Map?[...v]:v);
    out.hash=typeof onlHash==='function'?onlHash():null;return out}});

/* ---- 1 + 2 Normal, ON ---- */
/* load calibration: on a busy machine a frame (one board draw) is long, so the traced slide is stretched to ~10 draws */
const DRAW=await pg.evaluate(async()=>{const fr=()=>new Promise(r=>requestAnimationFrame(r));await fr();const t=performance.now();for(let i=0;i<5;i++){draw();await fr()}return (performance.now()-t)/5});
/* a frame of the animation (draw + the pieces' offsets + fx + one rAF) costs a few times DRAW, and that factor moves with the machine's load:
   so the stretch is MEASURED, not assumed — run, count the frames the slide really got, and if it got fewer than 12 stretch it to ~16 frames
   at the cost seen and run again from the snapshot (same state each time; <=4 tries, the last run is judged). */
await pg.evaluate(()=>{window.__stretch=async(opt,speed,D)=>{const keep=PUSH100.ms;let ms=Math.max(keep,Math.round(D*16)),out;
  try{for(let i=0;i<4;i++){__restore();SPEED=speed;PUSH100.ms=ms;out=await __run(opt);const f=out.pushes[0].frames,t=out.pushes[0].ms;
      if(f>=12||t>=30000)break;ms=Math.min(30000,Math.round(Math.max(ms,t)*16/Math.max(f,1)))}}
  finally{SPEED='normal';PUSH100.ms=keep}
  return out}});
const A=await pg.evaluate(async D=>{SETTINGS.calm=false;return await __stretch({trace:true},'normal',D)},DRAW);
const p1=A.pushes[0]||{};const tr=(p1.trace||[]).filter(x=>x.role==='pushed');const trP=(p1.trace||[]).filter(x=>x.role==='pusher');
const mids=new Set(tr.filter(x=>x.k>0.02&&x.k<0.98).map(x=>Math.round(x.x)+','+Math.round(x.y)));
let mono=true;for(let i=1;i<tr.length;i++)if(tr[i].k<tr[i-1].k)mono=false;
ok(A.cpuPick&&A.n&&A.pushes[2]&&A.pushes[2].anims===1,'1a a CPU push (cpuTactic: a beast onto a spike) animates too '+JSON.stringify({cpuPick:A.cpuPick,n:A.n,p:A.pushes[2]}));
ok(p1.anims===1&&p1.frames>=5&&p1.ms>=200,'1b the push animates over several frames '+JSON.stringify({anims:p1.anims,frames:p1.frames,ms:p1.ms}));
ok(mids.size>=4&&mono,'1c the shoved piece is drawn at several intermediate points, moving forward only '+JSON.stringify({mids:mids.size,mono,n:tr.length}));
ok(JSON.stringify(p1.Q)==='[6,4]'&&JSON.stringify(p1.P)==='[6,3]'&&!p1.offP,'1d both pieces end on the rule\'s tiles, no offset left '+JSON.stringify({P:p1.P,Q:p1.Q,off:p1.offP}));
{const last=tr[tr.length-1];const d=last&&p1.qFinal?Math.hypot(last.x-p1.qFinal.x,last.y-p1.qFinal.y):1e9;ok(d<10,'1e the slide ends where the rule puts it ('+Math.round(d)+' px)')}
ok(trP.some(x=>x.k>0.1&&x.k<0.4)&&trP.length>=4,'1f the pusher lunges (leans, then follows) '+JSON.stringify({n:trP.length,ks:trP.slice(0,6).map(x=>x.k)}));
ok(p1.spike>0&&p1.spike>=p1.slideEnd,'2 the spike damage lands after the slide '+JSON.stringify({spike:p1.spike,slideEnd:p1.slideEnd}));
ok(A.pl&&A.pushes[1]&&A.pushes[1].anims===1&&JSON.stringify(A.pushes[1].pl)==='[8,3]','6 a pillar push animates and lands '+JSON.stringify(A.pushes[1]&&{a:A.pushes[1].anims,pl:A.pushes[1].pl}));

/* ---- 3 Reduce motion = the jump ---- */
const R=await pg.evaluate(async()=>{__restore();SPEED='normal';SETTINGS.calm=true;try{return await __run({one:true})}finally{SETTINGS.calm=false}});
ok(R.pushes[0].anims===0&&R.pushes[0].frames===0&&R.pushes[0].ms<Math.max(150,DRAW*3)&&JSON.stringify(R.pushes[0].Q)==='[6,4]','3 Reduce motion: the instant jump '+JSON.stringify({a:R.pushes[0].anims,ms:R.pushes[0].ms}));
/* ---- 4 Fast: a CPU's push = one paced frame; your own push still plays (his SPEED × ANIMATION pick a) ---- */
const F=await pg.evaluate(async()=>{__restore();SPEED='fast';try{return await __run({one:true,cpu:true})}finally{SPEED='normal'}});
ok(F.pushes[0].anims===1&&F.pushes[0].frames===1&&F.pushes[0].ms<Math.max(300,DRAW*4)&&JSON.stringify(F.pushes[0].Q)==='[6,4]','4a Fast, CPU pusher: one frame '+JSON.stringify({a:F.pushes[0].anims,f:F.pushes[0].frames,ms:F.pushes[0].ms}));
const F2=await pg.evaluate(async D=>__stretch({one:true},'fast',D),DRAW);
ok(F2.pushes[0].anims===1&&F2.pushes[0].frames>=5&&JSON.stringify(F2.pushes[0].Q)==='[6,4]','4b Fast, your own push still animates '+JSON.stringify({a:F2.pushes[0].anims,f:F2.pushes[0].frames,ms:F2.pushes[0].ms}));

/* ---- 5 ON vs OFF from the same snapshot: log, dice, state ---- */
const B=await pg.evaluate(async()=>{__restore();SPEED='normal';PUSH100.on=false;try{return await __run({})}finally{PUSH100.on=true}});
ok(B.pushes.every(p=>p.anims===0),'5a off: no animation');
ok(A.pushes.length>=2&&A.pushes.length===B.pushes.length,'5b same pushes both ways '+A.pushes.length+'/'+B.pushes.length+' beast:'+!!A.n);
{let k=0;while(k<A.L.length&&A.L[k]===B.L[k])k++;ok(A.L.length===B.L.length&&k===A.L.length,'5c same log ON vs OFF (first difference at '+k+'/'+A.L.length+': '+JSON.stringify([A.L[k],B.L[k]])+')')}
ok(A.rng===B.rng,'5d same dice ON vs OFF '+A.rng+' '+B.rng);
ok(A.sig===B.sig&&A.hash===B.hash,'5e same pieces and online hash ON vs OFF');
{let k=0;while(k<A.full.length&&A.full[k]===B.full[k])k++;ok(A.full===B.full,'5f same S (without display-only _keys , the speech bubbles (wall-clock lifetime) and the blood splats (Math.random seeds)) ON vs OFF, first difference at '+k+': '+JSON.stringify([A.full.slice(Math.max(0,k-80),k+60),B.full.slice(Math.max(0,k-80),k+60)]))}
/* the kill switch reaches the module */
const ks=await pg.evaluate(()=>typeof push100Motion==='function'&&typeof push100Pose!=='undefined');ok(ks,'hook push100Pose exists');

const newErr=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m):[],mark).catch(()=>[]);
ok(!newErr.length,'no new errors logged '+JSON.stringify(newErr).slice(0,300));
console.log(JSON.stringify({DRAW,st,p1:{ms:p1.ms,frames:p1.frames,mids:mids.size},R:R.pushes[0].ms,F:F.pushes[0],L:A.L.length}));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

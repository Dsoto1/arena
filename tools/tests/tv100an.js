/* v1.0 ANIMATED GLADIATOR TOKENS (311-v100anim): 1 the printed classes' stand-in sheets load (move sheet + per-action bitmaps only when
   used) and the board draws them; 2 a move GLIDES (several intermediate offsets) and steps the walk row; 3 an attack steps the attack
   row, a blow steps hit/block on the target; 4 an elimination plays the fall row where he fell; 5 FAST: a CPU stays on its still cell
   (flash only), your own gladiator still animates; 6 Reduce motion: still cell, no glide, no flash; 7 perf: a board draw with the
   stand-ins vs today's tokens in one page; 8 the kill switch = today's drawing, no sheet requested; 9 the same seeded dice + log with the
   module on vs off (fresh browsers, Normal speed); 10 the on-device cache (IndexedDB) round-trips; 11 severed sets (arm / leg swap, loaded only then, two limbs → today's token);
   12 gear-true figures: a non-kit seat renders on the device keyed by its loadout, kit seats don't, severed with real gear; no new errors. SHOT=dir → shots. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
/* a seeded Democritus, seat 0 human soldier; snap through the CPUs to the human's Action phase */
const st=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SETTINGS.calm=false;startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';
  for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}
  while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}
  SPEED='normal';
  /* the sheets: drawing asks for them; wait until the four classes' move sheets are decoded */
  const ready=()=>['soldier','hero','royalty','venatore'].every(k=>{const s=AN100.src.get('p:'+k);return s&&s.move.bm.idle&&s.move.bm.idle!==1});
  for(let i=0;i<100&&!ready();i++){draw();await W8(150)}
  return {phase:S.phase,human:humanTurn(),on:AN100.on,ready:ready(),meta:Object.keys(ANIM100_META).length}});
ok(st.human&&st.phase==='action'&&st.on,'0 the human is to act, module on '+JSON.stringify(st));
ok(st.ready&&st.meta===8,'1a the 8 classes have sheets; the four on the board are decoded '+JSON.stringify(st));
/* ---- 1 sheets drawn; act rows decoded only when used ---- */
const s1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const d0=AN100.stats.draws;draw();const so=AN100.src.get('p:soldier');
  const actBm=Object.keys(so.act.bm);const fr=()=>new Promise(r=>requestAnimationFrame(r));await W8(600);
  const urls=performance.getEntriesByType('resource').map(e=>e.name).filter(n=>/anim100_/.test(n)).map(n=>n.split('/').pop());
  return {drew:AN100.stats.draws-d0,moveW:so.move.img&&so.move.img.naturalWidth,actImg:!!so.act.img,actBm,urls}});
ok(s1.drew>=4&&s1.moveW>100,'1b one draw paints the four stand-ins '+JSON.stringify(s1));
ok(s1.actBm.length===0,'1c no action row is decoded before an action happens (memory) '+JSON.stringify(s1.actBm));
const s1b=await pg.evaluate(async()=>{const keep=SETTINGS.tokenStyle;const out={};for(const st of ['standee','figure']){SETTINGS.tokenStyle=st;const d0=AN100.stats.draws;draw();out[st]=AN100.stats.draws-d0}SETTINGS.tokenStyle=keep;draw();return out});
ok(s1b.standee>=4&&s1b.figure>=4,'1d the stand-ins are worn in both the minis and the figures token styles '+JSON.stringify(s1b));
/* the scenario helpers */
await pg.evaluate(()=>{window.__lay=()=>{const P=S.players[0],Q=S.players[1];const T=[[6,2],[6,3],[6,4],[7,3],[5,3],[7,4],[5,4],[6,5]];const far=[];for(let c=0;c<N;c++){far.push([0,c]);far.push([N-1,c])}
    const busy=(r,c)=>S.players.some(p=>p.alive&&p.r===r&&p.c===c)||S.npcs.some(n=>n.alive&&n.r===r&&n.c===c)||S.pillars.some(p=>p.r===r&&p.c===c);
    for(const [r,c] of T){S.pillars=S.pillars.filter(p=>!(p.r===r&&p.c===c));S.spikes=S.spikes.filter(s=>!(s.r===r&&s.c===c));S.floor=(S.floor||[]).filter(f=>!(f.r===r&&f.c===c));
      for(const u of [...S.players,...S.npcs])if(u.alive&&u.r===r&&u.c===c&&u!==P&&u!==Q){const f=far.find(([a,b2])=>!busy(a,b2));u.r=f[0];u.c=f[1]}}
    for(const n of S.npcs)if(n.alive&&Math.max(Math.abs(n.r-6),Math.abs(n.c-3))<=3){const f=far.find(([a,b2])=>!busy(a,b2));n.r=f[0];n.c=f[1]}
    P.r=6;P.c=2;Q.r=6;Q.c=4;P.mv=8;render();draw();return {P,Q}};
  window.__poses=(id,tr)=>tr.filter(x=>x.id===id&&x.pose).map(x=>x.pose);
  /* draws by hand while waiting: on a loaded machine animation frames come late, the poses run on the clock either way */
  window.__samp=async ms=>{const end=performance.now()+ms;while(performance.now()<end){draw();await new Promise(r=>setTimeout(r,20))}};
  /* slower clock for the test (a loaded machine still sees every pose) */
  AN100.poseMs=240});
/* ---- 2 a move glides and walks ---- */
const s2=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const {P}=__lay();await W8(300);SPEED='normal';AN100.trace=[];
  SPEED='slow';P.mv=8;const mv=movePlayer(P,[6*N+3,7*N+3,7*N+4]);let dn=false;mv.then(()=>dn=true);while(!dn){draw();await W8(20)}await __samp(700);SPEED='normal';const tr=AN100.trace;AN100.trace=null;
  const gl=tr.filter(x=>x.id===P.id&&x.glide).map(x=>x.glide.join(','));const ps=__poses(P.id,tr);
  return {at:[P.r,P.c],glides:new Set(gl).size,walk:new Set(ps.filter(x=>/^walk/.test(x))).size,last:ps[ps.length-1]}});
ok(s2.at.join()==='7,4'&&s2.glides>=3,'2a the move glides through several intermediate points '+JSON.stringify(s2));
ok(s2.walk>=2&&/^idle/.test(s2.last||''),'2b the walk row steps, then back to idle '+JSON.stringify(s2));
/* ---- 3 attack + hit ---- */
const s3=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const P=S.players[0],Q=S.players[1];
  /* the first use of an action decodes its rows (idle meanwhile): warm attack / hit / block once, then trace */
  for(const r of ['attack','slash','sweep','thrust']){an100Act(P,r);await __samp(300)}an100Act(Q,'hit');await __samp(700);an100Act(Q,'block');await __samp(1300);AN100.trace=[];
  /* round 1 is PvE, so the rules would not offer Q as a target: the attack is called directly (its pose is what is tested) */
  Q.r=6;Q.c=4;const src=attackSources(P)[0];const t={kind:'player',ref:Q,key:'p'+Q.id,r:Q.r,c:Q.c};let atk=false;if(src){await doAttack(P,src,t);atk=true}
  await __samp(1400);const a=__poses(P.id,AN100.trace);AN100.trace=[];
  await hurt(Q,'chest',1,{type:'env'},'Test');await __samp(900);const h=__poses(Q.id,AN100.trace);const fl=AN100.trace.some(x=>x.id===Q.id&&x.flash);AN100.trace=null;
  const bm=Object.keys(AN100.src.get('p:hero').act.bm);
  return {atk,attack:new Set(a.filter(x=>/^(attack|slash|sweep|thrust|throw)/.test(x))).size,hit:new Set(h.filter(x=>/^(hit|block)/.test(x))).size,fl,bm,acts:AN100.stats.acts}});
ok(s3.atk&&s3.attack>=2,'3a an attack steps an attack row (v1.01: slash / sweep / thrust for a blade) '+JSON.stringify(s3));
ok(s3.hit>=2&&s3.fl,'3b a blow steps hit / block on the target, with a flash '+JSON.stringify(s3));
ok(s3.bm.length>=1&&s3.bm.length<=3,'3c only the used action rows got decoded '+JSON.stringify(s3.bm));
/* ---- 4 elimination: the fall row where he fell ---- */
const s4=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const R=S.players[2];AN100.trace=[];eliminate(R,{type:'retire'});await __samp(1500);
  const g=AN100.trace.filter(x=>x.id===R.id&&x.ghost).map(x=>x.ghost);AN100.trace=null;return {alive:R.alive,fall:new Set(g).size,ghosts:AN100.ghosts.length}});
ok(!s4.alive&&s4.fall>=2,'4 the fallen gladiator plays the fall row '+JSON.stringify(s4));
/* ---- 5 Fast: CPU still (flash only), own animates ---- */
const s5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const P=S.players[0],Q=S.players[1];SPEED='fast';AN100.trace=[];
  await hurt(Q,'chest',1,{type:'env'},'Test');await hurt(P,'chest',1,{type:'env'},'Test');await __samp(900);
  const q=__poses(Q.id,AN100.trace),p=__poses(P.id,AN100.trace),fl=AN100.trace.some(x=>x.id===Q.id&&x.flash);AN100.trace=null;SPEED='normal';
  return {cpu:[...new Set(q)],own:[...new Set(p)].filter(x=>!/^idle/.test(x)).length,fl}});
ok(s5.cpu.length&&s5.cpu.every(x=>x==='idle:0')&&s5.fl,'5a Fast: the CPU stays on its still cell, with the hit flash '+JSON.stringify(s5));
ok(s5.own>=2,'5b Fast: your own gladiator still animates '+JSON.stringify(s5));
/* ---- 6 Reduce motion ---- */
const s6=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const P=S.players[0],Q=S.players[1];SETTINGS.calm=true;AN100.trace=[];
  await hurt(Q,'chest',1,{type:'env'},'Test');P.mv=4;const free=[[5,3],[7,3],[5,2],[7,2]].find(([r,c])=>!S.players.some(p=>p.alive&&p.r===r&&p.c===c)&&!S.npcs.some(n=>n.alive&&n.r===r&&n.c===c)&&!S.pillars.some(x=>x.r===r&&x.c===c));
  if(free)await movePlayer(P,[free[0]*N+free[1]]);await __samp(600);const tr=AN100.trace;AN100.trace=null;SETTINGS.calm=false;
  return {poses:[...new Set(tr.filter(x=>x.pose).map(x=>x.pose))],glide:tr.filter(x=>x.glide).length,flash:tr.some(x=>x.flash),moved:!!free}});
ok(s6.poses.length&&s6.poses.every(x=>x==='idle:0')&&!s6.glide&&!s6.flash,'6 Reduce motion: the still cell, no glide, no flash '+JSON.stringify(s6));
/* ---- 7 perf: board draw ON vs OFF (same page, alternating blocks) ---- */
/* the first use of an action decodes its rows (idle meanwhile): from here on they are warm */
const s7=await pg.evaluate(async()=>{const fr=()=>new Promise(r=>requestAnimationFrame(r));const T={on:[],off:[]};SPEED='pause';
  for(let blk=0;blk<6;blk++){const on=blk%2===0;AN100.on=on;for(let i=0;i<10;i++){await fr();const t=performance.now();draw();T[on?'on':'off'].push(performance.now()-t)}}
  AN100.on=true;AN100.poseMs=120;SPEED='normal';const med=a=>{a=a.slice().sort((x,y)=>x-y);return +a[a.length>>1].toFixed(2)};return {on:med(T.on),off:med(T.off)}});
ok(s7.on<=s7.off*1.35+3,'7 a board draw with the stand-ins costs about today\'s '+JSON.stringify(s7));
/* ---- 10 the on-device cache round-trips (no 3D render here: headless keeps the converter off) ---- */
const s10=await pg.evaluate(async()=>{const blob=new Blob([new Uint8Array([1,2,3])],{type:'image/webp'});await an100DBPut({key:'tv100an',v:AN100L.VER,at:Date.now(),move:{b:blob,m:{rows:{}}},act:{b:blob,m:{rows:{}}}});
  const r=await an100DBGet('tv100an');return {got:!!(r&&r.move&&r.move.b&&r.move.b.size===3),devOK:an100DevOK()}});
ok(s10.got&&!s10.devOK,'10 IndexedDB cache round-trips; no on-device 3D in a headless browser '+JSON.stringify(s10));
/* ---- 11 SEVERED sets (kit seats = the prebuilt per-class severed sheets): a lost arm / leg swaps to its own set, loaded only then; two limbs → today's token ---- */
const s11=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SPEED='normal';const P=S.players[0],Q=S.players[1];
  const req=re=>performance.getEntriesByType('resource').map(e=>e.name).filter(n=>re.test(n)).length;
  const kit=S.players.map(p=>{const g=AN100.gear.get(p);return !!(g&&g.kit)});const dev0=AN100.dev.size;
  const sevKeys=()=>[...AN100.src.keys()].filter(k=>/:(rarm|larm|rleg|lleg)$/.test(k));const before=sevKeys().length;
  const cut=async(p,loc)=>{const b=p.hp[loc];p.hp[loc]=0;BUS.emit('hit',{target:{id:p.id,name:p.name},loc,amount:b,before:{hp:b},after:{hp:0}});};
  AN100.trace=[];await cut(Q,'larm');await __samp(300);const early=AN100.trace.filter(x=>x.id===Q.id&&x.src).map(x=>x.src);
  for(let i=0;i<60&&!(AN100.src.get('p:hero:larm')&&AN100.src.get('p:hero:larm').move.bm.idle&&AN100.src.get('p:hero:larm').move.bm.idle!==1);i++)await __samp(150);
  await __samp(500);const qs=[...new Set(AN100.trace.filter(x=>x.id===Q.id&&x.src).map(x=>x.src))];
  await cut(P,'rleg');for(let i=0;i<60&&!(AN100.src.get('p:soldier:rleg')&&AN100.src.get('p:soldier:rleg').move.bm.idle&&AN100.src.get('p:soldier:rleg').move.bm.idle!==1);i++)await __samp(150);
  AN100.trace=[];P.mv=6;const free=[[5,2],[7,2],[5,1],[7,1]].find(([r,c])=>!S.players.some(x=>x.alive&&x.r===r&&x.c===c)&&!S.npcs.some(n=>n.alive&&n.r===r&&n.c===c)&&!S.pillars.some(x=>x.r===r&&x.c===c));
  /* v1.01: the walk steps with the glide (half a stride a tile) — Slow gives the one-tile hobble time to show its frames */
  if(free){SPEED='slow';const mv=movePlayer(P,[free[0]*N+free[1]]);let dn=false;mv.then(()=>dn=true);while(!dn){draw();await W8(20)}SPEED='normal'}await __samp(600);
  const ps=AN100.trace.filter(x=>x.id===P.id&&x.src);const pSrc=[...new Set(ps.map(x=>x.src))],pWalk=[...new Set(ps.filter(x=>/^walk/.test(x.pose)).map(x=>x.pose))];
  AN100.trace=[];await cut(Q,'rleg');await __samp(900);const two=AN100.trace.filter(x=>x.id===Q.id&&x.pose).length;AN100.trace=null;
  const files=sevKeys();
  return {kit,dev0,devNow:AN100.dev.size,before,early:[...new Set(early)],qs,pSrc,pWalk,two,files,metaSev:Object.keys(ANIM100_META).every(k=>ANIM100_META[k].sev&&['rarm','larm','rleg','lleg'].every(l=>ANIM100_META[k].sev[l]&&ANIM100_META[k].sev[l].move&&ANIM100_META[k].sev[l].act))}});
ok(s11.metaSev&&s11.kit.every(x=>x)&&s11.dev0===0&&s11.devNow===0,'11a every class has 4 severed sets; class-kit seats need no device render '+JSON.stringify(s11));
ok(s11.before===0&&s11.qs.includes('p:hero:larm'),'11b a lost arm swaps to its severed set, requested only then '+JSON.stringify(s11));
ok(s11.pSrc.length===1&&s11.pSrc[0]==='p:soldier:rleg'&&s11.pWalk.length>=2,'11c a lost leg: its severed set, the hobble steps '+JSON.stringify(s11));
ok(s11.two===0,'11d two lost limbs → today\'s token '+JSON.stringify(s11));
ok(s11.files.sort().join()==='p:hero:larm,p:soldier:rleg','11e only the lost limbs\' severed sets were asked for '+JSON.stringify(s11.files));
if(process.env.SHOT){const fs=require('fs');fs.mkdirSync(process.env.SHOT,{recursive:true});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SPEED='pause';const P=S.players[0];P.r=6;P.c=5;S.players[1].r=6;S.players[1].c=6;render();draw();await W8(400)});
  await pg.screenshot({path:path.join(process.env.SHOT,'board_fit.png')});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));try{if(typeof CAM!=='undefined'){CAM.z=2.2}}catch(e){}draw();await W8(600);draw()});
  await pg.screenshot({path:path.join(process.env.SHOT,'board_zoom.png')});
  for(const [nm,ms] of [['attack_a',150],['attack_b',400]]){await pg.evaluate(async ms=>{const W8=x=>new Promise(r=>setTimeout(r,x));SPEED='normal';an100Act(S.players[0],'attack');an100Act(S.players[1],'hit');await W8(ms)},ms);
    await pg.screenshot({path:path.join(process.env.SHOT,'board_zoom_'+nm+'.png')})}
  await pg.evaluate(()=>{try{CAM.z=1}catch(e){}draw()})}
const newErr=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m):[],mark).catch(()=>[]);
ok(!newErr.length,'no new errors logged '+JSON.stringify(newErr).slice(0,300));

/* ---- 8 kill switch ---- */
{const cx=await b.newContext({viewport:{width:1440,height:900}});const q=await cx.newPage();q.on('pageerror',e=>errs.push(e.message));await q.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await q.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_anim100off','1')});
  await q.goto('file://'+page,{timeout:180000});await q.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
  const k=await q.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed:777,seats:['soldier','hero','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
    for(let i=0;i<20;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);draw()}
    return {on:AN100.on,draws:AN100.stats.draws,req:performance.getEntriesByType('resource').filter(e=>/anim100_/.test(e.name)).length}});
  ok(!k.on&&k.draws===0&&k.req===0,'8 kill switch: today\'s drawing, no sheet requested '+JSON.stringify(k));await cx.close()}

/* ---- 9 the same seeded dice + log, module on vs off, Normal speed, fresh browsers ---- */
const run9=async(q)=>{await q.evaluate(async seed=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
    for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}},424242);
  return q.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const L=[],R=[];
    const lb=log;log=function(h){if(S&&S.turnNo>=2&&S.turnNo<=6)L.push(S.turnNo+' '+String(h).replace(/<[^>]+>/g,''));return lb.apply(this,arguments)};
    const offT=BUS.on('turn.begin',e=>{if(e.turnNo<=6)R.push(e.turnNo+':'+RNG.s)});
    SPEED='normal';const iv=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},200);
    for(let i=0;i<900&&!(S.over||S.turnNo>6);i++)await W8(100);clearInterval(iv);SPEED='pause';log=lb;offT();
    return {L,R,turn:S.turnNo,on:AN100.on,draws:AN100.stats.draws,frames:AN100.stats.frames}})};
await run9(pg);
const store=await pg.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o});
const fresh=async on=>{const cx=await b.newContext({viewport:{width:1440,height:900}});const q=await cx.newPage();q.on('pageerror',e=>errs.push(e.message));await q.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await q.addInitScript(([st,on])=>{if(sessionStorage.getItem('tv100an'))return;sessionStorage.setItem('tv100an','1');Object.defineProperty(navigator,'webdriver',{get:()=>false});
    for(const k in st)localStorage.setItem(k,st[k]);if(!on)localStorage.setItem('flavius_anim100off','1');else localStorage.removeItem('flavius_anim100off')},[store,on]);
  await q.goto('file://'+page,{timeout:180000});await q.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
  const r=await run9(q);await cx.close();return r};
const A=await fresh(true),B=await fresh(false);
const fl=x=>x.L.filter(l=>!/seed \d|seed <b>/.test(l));
ok(A.R.length>=4&&A.on&&!B.on&&A.draws>0&&A.frames>0&&B.draws===0,'9a both seeded runs played, animated vs not '+JSON.stringify({a:A.R.length,b:B.R.length,ta:A.turn,tb:B.turn,A:[A.on,A.draws,A.frames],B:[B.on,B.draws]}));
ok(JSON.stringify(A.R)===JSON.stringify(B.R),'9b same dice at every turn ON vs OFF '+JSON.stringify({A:A.R.slice(0,4),B:B.R.slice(0,4)}));
{const a=fl(A),b2=fl(B);let k=0;while(k<a.length&&a[k]===b2[k])k++;ok(a.length===b2.length&&k===a.length,'9c same log ON vs OFF (first difference at '+k+'/'+a.length+': '+JSON.stringify([a[k],b2[k]])+')')}
/* ---- 12 GEAR-TRUE figures on the device (flavius_anim100dev=1): a seat in other gear than its class kit gets its own render keyed by
   its loadout (the stand-in meanwhile); kit seats none; a lost limb with real gear = a device-rendered severed set ---- */
let s12={};{const cx=await b.newContext({viewport:{width:1440,height:900}});const q=await cx.newPage();q.on('pageerror',e=>errs.push(e.message));await q.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await q.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_anim100dev','1')});
  await q.goto('file://'+page,{timeout:180000});await q.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
  s12=await q.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    /* seat 0 (a soldier) walks in with a trident instead of his gladius — like a Manager fighter in owned gear */
    const gl=giveLoadout;giveLoadout=function(p){const r=gl.apply(this,arguments);try{if(p&&p.id===0)p.wR=mkW('trident')}catch(e){}return r};
    SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed:99,seats:[{cls:'soldier',cpu:true},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
    for(let i=0;i<40&&!(S&&S.turnNo>=1);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
    giveLoadout=gl;SPEED='pause';const P=S.players[0];const g=AN100.gear.get(P)||{};const kits=S.players.slice(1).map(p=>!!(AN100.gear.get(p)||{}).kit);
    const keys0=[...AN100.dev.keys()];const t0=performance.now();
    for(let i=0;i<1200;i++){const d=[...AN100.dev.values()].find(s=>!s.limb&&s.ready);if(d||AN100.devFail)break;draw();await W8(250)}
    const tMove=Math.round(performance.now()-t0);AN100.trace=[];for(let i=0;i<6;i++){draw();await W8(60)}
    const pSrc=[...new Set(AN100.trace.filter(x=>x.id===P.id&&x.src).map(x=>x.src))];AN100.trace=null;
    /* lose the right arm (real gear): the severed set renders on the device, ahead of the act sheet */
    const b0=P.hp.rarm;P.hp.rarm=0;BUS.emit('hit',{target:{id:P.id,name:P.name},loc:'rarm',amount:b0,before:{hp:b0},after:{hp:0}});const t1=performance.now();
    for(let i=0;i<1200;i++){const d=[...AN100.dev.values()].find(s=>s.limb==='rarm'&&s.ready);if(d||AN100.devFail)break;draw();await W8(250)}
    const tSev=Math.round(performance.now()-t1);AN100.trace=[];for(let i=0;i<6;i++){draw();await W8(60)}
    const sSrc=[...new Set(AN100.trace.filter(x=>x.id===P.id&&x.src).map(x=>x.src))];AN100.trace=null;
    const rec=await an100DBGet([...AN100.dev.keys()].find(k=>/:rarm$/.test(k)));
    return {kit:g.kit,wR:g.gear&&g.gear.wR,kits,keys0,devKeys:[...AN100.dev.keys()],tMove,pSrc,tSev,sSrc,cached:!!(rec&&rec.move&&rec.move.b),log:AN100.stats.renderLog,aborts:AN100.stats.aborts||0,fail:AN100.devFail}});
  await cx.close()}
ok(s12.kit===false&&s12.wR&&s12.kits.every(x=>x)&&s12.keys0.length===1,'12a a non-kit loadout is noted and queued for a device render; kit seats are not '+JSON.stringify(s12).slice(0,600));
ok(!s12.fail&&s12.pSrc.length===1&&/^d:/.test(s12.pSrc[0]),'12b the non-kit seat wears its device-rendered sheet (keyed by its loadout) '+JSON.stringify(s12).slice(0,600));
ok(s12.sSrc.length===1&&/^d:.*:rarm$/.test(s12.sSrc[0])&&s12.cached,'12c a lost limb with real gear: a device-rendered severed set, cached '+JSON.stringify(s12).slice(0,800));
console.log(JSON.stringify({s1,s2,s3,s4,s5,s6,s7,s10,s11,s12}));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

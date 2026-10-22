/* tv109b — v1.09b THE WINTER CLASSIC (415-v109b): a seeded Manager career forged into the off-season (tools/tests/_wait.js boot, like tv109a).
   Room 9 sits between Camp and Next season and renders (rules, prize, seed, picker, the Superbus-tree bracket); Begin is blocked until the
   Classic is answered (W5a); rivals with a low purse sit out by a hash — the same for the same world, no dice used (W16a); Sica's wildcard
   takes the first empty seat's seed (W3a); Enter with one fighter → Day I bouts (tier wc109); a forced deadly result is met with clemency
   (nobody dies, no wound, the lost limb regrows, no pending verdict, no records, no league points); Days I–II simulate, Day III (v1.09c: the
   Saturnalia, 416 / tv109c) gives the Cup; the prizes (+60 coin, +5 morale/loyalty, +20 Renown) and the replica after three wins; the Tituli plinth with plates;
   Begin → season 2; sit-out + Begin simulates the rest; phones 390 px; kill switch flavius_v109boff=1 → v1.09a. */
const {chromium}=require('playwright');const T=require('./_wait');
(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:vw||{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('console: '+m.text().slice(0,200))});
  const ls={flavius_v106b1off:'1'};if(off)ls.flavius_v109boff='1';await T.boot(pg,{seed:1,ls});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await T.ready(pg);return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,600));console.log(JSON.stringify(out,null,1).slice(0,6000));await b.close();process.exit(1)}};
const helpers=()=>{
  window.DRAW=async()=>{MGR_REDRAW();await __W.mgrDrawn('#mgrBody')};
  window.ROOM=async k=>{const b=document.querySelector(`[data-wq109="go|${k}"]`);if(b)b.click();else wqGo(k);
    await __W.until(()=>{const e=document.querySelector('.wq109');return e&&e.dataset.wq109step===k},'room '+k,8000);await __W.mgrDrawn('#mgrBody');
    return document.querySelector('.wq109')?document.querySelector('.wq109').dataset.wq109step:null};
  window.HSCROLL=()=>document.scrollingElement.scrollWidth>window.innerWidth+1;
  window.MODALS=async()=>{for(let k=0;k<6&&CUR_MODAL;k++){CUR_MODAL.done(null);await __W.until(()=>!CUR_MODAL,'modal closed',3000)}await __W.popupSettled()};
  window.WQ=async()=>{MGR.tab='night';MGR.view=null;await DRAW();return __W.until(()=>!!document.querySelector('.wq109'),'Winter Quarters drawn',8000)};
  window.BOOTW=async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await __W.popupSettled();menuHide();openManager();await __W.mgrDrawn('#mgrBody');
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=2000;w.train='off';w.tplan=null;await DRAW();
    const ros=rosterOf(pm);ros.forEach((g,i)=>{g.contract.weeks=30;g.rec.ev=10+i;g.rec.w=4+i;g.inj=null});w.mgrs.forEach((m,i)=>{const s=msp(m,1);s.pts=(m.isPlayer?31:40-i*3);s.w=12-i;s.b=14;s.ev=14});
    const P=po104New(w);P.sf=[{k:[P.seeds[0],P.seeds[3]],adv:[P.seeds[0]],pl:null},{k:[P.seeds[1],P.seeds[2]],adv:[P.seeds[1]],pl:null}];P.fin={k:[P.seeds[0],P.seeds[1]],pl:null};P.champ=P.seeds[0];P.phase='fin';P.paid={r1:1,sf:1,fin:1};w.po104=P;w.night.po104='fin';w.night.bouts=[];w.special=null;w.week=12;
    return w};
  /* the records the Classic must not touch */
  window.RECS=w=>JSON.stringify({g:w.glads.map(g=>[g.id,g.alive,g.rec,g.ss||null,g.recent||null,g.inj||null,(g.severed||[]).slice().sort()]),m:w.mgrs.map(m=>[m.id,m.bouts,m.wins,m.spS])});
  window.SICAM=w=>w.mgrs.find(m=>m.sica)};

/* ---------------- Winter Quarters opens: room 9, the seeds, the sit-outs ---------------- */
const pg=await open(0);await pg.evaluate(helpers);
out.open=await ev(pg,async()=>{const w=await BOOTW();const pm=me();
  /* every seeded rival short of coin → the hash alone decides who sits out */
  const seeds=po104Seeds(w);for(const k of seeds){const m=k&&po104M(k);if(m&&!m.isPlayer)m.coin=5}
  window.__J0=JSON.stringify(w);
  let calls=0;const mr=Math.random;Math.random=function(){calls++;return mr.apply(this,arguments)};let o1,o2;try{o1=wc109Out(w,seeds);o2=wc109Out(w,seeds)}finally{Math.random=mr}
  po104OffStart(w,w.po104);await WQ();const C=w.wc109||{};
  const r={live:wqLive(w),calls,o1,o2,out:C.out,st:C.st,seed:C.seeds?C.seeds.indexOf('m:'+pm.id)+1:0,
    order:[...document.querySelectorAll('.wq109st .wqs')].map(x=>(x.dataset.wq109||'').split('|')[1]).join(','),
    letter:(w.letters||[]).some(x=>x.key==='wq109-'+w.season&&/Winter Classic/.test(x.body)),tile:!!document.querySelector('.wqtiles [data-wq109="go|classic"]')};
  r.room=await ROOM('classic');r.rules=document.querySelectorAll('.wc109rule').length;r.prize=/60/.test((document.querySelector('.wc109pr')||{}).textContent||'');
  r.pick=document.querySelectorAll('[data-wc109pick] option').length;r.enter=!!document.querySelector('[data-wc109="in"]')&&!!document.querySelector('[data-wc109="out"]');
  r.tree=document.querySelectorAll('.wc109bk .v104g .po104b').length;r.rows=document.querySelectorAll('.wc109bk .v104e[data-wc109seat]').length;r.ros=po104Fits(w,pm,new Set()).length;
  r.ready=weekReady();const b=document.querySelector('.wq109nav [data-wq109="begin"]');r.nextBtn=!!document.querySelector('.wq109nav [data-wq109="go|next"]');
  await ROOM('next');const bb=document.querySelector('.wq109nav [data-wq109="begin"]');r.beginDis=!!(bb&&bb.disabled);r.beginWhy=bb?bb.title:'';
  r.res=await wqBegin();await __W.mgrDrawn('#mgrBody');r.after=document.querySelector('.wq109')&&document.querySelector('.wq109').dataset.wq109step;r.season=w.season;
  return r});
const O=out.open;
ok(O.live&&/,camp,classic,next$/.test(O.order)&&O.tile&&O.letter,'room 9 sits between Camp and Next season; tile + letter line '+JSON.stringify(O).slice(0,500));
ok(O.room==='classic'&&O.rules===4&&O.prize&&O.enter&&O.pick===O.ros&&O.pick>0&&O.tree===5&&O.rows>=12&&O.seed>0,'room 9 renders: rules, prize, picker, the bracket '+JSON.stringify(O).slice(0,600));
ok(O.calls===0&&JSON.stringify(O.o1)===JSON.stringify(O.o2)&&JSON.stringify(O.o1)===JSON.stringify(O.out)&&O.out.length>=1&&O.out.length<=3,'rivals sit out by a hash (no dice), 1–3 of them '+JSON.stringify({c:O.calls,o:O.out}));
ok(!O.ready.ok&&/Winter Classic/.test(O.ready.why)&&O.beginDis&&O.res===false&&O.after==='classic'&&O.season===1,'Begin is blocked until the Classic is answered '+JSON.stringify(O).slice(0,400));

/* the same world → the same sit-outs */
out.det=await ev(pg,async()=>{const keep=MGR.world;const w2=JSON.parse(window.__J0);MGR.world=w2;let o=null;try{po104OffStart(w2,w2.po104);o=wc109Ensure(w2).out}finally{MGR.world=keep}return o});
ok(JSON.stringify(out.det)===JSON.stringify(O.out),'the same world gives the same sit-outs '+JSON.stringify(out.det));

/* ---------------- ✍ Enter with one fighter; Sica's wildcard seed ---------------- */
out.enter=await ev(pg,async()=>{const w=W_(),pm=me();await ROOM('classic');const sel=document.querySelector('[data-wc109pick]');const opts=[...sel.options].map(o=>o.value);sel.value=opts[opts.length-1];
  document.querySelector('[data-wc109="in"]').click();await __W.until(()=>w.wc109.st==='in','entered',5000);await __W.mgrDrawn('#mgrBody');const C=w.wc109;
  const empty=C.seeds.map((k,i)=>[k,i]).filter(([k])=>!k||C.out.some(x=>'m:'+x.id===k)).map(x=>x[1]);const wild=C.seats.find(s=>s.kind==='wild');const sica=SICAM(w);
  const B=w.night.bouts.filter(b=>b.wc109);const mine=C.seats.find(s=>s.k==='m:'+pm.id);
  const houses=new Map();for(const s of C.seats){const m=s.k&&s.k.startsWith('m:')?s.k:null;if(m)houses.set(m,(houses.get(m)||0)+1)}
  return {pick:C.pick,want:opts[opts.length-1],mineGid:mine&&mine.gid,empty,wild:wild&&{i:wild.i,k:wild.k},sica:sica&&'m:'+sica.id,inv:C.seats.filter(s=>s.kind==='inv').length,
    bouts:B.length,tiers:B.map(b=>b.tier+':'+b.wc109.d+':'+b.ents.length),oneEach:[...houses.values()].every(n=>n===1),
    ready:weekReady().ok,ent:!!document.querySelector('.wc109ent .badge.gold'),cards:document.querySelectorAll('.wc109bt[data-wc109bout]').length,
    sim:document.querySelectorAll('.wc109bt [data-mg="sim"]').length,watch:document.querySelectorAll('.wc109bt [data-mg="watch"]').length,bet:document.querySelectorAll('.wc109bt [data-mg="bet"]').length,done:wqDone(w,'classic')}});
const E=out.enter;
ok(E.pick===E.want&&E.mineGid===E.want&&E.oneEach,'Enter sends the chosen fighter; one fighter per house '+JSON.stringify(E));
ok(E.wild&&E.wild.k===E.sica&&E.wild.i===E.empty[0]&&E.inv===E.empty.length-1,'Sica\'s wildcard takes the first empty seat\'s seed; the rest invited '+JSON.stringify(E));
ok(E.bouts===2&&E.tiers.every(t=>t==='wc109:1:4')&&E.ready&&E.ent&&E.done,'Day I: two 4-fighter wc109 bouts; Begin now allowed; room ✓ '+JSON.stringify(E));
ok(E.cards===2&&E.sim>=1&&E.watch>=1&&E.bet>=4,'the day\'s bouts: watch / simulate / bet '+JSON.stringify(E));

/* ---------------- clemency: a forced deadly result ---------------- */
out.clem=await ev(pg,async()=>{const w=W_();const L=WC109T.bouts(w,w.wc109,1);const [b,bi]=L[0];const R0=RECS(w);const pend0=(w.pend||[]).length;
  const ids=b.ents.slice();const res={rows:ids.map((gid,i)=>({mgrId:gid,id:i,f:i===0?40:3,alive:i===0,kp:0,kn:0,dmg:20,taken:20,severed:i===1?['larm']:[],elimTurn:i?3:null,coin:0})),winners:[0],turns:9,reason:'test',att:0,seed:1};
  const mr=Math.random;Math.random=()=>0;try{applyBout(bi,res)}finally{Math.random=mr}
  const after=RECS(w);const G=ids.map(gById);
  const f=leagueFate(G[1],{f:2,fate:''},null,b,bi,{});
  return {same:R0===after,alive:G.every(g=>g.alive!==false),inj:G.filter(g=>g.inj).length,sev:G.map(g=>(g.severed||[]).length),pend:(w.pend||[]).length-pend0,
    vd:b.res.rows.map(r=>r.vd),fate:f.vd,adv:w.wc109.d[1][0].adv,done:b.done}});
const CL=out.clem;
ok(CL.done&&CL.same&&CL.alive&&CL.inj===0&&CL.sev.every(n=>n===0)&&CL.pend===0,'clemency: nobody dies, no wound, the limb regrows, no records / league points '+JSON.stringify(CL));
ok(CL.vd.every(v=>v==='clemency')&&CL.fate==='clemency'&&CL.adv&&CL.adv.length===2,'every verdict is clemency; the top 2 go on '+JSON.stringify(CL));

/* ---------------- Days I–II simulate, Day III (provisional) gives the Cup ---------------- */
out.days=await ev(pg,async()=>{const w=W_(),pm=me();const C=w.wc109;const R0=RECS(w);
  const sim=async()=>{const b=document.querySelector('[data-wc109="day"]')||document.querySelector('.wc109bt [data-mg="sim"]');if(!b)return false;b.click();await __W.until(()=>!MGR.busy,'sim done',60000);await __W.mgrDrawn('#mgrBody');await new Promise(r=>setTimeout(r,50));return true};
  for(let k=0;k<6&&!C.fin;k++){if(!await sim())break;await __W.until(()=>C.fin||WC109T.bouts(w,C).some(([x])=>!x.done),'next day',20000)}
  const d2=WC109T.bouts(w,C,2).length;const fin=(C.fin||[]).slice();const btn=!!document.querySelector('[data-wc109="final"]');
  const h0=(w.wc109h||[]).length;document.querySelector('[data-wc109="final"]').click();await __W.until(()=>C.champ!=null&&!MGR.busy,'the Cup decided',60000);await __W.mgrDrawn('#mgrBody');
  const s=C.seats[C.champ];const H=w.wc109h[w.wc109h.length-1];
  return {d2,fin,btn,champ:C.champ,inFin:fin.includes(C.champ),paid:C.paid,h:w.wc109h.length-h0,hk:H&&H.k,sk:s&&s.k,same:R0===RECS(w),alive:w.glads.every(g=>!WC109T.bouts(w,C).some(([x])=>x.ents.includes(g.id))||g.alive!==false),
    pend:(w.pend||[]).length,won:!!document.querySelector('.wc109won'),champBox:!!document.querySelector('.wc109bk .v104ch.on'),ready:weekReady().ok,d3:WC109T.bouts(w,C,3).map(([x])=>x.ev+':'+x.ents.length)}});
const D=out.days;
ok(D.d2===2&&D.fin.length===4&&D.btn,'Days I–II played: two semifinals, four finalists '+JSON.stringify(D));
ok(D.inFin&&D.paid&&D.h===1&&D.hk===D.sk&&D.d3.join()==='chariot:4,democritus:4','Day III (v1.09c: the Saturnalia = race + Democritus) gives the Cup, one plate '+JSON.stringify(D));
ok(D.same&&D.alive&&D.pend===0&&D.won&&D.champBox&&D.ready,'no records / points changed, nobody died, no verdicts; Begin allowed '+JSON.stringify(D));

/* ---------------- the prizes (forged win for the house) + the replica after three ---------------- */
out.prize=await ev(pg,async()=>{const w=W_(),pm=me();const ros=rosterOf(pm);ros.forEach(g=>{g.morale=50;g.loyB=0});const c0=pm.coin;const r0=renOf105(pm);const src0=r0.src.wc109||0;const x0=r0.lv*100000+r0.xp;
  const mk='m:'+pm.id;const forge=()=>({s:w.season,seats:[{k:mk,i:0,kind:'house',gid:ros[0].id}],champ:0,champG:ros[0].id,paid:0});
  const h0=(w.wc109h||[]).filter(x=>x.mine).length;WC109T.pay(w,forge());const r1=renOf105(pm);
  const one={coin:pm.coin-c0,mo:ros.map(g=>g.morale),loy:ros.map(g=>g.loyB),ren:(r1.src.wc109||0)-src0,lab:REN105.lab.wc109,mine:w.wc109h.filter(x=>x.mine).length-h0};
  const t0=(w.trophies||[]).filter(t=>t.tid==='wc109rep').length;for(let k=0;k<3;k++)WC109T.pay(w,forge());
  return {one,rep:w.wc109rep,tro:(w.trophies||[]).filter(t=>t.tid==='wc109rep').length-t0,mineN:w.wc109h.filter(x=>x.mine).length}});
const PZ=out.prize;
ok(PZ.one.coin===60&&PZ.one.mo.every(m=>m===55)&&PZ.one.loy.every(l=>l===5)&&PZ.one.ren===20&&/Winter Classic/.test(PZ.one.lab)&&PZ.one.mine===1,'prizes: +60 coin, +5 morale and loyalty, +20 Renown (Winter Classic) '+JSON.stringify(PZ));
ok(PZ.rep&&PZ.tro===1&&PZ.mineN>=3,'three wins: the replica, a titulus of its own, once '+JSON.stringify(PZ));

/* ---------------- the Tituli plinth ---------------- */
out.tit=await ev(pg,async()=>{MGR.tab='trophy';MGR.view=null;WD100.tf='mgr';await DRAW();await __W.until(()=>!!document.querySelector('.wc109tit'),'plinth',8000);
  return {plinth:!!document.querySelector('.wc109tit .wc109hall'),plates:document.querySelectorAll('.wc109tit .wc109pl').length,on:document.querySelectorAll('.wc109tit .wc109pl.on').length,me:document.querySelectorAll('.wc109tit .wc109pl.me').length,
    rep:!!document.querySelector('[data-t100="wc109rep"]'),holder:/Held by/.test((document.querySelector('.wc109tit .wc109hct')||{}).textContent||'')}});
ok(out.tit.plinth&&out.tit.plates===6&&out.tit.on>=5&&out.tit.me>=4&&out.tit.rep&&out.tit.holder,'Tituli: the Winter Classic plinth, plates I–VI, the replica titulus '+JSON.stringify(out.tit));

/* ---------------- ▶ Begin: season 2 ---------------- */
out.begin=await ev(pg,async()=>{const w=W_();let guard=0;while((w.pend||[]).length&&guard++<30){try{settlePending(0,'stay')}catch(e){w.pend.shift()}}
  await WQ();await ROOM('next');const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);document.querySelector('.wq109nav [data-wq109="begin"]').click();
  await __W.until(()=>W_().season===2,'season 2',30000);clearInterval(hold);await MODALS();return {season:w.season,wk:wkOf(w.week),bouts:w.night.bouts.filter(b=>b.wc109).length,hist:(w.wc109h||[]).length}});
ok(out.begin.season===2&&out.begin.wk===1&&out.begin.bouts===0,'Begin → season 2, week 1 '+JSON.stringify(out.begin));
await pg.close();

/* ---------------- phones; sit it out, Begin simulates the rest ---------------- */
const p2=await open(0,{width:390,height:844});await p2.evaluate(helpers);
out.phone=await ev(p2,async()=>{const w=await BOOTW();po104OffStart(w,w.po104);await WQ();const r={};await ROOM('classic');r.entry=[HSCROLL(),document.scrollingElement.scrollWidth];
  document.querySelector('[data-wc109="out"]').click();await __W.until(()=>w.wc109.st==='out','sat out',5000);await __W.mgrDrawn('#mgrBody');r.out=[HSCROLL(),document.scrollingElement.scrollWidth];
  r.mySeat=w.wc109.seats[w.wc109.seeds.indexOf('m:'+me().id)].k!=='m:'+me().id;r.mine=w.night.bouts.filter(b=>b.wc109).some(b=>b.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===me().id}));
  document.querySelector('[data-wc109="view|hall"]').click();await __W.until(()=>!!document.querySelector('.wc109c .wc109hall'),'hall view',5000);r.hall=[HSCROLL(),document.scrollingElement.scrollWidth];
  await ROOM('next');const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);document.querySelector('.wq109nav [data-wq109="begin"]').click();
  await __W.until(()=>W_().season===2,'season 2',60000);clearInterval(hold);await MODALS();r.season=w.season;r.hist=(w.wc109h||[]).length;r.st=w.wc109&&w.wc109.st;return r});
const PH=out.phone;
ok(!PH.entry[0]&&!PH.out[0]&&!PH.hall[0],'phone 390 px: no horizontal page scroll '+JSON.stringify(PH));
ok(PH.mySeat&&!PH.mine&&PH.season===2&&PH.hist===1&&PH.st==='out','sit it out: the seat is filled, Begin simulates every bout and gives the Cup '+JSON.stringify(PH));
await p2.close();

/* ---------------- the kill switch: v1.09a ---------------- */
const p3=await open(1);await p3.evaluate(helpers);
out.off=await ev(p3,async()=>{const w=await BOOTW();po104OffStart(w,w.po104);await WQ();
  return {B:window.V109B&&window.V109B.on,steps:document.querySelectorAll('.wq109st .wqs').length,classic:!!document.querySelector('[data-wq109="go|classic"]'),st:!!w.wc109,ready:weekReady().ok,tier:!!TIERS.wc109}});
ok(out.off.B===false&&out.off.steps===10&&!out.off.classic&&!out.off.st&&out.off.ready&&!out.off.tier,'kill switch: v1.09a, no room 9, Begin free '+JSON.stringify(out.off));
await p3.close();

console.log(JSON.stringify(out).slice(0,4000));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.slice(0,10)));await b.close();process.exit(miss.length||errs.length?1:0)})();

/* v0.87 Manager systems (150-v87mgr): 1 the lanista's hours are gone (never saved, no displays, actions still limited a week,
   the ticket clock), 2 the lanista perk tree on the Lanista tab (buy, ranks, effects, the ludus tile jumps), 3 Training Yard
   standing orders → v0.92 the fighter cards + ↻ Same as last week (213-v92yard), rest, last week's gain,
   4 recruiting Fit (✓ only for the best few; a thin roster no longer makes everyone ✓), 5 win rewards (purse ×, streaks, growth,
   fans → CF, patron offer); phone width without sideways scroll */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const setup=async(pg)=>{await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown'),localStorage.setItem('flavius_v105yoff','1')});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
  return pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;W_().fill95=W_().season*100+W_().week; /* v0.95: no default fill of the starters (the test enters by hand) */const w=W_(),m=me();m.coin=600;m.perkPts=0;MGR.tab='ludus';MGR_REDRAW();await W8(500);return true})};
const pg=await b.newPage({viewport:{width:1300,height:900}});await setup(pg);
/* ---------- 1 · hours ---------- */
o.h=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();
  r.saved=JSON.stringify(w).includes('"hours"');w.hours=0;r.after0=w.hours;w.hours-=5;r.afterSub=w.hours;
  const fa=freeAgents().sort((a,b)=>effOvr(b)-effOvr(a));const g=fa.find(x=>m.fame>=reqFame(x))||fa[0];m.fame=Math.max(m.fame,reqFame(g));g.scout=2;g.favd=true;
  MGR.tab='recruit';MGR.sel=g.id;MGR.recFor=g.id;MGR.recStep=2;MGR_REDRAW();await W8(500);const body=document.getElementById('mgrBody').innerHTML,txt=document.getElementById('mgrBody').innerText;
  r.lanH=/lanista's hours|lanista’s hours/.test(txt);r.btnH=(body.match(/<small>[^<]*\b\d+ h\b[^<]*<\/small>/g)||[]).slice(0,4);
  r.badge=/Recruiting hours/.test(body);r.stat=tabStat73('recruit');r.done=tabDone73('recruit');
  /* a pitch: free, answers with a result, one per recruit a week */
  const pb=[...document.querySelectorAll(`#mgrBody [data-rec98p$="|${g.id}"]`)].find(x=>!x.disabled); /* v0.98: the house-grade pitches */r.pitchBtn=!!pb;if(!pb)r.pdbg=[...document.querySelectorAll('#mgrBody [data-mg="pitch"]')].map(x=>x.dataset.id.split('|')[0]===g.id?'G':'o'+(x.disabled?(x.title||'dis'):'')).slice(0,6).concat([pitchesLeft(),m.fame,reqFame(g),MGR.recStep,!!g.contract]);const coin0=m.coin;pb&&pb.click();await W8(500);
  r.pitchMsg=MGR.msg||'';r.pitchCoin=m.coin-coin0;r.gate=recGate(g,'pitch')[0];r.clk=w.clk87&&w.clk87.n;
  /* the oval on the Recruiting tab is gone */
  await W8(800);const ov=document.querySelector('.mtabs [data-id="recruit"] .mcount.c73');r.oval=!!(ov&&getComputedStyle(ov).display!=='none'&&!ov.hidden);
  r.todo=ludusTodos().some(t=>t[0]==='⏳');r.endc=/lanista/.test(endConfirmHTML());
  /* promote panel without hours */
  MGR.tab='ludus';MGR.run='promote';MGR_REDRAW();await W8(400);const pr=(document.querySelector('.runpanel')||{}).innerHTML||'';r.prom=/\b\d+ h\b|lanista/.test(pr);
  /* a wage raise once a fighter a week */
  const mine=rosterOf(m)[0];MGR.tab='roster';MGR.lsel=mine.id;MGR_REDRAW();await W8(400);const w0=mine.contract.wage;
  const rb=document.querySelector(`#mgrBody [data-mg="raise"][data-id="${mine.id}"]`);r.raiseBtn=!!rb;rb&&rb.click();await W8(400);
  const rb2=document.querySelector(`#mgrBody [data-mg="raise"][data-id="${mine.id}"]`);r.raise2dis=!!(rb2&&rb2.disabled);rb2&&(rb2.disabled=false,rb2.click());await W8(400);r.raised=mine.contract.wage-w0;
  /* the ticket clock: actions this week move sales on */
  const n=w.night;const bt=n&&n.bouts&&n.bouts.find(x=>!x.done);if(bt){w.clk87={wk:w.week,n:0};const s0=boutSales(bt).sold;w.clk87.n=8;const s1=boutSales(bt).sold;r.sales=[s0,s1]}
  /* migration */
  const old={ver:'0.86',hours:7,letters:[{key:'bye-x',body:`<li>${_T`<b>Recruit</b>: you have ${BYE_HOURS} extra lanista's hours — scout, pitch and sign before the others wake up.`}</li>`}]};migrateWorld(old);r.mig=['hours' in old,/lanista/.test(old.letters[0].body)];
  return r});
ok(!o.h.saved,'hours never saved');ok(o.h.after0===99&&o.h.afterSub===99,'no hours pool to spend');ok(!o.h.lanH,'no "lanista\'s hours" on Recruiting');
ok(!o.h.btnH.length,'no "N h" on recruiting buttons '+o.h.btnH.join(' | '));ok(!o.h.badge&&Array.isArray(o.h.stat)&&/recruiter/i.test(o.h.stat[1])&&o.h.done===false,'no lanista hours badge / ✓; the banner counts the recruiter\'s hours (v0.98)');
ok(o.h.pitchBtn&&/interest/.test(o.h.pitchMsg)&&o.h.pitchCoin===0&&o.h.gate,'a pitch is free, says what it gained, once a week');ok(o.h.clk>=1,'the clock counts actions');
ok(!o.h.oval,'no Recruiting oval');ok(!o.h.todo&&!o.h.endc,'no hours to-do / end-week line');ok(!o.h.prom,'Promote without hours');
ok(o.h.raiseBtn&&o.h.raise2dis&&o.h.raised===2,'one raise a week '+o.h.raised);ok(!o.h.sales||o.h.sales[1]>=o.h.sales[0],'ticket sales follow the week');
ok(!o.h.mig[0]&&!o.h.mig[1],'migration drops the hours');
/* ---------- 2 · the perk tree ---------- */
o.p=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();m.perkPts=5;
  MGR.tab='ludus';MGR.run='promote';MGR_REDRAW();await W8(400);const tile=document.querySelector('[data-mg="run"][data-id="school"]');r.tileCount=!!(tile&&tile.querySelector('.ptbox'));
  /* v1.0 (294-v100ludus): the Ludus tile is now 'Upgrade School' (data-id fac) — the perk tree is reached by the Lanista tab (perk87Go: the checklist 'to school' item and the rail) */perk87Go();await W8(500);r.tab=MGR.tab;const card=document.getElementById('schoolCard');r.card=!!card;r.nodes=document.querySelectorAll('#schoolCard .pk87').length;
  r.counts=document.querySelectorAll('#mgrPane .pk87pts').length;r.br2dis=!!document.querySelector('[data-pk87="br2"][disabled]');
  const hon=m.p.honor;document.querySelector('[data-pk87="br1"]').click();await W8(400);r.br1=!!(m.perks87&&m.perks87.br1);r.pts=m.perkPts;r.hon=m.p.honor-hon;
  r.br2open=!!document.querySelector('[data-pk87="br2"]:not([disabled])');
  const th0=thMax();document.querySelector('[data-pk87="dc1"]').click();await W8(400);r.th=thMax()-th0;
  /* hard bargain: the cheapest wage that signs falls */
  const g=freeAgents().sort((a,b)=>effOvr(b)-effOvr(a))[0];g.interest[m.id]=60;const low=()=>{for(let x=1;x<400;x++)if(offerVerdict(g,x,8,0,false).ok)return x;return 999};
  const a=low();m.perks87.br2=w.week;const c=low();r.bargain=[a,c];delete m.perks87.br2;
  /* grand entrance: +1 CF */
  const mine=rosterOf(m)[0];const cf0=boostFor(mine).cf;m.perks87.sh2=w.week;r.cf=boostFor(mine).cf-cf0;delete m.perks87.sh2;
  /* the hone row still works */
  const hb=document.querySelector('#schoolCard [data-mg="perk"][data-id="show"]');const s0=m.p.show;hb&&hb.click();await W8(400);r.hone=m.p.show-s0;
  return r});
ok(!o.p.tileCount&&o.p.tab==='me','no perk tile with a count in the ludus; the perk tree opens on the Lanista tab');ok(o.p.card&&o.p.nodes===9&&o.p.counts===1,'nine perks, one count');
ok(o.p.br2dis&&o.p.br1&&o.p.pts===4&&o.p.hon===3&&o.p.br2open,'rank I first, costs a point, lifts its trait, opens rank II');
ok(o.p.th===2,'Drillmaster: +2 training hours');ok(o.p.bargain[1]<o.p.bargain[0],'Hard bargain: signs for less '+o.p.bargain);ok(o.p.cf===1,'Grand entrance: +1 CF');ok(o.p.hone===2,'hone a trait');
/* ---------- 3 · standing orders → v0.92: the yard is fighter cards (213-v92yard); the week repeats with ↻ Same as last week,
   old drill routines no longer train on their own (they seed ↻), rest still works, last week's gain is still kept ---------- */
o.y=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();const ros=rosterOf(m);
  ros.forEach(g=>{g.inj=null;g.fat=0;g.restWk=null;g.ord87=null});ros[0].fat=70;w.tplan=null;
  MGR.tab='practice';MGR.yd87=null;MGR_REDRAW();await W8(500);
  r.rows=document.querySelectorAll('.yo87r').length;r.ros=ros.length;r.cards=document.querySelectorAll('.y92c').length;r.worn=!!document.querySelector(`[data-y92c="${ros[0].id}"] .fb90-worn`);
  /* an old drill routine: no hours booked by itself, but it seeds ↻ */
  ros[1].ord87={r:'str',p:2};ord87RunAll(w);r.str=JSON.stringify(thPlan(w).g[ros[1].id]||{});
  /* plan + lock for two fighters */
  for(const g of [ros[2],ros[3]]){for(const k of ['spd','str','int']){document.querySelector(`[data-y92s="${g.id}|${k}|1"]`).click();await W8(120)}}
  document.querySelector('[data-y92all]').click();await W8(300);r.lk=[ros[2],ros[3]].map(g=>JSON.stringify(thPlan(w).y92[g.id].L));
  /* rest for the worn one (the Infirmary's rest routine still runs) */
  ord87Set(ros[0],'rest');MGR_REDRAW();await W8(300);r.rest=ros[0].restWk===w.week&&!!document.querySelector(`[data-y92c="${ros[0].id}"].locked`);
  /* the week ends: ↻ brings the week back */
  ros.forEach(g=>{g.contract.weeks=20;g.morale=90});const wk=w.week;for(const bt of (w.night&&w.night.bouts)||[])bt.done=true;w.pend=[];await endWeek();await W8(300);const w2=W_();
  r.adv=w2.week!==wk;const hurt=g=>!!g.inj||g.alive===false||!(g.contract&&g.contract.mgr===m.id);
  MGR.tab='practice';MGR_REDRAW();await W8(400);document.querySelector('[data-y92same]').click();await W8(300);
  const Q=g=>JSON.stringify((thPlan(w2).y92||{})[g.id]?thPlan(w2).y92[g.id].Q:{});r.again=[ros[2],ros[3]].map(g=>hurt(g)?'{"spd":1,"str":1,"int":1}':Q(g));
  r.seed=hurt(ros[1])?'{"str":3}':Q(ros[1]);r.selfTrain=JSON.stringify(thPlan(w2).g[ros[1].id]||{});
  const gw=ros.find(g=>!hurt(g))||ros[1];r.gain=!!(gw.gain87&&gw.gain87.wk===w2.week);
  return r});
ok(o.y.rows===0&&o.y.cards===o.y.ros,'the yard opens on the fighter cards');ok(o.y.worn,'the worn-out card shows it');
ok(o.y.str==='{}','an old drill routine does not book hours by itself '+o.y.str);ok(o.y.lk.every(s=>s==='{"spd":1,"str":1,"int":1}'),'sessions lock in '+o.y.lk);
ok(o.y.rest,'rest routine');ok(o.y.adv&&o.y.again.every(s=>s==='{"spd":1,"str":1,"int":1}'),'↻ repeats last week '+o.y.again);
ok(o.y.seed==='{"str":3}'&&o.y.selfTrain==='{}','the old routine seeds ↻ '+o.y.seed);ok(o.y.gain,'last week\'s gain');
/* ---------- 4 · Fit ---------- */
o.f=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();m.coin=600;
  const fa=freeAgents();r.ticks=fa.filter(g=>recFit(g,m).mark==='✓').length;
  /* a thin roster: only one fighter left */
  const ros=rosterOf(m);const keep=ros[0];const saved=ros.slice(1).map(g=>[g,g.contract]);for(const [g] of saved)g.contract=null;
  r.thinTicks=freeAgents().filter(g=>recFit(g,m).mark==='✓').length;r.thinFA=freeAgents().length;
  r.why=recFit(freeAgents().find(g=>recFit(g,m).mark==='✓')||freeAgents()[0],m).why;for(const [g,c] of saved)g.contract=c;
  MGR.tab='recruit';MGR.filter='free';MGR_REDRAW();await W8(500);r.rowTicks=document.querySelectorAll('#mgrBody .fitchip.fy').length;
  r.tip=(document.querySelector('#mgrBody .fitchip')||{}).title||'';return r});
ok(o.f.ticks<=3&&o.f.thinTicks<=3&&o.f.rowTicks<=3,'✓ only for the best few');ok(o.f.thinFA>3,'thin roster: many free agents, still at most three ✓');
ok(/roster/.test(o.f.why)&&/affordable|steep/.test(o.f.why),'Fit tooltip says why');
/* ---------- 5 · win rewards ---------- */
o.r=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();m.perks87={};
  r.mult=[win87Mult(0.25,4,0),win87Mult(0.1,4,0),win87Mult(0.6,4,1),win87Mult(0.25,4,9)].map(x=>[x.up,x.st,x.all]);
  /* fans → CF */
  const g=rosterOf(m).find(x=>!x.inj)||rosterOf(m)[0];g.inj=null;g.alive=true;const cf0=boostFor(g).cf;r.crowd=(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).length;
  const fr=(CROWD_CACHE||[]).filter(x=>!x.fanOf&&!x.banned).slice(0,3);const keep=fr.map(x=>[x,x.fanOf]);fr.forEach(x=>x.fanOf=g.name);r.fanCF=fr.length>=3?boostFor(g).cf-cf0:1;keep.forEach(([x,v])=>{x.fanOf=v});
  /* a win on a 2-win streak */
  const bi=w.night.bouts.findIndex(x=>x.ents.length>=2);const b=w.night.bouts[bi];b.done=false;b.rig=null;b.bets=[];if(!b.ents.includes(g.id))b.ents[0]=g.id;
  const P=boutProbs(b,'book');const exp=win87Mult(P[b.ents.indexOf(g.id)],b.ents.length,2);const other=gById(b.ents.find(id=>id!==g.id));
  g.streak87=2;if(other)other.streak87=4;g.pat87=null;const st0=gStats(g);const sum0=st0.spd+st0.str+st0.int+st0.cha+(g.sxp?Object.values(g.sxp).reduce((a,c)=>a+c,0):0);
  const mor0=g.morale=50,loy0=g.loyB||0,fame0=g.fame||0,hf0=m.fame,fans0=fansFor(g.name);
  const res={rows:b.ents.map((id,i)=>({id:i,mgrId:id,f:id===g.id?26:10,kp:0,kn:0,dmg:0,alive:true,coin:0,severed:[]})),winners:[b.ents.indexOf(g.id)]};
  applyBout(bi,res,{});const B=(b.res&&b.res.bonus87||[]).find(x=>x.gid===g.id);
  r.bonus=B?[B.up,B.st,B.all,B.extra]:null;r.exp=[exp.up,exp.st,exp.all];r.streak=[g.streak87,other?other.streak87:0];
  const st1=gStats(g);r.grow=(st1.spd+st1.str+st1.int+st1.cha+(g.sxp?Object.values(g.sxp).reduce((a,c)=>a+c,0):0))-sum0;r.mor=g.morale-mor0;r.loy=(g.loyB||0)-loy0;r.fame=g.fame-fame0;r.hfame=m.fame-hf0;r.fans=fansFor(g.name)-fans0;
  r.news=(w.news||[]).slice(0,12).map(x=>typeof x==='string'?x:(x&&(x.t||x.text||x.html))||'').join(' ');
  const L=(w.letters||[]).find(x=>x.pt87&&x.pt87.gid===g.id);r.letter=!!L;
  MGR.tab='ludus';MGR.run=null;MGR.view=null;MGR_REDRAW();await W8(500);
  const yb=document.querySelector(`#mgrBody [data-pt87^="yes|"]`);r.btn=!!yb;
  if(yb){const det=yb.closest('details');if(det)det.open=true;yb.click();await W8(400)}r.pat=(w.pat87||[]).length;
  /* the roster card shows the streak */
  MGR.tab='roster';MGR.lsel=g.id;MGR_REDRAW();await W8(400);r.card=/wins in a row/.test(document.getElementById('mgrBody').innerText);
  /* the patron pays at the week's end */
  for(const bt of w.night.bouts)bt.done=true;w.pend=[];const pay=(w.pat87[0]||{}).pay||0;let got=false;const t0=window.tnews;window.tnews=function(x){if(/pays/.test(x)&&/sponsoring/.test(x))got=true;return t0.apply(this,arguments)};
  const wk3=w.week;let ret;try{ret=await endWeek()}finally{window.tnews=t0}await W8(300);r.paid=(got&&pay>0)||g.alive===false||!mineP87(g); /* a fighter the week took away is not paid for */if(!r.paid)r.pdbg={ret,wk3,wk:W_().week,same:W_()===w,pat:W_().pat87,alive:g.alive,mine:mineP87(g),pend:(w.pend||[]).length,spec:!!(w.special&&!w.special.done),inj:g.inj&&g.inj.label};
  /* a stale offer goes when the fighter does */
  const g2=rosterOf(m).find(x=>x.id!==g.id);if(g2){pat87Offer(W_(),g2,m,0);g2.contract=null;for(const bt of W_().night.bouts)bt.done=true;W_().pend=[];await endWeek();await W8(300);
    r.stale=!(W_().letters||[]).some(x=>x.pt87&&x.pt87.gid===g2.id)}
  return r});
ok(JSON.stringify(o.r.mult)==='[[1,1,1],[2,1,2],[1,1.25,1.25],[1,2,2]]','purse multiplier: upset up to ×2, streak +25% up to ×2 '+JSON.stringify(o.r.mult));
ok(o.r.fanCF===1,'fans bring CF '+o.r.fanCF);
ok(o.r.bonus&&o.r.bonus[1]===1.5&&o.r.bonus[2]===o.r.exp[2]&&o.r.bonus[3]>0,'the winner\'s purse grows with the streak/upset '+JSON.stringify([o.r.bonus,o.r.exp]));
ok(o.r.streak[0]===3&&o.r.streak[1]===0,'streaks count and reset '+o.r.streak);
ok(o.r.grow>=2&&o.r.mor>=5&&o.r.loy>=3&&o.r.fame>=2&&o.r.hfame>=1,'winners grow, cheer, bond and get famous '+JSON.stringify([o.r.grow,o.r.mor,o.r.loy,o.r.fame,o.r.hfame]));
ok(!o.r.crowd||o.r.fans>=1,'the city\'s regulars turn fans '+o.r.fans);
ok(o.r.letter&&o.r.btn&&o.r.pat===1,'a 3-win streak brings a patron offer you can accept');ok(o.r.card,'the streak shows on the roster card');ok(o.r.paid,'the patron pays at the week\'s end');ok(o.r.stale!==false,'a patron offer about a fighter you lost goes');
/* ---------- phones ---------- */
const pp=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await setup(pp);
o.ph=await pp.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};me().perkPts=3;
  for(const t of ['practice','me']){MGR.tab=t;MGR_REDRAW();await W8(500);const body=document.getElementById('mBody')||document.body;
    r[t]={docX:document.documentElement.scrollWidth-innerWidth,bodyX:body.scrollWidth-body.clientWidth,rowsOut:[...document.querySelectorAll('.yo87r,.y92c,.pk87')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length}}
  return r});
for(const t of ['practice','me'])ok(o.ph[t].docX<=1&&o.ph[t].bodyX<=1&&!o.ph[t].rowsOut,'phone '+t+': no sideways scroll '+JSON.stringify(o.ph[t]));
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

/* v0.87 Manager systems (150-v87mgr): 1 the lanista's hours are gone (never saved, no displays, actions still limited a week,
   the ticket clock), 2 the lanista perk tree on the Lanista tab (buy, ranks, effects, the ludus tile jumps), 3 Training Yard
   standing orders + the squad table (routine, priority, bulk, row → card, repeats after End the week, attention rows),
   4 recruiting Fit (✓ only for the best few; a thin roster no longer makes everyone ✓); phone width without sideways scroll */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const setup=async(pg)=>{await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
  return pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=600;m.perkPts=0;MGR.tab='ludus';MGR_REDRAW();await W8(500);return true})};
const pg=await b.newPage({viewport:{width:1300,height:900}});await setup(pg);
/* ---------- 1 · hours ---------- */
o.h=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();
  r.saved=JSON.stringify(w).includes('"hours"');w.hours=0;r.after0=w.hours;w.hours-=5;r.afterSub=w.hours;
  const fa=freeAgents().sort((a,b)=>effOvr(b)-effOvr(a));const g=fa[0];g.scout=2;g.favd=true;
  MGR.tab='recruit';MGR.sel=g.id;MGR.recStep=2;MGR_REDRAW();await W8(500);const body=document.getElementById('mgrBody').innerHTML,txt=document.getElementById('mgrBody').innerText;
  r.lanH=/lanista's hours|lanista’s hours/.test(txt);r.btnH=(body.match(/<small>[^<]*\b\d+ h\b[^<]*<\/small>/g)||[]).slice(0,4);
  r.badge=/Recruiting hours/.test(body);r.stat=tabStat73('recruit');r.done=tabDone73('recruit');
  /* a pitch: free, answers with a result, one per recruit a week */
  const pb=[...document.querySelectorAll('#mgrBody [data-mg="pitch"]')].find(x=>!x.disabled);r.pitchBtn=!!pb;const coin0=m.coin;pb&&pb.click();await W8(500);
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
ok(!o.h.btnH.length,'no "N h" on recruiting buttons '+o.h.btnH.join(' | '));ok(!o.h.badge&&o.h.stat===null&&o.h.done===false,'no hours badge / banner count / ✓');
ok(o.h.pitchBtn&&/interest/.test(o.h.pitchMsg)&&o.h.pitchCoin===0&&o.h.gate,'a pitch is free, says what it gained, once a week');ok(o.h.clk>=1,'the clock counts actions');
ok(!o.h.oval,'no Recruiting oval');ok(!o.h.todo&&!o.h.endc,'no hours to-do / end-week line');ok(!o.h.prom,'Promote without hours');
ok(o.h.raiseBtn&&o.h.raise2dis&&o.h.raised===2,'one raise a week '+o.h.raised);ok(!o.h.sales||o.h.sales[1]>=o.h.sales[0],'ticket sales follow the week');
ok(!o.h.mig[0]&&!o.h.mig[1],'migration drops the hours');
/* ---------- 2 · the perk tree ---------- */
o.p=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();m.perkPts=5;
  MGR.tab='ludus';MGR.run='promote';MGR_REDRAW();await W8(400);const tile=document.querySelector('[data-mg="run"][data-id="school"]');r.tileCount=!!(tile&&tile.querySelector('.ptbox'));
  tile&&tile.click();await W8(500);r.tab=MGR.tab;const card=document.getElementById('schoolCard');r.card=!!card;r.nodes=document.querySelectorAll('#schoolCard .pk87').length;
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
ok(!o.p.tileCount&&o.p.tab==='me','the ludus tile has no count and opens the Lanista tab');ok(o.p.card&&o.p.nodes===9&&o.p.counts===1,'nine perks, one count');
ok(o.p.br2dis&&o.p.br1&&o.p.pts===4&&o.p.hon===3&&o.p.br2open,'rank I first, costs a point, lifts its trait, opens rank II');
ok(o.p.th===2,'Drillmaster: +2 training hours');ok(o.p.bargain[1]<o.p.bargain[0],'Hard bargain: signs for less '+o.p.bargain);ok(o.p.cf===1,'Grand entrance: +1 CF');ok(o.p.hone===2,'hone a trait');
/* ---------- 3 · standing orders ---------- */
o.y=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();const ros=rosterOf(m);
  ros.forEach(g=>{g.inj=null;g.fat=0;g.restWk=null});ros[0].fat=70;w.tplan=null;
  MGR.tab='practice';MGR.yd87=null;MGR_REDRAW();await W8(500);
  r.rows=document.querySelectorAll('.yo87r').length;r.ros=ros.length;r.cards=document.querySelectorAll('.yd76grid .yd76c').length;r.need=document.querySelectorAll('.yo87r.need').length;
  const sel=document.querySelector(`[data-yr87="${ros[1].id}"]`);sel.value='str';sel.dispatchEvent(new Event('change',{bubbles:true}));await W8(400);
  r.ord=ros[1].ord87&&ros[1].ord87.r;r.str=((thPlan(w).g[ros[1].id])||{}).str;
  const pr=document.querySelector(`[data-yp87="${ros[1].id}"]`);pr.value='1';pr.dispatchEvent(new Event('change',{bubbles:true}));await W8(300);r.prio=ros[1].ord87.p;
  /* bulk: all-round for two */
  for(const g of [ros[2],ros[3]]){const c=document.querySelector(`[data-yk87="${g.id}"]`);c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}));await W8(250)}
  document.getElementById('yo87bulkR').value='bal';document.querySelector('[data-ya87]').click();await W8(400);
  r.bal=[ros[2],ros[3]].map(g=>JSON.stringify(thPlan(w).g[g.id]||{}));
  /* rest for the worn one */
  const s0=document.querySelector(`[data-yr87="${ros[0].id}"]`);s0.value='rest';s0.dispatchEvent(new Event('change',{bubbles:true}));await W8(400);r.rest=ros[0].restWk===w.week;
  /* a row opens the full card */
  document.querySelector(`.yo87r[data-yo87row="${ros[4]?ros[4].id:ros[1].id}"] .yo87gn`).click();await W8(400);r.one=document.querySelectorAll('.yo87one .yd76c').length;
  document.querySelector('[data-ycard87="all"]')&&document.querySelector('[data-ycard87="all"]').click();await W8(300);r.all=document.querySelectorAll('.yd76grid .yd76c').length;
  /* the week ends: the orders come back by themselves */
  const wk=w.week;for(const bt of (w.night&&w.night.bouts)||[])bt.done=true;w.pend=[];await endWeek();await W8(300);const w2=W_();
  r.adv=w2.week!==wk;r.str2=((thPlan(w2).g[ros[1].id])||{}).str;r.bal2=((thPlan(w2).g[ros[2].id])||{}).spd;r.rest2=ros[0].restWk===w2.week;r.gain=!!(ros[1].gain87&&ros[1].gain87.wk===w2.week);
  MGR.tab='practice';MGR_REDRAW();await W8(400);r.gainTxt=(document.querySelector(`.yo87r[data-yo87row="${ros[1].id}"] .yo87gn`)||{}).textContent||'';
  /* a routine the hours cannot pay is marked */
  const P=thPlan(w2);P.doc=TH_DOC;P.spent=thMax();const g5=ros[4]||ros[1];ord87Set(g5,'cha');MGR_REDRAW();await W8(300);r.short=g5.ord87.short;
  r.shortRow=!!document.querySelector(`.yo87r.need[data-yo87row="${g5.id}"]`);
  return r});
ok(o.y.rows===o.y.ros&&o.y.cards===0,'the yard opens on the squad table');ok(o.y.need>=1,'the worn-out row asks for attention');
ok(o.y.ord==='str'&&o.y.str===3&&o.y.prio===1,'a routine goes into the week, with its priority');ok(o.y.bal.every(s=>s==='{"spd":1,"str":1,"int":1,"cha":1}'),'bulk all-round '+o.y.bal);
ok(o.y.rest,'rest routine');ok(o.y.one===1&&o.y.all===o.y.ros,'a row opens its card; All cards');
ok(o.y.adv&&o.y.str2===3&&o.y.bal2===1&&o.y.rest2,'the orders repeat next week');ok(o.y.gain&&o.y.gainTxt.length>0,'last week\'s gain');ok(o.y.short>0&&o.y.shortRow,'an unpaid routine is marked');
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
/* ---------- phones ---------- */
const pp=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await setup(pp);
o.ph=await pp.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};me().perkPts=3;
  for(const t of ['practice','me']){MGR.tab=t;MGR_REDRAW();await W8(500);const body=document.getElementById('mBody')||document.body;
    r[t]={docX:document.documentElement.scrollWidth-innerWidth,bodyX:body.scrollWidth-body.clientWidth,rowsOut:[...document.querySelectorAll('.yo87r,.pk87')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length}}
  return r});
for(const t of ['practice','me'])ok(o.ph[t].docX<=1&&o.ph[t].bodyX<=1&&!o.ph[t].rowsOut,'phone '+t+': no sideways scroll '+JSON.stringify(o.ph[t]));
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

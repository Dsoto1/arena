/* v1.06 RIVAL TRADE MOTIVES (394-v106trade, his t1a): forged house situations give the expected motive (wages · all-in · gap (hurt starter /
   missing class) · sell high · youth), the offer card says WHY in one line + the weekly cost change, the value formula (rating, fame, age,
   career kind, potential, − wage), determinism (same world + week → the same offer; no Math.random), coin within the house's reserve,
   and the kill switch flavius_v106troff=1 (47's old offer). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\.g/,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o.off)localStorage.setItem('flavius_v106troff','1')},{off:off?1:0});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
    const w=W_(),pm=me();w.welc99=1;pm.coin=900;w.train='off';for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(const m of w.mgrs)if(!m.isPlayer){m.relB=60;m.rivalry=0;m.rivals={}}w.offers=[];
    /* a calm house: rich, mid-table, nobody hurt, nobody near the end, a mixed squad */
    window.CALM=(m)=>{const w=W_();w.week=5;m.coin=5000;for(const x of w.mgrs)msp(x).pts=10;msp(m).pts=10;
      for(const g of rosterOf(m)){g.inj=null;const K=c104Kind(g);g.age=Math.max(18,K.ps-2);g.contract.since=0}
      for(const g of rosterOf(me())){g.inj=null;g.contract.since=0;delete g.loanFrom}TR106.thin=0};
    window.POOR=(m)=>{CALM(m);m.coin=10;const dear=rosterOf(m)[0];for(const g of rosterOf(m))g.contract.wage=Math.min(g.contract.wage,39);dear.contract.wage=40;const mine=rosterOf(me());for(const g of mine)g.contract.wage=Math.min(g.contract.wage,30);mine[0].contract.wage=5;return dear};
    window.H=w.mgrs.find(m=>!m.isPlayer&&!m.sica&&rosterOf(m).length>=3)});
  return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));await b.close();process.exit(1)}};
const pg=await open(false);

/* 1 · the value formula */
const V=await ev(pg,async()=>{const g=genGlad({ovr:60});W_().glads.push(g);g.alive=true;g.fame=10;g.age=22;g.ovr=60;g.pot=72;g.contract={mgr:me().id,wage:10,weeks:12,since:0};
  const P=c104Phase(g);const car=(P.ph==='rise'?Math.min(8,2*P.left):P.ph==='prime'?Math.min(6,2*P.left):-6*(P.past||1))+(TR106.kinds[P.c.k]||0);
  const exp=Math.round(effOvr(g)*2.2+10*1.2+(24-22)*1.5+car+(72-60)-10*2);const p1=tr106Parts(g);
  g.contract.wage=15;const p2=tr106Parts(g);g.contract.wage=10;g.age=32;const p3=tr106Parts(g);const P3=c104Phase(g);const car3=(P3.ph==='rise'?Math.min(8,2*P3.left):P3.ph==='prime'?Math.min(6,2*P3.left):-6*(P3.past||1))+(TR106.kinds[P3.c.k]||0);
  g.contract=null;return {exp,v:p1.v,p1,wageD:p1.v-p2.v,age3:p3.age,car3,c3:p3.car}});
ok(V.v===V.exp,'value = rating×2.2 + fame×1.2 + age + career kind + potential − wage×2 '+JSON.stringify(V));ok(V.wageD===10,'+5 wage a week costs 10 value ('+V.wageD+')');
ok(V.age3===-16&&V.c3===V.car3,'age 32: −4 a year over 28; the career term follows 349\'s phase '+JSON.stringify([V.age3,V.c3,V.car3]));

/* 2 · forged situations → motives */
const M=await ev(pg,async()=>{const w=W_(),pm=me();const m=H;const r={};
  CALM(m);r.calm=tr106Motive(w,m,pm);
  /* wages: a poor house */
  POOR(m);r.wages=tr106Motive(w,m,pm);const pw=tr106Plan(w,m,pm,0.5);r.pw=pw&&{k:pw.kind,coin:pw.coin,give:(pw.give||[]).length,dw:pw.dw106,why:pw.why106,want:pw.gid};
  if(pw){const dear=gById(pw.give[0]);r.dearMax=rosterOf(m).filter(g=>!g.inj&&!g.loanFrom).every(g=>g.contract.wage<=dear.contract.wage);r.dwOk=pw.dw106===dear.contract.wage-gById(pw.gid).contract.wage}
  /* all-in: top 4 in weeks 7–8 */
  CALM(m);w.week=7;msp(m).pts=99;r.allin=tr106Motive(w,m,pm);const pa=tr106Plan(w,m,pm,0.5);r.pa=pa&&{k:pa.kind,coin:pa.coin,why:pa.why106,best:pa.gid===[...rosterOf(pm)].filter(g=>!g.inj&&!g.loanFrom).sort((a,b)=>effOvr(b)-effOvr(a)||(a.id<b.id?-1:1))[0].id,v:tr106Val(gById(pa.gid))};
  w.week=6;r.allin6=tr106Motive(w,m,pm);
  /* gap: a hurt starter */
  CALM(m);const st=depthOf(m).starters[0];st.inj={until:w.week+3,label:'a cut',pen:2};r.gap=tr106Motive(w,m,pm);const pg2=tr106Plan(w,m,pm,0.5);r.pg=pg2&&{why:pg2.why106,k:pg2.kind};st.inj=null;
  /* gap: a lopsided squad lacking a class you have */
  CALM(m);TR106.thin=8;for(const g of rosterOf(m))g.cls='soldier';const mine=rosterOf(pm)[0];const c0=mine.cls;mine.cls='hero';r.gapc=tr106Motive(w,m,pm);const pc=tr106Plan(w,m,pm,0.5);r.pc=pc&&{why:pc.why106,want:gById(pc.gid).cls};TR106.thin=0;mine.cls=c0;
  /* sell high: a fighter of theirs about to fade, rated at least their average */
  CALM(m);const top=[...rosterOf(m)].sort((a,b)=>effOvr(b)-effOvr(a))[0];const K=c104Kind(top);top.age=K.ps+K.pl+1;top.fame=150;for(const g of rosterOf(pm)){g.age=19;g.fame=0;g.pot=g.ovr}/* their fader must be worth about what they ask for; random ratings made this flaky */
  r.sell=tr106Motive(w,m,pm);const ps=tr106Plan(w,m,pm,0.5);r.ps=ps&&{why:ps.why106,give:ps.give&&ps.give[0]===top.id,dw:ps.dw106};
  /* youth: rebuilding (bottom third from week 3) and you have a prospect */
  CALM(m);msp(m).pts=0;for(const g of rosterOf(pm)){g.age=26;g.pot=g.ovr}const kid=rosterOf(pm)[0];kid.age=20;kid.pot=(kid.ovr||50)+15;r.youth=tr106Motive(w,m,pm);const py=tr106Plan(w,m,pm,0.5);r.py=py&&{why:py.why106,want:py.gid===kid.id,k:py.kind};
  /* reserve: coin never more than treasury − 4 weeks of wages */
  CALM(m);w.week=7;msp(m).pts=99;m.coin=tr106Wages(m)*4+30;const pr=tr106Plan(w,m,pm,0.5);r.res=pr?{k:pr.kind,coin:pr.coin,room:tr106Room(m)}:null;
  return r});
console.log('MOTIVES',JSON.stringify(M));
ok(M.calm===null,'a calm house has no motive ('+M.calm+')');
ok(M.wages==='wages'&&M.pw&&M.pw.k==='swap'&&M.pw.coin===0&&M.pw.give===1&&M.dearMax&&M.dwOk,'poor house → wages: swaps its dearest fighter for a cheaper one, no coin '+JSON.stringify(M.pw));
ok(M.pw&&M.pw.dw>0&&/cut wages/.test(M.pw.why),'wages: the reason + you pay more a week');
ok(M.allin==='allin'&&M.pa&&M.pa.best&&/all-in/.test(M.pa.why),'contender in week 7 → all-in for your best '+JSON.stringify(M.pa));ok(M.pa&&M.pa.k==='coin'&&M.pa.coin>=Math.round(M.pa.v*1.15)-1,'all-in pays a premium');ok(M.allin6!=='allin','week 6 is not all-in');
ok(M.gap==='gap'&&M.pg&&/hurt/.test(M.pg.why),'a hurt starter → gap '+JSON.stringify(M.pg));
ok(M.gapc==='gap'&&M.pc&&M.pc.want==='hero'&&/no /.test(M.pc.why),'a lopsided squad lacking a class → gap, they want that class '+JSON.stringify(M.pc));
ok(M.sell==='sell'&&M.ps&&M.ps.give&&/sells high/.test(M.ps.why),'a fighter about to fade → sell high, they offer him '+JSON.stringify(M.ps));
ok(M.youth==='youth'&&M.py&&M.py.want&&/rebuilding/.test(M.py.why),'bottom third → youth, they want your prospect '+JSON.stringify(M.py));
ok(!M.res||M.res.coin<=M.res.room,'coin stays within treasury − 4 weeks of wages '+JSON.stringify(M.res));

/* 3 · the card: why + weekly cost */
const C=await ev(pg,async()=>{const w=W_(),pm=me();const m=H;POOR(m);const o=tr106Plan(w,m,pm,0.5);w.offers=[o];const h=offersHTML();
  MGR.tab='ludus';MGR_REDRAW();await W8(400);const T=document.createElement('div');T.innerHTML=h;const box=T.querySelector('.tr106');
  return {html:!!box,why:box?box.querySelector('.tr106why').textContent.trim():'',wk:box?box.querySelector('.tr106wk').textContent.trim():'',dw:o.dw106,whyO:(()=>{const d=document.createElement('div');d.innerHTML=o.why106;return d.textContent.trim()})(),beforeActs:!!box&&!!box.nextElementSibling&&box.nextElementSibling.classList.contains('acts'),dom:!!document.querySelector('.tr106 .tr106why')}});
ok(C.html&&C.why===C.whyO,'the offer card carries the one-line reason '+JSON.stringify(C));
ok(C.wk===(C.dw>0?'+'+C.dw+'/wk for you':C.dw<0?'−'+(-C.dw)+'/wk for you':'same wages'),'the card shows the weekly cost change '+C.wk);ok(C.beforeActs,'the reason sits above Accept / Decline');ok(C.dom,'the reason is drawn on the page');

/* 4 · determinism: same world + week → the same offer; no Math.random in the AI pick */
const D=await ev(pg,async()=>{const w=W_(),pm=me();w.offers=[];const p0=TR106.p;TR106.p=1;let wk=-1,o1=null;
  for(let k=13;k<60&&!o1;k++){w.week=k;CALM(H);w.week=k;o1=tr106Gen(w,pm);if(o1)wk=k}
  let calls=0;const mr=Math.random;Math.random=function(){calls++;return mr()};let o2;try{o2=tr106Gen(w,pm)}finally{Math.random=mr}
  const n={};for(let k=1;k<=48;k++){w.week=k;w.offers=[];const o=tr106Gen(w,pm);if(o)n[o.mot106]=(n[o.mot106]||0)+1}TR106.p=p0;
  /* the week's roll: about TR106.p of the weeks bring an offer */
  let hits=0;for(let k=1;k<=200;k++){const R=mulberry32(hashStr('tr106|'+w.id+'|'+w.season+'|'+k));if(R.next()<=TR106.p)hits++}
  return {same:JSON.stringify(o1)===JSON.stringify(o2),o1:!!o1,calls,n,hits}});
ok(D.o1&&D.same,'same world + week → the same offer '+JSON.stringify(D));ok(D.calls===0,'no Math.random in the rival\'s pick ('+D.calls+' calls)');ok(D.hits>40&&D.hits<110,'about 35% of weeks roll an offer ('+D.hits+'/200)');

/* 5 · offersWeek → a motive offer with its news line, counted */
const W=await ev(pg,async()=>{const w=W_(),pm=me();const p0=TR106.p;TR106.p=1;w.offers=[];w.tr106n={};let o=null;for(let k=2;k<40&&!o;k++){w.week=k;CALM(H);w.week=k;w.offers=[];offersWeek(w,pm);o=(w.offers||[])[0]}TR106.p=p0;
  return {o:!!o,mot:o&&o.mot106,news:(w.tlog||[])[0]?String(w.tlog[0].text):'',n:w.tr106n}});
ok(W.o&&W.mot&&/sends a trade offer/.test(W.news)&&W.n[W.mot]===1,'offersWeek makes a motive offer + news line + count '+JSON.stringify(W));

/* 6 · kill switch: 47's offer, no motive */
const pk=await open(true);
const K=await ev(pk,async()=>{const w=W_(),pm=me();let o=null;for(let i=0;i<80&&!o;i++){w.offers=[];w.week=2+i%5;offersGen(w,pm);o=(w.offers||[])[0]}return {on:TR106.on,o:!!o,mot:o?o.mot106||null:'none'}});
ok(!K.on&&K.o&&K.mot===null,'kill switch: 47\'s value-match offer comes back (no motive) '+JSON.stringify(K));

console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

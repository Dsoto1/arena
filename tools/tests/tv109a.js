/* tv109a — v1.09a WINTER QUARTERS, the house rooms (414-v109a): a seeded Manager career forged into the off-season (tools/tests/_wait.js boot).
   Rooms 3 Council, 4 Renown, 5 Facilities, 7 Winter market, 8 Winter camp render in the stepper (10 steps); ONE promotion a winter and only
   for an advisor who met his record (no week-end level-up letters meanwhile); a winter building project is ready at week 1; the intake adds
   8–12 free agents aged 18–20, the same for the same world; the camp runs once, after the season turn, hurts nobody, the ward stays home;
   three Consilium goals in room 10, paid in Renown when the next season ends; phones 390 px; kill switch flavius_v109aoff=1 → v1.09. */
const {chromium}=require('playwright');const T=require('./_wait');
(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:vw||{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('console: '+m.text().slice(0,200))});
  const ls={flavius_v106b1off:'1'};if(off)ls.flavius_v109aoff='1';await T.boot(pg,{seed:1,ls});
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
    const ros=rosterOf(pm);ros.forEach((g,i)=>{g.contract.weeks=30;g.rec.ev=10+i;g.rec.w=4+i});w.mgrs.forEach((m,i)=>{const s=msp(m,1);s.pts=40-i*3;s.w=12-i;s.b=14;s.ev=14});
    const P=po104New(w);P.sf=[{k:[P.seeds[0],P.seeds[3]],adv:[P.seeds[0]],pl:null},{k:[P.seeds[1],P.seeds[2]],adv:[P.seeds[1]],pl:null}];P.fin={k:[P.seeds[0],P.seeds[1]],pl:null};P.champ=P.seeds[0];P.phase='fin';P.paid={r1:1,sf:1,fin:1};w.po104=P;w.night.po104='fin';w.night.bouts=[];w.special=null;w.week=12;
    return w};
  window.SPEC=w=>((w.wq109a&&w.wq109a.intake)||[]).map(id=>{const g=w.glads.find(x=>x.id===id);return g?[g.name,g.age,g.cls,g.ovr,g.pot].join('/'):'?'})};

/* ---------------- the off-season opens: intake, goals, the turn ---------------- */
const pg=await open(0);await pg.evaluate(helpers);
out.open=await ev(pg,async()=>{const w=await BOOTW();const pm=me();const fa0=freeAgents().length;
  window.__J0=JSON.stringify(w);/* the same world, before the off-season, for the determinism check */
  po104OffStart(w,w.po104);await WQ();
  const S=w.wq109a||{};const I=(S.intake||[]).map(gById).filter(Boolean);
  return {live:wqLive(w),n:I.length,ages:I.map(g=>g.age),free:I.every(g=>!g.contract&&g.alive!==false),fa:freeAgents().length-fa0,spec:SPEC(w),
    goals:w.gl109a&&w.gl109a.s,gl:(w.gl109a&&w.gl109a.list||[]).map(x=>x.k+':'+x.t),turn:S.turn?Object.keys(S.turn).length:0,ros:rosterOf(pm).length,c104s:w.c104s,season:w.season,
    rec84:(w.letters||[]).some(x=>/^rec84-/.test(x.key)&&x.s===w.season&&x.wk===w.week),great:(w.letters||[]).some(x=>/^c104adv-/.test(x.key)),
    steps:document.querySelectorAll('.wq109st .wqs').length,tiles:document.querySelectorAll('.wqtiles .wqt').length,order:[...document.querySelectorAll('.wq109st .wqs')].map(x=>(x.dataset.wq109||'').split('|')[1]).join(',')}});
const O=out.open;
ok(O.live&&O.n>=8&&O.n<=12&&O.ages.every(a=>a>=18&&a<=20)&&O.free&&O.fa===O.n,'intake: 8–12 free agents aged 18–20 '+JSON.stringify(O).slice(0,400));
ok(O.goals===2&&O.gl.length===3,'three Consilium goals for season 2 '+JSON.stringify(O.gl));
ok(O.turn===O.ros&&O.c104s===O.season,'the season turn ran first and is recorded '+JSON.stringify(O).slice(0,300));
ok(!O.rec84&&!O.great,'no Recruiter bargain / retired-great letter in that week '+JSON.stringify(O).slice(0,200));
ok(O.steps===10&&O.tiles===9&&O.order==='over,awards,books,council,renown,fac,staff,market,camp,next','the stepper has the ten steps in order '+JSON.stringify(O));

/* ---------------- determinism: the same world → the same intake ---------------- */
out.det=await ev(pg,async()=>{const keep=MGR.world;const w2=JSON.parse(window.__J0);MGR.world=w2;let spec=[];try{po104OffStart(w2,w2.po104);spec=SPEC(w2)}finally{MGR.world=keep}
  /* an old save mid-winter (no v1.09a state): the intake and the goals come on first sight */
  const w3=JSON.parse(window.__J0);MGR.world=w3;let old={};try{po104OffStart(w3,w3.po104);const n=w3.wq109a.intake.length;for(const id of w3.wq109a.intake){const i=w3.glads.findIndex(g=>g.id===id);if(i>=0)w3.glads.splice(i,1)}
    delete w3.wq109a;delete w3.gl109a;MGR.tab='night';await DRAW();old={n,again:(w3.wq109a&&w3.wq109a.intake||[]).length,gl:!!w3.gl109a,wq:!!document.querySelector('.wq109')}}finally{MGR.world=keep;MGR.tab='night';await DRAW()}
  return {spec,old}});
ok(JSON.stringify(out.det.spec)===JSON.stringify(O.spec)&&O.spec.length===O.n,'the same world gives the same intake '+JSON.stringify({a:O.spec.slice(0,3),b:out.det.spec.slice(0,3)}));
ok(out.det.old.again===out.det.old.n&&out.det.old.gl&&out.det.old.wq,'an old save mid-winter gets its intake + goals '+JSON.stringify(out.det.old));

/* ---------------- the rooms render ---------------- */
out.rooms=await ev(pg,async()=>{const w=W_();const r={};
  r.council=await ROOM('council');r.adv=document.querySelectorAll('.wqadv[data-wq109aadv]').length;
  r.renown=await ROOM('renown');r.perk=!!document.querySelector('.wqren #ren105')||!!document.querySelector('.wqren .pk87');
  r.fac=await ROOM('fac');r.build=document.querySelectorAll('.wq109 [data-mg="build"]').length;r.works=!!document.querySelector('.wqworks');
  r.market=await ROOM('market');r.rows=document.querySelectorAll('tr[data-wq109ag]').length;r.pick=document.querySelectorAll('tr[data-wq109ag].pk').length;r.offer=document.querySelectorAll('[data-wq109a^="rec|"]').length;
  r.camp=await ROOM('camp');r.cards=document.querySelectorAll('.wqcf[data-wq109a^="focus|"]').length;r.crow=document.querySelectorAll('tr[data-wq109acamp]').length;r.ros=rosterOf(me()).length;
  r.next=await ROOM('next');r.goals=document.querySelectorAll('.wqgoals li[data-wq109agoal]').length;r.ren=[...document.querySelectorAll('.wqgoals li b')].map(x=>x.textContent);
  return r});
const R=out.rooms;
ok(R.council==='council'&&R.adv===6,'room 3 council: six advisors '+JSON.stringify(R));
ok(R.renown==='renown'&&R.perk,'room 4 renown: the perk card '+JSON.stringify(R));
ok(R.fac==='fac'&&R.build>0&&R.works,'room 5 facilities: the Your ludus card + winter works '+JSON.stringify(R));
ok(R.market==='market'&&R.rows===O.n&&R.pick===1&&R.offer>=2,'room 7 market: the intake, the ★ pick, Scout / Offer '+JSON.stringify(R));
ok(R.camp==='camp'&&R.cards===4&&R.crow===R.ros,'room 8 camp: four focus cards, the roster '+JSON.stringify(R));
ok(R.next==='next'&&R.goals===3&&R.ren.every(x=>/Renown/.test(x)),'room 10: three goals with Renown '+JSON.stringify(R));

/* ---------------- 3 · one promotion, only for a met record ---------------- */
out.promo=await ev(pg,async()=>{const w=W_(),pm=me();const C=council83(w);const A=k=>C.find(a=>a.k===k);const S=adv98S(w);
  A('medicus').lv=2;S.healed=0;A('clerk').lv=2;S.topCoin=Math.max(S.topCoin,900);A('doctore').lv=2;S.bands=Math.max(S.bands,4);
  const letters0=(w.letters||[]).filter(x=>/^adv98-/.test(x.key)).length;const chk=adv98Check(w,pm);
  await ROOM('council');const r={chk,medBtn:!!document.querySelector('[data-wq109a="promo|medicus"]'),clerkBtn:!!document.querySelector('[data-wq109a="promo|clerk"]')};
  r.bad=a109Promote(w,'medicus');r.medLv=A('medicus').lv;
  document.querySelector('[data-wq109a="promo|clerk"]').click();await __W.until(()=>!!document.querySelector('.wqadv.up'),'promoted card',5000);
  r.clerkLv=A('clerk').lv;r.promo=w.wq109a.promo;r.second=a109Promote(w,'doctore');r.docLv=A('doctore').lv;r.btns=[...document.querySelectorAll('[data-wq109a^="promo|"]')].filter(x=>!x.hidden).map(x=>x.dataset.wq109a).join(',');
  r.letters=(w.letters||[]).filter(x=>/^adv98-/.test(x.key)).length-letters0;r.tile=WQ_X.sum.council(w);return r});
const PR=out.promo;
ok(PR.chk===false&&PR.letters===0,'no week-end level-up letters in Winter Quarters '+JSON.stringify(PR));
ok(!PR.medBtn&&PR.bad==null&&PR.medLv===2&&PR.clerkBtn,'an advisor short of his record cannot be promoted '+JSON.stringify(PR));
ok(PR.clerkLv===3&&PR.promo&&PR.promo.k==='clerk'&&PR.second==null&&PR.docLv===2&&PR.btns==='','one promotion a winter '+JSON.stringify(PR));

/* ---------------- 5 · a winter project ---------------- */
out.works=await ev(pg,async()=>{const w=W_(),pm=me();pm.coin=Math.max(pm.coin,2000);await ROOM('fac');const btn=[...document.querySelectorAll('.wq109 [data-mg="build"]')].find(x=>!x.disabled);
  if(!btn)return {none:true};const k=btn.dataset.id;const l0=facLvl(pm,k);btn.click();await __W.until(()=>!!pm.bp104,'project begun',5000);
  return {k,l0,n:pm.bp104&&pm.bp104.n,wq:pm.bp104&&pm.bp104.wq,works:w.wq109a.works,busy:![...document.querySelectorAll('.wq109 [data-mg="build"]')].some(x=>!x.disabled)}});
ok(!out.works.none&&out.works.n===1&&out.works.wq&&out.works.works&&out.works.works.k===out.works.k,'a winter project begins, one week of work '+JSON.stringify(out.works));

/* ---------------- 8 · the camp: once, after the turn, nobody hurt ---------------- */
out.camp=await ev(pg,async()=>{const w=W_(),pm=me();const ros=rosterOf(pm);const hurt=ros[ros.length-1];hurt.inj={until:w.week+3,label:'a cut',pen:1};
  const p=(g,k)=>(gStats(g)[k]||0)+((g.sxp||{})[k]||0);const before={};for(const g of ros)before[g.id]={str:p(g,'str'),int:p(g,'int'),inj:!!g.inj};
  await ROOM('camp');document.querySelector('[data-wq109a="focus|wpn"]').click();await __W.until(()=>w.wq109a.focus==='wpn','focus wpn',5000);
  document.querySelector('[data-wq109a="campgo"]').click();await __W.until(()=>!!w.wq109a.camp,'camp held',5000);await __W.mgrDrawn('#mgrBody');
  const C=w.wq109a.camp;const r={f:C.f,amt:C.amt,went:Object.keys(C.g).length,ward:C.ward,hurtId:hurt.id,turnFirst:w.c104s===w.season};
  r.gain=ros.filter(g=>g!==hurt).every(g=>p(g,'str')>before[g.id].str&&p(g,'int')>before[g.id].int);r.hurtSame=p(hurt,'str')===before[hurt.id].str;
  r.newInj=ros.filter(g=>g!==hurt&&g.inj&&!before[g.id].inj).length;r.again=a109Camp(w,'str');r.f2=w.wq109a.camp.f;r.held=!!document.querySelector('.wqcf[disabled]');
  r.shown=[...document.querySelectorAll('tr[data-wq109acamp]')].filter(t=>t.children[2]&&/→/.test(t.children[2].textContent)).length;return r});
const CP=out.camp;
ok(CP.f==='wpn'&&CP.amt>0.3&&CP.amt<0.6&&CP.turnFirst&&CP.went===out.rooms.ros-1&&CP.ward.includes(CP.hurtId),'camp: the focus, every fit fighter, the ward stays '+JSON.stringify(CP));
ok(CP.gain&&CP.hurtSame&&CP.newInj===0,'camp gains for the fit, nobody hurt '+JSON.stringify(CP));
ok(CP.again==null&&CP.f2==='wpn'&&CP.held&&CP.shown===out.rooms.ros,'camp once; the room shows the turn and the camp '+JSON.stringify(CP));

/* ---------------- ▶ Begin: week 1, the project ready, the goals counting ---------------- */
out.begin=await ev(pg,async k=>{const w=W_(),pm=me();for(const g of rosterOf(pm))g.inj=null;let guard=0;while((w.pend||[]).length&&guard++<30){try{settlePending(0,'stay')}catch(e){w.pend.shift()}}
  await ROOM('next');const l0=facLvl(pm,k);const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);const b=document.querySelector('.wq109nav [data-wq109="begin"]');if(b)b.click();
  await __W.until(()=>W_().season===2,'season 2',20000);clearInterval(hold);await MODALS();
  const G=w.gl109a;return {season:w.season,wk:wkOf(w.week),fac:facLvl(pm,k)-l0,bp:!!pm.bp104,w0:G&&G.w0,o0:G&&G.o0?Object.keys(G.o0).length:0,camp:w.wq109a&&w.wq109a.camp&&w.wq109a.camp.f}},out.works.k);
ok(out.begin.season===2&&out.begin.wk===1&&out.begin.fac===1&&!out.begin.bp,'Begin: week 1, the winter project is ready '+JSON.stringify(out.begin));
ok(out.begin.w0!=null&&out.begin.o0>0&&out.begin.camp==='wpn','the goals count from week 1; the camp is not run again '+JSON.stringify(out.begin));

/* ---------------- the season ends: the goals pay Renown ---------------- */
out.pay=await ev(pg,async()=>{const w=W_(),pm=me();const G=w.gl109a;MGR.tab='ludus';MGR.view=null;await DRAW();const card=!!document.querySelector('#council83 [data-wq109agl]');
  /* meet every goal */
  pm.wins=(pm.wins||0)+30;w.mgrs.forEach((m,i)=>{const s=msp(m,2);s.pts=m===pm?999:40-i;s.w=5;s.b=10;s.ev=10});const ros=rosterOf(pm);for(const id in G.o0)G.o0[id]-=10;
  ros[0].age=19;ros[0].ss={s:2,ev:3,w:2,kp:0,kn:0,dmg:0,taken:0,best:0,worst:null};
  const want=G.list.reduce((a,x)=>a+x.ren,0);const r0=renOf105(pm);const xp0=r0.lv*100000+r0.xp;
  w.week=w.week+11;const P=po104New(w);P.sf=[{k:[P.seeds[0],P.seeds[3]],adv:[P.seeds[0]],pl:null},{k:[P.seeds[1],P.seeds[2]],adv:[P.seeds[1]],pl:null}];P.fin={k:[P.seeds[0],P.seeds[1]],pl:null};P.champ=P.seeds[0];P.phase='fin';P.paid={r1:1,sf:1,fin:1};w.po104=P;w.night.po104='fin';w.night.bouts=[];w.special=null;
  po104OffStart(w,P);const r=renOf105(pm);
  return {card,want,paid:G.paid,src:r.src.goal||0,last:w.gl109aLast===G,news:(w.tlog||[]).some(n=>/Consilium/.test(n.text)&&/Renown/.test(n.text)),next:w.gl109a&&w.gl109a.s,season:w.season,lab:typeof REN105!=='undefined'&&REN105.lab.goal}});
const PY=out.pay;
ok(PY.card,'the goals show on the council card in the season '+JSON.stringify(PY));
ok(PY.paid&&PY.paid.ren===PY.want&&PY.paid.met.every(Boolean)&&PY.src===PY.want&&PY.last&&PY.news&&PY.next===3&&!!PY.lab,'season end: the goals pay Renown ("Consilium goals") '+JSON.stringify(PY));
await pg.close();

/* ---------------- phones ---------------- */
const p2=await open(0,{width:390,height:844});await p2.evaluate(helpers);
out.phone=await ev(p2,async()=>{const w=await BOOTW();po104OffStart(w,w.po104);await WQ();const r={};
  for(const k of ['over','council','renown','fac','market','camp','next']){await ROOM(k);r[k]=[HSCROLL(),document.scrollingElement.scrollWidth]}return r});
ok(Object.values(out.phone).every(x=>!x[0]),'phone 390 px: no horizontal page scroll '+JSON.stringify(out.phone));
await p2.close();

/* ---------------- the kill switch: v1.09 ---------------- */
const p3=await open(1);await p3.evaluate(helpers);
out.off=await ev(p3,async()=>{const w=await BOOTW();const n0=w.glads.length;po104OffStart(w,w.po104);await WQ();
  return {A:window.A109&&window.A109.on,steps:document.querySelectorAll('.wq109st .wqs').length,st:!!w.wq109a,gl:!!w.gl109a,glads:w.glads.length-n0,council:!!document.querySelector('[data-wq109="go|council"]')}});
ok(out.off.A===false&&out.off.steps===5&&!out.off.st&&!out.off.gl&&out.off.glads===0&&!out.off.council,'kill switch: v1.09 rooms only, no intake '+JSON.stringify(out.off));
await p3.close();

console.log(JSON.stringify(out).slice(0,4000));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.slice(0,10)));await b.close();process.exit(miss.length||errs.length?1:0)})();

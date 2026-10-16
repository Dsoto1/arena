/* tv104d — v1.04 builder D (351-v104ward): RECRUITING (fewer Recruiter's hours, rising cost per extra action on one recruit a week, the trial
   needs 2 earlier looks in an earlier week, the board holds 6 + Recruiter level, offers answered NEXT week: sign / lowball scare, rivals' signings
   become offers answered next week), THE INFIRMARY'S TWO WINGS (banner hours bar split wound care / recovery, Wounded / Weary groups, statue +
   fatigue gauge, ⚕ Ward | ♨ Baths tabs opening on the fitting one, plates with hours + effect, the week's tabula with the ★ order; rub-down 1
   Medicus hour, Care routine 1 h a week, Rest week 0 h; Medicus +3, training −2; the yard's Recovery block gone), THE MEDICUS QUEUE + the
   Match Week warning, BUILDINGS TAKE WEEKS (one project, level N = N weeks, finishes at the week's end, rivals too), Upgrade School / Promote
   art tiles (Build only when affordable), the kill switch, 390 px, no new errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v104doff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.ord87=null;g.morale=80}
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('infirm');await W8(800);MGR.view=null;
    window.J_END=async()=>{const w=W_();for(const bo of w.night.bouts)bo.done=true;w.pend=[];w.special=null;const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let r;try{r=await endWeek()}catch(e){r='ERR '+e}clearInterval(hold);await W8(300);return r};
    window.GO=async t=>{MGR.tab=t;MGR.view=null;MGR_REDRAW();await W8(500)}});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const pg=await open(1440,900);

/* ---------- the infirmary ---------- */
const inf=await ev(pg,async()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const r={};const w=W_(),pm=me();const ros=rosterOf(pm);
  const A=ros[ros.length-1],B=ros[0],C=ros[1],D=ros[2];A.inj={until:w.week+3,label:'a gashed chest',pen:4,ser76:1,wk102:w.week-1};A.severed=['larm'];A.fat=64;B.inj={until:w.week+2,label:'a twisted ankle',pen:1,wk102:w.week-1};C.fat=55;D.fat=72;w.beds76=[];w.medicus76=null;pm.fac=pm.fac||{};pm.fac.valet=0;
  r.med=mh101Max(pm,w)===7;r.th=thMax()===8;
  MGR.inf90=A.id;await GO('infirm');
  r.ban=!!q('#mgrPane .roomhd.w104ban .w104hb .w104bar')&&!!q('.w104hb .k104wc')&&!!q('.w104hb .k104rc')&&/7 of 7/.test(q('.w104hb').textContent)&&!!q('.roomhd [data-v101med]')&&!!q('.roomhd [data-cure90]')&&!!q('.roomhd .rm100adv');
  r.groups=qa('.w104grp.wd [data-inf90]').length===2&&qa('.w104grp.wy [data-inf90]').length===2&&!!q('details.w104grp.fr');
  r.statue=!!q('.w104mid .rm100niche svg')&&!!q('.w104mid .w104g .w104gb');r.hyg=!!q('.w104list .hyg87 [data-m48="hygeia"]');
  r.wardTab=!!q('[data-w104t="ward"].on')&&!!q('.v104pl[data-v104p="bed"][data-bed76]')&&!!q('.v104pl[data-v104p="medic"][data-mg="medic"]')&&!!q('.v104pl[data-v104p="heal"]')&&!!q('.v104pl[data-v104p="asclepius"]')&&!!q('.v104pl[data-v104p="build"][data-mg="build"][data-id="valet"]');
  r.plateTxt=qa('.v104pl').every(p=>p.querySelector('.v104ph')&&p.querySelector('.v104fx')&&p.querySelector('.rm100fr img'))&&/2 h/.test(q('[data-v104p="medic"] .v104ph').textContent)&&/→/.test(q('[data-v104p="medic"] .v104fx').textContent);
  r.star=!!q('.v104pl.v101rec .v101star');r.tabula=!!q('.w104tab .w104q li.rec')&&!!q('.w104tab [data-mq104]');
  /* queue: bed + Hygeia for A, the Medicus for B */
  q('[data-mq104]').click();await W8(500);r.queue=inBed76(A)&&!!(A.rg102&&A.rg102.wk===w.week)&&!!(B.inj&&B.inj.bk102)&&mh101Left(w,pm)<7;
  r.treated=!!q(`.w104grp.wd [data-inf90="${B.id}"] .trt103`);
  /* baths for a weary fighter */
  w.mh101=null;
  MGR.inf90=C.id;await GO('infirm');r.bathsTab=!!q('[data-w104t="baths"].on')&&!!q('.v104pl[data-v104p="rub"][data-bath]')&&!!q('.v104pl[data-v104p="care"][data-care90]')&&!!q('.v104pl[data-v104p="rest"][data-rest]')&&/0 h/.test(q('[data-v104p="rest"] .v104ph').textContent);
  const th0=thLeft(w),f0=gFat(C),h0=mh101Left(w,pm);q('[data-v104p="rub"]').click();await W8(400);r.rub=gFat(C)===f0-10&&mh101Left(w,pm)===h0-1&&thLeft(w)===th0;
  q('[data-v104p="care"]').click();await W8(400);r.care=!!(C.ord87&&C.ord87.r==='care')&&mh101Left(w,pm)===h0-2&&thLeft(w)===th0;
  r.rested=!!q(`[data-inf90="${C.id}"] .rst104`);r.split=/recovery 2 h/.test(q('.w104hb').textContent);r.next=!!q('.w104g .nx');
  q('[data-w104t="ward"]').click();await W8(400);r.tabSw=!!q('[data-w104t="ward"].on');
  /* rest week, 0 h */
  MGR.inf90=D.id;MGR.w104for=null;await GO('infirm');const h1=mh101Left(w,pm);for(const bo of w.night.bouts)bo.ents=bo.ents.filter(id=>id!==D.id);q('[data-v104p="rest"]').click();await W8(400);r.rest=D.restWk===w.week&&mh101Left(w,pm)===h1;
  /* care with no hours left is refused */
  const E=ros[3];E.fat=40;w.mh101={wk:w.week,u:mh101Max(pm,w)};MGR.inf90=E.id;MGR.w104for=null;await GO('infirm');q('[data-v104p="care"]').click();await W8(300);r.careNo=!(E.ord87&&E.ord87.r==='care');
  /* the yard: no Recovery block */
  await GO('practice');r.yard=!q('#mgrPane .v101rec2')&&!q('#mgrPane [data-bath]');
  /* week end: paid care −20, unpaid none; the new week's care paid */
  w.mh101=null;
  return r});
for(const [k,v] of Object.entries(inf))ok(v,'infirmary '+k);

/* ---------- buildings take weeks ---------- */
const bld=await ev(pg,async()=>{const q=s=>document.querySelector(s);const r={};const w=W_(),pm=me();pm.coin=2000;pm.fac=pm.fac||{};pm.fac.barracks=1;pm.facWk=null;delete pm.bp104;await GO('ludus');
  q('.k-school').click();await W8(500);r.tiles=document.querySelectorAll('.lu102fac .bp104t').length>=6&&!!q('.lu102fac .bp104t .bp104pair .bp104a.nx img');
  const bb=q('.lu102fac [data-mg="build"][data-id="barracks"]');r.can=!!bb&&!bb.disabled;bb.click();await W8(500);
  r.start=!!pm.bp104&&pm.bp104.k==='barracks'&&pm.bp104.l===2&&pm.bp104.end===w.week+1&&facLvl(pm,'barracks')===1&&pm.coin===2000-FAC_COST[1];
  q('.k-school')&&q('.k-school').click();await W8(400);const yb=q('.lu102fac [data-mg="build"][data-id="yard"]');r.busy=!!yb&&yb.disabled;
  await GO('ludus');r.banner=!!q('.lu100ban .bp104c');
  const R=w.mgrs.find(m=>!m.isPlayer&&!m.dead);R.coin=5000;R.fac=R.fac||{};R.fac.yard=0;delete R.bp104;R.facWk=null;r.rival=facBuild(R,'yard',true)&&!!R.bp104&&facLvl(R,'yard')===0&&!facBuild(R,'stands',true);
  const wk0=w.week;await J_END();r.mid=W_().week===wk0+1&&facLvl(pm,'barracks')===1&&!!pm.bp104&&pm.facWk===W_().week&&facLvl(R,'yard')===1;
  await J_END();r.done=facLvl(pm,'barracks')===2&&!pm.bp104;
  /* a frozen playoff week (w.week stays put) still takes a week off the work */
  {const R2=w.mgrs.find(m=>!m.isPlayer&&!m.dead&&m!==R);R2.coin=5000;R2.fac=R2.fac||{};R2.fac.stands=1;delete R2.bp104;facBuild(R2,'stands',true);const wk=W_().week;bp104Week(W_());const half=!!R2.bp104&&R2.bp104.n===1;bp104Week(W_());r.frozen=half&&!R2.bp104&&facLvl(R2,'stands')===2&&W_().week===wk}
  pm.coin=10;pm.facWk=null;await GO('ludus');q('.k-school').click();await W8(400);const sb=q('.lu102fac [data-mg="build"][data-id="stables"]');r.poor=!!sb&&sb.disabled&&!!q('.lu102fac .bp104why');
  q('[data-lu102fac="0"]')&&q('[data-lu102fac="0"]').click();await W8(300);
  q('[data-mg="run"][data-id="promote"]').click();await W8(500);r.promote=document.querySelectorAll('.pr104g .pr104t .pr104a img').length>=3;
  pm.coin=900;return r});
for(const [k,v] of Object.entries(bld))ok(v,'buildings '+k);

/* ---------- care routine across the week's end ---------- */
const cw=await ev(pg,async()=>{const r={};const w=W_(),pm=me();const ros=rosterOf(pm);for(const g of ros){g.inj=null;g.severed=[];g.ord87=null;g.restWk=null}
  w.rc104=null;w.mh101=null;const P=ros[0],Q=ros[1];P.fat=60;Q.fat=60;ord87Set(P,'care');w.mh101={wk:w.week,u:mh101Max(pm,w)};ord87Set(Q,'care');r.unpaid=!rc104Cared(w,Q)&&rc104Cared(w,P);if(!r.unpaid)r.dbg=[rc104Cared(w,Q),rc104Cared(w,P),roadLocked76(w),JSON.stringify(P.ord87),P.restWk,w.week,JSON.stringify(w.rc104),mh101Left(w,pm),P.alive].join('|');
  await J_END();const w2=W_();r.paidDrop=gFat(P)<gFat(Q);r.newWeek=rc104Cared(w2,P)&&rc104Cared(w2,Q)&&rc104Used(w2)===2;return r});
for(const [k,v] of Object.entries(cw))ok(v,'care week '+k);

/* ---------- recruiting ---------- */
const rec=await ev(pg,async()=>{const r={};const w=W_(),pm=me();for(const g of w.glads)g.favd=false;w.bd104=[];
  const lv=adv98Lv(w);const n=rec101Own(w);r.hours=rec98HrsMax(w)===(n<=3?16:n<=6?12:n<=9?9:6)+3*(lv-1);
  const fa=freeAgents().filter(g=>!g.inj);const g=fa[0];
  const c1=REC98.acts.watch.h;const a1=rec98Act(g,'ask');r.first=a1.ok&&g.favd;const used0=rec98Used(w);const a2=rec98Act(g,'watch');r.rising=a2.ok&&rec98Used(w)-used0===c1+1;
  r.btn=/⏳3 h/.test(rec98Btn(g,'cup'));
  r.trialNo=!rec98Can(g,'trial')[0]&&/earlier/.test(rec98Can(g,'trial')[1]);
  /* board cap */
  const cap=bd104Cap(w);r.cap=cap===6+adv98Lv(w,'recruiter');for(const x of fa.slice(1,cap))x.favd=true;bd104Sync(w);const out=fa[cap+1];const ca=rec98Can(out,'ask');r.boardFull=!ca[0]&&/board is full/.test(ca[1]);
  out.favd=true;bd104Sync(w);r.trim=!out.favd;
  /* offers next week */
  for(const x of fa.slice(2,cap))x.favd=false;bd104Sync(w);
  const h=fa[1];h.favd=true;h.interest[pm.id]=99;const ask=askWage(h);let s=of104Send(w,h,{wage:Math.ceil(ask*1.6),weeks:10,bonus:0});r.sent=s.ok&&!h.contract&&!!w.of104[h.id];
  const l=fa[2];l.favd=true;s=of104Send(w,l,{wage:Math.max(1,Math.floor(ask*0.3)),weeks:8,bonus:0});r.sentLow=s.ok;r.dup=!of104Send(w,h,{wage:ask,weeks:8}).ok;
  await GO('recruit');MGR.sel=h.id;MGR.recStep=3;await GO('recruit');r.ui=!!document.querySelector('.pipeline .bd104')&&!!document.querySelector('.pipeline .of104c');
  const wk0=w.week;await J_END();const m=me();r.signed=!!h.contract&&h.contract.mgr===m.id;r.scared=!l.contract&&!!(l.sc104&&l.sc104[m.id]>=W_().week);r.letter=(W_().letters||[]).some(x=>/^of104_/.test(x.key));
  r.scaredNo=!of104Send(W_(),l,{wage:askWage(l)*2,weeks:8}).ok;
  /* trial after two looks in an earlier week */
  const t=rec98Can(g,'trial');r.trialOk=t[0]||!/earlier/.test(t[1]||'');
  /* rivals: a signing becomes an offer */
  const w2=W_();const R=w2.mgrs.find(x=>!x.isPlayer&&!x.dead);const fr=freeAgents().find(x=>!x.inj);w2.ro104={};
  const base=fr.unsigned;fr.contract={mgr:R.id,wage:10,weeks:8,since:w2.week};fr.contract=null;
  const s0=freeAgents().length;const ro=w2.ro104;ro[fr.id]={mid:R.id,wage:askWage(fr),weeks:8,wk:w2.week-1};fr.interest[R.id]=90;cpuLeagueWeek();r.rivalAns=!!fr.contract&&fr.contract.mgr===R.id&&!ro[fr.id];
  r.rivalOffers=Object.values(w2.ro104).every(o=>o.wk===w2.week)&&freeAgents().every(x=>!x.contract);void base;void s0;
  return r});
for(const [k,v] of Object.entries(rec))ok(v,'recruiting '+k);

/* ---------- Match Week warning on Your ludus ---------- */
const mw=await ev(pg,async()=>{const w=W_(),pm=me();for(const g of rosterOf(pm))g.inj=null;st95Ensure(w,pm);const st=rosterOf(pm).filter(g=>g.slot95);for(const g of st.slice(0,2))g.inj={until:w.week+2,label:'a cut',pen:1,wk102:w.week};
  if(w.night)w.night.bye=false;for(const bo of (w.night&&w.night.bouts)||[])bo.done=false;await GO('ludus');const a=!!mq104Warn(w,pm)&&!!document.querySelector('#mgrBody .mq104w');for(const g of rosterOf(pm))g.inj=null;return a});
ok(mw,'match week warning');

/* ---------- 390 px ---------- */
const ph=await b.newPage({viewport:{width:390,height:844}});await ph.route(/fonts\./,r=>r.abort());ph.on('pageerror',e=>errs.push(e.message));
await ph.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await ph.goto('file://'+process.argv[2]);await ph.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const p=await ph.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;W_().welc99=1;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}const g=rosterOf(me())[0];g.inj={until:W_().week+2,label:'a cut',pen:1};MGR.inf90=g.id;
  openManager('infirm');MGR.tab='infirm';MGR_REDRAW();await W8(800);const el=document.querySelector('.w104');const pl=document.querySelector('.w104plates');
  return {w:!!el&&el.scrollWidth<=el.clientWidth+2&&document.documentElement.scrollWidth<=392,pl:!!pl&&pl.getBoundingClientRect().width<=392,hb:!!document.querySelector('.w104hb')&&document.querySelector('.w104hb').getBoundingClientRect().right<=392}});
for(const [k,v] of Object.entries(p))ok(v,'390 '+k);

/* ---------- kill switch ---------- */
const pk=await open(1440,900,1);
const kk=await ev(pk,async()=>{const w=W_(),pm=me();await GO('infirm');return {old:!document.querySelector('.w104')&&!!document.querySelector('.iv90'),med:mh101Max(pm,w)===4+3*facLvl(pm,'valet'),th:thMax()>=10}});
for(const [k,v] of Object.entries(kk))ok(v,'kill '+k);

const newErr=await ev(pg,()=>typeof errNew92==='function'?errNew92(window.RM_MARK).map(e=>e.kind+':'+e.msg):[]);
console.log(JSON.stringify({inf,bld,cw,rec,mw,p,kk,newErr}));console.log('MISSING',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.concat(newErr)));
await b.close();process.exit(miss.length||errs.length||newErr.length?1:0)})();

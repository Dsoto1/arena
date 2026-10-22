/* tv109w — v1.09 WINTER QUARTERS (413-v109wq): a real career played through season 1 into the off-season. The Match Week tab reads
   Winter Quarters; the overview + rooms 1 Awards night, 2 Accounts, 6 Personnel, 10 Next season render with the world's data; the money
   ledger's categories sum to the treasury change; ✍ Seal pays 47's Ledger once (a reload does not pay again, nor does the season's end);
   renewals act on the real contracts; ▶ Begin starts season 2 at week 1; the kill switch flavius_v109wqoff=1 restores the old page; an old
   save mid-off-season (no ledger, no Winter Quarters state) loads; phones 390 px have no horizontal page scroll; no console errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:vw||{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('console: '+m.text().slice(0,200))});
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_v106b1off','1');if(o)localStorage.setItem('flavius_v109wqoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,600));console.log(JSON.stringify(out,null,1).slice(0,6000));await b.close();process.exit(1)}};
const helpers=()=>{window.W8=ms=>new Promise(r=>setTimeout(r,ms));
  window.ENS=async()=>{const el=document.querySelector('#mgrBody');if(!el||!el.offsetParent){menuHide();openManager(MGR.tab||'ludus');await W8(900)}};
  window.SIMS=async()=>{const w=W_();for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k)};
  window.PW=async()=>{const w=W_();for(const g of rosterOf(me()))g.inj=null;if(w.special&&!w.special.done)await specAutoRun();
    try{if(!OFF104.phase(w)&&w.night&&!w.night.bye){const pm=me();const F=rosterOf(pm).filter(g=>!g.inj).sort((a,b)=>effOvr(b)-effOvr(a)).slice(0,3);let bi=0;for(const g of F){for(;bi<w.night.bouts.length;bi++){const r=any100Enter(w,bi,g.id,{mgr:pm,move:true});if(r&&r.ok){bi++;break}}}}}catch(e){}
    await SIMS();let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];try{if(P.t==='thumb')settlePending(0,null,{d6:6,d12:12});else if(P.t==='blood')settlePending(0,'let');else settlePending(0,'stay')}catch(e){w.pend.shift()}}
    const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let rr;try{rr=await endWeek()}finally{clearInterval(hold)}await W8(80);return rr};
  window.SHEET=()=>{const w=W_(),pm=me();const L=w.led109;const c=L&&L.c||{};let sum=0;for(const k of Object.keys(c))sum+=c[k].i-c[k].o;return {s:L&&L.s,part:L&&L.part,c0:L&&L.c0,coin:pm.coin,sum,res:L?pm.coin-L.c0-sum:null,cats:Object.fromEntries(Object.entries(c).map(([k,v])=>[k,[v.i,v.o]]))}};
  window.ROOM=async k=>{const b=document.querySelector(`[data-wq109="go|${k}"]`);if(b)b.click();else{wqGo(k)}await W8(350);return document.querySelector('.wq109')?document.querySelector('.wq109').dataset.wq109step:null};
  window.HSCROLL=()=>document.scrollingElement.scrollWidth>window.innerWidth+1};

/* ---------------- a real season 1 → the off-season ---------------- */
const pg=await open(0);
await pg.evaluate(helpers);
out.s1=await ev(pg,async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=1400;w.rules.death=0;w.rules.inj=40;w.train='off';w.tplan=null;
  for(let i=0;i<4;i++){const g=genGlad({ovr:58+i*4});g.contract={mgr:pm.id,wage:4+i,weeks:i<2?16:40,since:1};w.glads.push(g)}
  rosterOf(pm).forEach((g,i)=>{if(i<2)g.contract.weeks=17});po104Snap(w);
  for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
  const r={acc:!!(Object.getOwnPropertyDescriptor(pm,'coin')||{}).get,led:!!w.led109,part:w.led109&&w.led109.part};
  let g=0;while(OFF104.phase(w)!=='off'&&g++<22){await PW()}
  for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
  r.ph=OFF104.phase(w);r.season=w.season;r.ren=(w.po104.ren||[]).length;r.sheet=SHEET();r.id=w.id;
  r.letters=(w.letters||[]).map(x=>x.key).filter(k=>/^wq109|^sr104|^c104ret/.test(k));r.newsAsk=(w.tlog||[]).some(n=>/contract ask/.test(n.text)&&/off-season page/.test(n.text));
  return r});
ok(out.s1.acc&&out.s1.led&&out.s1.part===0,'the ledger runs from a new career '+JSON.stringify(out.s1).slice(0,300));
ok(out.s1.ph==='off'&&out.s1.season===1,'season 1 played into the off-season '+JSON.stringify(out.s1).slice(0,300));
const S1=out.s1.sheet;
ok(S1.s===1&&S1.res===0&&S1.coin-S1.c0===S1.sum,'ledger categories sum to the treasury change '+JSON.stringify(S1));
ok(S1.cats.wages&&S1.cats.wages[1]>0&&S1.cats.purses&&S1.cats.purses[0]>0,'wages out and purses in are booked '+JSON.stringify(S1.cats));
ok(out.s1.letters.includes('wq109-1')&&out.s1.letters.includes('sr104-1')&&!out.s1.newsAsk,'one Winter Quarters letter, the review kept, no asks news '+JSON.stringify(out.s1.letters));

/* ---------------- the tab, the overview, the rooms ---------------- */
out.rooms=await ev(pg,async()=>{const w=W_(),pm=me();menuHide();openManager('night');await W8(900);const r={};
  const nb=document.querySelector('.mtabs [data-mg="tab"][data-id="night"]');r.rail=nb?nb.textContent.trim():'';
  r.wq=!!document.querySelector('#mgrPane .wq109');r.old=!!document.querySelector('.po104off');r.step=(document.querySelector('.wq109')||{dataset:{}}).dataset.wq109step;
  r.steps=document.querySelectorAll('.wq109st .wqs').length;r.k109a=!!(window.A109&&window.A109.on);r.k109b=!!(window.V109B&&window.V109B.on);r.tiles=document.querySelectorAll('.wqtiles .wqt').length;
  /* 1 awards */
  r.seen0=!!(w.awardShow&&w.awardShow.seen);r.s1=await ROOM('awards');r.rows=document.querySelectorAll('.wqtbl tbody tr').length;r.houses=w.mgrs.filter(m=>!m.dead&&!m.sica).length;
  r.sb=[...document.querySelectorAll('.wqtbl td.sb')].filter(td=>td.textContent.trim()!=='—').length;r.aw=document.querySelectorAll('.wqaws .wqaw').length;r.awN=(w.awardShow&&w.awardShow.awards||[]).length;
  r.seen=!!(w.awardShow&&w.awardShow.seen);r.me=!!document.querySelector('.wqtbl tr.me');
  /* 2 books */
  r.s2=await ROOM('books');r.bars=[...document.querySelectorAll('.wqacc [data-wq109cat]')].map(x=>x.dataset.wq109cat);r.sealBtn=!!document.querySelector('[data-wq109="seal"]');
  r.qlines=document.querySelectorAll('.wqled .wqll').length;
  /* 6 staff */
  r.s3=await ROOM('staff');r.renRows=document.querySelectorAll('.po104rn[data-po104ren]').length;r.ren=(w.po104.ren||[]).length;r.ctRows=document.querySelectorAll('.wqct tbody tr').length;r.ros=rosterOf(pm).length;
  /* 10 next */
  r.s4=await ROOM('next');r.wks=document.querySelectorAll('.wqwks .wqwk').length;r.begin=!!document.querySelector('.wq109nav [data-wq109="begin"]');
  /* the rail's End the week opens room 10, not the old confirm */
  await ROOM('over');const e=document.querySelector('[data-mg="endask"]');if(e)e.click();await W8(400);r.endask=(document.querySelector('.wq109')||{dataset:{}}).dataset.wq109step;r.confirm=!!document.querySelector('.endconfirm');
  /* the awards tab → room 1 */
  MGR.tab='awards';MGR_REDRAW();await W8(400);r.awTab=MGR.tab+'/'+((document.querySelector('.wq109')||{dataset:{}}).dataset.wq109step);
  return r});
const R=out.rooms;/* v1.09a (414) adds rooms 3 4 5 7 8: 10 steps; with flavius_v109aoff=1 the v1.09 five; v1.09b (415) adds room 9 the Winter Classic */const WQ_N=(R.k109a?10:5)+(R.k109b?1:0);
ok(/Winter Quarters/.test(R.rail)&&R.wq&&!R.old&&R.step==='over'&&R.steps===WQ_N&&R.tiles===WQ_N-1,'the tab is Winter Quarters: stepper + overview '+JSON.stringify(R));
ok(R.s1==='awards'&&R.rows===R.houses&&R.sb>=12&&R.aw===R.awN&&R.aw>0&&R.seen&&R.me,'room 1 awards night: table, Superbus column, awards '+JSON.stringify(R));
ok(R.s2==='books'&&R.bars.includes('wages')&&R.bars.includes('purses')&&R.sealBtn&&R.qlines>=2,'room 2 accounts: categories + the Ledger '+JSON.stringify(R));
ok(R.s3==='staff'&&R.renRows===R.ren&&R.ctRows===R.ros,'room 6 personnel: the real asks + contracts '+JSON.stringify(R));
ok(R.s4==='next'&&R.wks===15&&R.begin,'room 10 next season: schedule + Begin '+JSON.stringify(R));
ok(R.endask==='next'&&!R.confirm&&R.awTab==='night/awards','End the week → room 10; the awards tab → room 1 '+JSON.stringify(R));

/* ---------------- renewals act on the real contracts ---------------- */
out.ren=await ev(pg,async()=>{const w=W_();await ROOM('staff');const P=po104P(w);const x=(P.ren||[]).find(r=>r.kind==='raise'&&!r.st);if(!x)return {none:true,ren:(P.ren||[]).length};const g=gById(x.gid);
  const w0=g.contract.weeks;const b=document.querySelector(`[data-po104="ren|${g.id}|y"]`);const r={btn:!!b,label:b?b.textContent:''};if(b)b.click();await W8(400);
  r.st=x.st;r.wage=g.contract.wage===x.wage;r.weeks=g.contract.weeks===w0+x.weeks;r.badge=!!document.querySelector(`.po104rn[data-po104ren="${g.id}"] .badge`);return r});
ok(out.ren.none||(out.ren.btn&&/Sign/.test(out.ren.label)&&out.ren.st==='yes'&&out.ren.wage&&out.ren.weeks&&out.ren.badge),'renewal signs on the real contract '+JSON.stringify(out.ren));

/* ---------------- ✍ Seal pays once ---------------- */
out.seal=await ev(pg,async()=>{const w=W_(),pm=me();await ROOM('books');const Q=wqQ(w,pm);const want=wqQLines(Q).total;const c0=pm.coin;const s0=SHEET();
  document.querySelector('[data-wq109="seal"]').click();await W8(400);const r={want,paid:pm.coin-c0,sealed:!!(w.wq109.sealed),seen:!!(w.qsLast&&w.qsLast.seen),qsDue:w.qsDue,sealedBtn:!!document.querySelector('.wqled .btn[disabled]')};
  const s1=SHEET();r.senate=(s1.cats.senate?s1.cats.senate[0]:0)-(s0.cats.senate?s0.cats.senate[0]:0);
  r.again=wqSeal(w,pm);r.paid2=pm.coin-c0;await saveWorld(true);await W8(300);r.coin=pm.coin;r.id=w.id;return r});
ok(out.seal.want>0&&out.seal.paid===out.seal.want&&out.seal.sealed&&out.seal.seen&&!out.seal.qsDue&&out.seal.sealedBtn&&out.seal.again==null&&out.seal.paid2===out.seal.want,'Seal pays the Ledger once '+JSON.stringify(out.seal));
ok(out.seal.senate===out.seal.want,'the Ledger is booked as Senate & other '+JSON.stringify(out.seal));

/* ---------------- reload: resume mid-winter, no second pay ---------------- */
await pg.reload();await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});await pg.evaluate(helpers);
out.re=await ev(pg,async id=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(400);
  const L=await Store.list('mgrCareers');const d=L.find(c=>c.id===id);MGR.view=null;MGR.world=mgrMigrate(JSON.parse(d.world));MGR.tab='night';MGR_REDRAW();await W8(700);
  const w=W_(),pm=me();const r={coin:pm.coin,step:w.wq109&&w.wq109.step,sealed:!!(w.wq109&&w.wq109.sealed),page:(document.querySelector('.wq109')||{dataset:{}}).dataset.wq109step,acc:!!(Object.getOwnPropertyDescriptor(pm,'coin')||{}).get};
  r.again=wqSeal(w,pm);r.coin2=pm.coin;r.sheet=SHEET();return r},out.seal.id);
ok(out.re.coin===out.seal.coin&&out.re.coin2===out.re.coin&&out.re.sealed&&out.re.again==null&&out.re.page==='books'&&out.re.acc,'reload: same room, sealed, no second pay '+JSON.stringify(out.re));

/* ---------------- ▶ Begin season 2 ---------------- */
out.begin=await ev(pg,async()=>{const w=W_(),pm=me();await ROOM('next');let guard=0;while((w.pend||[]).length&&guard++<30){try{settlePending(0,'stay')}catch(e){w.pend.shift()}}MGR_REDRAW();await W8(300);const ql=(w.tlog||[]).filter(n=>/Quaestor/.test(n.text)).length;if(window.wc109Answer){wc109Answer(w,'out');MGR_REDRAW();await W8(300)}/* v1.09b W5a: Begin needs the Winter Classic answered */const b=document.querySelector('.wq109nav [data-wq109="begin"]');const r={btn:!!b,dis:b&&b.disabled,why:weekReady().why,pend:(w.pend||[]).map(p=>p.t),sp:!!(w.special&&!w.special.done)};
  const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);if(b)b.click();for(let i=0;i<400&&W_().season===1;i++)await W8(150);await W8(600);clearInterval(hold);
  const w2=W_();r.season=w2.season;r.wk=wkOf(w2.week);r.ph=OFF104.phase(w2);r.qsDue=w2.qsDue;r.lp90=w2.lp90;
  MGR.tab='ludus';MGR_REDRAW();await W8(400);MGR_REDRAW();await W8(300);r.ql=(w2.tlog||[]).filter(n=>/Quaestor/.test(n.text)).length-ql;r.qsLast=w2.qsLast&&w2.qsLast.season;
  const nb=document.querySelector('.mtabs [data-mg="tab"][data-id="night"]');r.rail=nb?nb.textContent.trim():'';r.led=w2.led109&&w2.led109.s;r.h=(w2.led109h||[]).map(x=>x.s);return r});
ok(out.begin.btn&&!out.begin.dis&&out.begin.season===2&&out.begin.wk===1&&out.begin.ph!=='off','Begin starts season 2 at week 1 '+JSON.stringify(out.begin));
ok(!out.begin.qsDue&&out.begin.ql===0&&out.begin.qsLast===1&&out.begin.lp90===1,'no second Ledger at the season start; the league prize still paid '+JSON.stringify(out.begin));
ok(!/Winter Quarters/.test(out.begin.rail),'season 2: Match Week again '+JSON.stringify(out.begin));
await pg.close();

/* ---------------- forged off-season pages (fast): an old save, phones, the kill switch ---------------- */
const forge=async(pg,old)=>{await pg.evaluate(helpers);return ev(pg,async old=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;w.train='off';w.tplan=null;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
  const ros=rosterOf(pm);ros.forEach((g,i)=>{g.contract.weeks=i<2?4:30;g.rec.ev=10+i;g.rec.w=4+i});w.mgrs.forEach((m,i)=>{const s=msp(m,1);s.pts=40-i*3;s.w=12-i;s.b=14;s.ev=14});
  const P=po104New(w);P.sf=[{k:[P.seeds[0],P.seeds[3]],adv:[P.seeds[0]],pl:null},{k:[P.seeds[1],P.seeds[2]],adv:[P.seeds[1]],pl:null}];P.fin={k:[P.seeds[0],P.seeds[1]],pl:null};P.champ=P.seeds[0];P.phase='fin';P.paid={r1:1,sf:1,fin:1};w.po104=P;w.night.po104='fin';w.week=12;
  po104OffStart(w,P);
  if(old){/* a 1.08b save made mid-off-season: no ledger, no Winter Quarters state */const J=JSON.parse(JSON.stringify(w));delete J.led109;delete J.wq109;J.letters=(J.letters||[]).filter(x=>!/^wq109/.test(x.key));J.ver='1.08b';MGR.world=mgrMigrate(J);migrateWorld(MGR.world)}
  menuHide();openManager('night');await W8(800);return {ren:(po104P(W_()).ren||[]).length}},old)};
const p2=await open(0);out.old=await forge(p2,true);
out.old2=await ev(p2,async()=>{const w=W_(),pm=me();const r={led:!!w.led109,part:w.led109&&w.led109.part,wq:!!document.querySelector('.wq109'),acc:!!(Object.getOwnPropertyDescriptor(pm,'coin')||{}).get};
  r.b=await ROOM('books');r.note=!!document.querySelector('.wqpart');r.a=await ROOM('awards');r.s=await ROOM('staff');r.rows=document.querySelectorAll('.po104rn[data-po104ren]').length;r.n=await ROOM('next');return r});
ok(out.old2.led&&out.old2.part===1&&out.old2.wq&&out.old2.acc&&out.old2.b==='books'&&out.old2.note&&out.old2.a==='awards'&&out.old2.s==='staff'&&out.old2.rows===out.old.ren&&out.old2.n==='next','an old save mid-off-season loads into Winter Quarters '+JSON.stringify({...out.old,...out.old2}));
/* phones */
await p2.setViewportSize({width:390,height:844});await p2.waitForTimeout(500);
out.phone=await ev(p2,async()=>{const r={};for(const k of ['over','awards','books','staff','next']){await ROOM(k);await W8(150);const st=document.querySelector('.wq109st');r[k]=[HSCROLL(),document.scrollingElement.scrollWidth,st?st.scrollWidth>st.clientWidth-1:null]}return r});
ok(Object.values(out.phone).every(x=>!x[0]),'phone 390 px: no horizontal page scroll '+JSON.stringify(out.phone));
await p2.close();
/* the kill switch: the old off-season page */
const p3=await open(1);out.off=await forge(p3,false);
out.off2=await ev(p3,async()=>{const w=W_();const nb=document.querySelector('.mtabs [data-mg="tab"][data-id="night"]');return {old:!!document.querySelector('.po104off'),wq:!!document.querySelector('.wq109'),rail:nb?nb.textContent.trim():'',
  led:!!w.led109,acc:!!(Object.getOwnPropertyDescriptor(me(),'coin')||{}).get,letter:(w.letters||[]).some(x=>/^wq109/.test(x.key)),rows:document.querySelectorAll('.po104off .po104rn').length}});
ok(out.off2.old&&!out.off2.wq&&/Off-season/.test(out.off2.rail)&&!out.off2.acc&&!out.off2.letter&&out.off2.rows===out.off.ren,'kill switch: the old off-season page '+JSON.stringify(out.off2));
await p3.close();

console.log(JSON.stringify(out).slice(0,4000));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.slice(0,10)));await b.close();process.exit(miss.length||errs.length?1:0)})();

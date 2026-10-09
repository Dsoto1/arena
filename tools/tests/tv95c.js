/* v0.95 part C — MANAGER (229-v95mgr): 1 a trade offer whose offered fighters are gone is withdrawn (week start, shown, Accept refuses; ours is never
   handed over for nothing) · 2 closing an invitational on a finished week ends the week the same way (Acta, then Your ludus) · 3 the signing card shows
   his portrait · 4 recruiting tablets have no buttons, a click selects, the card keeps the actions · 5 Week N in review: "From your Doctores" rows
   (old → new, +gain, band-up, fatigue chip, quiet fighters folded), no separate growth letter · 6 Training Yard cards never overflow (Bond, 1024 / 390)
   · 7 the Armory is its own rail tab, only fit fighters are equipped, a hurt fighter's gear goes to the shelf + checklist re-equip · 8 at most three
   starters, one bout each, Match Week filled from them, swapping, migration '0.95', weekly perk · 9 trophy case: locked until earned, own border colours
   · 10 phone 390: no sideways scroll · 11 no new entries in the 00c error log. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e.message)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const W=ms=>pg.waitForTimeout(ms);const SHOT=process.env.SHOT||'';
const mark=await pg.evaluate(()=>ERR92.n);
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));let sd=95;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};window.__seed=s=>{sd=s};if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;me().coin=3000;MGR.tab='ludus';MGR_REDRAW();await W8(400)});
/* ---- 8a · starters: three slots, one bout each, the week is filled from them ---- */
const r8=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};const R=rosterOf(m);
  o.n=R.length;o.starters=R.filter(g=>g.slot95).length;o.slots=R.filter(g=>g.slot95).map(g=>g.slot95).sort().join('');o.flag=R.every(g=>!!g.bench===!g.slot95);
  o.filled=R.filter(g=>g.slot95).every(g=>w.night.bouts[g.slot95-1].ents.includes(g.id));o.sbye=sbyeOK76(w)[0]===true&&(w.night.auto95||[]).length===3;
  MGR.tab='roster';MGR_REDRAW();await W8(500);o.chart=document.querySelectorAll('.depth .st95slot').length===3&&!document.querySelector('.depth .dcol84');
  o.rows=document.querySelectorAll('.st95list tr[data-mg="lsel"]').length===R.length;o.promo=document.querySelectorAll('.st95list [data-st95="promo"]').length;
  /* four more fit fighters: a fourth cannot start */
  for(let i=0;i<3;i++){const g=genGlad({ovr:60+i});g.contract={mgr:m.id,wage:5,weeks:8,since:1};w.glads.push(g)}MGR_REDRAW();await W8(400);
  const nb=document.querySelector('.st95list [data-st95="promo"]:not([aria-disabled="true"])');o.fourthDisabled=!nb&&document.querySelectorAll('.st95list [data-st95="promo"][aria-disabled="true"]').length>=1;
  const extra=rosterOf(m).find(g=>!g.slot95);const bt=document.querySelector(`.st95list [data-st95="promo"][data-id="${extra.id}"]`);bt.click();await W8(300);o.stillThree=rosterOf(m).filter(g=>g.slot95).length===3;
  /* bench one, promote the extra: lands in the freed slot and is put on that bout's card */
  const s1=rosterOf(m).find(g=>g.slot95===2);const freed=s1.slot95;document.querySelector(`.st95list [data-st95="bench"][data-id="${s1.id}"]`).click();await W8(300);o.benched=!s1.slot95&&s1.bench===true;
  document.querySelector(`.st95list [data-st95="promo"][data-id="${extra.id}"]`).click();await W8(300);o.promoted=extra.slot95>0&&!extra.bench;o.onCard=w.night.bouts[extra.slot95-1].ents.includes(extra.id);
  /* the slot select swaps: choose s1 for the extra's slot */
  const sl=document.querySelector(`select[data-st95slot="${extra.slot95}"]`);o.hasSel=!!sl;sl.value=s1.id;sl.dispatchEvent(new Event('change',{bubbles:true}));await W8(400);
  o.swapped=s1.slot95>0&&!extra.slot95&&w.night.bouts[s1.slot95-1].ents.includes(s1.id)&&!w.night.bouts.some(b=>b.ents.includes(extra.id)&&b!==w.night.bouts[s1.slot95-1]&&false);
  /* Match Week lets the manager put any fit fighter in (no starters-only filter) */
  /* Match Week: vacate the undercard, a benched fighter can be entered (no starters-only filter) */
  const ben=genGlad({ovr:50});ben.contract={mgr:m.id,wage:5,weeks:8,since:1};w.glads.push(ben);st95Ensure(w,m);const b0=w.night.bouts[0];const mine=b0.ents.map(gById).find(x=>x&&x.contract&&x.contract.mgr===m.id);if(mine)st95Out(b0,mine.id);
  MGR.tab='night';MGR_REDRAW();await W8(500);o.mwPicker=!!document.querySelector(`#ent0 option[value="${ben.id}"]`);
  return o});
ok(r8.starters===3&&r8.slots==='123'&&r8.flag,'8 three starters, one per bout, g.bench follows '+JSON.stringify(r8));ok(r8.filled,'8 Match Week is filled from the starters');ok(r8.sbye,'8 an auto-filled card does not block sitting a week out');
ok(r8.chart&&r8.rows&&r8.promo>=1,'8 slots + list rows with Promote, no depth columns');ok(r8.fourthDisabled&&r8.stillThree,'8 a fourth starter is refused');
ok(r8.benched&&r8.promoted&&r8.onCard,'8 bench / promote into the freed slot, put on its bout');ok(r8.hasSel&&r8.swapped,'8 the slot select swaps starters');ok(r8.mwPicker,'8 Match Week picker lists fit fighters');
if(SHOT){await pg.evaluate(()=>{MGR.tab='roster';MGR_REDRAW()});await W(500);await pg.screenshot({path:SHOT+'/tv95c_roster.png'})}
/* ---- 8b · migration + weekly perk ---- */
const r8b=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};
  const old=JSON.parse(JSON.stringify(w));old.ver='0.94';delete old.st95;for(const g of old.glads){delete g.slot95;g.bench=false}
  const pool=old.glads.filter(g=>g.alive&&g.contract&&g.contract.mgr===m.id).sort((a,b)=>effOvr(b)-effOvr(a));pool[pool.length-1].bench=true;pool[pool.length-2].bench=true;
  migrateWorld(old);const mw=mgrMigrate(old);const st=mw.glads.filter(g=>g.slot95);o.n=st.length;o.top=st.every(g=>pool.slice(0,3).some(p=>p.id===g.id));o.dirty=!!mw._st95dirty;
  const j0=JSON.stringify(mw.glads.map(g=>g.slot95||0));delete mw._st95dirty;migrateWorld(mw);const mw2=mgrMigrate(mw);o.idem=!mw2._st95dirty&&JSON.stringify(mw2.glads.map(g=>g.slot95||0))===j0;o.save=SAVE_MIGRATIONS.some(x=>x[0]==='0.95');
  return o});
ok(r8b.n===3&&r8b.top&&r8b.dirty,'8 migration: the first three of the old chart start '+JSON.stringify(r8b));ok(r8b.idem&&r8b.save,'8 migration idempotent, in SAVE_MIGRATIONS');
const r8c=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  /* the perk: the same week twice from one snapshot, perk off then on */
  const base=JSON.stringify(W_());const run=async(perk)=>{MGR.world=mgrMigrate(JSON.parse(base));const w=W_(),m=me();const R=rosterOf(m);for(const g of R){delete g.inj;g.morale=50;g.loyB=3}
    const S=R.filter(g=>g.slot95).map(g=>g.id);const B=R.filter(g=>!g.slot95&&wants88(g).includes('arena')).map(g=>g.id);
    for(const x of w.night.bouts){x.done=true;x.res=x.res||{att:0,winners:[],rows:[],turns:1,lines:[],reason:''}}w.pend=[];
    const P=ST95.perk;const keep={...P};if(!perk)ST95.perk={morale:0,loy:0,benchMorale:0};__seed(777);const ok2=await endWeek();ST95.perk=keep;
    const mine=id=>{const g=gById(id);return !!(g&&g.alive&&g.contract&&g.contract.mgr===m.id)};const SM={};for(const id of S)if(mine(id))SM[id]=[gById(id).morale,gById(id).loyB];const BM={};for(const id of B)if(mine(id))BM[id]=gById(id).morale;return {ok:ok2,S:SM,B:BM,nS:S.length,nB:B.length}};
  const a=await run(false),b=await run(true);o.a=a;o.b=b;
  const ids=Object.keys(b.S).filter(id=>a.S[id]);o.starters=ids.length>0&&ids.every(id=>b.S[id][0]-a.S[id][0]===2&&b.S[id][1]-a.S[id][1]===1);const bi=Object.keys(b.B).filter(id=>a.B[id]!=null);o.bench=bi.every(id=>a.B[id]-b.B[id]===1);o.nB=bi.length;return o});
ok(r8c.starters,'8 a starter gains +2 morale +1 loyalty a week '+JSON.stringify(r8c));ok(r8c.bench,'8 a benched arena-time fighter loses 1 morale '+JSON.stringify(r8c));
/* reload a clean world for the rest */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;me().coin=3000;MGR.tab='ludus';MGR_REDRAW();await W8(400)});
/* ---- 1 · trade offers ---- */
const r1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};const R=rosterOf(m);const rv=w.mgrs.find(x=>!x.isPlayer&&rosterOf(x).length>=2);const T=rosterOf(rv);
  const mk=()=>({id:'o'+Math.random().toString(36).slice(2,6),kind:'swap',mid:rv.id,gid:R[0].id,give:[T[0].id],coin:0,until:w.week+2});
  const o1=mk();w.offers=[o1];offersHTML();o.live=w.offers.length===1;
  T[0].alive=false;T[0].contract=null;offersHTML();o.shownGone=w.offers.length===0;
  const o2=mk();o2.give=[T[1].id];w.offers=[o2];T[1].contract.mgr=m.id;offerAccept(o2);o.refusedLeft=gById(R[0].id).contract.mgr===m.id&&OFFER_FAIL95==='This offer is no longer on the table.';T[1].contract.mgr=rv.id;
  const o3=mk();o3.give=[T[1].id];w.offers=[o3];const c0=gById(R[0].id).contract.mgr;T[1].alive=false;const acc=offerAccept(o3);o.deadAccept=acc===false&&gById(R[0].id).contract.mgr===c0;T[1].alive=true;
  const o4=mk();o4.give=[T[1].id];w.offers=[o4];T[1].alive=false;offersWeek(w,m);o.weekStart=!w.offers.some(x=>x.id===o4.id);T[1].alive=true;
  const o5=mk();o5.give=[T[1].id];w.offers=[o5];const A5=offerAccept(o5);o.good=A5===true&&gById(R[0].id).contract.mgr===rv.id&&T[1].contract.mgr===m.id;
  return o});
ok(r1.live&&r1.shownGone,'1 an offer whose fighter is gone is withdrawn when shown '+JSON.stringify(r1));ok(r1.refusedLeft&&r1.deadAccept,'1 Accept refuses and never hands ours over '+JSON.stringify(r1));ok(r1.weekStart,'1 withdrawn at week start');ok(r1.good,'1 a live swap still works');
/* ---- 2 · an invitational week ends like every week ---- */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;me().coin=3000;MGR_REDRAW();await W8(300)});
const r2=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};const ros=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));
  for(let i=0;i<w.night.bouts.length;i++)await runBoutSim(i);w.invites=[{id:'ivT',sid:'colossus',n:'The Colossus Invitational',wk:w.week+1,status:'accepted',ents:ros.slice(0,2).map(g=>g.id),sent:w.week}];
  w.pend=[];o.ok=await endWeek();o.sp=!!W_().special;MGR.tab='night';MGR_REDRAW();await W8(300);
  while(W_().special&&!W_().special.champ)await specRunNext();MGR_REDRAW();await W8(400);const cl=document.querySelector('[data-mg="sp_close"]');o.btn=!!cl;
  for(let i=0;i<W_().night.bouts.length;i++)if(!W_().night.bouts[i].done)await runBoutSim(i);W_().pend=[];const wk0=W_().week;MGR_REDRAW();await W8(300);
  const cl2=document.querySelector('[data-mg="sp_close"]');if(cl2)cl2.click();for(let i=0;i<80&&W_().week===wk0;i++)await W8(250);await W8(300);o.wk=[wk0,W_().week];o.tab=MGR.tab;o.closed=!W_().special;return o});
ok(r2.ok&&r2.sp&&r2.btn,'2 an invitational opens '+JSON.stringify(r2));ok(r2.closed&&r2.wk[1]===r2.wk[0]+1&&(r2.tab==='paper'||r2.tab==='awards'),'2 closing it ends the week and shows the Acta '+JSON.stringify(r2));
/* ---- 3 + 4 · signing portrait, tablets ---- */
const r34=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};const fa=freeAgents().slice(0,4);fa.forEach(g=>g.favd=true);MGR.tab='recruit';MGR.sel=fa[0].id;MGR_REDRAW();await W8(600);
  const t=[...document.querySelectorAll('.pipeline .pcard.pt85')];o.n=t.length;o.btns=document.querySelectorAll('.pipeline .pcard button').length;o.cap=t.every(x=>!!x.querySelector('.nx95'));
  t[2].click();await W8(300);o.sel=MGR.sel===t[2].dataset.id;o.cardFav=!!document.querySelector('#mgrBody .mgrid [data-mg="fav"]');o.cardActs=!!document.querySelector('#mgrBody .mgrid [data-mg="scout"],#mgrBody .mgrid [data-mg="pitch"],#mgrBody .mgrid [data-mg="gift2"],#mgrBody .mgrid [data-rec98a],#mgrBody .mgrid [data-rec98p]'); /* v0.98: the recruiter's actions */
  signCard73(fa[3]);await W8(200);o.face=!!document.querySelector('#signCard .sgface .portrait');o.faceW=Math.round((document.querySelector('#signCard .sgface .portrait')||{getBoundingClientRect:()=>({width:0})}).getBoundingClientRect().width);
  const sc=document.getElementById('signCard');if(sc)sc.remove();return o});
ok(r34.n>=3&&r34.btns===0&&r34.cap,'4 tablets have no buttons, a caption instead '+JSON.stringify(r34));ok(r34.sel&&r34.cardFav&&r34.cardActs,'4 a click selects, the card has the actions');ok(r34.face&&r34.faceW>=60,'3 the signing card shows his portrait '+JSON.stringify(r34));
/* ---- 5 · Week N in review ---- */
const r5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};const R=rosterOf(m);
  for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i);
  const A=R[0];const st=gStats(A);st.str=75;(A.sxp=A.sxp||{}).str=.9;statGain(A,'str',1);statGain(R[1],'spd',1.5);
  w.pend=[];const ok0=await endWeek();o.ok=ok0;MGR.tab='ludus';MGR_REDRAW();await W8(600);const d=document.querySelector('details.rev91');if(d)d.open=true;await W8(200);
  o.sec=!!document.querySelector('.rev91 .gr95');o.rows=document.querySelectorAll('.rev91 .gr95r').length;o.arrow=/→/.test((document.querySelector('.rev91 .gr95c')||{}).textContent||'');o.gain=!!document.querySelector('.rev91 .gr95c em');
  o.band=!!document.querySelector('.rev91 .gr95c.band')&&/76/.test((document.querySelector('.rev91 .gr95b')||{}).textContent||'');o.fat=!!document.querySelector('.rev91 .gr95r .fb90');
  o.noLetter=![...document.querySelectorAll('#mailBox summary b')].some(x=>/grew this week/.test(x.textContent))&&!(W_().letters||[]).some(l=>/^grow-/.test(l.key));
  /* quiet fighters fold into one line */
  const w2=W_();w2.sgain={[R[0].id]:{spd:1}};w2.sup95={};growSnap95(w2);const h=growHTML95(w2);o.quiet=/No change:/.test(h)&&(h.match(/class="gr95r"/g)||[]).length===1;
  return o});
ok(r5.ok&&r5.sec&&r5.rows>=1,'5 "From your Doctores" in the review '+JSON.stringify(r5));ok(r5.arrow&&r5.gain&&r5.fat,'5 old → new, +gain, fatigue chip');ok(r5.band,'5 a band-up is highlighted with what it gives');ok(r5.noLetter,'5 no separate growth letter');ok(r5.quiet,'5 quiet fighters folded into one line');
if(SHOT){await pg.evaluate(()=>document.querySelector('.rev91').scrollIntoView());await W(200);await pg.screenshot({path:SHOT+'/tv95c_review.png'})}
/* ---- 6 · Training Yard cards never overflow ---- */
const bondCheck=async()=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const m=me();const R=rosterOf(m);for(const x of R.slice(1))x.inj={until:99,label:'x',pen:1};MGR.tab='practice';MGR.tr92=R[0].id;MGR.yb76={gid:R[0].id,k:'bond'};MGR_REDRAW();for(let i=0;i<100&&!document.querySelector('.y92c .yd76p');i++)await W8(150);await W8(300);
  const bad=[];document.querySelectorAll('.y92c').forEach(c=>{const r=c.getBoundingClientRect();c.querySelectorAll('*').forEach(e=>{const q=e.getBoundingClientRect();if(q.width>0&&!e.closest('.portrait')&&(q.right>r.right+2||q.left<r.left-2))bad.push((e.className||e.tagName)+'')})});
  const c0=document.querySelector('.y92c');for(const x of R.slice(1))delete x.inj;return {bad:bad.slice(0,4),scroll:c0.scrollWidth-c0.clientWidth,panel:!!document.querySelector('.y92c .yd76p')}});
await pg.setViewportSize({width:1024,height:900});await W(500);const b1=await bondCheck();ok(b1.bad.length===0&&b1.scroll<=1&&b1.panel,'6 Bond card inside its box at 1024 '+JSON.stringify(b1));
if(SHOT){await pg.evaluate(()=>document.querySelector('.y92c:has(.yd76p)').scrollIntoView());await W(200);await pg.screenshot({path:SHOT+'/tv95c_bond1024.png'})}
await pg.setViewportSize({width:390,height:844});await W(500);const b2=await bondCheck();ok(b2.bad.length===0&&b2.scroll<=1,'6 Bond card inside its box at 390 '+JSON.stringify(b2));
await pg.setViewportSize({width:1440,height:900});await W(300);
/* ---- 7 · the Armory tab, hurt fighters ---- */
const r7=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};const R=rosterOf(m);for(const g of R){delete g.inj;if(g.re95)re95Do(g)}
  MGR_REDRAW();await W8(300);o.tab=!!document.querySelector('.mtabs [data-id="armory"]');MGR.tab='roster';MGR_REDRAW();await W8(400);o.notInRoster=!document.querySelector('#ar94');
  MGR.tab='armory';MGR_REDRAW();await W8(500);o.inTab=!!document.querySelector('#mgrPane #ar94');
  let h=R.find(g=>g.eq94&&(g.eq94.R||g.eq94.a.length));if(!h){h=R[0];arm94EnsureG(w,h);for(const P of arm94H(m).sh.slice(0,3))arm94Put(m,P.id,{g:h.id,z:'auto'})}const n0=[h.eq94.R,h.eq94.L,...h.eq94.a,...h.eq94.o].filter(Boolean).length;const sh0=arm94H(m).sh.length;
  h.inj={until:w.week+3,label:'a cracked rib',pen:3};MGR_REDRAW();await W8(400);
  o.stripped=[h.eq94.R,h.eq94.L,...h.eq94.a,...h.eq94.o].filter(Boolean).length===0&&arm94H(m).sh.length===sh0+n0&&(h.re95||[]).length===n0;
  const P=arm94H(m).sh[0];const r=arm94Put(m,P.id,{g:h.id,z:'auto'});o.refused=!!r.no&&/hurt/.test(r.no);
  MGR.ar94=h.id;arm94Redraw();await W8(300);o.warn=!!document.querySelector('#ar94 .ar94warn');
  delete h.inj;MGR.tab='ludus';MGR_REDRAW();await W8(500);const it=[...document.querySelectorAll('#desk99 .dk99row .tx')].find(x=>/healed/.test(x.textContent));o.todo=!!it&&it.textContent.includes(h.name);
  const bt=document.querySelector(`[data-re95="${h.id}"]`);o.btn=!!bt;if(bt)bt.click();await W8(400);o.back=[h.eq94.R,h.eq94.L,...h.eq94.a,...h.eq94.o].filter(Boolean).length===n0&&!h.re95;o.dbg=[n0,[h.eq94.R,h.eq94.L,...h.eq94.a,...h.eq94.o].filter(Boolean).length,h.re95,h.eq94.h,m.id,!!h.inj];
  o.todoGone=![...document.querySelectorAll('#desk99 .dk99row .tx')].some(x=>/healed/.test(x.textContent)&&x.textContent.includes(h.name));return o});
ok(r7.tab&&r7.notInRoster&&r7.inTab,'7 the Armory is its own tab, not in the Roster '+JSON.stringify(r7));ok(r7.stripped,'7 a hurt fighter\'s gear goes to the shelf at once '+JSON.stringify(r7));ok(r7.refused&&r7.warn,'7 only fit fighters can be equipped');
ok(r7.todo&&r7.btn&&r7.back&&r7.todoGone,'7 checklist: equip him again after healing (Re-equip) '+JSON.stringify(r7));
if(SHOT){await pg.evaluate(async()=>{MGR.tab='armory';MGR_REDRAW();await new Promise(r=>setTimeout(r,400))});await pg.screenshot({path:SHOT+'/tv95c_armory.png'})}
/* ---- 9 · the trophy case ---- */
const r9=await pg.evaluate(async()=>{const o={};let h=await hallTrophiesHTML();const t=document.createElement('template');t.innerHTML=h;const L=[...t.content.querySelectorAll('.trlist .trli.tb95')];o.n=L.length;o.lib=TROPHY_LIB.length;o.locked=L.filter(x=>x.classList.contains('lock95')).length;
  o.cols=new Set(L.map(x=>x.style.getPropertyValue('--tb'))).size;await hallTrophy('aureus',{who:'Test',why:'test'});h=await hallTrophiesHTML();t.innerHTML=h;const L2=[...t.content.querySelectorAll('.trlist .trli.tb95')];
  const au=L2.find(x=>/Aureus/.test(x.textContent));o.earned=!!au&&au.classList.contains('earned95')&&!au.classList.contains('lock95');o.locked2=L2.filter(x=>x.classList.contains('lock95')).length;
  for(const x of await Store.list('hallTrophies'))await Store.del('hallTrophies',x.id).catch(()=>{});return o});
ok(r9.n===r9.lib&&r9.locked===r9.lib,'9 every built-in trophy starts locked '+JSON.stringify(r9));ok(r9.cols>=r9.lib-2,'9 each trophy card has its own border colour '+JSON.stringify(r9));ok(r9.earned&&r9.locked2===r9.lib-1,'9 earning one unlocks it '+JSON.stringify(r9));
/* ---- 10 · phone 390 ---- */
await pg.setViewportSize({width:390,height:844});await W(500);
const r10=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};for(const t of ['roster','armory','ludus','recruit']){MGR.tab=t;MGR_REDRAW();await W8(500);o[t]=document.documentElement.scrollWidth-innerWidth}return o});
ok(Object.values(r10).every(x=>x<=1),'10 no sideways scroll at 390 '+JSON.stringify(r10));
if(SHOT){await pg.evaluate(async()=>{MGR.tab='roster';MGR_REDRAW();await new Promise(r=>setTimeout(r,400))});await pg.screenshot({path:SHOT+'/tv95c_roster390.png'})}
/* ---- 11 · errors ---- */
const errNew=await pg.evaluate(m=>ERR92.n-m,mark);ok(errNew===0&&errs.length===0,'11 no new errors in the 00c log '+errNew+' '+errs.slice(0,3).join(' | '));
console.log(miss.length?'MISS '+JSON.stringify(miss,null,1):'ALL OK');console.log('ERRS',JSON.stringify(errs.slice(0,3)));await b.close();if(miss.length)process.exit(1)})();

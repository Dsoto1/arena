/* tv102j — v1.02 J INJURIES AND CARE TIMING (341-v102care): a LIGHT wound's Medicus is booked (paid, still hurt this week, "closes when the week ends",
   undone if the week does not turn, closed after endWeek); Asclepius books too; a SERIOUS wound is refused in its own week with the reason, booked the
   next week, closes at that week's end, recovery fatigue +15..+20 the week after, a rub-down takes it down; a rival house waits on a fresh serious wound
   and closes the others with the same recovery fatigue; the kill switch flavius_v102joff=1 = the old instant cure; no new 00c errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v102joff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    const ros=rosterOf(pm);for(const g of ros){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.contract.weeks=20;g.morale=80;g.ord87=null}
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('infirm');await W8(800);MGR.view=null;
    window.J_END=async()=>{const w=W_();for(const bo of w.night.bouts)bo.done=true;w.pend=[];w.special=null;const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let r;try{r=await endWeek()}catch(e){r='ERR '+e}clearInterval(hold);await W8(300);return r}});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const pg=await open(false);

/* ---- 1 · light wound: booked, still hurt this week, closed after endWeek; Asclepius the same ---- */
out.light=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};const pm=me(),w=W_();const ros=rosterOf(pm);const B=ros[1],C=ros[2];
  w.beds76=[];w.mh101=null;pm.fac=pm.fac||{};pm.fac.valet=1;
  B.inj={until:w.week+2,label:'a twisted ankle',pen:1};C.inj={until:w.week+2,label:'a split brow',pen:2};MGR.tab='infirm';MGR.inf90=B.id;MGR_REDRAW();await W8(600);
  r.stamped=B.inj.wk102===w.week;
  const md=q(`#mgrPane [data-mg="medic"][data-id="${B.id}"]`);r.tileTxt=!!md&&/closes when the week ends/.test(md.textContent)&&!md.dataset.dis;r.timeline=!!q('#mgrPane .rtimeline.j102t');
  const c0=pm.coin,h0=mh101Left(w,pm);if(md)md.click();await W8(500);
  r.booked=!!B.inj&&B.inj.bk102&&B.inj.bk102.k==='medic'&&B.inj.bk102.wk===w.week&&pm.coin===c0-care101Coin('medic')&&mh101Left(w,pm)===h0-2;
  r.stillHurt=!!B.inj&&/Booked/.test(care101Why(B,'medic'))&&fitWeekOf(B)===w.week+1;r.bkLine=/Booked/.test((q('#mgrPane .j102l')||{}).textContent||'');
  r.blocked=typeof r101Block==='function'?!!r101Block(B):true;
  /* Asclepius books too */
  MGR.inf90=C.id;MGR_REDRAW();await W8(400);const as=q(`#mgrPane [data-mg="asclepius"][data-id="${C.id}"]`);if(as)as.click();await W8(400);r.asBooked=!!C.inj&&C.inj.bk102&&C.inj.bk102.k==='asclepius';
  /* the week does not turn → nothing resolves */
  const wk0=w.week;w.night.bouts[0].done=false;let e0;try{e0=await endWeek()}catch(e){e0='ERR '+e}r.noTurn=e0===false&&W_().week===wk0&&!!B.inj&&!!B.inj.bk102;
  const f0=B.fat;const e1=await J_END();r.turned=W_().week===wk0+1;r.healed=!B.inj&&!C.inj;r.noRec=!B.rf102;r.e1=String(e1);
  return r});
for(const k of ['stamped','tileTxt','timeline','booked','stillHurt','bkLine','blocked','asBooked','noTurn','turned','healed','noRec'])ok(out.light[k],'light '+k);

/* ---- 2 · serious wound: rest only in its week, booked the next, closes, recovery fatigue, a rub-down takes it down ---- */
out.ser=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};const pm=me(),w=W_();const A=rosterOf(pm)[0];
  w.mh101=null;A.inj={until:w.week+4,label:'a gashed chest',pen:5};A.fat=10;MGR.tab='infirm';MGR.inf90=A.id;MGR_REDRAW();await W8(600);
  const bed=q(`#mgrPane [data-bed76="${A.id}"]`);if(bed)bed.click();await W8(500);r.bed=inBed76(A);
  r.fresh=A.inj.wk102===w.week&&/rest only/.test((q('#mgrPane .j102l')||{}).textContent||'');
  const md=q(`#mgrPane [data-mg="medic"][data-id="${A.id}"]`)||q(`#mgrPane [data-plan87="medic"][data-id87="${A.id}"]`);
  r.why=care101Why(A,'medic');r.refused=/rest only/.test(r.why)&&/rest only/.test(care101Why(A,'asclepius'))&&/rest only/.test(care101Why(A,'bath'));
  const c0=pm.coin;const dm=q(`#mgrPane [data-mg="medic"][data-id="${A.id}"]`);if(dm)dm.click();await W8(400);r.notPaid=pm.coin===c0&&!A.inj.bk102;
  r.tileRest=!dm||/rest only/.test(dm.dataset.dis||'');
  /* next week: booked */
  const wk0=w.week;await J_END();r.turned1=W_().week===wk0+1&&!!A.inj;A.ord87=null;
  /* a bed plan at the turn may already have booked it (151's repeating plan) — else book now */
  if(!A.inj.bk102){MGR.inf90=A.id;MGR_REDRAW();await W8(500);const d2=q(`#mgrPane [data-mg="medic"][data-id="${A.id}"]`);r.d2dis=d2?d2.dataset.dis||'':'none';if(d2)d2.click();else{const x=care101Do(A,'medic');r.d2msg=x.msg}await W8(400)}
  r.booked=!!A.inj&&!!A.inj.bk102&&A.inj.bk102.wk===W_().week;
  const f1=A.fat;await J_END();const w2=W_();r.turned2=w2.week===wk0+2;r.closed=!A.inj;r.rec=!!A.rf102&&A.rf102.wk===w2.week&&A.rf102.n>=15&&A.rf102.n<=20;r.fat=A.fat;r.f1=f1;
  /* the rub-down (Training Yard Recovery) takes it down */
  const fb=A.fat;const bt=document.createElement('button');bt.dataset.bath=A.id;document.body.appendChild(bt);bt.click();bt.remove();await W8(300);r.bath=A.fat===Math.max(0,fb-10)&&fb>0;
  return r});
for(const k of ['bed','fresh','refused','notPaid','tileRest','turned1','booked','turned2','closed','rec','bath'])ok(out.ser[k],'serious '+k);

/* ---- 3 · a rival house follows the same rules ---- */
out.riv=await ev(pg,async()=>{const r={};const w=W_();const R=w.mgrs.find(x=>!x.isPlayer&&rosterOf(x).length>=2);const [G,G2]=rosterOf(R);for(const g of rosterOf(R))g.inj=null;
  R.coin=900;R.mh101=null;R.fac=R.fac||{};R.fac.valet=1;R.p.honor=95;
  G.inj={until:w.week+4,label:'a gashed chest',pen:5,wk102:w.week};G2.inj={until:w.week+2,label:'a twisted ankle',pen:1,wk102:w.week};
  r.wait=care102CpuWait(G)&&!care102CpuWait(G2);
  const R0=Math.random;Math.random=()=>0.01;J102.pend=[];try{aiLanistaWeek()}catch(e){r.err=String(e)}finally{Math.random=R0}
  r.firstWeek=!!G.inj&&!G2.inj;
  G.inj.wk102=w.week-1;R.mh101=null;R.coin=900;J102.pend=[];Math.random=()=>0.01;try{aiLanistaWeek()}catch(e){r.err=String(e)}finally{Math.random=R0}
  const p=J102.pend.find(x=>x[0]===G);r.nextWeek=!G.inj&&!!p&&p[1]>=15&&p[1]<=20;J102.pend=[];
  return r});
for(const k of ['wait','firstWeek','nextWeek'])ok(out.riv[k],'rival '+k+(out.riv.err?' '+out.riv.err:''));
out.errs=await ev(pg,()=>typeof ERR92!=='undefined'?errNew92(RM_MARK).map(e=>e.kind+':'+e.msg).slice(0,5):[]).catch(()=>[]);
await pg.close();

/* ---- 4 · kill switch: the old instant cure ---- */
const p2=await open(true);
out.off=await ev(p2,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const pm=me(),w=W_();const B=rosterOf(pm)[1];w.mh101=null;B.inj={until:w.week+2,label:'a twisted ankle',pen:1};
  const r=care101Do(B,'medic');return {ok:r.ok,cleared:!B.inj,noFn:typeof J102!=='undefined'&&!J102.on}});
ok(out.off.ok&&out.off.cleared&&out.off.noFn,'kill switch');
await p2.close();
console.log(JSON.stringify(out));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.concat(out.errs||[])));await b.close();process.exit(miss.length||errs.length||(out.errs||[]).length?1:0)})();

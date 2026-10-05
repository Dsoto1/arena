/* v0.87 Infirmary beds (151-v87ward): the bed bug (a light Medicus-grade wound could not take the empty bed), 🛏 Put in bed on the
   bench, the empty bed offers the bench, the occupied bed shows the patient + Take out, the chosen plan repeats every week, beds full */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const SEED=+(process.env.SEED87||87);
const o=await pg.evaluate(async(SEED)=>{let sd=SEED>>>0;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296}; /* the world's own dice are seeded so a stray death or walk-out never decides the test */
  const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
  const w=W_(),m=me();m.coin=2000;const ros=rosterOf(m);const r={};const q=s=>document.querySelector(s);const go=async()=>{MGR.tab='infirm';MGR_REDRAW();await W8(400)};
  const mine=new Set(ros.map(g=>g.id));for(const bo of w.night.bouts)bo.ents=bo.ents.filter(id=>!mine.has(id));
  const A=ros[1],B=ros[2];for(const g of ros){g.age=24;g.morale=90;g.contract.weeks=20;g.faith='pagan'} /* young, content, signed, pagan: no old-age farewells, walk-outs or edicts */
  /* 1 · the bug: a torn shoulder at −3 (Medicus-grade, not serious) and one empty bed */
  A.inj={until:w.week+2,label:'a torn shoulder',pen:3};await go();
  r.light=!serious76(A)&&bedsOf76(m)===1;
  r.putBtn=!!q(`.wd76bench [data-bed76="${A.id}"]`);r.rule=!!q('.rule87');
  const cot=q('[data-bedpick87]');r.emptyBtn=!!cot;if(cot)cot.click();await W8(300);
  const pick=q(`.bp87bg [data-bp87="${A.id}"]`);r.offer=!!pick;if(pick)pick.click();await W8(400);
  r.inBed=inBed76(A);bedsClean76(w);r.stays=inBed76(A); /* bedsClean76 used to throw light wounds out */
  r.cot=!!q(`.wd76cot [data-unbed76="${A.id}"]`)&&!!q('.wd76cot .wd76av svg')&&!!q('.wd76cot .tr87');
  /* 2 · take out, then put back with the bench button */
  q(`[data-unbed76="${A.id}"]`).click();await W8(400);r.out=!inBed76(A)&&!!q(`.wd76bench [data-bed76="${A.id}"]`);
  q(`.wd76bench [data-bed76="${A.id}"]`).click();await W8(400);r.back=inBed76(A);
  /* 3 · the plan: Bathhouse, then it runs again next week without a tap */
  const bt=q(`.wd76cot [data-plan87="bath"]`);r.bathTile=!!bt;const c0=m.coin;if(bt)bt.click();await W8(400);
  r.plan=A.inj&&A.inj.plan87==='bath'&&A.bathWk===w.week&&m.coin===c0-5&&!!q('.wd76cot .plantile.pick87[data-plan87="bath"]');
  A.inj.until=w.week+4;const u0=A.inj.until,wk0=w.week;for(const bo of w.night.bouts)bo.done=true;w.pend=[];await endWeek();await W8(800);
  const w2=W_();r.newWeek=w2.week===wk0+1;r.again=A.bathWk===w2.week&&!!A.inj&&A.inj.plan87==='bath'&&A.inj.until<u0&&inBed76(A);if(!r.again)r.dbgA=JSON.stringify({bw:A.bathWk,wk:w2.week,inj:A.inj,u0,bed:inBed76(A),beds:w2.beds76,al:A.alive,c:!!A.contract,news:(w2.news||[]).slice(0,40).filter(n=>n.text.includes(A.name)).map(n=>n.text).join(' | ').slice(0,1500)});
  /* Rest is pickable in bed */
  await go();const rt=q(`.wd76cot [data-plan87="rest"]`);if(rt)rt.click();await W8(300);r.rest=A.inj&&A.inj.plan87==='rest';
  /* 4 · beds full */
  B.inj={until:w2.week+2,label:'a deep thigh cut',pen:2};await go();
  r.full=!!q(`.wd76bench [data-bed76="${B.id}"][disabled]`)&&!!q('.full87 [data-mg="build"][data-id="valet"]');
  m.fac=m.fac||{};m.fac.valet=1;await go();r.more=bedsOf76(m)===2&&!!q(`.wd76bench [data-bed76="${B.id}"]:not([disabled])`)&&!q('.full87');
  /* 5 · three limbs lost: one week at home to regrow one, else he retires */
  delete A.inj;delete B.inj;w2.beds76=[];const C=ros[3],D=ros[4],E=ros[5]||ros[0];C.severed=['rarm','larm','rleg'];D.severed=['rarm','lleg','rleg'];E.severed=['larm','lleg','rleg'];
  /* a CPU house's fighter with three lost limbs and an empty purse: unchanged — he retires at the first week's end */
  const cm=w2.mgrs.find(x=>!x.isPlayer&&rosterOf(x).length);const K=rosterOf(cm)[0];K.faith='pagan';K.age=24;cm.coin=rosterOf(cm).reduce((t,g)=>t+g.contract.wage,0)+40; /* wages paid, still too poor for Hygeia */K.severed=['rarm','larm','rleg'];
  const wkEnd=async()=>{const w=W_();for(const bo of w.night.bouts)bo.done=true;w.pend=[];await endWeek();await W8(700)};
  await wkEnd();const w3=W_();r.dbg=JSON.stringify({wk:w3.week,C:[C.alive,!!C.contract,C.maim87,C.severed],D:[D.alive,D.maim87]});r.reprieve=C.alive!==false&&D.alive!==false&&!!C.contract&&C.maim87&&C.maim87.wk===w3.week&&D.maim87&&D.maim87.wk===w3.week;
  r.cpuSame=K.alive===false&&K.retired===true&&!K.maim87;if(!r.cpuSame)r.dbgK=JSON.stringify({a:K.alive,ret:K.retired,sev:K.severed,c:K.contract,coin:cm.coin,news:(w3.news||[]).slice(0,60).filter(n=>n.text.includes(K.name)).map(n=>n.text)});
  await go();r.maimLine=!!q('.wd76bench .maim87')&&weekChecklist().some(x=>x.ic==='🦿'&&!x.done)&&leaveList76(w3).some(x=>/🦿/.test(x));
  r.careLine=/maim87/.test(careHTML(C))&&/this week/.test(maimLine87(C));
  /* a bed for E too (a second bed), and he regrows only ONE limb: two lost limbs are enough to stay */
  m.fac.valet=2;bedsClean76(w3);w3.beds76.push(E.id);await go();r.cotLine=!!q('.wd76cot .maim87');
  w3.repair=Math.max(0,repCap()-HYGEIA);const he=q(`.wd76cot [data-mg="heal"][data-id="${E.id}"]`);if(he)he.click();else r.dbgE=JSON.stringify({n:ros.length,beds:w3.beds76,E:E.id,inBed:inBed76(E),N:bedsOf76(m),sev:E.severed,al:E.alive});await W8(400);r.oneLimb=E.severed.length===2;w3.repair=0;await go();
  q(`.wd76bench [data-bed76="${C.id}"]`).click();await W8(400);const hb=q(`.wd76cot [data-mg="heal"][data-id="${C.id}"]`);r.hyBtn=!!hb&&!hb.disabled;if(hb)hb.click();await W8(400);
  r.regrown=C.severed.length<3;if(!r.regrown)r.dbg2=JSON.stringify({bed:inBed76(C),msg:MGR.msg,rep:W_().repair,busy:MGR.busy,cap:repCap(),coin:m.coin,hb:hb&&hb.outerHTML.slice(0,200)});
  await wkEnd();r.kept=C.alive!==false&&!!C.contract&&!C.maim87;r.retired=D.alive===false&&D.retired===true;r.keptE=E.alive!==false&&!!E.contract&&!E.maim87&&E.severed.length===2;r.noNag=!weekChecklist().some(x=>x.ic==='🦿');if(!r.kept)r.dbg3=JSON.stringify({wk:W_().week,a:C.alive,c:!!C.contract,m:C.maim87,s:C.severed,inj:C.inj});
  return r},SEED);
for(const [k,v] of Object.entries(o))if(!/^dbg/.test(k))ok(v,k);
await pg.setViewportSize({width:390,height:844});await pg.waitForTimeout(500);
o.phone=await pg.evaluate(()=>document.documentElement.scrollWidth<=392);ok(o.phone,'phone');
console.log(JSON.stringify(o));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

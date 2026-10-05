/* v0.87 Infirmary beds (151-v87ward): the bed bug (a light Medicus-grade wound could not take the empty bed), 🛏 Put in bed on the
   bench, the empty bed offers the bench, the occupied bed shows the patient + Take out, the chosen plan repeats every week, beds full */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const o=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
  const w=W_(),m=me();m.coin=2000;const ros=rosterOf(m);const r={};const q=s=>document.querySelector(s);const go=async()=>{MGR.tab='infirm';MGR_REDRAW();await W8(400)};
  const mine=new Set(ros.map(g=>g.id));for(const bo of w.night.bouts)bo.ents=bo.ents.filter(id=>!mine.has(id));
  const A=ros[1],B=ros[2];
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
  A.inj.until=w.week+4;const u0=A.inj.until,wk0=w.week;for(const bo of w.night.bouts)bo.done=true;w.pend=[];await endWeek();await W8(800);for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}
  const w2=W_();r.newWeek=w2.week===wk0+1;r.again=A.bathWk===w2.week&&!!A.inj&&A.inj.plan87==='bath'&&A.inj.until<u0&&inBed76(A);
  /* Rest is pickable in bed */
  await go();const rt=q(`.wd76cot [data-plan87="rest"]`);if(rt)rt.click();await W8(300);r.rest=A.inj&&A.inj.plan87==='rest';
  /* 4 · beds full */
  B.inj={until:w2.week+2,label:'a deep thigh cut',pen:2};await go();
  r.full=!!q(`.wd76bench [data-bed76="${B.id}"][disabled]`)&&!!q('.full87 [data-mg="build"][data-id="valet"]');
  m.fac=m.fac||{};m.fac.valet=1;await go();r.more=bedsOf76(m)===2&&!!q(`.wd76bench [data-bed76="${B.id}"]:not([disabled])`)&&!q('.full87');
  return r});
for(const [k,v] of Object.entries(o))ok(v,k);
await pg.setViewportSize({width:390,height:844});await pg.waitForTimeout(500);
o.phone=await pg.evaluate(()=>document.documentElement.scrollWidth<=392);ok(o.phone,'phone');
console.log(JSON.stringify(o));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

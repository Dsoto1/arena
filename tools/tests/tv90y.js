/* v0.90 A2 Training Yard + rail (184-v90yard): 1 every routine / drill / regime option previews the week's gain per stat
   (icon, value → new value with one decimal) and the preview matches what End the week really gives (within 0.05);
   4 the First/Normal/Last priority select is gone; 2+3 the open fighter's card sits beside the squad table with the
   Squad doctore and Study the card cards in that right column; 6 on the road for Match Week = 0 training hours and the
   yard says so; 5 a rail tab click keeps the same rail buttons (no re-created nodes, ovals stay); phone width without
   sideways scroll. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const setup=async(pg)=>{await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_v105yoff','1')/* v1.05 B44: 373-v105yard replaces this Yard (tv105k) */});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
  return pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=600;w.train='off';w.tplan=null;
    for(const g of rosterOf(m)){g.inj=null;g.fat=0;g.restWk=null;g.ptrain=false;g.contract.weeks=20;g.morale=80}
    MGR.tab='practice';MGR.yd87=null;MGR_REDRAW();await W8(600);return true})};
const pg=await b.newPage({viewport:{width:1440,height:900}});await setup(pg);
/* ---------- 1-4 · v0.92: the yard is the fighter cards of 213-v92yard (tv92y covers previews == the week); here: the 184
   routine select / squad table / priority are gone, the doctore + study the card sit in the Doctore panel, yd90Week (the
   shared growth maths) still matches the regime week ---------- */
const p=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();const ros=rosterOf(m);
  r.prio=document.querySelectorAll('#mgrBody [data-yp87], #mgrBody .yo87pr, #mgrBody [data-yr87], #mgrBody .yo87r').length;r.prioTxt=/▲ First|▼ Last/.test(document.getElementById('mgrBody').textContent);
  r.docSide=!!document.querySelector('.y92doc [data-tp="doc|1"]');r.studySide=!!document.querySelector('.y92doc [data-yj="study"]');r.cards=document.querySelectorAll('.y92c').length===ros.length;
  const d0=thPlan(w).doc;document.querySelector('.y92doc [data-tp="doc|1"]').click();await W8(300);r.doc=thPlan(w).doc-d0;document.querySelector('.y92doc [data-tp="doc|-1"]').click();await W8(200);
  const g=ros[0];w.train='hard';r.regPvOk=yd90Week(g,{regime:'hard'}).str[1]>yd90Week(g,{regime:'off'}).str[1];
  const K=['spd','str','int','cha'];const val=x=>{const s=gStats(x);return Object.fromEntries(K.map(k=>[k,s[k]+((x.sxp||{})[k]||0)]))};
  const pre=ros.map(x=>{const v=yd90Week(x);return Object.fromEntries(K.map(k=>[k,v[k][1]]))});
  for(const bt of (w.night&&w.night.bouts)||[])bt.done=true;w.pend=[];const wk=w.week;const MR=Math.random;const G96c=GROW96.chance;GROW96.chance=0;/* v0.97: the hashed 10% chance of +0.2 elsewhere would move a stat */Math.random=()=>0.97;try{await endWeek()}finally{Math.random=MR;GROW96.chance=G96c}await W8(400);r.adv=W_().week!==wk;
  r.diff=ros.map((x,i)=>{const a=val(x);return Math.max(...K.map(k=>Math.abs(a[k]-pre[i][k])))});w.train='off';MGR.tab='practice';MGR_REDRAW();await W8(300);
  return r});
ok(p.prio===0&&!p.prioTxt,'4 no routine select, squad rows or First/Normal/Last');ok(p.docSide&&p.studySide&&p.cards,'3 doctore + study in the Doctore panel, one card each');
ok(p.doc===1,'3 the doctore panel adds an hour');ok(p.regPvOk&&p.adv&&p.diff.every(d=>d<=0.05),'1 yd90Week matches the regime week '+JSON.stringify(p.diff));
/* ---------- 6 · the road ---------- */
const R=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_();w.tplan=null;r.home=thLeft(w);
  const n=w.night;const keep={bye:n.bye,selfBye:n.selfBye,travel:n.travel};n.bye=false;n.selfBye=false;n.travel={cost:6,paid:true,gone:true,offer:null,deal:null,from:'x'};
  r.locked=roadLocked76(w);r.left=thLeft(w);MGR_REDRAW();await W8(300);r.txt=/Away — no training this week/.test(document.getElementById('mgrBody').textContent);
  n.travel={cost:6,paid:true,gone:false,offer:null,deal:null,from:'x'};r.paidOnly=thLeft(w);
  Object.assign(n,keep);MGR_REDRAW();await W8(200);return r});
ok(R.home>0&&R.locked&&R.left===0&&R.txt,'6 on the road: 0 hours + "Away" '+JSON.stringify(R));ok(R.paidOnly===R.home,'6 the hours stay until the road is taken');
/* ---------- 5 · the rail keeps its buttons ---------- */
const T=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};MGR.tab='practice';MGR_REDRAW();await W8(1200);
  const q=k=>document.querySelector(`.mtabs [data-mg="tab"][data-id="${k}"]`);const b0={p:q('practice'),r:q('roster'),n:q('night'),rail:document.querySelector('.mtabs')};
  const ov0=document.querySelectorAll('.mtabs .mcount.c73:not([hidden]), .mtabs .mcount.c85n:not([hidden])').length;
  let removed=0;const mo=new MutationObserver(L=>{for(const x of L)for(const n of x.removedNodes)if(n.nodeType===1&&(n.matches('button')||n.querySelector&&n.querySelector('button')))removed++});
  mo.observe(b0.rail,{childList:true,subtree:true});
  q('roster').click();await Promise.resolve();await new Promise(x=>requestAnimationFrame(()=>x()));
  r.ovNow=document.querySelectorAll('.mtabs .mcount.c73:not([hidden]), .mtabs .mcount.c85n:not([hidden])').length;r.ov0=ov0;
  r.same=q('practice')===b0.p&&q('roster')===b0.r&&q('night')===b0.n&&document.querySelector('.mtabs')===b0.rail&&b0.p.isConnected;
  r.on=q('roster').classList.contains('on')&&!q('practice').classList.contains('on');r.tab=MGR.tab;
  q('night').click();await W8(100);q('practice').click();await W8(100);mo.disconnect();r.removed=removed;r.same2=q('practice')===b0.p;r.body=!!document.querySelector('.y92doc');
  r.swaps=RAIL90.swaps;return r});
ok(T.same&&T.same2&&T.removed===0,'5 rail buttons kept across tab clicks '+JSON.stringify(T));ok(T.on&&T.tab==='roster'&&T.body,'5 the tab still switches');
ok(T.ovNow>=T.ov0,'5 ovals stay up through the click '+T.ov0+'→'+T.ovNow);
/* ---------- phone ---------- */
const ph=await b.newPage({viewport:{width:390,height:844}});await setup(ph);
const P=await ph.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));MGR_REDRAW();await W8(500);
  const body=document.getElementById('mBody')||document.body;return {docX:document.documentElement.scrollWidth-innerWidth,bodyX:body.scrollWidth-body.clientWidth,card:!!document.querySelector('.y92c'),
    out:[...document.querySelectorAll('.y92c,.y92doc,.y92t')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length}});
ok(P.docX<=1&&P.bodyX<=1&&P.out===0&&P.card,'phone: no sideways scroll '+JSON.stringify(P));
if(SHOT){await ph.evaluate(()=>{const c=document.querySelector('.y92grid');c&&c.scrollIntoView({block:'start'})});await ph.waitForTimeout(300);await ph.screenshot({path:SHOT+'/tv90y_phone.png'})}
if(process.env.DBG)console.log(JSON.stringify({p,R,T,P}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

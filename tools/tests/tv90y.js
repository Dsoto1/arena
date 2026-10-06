/* v0.90 A2 Training Yard + rail (184-v90yard): 1 every routine / drill / regime option previews the week's gain per stat
   (icon, value → new value with one decimal) and the preview matches what End the week really gives (within 0.05);
   4 the First/Normal/Last priority select is gone; 2+3 the open fighter's card sits beside the squad table with the
   Squad doctore and Study the card cards in that right column; 6 on the road for Match Week = 0 training hours and the
   yard says so; 5 a rail tab click keeps the same rail buttons (no re-created nodes, ovals stay); phone width without
   sideways scroll. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const setup=async(pg)=>{await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
  return pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=600;w.train='off';w.tplan=null;
    for(const g of rosterOf(m)){g.inj=null;g.fat=0;g.restWk=null;g.ptrain=false;g.contract.weeks=20;g.morale=80}
    MGR.tab='practice';MGR.yd87=null;MGR_REDRAW();await W8(600);return true})};
const pg=await b.newPage({viewport:{width:1440,height:900}});await setup(pg);
/* ---------- 1 · previews ---------- */
const p=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();const ros=rosterOf(m);
  const inBout=new Set();for(const bt of w.night&&w.night.bouts||[])for(const id of bt.ents)inBout.add(id);
  const free=ros.filter(g=>!inBout.has(g.id));const pick=(free.length>=2?free:ros).slice(0,2);const [g,h]=pick;r.ids=[g.id,h.id];
  /* open g's card, pick Speed focus on its routine tiles */
  document.querySelector(`.yo87r[data-yo87row="${g.id}"] .yo87nm`).click();await W8(400);
  const tile=document.querySelector(`[data-yr90="${g.id}|spd"]`);r.tile=!!tile;r.tilePv=tile?tile.textContent:'';r.tiles=document.querySelectorAll(`[data-yr90^="${g.id}|"]`).length;
  tile&&tile.click();await W8(400);r.ord=g.ord87&&g.ord87.r;r.plan=JSON.stringify(thPlan(w).g[g.id]||{});
  /* h: all-round via the row's select (its options carry previews too) */
  const sel=document.querySelector(`[data-yr87="${h.id}"]`);r.optTxt=[...sel.options].map(o=>o.textContent);sel.value='bal';sel.dispatchEvent(new Event('change',{bubbles:true}));await W8(400);
  /* the squad row: stat → value with one decimal, in green */
  const row=document.querySelector(`.yo87r[data-yo87row="${g.id}"] .yo90pv`);r.rowTxt=row?row.textContent:'';r.green=row?[...row.querySelectorAll('.pv90 b')].map(x=>getComputedStyle(x).color):[];
  /* drill tiles: planned value + what one more hour gives */
  r.drill=(document.querySelector(`.yd76c [data-tp="g|${g.id}|spd|1"]`)||{}).textContent||'';r.drillMore=document.querySelectorAll('.yd76c .pv90m').length;
  /* regime tiles preview for the open fighter */
  r.regPv=[...document.querySelectorAll('.yd76rg[data-mg="regime"]')].map(x=>(x.querySelector('.pv90s')||{}).textContent||'');
  r.regPvOk=yd90Week(g,{regime:'hard'}).str[1]>yd90Week(g,{regime:'off'}).str[1];
  /* the numbers the week will give, then the week */
  const K=['spd','str','int','cha'];const val=x=>{const s=gStats(x);return Object.fromEntries(K.map(k=>[k,s[k]+((x.sxp||{})[k]||0)]))};
  r.pre=pick.map(x=>{const v=yd90Week(x);return Object.fromEntries(K.map(k=>[k,v[k][1]]))});r.before=pick.map(val);
  const rowNums=(r.rowTxt.match(/(\d+)\s*→\s*(\d+\.\d)/g)||[]);r.rowNums=rowNums;
  for(const bt of (w.night&&w.night.bouts)||[])bt.done=true;w.pend=[];const wk=w.week;await endWeek();await W8(400);r.adv=W_().week!==wk;
  r.after=pick.map(val);r.diff=pick.map((x,i)=>Math.max(...K.map(k=>Math.abs(r.after[i][k]-r.pre[i][k]))));
  r.gained=pick.map((x,i)=>K.some(k=>r.after[i][k]>r.before[i][k]+0.01));
  return r});
ok(p.tile&&p.tiles>=7&&/→\s*\d+\.\d/.test(p.tilePv),'1 routine tiles on the card preview stat → value '+p.tilePv);
ok(p.ord==='spd'&&/"spd":3/.test(p.plan),'1 a routine tile sets the routine '+p.ord+' '+p.plan);
ok(p.optTxt.some(t=>/Speed focus.*→\d+\.\d/.test(t))&&p.optTxt.some(t=>/All-round.*→/.test(t)),'1 the routine select options carry the preview '+p.optTxt.slice(0,3).join(' | '));
ok(p.rowNums.length>=1&&p.green.some(c=>/rgb\(1[0-9]{2}, 2[0-9]{2}, 1[0-9]{2}\)/.test(c)),'1 the squad row shows the planned stat → value in green '+p.rowTxt+' '+p.green);
ok(/→\s*\d+\.\d/.test(p.drill)&&p.drillMore>=1,'1 drill tiles show the planned value and +1 h '+p.drill);
ok(p.regPv.filter(Boolean).length>=3&&p.regPvOk,'1 regime tiles preview for the open fighter '+p.regPv.join(' | '));
ok(p.adv&&p.diff.every(d=>d<=0.05)&&p.gained.every(Boolean),'1 the preview matches the week '+JSON.stringify({pre:p.pre,after:p.after,diff:p.diff}));
/* ---------- 4 + 2 + 3 · layout ---------- */
const L=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();const ros=rosterOf(m).filter(g=>g.alive!==false);
  ros.forEach(g=>{g.inj=null});MGR.tab='practice';MGR.yd87=null;MGR_REDRAW();await W8(400);
  r.prio=document.querySelectorAll('#mgrBody [data-yp87], #mgrBody .yo87pr').length;r.prioTxt=/▲ First|▼ Last/.test(document.getElementById('mgrBody').textContent);
  r.hint=!!document.querySelector('.yd90side .yd90hint');r.docSide=!!document.querySelector('.yd90side .yd90doc [data-tp="doc|1"]');r.studySide=!!document.querySelector('.yd90side .yd90st [data-yj="study"]');
  r.docTop=!!document.querySelector('.yd76top [data-tp="doc|1"], .yd76top [data-yj="study"]');
  document.querySelector(`.yo87r[data-yo87row="${ros[0].id}"] .yo87nm`).click();await W8(400);
  const tb=document.querySelector('.yd90main .yo87').getBoundingClientRect(),cd=document.querySelector('.yd90side .yd76c');r.card=!!cd;
  if(cd){const c=cd.getBoundingClientRect();r.beside=c.left>=tb.right-2&&c.top<tb.bottom&&c.bottom>tb.top;r.rect=[Math.round(tb.left),Math.round(tb.right),Math.round(c.left),Math.round(c.right),Math.round(c.top),Math.round(tb.top)]}
  r.ones=document.querySelectorAll('.yd76c').length;
  /* doctore works from its card */
  const d0=thPlan(w).doc;const db=document.querySelector('.yd90doc [data-tp="doc|1"]');db&&db.click();await W8(300);r.doc=thPlan(w).doc-d0;
  return r});
ok(L.prio===0&&!L.prioTxt,'4 no First/Normal/Last');ok(L.hint&&L.docSide&&L.studySide&&!L.docTop,'3 doctore + study in the right column');
ok(L.card&&L.beside&&L.ones===1,'2 the open card sits beside the squad table '+JSON.stringify(L.rect));ok(L.doc===1,'3 the doctore card adds an hour');
if(SHOT){await pg.evaluate(()=>{const c=document.querySelector('.yd90');c&&c.scrollIntoView({block:'start'})});await pg.waitForTimeout(300);await pg.screenshot({path:SHOT+'/tv90y_desk.png'})}
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
  q('night').click();await W8(100);q('practice').click();await W8(100);mo.disconnect();r.removed=removed;r.same2=q('practice')===b0.p;r.body=!!document.querySelector('.yd90');
  r.swaps=RAIL90.swaps;return r});
ok(T.same&&T.same2&&T.removed===0,'5 rail buttons kept across tab clicks '+JSON.stringify(T));ok(T.on&&T.tab==='roster'&&T.body,'5 the tab still switches');
ok(T.ovNow>=T.ov0,'5 ovals stay up through the click '+T.ov0+'→'+T.ovNow);
/* ---------- phone ---------- */
const ph=await b.newPage({viewport:{width:390,height:844}});await setup(ph);
const P=await ph.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const ros=rosterOf(me());MGR.yd87=ros[0].id;MGR_REDRAW();await W8(500);
  const body=document.getElementById('mBody')||document.body;return {docX:document.documentElement.scrollWidth-innerWidth,bodyX:body.scrollWidth-body.clientWidth,card:!!document.querySelector('.yd90side .yd76c'),
    out:[...document.querySelectorAll('.yo87r,.yd90rt,.yd90doc,.yd90st,.yd76c')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length}});
ok(P.docX<=1&&P.bodyX<=1&&P.out===0&&P.card,'phone: no sideways scroll '+JSON.stringify(P));
if(SHOT){await ph.evaluate(()=>{const c=document.querySelector('.yd90side');c&&c.scrollIntoView({block:'start'})});await ph.waitForTimeout(300);await ph.screenshot({path:SHOT+'/tv90y_phone.png'})}
if(process.env.DBG)console.log(JSON.stringify({p,L,R,T,P}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

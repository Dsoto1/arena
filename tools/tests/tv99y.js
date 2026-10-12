/* v0.99 269-v99yard — Training Yard notes: max 3 fighter cards per row (2 tablet, 1 phone), Trials of the Yard as a sticky column on the
   RIGHT of the cards, the fighter picked for a trial is obvious (gold card + ribbon + large portrait/name atop the panel), each trial
   (spar / exhibition / beast pen) is used by ONE fighter a week ("Used this week by <name>", refused at the action too), the per-fighter
   limit stays, everything resets with the week. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const setup=async(pg)=>{await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_rooms100off','1')}); /* v1.0: 269's layout lives on behind 298's kill switch (tv100rm checks the new room) */
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  return pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();
    for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(300);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=600;w.train='off';w.tplan=null;
    for(const g of rosterOf(m)){g.inj=null;g.fat=0;g.restWk=null;g.ptrain=false;g.contract.weeks=20;g.morale=80;g.ord87=null;delete g.exWk;delete g.pen76Wk}
    MGR.tab='practice';MGR.tr92=null;MGR_REDRAW();for(let i=0;i<40&&!document.querySelector('.y92c');i++)await W8(100);return true})};
const pg=await b.newPage({viewport:{width:1440,height:900}});await setup(pg);
const A=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();const ros=rosterOf(m);const q=s=>document.querySelector(s);
  const inBout=new Set();for(const bt of w.night&&w.night.bouts||[])for(const id of bt.ents)inBout.add(id);
  const free=ros.filter(g=>!inBout.has(g.id));const [a,c,d]=(free.length>=3?free:ros);r.ros=ros.length;
  /* layout: rows of at most 3, trials column on the right and sticky */
  const cards=[...document.querySelectorAll('#mgrBody .y92c')].map(e=>e.getBoundingClientRect());const rows={};cards.forEach(x=>{const k=Math.round(x.top/8);rows[k]=(rows[k]||0)+1});
  r.rows=Object.values(rows);const T=q('.y92trials').getBoundingClientRect();r.right=T.left>=Math.max(...cards.map(x=>x.right))-1;r.sticky=getComputedStyle(q('.y99side')).position;
  r.sideTop=Math.abs(T.top-q('.y92grid').getBoundingClientRect().top)<80;
  /* selection */
  r.sel0=document.querySelectorAll('.y92c.sel99').length;r.sel0id=q('.y92c.sel99').dataset.y92c;
  q(`[data-y99sel="${c.id}"]`).click();await W8(250);
  r.sel1=document.querySelectorAll('.y92c.sel99').length;const sc=q(`.y92c.sel99`);r.sel1ok=sc&&sc.dataset.y92c===c.id;r.rib=/Selected for a trial/i.test(sc.querySelector('.y99rib').textContent);
  r.gold=/227|e3c27a/i.test(getComputedStyle(sc).borderTopColor)||getComputedStyle(sc).borderTopWidth==='2px';
  r.hdr=q('.y99who b').textContent===c.name;r.hdrPortrait=q('.y99who .portrait').getBoundingClientRect().width>=60;r.hdrBig=parseFloat(getComputedStyle(q(".y99who b")).fontSize)>=16;
  q(`[data-y92c="${d.id}"] .y92hd`).click();await W8(250);r.headClick=q('.y92c.sel99').dataset.y92c===d.id&&q('.y99who b').textContent===d.name;
  /* limits: spar by A, then it is closed for the others */
  q(`[data-y99sel="${a.id}"]`).click();await W8(250);const btn=k=>q(`.y92trials [data-y99t="${k}"] button`);
  r.openBefore=['spar','exh','pen'].map(k=>!btn(k).disabled);
  btn('spar').click();await W8(250);const ps=q(`[data-yp76p="${a.id}"]`);r.panel=!!ps;ps.value=c.id;q(`[data-yp76="spar|${a.id}"]`).click();await W8(300);
  r.pair=thPlan(w).pairs.some(p=>p.k==='spar'&&p.a===a.id);
  r.usedA=trialUsedBy99('spar',w)&&trialUsedBy99('spar',w).g.id===a.id;
  q(`[data-y99sel="${d.id}"]`).click();await W8(250);
  r.sparOff=btn('spar').disabled&&/Used this week by/.test(q('.y92trials [data-y99t="spar"]').textContent)&&q('.y92trials [data-y99t="spar"]').textContent.includes(a.name);
  r.othersOpen=[btn('exh').disabled,btn('pen').disabled];
  /* per-fighter rule kept: A and his partner C are done for every trial */
  q(`[data-y99sel="${a.id}"]`).click();await W8(250);r.aAll=['spar','exh','pen'].map(k=>btn(k).disabled);r.aDone=boutDone76(a,w)&&boutDone76(gById(c.id),w);
  /* exhibition used by B (state), pen used by D */
  const coin0=m.coin,h0=thLeft(w);d.exWk=w.week;gById(c.id);const e2=ros.find(x=>![a.id,c.id,d.id].includes(x.id));if(e2)e2.pen76Wk=w.week;MGR_REDRAW();await W8(250);
  q(`[data-y99sel="${(ros.find(x=>![a.id,c.id,d.id].includes(x.id)&&x!==e2)||ros[ros.length-1]).id}"]`).click();await W8(250);
  r.exhUsed=/Used this week by/.test(q('.y92trials [data-y99t="exh"]').textContent)&&q('.y92trials [data-y99t="exh"]').textContent.includes(d.name);r.penUsed=!e2||(/Used this week by/.test(q('.y92trials [data-y99t="pen"]').textContent)&&q('.y92trials [data-y99t="pen"]').textContent.includes(e2.name));
  /* refused at the action */
  const fake=document.createElement('button');fake.dataset.mg='exsim';q('#mgrBody').appendChild(fake);fake.click();await W8(250);r.guard=m.coin===coin0&&thLeft(w)===h0;fake.remove();
  const fk2=document.createElement('button');fk2.dataset.pen76='go';q('#mgrBody').appendChild(fk2);fk2.click();await W8(250);r.guard2=m.coin===coin0&&thLeft(w)===h0;fk2.remove();
  /* cancelling the spar frees the trial */
  const i=thPlan(w).pairs.findIndex(p=>p.k==='spar');thPlan(w).pairs.splice(i,1);MGR_REDRAW();await W8(250);r.freed=!trialUsedBy99('spar',w);
  thPlan(w).pairs.push({k:'spar',a:a.id,b:c.id});
  /* the week turns: everything opens again */
  for(const bt of (w.night&&w.night.bouts)||[])bt.done=true;w.pend=[];const wk=w.week;const MR=Math.random;Math.random=()=>0.97;
  try{await endWeek()}finally{Math.random=MR}await W8(500);r.adv=W_().week!==wk;const w2=W_();MGR.tab='practice';MGR_REDRAW();await W8(400);
  r.reset=['spar','exh','pen'].every(k=>!trialUsedBy99(k,w2));const sid=MGR.tr92;const g2=gById(sid);r.openAfter=['spar','exh','pen'].map(k=>{const bb=q(`.y92trials [data-y99t="${k}"] button`);return bb&&!bb.disabled});r.g2=g2&&g2.name;
  return r});
ok(A.ros>=5&&A.rows.every(n=>n<=3)&&A.rows[0]===3,'max 3 cards per row at 1440 '+JSON.stringify(A.rows));
ok(A.right&&A.sticky==='sticky'&&A.sideTop,'trials column on the right, sticky '+JSON.stringify({r:A.right,s:A.sticky,t:A.sideTop}));
ok(A.sel0===1&&A.sel1===1&&A.sel1ok&&A.rib&&A.gold,'selected card: one, gold, ribbon '+JSON.stringify({s0:A.sel0,s1:A.sel1,ok:A.sel1ok,r:A.rib,g:A.gold}));
ok(A.hdr&&A.hdrPortrait&&A.hdrBig&&A.headClick,'panel header shows the fighter large '+JSON.stringify({h:A.hdr,p:A.hdrPortrait,b:A.hdrBig,hc:A.headClick}));
ok(A.openBefore.every(Boolean)&&A.panel&&A.pair&&A.usedA,'spar by one fighter '+JSON.stringify({o:A.openBefore,p:A.panel,pair:A.pair,u:A.usedA}));
ok(A.sparOff&&A.othersOpen.join()==='false,false','spar disabled for others with the name; others open '+JSON.stringify({s:A.sparOff,o:A.othersOpen}));
ok(A.aAll.every(Boolean)&&A.aDone,'per-fighter limit kept '+JSON.stringify(A.aAll));
ok(A.exhUsed&&A.penUsed,'exhibition + pen show who used them '+JSON.stringify({e:A.exhUsed,p:A.penUsed}));
ok(A.guard&&A.guard2,'refused at the action too '+JSON.stringify({g:A.guard,g2:A.guard2}));ok(A.freed,'cancelling the spar frees it');
ok(A.adv&&A.reset&&A.openAfter.every(Boolean),'resets with the week '+JSON.stringify({a:A.adv,r:A.reset,o:A.openAfter,g:A.g2}));
if(SHOT){await pg.screenshot({path:SHOT+'/tv99y_1440.png'})}
/* ---------- tablet: 2 per row, phone: 1 ---------- */
for(const [W,H,max] of [[820,1000,2],[390,844,1]]){const p2=await b.newPage({viewport:{width:W,height:H}});await setup(p2);
  const P=await p2.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));await W8(300);const body=document.getElementById('mBody')||document.body;
    const cards=[...document.querySelectorAll('#mgrBody .y92c')].map(e=>e.getBoundingClientRect());const rows={};cards.forEach(x=>{const k=Math.round(x.top/8);rows[k]=(rows[k]||0)+1});
    const T=document.querySelector('.y92trials').getBoundingClientRect();
    return {rows:Object.values(rows),below:T.top>=Math.max(...cards.map(x=>x.bottom))-2,docX:document.documentElement.scrollWidth-innerWidth,bodyX:body.scrollWidth-body.clientWidth,
      out:[...document.querySelectorAll('.y92c,.y92doc,.y92t,.y92trials')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length}});
  ok(P.rows.every(n=>n<=max)&&P.rows[0]===max&&P.below&&P.docX<=1&&P.bodyX<=1&&P.out===0,`${W}px: ${max} per row, trials below, no sideways scroll `+JSON.stringify(P));
  if(SHOT){await p2.evaluate(()=>{const c=document.querySelector('.y92trials');c&&c.scrollIntoView({block:'start'})});await p2.waitForTimeout(300);await p2.screenshot({path:SHOT+`/tv99y_${W}.png`})}await p2.close()}
if(process.env.DBG)console.log(JSON.stringify({A}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

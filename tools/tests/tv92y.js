/* v0.92 213-v92yard — the Training Yard redesign: one card per fighter with a bar per rating, + plans a session with a
   preview, cap 3, house hours drop, − takes it back, 🔒 Lock in commits, more after a lock; the doctore's drill only after a
   locked session and outside the cap; the regime (intensity) sits in the Doctore panel; ↻ Same as last week; Care = 1 h;
   hurt / resting cards locked; ⚔ Trials of the Yard strip with a working spar; at the week's end the applied gains equal
   the previews (within 0.05); standing drill routines no longer train on their own; 390 px without sideways scroll.
   SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const setup=async(pg)=>{await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  return pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();
    for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(300);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=600;w.train='off';w.tplan=null;
    for(const g of rosterOf(m)){g.inj=null;g.fat=0;g.restWk=null;g.ptrain=false;g.contract.weeks=20;g.morale=80;g.ord87=null}
    MGR.tab='practice';MGR_REDRAW();for(let i=0;i<40&&!document.querySelector('.y92c');i++)await W8(100);return true})};
const pg=await b.newPage({viewport:{width:1440,height:900}});await setup(pg);
const A=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();const ros=rosterOf(m);
  const inBout=new Set();for(const bt of w.night&&w.night.bouts||[])for(const id of bt.ents)inBout.add(id);
  const free=ros.filter(g=>!inBout.has(g.id));const [g,h,k3]=(free.length>=3?free:ros);r.ids=[g.id,h.id];
  const q=s=>document.querySelector(s);const plus=(x,k)=>q(`[data-y92s="${x.id}|${k}|1"]`);const minus=(x,k)=>q(`[data-y92s="${x.id}|${k}|-1"]`);
  r.cards=document.querySelectorAll('#mgrBody .y92c').length;r.ros=ros.length;
  r.bars=[...q(`[data-y92c="${g.id}"]`).querySelectorAll('.y92r')].map(x=>x.querySelector('.y92l').textContent.trim());
  r.old=document.querySelectorAll('#mgrBody [data-yr87],#mgrBody .yo87r,#mgrBody [data-tp^="g|"][data-tp$="|spd|1"]').length;
  const h0=thLeft(w);r.v0=q(`[data-y92c="${g.id}"] [data-y92k="spd"] .y92v`).textContent;
  plus(g,'spd').click();await W8(150);r.h1=thLeft(w);r.v1=q(`[data-y92c="${g.id}"] [data-y92k="spd"] .y92v`).textContent;
  r.seg=parseFloat(q(`[data-y92c="${g.id}"] [data-y92k="spd"] .y92m s`).style.width);
  plus(g,'spd').click();await W8(120);plus(g,'str').click();await W8(120);r.cap3=plus(g,'int').disabled;r.capFn=y92Plus(g,'int');
  r.used=thMax()-thLeft(w);r.h3=h0-thLeft(w);
  minus(g,'str').click();await W8(120);r.afterMinus=JSON.stringify(thPlan(w).y92[g.id].Q);r.h2=h0-thLeft(w);
  /* preset before a lock: not offered */
  r.preBefore=document.querySelectorAll(`[data-y92pre^="${g.id}|"]`).length;
  q(`[data-y92lock="${g.id}"]`).click();await W8(150);const Y=thPlan(w).y92[g.id];r.L=JSON.stringify(Y.L);r.Q=JSON.stringify(Y.Q);r.hLock=h0-thLeft(w);
  r.minusLocked=minus(g,'spd').disabled;
  plus(g,'int').click();await W8(120);r.afterMore=JSON.stringify(thPlan(w).y92[g.id].Q);r.cap3b=plus(g,'cha').disabled;
  /* the doctore's drill: offered now, outside the cap, costs 2 h */
  const hp=thLeft(w);r.preNow=document.querySelectorAll(`[data-y92pre^="${g.id}|"]`).length;q(`[data-y92pre="${g.id}|foot"]`).click();await W8(120);
  r.pre=JSON.stringify(thPlan(w).y92[g.id].pre);r.preCost=hp-thLeft(w);r.preCapStill=y92Sum(thPlan(w).y92[g.id].L)+y92Sum(thPlan(w).y92[g.id].Q);
  q(`[data-y92lock="${g.id}"]`).click();await W8(150);r.preLocked=!!(thPlan(w).y92[g.id].pre||{}).lock;
  /* h: a plain session elsewhere, locked; a preset refused for k3 (no lock) */
  plus(h,'cha').click();await W8(100);plus(h,'str').click();await W8(100);q(`[data-y92lock="${h.id}"]`).click();await W8(150);
  r.k3pre=document.querySelectorAll(`[data-y92pre^="${k3.id}|"]`).length;
  /* the regime lives in the Doctore panel */
  r.regDoc=document.querySelectorAll('.y92doc [data-mg="regime"]').length;r.regElse=document.querySelectorAll('#mgrBody [data-mg="regime"]').length;
  r.docFace=!!q('.y92doc .y92face svg');r.docLv=/level \d/.test(q('.y92doc').textContent);
  q('.y92doc [data-mg="regime"][data-id="std"]').click();await W8(200);r.train=w.train;
  /* Care: 1 h, morale + gear */
  const hc=thLeft(w),mo=k3.morale;q(`[data-y92care="${k3.id}"]`).click();await W8(150);r.careCost=hc-thLeft(w);r.careMor=k3.morale-mo;r.careGear=k3.gear74===w.season+':'+w.week;
  /* the trials strip: framed cards and a working spar */
  r.trials=document.querySelectorAll('.y92trials .y92t').length;r.trialAttrs=[...document.querySelectorAll('.y92trials [data-yb76]')].map(x=>x.dataset.yb76.split(':')[0]);
  r.cardBouts=document.querySelectorAll('.y92c [data-yb76^="spar"],.y92c [data-yb76^="exh"],.y92c [data-yb76^="pen"]').length;
  const sel=q('.y92trials [data-tr92]');sel.value=k3.id;sel.dispatchEvent(new Event('change',{bubbles:true}));await W8(200);
  q(`.y92trials [data-yb76="spar:${k3.id}"]`).click();await W8(200);const ps=q(`[data-yp76p="${k3.id}"]`);r.sparPanel=!!ps;
  if(ps){const mate=[...ps.options].map(o=>o.value).find(v=>v!==g.id&&v!==h.id)||ps.options[0].value;ps.value=mate;r.mate=mate;q(`[data-yp76="spar|${k3.id}"]`).click();await W8(200)}
  r.spar=thPlan(w).pairs.some(p=>p.k==='spar'&&(p.a===k3.id||p.b===k3.id));r.boutDone=boutDone76(k3,w);
  /* previews, then the week */
  const K=['spd','str','int','cha'];const val=x=>{const s=gStats(x);return Object.fromEntries(K.map(k=>[k,s[k]+((x.sxp||{})[k]||0)]))};
  const pick=[g,h,k3,gById(r.mate)].filter(Boolean);r.pre2=pick.map(x=>{const V=y92Views(x);return Object.fromEntries(K.map(k=>[k,V.lock[k][1]]))});
  r.uiPrev=q(`[data-y92c="${g.id}"] [data-y92k="spd"] .y92v`).textContent;r.before=pick.map(val);
  r.fat0=pick.map(x=>[gFat(x),y92Views(x).lock.work]);
  for(const bt of (w.night&&w.night.bouts)||[])bt.done=true;w.pend=[];const wk=w.week;const MR=Math.random;Math.random=()=>0.97; /* no training knocks: the preview is the no-injury week */
  const G96c=GROW96.chance;GROW96.chance=0;/* v0.97: the hashed 10% chance of +0.2 to another rating (245) is not in the yard preview (as tv90y) */try{await endWeek()}finally{Math.random=MR;GROW96.chance=G96c}await W8(400);r.adv=W_().week!==wk;
  r.after=pick.map(val);r.diff=pick.map((x,i)=>Math.max(...K.map(k=>Math.abs(r.after[i][k]-r.pre2[i][k]))));
  r.gained=r.after[0].spd>r.before[0].spd+0.5;r.last=JSON.stringify(W_().y92last||{});
  return r});
ok(A.cards===A.ros&&A.bars.join('|').match(/Speed\|.*Strength\|.*Tactics\|.*Crowd\|.*Luck\|.*Fatigue/),'cards + bars '+A.cards+'/'+A.ros+' '+A.bars.join('|'));
ok(A.old===0,'old routine selects / squad rows / drill tiles gone '+A.old);
ok(/→/.test(A.v1)&&!/→/.test(A.v0)&&A.seg>0,'+ shows the preview '+A.v0+' / '+A.v1+' seg '+A.seg);
ok(A.cap3&&A.capFn===false&&A.h3===3,'cap 3 + hours drop '+JSON.stringify({cap:A.cap3,fn:A.capFn,h3:A.h3}));
ok(A.afterMinus==='{"spd":2}'&&A.h2===2,'− removes a planned session '+A.afterMinus+' '+A.h2);
ok(A.preBefore===0,'no doctore drill before a lock');
ok(A.L==='{"spd":2}'&&A.Q==='{}'&&A.hLock===2&&A.minusLocked,'Lock in commits '+A.L+' '+A.Q+' '+A.hLock);
ok(A.afterMore==='{"int":1}'&&A.cap3b,'more after a lock, cap still 3 '+A.afterMore);
ok(A.preNow>=2&&/"foot"/.test(A.pre)&&A.preCost===2&&A.preCapStill===3&&A.preLocked,'doctore drill after a lock, outside the cap '+JSON.stringify({n:A.preNow,pre:A.pre,cost:A.preCost,cap:A.preCapStill,lk:A.preLocked}));
ok(A.k3pre===0,'no drill for a fighter with nothing locked');
ok(A.regDoc===4&&A.regElse===4&&A.docFace&&A.docLv&&A.train==='std','regime in the Doctore panel '+JSON.stringify({d:A.regDoc,e:A.regElse,f:A.docFace,t:A.train}));
ok(A.careCost===1&&A.careMor===5&&A.careGear,'Care costs 1 h '+JSON.stringify({c:A.careCost,m:A.careMor,g:A.careGear}));
ok(A.trials===3&&A.trialAttrs.join()==='spar,exh,pen'&&A.cardBouts===0,'trials strip '+A.trialAttrs.join());
ok(A.sparPanel&&A.spar&&A.boutDone,'a spar from the strip '+JSON.stringify({p:A.sparPanel,s:A.spar,d:A.boutDone}));
ok(A.adv&&A.diff.every(d=>d<=0.05)&&A.gained,'applied == preview '+JSON.stringify({pre:A.pre2,after:A.after,diff:A.diff}));
ok(/"spd":2,"int":1|"int":1,"spd":2/.test(A.last),'last week kept '+A.last);
/* ---------- ↻ Same as last week, routines don't self-train, hurt / resting locked ---------- */
const B=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();const ros=rosterOf(m);
  for(const g of ros){g.inj=null;g.restWk=null}MGR.tab='practice';MGR_REDRAW();await W8(300);
  const last=w.y92last||{};const id=Object.keys(last)[0];r.planBefore=JSON.stringify((thPlan(w).y92||{})[id]||{});
  document.querySelector('[data-y92same]').click();await W8(200);const y=thPlan(w).y92[id];r.Q=JSON.stringify(y.Q);r.want=JSON.stringify(last[id]);r.L=JSON.stringify(y.L);
  document.querySelector('[data-y92all]').click();await W8(200);r.L2=JSON.stringify(thPlan(w).y92[id].L);
  /* an old standing routine neither trains on its own nor double-books */
  const x=ros.find(g=>g.id!==id&&!(last[g.id]));x.ord87={r:'str',p:2};ord87RunAll(w);r.og=JSON.stringify(thPlan(w).g[x.id]||{});
  delete w.y92last[x.id];document.querySelector('[data-y92same]').click();await W8(200);r.seed=JSON.stringify(thPlan(w).y92[x.id].Q);
  /* hurt + resting */
  const [a,c]=ros.filter(g=>g.id!==id&&g.id!==x.id);a.inj={until:w.week+2,label:'a cut'};c.restWk=w.week;MGR_REDRAW();await W8(300);
  const ca=document.querySelector(`[data-y92c="${a.id}"]`),cc=document.querySelector(`[data-y92c="${c.id}"]`);
  r.hurt=ca.classList.contains('locked')&&/rehab only/.test(ca.textContent)&&!ca.querySelector('[data-y92s]')&&!!ca.querySelector(`[data-tp="g|${a.id}|rehab|1"]`);
  r.rest=cc.classList.contains('locked')&&/Resting/.test(cc.textContent)&&!cc.querySelector('[data-y92s]');r.plusHurt=y92Plus(a,'spd');
  a.inj=null;c.restWk=null;MGR_REDRAW();await W8(200);return r});
ok(B.Q===B.want&&B.L==='{}'&&B.L2===B.want,'↻ Same as last week re-plans, Lock all commits '+JSON.stringify(B));
ok(B.og==='{}','a standing drill routine no longer self-trains '+B.og);ok(B.seed==='{"str":3}','the old routine seeds ↻ '+B.seed);
ok(B.hurt&&B.rest&&B.plusHurt===false,'hurt + resting cards locked '+JSON.stringify({h:B.hurt,r:B.rest}));
if(SHOT){await pg.evaluate(()=>{const c=document.querySelector('.y92doc');c&&c.scrollIntoView({block:'start'})});await pg.waitForTimeout(300);await pg.screenshot({path:SHOT+'/tv92y_desk.png'})}
/* ---------- phone ---------- */
const ph=await b.newPage({viewport:{width:390,height:844}});await setup(ph);
const P=await ph.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));await W8(300);const body=document.getElementById('mBody')||document.body;
  const btn=[...document.querySelectorAll('.y92b')].filter(e=>e.offsetParent).map(e=>e.getBoundingClientRect()).filter(r=>r.width<31||r.height<31).length;
  return {docX:document.documentElement.scrollWidth-innerWidth,bodyX:body.scrollWidth-body.clientWidth,small:btn,
    out:[...document.querySelectorAll('.y92c,.y92doc,.y92t,.y92trials')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).length}});
ok(P.docX<=1&&P.bodyX<=1&&P.out===0&&P.small===0,'phone: no sideways scroll, buttons ≥ 32 px '+JSON.stringify(P));
if(SHOT){await ph.evaluate(()=>{const c=document.querySelector('.y92grid');c&&c.scrollIntoView({block:'start'})});await ph.waitForTimeout(300);await ph.screenshot({path:SHOT+'/tv92y_phone.png'})}
if(process.env.DBG)console.log(JSON.stringify({A,B,P}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

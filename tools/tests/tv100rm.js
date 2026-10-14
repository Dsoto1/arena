/* tv100rm — THE MANAGER ROOMS (298-v100rooms, his mock tools/plans/mock100/rooms.html): each room renders to the mock's structure
   (banner with the advisor's head, list column, dossier panels, the wax tabula, painted plates) and its key actions still work on the
   moved nodes: ROSTER select a fighter, 🪑 Bench from a starter tablet, ⭐ Promote + Lend… from Bench & loans, the contract's Renew /
   Release are there; TRAINING YARD select from the list, + a session, 🔒 Lock in, a drill plate, the week's plan + Lock in all, three
   trial plates; INFIRMARY the marble statue (lost limb masked, wound spot), care plates, 🛏 Put in bed and a cure (Asclepius); the kill
   switch flavius_rooms100off=1 gives the old rooms; 390 px: one column, no sideways scroll; no new 00c errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_rooms100off','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    const ros=rosterOf(pm);for(const g of ros){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.contract.weeks=20;g.morale=80;g.ord87=null}
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('roster');await W8(800);MGR.view=null});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const go=async(pg,t)=>ev(pg,async t=>{if(!document.querySelector('#mgrBody'))openManager(t);MGR.tab=t;MGR_REDRAW();await new Promise(r=>setTimeout(r,600));return !!document.querySelector('#mgrBody')},t);

/* ---------------- 1440: the three rooms ---------------- */
const pg=await open(1440,900);
/* ROSTER */
await go(pg,'roster');
out.ro=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};const pm=me(),w=W_();const ros=rosterOf(pm);
  r.on=document.body.classList.contains('rm100on');r.room=!!q('#mgrPane .rm100.rm100-roster');r.ban=!!q('.roomhd.rm100ban .rm100adv')&&!!q('.roomhd.rm100ban .roomttl');
  r.rows=document.querySelectorAll('.rm100list .rm100lr[data-mg="lsel"]').length===ros.length;r.cols=document.querySelectorAll('.rm100list .rm100lh.ros>span').length===8;
  r.tablets=document.querySelectorAll('.depth.rm100stt>.st95slot.rm100st[data-slot95]').length===3;
  r.panels=['.rm100pp','.rm100rat .ratgrid','.rm100pers','.rm100bench','.rm100con.rm100tab .rm100wax','.rm100keep','.rm100more'].every(s=>!!q('.rm100dos '+s));
  r.oldGone=!q('.st95wrap')&&!q('.st95list table.tally');
  /* select another fighter */
  const g2=ros.find(x=>x.id!==MGR.lsel);q(`.rm100list [data-mg="lsel"][data-id="${g2.id}"]`).click();await W8(400);r.sel=MGR.lsel===g2.id&&q('.rm100pp .rm100pn').textContent.includes(g2.name)&&!!q(`.rm100list .rm100lr.on[data-id="${g2.id}"]`);
  r.contract=!!q(`.rm100con [data-mg="extend"][data-id="${g2.id}"]`)&&!!q(`.rm100con [data-mg="release"][data-id="${g2.id}"]`)&&!!q(`.rm100keep [data-mg="meal"][data-id="${g2.id}"]`);
  /* bench a starter from its tablet, promote him back from Bench & loans */
  st95Ensure(w,pm);const st=ros.find(x=>x.slot95);r.hadStarter=!!st;
  if(st){const bb=q(`.rm100st [data-st95="bench"][data-id="${st.id}"]`);r.benchBtn=!!bb;if(bb)bb.click();await W8(400);r.benched=!st.slot95;
    const pb=q(`.rm100bench [data-st95="promo"][data-id="${st.id}"]`);r.promoBtn=!!pb;if(pb)pb.click();await W8(400);r.promoted=!!st.slot95}
  /* lend a benched fighter */
  const bench=ros.find(x=>!x.slot95&&!x.inj);r.hasBench=!!bench;
  if(bench){const s=q(`.rm100bench select[data-m47lend="${bench.id}"]`)||q(`.rm100con select[data-m47lend="${bench.id}"]`);r.lendSel=!!s;
    if(s&&s.options.length>1){s.value=s.options[1].value;s.dispatchEvent(new Event('change',{bubbles:true}));await W8(500);r.lent=!!bench.contract&&bench.contract.mgr!==pm.id&&!!q('.rm100list .rm100lr.lent')}else r.lent='nolender'}
  return r});
for(const k of ['on','room','ban','rows','cols','tablets','panels','oldGone','sel','contract','hadStarter','benchBtn','benched','promoBtn','promoted','hasBench','lendSel'])ok(out.ro[k],'roster '+k);
ok(out.ro.lent===true||out.ro.lent==='nolender','roster lend');
/* TRAINING YARD */
await go(pg,'practice');
out.yd=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};const pm=me(),w=W_();const ros=rosterOf(pm);
  r.room=!!q('#mgrPane .rm100.rm100-yard');r.ban=!!q('.roomhd.rm100ban .rm100adv');r.rows=document.querySelectorAll('.rm100list .rm100lr[data-y99sel]').length===ros.length;
  r.cards=document.querySelectorAll('#mgrBody .y92c').length===ros.length&&document.querySelectorAll('.rm100dos .rm100yc .y92c').length===1;
  r.doc=!!q('.rm100y1 .y92doc.rm100doc .y92face')&&!!q('.y92doc [data-mg="regime"]');r.plan=!!q('.rm100plan .rm100wax [data-y92all]')&&!!q('.rm100plan [data-y92same]');
  r.plates=document.querySelectorAll('.rm100drills .rm100plt').length===6;r.trials=document.querySelectorAll('.y92trials.rm100tri .y92t .rm100fr').length===3&&document.querySelectorAll('.y92trials [data-yb76]').length>=3;
  /* pick a fighter from the list */
  const g=ros.find(x=>x.id!==MGR.tr92&&!y92Lock(x))||ros[0];q(`.rm100list [data-y99sel="${g.id}"]`).click();await W8(400);r.sel=MGR.tr92===g.id&&!!q(`.rm100yc .y92c[data-y92c="${g.id}"]`);
  r.preBefore=document.querySelectorAll(`[data-y92pre^="${g.id}|"]`).length===0;
  const plus=q(`.rm100yc [data-y92s="${g.id}|str|1"]`);plus.click();await W8(300);r.planned=y92Sum(y92Peek(thPlan(w),g.id).Q)===1;
  q(`.rm100yc [data-y92lock="${g.id}"]`).click();await W8(300);r.locked=y92Sum(y92Peek(thPlan(w),g.id).L)===1;
  const pl=q(`.rm100drills [data-y92pre="${g.id}|iron"]`);r.plateOn=!!pl&&!pl.disabled;if(pl)pl.click();await W8(300);const y=y92Peek(thPlan(w),g.id);r.drill=!!y.pre&&y.pre.k==='iron';
  r.badge=!!q('.rm100drills .rm100plt.on .rm100bdg');r.planRow=[...document.querySelectorAll('.rm100plan .rm100tr')].some(x=>/🔒/.test(x.textContent));
  q(`.rm100yc [data-y92lock="${g.id}"]`).click();await W8(300);r.drillLocked=!!(y92Peek(thPlan(w),g.id).pre||{}).lock;
  return r});
for(const k of ['room','ban','rows','cards','doc','plan','plates','trials','sel','preBefore','planned','locked','plateOn','drill','badge','planRow','drillLocked'])ok(out.yd[k],'yard '+k);
/* INFIRMARY */
out.wd=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};const pm=me(),w=W_();const ros=rosterOf(pm);pm.coin=900;
  const A=ros[ros.length-1];A.inj={until:w.week+3,label:'a gashed chest',pen:3,wk102:w.week-1 /* v1.02 (341): last week's wound — a fresh serious one rests its first week */};A.severed=['larm'];A.fat=64;w.beds76=[];MGR.inf90=A.id;MGR.tab='infirm';MGR_REDRAW();await W8(600);
  r.room=!!q('#mgrPane .rm100.rm100-ward.iv90');r.ban=!!q('.roomhd.rm100ban .rm100adv');r.list=!!q('.rm100list .iv90list .iv90row.on[data-inf90="'+A.id+'"]');
  r.mid=!!q('.rm100w3.iv90mid .rm100pat .iv90hp')&&!!q('.rm100w3.iv90mid .rm100sta .rm100niche .iv90av svg');
  r.marble=!!q('.rm100niche svg image[mask]')&&!!q('.rm100niche .rm100ghost')&&!!q('.rm100niche .rm100spot');
  r.road=document.querySelectorAll('.rm100road .rm100tr').length>=3;r.plates=document.querySelectorAll('.rm100care.iv90care .rm100plt .rm100fr').length>=3;
  const bed=q(`.iv90care [data-bed76="${A.id}"]`);r.bedBtn=!!bed&&!bed.disabled;if(bed)bed.click();await W8(500);r.inBed=inBed76(A);
  const asc=q(`.iv90care [data-mg="asclepius"][data-id="${A.id}"]`);r.asc=!!asc&&!asc.disabled;if(asc)asc.click();await W8(500);for(let k=0;k<4&&CUR_MODAL;k++){const bt=document.querySelector('#mBtns button.primary');if(bt)bt.click();else CUR_MODAL.done(true);await W8(300)}r.cured=!A.inj||!!A.inj.bk102; /* v1.02 (341): Asclepius is booked — the wound closes when the week ends */
  r.errs=typeof errNew92==='function'?errNew92(window.RM_MARK).map(e=>e.kind+':'+e.msg):[];return r});
for(const k of ['room','ban','list','mid','marble','road','plates','bedBtn','inBed','asc','cured'])ok(out.wd[k],'infirmary '+k);
ok(!out.wd.errs.length,'no new 00c errors '+JSON.stringify(out.wd.errs));
await pg.close();
/* ---------------- the kill switch ---------------- */
const pk=await open(1440,900,true);
out.off={};for(const t of ['roster','practice','infirm']){await go(pk,t);out.off[t]=await ev(pk,t=>!document.querySelector('.rm100')&&!document.body.classList.contains('rm100on')&&!!document.querySelector(t==='roster'?'.st95wrap':t==='practice'?'.y92grid .y92c':'.iv90 .iv90list'),t)}
ok(out.off.roster&&out.off.practice&&out.off.infirm,'kill switch → old rooms '+JSON.stringify(out.off));await pk.close();
/* ---------------- 390: one column, no sideways scroll ---------------- */
const ph=await open(390,844);out.ph={};
await ev(ph,()=>{const ros=rosterOf(me());const w=W_();const A=ros[ros.length-1];A.inj={until:w.week+3,label:'a gashed chest',pen:3};A.severed=['larm']});
for(const t of ['roster','practice','infirm']){await go(ph,t);out.ph[t]=await ev(ph,()=>{const L=document.querySelector('.rm100list'),D=document.querySelector('.rm100dos');const sc=[...document.querySelectorAll('#mBody,#mgrBody,#mgrPane,.rm100,.rm100dos')];
  return {room:!!(L&&D),stack:!!(L&&D)&&L.getBoundingClientRect().bottom<=D.getBoundingClientRect().top+1,side:document.documentElement.scrollWidth<=391&&sc.every(e=>e.scrollWidth<=e.clientWidth+1),
    wide:[...document.querySelectorAll('.rm100 *')].filter(e=>{const r=e.getBoundingClientRect();if(!(r.width>0&&r.right>392)||e.closest('.rm100hold'))return false;
      /* content inside a clipping / scrolling box that itself fits (an ellipsis line, a table that scrolls sideways in its card) does not stick out */
      for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){const ox=getComputedStyle(a).overflowX;if(ox!=='visible'&&a.getBoundingClientRect().right<=392)return false;if(a.classList.contains('rm100'))break}return true}).slice(0,3).concat((()=>{const t=[...document.querySelectorAll('.rm100 tbody,.rm100 .gt84')].find(e=>e.getBoundingClientRect().right>392&&!e.closest('.rm100hold')&&!(()=>{for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){if(getComputedStyle(a).overflowX!=='visible'&&a.getBoundingClientRect().right<=392)return true;if(a.classList.contains('rm100'))break}return false})());if(!t)return [];const ch=[];for(let e=t;e&&ch.length<8;e=e.parentElement)ch.push(e.tagName+'.'+String(e.className).split(' ').slice(0,2).join('.'));return [{className:ch.join('<')}]})()).map(e=>(e.className&&e.className.baseVal!=null?e.className.baseVal:e.className)||e.tagName.toLowerCase()+'@'+Math.round(e.getBoundingClientRect().right)+(e.parentElement?'<'+e.parentElement.tagName.toLowerCase()+'.'+String(e.parentElement.className&&e.parentElement.className.baseVal!=null?e.parentElement.className.baseVal:e.parentElement.className).split(' ')[0]:''))}})}
for(const t of ['roster','practice','infirm'])ok(out.ph[t].room&&out.ph[t].stack&&out.ph[t].side&&!out.ph[t].wide.length,'390 '+t+' '+JSON.stringify(out.ph[t]));
await ph.close();
console.log(JSON.stringify(out));console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

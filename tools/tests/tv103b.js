/* tv103b — v1.03 MANAGER (345-v103mgr): M1 the Superbus review + Acta (no "Week 13"), M2 Superbus Week rail/banner/card (no oval "4"), M3 Rivalry Week closed,
   M4 roster cap 15 (offers, poach, borrow, trade, rivals, over-cap desk row), M5 no lending/borrowing injured, M6 Armory starters stay gold, M7 trade/loan
   requests always give something, M8 Infirmary "Treated ✓", M9 header record + no "N fighters", N8 Vulso's cart = Recruiter letter, N9a tiles swapped + bigger
   council faces; kill switch flavius_v103boff=1 restores the old behaviour. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v103boff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=9000;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    window.ENS=async()=>{const el=document.querySelector('#mgrBody');if(!el||!el.offsetParent){menuHide();openManager(MGR.tab||'ludus');await W8(900)}};
    window.PW=async()=>{const w=W_(),pm=me();for(const g of rosterOf(pm)){g.inj=null;g.contract.weeks=30;g.fat=0;g.severed=[]}
      if(w.special&&!w.special.done)await specAutoRun();
      if(w.night&&!w.night.bye)for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k);
      w.pend=[];const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let rr;try{rr=await endWeek()}finally{clearInterval(hold)}await W8(250);return rr};
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('ludus');await W8(600);MGR.view=null});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);

const pg=await open(false);

/* ---- M9 header + N9a tiles (week 1) ---- */
out.hdr=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));await ENS();MGR.tab='ludus';MGR_REDRAW();await W8(900);const r={};const mh=document.querySelector('.badges.mhead');
  r.txt=mh?mh.textContent:'';r.noFighters=!!mh&&!/\b\d+ fighters?\b/i.test(mh.textContent);r.podium=!!mh&&!!mh.querySelector('.pd102')&&/🥇\d+ 🥈\d+ 🥉\d+/.test(mh.textContent);r.noOld=!!mh&&!/Record \d+-\d+/.test(mh.textContent);
  const tl=[...document.querySelectorAll('.lu100tiles>.lu100t')].map(x=>[...x.classList].find(c=>/^k-/.test(c)));r.order=tl.join(',');
  r.swapped=tl.indexOf('k-armory')>=0&&tl.indexOf('k-promote')>=0&&tl.indexOf('k-armory')<tl.indexOf('k-promote')&&tl.indexOf('k-armory')===1;
  const f=document.querySelector('#council83 .c83p:not(.c101cons) .c83f'),c=document.querySelector('#council83 .c101cons .c83f'),adv=document.querySelector('.lu100t.k-adv');
  r.face=f?Math.round(f.getBoundingClientRect().width):0;r.cons=c?Math.round(c.getBoundingClientRect().width):0;r.advH=adv?Math.round(adv.getBoundingClientRect().height):0;
  const svg=f&&f.querySelector('svg');r.svgW=svg?Math.round(svg.getBoundingClientRect().width):0;return r});
ok(out.hdr.noFighters&&out.hdr.podium&&out.hdr.noOld,'M9 header '+JSON.stringify(out.hdr));ok(out.hdr.swapped,'N9a tiles '+out.hdr.order);ok(out.hdr.face>=80&&(out.hdr.cons===0||out.hdr.cons>=100)&&out.hdr.svgW>=70&&out.hdr.advH>0&&out.hdr.advH<340,'N9a faces '+JSON.stringify(out.hdr));

/* ---- M4 + M5 + M7 + N8 + M6 + M8 ---- */
out.cap=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const r={};
  /* v1.04 (350): the cap grows with the Barracks + the Barracks master (cap104) — at the top it is the hard cap 15 this test checks */
  pm.fac=pm.fac||{};pm.fac.barracks=3;{const a=council83(w).find(x=>x.k==='barracks');if(a)a.lv=5}
  const add=(m,n)=>{for(let i=0;i<n;i++){const g=genGlad({ovr:50+i});g.contract={mgr:m.id,wage:3,weeks:20,since:w.week};g.alive=true;w.glads.push(g)}};
  const n0=rosterOf(pm).length;add(pm,Math.max(0,MGR_CAP103-1-n0));r.n14=rosterOf(pm).length;
  const fa=freeAgents().find(g=>!g.inj)||(()=>{const g=genGlad({ovr:60});w.glads.push(g);return g})();
  r.under=cap103Why()===''&&!offerVerdict(fa,30,8,0,false).cap103;
  add(pm,1);r.n15=rosterOf(pm).length;r.full=cap103Why();const v=offerVerdict(fa,30,8,0,false);r.fullVerdict=!v.ok&&!!v.cap103&&/full/.test(v.why);
  r.poach=!poachVerdict(fa,30).ok&&!!poachVerdict(fa,30).cap103;
  /* the button + the click guard before an hour is spent */
  MGR.tab='recruit';MGR.sel=fa.id;MGR_REDRAW();await W8(800);const s3=document.querySelector('[data-recstep="3"]');if(s3)s3.click();await W8(900);
  const ob=document.querySelector('#mgrBody [data-mg="offer"]');r.btnDis=!!ob&&!!ob.dataset.dis&&/full/.test(ob.dataset.dis);
  const h0=w.hours;const bt=document.createElement('button');bt.dataset.mg='offer';bt.dataset.id=fa.id;document.querySelector('#mgrBody').appendChild(bt);bt.click();bt.remove();await W8(200);r.noHour=w.hours===h0&&!fa.contract;
  /* borrow refused at the cap, an injured fighter is never lent or borrowed */
  const lender=w.mgrs.find(m=>!m.isPlayer&&!m.sica&&!isRival(m))||w.mgrs.find(m=>!m.isPlayer&&!m.sica);lender.fame=100;lender.fac=lender.fac||{};lender.fac.barracks=3;const X=rosterOf(lender).find(g=>!g.inj&&!g.loanFrom);const gb=X?borrowFrom(X,lender,5,3):'none';r.borrowCap=X?gb===false&&!X.loanFrom:true;
  const mine=rosterOf(pm).find(g=>!g.loanFrom);mine.inj={until:w.week+3,label:'a cut',pen:3};r.lendInj=lendTo(mine,lender,5,3)===false&&!mine.loanFrom;mine.inj=null;
  /* over the cap: a career above it keeps everyone; the desk says so */
  add(pm,2);r.n17=rosterOf(pm).length;const row=weekChecklist().find(x=>x.ic==='👥');r.desk=!!row&&/Over the cap: 17 \/ 15/.test(row.txt.replace(/<[^>]*>/g,''));
  r.kept=rosterOf(pm).length===17;
  /* a swap that brings in more than it sends is refused at the cap */
  const sw={id:'oT',kind:'swap',mid:lender.id,gid:mine.id,give:rosterOf(lender).slice(0,2).map(g=>g.id),coin:0,until:w.week+2};w.offers=[sw];r.swapNo=offerAccept(sw)===false&&mine.contract.mgr===pm.id;w.offers=[];
  /* rivals obey: 18 fighters → 15 at the week's end */
  add(lender,18-rosterOf(lender).length);const before=rosterOf(lender).length;cap103Trim(w);r.rival=[before,rosterOf(lender).length];
  /* back under: signing is allowed again */
  const ros=rosterOf(pm);for(const g of ros.slice(0,3))g.contract=null;r.again=cap103Why()===''&&!offerVerdict(fa,30,8,0,false).cap103;
  return r});
ok(out.cap.n14===14&&out.cap.under&&out.cap.n15===15&&out.cap.fullVerdict&&out.cap.poach,'M4 verdicts '+JSON.stringify(out.cap));ok(out.cap.btnDis&&out.cap.noHour,'M4 button + guard '+JSON.stringify(out.cap));
ok(out.cap.borrowCap&&out.cap.lendInj,'M4/M5 borrow + injured '+JSON.stringify(out.cap));ok(out.cap.desk&&out.cap.kept&&out.cap.swapNo&&out.cap.rival[0]===18&&out.cap.rival[1]===15&&out.cap.again,'M4 over-cap desk/rivals '+JSON.stringify(out.cap));

/* ---- M5 borrowing an injured fighter (under the cap) ---- */
out.m5=await ev(pg,async()=>{const w=W_(),pm=me();const r={};const lender=w.mgrs.find(m=>!m.isPlayer&&!m.sica&&!isRival(m));const X=lender&&rosterOf(lender).find(g=>!g.loanFrom);if(!X)return {skip:1};
  X.inj={until:w.week+3,label:'a cut',pen:3};r.inj=borrowFrom(X,lender,5,3)===false&&!X.loanFrom;X.inj=null;r.ok=borrowFrom(X,lender,5,3)!==false;if(X.loanFrom){X.loanFrom=null;X.contract.mgr=lender.id}return r});
ok(out.m5.skip||(out.m5.inj&&out.m5.ok),'M5 '+JSON.stringify(out.m5));

/* ---- M7 offers ---- */
out.m7=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const r={};const lender=w.mgrs.find(m=>!m.isPlayer&&!m.sica);const mine=rosterOf(pm)[0];
  w.offers=[{id:'oL',kind:'loan',mid:lender.id,gid:mine.id,fee:7,weeks:3,until:w.week+1},{id:'oC',kind:'coin',mid:lender.id,gid:mine.id,coin:0,until:w.week+2},{id:'oS',kind:'swap',mid:lender.id,gid:mine.id,give:['nobody'],coin:0,until:w.week+2},{id:'oF',kind:'loan',mid:lender.id,gid:mine.id,fee:0,weeks:3,until:w.week+1}];
  const h=offersHTML();const T=document.createElement('template');T.innerHTML=h;const txt=T.content.textContent;
  r.loanPays=/They pay/.test(txt)&&/7/.test(txt)&&/3 weeks/.test(txt)&&!/You get\s*$/.test(txt);r.cards=T.content.querySelectorAll('.offerbox').length;r.left=w.offers.map(o=>o.id).join(',');
  r.accept=!!T.content.querySelector('[data-m47="offyes"][data-id="oL"]');
  /* a real coin offer stays */
  lender.coin=500;w.offers=[{id:'oK',kind:'coin',mid:lender.id,gid:mine.id,coin:120,until:w.week+2}];offersHTML();r.coinStays=w.offers.length===1;w.offers=[];return r});
ok(out.m7.loanPays&&out.m7.cards===1&&out.m7.left==='oL'&&out.m7.accept&&out.m7.coinStays,'M7 '+JSON.stringify(out.m7));

/* ---- M6 armory starters ---- */
out.m6=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const r={};const ros=rosterOf(pm).filter(g=>!g.loanFrom);ros.forEach(g=>{g.slot95=null;g.inj=null});ros[0].slot95=1;ros[1].slot95=2;ros[2].slot95=3;
  MGR.tab='armory';MGR.ar94=ros[0].id;MGR_REDRAW();await W8(800);r.before=document.querySelectorAll('#ar94 .ar94g.st102').length;
  const other=document.querySelector(`#ar94 .ar94g[data-ar94g="${ros[5].id}"]`);r.hasOther=!!other;if(other)other.click();await W8(400);
  r.sel=MGR.ar94===ros[5].id;r.after=document.querySelectorAll('#ar94 .ar94g.st102').length;r.num=!!document.querySelector('#ar94 .ar94g.st102[data-st102="II"]');return r});
ok(out.m6.before>=3&&out.m6.after>=3&&out.m6.sel&&out.m6.num,'M6 '+JSON.stringify(out.m6));

/* ---- M8 treated ---- */
out.m8=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const r={};const ros=rosterOf(pm).filter(g=>!g.loanFrom);ros.forEach(g=>{g.inj=null;g.severed=[]});
  const A=ros[0],B=ros[1];A.inj={until:w.week+3,label:'a cut',pen:3};B.inj={until:w.week+3,label:'a bruise',pen:2};A.medWk=w.week;
  MGR.tab='infirm';MGR.inf90=A.id;MGR_REDRAW();await W8(900);const ra=document.querySelector(`.iv90row[data-inf90="${A.id}"]`),rb=document.querySelector(`.iv90row[data-inf90="${B.id}"]`);
  r.a=!!ra&&!!ra.querySelector('.trt103')&&/Treated ✓/.test(ra.textContent);r.b=!!rb&&!rb.querySelector('.trt103');A.inj=null;B.inj=null;A.medWk=null;return r});
ok(out.m8.a&&out.m8.b,'M8 '+JSON.stringify(out.m8));

/* ---- N8 Vulso's cart ---- */
out.n8=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const r={};const saved=rosterOf(pm).map(g=>[g,g.contract]);for(const g of rosterOf(pm))g.contract=null;
  const c0=pm.coin;pm.coin=40;w.cartSpell=0;w.cart=null;emptyBarracksWeek(w,pm);pm.coin=c0;r.cart=!!w.cart;
  const L=(w.letters||[]).find(x=>/^cart-/.test(x.key));r.letter=!!L&&L.adv==='recruiter'&&/data-id="recruit"/.test(L.body)&&/Go to the Recruiting board/.test(L.body);
  MGR.tab='ludus';MGR_REDRAW();await W8(900);r.noBarLudus=!document.querySelector('#mgrBody .cartbox');
  MGR.tab='recruit';MGR_REDRAW();await W8(900);r.barRecruit=!!document.querySelector('#mgrBody .cartbox');
  for(const [g,c] of saved)g.contract=c;w.cart=null;w.cartSpell=0;return r});
ok(out.n8.letter&&out.n8.noBarLudus&&out.n8.barRecruit,'N8 '+JSON.stringify(out.n8));

/* ---- M3 Rivalry Week ---- */
out.m3=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const r={};
  /* a fresh world at week 12 */
  for(const g of w.glads)if(g.contract&&g.contract.mgr===pm.id&&g.src!=='x')g.slot95=null;
  while(wkOf(w.week)<12){if(!await PW()){r.stuck=w.week;return r}}
  r.wk=w.week;const n=w.night;r.riv=!!n&&!!n.rivalry;if(!r.riv)return r;
  const before=n.bouts.map(b=>b.ents.join(',')).join('|');
  await ENS();MGR.tab='night';MGR_REDRAW();await W8(900);
  const dis=[...document.querySelectorAll('#mgrBody [data-mg="enter"],#mgrBody [data-mg="withdraw"]')];r.btn=dis.length===0||dis.every(x=>!!x.dataset.dis&&/Rivalry Week/.test(x.dataset.dis));
  for(const act of ['enter','withdraw']){const bt=document.createElement('button');bt.dataset.mg=act;bt.dataset.id='0';document.querySelector('#mgrBody').appendChild(bt);bt.click();bt.remove();await W8(150)}
  r.same=before===n.bouts.map(b=>b.ents.join(',')).join('|');
  const ros=rosterOf(pm).filter(g=>!g.inj);r.exh=exhibSetup(ros[0]&&ros[0].id)===null;r.deal=travelClick('traveldeal')===false;
  const was=w.night.bouts.map(b=>b.ents.join(',')).join('|');ros.forEach((g,i)=>{g.slot95=(i%3)+1});r.fill=st95Fill(w,pm,true)===0&&was===w.night.bouts.map(b=>b.ents.join(',')).join('|');
  r.noSpecial=!n.bouts.some(b=>b.tier==='spc100');
  /* invitations are pushed off week 12 */
  w.invites=[{id:'ivT',sid:Object.keys(SPECIALS)[0],n:'T',wk:w.week,status:'accepted',ents:[],sent:w.week-3},{id:'ivU',sid:Object.keys(SPECIALS)[0],n:'U',wk:w.week+12,status:'open',ents:[],sent:w.week}];
  const sp0=w.special;specWeekStart(w);r.inv=w.invites[0].wk===w.week+1&&w.invites[1].wk===w.week+13;w.invites=[];w.special=sp0;
  /* the pair stays: a real enter through the normal path still refuses */
  return r});
ok(out.m3.riv&&out.m3.btn&&out.m3.same&&out.m3.exh&&out.m3.deal&&out.m3.fill&&out.m3.noSpecial&&out.m3.inv,'M3 '+JSON.stringify(out.m3));

/* ---- M1 + M2 the Superbus week ---- */
out.sb=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const r={};
  if(!await PW()){r.stuck='w12';return r}
  r.wk=w.week;r.sp=!!w.special&&!!w.special.D.finale;if(!r.sp)return r;r.noSpc=!w.night.bouts.some(b=>b.tier==='spc100');
  await ENS();MGR.tab='ludus';MGR_REDRAW();await W8(900);
  const nb=document.querySelector('.mtabs [data-mg="tab"][data-id="night"]');r.rail=nb?nb.textContent.trim():'';r.railOk=/Superbus Week/.test(r.rail)&&!/Match Week/.test(r.rail)&&nb.classList.contains('sb103');
  const ov=nb&&nb.querySelector('.mcount.c85n');r.ovalHidden=!ov||getComputedStyle(ov).display==='none';
  const lb=document.querySelector('.lu100tt>b');r.ludusBan=lb?lb.textContent.trim():'';const mw=document.querySelector('.lu100mw');r.mw=!!mw&&mw.classList.contains('sb103m')&&/Superbus Week/.test(mw.textContent);
  MGR.tab='night';MGR_REDRAW();await W8(900);
  const rt=document.querySelector('.roomhd.b73-night .roomttl');r.banner=rt?rt.textContent.trim():'';r.bannerOk=/Superbus Week/.test(r.banner)&&!/Match Week/.test(r.banner);
  const sp=document.querySelector('.card2.specbox.sb103c');r.card=!!sp&&!!sp.querySelector('.sb103ban svg.lau')&&/SUPERBUS WEEK/.test(sp.textContent)&&!!sp.querySelector('svg');
  r.bg=sp?getComputedStyle(sp).backgroundImage.slice(0,60):'';
  /* play it out */
  const hold=await PW();r.ended=!!hold;r.revWk=w.review&&w.review.wk;r.hasSb=!!(w.review&&w.review.sb103&&w.review.sb103.champ);
  await ENS();MGR.tab='ludus';MGR_REDRAW();await W8(1000);const sum=document.querySelector('details.rev91 summary');r.title=sum?sum.textContent.trim():'';r.titleOk=/Superbus Week in review/.test(r.title);
  const box=document.querySelector('details.rev91 .sb103rev');r.box=box?box.textContent.trim().slice(0,160):'';r.boxOk=!!box&&/Superbus/.test(box.textContent)&&!!w.finale.champ&&box.textContent.indexOf(w.finale.champ)>=0;
  r.noThirteen=!/Week 13\b|WEEK 13\b|week 13\b/.test(document.getElementById('mgrBody').textContent);
  const P=w.lastPaper;r.paperWk=P&&P.wk;r.sbwk=w.sb103&&w.sb103.wk;r.sbchamp=w.sb103&&w.sb103.champ;r.weekNow=w.week;const ph=paperHTML();r.paperNo13=!/Week 13\b/.test(ph.replace(/<[^>]*>/g,' '));r.lead=P&&P.lead&&P.lead.h;
  r.leadOk=!!P&&/FLAVIUS SUPERBUS/.test(P.lead.h||'')&&P.lead.kind==='super';
  const a=(w.acta102||[]).slice(-1)[0];r.actaLead=a&&a.lead&&a.lead.h;r.actaOk=!!a&&/SUPERBUS/.test(a.lead.h||'');
  MGR.tab='paper';MGR_REDRAW();await W8(1000);const pt=document.getElementById('mgrBody').textContent;r.actaShows=/SUPERBUS/.test(pt)&&!/Week 13\b/.test(pt);
  /* the archive buttons use the calendar week */
  const arc=(w.papers||[]).length;r.arc=arc;return r});
ok(out.sb.sp&&out.sb.noSpc,'M2 finale week '+JSON.stringify(out.sb));ok(out.sb.railOk&&out.sb.ovalHidden&&/Superbus Week/.test(out.sb.ludusBan)&&out.sb.mw&&out.sb.bannerOk&&out.sb.card,'M2 labels + card '+JSON.stringify(out.sb));
ok(out.sb.ended&&out.sb.hasSb&&out.sb.titleOk&&out.sb.boxOk&&out.sb.noThirteen,'M1 review '+JSON.stringify(out.sb));ok(out.sb.paperNo13&&out.sb.leadOk&&out.sb.actaOk&&out.sb.actaShows,'M1 acta '+JSON.stringify(out.sb));

/* ---- shot for the eye ---- */
if(process.env.SHOT){await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR.tab='ludus';MGR_REDRAW();await W8(800)});await pg.screenshot({path:process.env.SHOT+'/v103_ludus.png'})}

/* ---- the kill switch ---- */
const pg2=await open(true);
out.off=await ev(pg2,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};MGR.tab='ludus';MGR_REDRAW();await W8(900);const mh=document.querySelector('.badges.mhead');r.fighters=!!mh&&/\b\d+ fighters?\b/i.test(mh.textContent);
  const tl=[...document.querySelectorAll('.lu100tiles>.lu100t')].map(x=>[...x.classList].find(c=>/^k-/.test(c)));r.order=tl.indexOf('k-promote')<tl.indexOf('k-armory');r.capOff=cap103Why()==='';return r});
ok(out.off.fighters&&out.off.order&&out.off.capOff,'kill switch '+JSON.stringify(out.off));

for(const p of [pg,pg2])out.errs=(out.errs||[]).concat(await p.evaluate(()=>typeof errNew92==='function'?errNew92(window.RM_MARK).map(e=>e.kind+':'+e.msg):[]));
ok(!out.errs.length,'00c errors '+JSON.stringify(out.errs));
console.log(JSON.stringify(out,null,1).slice(0,5000));console.log('PAGEERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));
await b.close();process.exit(miss.length||errs.length?1:0)})();

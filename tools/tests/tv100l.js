/* tv100l — MY LUDUS (294-v100ludus + 294a scenes): the week banner (Week N · Match Week, the Match Week card with bout chips: face, name,
   fatigue dot; a click opens Match Week; a bye shows the stone plate), the Weekly tasks parchment = 270's desk rows (same count as
   ludusTodo73, progress done/all, pinned to the tiles on desktop and scrolling inside with "▾ N more"), the 📬 Letters drawer (270's letters,
   opened by the button or by any letter opening), the tiles (Team → Roster, Promote/Upgrade School → their run panel under the tiles with ✕,
   Armory → the Armory tab), the bronze frieze (#council83 with 6 heads; an unread advisor letter lights his head), the popover (level,
   ⬆ Train for coin = 249's handler, the earned line at Lv 3, 📜 Read it opens the letter, Esc closes), the advisor level effects
   (Doctore yard level, Medicus wounds, Consilium / Clerk week-end lines), phones (390: one column, 6 rows + fold, bottom-sheet popover,
   no sideways scroll) and the kill switch flavius_ludus100off=1 (270's page).
   v1.0 round 2: runs with flavius_ludus2100off=1 — 297's own switch must give back exactly this page (297 itself: tv100l2). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_deskgrp101off','1');localStorage.setItem('flavius_ludus2100off','1');if(o)localStorage.setItem('flavius_ludus100off','1')},off?1:0);
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
    const w=W_(),pm=me(),ros=rosterOf(pm);w.welc99=1;ros[0].inj={until:w.week+2,label:'a gashed thigh',pen:3};pm.perkPts=2;w.train='off';ros[1].fat=10;ros[2].fat=45;ros[3].fat=75;
    w.night.bouts.filter(b=>b.tier!=='spc100'&&!b.any100).forEach((b,i)=>{b.ents=b.ents.filter(id=>!ros.some(g=>g.id===id));b.ents.push(ros[i+1].id)});
    sendLetter(w,{key:'t100clerk',kind:'letter',from:'your clerk',seal:'📜',title:'A note on the wages',body:'<p>Two contracts end soon.</p>',until:w.week});
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}menuHide();openManager('ludus');await W8(1000);MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(500)});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
/* ---------- desktop ---------- */
const pg=await open(1440,900);
const A=await ev(pg,()=>{const q=s=>document.querySelector(s);const ban=q('.roomhd.b73-ludus.lu100ban');const card=ban&&ban.querySelector('.lu100mw[data-mg="tab"][data-id="night"]');const chips=card?[...card.querySelectorAll('.bc')].filter(c=>c.querySelector('u')) /* v1.0: 296 special chips carry no fighter */:[];
  const ros=rosterOf(me());const desk=q('#desk99.lu100tasks');const rows=desk?desk.querySelectorAll('.dk99tw>.dk99row').length:0;const tiles=q('.lu100tiles');
  const dr=desk.getBoundingClientRect(),tr=tiles.getBoundingClientRect();
  return {ban:!!ban&&/Week 1 · Match Week/.test(ban.textContent)&&!!ban.querySelector('.lu100med')&&ban.textContent.includes(String(ludusTodo73())),card:!!card,
    chips:chips.length===3&&chips.every((c,i)=>c.textContent.includes(ros[i+1].name)&&!!c.querySelector('u svg, u img')),dots:chips.map(c=>(c.querySelector('s.fd')||{}).className||''),
    rows,todo:ludusTodo73(),prog:(q('.lu100n2')||{}).textContent||'',hd:/Weekly tasks/.test(desk.querySelector('.dk99hd').textContent),
    pinned:Math.abs(dr.height-tr.height)<3&&Math.abs(dr.top-tr.top)<3,tiles:[...tiles.querySelectorAll(':scope>.lu100t')].map(t=>t.getAttribute('data-mg')+':'+(t.getAttribute('data-id')||'')),
    sc:document.querySelectorAll('.lu100t img.sc100').length,drawerHidden:getComputedStyle(desk.querySelector('.lu100mail')).display==='none',
    letters:!!desk.querySelector('.lu100mail .dk99lt details.mail'),old:!q('#mgrPane .rundash')&&!q('#mgrPane>#council83'),fz:document.querySelectorAll('.lu100t.k-adv #council83.lu100fz .c83p').length+document.querySelectorAll('.lu100t.k-adv .cap>.c83p').length, /* v1.02: Consilium at the strip's bottom left */
    lit:[...document.querySelectorAll('.lu100t.k-adv .c83p.lit')].map(x=>x.dataset.c83),cnt:(q('.lu100t.k-adv .cnt')||{}).textContent||'',doc:document.documentElement.scrollWidth<=1440}});
ok(A.ban&&A.card,'banner + Match Week card '+JSON.stringify(A));ok(A.chips&&A.dots[0].includes('fresh')&&A.dots[1].includes('tired')&&A.dots[2].includes('worn'),'bout chips: face, name, fatigue dot');
ok(A.rows===A.todo&&A.rows>=3&&A.hd&&new RegExp('^\\d+/\\d+$').test(A.prog),'parchment = the desk rows');ok(A.pinned,'parchment pinned to the tiles');
ok(A.tiles.join()==='tab:roster,tab:armory,run:fac,run:promote,null:','five tiles (v1.03 N9a: Armory and Promote swapped) '+A.tiles);ok(A.sc===4,'scene art on the four tiles');ok(A.drawerHidden&&A.letters&&A.old,'letters in the closed drawer, old council/dash gone');
ok(A.fz===6&&A.lit.includes('clerk')&&/lit/.test(A.cnt),'bronze frieze, the clerk lit');ok(A.doc,'no sideways scroll');
/* the drawer */
const M=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const d=document.querySelector('#desk99');document.querySelector('[data-lu100mail="1"]').click();await W8(100);const shown=getComputedStyle(d.querySelector('.lu100mail')).display!=='none';
  const r=d.querySelector('.lu100mail').getBoundingClientRect(),t=document.querySelector('.lu100tiles').getBoundingClientRect();const over=r.left>=t.left-2&&r.right<=t.right+2;
  document.querySelector('[data-lu100mail="0"]').click();await W8(100);const shut=getComputedStyle(d.querySelector('.lu100mail')).display==='none';
  const det=d.querySelector('.lu100mail details.mail');det.open=true;await W8(200);const auto=getComputedStyle(d.querySelector('.lu100mail')).display!=='none';det.open=false;document.querySelector('[data-lu100mail="0"]').click();return {shown,over,shut,auto}});
ok(M.shown&&M.over&&M.shut&&M.auto,'letters drawer over the tiles '+JSON.stringify(M));
/* tiles */
const T=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};
  document.querySelector('.lu100t[data-id="promote"]').click();await W8(300);r.promote=!!document.querySelector('.lu100panel [data-mg="feast2"]');
  document.querySelector('.lu100t[data-id="fac"]').click();await W8(300);r.fac=!!document.querySelector('.lu100panel [data-mg="build"]')&&!document.querySelector('.lu100panel [data-mg="feast2"]');
  document.querySelector('[data-lu100panel]').click();await W8(300);r.shut=!document.querySelector('.lu100panel');
  document.querySelector('.lu100t[data-id="roster"]').click();await W8(300);r.roster=MGR.tab==='roster';MGR.tab='ludus';MGR_REDRAW();await W8(200);
  document.querySelector('.lu100t[data-id="armory"]').click();await W8(300);r.armory=MGR.tab==='armory';MGR.tab='ludus';MGR_REDRAW();await W8(200);
  document.querySelector('.lu100mw').click();await W8(300);r.night=MGR.tab==='night';MGR.tab='ludus';MGR_REDRAW();await W8(300);return r});
ok(T.promote&&T.fac&&T.shut,'run tiles open their panel under the tiles '+JSON.stringify(T));ok(T.roster&&T.armory&&T.night,'tab tiles + Match Week card');
/* the popover */
const P=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const r={};const a=council83(w).find(x=>x.k==='recruiter');a.lv=1;m.coin=500;MGR_REDRAW();await W8(200);
  document.querySelector('.c83p[data-c83="recruiter"]').click();await W8(300);let p=document.getElementById('lu100pop');r.open=!!p&&p.textContent.includes(a.name)&&/Lv 1/.test(p.textContent);
  const pr=p.getBoundingClientRect(),hr=document.querySelector('.c83p[data-c83="recruiter"]').getBoundingClientRect();r.above=pr.bottom<=hr.top+20;
  const c0=m.coin;p.querySelector('[data-c98up="recruiter"]').click();await W8(300);r.train=a.lv===2&&m.coin===c0-REC98.up[1];
  a.lv=3;MGR_REDRAW();await W8(300);p=document.getElementById('lu100pop');r.earned=!!p&&/Level 4 is earned/.test(p.textContent)&&!p.querySelector('[data-c98up]');
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await W8(300);r.esc=!document.getElementById('lu100pop');
  /* the lit clerk: Read it opens the letter in the drawer */
  document.querySelector('.c83p[data-c83="clerk"]').click();await W8(300);p=document.getElementById('lu100pop');const rd=p&&p.querySelector('[data-lu100read]');r.say=!!rd&&/A note on the wages/.test(p.textContent);
  if(rd)rd.click();await W8(400);const d=document.querySelector('#desk99 details.mail[data-mail="L:t100clerk"]');r.read=!!d&&d.open&&getComputedStyle(document.querySelector('#desk99 .lu100mail')).display!=='none'&&(w.mailRead||[]).includes('L:t100clerk');
  document.querySelector('[data-lu100mail="0"]').click();MGR_REDRAW();await W8(300);r.unlit=!document.querySelector('#council83 .c83p.lit[data-c83="clerk"]');
  /* the keyboard */
  const h=document.querySelector('.c83p[data-c83="doctore"]');h.focus();h.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await W8(300);r.key=!!document.getElementById('lu100pop')&&/Doctore/.test(document.getElementById('lu100pop').textContent);
  LU100.pop=null;MGR_REDRAW();await W8(200);return r});
ok(P.open&&P.above,'head → popover above it '+JSON.stringify(P));ok(P.train,'⬆ Train for coin (249) from the popover');ok(P.earned,'Lv 3: the earned line');ok(P.esc,'Esc closes');
ok(P.say&&P.read&&P.unlit,'lit advisor: Read it opens the letter, then he goes dark');ok(P.key,'Enter on a head');
/* a long list scrolls inside the parchment */
const L=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();for(let i=0;i<10;i++)sendLetter(w,{key:'t100l'+i,kind:'letter',from:'the tester',seal:'🧭',title:'Task '+i,body:'<p>x</p>',until:w.week,act:{ic:'🧭',line:'<b>Long task '+i+'</b>',tier:3}});
  MGR_REDRAW();await W8(400);const d=document.querySelector('#desk99'),sc=d.querySelector('.lu100tl'),t=document.querySelector('.lu100tiles');const mb=d.querySelector('.lu100more');
  return {rows:sc.querySelectorAll('.dk99row').length,todo:ludusTodo73(),scroll:sc.scrollHeight>sc.clientHeight+20,pinned:Math.abs(d.getBoundingClientRect().height-t.getBoundingClientRect().height)<3,more:!!mb&&!mb.hidden&&/more/.test(mb.textContent)}});
ok(L.rows===L.todo&&L.scroll&&L.pinned&&L.more,'long list scrolls inside '+JSON.stringify(L));
/* advisor effects */
const E=await ev(pg,async()=>{const w=W_(),m=me();const C=council83(w);const set=(k,l)=>{C.find(x=>x.k===k).lv=l};const r={};
  set('doctore',1);const d1=y92DocLv(w,m);set('doctore',4);const d4=y92DocLv(w,m);r.doc=[d1,d4];
  const g=rosterOf(m)[4];set('medicus',3);g.inj={until:w.week+4,label:'a cut',pen:1};med100Apply(w,m);const u1=g.inj.until;med100Apply(w,m);r.med=[u1-w.week,g.inj.until===u1];
  set('medicus',5);const g2=rosterOf(m)[3];g2.inj={until:w.week+2,label:'a cut',pen:1};med100Apply(w,m);r.med2=g2.inj.until-w.week;delete g.inj;delete g2.inj;
  r.fx=['consilium','doctore','medicus','clerk','barracks'].map(k=>adv100Fx(k,1)!==adv100Fx(k,3));
  set('consilium',3);set('clerk',3);set('barracks',3);for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i);w.pend=[];if(w.special)w.special.done=true;
  const n0=(w.tlog||[]).length;const res=await endWeek();const L=(w.tlog||[]).map(x=>x.text).join(' | ');r.end=[res!==false,/better terms/.test(L),/haggled/.test(L)];return r});
ok(E.doc[1]===Math.min(6,E.doc[0]+2),'Doctore level adds to the yard '+JSON.stringify(E));ok(E.med[0]===3&&E.med[1]&&E.med2===1,'Medicus: new wounds close sooner, once, never before next week');
ok(E.fx.every(Boolean),'every advisor level says what it does');ok(E.end.every(Boolean),'Consilium + Clerk pay at the week end');
await pg.close();
/* ---------- a bye ---------- */
const pb=await open(1440,900);
const B=await ev(pb,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));byeSetup(W_());MGR_REDRAW();await W8(400);const s=document.querySelector('.lu100ban .lu100mw.stone');
  return {stone:!!s&&/No games/.test(s.textContent)&&!document.querySelector('.lu100ban button.lu100mw'),title:/Bye week/.test(document.querySelector('.lu100ban').textContent)}});
ok(B.stone&&B.title,'bye: the stone plate '+JSON.stringify(B));await pb.close();
/* ---------- phone ---------- */
const pp=await open(390,844);
const F=await ev(pp,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();for(let i=0;i<5;i++)sendLetter(w,{key:'t100p'+i,kind:'letter',from:'the tester',seal:'🧭',title:'Task '+i,body:'<p>x</p>',until:w.week,act:{ic:'🧭',line:'<b>Phone task '+i+'</b>',tier:3}});MGR_REDRAW();await W8(400);const rows=[...document.querySelectorAll('#desk99 .dk99tw>.dk99row')];const sh=e=>e.getClientRects().length>0;const vis=rows.filter(sh).length;
  const g=document.querySelector('#mgrPane>.lu100');const cols=getComputedStyle(g).gridTemplateColumns.split(' ').length;
  const fz=document.querySelector('#council83.lu100fz');const fr=fz.getBoundingClientRect();const heads=[...fz.querySelectorAll('.c83p')].every(h=>{const r=h.getBoundingClientRect();return r.width>0&&r.right<=fr.right+1&&r.left>=fr.left-1});
  document.querySelector('.c83p[data-c83="consilium"]').click();await W8(300);const p=document.getElementById('lu100pop');const pr=p?p.getBoundingClientRect():null;
  const sheet=!!pr&&pr.left<=1&&pr.right>=389&&Math.abs(pr.bottom-innerHeight)<3&&!!document.querySelector('.lu100scrim');
  document.querySelector('.lu100scrim').click();await W8(300);
  return {cols,n:rows.length,vis,heads,sheet,closed:!document.getElementById('lu100pop'),doc:document.documentElement.scrollWidth<=390,bcw:[...document.querySelectorAll('.lu100mw .bc')].every(c=>c.getBoundingClientRect().right<=391)}});
ok(F.cols===1&&F.heads&&F.doc&&F.bcw,'390: one column, six heads, no sideways scroll '+JSON.stringify(F));ok(F.n>6&&F.vis===6,'390: 6 rows then the fold');ok(F.sheet&&F.closed,'390: popover = bottom sheet, the scrim closes it');
await pp.close();
/* ---------- kill switch ---------- */
const po=await open(1440,900,true);
const K=await ev(po,()=>({ban:!!document.querySelector('.lu100ban'),desk:!!document.querySelector('#desk99')&&!document.querySelector('#desk99.lu100tasks'),council:!!document.querySelector('#mgrPane>#council83')}));
ok(!K.ban&&K.desk&&K.council,'kill switch → the v0.99 page '+JSON.stringify(K));await po.close();
console.log(JSON.stringify({A,M,T,P,L,E,B,F,K}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

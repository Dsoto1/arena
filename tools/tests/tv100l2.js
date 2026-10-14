/* tv100l2 — MY LUDUS round 2 (297-v100ludus2): each advisor's popover lists HIS buildings (LU2_FAC) and builds them with 23's own
   button (coin spent, level up, one project a week), the 🏗 marker on heads with an affordable building, the Upgrade School tile opens the
   Consilium's overview (every building by advisor → that advisor's popover), the header ledger badge counts the Clerk's rebate
   ("(−N Clerk)", weekMoney().clerk), the Roster + Armory banners wear 294a's scenes (team / armory), the Consilium's counsel (lit head,
   Read it, the counsel button → the panel under the tiles, dark after reading) and the Ledger (Clerk's popover + the header badge from any
   tab), phones (bottom sheet, every Build button reachable, no sideways scroll) and the kill switch flavius_ludus2100off=1 (294's page). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_ludus2100off','1')},off?1:0);
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
    const w=W_(),pm=me();w.welc99=1;pm.coin=900;pm.fac={};delete pm.facWk;const C=council83(w);for(const a of C)a.lv=1;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}menuHide();openManager('ludus');await W8(1000);MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(500)});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const pg=await open(1440,900);
/* buildings per advisor + markers + the school tile */
const A=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={per:{},mk:[]};
  r.mk=[...document.querySelectorAll('#council83 .c83p .c83f>.lu2bm')].map(x=>x.closest('.c83p').dataset.c83).sort();
  for(const k of ['doctore','medicus','barracks','clerk','recruiter']){LU100.pop=k;MGR_REDRAW();await W8(250);const p=document.getElementById('lu100pop');r.per[k]=p?[...p.querySelectorAll('[data-mg="build"]')].map(x=>x.dataset.id).sort().join():'-'}
  LU100.pop=null;MGR_REDRAW();await W8(200);const t=document.querySelector('.lu100t.k-school');r.tile=!!t&&t.dataset.lu100adv==='consilium'&&!t.hasAttribute('data-mg');
  t.click();await W8(300);let p=document.getElementById('lu100pop');r.ov=!!p&&!!p.querySelector('.lu2ov')&&p.querySelectorAll('.lu2o[data-lu100adv]').length===4&&/Ludus grade/.test(p.textContent);
  p.querySelector('.lu2o[data-lu100adv="medicus"]').click();await W8(300);p=document.getElementById('lu100pop');r.jump=LU100.pop==='medicus'&&!!p&&!!p.querySelector('[data-mg="build"][data-id="valet"]');
  r.links=!document.querySelector('.lu100lk [data-id="consil"],.lu100lk [data-id="ledger"]');return r});
ok(A.per.doctore==='stands,yard'&&A.per.medicus==='kitchen,valet'&&A.per.barracks==='armory,barracks,shrine'&&A.per.clerk==='stables'&&A.per.recruiter==='','buildings per advisor '+JSON.stringify(A));
ok(A.mk.join()==='barracks,clerk,doctore,medicus','🏗 marker on the four builders');ok(A.tile&&A.ov&&A.jump,'Upgrade School → the Consilium overview → an advisor');ok(A.links,'counsel + Ledger left the links row');
/* build from the popover: coin, level, one a week */
const B=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const r={};LU100.pop='doctore';MGR_REDRAW();await W8(250);const c0=m.coin;
  document.querySelector('#lu100pop [data-mg="build"][data-id="yard"]').click();await W8(500);r.built=facLvl(m,'yard')===1&&m.coin===c0-FAC_COST[0]&&m.facWk===w.week;
  let p=document.getElementById('lu100pop');r.stay=LU100.pop==='doctore'&&!!p&&/Build II/.test(p.textContent);
  LU100.pop='clerk';MGR_REDRAW();await W8(250);const s=document.querySelector('#lu100pop [data-mg="build"][data-id="stables"]');r.busy=!!s&&!!s.dataset.dis;const c1=m.coin;s.click();await W8(400);r.once=facLvl(m,'stables')===0&&m.coin===c1;
  r.mk=document.querySelectorAll('#council83 .lu2bm').length;LU100.pop=null;MGR_REDRAW();await W8(200);return r});
ok(B.built&&B.stay,'Build from the popover: coin spent, level up '+JSON.stringify(B));ok(B.busy&&B.once&&B.mk===0,'one project a week');
/* the Clerk's rebate in the header badge */
const C=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const r={};const bd=()=>(document.querySelector('.badge.ledger')||{}).textContent||'';
  r.lv1=!/Clerk/.test(bd())&&!weekMoney().clerk;council83(w).find(a=>a.k==='clerk').lv=3;MGR_REDRAW();await W8(250);const R=lu2Rebate(w,me());const M=weekMoney();
  r.R=R;r.txt=bd();r.badge=R>0&&M.clerk===R&&r.txt.includes(`(−${R} Clerk)`)&&r.txt.includes(`wages ${M.wages}`);
  LU100.pop='clerk';MGR_REDRAW();await W8(250);const p=document.getElementById('lu100pop');r.pop=!!p&&p.textContent.includes(`rebate −${R}`);return r});
ok(C.lv1&&C.badge&&C.pop,'Clerk rebate in the ledger badge '+JSON.stringify(C));
/* Ledger: v1.01 (317): inside the Clerk's popover, and the badge from another tab opens that popover (nothing under the tiles) */
const L=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};LU100.pop='clerk';MGR_REDRAW();await W8(300);r.pop=!!document.querySelector('#lu100pop .led101')&&!document.querySelector('#mgrPane .lu100panel');LU100.pop=null;
  MGR.tab='league';MGR_REDRAW();await W8(300);document.querySelector('.badge.ledger[data-lu2led]').click();await W8(400);
  r.badge=MGR.tab==='ludus'&&LU100.pop==='clerk'&&!!document.querySelector('#lu100pop .led101')&&!document.querySelector('#mgrPane .lu100panel');LU100.pop=null;LU100.panel=null;MGR_REDRAW();await W8(200);return r});
ok(L.pop&&L.badge,'Ledger from the Clerk and the badge '+JSON.stringify(L));
/* counsel: v1.01 — his counsel lives inside his popover; the head lights for a warning and darkens once read */
const K=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const r={};const lit=()=>!!document.querySelector('#council83 .c83p.lit[data-c83="consilium"]');
  delete w.lu2c;w.loan=null;m.coin=900;MGR_REDRAW();await W8(250);r.quiet=!lit()&&lu2Counsel(w)===null;
  LU100.pop='consilium';MGR_REDRAW();await W8(250);r.always=!!document.getElementById('lu100pop').querySelector('.cn101 .cons');LU100.pop=null;
  m.coin=-5;MGR_REDRAW();await W8(250);r.lit=lit();
  LU100.pop='consilium';MGR_REDRAW();await W8(250);const p=document.getElementById('lu100pop');const rd=p.querySelector('[data-lu100read^="lu2:"]');r.rd=!!rd;rd.click();await W8(400);
  r.panel=w.lu2c===w.week&&!lit()&&LU100.pop==='consilium'&&!document.querySelector('#mgrPane .lu100panel');
  LU100.pop=null;LU100.panel=null;m.coin=900;MGR_REDRAW();await W8(200);return r});
ok(K.quiet&&K.always&&K.lit&&K.rd&&K.panel,'Consilium counsel: lit, read, inside his popover '+JSON.stringify(K));
/* banners */
const N=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};MGR.tab='roster';MGR_REDRAW();await W8(400);let h=document.querySelector('.roomhd.b73-roster');
  r.roster=!!h&&!!h.querySelector('img.lu2ban[data-sc100^="team|banner"]')&&!h.querySelector(':scope>svg')&&/roster/i.test(h.querySelector('.roomttl').textContent);
  MGR.tab='armory';MGR_REDRAW();await W8(400);h=document.querySelector('.roomhd.b73-armory');r.armory=!!h&&!!h.querySelector('img.lu2ban[data-sc100^="armory|banner"]')&&!h.querySelector('.ab96glow')&&/Armory/.test(h.querySelector('.roomttl').textContent);
  MGR.tab='ludus';MGR_REDRAW();await W8(300);return r});
ok(N.roster&&N.armory,'Roster + Armory banners = the new scenes '+JSON.stringify(N));
await pg.close();
/* phone */
const pp=await open(390,844);
const F=await ev(pp,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));LU100.pop='doctore';MGR_REDRAW();await W8(300);const p=document.getElementById('lu100pop');const pr=p.getBoundingClientRect();
  const sheet=pr.left<=1&&pr.right>=389&&Math.abs(pr.bottom-innerHeight)<3;const bs=[...p.querySelectorAll('[data-mg="build"]')];bs.forEach(x=>x.scrollIntoView({block:'nearest'}));await W8(100);
  const reach=bs.length===2&&bs.every(x=>{const r=x.getBoundingClientRect();return r.right<=390&&r.bottom<=innerHeight&&r.top>=pr.top-1});
  LU100.pop='consilium';MGR_REDRAW();await W8(300);const p2=document.getElementById('lu100pop');const g=p2.querySelector('.lu2g').getBoundingClientRect();
  return {sheet,reach,grid:g.right<=390,doc:document.documentElement.scrollWidth<=390}});
ok(F.sheet&&F.reach&&F.grid&&F.doc,'390: bottom sheet, buildings fit '+JSON.stringify(F));await pp.close();
/* kill switch */
const po=await open(1440,900,true);
const Z=await ev(po,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const t=document.querySelector('.lu100t.k-school');const r={tile:!!t&&t.dataset.mg==='run'&&t.dataset.id==='fac',links:!!document.querySelector('.lu100lk [data-id="consil"]')&&!!document.querySelector('.lu100lk [data-id="ledger"]'),
  mk:!document.querySelector('.lu2bm'),badge:!document.querySelector('[data-lu2led]')};MGR.tab='roster';MGR_REDRAW();await W8(300);r.ban=!document.querySelector('img.lu2ban');MGR.tab='ludus';MGR_REDRAW();return r});
ok(Object.values(Z).every(Boolean),'kill switch → 294 page '+JSON.stringify(Z));await po.close();
console.log(JSON.stringify({A,B,C,L,K,N,F,Z}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

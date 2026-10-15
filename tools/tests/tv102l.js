/* tv102l — v1.02 L (343-v102loans): 1 at most 4 of a house's fighters out on loan (the 5th lend refused, the Lend pickers say why; a rival
   house with four out cannot lend you a fifth) · 2 the weekly market: demand moves week to week (hash, not the dice), a short-handed / hurt
   roster pays more, a glut pays less; the Lend picker shows this week's price · 3 studs lend for real profit: a 70/80/90-rated bench fighter's
   fee in a good week is > 0 to the lender (the borrower pays the wage) and below what he would earn as a starter (loan102Starter) ·
   4 the Clerk's advice: none below Clerk level 3, a 💰 desk row at level 3+ in a good week, the best week ahead named at the top level, its
   button lends · 5 kill switch flavius_v102loff=1 · ERRS []. */
const path=require('path');const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
async function page(off){const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v102loff','1')},off);
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+path.resolve(process.argv[2]));await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;window.mToast=t=>{window.__toast=String(t)}});return p}
const p=await page(false);const mark=await p.evaluate(()=>ERR92.n);
const r=await p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const o={};pm.coin=5000;
  for(const g of freeAgents().filter(g=>!g.inj).slice(0,7))signGlad(g,askWage(g),12,0,false);
  const bench=()=>rosterOf(pm).filter(g=>!g.slot95&&!g.inj&&!g.loanFrom&&g.contract.mgr===pm.id);
  const houses=w.mgrs.filter(m=>!m.isPlayer&&!m.dead&&!isRival(m));for(const m of houses)m.opinion=Math.max(m.opinion||0,60);
  /* 2 · the market */
  const H=houses[0];const ds=[];for(let k=0;k<8;k++)ds.push(loan102Demand(w,H,w.week+k));o.moves=new Set(ds).size>=4;o.ds=ds;
  const inj0=rosterOf(H).map(g=>g.inj);const dFull=loan102Demand(w,H);for(const g of rosterOf(H))g.inj={until:w.week+3,label:'test',pen:1};const dHurt=loan102Demand(w,H);rosterOf(H).forEach((g,i)=>{g.inj=inj0[i]});
  o.short=dHurt>dFull;o.dd=[dFull,dHurt];
  const fake=[];for(let i=0;i<10;i++){const g=w.glads.find(x=>x.alive&&!x.loanFrom&&x.contract&&!rosterOf(pm).includes(x)&&!fake.includes(x));if(g){g.loanFrom={mid:'zz',fee:1,weeks:9};fake.push(g)}}
  const dGlut=loan102Demand(w,H);for(const g of fake)delete g.loanFrom;o.glut=dGlut<dFull;o.dg=dGlut;
  /* 3 · studs: 70 / 80 / 90 */
  const A=bench()[0];o.studs={};for(const t of [70,80,90]){const ovr0=A.ovr;A.ovr+=t-effOvr(A);let best=null;
    for(let k=0;k<24;k++)for(const m of houses){const d=loan102Demand(w,m,w.week+k);if(d<LOAN102.good)continue;const fee=loan102Fee(w,A,m,w.week+k);if(!best||fee>best.fee)best={fee,d}}
    o.studs[t]={r:effOvr(A),base:loanFee(A),goodFee:best&&best.fee,demand:best&&best.d,starter:loan102Starter(A),wage:A.contract.wage};A.ovr=ovr0}
  o.studOk=[70,80,90].every(t=>{const s=o.studs[t];return s.goodFee>0&&s.goodFee>s.base&&s.goodFee<s.starter})&&o.studs[90].goodFee>o.studs[70].goodFee;
  /* lending: the borrower pays the wage, the fee goes to the lender */
  const L=bench()[0],m0=houses.find(m=>rosterOf(m).length<9);const fee=loan102Fee(w,L,m0);lendTo(L,m0,loanFee(L),3);o.lent=L.loanFrom&&L.loanFrom.fee===fee&&L.contract.mgr===m0.id;
  const c0=pm.coin;loansWeek(w,pm);o.paid=pm.coin-c0>=Math.min(fee,Math.max(0,m0.coin+fee));
  /* 2 · the picker shows this week's price */
  MGR.tab='roster';MGR_REDRAW();await W8(400);const opt=[...document.querySelectorAll('select[data-m47lend] option[value]')].find(x=>x.value);
  if(opt){const g=gById(opt.closest('select').dataset.m47lend),m=mgrById(opt.value);o.pick=opt.textContent.includes(loan102Fee(w,g,m)+'/wk')}else o.pick='nopicker';
  /* 1 · the cap */
  for(const g of bench()){if(loan102Out(w,pm)>=4)break;lendTo(g,houses.find(m=>rosterOf(m).length<9),loanFee(g),3)}o.out4=loan102Out(w,pm)===4;
  const X=bench()[0];window.__toast='';o.fifth=X&&!lendTo(X,m0,loanFee(X),3)&&!X.loanFrom&&/four/i.test(window.__toast);
  MGR_REDRAW();await W8(400);o.pickFull=!document.querySelector('#mgrPane select[data-m47lend]')&&!!document.querySelector('#mgrPane .l102full');
  /* a rival house with four out cannot lend a fifth */
  const R=houses.find(m=>m!==m0);for(const g of freeAgents().filter(g=>!g.inj))if(rosterOf(R).length<6)g.contract={mgr:R.id,wage:3,weeks:10,since:w.week};if(R&&rosterOf(R).length>=5){const rs=rosterOf(R);for(let i=0;i<4;i++)rs[i].loanFrom={mid:R.id,fee:3,weeks:5},rs[i].contract.mgr=houses.find(z=>z!==R).id;
    const y=rosterOf(R).find(g=>!g.loanFrom);o.rivCap=!!y&&!borrowFrom(y,R,5,3);for(let i=0;i<4;i++){rs[i].contract.mgr=R.id;delete rs[i].loanFrom}}else o.rivCap='none';
  /* 4 · the Clerk */
  for(const g of w.glads)if(g.loanFrom&&g.loanFrom.mid===pm.id){g.contract.mgr=pm.id;delete g.loanFrom}
  const C=council83(w).find(x=>x.k==='clerk');const good0=LOAN102.good;LOAN102.good=0;
  const row=()=>weekChecklist().find(x=>x.ic==='💰');C.lv=1;o.lowNone=!row();C.lv=2;o.lv2None=!row();C.lv=3;const R3=row();o.lv3=!!R3&&/market-worthy/.test(R3.txt)&&!/better still|best price/.test(R3.txt)&&R3.btn.includes('data-l102lend');
  C.lv=(REC98&&REC98.lvMax)||5;const R5=row();o.top=!!R5&&/better still|best price/.test(R5.txt);o.t5=R5&&R5.txt;
  /* a bad market: no advice */
  LOAN102.good=99;o.badNone=!row();LOAN102.good=0;
  /* the button lends */
  MGR.tab='ludus';MGR_REDRAW();await W8(500);const bt=document.querySelector('#mgrPane [data-l102lend]');let gid=null;if(bt){gid=bt.dataset.l102lend.split('|')[0];bt.click();await W8(300)}o.btn=!!bt&&!!gById(gid).loanFrom;
  LOAN102.good=good0;return o});
console.log(JSON.stringify(r));
ok(r.moves,'2 demand moves week to week '+JSON.stringify(r.ds));ok(r.short,'2 a hurt roster pays more '+JSON.stringify(r.dd));ok(r.glut,'2 a glut pays less '+r.dg);ok(r.pick===true,'2 the Lend picker shows this week\'s price '+r.pick);
ok(r.studOk,'3 studs lend for profit, below a starter\'s earnings '+JSON.stringify(r.studs));ok(r.lent&&r.paid,'3 a lend at the market price pays the lender');
ok(r.out4&&r.fifth,'1 the fifth lend is refused with the reason');ok(r.pickFull,'1 the Lend pickers say why when full');ok(r.rivCap===true,'1 a house with four out lends no fifth '+r.rivCap);
ok(r.lowNone&&r.lv2None,'4 no advice below Clerk level 3');ok(r.lv3,'4 the Clerk advises at level 3');ok(r.top,'4 the top-level Clerk names the best week '+r.t5);ok(r.badNone,'4 no advice in a poor market');ok(r.btn,'4 the advice button lends');
const e1=await p.evaluate(m=>ERR92.n-m,mark);ok(e1===0,'no new error-log entries ('+e1+')');
const q=await page(true);const k=await q.evaluate(()=>({off:typeof loan102Fee==='undefined'&&LOAN102.on===false}));ok(k.off,'5 kill switch');
console.log(JSON.stringify({miss}));console.log(miss.length?'FAIL':'PASS');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})()

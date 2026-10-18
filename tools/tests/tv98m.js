/* v0.98 Manager fixes (251-v98mgrfix): 1 catch-up overlay with progress (appears, "Week k of n" + headline, gone after, also on error) and weeks advance ·
   2 Vulso's cart: a 3rd buy is refused (button gone, handler refuses) · 3 the League podium sits inside the banner, no separate block below.
   SHOT=dir saves screenshots (default tools/plans/mgr98). */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e.message)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const W=ms=>pg.waitForTimeout(ms);const SHOT=process.env.SHOT||path.join(__dirname,'..','plans','mgr98');require('fs').mkdirSync(SHOT,{recursive:true});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));let sd=98;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;me().coin=3000;MGR.tab='ludus';MGR_REDRAW();await W8(400)});
/* ---- 1 · catch-up overlay ---- */
const r1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const o={};const w0=w.week;calLag=()=>2;
  const seen=[];const iv=setInterval(()=>{const e=document.getElementById('cu98');if(e)seen.push({k:e.querySelector('.cu98k').textContent,t:e.querySelector('.cu98t').textContent,bar:e.querySelector('.cu98bar i').style.width,h:e.querySelector('.cu98h').textContent})},20);
  window.__cuShot=()=>0;const p=catchUpWeeks();await W8(150);o.during=!!document.getElementById('cu98');o.blocked=getComputedStyle(document.getElementById('cu98')||document.body).position==='fixed';
  window.__shotReady=true;const r=await p;clearInterval(iv);o.after=!document.getElementById('cu98');o.weeks=r.weeks;o.adv=w.week-w0;o.seen=seen;return o});
ok(r1.during&&r1.after,'1 overlay appears and is removed '+JSON.stringify({d:r1.during,a:r1.after}));ok(r1.weeks===2&&r1.adv===2,'1 two weeks simulated '+r1.weeks+'/'+r1.adv);
ok(r1.seen.length&&/Your doctores run the ludus/.test(r1.seen[0].t)&&r1.seen.some(s=>/Week 2 of 2/.test(s.k)),'1 title + Week k of n '+JSON.stringify(r1.seen.slice(0,3)));
ok(r1.seen.some(s=>/%/.test(s.bar)&&s.bar!=='0%'),'1 the bar moves '+r1.seen.map(s=>s.bar).join());
/* overlay screenshot: freeze one open state */
await pg.evaluate(()=>{calLag=()=>3;window.__p=catchUpWeeks()});await W(250);await pg.screenshot({path:SHOT+'/catchup_overlay.png'});await pg.evaluate(()=>window.__p);
/* error path: overlay removed when the run throws */
const r1e=await pg.evaluate(async()=>{calLag=()=>1;const b0=endWeek;endWeek=async()=>{throw new Error('boom98')};let thrown=false;try{await catchUpWeeks()}catch(e){thrown=true}endWeek=b0;return {thrown,gone:!document.getElementById('cu98')}});
ok(r1e.thrown&&r1e.gone,'1 overlay removed on error '+JSON.stringify(r1e));
/* ---- 2 · Vulso's cart ---- */
const r2=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};m.coin=3000;MGR.tab='recruit';
  const lot=[];for(let i=0;i<3;i++){const g=genGlad({ovr:40});g.woe='test';g.auction=1;g.price=5;w.glads.push(g);lot.push(g.id)}w.cart={wk:w.week,ids:lot};
  MGR_REDRAW();await W8(400);const click=id=>{const bt=document.querySelector(`[data-m48="cartbuy"][data-id="${id}"]`);if(bt)bt.click();return !!bt};
  o.intro=/two/.test((document.querySelector('.cartbox .sect')||{}).textContent||'');o.b1=click(lot[0]);await W8(300);o.b2=click(lot[1]);await W8(300);o.btnLeft=document.querySelectorAll('[data-m48="cartbuy"]').length;o.boxLeft=document.querySelectorAll('.cartbox').length;o.closed=w.cart.closed;o.bought=w.cart.bought;
  /* the handler refuses even if the button were forced */
  const f=document.createElement('button');f.setAttribute('data-m48','cartbuy');f.setAttribute('data-id',lot[2]);document.body.appendChild(f);f.click();await W8(300);f.remove();
  o.third=!!gById(lot[2]).contract;o.coin=m.coin;return o});
ok(r2.b1&&r2.b2&&r2.bought===2,'2 two buys work '+JSON.stringify(r2));/* v1.04 B15 (353) REPLACED 251's greyed last lot: the cart closes itself after the 2nd pick */ok(r2.btnLeft===0&&r2.boxLeft===0&&r2.closed,'2 cart closes after the second pick '+r2.btnLeft+' '+r2.boxLeft+' '+r2.closed);ok(!r2.third,'2 handler refuses the third');ok(r2.intro,'2 header says take two');
if(SHOT)await pg.screenshot({path:SHOT+'/cart.png'});
/* ---- 3 · podium inside the banner ---- */
const shotLeague=async(w,h,name)=>{await pg.setViewportSize({width:w,height:h});await W(400);return pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),rv=w.mgrs.filter(x=>!x.isPlayer);const fx=(x,pts,wn,b)=>{const q=msp(x);q.pts=pts;q.w=wn;q.b=b};fx(rv[0],9,3,3);fx(rv[1],8,2,4);fx(me(),3,1,3);/* consistent with play: a win = 3 pts, a runner-up place = 1, each counts a bout (9 pts = 3-0, 8 = 2 wins + 2 seconds in 4, 3 = one win in 3) */MGR.tab='league';MGR_REDRAW();await W8(500);
  const B=document.getElementById('mgrBody');const bn=B.querySelector('.b73-league');const o={};o.banner=!!bn;o.inBanner=!!(bn&&bn.querySelectorAll('.wb105med').length===3);o.n=1+B.querySelectorAll('.lp96pod').length; /* v1.05 B73 (390): the podium became three medal chips */
  o.pod=bn?[...bn.querySelectorAll('.wb105med .wb105m')].map(x=>x.textContent).join(''):'';o.below=!!B.querySelector('.lp96 .lp96pod');o.table=!!B.querySelector('.wd100lgt .wd100r');
  o.tip=(bn&&bn.querySelector('.wb105med')||{}).title||'';
  if(bn){const pr=bn.querySelector('.wd100rt').getBoundingClientRect(),tr=(()=>{const h=bn.querySelector('.roomttl h2');if(!h)return bn.querySelector('.roomttl').getBoundingClientRect();const rg=document.createRange();rg.selectNodeContents(h);return rg.getBoundingClientRect()})() /* v1.01: the title box spans the banner (Season button in the kicker row) — compare the heading text */,br=bn.getBoundingClientRect();const sr=null;const rr=null;
    const hit=(a,c)=>c&&a.left<c.right&&a.right>c.left&&a.top<c.bottom&&a.bottom>c.top;o.overTitle=hit(pr,tr);o.overStat=hit(pr,rr);o.inside=pr.left>=br.left-1&&pr.right<=br.right+1&&pr.top>=br.top-1&&pr.bottom<=br.bottom+1;
    o.hscroll=document.documentElement.scrollWidth>innerWidth+1;o.bh=Math.round(br.height)}return o})};
const r3=await shotLeague(1440,900);await pg.screenshot({path:SHOT+'/league_banner_1440.png'});
ok(r3.banner&&r3.inBanner&&r3.pod==='\u{1F947}\u{1F948}\u{1F949}','3 podium chips inside the banner, 🥇🥈🥉 (v1.05 B73) '+JSON.stringify(r3));ok(r3.n===1&&!r3.below&&r3.table,'3 no separate block below, table kept '+JSON.stringify(r3));
ok(/Superbus/.test(r3.tip)&&/Quaestor/.test(r3.tip),'3 hover keeps prizes + Quaestor '+r3.tip);ok(!r3.overTitle&&!r3.overStat&&r3.inside,'3 no overlap at 1440 '+JSON.stringify(r3));ok(r3.bh<=150,'3 the league banner is compact at 1440 (<=150 px) '+r3.bh);
const r3p=await shotLeague(390,800);await pg.screenshot({path:SHOT+'/league_banner_390.png'});
ok(r3p.inBanner&&!r3p.below&&!r3p.overTitle&&!r3p.overStat&&r3p.inside&&!r3p.hscroll,'3 phone width fits '+JSON.stringify(r3p));
const real=errs.filter(e=>!/boom98/.test(e));
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS tv98m');console.log('ERRS',JSON.stringify(real));await b.close();process.exit(miss.length||real.length?1:0)})();

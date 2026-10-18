/* tv104k — v1.04 beta-2 fixes (358-v104fixp): B29 Play Now's action row (🎲 sandstone tile, same height as Begin Event + Home, equal gaps);
   B34 the bracket buttons (Match Week weeks 9–11, League 🏛 Superbus) regal: laurel + Cup + gold-on-crimson; B35 Match Week in the playoffs
   (his house out, Round 1): (a) the tree uses the full width, title + legend above it, the Champion column inside its box (phones scroll inside
   the box, the page does not), (b) bout titles on one line "Bout A · seeds 5·8·9·12", (c) the banner's day tabs read Round 1 / Bout A, Bout B
   (distinct); kill switch flavius_v104poff=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:vw||{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_v106b1off','1');if(o)localStorage.setItem('flavius_v104poff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});return pg};
const mgr=async pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=9000;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    window.W8=W8;window.ENS=async()=>{const el=document.querySelector('#mgrBody');if(!el||!el.offsetParent){menuHide();openManager(MGR.tab||'ludus');await W8(900)}};
    window.SIMS=async()=>{const w=W_();for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k)};
    window.PW=async(keep,pre)=>{const w=W_(),pm=me();if(!keep)for(const g of rosterOf(pm)){g.inj=null;g.contract.weeks=Math.max(g.contract.weeks,30)}
      if(w.special&&!w.special.done)await specAutoRun();await SIMS();if(pre)pre();
      let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];try{if(P.t==='thumb')settlePending(0,null,{d6:6,d12:12});else if(P.t==='blood')settlePending(0,'let');else settlePending(0,'stay')}catch(e){w.pend.shift()}}
      const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let rr;try{rr=await endWeek()}finally{clearInterval(hold)}await W8(150);return rr};
    window.TBL=()=>JSON.stringify(W_().mgrs.map(m=>{const s=msp(m);return [m.id,s.pts,s.w||0,s.ev||0]}));
    window.FIT=n=>{const w=W_(),pm=me();const A=[];for(let i=0;i<n;i++){const g=genGlad({ovr:64+i});g.contract={mgr:pm.id,wage:3,weeks:30,since:w.week};w.glads.push(g);A.push(g)}return A};
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('ludus');await W8(600);MGR.view=null});
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));console.log(JSON.stringify(out,null,1).slice(0,6000));await b.close();process.exit(1)}};


/* ---- B29 Play Now's action row (desktop) ---- */
const pn=await b.newPage({viewport:{width:1440,height:900}});await pn.route(/fonts\./,r=>r.abort());pn.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pn.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_v106b1off','1')});
await pn.goto('file://'+process.argv[2],{timeout:90000});await pn.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pn.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}openSetup(true)});
await pn.waitForSelector('#mBody .pn100 .pn98go',{timeout:20000});await pn.waitForTimeout(800);
out.pn=await pn.evaluate(()=>{const r=e=>e.getBoundingClientRect();const d=r(document.querySelector('.pn98go .pn98dice')),g=r(document.getElementById('goBtn')),h=r(document.getElementById('mClose'));
  const top=document.elementFromPoint(h.x+h.width/2,h.y+h.height/2);
  return {dh:d.height,gh:g.height,hh:h.height,dg:g.x-(d.x+d.width),gh2:h.x-(g.x+g.width),dy:d.y,gy:g.y,hy:h.y,bg:getComputedStyle(document.querySelector('.pn98go .pn98dice')).backgroundImage,homeOnTop:!!(top&&top.closest('#mClose'))}});
ok(Math.abs(out.pn.dh-out.pn.gh)<=1&&Math.abs(out.pn.hh-out.pn.gh)<=1&&Math.abs(out.pn.dy-out.pn.gy)<=1&&Math.abs(out.pn.hy-out.pn.gy)<=1,'B29 same height, same line '+JSON.stringify(out.pn));
ok(out.pn.dg>=6&&out.pn.dg<=14&&Math.abs(out.pn.dg-out.pn.gh2)<=3,'B29 small equal gaps '+JSON.stringify(out.pn));
ok(/radial-gradient/.test(out.pn.bg)&&out.pn.homeOnTop,'B29 sandstone dice tile, Home on top '+JSON.stringify(out.pn));
const B39=()=>pn.evaluate(()=>{const d=document.querySelector('.pn98go .pn98dice'),g=document.getElementById('goBtn'),h=document.getElementById('mClose');const row=d.closest('.pn-top');
  let sc=d.parentElement;while(sc&&!(sc.scrollHeight>sc.clientHeight+2&&/auto|scroll/.test(getComputedStyle(sc).overflowY)))sc=sc.parentElement;const st=sc.getBoundingClientRect().top;const t=e=>e.getBoundingClientRect().top;
  return {sc:st,d:t(d),g:t(g),h:t(h),inRow:row.contains(h),pos:getComputedStyle(h).position}});
const b39a=await B39();out.b39a=b39a;
ok(b39a.d>=b39a.sc-0.5&&b39a.g>=b39a.sc-0.5&&b39a.h>=b39a.sc-0.5,'B39 not clipped at the top '+JSON.stringify(b39a));
ok(Math.max(b39a.d,b39a.g,b39a.h)-Math.min(b39a.d,b39a.g,b39a.h)<=2,'B39 same top '+JSON.stringify(b39a));
ok(b39a.inRow&&b39a.pos==='static','B39 Home is in the same row element, no own placement '+JSON.stringify(b39a));
await pn.evaluate(()=>{const d=document.querySelector('.pn98go .pn98dice');let sc=d.parentElement;while(sc&&!(sc.scrollHeight>sc.clientHeight+2&&/auto|scroll/.test(getComputedStyle(sc).overflowY)))sc=sc.parentElement;sc.scrollTop=200});await pn.waitForTimeout(300);
const b39b=await B39();out.b39b=b39b;
ok(b39b.d>=b39b.sc-0.5&&b39b.g>=b39b.sc-0.5&&b39b.h>=b39b.sc-0.5&&Math.max(b39b.d,b39b.g,b39b.h)-Math.min(b39b.d,b39b.g,b39b.h)<=2,'B39 after scrolling 200 px: not clipped, same top '+JSON.stringify(b39b));
await pn.close();

const pg=await open(false);await mgr(pg);

/* ---- B34 week 9: the bracket buttons are regal ---- */
out.w9=await ev(pg,async()=>{const w=W_();const r={};let g=0;while(wkOf(w.week)<9&&g++<12)if(!await PW())break;r.wk=wkOf(w.week);await ENS();
  const info=x=>x?{lau:x.querySelectorAll('svg.lau').length,cup:!!x.querySelector('.v104cup svg'),bg:getComputedStyle(x).backgroundImage,fs:getComputedStyle(x.querySelector('b')).fontSize,h:x.getBoundingClientRect().height,w:x.getBoundingClientRect().width}:null;
  MGR.tab='night';MGR_REDRAW();await W8(800);r.night=info(document.querySelector('.roomhd.b73-night .po104bb.v104rg'));
  MGR.tab='league';MGR_REDRAW();await W8(800);r.league=info(document.querySelector('.roomhd.b73-league .v104slb.v104rg[data-v104s="sb"]'));
  const sb=document.querySelector('.roomhd.b73-league [data-v104s="sb"]');if(sb){sb.click();await W8(600)}r.back=document.querySelector('.roomhd.b73-league [data-v104s="std"]')&&!document.querySelector('.roomhd.b73-league [data-v104s="std"].v104rg');
  const ok2=document.querySelector('#mgrPane .v104slg .v104tr');r.view=!!ok2;return r});
const reg=x=>x&&x.lau===2&&x.cup&&/linear-gradient/.test(x.bg)&&x.fs==='14px'&&x.h<48&&x.w<260;
ok(out.w9.wk===9&&reg(out.w9.night),'B34 Match Week bracket button regal '+JSON.stringify(out.w9.night));
ok(reg(out.w9.league)&&out.w9.back&&out.w9.view,'B34 League Superbus button regal, still opens the view '+JSON.stringify(out.w9));

/* ---- B35 Round 1, your house out (seed 1 rests) ---- */
const lay=async vw=>{await pg.setViewportSize(vw);await pg.waitForTimeout(700);return ev(pg,()=>{const q=s=>document.querySelector(s);const R=e=>e.getBoundingClientRect();const card=q('#mgrBody .v104top'),tr=q('#mgrBody .v104top .v104tr'),sx=q('#mgrBody .v104top .v104sx'),g=q('#mgrBody .v104top .v104g'),ch=q('#mgrBody .v104top .v104ch'),pj=q('#mgrBody .v104top .po104pj'),sh=q('#mgrBody .v104top .v104sh');
  const bts=[...document.querySelectorAll('#mgrBody .v104top .v104b')].map(x=>({t:x.querySelector('.v104bt').textContent,h:R(x.querySelector('.v104bt')).height}));
  const tabs=[...document.querySelectorAll('.roomhd.b73-night [data-bt85]')].map(x=>(x.querySelector('.bt85d')||{}).textContent+'|'+(x.querySelector('b')||{}).textContent+'|'+x.title);
  const cr=R(card),tr2=R(tr),sr=R(sx),chr=R(ch),gr=R(g);const heads=[...g.querySelectorAll('.v104hd')].map(x=>Math.round(R(x).left));
  return {cardW:cr.width,trW:tr2.width,trL:tr2.left-cr.left,sxW:sr.width,gW:gr.width,chRight:chr.right,sxRight:sr.right,chLeftInSx:chr.left>=sr.left,scrolls:sx.scrollWidth>sx.clientWidth+1,titleAbove:R(sh).bottom<=gr.top&&R(pj).bottom<=gr.top,bts,tabs,heads,pageX:document.documentElement.scrollWidth>window.innerWidth+1}})};
out.r1=await ev(pg,async()=>{const w=W_(),pm=me();await PW();await PW();await SIMS();msp(pm).pts=9999;const r={};r.ok=await PW();r.ph=OFF104.phase(w);await ENS();MGR.tab='night';MGR_REDRAW();await W8(900);return r});
ok(out.r1.ok&&out.r1.ph==='r1','round 1 set '+JSON.stringify(out.r1));
out.d=await lay({width:1440,height:1000});
ok(out.d.trW>=out.d.cardW*0.9&&out.d.trL<40,'B35a tree uses the full width '+JSON.stringify(out.d));
ok(out.d.titleAbove&&!out.d.scrolls&&out.d.chRight<=out.d.sxRight+1&&out.d.chLeftInSx,'B35a title + legend above, Champion column inside the box, no scroll at 1440 '+JSON.stringify(out.d));
ok(out.d.heads.length===4&&out.d.heads[1]-out.d.heads[0]>150&&Math.abs((out.d.heads[1]-out.d.heads[0])-(out.d.heads[2]-out.d.heads[1]))<=40,'B35a columns evenly spread '+JSON.stringify(out.d.heads));
ok(out.d.bts.filter(x=>/seeds/.test(x.t)).length===2&&out.d.bts.some(x=>x.t==='Bout A · seeds 5·8·9·12')&&out.d.bts.some(x=>x.t==='Bout B · seeds 6·7·10·11')&&out.d.bts.every(x=>x.h<=26),'B35b one-line bout titles '+JSON.stringify(out.d.bts));
ok(out.d.tabs.length===2&&out.d.tabs[0]!==out.d.tabs[1]&&/Round 1\|Bout A/.test(out.d.tabs[0])&&/Round 1\|Bout B/.test(out.d.tabs[1])&&!out.d.tabs.some(t=>/\|Superbus\|/.test(t)),'B35c day tabs by round + bout '+JSON.stringify(out.d.tabs));
out.p=await lay({width:390,height:900});
ok(out.p.scrolls&&out.p.sxW<=390&&!out.p.pageX&&out.p.titleAbove,'B35a phone: the box scrolls, not the page '+JSON.stringify(out.p));
ok(out.p.bts.every(x=>x.h<=26),'B35b one-line titles on a phone '+JSON.stringify(out.p.bts));
await pg.evaluate(()=>{const sx=document.querySelector('#mgrBody .v104top .v104sx');sx.scrollLeft=sx.scrollWidth});
out.p2=await ev(pg,()=>{const sx=document.querySelector('#mgrBody .v104top .v104sx');const ch=document.querySelector('#mgrBody .v104top .v104ch');return {chRight:ch.getBoundingClientRect().right,sxRight:sx.getBoundingClientRect().right}});
ok(out.p2.chRight<=out.p2.sxRight+1,'B35a phone: scrolled to the end, the Champion column is whole '+JSON.stringify(out.p2));
out.t=await ev(pg,()=>({tabs:[...document.querySelectorAll('.roomhd.b73-night [data-bt85]')].map(x=>(x.querySelector('b')||{}).textContent),shown:[...document.querySelectorAll('.roomhd.b73-night [data-bt85] b')].every(x=>getComputedStyle(x).display!=='none')}));
ok(out.t.shown&&out.t.tabs[0]==='Bout A'&&out.t.tabs[1]==='Bout B','B35c phone tabs show the bout '+JSON.stringify(out.t));

/* ---- kill switch: today's look ---- */
const off=await open(true);await mgr(off);
out.off=await ev(off,async()=>{const w=W_();let g=0;while(wkOf(w.week)<9&&g++<12)if(!await PW())break;await ENS();MGR.tab='night';MGR_REDRAW();await W8(700);return {rg:document.querySelectorAll('.v104rg').length,btn:document.querySelectorAll('.roomhd .po104bb').length}});
ok(out.off.rg===0&&out.off.btn===1,'kill switch flavius_v104poff=1 '+JSON.stringify(out.off));
ok(!(await pg.evaluate(()=>errNew92?errNew92(window.RM_MARK||0).length:0)),'no new 00c errors');
console.log('ERRS',JSON.stringify(errs));if(miss.length){console.log('MISS',JSON.stringify(miss,null,1));await b.close();process.exit(1)}
console.log('OK tv104k');await b.close();process.exit(errs.length?1:0)})();

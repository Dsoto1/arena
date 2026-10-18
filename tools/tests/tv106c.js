/* v1.06 I1 (395-v106inf): the Infirmary BANNER shows an injured chip "⚕ N injured" (.hc106inj, the hours chip's look) beside the Capsarius chip
   and the Medicus hours chip (still the banner's .hc105, label Medicus); dim at 0; the banner stays 74 px (= Roster ±2) at 1440; the RAIL tab
   keeps only "⚕ N"; no sideways scroll at 390 px; kill switch flavius_v106infoff=1 removes the chip. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o.off)localStorage.setItem('flavius_v106infoff','1')},{off:off?1:0});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    const ros=rosterOf(pm);for(const g of ros){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.ord87=null;g.morale=80}ros[1].inj={until:w.week+3,label:'a cut',pen:2};ros[2].inj={until:w.week+2,label:'a bruise',pen:1};
    window.TAB=async t=>{MGR.view=null;MGR.tab=t;MGR_REDRAW();await W8(500);const mb=document.getElementById('mBody');if(mb)mb.scrollTop=0;await W8(60)};
    window.HSCROLL=()=>{const mb=document.getElementById('mBody');return document.documentElement.scrollWidth>innerWidth+1||(!!mb&&mb.scrollWidth>mb.clientWidth+1)};
    menuHide();openManager('infirm');await W8(800)});return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,400));await b.close();process.exit(1)}};
const BAN='#mgrPane .roomhd, .railmain>.roomhd';
const look=async pg=>ev(pg,async BAN=>{await TAB('roster');const rh=document.querySelector(BAN);const rosterH=rh?Math.round(rh.getBoundingClientRect().height):0;
  await TAB('infirm');const hd=document.querySelector(BAN);const q=s=>hd&&hd.querySelector(s);const c=q('.hc106inj');const kids=hd?[...hd.children].map(x=>x.className):[];
  const ix=k=>kids.findIndex(x=>String(x).split(' ').includes(k));const hrs=q('.hc105');const rail=document.querySelector('.mtabs [data-id="infirm"]')||document.querySelector('[data-mg="tab"][data-id="infirm"]');
  let hs=HSCROLL();if(hs){await W8(800);hs=HSCROLL()}
  return {rosterH,h:hd?Math.round(hd.getBoundingClientRect().height):0,chip:!!c,n:c?c.querySelector('.hc106n').textContent.trim():'',l:c?c.querySelector('.hc106l').textContent.trim():'',dim:!!c&&c.classList.contains('hc106z'),
    tip:c?c.dataset.tip:'',iInj:ix('hc106inj'),iCap:ix('cp105cap'),iHrs:ix('hc105'),hrsLabel:hrs?(hrs.querySelector('.hc105l')||{}).textContent:'',
    chipH:c?Math.round(c.getBoundingClientRect().height):0,hrsH:hrs?Math.round(hrs.getBoundingClientRect().height):0,inBan:!!c&&c.getBoundingClientRect().right<=hd.getBoundingClientRect().right+1&&c.getBoundingClientRect().bottom<=hd.getBoundingClientRect().bottom+1,
    rail:rail?rail.textContent.replace(/\s+/g,' ').trim():'',railInj:rail?/injured/i.test(rail.textContent):null,hs,cls:kids}},BAN);
/* 1440 */
const pg=await open(1440,900);const A=await look(pg);console.log('1440',JSON.stringify(A));
ok(A.chip&&A.n==='⚕ 2'&&A.l==='injured'&&!A.dim,'the banner shows "⚕ 2 injured" '+JSON.stringify([A.n,A.l]));
ok(A.iInj>=0&&(A.iCap<0||A.iInj<A.iCap)&&A.iInj<A.iHrs,'the injured chip sits before the Capsarius chip and the Medicus hours chip '+JSON.stringify(A.cls));
ok(A.hrsLabel==='Medicus','the Medicus hours chip is still the banner\'s .hc105 ('+A.hrsLabel+')');ok(/2 injured/.test(A.tip),'the chip\'s tip: '+A.tip);
ok(A.h>=70&&A.h<=78&&Math.abs(A.h-A.rosterH)<=2,`the Infirmary banner stays slim: ${A.h} px (Roster ${A.rosterH})`);ok(A.inBan&&Math.abs(A.chipH-A.hrsH)<=2,'the chip fits in the banner, the hours chip\'s height '+JSON.stringify([A.chipH,A.hrsH]));
ok(/⚕ 2/.test(A.rail)&&A.railInj===false,'the rail tab keeps only "⚕ N" ('+A.rail+')');ok(!A.hs,'no sideways scroll at 1440');
/* nobody hurt → "⚕ 0", dim */
const Z=await ev(pg,async BAN=>{for(const g of rosterOf(me()))g.inj=null;await TAB('infirm');const c=document.querySelector(BAN).querySelector('.hc106inj');return {n:c?c.querySelector('.hc106n').textContent.trim():'',dim:!!c&&c.classList.contains('hc106z')}},BAN);
ok(Z.n==='⚕ 0'&&Z.dim,'nobody hurt: "⚕ 0", dim '+JSON.stringify(Z));
/* phone */
const pp=await open(390,844);const P=await look(pp);console.log('390',JSON.stringify({h:P.h,chip:P.chip,hs:P.hs,inBan:P.inBan}));ok(P.chip&&!P.hs&&P.inBan,'390 px: the chip shows, no sideways scroll');
/* kill switch */
const pk2=await open(390,844,true);const P0=await look(pk2);console.log('390 off',P0.h);ok(P.h<=P0.h+2,'390 px: the banner is no taller than without the chip ('+P.h+' vs '+P0.h+')');
const pk=await open(1440,900,true);const K=await look(pk);ok(!K.chip&&K.hrsLabel==='Medicus','kill switch: no injured chip, the hours chip stays');
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

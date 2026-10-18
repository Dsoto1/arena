/* tv106e — v1.06 beta-1 notes G1–G3 (397-v106b1): an AWAY Match Week before Set off plays no bout (Watch / Simulate / Simulate the rest refused with
   🔒 Set off first, the play functions refuse too; entering still works); after Set off and in a home week they work; the City Square has no
   speed control; every sign's text fits its plate (EN + DE); kill switch flavius_v106b1off=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,lang)=>{const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_langask86','1');if(o[0])localStorage.setItem('flavius_v106b1off','1');if(o[1])localStorage.setItem('flavius_lang',o[1])},[off?1:0,lang||'']);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=9000;w.train='off';w.tplan=null;w.pend=[];
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}window.W8=W8;
    window.NIGHT=async()=>{menuHide();openManager('night');await W8(700);MGR.tab='night';MGR.confirmEnd=false;MGR_REDRAW();await W8(700)}});return pg};
const away=pg=>pg.evaluate(async()=>{let g=0;
  while((!W_().night||W_().night.bye||!W_().night.bouts||!W_().night.bouts.length)&&g++<8){await endWeek()}
  const n2=W_().night;n2.travel={cost:15,paid:true,gone:false,offer:null,deal:null,from:'Leptis Magna',free105:false};
  await NIGHT();return {locked:sq105Locked(W_()),n:n2.bouts.length}});
const pg=await open(false);
out.a=await away(pg);ok(out.a.locked,'away week locked '+JSON.stringify(out.a));
out.b=await pg.evaluate(async()=>{const w=W_(),n=w.night;const q=s=>[...document.querySelectorAll('#mgrBody '+s)];
  /* open every bout card so its buttons exist */
  q('[data-mw105t]').forEach(x=>x.click());await W8(300);
  const marked=q('[data-mg="watch"],[data-mg="sim"],[data-mg="fight"],[data-mg="spect"],[data-mg="simall"]').map(x=>[x.dataset.mg,!!x.getAttribute('data-bt106'),/🔒/.test(x.textContent)]);
  const enter=q('[data-mg="enter"]').map(x=>!!x.getAttribute('data-bt106'));
  /* the buttons */
  for(const x of q('[data-mg="simall"],[data-mg="sim"],[data-mg="watch"]')){x.click();await W8(150)}
  const afterClick=n.bouts.filter(x=>x.done).length;
  /* the functions themselves */
  await runBoutSim(0);await runBoutSim(1);watchBout(0);let cfg='ok';try{boutCfg(n.bouts[0],true)}catch(e){cfg='threw'}
  await W8(300);
  return {marked,enter,afterClick,afterFn:n.bouts.filter(x=>x.done).length,cfg,modal:!!(document.querySelector('#modal')&&!document.querySelector('#modal').hidden),endTxt:(q('[data-mw105="end"]')[0]||{}).textContent||''}});
ok(out.b.marked.length>0&&out.b.marked.every(x=>x[1]&&x[2]),'Watch/Simulate/Simulate the rest show 🔒 '+JSON.stringify(out.b.marked));
ok(out.b.afterClick===0&&out.b.afterFn===0,'no bout played before Set off '+JSON.stringify(out.b));
ok(out.b.cfg==='threw','boutCfg refuses '+out.b.cfg);
ok(/Set off first/.test(out.b.endTxt),'End the week locked '+out.b.endTxt);
ok(out.b.enter.every(x=>!x),'entering is not locked '+JSON.stringify(out.b.enter));
/* set off -> works */
out.c=await pg.evaluate(async()=>{const w=W_(),n=w.night;n.travel.gone=true;MGR_REDRAW();await W8(500);const l=sq105Locked(w);await runBoutSim(0);
  return {locked:l,done0:!!n.bouts[0].done,marks:document.querySelectorAll('#mgrBody [data-bt106]').length}});
ok(!out.c.locked&&out.c.done0,'after Set off a bout simulates '+JSON.stringify(out.c));
/* home week */
out.h=await pg.evaluate(async()=>{const w=W_(),n=w.night;n.travel.gone=false;n.travel.cost=0;MGR_REDRAW();await W8(400);const l=bt106Locked();await runBoutSim(1);return {locked:l,done1:!!n.bouts[1].done}});
ok(!out.h.locked&&out.h.done1,'home week plays '+JSON.stringify(out.h));
/* City Square: no speed control, signs fit (EN) */
const sq=async pg=>pg.evaluate(async()=>{window.travelOK=()=>true;window.travelBlock=()=>false;openCitySquare(W_().night.loc,{prematch:true});
  for(let i=0;i<150&&!(CITY&&CITY.open&&CITY.npcs&&CITY.npcs.length);i++)await W8(100);await W8(1800);cityDraw();
  const lab=CITY.lab106||{};const ent=Object.entries(lab);
  return {spd:document.querySelectorAll('[data-cspd]').length,speed:CITY.speed,n:ent.length,bad:ent.filter(([t,v])=>v[1]>v[0]-8).map(([t,v])=>[t,v[0],v[1]]),names:ent.map(e=>e[0])}});
out.s=await sq(pg);ok(out.s.spd===0&&out.s.speed===1,'no speed control '+JSON.stringify(out.s));ok(out.s.n>=8&&out.s.bad.length===0,'every sign fits its plate (EN) '+JSON.stringify(out.s));
await pg.close();
/* DE */
const pd=await open(false,'de');await away(pd);await pd.evaluate(()=>{W_().night.travel.gone=true});
out.d=await sq(pd);ok(out.d.n>=8&&out.d.bad.length===0,'every sign fits its plate (DE) '+JSON.stringify(out.d));await pd.close();
/* kill switch */
const pk=await open(true);await away(pk);
out.k=await pk.evaluate(async()=>{const n=W_().night;await runBoutSim(0);return {done:!!n.bouts[0].done,marks:document.querySelectorAll('#mgrBody [data-bt106]').length}});
ok(out.k.done&&out.k.marks===0,'kill switch: no lock '+JSON.stringify(out.k));
console.log(JSON.stringify(out).slice(0,1500));console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(miss.length||errs.length?1:0)})();

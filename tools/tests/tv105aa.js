/* tv105aa — v1.05 B74/B75 (389-v105sq): the City Square is locked until the house sets off (Walk button disabled "🔒 Set off first", citySquareGate +
   openCitySquare refuse), the Match Week banner has no trip / world-event chip and no temple / sand links, the Set off button shows the trip cost;
   after Set off the square opens; a home-city week is open; kill switch flavius_v105sqoff=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async off=>{const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105sqoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=9000;w.train='off';w.tplan=null;w.pend=[];
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}window.W8=W8;
    window.NIGHT=async()=>{menuHide();openManager('night');await W8(700);MGR.tab='night';MGR.confirmEnd=false;MGR_REDRAW();await W8(700)}});return pg};
/* force an away Match Week: a trip to pay, paid, not gone */
const away=(pg,free)=>pg.evaluate(async(free)=>{let g=0;
  while((!W_().night||W_().night.bye||!W_().night.bouts||!W_().night.bouts.length)&&g++<8){await endWeek()}
  const n2=W_().night;n2.travel={cost:15,paid:true,gone:false,offer:null,deal:null,from:'Leptis Magna',free105:!!free};n2.omen={k:'dole',n:'Grain dole day',att:1};
  await NIGHT();
  return {has:!!document.querySelector('.mw105ban'),locked:sq105Locked(W_()),host:n2.loc}},free);
const pg=await open(false);
out.a=await away(pg,false);ok(out.a.has&&out.a.locked,'forged away week: banner + locked '+JSON.stringify(out.a));
out.b=await pg.evaluate(async()=>{const q=s=>document.querySelector(s),w=W_(),li=w.night.loc;const wb=q('.mw105ban .walk96b');const ban=q('.mw105ban');const txt=ban.textContent;
  const o=q('.mw105ban [data-mw105="off"]');
  const g=citySquareGate(li);openCitySquare(li,{});const open1=!!CITY.open;
  if(wb){wb.disabled=false;wb.click()}await W8(300);
  return {walkDis:!!wb,walkTxt:wb?wb.textContent:'',walkTitle:wb?wb.title:'',gate:g,open1,open2:!!CITY.open,
    chipTrip:/Booked for|trip/i.test([...ban.querySelectorAll('.mw105chip')].map(x=>x.textContent).join('|')),chipEvt:/Grain dole|attendance/.test(txt),links:/walk the sand|the temple/i.test(txt),
    off:o?o.textContent:'',chips:[...ban.querySelectorAll('.mw105chip')].map(x=>x.textContent)}});
ok(out.b.walkDis&&/🔒/.test(out.b.walkTxt)&&/Set off first/.test(out.b.walkTxt)&&/Set off first/.test(out.b.walkTitle),'Walk button shows 🔒 Set off first '+JSON.stringify(out.b));
ok(/Set off first/.test(out.b.gate||'')&&!out.b.open1&&!out.b.open2,'citySquareGate + openCitySquare refuse (and a forced click) '+JSON.stringify(out.b));
ok(!out.b.chipTrip&&!out.b.chipEvt&&!out.b.links,'no trip chip, no world-event chip, no temple/sand links '+JSON.stringify(out.b));
ok(/Set off for/.test(out.b.off)&&/15/.test(out.b.off),'Set off button shows the cost '+JSON.stringify(out.b.off));
/* free trip */
out.f=await pg.evaluate(async()=>{W_().night.travel.free105=true;MGR_REDRAW();await W8(500);const o=document.querySelector('.mw105ban [data-mw105="off"]');return o?o.textContent:''});
ok(/free/.test(out.f),'free trip: "· free" '+out.f);
await pg.evaluate(async()=>{W_().night.travel.free105=false;MGR_REDRAW();await W8(400)});
/* set off -> opens */
await pg.click('.mw105ban [data-mw105="off"]');await pg.waitForTimeout(500);await pg.click('.ask76bg [data-ask76="1"]');await pg.waitForTimeout(800);
out.c=await pg.evaluate(async()=>{const w=W_(),li=w.night.loc;const wb=document.querySelector('.mw105ban .walk96b');return {gone:!!w.night.travel.gone,locked:sq105Locked(w),gate:citySquareGate(li),walkDis:wb?wb.disabled:null,walkTxt:wb?wb.textContent:''}});
ok(out.c.gone&&!out.c.locked&&!out.c.gate&&out.c.walkDis===false&&!/🔒/.test(out.c.walkTxt),'after Set off the square is open '+JSON.stringify(out.c));
/* home-city week: open */
out.h=await pg.evaluate(async()=>{const w=W_();w.night.travel.gone=false;w.night.travel.cost=0;MGR_REDRAW();await W8(400);const wb=document.querySelector('.mw105ban .walk96b');return {locked:sq105Locked(w),gate:citySquareGate(w.night.loc),walkDis:wb?wb.disabled:null}});
ok(!out.h.locked&&!out.h.gate&&out.h.walkDis===false,'home-city week: open '+JSON.stringify(out.h));
await pg.close();
/* kill switch */
const pk=await open(true);out.k=await away(pk,false);out.k2=await pk.evaluate(()=>({gate:citySquareGate(W_().night.loc),locked:sq105Locked(W_())}));
ok(!out.k2.locked&&!/Set off first/.test(out.k2.gate||''),'kill switch: not locked '+JSON.stringify(out.k2));
console.log(JSON.stringify(out).slice(0,3000));console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,4)));await b.close();process.exit(miss.length||errs.length?1:0)})();

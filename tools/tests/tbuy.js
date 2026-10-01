const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{newWorld({type:'pre',key:MGR_PRE[0].key});openManager()});await pg.waitForTimeout(700);
const setup=await pg.evaluate(()=>{const w=W_(),m=me();const g=rosterOf(m)[0];g.dream='ludus';g.fame=60;g.ovr=82;g.pot=85;g.purse=200;w.forceBuy=1;w.buyWk=-99;purseWeek(w,m);MGR.tab='ludus';MGR_REDRAW();
  return {offer:w.buyOffer,glad:g.name,oldLudus:m.ludus,oldCoin:m.coin,card:!!document.querySelector('[data-mg="buyaccept"]')}});
await pg.screenshot({path:'buy_offer.png',clip:{x:0,y:0,width:1500,height:520}});
await pg.click('[data-mg="buyaccept"]');await pg.waitForTimeout(500);
const create=await pg.evaluate(()=>({h:(document.querySelector('#mgrBody h4')||{}).textContent,btn:(document.querySelector('[data-mg="nmgo"]')||{}).textContent}));
await pg.evaluate(()=>{const i=document.querySelector('[data-nm="ludus"]');i.value='Ludus Novus';i.dispatchEvent(new Event('input',{bubbles:true}))});
await pg.click('[data-mg="nmgo"]');await pg.waitForTimeout(800);
const after=await pg.evaluate(o=>{const w=W_(),m=me();const old=w.mgrs.find(x=>x.ludus===o.oldLudus);
  return {me:[m.name,m.ludus,m.coin,rosterOf(m).length],oldHouse:[old.name,old.isPlayer,rosterOf(old).length],players:w.mgrs.filter(x=>x.isPlayer).length,tab:MGR.tab}},setup);
// refuse path on a fresh world
await pg.evaluate(()=>{newWorld({type:'pre',key:MGR_PRE[1].key});MGR_REDRAW()});await pg.waitForTimeout(300);
const ref=await pg.evaluate(async()=>{const w=W_(),m=me();const g=rosterOf(m)[0];g.dream='ludus';g.fame=60;g.ovr=82;g.purse=200;w.forceBuy=1;w.buyWk=-99;purseWeek(w,m);MGR_REDRAW();
  document.querySelector('[data-mg="buyreject"]').click();await new Promise(r=>setTimeout(r,300));
  const mor=g.morale;let n=0;while(!g.lanista&&n<40){w.week++;purseWeek(w,m);n++}
  const nh=w.mgrs.find(x=>x.defector);return {refusedMorale:mor,weeksToLeave:n,newHouse:nh?[nh.name,nh.ludus,nh.rivalry,rosterOf(nh).length]:null}});
console.log(JSON.stringify({setup,create,after,ref}),errs.slice(0,4));await b.close()})();

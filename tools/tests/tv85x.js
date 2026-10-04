/* v0.85 fixes: clicking a free agent in the list (and his offer meter) does not favorite him; a real offer still records the court line */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const m=me();MGR.tab='recruit';MGR_REDRAW();await W8(500);
  const rows=[...document.querySelectorAll('#recTable tr[data-mg="sel"]')].slice(0,3);const ids=rows.map(x=>x.dataset.id);
  for(const row of rows){row.click();await W8(350)}
  const after=ids.map(id=>{const g=gById(id);return {fav:!!g.favd,court:!!g.court}});
  /* the 3-step card's offer step + meter */
  const g=gById(ids[0]);MGR.sel=g.id;MGR_REDRAW();await W8(300);const s3=document.querySelector('[data-recstep="3"]');if(s3){s3.click();await W8(500)}
  const rg=document.getElementById('ofWage');if(rg){rg.value=rg.max;rg.dispatchEvent(new Event('input',{bubbles:true}));await W8(200)}
  const meter={fav:!!g.favd,court:!!g.court};
  m.coin=Math.max(m.coin,500);const ob=document.querySelector(`[data-mg="offer"][data-id="${g.id}"]`);if(ob){ob.click();await W8(500)}
  return {n:ids.length,after,meter,offered:!!ob,real:{fav:!!g.favd,court:!!g.court||!!(g.contract&&g.contract.mgr===m.id)}}});
ok(r.n>=3,'free agents listed');ok(r.after.every(x=>!x.fav&&!x.court),'clicking a free agent does not favorite him');ok(!r.meter.fav&&!r.meter.court,'the offer meter does not favorite');
ok(!r.offered||(r.real.fav&&r.real.court),'a real offer still records the court line');
console.log(JSON.stringify(r));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

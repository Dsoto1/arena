/* v0.85 fixes: clicking a free agent in the list (and his offer meter) does not favorite him; a real offer still records the court line;
   a road deal enters the chosen fighter in the bout that suits him; the Match Week banner's bout tracker (done slashed, next lit) */
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
const q=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const w=W_(),m=me();MGR.tab='night';MGR_REDRAW();await W8(300);travelState(w);const t=w.night.travel;
  thriving=()=>false;const g=rosterOf(m).filter(x=>!x.inj&&!w.night.bouts.some(b=>b.ents.includes(x.id)))[0];t.paid=false;t.cost=t.cost||11;t.deal=null;t.offer={mgr:w.mgrs.find(x=>!x.isPlayer).id,gid:g.id,why:'the crowd at the gate is asking for'};
  MGR_REDRAW();await W8(300);const txt=(document.querySelector('.traveloffer')||{}).textContent||'';LEAVE76.ok=1;document.querySelector('[data-mg="traveldeal"]').click();await W8(500);
  const bi=w.night.bouts.findIndex(b=>b.ents.includes(g.id));const T=bi>=0?TIERS[w.night.bouts[bi].tier]:null;const o=effOvr(g);
  const b0=w.night.bouts[0];b0.done=true;b0.res={winners:[b0.ents[0]],rows:[],lines:[],turns:9,reason:''};MGR_REDRAW();await W8(400);
  const bx=[...document.querySelectorAll('.bt85')].map(x=>x.className.replace('bt85 ',''));const slash=!!document.querySelector('.bt85.done .bt85x');
  return {txt:/They want them in the/.test(txt),bi,fits:!!T&&o>=T.lo-6&&o<=T.hi+6,bx,slash,walk:!!document.querySelector('.travelcard.road85 .road85side [data-mg="scoutarena"],.travelcard.road85 .road85side [data-mg="city"]')}});
ok(q.txt,'the road offer names its bout');ok(q.bi>=0&&q.fits,'the deal enters the fighter in a bout that suits him');ok(q.bx.join()==='done,next,later'&&q.slash,'bout tracker: done slashed, next lit');ok(q.walk,'the walks sit in the Road box');console.log(JSON.stringify(q));
ok(r.n>=3,'free agents listed');ok(r.after.every(x=>!x.fav&&!x.court),'clicking a free agent does not favorite him');ok(!r.meter.fav&&!r.meter.court,'the offer meter does not favorite');
ok(!r.offered||(r.real.fav&&r.real.court),'a real offer still records the court line');
console.log(JSON.stringify(r));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

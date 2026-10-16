/* v0.85 fixes: clicking a free agent in the list (and his offer meter) does not favorite him; a real offer still records the court line;
   a road deal enters the chosen fighter in the bout that suits him; the Match Week banner's bout tracker (done slashed, next lit) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_v104doff','1') /* v1.04: 351-v104ward replaces this layout / these rules — tv104d covers them */});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
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
  const bx=[...document.querySelectorAll('.bt85:not(.bt100s)')].map(x=>x.className.replace('bt85 ',''));const slash=!!document.querySelector('.bt85.done .bt85x');
  return {txt:/They want them in the/.test(txt),bi,fits:!!T&&o>=T.lo-6&&o<=T.hi+6,bx,slash,nextLit:!!document.querySelector('.bt85.next'),walk:!!document.querySelector('.walk96 [data-mg="city"]')&&!!document.querySelector('.walk96 .city90n')}});
ok(q.txt,'the road offer names its bout');ok(q.bi>=0&&q.fits,'the deal enters the fighter in a bout that suits him');ok(q.bx[0]==='done'&&q.bx.length===3&&q.nextLit /* v1.0: 296's special chips may be the next one */&&q.slash,'bout tracker: done slashed, next lit');ok(q.walk,'the walk button and its note sit on the city banner (v0.97)');console.log(JSON.stringify(q));
const z=await pg.evaluate(async()=>{const w=W_(),m=me();const t=w.night.travel;t.paid=true;t.cost=t.cost||11;t.gone=true;const g=rosterOf(m)[0];g.inj={until:w.week+2,label:'a deep thigh cut',pen:3};g.medWk=null;g.bathWk=null;
  const it=weekChecklist().find(x=>x.ic==='⚕');const need=infirmNeed73();const lt=typeof medicus84==='function'?medicus84(w):null;
  const road=ROAD76.every(E=>!/^−\d/.test(E.a[1]));MGR.tab='night';MGR_REDRAW();await new Promise(x=>setTimeout(x,300));const tem=/Cost: \d+ coin · /.test((()=>{const d=document.createElement('div');d.innerHTML=templeHTML76();return d.textContent})()); /* v0.90: the temple lives in the City Square only */
  MGR.tab='ludus';MGR_REDRAW();await new Promise(x=>setTimeout(x,300));const flag=!!document.querySelector('.banner73 svg image, .room73 svg image, svg image[href^="data:"]');
  return {done:!!it&&it.done&&/treatment opens after the games/.test(it.txt),need,lt,road,tem,flag}});
ok(z.done&&z.need===0&&!z.lt,'a wound taken on the road waits for next week without nagging');ok(z.road&&z.tem,'prices read Cost: N coin');console.log(JSON.stringify(z));
const st=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));MGR.tab='recruit';const g=freeAgents()[0];MGR.sel=g.id;MGR_REDRAW();await W8(400);
  const rail=document.querySelector('.mtabs');let n=0;const R=window.MGR_REDRAW;window.MGR_REDRAW=function(){n++;return R.apply(this,arguments)};
  for(let i=0;i<10;i++){const b=document.querySelector(`[data-recstep="${1+i%3}"]`);if(b)b.click();await W8(60)}
  const cur=(document.querySelector('.rstep.cur')||{}).textContent||'';window.MGR_REDRAW=R;return {n,same:rail===document.querySelector('.mtabs'),cur}});
ok(st.n===0&&st.same&&/Court|Scout|Offer/.test(st.cur),'card steps swap without a redraw');console.log(JSON.stringify(st));
ok(r.n>=3,'free agents listed');ok(r.after.every(x=>!x.fav&&!x.court),'clicking a free agent does not favorite him');ok(!r.meter.fav&&!r.meter.court,'the offer meter does not favorite');
ok(!r.offered||(r.real.fav&&r.real.court),'a real offer still records the court line');
console.log(JSON.stringify(r));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

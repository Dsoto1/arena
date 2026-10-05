/* v0.84: PROGRAMMATA — 🖌 Paint the programmata in Your ludus → Promote: setup inline, cost charged, the painted wall,
   a week's fame + fighter fans, +20% at a bout in a covered city, a forced defacing (Consilium letter, no effects that
   week), the featured fighter's death → memorial, cancel (ask76), an AI house's own campaign (news line + map marker).
   Optional argv[3] = a folder for screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const SH=process.argv[3]||null;const shot=async(n,sel)=>{if(!SH)return;await pg.mouse.move(2,2);const el=await pg.$(sel);if(el){await el.scrollIntoViewIfNeeded();await pg.waitForTimeout(250);await el.screenshot({path:SH+'/'+n+'.png'})}};
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const W8=ms=>pg.waitForTimeout(ms);
const o={};
Object.assign(o,await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';MGR.run='promote';const w=W_(),m=me();m.coin=Math.max(m.coin,200);w.hours=Math.max(w.hours,4);MGR_REDRAW();await W8(400);
  const q=s=>document.querySelector(s);const r={};
  const bt=q('#mgrPane [data-pg84="open"]');r.btn=!!bt&&/Paint the programmata/.test(bt.textContent);bt&&bt.click();await W8(300);
  r.setup=!!q('#mgrPane .pg84set')&&document.querySelectorAll('#mgrPane .pg84c').length===12;
  /* the first chip is this week's host city (a fixture) */
  const first=q('#mgrPane .pg84c');r.fxFirst=!!first&&first.classList.contains('fx')&&+first.dataset.v===w.night.loc;
  return r}));
await pg.click('#mgrPane .pg84c[data-v]');await W8(200);
Object.assign(o,await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const li=LOCATIONS.findIndex((L,i)=>L&&i!==w.night.loc);
  document.querySelector(`#mgrPane .pg84c[data-v="${li}"]`).click();await W8(200);document.querySelector('#mgrPane [data-pg84="wk"][data-v="3"]').click();await W8(200);
  return {twoOn:document.querySelectorAll('#mgrPane .pg84c.on').length===2}}));
await shot('pg84_setup','#mgrPane .runpanel');
Object.assign(o,await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const c0=m.coin,h0=w.hours;
  document.querySelector('#mgrPane [data-pg84="go"]').click();await W8(300);const P=m.prog84;const r={};
  r.start=!!P&&P.cities.length===2&&P.cities.includes(w.night.loc)&&P.until===w.week+2&&m.coin===c0-16&&w.hours===h0; /* v0.87: the lanista's hours are gone — a campaign costs coin only */
  const wall=document.querySelector('#mgrPane #pg84wall');r.wall=!!wall&&wall.textContent.includes(m.ludus.toUpperCase())&&wall.textContent.includes(P.gname.toUpperCase())&&wall.querySelectorAll('.pg84w').length===3;
  /* the gate: our featured fighter fights the under-card in the host city */
  const g=gById(P.gid);g.inj=null;const bo=w.night.bouts[0];if(!bo.ents.includes(g.id)){for(const b2 of w.night.bouts){const k=b2.ents.indexOf(g.id);if(k>=0)b2.ents.splice(k,1)}bo.ents[0]=g.id}
  for(const id of bo.ents){const g2=gById(id);if(g2&&g2!==g&&g2.contract&&g2.contract.mgr===m.id)bo.ents[bo.ents.indexOf(id)]=w.glads.find(x=>x.alive&&!x.contract&&!bo.ents.includes(x.id)).id}
  await runBoutSim(0);r.gate=(P.gl||[]).length===1&&P.gl[0].n===Math.max(1,Math.round((bo.fee+(bo.res.rows.find(x=>x.gid===g.id).won?Math.round(bo.purse*(0.5+m.p.greed/300)):0))*0.2))&&P.gate===P.gl[0].n;
  /* the week ends: fame + fans; the next week is paid and (forced) painted over */
  for(const b2 of w.night.bouts)b2.done=true;w.pend=[];
  const fans0=(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).filter(x=>x.fanOf===g.name).length;const gf0=g.fame;
  const ai=w.mgrs.find(x=>!x.isPlayer&&!x.sica);ai.rivalry=50;
  PROG84.force='deface';const wk=w.week;const c1=m.coin;await endWeek();await W8(300);
  r.week1=W_().week===wk+1&&P.fame>=1&&(w.tlog||[]).some(x=>/Programmata: fame \+/.test(x.text));
  r.fans=g.fame>=gf0+1&&P.fans===(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).filter(x=>x.fanOf===g.name).length-fans0;r.nFans=P.fans;
  r.def=!!P.def[wk+1]&&(w.letters||[]).some(L=>L.key==='pg84def-'+(wk+1)&&L.adv==='consilium'&&/painted over/.test(L.title))&&P.paid===wk+1;
  r.defBar=MGR_REDRAW()||true;await W8(200);r.defBar=!!document.querySelector('#mgrPane #pg84wall .pg84w.def');
  /* the defaced week: no fame, no gate */
  const f1=P.fame,g1=P.gate;for(const b2 of w.night.bouts)b2.done=true;w.pend=[];await endWeek();await W8(300);
  r.week2=P.fame===f1&&P.gate===g1&&me().prog84===P;
  return r}));
await shot('pg84_running','#mgrPane .runpanel');
Object.assign(o,await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const P=m.prog84;const r={};
  const g=gById(P.gid);g.alive=false;MGR_REDRAW();await W8(300);
  const wall=document.querySelector('#mgrPane #pg84wall');r.memView=!!wall&&wall.classList.contains('mem')&&/D · M/.test(wall.textContent);
  window.__pg84mem=wall?wall.outerHTML:'';
  /* the rival's whitewash roll for this week is random (world id); the memorial week is checked unpainted */delete P.def[w.week];
  const f0=P.fame;const fans0=P.fans;for(const b2 of w.night.bouts)b2.done=true;w.pend=[];await endWeek();await W8(300);
  r.mem=P.memorial>0&&P.fame>f0&&P.fans===fans0&&(w.news||[]).some(x=>/honour the dead/.test(x.text));
  r.over=!m.prog84;g.alive=true;
  /* cancel */
  w.hours=Math.max(w.hours,2);m.coin=Math.max(m.coin,100);r.restart=pg84Start([w.night.loc],2,g.id);MGR_REDRAW();await W8(300);
  return r}));
await pg.evaluate(()=>{const P=me().prog84;const g=gById(P.gid);g.alive=false;MGR_REDRAW()});await W8(300);await shot('pg84_memorial','#mgrPane .runpanel');await pg.evaluate(()=>{gById(me().prog84.gid).alive=true;MGR_REDRAW()});await W8(300);
await pg.click('#mgrPane [data-pg84="cancel"]');await W8(300);
o.askUp=!!(await pg.$('.ask76bg'));await pg.click('.ask76bg [data-ask76="1"]');await W8(300);
Object.assign(o,await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const r={};
  r.cancel=!m.prog84&&!document.querySelector('#mgrPane #pg84wall');
  /* an AI house paints its own */
  const ai=w.mgrs.find(x=>!x.isPlayer&&!x.sica&&!x.dead);ai.p.show=90;ai.coin=200;PROG84.force='ai';pg84Week(w,w.week-1);
  r.ai=!!ai.prog84&&pg84On(ai.prog84,w.week)&&(w.news||[]).some(x=>/paints programmata/.test(x.text)&&x.text.includes(ai.ludus));
  /* map: a mine + a rival marker */
  w.hours=Math.max(w.hours,2);pg84Start([ai.prog84.cities[0],w.night.loc],3,rosterOf(m)[0].id);
  MGR.tab='imp';MGR_REDRAW();await W8(500);
  r.map=document.querySelectorAll('#mgrPane .pg84mk').length>=1&&!!document.querySelector('#mgrPane .pg84mk.mine')&&[...document.querySelectorAll('#mgrPane .pg84mk title')].some(t=>t.textContent.includes(ai.ludus));
  HUB.focus=ai.prog84.cities[0];HUB.view='city';MGR_REDRAW();await W8(300);r.tile=!!document.querySelector('#mgrPane .pg84city')&&document.querySelector('#mgrPane .pg84city').textContent.includes(ai.ludus);
  return r}));
await shot('pg84_map','#mgrPane svg.impmap');
await pg.evaluate(()=>{MGR.tab='ludus';MGR.run='promote';MGR_REDRAW()});await pg.setViewportSize({width:390,height:900});await W8(500);
o.phone=await pg.evaluate(()=>{const el=document.querySelector('#mgrPane #pg84wall');if(!el)return false;const r=el.getBoundingClientRect();return r.width>0&&r.right<=392&&document.documentElement.scrollWidth<=392});
await shot('pg84_phone','#mgrPane #pg84wall');ok(o.phone,'the wall fits a phone');
ok(o.btn&&o.setup&&o.fxFirst&&o.twoOn,'setup inline with cities + fixtures');ok(o.start&&o.wall,'campaign starts: cost, hour, painted wall');
ok(o.gate,'+20% at a bout in a covered city');ok(o.week1&&o.fans,'a week: fame + featured fans');ok(o.def&&o.defBar&&o.week2,'defaced: letter, no effects that week');
ok(o.memView&&o.mem&&o.over,'death → memorial, campaign ends');ok(o.restart&&o.askUp&&o.cancel,'cancel via the popup');ok(o.ai&&o.map&&o.tile,'AI campaign: news, map marker, city tile');
console.log(JSON.stringify(o));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

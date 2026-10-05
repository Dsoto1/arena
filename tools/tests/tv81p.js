/* v0.81 (play): the gear draft shows only this pick's offers, 2 per row, filtered to what fits (no 3rd weapon, no taken equip point),
   drafted gear leaves the market; Belt I/Steel Helm/Leather Greaves/Centurian/Ornate survive the 1 s market reset; the Juggernaut's
   declare cards come out of the deck; a toppled pillar logs the offering + tile and lands one tile back before a pillar; the dock
   under the arena stays put across hovers and turn changes (1300x800, not full screen) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:800}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const shots=process.env.SHOTS||'';
/* 1. the market lists after the reset */
o.mk=await pg.evaluate(()=>{const n=(lv,k)=>MARKET_A[lv].filter(x=>x===k).length;return {b1:n(1,'balteus1'),b2:n(1,'balteus'),sh:n(1,'steelhelm'),lg:n(1,'lgreaves'),ce:n(2,'centurion'),or:n(2,'ornate'),b1base:MARKET_A0[1].includes('balteus1')}});
ok(o.mk.b1===1&&o.mk.b2===1&&o.mk.sh&&o.mk.lg&&o.mk.ce&&o.mk.or&&o.mk.b1base,'market lists');
/* 2. the Ludus draft */
o.dr=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();SPEED='fast';
  const x={picks:[],bad:[]};let started=false;
  startEvent({ev:'ludus',loc:3,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true}],opts:{spect:0}}).then(()=>started=true);
  let first=true;const t0=Date.now();
  let last=Date.now();
  while(Date.now()-t0<60000){await W8(120);
    if(!CUR_MODAL){if(x.picks.length&&Date.now()-last>3000)break;continue}last=Date.now();
    const t=document.getElementById('mTitle').textContent;
    if(/^Draft/.test(t)){const g=document.getElementById('pickgrid');const p=S.players[0];
      const btns=[...g.querySelectorAll('button')];
      /* v0.88: the draft is on the market board (155): the offers lit, the whole pool spread across the slots */
      x.cols=x.cols||(document.querySelector('#mBody .mk88 .mboard75')?2:0);x.n=Math.max(x.n||0,btns.length);x.pool=x.pool||document.querySelectorAll('#mBody .mk88 .sp88').length===12;
      x.belt1=x.belt1||!!document.querySelector('#mBody .mk88 [data-k88="a:balteus1"]');
      const names=btns.map(b=>(b.childNodes[b.childNodes.length-2]||b).textContent||b.textContent);
      const full=armsAttached(p).every(a=>p['w'+a]);
      for(const b of btns){const txt=b.textContent;
        const wk=Object.keys(W).find(k=>txt.startsWith(W[k].n+'LV')||txt.includes(W[k].n+'LV'));
        if(full&&wk)x.bad.push('weapon '+W[wk].n);
        const ak=Object.keys(ARM).find(k=>ARM[k]&&txt.includes(ARM[k].n+'LV'));
        if(ak&&!sideLocs(ARM[ak]).some(l=>p.hp[l]>0&&!armorConflict(p,l,ak)))x.bad.push('armor '+ARM[ak].n)}
      if(first){first=false;p.wR=mkW('gladius');p.wL=mkW('pugio')}
      x.picks.push(btns.length);btns[0].click();continue}
    const bb=document.querySelector('#modal [data-mi]:not([disabled])');if(bb)bb.click();else CUR_MODAL.done(null)}
  for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(100)}
  const P=S.players[0];x.hasW=[P.wR,P.wL].filter(Boolean).map(w=>w.n);
  const flat=[1,2,3].flatMap(lv=>S.market.a[lv].piles?S.market.a[lv].piles.flat():S.market.a[lv].slots);
  x.leak=[];for(const p of S.players)for(const l of Object.keys(p.pieces))for(const pc of p.pieces[l])if(ARM[pc.key]&&!ARM[pc.key].stack&&flat.includes(pc.key))x.leak.push(pc.key);
  x.ended=[...document.querySelectorAll('#log li')].some(li=>/draft ends early/.test(li.textContent));
  return x});
ok(o.dr.cols===2,'2 per row (v0.88: the board)');ok(o.dr.n>0&&o.dr.n<=8,'only offers');ok(o.dr.pool,'rest of pool on the board');ok(o.dr.belt1,'Belt I in the pool');
ok(!o.dr.bad.length,'filtered offers');ok(!o.dr.leak.length,'drafted gear left the market');ok(o.dr.picks.length>=1,'human picked');
/* 3. Juggernaut declare cards */
o.jg=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(80)}
  const x={grids:[]};const decl=k=>DECLARE_PICKS.includes(k);const before=[...DECK_BASE,...ROUND2_CARDS].filter(decl).length;x.before=before;
  startEvent({ev:'juggernaut',loc:11,seats:[{cls:'hero',cpu:false,team:'J'},{cls:'soldier',cpu:true,team:'T'},{cls:'slave',cpu:true,team:'T'}],opts:{spect:0}});
  const t0=Date.now();let cards=0;
  let last=Date.now();
  while(Date.now()-t0<60000){await W8(120);if(!CUR_MODAL){if(cards>=5&&Date.now()-last>2000)break;continue}last=Date.now();
    const t=document.getElementById('mTitle').textContent;
    if(/^Juggernaut card/.test(t)){const g=document.getElementById('pickgrid');x.grids.push({n:g.querySelectorAll('button').length,ward:g.textContent.includes(CARDS.ward.n),left:/×\d+ left/.test(g.textContent)});
      const wb=[...g.querySelectorAll('button')].find(b=>b.textContent.includes(CARDS.ward.n));(wb||g.querySelector('button')).click();cards++;continue}
    const bb=document.querySelector('#modal [data-mi]:not([disabled])');if(bb)bb.click();else CUR_MODAL.done(null)}
  for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(100)}
  const j=S.players.find(p=>p.team==='J');x.after=S.deck.filter(decl).length;x.items=j.items.filter(c=>decl(c.key||c.k)).length;x.wards=j.items.filter(c=>(c.key||c.k)==='ward').length;
  x.log=[...document.querySelectorAll('#log li')].some(li=>/chooses 5 declare cards/.test(li.textContent));
  return x});
ok(o.jg.grids.length===5&&o.jg.grids.every(g=>g.left),'card pick ×N left');ok(o.jg.after===o.jg.before-5,'deck shrinks by 5');
ok(o.jg.wards===2&&o.jg.grids.length===5&&!o.jg.grids[2].ward,'ward runs out');ok(o.jg.log,'card log');
/* 4. falling pillars */
o.tp=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(80)}
  startEvent({ev:'democritus',loc:6,seats:[{cls:'venatore',cpu:true},{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  await W8(1500);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(80)}
  const x={};const P=S.players;const p=P[0];const clear=(r,c)=>{for(const q of P)if(q!==p&&q.r===r&&q.c===c){q.r=12;q.c=12}for(const n of S.npcs)if(n.r===r&&n.c===c){n.r=0;n.c=0}};
  const logs=()=>[...document.querySelectorAll('#log li')].map(li=>li.textContent);
  /* (a) a pot of Elixir, toppled eastward */
  S.pillars=S.pillars.filter(q=>!(q.r===6&&q.c>=6));const pl={id:90,r:6,c:6,pots:['elix2']};S.pillars.push(pl);
  for(let k=-1;k<=3;k++)clear(6,6+k);S.floor=S.floor.filter(f=>!(f.r===6));S.spikes=[];
  p.r=6;p.c=5;p.mv=5;await doTopple(p,pl);
  x.landA=S.floor.some(f=>f.kind==='offer'&&f.key==='elix2'&&f.r===6&&f.c===9);
  x.logA=logs().some(t=>t.includes('The offering falls onto '+tl(6,9))&&t.includes(OFFER.elix2.n));
  x.rubA=logs().some(t=>/topples the pillar/.test(t)&&t.includes('Rubble on'));
  /* (b) a pillar stands on the landing tile */
  S.floor=S.floor.filter(f=>f.r!==6);S.rubble=[];const pl2={id:91,r:6,c:6,pots:['ap2']};const block={id:92,r:6,c:9,pots:[]};S.pillars.push(pl2,block);
  p.r=6;p.c=5;p.mv=5;await doTopple(p,pl2);
  x.landB=S.floor.some(f=>f.kind==='offer'&&f.key==='ap2'&&f.r===6&&f.c===8);x.logB=logs().some(t=>/one tile back/.test(t));
  /* (c) no pots left */
  const pl3={id:93,r:6,c:6,pots:[]};S.pillars.push(pl3);p.r=6;p.c=5;p.mv=5;await doTopple(p,pl3);x.logC=logs().some(t=>/no Blessings left on it/.test(t));
  /* (d) off the sand: toppled toward the east wall from 6,10 → lands on 6,12 */
  const pl4={id:94,r:6,c:11,pots:['ap3']};S.pillars=S.pillars.filter(q=>!(q.r===6&&q.c===12));S.pillars.push(pl4);clear(6,12);clear(6,10);p.r=6;p.c=10;p.mv=5;await doTopple(p,pl4);
  x.landD=S.floor.some(f=>f.kind==='offer'&&f.key==='ap3'&&f.r===6&&f.c===12);
  return x});
ok(o.tp.landA&&o.tp.logA&&o.tp.rubA,'topple log + 3rd tile');ok(o.tp.landB&&o.tp.logB,'one tile back');ok(o.tp.logC,'no blessings line');ok(o.tp.landD,'edge of the sand');
/* 5. the dock stays put */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(80)}
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true}],opts:{spect:0}});await W8(2500);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(150)}render();await W8(300);scrollTo(0,0)});
const geo=()=>pg.evaluate(()=>{const a=document.getElementById('actions').getBoundingClientRect(),c=document.getElementById('cv').getBoundingClientRect(),h=document.getElementById('hover').getBoundingClientRect();return {at:Math.round(a.top),ab:Math.round(a.bottom),ch:Math.round(c.height),cb:Math.round(c.bottom),hh:Math.round(h.height),ih:innerHeight}});
const g0=await geo();const cvb=await pg.locator('#cv').boundingBox();const tops=[g0.at],chs=[g0.ch],hhs=[g0.hh];
for(const [fx,fy] of [[.5,.5],[.3,.6],[.7,.4],[.5,.25],[.45,.7]]){await pg.mouse.move(cvb.x+cvb.width*fx,cvb.y+cvb.height*fy);await pg.waitForTimeout(120);const g=await geo();tops.push(g.at);chs.push(g.ch);hhs.push(g.hh)}
if(shots)await pg.screenshot({path:shots+'/dock_human.png'});
await pg.evaluate(async()=>{const a=document.getElementById('actions');a.innerHTML='<div class="phasebar">1 Resolve</div><div class="hint">CPU turn</div>';draw();await new Promise(r=>setTimeout(r,100))});
{const g=await geo();tops.push(g.at);chs.push(g.ch)}
await pg.evaluate(async()=>{render();draw();await new Promise(r=>setTimeout(r,100))});
{const g=await geo();tops.push(g.at);chs.push(g.ch);o.gEnd=g}
o.dock={tops,chs,hhs,g0};
ok(new Set(tops).size===1,'dock top stable');ok(new Set(chs).size===1,'arena height stable');ok(new Set(hhs).size===1,'inspect line fixed');
ok(g0.ab<=g0.ih+1,'dock on screen');ok(g0.at>=g0.cb-1,'dock not over the sand');
if(shots)await pg.screenshot({path:shots+'/dock_after.png'});
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

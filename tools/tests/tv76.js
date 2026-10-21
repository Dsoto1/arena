/* v0.76: the save hub (▶ Continue + 📜 Saves), Play Now roster chip and seat cards, the road lock + sitting a week out + infirmary
   beds, the Training Yard as fighter cards, the Infirmary as a ward, the beast pen, and the seven Manager ideas (road events,
   house medicus, temple offerings, kitchen/shrine rooms, contract clauses, Darling of the Arena, rival letters) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown'),localStorage.setItem('flavius_v105yoff','1');localStorage.setItem('flavius_v104doff','1') /* v1.04: 351-v104ward replaces this layout / these rules — tv104d covers them */});
await require('./_wait').boot(pg,{menu:false,seed:1});await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
/* A · the save hub */
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);const r={};
  menuHide();startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true}],opts:{spect:0}});await W8(2500);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(150)}
  matchSlotPut('2',matchSnapshot('Test match'));S.over=true;
  openManager();await __W.mgrDrawn();newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;saveWorld(true);await W8(600);if(CUR_MODAL)CUR_MODAL.done(null);await W8(400);
  menuShow();await W8(900);r.cont=!document.querySelector('#mainMenu [data-mm="continue"]')&&document.querySelector('#mainMenu [data-mm="saves"]').parentElement===document.querySelector('#mainMenu [data-mm="settings"]').parentElement; /* no Continue on the menu; Saves beside Settings */r.saves=!!document.querySelector('#mainMenu [data-mm="saves"]');
  savesHub76('matches');await W8(700);r.hub=!!document.querySelector('[data-hub76="careers"]');document.querySelector('[data-hub76="careers"]').click();await W8(500);r.car=!!document.querySelector('[data-hubcar]');
  if(CUR_MODAL)CUR_MODAL.done(null);await W8(400);return r});
/* B · Play Now seat cards */
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openSetup(true)});await pg.waitForTimeout(1500);
o.b={};o.b.chip=await pg.evaluate(()=>!!document.querySelector('.rs76'));
await pg.click('[data-pick76="1"]');await pg.waitForTimeout(400);await pg.click('[data-pk76="1:amazonia"]');await pg.waitForTimeout(500);o.b.cls=await pg.evaluate(()=>CFG.seats[1].cls==='amazonia');
await pg.click('[data-who76="2:0"]');await pg.waitForTimeout(400);o.b.you=await pg.evaluate(()=>!CFG.seats[2].cpu);
const d0=await pg.evaluate(()=>CFG.seats[3].diff);await pg.click('[data-mind76="3"]');await pg.waitForTimeout(400);o.b.mind=await pg.evaluate(d=>CFG.seats[3].diff!==d,d0);
/* C, D, F, G · Manager */
o.m=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await __W.mgrDrawn();newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
  const w=W_(),m=me();m.coin=500;const ros=rosterOf(m);const r={};const q=s=>document.querySelector(s);const home=travelHome(m);const away=[1,2,3,4,5,6,7,8,9,10,11,12].find(i=>i!==home&&LOCATIONS[i]);
  const mine=new Set(ros.map(g=>g.id));for(const b of w.night.bouts)b.ents=b.ents.filter(id=>!mine.has(id));
  /* G · the ward and its beds */
  ros[0].inj={until:w.week+1,label:'cracked ribs',pen:3};ros[1].inj={until:w.week+2,label:'a torn shoulder',pen:5};ros[2].inj={until:w.week+1,label:'a sprained ankle',pen:2};
  r.ser=serious76(ros[0])&&serious76(ros[1])&&!serious76(ros[2]);MGR.tab='infirm';MGR_REDRAW();await W8(400);r.ward=!!q('.iv90list .iv90row')&&!!q('.iv90beds .bd90')&&!!q('.iv90care .v101ord'); /* v1.01: the bathhouse moved to the yard (318) */ /* v0.90: list · body · care options for the selected fighter */
  MGR.inf90=ros[1].id;MGR_REDRAW();await W8(300);r.medOff=!q(`[data-mg="medic"][data-id="${ros[1].id}"]:not([data-dis])`);q(`.iv90care [data-bed76="${ros[1].id}"]`).click();await W8(300);r.bed=inBed76(ros[1])&&!!q(`.iv90care [data-mg="medic"][data-id="${ros[1].id}"]:not([data-dis])`);
  MGR.inf90=ros[0].id;MGR_REDRAW();await W8(300);r.full=!!q(`[data-bed76="${ros[0].id}"][data-dis]`);
  q('[data-v101med]').click();await W8(200);q('.v101mp [data-v101mh="1"]').click();await W8(300); /* v1.01: the hire list is a popup from the banner (318) */r.medicus=!!w.medicus76&&w.medicus76.skill===2;
  /* F · the yard as fighter cards */
  const fit=ros.filter(g=>!g.inj);const g=fit[0],h=fit[1],k3=fit[2]||fit[1];MGR.tab='practice';MGR.yd87='all';MGR.tr92=g.id; /* v0.92: fighter cards + the Trials of the Yard strip for the picked fighter (213) */MGR_REDRAW();await W8(400);r.cards=document.querySelectorAll('.y92c').length===ros.length;
  const L0=thLeft(w);q(`[data-y92s="${g.id}|spd|1"]`).click();await W8(200);r.drill=thLeft(w)===L0-1;
  q(`[data-yb76="pen:${g.id}"]`).click();await W8(200);r.penPanel=!!q('[data-pen76="go"]');
  q(`[data-yb76="spar:${g.id}"]`).click();await W8(200);q(`[data-yp76p="${g.id}"]`).value=h.id;q(`[data-yp76="spar|${g.id}"]`).click();await W8(300);r.spar=thPlan(w).pairs.some(p=>p.k==='spar'&&p.a===g.id)&&q(`[data-yb76="pen:${g.id}"]`).disabled;
  /* D · temple on a home week */
  w.night.loc=home;w.night.travel=null;MGR.tab='night';MGR_REDRAW();await W8(400);const ap0=boostFor(g).ap;{const d=document.createElement('div');d.innerHTML=templeHTML76();q('#mgrBody').appendChild(d);d.querySelector('[data-god76="mars"]').click()} /* v0.90: the temple card left Match Week (City Square only) */await W8(200);r.temple=w.night.god76==='mars'&&boostFor(g).ap===Math.min(7,ap0+1);
  /* C · sit this week out (fresh away week) */
  w.night.god76=null;w.night.loc=away;w.night.travel=null;MGR_REDRAW();await W8(300);const th0=thMax();q('[data-sbye76]').click();await W8(400);q('[data-ask76="1"]').click();await W8(400);
  r.sbye=!!w.night.selfBye&&thMax()===th0+TH_BYE&&weekMoney().gate===0;
  /* C · leaving: the warning, the lock, then a road event */
  w.night.selfBye=false;w.sbye76=null;w.night.travel=null;MGR_REDRAW();await W8(300);q('[data-mg="travelpay"]').click();await W8(500);r.warn=/Before you leave|Set off for/.test((q('.ask76bg')||{}).textContent||'');
  const rnd=Math.random;Math.random=()=>0.1;q('[data-ask76="1"]').click();await W8(900);Math.random=rnd;r.locked=roadLocked76(w);
  if(q('.ask76bg'))q('[data-ask76="1"]').click();await W8(300);r.road=!!(w.night.travel.road76&&w.night.travel.road76.txt);
  MGR.tab='practice';MGR.yd87='all';MGR_REDRAW();await W8(300);const reg0=w.train;const rb=q('[data-mg="regime"]:not(.on)');if(rb)rb.click();await W8(200);r.lockYard=!!q('.lock76')&&w.train===reg0;
  /* D · clauses, rooms, Darling, a rival's letter */
  MGR.tab='roster';MGR_REDRAW();await W8(300);const cb=q('[data-cl76^="winb|"]');const gc=cb&&gById(cb.dataset.cl76.split('|')[1]);if(cb){cb.click();await W8(200)}r.clause=!!(gc&&gc.contract.cl76&&gc.contract.cl76.winb);
  r.rooms=!!FAC.kitchen&&!!FAC.shrine;w.week=7;darlingVote76(w);r.darling=!!w.darling76;
  const R=w.mgrs.find(x=>!x.isPlayer);R.rivalry=40;Math.random=()=>0.2;rivalLetter76(w);Math.random=rnd;const Lt=(w.letters||[]).find(x=>x.rl76);r.letter=!!Lt;return r});
/* E · the beast pen */
o.e=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();w.week=1;w.night.travel=null;w.night.selfBye=false;w.night.loc=travelHome(m);w.tplan=null;m.coin=300;const r={};
  for(const g of rosterOf(m))g.inj=null;MGR.tab='practice';MGR.yd87='all';MGR.tr92=rosterOf(m)[0].id;MGR_REDRAW();await W8(300);const g=rosterOf(m)[0];document.querySelector(`[data-yb76="pen:${g.id}"]`).click();await W8(200);
  document.querySelector('[data-pen76b="wolf"]').click();await W8(200);document.querySelector('[data-pen76="go"]').click();await W8(5000);for(let i=0;i<8&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}
  r.pen=!!(S&&S.pen76)&&S.players.length===1&&S.npcs.length===1&&S.npcs[0].t==='wolf'&&!Object.keys(EVENTS).includes('pen76');
  r.walls=[...reach(S.players[0]).tiles.keys()].every(k=>pen76In(Math.floor(k/N),k%N));r.noPillars=!S.pillars.some(p=>pen76In(p.r,p.c));
  const st0={...gStats(g)};const c0=m.coin;S.npcs[0].alive=false;S.npcs[0].hp=0;gameOver([S.players[0]],'Every beast is slain or tamed');await W8(1200);
  r.choose=/kills the Wolf/.test(document.querySelector('#modal').textContent);CUR_MODAL.done('st:str');await W8(1500);r.bonus=gStats(g).str===Math.min(99,st0.str+2)&&m.coin===c0+6&&MGR.tab==='practice';return r});
const A=o.a,B=o.b,M=o.m,E=o.e;
ok(A.cont&&A.saves,'📜 Saves beside Settings, no Continue');ok(A.hub&&A.car,'the Saves window');ok(B.chip&&B.cls&&B.you&&B.mind,'Play Now roster chip + seat cards');
ok(M.ser&&M.ward&&M.medOff&&M.bed&&M.full,'the ward + beds');ok(M.medicus,'house medicus');ok(M.cards&&M.drill&&M.spar&&M.penPanel,'yard fighter cards');
ok(M.temple,'temple offerings');ok(M.sbye,'sit this week out');ok(M.warn&&M.locked&&M.lockYard,'road lock + before-you-leave');ok(M.road,'road events');
ok(M.clause&&M.rooms&&M.darling&&M.letter,'clauses, rooms, Darling, rival letters');ok(E.pen&&E.walls&&E.noPillars,'the beast pen');ok(E.choose&&E.bonus,'pen results');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

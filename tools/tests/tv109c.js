/* tv109c — v1.09c THE SATURNALIA (416-v109c): a seeded Manager career forged into the off-season (tools/tests/_wait.js boot, like tv109b).
   The off-season opens with NO rudis ask (W4a: they wait for the Saturnalia); Enter, Days I–II simulate → four finalists; room 9's final
   column reads ✦ Saturnalia and the Day III card shows its three events; stage 1 = the festival's chariot race (fest stage 1, chPvp:false)
   with Carmina Fescennina run first as its ceremony (no event of its own); the race's carry (continueFestival's CF + coin + the boon) survives
   a save round-trip mid-festival; stage 2 = Classic · Democritus (fest stage 2, carried CF, race order); the best festival finish (highest
   final CF) takes the Cup, prizes paid once, one plate; clemency (nobody dies, no wound, no records); a Manager festival never writes Play
   Now's records; the rudis ask then appears — in room 10 only; answer it → Begin → season 2. Phone 390 px: sit it out, Begin finishes the
   Saturnalia and stops in room 10 on the ask, no horizontal scroll. Kill switch flavius_v109coff=1 → v1.09b's provisional Day III. */
const {chromium}=require('playwright');const T=require('./_wait');
(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:vw||{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('console: '+m.text().slice(0,200))});
  const ls={flavius_v106b1off:'1'};if(off)ls.flavius_v109coff='1';await T.boot(pg,{seed:3,ls});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await T.ready(pg);return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,600));console.log(JSON.stringify(out,null,1).slice(0,6000));await b.close();process.exit(1)}};
const helpers=()=>{
  window.DRAW=async()=>{MGR_REDRAW();await __W.mgrDrawn('#mgrBody')};
  window.ROOM=async k=>{const b=document.querySelector(`[data-wq109="go|${k}"]`);if(b)b.click();else wqGo(k);
    await __W.until(()=>{const e=document.querySelector('.wq109');return e&&e.dataset.wq109step===k},'room '+k,8000);await __W.mgrDrawn('#mgrBody');
    return document.querySelector('.wq109')?document.querySelector('.wq109').dataset.wq109step:null};
  window.HSCROLL=()=>document.scrollingElement.scrollWidth>window.innerWidth+1;
  window.MODALS=async()=>{for(let k=0;k<6&&CUR_MODAL;k++){CUR_MODAL.done(null);await __W.until(()=>!CUR_MODAL,'modal closed',3000)}await __W.popupSettled()};
  window.WQ=async()=>{MGR.tab='night';MGR.view=null;await DRAW();return __W.until(()=>!!document.querySelector('.wq109'),'Winter Quarters drawn',8000)};
  window.BOOTW=async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await __W.popupSettled();menuHide();openManager();await __W.mgrDrawn('#mgrBody');
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=2000;w.train='off';w.tplan=null;await DRAW();
    const ros=rosterOf(pm);ros.forEach((g,i)=>{g.contract.weeks=30;g.rec.ev=10+i;g.rec.w=4+i;g.inj=null;g.purse=0});w.mgrs.forEach((m,i)=>{const s=msp(m,1);s.pts=(m.isPlayer?31:40-i*3);s.w=12-i;s.b=14;s.ev=14});
    const P=po104New(w);P.sf=[{k:[P.seeds[0],P.seeds[3]],adv:[P.seeds[0]],pl:null},{k:[P.seeds[1],P.seeds[2]],adv:[P.seeds[1]],pl:null}];P.fin={k:[P.seeds[0],P.seeds[1]],pl:null};P.champ=P.seeds[0];P.phase='fin';P.paid={r1:1,sf:1,fin:1};w.po104=P;w.night.po104='fin';w.night.bouts=[];w.special=null;w.week=12;
    /* one of your fighters has earned the rudis in the season (380 keeps it for the off-season) */
    const rg=ros.find(g=>rudisReady(g))||ros[ros.length-1];rg.rec.ev=Math.max(rg.rec.ev,14);rg.rec.w=Math.max(rg.rec.w,6);rg.rudis105={s:1,f:55};window.__RG=rg.id;
    return w};
  window.RECS=w=>JSON.stringify({g:w.glads.map(g=>[g.id,g.alive,g.rec,g.ss||null,g.recent||null,g.inj||null,(g.severed||[]).slice().sort()]),m:w.mgrs.map(m=>[m.id,m.bouts,m.wins,m.spS])});
  window.FREE=w=>(w.pend||[]).filter(p=>p.t==='rudis'||p.t==='buyfree').length;
  window.SIMDAYS=async w=>{const C=w.wc109;const sim=async()=>{const b=document.querySelector('[data-wc109="day"]')||document.querySelector('.wc109bt [data-mg="sim"]');if(!b)return false;b.click();await __W.until(()=>!MGR.busy,'sim done',60000);await __W.mgrDrawn('#mgrBody');await new Promise(r=>setTimeout(r,50));return true};
    for(let k=0;k<8&&!C.fin;k++){if(!await sim())break;await __W.until(()=>C.fin||WC109T.bouts(w,C).some(([x])=>!x.done&&x.wc109.d<3),'next day',20000)}return C.fin}};

/* ---------------- the off-season opens: no rudis ask yet; Enter; Days I–II ---------------- */
const pg=await open(0);await pg.evaluate(helpers);
out.days=await ev(pg,async()=>{const w=await BOOTW();po104OffStart(w,w.po104);await WQ();const r={free0:FREE(w),flag:!!gById(__RG).rudis105,win:rudis105Window(w)};
  await ROOM('classic');const sel=document.querySelector('[data-wc109pick]');sel.value=sel.options[0].value;document.querySelector('[data-wc109="in"]').click();
  await __W.until(()=>w.wc109.st==='in','entered',5000);await __W.mgrDrawn('#mgrBody');const fin=await SIMDAYS(w);const C=w.wc109;
  const L=WC109T.bouts(w,C,3);r.fin=(fin||[]).length;r.d3=L.map(([x])=>x.ev+':'+x.wc109.fs+':'+x.ents.length);r.free1=FREE(w);r.win1=rudis105Window(w);
  r.card=!!document.querySelector('.sat109');r.evs=[...document.querySelectorAll('.sat109 [data-sat109ev]')].map(e=>e.textContent.trim().slice(0,40));
  r.tree=/Saturnalia/.test((document.querySelector('.wc109bk')||{}).textContent||'')&&!/provisional/.test((document.querySelector('.wc109bk')||{}).textContent||'');
  r.fins=document.querySelectorAll('.sat109 [data-sat109fin]').length;r.btn=!!document.querySelector('.sat109 [data-wc109="final"]');r.watch=!!document.querySelector('.sat109 [data-mg="watch"]');r.sim=!!document.querySelector('.sat109 [data-mg="sim"]');
  r.sum=WQ_X.sum.classic(w);r.ready=weekReady().ok;
  const cfg=boutCfg(L[0][0],false);r.cfg1={ev:cfg.ev,loc:cfg.loc,chPvp:cfg.chPvp,fest:cfg.fest&&[cfg.fest.kind,cfg.fest.sr,cfg.fest.stage].join(),mgr:!!cfg.mgrCtx};
  return r});
const D=out.days;
ok(D.free0===0&&D.flag&&D.win===false,'the off-season opens with no rudis ask; the earned rudis waits (W4a) '+JSON.stringify(D));
ok(D.fin===4&&D.d3.join()==='chariot:1:4,democritus:2:4'&&D.free1===0&&D.win1===false,'Days I–II: four finalists; Day III = race + Democritus bouts; still no ask '+JSON.stringify(D));
ok(D.card&&D.evs.length===3&&/Carmina/.test(D.evs[0])&&/Chariot/.test(D.evs[1])&&/Democritus/.test(D.evs[2])&&D.tree&&D.fins===4&&D.btn&&D.watch&&D.sim&&/Saturnalia/.test(D.sum)&&D.ready,'room 9: ✦ Saturnalia column, its three events, the four finalists, Watch / Simulate '+JSON.stringify(D));
ok(D.cfg1.ev==='chariot'&&D.cfg1.loc===7&&D.cfg1.chPvp===false&&D.cfg1.fest==='saturnalia,democritus,1'&&D.cfg1.mgr,'stage 1 = the festival\'s chariot race, no PvP, Manager context '+JSON.stringify(D.cfg1));

/* ---------------- stage 1: the race (Carmina first), then a save round-trip ---------------- */
out.race=await ev(pg,async()=>{const w=W_();const C=w.wc109;window.__R0=RECS(w);window.__LOG=[];window.__CARM=[];
  const rc=runCarmina;runCarmina=async function(){__CARM.push({ev:S&&S.evKey,stage:S&&S.fest&&S.fest.stage,sc:S&&S.evKey&&EVENTS[S.evKey].n});return rc.apply(this,arguments)};
  const se=startEvent;startEvent=function(c){try{__LOG.push({ev:c.ev,fs:c.fest&&c.fest.stage,chPvp:c.chPvp,order:c.order||null,cf:(c.seats||[]).map(s=>s.cfStart||0),coin:(c.seats||[]).map(s=>s.coinStart||0),gids:(c.seats||[]).map(s=>s.mgrGid)})}catch(e){}return se.apply(this,arguments)};
  window.__PUT=[];const sp=Store.put;Store.put=function(col){__PUT.push(col);return sp.apply(this,arguments)};
  const b=document.querySelector('.sat109 [data-mg="sim"]');b.click();const L=WC109T.bouts(w,C,3);await __W.until(()=>L[0][0].done&&!MGR.busy,'race done',60000);await __W.mgrDrawn('#mgrBody');
  const r={carm:__CARM.slice(),log:__LOG.map(x=>({ev:x.ev,fs:x.fs,chPvp:x.chPvp})),carry:(C.fest&&C.fest.carry||[]).map(x=>[x.cf,x.coin]),oid:C.fest&&C.fest.oid,race:(C.d[3][1].pl||[]).length,d2:L[1][0].done,
    stage:document.querySelector('.sat109')&&document.querySelector('.sat109').dataset.sat109,raceCol:[...document.querySelectorAll('.sat109 [data-sat109fin] td:nth-child(4)')].map(t=>t.textContent).join(',')};
  /* a reload mid-festival: the world through JSON */
  MGR.world=JSON.parse(JSON.stringify(w));await DRAW();const w2=W_();const C2=w2.wc109;const L2=WC109T.bouts(w2,C2,3);const cfg=boutCfg(L2[1][0],false);
  r.cfg2={ev:cfg.ev,loc:cfg.loc,fs:cfg.fest&&cfg.fest.stage,cf:cfg.seats.map(s=>s.cfStart),coin:cfg.seats.map(s=>s.coinStart),order:cfg.order||null};
  r.carryG=(C2.fest.carry||[]).map(x=>x.gid).join()===L2[1][0].ents.join();return r});
const RA=out.race;
ok(RA.carm.length===1&&RA.carm[0].ev==='chariot'&&RA.carm[0].stage===1&&RA.log.length===1&&RA.log[0].ev==='chariot'&&RA.log[0].fs===1&&RA.log[0].chPvp===false,'Carmina Fescennina opens the race as its ceremony; the race has no PvP '+JSON.stringify(RA));
ok(RA.carry.length===4&&RA.carry.every(([cf,coin])=>coin>=4)&&RA.oid&&RA.oid.length===4&&RA.race===4&&!RA.d2&&RA.stage==='3'&&!/—/.test(RA.raceCol),'the race keeps continueFestival\'s carry (CF, coin + the Saturnalia boon) and its order '+JSON.stringify(RA));
ok(RA.carryG&&RA.cfg2.ev==='democritus'&&RA.cfg2.loc===6&&RA.cfg2.fs===2&&JSON.stringify(RA.cfg2.cf)===JSON.stringify(RA.carry.map(x=>x[0]))&&JSON.stringify(RA.cfg2.coin)===JSON.stringify(RA.carry.map(x=>x[1]))&&JSON.stringify(RA.cfg2.order)===JSON.stringify(RA.oid),'after a reload, stage 2 = Democritus with the carried CF, coin and race order '+JSON.stringify(RA));

/* ---------------- stage 2: Democritus decides the Cup ---------------- */
out.cup=await ev(pg,async()=>{const w=W_();const C=w.wc109;const pm=me();const h0=(w.wc109h||[]).length;const c0=JSON.stringify(w.mgrs.map(m=>m.coin));
  document.querySelector('.sat109 [data-wc109="final"]').click();await __W.until(()=>C.champ!=null&&!MGR.busy,'the Cup decided',60000);await __W.mgrDrawn('#mgrBody');
  const L=WC109T.bouts(w,C,3);const b2=L[1][0];const best=[...b2.res.rows].sort((x,y)=>y.f-x.f)[0];const H=w.wc109h[w.wc109h.length-1];
  const r={log:__LOG.map(x=>({ev:x.ev,fs:x.fs})),carm:__CARM.length,champG:C.champG,best:best.gid,bestF:best.f,fs:b2.res.rows.map(x=>x.f),inFin:C.fin.includes(C.champ),paid:C.paid,h:w.wc109h.length-h0,hk:H&&H.gid,
    same:__R0===RECS(w),alive:L.every(([x])=>x.ents.every(id=>gById(id).alive!==false)),inj:L.flatMap(([x])=>x.ents).filter(id=>gById(id).inj).length,verd:L.flatMap(([x])=>x.res.rows.map(r=>r.vd)),
    pl0:(C.d[3][0].pl||[]).map(x=>x.gid),won:!!document.querySelector('.sat109[data-sat109="done"] .wc109won'),champBox:!!document.querySelector('.wc109bk .v104ch.on'),put:__PUT.filter(c=>c==='hall'||c==='crowd'||c==='infamis').length};
  /* paid once: the same Classic again pays nothing */
  const c1=JSON.stringify(w.mgrs.map(m=>m.coin));WC109T.pay(w,C);r.again=JSON.stringify(w.mgrs.map(m=>m.coin))===c1&&w.wc109h.length-h0===1;r.coinMoved=c0!==c1;
  /* Play Now's records never see a Manager festival */
  const keep=S;const n0=__PUT.length;S={fest:{kind:'saturnalia',stage:2,wc109:{s:1,bi:0}},players:[]};try{await recordEvent([]);await updateCrowdAfterEvent(new Set());await logCustomChars([])}finally{S=keep}r.pn=__PUT.length-n0;
  r.free=FREE(w);r.rud=C.rud;return r});
const CU=out.cup;
ok(CU.log.length===2&&CU.log[1].ev==='democritus'&&CU.log[1].fs===2&&CU.carm===1,'stage 2 = Classic · Democritus, no second Carmina '+JSON.stringify(CU));
ok(CU.champG===CU.best&&CU.pl0[0]===CU.best&&CU.inFin&&CU.paid&&CU.h===1&&CU.hk===CU.champG&&CU.again,'the best festival finish takes the Cup; prizes once, one plate '+JSON.stringify(CU));
ok(CU.same&&CU.alive&&CU.inj===0&&CU.verd.every(v=>v==='clemency')&&CU.won&&CU.champBox,'clemency: nobody dies or keeps a wound, no records; standings + the Cup shown '+JSON.stringify(CU));
ok(CU.put===0&&CU.pn===0,'a Manager festival writes nothing to Play Now\'s Hall / records / crowd '+JSON.stringify(CU));
ok(CU.free>=1&&CU.rud===1,'the rudis ask comes after the Saturnalia (W4a) '+JSON.stringify(CU));

/* ---------------- the ask: room 10 only; answer it; Begin ---------------- */
out.rud=await ev(pg,async()=>{const w=W_();const r={};await ROOM('awards');r.awards=document.querySelectorAll('[data-mg="prudis"]').length;await ROOM('staff');r.staff=document.querySelectorAll('[data-mg="prudis"]').length;
  await ROOM('next');r.next=document.querySelectorAll('[data-sat109rud] [data-mg="prudis"]').length;const bb=document.querySelector('.wq109nav [data-wq109="begin"]');r.beginDis=!!(bb&&bb.disabled);
  r.list=weekChecklist().some(x=>x.ic==='🗡');
  const st=document.querySelector('[data-sat109rud] [data-mg="prudis"][data-id$="|stay"]')||document.querySelector('[data-sat109rud] [data-mg="prudis"]');const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);st.click();
  await __W.until(()=>!FREE(w),'ask answered',8000);clearInterval(hold);await MODALS();await ROOM('next');r.free=FREE(w);
  const hold2=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);document.querySelector('.wq109nav [data-wq109="begin"]').click();await __W.until(()=>W_().season===2,'season 2',30000);clearInterval(hold2);await MODALS();
  r.season=W_().season;r.wk=wkOf(W_().week);return r});
const RU=out.rud;
ok(RU.awards===0&&RU.staff===0&&RU.next>=1&&RU.beginDis&&RU.list,'the freedom ask shows in room 10 only (and blocks Begin, as 380 rules) '+JSON.stringify(RU));
ok(RU.free===0&&RU.season===2&&RU.wk===1,'answered → Begin → season 2 '+JSON.stringify(RU));
await pg.close();

/* ---------------- phone: sit it out; Begin finishes the Saturnalia and stops on the ask ---------------- */
const p2=await open(0,{width:390,height:844});await p2.evaluate(helpers);
out.phone=await ev(p2,async()=>{const w=await BOOTW();po104OffStart(w,w.po104);await WQ();const r={};await ROOM('classic');
  document.querySelector('[data-wc109="out"]').click();await __W.until(()=>w.wc109.st==='out','sat out',5000);await __W.mgrDrawn('#mgrBody');await SIMDAYS(w);await ROOM('classic');
  r.card=!!document.querySelector('.sat109');r.h1=[HSCROLL(),document.scrollingElement.scrollWidth];
  await ROOM('next');const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);document.querySelector('.wq109nav [data-wq109="begin"]').click();
  await __W.until(()=>w.wc109.champ!=null&&!MGR.busy,'Begin played the Saturnalia',90000);await __W.until(()=>FREE(w)>0,'the ask',8000);clearInterval(hold);await MODALS();await __W.mgrDrawn('#mgrBody');
  r.season=w.season;r.step=document.querySelector('.wq109')&&document.querySelector('.wq109').dataset.wq109step;r.box=!!document.querySelector('[data-sat109rud]');r.h2=[HSCROLL(),document.scrollingElement.scrollWidth];
  r.L=WC109T.bouts(w,w.wc109,3).map(([x])=>x.ev+':'+x.done);r.hist=(w.wc109h||[]).length;
  let g=0;while(FREE(w)&&g++<10)settlePending(w.pend.findIndex(p=>p.t==='rudis'||p.t==='buyfree'),'stay');
  const hold2=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);await ROOM('next');document.querySelector('.wq109nav [data-wq109="begin"]').click();await __W.until(()=>W_().season===2,'season 2',30000);clearInterval(hold2);await MODALS();
  r.season2=W_().season;return r});
const PH=out.phone;
ok(PH.card&&!PH.h1[0]&&!PH.h2[0],'phone 390 px: the Saturnalia card and room 10 with the ask, no horizontal scroll '+JSON.stringify(PH));
ok(PH.season===1&&PH.step==='next'&&PH.box&&PH.L.join()==='chariot:true,democritus:true'&&PH.hist===1&&PH.season2===2,'sit it out: Begin plays the Saturnalia, stops in room 10 on the ask; then season 2 '+JSON.stringify(PH));
await p2.close();

/* ---------------- the kill switch: v1.09b's provisional Day III ---------------- */
const p3=await open(1);await p3.evaluate(helpers);
out.off=await ev(p3,async()=>{const w=await BOOTW();po104OffStart(w,w.po104);await WQ();const r={C:window.V109C&&window.V109C.on,free0:FREE(w)};await ROOM('classic');
  document.querySelector('[data-wc109="out"]').click();await __W.until(()=>w.wc109.st==='out','sat out',5000);await __W.mgrDrawn('#mgrBody');await SIMDAYS(w);
  r.prov=/provisional/.test((document.querySelector('.wc109bk')||{}).textContent||'');r.card=!!document.querySelector('.sat109');
  document.querySelector('[data-wc109="final"]').click();await __W.until(()=>w.wc109.champ!=null&&!MGR.busy,'the Cup decided',60000);
  r.d3=WC109T.bouts(w,w.wc109,3).map(([x])=>x.ev+':'+x.ents.length);return r});
ok(out.off.C===false&&out.off.free0>=1&&out.off.prov&&!out.off.card&&out.off.d3.join()==='democritus:4','kill switch: v1.09b — asks at the opening, the provisional one-bout final '+JSON.stringify(out.off));
await p3.close();

console.log(JSON.stringify(out).slice(0,5000));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.slice(0,10)));await b.close();process.exit(miss.length||errs.length?1:0)})();

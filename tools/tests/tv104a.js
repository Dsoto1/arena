/* tv104a — v1.04 THE SEASON'S SHAPE (348-v104season): the calendar (byes 4 & 12, Rivalry Week 11 + its letter at week 10), the projected bracket from
   week 9 (League + Match Week), the SUPERBUS PLAYOFFS (seeds by league points, Round 1 = seeds 5–12 in two 4-house bouts, semifinals with seeds 1–4,
   the final; top 2 by the event's own order; one gladiator per house per round + your picker; no league points, no fixing / entering / withdrawing;
   prizes; frozen weeks: w.week stays 11, injuries move on, once-a-week marks freed), Superbus Week (regal card, letters, w.finale / w.sb103, awards),
   the OFF-SEASON WEEK (podium, Season in Review letter, league awards incl. Best Record, contract renewals, OFF104.on / active / BUS 'season.offseason'),
   season 2 starts without the old Superbus special; SAVE_MIGRATIONS '1.04' (a running career switches next season); kill switch flavius_v104aoff=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_v106b1off','1');if(o)localStorage.setItem('flavius_v104aoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=9000;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    window.ENS=async()=>{const el=document.querySelector('#mgrBody');if(!el||!el.offsetParent){menuHide();openManager(MGR.tab||'ludus');await W8(900)}};
    window.PW=async(keep)=>{const w=W_(),pm=me();if(!keep)for(const g of rosterOf(pm)){g.inj=null;g.contract.weeks=Math.max(g.contract.weeks,30)}
      if(w.special&&!w.special.done)await specAutoRun();
      for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k);
      let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];try{if(P.t==='thumb')settlePending(0,null,{d6:6,d12:12});else if(P.t==='blood')settlePending(0,'let');else settlePending(0,'stay')}catch(e){w.pend.shift()}}
      const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let rr;try{rr=await endWeek()}finally{clearInterval(hold)}await W8(150);return rr};
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('ludus');await W8(600);MGR.view=null});return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));console.log(JSON.stringify(out,null,1).slice(0,6000));await b.close();process.exit(1)}};

const pg=await open(false);

/* ---- the calendar ---- */
out.cal=await ev(pg,()=>{const w=W_();return {cal:w.cal104,season:w.season,bye:BYE_WKS.join(),riv:RIVAL_WK,b12:isByeWk(12),b11:isByeWk(11),fx11:fixtureFor(w.season,11).ev}});
ok(out.cal.cal===1&&out.cal.bye==='4,12'&&out.cal.riv===11&&out.cal.b12&&!out.cal.b11&&out.cal.fx11==='familia','calendar '+JSON.stringify(out.cal));

/* ---- weeks 1–8, then the projected bracket at week 9 ---- */
out.w9=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const r={};let g=0;while(wkOf(w.week)<9&&g++<12)if(!await PW())break;r.wk=wkOf(w.week);
  r.byeNight=null;await ENS();
  MGR.tab='league';MGR_REDRAW();await W8(800);/* v1.04 B21 (355): the League banner's bracket button opens the League "Superbus" view (the tree: R1 A/B, Semi I/II, the final = 5 boxes) */
  const lb=document.querySelector('.roomhd.b73-league [data-v104s="sb"]')||document.querySelector('.roomhd.b73-league [data-po104="bracket"]');r.league=!!lb;r.sub=(document.querySelector('.roomhd.b73-league .sub')||{}).textContent||'';
  if(lb){lb.click();await W8(500);const o=document.querySelector('#mgrPane .po104bk')||document.querySelector('#po104br .po104bk');r.proj=o?o.dataset.po104proj:'';r.txt=o?o.textContent:'';r.boxes=o?o.querySelectorAll('.po104b').length:0;po104Close();MGR.sb104v=0}
  MGR.tab='night';MGR_REDRAW();await W8(800);r.night=!!document.querySelector('.roomhd.b73-night [data-po104="bracket"]');return r});
ok(out.w9.wk===9&&out.w9.league&&out.w9.night&&out.w9.proj==='1'&&/If the season ended today/.test(out.w9.txt)&&(out.w9.boxes===5||out.w9.boxes===6)&&/12 houses/.test(out.w9.sub),'projected bracket week 9 '+JSON.stringify(out.w9).slice(0,400));

/* ---- week 10: the rivalry letter; week 11: Rivalry Week ---- */
out.riv=await ev(pg,async()=>{const w=W_();const r={};await PW();r.wk10=wkOf(w.week);r.letter=!!(w.letters||[]).find(L=>L.key==='rival-'+w.season);r.lockAbs=w.rivalry&&w.rivalry.abs;
  await PW();r.wk11=wkOf(w.week);r.rivNight=!!w.night.rivalry;r.frozen=OFF104.frozen(w);r.phase=OFF104.phase(w);return r});
ok(out.riv.wk10===10&&out.riv.letter&&out.riv.lockAbs===11&&out.riv.wk11===11&&out.riv.rivNight&&out.riv.frozen&&out.riv.phase==='','rivalry week 11 '+JSON.stringify(out.riv));

/* ---- the end of week 11 → Round 1 (your house forced into Round 1) ---- */
out.r1=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const r={};
  for(const k of w.night.bouts.keys())if(!w.night.bouts[k].done)await runBoutSim(k);
  msp(pm).pts=-99;r.ok=await PW();r.week=w.week;r.ph=OFF104.phase(w);const P=w.po104;r.seeds=P.seeds.length;r.mySeed=P.seeds.indexOf('m:'+pm.id)+1;
  const n=w.night;r.bouts=n.bouts.map(b=>b.tier+':'+b.ents.length+':'+new Set(b.po104.k).size).join();r.r1keys=JSON.stringify(P.r1.map(x=>x.k))===JSON.stringify([[4,7,8,11],[5,6,9,10]].map(ix=>ix.map(i=>P.seeds[i])));
  r.letter=!!(w.letters||[]).find(L=>L.key==='po104-r1-'+w.season);r.frozen=OFF104.frozen(w);r.lag=calLag();
  const M=po104MyBout(w);r.mine=!!M;r.rig=n.bouts.every(b=>!boutRiggable(b));
  /* two fresh fit fighters so the picker has a choice */
  for(let i=0;i<2;i++){const g=genGlad({ovr:66+i});g.contract={mgr:pm.id,wage:3,weeks:30,since:w.week};w.glads.push(g);
    /* v1.06 (393): the Superbus takes only the roster at the trade deadline (end of week 8) — these two count as signed before it */
    if(typeof lk106Snap==='function'){const L=lk106Snap(w);if(L&&L.r[pm.id])L.r[pm.id].push(g.id)}}
  await ENS();MGR.tab='night';MGR_REDRAW();await W8(800);
  r.card=!!document.querySelector('.po104card.sb103c .sb103ban');r.rail=(document.querySelector('.mtabs [data-id="night"]')||{}).textContent||'';r.cards=document.querySelectorAll('.card2.bout.sb104').length;
  r.noTravel=!document.querySelector('#mgrBody .travelcard');const sel=document.querySelector('[data-po104pick]');r.pick=!!sel;
  if(sel&&M){const alt=[...sel.options].map(o=>o.value).find(v=>v!==M.b.ents[M.j]);if(alt){sel.value=alt;sel.dispatchEvent(new Event('change',{bubbles:true}));await W8(300);r.picked=W_().night.bouts[M.bi].ents[M.j]===alt}else r.picked='one'}
  /* entering / withdrawing is refused on the Superbus card */
  const e0=JSON.stringify(n.bouts.map(b=>b.ents));const wd=document.querySelector('#mgrBody [data-mg="withdraw"],#mgrBody [data-mg="enter"]');if(wd){wd.click();await W8(300)}r.guard=JSON.stringify(W_().night.bouts.map(b=>b.ents))===e0;
  /* the bracket overlay is the real one now */
  /* v1.04 B21 (355): the real bracket is shown open on the page (no button); the overlay when the kill switch is on */
  const inl=document.querySelector('#mgrBody .po104bk');if(inl)r.real=inl.dataset.po104proj;
  const bb=!inl&&document.querySelector('.po104card [data-po104="bracket"]');if(bb){bb.click();await W8(300);r.real=(document.querySelector('#po104br .po104bk')||{dataset:{}}).dataset.po104proj;po104Close()}
  /* league points: the table stays the seeding table */
  r.pts0=JSON.stringify(w.mgrs.map(m=>msp(m).pts));for(const k of n.bouts.keys())if(!n.bouts[k].done)await runBoutSim(k);r.ptsSame=JSON.stringify(w.mgrs.map(m=>msp(m).pts))===r.pts0;
  r.order=n.bouts.map(b=>po104Order(b).map(x=>x.k));
  /* once-a-week marks + injuries move on with the frozen week */
  const g=rosterOf(pm).find(x=>!n.bouts.some(b=>b.ents.includes(x.id)))||rosterOf(pm)[0];g.restWk=w.week;w.clk87={wk:w.week,n:3};const h=rosterOf(pm).find(x=>x!==g)||g;h.inj={until:w.week+3,label:'a cut',pen:2};r.injId=h.id;r.restId=g.id;r.roster=rosterOf(pm).length;r.fits=po104Fits(w,pm).length;
  return r});
ok(out.r1.ok&&out.r1.week===11&&out.r1.ph==='r1'&&out.r1.seeds===12&&out.r1.mySeed>=5&&out.r1.r1keys&&out.r1.bouts==='sb104:4:4,sb104:4:4'&&out.r1.letter&&out.r1.frozen&&out.r1.lag===0,'round 1 set '+JSON.stringify(out.r1).slice(0,600));
ok(out.r1.mine&&out.r1.pick&&out.r1.picked===true&&out.r1.guard&&out.r1.rig,'round 1 your pick + guards '+JSON.stringify(out.r1).slice(0,600));
ok(out.r1.card&&/Superbus/.test(out.r1.rail)&&out.r1.cards===2&&out.r1.noTravel&&out.r1.real==='0'&&out.r1.ptsSame,'round 1 card / rail / bracket / no league points '+JSON.stringify(out.r1).slice(0,600));

/* ---- Round 1 → the semifinals ---- */
out.sf=await ev(pg,async(a)=>{const w=W_();const r={};const pays=[];const op=po104Pay;po104Pay=function(...x){pays.push(x[1]+':'+x[2]);return op.apply(this,x)};
  const P=w.po104;r.ph0=OFF104.phase(w);const ord=w.night.bouts.map(b=>po104Order(b).map(x=>x.k));r.ok=await PW(true);po104Pay=op;r.week=w.week;r.ph=OFF104.phase(w);
  r.adv=JSON.stringify(P.r1.map(x=>x.adv))===JSON.stringify(ord.map(o=>o.slice(0,2)));
  r.sfKeys=JSON.stringify(P.sf.map(x=>x.k))===JSON.stringify([[P.seeds[0],P.seeds[3],...ord[0].slice(0,2)],[P.seeds[1],P.seeds[2],...ord[1].slice(0,2)]]);
  r.bouts=w.night.bouts.map(b=>b.tier+':'+b.ents.length).join();r.nightKeys=JSON.stringify(w.night.bouts.map(b=>b.po104.k))===JSON.stringify(P.sf.map(x=>x.k));
  r.pays=pays.length;r.pay40=pays.length===8&&pays.every(x=>/:40$/.test(x));
  const g=gById(a.rest),h=gById(a.inj);r.rest=g?g.restWk:null;r.clk=w.clk87?w.clk87.wk:null;r.inj=h&&h.inj?h.inj.until:null;return r},{rest:out.r1.restId,inj:out.r1.injId});
ok(out.sf.ph0==='r1'&&out.sf.ok&&out.sf.week===11&&out.sf.ph==='sf'&&out.sf.adv&&out.sf.sfKeys&&out.sf.bouts==='sb104:4,sb104:4'&&out.sf.nightKeys,'semifinals '+JSON.stringify(out.sf));
ok(out.sf.pay40,'round-1 prizes (8 × 40) '+JSON.stringify(out.sf));
ok(out.sf.rest===10&&out.sf.clk===10&&out.sf.inj===13,'frozen week: marks freed + injuries a week on '+JSON.stringify(out.sf));

/* ---- the semifinals → Superbus Week (the final) ---- */
out.fin=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const r={};const P=w.po104;for(const k of w.night.bouts.keys())if(!w.night.bouts[k].done)await runBoutSim(k);const ord=w.night.bouts.map(b=>po104Order(b).map(x=>x.k));r.ok=await PW();
  r.ph=OFF104.phase(w);r.finKeys=JSON.stringify(P.fin.k)===JSON.stringify([...ord[0].slice(0,2),...ord[1].slice(0,2)]);r.bouts=w.night.bouts.length+':'+w.night.bouts[0].ents.length;
  r.letter=!!(w.letters||[]).find(L=>L.key==='po104-fin-'+w.season);r.frozen=OFF104.frozen(w);
  /* a contract that runs out soon: the off-season will ask a raise */
  const pm=me();const g=rosterOf(pm).find(x=>!w.night.bouts[0].ents.includes(x.id));if(g){g.contract.weeks=5;r.renId=g.id;g.ss={s:w.season,ev:4,w:3,kp:0,kn:0,dmg:0,taken:0,best:0,worst:0,o0:g.ovr}}
  await ENS();MGR.tab='night';MGR_REDRAW();await W8(800);r.rail=(document.querySelector('.mtabs [data-id="night"]')||{}).textContent||'';r.ban=(document.querySelector('.po104card .sb103ban')||{}).textContent||'';return r});
ok(out.fin.ok&&out.fin.ph==='fin'&&out.fin.finKeys&&out.fin.bouts==='1:4'&&out.fin.letter&&!out.fin.frozen&&/Superbus Week/.test(out.fin.rail)&&/SUPERBUS WEEK/.test(out.fin.ban),'the final '+JSON.stringify(out.fin));

/* ---- the final → the off-season week ---- */
out.off=await ev(pg,async(renId)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const r={};const seen=[];const offH=OFF104.on((w2,ctx)=>{seen.push(ctx.season);ctx.add('TESTLINE104')});
  const bus=[];const offB=BUS.on('season.offseason',d=>bus.push(d.season));const P=w.po104;if(!w.night.bouts[0].done)await runBoutSim(0);const ord=po104Order(w.night.bouts[0]);r.ok=await PW(true);offH();offB();
  r.week=w.week;r.wk=wkOf(w.week);r.ph=OFF104.phase(w);r.active=OFF104.active(w);r.bouts=w.night.bouts.length;r.hooks=seen.join();r.bus=bus.join();
  r.champ=P.champ===ord[0].k&&w.finale&&w.finale.season===1&&w.finale.champ===(gById(ord[0].gid)||{}).name;r.sb=!!(w.sb103&&w.sb103.season===1);r.rev=!!(w.review&&w.review.sb103);
  r.log=(w.specialLog||[]).some(x=>/Superbus/.test(x.n)&&x.season===1);r.aw=((w.awardShow||{}).awards||[]).map(a=>a.tid);
  const L=(w.letters||[]).find(x=>x.key==='sr104-1');r.letter=!!L&&/TESTLINE104/.test(L.body)&&/League awards/.test(L.body);
  r.ren=(P.ren||[]).find(x=>x.gid===renId);
  await ENS();MGR.tab='night';MGR_REDRAW();await W8(800);r.pod=document.querySelectorAll('.po104off .po104pod .po104p').length;r.offTxt=(document.querySelector('.po104off')||{}).textContent||'';
  r.rail=(document.querySelector('.mtabs [data-id="night"]')||{}).textContent||'';
  const g=gById(renId);const w0=g&&g.contract.weeks;const btn=document.querySelector(`[data-po104="ren|${renId}|y"]`);r.btn=!!btn;if(btn){btn.click();await W8(400)}
  r.signed=!!(g&&r.ren&&g.contract.wage===r.ren.wage&&g.contract.weeks===w0+12);return r},out.fin.renId);
ok(out.off.ok&&out.off.week===12&&out.off.ph==='off'&&out.off.active&&out.off.bouts===0&&/Off-season/.test(out.off.rail),'off-season week '+JSON.stringify(out.off).slice(0,500));
ok(out.off.champ&&out.off.sb&&out.off.rev&&out.off.log,'the champion / Superbus review '+JSON.stringify(out.off).slice(0,500));
ok(['aureus','lg104rec','tiro','iron_thumb','palm_roma'].every(t=>out.off.aw.includes(t)),'league awards '+JSON.stringify(out.off.aw));
ok(out.off.hooks==='1'&&out.off.bus==='1'&&out.off.letter&&out.off.pod===4&&/Season 1 in review/.test(out.off.offTxt),'OFF104 hooks + letter + podium '+JSON.stringify(out.off).slice(0,600));
ok(out.off.ren&&out.off.ren.kind==='raise'&&out.off.btn&&out.off.signed,'contract renewal '+JSON.stringify(out.off.ren));

/* ---- the off-season ends: season 2, no old Superbus special ---- */
out.s2=await ev(pg,async()=>{const w=W_();const r={};r.ok=await PW();r.season=w.season;r.wk=wkOf(w.week);r.abs=w.week;r.special=!!w.special;r.due=!!w.finaleDue;r.phase=w.po104.phase;
  r.news=(w.news||[]).some(n=>/set for Roma|invited to the Flavius Superbus/.test(String(n.t||n.h||n.txt||JSON.stringify(n))));r.ar=!!((w.archives||[]).find(a=>a.season===1)||{}).finale;r.bye=BYE_WKS.join();r.riv=RIVAL_WK;return r});
ok(out.s2.ok&&out.s2.season===2&&out.s2.wk===1&&out.s2.abs===13&&!out.s2.special&&!out.s2.due&&out.s2.phase==='done'&&!out.s2.news&&out.s2.bye==='4,12'&&out.s2.riv===11,'season 2 '+JSON.stringify(out.s2));

/* ---- SAVE_MIGRATIONS '1.04': a running career keeps its calendar until next season ---- */
out.mig=await ev(pg,()=>{const w=W_();const r={};const c0=w.cal104;w.week=17;delete w.cal104;w.ver='1.03';migrateWorld(w);r.cal=w.cal104;cal104Sync(w);r.old=BYE_WKS.join()+'/'+RIVAL_WK;
  r.next=po104Next(w);w.season=3;cal104Sync(w);r.new3=BYE_WKS.join()+'/'+RIVAL_WK;w.season=2;w.cal104=c0;w.week=13;cal104Sync(w);
  const x={week:25,season:3};cal104Init(x);r.wk1=x.cal104;return r});
ok(out.mig.cal===3&&out.mig.old==='4,11/12'&&out.mig.next===''&&out.mig.new3==='4,12/11'&&out.mig.wk1===3,'migration '+JSON.stringify(out.mig));

/* ---- a phone: the bracket fits 390 px ---- */
await pg.setViewportSize({width:390,height:800});
out.ph=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));po104Open();await W8(300);const box=document.querySelector('#po104br .po104box');const r={w:box?Math.round(box.getBoundingClientRect().width):0,sw:box?box.scrollWidth:0,cw:box?box.clientWidth:0};po104Close();return r});
ok(out.ph.w>0&&out.ph.w<=390&&out.ph.sw<=out.ph.cw+2,'phone bracket '+JSON.stringify(out.ph));
out.errs=await ev(pg,()=>typeof errNew92==='function'?errNew92(window.RM_MARK).map(e=>e.kind+':'+e.msg):[]);

/* ---- kill switch: the old calendar and the old Superbus ---- */
const pg2=await open(true);
out.off2=await ev(pg2,async()=>{const w=W_();const r={};r.bye=BYE_WKS.join();r.riv=RIVAL_WK;r.fx12=fixtureFor(w.season,12).ev;w.week=11;r.frozen=OFF104.frozen(w);r.next=po104Next(w);
  w.week=12;makeNight();r.ok=await PW();r.special=!!(w.special&&w.special.D&&w.special.D.finale);r.po=!!w.po104;return r});
ok(out.off2.bye==='4,11'&&out.off2.riv===12&&out.off2.fx12==='familia'&&!out.off2.frozen&&out.off2.next===''&&out.off2.ok&&out.off2.special&&!out.off2.po,'kill switch '+JSON.stringify(out.off2));
out.errs=out.errs.concat(await ev(pg2,()=>typeof errNew92==='function'?errNew92(window.RM_MARK).map(e=>e.kind+':'+e.msg):[]));
ok(!out.errs.length,'00c errors '+JSON.stringify(out.errs));
console.log(JSON.stringify(out,null,1).slice(0,5000));console.log('PAGEERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));
await b.close();process.exit(miss.length||errs.length?1:0)})();

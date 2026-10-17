/* tv105t — v1.05 Rivalry Week + Yard ladder (383-v105riv, his C1a B62 B63): the Training Yard ladder names the Council Doctore's bonus ("+1 from <name> (your
   Doctore advisor)", free steps, hours still needed); Rivalry Week (week 11) costs NO travel (the trip is paid by the games, no coin taken, label on the travel
   card); in week 11 the player's house is seated in its rivalry bout with its two best fit fighters WITHOUT opening any letter, the rival is seated too; the pair
   can be changed until set-off (locked after); with fewer than 2 fit fighters a warning + the forfeit rule (fame, free agents) and healing re-seats his own;
   kill switch flavius_v105rivoff=1 (old ladder labels, no free trip, no pair card). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105rivoff','1')},off?1:0);
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

/* ---- C1a: the Yard ladder with the Council Doctore's bonus ---- */
const pg=await open(false);
out.lad=await ev(pg,()=>{const w=W_(),pm=me();const r={};const keep=ADV100.docK;ADV100.docK=()=>1;try{thPlan(w).doc=1;r.adv=y105Adv(w,pm);const h=y105DocHTML(w,pm);const d=document.createElement('div');d.innerHTML=h;
  r.lads=(d.querySelector('.y105lads')||{}).textContent||'';r.note=(d.querySelector('.y105advn')||{}).textContent||'';r.line=(d.querySelector('.y105sub')||{}).textContent||''}finally{ADV100.docK=keep;thPlan(w).doc=0}return r});
ok(out.lad.adv===1&&/Lv 1 · free/.test(out.lad.lads)&&/Lv 2 · ✓/.test(out.lad.lads)&&/\+1 from .+ \(your Doctore advisor\)/.test(out.lad.note)&&/\+1 from/.test(out.lad.line),'ladder with advisor '+JSON.stringify(out.lad));

/* ---- weeks 1-10 (no letter opened), then week 11: Rivalry Week ---- */
out.w11=await ev(pg,async()=>{const w=W_(),pm=me();const r={};let g=0;while(wkOf(w.week)<10&&g++<12)if(!await PW())break;r.wk10=wkOf(w.week);
  r.pairsPm=!!(w.rivalry&&w.rivalry.pairs.some(p=>p.includes(pm.id)));r.noCommit=!Object.keys((w.rivalry||{}).commit||{}).length;
  r.neverBye=Array.from({length:60},()=>rivalPairs(w).bye.includes(pm.id)).every(x=>!x);
  await PW();r.wk=wkOf(w.week);const n=w.night;r.riv=!!n.rivalry;const b=n.bouts.find(x=>x.rivalry&&(x.rivalry.a===pm.id||x.rivalry.b===pm.id));r.has=!!b;
  if(b){const mine=b.ents.map(gById).filter(x=>x&&x.contract&&x.contract.mgr===pm.id);r.mine=mine.length;const other=b.rivalry.a===pm.id?b.rivalry.b:b.rivalry.a;r.rival=b.ents.map(gById).filter(x=>x&&x.contract&&x.contract.mgr===other).length;
    const fit=rosterOf(pm).filter(x=>riv105Fit(x,w)).sort((x,y)=>effOvr(y)-effOvr(x)).slice(0,2).map(x=>x.id);r.best=mine.every(x=>fit.includes(x.id))}
  /* B62: away city, the trip costs nothing */
  const L=n.loc===6?4:6;pm.city=LOCATIONS[n.loc===6?4:6].n;n.travel=null;const c0=pm.coin;const t=travelState(w);r.cost=t.cost;r.free=!!t.free105;r.paid=t.paid;r.coin=pm.coin-c0;
  r.card=travelCardHTML();return r});
ok(out.w11.wk10===10&&out.w11.pairsPm&&out.w11.noCommit&&out.w11.neverBye,'week 10 lock, no letter opened '+JSON.stringify(out.w11));
ok(out.w11.wk===11&&out.w11.riv&&out.w11.has&&out.w11.mine===2&&out.w11.rival===2&&out.w11.best,'house and rival seated, best two '+JSON.stringify(out.w11));
ok(out.w11.cost>0&&out.w11.free&&out.w11.paid&&out.w11.coin===0&&/paid by the games/.test(out.w11.card),'trip free '+JSON.stringify(out.w11));

/* ---- edit the pair until set-off ---- */
out.edit=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const r={};MGR.tab='night';MGR_REDRAW();await W8(800);const q=s=>document.querySelector(s);r.card=!!q('[data-riv105card]');
  const A=q('#riv105A'),B=q('#riv105B');if(!A||!B)return r;const ids=[...A.options].map(o=>o.value);r.n=ids.length;
  if(ids.length>=3){const R=riv105Bout(w);const cur=R.slots.map(s=>R.b.ents[s]);const rest=ids.filter(x=>!cur.includes(x));A.value=rest[0];B.value=cur[0];q('[data-riv105="set"]').click();await W8(500);
    r.now=R.slots.map(s=>R.b.ents[s]);r.want=[rest[0],cur[0]];r.ok=r.now[0]===r.want[0]&&r.now[1]===r.want[1]}
  w.night.travel.gone=true;r.locked=riv105Locked(w);MGR_REDRAW();await W8(500);r.dis=!!(q('[data-riv105="set"]')||{}).disabled;w.night.travel.gone=false;return r});
ok(out.edit.card&&(out.edit.n<3||out.edit.ok)&&out.edit.locked&&out.edit.dis,'edit pair '+JSON.stringify(out.edit));

/* ---- fewer than 2 fit: the warning + the forfeit rule, then healing reseats ---- */
const pg2=await open(false);
out.few=await ev(pg2,async()=>{const w=W_(),pm=me();const r={};let g=0;while(wkOf(w.week)<10&&g++<12)if(!await PW())break;
  const ros=rosterOf(pm);for(const x of ros.slice(1))x.inj={until:w.week+3,label:'t',pen:2};const f0=pm.fame;await PW(true);
  r.wk=wkOf(w.week);const n=w.night;const b=riv105Bout(w).b;const own=()=>riv105Bout(w).slots.map(s=>gById(b.ents[s])).filter(x=>x&&x.contract&&x.contract.mgr===pm.id).length;
  r.fit=rosterOf(pm).filter(x=>riv105Fit(x,w)).length;r.own=own();r.fameDrop=f0-pm.fame;r.html=nightHTML();r.warn=/Only 1 fit fighter/.test(r.html);
  for(const x of rosterOf(pm))x.inj=null;const h2=nightHTML();r.own2=own();r.warn2=/Only \d fit fighter/.test(h2);return r});
ok(out.few.wk===11&&out.few.fit===1&&out.few.own<=1&&out.few.warn&&out.few.fameDrop>=1,'one fit fighter: warning + forfeit '+JSON.stringify({...out.few,html:0}));
ok(out.few.own2===2&&!out.few.warn2,'healed: reseated '+JSON.stringify({...out.few,html:0}));

/* ---- kill switch ---- */
const pg3=await open(true);
out.off=await ev(pg3,async()=>{const w=W_(),pm=me();const r={};const keep=ADV100.docK;ADV100.docK=()=>1;try{thPlan(w).doc=1;const d=document.createElement('div');d.innerHTML=y105DocHTML(w,pm);r.lads=(d.querySelector('.y105lads')||{}).textContent||'';r.note=!!d.querySelector('.y105advn')}finally{ADV100.docK=keep;thPlan(w).doc=0}
  let g=0;while(wkOf(w.week)<10&&g++<12)if(!await PW())break;await PW();const n=w.night;r.riv=!!n.rivalry;n.travel=null;pm.city=LOCATIONS[n.loc===6?4:6].n;const t=travelState(w);r.free=!!t.free105;r.html=/data-riv105card/.test(nightHTML());return r});
ok(/Lv 1 · 1 h/.test(out.off.lads)&&!out.off.note&&out.off.riv&&!out.off.free&&!out.off.html,'kill switch '+JSON.stringify(out.off));

out.errs=await ev(pg,()=>typeof errNew92==='function'?errNew92(window.RM_MARK).map(e=>e.kind+':'+e.msg):[]);
ok(!out.errs.length,'00c errors '+JSON.stringify(out.errs));
console.log(JSON.stringify(out,null,1).slice(0,5000));console.log('ERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));
await b.close();process.exit(miss.length||errs.length?1:0)})();

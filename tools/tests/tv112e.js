/* tv112e — v1.12 ECONOMY TUNING (427-v112econ P1 + P6, his 1a) + the Trades 2 fixes in 426 (his 3a 4a):
   P1 a real week's end pays the player's patron +round(10 + 0.3 × fame), booked in 413's ledger as 'patron' (the Accounts room shows a
   "Patron" bar) with a "Your patron: +N coin" line in the ludus ledger; never twice for one week end, nothing while bouts are unplayed;
   P6 a rival below 40 is topped up toward 40 (≤ one stipend) at most once a season, also through aiLanistaWeek;
   3a a fighter the house RECEIVES below its roster's median rating counts 50% of tr106Val (1-for-1 + bundles): weak tiro + the coin gap
   at full value is refused, at half value accepted; 4a a settling-in fighter can't be the MAIN fighter (option disabled with the tag +
   reason, the pick moves, tradego refuses him, all settling → Send disabled); kill switch flavius_v112econoff=1 → no patron, no top-up. */
const {chromium}=require('playwright');const T=require('./_wait');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(ls)=>{const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\.g/,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await T.boot(pg,{seed:1,ls:ls||{}});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=3000;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.severed=[];g.contract.since=0;g.contract.weeks=Math.max(g.contract.weeks,6);g.morale=80;delete g.loanFrom}
    menuHide();openManager('roster');await W8(900);MGR.view=null;window.C_MARK=typeof ERR92!=='undefined'?ERR92.n:0;
    /* play this week's bouts and end the week (the game's own path) */
    window.__WK=async()=>{const w=W_();if(w.special&&!w.special.done&&typeof specAutoRun==='function')await specAutoRun();
      try{const t=typeof travelState==='function'?travelState(w):null;if(t&&!t.paid&&t.cost>0)travelClick('travelpay');const t2=travelState(w);if(t2&&t2.paid){if(typeof mw105Go==='function')mw105Go(w);else w.night.travel.gone=true}}catch(e){console.error(e)}
      if(w.night&&!w.night.bye)for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k);w.pend=[];
      const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let r;try{r=await endWeek()}finally{clearInterval(hold)}await W8(300);return r}});
  return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));await b.close();process.exit(1)}};

const pg=await open();
out.on=await ev(pg,async()=>{const r={};const w=W_(),pm=me();
  /* P1 a real week end */
  const L0=(w.led109&&w.led109.c&&w.led109.c.patron)||{i:0};const i0=L0.i||0;
  let amt=null;{const b=endWeek;endWeek=async function(){amt=Math.round(10+(me().fame||0)*0.3);return b.apply(this,arguments)};try{r.ended=await __WK()}finally{endWeek=b}}
  const P=(w.led109.c.patron)||{i:0};r.amt=amt;r.booked=P.i-i0;r.patron=r.ended!==false&&amt>0&&r.booked===amt;
  r.news=(w.tlog||[]).some(x=>x.text.includes('Your patron: +'+amt+' coin'));
  const X=led109Sheet(w,pm);const row=X.rows.find(x=>x[0]==='patron');r.sheet=!!row&&row[3]===P.i&&X.rows.findIndex(x=>x[0]==='patron')===X.rows.findIndex(x=>x[0]==='senate')-1;
  r.books=typeof wqBooks==='function'&&/data-wq109cat="patron"/.test(wqBooks(w));
  /* once per week end; nothing while this week's bouts wait */
  const c1=pm.coin;r.once=e112PatronWeek()===0&&pm.coin===c1;w.e112p=null;r.waits=(w.night.bye||!w.night.bouts.length)||(e112PatronWeek()===0&&pm.coin===c1&&w.e112p===null);
  /* P6 the rivals' floor */
  const R=w.mgrs.filter(m=>!m.isPlayer&&!m.sica&&!m.dead);const x=R[0];x.coin=5;delete x.e112top;const st=Math.round(22+(x.fame||0)*0.6);
  e112RivalFloor(w);r.top=x.coin===Math.min(40,5+st)&&x.e112top===w.season;x.coin=5;e112RivalFloor(w);r.topOnce=x.coin===5;
  const s0=w.season;w.season=s0+1;e112RivalFloor(w);r.topNext=x.coin>5;w.season=s0;
  const y=R[1];y.coin=-30;delete y.e112top;aiLanistaWeek();r.topWrap=y.e112top===w.season;
  /* 3a received below the median = half */
  const m=R.find(h=>rosterOf(h).length>=3&&cap104N(h)+1<=cap104(h))||R[2];m.relB=80;m.rivalry=0;m.rivals={};m.envoyWk=-1;m.p.greed=50;m.coin=Math.max(m.coin,600);
  const med=t112Med(m);const weak=genGlad({ovr:30});if(!gById(weak.id))w.glads.push(weak);weak.alive=true;weak.inj=null;weak.fame=0;weak.contract={mgr:pm.id,wage:1,weeks:8,since:0};
  for(let i=0;i<10&&effOvr(weak)>=med;i++)weak.ovr=Math.max(10,weak.ovr-5);
  const v=tr106Val(weak);r.recv={v,med,ovr:effOvr(weak)};
  r.half=v>0&&effOvr(weak)<med&&Math.abs(tradeVal(weak,m)*6-v*0.5)<1e-9&&Math.abs(t112Recv(m,weak)-v*0.5)<1e-9;
  const top=[...rosterOf(pm)].filter(g=>g!==weak).sort((a,b)=>effOvr(b)-effOvr(a))[0];r.full=effOvr(top)<med||Math.abs(t112Recv(m,top)-tr106Val(top))<1e-9;
  r.bun=Math.abs(c104BunVal([top,weak],0,m)*6-t112Bundle([top,weak],0,m))<1e-9&&Math.abs(t112Bundle([top,weak],0,m)-(Math.max(t112Recv(m,top),v*0.5)+Math.min(t112Recv(m,top),v*0.5)*0.55))<1e-6;
  const gt=[...rosterOf(m)].sort((a,b)=>effOvr(b)-effOvr(a))[0];
  const need=c104Need(m,gt)*6;const cFull=Math.max(0,Math.ceil(need-v)+1),cHalf=Math.ceil(need-v*0.5)+1;
  const send=async(g,coin)=>{MGR.teamId=m.id;MGR.tab='team';MGR.trade={mid:m.id,mine:g.id,theirs:gt.id,coin:0,bun:[]};MGR_REDRAW();await W8(400);const q=s=>document.querySelector(s);
    q('#trMine').value=g.id;q('#trTheirs').value=gt.id;q('#trCoin').value=String(coin);for(const c of document.querySelectorAll('input[data-tb104g]'))c.checked=false;
    q(`[data-mg="tradego"][data-id="${m.id}"]`).click();await W8(400)};
  await send(weak,cFull);r.cheapNo=gt.contract.mgr===m.id&&weak.contract.mgr===pm.id;r.cheapMsg=(MGR.trade||{}).msg;
  m.envoyWk=-1;await send(weak,cHalf);r.halfYes=gt.contract.mgr===pm.id&&weak.contract.mgr===m.id;r.coins={cFull,cHalf,need:Math.round(need)};
  /* 4a settling in: not the main fighter */
  const m2=R.find(h=>h!==m&&rosterOf(h).length>=3)||R[3];m2.envoyWk=-1;m2.relB=80;const mine=rosterOf(pm).filter(g=>!g.loanFrom).sort((a,b)=>effOvr(b)-effOvr(a));const S=mine[0];S.contract.since=w.week;r.wk=w.week;
  MGR.teamId=m2.id;MGR.tab='team';MGR.trade={mid:m2.id,mine:S.id,theirs:rosterOf(m2)[0].id,coin:0,bun:[]};MGR_REDRAW();await W8(400);
  const sel=document.querySelector('#trMine');const o=sel&&[...sel.options].find(x=>x.value===S.id);
  r.opt=!!o&&o.disabled&&/settling in/.test(o.textContent)&&/signed only lately/.test(o.title||'')&&sel.value!==S.id&&!!gById(sel.value)&&!set105Left(gById(sel.value));
  let said='';sel.value=S.id;await ludusClick('tradego',m2.id,null,{redraw:()=>{},say:t=>{said=t}});r.refuse=/signed only lately/.test(said)&&S.contract.mgr===pm.id&&m2.envoyWk!==w.week;
  for(const g of mine)g.contract.since=w.week;MGR.trade={mid:m2.id,mine:null,theirs:rosterOf(m2)[0].id,coin:0,bun:[]};MGR_REDRAW();await W8(400);
  const go=document.querySelector(`[data-mg="tradego"][data-id="${m2.id}"]`);r.allSet=!!go&&go.disabled&&!!document.querySelector('.t112setw');
  for(const g of mine)g.contract.since=0;
  r.errs=typeof errNew92==='function'?errNew92(window.C_MARK).map(e=>e.kind+':'+e.msg):[];return r});
for(const k of ['patron','news','sheet','books','once','waits','top','topOnce','topNext','topWrap','half','full','bun','cheapNo','halfYes','opt','refuse','allSet'])ok(out.on[k],k);
ok(!out.on.errs.length,'no new 00c errors '+JSON.stringify(out.on.errs));
await pg.close();

/* the kill switch: no patron, no top-up */
const pk=await open({flavius_v112econoff:'1'});
out.off=await ev(pk,async()=>{const r={};const w=W_(),pm=me();r.ended=await __WK();const P=w.led109&&w.led109.c&&w.led109.c.patron;
  r.noPat=!P&&!(w.tlog||[]).some(x=>/Your patron/.test(x.text));
  const y=w.mgrs.find(m=>!m.isPlayer&&!m.sica&&!m.dead);y.coin=-30;aiLanistaWeek();r.noTop=y.e112top===undefined;return r});
for(const k of ['noPat','noTop'])ok(out.off[k],'kill switch '+k);
await pk.close();
console.log(JSON.stringify(out));console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

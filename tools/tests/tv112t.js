/* tv112t — v1.12 TRADES 2 (426-v112trade, his T2a T3a T5a): your 1-for-1 offers use 394's tr106Val (coin 1:1, the house's floor 20);
   a wage-dump bundle (one fit fighter + an overpaid dud) is now REFUSED while the same offer without the dud is accepted; a close bundle
   leaves a counter with the deterministic id 't<week>_<house>' and an ask in coin; the counter letter shows the why line + the weekly
   wage change (394's card format); a bundled extra still settling in (378) can't be ticked (disabled, tag + reason); kill switch
   flavius_v112tradeoff=1 → the old rules (23's tradeVal, the dud clamped to 0 → the bundle goes through). */
const {chromium}=require('playwright');const T=require('./_wait');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\.g/,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await T.boot(pg,{seed:1,ls:off?{flavius_v112tradeoff:'1'}:{}});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=3000;w.train='off';w.tplan=null;w.week=Math.max(w.week,3);
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(let i=0;i<5;i++){const g=genGlad({ovr:46+i*6});if(!gById(g.id))w.glads.push(g);g.alive=true;g.contract={mgr:pm.id,wage:askWage(g),weeks:8+i,since:0}}
    for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.severed=[];g.contract.since=0;g.contract.weeks=Math.max(g.contract.weeks,6);g.morale=80;delete g.loanFrom}
    for(const m of w.mgrs)if(!m.isPlayer){m.relB=80;m.coin=Math.max(m.coin||0,600);m.rivalry=0;m.rivals={};m.envoyWk=-1;m.p.greed=50;for(const g of rosterOf(m)){g.contract.since=0;g.scout=3}}
    w.tb104Wk=-1;w.tb104=null;menuHide();openManager('roster');await W8(900);MGR.view=null;window.C_MARK=typeof ERR92!=='undefined'?ERR92.n:0;
    /* the trade panel with house m, target gt; mine = primary, extras ticked */
    window.__P112=async(m,gt,prim,extras,coin)=>{MGR.teamId=m.id;MGR.tab='team';MGR.trade={mid:m.id,mine:prim.id,theirs:gt.id,coin:0,bun:[]};MGR_REDRAW();await W8(400);const q=s=>document.querySelector(s);
      if(!q('#trMine'))return false;q('#trMine').value=prim.id;q('#trTheirs').value=gt.id;q('#trCoin').value=String(coin||0);
      for(const x of document.querySelectorAll('input[data-tb104g]'))x.checked=false;
      for(const e of extras||[]){const cb=q(`input[data-tb104g="${e.id}"]`);if(cb&&!cb.disabled){cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}))}}return true};
    window.__S112=async(m)=>{document.querySelector(`[data-mg="tradego"][data-id="${m.id}"]`).click();await W8(400)};
    window.__H112=(not)=>w.mgrs.find(x=>!x.isPlayer&&!x.sica&&!x.dead&&!(not||[]).includes(x)&&rosterOf(x).length>=3&&cap104N(x)+2<=cap104(x))});
  return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));await b.close();process.exit(1)}};

/* the wage-dump scenario, the same on both pages: A alone is worth more than they ask; D is overpaid (tr106Val far below 0) */
const DUMP=async()=>{const w=W_(),pm=me();const m=__H112();const gt=[...rosterOf(m)].sort((a,b)=>tr106Val(a)-tr106Val(b))[0];
  const mine=rosterOf(pm).filter(g=>!g.loanFrom).sort((a,b)=>tr106Val(b)-tr106Val(a));const A=mine[0],D=mine[mine.length-1];D.contract.wage=150;
  /* old and new rules both must take A alone */
  const op=opinionOf(m).v;const mult=1.06+(op<40?.18:0)-(op>=70?.06:0)+(m.p.greed-50)/400;
  for(let i=0;i<40&&(tr106Val(A)<Math.max(20,tr106Val(gt))*mult+5||(effOvr(A)+Math.max(0,A.pot-A.ovr)*0.6+(A.fame||0)*0.2-Math.max(0,gAge(A)-30)*1.5-A.contract.wage*0.3)<(effOvr(gt)+Math.max(0,gt.pot-gt.ovr)*0.6+(gt.fame||0)*0.2-Math.max(0,gAge(gt)-30)*1.5-gt.contract.wage*0.3)*mult+2);i++)A.fame=Math.min(100,(A.fame||0)+5);
  return {m,gt,A,D,mult}};

const pg=await open(false);
out.on=await ev(pg,async(DUMP)=>{const DF=eval('('+DUMP+')');const r={};const w=W_(),pm=me();const {m,gt,A,D,mult}=await DF();
  /* T2a the value rule */
  r.val1=Math.abs(tradeVal(A)*6-tr106Val(A))<1e-9&&Math.abs(tradeVal(gt)*6-Math.max(20,tr106Val(gt)))<1e-9;
  r.need=Math.abs(c104Need(m,gt)*6-Math.max(20,tr106Val(gt))*mult)<1e-6;
  r.bun=Math.abs(c104BunVal([A,D],10)*6-(tr106Val(A)+tr106Val(D)*0.55+10))<1e-6;r.vals={A:tr106Val(A),D:tr106Val(D),gt:tr106Val(gt),need:Math.round(c104Need(m,gt)*6)};
  /* T3a the wage dump is refused, no counter */
  await __P112(m,gt,A,[D],0);await __S112(m);r.dumpNo=gt.contract.mgr===m.id&&A.contract.mgr===pm.id&&D.contract.mgr===pm.id&&/Not enough/.test((MGR.trade||{}).msg||'')&&!w.tb104;r.dumpMsg=(MGR.trade||{}).msg;
  /* the same offer without the dud (1-for-1, 23 tradego) */
  m.envoyWk=-1;await __P112(m,gt,A,[],0);await __S112(m);r.oneYes=gt.contract.mgr===pm.id&&A.contract.mgr===m.id;r.oneMsg=(MGR.trade||{}).msg;
  /* 1-for-1 coin counts 1:1: a weak fighter for their best, the gap message gives the coin */
  const m2=__H112([m]);m2.envoyWk=-1;const gb=[...rosterOf(m2)].sort((a,b)=>tr106Val(b)-tr106Val(a))[0];const weak=rosterOf(pm).filter(g=>g!==D&&!g.loanFrom).sort((a,b)=>tr106Val(a)-tr106Val(b))[0];
  const gap=Math.ceil(c104Need(m2,gb)*6-tr106Val(weak));await __P112(m2,gb,weak,[],0);await __S112(m2);const msg=(MGR.trade||{}).msg||'';
  r.gap=gap>0&&gb.contract.mgr===m2.id&&((()=>{const x=/About (\d+) more coin/.exec(msg);return !!x&&Math.abs(+x[1]-gap)<=1})()||(gap>pm.coin&&/better fighter/.test(msg)));r.gapMsg=msg+' gap='+gap;
  m2.envoyWk=-1;await __P112(m2,gb,weak,[],gap+1);await __S112(m2);r.gapPaid=gb.contract.mgr===pm.id&&weak.contract.mgr===m2.id;
  /* a close bundle → counter (deterministic id, ask in coin) */
  const m3=__H112([m,m2]);m3.envoyWk=-1;w.tb104Wk=-1;const g3=[...rosterOf(m3)].sort((a,b)=>tr106Val(b)-tr106Val(a))[0];
  const L=rosterOf(pm).filter(g=>g!==D&&!g.loanFrom&&tr106Val(g)>0).sort((a,b)=>tr106Val(a)-tr106Val(b));const B1=L[0],B2=L[1];
  for(let i=0;i<60&&c104BunVal([B1,B2],0)>=c104Need(m3,g3)*0.88;i++){g3.fame=Math.min(100,(g3.fame||0)+5);if(g3.fame>=100)g3.ovr=(g3.ovr||50)+2}
  const need3=c104Need(m3,g3)*6;const coin3=Math.max(0,Math.ceil(need3*0.9-t112Bundle([B1,B2],0)));
  await __P112(m3,g3,B1,[B2],coin3);await __S112(m3);const T=w.tb104;r.counter=!!T&&T.id==='t'+w.week+'_'+m3.id&&Math.abs(T.ask-Math.ceil(need3-t112Bundle([B1,B2],coin3)))<=1;r.T=T&&{id:T.id,ask:T.ask,coin:T.coin,need:Math.round(need3)};
  /* T5a the letter: why + wage change */
  if(T){T.mine=[B1.id,D.id];c104Counter(w);const Lt=(w.letters||[]).find(x=>x.key==='tb104-'+T.id);const d=document.createElement('div');d.innerHTML=Lt?Lt.body:'';const ln=d.querySelector('.t112c');
    const dw=g3.contract.wage-B1.contract.wage-D.contract.wage;r.letter=!!ln&&ln.querySelector('.tr106why').textContent.includes(D.name)&&ln.querySelector('.tr106wk').textContent===(dw>0?'+'+dw+'/wk for you':dw<0?'−'+(-dw)+'/wk for you':'same wages')&&!!d.querySelector(`[data-tb104="yes|${T.id}"]`)&&ln.nextElementSibling&&ln.nextElementSibling.classList.contains('acts');
    r.letterTxt=ln&&ln.textContent;
    /* a counter without a dud says the house's reason */
    T.sent=0;T.mine=[B1.id,B2.id];c104Counter(w);const L2=(w.letters||[]).find(x=>x.key==='tb104-'+T.id);r.letter2=!!L2&&/t112c/.test(L2.body)&&!L2.body.includes(esc(D.name)+' costs');T.done='no'}
  /* settling in: an extra signed 1 week ago can't be ticked */
  const m4=__H112([m,m2,m3]);m4.envoyWk=-1;w.tb104Wk=-1;const ros=rosterOf(pm).filter(g=>!g.loanFrom).sort((a,b)=>effOvr(b)-effOvr(a));const S=ros[ros.length-1];S.contract.since=w.week-1;
  await __P112(m4,rosterOf(m4)[0],ros[0],[S],0);const cb=document.querySelector(`input[data-tb104g="${S.id}"]`);const lb=cb&&cb.closest('label');
  r.settle=!!cb&&cb.disabled&&!cb.checked&&!!lb&&/settling in/.test(lb.textContent)&&/signed only lately/.test(lb.title||'')&&!!document.querySelector('.tb104 .t112n');
  S.contract.since=0;
  r.errs=typeof errNew92==='function'?errNew92(window.C_MARK).map(e=>e.kind+':'+e.msg):[];return r},DUMP.toString());
for(const k of ['val1','need','bun','dumpNo','oneYes','gap','gapPaid','counter','letter','letter2','settle'])ok(out.on[k],k);ok(!out.on.errs.length,'no new 00c errors '+JSON.stringify(out.on.errs));
await pg.close();

/* the kill switch: the old rules, the dud counts as 0 → the same bundle is taken */
const pk=await open(true);
out.off=await ev(pk,async(DUMP)=>{const DF=eval('('+DUMP+')');const r={};const w=W_(),pm=me();const {m,gt,A,D}=await DF();
  r.old=Math.abs(tradeVal(A)-(effOvr(A)+Math.max(0,A.pot-A.ovr)*0.6+(A.fame||0)*0.2-Math.max(0,gAge(A)-30)*1.5-A.contract.wage*0.3))<1e-9;
  await __P112(m,gt,A,[D],0);await __S112(m);r.dumpYes=gt.contract.mgr===pm.id&&A.contract.mgr===m.id&&D.contract.mgr===m.id;r.msg=(MGR.trade||{}).msg;
  r.noNote=!document.querySelector('.t112n');return r},DUMP.toString());
for(const k of ['old','dumpYes','noNote'])ok(out.off[k],'kill switch '+k);
await pk.close();
console.log(JSON.stringify(out));console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

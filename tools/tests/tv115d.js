/* tv115d — v1.15a DEATHS FIX (431-v115adeath, his 1a 2a 5a): on a seeded Manager world
   G3: blood money is half (min 5) for a house under fame 18 that is not a newcomer; unchanged at fame >= 18; a newcomer stays at half (not a quarter),
       also under fame 18; the pending-verdict card shows "half price — a small house" for a small house and not for a fame-18+ house;
   G5: killFighter leaves the house's fame unchanged under 18 and still takes 2 off at 18+; the deaths counter increments in both;
   kill switch flavius_v115adeathoff=1: full price, -2 fame, no note.
   node tools/tests/tv115d.js <ABSOLUTE page path> -> ERRS [] and exit 0. */
const {chromium}=require('playwright');const T=require('./_wait');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(ls)=>{const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\.g/,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await T.boot(pg,{seed:1,ls:ls||{}});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();w.welc99=1;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}});
  return pg};
const probe=async(pg)=>pg.evaluate(()=>{const r={};const w=W_(),pm=me();const roster=rosterOf(pm);const all=roster.slice();
  const full=(g,F)=>Math.max(5,Math.round(((F.g==='Damnatio'?30:F.g==='Fatal Charades'?22:18)+effOvr(g)*0.35+(g.fame||0)*0.2)*RL(w,'blood')));
  const F=FATES[0];const g=all[0];
  /* big house: many fighters, rich */
  pm.coin=3000;r.n=all.length;
  pm.fame=5;r.bigNew=newcomerHouse(pm);r.p5=bloodPrice(g,F);r.full=full(g,F);
  pm.fame=17;r.p17=bloodPrice(g,F);pm.fame=18;r.p18=bloodPrice(g,F);pm.fame=40;r.p40=bloodPrice(g,F);
  /* the card note */
  const addPend=()=>{w.pend=[{t:'blood',gid:g.id,bi:0,f:10,fi:0,price:bloodPrice(g,F)}]};
  pm.fame=5;addPend();r.note5=/half price — a small house/.test(pendingHTML());
  pm.fame=40;addPend();r.note40=/half price — a small house/.test(pendingHTML());w.pend=[];
  /* G5 */
  const k=(fame)=>{const gg=genGlad({ovr:50});gg.contract={mgr:pm.id,wage:5,weeks:8,since:w.week};w.glads.push(gg);pm.fame=fame;const d=pm.deaths||0;killFighter(gg,pm,F,'Test');return {fame:pm.fame,d:(pm.deaths||0)-d}};
  r.k5=k(5);r.k17=k(17);r.k18=k(18);r.k40=k(40);
  /* newcomer: <=2 fighters, <120 coin, fame under 18 -> half, not a quarter */
  const saved=all.slice(2).map(x=>[x,x.contract]);saved.forEach(([x])=>{x.contract=null});
  pm.coin=40;pm.fame=5;r.isNew=newcomerHouse(pm);r.pNew5=bloodPrice(g,F);pm.fame=40;r.pNew40=bloodPrice(g,F);
  r.fullNew=full(g,F);
  saved.forEach(([x,c])=>{x.contract=c});
  return r});
const pg=await open();
const o=await probe(pg);out.on=o;
ok(o.n>=3&&!o.bigNew,'setup: big non-newcomer house');
ok(o.full>=12,'setup: price large enough to see the half');
ok(o.p5===Math.max(5,Math.round(o.full*0.5)),'fame 5 non-newcomer = half '+o.p5+'/'+o.full);
ok(o.p17===o.p5,'fame 17 = half');
ok(o.p18>o.p5,'fame 18 not halved '+o.p18);
ok(o.note5===true,'note shown for a small house');ok(o.note40===false,'no note for fame 40');
ok(o.k5.fame===5&&o.k5.d===1,'death at fame 5: fame unchanged, deaths+1 '+JSON.stringify(o.k5));
ok(o.k17.fame===17&&o.k17.d===1,'death at fame 17 unchanged');
ok(o.k18.fame===16&&o.k18.d===1,'death at fame 18: -2 '+JSON.stringify(o.k18));
ok(o.k40.fame===38&&o.k40.d===1,'death at fame 40: -2');
ok(o.isNew===true,'setup: newcomer');
ok(o.pNew5===Math.max(5,Math.round(o.fullNew*0.5)),'newcomer at fame 5 = half, not quarter '+o.pNew5+'/'+o.fullNew);
ok(o.pNew40===o.pNew5||o.pNew40===Math.max(5,Math.round(o.fullNew*0.5)),'newcomer at fame 40 still half (51-v49)');
await pg.close();
/* kill switch */
const pk=await open({flavius_v115adeathoff:'1'});const ko=await probe(pk);out.off=ko;
ok(ko.p5===ko.full&&ko.p17===ko.full,'off: full price under 18 '+ko.p5+'/'+ko.full);
ok(ko.note5===false,'off: no note');
ok(ko.k5.fame===3&&ko.k17.fame===15&&ko.k18.fame===16,'off: -2 fame always '+JSON.stringify([ko.k5,ko.k17,ko.k18]));
ok(ko.pNew5===Math.max(5,Math.round(ko.fullNew*0.5)),'off: newcomer still half');
await pk.close();
console.log(JSON.stringify(out));console.log('MISS',miss);console.log('ERRS',errs.slice(0,5));await b.close();process.exit(miss.length||errs.length?1:0)})();

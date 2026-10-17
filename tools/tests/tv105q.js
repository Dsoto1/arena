const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:vw||{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105rudisoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});return pg};
const mgr=async pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=9000;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    window.W8=W8;window.ENS=async()=>{const el=document.querySelector('#mgrBody');if(!el||!el.offsetParent){menuHide();openManager(MGR.tab||'ludus');await W8(900)}};
    window.SIMS=async()=>{const w=W_();for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k)};
    window.PW=async(keep,pre)=>{const w=W_(),pm=me();if(!keep)for(const g of rosterOf(pm)){g.inj=null;g.contract.weeks=Math.max(g.contract.weeks,30)}
      if(w.special&&!w.special.done)await specAutoRun();await SIMS();if(pre)pre();
      let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];try{if(P.t==='thumb')settlePending(0,null,{d6:6,d12:12});else if(P.t==='blood')settlePending(0,'let');else settlePending(0,'stay')}catch(e){w.pend.shift()}}
      const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let rr;try{rr=await endWeek()}finally{clearInterval(hold)}await W8(150);return rr};
    window.TBL=()=>JSON.stringify(W_().mgrs.map(m=>{const s=msp(m);return [m.id,s.pts,s.w||0,s.ev||0]}));
    window.FIT=n=>{const w=W_(),pm=me();const A=[];for(let i=0;i<n;i++){const g=genGlad({ovr:64+i});g.contract={mgr:pm.id,wage:3,weeks:30,since:w.week};w.glads.push(g);A.push(g)}return A};
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('ludus');await W8(600);MGR.view=null});
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));console.log(JSON.stringify(out,null,1).slice(0,6000));await b.close();process.exit(1)}};


const hdr=`/* tv105q — v1.05 B56 (380-v105rudis): rudis asks only in the off-season. In-season a 50+ CF Freedom fate makes no request (it is stored and deferred);
   the off-season opening makes it (a pending rudis verdict, shown on the off-season page); a pending ask already in a save stays answerable; kill switch flavius_v105rudisoff=1 restores in-season asks. */`;
const force=()=>{const w=W_(),pm=me();const g=rosterOf(pm)[0];g.rec.ev=14;g.rec.w=6;g.alive=true;w.pend=[];delete g.rudis105;
  const r=leagueFate(g,{f:55,gid:g.id,fate:''},pm,w.night.bouts[0],0,{});return {vd:r&&r.vd,pend:(w.pend||[]).filter(p=>p.t==='rudis').length,def:!!g.rudis105,id:g.id,alive:g.alive}};
const pg=await open(false);await mgr(pg);
out.week=await ev(pg,()=>[W_().week,OFF104.active(W_()),rudis105Window(W_())]);
ok(out.week[1]===false&&out.week[2]===false,'in-season: window closed '+JSON.stringify(out.week));
out.a=await ev(pg,force);
ok(out.a.pend===0&&out.a.def&&out.a.alive,'in-season: no rudis request, deferred '+JSON.stringify(out.a));
/* a purse-rich fighter in-season: no buyfree ask */
out.b=await ev(pg,async()=>{const w=W_(),pm=me();const g=rosterOf(pm)[1];g.rec.ev=0;g.rec.w=0;g.purse=99999;g.freeAsked=undefined;w.pend=[];purseWeek(w,pm);return (w.pend||[]).filter(p=>p.t==='buyfree').length});
ok(out.b===0,'in-season: no buy-freedom ask '+out.b);
/* the off-season opens */
out.c=await ev(pg,async()=>{const w=W_(),pm=me();const g=gById(window.__id=rosterOf(pm)[0].id);g.rec.ev=14;g.rec.w=6;
  w.mgrs.forEach((m,i)=>{const s=msp(m,1);s.pts=40-i*3;s.w=12-i;s.b=14;s.ev=14});
  const P=po104New(w);P.sf=[{k:[P.seeds[0],P.seeds[3]],adv:[P.seeds[0]],pl:null},{k:[P.seeds[1],P.seeds[2]],adv:[P.seeds[1]],pl:null}];P.fin={k:[P.seeds[0],P.seeds[1]],pl:null};P.champ=P.seeds[0];P.phase='fin';P.paid={r1:1,sf:1,fin:1};w.po104=P;w.night.po104='fin';w.week=12;
  po104OffStart(w,P);
  const r={act:OFF104.active(w),win:rudis105Window(w),pend:(w.pend||[]).filter(p=>p.t==='rudis'&&p.gid===g.id).length,def:!!g.rudis105,buy:(w.pend||[]).filter(p=>p.t==='buyfree').length};
  MGR.tab='night';MGR_REDRAW();await W8(800);r.box=!!document.querySelector('#pendbox');
  /* answerable */
  const pi=w.pend.findIndex(p=>p.t==='rudis'&&p.gid===g.id);if(pi>=0){settlePending(pi,'stay');}r.left=(w.pend||[]).filter(p=>p.t==='rudis'&&p.gid===g.id).length;return r});
ok(out.c.act&&out.c.win&&out.c.pend===1&&!out.c.def&&out.c.box&&out.c.left===0,'off-season: request made, shown, answerable '+JSON.stringify(out.c));
/* a pending ask already in a save stays answerable outside the window */
out.d=await ev(pg,()=>{const w=W_(),pm=me();const g=rosterOf(pm)[0];w.po104=null;w.night.po104=null;w.pend=[{t:'rudis',gid:g.id,bi:-1,f:55}];const m=settlePending(0,'stay');return [typeof m,w.pend.length]});
ok(out.d[0]==='string'&&out.d[1]===0,'old pending ask stays answerable '+JSON.stringify(out.d));
/* kill switch */
const pk=await open(true);await mgr(pk);
out.k=await ev(pk,force);
ok(out.k.pend===1&&!out.k.def,'kill switch: in-season ask returns '+JSON.stringify(out.k));
out.err=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n-window.RM_MARK:0);
console.log(JSON.stringify(out));console.log('ERRS',JSON.stringify(errs));console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');
await b.close();process.exit(errs.length||miss.length?1:0)})();

const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:vw||{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105renewoff','1')},off?1:0);
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


/* tv105w — v1.05 B67 (386-v105renew): off-season contract renewals show OVR (roster grade colour), W-L and the last 5 form dots. Kill switch flavius_v105renewoff=1. */
const setup=()=>{const w=W_(),pm=me();const ros=rosterOf(pm);ros.forEach((g,i)=>{g.contract.weeks=i<2?4:30;g.rec.ev=10+i;g.rec.w=4+i;g.recent=[1,2,3,4,5,6,7].map(k=>({s:w.season,wk:k,t:'',ev:'E',loc:'L',place:k%3+1,won:k%3===0,f:0}))});
  w.mgrs.forEach((m,i)=>{const s=msp(m,1);s.pts=40-i*3;s.w=12-i;s.b=14;s.ev=14});
  const P=po104New(w);P.sf=[{k:[P.seeds[0],P.seeds[3]],adv:[P.seeds[0]],pl:null},{k:[P.seeds[1],P.seeds[2]],adv:[P.seeds[1]],pl:null}];P.fin={k:[P.seeds[0],P.seeds[1]],pl:null};P.champ=P.seeds[0];P.phase='fin';P.paid={r1:1,sf:1,fin:1};w.po104=P;w.night.po104='fin';w.week=12;
  po104OffStart(w,P);MGR.tab='night';MGR_REDRAW();if(typeof wqGo==='function')wqGo('staff'); /* v1.09: the renewals live in Winter Quarters room 6 */return P.ren.filter(x=>x.kind==='raise').map(x=>x.gid)};
const probe=async pg=>pg.evaluate(async()=>{await W8(800);const ids=window.__ids;const rows=[...document.querySelectorAll('.po104rn[data-po104ren]')];
  return {n:rows.length,want:ids.length,rows:rows.map(r=>{const g=gById(r.dataset.po104ren);const l=r.querySelector('.ren105');const rec=g.rec;const rr=document.querySelector('.po104rn[data-po104ren="'+g.id+'"]');
    return {has:!!l,ovr:l&&l.querySelector('.ren105o').textContent,eff:String(effOvr(g)),wl:l&&l.querySelector('.ren105wl').textContent,wlWant:`${rec.w}–${rec.ev-rec.w}`,dots:l?[...l.querySelectorAll('.fchip')].map(x=>x.textContent).join(','):'',dotsWant:g.recent.slice(-5).map(x=>x.won?'W':x.place||'·').join(','),gc:l&&l.querySelector('.r104t').getAttribute('style'),gcWant:'--gc:'+gradeCol(r104Grade(g))}}),sx:document.documentElement.scrollWidth>innerWidth+1||document.body.scrollWidth>innerWidth+1}});
const pg=await open(false);await mgr(pg);
out.ids=await ev(pg,(f)=>{return (0,eval)('('+f+')')()},setup.toString());
await ev(pg,i=>{window.__ids=i},out.ids);
ok(out.ids.length>=1,'renewals due '+out.ids.length);
out.a=await probe(pg);
ok(out.a.n===out.a.want&&out.a.n>=1,'rows '+out.a.n+'/'+out.a.want);
for(const r of out.a.rows){ok(r.has,'line present');ok(r.ovr===r.eff,'ovr '+r.ovr+' vs '+r.eff);ok(r.wl===r.wlWant,'wl '+r.wl+' vs '+r.wlWant);ok(r.dots===r.dotsWant&&r.dots.split(',').length===5,'dots '+r.dots+' vs '+r.dotsWant);ok(r.gc&&r.gc.includes(r.gcWant),'grade colour '+r.gc)}
await pg.setViewportSize({width:390,height:800});await pg.waitForTimeout(500);
out.m=await probe(pg);ok(!out.m.sx,'390px: no sideways scroll');
const pk=await open(true);
await pk.addInitScript(()=>localStorage.setItem('flavius_v105renewoff','1'));await pk.reload();await pk.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});await mgr(pk);
out.kids=await ev(pk,(f)=>(0,eval)('('+f+')')(),setup.toString());
out.k=await pk.evaluate(async()=>{await W8(800);return {rows:document.querySelectorAll('.po104rn[data-po104ren]').length,lines:document.querySelectorAll('.ren105').length}});
ok(out.k.rows>=1&&out.k.lines===0,'kill switch: no lines '+JSON.stringify(out.k));
console.log(JSON.stringify(out));console.log('ERRS',JSON.stringify(errs));console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');
await b.close();process.exit(errs.length||miss.length?1:0)})();

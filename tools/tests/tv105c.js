/* tv105c — v1.05 workstream C (362-v105league): N1 the League season picker (a past season's final table, its Superbus bracket read-only and its
   Flavian awards, after a real season rollover; the current season untouched; "not recorded" for a season with no bracket); F1 every Manager rail
   chip (hours, count, tick) sits at the right edge of its row, desktop and 390 px; kill switch flavius_v105coff=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:vw||{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105coff','1')},off?1:0);
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

const pg=await open(false);await mgr(pg);

/* ---- F1: rail chips at the right edge (desktop) ---- */
const chipJS=()=>{const o=[];for(const bt of document.querySelectorAll('.mtabs [data-mg="tab"]')){const br=bt.getBoundingClientRect(),pr=parseFloat(getComputedStyle(bt).paddingRight);
  for(const c of bt.querySelectorAll('.mcount,.hrchip,.tabchk,.hp105')){if(c.offsetParent===null||getComputedStyle(c).display==='none')continue;const cr=c.getBoundingClientRect();if(!cr.width)continue;o.push([bt.dataset.id,c.textContent.trim(),Math.round(br.right-pr-cr.right)])}}return o};
out.railD=await ev(pg,async()=>{const w=W_();for(const g of rosterOf(me()))g.inj=null;MGR.tab='ludus';MGR_REDRAW();await W8(900);return 1});
const cd=await pg.evaluate(chipJS);out.chipsD=cd;
ok(cd.some(x=>x[0]==='recruit')&&cd.some(x=>x[0]==='infirm'&&x[1]==='✓'),'F1 the Recruiting hours chip and the Infirmary tick exist '+JSON.stringify(cd));
ok(cd.every(x=>x[2]>=-1&&x[2]<=4),'F1 desktop: every rail chip at the right edge '+JSON.stringify(cd));

/* ---- N1: play season 1 out (playoffs, off-season) into season 2 ---- */
/* forge the last week of season 1: a finished playoff (champion), a table, awards; then the real rollover (endWeek) archives it */
out.s0=await ev(pg,async()=>{const w=W_(),pm=me();for(const g of rosterOf(pm)){g.inj=null;g.contract.weeks=Math.max(g.contract.weeks,30)}
  w.mgrs.forEach((m,i)=>{const s=msp(m,1);s.pts=40-i*3;s.w=12-i;s.b=14;s.ev=14});
  const P=po104New(w);P.sf=[{k:[P.seeds[0],P.seeds[3]],adv:[P.seeds[0]],pl:null},{k:[P.seeds[1],P.seeds[2]],adv:[P.seeds[1]],pl:null}];P.fin={k:[P.seeds[0],P.seeds[1]],pl:null};P.champ=P.seeds[0];P.phase='off';P.paid={r1:1,sf:1,fin:1};w.po104=P;
  w.night.po104='off';w.week=12;w.awardHist=[{season:1,awards:[{name:'Aureus Gladius',who:'A',ludus:'L',stat:'x'},{name:'Tiro Laurel',who:'B',ludus:'M',stat:'y'},{name:'Iron Thumb',who:'C',ludus:'N',stat:'z'}]}];
  return [w.season,OFF104.phase(w)]});
ok(out.s0[0]===1&&out.s0[1]==='off','forged: season 1, off-season phase '+JSON.stringify(out.s0));
out.rk=await ev(pg,()=>PW(true));ok(out.rk!==false,'the real rollover ran '+out.rk);
out.s1=await ev(pg,async()=>{const w=W_();const r={};
  r.season=w.season;r.po=!!(w.seasons105&&w.seasons105[1]&&w.seasons105[1].po&&w.seasons105[1].po.champ);r.champ=r.po?w.seasons105[1].po.champ:null;return r});
ok(out.s1.season===2&&out.s1.po,'N1 season rolled over and its bracket was archived '+JSON.stringify(out.s1));
out.pick=await ev(pg,async()=>{const w=W_();const r={};await ENS();MGR.tab='league';MGR.lg105=0;MGR_REDRAW();await W8(700);
  const sel=document.querySelector('#mgrPane [data-lg105sel]');r.sel=!!sel;r.opts=sel?[...sel.options].map(o=>o.value):[];r.curRows=document.querySelectorAll('#mgrPane .wd100r').length;
  sel.value='1';sel.dispatchEvent(new Event('change',{bubbles:true}));await W8(700);
  const pa=document.querySelector('#mgrPane .lg105past');r.past=!!pa;r.rows=pa?pa.querySelectorAll('table.lg105t tr').length-1:0;r.bk=pa?pa.querySelectorAll('.v104tr').length:0;r.champ=pa?pa.querySelectorAll('.v104ch.on').length:0;
  r.boxes=pa?pa.querySelectorAll('.v104b').length:0;r.aw=pa?pa.querySelectorAll('.lg105aw li').length:0;r.title=pa?(pa.querySelector('.v104sh')||{}).textContent:'';r.selNow=(document.querySelector('#mgrPane [data-lg105sel]')||{}).value;
  r.mine=pa?pa.querySelectorAll('tr.me').length:0;
  const s2=document.querySelector('#mgrPane [data-lg105sel]');s2.value='2';s2.dispatchEvent(new Event('change',{bubbles:true}));await W8(700);
  r.back=!document.querySelector('#mgrPane .lg105past')&&document.querySelectorAll('#mgrPane .wd100r').length>=12;
  /* a season with no archive: not recorded */
  w.season=3;const keep=w.seasons105;w.seasons105=null;const po=w.po104;w.po104=null;MGR.lg105=1;MGR_REDRAW();await W8(600);
  const br=document.querySelector('#mgrPane .lg105past .lg105br');r.nr=!!br&&/ecorded/.test(br.textContent||'');
  w.season=2;w.seasons105=keep;w.po104=po;MGR.lg105=0;MGR_REDRAW();await W8(300);return r});
ok(out.pick.sel&&out.pick.opts.join()==='2,1'&&out.pick.curRows>=12,'N1 picker lists the seasons, the current table untouched '+JSON.stringify(out.pick));
ok(out.pick.past&&out.pick.rows>=12&&out.pick.mine===1&&out.pick.bk===1&&out.pick.boxes===5&&out.pick.champ===1&&out.pick.aw>=3&&out.pick.selNow==='1','N1 season 1: table + bracket (read-only) + awards '+JSON.stringify(out.pick));
ok(out.pick.back&&out.pick.nr,'N1 back to now; an unarchived season says not recorded '+JSON.stringify(out.pick));

/* ---- F1 on a phone ---- */
await pg.close();const p2=await open(false,{width:390,height:844});await mgr(p2);
await p2.evaluate(async()=>{for(const g of rosterOf(me()))g.inj=null;MGR.tab='ludus';MGR_REDRAW();await W8(1500)});
out.chipsP=await p2.evaluate(chipJS);
ok(out.chipsP.some(x=>x[0]==='recruit'&&/ h$/.test(x[1]))&&out.chipsP.some(x=>x[0]==='infirm'&&x[1]==='✓'),'F1 390 px: the Recruiting hours chip and the Infirmary tick are on the rail '+JSON.stringify(out.chipsP));
ok(out.chipsP.length&&out.chipsP.every(x=>x[2]>=-1&&x[2]<=4),'F1 390 px: every rail chip at the right edge '+JSON.stringify(out.chipsP));
console.log(JSON.stringify(out,null,1).slice(0,3000));
console.log('ERRS',JSON.stringify(errs));if(miss.length){console.log('MISS',JSON.stringify(miss,null,1));await b.close();process.exit(1)}
await b.close();process.exit(errs.length?1:0)})();

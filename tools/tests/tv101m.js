/* tv101m — v1.01 MANAGER MORPH RENDERING (330-v101morph): a Manager redraw patches the page in place.
   Checks (morph on): a yard + session click keeps the rail / banner / untouched cards (node identity via an expando marker), opening a letter
   on Your ludus and redrawing keeps it open, switching tabs and back keeps the rail node, an inner scroller keeps its scroll position and
   node, a <details> the player opened stays open, no <img> is re-created when its src did not change, a focused input keeps its node;
   the kill switch (flavius_mgrmorph101off=1) is the old innerHTML (nodes new); redraw ms ON vs OFF on Your ludus / Recruiting / Training Yard
   (printed, ON must not be slower than 1.5× OFF); no page errors, no new 00c errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_mgrmorph101off','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.contract.weeks=20;g.morale=80}
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('ludus');await W8(800);MGR.view=null});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);

const pg=await open(false);
out.on=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const qa=s=>[...document.querySelectorAll(s)];const r={};
  const tab=async t=>{MGR.tab=t;MGR.view=null;MGR_REDRAW();await W8(400)};
  r.morphOn=MM101.on===true;
  /* 1 · yard + session click */
  await tab('practice');const ros=rosterOf(me());const g=ros[0];MGR.tr92=g.id;MGR_REDRAW();await W8(400);
  const rail=q('#mgrBody .rail')||q('#mgrBody .railwrap');const ban=q('#mgrPane .roomhd')||q('#mgrPane > *');if(rail)rail.__m101=1;if(ban)ban.__m101=1;
  const imgs0=qa('#mgrBody img');imgs0.forEach(i=>i.__m101=1);
  const plus=q(`#mgrPane [data-y92s^="${g.id}|"][data-y92s$="|1"]:not([disabled])`);r.plus=!!plus;const p0=MM101.n.paint;if(plus)plus.click();await W8(500);
  r.paintedYard=MM101.n.paint>p0;r.railKept=!!rail&&rail.isConnected&&!!(q('#mgrBody .rail')||q('#mgrBody .railwrap')).__m101;r.banKept=!!ban&&ban.isConnected;
  const imgs1=qa('#mgrBody img');const srcs0=new Set(imgs0.filter(i=>i.isConnected).map(i=>i.getAttribute('src')));
  r.imgNew=imgs1.filter(i=>!i.__m101&&srcs0.has(i.getAttribute('src'))).length;r.imgs=imgs1.length;
  /* 2 · plain redraw: nothing re-created */
  const all0=qa('#mgrBody *');all0.forEach(n=>n.__m101b=1);const a0=MM101.n.added;MGR_REDRAW();await W8(300);
  r.addedPlain=MM101.n.added-a0;{const own=(typeof MM101_OWN!=='undefined'?MM101_OWN:[]).map(c=>'.'+c).join(',');const nn=qa('#mgrBody *').filter(n=>!n.__m101b&&!(own&&n.closest(own)));r.newNodes=nn.length;r.newWhat=nn.slice(0,4).map(n=>n.tagName+'.'+String(n.className).slice(0,40)+'<'+String(n.parentNode&&n.parentNode.className).slice(0,40));}
  /* 3 · tabs and back: the rail stays */
  await tab('recruit');await tab('practice');r.railAfterTabs=!!(q('#mgrBody .rail')||q('#mgrBody .railwrap')||{}).__m101;
  /* 4 · Your ludus: a letter opened stays open; an inner scroller keeps its place */
  await tab('ludus');
  const det=qa('#mgrPane details:not([open])').find(d=>d.getClientRects().length);r.det=!!det;if(det){det.open=true;det.__m101=1}
  const sc=q('#mgrPane .lu100tl')||qa('#mgrPane div').find(d=>d.children.length>3&&d.getClientRects().length);r.sc=!!sc;
  if(sc){sc.style.maxHeight='90px';sc.style.overflow='auto';sc.scrollTop=40;sc.__m101=1}const st0=sc?sc.scrollTop:0;
  MGR_REDRAW();await W8(400);
  const det2=det&&det.isConnected?det:null;r.detKept=!!det2&&det2.open;
  r.scKept=!!sc&&sc.isConnected&&sc.scrollTop===st0&&st0>0;r.st0=st0;
  /* 5 · the mail drawer / a popover opened by state stays across a redraw */
  const mb=q('#mgrPane [data-lu100mail="1"]');if(mb){mb.click();await W8(400)}const dr=q('#mgrPane .lu100mail');r.drawer=!!dr;if(dr)dr.__m101=1;MGR_REDRAW();await W8(300);r.drawerKept=!mb||(!!dr&&dr.isConnected&&!!q('#mgrPane .lu100mail').__m101);
  const cl=q('#mgrPane .lu100mail [data-lu100mail="0"]');if(cl){cl.click();await W8(300)}
  /* 6 · a focused input keeps its node */
  await tab('recruit');const inp=q('#mgrPane input[type="search"],#mgrPane input[type="text"]');r.inp=!!inp;if(inp){inp.focus();inp.__m101=1;MGR_REDRAW();await W8(300);r.inpKept=inp.isConnected&&document.activeElement===inp}
  /* 7 · redraw ms ON vs OFF (sync patch + the forced layout after it) */
  const time=async(t,on)=>{MM101.on=on;await tab(t);let s=0;const N=8;for(let i=0;i<N;i++){const t0=performance.now();MGR_REDRAW();document.body.offsetHeight;s+=performance.now()-t0;await W8(60)}MM101.on=true;return +(s/N).toFixed(1)};
  r.ms={};for(const t of ['ludus','recruit','practice']){const off=await time(t,false);const on=await time(t,true);r.ms[t]={off,on}}
  r.errs=typeof ERR92!=='undefined'?ERR92.n-window.RM_MARK:0;return r});
const R=out.on;
ok(R.morphOn,'morph on');ok(R.plus,'yard + button');ok(R.paintedYard,'yard click patched');ok(R.railKept,'rail kept after a session click');ok(R.banKept,'banner kept');
ok(R.imgNew===0,'no img re-created ('+R.imgNew+' of '+R.imgs+')');ok(R.addedPlain===0&&R.newNodes===0,'plain redraw re-creates nothing ('+R.addedPlain+'/'+R.newNodes+')');
ok(R.railAfterTabs,'rail kept across tabs');ok(R.det&&R.detKept,'open details stays open');ok(R.sc&&R.scKept,'inner scroll kept ('+R.st0+')');ok(R.drawerKept,'letters drawer kept');
ok(!R.inp||R.inpKept,'focused input kept');
for(const t in R.ms){const m=R.ms[t];ok(m.on<=m.off*1.5+2,'redraw '+t+' not slower: '+JSON.stringify(m))}
ok(R.errs===0,'no new 00c errors: '+R.errs);

/* the kill switch: the old innerHTML */
const pg2=await open(true);
out.off=await ev(pg2,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};r.flag=MM101.on===false;const ban=document.querySelector('#mgrPane .roomhd')||document.querySelector('#mgrPane > *');if(ban)ban.__m101=1;
  const p0=MM101.n.paint;MGR_REDRAW();await W8(300);const r2=document.querySelector('#mgrPane .roomhd')||document.querySelector('#mgrPane > *');r.fresh=!!r2&&!r2.__m101&&!ban.isConnected;r.noPaint=MM101.n.paint===p0;return r});
ok(out.off.flag&&out.off.fresh&&out.off.noPaint,'kill switch = innerHTML '+JSON.stringify(out.off));
console.log('MS',JSON.stringify(R.ms));console.log(JSON.stringify(out));
console.log('ERRS',JSON.stringify(errs));console.log(miss.length?'FAIL '+miss.join(' | '):'PASS');await b.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});

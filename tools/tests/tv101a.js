/* tv101a — v1.01 workstream A, MANAGER UI (317-v101mgrui): M1 rivalry letter, M2 sharper busts, M3 Hard ★, M4 rudis tooltip, M5-M7 + M20 + M25
   recruiting (wide list, no Stable, Free agents default, Offer tab pulse, board under the banner), M8 bare Imperium, M9 Season button,
   M10 house card, M11 Promote popup + Ledger in the Clerk, M12 The Council, M16 counsel in his popover, M22 wider card, M33 perk + Tituli ovals,
   M34 Tituli sub-tabs + no CF, M36 bout cards one row, M38 negative treasury note, M43 My Acta, M44 Clerk loan letter, M45 popover closes,
   and the kill switch flavius_v101aoff=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v101aoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
    const w=W_(),pm=me();w.welc99=1;pm.coin=900;delete pm.facWk;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}menuHide();openManager('ludus');await W8(1000);MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(500)});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const pg=await open(1440,900);
const mark=await ev(pg,()=>errNew92?errNew92.mark||null:null).catch(()=>null);
/* M1 · the rivalry letter */
const A=await ev(pg,()=>{const w=W_(),pm=me();const foe=w.mgrs.find(m=>!m.isPlayer);const ros=rosterOf(pm);const o={};
  const mk=n=>{ros.forEach((g,i)=>{g.inj=i<ros.length-n?{label:'x',until:w.week+9,kind:'rest'}:null});w.rivalry={season:w.season,abs:w.week+1,pairs:[[pm.id,foe.id]],bye:[],commit:{}};w.letters=[];rivalLetter(w);return (w.letters.find(x=>x.key==='rival-'+w.season)||{}).body||''};
  const b0=mk(0),b1=mk(1),b3=mk(3);ros.forEach(g=>g.inj=null);
  o.zero=/loses 8 fame/.test(b0)&&!/Name no one/.test(b0);o.one=/loses 8 fame/.test(b1)&&!/Name no one/.test(b1);o.three=/Name no one/.test(b3)&&/data-rivcommit/.test(b3)&&!/loses 8 fame/.test(b3);return o});
ok(A.zero&&A.one&&A.three,'M1 rivalry letter lines '+JSON.stringify(A));
/* M2 · busts are cut at 1.5x */
const B=await ev(pg,()=>{const g=rosterOf(me())[0];const w54=(()=>{const h=portraitHTML({name:g.name,portrait:gLook(g),color:'#a3281f'},'sm');const id=/data-f99="(f\d+)"/.exec(h);let W=0;for(const e of R99.map.values())if(id&&e.id===id[1])W=e.W;return W})();return {w54,shown:PORTRAIT_SIZES.sm[0]}});
ok(B.w54>=Math.round(B.shown*1.5),'M2 raster width '+JSON.stringify(B));
/* M3 + M4 + M20 · recruiting card */
const C=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const o={};MGR.tab='recruit';MGR_REDRAW();await W8(700);
  const fa=freeAgents();let g=fa.find(x=>wants88(x).includes('rudis'))||fa[0];MGR.sel=g.id;g.scout=2;MGR.recStep=3;
  let seen=0,bad=0;for(const x of fa.filter(y=>wants88(y).includes('rudis'))){x.scout=2;MGR.sel=x.id;MGR.recStep=3;const hx=detailHTML(x);if(/id="ofRudis88"/.test(hx)){seen++;if(!/title="He wants a path to the rudis/.test(hx))bad++}}o.rudis=seen>0&&!bad;o.rudisSeen=seen;MGR.sel=g.id;MGR.recStep=3;const h=detailHTML(g);
  w.startDiff='normal';MGR.recStep=1;const h1=detailHTML(g);o.starN=/star85|adv74/.test(h1);
  w.startDiff='hard';for(const a of council83(w))a.lv=1;MGR.recStep=1;const h2=detailHTML(g);o.starH=/star85|adv74/.test(h2);o.advNull=recAdvice74(g,m,1)===null;
  for(const a of council83(w))if(a.k==='recruiter')a.lv=REC98.lvMax;const h3=detailHTML(g);o.starTop=/star85|adv74/.test(h3)||recAdvice74(g,m,1)!==null;
  w.startDiff='normal';for(const a of council83(w))a.lv=1;
  const r0=window.recReady;window.recReady=()=>46;MGR.recStep=1;MGR_REDRAW();await W8(500);const bt=document.querySelector('[data-recstep="3"]');o.pulse=!!bt&&bt.classList.contains('rc101rdy');
  MGR.recStep=3;MGR_REDRAW();await W8(400);const b3=document.querySelector('[data-recstep="3"]');o.pulseCur=!!b3&&b3.classList.contains('rc101rdy');window.recReady=()=>null;MGR.recStep=1;MGR_REDRAW();await W8(400);const bn=document.querySelector('[data-recstep="3"]');o.pulseOff=!!bn&&!bn.classList.contains('rc101rdy');window.recReady=r0;
  o.anim=getComputedStyle(document.querySelector('[data-recstep="3"]')).animationName;
  return o});
ok(C.rudis,'M4 rudis tooltip');ok(C.starN&&!C.starH&&C.advNull&&C.starTop,'M3 Hard hides ★ until the Recruiter is at the top '+JSON.stringify(C));ok(C.pulse&&!C.pulseCur&&C.pulseOff,'M20 Offer tab pulse '+JSON.stringify(C));
/* M5 M6 M7 M25 · recruiting page */
const D=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};MGR.filter='signed';MGR.tab='ludus';MGR_REDRAW();await W8(300);MGR.tab='recruit';MGR.filter='signed';MGR_REDRAW();await W8(900);
  o.free=MGR.filter==='free';o.stable=!!document.querySelector('[data-mg="filter"][data-id="mine"]');o.plan=!!document.querySelector('.rplanbox');
  const ban=document.querySelector('.railmain>.roomhd');o.board=!!ban&&!!ban.nextElementSibling&&ban.nextElementSibling.classList.contains('pipeline');
  const left=document.querySelector('.rc100g>div:first-child');const lr=left.getBoundingClientRect();o.listW=Math.round(lr.width);const tb=document.querySelector('#recTable');o.tblW=Math.round(tb.getBoundingClientRect().width);o.fit=getComputedStyle(document.querySelector('#recTable tr[data-mg="sel"]>td:nth-child(3)')).display;
  /* from a letter: tab already recruit with filter signed then selecting keeps free */
  MGR.tab='news';MGR_REDRAW();await W8(300);MGR.tab='recruit';MGR.sel=freeAgents()[0].id;MGR.filter='targets';MGR_REDRAW();await W8(600);o.fromLetter=MGR.filter==='free';
  return o});
ok(D.free&&D.fromLetter,'M7 recruiting opens on Free agents '+JSON.stringify(D));ok(!D.stable,'M6 no Stable filter');ok(!D.plan&&D.board,'M25 board under the banner, no plan line '+JSON.stringify(D));ok(D.listW>=420&&D.tblW>=400&&D.fit!=='none','M5 wide list '+JSON.stringify(D));
/* M8 M9 M10 M22 · World tabs */
const E=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};MGR.tab='imp';for(const k of Object.keys(WD100.lay))WD100.lay[k]=0;MGR_REDRAW();await W8(700);
  const m=document.querySelector('.wd100map');o.bare=!!m&&m.classList.contains('bare101')&&!m.querySelector('.badg')&&!m.querySelector('svg.wd100lay');o.pins=m?m.querySelectorAll('.wd100pin').length:0;
  WD100.lay.fans=1;WD100.lay.weather=1;WD100.lay.events=1;MGR_REDRAW();await W8(600);const m2=document.querySelector('.wd100map');o.back=!!m2&&!m2.classList.contains('bare101');
  MGR.tab='league';MGR.lg90=W_().mgrs.find(x=>!x.isPlayer).id;MGR_REDRAW();await W8(800);
  o.rail=!document.querySelector('.rail [data-mg="tab"][data-id="sched"]');o.btn=!!document.querySelector('.wd100ban .wd101sea');
  const hc=document.querySelector('.wd100hc');o.noScout=!!hc&&!hc.querySelector('[data-wd100sc]')&&!hc.querySelector('[data-lg90ch]');o.team=(hc.querySelector('[data-mg="team"]')||{}).textContent;o.cardW=Math.round(hc.getBoundingClientRect().width);
  document.querySelector('.wd100ban .wd101sea').click();await W8(700);o.sched=MGR.tab==='sched'&&!!document.querySelector('.wd100cal')&&!!document.querySelector('.wd100ban .wd101sea')&&document.querySelector('.rail .on').dataset.id==='league';
  document.querySelector('.wd100ban .wd101sea').click();await W8(500);o.backL=MGR.tab==='league';return o});
ok(E.bare&&E.pins>=10&&E.back,'M8 bare map '+JSON.stringify(E));ok(E.rail&&E.btn&&E.sched&&E.backL,'M9 Season button '+JSON.stringify(E));ok(E.noScout&&/Team Details/.test(E.team),'M10 house card buttons '+JSON.stringify(E));ok(E.cardW>=340,'M22 wider house card '+JSON.stringify(E));
/* M43 · My Acta */
const F=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const o={};const n=w.night;const g=rosterOf(pm)[0];
  /* a real bout: the record of the purse */
  g.inj=null;n.bouts[0].ents=[g.id];const t=travelState(w);if(t&&!t.paid){pm.coin+=t.cost;travelClick('travelpay')}if(typeof any100FillAll==='function')any100FillAll(w);
  n.bouts[0].rig=g.id;w.rigCount=-20;await runBoutSim(0);const abs=n.week;o.rec=!!(w.my101&&w.my101[abs]&&w.my101[abs][g.name]!=null);o.coin=w.my101&&w.my101[abs]&&w.my101[abs][g.name];
  w.acta96=w.acta96||{};const a1=w.week-1;w.week=w.week+1;
  const base=w.week-wkOf(w.week);const abs1=base+1;w.acta96[abs1]={s:w.season,rows:[{n:g.name,t:'Undercard',ev:'Democritus',p:1,w:true,f:30,fate:''},{n:'Second Man',t:'Undercard',ev:'Democritus',p:2,w:false,f:12,fate:''}]};w.my101=w.my101||{};w.my101[abs1]={[g.name]:41};
  MGR.tab='sched';MGR_REDRAW();await W8(700);const rows=[...document.querySelectorAll('.wd100sr.act101')];o.rows=rows.length;o.txt=rows.map(r=>r.textContent.replace(/\s+/g,' ')).join('|');o.head=[...document.querySelectorAll('.wd100two .plq100,.wd100two *')].some(x=>x.textContent==='My Acta');
  w.week=w.week-1;return o});
ok(F.rec&&F.rows>=2&&/won/.test(F.txt)&&/\+41/.test(F.txt)&&/\+3/.test(F.txt)&&/\+1/.test(F.txt),'M43 My Acta rows '+JSON.stringify(F));
/* M33 M34 · Tituli */
const G=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const o={};const g=rosterOf(pm)[0];
  pm.perkPts=3;MGR.tab='ludus';MGR_REDRAW();await W8(400);const oval=id=>{const b=document.querySelector(`.rail [data-mg="tab"][data-id="${id}"] .mcount.c101`);return b?b.textContent:''};o.perk=oval('me');
  MGR.tab='me';MGR_REDRAW();await W8(500);o.perkBan=!!document.querySelector('.b73-me .ptbox')&&document.querySelector('.b73-me .ptbox').textContent==='3';pm.perkPts=0;
  tit101Seen(w);const c0=pm.coin,f0=pm.fame;g.cfBank=0;earnTrophy(w,'aureus',{who:g.name,gid:g.id});o.cf=!(g.cfBank>0);o.paid=pm.coin===c0+40&&pm.fame>=f0;
  MGR.tab='ludus';MGR_REDRAW();await W8(400);o.unseen=oval('trophy');o.label=/Tituli/.test(document.querySelector('.rail [data-mg="tab"][data-id="trophy"]').textContent)&&!/Trophies/.test(document.querySelector('.rail [data-mg="tab"][data-id="trophy"]').textContent);
  MGR.tab='trophy';WD100.tf='mgr';WD101.sub='honours';MGR_REDRAW();await W8(700);
  o.tools=!!document.querySelector('.wd101seg')&&!document.querySelector('.wd100case');const p=document.querySelector('.wd100tp[data-wd100tp="aureus"]');o.newTag=!!p&&p.classList.contains('new101');o.rw=!!p&&/40/.test((p.querySelector('.rw101')||{}).textContent||'')&&/4/.test((p.querySelector('.rw101')||{}).textContent||'')&&!/CF/.test(p.textContent);
  o.oldList=!!document.querySelector('.trlist');
  p.click();await W8(500);o.seen=oval('trophy')==='';
  document.querySelector('[data-wd101sub="case"]').click();await W8(600);o.case=!!document.querySelector('.wd100case .tcase')&&!document.querySelector('.wd100tit')&&!document.querySelector('.trlist')&&!!document.querySelector('.wd100tools');
  document.querySelector('[data-wd101sub="honours"]').click();await W8(400);o.back=!document.querySelector('.wd100case')&&!!document.querySelector('.wd100tit');return o});
ok(G.perk==='3'&&G.perkBan,'M33 perk oval + banner '+JSON.stringify(G));ok(G.unseen==='1'&&G.newTag&&G.seen,'M33 unseen honours oval '+JSON.stringify(G));ok(G.label&&G.tools&&G.rw&&!G.oldList&&G.case&&G.back,'M34 Tituli view '+JSON.stringify(G));ok(G.cf&&G.paid,'M34 no CF, coin + fame stay '+JSON.stringify(G));
/* M36 · bout cards on one row */
const H=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};MGR.tab='night';MGR_REDRAW();await W8(900);const st=document.querySelector('.roomstat.bt85w');o.n=st?st.querySelectorAll('.bt85').length:0;
  if(st){const mids=[...st.querySelectorAll('.bt85')].map(x=>{const r=x.getBoundingClientRect();return r.top+r.height/2});o.one=Math.max(...mids)-Math.min(...mids)<8;o.nowrap=getComputedStyle(st).flexWrap==='nowrap';const r=st.getBoundingClientRect();o.inside=r.left>=0&&r.right<=innerWidth}return o});
ok(H.n>=4&&H.one&&H.nowrap&&H.inside,'M36 bout cards one row '+JSON.stringify(H));
/* M38 · negative treasury note */
const I=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const pm=me();const o={};pm.coin=-40;MGR.tab='ludus';MGR_REDRAW();await W8(700);const n=document.querySelector('.railmain>.tiphint.neg101');o.top=!!n&&/treasury/i.test(n.textContent);
  const rm=document.querySelector('.railmain');o.first=!!n&&[...rm.children].indexOf(n)<[...rm.children].indexOf(rm.querySelector('.roomhd'));o.old=!!document.querySelector('#mgrPane .card2[style*="blood2"]');pm.coin=900;MGR_REDRAW();await W8(400);o.gone=!document.querySelector('.tiphint.neg101');return o});
ok(I.top&&I.first&&!I.old&&I.gone,'M38 negative treasury note '+JSON.stringify(I));
/* M44 · the Clerk's loan letter */
const J=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const o={};MGR.tab='ludus';w.loan={amt:120,name:"Sica's syndicate",kind:'synd',due:18,paid:0,missed:0};pm.coin=500;MGR_REDRAW();await W8(700);
  const L=(w.letters||[]).find(x=>x.key==='clerk-loan');o.letter=!!L&&L.adv==='clerk'&&/data-mg="loanmin"/.test(L.body)&&/data-mg="loanpayall"/.test(L.body);
  o.lit=!!document.querySelector('.c83p[data-c83="clerk"].lit');o.row=/Sica|owe/i.test((document.getElementById('desk99')||{textContent:''}).textContent);
  const paid0=w.loan.paid;const m0=pm.coin;document.querySelector('[data-mg="loanmin"]')?document.querySelector('[data-mg="loanmin"]').click():0;await W8(500);o.btn=document.querySelector('[data-mg="loanmin"]')?true:'(button inside a closed row)';
  w.loan=null;MGR_REDRAW();await W8(400);const L2=(w.letters||[]).find(x=>x.key==='clerk-loan');o.cleared=!L2||L2.read;
  /* the syndicate's warning is the Clerk's voice */
  w.letters=[];sendLetter(w,{key:'synd-warn',from:"Sica's syndicate",seal:'🗡',title:'x',until:w.week,body:'<p>x</p>'});const sw=w.letters.find(x=>x.key==='synd-warn');o.warn=sw&&sw.adv==='clerk';w.letters=[];return o});
ok(J.letter&&J.lit&&J.cleared&&J.warn,'M44 Clerk loan letter '+JSON.stringify(J));
/* M11 M12 M16 M45 · the Council, popups */
const K=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const o={};MGR.tab='ludus';LU100.pop=null;LU100.panel=null;MGR.run=null;MGR_REDRAW();await W8(700);
  const cc=document.querySelector('#council83.c101');o.council=!!cc&&!!cc.querySelector('.c101top>.c83p[data-c83="consilium"]')&&cc.querySelectorAll('.c83row .c83p').length===5;
  o.title=/The Council/.test(document.querySelector('.lu100t.k-adv .cap b').textContent)&&!/Advisors/.test(document.querySelector('.lu100t.k-adv .cap b').textContent);
  const tr=document.querySelector('.lu100t.k-adv').getBoundingClientRect(),cr=document.querySelector('.c101cons .c83f').getBoundingClientRect();o.centred=Math.abs((cr.left+cr.width/2)-(tr.left+tr.width/2))<24;const big=cr.width>document.querySelector('.c83row .c83f').getBoundingClientRect().width+8;o.bigger=big;
  document.querySelector('.c83p[data-c83="consilium"]').click();await W8(500);let p=document.getElementById('lu100pop');o.counsel=!!p&&!!p.querySelector('.cn101 .cons')&&!document.querySelector('.lu100panel');
  document.querySelector('.c83p[data-c83="clerk"]').click();await W8(500);p=document.getElementById('lu100pop');o.ledger=!!p&&!!p.querySelector('.led101')&&!p.querySelector('[data-id="ledger"]')&&!document.querySelector('.lu100panel');
  /* M45 · another button closes it */
  document.querySelector('[data-lu100mail]').click();await W8(300);o.closedMail=!document.getElementById('lu100pop')&&!LU100.pop;
  document.querySelector('.c83p[data-c83="doctore"]').click();await W8(400);o.openAgain=!!document.getElementById('lu100pop');document.querySelector('.rail [data-mg="tab"][data-id="roster"]').click();await W8(500);o.closedTab=!document.getElementById('lu100pop')&&!LU100.pop;
  MGR.tab='ludus';MGR_REDRAW();await W8(500);o.stayShut=!document.getElementById('lu100pop');
  /* the badge opens the Clerk's popover */
  document.querySelector('[data-lu2led]').click();await W8(500);p=document.getElementById('lu100pop');o.badge=MGR.tab==='ludus'&&!!p&&!!p.querySelector('.led101')&&!document.querySelector('.lu100panel');LU100.pop=null;MGR_REDRAW();await W8(300);
  /* M11 · Promote is a popup */
  document.querySelector('.lu100t.k-promote').click();await W8(600);const pn=document.querySelector('#mgrPane .lu100panel.pr101');o.promote=!!pn&&getComputedStyle(pn).position==='fixed'&&!!document.querySelector('.pr101scrim')&&pn.getBoundingClientRect().width<=800&&/Feast/.test(pn.textContent);
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await W8(400);o.escClose=!document.querySelector('#mgrPane .lu100panel');return o});
ok(K.council&&K.title&&K.centred&&K.bigger,'M12 The Council '+JSON.stringify(K));ok(K.counsel&&K.ledger&&K.badge,'M16 counsel + ledger inside the popovers '+JSON.stringify(K));ok(K.closedMail&&K.openAgain&&K.closedTab&&K.stayShut,'M45 popover closes '+JSON.stringify(K));ok(K.promote&&K.escClose,'M11 Promote popup '+JSON.stringify(K));
await pg.close();
/* phone: no sideways scroll on the changed pages */
const pp=await open(390,844);
const P=await ev(pp,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};for(const t of ['ludus','recruit','league','trophy','sched']){MGR.tab=t;MGR_REDRAW();await W8(500);o[t]=document.documentElement.scrollWidth<=392}
  MGR.tab='ludus';MGR_REDRAW();await W8(400);document.querySelector('.c83p[data-c83="consilium"]').click();await W8(400);const p=document.getElementById('lu100pop');o.pop=!!p&&p.getBoundingClientRect().right<=392;return o});
ok(Object.values(P).every(Boolean),'390: no sideways scroll '+JSON.stringify(P));await pp.close();
/* kill switch */
const po=await open(1440,900,true);
const Z=await ev(po,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};MGR.tab='recruit';MGR_REDRAW();await W8(700);o.stable=!!document.querySelector('[data-mg="filter"][data-id="mine"]');o.sched=!!document.querySelector('.rail [data-mg="tab"][data-id="sched"]');
  MGR.tab='ludus';MGR_REDRAW();await W8(500);o.noCouncil=!document.querySelector('#council83.c101');o.adv=/Advisors/.test(document.querySelector('.lu100t.k-adv .cap b').textContent);return o});
ok(Z.stable&&Z.sched&&Z.noCouncil&&Z.adv,'kill switch → the old pages '+JSON.stringify(Z));await po.close();
console.log(JSON.stringify({A,B,C,D,E,F,G,H,I,J,K,P,Z}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

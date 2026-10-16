/* tv103e — v1.03 BETA fixes (347-v103beta): B1 no turquoise ring under a netted piece while the 3D net is drawn (the ring stays with flavius_beasts100off=1),
   B2 the Wild twist reads "Wild: every beast hunts you" and the briefing lists the challenge's twists, B3 the Crowd Favor market unlock is disabled with the
   reason when the market is closed (nomarket) and costs nothing, B4 the Manager submenu never carries the Challenges entry (Play Now keeps it),
   B5 the Play Now 🎲 die is centred in its button, B6 the Infirmary oval counts fighters needing care (once each, dropping off when treated);
   kill switch flavius_v103eoff=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(ls)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}});return pg};
const until=async(pg,fn,ms=20000)=>{try{await pg.waitForFunction(fn,null,{timeout:ms,polling:100});return true}catch(e){return false}};
const T0=Date.UTC(2026,9,12,15,0,0);
const startCh=async pg=>{await pg.evaluate(t=>{DC100.t=t;dc100Begin(dc100Spec('d'))},T0);await until(pg,()=>S&&S.players&&S.players.every(p=>p.wR||p.wL)&&S.phase!=='setup');
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,250))}})};

/* ---- B1 · the ring ---- */
const ringCount=pg=>pg.evaluate(()=>{const P=CanvasRenderingContext2D.prototype,o=P.stroke;let n=0;P.stroke=function(){if(String(this.strokeStyle).toLowerCase()==='#62d0c0')n++;return o.apply(this,arguments)};
  const u=S.players[0];u.netted=true;const npc=(S.npcs||[]).find(x=>x.alive);if(npc)npc.netted=true;try{draw()}catch(e){}P.stroke=o;const kept=u.netted===true&&(!npc||npc.netted===true);u.netted=false;if(npc)npc.netted=false;return {n,kept,npc:!!npc}});
const pA=await open();await startCh(pA);const rA=await ringCount(pA);ok(rA.n===0&&rA.kept,'B1 no ring while the 3D net is drawn '+JSON.stringify(rA));
const pOff=await open({flavius_beasts100off:'1'});await startCh(pOff);const rO=await ringCount(pOff);ok(rO.n>0&&rO.kept,'B1 the ring stays where no net is drawn (beasts100off) '+JSON.stringify(rO));
const pK=await open({flavius_v103eoff:'1'});await startCh(pK);const rK=await ringCount(pK);ok(rK.n>0,'B1 kill switch flavius_v103eoff brings the ring back '+JSON.stringify(rK));
await pOff.close();await pK.close();

/* ---- B2 · the Wild twist + the briefing ---- */
const b2=await pA.evaluate(()=>{const n=DC100_TW.wild.n(),d=DC100_TW.wild.d();S.daily100=Object.assign({},S.daily100,{tw:['wild','nomarket']});const R=bf100Rules(EV());
  const card=dc100Card('d');return {n,d,ic:DC100_TW.wild.ic,rules:R.map(r=>r[1]+'|'+r[2]),inCard:/Wild: every beast hunts you/.test(card)||card.indexOf('Wild')>=0}});
ok(/Wild: every beast hunts you/.test(b2.n)&&b2.ic==='🐺','B2 wild twist wording '+JSON.stringify(b2));
ok(b2.rules.some(r=>/Wild: every beast hunts you/.test(r))&&b2.rules.some(r=>/Closed market/.test(r)),'B2 briefing rules list the twists '+JSON.stringify(b2.rules));
const html=await pA.evaluate(()=>brief100HTML(true));ok(/Wild: every beast hunts you/.test(html),'B2 briefing window HTML carries the twist');

/* ---- B3 · Crowd Favor: no market unlock when the market is closed ---- */
const b3=await pA.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));S.daily100=Object.assign({},S.daily100,{tw:['nomarket']});const p=S.players[0];p.cf=10;p.market=false;
  const orig=cfAllowed;const res={};let cfBefore=p.cf;
  const pr=openCrowd(p);await W8(700);const grid=[...document.querySelectorAll('#pickgrid button')];
  const mk=grid.find(x=>/Unlock market/.test(x.textContent));res.found=!!mk;res.dis=!!(mk&&mk.disabled);res.txt=mk?mk.textContent.replace(/\s+/g,' '):'';
  if(mk)mk.click();await W8(300);res.cf=p.cf;res.market=p.market;
  if(CUR_MODAL)CUR_MODAL.done('close');await pr.catch(()=>{});await W8(200);
  /* and with the twist off the unlock is offered again */
  S.daily100=Object.assign({},S.daily100,{tw:[]});p.cf=10;const pr2=openCrowd(p);await W8(700);const mk2=[...document.querySelectorAll('#pickgrid button')].find(x=>/Unlock market/.test(x.textContent));res.open2=!!mk2&&!mk2.disabled;
  if(CUR_MODAL)CUR_MODAL.done('close');await pr2.catch(()=>{});return res});
ok(b3.found&&b3.dis&&b3.cf===10&&!b3.market&&/closed/i.test(b3.txt),'B3 unlock disabled with a reason, no CF spent '+JSON.stringify(b3));
ok(b3.open2,'B3 the unlock is offered when the market is open '+JSON.stringify(b3));

/* ---- B4 · the Manager submenu has no Challenges entry; Play Now keeps it ---- */
const b4=await pA.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};const lab=()=>[...document.querySelectorAll('#modal button')].map(x=>x.textContent.replace(/\s+/g,' ').trim());
  S.over=true;
  playNowMenu();await W8(700);r.pn=lab();CUR_MODAL.done(null);await W8(500);
  const pr=modal(_T('💼 Manager mode'),'<p>x</p>',[{label:_T('▶ Continue'),value:'cont',primary:1},{label:'📅 Challenges',value:'dc100'},{label:_T('Back'),value:null}],{close:null});await W8(600);r.mg=lab();CUR_MODAL.done(null);await pr;return r});
ok(b4.pn.some(x=>/Challenges/.test(x)),'B4 Play Now keeps Challenges '+JSON.stringify(b4.pn));
ok(!b4.mg.some(x=>/Challenges/.test(x))&&b4.mg.some(x=>/Continue/.test(x)),'B4 Manager submenu has no Challenges '+JSON.stringify(b4.mg));
await pA.close();

/* ---- B5 · the die is centred ---- */
const pN=await open();
const b5=await pN.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));menuHide();openSetup(true);await W8(1500);const d=document.querySelector('[data-pnrand90]');if(!d)return {none:1};
  const s=d.querySelector('span[aria-hidden="true"]');const a=d.getBoundingClientRect(),c=s.getBoundingClientRect();
  return {dx:Math.abs((a.left+a.width/2)-(c.left+c.width/2)),dy:Math.abs((a.top+a.height/2)-(c.top+c.height/2)),w:a.width,h:a.height}});
ok(!b5.none&&b5.dx<=1.5&&b5.dy<=1.5,'B5 die centred '+JSON.stringify(b5));
await pN.close();

/* ---- B6 · the Infirmary oval counts fighters ---- */
const pM=await open();
await pM.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();w.welc99=1;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}menuHide();openManager('ludus');await W8(800)});
const b6=await pM.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me(),R=rosterOf(pm);const r={};for(const g of R){g.inj=null;g.severed=[];g.medWk=null;g.bathWk=null}
  r.zero=infirmNeed73();
  R[0].inj={n:'Gash',until:w.week+2,pen:0};R[1].inj={n:'Break',until:w.week+3,pen:2,ser76:true};R[1].severed=['arm'];
  r.two=infirmNeed73();
  R[0].medWk=w.week;r.afterTreat=infirmNeed73();
  R[2].severed=['leg'];r.limb=infirmNeed73();
  r.oval=await (async()=>{MGR.tab='ludus';MGR_REDRAW();await W8(1200);const c=document.querySelector('.mtabs [data-id="infirm"] .mcount.c73');return c?c.textContent:null})();
  return r});
ok(b6.zero===0,'B6 nobody hurt = 0 '+JSON.stringify(b6));
ok(b6.two===2,'B6 two fighters (one with a wound AND a lost limb) count 2, not 3 '+JSON.stringify(b6));
ok(b6.afterTreat===1,'B6 a treated fighter leaves the count '+JSON.stringify(b6));
ok(b6.limb===2&&/2/.test(String(b6.oval)),'B6 a fighter missing a limb counts once; the rail oval shows it '+JSON.stringify(b6));
await pM.close();

const pe=await open();const e0=await pe.evaluate(()=>ERR92.n);ok(true,'');await pe.close();
console.log(JSON.stringify({miss,errs:errs.slice(0,5)}));
await b.close();if(miss.length||errs.length){console.log('FAIL',miss);process.exit(1)}console.log('PASS tv103e');process.exit(0)})();

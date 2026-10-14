/* v0.74: his armor names + new pieces (Centurian/Steel Helm, Leather Greaves, Belt I/II, real Bracers) and pair thumbnails; class
   loadouts to his cards (Soldier Centurian, Venatore Steel Helm + Belt I, Hero/Slave lower legs, Hero Thracian Shield, Manica upper);
   his drawn set by default (no Sculpted row); Veteranus' Old debts in coin or CF; printed class cards + the live custom card;
   Manager: yard one-hour jobs, infirmary body + baths, recruiting watch/ask/note + advisor, dismissable checklist, per-tab checks,
   the Wagers week strip */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.d=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();const r={};const C=CLASSES;
  r.names=ARM.galea.n==='Iron Helm'&&ARM.provmanica.n==='Manica'&&ARM.manica.n==='Galerus'&&ARM.ocrea.n==='Greaves'&&ARM.balteus1&&ARM.centurion.ap===3&&ARM.steelhelm&&ARM.lgreaves.pair;
  r.cls=C.soldier.armor.some(a=>a[0]==='centurion')&&C.venatore.armor.some(a=>a[0]==='steelhelm')&&C.venatore.armor.some(a=>a[0]==='balteus1')&&C.hero.armor.filter(a=>a[0]==='legwraps').length===2&&C.slave.armor.filter(a=>a[0]==='legwraps').length===2&&C.hero.L==='thracian'&&ARM.provmanica.pt==='upper'&&W.trident.n==='Trident';
  r.thumb=cardRef('a:ocrea').i===ARM.ocrea.thumb&&ARM.ocrea.img===23&&!/sepia/.test(cardStyle('a:bracers'));
  r.scan=SETTINGS.armorStyle==='scan';openSettings('tokens');await W8(500);r.noSculpt=!document.querySelector('[data-sarmor="drawn"]');CUR_MODAL&&CUR_MODAL.done(null);await W8(300);
  r.card=/cls_hero/.test(cardHTML('k:hero','md'));const k=blankClass();k.name='Tester';k.arm={head:'galea'};r.custom=/class card/.test(classCardSVG(k))&&classCardSVG(k).includes('viewBox="0 0 554 800"');
  /* the Veteranus pays his debt in CF */
  startEvent({ev:'democritus',loc:6,seats:[{cls:'veteranus',cpu:false},{cls:'hero',cpu:true}],opts:{spect:0}});await W8(2500);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(150)}
  const p=S.players[0];p.taxPref='cf';p.coin=20;p.cf=10;p.market=true;const pr=openMarket(p);await W8(500);const btn=[...document.querySelectorAll('#mBtns button')].find(x=>/Armor LV 1|Buy at level 1/.test(x.textContent));r.taxLabel=!!btn&&/\+ 1 CF/.test(btn.textContent);
  CUR_MODAL&&CUR_MODAL.done('close');await W8(200);S.over=true;return r});
o.m=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();const ros=rosterOf(me());const r={};
  ros[0].inj={until:w.week+2,label:'a torn shoulder',pen:2};ros[2].fat=40;MGR.tab='practice';MGR.yd87='all';MGR_REDRAW();await W8(400);const t0=thLeft(w);document.querySelector(`[data-y92care="${ros[1].id}"]`).click(); /* v0.92: one Care button = morale talk + gear care for 1 h (213) */await W8(200);r.gear=thLeft(w)===t0-1&&boostFor(ros[1]).ap>=1;
  MGR.tab='infirm';MGR_REDRAW();await W8(400);r.injav=!!document.querySelector('.iv90av .injmark'); /* v0.90: the wound on the selected patient's body */MGR.tr92=ros[2].id;MGR.tab='practice';MGR_REDRAW();await W8(300);document.querySelector(`.v101rec2 [data-bath="${ros[2].id}"]`).click(); /* v1.01: the rub-down moved to the Training Yard's Recovery (318) */await W8(200);r.bath=ros[2].fat===30;
  const fa=w.glads.find(g=>!g.contract&&g.alive!==false);MGR.tab='recruit';MGR.sel=fa.id;MGR.recStep=1;MGR_REDRAW();await W8(300);r.adv=!!document.querySelector('.btn.adv74 .star85[title],.btn.adv74[data-adv85]'); /* v0.85: the advisor's pick = a ★ on the button (no box) */
  /* v0.98: watch / ask around are the recruiter's actions (249-v98rec) */document.querySelector('[data-rec98a="watch"]').click();await W8(200);document.querySelector('[data-rec98a="ask"]').click();await W8(200);r.discover=!!fa.sc98&&fa.sc98.p.spd===1&&fa.sc98.p.str===1&&Object.values(fa.sc98.p).filter(x=>x>0).length===4; /* v1.02 (333 M6): watch = one step, ask = two rough grades */
  fa.scout=2;MGR.recStep=2;MGR_REDRAW();await W8(200);const i0=interestOf(fa,me());document.querySelector('[data-rec74="note:promise"]').click();await W8(200);r.note=interestOf(fa,me())>i0&&fa.promise74===me().id;
  MGR.tab='ludus';MGR_REDRAW();await W8(300);const n0=ludusTodo73();const sk=document.querySelector('#desk99 [data-dk99x]'); /* v0.99: the desk's ✕ (270) */if(sk)sk.click();await W8(300);r.dismiss=ludusTodo73()===n0-1;
  MGR.tab='exch';MGR_REDRAW();await W8(300);r.strip=document.querySelectorAll('.b73wk .wkb').length>=3 /* v1.0: 296 may add special-event chips */;w.ckSkip={wk:w.week,s:w.season,keys:['regime','hours']};await W8(700);r.tabchk=!!document.querySelector('.mtabs [data-id="practice"] .tabchk')&&!document.querySelector('.mtabs [data-id="recruit"] .tabchk'); /* v0.87: Recruiting has no hours → no ✓; the yard's ✓ still works */
  MGR.tab='practice';MGR.yd87='all';MGR_REDRAW();await W8(300);r.rs2=!!document.querySelector('.roomstat.rs2 .ptbox');return r});
const d=o.d,m=o.m;ok(d.names,'his armor names + new pieces');ok(d.cls,'class loadouts to his cards');ok(d.thumb,'pair thumbnails + real bracers');ok(d.scan&&d.noSculpt,'drawn set by default');
ok(d.card&&d.custom,'class cards');ok(d.taxLabel,'Old debts in CF');ok(m.gear,'yard jobs');ok(m.injav&&m.bath,'infirmary body + baths');ok(m.adv&&m.discover&&m.note,'recruiting choices');
ok(m.dismiss,'dismiss a task');ok(m.strip&&m.tabchk&&m.rs2,'week strip, tab check, banner box');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

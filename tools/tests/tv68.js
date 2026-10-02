/* v0.68: weekly checklist in Your ludus (one button per item, done items fold), money ledger badge (net/week + runway),
   "You are about to skip" in the end-week confirmation, economy levers (fees, wages, gate share, starting purse);
   the stands in right-column tabs (Fighter · Field · Stands), the Stands button, the crowd ticker, the Bestiary */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me(),ros=rosterOf(m);
  ros[0].inj={until:w.week+2,label:'a torn shoulder',pen:2};ros[1].contract.weeks=1;MGR.tab='ludus';MGR_REDRAW();await W8(500);
  const r={items:document.querySelectorAll('.wkcheck .wkitem:not(.done)').length,ledger:(document.querySelector('.badge.ledger')||{}).textContent||'',money:weekMoney(),
    econ:TIERS.main.fee===ECON.fees.main&&WAGE_MUL<1&&gateShare({fame:200})===ECON.gateMax,bonus:!!w._econ68,
    hurt:/is hurt/.test(document.querySelector('.wkcheck').textContent),renewBtn:!!document.querySelector(`.wkcheck [data-mg="extend"][data-id="${ros[1].id}"]`)};
  r.skip=(endConfirmHTML()||'').includes('You are about to skip');
  {const riv=w.mgrs.find(x=>!x.isPlayer&&!x.dead&&rosterOf(x).length);riv.p.discipline=90;riv.coin=500;const g=rosterOf(riv).find(x=>!x.inj);g.fat=0;const s0={...gStats(g)},c0=riv.coin;
   rivalTrain(w);const s1=gStats(g);r.riv={reg:riv.train,paid:c0-riv.coin===TRAIN_REGIMES.hard.c,grew:(s1.str+s1.spd)>(s0.str+s0.spd)||!!g.inj,fat:g.fat>0||!!g.inj};
   const h=rosterOf(riv)[0];h.fat=80;h.inj=null;rivalTrain(w);r.riv.rest=h.restWk===w.week}
  document.querySelector('.wkcheck [data-mg="tab"][data-id="infirm"]').click();await W8(400);r.tab=MGR.tab;
  MGR.tab='ludus';delete ros[0].inj;MGR_REDRAW();await W8(300);r.after=document.querySelectorAll('.wkcheck .wkitem:not(.done)').length;r.done=!!document.querySelector('.wkcheck .wkdone');return r});
ok(o.a.items>=4,'checklist items');ok(o.a.hurt&&o.a.renewBtn,'hurt + renew items');ok(/\/wk/.test(o.a.ledger)&&o.a.money.net===o.a.money.gate+o.a.money.fees-o.a.money.wages,'ledger');
ok(o.a.econ&&o.a.bonus,'economy levers');ok(o.a.riv.reg==='hard'&&o.a.riv.paid&&o.a.riv.grew&&o.a.riv.fat&&o.a.riv.rest,'rivals train');ok(o.a.skip,'skip list');ok(o.a.tab==='infirm','button opens the tab');ok(o.a.after===o.a.items-1&&o.a.done,'done items fold');
/* the stands: right-column tabs, the top-bar Stands button, the ticker, the Bestiary */
o.s=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);
  startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:false},{cls:'hero',cpu:true},{cls:'slave',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:'auto'}});
  await W8(3000);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}sideTab('fighter');
  const shown=id=>{const e=document.getElementById(id);return !!e&&!e.hidden&&getComputedStyle(e).display!=='none'};const r={tabs:document.querySelectorAll('#sideTabs [data-sidetab]').length};
  r.f=shown('board')&&!shown('rosterGrp')&&!shown('standsPane');
  document.querySelector('[data-sidetab="field"]').click();await W8(200);r.fld=shown('rosterGrp')&&shown('npcPanel')&&!shown('board')&&!!document.querySelector('#npcPanel [data-bestiary]');
  document.querySelector('#btnDrawB').click();await W8(300);r.st=shown('standsPane')&&!!document.querySelector('#standsPane .crow')&&!CUR_MODAL&&/Stands/.test(document.querySelector('#btnDrawB').textContent);
  r.tick=!document.getElementById('crowdTick').hidden&&document.querySelector('#crowdTick .tkt').textContent.length>5;
  sideTab('fighter');document.getElementById('crowdTick').click();await W8(200);r.tickGo=SIDE.tab==='stands';
  openMenagerie();await W8(700);r.best=!!document.querySelector('#menagBody')&&!document.querySelector('#menagBody #npcDrawer');if(CUR_MODAL)CUR_MODAL.done(null);
  sideTab('fighter');return r});
ok(o.s.tabs===3&&o.s.f&&o.s.fld&&o.s.st,'side tabs');ok(o.s.tick&&o.s.tickGo,'crowd ticker');ok(o.s.best,'bestiary only');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

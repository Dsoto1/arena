/* v0.68: weekly checklist in Your ludus (one button per item, done items fold), money ledger badge (net/week + runway),
   "You are about to skip" in the end-week confirmation, economy levers (fees, wages, gate share, starting purse) */
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
  document.querySelector('.wkcheck [data-mg="tab"][data-id="infirm"]').click();await W8(400);r.tab=MGR.tab;
  MGR.tab='ludus';delete ros[0].inj;MGR_REDRAW();await W8(300);r.after=document.querySelectorAll('.wkcheck .wkitem:not(.done)').length;r.done=!!document.querySelector('.wkcheck .wkdone');return r});
ok(o.a.items>=4,'checklist items');ok(o.a.hurt&&o.a.renewBtn,'hurt + renew items');ok(/\/wk/.test(o.a.ledger)&&o.a.money.net===o.a.money.gate+o.a.money.fees-o.a.money.wages,'ledger');
ok(o.a.econ&&o.a.bonus,'economy levers');ok(o.a.skip,'skip list');ok(o.a.tab==='infirm','button opens the tab');ok(o.a.after===o.a.items-1&&o.a.done,'done items fold');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

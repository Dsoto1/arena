/* v0.84 → v0.95: the Roster depth chart (143-v84roster, replaced by 229-v95mgr's starters): three bout slots + bench chips (no columns),
   ⭐ Promote / 🪑 Bench on the list rows, the Lend select on non-starters only, a hurt fighter cannot be promoted, Loans = a tab beside
   the chart, no sideways scroll on a phone */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const setup=async pg=>{await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  return pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();for(const g of ownRoster(pm))g.contract=null;
    window.T84=[];for(let i=0;i<8;i++){const g=genGlad({ovr:45+i*3});g.contract={mgr:pm.id,wage:5,weeks:8,since:1};g.inj=null;w.glads.push(g);T84.push(g)}
    MGR.tab='roster';MGR_REDRAW();await W8(600);return true})};
const pg=await b.newPage({viewport:{width:1400,height:1000}});await setup(pg);
o.d=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const d=document.querySelector('.depth.st95');
  r.slots=document.querySelectorAll('.depth .st95slot').length;r.cols=document.querySelectorAll('.depth .dcol84').length;r.h=Math.round(d.getBoundingClientRect().height);
  r.none=document.querySelectorAll('.depth .st95slot.full').length===0;r.benchN=document.querySelectorAll('.depth .st95bench .st95chip').length;
  const pm=me(),w=W_();
  /* promote four: three land, the fourth is refused */
  const ids=T84.slice(3).map(g=>g.id);for(const id of ids.slice(0,4)){const bt=document.querySelector(`.st95list [data-st95="promo"][data-id="${id}"]`);if(bt)bt.click();await W8(250)}
  r.starters=T84.filter(g=>g.slot95).length;r.slotsFull=document.querySelectorAll('.depth .st95slot.full').length;r.flag=T84.filter(g=>g.slot95).every(g=>!g.bench)&&T84.filter(g=>!g.slot95).every(g=>g.bench);
  r.depthOf=depthOf(pm).starters.length===3;
  const g=T84.find(x=>x.slot95);const tb=document.querySelector(`.st95list [data-st95="bench"][data-id="${g.id}"]`);r.tog=!!tb;if(tb)tb.click();await W8(300);
  r.benched=!g.slot95&&!!g.bench&&!!document.querySelector(`.depth .st95bench [data-id="${g.id}"]`);
  r.lenders=w.mgrs.filter(m=>!m.isPlayer&&!isRival(m)&&opinionOf(m).v>=30&&rosterOf(m).length<9).length;
  r.lend=!!document.querySelector(`.st95list select.dclend[data-m47lend="${g.id}"]`);const st=T84.find(x=>x.slot95);r.noLendStarter=!document.querySelector(`.st95list select.dclend[data-m47lend="${st.id}"]`);
  /* a hurt fighter: no promote button */
  const h=T84.find(x=>!x.slot95&&x!==g);h.inj={until:w.week+2,label:'cracked rib',pen:2};MGR_REDRAW();await W8(300);
  r.hurt=!document.querySelector(`.st95list [data-st95="promo"][data-id="${h.id}"]`)&&!!document.querySelector(`.depth .st95chip.hurt[data-id="${h.id}"]`);
  /* loans: a tab beside the chart */
  const lt=document.querySelector('.depth [data-st95tab="loans"]');r.loansTab=!!lt;if(lt){lt.click();await W8(300)}r.loansBody=!document.querySelector('.depth .st95slots')&&!!document.querySelector('.depth .st95tabs');
  document.querySelector('.depth [data-st95tab="chart"]').click();await W8(300);r.back=!!document.querySelector('.depth .st95slots');
  r.noWall=!document.querySelector('.dcard[data-gid84]');return r});
ok(o.d.slots===3&&o.d.cols===0&&o.d.none,'three empty slots, no depth columns');ok(o.d.benchN===8,'the bench holds every healthy non-starter');
ok(o.d.starters===3&&o.d.slotsFull===3&&o.d.flag&&o.d.depthOf,'at most three starters (g.bench follows)');ok(o.d.tog&&o.d.benched,'🪑 Bench');
ok(!o.d.lenders||o.d.lend,'lend select on a bench fighter');ok(o.d.noLendStarter,'no lend select on starters');ok(o.d.hurt,'hurt: no promote, hurt chip');
ok(o.d.loansTab&&o.d.loansBody&&o.d.back,'Loans tab beside the chart');ok(o.d.noWall,'no plaque wall');
await pg.close();
const ph=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await setup(ph);
o.p=await ph.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));T84[0].slot95=1;T84[1].inj={until:9,label:'cracked rib',pen:2};MGR_REDRAW();await W8(500);const r={};
  const d=document.querySelector('.depth');d.scrollIntoView();await W8(200);r.doc=document.documentElement.scrollWidth;r.depthOver=d.scrollWidth-d.clientWidth;
  const sl=[...document.querySelectorAll('.depth .st95slot')].map(c=>c.getBoundingClientRect());r.stacked=sl.every((c,i)=>!i||c.top>=sl[i-1].bottom-1);
  r.cardsIn=sl.every(R=>R.left>=0&&R.right<=390);return r});
ok(o.p.doc<=390&&o.p.depthOver<=1&&o.p.cardsIn,'no horizontal scroll at 390px');ok(o.p.stacked,'phone: slots stacked');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

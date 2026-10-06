/* v0.84: the Roster depth chart as the barracks wall (143-v84roster) — 8 starters fit in a short wall, empty columns
   collapse to narrow posts, the ⭐/🪑 toggle and the Lend select keep working, no sideways scroll on a phone */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const setup=async pg=>{await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  return pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();for(const g of ownRoster(pm))g.contract=null;
    window.T84=[];for(let i=0;i<8;i++){const g=genGlad({ovr:45+i*3});g.contract={mgr:pm.id,wage:5,weeks:8,since:1};g.bench=false;g.inj=null;w.glads.push(g);T84.push(g)}
    MGR.tab='roster';MGR_REDRAW();await W8(600);return true})};
const pg=await b.newPage({viewport:{width:1400,height:1000}});await setup(pg);
o.d=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const d=document.querySelector('.depth');
  r.h=Math.round(d.getBoundingClientRect().height);r.cols=document.querySelectorAll('.depth .dgrid > .dcol84').length;r.cards=document.querySelectorAll('.depth .dcard').length;
  r.posts=[...document.querySelectorAll('.depth .dpost84')].map(p=>Math.round(p.getBoundingClientRect().width));
  const sc=document.querySelector('.depth .dcol84:not(.dpost84)');r.stW=Math.round(sc.getBoundingClientRect().width);r.plH=Math.round(document.querySelector('.depth .dcard').getBoundingClientRect().height);
  /* toggle: bench the weakest starter */
  const g=T84[0];const tb=document.querySelector(`.depth .dctog[data-m48="bench"][data-id="${g.id}"]`);r.tog=!!tb;if(tb)tb.click();await W8(500);
  r.benched=!!g.bench&&!!document.querySelector(`.depth .dcard.bench [data-id="${g.id}"]`);r.benchPostGone=document.querySelectorAll('.depth .dpost84').length===1;
  const pm=me(),w=W_();r.lenders=w.mgrs.filter(m=>!m.isPlayer&&!isRival(m)&&opinionOf(m).v>=30&&rosterOf(m).length<9).length;
  r.lend=!!document.querySelector(`.depth .dcard.bench select.dclend[data-m47lend="${g.id}"]`);r.noLendStarter=!document.querySelector('.depth .dcard:not(.bench) select.dclend');
  /* and back */
  const tb2=document.querySelector(`.depth .dctog[data-m48="bench"][data-id="${g.id}"]`);if(tb2)tb2.click();await W8(500);r.back=!g.bench&&document.querySelectorAll('.depth .dpost84').length===2;
  /* a hurt fighter: no toggle, the ⚕ badge, in the Hurt column */
  T84[1].inj={label:'cracked rib',wk:2,weeks:2};MGR_REDRAW();await W8(400);const hc=document.querySelector(`.depth .dcard.hurt84[data-gid84="${T84[1].id}"]`);
  r.hurt=!!hc&&!hc.querySelector('.dctog')&&/cracked rib/.test(hc.textContent);
  /* the old tmgr47 hook still finds benched plaques */
  T84[2].bench=true;MGR_REDRAW();await W8(300);r.tm47=document.querySelectorAll('.dcard.bench').length===1;return r});
ok(o.d.h<300,'8 starters: depth chart under 300px');ok(o.d.cols===3&&o.d.cards===8,'three columns, eight plaques');
ok(o.d.posts.length===2&&o.d.posts.every(x=>x<=60),'empty columns are narrow posts');ok(o.d.stW>800,'starters take the width');ok(o.d.plH<=60,'plaques ~56px');
ok(o.d.tog&&o.d.benched&&o.d.benchPostGone,'toggle benches');ok(o.d.back,'toggle makes a starter again');
ok(!o.d.lenders||o.d.lend,'lend select on a bench fighter');ok(o.d.noLendStarter,'no lend select on starters');ok(o.d.hurt,'hurt plaque');ok(o.d.tm47,'.dcard.bench');
await pg.close();
const ph=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await setup(ph);
o.p=await ph.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));T84[0].bench=true;T84[1].inj={label:'cracked rib',wk:2,weeks:2};MGR_REDRAW();await W8(500);const r={};
  const d=document.querySelector('.depth');d.scrollIntoView();await W8(200);r.doc=document.documentElement.scrollWidth;r.depthOver=d.scrollWidth-d.clientWidth;
  const cols=[...document.querySelectorAll('.depth .dcol84')].map(c=>c.getBoundingClientRect());r.stacked=cols.every((c,i)=>!i||c.top>=cols[i-1].bottom-1);
  r.cardsIn=[...document.querySelectorAll('.depth .dcard')].every(c=>{const R=c.getBoundingClientRect();return R.left>=0&&R.right<=390});return r});
ok(o.p.doc<=390&&o.p.depthOver<=1&&o.p.cardsIn,'no horizontal scroll at 390px');ok(o.p.stacked,'phone: columns stacked');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

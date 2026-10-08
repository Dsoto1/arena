/* v0.90 part A3 (185-v90week): Match Week without the temple and the walk, the City Square button wearing its forum, the
   league's stake line; Walk the sand at the arena gate in the City Square (once, n.scouted, coin only);
   the League tab's Season stakes table, the prize paid at the season's close, a rival row opening its scouting card;
   a beast-pen fight starting zoomed in. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const W=ms=>pg.waitForTimeout(ms);const SHOT=process.env.SHOT||'';
/* A · Match Week */
const a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=300;w.night.travel={cost:0,paid:true};w.night.god76=null;w.night.scouted=null;
  const rv=w.mgrs.filter(x=>!x.isPlayer);msp(rv[0]).pts=9;msp(rv[1]).pts=6;msp(m).pts=3;
  MGR.tab='night';MGR_REDRAW();await W8(400);const B=document.getElementById('mgrBody');const r={};
  r.noTemple=!B.querySelector('[data-god76]');r.noWalk=!B.querySelector('[data-mg="scoutarena"]')&&!/🗺 Walk the sand|walked the sand at/.test(B.textContent);
  const cb=B.querySelector('[data-mg="city"]');r.city=!!cb&&cb.classList.contains('city90');
  for(let i=0;i<40;i++){const c=B.querySelector('[data-mg="city"]');if(c&&/data:image\/jpeg/.test(c.style.backgroundImage))break;await W8(100)}
  r.thumb=/data:image\/jpeg/.test((B.querySelector('[data-mg="city"]')||{style:{}}).style.backgroundImage||'');
  r.next=(B.querySelector('.lp90next')||{}).textContent||'';
  MGR.tab='ludus';MGR_REDRAW();await W8(300);r.ck=!!document.querySelector('#mgrBody .wkcheck .lp90next');MGR.tab='night';MGR_REDRAW();await W8(300);return r});
ok(a.noTemple,'A no temple on Match Week');ok(a.noWalk,'A no walk the sand on Match Week');ok(a.city&&a.thumb,'A the City Square button wears its forum '+JSON.stringify(a));
ok(a.next==='','A (v0.96) the next-prize line is a letter now, not a line on Match Week '+a.next);ok(!a.ck,'A (v0.96) and not in the weekly checklist');
if(SHOT){await W(300);await pg.screenshot({path:SHOT+'/tv90k_matchweek.png'})}
/* B · the League tab */
await pg.evaluate(()=>{MGR.tab='league';MGR_REDRAW()});await W(400);
const b1=await pg.evaluate(()=>{const w=W_();const t=document.querySelector('#mgrBody .lp90 .lp90t');const rows=t?t.querySelectorAll('tr').length-1:0;
  return {rows,n:w.mgrs.length,first:(document.querySelector('#mgrBody .lp96p.p1')||{}).title||'',next:!!document.querySelector('#mgrBody .lp90 .lp90next'),me:!!(t&&t.querySelector('tr.me'))}});
ok(b1.rows>=Math.min(6,b1.n)&&b1.rows<=8&&/120/.test(b1.first)&&b1.me&&b1.next,'B standings: podium prizes in the hover + table '+JSON.stringify(b1));
await pg.click('#mgrBody tr.lrowlink:not(.me)');await W(400);
const b2=await pg.evaluate(()=>{const box=document.querySelector('#mgrBody .lg90row .lg90');if(!box)return {box:false};const R=mgrById(box.dataset.lg90box);
  return {box:true,tab:MGR.tab,rows:box.querySelectorAll('.lg90r tr').length-1,ros:rosterOf(R).length,team:!!box.querySelector('[data-mg="team"]'),ch:!!box.querySelector('[data-lg90ch]'),week:!!box.querySelector('.lg90week')}});
ok(b2.box&&b2.tab==='league'&&b2.rows===b2.ros&&b2.team&&b2.ch&&b2.week,'B a rival row opens its scouting card '+JSON.stringify(b2));
if(SHOT)await pg.screenshot({path:SHOT+'/tv90k_league.png'});
const b3=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const R=mgrById(MGR.lg90);const n=w.night;
  if(!n.bouts[0].ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===R.id})){const g=rosterOf(R).find(x=>!x.inj);if(g)n.bouts[0].ents[0]=g.id}
  MGR_REDRAW();await W8(200);const bt=document.querySelector('#mgrBody [data-lg90ch]');if(bt&&!bt.disabled)bt.click();await W8(300);
  const set=!!(w.chal76&&w.chal76.mgr===R.id&&w.chal76.wk===w.week);
  /* the prize at the season's close */
  const pm=me();const L=leagueSort(w.mgrs,w.season);const pos=L.indexOf(pm)+1;const c0=pm.coin;w.lp90=null;qsClose(w,pm);const paid=pm.coin-c0;const c1=pm.coin;qsClose(w,pm);
  return {set,pos,paid,want:(LP90[pos-1]||{c:0}).c,once:pm.coin===c1}});
ok(b3.set,'B ⚔ challenge from the scouting card');ok(b3.paid===b3.want&&b3.once,'B the league prize is paid once at the close '+JSON.stringify(b3));
/* C · walk the sand at the arena gate */
const c=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();m.coin=300;w.tplan=null;w.night.scouted=null;w.night.travel={cost:0,paid:true};
  const g=rosterOf(m).find(x=>!x.inj);w.night.bouts[1].ents[0]=g.id;const ap0=boostFor(g).ap;window.travelOK=()=>true;window.travelBlock=()=>false;
  openCitySquare(w.night.loc,{prematch:true});await W8(2500);const r={};
  document.querySelector('#citySide [data-cside="temple"]').click();await W8(250);r.temple=document.querySelectorAll('#citySideBody [data-god89]').length===3;
  document.querySelector('#citySide [data-cside="people"]').click();await W8(200);cityShopPanel('arena');await W8(250);r.gate=CITY.side==='arena'&&!!document.querySelector('#citySideBody .wsand90 [data-wsand90]');
  const c0=m.coin,t0=thLeft(w),fee=walkFee();document.querySelector('#citySideBody [data-wsand90]').click();await W8(300);
  r.walked=!!w.night.scouted&&m.coin===c0-fee&&thLeft(w)===t0 /* v0.90: coin only, no hours */;r.report=!!document.querySelector('#citySideBody .wsand90')&&!document.querySelector('#citySideBody [data-wsand90]');
  const c1=m.coin;r.again=wsand90Walk()===false&&m.coin===c1;
  const seat=seatFor(g,'#888',false);r.seat=JSON.stringify(seat).length>0;
  return r});
ok(c.temple,'C the City Square temple has the offerings');ok(c.gate,'C the arena offers Walk the sand');ok(c.walked&&c.report,'C walking the sand: n.scouted, coin only '+JSON.stringify(c));ok(c.again,'C once a week');
if(SHOT)await pg.screenshot({path:SHOT+'/tv90k_city.png'});
await pg.evaluate(async()=>{closeCity();await new Promise(r=>setTimeout(r,800))});
/* D · the beast pen starts zoomed */
const d=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();w.week=1;w.night.travel=null;w.night.selfBye=false;w.night.loc=travelHome(m);w.tplan=null;m.coin=300;const r={};
  if(!document.getElementById('mgrBody')){openManager();await W8(800)}
  for(const g of rosterOf(m))g.inj=null;MGR.tab='practice';MGR.yd87='all';MGR_REDRAW();await W8(300);const g=rosterOf(m)[0];document.querySelector(`[data-yb76="pen:${g.id}"]`).click();await W8(200);
  document.querySelector('[data-pen76b="wolf"]').click();await W8(200);document.querySelector('[data-pen76="go"]').click();await W8(4000);for(let i=0;i<8&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}
  await W8(1400);r.pen=!!(S&&S.pen76);r.zoomIn=!!S.zoomIn;r.z=duelCam();r.camZ=CAM.z;return r});
ok(d.pen&&d.zoomIn&&d.z>1.5,'D the pen fight starts zoomed in '+JSON.stringify(d));
if(SHOT)await pg.screenshot({path:SHOT+'/tv90k_pen.png'});
const d2=await pg.evaluate(async()=>{document.getElementById('btnZoom').click();await new Promise(r=>setTimeout(r,1400));return duelCam()});
ok(d2<1.05,'D the player can zoom out '+d2);
/* E · a phone */
if(SHOT){await pg.evaluate(async()=>{S.over=true;try{menuHide()}catch(e){}openManager();await new Promise(r=>setTimeout(r,800));MGR.tab='night';MGR_REDRAW()});await pg.setViewportSize({width:390,height:844});await W(900);
  await pg.screenshot({path:SHOT+'/tv90k_phone_night.png'});await pg.evaluate(()=>{MGR.tab='league';MGR.lg90=null;MGR_REDRAW()});await W(400);await pg.screenshot({path:SHOT+'/tv90k_phone_league.png'});await pg.click('#mgrBody tr.lrowlink:not(.me)');await W(400);
  await pg.evaluate(()=>{const x=document.querySelector('#mgrBody .lg90');if(x)x.scrollIntoView()});await W(200);await pg.screenshot({path:SHOT+'/tv90k_phone_scout.png'});
  const sw=await pg.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth);ok(sw,'E phone: no sideways page scroll')}
console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(miss.length||errs.length?1:0)})();

/* tv101d — v1.01 workstream C (320-v101win): M21 the correspondence windows in the v1.0 rooms look — the TEAM SCREEN (fresco banner,
   roster rows with 🔍 → the rival's card, Correspondence dossier, envoy plates, the trade as a tabula with sandstone Send), a CONTRACTED
   FIGHTER'S CARD (yours: fresco head, sections, Keeping him plates, the contract tabula with Extend / Release; a rival's: poach tabula),
   the ROSTER's Keeping him plates (298) — every old handler still answers on the moved nodes (envoy gift, trade proposal, fav, meal,
   🔍, ← Back); M39 the CITY SQUARE: figures sized by the measured doors (CR100.cityH = 0.85 × median door), the lanista and the training
   yard drawn from the crowd sheets (canvases, placeholders seeded), calm = no walk frames; the kill switch flavius_v101coff=1 gives the
   v1.0 windows and figure size; 390 px one column, no sideways scroll; no page errors, no new 00c errors.
   SHOT=dir writes screenshots there. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const MISS=[];const ok=(c,n)=>{if(!c)MISS.push(n)};const out={};const SHOT=process.env.SHOT||'';
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v101coff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.travelOK=()=>true;window.travelBlock=()=>false;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(const g of rosterOf(pm)){g.inj=null;g.restWk=null;g.severed=[];g.contract.weeks=20;g.morale=70;g.mealWk=null}
    window.V_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('roster');await W8(800);MGR.view=null});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const shot=async(pg,n)=>{if(SHOT)await pg.screenshot({path:SHOT+'/tv101d_'+n+'.png'})};
const rival=pg=>ev(pg,()=>W_().mgrs.find(m=>!m.isPlayer&&rosterOf(m).length).id);

/* ---------------- 1440: the team screen ---------------- */
const pg=await open(1440,900);const rid=await rival(pg);
out.tm=await ev(pg,async rid=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};const w=W_(),pm=me();const m=mgrById(rid);m.relB=60;
  MGR.tab='team';MGR.teamId=rid;MGR_REDRAW();await W8(500);
  r.root=!!q(`#mgrPane .v101tm[data-v101team="${rid}"]`);r.old=!q('#mgrPane .teamlay');r.ban=!!q('.v101ban .v101por .portrait')&&q('.v101ban .v101bn b').textContent.includes(m.ludus);
  r.chips=document.querySelectorAll('.v101ban .v101chip').length>=5;r.grade=!!q('.v101ban .gradebox');r.tc=!!q('.v101ban .tcbtn');
  r.rows=document.querySelectorAll('.v101ros .v101lr').length===rosterOf(m).length;r.fav=!!q('.v101ros .v101lr [data-mg="fav"]');r.cor=!!q('.v101cor .commsbody')&&!!q('.v101cor .opbar');
  r.plates=document.querySelectorAll('.v101env .v101plt[data-mg="envoy"]').length===6;r.led=!!q('.v101led .news');
  /* fav still toggles */
  const g0=rosterOf(m)[0];const f0=!!g0.favd;q(`.v101ros [data-mg="fav"][data-id="${g0.id}"]`).click();await W8(400);r.favd=!!g0.favd!==f0;
  /* the envoy's gift */
  const c0=pm.coin;const gift=q(`[data-mg="envoy"][data-id="${rid}|gift"]`);r.giftOn=!!gift&&!gift.disabled;if(gift)gift.click();await W8(400);r.gift=pm.coin===c0-25&&m.envoyWk===w.week;
  m.envoyWk=null;MGR_REDRAW();await W8(300);
  /* the trade proposal as a tabula */
  q(`[data-mg="envoy"][data-id="${rid}|trade"]`).click();await W8(400);r.tab=!!q('.v101tab #trMine')&&!!q('.v101tab #trTheirs')&&!!q('.v101tab #trCoin');
  const go=q('.v101tab [data-mg="tradego"]');r.goPri=!!go&&go.classList.contains('v101pri');r.cancel=!!q('.v101tab [data-mg="tradex"].v101sec');
  r.sand=document.documentElement.classList.contains('sd100on')?getComputedStyle(go).backgroundImage!=='none':'off';
  return r},rid);
await shot(pg,'team');
await pg.click('.v101tab [data-mg="tradego"]');await pg.waitForTimeout(400);out.tm.tradeMsg=await ev(pg,()=>!!(MGR.trade&&MGR.trade.msg)||!MGR.trade);
for(const k of ['root','old','ban','chips','grade','tc','rows','fav','cor','plates','led','favd','giftOn','gift','tab','goPri','cancel','sand','tradeMsg'])ok(out.tm[k],'team '+k);
/* 🔍 → the rival's card, then ← Back */
out.cd=await ev(pg,async rid=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};const m=mgrById(rid);MGR.trade=null;MGR.tab='team';MGR.teamId=rid;MGR_REDRAW();await W8(400);
  const g=rosterOf(m)[0];q(`.v101ros [data-v101card="${g.id}"]`).click();await W8(600);r.go=MGR.tab==='recruit'&&MGR.filter==='signed'&&MGR.sel===g.id;
  const c=q(`.v101card.v101riv[data-v101fc="${g.id}"]`);r.card=!!c;r.head=!!q('.v101card .v101fh .v101fpor .portrait')&&q('.v101card .v101fh').textContent.includes(g.name);
  r.chips=document.querySelectorAll('.v101card .v101fc .v101chip').length>=4;r.secs=document.querySelectorAll('.v101card .v101fb > section.v101s').length>=3;
  r.poach=!!q('.v101card .v101poach #ofWage')&&!!q('.v101card .v101poach .btn.v101pri');r.noSect=!q('.v101card .v101fb > .sect');
  r.recPlates=document.querySelectorAll('.v101card .v101plt').length>=2;
  MGR.tab='team';MGR_REDRAW();await W8(400);q('.v101ban [data-mg="tab"][data-id="league"]').click();await W8(400);r.back=MGR.tab==='league';return r},rid);
await pg.evaluate(()=>{MGR.tab='recruit';MGR.filter='signed';MGR_REDRAW()});await pg.waitForTimeout(500);await shot(pg,'rival');
for(const k of ['go','card','head','chips','secs','poach','noSect','recPlates','back'])ok(out.cd[k],'rival card '+k);
/* your own fighter's card (Recruiting → Your stable) */
out.mn=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};const w=W_(),pm=me();const g=rosterOf(pm)[0];w.hours=Math.max(w.hours||0,5);
  MGR.tab='recruit';MGR.filter='mine';MGR.sel=g.id;MGR_REDRAW();await W8(500);r.card=!!q(`.v101card.v101mine[data-v101fc="${g.id}"]`);
  r.plates=document.querySelectorAll('.v101card .v101keep .v101plt').length>=6;r.con=!!q('.v101card .v101con .wagebox')&&!!q(`.v101con [data-mg="extend"][data-id="${g.id}"].v101pri`)&&!!q(`.v101con [data-mg="release"][data-id="${g.id}"].v101dan`);
  r.plateParts=!!q('.v101keep .v101plt .v101pi')&&!!q('.v101keep .v101plt .v101pt b');
  const meal=q(`.v101card [data-mg="meal"][data-id="${g.id}"]`);r.mealOn=!!meal&&!meal.disabled;if(meal)meal.click();await W8(500);r.meal=g.mealWk===w.week;
  r.after=!!q(`.v101card[data-v101fc="${g.id}"] [data-mg="meal"][data-dis]`);return r});
await shot(pg,'mine');
for(const k of ['card','plates','con','plateParts','mealOn','meal','after'])ok(out.mn[k],'own card '+k);
/* the roster (298): Keeping him plates, the More fold as sections */
out.ro=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};MGR.tab='roster';MGR_REDRAW();await W8(500);
  r.room=!!q('.rm100.rm100-roster');r.plates=document.querySelectorAll('.rm100keep .v101plt').length>=5;r.more=document.querySelectorAll('.rm100more .rm100rest > section.v101s, .rm100more .v101fb > section.v101s').length>=1;
  r.ext=!!q('.rm100con [data-mg="extend"].v101pri');r.notCard=!q('.rm100 .v101card');
  r.errs=typeof errNew92==='function'?errNew92(window.V_MARK).map(e=>e.kind+':'+e.msg):[];return r});
await shot(pg,'roster');
for(const k of ['room','plates','more','ext','notCard'])ok(out.ro[k],'roster '+k);ok(!out.ro.errs.length,'no new 00c errors '+JSON.stringify(out.ro.errs));

/* ---------------- the city square ---------------- */
out.ct=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);
  openCitySquare(W_().night.loc,{prematch:true});for(let i=0;i<200&&!(CITY.open&&CITY.npcs&&CITY.npcs.length&&!CITY.warm100);i++)await W8(100);await W8(1800);
  r.open=CITY.open;r.door=V101C.door>0;r.h=V101C.h>=V101C.minH&&V101C.h<=V101C.maxH&&Math.abs(V101C.h-V101C.door*ZK89*V101C.k)<1e-6||V101C.h===V101C.minH||V101C.h===V101C.maxH;
  r.cityH=CR100.on?Math.abs(CR100.cityH-V101C.h)<1e-9:'crowd off';r.ph=!!(CITY.imgs.me&&CITY.imgs.me.v101)&&!!(CITY.imgs.yddoc&&CITY.imgs.yddoc.v101);
  const me1=cityImg('me',''),yd=cityImg('ydhero',''),doc=cityImg('yddoc','');r.canv=[me1,yd,doc].every(c=>c instanceof HTMLCanvasElement);r.drawn=V101C.stats.city>0;
  /* door-sized: the figure's painted height in px vs the door */
  r.ratio=+(V101C.h/(V101C.door*ZK89)).toFixed(3);
  /* calm: no walk frames */
  const P=CITY.player;const keep=[P._dr,P._dc,P.r,P.c];P._dr=P.r+0.4;P._dc=P.c;const SC=SETTINGS.calm;SETTINGS.calm=true;const pc=v101Pose(P,performance.now());SETTINGS.calm=SC;const pw=v101Pose(P,performance.now());[P._dr,P._dc]=[keep[0],keep[1]];
  r.calm=pc.row==='stand'&&(typeof reduceMotion==='function'&&reduceMotion()?true:/^walk/.test(pw.row));
  return r});
await shot(pg,'city');
for(const k of ['open','door','h','cityH','canv','drawn','calm'])ok(out.ct[k],'city '+k);ok(out.ct.ratio>=0.8&&out.ct.ratio<=0.9||out.ct.ratio<0.8,'city door ratio '+out.ct.ratio);
await pg.close();

/* ---------------- the kill switch ---------------- */
const pk=await open(1440,900,true);const rk=await rival(pk);
out.off=await ev(pk,async rid=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};MGR.tab='team';MGR.teamId=rid;MGR_REDRAW();await W8(400);r.team=!!q('#mgrPane .teamlay')&&!q('.v101tm');
  MGR.tab='recruit';MGR.filter='mine';MGR.sel=rosterOf(me())[0].id;MGR_REDRAW();await W8(400);r.card=!q('.v101card');MGR.tab='roster';MGR_REDRAW();await W8(400);r.ros=!q('.v101plt');
  if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);openCitySquare(W_().night.loc,{prematch:true});for(let i=0;i<200&&!(CITY.open&&CITY.npcs&&CITY.npcs.length&&!CITY.warm100);i++)await W8(100);await W8(800);
  r.city=CR100.cityH===1&&!(CITY.imgs.me&&CITY.imgs.me.v101);return r},rk);
ok(out.off.team&&out.off.card&&out.off.ros&&out.off.city,'kill switch '+JSON.stringify(out.off));await pk.close();

/* ---------------- 390: one column, no sideways scroll ---------------- */
const ph=await open(390,844);const rp=await rival(ph);out.ph={};
for(const [k,f] of [['team',`MGR.tab='team';MGR.teamId='${rp}'`],['mine',`MGR.tab='recruit';MGR.filter='mine';MGR.sel=rosterOf(me())[0].id`]]){
  await ev(ph,f+';MGR_REDRAW()');await ph.waitForTimeout(600);
  out.ph[k]=await ev(ph,k=>{const sc=[...document.querySelectorAll('#mBody,#mgrBody,#mgrPane,.v101tm,.v101card,.v101cols,.v101fb')];const bad=sc.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.id||e.className);
    const one=k==='team'?getComputedStyle(document.querySelector('.v101cols')).gridTemplateColumns.split(' ').length===1:getComputedStyle(document.querySelector('.v101fb')).gridTemplateColumns.split(' ').length===1;
    return {bad,one,doc:document.documentElement.scrollWidth<=window.innerWidth+1}},k);if(k==='team')await shot(ph,'phone_team');
  ok(!out.ph[k].bad.length&&out.ph[k].one&&out.ph[k].doc,'390 '+k+' '+JSON.stringify(out.ph[k]))}
await ph.close();
console.log(JSON.stringify(out));console.log('MISS',JSON.stringify(MISS));console.log('ERRS',JSON.stringify(errs));
await b.close();process.exit(MISS.length||errs.length?1:0)})();

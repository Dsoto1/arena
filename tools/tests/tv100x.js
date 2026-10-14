/* v1.00 284-v100fix — his v0.99 notes: F1 no server chip over the main menu · F2 Manager +AP only on armored locations · F3 bed patients never train ·
   F4 Focus! card = location popup, no roll, no movement spent · C1 League Points column + ⓘ · C2 compact Trials card · C3 Acta rabble-rousers.
   SHOT=dir saves screenshots of C1-C3 (default off). */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');const SHOT=process.env.SHOT||'';
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const boot=async(vp)=>{const ctx=await b.newContext({viewport:vp});await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
/* ================= ARENA PAGE: F1 F2 F4 ================= */
const pg=await boot({width:1440,height:900});
/* F1 — the chip never shows over the main menu */
out.f1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};SRV91.mode='mock';SRV91.mode='mock';
  const fake=document.createElement('div');fake.id='onl';fake.style.cssText='position:fixed;left:0;top:0;width:100px;height:100px';document.body.appendChild(fake);
  try{menuShow()}catch(e){}await W8(300);r.menuUp=!document.getElementById('mainMenu').hidden;srv91Chip();r.overMenu=!!document.getElementById('srv91');
  try{menuHide()}catch(e){}await W8(200);srv91Chip();r.onOnline=!!document.getElementById('srv91');fake.remove();srv91Chip();r.gone=!document.getElementById('srv91');return r});
ok(out.f1.menuUp&&!out.f1.overMenu,'F1a no chip over the main menu '+JSON.stringify(out.f1));ok(out.f1.onOnline&&out.f1.gone,'F1b chip still shows on an Online screen and leaves with it '+JSON.stringify(out.f1));
/* arena start (as tv98c) */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='fast';
  startEvent({ev:'democritus',loc:6,seats:['venatore','hero','royalty','soldier'].map((c,i)=>({cls:c,cpu:i!==0,boost:i===1?{ap:3}:undefined})),opts:{spect:0}});
  for(let i=0;i<300;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);
    else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break;
    else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}}
  SPEED='pause'});
/* F2 — the start bonus lands only on armored locations */
out.f2=await pg.evaluate(async()=>{const r={};const p=S.players[0];
  p.hp={head:5,chest:6,rarm:5,larm:5,rleg:5,lleg:5};p.ap={head:0,chest:3,rarm:0,larm:2,rleg:0,lleg:0};
  p.cpu=true; /* the auto-placement path (CPUs / sims); humans get the dialog (F2e below) */
  await trainAP100(p,4,'test');r.a={...p.ap};
  p.ap={head:0,chest:0,rarm:0,larm:0,rleg:0,lleg:0};await trainAP100(p,3,'test');r.none={...p.ap};
  p.ap={head:6,chest:0,rarm:0,larm:0,rleg:0,lleg:0};await trainAP100(p,5,'test');r.cap={...p.ap};
  p.cpu=false;
  /* the real start: seat 1 had boost ap 3 — a bare location of his was never given any (his class armor map = the gear he holds) */
  const q=S.players[1];r.q=LOCS.map(l=>[l,q.ap[l],(q.pieces[l]||[]).length]);return r});
ok(out.f2.a.head===0&&out.f2.a.rarm===0&&out.f2.a.rleg===0&&out.f2.a.lleg===0&&out.f2.a.chest+out.f2.a.larm===9,'F2a points only on chest/left arm '+JSON.stringify(out.f2.a));
ok(Object.values(out.f2.none).every(v=>v===0),'F2b no armor = nothing placed '+JSON.stringify(out.f2.none));ok(out.f2.cap.head===7&&out.f2.cap.chest===0,'F2c cap 7, bare chest untouched '+JSON.stringify(out.f2.cap));
ok(out.f2.q.every(([l,ap,n])=>ap===0?true:n>0||ap>0),'F2d seat start sane');
/* F2e — a HUMAN places the start bonus in the distribute dialog: only armored locations take points, the bare ones are disabled with the reason */
out.f2e=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};const p=S.players[0];p.cpu=false;
  p.hp={head:5,chest:6,rarm:5,larm:5,rleg:5,lleg:5};p.ap={head:0,chest:3,rarm:0,larm:2,rleg:0,lleg:0};
  const pr=trainAP100(p,4,'test');for(let i=0;i<60&&!document.querySelector('#mBody .dist [data-d]');i++)await W8(50);
  const btn=(l,d)=>document.querySelector(`#mBody .dist [data-d="${d}"][data-l="${l}"]`);
  r.open=!!btn('chest','+');r.title=(document.getElementById('mTitle')||{}).textContent;
  r.plusOn=LOCS.filter(l=>btn(l,'+')&&!btn(l,'+').disabled);r.bareTip=['head','rarm','rleg','lleg'].map(l=>(btn(l,'+')||{}).title||'');r.note=/armor/i.test((document.getElementById('mBody')||{}).textContent||'');
  /* a click on a bare location does nothing */
  const bare=btn('head','+');if(bare)bare.click();await W8(60);r.headAfter=(document.querySelector('#mBody .dist [data-l="head"][data-d="-"]')||{}).disabled;
  for(const l of ['chest','chest','larm','larm']){const b=btn(l,'+');if(b&&!b.disabled)b.click();await W8(60)}
  r.left=(document.getElementById('distLeft')||{}).textContent;CUR_MODAL.done('ok');await pr;r.ap={...p.ap};
  /* Auto (the dialog's own button) also keeps to armored locations */
  p.ap={head:0,chest:3,rarm:0,larm:2,rleg:0,lleg:0};const pr2=trainAP100(p,6,'test');for(let i=0;i<60&&!CUR_MODAL;i++)await W8(50);CUR_MODAL.done('auto');await pr2;r.auto={...p.ap};
  /* no armor at all: no dialog */
  p.ap={head:0,chest:0,rarm:0,larm:0,rleg:0,lleg:0};await trainAP100(p,3,'test');r.noDialog=!CUR_MODAL;r.none={...p.ap};return r});
ok(out.f2e.open&&out.f2e.plusOn.slice().sort().join()==='chest,larm','F2e only the armored locations can take points '+JSON.stringify(out.f2e));
ok(out.f2e.bareTip.every(t=>/No armor here/.test(t))&&out.f2e.note,'F2e the bare locations say why '+JSON.stringify(out.f2e.bareTip));
ok(out.f2e.headAfter===true&&out.f2e.ap.head===0&&out.f2e.ap.chest===5&&out.f2e.ap.larm===4&&out.f2e.ap.rarm===0,'F2e the player\'s own split lands '+JSON.stringify(out.f2e.ap));
ok(out.f2e.auto.head===0&&out.f2e.auto.rarm===0&&out.f2e.auto.rleg===0&&out.f2e.auto.lleg===0&&out.f2e.auto.chest+out.f2e.auto.larm===11,'F2e Auto keeps to armored locations '+JSON.stringify(out.f2e.auto));
ok(out.f2e.noDialog&&Object.values(out.f2e.none).every(v=>v===0),'F2e no armor = no dialog, nothing placed '+JSON.stringify(out.f2e.none));
/* F4 — a declared Focus! card: popup pick, no roll, movement kept */
out.f4=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};SPEED='pause';const p=S.players[0],q=S.players[1];S.ri=1;
  p.wR=mkW('gladius');p.attacks=0;p.armUses={R:0,L:0};p.hitTargets=new Set();p.mv=5;q.alive=true;for(const l of LOCS){q.hp[l]=5;q.ap[l]=0}
  const fr=p.r>0?p.r-1:p.r+1;for(const x of [...S.players,...S.npcs])if(x!==q&&x!==p&&x.r===fr&&x.c===p.c)x.r=-9;S.pillars=S.pillars.filter(x=>!(x.r===fr&&x.c===p.c));q.r=fr;q.c=p.c;
  const it={kind:'card',key:'focus',uid:'t100'};p.items.push(it);r.used=await useItem(p,it);r.flag=!!p.focusNext;
  const src=attackSources(p)[0];const tg=targetsFor(p,src).find(t=>t.kind==='player'&&t.ref===q);r.haveTarget=!!tg;
  const rh=RNG;RNG={next:()=>0.0001,int:n=>0,state:()=>0};const titles=[];let pr;
  try{pr=doAttack(p,src,tg,{focusRoll:true});
    for(let i=0;i<60&&!CUR_MODAL;i++)await W8(50);
    for(let i=0;i<60;i++){if(!CUR_MODAL)break;const t=(document.getElementById('mTitle')||{}).textContent||'';titles.push(t);
      if(/Focus/.test(t)&&!/roll/i.test(t)){r.buttons=[...document.querySelectorAll('#mBtns button')].length;CUR_MODAL.done('rleg');}else CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(80)}
    await pr}finally{RNG=rh}
  r.titles=titles;r.mv=p.mv;r.flagAfter=!!p.focusNext;r.rleg=q.hp.rleg+'/'+q.ap.rleg;r.hit=q.hp.rleg<5||q.ap.rleg>0;r.otherHP=LOCS.filter(l=>l!=='rleg').every(l=>q.hp[l]===5);return r});
ok(out.f4.used!==false&&out.f4.flag&&out.f4.haveTarget,'F4a card declared '+JSON.stringify(out.f4));
ok(out.f4.titles.length===1&&/Focus/.test(out.f4.titles[0])&&!/roll/i.test(out.f4.titles[0])&&out.f4.buttons>=4,'F4b one popup, the card pick, no location dice '+JSON.stringify(out.f4.titles));
ok(out.f4.mv===5&&!out.f4.flagAfter,'F4c no movement spent, card used up '+out.f4.mv);ok(out.f4.hit&&out.f4.otherHP,'F4d the strike landed where picked '+out.f4.rleg);
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
/* ================= MANAGER PAGE: F3 C1 C2 C3 ================= */
const pm=await boot({width:1440,height:900});
await pm.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();
  for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(300);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=900;w.train='off';w.tplan=null;
  for(const g of rosterOf(m)){g.inj=null;g.fat=0;g.restWk=null;g.ptrain=false;g.contract.weeks=20;g.morale=80;g.ord87=null;delete g.exWk;delete g.pen76Wk}
  MGR.tab='practice';MGR.tr92=null;MGR_REDRAW();for(let i=0;i<40&&!document.querySelector('.y92c');i++)await W8(100);return true});
/* C2 */
await pm.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));MGR.tab='practice';MGR_REDRAW();for(let i=0;i<40&&!document.querySelector('.y92trials');i++)await W8(100);await W8(300)});
out.c2=await pm.evaluate(()=>{const T=document.querySelector('.y92trials');const tiles=[...T.querySelectorAll('.y92t')];const rm=!!T.closest('.rm100');
  /* v1.0 298 (his approved rooms mock): Trials = a full-width strip of three big plates with art — no side column */
  if(rm){const tops=new Set(tiles.map(t=>Math.round(t.getBoundingClientRect().top)));const D=document.querySelector('.rm100dos').getBoundingClientRect();
    return {rm,n:tiles.length,art:tiles.every(t=>{const f=t.querySelector('.y92ta .rm100fr');return !!f&&f.getBoundingClientRect().height>60}),cost:tiles.every(t=>/⏳/.test(t.textContent)&&t.querySelectorAll('.y92tl').length>=3),right:tops.size===1&&T.getBoundingClientRect().width>=D.width*.9,th:[]}}
  const side=document.querySelector('.y99side').getBoundingClientRect();const grid=document.querySelector('.y92grid').getBoundingClientRect();
  return {n:tiles.length,art:tiles.every(t=>getComputedStyle(t.querySelector('.y92ta')).display==='none'),cost:tiles.every(t=>/⏳/.test(t.textContent)&&t.querySelectorAll('.y92tl').length>=3),right:side.left>=grid.left+grid.width*.5,h:Math.round(T.getBoundingClientRect().height),th:tiles.map(t=>Math.round(t.getBoundingClientRect().height))}});
ok(out.c2.n===3&&out.c2.art&&out.c2.cost,'C2a three tidy tiles with cost + effect '+JSON.stringify(out.c2));ok(out.c2.right,'C2b in the right column');ok(out.c2.th.every(h=>h<=135),'C2c tiles compact '+out.c2.th);
if(SHOT){await pm.screenshot({path:path.join(SHOT,'c2_yard.png')});const el=await pm.$('.y92trials');if(el)await el.screenshot({path:path.join(SHOT,'c2_trials.png')})}
/* F3 */
out.f3=await pm.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();const ros=rosterOf(m);
  const [a,c,d]=ros;a.severed=['rleg'];w.beds76=[a.id];r.lock=y92Lock(a);r.lockC=y92Lock(c);
  const P=thPlan(w);P.g[a.id]={spd:2,rehab:0};P.y92=P.y92||{};P.y92[a.id]={L:{str:2},Q:{}};P.pairs.push({k:'spar',a:a.id,b:c.id});P.pairs.push({k:'spar',a:c.id,b:d.id});
  const snap=g=>JSON.stringify([gStats(g),g.sxp]);const st0=snap(a);const stc0=snap(d);
  thResolve(w);r.same=snap(a)===st0;r.plan=!!(P.g[a.id]&&P.g[a.id].spd)||!!(P.y92||{})[a.id];r.pairs=P.pairs.length;
  r.otherSparred=snap(d)!==stc0;
  /* standing order */
  a.ord87={r:'spd',p:2,short:0};const P2=thPlan(w);delete P2.g[a.id];ord87Apply(w,a);r.ord=!(P2.g[a.id]&&P2.g[a.id].spd);
  /* the card shows him locked */
  MGR.tr92=c.id;MGR_REDRAW();await W8(300);const card=document.querySelector(`[data-y92c="${a.id}"]`);r.cardText=card?card.textContent:'';
  /* an old yard button refuses him */
  const btn=document.createElement('button');btn.dataset.yb76='spar:'+a.id;document.getElementById('mgrBody').appendChild(btn);let fired=0;btn.addEventListener('click',()=>fired++);btn.click();r.guard=fired===0;btn.remove();
  /* the weekly regime: an injured-or-limbless bed patient sits out */
  w.train='hard';for(const b2 of w.night.bouts)b2.done=true;w.pend=[];const ovr0=a.ovr;await endWeek();
  r.sat=(w.lastTraining||[]).some(x=>x.n===a.name&&/bed|sat out/.test(x.txt));r.noGain=(w.lastTraining||[]).filter(x=>x.n===a.name&&/\+\d rating/.test(x.txt)).length===0;return r});
ok(out.f3.lock&&/bed/i.test(out.f3.lock[1])&&out.f3.lockC===null,'F3a the bed patient is locked "In bed" '+JSON.stringify([out.f3.lock,out.f3.lockC]));
ok(out.f3.same&&!out.f3.plan,'F3b planned drills / sessions dropped, no gain '+JSON.stringify(out.f3));ok(out.f3.pairs===1&&out.f3.otherSparred,'F3c his sparring pair dropped, the others still spar '+out.f3.pairs);
ok(out.f3.ord,'F3d standing order skips him');ok(/bed/i.test(out.f3.cardText),'F3e his card says In bed');ok(out.f3.guard,'F3f old yard buttons refuse him');ok(out.f3.sat&&out.f3.noGain,'F3g the week\'s regime sat him out '+JSON.stringify([out.f3.sat,out.f3.noGain]));
/* C1 */
await pm.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const w=W_(),m=me();const o=w.mgrs.find(x=>!x.isPlayer);msp(m).pts=7;msp(m).w=2;msp(m).b=3;msp(o).pts=4;msp(o).w=1;msp(o).b=2;MGR.tab='league';MGR_REDRAW();await W8(500)});
out.c1=await pm.evaluate(()=>{const t=document.querySelector('#mgrBody .wd100lgt');const hs=[...t.querySelectorAll('.wd100rh>span')];const th=hs.map(x=>x.textContent.trim());const rows=[...t.querySelectorAll('.wd100r.me .pts')].map(x=>x.textContent.trim());
  const i=hs.find(x=>x.textContent.trim()==='Pts');return {th,rows,tip:i?i.title:'',pts:[...t.querySelectorAll('.wd100r .pts')].map(x=>x.textContent.trim())}});
ok(out.c1.th.includes('Pts')&&out.c1.th.indexOf('Pts')===3,'C1a Points column '+out.c1.th);ok(out.c1.rows[0]==='7'&&out.c1.pts.length>=3,'C1b my points shown '+JSON.stringify(out.c1.pts));
ok(/1st/.test(out.c1.tip)&&/3/.test(out.c1.tip)&&/2nd/.test(out.c1.tip)&&/survived/.test(out.c1.tip), /* v1.02 (333 M5): podium points */'C1c ⓘ explains points '+out.c1.tip);
if(SHOT){await pm.screenshot({path:path.join(SHOT,'c1_league.png')})}
const pp=await boot({width:390,height:844});
await pp.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(300);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='practice';MGR_REDRAW();for(let i=0;i<40&&!document.querySelector('.y92trials');i++)await W8(100);await W8(300)});
out.c2p=await pp.evaluate(()=>{const T=document.querySelector('.y92trials').getBoundingClientRect();const tiles=[...document.querySelectorAll('.y92trials .y92t')].map(t=>t.getBoundingClientRect());
  return {oneCol:new Set(tiles.map(t=>Math.round(t.left))).size===1,fits:T.right<=window.innerWidth+1&&document.documentElement.scrollWidth<=window.innerWidth+2}});
ok(out.c2p.oneCol&&out.c2p.fits,'C2d phone: one column, no horizontal scroll '+JSON.stringify(out.c2p));
/* C3 */
out.c3=await pm.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_();const wk=w.night?w.night.week:w.week;
  w.lastPaper=composeWeekPaper(w,w.night,w.season);const P=w.lastPaper;r.n=(P.rabble||[]).length;r.fallback=(P.rabble||[]).every(x=>!x.real);r.again=JSON.stringify(rab100List(w,wk))===JSON.stringify(P.rabble);
  /* real tallies: a snapshot after a watched bout */
  const old=S;S={spect:[{name:'Tiber the Loud',look:{skin:'#e0ac7e',hair:'#2e2019',robe:'#7a2230'},t100:{st:6,off:1}},{name:'Lucia of the Gate',look:{fem:true},t100:{sur:2}},{name:'Quiet Man',look:{},t100:{}}],crowdBets:{winners:[{name:'Lucia of the Gate',pay:48}]}};
  try{rab100Snap({week:wk})}finally{S=old}
  const real=(w.rab100||{})[wk]||[];r.real=real.map(x=>[x.n,x.st,x.off,x.sur,x.won]);
  w.lastPaper=composeWeekPaper(w,w.night,w.season);r.list=w.lastPaper.rabble.map(x=>x.line.replace(/<[^>]+>/g,''));r.realFlags=w.lastPaper.rabble.map(x=>x.real);
  MGR.tab='paper';MGR_REDRAW();await W8(700);
  let el=document.querySelector('.rab100');if(!el){try{const d=document.createElement('div');d.id='paperTest';d.innerHTML=paperHTML();document.body.appendChild(d);el=d.querySelector('.rab100')}catch(e){r.err=String(e)}}
  r.html=!!el;r.rows=el?el.querySelectorAll('.rab100r,.ak102rb').length:0;r.faces=el?el.querySelectorAll('.rab100f svg,.ak102fc svg').length:0;
  /* v1.02 (342): the Acta's fun row — Rabble-rousers sits right after the Darwinius column */r.after=el?!!el.previousElementSibling&&(/🏅/.test(el.previousElementSibling.textContent)||el.previousElementSibling.classList.contains('ak102dar')):false;return r});
ok(out.c3.n>=3&&out.c3.n<=4&&out.c3.fallback&&out.c3.again,'C3a 3-4 rabble-rousers even with no watched bout, stable per week '+JSON.stringify([out.c3.n,out.c3.fallback,out.c3.again]));
ok(out.c3.real.length===2&&out.c3.real[0][0]==='Tiber the Loud'&&out.c3.real[0][1]===6&&out.c3.real[1][3]===2&&out.c3.real[1][4]===48,'C3b tallies snapshotted per spectator '+JSON.stringify(out.c3.real));
ok(/Tiber the Loud hurled 6 stones/.test(out.c3.list[0])&&out.c3.realFlags[0]===1&&out.c3.realFlags[1]===1,'C3c real deeds first, one line each '+JSON.stringify(out.c3.list));
ok(out.c3.html&&out.c3.rows>=3&&out.c3.faces>=3&&out.c3.after,'C3d section printed under the Darwinius awards with portraits '+JSON.stringify([out.c3.html,out.c3.rows,out.c3.faces,out.c3.after,out.c3.err]));
if(SHOT){await pm.waitForTimeout(1500);const el=await pm.$('.rab100');if(el){await el.scrollIntoViewIfNeeded();await el.screenshot({path:path.join(SHOT,'c3_acta.png')})}else await pm.screenshot({path:path.join(SHOT,'c3_acta.png')})}
const fresh=await pm.evaluate(mk=>typeof ERR92!=='undefined'?ERR92.ring.slice(mk).length:0,0).catch(()=>0);
console.log(JSON.stringify(out));console.log('ERRS',JSON.stringify(errs));console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');
await b.close();process.exit(miss.length||errs.length?1:0)})();

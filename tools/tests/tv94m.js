/* v0.94 THE MANAGER ARMORY (225-v94armory): 1 the '0.94' migration gives every contracted fighter his class loadout as owned pieces
   (pairs once, an old one-week kit → owned offerings on the shelf), idempotent · 2 the Roster's Armory: a plaque click selects, a real
   DRAG moves a weapon from one fighter to another (the replaced one goes to the shelf), tap-to-select + tap-to-place, ✕ takes off ·
   3 fits/replaces refusals (severed arm, damaged piece, a third offering, helm replaces helm, two-handed) · 4 the City Square stalls:
   stock per city and per week (Roma L3, a small city none, Capua's blades), a buy lands in the Armory, sold-out counts · 5 a bout uses
   the EQUIPPED gear (not the class kit) · 6 after a bout: a lost weapon is gone, armor stripped at 0 AP comes back damaged, unused
   offerings come home, the repair at the armorer · 7 a dead fighter's gear goes back to the shelf · 8 rival houses buy gear (endWeek)
   · 9 Match Week "Gear up" + checklist nudges · 10 phone 390: no sideways scroll · 11 no new entries in the 00c error log.
   SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const W=ms=>pg.waitForTimeout(ms);const SHOT=process.env.SHOT||'';
const mark=await pg.evaluate(()=>ERR92.n);
/* ---- 1 · the migration ---- */
const m1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));let sd=94;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;window.travelOK=()=>true;window.travelBlock=()=>false;
  openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=2000;const o={};
  const old=JSON.parse(JSON.stringify(w));old.ver='0.93';for(const g of old.glads){delete g.eq94;delete g.k94}for(const x of old.mgrs)delete x.arm94;delete old.n94;
  const pg0=old.glads.find(g=>g.alive&&g.contract&&g.contract.mgr===m.id);pg0.kit=['mw1','elix2'];pg0.kitWk=old.week;
  migrateWorld(old);const mw=mgrMigrate(old);o.dirty=!!mw._arm94dirty;
  const con=mw.glads.filter(g=>g.alive&&g.contract);o.all=con.every(g=>g.eq94&&g.k94);
  const kitOk=g=>{const K=arm94Kit(g.cls);const E=g.eq94;return (E.R&&E.R.k)===(K.R||null)&&((E.L&&E.L.k)||null)===(K.L||null)&&E.a.map(P=>P.k).sort().join()===K.a.map(x=>x.k).sort().join()};
  o.kits=con.every(g=>kitOk(g)||!(g.eq94.R||g.eq94.a.length));o.pairOnce=con.filter(g=>CLASSES[g.cls].armor.filter(x=>x[0]==='wraps').length===2).every(g=>g.eq94.a.filter(P=>P.k==='wraps').length===1);
  const me0=mw.mgrs.find(x=>x.id===m.id);o.kitConv=me0.arm94.sh.filter(P=>P.t==='o').map(P=>P.k).sort().join()==='elix2,mw1'&&!pg0.kit;
  const n0=JSON.stringify(mw.glads.map(g=>g.eq94||null));delete mw._arm94dirty;migrateWorld(mw);const mw2=mgrMigrate(mw);o.idem=!mw2._arm94dirty&&JSON.stringify(mw2.glads.map(g=>g.eq94||null))===n0;
  o.save=SAVE_MIGRATIONS.some(x=>x[0]==='0.94');return o});
ok(m1.all&&m1.kits,'1 every contracted fighter owns his class loadout '+JSON.stringify(m1));ok(m1.pairOnce,'1 a pair is one piece');ok(m1.kitConv,'1 an old kit becomes owned offerings');
ok(m1.dirty&&m1.idem&&m1.save,'1 migration marked dirty once, idempotent, in SAVE_MIGRATIONS '+JSON.stringify(m1));
/* ---- 2 · the Roster's Armory: plaque, drag between fighters, tap-to-place ---- */
const r2=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const ros=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));
  for(const g of ros){g.severed=[];delete g.inj}const A=ros.find(g=>g.eq94.R),B=ros.find(g=>g!==A&&g.eq94.R);window.__A=A.id;window.__B=B.id;
  MGR.tab='roster';MGR_REDRAW();await W8(600);const o={card:!!document.querySelector('#mgrPane #ar94'),wall:!!document.querySelector('#mgrPane .dcard[data-gid84]')};
  const pl=document.querySelector(`#mgrPane .dcard[data-gid84="${A.id}"] .dpn84`);pl.click();await W8(200);o.sel=MGR.ar94===A.id&&!!document.querySelector(`#ar94 .ar94stage[data-ar94who="${A.id}"]`);
  o.Ar=A.eq94.R.k;o.Br=B.eq94.R.k;o.Bl=B.eq94.L?B.eq94.L.k:null;return o});
ok(r2.card&&r2.wall,'2 the Armory card sits under the barracks wall');ok(r2.sel,'2 a plaque click selects the fighter');
/* a real drag: A's right-hand weapon onto B's chip */
const src=await pg.evaluate(()=>{const e=document.querySelector('#ar94 .ar94hand[data-ar94z="R"] [data-ar94p]');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});
const dst=await pg.evaluate(()=>{const e=document.querySelector(`#ar94 [data-ar94g="${window.__B}"]`);const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});
await pg.mouse.move(src.x,src.y);await pg.mouse.down();await pg.mouse.move(src.x+20,src.y+10,{steps:3});await pg.mouse.move(dst.x,dst.y,{steps:8});await W(80);await pg.mouse.up();await W(400);
const r2b=await pg.evaluate(async({Ar})=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const A=gById(window.__A),B=gById(window.__B),m=me();const H=arm94H(m);const o={};
  o.moved=!A.eq94.R&&[B.eq94.R,B.eq94.L].some(P=>P&&P.k===Ar);o.both=!!(B.eq94.R&&B.eq94.L);o.shelfW=H.sh.filter(P=>P.t==='w').map(P=>P.k);
  /* tap-to-place: tap a worn armor piece of the fighter on show, then tap the shelf */
  MGR.ar94=A.id;arm94Redraw();await W8(100);const wr=document.querySelector('#ar94 .ar94wr[data-ar94p]');const pid=wr.dataset.ar94p;wr.click();await W8(100);o.hint=!!document.querySelector('#ar94 .ar94hint');
  document.querySelector('#ar94 .ar94shelf .ar94tabs').click();await W8(150);o.toShelf=H.sh.some(P=>P.id===pid)&&!A.eq94.a.some(P=>P.id===pid);
  AR94.tab='a';arm94Redraw();await W8(100);const t=document.querySelector(`#ar94 .ar94shelf [data-ar94p="${pid}"]`);t.click();await W8(100);document.querySelector('#ar94 .ar94av').click();await W8(150);
  o.back=A.eq94.a.some(P=>P.id===pid);
  /* ✕ takes off; ＋ puts on */
  const x=document.querySelector('#ar94 .ar94wr .ar94x');const pid2=x.dataset.ar94off;x.click();await W8(150);o.off=H.sh.some(P=>P.id===pid2);
  const q=document.querySelector(`#ar94 [data-ar94wear="${pid2}"]`);if(q)q.click();await W8(150);o.on=A.eq94.a.some(P=>P.id===pid2);return o},{Ar:r2.Ar});
ok(r2b.moved,'2 a real drag hands the weapon to the other fighter '+JSON.stringify(r2b));ok(r2b.shelfW.length>=1||r2b.both,'2 the replaced weapon went to the shelf (or the free hand took it) '+JSON.stringify(r2b));
ok(r2b.hint&&r2b.toShelf&&r2b.back,'2 tap a piece, tap the shelf / the body '+JSON.stringify(r2b));ok(r2b.off&&r2b.on,'2 ✕ takes off, ＋ puts on');
if(SHOT){await pg.evaluate(()=>{document.querySelector('#ar94').scrollIntoView()});await pg.screenshot({path:SHOT+'/tv94m_armory.png'})}
/* ---- 3 · fits / replaces ---- */
const r3=await pg.evaluate(()=>{const w=W_(),m=me();const A=gById(window.__A);const o={};const NP=(t,k)=>({id:'x',t,k});
  A.eq94.a=[{id:'h1',t:'a',k:'galea'},{id:'c1',t:'a',k:'pectorale'}];
  A.severed=['larm'];o.manicaL=!!arm94Fit(A,NP('a','manica'),'larm').no;o.manicaAuto=arm94Fit(A,NP('a','manica'),'auto').loc==='rarm';o.handL=!!arm94Fit(A,NP('w','gladius'),'L').no;A.severed=[];
  const D={...NP('a','galea'),dmg:1};o.dmg=/repair/i.test(arm94Fit(A,D,'body').no||'');
  A.eq94.o=[{id:'o1',t:'o',k:'elix2'},{id:'o2',t:'o',k:'ap2'}];o.third=!!arm94Fit(A,NP('o','elix4'),'off').no;A.eq94.o=[];
  const helm=A.eq94.a.find(P=>ARM[P.k].slot==='head');const F=arm94Fit(A,NP('a','cassis'),'body');o.helm=!!helm&&F.rep.includes(helm);
  const F2=arm94Fit(A,NP('a','balteus1'),'body');o.layer=!F2.no&&!F2.rep.some(P=>!ARM[P.k].stack);
  const F3=arm94Fit(A,NP('w','labrys'),'L');o.both=F3.z==='R';o.wpnBody=!arm94Fit(A,NP('w','gladius'),'body').no;o.armHand=!!arm94Fit(A,NP('a','galea'),'R').no;return o});
ok(r3.manicaL&&r3.manicaAuto&&r3.handL,'3 a severed arm refuses, auto picks the other side '+JSON.stringify(r3));ok(r3.dmg,'3 a damaged piece must be repaired first');
ok(r3.third,'3 two offerings at most');ok(r3.helm&&r3.layer,'3 a helm replaces the helm; padding stacks under a regular piece');ok(r3.both&&r3.wpnBody&&r3.armHand,'3 hands and body take the right things');
/* ---- 4 · the City Square stalls ---- */
const r4=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();m.coin=2000;const o={};const li=n=>LOCATIONS.findIndex(L=>L&&L.n===n);
  const sig=(li2,wk)=>{const k=w.week;w.week=wk;const s=arm94Stock(w,li2).map(x=>x.t+x.k).join();w.week=k;return s};
  o.perCity=sig(li('Roma'),w.week)!==sig(li('Capua'),w.week);o.perWeek=sig(li('Roma'),w.week)!==sig(li('Roma'),w.week+1);o.same=sig(li('Roma'),w.week)===sig(li('Roma'),w.week);
  const lv=x=>((x.t==='w'?W[x.k]:x.t==='a'?ARM[x.k]:null)||{}).lv||0;
  o.romaL3=arm94Stock(w,li('Roma')).some(x=>lv(x)===3);o.veronaL3=[0,1,2,3,4,5].some(d=>{const k=w.week;w.week=k+d;const r=arm94Stock(w,li('Verona')).some(x=>lv(x)===3);w.week=k;return r});
  o.capua=arm94Stock(w,li('Capua')).filter(x=>x.t==='w'&&SPEC94.blades.w.includes(x.k)).length>=2&&arm94Stock(w,li('Capua')).some(x=>x.sp&&x.pr<arm94Price(x.t,x.k));
  const t=travelState(w);if(t)t.paid=true;w.night.travel={cost:0,paid:true};MGR.tab='night';MGR_REDRAW();await W8(400);
  o.mw=!!document.querySelector('#mgrPane [data-arm94sq]')&&/Gear up in/.test(document.querySelector('#mgrPane .ar94mw').textContent);
  document.querySelector('#mgrPane .ar94mw [data-arm94sq]').click();await W8(2500);o.open=CITY.open&&CITY.side==='stalls'&&!!document.querySelector('#citySideBody .ar94shop');
  const H=arm94H(m);const n0=H.sh.length;const c0=m.coin;const btn=document.querySelector('#citySideBody [data-arm94buy]:not([disabled])');const i=+btn.dataset.arm94buy;const it=arm94Stock(w,CITY.li)[i];const left0=arm94Left(w,CITY.li,i);
  btn.click();await W8(200);o.buy=H.sh.length===n0+1&&H.sh[H.sh.length-1].k===it.k&&c0-m.coin===cityPr(it.pr)&&arm94Left(w,CITY.li,i)===left0-1;
  o.visit=/to the Armory/.test(document.getElementById('cbar89Visit').textContent);
  const sp=H.sh[0];const c1=m.coin;const n1=H.sh.length;const sb=document.querySelector(`#citySideBody [data-arm94sell="${sp.id}"]`);if(sb)sb.click();await W8(200);o.sell=!!sb&&H.sh.length===n1-1&&m.coin>c1;return o});
ok(r4.perCity&&r4.perWeek&&r4.same,'4 stock differs per city and per week, stable within one '+JSON.stringify(r4));ok(r4.romaL3&&!r4.veronaL3,'4 Roma carries Level 3, a small city never');
ok(r4.capua,'4 Capua: blades, at a discount');ok(r4.mw,'4 Match Week: Gear up in <city>');ok(r4.open,'4 Gear up opens the square on the Stalls');ok(r4.sell,'4 the stall buys back a shelf piece');ok(r4.buy&&r4.visit,'4 a buy lands in the Armory, stock counts down, THIS VISIT '+JSON.stringify(r4));
if(SHOT)await pg.screenshot({path:SHOT+'/tv94m_stalls.png'});
/* ---- 5 · a bout uses the equipped gear; 6 · after the bout ---- */
const r5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));try{if(typeof closeCity==='function')closeCity()}catch(e){}await W8(500);const w=W_(),m=me();const o={};const A=gById(window.__A);
  const E=A.eq94;E.R={id:'t_fl',t:'w',k:'flail'};E.L=null;E.a=E.a.filter(P=>ARM[P.k].slot!=='chest');E.a.push({id:'t_th',t:'a',k:'thorax'});E.o=[{id:'t_o1',t:'o',k:'elix2'},{id:'t_o2',t:'o',k:'ap2'}];
  const bo=w.night.bouts.find(b=>!b.done);for(const b of w.night.bouts)b.ents=b.ents.filter(id=>id!==A.id);const out=bo.ents.find(id=>{const g=gById(id);return !g.contract||g.contract.mgr!==m.id});bo.ents[bo.ents.indexOf(out)]=A.id;
  const cfg=boutCfg(bo,false);const st=cfg.seats.find(s=>s.mgrGid===A.id);o.seat=st.gear94.R==='flail'&&st.gear94.a.some(x=>x[0]==='thorax')&&(st.festItems||[]).includes('elix2');
  let seen=null;const GL=giveLoadout;giveLoadout=function(p){const r=GL.apply(this,arguments);if(p.mgrGid===A.id)seen={R:p.wR&&p.wR.key,chest:p.pieces.chest.map(x=>x.key),cls:CLASSES[p.cls].R};return r};
  const res=await simEvent(cfg);giveLoadout=GL;o.engine=!!seen&&seen.R==='flail'&&seen.chest.includes('thorax');o.snap=!!(res.g94&&res.g94[A.id]&&res.g94[A.id].got.R==='flail');o.dbg=JSON.stringify(seen);
  /* the settlement, on a fixed result: the flail broke, the thorax was stripped at 0 AP, one elixir drunk, a gladius picked up */
  const X={got:{R:'flail',L:null,a:[['thorax','chest']]},carry:true,cls:A.cls,R:null,L:'gladius',pc:{head:[],chest:[],rarm:[],larm:[],rleg:[],lleg:[]},items:['ap2']};
  const b2={ents:[A.id]};arm94Settle(w,b2,{g94:{[A.id]:X}});const th=E.a.find(P=>P.id==='t_th');
  o.lost=!E.R||E.R.id!=='t_fl';o.loot=[E.R,E.L].some(P=>P&&P.k==='gladius');o.dmg=!!(th&&th.dmg);o.offer=E.o.map(P=>P.k).join()==='ap2';
  o.seatDmg=!seatFor(A).gear94.a.some(x=>x[0]==='thorax');
  /* the repair at the armorer */
  w.night.travel={cost:0,paid:true};openCitySquare(w.night.loc,{});await W8(2000);const c0=m.coin;const fx=document.querySelector(`#citySideBody [data-arm94fix="t_th"]`);if(fx)fx.click();await W8(200);
  o.fixed=!!fx&&!th.dmg&&m.coin===c0-cityPr(arm94Fix(th));try{if(typeof closeCity==='function')closeCity()}catch(e){}await W8(500);
  /* a real simulated bout through runBoutSim + applyBout settles without error */
  const st0=JSON.stringify(arm94St(w));await runBoutSim(w.night.bouts.indexOf(bo));o.settled=JSON.stringify(arm94St(w))!==st0||bo.done;return o});
ok(r5.seat,'5 the seat carries the equipped gear + offerings '+JSON.stringify(r5));ok(r5.engine,'5 the engine gave the equipped flail + thorax, not the class kit '+r5.dbg);ok(r5.snap,'5 the bout result carries the gear snapshot');
ok(r5.lost&&r5.loot,'6 the broken flail is gone, the picked-up gladius came home');ok(r5.dmg&&r5.seatDmg,'6 armor stripped at 0 AP comes back damaged and stays home');ok(r5.offer,'6 the unused offering came home, the used one is gone');
ok(r5.fixed,'6 the armorer mends it for a third of the price');ok(r5.settled,'6 a simulated bout settles');
/* ---- 7 · a dead fighter's gear goes back to the shelf ---- */
const r7=await pg.evaluate(()=>{const w=W_(),m=me();const B0=gById(window.__B);const B=B0&&B0.alive&&B0.eq94&&(B0.eq94.R||B0.eq94.a.length)?B0:rosterOf(m).find(g=>g.eq94&&(g.eq94.R||g.eq94.a.length)); /* the bout in 5 may have killed B */const ids=[B.eq94.R,B.eq94.L,...B.eq94.a].filter(Boolean).map(P=>P.id);
  B.alive=false;const X={got:{R:null,L:null,a:[]},carry:false,cls:B.cls,R:null,L:null,pc:{},items:[]};arm94Settle(w,{ents:[B.id]},{g94:{[B.id]:X}});
  const sh=arm94H(m).sh.map(P=>P.id);const o={back:ids.length>0&&ids.every(id=>sh.includes(id)),gone:!B.eq94};B.alive=true;arm94EnsureG(w,B);o.noFree=!!B.eq94&&!B.eq94.R&&!B.eq94.a.length;return o});
ok(r7.back&&r7.gone,'7 the dead man\'s gear is back on the shelf '+JSON.stringify(r7));ok(r7.noFree,'7 a second signing makes no gear from nothing');
/* ---- 8 · rival houses buy gear ---- */
const r8=await pg.evaluate(async()=>{const w=W_();const o={};const R=w.mgrs.find(x=>!x.isPlayer&&!x.dead&&rosterOf(x).some(g=>g.eq94&&g.eq94.R));const g=rosterOf(R).find(g=>g.eq94&&g.eq94.R);
  const k=g.eq94.R.k;g.eq94.R=null;arm94H(R).sh=arm94H(R).sh.filter(P=>P.t!=='w');R.coin=500;const c0=R.coin;const sp=arm94AutoShop(w,R);o.sp=sp;o.filled=!!g.eq94.R&&g.eq94.R.k===k;o.paid=sp>0&&R.coin<c0;
  g.eq94.R=null;R.coin=500;for(const b of w.night.bouts){b.done=true;b.res=b.res||{att:0,winners:[],rows:[],turns:1,lines:[],reason:''}}w.pend=[];await endWeek();o.week=!!g.eq94&&!!g.eq94.R;
  const poor=w.mgrs.find(x=>!x.isPlayer&&!x.dead&&x!==R);poor.coin=ARM94.rivFloor;const pg0=rosterOf(poor).find(g=>g.eq94);if(pg0)pg0.eq94.R=null;o.reserve=arm94AutoShop(w,poor)===0&&poor.coin===ARM94.rivFloor;return o});
ok(r8.filled&&r8.paid,'8 a rival rebuys his fighter\'s lost weapon '+JSON.stringify(r8));ok(r8.week,'8 rivals shop at the week\'s end');ok(r8.reserve,'8 a poor house keeps its reserve');
/* ---- 9 · checklist nudges ---- */
const r9=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const A0=gById(window.__A);const A=A0&&A0.alive&&A0.eq94?A0:rosterOf(m).find(g=>g.eq94&&g.eq94.a.length); /* the bout in 5 may have killed A */delete A.inj;A.eq94.R=null;A.eq94.L=null;A.eq94.a[0].dmg=1;
  const I=weekChecklist();const o={empty:I.some(x=>!x.done&&/bare hands|empty (right|left) hand/.test(x.txt)&&x.txt.includes(esc(A.name))),rep:I.some(x=>!x.done&&/need(s)? repair/.test(x.txt))};
  MGR.tab='roster';MGR_REDRAW();await W8(500);o.warn=/empty/.test((document.querySelector('#ar94 .ar94g[data-ar94g="'+A.id+'"]')||{}).textContent||'')||/⚠/.test((document.querySelector('#ar94 .ar94g[data-ar94g="'+A.id+'"]')||{}).textContent||'');return o});
ok(r9.empty&&r9.rep,'9 checklist: empty hands + repairs '+JSON.stringify(r9));ok(r9.warn,'9 the chip warns');
/* ---- 10 · phone 390 ---- */
await pg.setViewportSize({width:390,height:844});await W(700);
const r10=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR.tab='roster';MGR_REDRAW();await W8(600);const a=document.querySelector('#ar94');a.scrollIntoView();const R=a.getBoundingClientRect();
  const wide=[...a.querySelectorAll('*')].filter(e=>{if(e.closest('.ar94gs')||e.ownerSVGElement)return false;const r=e.getBoundingClientRect();return r.width>0&&r.right>R.right+2}).length;
  return {sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,right:Math.round(R.right),wide}});
ok(r10.sw<=r10.cw&&r10.right<=390&&r10.wide===0,'10 phone: the Armory fits 390 px '+JSON.stringify(r10));
if(SHOT)await pg.screenshot({path:SHOT+'/tv94m_phone.png'});
const r10b=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();w.night.travel={cost:0,paid:true};openCitySquare(w.night.loc,{});await W8(2000);CITY.side='stalls';citySideDraw();await W8(300);
  const s=document.querySelector('#citySideBody .ar94shop');const R=s?s.getBoundingClientRect():{right:999};return {shop:!!s,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,ovw:document.getElementById('cityOv').scrollWidth,right:Math.round(R.right)}});
ok(r10b.shop&&r10b.sw<=r10b.cw&&r10b.ovw<=390&&r10b.right<=390,'10 phone: the stalls fit '+JSON.stringify(r10b));
if(SHOT)await pg.screenshot({path:SHOT+'/tv94m_phone_stalls.png'});
/* ---- 11 · the error log ---- */
const el=await pg.evaluate(m=>errNew92(m).map(e=>e.kind+': '+e.msg).slice(0,6),mark);ok(!el.length,'11 no new errors in the log '+JSON.stringify(el));
console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(miss.length||errs.length?1:0)})();

/* v1.0 (310-v100daily): DAILY + WEEKLY CHALLENGES offline — the same date gives the same challenge + seed + opening board in two fresh pages
   (one of them with crowd regulars and the 'rolls' roster, which a challenge must ignore); another date gives another; each twist is applied
   (pauper, bare, wild, nomarket, noheal, cf20, mandata, mods); only the FIRST daily attempt counts (later = practice); weekly 3 attempts, the best
   counts, a 4th is refused; streak; medal tiers; the results window card + 📅 Challenges (no Replay) + BUS challenge.done; the Play Now submenu
   button + the Play Now page strip; normal Play Now unaffected; the kill switch flavius_daily100off=1; 390 px without sideways scroll; no new 00c errors.
   SHOT=dir writes screenshots (1440 + 390). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const open=async(w,h,ls)=>{const pg=await b.newPage({viewport:{width:w,height:h}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto('file://'+process.argv[2],{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}window.__e0=ERR92.n;window.__dc=[];BUS.on('challenge.done',d=>window.__dc.push(d))});return pg};
const until=async(pg,fn,ms=15000,arg)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}};
const closeAll=pg=>pg.evaluate(async()=>{for(let i=0;i<8&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:1);await new Promise(r=>setTimeout(r,300))}});
const newErr=async pg=>pg.evaluate(()=>errNew92(window.__e0).map(e=>e.msg||e.m||JSON.stringify(e).slice(0,160)));
const T0=Date.UTC(2026,9,12,15,0,0);const DAY=86400000;
/* the opening board of a challenge (right after newState, then after the loadouts) */
const SIG=()=>JSON.stringify({seed:S.seed,ev:S.evKey,loc:S.locIdx,deck:S.deck,pots:S.pillars.map(p=>p.pots),chest:S.chest.weapons,npcs:S.npcs.map(n=>[n.t,n.r,n.c,n.aggro]),
  pl:S.players.map(p=>[p.cls,p.cpu,p.diff,p.st,p.r,p.c,p.pers&&JSON.stringify(p.pers)]),omen:S.omen&&S.omen.n,sp:(S.spect||[]).map(x=>[x.name,x.temper,x.sec]),spon:S.sponsorId});
const LOAD=()=>JSON.stringify(S.players.map(p=>[p.wR&&p.wR.key,p.wL&&p.wL.key,p.ap,p.coin,p.cf]));
const startSig=async(pg)=>{const a=await pg.evaluate(s=>{DC100.t=s.t;const sp=dc100Spec('d');dc100Begin(sp);return {sp:JSON.stringify(sp),sig:(new Function('return ('+s.SIG+')()'))()}},{t:T0,SIG:SIG.toString()});
  await until(pg,()=>S&&S.players.every(p=>p.wR||p.wL)&&S.phase!=='setup',20000);const l=await pg.evaluate(s=>(new Function('return ('+s+')()'))(),LOAD.toString());return {...a,load:l}};

/* ---- 1 · two fresh pages, the same date: same challenge, seed and opening (page B has regulars + the 'rolls' roster) ---- */
const pA=await open(1440,900);const pB=await open(1440,900,{flavius_roster_play:'rolls'});
await pB.evaluate(()=>{for(let i=0;i<30;i++)CROWD_CACHE.push({id:'rx'+i,name:'Regular '+i,taste:'cf',temper:'fickle',city:null,mem:[],visits:3});try{CFG.roster='rolls'}catch(e){}});
const A1=await startSig(pA),B1=await startSig(pB);
ok(A1.sp===B1.sp,'same date → the same challenge spec');
ok(A1.sig===B1.sig,'same date → the same opening board (seed, deck, pots, beasts, ratings, crowd) '+(A1.sig===B1.sig?'':A1.sig.slice(0,300)+' ‖ '+B1.sig.slice(0,300)));
ok(A1.load===B1.load,'same date → the same loadouts '+A1.load+' ‖ '+B1.load);
const sp1=JSON.parse(A1.sp);ok(await pA.evaluate(s=>S.seed===s.seed&&S.sponsorId==='flavius'&&!!S.daily100&&S.daily100.att===1&&S.daily100.key==='2026-10-12',sp1),'the event runs on the challenge seed, Flavius presides, attempt 1');
/* another date → another challenge; a week of days is varied */
const V=await pA.evaluate(t=>{const a=[];for(let i=0;i<10;i++){DC100.t=t+i*86400000;const s=dc100Spec('d');a.push({k:s.key,ev:s.ev,loc:s.loc,seed:s.seed,c:s.seats[0].cls,tw:s.tw.join()})}DC100.t=t;
  const w1=dc100Spec('w'),w2=(DC100.t=t+7*86400000,dc100Spec('w'));DC100.t=t;return {a,w:[w1.key,w2.key,w1.seed,w2.seed],wk:dc100Week(Date.UTC(2026,0,1)),wk2:dc100Week(Date.UTC(2024,11,30))}},T0);
ok(V.a[0].seed!==V.a[1].seed&&V.a[0].k!==V.a[1].k&&new Set(V.a.map(x=>x.seed)).size===10,'another date → another seed');
ok(new Set(V.a.map(x=>x.ev+x.loc+x.c+x.tw)).size>=8&&new Set(V.a.map(x=>x.tw)).size>=3,'the days differ in event / city / class / twist '+JSON.stringify(V.a));
ok(V.w[0]!==V.w[1]&&V.w[2]!==V.w[3]&&V.wk==='2026-W01'&&V.wk2==='2025-W01','ISO weeks (also across the year end) '+JSON.stringify(V));
await pB.close();

/* ---- 2 · the results window: first attempt counts, the card, 📅 Challenges, no Replay, BUS ---- */
await closeAll(pA);await pA.evaluate(()=>{gameOver([S.players[0]],'test')});
ok(await until(pA,()=>document.querySelector('#mBody .dc100res'),15000),'the results window carries the challenge card');
const R1=await pA.evaluate(()=>{const r=S.dc100res;const bt=[...document.querySelectorAll('#mBtns button')].map(x=>x.textContent);return {r,bt,dc:window.__dc.slice(),ls:JSON.parse(localStorage.getItem('flavius_daily100'))}});
ok(R1.r&&R1.r.counted&&R1.r.att===1&&R1.r.won&&R1.r.s>=100,'first attempt counts '+JSON.stringify(R1.r));
ok(R1.bt.some(t=>/Challenges/.test(t))&&!R1.bt.some(t=>/Replay/.test(t)),'📅 Challenges in the results buttons, no Replay '+JSON.stringify(R1.bt));
ok(R1.dc.length===1&&R1.dc[0].kind==='d'&&R1.dc[0].day==='2026-10-12'&&R1.dc[0].score===R1.r.s&&R1.dc[0].counted===true,'BUS challenge.done '+JSON.stringify(R1.dc));
ok(R1.ls&&R1.ls.d['2026-10-12']&&R1.ls.d['2026-10-12'].a[1].s===R1.r.s,'filed in localStorage flavius_daily100');
if(SHOT)await pA.screenshot({path:SHOT+'/results_1440.png'});
/* the second attempt the same day = practice; the first stays */
await closeAll(pA);
await pA.evaluate(()=>{DC100.t=Date.UTC(2026,9,12,15);dc100Begin(dc100Spec('d'))});await until(pA,()=>S&&S.daily100&&S.daily100.att===2&&S.phase!=='setup',20000);
await closeAll(pA);await pA.evaluate(()=>{for(const p of S.players)if(p.id===0)p.alive=false;gameOver([S.players[1]],'test')});
await until(pA,()=>document.querySelector('#mBody .dc100res'),15000);
const R2=await pA.evaluate(()=>({r:S.dc100res,ls:JSON.parse(localStorage.getItem('flavius_daily100')).d['2026-10-12'],txt:document.querySelector('#mBody .dc100res').textContent}));
ok(R2.r&&!R2.r.counted&&R2.r.att===2&&!R2.r.won&&R2.ls.n===2&&R2.ls.a[1].s===R1.r.s&&R2.r.best.s===R1.r.s&&/Practice/.test(R2.txt),'the second attempt is practice, the first still counts '+JSON.stringify(R2));
await closeAll(pA);

/* ---- 3 · the twists ---- */
const tw=async(list,fn,kind)=>{await closeAll(pA);await pA.evaluate(o=>{let sp;for(let i=1;i<60;i++){sp=dc100Spec('d','2099-01-'+String(i).padStart(2,'0'));if(['democritus','egidious','cassian'].includes(sp.ev))break}sp.tw=o.list;dc100Begin(sp)},{list,kind});
  await until(pA,()=>S&&S.daily100&&S.players.every(p=>p.wR||p.wL||p.cpu===false)&&S.phase!=='setup',20000);await pA.waitForTimeout(400);await closeAll(pA);return pA.evaluate(fn)};
const tA=await tw(['pauper','bare','wild'],()=>({coin:S.players[0].coin,ap:Object.values(S.players[0].ap).reduce((a,v)=>a+v,0),pc:Object.values(S.players[0].pieces).reduce((a,v)=>a+v.length,0),
  other:Object.values(S.players[1].ap).reduce((a,v)=>a+v,0),aggro:S.npcs.filter(n=>n.t!=='zora').every(n=>n.aggro===0),n:S.npcs.length}));
ok(tA.coin===0&&tA.ap===0&&tA.pc===0&&tA.other>0,'pauper + bare: you start with 0 coin and no armor, the CPUs keep theirs '+JSON.stringify(tA));
ok(tA.n>0&&tA.aggro,'wild: every beast hunts you '+JSON.stringify(tA));
const tB=await tw(['nomarket','noheal','mandata','mods'],async()=>{const me=S.players[0];me.cf=20;me.coin=40;const t0=performance.now();const m0=!!CUR_MODAL;await openMarket(me);const mOpen=!m0&&!!CUR_MODAL;
  const c0=S.players[1].coin;await cpuMarket(S.players[1]);const it={id:999,kind:'offer',key:'elix4'};me.items.push(it);const used=await useItem(me,it);const card={id:998,kind:'card',key:'elixir2'};me.items.push(card);const used2=await useItem(me,card);
  return {mOpen,cpu:S.players[1].coin===c0,used,used2,kept:me.items.includes(it),mf:me.items.some(x=>x.kind==='mf'),mods:!!S.opts.mods,ms:Math.round(performance.now()-t0)}});
ok(!tB.mOpen&&tB.cpu,'nomarket: the market does not open, CPUs do not buy '+JSON.stringify(tB));
ok(tB.used===false&&tB.used2===false&&tB.kept,'noheal: elixirs (offering + card) refused '+JSON.stringify(tB));
ok(tB.mf&&tB.mods,'mandata + mods: Mandata handed out, class modifiers on '+JSON.stringify(tB));
const tC=await pA.evaluate(()=>{const sp={human:0,ev:'democritus',tw:['cf20']};const res=f=>({rotations:10,rows:[{id:0,human:true,won:true,alive:true,f,coin:5,kp:1,kn:2}]});
  const a=dc100Score(res(15),sp),b2=dc100Score(res(22),sp),c=dc100Score(res(15),{...sp,tw:[]});return {a,b:b2,c}});
ok(tC.a.cfFail&&!tC.a.won&&tC.b.won&&!tC.b.cfFail&&tC.c.won&&tC.a.s===tC.c.s-100-20,'cf20: a win under 20 CF does not count '+JSON.stringify({a:tC.a.s,b:tC.b.s,c:tC.c.s}));
ok(tC.c.s===100+45+60+5+15+10+20,'the score formula '+JSON.stringify(tC.c.parts));
/* normal play sees none of it */
await closeAll(pA);
const N=await pA.evaluate(async()=>{startEvent({ev:'democritus',loc:1,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:4},seed:777});
  for(let i=0;i<60&&!(S.players.every(p=>p.wR||p.wL));i++)await new Promise(r=>setTimeout(r,100));
  return {d:S.daily100,coin:S.players[0].coin,ap:Object.values(S.players[0].ap).reduce((a,v)=>a+v,0),agg:S.npcs.some(n=>n.aggro===0),has:dc100Has('nomarket')}});
ok(N.d==null&&!N.has&&N.coin>0&&N.ap>0,'a normal event has no challenge, no twist '+JSON.stringify(N));
await closeAll(pA);

/* ---- 4 · weekly 3 attempts, best counts; medals; streak ---- */
const W=await pA.evaluate(()=>{localStorage.removeItem('flavius_daily100');const sp=dc100Spec('w','2099-W05');const r=[];for(let i=0;i<4;i++){r.push(dc100Begin(sp));}
  const o=dc100Load();const R=o.w['2099-W05'];R.a={1:{s:50},2:{s:180,m:'silver'},3:{s:90},4:{s:400}};
  const best=dc100Counted('w',R).s;
  const med=[dc100Medal(99),dc100Medal(100),dc100Medal(249),dc100Medal(250),dc100Medal(399),dc100Medal(400)];
  return {r,n:R.n,left:dc100Left('w',R),best,med}});
ok(W.r.join()==='true,true,true,false'&&W.n===3&&W.left===0,'weekly: 3 attempts, a 4th is refused '+JSON.stringify(W));
ok(W.best===180,'weekly: the best of the 3 counts (a stray 4th never) '+W.best);
ok(W.med.join()===',bronze,bronze,silver,silver,gold','medal tiers bronze 100 · silver 250 · gold 400 '+W.med.join());
await closeAll(pA);
const ST=await pA.evaluate(t=>{const D=86400000;const o={v:1,d:{},w:{}};const put=(i,s)=>{o.d[dc100Day(t-i*D)]={n:1,a:{1:{s,m:dc100Medal(s)}}}};
  for(let i=1;i<=7;i++)put(i,120);put(9,260);localStorage.setItem('flavius_daily100',JSON.stringify(o));DC100.t=t;const s1=dc100Streak();
  put(0,420);localStorage.setItem('flavius_daily100',JSON.stringify(o));const s2=dc100Streak();
  delete o.d[dc100Day(t-3*D)];localStorage.setItem('flavius_daily100',JSON.stringify(o));const s3=dc100Streak();put(3,160);localStorage.setItem('flavius_daily100',JSON.stringify(o));return {s1,s2,s3}},T0);
ok(ST.s1===7&&ST.s2===8&&ST.s3===3,'streak: today may still be open, a gap breaks it '+JSON.stringify(ST));
/* the window: two cards, the 14-day calendar with the medals, full-week badge */
await pA.evaluate(()=>{dc100Open()});ok(await until(pA,()=>document.querySelectorAll('#mBody .dc100c').length===2&&document.querySelectorAll('#mBody .dc100d').length===14),'the window: today + this week + 14 days');
const WIN=await pA.evaluate(()=>({gold:document.querySelectorAll('#mBody .dc100d.gold').length,med:document.querySelectorAll('#mBody .dc100d.bronze,#mBody .dc100d.silver,#mBody .dc100d.gold').length,
  full:/A full week/.test(document.querySelector('#mBody .dc100cal').textContent),go:!!document.querySelector('#mBody [data-dc100go="d"]')&&!!document.querySelector('#mBody [data-dc100go="w"]'),
  st:document.querySelector('#mBody .dc100c[data-dc100k="d"] .dc100st').textContent}));
ok(WIN.gold===1&&WIN.med>=6&&WIN.full&&WIN.go&&/420/.test(WIN.st),'calendar medals + full-week badge + today counted '+JSON.stringify(WIN));
if(SHOT)await pA.screenshot({path:SHOT+'/window_1440.png'});
/* Enter the arena from the window starts the challenge (today's counted already → practice) */
await pA.evaluate(()=>{localStorage.removeItem('flavius_daily100')});await closeAll(pA);await pA.evaluate(()=>{dc100Open()});await until(pA,()=>document.querySelector('#mBody [data-dc100go="d"]'));
await pA.click('#mBody [data-dc100go="d"]');ok(await until(pA,()=>S&&S.daily100&&S.daily100.att===1&&S.daily100.kind==='d',20000),'⚔ Enter the arena starts today\'s challenge');
await closeAll(pA);
/* the Play Now submenu + the Play Now page strip */
await pA.evaluate(()=>{playNowMenu()});ok(await until(pA,()=>[...document.querySelectorAll('#mBtns button')].some(x=>/Challenges/.test(x.textContent))),'📅 Challenges in the Play Now submenu');
if(SHOT)await pA.screenshot({path:SHOT+'/submenu_1440.png'});
await pA.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(x=>/Challenges/.test(x.textContent));b.click()});
ok(await until(pA,()=>document.querySelectorAll('#mBody .dc100c').length===2),'the submenu button opens the window');await closeAll(pA);
await pA.evaluate(()=>{openSetup(true)});ok(await until(pA,()=>document.querySelector('#mBody .dc100pn')&&document.querySelector('#mBody .pn100ev')),'the strip on the Play Now page');
const order=await pA.evaluate(()=>{const a=document.querySelector('#mBody .dc100pn'),e=document.querySelector('#mBody .pn100ev');return !!(a.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING)});ok(order,'the strip sits above the event panel');
if(SHOT)await pA.screenshot({path:SHOT+'/playnow_1440.png'});
await pA.click('#mBody [data-dc100pn]');ok(await until(pA,()=>document.querySelectorAll('#mBody .dc100c').length===2),'the strip opens the window');
await closeAll(pA);
const eA=await newErr(pA);ok(!eA.length,'no new 00c errors '+JSON.stringify(eA));await pA.close();

/* ---- 5 · phone 390 ---- */
const pP=await open(390,844);await pP.evaluate(()=>{localStorage.setItem('flavius_daily100',JSON.stringify({v:1,d:{[dc100Day()]:{n:1,a:{1:{s:170,m:'silver'}}}},w:{}}));dc100Open()});
ok(await until(pP,()=>document.querySelectorAll('#mBody .dc100c').length===2),'phone: the window');await pP.waitForTimeout(400);
const P=await pP.evaluate(()=>{const c=[...document.querySelectorAll('#mBody .dc100c')].map(x=>x.getBoundingClientRect());const d=[...document.querySelectorAll('#mBody .dc100d')].map(x=>x.getBoundingClientRect());
  return {sw:document.documentElement.scrollWidth,bw:document.getElementById('mBody').scrollWidth-document.getElementById('mBody').clientWidth,stack:c[1].top>=c[0].bottom-1,right:Math.max(...c.map(r=>r.right),...d.map(r=>r.right))}});
ok(P.sw<=390&&P.bw<=1&&P.stack&&P.right<=390,'phone 390: no sideways scroll, cards stacked '+JSON.stringify(P));
if(SHOT)await pP.screenshot({path:SHOT+'/window_390.png',fullPage:false});
if(SHOT){await pP.evaluate(()=>{document.querySelector('#mBody .dc100cal').scrollIntoView()});await pP.screenshot({path:SHOT+'/calendar_390.png'})}
await closeAll(pP);await pP.close();

/* ---- 6 · the kill switch ---- */
const pK=await open(1440,900,{flavius_daily100off:'1'});
const K=await pK.evaluate(async()=>{playNowMenu();await new Promise(r=>setTimeout(r,700));const sub=[...document.querySelectorAll('#mBtns button')].some(x=>/Challenges/.test(x.textContent));
  for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300))}openSetup(true);await new Promise(r=>setTimeout(r,1200));const strip=!!document.querySelector('#mBody .dc100pn');
  for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300))}const w=await dc100Open();return {sub,strip,w,beg:dc100Begin(dc100Spec('d'))}});
ok(!K.sub&&!K.strip&&K.w==null&&K.beg===false,'kill switch: no button, no strip, no window '+JSON.stringify(K));
await pK.close();

await b.close();
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});

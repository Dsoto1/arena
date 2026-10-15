/* v1.03 (344-v103gen) — G1 square ✕/🏛 buttons · G2 Market disabled in a round that forbids CF (Classic's Duel) · G3 a challenge's start never lets the
   main menu back (daily + weekly, CPU-throttled so mmLaunch's 3 s watchdog lands in the gap) · G4 leaving a challenge asks what it costs (ask76, 🏛 menu path
   + abandonAsk) · N1a spectators switch section once a match (CPU crowd: never twice, kill switch = old behaviour; human upkeep window; #btnSec96;
   online st82Apply) + the crowd starts spread (sw103Spread) · E7 "1 switch left" / "Switched" on the button, the Stands tab, the upkeep option. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const boot=async(thr)=>{const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  if(thr){const c=await ctx.newCDPSession(pg);await c.send('Emulation.setCPUThrottlingRate',{rate:thr})}
  await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
const start=(pg,ev,spect)=>pg.evaluate(async([ev,spect])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='fast';const seats=['soldier','hero','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0}));
  startEvent({ev,loc:6,seats,opts:{spect}});
  for(let i=0;i<300;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);
    else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break;
    else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}}
  SPEED='pause';render();await W8(200);return !!S&&cur()===S.players[0]&&S.phase==='action'},[ev,spect]);
let pg=await boot();
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);

/* ---------- G1 · square close / home buttons ---------- */
out.g1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}
  const rad=sel=>{const e=document.querySelector(sel);if(!e)return null;const c=getComputedStyle(e);return {r:c.borderTopLeftRadius,w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)}};
  modal('Test','<p>x</p>',[{label:'OK',value:1}]);await W8(300);r.plain=rad('#mClose');if(CUR_MODAL)CUR_MODAL.done(1);await W8(300);
  openSettings();await W8(900);r.set=rad('#mClose');r.setx=rad('.s98-x');if(CUR_MODAL)CUR_MODAL.done(null);await W8(400);
  openSetup(true);await W8(1200);const mc=document.getElementById('mClose');r.home=rad('#mClose');r.homeIs=mc&&mc.classList.contains('menu101');while(CUR_MODAL){CUR_MODAL.done(null);await W8(200)}
  return r});
const sq=x=>x&&x.r&&parseFloat(x.r)>=4&&parseFloat(x.r)<=14&&!/%/.test(x.r)&&x.w>=30;
ok(out.g1.plain&&parseFloat(out.g1.plain.r)>=4&&parseFloat(out.g1.plain.r)<=14,'G1a the plain window ✕ is a rounded square '+JSON.stringify(out.g1.plain));
ok(sq(out.g1.set),'G1b Settings ✕ is a rounded square '+JSON.stringify(out.g1.set));
ok(!out.g1.setx||sq(out.g1.setx),'G1c .s98-x too '+JSON.stringify(out.g1.setx));
ok(sq(out.g1.home),'G1d the 🏛 home button on the Play Now page is a rounded square '+JSON.stringify(out.g1.home));

/* ---------- G2 · Market in a round with no CF ---------- */
ok(await start(pg,'democritus',0),'0a reached our Action in Classic');
out.g2=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const mk=()=>document.querySelector('#actions [data-act="market"]'),cw=()=>document.querySelector('#actions [data-act="crowd"]');
  o.cfRounds=EV().rounds.map(r=>!!r.cf);o.noEvt=noCF96();
  S.ri=0;render();await W8(150);o.r1={dis:mk()&&mk().disabled,tip:mk()&&mk().dataset.tip||'',has:!!mk()};
  S.ri=2;render();await W8(150);const m=mk();o.r3={dis:m&&m.disabled,tip:m&&m.dataset.tip||'',c:m&&(m.querySelector('.c96')||{}).textContent||'',aria:m&&m.getAttribute('aria-label')||'',cdis:cw()&&cw().disabled,ctip:cw()&&cw().dataset.tip||''};
  S.ri=0;render();await W8(150);o.back={dis:mk()&&mk().disabled,tip:mk()&&mk().dataset.tip||''};return o});
ok(out.g2.cfRounds.join()==='true,true,false'&&!out.g2.noEvt,'G2a Classic: CF in rounds 1-2, none in round 3, not a no-CF event '+JSON.stringify(out.g2));
ok(out.g2.r1.has&&!out.g2.r1.dis&&!/can't be spent in this round/.test(out.g2.r1.tip),'G2b round 1: Market usable '+JSON.stringify(out.g2.r1));
ok(out.g2.r3.dis&&/can't be spent in this round/.test(out.g2.r3.tip)&&/No CF this round/.test(out.g2.r3.c+out.g2.r3.aria),'G2c round 3: Market disabled with the reason '+JSON.stringify(out.g2.r3));
ok(out.g2.r3.cdis&&/can't be spent in this round/.test(out.g2.r3.ctip),'G2d round 3: Crowd Favor disabled, same reason '+JSON.stringify(out.g2.r3));
ok(!out.g2.back.dis&&!/can't be spent in this round/.test(out.g2.back.tip),'G2e back in round 1 the Market is usable again '+JSON.stringify(out.g2.back));
await pg.context().close();

/* ---------- N1a + E7 · one switch a match ---------- */
pg=await boot();ok(await start(pg,'democritus','auto'),'0b started with a crowd');
out.n1=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};SPEED='fast';o.n=(S.spect||[]).length;if(!o.n)return o;
  /* the spread: 40 neutral spectators all in one section → ≤ ceil(n/8) in each */
  const keep=S.spect;const fake=[];for(let i=0;i<40;i++)fake.push({id:'f'+i,name:'F'+i,sec:0,fav:null,human:false,gone:false});S.spect=fake;sw103Spread();
  const cnt=SECTIONS.map((x,i)=>fake.filter(s=>s.sec===i).length);o.spread=cnt.join();o.spreadMax=Math.max(...cnt);o.spreadMin=Math.min(...cnt);
  const fake2=fake.map(s=>({...s}));S.spect=fake2;sw103Spread();o.spreadSame=fake.every((s,i)=>s.sec===fake2[i].sec); /* deterministic (idempotent on the result) */
  S.spect=keep;
  /* CPU crowd: nobody changes section twice */
  const cpu=S.spect.filter(s=>!s.human&&!s.gone);const corners=[[1,1],[1,11],[11,11],[11,1]];
  const run=async(shift)=>{S.players.forEach((p,i)=>{const c=corners[(i+shift)%4];p.r=c[0];p.c=c[1];p.alive=true});
    for(const s of cpu){s.temper='fickle';s.cf=40;s.mood=0;const want=S.players[(cpu.indexOf(s)+shift)%4];s.fav=want.id;s.grudge=null}
    for(let k=0;k<14;k++){S.rotation=(S.rotation||0)+1;for(const s of cpu)s.cf=40;await spectatorsAct();if(S.over)return}};
  const hist=new Map(cpu.map(s=>[s,[s.sec]]));const snap=()=>{for(const s of cpu){const h=hist.get(s);if(h[h.length-1]!==s.sec)h.push(s.sec)}};
  for(const s of cpu){delete s.sw103}
  for(let ph=0;ph<4;ph++){await run(ph);snap()}
  o.moved=[...hist.values()].filter(h=>h.length>1).length;o.twice=[...hist.values()].filter(h=>h.length>2).length;o.flagged=cpu.filter(s=>s.sw103).length;
  o.flagOK=cpu.every(s=>!s.sw103||hist.get(s).length>=2);o.moversFlagged=cpu.filter(s=>hist.get(s).length>1).every(s=>s.sw103===1);
  /* control: the kill switch gives the old behaviour (a spectator can move again) */
  V103A.off=true;for(const s of cpu)delete s.sw103;const h2=new Map(cpu.map(s=>[s,[s.sec]]));
  for(let ph=0;ph<6;ph++){await run(ph);for(const s of cpu){const h=h2.get(s);if(h[h.length-1]!==s.sec)h.push(s.sec)}}
  V103A.off=false;o.ctrlTwice=[...h2.values()].filter(h=>h.length>2).length;
  return o});
ok(out.n1.n>0,'N1 a crowd to test with');
if(out.n1.n>0){ok(out.n1.spreadMax<=5&&out.n1.spreadMin>=5,'N1a the crowd starts spread: 40 neutrals → 5 a section '+out.n1.spread);ok(out.n1.spreadSame,'N1a-2 spreading is deterministic');
  ok(out.n1.moved>=1,'N1b some CPU spectators moved once '+JSON.stringify(out.n1));ok(out.n1.twice===0,'N1c nobody changed section twice '+JSON.stringify(out.n1));
  ok(out.n1.moversFlagged&&out.n1.flagOK,'N1d the flag is on exactly the movers '+JSON.stringify(out.n1));
  ok(out.n1.ctrlTwice>=1,'N1e control: with the kill switch spectators move again (the test can fail) '+out.n1.ctrlTwice)}
/* the human spectator: #btnSec96, the Stands tab, the upkeep option */
out.h=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  S.rotation=1;const base=S.spect.find(s=>!s.human)||S.spect[0];
  const me={...base,id:'me103',human:true,cf:10,fav:null,gone:false,name:'Tester',sw103:0};delete me.sw103;S.spect.push(me);
  render();await W8(250);const bt=()=>document.getElementById('btnSec96');
  o.b0={on:!!bt()&&!bt().hidden,dis:bt()&&bt().disabled,note:bt()&&bt().dataset.sw103,after:bt()&&getComputedStyle(bt(),'::after').content};
  o.tab0=/data-sw103s="left"/.test(standsDrawerHTML())&&/1 switch left/.test(standsDrawerHTML());
  /* the upkeep window shows the option with the words */
  const qp=quadOf(S.players[0]);const sec=SECTIONS.findIndex(x=>x.q===qp);me.sec=sec;let seen=null;
  const pr=humanSpectatorTurn(me);for(let i=0;i<10&&!CUR_MODAL;i++)await W8(100);
  if(CUR_MODAL){const bs=[...document.querySelectorAll('#mBtns button')].find(x=>/Change section/.test(x.textContent));seen=bs?{t:bs.textContent,dis:bs.disabled}:null;CUR_MODAL.done('pass')}await pr;o.win0=seen;
  /* the button: pick a stand */
  const sec0=me.sec;bt().click();for(let i=0;i<20&&!CUR_MODAL;i++)await W8(100);if(CUR_MODAL)CUR_MODAL.done('sec:'+((sec0+1)%SECTIONS.length));await W8(400);
  o.moved=me.sec!==sec0&&me.cf===7&&me.sw103===1;S.rotation=9;me.cf=20;render();await W8(250);
  o.b1={dis:bt()&&bt().disabled,note:bt()&&bt().dataset.sw103,title:bt()&&bt().title};
  o.tab1=/data-sw103s="used"/.test(standsDrawerHTML())&&/Switched/.test(standsDrawerHTML());
  seen=null;me.sec=sec;const pr2=humanSpectatorTurn(me);for(let i=0;i<10&&!CUR_MODAL;i++)await W8(100);
  if(CUR_MODAL){const bs=[...document.querySelectorAll('#mBtns button')].find(x=>/Change section/.test(x.textContent));seen=bs?{t:bs.textContent,dis:bs.disabled}:null;CUR_MODAL.done('pass')}await pr2;o.win1=seen;
  /* click on the disabled button does nothing */
  const cf=me.cf,s1=me.sec;bt().click();await W8(300);o.noMove=me.cf===cf&&me.sec===s1&&!CUR_MODAL;
  /* online ticket holder: the second move of a stands.result is refused on this client (same on every client) */
  const t={...base,id:'tk103',human:true,onlIdx:9,cf:10,fav:null,gone:false,name:'Ticket'};delete t.sw103;S.spect.push(t);const sT=t.sec;
  await st82Apply({picks:[{seat:9,pick:{a:'move',sec:(sT+2)%8}}]});o.on1={sec:t.sec!==sT,cf:t.cf,flag:t.sw103};
  const s2=t.sec;t.cf=10;await st82Apply({picks:[{seat:9,pick:{a:'move',sec:(s2+1)%8}}]});o.on2={same:t.sec===s2,cf:t.cf};
  o.note={left:sw103Note({}),used:sw103Note({sw103:1})};
  S.spect.splice(S.spect.indexOf(me),1);S.spect.splice(S.spect.indexOf(t),1);return o});
ok(out.h.b0.on&&!out.h.b0.dis&&out.h.b0.note==='1 switch left'&&/1 switch left/.test(out.h.b0.after||''),'E7a the button says "1 switch left" '+JSON.stringify(out.h.b0));
ok(out.h.tab0,'E7b the Stands tab says "1 switch left"');
ok(!out.h.win0||(/1 switch left/.test(out.h.win0.t)&&!out.h.win0.dis),'E7c the upkeep option says "1 switch left" '+JSON.stringify(out.h.win0));
ok(out.h.moved,'N1f the button moved the human once for 3 CF and set the flag');
ok(out.h.b1.dis&&out.h.b1.note==='Switched'&&/once a match/.test(out.h.b1.title),'E7d afterwards the button says "Switched" and is disabled, even rotations later '+JSON.stringify(out.h.b1));
ok(out.h.tab1,'E7e the Stands tab says "Switched"');
ok(!out.h.win1||(/Switched/.test(out.h.win1.t)&&out.h.win1.dis),'N1g the upkeep option is disabled "Switched" '+JSON.stringify(out.h.win1));
ok(out.h.noMove,'N1h clicking the used button does nothing');
ok(out.h.on1.sec&&out.h.on1.cf===7&&out.h.on1.flag===1,'N1i online ticket holder: the first move works '+JSON.stringify(out.h.on1));
ok(out.h.on2.same&&out.h.on2.cf===10,'N1j online ticket holder: the second move is refused (no CF spent) '+JSON.stringify(out.h.on2));
ok(out.h.note.left==='1 switch left'&&out.h.note.used==='Switched','E7f notes '+JSON.stringify(out.h.note));
await pg.context().close();

/* ---------- G3 · a challenge's start (daily + weekly), CPU-throttled so the 3 s watchdog lands in the gap ---------- */
for(const kind of ['d','w']){
  const p3=await boot(5);
  await p3.waitForTimeout(800);
  await p3.evaluate(()=>{window.__menu=[];const ms=menuShow;menuShow=function(){__menu.push(performance.now());return ms.apply(this,arguments)};
    const pm=[...document.querySelectorAll('#mainMenu button')].find(x=>/Play Now/i.test(x.textContent));pm&&pm.click()});
  await p3.waitForFunction(()=>CUR_MODAL&&/Play now/i.test(document.getElementById('mTitle').textContent),null,{timeout:30000,polling:100});
  await p3.evaluate(()=>{const m=[...document.querySelectorAll('#mBtns button')].find(x=>/Challenges/i.test(x.textContent));m&&m.click()});
  await p3.waitForFunction(()=>document.querySelector('[data-dc100go]'),null,{timeout:30000,polling:100});
  /* wait so that mmLaunch's 3 s watchdog is due right after the window closes */
  await p3.waitForTimeout(2200);
  await p3.evaluate(k=>{window.__menu.length=0;document.querySelector('[data-dc100go="'+k+'"]').click()},kind);
  let sawMenu=false,briefing=false;
  for(let i=0;i<160&&!briefing;i++){await p3.waitForTimeout(100);const s=await p3.evaluate(()=>({m:!document.getElementById('mainMenu').hidden,b:!!CUR_MODAL&&/briefing/i.test(document.getElementById('mTitle').textContent)}));if(s.m)sawMenu=true;if(s.b)briefing=true}
  ok(briefing,'G3a '+kind+': the briefing opens');ok(!sawMenu,'G3b '+kind+': the main menu is never behind the briefing');
  await p3.evaluate(()=>{const e=[...document.querySelectorAll('#mBtns button')].find(x=>/Enter the arena/i.test(x.textContent));if(e)e.click()});
  let live=false;for(let i=0;i<100&&!live;i++){await p3.waitForTimeout(150);live=await p3.evaluate(()=>!!S&&S.daily100&&S.phase!=='setup'&&!CUR_MODAL)}
  const fin=await p3.evaluate(()=>({m:!document.getElementById('mainMenu').hidden,ph:S&&S.phase,d:S&&S.daily100&&S.daily100.kind,ms:window.__menu.length}));
  ok(live&&fin.d===kind,'G3c '+kind+': Enter the arena loads the match '+JSON.stringify(fin));ok(!fin.m&&fin.ms===0,'G3d '+kind+': the menu stays away after Enter, menuShow never called '+JSON.stringify(fin));
  out['g3'+kind]=fin;
  await p3.context().close()}

/* ---------- G4 · leaving a challenge says what it costs ---------- */
pg=await boot();
out.g4=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  const settle=async()=>{for(let i=0;i<300;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&S.daily100)break}};
  const popup=async(click)=>{const pr=abandonAsk('menu');let t='';for(let i=0;i<30;i++){await W8(100);const bg=document.querySelector('.ask76bg');if(bg){t=bg.textContent;o.modalToo=!!CUR_MODAL;const b=bg.querySelector('[data-ask76="'+(click?1:0)+'"]');b.click();break}}
    const r=await pr;return {t,r}};
  const T0=Date.UTC(2026,9,12,15);DC100.t=T0;try{menuHide()}catch(e){}
  /* daily, the counted attempt */
  dc100Begin(dc100Spec('d'));await settle();o.d1=await popup(false);o.d1alive=!S.over;o.d1b=await popup(true);
  S.over=true;
  /* daily, practice */
  dc100Begin(dc100Spec('d'));await settle();o.d2=await popup(true);S.over=true;
  /* weekly, attempt 1 then 2 */
  dc100Begin(dc100Spec('w'));await settle();o.w1=await popup(true);S.over=true;
  dc100Begin(dc100Spec('w'));await settle();o.w2=await popup(true);o.kind=S.daily100.kind;S.over=true;return o});
const txt=x=>(x&&x.t||'').replace(/\s+/g,' ');
ok(/Leave the challenge/.test(txt(out.g4.d1))&&/only one that scores/.test(txt(out.g4.d1))&&/no score and no medal/.test(txt(out.g4.d1)),'G4a daily: the scored attempt is spent '+txt(out.g4.d1));
ok(out.g4.d1.r==='keep'&&out.g4.d1alive,'G4b Keep playing keeps the match');ok(out.g4.d1b.r==='abandon','G4c Abandon leaves '+JSON.stringify(out.g4.d1b.r));
ok(out.g4.modalToo===false,'G4d one centred popup — no second "Leave the arena?" window');
ok(/practice/i.test(txt(out.g4.d2))&&/nothing is lost/.test(txt(out.g4.d2)),'G4e daily practice: nothing lost '+txt(out.g4.d2));
ok(/2 of 3 attempts left/.test(txt(out.g4.w1))&&/already counted/.test(txt(out.g4.w1)),'G4f weekly attempt 1: 2 of 3 left '+txt(out.g4.w1));
ok(/1 of 3 attempts left/.test(txt(out.g4.w2))&&out.g4.kind==='w','G4g weekly attempt 2: 1 of 3 left '+txt(out.g4.w2));
/* the real 🏛 button asks the same way and Keep playing stays */
await start(pg,'democritus',0).catch(()=>0);
out.g4b=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}
  DC100.t=Date.UTC(2026,9,13,15);dc100Begin(dc100Spec('d'));for(let i=0;i<300;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&S.daily100)break}
  document.getElementById('btnMenu').click();for(let i=0;i<30&&!document.querySelector('.ask76bg');i++)await W8(100);
  const bg=document.querySelector('.ask76bg');o.up=!!bg&&/counted/.test(bg.textContent);o.modal=!!CUR_MODAL;if(bg)bg.querySelector('[data-ask76="0"]').click();await W8(400);
  o.stay=!S.over&&document.getElementById('mainMenu').hidden;S.over=true;return o});
ok(out.g4b.up&&!out.g4b.modal,'G4h the 🏛 menu button opens the popup (not the old window) '+JSON.stringify(out.g4b));ok(out.g4b.stay,'G4i Keep playing: the match goes on, the menu stays closed');
/* a normal event still asks the old way */
out.g4c=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}return typeof abandonAsk==='function'});
ok(out.g4c,'G4j abandonAsk exists');
await pg.context().close();

const fresh=await (async()=>{return []})();
console.log(JSON.stringify(out).slice(0,3500));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

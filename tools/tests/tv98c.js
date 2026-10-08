/* v0.98 part C (248-v98bar): ACTION BAR v2 + THE FOCUS DIGITAL RULE.
   1 layout: one plate, Move · Attack · Forum · End turn; Choice = one centred gold "Choose one" group (keys 1/2); Forum = Market + Crowd on top,
   Loot + Trade · Truce below, coin + CF in its header; one big button per weapon with its ◎ Focus dock (+ ↗ Throw for a throwable weapon);
   the buttons are 07-ui's own acts (same data-act set as the 233 bar); a Focus dock on the 2nd weapon toggles the one focus act and aims it there;
   2 Focus: refused below 3 movement (button + engine), spends all movement at 3+, a focus flag cleared when an action drops movement below 3,
   CPUs never Focus below 3; rule B (FOCUS98.bless, on): focused ranged/thrown shots reach Blessings pots, +1 on a hit, pot falls toward the shooter,
   throws spent, melee unchanged, only Veteran/Master CPUs; 3 kill switch flavius_bar98off=1 → 233's bar; 4 390 px swipe row. SHOT=<dir>. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');const SHOT=process.env.SHOT||'';
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const boot=async(vp,mob,ls)=>{const ctx=await b.newContext(mob?{viewport:vp,screen:vp,isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:vp});
  await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls||{})localStorage.setItem(k,ls[k])},ls||{});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
const start=(pg,stop)=>pg.evaluate(async(stop)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='fast';
  startEvent({ev:'democritus',loc:6,seats:['venatore','hero','royalty','soldier'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<300;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);
    else if(S&&cur()===S.players[0]&&S.phase===stop&&!S.busy)break;
    else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}}
  SPEED='pause';render();await W8(200);return !!S&&cur()===S.players[0]&&S.phase===stop},stop);
const pg=await boot({width:1440,height:900});
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
/* ---- Choice ---- */
ok(await start(pg,'choice'),'0a reached our Choice');
out.ch=await pg.evaluate(()=>{const A=document.getElementById('actions');const g=A.querySelector('.grid98.ch98 [data-g96="ch"]');if(!g)return {none:1};
  const gb=g.getBoundingClientRect(),tb=A.querySelector('.grid98').getBoundingClientRect();const bs=[...g.querySelectorAll('.cb98')];
  return {bar98:A.classList.contains('bar98'),acts:bs.map(x=>x.dataset.act).join(),keys:bs.map(x=>(x.querySelector('.kb96')||{}).textContent).join(),hd:g.querySelector('.hd96').textContent,
    font:parseFloat(getComputedStyle(bs[0]).fontSize),centre:Math.abs((gb.left+gb.right)/2-(tb.left+tb.right-112)/2),end:!!A.querySelector('.ch98 .end96 .end96b')}});
ok(out.ch.bar98&&out.ch.acts==='coin,card'&&out.ch.keys==='1,2','1a Choice group holds Take coin + Draw with keys 1/2 '+JSON.stringify(out.ch));
ok(/Choose one/.test(out.ch.hd)&&out.ch.font>=16&&out.ch.centre<40&&out.ch.end,'1b gold "Choose one" centred, larger text, End turn kept');
if(SHOT)await (await pg.$('#actions')).screenshot({path:path.join(SHOT,'tv98c_choice.png')});
await pg.evaluate(()=>{document.activeElement&&document.activeElement.blur&&document.activeElement.blur()});await pg.keyboard.press('1');
await pg.waitForFunction(()=>S.phase==='action'&&!S.busy&&!CUR_MODAL,null,{timeout:15000}).catch(()=>{});
out.key1=await pg.evaluate(()=>S.phase);ok(out.key1==='action','1c key 1 takes the coin');
/* ---- Action: a Hasta (throwable) in the right hand, a Gladius in the left, a gladiator next to us, a PvP round ---- */
const L=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SPEED='pause';const p=cur();S.ri=1;
  p.wR=mkW('hasta');p.wL=mkW('gladius');p.attacks=0;p.armUses={R:0,L:0};p.hitTargets=new Set();p.mv=5;p.focusRoll=false;S.mode='move';
  const q=S.players[1];const fr=p.r>0?p.r-1:p.r+1;for(const x of [...S.players,...S.npcs])if(x!==q&&x.r===fr&&x.c===p.c)x.r=-9;S.pillars=S.pillars.filter(x=>!(x.r===fr&&x.c===p.c));q.r=fr;q.c=p.c;q.alive=true;
  render();await W8(60);const A=document.getElementById('actions');const q_=s=>A.querySelector(s);
  /* the same acts as the 233 bar (07-ui's own buttons) */
  BAR98.on=false;render();const old=[...A.querySelectorAll('[data-act]')].map(x=>x.dataset.act);BAR98.on=true;render();await W8(30);
  const now=[...A.querySelectorAll('[data-act]')].map(x=>x.dataset.act);
  const gr=[...A.querySelectorAll('.grid98 > [data-g96]')].map(e=>e.dataset.g96);
  const rows=[...A.querySelectorAll('[data-g96="atk"] .wpn98')].map(r=>({main:(r.querySelector('.wb98')||{}).dataset.act,foc:!!r.querySelector('.dock98 [data-act="focus"]'),
    thr:(r.querySelector('.dock98 .th98')||{dataset:{}}).dataset.act||'',st:(r.querySelector('.st98')||{}).textContent||'',key:(r.querySelector('.wb98 .kb96')||{}).textContent||'',h:Math.round(r.getBoundingClientRect().height)}));
  const fm=q_('[data-g96="fm"]');const top=[...fm.querySelectorAll('.k96 > button')].map(x=>x.dataset.act||(x.querySelector('.l96')||x).textContent.trim());
  const low=[...fm.querySelectorAll('.d96 > button')].map(x=>x.dataset.act||(x.querySelector('.l96')||x).textContent.trim());
  const hds=[...A.querySelectorAll('.grid98 .hd98')].map(h=>Math.round(h.getBoundingClientRect().height));
  const btnH=[...A.querySelectorAll('.grid98 .g98 .btn.b96')].filter(x=>!x.closest('.dock98')).map(x=>Math.round(x.getBoundingClientRect().height));
  return {old:[...new Set(old)].sort().join(),now:[...new Set(now)].sort().join(),gr:gr.join(),rows,top,low,fmHd:fm.querySelector('.hd98').innerHTML,hds:[...new Set(hds)],btnH:[...new Set(btnH)],
    plate:getComputedStyle(A).backgroundImage,h:A.offsetHeight,mvFirst:(q_('[data-g96="mv"] .bd98 > button')||{dataset:{}}).dataset.act,dock2:[...A.querySelectorAll('.dock98 [data-act="focus"]')].length}});
out.L=L;
ok(L.gr==='mv,atk,fm,end','2a order Move · Attack · Forum · End turn: '+L.gr);ok(/gradient/.test(L.plate),'2b one plate');
ok(L.hds.length===1&&L.btnH.length===1,'2c shared header + button heights '+JSON.stringify([L.hds,L.btnH]));
ok(L.old===L.now,'2d same data-act set as before (07-ui\'s buttons moved) '+L.old+' | '+L.now);
ok(L.rows.length===2&&L.rows[0].main==='m-atkR'&&L.rows[1].main==='m-atkL','2e one button per weapon '+JSON.stringify(L.rows));
ok(L.rows.every(r=>r.foc)&&L.dock2===2,'2f a Focus dock beside every weapon (the focus act)');ok(L.rows[0].thr==='m-atkRT'&&!L.rows[1].thr,'2g ↗ Throw only on the throwable weapon');
ok(/dmg/.test(L.rows[0].st)&&/rng 2/.test(L.rows[0].st)&&L.rows[0].key==='A'&&!L.rows[1].key,'2h "N dmg · rng N" + key A on the first');
ok(L.top.join()==='market,crowd','2i Forum top row: Market + Crowd Favor '+L.top);ok(L.low.length===2&&/Loot|loot/.test(L.low[0])&&/trade|Trade/.test(L.low[1]),'2j Forum second row: Loot + Trade · Truce '+L.low);
ok(/ic87c/.test(L.fmHd)&&/ic87w|CF/.test(L.fmHd),'2k coin + CF in the Forum header');ok(L.mvFirst==='m-move','2l Move first in its block');ok(L.h<=210,'2m bar height '+L.h);
if(SHOT){await pg.mouse.move(5,5);await (await pg.$('#actions')).screenshot({path:path.join(SHOT,'tv98c_action.png')})}
/* buttons call the same acts: weapon, throw, focus on the 2nd weapon */
const C=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=cur();const o={};const q=s=>document.querySelector('#actions '+s);
  q('[data-g96="atk"] .wpn98:nth-child(1) .wb98').click();await W8(30);o.m1=S.mode;
  q('.dock98 .th98').click();await W8(30);o.m2=S.mode;
  S.mode='move';render();q('[data-g96="atk"] .wpn98:nth-child(2) .dock98 [data-act="focus"]').click();await W8(30);o.f=p.focusRoll;o.m3=S.mode;
  o.onRow=(q('.wpn98.on .wb98')||{dataset:{}}).dataset.act;o.moveDis=(q('[data-act="m-move"]')||{}).disabled;
  /* the other dock switches the weapon without toggling */
  const sw=q('.dock98 [data-m98]');if(sw){sw.click();await W8(30)}o.sw=!!sw;o.f2=p.focusRoll;o.m4=S.mode;
  /* turn it off again */
  q('.dock98 [data-act="focus"]').click();await W8(30);o.off=!p.focusRoll;return o});
out.C=C;
ok(C.m1==='atkR'&&C.m2==='atkRT','3a weapon + throw buttons pick their attack modes '+JSON.stringify(C));
ok(C.f&&C.m3==='atkL'&&C.onRow==='m-atkL'&&C.moveDis,'3b the 2nd weapon\'s Focus turns focus on and aims with it');ok(C.sw&&C.f2&&C.m4==='atkR'&&C.off,'3c other docks switch weapon, focus stays; off again');
/* ---- the Focus rule ---- */
const F=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=cur();const o={};S.mode='move';p.focusRoll=false;
  p.mv=2;render();const bs=[...document.querySelectorAll('#actions [data-act="focus"]')];o.refused=bs.length>0&&bs.every(x=>x.disabled);o.tip=(bs[0]||{dataset:{}}).dataset.tip||'';
  p.mv=3;render();o.at3=[...document.querySelectorAll('#actions [data-act="focus"]')].some(x=>!x.disabled);
  /* engine: a focus flag below 3 is ignored; at 3+ it spends all */
  const L=[];const bl=log;log=function(h){L.push(String(h).replace(/<[^>]+>/g,''));return bl.apply(this,arguments)};
  const wolf=S.npcs.find(n=>n.alive&&n.t!=='zora');const run=async(mv)=>{L.length=0;p.mv=mv;p.attacks=0;p.armUses={R:0,L:0};p.hitTargets=new Set();
    const src=attackSources(p).filter(s=>!s.thr)[0];const keep=RNG;RNG={next:()=>0.9};const hp=wolf.hp;
    await doAttack(p,src,{kind:'npc',ref:wolf,key:'n'+wolf.id,r:wolf.r,c:wolf.c},{focusRoll:true});RNG=keep;wolf.hp=hp;wolf.aggro=null;return {mv:p.mv,foc:L.some(l=>/focus/i.test(l))}};
  o.e2=await run(2);o.e4=await run(4);
  /* a focus flag cleared when an action leaves less than 3 */
  p.mv=3;p.focusRoll=true;S.busy=false;await act(async()=>{p.mv=1});o.cleared=!p.focusRoll;
  /* rule B (FOCUS98.bless on): a focused ranged / thrown attack may hit a Blessings pot in range, +1 damage on a hit, the pot falls toward the shooter */
  o.flag=FOCUS98.bless===true;FOCUS98.bless=true;
  const pl=S.pillars.find(x=>x.pots&&x.pots.length>=2&&x.r>=3&&x.r<=9&&x.c>=3&&x.c<=9)||S.pillars.find(x=>x.pots&&x.pots.length);
  while(pl.pots.length<3)pl.pots.push(pl.pots[0]||'elix2');
  const spot=[[0,2],[0,-2],[2,0],[-2,0],[2,2],[-2,-2],[2,-2],[-2,2]].map(([dr,dc])=>[pl.r+dr,pl.c+dc]).find(([r,c])=>r>=0&&c>=0&&r<13&&c<13&&!pillarAt(r,c)&&los({r,c},pl));
  for(const x of [...S.players,...S.npcs])if(x!==p&&x.r===spot[0]&&x.c===spot[1])x.r=-9;p.r=spot[0];p.c=spot[1];p.items=p.items.filter(x=>!/omnia/.test(x.key||''));
  const reset=(mv)=>{p.mv=mv;p.attacks=0;p.armUses={R:0,L:0};p.hitTargets=new Set()};
  p.wL=mkW('stones');reset(4);let st=attackSources(p).find(x=>x.arm==='L'&&!x.thr);
  p.focusRoll=false;o.potOff=targetsFor(p,st).some(t=>t.kind==='pot');p.focusRoll=true;o.potOn=targetsFor(p,st).some(t=>t.kind==='pot'&&t.ref===pl);p.focusRoll=false;
  const bp=[];const bk=breakPot;breakPot=async function(pll,pp,land){bp.push(land);return bk.apply(this,arguments)};
  const shot=async(src,focus,hits)=>{L.length=0;const keep=RNG;let i=0;RNG={next:()=>hits[(i++)%hits.length]};const pots=pl.pots.length;
    await doAttack(p,src,{kind:'pot',ref:pl,key:'b'+pl.id,r:pl.r,c:pl.c},{focusRoll:focus});RNG=keep;const ln=L.find(l=>/pot on/.test(l))||'';const m=/=\s*\D*(\d+)\s*(?:—|$)/.exec(ln);return {dmg:m?+m[1]:null,ln,broke:pl.pots.length<pots,mv:p.mv}};
  reset(4);FOCUS98.bless=false;o.one0=await shot(st,true,[0.1,0.9]);
  reset(4);p.wL=mkW('stones');st=attackSources(p).find(x=>x.arm==='L'&&!x.thr);FOCUS98.bless=true;bp.length=0;o.one1=await shot(st,true,[0.1,0.9]);
  o.land=bp[0]||null;o.toward=[pl.r+Math.sign(p.r-pl.r),pl.c+Math.sign(p.c-pl.c)];
  /* a throw at a pot spends the throw */
  reset(4);p.wR=mkW('hasta');const th=attackSources(p).find(x=>x.arm==='R'&&x.thr);p.focusRoll=true;o.thrPot=targetsFor(p,th).some(t=>t.ref===pl);p.focusRoll=false;
  o.thr=await shot(th,true,[0.1,0.1]);o.thrGone=p.wR==null;
  /* melee next to the pot, no Focus: unchanged */
  if(pl.pots.length){const adj=[[0,1],[0,-1],[1,0],[-1,0]].map(([dr,dc])=>[pl.r+dr,pl.c+dc]).find(([r,c])=>r>=0&&c>=0&&r<13&&c<13&&!pillarAt(r,c)&&!playerAt(r,c)&&!npcAt(r,c));p.r=adj[0];p.c=adj[1];
    p.wL=mkW('gladius');reset(4);const ml=attackSources(p).find(x=>x.arm==='L');o.melee=await shot(ml,false,[0.1,0.9])}
  breakPot=bk;
  /* CPUs: a Master takes the focused pot shot, a Fighter does not */
  const c=S.players[2];const pl2=S.pillars.find(x=>x.pots&&x.pots.length&&x!==pl)||pl;
  const sp2=[[0,2],[0,-2],[2,0],[-2,0]].map(([dr,dc])=>[pl2.r+dr,pl2.c+dc]).find(([r,cc])=>r>=0&&cc>=0&&r<13&&cc<13&&!pillarAt(r,cc)&&!playerAt(r,cc)&&!npcAt(r,cc)&&los({r,c:cc},pl2));
  if(sp2){c.r=sp2[0];c.c=sp2[1];c.alive=true;c.cpu=true;c.wR=mkW('stones');c.wL=null;c.mv=4;c.attacks=0;c.armUses={R:0,L:0};c.hitTargets=new Set();c.hesitant=false;c.cf=20;c.coin=20;
    c.tier=4;const m4=focus98CpuPot(c,null);c.tier=2;const m2=focus98CpuPot(c,null);c.mv=2;c.tier=4;const mv2=focus98CpuPot(c,null);o.cpuPot={m4:!!(m4&&m4.t.kind==='pot'),m2:!!m2,mv2:!!mv2};if(!o.cpuPot.m4){c.mv=4;FOCUS98.aim=c;const src=attackSources(c);o.cpuDbg={src:src.length,t:src.map(x=>targetsFor(c,x).map(t=>t.kind+t.f98)),sc:src.map(x=>targetsFor(c,x).filter(t=>t.f98).map(t=>{FOCUS98.cur=c;const v=cpuScoreAttack(c,x,t);FOCUS98.cur=null;return v})),pvp:RD().pvp,pl2:[pl2.r,pl2.c,pl2.pots.length],cc:[c.r,c.c]};FOCUS98.aim=null}}
  log=bl;p.mv=5;render();return o});
out.F=F;
ok(F.refused&&/3/.test(F.tip),'4a Focus refused below 3 movement, with the reason: '+F.tip);ok(F.at3,'4b Focus allowed at 3');
ok(F.e2.mv===2&&!F.e2.foc,'4c engine ignores a focus flag below 3 '+JSON.stringify(F.e2));ok(F.e4.mv===0,'4d at 3+ Focus spends all movement '+JSON.stringify(F.e4));
ok(F.cleared,'4e focus flag cleared when an action leaves less than 3');ok(F.flag,'4f FOCUS98.bless is on by default');
ok(!F.potOff&&F.potOn,'4g a ranged weapon reaches a distant pot only with Focus '+JSON.stringify([F.potOff,F.potOn]));
ok(F.one0.dmg!=null&&F.one1.dmg===F.one0.dmg+1&&F.one1.broke&&!F.one0.broke,'4h a focused hit on a pot: +1 damage, a power-1 weapon snaps the chains '+JSON.stringify([F.one0,F.one1]));
ok(F.one1.mv===0,'4i the focused pot shot spends all movement');ok(F.land&&F.land[0]===F.toward[0]&&F.land[1]===F.toward[1],'4j the pot falls one tile toward the shooter '+JSON.stringify([F.land,F.toward]));
ok(F.thrPot&&F.thrGone,'4k a thrown weapon may Focus a pot and the throw is spent '+JSON.stringify(F.thr));
ok(!F.melee||(F.melee.dmg!=null&&F.melee.dmg===F.one0.dmg),'4l melee pot attack without Focus unchanged '+JSON.stringify(F.melee));
ok(F.cpuPot&&F.cpuPot.m4&&!F.cpuPot.m2&&!F.cpuPot.mv2,'4m CPUs: Master takes the focused pot shot, Fighter / under 3 movement do not '+JSON.stringify(F.cpuPot));
/* CPUs obey: an all-CPU stretch never focuses below 3 */
out.cpu=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const bad=[],all=[];const bd=doAttack;
  doAttack=function(pl,s,t,o){if(pl&&pl.cpu&&o&&o.focusRoll){all.push(pl.mv);if(pl.mv<3)bad.push(pl.mv)}return bd.apply(this,arguments)};
  const p=cur();p.cpu=true;for(const q of S.players)if(q.cpu){q.tier=4;q.diff='hard'}SPEED='fast';S.ri=1;render();try{await endTurn()}catch(e){}
  for(let i=0;i<60&&!S.over&&S.turnNo<40;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  doAttack=bd;SPEED='pause';return {bad,all}});
ok(!out.cpu.bad.length,'5 CPUs never Focus below 3 '+JSON.stringify(out.cpu));
const errN=await pg.evaluate(m=>typeof errNew92==='function'?errNew92(m).length:0,mark).catch(()=>0);ok(!errN,'no new error-log entries ('+errN+')');
await pg.context().close();
/* ---- kill switch ---- */
const K=await boot({width:1440,height:900},false,{flavius_bar98off:'1'});ok(await start(K,'action'),'6 0 reached Action (switch off)');
out.kill=await K.evaluate(()=>({v2:!!document.querySelector('#actions .grid98'),g:[...document.querySelectorAll('#actions .grid96 > [data-g96]')].map(e=>e.dataset.g96).join()}));
ok(!out.kill.v2&&out.kill.g==='atk,mv,dl,mk,end','6 flavius_bar98off=1 → the 233 bar '+JSON.stringify(out.kill));await K.context().close();
/* ---- 390 px ---- */
const P=await boot({width:390,height:844},true);ok(await start(P,'action'),'7 0 reached our Action at 390');
out.ph=await P.evaluate(()=>{document.body.classList.add('pl-act','pp-act');render();const g=document.querySelector('#actions .grid98');const e=document.querySelector('#actions .grid98 .end96');if(!g||!e)return {none:1};
  const gs=getComputedStyle(g),es=getComputedStyle(e);const st=document.querySelector('#actions .wpn98 .st98');const gb=g.getBoundingClientRect(),eb=e.getBoundingClientRect();
  return {disp:gs.display,ox:gs.overflowX,pos:es.position,right:Math.round(gb.right-eb.right),stHidden:!st||getComputedStyle(st).display==='none',lp:!!document.querySelector('#actions .wb98[data-st98]'),
    page:document.documentElement.scrollWidth-innerWidth,minBtn:Math.round(Math.min(...[...g.querySelectorAll('.g98 .btn.b96')].map(x=>x.getBoundingClientRect().height)))}});
ok(out.ph.disp==='flex'&&/auto|scroll/.test(out.ph.ox),'7a one swipe row '+JSON.stringify(out.ph));ok(out.ph.pos==='sticky'&&Math.abs(out.ph.right)<=2,'7b End turn fixed right');
ok(out.ph.stHidden&&out.ph.lp,'7c dmg · rng hidden, long-press text on the weapon');ok(out.ph.page<=1,'7d no sideways page scroll');ok(out.ph.minBtn>=36,'7e touch-size buttons');
if(SHOT)await P.screenshot({path:path.join(SHOT,'tv98c_390.png')});
console.log(JSON.stringify(out));console.log('MISS',miss);console.log('ERRS',errs.slice(0,6));await b.close();if(miss.length||errs.length)process.exit(1)})();

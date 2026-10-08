/* v0.97 (236-v96deals): 1 "No CF this event" tiles whole match (Familia) + 2a Truce/Teammate chips first + 3 accepted banner + 4 Match Week and room chips
   + 5a one offer per player per turn (human menu + CPU) + 6a Arena Chest costs 1 movement (refused at 0, no double penalty, Zora hand-over free)
   + 7 Move not "on" at 0 movement. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const boot=async()=>{const ctx=await b.newContext({viewport:{width:1440,height:900}});
  await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});return pg};
const start=(pg,ev)=>pg.evaluate(async(ev)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='fast';
  startEvent({ev,loc:6,seats:['soldier','hero','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<300;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);
    else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break;
    else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('#actions [data-act="coin"]');if(c)c.click()}}
  SPEED='pause';render();await W8(200);return !!S&&cur()===S.players[0]&&S.phase==='action'},ev);
let pg=await boot();
const mark=await pg.evaluate(()=>typeof ERR92!=='undefined'?ERR92.n:0).catch(()=>0);
/* ---------- 1 + 2a(teammate) + 4: Familia ---------- */
ok(await start(pg,'familia'),'0a reached our Action in Familia');
out.fam=await pg.evaluate(()=>{const A=document.getElementById('actions');const get=t=>[...A.querySelectorAll('.k96 .b96')].find(b=>(b.querySelector('.l96')||{}).textContent.trim()===t);
  const m=get('Market'),c=get('Crowd Favor');const f=b=>b?{c:(b.querySelector('.c96')||{}).textContent,tip:b.dataset.tip,dis:b.disabled}:null;
  return {noCF:noCF96(),m:f(m),c:f(c),teams:!!EV().teams,mates:S.players.map(p=>friendly(S.players[0],p)),chip:/No CF/.test(noCFChip96())}});
ok(out.fam.noCF,'1a Familia counts as a no-CF event '+JSON.stringify(out.fam));
ok(out.fam.m&&out.fam.m.c==='No CF this event'&&out.fam.m.dis,'1b Market tile: reason + disabled '+JSON.stringify(out.fam.m));
ok(out.fam.c&&out.fam.c.c==='No CF this event','1c Crowd tile: reason '+JSON.stringify(out.fam.c));
ok(out.fam.m&&/nothing can be bought at the Market/.test(out.fam.m.tip||'')&&/Cards and offerings can still provide weapons and armor/.test(out.fam.m.tip||''),'1d hover tip');
/* still true after more renders (whole match) */
out.fam2=await pg.evaluate(()=>{render();render();const A=document.getElementById('actions');return [...A.querySelectorAll('.k96 .c96')].map(x=>x.textContent)});
ok(out.fam2.length>=1&&out.fam2.every(t=>t==='No CF this event'),'1e still shown after re-render '+JSON.stringify(out.fam2));
/* teammate chip + sort: put everyone in range */
out.menu=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=S.players[0];S.players.forEach((q,i)=>{if(i){q.r=Math.min(12,p.r+(i%2));q.c=Math.min(12,p.c+i>12?p.c-i:p.c+i)}});
  S.players[1].team=p.team;  const mate=S.players.find((q,i)=>i&&friendly(p,q));const foe=S.players.filter((q,i)=>i&&!friendly(p,q))[0];
  openTrade(p);await W8(300);const rows=[...document.querySelectorAll('#mBtns .btn')].map(x=>x.textContent);const cn=document.querySelectorAll('#mBtns .chip96.mate').length;
  if(CUR_MODAL)CUR_MODAL.done(null);await W8(200);return {rows,cn,mate:mate&&mate.name,foe:foe&&foe.name}});
ok(out.menu.cn>=1&&/Teammate/.test(out.menu.rows[0]||''),'2a-1 Teammate chip, first row '+JSON.stringify(out.menu));
await pg.context().close();
/* ---------- Democritus: 2a truce, 3, 5a, 6a, 7 ---------- */
pg=await boot();
ok(await start(pg,'democritus'),'0b reached our Action in Democritus');
out.dem=await pg.evaluate(()=>({noCF:noCF96(),k:[...document.querySelectorAll('#actions .k96 .c96')].map(x=>x.textContent)}));
ok(!out.dem.noCF&&!out.dem.k.includes('No CF this event'),'1f a CF event keeps its normal tiles '+JSON.stringify(out.dem));
/* 7: Move dim at 0 */
out.mv=await pg.evaluate(()=>{const p=S.players[0];const g=()=>{const m=document.querySelector('#actions [data-act="m-move"]');return m?{on:m.classList.contains('on'),spent:m.classList.contains('spent96')}:null};
  p.mv=3;S.mode='move';render();const a=g();p.mv=0;render();const z=g();return {a,z}});
ok(out.mv.a&&out.mv.a.on&&!out.mv.a.spent,'7a Move is "on" with movement left '+JSON.stringify(out.mv));
ok(out.mv.z&&!out.mv.z.on&&out.mv.z.spent,'7b Move not "on" and dimmed at 0 '+JSON.stringify(out.mv));
/* 2a + 3 + 5a (human) */
out.deal=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=S.players[0];p.mv=3;S.mode='move';
  S.players.forEach((q,i)=>{if(i){q.r=Math.min(12,p.r+1);q.c=Math.max(0,p.c-i);q.underground=false}});S.truces=S.truces||new Set();
  const r={};
  makeTruce(p,S.players[1]);await W8(100);const bn=document.querySelector('.acc96');r.banner=bn&&bn.textContent;
  await W8(2700);r.gone=!document.querySelector('.acc96');
  const bT0=cpuAcceptsTruce;cpuAcceptsTruce=function(other,pl){offerMark96(pl,other);return false};
  const click=async(t)=>{const b=[...document.querySelectorAll('#mBtns .btn')].find(x=>x.textContent.includes(t));if(b)b.click();await W8(300);return !!b};
  openTrade(p);await W8(300);r.rows=[...document.querySelectorAll('#mBtns .btn')].map(x=>x.textContent);r.chip=!!document.querySelector('#mBtns .chip96.truce');
  r.firstTruce=/Truce/.test(r.rows[0]||'');
  /* offer a truce to player 2 (CPU) */
  await click(S.players[2].name);r.what=[...document.querySelectorAll('#mBtns .btn')].map(x=>x.textContent);
  await click('Propose a truce');await W8(500);while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}
  r.marked=JSON.stringify(S.offers96);
  openTrade(p);await W8(300);const row=[...document.querySelectorAll('#mBtns .btn')].find(x=>x.textContent.includes(S.players[2].name));r.rowTxt=row&&row.textContent;r.rowOp=row&&row.style.opacity;
  await click(S.players[2].name);const bs=[...document.querySelectorAll('#mBtns .btn')];
  r.dis=Object.fromEntries(bs.map(x=>[x.textContent.split('already')[0].slice(0,18),x.disabled]));r.whatTxt=bs.map(x=>x.textContent);
  while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}
  cpuAcceptsTruce=bT0;
  r.p1off=offered96(p,S.players[1]);r.p2off=offered96(p,S.players[2]);
  S.turnNo++;r.reset=!offered96(p,S.players[2]);S.turnNo--;
  return r});
ok(/Truce/.test(out.deal.banner||'')&&/⟷/.test(out.deal.banner||''),'3a banner on makeTruce '+out.deal.banner);ok(out.deal.gone,'3b banner leaves after ~2.5 s');
ok(out.deal.chip&&out.deal.firstTruce,'2a-2 Truce chip, in-truce row first '+JSON.stringify(out.deal.rows));
ok(out.deal.what&&out.deal.what.some(t=>/Propose a truce/.test(t)),'5a-0 the second window offers a truce '+JSON.stringify(out.deal.what));
ok(/"to":\[\d/.test(out.deal.marked||''),'5a-1 the offer is marked in S '+out.deal.marked);
ok(/Already offered this turn/.test(out.deal.rowTxt||''),'5a-2 menu row says so '+out.deal.rowTxt);
ok(out.deal.whatTxt&&out.deal.whatTxt.filter(t=>/Propose a trade|Propose a truce/.test(t)).length===2&&out.deal.whatTxt.filter(t=>/Propose a trade|Propose a truce/.test(t)).every(t=>/Already offered/.test(t)),'5a-3 trade + truce disabled with the reason '+JSON.stringify(out.deal.whatTxt));
ok(out.deal.whatTxt&&out.deal.whatTxt.some(t=>/Give a gift/.test(t)&&!/Already/.test(t)),'5a-4 gift stays open');
ok(!out.deal.p1off&&out.deal.p2off&&out.deal.reset,'5a-5 per target, resets next turn '+JSON.stringify({p1:out.deal.p1off,p2:out.deal.p2off,reset:out.deal.reset}));
/* trade accepted banner */
out.tr=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=S.players[0],q=S.players[3];const gv=tradeables(p),gt=tradeables(q);
  if(!gv.length||!gt.length)return {skip:true};doTrade(p,q,gv[0],gt[0]);await W8(100);const bn=document.querySelector('.acc96');return {t:bn&&bn.textContent}});
ok(out.tr.skip||/Trade/.test(out.tr.t||''),'3c banner on doTrade '+JSON.stringify(out.tr));
/* 5a CPU */
out.cpu=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}
  S.players.forEach(q=>{q.cpu=true;q.underground=false});S.truces=new Set();S.ri=Math.max(0,S.rounds?S.rounds.findIndex((x,i)=>true):0);
  const rd0=RD();const pv0=rd0.pvp;rd0.pvp=1;
  const c=S.players[1];c.diff='hard';S.players.forEach((q,i)=>{q.r=6;q.c=2+i});
  let n=0;const bT=cpuAcceptsTruce,bR=cpuAcceptsTrade;
  const others=S.players.filter(q=>q!==c);
  const run=async(k)=>{n=0;for(let i=0;i<k;i++){S.truces=new Set();S.lastOffer=-99;S.offers96={turnNo:S.turnNo,from:c.id,to:S.offers96&&S.offers96.turnNo===S.turnNo&&S.offers96.from===c.id?S.offers96.to:[]};await cpuDiplomacy(c);if(S.lastOffer!==-99)n++}return n};
  S.offers96={turnNo:S.turnNo,from:c.id,to:[]};const free=await run(400);
  S.offers96={turnNo:S.turnNo,from:c.id,to:others.map(q=>q.id)};S.players.forEach(()=>{});
  const used=await (async()=>{n=0;for(let i=0;i<200;i++){S.truces=new Set();S.lastOffer=-99;await cpuDiplomacy(c);if(S.lastOffer!==-99)n++}return n})();
  cpuAcceptsTruce=bT;cpuAcceptsTrade=bR;const pvp=RD().pvp;rd0.pvp=pv0;return {free,used,pvp}});
ok(out.cpu.pvp,'5b-0 a PvP round for the CPU test');
ok(out.cpu.free>0,'5b-1 a CPU does offer when it has not yet '+JSON.stringify(out.cpu));
ok(out.cpu.used===0,'5b-2 a CPU with every target used offers nothing '+JSON.stringify(out.cpu));
await pg.context().close();
/* ---------- 6a chest ---------- */
pg=await boot();
ok(await start(pg,'democritus'),'0c reached our Action');
out.chest=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=S.players[0];const r={};
  if(!S.chest)S.chest={r:p.r,c:p.c,held:null,weapons:['labrys']};S.chest.r=p.r;S.chest.c=p.c;S.chest.held=null;p.carrying=false;S.mode='move';
  const btn=()=>document.querySelector('#actions [data-act="chestup"]');
  p.mv=0;render();r.zeroDis=!!(btn()&&btn().disabled);r.zeroSub=btn()&&btn().textContent;
  if(btn()){btn().disabled=false;btn().click();await W8(300)}r.zeroCarry=p.carrying;r.zeroMv=p.mv;
  p.mv=4;render();r.okEn=!!(btn()&&!btn().disabled);btn().click();await W8(400);r.carry=p.carrying;r.mv=p.mv;r.held=S.chest.held;
  r.mvMaxNow=mvMax(p);p.carrying=false;r.mvMaxFree=mvMax(p);p.carrying=true;
  /* Zora hands it over: free */
  p.carrying=false;S.chest.held=null;p.mv=4;
  S.npcs=S.npcs||[];const z={id:'zt96',t:'zora',alive:true,tamedBy:p.id,carry:{kind:'chest'},r:p.r,c:p.c,hp:1,name:'Zora'};S.npcs.push(z);
  try{render()}catch(e){r.rerr=e.message}
  const zb=document.querySelector('[data-act91="zorachest"]');r.zbtn=!!zb;if(zb){zb.click();await W8(400)}r.zCarry=p.carrying;r.zMv=p.mv;
  /* MV is not charged twice: next turn's start = mvMax (already -1 while carrying) */
  r.CPUguard=true;return r});
ok(out.chest.zeroDis,'6a-1 pick-up disabled at 0 movement '+JSON.stringify(out.chest));
ok(out.chest.zeroCarry===false&&out.chest.zeroMv===0,'6a-2 handler refuses at 0 movement');
ok(out.chest.okEn&&out.chest.carry&&out.chest.mv===3&&out.chest.held,'6a-3 pick-up costs exactly 1 movement '+out.chest.mv);
ok(out.chest.mvMaxNow===out.chest.mvMaxFree-1,'6a-4 carrying keeps the -1 in mvMax for following turns');
if(out.chest.zbtn)ok(out.chest.zCarry&&out.chest.zMv===4,'6a-5 Zora hand-over costs no movement '+JSON.stringify({c:out.chest.zCarry,mv:out.chest.zMv}));
else ok(false,'6a-5 could not build the Zora hand-over '+JSON.stringify(out.chest));
await pg.context().close();
/* ---------- 4: Match Week rows + the online room ---------- */
pg=await boot();
out.mw=await pg.evaluate(()=>{try{CUR_MODAL&&CUR_MODAL.done(null)}catch(e){}newWorld({type:'custom',mgr:{name:'T',ludus:'L',city:'Pola',color:'#c00',p:{...MGR_PRESETS.balanced[1]},portrait:{}}});const w=W_();
  const base=nightHTML().split('nocf96c').length-1;const b0=w.night.bouts[0];const was=b0.ev;b0.ev='familia';const h1=nightHTML();b0.ev=was;
  const room=r96Layout('<div id="onlRoom80" class="r80"><div class="r80-head"><div class="fi89"></div></div></div>',{ev:'familia',members:[],players:[],stands:[]},false);
  const room2=r96Layout('<div id="onlRoom80" class="r80"><div class="r80-head"><div class="fi89"></div></div></div>',{ev:'democritus',members:[],players:[],stands:[]},false);
  return {base,withNoCF:h1.split('nocf96c').length-1,tip:/nothing can be bought at the Market/.test(h1),room:/nocf96c/.test(room),room2:/nocf96c/.test(room2)}});
ok(out.mw.withNoCF>out.mw.base&&out.mw.tip,'4a Match Week bout row chip for a no-CF event '+JSON.stringify(out.mw));
ok(out.mw.room&&!out.mw.room2,'4b online room head chip only for no-CF events '+JSON.stringify(out.mw));
const errNew=await pg.evaluate(m=>typeof ERR92!=='undefined'?ERR92.n-m:0,mark).catch(()=>0);
console.log(JSON.stringify(out));console.log('MISS',miss);console.log('ERRS',errs.slice(0,6));await b.close();if(miss.length||errs.length)process.exit(1)})();

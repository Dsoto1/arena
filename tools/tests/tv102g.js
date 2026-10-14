/* tv102g — v1.02 338-v102draft: the Play Now "Draft the gear" switch.
   A: Democritus, all CPU, switch on → every gladiator holds ONLY drafted weapons/armor (class coin/keys kept), CPUs drafted.
   B: the same seed again → the same draft, pick for pick.   C: switch off → today's class loadouts, no draft.
   D: Play Now Options: the switch on a Classic toggles CFG.opts.draft102; Ludus shows it on + locked "Drafts its gear"; chip + briefing card.
   E: hot seat (two humans) — each human drafts in the draft window; CPUs too. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const W8=ms=>pg.waitForTimeout(ms);
const fresh=async()=>{await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}window.PICKS=[];
  {const b0=draftPull81;draftPull81=function(x){try{PICKS.push({who:x.by-1,kind:x.kind,k:x.k})}catch(e){}return b0.apply(this,arguments)}}})};
await fresh();
const SEATS=[{cls:'soldier',cpu:true},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'amazonia',cpu:true}];
const run=async(draft,abil)=>{await fresh();return pg.evaluate(async([seats,draft,abil])=>{if(S&&!S.over){S.over=true}if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200));
  SPEED='fast';PICKS.length=0;
  startEvent({ev:'democritus',loc:6,seats:JSON.parse(JSON.stringify(seats)).map(x=>({...x,pers:{...seatPers(x)}})) /* class-default minds, as the replay harness: rollPersonality uses Math.random */,opts:{spect:0,draft102:draft,abil102:abil||'own'},seed:4242});
  let last=-1,still=0;for(let i=0;i<400&&still<25;i++){still=PICKS.length===last?still+1:0;last=PICKS.length;
    if(CUR_MODAL&&!document.querySelector('#mBody .mk88'))CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);
    await new Promise(r=>setTimeout(r,100))}
  await new Promise(r=>setTimeout(r,300));
  const pl=S.players.map(p=>({cls:p.cls,w:[p.wR&&p.wR.key,p.wL&&p.wL.key].filter(Boolean),a:Object.values(p.pieces||{}).flat().filter(Boolean).map(x=>x.key||x.k||x).filter(x=>typeof x==='string'),coin:p.coin,keys:p.keys,drafted:!!p.drafted,abil:p.abil}));
  return {picks:PICKS.slice(),pl,opt:!!S.opts.draft102,pairs:S.players.map(p=>p.pair102?[p.pair102,p.abil,p.wk102]:null),deck:dr102Pair()?pair102Deck().map(x=>x.k):null,
    wk:S.players.map(p=>['pelted','tax','noTunnel','noBlessCF'].filter(k=>weak(p,k))),cls:S.players.map(p=>({R:CLASSES[p.cls].R,L:CLASSES[p.cls].L,arm:CLASSES[p.cls].armor.map(x=>x[0]),coin:CLASSES[p.cls].coin}))}},[SEATS,draft,abil])}; /* each run in a fresh page: no old event's async tail touches the dice */
const A=await run(true);
ok(A.opt,'switch rides in S.opts');
ok(A.picks.length===20,'4 gladiators × 5 picks drafted (CPUs) '+A.picks.length);
ok([0,1,2,3].every(i=>A.picks.filter(x=>x.who===i).length===5),'each seat drafted 5 '+JSON.stringify(A.picks.map(x=>x.who)));
A.pl.forEach((p,i)=>{const mine=A.picks.filter(x=>x.who===i);
  ok(p.w.every(k=>mine.some(x=>x.kind==='w'&&x.k===k)),`seat ${i} holds only drafted weapons `+JSON.stringify({w:p.w,mine}));
  ok(mine.filter(x=>x.kind==='w').every(x=>p.w.includes(x.k)),`seat ${i} drafted weapons are in hand`);
  const ca=A.cls[i];ok(!ca.R||p.w.includes(ca.R)===mine.some(x=>x.k===ca.R),`seat ${i} no class weapon unless drafted`);
  ok(p.coin>=ca.coin,`seat ${i} keeps the class coin ${p.coin}/${ca.coin}`);ok(!p.drafted&&p.abil!==undefined,`seat ${i} keeps class ability (not p.drafted)`)});
const armA=await pg.evaluate(()=>S.players.map(p=>LOCS.flatMap(l=>(p.pieces&&p.pieces[l]||[]).map(x=>x.key||x.k)).filter(Boolean)));
armA.forEach((ks,i)=>{const mine=A.picks.filter(x=>x.who===i&&x.kind==='a').map(x=>x.k);ok(ks.every(k=>mine.includes(k)),`seat ${i} wears only drafted armor `+JSON.stringify({ks,mine}))});
const B=await run(true);
ok(JSON.stringify(B.picks)===JSON.stringify(A.picks),'same seed → same draft '+JSON.stringify([A.picks.slice(0,4),B.picks.slice(0,4)]));
const C=await run(false);
ok(C.picks.length===0,'switch off: no draft');
ok(C.pl[0].w.includes('gladius')||C.pl[0].w.includes(C.cls[0].R),'switch off: the Soldier holds his class weapon '+JSON.stringify(C.pl[0]));
const armC=await pg.evaluate(()=>S.players.map(p=>LOCS.flatMap(l=>(p.pieces&&p.pieces[l]||[]).map(x=>x.key||x.k)).filter(Boolean).length));
ok(armC.some(n=>n>0),'switch off: class armor worn '+JSON.stringify(armC));
/* F: Random pair (no gear draft) — seeded, per-player weakness, the same seed deals the same pairs */
const F=await run(false,'random');const F2=await run(false,'random');
const POOL=await pg.evaluate(()=>pair102Pool().map(x=>[x.k,x.abil,x.weak]));
ok(POOL.length===7&&!POOL.some(x=>x[0]==='amazonia'),'pool = the 7 printed classes with an ability (no Amazonia) '+JSON.stringify(POOL));
ok(POOL.filter(x=>x[2]==='none').map(x=>x[0]).sort().join()==='hero,royalty,slave,soldier','abilities without a weakness come alone '+JSON.stringify(POOL));
ok(F.pairs.every(Boolean)&&new Set(F.pairs.map(x=>x[0])).size===4,'random: every seat got a distinct pair '+JSON.stringify(F.pairs));
ok(F.pairs.every((x,i)=>x[0]===F.deck[i]),'random: dealt in seat order from the seeded deck '+JSON.stringify([F.deck,F.pairs]));
ok(F.pairs.every((x,i)=>{const P=POOL.find(q=>q[0]===x[0]);return x[1]===P[1]&&x[2]===P[2]}),'random: each pair = that class\'s ability + its own weakness or none');
ok(F.pairs.every((x,i)=>JSON.stringify(F.wk[i])===JSON.stringify(x[2]==='none'?[]:[x[2]])),'weak() follows the pair, not the class '+JSON.stringify([F.pairs,F.wk]));
ok(JSON.stringify(F2.pairs)===JSON.stringify(F.pairs),'random: same seed → same pairs');
ok(F.picks.length===0&&F.pl[0].w.length>0,'random pair without the gear switch keeps the class gear');
const own=await run(false,'own');ok(own.pairs.every(x=>!x)&&own.pl.every(p=>p.abil===null||p.abil==='zora'||p.abil==='stone'),'Class\'s own = today '+JSON.stringify(own.pairs));
/* no-weakness pair in play: Iron Fist alone → no weakness, +1 damage in round 1 */
const IF=await pg.evaluate(()=>{const p=S.players[0];const b0=statDmgB(p);pair102Give(p,pair102Pool().find(x=>x.k==='soldier'));const r={b0,b1:statDmgB(p),ri:S.ri,wk:['pelted','tax','noTunnel','noBlessCF'].filter(k=>weak(p,k)),txt:pair102Wk({weak:p.wk102})};
  p.cls='damnatio';r.dam=weak(p,'pelted');return r});
ok(IF.wk.length===0&&!IF.dam&&/no weakness/.test(IF.txt),'an ability with no weakness: none borrowed, even on a Damnatio '+JSON.stringify(IF));
ok(IF.ri!==0||IF.b1===IF.b0+1,'Iron Fist: +1 damage in round 1 '+JSON.stringify(IF));
/* G: Draft a pair + the gear draft, all CPU — 3 offers each, CPUs pick */
const G=await run(true,'draft');const G2=await run(true,'draft');
ok(G.picks.length===20,'gear draft still runs before the pairs');
ok(G.pairs.every((x,i)=>x&&[0,1,2].map(j=>G.deck[(i*3+j)%7]).includes(x[0])),'draft: each pick is one of its 3 offers '+JSON.stringify([G.deck,G.pairs]));
ok(JSON.stringify(G2.pairs)===JSON.stringify(G.pairs),'draft: same seed → same pairs');
/* H: never in a lesson / Manager config */
const H=await pg.evaluate(()=>{if(S)S.over=true;let o=null;const b0=newState;newState=function(c){o={...c.opts};return b0.apply(this,arguments)};
  try{startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:true},{cls:'hero',cpu:true}],opts:{spect:0,draft102:true,abil102:'random'},seed:1,tutorial:true})}catch(e){}newState=b0;S.over=true;return o});
ok(H&&!H.draft102&&H.abil102==='own','lesson / Manager configs drop both options '+JSON.stringify(H));
/* D: the Options box */
await pg.evaluate(()=>{S.over=true;if(CUR_MODAL)CUR_MODAL.done(null)});await W8(300);
await pg.evaluate(()=>{CFG.hotseat=false;CFG.ev='democritus';CFG.opts.draft102=false;CFG.opts.abil102='own';openSetup(true)});
await pg.waitForFunction(()=>document.querySelector('#mBody #oDraft102'),null,{timeout:15000});
const D1=await pg.evaluate(()=>{const i=document.querySelector('#mBody #oDraft102');const r={dis:i.disabled,on:i.checked,inOpt:!!i.closest('.pn100opt'),chip:!!document.querySelector('#mBody .dr102chip[hidden]')};i.click();r.after=CFG.opts.draft102;r.chip2=!document.querySelector('#mBody .dr102chip').hidden;return r});
ok(!D1.dis&&!D1.on&&D1.after===true,'Classic: switch free, off, toggles CFG.opts.draft102 '+JSON.stringify(D1));
ok(D1.inOpt,'switch sits in the Options panel');
const D4=await pg.evaluate(()=>{const s=document.querySelector('#mBody #oAbil102');if(!s)return null;const r={dis:s.disabled,v:s.value,opts:[...s.options].map(o=>o.value)};s.value='draft';s.dispatchEvent(new Event('change',{bubbles:true}));
  r.cfg=CFG.opts.abil102;const c=document.querySelector('#mBody .dr102chip.ab');r.chip=c&&!c.hidden&&c.textContent;return r});
ok(D4&&!D4.dis&&D4.v==='own'&&D4.opts.join()==='own,random,draft'&&D4.cfg==='draft'&&/ability pairs/.test(D4.chip||''),'Abilities select: Class\'s own default, sets CFG.opts.abil102, chip '+JSON.stringify(D4));ok(D1.chip&&D1.chip2,'details chip shows when on '+JSON.stringify(D1));
await pg.evaluate(()=>{const s=document.querySelector('#evSel');s.value='ludus';s.dispatchEvent(new Event('change',{bubbles:true}))});
await pg.waitForFunction(()=>CFG.ev==='ludus'&&document.querySelector('#mBody #oDraft102'),null,{timeout:10000}).catch(()=>{});
const D2=await pg.evaluate(()=>{const a=document.querySelector('#mBody #oAbil102');window.__abDis=a&&a.disabled;const i=document.querySelector('#mBody #oDraft102');const c=document.querySelector('#mBody .dr102chip');return {ev:CFG.ev,dis:i&&i.disabled,on:i&&i.checked,lab:i&&i.closest('label').textContent,chip:c&&!c.hidden&&c.textContent}});
ok(await pg.evaluate(()=>window.__abDis===true),'Ludus: Abilities locked (no class abilities there)');
ok(D2.ev==='ludus'&&D2.dis&&D2.on&&/Drafts its gear/.test(D2.lab)&&/Drafts its gear/.test(D2.chip||''),'Ludus: switch on + locked, "Drafts its gear" '+JSON.stringify(D2));
const D3=await pg.evaluate(()=>{const r={};const s0=S;S={...s0,evKey:'ludus',opts:{}};try{r.lud=bf100Rules(EVENTS.ludus).some(x=>/Drafts its gear/.test(x[1]))}finally{S=s0}
  S={...s0,evKey:'democritus',opts:{draft102:true}};try{r.dem=bf100Rules(EVENTS.democritus).some(x=>/Drafts its gear/.test(x[1]))}finally{S=s0}
  S={...s0,evKey:'democritus',opts:{abil102:'random'}};try{r.ab=bf100Rules(EVENTS.democritus).some(x=>/ability pairs/.test(x[1]))}finally{S=s0}
  S={...s0,evKey:'democritus',opts:{}};try{r.off=bf100Rules(EVENTS.democritus).some(x=>/Drafts its gear/.test(x[1]))}finally{S=s0}return r});
ok(D3.ab,'briefing rule card for ability pairs '+JSON.stringify(D3));
ok(D3.lud&&D3.dem&&!D3.off,'briefing rule card "Drafts its gear" '+JSON.stringify(D3));
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);window.SETUP_OPEN=false;CFG.ev='democritus'});await W8(300);
/* E: hot seat, two humans */
const E=await pg.evaluate(async()=>{CFG.hotseat=true;SPEED='fast';PICKS.length=0;window.TITLES=[];
  const hs={players:[{seat:0,pid:hsEnsure('Ann').id,name:'Ann'},{seat:1,pid:hsEnsure('Bob').id,name:'Bob'}]};
  startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:false},{cls:'hero',cpu:false},{cls:'royalty',cpu:true},{cls:'slave',cpu:true}],opts:{spect:0,draft102:true,abil102:'draft'},seed:99,hotseat:hs});window.ABT=[];
  for(let i=0;i<500&&!(PICKS.length>=20&&S.players.every(p=>p.pair102));i++){if(CUR_MODAL){const t=document.getElementById('mTitle').textContent;
      if(/Ability draft/.test(t)){const bs=[...document.querySelectorAll('#mBtns button,#mBody button')].filter(b=>b.offsetParent);const alone=bs.find(b=>/no weakness/.test(b.textContent));ABT.push({t,n:bs.length,alone:!!alone,txt:(alone||bs[0]||{}).textContent});(alone||bs[0]).click();await new Promise(r=>setTimeout(r,150));continue}
      if(/Draft/.test(t)){if(!TITLES.includes(t))TITLES.push(t);const el=document.querySelector('#mBody .mk88 .lit')||document.querySelector('#pickgrid button');if(el)el.click()}
      else if(!document.querySelector('#mBody .mk88'))CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
    await new Promise(r=>setTimeout(r,100))}
  return {abt:ABT,pairs:S.players.map(p=>[p.pair102,p.wk102]),n:PICKS.length,hs:!!S.hotseat,by:[0,1,2,3].map(i=>PICKS.filter(x=>x.who===i).length),titles:TITLES.slice(0,4)}});
ok(E.hs&&E.n===20&&E.by.every(n=>n===5),'hot seat: every seat drafted 5 '+JSON.stringify(E));
ok(E.abt.length===2&&E.abt.every(x=>x.n===3),'hot seat: each human drafts an ability pair from 3 '+JSON.stringify(E.abt));
ok(E.pairs.every(x=>x[0]),'hot seat: every seat holds a pair '+JSON.stringify(E.pairs));
ok(E.abt.filter(x=>x.alone).every((x,k)=>E.pairs[k][1]==='none'),'a human who took an ability that comes alone has no weakness '+JSON.stringify([E.abt,E.pairs]));
ok(E.titles.some(t=>/Ann|Soldier|Player|pick 1/.test(t)),'hot seat: the draft window opened for the humans '+JSON.stringify(E.titles));
await pg.evaluate(()=>{S.over=true;CFG.hotseat=false;if(CUR_MODAL)CUR_MODAL.done(null)});
console.log(JSON.stringify({miss,A:A.picks.slice(0,6),E}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

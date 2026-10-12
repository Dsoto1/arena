/* v1.0 wave 5a (300-v100pn): Play Now in sandstone — the event CAROUSEL (click, ‹ ›, keyboard arrows + Enter → CFG.ev / #evSel), the rounds
   table, Follow the schedule (locks event + city, Unlock), 🎲 Random event, the count picker, the Stands card, Day/Night, Begin Event; the
   sandstone Play Now + Manager submenus (tablet, Back in the foot, the menu steps back); the Hot Seat on the same page (pass strip, players'
   book, PLAYER tags, the "your turn" ribbon in the match); the kill switch flavius_pn100off=1; 390 px without sideways scroll; no new 00c errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(w,h,ls)=>{const pg=await b.newPage({viewport:{width:w,height:h}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto('file://'+process.argv[2],{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}window.__e0=ERR92.n});return pg};
const until=async(pg,fn,ms=15000,arg)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}};
const closeAll=pg=>pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,250))}});
const newErr=async pg=>pg.evaluate(()=>errNew92(window.__e0).map(e=>e.msg||e.m||JSON.stringify(e).slice(0,160)));
let pg=await open(1440,900);
/* ---- 1 · the setup and the event row ---- */
await pg.evaluate(()=>{openSetup(true)});
ok(await until(pg,()=>document.querySelector('#mBody .pn100 .pn100car .pn100c.on')),'the Play Now page with the event row');
await pg.waitForTimeout(500);
const A=await pg.evaluate(()=>{const q=s=>document.querySelector('#mBody '+s);const trk=q('.pn100trk');const sel=q('.pn100c.on');const a=trk.getBoundingClientRect(),r=sel.getBoundingClientRect();
  const keys=[...document.getElementById('evSel').options].map(o=>o.value);
  return {n:document.querySelectorAll('#mBody .pn100c').length,keys:keys.length,on:sel.dataset.pnev,ev:CFG.ev,vis:r.left>=a.left-1&&r.right<=a.right+1,w:new Set([...document.querySelectorAll('#mBody .pn100c')].map(x=>Math.round(x.getBoundingClientRect().width))).size,
    rows:document.querySelectorAll('#mBody .pn100rounds .pn100rd:not(.hd)').length,want:EVENTS[CFG.ev].rounds.length,go:/Begin Event/.test(q('.pn-top #goBtn').textContent)&&q('#goBtn').classList.contains('sb100'),
    map:!!q('.pn100map #mapbox')&&!!q('.pn100map #locSel'),opt:!!q('.pn100opt .pn100optg #oMandata')&&!!q('.pn100opt #oSeed')&&!!q('.pn100opt .pn100follow [data-pn100follow]'),
    who:!!q('.pn-who .pn98cnt')&&!!q('.pn-who .stands92'),title:(q('.pn98h')||{}).textContent,cal:!q('.pn-cal [data-calgo]'),sel:!!document.getElementById('evSel')}});
ok(A.n===A.keys&&A.on===A.ev&&A.vis&&A.w===1,'event row: every event, one card size, the picked one in view '+JSON.stringify(A));
ok(A.rows===A.want&&A.rows>0,'rounds table, one row a round');
ok(A.go&&A.map&&A.opt&&A.who&&A.title==='Play Now'&&A.cal&&A.sel,'layout: Begin Event slab, map, options + follow, who, no Follow in the date chip '+JSON.stringify(A));
/* click a card */
const k1=await pg.evaluate(()=>{const c=[...document.querySelectorAll('#mBody .pn100c:not(.on)')].find(x=>x.dataset.pnev==='egidious')||document.querySelector('#mBody .pn100c:not(.on)');const k=c.dataset.pnev;c.click();return k});
ok(await until(pg,k=>CFG.ev===k&&document.getElementById('evSel').value===k&&document.querySelector('#mBody .pn100c.on').dataset.pnev===k,5000,k1),'a card click picks the event '+k1);
/* ‹ › scroll the row, they do not pick */
const st=await pg.evaluate(async()=>{const e0=CFG.ev,trk=document.querySelector('#mBody .pn100trk');trk.scrollLeft=0;const s0=trk.scrollLeft;document.querySelector('#mBody [data-pn100step="1"]').click();await new Promise(r=>setTimeout(r,700));const s1=trk.scrollLeft;
  document.querySelector('#mBody [data-pn100step="-1"]').click();await new Promise(r=>setTimeout(r,700));return {e0,e1:CFG.ev,s0,s1,s2:trk.scrollLeft,over:trk.scrollWidth>trk.clientWidth}});
ok(st.e1===st.e0&&(!st.over||(st.s1>st.s0&&st.s2<st.s1)),'‹ › scroll the row without picking '+JSON.stringify(st));
/* keyboard: arrows walk, Enter picks, the focus comes back to the picked card */
await pg.focus('#mBody .pn100c.on');await pg.keyboard.press('ArrowRight');await pg.keyboard.press('ArrowRight');
const kb=await pg.evaluate(()=>{const a=document.activeElement;return {k:a&&a.dataset&&a.dataset.pnev,ev:CFG.ev,tab:a&&a.tabIndex}});
ok(kb.k&&kb.k!==kb.ev&&kb.tab===0,'arrows move the focus, not the pick '+JSON.stringify(kb));
await pg.keyboard.press('Enter');
ok(await until(pg,k=>CFG.ev===k&&document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.pnev===k,5000,kb.k),'Enter picks it and the focus stays on it');
/* the count picker, the Stands card, Day / Night */
await pg.evaluate(()=>{const s=document.getElementById('evSel');s.value='familia';s.dispatchEvent(new Event('change',{bubbles:true}))});
await until(pg,()=>CFG.ev==='familia'&&document.querySelector('#mBody .pn98cnt [data-pn98n="6"]'));
await pg.click('#mBody .pn98cnt [data-pn98n="6"]');ok(await until(pg,()=>CFG.n===6),'the count picker still seats gladiators');
await pg.evaluate(()=>{const c=document.getElementById('oSpectMe');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}))});
ok(await until(pg,()=>CFG.seats.slice(0,CFG.n).every(s=>s.cpu)&&CFG.spectHuman),'Play as a spectator still turns every seat CPU');
await pg.evaluate(()=>{const c=document.getElementById('oSpectMe');c.checked=false;c.dispatchEvent(new Event('change',{bubbles:true}))});
await until(pg,()=>CFG.seats.slice(0,CFG.n).some(s=>!s.cpu));
await pg.click('#mBody [data-pn100night="night"]');ok(await pg.evaluate(()=>!!(CFG.opts&&CFG.opts.night)&&document.getElementById('oNight91').value==='night'),'Night button sets #oNight91');
await pg.click('#mBody [data-pn100night="day"]');
/* ---- Follow the schedule ---- */
await pg.click('#mBody .pn100follow [data-pn100follow="on"]');
const F=await pg.evaluate(()=>{const c=calNow();const q=s=>document.querySelector('#mBody '+s);return {on:CFG.follow100,ev:CFG.ev===c.fx.ev,loc:CFG.loc===c.fx.loc,bar:!!q('.pn100lockbar'),lk:document.querySelectorAll('#mBody .pn100c.lk').length,
  dis:q('#locSel').disabled,ml:!!q('.pn100maplock'),sw:q('.pn100follow [role=switch]').getAttribute('aria-checked')}});
ok(F.on&&F.ev&&F.loc&&F.bar&&F.lk>0&&F.dis&&F.ml&&F.sw==='true','Follow locks this week\'s event + city '+JSON.stringify(F));
const lockClick=await pg.evaluate(async()=>{const e0=CFG.ev;document.querySelector('#mBody .pn100c.lk').click();await new Promise(r=>setTimeout(r,300));return CFG.ev===e0});
ok(lockClick,'a locked card does nothing');
await pg.click('#mBody .pn100lockbar [data-pn100follow="off"]');
ok(await until(pg,()=>!CFG.follow100&&!document.querySelector('#mBody .pn100lockbar')&&!document.querySelector('#mBody .pn100c.lk')),'Unlock switches it off');
await pg.click('#mBody [data-pn100sched]');ok(await pg.evaluate(()=>{const p=document.querySelector('#mBody .pn100schedp');return !!p&&!p.hidden&&p.textContent.length>40}),'📅 Season schedule opens in place');
/* 🎲 Random event turns Follow off */
await pg.click('#mBody .pn100follow [data-pn100follow="on"]');await until(pg,()=>CFG.follow100);
const rnd=await pg.evaluate(async()=>{const e0=CFG.ev;document.querySelector('#mBody [data-pnrand90]').click();await new Promise(r=>setTimeout(r,400));return {ch:CFG.ev!==e0,f:CFG.follow100,bar:!!document.querySelector('#mBody .pn100lockbar')}});
ok(rnd.ch&&!rnd.f&&!rnd.bar,'🎲 Random event rolls and unlocks '+JSON.stringify(rnd));
/* Begin Event */
await pg.evaluate(()=>{const s=document.getElementById('evSel');s.value='democritus';s.dispatchEvent(new Event('change',{bubbles:true}))});await until(pg,()=>CFG.ev==='democritus');
await pg.evaluate(()=>{window.__S0=typeof S!=='undefined'?S:null});await pg.click('#mBody .pn-top #goBtn');
ok(await until(pg,()=>typeof S!=='undefined'&&S&&S!==window.__S0&&S.evKey==='democritus'&&S.players&&S.players.length===4,20000),'Begin Event starts the event');
/* ---- 3 · the sandstone submenus ---- */
await closeAll(pg);await pg.evaluate(()=>{if(S)S.over=true;menuShow()});await pg.waitForTimeout(500);
await pg.evaluate(()=>{playNowMenu()});await until(pg,()=>document.getElementById('modal').classList.contains('sand100'));await pg.waitForTimeout(400);
const M=await pg.evaluate(()=>{const bt=[...document.querySelectorAll('#mBtns button')];const pri=document.querySelector('#mBtns .sb100.pri');const back=document.querySelector('#mboxEl .sand100ft .sb100');
  const mm=getComputedStyle(document.getElementById('mainMenu'));
  return {pri:pri&&/New event/.test(pri.textContent),pngl:bt.some(x=>/Your Play Now Gladiators/.test(x.textContent)),back:back&&/Back/.test(back.textContent),sub:document.body.classList.contains('sub100'),
    tr:mm.transform!=='none'||/brightness/.test(mm.filter),title:document.getElementById('mTitle').textContent.trim(),cov:typeof MM100!=='undefined'?MM100.cov:null}});
ok(M.pri&&M.pngl&&M.back&&M.sub&&M.tr&&/Play Now/.test(M.title),'Play Now submenu = sandstone tablet, menu steps back '+JSON.stringify(M));
await pg.click('#mboxEl .sand100ft .sb100');
ok(await until(pg,()=>document.getElementById('modal').hidden&&!document.body.classList.contains('sub100')&&!document.getElementById('modal').classList.contains('sand100'),5000),'Back closes it, the menu comes forward');
await pg.evaluate(async()=>{await Store.put('mgrCareers','tv100pn',{id:'tv100pn',ludus:'Ludus Testus',name:'Marcus',season:1,week:3,updated:'today'});managerMenu()});
ok(await until(pg,()=>document.getElementById('modal').classList.contains('sand100')&&/Continue/.test((document.querySelector('#mBtns .sb100.pri')||{}).textContent||''),8000),'Manager submenu: sandstone, Continue is the porphyry slab');
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(x=>/New career/.test(x.textContent));return !!b});
await closeAll(pg);await until(pg,()=>!document.body.classList.contains('sub100'),3000);
await pg.evaluate(()=>{playNowMenu()});await until(pg,()=>document.getElementById('modal').classList.contains('sand100'));
await pg.evaluate(()=>{document.querySelector('#mBtns .sb100.pri').click()});
ok(await until(pg,()=>!!document.querySelector('#mBody .pn100')&&!document.getElementById('modal').classList.contains('sand100'),10000),'New event opens Play Now (no sandstone left on the window)');
/* ---- 2 · the hot seat ---- */
await closeAll(pg);await pg.evaluate(()=>{hotSeatOpen()});
ok(await until(pg,()=>document.querySelector('#mBody .pn100.pn100hs .pn100pass')),'Hot Seat on the Play Now page');
const H=await pg.evaluate(()=>{const q=s=>document.querySelector('#mBody '+s);return {t:(q('.pn98h')||{}).textContent,flag:!!q('.pn100flag'),tabs:!q('.pn-tabs [data-mode]'),book:!!q('.pn100prof .hsbanner'),names:document.querySelectorAll('#mBody [data-hsn]').length,
  tags:document.querySelectorAll('#mBody .pn100tag.hum').length,car:!!q('.pn100car'),hst:!!q('[data-pn100hst]'),me:!q('.stands92 .st92me')}});
ok(H.t==='Hot Seat'&&H.flag&&H.tabs&&H.book&&H.names===4&&H.tags===4&&H.car&&H.hst&&H.me,'hot seat: title, pass strip, book, names, tags '+JSON.stringify(H));
const hs0=await pg.evaluate(()=>!!SETTINGS.hsTurn90);await pg.click('#mBody [data-pn100hst]');ok(await pg.evaluate(v=>!!SETTINGS.hsTurn90!==v,hs0),'Turn the board switch = SETTINGS.hsTurn90');
await pg.click('#mBody [data-pn100hst]');
const keep=await pg.evaluate(async()=>{const h0=CFG.seats.slice(0,4).map(s=>s.cpu);document.querySelector('#mBody [data-pnrand90]').click();await new Promise(r=>setTimeout(r,500));return {same:CFG.seats.slice(0,CFG.n).every((s,i)=>i>=4||s.cpu===h0[i]),hot:!!document.querySelector('#mBody .pn100hs')}});
ok(keep.same&&keep.hot,'🎲 in the hot seat keeps who plays '+JSON.stringify(keep));
await pg.evaluate(async()=>{const s=document.getElementById('evSel');s.value='democritus';s.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,300));
  CFG.seats.forEach((x,i)=>{x.cpu=i>=2});pnRedraw75()});
await until(pg,()=>document.querySelectorAll('#mBody [data-hsn]').length===2);
const ins=await pg.$$('#mBody [data-hsn]');await ins[0].fill('Ann');await ins[1].fill('Bo');
await pg.evaluate(()=>{SPEED='fast'});await pg.click('#mBody #goBtn');
let rib=false;for(let i=0;i<60&&!rib;i++){await pg.waitForTimeout(250);rib=await pg.evaluate(()=>{const r=document.getElementById('hs100rib');if(r&&r.classList.contains('show'))return true;
  if(CUR_MODAL){const bt=document.querySelector('#mBtns button:not([disabled])');if(bt)bt.click()}return false})}
ok(rib,'the "your turn" ribbon over the top bar');
const RB=await pg.evaluate(()=>{const r=document.getElementById('hs100rib');const bar=document.querySelector('header.bar');return r?{inBar:r.parentElement===bar,txt:r.textContent}:{}});
ok(RB.inBar&&/your turn/.test(RB.txt||''),'ribbon in header.bar '+JSON.stringify(RB));
ok(await until(pg,()=>!document.getElementById('hs100rib').classList.contains('show'),4000),'the ribbon leaves after ~1.5 s');
const E1=await newErr(pg);ok(!E1.length,'no new 00c errors '+JSON.stringify(E1));
await pg.close();
/* ---- the kill switch ---- */
pg=await open(1440,900,{flavius_pn100off:'1'});
await pg.evaluate(()=>{openSetup(true)});await until(pg,()=>document.querySelector('#mBody .pn98'));
const K=await pg.evaluate(()=>({p100:!!document.querySelector('#mBody .pn100'),strip:!!document.querySelector('#mBody .pn-strip'),bands:!!document.querySelector('#mBody .pn-bands')}));
ok(!K.p100&&K.strip&&K.bands,'kill switch: 247\'s layout '+JSON.stringify(K));
await closeAll(pg);await pg.evaluate(()=>{playNowMenu()});await until(pg,()=>!document.getElementById('modal').hidden);await pg.waitForTimeout(300);
ok(await pg.evaluate(()=>!document.getElementById('modal').classList.contains('sand100')&&!document.body.classList.contains('sub100')),'kill switch: plain submenu');
await pg.close();
/* ---- phones: 390 px ---- */
pg=await open(390,844);
await pg.evaluate(()=>{openSetup(true)});await until(pg,()=>document.querySelector('#mBody .pn100 .pn100c.on'));await pg.waitForTimeout(500);
const P=await pg.evaluate(()=>{const m=document.getElementById('mBody');const go=document.getElementById('goBtn').getBoundingClientRect();
  return {doc:document.documentElement.scrollWidth<=innerWidth+1,body:m.scrollWidth<=m.clientWidth+1,go:go.right<=innerWidth+1&&go.width>150}});
ok(P.doc&&P.body&&P.go,'390: no sideways scroll, Begin Event fits '+JSON.stringify(P));
await closeAll(pg);await pg.evaluate(()=>{playNowMenu()});await until(pg,()=>document.getElementById('modal').classList.contains('sand100'));await pg.waitForTimeout(500);
const PS=await pg.evaluate(()=>{const r=document.getElementById('mboxEl').getBoundingClientRect();return {bottom:Math.round(r.bottom),h:innerHeight,top:Math.round(r.top),grab:!!document.querySelector('#mboxEl .grab100')}});
ok(Math.abs(PS.bottom-PS.h)<=2&&PS.top>100&&PS.grab,'390: the submenu is a bottom sheet '+JSON.stringify(PS));
const E2=await newErr(pg);ok(!E2.length,'no new 00c errors (390) '+JSON.stringify(E2));
await b.close();
console.log(miss.length?'MISSING '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})();

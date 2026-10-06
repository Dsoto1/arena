/* v0.91 cards and tokens you can take back (199-v91items): an elixir at full health stays in hand; the elixir window has Cancel (kept),
   Confirm stays dark until the points are placed, a confirmed elixir heals and is used up; the AP Upgrade window shows the armor piece
   and can be cancelled; a free market token closed without a pick stays in hand. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:['hero','soldier','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<60;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>6)break}SPEED='pause'});
const W=ms=>pg.waitForTimeout(ms);
const P=()=>pg.evaluate(()=>{const p=S.players[0];return {hp:{...p.hp},n:p.items.length}});
/* 1 full health: the elixir stays */
const r1=await pg.evaluate(async()=>{const p=S.players[0];for(const l of LOCS)p.hp[l]=7;const it=mkCard('elixir2');p.items.push(it);const pr=useItem(p,it);
  await new Promise(r=>setTimeout(r,300));if(CUR_MODAL)CUR_MODAL.done(1);const r=await pr;return {r,kept:p.items.includes(it)}});
ok(r1.r===false&&r1.kept,'1 at full health the elixir stays in hand');
/* 2 cancel */
await pg.evaluate(()=>{const p=S.players[0];p.hp.chest=3;p.hp.head=4;window.__it=mkCard('elixir2');p.items.push(window.__it);window.__pr=useItem(p,window.__it)});
await pg.waitForFunction(()=>CUR_MODAL&&/Distribute/.test(document.querySelector('#mTitle').textContent),null,{timeout:20000});await W(200);
const dis=await pg.evaluate(()=>document.querySelector('#mBtns [data-mi="1"]').disabled);ok(dis,'2 Confirm is dark before any point is placed');
const hasCancel=await pg.evaluate(()=>[...document.querySelectorAll('#mBtns button')].some(b=>/Cancel/.test(b.textContent)));ok(hasCancel,'3 the elixir window has Cancel');
await pg.evaluate(()=>([...document.querySelectorAll('#mBtns button')].find(b=>/Cancel/.test(b.textContent))||document.querySelector('#mClose')).click());
const r2=await pg.evaluate(async()=>{const r=await window.__pr;const p=S.players[0];return {r,kept:p.items.includes(window.__it),chest:p.hp.chest}});
ok(r2.r===false&&r2.kept&&r2.chest===3,'4 Cancel keeps the elixir and heals nothing');
/* 3 place the points and confirm */
await pg.evaluate(()=>{window.__pr=useItem(S.players[0],window.__it)});await pg.waitForFunction(()=>CUR_MODAL&&/Distribute/.test(document.querySelector('#mTitle').textContent),null,{timeout:20000});await W(200);
await pg.evaluate(()=>{document.querySelector('[data-d="+"][data-l="chest"]').click()});await W(80);
const half=await pg.evaluate(()=>document.querySelector('#mBtns [data-mi="1"]').disabled);
await pg.evaluate(()=>{document.querySelector('[data-d="+"][data-l="chest"]').click()});await W(80);
const full=await pg.evaluate(()=>document.querySelector('#mBtns [data-mi="1"]').disabled);ok(half&&!full,'5 Confirm lights once both points are placed');
await pg.evaluate(()=>document.querySelector('#mBtns [data-mi="1"]').click());
const r3=await pg.evaluate(async()=>{const r=await window.__pr;const p=S.players[0];return {r,kept:p.items.includes(window.__it),chest:p.hp.chest}});
ok(r3.r===true&&!r3.kept&&r3.chest===5,'6 a confirmed elixir heals and is used up');
/* 4 AP upgrade window shows the piece, cancel keeps the token */
await pg.evaluate(()=>{const p=S.players[0];const l=LOCS.find(x=>p.ap[x]>0&&p.ap[x]<7);window.__apl=l;window.__ap0=p.ap[l];window.__tok={kind:'offer',key:'ap2',id:9991};p.items.push(window.__tok);window.__pr=useItem(p,window.__tok)});
await W(800);await pg.waitForSelector('#mBtns button');await W(250);
const ap=await pg.evaluate(()=>({cards:document.querySelectorAll('#mBtns .apu91').length}));
await pg.screenshot({path:'/tmp/claude-0/x91/apup91.png'});
await pg.evaluate(()=>([...document.querySelectorAll('#mBtns button')].find(b=>/Cancel/.test(b.textContent))||document.querySelector('#mClose')).click());
const r4=await pg.evaluate(async()=>{const r=await window.__pr;const p=S.players[0];return {r,kept:p.items.includes(window.__tok),ap:p.ap[window.__apl]===window.__ap0}});
ok(ap.cards>0,'7 the AP Upgrade window shows the armor art');ok(r4.r===false&&r4.kept&&r4.ap,'8 Cancel keeps the AP token');
/* 5 free market token closed without a pick */
await pg.evaluate(()=>{const p=S.players[0];window.__w0=JSON.stringify([p.wR&&p.wR.key,p.wL&&p.wL.key,(p.pile||[]).length]);window.__mt={kind:'offer',key:'mw1',id:9992};p.items.push(window.__mt);window.__pr=useItem(p,window.__mt)});await W(1200);
await pg.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,300))}});
const r5=await Promise.race([pg.evaluate(async()=>{const w0=window.__w0;const r=await window.__pr;const p=S.players[0];return {r,kept:p.items.includes(window.__mt),gained:JSON.stringify([p.wR&&p.wR.key,p.wL&&p.wL.key,(p.pile||[]).length])!==w0||(S.piles||[]).some(x=>x.owner===p.id)}}),new Promise(r=>setTimeout(()=>r({timeout:1}),8000))]);
ok((r5.r===false&&r5.kept)||(r5.r===true&&r5.gained),'9 a free market token is never used up for nothing '+JSON.stringify(r5));
console.log(JSON.stringify({r1,r2,r3,ap,r4,r5}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

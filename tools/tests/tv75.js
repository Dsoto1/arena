/* v0.75: the ratings fold toggles on the press (a board redraw between press and release no longer swallows it); his weapon icons;
   Ornate Chest (Royalty) + single Flavius' Greave; minis replace standees, shorter pillar; one-row top bar with the event pop-up and
   the turn panel; one crowd count (1 spectator = 1K); the market to the rulebook on his board; the Play Now layout */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true}],opts:{spect:4}});await W8(2500);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(150)}render();await W8(300)});
const box=async()=>{const r=await pg.locator('#board .ratfold').boundingBox();return r&&{x:r.x+r.width/2,y:r.y+r.height/2}};
const shut=()=>pg.evaluate(()=>RAT_SHUT);
/* press → the board is rebuilt → release */
let s0=await shut();let p=await box();await pg.mouse.move(p.x,p.y);await pg.mouse.down();await pg.evaluate(()=>{render();render()});await pg.mouse.up();await pg.waitForTimeout(200);
o.redraw=(await shut())!==s0;
/* a plain click toggles exactly once */
s0=await shut();p=await box();await pg.mouse.click(p.x,p.y);await pg.waitForTimeout(200);o.once=(await shut())!==s0;
/* the keyboard */
s0=await shut();await pg.focus('#board .ratfold');await pg.keyboard.press('Enter');await pg.waitForTimeout(200);o.key=(await shut())!==s0;
o.view=await pg.evaluate(()=>document.querySelector('#board .statrow').classList.contains('shut')===RAT_SHUT);
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};
  r.ico=/data:image\/webp/.test(CW_ICO.dmg())&&/data:image\/webp/.test(cwIcoSVG('rng'));r.wsIco=!!document.querySelector('#board .ws75 img');
  r.ornate=CLASSES.royalty.armor.some(a=>a[0]==='ornate')&&ARM.ornate.ap===4&&ARM.greaves.img===43&&ARM.greaves.thumb===24;
  r.pillar=typeof MINI_PILLAR75==='number'&&MINI_PILLAR75<1;
  r.top=!document.getElementById('calChip')&&!!document.querySelector('#status .evchip75')&&!!document.querySelector('#navDrawer #btnEvInfo')&&!document.querySelector('#status .rulechip');
  r.panel=/PvP/.test((document.querySelector('#turnInd .tprules')||{}).textContent||'');
  r.crowd=houseCount(13)===13000&&/K/.test(document.getElementById('btnDrawB').textContent);
  const A=S.market.a[1];r.piles=Array.isArray(A.piles)&&A.piles.length===4&&A.deck.length===0&&A.slots.length===A.piles.flat().length;
  const n0=A.piles.flat().length;const k=await marketRoll(S.players[1],'a',1,{free:1});r.free=!!ARM[k]&&A.piles.flat().length===n0-1;
  const v=A.slots[0];A.slots[0]=null;r.view=A.piles.flat().length===n0-2&&!A.piles.flat().includes(v)||A.piles.flat().filter(x=>x===v).length<1+0;
  return r});
await pg.hover('#status .evchip75');await pg.waitForTimeout(500);o.pop=await pg.evaluate(()=>{const p=document.getElementById('evPop75');return !!p&&!p.hidden&&!!p.querySelector('.evp-frame img')&&/Board \d+×\d+/.test(p.textContent)});
await pg.mouse.move(5,600);
o.m=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=S.players[0];p.coin=30;p.cf=10;p.market=true;openMarket(p);await W8(600);
  const r={cells:document.querySelectorAll('#mBody .mboard75 .mb-cell').length,buy:[...document.querySelectorAll('#mBtns button')].some(b=>/Buy at level 2/.test(b.textContent))};CUR_MODAL.done('close');await W8(300);
  S.over=true;return r});
o.s=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);openSetup(true);await W8(1500);const r={};
  r.layout=!!document.querySelector('#mBody .pn75')&&document.querySelectorAll('#mBody .pn-ev').length>=12&&/4 PLAYERS/.test(document.querySelector('#mBody .pn-badge').textContent);
  document.querySelector('#mBody [data-pnev="familia"]').click();await W8(500);r.pick=CFG.ev==='familia'&&!!document.querySelector('#mBody .pn-ev.on[data-pnev="familia"]');
  r.seats=document.querySelectorAll('#mBody .pn-who .seat').length===CFG.n&&!!document.querySelector('#mBody .pn-start #goBtn');
  localStorage.removeItem('flavius_pnpresets');document.querySelector('#mBody [data-pnpre]').click();await W8(200);document.querySelector('#mBody [data-pnsave]').click();await W8(300);
  r.preset=JSON.parse(localStorage.getItem('flavius_pnpresets')||'[]').length===1;return r});
ok(o.redraw,'toggles through a redraw');ok(o.once,'one click = one toggle');ok(o.key,'keyboard');ok(o.view,'drawer follows the state');const A=o.a,M=o.m,P=o.s;ok(A.ico,'his weapon icons');ok(A.ornate,'Ornate chest + single greave');ok(A.pillar,'shorter pillar');
ok(A.top&&o.pop,'top bar + event pop-up');ok(A.panel,'turn panel rules');ok(A.crowd,'one crowd count');ok(A.piles&&A.free,'armor dealt across 4 slots');
ok(M.cells===24&&M.buy,'market board');ok(P.layout&&P.pick&&P.seats&&P.preset,'Play Now layout');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

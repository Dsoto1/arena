/* v0.92 market (208-v92zoom): unlocking from the Crowd Favor window opens the market at once; the market offers only the levels you can
   pay for (5 coin → level 1 only; 1 coin → "Not enough coin for any level"); hovering armor in it shows the try-on avatar, not the card tooltip. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'egidious',loc:0,seats:['royalty','soldier','hero','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{}});
  for(let i=0;i<120;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&cur()===S.players[0]&&i>6)break}SPEED='pause'});
/* 1 · unlock in the Crowd Favor window → the market opens */
const A=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const p=cur();p.cf=9;p.coin=5;p.market=false;openCrowd(p);
  for(let i=0;i<30&&!document.querySelector('#modal [data-v="mk"],#modal [data-pick="mk"],#pickgrid [data-value="mk"]');i++)await W8(100);
  const t=[...document.querySelectorAll('#modal button,#modal [role=button],#pickgrid *')].find(x=>/Unlock market/.test(x.textContent)&&!x.disabled);if(t)t.click();
  for(let i=0;i<30&&!(CUR_MODAL&&/Market of Flavius/.test((document.getElementById('mTitle')||{}).textContent||''));i++)await W8(100);
  const title=(document.getElementById('mTitle')||{}).textContent||'';const buys=[...document.querySelectorAll('#mBtns button')].map(x=>x.textContent.trim());
  return {clicked:!!t,open:p.market,title,buys}});
ok(A.clicked&&A.open&&/Market of Flavius/.test(A.title),'1 unlocking from Crowd Favor opens the market '+JSON.stringify(A));
ok(A.buys.some(t=>/level 1/.test(t))&&!A.buys.some(t=>/level 2|level 3/.test(t)),'1 5 coin: only level 1 is offered '+JSON.stringify(A.buys));
/* 2 · hover armor → try-on avatar only */
const el=await pg.$('#modal [data-card^="a:"]');if(el){await el.hover();await pg.waitForTimeout(700)}
const H=await pg.evaluate(()=>{const t=document.getElementById('tip'),o=document.getElementById('tryOn');return {tip:!!t&&!t.hidden&&getComputedStyle(t).display!=='none',tryOn:!!o&&!o.hidden}});
ok(!el||(H.tryOn&&!H.tip),'2 hovering armor shows only the try-on avatar '+JSON.stringify(H));
/* 3 · 1 coin → nothing to buy */
const C=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));CUR_MODAL&&CUR_MODAL.done('close');await W8(300);const p=cur();p.coin=1;openMarket(p);await W8(500);
  const buys=[...document.querySelectorAll('#mBtns button')].map(x=>x.textContent.trim());CUR_MODAL&&CUR_MODAL.done('close');return buys});
ok(C.some(t=>/Not enough coin/.test(t))&&!C.some(t=>/Buy at level/.test(t)),'3 1 coin: no level offered '+JSON.stringify(C));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

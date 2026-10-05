/* v0.89 178-v89mkt: while Commodus is in the arena the market's Unlock / Buy buttons are disabled and say why; a free pick
   ("a level N weapon / armor") is chosen outright — no d4 — and does not use up Market Choice. */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const p=await b.newPage({viewport:{width:1300,height:900}});await p.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+path.resolve(process.argv[2]));await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const o=await p.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));menuHide();
  const seats=[{cls:'soldier',cpu:false},{cls:'hero',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}];SPEED='pause';
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts}});await W(2500);for(let i=0;i<8&&CUR_MODAL;i++){CUR_MODAL.done(null);await W(300)}
  const pl=S.players[0];pl.cf=20;pl.coin=40;const r={};
  /* before Commodus: unlock enabled */
  const peek=async()=>{const pr=openMarket(pl);await W(700);const bs=[...document.querySelectorAll('#modal button')].map(b=>({t:b.textContent.replace(/\s+/g,' ').trim(),dis:b.disabled||b.classList.contains('disabled')||b.getAttribute('aria-disabled')==='true'}));if(CUR_MODAL)CUR_MODAL.done('close');await pr;await W(200);return bs};
  r.before=(await peek()).find(x=>/Unlock market/.test(x.t));
  S.npcs.push({id:'cmX',t:'commodus',n:'Commodus',alive:true,hp:15,r:0,c:0});
  r.after=(await peek()).find(x=>/Unlock market/.test(x.t));pl.market=true;r.buy=(await peek()).filter(x=>/Buy at level/.test(x.t));
  /* free pick: no d4 (rnd not called), Market Choice kept */
  pl.mchoice=false;pl.cpu=true;const k=await marketRoll(pl,'w',1);const rolls=[...document.querySelectorAll('#log li')].slice(0,6).filter(l=>/market die/.test(l.textContent)).length;pl.cpu=false;r.free={k,rolls,mch:pl.mchoice,log:[...document.querySelectorAll('#log li')].slice(0,8).map(l=>l.textContent).join(' | ')};
  return r});
ok(o.before&&!o.before.dis,'unlock enabled before Commodus '+JSON.stringify(o.before));
ok(o.after&&o.after.dis&&/Commodus/.test(o.after.t),'unlock disabled + says Commodus '+JSON.stringify(o.after));
ok(o.buy.length===3&&o.buy.every(x=>x.dis),'buys disabled while he is in');
ok(o.free.k&&o.free.rolls===0&&o.free.mch===false&&/chooses outright/.test(o.free.log)&&!/Market Choice/.test(o.free.log),'free pick chosen outright, no d4 '+JSON.stringify(o.free));
console.log(JSON.stringify(o).slice(0,600));console.log('ERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));await b.close();process.exit(errs.length||miss.length?1:0)})();

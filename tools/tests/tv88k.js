/* v0.88 one market window: the roll show on his board (lit slot, d4, skip on tap), lit pieces take the item, the info panel,
   Market Choice by slot, chooseMarket on the board, the draft spread with a CPU peek. SHOTS=dir saves mk88_*.png. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const shots=process.env.SHOTS||'';
const W8=ms=>pg.waitForTimeout(ms);
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  for(let i=0;i<40;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100))}SPEED='pause'});
/* 1. ROLL: a purchase at level 1 */
await pg.evaluate(()=>{const p=S.players[0];p.coin=40;window._r88=null;marketBuy75(p,1).then(r=>window._r88=r)});
await W8(250);
const roll=await pg.evaluate(()=>({die:!!document.querySelector('#mBody .mk88die'),hop:document.querySelectorAll('#mBody .mb-cell.hop').length,title:document.getElementById('mTitle').textContent}));
ok(roll.die&&roll.hop>=1,'roll show: die + hopping slot '+JSON.stringify(roll));
await pg.click('#mBody .mboard75');await W8(500); /* a tap skips the show */
const lit=await pg.evaluate(()=>{const L=[...document.querySelectorAll('#mBody .mboard75 .lit')];const lv=L.map(x=>x.closest('.mb-cell').dataset.lv);
  return {n:L.length,lv1:lv.every(v=>v==='1'),mi:L.every(x=>x.dataset.mi!=null),done:!!document.querySelector('#mBody .mk88die.done'),info:(document.querySelector('#mBody .mk88info')||{}).textContent||'',
    reroll:[...document.querySelectorAll('#mBtns button')].some(x=>/Re-roll/.test(x.textContent)&&x.offsetParent),hiddenOpts:[...document.querySelectorAll('#mBtns button')].filter(x=>!x.offsetParent).length}});
ok(lit.n>=1&&lit.lv1&&lit.mi&&lit.done,'lit pieces in the level 1 row '+JSON.stringify(lit));
ok(/level 1/i.test(lit.info)&&/(Fits|replaces|Replaces|Nowhere|face-down)/.test(lit.info),'info panel shows the piece + fit '+lit.info.slice(0,120));
ok(lit.reroll&&lit.hiddenOpts>=1,'re-roll button visible, option buttons hidden');
if(shots)await pg.screenshot({path:shots+'/mk88_roll.png'});
/* hover another lit piece → the panel follows */
await pg.evaluate(()=>{const L=[...document.querySelectorAll('#mBody .mboard75 .lit')];const el=L[L.length-1];el.dispatchEvent(new PointerEvent('pointerover',{bubbles:true}))});
const pick=await pg.evaluate(async()=>{const el=document.querySelector('#mBody .mboard75 .lit');const ref=el.dataset.k88;el.click();for(let i=0;i<30&&!window._r88;i++)await new Promise(r=>setTimeout(r,100));
  const r=window._r88;const still=r&&r.key?(r.kind==='w'?[...S.market.w[1].slots,...S.market.w[1].deck]:S.market.a[1].piles.flat()).filter(k=>k===r.key).length:-1;return {ref,r,still}});
ok(pick.r&&pick.r.key&&(pick.ref==='back:1'||pick.ref.slice(2)===pick.r.key),'clicking the lit piece takes it '+JSON.stringify(pick));
/* 2. Market Choice: click a slot */
await pg.evaluate(()=>{const p=S.players[0];p.mchoice=true;window._r88=null;marketBuy75(p,2).then(r=>window._r88=r)});await W8(400);
const mc=await pg.evaluate(async()=>{const cells=[...document.querySelectorAll('#mBody .mb-cell.lit[data-lv="2"]')];const c=cells.find(x=>x.dataset.side==='a'&&x.querySelector('.mb-a'))||cells[0];const n=cells.length;c.click();
  for(let i=0;i<30;i++){if(window._r88)break;if(CUR_MODAL&&!document.querySelector('#mBody .cells88')){const l=document.querySelector('#mBody .lit');if(l)l.click();else CUR_MODAL.done(0)}await new Promise(r=>setTimeout(r,120))}S.players[0].mchoice=false;return {n,r:window._r88}});
ok(mc.n===8&&mc.r&&mc.r.key,'Market Choice: 8 lit slots, one click takes '+JSON.stringify(mc));
/* 3. chooseMarket on the board */
await pg.evaluate(()=>{window._c88=0;chooseMarket(S.players[0],'w',2).then(()=>window._c88=1)});await W8(400);
const cm=await pg.evaluate(async()=>{const L=[...document.querySelectorAll('#mBody .mk88 .lit')];const strip=document.querySelectorAll('#mBody .mk88strip .lit').length;
  const before=S.market.w[2].slots.filter(Boolean).length+S.market.w[2].deck.length;const tgt=L[0];tgt.click();
  for(let i=0;i<30&&!window._c88;i++){if(CUR_MODAL&&!document.querySelector('#mBody .mk88'))CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:'drop');await new Promise(r=>setTimeout(r,120))}
  const after=S.market.w[2].slots.filter(Boolean).length+S.market.w[2].deck.length;return {n:L.length,strip,before,after}});
ok(cm.n>=3&&cm.strip>=1&&cm.after===cm.before-1,'chooseMarket: weapons lit incl. the face-down pile, one taken '+JSON.stringify(cm));
/* 4. a CPU purchase peek on Normal */
await pg.evaluate(()=>{SPEED='normal';window._p88=0;marketBuy75(S.players[1],1).then(()=>window._p88=1)});await W8(500);
const pk=await pg.evaluate(()=>({peek:!!document.getElementById('mk88peek'),lit:!!document.querySelector('#mk88peek .lit'),h:(document.querySelector('#mk88peek .pk88h')||{}).textContent||''}));
if(shots)await pg.screenshot({path:shots+'/mk88_peek.png'});
await W8(1200);const pdone=await pg.evaluate(()=>window._p88&&!document.getElementById('mk88peek'));
ok(pk.peek&&pk.lit&&pdone,'CPU peek shows and ends '+JSON.stringify(pk));
await pg.evaluate(()=>{SPEED='fast';window._p88=0;marketBuy75(S.players[2],1).then(()=>window._p88=1)});await W8(150);
ok(await pg.evaluate(()=>window._p88===1&&!document.getElementById('mk88peek')),'no peek on Fast');
/* 5. the draft (Ludus): the spread board with the offers lit; a pick closes it */
await pg.evaluate(async()=>{SPEED='normal';if(CUR_MODAL)CUR_MODAL.done(null);S.over=true;await new Promise(r=>setTimeout(r,300));
  startEvent({ev:'ludus',seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true}],opts:{spect:0}})});
let dr=null;for(let i=0;i<60;i++){await W8(200);dr=await pg.evaluate(()=>{const m=document.querySelector('#mBody .mk88');if(!m||!CUR_MODAL)return null;return {lit:m.querySelectorAll('.mboard75 .lit').length+m.querySelectorAll('.x88 .lit').length,sp:m.querySelectorAll('.sp88').length,t:document.getElementById('mTitle').textContent}});
  if(dr&&/Draft/.test(dr.t))break;await pg.evaluate(()=>{if(CUR_MODAL&&!document.querySelector('#mBody .mk88'))CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)})}
ok(dr&&dr.lit>=1&&dr.sp===12,'draft: spread board, offers lit '+JSON.stringify(dr));
if(shots)await pg.screenshot({path:shots+'/mk88_draft.png'});
const dp=await pg.evaluate(async()=>{const el=document.querySelector('#mBody .mk88 .lit');const ref=el.dataset.k88;const p=S.players[0];const nW=['R','L'].filter(a=>p['w'+a]).length,nA=Object.values(p.pieces).flat().length;el.click();
  await new Promise(r=>setTimeout(r,400));for(let i=0;i<10;i++){if(CUR_MODAL&&!document.querySelector('#mBody .mk88'))CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100))}
  return {ref,got:['R','L'].filter(a=>p['w'+a]).length+Object.values(p.pieces).flat().length>nW+nA}});
ok(dp.got,'draft pick lands on the gladiator '+JSON.stringify(dp));
/* phones: the window fits 390 wide */
await pg.setViewportSize({width:390,height:844});await W8(300);
const ph=await pg.evaluate(()=>{const m=document.querySelector('#mBody .mk88');if(!m)return 'none';return document.documentElement.scrollWidth<=392&&m.getBoundingClientRect().width<=390});
ok(ph===true||ph==='none','390 px: no sideways scroll '+ph);
console.log(JSON.stringify({miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

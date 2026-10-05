/* v0.89 K 179-v89market: the market without the d4 — a purchase lights the level's row (the rest dimmed), take any weapon or one armor
   piece, no die/no re-roll; slot 4 is face up and the next card flips after a take; the Choose card = one free weapon of any level
   (all three rows lit); the draft lights every fitting piece; CPU buys pick outright; values go through modal (lit pieces carry data-mi).
   SHOTS=dir saves v89K_*.png. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const shots=process.env.SHOTS||'';const W8=ms=>pg.waitForTimeout(ms);
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  for(let i=0;i<40;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100))}SPEED='pause'});
const logs=()=>pg.evaluate(()=>[...document.querySelectorAll('#log li')].map(l=>l.textContent).join(' | '));
/* 1. a purchase at level 2: the row lit, the rest dimmed, no die */
await pg.evaluate(()=>{const p=S.players[0];p.coin=40;window._r=null;marketBuy75(p,2).then(r=>window._r=r)});await W8(500);
const buy=await pg.evaluate(()=>{const m=document.querySelector('#mBody .mk88');if(!m)return null;const L=[...m.querySelectorAll('.mboard75 .lit')];
  const hidden=[...document.querySelectorAll('#mBtns button')];
  return {n:L.length,want:rowOpts89([2],['w','a']).length,lv2:L.every(x=>x.closest('.mb-cell').dataset.lv==='2'),
    miOK:L.every(x=>{const b=document.querySelector(`#mBtns button[data-mi="${x.dataset.mi}"]`);return b&&!b.offsetParent}),
    dim:m.querySelectorAll('.mb-cell.dim89').length,band:!!m.querySelector('.band89'),die:!!m.querySelector('.mk88die'),
    reroll:hidden.some(x=>/Re-roll/.test(x.textContent)),title:document.getElementById('mTitle').textContent,info:(m.querySelector('.mk88info')||{}).textContent||''}});
ok(buy&&buy.n===buy.want&&buy.n>=4&&buy.lv2&&buy.miOK,'level 2 row: every piece lit, hidden buttons behind them '+JSON.stringify(buy));
ok(buy&&buy.dim===16&&buy.band&&!buy.die&&!buy.reroll,'other rows dimmed, band on the row, no die, no re-roll '+JSON.stringify(buy));
if(shots)await pg.screenshot({path:shots+'/v89K_buy.png'});
const tk=await pg.evaluate(async()=>{const el=document.querySelector('#mBody .mboard75 .mb-a.lit');const ref=el.dataset.k88;const n0=S.market.a[2].piles.flat().length;el.click();
  for(let i=0;i<30&&!window._r;i++)await new Promise(r=>setTimeout(r,100));return {ref,r:window._r,n0,n1:S.market.a[2].piles.flat().length}});
ok(tk.r&&tk.r.kind==='a'&&'a:'+tk.r.key===tk.ref&&tk.n1===tk.n0-1,'one armor piece taken '+JSON.stringify(tk));
let L=await logs();ok(!/market die|re-roll|rolls the market/i.test(L),'no die / re-roll in the log');ok(/from the level 2 row/.test(L),'log names the take');
/* 2. slot 4 face up; taking it flips the next */
const s4=await pg.evaluate(async()=>{const Wm=S.market.w[1];mktFix75();const top=Wm.deck[Wm.deck.length-1];const r={up:Wm.up4===top,top,n:Wm.deck.length};
  window._r=null;marketBuy75(S.players[0],1).then(x=>window._r=x);await new Promise(r=>setTimeout(r,500));
  const c=document.querySelector('#mBody .mb-cell[data-lv="1"][data-side="w"][data-s="4"]');r.face=!!(c&&c.querySelector(`.mb-w.lit[data-card="w:${top}"]`));r.under=!!(c&&c.querySelector('.under89'));
  r.back=!!document.querySelector('#mBody .under89[style*="weapon_back"]');
  c.querySelector('.mb-w.lit').click();for(let i=0;i<30&&!window._r;i++)await new Promise(r=>setTimeout(r,100));
  r.got=window._r&&window._r.key;r.next=Wm.up4;r.n2=Wm.deck.length;r.nextIsTop=Wm.up4===Wm.deck[Wm.deck.length-1];
  r.json=!('up4' in JSON.parse(JSON.stringify(Wm)));return r});
ok(s4.up&&s4.face&&s4.under&&s4.back,'slot 4 shows its top card face up on the backs pile '+JSON.stringify(s4));
ok(s4.got===s4.top&&s4.n2===s4.n-1&&s4.nextIsTop&&s4.next&&s4.json,'taking slot 4 flips the next (not saved) '+JSON.stringify(s4));
/* 3. the Choose card: a free weapon from any level */
await pg.evaluate(()=>{const p=S.players[0];p.wL=null;p.items.push({kind:'card',key:'mchoice',id:'mc89'});window._u=null;useItem(p,p.items[p.items.length-1]).then(x=>window._u=x)});await W8(600);
const ch=await pg.evaluate(()=>{const m=document.querySelector('#mBody .mk88');if(!m)return null;const L=[...m.querySelectorAll('.mboard75 .lit')];
  return {n:L.length,want:rowOpts89([1,2,3],['w']).length,lvs:[...new Set(L.map(x=>x.closest('.mb-cell').dataset.lv))].sort().join(''),onlyW:L.every(x=>x.closest('.mb-cell').dataset.side==='w'),
    dimA:m.querySelectorAll('.mb-cell.dim89[data-side="a"]').length,t:document.getElementById('mTitle').textContent,d:CARDS.mchoice.d}});
ok(ch&&ch.n===ch.want&&ch.lvs==='123'&&ch.onlyW&&ch.dimA===12,'Choose: every weapon on all three rows lit, armor dimmed '+JSON.stringify(ch));
ok(ch&&/choose your items/.test(ch.d)&&/Now:/.test(ch.d),'card keeps its wording + the new line');
if(shots)await pg.screenshot({path:shots+'/v89K_choose.png'});
const cu=await pg.evaluate(async()=>{const el=document.querySelector('#mBody .mb-cell[data-lv="3"] .mb-w.lit');const k=el.dataset.card.slice(2);el.click();
  for(let i=0;i<30&&window._u===null;i++)await new Promise(r=>setTimeout(r,100));for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,150))}
  const p=S.players[0];return {k,used:window._u,has:['R','L'].some(a=>p['w'+a]&&p['w'+a].key===k),card:p.items.some(x=>x.key==='mchoice')}});
ok(cu.used===true&&cu.has&&!cu.card,'a level 3 weapon taken free, the card spent '+JSON.stringify(cu));
/* 4. CPUs: a purchase and the Choose card, no window */
const cpu=await pg.evaluate(async()=>{SPEED='fast';const q=S.players[1];q.coin=40;const r={};r.buy=await marketBuy75(q,1,{pref:'w'});r.modal=!!CUR_MODAL;
  q.wL=null;q.items.push({kind:'card',key:'mchoice',id:'mc89c'});const nW=['R','L'].filter(a=>q['w'+a]).length;await cpuUseItems(q);
  r.choose=!q.items.some(x=>x.key==='mchoice')&&['R','L'].filter(a=>q['w'+a]).length>nW;r.log=[...document.querySelectorAll('#log li')].slice(0,8).map(l=>l.textContent).join(' | ');return r});
ok(cpu.buy&&cpu.buy.key&&!cpu.modal,'CPU buys outright '+JSON.stringify(cpu.buy));ok(cpu.choose,'CPU plays Choose for a free weapon '+cpu.log.slice(0,300));
/* 5. a free pick (an offering) keeps "chooses outright" */
const fr=await pg.evaluate(async()=>{const q=S.players[2];const k=await marketRoll(q,'a',1,{free:1});return {k,log:[...document.querySelectorAll('#log li')].slice(0,4).map(l=>l.textContent).join(' | ')}});
ok(fr.k&&/chooses outright at level 1/.test(fr.log),'free pick: chooses outright '+JSON.stringify(fr));
/* 6. the draft: every fitting piece lit */
await pg.evaluate(async()=>{SPEED='normal';if(CUR_MODAL)CUR_MODAL.done(null);S.over=true;await new Promise(r=>setTimeout(r,300));
  startEvent({ev:'ludus',seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true}],opts:{spect:0}})});
let dr=null;for(let i=0;i<80;i++){await W8(200);dr=await pg.evaluate(()=>{const m=document.querySelector('#mBody .mk88');if(!m||!CUR_MODAL)return null;
    const t=document.getElementById('mTitle').textContent;const b=(document.querySelector('#mBody > p b')||{}).textContent;
    return {lit:m.querySelectorAll('.mboard75 .lit').length+m.querySelectorAll('.x88 .lit').length,n:+b,t}});
  if(dr&&/Draft/.test(dr.t))break;await pg.evaluate(()=>{if(CUR_MODAL&&!document.querySelector('#mBody .mk88'))CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)})}
ok(dr&&dr.lit===dr.n&&dr.n>8,'draft: every fitting piece lit '+JSON.stringify(dr));
if(shots)await pg.screenshot({path:shots+'/v89K_draft.png'});
await pg.evaluate(()=>{const el=document.querySelector('#mBody .mk88 .lit');if(el)el.click()});await W8(400);
console.log(JSON.stringify({miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

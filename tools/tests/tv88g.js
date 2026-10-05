/* v0.88 gear between turns (162-v88gear): off-turn and not attacked → the "Between turns" bar (swap hands, take from the ground);
   own turn or under attack → no bar; swapping moves primary/secondary; taking off-turn never uses up the turn's Loot; CPUs pick up for
   free hands when another turn begins; online off. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const o=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  for(let i=0;i<30;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(100)}SPEED='pause';
  const p=S.players[0],c1=S.players[1];const r={};
  /* make it a CPU's turn */
  S.cur=1;
  r.cur1=cur()!==p;
  /* a dropped gladius at my feet */
  pileFor(p).weapons.push(mkW('gladius'));const hadR=p.wR&&p.wR.n,hadL=p.wL&&p.wL.n;
  render();await W8(150);const bar=()=>{const el=document.createElement('div');el.innerHTML=boardHTML(p,false);return el.querySelector('.gb88')};
  const b1=bar();r.bar=!!b1;r.swapBtn=!!(b1&&b1.querySelector('[data-gear88="swap"]'));r.takeBtn=!!(b1&&b1.querySelector('[data-gear88="take"]'));
  /* under attack: no bar */
  ATK88.add(p);r.atkNo=!bar();ATK88.delete(p);
  /* swap */
  gear88Swap(p);r.swapped=(p.wR&&p.wR.n)===hadL&&(p.wL&&p.wL.n)===hadR;gear88Swap(p);
  /* take: drop the left weapon first so a hand is free, then take the gladius */
  if(p.wL){dropWeapon(p,p.wL);p.wL=null}
  p.looted=false;const pr=gear88Take(p);await W8(300);const opts=[...document.querySelectorAll('#mBtns button')].map(x=>x.textContent);r.optsHave=opts.some(t=>/Gladius/.test(t));
  const btn=[...document.querySelectorAll('#mBtns button')].find(x=>/Gladius/.test(x.textContent));if(btn)btn.click();await W8(300);if(CUR_MODAL)CUR_MODAL.done(null);await pr;
  r.took=[p.wR,p.wL].some(w=>w&&/Gladius/.test(w.n));r.lootLeft=p.looted===false;
  /* my own turn: no bar */
  S.cur=0;r.ownNo=cur()===p&&!bar();
  /* a CPU on loot with a free hand picks it up when another turn begins */
  c1.wL=null;c1.wR=c1.wR||null;const freeHand=armsAttached(c1).some(a=>!c1['w'+a]);pileFor(c1).weapons.push(mkW('mace'));await gear88Cpu();r.cpuTook=!freeHand||[c1.wR,c1.wL].some(w=>w&&/Mace/.test(w.n));
  /* online: off */
  S.onl={};r.onlNo=!gear88Ok(p);delete S.onl;
  return r});
ok(o.cur1,'set up a CPU turn');ok(o.bar&&o.swapBtn&&o.takeBtn,'off-turn: the Between turns bar '+JSON.stringify(o));ok(o.atkNo,'under attack: no bar');
ok(o.swapped,'swap hands moves primary/secondary');ok(o.optsHave&&o.took,'take from the ground');ok(o.lootLeft,'off-turn take keeps the turn Loot');
ok(o.ownNo,'own turn: no bar');ok(o.cpuTook,'CPU picks up for a free hand');ok(o.onlNo,'online: off');
console.log(JSON.stringify({miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

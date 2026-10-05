/* v0.89 the loot window (169-v89loot): the Loot action and the between-turns Manage show the pile as the actual pieces (weapon cards
   upright, armor with its own art) grouped by pile; every takeable option is a lit piece carrying its window button's data-mi; pieces
   that cannot be taken now are dimmed (nowhere to wear, turn's Loot used); clicking a piece returns the same option as the old button;
   Manage takes several in a row and keeps ⇄ Swap hands. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const W=ms=>pg.waitForTimeout(ms);const SHOT=process.env.SHOT||'';
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  SPEED='fast';
  /* play on until it is my own action phase: the game then waits for me, nothing races the test */
  for(let i=0;i<600;i++){if(cur()===S.players[0]&&S.phase==='action'&&!CUR_MODAL&&!S.busy)break;
    if(CUR_MODAL){const b=document.querySelector('#mBtns button:not([disabled])');if(b)b.click();else CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
    else if(cur()===S.players[0]&&S.phase==='choice'){const b=[...document.querySelectorAll('#actions button')].find(x=>/^Take/.test(x.textContent.trim()));if(b)b.click()}
    await W8(100)}
  S.players[0].alive=true});
/* a corpse pile at my feet: 2 weapons + 3 armor (one leg piece with both legs gone = nowhere to wear it), coin; a thrown weapon in the sand */
const setup=()=>pg.evaluate(()=>{const p=S.players[0],q=S.players[1];S.piles=S.piles.filter(x=>!(x.r===p.r&&x.c===p.c));S.floor=S.floor.filter(f=>!(f.r===p.r&&f.c===p.c));
  const leg=Object.keys(ARM).find(k=>ARM[k].slot==='leg'&&ARM[k].lv===1&&!ARM[k].stack);const chest=Object.keys(ARM).find(k=>ARM[k].slot==='chest'&&ARM[k].lv===2);const head=Object.keys(ARM).find(k=>ARM[k].slot==='head'&&ARM[k].lv===1);
  const pl={id:uid++,owner:q.id,color:q.color,name:q.name,r:p.r,c:p.c,corpse:true,weapons:[mkW('gladius'),mkW('mace')],armor:[leg,chest,head].map(k=>({key:k,n:ARM[k].n,ap:ARM[k].ap,from:'drop'})),coin:4,items:[]};
  S.piles.push(pl);p.hp.rleg=0;p.hp.lleg=0;p.looted=false;render();return {leg,chest,head}});
const keys=await setup();
/* 1 · the Loot window */
const lootOpen=()=>pg.evaluate(()=>{const p=S.players[0];window.__lootOpts=lootOptions(p).filter(o=>o.t==='fw'||!p.looted);
  window.__lootPr=modal(_T('Loot'),`<p>${_T`Take one item per turn from a corpse or a dropped pile. Thrown weapons in the sand can always be picked up.`}</p>`,window.__lootOpts.map((o,i)=>({label:o.label,sub:o.sub,value:i})).concat([{label:_T('Cancel'),value:null}]))});
await lootOpen();await W(500);
const look=()=>pg.evaluate(()=>{const root=document.querySelector('#mBody .lt89');if(!root)return null;const lit=[...root.querySelectorAll('.lt89p.lit')];const dim=[...root.querySelectorAll('.lt89p.dim')];
  const mi=lit.map(e=>+e.dataset.mi);const btn=mi.map(i=>{const x=document.querySelector(`#mBtns [data-mi="${i}"]`);return x?x.textContent:''});
  return {lit:lit.length,dim:dim.length,mi,btn,litNames:lit.map(e=>e.textContent),litLab:lit.map(e=>e.querySelector('.lt89n').textContent.trim()),dimNames:dim.map(e=>e.textContent),dimCards:dim.map(e=>{const c=e.querySelector('[data-card]');return c?c.dataset.card:''}),heads:[...root.querySelectorAll('.lt89g h5')].map(h=>h.textContent),
    wArt:root.querySelectorAll('.lt89w [data-card^="w:"]').length,aArt:root.querySelectorAll('.lt89a [data-card^="a:"]').length,hidden:[...document.querySelectorAll('#mBtns button')].filter(b=>b.style.display==='none').length}});
const L1=await look();
ok(L1,'the loot spread opens');
if(L1){ok(L1.wArt===2&&L1.aArt===3,'weapon cards + armor art '+JSON.stringify(L1));ok(L1.heads.some(h=>/corpse/.test(h)),'corpse header');
  ok(L1.dim===1&&L1.dimCards[0]==='a:'+keys.leg,'the leg piece is dimmed (no legs)');ok(L1.lit===5,'5 lit (2 weapons, 2 armor, coin)');
  ok(L1.mi.every((i,j)=>L1.btn[j]&&L1.btn[j].trim().startsWith(L1.litLab[j])),'each lit piece carries its own button '+JSON.stringify([L1.btn,L1.litLab]));}
/* the info panel on hover */
const hov=await pg.$('#mBody .lt89p.lit .lt89a');if(hov){await hov.hover();await W(200)}
const inf=await pg.evaluate(()=>{const i=document.querySelector('#mBody .lt89info');return i?i.textContent:''});ok(/Armor · level|Fits|Replaces/.test(inf),'info panel: '+inf.slice(0,80));
if(SHOT){await pg.mouse.move(1390,890);await W(300)}if(SHOT)await pg.screenshot({path:SHOT+'/v89C_loot.png'});
/* clicking the mace returns the same index as the old Mace button */
const pick=await pg.evaluate(async()=>{const el=[...document.querySelectorAll('#mBody .lt89p.lit')].find(e=>/Mace/.test(e.textContent));const want=window.__lootOpts.findIndex(o=>/Mace/.test(o.label));el.click();const v=await window.__lootPr;return {v,want}});
ok(pick.v===pick.want&&pick.v!=null,'piece click = the old option index '+JSON.stringify(pick));
/* after one Loot this turn: pile pieces dim, the thrown weapon still lit */
await pg.evaluate(()=>{const p=S.players[0];p.looted=true;S.floor.push({kind:'weapon',r:p.r,c:p.c,w:mkW('hasta'),thrown:-1})});
await lootOpen();await W(400);const L2=await look();if(!L2)console.log('DBG',await pg.evaluate(()=>[document.getElementById('mTitle').textContent,!!CUR_MODAL,document.getElementById('modal').hidden,S.cur,S.phase]));
ok(L2&&L2.lit===1&&/Hasta|Spear/i.test(L2.litNames[0]||'')&&L2.dim>=5&&L2.heads.some(h=>/sand/.test(h)),'looted: only the thrown weapon lit '+JSON.stringify(L2));
await pg.evaluate(async()=>{CUR_MODAL.done(null);await window.__lootPr});
/* the real Loot action goes through the same window */
await setup();await pg.evaluate(()=>{const p=S.players[0];p.looted=false;render()});
const actBtn=await pg.evaluate(()=>{const b=document.querySelector('#actions [data-act="loot"]');if(b){b.click();return true}return false});await W(500);
ok(actBtn,'the Loot action button');
if(actBtn){const L3=await look();ok(L3&&L3.lit===5,'Loot action opens the spread');await pg.evaluate(()=>{const el=[...document.querySelectorAll('#mBody .lt89p.lit')].find(e=>/Gladius/.test(e.textContent));if(el)el.click()});await W(500);
  const t=await pg.evaluate(()=>({looted:S.players[0].looted,has:[S.players[0].wR,S.players[0].wL].some(w=>w&&/Gladius/.test(w.n))||!!CUR_MODAL}));ok(t.looted&&t.has,'Loot action takes the piece '+JSON.stringify(t));
  await pg.evaluate(async()=>{for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:0);await new Promise(r=>setTimeout(r,200))}})}
/* 2 · Manage between turns: same spread, take several, swap inside */
await setup();
const mg=await pg.evaluate(async()=>{const p=S.players[0];window.__cur0=S.cur;S.cur=S.players.indexOf(S.players[1]);p.looted=false;if(p.wL){dropWeapon(p,p.wL);p.wL=null}
  S.piles.forEach(x=>{if(x.r===p.r&&x.c===p.c&&!x.corpse)x.weapons=[]});render();window.__mg=gear88Take(p);await new Promise(r=>setTimeout(r,500));
  const root=document.querySelector('#mBody .lt89');return {open:!!root,title:document.getElementById('mTitle').textContent,swap:[...document.querySelectorAll('#mBtns button')].some(b=>/Swap hands/.test(b.textContent)&&b.style.display!=='none'),
    lit:root?root.querySelectorAll('.lt89p.lit').length:0,dim:root?root.querySelectorAll('.lt89p.dim').length:0,hands:!!(root&&root.querySelector('.lt89hands'))}});
ok(mg.open&&/Manage/.test(mg.title),'Manage opens the spread');ok(mg.swap,'⇄ Swap hands in the window');ok(mg.hands,'hands line');ok(mg.dim>=2,'coin + leg piece dimmed in Manage '+JSON.stringify(mg));
if(SHOT){await pg.mouse.move(1390,890);await W(300)}if(SHOT)await pg.screenshot({path:SHOT+'/v89C_manage.png'});
const takes=[];for(const re of ['Gladius',keys.chest?'chest':'x',keys.head?'head':'x']){
  const r=await pg.evaluate(async(re)=>{const p=S.players[0];const root=document.querySelector('#mBody .lt89');if(!root)return 'closed';
    const lit=[...root.querySelectorAll('.lt89p.lit')];let el=null;
    if(re==='chest'||re==='head')el=lit.find(e=>{const c=e.querySelector('[data-card^="a:"]');return c&&ARM[c.dataset.card.slice(2)].slot===re});else el=lit.find(e=>e.textContent.includes(re));
    if(!el)return 'none';el.click();for(let i=0;i<10;i++){await new Promise(r=>setTimeout(r,200));if(CUR_MODAL&&!/Manage/.test(document.getElementById('mTitle').textContent)){const b=[...document.querySelectorAll('#mBtns button')].find(x=>/Swap in/.test(x.textContent));if(b)b.click()}
      if(document.querySelector('#mBody .lt89'))break}return 'ok'},re);takes.push(r)}
const mg2=await pg.evaluate(async()=>{const p=S.players[0];const r={took:[p.wR,p.wL].some(w=>w&&/Gladius/.test(w.n)),looted:p.looted};
  const sw=[...document.querySelectorAll('#mBtns button')].find(b=>/Swap hands/.test(b.textContent));const a=p.wR&&p.wR.n,l=p.wL&&p.wL.n;if(sw){sw.click();await new Promise(r=>setTimeout(r,400))}r.swapped=(p.wR&&p.wR.n)===l&&(p.wL&&p.wL.n)===a;r.still=!!document.querySelector('#mBody .lt89');
  const pl=S.piles.find(x=>x.r===p.r&&x.c===p.c&&x.corpse);r.armLeft=pl?pl.armor.length:-1;if(CUR_MODAL)CUR_MODAL.done(null);await window.__mg;S.cur=window.__cur0;return r});
ok(mg2.took,'Manage took the gladius '+JSON.stringify([takes,mg2]));ok(mg2.armLeft===1,'Manage took two armor pieces, the leg piece stays '+JSON.stringify(mg2));ok(mg2.looted===false,'Manage keeps the turn Loot');ok(mg2.swapped&&mg2.still,'swap inside, the window stays');
console.log(JSON.stringify({miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

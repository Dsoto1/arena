/* v0.98 part B (247-v98pn): Play Now's upper-right group (summary · 🎲 with its hover text · Begin Event), the GLADIATORS count picker
   under the players badge, seats beyond 4 on a second row + empty "＋ Seat N" cards, the Stands card fitting a 1440×900 screen; the Play
   Now submenu's "Your Play Now Gladiators"; Creator Studio designer tabs (sections hidden, values kept across tabs, Save works, the tab
   remembered); a custom class card with its weapon cards (big under the card, small on hover); the 3D token card upper right, shorter
   personality sliders, and the poser's lit joint on hover/drag; a phone-width setup without sideways scroll. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2],{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const until=async(fn,ms=20000,arg)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}};
const W8=ms=>pg.waitForTimeout(ms);
/* ---- 1 · Play Now ---- */
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300));openSetup(true)});
await until(()=>document.querySelector('#mBody .pn98 .pn98go #goBtn'));
await pg.evaluate(async()=>{const s=document.getElementById('evSel');s.value='familia';s.dispatchEvent(new Event('change',{bubbles:true}))});
await until(()=>CFG.ev==='familia'&&document.querySelector('#mBody .pn98 .pn98cnt'));await W8(300);
const A=await pg.evaluate(()=>{const q=s=>document.querySelector('#mBody '+s);const g=q('.pn98 .pn-top .pn-acts .pn98go');const r=g?g.getBoundingClientRect():{};
  const kids=g?[...g.children].map(x=>x.matches('.pn-sum')?'sum':x.matches('[data-pnrand90]')?'dice':x.id==='goBtn'?'go':'?'):[];
  return {kids:kids.join(','),right:r.right,top:r.top,w:innerWidth,title:getComputedStyle(document.getElementById('mTitle')).display,start:!!q('.pn-start'),
    sum:(q('.pn98go .pn-sum')||{}).textContent||'',go:(q('#goBtn')||{}).textContent||'',diceTxt:(q('[data-pnrand90]')||{}).getAttribute&&q('[data-pnrand90]').getAttribute('aria-label'),
    head:(q('.pn98h')||{}).textContent,badge:!!q('.pn98pc .pn-badge'),cnt:[...document.querySelectorAll('#mBody .pn98cnt button')].map(x=>x.textContent+(x.disabled?'-':'')+(x.classList.contains('on')?'*':'')).join(' ')}});
ok(A.kids==='sum,dice,go'&&A.right>A.w*0.8&&A.top<70,'upper-right group: summary · 🎲 · Begin Event '+JSON.stringify(A));
ok(A.title==='none'&&A.head&&!A.start,'"Play Now" heads the bar, the old title and bottom bar are gone');
ok(/Familia/.test(A.sum)&&/Begin Event/.test(A.go)&&/Random event/.test(A.diceTxt||''),'summary + Begin Event + dice label');
ok(A.badge&&/^2- 3- 4 5 6\*? 7 8$/.test(A.cnt.replace(/\*/g,'').trim().replace(/(\d)-/g,'$1-'))&&/\*/.test(A.cnt),'count picker under the badge '+A.cnt);
await pg.hover('#mBody .pn98go [data-pnrand90]');await W8(150);
const tip=await pg.evaluate(()=>{const t=document.querySelector('#mBody .pn98tip');const r=t.getBoundingClientRect();return {vis:getComputedStyle(t).display!=='none'&&r.width>100,txt:t.textContent,inside:r.right<=innerWidth&&r.left>=0}});
ok(tip.vis&&/random city/.test(tip.txt)&&tip.inside,'🎲 hover text '+JSON.stringify(tip));
if(SHOT)await pg.screenshot({path:SHOT+'/tv98b_top.png'});
await pg.mouse.move(700,500);
/* seven gladiators: the picker, a second row, one empty seat; then the empty seat card */
await pg.click('#mBody .pn98cnt [data-pn98n="7"]');await until(()=>CFG.n===7&&document.querySelectorAll('#mBody .pn-who .seats>.seat:not(.stands92)').length===7);await W8(200);
const B=await pg.evaluate(()=>{const S=[...document.querySelectorAll('#mBody .pn-who .seats>.seat:not(.stands92)')].map(x=>Math.round(x.getBoundingClientRect().top));const add=[...document.querySelectorAll('#mBody .pn98add')].map(x=>x.dataset.pn98n);
  const st=document.querySelector('#mBody .pn-who .seats>.seat.stands92').getBoundingClientRect(),s4=document.querySelectorAll('#mBody .pn-who .seats>.seat')[3].getBoundingClientRect();
  return {n:CFG.n,row1:S.slice(0,4).every(t=>t===S[0]),row2:S.slice(4).every(t=>t===S[4])&&S[4]>S[0]+60,add:add.join(','),standsRight:st.left>=s4.right-1,on:(document.querySelector('#mBody .pn98cnt .on')||{}).textContent}});
ok(B.n===7&&B.row1&&B.row2&&B.add==='8'&&B.standsRight&&B.on==='7','seats beyond 4 on a second row, ＋ Seat 8, Stands on the right '+JSON.stringify(B));
await pg.click('#mBody .pn98add[data-pn98n="8"]');const n8=await until(()=>CFG.n===8&&document.querySelectorAll('#mBody .pn-who .seats>.seat:not(.stands92)').length===8&&!document.querySelector('#mBody .pn98add'));
ok(n8,'＋ Seat 8 seats an eighth gladiator');
/* the Stands card fits 1440×900 */
await pg.evaluate(()=>document.querySelector('#mBody .pn-who').scrollIntoView());await W8(300);
const C=await pg.evaluate(()=>{const c=document.querySelector('#mBody .stands92');const r=c.getBoundingClientRect();const m=document.getElementById('mBody');const top=document.querySelector('#mBody .pn98 .pn-top').getBoundingClientRect();
  return {top:r.top,bottom:r.bottom,h:innerHeight,inner:c.scrollHeight<=c.clientHeight+1,below:r.top>=top.bottom-1,side:m.scrollWidth<=m.clientWidth+1,barTop:top.top}});
ok(C.top>=0&&C.bottom<=C.h&&C.inner&&C.below&&C.side,'Stands card fits 1440×900, under the sticky bar '+JSON.stringify(C));
if(SHOT)await pg.screenshot({path:SHOT+'/tv98b_who.png'});
/* the old hooks still drive the setup: 🎲 rolls, Begin Event starts */
const rolled=await pg.evaluate(async()=>{const e0=CFG.ev;document.querySelector('#mBody .pn98go [data-pnrand90]').click();await new Promise(r=>setTimeout(r,400));return CFG.ev!==e0&&!!document.querySelector('#mBody .pn98go #goBtn')});
ok(rolled,'🎲 still rolls a random event');
/* ---- 2 · Your Play Now Gladiators in the Play Now submenu ---- */
await pg.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}playNowMenu()});
await until(()=>[...document.querySelectorAll('#mBtns button')].some(x=>/Your Play Now Gladiators/.test(x.textContent)));
const D=await pg.evaluate(()=>[...document.querySelectorAll('#mBtns button')].map(x=>x.textContent.trim().split('\n')[0]));
ok(D.some(x=>/New event/.test(x))&&D.some(x=>/Your Play Now Gladiators/.test(x))&&/Back/.test(D[D.length-1]),'submenu button '+JSON.stringify(D));
await pg.evaluate(()=>[...document.querySelectorAll('#mBtns button')].find(x=>/Your Play Now Gladiators/.test(x.textContent)).click());
ok(await until(()=>!!document.getElementById('ludusBody')&&/Play Now Gladiators/.test(document.getElementById('mTitle').textContent),8000),'it opens Your Play Now Gladiators');
/* ---- 3 · Studio designer tabs + 4 · class card weapons ---- */
await pg.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}try{localStorage.removeItem('flavius_st98tab')}catch(e){}ST98.mem=null;openStudio('classes')});
await until(()=>document.querySelector('#studio .st98bar [data-st98t]'));await W8(300);
const tabs=()=>pg.evaluate(()=>[...document.querySelectorAll('#studio .st98bar [data-st98t]')].map(x=>x.textContent+(x.classList.contains('on')?'*':'')));
const click=async re=>{await pg.evaluate(src=>{const re=new RegExp(src);const b=[...document.querySelectorAll('#studio .st98bar [data-st98t]')].find(x=>re.test(x.textContent));b.click()},re.source);await W8(250)};
const vis=sel=>pg.evaluate(s=>{const e=document.querySelector(s);return !!e&&!!e.offsetParent},sel);
const T0=await tabs();ok(T0[0]==='Basics*'&&T0.some(x=>/^Weapons/.test(x))&&T0.some(x=>/^Lore/.test(x))&&T0.some(x=>/Your classes/.test(x))&&T0.some(x=>/System classes/.test(x)),'class designer tabs '+JSON.stringify(T0));
ok(await vis('#studio input[data-f="name"]')&&!(await vis('#studio textarea[data-f="lore"]'))&&!(await vis('#studio .stlist .list2')),'Basics shows the name, hides Lore and the lists');
await pg.fill('#studio input[data-f="name"]','Tabulus');await pg.evaluate(()=>{const i=document.querySelector('#studio input[data-f="name"]');i.dispatchEvent(new Event('change',{bubbles:true}))});
await click(/^Lore/);const LV={lore:await vis('#studio textarea[data-f="lore"]'),name:await vis('#studio input[data-f="name"]'),save:await vis('#studio [data-clsa="save"]'),tabs:await tabs()};
ok(LV.lore&&!LV.name&&LV.save,'Lore tab: lore shown, Save stays '+JSON.stringify(LV));
await pg.fill('#studio textarea[data-f="lore"]','Fights by the tab.');await pg.evaluate(()=>{const i=document.querySelector('#studio textarea[data-f="lore"]');i.dispatchEvent(new Event('change',{bubbles:true}))});
await click(/^Weapons/);await click(/^Basics/);
const kept=await pg.evaluate(()=>({n:document.querySelector('#studio input[data-f="name"]').value,l:document.querySelector('#studio textarea[data-f="lore"]').value,d:ST.draft&&ST.draft.name}));
ok(kept.n==='Tabulus'&&kept.l==='Fights by the tab.','values kept across tabs '+JSON.stringify(kept));
const cc=await pg.evaluate(()=>{const c=document.querySelector('#studio #clsCard .cc98.big');return {w:c?c.querySelectorAll('.cc98w .cc98wc .cimg').length:0,want:[ST.draft.R,ST.draft.L].filter(k=>k&&W[k]).length}});
ok(cc.w>=1&&cc.w===cc.want,'class card shows its weapon cards '+JSON.stringify(cc));
if(SHOT)await pg.screenshot({path:SHOT+'/tv98b_class.png'});
await click(/^Lore/);
await pg.evaluate(()=>document.querySelector('#studio [data-clsa="save"]').click());
const saved=await until(()=>(CUSTOM.classes||[]).some(c=>c.name==='Tabulus'&&c.lore==='Fights by the tab.'),10000);ok(saved,'Save from the Lore tab saves the class with both values');
await W8(500);
const mem=await pg.evaluate(()=>{let m={};try{m=JSON.parse(localStorage.getItem('flavius_st98tab')||'{}')}catch(e){}return m.classes});ok(/Lore/.test(mem||'')||/Basics/.test(mem||''),'tab remembered '+mem);
await pg.evaluate(()=>{studioRedraw()});await W8(200);const T1=await tabs();ok(T1.some(x=>x.endsWith('*'))&&T1.find(x=>x.endsWith('*')).replace('*','').replace(/[\d·…]+/g,'').trim()===mem,'the remembered tab after a redraw '+JSON.stringify(T1));
await click(/Your classes/);const sm=await pg.evaluate(()=>{const c=[...document.querySelectorAll('#studio .stlist .cc98.short')].find(x=>x.offsetParent);return c?{w:c.querySelectorAll('.cc98wc').length}:null});
ok(sm&&sm.w>=1,'the saved class in the list: weapons on hover '+JSON.stringify(sm));
if(sm){await pg.hover('#studio .stlist .cc98.short');await W8(150);ok(await pg.evaluate(()=>{const w=document.querySelector('#studio .stlist .cc98.short .cc98w');return getComputedStyle(w).display!=='none'&&w.getBoundingClientRect().width>100}),'hover shows the weapon cards')}
/* Edit from the list → the first design tab */
await pg.evaluate(()=>{const b=document.querySelector('#studio .stlist [data-clsa="edit"],#studio .stlist [data-st="edit"]')||[...document.querySelectorAll('#studio .stlist button')].find(x=>/Edit/.test(x.textContent));b&&b.click()});await W8(500);
const T2=await tabs();ok(T2[0]==='Basics*','Edit jumps back to the first tab '+JSON.stringify(T2));
/* the beast designer: its framed parts are tabs */
await pg.evaluate(()=>document.querySelector('#studio [data-st="tab"][data-v="npcs"]').click());await W8(600);
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#studio button')].find(x=>/New beast/.test(x.textContent));b&&b.click()});await W8(800);
const T3=await tabs();ok(T3.length>=6&&T3.some(x=>/zone/.test(x))&&T3.some(x=>/face/.test(x))&&T3.some(x=>/round token/.test(x)),'beast designer tabs '+JSON.stringify(T3));
/* ---- 5 · character designer: 3D card upper right, short sliders, the poser's lit joint ---- */
await pg.evaluate(()=>document.querySelector('#studio [data-st="tab"][data-v="chars"]').click());await W8(600);
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#studio button')].find(x=>/New character/.test(x.textContent));b&&b.click()});await until(()=>document.querySelector('#studio .st98rc [data-t93card]'));await W8(300);
const E=await pg.evaluate(()=>{const rc=document.querySelector('#studio .st98rc');const card=rc&&rc.querySelector('[data-t93card]'),pan=rc&&rc.querySelector('.st95stats');const r=card.getBoundingClientRect(),g=document.querySelector('#studio .setup-grid.st95c3').getBoundingClientRect();
  return {first:rc.firstElementChild===card,above:r.bottom<=pan.getBoundingClientRect().top+1,right:r.left>g.left+g.width*0.6,top:r.top-g.top}});
ok(E.first&&E.above&&E.right&&E.top<40,'3D token card upper right '+JSON.stringify(E));
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#studio .st98bar [data-st98t]')].find(x=>/personality/i.test(x.textContent));b&&b.click()});await W8(250);
const sl=await pg.evaluate(()=>{const s=[...document.querySelectorAll('#studio .perswrap input[type=range]')].filter(x=>x.offsetParent);return {n:s.length,w:Math.max(...s.map(x=>x.getBoundingClientRect().width))}});
ok(sl.n>=4&&sl.w<=160,'personality sliders shorter '+JSON.stringify(sl));
await pg.evaluate(()=>document.querySelector('#studio [data-t93="open"]').click());
const ready=await until(()=>{const b=document.querySelector('#t93m [data-t93m="save"]');return b&&!b.disabled&&T93.ed&&T93.ed.screenOf},120000);
if(ready){await W8(500);
  const p=await pg.evaluate(()=>T93.ed.screenOf('pe'));const h0=await pg.evaluate(()=>T93.ed.hot());
  await pg.mouse.move(p.x+40,p.y-200);await pg.mouse.move(p.x,p.y,{steps:4});await W8(200);
  const h1=await pg.evaluate(()=>({hot:T93.ed.hot(),cur:document.getElementById('t93cv').style.cursor}));
  if(SHOT)await pg.screenshot({path:SHOT+'/tv98b_poser.png'});
  await pg.mouse.down();await pg.mouse.move(p.x+12,p.y+6,{steps:3});const h2=await pg.evaluate(()=>T93.ed.hot());await pg.mouse.up();
  const rc=await pg.evaluate(()=>document.getElementById('t93cv').getBoundingClientRect().toJSON());await pg.mouse.move(rc.left+8,rc.top+8,{steps:3});await W8(200);const h3=await pg.evaluate(()=>T93.ed.hot());
  ok(h0==null&&h1.hot==='pe'&&h1.cur==='pointer'&&h2==='pe'&&h3==null,'poser: joint lit on hover and drag '+JSON.stringify({h0,h1,h2,h3}));
  await pg.evaluate(()=>{const b=document.querySelector('#t93m [data-t93m="close"]');b&&b.click()})}
else ok(false,'modeller did not open');
/* ---- phone width: the setup never scrolls sideways ---- */
const ph=await b.newPage({viewport:{width:390,height:844}});await ph.route(/fonts\.g/,r=>r.abort());ph.on('pageerror',e=>errs.push('phone '+e.message));
await ph.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await ph.goto('file://'+process.argv[2],{timeout:120000});await ph.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await ph.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300));openSetup(true)});await ph.waitForFunction(()=>document.querySelector('#mBody .pn98 .pn98go'),null,{timeout:20000});await ph.waitForTimeout(400);
const P=await ph.evaluate(()=>{const m=document.getElementById('mBody');const wide=[...m.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&e.offsetParent).slice(0,6).map(e=>e.tagName+'.'+e.className+' '+Math.round(e.getBoundingClientRect().right));const g=document.querySelector('#mBody #goBtn').getBoundingClientRect();return {side:m.scrollWidth<=m.clientWidth+1,go:g.right<=innerWidth+1&&g.width>60,wide}});
ok(P.side&&P.go,'phone: no sideways scroll, Begin Event on screen '+JSON.stringify(P));
if(SHOT)await ph.screenshot({path:SHOT+'/tv98b_phone.png'});
console.log('MISS',miss);console.log('ERRS',errs.slice(0,5));await b.close();if(miss.length||errs.length)process.exit(1)})();

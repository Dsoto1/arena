/* tv94d — v0.94 the Event Designer as the arena view (224-v94designer): the real board on the Arena step, palette drag → tile,
   drag on the board moves, right-click removes, tap-stamp + long-press remove (touch), Zones paint a round's area, add a round,
   undo / redo, the checks list (start on spikes → click flashes the tile), save → reload → the same event, an OLD custom event
   opens and saves unchanged, ▶ Test play (all-CPU, nothing recorded, back to the designer exactly as it was), phone 390 without
   horizontal overflow, no new errors in the 00c log. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const init=()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}};
const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.addInitScript(init);
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m)};const o={};
const until=async(fn,arg,ms=15000)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}};
const mark=await pg.evaluate(()=>ERR92.n);
/* an OLD custom event (v0.80 shape: deckSpawns, no slots82) already in the Store */
const OLD={id:'eold94',name:'The Old Games',notes:'',min:2,max:4,mode:'ffa',loc:3,rounds:[{n:'Opening',zone:1,pve:1,pvp:0,cf:1,ca:1,end:'npc',endN:3,reward:{coin:2,cf:1,cards:0}},{n:'Finale',zone:3,pve:1,pvp:1,cf:0,ca:0,end:'alive1',endN:1,reward:{}}],
  win:12,limits:{rot:0,min:0},deck:true,mandata:true,market:true,truce:true,priceMul:100,loadout:'class',draftPicks:3,start:{coin:1,cf:0,keys:0,hp:0,ap:0},classes:['soldier','hero','slave','royalty'],allowCustom:false,
  npcHp:100,npcDmg:0,spect:0,optOffers:true,chariotOffers:0,eaglePot:true,deckSpawns:{Leo:true,Leaena:false,Tholo:true,Commodus:true,Zora:true},
  layout:{pillars:[{r:3,c:3,pot:'?'},{r:3,c:9,pot:'elix4'},{r:9,c:3,pot:null}],tunnels:[[2,6]],spikes:[[6,3]],chest:[6,6],chestW:['labrys','psykhe'],npcs:[{key:'Glykon',t:'snake',name:'Glykon',r:1,c:6,beh:'zone'}],
   items:[{kind:'key',key:'key',r:5,c:5},{kind:'coin',key:5,r:7,c:7}],starts:[[12,12],[12,0],[0,0],[0,12]]},custom:true,created:'2026-09-01',updated:'2026-09-01'};
await pg.evaluate(async e=>{await Store.put('customEvents',e.id,e)},OLD);
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();openStudio('events')});
ok(await until(()=>!!document.getElementById('studio')),'studio');
o.oldStored=await pg.evaluate(()=>JSON.stringify((CUSTOM.events.find(e=>e.id==='eold94'))));
/* 1 · a new event, the Arena step */
await pg.evaluate(()=>{document.querySelector('[data-st="new"]').click()});await pg.waitForTimeout(400);
await pg.evaluate(()=>{document.querySelector('.edsteps [data-edstep="1"]').click()});
ok(await until(()=>!!document.getElementById('e94cv')&&!!E94.geo&&E94.cv.isConnected&&E94.cv.width>200),'arena view + canvas');
o.step=await pg.evaluate(()=>(document.querySelector('.edsteps .cur')||{}).textContent);
o.tabs=await pg.evaluate(()=>[...document.querySelectorAll('.e94tabs [role=tab]')].map(b=>b.textContent));
ok(o.tabs.length===3,'three palette tabs');
await pg.evaluate(()=>{document.querySelector('[data-st="clearboard"]').click()});await pg.waitForTimeout(300);
ok(await pg.evaluate(()=>ST.draft.layout.pillars.length===0&&ST.draft.layout.starts.length===0),'cleared');
const tileXY=async(r,c)=>pg.evaluate(([r,c])=>{const b=E94.cv.getBoundingClientRect();const m=e94C(r,c);return {x:b.left+m.x,y:b.top+m.y}},[r,c]);
const scrollBoard=async()=>{await pg.evaluate(()=>{E94.cv.scrollIntoView({block:'center'})});await pg.waitForTimeout(150)};
const dragFrom=async(sel,r,c)=>{await scrollBoard();const bb=await pg.locator(sel).first().boundingBox();const t=await tileXY(r,c);await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();
  await pg.mouse.move(bb.x+bb.width/2-20,bb.y+bb.height/2+10,{steps:3});await pg.mouse.move(t.x,t.y,{steps:8});await pg.mouse.up();await pg.waitForTimeout(350)};
/* 2 · drag a pillar from the palette onto C-4 (r2,c3); undo stack grows */
await dragFrom('[data-e94tool="pillar"]',2,3);
o.p1=await pg.evaluate(()=>ST.draft.layout.pillars.map(p=>[p.r,p.c]));ok(JSON.stringify(o.p1)==='[[2,3]]','palette drag placed a pillar '+JSON.stringify(o.p1));
/* 3 · drag it on the board to (4,4) */
await scrollBoard();{const a=await tileXY(2,3),z=await tileXY(4,4);await pg.mouse.move(a.x,a.y);await pg.mouse.down();await pg.mouse.move(z.x,z.y,{steps:10});await pg.mouse.up();await pg.waitForTimeout(350)}
o.p2=await pg.evaluate(()=>ST.draft.layout.pillars.map(p=>[p.r,p.c]));ok(JSON.stringify(o.p2)==='[[4,4]]','board drag moved the pillar '+JSON.stringify(o.p2));
/* hover names the tile */
await scrollBoard();{const z=await tileXY(4,4);await pg.mouse.move(z.x+1,z.y+1);await pg.waitForTimeout(200)}
o.hov=await pg.evaluate(()=>[document.getElementById('e94hov').textContent,tl(4,4)]);ok(o.hov[0].startsWith(o.hov[1])&&/Pillar/.test(o.hov[0]),'hover line '+o.hov);
/* 4 · right-click removes */
{const z=await tileXY(4,4);await pg.mouse.click(z.x,z.y,{button:'right'});await pg.waitForTimeout(300)}
ok(await pg.evaluate(()=>ST.draft.layout.pillars.length===0),'right-click removed');
/* 5 · click-select a stamp (spikes) and stamp two tiles */
await pg.evaluate(()=>{document.querySelector('[data-e94tool="spike"]').click()});await pg.waitForTimeout(250);
ok(await pg.evaluate(()=>E94.tool&&E94.tool.k==='spike'&&document.querySelector('[data-e94tool="spike"]').getAttribute('aria-pressed')==='true'),'stamp selected');
for(const [r,c] of [[10,10],[10,9]]){await scrollBoard();const z=await tileXY(r,c);await pg.mouse.click(z.x,z.y);await pg.waitForTimeout(300)}
o.sp=await pg.evaluate(()=>ST.draft.layout.spikes);ok(JSON.stringify(o.sp)==='[[10,10],[10,9]]','stamped spikes '+JSON.stringify(o.sp));
/* 6 · pieces: start 1 by drag onto the spikes (10,10) + a beast; the check list warns and flashes */
await pg.evaluate(()=>{document.querySelector('[data-e94="tab"][data-v="pieces"]').click()});await pg.waitForTimeout(300);
await dragFrom('[data-e94tool="start"][data-v="0"]',10,10);
await dragFrom('[data-e94tool="npc"][data-v="Leo"]',5,8);
o.st=await pg.evaluate(()=>({s:ST.draft.layout.starts,n:ST.draft.layout.npcs.map(n=>[n.name,n.r,n.c,n.t,n.beh])}));
ok(JSON.stringify(o.st.s)==='[[10,10]]'&&o.st.n.length===1&&o.st.n[0][0]==='Leo'&&o.st.n[0][3]==='lion','start + beast placed '+JSON.stringify(o.st));
o.chk=await pg.evaluate(()=>[...document.querySelectorAll('.e94chk button')].map(b=>b.textContent));
ok(o.chk.some(t=>/Start 1 is on spikes/.test(t)),'check: start on spikes '+JSON.stringify(o.chk));
await pg.evaluate(()=>{const b=[...document.querySelectorAll('.e94chk button')].find(x=>/Start 1 is on spikes/.test(x.textContent));b.click()});await pg.waitForTimeout(150);
ok(await pg.evaluate(()=>E94.flash&&E94.flash[0]===10&&E94.flash[1]===10),'check click flashes the tile');
/* 7 · zones: round 1 → tap the centre = 5×5; undo / redo */
await pg.evaluate(()=>{document.querySelector('[data-e94="tab"][data-v="zones"]').click()});await pg.waitForTimeout(300);
await pg.evaluate(()=>{document.querySelector('.e94zr [data-e94="round"][data-v="0"]').click()});await pg.waitForTimeout(250);
await scrollBoard();{const z=await tileXY(6,6);await pg.mouse.click(z.x,z.y);await pg.waitForTimeout(300)}
o.z=await pg.evaluate(()=>ST.draft.rounds[0].zone);ok(o.z===3,'zone painted '+o.z);
await pg.evaluate(()=>{document.querySelector('[data-e94="undo"]').click()});await pg.waitForTimeout(300);
o.zu=await pg.evaluate(()=>ST.draft.rounds[0].zone);ok(o.zu===1,'undo '+o.zu);
await pg.evaluate(()=>{document.querySelector('[data-e94="redo"]').click()});await pg.waitForTimeout(300);
ok(await pg.evaluate(()=>ST.draft.rounds[0].zone===3),'redo');
await pg.keyboard.press('Control+z');await pg.waitForTimeout(300);ok(await pg.evaluate(()=>ST.draft.rounds[0].zone===1),'Ctrl+Z');
/* 8 · round strip: remove R3, add one back, toggle PvP on R1, reorder */
await pg.evaluate(()=>{document.querySelector('[data-e94="rmround"][data-v="2"]').click()});await pg.waitForTimeout(300);
ok(await pg.evaluate(()=>ST.draft.rounds.length===2),'round removed');
await pg.evaluate(()=>{document.querySelector('[data-e94="addround"]').click()});await pg.waitForTimeout(300);
ok(await pg.evaluate(()=>ST.draft.rounds.length===3&&E94.round===2&&document.querySelectorAll('.e94rc').length===3),'round added');
await pg.evaluate(()=>{document.querySelector('[data-e94="flag"][data-v="0|pvp"]').click()});await pg.waitForTimeout(250);
ok(await pg.evaluate(()=>ST.draft.rounds[0].pvp===1),'flag toggled');
o.ord=await pg.evaluate(async()=>{const a=ST.draft.rounds.map(r=>r.n);document.querySelector('[data-e94="rright"][data-v="0"]').click();await new Promise(r=>setTimeout(r,250));return [a,ST.draft.rounds.map(r=>r.n)]});
ok(o.ord[1][0]===o.ord[0][1]&&o.ord[1][1]===o.ord[0][0],'reorder');
await pg.evaluate(async()=>{const s=document.querySelector('[data-e94f="rounds.0.end"]');s.value='rot';s.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(r=>setTimeout(r,250))});
ok(await pg.evaluate(()=>ST.draft.rounds[0].end==='rot'&&ST.draft.rounds[0].endN>=1&&!!document.querySelector('[data-e94f="rounds.0.endN"]')),'end condition');
/* 9 · keyboard: focus the board, arrows + Enter stamp the selected tool, Delete removes */
await pg.evaluate(()=>{document.querySelector('[data-e94="tab"][data-v="terrain"]').click()});await pg.waitForTimeout(250);
await pg.evaluate(()=>{document.querySelector('[data-e94tool="tunnel"]').click()});await pg.waitForTimeout(250);
await pg.evaluate(()=>{E94.cursor=[6,6];E94.cv.focus()});await pg.keyboard.press('ArrowUp');await pg.keyboard.press('ArrowLeft');await pg.keyboard.press('Enter');await pg.waitForTimeout(300);
ok(await pg.evaluate(()=>ST.draft.layout.tunnels.some(t=>t[0]===5&&t[1]===5)),'keyboard stamp');
await pg.evaluate(()=>E94.cv.focus());await pg.keyboard.press('Delete');await pg.waitForTimeout(300);
ok(await pg.evaluate(()=>!ST.draft.layout.tunnels.some(t=>t[0]===5&&t[1]===5)),'keyboard delete');
ok(await pg.evaluate(()=>[...document.querySelectorAll('#ed94 button')].every(b=>(b.getAttribute('aria-label')||b.textContent).trim().length>0)),'buttons named');
/* 10 · the rest of a valid event (classic layout), then ▶ Test play */
await pg.evaluate(()=>{document.querySelector('[data-st="classic"]').click()});await pg.waitForTimeout(300);
await pg.evaluate(()=>{ST.draft.name='Designer Games 94';studioRedraw()});await pg.waitForTimeout(300);
o.before=await pg.evaluate(()=>({d:JSON.stringify(ST.draft),u:E94.undo.length,r:E94.redo.length,ev:Object.keys(EVENTS).length,hall:null}));
o.hall0=await pg.evaluate(async()=>(await Store.list('hall')).length);
await pg.evaluate(()=>{setSpeedUI&&setSpeedUI('fast')});
await pg.evaluate(()=>{document.querySelector('[data-e94="test"]').click()});
ok(await until(()=>S&&S.e94test&&S.evKey==='__e94t',null,15000),'test play started');
o.enum=await pg.evaluate(()=>Object.keys(EVENTS).includes('__e94t')||Object.keys(EVENTS).length);
ok(o.enum===o.before.ev,'test event not listed');
let ran=false;for(let i=0;i<160&&!ran;i++){await pg.waitForTimeout(250);ran=await pg.evaluate(()=>{if(CUR_MODAL&&!(S&&S.over))try{CUR_MODAL.done(null)}catch(e){}return !!(S&&S.e94test&&(S.turnNo>=3||S.over))})}
o.turns=await pg.evaluate(()=>({t:S.turnNo,cpu:S.players.every(p=>p.cpu),btn:!!document.getElementById('e94back')}));
ok(ran&&o.turns.cpu&&o.turns.btn,'test play ran a few turns '+JSON.stringify(o.turns));
o.blocked=await pg.evaluate(async()=>{await Store.put('hall','x94',{a:1});return (await Store.list('hall')).some(x=>x&&x.a===1)});ok(!o.blocked,'Store writes blocked during the test');
await pg.evaluate(()=>{document.getElementById('e94back').click()});
ok(await until(()=>!!document.getElementById('e94cv')&&E94.cv.isConnected&&ST.tab==='events'&&ST.view==='edit',null,20000),'back in the designer');
await pg.waitForTimeout(600);
o.after=await pg.evaluate(()=>({d:JSON.stringify(ST.draft),u:E94.undo.length,r:E94.redo.length,step:ST.edStep,back:!!document.getElementById('e94back')}));
ok(o.after.d===o.before.d&&o.after.u===o.before.u&&o.after.r===o.before.r&&o.after.step===1&&!o.after.back,'designer unchanged after the test '+JSON.stringify({u:[o.before.u,o.after.u],same:o.after.d===o.before.d,step:o.after.step}));
o.hall1=await pg.evaluate(async()=>(await Store.list('hall')).length);ok(o.hall1===o.hall0,'no Hall write');
/* 11 · save → reload → the same event */
await pg.evaluate(()=>{document.querySelector('[data-st="save"]').click()});await pg.waitForTimeout(800);
o.saved=await pg.evaluate(async()=>{const e=CUSTOM.events.find(x=>x.name==='Designer Games 94');return e?JSON.stringify(e):null});ok(!!o.saved,'saved');
const strip=s=>{const e=JSON.parse(s);delete e.updated;delete e.created;delete e.id;delete e.custom;return JSON.stringify(e)};
ok(o.saved&&strip(o.saved)===strip(o.before.d),'saved = the designer state');
ok(await until(()=>(localStorage.getItem('flavius_customEvents')||'').includes('Designer Games 94')),'saved to this browser');
o.lsA=await pg.evaluate(()=>({n:localStorage.length,ce:(localStorage.getItem('flavius_customEvents')||'').length,tot:Object.keys(localStorage).reduce((s,k)=>s+(localStorage.getItem(k)||'').length,0)}));
await pg.reload();await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
o.reload=await pg.evaluate(async()=>{await loadCustoms();const e=CUSTOM.events.find(x=>x.name==='Designer Games 94');return e?JSON.stringify(e):null});
if(o.reload!==o.saved){console.log('LS',JSON.stringify(o.lsA),await pg.evaluate(()=>({n:localStorage.length,ce:(localStorage.getItem('flavius_customEvents')||'').length,keys:Object.keys(localStorage).slice(0,40)})));const A=JSON.parse(o.saved||'{}'),Z=JSON.parse(o.reload||'{}');console.log('DIFF',Object.keys({...A,...Z}).filter(k=>JSON.stringify(A[k])!==JSON.stringify(Z[k])).map(k=>k+': '+String(JSON.stringify(A[k])).slice(0,200)+' | '+String(JSON.stringify(Z[k])).slice(0,200)))}
ok(o.reload===o.saved,'reload: same data');
/* 12 · the OLD event opens unchanged and saves the same */
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();openStudio('events')});await until(()=>!!document.getElementById('studio'));
o.oldNow=await pg.evaluate(()=>JSON.stringify(CUSTOM.events.find(e=>e.id==='eold94')));
ok(await until(()=>!!document.querySelector('[data-st="edit"][data-id="eold94"]'),null,8000),'old event listed');
await pg.evaluate(()=>{const e=document.querySelector('[data-st="edit"][data-id="eold94"]');e&&e.click()});
ok(await until(()=>!!document.getElementById('e94cv')&&!!E94.geo&&ST.edStep===1,null,8000),'old event opens on the arena');
await pg.waitForTimeout(500);
o.oldDraft=await pg.evaluate(()=>JSON.stringify(ST.draft));ok(o.oldDraft===o.oldNow,'old event opened unchanged');
await pg.evaluate(()=>{document.querySelector('[data-st="save"]').click()});await pg.waitForTimeout(800);
o.oldSaved=await pg.evaluate(async()=>JSON.stringify((await Store.list('customEvents')).find(e=>e.id==='eold94')));
if(!o.oldNow||!o.oldSaved){console.log('OLDMISS',!!o.oldNow,!!o.oldSaved,fails);ok(false,'old event missing')}else{const a=JSON.parse(o.oldNow),z=JSON.parse(o.oldSaved);delete a.updated;delete z.updated;ok(JSON.stringify(a)===JSON.stringify(z),'old event round-trips');
 const L0=OLD.layout,L1=z.layout;ok(JSON.stringify(L0)===JSON.stringify(L1)&&JSON.stringify(OLD.rounds)===JSON.stringify(z.rounds),'old layout + rounds untouched')}
o.err=await pg.evaluate(m=>errNew92(m).map(e=>e.kind+':'+e.msg).slice(0,6),mark);
/* 13 · phone 390: no horizontal overflow, tap to stamp, long-press removes */
const pc=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});await pc.addInitScript(init);const pp=await pc.newPage();await pp.route(/fonts\./,r=>r.abort());pp.on('pageerror',e=>errs.push('phone: '+e.message));
await pp.goto('file://'+process.argv[2]);await pp.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
await pp.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();openStudio('events')});await pp.waitForTimeout(1200);
await pp.evaluate(()=>{document.querySelector('[data-st="new"]').click()});await pp.waitForTimeout(400);
await pp.evaluate(()=>{ST.edStep=1;edGoStep(1)});await pp.waitForFunction(()=>!!E94.geo&&E94.cv&&E94.cv.isConnected,null,{timeout:8000}).catch(()=>{});
o.ph=await pp.evaluate(()=>{const mb=document.getElementById('mBody');const wide=[...document.querySelectorAll('#ed94 *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+1&&!e.closest('.e94rounds')}).map(e=>e.className||e.tagName).slice(0,5);
  return {doc:document.documentElement.scrollWidth,mb:mb.scrollWidth-mb.clientWidth,cv:E94.cv.getBoundingClientRect().width,wide}});
ok(o.ph.doc<=390&&o.ph.mb<=1&&o.ph.cv<=390&&!o.ph.wide.length,'phone overflow '+JSON.stringify(o.ph));
await pp.evaluate(()=>{document.querySelector('[data-st="clearboard"]').click()});await pp.waitForTimeout(300);
await pp.locator('[data-e94tool="pillar"]').tap();await pp.waitForTimeout(250);
await pp.evaluate(()=>E94.cv.scrollIntoView({block:'center'}));await pp.waitForTimeout(200);
{const z=await pp.evaluate(()=>{const b=E94.cv.getBoundingClientRect();const m=e94C(6,3);return {x:b.left+m.x,y:b.top+m.y}});await pp.touchscreen.tap(z.x,z.y);await pp.waitForTimeout(300)}
o.phP=await pp.evaluate(()=>ST.draft.layout.pillars.map(p=>[p.r,p.c]));ok(JSON.stringify(o.phP)==='[[6,3]]','phone tap-stamp '+JSON.stringify(o.phP));
o.phLP=await pp.evaluate(async()=>{const b=E94.cv.getBoundingClientRect();const m=e94C(6,3);const x=b.left+m.x,y=b.top+m.y;const ev=t=>new PointerEvent(t,{bubbles:true,pointerType:'touch',pointerId:7,clientX:x,clientY:y,button:0,isPrimary:true});
  E94.cv.dispatchEvent(ev('pointerdown'));await new Promise(r=>setTimeout(r,800));E94.cv.dispatchEvent(ev('pointerup'));await new Promise(r=>setTimeout(r,300));return ST.draft.layout.pillars.length});
ok(o.phLP===0,'phone long-press removes');

await pg.close();await pc.close();
ok(!o.err.length,'error log '+JSON.stringify(o.err));
console.log(JSON.stringify({step:o.step,tabs:o.tabs,hov:o.hov,chk:o.chk,turns:o.turns,ph:o.ph}));console.log('FAILS',fails);console.log('ERRS',errs.slice(0,4));await b.close();if(fails.length||errs.length)process.exit(1)})();

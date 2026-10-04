/* online v0.82 (mock, several windows): 🏛 Found your house first (greyed window, need_domus, bad / taken names), the Domus screen
   (4 slots, record, locked name, rank bar with tokens + living counts, patron look), Glory ranks + no demotion, prices by AP + the buy
   confirmation, the flat award × table size in the result line (Custom: no purse), the pre-match room's table note, the guest landing
   (read-only, refusals, guest glows + count, two hours), invites via lobby.accept (room_gone + 👁 Watch, invite.gone), free tickets +
   Flavius's guest pass (only while the purse is thin and a room sells seats; +1 Fame on the Domus record), the patron look saved on the house
   (domus.patron) and drawn on ANOTHER screen from the stands entries, "🎟 Patron of House …" in the stands.
   SHOT=<dir> saves screenshots onl_*.png. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');
  window.T82=[];const iv=setInterval(()=>{if(typeof mToast==='function'){const m=mToast;mToast=function(h){T82.push(String(h));return m.apply(this,arguments)};clearInterval(iv)}},20)});
const errs=[];const pg=async n=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));await p.goto(URL0);return p};
const A=await pg('A');await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl/.test(k))localStorage.removeItem(k)});await A.reload();
const B=await pg('B'),C=await pg('C'),F=await pg('F');await A.waitForTimeout(2500);
const shot=async(p,n)=>{if(SHOT)await p.screenshot({path:path.join(SHOT,'onl_'+n+'.png')})};
const err=async(p,fn,arg)=>p.evaluate(async([fn,arg])=>{try{await (0,eval)('('+fn+')')(arg);return 'ok'}catch(e){return (e.code||'')+'|'+((e.extra||{}).why||'')+'|'+e.message}},[fn.toString(),arg]);
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
/* ── 1. A signs in: the house first ── */
await A.evaluate(async()=>{menuHide();ONL.acct=await NET.req('auth.signin',{name:'Alpha'});onlineOpen('play')});await A.waitForTimeout(1500);
const f1=await A.evaluate(()=>({card:!!document.querySelector('#onl .dom82-found'),grey:document.querySelectorAll('#onl [data-d82]').length,live:document.querySelectorAll('#onl .dom82-grey [data-onl]').length,need:ONL.needDomus}));
ok(f1.card&&f1.grey>5&&!f1.live&&f1.need,'found-your-house card, everything else greyed');await shot(A,'found');
ok(/^need_domus\|/.test(await err(A,o=>NET.req('char.create',o),{name:'Too Soon',cls:'hero'})),'char.create refused without a house');
await A.fill('#dom82Name','ab');await A.click('[data-onl82="found"]');await A.waitForTimeout(300);ok(await A.evaluate(()=>/3–24/.test(document.querySelector('#onl .onl-err')?.textContent||'')),'short name refused');
await A.fill('#dom82Name','Vettii');await A.click('[data-onl82="found"]');await A.waitForTimeout(1500);
const f2=await A.evaluate(()=>({need:ONL.needDomus,name:ONL.domus&&ONL.domus.name,creator:!!document.querySelector('#onl .onl-create')}));ok(!f2.need&&f2.name==='Vettii'&&f2.creator,'house founded → the creator opens');
/* B: a taken name, then its own */
await B.evaluate(async()=>{menuHide();ONL.acct=await NET.req('auth.signin',{name:'Beta'})});
ok(/^name_taken\|/.test(await err(B,o=>NET.req('domus.create',o),{name:'vettii'})),'house names are unique');
await B.evaluate(async()=>{await NET.req('domus.create',{name:'Aemilii'});ONL.char=await NET.req('char.create',{name:'Beta the Bold',cls:'soldier'})});
await F.evaluate(async()=>{menuHide();ONL.acct=await NET.req('auth.signin',{name:'Gamma'});await NET.req('domus.create',{name:'House Gammae'});ONL.char=await NET.req('char.create',{name:'Gamma the Swift',cls:'amazonia'})});
/* ── 2. four gladiators, the Domus screen ── */
const g4=await A.evaluate(async()=>{const out=[];for(const [n,c] of [['Alpha the Bold','hero'],['Aulus','slave'],['Brutus','veteranus'],['Cato','venatore']])out.push((await NET.req('char.create',{name:n,cls:c})).domus);
  let fifth='';try{await NET.req('char.create',{name:'Decimus',cls:'royalty'})}catch(e){fifth=e.message}return {out,fifth}});
ok(g4.out.every(x=>x)&&/Up to 4/.test(g4.fifth),'four gladiators per house, each carries the house');
ok(/^domus_locked\|/.test(await err(A,o=>NET.req('domus.rename',o),{name:'Nova'})),'a house with gladiators keeps its name');
/* glory: Brutus is a veteran by Glory, Aulus was Gregarius before v0.82 (never demoted) */
await A.evaluate(async()=>{const w=mockLoad();const cs=Object.values(w.chars).filter(c=>c.owner===ONL.acct.id);const by=n=>cs.find(c=>c.name===n);
  Object.assign(by('Brutus'),{glory:700});Object.assign(by('Aulus'),{glory:40,rank:'gregarius',rankK:'gregarius'});mockSave(w);ONL.newGlad=false;await onlRefresh();ONL.tab='char';onlRedraw()});await A.waitForTimeout(1800);
const dm=await A.evaluate(()=>{const o=document.getElementById('onl');return {rail:[...o.querySelectorAll('.onl-rail button')].map(b=>b.textContent).join('|'),slots:o.querySelectorAll('.onl-gslot').length,empty:o.querySelectorAll('.onl-gslot.empty').length,
  rec:o.querySelector('.dom82-rec')?.textContent||'',lock:!!o.querySelector('.dom82-lock'),bar:o.querySelectorAll('.rb82-band').length,toks:o.querySelectorAll('.rb82-tok').length,counts:[...o.querySelectorAll('.rb82-n')].map(x=>x.textContent),
  bandTop:o.querySelector('.rb82-band b')?.textContent||'',pat:!!o.querySelector('.pat82 svg'),aulus:ONLC.rankFor(ONL.chars.find(c=>c.name==='Aulus')).k,brutus:ONLC.rankFor(ONL.chars.find(c=>c.name==='Brutus')).k,
  barRight:(()=>{const a=o.querySelector('.rb82').getBoundingClientRect(),m=o.querySelector('.dom82-main').getBoundingClientRect();return a.left>m.left})()}});
ok(/🏛 Domus/.test(dm.rail)&&dm.slots===4&&dm.empty===0,'Domus tab: 4 gladiator slots');ok(/Fame/.test(dm.rec)&&/Lifetime CF/.test(dm.rec)&&dm.lock,'house record + locked name');
ok(dm.bar===8&&/Invictus/.test(dm.bandTop)&&dm.toks===4&&dm.barRight,'rank bar on the right, the top rank at the top, four tokens (v0.83: 8 ranks)');ok(dm.counts.length===8&&dm.counts.some(t=>/[1-9]\d* living/.test(t)),'living counts by rank');
ok(dm.aulus==='gregarius'&&dm.brutus==='veteranus','Glory ranks, never demoted');ok(dm.pat,'patron look');
await A.evaluate(()=>{const d=document.querySelector('details.pat82d');if(d)d.open=true});await A.selectOption('select[data-pat82="skin"]',{index:3}).catch(()=>{});await A.waitForTimeout(200);ok(await A.evaluate(()=>!!localStorage.getItem('flavius_patron82.'+ONL.acct.id)),'patron draft kept while editing');
await A.waitForTimeout(1200);const pat=await A.evaluate(async()=>({srv:(await NET.req('domus.get',{})).domus.patron,draft:localStorage.getItem('flavius_patron82.'+ONL.acct.id),skin:document.querySelector('select[data-pat82="skin"]').value}));
ok(pat.srv&&pat.srv.skin===pat.skin&&!pat.draft,'patron look saved on the house (domus.patron), the draft cleared');
await A.evaluate(()=>{const e=document.querySelector('.rb82');if(e)e.scrollIntoView()});await shot(A,'domus');
/* phones: the bar is a strip above the slots */
await A.setViewportSize({width:420,height:860});await A.waitForTimeout(400);const ph=await A.evaluate(()=>{const a=document.querySelector('.rb82').getBoundingClientRect(),s=document.querySelector('.onl-gslots').getBoundingClientRect();return a.bottom<=s.top+2&&a.width>a.height});
ok(ph,'phone: the rank bar is a strip above the slots');await A.evaluate(()=>{document.querySelector('.rb82').scrollIntoView()});await shot(A,'domus_phone');await A.setViewportSize({width:1300,height:900});
/* ── 3. prices by AP + the confirmation ── */
await A.evaluate(async()=>{const w=mockLoad();const c=w.chars[ONL.char.id];c.wallet=100;mockSave(w);await onlRefresh();ONL.tab='armory';ONL.mkt='a';onlRedraw()});await A.waitForTimeout(300);
/* v0.83: the market board (137) — the tile's title names the AP, the tile shows the price */
const pr=await A.evaluate(()=>{const t=document.querySelector('#onl .mb83-it[data-v="galea"]');return {ocrea:ONLC.priceOf(onlCatalog().ocrea),txt:t?(t.title+' '+t.textContent):'',w1:ONLC.priceOf(onlCatalog().gladius||{kind:'w',lv:1})}});
ok(pr.ocrea===220&&/2 AP/.test(pr.txt)&&/ 30/.test(pr.txt)&&pr.w1===60,'prices by AP and level');
await A.click('#onl [data-onl82="buy"][data-v="galea"]');await A.waitForTimeout(400);const cf=await A.evaluate(()=>document.querySelector('.ask76bg')?.textContent||'');await shot(A,'buy');
await A.click('.ask76bg [data-ask76="1"]');await A.waitForTimeout(900);const wal=await A.evaluate(()=>ONL.char.wallet);ok(/30 coin/.test(cf)&&/100 → 70/.test(cf)&&wal===70,'buy confirmation with the price');
/* ── 3b. the Storeroom: move, tick, shelf ── */
await A.evaluate(()=>{ONL.tab='char';onlRedraw()});await A.waitForTimeout(1500);
const ids=await A.evaluate(()=>Object.fromEntries(ONL.chars.map(c=>[c.name,c.id])));
const sr0=await A.evaluate(()=>{const o=document.getElementById('sr82');return o?{rows:o.querySelectorAll('.sr82-it').length,txt:o.textContent}:null});
ok(sr0&&sr0.rows===1&&/Iron Helm/.test(sr0.txt)&&/with Alpha the Bold/.test(sr0.txt),'Storeroom lists the house’s gear and who has it');
await A.selectOption(`#sr82 select[data-sr83mv="${ids['Alpha the Bold']}|galea"]`,ids['Aulus']);await A.waitForTimeout(1200);
const sr1=await A.evaluate(id=>{const w=mockLoad();return {aulus:w.chars[id].gear,txt:document.getElementById('sr82').textContent}},ids['Aulus']);ok(sr1.aulus.includes('galea')&&/with Aulus/.test(sr1.txt),'move between gladiators');
await A.click(`#sr82 input[data-sr82eq="${ids['Aulus']}|galea"]`);await A.waitForTimeout(1200);
ok(await A.evaluate(id=>!ONLC.equipOf(mockLoad().chars[id]).includes('galea'),ids['Aulus']),'untick: left at home');await shot(A,'storeroom');
await A.selectOption(`#sr82 select[data-sr83mv="${ids['Aulus']}|galea"]`,'house');await A.waitForTimeout(1200);
ok(await A.evaluate(()=>/on the shelf/.test(document.getElementById('sr82').textContent)&&(ONL82.dg.gear||[]).includes('galea')),'onto the house shelf');
/* ── 4. a Ranked bout with two lanistas: half the award; the room note ── */
const R1=await A.evaluate(async()=>{const L=await NET.req('lobby.create',{ev:'democritus',loc:6,ranked:true,cry:false});return L.id});
await B.evaluate(async id=>{await NET.req('lobby.join',{id})},R1);await B.evaluate(()=>NET.req('ping'));await A.evaluate(async()=>{ONL.lobbies=await NET.req('lobby.list');ONL.tab='play';onlRedraw()});await A.waitForTimeout(300);
await A.evaluate(()=>{ONL.tab='char';onlRedraw()});await A.waitForTimeout(400);
const lk=await A.evaluate(()=>[...document.querySelectorAll('#sr82 .sr82-chip')].map(b=>b.textContent).join('|'));ok(/🔒 Alpha the Bold/.test(lk),'a seated gladiator is locked in the Storeroom');
ok(/^in_match\|/.test(await err(A,o=>NET.req('domus.equip',o),{char:ids['Alpha the Bold'],item:'galea',on:true})),'server-side lock (in a match)');
await A.evaluate(()=>{ONL.tab='play';onlRedraw()});await A.waitForTimeout(300);
const note=await A.evaluate(()=>document.querySelector('#onlRoom80 .tbl82')?.textContent||'');ok(/2 lanistas: half rewards · seat 4 for the full purse/.test(note),'room: table-size note');await shot(A,'room');
const st=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlPre82(L);const t=L.players.map((p,i)=>({seat:i,won:i===0,place:i?2:1,f:i?5:20,coin:40,survives:true}));ONL82._t=t;return t},R1);
await B.evaluate(async([id,t])=>{await NET.req('match.result',{id,table:t,hash:'h'})},[R1,st]);
const rA=await A.evaluate(async id=>{const r=await NET.req('match.result',{id,table:ONL82._t,hash:'h'});T82.length=0;onlSettled(r);await new Promise(x=>setTimeout(x,2700));return {pay:r.out&&r.out.pay,award:r.out&&r.out.award,f:r.out&&r.out.factor,toast:T82.join(' ')}},R1);
ok(rA.award===Math.round(12*0.5)&&rA.pay===rA.award-Math.round(rA.award*0.2)&&rA.f===0.5&&new RegExp('\\+'+rA.pay+' coin').test(rA.toast)&&/win \+50%/.test(rA.toast)&&/×½ table/.test(rA.toast),'award × table shown');
const cu=await A.evaluate(async()=>{ONL82.pre={ranked:false};T82.length=0;onlSettled({char:ONL.char,out:{pay:0,cf:9,glory:4.5,factor:0.5}});await new Promise(x=>setTimeout(x,2700));return T82.join(' ')});ok(/Custom bout — no purse/.test(cu)&&!/carried/.test(cu),'Custom: no purse');
const hd=await A.evaluate(async()=>(await NET.req('domus.get',{})).domus);ok(hd.bouts===1&&hd.wins===1&&hd.survived===1&&hd.lifeCF===20,'the house record follows the result');
/* ── 5. the guest ── */
await C.evaluate(async()=>{localStorage.removeItem('flavius_onlacct');menuHide();onlineOpen('play')});await C.waitForTimeout(1500);ok(await C.evaluate(()=>!!document.querySelector('#onl [data-onl82="guest"]')),'sign-in card offers Watch as a guest');
await C.click('#onl [data-onl82="guest"]');await C.waitForTimeout(1800);
const gl=await C.evaluate(()=>{const o=document.getElementById('onl');return {g:ONL.acct&&ONL.acct.guest,id:ONL.acct&&ONL.acct.id,tabs:[...o.querySelectorAll('.onl-rail [data-onl="tab"]')].map(b=>b.dataset.v),quick:o.querySelectorAll('[data-onl="quick"]').length,gq:o.querySelectorAll('[data-g82="quick"]').length,card:!!o.querySelector('.g82card'),left:(o.querySelector('#g82left')||{}).textContent||''}});
ok(gl.g&&/^guest-g[a-z0-9]{8,}/.test(gl.id)&&gl.tabs.join()==='play,lobby,spect,auction,wagers,hall' /* v0.84: guests read the auction too */&&!gl.quick&&gl.gq>0&&gl.card&&/h|min/.test(gl.left),'guest landing, read-only');await shot(C,'guest');
await C.click('#onl [data-g82="quick"]',{force:true});await C.waitForTimeout(300);ok(await C.evaluate(()=>T82.some(t=>/Sign in to fight/.test(t))),'a guest control says Sign in to …');
ok(/^guest\|\|Sign in to speak in the Forum/.test(await err(C,o=>NET.req('forum.say',o),{q:'ave'})),'server-side refusal for guests');
ok(Array.isArray(await C.evaluate(()=>NET.req('lobby.list'))),'guests read the lobby list');
await C.evaluate(()=>NET.req('auth.guest',{tz:'Europe/Rome'}));
const hereA=await A.evaluate(async()=>{await NET.req('hello',{all:1});await new Promise(r=>setTimeout(r,100));ONL.tab='play';onlRedraw();let e1='';try{onlHTML()}catch(e){e1=e.message+e.stack}return {e1,onl:!!document.getElementById('onl'),tab:ONL.tab,h:ONLF.here,cap:onlCap80().replace(/<[^>]*>/g,''),dots:(onlDots80(1).match(/omap-dot g82/g)||[]).length}});
ok(hereA.h.guests>=1&&/1 guest/.test(hereA.cap)&&hereA.dots>=1,'guests counted apart, their own glow');
const exp=await C.evaluate(async()=>{const G=JSON.parse(localStorage.getItem('flavius_onlmock_guests82'));G[ONL.acct.id].first=Date.now()-3*3600e3;localStorage.setItem('flavius_onlmock_guests82',JSON.stringify(G));
  try{await NET.req('hello',{all:1});return 'no'}catch(e){return e.code}});ok(exp==='guest_expired','two hours, then sign in');
await C.evaluate(async()=>{const G=JSON.parse(localStorage.getItem('flavius_onlmock_guests82'));G[ONL.acct.id].first=Date.now();localStorage.setItem('flavius_onlmock_guests82',JSON.stringify(G))});
/* ── 6. invitations die with the room ── */
const inv=await A.evaluate(async()=>{const L=await NET.req('lobby.create',{ev:'cassian',loc:3,ranked:false,cry:false});ONL.lobbies=await NET.req('lobby.list');return L.id});
await B.evaluate(()=>{onlineOpen('play')});await B.waitForTimeout(1200);
await A.evaluate(async([id,to])=>{await NET.req('lobby.invite',{id,to})},[inv,await B.evaluate(()=>ONL.acct.id)]);await B.waitForTimeout(1500);
for(let i=0;i<20&&!(await B.evaluate(()=>!!document.querySelector('.inv80bg')));i++)await B.waitForTimeout(300);
const iv1=await B.evaluate(id=>({has:ONL81.invRooms.has(id),dom:ONL82.dom[Object.keys(ONL82.dom).find(k=>ONL82.dom[k]==='Vettii')]==='Vettii',pop:document.querySelector('.inv80bg')?.textContent||''}),inv);
ok(iv1.has&&/House Vettii/.test(iv1.pop),'invite arrives with the inviter’s house');await shot(B,'invite');
await A.evaluate(async id=>{await NET.req('lobby.leave',{id})},inv);await B.waitForTimeout(1200);
ok(await B.evaluate(id=>!ONL81.invRooms.has(id)&&!document.querySelector('.inv80bg'),inv),'invite.gone removes the invitation');
ok(/^room_gone\|/.test(await err(B,id=>NET.req('lobby.accept',{id}),inv)),'accept a closed room → room_gone');
/* started room: 👁 Watch */
const inv2=await A.evaluate(async()=>(await NET.req('lobby.create',{ev:'egidious',loc:2,ranked:false,cry:false})).id);
await A.evaluate(async([id,to])=>{const w=mockLoad();const me=w.accounts[ONL.acct.id];for(const k of Object.keys(me))if(/^iv/.test(k))delete me[k];mockSave(w);await NET.req('lobby.invite',{id,to})},[inv2,await B.evaluate(()=>ONL.acct.id)]);await B.waitForTimeout(1200);
await B.evaluate(()=>{for(const p of document.querySelectorAll('.inv80bg'))p.remove()});
await A.evaluate(id=>{const w=mockLoad();w.lobbies[id].status='live';w.lobbies[id].started=Date.now();mockSave(w)},inv2);
const lj=await err(B,id=>NET.req('lobby.join',{id}),inv2);await B.waitForTimeout(400);
ok(/^room_gone\|.*started/.test(lj)&&await B.evaluate(()=>!!document.querySelector('.dead81bg [data-onl81="dwatch"]')),'a started room offers 👁 Watch');
await B.evaluate(()=>{for(const p of document.querySelectorAll('.dead81bg'))p.remove()});
ok(/^no_invite\|/.test(await err(B,id=>NET.req('lobby.accept',{id}),await A.evaluate(async()=>{const w=mockLoad();const L=Object.values(w.lobbies).find(x=>x.status==='live'&&x.ev==='egidious');L.status='done';mockSave(w);return (await NET.req('lobby.create',{ev:'democritus',loc:4,ranked:false,cry:false})).id}))),'no invitation → no_invite');
/* ── 7. free tickets + the guest pass ── */
const R4=await A.evaluate(async()=>{const L=(ONL.lobbies=await NET.req('lobby.list')).find(x=>x.ev==='democritus'&&x.loc===4);await NET.req('lobby.set',{id:L.id,free:1});return L.id});
const lb=await A.evaluate(async id=>{const r=(await NET.req('lobby.list')).find(x=>x.id===id);return {free:r.free,ticket:r.ticket}},R4);ok(lb.free&&!lb.ticket,'host sets free tickets');
const fsel=await A.evaluate(async()=>{ONL.lobbies=await NET.req('lobby.list');ONL.tab='play';let v='';for(let i=0;i<15&&v!=='free';i++){onlRedraw();await new Promise(r=>setTimeout(r,300));const s=document.querySelector('#onlRoom80 select[data-onlrs="ticket"]');v=s?s.value:''}return v});ok(fsel==='free','the host’s ticket select reads free');
await F.evaluate(async id=>{await NET.req('lobby.join',{id})},R4);
await B.evaluate(async()=>{const w=mockLoad();onlMockChar(w,ONL.acct.id).wallet=30;mockSave(w);await onlRefresh();ONL.tab='play';onlRedraw()});await B.waitForTimeout(300);
ok(await B.evaluate(()=>!document.getElementById('pass82')),'no pass while the purse is full');
await B.evaluate(async()=>{const w=mockLoad();onlMockChar(w,ONL.acct.id).wallet=8;mockSave(w);await onlRefresh();onlRedraw()});await B.waitForTimeout(300);
const ps=await B.evaluate(()=>document.getElementById('pass82')?.textContent||'');ok(/guest pass/.test(ps)&&/Democritus|democritus/i.test(ps),'pass card names the room');await shot(B,'pass');
await B.evaluate(()=>NET.req('domus.patron',{look:{skin:'#8d5524',robe:'#123456',c1:'#112233',c2:'#445566',hat:'pileus'}}));
await B.click('#pass82 [data-onl82="pass"]');await B.waitForTimeout(900);
const tk=await B.evaluate(id=>{const w=mockLoad();const L=w.lobbies[id];const t=(L.stands||[]).find(s=>s.id===ONL.acct.id);return {t,wal:ONL.char.wallet,card:!!document.getElementById('pass82')}},R4);
ok(tk.t&&tk.t.pass&&tk.t.paid===0&&tk.wal===8&&!tk.card&&tk.t.domus==='Aemilii'&&tk.t.patron&&tk.t.patron.robe==='#123456','one tap → a free seat (house + patron on the entry); the card is gone');
ok(/One guest pass a day/.test(await err(B,id=>NET.req('lobby.pass',{id}),R4)),'once a day');
/* a free ticket for another lanista */
const C2=await pg('D');await C2.evaluate(async()=>{menuHide();ONL.acct=await NET.req('auth.signin',{name:'Delta'});await NET.req('domus.create',{name:'Domus Delta'});ONL.char=await NET.req('char.create',{name:'Delta the Bold',cls:'royalty'})});
const ft=await C2.evaluate(async id=>{const r=await NET.req('lobby.ticket',{id});return {paid:(r.lobby.stands||[]).find(s=>s.id===ONL.acct.id).paid,wal:r.char.wallet}},R4);ok(ft.paid===0&&ft.wal===0,'free ticket');
/* ── 8. the horns: patrons in the stands; the pass pays Fame ── */
await F.evaluate(()=>NET.req('ping'));await B.evaluate(()=>NET.req('ping'));
await A.evaluate(async id=>{ONL.lobbies=await NET.req('lobby.list');const L=await NET.req('lobby.start',{id});onlEnter(L)},R4);await A.waitForTimeout(4500);
const sp=await A.evaluate(()=>(S.spect||[]).filter(s=>s.ticket).map(s=>({n:s.name,c:!!s.cush82,robe:s.look&&s.look.robe,cu:s.cush82&&s.cush82[0]})));
ok(sp.some(s=>s.n==='🎟 Patron of House Aemilii'&&s.robe==='#123456'&&s.cu==='#112233'),'another screen draws the patron the house chose');
ok(sp.length===2&&sp.some(s=>s.n==='🎟 Patron of House Aemilii')&&sp.some(s=>s.n==='🎟 Patron of Domus Delta')&&sp.every(s=>s.c),'"🎟 Patron of House …" in the stands with a cushion');
await A.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{sideTab('stands')}catch(e){}});await A.waitForTimeout(900);
ok(await A.evaluate(()=>/Patron of House Aemilii/.test((document.getElementById('standsPane')||document.body).textContent)),'the Stands tab names the patron');await shot(A,'stands');
const tb=await A.evaluate(id=>{const w=mockLoad();const L=w.lobbies[id];return L.players.map((p,i)=>({seat:i,won:i===0,place:i?2:1,f:i?3:9,coin:0,survives:true}))},R4);
for(const p of [A,F])await p.evaluate(async([id,t])=>{await NET.req('match.result',{id,table:t,hash:'z'})},[R4,tb]);
const fame=await B.evaluate(async()=>(await NET.req('domus.get',{})).domus.fame);ok(fame===1,'sitting through the match on the pass: +1 Fame');
const frec=await B.evaluate(async()=>{await onlRefresh();ONL82.dgAt=0;ONL.tab='char';onlRedraw();await new Promise(r=>setTimeout(r,1200));return document.querySelector('#onl .dom82-rec')?.textContent||''});
ok(/Fame/.test(frec)&&/✦ 1/.test(frec),'the Domus record shows the Fame');
console.log(JSON.stringify({f1,f2,g4,dm,pr,note,rA,gl,hereA,iv1:{has:iv1.has,pop:iv1.pop.slice(0,80)},lj,ps:ps.slice(0,120),tk,ft,sp,fame}));
console.log('MISS',miss);console.log('ERRS',errs);await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();

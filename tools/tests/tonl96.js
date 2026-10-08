/* online v0.96 part D (234-v96onl, mock, four windows): 4 · ＋ Custom room makes NO crier call (only the host's 📣 click does);
   3 · 🚪 Close lobby alone → 🚪 Exit lobby with company; 1 · the room re-laid out (event strip + actions on top, seats as cards in a centred
   grid of 4 a row, table settings under them, the lanistas list on the right with 👑 Give host / ✕, quick-chat chips bottom right, no chat
   log) + phrase bubbles under the speaker's token (names do not move; fades) and beside a standing lanista's name; 2 · 🪙 Send inside
   your own seat card with the gold coin; 8 seats = 2×4; 5 · Lobby Browser filters by event + city + sort, ↻ Refresh re-reads the list;
   6 · the Domus has no Loadouts; phones = one column; 7 · a reload during a live match goes straight back into it.
   SHOT=<dir> also saves room96.png / phone96.png (tools/plans/mock96/built96_room.png comes from SHOT). */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');localStorage.removeItem('flavius_onlquiet80');localStorage.removeItem('flavius_onllb96')});
const errs=[];const P={};for(const n of ['A','B','C','D']){P[n]=await ctx.newPage();P[n].on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]))}
await P.A.goto(URL0,{timeout:90000});await P.A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over)/.test(k))localStorage.removeItem(k)});
for(const n of ['B','C','D'])await P[n].goto(URL0,{timeout:90000});for(const n of ['A','B','C','D'])await P[n].waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const {A,B,C,D}=P;const wait=ms=>A.waitForTimeout(ms);const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');await setup(C,'Gamma','slave');await setup(D,'Delta','venatore');
const until=async(p,fn,arg,ms=20000)=>{const t0=Date.now();let v;while(Date.now()-t0<ms){v=await p.evaluate(fn,arg).catch(()=>null);if(v)return v;await p.waitForTimeout(200)}return v};
const click=async(p,sel)=>{await p.waitForSelector(sel,{timeout:20000});await p.click(sel);await p.waitForTimeout(400)};
for(const p of [A,B,C,D]){p.evaluate(()=>{onlineOpen('play')}).catch(()=>{})}for(const p of [A,B,C,D])await p.waitForSelector('#onl',{timeout:30000}).catch(()=>{});await wait(600);
for(const p of [A,B,C,D])await p.evaluate(()=>{window.__lists=0;const base=NET.req;NET.req=function(t){if(t==='lobby.list')window.__lists++;return base.apply(this,arguments)}});
const ids={};for(const [n,p] of Object.entries(P))ids[n]=await p.evaluate(()=>ONL.acct.id);

/* 4 · ＋ Custom room: no crier */
await click(A,'#onl [data-onl="tab"][data-v="lobby"]');await click(A,'#onl [data-onl="mkroom"][data-v="0"]');
const rid=await until(A,()=>{const L=onlMyLobby();return L&&L.id});await wait(1500);
out.cry0=await A.evaluate(id=>{const L=mockLoad().lobbies[id];return {cry:(L.cry||[]).length,open:(mockLoad().forum||[]).length}},rid);
out.cLines=await C.evaluate(()=>(ONLF.lines||[]).filter(l=>l.k==='open'||l.k==='call').length);
out.callBtn=await A.evaluate(()=>{const b=document.querySelector('#onlRoom80 .r96-acts [data-onl="rcall"]');return b?b.textContent.replace(/\s+/g,' ').trim():''});
ok(out.cry0.cry===0&&out.cLines===0,'no crier call when the room opens '+JSON.stringify([out.cry0,out.cLines]));ok(/Call the crier.*3 left/.test(out.callBtn),'📣 Call the crier in the top actions, 3 left: '+out.callBtn);
/* 3 · alone → Close lobby */
out.leave1=await A.evaluate(()=>(document.querySelector('#onlRoom80 .r96-acts [data-onl="leave"]')||{}).textContent||'');ok(/Close lobby/.test(out.leave1),'alone: '+out.leave1);
/* B and C join */
for(const p of [B,C]){for(let k=0;k<6;k++){await p.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}},rid);if(await until(A,([id,x])=>(mockLoad().lobbies[id].members||[]).some(m=>m.id===x),[rid,await p.evaluate(()=>ONL.acct.id)],5000))break}}
for(const p of [B,C])await p.evaluate(()=>{ONL.tab='play';onlRedraw()});
await until(A,()=>{const L=onlMyLobby();return L&&(L.members||[]).length===3&&document.querySelectorAll('#onlRoom80 .r96-u').length===3});
out.leave2=await A.evaluate(()=>(document.querySelector('#onlRoom80 .r96-acts [data-onl="leave"]')||{}).textContent||'');ok(/Exit lobby/.test(out.leave2),'with company: '+out.leave2);
/* 1 · the layout */
out.lay=await A.evaluate(()=>{const R=document.getElementById('onlRoom80');const q=s=>R.querySelector(s);const box=e=>{const b=e.getBoundingClientRect();return {x:b.left,y:b.top,r:b.right,b:b.bottom,w:b.width}};
  const seats=[...R.querySelectorAll('.r80-seats > .r80-seat')];const S0=box(q('.r80-seats'));const side=q('.r96-side');const tbl=q('.r96-tbl');
  return {cls:R.classList.contains('r96'),seats:seats.length,cards:seats.filter(s=>s.classList.contains('r96s')).length,open:seats.filter(s=>s.classList.contains('open')).length,
    figs:R.querySelectorAll('.r80-seat .r96-fig').length,slots:R.querySelectorAll('.r80-seat .r96-bub[data-bub96]').length,row1:new Set(seats.map(s=>Math.round(box(s).y))).size,
    seatsR:S0.r,sideX:side?box(side).x:0,tblY:tbl?box(tbl).y:0,seatsB:S0.b,users:R.querySelectorAll('.r96-side .r96-u').length,host:R.querySelectorAll('.r96-side [data-onl="rhost"]').length,kick:R.querySelectorAll('.r96-side [data-onl="rkick"]').length,
    seatCtl:R.querySelectorAll('.r80-seat [data-onl="rhost"]').length,chips:R.querySelectorAll('.r96-side .r96-qc [data-onl="rsay"]').length,log:!!document.getElementById('r80Log'),evcard:!!q('.r80-head .r80-ev'),
    openInv:R.querySelectorAll('.r80-seat.open [data-onl="rinvite"]').length,fid:!!q('.r96-acts .fi89 input'),start:!!q('.r96-tbl [data-onl="start"]'),
    snd:!!q('.r80-seat.me .snd92 [data-snd92]'),coin:!!q('.r80-seat.me .snd92 img.coinimg'),silver:/🪙/.test((q('.r80-seat.me .snd92')||{}).textContent||''),sndOut:R.querySelectorAll('.snd92').length}});
const Ly=out.lay;ok(Ly.cls&&Ly.seats===4&&Ly.cards===4&&Ly.open===1&&Ly.figs===3&&Ly.slots===3&&Ly.row1===1,'seats as cards, 4 in one row '+JSON.stringify(Ly));
ok(Ly.sideX>=Ly.seatsR-2&&Ly.tblY>=Ly.seatsB-2,'list on the right, table settings under the seats');ok(Ly.users===3&&Ly.host===2&&Ly.kick===2&&Ly.seatCtl===0,'lanistas list with Give host + ✕');
ok(Ly.chips>=3&&!Ly.log&&Ly.evcard&&Ly.openInv===1&&Ly.fid&&Ly.start,'phrases bottom right, no log, event card, open seat ✉ Invite, FID invite on top, Start under the settings');
ok(Ly.snd&&Ly.coin&&!Ly.silver&&Ly.sndOut===1,'🪙 Send inside my seat card with the gold coin');
/* 1 · a phrase from B → a bubble under B's token on A; names do not move */
const nameY=()=>A.evaluate(id=>{const s=document.querySelector(`#onlRoom80 [data-bub96="${id}"]`);const seat=s&&s.closest('.r80-seat');const n=seat&&seat.querySelector('.r80-who b');return n?Math.round(n.getBoundingClientRect().top):null},ids.B);
const y0=await nameY();await click(B,'#onl #onlRoom80 .r96-qc [data-onl="rsay"][data-v="ave"]');
out.bub=await until(A,id=>{const s=document.querySelector(`#onlRoom80 .r80-seat .r96-bub.on[data-bub96="${id}"]`);return s&&/Ave/.test(s.textContent)?s.textContent:null},ids.B,15000);const y1=await nameY();
ok(!!out.bub,'B’s phrase pops under B’s token on A');ok(y0!=null&&y0===y1,'the name does not move '+JSON.stringify([y0,y1]));
if(SHOT)await A.screenshot({path:path.join(SHOT,'room96a.png')});
out.fade=await until(A,id=>!document.querySelector(`#onlRoom80 .r96-bub.on[data-bub96="${id}"]`),ids.B,15000);ok(out.fade,'the bubble fades');
/* a standing lanista's phrase sits beside the name in the list */
await C.evaluate(async id=>{await NET.req('lobby.stand',{id})},rid);await until(A,id=>!onlMyLobby().players.some(p=>p.id===id)&&!!document.querySelector(`#onlRoom80 .r96-side .r96-lb[data-bub96="${id}"]`),ids.C);
await C.evaluate(()=>{onlRedraw()});await click(C,'#onl #onlRoom80 .r96-qc [data-onl="rsay"][data-v="luck"]');
out.lb=await until(A,id=>{const s=document.querySelector(`#onlRoom80 .r96-side .r96-lb.on[data-bub96="${id}"]`);return s?s.textContent:null},ids.C,15000);ok(/luck/i.test(out.lb||''),'standing: beside the name '+out.lb);
/* 📣 only on the host's click */
await click(A,'#onlRoom80 .r96-acts [data-onl="rcall"]');out.cry1=await until(A,id=>{const n=(mockLoad().lobbies[id].cry||[]).length;return n===1?n:null},rid,8000);ok(out.cry1===1,'the host’s click calls once');
/* 8 seats: 2×4 (Familia) — the screenshot for the record */
await A.selectOption('#onl select[data-onlrs="ev"]','familia');await until(A,()=>onlMyLobby().ev==='familia');await wait(500);
await A.selectOption('#onl select[data-onlrs="seats"]','8');await until(A,()=>onlMyLobby().seats===8&&document.querySelectorAll('#onlRoom80 .r80-seats > .r80-seat').length===8);await wait(600);
out.grid8=await A.evaluate(()=>{const s=[...document.querySelectorAll('#onlRoom80 .r80-seats > .r80-seat')];const ys=[...new Set(s.map(e=>Math.round(e.getBoundingClientRect().top)))];return {n:s.length,rows:ys.length,per:s.filter(e=>Math.round(e.getBoundingClientRect().top)===ys[0]).length}});
ok(out.grid8.n===8&&out.grid8.rows===2&&out.grid8.per===4,'8 seats = 2×4 '+JSON.stringify(out.grid8));
await B.evaluate(async id=>{try{await NET.req('lobby.say',{id,q:'ready'})}catch(e){}},rid);await until(A,id=>!!document.querySelector(`#onlRoom80 .r96-bub.on[data-bub96="${id}"]`),ids.B,8000);
await A.evaluate(()=>{const r=document.getElementById('onlRoom80');if(r)r.scrollIntoView({block:'start'})});await wait(300);
if(SHOT){await A.screenshot({path:path.join(SHOT,'room96.png')});try{fs.copyFileSync(path.join(SHOT,'room96.png'),path.join(__dirname,'..','plans','mock96','built96_room.png'))}catch(e){}}
await A.selectOption('#onl select[data-onlrs="ev"]','democritus');await until(A,()=>onlMyLobby().ev==='democritus');
/* phones: one column, seats first */
await A.setViewportSize({width:390,height:844});await wait(800);
out.phone=await A.evaluate(()=>{const R=document.getElementById('onlRoom80');const sb=R.querySelector('.r80-seats').getBoundingClientRect(),sd=R.querySelector('.r96-side').getBoundingClientRect();return {seatsB:sb.bottom,sideY:sd.top,over:document.documentElement.scrollWidth-window.innerWidth}});
ok(out.phone.sideY>=out.phone.seatsB-2,'phone: the list under the seats '+JSON.stringify(out.phone));
if(SHOT)await A.screenshot({path:path.join(SHOT,'phone96.png')});await A.setViewportSize({width:1300,height:900});await wait(400);
/* 5 · the Lobby Browser: C and D open rooms elsewhere; A filters */
out.mk=[await C.evaluate(async id=>{try{await NET.req('lobby.leave',{id});const r=await NET.req('lobby.create',{ev:'egidious',loc:2});return (r.lobby||r).id}catch(e){return 'ERR '+e.message}},rid),await D.evaluate(async()=>{try{const r=await NET.req('lobby.create',{ev:'cassian',loc:4});return (r.lobby||r).id}catch(e){return 'ERR '+e.message}})];
const [cRid,dRid]=out.mk;
await click(A,'#onl [data-onl="tab"][data-v="lobby"]');await until(A,()=>!ONL.busy);const l0=await A.evaluate(()=>window.__lists);await click(A,'#onl #lb96f [data-lb96r]');
const rows=()=>A.evaluate(()=>[...document.querySelectorAll('#onl table.onl-lb tr[data-row]')].map(r=>r.dataset.row));
out.ref=await until(A,([l0,c,d])=>{const r=[...document.querySelectorAll('#onl table.onl-lb tr[data-row]')].map(x=>x.dataset.row);return window.__lists>l0&&r.includes(c)&&r.includes(d)?r:null},[l0,cRid,dRid]);
ok(!!out.ref,'↻ Refresh re-reads the list');
await A.selectOption('#onl select[data-lb96="ev"]','egidious');await wait(600);out.fEv=await rows();ok(out.fEv.includes(cRid)&&!out.fEv.includes(dRid)&&out.fEv.includes(rid),'event filter (own room kept) '+JSON.stringify(out.fEv));
await A.selectOption('#onl select[data-lb96="ev"]','');await wait(400);await A.selectOption('#onl select[data-lb96="loc"]','4');await wait(600);out.fLoc=await rows();ok(out.fLoc.includes(dRid)&&!out.fLoc.includes(cRid),'city filter '+JSON.stringify(out.fLoc));
await A.selectOption('#onl select[data-lb96="loc"]','');await wait(400);await A.selectOption('#onl select[data-lb96="sort"]','ev');await wait(600);
out.sort=await A.evaluate(()=>[...document.querySelectorAll('#onl table.onl-lb tr[data-row]')].map(r=>{const L=(ONL.lobbies||[]).find(x=>x.id===r.dataset.row);return L?String(onlEvName(L.ev)):''}));
ok(out.sort.length>=3&&out.sort.join()===[...out.sort].sort((a,b)=>a.localeCompare(b)).join(),'sorted by event '+JSON.stringify(out.sort));
out.saved=await A.evaluate(()=>JSON.parse(localStorage.getItem('flavius_onllb96')||'{}').sort);ok(out.saved==='ev','the filters are remembered');
await A.selectOption('#onl select[data-lb96="sort"]','new');await wait(300);
/* 6 · the Domus: no Loadouts */
await D.evaluate(async()=>{ONL.tab='char';ONL.newGlad=false;await onlRefresh();try{await NET.req('domus.get',{})}catch(e){}onlRedraw()});await wait(900);
out.dom=await D.evaluate(()=>({dom:!!document.querySelector('#onl .dom89,#onl .sc89'),kits:document.querySelectorAll('#onl .kt89,#onl [data-d89="kitsave"],#onl [data-d89kit]').length}));ok(out.dom.dom&&out.dom.kits===0,'the Domus has no Loadouts '+JSON.stringify(out.dom));
/* 7 · a live match; B reloads → straight back in */
const drive=async p=>p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const b=document.querySelector('#modal .mbtns .primary')||document.querySelector('#modal .mbtns button');if(b)b.click();return}
  if(!S||S.over||!ONLM.on||!onlmMine()||S.busy)return;if(S.phase==='choice'){const c=document.querySelector('[data-act="coin"]');if(c)c.click();return}if(S.phase==='action'){const e=document.querySelector('[data-act="end"]');if(e)e.click()}}).catch(()=>{});

await A.evaluate(()=>{ONL.tab='play';onlRedraw()});
const L2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L.lobby||L);return L.lobby||L},rid);await B.evaluate(L=>onlEnter(L),L2);
await until(B,()=>ONLM.on&&S&&S.onl&&!!localStorage.getItem('flavius_onlmatch80'),null,30000);
{const t0=Date.now();while(Date.now()-t0<6000){await drive(A);await drive(B);await A.waitForTimeout(250)}}
await B.reload({timeout:90000});await B.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const t1=Date.now();let back=null;while(Date.now()-t1<40000){await drive(A);await A.waitForTimeout(300);back=await B.evaluate(()=>({on:ONLM.on,me:ONLM.me,lobby:S&&S.onl&&S.onl.lobby,menu:!!(document.getElementById('mainMenu')&&!document.getElementById('mainMenu').hidden)})).catch(()=>null);if(back&&back.on&&back.me===1)break}
out.back=back;ok(back&&back.on&&back.me===1&&back.lobby===rid,'reload → back in the match without a click '+JSON.stringify(back));
out.bar=await until(B,()=>!!document.getElementById('btnOnlLeave'),null,10000);ok(out.bar,'🚪 Abandon stays on the arena bar');
console.log(JSON.stringify(out));console.log('MISS',miss);console.log('ERRS',errs);await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();

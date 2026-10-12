/* online v1.0 THE ROOM (302-v100lobby, mock, four windows): the banner (event, chips, ROOM CODE + ⧉ Copy → copied ✓, 📣 crier host only with
   "N of 3 left · next in m:ss", 🚪 Close / Exit lobby, no ✉ Invite / Invite by FID inside the room); Join by code / FID in the Lobby Browser
   (a bad code answers inline, R-… joins that room, FID-… joins the room that lanista is in); the 8-row list (open rows dashed, Glory medals 14 px,
   Domus-rank banners, host's 👑 Give host · ✕ Kick only on hover — and both still work); seat cards (portrait + token, medal chip 18 px,
   Domus-rank chip, bubble under the token); quick chat grouped Room / Taunts (a taunt pops as a bubble); 🧍 Standing strip → 👁 Watching at the
   horns; the house card's ⚔ Join; Familia 8 = compact 4×2 with team edges; phones 390 (no horizontal scroll, 2 seats a row);
   the kill switch (flavius_lobby100off) → the v0.96 room. SHOT=<dir> saves lobby100_1440.png / lobby100_390.png / lobby100_eight.png. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');localStorage.removeItem('flavius_onlquiet80');localStorage.removeItem('flavius_onllb96');localStorage.removeItem('flavius_lobby100off')});
const errs=[];const P={};for(const n of ['A','B','C','D']){P[n]=await ctx.newPage();P[n].on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]))}
await P.A.goto(URL0,{timeout:90000});await P.A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over)/.test(k))localStorage.removeItem(k)});
for(const n of ['B','C','D'])await P[n].goto(URL0,{timeout:90000});for(const n of ['A','B','C','D'])await P[n].waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const {A,B,C,D}=P;const wait=ms=>A.waitForTimeout(ms);const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});
  const lan=await NET.req('lanista.name',{name:'Lanista '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});return lan.lan.fid},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');await setup(C,'Gamma','slave');await setup(D,'Delta','venatore');
const until=async(p,fn,arg,ms=20000)=>{const t0=Date.now();let v;while(Date.now()-t0<ms){v=await p.evaluate(fn,arg).catch(()=>null);if(v)return v;await p.waitForTimeout(200)}return v};
const click=async(p,sel)=>{await p.waitForSelector(sel,{timeout:20000});await p.click(sel);await p.waitForTimeout(400)};
for(const p of [A,B,C,D]){p.evaluate(()=>{onlineOpen('lobby')}).catch(()=>{})}for(const p of [A,B,C,D])await p.waitForSelector('#onl',{timeout:30000}).catch(()=>{});await wait(600);
for(const p of [A,B,C,D])await p.evaluate(()=>{ONL.tab='lobby';onlRedraw()});
const ids={};for(const [n,p] of Object.entries(P))ids[n]=await p.evaluate(()=>ONL.acct.id);
const fids=await A.evaluate(async x=>NET.req('lanista.names',{ids:x}),Object.values(ids));const fid={};for(const [n,id] of Object.entries(ids))fid[n]=(fids[id]||{}).fid||'';

/* ── the banner ── */
await click(A,'#onl [data-onl="mkroom"][data-v="0"]');const rid=await until(A,()=>{const L=onlMyLobby();return L&&document.querySelector('#onlRoom80.lb100')&&L.id});
const code=await A.evaluate(id=>ONLC.roomCode100(id),rid);
out.ban=await A.evaluate(()=>{const R=document.getElementById('onlRoom80');const q=s=>R.querySelector(s);const t=s=>(q(s)||{}).textContent||'';
  return {code:t('.lb100-code b'),cr:t('.lb100-acts [data-onl="rcall"]').replace(/\s+/g,' ').trim(),exit:t('.lb100-acts [data-onl="leave"]'),inv:R.querySelectorAll('[data-onl="rinvite"],#fi89In,[data-l89="finv"]').length,
    ev:!!q('.lb100-ban .r80-ev'),chips:t('.r80-tags'),rk:!!q('.r80-tags .rk99')}});
ok(out.ban.code===code,'the room code on the banner '+out.ban.code+' / '+code);ok(/Call the crier.*3 of 3 left/.test(out.ban.cr),'📣 3 of 3 left: '+out.ban.cr);ok(/Close lobby/.test(out.ban.exit),'alone: Close lobby');
ok(out.ban.inv===0,'no Invite / Invite by FID in the room');ok(out.ban.ev&&out.ban.rk&&/Day/.test(out.ban.chips)&&/Free for all/.test(out.ban.chips)&&/1\/8 in the room/.test(out.ban.chips)&&/1\/4 seated/.test(out.ban.chips),'banner chips '+out.ban.chips);
await click(A,'#onlRoom80 [data-lb100copy]');out.copy=await until(A,c=>window.__lb100copied===c&&!document.querySelector('#onlRoom80 .lb100-ok').hidden,code,5000);ok(out.copy,'⧉ Copy → copied ✓');

/* ── Join by code / FID (C1a) ── */
await B.evaluate(async()=>{ONL.lobbies=await NET.req('lobby.list');ONL.tab='lobby';onlRedraw()});await B.waitForSelector('#onl form[data-lb100jf] #lb100In');
await B.fill('#onl #lb100In','R-ZZZZZ');await B.press('#onl #lb100In','Enter');out.bad=await until(B,()=>{const m=document.querySelector('#onl .lb100-jmsg.err');return m&&m.textContent.trim()});
ok(/No open room/.test(out.bad||''),'a code that opens nothing answers inline: '+out.bad);
await B.fill('#onl #lb100In',code.toLowerCase());await B.click('#onl form[data-lb100jf] button[type="submit"]');out.byCode=await until(B,id=>{const L=onlMyLobby();return L&&L.id===id&&!!document.querySelector('#onlRoom80.lb100')},rid);
ok(out.byCode,'B joined by the room code');
await C.evaluate(async()=>{ONL.lobbies=await NET.req('lobby.list');onlRedraw()});await C.fill('#onl #lb100In',fid.A.toLowerCase().replace('-',' '));await C.press('#onl #lb100In','Enter');
out.byFid=await until(C,id=>{const L=onlMyLobby();return L&&L.id===id},rid);ok(out.byFid,'C joined by the host’s FID '+fid.A+' '+await C.evaluate(()=>LB100.jmsg));
await A.evaluate(()=>onlRedraw());await until(A,()=>(onlMyLobby().members||[]).length===3&&document.querySelectorAll('#onlRoom80 .lb100-row:not(.empty)').length===3);
/* ── the list: 8 rows, medals, banners, host's actions on hover ── */
out.list=await A.evaluate(([b,c])=>{const R=document.getElementById('onlRoom80');const rows=[...R.querySelectorAll('.lb100-side .lb100-row')];const rb=R.querySelector(`.lb100-row[data-u96="${b}"]`);const ra=rb&&rb.querySelector('.lb100-ra');
  const side=R.querySelector('.lb100-side').getBoundingClientRect();
  return {n:rows.length,empty:rows.filter(r=>r.classList.contains('empty')).length,medals:R.querySelectorAll('.lb100-row .medal100').length,m14:(R.querySelector('.lb100-row .medal100')||{}).getAttribute?.('width'),
    banners:R.querySelectorAll('.lb100-row .bnr img.dr98c').length,crown:/👑/.test(rows[0].querySelector('.cr').textContent),host:R.querySelectorAll('.lb100-row [data-onl="rhost"]').length,kick:R.querySelectorAll('.lb100-row [data-onl="rkick"]').length,
    hidden:ra?getComputedStyle(ra).display:'none?',w:Math.round(side.width),you:/you/.test(rows[0].textContent),names:R.querySelectorAll('.lb100-row [data-hc98]').length}},[ids.B,ids.C]);
const Li=out.list;ok(Li.n===8&&Li.empty===5,'8 rows, 5 open '+JSON.stringify(Li));ok(Li.medals===3&&Li.m14==='14'&&Li.banners===3&&Li.crown&&Li.you&&Li.names===3,'medals 14 px, Domus banners, 👑 first, you '+JSON.stringify(Li));
ok(Li.host===2&&Li.kick===2&&Li.hidden==='none','Give host / Kick for the others, hidden until hover');ok(Li.w>=300,'the list column ~370 px: '+Li.w);
await A.hover(`#onlRoom80 .lb100-row[data-u96="${ids.B}"]`);await wait(150);out.hov=await A.evaluate(b=>getComputedStyle(document.querySelector(`#onlRoom80 .lb100-row[data-u96="${b}"] .lb100-ra`)).display,ids.B);ok(out.hov==='flex','hover shows the actions');
/* ── seats: portrait, token, medal 18, Domus chip; Exit lobby with company ── */
out.seats=await A.evaluate(()=>{const R=document.getElementById('onlRoom80');const s=[...R.querySelectorAll('.lb100-seats > .r80-seat')];const ys=new Set(s.map(e=>Math.round(e.getBoundingClientRect().top)));
  return {n:s.length,open:s.filter(e=>e.classList.contains('open')).length,por:R.querySelectorAll('.lb100-s .lb100-por svg,.lb100-s .lb100-por img').length,tok:R.querySelectorAll('.lb100-s .lb100-tok .tkfig').length,
    m18:[...R.querySelectorAll('.lb100-s .lb100-rks .medal100')].filter(m=>m.getAttribute('width')==='18').length,dr:R.querySelectorAll('.lb100-s .lb100-dr img.dr98c').length,bub:R.querySelectorAll('.lb100-s .lb100-bub[data-bub96]').length,
    rows:ys.size,exit:(R.querySelector('.lb100-acts [data-onl="leave"]')||{}).textContent,snd:!!R.querySelector('.lb100-s.me .snd92'),crown:/👑/.test((R.querySelector('.lb100-s.me .r80-who b')||{}).textContent||'')}});
const Se=out.seats;ok(Se.n===4&&Se.open===1&&Se.por===3&&Se.tok===3&&Se.m18===3&&Se.dr===3&&Se.bub===3&&Se.rows===1,'seat cards '+JSON.stringify(Se));ok(/Exit lobby/.test(Se.exit||'')&&Se.snd&&Se.crown,'Exit lobby, 🪙 Send in my seat, 👑 before my name');
out.guest=await B.evaluate(()=>{const R=document.getElementById('onlRoom80');return {cr:R.querySelectorAll('[data-onl="rcall"]').length,ro:!!R.querySelector('.lb100-ro'),acts:R.querySelectorAll('.lb100-row [data-onl="rhost"]').length,ready:!!R.querySelector('.lb100-foot [data-onl="rready"]')}});
ok(out.guest.cr===0&&out.guest.ro&&out.guest.acts===0&&out.guest.ready,'guest: no crier, read-only settings, no host actions, Ready in the foot '+JSON.stringify(out.guest));
/* ── quick chat: Room / Taunts; a taunt pops under the token ── */
out.qc=await B.evaluate(()=>({room:document.querySelectorAll('#onlRoom80 .lb100-qcs:not(.tn) [data-onl="rsay"]').length,tn:document.querySelectorAll('#onlRoom80 .lb100-qcs.tn [data-onl="rsay"]').length}));
ok(out.qc.room===7&&out.qc.tn===8,'quick chat Room 7 · Taunts 8 '+JSON.stringify(out.qc));
await click(B,'#onlRoom80 .lb100-qcs.tn [data-onl="rsay"][data-v="bucket"]');out.bub=await until(A,id=>{const s=document.querySelector(`#onlRoom80 .lb100-s .lb100-bub.on[data-bub96="${id}"]`);return s?s.textContent:null},ids.B,15000);
ok(/bucket/i.test(out.bub||''),'the taunt pops under B’s token on A: '+out.bub);
/* ── 📣 the crier: the host's click, then the 2-minute rest ── */
await click(A,'#onlRoom80 .lb100-acts [data-onl="rcall"]');out.cr=await until(A,()=>{const b=document.querySelector('#onlRoom80 .lb100-acts [data-onl="rcall"]');const t=b?b.textContent.replace(/\s+/g,' '):'';return b&&b.disabled&&/2 of 3 left/.test(t)&&/next in [12]:\d\d/.test(t)?t:null},null,10000);
ok(!!out.cr,'crier: 2 of 3 left · next in m:ss, resting '+out.cr+' '+await A.evaluate(()=>{const b=document.querySelector('#onlRoom80 [data-onl="rcall"]');return b?b.disabled+' '+b.textContent+' '+JSON.stringify(onlMyLobby().cry):'none'}));
/* ── standing → the strip; the horns → 👁 Watching ── */
await C.evaluate(async id=>{try{await NET.req("lobby.stand",{id})}catch(e){console.error(e.message)}},rid);out.stand=await until(A,id=>{const w=document.querySelector('#onlRoom80 .lb100-watch');const r=document.querySelector(`#onlRoom80 .lb100-row[data-u96="${id}"] .st`);return w&&/Standing/.test(w.textContent)&&/Gamma/.test(w.textContent)&&r&&/standing/.test(r.textContent)},ids.C);
ok(out.stand,'standing: the strip + the row');
out.horns=await A.evaluate(()=>{const L=onlMyLobby();const h=onlRoomHTML80({...L,startAt:Date.now()+7000},false);const d=document.createElement('div');d.innerHTML=h;const w=d.querySelector('.lb100-watch');
  return {w:w&&/Watching/.test(w.textContent),row:[...d.querySelectorAll('.lb100-row .st')].some(s=>/watching/.test(s.textContent)),open:/a CPU takes it/.test(d.textContent)}});ok(out.horns.w&&out.horns.row&&out.horns.open,'at the horns: 👁 Watching '+JSON.stringify(out.horns));
if(SHOT){await A.evaluate(()=>{document.getElementById('onlRoom80').scrollIntoView({block:'start'})});await wait(300);await A.screenshot({path:path.join(SHOT,'lobby100_1440.png')});await B.screenshot({path:path.join(SHOT,'lobby100_guest_1440.png')})}
/* ── the house card: ⚔ Join while that house waits in a room ── */
await D.evaluate(async a=>{ONL.lobbies=await NET.req('lobby.list');hc98Open({acct:a})},ids.A);out.hj=await until(D,()=>!!document.querySelector('.hc98pop [data-lb100hj]')&&/R-/.test((document.querySelector('.hc98pop .lb100-hcnow')||{}).textContent||'')&&!!document.querySelector('.hc98pop .medal100'));
ok(out.hj,'house card: ⚔ Join + the room line + medals');await click(D,'.hc98pop [data-lb100hj]');out.dIn=await until(D,id=>{const L=onlMyLobby();return L&&L.id===id},rid);ok(out.dIn,'⚔ Join from the house card');
/* ── 👑 Give host + ✕ Kick still work (hover actions) ── */
await until(A,id=>!!document.querySelector(`#onlRoom80 .lb100-row[data-u96="${id}"]`),ids.D);
await A.hover(`#onlRoom80 .lb100-row[data-u96="${ids.B}"]`);await A.click(`#onlRoom80 .lb100-row[data-u96="${ids.B}"] [data-onl="rhost"]`);
out.gh=await until(B,id=>{const L=onlMyLobby();return L&&L.host&&L.host.id===id&&!!document.querySelector('#onlRoom80 .lb100-acts [data-onl="rcall"]')},ids.B);ok(out.gh,'Give host: B hosts, gets the crier');
await B.evaluate(()=>onlRedraw());await B.hover(`#onlRoom80 .lb100-row[data-u96="${ids.D}"]`);await B.click(`#onlRoom80 .lb100-row[data-u96="${ids.D}"] [data-onl="rkick"]`);
out.kick=await until(B,id=>{const L=onlMyLobby();return L&&!(L.members||[]).some(m=>m.id===id)},ids.D);ok(out.kick,'Kick removes D');
/* ── Familia 8: compact 4×2 with team edges ── */
await B.evaluate(()=>onlRedraw());await B.selectOption('#onl select[data-onlrs="ev"]','familia');await until(B,()=>onlMyLobby().ev==='familia');await wait(400);
await B.selectOption('#onl select[data-onlrs="seats"]','8');await until(B,()=>onlMyLobby().seats===8&&document.querySelectorAll('#onlRoom80 .lb100-seats > .r80-seat').length===8);await wait(400);
out.eight=await B.evaluate(()=>{const s=[...document.querySelectorAll('#onlRoom80 .lb100-seats > .r80-seat')];const ys=[...new Set(s.map(e=>Math.round(e.getBoundingClientRect().top)))];
  return {n:s.length,rows:ys.length,per:s.filter(e=>Math.round(e.getBoundingClientRect().top)===ys[0]).length,cmp:!!document.querySelector('#onlRoom80 .lb100-seats.lb100-cmp'),tm:s.filter(e=>e.classList.contains('tm')).length,
    edge:getComputedStyle(s[0]).borderTopWidth,lab:/TEAM A/.test(s[0].textContent),chip:/Teams/.test(document.querySelector('#onlRoom80 .r80-tags').textContent)}});
ok(out.eight.n===8&&out.eight.rows===2&&out.eight.per===4&&out.eight.cmp&&out.eight.tm===8&&out.eight.edge==='4px'&&out.eight.lab&&out.eight.chip,'Familia 8 = compact 4×2 with teams '+JSON.stringify(out.eight));
if(SHOT){await B.evaluate(()=>{document.getElementById('onlRoom80').scrollIntoView({block:'start'})});await wait(300);await B.screenshot({path:path.join(SHOT,'lobby100_eight.png')})}
await B.selectOption('#onl select[data-onlrs="ev"]','democritus');await until(B,()=>onlMyLobby().ev==='democritus');
/* ── phones 390 ── */
await A.setViewportSize({width:390,height:844});await A.evaluate(()=>onlRedraw());await wait(800);
out.phone=await A.evaluate(()=>{const R=document.getElementById('onlRoom80');let over=0;for(const e of R.querySelectorAll('*')){const r=e.getBoundingClientRect();if(r.width&&r.right>innerWidth+1&&!e.closest('select'))over++}
  const s=[...R.querySelectorAll('.lb100-seats > .r80-seat')];const top=Math.round(s[0].getBoundingClientRect().top);const jb=document.querySelector('#onl .lb100-jb');
  return {over,sw:document.documentElement.scrollWidth-innerWidth,per:s.filter(e=>Math.round(e.getBoundingClientRect().top)===top).length,jb:jb?Math.round(jb.getBoundingClientRect().right):0}});
ok(out.phone.over===0&&out.phone.sw<=0&&out.phone.per===2&&out.phone.jb<=390,'phone 390: nothing past the edge, 2 seats a row '+JSON.stringify(out.phone));
if(SHOT){await A.evaluate(()=>{document.getElementById('onlRoom80').scrollIntoView({block:'start'})});await wait(300);await A.screenshot({path:path.join(SHOT,'lobby100_390.png')})}
await A.setViewportSize({width:1440,height:900});await wait(300);
/* ── the kill switch: the v0.96 room ── */
out.off=await A.evaluate(()=>{LB100.off=true;onlRedraw();const R=document.getElementById('onlRoom80');const r={r96:!!(R&&R.classList.contains('r96')),lb:!!document.querySelector('#onlRoom80.lb100'),fid:!!document.querySelector('#onlRoom80 #fi89In')};LB100.off=false;onlRedraw();return r});
ok(out.off.r96&&!out.off.lb&&out.off.fid,'kill switch → the v0.96 room '+JSON.stringify(out.off));
console.log(JSON.stringify(out));console.log('MISS',miss);console.log('ERRS',errs);await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();

/* v1.0 WHO'S ONLINE (287-v100who + the v1.0 section of 111-onlcore; mock, three windows + mock lanistas):
   1 · the landing panel beside the Orbis lists who is online: idle / in a room / fighting / watching, my own row first ("you"), a hidden
       lanista never; region flags + the Domus-rank banner; the landing still fits without scrolling at 1440×900 (and 1300×900).
   2 · ✉ Invite from the list (A hosts a room → the idle lanista gets the invitation; fighting / in-a-room rows disabled; no room → disabled).
   3 · 👁 Watch a fighting lanista's live match from the list.   4 · 🏛 the house card opens.   5 · ★ Follow toggles (and back).
   6 · the Lobby Browser's "👥 Online now" tab: the full list, status + region filters, sort.   7 · phone 390: one column, no sideways scroll.
   SHOT=<dir> saves the screenshots (tools/plans/online100/). ERRS must be []. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900},timezoneId:'Europe/Rome'});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');localStorage.removeItem('flavius_onlquiet80');localStorage.removeItem('flavius_onllb96');localStorage.removeItem('flavius_onlwho100')});
const errs=[];const P={};for(const n of ['A','B','C']){P[n]=await ctx.newPage();P[n].on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]))}
await P.A.goto(URL0,{timeout:90000});await P.A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over|rid)/.test(k))localStorage.removeItem(k)});
for(const n of ['B','C'])await P[n].goto(URL0,{timeout:90000});for(const n of ['A','B','C'])await P[n].waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
/* HAND-OFF (as tonl78/tonl98): the mock world is one localStorage item; a window waits until it holds the last writer's copy before it acts */
const HAND={last:null,on:true};for(const p of Object.values(P)){const ev=p.evaluate.bind(p);p.__ev=ev;p.evaluate=async(...a)=>{const L=HAND.last;
  if(HAND.on&&L&&L!==p&&!L.isClosed()){for(const t0=Date.now();Date.now()-t0<15000;){const v=await L.__ev(()=>localStorage.getItem('flavius_onlmock')).catch(()=>null);
    if(v==null||await ev(v=>localStorage.getItem('flavius_onlmock')===v,v).catch(()=>true))break;await p.waitForTimeout(100)}}
  const r=await ev(...a);HAND.last=p;return r}}
const {A,B,C}=P;const wait=ms=>A.waitForTimeout(ms);const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const out={};
const shot=async(p,n)=>{if(SHOT){fs.mkdirSync(SHOT,{recursive:true});await p.screenshot({path:path.join(SHOT,n)})}};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','slave');await setup(C,'Gamma','soldier');
const until=async(p,fn,arg,ms=20000)=>{const t0=Date.now();let v;while(Date.now()-t0<ms){v=await p.evaluate(fn,arg).catch(()=>null);if(v)return v;await p.waitForTimeout(200)}return v};
const click=async(p,sel)=>{await p.waitForSelector(sel,{timeout:20000});await p.click(sel);await p.waitForTimeout(400)};
const ids={};for(const [n,p] of Object.entries(P))ids[n]=await p.evaluate(()=>ONL.acct.id);
/* mock lanistas: Decimus (idle, Tokyo), Hidden Hostilius (hides himself), Quintus standing in a room he hosts */
await A.evaluate(()=>{const w=mockLoad();const far=Date.now()+3600e3;const mk=(id,name,tz,extra)=>{w.accounts[id]={id,name,lname:'Lanista '+name,tz,seen:far,...extra};
    const c=ONLC.newChar({name:name+' Gladius',cls:'hero',stats:{spd:60,str:60,int:60,lck:60,cha:60}},id,'gw'+id,Date.now()-1e5);w.chars[c.id]=c;w.accounts[id].active=c.id};
  mk('wDec','Decimus','Asia/Tokyo');mk('wHid','Hostilius','Europe/Rome',{priv89:{hide:true}});mk('wQui','Quintus','America/New_York');mockSave(w)});
await A.evaluate(async()=>{const w=mockLoad();const L=ONLC.newLobby({ev:'cassian'},{id:'wQui',name:'Quintus Gladius'},'Lw100q',Date.now());L.members=[{id:'wQui',name:'Quintus Gladius'}];L.players=[{id:'wQui',name:'Quintus Gladius',seat:0}];w.lobbies[L.id]=L;mockSave(w)});
/* B and C fight: B hosts, C joins, B starts */
const mid=await B.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'democritus',loc:3,cry:false});return (r.lobby||r).id});
await C.evaluate(async id=>{await NET.req('lobby.join',{id})},mid);await B.evaluate(async id=>{await NET.req('lobby.start',{id})},mid);
out.live=await until(B,id=>{const w=mockLoad();return w.lobbies[id]&&w.lobbies[id].status==='live'},mid);ok(out.live,'B and C fight');
/* B and C stay present for the whole test (the mock counts a lanista seen in the last minute) */
await C.evaluate(ids=>{const w=mockLoad();for(const id of [ids.B,ids.C])w.accounts[id].seen=Date.now()+3600e3;mockSave(w)},ids);
HAND.on=false;
/* ── 1 · A's landing panel ── */
A.evaluate(()=>{onlineOpen('play')}).catch(()=>{});await A.waitForSelector('#onl #who100p',{timeout:30000});
out.p=await until(A,ids=>{const L=document.getElementById('who100pL');if(!L||!WHO100.at)return null;const rows=[...L.querySelectorAll('[data-w100r]')];if(rows.length<5)return null;
  const st=id=>{const r=L.querySelector(`[data-w100r="${id}"]`);return r?[...r.classList].find(c=>/^w100-/.test(c)):null};
  return {n:rows.length,first:rows[0].dataset.w100r,you:!!rows[0].querySelector('.w100you'),A:st(ids.A),B:st(ids.B),C:st(ids.C),dec:st('wDec'),qui:st('wQui'),hid:!!L.querySelector('[data-w100r="wHid"]'),
    flags:L.querySelectorAll('.w100rg img').length,ban:L.querySelectorAll('img.w100ban').length,decRg:(L.querySelector('[data-w100r="wDec"] .w100rg img')||{}).alt||''}},ids);
ok(out.p&&out.p.first===ids.A&&out.p.you,'my own row first, marked you '+JSON.stringify(out.p));
ok(out.p&&out.p.A==='w100-idle'&&out.p.B==='w100-fight'&&out.p.C==='w100-fight'&&out.p.dec==='w100-idle'&&out.p.qui==='w100-room','status idle / fighting / in a room '+JSON.stringify(out.p));
ok(out.p&&!out.p.hid,'a hidden lanista is never listed');ok(out.p&&out.p.flags>=2&&out.p.ban>=3&&/Asia/.test(out.p.decRg),'region flags + house banners '+JSON.stringify(out.p));
/* fits without scrolling at 1440×900 and 1300×900 */
for(const [w,h] of [[1440,900],[1300,900]]){await A.setViewportSize({width:w,height:h});await wait(700);
  const m=await A.evaluate(()=>{const box=document.getElementById('mBody').getBoundingClientRect();const els=[...document.querySelectorAll('#onl .a85-bot .onl-pls81>*:not(.pl85div)'),...document.querySelectorAll('#v85show .v85sc'),document.getElementById('who100p')].filter(e=>e&&e.offsetParent!==null);
    const bot=Math.max(...els.map(e=>e.getBoundingClientRect().bottom));const p=document.getElementById('who100p').getBoundingClientRect();return {n:els.length,bottom:Math.round(bot),box:Math.round(box.bottom),sc:document.getElementById('mBody').scrollTop,
      pane:Math.round(p.height),right:Math.round(p.right),vw:innerWidth,orbis:!!document.querySelector('#onl .a81-stage')}});
  out['fit'+w]=m;ok(m.n>=6&&m.bottom<=m.box+1&&m.sc===0&&m.right<=m.vw&&m.pane>80,`the landing fits with the panel at ${w}×${h} `+JSON.stringify(m))}
await A.setViewportSize({width:1440,height:900});await wait(500);await shot(A,'landing1440.png');
/* ── 2 · Invite: no room → disabled; A opens a room → Decimus invitable, fighters + room-goers disabled ── */
out.inv0=await A.evaluate(()=>{const b=document.querySelector('#who100pL [data-w100r="wDec"] [data-w100="inv"]');return b?{dis:b.disabled,why:b.title}:null});ok(out.inv0&&out.inv0.dis&&/room/i.test(out.inv0.why),'no room → Invite disabled with the reason '+JSON.stringify(out.inv0));
await A.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'egidious',loc:2,cry:false});onlUpsert80(r.lobby||r);ONL.tab='play';onlRedraw()});await wait(600);
await A.evaluate(()=>{WHO100.at=0;return who100Fetch()});await wait(400);
out.inv1=await A.evaluate(ids=>{const q=(id)=>{const b=document.querySelector(`#who100pL [data-w100r="${id}"] [data-w100="inv"]`);return b?b.disabled:null};return {dec:q('wDec'),B:q(ids.B),qui:q('wQui'),Ast:(document.querySelector(`#who100pL [data-w100r="${ids.A}"]`)||{}).className}},ids);
ok(out.inv1.dec===false&&out.inv1.B===true&&out.inv1.qui===true&&/w100-room/.test(out.inv1.Ast||''),'hosting: the idle may be invited, the busy not; my row says in a room '+JSON.stringify(out.inv1));
await click(A,'#who100pL [data-w100r="wDec"] [data-w100="inv"]');
out.inv=await until(A,()=>{const w=mockLoad();const me=w.accounts[ONL.acct.id];return me&&me.iv_wDec?'sent':null});ok(out.inv==='sent','✉ Invite reached the mock server');
/* ── 4 · the house card from a row ── */
await click(A,`#who100pL [data-w100r="${ids.B}"] button[data-hc98]`);out.card=await until(A,()=>{const c=document.querySelector('.hc98pop .hc98:not(.load)');return c?(c.querySelector('h3')||{}).textContent:null});
ok(/Beta/.test(out.card||''),'🏛 the house card opens: '+out.card);await A.evaluate(()=>{const x=document.querySelector('.hc98pop [data-hc98x]');if(x)x.click()});await wait(300);
/* ── 5 · ★ Follow toggles ── */
await click(A,`#who100pL [data-w100r="${ids.B}"] [data-w100="fol"]`);out.f1=await until(A,id=>{const b=document.querySelector(`#who100pL [data-w100r="${id}"] [data-w100="fol"]`);return b&&b.classList.contains('on')&&(ONL83U.follows||[]).length===1?'on':null},ids.B);
await click(A,`#who100pL [data-w100r="${ids.B}"] [data-w100="fol"]`);out.f0=await until(A,id=>{const b=document.querySelector(`#who100pL [data-w100r="${id}"] [data-w100="fol"]`);return b&&!b.classList.contains('on')&&!(ONL83U.follows||[]).length?'off':null},ids.B);
ok(out.f1==='on'&&out.f0==='off','★ Follow toggles on and off '+[out.f1,out.f0]);
/* ── 6 · the Lobby Browser tab ── */
await A.evaluate(async()=>{const L=onlMyLobby();if(L)await NET.req('lobby.leave',{id:L.id});ONL.lobbies=await NET.req('lobby.list',{});WHO100.at=0});
await A.evaluate(()=>{ONL.tab='lobby';onlRedraw()});await click(A,'#onl .w100tab[data-w100tab="who"]');
out.t=await until(A,()=>{const L=document.getElementById('who100tL');return L&&WHO100.at&&L.querySelectorAll('[data-w100r]').length>=5?{n:L.querySelectorAll('[data-w100r]').length,dn:L.querySelectorAll('.w100dn').length}:null});
ok(out.t&&out.t.n>=5&&out.t.dn>=2,'the Online now tab lists everyone with their houses '+JSON.stringify(out.t));
await A.selectOption('#onl select[data-w100f="st"]','fight');out.tf=await until(A,ids=>{const r=[...document.querySelectorAll('#who100tL [data-w100r]')].map(x=>x.dataset.w100r);return r.length===3&&r[0]===ids.A&&r.includes(ids.B)&&r.includes(ids.C)?r:null},ids);
ok(out.tf,'status filter: fighting (+ my row)');await shot(A,'lobby_fight1440.png');
await A.selectOption('#onl select[data-w100f="st"]','');await A.selectOption('#onl select[data-w100f="reg"]','as');
out.tr=await until(A,()=>{const r=[...document.querySelectorAll('#who100tL [data-w100r]')].map(x=>x.dataset.w100r);return r.length===2&&r.includes('wDec')?r:null});ok(out.tr,'region filter: Asia');
await A.selectOption('#onl select[data-w100f="reg"]','');await A.selectOption('#onl select[data-w100f="sort"]','name');
out.ts=await until(A,ids=>{const r=[...document.querySelectorAll('#who100tL [data-w100r] .w100n')].map(x=>x.textContent);return r.length>=5&&r[0]&&JSON.stringify(r.slice(1))===JSON.stringify(r.slice(1).slice().sort((a,b)=>a.toLowerCase().localeCompare(b.toLowerCase())))?r:null},ids);ok(out.ts,'sort by name '+JSON.stringify(out.ts));
await A.selectOption('#onl select[data-w100f="sort"]','st');await wait(300);await shot(A,'lobby_who1440.png');
await A.evaluate(()=>{ONL.tab='play';onlRedraw()});await wait(500);
/* ── 7 · phone 390 (A's landing) ── */
await A.setViewportSize({width:390,height:844});await A.waitForTimeout(800);
out.ph=await A.evaluate(()=>{const g=document.querySelector('#onl .onl-play81');const p=document.getElementById('who100p');const r=p&&p.getBoundingClientRect();
  return {cols:g?getComputedStyle(g).gridTemplateColumns.split(' ').length:0,wide:document.documentElement.scrollWidth<=392,mb:document.getElementById('mBody').scrollWidth<=document.getElementById('mBody').clientWidth+2,pw:r?Math.round(r.width):0,rows:p?p.querySelectorAll('[data-w100r]').length:0}});
ok(out.ph.cols===1&&out.ph.wide&&out.ph.mb&&out.ph.pw>300&&out.ph.pw<=390&&out.ph.rows>=4,'phone: one column, the panel full width, no sideways scroll '+JSON.stringify(out.ph));
await A.evaluate(()=>{const e=document.getElementById('who100p');if(e)e.scrollIntoView({block:'start'})});await A.waitForTimeout(300);await shot(A,'phone390.png');
await A.evaluate(()=>{ONL.tab='lobby';WHO100.lb='who';onlRedraw()});await A.waitForTimeout(800);
out.ph2=await A.evaluate(()=>({wide:document.documentElement.scrollWidth<=392,mb:document.getElementById('mBody').scrollWidth<=document.getElementById('mBody').clientWidth+2,rows:document.querySelectorAll('#who100tL [data-w100r]').length}));
ok(out.ph2.wide&&out.ph2.mb&&out.ph2.rows>=4,'phone: the Online now tab fits '+JSON.stringify(out.ph2));await shot(A,'phone390_tab.png');
await A.setViewportSize({width:1440,height:900});await A.evaluate(()=>{ONL.tab='lobby';WHO100.lb='who';onlRedraw()});await wait(600);
/* ── 3 · 👁 Watch B's match from the list ── */
await click(A,`#who100tL [data-w100r="${ids.B}"] [data-w100="watch"]`);out.w=await until(A,id=>ONL.watching&&ONL.watching.id===id?'watching':null,mid,30000);ok(out.w==='watching','👁 Watch opened the live match');
/* A now watches: his own row says so */
out.aw=await until(A,async()=>{const r=await NET.req('here.list',{});return r.rows[0]&&r.rows[0].me&&r.rows[0].st==='watch'?'watch':null},null,15000);ok(out.aw==='watch','the watcher shows as watching');
console.log(JSON.stringify(out));console.log('MISS',miss);console.log('ERRS',errs.slice(0,6));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();

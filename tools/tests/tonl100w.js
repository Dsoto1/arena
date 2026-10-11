/* v1.0 WHO'S ONLINE (287-v100who + the v1.0 section of 111-onlcore; mock, three windows + mock lanistas):
   0 · LANDING (his 2026-10-11 answers): no who's-online panel, no ★ Followed houses card, no separate Acta box; ONE right column = This week + the
       🏆 Biggest winner / 🪦 Biggest loser boxes with the day's acta lines merged in ("See today's list"); fits without scrolling at 1440×900 and 1300×900,
       no empty holes, phone 390 one column.   PROFILE: Find (name or FID) + the followed houses live in 👤 Profile & Settings.
   1 · the Lobby Browser's "👥 Online now" tab lists who is online: idle / in a room / fighting / watching, my own row first ("you"), a hidden
       lanista never; region flags + the Domus-rank banner.
   8 · PER GLADIATOR: C abandons the Custom match, opens a room → his row says in a room, the second chip "⚔ <gladiator> still fighting" + 👁 Watch on that match.
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
/* ── 0 · A's landing: one right column, no panel / followed / Acta box ── */
A.evaluate(()=>{onlineOpen('play')}).catch(()=>{});await A.waitForSelector('#onl .a100-right #v85show',{timeout:30000});
/* an acta for the merged boxes (the mock day is empty) */
await A.evaluate(()=>{const now=Date.now();const w={name:'Marcus',dom:'dM',dn:'Domus Marcus',cls:'hero',rank:'veteranus',cf:31,coin:60,ev:'democritus',loc:2,ranked:true,look:{}};
  ONL80F.today={day:'today',wins:[w],fallen:[{name:'Fulvus',dom:'dF',dn:'Domus Fulvus',cls:'slave',rank:'tiro',cf:4,how:'fate',ev:'egidious',loc:3,gear:20,purse:5,look:{}}],upsets:[],
    acta:[{at:now-6e5,ev:'democritus',loc:2,w:{name:'Marcus',dn:'Domus Marcus',dom:'dM'},wn:1,cf:31,fell:0},{at:now-3e5,ev:'egidious',loc:3,w:{name:'Livia',dn:'Domus Livia',dom:'dL'},wn:1,cf:12,fell:1},{at:now-1e5,ev:'cassian',loc:1,w:null,wn:0,cf:0,fell:2}]};
  onlToday80Patch()});await wait(500);
out.l=await A.evaluate(()=>{const q=s=>document.querySelector(s);const R=q('#onl .a100-right');const rb=R.getBoundingClientRect();const boxes=[...document.querySelectorAll('#onl #v85show .v85sc')].map(e=>Math.round(e.getBoundingClientRect().height));
  return {panel:!!q('#who100p'),fl:!!q('#onl .fl83'),acta:!!q('#acta87'),forum:!!q('#onlForum81'),week:!!q('.a100-right .a81-week'),boxes,aw:document.querySelectorAll('#v85show .v85sc.win .a100-acta .ac87').length,af:document.querySelectorAll('#v85show .v85sc.fall .a100-acta .ac87').length,
    afOnlyFell:[...document.querySelectorAll('#v85show .v85sc.fall .a100-acta .ac87')].every(x=>/✝/.test(x.textContent)),
    colH:Math.round(rb.height),colW:Math.round(rb.width),pls:!!q('#onl .a85-bot .a81-pls')}});
ok(!out.l.panel&&!out.l.fl&&!out.l.acta&&!out.l.forum,'no who panel, no Followed houses card, no separate Acta box on the landing '+JSON.stringify(out.l));
ok(out.l.week&&out.l.boxes.length===2&&out.l.boxes.every(h=>h>=140)&&out.l.pls,'one right column: This week + two showcase boxes (no holes) '+JSON.stringify(out.l));
ok(out.l.aw>=2&&out.l.af===2&&out.l.afOnlyFell,'the day\'s acta lines are merged into the winner (all results) and loser (only bouts where someone fell) boxes '+JSON.stringify(out.l));
await A.evaluate(()=>document.querySelector('#v85show .v85sc.win .a100-acta .ac87').click());out.pop=await until(A,()=>!!document.querySelector('.td81pop'));ok(out.pop,'an acta line opens the day\'s list');await A.evaluate(()=>{for(const x of document.querySelectorAll('.td81pop'))x.remove()});
/* fits without scrolling at 1440×900 and 1300×900 */
for(const [w,h] of [[1440,900],[1300,900]]){await A.setViewportSize({width:w,height:h});await wait(700);
  const m=await A.evaluate(()=>{const box=document.getElementById('mBody').getBoundingClientRect();const R=document.querySelector('#onl .a100-right');const ri=R.querySelector('.a100-ri');
    const els=[...document.querySelectorAll('#onl .a85-bot .onl-pls81>*:not(.pl85div)'),R].filter(e=>e&&e.offsetParent!==null);
    const bot=Math.max(...els.map(e=>e.getBoundingClientRect().bottom));const r=R.getBoundingClientRect();
    const kids=[...ri.children].map(e=>e.getBoundingClientRect());const gap=Math.round(r.bottom-Math.max(...kids.map(k=>k.bottom)));
    return {n:els.length,bottom:Math.round(bot),box:Math.round(box.bottom),sc:document.getElementById('mBody').scrollTop,pane:Math.round(r.height),right:Math.round(r.right),vw:innerWidth,orbis:!!document.querySelector('#onl .a81-stage'),
      inner:ri.scrollHeight<=ri.clientHeight+1,gap}});
  out['fit'+w]=m;ok(m.n>=5&&m.bottom<=m.box+1&&m.sc===0&&m.right<=m.vw&&m.pane>300,`the landing fits at ${w}×${h} `+JSON.stringify(m));
  ok(m.inner&&m.gap<=14,`the right column is filled, nothing clipped (gap ${m.gap}) at ${w}×${h}`)}
await A.setViewportSize({width:1440,height:900});await wait(500);await shot(A,'landing_after1440.png');
/* ── 1 · the Lobby Browser's Online now tab ── */
await A.evaluate(()=>{WHO100.lb='who';WHO100.at=0;ONL.tab='lobby';onlRedraw()});
out.p=await until(A,ids=>{const L=document.getElementById('who100tL');if(!L||!WHO100.at)return null;const rows=[...L.querySelectorAll('[data-w100r]')];if(rows.length<5)return null;
  const st=id=>{const r=L.querySelector(`[data-w100r="${id}"]`);return r?[...r.classList].find(c=>/^w100-/.test(c)):null};
  return {n:rows.length,first:rows[0].dataset.w100r,you:!!rows[0].querySelector('.w100you'),A:st(ids.A),B:st(ids.B),C:st(ids.C),dec:st('wDec'),qui:st('wQui'),hid:!!L.querySelector('[data-w100r="wHid"]'),
    flags:L.querySelectorAll('.w100rg img').length,ban:L.querySelectorAll('img.w100ban').length,decRg:(L.querySelector('[data-w100r="wDec"] .w100rg img')||{}).alt||''}},ids);
ok(out.p&&out.p.first===ids.A&&out.p.you,'my own row first, marked you '+JSON.stringify(out.p));
ok(out.p&&out.p.A==='w100-idle'&&out.p.B==='w100-fight'&&out.p.C==='w100-fight'&&out.p.dec==='w100-idle'&&out.p.qui==='w100-room','status idle / fighting / in a room '+JSON.stringify(out.p));
ok(out.p&&!out.p.hid,'a hidden lanista is never listed');ok(out.p&&out.p.flags>=2&&out.p.ban>=3&&/Asia/.test(out.p.decRg),'region flags + house banners '+JSON.stringify(out.p));
/* ── 2 · Invite: no room → disabled; A opens a room → Decimus invitable, fighters + room-goers disabled ── */
out.inv0=await A.evaluate(()=>{const b=document.querySelector('#who100tL [data-w100r="wDec"] [data-w100="inv"]');return b?{dis:b.disabled,why:b.title}:null});ok(out.inv0&&out.inv0.dis&&/room/i.test(out.inv0.why),'no room → Invite disabled with the reason '+JSON.stringify(out.inv0));
await A.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'egidious',loc:2,cry:false});onlUpsert80(r.lobby||r);ONL.tab='lobby';onlRedraw()});await wait(600);
await A.evaluate(()=>{WHO100.at=0;return who100Fetch()});await wait(400);
out.inv1=await A.evaluate(ids=>{const q=(id)=>{const b=document.querySelector(`#who100tL [data-w100r="${id}"] [data-w100="inv"]`);return b?b.disabled:null};return {dec:q('wDec'),B:q(ids.B),qui:q('wQui'),Ast:(document.querySelector(`#who100tL [data-w100r="${ids.A}"]`)||{}).className}},ids);
ok(out.inv1.dec===false&&out.inv1.B===true&&out.inv1.qui===true&&/w100-room/.test(out.inv1.Ast||''),'hosting: the idle may be invited, the busy not; my row says in a room '+JSON.stringify(out.inv1));
await click(A,'#who100tL [data-w100r="wDec"] [data-w100="inv"]');
out.inv=await until(A,()=>{const w=mockLoad();const me=w.accounts[ONL.acct.id];return me&&me.iv_wDec?'sent':null});ok(out.inv==='sent','✉ Invite reached the mock server');
/* ── 4 · the house card from a row ── */
await click(A,`#who100tL [data-w100r="${ids.B}"] button[data-hc98]`);out.card=await until(A,()=>{const c=document.querySelector('.hc98pop .hc98:not(.load)');return c?(c.querySelector('h3')||{}).textContent:null});
ok(/Beta/.test(out.card||''),'🏛 the house card opens: '+out.card);await A.evaluate(()=>{const x=document.querySelector('.hc98pop [data-hc98x]');if(x)x.click()});await wait(300);
/* ── 5 · ★ Follow toggles ── */
await click(A,`#who100tL [data-w100r="${ids.B}"] [data-w100="fol"]`);out.f1=await until(A,id=>{const b=document.querySelector(`#who100tL [data-w100r="${id}"] [data-w100="fol"]`);return b&&b.classList.contains('on')&&(ONL83U.follows||[]).length===1?'on':null},ids.B);
await click(A,`#who100tL [data-w100r="${ids.B}"] [data-w100="fol"]`);out.f0=await until(A,id=>{const b=document.querySelector(`#who100tL [data-w100r="${id}"] [data-w100="fol"]`);return b&&!b.classList.contains('on')&&!(ONL83U.follows||[]).length?'off':null},ids.B);
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
await A.selectOption('#onl select[data-w100f="sort"]','st');await wait(300);await shot(A,'lobby_who_after.png');
await A.evaluate(()=>{ONL.tab='play';onlRedraw()});await wait(500);
/* ── 7 · phone 390 (A's landing) ── */
await A.setViewportSize({width:390,height:844});await A.waitForTimeout(800);
out.ph=await A.evaluate(()=>{const g=document.querySelector('#onl .onl-play81');const p=document.querySelector('#onl .a100-right');const r=p&&p.getBoundingClientRect();
  return {cols:g?getComputedStyle(g).gridTemplateColumns.split(' ').length:0,wide:document.documentElement.scrollWidth<=392,mb:document.getElementById('mBody').scrollWidth<=document.getElementById('mBody').clientWidth+2,pw:r?Math.round(r.width):0,boxes:document.querySelectorAll('#v85show .v85sc').length,panel:!!document.getElementById('who100p')}});
ok(out.ph.cols===1&&out.ph.wide&&out.ph.mb&&out.ph.pw>300&&out.ph.pw<=390&&out.ph.boxes===2&&!out.ph.panel,'phone: one column, the right column full width, no sideways scroll '+JSON.stringify(out.ph));
await A.evaluate(()=>{const e=document.querySelector('#onl .a100-right');if(e)e.scrollIntoView({block:'start'})});await A.waitForTimeout(300);await shot(A,'phone390.png');
await A.evaluate(()=>{ONL.tab='lobby';WHO100.lb='who';onlRedraw()});await A.waitForTimeout(800);
out.ph2=await A.evaluate(()=>({wide:document.documentElement.scrollWidth<=392,mb:document.getElementById('mBody').scrollWidth<=document.getElementById('mBody').clientWidth+2,rows:document.querySelectorAll('#who100tL [data-w100r]').length}));
ok(out.ph2.wide&&out.ph2.mb&&out.ph2.rows>=4,'phone: the Online now tab fits '+JSON.stringify(out.ph2));await shot(A,'phone390_tab.png');
await A.setViewportSize({width:1440,height:900});await A.evaluate(()=>{ONL.tab='lobby';WHO100.lb='who';onlRedraw()});await wait(600);
/* ── 9 · 👤 Profile & Settings: Find (name or FID) + the followed houses ── */
const betaDom=await A.evaluate(id=>(WHO100.rows.find(r=>r.id===id)||{}).dom,ids.B);
await A.evaluate(async d=>{const r=await ONL83.follow(d,true);ONL83U.follows=r.follows||[]},betaDom);
await A.evaluate(()=>{ONL.tab='prof';onlRedraw()});await wait(700);
out.pf=await A.evaluate(()=>{const f=document.querySelector('#onl .pr98-find');return {find:!!(f&&f.querySelector('#fd89In')),ph:(f&&f.querySelector('#fd89In')||{}).placeholder||'',lab:f?f.textContent:'',fol:f?[...f.querySelectorAll('.pr98-fol .hc98n')].map(x=>x.textContent):[],h:Math.round((document.querySelector('#onl .pr98')||{getBoundingClientRect:()=>({height:0})}).getBoundingClientRect().height),fh:f?Math.round(f.getBoundingClientRect().height):0}});
ok(out.pf.find&&/name or FID/i.test(out.pf.ph),'Profile: the Find box takes a name or a FID '+JSON.stringify(out.pf));ok(out.pf.h>300&&out.pf.fh>40,'Profile page is actually visible (a 246 .pr98 progress-bar rule once clipped it to 8px) '+JSON.stringify([out.pf.h,out.pf.fh]));ok(out.pf.fol.some(x=>/Beta/.test(x)),'Profile: the followed house is listed there '+JSON.stringify(out.pf.fol));
await A.evaluate(()=>{const m=document.getElementById('mBody');if(m)m.scrollTop=0;const o=document.querySelector('#onl .onl-main');if(o)o.scrollTop=0;window.scrollTo(0,0)});await wait(700);await shot(A,'profile_find.png');
await A.fill('#onl #fd89In','Domus Gamma');await A.click('#onl [data-l89="find"]');out.pv=await until(A,()=>{const v=document.querySelector('#onl .vs89');return ONL.tab==='visit'&&v?v.textContent:null});ok(/Gamma/.test(out.pv||''),'Find by house NAME opens that house '+out.pv);
await A.evaluate(()=>{ONL.tab='prof';onlRedraw()});await wait(400);await A.fill('#onl #fd89In','Nobody At All');await A.click('#onl [data-l89="find"]');
out.pn=await until(A,()=>{const e=document.querySelector('#onl .pr98-find .onl-err');return e?e.textContent:null});ok(/No house/i.test(out.pn||''),'an unknown house name says so '+out.pn);
await A.evaluate(async d=>{const r=await ONL83.follow(d,false);ONL83U.follows=r.follows||[]},betaDom);
/* ── 8 · PER GLADIATOR: C abandons the Custom match and opens a room — the row says in a room + "still fighting" ── */
await A.evaluate(()=>{ONL.tab='lobby';WHO100.lb='who';WHO100.at=0;onlRedraw()});await wait(500);
out.cab=await C.evaluate(async id=>{const r=await NET.req('match.abandon',{id});const R=await NET.req('lobby.create',{ev:'egidious',loc:2,cry:false});return {rule:r.rule,room:(R.lobby||R).id}},mid);
out.ab=await until(A,async ids=>{WHO100.at=0;await who100Fetch();const r=document.querySelector(`#who100tL [data-w100r="${ids.C}"]`);if(!r||!r.querySelector('.w100ab'))return null;
  return {cls:[...r.classList].find(c=>/^w100-/.test(c)),chip:r.querySelector('.w100ab').textContent.replace(/\s+/g,' ').trim(),watch:!!r.querySelector(`[data-w100="watch"][data-v="${ids.mid}"]`),bFight:[...document.querySelector(`#who100tL [data-w100r="${ids.B}"]`).classList].includes('w100-fight'),bChip:!!document.querySelector(`#who100tL [data-w100r="${ids.B}"] .w100ab`)}},{...ids,mid},20000);
ok(out.ab&&out.ab.cls==='w100-room'&&/still fighting/.test(out.ab.chip)&&/Gamma the Bold/.test(out.ab.chip)&&out.ab.watch,'per gladiator: C is in a room (current activity) and the second chip names the gladiator still fighting, with Watch '+JSON.stringify(out.ab)+JSON.stringify(out.cab));
ok(out.ab&&out.ab.bFight&&!out.ab.bChip,'B, who stayed, is just fighting — no second chip');await shot(A,'lobby_who_abandoned.png');
await C.evaluate(async id=>{await NET.req('lobby.leave',{id}).catch(()=>{})},out.cab&&out.cab.room);
/* ── 3 · 👁 Watch B's match from the list ── */
await click(A,`#who100tL [data-w100r="${ids.B}"] [data-w100="watch"]`);out.w=await until(A,id=>ONL.watching&&ONL.watching.id===id?'watching':null,mid,30000);ok(out.w==='watching','👁 Watch opened the live match');
/* A now watches: his own row says so */
out.aw=await until(A,async()=>{const r=await NET.req('here.list',{});return r.rows[0]&&r.rows[0].me&&r.rows[0].st==='watch'?'watch':null},null,15000);ok(out.aw==='watch','the watcher shows as watching');
console.log(JSON.stringify(out));console.log('MISS',miss);console.log('ERRS',errs.slice(0,6));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();

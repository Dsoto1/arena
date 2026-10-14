/* v1.0 SERVER BATCH B — the page (293-v100srvB + the batch B section of 111-onlcore; mock, three windows: Alpha + Beta fight Ranked, Gamma watches).
   1 · the Online rail has no Spectate tab and gains 🏆 Season; the Lobby Browser has ⚔ Rooms · 👁 Live matches · 👥 Online now; Live lists the match with 👁 Watch.
   2 · a Ranked room deals its seats at random at the horns (L.shuf100); the queue estimate in a waiting quick room.
   3 · Gamma watches the Ranked match ONE TURN BEHIND: the "one turn behind" chip, match.get holds the moves of the turn in play, the pushed moves wait for
       the turn clock ('match.rel100'), and Gamma's arena never runs ahead of the released moves.
   4 · connection dots in the turn panel (green on both fighters), the 🚩 Report popup → match.report100 once a match.
   5 · the owner's own turn clock report ('own'), reveal credit ('fx') on the mock clock.
   6 · Beta abandons (Ranked → counted), two more leaves → Ranked cooldown (ranked_cd) + the house card's "Often leaves" mark.
   7 · Alpha's result → the season board (🏆 Season tab lists him), the after-match summary card with the replay link (#replay=<id>) + ⚔ Again + 🚩 Report.
   8 · the #replay= deep link of an unknown match says nothing is kept (309-v100replay; was "coming soon"); Tactics has the 🌐 Online page; phone 390: the Lobby Browser fits.
   SHOT=<dir> saves the screenshots (tools/plans/online100b/). ERRS must be []. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');
  localStorage.removeItem('flavius_onllb100');localStorage.removeItem('flavius_onlwho100')});
const errs=[];const P={};for(const n of ['A','B','C']){P[n]=await ctx.newPage();P[n].on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]))}const {A,B,C}=P;
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over|rid)/.test(k))localStorage.removeItem(k)});
for(const p of [B,C])await p.goto(URL0,{timeout:90000});for(const p of [A,B,C])await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const HAND={last:null,on:true};for(const p of [A,B,C]){const ev=p.evaluate.bind(p);p.evaluate=async(...a)=>{const L=HAND.last;
  if(HAND.on&&L&&L!==p&&!L.isClosed()){for(const t0=Date.now();Date.now()-t0<15000;){const v=await L.__ev(()=>localStorage.getItem('flavius_onlmock')).catch(()=>null);
    if(v==null||await ev(v=>localStorage.getItem('flavius_onlmock')===v,v).catch(()=>true))break;await p.waitForTimeout(100)}}
  const r=await ev(...a);HAND.last=p;return r};p.__ev=ev}
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const wait=ms=>A.waitForTimeout(ms);const out={};
const shot=async(p,n)=>{if(SHOT){fs.mkdirSync(SHOT,{recursive:true});await p.screenshot({path:path.join(SHOT,n)})}};
const until=async(p,fn,arg,ms)=>{for(const t0=Date.now();Date.now()-t0<(ms||20000);){const v=await p.__ev(fn,arg).catch(()=>null);if(v)return v;await p.waitForTimeout(150)}return null};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');await setup(C,'Gamma','slave');
const ids={};for(const [n,p] of Object.entries(P))ids[n]=await p.evaluate(()=>ONL.acct.id);
/* everybody present for the whole test (the mock counts a lanista seen in the last minute) */
await A.evaluate(ids=>{const w=mockLoad();for(const id of Object.values(ids))w.accounts[id].seen=Date.now()+3600e3;mockSave(w)},ids);

/* ── 2 · a quick Ranked room: the estimate; the horns deal the seats ── */
const q=await A.evaluate(async()=>{const r=await NET.req('lobby.quick',{ev:'democritus',ranked:true});return {id:r.lobby.id,eta:r.eta100,ranked:r.lobby.ranked}});
ok(q.ranked&&q.eta&&q.eta.need===3&&q.eta.s>0,'Find me a fight: the queue estimate rides on the reply '+JSON.stringify(q));
A.evaluate(()=>{onlineOpen('play')}).catch(()=>{});
out.eta=await until(A,()=>{const e=document.querySelector('#onl .eta100');return e&&!e.hidden?e.textContent:null});ok(out.eta&&/fill|quiet/i.test(out.eta),'the room head shows the estimate: '+out.eta);
await shot(A,'room_eta.png');
const qe=await A.evaluate(async id=>NET.req('queue.eta',{id}),q.id);ok(qe&&qe.need===3,'queue.eta '+JSON.stringify(qe));
await B.evaluate(async id=>{await NET.req('lobby.join',{id})},q.id);
const L=await A.evaluate(async id=>{if(CUR_MODAL)CUR_MODAL.done('close');await new Promise(r=>setTimeout(r,300));const L=await NET.req('lobby.start',{id});onlEnter(L);return L},q.id);
ok(L.shuf100===1&&L.players.length===2,'Ranked seats dealt at random at the horns');await B.evaluate(L=>onlEnter(L),L);HAND.on=false;const mid=L.id;
for(const t0=Date.now();Date.now()-t0<60000;){for(const p of [A,B])await p.__ev(()=>{if(CUR_MODAL&&ONLM.info>0){const x=document.querySelector('#modal .mbtns .primary')||document.querySelector('#modal .mbtns button');if(x)x.click()}}).catch(()=>{});
  if(await A.__ev(()=>!!(ONLM.on&&S&&S.phase!=='setup'))&&await B.__ev(()=>!!(ONLM.on&&S&&S.phase!=='setup')))break;await wait(250)}
for(const p of [A,B])await p.__ev(()=>setSpeedUI('fast'));

/* ── 1 · Gamma's Online: no Spectate, 🏆 Season; the Lobby Browser's three tabs; Live lists the match ── */
C.__ev(()=>{onlineOpen('lobby')}).catch(()=>{});await C.waitForSelector('#onl .onl-rail',{timeout:20000});
out.rail=await C.__ev(()=>[...document.querySelectorAll('#onl .onl-rail [data-v]')].map(b=>b.dataset.v));
ok(!out.rail.includes('spect')&&out.rail.includes('season')&&out.rail.includes('lobby'),'the rail: no Spectate, a Season tab '+out.rail);
out.tabs=await until(C,()=>{const t=[...document.querySelectorAll('#onl .w100tabs button')].map(b=>b.dataset.w100tab||b.dataset.b100tab);return t.length===3?t:null});
ok(out.tabs&&out.tabs.join()==='rooms,live,who','the Lobby Browser: Rooms · Live matches · Online now '+out.tabs);
await C.__ev(async()=>{ONL.lobbies=await NET.req('lobby.list');onlRedraw()});await C.click('#onl [data-b100tab="live"]');
out.live=await until(C,id=>{const b=document.querySelector(`#onl .b100live [data-onl="watch"][data-v="${id}"]`);return b?{rk:!!document.querySelector('#onl .b100live .b100rk'),on:document.querySelector('#onl [data-b100tab="live"]').classList.contains('on')}:null},mid);
ok(out.live&&out.live.rk&&out.live.on,'Live matches lists the Ranked match with 👁 Watch '+JSON.stringify(out.live));await shot(C,'lobby_live.png');
await C.click('#onl [data-w100tab="who"]');out.who=await until(C,()=>!!document.getElementById('who100t'));ok(out.who,'Online now tab');await shot(C,'lobby_who.png');
await C.click('#onl [data-w100tab="rooms"]');out.rooms=await until(C,()=>!!document.querySelector('#onl .onl-lb, #onl .lb96, #onl table'));ok(out.rooms,'Rooms tab');await shot(C,'lobby_rooms.png');
/* an old Spectate link lands on Live matches */
out.sp=await C.__ev(()=>{ONL.tab='spect';onlRedraw();return ONL.tab==='lobby'&&WHO100.lb==='live'&&!!document.querySelector('#onl .b100live')});ok(out.sp,'an old Spectate link → Live matches');

/* ── 3 · Gamma watches one turn behind ── */
await C.__ev(()=>{WHO100.lb='live';onlRedraw()});await C.click(`#onl .b100live [data-onl="watch"][data-v="${mid}"]`);
out.wOn=await until(C,()=>!!(S&&S.onl&&S.onl.watch&&ONLM.on),null,30000);ok(out.wOn,'Gamma is watching');
/* the fighters play a few turns (Choice: coin; Action: end) */
const play=async p=>{const r=await p.__ev(()=>{if(!ONLM.on||!S||S.over||!onlmMine()||S.busy)return '';if(CUR_MODAL){return document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button')?'#modal .mbtns button':''}
  if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return '[data-act="coin"]';if(S.phase==='action'&&document.querySelector('[data-act="end"]'))return '[data-act="end"]';return ''}).catch(()=>'');
  if(r)await p.click(r,{timeout:2000,force:true}).catch(()=>{});return r};
const samples=[];for(const t0=Date.now();Date.now()-t0<40000&&samples.length<40;){await play(A);await play(B);
  const s=await C.__ev(()=>({next:ONLM.next,hold:B100.hold.length,chip:!!(document.getElementById('rw100')&&!document.getElementById('rw100').hidden)})).catch(()=>null);
  const an=await A.__ev(()=>ONLM.next).catch(()=>null);if(s&&an!=null)samples.push({...s,an});await wait(400)}
out.watch={n:samples.length,behind:samples.filter(s=>s.next<s.an).length,held:Math.max(0,...samples.map(s=>s.hold)),caught:Math.max(0,...samples.map(s=>s.next)),chip:samples.some(s=>s.chip),aMax:Math.max(0,...samples.map(s=>s.an))};
ok(out.watch.chip,'the "one turn behind" chip');ok(out.watch.behind>0&&out.watch.held>0,'Gamma runs behind the fighters (held moves) '+JSON.stringify(out.watch));
ok(out.watch.caught>0,'released moves arrive at the next turn '+JSON.stringify(out.watch));
out.get=await C.__ev(async id=>{const r=await NET.req('match.get',{id,from:0});const M=mockLoad().matches[id];return {n:r.inputs.length,all:M.inputs.length,rel:M.rel100,d:r.delay100}},mid);
ok(out.get.d===1&&out.get.n===(out.get.rel==null?-1:out.get.rel)+1&&out.get.n<=out.get.all,'match.get gives the watcher only what was released '+JSON.stringify(out.get));
await shot(C,'watch_behind.png');

/* ── 4 · connection dots + 🚩 report ── */
out.dots=await until(A,()=>{if(typeof b100Conn==='function'&&Date.now()-B100.connAt>3000)b100Conn();const d=[...document.querySelectorAll('#tt100 .cd100')];return d.length>=2&&d.every(x=>x.dataset.st==='on')?d.length:null},null,25000);
ok(out.dots>=2,'a green connection dot per human seat in the turn panel');await shot(A,'seat_dots.png');
await C.__ev(id=>b100Report(id),mid);out.rp=await until(C,()=>!!document.querySelector('.rp100pop #rp100s'));ok(out.rp,'the report popup');await shot(C,'report.png');
await C.__ev(()=>{document.querySelector('.rp100pop input[value="afk"]').checked=true;document.querySelector('.rp100pop [data-rp100="send"]').click()});
out.rep=await until(C,id=>{const w=mockLoad();const R=(w.reports100||{})[id];return R&&Object.values(R)[0]},mid);ok(out.rep&&out.rep.reason==='afk','the report is logged '+JSON.stringify(out.rep));
out.rep2=await C.__ev(async id=>{try{await NET.req('match.report100',{id,seat:0,reason:'afk'});return 'taken'}catch(e){return e.code||e.message}},mid);ok(out.rep2==='report_once','once a match: '+out.rep2);

/* ── 5 · the owner's own clock + a reveal's credit (mock clock) ── */
/* the turn may change between reading the clock and the request (the credit is then rightly refused): retry on a moved turn */
out.own=await A.__ev(async id=>{let o=null;for(let k=0;k<12;k++){const M=mockLoad().matches[id];const tc=M.tc100;if(!tc)return {no:1};if(tc.end||M.status&&M.status!=='live'){await new Promise(z=>setTimeout(z,300));continue}const L=mockLoad().lobbies[id];const owner=L.players[tc.seat].id===ONL.acct.id;
  const r=await NET.req('match.clock',{id,kind:'fx',t:tc.t,k:'chest',i:77+k}).catch(()=>null);const M2=mockLoad().matches[id];o={owner,x0:tc.x||0,x1:M2.tc100.x||0,t:tc.t,t2:M2.tc100.t,own:M2.tc100.own||0,k};
  if(M2.tc100.t===tc.t&&M2.tc100.seat===tc.seat&&!M2.tc100.end)return o;await new Promise(z=>setTimeout(z,300))}return o},mid);
ok(out.own.no||(out.own.owner?out.own.x1-out.own.x0===900:out.own.x1===out.own.x0),'a reveal credits only the turn owner '+JSON.stringify(out.own));

/* ── 6 · Beta abandons (Ranked) → counted; the cooldown; the house card mark ── */
await B.__ev(async id=>{await NET.req('match.abandon',{id})},mid);
out.lv=await B.__ev(()=>{const w=mockLoad();return (w.accounts[ONL.acct.id].lv100||[]).map(x=>x.k)});ok(out.lv.join()==='abandon','a Ranked abandon is counted '+out.lv);
out.cd=await B.__ev(async()=>{const w=mockLoad();const A=w.accounts[ONL.acct.id];A.lv100=ONLC.leaveAdd100(ONLC.leaveAdd100(A.lv100,'drop',Date.now()-2000),'timeout',Date.now()-1000);mockSave(w);
  try{await NET.req('char.create',{name:'Beta Secundus',cls:'hero'})}catch(e){}try{await NET.req('lobby.create',{ev:'democritus',ranked:true,cry:false});return 'opened'}catch(e){return e.code||e.message}});
ok(out.cd==='ranked_cd','three leaves → no Ranked for a while: '+out.cd);
await C.__ev(id=>{hc98Open({acct:id})},ids.B);out.hc=await until(C,()=>{const e=document.querySelector('.hc98pop .lv100');return e?e.textContent:null});ok(out.hc&&/Often leaves/.test(out.hc),'the house card shows the mark: '+out.hc);
await shot(C,'house_leaver.png');await C.__ev(()=>{for(const x of document.querySelectorAll('.hc98pop'))x.remove()});

/* ── 7 · Alpha's result: the season board + the after-match summary ── */
out.res=await A.__ev(async id=>{const table=S.players.map((p,i)=>({seat:i,won:onlmSeatOf(p)===ONLM.me,place:onlmSeatOf(p)===ONLM.me?1:2,f:onlmSeatOf(p)===ONLM.me?14:3,survives:true}));
  const r=await NET.req('match.result',{id,table,hash:'h'});onlSettled(r);return {pending:!!r.pending,glory:r.out&&r.out.glory}},mid);
ok(!out.res.pending&&out.res.glory>0,'settled with Glory '+JSON.stringify(out.res));
out.sum=await until(A,id=>{const e=document.getElementById('as100');if(!e)return null;const i=e.querySelector('.as100l input');return {link:i&&i.value,again:!!e.querySelector('[data-as100="again"]'),glory:/Glory/.test(e.textContent)}},mid,15000);
ok(out.sum&&out.sum.link.endsWith('#replay='+mid)&&out.sum.again&&out.sum.glory,'the after-match summary: replay link + ⚔ Again + Glory '+JSON.stringify(out.sum));await shot(A,'after_match.png');
await C.__ev(()=>{if(S&&S.onl&&S.onl.watch)try{onlExit()}catch(e){}if(CUR_MODAL)CUR_MODAL.done('close')});await wait(400);
C.__ev(()=>{B100.sb=null;onlineOpen('season')}).catch(()=>{});
out.sb=await until(C,me=>{const t=document.querySelector('#onl .sb100tb');if(!t)return null;return {rows:t.querySelectorAll('tr').length-1,alpha:/Alpha the Bold/.test(t.textContent),tit:document.querySelectorAll('#onl .sb100t').length}},null,20000);
ok(out.sb&&out.sb.rows>=1&&out.sb.alpha&&out.sb.tit===3,'🏆 Season: the board by Glory gained + the three Tituli '+JSON.stringify(out.sb));await shot(C,'season.png');

/* ── 8 · the deep link, Tactics Online, phone ── */
await C.__ev(()=>{if(CUR_MODAL)CUR_MODAL.done('close')});await wait(300);
await C.__ev(()=>{location.hash='#replay=Ltest42'});out.dl=await until(C,()=>{const e=document.querySelector('.rp100pop');return e&&/match replay/i.test(e.textContent)&&!/coming soon/i.test(e.textContent)});ok(out.dl,'#replay= of an unknown match: the v1.0 replay card (309) says nothing is kept');
await C.__ev(()=>{for(const x of document.querySelectorAll('.rp100pop'))x.remove()});
await until(C,()=>{if(CUR_MODAL)CUR_MODAL.done('close');return document.getElementById('modal').hidden&&!CUR_MODAL},null,15000);await wait(600);
C.__ev(()=>{showRules('onl')}).catch(()=>{});out.tac=await until(C,()=>{const p=document.querySelector('#tac98 [data-pane="onl"]');return p&&!p.hidden&&/Hot seat/.test(p.textContent)&&!!document.querySelector('#tac98 [data-tac98="onl"].on')});
if(!out.tac)out.tacDbg=await C.__ev(()=>({tac:!!document.getElementById('tac98'),pane:!!document.querySelector('#tac98 [data-pane="onl"]'),tab:!!document.querySelector('#tac98 [data-tac98="onl"]'),page:(document.getElementById('tac98')||{}).dataset,title:(document.getElementById('mTitle')||{}).textContent,modal:!document.getElementById('modal').hidden}));
ok(out.tac,'Tactics → 🌐 Online lists what plays only offline '+JSON.stringify(out.tacDbg||''));await shot(C,'tactics_online.png');await C.__ev(()=>{if(CUR_MODAL)CUR_MODAL.done('x')});await wait(300);
await C.setViewportSize({width:390,height:844});C.__ev(()=>{WHO100.lb='live';onlineOpen('lobby')}).catch(()=>{});
out.ph=await until(C,()=>{if(!document.querySelector('#onl .b100live'))return null;return {sx:document.documentElement.scrollWidth<=innerWidth+1,w:document.documentElement.scrollWidth}});
ok(out.ph&&out.ph.sx,'phone 390: the Lobby Browser has no sideways scroll '+JSON.stringify(out.ph));await shot(C,'phone_lobby.png');
/* no "digital rules" label in a room */
out.dig=await A.__ev(()=>/digital rules/i.test(document.body.innerText||''));ok(!out.dig,'no "digital rules" label');

console.log(JSON.stringify(out).slice(0,1500));console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();

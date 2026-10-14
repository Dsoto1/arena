/* online v0.81 (124-v81onl): a Ranked match ends on both screens at the same point; B's report goes at gameOver (results window
   still open) with the fingerprint taken before the clean-up crew; A's report fails (no connection), waits in localStorage and is
   sent after A reloads → the match settles, not void. After the bout B sees "⏳ Waiting for the others to confirm" — no Rejoin,
   no "… is on the move" over the Online window, onlEnter/onlAttach refuse, the live record is gone, 🚪 Abandon is harmless
   (no Damnatio) and its popup says the bout is over. Invites: one for a room that does not exist never pops up; ⚔ Join on a room
   that closed → "That room closed before you got there"; one that started → the same with 👁 Watch. CF wears the wheat;
   the sign-in hides the Online server box without the word; the landing has the stage map + the Today ribbon; at 390 px the
   playlists scroll sideways (a vertical wheel moves them). SHOT=<dir> saves screenshots. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1')});
const errs=[];const A=await ctx.newPage(),B=await ctx.newPage(),C=await ctx.newPage();for(const [n,p] of [['A',A],['B',B],['C',C]])p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
const wait=ms=>A.waitForTimeout(ms);
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>{for(const k of ['flavius_onlmock','flavius_onlmatch80','flavius_onlreport81','flavius_onlover81','flavius_onlsrv81'])localStorage.removeItem(k)});await B.goto(URL0,{timeout:90000});await C.goto(URL0,{timeout:90000});await wait(2500);
/* the sign-in screen: no server box without the word; the wording */
const sign=async()=>A.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();onlineOpen('play');for(let i=0;i<40&&!document.getElementById('onl');i++)await new Promise(r=>setTimeout(r,100));await new Promise(r=>setTimeout(r,300));
  const o=document.getElementById('onl');return {box:!!(o&&o.querySelector('.onl-srv')),txt:o?o.textContent.replace(/\s+/g,' '):''}});
const sign0=await sign();
const word=await A.evaluate(()=>{const C2=CHEATS[cheatKey(String.fromCharCode(79,78,76,83,82,86))];const m=C2?C2.run():'';onlRedraw();return {m,box:!!document.querySelector('#onl .onl-srv')}});
await A.evaluate(()=>{localStorage.removeItem('flavius_onlsrv81');if(CUR_MODAL)CUR_MODAL.done('close')});await wait(400);
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});
  window.T81=[];const mt=mToast;mToast=function(m){T81.push(String(m));return mt.apply(this,arguments)}},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');await setup(C,'Gamma','amazonia');
/* the mock world is one localStorage item: a window acts on another's write only once it has it; waits poll for what the next check
   reads (the regression runs 3 tests at once: timers and storage sync stretch) */
const sync=async(from,to)=>{const t0=Date.now();while(Date.now()-t0<15000){const v=await from.evaluate(()=>localStorage.getItem('flavius_onlmock'));if(await to.evaluate(v=>localStorage.getItem('flavius_onlmock')===v,v))return;await to.waitForTimeout(100)}};
const until=async(p,fn,arg,ms=20000)=>{const t0=Date.now();let v;while(Date.now()-t0<ms){v=await p.evaluate(fn,arg).catch(()=>null);if(v)return v;await p.waitForTimeout(200)}return v};
const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:true}));
await sync(A,B);for(let k=0;k<8;k++){await B.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}},L.id);if(await until(A,id=>ONLC.humansOf(mockLoad().lobbies[id]||{}).length>=2,L.id,5000))break}
const L2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);await B.evaluate(L=>onlEnter(L),L2);
/* the driver clicks like a person (trusted clicks): an element.click() on [data-act] is not recorded online (113 records trusted
   clicks only) but the panel still acts on that screen alone — the two screens drifted apart and never met at the same point */
const drive=async p=>{const sel=await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){return document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button')?'#modal .mbtns button':null}
  if(!S||S.over||!ONLM.on||!onlmMine()||S.busy)return null;if(S.phase==='choice')return document.querySelector('[data-act="coin"]')?'[data-act="coin"]':null;if(S.phase==='action')return document.querySelector('[data-act="end"]')?'[data-act="end"]':null;return null}).catch(()=>null);
  if(sel)await p.click(sel,{timeout:2000,force:true}).catch(()=>{})};
{const t0=Date.now();while(Date.now()-t0<6000){await drive(A);await drive(B);await wait(250)}}
/* A loses its connection for the report */
await A.evaluate(()=>{const b0=NET.req;NET.req=function(t,d){if(t==='match.result'&&window.FAIL81)return Promise.reject(new Error('Connection lost.'));return b0.apply(this,arguments)};window.FAIL81=1});
/* both screens idle at the same point → the bout ends on both */
/* stop at a human's own decision (nobody clicks): both screens settle on the same state */
const st=p=>p.evaluate(()=>({ph:S&&S.phase,busy:S&&S.busy,m:!!CUR_MODAL,mt:CUR_MODAL&&(document.querySelector('#modal h2,#modal .mtitle')||{}).textContent,q:ONLM.q.length,pend:!!ONLM.pend,inf:ONLM.inflight,act:onlmActor(),me:ONLM.me,h:onlHash(),next:ONLM.next,ok:!!(S&&S.onl&&!S.over&&!S.busy&&!CUR_MODAL&&!ONLM.q.length&&!ONLM.pend&&!ONLM.inflight&&['choice','action'].includes(S.phase)&&onlmActor()>=0)}));
let same=null;{const t0=Date.now();while(Date.now()-t0<300000){const a=await st(A),bb=await st(B);if(process.env.DBG)console.log(JSON.stringify([a,bb]));if(a.ok&&bb.ok&&a.h===bb.h&&a.next===bb.next){same=a.h;break}if(!a.ok&&!bb.ok){await drive(A);await drive(B)}else{await A.evaluate(()=>{if(CUR_MODAL&&ONLM.info>0)CUR_MODAL.done(null)});await B.evaluate(()=>{if(CUR_MODAL&&ONLM.info>0)CUR_MODAL.done(null)})}await wait(300)}}
await Promise.all([A,B].map(p=>p.evaluate(()=>{S.players[0].cf=34;S.players[1].cf=30;setTimeout(()=>gameOver([S.players[0]],'The editor calls the bout.'),10)})));
await until(B,id=>{const M=mockLoad().matches[id]||{};return !!CUR_MODAL&&!!ONL81.hashAt[id]&&!!((M.reports||{})[ONL.acct.id])&&!!(JSON.parse(localStorage.getItem('flavius_onlreport81.'+ONL.acct.id)||'{}')||{}).acked},L.id,30000);
await until(A,id=>{const x=JSON.parse(localStorage.getItem('flavius_onlreport81.'+ONL.acct.id)||'null');return !!(x&&x.payload&&ONL81.hashAt[id])},L.id,30000);await wait(300);
const atEnd=await B.evaluate(id=>{const w=mockLoad();const M=w.matches[id]||{};return {modal:!!CUR_MODAL,hashAt:ONL81.hashAt[id],rep:((M.reports||{})[ONL.acct.id]||{}).hash,acked:!!(JSON.parse(localStorage.getItem('flavius_onlreport81.'+ONL.acct.id)||'{}')||{}).acked}},L.id);
const aEnd=await A.evaluate(id=>{const x=JSON.parse(localStorage.getItem('flavius_onlreport81.'+ONL.acct.id)||'null');const w=mockLoad();const M=w.matches[id]||{};return {stored:x&&x.id===id&&x.payload&&x.payload.hash,hashAt:ONL81.hashAt[id],sent:!!(M.reports||{})[ONL.acct.id],table:x&&x.payload&&x.payload.table.length}},L.id);
/* B keeps the results open while the crew works, then goes back to Online */
await wait(6000);
await B.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done('close')});await wait(800);await sync(A,B);await B.evaluate(()=>onlExit());await until(B,()=>!!document.getElementById('onl')&&!!document.getElementById('onlWait81'),null,30000);await wait(500);
const bOnl=await B.evaluate(async id=>{const o=document.getElementById('onl');const w=document.getElementById('onlWait');
  const r={onl:!!o,waitCard:!!document.getElementById('onlWait81'),waitTxt:(document.getElementById('onlWait81')||{}).textContent||'',rejoin:!!(o&&o.querySelector('[data-onl="rejoin"],[data-onl="enter"]')),
    banner:!!(w&&!w.hidden&&getComputedStyle(w).display!=='none'),off:document.body.classList.contains('onl-off'),rec:!!localStorage.getItem('flavius_onlmatch80'),live:!!onlLive80Get()};
  const Lx=(ONL.lobbies||[]).find(x=>x.id===id);r.lobbyLive=!!(Lx&&Lx.status==='live');
  if(Lx){onlEnter(Lx);await onlAttach(Lx,'seat')}await new Promise(q=>setTimeout(q,1500));const w2=document.getElementById('onlWait');
  r.after={on:ONLM.on,watching:!!ONL.watching,banner:!!(w2&&!w2.hidden&&getComputedStyle(w2).display!=='none'),inMatch:!!(S&&S.onl&&!S.over)};return r},L.id);
if(SHOT)await B.screenshot({path:path.join(SHOT,'onl_waiting.png')});
/* 🚪 after the bout: nothing reaches the server, the popup says the bout is over */
const bAb=await B.evaluate(async id=>{const r=await NET.req('match.abandon',{id});const w=mockLoad();const c=w.chars[ONL.char.id];const M=w.matches[id]||{};
  const pr=onlAbandonAsk80({ranked:true,rule:'fate',char:onlLive80Char(ONL.char),over:true});await new Promise(q=>setTimeout(q,300));const box=document.querySelector('.ask76bg .verask');const txt=box?box.textContent.replace(/\s+/g,' '):'';
  const no=document.querySelector('.ask76bg [data-ask76="0"]');if(no)no.click();await pr;return {r,alive:c&&c.alive,abandoned:!!(M.abandoned||{})[ONL.acct.id],txt}},L.id);
/* A reloads: the saved report goes */
await A.reload({timeout:90000});await until(A,id=>(mockLoad().matches[id]||{}).status==='done'&&!Object.keys(localStorage).some(k=>/^flavius_onlreport81/.test(k)),L.id,40000);await wait(300);
const aBack=await A.evaluate(id=>{const w=mockLoad();const M=w.matches[id]||{};const Lb=w.lobbies[id]||{};const A2=ONLC.agree(M.reports||{});
  return {status:M.status,lobby:Lb.status,reps:Object.keys(M.reports||{}).length,hashes:Object.values(M.reports||{}).map(r=>r.hash),void:!!A2.void,outs:Object.keys(M.outs||{}).length,stored:Object.keys(localStorage).some(k=>/^flavius_onlreport81/.test(k))}},L.id);
/* A's landing: the stage map, the Today ribbon, the Forum in the side column, CF with the wheat */
await A.evaluate(async()=>{window.T81=[];const mt=mToast;mToast=function(m){T81.push(String(m));return mt.apply(this,arguments)};if(CUR_MODAL)CUR_MODAL.done(null);menuHide();onlineOpen('play')});await until(A,()=>!!document.querySelector('#onl #onlStageMap81 .omap-in')&&/Alpha the Bold/.test((document.getElementById('v85show')||{}).textContent||''),null,30000);await wait(500);
const land=await A.evaluate(()=>{const o=document.getElementById('onl');const t=document.getElementById('v85show') /* v0.85: the Today ribbon became the two showcases (146-v85land) */;
  return {map:!!o.querySelector('.onl-stage #onlStageMap81 .omap-in'),dots:o.querySelectorAll('#onlStageMap81 .omap-dot').length,oval:!!o.querySelector('.omap'),row80:!!document.getElementById('onlRow80'),
    forum:!!o.querySelector('.a100-right #v85show')&&!o.querySelector('#acta87')&&!o.querySelector('#onlFeed80') /* v1.0: the Acta is merged into the showcases (right column) */,news:1,empire:/The empire/.test(o.textContent),cap:(document.getElementById('omapCap')||{}).textContent||'',
    online:(o.textContent.match(/lanistas? · \d+ guests?/g)||[]).length,today:t?{ribbon:!document.getElementById('onlToday80'),txt:t.textContent.replace(/\s+/g,' '),wheat:!!t.querySelector('svg.ico')}:null,
    stageWheat:!!o.querySelector('.onl-pstats svg.ico,.onl-pstats .ic87w'),star:/⭐\s*\d+\s*(lifetime )?CF|CF\s*⭐/.test(o.textContent),tones:[...o.querySelectorAll('.onl-pl.pl81')].filter(e=>{const s=e.closest('.rot88s');return !s||s.classList.contains('on')})/* v0.98: a cycling box (Familia + more events) counts once */.map(e=>getComputedStyle(e).borderTopColor)}});
if(SHOT)await A.screenshot({path:path.join(SHOT,'onl_landing.png')});
/* v0.87: a click on the map does nothing; only the 🔍 opens the large view */
await A.evaluate(()=>{const s=document.querySelector('#onlStageMap81');if(s)s.click()});await wait(400);const big0=await A.evaluate(()=>{const o=document.querySelector('.omapbig');if(o)o.remove();return !!o});
await A.evaluate(()=>{const s=document.querySelector('#onl .scap81 [data-onl="omap"]');if(s)s.click()});await wait(400);const big=!big0&&await A.evaluate(()=>{const o=document.querySelector('.omapbig');if(o)o.remove();return !!o});
const wheat=await A.evaluate(()=>{onlSettled({char:ONL.char,out:{pay:12,cf:9}});return new Promise(r=>setTimeout(()=>r(T81.some(t=>/<svg class="ico"/.test(t)&&/lifetime CF/.test(t))&&!T81.some(t=>/⭐\s*\d+\s*(lifetime )?CF|CF\s*⭐/.test(t)) /* v0.84: the week card's ⭐ is not a CF star */),2800))});
const hall=await A.evaluate(async()=>{ONL.hall=[{name:'Old Crixus',cls:'veteranus',rank:'veteranus',lifeCF:320,survived:20,why:'Veteranus'}];ONL.hallAt=Date.now();const h=onlHallHTML();return /<svg class="ico"[\s\S]*320 CF|<i class=ic87w><\/i>320 CF/.test(h)});
/* invites: a room that does not exist never pops up */
await A.evaluate(()=>NET.emit('lobby.invite',{row:{id:'Lnope',ev:'democritus',loc:6,ranked:false,seats:4,players:[],members:[]},from:'Nobody',fromId:'u_x'}));await wait(1800);
const inv0=await A.evaluate(()=>!!document.querySelector('.inv80bg'));
/* a room that closed while the invitation was open */
await sync(A,C);const R=await C.evaluate(async()=>await NET.req('lobby.create',{ev:'cassian',ranked:false}));await sync(C,A);
const invite=async row=>A.evaluate(r=>NET.emit('lobby.invite',{row:r,from:'Gamma the Bold',fromId:'u_c'}),row);
await invite(R);await until(A,()=>!!document.querySelector('.inv80bg [data-onl="ijoin"]'));const inv1=await A.evaluate(()=>!!document.querySelector('.inv80bg [data-onl="ijoin"]'));
await A.evaluate(()=>{for(const p of document.querySelectorAll('.inv80bg'))p.dataset.chk81=Date.now()}); /* the window's own 10 s re-check would take the invitation down first when the run is slow: it was just checked */await C.evaluate(async id=>{await NET.req('lobby.leave',{id})},R.id);await sync(C,A);await until(A,id=>{for(const p of document.querySelectorAll('.inv80bg'))p.dataset.chk81=Date.now();const L=mockLoad().lobbies[id];return !L||L.status==='done'},R.id,45000);
/* (the re-check mark is renewed in the same breath as the click: under load the sync above can outlast its 10 s) */
await A.evaluate(()=>{T81=[];for(const p of document.querySelectorAll('.inv80bg'))p.dataset.chk81=Date.now();{const j=document.querySelector('.inv80bg [data-onl="ijoin"]');if(j)j.click()}});await until(A,()=>T81.some(t=>/That room closed before you got there/.test(t)),null,40000);await wait(500);
const dead1=await A.evaluate(id=>({toast:T81.some(t=>/That room closed before you got there/.test(t)),joined:(ONL.lobbies||[]).some(L=>L.id===id&&(L.members||[]).some(m=>m.id===ONL.acct.id)),pop:!!document.querySelector('.dead81bg')}),R.id);
/* a room that started while the invitation was open: 👁 Watch */
const R2=await C.evaluate(async()=>await NET.req('lobby.create',{ev:'egidious',ranked:false}));await sync(C,A);
await invite(R2);await until(A,()=>!!document.querySelector('.inv80bg [data-onl="ijoin"]'));const inv2=await A.evaluate(()=>!!document.querySelector('.inv80bg [data-onl="ijoin"]'));
await A.evaluate(()=>{for(const p of document.querySelectorAll('.inv80bg'))p.dataset.chk81=Date.now()}); /* the window's own 10 s re-check would take the invitation down first when the run is slow: it was just checked */await C.evaluate(id=>{const w=mockLoad();w.lobbies[id].status='live';w.lobbies[id].started=Date.now();mockSave(w)},R2.id);await sync(C,A);
/* the scenario needs A's window to see the room started (the shared mock world reaches it late under load) before Join is pressed */
/* (the invitation's own 10 s re-check is held off meanwhile, as above: it would take the invitation down before Join, which is the other path) */
await until(A,id=>{for(const p of document.querySelectorAll('.inv80bg'))p.dataset.chk81=Date.now();return (mockLoad().lobbies[id]||{}).status==='live'},R2.id,45000);
await A.evaluate(()=>{T81=[];for(const p of document.querySelectorAll('.inv80bg'))p.dataset.chk81=Date.now();{const j=document.querySelector('.inv80bg [data-onl="ijoin"]');if(j)j.click()}});await until(A,()=>!!document.querySelector('.dead81bg'),null,40000);await wait(300);
const dead2=await A.evaluate(()=>{const p=document.querySelector('.dead81bg');return p?{txt:p.textContent.replace(/\s+/g,' '),watch:!!p.querySelector('[data-onl81="dwatch"]')}:null});
if(!dead2)console.log('NO DEAD POPUP',JSON.stringify(await A.evaluate(id=>({toasts:T81.slice(0,4),mine:(onlMyLobby()||{}).id||null,st:(mockLoad().lobbies[id]||{}).status,inv:!!document.querySelector('.inv80bg')}),R2.id)));
if(SHOT)await A.screenshot({path:path.join(SHOT,'onl_deadinvite.png')});
await A.evaluate(()=>{const x=document.querySelector('.dead81bg [data-onl81="dclose"]');if(x)x.click()});
/* phones: the stage in one column, the playlists sideways */
const ctx2=await b.newContext({viewport:{width:390,height:844}});await ctx2.route(/fonts\./,r=>r.abort());await ctx2.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1')});const P=await ctx2.newPage();P.on('pageerror',e=>errs.push('P:'+e.message));await P.goto(URL0,{timeout:90000});await P.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await P.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name:'Delta'});await NET.req('domus.create',{name:'Domus Delta'});ONL.char=await NET.req('char.create',{name:'Delta the Bold',cls:'venatore'});onlineOpen('play')});await P.waitForFunction(()=>!!document.querySelector('.onl-pls81')&&!!document.querySelector('.a81-forum'),null,{timeout:30000}).catch(()=>{});await P.waitForTimeout(500);
const ph=await P.evaluate(async()=>{const r=document.querySelector('.onl-pls81');const sg=document.querySelector('.onl-stage');const o={flex:r&&getComputedStyle(r).display,over:r?r.scrollWidth>r.clientWidth+10:false,cols:sg?getComputedStyle(sg).gridTemplateColumns.split(' ').length:0,hscroll:document.documentElement.scrollWidth>innerWidth+2};
  r.scrollIntoView();r.dispatchEvent(new WheelEvent('wheel',{deltaY:240,bubbles:true,cancelable:true}));await new Promise(q=>setTimeout(q,200));o.left=r.scrollLeft;
  const pos=s=>{const e=document.querySelector(s);return e?e.getBoundingClientRect().top:-1};o.order=[pos('.a81-stage'),pos('.a81-pls'),pos('.a100-right'),pos('#v85show')];return o});
if(SHOT){await P.evaluate(()=>{const b=document.getElementById('mBody');if(b)b.scrollTop=0});await P.screenshot({path:path.join(SHOT,'onl_phone.png')})}
console.log(JSON.stringify({sign0:{box:sign0.box,who:/Other players see only your gladiator/.test(sign0.txt)},word,same,atEnd,aEnd,bOnl,bAb:{...bAb,txt:bAb.txt.slice(0,160)},aBack,land,big,wheat,hall,inv0,inv1,dead1,inv2,dead2,ph}));
const miss=[];
if(sign0.box||!/Other players see only your gladiator/.test(sign0.txt))miss.push('sign-in: server box hidden + wording');if(!word.box||!/Online server/.test(word.m))miss.push('the word shows the server box');
if(!same)miss.push('both screens at the same point');
if(!atEnd.modal||!atEnd.hashAt||atEnd.rep!==atEnd.hashAt||!atEnd.acked||atEnd.hashAt!==aEnd.hashAt)miss.push('report sent at gameOver with the pre-clean-up hash');
if(!aEnd.stored||aEnd.stored!==aEnd.hashAt||aEnd.sent||aEnd.table!==4)miss.push('failed report kept in localStorage');
if(!bOnl.onl||!bOnl.lobbyLive||!bOnl.waitCard||!/Waiting for the others to confirm the result/.test(bOnl.waitTxt)||bOnl.rejoin)miss.push('waiting card instead of Rejoin');
if(bOnl.banner||bOnl.off||bOnl.rec||bOnl.live)miss.push('no banner / live record after the match');
if(bOnl.after.on||bOnl.after.watching||bOnl.after.banner||bOnl.after.inMatch)miss.push('an over match is never re-entered');
if(!bAb.r.over||!bAb.alive||bAb.abandoned||!/The bout is over/.test(bAb.txt)||/dies and is struck/.test(bAb.txt))miss.push('abandon after the bout: no Damnatio');
if(aBack.status!=='done'||aBack.reps!==2||aBack.void||!aBack.outs||aBack.stored||aBack.hashes.some(h=>h!==aEnd.hashAt))miss.push('saved report resent after reload → settled');
if(!land.map||!land.dots||land.oval||land.row80||!land.forum||!land.news||land.empire||land.online!==1)miss.push('landing: stage map, the Acta in the side column, one online count');
if(!land.today||!land.today.ribbon||!/(Alpha|Beta) the Bold/.test(land.today.txt)/* v1.0 293: Ranked seats are dealt at random at the horns, so either lanista may hold seat 0 and win */||!land.today.wheat)miss.push('Today showcases (no ribbon)');
if(!land.stageWheat||land.star)miss.push('wheat on the stage');if(land.tones.length<4||new Set(land.tones).size!==land.tones.length)miss.push('playlist border tones');if(!big)miss.push('only the 🔍 opens the large view');
if(!wheat)miss.push('result toast wheat');if(!hall)miss.push('Hall wheat');
if(inv0)miss.push('invite to a missing room popped up');if(!inv1||!dead1.toast||dead1.joined||dead1.pop)miss.push('closed room → message');
if(!inv2||!dead2||!dead2.watch||!/That room closed before you got there/.test(dead2.txt))miss.push('started room → message + Watch');
if(ph.flex!=='flex'||!ph.over||!(ph.left>0)||ph.cols!==1||ph.hscroll)miss.push('phone: one-column stage, sideways playlists');
if(!(ph.order[0]<ph.order[1]&&ph.order[1]<ph.order[2]&&ph.order[2]<ph.order[3]))miss.push('phone order stage → Playlists → right column → Showcases');
console.log('MISS',miss);console.log('ERRS',errs);await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();

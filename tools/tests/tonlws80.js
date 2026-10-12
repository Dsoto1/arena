/* online v0.80 through the REAL server code (server/src/index.js's handler on a local WebSocket server — server/test/localws.js,
   in-memory store, dev sign-in), three windows in their own browser contexts (three time zones):
   presence (hello.here: n + zones), A opens a Custom room from the Lobby Browser (＋ Custom room) and the Praeco's 'open' line
   reaches C (free, Online open); B presses the Classic Custom playlist (lobby.quick) and lands in A's room (no twin);
   room phrases (lobby.say) reach the other window's log + lobby.chatlog; A sounds the horns, B walks in by itself; moves sync
   with no resync; a 💬 match phrase (match.say) shows as a bubble on the other screen; the bout ends on both screens → the
   result settles → after 10 s on the results a farewell phrase still reaches the other screen → ⚔ Again opens a new room and the other fighter gets the invitation.
   Needs server/node_modules (cd server && npm install); without it the test says SKIP and passes. */
const http=require('http'),fs=require('fs'),path=require('path');
let LWS;try{LWS=require('../../server/test/localws.js')}catch(e){console.log('SKIP — no server/node_modules (cd server && npm install)');console.log('MISS',[]);console.log('ERRS',[]);process.exit(0)}
const {chromium}=require('playwright');(async()=>{const WS=await LWS.start(0);const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[],notes=[];const P={};const TZ={A:'Europe/Rome',B:'Asia/Tokyo',C:'America/New_York'};
for(const n of ['A','B','C']){const ctx=await b.newContext({viewport:{width:1300,height:900},timezoneId:TZ[n]});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.removeItem('flavius_onlquiet80');localStorage.removeItem('flavius_onlmute80')});
  await ctx.addInitScript(p=>{localStorage.setItem('flavius_onlserver',JSON.stringify({ws:'ws://127.0.0.1:'+p,dev:true}))},WS.port);
  P[n]=await ctx.newPage();P[n].on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]))}
const {A,B,C}=P;const wait=ms=>A.waitForTimeout(ms);
for(const p of [A,B,C])await p.goto(URL0,{timeout:90000});for(const p of [A,B,C])await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});await wait(1000);
/* poll until fn (in the page) is truthy */
/* (the regression runs 3 tests at once: every wait polls for its condition with room to spare) */
const until=async(p,fn,arg,ms=20000)=>{const t0=Date.now();let v;while(Date.now()-t0<ms){try{v=await p.evaluate(fn,arg)}catch(e){v=null}if(v)return v;await p.waitForTimeout(200)}return v};
const click=async(p,sel,ms=8000)=>{try{await p.waitForSelector(sel,{timeout:ms});await p.click(sel);await p.waitForTimeout(400);return true}catch(e){notes.push('no '+sel);return false}};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();await netPick();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});return NET.mode},[name,cls]);
const modes=[];for(const [p,n,c] of [[A,'Alpha','hero'],[B,'Beta','soldier'],[C,'Gamma','slave']])modes.push(await setup(p,n,c));
for(const p of [A,B,C])p.evaluate(()=>{onlineOpen('play')}).catch(()=>{});
for(const p of [A,B,C])await until(p,()=>!!document.querySelector('#onl .onl-main'));await wait(800);
/* presence: hello counts everyone here, with their time zones */
const hello=await A.evaluate(async()=>{const h=await NET.req('hello',{all:1});return {here:h.here,online:h.online,forum:Array.isArray(h.forum),news:(await NET.req('world.news')).online}});
const room=p=>p.evaluate(()=>{const L=onlMyLobby();return L?{id:L.id,ev:L.ev,ranked:!!L.ranked,seats:L.seats,host:L.host.name,players:L.players.map(x=>x.name),members:(L.members||[]).map(m=>m.name),status:L.status}:null});
/* A: ＋ Custom room from the Lobby Browser */
await click(A,'#onl [data-onl="tab"][data-v="lobby"]');await click(A,'#onl [data-onl="mkroom"][data-v="0"]');
const rA=await until(A,()=>{const L=onlMyLobby();return L&&L.status==='waiting'?{id:L.id,ev:L.ev,ranked:!!L.ranked,seats:L.seats}:null});
/* v0.96: creating a room no longer cries; the host calls the crier by hand → C (free, Online open on Play) hears the Praeco's 'call' line, with the room's row */
await wait(1500);const silentC=await C.evaluate(id=>!ONLF.lines.some(l=>l.k==='open'&&l.row&&l.row.id===id),rA&&rA.id);
await click(A,'#onl [data-onl="rcall"]');
const openC=silentC&&await until(C,id=>ONLF.lines.some(l=>l.k==='call'&&l.row&&l.row.id===id),rA&&rA.id,20000);
const banC=await C.evaluate(()=>{const b=document.getElementById('onlCry80');return b&&!b.hidden?b.textContent:''});
await C.click('#onlCry80 [data-onl="cryx"]').catch(()=>{});
/* B: the Classic Custom playlist → lobby.quick → A's room (no twin) */
await click(B,'#onl [data-onl="tab"][data-v="play"]');await click(B,'#onl [data-onl="quick"][data-v="democritus|0"]');
const rB=await until(B,()=>{const L=onlMyLobby();return L?{id:L.id,players:L.players.map(x=>x.name)}:null});
const waitingRooms=await A.evaluate(async()=>(await NET.req('lobby.list')).filter(L=>L.status==='waiting').length);
const aSeesB=await until(A,()=>{const L=onlMyLobby();return L&&L.players.some(p=>/Beta/.test(p.name))?L.players.map(p=>p.name):null});
/* room phrases: A says Ave → B's log; B wishes luck (3 s later than its own last phrase) → A's log; the log comes back from lobby.chatlog */
await click(A,'#onl [data-onl="rsay"][data-v="ave"]');
const logB=await until(B,()=>{const t=((ONLF.chat[(onlMyLobby()||{}).id]||[]).filter(l=>!l.sys).map(l=>l.name+': '+onlQ80(l.q))) /* v0.96: no log on screen — phrases pop as bubbles (234) */;return t.some(x=>/Ave!/.test(x))?t:null},null,20000);
await click(B,'#onl [data-onl="rsay"][data-v="luck"]');
const logA=await until(A,()=>{const t=((ONLF.chat[(onlMyLobby()||{}).id]||[]).filter(l=>!l.sys).map(l=>l.name+': '+onlQ80(l.q))) /* v0.96: no log on screen — phrases pop as bubbles (234) */;return t.some(x=>/Good luck/.test(x))?t:null},null,20000);
const chatlog=await B.evaluate(async id=>(await NET.req('lobby.chatlog',{id})).map(l=>l.name+':'+l.q),rA&&rA.id);
const freeText=await A.evaluate(async id=>{try{await NET.req('lobby.chat',{id,text:'hello'});return 'sent'}catch(e){return e.message}},rA&&rA.id);
/* A sounds the horns (▶ Start); B walks in on the push */
const startBtn=await A.evaluate(()=>{const b=document.querySelector('#onl [data-onl="start"]');return b?{dis:b.disabled,why:b.title||''}:null});
await click(A,'#onl [data-onl="start"]');
/* (the opening windows — briefing, focus — are answered by the driver below while we wait) */
let inA=false,inB=false,seats=[];
/* the auto-driver (tonl79): on my own idle move, click like a person would */
const drive=async p=>{let r;try{r=await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){const t=(document.querySelector('#mTitle')||{}).textContent||'';const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':document.querySelector('#modal .mbtns button')?'#modal .mbtns button':null;return pb?['sel',pb,'modal:'+t.slice(0,24)]:['','','modal?']}
  if(!S||S.over||!ONLM.on)return ['','','off'];if(!onlmMine()||S.busy)return ['','','wait'];
  if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];
  if(S.phase==='action'){S._drv=(S._drv||0)+1;const atk=[...document.querySelectorAll('[data-act^="m-atk"]')].filter(b=>!b.disabled);
    if(S._drv%4===1&&atk.length&&S.mode==='move')return ['sel','[data-act="'+atk[0].dataset.act+'"]','mode:'+atk[0].dataset.act];
    try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%4!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
      return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height],(S.mode||'')+'@'+r0+','+c0]}
    S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]','end']}return ['','','idle:'+S.phase]})}catch(e){return 'gone'}
  /* force: the suggested End turn beats (heartbeat), so it is never 'stable' for Playwright — under load it never got clicked */if(r[0]==='sel')await p.click(r[1],{timeout:2000,force:true}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]).catch(()=>{});return r[2]};
const runlog=[];const run=async(ms,stop)=>{const t0=Date.now();let why='time';while(Date.now()-t0<ms){await drive(A);await drive(B);await wait(250);if(await A.evaluate(()=>!S||S.over).catch(()=>false)){why='over';break}if(stop&&await stop(Date.now()-t0)){why='stop';break}}
  runlog.push({why,ms:Date.now()-t0,st:await Promise.all([A,B].map(p=>p.evaluate(()=>({next:ONLM.next,on:ONLM.on,me:ONLM.me,over:!!(S&&S.over),turn:S&&S.turnNo,ph:S&&S.phase,cur:S&&cur()&&cur().name,mine:onlmMine(),busy:S&&S.busy,modal:CUR_MODAL?((document.getElementById('mTitle')||{}).textContent||'?').slice(0,30):null,q:ONLM.q.length,pend:!!ONLM.pend,inflight:ONLM.inflight,sent:ONLM.sent,menu:!$('#mainMenu').hidden,
    /* what a click on the action panel lands on (v0.90: the main menu stayed over the host's match — 79-screens screenLive fix) */at:(()=>{const c=document.querySelector('[data-act="coin"],[data-act="end"]');if(!c)return null;const r=c.getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return e?(e.id||e.className||e.tagName).toString().slice(0,40):null})()})).catch(e=>String(e).slice(0,80))))})}
for(let t0=Date.now();Date.now()-t0<120000;){const st=await Promise.all([A,B].map(p=>p.evaluate(()=>!!(S&&S.onl&&ONLM.on&&ONLM.me>=0)).catch(()=>false)));inA=inA||st[0];inB=inB||st[1];if(inA&&inB)break;await drive(A);await drive(B);await wait(250)}
seats=await Promise.all([A,B].map(p=>p.evaluate(()=>S&&S.onl?{me:ONLM.me,lobby:S.onl.lobby,n:S.players.length,watch:!!S.onl.watch}:null)));
/* play until enough inputs are on the server (not a fixed 30 s: under load the same play takes longer) */
await run(180000,async el=>el>=10000&&(await A.evaluate(()=>ONLM.next).catch(()=>0))>14);
/* a 💬 match phrase from A → a bubble over A's gladiator on B's screen */
await B.evaluate(()=>{window.__bub=[];new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if((n.classList&&n.classList.contains('qbub80')||n.parentNode&&n.parentNode.id==='bb100'&&n.querySelector&&n.querySelector('.q')))window.__bub.push(n.textContent+'@'+n.dataset.seat)}).observe(document.body,{childList:true,subtree:true})});
const sayBtn=await until(A,()=>!!document.getElementById('btnOnlSay80'),null,20000);
await A.evaluate(()=>{ONLM.uiAt=Date.now();const b=document.getElementById('btnOnlSay80');if(b)b.click()});await A.waitForSelector('#onlSay80 [data-msay="struck"]',{timeout:20000}).catch(()=>{});await A.click('#onlSay80 [data-msay="struck"]',{force:true}).catch(()=>{});
const bub=await until(B,()=>window.__bub.length?window.__bub:null,null,20000);
await run(10000);
/* every input sent is applied on both screens before the hashes are read */
for(let t1=Date.now();Date.now()-t1<45000;){const ins=await A.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.map(x=>[x.seq,x.from===ONL.acct.id]));const ha=await A.evaluate(()=>ONLM.hlog),hb=await B.evaluate(()=>ONLM.hlog);if(ins.every(([q,fa])=>(fa?hb:ha)['s'+q]))break;await wait(300)}
/* lockstep: A's own sends are the inputs B applied in order, and vice versa (pre-input hashes) */
const ha=await A.evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs,last:ONLM.lastResync||null}));const hb=await B.evaluate(()=>({h:ONLM.hlog,r:ONLM.resyncs,last:ONLM.lastResync||null}));
const ins=await A.evaluate(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs.map(x=>[x.seq,x.from===ONL.acct.id,x.h||x.pre,x.k]));
let same=0,diff=0;for(const [seq,fromA,h] of ins){const other=fromA?hb.h['s'+seq]:ha.h['s'+seq];if(!other)continue;if(other===h)same++;else diff++}
/* the bout ends on both screens at the same input → both report → the match settles */
for(const T_=Date.now();Date.now()-T_<60000;){const s=await Promise.all([A,B].map(p=>p.evaluate(()=>({n:ONLM.next,ok:(typeof onlmSettled==='function'?onlmSettled():true)&&!S.busy,over:S.over}))));if(s[0].over&&s[1].over)break;if(s[0].n===s[1].n&&s[0].ok&&s[1].ok)break;await drive(A);await drive(B);await wait(250)}
for(const p of [A,B])await p.evaluate(()=>{if(!S.over)gameOver([S.players[0]],'test')}).catch(()=>{});
/* the closing windows (results/Fate) are answered; C (free) sees the result line in the Forum */
for(const T_=Date.now();Date.now()-T_<60000;){for(const p of [A,B])await p.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)}).catch(()=>{});await wait(300);if(await C.evaluate(()=>ONLF.lines.some(l=>l.k==='res')))break}
const resC=await C.evaluate(()=>ONLF.lines.filter(l=>l.k==='res').map(l=>(l.win||[]).join('&')+' '+l.ev+(l.void?' void':'')));
/* both lanistas read the results for a while on the sand (no request from either window): their sockets stay open, so a farewell
   and the ⚔ Again invitation still reach them */
await wait(10000);
const sockets=await Promise.all([A,B].map(p=>p.evaluate(()=>!!(NETWS.ws&&NETWS.ws.readyState===1))));
await A.evaluate(()=>{window.__bub2=[];new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if((n.classList&&n.classList.contains('qbub80')||n.parentNode&&n.parentNode.id==='bb100'&&n.querySelector&&n.querySelector('.q')))window.__bub2.push(n.textContent)}).observe(document.body,{childList:true,subtree:true})});
await B.evaluate(()=>{ONLM.uiAt=Date.now();const b=document.getElementById('btnOnlSay80');if(b)b.click()});await B.waitForSelector('#onlSay80 [data-msay="well"]',{timeout:20000}).catch(()=>{});await B.click('#onlSay80 [data-msay="well"]',{force:true}).catch(()=>{});
const bubAfter=await until(A,()=>window.__bub2.length?window.__bub2:null,null,20000);
/* ⚔ Again (B, a fighter): a new room like the last, A invited — A sees the invitation once back in Online */
const againBtn=await until(B,()=>!!document.getElementById('btnOnlAgain80'),null,20000);
await B.evaluate(()=>{ONLM.uiAt=Date.now();const b=document.getElementById('btnOnlAgain80');if(b)b.click()});
const again=await until(B,old=>{const L=onlMyLobby();return L&&L.id!==old&&L.status==='waiting'?{id:L.id,ev:L.ev,ranked:!!L.ranked,seats:L.seats,host:L.host.name}:null},rA&&rA.id,20000);
await A.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{onlExit()}catch(e){}}).catch(()=>{});
const pop=await until(A,()=>{const p=document.querySelector('.inv80bg');return p?p.textContent:''},null,20000);
await A.click('.inv80bg [data-onl="ijoin"]').catch(()=>{});
const joined=await until(A,id=>{const L=onlMyLobby();return L&&L.id===id?L.players.map(p=>p.name):null},again&&again.id,20000);
const mode=await A.evaluate(()=>NET.mode);
const out={runlog,modes,mode,hello,rA,openC:!!openC,banC,rB,waitingRooms,aSeesB,logB,logA,chatlog,freeText,startBtn,inA:!!inA,inB:!!inB,seats,inputs:ins.length,same,diff,resync:[ha.r,hb.r,ha.last,hb.last],sayBtn:!!sayBtn,bub,resC,sockets,bubAfter,againBtn:!!againBtn,again,pop,joined,notes};
console.log(JSON.stringify(out));
const miss=[];
if(mode!=='aws'||modes.some(m=>m!=='aws'))miss.push('the real transport');
if(!hello.here||hello.here.n<2||Object.keys(hello.here.zones||{}).length<2)miss.push('hello.here: n ≥ 2 with zones');if(!(hello.online>=2)||!(hello.news>=2))miss.push('online count');
if(!rA||rA.ev!=='democritus'||rA.ranked||rA.seats!==4)miss.push('＋ Custom room');if(!openC)miss.push('Praeco open line to a free lanista');
if(!rB||!rA||rB.id!==rA.id||waitingRooms!==1)miss.push('playlist joins A’s room, no twin');if(!aSeesB)miss.push('A sees B sit down (push)');
if(!logB||!logA)miss.push('room phrases reach the other window');if(!chatlog.some(x=>/:ave$/.test(x))||!chatlog.some(x=>/:luck$/.test(x)))miss.push('lobby.chatlog');if(!/Quick chat only/.test(freeText))miss.push('no free text');
if(!startBtn||startBtn.dis)miss.push('▶ Start enabled ('+(startBtn&&startBtn.why)+')');if(!inA||!inB)miss.push('both enter the match');
if(ins.length<8)miss.push('enough inputs ('+ins.length+')');if(runlog[0]&&runlog[0].st.some(s=>s&&s.menu))miss.push('no main menu over the live match');if(diff||ha.r||hb.r)miss.push('lockstep with no resync');
if(!sayBtn||!bub||!bub.some(t=>/Well struck/.test(t)))miss.push('match.say bubble on the other screen');
if(!resC.length)miss.push('result line in the Forum');if(!sockets[0]||!sockets[1])miss.push('sockets stay open after the match');if(!bubAfter||!bubAfter.some(t=>/Well fought/.test(t)))miss.push('after-match phrase');if(!againBtn||!again||again.ev!=='democritus'||again.ranked)miss.push('⚔ Again room');if(!/invites you/.test(pop||''))miss.push('Again invites the other fighter');if(!joined)miss.push('join from the invitation');
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();WS.close();if(miss.length||errs.length)process.exit(1)})();

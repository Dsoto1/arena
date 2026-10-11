/* v1.0 ONLINE TURN FLOW + TIMERS (290-v100tt; mock, two windows). Room rules: Ranked = 60 s turns + 20 s decisions (locked), Custom = Off by default
   (no clocks in a played match: an unanswered window waits, no server timeout), the host's Turn timer select. Then a Custom room with a timer (the
   mock's test hook shortens it to 14 s / 5 s): a test hook opens a one-button NOTICE (answered at once on both screens, no input travels) and a
   two-button DECISION for Beta, who never answers — Alpha sees "Beta the Bold is choosing… Test pick" (not the options), Beta's window is docked beside
   the board (default marked, its own clock), the server orders the default ('dto') and both screens record the same value. Beta idles: the server's
   'timeout' → the CPU finishes Beta's turn on both screens (every input hashes the same). On Alpha's own turn: the ring, the bar and the BIG number
   in the last 10 s sit in the turn panel beside the board, the red glow only on the screen edges — nothing covers the board's centre — and the soft
   tick is scheduled in the last 5 s (counted on a patched AudioContext). Beta's second timeout → Alpha's vote prompt → Hand to CPU → the server's
   drop (a reclaim window for Beta), the seat plays as a CPU on both screens. ERRS must be []. SHOT=<dir> saves screenshots. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const SHOT=process.env.SHOT||'';
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_onlcd83','0');
  localStorage.setItem('flavius_onltest100',JSON.stringify({t:14,d:5}))});
const errs=[];const A=await ctx.newPage(),B=await ctx.newPage();for(const [n,p] of Object.entries({A,B}))p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));
await A.goto(URL0,{timeout:90000});await A.evaluate(()=>{for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over|rid)/.test(k))localStorage.removeItem(k)});
await B.goto(URL0,{timeout:90000});for(const p of [A,B])await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const HAND={last:null,on:true};for(const p of [A,B]){const ev=p.evaluate.bind(p);p.evaluate=async(...a)=>{const L=HAND.last;
  if(HAND.on&&L&&L!==p&&!L.isClosed()){for(const t0=Date.now();Date.now()-t0<15000;){const v=await L.__ev(()=>localStorage.getItem('flavius_onlmock')).catch(()=>null);
    if(v==null||await ev(v=>localStorage.getItem('flavius_onlmock')===v,v).catch(()=>true))break;await p.waitForTimeout(100)}}
  const r=await ev(...a);HAND.last=p;return r};p.__ev=ev}
const miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const wait=ms=>A.waitForTimeout(ms);
const until=async(p,fn,arg,ms)=>{for(const t0=Date.now();Date.now()-t0<(ms||20000);){if(await p.__ev(fn,arg).catch(()=>false))return true;await p.waitForTimeout(150)}return false};
const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls})},[name,cls]);
await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');
const bid=await B.evaluate(()=>ONL.acct.id);
const join=async id=>{for(let k=0;k<10;k++){await B.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}},id);
  for(const t0=Date.now();Date.now()-t0<4000;){if(await A.evaluate(([id,x])=>(mockLoad().lobbies[id].players||[]).some(p=>p.id===x),[id,bid]))return true;await wait(200)}}return false};

/* ── 1 · the room rules ── */
const R=await A.evaluate(async()=>{const r={};const RL=await NET.req('lobby.create',{ev:'democritus',loc:5,ranked:true,cry:false});const L=RL.lobby||RL;r.rk=[L.turnT,ONLC.ttOf100(L)];
  try{await NET.req('lobby.set',{id:L.id,turnT:30});r.rkSet='taken'}catch(e){r.rkSet=e.message}await NET.req('lobby.leave',{id:L.id});
  const CL=await NET.req('lobby.create',{ev:'democritus',loc:5,seats:4,cry:false});const C=CL.lobby||CL;r.cu=[C.turnT,ONLC.ttOf100(C)];
  try{await NET.req('lobby.set',{id:C.id,turnT:45});r.bad='taken'}catch(e){r.bad=e.message}r.id=C.id;return r});
ok(R.rk[0]===60&&R.rk[1].t===60&&R.rk[1].d===20,'Ranked: 60 s turns, 20 s decisions '+JSON.stringify(R.rk));ok(/always 60/.test(R.rkSet),'Ranked timer is locked: '+R.rkSet);
ok(R.cu[0]===0&&R.cu[1].t===0&&R.cu[1].d===0,'Custom: Off by default '+JSON.stringify(R.cu));ok(/Off, 30, 60, 90 or 120/.test(R.bad),'only the five choices: '+R.bad);

/* the test hook: Beta's first human Choice opens a notice and a decision (the same game point on both screens: the 'coin' act) */
const hook=()=>{window.__tp={};const base=takeChoice;takeChoice=async function(p,w){if(S&&S.onl&&p&&p.name==='Beta the Bold'&&!p.cpu&&!S.__tp100){S.__tp100=1;
    window.__tp.note=await modal('Test note','<p>The crowd hushes.</p>',[{label:'OK',value:'ok'}]);window.__tp.pick=await modal('Test pick','<p>Pick a side.</p>',[{label:'Left',value:'L'},{label:'Right',value:'R'}]);window.__tp.at=Date.now()}
  return base.apply(this,arguments)}};
for(const p of [A,B])await p.__ev(hook);
/* drivers: Alpha plays (answers its own windows, clicks the board, ends turns); Beta only takes Choice once (when told), then idles */
const drive=async(p,o)=>{o=o||{};const r=await p.__ev(o=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0)){if(o.idle&&ONLM.on&&ONLM.me>=0&&!(ONLM.info>0)&&onlmMine())return ['','','idlewin'];const bs=[...document.querySelectorAll('#modal .mbtns button')].filter(b=>!b.disabled&&b.offsetParent);
      const lit=document.querySelector('#modal [data-mi]:not(.dim):not([disabled])');if(lit&&!bs.length){lit.setAttribute('data-drv','1');return ['sel','#modal [data-drv="1"]','pick']}
      const pb=document.querySelector('#modal .mbtns .primary')?'#modal .mbtns .primary':bs.length?'#modal .mbtns button:not([disabled])':null;return pb?['sel',pb,'modal']:['','','modal?']}
    if(!S||S.over||!ONLM.on)return ['','','off'];if(!onlmMine()||S.busy)return ['','','wait'];
    if(o.idle){if(o.coin&&S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];return ['','','idle']}
    if(S.phase==='command'&&document.querySelector('[data-act="cmddone"]'))return ['sel','[data-act="cmddone"]','cmddone'];
    if(S.phase==='choice'&&document.querySelector('[data-act="coin"]'))return ['sel','[data-act="coin"]','coin'];
    if(S.phase==='action'){if(o.hold){const L=tt100TurnLeft();if(L&&L.left>o.hold)return ['','','hold']}S._drv=(S._drv||0)+1;try{computeHL()}catch(e){}const ks=[...HL.keys()];if(ks.length&&S._drv%3!==0){const k=ks[(S.turnNo*7+S._drv*3)%ks.length];const r0=Math.floor(k/N),c0=k%N;const cv=document.querySelector('canvas');const rc=cv.getBoundingClientRect();const pt=center(r0,c0);
        return ['xy',[rc.left+pt.x*rc.width/cv.width,rc.top+pt.y*rc.height/cv.height],'tile']}
      S._drv=0;if(document.querySelector('[data-act="end"]'))return ['sel','[data-act="end"]','end']}return ['','','idle']},o);
  if(r[0]==='sel')await p.click(r[1],{timeout:2000,force:true}).catch(()=>{});if(r[0]==='xy')await p.mouse.click(r[1][0],r[1][1]).catch(()=>{});return r[2]};
const inputs=()=>A.__ev(async()=>(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs);
const start=async id=>{const L2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},id);await B.evaluate(L=>onlEnter(L),L2);HAND.on=false;
  for(const t0=Date.now();Date.now()-t0<60000;){for(const p of [A,B])await p.__ev(()=>{if(CUR_MODAL&&ONLM.info>0){const x=document.querySelector('#modal .mbtns .primary')||document.querySelector('#modal .mbtns button');if(x)x.click()}}).catch(()=>{});
    if(await A.__ev(()=>!!(ONLM.on&&S&&S.phase!=='setup'))&&await B.__ev(()=>!!(ONLM.on&&S&&S.phase!=='setup')))break;await wait(250)}for(const p of [A,B])await p.__ev(()=>setSpeedUI('fast'))};
const bTurn=()=>B.__ev(()=>!!(ONLM.on&&S&&!S.over&&cur()&&cur().name==='Beta the Bold'&&!cur().cpu&&['choice','action'].includes(S.phase)&&!S.busy));

/* ── 2 · Custom, timer Off: Beta's decision waits, no server clock ── */
ok(await join(R.id),'Beta joins the Off room');await start(R.id);
let t0=Date.now(),coin=false;while(Date.now()-t0<120000){await drive(A);const bt=await bTurn();if(bt&&!coin){await drive(B,{idle:1,coin:1});coin=await B.__ev(()=>S.phase!=='choice'||!!CUR_MODAL)}else await drive(B,{idle:1});
  if(coin&&await A.__ev(()=>!!(ONLM.pend&&ONLM.pend.seat===1)))break;await wait(150)}
await wait(9000);
const off=await A.__ev(async()=>{const ins=(await NET.req('match.get',{id:S.onl.lobby,from:0})).inputs;return {pend:!!(ONLM.pend&&ONLM.pend.seat===1),t:ONLM.pend&&ONLM.pend.t,on:tt100On(),srv:ins.filter(x=>x.from==='server').map(x=>x.k),
  clk:(document.querySelector('#tt100 .t100')||{}).textContent||'',panel:!!document.querySelector('#tt100:not([hidden])'),notes:ins.filter(x=>x.k==='modal'&&/Test note/.test(x.t||'')).length,note:window.__tp.note}});
const offB=await B.__ev(()=>({dock:!!document.querySelector('#modal.dock100:not([hidden]) #dk100'),clk:!!document.querySelector('#dk100 .clk100'),note:window.__tp.note,pick:!!(CUR_MODAL&&/Test pick/.test(document.getElementById('mTitle').textContent))}));
console.log('OFF',JSON.stringify(off),JSON.stringify(offB));
ok(off.pend&&off.t==='Test pick','Off: Beta\'s decision still waits after 9 s');ok(!off.on&&!off.srv.some(k=>k==='dto'||k==='timeout')&&!off.clk,'Off: no clocks, no server timeout '+JSON.stringify(off.srv));
ok(off.panel,'the turn panel shows online even with the timer off');ok(off.notes===0&&off.note==='ok'&&offB.note==='ok','a one-button notice answers itself on both screens, no input');
ok(offB.pick&&offB.dock&&!offB.clk,'Off: Beta\'s window docked, without a clock');
for(const [p,id] of [[A,R.id],[B,R.id]])await p.__ev(async id=>{try{await NET.req('match.abandon',{id})}catch(e){}ONL.leftMatch=ONL.leftMatch||{};ONL.leftMatch[id]=1;try{if(CUR_MODAL)CUR_MODAL.done(null)}catch(e){}},id);await wait(800);for(const p of [A,B])await p.__ev(()=>{ONL84.rcl=null;onl84Bar()});
await wait(1500);for(const p of [A,B])await p.__ev(()=>{try{if(S&&S.onl){S.over=true;ONLM.on=false}if(CUR_MODAL)CUR_MODAL.done(null)}catch(e){}});await wait(500);

/* ── 3 · Custom with a timer (14 s turns, 5 s decisions in the test) ── */
HAND.on=true;for(const p of [A,B])await p.__ev(hook);
const L3=await A.evaluate(async()=>{const r=await NET.req('lobby.create',{ev:'democritus',loc:5,seats:4,cry:false});const L=r.lobby||r;const X=await NET.req('lobby.set',{id:L.id,turnT:30});return X.lobby||X});
ok(L3.turnT===30,'the host sets the Turn timer to 30 s: '+L3.turnT);
const roomUI=await A.evaluate(L=>{const d=document.createElement('div');d.innerHTML=onlRoomHTML80(L,false);const s=d.querySelector('[data-onlrs="turnT"]');return s?[...s.options].map(o=>o.value).join(',')+'|'+s.value:'none'},L3);
ok(roomUI==='0,30,60,90,120|30','the room\'s Turn timer select: '+roomUI);
ok(await join(L3.id),'Beta joins the timed room');await start(L3.id);
/* audio: count oscillators the tick creates */
await A.__ev(()=>{SETTINGS.audio={...audSet(),on:true,sfx:true,music:false};audInit();const c=AUD.ctx;window.__osc=0;if(c){const o=c.createOscillator.bind(c);c.createOscillator=function(){window.__osc++;return o()}}});
/* Alpha's first own turn: hold until the last 4.5 s, then check the panel / glow / board, then end the turn */
let late=null;coin=false;t0=Date.now();let dec=null,shotDock=false;
/* Alpha's own first turn: he idles — the server times HIM out and the CPU finishes his turn (the owner's side of a timeout) */
let aOut=null;for(const t1=Date.now();Date.now()-t1<90000;){const st=await A.__ev(()=>({mine:!!(ONLM.on&&S&&!S.over&&onlmActor()===ONLM.me),n:TT100C.applied[0]|0}));
  if(st.n>=1){aOut=await A.__ev(()=>({n:TT100C.applied[0],line:[...document.querySelectorAll('#log li')].some(l=>/Alpha the Bold ran out of time/.test(l.textContent))}));break}
  await drive(A,st.mine?{idle:1}:{});await drive(B,{idle:1});await wait(150)}
ok(aOut&&aOut.line,'Alpha idles: the server times him out, the CPU finishes his turn '+JSON.stringify(aOut));
ok(await until(A,()=>!S.players[0].cpu&&!S.tt100x,null,60000),'a human again at his next turn');
t0=Date.now();
while(Date.now()-t0<180000){const aT=await A.__ev(()=>!!(ONLM.on&&S&&!S.over&&onlmActor()===ONLM.me&&S.phase==='action'&&!S.busy&&!CUR_MODAL));
  if(aT&&!late){const L=await A.__ev(()=>{const x=tt100TurnLeft();return x&&x.left});if(L!=null&&L>4500){await wait(200);continue}
    if(L!=null){late=await A.__ev(()=>{const cv=document.getElementById('cv'),rc=cv.getBoundingClientRect();const el=document.elementFromPoint(rc.left+rc.width/2,rc.top+rc.height/2);const P=document.getElementById('tt100').getBoundingClientRect();
      const over=!(P.right<=rc.left||P.left>=rc.right||P.bottom<=rc.top||P.top>=rc.bottom);const ed=[...document.querySelectorAll('#tt100edge i')].map(e=>e.getBoundingClientRect());
      return {left:tt100TurnLeft().left,lateCls:document.getElementById('tt100').classList.contains('late'),num:document.querySelector('#tt100 .num').textContent,numFs:parseFloat(getComputedStyle(document.querySelector('#tt100 .num')).fontSize),
        ring:+document.querySelector('#tt100 .tp100 .rg100 .fg').getAttribute('stroke-dashoffset'),bar:document.querySelector('#tt100 .bar100 i').style.width,center:el===cv,panelOver:over,
        edge:!document.getElementById('tt100edge').hidden&&ed.length===4&&ed.every(r=>Math.min(r.width,r.height)<=8),ticks:TT100C.ticks,osc:window.__osc}});
      if(SHOT){await A.screenshot({path:path.join(SHOT,'turn100_late_1440.png')});}}}
  if(late&&!late.done){await wait(1200);const t2=await A.__ev(()=>({ticks:TT100C.ticks,osc:window.__osc}));late.ticks2=t2.ticks;late.osc2=t2.osc;late.done=1;await A.click('[data-act="end"]',{force:true,timeout:2000}).catch(()=>{})}
  await drive(A,late?{}:{hold:4500});
  const bt=await bTurn();if(bt&&!coin){await drive(B,{idle:1,coin:1});coin=await B.__ev(()=>S.phase!=='choice'||!!CUR_MODAL)}else await drive(B,{idle:1});
  if(coin&&!dec){const s=await A.__ev(()=>{const c=document.querySelector('#tt100 .ch100');return c?c.textContent:''});const d=await B.__ev(()=>{const m=document.getElementById('modal');const h=document.getElementById('dk100');const cv=document.getElementById('cv'),rc=cv.getBoundingClientRect();
      const el=document.elementFromPoint(rc.left+rc.width/2,rc.top+rc.height/2);return {dock:!!(m&&!m.hidden&&m.classList.contains('dock100')&&h),clk:!!(h&&h.querySelector('.clk100')),def:(document.querySelector('#modal .def100')||{}).textContent||'',center:el===cv,
        title:document.getElementById('mTitle').textContent}});
    if(/Test pick/.test(d.title)&&s){dec={choosing:s,...d};if(SHOT&&!shotDock){shotDock=true;await B.screenshot({path:path.join(SHOT,'turn100_dock_1440.png')});await B.setViewportSize({width:390,height:844});await wait(700);await B.screenshot({path:path.join(SHOT,'turn100_dock_390.png')});await B.setViewportSize({width:1440,height:900});await A.screenshot({path:path.join(SHOT,'turn100_choosing_1440.png')})}}}
  const n=await A.__ev(()=>TT100C.applied[1]|0);if(n>=2)break;await wait(150)}
console.log('LATE',JSON.stringify(late));console.log('DEC',JSON.stringify(dec));
ok(late&&late.lateCls&&+late.num>0&&+late.num<=5&&late.numFs>=20,'the big countdown in the turn panel in the last 10 s');ok(late&&late.ring>0&&parseFloat(late.bar)<40,'the ring empties, the bar runs down');
ok(late&&late.center&&!late.panelOver,'nothing covers the board: centre hit = the canvas, the panel beside it');ok(late&&late.edge,'the red glow = four thin strips at the screen edges');
ok(late&&late.ticks2>late.ticks&&late.osc2>late.osc,'a soft tick each second of the last 5 s '+JSON.stringify(late&&[late.ticks,late.ticks2,late.osc,late.osc2]));
ok(dec&&/Beta the Bold is choosing/.test(dec.choosing)&&/Test pick/.test(dec.choosing)&&!/Left|Right/.test(dec.choosing),'Alpha sees who is choosing what, never the options: '+(dec&&dec.choosing));
ok(dec&&dec.dock&&dec.clk&&/Right/.test(dec.def)&&dec.center,'Beta\'s window docked beside the board with its clock, the default marked: '+JSON.stringify(dec));
/* the vote: Alpha hands Beta's seat to a CPU */
const vt=await until(A,()=>!!document.querySelector('#tt100 [data-tt100v="yes"]'),null,30000);ok(vt,'Alpha is asked after Beta\'s second timeout');
if(SHOT&&vt)await A.screenshot({path:path.join(SHOT,'turn100_vote_1440.png')});
if(vt)for(let k=0;k<6;k++){await A.click('#tt100 [data-tt100v="yes"]',{force:true,timeout:2000}).catch(()=>{});await wait(1200);const v=await A.__ev(()=>TT100C.vote?TT100C.vote.res||'':'gone');if(v)break}
for(const t1=Date.now();Date.now()-t1<60000;){await drive(A);await drive(B,{idle:1});if(await A.__ev(()=>!!(ONLM.owners[1]==null&&S.players[1].cpu)))break;await wait(200)}
for(let k=0;k<20;k++){await drive(A);await drive(B,{idle:1});await wait(200)}
/* SHOT: Alpha's late turn at phone width (after the checks — the resize takes time) */
if(SHOT){await A.setViewportSize({width:390,height:844});for(const t1=Date.now();Date.now()-t1<90000;){const L=await A.__ev(()=>{const x=onlmOn()&&onlmActor()===ONLM.me&&S.phase==='action'&&tt100TurnLeft();return x?x.left:null});
    if(L!=null&&L<8000){await A.screenshot({path:path.join(SHOT,'turn100_late_390.png')});break}await drive(A,{hold:8000});await drive(B,{idle:1});await wait(150)}await A.setViewportSize({width:1440,height:900});await wait(500)}
/* both screens applied every input */
for(const t1=Date.now();Date.now()-t1<40000;){const ins=await inputs().catch(()=>[]);const top=ins.length?ins[ins.length-1].seq:0;const ns=await Promise.all([A,B].map(p=>p.__ev(()=>ONLM.next).catch(()=>0)));if(ns.every(x=>x>top))break;await drive(A);await wait(300)}
const ins=await inputs();const st=p=>p.__ev(()=>({h:ONLM.hlog,r:ONLM.resyncs,acct:ONL.acct.id,log:TT100C.log.filter(x=>x.d!=null),applied:TT100C.applied,owners:ONLM.owners.map(Boolean),cpu1:S.players[1].cpu,me:ONLM.me,
  rcl:typeof ONL84!=='undefined'&&ONL84.rcl?1:0,pick:window.__tp.pick,note:window.__tp.note,txt:[...document.querySelectorAll('#log li')].map(l=>l.textContent).filter(t=>/ran out of time|hand the seat/.test(t)).length}));
const X={A:await st(A),B:await st(B)};
let same=0;const diff=[];for(const x of ins){const h=x.h||x.pre;if(!h)continue;for(const n of ['A','B']){if(X[n].acct===x.from)continue;const o=X[n].h['s'+x.seq];if(!o)continue;if(o===h)same++;else diff.push([n,x.seq,x.k,x.a||x.t||''])}}
const srvK=ins.filter(x=>x.from==='server').map(x=>x.k+(x.k==='timeout'?'#'+x.seat:'')+(x.tt?'tt':''));
const dA=Object.fromEntries(X.A.log.map(x=>[x.d,x.v])),dB=Object.fromEntries(X.B.log.map(x=>[x.d,x.v]));const dd=Object.keys(dA).filter(k=>k in dB&&JSON.stringify(dA[k])!==JSON.stringify(dB[k]));
const dto=ins.find(x=>x.k==='dto');
console.log(JSON.stringify({inputs:ins.length,srvK,same,diff:diff.slice(0,6),resync:[X.A.r,X.B.r],applied:[X.A.applied,X.B.applied],pick:[X.A.pick,X.B.pick],dd,owners:[X.A.owners,X.B.owners],cpu1:[X.A.cpu1,X.B.cpu1],meB:X.B.me,rcl:X.B.rcl,txt:[X.A.txt,X.B.txt]}));
ok(dto&&X.A.pick==='R'&&X.B.pick==='R'&&dA[dto.d]==='R'&&dB[dto.d]==='R','the decision clock: the server\'s dto → the default (Right) on both screens');ok(!dd.length,'every decision has the same value on both screens '+dd);
ok(!ins.some(x=>x.k==='modal'&&/Test note/.test(x.t||'')),'the notice never travelled as an input');
ok(srvK.filter(k=>k==='timeout#1').length>=2,'two server-ordered timeouts for Beta: '+srvK);ok((X.A.applied[1]|0)>=2&&(X.B.applied[1]|0)>=2,'both screens applied them');
ok(X.A.txt>=2&&X.B.txt>=2,'the CPU-finishes line on both screens');ok(same>=5&&!diff.length,'every input hashes the same on both windows ('+same+') '+JSON.stringify(diff.slice(0,4)));ok(!X.A.r&&!X.B.r,'no resync');
ok(srvK.includes('droptt'),'the vote → a server drop');ok(!X.A.owners[1]&&!X.B.owners[1]&&X.A.cpu1&&X.B.cpu1,'Beta\'s seat is a CPU on both screens');ok(X.B.me===-1&&(X.B.rcl||srvK.includes('cpugo')),'Beta watches; his reclaim window opened (the CPU went on at his next turn: cpugo)');
console.log('MISS',miss);console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();if(miss.length||errs.length)process.exit(1)})();

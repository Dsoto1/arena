/* =====================================================================
   121-ONL80FIX · v0.80 review fixes · ⚔ Back to your match / 🚪 Abandon on the main menu · Today in the arena
   =====================================================================
   LOCKSTEP
   • A snapshot is loaded only when this page asked for it: every match.snapreq it sends is remembered (ONLM.asked: account →
     when, which match); a match.snap from anyone else, or 45 s later, is dropped (ONL80F.snapDrop). The majority no longer
     pushes an unasked snapshot to an odd lanista: the server tells the odd one (match.youodd) and it asks the lowest majority seat.
   • An input that cannot apply here (another seat's move while the game waits on a different seat, a window answer with no
     window open) no longer freezes the queue: after 2.5 s settled, the same pre-hash → skipped as void on every honest client;
     a different one → the resync vote.
   • A window left open by an odd lanista's skipped answer is closed with its default on every majority client.
   • Per-match marks (abandoned seats, hashes, asks) reset with each new match; hashes are answered only for seqs already reached.
   • 💬 phrases never open the 300 ms bar-window gap; engine windows (a defender's, replays) are always recorded.
   AFTER THE MATCH
   • The socket stays open 10 minutes after an online match (farewells, ⚔ Again invites), then closes when idle.
   • ⚔ Again waits for this lanista's own report. A fresh start is judged by when this page saw the horns (or the server's
     clock from hello), never by the local clock alone.
   • Leaving the finished online board for an offline mode ends the offline-record guard at once.
   ONLINE WINDOW
   • Mutes come from the account (hello.me.mutes) on every device. ✓ Ready marks your own seat at once. A room the server closes
     says so. ⚔ Take a seat, banners and invites only for rooms you can enter (not removed, your rank, no ticket held).
   • A push never redraws over an open dropdown (redrawn when it closes). Phones: the call banner wraps as a card; the large map
     has gutters and glows scaled to it; glows use the clamped zone positions.
   MOCK (the in-page server): reads never rewrite the shared world (presence in its own key); youodd, ⚔ Again, today, the live
     match and the busy rule as on the server.
   REJOIN / ABANDON (Virgilante)
   • While a gladiator of this lanista is still in a live online match (a CPU may hold the seat), the main menu shows
     "⚔ Back to your match" and "🚪 Abandon" (localStorage flavius_onlmatch80, confirmed by hello.live); the Online live-room card
     has 🚪 Abandon too.
   • The abandon popup (arena bar, Online card, main menu) shows the gladiator at stake: face + token, record, ratings, the gear
     brought, and what is lost (Ranked: the gladiator with their coin and gear — Damnatio).
   TODAY IN THE ARENA (Virgilante): two boxes on the Online landing — 🏆 victors of the day (most CF in one match) and 🪦 fallen &
     humbled (Ranked deaths, best rank first, Damnatio included; upsets) with face + token, the event and the outcome.
   ===================================================================== */
const ONL80F={snapDrop:0,badSkips:0,stuck:null,later:0,today:null,skew:0,liveSeen:{},offAt:0,exitAt:0,repP:null,repFor:null,oddAt:0,validAt:0};
ONLM.asked={};

/* ---------------- requests: asks, reports, hello, the horns, ✓ Ready ---------------- */
{const base=NET.req;NET.req=function(t,d){
  if(t==='match.snapreq'&&d&&d.to){ONLM.asked=ONLM.asked||{};ONLM.asked[d.to]={at:Date.now(),lobby:d.id}}
  const p=base.apply(this,arguments);const then=f=>{if(p&&typeof p.then==='function')p.then(r=>{try{f(r)}catch(e){console.error(e)}}).catch(()=>{})};
  if(t==='match.result'){ONL80F.repP=p;ONL80F.repFor=d&&d.id}
  if(t==='hello'||t==='world.news')then(r=>onl80fHello(r,t==='hello'&&d&&d.all));
  if(t==='lobby.start')then(r=>{const id=r&&(r.id||(r.lobby&&r.lobby.id));if(id)ONL80F.liveSeen[id]=Date.now()});
  if(t==='lobby.say')then(r=>{if(r&&r.lobby){onlUpsert80(r.lobby);onlUp80()}});
  return p}}

/* ---------------- pushes: snapshots only when asked; the room closed ---------------- */
function onl80fSnapOK(d){if(!d||!ONL.acct||d.to!==ONL.acct.id)return true;
  const A=(ONLM.asked||{})[d.from];if(A&&A.lobby===d.id&&Date.now()-A.at<45000){ONLM.asked={};return true}ONL80F.snapDrop++;return false}
{const base=NET.emit;NET.emit=function(t,d){
  if(t==='match.snap'&&!onl80fSnapOK(d))return;
  if(t==='lobby.update'&&d&&d.id){try{const o=(ONL.lobbies||[]).find(x=>x.id===d.id);
    if(d.lobby&&d.lobby.status==='live'&&o&&o.status==='waiting')ONL80F.liveSeen[d.id]=Date.now();
    if(d.lobby&&d.closed&&!['empty','merged'].includes(d.closed)&&o&&o.status==='waiting'&&(o.members||[]).some(m=>m.id===onlMe80()))onlToast80(_T('🚪 The room closed.'))}catch(e){}}
  return base.apply(this,arguments)}}
/* the server says the others hold a different arena: ask the lowest-seat voter for theirs */
NET.on('match.youodd',d=>{if(!onlmOn()||!d||d.id!==S.onl.lobby)return;if(d.to&&ONL.acct&&d.to!==ONL.acct.id)return;if(ONLM.me<0||(d.seat|0)!==ONLM.me)return;
  if(Date.now()-ONL80F.oddAt<20000)return;ONL80F.oddAt=Date.now();
  const voters=(d.voters||[]).map(a=>[a,(ONLM.owners||[]).indexOf(a)]).filter(x=>x[1]>=0).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);if(!voters.length)return;
  ONLM.resyncs++;ONLM.resyncing=true;ONLM.lastResync={odd:1,seq:ONLM.next};onlToast80(_T('🔄 The others hold a different arena — taking theirs…'));
  const id=d.id;let k=0;const ask=()=>{if(!ONLM.resyncing||!S||!S.onl||S.onl.lobby!==id)return;if(k>=voters.length){ONLM.resyncing=false;onlmPump();return}
    NET.req('match.snapreq',{id,to:voters[k++],seq:ONLM.next}).catch(()=>{});setTimeout(ask,8000)};ask()});
/* the majority never sends an unasked arena any more */
onl80SendOdd=function(){};

/* ---------------- an odd window answer: the window closes with its default on every majority client ---------------- */
{const base=onl80Decide;onl80Decide=function(V){const was=!!(V&&V.done);const r=base.apply(this,arguments);
  try{if(!was&&V&&V.maj&&V.maj===V.mine&&V.maj!==V.theirs&&ONLM.pend&&ONLM.pend.seat===V.inp.seat){
    ONLM.replay++;try{const P=ONLM.pend;ONLM.pend=null;onlmWaitShow();P.res(P.def)}finally{ONLM.replay--}setTimeout(onlmPump,30)}}catch(e){console.error(e)}return r}}

/* ---------------- per-match marks; hashes only for seqs reached ---------------- */
{const base=onl80Match;onl80Match=function(){const id=S&&S.onl&&S.onl.lobby;const fresh=!!id&&ONL80R.mid!==id;const r=base.apply(this,arguments);
  if(fresh){ONLM.left=null;ONLM.leftDone=null;ONLM.hlog={};ONLM.asked={};ONL80F.stuck=null;ONL80F.oddAt=0}return r}}
onl80Answer=function(){if(!ONL80R.hq.length||!S||!S.onl)return;const keep=[];for(const q of ONL80R.hq){const h=ONLM.hlog['s'+q.seq];
    if(h&&(q.seq<ONLM.next||ONLM.own.has(q.seq))){NET.req('match.hasha',{id:S.onl.lobby,seq:q.seq,to:q.to,h}).catch(()=>{});continue}if(Date.now()-q.at<60000)keep.push(q)}ONL80R.hq=keep};

/* ---------------- windows: 💬 never opens the bar gap; engine windows are always recorded ---------------- */
document.addEventListener('click',e=>{const t=e.target;if(t&&t.closest&&t.closest('#btnOnlSay80,#onlSay80,#btnOnlAgain80'))ONLM.uiAt=0},true);
{const base=modal;modal=function(){try{if(onlmOn()&&(ONLM.replay>0||(typeof RESPONDER!=='undefined'&&RESPONDER)))ONLM.uiAt=0}catch(e){}return base.apply(this,arguments)}}

/* ---------------- an input that can never apply here ---------------- */
/* a window answer only answers that seat's window */
{const base=onlmReady;onlmReady=function(inp){if(inp&&inp.k==='modal'&&ONLM.pend&&ONLM.pend.seat!==inp.seat&&!onl80IsOdd(inp))return false;return base.apply(this,arguments)}}
function onl80fImpossible(inp){if(!inp||!S||S.over||ONLM.resyncing||!['tile','act','modal'].includes(inp.k))return false;
  if(ONLM.pend)return inp.k!=='modal'||ONLM.pend.seat!==inp.seat;
  if(S.busy||CUR_MODAL||ONLM.inflight||!['choice','action','command'].includes(S.phase))return false;const a=onlmActor();if(a<0)return false;
  return inp.k==='modal'||a!==inp.seat}
function onl80fStuckCheck(){if(!onlmOn()||ONLM.resyncing){ONL80F.stuck=null;return}const h=ONLM.q[0];
  if(!h||h.seq!==ONLM.next||onlmReady(h)||!onl80fImpossible(h)){ONL80F.stuck=null;return}
  const st=ONL80F.stuck;if(!st||st.seq!==h.seq){ONL80F.stuck={seq:h.seq,at:Date.now()};return}if(Date.now()-st.at<2500)return;ONL80F.stuck=null;
  ONLM.q.shift();ONLM.next=h.seq+1;const mine=h.k==='modal'?onlmPendHash():onlHash();const theirs=h.k==='modal'?h.pre:h.h;
  if(theirs&&mine!==theirs){onlmResync(h);return}
  ONLM.hlog['s'+h.seq]=mine;ONL80F.badSkips++;try{log(_T`⚖ A move from <b>${esc(onlmName(h.seat))}</b> did not fit the arena — skipped.`,'thought')}catch(e){}setTimeout(onlmPump,30)}
{const base=onlmPump;onlmPump=function(){const r=base.apply(this,arguments);try{onl80fStuckCheck()}catch(e){console.error(e)}return r}}

/* ---------------- after the match: the socket stays 10 minutes; ⚔ Again after the report ---------------- */
function onl80fAfterMatch(){return !!(S&&S.onl&&S.over&&!S.onl.watch&&ONL80R.overAt&&Date.now()-ONL80R.overAt<600000&&!(ONL80F.offAt>ONL80R.overAt)&&!(ONL80F.exitAt>ONL80R.overAt))}
{const base=netIdleClose;netIdleClose=function(){if(onl80fAfterMatch())return;return base.apply(this,arguments)}}
{const base=gameOver;gameOver=async function(winners){const on=!!(S&&S.onl);const id=on&&S.onl.lobby;if(on){ONL80F.overFor=id;ONL80F.winners=winners}
  if(on&&!S.onl.watch)setTimeout(()=>{try{netIdleClose()}catch(e){}},601500);
  try{return await base.apply(this,arguments)}finally{if(on)onlLive80Clear(id)}}}
/* leaving the board before the results window let the report go: report first (the gladiator would stay 'fighting' on the server) */
{const base=onlExit;onlExit=function(){ONL80F.exitAt=Date.now();
  try{if(S&&S.onl&&S.over&&ONL.live&&!ONL.live.reported&&ONL.live.id===S.onl.lobby&&ONL80F.overFor===S.onl.lobby&&!(ONL.leftMatch||{})[S.onl.lobby])onlReport(ONL80F.winners).catch(()=>{})}catch(e){}
  return base.apply(this,arguments)}}
{const base=onlAgain80;onlAgain80=async function(){const id=S&&S.onl&&S.onl.lobby;
  for(let i=0;i<25&&id&&ONL80F.repFor!==id;i++)await new Promise(r=>setTimeout(r,200));
  if(ONL80F.repP&&ONL80F.repFor===id){try{await ONL80F.repP}catch(e){}}return base.apply(this,arguments)}}
/* a fresh start by this page's own sighting of the horns, else by the server's clock */
{const base=onlEnter;onlEnter=function(L){if(L&&L.status==='live'&&L.started){const seen=ONL80F.liveSeen[L.id];
    const t=seen&&Date.now()-seen<20000?Date.now():L.started-(ONL80F.skew||0);if(t!==L.started)L={...L,started:t}}
  const r=base.apply(this,[L].concat([].slice.call(arguments,1)));try{onlLive80Enter(L)}catch(e){}return r}}
/* leaving the finished online board for an offline mode ends the record guard at once (the results window itself stays guarded) */
onl80Rec=function(){if(!onl80Live())return false;if(!S.over)return true;const t=Date.now()-ONL80R.overAt;if(ONL80R.inOver)return t<600000;if(ONL80F.offAt>ONL80R.overAt)return false;return t<20000};
for(const nm of ['openManager','openStudio','openSetup','openHall','managerMenu','playNowMenu']){try{const base=eval(nm);if(typeof base!=='function')continue;
  const w=function(){try{if(S&&S.onl&&S.over){ONL80F.offAt=Date.now();setTimeout(()=>{try{netIdleClose()}catch(e){}},600)}}catch(e){}return base.apply(this,arguments)};eval(`${nm}=w`)}catch(e){}}

/* ---------------- hello: mutes, the server clock, today, the live match ---------------- */
function onl80fHello(r,all){if(!r)return;if(r.now)ONL80F.skew=r.now-Date.now();if(r.today){ONL80F.today=r.today;onlToday80Patch()}
  if(r.me&&Array.isArray(r.me.mutes)){ONLF.muted=new Set(r.me.mutes);onlMuteSave80()}
  if(all&&r.me&&Array.isArray(r.chars)){const x=onlLive80Get();
    if(r.live&&r.live.id){const L=(r.lobbies||[]).find(l=>l.id===r.live.id);const base=x&&x.id===r.live.id?x:onlLive80From(L||r.live,L?L.players.findIndex(p=>p.id===r.me.id):-1,r.chars);
      onlLive80Put({...base,acct:r.me.id,ev:r.live.ev||base.ev,loc:r.live.loc!=null?r.live.loc:base.loc,ranked:!!r.live.ranked,dropped:!!r.live.dropped,at:Date.now()})}
    else if(x&&(!x.acct||x.acct===r.me.id))onlLive80Clear(x.id)}}
NET.on('match.settled',d=>{if(d&&d.id)onlLive80Clear(d.id)});

/* ---------------- the Online window ---------------- */
onlCanTake80=function(id,at){const R=onlMyLobby();if(R&&R.status==='waiting')return false;if((ONL.kicked80||{})[id]>Date.now())return false;
  const L=(ONL.lobbies||[]).find(x=>x.id===id);if(!L)return Date.now()-(at||0)<30000;if(L.status!=='waiting'||L.players.length>=L.seats)return false;
  const ch=ONL.char;try{if(ONLC.canJoin(L,{id:onlMe80(),rank:ch?ONLC.rankFor(ch).k:'tiro',char:ch&&ch.id},Date.now()))return false}catch(e){}return true};
/* a push never redraws over an open dropdown: the room log and the Forum are patched, the rest when it closes */
{const base=onlRedraw;onlRedraw=function(){const f=document.activeElement;if(f&&f.tagName==='SELECT'&&f.closest&&f.closest('#onl')){ONL80F.later=1;try{onlPatchLog80();onlPatchFeed80()}catch(e){}return}
  return base.apply(this,arguments)}}
document.addEventListener('focusout',e=>{const t=e.target;if(ONL80F.later&&t&&t.tagName==='SELECT'&&t.closest&&t.closest('#onl')){ONL80F.later=0;setTimeout(()=>{try{onlRedraw()}catch(err){}},0)}},true);
document.addEventListener('change',e=>{const t=e.target;if(t&&t.tagName==='SELECT'&&t.closest&&t.closest('#onl'))setTimeout(()=>{try{t.blur()}catch(err){}},0)},true);
/* the map: glows at the clamped zone positions; the large view scales them to its width */
onlDots80=function(k){const z=(ONLF.here||{}).zones||{};return Object.entries(z).map(([tz,c])=>{const xy=typeof onlTzXY==='function'?onlTzXY(tz):null;if(!xy)return '';
  const j=ONLF.jit[tz]||(ONLF.jit[tz]=[Math.random()-.5,Math.random()-.5,Math.random()*4]);const x=xy[0]*100+j[0]*.6,y=Math.max(1.5,Math.min(98.5,xy[1]*100+j[1]*1.2));const s=(10+Math.sqrt(c|0)*9)*k;
  return `<i class="omap-dot" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;animation-delay:${j[2].toFixed(1)}s"></i>`}).join('')};
onlMapBig80=function(){for(const o of document.querySelectorAll('.omapbig'))o.remove();const o=document.createElement('div');o.className='omapbig onl80pop';
  const k=Math.max(.6,Math.min(1.8,Math.min(innerWidth*.92,1240)/1240*1.8));
  o.innerHTML=`<button type="button" class="x">${_T`✕ Close`}</button><div class="cap">${_T`Orbis Terrarum<small>${onlCap80()}</small>`}</div><div class="frame"><div class="omap-in"></div><div class="omap-dots" aria-hidden="true">${onlDots80(k)}</div></div>`;
  o.addEventListener('click',e=>{e.stopPropagation();o.remove()});document.body.appendChild(o)};

/* ---------------- MOCK: like the server ---------------- */
const MOCK_SEEN80='flavius_onlmock_seen80';
function mockSeen80(me){let s={};try{s=JSON.parse(localStorage.getItem(MOCK_SEEN80)||'{}')||{}}catch(e){}if(me){s[me]=mockNow();try{localStorage.setItem(MOCK_SEEN80,JSON.stringify(s))}catch(e){}}return s}
/* a request that changed nothing never writes the shared world back (another window may have written since it was read) */
mockReq=async function(t,d){const R=MOCK_ROUTES[t];if(!R)throw new Error(_T('Unknown request: ')+t);await new Promise(r=>setTimeout(r,30+Math.random()*60));d=d||{};
  return mockLocked(()=>{const w=mockLoad();const me=mockMe();const sn=mockSeen80(me);for(const a of Object.values(w.accounts||{}))if(sn[a.id]&&!(a.seen>=sn[a.id]))a.seen=sn[a.id];
  const s0=JSON.stringify(w);mockSeedWorld(w);mock80Fix(w);
  MOCK_OUT=[];let out;try{out=R(w,d,me)}catch(e){MOCK_OUT=[];throw e}if(JSON.stringify(w)!==s0)mockSave(w);const q=MOCK_OUT;MOCK_OUT=[];mockFlush80(q);
  return JSON.parse(JSON.stringify(out===undefined?{}:out))})};
function mockLive80(w,me){for(const L of Object.values(w.lobbies||{})){if(L.status!=='live'||!L.players.some(p=>p.id===me))continue;const M=w.matches[L.id];if(!M||M.status==='done')continue;
    if((M.abandoned||{})[me]||(M.reports||{})[me])continue;return {id:L.id,ev:L.ev,loc:L.loc,ranked:!!L.ranked,dropped:!!(M.dropped||{})[me]}}return null}
{const base=mockGroup;mockGroup=function(w,me){const g=base.apply(this,arguments);
  for(const x of g)if(mockLive80(w,x.id))throw new Error(x.id===me?_T('Your gladiator is still fighting a match — go back to it (⚔ Rejoin) or abandon it first.'):_T('Someone in your party is still in a match.'));return g}}
{const base=MOCK_ROUTES['lobby.ticket'];MOCK_ROUTES['lobby.ticket']=(w,d,me)=>{if(mockLive80(w,me))throw new Error(_T('Your gladiator is still fighting a match — go back to it (⚔ Rejoin) or abandon it first.'));return base(w,d,me)}}
function mockToday80(w){const D=w.days80||{};const t=Date.now();const k=ONLC.dayKey(t);if(ONLC.dayHas(D[k]))return ONLC.dayOut(D[k],'today');
  const y=D[ONLC.dayPrevKey(t)];return ONLC.dayHas(y)?ONLC.dayOut(y,'yesterday'):ONLC.dayOut(D[k],'today')}
function mockDay80(w,fn){w.days80=w.days80||{};const k=ONLC.dayKey(Date.now());w.days80[k]=fn(w.days80[k]||{})||w.days80[k];const old=ONLC.dayKey(Date.now()-2*864e5);
  for(const x of Object.keys(w.days80))if(x<old)delete w.days80[x]}
{const base=MOCK_ROUTES['hello'];MOCK_ROUTES['hello']=(w,d,me)=>{const o=base(w,d,me);o.now=Date.now();if(d.all&&o.me){const lv=mockLive80(w,me);if(lv)o.live=lv;o.today=mockToday80(w)}return o}}
{const base=MOCK_ROUTES['world.news'];MOCK_ROUTES['world.news']=(w,d,me)=>({...base(w,d,me),today:mockToday80(w)})}
{const base=MOCK_ROUTES['match.result'];MOCK_ROUTES['match.result']=(w,d,me)=>{const L=w.lobbies[d.id];const M=w.matches[d.id];const was=M&&M.status;const before={};
  if(L&&M&&was!=='done')for(const p of L.players){const ch=w.chars[p.char];if(ch&&!/^bot/.test(p.id))before[p.id]=ONLC.rankFor(ch).k}
  const r=base(w,d,me);
  try{if(L&&M&&M.status==='done'&&was!=='done'){const A=ONLC.agree(M.reports||{});if(!A.void){
    const seats=L.players.map((p,i)=>{if(/^bot/.test(p.id)||(M.abandoned||{})[p.id])return null;const ch=w.chars[p.char];const row=(A.table||[]).find(x=>x.seat===i);return ch&&row?{acct:p.id,ch,before:before[p.id]||'tiro',row,out:(M.outs||{})[p.id],kit:p.kit,seat:i}:null}).filter(Boolean);
    if(seats.length)mockDay80(w,D=>ONLC.dayFromMatch(D,{id:L.id,ev:L.ev,loc:L.loc,at:Date.now(),ranked:!!L.ranked,seats}))}}}catch(e){console.error(e)}return r}}
{const base=MOCK_ROUTES['match.abandon'];MOCK_ROUTES['match.abandon']=(w,d,me)=>{const L=w.lobbies[d.id];const p=L&&L.players.find(x=>x.id===me);const ch=p&&w.chars[p.char];const before=ch?ONLC.rankFor(ch).k:'tiro';
  const r=base(w,d,me);try{if(r&&r.out&&r.out.died&&ch)mockDay80(w,D=>ONLC.dayFell(D,{id:d.id,acct:me,ev:L.ev,loc:L.loc,at:Date.now(),ch,before,hall:r.out.hall,kit:p.kit}))}catch(e){}return r}}
{const base=MOCK_ROUTES['match.odd'];MOCK_ROUTES['match.odd']=(w,d,me)=>{const r=base(w,d,me);try{const L=w.lobbies[d.id];const M=w.matches[d.id];const seat=d.seat|0;
  const acct=seat<L.seats?(L.players[seat]||{}).id:((L.stands||[])[seat-L.seats]||{}).id;const n=mockLiveHumans(L,M).length;const v=((mockOdd80()[d.id]||{}).votes||{})[acct]||[];
  if(acct&&n>=3&&v.length>=Math.floor(n/2)+1)mockPush('match.youodd',{id:d.id,seat,voters:v.slice(),to:acct})}catch(e){}return r}}
/* ⚔ Again as on the server: after your own report (or abandon), only {ev, loc, ranked, seats}, the match's fighters invited */
MOCK_ROUTES['lobby.again']=(w,d,me)=>{const O=mockLobby80(w,d.id);const M=w.matches[d.id];if(!O.players.some(p=>p.id===me)||!M)throw new Error(_T('Not your match.'));
  if(!(O.status==='done'||M.status==='done'||(M.reports||{})[me]||(M.abandoned||{})[me]))throw new Error(_T('The match is not over.'));
  const L=mockCreate80(w,{ev:O.ev,loc:O.loc,ranked:!!O.ranked,seats:O.seats},me,false);const invited=[];const st=O.status;O.status='done';
  try{for(const p of O.players){if(/^bot/.test(p.id)||p.id===me||ONLC.memberOf(L,p.id))continue;if(!mockInvite80(w,me,L,p.id,true))invited.push(p.id)}}finally{O.status=st}
  return {lobby:mockRoomOut80(w,L),invited}};

/* ---------------- the live match record (main menu) ---------------- */
const LIVE80_KEY='flavius_onlmatch80';
function onlLive80Get(){try{const x=JSON.parse(localStorage.getItem(LIVE80_KEY)||'null');if(x&&x.id&&Date.now()-(x.at||0)<6*3600e3)return x}catch(e){}return null}
function onlLive80Put(x){try{localStorage.setItem(LIVE80_KEY,JSON.stringify(x))}catch(e){}onlLive80Menu()}
function onlLive80Clear(id){const x=onlLive80Get();if(x&&(!id||x.id===id)){try{localStorage.removeItem(LIVE80_KEY)}catch(e){}}onlLive80Menu()}
function onlLive80Char(c){return {id:c.id,name:c.name,cls:c.cls,look:c.look||{},stats:{...(c.stats||{})},wins:c.wins|0,bouts:c.bouts|0,survived:c.survived|0,lifeCF:c.lifeCF|0,wallet:c.wallet|0,
  rank:ONLC.rankFor(c).k,gear:(c.gear||[]).slice(0,40),equip:Array.isArray(c.equip)?c.equip.slice(0,40):undefined,kills:c.kills|0}}
function onlLive80From(L,seat,chars){const p=L&&L.players&&seat>=0?L.players[seat]:null;const cid=(p&&p.char)||(ONL.live&&ONL.live.id===(L&&L.id)&&ONL.live.char);
  const c=(chars||ONL.chars||[]).find(x=>x.id===cid)||ONL.char||null;
  return {id:L&&L.id,acct:onlMe80(),ev:L&&L.ev,loc:L&&L.loc,ranked:!!(L&&L.ranked),rule:L&&L.players?ONLC.abandonRule(L):(L&&L.ranked?'fate':'cpu'),at:Date.now(),
    char:c?onlLive80Char(c):null,kit:p&&p.kit?{gear:(p.kit.gear||[]).slice(0,30)}:null}}
/* entering as a fighter writes the record (a ticket holder or a watcher has no gladiator at stake) */
function onlLive80Enter(L){const me=onlMe80();if(!L||!me)return;const seat=L.players.findIndex(p=>p.id===me);if(seat<0||(ONL.leftMatch||{})[L.id])return;onlLive80Put(onlLive80From(L,seat))}
{const base=onlAttach;onlAttach=async function(L,role){const r=await base.apply(this,arguments);try{if(role==='seat'&&L&&!(ONL.leftMatch||{})[L.id]){const W=ONL.watching;if(W&&W.seat)onlLive80Enter(L)}}catch(e){}return r}}
/* ⚔ / 🚪 on the main menu */
function onlLive80Menu(){const m=document.getElementById('mainMenu');if(!m)return;let row=document.getElementById('mmLive80');const x=onlLive80Get();
  const show=!!x&&!(S&&S.onl&&!S.over&&S.onl.lobby===x.id)&&(!ONL.acct||!x.acct||ONL.acct.id===x.acct);
  if(!show){if(row)row.remove();return}const box=m.querySelector('.mmbtns');if(!box)return;
  if(!row||row.parentNode!==box){if(row)row.remove();row=document.createElement('div');row.id='mmLive80';box.prepend(row)}
  const c=x.char||{};const key=JSON.stringify([x.id,x.dropped,c.name,x.ev,x.loc]);if(row.dataset.k===key)return;row.dataset.k=key;
  row.innerHTML=`<span class="ml80-fig">${c.cls?onlFig(c.cls,c.look,60):'⚔'}</span><span class="ml80-txt">${_T`<b>${x.dropped?'🔌':'⚔'} ${esc2(c.name||_T('Your gladiator'))} is still on the sand</b>
    <small>${esc2(onlEvName(x.ev))} at ${esc2(onlCityName(x.loc))} · ${x.ranked?_T('Ranked'):_T('Custom')}${x.dropped?_T(' · a CPU fights in your seat'):''}</small>`}</span>
    <span class="ml80-acts"><button type="button" class="btn primary" data-mml80="back">${_T`⚔ Back to your match`}</button><button type="button" class="btn" data-mml80="abandon">${_T`🚪 Abandon`}</button></span>`}
{const base=menuShow;menuShow=function(){const r=base.apply(this,arguments);try{onlLive80Menu();onlLive80Check()}catch(e){}return r}}
setInterval(()=>{try{const m=document.getElementById('mainMenu');if(m&&!m.hidden)onlLive80Menu()}catch(e){}},2000);
/* the menu asks the server once a minute whether the match still runs (then the socket closes again) */
async function onlLive80Check(){const x=onlLive80Get();if(!x||Date.now()-ONL80F.validAt<60000||!(typeof ONL_ON==='function'&&ONL_ON()))return;ONL80F.validAt=Date.now();
  try{if(!(await onlLive80Net()))return;await NET.req('hello',{all:1})}catch(e){}setTimeout(()=>{try{netIdleClose()}catch(e){}},1500)}
/* the transport is ready (aws: signed in) */
async function onlLive80Net(){try{await netPick();if(NET.mode==='aws'){const c=await NETWS.config();if(!c.dev&&!(await netToken()))return false}return true}catch(e){return false}}
async function onlLive80Back(){const x=onlLive80Get();if(!x)return;try{if(typeof menuHide==='function')menuHide()}catch(e){}onlineOpen('play');
  for(let i=0;i<80&&!(document.getElementById('onl')&&ONL.acct);i++)await new Promise(r=>setTimeout(r,150));if(!ONL.acct)return;
  let L=(ONL.lobbies||[]).find(l=>l.id===x.id);if(!L){try{const rows=await NET.req('lobby.list');if(Array.isArray(rows)){ONL.lobbies=rows;L=rows.find(l=>l.id===x.id)}}catch(e){}}
  if(!L||L.status!=='live'){onlLive80Clear(x.id);onlToast80(_T('⌛ That match is over.'));try{onlRedraw()}catch(e){}return}onlDo(()=>onlAttach(L,'seat'))}
async function onlLive80Abandon(){const x=onlLive80Get();if(!x)return;
  const ok=await onlAbandonAsk80({ranked:x.ranked,rule:x.rule,dropped:x.dropped,char:x.char,kit:x.kit});if(!ok)return;
  if(!(await onlLive80Net())){onlToast80(_T('🌐 Sign in to Online first — then 🚪 Abandon from your match card.'));try{if(typeof menuHide==='function')menuHide()}catch(e){}onlineOpen('play');return}
  try{const r=await NET.req('match.abandon',{id:x.id});(ONL.leftMatch=ONL.leftMatch||{})[x.id]=1;onlLive80Clear(x.id);
    onlToast80(r&&r.rule?(r.out&&r.out.died?_T`🌫 <b>${esc2((x.char||{}).name||_T('Your gladiator'))}</b> abandoned the sand — Damnatio.`:_T('🚪 You left the match.')):_T('⌛ That match is already over.'))}
  catch(err){const m=String(err.message||err);if(/No such match|Not your match|gone/i.test(m)){onlLive80Clear(x.id);onlToast80(_T('⌛ That match is already over.'))}else onlToast80('⚠ '+esc2(m))}
  setTimeout(()=>{try{netIdleClose()}catch(e){}},1500)}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#mmLive80 [data-mml80]');if(!b)return;e.preventDefault();e.stopPropagation();
  if(b.dataset.mml80==='back')onlLive80Back();else onlLive80Abandon()},true);

/* ---------------- 🚪 the abandon popup: the gladiator at stake ---------------- */
function onl80Face(c,size){const L=c&&c.look||{};const col=L.color||(CLASSES[c&&c.cls]||{}).color||'#a3281f';
  return typeof portraitHTML==='function'?portraitHTML({name:(c&&c.name)||'',portrait:L.portrait||{},color:col},size||'md'):onlMini(c&&c.cls,90)}
function onlGearName80(k){return (W[k]&&W[k].n)||(ARM[k]&&ARM[k].n)||k}
function onlStakeHTML80(o){const c=o.char||{};const nm=esc2(c.name||_T('Your gladiator'));const brought=(o.kit&&o.kit.gear)||ONLC.equipOf(c);
  const wpn=brought.filter(k=>W[k]),arm=brought.filter(k=>!W[k]);const all=(c.gear||[]).length;const home=Math.max(0,all-brought.length);const lost=(c.bouts|0)-(c.wins|0);
  const st=(typeof STATS!=='undefined'?STATS:[]).map(([k,n,ic])=>`<span class="stk80-st" title="${esc2(n)}">${ic} <b>${(c.stats||{})[k]|0}</b><i>${esc2(n)}</i></span>`).join('');
  const coin=typeof ICO!=='undefined'&&ICO.coin?ICO.coin:'🪙';
  const now=o.now?`<div class="stk80-now">${_T`On the sand now: ${cfAmt87(o.now.cf|0)} · ${coin} ${o.now.coin|0}`}</div>`:'';
  const stake=o.ranked?`<div class="stk80-warn">${_T`<b>Ranked — Damnatio.</b> ${nm} dies and is struck from your roster for good, with ${coin} ${c.wallet|0} and ${all} piece${all===1?'':'s'} of gear${home?_T` (${home} left at home)`:''}. This cannot be undone.${o.dropped?_T('<br>A CPU is fighting for them now — let it, and they may still survive.'):''}`}</div>`
    :`<div class="stk80-ok">${_T`${o.rule==='fate'?_T`${nm} is out of this bout.`:_T('A CPU takes your seat and fights on.')} Nothing is lost — the bout does not count for ${nm}.`}</div>`;
  return `<div class="stk80"><div class="stk80-art">${onl80Face(c,'md')}<span class="stk80-tok">${c.cls?onlFig(c.cls,c.look,84):''}</span></div>
    <div class="stk80-info"><div class="stk80-name">${nm}</div><div class="stk80-sub">${esc2((CLASSES[c.cls]||{}).name||'')} · ${onlRankChip(c.rank||'tiro')}</div>
      <div class="stk80-rec">${_T`<span>⚔ <b>${c.wins|0}</b> won · <b>${Math.max(0,lost)}</b> lost</span><span>🛡 ${c.survived|0} survived</span><span>${cfAmt87(c.lifeCF|0)}</span><span>${coin} ${c.wallet|0}</span>`}</div>
      <div class="stk80-stats">${st}</div></div></div>${now}
   <div class="stk80-gear">${_T`<b>Brought into this match</b>${wpn.length?`<div>🗡 ${wpn.map(k=>esc2(onlGearName80(k))).join(' · ')}</div>`:''}${arm.length?`<div>🛡 ${arm.map(k=>esc2(onlGearName80(k))).join(' · ')}</div>`:''}${brought.length?'':'<div class="rc-sub">Only the class kit.</div>'}`}</div>
   ${stake}<p class="rc-sub" style="margin:6px 0 0">${_T`You may come back to watch, but not to fight.`}</p>`}
function onlAbandonAsk80(o){return ask76(_T('🚪 Abandon the match?'),onlStakeHTML80(o),_T('🚪 Abandon'),o.dropped?_T('Let the CPU fight on'):_T('Stay'))}
/* the arena bar's 🚪 Abandon match */
window.addEventListener('click',async e=>{const b=e.target&&e.target.closest&&e.target.closest('#btnOnlLeave');if(!b||b.dataset.mode!=='abandon')return;e.preventDefault();e.stopImmediatePropagation();ONLM.uiAt=Date.now();
  const id=S&&S.onl&&S.onl.lobby;if(!id)return;const L=(ONL.lobbies||[]).find(x=>x.id===id);const rule=S.onl.ranked?'fate':(L&&L.abandon==='fate'?'fate':'cpu');const seat=S.onl.seat;
  const lp=L&&L.players[seat];const cid=(ONL.live&&ONL.live.id===id&&ONL.live.char)||(lp&&lp.char);const c=(ONL.chars||[]).find(x=>x.id===cid)||ONL.char;const p=S.players[seat];
  const ok=await onlAbandonAsk80({ranked:!!S.onl.ranked,rule,char:c?onlLive80Char(c):null,kit:lp&&lp.kit?{gear:lp.kit.gear||[]}:null,now:p?{cf:p.cf,coin:p.coin}:null});if(!ok)return;
  try{const r=await NET.req('match.abandon',{id});(ONL.leftMatch=ONL.leftMatch||{})[id]=1;onlLive80Clear(id);if(r&&r.out&&r.out.died)setTimeout(()=>onlToast80(_T('🌫 Your gladiator abandoned the sand — Damnatio.')),600)}
  catch(err){onlToast80('⚠ '+esc2(errText92(err)))}onlExit()},true);
/* the Online card of a live match: 🚪 Abandon beside ⚔ Back to the sand */
{const base=onlRoomTop80;onlRoomTop80=function(){let h=base.apply(this,arguments);try{const L=onlMyLobby();const me=onlMe80();
  if(L&&L.status==='live'&&L.players.some(p=>p.id===me)&&!(ONL.leftMatch||{})[L.id]&&h.includes('data-onl="enter"')){const x=onlLive80Get();const dropped=!!(x&&x.id===L.id&&x.dropped);
    h=h.replace(/(<button type="button" class="btn primary" data-onl="enter"[^>]*>)[^<]*(<\/button>)/,`$1${dropped?_T('👁 Watch — a CPU fights for you'):_T('⚔ Back to the sand')}$2<button type="button" class="btn" data-onl80f="abandon" data-v="${esc2(L.id)}">${_T`🚪 Abandon`}</button>`)}}catch(e){}return h}}
window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#onl [data-onl80f]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const v=b.dataset.v;
  if(b.dataset.onl80f!=='abandon')return;const L=(ONL.lobbies||[]).find(x=>x.id===v);if(!L)return;const me=onlMe80();const p=L.players.find(q=>q.id===me)||{};
  const c=(ONL.chars||[]).find(x=>x.id===p.char)||ONL.char;const x=onlLive80Get();
  onlAbandonAsk80({ranked:!!L.ranked,rule:ONLC.abandonRule(L),dropped:!!(x&&x.id===L.id&&x.dropped),char:c?onlLive80Char(c):null,kit:p.kit?{gear:p.kit.gear||[]}:null}).then(async ok=>{if(!ok)return;
    try{const r=await NET.req('match.abandon',{id:v});(ONL.leftMatch=ONL.leftMatch||{})[v]=1;onlLive80Clear(v);onlToast80(r&&r.out&&r.out.died?_T('🌫 Your gladiator abandoned the sand — Damnatio.'):_T('🚪 You left the match.'));
      await onlRefresh();onlRedraw()}catch(err){onlToast80('⚠ '+esc2(errText92(err)))}})},true);

/* ---------------- ☀ Today in the arena (the Online landing) ---------------- */
function onlTodayHTML80(){const T=ONL80F.today;if(!T)return '';const yd=T.day==='yesterday';const WN=T.wins||[],F=T.fallen||[],U=T.upsets||[];
  const ago=at=>{const m=Math.max(0,Math.round((Date.now()+(ONL80F.skew||0)-(at||0))/60000));return m<1?_T('just now'):m<60?_T`${m} min ago`:_T`${Math.round(m/60)} h ago`};
  const where=e=>_T`${esc2(onlEvName(e.ev))} at ${esc2(onlCityName(e.loc))}`;const cls=e=>esc2((CLASSES[e.cls]||{}).name||'');
  const show=(e,line,k)=>`<div class="td80-show ${k}"><div class="td80-art">${onl80Face(e,'md')}<span class="td80-tok">${onlFig(e.cls,e.look,60)}</span></div>
    <div class="td80-info"><div class="td80-name">${esc2(e.name)}</div><div class="td80-sub">${onlRankChip(e.rank)} ${cls(e)}</div><div class="td80-out">${line}</div>
    <small>${e.bouts!=null?_T`${e.bouts|0} bouts · ${e.wins|0} won · `:''}${e.ranked?_T('Ranked'):_T('Custom')} · ${ago(e.at)}</small></div></div>`;
  const row=(e,txt)=>`<div class="td80-row"><span class="td80-mini">${onlFig(e.cls,e.look,34)}</span><span>${txt}</span></div>`;
  const b1=WN.length?show(WN[0],_T`🏆 Won ${where(WN[0])} with <b>${cfAmt87(WN[0].cf|0)}</b>`,'win')+WN.slice(1,4).map(e=>row(e,_T`<b>${esc2(e.name)}</b> · ${cfAmt87(e.cf|0)} · ${where(e)}`)).join('')
    :`<div class="td80-empty">${_T`No victor yet ${yd?_T('yesterday'):_T('today')} — the sand waits.`}</div>`;
  const fell=e=>e.how==='damnatio'?_T`🌫 Abandoned ${where(e)} — <b>Damnatio</b>`:_T`🪦 Fell to the Fate in ${where(e)}${e.hall?_T(' — the Hall keeps the name'):''}`;
  const upTxt=u=>_T`⚔ <b>${esc2(u.w.name)}</b> ${onlRankChip(u.w.rank)} humbled <b>${esc2(u.l.name)}</b> ${onlRankChip(u.l.rank)} · ${where(u)}`;
  let b2='';if(F.length)b2=show(F[0],fell(F[0]),'fall')+F.slice(1,3).map(e=>row(e,`<b>${esc2(e.name)}</b> ${onlRankChip(e.rank)} · ${e.how==='damnatio'?_T('Damnatio'):_T('the Fate')} · ${where(e)}`)).join('');
  else if(U.length){const u=U[0];b2=show({...u.l,at:u.at,ranked:u.ranked,ev:u.ev,loc:u.loc},_T`⚔ Humbled by <b>${esc2(u.w.name)}</b> ${onlRankChip(u.w.rank)} in ${where(u)}`,'fall')}
  const ups=(F.length?U:U.slice(1)).slice(0,3).map(u=>row(u.w,upTxt(u))).join('');if(!b2&&!ups)b2=`<div class="td80-empty">${_T`No one fell ${yd?_T('yesterday'):_T('today')}.`}</div>`;
  return `<div class="td80" id="onlToday80"><div class="ow-h">${_T`${yd?_T('🌙 Yesterday in the arena'):_T('☀ Today in the arena')}<small>the day's biggest wins and falls</small>`}</div>
   <div class="td80-grid"><div class="td80-box"><div class="td80-h">${_T`🏆 Victors of the day`}</div>${b1}</div><div class="td80-box dark"><div class="td80-h">${_T`🪦 Fallen &amp; humbled`}</div>${b2}${ups}</div></div></div>`}
{const base=onlLandingHTML80;onlLandingHTML80=function(){return base.apply(this,arguments)+onlTodayHTML80()}}
function onlToday80Patch(){const el=document.getElementById('onlToday80');if(!el)return;const h=onlTodayHTML80();if(h&&el.outerHTML!==h)el.outerHTML=h}

{const st=document.createElement('style');st.textContent=`
#onlCry80{left:12px;right:12px;margin:0 auto;width:fit-content;transform:none}#onlCry80 .btn{white-space:nowrap;flex:none}
@media(max-width:760px){#onlCry80{border-radius:12px;font-size:13px;flex-wrap:wrap;top:8px;padding:8px 10px}}
.omapbig{padding:0 16px;box-sizing:border-box}.omapbig .cap{text-align:center;max-width:100%}
@media(max-width:600px){.omapbig .cap{font-size:16px}.omapbig .cap small{display:block;margin-left:0;font-size:12px}}
#mmLive80{display:grid;grid-template-columns:52px minmax(0,1fr);grid-template-areas:"fig txt" "acts acts";gap:6px 10px;align-items:center;padding:10px 12px;margin:0 0 10px;border:2px solid var(--gold,#e8c96a);border-radius:12px;background:linear-gradient(90deg,rgba(142,42,30,.55),rgba(36,26,16,.92));box-shadow:0 0 18px rgba(232,201,106,.25);text-align:left;width:100%;box-sizing:border-box}
#mmLive80 .ml80-fig{grid-area:fig;display:grid;place-items:center;font-size:30px}#mmLive80 .ml80-fig img,#mmLive80 .ml80-fig svg{max-height:58px}
#mmLive80 .ml80-txt{grid-area:txt;min-width:0;display:flex;flex-direction:column;gap:2px}#mmLive80 .ml80-txt b{font:700 15px Georgia,serif;color:#f3d58a}#mmLive80 .ml80-txt small{color:#d8cbb0;font-size:12.5px}
#mmLive80 .ml80-acts{grid-area:acts;display:flex;gap:6px}#mmLive80 .ml80-acts .btn{flex:1 1 0;width:auto;min-width:0;margin:0;padding:7px 10px;font-size:14px}
.ask76bg .verask:has(.stk80){width:min(560px,94vw);max-height:92vh;overflow-y:auto}
.stk80{display:flex;gap:14px;align-items:flex-start;text-align:left}.stk80-art{position:relative;flex:none;width:96px}.stk80-art .portrait{width:96px!important;height:134px!important;border-radius:10px;overflow:hidden;border:2px solid #6b5532}
.stk80-tok{position:absolute;right:-18px;bottom:-10px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.6))}.stk80-tok img,.stk80-tok svg{max-height:84px}
.stk80-info{flex:1;min-width:0;padding-left:8px}.stk80-name{font:700 21px Georgia,serif;color:var(--gold,#e8c96a)}.stk80-sub{margin:2px 0 6px;color:var(--muted);font-size:13px}
.stk80-rec{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:13px;color:#eadbb8}.stk80-rec img{height:14px;vertical-align:-2px}
.stk80-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;margin-top:8px}.stk80-st{display:flex;flex-direction:column;align-items:center;padding:3px 0;border:1px solid #4a3a26;border-radius:8px;font-size:12px}.stk80-st b{font-size:14px;color:#fff}.stk80-st i{font-style:normal;font-size:9.5px;color:var(--muted)}
.stk80-now{margin:10px 0 0;font-size:13px;color:#cfe0b0}.stk80-now img{height:14px;vertical-align:-2px}
.stk80-gear{margin:10px 0 0;padding:7px 10px;border:1px solid #4a3a26;border-radius:10px;font-size:13px;text-align:left;display:grid;gap:3px}.stk80-gear>b{font-size:12px;color:var(--muted);font-weight:600}
.stk80-warn{margin:10px 0 0;padding:8px 10px;border:2px solid #a3281f;border-radius:10px;background:rgba(163,40,31,.18);font-size:13.5px;text-align:left;color:#f6dccc}.stk80-warn img{height:14px;vertical-align:-2px}
.stk80-ok{margin:10px 0 0;padding:8px 10px;border:1px solid #5a6b3a;border-radius:10px;background:rgba(90,107,58,.15);font-size:13.5px;text-align:left}
.td80{margin-top:18px}.td80-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px}
.td80-box{border:2px solid #c9a24f;border-radius:14px;padding:10px 12px;background:linear-gradient(#2c2216,#211913);box-shadow:inset 0 0 22px rgba(0,0,0,.45);display:flex;flex-direction:column;gap:6px}
.td80-box.dark{border-color:#7a3a2a;background:linear-gradient(#251a16,#1b1311)}
.td80-h{font:700 16px Georgia,serif;color:#f3d58a;letter-spacing:.3px}.td80-box.dark .td80-h{color:#e6b0a0}
.td80-show{display:flex;gap:12px;align-items:center;padding:4px 0 6px;border-bottom:1px solid rgba(255,255,255,.07)}
.td80-art{position:relative;flex:none;width:80px}.td80-art .portrait{width:80px!important;height:112px!important;border-radius:10px;overflow:hidden;border:2px solid #6b5532}
.td80-show.win .td80-art .portrait{border-color:#e8c96a;box-shadow:0 0 14px rgba(232,201,106,.35)}.td80-show.fall .td80-art .portrait{filter:grayscale(.55) sepia(.2);border-color:#7a3a2a}
.td80-tok{position:absolute;right:-16px;bottom:-8px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.6))}.td80-tok img,.td80-tok svg{max-height:60px}
.td80-info{flex:1;min-width:0;padding-left:8px}.td80-name{font:700 18px Georgia,serif;color:var(--bone,#eee)}.td80-sub{font-size:12.5px;color:var(--muted);margin:1px 0 4px}
.td80-out{font-size:13.5px;color:#eadbb8}.td80-out b{color:#f3d58a}.td80-info small{color:var(--muted);font-size:11.5px}
.td80-row{display:flex;gap:8px;align-items:center;font-size:12.5px;color:#d8cbb0}.td80-mini{flex:none;width:30px;display:grid;place-items:center}.td80-mini img,.td80-mini svg{max-height:34px}
.td80-empty{color:var(--muted);font-style:italic;font-size:13px;padding:10px 0}
@media(max-width:760px){.td80-grid{grid-template-columns:1fr;gap:12px}}
`;document.head.appendChild(st)}

/* =====================================================================
   290-v100tt · v1.0 ONLINE TURN FLOW + TIMERS (his picks 2026-10-11; mock tools/plans/mock100/turn.html; online only — offline and hot seat untouched)
   =====================================================================
   1a ONLY DECISIONS OPEN A WINDOW: a window with one button (or none), no grid and nothing clickable in its body is a NOTICE — every client
      answers it at once with that button's value (no input travels); its owner gets a toast. The same rule on every screen keeps the lockstep.
   2b ONE DOCKED STEP PANEL: a decision window of mine (not a full / wide one) docks beside the board (over the right column; phones: a bottom
      sheet) with a header — "Choose one · step N · 14 s", step dots, the default answer marked, "No answer in N s → <default>". It is the same
      modal() underneath (113 records the same value; nothing about the window's buttons changes).
   3a OTHERS SEE "<name> is choosing… <what>" (the window's title, never its options) in the turn panel; the action bar stays dimmed (113 onl-off).
   TIMERS (ONLC.ttOf100: Ranked 60 s turns + 20 s decisions, Custom: host's Off/30/60/90/120, decisions 20 s only with a timer on):
   • THE SERVER SAYS WHEN TIME RAN OUT. Pages report clocks (match.clock {kind:'turn'|'end'|'dec'}: first report wins, the server stamps its own
     time) and send match.tick when a deadline they know of has passed; the server then orders an input in the lockstep stream:
       {k:'dto', seat, d}   decision number d took its default (a lock MATCH DEC#<d>: the answer and the timeout cannot both win);
       {k:'timeout', seat, t, n}  turn t of that seat ran out (lock TO#<t>; late tile/act inputs of that turn are voided by the server and here).
   • DECISION NUMBERS: every recorded window of a human seat counts S.dn100 (in S → in snapshots), so "d" names the same window everywhere.
     With clocks on, my own answer is NOT applied at once: it is sent with d and applied when its seq comes round (ONLM.ownq) — so an answer
     and a dto can never land in different orders on different screens.
   • A TIMEOUT IS A MARK: applied at a wait point of that turn (a decision open, or the turn waiting for a click), it sets S.tt100x + p.cpu;
     the open decision still ends by its own answer / dto; later windows of that seat take their default; at the next settled point every
     client runs the CPU for the rest of THAT turn (tt100Finish — choice, action, end turn). The seat is a human again at the next beginTurn.
   • TWICE: after a seat's second applied timeout the other live humans get "Hand to CPU / Wait"; a majority (ONLC.dropNeed100) → the server
     orders {k:'drop', tt:1, until} — here a MARK (ONLM.left 'tt100'): at that seat's next decision a CPU takes it and plays that turn; the
     lanista may reclaim within the 139 window (p._cpu84 / ONL84.rcl).
   8c THE TURN PANEL #tt100 (top of the right column; phones: one strip above the action bar): the active face in a ring that empties, a thin bar,
      next up, the seats with their rings, the BIG number in the ring in the last 10 s, a thin red glow at the screen EDGES on my own turn
      (four 6 px strips — never over the board), a soft "marble" tick each second of my last 5 s (tt100Tick, SFX volume / mute respected).
   Test hook (mock only): localStorage flavius_onltest100='{"t":6,"d":4}' shortens a room's clocks (a room with the timer Off stays Off).
   Test tonl100tt; server/test/v100tt.test.js; docs/backend.md "v1.0 turn timers". */
const TT100C={lob:{},tc:null,dc:null,open:null,repT:-1,repEnd:-1,steps:{tn:-1,n:0},to:{},applied:{},dtoDone:new Set(),tickAt:0,beat:0,ticks:0,tickSec:-1,vote:null,
  running:0,face:new Map(),log:[],pz:null};
function tt100Test(){try{if(NET.mode&&NET.mode!=='mock')return null;const o=JSON.parse(localStorage.getItem('flavius_onltest100')||'null');return o&&o.t>0?{t:+o.t,d:+(o.d||o.t)}:null}catch(e){return null}}
function tt100Lob(L){try{if(L&&L.id!=null)TT100C.lob[L.id]=ONLC.ttOf100(L)}catch(e){}}
for(const nm of ['onlEnter','onlJoinMatch','onlAttach','onlWatch']){try{const base=eval(nm);if(typeof base==='function')eval(`${nm}=function(L){tt100Lob(L);return base.apply(this,arguments)}`)}catch(e){}}
/* the match's clocks in seconds ({t:0} = off) */
function tt100Cfg(){if(!S||!S.onl)return {t:0,d:0};let c=TT100C.lob[S.onl.lobby];if(!c){const L=(ONL.lobbies||[]).find(x=>x.id===S.onl.lobby);c=L?ONLC.ttOf100(L):{t:S.onl.ranked?ONLC.TT100.RANKED:0,d:S.onl.ranked?ONLC.TT100.DEC:0};TT100C.lob[S.onl.lobby]=c}
  const o=c.t?tt100Test():null;return o||c}
const tt100On=()=>{try{return onlmOn()&&tt100Cfg().t>0}catch(e){return false}};
const tt100F98=()=>typeof f98Busy==='function'&&f98Busy();
/* a fighter seat whose windows run on a clock */
function tt100Clocked(own){return tt100On()&&own>=0&&own<onlmFighters()&&onlmHuman(own)&&!(ONLM.left&&ONLM.left[own]!=null)}
const tt100Strip=h=>String(h||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
function tt100Def(buttons,opt){return opt&&('close' in opt)?opt.close:((buttons||[]).slice(-1)[0]||{}).value??null}
/* 1a: a notice = one button (or none), nothing to pick */
function tt100Notice(body,buttons,opt){const o=opt||{};if(o.grid||o.onOpen||o.keep||o.full||o.wide||o.xwide)return false;const bs=buttons||[];if(bs.length>1)return false;
  const b=String(body||'');if(/<(button|input|select|textarea)\b|data-(mi|v|pick|act|val|choice)\b|onclick=/i.test(b))return false;return true}
/* I report clocks / tick (mock: one keeper — the mock world is one localStorage item; real server: every fighter, staggered) */
function tt100Mine(){return ONLM.me>=0&&ONLM.me<onlmFighters()&&S&&S.onl&&!S.onl.watch}
function tt100Live(){const o=[];for(let i=0;i<onlmFighters();i++)if(onlmHuman(i)&&!(ONLM.left&&ONLM.left[i]!=null))o.push(i);return o}
function tt100Keeper(){if(!tt100Mine())return false;if(NET.mode&&NET.mode!=='mock')return true;return tt100Live()[0]===ONLM.me}
function tt100Req(t,d){return NET.req(t,{id:S.onl.lobby,...d}).then(r=>{tt100Status(r);return r})}
function tt100Report(kind,d){if(!tt100On()||!tt100Keeper())return;tt100Req('match.clock',{kind,...d}).catch(()=>{})}
/* a server status → local deadlines */
function tt100Status(r){if(!r||typeof r!=='object'||r.off)return;const now=Date.now();
  if(r.tc&&(!TT100C.tc||r.tc.t>=TT100C.tc.t)){const o=TT100C.tc;const keepPz=o&&o.t===r.tc.t&&o.lpz;TT100C.tc={t:r.tc.t,seat:r.tc.seat,end:r.tc.left==null?(o&&o.t===r.tc.t?o.end:now+tt100Cfg().t*1000):now+r.tc.left,srv:1,lpz:keepPz||null}}
  if(r.dc&&(!TT100C.dc||r.dc.d>=TT100C.dc.d))TT100C.dc={d:r.dc.d,seat:r.dc.seat,end:now+r.dc.left,srv:1}}
NET.on('match.clock100',d=>{try{if(S&&S.onl&&d&&d.id===S.onl.lobby)tt100Status(d)}catch(e){}});

/* ---------------- decisions (113's modal hook) ---------------- */
function onlmDec100(own,t,title,body,buttons,opt,base,self){
  S.dn100=(S.dn100|0)+1;const d=S.dn100;const def=tt100Def(buttons,opt);
  /* a seat whose turn ran out: its windows take the default at once (every client the same) */
  const X=S.tt100x;if(X&&X.seat===own&&X.t===S.turnNo){tt100Log({d,seat:own,v:def,by:'cpu'});return Promise.resolve(def)}
  if(ONLM.left&&ONLM.left[own]!=null)return null;
  if(tt100Notice(body,buttons,opt)){const b=(buttons||[])[0];const v=b?b.value:def;
    if(own===ONLM.me){const tx=tt100Strip(body).slice(0,140);if(typeof mToast==='function')mToast(`<b>${tt100Strip(title)}</b>${tx?' — '+esc(tx):''}`)}tt100Log({d,seat:own,v,by:'note'});return Promise.resolve(v)}
  if(own>=onlmFighters())return null;
  const clock=tt100Clocked(own);
  if(own===ONLM.me){const pre=onlHash();if(TT100C.steps.tn!==S.turnNo)TT100C.steps={tn:S.turnNo,n:0};TT100C.steps.n++;
    const O={d,seat:own,def,mine:true,t:title,clock,at:Date.now(),step:TT100C.steps.n,buttons,res:null,done:null};TT100C.open=O;if(clock)tt100Report('dec',{d,seat:own,t:S.turnNo});
    const o2={...(opt||{}),onOpen:done=>{O.done=done;if(O.byTimeout){try{done(def)}catch(e){}return}tt100Dock(O,opt);if(opt&&opt.onOpen)opt.onOpen(done)}};
    return new Promise(res=>{O.res=res;Promise.resolve(base.call(self,title,body,buttons,o2)).then(v=>{if(O.byTimeout)return;v=v===undefined?null:v;
      if(!clock){if(TT100C.open===O)TT100C.open=null;onlmSend({k:'modal',v,t:t.slice(0,60),pre});tt100Log({d,seat:own,v,by:'me'});res(v);return}
      /* clocks on: the answer travels with its number and lands when its seq comes round */
      O.answering=true;ONLM.pend={res:x=>{if(TT100C.open===O)TT100C.open=null;res(x)},t,seat:own,at:Date.now(),def,d,h:pre,mine100:true};tt100SendOwn({k:'modal',v,t:t.slice(0,60),pre,d})})})}
  /* someone else's window: wait for their value (or the server's dto) */
  if(clock)tt100Report('dec',{d,seat:own,t:S.turnNo});
  return new Promise(res=>{ONLM.pend={res,t,seat:own,at:Date.now(),def,d,h:onlHash()};onlmWaitShow();onlmPump()})}
/* my answer, in order: the server's reply gives its seq; the pump applies it there (113 pump: ONLM.ownq / ownHold) */
function tt100SendOwn(inp){ONLM.ownq=ONLM.ownq||new Set();inp.h=onlHash();ONLM.hlog['n'+(ONLM.sent+1)]=inp.pre;inp.seat=ONLM.me;inp.n=++ONLM.sent;ONLM.inflight=(ONLM.inflight||0)+1;ONLM.ownHold=true;
  NET.req('match.input',{id:S.onl.lobby,in:inp}).then(r=>{ONLM.inflight--;ONLM.ownHold=false;if(!r||!Number.isInteger(r.seq)){onlmPump();return}
    if(r.late){ONLM.own.add(r.seq);onlmPump();return}
    if(r.seq>=ONLM.next){ONLM.ownq.add(r.seq);if(!ONLM.q.some(x=>x.seq===r.seq))ONLM.q.push({...inp,from:ONL.acct.id,seq:r.seq});ONLM.q.sort((a,b)=>a.seq-b.seq)}onlmPump()})
  .catch(e=>{ONLM.inflight--;ONLM.ownHold=false;if(typeof mToast==='function')mToast(_T('⚠ The server did not take that move: ')+esc(errText92(e)));onlmPump()})}
function tt100Log(x){TT100C.log.push({...x,tn:S&&S.turnNo});if(TT100C.log.length>200)TT100C.log.shift()}
/* turn inputs carry their turn (tn) so a late one is known everywhere */
{const base=onlmSend;onlmSend=function(inp){try{if(tt100On()&&inp&&(inp.k==='tile'||inp.k==='act'))inp.tn=S.turnNo}catch(e){}return base.apply(this,arguments)}}
/* my own turn: no moves in the last second before the deadline (the server would void them) */
{const base=onlmMine;onlmMine=function(){const r=base.apply(this,arguments);try{if(r&&!CUR_MODAL&&tt100On()&&onlmActor()===ONLM.me){const L=tt100TurnLeft();if(L&&!L.pz&&L.left<ONLC.TT100.LOCK)return false}}catch(e){}return r}}

/* ---------------- the inputs: dto, timeout, late moves, the vote's drop ---------------- */
function tt100WaitPoint(){return !!(ONLM.pend||TT100C.open||(!S.busy&&!tt100F98()&&['choice','action','command'].includes(S.phase)))}
{const base=onlmReady;onlmReady=function(inp){if(!inp)return base.apply(this,arguments);
  if(inp.k==='dto'){if(!S||S.over)return true;const n=S.dn100|0;if(n>inp.d)return true;if(n<inp.d)return false;const O=TT100C.open;return !(O&&O.d===inp.d&&O.answering&&!(ONLM.pend&&ONLM.pend.d===inp.d))}
  if(inp.k==='timeout'){if(!S||S.over||S.turnNo>inp.t)return true;if(S.turnNo<inp.t)return false;if(cur()!==S.players[inp.seat])return true;return tt100WaitPoint()}
  if(inp.k==='drop'&&inp.tt)return !!S&&!S.over;
  /* a move of a seat whose turn already ran out: the server voids it; here too (never a hash check) */
  if((inp.k==='tile'||inp.k==='act')&&inp.tn!=null&&TT100C.to[inp.tn]===inp.seat){inp.k='void';inp.late100=1;return true}
  return base.apply(this,arguments)}}
{const base=onlmApply;onlmApply=function(inp){if(inp&&(inp.k==='dto'||inp.k==='timeout'||(inp.k==='drop'&&inp.tt))){try{if(inp.k==='dto')tt100Dto(inp);else if(inp.k==='timeout')tt100Timeout(inp);else tt100DropMark(inp)}catch(e){console.error(e)}setTimeout(onlmPump,30);setTimeout(tt100Kick,60);return}
  if(inp&&inp.k==='modal'&&ONL.acct&&inp.from===ONL.acct.id){ONLM.own.delete(inp.seq);if(ONLM.ownq)ONLM.ownq.delete(inp.seq)}
  if(inp&&inp.k==='modal'&&ONLM.pend)tt100Log({d:ONLM.pend.d,seat:ONLM.pend.seat,v:inp.v,by:'in'});
  return base.apply(this,arguments)}}
function tt100Dto(inp){TT100C.dtoDone.add(inp.d);const O=TT100C.open;let v=null,hit=false;
  if(ONLM.pend&&ONLM.pend.d===inp.d){const P=ONLM.pend;ONLM.pend=null;v=P.def;hit=true;if(O&&O.d===inp.d){O.byTimeout=1;TT100C.open=null}onlmWaitShow();P.res(P.def)}
  else if(O&&O.d===inp.d){O.byTimeout=1;TT100C.open=null;v=O.def;hit=true;try{if(O.done)O.done(O.def)}catch(e){}O.res(O.def)}
  if(!hit)return;tt100Log({d:inp.d,seat:inp.seat,v,by:'dto'});
  if(inp.seat===ONLM.me&&typeof mToast==='function')mToast(_T('⌛ Time — the default answer was taken.'))}
function tt100Timeout(inp){TT100C.to[inp.t]=inp.seat;const p=S.players[inp.seat];if(!p||S.turnNo!==inp.t||cur()!==p||!p.alive||p.exited||p.cpu)return;
  S.tt100x={t:inp.t,seat:inp.seat};p._tt100=1;p.cpu=true;TT100C.applied[inp.seat]=(TT100C.applied[inp.seat]|0)+1;
  log(_T`⌛ <b>${esc(p.name)}</b> ran out of time — the CPU finishes the turn.`,'big');
  if(typeof mToast==='function')mToast(inp.seat===ONLM.me?_T('⌛ Time — the CPU finishes your turn.'):_T`⌛ Time — the CPU finishes ${esc(p.name)}’s turn`);
  /* my own screen: a window I opened from the bars closes (decisions keep waiting for their answer / dto) */
  if(inp.seat===ONLM.me&&CUR_MODAL&&!TT100C.open){try{CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}catch(e){}}
  if(TT100C.applied[inp.seat]>=ONLC.TT100.DROP_AFTER&&tt100Mine()&&ONLM.me!==inp.seat&&onlmHuman(inp.seat))TT100C.vote={seat:inp.seat,name:p.name,at:Date.now(),sent:0,res:null};
  onlmWaitShow()}
/* the vote won: a mark — at that seat's next decision a CPU takes it (and plays that turn); the lanista may reclaim (139) */
function tt100DropMark(inp){ONLM.left=ONLM.left||{};const p=S.players[inp.seat];if(!p||ONLM.left[inp.seat]!=null)return;const was=ONLM.owners[inp.seat]||null;ONLM.left[inp.seat]='tt100';
  log(_T`🔌 <b>${esc(p.name)}</b> ran out of time again — the others hand the seat to a CPU.`,'big');if(TT100C.vote&&TT100C.vote.seat===inp.seat)TT100C.vote=null;
  try{if(inp.until&&was){p._cpu84={acct:was,until:inp.until,res:null};if(ONL.acct&&was===ONL.acct.id&&typeof ONL84!=='undefined')ONL84.rcl={id:S.onl.lobby,seat:inp.seat,until:inp.until}}}catch(e){}
  if(inp.seat===ONLM.me){ONLM.me=-1;if(typeof mToast==='function')mToast(_T('🔌 You ran out of time twice — a CPU takes your seat. Your gladiator still faces the Fate.'))}
  if(p.cpu&&p._tt100){delete p._tt100;ONLM.owners[inp.seat]=null;(ONLM.leftDone=ONLM.leftDone||{})[inp.seat]=1}
  if(ONLM.pend&&ONLM.pend.seat===inp.seat){const P=ONLM.pend;ONLM.pend=null;P.res(P.def)}setTimeout(onlmLeftCheck,60)}
{const base=onlmLeftCheck;onlmLeftCheck=function(){try{if(onlmOn()&&ONLM.left&&!S.busy&&!CUR_MODAL&&!ONLM.pend&&!TT100C.running&&['choice','action','command'].includes(S.phase)){const c=cur();const i=onlmSeatOf(c);
      if(ONLM.left[i]==='tt100'&&c&&!c.cpu&&c.alive&&!(ONLM.leftDone&&ONLM.leftDone[i])){(ONLM.leftDone=ONLM.leftDone||{})[i]=1;c.cpu=true;ONLM.owners[i]=null;tt100Run(c);onlmWaitShow();return}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* the CPU finishes the turn once it is settled (every client at the same point: no input of that seat can land any more) */
function tt100Kick(){try{if(!onlmOn()||!S.tt100x||TT100C.running)return;const X=S.tt100x;const p=S.players[X.seat];if(S.turnNo!==X.t||cur()!==p||!p||!p.alive||p.exited)return;
  if(S.busy||ONLM.pend||TT100C.open||tt100F98()||ONLM.resyncing)return;if(!['choice','action','command'].includes(S.phase))return;
  if(S.phase==='command'){ONLM.replay++;try{const b=document.createElement('button');b.dataset.act='cmddone';b.style.display='none';document.body.appendChild(b);try{b.click()}finally{b.remove()}}finally{ONLM.replay--}return}
  tt100Run(p)}catch(e){console.error(e)}}
function tt100Run(p){TT100C.running=1;tt100Finish(p).catch(e=>console.error(e)).finally(()=>{TT100C.running=0;setTimeout(onlmPump,30)})}
async function tt100Finish(p){const G=S;S.busy=true;try{render()}catch(e){}
  try{if(S.phase==='choice'){await sleep(250);if(G!==S)return;await takeChoice(p,cpuChoice(p));await flushMF();checkEnd();await settle();if(G!==S||S.over)return;
      if(!p.alive||p.exited){S.busy=false;return advanceTurn()}if(p.forceEnd){S.busy=false;return endTurn()}}
    if(S.phase==='action'){await sleep(200);if(G!==S)return;if(typeof isChariot==='function'&&isChariot())await cpuChariot(p);else if(typeof isNaum==='function'&&isNaum())await cpuNaum(p);else await cpuAct(p)}
    if(G!==S)return;S.busy=false;checkEnd();await settle();if(G!==S||S.over)return;await endTurn()}
  catch(e){console.error(e);if(G===S&&S&&!S.over){S.busy=false;try{await endTurn()}catch(x){}}}}
/* a timed-out seat is a human again at the next turn's start (unless the others handed it to a CPU) */
{const base=beginTurn;beginTurn=async function(){try{if(S&&S.onl&&S.players){for(let i=0;i<S.players.length;i++){const q=S.players[i];if(!q._tt100)continue;delete q._tt100;
        if(ONLM.left&&ONLM.left[i]!=null){ONLM.owners[i]=null;(ONLM.leftDone=ONLM.leftDone||{})[i]=1}else if(ONLM.owners[i])q.cpu=false}if(S.tt100x)S.tt100x=null}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}

/* ---------------- local clocks for display ---------------- */
function tt100TurnLeft(){const c=tt100Cfg();if(!c.t||!S||!S.onl)return null;const p=cur();const seat=onlmSeatOf(p);if(!p||p.cpu&&!(S.tt100x&&S.tt100x.seat===seat)||!onlmHuman(seat))return null;
  if(S.tt100x&&S.tt100x.seat===seat)return {left:0,total:c.t*1000,pz:false,seat,out:true};
  let tc=TT100C.tc;if(!tc||tc.t<S.turnNo||(tc.t===S.turnNo&&tc.seat!==seat)){if(!['choice','action','command'].includes(S.phase))return null;tc=TT100C.tc={t:S.turnNo,seat,end:Date.now()+c.t*1000,est:1}}
  if(tc.t!==S.turnNo)return null;
  /* another seat's window inside this turn pauses it (the server does the same) */
  const pz=!!((ONLM.pend&&ONLM.pend.seat!==seat&&ONLM.pend.d!=null)||(TT100C.open&&TT100C.open.seat!==seat&&TT100C.open.clock));const now=Date.now();
  if(pz&&!tc.lpz)tc.lpz=now;if(!pz&&tc.lpz){tc.end+=now-tc.lpz;tc.lpz=null}
  return {left:Math.max(0,(tc.lpz||now)>tc.end?0:tc.end-(tc.lpz||now)),total:c.t*1000,pz,seat}}
function tt100DecLeft(){const c=tt100Cfg();if(!c.t)return null;const P=ONLM.pend,O=TT100C.open;const d=O&&O.clock?O.d:P&&P.d!=null?P.d:null;if(d==null)return null;
  const seat=O&&O.d===d?O.seat:P.seat;let dc=TT100C.dc;if(!dc||dc.d!==d){const at=(O&&O.d===d?O.at:P.at)||Date.now();dc={d,seat,end:at+c.d*1000,est:1};if(!TT100C.dc||TT100C.dc.d<d)TT100C.dc=dc}
  return {left:Math.max(0,dc.end-Date.now()),total:c.d*1000,seat,d}}

/* ---------------- the loop: reports, ticks, the panel, the tick, the glow ---------------- */
setInterval(()=>{try{tt100Beat()}catch(e){console.error(e)}},200);
function tt100Beat(){if(!ONLM.on||!S||!S.onl){tt100Panel(false);return}
  const on=onlmOn()&&S.phase!=='setup';tt100Panel(on);if(!on)return;tt100Kick();
  if(!tt100On())return;const now=Date.now();
  /* clock reports: a human turn begins / ends */
  const p=cur(),seat=onlmSeatOf(p);const hum=p&&!p.cpu&&onlmHuman(seat)&&!(ONLM.left&&ONLM.left[seat]!=null);
  if(TT100C.repT>=0&&TT100C.repEnd!==TT100C.repT&&(S.turnNo!==TT100C.repT||S.phase==='end'||!hum)){TT100C.repEnd=TT100C.repT;tt100Report('end',{t:TT100C.repT})}
  if(hum&&['choice','action','command'].includes(S.phase)&&S.turnNo!==TT100C.repT&&!S.tt100x){TT100C.repT=S.turnNo;tt100Report('turn',{t:S.turnNo,seat})}
  /* ticks: a deadline I know of has passed (the server checks its own clock) */
  if(tt100Keeper()){const gap=NET.mode==='mock'?0:400*Math.max(0,tt100Live().indexOf(ONLM.me));const T=tt100TurnLeft(),D=tt100DecLeft();
    const due=(T&&!T.pz&&!T.out&&T.left<=0&&now-(TT100C.tc.end||now)>ONLC.TT100.GRACE*0.5+gap)||(D&&D.left<=0&&now-(TT100C.dc?TT100C.dc.end:now)>ONLC.TT100.GRACE*0.5+gap);
    if((due&&now-TT100C.tickAt>1200)||((T||D)&&now-TT100C.tickAt>12000)){TT100C.tickAt=now;tt100Req('match.tick',{}).catch(()=>{})}}}

function tt100Phone(){return window.innerWidth<=760||document.body.classList.contains('phoneL')||document.body.classList.contains('phoneP2')}
function tt100FaceEl(p){const k=p.id+'|'+p.cls;let el=TT100C.face.get(k);if(el)return el.cloneNode(true);el=document.createElement('span');el.className='f100';
  try{el.innerHTML=figureHTML(typeof tokenForP==='function'?tokenForP(p):tokenForCls(p.cls),34)}catch(e){}if(!el.innerHTML)el.textContent=(p.name||'?').charAt(0);TT100C.face.set(k,el);return el.cloneNode(true)}
const TT_R=21,TT_C=2*Math.PI*TT_R;
const tt100Ring=()=>`<svg class="rg100" viewBox="0 0 48 48" aria-hidden="true"><circle class="bg" cx="24" cy="24" r="${TT_R}"/><circle class="fg" cx="24" cy="24" r="${TT_R}" stroke-dasharray="${TT_C.toFixed(1)}" stroke-dashoffset="0"/></svg>`;
const tt100Fmt=ms=>{const s=Math.ceil(ms/1000);return s>=60?`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`:_T`${s} s`};
function tt100Panel(on){let el=document.getElementById('tt100');document.body.classList.toggle('tt100on',!!on);if(!on){if(el)el.hidden=true;tt100Edge(false);return}
  if(!el){el=document.createElement('section');el.id='tt100';el.className='tt100';el.setAttribute('aria-label',_T('Whose turn'));el.addEventListener('click',tt100Click)}
  const phone=tt100Phone();const side=document.querySelector('.side');const acts=document.getElementById('actions');
  if(phone||!side||!side.offsetParent){if(acts&&acts.parentElement&&acts.previousElementSibling!==el)acts.parentElement.insertBefore(el,acts)}
  else if(side.firstElementChild!==el)side.insertBefore(el,side.firstElementChild);
  el.hidden=false;el.classList.toggle('ph100',phone);
  const c=tt100Cfg();const p=cur();if(!p)return;const seat=onlmSeatOf(p);const T=tt100TurnLeft();const P=ONLM.pend;const D=tt100DecLeft();
  const mine=seat===ONLM.me&&!p.cpu;const nx=typeof bar96Next==='function'?bar96Next():null;
  const who=p.cpu&&!(S.tt100x&&S.tt100x.seat===seat)?_T('CPU'):mine?_T('Your turn'):_T('their turn');const ph={resolve:_T('Resolve'),choice:_T('Choice'),action:_T('Action'),end:_T('End'),command:_T('Command')}[S.phase]||'';
  const ch=P&&P.seat!==ONLM.me&&onlmHuman(P.seat)?`<div class="ch100"><span class="dots100"><i></i><i></i><i></i></span>${_T`<b>${esc(onlmName(P.seat))}</b> is choosing…`} <span class="what">${esc(tt100Strip(P.t).slice(0,40))}</span><span class="dt100"></span></div>`:'';
  const V=TT100C.vote;const vote=V?`<div class="vt100"><b>${_T`⌛ ${esc(V.name)} timed out twice`}</b><p>${_T`Hand the seat to a CPU for the rest of the bout? He still faces the Fate.`}</p>${V.res?`<p class="rc-sub">${esc(V.res)}</p>`:`<div class="vb100"><button type="button" class="btn primary tksm" data-tt100v="yes">${_T`🤖 Hand to CPU`}</button><button type="button" class="btn tksm" data-tt100v="no">${_T`Wait`}</button></div>`}</div>`:'';
  const seats=phone?'':`<div class="st100">${S.players.map((q,i)=>`<div class="s100 ${q===p?'on':''} ${q.alive&&!q.exited?'':'out'}" data-s100="${i}"><span class="fc100 sm">${tt100Ring()}</span><span class="n">${esc(q.name)}</span><span class="v"></span></div>`).join('')}</div>`;
  const sig=[seat,S.turnNo,S.phase,c.t,phone,mine,p.cpu?1:0,ch&&P.d+'|'+P.seat,V?V.seat+'|'+(V.res||''):'',S.players.map(q=>(q.alive&&!q.exited?1:0)+(q.cpu?'c':'h')).join('')].join('#');
  if(el.dataset.sig!==sig){el.dataset.sig=sig;
    el.innerHTML=`<div class="tp100 ${mine?'mine':''}"><span class="fc100 big">${tt100Ring()}<span class="fslot"></span><b class="num"></b></span><div class="nm100"><b>${esc(p.name)}</b><small>${who}${ph?' · '+ph:''}</small>${nx&&nx!==p&&!phone?`<small class="nx100">${_T`next: ${esc(nx.name)}`}</small>`:''}</div><span class="t100"></span></div>
      <div class="bar100"><i></i></div>${ch}${vote}${seats}`;
    el.querySelector('.fslot').appendChild(tt100FaceEl(p));
    el.querySelectorAll('[data-s100]').forEach(r=>{const q=S.players[+r.dataset.s100];if(q)r.querySelector('.fc100').appendChild(tt100FaceEl(q))})}
  /* the moving parts */
  const fr=T?Math.max(0,Math.min(1,T.left/T.total)):1;const late=!!(T&&!T.pz&&T.left<=10000);
  el.classList.toggle('late',late&&!T.out);el.classList.toggle('pz',!!(T&&T.pz));el.classList.toggle('noclk',!T);
  const ring=el.querySelector('.tp100 .rg100 .fg');if(ring)ring.setAttribute('stroke-dashoffset',(TT_C*(1-fr)).toFixed(1));
  const tt=el.querySelector('.t100');if(tt)tt.textContent=!T?'':T.out?'⌛':T.pz?'⏸':tt100Fmt(T.left);
  const num=el.querySelector('.tp100 .num');if(num)num.textContent=late&&!T.out?String(Math.ceil(T.left/1000)):'';
  const bar=el.querySelector('.bar100 i');if(bar)bar.style.width=(T?fr*100:0).toFixed(1)+'%';
  const dt=el.querySelector('.dt100');if(dt)dt.textContent=D&&D.seat!==ONLM.me?tt100Fmt(D.left):'';
  el.querySelectorAll('[data-s100]').forEach(r=>{const i=+r.dataset.s100,q=S.players[i];const v=r.querySelector('.v');const act=q===p;const g=r.querySelector('.rg100 .fg');
    if(g)g.setAttribute('stroke-dashoffset',(TT_C*(act?1-(T?fr:1):1)).toFixed(1));r.classList.toggle('late',act&&late);
    if(v)v.textContent=i===ONLM.me?_T('you'):q.cpu&&!(S.tt100x&&S.tt100x.seat===i)?_T('CPU'):act&&T?(T.out?'⌛':tt100Fmt(T.left)):c.t?_T`${c.t} s`:''});
  tt100Edge(mine&&late&&!T.out);
  /* my last 5 s: one soft tick a second (my turn, or my own window's clock) */
  const D2=D&&D.seat===ONLM.me?D:null;const myLeft=D2?D2.left:mine&&T&&!T.pz&&!T.out?T.left:null;
  if(myLeft!=null&&myLeft>0&&myLeft<=5000){const s=Math.ceil(myLeft/1000);if(s!==TT100C.tickSec){TT100C.tickSec=s;tt100Tick()}}else TT100C.tickSec=-1;
  tt100DockTick(D)}
function tt100Edge(on){let w=document.getElementById('tt100edge');if(!on){if(w)w.hidden=true;return}
  if(!w){w=document.createElement('div');w.id='tt100edge';w.setAttribute('aria-hidden','true');w.innerHTML='<i class="e1"></i><i class="e2"></i><i class="e3"></i><i class="e4"></i>';document.body.appendChild(w)}w.hidden=false}
/* the tick: "marble coasters lightly clapping" — two short bright knocks, quiet, through the SFX bus (volume + mute) */
function tt100Tick(){try{const a=audSet();if(HEADLESS||!a.on||!a.sfx)return;if(!audInit())return;const c=AUD.ctx;if(c.state==='suspended'){try{c.resume()}catch(e){}}const t=c.currentTime+0.01,d=AUD.sfx;
  audNote(d,t,2350,0.025,'triangle',0.05,{a:0.002,r:0.04,lp:5200});audNote(d,t+0.028,3100,0.02,'sine',0.035,{a:0.002,r:0.035});audNoise(d,t,0.03,0.025,{f:4200,q:1.4});TT100C.ticks++}catch(e){}}
function tt100Click(e){const b=e.target.closest&&e.target.closest('[data-tt100v]');if(!b)return;e.preventDefault();e.stopPropagation();const V=TT100C.vote;if(!V)return;const yes=b.dataset.tt100v==='yes';
  if(!yes){TT100C.vote=null;return}V.sent=1;NET.req('match.vote100',{id:S.onl.lobby,seat:V.seat,yes:true}).then(r=>{if(TT100C.vote!==V)return;V.res=r&&r.dropped?_T('Handed to a CPU.'):_T`Your vote is in · ${(r&&r.votes)|0} of ${(r&&r.need)|0}`}).catch(err=>{if(TT100C.vote===V)V.res=errText92(err)})}

/* ---------------- 2b: my window docked beside the board ---------------- */
function tt100Dock(O,opt){const m=document.getElementById('modal'),box=document.getElementById('mboxEl');if(!m||!box)return;const o=opt||{};
  const dock=!(o.full||o.wide||o.xwide);m.classList.remove('dock100','sheet100');if(dock)tt100DockPlace();
  let h=document.getElementById('dk100');if(h)h.remove();h=document.createElement('div');h.id='dk100';h.dataset.d=O.d;
  const n=O.step;const dots=Array.from({length:n},(_,i)=>`<i class="${i<n-1?'ok':'cur'}"></i>`).join('');
  const bs=O.buttons||[];const di=bs.findIndex(b=>b&&b.value===O.def);const defL=di>=0?tt100Strip(bs[di].label):_T('close');
  h.innerHTML=`<div class="dk100h"><b>${_T`Step ${n}`}</b><span class="dots">${dots}</span>${O.clock?`<span class="clk100"><span class="fc100 sm">${tt100Ring()}</span><b class="s"></b></span>`:''}</div>${O.clock?`<div class="dk100f"><div class="bar100"><i></i></div><small>${_T`No answer in <b class="s2"></b> → ${esc(defL)}`}</small></div>`:''}`;
  box.insertBefore(h,box.firstChild);if(di>=0){const btn=box.querySelector(`#mBtns [data-mi="${di}"],#pickgrid [data-mi="${di}"]`);if(btn){btn.classList.add('def100');btn.setAttribute('data-def100',_T('default'))}}}
function tt100DockPlace(){const m=document.getElementById('modal');const side=document.querySelector('.side');if(!m)return;
  if(tt100Phone()||!side||!side.offsetParent){m.classList.remove('dock100');m.classList.add('sheet100');return}m.classList.remove('sheet100');m.classList.add('dock100');const r=side.getBoundingClientRect();const tp=document.getElementById('tt100');const tb=tp&&!tp.hidden&&tp.parentElement===side?tp.getBoundingClientRect().bottom+6:r.top;
  m.style.setProperty('--dkx',Math.round(r.left)+'px');m.style.setProperty('--dkw',Math.round(r.width)+'px');m.style.setProperty('--dky',Math.max(8,Math.round(Math.min(tb,window.innerHeight*0.5)))+'px')}
function tt100DockTick(D){const h=document.getElementById('dk100');if(!h)return;const O=TT100C.open;if(!O||String(O.d)!==h.dataset.d||!D||D.d!==O.d)return;const fr=Math.max(0,Math.min(1,D.left/D.total));
  const g=h.querySelector('.rg100 .fg');if(g)g.setAttribute('stroke-dashoffset',(TT_C*(1-fr)).toFixed(1));const s=h.querySelector('.s');if(s)s.textContent=tt100Fmt(D.left);
  const s2=h.querySelector('.s2');if(s2)s2.textContent=tt100Fmt(D.left);const b=h.querySelector('.bar100 i');if(b)b.style.width=(fr*100).toFixed(1)+'%';h.classList.toggle('late',D.left<=5000)}
/* the dock ends with its window */
{const m=document.getElementById('modal');if(m&&typeof MutationObserver==='function')new MutationObserver(()=>{if(m.hidden){m.classList.remove('dock100','sheet100');const h=document.getElementById('dk100');if(h)h.remove()}}).observe(m,{attributes:true,attributeFilter:['hidden']})}
window.addEventListener('resize',()=>{const m=document.getElementById('modal');if(m&&(m.classList.contains('dock100')||m.classList.contains('sheet100'))&&!m.hidden)tt100DockPlace()});

/* ---------------- 7a: the room's Turn timer ---------------- */
if(typeof onlRoomHTML80==='function'){const base=onlRoomHTML80;onlRoomHTML80=function(L,grey){let h=base.apply(this,arguments);try{if(!L||typeof h!=='string')return h;tt100Lob(L);const c=ONLC.ttOf100(L);
    const opt=v=>`<option value="${v}" ${(L.turnT|0)===v?'selected':''}>${v?_T`${v} s`:_T('Off')}</option>`;
    const sel=L.ranked?`<label class="tt100r">${_T`⏱ Turn timer`}<span class="lk100">${_T`🔒 60 s · decisions 20 s`}</span></label>`
      :`<label class="tt100r" title="${_T`With a timer on, each decision gets 20 s; time out → the default answer, a turn out of time → the CPU finishes it.`}">${_T`⏱ Turn timer`}<select class="tin" data-onlrs="turnT">${ONLC.TT100.TURNS.map(opt).join('')}</select></label>`;
    if(h.indexOf('<div class="r80-set">')>=0)h=h.replace('<div class="r80-set">','<div class="r80-set">'+sel);
    else if(h.indexOf('<div class="r80-rules rc-sub">')>=0)h=h.replace('<div class="r80-rules rc-sub">',`<div class="r80-rules rc-sub"><span class="tt100r">${c.t?_T`⏱ ${c.t} s turns · ${c.d} s decisions`:_T('⏱ No turn timer')}</span> · `)}catch(e){}return h}}

/* ---------------- the mock server (as server/src/routes.js "v1.0 TURN TIMERS") ---------------- */
if(typeof MOCK_ROUTES!=='undefined'){
  {const base=MOCK_ROUTES['lobby.set'];if(base)MOCK_ROUTES['lobby.set']=(w,d,me)=>{if(d&&d.turnT!=null&&typeof mockLobby80==='function'){const L=mockLobby80(w,d.id);if(L){const why=ONLC.roomSet(L,me,{turnT:d.turnT},Date.now());if(why)throw new Error(why);if(typeof mockUpd80==='function')mockUpd80(w,L)}}
    const x={...(d||{})};delete x.turnT;return base(w,x,me)}}
  const mLive=(L,M)=>L.players.map(p=>p.id).concat((L.stands||[]).map(s=>s.id)).filter(a=>!(M.dropped||{})[a]&&!(M.abandoned||{})[a]);
  const mCfg=(L,M)=>{if(!M.tt100)M.tt100=ONLC.ttOf100(L);const o=M.tt100.t?tt100Test():null;return o||M.tt100};
  const mIn=(id,M,inp)=>{const x={...inp,from:'server',seq:M.inputs.length};M.inputs.push(x);mockPush('match.input',{id,in:x});return x};
  const mStat=(M,c,t)=>{const o={on:!!c.t,t:c.t,d:c.d,now:t};const tc=M.tc100,dc=M.dc100;if(tc)o.tc={t:tc.t,seat:tc.seat,left:tc.pz?null:Math.max(0,tc.at+c.t*1000+(tc.x||0)-t),pz:!!tc.pz};
    if(dc&&!(M.lk100||{})['DEC#'+dc.d])o.dc={d:dc.d,seat:dc.seat,left:Math.max(0,dc.at+c.d*1000-t)};return o};
  const mLock=(M,k,v)=>{M.lk100=M.lk100||{};if(M.lk100[k])return false;M.lk100[k]=v||1;return true};
  const mUnpause=(M,dc,t)=>{const tc=M.tc100;if(tc&&tc.pz&&dc&&tc.t===dc.t){tc.x=(tc.x||0)+t-tc.pz;tc.pz=null}};
  function mEval(id,L,M){const c=mCfg(L,M);if(!c.t||M.status==='done'||L.status!=='live')return;const t=Date.now();const dc=M.dc100,tc=M.tc100;
    if(dc&&t>=dc.at+c.d*1000+ONLC.TT100.GRACE&&mLock(M,'DEC#'+dc.d,'server')){mIn(id,M,{k:'dto',seat:dc.seat,d:dc.d});mUnpause(M,dc,t)}
    if(tc&&!tc.pz&&!tc.end&&t>=tc.at+c.t*1000+(tc.x||0)+ONLC.TT100.GRACE&&mLock(M,'TO#'+tc.t,{seat:tc.seat})){M.toc100=M.toc100||{};const n=M.toc100[tc.seat]=(M.toc100[tc.seat]|0)+1;mIn(id,M,{k:'timeout',seat:tc.seat,t:tc.t,n})}}
  const mGet=(w,d,me)=>{const L=w.lobbies[d.id],M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));if(!mLive(L,M).includes(me)||mockSeat(L,me)<0||mockSeat(L,me)>=L.seats)throw new Error(_T('Not your match.'));return [L,M]};
  Object.assign(MOCK_ROUTES,{
    'match.clock':(w,d,me)=>{const [L,M]=mGet(w,d,me);const c=mCfg(L,M);const t=Date.now();if(!c.t||L.status!=='live')return {...mStat(M,c,t),off:1};
      const seat=d.seat|0;const who=L.players[seat]&&L.players[seat].id;const live=who&&mLive(L,M).includes(who);
      if(d.kind==='turn'&&live){const tn=d.t|0;if((!M.tc100||tn>M.tc100.t)&&mLock(M,'CLK#t'+tn)){M.tc100={t:tn,seat,at:t,x:0,pz:null};mockPush('match.clock100',{id:d.id,...mStat(M,c,t)})}}
      else if(d.kind==='end'){const tn=d.t|0;if(M.tc100&&M.tc100.t===tn)M.tc100.end=1}
      else if(d.kind==='dec'&&live){const dn=d.d|0;if((!M.dc100||dn>M.dc100.d)&&mLock(M,'CLK#d'+dn)){M.dc100={d:dn,seat,at:t,t:d.t|0};const tc=M.tc100;if(tc&&tc.seat!==seat&&tc.t===(d.t|0)&&!tc.pz&&!tc.end)tc.pz=t;mockPush('match.clock100',{id:d.id,...mStat(M,c,t)})}}
      mEval(d.id,L,M);return mStat(M,c,Date.now())},
    'match.tick':(w,d,me)=>{const L=w.lobbies[d.id],M=w.matches[d.id];if(!L||!M)throw new Error(_T('No such match.'));if(mockSeat(L,me)<0)throw new Error(_T('Not your match.'));mEval(d.id,L,M);return mStat(M,mCfg(L,M),Date.now())},
    'match.vote100':(w,d,me)=>{const [L,M]=mGet(w,d,me);const seat=d.seat|0;const who=L.players[seat]&&L.players[seat].id;if(!who||who===me)throw new Error(_T('No one to name.'));
      if((M.dropped||{})[who]||(M.abandoned||{})[who])return {dropped:true,votes:0,need:0};if(((M.toc100||{})[seat]|0)<ONLC.TT100.DROP_AFTER)throw new Error(_T('Only after a second timeout.'));
      M.votes100=M.votes100||{};const V=M.votes100[seat]=M.votes100[seat]||{};V[me]=!!d.yes;const others=mLive(L,M).filter(a=>a!==who&&mockSeat(L,a)<L.seats);
      const votes=others.filter(a=>V[a]).length,need=ONLC.dropNeed100(others.length);if(votes<need)return {votes,need,dropped:false};
      M.dropped=M.dropped||{};M.dropped[who]=true;const inp=mIn(d.id,M,{k:'drop',seat,tt:1,until:Date.now()+ONLC.RECLAIM_MS});try{if(typeof mockRclMark84==='function')mockRclMark84(w,L,M,who,seat,inp.until)}catch(e){}return {votes,need,dropped:true}}});
  /* answers race the clocks: one lock a decision; a late turn move is voided */
  {const base=MOCK_ROUTES['match.input'];MOCK_ROUTES['match.input']=(w,d,me)=>{const raw=(d&&d.in)||{};if(raw.k==='timeout'||raw.k==='dto')throw new Error(_T('That seat is not yours.'));
    const L=w.lobbies[d&&d.id],M=w.matches[d&&d.id];if(L&&M&&mCfg(L,M).t&&(raw.seat|0)===mockSeat(L,me)){
      if(raw.k==='modal'&&raw.d!=null){if(!mLock(M,'DEC#'+(raw.d|0),me)){const v=mIn(d.id,M,{k:'void'});return {seq:v.seq,late:1}}if(M.dc100&&M.dc100.d===(raw.d|0))mUnpause(M,M.dc100,Date.now())}
      else if((raw.k==='tile'||raw.k==='act')&&raw.tn!=null){const X=(M.lk100||{})['TO#'+(raw.tn|0)];if(X&&X.seat===(raw.seat|0)){const v=mIn(d.id,M,{k:'void'});return {seq:v.seq,late:1}}}}
    return base(w,d,me)}}}

/* a late turn move of mine (the server voided it): my arena is out of step — fetch the others' */
{const base=NET.req;NET.req=function(t,d){const pr=base.apply(this,arguments);if(t==='match.input'&&d&&d.in&&(d.in.k==='tile'||d.in.k==='act')&&pr&&typeof pr.then==='function')
  pr.then(r=>{try{if(r&&r.late&&onlmOn()&&!ONLM.resyncing){const o=tt100Live().find(i=>i!==ONLM.me);if(typeof mToast==='function')mToast(_T('⌛ Too late — the CPU finished your turn.'));if(o!=null)onlmResync({seq:r.seq,seat:o,k:'late100'})}}catch(e){}}).catch(()=>{});return pr}}

{const st=document.createElement('style');st.id='tt100css';st.textContent=`
#tt100{margin:0 0 8px;border:1px solid var(--line2,#4a3826);border-radius:8px;background:var(--panel2,#211810);padding:8px 9px;color:var(--bone,#f3e6c4);font-size:13px}
#tt100[hidden]{display:none}
#tt100 .tp100{display:flex;align-items:center;gap:9px}
#tt100 .fc100{position:relative;display:inline-grid;place-items:center;flex:none;width:48px;height:48px}
#tt100 .fc100.sm{width:28px;height:28px}
#tt100 .fc100 .rg100,#dk100 .fc100 .rg100{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.rg100 circle{fill:none;stroke-width:3.2}.rg100 .bg{stroke:#0d0906}.rg100 .fg{stroke:var(--gold,#d6ab4c);transition:stroke-dashoffset .2s linear}
#tt100 .f100{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;overflow:hidden;background:#140e0a}
#tt100 .fc100.sm .f100{width:22px;height:22px}#tt100 .fc100.sm .f100 .tkfig{transform:scale(.62)}
#tt100 .fc100 .fslot{display:grid;place-items:center}
#tt100 .num{position:absolute;inset:0;display:grid;place-items:center;font:600 24px/1 var(--display,serif);color:#fff1d8;text-shadow:0 2px 0 #5a160f,0 0 10px #e0503ecc;pointer-events:none}
#tt100.late .tp100 .fslot{opacity:.15}
#tt100 .nm100{min-width:0;display:flex;flex-direction:column;line-height:1.15}
#tt100 .nm100 b{font:400 15px var(--display,serif);color:var(--gold2,#e8c96a);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tt100 .nm100 small{color:var(--muted,#bfae8f);font-size:11px}
#tt100 .t100{margin-left:auto;font:600 17px var(--mono,monospace);white-space:nowrap}
#tt100 .bar100{height:5px;border-radius:3px;background:#0d0906;margin:7px 0 2px;overflow:hidden}
#tt100 .bar100 i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,var(--gold,#d6ab4c),var(--gold2,#e8c96a));transition:width .2s linear}
#tt100.noclk .bar100,#tt100.noclk .t100{display:none}
#tt100 .tp100:not(.mine) ~ .bar100 i{background:linear-gradient(90deg,#6c7f8a,#9fb3bd)}
#tt100.late .tp100 .rg100 .fg,#tt100 .s100.late .rg100 .fg{stroke:#e0503e}#tt100.late .t100{color:#f07a5c}#tt100.late .bar100 i{background:linear-gradient(90deg,#e0503e,#f07a5c)}
#tt100.pz .t100{color:var(--muted,#bfae8f)}
#tt100 .ch100{display:flex;align-items:center;gap:6px;margin-top:6px;padding:5px 7px;border-radius:6px;background:#1c1520;font-size:12.5px}
#tt100 .ch100 .what{color:var(--dim,#a3907a);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#tt100 .ch100 .dt100{margin-left:auto;font:12px var(--mono,monospace);color:#c9a7e8}
#tt100 .dots100{display:inline-flex;gap:3px}#tt100 .dots100 i{width:5px;height:5px;border-radius:50%;background:#c9a7e8;animation:dt100 1.2s infinite}
#tt100 .dots100 i:nth-child(2){animation-delay:.2s}#tt100 .dots100 i:nth-child(3){animation-delay:.4s}
@keyframes dt100{0%,100%{opacity:.3}50%{opacity:1}}body.calm #tt100 .dots100 i,body.idle92 #tt100 .dots100 i{animation:none}
#tt100 .vt100{margin-top:7px;border:1px solid var(--gold,#d6ab4c);border-radius:7px;padding:7px 8px;background:#2a1f17}
#tt100 .vt100 b{color:var(--gold2,#e8c96a)}#tt100 .vt100 p{margin:3px 0 6px;font-size:12px;color:var(--muted,#bfae8f)}#tt100 .vb100{display:flex;gap:6px}
#tt100 .st100{display:flex;flex-direction:column;gap:3px;margin-top:7px}
#tt100 .s100{display:flex;align-items:center;gap:7px;font-size:12.5px;padding:2px 4px;border-radius:6px}
#tt100 .s100.on{background:#2c2015}#tt100 .s100.out{opacity:.45}
#tt100 .s100 .n{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#tt100 .s100 .v{margin-left:auto;font:11px var(--mono,monospace);color:var(--dim,#a3907a);white-space:nowrap}
#tt100.ph100{margin:0 0 6px;padding:5px 8px}#tt100.ph100 .tp100{gap:7px}#tt100.ph100 .fc100.big{width:40px;height:40px}#tt100.ph100 .f100{width:30px;height:30px}
#tt100.ph100 .bar100{margin:4px 0 0}
body.tt100on #onlWait{display:none!important}
#tt100edge[hidden]{display:none}#tt100edge i{position:fixed;pointer-events:none;z-index:55;background:#e0503e;opacity:.5;box-shadow:0 0 14px 4px #e0503e88}
#tt100edge .e1{left:0;right:0;top:0;height:5px}#tt100edge .e2{left:0;right:0;bottom:0;height:5px}#tt100edge .e3{top:0;bottom:0;left:0;width:5px}#tt100edge .e4{top:0;bottom:0;right:0;width:5px}
body:not(.calm) #tt100edge i{animation:edge100 1s ease-in-out infinite}@keyframes edge100{0%,100%{opacity:.25}50%{opacity:.6}}body.idle92 #tt100edge i{animation:none}
#modal.dock100{inset:auto;left:var(--dkx,auto);top:var(--dky,70px);width:var(--dkw,420px);right:auto;bottom:auto;max-height:calc(100vh - var(--dky,70px) - 10px);background:none;padding:0;align-items:flex-start;justify-content:stretch;pointer-events:none;display:flex}
#modal.dock100[hidden]{display:none}
#modal.dock100 .mbox{pointer-events:auto;max-width:none!important;width:100%!important;height:auto!important;max-height:calc(100vh - var(--dky,70px) - 10px);padding:12px 14px;border-radius:9px;box-shadow:0 10px 30px #000a}
#modal.sheet100{inset:auto 0 0 0;max-height:56vh;background:none;padding:0;align-items:flex-end;pointer-events:none;display:flex}#modal.sheet100[hidden]{display:none}
#modal.sheet100 .mbox{pointer-events:auto;max-width:none!important;width:100%!important;height:auto!important;max-height:56vh!important;border-radius:12px 12px 0 0!important;border:0!important;border-top:2px solid var(--gold,#d6ab4c)!important;padding:10px 14px!important;box-shadow:0 -10px 30px #000a!important}
#dk100{margin:-2px 0 8px}#dk100 .dk100h{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--muted,#bfae8f)}
#dk100 .dots{display:inline-flex;gap:4px}#dk100 .dots i{width:9px;height:9px;border-radius:50%;background:#3a2a1c;border:1px solid #5a4630}
#dk100 .dots i.ok{background:var(--teal,#3fa59a);border-color:var(--teal,#3fa59a)}#dk100 .dots i.cur{background:var(--gold2,#e8c96a);border-color:var(--gold2,#e8c96a)}
#dk100 .clk100{margin-left:auto;display:flex;align-items:center;gap:5px;font:600 14px var(--mono,monospace);color:var(--bone,#f3e6c4)}
#dk100 .fc100{position:relative;display:inline-block;width:24px;height:24px}
#dk100 .dk100f{margin-top:6px;font-size:11.5px;color:var(--dim,#a3907a)}#dk100 .bar100{height:4px;border-radius:2px;background:#0d0906;overflow:hidden;margin-bottom:3px}
#dk100 .bar100 i{display:block;height:100%;background:linear-gradient(90deg,var(--gold,#d6ab4c),var(--gold2,#e8c96a))}
#dk100.late .rg100 .fg{stroke:#e0503e}#dk100.late .bar100 i{background:#e0503e}#dk100.late .s{color:#f07a5c}
#modal .def100{outline:2px solid var(--gold,#d6ab4c);outline-offset:1px;position:relative}
#modal .def100::after{content:attr(data-def100);position:absolute;right:6px;top:-8px;font:10px var(--mono,monospace);color:var(--gold2,#e8c96a);background:#1a120d;border:1px solid var(--gold,#d6ab4c);border-radius:4px;padding:0 4px;line-height:14px}
.tt100r .lk100{font:12px var(--mono,monospace);color:var(--muted,#bfae8f);margin-left:6px}`;document.head.appendChild(st)}

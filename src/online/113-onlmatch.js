/* =====================================================================
   113-ONLMATCH · ONLINE MATCHES IN LOCKSTEP (phase 2)
   =====================================================================
   Every client runs the same engine. The server holds the seed, orders the inputs and keeps wallets and deaths.
   • Opening: only the host runs startEvent. At the first beginTurn the host sends a snapshot (matchSnapshot, ~15 KB) —
     the other clients load it (onlJoinMatch) and begin the same turn. Per-browser data (crowd cache, omens, cached
     openings) therefore never splits the match.
   • Inputs: every human decision is recorded where its owner makes it and replayed everywhere else, in server order:
       tile  — onTile(r,c) with S.mode and the Focus toggle;
       act   — an action-panel button (data-act + data-id/data-i), replayed by clicking a twin button;
       modal — the value a decision window resolved with (the owner sees it; others wait for the value).
     v1.01 (326-v101ask): a decision asked through the question port carries its KIND and decision number (kd, ds) and both
     hashes of a window answer include them (onlmQHash) — no window title travels any more. Acts are applied through
     command() (the registry), the twin button only for an act nobody registered.
     Owner of a decision: the explicit humanCommand / stands override; else the HUMAN FIGHTER the question is asked of (ask's
     seat); else RESPONDER (defend / askCard), cur(), and when cur() is a CPU the lowest human seat. CPU offers of truce or
     trade to a human never happen online (06-ai filters them since v1.0); a stray one is declined by KIND on every client.
   • Not recorded: windows the player opens from the bars (a trusted click outside the board/actions/window, 300 ms — only
     for windows that did not come through ask(); a question of the rules is always recorded), rule pop-ups and the
     briefing (popRule, eventBriefing), anything after the event ends. Hotkeys are off online.
   • Desync guard: each input carries the owner's state hash taken just before it; a client whose hash differs asks
     that owner for a snapshot and reloads it (match.snapreq → match.snap).
   • Off-turn: the board and the action panel ignore real clicks; a banner says whose move it is.
   ===================================================================== */
const ONLM={own:new Set(),hlog:{},resyncs:0,on:false,me:-1,owners:[],next:0,q:[],pend:null,replay:0,info:0,uiAt:0,override:null,sent:0,lastHash:'',waitT:0,resyncing:false};
const onlmOn=()=>!!(ONLM.on&&S&&S.onl&&!S.over);
function onlmSeatOf(p){return p?S.players.indexOf(p):-1}
function onlmHuman(i){return i>=0&&!!ONLM.owners[i]}
function onlmOwner(){if(ONLM.override!=null)return ONLM.override;if(typeof RESPONDER!=='undefined'&&RESPONDER)return onlmSeatOf(RESPONDER);
  const c=cur();if(c&&!c.cpu)return onlmSeatOf(c);return ONLM.owners.findIndex(Boolean)}
/* who may act on the board right now: never a CPU's turn (the lowest-human fallback is for windows only) */
function onlmActor(){if(ONLM.override!=null)return ONLM.override;if(typeof RESPONDER!=='undefined'&&RESPONDER)return onlmSeatOf(RESPONDER);const c=cur();return c&&!c.cpu?onlmSeatOf(c):-1}
/* v1.01: the owner of an asked question — an override (humanCommand, the stands) wins; else the human fighter it is asked of */
function onlmAskOwner(Q){if(ONLM.override==null&&Q&&!Q.local&&Q.seat>=0&&Q.seat<onlmFighters()&&onlmHuman(Q.seat))return Q.seat;return onlmOwner()}
/* v1.01: a window's hash = the state + the question (kind # decision number); old-style windows (no ask) = the state */
function onlmQHash(Q){const h=onlHash();return Q&&!Q.local&&h?h+'|'+Q.kind+'#'+Q.ds:h}
function onlmMine(){if(ONLM.me<0)return false;return onlmActor()===ONLM.me||(!!CUR_MODAL&&onlmOwner()===ONLM.me)}
/* a decision seat's name: a fighter, or a ticket holder in the stands (seats after the fighters) */
function onlmName(i){const p=S.players[i];if(p)return p.name;const t=((S.onl&&S.onl.stands)||[])[i-((S.onl&&S.onl.fighters)||S.players.length)];return t?t.name+_T(' (in the stands)'):_T('Another lanista')}
function onlHash(){try{const x=JSON.stringify([S.turnNo,S.rotation,S.ri,RNG&&RNG.s,S.players.map(p=>[p.r,p.c,p.alive?1:0,p.exited?1:0,Math.round(p.cf||0),p.coin,p.hp,p.ap,p.keys,(p.items||[]).length,p.wR&&p.wR.key,p.wL&&p.wL.key]),(S.npcs||[]).map(n=>[n.t,n.r,n.c,n.hp,n.alive?1:0])]);return 'h'+hashStr(x)}catch(e){return ''}}
/* ---------------- sending ---------------- */
function onlmSend(inp){inp.h=onlHash();ONLM.hlog['n'+(ONLM.sent+1)]=inp.k==='modal'?inp.pre:inp.h;inp.seat=ONLM.me;inp.n=++ONLM.sent;ONLM.inflight=(ONLM.inflight||0)+1;NET.req('match.input',{id:S.onl.lobby,in:inp}).then(r=>{ONLM.inflight--;if(r&&Number.isInteger(r.seq)&&r.seq>=ONLM.next){ONLM.own.add(r.seq);onlmPump()}}).catch(e=>{ONLM.inflight--;if(typeof mToast==='function')mToast(_T('⚠ The server did not take that move: ')+esc(errText92(e)))})}
/* board clicks */
{const base=onTile;onTile=function(r,c){if(!onlmOn()||ONLM.replay)return base.apply(this,arguments);if(!onlmMine())return;
  const p=cur();onlmSend({k:'tile',r,c,mode:S.mode,focus:p&&p.focusRoll?1:0});return base.apply(this,arguments)}}
/* action-panel buttons: record the real click, then let the panel handle it; replays click a twin button */
const ONLM_UI_ACTS=new Set(['inspect','trophies']);
document.addEventListener('click',e=>{if(!onlmOn())return;const b=e.target.closest&&e.target.closest('[data-act]');
  if(!b){if(e.isTrusted&&!e.target.closest('#modal,canvas,#onlWait'))ONLM.uiAt=Date.now();return}
  if(!e.isTrusted||ONLM.replay)return;const k=b.dataset.act;if(/^m-/.test(k)||ONLM_UI_ACTS.has(k))return;
  if(!onlmMine()){e.preventDefault();e.stopImmediatePropagation();onlmNudge();return}
  onlmSend({k:'act',a:k,id:b.dataset.id??null,i:b.dataset.i??null})},true);
/* the canvas: real clicks off-turn do nothing */
document.addEventListener('click',e=>{if(!onlmOn()||!e.isTrusted||ONLM.replay)return;if(e.target&&e.target.tagName==='CANVAS'&&!onlmMine()){e.preventDefault();e.stopImmediatePropagation();onlmNudge()}},true);
document.addEventListener('pointerdown',e=>{if(!onlmOn()||!e.isTrusted)return;if(e.target&&e.target.tagName==='CANVAS'&&!onlmMine()){e.stopImmediatePropagation()}},true);
window.addEventListener('keydown',e=>{if(!onlmOn()||!e.isTrusted)return;const t=document.activeElement;if(t&&(['INPUT','TEXTAREA','SELECT'].includes(t.tagName)||t.isContentEditable))return;if(CUR_MODAL)return;e.stopImmediatePropagation()},true);
/* windows: decisions are recorded / awaited; rule pop-ups, the briefing and bar windows stay local */
for(const nm of ['popRule','eventBriefing']){try{const base=eval(nm);if(typeof base!=='function')continue;eval(`${nm}=async function(){ONLM.info++;try{return await base.apply(this,arguments)}finally{ONLM.info--}}`)}catch(e){}}
{const base=humanCommand;humanCommand=async function(p){const prev=ONLM.override;if(onlmOn())ONLM.override=onlmSeatOf(p);try{return await base.apply(this,arguments)}finally{ONLM.override=prev}}}
{const base=modal;modal=function(title,body,buttons,opt){const Q=typeof askNow==='function'?askNow():null;const eng=!!(Q&&!Q.local);
  if(!onlmOn()||ONLM.info>0||(!eng&&Date.now()-ONLM.uiAt<300))return base.apply(this,arguments);
  const t=String(title||'');const c=cur();
  /* a CPU offering a truce or a trade to a human: never asked online since v1.0 (06-ai); a stray one is declined on every client — by KIND, never the title */
  if(Q&&(Q.kind==='truceOffer'||Q.kind==='tradeOffer')&&c&&c.cpu){const no=(buttons||[]).find(b=>b&&b.value===0)||(buttons||[]).slice(-1)[0];return Promise.resolve(no?no.value:null)}
  const own=onlmAskOwner(Q);if(!onlmHuman(own))return base.apply(this,arguments);
  /* v1.0 (290-v100tt): decision numbers, one-button notices, the docked step panel and the decision clocks — a handler that returns a promise takes the window */
  if(typeof onlmDec100==='function'){const r=onlmDec100(own,t,title,body,buttons,opt,base,this);if(r)return r}
  /* a seat whose lanista abandoned: every client answers that seat's windows with the default (the same value everywhere) */
  if(ONLM.left&&ONLM.left[own]!=null){const def=opt&&('close' in opt)?opt.close:((buttons||[]).slice(-1)[0]||{}).value??null;return Promise.resolve(def)}
  if(own===ONLM.me){const pre=onlmQHash(Q);const pr=base.apply(this,arguments);if(own>=onlmFighters())onlmAutoPass(buttons,opt);return Promise.resolve(pr).then(v=>{const inp={k:'modal',v:v===undefined?null:v,...onlmQTag(Q,t)};inp.pre=pre;onlmSend(inp);return v})}
  const def=opt&&('close' in opt)?opt.close:((buttons||[]).slice(-1)[0]||{}).value??null;
  return new Promise(res=>{ONLM.pend={res,t,seat:own,at:Date.now(),def,kd:Q&&!Q.local?Q.kind:null};onlmWaitShow();onlmPump()})}}
/* v1.01: what a window answer carries about its question — kind + decision number (asked), else a title slice (an old-style window) */
function onlmQTag(Q,t){return Q&&!Q.local?{kd:Q.kind,ds:Q.ds}:{t:String(t||'').slice(0,60)}}
/* ---------------- receiving ---------------- */
NET.on('match.input',d=>{if(!onlmOn()||!d||d.id!==S.onl.lobby)return;const inp=d.in;if(inp.from===ONL.acct.id||inp.seq<ONLM.next)return;if(!ONLM.q.some(x=>x.seq===inp.seq))ONLM.q.push(inp);ONLM.q.sort((a,b)=>a.seq-b.seq);onlmPump()});
function onlmReady(inp){if(!S||S.over)return false;if(inp.k==='void'||inp.k==='abandon')return true;if(inp.k==='drop')return ONLM.pend?ONLM.pend.seat===inp.seat:(!S.busy&&!CUR_MODAL&&['choice','action','command'].includes(S.phase)&&onlmActor()===inp.seat);if(inp.k==='modal')return !!ONLM.pend;
  return !S.busy&&!CUR_MODAL&&!ONLM.pend&&['choice','action','command'].includes(S.phase)&&onlmActor()===inp.seat}
let ONLM_PUMP=0;
function onlmPump(){clearTimeout(ONLM_PUMP);if(!onlmOn()||ONLM.resyncing)return;
  for(;;){while(ONLM.own.has(ONLM.next)&&!ONLM.ownHold&&!(ONLM.ownq&&ONLM.ownq.has(ONLM.next))){ONLM.own.delete(ONLM.next);ONLM.next++}if(!(ONLM.q.length&&ONLM.q[0].seq===ONLM.next))break;const inp=ONLM.q[0];if(!onlmReady(inp)){ONLM_PUMP=setTimeout(onlmPump,120);onlmWaitShow();return}
    ONLM.q.shift();ONLM.next=inp.seq+1;
    if(inp.k==='void'){continue}if(inp.k==='drop'){onlmDrop(inp);continue}if(inp.k==='abandon'){onlmAbandonMark(inp);continue}
    const mine=inp.k==='modal'?inp.pre:onlHash();if(inp.k==='modal'?inp.pre&&mine!==onlmPendHash():inp.h&&mine!==inp.h){onlmResync(inp);return}
    ONLM.hlog['s'+inp.seq]=inp.k==='modal'?onlmPendHash():onlHash();onlmApply(inp)}
  if(ONLM.q.length&&ONLM.q[0].seq>ONLM.next)onlmCatchUp();onlmWaitShow()}
function onlmPendHash(){return ONLM.pend&&ONLM.pend.h||onlHash()}
function onlmApply(inp){ONLM.replay++;try{
  if(inp.k==='modal'){const P=ONLM.pend;ONLM.pend=null;onlmWaitShow();P.res(inp.v);return}
  if(inp.k==='tile'){command(inp.seat,{k:'tile',r:inp.r,c:inp.c,mode:inp.mode,focus:inp.focus});return}
  if(inp.k==='act'){command(inp.seat,{k:'act',a:inp.a,id:inp.id,i:inp.i})}
}finally{ONLM.replay--}setTimeout(onlmPump,30)}
/* the modal's own hash is taken when it opens */
{const base=modal;modal=function(){if(onlmOn()&&!ONLM.replay){const h=onlmQHash(typeof askNow==='function'?askNow():null);const r=base.apply(this,arguments);if(ONLM.pend&&!ONLM.pend.h)ONLM.pend.h=h;return r}return base.apply(this,arguments)}}
async function onlmCatchUp(){if(ONLM.catching)return;ONLM.catching=true;try{const g=await NET.req('match.get',{id:S.onl.lobby,from:ONLM.next});for(const inp of g.inputs||[])if(inp.from!==ONL.acct.id&&inp.seq>=ONLM.next&&!ONLM.q.some(x=>x.seq===inp.seq))ONLM.q.push(inp);
  for(const inp of g.inputs||[])if(inp.from===ONL.acct.id&&inp.seq>=ONLM.next)ONLM.own.add(inp.seq);ONLM.q.sort((a,b)=>a.seq-b.seq)}catch(e){}finally{ONLM.catching=false}onlmPump()}
/* own inputs advance the shared counter too (the server echoes them back to everyone) */
NET.on('match.input',d=>{if(!onlmOn()||!d||d.id!==S.onl.lobby)return;if(d.in.from===ONL.acct.id&&d.in.seq>=ONLM.next){ONLM.own.add(d.in.seq);onlmPump()}});
/* ---------------- a player away too long: a CPU takes the seat, here, on every client ---------------- */
function onlmDrop(inp){const p=S.players[inp.seat];const sp=!p&&(S.spect||[]).find(s=>s.onlIdx===inp.seat);if(!p&&!sp)return;ONLM.owners[inp.seat]=null;
  if(sp){sp.human=false;log(_T`🔌 <b>${esc(sp.name)}</b> left the stands.`)}else{p.cpu=true;log(_T`🔌 <b>${esc(p.name)}</b> left the arena — a CPU fights on in that seat (the Fate still waits).`,'big')}
  if(inp.seat===ONLM.me){ONLM.me=-1;if(typeof mToast==='function')mToast(_T('🔌 You were away too long — a CPU took your seat. Your gladiator still faces the Fate.'))}
  ONLM.replay++;try{if(ONLM.pend){const P=ONLM.pend;ONLM.pend=null;P.res(P.def)}else if(S.phase==='command'){command(inp.seat,{k:'act',a:'cmddone'})}else{endTurn()}}finally{ONLM.replay--}onlmWaitShow()}
/* waiting on someone for 3 minutes: ask the server to drop them (it only agrees if their connection really is gone) */
setInterval(()=>{if(!onlmOn()||S.onl.watch)return;const own=ONLM.pend?ONLM.pend.seat:onlmActor();if(!onlmHuman(own)||own===ONLM.me){ONLM.waitSince=0;return}
  if(ONLM.pend||!S.busy){if(!ONLM.waitSince||ONLM.waitFor!==own){ONLM.waitSince=Date.now();ONLM.waitFor=own}
    if(Date.now()-ONLM.waitSince>ONLC.AWAY_MS&&Date.now()-(ONLM.dropAt||0)>30000){ONLM.dropAt=Date.now();NET.req('match.drop',{id:S.onl.lobby,seat:own}).catch(()=>{})}}else ONLM.waitSince=0},5000);
/* ---------------- resync ---------------- */
function onlmResync(inp){ONLM.resyncs++;ONLM.lastResync={seq:inp.seq,k:inp.k,a:inp.a||inp.kd||inp.t||'',mine:inp.k==='modal'?onlmPendHash():onlHash(),theirs:inp.k==='modal'?inp.pre:inp.h,turn:S.turnNo,phase:S.phase,cur:cur()&&cur().name};ONLM.resyncing=true;ONLM.needAt=inp.seq;if(typeof mToast==='function')mToast(_T('🔄 Out of step with the others — fetching their arena…'));
  NET.req('match.snapreq',{id:S.onl.lobby,to:ONLM.owners[inp.seat],seq:inp.seq}).catch(()=>{});setTimeout(()=>{if(ONLM.resyncing){ONLM.resyncing=false;onlmPump()}},15000)}
/* a snapshot only at a settled point: a human's own decision, nothing resolving, every move so far applied (a freshly loaded
   client cannot resume a CPU's turn half-way, and must not replay a move this client already made) */
function onlmSettled(){return !S.busy&&!CUR_MODAL&&!ONLM.pend&&!ONLM.inflight&&!ONLM.own.size&&!ONLM.q.length&&['choice','action','command'].includes(S.phase)&&onlmActor()>=0}
NET.on('match.snapreq',d=>{if(!onlmOn()||d.id!==S.onl.lobby||d.to!==ONL.acct.id)return;const t0=Date.now();const send=()=>{if(!onlmOn())return;if(!onlmSettled()&&Date.now()-t0<60000){setTimeout(send,150);return}
  NET.req('match.snap',{id:S.onl.lobby,to:d.from,seq:ONLM.next,snap:matchSnapshot('online')}).catch(()=>{})};send()});
NET.on('match.snap',d=>{if(!S||!S.onl||d.id!==S.onl.lobby||d.to!==ONL.acct.id)return;const keep={...S.onl};onlmLoad(d.snap,keep);ONLM.next=d.seq;ONLM.q=ONLM.q.filter(x=>x.seq>=d.seq);ONLM.pend=null;ONLM.resyncing=false;onlmPump()});
function onlmLoad(snap,onl){try{matchSlotPut('onl',snap);const ok=matchLoad('onl');matchSlotDel('onl');S.onl={...onl};S.limits=S.limits?{...S.limits,min:0}:S.limits;return ok}catch(e){console.error(e);return false}}
/* ---------------- the opening ---------------- */
{const base=beginTurn;beginTurn=async function(){if(S&&S.onl&&!S.onl.opened){S.onl.opened=true;ONLM.on=true;ONLM.me=S.onl.seat;ONLM.owners=S.onl.owners||[];ONLM.next=0;ONLM.q=[];ONLM.pend=null;ONLM.sent=0;ONLM.own=new Set();
    if(S.limits)S.limits.min=0;if(S.onl.host){try{await NET.req('match.open',{id:S.onl.lobby,snap:matchSnapshot('online')})}catch(e){if(typeof mToast==='function')mToast('⚠ '+esc(errText92(e)))}}onlmWaitShow()}
  return base.apply(this,arguments)}}
async function onlJoinMatch(L,onl){if(typeof mToast==='function')mToast(_T('⚔ Waiting for the host to open the arena…'));let g=null;
  for(let i=0;i<150&&!(g&&g.open);i++){try{g=await NET.req('match.get',{id:L.id,from:0})}catch(e){}if(!(g&&g.open))await new Promise(r=>setTimeout(r,400))}
  if(!g||!g.open){if(typeof mToast==='function')mToast(_T('⚠ The host never opened the arena.'));return}
  onlmLoad(g.open,{...onl,opened:true});ONLM.on=true;ONLM.me=onl.seat;ONLM.owners=onl.owners;ONLM.next=0;ONLM.q=[];ONLM.pend=null;ONLM.sent=0;ONLM.own=new Set();
  for(const inp of g.inputs||[])if(inp.from!==ONL.acct.id)ONLM.q.push(inp);
  try{if(typeof menuHide==='function')menuHide()}catch(e){}S.startedAt=Date.now();later(()=>beginTurn(),60)}
/* ---------------- whose move ---------------- */
function onlmWaitShow(){clearTimeout(ONLM.waitT);ONLM.waitT=setTimeout(()=>{let el=document.getElementById('onlWait');const on=onlmOn();
  const own=on?(ONLM.pend?ONLM.pend.seat:onlmActor()):-1;const show=on&&onlmHuman(own)&&own!==ONLM.me&&(ONLM.pend||!S.busy);
  document.body.classList.toggle('onl-off',!!(on&&!onlmMine()));
  if(!show){if(el)el.hidden=true;return}if(!el){el=document.createElement('div');el.id='onlWait';document.body.appendChild(el)}
  el.innerHTML=`⏳ <b>${esc(onlmName(own))}</b> ${ONLM.pend?_T('is deciding'):_T('is on the move')}…`;el.hidden=false},80)}
function onlmNudge(){const el=document.getElementById('onlWait');if(el){el.classList.remove('nudge');void el.offsetWidth;el.classList.add('nudge')}}
{const base=render;render=function(){const r=base.apply(this,arguments);if(ONLM.on)onlmWaitShow();return r}}
{const base=gameOver;gameOver=async function(){const r=await base.apply(this,arguments);if(ONLM.on){ONLM.on=false;onlmWaitShow()}return r}}
{const st=document.createElement('style');st.textContent=`#onlWait{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:60;padding:8px 16px;border-radius:999px;background:rgba(20,14,8,.92);border:1px solid var(--gold,#e8c96a);color:#f3e6c4;font-size:14px;pointer-events:none}
#onlWait.nudge{animation:onlNudge .4s}@keyframes onlNudge{0%,100%{transform:translateX(-50%)}25%{transform:translateX(calc(-50% - 6px))}75%{transform:translateX(calc(-50% + 6px))}}
body.onl-off #actions{opacity:.55}`;document.head.appendChild(st)}
/* words of power stay offline */
{const base=cheatPrompt;cheatPrompt=function(){if(S&&S.onl&&!S.over){if(typeof mToast==='function')mToast(_T('🔑 Words of power have no voice in the online arena.'));return}return base.apply(this,arguments)}}

/* ---------------- the stands: ticket holders ---------------- */
function onlmFighters(){return (S.onl&&S.onl.fighters)||S.players.length}
/* a ticket holder who sits on a window too long watches the rotation instead (the others are waiting) */
function onlmAutoPass(buttons,opt){const m=CUR_MODAL;const v=opt&&('close' in opt)?opt.close:((buttons||[]).slice(-1)[0]||{}).value??null;
  setTimeout(()=>{if(CUR_MODAL&&CUR_MODAL===m&&onlmOn()){if(typeof mToast==='function')mToast(_T('⏳ The stands moved on — you watch this rotation.'));m.done(v)}},45000)}
/* every ticket holder takes an upkeep in seat order (the engine's own spectator turn, one owner at a time) */
{const base=humanSpectatorTurn;humanSpectatorTurn=async function(me){if(!onlmOn())return base.apply(this,arguments);
  /* the stands act in round 1 only, and never when the host closed them (v0.79) */
  if((S.onl&&S.onl.standsOff)||S.ri>0)return;
  for(const s of (S.spect||[]).filter(x=>x.human&&!x.gone&&x.onlIdx!=null)){if(!S||S.over)return;const prev=ONLM.override;ONLM.override=s.onlIdx;ONLM.specName=s.onlIdx===ONLM.me?null:s.name;
    try{await base.call(this,s)}finally{ONLM.override=prev;ONLM.specName=null}}}}
/* the engine words a human spectator as "you": on the other screens, name them */
{const base=log;log=function(h,c){if(ONLM.specName&&typeof h==='string'){const n=`<b>${esc(ONLM.specName)}</b>`;
  h=h.replace(/\bYou hurl\b/g,n+' hurls').replace(/\bYou throw\b/g,n+' throws').replace(/\bYou move\b/g,n+' moves').replace(/\bYou cheer\b/g,n+' cheers').replace(/\bYour stone\b/g,n+_T('’s stone')).replace(/\bYou collect\b/g,n+' collects').replace(/\byour chant\b/g,n+_T('’s chant'))}
  return base.call(this,h,c)}}
/* ---------------- 👁 watching a live match (read-only) ---------------- */
async function onlWatch(L){const r=await NET.req('match.watch',{id:L.id});const lob=r.lobby||L;const seats=onlSeatsFor(lob);
  const onl={lobby:lob.id,ranked:!!lob.ranked,seat:-1,owners:onlOwnersFor(lob,seats),host:false,watch:true,opened:true,stands:(lob.stands||[]).map(t=>({id:t.id,name:t.name})),fighters:lob.seats,team:!!lob.team};
  ONL.live=null;ONL.watching={id:lob.id,onl,buf:[],at:Date.now()};if(CUR_MODAL)CUR_MODAL.done('watch');
  if(typeof mToast==='function')mToast(_T`👁 Taking a seat to watch ${esc(onlEvName(lob.ev))}…`);
  /* a fresh snapshot from a fighter (or a ticket holder) is quicker than replaying the whole bout */
  const ask=(r.players||[]).concat(r.specs||[]);let k=0;const tryOne=()=>{const W=ONL.watching;if(!W||W.id!==lob.id||W.done)return;if(k>=ask.length){onlWatchReplay(lob.id);return}
    NET.req('match.snapreq',{id:lob.id,to:ask[k++],seq:0}).catch(()=>{});setTimeout(tryOne,7000)};tryOne()}
/* nobody answered: start from the opening and replay every move */
async function onlWatchReplay(id){const W=ONL.watching;if(!W||W.id!==id||W.done)return;let g=null;try{g=await NET.req('match.get',{id,from:0})}catch(e){}
  if(!g||!g.open){if(typeof mToast==='function')mToast(_T('⚠ That match has not opened yet — try again in a moment.'));ONL.watching=null;return}
  W.done=true;onlmLoad(g.open,W.onl);onlmWatchOn(0,(g.inputs||[]).concat(W.buf));try{if(typeof menuHide==='function')menuHide()}catch(e){}S.startedAt=Date.now();later(()=>beginTurn(),60)}
function onlmWatchOn(next,ins){ONLM.on=true;ONLM.me=-1;ONLM.owners=S.onl.owners;ONLM.next=next;ONLM.q=[];ONLM.pend=null;ONLM.sent=0;ONLM.own=new Set();ONLM.resyncing=false;
  for(const inp of ins)if(inp.seq>=next&&!ONLM.q.some(x=>x.seq===inp.seq))ONLM.q.push(inp);ONLM.q.sort((a,b)=>a.seq-b.seq);onlmWaitShow();setTimeout(onlmPump,200)}
NET.on('match.snap',d=>{const W=ONL.watching;if(!W||W.done||!d||d.id!==W.id||d.to!==ONL.acct.id)return;W.done=true;onlmLoad(d.snap,W.onl);onlmWatchOn(d.seq,W.buf);
  try{if(typeof menuHide==='function')menuHide()}catch(e){}log(W.seat?_T('⚔ You are back on the sand.'):_T('👁 You are watching from the free stands.'),'big');render()});
/* moves that arrive before the snapshot are kept for it */
NET.on('match.input',d=>{const W=ONL.watching;if(W&&!W.done&&d&&d.id===W.id&&d.in)W.buf.push(d.in)});
{const base=gameOver;gameOver=async function(){const w=S&&S.onl&&S.onl.watch;const r=await base.apply(this,arguments);if(w&&ONL.watching){NET.req('match.unwatch',{id:ONL.watching.id}).catch(()=>{});ONL.watching=null}return r}}

/* ---------------- 🚪 abandon (v0.79) ----------------
   The server orders an 'abandon' input; it only MARKS the seat (no state change), so it may land at any time. The seat is then
   taken off at a point every client reaches in the same state: that seat's next decision (its turn, or a window it owns).
   rule 'fate' → eliminated (the bout is over for them; in Ranked the server already applied the Damnatio death); 'cpu' → a CPU fights on. */
function onlmAbandonMark(inp){ONLM.left=ONLM.left||{};if(ONLM.left[inp.seat]!=null)return;ONLM.left[inp.seat]=inp.rule||'cpu';
  const p=S.players[inp.seat];if(p)log(_T`🚪 <b>${esc(p.name)}</b> abandoned the match${inp.rule==='fate'?(S.onl&&S.onl.ranked?_T(' — Damnatio.'):_T(' — out of the bout.')):_T(' — a CPU fights on in that seat.')}`,'big');
  if(inp.seat===ONLM.me){ONLM.me=-1}
  if(ONLM.pend&&ONLM.pend.seat===inp.seat){const P=ONLM.pend;ONLM.pend=null;P.res(P.def)}
  setTimeout(onlmLeftCheck,60)}
function onlmLeftCheck(){if(!onlmOn()||!ONLM.left)return;if(S.busy||CUR_MODAL||ONLM.pend||!['choice','action','command'].includes(S.phase))return;
  const c=cur();const i=onlmSeatOf(c);const rule=ONLM.left[i];if(rule==null||!c||c.cpu||!c.alive)return;if(ONLM.leftDone&&ONLM.leftDone[i])return;(ONLM.leftDone=ONLM.leftDone||{})[i]=1;
  ONLM.replay++;try{if(rule==='fate'){ONLM.owners[i]=null;c.cpu=true;try{eliminate(c,{type:'retire'})}catch(e){console.error(e)}render();endTurn()}
    else{c.cpu=true;ONLM.owners[i]=null;if(S.phase==='command'){command(i,{k:'act',a:'cmddone'})}else endTurn()}}
  finally{ONLM.replay--}onlmWaitShow()}
{const base=render;render=function(){const r=base.apply(this,arguments);if(ONLM.on&&ONLM.left)setTimeout(onlmLeftCheck,40);return r}}

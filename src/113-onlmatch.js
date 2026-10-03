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
     Owner of a decision: RESPONDER (defend / askCard), the gladiator in humanCommand, else cur(); when cur() is a CPU,
     the lowest human seat (e.g. the editor's truce decree). CPU offers of truce or trade to a human are declined
     on every client in v1 (the engine does not say which human was asked).
   • Not recorded: windows the player opens from the bars (a trusted click outside the board/actions/window, 300 ms),
     rule pop-ups and the briefing (popRule, eventBriefing), anything after the event ends. Hotkeys are off online.
   • Desync guard: each input carries the owner's state hash taken just before it; a client whose hash differs asks
     that owner for a snapshot and reloads it (match.snapreq → match.snap).
   • Off-turn: the board and the action panel ignore real clicks; a banner says whose move it is.
   ===================================================================== */
const ONLM={hlog:{},resyncs:0,on:false,me:-1,owners:[],next:0,q:[],pend:null,replay:0,info:0,uiAt:0,override:null,sent:0,lastHash:'',waitT:0,resyncing:false};
const onlmOn=()=>!!(ONLM.on&&S&&S.onl&&!S.over);
function onlmSeatOf(p){return p?S.players.indexOf(p):-1}
function onlmHuman(i){return i>=0&&!!ONLM.owners[i]}
function onlmOwner(){if(ONLM.override!=null)return ONLM.override;if(typeof RESPONDER!=='undefined'&&RESPONDER)return onlmSeatOf(RESPONDER);
  const c=cur();if(c&&!c.cpu)return onlmSeatOf(c);return ONLM.owners.findIndex(Boolean)}
function onlmMine(){return onlmOwner()===ONLM.me}
function onlHash(){try{const x=JSON.stringify([S.turnNo,S.rotation,S.ri,RNG&&RNG.s,S.players.map(p=>[p.r,p.c,p.alive?1:0,p.exited?1:0,Math.round(p.cf||0),p.coin,p.hp,p.ap,p.keys,(p.items||[]).length,p.wR&&p.wR.key,p.wL&&p.wL.key]),(S.npcs||[]).map(n=>[n.t,n.r,n.c,n.hp,n.alive?1:0])]);return 'h'+hashStr(x)}catch(e){return ''}}
/* ---------------- sending ---------------- */
function onlmSend(inp){inp.h=onlHash();ONLM.hlog['n'+(ONLM.sent+1)]=inp.k==='modal'?inp.pre:inp.h;inp.seat=ONLM.me;inp.n=++ONLM.sent;NET.req('match.input',{id:S.onl.lobby,in:inp}).catch(e=>{if(typeof mToast==='function')mToast('⚠ The server did not take that move: '+esc(e.message))})}
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
{const base=modal;modal=function(title,body,buttons,opt){
  if(!onlmOn()||ONLM.info>0||Date.now()-ONLM.uiAt<300)return base.apply(this,arguments);
  const t=String(title||'');const c=cur();
  /* a CPU offering a truce or a trade to a human: declined everywhere (v1) */
  if(c&&c.cpu&&/offers a truce|proposes a trade/.test(t)){const no=(buttons||[]).find(b=>/decline|refuse|no\b|keep/i.test(b.label||''))||(buttons||[]).slice(-1)[0];return Promise.resolve(no?no.value:null)}
  const own=onlmOwner();if(!onlmHuman(own))return base.apply(this,arguments);
  if(own===ONLM.me){const pre=onlHash();const pr=base.apply(this,arguments);return Promise.resolve(pr).then(v=>{const inp={k:'modal',v:v===undefined?null:v,t:t.slice(0,60)};inp.pre=pre;onlmSend(inp);return v})}
  return new Promise(res=>{ONLM.pend={res,t,seat:own,at:Date.now()};onlmWaitShow();onlmPump()})}}
/* ---------------- receiving ---------------- */
NET.on('match.input',d=>{if(!onlmOn()||!d||d.id!==S.onl.lobby)return;const inp=d.in;if(inp.from===ONL.acct.id||inp.seq<ONLM.next)return;if(!ONLM.q.some(x=>x.seq===inp.seq))ONLM.q.push(inp);ONLM.q.sort((a,b)=>a.seq-b.seq);onlmPump()});
function onlmReady(inp){if(!S||S.over)return false;if(inp.k==='modal')return !!ONLM.pend;
  return !S.busy&&!CUR_MODAL&&!ONLM.pend&&['choice','action','command'].includes(S.phase)&&onlmOwner()===inp.seat}
let ONLM_PUMP=0;
function onlmPump(){clearTimeout(ONLM_PUMP);if(!onlmOn()||ONLM.resyncing)return;
  while(ONLM.q.length&&ONLM.q[0].seq===ONLM.next){const inp=ONLM.q[0];if(!onlmReady(inp)){ONLM_PUMP=setTimeout(onlmPump,120);onlmWaitShow();return}
    ONLM.q.shift();ONLM.next=inp.seq+1;
    const mine=inp.k==='modal'?inp.pre:onlHash();if(inp.k==='modal'?inp.pre&&mine!==onlmPendHash():inp.h&&mine!==inp.h){onlmResync(inp);return}
    ONLM.hlog['s'+inp.seq]=inp.k==='modal'?onlmPendHash():onlHash();onlmApply(inp)}
  if(ONLM.q.length&&ONLM.q[0].seq>ONLM.next)onlmCatchUp();onlmWaitShow()}
function onlmPendHash(){return ONLM.pend&&ONLM.pend.h||onlHash()}
function onlmApply(inp){ONLM.replay++;try{
  if(inp.k==='modal'){const P=ONLM.pend;ONLM.pend=null;onlmWaitShow();P.res(inp.v);return}
  const p=cur();if(inp.k==='tile'){if(p)p.focusRoll=!!inp.focus;S.mode=inp.mode;try{if(typeof computeHL==='function')computeHL()}catch(e){}onTile(inp.r,inp.c);return}
  if(inp.k==='act'){const b=document.createElement('button');b.type='button';b.dataset.act=inp.a;if(inp.id!=null)b.dataset.id=inp.id;if(inp.i!=null)b.dataset.i=inp.i;b.style.display='none';document.body.appendChild(b);try{b.click()}finally{b.remove()}}
}finally{ONLM.replay--}setTimeout(onlmPump,30)}
/* the modal's own hash is taken when it opens */
{const base=modal;modal=function(){if(onlmOn()&&!ONLM.replay){const h=onlHash();const r=base.apply(this,arguments);if(ONLM.pend&&!ONLM.pend.h)ONLM.pend.h=h;return r}return base.apply(this,arguments)}}
async function onlmCatchUp(){if(ONLM.catching)return;ONLM.catching=true;try{const g=await NET.req('match.get',{id:S.onl.lobby,from:ONLM.next});for(const inp of g.inputs||[])if(inp.from!==ONL.acct.id&&inp.seq>=ONLM.next&&!ONLM.q.some(x=>x.seq===inp.seq))ONLM.q.push(inp);
  for(const inp of g.inputs||[])if(inp.from===ONL.acct.id&&inp.seq===ONLM.next)ONLM.next++;ONLM.q.sort((a,b)=>a.seq-b.seq)}catch(e){}finally{ONLM.catching=false}onlmPump()}
/* own inputs advance the shared counter too (the server echoes them back to everyone) */
NET.on('match.input',d=>{if(!onlmOn()||!d||d.id!==S.onl.lobby)return;if(d.in.from===ONL.acct.id&&d.in.seq>=ONLM.next){ONLM.next=d.in.seq+1;onlmPump()}});
/* ---------------- resync ---------------- */
function onlmResync(inp){ONLM.resyncs++;ONLM.resyncing=true;ONLM.needAt=inp.seq;if(typeof mToast==='function')mToast('🔄 Out of step with the others — fetching their arena…');
  NET.req('match.snapreq',{id:S.onl.lobby,to:ONLM.owners[inp.seat],seq:inp.seq}).catch(()=>{});setTimeout(()=>{if(ONLM.resyncing){ONLM.resyncing=false;onlmPump()}},15000)}
NET.on('match.snapreq',d=>{if(!onlmOn()||d.id!==S.onl.lobby||d.to!==ONL.acct.id)return;const send=()=>{if(S.busy||CUR_MODAL){setTimeout(send,150);return}
  NET.req('match.snap',{id:S.onl.lobby,to:d.from,seq:ONLM.next,snap:matchSnapshot('online')}).catch(()=>{})};send()});
NET.on('match.snap',d=>{if(!S||!S.onl||d.id!==S.onl.lobby||d.to!==ONL.acct.id)return;const keep={...S.onl};onlmLoad(d.snap,keep);ONLM.next=d.seq;ONLM.q=ONLM.q.filter(x=>x.seq>=d.seq);ONLM.pend=null;ONLM.resyncing=false;onlmPump()});
function onlmLoad(snap,onl){try{matchSlotPut('onl',snap);const ok=matchLoad('onl');matchSlotDel('onl');S.onl={...onl};S.limits=S.limits?{...S.limits,min:0}:S.limits;return ok}catch(e){console.error(e);return false}}
/* ---------------- the opening ---------------- */
{const base=beginTurn;beginTurn=async function(){if(S&&S.onl&&!S.onl.opened){S.onl.opened=true;ONLM.on=true;ONLM.me=S.onl.seat;ONLM.owners=S.onl.owners||[];ONLM.next=0;ONLM.q=[];ONLM.pend=null;ONLM.sent=0;
    if(S.limits)S.limits.min=0;if(S.onl.host){try{await NET.req('match.open',{id:S.onl.lobby,snap:matchSnapshot('online')})}catch(e){if(typeof mToast==='function')mToast('⚠ '+esc(e.message))}}onlmWaitShow()}
  return base.apply(this,arguments)}}
async function onlJoinMatch(L,onl){if(typeof mToast==='function')mToast('⚔ Waiting for the host to open the arena…');let g=null;
  for(let i=0;i<150&&!(g&&g.open);i++){try{g=await NET.req('match.get',{id:L.id,from:0})}catch(e){}if(!(g&&g.open))await new Promise(r=>setTimeout(r,400))}
  if(!g||!g.open){if(typeof mToast==='function')mToast('⚠ The host never opened the arena.');return}
  onlmLoad(g.open,{...onl,opened:true});ONLM.on=true;ONLM.me=onl.seat;ONLM.owners=onl.owners;ONLM.next=0;ONLM.q=[];ONLM.pend=null;ONLM.sent=0;
  for(const inp of g.inputs||[])if(inp.from!==ONL.acct.id)ONLM.q.push(inp);
  try{if(typeof menuHide==='function')menuHide()}catch(e){}S.startedAt=Date.now();later(()=>beginTurn(),60)}
/* ---------------- whose move ---------------- */
function onlmWaitShow(){clearTimeout(ONLM.waitT);ONLM.waitT=setTimeout(()=>{let el=document.getElementById('onlWait');const on=onlmOn();
  const own=on?(ONLM.pend?ONLM.pend.seat:onlmOwner()):-1;const show=on&&onlmHuman(own)&&own!==ONLM.me&&(ONLM.pend||!S.busy);
  document.body.classList.toggle('onl-off',!!(on&&!onlmMine()));
  if(!show){if(el)el.hidden=true;return}if(!el){el=document.createElement('div');el.id='onlWait';document.body.appendChild(el)}
  const p=S.players[own];el.innerHTML=`⏳ <b>${esc(p?p.name:'Another lanista')}</b> ${ONLM.pend?'is deciding':'is on the move'}…`;el.hidden=false},80)}
function onlmNudge(){const el=document.getElementById('onlWait');if(el){el.classList.remove('nudge');void el.offsetWidth;el.classList.add('nudge')}}
{const base=render;render=function(){const r=base.apply(this,arguments);if(ONLM.on)onlmWaitShow();return r}}
{const base=gameOver;gameOver=async function(){const r=await base.apply(this,arguments);if(ONLM.on){ONLM.on=false;onlmWaitShow()}return r}}
{const st=document.createElement('style');st.textContent=`#onlWait{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:60;padding:8px 16px;border-radius:999px;background:rgba(20,14,8,.92);border:1px solid var(--gold,#e8c96a);color:#f3e6c4;font-size:14px;pointer-events:none}
#onlWait.nudge{animation:onlNudge .4s}@keyframes onlNudge{0%,100%{transform:translateX(-50%)}25%{transform:translateX(calc(-50% - 6px))}75%{transform:translateX(calc(-50% + 6px))}}
body.onl-off #actions{opacity:.55}`;document.head.appendChild(st)}
/* words of power stay offline */
{const base=cheatPrompt;cheatPrompt=function(){if(S&&S.onl&&!S.over){if(typeof mToast==='function')mToast('🔑 Words of power have no voice in the online arena.');return}return base.apply(this,arguments)}}

/* 254-v98fastonl — v0.98 fix: ONLINE LOCKSTEP WHEN A VIEWER PLAYS AT FAST (online only; offline untouched).
   ROOT CAUSE (traced 2026-10-08 with two windows, one at Fast): a remote move was applied in the wrong place. The End-turn button
   (07-ui 'end', also 'exit' and the tunnel) runs act(async()=>{S.busy=false;await endTurn()}), and act()'s own tail clears S.busy before
   it awaits settle() (a round end: rewards, picks). For that whole stretch the phase is still 'action', the same gladiator is cur() and
   nothing is busy — so 113's onlmReady said "ready" to a move of THAT seat. A lanista at Fast plays the CPU turns that follow almost at
   once and sends his NEXT turn's move (coin, a tile) while a Normal-speed window is still inside the old endTurn (zone check, hand
   limit, restless stones, Mandata, recordHist): the move was applied there, turns too early → hash mismatch → resync (3+ humans:
   majority vote, the slow window struck as the odd one). Normal/Normal hid it only because both windows took the CPU turns equally slowly.
   Nothing in the engine changes state or draws from the dice by speed: the cause is purely when a queued input may be applied.
   FIX: while an endTurn() or a settle() is running (counted per arena S, so a loaded snapshot / new event starts at 0), a board input
   (tile / act / drop) is NOT ready on any client, the 121 stuck check does not call it "impossible", your own board clicks are not
   taken (onlmMine false outside windows — no move recorded half-way through your own turn's end), and no snapshot is cut. Windows
   (modal inputs: the hand limit, a round reward pick) still flow, so nothing waits on itself. Test: tonl98f. */
/* v1.01 (327-v101beat, Phase C): the endTurn()/settle() counters moved into the engine (ENG101, engRunning101 — part of awaiting());
   f98Busy() reads them, F98 keeps only the 'held' count tonl98f reports. */
const F98={held:0};
function f98Busy(){return typeof engRunning101==='function'&&engRunning101()}
/* a board input (tile / act / drop) is held while an endTurn()/settle() runs (F98.held). Gating every non-window input on
   awaiting()==='command' stalled server inputs (stands.result, drop, gear…) — tonl78; awaiting() stays for tools and Phase E. */
{const base=onlmReady;onlmReady=function(inp){if(inp&&inp.k!=='modal'&&inp.k!=='void'&&inp.k!=='abandon'&&f98Busy()){F98.held++;return false}return base.apply(this,arguments)}}
{const base=onl80fImpossible;onl80fImpossible=function(inp){if(f98Busy()&&!ONLM.pend)return false;return base.apply(this,arguments)}}
{const base=onlmMine;onlmMine=function(){if(f98Busy()&&!CUR_MODAL&&onlmOn())return false;return base.apply(this,arguments)}}
{const base=onlmSettled;onlmSettled=function(){if(f98Busy())return false;return base.apply(this,arguments)}}
/* the speed is this viewer's own: a resync snapshot (38-matchsave matchLoad sets SPEED from the sender's save) no longer hands the
   sender's speed to this window */
{const base=onlmLoad;onlmLoad=function(){const sp=SPEED,keep=()=>{try{if(SPEED!==sp&&!['pause','step','snap'].includes(sp))setSpeedUI(sp)}catch(e){}};
  const r=base.apply(this,arguments);keep();try{Promise.resolve(r).then(keep,()=>{})}catch(e){}return r}}

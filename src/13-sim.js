
/* =====================================================================
   13-SIM · HEADLESS SIMULATION
   =====================================================================
   simEvent(cfg) runs a full event with no rendering in ~50-90ms: it saves the live
   game (S), flips HEADLESS on, plays the event to its natural end (with a maxTurns
   guard: highest CF wins a stalled sim), then restores everything it touched.
   simBatch() runs many. This is what powers scouting reports, instant match nights
   and the strategy guide's 300-event statistics.
   ===================================================================== */
/* ================= OFF-SCREEN SIMULATION =================
   The real engine plays whole events with no drawing and no waiting. Used for Ludus scouting reports,
   Manager match nights ("simulate instantly") and bookmaker lines. */
let SIM_BUSY=false;
function liveEventRunning(){return !!(S&&!S.over&&S.phase!=='setup'&&!S.sim)}
async function simEvent(cfg,{maxTurns=700,timeoutMs=20000}={}){
  // v0.26: let the last simulated event's async tail unwind before this one takes the dice (back-to-back sims stay exactly replayable)
  for(let i=0;i<3;i++)await new Promise(r=>setTimeout(r,0));
  const keep={S,uid,HEADLESS,THOUGHTS,LATER_N,RNG}; // the live game's dice stream is untouched by simulations
  HEADLESS=true;THOUGHTS=false;SIM_BUSY=true;
  let onErr;
  try{
    return await new Promise((res,rej)=>{
      const t=setTimeout(()=>rej(new Error('simulation timed out')),timeoutMs);
      onErr=e=>{clearTimeout(t);rej(e.reason||e.error||e)};
      window.addEventListener('unhandledrejection',onErr);window.addEventListener('error',onErr);
      cfg.sim={done:r=>{clearTimeout(t);res(r)},maxTurns};
      Promise.resolve().then(()=>startEvent(cfg)).catch(e=>{clearTimeout(t);rej(e)});
    });
  }finally{
    window.removeEventListener('unhandledrejection',onErr);window.removeEventListener('error',onErr);
    const simS=S;if(simS)simS.over=true;
    S=keep.S;uid=keep.uid;HEADLESS=keep.HEADLESS;THOUGHTS=keep.THOUGHTS;LATER_N=keep.LATER_N;RNG=keep.RNG;SIM_BUSY=false;
  }
}
// run several simulations, yielding to the page between them so a progress bar can move
async function simBatch(cfgs,onProgress){
  const out=[];
  for(let i=0;i<cfgs.length;i++){
    let r=null;try{r=await simEvent(typeof cfgs[i]==='function'?cfgs[i]():cfgs[i])}catch(e){r={error:String(e&&e.message||e)}}
    out.push(r);if(onProgress)onProgress(i+1,cfgs.length);
    await new Promise(z=>setTimeout(z,0));
  }
  return out;
}

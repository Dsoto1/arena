/* =====================================================================
   337-V102RESUME · v1.02 workstream F · a refresh brings you back into your match
   =====================================================================
   Refreshing the page in the middle of a Play Now / New event match (even while a CPU acts) or a hot-seat game puts
   the player straight back into it. Online already returns by itself (234 onl96Auto) and is left alone.
   • WHERE IT SAVES — only at SETTLED points, never in the middle of a resolution:
       'bt'   = the entry of every beginTurn (the outermost wrapper, before anything of the turn ran: the same point 113
                hands an online joiner — matchSnapshot, RNG state inside), CPU turns included;
       'idle' = a human's own move with nothing resolving (327 awaiting() = {k:'command'}, 38 matchSaveOK()), checked by
                38's 600 ms matchSaveUI sweep and written when the state signature changed (position, movement, coin,
                CF, items, log length, dice).
     Into the existing autosave slot ('auto', or 158's hot-seat 'table') through matchSlotPut, so 214's one-tab-per-save
     claim (auto92) and 109's newer-version guard apply. The snapshot carries r102 {k,t,turn,rot,cur,ver}; a small
     pointer (localStorage flavius_v102f) names the slot (r102Find falls back to the newer marked slot when the pointer is
     missing — a write right before a refresh can be lost). 38's once-a-rotation matchAutosave stands down while this
     writes (it would overwrite the slot without the marker).
   • RESUME — matchLoad of a snapshot with r102.k 'bt' then calls beginTurn() (60 ms later, like 113's joiner), so a
     refresh mid CPU turn replays that turn from its start with the same dice (RNG.s is in the snapshot); 'idle' = the
     plain load (the human's move as it stood). A refresh inside a decision window goes back to the last settled point.
   • BOOT — 08-setup's first menuShow / openSetup(true) is held while a marked autosave exists (r102Find: ≤ R102.MAX_MS =
     12 h, same GAME_VER, no #hash deep link): matchLoad runs under 120's #boot cover (no
     menu flash). Fails → the held boot call runs. The main menu shows "⚔ Back to your match" (#mmRes102) whenever a
     pointer is live and that match is not the one on screen; ✕ forgets it.
   • ENDS — gameOver of the tracked match, 🚪 abandon (08 abandonAsk 'abandon'), ✕ on the menu row and any new startEvent
     run r102Forget: pointer gone, r102 marker stripped from both slots (the saves stay loadable by hand); a finished event
     never resumes.
   • NOT FOR — HEADLESS/sims, online, lessons (S.tutorial / TUT.on), e94 test play, replays (RPP.on), Manager bouts
     (mgrCtx — their world save holds no bout state; the bout is lost on a refresh as before), invitationals (specCtx),
     tournaments, exhibitions, the beast pen. Daily/weekly challenges (310) resume; the attempt stays counted (310 counts
     it at the start).
   • Tests run with navigator.webdriver: there the module is OFF unless localStorage flavius_v102fon=1 (many old tests
     reload pages). Kill switch localStorage flavius_v102foff=1. Stats R102.n (writes) / R102.ms (time spent). Test tv102f. */
/* his call 2026-10-14: straight back in ONLY on a refresh of the SAME tab (sessionStorage flavius_v102f_tab, set by this tab's autosave; a new
   tab starts without it) — other tabs just offer the main-menu "⚔ Back to your match" row. */
const R102={TAB:'flavius_v102f_tab',KEY:'flavius_v102f',MAX_MS:12*3600e3,sig:'',S:null,boot:false,booted:false,n:0,ms:0};
/* TWEAK: R102.MAX_MS = how old an autosave may be and still resume at boot (12 h). */
const R102_OFF=(()=>{try{if(localStorage.getItem('flavius_v102foff')==='1')return true;if(navigator.webdriver&&localStorage.getItem('flavius_v102fon')!=='1')return true}catch(e){return true}return false})();
/* r102Elig — the match on screen may be autosaved/resumed (Play Now / New event / hot seat; see the header for what is left out). */
function r102Elig(){try{return !HEADLESS&&!!S&&!S.over&&S.phase!=='setup'&&!!(S.players&&S.players.length)&&!S.mgrCtx&&!S.specCtx&&!S.tutorial&&!S.sim&&!S.tourn&&!S.exhib&&!S.exhibCtx&&!S.pen76&&!S.onl&&!S.e94test
  &&!(typeof RPP!=='undefined'&&RPP.on)&&!(typeof TUT!=='undefined'&&TUT.on)}catch(e){return false}}
/* r102Slot — the autosave slot of this match: the hot-seat table's own, else 'auto'. */
function r102Slot(){return typeof hsTable==='function'&&hsTable()&&typeof HS_SLOT!=='undefined'?HS_SLOT:'auto'}
function r102Ptr(){try{const t=localStorage.getItem(R102.KEY);return t?JSON.parse(t):null}catch(e){return null}}
/* r102Forget — this match is not to be resumed any more: drops the pointer and the r102 marker of both autosave slots (the saves
   themselves stay loadable by hand); a slot another tab holds (214 'lost') is left alone. */
function r102Forget(){try{localStorage.removeItem(R102.KEY)}catch(e){}try{sessionStorage.removeItem(R102.TAB)}catch(e){}
  for(const k of ['auto',typeof HS_SLOT!=='undefined'?HS_SLOT:'table'])try{if(typeof TAB92!=='undefined'&&TAB92.auto[k]==='lost')continue;const sv=matchSlotGet(k);if(sv&&sv.r102){delete sv.r102;localStorage.setItem(MSAVE_KEY(k),JSON.stringify(sv))}}catch(e){}
  const row=document.getElementById('mmRes102');if(row)row.remove()}
/* r102Write — snapshots the match into its autosave slot with the r102 marker and points the pointer at it. */
function r102Write(kind){if(R102_OFF||!r102Elig())return false;const t0=performance.now();let ok=false;
  try{const slot=r102Slot();const snap=matchSnapshot(null);const meta={k:kind,t:Date.now(),turn:S.turnNo,rot:S.rotation,cur:S.cur,ver:typeof GAME_VER!=='undefined'?GAME_VER:''};
    snap.r102=meta;ok=matchSlotPut(slot,snap);
    if(ok){localStorage.setItem(R102.KEY,JSON.stringify({slot,...meta,sum:snap.summary||'',name:snap.name||''}));try{sessionStorage.setItem(R102.TAB,'1')}catch(e){}R102.S=S}}catch(e){if(console.error)console.error(e)}
  R102.n++;R102.ms+=performance.now()-t0;return ok}
/* r102Find — the match to resume: {slot, sv} — the pointer's slot, else the newer marked autosave ('auto' / the table's); a marked
   snapshot must be ≤ R102.MAX_MS old, of this GAME_VER and not over. The pointer only names the slot: a write the browser lost
   right before a refresh never strands a live match. */
function r102Find(){const ptr=r102Ptr();const now=Date.now();
  const ok=k=>{try{const sv=matchSlotGet(k);const m=sv&&sv.r102;if(!m||sv.game!=='flavius-match'||!m.t)return null;if(now-m.t>R102.MAX_MS||now<m.t-60000)return null;
    if(typeof GAME_VER!=='undefined'&&m.ver&&m.ver!==GAME_VER)return null;return {slot:k,sv}}catch(e){return null}};
  if(ptr&&ptr.slot){const f=ok(ptr.slot);if(f)return f}
  const L=['auto',typeof HS_SLOT!=='undefined'?HS_SLOT:'table'].map(ok).filter(Boolean).sort((a,b)=>b.sv.r102.t-a.sv.r102.t);return L[0]||null}
/* r102Idle — the 'idle' point: a human's own settled move, written when anything changed since the last write. */
function r102Idle(){if(R102_OFF||!r102Elig())return;try{if(typeof matchSaveOK==='function'&&!matchSaveOK())return;const a=typeof awaiting==='function'?awaiting():null;if(!a||a.k!=='command')return;
  const p=cur();if(!p)return;const sig=[S.turnNo,S.phase,S.cur,S.rotation,p.r,p.c,p.mv,p.attacks,p.coin,p.cf,(p.items||[]).length,(S.logLines||[]).length,RNG?RNG.s:0].join('|');
  if(sig===R102.sig&&R102.S===S)return;R102.sig=sig;r102Write('idle')}catch(e){}}
/* ---- the settled points ---- */
{const base=beginTurn;beginTurn=async function(){try{if(!R102_OFF&&r102Elig()){r102Write('bt');R102.sig=''}}catch(e){}return base.apply(this,arguments)}}
{const base=matchSaveUI;matchSaveUI=function(){const r=base.apply(this,arguments);try{r102Idle()}catch(e){}return r}}
{const base=matchAutosave;matchAutosave=function(){if(!R102_OFF&&r102Elig())return;return base.apply(this,arguments)}}
/* ---- loading a marked snapshot: a turn-start save starts that turn again ---- */
{const base=matchLoad;matchLoad=function(slot){let m=null;try{const sv=matchSlotGet(slot);m=sv&&sv.r102||null}catch(e){}
  const r=base.apply(this,arguments);
  if(m)Promise.resolve(r).then(ok=>{if(!ok||!S||S.over)return;R102.S=S;R102.sig='';if(m.k==='bt'){const G=S;setTimeout(()=>{if(S===G&&!S.over)beginTurn()},60)}}).catch(()=>{});
  return r}}
/* ---- the ends ---- */
{const base=gameOver;gameOver=function(){const G=S;try{if(!HEADLESS&&G&&G===R102.S)r102Forget()}catch(e){}return base.apply(this,arguments)}}
{const base=startEvent;startEvent=function(){try{if(!HEADLESS&&!R102_OFF)r102Forget()}catch(e){}R102.S=null;return base.apply(this,arguments)}}
{const base=abandonAsk;abandonAsk=async function(){const G=S;const r=await base.apply(this,arguments);try{if(r==='abandon'&&G&&G===R102.S)r102Forget()}catch(e){}return r}}
/* ---- resume ---- */
async function r102Resume(){const f=r102Find();if(!f){r102Forget();return false}
  try{const c=CUR_MODAL;if(c)c.done(c.closeB?c.closeB.value:null)}catch(e){}
  let ok=false;try{ok=await matchLoad(f.slot)}catch(e){if(console.error)console.error(e)}
  if(!ok)return false;try{if(typeof menuHide==='function')menuHide()}catch(e){}if(typeof MM!=='undefined')MM.fromMenu=false;return true}
/* boot: the first menu/setup call waits while a live autosave exists */
R102.boot=!R102_OFF&&(()=>{try{if(location.hash&&location.hash.length>1)return false;if(sessionStorage.getItem('flavius_v102f_tab')!=='1')return false;return !!r102Find()}catch(e){return false}})();
function r102BootHold(base,self,args){if(R102.booted)return null;R102.booted=true;if(!R102.boot)return null;
  setTimeout(async()=>{let ok=false;try{ok=await r102Resume()}catch(e){}if(!ok)try{base.apply(self,args)}catch(e){if(console.error)console.error(e)}},0);return true}
{const base=menuShow;menuShow=function(){if(r102BootHold(base,this,arguments))return;const r=base.apply(this,arguments);try{r102Menu()}catch(e){}return r}}
{const base=openSetup;openSetup=function(){if(r102BootHold(base,this,arguments))return Promise.resolve();return base.apply(this,arguments)}}
/* ---- the main-menu fallback: ⚔ Back to your match ---- */
function r102Menu(){if(R102_OFF)return;const m=document.getElementById('mainMenu');if(!m)return;let row=document.getElementById('mmRes102');
  const f=r102Find();const sv=f&&f.sv;const show=!!sv;
  if(!show){if(row)row.remove();return}const box=m.querySelector('.mmbtns');if(!box)return;
  if(!row||row.parentNode!==box){if(row)row.remove();row=document.createElement('div');row.id='mmRes102';box.prepend(row)}
  const key=String(sv.r102.t);if(row.dataset.k===key)return;row.dataset.k=key;
  row.innerHTML=`<span class="r102-txt"><b>${_T`⚔ Your match is waiting`}</b><small>${esc(sv.summary||'')}${f.slot!=='auto'?' · '+_T('hot seat'):''}</small></span>
    <span class="r102-acts"><button type="button" class="btn primary" data-r102="back">${_T`⚔ Back to your match`}</button><button type="button" class="btn" data-r102="forget" title="${_T`Forget this match`}" aria-label="${_T`Forget this match`}">✕</button></span>`}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#mmRes102 [data-r102]');if(!b)return;e.preventDefault();e.stopPropagation();
  if(b.dataset.r102==='forget'){r102Forget();return}
  const go=async()=>{const ok=await r102Resume();if(!ok){try{mToastSafe(_T('That match can no longer be resumed.'))}catch(x){}r102Menu()}};
  if(typeof transitRun==='function')transitRun(go,_T('Back to the sand…'));else go()},true);
{const css=document.createElement('style');css.id='v102rescss';css.textContent=`
#mmRes102{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;justify-content:space-between;padding:10px 12px;margin:0 0 10px;border:2px solid var(--gold,#e8c96a);border-radius:12px;background:linear-gradient(90deg,rgba(142,42,30,.55),rgba(36,26,16,.92));text-align:left;width:100%;box-sizing:border-box}
#mmRes102 .r102-txt{min-width:0;display:flex;flex-direction:column;gap:2px;flex:1 1 200px}#mmRes102 .r102-txt b{font:700 15px Georgia,serif;color:#f3d58a}#mmRes102 .r102-txt small{color:#d8cbb0;font-size:12.5px}
#mmRes102 .r102-acts{display:flex;gap:6px;flex:0 0 auto}#mmRes102 .r102-acts .btn{width:auto;margin:0}`;document.head.appendChild(css)}

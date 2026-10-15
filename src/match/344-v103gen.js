/* =====================================================================
   344-V103GEN · v1.03 — his v1.02 notes, GENERAL items (fixes + small changes). Kill switch: localStorage flavius_v103aoff=1 (every rule below
   goes back to the old behaviour; the square-corner CSS too).
   G1  the ✕ / 🏛 buttons of windows and submenus (.mclose, #mClose, Settings' .s98-x, the Ludus popover's .lu100x, Challenges' .dc102x) are SQUARE
       (rounded-corner square, 9 px) — same size, same sandstone / stone look. The pill "Save and exit" (.mclose.saveq) keeps its shape.
   G2  Market (and Crowd Favor's reason tip) in a round that forbids CF: `rndCF103()` = RD().cf is false. 236-v96deals does it for events whose EVERY
       round forbids CF (noCF96); this generalises it to the current round (Classic's Duel): the action bar's Market is disabled, its tile says
       "No CF this round" and the tip says why. Replaces nothing (adds to 236); a no-CF whole event is still 236's text.
   G3  🔴 starting a challenge (310 dc100Begin): ROOT CAUSE — mmLaunch's 3 s watchdog (08-setup) brings the main menu back when "nothing took the
       screen"; the Challenges window opened through mmLaunch, and the gap between its close and startEvent's first line (the click → `await
       modal` → menuHide → dc100Begin) is exactly "nothing on screen" (no window, no S in play, START89 still 0, no goAt — the horns click in
       56-v52 stamps MM.goAt, a challenge's Enter did not). On a slower machine / a quick Enter inside 3 s the watchdog called menuShow(): the menu sat
       behind the briefing and Enter (which ends the opening window) left it over the live match. Fix: a capture click on [data-dc100go] stamps
       MM.goAt + clears MM.fromMenu (what the horns do), and dc100Begin stamps them too (a refused weekly start un-stamps). 72-v59's own 2.9 s watchdog got the same goAt guard (small direct edit).
   G4  abandoning a challenge (abandonAsk: the 🏛 menu and New event) asks in ONE centred popup (ask76) what it costs: daily = the only scored attempt is
       spent (practice: nothing lost); weekly = the attempt is counted, N of 3 attempts left. Cancel keeps playing. REPLACES 08-setup's
       "Leave the arena? / Abandon this event?" window for challenges (no summoned fighters, no Ludus records there); Save & leave is not offered.
   N1a spectators switch section ONCE a match: the flag `s.sw103` lives on the spectator (in S, so snapshots and online clients agree). Checked by:
       16-crowd's CPU move (`!sw103Block(s)` BEFORE its rand() — the dice only skip for a spectator who already switched), the human upkeep window's
       Change section, 232's #btnSec96 (replaces its once-a-rotation `_sec96` rule), 128's online ticket-holder window (apply refuses a second move,
       identically on every client). CPU moves land in the LEAST crowded section facing the target (`sw103Dest`, was always the favourite's). The crowd
       starts spread: `sw103Spread()` (called from crowdStart before the seat log) moves NEUTRAL spectators from sections above ceil(n/8) to the emptiest
       one — deterministic, no dice. Rule change → treplay101 goldens need a deliberate re-record.
   E7  "1 switch left" / "Switched" on #btnSec96 (data-sw103 + CSS), in the Stands tab (`.sw103s`), in the human spectator's upkeep option and in the
       online ticket holder's window (`.sw103n`).
   ===================================================================== */
const V103A={off:(()=>{try{return localStorage.getItem('flavius_v103aoff')==='1'}catch(e){return false}})()};

/* ---------- N1a / E7 · one section switch a match ---------- */
function sw103Block(s){return !V103A.off&&!!s&&!!s.sw103}
function sw103Note(s){return V103A.off?'':sw103Block(s)?_T('Switched'):_T('1 switch left')}
function sw103Sub(s,base){return sw103Block(s)?_T('Switched — one switch a match'):V103A.off?base:`${base} · ${_T('1 switch left')}`}
function sw103Me(){try{if(!S||S.over||!S.spect)return null;const mine=S.onl&&typeof ONLM!=='undefined'?ONLM.me:null;
  return S.spect.find(s=>s.human&&!s.gone&&(!S.onl||s.onlIdx===mine))||null}catch(e){return null}}
/* where a CPU spectator goes: the least crowded section facing the target (ties → the favourite's own) */
function sw103Dest(opts,want){if(V103A.off||!S||!S.spect)return undefined;const n=i=>S.spect.filter(x=>!x.gone&&x.sec===i).length;let best=null;
  for(const i of opts){if(best===null||n(i)<n(best)||(n(i)===n(best)&&i===secOf(want)))best=i}return best===null?undefined:best}
/* the crowd starts spread over the eight sections: neutrals leave any section above ceil(n/8) for the emptiest one */
function sw103Spread(){if(V103A.off||!S||!S.spect)return;const L=S.spect.filter(s=>!s.gone);const cap=Math.max(1,Math.ceil(L.length/SECTIONS.length));
  const cnt=SECTIONS.map((x,i)=>L.filter(s=>s.sec===i).length);
  for(let k=L.length-1;k>=0;k--){const s=L[k];if(s.human||s.fav!=null||cnt[s.sec]<=cap)continue;
    let t=0;for(let i=1;i<cnt.length;i++)if(cnt[i]<cnt[t])t=i;
    if(cnt[t]>=cap||t===s.sec)continue;cnt[s.sec]--;cnt[t]++;s.sec=t}}
/* #btnSec96 (232): once a match, with the words on the button */
{const base=sec96Sync;sec96Sync=function(){const r=base.apply(this,arguments);try{if(V103A.off)return r;const b=document.getElementById('btnSec96'),me=sec96Me();
  if(!b||!me){if(b)b.removeAttribute('data-sw103');return r}
  const used=sw103Block(me);b.dataset.sw103=sw103Note(me);
  b.disabled=me.cf<3||used||SEC96.busy;
  b.title=used?_T('Spectators switch section once a match — you already did.'):me.cf<3?_T('Not enough Crowd Favor (3 CF).'):_T('Move to another stand — once a match. Its gladiator earns 1 CF from you every turn.')}catch(e){}return r}}
/* the Stands tab: a line for the human spectator */
{const base=standsDrawerHTML;standsDrawerHTML=function(opt){const h=base.apply(this,arguments);try{if(V103A.off||(opt&&opt.chronOnly))return h;const me=sw103Me();
  if(!me||typeof h!=='string')return h;
  return `<p class="rc-sub sw103s" data-sw103s="${sw103Block(me)?'used':'left'}">${_T('🚶 Section switch')}: <b>${esc(sw103Note(me))}</b></p>`+h}catch(e){return h}}}

/* ---------- G2 · Market in a round that forbids CF ---------- */
function rndCF103(){try{if(!S||!S.players||S.phase==='setup'||S.over)return false;const r=RD();return !!r&&!r.cf}catch(e){return false}}
const noCFRound103=()=>_T`Crowd Favor can't be spent in this round, so nothing can be bought at the Market.`;
function rndCFBar103(){try{if(V103A.off||!rndCF103()||(typeof noCF96==='function'&&noCF96()))return; /* a whole no-CF event keeps 236's words */ const A=document.getElementById('actions');if(!A)return;const reason=_T('No CF this round'),tip=noCFRound103();
  for(const b of A.querySelectorAll('[data-act="market"],[data-act="crowd"]')){const lab=b.querySelector('.l96');const l=((lab&&lab.textContent)||'').trim();const mk=b.dataset.act==='market';
    if(mk){b.disabled=true;b.classList.add('off90','nocf96')}
    if(!mk&&!b.disabled)continue; /* Crowd: 07-ui already disables it (CF only) — only the reason; the spear stays */
    b.dataset.tip=tip;b.dataset.nocf103='1';b.setAttribute('aria-label',(l||b.textContent.trim())+' — '+reason);
    const c=b.querySelector('.c96');if(c&&mk)c.textContent=reason;
    if(mk&&!c&&b.closest('.k96')){const i=document.createElement('i');i.className='c96';i.textContent=reason;(lab||b).after(i)}}}catch(e){}}
{const base=render;render=function(){const r=base.apply(this,arguments);rndCFBar103();return r}}

/* ---------- G3 · a challenge's start never lets the menu watchdog in ---------- */
function dc103Stamp(){try{if(V103A.off||typeof MM==='undefined')return;MM.goAt=Date.now();MM.fromMenu=false}catch(e){}}
document.addEventListener('click',e=>{try{const b=e.target&&e.target.closest&&e.target.closest('[data-dc100go]');if(b&&!b.disabled)dc103Stamp()}catch(err){}},true);
if(typeof dc100Begin==='function'){const base=dc100Begin;dc100Begin=function(){dc103Stamp();let r;try{r=base.apply(this,arguments)}catch(e){try{MM.goAt=0}catch(x){}throw e}
  if(r===false&&!V103A.off){try{MM.goAt=0}catch(x){}}return r}}

/* ---------- G4 · leaving a challenge says what it costs ---------- */
function dc103Cost(){const D=S.daily100;const R=(()=>{try{return dc100Rec(dc100Load(),D.kind,D.key)}catch(e){return null}})();
  if(D.kind==='w'){const left=dc100Left('w',R);return `<p style="margin:0 0 6px">${_T`This attempt is already counted. Leaving now scores nothing, and the best of your attempts is what counts.`}</p><p style="margin:0"><b>${left===1?_T('1 of 3 attempts left this week'):_T`${left} of 3 attempts left this week`}</b></p>`}
  if(D.att===1)return `<p style="margin:0 0 6px">${_T`Today's attempt is already counted — it is the only one that scores. Leaving now earns no score and no medal.`}</p><p style="margin:0" class="rc-sub">${_T`You can still play it again as practice.`}</p>`;
  return `<p style="margin:0">${_T`This is practice, so nothing is lost by leaving. Your first attempt today already counts.`}</p>`}
{const base=abandonAsk;abandonAsk=async function(ctx){
  try{if(!V103A.off&&!HEADLESS&&S&&S.daily100&&!S.over&&typeof ask76==='function'){
    const ok=await ask76(_T('Leave the challenge?'),dc103Cost(),_T('Abandon the challenge'),_T('Keep playing'));
    if(!ok)return 'keep';
    try{if(typeof R102!=='undefined'&&R102&&S===R102.S&&typeof r102Forget==='function')r102Forget()}catch(e){}
    return 'abandon'}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}

/* ---------- G1 · square close / home buttons ---------- */
if(!V103A.off){const st=document.createElement('style');st.id='v103a-css';
st.textContent=`.mclose:not(.saveq),#mClose:not(.saveq),#modal:has(#s98) #mClose,#modal:has(#tac98) #mClose,#modal.sand100 #mClose,.s98-x,.lu100x,.dc102x{border-radius:9px!important}
#btnSec96[data-sw103]::after{content:" · " attr(data-sw103);font-size:.86em;opacity:.85}
.sw103s{margin:2px 0 8px}.sw103n{display:block;margin-top:4px;color:var(--muted);font-size:12px}`;
document.head.appendChild(st)}

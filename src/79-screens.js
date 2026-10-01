/* =====================================================================
   79-SCREENS · v0.61
   =====================================================================
   ONE PLACE DECIDES WHAT IS ON SCREEN. Before, several pieces each guessed what to show when a window closed — the
   window's own close (curtain), mmAfterClose and its wrappers (56-v52, 78-v60), the Annals' own "back to the menu" timer,
   the Ludus → Annals reopen, the Play/Road hand-off (72-v59), and two launch watchdogs — and they raced, which is
   where the menu flashes and the Annals loop came from.
   Now:
   • every function that opens a window (SCREEN_OPENERS) registers an INTENT the moment it is called; the intent ends
     when a window (or the arena, or the city square) is up, when the opener gives up, or after 15 s;
   • screenSettle() is the single decision, run when a window closes (via mmAfterClose) and whenever an intent ends:
       a window is up → lift the curtain · an intent is pending (or the horns just sounded) → keep the curtain and wait
       · an event or the city square is live → show it · we came from the main menu → show the menu · else nothing.
   • MM.launchPending (read by 72-v59's curtain hold and watchdog) now simply means "an intent is pending".
   ===================================================================== */
const SCREEN={pending:0,intents:0};
const screenWindowUp=()=>!$('#modal').hidden||!!CUR_MODAL;
const screenLive=()=>!!(S&&!S.over&&S.phase!=='setup')||(typeof CITY!=='undefined'&&!!CITY.open);
function screenIntent(label,ms=15000){SCREEN.pending++;SCREEN.intents++;let over=false;const t0=Date.now();
  const end=()=>{if(over)return;over=true;SCREEN.pending=Math.max(0,SCREEN.pending-1);screenSettleSoon()};
  const poll=()=>{if(over)return;if(screenWindowUp()||screenLive()||Date.now()-t0>ms)return end();setTimeout(poll,40)};setTimeout(poll,40);return end}
let SCREEN_T=0;function screenSettleSoon(){clearTimeout(SCREEN_T);SCREEN_T=setTimeout(screenSettle,60)}
function screenSettle(){if(HEADLESS)return;const unc=()=>{if(typeof transitUncover==='function')transitUncover()};
  if(screenWindowUp()){unc();return}
  if(SCREEN.pending>0||Date.now()-(MM.goAt||0)<15000&&!screenLive())return; /* something is on its way: the intent settles again when it lands */
  if(screenLive()){if(S&&!S.over&&S.phase!=='setup'&&(S.startedAt||0)>=(MM.launchedAt||0))MM.fromMenu=false;unc();return}
  if(MM.fromMenu&&$('#mainMenu').hidden){menuShow();setTimeout(unc,60);return}
  unc()}
/* the openers: anything that ends in a window */
const SCREEN_OPENERS=['openHall','openLudus','openSetup','openManager','openStudio','playNowMenu','managerMenu','matchSavesWindow','showRules','openSettings','cheatPrompt'];
for(const name of SCREEN_OPENERS){try{const base=window[name]||eval(name);if(typeof base!=='function')continue;
  const wrapped=function(){const end=screenIntent(name);let r;try{r=base.apply(this,arguments)}catch(e){end();throw e}
    if(r&&typeof r.then==='function')r.then(()=>{if(!screenWindowUp())end()},()=>end());else setTimeout(()=>{if(!screenWindowUp())end()},0);return r};
  eval(`${name}=wrapped`)}catch(e){}}
/* the old deciders hand over to the one decision */
mmAfterClose=function(){screenSettle()};
try{Object.defineProperty(MM,'launchPending',{configurable:true,get(){return SCREEN.pending>0},set(v){}})}catch(e){}

/* =====================================================================
   164-READY · window.FLAVIUS_READY (for the regression tests)
   =====================================================================
   Set to true once the boot screen is up (the main menu, the New event window that automated runs open, or any
   first window such as the first-run ask) AND the page's boot loaders have run (customs, trophies, sponsors, gear,
   hot-seat profiles fire from timers at 600-1500 ms). Tests wait for it after page.goto instead of a fixed 2-2.5 s
   sleep: await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000}).
   TWEAK: READY_MIN_MS = the earliest moment (ms after this script starts) it may turn true; READY_MAX_MS = true anyway
   (a boot that shows no window, e.g. a page opened straight into a mode). Nothing player-facing. */
const READY_MIN_MS=1600,READY_MAX_MS=6000;
window.FLAVIUS_READY=false;
(function(){const t0=Date.now();
  const up=()=>{const m=document.getElementById('mainMenu');return (m&&!m.hidden)||(typeof CUR_MODAL!=='undefined'&&!!CUR_MODAL)||!!document.getElementById('onl')||!!document.getElementById('onlLoad')};
  const iv=setInterval(()=>{const t=Date.now()-t0;if(t<READY_MIN_MS||(t<READY_MAX_MS&&(document.readyState!=='complete'||!up())))return;clearInterval(iv);window.FLAVIUS_READY=true},50)})();

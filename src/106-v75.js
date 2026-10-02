/* =====================================================================
   106-V75 · v0.75 — fixes and the next batch
   =====================================================================
   • The ratings fold above the avatar answers on the PRESS (pointerdown). The fighter board is rebuilt many times a second
     during turns; a click needs press + release on the same button, so a rebuild in between swallowed it. Keyboard
     (Enter/Space → click with detail 0) still uses the click path; the click that follows a press is ignored.
   ===================================================================== */
document.addEventListener('pointerdown',e=>{if(e.button!==0)return;const t=e.target.closest&&e.target.closest('.ratfold');if(!t)return;e.preventDefault();
  RAT_SHUT=!RAT_SHUT;try{localStorage.setItem('flavius_ratshut',RAT_SHUT?'1':'0')}catch(err){}panelStatsUp()},true);
document.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('.ratfold'))return;if(e.detail===0)return;
  e.stopImmediatePropagation();e.preventDefault()},true); /* a pointer click: the press already toggled */

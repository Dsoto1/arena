/* =====================================================================
   145-v85fix · v0.85 FIXES (his notes on v0.84)
   =====================================================================
   1 · Selecting a free agent no longer favorites him: the detail card's offer meter calls offerVerdict
       for a preview, and 70-v57's offerVerdict wrapper marked every previewed fighter favd + wrote g.court.
       Now only a real offer (the data-mg="offer" click) records the court line; favd stays with the
       real actions (scout, pitch, visit, gift, trial, offer, feast — 70's click list).
   ===================================================================== */
const FIX85={offering:0};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg="offer"]');if(!b)return;FIX85.offering++;setTimeout(()=>{FIX85.offering=Math.max(0,FIX85.offering-1)},0)},true);
{const base=offerVerdict;offerVerdict=function(g){const keepF=g?g.favd:undefined,keepC=g?g.court:undefined;const r=base.apply(this,arguments);
  if(g&&!FIX85.offering){g.favd=keepF;if(keepC===undefined)delete g.court;else g.court=keepC}return r}}

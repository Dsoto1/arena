/* 315-v100bal.js — v1.0 BALANCE, the page side (his picks O1 O2 O3 from tools/plans/balance100/REPORT.md; the rules are the
   "v1.0 BALANCE" section of 111-onlcore, the server block "v1.0 BALANCE" at the end of server/src/routes.js; docs/backend.md "v1.0 balance").
   • THE MOCK mirrors settleMatch: after the house took the gladiator's gifts, ONLC.after100 puts the dented list on the result and drops the
     rank gifts the house already had (O3).
   • THE AFTER-BOUT TOAST: printed pieces lost in a Ranked bout "came home dented" (out.dent100) — a death's printed pieces went to the house
     Storeroom dented; a rank gift the house already had is named once. (Issued pieces still vanish — 137's "Used up" line.) */
{const base=mockAfter83;mockAfter83=function(w,L,M,a,i,row,out,gx){const r=base.apply(this,arguments);try{ONLC.after100(out,gx)}catch(e){console.error(e)}return r}}
{const base=onlSettled;onlSettled=function(res){const r=base.apply(this,arguments);try{const o=res&&res.out;if(!o||res.void)return r;const bits=[];const cat=onlCatalog();
    const names=(o.dent100||[]).map(d=>esc2((cat[d.key]||{}).n||d.key)).join(', ');
    if(names)bits.push(o.died?_T`🩹 His gear went home to the Storeroom dented: ${names} — 🔨 repair in the Domus`:_T`🩹 Came home dented: ${names} — 🔨 repair in the Domus before the next Ranked bout`);
    if((o.giftDup100|0)>0)bits.push(_T('🎁 The house already had Flavius’s gift for that rank'));
    if(bits.length)setTimeout(()=>onlToast80(bits.join('<br>')),5800)}catch(e){console.error(e)}return r}}

/* 316-v100balonl.js — v1.0 BALANCE, the page side (his picks O1 O2 O3 from tools/plans/balance100/REPORT.md; the rules are the
   "v1.0 BALANCE" section of 111-onlcore, the server block "v1.0 BALANCE" at the end of server/src/routes.js; docs/backend.md "v1.0 balance").
   • THE MOCK mirrors settleMatch: after the house took the gladiator's gifts, ONLC.after100 puts the dented list on the result and drops the
     rank gifts the house already had (O3).
     A Ranked death (his follow-up): the killer's loot window is unchanged; a printed piece nobody took ('fell') goes home to the dead man's house
     shelf dented instead of the used market (mockToMarket83 wrapper, the house found by its name — like the server's toMarket wrapper).
   • THE AFTER-BOUT TOAST: printed pieces lost in a Ranked bout "came home dented" (out.dent100) — a death's printed pieces go to the house
     Storeroom dented (unless his killer takes one); a rank gift the house already had is named once. (Issued pieces still vanish — 137's "Used up" line.) */
{const base=mockToMarket83;mockToMarket83=function(w,P,from){try{if(ONLC.homeRoute100(P)&&from&&from.house){const D=Object.values(w.domus82||{}).find(x=>x&&x.name===from.house);
      if(D){ONLC.putPiece(D,ONLC.homeDent100(P),false);return}}}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=mockAfter83;mockAfter83=function(w,L,M,a,i,row,out,gx){const r=base.apply(this,arguments);try{ONLC.after100(out,gx)}catch(e){console.error(e)}return r}}
{const base=onlSettled;onlSettled=function(res){const r=base.apply(this,arguments);try{const o=res&&res.out;if(!o||res.void)return r;const bits=[];const cat=onlCatalog();
    const names=(o.dent100||[]).map(d=>esc2((cat[d.key]||{}).n||d.key)).join(', ');
    if(names)bits.push(o.died?_T`🩹 His printed gear goes home to the Storeroom dented (his killer may take one first): ${names} — 🔨 repair in the Domus`:_T`🩹 Came home dented: ${names} — 🔨 repair in the Domus before the next Ranked bout`);
    if((o.giftDup100|0)>0)bits.push(_T('🎁 The house already had Flavius’s gift for that rank'));
    if(bits.length)setTimeout(()=>onlToast80(bits.join('<br>')),5800)}catch(e){console.error(e)}return r}}

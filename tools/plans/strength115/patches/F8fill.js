/* F8 no star fillers: a new fighter that 17 fillNight creates for an empty seat is rated tier floor + 0..9 instead of + 0..19
   (main 70-79 instead of 70-89, feature 56-65 instead of 56-75); his ratings (66 gStats) are re-rolled from the new overall.
   Slows the inflation of the free-agent pool the rivals sign from. */
{const base=fillNight;fillNight=function(){const w=W_();const before=new Set(w.glads.map(g=>g.id));const r=base.apply(this,arguments);
  try{for(const b of w.night.bouts){const T=TIERS[b.tier];if(!T||!T.lo)continue;for(const id of b.ents){if(before.has(id))continue;const g=gById(id);if(!g||g.ovr<=T.lo+9)continue;
    const nv=T.lo+Math.floor((g.ovr-T.lo)/2);g.pot=Math.max(nv,g.pot-(g.ovr-nv));g.ovr=nv;g.stats=null;g.st0=null;gStats(g)}}}catch(e){}return r}}

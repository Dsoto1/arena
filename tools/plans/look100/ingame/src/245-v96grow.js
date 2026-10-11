/* v0.96 grow — "picked something up around the ludus" (Manager). Beside the +0.2 Luck a week every contracted fighter gets for time with a house
   (66-mgr55 weeklyGrowth, which runs for EVERY house's contracted fighters), each fighter-week has a GROW96.chance (10%) of +GROW96.amt (0.2) to ONE
   other rating (Speed, Strength, Intelligence or Charisma). Deterministic: a hash of (world id, fighter id, absolute week) - never the dice RNG,
   never Math.random - so a save replays the same. Goes through statGain, so band-ups and the Week in review "From your Doctores" rows show it. */
const GROW96={chance:0.10,amt:0.2,keys:['spd','str','int','cha']};
/* grow96Roll - the stat key picked up this week by fighter g, or null (pure function of world id, fighter id, absolute week) */
function grow96Roll(w,g,week){let h=hashStr('grow96:'+(w&&w.id||'x')+':'+g.id+':'+week);const nx=()=>{h=Math.imul(h^(h>>>15),2246822519)>>>0;h=(h+0x9e3779b9)>>>0;h=Math.imul(h^(h>>>13),3266489917)>>>0;return h};
  if(nx()%1000>=GROW96.chance*1000)return null;return GROW96.keys[nx()%GROW96.keys.length]}
{const base=weeklyGrowth;weeklyGrowth=function(w){const r=base.apply(this,arguments);
  try{for(const g of w.glads){if(!g.alive||!g.contract)continue;const k=grow96Roll(w,g,w.week);if(k)statGain(g,k,GROW96.amt)}}catch(e){console.error(e)}return r}}

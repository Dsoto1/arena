/* v0.96 fix — 241-v96skip: the weekly checklist (and so "You are about to skip", the Your ludus list and the rail count) shows ONLY what can be done
   before this week ends. On the road (roadLocked76) the Infirmary and Training Yard are shut: wounds, beds, maimed, drills, hours, unlocked yard sessions go.
   Once the week's bouts are all fought: fighter-entry, empty-hand and starter items go. Repairs stay while a city square (the armorer) can be reached.
   They return next week. Last wrapper over weekChecklist. */
const SKIP241_ROAD=['⚕','🛏','🦿','🔒','🏋','⏳'],SKIP241_BOUTS=['⚔','⭐'];
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_();if(!w||w.dead||w.tutorial)return I;const n=w.night;
  const road=typeof roadLocked76==='function'&&roadLocked76(w);const fought=!!(n&&n.bouts&&n.bouts.length&&n.bouts.every(b=>b.done));const noCity=!n||n.bye;
  return I.filter(x=>{if(x.done)return true;if(road&&SKIP241_ROAD.includes(x.ic))return false;if(fought&&SKIP241_BOUTS.includes(x.ic))return false;if(noCity&&x.ic==='🩹')return false;return true})}catch(e){console.error(e)}return I}}

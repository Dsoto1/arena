/* =====================================================================
   35-TRAVEL · THE ROAD TO MATCH NIGHT (v0.42)
   =====================================================================
   A house that fights away from home must travel first. The cost is by road distance from your home city
   (free at home). Until it is paid, Match Week is open to read and to simulate, but you cannot enter
   fighters, walk the sand, visit that city's square or watch live. Now and then another house offers to
   pay your way — if you enter a fighter of THEIR choosing from your roster that night. Break the deal and
   you repay them double, and they remember.
   ===================================================================== */
/* travelHome — a house's home city as a location index (Roma, 6, when unknown). */
function travelHome(mgr){const i=LOCATIONS.findIndex(L=>L&&L.n===(mgr&&mgr.city));return i>0?i:6}
/* travelCost — the road to this week's host city: free at home, else 3–15 coin by distance, cut 15% per Stables level (at least 2). TWEAK: 3 + distance × 24. */
function travelCost(world){const m=me();const h=travelHome(m),li=world.night.loc;if(h===li)return 0;const A=LOCATIONS[h],B=LOCATIONS[li];if(!A||!B)return 6;
  const d=Math.hypot((A.x||0)-(B.x||0),(A.y||0)-(B.y||0));const base=clamp(Math.round(3+d*24),3,15);
  /* v0.45: the Stables (My Ludus → Facilities) cut the road bill 15% a level */
  const st=typeof facLvl==='function'?facLvl(m,'stables'):0;return st?Math.max(2,Math.round(base*(1-0.15*st))):base}
/* travelState — this week's travel record (made on first look): its cost, paid or not, an offer from another house, a deal taken. Fighters already booked pay the road at once. TWEAK: offer chance 60% for struggling houses, else 35%. */
function travelState(world){world=world||W_();const n=world&&world.night;if(!n)return null;
  if(n.travel&&!n.travel.paid&&!n.travel.deal){const c2=travelCost(world);if(c2>0)n.travel.cost=c2} /* stables built mid-week lower an unpaid bill */
  if(!n.travel){const c=travelCost(world);const m=me();n.travel={cost:c,paid:c===0,offer:null,deal:null,from:LOCATIONS[travelHome(m)].n};
    const mine=n.bouts.some(b=>b.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===m.id}));
    if(c>0&&mine){n.travel.paid=true;m.coin-=c;if(typeof tnews==='function')tnews(_T`🛣 Your fighters were already booked at ${esc(LOCATIONS[n.loc].n)}: the road cost ${coinAmt87(c)}.`)}
    // an offer from another house, now and then
    if(c>0&&!n.travel.paid&&Math.random()<(m.coin<100&&!(typeof thriving==='function'&&thriving(m))?0.6:0.35)){ /* v0.49: struggling houses get the offer more often */const ros=rosterOf(m).filter(g=>g.alive!==false&&!g.inj&&!g.lanista);const houses=world.mgrs.filter(x=>!x.isPlayer&&!x.dead);
      if(ros.length&&houses.length){const g=ros.sort((a,b)=>(b.fame||0)-(a.fame||0))[Math.floor(Math.random()*Math.min(3,ros.length))];const h=houses[Math.floor(Math.random()*houses.length)];
        n.travel.offer={mgr:h.id,gid:g.id,why:pickOne([_T('their patrons want to see'),_T('the crowd at the gate is asking for'),_T('their bookmakers have money riding on')])}}}}
  return n.travel}
/* travelOK — has the road been paid (or is there none)? */
function travelOK(world){const t=travelState(world);return !t||t.paid}
/* travelBlock — if the road is unpaid, says so (naming what waits on it) and returns true. */
function travelBlock(what){const w=W_();const t=travelState(w);if(!t||t.paid)return false;if(typeof mToast==='function')mToast(_T`🛣 Travel to <b>${esc(LOCATIONS[w.night.loc].n)}</b> first (${coinAmt87(t.cost)}) — then you can ${what}.`);return true}
/* travelCardHTML — the travel card on Match Week: home sand, on the road, week over, or the road to pay and any offer. */
function travelCardHTML(){const w=W_();const n=w.night;const t=travelState(w);if(!t)return '';const L=LOCATIONS[n.loc];const m=me();
  if(t.cost===0)return `<div class="card2 travelcard home">${_T`<b>🏠 Home sand</b> — this week's games are in ${esc(L.n)}, your own city. No road to pay for.`}</div>`;
  if(t.paid){const d=t.deal;const g=d&&gById(d.gid);const h=d&&mgrById(d.mgr);const kept=d&&n.bouts.some(b=>b.ents.includes(d.gid));
    return `<div class="card2 travelcard">${_T`<b>🛣 On the road to ${esc(L.n)}</b>`} <span class="rc-sub">${_T`${d?_T`paid by ${esc(h?h.ludus:_T('another house'))}`:_T`${coinAmt87(t.cost)} paid`} · from ${esc(t.from)}`}</span>${d?`<div style="margin-top:4px">${_T`${kept?'✅':'⏳'} The deal: enter <b>${esc(g?g.name:'?')}</b> tonight${kept?_T(' — done.'):_T(' — or repay them double at the week’s end.')}`}</div>`:''}</div>`}
  /* v0.46: once the night's results are in there is nothing left to travel to — the next road opens with the new week */
  if(n.bouts.every(b=>b.done)){const nx=typeof fixtureFor==='function'?fixtureFor(w.season+Math.floor(((((w.week-1)%12)+1))/12),w.week+1):null;const NL=nx&&LOCATIONS[nx.loc];
    return `<div class="card2 travelcard">${_T`<b>🛣 Match Week at ${esc(L.n)} is over</b> — you stayed home, and there is no road left to pay for this week.${NL?` <span class="rc-sub">${_T`Next week: <b>${esc(NL.n)}</b> — its road opens when you end the week.`}</span>`:''}`}</div>`}
  const o=t.offer;const og=o&&gById(o.gid);const oh=o&&mgrById(o.mgr);
  return `<div class="card2 travelcard due"><div class="travelrow"><b data-tip="${_T`Your house is in ${esc(t.from)}. Until you travel you can read and simulate Match Week, but you can’t enter fighters, walk the sand, visit the square or watch live.`}">${_T`🛣 Road to ${esc(L.n)}`} <span class="qi">ⓘ</span></b>
    <button class="btn primary" type="button" data-mg="travelpay" ${m.coin<t.cost?_T('disabled title="Not enough in the treasury"'):''}>${_T`💰 Travel · ${coinAmt87(t.cost)}`}</button></div>
    ${o&&og&&oh?`<div class="traveloffer">${_T`📜 <b>${esc(oh.ludus)}</b> offers to cover the road — ${esc(o.why)} <b>${esc(og.name)}</b>. Enter them in any bout tonight and the trip is theirs.`}
      <div class="acts" style="margin-top:4px"><button class="btn tksm" type="button" data-mg="traveldeal">${_T`🤝 Accept the deal`}</button><button class="btn tksm" type="button" data-mg="traveldecline">${_T`Decline`}</button></div></div>`:''}</div>`}
/* travelClick — handles the travel buttons: pay, accept the deal, decline; true when handled. */
function travelClick(act){const w=W_();const t=travelState(w);const m=me();if(!t)return false;if(act==='travelpay'&&w.night.bouts.every(b=>b.done)){if(typeof mToast==='function')mToast(_T('🛣 This week\u2019s games are over — the next road opens with the new week.'));return true}
  if(act==='travelpay'){if(t.paid||m.coin<t.cost)return true;m.coin-=t.cost;t.paid=true;tnews(_T`🛣 Travelled to ${esc(LOCATIONS[w.night.loc].n)} from ${esc(t.from)}: ${coinAmt87(t.cost)}.`);saveWorld();return true}
  if(act==='traveldeal'){if(!t.offer)return true;t.paid=true;t.deal={...t.offer};t.offer=null;const h=mgrById(t.deal.mgr);tnews(_T`🤝 ${esc(h?h.ludus:_T('Another house'))} pays your road to ${esc(LOCATIONS[w.night.loc].n)} — as long as ${esc((gById(t.deal.gid)||{}).name||_T('your fighter'))} fights tonight.`);saveWorld();return true}
  if(act==='traveldecline'){t.offer=null;saveWorld();return true}
  return false}
/* at the week's end: a broken deal is repaid double, and the house remembers */
/* travelWeekEnd — at the week's end, a deal whose fighter never fought is repaid double and the house holds a grudge (+6 rivalry). */
function travelWeekEnd(world){const n=world.night;const t=n&&n.travel;if(!t||!t.deal)return;const kept=n.bouts.some(b=>b.ents.includes(t.deal.gid));if(kept)return;
  const m=me();const h=mgrById(t.deal.mgr);const due=t.cost*2;m.coin-=due;if(h){h.rivalry=(h.rivalry||0)+6}
  tnews(_T`💢 ${esc((gById(t.deal.gid)||{}).name||_T('Your fighter'))} never fought — ${esc(h?h.ludus:_T('the house'))} takes back its road money twice over: ${coinAmt87('−'+(due))}, and a grudge.`,'bad');t.deal=null}

/* =====================================================================
   35-TRAVEL · THE ROAD TO MATCH NIGHT (v0.42)
   =====================================================================
   A house that fights away from home must travel first. The cost is by road distance from your home city
   (free at home). Until it is paid, Match Week is open to read and to simulate, but you cannot enter
   fighters, walk the sand, visit that city's square or watch live. Now and then another house offers to
   pay your way — if you enter a fighter of THEIR choosing from your roster that night. Break the deal and
   you repay them double, and they remember.
   ===================================================================== */
function travelHome(m){const i=LOCATIONS.findIndex(L=>L&&L.n===(m&&m.city));return i>0?i:6}
function travelCost(w){const m=me();const h=travelHome(m),li=w.night.loc;if(h===li)return 0;const A=LOCATIONS[h],B=LOCATIONS[li];if(!A||!B)return 6;
  const d=Math.hypot((A.x||0)-(B.x||0),(A.y||0)-(B.y||0));const base=clamp(Math.round(3+d*24),3,15);
  /* v0.45: the Stables (My Ludus → Facilities) cut the road bill 15% a level */
  const st=typeof facLvl==='function'?facLvl(m,'stables'):0;return st?Math.max(2,Math.round(base*(1-0.15*st))):base}
function travelState(w){w=w||W_();const n=w&&w.night;if(!n)return null;
  if(n.travel&&!n.travel.paid&&!n.travel.deal){const c2=travelCost(w);if(c2>0)n.travel.cost=c2} /* stables built mid-week lower an unpaid bill */
  if(!n.travel){const c=travelCost(w);const m=me();n.travel={cost:c,paid:c===0,offer:null,deal:null,from:LOCATIONS[travelHome(m)].n};
    const mine=n.bouts.some(b=>b.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===m.id}));
    if(c>0&&mine){n.travel.paid=true;m.coin-=c;if(typeof tnews==='function')tnews(`🛣 Your fighters were already booked at ${esc(LOCATIONS[n.loc].n)}: the road cost ${c} coin.`)}
    // an offer from another house, now and then
    if(c>0&&!n.travel.paid&&Math.random()<(m.coin<100&&!(typeof thriving==='function'&&thriving(m))?0.6:0.35)){ /* v0.49: struggling houses get the offer more often */const ros=rosterOf(m).filter(g=>g.alive!==false&&!g.inj&&!g.lanista);const houses=w.mgrs.filter(x=>!x.isPlayer&&!x.dead);
      if(ros.length&&houses.length){const g=ros.sort((a,b)=>(b.fame||0)-(a.fame||0))[Math.floor(Math.random()*Math.min(3,ros.length))];const h=houses[Math.floor(Math.random()*houses.length)];
        n.travel.offer={mgr:h.id,gid:g.id,why:pickOne(['their patrons want to see','the crowd at the gate is asking for','their bookmakers have money riding on'])}}}}
  return n.travel}
function travelOK(w){const t=travelState(w);return !t||t.paid}
function travelBlock(what){const w=W_();const t=travelState(w);if(!t||t.paid)return false;if(typeof mToast==='function')mToast(`🛣 Travel to <b>${esc(LOCATIONS[w.night.loc].n)}</b> first (${t.cost} coin) — then you can ${what}.`);return true}
function travelCardHTML(){const w=W_();const n=w.night;const t=travelState(w);if(!t)return '';const L=LOCATIONS[n.loc];const m=me();
  if(t.cost===0)return `<div class="card2 travelcard home"><b>🏠 Home sand</b> — this week's games are in ${esc(L.n)}, your own city. No road to pay for.</div>`;
  if(t.paid){const d=t.deal;const g=d&&gById(d.gid);const h=d&&mgrById(d.mgr);const kept=d&&n.bouts.some(b=>b.ents.includes(d.gid));
    return `<div class="card2 travelcard"><b>🛣 On the road to ${esc(L.n)}</b> <span class="rc-sub">${d?`paid by ${esc(h?h.ludus:'another house')}`:`${t.cost} coin paid`} · from ${esc(t.from)}</span>${d?`<div style="margin-top:4px">${kept?'✅':'⏳'} The deal: enter <b>${esc(g?g.name:'?')}</b> tonight${kept?' — done.':' — or repay them double at the week’s end.'}</div>`:''}</div>`}
  /* v0.46: once the night's results are in there is nothing left to travel to — the next road opens with the new week */
  if(n.bouts.every(b=>b.done)){const nx=typeof fixtureFor==='function'?fixtureFor(w.season+Math.floor(((((w.week-1)%12)+1))/12),w.week+1):null;const NL=nx&&LOCATIONS[nx.loc];
    return `<div class="card2 travelcard"><b>🛣 Match Week at ${esc(L.n)} is over</b> — you stayed home, and there is no road left to pay for this week.${NL?` <span class="rc-sub">Next week: <b>${esc(NL.n)}</b> — its road opens when you end the week.</span>`:''}</div>`}
  const o=t.offer;const og=o&&gById(o.gid);const oh=o&&mgrById(o.mgr);
  return `<div class="card2 travelcard due"><div class="travelrow"><b data-tip="Your house is in ${esc(t.from)}. Until you travel you can read and simulate Match Week, but you can’t enter fighters, walk the sand, visit the square or watch live.">🛣 Road to ${esc(L.n)} <span class="qi">ⓘ</span></b>
    <button class="btn primary" type="button" data-mg="travelpay" ${m.coin<t.cost?'disabled title="Not enough in the treasury"':''}>💰 Travel · ${t.cost} coin</button></div>
    ${o&&og&&oh?`<div class="traveloffer">📜 <b>${esc(oh.ludus)}</b> offers to cover the road — ${esc(o.why)} <b>${esc(og.name)}</b>. Enter them in any bout tonight and the trip is theirs.
      <div class="acts" style="margin-top:4px"><button class="btn tksm" type="button" data-mg="traveldeal">🤝 Accept the deal</button><button class="btn tksm" type="button" data-mg="traveldecline">Decline</button></div></div>`:''}</div>`}
function travelClick(a){const w=W_();const t=travelState(w);const m=me();if(!t)return false;if(a==='travelpay'&&w.night.bouts.every(b=>b.done)){if(typeof mToast==='function')mToast('🛣 This week\u2019s games are over — the next road opens with the new week.');return true}
  if(a==='travelpay'){if(t.paid||m.coin<t.cost)return true;m.coin-=t.cost;t.paid=true;tnews(`🛣 Travelled to ${esc(LOCATIONS[w.night.loc].n)} from ${esc(t.from)}: ${t.cost} coin.`);saveWorld();return true}
  if(a==='traveldeal'){if(!t.offer)return true;t.paid=true;t.deal={...t.offer};t.offer=null;const h=mgrById(t.deal.mgr);tnews(`🤝 ${esc(h?h.ludus:'Another house')} pays your road to ${esc(LOCATIONS[w.night.loc].n)} — as long as ${esc((gById(t.deal.gid)||{}).name||'your fighter')} fights tonight.`);saveWorld();return true}
  if(a==='traveldecline'){t.offer=null;saveWorld();return true}
  return false}
/* at the week's end: a broken deal is repaid double, and the house remembers */
function travelWeekEnd(w){const n=w.night;const t=n&&n.travel;if(!t||!t.deal)return;const kept=n.bouts.some(b=>b.ents.includes(t.deal.gid));if(kept)return;
  const m=me();const h=mgrById(t.deal.mgr);const due=t.cost*2;m.coin-=due;if(h){h.rivalry=(h.rivalry||0)+6}
  tnews(`💢 ${esc((gById(t.deal.gid)||{}).name||'Your fighter')} never fought — ${esc(h?h.ludus:'the house')} takes back its road money twice over: −${due} coin, and a grudge.`,'bad');t.deal=null}

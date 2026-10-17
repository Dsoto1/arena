/* v1.05 (383-v105riv) · MANAGER — RIVALRY WEEK (week 11, the Familia 2v2 against the rival house; his B62, B63, C1a; tools/plans/v105/NOTES.md).
   • B62 TRIP FREE: the organisers pay the road to Rivalry Week. n.travel is made PAID with cost kept (so the set-off window and the road lock still work) and
     flagged free105 — no coin is taken (not even for fighters already booked); the travel card and 360's banner chip read "trip paid by the games".
   • B63 ALWAYS SEATED. Root cause (reproduced): 77's rivalPick seats the player's house from rivalEligible, which called a fighter fit unless
     inj.until >= week — it ignored the game's own fitness (any non-war injury "cannot fight until treated", a rest day) — and when fewer than 2 were left
     it silently filled the places with FREE AGENTS (−8 fame); 345's M3 then closed the card (no enter / swap / withdraw), so the house had no fighter of
     its own in any bout and nothing to fix it with. Also the odd house out of rivalPairs could be the player's. Now: (1) rivalPairs seats the player's house
     first (the odd house is never his); (2) rivalEligible uses the game's fitness for the player's house; (3) a card on Match Week shows the pair (the two
     best fit, auto-picked) and lets him change it until he sets off / the first bout is fought; free-agent places are re-seated with his own fit fighters
     when they heal; (4) fewer than 2 fit = a warning with the forfeit rule (−8 fame, free agents fill the places). The rival is seated by 77 as before.
   Kill switch localStorage flavius_v105rivoff=1 (also restores 373's old ladder labels). Test tv105t. */
const RIV105={key:'flavius_v105rivoff'};
function riv105Off(){try{return localStorage.getItem(RIV105.key)==='1'}catch(e){return false}}
const riv105Wk=w=>!!(w&&!w.tutorial&&w.night&&w.night.rivalry&&!w.night.bye&&!w.night.selfBye);
/* the game's own fitness: alive, not a lanista, no injury (even a healed-by-date one still needs treating), not resting this week */
function riv105Fit(g,w){w=w||W_();return !!g&&g.alive!==false&&!g.lanista&&!g.inj&&!(g.restWk!=null&&g.restWk===w.week)&&!riv105Barred(g)}
/* 319's rule of who may be entered at all (in an infirmary bed, a lost limb, away at war): the sweep takes such a fighter off the card at once and puts a free agent in his place, so he is never fit for the pair */
function riv105Barred(g){try{return typeof r101Block==='function'&&!!r101Block(g)}catch(e){return false}}
/* ---- pairing: the player's house is never the odd house out ---- */
{const base=rivalPairs;rivalPairs=function(w){const P=base.apply(this,arguments);try{if(riv105Off())return P;const pm=me();
  if(pm&&P.bye.includes(pm.id)&&P.pairs.length){let best=null,bs=-1e9;
    for(let i=0;i<P.pairs.length;i++)for(let k=0;k<2;k++){const u=mgrById(P.pairs[i][k]);const s=u?rivalHeat(pm,u):-1e9;if(s>bs){bs=s;best={i,k}}}
    if(best){const pr=P.pairs[best.i];const u=pr[best.k],v=pr[1-best.k];P.pairs[best.i]=[pm.id,u];P.bye=P.bye.filter(x=>x!==pm.id).concat([v])}}}catch(e){console.error(e)}return P}}
/* ---- the player's eligible fighters use the same fitness as the rest of the game ---- */
{const base=rivalEligible;rivalEligible=function(w,m,abs){const r=base.apply(this,arguments);try{if(!riv105Off()&&m&&m.isPlayer)return r.filter(g=>riv105Fit(g,w))}catch(e){}return r}}
/* ---- B62: the organisers pay the road ---- */
{const base=travelState;travelState=function(world){try{if(!riv105Off()){const w=world||W_();if(riv105Wk(w)){const n=w.night;
  if(!n.travel){const c=travelCost(w);if(c>0)n.travel={cost:c,paid:true,offer:null,deal:null,from:LOCATIONS[travelHome(me())].n,free105:1}}
  else if(!n.travel.free105&&n.travel.cost>0&&!n.travel.paid&&!n.travel.deal){n.travel.paid=true;n.travel.free105=1;n.travel.offer=null}}}}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=travelCardHTML;travelCardHTML=function(){let h=base.apply(this,arguments);try{const w=W_();const t=w&&w.night&&w.night.travel;
  if(!riv105Off()&&t&&t.free105&&t.cost>0)h=`<div class="card2 travelcard"><b>${_T`🛣 On the road to ${esc(LOCATIONS[w.night.loc].n)}`}</b> <span class="rc-sub">${_T`from ${esc(t.from)} · trip paid by the games`}</span></div>`}catch(e){}return h}}
/* ---- B63: the house's pair in its rivalry bout ---- */
function riv105Bout(w){const n=w&&w.night;const pm=me();if(!n||!pm||!n.bouts)return null;const i=n.bouts.findIndex(b=>b.rivalry&&(b.rivalry.a===pm.id||b.rivalry.b===pm.id));if(i<0)return null;
  const b=n.bouts[i];return {i,b,slots:b.rivalry.a===pm.id?[0,2]:[1,3]}}
function riv105Locked(w){const n=w.night;const t=n.travel;return !!((t&&t.gone)||n.bouts.some(b=>b.done))}
const riv105Own=(g,pm)=>!!g&&!!g.contract&&g.contract.mgr===pm.id;
/* a place held by a free agent (or by a fighter who has since fallen unfit) goes to one of his fit fighters, best first */
function riv105Reseat(w){try{const R=riv105Bout(w);if(!R||riv105Locked(w))return false;const pm=me();const {b,slots}=R;let ch=false;
  const pool=rosterOf(pm).filter(g=>riv105Fit(g,w)).sort((a,c)=>effOvr(c)-effOvr(a));
  for(const s of slots){const cur=gById(b.ents[s]);if(riv105Own(cur,pm)&&riv105Fit(cur,w))continue;
    const pick=pool.find(g=>!b.ents.includes(g.id));if(!pick)continue;const gone=b.ents[s];b.ents[s]=pick.id;if(typeof voidBets==='function')voidBets(b,gone);ch=true}
  if(ch)saveWorld();return ch}catch(e){console.error(e);return false}}
function riv105Card(w){const R=riv105Bout(w);if(!R)return '';const pm=me();const {b,slots}=R;const lock=riv105Locked(w);
  const fit=rosterOf(pm).filter(g=>riv105Fit(g,w)).sort((a,c)=>effOvr(c)-effOvr(a));
  const cur=slots.map(s=>gById(b.ents[s]));const mine=cur.filter(g=>riv105Own(g,pm)).length;
  const sel=(id,i)=>`<select class="tin" id="riv105${id}" ${lock||fit.length<2?'disabled':''}>${fit.map(g=>`<option value="${g.id}" ${cur[i]&&cur[i].id===g.id?'selected':''}>${esc(g.name)} · ${effOvr(g)}</option>`).join('')}</select>`;
  const warn=fit.length<2?`<p class="bad riv105w">${_T`⚠ Only ${fit.length} fit fighter${fit.length===1?'':'s'}. Two must stand together: the house loses ${RIVAL_FAME_SHORT} fame and the editor fills ${2-fit.length===1?_T('the place'):_T('both places')} with free agents.`}</p>`:'';
  const foe=rivalOf(w,pm.id);
  return `<div class="card2 riv105" data-riv105card="1"><b>${_T`⚔ Your pair vs ${esc(foe?foe.ludus:'—')}`}</b> <span class="rc-sub">${lock?_T('Set — the house has set off.'):_T('The two best fit, picked for you. Change them until you set off.')}</span>
    <div class="acts" style="align-items:center;margin-top:6px">${sel('A',0)}${sel('B',1)}<button class="btn primary tksm" type="button" data-riv105="set" ${lock||fit.length<2?'disabled':''}>${_T('Set pair')}</button></div>${warn}
    ${mine<2&&fit.length>=2&&!lock?`<p class="rc-sub">${_T('A free agent holds a place — set your pair.')}</p>`:''}</div>`}
document.addEventListener('click',e=>{try{const el=e.target.closest&&e.target.closest('[data-riv105="set"]');if(!el||riv105Off())return;const w=W_();const R=riv105Bout(w);if(!R||riv105Locked(w))return;
  const a=(document.getElementById('riv105A')||{}).value,c=(document.getElementById('riv105B')||{}).value;
  if(!a||!c||a===c){if(typeof mToast==='function')mToast(_T('Choose two different fighters.'));return}
  const {b,slots}=R;[a,c].forEach((id,k)=>{const s=slots[k];const gone=b.ents[s];if(gone!==id){b.ents[s]=id;if(typeof voidBets==='function')voidBets(b,gone)}});
  const pm=me();if(w.rivalry&&w.rivalry.commit)w.rivalry.commit[pm.id]=[a,c];saveWorld();if(typeof mnews==='function')mnews(_T`⚔ Your pair for Rivalry Week: <b>${esc(gById(a).name)}</b> and <b>${esc(gById(c).name)}</b>.`);
  if(typeof MGR_REDRAW==='function')MGR_REDRAW()}catch(err){console.error(err)}});
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{if(riv105Off())return h;const w=W_();if(!riv105Wk(w))return h;riv105Reseat(w);return riv105Card(w)+h}catch(e){console.error(e)}return h}}
/* the pair is checked at the start of the week too (an injury that healed at once, a place held by a free agent) */
{const base=makeNight;makeNight=function(){const r=base.apply(this,arguments);try{const w=W_();if(!riv105Off()&&riv105Wk(w))riv105Reseat(w)}catch(e){console.error(e)}return r}}

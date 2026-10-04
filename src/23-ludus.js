/* =====================================================================
   23-LUDUS · FACILITIES, RIVAL LANISTAE AT WORK, TEAM SCREENS & CORRESPONDENCE (v0.28)
   =====================================================================
   • Facilities: permanent, expensive upgrades — the Training yard, the Valetudinarium (infirmary wing),
     the Barracks, the Armory and the Practice stands. Each has three levels; together they set the
     LUDUS GRADE that recruits look at. Rival stables build them too.
   • Rival lanistae run their houses every week (drills, feasts, medicus, family tickets, building,
     courting and poaching) and every act lands in their own ledger (m.log) — read it on their team screen.
   • Team screens (League → click a stable): the lanista, the house, the roster, the ledger, and a
     CORRESPONDENCE panel in the manner of a diplomatic screen — opinion with its reasons, and envoys:
     gifts, practices, trades, a non-poaching pact, gossip, or a public insult.
   ===================================================================== */
/* FAC — the ludus facilities: name, icon, description and what each level does. TWEAK: the effect texts (the effects themselves live where they are used). */
const FAC={
  yard:{n:'Training yard',i:'🏋',d:_T('Better palus posts, sand pits and weights'),fx:l=>_T`+${l*5}% training gains · ${l*20}% fewer drill injuries`},
  valet:{n:'Valetudinarium',i:'⚕',d:_T('A proper infirmary wing for your physicians'),fx:l=>_T`physicians' weekly cap +${l*25} coin of work`},
  barracks:{n:'Barracks',i:'🛏',d:_T('Dry cells, real beds, a cook who cares'),fx:l=>_T`+${l} morale for every fighter each week · fighters sign for ${l*4}% less`},
  armory:{n:'Armory',i:'🛡',d:_T('Fitted armor for every fighter who leaves your ludus'),fx:l=>_T`+${l} AP fitted at the start of every bout`},
  stands:{n:'Practice stands',i:'🏟',d:_T('Benches where the city pays to watch you train'),fx:l=>_T`+${l*10} coin a week from practice crowds · Spectacle grade +${l*6}`},
  stables:{n:'Stables',i:'🐎',d:_T('Horses, wagons and a road crew of your own'),fx:l=>_T`travel to away games costs ${l*15}% less`}}; /* v0.45 */
/* FAC_COST — coin cost of facility levels 1 / 2 / 3. TWEAK. */
const FAC_COST=[250,600,1200];
/* facLvl — a lanista's level (0–3) in one facility. A const arrow — cannot be wrapped. */
const facLvl=(mgr,facKey)=>mgr&&mgr.fac?(mgr.fac[facKey]||0):0;
/* facSum — all of a lanista's facility levels added up (sets the ludus grade). */
const facSum=mgr=>Object.keys(FAC).reduce((a,k)=>a+facLvl(mgr,k),0);
/* [facility levels needed, grade] for the ludus grade. TWEAK. */
const LGRADES=[[0,'D'],[1,'C'],[3,'C+'],[5,'B'],[7,'B+'],[9,'A'],[12,'A+'],[15,'S']];
/* ludusGrade — the ludus grade from the facility total (D … S). */
const ludusGrade=mgr=>{const n=facSum(mgr);let g='D';for(const [t,l] of LGRADES)if(n>=t)g=l;return g};
/* repCap — the weekly infirmary allowance: REPAIR_CAP + 25 per Valetudinarium level. */
const repCap=()=>REPAIR_CAP+25*facLvl(me(),'valet');
/* facilitiesHTML — the facilities panel: each facility, its level, effect and Build button (one build a week). */
function facilitiesHTML(){const w=W_(),m=me();m.fac=m.fac||{};const built=m.facWk===w.week;
  return `<div class="card2 faccard"><div class="schoolhd"><div><div class="sect" style="margin:0">${_T`🏗 Facilities`}</div><span class="rc-sub">${_T`Permanent. Recruits grade your house on them — together they set your <b>Ludus grade</b>. One project a week.`}</span></div><div class="gradebox" style="--gc:${gradeCol(ludusGrade(m))}" title="${_T`Ludus grade — from ${facSum(m)} of ${Object.keys(FAC).length*3} facility levels`}">${ludusGrade(m)}</div></div>
    <div class="faclist">${Object.entries(FAC).map(([k,F])=>{const l=facLvl(m,k);const cost=FAC_COST[l];
      return `<div class="facrow"><span class="faci">${F.i}</span><div class="fact"><b>${F.n}</b> <span class="facpips">${[0,1,2].map(i=>`<i class="${i<l?'on':''}"></i>`).join('')}</span><div class="rc-sub">${l?F.fx(l):F.d}</div>${l<3?`<div class="rc-sub">${_T`Next: ${F.fx(l+1)}`}</div>`:''}</div>
        ${l<3?`<button class="btn tksm" type="button" data-mg="build" data-id="${k}" ${dis([built,_T('Your builders are already busy this week.')],needCoin(m,cost))}>${_T`Build ${['I','II','III'][l]}<small>${cost} coin</small>`}</button>`:'<span class="badge gold">complete</span>'}</div>`}).join('')}</div></div>`}
/* facBuild — builds the next level of a facility if the lanista can afford it. */
function facBuild(mgr,facKey,quiet){const l=facLvl(mgr,facKey);if(l>=3)return false;const cost=FAC_COST[l];if(mgr.coin<cost)return false;mgr.coin-=cost;mgr.fac=mgr.fac||{};mgr.fac[facKey]=l+1;mgr.facWk=W_().week;
  const F=FAC[facKey];mlog(mgr,_T`🏗 built the ${F.n} ${['I','II','III'][l]} (${cost} coin) — ${F.fx(l+1)}`);
  if(!quiet)mnews(_T`🏗 <b>${esc(mgr.ludus)}</b> ${mgr.isPlayer?'(you) ':''}completes the ${F.n} ${['I','II','III'][l]}. Ludus grade ${ludusGrade(mgr)}.`);return true}
// weekly facility effects for every house (called when the week ends)
/* facWeek — weekly facility effects for every house: barracks morale, practice-stand ticket coin. */
function facWeek(){const w=W_();for(const m of w.mgrs){const b=facLvl(m,'barracks'),st=facLvl(m,'stands');
  if(b)for(const g of rosterOf(m))g.morale=clamp(g.morale+b,0,100);
  if(st){m.coin+=st*10;if(m.isPlayer)tnews(_T`🏟 The practice stands took ${st*10} coin in tickets this week.`)}}}

/* ---------------- rival lanistae at work: every act goes in their ledger ---------------- */
function mlog(mgr,txt){if(!mgr)return;const w=W_();(mgr.log=mgr.log||[]).unshift({s:w.season,wk:w.week,txt});mgr.log=mgr.log.slice(0,40)}
/* aiLanistaWeek — rival houses run their week: backers' income, drills, feasts, medicus, family tickets, building, envoys — each act logged in their ledger. */
function aiLanistaWeek(){const w=W_();
  for(const m of w.mgrs){if(m.isPlayer)continue;const P=m.p;
    // v0.29 A LEAGUE THAT STAYS ALIVE: old houses have old backers (weekly income that grows with fame)…
    const pat=Math.round(22+(m.fame||0)*0.6);m.coin+=pat;
    // …a house sunk in debt is bought out by a new patron rather than left to die
    if(m.coin<-60){m.coin=120;m.fame=clamp((m.fame||0)-8,0,100);mlog(m,_T('💼 debts bought out by a new backer (−8 fame)'));mnews(_T`💼 <b>${esc(m.ludus)}</b> was drowning in debt — a wealthy backer buys the house and its debts. The gossip costs them 8 fame.`)}
    // …and a thin barracks is refilled from the free agents it can afford
    {let ros2=rosterOf(m);let guard=0;while(ros2.length<3&&guard++<3){const fa=freeAgents().filter(g=>!g.inj&&askWage(g)*3<=Math.max(30,m.coin)).sort((a,b)=>(effOvr(b)-askWage(b)*0.8)-(effOvr(a)-askWage(a)*0.8))[0];if(!fa)break;
      fa.contract={mgr:m.id,wage:askWage(fa),weeks:6+rnd(7),since:w.week};fa.unsigned=0;fa.morale=clamp(fa.morale||60,40,90);ghist(fa,_T`signed with ${m.ludus} to fill the barracks`);mlog(m,_T`signed ${fa.name} to fill the barracks`);ros2=rosterOf(m)}}
    const ros=rosterOf(m);
    // the yard: discipline picks the regime; a brutal week is worth a line in the ledger
    const reg=P.discipline>70?'hard':P.discipline>45?'std':'light';m.train=reg;devNote(m,{hard:30,std:15,light:6}[reg]);if(reg==='hard'&&Math.random()<.35)mlog(m,_T`🏋 ran brutal drills — ${ros.length} fighters in the yard at dawn`);
    // the infirmary: greedy houses let wounds wait; honest ones pay the Medicus
    for(const g of ros.filter(g=>g.inj&&!g.inj.war)){if(m.coin>30&&Math.random()<.35+P.honor/300){const q=typeof injReq==='function'?injReq(g.inj):'medicus';if(q!=='surgeon'){m.coin-=MEDICUS;g.inj=null;mlog(m,_T`⚕ paid the Medicus for ${g.name}`)}else if(m.coin>50){m.coin-=SURGEON;g.inj=null;mlog(m,_T`🔪 sent ${g.name} under the surgeon's knife`)}}}
    // morale work: family tickets, a shared meal, a bonus for the unhappy
    const low=ros.filter(g=>g.morale<45).sort((a,b)=>a.morale-b.morale)[0];
    if(low&&m.coin>20&&Math.random()<.5){const r=Math.random();if(r<.4){m.coin-=4;low.morale=clamp(low.morale+5,0,100);mlog(m,_T`🎟 bought tickets for ${low.name}'s family`)}else if(r<.75){m.coin-=3;low.morale=clamp(low.morale+6,0,100);mlog(m,_T`🍷 shared a meal with ${low.name}`)}else{const bn=giftCost(low);m.coin-=bn;low.morale=clamp(low.morale+8,0,100);mlog(m,_T`💰 paid ${low.name} a ${bn}-coin bonus`)}}
    // promotion: showmen feed a city, hire criers, sponsor the games
    if(m.coin>60&&Math.random()<P.show/280){const r=Math.random();const city=pickOne(LOCATIONS.filter(Boolean)).n;if(r<.5){m.coin-=10;m.fame=clamp(m.fame+1,0,100);mlog(m,_T`🍞 fed the people of ${city} in the ludus's name (+1 fame)`)}else if(r<.8){m.coin-=6;mlog(m,_T`📢 hired the criers — every free agent hears the name ${m.ludus}`);for(const g of freeAgents().slice(0,12))g.interest[m.id]=capInterest(g,m,interestOf(g,m)+2)}else{m.coin-=18;m.fame=clamp(m.fame+2,0,100);mlog(m,_T`🎪 sponsored the games — the house's name over the gate (+2 fame)`)}}
    // building: the rich and ambitious pour stone
    if(Math.random()<.14+P.ambition/700){const ks=Object.keys(FAC).filter(k=>facLvl(m,k)<3).sort((a,b)=>facLvl(m,a)-facLvl(m,b));const k=P.discipline>60&&ks.includes('yard')?'yard':P.show>60&&ks.includes('stands')?'stands':ks[0];
      if(k&&m.coin>FAC_COST[facLvl(m,k)]*2.2)facBuild(m,k)}
  }}

/* ---------------- opinion: what a rival lanista thinks of you, and why ---------------- */
/* opinionOf — what a rival lanista thinks of you (0–100) and the reasons. */
function opinionOf(mgr){const pm=me();const L=[];let v=50;
  const riv=Math.max(mgr.rivalry||0,(mgr.rivals||{})[pm.id]||0);if(riv){const d=Math.round(riv*.6);L.push([-d,riv>=35?_T('A bitter rivalry with your house'):_T('Rivalry and old grudges')]);v-=d}
  if(pm.city===mgr.city){L.push([-8,_T`Both of ${mgr.city}`]);v-=8}
  const hon=Math.round((pm.p.honor-50)/5);if(hon){L.push([hon,hon>0?_T('Your honor is known'):_T('Your word is doubted')]);v+=hon}
  if(mgr.relB){L.push([mgr.relB,_T('Gifts, trades and pacts')]);v+=mgr.relB}
  if(mgr.poachedByMe){L.push([-mgr.poachedByMe*10,_T`You poached ${mgr.poachedByMe} of theirs`]);v-=mgr.poachedByMe*10}
  if(mgr.insulted){L.push([-mgr.insulted,_T('Your public insults')]);v-=mgr.insulted}
  const W=W_();if(mgr.pact&&mgr.pact>=W.week){L.push([10,_T('Non-poaching pact')]);v+=10}
  return {v:clamp(Math.round(v),0,100),L}}
/* opTier — an opinion as [word, color] (Hostile … Friendly). */
const opTier=opinion=>opinion<20?[_T('Hostile'),'#e04a3a']:opinion<40?[_T('Cold'),'#e0843a']:opinion<60?[_T('Neutral'),'#c9ccd3']:opinion<80?[_T('Cordial'),'#9bd070']:[_T('Friendly'),'#5fd07a'];
/* greetLine — how a rival's steward greets your envoy, by opinion and character. */
function greetLine(mgr,opinion){const P=mgr.p;const hostile=[_T('Say what you came to say, and leave my gate.'),_T('My fighters remember your name. So do I.'),_T('You have courage, sending an envoy here.')],cold=[_T('Speak. Quickly.'),_T('We are listening — for now.'),_T('The steward will show you to a chair. Not a good one.')],
  neutral=[_T('Well met. What does your house want?'),_T('The sand is wide enough for both of us. Usually.'),_T('Wine? No? Then business.')],warm=[_T('Ah — a friend of the house! Sit, sit.'),_T('Your envoy is always welcome here.'),_T('Whatever it is, the answer is probably yes.')];
  const pool=opinion<20?hostile:opinion<40?cold:opinion<60?neutral:warm;return pool[(mgr.id.length+W_().week)%pool.length]+(P.greed>70?_T(' And remember — nothing here is free.'):P.honor>75?_T(' My word is my bond.'):'')}

/* ---------------- the team screen ---------------- */
/* teamHTML — a rival stable's team screen: lanista, house, roster, ledger and correspondence. */
function teamHTML(){const w=W_(),pm=me();const m=mgrById(MGR.teamId);if(!m)return `<p>${_T`No such stable.`}</p>`;if(m.isPlayer){MGR.tab='me';return meHTML()}
  const ros=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));const op=opinionOf(m);const [tn,tc]=opTier(op.v);const envoyUsed=m.envoyWk===w.week;
  const rec=`${m.wins}-${Math.max(0,m.bouts-m.wins)}`;
  const form=g=>(g.recent||[]).slice(-5).map(x=>`<span class="fchip ${x.won?'w':x.place===2?'p':''}" title="${_T`S${x.s} W${x.wk} · ${esc(x.t)} · ${esc(x.ev)} at ${esc(x.loc)} · ${x.won?_T('won'):x.place?'#'+x.place:_T('fought')} · ${x.f} CF`}">${x.won?'W':x.place||'·'}</span>`).join('')||'<span class="rc-sub">—</span>';
  const row=g=>{const sc=g.scout;return `<tr><td><button class="btn" type="button" data-mg="fav" data-id="${g.id}" title="${_T`${g.favd?_T('Remove from'):_T('Pin to')} your Favorites`}" style="padding:1px 4px;border:none;background:none;font-size:15px;color:${g.favd?'var(--gold2)':'var(--dim)'}">${g.favd?'★':'☆'}</button></td><td>${gArt(g,'xs')}</td><td><b>${esc(g.name)}</b> <span class="rc-sub">${CLASSES[g.cls]?CLASSES[g.cls].name:''} · ${gAge(g)}</span></td><td class="n">${sc?effOvr(g):'~'+pubOvr(g)} <span class="stars">${'★'.repeat(starsOf(pubOvr(g)))}</span></td><td class="n">${g.rec.w}-${Math.max(0,g.rec.ev-g.rec.w)}</td><td class="nowrap">${form(g)}</td><td class="n">${sc?g.morale:'?'}</td><td class="n rc-sub">${sc?_T`${g.contract.wage}/wk · ${Math.max(0,g.contract.weeks)} wk`:'?'}</td></tr>`};
  const acts=[
    ['gift',_T('🎁 Send gifts'),'25 coin · +12 opinion',needCoin(pm,25)],
    ['practice',_T('🏋 Propose a practice'),_T('an exhibition against their fighters (Practice tab)'),[op.v<25,_T`${m.name} will not spar with a house they despise (opinion ${op.v}, needs 25).`]],
    ['trade',_T('🔁 Propose a trade'),_T('one of yours for one of theirs, coin to sweeten'),[op.v<20,_T`${m.name} will not trade with you (opinion ${op.v}, needs 20).`]],
    ['pact',_T('🤝 Non-poaching pact'),_T('30 coin · 8 weeks: neither house poaches the other'),[op.v<55,_T`A pact needs trust (opinion ${op.v}, needs 55).`],needCoin(pm,30)],
    ['gossip',_T('🕵 Ask for gossip'),_T('they talk about one of their fighters (scouted)'),[op.v<40,_T`They do not gossip with strangers (opinion ${op.v}, needs 40).`]],
    ['insult',_T('🗡 Insult them publicly'),_T('+2 fame (the crowd loves a feud) · −15 opinion, +15 rivalry'),[false,'']]];
  const tr=MGR.trade&&MGR.trade.mid===m.id?MGR.trade:null;
  return `<div class="acts" style="margin-bottom:8px"><button class="btn" type="button" data-mg="tab" data-id="league">${_T`← Back to the League`}</button></div>
   <div class="teamlay"><div>
    <div class="card2"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">${typeof mgrPortrait==='function'?mgrPortrait(m,'md'):''}<div style="flex:1;min-width:200px"><div style="display:flex;gap:8px;align-items:center">${typeof flagChip==='function'?flagChip(m,30):''}<div style="font:400 24px var(--display);color:${m.color}">${esc(m.ludus)}</div></div>
      <div class="rc-sub">${_T`${esc(m.name)} · ${esc(m.city)} · a house of ${esc(mgrTier(m.fame))} standing`}</div><div class="rc-sub" style="margin-top:4px">${esc(m.bio||'')}</div></div>
      <div class="gradebox" style="--gc:${gradeCol(ludusGrade(m))}" title="${_T`Ludus grade`}">${ludusGrade(m)}</div></div>
      <div class="rc-stats" style="margin-top:8px">${_T`<span><b>${m.fame}</b>★ Fame</span><span><b>${rec}</b>Record</span><span><b>${ros.length}</b>Fighters</span><span><b>${m.coin>500?_T('rich'):m.coin>150?_T('comfortable'):m.coin>40?_T('lean'):_T('broke')}</b>Treasury</span><span><b>${facSum(m)}/15</b>Facility levels</span>`}</div>
      <div class="rc-sub" style="margin-top:6px">${MGR_KEYS.map(([k,l])=>`${l} ${m.p[k]}`).join(' · ')}</div></div>
    <div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">${_T`🛡 Roster`} <span class="rc-sub">${_T`ratings with ~ are the public estimate — scout for the truth`}</span></div>${ros.length?`<table class="tally compact"><tr><th></th><th></th><th>${_T`Fighter`}</th><th>${_T`Rating`}</th><th>${_T`Record`}</th><th title="${_T`Last five bouts, oldest first: W = won, 2 = runner-up`}">${_T`Recent`}</th><th>${_T`Morale`}</th><th>${_T`Contract`}</th></tr>${ros.map(row).join('')}</table>`:`<p class="rc-sub">${_T`An empty barracks.`}</p>`}</div>
    <div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">${_T`📅 Coming up for ${esc(m.ludus)}`}</div>${(()=>{const n=w.night;const out=[];
      if(n)for(const b of n.bouts){const mine=b.ents.map(gById).filter(g=>g&&g.contract&&g.contract.mgr===m.id);for(const g of mine)out.push(`<div>${b.done?'✓':'⚔'} <b>${esc(g.name)}</b> <span class="rc-sub">${_T`— ${esc(TIERS[b.tier].n)}, ${esc((EVENTS[b.ev]||{}).n||'')} at ${esc(LOCATIONS[n.loc].n)}${b.done&&b.res?` · ${b.res.winners.includes(g.id)?'<b class="up">won</b>':'lost'}`:_T(' · this week')}`}</span></div>`)}
      if(w.special&&!w.special.done)for(const r of w.special.rounds)for(const hh of r)for(const e of hh.ents){const g=e.gid&&gById(e.gid);if(g&&g.contract&&g.contract.mgr===m.id)out.push(`<div>⭐ <b>${esc(g.name)}</b> <span class="rc-sub">— ${esc(w.special.D.n)}</span></div>`)}
      return out.join('')||`<p class="rc-sub" style="margin:0">${_T`Nobody from this house is on this week’s card yet.`}</p>`})()}</div>
   </div><div>
    <div class="comms"><div class="commshd"><span class="commsig">📜 CORRESPONDENCE</span><span class="badge" style="color:${tc};border-color:${tc}">${tn} · ${op.v}</span></div>
      <div class="commsbody">${typeof mgrPortrait==='function'?mgrPortrait(m,'sm'):''}<div><b>${esc(m.name)}</b><p class="commsq">“${esc(greetLine(m,op.v))}”</p></div></div>
      <div class="opbar"><i style="width:${op.v}%;background:${tc}"></i></div>
      <div class="oplist">${op.L.length?op.L.map(([n,t])=>`<div><b class="${n>=0?'up':'dn'}">${n>=0?'+':''}${n}</b> ${esc(t)}</div>`).join(''):`<div class="rc-sub">${_T`No history between your houses.`}</div>`}</div>
      <div class="sect">${_T`Send an envoy`} <span class="rc-sub">${envoyUsed?_T('· your envoy has already called this week'):_T('· one envoy per house a week')}</span></div>
      <div class="commsacts">${acts.map(([k,l,sub,...chk])=>`<button class="btn" type="button" data-mg="envoy" data-id="${m.id}|${k}" ${envoyUsed&&k!=='practice'?dis([true,_T('Your envoy has already called on this house this week.')]):dis(...chk.filter(Boolean))}>${l}<small>${sub}</small></button>`).join('')}</div>
      ${tr?tradeHTML(m,tr):''}
      ${w.loan&&w.loan.mgr===m.id&&w.loan.amt>0?`<div class="tradebox"><div class="sect" style="margin-top:0">${_T`💸 Your debt to this house`}</div><p class="rc-sub" style="margin:0 0 4px">${_T`<b>${w.loan.amt} coin owed</b> · 8% a week. Paying early warms them to you.`}</p><div class="acts"><button class="btn tksm" type="button" data-mg="loanpay" ${pm.coin<Math.min(w.loan.amt,50)?'disabled':''}>${_T`Pay 50`}</button><button class="btn primary tksm" type="button" data-mg="loanpayall" ${pm.coin<w.loan.amt?'disabled':''}>${_T`Pay all · ${w.loan.amt}`}</button></div></div>`:''}
      ${m.pact&&m.pact>=w.week?`<p class="rc-sub" style="margin:6px 0 0">${_T`🤝 Non-poaching pact until week ${wkOf(m.pact)}.`}</p>`:''}</div>
    <div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">${_T`📜 Their ledger`} <span class="rc-sub">${_T`what this house has been doing`}</span></div><div class="news" style="max-height:220px">${(m.log||[]).length?m.log.map(x=>`<div><span class="rc-sub">S${x.s} W${x.wk} · </span>${esc(x.txt)}</div>`).join(''):`<div class="rc-sub">${_T`Nothing on record yet — the ledger fills as the weeks go by.`}</div>`}</div></div>
   </div></div>`}
/* tradeVal — what a fighter is worth in a trade (rating, potential, fame, age, wage). */
function tradeVal(glad){return effOvr(glad)+Math.max(0,glad.pot-glad.ovr)*0.6+(glad.fame||0)*0.2-Math.max(0,gAge(glad)-30)*1.5-(glad.contract?glad.contract.wage*0.3:0)}
/* tradeHTML — the trade panel with a rival house. */
function tradeHTML(mgr,trade){const pm=me();const mine=rosterOf(pm).sort((a,b)=>effOvr(b)-effOvr(a)),theirs=rosterOf(mgr).sort((a,b)=>effOvr(b)-effOvr(a));
  return `<div class="tradebox"><div class="sect" style="margin-top:0">${_T`🔁 A trade with ${esc(mgr.ludus)}`}</div>
    <div class="bslip"><label>${_T`You send`} <select class="tin" id="trMine" style="width:auto">${mine.map(g=>`<option value="${g.id}" ${trade.mine===g.id?'selected':''}>${esc(g.name)} · ${effOvr(g)} · ${g.contract.wage}/wk</option>`).join('')}</select></label>
     <label>${_T`For`} <select class="tin" id="trTheirs" style="width:auto">${theirs.map(g=>`<option value="${g.id}" ${trade.theirs===g.id?'selected':''}>${esc(g.name)} · ${g.scout?effOvr(g):'~'+pubOvr(g)} · ${g.scout?g.contract.wage+'/wk':'?'}</option>`).join('')}</select></label>
     <label>+ coin <input type="number" class="tin" id="trCoin" min="0" value="${trade.coin||0}" style="width:5em"></label></div>
    <p class="rc-sub" style="margin:4px 0">${_T`Contracts travel with the fighters (same wage, same weeks). They weigh rating, potential, fame, age and wage — and how much they like you.`}</p>
    ${trade.msg?`<div class="traderes ${trade.ok?'ok':'no'}">${trade.ok?'✅':'✉'} ${trade.msg}</div>`:''}
    <div class="acts">${mgr.envoyWk===W_().week?`<span class="rc-sub" style="align-self:center">${_T`Your envoy has already called on ${esc(mgr.ludus)} this week — try again next week.`}</span><button class="btn" type="button" data-mg="tradex">${_T`Close`}</button>`:`<button class="btn primary" type="button" data-mg="tradego" data-id="${mgr.id}">${_T`Send the proposal`}</button><button class="btn" type="button" data-mg="tradex">${_T`Cancel`}</button>`}</div></div>`}
/* ludusClick — the facilities / team screen / correspondence actions (build, envoys, gifts, pacts, trades, insults). */
async function ludusClick(action,id,btn,ctx){const w=W_(),pm=me();if(!w||!pm)return false;const {redraw,say}=ctx;
  if(action==='build'){if(pm.facWk===w.week){say(_T('Your builders are already busy this week.'));return true}const l=facLvl(pm,id);if(l>=3)return true;if(pm.coin<FAC_COST[l]){say(_T`The ${FAC[id].n} ${['I','II','III'][l]} costs ${FAC_COST[l]} coin.`);return true}
    facBuild(pm,id);tnews(_T`🏗 Built the ${FAC[id].n} ${['I','II','III'][l]} — ${FAC[id].fx(l+1)}. Ludus grade ${ludusGrade(pm)}.`,'big');saveWorld();say(_T`🏗 The ${FAC[id].n} ${['I','II','III'][l]} is built. Ludus grade <b>${ludusGrade(pm)}</b>.`);return true}
  if(action==='run'){MGR.run=id;redraw();return true}
  if(action==='team'){MGR.teamId=id;MGR.tab=id===pm.id?'me':'team';MGR.trade=null;redraw();return true}
  if(action==='envoy'){const [mid,k]=id.split('|');const m=mgrById(mid);if(!m)return true;const op=opinionOf(m);
    if(k==='practice'){MGR.tab='practice';MGR.pOpp=m.id;redraw();return true}
    if(m.envoyWk===w.week){say(_T('Your envoy has already called on this house this week.'));return true}
    if(k==='gift'){if(pm.coin<25)return true;pm.coin-=25;m.relB=(m.relB||0)+12;m.envoyWk=w.week;mlog(m,_T`received gifts from ${pm.ludus}`);saveWorld();say(_T`🎁 ${esc(m.name)} accepts your gifts. Opinion ${opinionOf(m).v}.`);return true}
    if(k==='trade'){MGR.trade={mid:m.id,mine:null,theirs:null,coin:0};redraw();return true}
    if(k==='pact'){if(op.v<55||pm.coin<30)return true;pm.coin-=30;m.pact=w.week+8;m.envoyWk=w.week;mlog(m,_T`signed a non-poaching pact with ${pm.ludus}`);tnews(_T`🤝 Non-poaching pact with ${esc(m.ludus)} until week ${wkOf(m.pact)}.`);saveWorld();say(_T`🤝 ${esc(m.ludus)} agrees: neither house poaches the other until week ${wkOf(m.pact)}.`);return true}
    if(k==='gossip'){if(op.v<40)return true;const g=rosterOf(m).filter(x=>(x.scout||0)<2).sort(()=>Math.random()-.5)[0];m.envoyWk=w.week;if(!g){say(_T`${esc(m.name)} shrugs — you already know everything about their fighters.`);saveWorld();return true}g.scout=Math.max(g.scout||0,2);saveWorld();say(_T`🕵 Over wine, ${esc(m.name)} lets slip what ${esc(g.name)} is really worth: rating ${effOvr(g)}, morale ${g.morale}, ${g.contract.weeks} weeks left at ${g.contract.wage}/wk.`);return true}
    if(k==='insult'){m.insulted=(m.insulted||0)+15;m.rivalry=clamp((m.rivalry||0)+15,0,100);pm.fame=clamp(pm.fame+2,0,100);m.envoyWk=w.week;mlog(m,_T`was publicly insulted by ${pm.ludus}`);mnews(_T`🗡 ${esc(pm.ludus)} insults <b>${esc(m.ludus)}</b> in the forum. The crowd loves a feud.`);saveWorld();say(_T`🗡 The insult lands. +2 fame; ${esc(m.name)} will not forget it.`);return true}
    return true}
  if(action==='tradex'){MGR.trade=null;redraw();return true}
  if(action==='tradego'){const m=mgrById(id);const gm=gById($('#trMine').value),gt=gById($('#trTheirs').value);const coin=Math.max(0,Math.floor(+$('#trCoin').value||0));if(!m||!gm||!gt)return true;
    MGR.trade={mid:m.id,mine:gm.id,theirs:gt.id,coin};if(m.envoyWk===w.week){MGR.trade.msg=_T('Your envoy has already called on this house this week.');say(MGR.trade.msg);redraw();return true}
    if(coin>pm.coin){MGR.trade.msg=_T('Your treasury cannot cover that sweetener.');redraw();return true}
    const op=opinionOf(m).v;const need=tradeVal(gt)*(1.06+(op<40?.18:0)-(op>=70?.06:0)+(m.p.greed-50)/400);const give=tradeVal(gm)+coin/6;m.envoyWk=w.week;
    const theirsN=rosterOf(m).length;
    if(theirsN<=2&&effOvr(gt)>=effOvr(rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a))[0])){MGR.trade.msg=_T`“${esc(gt.name)} is the house. No.” — ${esc(m.name)}`;saveWorld();say(_T`✉ ${esc(m.ludus)} refuses: ${esc(gt.name)} is not for sale.`);redraw();return true}
    if(give<need){const gap=Math.ceil((need-give)*6);MGR.trade.msg=_T`“Not enough.” — ${esc(m.name)}. ${gap<=pm.coin?_T`About ${gap} more coin might change their mind — next week.`:_T('They want a better fighter.')}`;mlog(m,_T`turned down a trade offer from ${pm.ludus}`);saveWorld();say(_T`✉ ${esc(m.ludus)} turns down your trade.`);redraw();return true}
    pm.coin-=coin;m.coin+=coin;gm.contract.mgr=m.id;gt.contract.mgr=pm.id;gt.scout=3;gt.morale=clamp(gt.morale+4,0,100);m.relB=(m.relB||0)+6;
    ghist(gm,_T`traded from ${pm.ludus} to ${m.ludus}`);ghist(gt,_T`traded from ${m.ludus} to ${pm.ludus}`);mlog(m,_T`traded ${gt.name} to ${pm.ludus} for ${gm.name}${coin?_T` and ${coin} coin`:''}`);
    mnews(`🔁 <b>Trade:</b> ${esc(gt.name)} goes to ${esc(pm.ludus)}; ${esc(gm.name)} goes to ${esc(m.ludus)}${coin?_T` (plus ${coin} coin)`:''}.`,'big');tnews(_T`🔁 Traded ${esc(gm.name)}${coin?_T` + ${coin} coin`:''} to ${esc(m.ludus)} for ${esc(gt.name)}.`,'big');
    MGR.trade=null;saveWorld();say(_T`🔁 Done — ${esc(gt.name)} joins ${esc(pm.ludus)}.`);return true}
  return false}

/* v0.29 THE LEAGUE TABLE: points, not fame, decide standings. Every bout scores its stables:
   a win 3 points, a runner-up finish 1. Ties go to the better win rate, then fame. Fame stays what it is —
   reputation (it opens recruits' doors and draws the crowds). Kept per season in m.spS[season]. */
/* msp — a lanista's league points record for a season {pts, w, b} (created when missing). */
function msp(mgr,season){const w=W_();season=season??w.season;mgr.spS=mgr.spS||{};return mgr.spS[season]||(mgr.spS[season]={pts:0,w:0,b:0})}
/* leagueSort — lanistae in table order: points, then win rate, then fame. */
function leagueSort(mgrs,season){return [...mgrs].sort((a,b)=>{const A=msp(a,season),B=msp(b,season);return (B.pts-A.pts)||((B.b?B.w/B.b:0)-(A.b?A.w/A.b:0))||((b.fame||0)-(a.fame||0))})}
/* leaguePtsAfterBout — scores a bout for the league table (win 3, runner-up 1) and logs each fighter's recent form. */
function leaguePtsAfterBout(bout){if(!bout||!bout.res)return;const w=W_();for(const r of bout.res.rows){const g=gById(r.gid);if(g){(g.recent=g.recent||[]).push({s:w.season,wk:((w.week-1)%12)+1,t:TIERS[bout.tier]?TIERS[bout.tier].n:'',ev:(EVENTS[bout.ev]||{}).short||'',loc:w.night?LOCATIONS[w.night.loc].n:'',place:r.place,won:!!r.won,f:r.f||0,vd:r.vd||''});g.recent=g.recent.slice(-8)}const m=g&&g.contract?mgrById(g.contract.mgr):null;if(!m)continue;const S2=msp(m);S2.b++;if(r.won){S2.w++;S2.pts+=3;if(typeof gemCheck==='function')try{gemCheck(g,m)}catch(e){}}else if(r.place===2)S2.pts+=1}}
// the quality a house fields: the average rating of its five best fighters
function rosterRating(mgr){const r=rosterOf(mgr).map(effOvr).sort((a,b)=>b-a).slice(0,5);return r.length?Math.round(r.reduce((a,b)=>a+b,0)/r.length):0}
// development: coin spent on drills and personal trainers, remembered (decaying) — recruits who want to improve notice it
function devNote(mgr,coin){mgr.dev=Math.round(((mgr.dev||0)+coin)*10)/10}
/* devWeek — the development spending each house is remembered for decays by 15% a week. */
function devWeek(){const w=W_();for(const m of w.mgrs)m.dev=Math.round((m.dev||0)*0.85*10)/10}

/* v0.29 RUNNING THE LUDUS — one dashboard, no scrolling: a row of tiles shows the state of every part of the
   house at a glance (and what needs you); click a tile to work on it in the panel below. */
/* gradeCol — a grade's medal color (gold A, silver B, bronze C, iron D, blood F). */
const gradeCol=grade=>({S:'#f0cf7d','A+':'#f0cf7d',A:'#f0cf7d','B+':'#c9d1dc',B:'#c9d1dc','C+':'#cd8a52',C:'#cd8a52',D:'#7f858c',F:'#d24a3a'})[grade]||'#7f858c'; /* v0.55: the medal ladder — gold A, silver B, bronze C, iron D, blood F */
/* runDashHTML — the Running the ludus dashboard: one tile per part of the house, the chosen one's panel below. */
function runDashHTML(trainFn,ledgerFn){const w=W_(),m=me();const P=m.perkPts||0;const R=TRAIN_REGIMES[w.train||'off']||TRAIN_REGIMES.off;const g=ludusGrade(m);
  const tiles=[['train','🏋',_T('Training'),R.n,w.train&&w.train!=='off'?'':'idle'],['promote','📯',_T('Promote'),_T`fame ${m.fame}`,''],['school','🎓',_T('Schooling'),`<span class="ptbox sm${P?' on':''}">${P}</span>`,P?'ready':''],
    ['fac','🏗',_T('Facilities'),`<span class="gradebox sm" style="--gc:${gradeCol(g)}">${g}</span>`,m.facWk===w.week?'':'ready'],['consil','🏛',_T('Consilium'),_T('your advisors'),''],['ledger','📜',_T('Ledger'),_T`${(w.tlog||[]).length} entries`,'']];
  if(MGR.run==='train'||!MGR.run)MGR.run='promote'; /* v0.45: the drills live in the Training Yard tab now */
  const cur=MGR.run;
  const panel=cur==='train'?trainFn():cur==='promote'?promoteCardHTML():cur==='consil'?consiliumHTML():cur==='fac'?facilitiesHTML():cur==='school'?schoolingCardHTML():ledgerFn();
  return `<h4 class="secth">${_T`🏛 Running the ludus`}</h4><div class="rundash">${tiles.map(([k,i,l,v,flag])=>`<button type="button" class="rtile2${cur===k?' on':''}${flag==='ready'?' ready':flag==='idle'?' idle':''}" ${k==='train'?_T('data-mg="tab" data-id="practice" title="Opens the Training Yard tab"'):`data-mg="run" data-id="${k}"`}><span class="rti2">${i}</span><span class="rtl"><b>${l}</b><span>${v}</span></span></button>`).join('')}</div><div class="runpanel">${panel}</div>`}

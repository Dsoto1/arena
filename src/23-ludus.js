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
const FAC={
  yard:{n:'Training yard',i:'🏋',d:'Better palus posts, sand pits and weights',fx:l=>`+${l*5}% training gains · ${l*20}% fewer drill injuries`},
  valet:{n:'Valetudinarium',i:'⚕',d:'A proper infirmary wing for your physicians',fx:l=>`physicians' weekly cap +${l*25} coin of work`},
  barracks:{n:'Barracks',i:'🛏',d:'Dry cells, real beds, a cook who cares',fx:l=>`+${l} morale for every fighter each week · fighters sign for ${l*4}% less`},
  armory:{n:'Armory',i:'🛡',d:'Fitted armor for every fighter who leaves your ludus',fx:l=>`+${l} AP fitted at the start of every bout`},
  stands:{n:'Practice stands',i:'🏟',d:'Benches where the city pays to watch you train',fx:l=>`+${l*10} coin a week from practice crowds · Spectacle grade +${l*6}`},
  stables:{n:'Stables',i:'🐎',d:'Horses, wagons and a road crew of your own',fx:l=>`travel to away games costs ${l*15}% less`}}; /* v0.45 */
const FAC_COST=[250,600,1200];
const facLvl=(m,k)=>m&&m.fac?(m.fac[k]||0):0;
const facSum=m=>Object.keys(FAC).reduce((a,k)=>a+facLvl(m,k),0);
const LGRADES=[[0,'D'],[1,'C'],[3,'C+'],[5,'B'],[7,'B+'],[9,'A'],[12,'A+'],[15,'S']];
const ludusGrade=m=>{const n=facSum(m);let g='D';for(const [t,l] of LGRADES)if(n>=t)g=l;return g};
const repCap=()=>REPAIR_CAP+25*facLvl(me(),'valet');
function facilitiesHTML(){const w=W_(),m=me();m.fac=m.fac||{};const built=m.facWk===w.week;
  return `<div class="card2 faccard"><div class="schoolhd"><div><div class="sect" style="margin:0">🏗 Facilities</div><span class="rc-sub">Permanent. Recruits grade your house on them — together they set your <b>Ludus grade</b>. One project a week.</span></div><div class="gradebox" style="--gc:${gradeCol(ludusGrade(m))}" title="Ludus grade — from ${facSum(m)} of ${Object.keys(FAC).length*3} facility levels">${ludusGrade(m)}</div></div>
    <div class="faclist">${Object.entries(FAC).map(([k,F])=>{const l=facLvl(m,k);const cost=FAC_COST[l];
      return `<div class="facrow"><span class="faci">${F.i}</span><div class="fact"><b>${F.n}</b> <span class="facpips">${[0,1,2].map(i=>`<i class="${i<l?'on':''}"></i>`).join('')}</span><div class="rc-sub">${l?F.fx(l):F.d}</div>${l<3?`<div class="rc-sub">Next: ${F.fx(l+1)}</div>`:''}</div>
        ${l<3?`<button class="btn tksm" type="button" data-mg="build" data-id="${k}" ${dis([built,'Your builders are already busy this week.'],needCoin(m,cost))}>Build ${['I','II','III'][l]}<small>${cost} coin</small></button>`:'<span class="badge gold">complete</span>'}</div>`}).join('')}</div></div>`}
function facBuild(m,k,quiet){const l=facLvl(m,k);if(l>=3)return false;const cost=FAC_COST[l];if(m.coin<cost)return false;m.coin-=cost;m.fac=m.fac||{};m.fac[k]=l+1;m.facWk=W_().week;
  const F=FAC[k];mlog(m,`🏗 built the ${F.n} ${['I','II','III'][l]} (${cost} coin) — ${F.fx(l+1)}`);
  if(!quiet)mnews(`🏗 <b>${esc(m.ludus)}</b> ${m.isPlayer?'(you) ':''}completes the ${F.n} ${['I','II','III'][l]}. Ludus grade ${ludusGrade(m)}.`);return true}
// weekly facility effects for every house (called when the week ends)
function facWeek(){const w=W_();for(const m of w.mgrs){const b=facLvl(m,'barracks'),st=facLvl(m,'stands');
  if(b)for(const g of rosterOf(m))g.morale=clamp(g.morale+b,0,100);
  if(st){m.coin+=st*10;if(m.isPlayer)tnews(`🏟 The practice stands took ${st*10} coin in tickets this week.`)}}}

/* ---------------- rival lanistae at work: every act goes in their ledger ---------------- */
function mlog(m,txt){if(!m)return;const w=W_();(m.log=m.log||[]).unshift({s:w.season,wk:w.week,txt});m.log=m.log.slice(0,40)}
function aiLanistaWeek(){const w=W_();
  for(const m of w.mgrs){if(m.isPlayer)continue;const P=m.p;
    // v0.29 A LEAGUE THAT STAYS ALIVE: old houses have old backers (weekly income that grows with fame)…
    const pat=Math.round(22+(m.fame||0)*0.6);m.coin+=pat;
    // …a house sunk in debt is bought out by a new patron rather than left to die
    if(m.coin<-60){m.coin=120;m.fame=clamp((m.fame||0)-8,0,100);mlog(m,'💼 debts bought out by a new backer (−8 fame)');mnews(`💼 <b>${esc(m.ludus)}</b> was drowning in debt — a wealthy backer buys the house and its debts. The gossip costs them 8 fame.`)}
    // …and a thin barracks is refilled from the free agents it can afford
    {let ros2=rosterOf(m);let guard=0;while(ros2.length<3&&guard++<3){const fa=freeAgents().filter(g=>!g.inj&&askWage(g)*3<=Math.max(30,m.coin)).sort((a,b)=>(effOvr(b)-askWage(b)*0.8)-(effOvr(a)-askWage(a)*0.8))[0];if(!fa)break;
      fa.contract={mgr:m.id,wage:askWage(fa),weeks:6+rnd(7),since:w.week};fa.unsigned=0;fa.morale=clamp(fa.morale||60,40,90);ghist(fa,`signed with ${m.ludus} to fill the barracks`);mlog(m,`signed ${fa.name} to fill the barracks`);ros2=rosterOf(m)}}
    const ros=rosterOf(m);
    // the yard: discipline picks the regime; a brutal week is worth a line in the ledger
    const reg=P.discipline>70?'hard':P.discipline>45?'std':'light';m.train=reg;devNote(m,{hard:30,std:15,light:6}[reg]);if(reg==='hard'&&Math.random()<.35)mlog(m,`🏋 ran brutal drills — ${ros.length} fighters in the yard at dawn`);
    // the infirmary: greedy houses let wounds wait; honest ones pay the Medicus
    for(const g of ros.filter(g=>g.inj&&!g.inj.war)){if(m.coin>30&&Math.random()<.35+P.honor/300){const q=typeof injReq==='function'?injReq(g.inj):'medicus';if(q!=='surgeon'){m.coin-=MEDICUS;g.inj=null;mlog(m,`⚕ paid the Medicus for ${g.name}`)}else if(m.coin>50){m.coin-=SURGEON;g.inj=null;mlog(m,`🔪 sent ${g.name} under the surgeon's knife`)}}}
    // morale work: family tickets, a shared meal, a bonus for the unhappy
    const low=ros.filter(g=>g.morale<45).sort((a,b)=>a.morale-b.morale)[0];
    if(low&&m.coin>20&&Math.random()<.5){const r=Math.random();if(r<.4){m.coin-=4;low.morale=clamp(low.morale+5,0,100);mlog(m,`🎟 bought tickets for ${low.name}'s family`)}else if(r<.75){m.coin-=3;low.morale=clamp(low.morale+6,0,100);mlog(m,`🍷 shared a meal with ${low.name}`)}else{const bn=giftCost(low);m.coin-=bn;low.morale=clamp(low.morale+8,0,100);mlog(m,`💰 paid ${low.name} a ${bn}-coin bonus`)}}
    // promotion: showmen feed a city, hire criers, sponsor the games
    if(m.coin>60&&Math.random()<P.show/280){const r=Math.random();const city=pickOne(LOCATIONS.filter(Boolean)).n;if(r<.5){m.coin-=10;m.fame=clamp(m.fame+1,0,100);mlog(m,`🍞 fed the people of ${city} in the ludus's name (+1 fame)`)}else if(r<.8){m.coin-=6;mlog(m,`📢 hired the criers — every free agent hears the name ${m.ludus}`);for(const g of freeAgents().slice(0,12))g.interest[m.id]=capInterest(g,m,interestOf(g,m)+2)}else{m.coin-=18;m.fame=clamp(m.fame+2,0,100);mlog(m,`🎪 sponsored the games — the house's name over the gate (+2 fame)`)}}
    // building: the rich and ambitious pour stone
    if(Math.random()<.14+P.ambition/700){const ks=Object.keys(FAC).filter(k=>facLvl(m,k)<3).sort((a,b)=>facLvl(m,a)-facLvl(m,b));const k=P.discipline>60&&ks.includes('yard')?'yard':P.show>60&&ks.includes('stands')?'stands':ks[0];
      if(k&&m.coin>FAC_COST[facLvl(m,k)]*2.2)facBuild(m,k)}
  }}

/* ---------------- opinion: what a rival lanista thinks of you, and why ---------------- */
function opinionOf(m){const pm=me();const L=[];let v=50;
  const riv=Math.max(m.rivalry||0,(m.rivals||{})[pm.id]||0);if(riv){const d=Math.round(riv*.6);L.push([-d,riv>=35?'A bitter rivalry with your house':'Rivalry and old grudges']);v-=d}
  if(pm.city===m.city){L.push([-8,`Both of ${m.city}`]);v-=8}
  const hon=Math.round((pm.p.honor-50)/5);if(hon){L.push([hon,hon>0?'Your honor is known':'Your word is doubted']);v+=hon}
  if(m.relB){L.push([m.relB,'Gifts, trades and pacts']);v+=m.relB}
  if(m.poachedByMe){L.push([-m.poachedByMe*10,`You poached ${m.poachedByMe} of theirs`]);v-=m.poachedByMe*10}
  if(m.insulted){L.push([-m.insulted,'Your public insults']);v-=m.insulted}
  const W=W_();if(m.pact&&m.pact>=W.week){L.push([10,'Non-poaching pact']);v+=10}
  return {v:clamp(Math.round(v),0,100),L}}
const opTier=v=>v<20?['Hostile','#e04a3a']:v<40?['Cold','#e0843a']:v<60?['Neutral','#c9ccd3']:v<80?['Cordial','#9bd070']:['Friendly','#5fd07a'];
function greetLine(m,v){const P=m.p;const hostile=['Say what you came to say, and leave my gate.','My fighters remember your name. So do I.','You have courage, sending an envoy here.'],cold=['Speak. Quickly.','We are listening — for now.','The steward will show you to a chair. Not a good one.'],
  neutral=['Well met. What does your house want?','The sand is wide enough for both of us. Usually.','Wine? No? Then business.'],warm=['Ah — a friend of the house! Sit, sit.','Your envoy is always welcome here.','Whatever it is, the answer is probably yes.'];
  const pool=v<20?hostile:v<40?cold:v<60?neutral:warm;return pool[(m.id.length+W_().week)%pool.length]+(P.greed>70?' And remember — nothing here is free.':P.honor>75?' My word is my bond.':'')}

/* ---------------- the team screen ---------------- */
function teamHTML(){const w=W_(),pm=me();const m=mgrById(MGR.teamId);if(!m)return '<p>No such stable.</p>';if(m.isPlayer){MGR.tab='me';return meHTML()}
  const ros=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));const op=opinionOf(m);const [tn,tc]=opTier(op.v);const envoyUsed=m.envoyWk===w.week;
  const rec=`${m.wins}-${Math.max(0,m.bouts-m.wins)}`;
  const form=g=>(g.recent||[]).slice(-5).map(x=>`<span class="fchip ${x.won?'w':x.place===2?'p':''}" title="S${x.s} W${x.wk} · ${esc(x.t)} · ${esc(x.ev)} at ${esc(x.loc)} · ${x.won?'won':x.place?'#'+x.place:'fought'} · ${x.f} CF">${x.won?'W':x.place||'·'}</span>`).join('')||'<span class="rc-sub">—</span>';
  const row=g=>{const sc=g.scout;return `<tr><td><button class="btn" type="button" data-mg="fav" data-id="${g.id}" title="${g.favd?'Remove from':'Pin to'} your Favorites" style="padding:1px 4px;border:none;background:none;font-size:15px;color:${g.favd?'var(--gold2)':'var(--dim)'}">${g.favd?'★':'☆'}</button></td><td>${gArt(g,'xs')}</td><td><b>${esc(g.name)}</b> <span class="rc-sub">${CLASSES[g.cls]?CLASSES[g.cls].name:''} · ${gAge(g)}</span></td><td class="n">${sc?effOvr(g):'~'+pubOvr(g)} <span class="stars">${'★'.repeat(starsOf(pubOvr(g)))}</span></td><td class="n">${g.rec.w}-${Math.max(0,g.rec.ev-g.rec.w)}</td><td class="nowrap">${form(g)}</td><td class="n">${sc?g.morale:'?'}</td><td class="n rc-sub">${sc?`${g.contract.wage}/wk · ${Math.max(0,g.contract.weeks)} wk`:'?'}</td></tr>`};
  const acts=[
    ['gift','🎁 Send gifts','25 coin · +12 opinion',needCoin(pm,25)],
    ['practice','🏋 Propose a practice','an exhibition against their fighters (Practice tab)',[op.v<25,`${m.name} will not spar with a house they despise (opinion ${op.v}, needs 25).`]],
    ['trade','🔁 Propose a trade','one of yours for one of theirs, coin to sweeten',[op.v<20,`${m.name} will not trade with you (opinion ${op.v}, needs 20).`]],
    ['pact','🤝 Non-poaching pact','30 coin · 8 weeks: neither house poaches the other',[op.v<55,`A pact needs trust (opinion ${op.v}, needs 55).`],needCoin(pm,30)],
    ['gossip','🕵 Ask for gossip','they talk about one of their fighters (scouted)',[op.v<40,`They do not gossip with strangers (opinion ${op.v}, needs 40).`]],
    ['insult','🗡 Insult them publicly','+2 fame (the crowd loves a feud) · −15 opinion, +15 rivalry',[false,'']]];
  const tr=MGR.trade&&MGR.trade.mid===m.id?MGR.trade:null;
  return `<div class="acts" style="margin-bottom:8px"><button class="btn" type="button" data-mg="tab" data-id="league">← Back to the League</button></div>
   <div class="teamlay"><div>
    <div class="card2"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">${typeof mgrPortrait==='function'?mgrPortrait(m,'md'):''}<div style="flex:1;min-width:200px"><div style="display:flex;gap:8px;align-items:center">${typeof flagChip==='function'?flagChip(m,30):''}<div style="font:400 24px var(--display);color:${m.color}">${esc(m.ludus)}</div></div>
      <div class="rc-sub">${esc(m.name)} · ${esc(m.city)} · a house of ${esc(mgrTier(m.fame))} standing</div><div class="rc-sub" style="margin-top:4px">${esc(m.bio||'')}</div></div>
      <div class="gradebox" style="--gc:${gradeCol(ludusGrade(m))}" title="Ludus grade">${ludusGrade(m)}</div></div>
      <div class="rc-stats" style="margin-top:8px"><span><b>${m.fame}</b>★ Fame</span><span><b>${rec}</b>Record</span><span><b>${ros.length}</b>Fighters</span><span><b>${m.coin>500?'rich':m.coin>150?'comfortable':m.coin>40?'lean':'broke'}</b>Treasury</span><span><b>${facSum(m)}/15</b>Facility levels</span></div>
      <div class="rc-sub" style="margin-top:6px">${MGR_KEYS.map(([k,l])=>`${l} ${m.p[k]}`).join(' · ')}</div></div>
    <div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">🛡 Roster <span class="rc-sub">ratings with ~ are the public estimate — scout for the truth</span></div>${ros.length?`<table class="tally compact"><tr><th></th><th></th><th>Fighter</th><th>Rating</th><th>Record</th><th title="Last five bouts, oldest first: W = won, 2 = runner-up">Recent</th><th>Morale</th><th>Contract</th></tr>${ros.map(row).join('')}</table>`:'<p class="rc-sub">An empty barracks.</p>'}</div>
    <div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">📅 Coming up for ${esc(m.ludus)}</div>${(()=>{const n=w.night;const out=[];
      if(n)for(const b of n.bouts){const mine=b.ents.map(gById).filter(g=>g&&g.contract&&g.contract.mgr===m.id);for(const g of mine)out.push(`<div>${b.done?'✓':'⚔'} <b>${esc(g.name)}</b> <span class="rc-sub">— ${esc(TIERS[b.tier].n)}, ${esc((EVENTS[b.ev]||{}).n||'')} at ${esc(LOCATIONS[n.loc].n)}${b.done&&b.res?` · ${b.res.winners.includes(g.id)?'<b class="up">won</b>':'lost'}`:' · this week'}</span></div>`)}
      if(w.special&&!w.special.done)for(const r of w.special.rounds)for(const hh of r)for(const e of hh.ents){const g=e.gid&&gById(e.gid);if(g&&g.contract&&g.contract.mgr===m.id)out.push(`<div>⭐ <b>${esc(g.name)}</b> <span class="rc-sub">— ${esc(w.special.D.n)}</span></div>`)}
      return out.join('')||'<p class="rc-sub" style="margin:0">Nobody from this house is on this week\u2019s card yet.</p>'})()}</div>
   </div><div>
    <div class="comms"><div class="commshd"><span class="commsig">📜 CORRESPONDENCE</span><span class="badge" style="color:${tc};border-color:${tc}">${tn} · ${op.v}</span></div>
      <div class="commsbody">${typeof mgrPortrait==='function'?mgrPortrait(m,'sm'):''}<div><b>${esc(m.name)}</b><p class="commsq">“${esc(greetLine(m,op.v))}”</p></div></div>
      <div class="opbar"><i style="width:${op.v}%;background:${tc}"></i></div>
      <div class="oplist">${op.L.length?op.L.map(([n,t])=>`<div><b class="${n>=0?'up':'dn'}">${n>=0?'+':''}${n}</b> ${esc(t)}</div>`).join(''):'<div class="rc-sub">No history between your houses.</div>'}</div>
      <div class="sect">Send an envoy <span class="rc-sub">${envoyUsed?'· your envoy has already called this week':'· one envoy per house a week'}</span></div>
      <div class="commsacts">${acts.map(([k,l,sub,...chk])=>`<button class="btn" type="button" data-mg="envoy" data-id="${m.id}|${k}" ${envoyUsed&&k!=='practice'?dis([true,'Your envoy has already called on this house this week.']):dis(...chk.filter(Boolean))}>${l}<small>${sub}</small></button>`).join('')}</div>
      ${tr?tradeHTML(m,tr):''}
      ${w.loan&&w.loan.mgr===m.id&&w.loan.amt>0?`<div class="tradebox"><div class="sect" style="margin-top:0">💸 Your debt to this house</div><p class="rc-sub" style="margin:0 0 4px"><b>${w.loan.amt} coin owed</b> · 8% a week. Paying early warms them to you.</p><div class="acts"><button class="btn tksm" type="button" data-mg="loanpay" ${pm.coin<Math.min(w.loan.amt,50)?'disabled':''}>Pay 50</button><button class="btn primary tksm" type="button" data-mg="loanpayall" ${pm.coin<w.loan.amt?'disabled':''}>Pay all · ${w.loan.amt}</button></div></div>`:''}
      ${m.pact&&m.pact>=w.week?`<p class="rc-sub" style="margin:6px 0 0">🤝 Non-poaching pact until week ${wkOf(m.pact)}.</p>`:''}</div>
    <div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">📜 Their ledger <span class="rc-sub">what this house has been doing</span></div><div class="news" style="max-height:220px">${(m.log||[]).length?m.log.map(x=>`<div><span class="rc-sub">S${x.s} W${x.wk} · </span>${esc(x.txt)}</div>`).join(''):'<div class="rc-sub">Nothing on record yet — the ledger fills as the weeks go by.</div>'}</div></div>
   </div></div>`}
function tradeVal(g){return effOvr(g)+Math.max(0,g.pot-g.ovr)*0.6+(g.fame||0)*0.2-Math.max(0,gAge(g)-30)*1.5-(g.contract?g.contract.wage*0.3:0)}
function tradeHTML(m,tr){const pm=me();const mine=rosterOf(pm).sort((a,b)=>effOvr(b)-effOvr(a)),theirs=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));
  return `<div class="tradebox"><div class="sect" style="margin-top:0">🔁 A trade with ${esc(m.ludus)}</div>
    <div class="bslip"><label>You send <select class="tin" id="trMine" style="width:auto">${mine.map(g=>`<option value="${g.id}" ${tr.mine===g.id?'selected':''}>${esc(g.name)} · ${effOvr(g)} · ${g.contract.wage}/wk</option>`).join('')}</select></label>
     <label>For <select class="tin" id="trTheirs" style="width:auto">${theirs.map(g=>`<option value="${g.id}" ${tr.theirs===g.id?'selected':''}>${esc(g.name)} · ${g.scout?effOvr(g):'~'+pubOvr(g)} · ${g.scout?g.contract.wage+'/wk':'?'}</option>`).join('')}</select></label>
     <label>+ coin <input type="number" class="tin" id="trCoin" min="0" value="${tr.coin||0}" style="width:5em"></label></div>
    <p class="rc-sub" style="margin:4px 0">Contracts travel with the fighters (same wage, same weeks). They weigh rating, potential, fame, age and wage — and how much they like you.</p>
    ${tr.msg?`<div class="traderes ${tr.ok?'ok':'no'}">${tr.ok?'✅':'✉'} ${tr.msg}</div>`:''}
    <div class="acts">${m.envoyWk===W_().week?`<span class="rc-sub" style="align-self:center">Your envoy has already called on ${esc(m.ludus)} this week — try again next week.</span><button class="btn" type="button" data-mg="tradex">Close</button>`:`<button class="btn primary" type="button" data-mg="tradego" data-id="${m.id}">Send the proposal</button><button class="btn" type="button" data-mg="tradex">Cancel</button>`}</div></div>`}
async function ludusClick(a,id,b,ctx){const w=W_(),pm=me();if(!w||!pm)return false;const {redraw,say}=ctx;
  if(a==='build'){if(pm.facWk===w.week){say('Your builders are already busy this week.');return true}const l=facLvl(pm,id);if(l>=3)return true;if(pm.coin<FAC_COST[l]){say(`The ${FAC[id].n} ${['I','II','III'][l]} costs ${FAC_COST[l]} coin.`);return true}
    facBuild(pm,id);tnews(`🏗 Built the ${FAC[id].n} ${['I','II','III'][l]} — ${FAC[id].fx(l+1)}. Ludus grade ${ludusGrade(pm)}.`,'big');saveWorld();say(`🏗 The ${FAC[id].n} ${['I','II','III'][l]} is built. Ludus grade <b>${ludusGrade(pm)}</b>.`);return true}
  if(a==='run'){MGR.run=id;redraw();return true}
  if(a==='team'){MGR.teamId=id;MGR.tab=id===pm.id?'me':'team';MGR.trade=null;redraw();return true}
  if(a==='envoy'){const [mid,k]=id.split('|');const m=mgrById(mid);if(!m)return true;const op=opinionOf(m);
    if(k==='practice'){MGR.tab='practice';MGR.pOpp=m.id;redraw();return true}
    if(m.envoyWk===w.week){say('Your envoy has already called on this house this week.');return true}
    if(k==='gift'){if(pm.coin<25)return true;pm.coin-=25;m.relB=(m.relB||0)+12;m.envoyWk=w.week;mlog(m,`received gifts from ${pm.ludus}`);saveWorld();say(`🎁 ${esc(m.name)} accepts your gifts. Opinion ${opinionOf(m).v}.`);return true}
    if(k==='trade'){MGR.trade={mid:m.id,mine:null,theirs:null,coin:0};redraw();return true}
    if(k==='pact'){if(op.v<55||pm.coin<30)return true;pm.coin-=30;m.pact=w.week+8;m.envoyWk=w.week;mlog(m,`signed a non-poaching pact with ${pm.ludus}`);tnews(`🤝 Non-poaching pact with ${esc(m.ludus)} until week ${wkOf(m.pact)}.`);saveWorld();say(`🤝 ${esc(m.ludus)} agrees: neither house poaches the other until week ${wkOf(m.pact)}.`);return true}
    if(k==='gossip'){if(op.v<40)return true;const g=rosterOf(m).filter(x=>(x.scout||0)<2).sort(()=>Math.random()-.5)[0];m.envoyWk=w.week;if(!g){say(`${esc(m.name)} shrugs — you already know everything about their fighters.`);saveWorld();return true}g.scout=Math.max(g.scout||0,2);saveWorld();say(`🕵 Over wine, ${esc(m.name)} lets slip what ${esc(g.name)} is really worth: rating ${effOvr(g)}, morale ${g.morale}, ${g.contract.weeks} weeks left at ${g.contract.wage}/wk.`);return true}
    if(k==='insult'){m.insulted=(m.insulted||0)+15;m.rivalry=clamp((m.rivalry||0)+15,0,100);pm.fame=clamp(pm.fame+2,0,100);m.envoyWk=w.week;mlog(m,`was publicly insulted by ${pm.ludus}`);mnews(`🗡 ${esc(pm.ludus)} insults <b>${esc(m.ludus)}</b> in the forum. The crowd loves a feud.`);saveWorld();say(`🗡 The insult lands. +2 fame; ${esc(m.name)} will not forget it.`);return true}
    return true}
  if(a==='tradex'){MGR.trade=null;redraw();return true}
  if(a==='tradego'){const m=mgrById(id);const gm=gById($('#trMine').value),gt=gById($('#trTheirs').value);const coin=Math.max(0,Math.floor(+$('#trCoin').value||0));if(!m||!gm||!gt)return true;
    MGR.trade={mid:m.id,mine:gm.id,theirs:gt.id,coin};if(m.envoyWk===w.week){MGR.trade.msg='Your envoy has already called on this house this week.';say(MGR.trade.msg);redraw();return true}
    if(coin>pm.coin){MGR.trade.msg='Your treasury cannot cover that sweetener.';redraw();return true}
    const op=opinionOf(m).v;const need=tradeVal(gt)*(1.06+(op<40?.18:0)-(op>=70?.06:0)+(m.p.greed-50)/400);const give=tradeVal(gm)+coin/6;m.envoyWk=w.week;
    const theirsN=rosterOf(m).length;
    if(theirsN<=2&&effOvr(gt)>=effOvr(rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a))[0])){MGR.trade.msg=`“${esc(gt.name)} is the house. No.” — ${esc(m.name)}`;saveWorld();say(`✉ ${esc(m.ludus)} refuses: ${esc(gt.name)} is not for sale.`);redraw();return true}
    if(give<need){const gap=Math.ceil((need-give)*6);MGR.trade.msg=`“Not enough.” — ${esc(m.name)}. ${gap<=pm.coin?`About ${gap} more coin might change their mind — next week.`:'They want a better fighter.'}`;mlog(m,`turned down a trade offer from ${pm.ludus}`);saveWorld();say(`✉ ${esc(m.ludus)} turns down your trade.`);redraw();return true}
    pm.coin-=coin;m.coin+=coin;gm.contract.mgr=m.id;gt.contract.mgr=pm.id;gt.scout=3;gt.morale=clamp(gt.morale+4,0,100);m.relB=(m.relB||0)+6;
    ghist(gm,`traded from ${pm.ludus} to ${m.ludus}`);ghist(gt,`traded from ${m.ludus} to ${pm.ludus}`);mlog(m,`traded ${gt.name} to ${pm.ludus} for ${gm.name}${coin?` and ${coin} coin`:''}`);
    mnews(`🔁 <b>Trade:</b> ${esc(gt.name)} goes to ${esc(pm.ludus)}; ${esc(gm.name)} goes to ${esc(m.ludus)}${coin?` (plus ${coin} coin)`:''}.`,'big');tnews(`🔁 Traded ${esc(gm.name)}${coin?` + ${coin} coin`:''} to ${esc(m.ludus)} for ${esc(gt.name)}.`,'big');
    MGR.trade=null;saveWorld();say(`🔁 Done — ${esc(gt.name)} joins ${esc(pm.ludus)}.`);return true}
  return false}

/* v0.29 THE LEAGUE TABLE: points, not fame, decide standings. Every bout scores its stables:
   a win 3 points, a runner-up finish 1. Ties go to the better win rate, then fame. Fame stays what it is —
   reputation (it opens recruits' doors and draws the crowds). Kept per season in m.spS[season]. */
function msp(m,s){const w=W_();s=s??w.season;m.spS=m.spS||{};return m.spS[s]||(m.spS[s]={pts:0,w:0,b:0})}
function leagueSort(ms,s){return [...ms].sort((a,b)=>{const A=msp(a,s),B=msp(b,s);return (B.pts-A.pts)||((B.b?B.w/B.b:0)-(A.b?A.w/A.b:0))||((b.fame||0)-(a.fame||0))})}
function leaguePtsAfterBout(b){if(!b||!b.res)return;const w=W_();for(const r of b.res.rows){const g=gById(r.gid);if(g){(g.recent=g.recent||[]).push({s:w.season,wk:((w.week-1)%12)+1,t:TIERS[b.tier]?TIERS[b.tier].n:'',ev:(EVENTS[b.ev]||{}).short||'',loc:w.night?LOCATIONS[w.night.loc].n:'',place:r.place,won:!!r.won,f:r.f||0,vd:r.vd||''});g.recent=g.recent.slice(-8)}const m=g&&g.contract?mgrById(g.contract.mgr):null;if(!m)continue;const S2=msp(m);S2.b++;if(r.won){S2.w++;S2.pts+=3;if(typeof gemCheck==='function')try{gemCheck(g,m)}catch(e){}}else if(r.place===2)S2.pts+=1}}
// the quality a house fields: the average rating of its five best fighters
function rosterRating(m){const r=rosterOf(m).map(effOvr).sort((a,b)=>b-a).slice(0,5);return r.length?Math.round(r.reduce((a,b)=>a+b,0)/r.length):0}
// development: coin spent on drills and personal trainers, remembered (decaying) — recruits who want to improve notice it
function devNote(m,coin){m.dev=Math.round(((m.dev||0)+coin)*10)/10}
function devWeek(){const w=W_();for(const m of w.mgrs)m.dev=Math.round((m.dev||0)*0.85*10)/10}

/* v0.29 RUNNING THE LUDUS — one dashboard, no scrolling: a row of tiles shows the state of every part of the
   house at a glance (and what needs you); click a tile to work on it in the panel below. */
const gradeCol=g=>({S:'#f0cf7d','A+':'#f0cf7d',A:'#f0cf7d','B+':'#c9d1dc',B:'#c9d1dc','C+':'#cd8a52',C:'#cd8a52',D:'#7f858c',F:'#d24a3a'})[g]||'#7f858c'; /* v0.55: the medal ladder — gold A, silver B, bronze C, iron D, blood F */
function runDashHTML(trainFn,ledgerFn){const w=W_(),m=me();const P=m.perkPts||0;const R=TRAIN_REGIMES[w.train||'off']||TRAIN_REGIMES.off;const g=ludusGrade(m);
  const tiles=[['train','🏋','Training',R.n,w.train&&w.train!=='off'?'':'idle'],['promote','📯','Promote',`fame ${m.fame}`,''],['consil','🏛','Consilium','your advisors',''],
    ['fac','🏗','Facilities',`<span class="gradebox sm" style="--gc:${gradeCol(g)}">${g}</span>`,m.facWk===w.week?'':'ready'],['school','🎓','Schooling',`<span class="ptbox sm${P?' on':''}">${P}</span>`,P?'ready':''],['ledger','📜','Ledger',`${(w.tlog||[]).length} entries`,'']];
  if(MGR.run==='train'||!MGR.run)MGR.run='promote'; /* v0.45: the drills live in the Training Yard tab now */
  const cur=MGR.run;
  const panel=cur==='train'?trainFn():cur==='promote'?promoteCardHTML():cur==='consil'?consiliumHTML():cur==='fac'?facilitiesHTML():cur==='school'?schoolingCardHTML():ledgerFn();
  return `<h4 class="secth">🏛 Running the ludus</h4><div class="rundash">${tiles.map(([k,i,l,v,flag])=>`<button type="button" class="rtile2${cur===k?' on':''}${flag==='ready'?' ready':flag==='idle'?' idle':''}" ${k==='train'?'data-mg="tab" data-id="practice" title="Opens the Training Yard tab"':`data-mg="run" data-id="${k}"`}><span class="rti2">${i}</span><span class="rtl"><b>${l}</b><span>${v}</span></span></button>`).join('')}</div><div class="runpanel">${panel}</div>`}

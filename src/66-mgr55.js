/* =====================================================================
   66-MGR55 · v0.55 MANAGER: ratings that grow, and the batch's Manager changes
   =====================================================================
   1. RATINGS IN THE LEAGUE — every fighter carries g.stats (rolled once, deterministic from their id, leaning by
      class) and g.sxp (fractional progress). Growth is slow (about one band a season for a busy winner):
      bouts survived/won, CF, kills and fame (applyBout), exhibitions (exhibApply), the Training Yard and the
      bonds you build (endWeek). Gains slow above 90 and stop at 99. statOvr() feeds effOvr: the average rating
      above where the fighter started lifts their overall. Your fighters' growth is reported every week, and a
      new band (a new perk) gets its own headline.
   2. LETTERS — w.letters: short correspondence shown only in Your ludus and Match Week (lettersHTML).
   (more sections below)
   ===================================================================== */
/* gStats — a league fighter's ratings, created on first use (old saves migrate lazily). */
function gStats(g){if(!g)return null;if(!g.stats){const gg=mulberry32(hashStr('st|'+(g.id||g.name))>>>0);g.stats=rollStats(leanOf(g.cls),g.ovr??60,()=>gg.next());g.sxp={}}
  if(g.st0==null)g.st0=statSum(g.stats)/STAT_KEYS.length;return g.stats}
/* statOvr — the overall-rating lift from growth: 0.6 per point the average rating has climbed. TWEAK */
function statOvr(g){if(!g||!g.stats&&!g.id)return 0;const st=gStats(g);return clamp(Math.round((statSum(st)/STAT_KEYS.length-g.st0)*0.6),-5,15)}
{const base=genGlad;genGlad=function(o={}){const g=base.apply(this,arguments);if(o.stats){g.stats=cleanStats(o.stats);g.sxp={}}gStats(g);return g}}
{const base=gladFromCustom;gladFromCustom=function(c){const g=base.apply(this,arguments);g.stats=cleanStats(c.stats||statsFromAbil(c.abil,c.abilVal));g.sxp={};g.st0=statSum(g.stats)/STAT_KEYS.length;return g}}
/* seats: the fighter's ratings walk onto the sand; Intelligence sets the CPU's play (a broken fighter plays a tier worse) */
{const base=seatFor;seatFor=function(g,mgrColor,human=false){const s=base.apply(this,arguments);const st=gStats(g);if(!st)return s;
  s.stats={...st};const tiers=['easy','normal','hard'];let di=tiers.indexOf(bandInt(st.int));if(moraleTier(g.morale??60)==='broken')di=Math.max(0,di-1);s.diff=s.diffLock=tiers[di];return s}}
/* ---- growth ---- */
const GROW_SLOW=v=>v>=95?0.3:v>=90?0.5:1; /* TWEAK: the climb gets steeper near the top */
/* statGain — adds progress to one rating; whole points land, bands are announced. Returns the points gained. */
function statGain(g,k,amt){if(!g||!amt||amt<=0)return 0;const st=gStats(g);g.sxp=g.sxp||{};const w=W_();
  const before=statBonuses(st);const v0=st[k];let x=(g.sxp[k]||0)+amt*GROW_SLOW(st[k]);let up=0;
  while(x>=1&&st[k]<STAT_MAX){st[k]++;x-=1;up++}if(st[k]>=STAT_MAX)x=0;g.sxp[k]=Math.round(x*100)/100;
  const mine=g.contract&&mgrById(g.contract.mgr)&&mgrById(g.contract.mgr).isPlayer;
  if(w&&mine){const L=(w.sgain=w.sgain||{})[g.id]=(w.sgain[g.id]||{});L[k]=Math.round(((L[k]||0)+amt)*100)/100}
  if(up){const after=statBonuses(st);const nm9=STATS.find(s=>s[0]===k)[1];
    const perk=k==='int'?(after.tier!=null?(after.tier!==before.tier?`now a ${after.tierName} mind`:''):(after.diff!==before.diff?`now plays ${after.diff==='hard'?'Hard':'Normal'}`:'')):(()=>{const f={spd:'mv',str:'dmg',lck:'coin',cha:'cf'}[k];const unit={mv:'movement',dmg:'damage per hit',coin:'coin a turn',cf:'CF a turn'}[f];return after[f]>before[f]?`now +${after[f]} ${unit}`:''})();
    if(perk&&w){if(mine)tnews(`⭐ <b>${esc(g.name)}</b> reaches ${nm9} ${st[k]} — ${perk}.`,'big');else if(st[k]>=96&&g.contract)mnews(`⭐ ${esc(g.name)} of ${esc(mgrById(g.contract.mgr).ludus)} reaches ${nm9} ${st[k]} — ${perk}.`);
      ghist(g,`reached ${nm9} ${st[k]} — ${perk}`)}}
  return up}
const gainAll=(g,o)=>{for(const k in o)statGain(g,k,o[k])};
{const base=applyBout;applyBout=function(bi,res,opt={}){const w=W_();const b=w&&w.night&&w.night.bouts[bi];const was=b&&b.done;
  const fame0={};if(b&&!was)for(const id of b.ents){const g=gById(id);if(g)fame0[id]=g.fame||0}
  const r=base.apply(this,arguments);
  if(b&&!was&&b.res)for(const row of b.res.rows){const g=gById(row.gid);if(!g||g.alive===false)continue;
    const o={int:0.2};if(row.alive){o.spd=0.6;o.str=0.6;o.int+=0.3}else{o.int+=0.2;o.cha=0.4} /* survived the sand / spared by the crowd */
    if(row.won){o.str=(o.str||0)+1;o.spd=(o.spd||0)+0.8;o.int+=1.2}
    o.cha=(o.cha||0)+(row.f||0)/25;if((row.f||0)>=30)o.int+=0.5;o.str=(o.str||0)+0.4*(row.kp||0);
    o.cha+=Math.max(0,(g.fame||0)-(fame0[row.gid]||0))*0.15;gainAll(g,o)}
  return r}}
{const base=exhibApply;exhibApply=function(res,ctx){const r=base.apply(this,arguments);const g=gById(ctx.my);
  if(g){const row=res.rows.find(x=>x.mgrId===g.id)||{};gainAll(g,row.alive||row.won?{spd:0.5,str:0.5,int:0.4}:{int:0.3,str:0.2})}return r}}
/* weekly: the Training Yard, the bonds you build, and everyone else's own drilling */
const TRAIN_STAT={off:0,light:0.25,std:0.55,hard:0.95}; /* TWEAK: Strength per week by regime (Speed gets 80% of it) */
function weeklyGrowth(w){const pm=me();const byName={};for(const g of rosterOf(pm))byName[g.name]=g;const tr=TRAIN_STAT[w.train]||0;
  for(const t of w.lastTraining||[]){const g=byName[t.n];if(!g||/injured|sat out/.test(t.txt))continue;const solo=/personal trainer|private session/.test(t.txt)?0.35:0;
    gainAll(g,{str:tr+solo,spd:(tr+solo)*0.8,int:tr*0.2})}
  for(const g of w.glads){if(!g.alive)continue;gStats(g);
    if(g.contract){const own=mgrById(g.contract.mgr);statGain(g,'lck',0.2); /* time with a house */
      const lb=g.loyB||0;if(g._loyB0!=null&&lb>g._loyB0)statGain(g,'lck',(lb-g._loyB0)*0.12);g._loyB0=lb;
      if(own&&!own.isPlayer){statGain(g,pickOne(['spd','str']),0.3)}} /* rival yards drill too */
    else if(!g.retired)statGain(g,pickOne(STAT_KEYS),0.15)} /* free agents keep themselves sharp */
}
function growthDigest(w){const sg=w.sgain||{};const parts=[];
  for(const [id,o] of Object.entries(sg)){const g=gById(id);if(!g)continue;const bits=STATS.filter(([k])=>o[k]>0).map(([k,n])=>`${n} +${(+o[k]).toFixed(1)}`);
    if(bits.length)parts.push(`<b>${esc(g.name)}</b> ${bits.join(', ')}`)}
  if(parts.length)tnews(`📈 Growth this week: ${parts.join(' · ')}.`);w.sgain={}}
{const base=endWeek;endWeek=async function(){const w0=W_();const r=await base.apply(this,arguments);
  try{const w=W_();if(r!==false&&w&&w===w0&&!w.dead&&!w.tutorial){weeklyGrowth(w);growthDigest(w);saveWorld()}}catch(e){console.error(e)}return r}}
/* ratingsHTML — the five ratings for a fighter card: exact for your fighters and anyone scouted twice, a range after one scouting, hidden before. */
function ratingsHTML(g){const st=gStats(g);if(!st)return '';const w=W_(),pm=me();const mine=g.contract&&g.contract.mgr===pm.id;const sc=mine?3:(g.scout||0);
  const b=statBonuses(st);const perkOf={spd:b.mv?`+${b.mv} movement`:'',str:b.dmg?`+${b.dmg} damage`:'',lck:b.coin?`+${b.coin} coin a turn`:'',cha:b.cf?`+${b.cf} CF a turn`:'',int:b.tierName?`${b.tierName} mind`:`plays ${b.diff==='hard'?'Hard':b.diff==='normal'?'Normal':'Easy'}`};
  const rows=STATS.map(([k,n,ic])=>{const v=st[k];const pct=Math.round((v-STAT_MIN)/(STAT_MAX-STAT_MIN)*100);const nb=nextBand(k,v);const xp=Math.round(((g.sxp||{})[k]||0)*100);
    const val=sc>=2?`${v}`:sc===1?`${Math.max(STAT_MIN,v-4)}–${Math.min(STAT_MAX,v+4)}`:'?';
    return `<span>${ic} ${n}</span><div class="meter${v>=96?' gold':''}" title="${sc>=2&&nb?`${nb-v} to the next band (${nb})`:''}"><i style="width:${sc?pct:0}%"></i></div><span class="n">${val}</span><span class="rc-sub">${sc>=2?(k==='int'||perkOf[k]?perkOf[k]:'—')+(mine&&v<STAT_MAX?` · ${xp}% to ${v+1}`:''):''}</span>`}).join('');
  return `<div class="sect">Ratings${sc<2?` <span class="rc-sub">${sc?'one scouting: a range':'scout them to see'}</span>`:''}</div><div class="ratgrid">${rows}</div>`}
{const base=detailHTML;detailHTML=function(g){const h=base.apply(this,arguments);const i=h.indexOf('<div class="sect">');return i<0?h:h.slice(0,i)+ratingsHTML(g)+h.slice(i)}}
/* =====================================================================
   2. LETTERS — quiet correspondence, read only in Your ludus and on Match Week (never a banner on every tab)
   ===================================================================== */
/* sendLetter — o: {key (one per key), from, seal (emoji), title, body, until (absolute week it stays)} */
function sendLetter(w,o){w.letters=(w.letters||[]).filter(x=>x.key!==o.key);w.letters.unshift({wk:w.week,s:w.season,until:w.week,...o});w.letters=w.letters.slice(0,10)}
function lettersHTML(){const w=W_();if(!w)return '';const L=(w.letters||[]).filter(x=>!x.read&&x.until>=w.week);if(!L.length)return '';
  return `<div class="letters">${L.map(x=>`<details class="letter"><summary><span class="lseal">${x.seal||'✉'}</span><b>${esc(x.title)}</b> <span class="rc-sub">from ${esc(x.from)} · week ${wkOf(x.wk)}</span></summary><div class="lbody">${x.body}</div><div class="acts"><button class="btn tksm" type="button" data-ltr="${esc(x.key)}">Put it away</button></div></details>`).join('')}</div>`}
{const base=ludusTabHTML;ludusTabHTML=function(){return lettersHTML()+base.apply(this,arguments)}}
{const base=nightHTML;nightHTML=function(){return lettersHTML()+base.apply(this,arguments)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-ltr]');if(!b)return;const w=W_();if(!w)return;const x=(w.letters||[]).find(l=>l.key===b.dataset.ltr);if(x)x.read=true;saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
/* ---- the Consilium's letter: regional events that will sour this week's games ---- */
const ADVISE={att:-0.15,mood:-8}; /* TWEAK: how bad before the advisors write */
function adviseWeek(w){const n=w.night;if(!n||n.bye||typeof worldImpact!=='function')return;const L=LOCATIONS[n.loc];if(!L)return;
  const imp=worldImpact(n.loc,`m:${w.id}:${w.season}:${w.week}`);const omen=n.omen&&(n.omen.local||0)<0;
  if(!(imp.att<=ADVISE.att||imp.mood<=ADVISE.mood))return;
  const bad=imp.list.filter(e=>e.att*e.k<0||e.mood*e.k<0).slice(0,4);
  const lines=bad.map(e=>`<li>${e.i} <b>${esc(e.n)}</b>${e.k<1?` <span class="rc-sub">(felt from ${esc(e.city)})</span>`:''} — attendance ${Math.round(e.att*e.k*100)}%, mood ${Math.round(e.mood*e.k)}</li>`).join('');
  sendLetter(w,{key:'consil-'+w.week,from:'the Consilium',seal:'🏛',title:`Counsel for ${L.n}: hold our fighters back`,
    body:`<p>Lanista — the news from around ${esc(L.n)} is poor:</p><ul>${lines}</ul><p>All told the stands will be about <b>${Math.round(imp.att*100)}%</b> on a normal week and the crowd's temper <b>${imp.mood}</b>${omen?', and the omens are against us':''}. Thin gates and a sour crowd mean poor ticket sales, little Crowd Favor and a hostile verdict. <b>We counsel you to enter no one this week.</b> The decision is yours.</p>`})}
/* =====================================================================
   3. LOANS — Sica's syndicate lends only to a house in the red, on the worst terms; it never touches the treasury.
      Interest is added to the debt; each week names a minimum. Three weeks short and an anonymous spectator's
      spear finds your best fighter at rotation 7 of the next event or practice you enter. Friendly houses no
      longer lend coin: they lend fighters, pay for the road, and now and then send a small purse.
   ===================================================================== */
const SYND={rate:0.12,minPct:0.15,minFloor:8,strikes:3,spearRot:7}; /* TWEAK */
const loanRate=L=>L&&L.kind==='synd'?SYND.rate:0.08;
loanLender=function(){return {mgr:null,name:"Sica's syndicate",kind:'synd'}};
function loanWeek(w,pm){const L=w.loan;if(!L||L.amt<=0)return;const due=L.due||0,paid=L.paid||0;
  const inte=Math.ceil(L.amt*loanRate(L));L.amt+=inte;
  if(due>0)L.missed=paid>=due?0:(L.missed||0)+1;
  L.paid=0;L.due=Math.min(L.amt,Math.max(SYND.minFloor,Math.ceil(L.amt*SYND.minPct)));
  tnews(`💸 Loan: +${inte} interest · ${L.amt} owed to ${esc(L.name)} · this week's minimum <b>${L.due}</b>${L.missed?` · <b>${L.missed} week${L.missed>1?'s':''} short</b>`:''}.`,L.missed?'bad':'');
  if(L.kind!=='synd'){if(L.missed){pm.fame=clamp(pm.fame-1,0,100);const lm=L.mgr&&mgrById(L.mgr);if(lm)lm.relB=(lm.relB||0)-2}return}
  if(L.missed===SYND.strikes-1)sendLetter(w,{key:'synd-warn',from:"Sica's syndicate",seal:'🗡',title:'A friendly reminder',until:w.week+1,
    body:`<p>Two weeks now, and the minimum unpaid. Sica is a patient man. Patience is not the same as forgiveness.</p><p><b>Pay at least ${L.due} coin this week</b>, or the next time one of your fighters steps onto the sand, someone in the stands will settle the account for us.</p>`});
  if(L.missed>=SYND.strikes){w.syndSpear={wk:w.week,done:false};L.missed=0;
    sendLetter(w,{key:'synd-spear',from:"Sica's syndicate",seal:'🗡',title:'The account will be settled',until:w.week+2,
      body:`<p>Three weeks. We did write.</p><p>The next event or practice your house enters, a friend of ours will be in the stands. Your best fighter will not see the end of it. <span class="rc-sub">(At rotation ${SYND.spearRot}, a spear from the crowd eliminates your highest-rated entrant.)</span></p>`});
    tnews(`🗡 <b>Sica's syndicate has run out of patience.</b> Your next event or practice will cost you your best fighter.`,'bad')}}
loanCardHTML=function(){const w=W_(),m=me();const L=w.loan;
  if(L&&L.amt>0){const due=L.due||0,paid=L.paid||0;const left=Math.max(0,due-paid);
    return `<div class="card2 loanbox"><div class="sect" style="margin-top:0">💸 Your debt to ${esc(L.name)}</div>
    <p class="rc-sub" style="margin:0 0 6px"><b>${L.amt} coin owed</b> · ${Math.round(loanRate(L)*100)}% interest a week, added to the debt · nobody takes it from your treasury: you pay by hand.
    ${due?` This week's minimum: <b>${due}</b>${paid?` (paid ${paid}${left?`, ${left} to go`:' ✓'})`:''}.`:' No minimum due yet this week.'}${L.missed?` <b style="color:var(--blood2)">${L.missed} week${L.missed>1?'s':''} short${L.kind==='synd'?` — ${SYND.strikes} and the syndicate collects in blood`:''}.</b>`:''}</p>
    <div class="acts">${left?`<button class="btn primary" type="button" data-mg="loanmin" ${dis(needCoin(m,left))}>Pay the minimum · ${left}</button>`:''}<button class="btn" type="button" data-mg="loanpay" ${dis(needCoin(m,Math.min(L.amt,50)))}>Pay 50 now</button><button class="btn" type="button" data-mg="loanpayall" ${dis(needCoin(m,L.amt))}>⚖ Pay it all off · ${L.amt}</button></div></div>`}
  if(!w.loanAsk||m.coin>=0)return '';
  const sizes=loanSizes(m);
  return `<div class="card2 loanbox offer"><div class="sect" style="margin-top:0">💸 A rope, for a price</div>
    <p style="margin:0 0 6px">A man with a boxer's ears introduces himself: <b>Sica's syndicate</b> lends to lanistae the banks won't touch. <span class="rc-sub">${Math.round(SYND.rate*100)}% interest a week, added to the debt. Each week has a minimum payment; miss it ${SYND.strikes} weeks running and they collect another way.</span></p>
    <div class="acts">${sizes.map(a=>`<button class="btn" type="button" data-mg="loan" data-id="${a}">Borrow ${a}</button>`).join('')}<button class="btn" type="button" data-mg="loanno">Refuse — a lanista pays his own way</button></div></div>`};
/* pay exactly the minimum (the other buttons are the original handlers) */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg="loanmin"]');if(!b)return;e.stopPropagation();const w=W_(),m=me();const L=w&&w.loan;if(!L)return;
  const pay=Math.min(L.amt,Math.max(0,(L.due||0)-(L.paid||0)),Math.max(0,m.coin));if(pay<=0)return;m.coin-=pay;L.amt-=pay;L.paid=(L.paid||0)+pay;
  if(L.amt<=0){tnews(`💸 <b>Debt cleared</b> — ${esc(L.name)} drinks to your health.`,'big');w.loanDone=(w.loanDone||0)+1;w.loan=null}else tnews(`💸 Paid the week's minimum to ${esc(L.name)}: ${pay} coin.`);
  saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* the spear: the next event or practice config with your fighter in it carries it */
function spearCfg(cfg){const w=W_();if(!cfg||!w||!w.syndSpear||w.syndSpear.done)return cfg;const pm=me();
  const mine=(cfg.seats||[]).map(s=>gById(s.mgrGid)).filter(g=>g&&g.contract&&g.contract.mgr===pm.id);if(!mine.length)return cfg;
  const g=mine.sort((a,b)=>effOvr(b)-effOvr(a))[0];cfg.syndSpear=g.id;w.syndSpear.done=true;w.syndSpear.gid=g.id;saveWorld();return cfg}
{const base=boutCfg;boutCfg=function(){return spearCfg(homeCfg(base.apply(this,arguments)))}}
{const base=exhibCfg;exhibCfg=function(){return spearCfg(homeCfg(base.apply(this,arguments)))}}
{const base=newState;newState=function(config){const r=base.apply(this,arguments);if(S)S.syndSpear=config&&config.syndSpear||null;return r}}
{const base=spectatorsAct;spectatorsAct=async function(){const r=await base.apply(this,arguments);
  if(S&&S.syndSpear&&!S.syndSpearDone&&S.rotation>=SYND.spearRot&&!S.over){S.syndSpearDone=1;const p=S.players.find(x=>x.mgrGid===S.syndSpear&&x.alive&&!x.exited);
    if(p){log(`🗡 A spear flies from the stands — no one sees who threw it. <b>${nm(p)}</b> goes down. Somewhere in the crowd, Sica's man is already leaving.`,'big');
      if(typeof mToast==='function'&&!HEADLESS&&!S.sim)mToast(`🗡 The syndicate collects: ${p.name} is speared from the stands.`);
      eliminate(p,{type:'env'});checkEnd();if(typeof settle==='function')await settle()}}
  return r}}
/* friendly houses help in kind: a small purse now and then when you are struggling */
function friendGift(w,pm){if(pm.coin>=20||typeof opinionOf!=='function'||w.week-(w.giftWk||-99)<4||Math.random()>.5)return;
  const f=w.mgrs.filter(m=>!m.isPlayer&&opinionOf(m).v>=60).sort((a,b)=>opinionOf(b).v-opinionOf(a).v)[0];if(!f)return;
  const amt=5+Math.floor(Math.random()*11);if(f.coin<amt+20)return;f.coin-=amt;pm.coin+=amt;w.giftWk=w.week;
  sendLetter(w,{key:'gift-'+w.week,from:f.ludus,seal:'🎁',title:'A small purse, between friends',body:`<p>${esc(f.name)} heard times are hard at ${esc(pm.ludus)}. Enclosed: <b>${amt} coin</b>. No interest, no terms — only remember who stood by you.</p>`});
  tnews(`🎁 ${esc(f.ludus)} sends ${amt} coin, between friends.`)}
/* =====================================================================
   4. HOME GAMES — any game in your lanista's home city: 'Home' on the schedule, +2 CF and friendly stands
   ===================================================================== */
function homeCfg(cfg){try{const L=LOCATIONS[cfg.loc];if(!L)return cfg;for(const s of cfg.seats||[]){const g=gById(s.mgrGid);const m=g&&g.contract?mgrById(g.contract.mgr):null;if(m&&m.city===L.n)s.homeHouse=m.ludus}}catch(e){}return cfg}
{const base=empireTurnout;empireTurnout=function(cfg){let n=base.apply(this,arguments);const hh=[...new Set((cfg&&cfg.seats||[]).map(s=>s.homeHouse).filter(Boolean))];
  if(hh.length){n=clamp(n+4,3,SPECT_MAX);(S.turnoutWhy=S.turnoutWhy||[]).push(`+4 home regulars backing ${hh.join(' & ')}`)}return n}}
{const base=seasonTabHTML;seasonTabHTML=function(){let h=base.apply(this,arguments);try{const pm=me();if(pm&&pm.city)h=h.split(`<td>📍 ${esc(pm.city)}</td>`).join(`<td><b class="hometag">🏠 Home</b> · ${esc(pm.city)}</td>`)}catch(e){}return h}}
{const base=nightHTML;nightHTML=function(){let h=base.apply(this,arguments);try{const w=W_(),pm=me();const L=w&&w.night&&LOCATIONS[w.night.loc];if(L&&pm&&L.n===pm.city&&!w.night.bye)h=`<div class="card2 homegame"><b class="hometag">🏠 Home games this week</b> <span class="rc-sub">${esc(L.n)} is your city: your fighters start with +2 CF and your regulars fill the stands.</span></div>`+h}catch(e){}return h}}
/* =====================================================================
   5. GRADES — one medal ladder: A gold (and it shines), B silver, C bronze, D iron, F blood
   ===================================================================== */
const gradeKey=g=>{const s=String(g||'');return /^(S|A)/.test(s)?'A':s[0]==='B'?'B':s[0]==='C'?'C':s[0]==='D'?'D':'F'};
function gradeChip(g){return `<span class="grade ${gradeKey(g)}">${esc(String(g))}</span>`}
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{h=h.replace(/(<span class="badge" title="Ludus grade[^"]*">)Grade ([A-DFS][+]?)<\/span>/,(m0,a,g)=>`${a}Grade ${gradeChip(g)}</span>`)}catch(e){}return h}}
/* =====================================================================
   6. SMALL THINGS — the left rail's headers fold their tabs; pay-to-join offers only where they belong;
      loan tags on Match Week; advisors and gifts at the week's turn
   ===================================================================== */
const railShut=(()=>{try{return new Set(JSON.parse(localStorage.getItem('flavius_railshut')||'[]'))}catch(e){return new Set()}})();
{const base=railTabs;railTabs=function(tabs,groups,cur,attr,cls){let h=base.apply(this,arguments);
  return h.replace(/<div class="railgrp"><div class="railhd">([^<]*)<\/div>/g,(m0,g)=>{const shut=railShut.has(g);const on=groups.some(([gn,ks])=>gn===g&&ks.includes(cur));
    return `<div class="railgrp${shut?' shut':''}"><button type="button" class="railhd fold${on?' cur':''}" data-railg="${esc(g)}" aria-expanded="${!shut}">${g}<span class="rcar">▾</span></button>`})}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-railg]');if(!b)return;e.stopPropagation();const g=b.dataset.railg;const grp=b.parentElement;
  if(railShut.has(g))railShut.delete(g);else railShut.add(g);grp.classList.toggle('shut',railShut.has(g));b.setAttribute('aria-expanded',String(!railShut.has(g)));
  try{localStorage.setItem('flavius_railshut',JSON.stringify([...railShut]))}catch(err){}},true);
{const base=buyOfferHTML;buyOfferHTML=function(){const w=W_();if(w&&w.payJoin&&!['ludus','recruit'].includes(MGR.tab)){const pj=w.payJoin;w.payJoin=null;try{return base.apply(this,arguments)}finally{w.payJoin=pj}}return base.apply(this,arguments)}}
/* lentOut / loanTag — a fighter on loan: yours out with another house, or someone else's in yours */
function lentOut(g){const pm=me();return !!(g&&g.loanFrom&&pm&&(g.loanFrom.mid===pm.id||g.contract&&g.contract.mgr===pm.id))}
function loanTag(g){if(!g||!g.loanFrom)return '';const pm=me();const from=mgrById(g.loanFrom.mid);const to=g.contract?mgrById(g.contract.mgr):null;
  if(pm&&g.loanFrom.mid===pm.id)return ` <span class="loantag mine" title="Your fighter, fighting for another house this week">🤝 your fighter · on loan to ${esc(to?to.ludus:'another house')}</span>`;
  return ` <span class="loantag">on loan from ${esc(from?from.ludus:'another house')}</span>`}
{const base=endWeek;endWeek=async function(){const w0=W_();const r=await base.apply(this,arguments);
  try{const w=W_();if(r!==false&&w&&w===w0&&!w.dead&&!w.tutorial){adviseWeek(w);friendGift(w,me());saveWorld()}}catch(e){console.error(e)}return r}}

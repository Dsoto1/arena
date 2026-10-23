/* =====================================================================
   350-V104ROSTER · v1.04 builder C — THE ROSTER, LOANS AND TRADES (his answers N5 cap/starters/layout/order a, N6a, X1a, X2, X5, E1a;
   tools/plans/v103/NOTES.md + tools/plans/v104/PLAN.md "C"). Kill switch localStorage flavius_v104coff=1. Test tools/tests/tv104c.js
   =====================================================================
   1 · ROSTER CAP GROWS — `cap104(m)` = 8 + Barracks level (0–3) + Barracks master level above 1 (1–5), never above the hard cap 15
       (CAP104). Rival houses have no council: their "Barracks master" level is read from their fame (1 + fame/20, max 5) — a hash-free,
       dice-free number. REPLACES 345's flat MGR_CAP103=15: cap103Why / cap103Trim are re-pointed at cap104 (so offerVerdict, poachVerdict,
       court88Sign, borrowFrom, the Offer/Poach/cart guards and the desk all follow), offerAccept checks both houses.
       OVER-CAP CAREERS (X1a): nobody is released; no signing or borrowing until under; the desk row "Over the cap 23 / 12" with Release /
       Lend / Trade; the fighters ABOVE the cap (the latest signed) cost 25% more in wages (weekMoney shows it; endWeek charges it).
       Rivals are trimmed back to their own cap at every week's end (345's rule, their cap now).
       The Barracks (FAC fx) and the Barracks master's level line say "+1 roster place".
   2 · 4 + 4 — g.tm104 'A' First team (Bouts I–III = g.slot95 1–3 as before + ONE reserve who covers a hurt or resting starter's bout in the
       weekly fill) · 'B' Second team (4) · none = Rostered; lent-out fighters stand apart. tm104Ensure keeps it (slotted ⇒ First team,
       at most 4 + 4; a fighter who leaves loses his place). REPLACES 229's three starter tablets as the way to set starters (g.slot95 stays
       the Match Week rule). The reserve gets the starter perk (+2 morale, +1 loyalty) at the week's end. Rival houses: their First team =
       their best four (depthOf for a rival house → 4 starters, never lent to you).
   3 · THE ROSTER PAGE — ONE sortable list on the left: group headers First team / Second team / Rostered / Lent out; columns bout chip ·
       face · name · tier (grade) · OVR · W–L · wage · fatigue · weeks · ⋯; a click on a column sorts inside every group (default OVR, his
       "order a"); ⋯ = the row menu (team, bout, lend with this week's terms, recall, ward) and rows DRAG between groups. The RIGHT side is
       ONLY the selected gladiator: portrait (+ his team control), ratings, personality · record, then the contract TABULA with "Keeping
       him" folded inside it, and the fold with the rest of his card. REPLACES 298's starter tablets, the Bench & loans panel and the
       separate Keeping-him block (rows keep [data-mg="lsel"]; the lesson's spot is unchanged).
   4 · LOAN CONTRACT (N6a) — a new loan is a LUMP SUM paid up front (this week's market price × weeks, 343's loan102Fee) and the borrower
       pays his wage under his own terms; no weekly fee. After 2+ wins on the loan the borrower may offer to BUY HIM OUT when it ends: a
       rival's offer comes to you as an offer card (accept / refuse); when you borrowed him, his house offers him to you. Running loans
       finish on their old terms (X2: only loans made from now carry `loanFrom.c104`). REPLACES 343's weekly fee for new loans.
       A Bout starter is not lent (the reserve may be; he leaves the First team); a house at its cap or short of the lump does not borrow.
   5 · TRADE BUNDLES (E1a) — on a rival's team page the trade panel takes 2+ of yours for 1 of theirs (+ coin): once a week; quantity counts
       for less than quality (the best one full value, each other 55%); their cap must hold the bundle; a declined bundle that came close
       returns NEXT WEEK as a counter-offer letter ("add N coin and it is done").
   Data: g.tm104, w.tm104, loanFrom.{c104,lump,wk0,w0}, w.bi104 (buy-in offers), w.tb104 (counter offer), w.tb104Wk (…Wk: 348 frees it in a frozen
   playoff week). The week-end work (the +25%, the reserve's perk, the counter letter) also runs on 348's frozen playoff week ends (OFF104.frozen). SAVE_MIGRATIONS '1.04'
   (teams). Display + Manager rules only; never the dice (the house picks use no rand()).
   ===================================================================== */
const V104C={on:(()=>{try{return localStorage.getItem('flavius_v104coff')!=='1'}catch(e){return true}})()};
const CAP104={base:8,hard:15,overPct:0.25,team:4,bundleK:0.55,close:0.8,loanWk:3,buyWins:2,buyK:1.15};
const c104Toast=m=>{try{if(typeof mToast==='function')mToast(m)}catch(e){}};
const c104Redraw=()=>{try{if(typeof saveWorld==='function')saveWorld()}catch(e){}try{if(typeof MGR_REDRAW==='function')MGR_REDRAW()}catch(e){}};

/* ============================== 1 · THE CAP ============================== */
function cap104Adv(m){const w=W_();if(!m)return 1;if(m.isPlayer){try{return typeof adv98Lv==='function'?adv98Lv(w,'barracks'):1}catch(e){return 1}}
  return Math.max(1,Math.min(5,1+Math.floor((m.fame||0)/20)))}
function cap104(m){m=m||(typeof me==='function'?me():null);if(!V104C.on)return MGR_CAP103;if(!m)return CAP104.hard;
  const fac=typeof facLvl==='function'?facLvl(m,'barracks'):0;return Math.max(CAP104.base,Math.min(CAP104.hard,CAP104.base+fac+(cap104Adv(m)-1)))}
const cap104N=m=>{try{return rosterOf(m||me()).length}catch(e){return 0}};
/* the fighters above the cap = the latest signed */
function cap104Over(m){m=m||me();const ros=rosterOf(m);const cap=cap104(m);if(ros.length<=cap)return [];const idx=new Map(W_().glads.map((g,i)=>[g.id,i]));
  return [...ros].sort((a,b)=>((b.contract.since||0)-(a.contract.since||0))||(idx.get(b.id)-idx.get(a.id))).slice(0,ros.length-cap)}
function cap104Extra(m){return cap104Over(m).reduce((a,g)=>a+Math.round((g.contract.wage||0)*CAP104.overPct),0)}
if(V104C.on){
  {const base=cap103Why;cap103Why=function(){try{const w=W_();if(!V103B.on||!w||w.tutorial||w.dead)return '';const pm=me();const n=cap104N(pm),cap=cap104(pm);if(n<cap)return '';
    return n>cap?_T`Over the cap: ${n} / ${cap} fighters under contract. Release, lend or trade some before you sign anyone.`:_T`Your ludus is full: ${n} of ${cap} fighters under contract. Release, lend or trade one first — the Barracks and the Barracks master make room.`}catch(e){return base.apply(this,arguments)}}}
  cap103Trim=function(w){for(const m of w.mgrs||[]){if(m.isPlayer||m.dead||m.sica)continue;let ros=rosterOf(m);const cap=cap104(m);
    while(ros.length>cap){const out=ros.filter(g=>!g.loanFrom&&!g.sotonium).sort((a,b)=>effOvr(a)-effOvr(b))[0];if(!out)break;out.contract=null;delete out.tm104;try{ghist(out,_T`released by ${esc(m.ludus)} — the house was over its roster cap`)}catch(e){}ros=rosterOf(m)}}};
  /* a trade or sale must fit both houses */
  {const base=offerAccept;offerAccept=function(o){try{const pm=me(),m=o&&mgrById(o.mid);if(o&&m&&(o.kind==='swap'||o.kind==='coin')){const give=o.kind==='swap'?(o.give||[]).length:0;
      const mineN=cap104N(pm)-1+give,theirN=cap104N(m)+1-give;
      if(give>1&&mineN>cap104(pm)){OFFER_FAIL95=_T`Over the cap: that trade brings ${give} fighters for one and your ludus holds ${cap104N(pm)} / ${cap104(pm)}.`;return false}
      if(theirN>cap104(m)){OFFER_FAIL95=_T`${esc(m.ludus)} has no room — their roster is at its cap of ${cap104(m)}.`;return false}}}catch(e){console.error(e)}return base.apply(this,arguments)}}
  /* the desk: over the cap, with what to do */
  {const base=weekChecklist;weekChecklist=function(){let I=base.apply(this,arguments);try{const w=W_(),pm=me();if(!w||!pm||w.tutorial||w.dead)return I;
    I=I.filter(x=>!(x&&x.ic==='👥'&&/Over the cap/.test(String(x.txt||''))));const n=cap104N(pm),cap=cap104(pm);
    if(n>cap){const ex=cap104Extra(pm);I.push({done:false,ic:'👥',req99:true,cap104:1,txt:_T`<b>Over the cap: ${n} / ${cap}</b> — nobody new can sign or come on loan until you are under it. The ${n-cap} above the cap cost 25% more (+${ex} a week).`,
      btn:`<button class="btn tksm" type="button" data-mg="tab" data-id="roster">${_T`Release`}</button> <button class="btn tksm" type="button" data-mg="tab" data-id="roster">${_T`Lend`}</button> <button class="btn tksm" type="button" data-mg="tab" data-id="league">${_T`Trade`}</button>`})}}catch(e){console.error(e)}return I}}
  /* wages above the cap: +25% */
  {const base=weekMoney;weekMoney=function(){const r=base.apply(this,arguments);try{const w=W_();if(r&&w&&!w.tutorial&&!w.dead){const ex=cap104Extra(me());if(ex){r.cap104=ex;r.wages+=ex;r.net-=ex;r.runway=r.net>=0?Infinity:Math.max(0,Math.floor(r.coin/-r.net))}}}catch(e){console.error(e)}return r}}
  /* the Barracks and its master say what they add */
  try{const F=FAC.barracks;const fx=F.fx;F.fx=l=>fx(l)+_T` · +${l} roster place${l===1?'':'s'}`}catch(e){}
  if(typeof adv100Fx==='function'){const base=adv100Fx;adv100Fx=function(k,lv){const s=base.apply(this,arguments);try{if(k==='barracks'&&lv>1)return s+_T` · +${lv-1} roster place${lv===2?'':'s'}`}catch(e){}return s}}
}

/* ============================== 2 · FIRST TEAM 4 + SECOND TEAM 4 ============================== */
const TM104=()=>({A:[_T('First team'),_T('Bouts I–III and a reserve who covers them')],B:[_T('Second team'),_T('next in line')],R:[_T('Rostered'),_T('under contract, not in the plans')],I:[_T('🩸 Injured'),_T('cannot fight — back by himself when fit')],L:[_T('Lent out'),_T('fighting for other houses')]});
const c104Pool=(w,pm)=>w&&pm?(w.glads||[]).filter(g=>g.alive&&g.contract&&g.contract.mgr===pm.id):[];
const c104LentOut=(w,pm)=>(w.glads||[]).filter(g=>g.alive&&g.loanFrom&&g.loanFrom.mid===pm.id&&g.contract&&g.contract.mgr!==pm.id);
function team104(g,pm){pm=pm||me();if(!g||!pm)return 'R';if(g.loanFrom&&g.loanFrom.mid===pm.id&&g.contract&&g.contract.mgr!==pm.id)return 'L';if(g.slot95||g.tm104==='A')return 'A';return g.tm104==='B'?'B':'R'}
function tm104Ensure(w,pm){if(!w||!pm||!w.glads||!V104C.on)return false;let ch=false;const pool=c104Pool(w,pm);const ids=new Set(pool.map(g=>g.id));const by=(a,b)=>effOvr(b)-effOvr(a);
  for(const g of w.glads)if(g.tm104&&!ids.has(g.id)){delete g.tm104;ch=true}
  if(!w.tm104){w.tm104=1;ch=true;const rest=pool.filter(g=>!g.slot95).sort(by);const fit=rest.filter(g=>!g.inj);
    const r4=fit[0];if(r4)r4.tm104='A';for(const g of rest.filter(x=>x!==r4).slice(0,CAP104.team))g.tm104='B'}
  for(const g of pool)if(g.slot95&&g.tm104!=='A'){g.tm104='A';ch=true}
  const A=pool.filter(g=>g.tm104==='A');if(A.length>CAP104.team){for(const g of A.filter(x=>!x.slot95).sort((a,b)=>effOvr(a)-effOvr(b)).slice(0,A.length-CAP104.team)){g.tm104='B';ch=true}}
  const B=pool.filter(g=>g.tm104==='B');if(B.length>CAP104.team){for(const g of [...B].sort((a,b)=>effOvr(a)-effOvr(b)).slice(0,B.length-CAP104.team)){delete g.tm104;ch=true}}
  return ch}
const tm104Count=(w,pm,k)=>c104Pool(w,pm).filter(g=>team104(g,pm)===k).length;
/* move a fighter: k = 'A' | 'B' | 'R'; slot (A only) = 1–3 a bout, 0 the reserve, undefined = keep / auto */
function tm104Move(gid,k,slot){const w=W_(),pm=me();if(!w||!pm)return {no:_T('No ludus.')};const g=c104Pool(w,pm).find(x=>x.id===gid);if(!g)return {no:_T('Not one of yours.')};
  st95Ensure(w,pm);tm104Ensure(w,pm);const cur=team104(g,pm);
  if(k==='A'){if(cur!=='A'&&tm104Count(w,pm,'A')>=CAP104.team)return {no:_T('The First team is full — four already. Move one down first.')};
    if(slot>=1&&slot<=3){if(g.inj)return {no:_T('Only a fit fighter can take a bout.')};g.tm104='A';const r=st95Set(pm,gid,slot);if(r&&r.no)return r}
    else if(slot===0){g.tm104='A';if(g.slot95){delete g.slot95;st95Ensure(w,pm)}}
    else{g.tm104='A';if(!g.slot95&&!g.inj&&c104Pool(w,pm).filter(x=>x.slot95).length<3){const r=st95Set(pm,gid,0);if(r&&r.no)return r}}}
  else if(k==='B'){if(cur!=='B'&&tm104Count(w,pm,'B')>=CAP104.team)return {no:_T('The Second team is full — four already. Move one down first.')};if(g.slot95){delete g.slot95;st95Ensure(w,pm)}g.tm104='B'}
  else{if(g.slot95){delete g.slot95;st95Ensure(w,pm)}delete g.tm104}
  tm104Ensure(w,pm);return {ok:1}}
if(V104C.on){
  {const base=st95Set;st95Set=function(pm,gid,slot){const r=base.apply(this,arguments);try{if(r&&r.ok){const w=W_();const g=gById(gid);if(g)g.tm104='A';tm104Ensure(w,pm)}}catch(e){console.error(e)}return r}}
  {const base=st95Bench;st95Bench=function(pm,gid){const r=base.apply(this,arguments);try{const w=W_();const g=gById(gid);if(g&&w){g.tm104=tm104Count(w,pm,'B')<CAP104.team?'B':undefined;if(!g.tm104)delete g.tm104;tm104Ensure(w,pm)}}catch(e){console.error(e)}return r}}
  /* the reserve covers a hurt / resting / missing starter's bout in the weekly fill */
  {const base=st95Fill;st95Fill=function(w,pm,force){const n=base.apply(this,arguments);try{if(!w||!pm||!w.night||w.night.bye||w.dead||w.tutorial)return n;if(typeof riv103==='function'&&riv103(w))return n;
    const nt=w.night;const pool=c104Pool(w,pm);let k=0;
    const res=pool.filter(g=>g.tm104==='A'&&!g.slot95&&!g.inj&&g.restWk!==w.week&&!(typeof r101Block==='function'&&r101Block(g)));
    for(const g4 of res){if(nt.bouts.some(b=>!b.done&&b.ents.includes(g4.id)))continue;
      for(let s=1;s<=3;s++){const st=pool.find(x=>x.slot95===s);if(st&&!st.inj&&st.restWk!==w.week)continue;const bo=nt.bouts[s-1];if(!bo||bo.done||(bo.wd||0)>=2)continue;
        if(bo.ents.some(id=>{const x=gById(id);return x&&x.contract&&x.contract.mgr===pm.id}))continue;
        const out=bo.ents.map(gById).filter(x=>x&&!x.contract).sort((x,y)=>effOvr(x)-effOvr(y))[0];if(!out)continue;
        bo.ents[bo.ents.indexOf(out.id)]=g4.id;try{voidBets(bo,out.id)}catch(e){}(nt.auto95=nt.auto95||[]).push(g4.id);(nt.cov104=nt.cov104||[]).push(g4.id);k++;break}}
    return n+k}catch(e){console.error(e)}return n}}
  /* rivals: their First team is their best four (never lent) */
  {const base=depthOf;depthOf=function(m){if(!m||m.isPlayer)return base.apply(this,arguments);try{const ros=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));const n=Math.min(CAP104.team,ros.length);return {starters:ros.slice(0,n),bench:ros.slice(n)}}catch(e){return base.apply(this,arguments)}}}
  {const base=signGlad;signGlad=function(g){const r=base.apply(this,arguments);try{const w=W_(),pm=me();if(w&&pm&&g&&g.contract&&g.contract.mgr===pm.id&&!g.tm104){if(tm104Count(w,pm,'B')<CAP104.team)g.tm104='B';tm104Ensure(w,pm)}}catch(e){}return r}}
  SAVE_MIGRATIONS.push(['1.04',w=>{const pm=(w.mgrs||[]).find(m=>m.isPlayer);if(pm&&!w.tm104){try{st95Ensure(w,pm)}catch(e){}tm104Ensure(w,pm)}}]);
}

/* ============================== 4 · THE LOAN CONTRACT ============================== */
const c104WeekFee=(w,g,m,fee)=>{try{if((fee==null||fee===loanFee(g))&&typeof loan102Fee==='function'&&LOAN102.on)return loan102Fee(w,g,m)}catch(e){}return fee==null?loanFee(g):fee};
const c104Lump=(fee,weeks)=>Math.max(1,Math.round((fee||1)*(weeks||CAP104.loanWk)));
/* the houses that may borrow from you now, with this week's lump */
function c104Lenders(w,g){let H=[];try{H=typeof loan102Houses==='function'&&LOAN102.on?loan102Houses(w):(w.mgrs||[]).filter(m=>!m.isPlayer&&!m.dead&&!isRival(m)&&opinionOf(m).v>=30&&rosterOf(m).length<9)}catch(e){}
  return H.filter(m=>!m.sica&&cap104N(m)<cap104(m)).map(m=>{const fee=c104WeekFee(w,g,m);return {m,fee,lump:c104Lump(fee,CAP104.loanWk)}}).filter(x=>x.m.coin>=x.lump).sort((a,b)=>b.lump-a.lump)}
const c104LoanTxt=(g,L)=>_T`${coinAmt87(L.lump)} paid up front for ${L.wk0} weeks · ${L.weeks} left · his wage is theirs`;
if(V104C.on){
  {const base=lendTo;lendTo=function(g,m,fee,weeks){try{const w=W_(),pm=me();if(!w||!pm||!g||!m||w.tutorial)return base.apply(this,arguments);
      if(g.slot95){c104Toast(_T`🤝 ${esc(g.name)} starts a bout this week — take him off the bout before you lend him.`);return false}
      if(cap104N(m)>=cap104(m)){c104Toast(_T`🤝 ${esc(m.ludus)} has no room — their roster is at its cap.`);return false}
      weeks=weeks||CAP104.loanWk;const wf=c104WeekFee(w,g,m,fee);const lump=c104Lump(wf,weeks);
      if(m.coin<lump){c104Toast(_T`🤝 ${esc(m.ludus)} cannot pay the ${lump} up front.`);return false}
      const t0=(w.tlog||[])[0];const ok=base.call(this,g,m,wf,weeks);if(!ok||!g.loanFrom)return ok;
      Object.assign(g.loanFrom,{c104:1,lump,wk0:weeks,w0:(g.rec&&g.rec.w)||0});m.coin-=lump;pm.coin+=lump;delete g.tm104;
      if(g.hist&&g.hist[0]&&/loaned to/.test(g.hist[0].txt))g.hist[0].txt=_T`loaned to ${m.ludus} for ${weeks} weeks — ${lump} paid up front`;
      const msg=_T`🤝 ${esc(g.name)} goes on loan to ${esc(m.ludus)} for ${weeks} weeks — they pay ${coinAmt87(lump)} now and his wage.`;
      if(w.tlog&&w.tlog[0]&&w.tlog[0]!==t0)w.tlog[0].text=msg;else tnews(msg);return ok}catch(e){console.error(e)}return base.apply(this,arguments)}}
  {const base=borrowFrom;borrowFrom=function(g,m,fee,weeks){try{const w=W_(),pm=me();if(!w||!pm||!g||!m||w.tutorial)return base.apply(this,arguments);
      weeks=weeks||CAP104.loanWk;const lump=c104Lump(fee==null?loanFee(g):fee,weeks);
      if(pm.coin<lump){c104Toast(_T`🤝 The treasury cannot pay the ${lump} up front.`);return false}
      const t0=(w.tlog||[])[0];const ok=base.apply(this,arguments);if(!ok||!g.loanFrom)return ok;
      Object.assign(g.loanFrom,{c104:1,lump,wk0:weeks,w0:(g.rec&&g.rec.w)||0});pm.coin-=lump;m.coin+=lump;
      const msg=_T`🤝 ${esc(g.name)} joins you on loan from ${esc(m.ludus)} for ${weeks} weeks — ${coinAmt87(lump)} paid now, and you pay his wage.`;
      if(w.tlog&&w.tlog[0]&&w.tlog[0]!==t0)w.tlog[0].text=msg;else tnews(msg);
      if(tm104Count(w,pm,'B')<CAP104.team)g.tm104='B';return ok}catch(e){console.error(e)}return base.apply(this,arguments)}}
  /* the week: new loans pay no weekly fee (hidden from 47's loop), count down here, and may end in a buy-out offer */
  {const base=loansWeek;loansWeek=function(w,pm){const st=[];for(const g of w.glads||[])if(g.alive&&g.loanFrom&&g.loanFrom.c104){st.push([g,g.loanFrom]);delete g.loanFrom}
    const n0=(w.offers||[]).length;let r;try{r=base.apply(this,arguments)}finally{for(const [g,L] of st)g.loanFrom=L}
    try{/* asks made this week: none for a fighter already on loan or on the First team; the house must hold the lump and have room */
      const O=w.offers||[];for(let i=O.length-1;i>=n0;i--){const o=O[i];if(o.kind!=='loan')continue;const g=gById(o.gid),m=mgrById(o.mid);
        if(!g||!m||g.loanFrom||g.slot95||cap104N(m)>=cap104(m)||m.coin<c104Lump(o.fee,o.weeks)){O.splice(i,1);continue}o.c104=1}
      for(const [g,L] of st){const borrower=mgrById(g.contract&&g.contract.mgr),owner=mgrById(L.mid);L.weeks--;if(L.weeks>0)continue;
        const wins=((g.rec&&g.rec.w)||0)-(L.w0||0);if(owner){g.contract.mgr=owner.id;ghist(g,_T`back home to ${owner.ludus} after a loan (${wins} win${wins===1?'':'s'})`);
          if(owner.isPlayer||(borrower&&borrower.isPlayer))tnews(_T`🤝 ${esc(g.name)}’s loan ends — back to ${esc(owner.ludus)}.`)}
        delete g.loanFrom;if(owner&&borrower&&wins>=CAP104.buyWins)c104BuyOut(w,g,borrower,owner,wins)}}catch(e){console.error(e)}return r}}
}
const c104Price=g=>Math.max(30,Math.round(gValue(g)*CAP104.buyK));
function c104BuyOut(w,g,borrower,owner,wins){const price=c104Price(g);
  if(owner.isPlayer&&!borrower.isPlayer){if(borrower.coin<price||cap104N(borrower)>=cap104(borrower))return;
    (w.offers=w.offers||[]).push({id:'o'+Date.now().toString(36)+'b',kind:'coin',mid:borrower.id,gid:g.id,coin:price,until:w.week+1,bo104:wins});
    tnews(_T`📨 <b>${esc(borrower.ludus)}</b> liked what they saw: ${wins} wins on loan — they offer ${coinAmt87(price)} to buy <b>${esc(g.name)}</b> outright.`,'big')}
  else if(borrower.isPlayer&&!owner.isPlayer){(w.bi104=w.bi104||[]).push({id:'b'+Date.now().toString(36),mid:owner.id,gid:g.id,coin:price,until:w.week+1,wins});
    tnews(_T`📨 <b>${esc(owner.ludus)}</b> will sell <b>${esc(g.name)}</b> after ${wins} wins under your colours — ${coinAmt87(price)} buys him outright.`,'big')}}
function c104BiLive(w,o){const g=gById(o.gid),m=mgrById(o.mid);return !!(g&&m&&g.alive&&g.contract&&g.contract.mgr===m.id&&o.until>=w.week&&!g.loanFrom)}
function c104BiHTML(o){const g=gById(o.gid),m=mgrById(o.mid);return `<div class="card2 offerbox bo104"><div class="sect" style="margin-top:0">${_T`📨 A buy-out offer from ${typeof flagChip==='function'?flagChip(m,18):''} ${esc(m.ludus)}`} <span class="rc-sub">${_T`answer by week ${wkOf(o.until)}`}</span></div>
  <div class="offrow"><div class="offside"><span class="rc-sub">${_T`You buy`}</span>${gArt(g,'sm')}<b>${esc(g.name)}</b><span class="rc-sub">${_T`rated ${effOvr(g)} · ${g.contract.wage}/wk · ${o.wins} wins on loan`}</span></div><span class="offarrow">⇄</span>
  <div class="offside"><span class="rc-sub">${_T`You pay`}</span><span class="offcoin">${coinAmt87(o.coin)}</span><span class="rc-sub">${_T`his contract comes with him`}</span></div></div>
  <div class="acts"><button class="btn primary tksm" type="button" data-r104bo="yes|${o.id}">${_T`✔ Buy him`}</button><button class="btn tksm" type="button" data-r104bo="no|${o.id}">${_T`✖ Decline`}</button></div></div>`}
function c104BoBox(o){const g=gById(o.gid),m=mgrById(o.mid);if(!g||!m||!g.contract)return '';return `<div class="card2 offerbox bo104"><div class="sect" style="margin-top:0">${_T`📨 A buy-out offer from ${typeof flagChip==='function'?flagChip(m,18):''} ${esc(m.ludus)}`} <span class="rc-sub">${_T`answer by week ${wkOf(o.until)}`}</span></div>
  <div class="offrow"><div class="offside"><span class="rc-sub">${_T`They want to keep`}</span>${gArt(g,'sm')}<b>${esc(g.name)}</b><span class="rc-sub">${_T`rated ${effOvr(g)} · ${o.bo104} wins for them on loan`}</span></div><span class="offarrow">⇄</span>
  <div class="offside"><span class="rc-sub">${_T`They pay`}</span><span class="offcoin">${coinAmt87(o.coin)}</span><span class="rc-sub">${_T`his contract goes with him`}</span></div></div>
  <div class="acts"><button class="btn primary tksm" type="button" data-m47="offyes" data-id="${o.id}">${_T`✔ Sell`}</button><button class="btn tksm" type="button" data-m47="offno" data-id="${o.id}">${_T`✖ Keep him`}</button></div></div>`}
/* a house's ask to borrow your fighter, in the contract's words */
function c104AskHTML(o){const m=mgrById(o.mid),g=gById(o.gid);if(!m||!g||!g.contract)return '';const lump=c104Lump(o.fee,o.weeks);
  return `<div class="card2 offerbox"><div class="sect" style="margin-top:0">${_T`📨 A loan request from ${typeof flagChip==='function'?flagChip(m,18):''} ${esc(m.ludus)}`} <span class="rc-sub">${_T`answer by week ${wkOf(o.until)}`}</span></div>
    <div class="offrow"><div class="offside"><span class="rc-sub">${_T`They want to borrow`}</span>${gArt(g,'sm')}<b>${esc(g.name)}</b><span class="rc-sub">${_T`rated ${effOvr(g)} · ${g.contract.wage}/wk`}</span></div><span class="offarrow">⇄</span>
    <div class="offside"><span class="rc-sub">${_T`They pay up front`}</span><span class="offcoin">${coinAmt87(lump)}</span><span class="rc-sub">${_T`for ${o.weeks} weeks, and his wage · 2+ wins and they may offer to buy him`}</span></div></div>
    <div class="acts"><button class="btn primary tksm" type="button" data-m47="offyes" data-id="${o.id}">${_T`✔ Accept`}</button><button class="btn tksm" type="button" data-m47="offno" data-id="${o.id}">${_T`✖ Decline`}</button></div></div>`}
if(V104C.on){
  if(typeof loanReq103==='function'){const base=loanReq103;loanReq103=function(o){try{if(o&&o.c104)return c104AskHTML(o)}catch(e){console.error(e)}return base.apply(this,arguments)}}
  {const base=offersHTML;offersHTML=function(){const w=W_();if(!w)return base.apply(this,arguments);let bo=[];const all=w.offers||[];
    bo=all.filter(o=>o.bo104&&o.until>=w.week);w.offers=all.filter(o=>!o.bo104);let h='';try{h=base.apply(this,arguments)}finally{w.offers=(w.offers||[]).concat(all.filter(o=>o.bo104&&(w.offers||[]).indexOf(o)<0))}
    try{w.bi104=(w.bi104||[]).filter(o=>c104BiLive(w,o));h+=bo.map(c104BoBox).join('')+w.bi104.map(c104BiHTML).join('')}catch(e){console.error(e)}return h}}
  if(typeof loanTerms==='function'){const base=loanTerms;loanTerms=function(g){try{const L=g&&g.loanFrom;if(L&&L.c104)return c104LoanTxt(g,L)}catch(e){}return base.apply(this,arguments)}}
  if(typeof loanTag==='function'){const base=loanTag;loanTag=function(g){let h=base.apply(this,arguments);try{const L=g&&g.loanFrom;if(L&&L.c104&&h)h=h.replace(/data-tip="[^"]*"/,`data-tip="${esc(_T`On loan · ${c104LoanTxt(g,L)}`)}"`)}catch(e){}return h}}
}
window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-r104bo]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  const [a,id]=b.dataset.r104bo.split('|');const w=W_(),pm=me();if(!w||!pm)return;const o=(w.bi104||[]).find(x=>x.id===id);if(!o)return;
  if(a==='no'){w.bi104=w.bi104.filter(x=>x!==o);c104Redraw();return}
  if(!c104BiLive(w,o)){c104Toast(_T('That offer is no longer on the table.'));w.bi104=w.bi104.filter(x=>x!==o);c104Redraw();return}
  const why=cap103Why();if(why){c104Toast('⛔ '+why);return}if(pm.coin<o.coin){c104Toast(_T`The treasury cannot cover ${o.coin}.`);return}
  const g=gById(o.gid),m=mgrById(o.mid);pm.coin-=o.coin;m.coin+=o.coin;g.contract.mgr=pm.id;delete g.tm104;ghist(g,_T`bought from ${m.ludus} by ${pm.ludus} after a loan`);mlog(m,_T`sold ${g.name} to ${pm.ludus}`);
  tnews(_T`✍ ${esc(g.name)} is yours — bought from ${esc(m.ludus)} for ${coinAmt87(o.coin)}.`,'big');w.bi104=w.bi104.filter(x=>x!==o);try{tm104Ensure(w,pm)}catch(err){}c104Redraw()},true);

/* ============================== 5 · TRADE BUNDLES ============================== */
function c104BunVal(gs,coin){const v=gs.map(tradeVal).sort((a,b)=>b-a);return (v[0]||0)+v.slice(1).reduce((a,x)=>a+Math.max(0,x)*CAP104.bundleK,0)+(coin||0)/6}
function c104Need(m,gt){const op=opinionOf(m).v;return tradeVal(gt)*(1.06+(op<40?.18:0)-(op>=70?.06:0)+(m.p.greed-50)/400)}
function c104Swap(w,pm,m,mine,gt,coin){pm.coin-=coin;m.coin+=coin;for(const g of mine){g.contract.mgr=m.id;delete g.tm104;delete g.slot95;ghist(g,_T`traded from ${pm.ludus} to ${m.ludus}`)}
  gt.contract.mgr=pm.id;gt.scout=3;gt.morale=clamp((gt.morale||50)+4,0,100);m.relB=(m.relB||0)+6;ghist(gt,_T`traded from ${m.ludus} to ${pm.ludus}`);
  const names=mine.map(g=>esc(g.name)).join(', ');mlog(m,_T`traded ${gt.name} to ${pm.ludus} for ${mine.map(g=>g.name).join(', ')}${coin?_T` and ${coin} coin`:''}`);
  mnews(_T`🔁 <b>Trade:</b> ${esc(gt.name)} goes to ${esc(pm.ludus)}; ${names} go to ${esc(m.ludus)}${coin?_T` (plus ${coinAmt87(coin)})`:''}.`,'big');
  tnews(_T`🔁 Traded ${names}${coin?_T` + ${coinAmt87(coin)}`:''} to ${esc(m.ludus)} for ${esc(gt.name)}.`,'big');try{st95Ensure(w,pm);tm104Ensure(w,pm)}catch(e){}}
if(V104C.on){
  {const base=tradeHTML;tradeHTML=function(mgr,trade){let h=base.apply(this,arguments);try{const w=W_(),pm=me();if(!w||!pm||w.tutorial)return h;const mine=rosterOf(pm).filter(g=>!g.loanFrom).sort((a,b)=>effOvr(b)-effOvr(a));if(mine.length<2)return h;
    const sel=new Set((trade&&trade.bun)||[]);const used=w.tb104Wk===w.week;
    const box=`<div class="tb104"><span class="rc-sub">${used?_T`＋ Bundle: your one bundle offer this week is spent.`:_T`＋ Bundle more of yours with him (2+ for 1 · once a week · the best counts in full, each other about half):`}</span><div class="tb104l">${mine.map(g=>`<label class="tb104c"><input type="checkbox" data-tb104g="${g.id}" ${sel.has(g.id)?'checked':''} ${used?'disabled':''}> ${esc(g.name)} · ${effOvr(g)}</label>`).join('')}</div></div>`;
    h=h.replace('<p class="rc-sub" style="margin:4px 0">',box+'<p class="rc-sub" style="margin:4px 0">')}catch(e){console.error(e)}return h}}
  document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.tb104g)return;e.stopPropagation();if(!MGR.trade)return;const s=new Set(MGR.trade.bun||[]);if(t.checked)s.add(t.dataset.tb104g);else s.delete(t.dataset.tb104g);MGR.trade.bun=[...s]},true);
  window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-mg="tradego"]');if(!b)return;try{
    const extra=[...document.querySelectorAll('input[data-tb104g]:checked')].map(x=>x.dataset.tb104g);const prim=document.querySelector('#trMine');const pid=prim?prim.value:null;
    const ids=[...new Set([pid,...extra].filter(Boolean))];if(ids.length<2)return;
    e.preventDefault();e.stopImmediatePropagation();const w=W_(),pm=me();const m=mgrById(b.dataset.id);const gt=gById((document.querySelector('#trTheirs')||{}).value);const coin=Math.max(0,Math.floor(+((document.querySelector('#trCoin')||{}).value)||0));
    if(!w||!pm||!m||!gt)return;const mine=ids.map(gById).filter(g=>g&&g.contract&&g.contract.mgr===pm.id&&!g.loanFrom);
    MGR.trade={mid:m.id,mine:pid,theirs:gt.id,coin,bun:extra};const no=t=>{MGR.trade.msg=t;MGR.trade.ok=false;c104Toast('✉ '+String(t).replace(/<[^>]*>/g,''));c104Redraw()};
    {const bl=typeof t112Block==='function'?t112Block(w):'';if(bl)return no(bl)}/* v1.12 (426): one trade-in every 4 weeks */
    if(w.tb104Wk===w.week)return no(_T('One bundle offer a week — your envoy carries the next one next week.'));
    if(m.envoyWk===w.week)return no(_T('Your envoy has already called on this house this week.'));
    if(coin>pm.coin)return no(_T('Your treasury cannot cover that sweetener.'));
    if(cap104N(m)-1+mine.length>cap104(m))return no(_T`“We have no room for ${mine.length} more.” — ${esc(m.name)} (their cap is ${cap104(m)})`);
    const theirs=rosterOf(m);if(theirs.length<=2&&effOvr(gt)>=effOvr([...theirs].sort((a,b)=>effOvr(b)-effOvr(a))[0]))return no(_T`“${esc(gt.name)} is the house. No.” — ${esc(m.name)}`);
    w.tb104Wk=w.week;m.envoyWk=w.week;const give=c104BunVal(mine,coin),need=c104Need(m,gt);
    if(give<need){const gap=Math.ceil((need-give)*6);mlog(m,_T`turned down a bundle offer from ${pm.ludus}`);
      if(give>=need*CAP104.close){w.tb104={id:/* v1.12 (426): week + house, not Date.now() */(typeof t112Id==='function'?t112Id(w,m):'t'+Date.now().toString(36)),mid:m.id,mine:mine.map(g=>g.id),theirs:gt.id,coin,ask:gap,wk:w.week};return no(_T`“Close. Let me think on it.” — ${esc(m.name)}. Expect their letter next week.`)}
      return no(_T`“Not enough.” — ${esc(m.name)}. Quantity is not quality.`)}
    c104Swap(w,pm,m,mine,gt,coin);MGR.trade=null;c104Toast(_T`🔁 Done — ${esc(gt.name)} joins ${esc(pm.ludus)}.`);c104Redraw()}catch(err){console.error(err)}},true);
  /* the counter-offer letter, the week after */
  window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-tb104]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
    const [a,id]=b.dataset.tb104.split('|');const w=W_(),pm=me();const T=w&&w.tb104;if(!T||T.id!==id||T.done){c104Toast(_T('That counter-offer is settled.'));return}
    if(a==='no'){T.done='no';c104Toast(_T('You let the counter-offer lapse.'));c104Redraw();return}
    const m=mgrById(T.mid),gt=gById(T.theirs);const mine=T.mine.map(gById).filter(g=>g&&g.alive&&g.contract&&g.contract.mgr===pm.id&&!g.loanFrom);const coin=T.coin+T.ask;
    if(!m||!gt||!gt.alive||!gt.contract||gt.contract.mgr!==m.id||mine.length!==T.mine.length){T.done='gone';c104Toast(_T('The deal is off — the fighters have moved on.'));c104Redraw();return}
    {const bl=typeof t112Block==='function'?t112Block(w):'';if(bl){c104Toast('✉ '+bl);return}}/* v1.12 (426) */
    if(pm.coin<coin){c104Toast(_T`The treasury cannot cover ${coin}.`);return}
    if(cap104N(m)-1+mine.length>cap104(m)){T.done='cap';c104Toast(_T`${esc(m.ludus)} has no room any more.`);c104Redraw();return}
    c104Swap(w,pm,m,mine,gt,coin);T.done='yes';c104Toast(_T`🔁 Done — ${esc(gt.name)} joins ${esc(pm.ludus)}.`);c104Redraw()},true);
}
function c104Counter(w){const T=w&&w.tb104;if(!T||T.sent||T.done)return;const m=mgrById(T.mid),gt=gById(T.theirs);if(!m||!gt)return;T.sent=w.week;
  const names=T.mine.map(gById).filter(Boolean).map(g=>esc(g.name)).join(', ');
  sendLetter(w,{key:'tb104-'+T.id,kind:'letter',from:esc(m.name),seal:'🔁',title:_T`${m.ludus}: a counter-offer`,until:w.week,
    body:`<p>${_T`“I thought about your bundle — ${names} for <b>${esc(gt.name)}</b>. Add <b>${coinAmt87(T.ask)}</b>${T.coin?_T` to the ${T.coin} you offered`:''} and it is done. This week only.”`}</p><div class="acts"><button class="btn primary tksm" type="button" data-tb104="yes|${T.id}">${_T`✔ Accept · ${coinAmt87(T.coin+T.ask)}`}</button><button class="btn tksm" type="button" data-tb104="no|${T.id}">${_T`✖ Decline`}</button></div>`})}

/* ============================== the week's end ============================== */
if(V104C.on){const base=endWeek;endWeek=async function(){const w0=W_();let ex=0,res=[],wk=w0&&w0.week,frz=false,tPre=null;
  try{const pm0=w0&&!w0.dead&&!w0.tutorial?me():null;if(pm0){frz=typeof OFF104!=='undefined'&&!!OFF104.frozen(w0);tPre=w0.tb104&&!w0.tb104.sent&&!w0.tb104.done?w0.tb104.id:null;ex=cap104Extra(pm0);tm104Ensure(w0,pm0);res=c104Pool(w0,pm0).filter(g=>g.tm104==='A'&&!g.slot95).map(g=>g.id)}}catch(e){console.error(e)}
  const r=await base.apply(this,arguments);
  /* 348's playoff weeks are "frozen" (w.week stays 11 while the week really ends): they count as a week end here too */
  try{const w=W_();if(r!==false&&w&&w===w0&&(w.week!==wk||frz)&&!w.dead&&!w.tutorial){const pm=me();
    if(ex){pm.coin-=ex;tnews(_T`👥 Over the cap: the fighters above it cost ${coinAmt87(ex)} more this week (+25%).`,'bad')}
    for(const id of res){const g=gById(id);if(g&&g.alive&&g.contract&&g.contract.mgr===pm.id){g.morale=clamp((g.morale||0)+ST95.perk.morale,0,100);g.loyB=clamp((g.loyB||0)+ST95.perk.loy,0,25)}}
    tm104Ensure(w,pm);if(tPre&&w.tb104&&w.tb104.id===tPre)c104Counter(w);saveWorld()}}catch(e){console.error(e)}return r}}

/* ============================== 3 · THE ROSTER PAGE ============================== */
const R104={sort:{k:'ovr',d:-1},drag:null};
try{const s=JSON.parse(localStorage.getItem('flavius_r104sort')||'null');if(s&&s.k)R104.sort=s}catch(e){}
const R104_COLS=()=>[['bout','#',''],['face','',''],['name',_T('Name'),'name'],['tier',_T('Tier'),'ovr'],['ovr',_T('OVR'),'ovr'],['wl',_T('W–L'),'wl'],['wage',_T('Wage'),'wage'],['fat',_T('Fat.'),'fat'],['wk',_T('Wk'),'wk'],['menu','','']];
function r104Key(g,k){const r=g.rec||{};switch(k){case 'name':return String(g.name||'').toLowerCase();case 'wl':return (r.w||0)*1000-Math.max(0,(r.ev||0)-(r.w||0));case 'wage':return g.contract?g.contract.wage||0:0;
  case 'fat':return gFat(g);case 'wk':return g.contract?Math.max(0,g.contract.weeks||0):0;default:return effOvr(g)}}
function r104Sort(L){const {k,d}=R104.sort;return [...L].sort((a,b)=>{const x=r104Key(a,k),y=r104Key(b,k);const c=x<y?-1:x>y?1:0;return (c*d)||(effOvr(b)-effOvr(a))})}
const r104Grade=g=>{try{return trait96Grade(effOvr(g))}catch(e){return ''}};
function r104Row(g,w,pm,sel,over,grp){const lent=grp==='L';const r=g.rec||{};const wl=`${r.w||0}–${Math.max(0,(r.ev||0)-(r.w||0))}`;const f=gFat(g);const gr=r104Grade(g);
  const chip=grp==='A'?(g.slot95?RM100_RN[g.slot95-1]:'R'):'';const chipT=grp==='A'?(g.slot95?_T`Bout ${RM100_RN[g.slot95-1]}`:_T('The reserve — covers a hurt starter')):'';
  const on=w.night&&(w.night.bouts||[]).some(b=>!b.done&&b.ents.includes(g.id));
  const wd=(g.inj&&!g.inj.war?'⚕':'')+((g.severed||[]).length?'✂':'');
  const from=!lent&&g.loanFrom&&g.loanFrom.mid!==pm.id?mgrById(g.loanFrom.mid):null;const at=lent?mgrById(g.contract.mgr):null;
  const sub=lent?_T`at ${esc(at?at.ludus:'')} · ${Math.max(0,g.loanFrom.weeks|0)} wk`:from?_T`← on loan from ${esc(from.ludus)}`:'';
  const attrs=lent?`aria-disabled="true" title="${esc(_T`${g.name} — on loan`)}"`:`data-mg="lsel" data-id="${g.id}" role="button" tabindex="0" title="${esc(g.name)}" draggable="true" data-r104d="${g.id}"`;
  const oc=over.has(g.id);
  return `<div class="rm100lr r104r${!lent&&g.id===sel?' on':''}${lent?' lent':''}${g.inj?' hurt':''}" ${attrs}>
    <span class="r104c${chip?' s':''}${on?' in':''}" title="${esc(chipT+(on?' · '+_T('on this week’s card'):''))}">${chip}</span>${rm100Imm(`<span class="rm100av r104av" data-id="${g.id}">${rm100Face(g)}</span>`,g)}
    <span class="r104n"><b class="rm100one">${esc(g.name)}${typeof chip85==='function'?chip85(g):''}${wd?` <i class="r104w">${wd}</i>`:''}</b>${sub?`<small class="rm100one">${sub}</small>`:''}</span>
    <span class="r104t" style="--gc:${gradeCol(gr)}">${gr}</span><span class="rm100num">${effOvr(g)}</span><span class="rm100iv">${wl}</span>
    <span class="rm100iv r104wg${oc?' oc':''}"${oc?` title="${esc(_T('Above the cap: +25%'))}"`:''}>${g.contract?g.contract.wage||0:''}${oc?'+':''}</span>
    <span class="r104f">${rm100Fd(g)}<span class="rm100iv">${f}</span></span><span class="rm100iv r104wk">${g.contract?Math.max(0,g.contract.weeks||0):''}</span>
    <button type="button" class="r104m" data-r104m="${g.id}" aria-label="${esc(_T`Actions for ${g.name}`)}" title="${esc(_T('Team, bout, loan'))}">⋯</button></div>`}
function r104ListHTML(w,pm,sel){const T=TM104();const ros=c104Pool(w,pm);const out=c104LentOut(w,pm);const over=new Set(cap104Over(pm).map(g=>g.id));const cap=cap104(pm);
  const G={A:[],B:[],R:[],I:[],L:out};for(const g of ros)(G[team104(g,pm)]||G.R).push(g);
  const head=`<div class="rm100lh r104h">${R104_COLS().map(([k,l,s])=>s?`<button type="button" class="r104s${R104.sort.k===s&&(k!=='tier')?' on':''}" data-r104s="${s}" data-col="${k}" title="${esc(_T`Sort by ${l}`)}">${l}${R104.sort.k===s&&k!=='tier'?(R104.sort.d<0?' ▾':' ▴'):''}</button>`:`<span data-col="${k}">${l}</span>`).join('')}</div>`;
  const grp=k=>{const L=k==='L'?G.L:r104Sort(G[k]);const n=k==='A'||k==='B'?`${L.length} / ${CAP104.team}`:String(L.length);if((k==='L'||k==='I')&&!L.length)return '';
    return `<div class="r104g" data-r104g="${k}"><div class="r104gh"><b>${T[k][0]}</b><span class="r104gn">${n}</span><small class="rm100one">${T[k][1]}</small></div>
      ${L.map(g=>r104Row(g,w,pm,sel,over,k)).join('')||`<div class="r104e">${k==='R'?_T('Nobody else under contract.'):_T('Empty — drag a fighter here, or use ⋯ on his row.')}</div>`}</div>`};
  return `<div class="rm100lhd r104lhd"><span>${_T`Your fighters`} · ${ros.length} / ${cap}</span>${ros.length>cap?`<span class="r104oc">${_T`over the cap`}</span>`:''}</div><div class="r104hint">${_T('⋯ or drag a row to set the First / Second team and bouts')}</div><div class="rm100rows r104rows">${head}${['A','B','R','I','L'].map(grp).join('')}</div>`}
/* the selected fighter's team control (inside his portrait panel) */
function r104TeamCtl(g,pm){const k=team104(g,pm);const T=TM104();if(k==='L')return '';
  const b=(kk,l,slot,on,tt)=>`<button type="button" class="r104tb${on?' on':''}" data-r104a="${kk}|${g.id}${slot!=null?'|'+slot:''}" aria-pressed="${on?'true':'false'}"${tt?` title="${esc(tt)}"`:''}>${l}</button>`;
  return `<div class="r104tc"><div class="r104seg" role="group" aria-label="${esc(_T('Team'))}">${b('A',_T('★ First'),null,k==='A',T.A[0])}${b('B',_T('Second'),null,k==='B',T.B[0])}${b('R',T.R[0],null,k==='R',T.R[0])}</div>
    ${k==='A'?`<div class="r104seg r104bo">${[1,2,3].map(s=>b('A',_T`Bout ${RM100_RN[s-1]}`,s,g.slot95===s)).join('')}${b('A',_T('Reserve'),0,!g.slot95)}</div>`:''}</div>`}
function r104Room(R,w,pm){const room=R.querySelector('#mgrPane .rm100.rm100-roster');if(!room)return false;room.classList.add('r104');
  const ros=rosterOf(pm);const g=gById(MGR.lsel)&&ros.some(x=>x.id===MGR.lsel)?gById(MGR.lsel):ros[0];if(!g)return false;
  const list=room.querySelector('.rm100list');if(list)list.innerHTML=r104ListHTML(w,pm,g.id);
  for(const x of room.querySelectorAll('.rm100stt,.rm100bench'))x.remove();
  const k=team104(g,pm);const T=TM104();
  /* the portrait panel: his team in its header, the control under his chips */
  const pp=room.querySelector('.rm100pp');if(pp){const ph=pp.querySelector('.rm100ph');
    if(ph)ph.textContent=k==='A'?(g.slot95?_T`First team · Bout ${RM100_RN[g.slot95-1]} · ${ST95_BOUT[g.slot95-1][2]}`:_T('First team · the reserve')):g.inj&&!g.inj.war?_T`${T[k][0]} · in the ward`:T[k][0];
    pp.insertAdjacentHTML('beforeend',r104TeamCtl(g,pm))}
  /* the tabula: the lend picker in the contract's words; a borrowed fighter's loan terms */
  const con=room.querySelector('.rm100con');
  if(con){const wax=con.querySelector('.rm100wax');const sel=con.querySelector('select[data-m47lend]');
    if(sel){if(g.slot95){const lw=sel.closest('label')||sel;lw.outerHTML=`<button type="button" class="btn rm100tbtn" disabled title="${esc(_T('He starts a bout — take him off it before you lend him.'))}">⇢ ${_T`Lend`}</button>`}
      else{const H=c104Lenders(w,g);const keep=new Map(H.map(x=>[x.m.id,x]));for(const o of [...sel.querySelectorAll('option')]){if(!o.value)continue;const x=keep.get(o.value);if(!x)o.remove();else o.textContent=_T`${x.m.ludus} · pays ${x.lump} now · ${CAP104.loanWk} wk`}
        if(sel.options.length<2){const lw=sel.closest('label')||sel;lw.outerHTML=`<button type="button" class="btn rm100tbtn" disabled title="${esc(_T('No house can borrow him now (room under their cap and the lump sum).'))}">⇢ ${_T`Lend`}</button>`}}}
    if(wax&&g.loanFrom&&g.loanFrom.mid!==pm.id){const o=mgrById(g.loanFrom.mid);const L=g.loanFrom;wax.querySelector('.rm100tb').insertAdjacentHTML('beforebegin',`<div class="rm100tr r104ln"><span>${_T`On loan`}</span><span class="rm100one">${L.c104?esc(_T`from ${o?o.ludus:''} · ${L.lump} paid up front · his wage is yours`):esc(_T`from ${o?o.ludus:''} · ${L.fee}/wk (old terms)`)}</span>${_T`<span>${Math.max(0,L.weeks|0)} wk</span>`}</div>`)}
    /* "Keeping him" folded inside the tabula */
    const keep=room.querySelector('.rm100keep');if(keep&&wax){const d=document.createElement('details');d.className='r104keep';if(w.tutorial||R104.keepOpen)d.open=true;
      const ph=keep.querySelector('.rm100ph');d.innerHTML=`<summary>${ph?ph.innerHTML:_T('Keeping him · coin and favours')}</summary>`;if(ph)ph.remove();d.appendChild(keep);wax.appendChild(d)}}
  const g2=room.querySelector('.rm100g2');if(g2)g2.classList.add('r104one');
  /* the count box: the cap */
  const cnt=R.querySelector('.rm100ban .rm100cnt');if(cnt){const n=ros.length,cap=cap104(pm);cnt.classList.toggle('r104over',n>cap);cnt.innerHTML=`<div class="ptbox on">${n}<small>/${cap}</small></div><span>${n>cap?_T`over the cap`:_T`the cap: Barracks + its master`}</span>`}
  return true}
/* a rival's team page: their First / Second team and their cap */
function r104Team(R){const tm=R.querySelector('.v101tm[data-v101team]');if(!tm)return false;const m=mgrById(tm.dataset.v101team);if(!m||m.isPlayer)return false;
  const ros=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));const k=new Map(ros.map((g,i)=>[g.id,i<CAP104.team?'1':i<CAP104.team*2?'2':'']));
  for(const r of tm.querySelectorAll('.v101lr[data-v101g]')){const t=k.get(r.dataset.v101g);if(!t)continue;const nm=r.querySelector('.v101nm small');if(nm)nm.insertAdjacentHTML('afterbegin',`<span class="r104tt">${t==='1'?_T('1st team'):_T('2nd team')}</span> `)}
  const ph=tm.querySelector('.v101ros .rm100ph');if(ph)ph.insertAdjacentHTML('beforeend',` <span class="v101mut">${_T`cap ${cap104(m)}`}</span>`);return true}
if(V104C.on){const base=mgrHTML;mgrHTML=function(){try{const w=W_(),pm=w&&!w.dead?me():null;if(w&&pm&&w.glads&&tm104Ensure(w,pm))w._st95dirty=1}catch(e){console.error(e)}
  const h=base.apply(this,arguments);try{const w=W_();if(!w||w.dead||MGR.view||typeof h!=='string')return h;const pm=me();if(!pm)return h;
    if(MGR.tab==='roster'&&h.indexOf('rm100-roster')>=0){const t=document.createElement('template');t.innerHTML=h;if(r104Room(t.content,w,pm))return t.innerHTML}
    if(MGR.tab==='team'&&h.indexOf('v101tm')>=0){const t=document.createElement('template');t.innerHTML=h;if(r104Team(t.content))return t.innerHTML}}catch(e){console.error(e)}return h}}

/* ---------- the row menu ⋯ ---------- */
function r104Close(){for(const p of document.querySelectorAll('.r104pop'))p.remove();R104.pop=null}
function r104MenuHTML(g,w,pm){const k=team104(g,pm);const T=TM104();const nA=tm104Count(w,pm,'A'),nB=tm104Count(w,pm,'B');
  const it=(attr,l,dis,why,on,x)=>`<button type="button" class="r104mi${on?' on':''}" ${attr} ${dis?_T`disabled title="${esc(why||'')}"`:''} role="menuitem"><span>${l}</span>${x!=null?`<small>${x}</small>`:''}</button>`;
  let h=`<div class="r104mh"><b>${esc(g.name)}</b><small>${k==='L'?T.L[0]:T[k][0]} · ${effOvr(g)}</small></div>`;
  if(k==='L'){let rc='';try{const f=recallFee(g);const busy=(w.night&&w.night.bouts||[]).some(b=>!b.done&&b.ents.includes(g.id));rc=it(`data-recall="${g.id}"`,_T`↩ Call him back · ${coinAmt87(f)}`,busy||pm.coin<f,busy?_T('He fights for them this week.'):_T('Not enough coin.'))}catch(e){}
    return h+`<div class="r104ms">${g.loanFrom&&g.loanFrom.c104?esc(c104LoanTxt(g,g.loanFrom)):esc(loanTerms(g))}</div>`+rc}
  h+=`<div class="r104ms">${_T`Team`}</div>`+it(`data-r104a="A|${g.id}"`,'★ '+T.A[0],k!=='A'&&nA>=4,_T('Four already.'),k==='A',`${nA}/4`)+it(`data-r104a="B|${g.id}"`,T.B[0],k!=='B'&&nB>=4,_T('Four already.'),k==='B',`${nB}/4`)+it(`data-r104a="R|${g.id}"`,T.R[0],false,'',k==='R');
  if(k==='A')h+=`<div class="r104ms">${_T`Bout`}</div>`+[1,2,3].map(s=>it(`data-r104a="A|${g.id}|${s}"`,_T`Bout ${RM100_RN[s-1]} · ${ST95_BOUT[s-1][2]}`,!!g.inj,_T('Only a fit fighter can take a bout.'),g.slot95===s)).join('')+it(`data-r104a="A|${g.id}|0"`,_T('Reserve · covers a hurt starter'),false,'',!g.slot95);
  const own=!(g.loanFrom&&g.loanFrom.mid!==pm.id);
  if(own){h+=`<div class="r104ms">${_T`Lend for ${CAP104.loanWk} weeks · they pay up front + his wage`}</div>`;
    const why=g.slot95?_T('He starts a bout — take him off it first.'):g.inj?_T('Hurt — nobody borrows him.'):(typeof loan102Full==='function'&&LOAN102.on&&loan102Full(w,pm))?_T('Four of yours are out on loan already.'):'';
    const H=why?[]:c104Lenders(w,g);h+=why?`<div class="r104mx">${why}</div>`:H.length?H.slice(0,5).map(x=>it(`data-r104lend="${g.id}|${x.m.id}"`,'⇢ '+esc(x.m.ludus),false,'',false,_T`${coinAmt87(x.lump)} now`)).join(''):`<div class="r104mx">${_T`No house can borrow him now.`}</div>`}
  if(g.inj&&!g.inj.war)h+=it(`data-mg="tab" data-id="infirm" data-inf90go="${g.id}"`,_T('⚕ To the Infirmary'));
  return h}
function r104Open(btn,gid){r104Close();const w=W_(),pm=me();const g=gById(gid);if(!w||!pm||!g)return;const host=document.getElementById('mBody')||document.body;
  const p=document.createElement('div');p.className='r104pop';p.setAttribute('role','menu');p.dataset.gid=gid;p.innerHTML=r104MenuHTML(g,w,pm);host.appendChild(p);R104.pop=gid;
  const r=btn.getBoundingClientRect();const pw=Math.min(280,window.innerWidth-16);p.style.width=pw+'px';const ph=p.offsetHeight;
  let x=Math.min(window.innerWidth-pw-8,Math.max(8,r.right-pw)),y=r.bottom+4;if(y+ph>window.innerHeight-8)y=Math.max(8,r.top-ph-4);p.style.left=x+'px';p.style.top=y+'px';
  const f=p.querySelector('button:not([disabled])');if(f)try{f.focus({preventScroll:true})}catch(e){}}
function r104Do(gid,k,slot){const r=tm104Move(gid,k,slot);if(r&&r.no){c104Toast('⛔ '+r.no);return false}c104Redraw();return true}
window.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||!V104C.on)return;let x;
  if((x=t.closest('[data-r104m]'))){e.preventDefault();e.stopImmediatePropagation();if(R104.pop===x.dataset.r104m)r104Close();else r104Open(x,x.dataset.r104m);return}
  if((x=t.closest('[data-r104a]'))){e.preventDefault();e.stopImmediatePropagation();const [k,gid,s]=x.dataset.r104a.split('|');r104Close();r104Do(gid,k,s==null?undefined:+s);return}
  if((x=t.closest('[data-r104lend]'))){e.preventDefault();e.stopImmediatePropagation();const [gid,mid]=x.dataset.r104lend.split('|');r104Close();const w=W_(),g=gById(gid),m=mgrById(mid);if(!w||!g||!m)return;
    if(lendTo(g,m,c104WeekFee(w,g,m),CAP104.loanWk))c104Redraw();return}
  if((x=t.closest('[data-r104s]'))){e.preventDefault();e.stopImmediatePropagation();const s=x.dataset.r104s;R104.sort=R104.sort.k===s?{k:s,d:-R104.sort.d}:{k:s,d:s==='name'?1:-1};
    try{localStorage.setItem('flavius_r104sort',JSON.stringify(R104.sort))}catch(err){}if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
  if(t.closest('.r104keep>summary')){const d=t.closest('.r104keep');R104.keepOpen=!d.open;return}
  if(R104.pop&&!t.closest('.r104pop'))r104Close();
  if(t.closest('.r104pop [data-recall],.r104pop [data-mg]'))setTimeout(r104Close,0)},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&R104.pop){r104Close();e.stopPropagation()}},true);
/* drag a row between the groups */
document.addEventListener('dragstart',e=>{const r=e.target&&e.target.closest&&e.target.closest('[data-r104d]');if(!r)return;R104.drag=r.dataset.r104d;r.classList.add('r104drag');try{e.dataTransfer.setData('text/plain',R104.drag);e.dataTransfer.effectAllowed='move'}catch(err){}});
document.addEventListener('dragend',()=>{R104.drag=null;for(const x of document.querySelectorAll('.r104drag,.r104over'))x.classList.remove('r104drag','r104over')});
document.addEventListener('dragover',e=>{if(!R104.drag)return;const gz=e.target&&e.target.closest&&e.target.closest('.r104g[data-r104g]');if(!gz||gz.dataset.r104g==='L')return;e.preventDefault();for(const x of document.querySelectorAll('.r104g.r104over'))if(x!==gz)x.classList.remove('r104over');gz.classList.add('r104over')});
document.addEventListener('drop',e=>{if(!R104.drag)return;const gz=e.target&&e.target.closest&&e.target.closest('.r104g[data-r104g]');const gid=R104.drag;R104.drag=null;if(!gz||gz.dataset.r104g==='L')return;e.preventDefault();
  const k=gz.dataset.r104g;const g=gById(gid);if(g&&team104(g)!==k)r104Do(gid,k)});

/* ---------- the look ---------- */
if(V104C.on){const st=document.createElement('style');st.id='r104css';st.textContent=`
@media (min-width:981px){.rm100.rm100-roster.r104{grid-template-columns:minmax(360px,1fr) minmax(0,1.05fr)}}
.r104 .rm100list{container:r104l/inline-size}
.r104lhd{gap:8px}.r104oc{color:#ffb0a0;border:1px solid #c0433a;border-radius:8px;padding:0 6px;letter-spacing:.08em}
.r104 .rm100lh.r104h,.r104 .rm100lr.r104r{grid-template-columns:22px 24px minmax(0,1fr) 30px 26px 38px 34px 38px 22px 30px;gap:5px}
.r104 .rm100lh.r104h{height:26px;padding:0 8px}
.r104 .rm100lh.r104h>*{text-align:left;font:inherit;color:inherit;letter-spacing:inherit;text-transform:inherit;background:none;border:0;padding:0;white-space:nowrap;overflow:hidden;min-width:0}
.r104 .rm100lh.r104h>[data-col="ovr"],.r104 .rm100lh.r104h>[data-col="wl"],.r104 .rm100lh.r104h>[data-col="wage"],.r104 .rm100lh.r104h>[data-col="wk"]{text-align:right}
.r104 .rm100lh.r104h>button{cursor:pointer;color:var(--dim)}.r104 .rm100lh.r104h>button:hover,.r104 .rm100lh.r104h>button.on{color:var(--gold2,#f0cf7d)}
.r104g{border-top:1px solid #4a3826;padding-bottom:3px;border-radius:4px;transition:background .12s}
.r104g.r104over{background:#d6ab4c1c;box-shadow:inset 0 0 0 1px #d6ab4c88}
.r104gh{display:flex;align-items:baseline;gap:8px;padding:7px 8px 3px;min-width:0}
.r104gh b{font:400 15px var(--display);letter-spacing:.06em;color:#f0cf7d;white-space:nowrap}
.r104g[data-r104g="B"] .r104gh b{color:#d9c6a2}.r104g[data-r104g="R"] .r104gh b{color:#b39d80}.r104g[data-r104g="L"] .r104gh b{color:#9fb7c9}
.r104gn{font:600 11px var(--mono);color:var(--bone);white-space:nowrap}.r104gh small{color:var(--dim);font-size:11.5px;min-width:0}
.r104e{padding:6px 10px 8px;color:var(--dim);font-size:12px;font-style:italic}
.r104 .rm100lr.r104r{min-height:38px}
.r104r[draggable="true"]{cursor:grab}.r104r.r104drag{opacity:.45}
.r104c{width:22px;height:20px;display:grid;place-items:center;border-radius:4px;font:700 10.5px var(--serif,Georgia),serif;color:#1a1008}
.r104c.s{background:linear-gradient(#f0cf7d,#c99a3a);box-shadow:inset 0 0 0 1px #8a6a2c}.r104c.s.in{box-shadow:inset 0 0 0 1px #8a6a2c,0 0 0 2px #5d9a4c}
.r104n{display:grid;min-width:0;line-height:1.15}.r104n small{color:var(--dim);font-size:11px}.r104w{font-style:normal;color:#ffb0a0;font-size:11px}
.r104t{font:700 11px var(--mono);color:var(--gc,#c9d1dc);text-align:center;border:1px solid color-mix(in srgb,var(--gc,#c9d1dc) 55%,transparent);border-radius:4px;line-height:16px}
.r104wg.oc{color:#ffb0a0}.r104f{display:flex;align-items:center;gap:4px;justify-content:flex-end}
.r104m{width:28px;height:28px;border:1px solid #6b5236;border-radius:6px;background:#2a1f17;color:#f0cf7d;font:700 16px/1 system-ui;cursor:pointer;padding:0}
.r104m:hover,.r104m:focus-visible{border-color:var(--gold);background:#3a2a18}
.r104r.lent .r104m{opacity:.9}
.r104pop{position:fixed;z-index:9000;max-height:min(70vh,520px);overflow:auto;padding:6px;border:1px solid #8a6a3a;border-radius:8px;background:linear-gradient(#2e2216,#1f170f);box-shadow:0 10px 30px #000c;display:flex;flex-direction:column;gap:3px}
.r104mh{display:grid;padding:4px 6px 6px;border-bottom:1px solid #4a3826}.r104mh b{color:#f6dc98}.r104mh small{color:var(--dim);font-size:11.5px}
.r104ms{font:500 10px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:#b39d80;padding:6px 6px 2px}
.r104mi{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;min-height:34px;padding:4px 10px;border:1px solid transparent;border-radius:5px;background:none;color:var(--bone);text-align:left;font:inherit;font-size:13.5px;cursor:pointer}
.r104mi:hover:not([disabled]),.r104mi:focus-visible{background:#3a2a18;border-color:#6b5236}.r104mi.on{color:#f0cf7d;box-shadow:inset 3px 0 0 var(--gold)}.r104mi[disabled]{opacity:.45;cursor:not-allowed}
.r104mi small{color:var(--dim);white-space:nowrap}.r104mi>span{min-width:0}.r104mx{padding:2px 10px 6px;color:var(--dim);font-size:12px}
.r104tc{display:grid;gap:4px;margin-top:7px;padding-top:6px;border-top:1px solid #4a3826}.r104seg{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:3px}
.r104tb{min-width:0;min-height:26px;padding:1px 4px;border:1px solid #6b5236;border-radius:5px;background:#22180e;color:var(--bone);font-size:12px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.r104tb.on{border-color:#f0cf7d;color:#1a1008;background:linear-gradient(#f0cf7d,#c99a3a)}
.r104bo .r104tb{font-size:11.5px;min-height:24px}
.rm100g2.r104one{grid-template-columns:minmax(0,1fr)}
.r104keep{margin-top:8px;border-top:1px dashed #8a6a3a88;padding-top:6px}
.r104keep>summary{cursor:pointer;font:500 10.5px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:#d9c08a;list-style:none;display:flex;align-items:center;gap:6px;min-height:28px}
.r104keep>summary::before{content:"▸";font-size:12px}.r104keep[open]>summary::before{content:"▾"}
.r104keep .rm100keep{background:none;border:0;padding:4px 0 0;box-shadow:none}
.r104ln span:nth-child(2){color:#cfe0f0}
.rm100cnt.r104over .ptbox{color:#ffb0a0;border-color:#c0433a}.rm100cnt .ptbox small{font-size:.55em;opacity:.8}
.r104tt{font:600 10px var(--mono);letter-spacing:.06em;color:#f0cf7d;border:1px solid #8a6a3a;border-radius:6px;padding:0 4px}
.tb104{margin:6px 0 2px;display:grid;gap:4px}.tb104l{display:flex;flex-wrap:wrap;gap:4px 10px}.tb104c{display:inline-flex;gap:5px;align-items:center;font-size:12.5px;min-height:28px;cursor:pointer}
.bo104 .sect{color:#f0cf7d}
@container rm100d (max-width:760px){.r104 .rm100r1>.rm100pers{grid-column:1/-1}}
@container r104l (max-width:470px){
  .r104 .rm100lh.r104h,.r104 .rm100lr.r104r{grid-template-columns:22px 24px minmax(0,1fr) 26px 36px 30px 36px}
  .r104 [data-col="tier"],.r104 [data-col="wage"],.r104 [data-col="wk"],.r104 .r104t,.r104 .r104wg,.r104 .r104wk{display:none}}
@container r104l (max-width:360px){.r104 .rm100lh.r104h,.r104 .rm100lr.r104r{grid-template-columns:20px 22px minmax(0,1fr) 24px 34px 36px}.r104 [data-col="fat"],.r104 .r104f{display:none}}
@media (max-width:600px){.r104m{width:36px;height:36px}.r104mi{min-height:40px}.r104tb{min-height:36px}}
body.calm .r104g{transition:none}
`;document.head.appendChild(st)}

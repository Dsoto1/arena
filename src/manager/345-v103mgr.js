/* =====================================================================
   345-V103MGR · v1.03 MANAGER FIXES + SMALL CHANGES (his v1.02 notes, tools/plans/v103/NOTES.md; kill switch localStorage flavius_v103boff=1; test tv103b)
   =====================================================================
   M1  The Superbus week's review. The finale is played in absolute week 13 (calendar "week 1" of the next season) beside that week's normal card, and
       the review / Acta only looked at the card: the Superbus never appeared, and the old Acta pages printed the raw absolute week ("Week 13").
       specCrown wrapper records w.sb103 {season,wk,champ,champLudus,f,mine…}; an endWeek wrapper copies it into w.review.sb103 (title "Superbus Week in
       review · season N", a result box inside the letter); a composeWeekPaper wrapper makes the Superbus the Acta's lead (and re-stores 342's edition); 17-manager's two raw `P.wk` prints
       use wkOf (small direct edits).
   M2  Superbus Week. The rail's "4" was the bouts-to-fight oval (3 classic bouts + a headline special): the rail says "🏛 Superbus Week" and hides that
       oval while the finale is open, banners say "Superbus Week", no headline special is made on a finale week (any100Make wrapper), and the finale card
       (and the Match Week card on Your ludus) is porphyry + gold with laurels (CSS + two inline laurels; the cup art is 22-trophies' own).
   M3  Rivalry Week is closed: Enter / Withdraw on its bouts, exhibitions, road deals and headline-special picks refuse with the reason (window-capture
       guards + data-dis on the buttons), st95Fill leaves the card alone (it put a starter over a backfilled free agent), accepted invitations never land
       on week 12 (specWeekStart wrapper pushes them a week). Root cause: 17's enter put your man over any non-contract entry of a rivalry bout and
       Withdraw replaced him with a free agent.
   M4  Roster cap `MGR_CAP103` (15 fighters under contract = rosterOf(me); lent-out fighters don't count, borrowed ones do — one constant, v1.04 grows it by
       level): offerVerdict / poachVerdict / court88Sign / borrowFrom / a trade bringing in more than it sends / Vulso's cart refuse with the reason, the
       Offer / Poach / counter-bid / cart buttons are data-dis + a guard before an hour is spent, rival houses are trimmed back to the cap at every week's
       end, a career already over keeps everyone and the desk says "Over the cap: N / 15".
   M5  Lending or borrowing an injured fighter is refused (lendTo / borrowFrom wrappers).
   M6  Armory: the starters' gold border + numeral (332 M21) was added by a mgrHTML wrapper, but selecting a fighter redraws #ar94 by arm94HTML alone — an
       arm94HTML wrapper applies the same tag.
   M7  Trade requests that give nothing. Root cause: a house's "borrow your bench fighter" ask (kind 'loan') was drawn by the trade card, which prints the
       "You get" side from o.give / o.coin — a loan has neither (its fee/weeks live in o.fee/o.weeks): "They want X ⇄ You get [nothing]". offersHTML wrapper
       draws loan asks with "They pay N a week for W weeks"; every offer without a payment (no coin, no fighters left, fee 0, house too poor) is dropped.
   M8  Infirmary list: "Treated ✓" on a row whose fighter had care this week (Medicus, surgeon, Hygeia, bath, Asclepius).
   M9  Header: the Record badge uses the podium format (🥇 🥈 🥉 · bouts, this season, as the League table), the "N fighters" badge is gone.
   N8  Vulso's cart: the Recruiter writes a letter with "Go to the Recruiting board"; the cart bar is no longer printed on Your ludus (it lives on
       the Recruiting board only). REPLACES the old cart bar at the top of every tab.
   N9a My Ludus: Armory and Promote tiles swapped; the council card's faces are bigger and the card is shorter (CSS).
   ===================================================================== */
const V103B={on:(()=>{try{return localStorage.getItem('flavius_v103boff')!=='1'}catch(e){return true}})()};
const MGR_CAP103=15;
const b103Toast=m=>{try{if(typeof mToast==='function')mToast(m)}catch(e){}};

/* ---------------- M1 + M2 · the Superbus ---------------- */
const sb103Is=w=>!!(V103B.on&&w&&!w.tutorial&&w.special&&w.special.D&&w.special.D.finale);
{const base=specCrown;specCrown=function(T){const r=base.apply(this,arguments);try{const w=W_();const D=T&&T.D;if(w&&D&&D.finale&&w.finale){const hh=T.rounds[0][0];const pm=me();
  const ents=hh.ents.map(e=>{const g=specEnt(e);const m=g&&g.contract?mgrById(g.contract.mgr):null;return {n:g?g.name:'?',l:m?m.ludus:'',mine:!!e.mine,gid:g&&g.id||null}});
  w.sb103={season:D.season,wk:w.week,champ:w.finale.champ,champLudus:w.finale.champLudus,f:w.finale.f,turns:w.finale.turns,mineWon:!!w.finale.cupGiven,ents,purse:D.purse,fame:D.fame,ludus:pm?pm.ludus:''}}}catch(e){console.error(e)}return r}}
{const base=endWeek;endWeek=async function(){let sb=null;try{const w=W_();if(V103B.on&&w&&!w.tutorial&&w.sb103&&w.sb103.wk===w.week)sb=w.sb103}catch(e){}
  const r=await base.apply(this,arguments);
  try{const w=W_();if(r&&w&&!w.tutorial){if(sb&&w.review&&w.review.wk===sb.wk){w.review.sb103=sb;w.review.season=sb.season}
    if(V103B.on)cap103Trim(w)}}catch(e){console.error(e)}return r}}
/* the Acta's lead on that week. 342 keeps ak102HouseLead inside an if-block (a global wrapper cannot reach it), so the edition is re-trimmed here, after 342 stored it */
function sbLead103(world,S){const g=world.glads.find(x=>x.name===S.champ);const mine=S.ents.filter(e=>e.mine);
  const house=mine.length?(S.mineWon?_T`The cup comes home: ${esc(S.champ)} won it for ${esc(S.ludus)}.`:_T`${esc(mine[0].n)} carried the colours of ${esc(S.ludus)} and fell short of the crown.`):_T`${esc(S.ludus)} had no fighter on the sand.`;
  return {kind:'super',house:S.mineWon?1:0,gid:g?g.id:null,gids:g?[g.id]:[],h:_T`${String(S.champ).toUpperCase()} WINS THE FLAVIUS SUPERBUS`,kicker:_T('The Flavius Superbus · Roma'),
    deck:_T`${esc(S.champ)}${S.champLudus?_T` of ${esc(S.champLudus)}`:''} takes the crown with ${cfAmt87(S.f)}.`,
    body:_T`Before a roaring Roma, the four finalists took the sand: ${S.ents.map(e=>`<b>${esc(e.n)}</b>`).join(', ')}. <b>${esc(S.champ)}</b>${S.champLudus?_T` of ${esc(S.champLudus)}`:''} was the last standing${S.turns?_T` after ${S.turns} turns`:''}. ${house}`,
    facts:[[_T('Crown'),esc(S.champ)],[_T('Crowd Favor'),String(S.f||0)],[_T('Turns'),String(S.turns||0)]]}}
{const base=composeWeekPaper;composeWeekPaper=function(world,night){const P=base.apply(this,arguments);try{const S=V103B.on&&world&&world.sb103;
  if(S&&P&&typeof P==='object'&&P.wk===S.wk&&S.champ&&P.lead&&P.lead.kind!=='super'){const HL=sbLead103(world,S);
    (P.also=P.also||[]).unshift({h:P.lead.h,body:String(P.lead.body||'').replace(/<[^>]*>/g,'').split('. ').slice(0,2).join('. ')+'.',gids:P.lead.gids||[]});P.also=P.also.slice(0,2);
    P.lead=Object.assign({},P.lead,HL);P.sb103=S;
    if(typeof ak102Trim==='function'&&typeof ak102Store==='function'&&P.k102){const rec=ak102Trim(P);P._k102=rec.key;ak102Store(world,rec)}}}catch(e){console.error(e)}return P}}
/* no headline special on top of the finale */
{const base=any100Make;any100Make=function(w){try{if(V103B.on&&w&&(w.finaleDue||(w.special&&w.special.D&&w.special.D.finale)))return}catch(e){}return base.apply(this,arguments)}}
const lau103=flip=>`<svg class="lau" viewBox="0 0 48 48" aria-hidden="true"${flip?' style="transform:scaleX(-1)"':''}><path d="M30 44C14 40 6 26 8 8" fill="none" stroke="#d6ab4c" stroke-width="1.6"/>${Array.from({length:7},(_,i)=>{const a=(1.0+i*.17),x=29-Math.sin(a)*21+i*.4,y=43-i*5.4;return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7.5" ry="3.2" transform="rotate(${(-62-i*9)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#f0cf7d" stroke="#8a6a2c" stroke-width=".5"/>`}).join('')}</svg>`;

/* ---------------- M3 · Rivalry Week is closed ---------------- */
const riv103=w=>!!(V103B.on&&w&&!w.tutorial&&w.night&&w.night.rivalry&&!w.night.bye);
const rivWhy103=()=>_T('⚔ Rivalry Week: the card is the rivalry pairings — nobody can be added, swapped or withdrawn, and no other event can be entered this week.');
const RIV103_SEL='[data-mg="enter"],[data-mg="withdraw"],[data-mg="exsim"],[data-mg="exlive"],[data-mg="exfight"],[data-mg="traveldeal"],[data-any100^="pick"],[data-any100^="drop"],[data-any100^="sel"],[data-any100^="pt"],[data-any100="ok"]';
window.addEventListener('click',e=>{try{const b=e.target&&e.target.closest&&e.target.closest(RIV103_SEL);if(!b)return;const w=W_();if(!riv103(w))return;
  e.preventDefault();e.stopImmediatePropagation();b103Toast(rivWhy103())}catch(err){}},true);
{const base=exhibSetup;exhibSetup=function(){try{if(riv103(W_())){b103Toast(rivWhy103());return null}}catch(e){}return base.apply(this,arguments)}}
{const base=travelClick;travelClick=function(act){try{if(act==='traveldeal'&&riv103(W_())){b103Toast(rivWhy103());return false}}catch(e){}return base.apply(this,arguments)}}
{const base=st95Fill;st95Fill=function(w){try{if(riv103(w||W_()))return 0}catch(e){}return base.apply(this,arguments)}}
/* an invitation never lands on the Rivalry Week (and none on week 12 survives a push-back) */
{const base=specWeekStart;specWeekStart=function(world){try{if(V103B.on&&world&&world.invites)for(const iv of world.invites)if((iv.status==='open'||iv.status==='accepted')&&iv.wk!=null&&typeof RIVAL_WK!=='undefined'&&wkOf(iv.wk)===RIVAL_WK)iv.wk++}catch(e){console.error(e)}return base.apply(this,arguments)}}

/* ---------------- M4 · the roster cap ---------------- */
const cap103N=()=>{try{return rosterOf(me()).length}catch(e){return 0}};
function cap103Why(){try{const w=W_();if(!V103B.on||!w||w.tutorial||w.dead)return '';const n=cap103N();if(n<MGR_CAP103)return '';
  return n>MGR_CAP103?_T`Over the cap: ${n} / ${MGR_CAP103} fighters under contract. Release, lend or trade some before you sign anyone.`:_T`Your ludus is full: ${n} of ${MGR_CAP103} fighters under contract. Release, lend or trade one first.`}catch(e){return ''}}
{const base=offerVerdict;offerVerdict=function(){const why=cap103Why();if(why)return {ok:false,why,cap103:1};return base.apply(this,arguments)}}
{const base=poachVerdict;poachVerdict=function(){const why=cap103Why();if(why)return {ok:false,why,cap103:1};return base.apply(this,arguments)}}
if(typeof court88Sign==='function'){const base=court88Sign;court88Sign=function(){const why=cap103Why();if(why){b103Toast('⛔ '+why);return false}return base.apply(this,arguments)}}
{const base=borrowFrom;borrowFrom=function(g,m){try{const why=cap103Why();if(why){b103Toast('⛔ '+why);return false}
  if(V103B.on&&g&&g.inj){b103Toast(_T`🤝 ${esc(g.name)} is hurt — an injured fighter cannot be borrowed.`);return false}}catch(e){}return base.apply(this,arguments)}}
{const base=lendTo;lendTo=function(g){try{if(V103B.on&&g&&g.inj){b103Toast(_T`🤝 ${esc(g.name)} is hurt — an injured fighter cannot be lent out.`);return false}}catch(e){}return base.apply(this,arguments)}}
{const base=offerAccept;offerAccept=function(o){try{if(V103B.on&&o&&o.kind==='swap'){const net=(o.give||[]).length-1;const n=cap103N();if(net>0&&n+net>MGR_CAP103){OFFER_FAIL95=_T`Over the cap: that trade brings ${net+1} fighters for one and your ludus holds ${n} / ${MGR_CAP103}.`;return false}}}catch(e){}return base.apply(this,arguments)}}
const CAP103_SEL='[data-mg="offer"],[data-mg="poach"],[data-m48="cartbuy"],[data-rb88^="match"],[data-rb88^="want"]';
window.addEventListener('click',e=>{try{const b=e.target&&e.target.closest&&e.target.closest(CAP103_SEL);if(!b)return;const why=cap103Why();if(!why)return;
  e.preventDefault();e.stopImmediatePropagation();b103Toast('⛔ '+why)}catch(err){}},true);
/* the recruit card is also swapped on its own when a step is chosen (145), without a whole mgrHTML: mark its buttons here too */
{const base=detailHTML;detailHTML=function(){let h=base.apply(this,arguments);try{const why=cap103Why();if(why&&typeof h==='string'&&/data-(mg="(offer|poach)"|m48="cartbuy")/.test(h)){const t=document.createElement('template');t.innerHTML=h;
  for(const b of t.content.querySelectorAll('[data-mg="offer"],[data-mg="poach"],[data-m48="cartbuy"]')){b.classList.add('off');b.setAttribute('aria-disabled','true');b.dataset.dis=why}h=t.innerHTML}}catch(e){console.error(e)}return h}}
/* rival houses obey it: at every week's end the weakest surplus fighter walks */
function cap103Trim(w){for(const m of w.mgrs||[]){if(m.isPlayer||m.dead||m.sica)continue;let ros=rosterOf(m);
  while(ros.length>MGR_CAP103){const out=ros.filter(g=>!g.loanFrom&&!g.sotonium).sort((a,b)=>effOvr(a)-effOvr(b))[0];if(!out)break;out.contract=null;try{ghist(out,_T`released by ${esc(m.ludus)} — the house was over its roster cap`)}catch(e){}ros=rosterOf(m)}}}
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_();const n=cap103N();if(V103B.on&&w&&!w.tutorial&&n>MGR_CAP103)
  I.push({done:false,ic:'👥',req99:true,txt:_T`<b>Over the cap: ${n} / ${MGR_CAP103}</b> fighters under contract — nobody new can sign until you release, lend or trade some.`,btn:`<button class="btn tksm" type="button" data-mg="tab" data-id="roster">${_T`Open the Roster`}</button>`})}catch(e){console.error(e)}return I}}
try{DK99_TIER['👥']=2}catch(e){}

/* ---------------- M7 · trade requests always give something ---------------- */
function off103Ok(o){if(!o)return false;if(o.kind==='coin'){const m=mgrById(o.mid);return (o.coin|0)>0&&!!m&&m.coin>=o.coin}
  if(o.kind==='swap')return (o.give||[]).map(gById).filter(Boolean).length>0;
  if(o.kind==='loan')return (o.fee|0)>0&&(o.weeks|0)>0;return true}
function loanReq103(o){const w=W_();const m=mgrById(o.mid),g=gById(o.gid);if(!m||!g||!g.contract)return '';
  return `<div class="card2 offerbox"><div class="sect" style="margin-top:0">${_T`📨 A loan request from ${typeof flagChip==='function'?flagChip(m,18):''} ${esc(m.ludus)}`} <span class="rc-sub">${_T`answer by week ${wkOf(o.until)}`}</span></div>
    <div class="offrow"><div class="offside"><span class="rc-sub">${_T`They want to borrow`}</span>${gArt(g,'sm')}<b>${esc(g.name)}</b><span class="rc-sub">${_T`rated ${effOvr(g)} · ${g.contract.wage}/wk`}</span></div><span class="offarrow">⇄</span>
    <div class="offside"><span class="rc-sub">${_T`They pay`}</span><span class="offcoin">${coinAmt87(o.fee)} ${_T`a week`}</span><span class="rc-sub">${_T`for ${o.weeks} weeks, then he comes home`}</span></div></div>
    <div class="acts"><button class="btn primary tksm" type="button" data-m47="offyes" data-id="${o.id}">${_T`✔ Accept`}</button><button class="btn tksm" type="button" data-m47="offno" data-id="${o.id}">${_T`✖ Decline`}</button></div></div>`}
{const base=offersHTML;offersHTML=function(){const w=W_();if(!V103B.on||!w)return base.apply(this,arguments);
  try{w.offers=(w.offers||[]).filter(off103Ok)}catch(e){}
  const all=w.offers||[];const loans=all.filter(o=>o.kind==='loan'&&o.until>=w.week);let std='';
  w.offers=all.filter(o=>o.kind!=='loan');try{std=base.apply(this,arguments)}finally{const kept=all.filter(o=>o.kind==='loan'&&gById(o.gid)&&gById(o.gid).alive&&gById(o.gid).contract);w.offers=(w.offers||[]).concat(kept)}
  return std+loans.map(loanReq103).join('')}}
{const base=offersWeek;offersWeek=function(w,pm){const r=base.apply(this,arguments);try{if(V103B.on&&w&&w.offers)w.offers=w.offers.filter(off103Ok)}catch(e){}return r}}

/* ---------------- N8 · Vulso's cart = a letter from the Recruiter ---------------- */
{const base=emptyBarracksWeek;emptyBarracksWeek=function(w,pm){const r=base.apply(this,arguments);try{if(V103B.on&&w&&w.cart&&w.cart.wk===w.week&&!w.cart.l103&&typeof sendLetter==='function'){w.cart.l103=1;
  sendLetter(w,{key:'cart-'+w.season+'-'+w.week,kind:'letter',from:_T('your recruiter'),adv:'recruiter',seal:'🛒',title:_T("The Recruiter: Vulso's cart is at the gate"),until:w.week+1,
    body:`<p>${_T`Vulso's cart has rattled up to your gate with three lots off the auction block: cheap, rough, and no road to pay. You may take two of them, this week or next.`}</p><div class="acts"><button class="btn primary tksm" type="button" data-mg="tab" data-id="recruit">${_T`Go to the Recruiting board`}</button></div>`})}}catch(e){console.error(e)}return r}}
{const base=buyOfferHTML;buyOfferHTML=function(){const h=base.apply(this,arguments);try{if(V103B.on&&typeof h==='string'&&MGR.tab!=='recruit'&&h.indexOf('cartbox')>=0){const t=document.createElement('template');t.innerHTML=h;for(const x of t.content.querySelectorAll('.cartbox'))x.remove();return t.innerHTML}}catch(e){console.error(e)}return h}}

/* ---------------- M6 · Armory: the starters keep their gold ---------------- */
function arm103Gold(h){return h.replace(/class="ar94g ?(on)?" data-ar94g="([^"]+)"/g,(m,on,id)=>{const g=typeof gById==='function'?gById(id):null;const sl=g&&g.slot95;
  return sl>=1&&sl<=3?_T`class="ar94g${on?' on':''} st102" data-ar94g="${id}" data-st102="${['I','II','III'][sl-1]}"`:m})}
if(typeof arm94HTML==='function'){const base=arm94HTML;arm94HTML=function(){let h=base.apply(this,arguments);try{if(V103B.on&&typeof h==='string')h=arm103Gold(h)}catch(e){console.error(e)}return h}}

/* ---------------- M8 · Infirmary: who had care this week ---------------- */
const trt103=(g,w)=>!!(g&&w&&(g.medWk===w.week||g.bathWk===w.week||(g.inj&&g.inj.bk102&&g.inj.bk102.wk===w.week)||(g.rg102&&g.rg102.wk===w.week)));

/* ---------------- the page: one final mgrHTML pass ---------------- */
function a103Post(h){const w=W_();const pm=me();if(!w||!pm||w.dead||MGR.view||typeof h!=='string')return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;const Q=s=>R.querySelector(s),QA=s=>[...R.querySelectorAll(s)];let any=false;
  /* M9 the header */
  {const ros=rosterOf(pm);const rec=`${pm.wins}-${Math.max(0,pm.bouts-pm.wins)}`;const recT=_T`Record ${rec}`,fT=_T`${ros.length} fighter${ros.length===1?'':'s'}`;
    for(const b of QA('.badges.mhead .badge')){const x=b.textContent.trim();
      if(x===recT.trim()){try{b.innerHTML=lp102Rec(msp(pm))}catch(e){}any=true}else if(x===fT.trim()){b.remove();any=true}}}
  /* M2 Superbus Week */
  if(sb103Is(w)){const D=w.special.D;any=true;
    const nb=Q('.mtabs [data-mg="tab"][data-id="night"]');if(nb){nb.classList.add('sb103');nb.setAttribute('title',_T('The Flavius Superbus is on this week'));
      for(const n of [...nb.childNodes])if(n.nodeType===3)n.remove();nb.insertBefore(document.createTextNode(_T('🏛 Superbus Week')),nb.firstChild)}
    const rb=Q('.roomhd.b73-night .roomttl span');if(rb)rb.textContent=_T`🏛 Superbus Week · the finale of season ${D.season}, by invitation`;
    const lb=Q('.lu100tt>b');if(lb)lb.textContent=_T('🏛 Superbus Week');
    const mw=Q('.lu100mw[data-id="night"]');if(mw){mw.classList.add('sb103m');const mb=mw.querySelector('.tx>b');if(mb)mb.textContent=_T('Superbus Week');const sw=mw.querySelector('.sw');if(sw)sw.textContent='🏛'}
    const sp=Q('.card2.specbox');if(sp&&!sp.querySelector('.sb103ban')){sp.classList.add('sb103c');const ban=document.createElement('div');ban.className='sb103ban';
      ban.innerHTML=`${lau103(false)}<div><b>${_T`SUPERBUS WEEK`}</b><small>${_T`The Flavius Superbus · Roma · the crown of season ${D.season}`}</small></div>${lau103(true)}`;sp.prepend(ban)}}
  /* M3 / M4 the buttons say why */
  if(riv103(w)){const why=rivWhy103();for(const b of QA(RIV103_SEL)){b.classList.add('off');b.setAttribute('aria-disabled','true');b.dataset.dis=why;any=true}}
  {const why=cap103Why();if(why)for(const b of QA('[data-mg="offer"],[data-mg="poach"],[data-m48="cartbuy"]')){b.classList.add('off');b.setAttribute('aria-disabled','true');b.dataset.dis=why;any=true}}
  /* M8 */
  for(const r of QA('.iv90row[data-inf90]')){const g=gById(r.dataset.inf90);if(trt103(g,w)&&!r.querySelector('.trt103')){r.classList.add('t103');const s=document.createElement('span');s.className='trt103';s.title=_T('Had care this week');s.textContent=_T('Treated ✓');r.appendChild(s);any=true}}
  /* N9a swap Armory / Promote */
  {const tl=Q('.lu100tiles');if(tl){const a=tl.querySelector('.lu100t.k-armory'),p=tl.querySelector('.lu100t.k-promote');if(a&&p){const ph=document.createComment('');p.before(ph);a.before(p);ph.replaceWith(a);any=true}}}
  /* M1 the review of the Superbus week */
  if(w.review&&w.review.sb103){const S=w.review.sb103;const d=Q('details.rev91');if(d){const tb=d.querySelector('summary b');if(tb)tb.textContent=_T`Superbus Week in review · season ${RN(S.season)}`;
      const body=d.querySelector('.mbody');if(body&&!body.querySelector('.sb103rev')){const mine=S.ents.filter(e=>e.mine);
        const line=mine.length?(S.mineWon?_T`Your <b>${esc(mine[0].n)}</b> won it: ${coinAmt87('+'+S.purse)}, +${S.fame} fame and the Superbus Cup.`:_T`Your <b>${esc(mine[0].n)}</b> fought for the house and fell short of the crown.`):_T`Your house had no fighter on the sand.`;
        const box=document.createElement('div');box.className='sb103rev';
        box.innerHTML=`<b>🏛 ${_T`The Flavius Superbus`}</b> — ${_T`<b>${esc(S.champ||'?')}</b>${S.champLudus?_T` of ${esc(S.champLudus)}`:''} takes the crown (${cfAmt87(S.f||0)}).`} ${line}<span class="rc-sub">${_T`Entrants`}: ${S.ents.map(e=>esc(e.n)).join(' · ')}</span>`;body.prepend(box);any=true}}}
  if(!any)return h;return t.innerHTML}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);if(!V103B.on)return h;try{return a103Post(h)}catch(e){console.error(e)}return h}}

/* ---------------- styles ---------------- */
{const st=document.createElement('style');st.textContent=`
.mtabs [data-id="night"].sb103{background:linear-gradient(180deg,#5b1b47,#3b1030);color:#f0cf7d;border-color:#d6ab4c}
.mtabs [data-id="night"].sb103 .mcount.c85n{display:none!important}
.card2.specbox.sb103c{position:relative;border:2px solid #d6ab4c;background:linear-gradient(160deg,#3b1030 0%,#5b1b47 48%,#2a0c22 100%);box-shadow:0 0 0 3px #1a0a15,0 0 0 4px #8a6a2c,0 8px 26px rgba(0,0,0,.5);color:#f3e3b8}
.sb103c .rc-sub{color:#e4cfa0}.sb103c b{color:#f6dc98}
.sb103ban{display:flex;align-items:center;justify-content:center;gap:16px;margin:-4px -4px 12px;padding:10px 12px;background:linear-gradient(90deg,transparent,rgba(214,171,76,.24),transparent);border-bottom:1px solid #8a6a2c;text-align:center}
.sb103ban b{display:block;font:400 28px/1.1 var(--display);letter-spacing:.16em;color:#f0cf7d;text-shadow:0 2px 0 #1a0a15}
.sb103ban small{display:block;font-size:12.5px;color:#e4cfa0;letter-spacing:.04em}
.sb103ban .lau{width:56px;height:56px;flex:none}
.lu100mw.sb103m{background:linear-gradient(160deg,#3b1030,#5b1b47 55%,#2a0c22);border-color:#d6ab4c;box-shadow:inset 0 0 0 1px #8a6a2c}
.lu100mw.sb103m .tx>b{color:#f0cf7d;letter-spacing:.14em}.lu100mw.sb103m .sw{background:radial-gradient(#6a2a55,#2a0c22);border-color:#d6ab4c}
.sb103rev{margin:0 0 8px;padding:8px 10px;border:1px solid #8a6a2c;border-radius:8px;background:linear-gradient(160deg,#4a1639,#2a0c22);display:block;color:#f3e3b8;line-height:1.35}
.sb103rev b{display:inline!important;color:#f6dc98}.sb103rev .rc-sub{display:block;color:#e4cfa0;margin-top:3px}
.iv90row.t103{grid-template-columns:26px minmax(0,1fr) 64px auto auto auto}
.iv90row .trt103{font:600 11px var(--sans,system-ui);color:#bfe3a6;background:rgba(63,110,52,.35);border:1px solid #5d9a4c;border-radius:9px;padding:0 7px;white-space:nowrap}
@media (max-width:760px){.iv90row.t103{grid-template-columns:26px minmax(0,1fr) 54px auto auto}}
/* N9a: the council — bigger faces, a shorter card */
.lu100tiles{grid-auto-rows:minmax(176px,auto)}
.lu100t.k-adv .art.frieze{min-height:196px}
#council83.lu100fz.c101 .c83f{width:84px;height:84px}
#council83.lu100fz.c101 .c101cons .c83f{width:104px;height:104px}
#council83.lu100fz.c101 .c83f svg{width:100%!important;height:100%!important}
#council83.lu100fz.c101 .c83p{max-width:19%}
@media (max-width:600px){.lu100t.k-adv .art.frieze{min-height:176px}#council83.lu100fz.c101 .c101cons .c83f{width:62px;height:62px}#council83.lu100fz.c101 .c83f{width:48px;height:48px}}
`;document.head.appendChild(st)}

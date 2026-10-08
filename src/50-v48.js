/* =====================================================================
   50-V48 · MANAGER MODE, v0.48 — DEPTH CHART, LOANS, EMPTY BARRACKS, PRACTICE, HYGEIA, THE LEDGER'S TIMING
   =====================================================================
   • Depth chart: you choose your starters — only starters can be entered on Match Week. The injured sit
     out until healed. Loans get their own section: who is out, who is in, from whom, on what terms.
   • Empty barracks: a cordial house offers a loan (you accept or not), and Vulso's cart calls at your gate
     with a few cheap lots — no road to pay. A loaned-in fighter goes home the moment you sign your own; if
     one dies under your colours you owe their house a fee.
   • Practice: the watching fighters pay a coin each from their own purses; the fighter who sparred takes
     a Match Week edge (+1 AP, +2 CF) into this week's card.
   • Hygeia's Blessing: once a season every house may heal its whole roster for free.
   • The Quaestor's Ledger is paid once the Superbus, the awards and the recap are over; a new career's
     starting funds arrive as its founding ledger.
   • The empire's regulars: the Spectator roster lists the people of the empire, not only those who have
     already bought a ticket; every regular keeps a purse.
   ===================================================================== */
const ownRoster=m=>rosterOf(m).filter(g=>!g.loanFrom||g.loanFrom.mid===m.id);
const loanedIn=m=>rosterOf(m).filter(g=>g.loanFrom&&g.loanFrom.mid!==m.id);

/* ---------------- Match Week glows, steadily ---------------- */
{const _mh=mgrHTML;mgrHTML=function(){const w=typeof W_==='function'?W_():null;const pm=w&&!w.dead?me():null;
  if(w&&pm){try{qsMaybePay(w,pm);loanReturnCheck(w,pm)}catch(e){console.error(e)}}
  let h=_mh();try{const pend=!!(w&&w.night&&w.night.bouts&&w.night.bouts.some(x=>!x.done));if(pend)h=h.replace(/(<button[^>]*data-mg="tab" data-id="night"[^>]*class=")/,'$1nightpend ')}catch(e){}return h}}

/* ---------------- the depth chart and the loans ---------------- */
function loanTerms(g){const L=g.loanFrom;if(!L)return '';return _T`${coinAmt87(L.fee)}/wk · ${L.weeks} wk left${g.contract?_T` · contract ${Math.max(0,g.contract.weeks)} wk`:''}`}
function depthChartHTML(){const pm=me(),w=W_();const own=ownRoster(pm).concat(loanedIn(pm)).sort((a,b)=>effOvr(b)-effOvr(a));
  const hurt=own.filter(g=>g.inj),fit=own.filter(g=>!g.inj);const st=fit.filter(g=>!g.bench),bn=fit.filter(g=>g.bench);
  const lenders=w.mgrs.filter(m=>!m.isPlayer&&!isRival(m)&&opinionOf(m).v>=30&&rosterOf(m).length<9);
  const card=g=>`<div class="dcard ${g.bench?'bench':''} ${g.loanFrom?'loan':''}">${gArt(g,'xs')}<div><b>${esc(g.name)}</b><span class="rc-sub">${effOvr(g)} · ${CLASSES[g.cls]?CLASSES[g.cls].name:''}${g.inj?` · ⚕ ${esc(g.inj.label)}`:''}${g.sparWk===w.week?_T` · 🏋 sparred (+1 AP ${cfAmt87('+2')} tonight)`:''}</span>${g.loanFrom&&g.loanFrom.mid!==pm.id?`<span class="badge gold">${_T`on loan from ${esc((mgrById(g.loanFrom.mid)||{}).ludus||'')}`}</span>`:''}</div>
    ${g.inj?'':`<button type="button" class="btn tksm dctog" data-m48="bench" data-id="${g.id}">${g.bench?_T('⭐ Make starter'):_T('🪑 Bench')}</button>`}
    ${g.bench&&!g.inj&&!g.loanFrom&&lenders.length?`<select class="tin dclend" data-m47lend="${g.id}"><option value="">${_T`Lend out…`}</option>${lenders.map(m=>`<option value="${m.id}">${esc(m.ludus)} · ${loanFee(g)}/wk · 3 wk</option>`).join('')}</select>`:''}</div>`;
  return `<div class="card2 depth"><div class="sect" style="margin-top:0">${_T`📋 Depth chart`} <span class="rc-sub">${_T`starters can be entered on Match Week`}</span></div>
   <div class="dgrid"><div><div class="dhd">${_T`⭐ Starters · ${st.length}`}</div>${st.map(card).join('')||`<p class="rc-sub">${_T`None — make someone a starter.`}</p>`}</div><div><div class="dhd">${_T`🪑 Bench · ${bn.length}`}</div>${bn.map(card).join('')||`<p class="rc-sub">${_T`Nobody.`}</p>`}</div><div><div class="dhd">${_T`⚕ Hurt · ${hurt.length}`}</div>${hurt.map(card).join('')||`<p class="rc-sub">${_T`Nobody.`}</p>`}</div></div></div>${loansCardHTML()}`}
function loansCardHTML(){const pm=me(),w=W_();const out=w.glads.filter(g=>g.alive&&g.loanFrom&&g.loanFrom.mid===pm.id&&g.contract&&g.contract.mgr!==pm.id);const inn=loanedIn(pm);if(!out.length&&!inn.length)return '';
  const row=(g,dir)=>{const other=mgrById(dir==='out'?g.contract.mgr:g.loanFrom.mid)||{};return `<tr><td>${gArt(g,'xs')}</td><td><b>${esc(g.name)}</b> <span class="rc-sub">${effOvr(g)}</span></td><td>${dir==='out'?'→':'←'} ${typeof flagChip==='function'?flagChip(other,14):''} ${esc(other.ludus||'')}</td><td class="rc-sub">${loanTerms(g)}${g.loanFrom.dire?_T(' · goes home when you sign your own fighter'):''}</td></tr>`};
  return `<div class="card2 loans"><div class="sect" style="margin-top:0">${_T`🤝 Loans`}</div><table class="tally compact">${out.map(g=>row(g,'out')).join('')}${inn.map(g=>row(g,'in')).join('')}</table></div>`}
{const _rb=rosterBlockHTML;rosterBlockHTML=function(){return depthChartHTML()+_rb()}}
/* a lent fighter can no longer be "borrowed" from the roster screen; borrowing comes as a letter when you need it */

/* ---------------- empty barracks ---------------- */
function emptyBarracksWeek(w,pm){if(ownRoster(pm).length){w.cartSpell=0;return}
  if(!loanedIn(pm).length&&!(w.offers||[]).some(o=>o.kind==='loanin')){const houses=w.mgrs.filter(m=>!m.isPlayer&&!isRival(m)&&opinionOf(m).v>=25&&rosterOf(m).filter(g=>!g.inj&&!g.loanFrom).length>=3);
    if(houses.length){const m=houses.sort((a,b)=>opinionOf(b).v-opinionOf(a).v)[0];const g=depthOf(m).bench.filter(x=>!x.inj&&!x.loanFrom)[0]||rosterOf(m).filter(x=>!x.inj&&!x.loanFrom).sort((a,b)=>effOvr(a)-effOvr(b))[0];
      if(g){(w.offers=w.offers||[]).push({id:'o'+Date.now().toString(36),kind:'loanin',mid:m.id,gid:g.id,fee:Math.max(2,Math.round(loanFee(g)*0.5)),weeks:4,until:w.week+2});tnews(_T`🤝 <b>${esc(m.ludus)}</b> has heard your barracks are empty and offers you <b>${esc(g.name)}</b> on loan. Answer it at the top of any tab.`,'big')}}}
  if(!w.cartSpell){w.cartSpell=1;const lot=[];for(let i=0;i<3;i++){const g=genGlad({ovr:37+rnd(11)});const [woe,fx]=pickOne(AUCTION_WOES);fx(g);g.woe=woe;g.auction=1;g.gemHid=Math.random()<.18?6+rnd(8):0;g.price=4+rnd(7);w.glads.push(g);lot.push(g.id)}
    w.cart={wk:w.week,ids:lot};tnews(_T`🛒 <b>Vulso's cart</b> rattles up to your gate: three lots off the auction block, no road to pay. See the top of any tab.`,'big')}}
function cartHTML(){const w=W_(),pm=me();const C=w.cart;if(!C)return '';const lot=C.ids.map(gById).filter(g=>g&&g.alive&&!g.contract);if(!lot.length||C.wk<w.week-1){if(C.wk<w.week-1)w.cart=null;return ''}
  return `<div class="card2 offerbox cartbox"><div class="sect" style="margin-top:0">${_T`🛒 Vulso's cart at your gate`} <span class="rc-sub">${_T`this week only · no road to pay`}</span></div><div class="cartlots">${lot.map(g=>`<div class="cartlot">${gArt(g,'sm')}<div><b>${esc(g.name)}</b><span class="rc-sub">${CLASSES[g.cls]?CLASSES[g.cls].name:''} · ${gAge(g)} · rated ~${typeof rec98PubG==='function'?rec98PubG(g):pubOvr(g)} · <i>${esc(g.woe)}</i></span>
    <button class="btn primary tksm" type="button" data-m48="cartbuy" data-id="${g.id}" ${pm.coin>=g.price?'':_T('disabled title="Not enough coin"')}>${_T`Buy · ${coinAmt87(g.price)}<small>6 weeks at 2/wk</small>`}</button></div></div>`).join('')}</div></div>`}
function loanReturnCheck(w,pm){if(!ownRoster(pm).length)return;for(const g of loanedIn(pm))if(g.loanFrom.dire){const owner=mgrById(g.loanFrom.mid);if(!owner)continue;g.contract.mgr=owner.id;delete g.loanFrom;g.bench=false;if(g.direWage!=null){g.contract.wage=g.direWage;delete g.direWage}ghist(g,_T`back home to ${owner.ludus}: the borrowing house signed its own fighter`);
  tnews(_T`🤝 <b>${esc(g.name)}</b> goes home to ${esc(owner.ludus)} — you have a fighter of your own now. ${esc(owner.name)} sends their regards.`,'big')}}
/* every loan remembers who borrowed — a death clears the contract */
{const _bf=borrowFrom;borrowFrom=function(g,m,fee,weeks){const ok=_bf(g,m,fee,weeks);if(ok)g.loanFrom.to=me().id;return ok}}
{const _lt=lendTo;lendTo=function(g,m,fee,weeks){const ok=_lt(g,m,fee,weeks);if(ok)g.loanFrom.to=m.id;return ok}}
/* a loaned fighter who dies under your colours: their house is owed */
{const _lw=loansWeek;loansWeek=function(w,pm){for(const g of w.glads){const L=g.loanFrom;if(!L||g.alive||L.settled)continue;L.settled=1;const owner=mgrById(L.mid);const borrower=mgrById((g.contract&&g.contract.mgr)||L.to);
    const fee=L.dire?10:Math.round(20+(g.ovr||50)*0.4); /* v0.49: a loan made out of charity asks only a token for the dead */if(owner&&borrower&&borrower!==owner){borrower.coin-=fee;owner.coin+=fee;if(borrower.isPlayer)tnews(_T`⚱ <b>${esc(g.name)}</b> died on loan under your colours. ${esc(owner.ludus)} is owed ${coinAmt87(fee)} — taken from your treasury${borrower.coin<0?_T(' (you now owe it)'):''}.`,'bad');else mlog(borrower,_T`paid ${owner.ludus} ${fee} coin for ${g.name}, who died on loan`);if(owner.isPlayer)tnews(_T`⚱ ${esc(g.name)} died on loan at ${esc(borrower.ludus)} — they pay you ${coinAmt87(fee)}.`,'bad')}}
  return _lw(w,pm)}}
/* your depth chart is yours: starters are the fighters you have not benched */
{const _do=depthOf;depthOf=function(m){if(!m||!m.isPlayer)return _do(m);const ros=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));return {starters:ros.filter(g=>!g.bench&&!g.inj),bench:ros.filter(g=>g.bench||g.inj)}}}

/* ---------------- offers: the loan-in letter ---------------- */
{const _oh=offersHTML;offersHTML=function(){const w=W_();const all=w.offers||[];w.offers=all.filter(o=>o.kind!=='loanin');let std='';try{std=_oh()}finally{w.offers=all}const L=(w.offers||[]).filter(o=>o.kind==='loanin'&&o.until>=w.week);
  return L.map(o=>{const m=mgrById(o.mid),g=gById(o.gid);if(!m||!g)return '';return `<div class="card2 offerbox"><div class="sect" style="margin-top:0">${_T`📨 A letter from ${typeof flagChip==='function'?flagChip(m,18):''} ${esc(m.ludus)}`}</div>
    <p style="margin:0 0 6px">${_T`"Word is your barracks stand empty. Take <b>${esc(g.name)}</b> for a while — ${o.weeks} weeks, ${coinAmt87(o.fee)} a week. Send them home when you have a fighter of your own."`}</p>
    <div class="offrow"><div class="offside">${gArt(g,'sm')}<b>${esc(g.name)}</b><span class="rc-sub">${_T`rated ${effOvr(g)} · ${CLASSES[g.cls]?CLASSES[g.cls].name:''}`}</span></div><span class="offarrow">→</span><div class="offside"><span class="offcoin">${o.fee}/wk</span><span class="rc-sub">${_T`${o.weeks} weeks · they keep paying the wage`}</span></div></div>
    <div class="acts"><button class="btn primary tksm" type="button" data-m48="loaninyes" data-id="${o.id}">${_T`✔ Accept the loan`}</button><button class="btn tksm" type="button" data-m48="loaninno" data-id="${o.id}">${_T`✖ Decline`}</button></div></div>`}).join('')+std}}
{const _bo=buyOfferHTML;buyOfferHTML=function(){const w=W_();return (w&&(MGR.tab==='ludus'||MGR.tab==='recruit')?cartHTML():'')+_bo()}}

/* ---------------- practice pays, and sharpens ---------------- */
{const _ea=exhibApply;exhibApply=function(res,ctx){const txt=_ea(res,ctx);try{const w=W_(),m=me();const g=gById(ctx.my);if(!g)return txt;g.sparWk=w.week;
  const watchers=(S&&S.exhib&&S.spect&&S.spect.length?S.spect.map(s=>w.glads.find(x=>x.name===s.name)).filter(Boolean):shuffle(w.glads.filter(x=>x.alive&&x.contract&&x.id!==g.id)).slice(0,10+rnd(8)));
  const per=1+(typeof facLvl==='function'&&facLvl(m,'stands')?1:0);let gate=0;for(const x of watchers){if((x.purse||0)>=per){x.purse-=per;gate+=per}}m.coin+=gate;
  const add=_T` ${watchers.length} fighters watched: <b>${coinAmt87('+'+(gate))}</b> at the gate (from their own purses). ${esc(g.name)} carries a Match Week edge this week (+1 AP, ${cfAmt87('+2')}).`;
  if(w.exlog&&w.exlog[0])w.exlog[0].txt+=add;tnews(_T`🏋 Practice gate: ${coinAmt87('+'+(gate))} from ${watchers.length} watching fighters; ${esc(g.name)} is sharp for Match Week.`);return txt+add}catch(e){console.error(e);return txt}}}
{const _sf=seatFor;seatFor=function(g,col,human){const s=_sf(g,col,human);try{const w=W_();if(g&&w&&g.sparWk===w.week){s.boost={...(s.boost||{}),ap:Math.min(6,((s.boost||{}).ap||0)+1),cf:((s.boost||{}).cf||0)+2}}}catch(e){}return s}}

/* ---------------- Hygeia's Blessing: once a season, every house ---------------- */
function hygeiaReady(m){const w=W_();return (m.hygSeason||0)!==w.season}
function hygeiaUse(m){const w=W_();const hurt=rosterOf(m).filter(g=>g.inj&&!g.inj.war);if(!hurt.length||!hygeiaReady(m))return 0;for(const g of hurt){g.inj=null;g.morale=clamp((g.morale||50)+5,0,100)}m.hygSeason=w.season;
  if(m.isPlayer)tnews(_T`🌿 <b>Hygeia's Blessing</b>: the goddess's priests walk your infirmary — ${hurt.map(g=>esc(g.name)).join(', ')} ${hurt.length===1?_T('is'):_T('are')} healed. The blessing returns next season.`,'big');else mlog(m,_T`called on Hygeia's Blessing (${hurt.length} healed)`);return hurt.length}
{const _ih=infirmaryHTML;infirmaryHTML=function(){const m=me(),w=W_();const hurt=rosterOf(m).filter(g=>g.inj&&!g.inj.war).length;const ok=hygeiaReady(m);
  return `<div class="card2 hygcard ${ok&&hurt?'ready':''}"><div class="hygico">🌿</div><div>${_T`<b>Hygeia's Blessing</b>`}<div class="rc-sub">${ok?_T('Once a season, free: every wounded fighter on your roster is healed at once (lost limbs and war service excepted).'):_T`Used this season — it returns in season ${w.season+1}.`}</div></div>
    <button type="button" class="btn ${ok&&hurt?'primary':''}" data-m48="hygeia" ${ok&&hurt?'':'disabled'} title="${ok?(hurt?_T('Heal every wounded fighter now'):_T('Nobody needs it right now')):_T('Already used this season')}">${ok?_T`🌿 Call on Hygeia${hurt?_T` · ${hurt} to heal`:''}`:_T('✓ Used this season')}</button></div>`+_ih()}}
{const _ew=endWeek;endWeek=async function(){const r=await _ew();try{const w=W_();if(r!==false&&w&&!w.dead&&!w.tutorial)for(const m of w.mgrs)if(!m.isPlayer&&rosterOf(m).filter(g=>g.inj&&!g.inj.war).length>=2&&hygeiaReady(m)&&Math.random()<0.5)hygeiaUse(m)}catch(e){console.error(e)}return r}}

/* ---------------- the founding ledger ---------------- */
{const _nw=newWorld;newWorld=function(choice){const out=_nw(choice);try{const w=MGR.world,pm=w&&w.mgrs.find(m=>m.isPlayer);if(w)for(const g of w.glads)if(g.purse==null)g.purse=3+rnd(13); /* every fighter arrives with a few coins saved */if(w&&pm&&!w.tutorial&&!w.qsLast){const ros=rosterOf(pm);
  w.qsLast={season:w.season,founding:true,lines:[[choice&&choice.type==='pre'?_T('🏛 The treasury as it stands today — the coffers you take over with the house'):_T('🏛 The Senate’s founding grant — a new house opens its gates'),pm.coin],...(ros.length?[[_T`🛡 ${ros.length} fighter${ros.length===1?'':'s'} already under contract`,0]]:[])],total:pm.coin,seen:false}}}catch(e){}return out}}
{const _qc=qsCardHTML;qsCardHTML=function(){const w=W_();const Q=w.qsLast;if(!Q||Q.seen||!Q.founding)return _qc();
  return `<div class="card2 qscard"><div class="sect" style="margin-top:0">${_T`🏛 The Quaestor’s Ledger · your founding`} <span class="rc-sub">${_T`the treasury you open with — at every season's end the quaestor pays again`}</span></div>
  <table class="tally compact">${Q.lines.map(([l,v])=>`<tr><td>${esc(l)}</td><td class="n" style="color:var(--gold2)">${v?'+'+v:''}</td></tr>`).join('')}<tr><td>${_T`<b>Your opening treasury</b>`}</td><td class="n"><b>${Q.total}</b></td></tr></table>
  <div class="acts" style="margin-top:6px"><button class="btn tksm" type="button" data-m47="qsseen">${_T`Seal the ledger`}</button></div></div>`}}

/* ---------------- clicks ---------------- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-m48]');if(!b||typeof W_!=='function')return;const w=W_();if(!w)return;e.stopPropagation();const a=b.dataset.m48,id=b.dataset.id;const pm=me();
  if(a==='bench'){const g=gById(id);if(g&&!g.inj)g.bench=!g.bench}
  if(a==='hygeia')hygeiaUse(pm);
  if(a==='cartbuy'){const g=gById(id);if(g&&!g.contract&&pm.coin>=g.price){pm.coin-=g.price;g.contract={mgr:pm.id,wage:2,weeks:6,since:w.week};delete g.auction;g.morale=55;g.scout=1;ghist(g,_T`bought off Vulso's cart for ${coinAmt87(g.price)} (${g.woe})`);tnews(_T`🛒 Bought ${esc(g.name)} off Vulso's cart (${coinAmt87(g.price)}). ${esc(g.woe)}.`);w.cart.ids=w.cart.ids.filter(x=>x!==id)}}
  if(a==='loaninyes'||a==='loaninno'){const o=(w.offers||[]).find(x=>x.id===id);if(o){if(a==='loaninyes'){const g=gById(o.gid),m=mgrById(o.mid);if(g&&m&&borrowFrom(g,m,o.fee,o.weeks)){g.loanFrom.dire=1;g.bench=false;g.direWage=g.contract.wage;g.contract.wage=0}}w.offers=w.offers.filter(x=>x!==o)}}
  saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);

/* ---------------- the people of the empire ---------------- */
async function seedEmpireCrowd(){try{if(typeof CROWD_CACHE==='undefined')return;if(CROWD_CACHE.length>=60){for(const r of CROWD_CACHE)if(r.purse==null)r.purse=5+Math.floor(Math.random()*40);return}
  const taken=new Set(CROWD_CACHE.map(r=>r.name));const cities=LOCATIONS.filter(Boolean).map(L=>L.n);const add=[];
  for(let i=CROWD_CACHE.length;i<140;i++){const r=specIdentity(taken);r.city=cities[i%cities.length];r.purse=5+Math.floor(Math.random()*40);delete r.isNew;add.push(r)}
  CROWD_CACHE.push(...add);for(const r of add)await Store.put('crowd',r.id,r).catch(()=>{})}catch(e){console.error(e)}}
setTimeout(()=>{if(!HEADLESS)Promise.resolve(typeof loadCrowd==='function'&&!CROWD_CACHE.length?loadCrowd():null).then(seedEmpireCrowd)},3500);

/* ---------------- the long run: what a 16-season stress test showed, and the fixes ----------------
   • fame crept up for every house until half the league sat at the ceiling, while the weakest sat at 0 for good →
     each season's close, fame drifts back toward 35 (a fifth of the way down, a tenth of the way up).
   • rich houses hoarded 900–1,000 coin (saving for stone at 2.2× the price) → a house holding 1.3× the price of its
     next building now builds. */
function seasonCloseBalance(w){for(const m of w.mgrs){if(m.dead)continue;const f0=m.fame||0;const d=Math.round((35-f0)*(f0>35?0.2:0.1));if(d){m.fame=clamp(f0+d,0,100);if(m.isPlayer&&d<0)tnews(_T`🕯 A new season — the crowd forgets a little: fame ${d} (${Math.round(f0)} → ${Math.round(m.fame)}). Win it back on the sand.`)}}}
{const _ew2=endWeek;endWeek=async function(){const w=W_();const s0=w?w.season:0;const r=await _ew2();try{const w2=W_();if(w2&&!w2.dead&&!w2.tutorial){if(w2.season!==s0)seasonCloseBalance(w2);for(const g of w2.glads)if(g.direWage!=null&&!g.loanFrom){if(g.contract)g.contract.wage=g.direWage;delete g.direWage}
  for(const m of w2.mgrs){if(m.isPlayer||m.dead||m.facWk===w2.week)continue;const ks=Object.keys(FAC).filter(k=>facLvl(m,k)<3).sort((a,b)=>facLvl(m,a)-facLvl(m,b));const k=ks[0];if(k&&m.coin>FAC_COST[facLvl(m,k)]*1.3)facBuild(m,k,true)}}}catch(e){console.error(e)}return r}}

/* ---------------- Rules & strategy: two guides ---------------- */
const MGR_SECT=/<h4>[^<]*(Manager mode|The square and the long game|The table and the week|Money, facilities|Silverware)[^<]*<\/h4>/;
function guideParts(){const h=guideHTML();const inner=h.replace(/^\s*<div class="guide">/,'').replace(/<\/div>\s*$/,'');const parts=inner.split(/(?=<h4>)/);
  const play=[],mgr=[];for(const p of parts)(MGR_SECT.test(p)?mgr:play).push(p);return {play:`<div class="guide">${play.join('')}</div>`,mgr:mgr.join('')}}
function playGuideHTML(){return guideParts().play}
function mgrGuideHTML(){const ref=guideParts().mgr;return `<div class="guide">
 <p>${_T`How to run a ludus that lasts. The notes at the end come from a 16-season test run of the league.`}</p>
 <h4>${_T`The season`}</h4><ul>
  <li>${_T`12 weeks. Each week is a Match Week, Flavius's travelling games: the Undercard on Friday, the Feature on Saturday and the Main event on Sunday. Wins are worth 3 points and runner-up finishes 1.`}</li>
  <li>${_T`The top four go to the <b>Superbus</b>. After it come the awards and the recap paper, and then the <b>Quaestor's Ledger</b> pays every house for its season.`}</li>
  <li>${_T`A new career opens with its founding ledger, which shows your starting treasury.`}</li></ul>
 <h4>${_T`Money`}</h4><ul>
  <li>${_T`<b>Wages are the bill, purses are the income.</b> A fighter rated 60 asks about ${coinAmt87(14)} a week, and an Undercard win pays about 30.`}</li>
  <li>${_T`Keep your weekly wages below what one good night pays. A small house runs best on <b>about three fighters</b>.`}</li>
  <li>${_T`Appearance fees are paid win or lose, so enter someone every week.`}</li>
  <li>${_T`Pay blood money only for a fighter you can't replace.`}</li>
  <li>${_T`Three week-ends in the red closes the ludus. At the season's close, the creditors count what the Quaestor still owes you.`}</li></ul>
 <h4>${_T`Your first weeks`}</h4><ul>
  <li>${_T`A house built from nothing opens with ${coinAmt87(100)}: the founding treasury plus the Senate's newcomer grant.`}</li>
  <li>${_T`<b>Spar every week.</b> The gate from watching fighters is safe income, and the sparring fighter gets an edge on Match Week.`}</li>
  <li>${_T`<b>Take the road offers.</b> Another house pays your travel if you enter the fighter they ask for. Struggling houses get these offers more often.`}</li>
  <li>${_T`Small houses (2 fighters or fewer, under ${coinAmt87(120)}) pay half the blood money to save a condemned fighter.`}</li>
  <li>${_T`Your first, partial season is forgiven if it ends in debt. The next one isn't.`}</li>
  <li>${_T`In a 20-career test, new houses that spar, take road offers and borrow once survived three seasons 18 times out of 20. Before this build it was 2 out of 20.`}</li></ul>
 <h4>${_T`House size`}</h4><ul>
  <li>${_T`<b>Small (2–4 fighters).</b> Enter your best fighter in the bout they fit. Keep weekly wages at or below one night's purse. This is where every house starts.`}</li>
  <li>${_T`<b>Medium (5–7).</b> You can fill all three bouts every week and still cover injuries.`}
    <ul>
     <li>${_T`Bench the spares and lend them out for a fee.`}</li>
     <li>${_T`It pays only with steady Feature and Main event wins. Wages run about 70–100 coin a week.`}</li>
    </ul></li>
  <li>${_T`<b>Large (8+).</b> Build to this once you're thriving.`}
    <ul>
     <li>${_T`Special events and exhibitions give the extra fighters bouts, and loans turn the bench into income.`}</li>
     <li>${_T`Build Barracks so fighters sign for less, and Practice stands so sparring pays.`}</li>
     <li>${_T`There's no cap on signings, but past five fighters, recruits who care about time on the sand grade you a little lower for each extra body.`}</li>
    </ul></li>
  <li>${_T`<b>Thriving houses</b> (350+ coin, or fame 55+ with 150+ coin) are on their own: no loan offers, no cart, no one pays your road, and no Senate stipend.`}</li></ul>
 <h4>${_T`The depth chart`}</h4><ul>
  <li>${_T`<b>Starters</b> are the fighters you can enter on Match Week.`}</li>
  <li>${_T`<b>Bench</b> fighters train, or go on loan to a friendly house for a weekly fee. Rivals never get a loan.`}</li>
  <li>${_T`The injured sit out until they're healed.`}</li>
  <li>${_T`The Loans panel shows who is out, who is in, the fee and the weeks left.`}</li></ul>
 <h4>${_T`Practice`}</h4><ul>
  <li>${_T`A practice bout grows a fighter a little.`}</li>
  <li>${_T`League fighters who come to watch each pay a coin from their own purses, 2 with Practice stands.`}</li>
  <li>${_T`The fighter who sparred takes <b>+1 AP and ${cfAmt87('+2')}</b> into this week's Match Week. Spar the fighter you're about to enter.`}</li></ul>
 <h4>${_T`Empty barracks`}</h4><ul>
  <li>${_T`Lose everyone and a friendly house writes to offer a fighter on loan. You decide whether to accept.`}</li>
  <li>${_T`<b>Vulso's cart</b> also comes to your gate once, with three cheap lots and no travel cost.`}</li>
  <li>${_T`A loaned fighter goes home as soon as you sign one of your own.`}</li>
  <li>${_T`If a loaned fighter dies under your colours, you owe their house a fee.`}</li></ul>
 <h4>${_T`Health`}</h4><ul>
  <li>${_T`The physicians have a weekly budget. The Valetudinarium raises it.`}</li>
  <li>${_T`<b>Hygeia's Blessing</b> heals your whole roster once a season, for free. Save it for a bad week near the run-in. Every house has one.`}</li></ul>
 <h4>${_T`Fame and stone`}</h4><ul>
  <li>${_T`Fame opens doors to recruits, but at every season's close it drifts back toward 35. Keep winning to hold it.`}</li>
  <li>${_T`Rich houses build: Practice stands pay, the yard trains, the armory adds AP. Once your treasury clears the next building's price, the rival houses are already pouring stone.`}</li></ul>
 <h4>${_T`What 16 seasons showed`}</h4><ul>
  <li>${_T`Ratings hold steady at a league average of 60–65. A 90+ star appears now and then.`}</li>
  <li>${_T`The free-agent market settles at about 55–60 fighters.`}</li>
  <li>${_T`House treasuries settle at a median of 150–250.`}</li>
  <li>${_T`A house that enters every fighter in every bout and pays every blood price loses about ${coinAmt87(60)} a week. Pick your bouts.`}</li>
  <li>${_T`Fixed in this build:`}
    <ul>
     <li>${_T`Fame crept toward the ceiling for every house. It now drifts back toward 35 each season.`}</li>
     <li>${_T`Rich houses sat on 900–1,000 coin. They now build sooner.`}</li>
     <li>${_T`The free-agent pool swelled past 75. It's now trimmed to 55.`}</li>
    </ul></li></ul>
 ${ref?`<details class="gref"><summary>${_T`More detail`}</summary>${ref}</details>`:''}</div>`}

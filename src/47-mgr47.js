/* =====================================================================
   47-MGR47 · MANAGER MODE, v0.47 — TROPHY CASES, THE QUAESTOR, TRADES AND LOANS
   =====================================================================
   • Rival houses keep silverware too (m.trophies): the invitationals they take and the season awards
     their fighters win. League → a stable → 🏆 on the lanista's card opens their case.
   • Play Now: a CPU who wins a tournament or a custom event with a trophy keeps it — it stands under
     "Held by rivals" in the Annals' trophy case and on that gladiator's record.
   • ⚔ Match Week glows in the left rail (purple, gold edge) until the night is fought.
   • Every Note says what caused it.  The Lanista tab: Raising your name opens by default, and Your record
     is a real league record.  Fame shows its fans on hover.  Perk points bank — they never expire.
   • Out of coin and out of fighters: the treasury shows what you owe (and your net); a desperate
     volunteer knocks when the barracks are empty; and at every season's end THE QUAESTOR'S LEDGER pays
     a house that stood the season: a stipend, a tax return on wages paid, a rebate on the tax on lost
     bets, bounties for new signings, fame and fans gained, and the league finish — capped and fair.
   • Rival houses send TRADE offers (a fighter of yours for coin, or for one or two of theirs).
   • GLADIATOR LOANS (never to or from a rival): lend a benched fighter for a weekly fee, or borrow one
     of theirs; the Roster tab has a DEPTH CHART — starters and bench.
   ===================================================================== */
/* ---------------- rival houses' silverware ---------------- */
function mTrophy(m,tid,o={}){if(!m||m.isPlayer)return;const d=trophyDef(tid);if(!d)return;const w=W_();m.trophies=m.trophies||[];let e=m.trophies.find(t=>t.tid===tid);
  const h={season:w.season,week:w.week,who:o.who||null,why:o.why||d.desc};if(e){e.count=(e.count||1)+1;e.hist.push(h)}else m.trophies.push({tid,name:d.name,count:1,hist:[h]})}
{const _sa=seasonAwards;seasonAwards=function(w,season){const r=_sa(w,season);try{for(const a of (w.awardShow&&w.awardShow.awards)||[])if(!a.mine&&a.mid){const m=mgrById(a.mid);if(m)mTrophy(m,a.tid,{who:a.gname||a.mname,why:`${a.desc} (${a.stat})`})}}catch(e){console.error(e)}return r}}
{const _sc=specCrown;specCrown=function(T){_sc(T);try{const e=T.champ;const g=specEnt(e);const m=g&&g.contract?mgrById(g.contract.mgr):null;if(!e.mine&&m&&!m.isPlayer&&T.D.trophy&&!T.D.finale)mTrophy(m,T.D.trophy,{who:g.name,why:_T`Won ${T.D.n}`})}catch(err){console.error(err)}}}
function trophyCaseWin(mid){const m=mgrById(mid);if(!m)return;let el=document.getElementById('tcaseWin');if(el)el.remove();const T=(m.trophies||[]);const n=T.reduce((a,t)=>a+(t.count||1),0);
  el=document.createElement('div');el.id='tcaseWin';el.className='tcasewin';el.setAttribute('role','dialog');el.setAttribute('aria-label',_T`${m.ludus} trophy case`);
  el.innerHTML=`<button type="button" class="tcx" aria-label="${_T`Close`}" data-tcx="1">✕</button><div class="tchd">${typeof flagChip==='function'?flagChip(m,24):''}<b>${esc(m.ludus)}</b> <span class="rc-sub">${_T`· the trophy case · ${n} piece${n===1?'':'s'}`}</span></div>
    ${T.length?`<div class="tcgrid">${T.map(t=>{const d=trophyDef(t.tid)||{};return `<div class="tcitem" title="${esc(t.hist.map(h=>`S${h.season} W${h.week} · ${h.who||''} — ${h.why}`).join('\n'))}">${trophySVG(d,54)}<b>${esc(t.name)}</b>${t.count>1?`<span class="tccount">×${t.count}</span>`:''}<span class="rc-sub">${esc((t.hist[t.hist.length-1]||{}).who||'')} · S${(t.hist[t.hist.length-1]||{}).season}</span></div>`}).join('')}</div>`:`<p class="rc-sub" style="margin:8px 0">${_T`The shelves are bare — so far.`}</p>`}`;
  document.body.appendChild(el);el.querySelector('.tcx').focus()}
document.addEventListener('click',e=>{if(e.target.closest('[data-tcx]')){const w=document.getElementById('tcaseWin');if(w)w.remove();return}const b=e.target.closest('[data-tcase]');if(b){e.stopPropagation();trophyCaseWin(b.dataset.tcase)}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const w=document.getElementById('tcaseWin');if(w){w.remove();e.stopPropagation()}}},true);
{const _th=teamHTML;teamHTML=function(){let h=_th();const m=mgrById(MGR.teamId);if(!m||m.isPlayer)return h;const n=(m.trophies||[]).reduce((a,t)=>a+(t.count||1),0);
  return h.replace(/(<div class="gradebox")/,`<button type="button" class="tcbtn" data-tcase="${m.id}" title="${_T`Open ${esc(m.ludus)}’s trophy case`}">🏆<b>${n}</b></button>$1`)}}

/* ---------------- Play Now: trophies a CPU takes home ---------------- */
async function rivalTrophy(tid,o={}){const d=trophyDef(tid);if(!d)return;const e={tid,name:d.name,who:o.who||'',why:o.why||d.desc,date:new Date().toISOString().slice(0,10),cls:o.cls||null,saved:o.saved||null};
  await Store.put('rivalTrophies','r'+Date.now().toString(36),e).catch(()=>{});
  if(o.saved){const rec=LUDUS_CACHE.find(g=>g.id===o.saved)||await Store.getDoc('gladiators',o.saved).catch(()=>null);if(rec){(rec.trophyWins=rec.trophyWins||[]).push({tid,name:d.name,date:e.date,why:e.why});await Store.put('gladiators',rec.id,rec).catch(()=>{});await loadLudus().catch(()=>{})}}
  if(typeof mToast==='function')mToast(_T`🏆 <b>${esc(o.who)}</b> (CPU) takes <b>${esc(d.name)}</b> — it goes on their shelf, not yours.`)}
if(typeof SAVE_COLS!=='undefined'&&!SAVE_COLS.includes('rivalTrophies'))SAVE_COLS.push('rivalTrophies');
{const _ht=hallTrophiesHTML;hallTrophiesHTML=async function(){const h=await _ht();const R=(await Store.list('rivalTrophies').catch(()=>[])).sort((a,b)=>String(b.date).localeCompare(String(a.date)));if(!R.length)return h;
  return h+`<h4>${_T`🏺 Held by rivals`} <span class="rc-sub">${_T`trophies a CPU gladiator took home — win them back`}</span></h4><div class="tcgrid wide">${R.slice(0,24).map(t=>{const d=trophyDef(t.tid)||{};return `<div class="tcitem">${trophySVG(d,46)}<b>${esc(t.name)}</b><span class="rc-sub">${esc(t.who)}${t.cls&&CLASSES[t.cls]?' · '+esc(CLASSES[t.cls].name):''} · ${esc(t.date)}</span><span class="rc-sub">${esc(t.why)}</span></div>`}).join('')}</div>`}}
{const _ld=ludusDetail;ludusDetail=function(g){let h=_ld(g);if(g&&(g.trophyWins||[]).length)h=h.replace('<h4>History</h4>',`<h4>${_T`🏆 Trophies they hold`}</h4><div class="badges">${g.trophyWins.map(t=>`<span class="badge gold" title="${esc(t.why)} · ${esc(t.date)}">🏆 ${esc(t.name)}</span>`).join('')}</div><h4>${_T`History`}</h4>`);return h}}

/* ---------------- ⚔ Match Week glows until it is fought ---------------- */
setInterval(()=>{try{const b=document.querySelector('.mtabs [data-mg="tab"][data-id="night"]');if(!b)return;const w=typeof W_==='function'?W_():null;const pend=!!(w&&w.night&&w.night.bouts&&w.night.bouts.some(x=>!x.done));b.classList.toggle('nightpend',pend);b.title=pend?_T('Match Week has not been fought yet'):''}catch(e){}},700);

/* ---------------- Notes say what caused them ---------------- */
document.addEventListener('click',e=>{const b=e.target.closest('#mgrBody [data-mg]');if(!b||typeof MGR==='undefined')return;const a=b.dataset.mg;if(a==='tab'||a==='sel')return;
  const t=(b.childNodes[0]&&b.childNodes[0].textContent||b.textContent||'').trim().replace(/\s+/g,' ').slice(0,60);MGR.noteFrom=t},true);

/* ---------------- the Lanista tab ---------------- */
function lanRecordHTML(m,w){const s=msp(m,w.season);const L=leagueSort(w.mgrs,w.season);const pos=L.indexOf(m)+1;const A=(w.archives||[]);
  const fin=A.map(a=>{const i=(a.standings||[]).findIndex(x=>x.me);return i>=0?i+1:null}).filter(Boolean);const best=fin.length?Math.min(...fin):null;
  const sup=A.filter(a=>a.finale&&(a.finale.names||[]).length&&a.finale.champLudus===m.ludus).length;const T=(w.trophies||[]).reduce((a,t)=>a+(t.count||1),0);
  const pct=m.bouts?Math.round(m.wins/m.bouts*100):0;
  return `<div class="card2 lanrec"><div class="sect" style="margin-top:0">${_T`📊 Your record`}</div>
    <div class="rc-stats">${_T`<span><b>${pos?`${pos}${['th','st','nd','rd'][pos%10>3||Math.floor(pos/10)===1?0:pos%10]}`:'—'}</b>this season · of ${w.mgrs.length}</span><span><b>${s.pts}</b>points</span><span><b>${s.w}–${Math.max(0,s.b-s.w)}</b>season W–L</span>`}</div>
    <div class="rc-stats" style="margin-top:6px">${_T`<span><b>${m.wins}–${Math.max(0,m.bouts-m.wins)}</b>all-time W–L</span><span><b>${pct}%</b>win rate</span><span><b>${A.length}</b>season${A.length===1?'':'s'} done</span>`}</div>
    <div class="rc-stats" style="margin-top:6px">${_T`<span><b>${best?best+(['th','st','nd','rd'][best>3?0:best]):'—'}</b>best finish</span><span><b>${sup}</b>Superbus crowns</span><span><b>${T}</b>trophies</span>`}</div>
    <div class="badges" style="margin-top:8px"><span class="badge">${_T`Fame ${m.fame} (best ${m.fameBest||m.fame})`}</span><span class="badge">${_T`Fighters improved ${m.improved||0}`}</span><span class="badge">${_T`Pledges kept ${m.kept||0} · broken ${m.broken||0}`}</span><span class="badge">${_T`Poached ${m.poached||0}`}</span><span class="badge">${_T`Deaths ${m.deaths||0}`}</span><span class="badge">${_T`Betting ${(m.betNet||0)>=0?'+':''}${m.betNet||0}`}</span></div>
    ${A.length?`<table class="tally compact" style="margin-top:6px"><tr><th>${_T`Season`}</th><th>${_T`Finish`}</th><th>${_T`Record`}</th><th>${_T`Coin`}</th></tr>${A.slice(-5).reverse().map(a=>{const i=(a.standings||[]).findIndex(x=>x.me);return `<tr><td>${a.season}</td><td>${i>=0?'#'+(i+1):'—'}</td><td>${esc((a.standings||[])[i]?a.standings[i].rec:(a.you||{}).rec||'')}</td><td class="n">${(a.you||{}).coin??''}</td></tr>`}).join('')}</table>`:''}</div>`}
{const _me=meHTML;meHTML=function(){const m=me(),w=W_();let h=_me();
  h=h.replace('<details class="card2"><summary><b>Raising your name</b>',_T('<details class="card2" open><summary><b>Raising your name</b>'));
  h=h.replace(/<div class="card2"><div class="sect" style="margin-top:0">Your record<\/div>[\s\S]*?<\/div><\/div>/,lanRecordHTML(m,w));return h}}

/* ---------------- fame, fans, debt: the header ---------------- */
function teamFans(){const pm=me();const names=new Map(rosterOf(pm).map(g=>[g.name.toLowerCase(),g]));const out=[];
  for(const r of (typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[])){if(r.banned||r.recruited)continue;for(const [k,rel] of [[r.fanOf,'fan'],[r.patronFav,'patron'],[r.kin&&r.kin.name,r.kin&&r.kin.rel]]){if(k&&names.has(String(k).toLowerCase())){out.push({r,g:names.get(String(k).toLowerCase()),rel});break}}}return out}
function fameTipHTML(){const F=teamFans();return `<span class="fametip" role="tooltip">${_T`<b>👥 ${F.length}K active fans of your house</b>`}<span class="rc-sub">${_T`regulars who follow a fighter on your roster — every one counts`}</span>${F.length?`<span class="ftlist">${F.slice(0,40).map(x=>`<span>${esc(x.r.name)} <i>${esc(x.r.city||'')}</i> · ${x.rel==='fan'?_T('a fan of'):x.rel==='patron'?_T('patron of'):esc(x.rel)+' of'} <b>${esc(x.g.name)}</b></span>`).join('')}${F.length>40?`<span class="rc-sub">${_T`…and ${F.length-40} more`}</span>`:''}</span>`:_T('<span class="rc-sub">Nobody yet — win in front of a crowd and they will come.</span>')}</span>`}
/* perk points bank */
{const _sc=schoolingCardHTML;schoolingCardHTML=function(){return _sc().replace('Available now:',_T('Banked and ready (they never expire):'))}}

/* ---------------- a volunteer, and the Quaestor's Ledger ---------------- */
function qsInit(w,pm){if(!w.qs||w.qs.s!==w.season)w.qs={s:w.season,fame:pm.fame,fans:teamFans().length,roster:rosterOf(pm).map(g=>g.id),wages:0,bet:pm.betNet||0,paid:false}}
/* the season's figures are closed at its last week-end; the quaestor pays once the Superbus, the awards and the recap are over */
function qsClose(w,pm){qsInit(w,pm);const Q=w.qs;if(Q.closed)return;const L=leagueSort(w.mgrs,w.season);Q.closed=1;Q.pos=L.indexOf(pm)+1;Q.n=w.mgrs.length;
  Q.signed=rosterOf(pm).map(g=>g.id).filter(id=>!Q.roster.includes(id)).length;Q.lost=Math.max(0,Q.bet-(pm.betNet||0));Q.fameD=Math.max(0,pm.fame-Q.fame);Q.fansD=Math.max(0,teamFans().length-Q.fans);Q.fameAt=pm.fame;w.qsDue={...Q}}
function quaestorLedger(w,pm){const Q=w.qsDue;if(!Q||Q.paid)return null;
  const lines=[[_T('🏛 The Senate’s stipend — your house stood the whole season'),Q.rich?0:30],[_T('📜 Tax return on the wages you paid (')+Q.wages+' coin)',Math.round(Q.wages*0.10)],[_T('🎲 Rebate on the tax you paid on lost wagers'),Math.round(Q.lost*0.12)],
    [_T('🤝 Recruiting bounty — ')+Q.signed+_T(' new signing')+(Q.signed===1?'':'s'),Q.signed*12],[_T('⭐ Fame gained this season (')+Q.fameD+')',Q.fameD*3],[_T('👥 New fans (')+Q.fansD+'K)',Q.fansD*2],
    [_T('📊 League finish — ')+(Q.pos?'#'+Q.pos+' of '+Q.n:'—'),Q.pos?Math.max(0,(Q.n-Q.pos))*4:0]].filter(x=>x[1]>0);
  let total=lines.reduce((a,x)=>a+x[1],0);const cap=120+(Q.fameAt||0)*3;if(total>cap){lines.push([_T`⚖ The quaestor’s ceiling (${cap})`,cap-total]);total=cap}
  Q.paid=true;w.qsDue=null;pm.coin+=total;w.qsLast={season:Q.s,lines,total,seen:false};
  tnews(_T`🏛 <b>The Quaestor’s Ledger</b> for season ${Q.s}: ${coinAmt87('+'+(total))} — ${lines.map(x=>`${x[0].replace(/^\S+ /,'')} ${x[1]>0?'+':''}${x[1]}`).join(' · ')}.`,'big');return total}
/* pay it the moment the new season is really under way */
function qsMaybePay(w,pm){if(!w||!pm||!w.qsDue||w.dead||w.tutorial)return false;if(w.finaleDue||(w.special&&!w.special.done)||(w.awardShow&&!w.awardShow.seen))return false;if(w.lastPaper&&w.lastPaper.recap&&!w.lastPaper.seen)return false;return !!quaestorLedger(w,pm)}
{const _ew=endWeek;endWeek=async function(){const w=W_(),pm=me();let ready=false;try{ready=!!(w&&pm&&w.night&&w.night.bouts.every(b=>b.done)&&!(w.pend||[]).length&&!(w.special&&!w.special.done))}catch(e){}
  if(ready&&!w.tutorial){qsInit(w,pm);w.qs.wages+=rosterOf(pm).reduce((a,g)=>a+(g.contract.wage||0),0);if(w.week%12===0)qsClose(w,pm);
    loansWeek(w,pm);}
  const r=await _ew();
  try{const w2=W_(),pm2=me();if(r!==false&&w2&&pm2&&!w2.dead&&!w2.tutorial){qsInit(w2,pm2);offersWeek(w2,pm2);
    if(typeof emptyBarracksWeek==='function')emptyBarracksWeek(w2,pm2)}}catch(e){console.error(e)}
  return r}}
function qsCardHTML(){const w=W_();const Q=w.qsLast;if(!Q||Q.seen)return '';return `<div class="card2 qscard"><div class="sect" style="margin-top:0">${_T`🏛 The Quaestor’s Ledger · season ${Q.season}`} <span class="rc-sub">${_T`paid to every house that stood the season`}</span></div>
  <table class="tally compact">${Q.lines.map(([l,v])=>`<tr><td>${esc(l)}</td><td class="n" style="color:${v<0?'var(--blood2)':'var(--gold2)'}">${v>0?'+':''}${v}</td></tr>`).join('')}<tr><td>${_T`<b>Paid into your treasury</b>`}</td><td class="n"><b>+${Q.total}</b></td></tr></table>
  <div class="acts" style="margin-top:6px"><button class="btn tksm" type="button" data-m47="qsseen">${_T`Seal the ledger`}</button></div></div>`}

/* ---------------- trade offers from rival houses ---------------- */
const isRival=m=>Math.max(m.rivalry||0,(m.rivals||{})[me().id]||0)>=35;
function gValue(g){return Math.round(effOvr(g)*2.2+(g.fame||0)*1.2-Math.max(0,gAge(g)-30)*4)}
function offersWeek(w,pm){w.offers=(w.offers||[]).filter(o=>o.until>=w.week&&gById(o.gid)&&gById(o.gid).alive);
  const mine=rosterOf(pm).filter(g=>!g.loanFrom);if(mine.length<2||w.offers.length>=2||Math.random()>0.35)return;
  const houses=w.mgrs.filter(m=>!m.isPlayer&&!isRival(m)&&opinionOf(m).v>=20);if(!houses.length)return;const m=pickOne(houses);
  const want=[...mine].sort((a,b)=>effOvr(b)-effOvr(a))[Math.min(mine.length-1,1+rnd(Math.max(1,mine.length-1)))];if(!want)return;const val=gValue(want);
  const theirs=rosterOf(m).filter(g=>!g.loanFrom).sort((a,b)=>Math.abs(gValue(a)-val)-Math.abs(gValue(b)-val));
  let o;if(Math.random()<0.5||!theirs.length){const coin=Math.max(20,Math.round(val*(0.9+Math.random()*0.35)));if(m.coin<coin)return;o={id:'o'+Date.now().toString(36),kind:'coin',mid:m.id,gid:want.id,coin,until:w.week+2}}
  else{const give=[theirs[0]];const v0=gValue(theirs[0]);if(v0<val*0.8&&theirs[1])give.push(theirs[1]);o={id:'o'+Date.now().toString(36),kind:'swap',mid:m.id,gid:want.id,give:give.map(g=>g.id),coin:Math.max(0,Math.round((val-give.reduce((a,g)=>a+gValue(g),0))*0.5)),until:w.week+2}}
  w.offers.push(o);tnews(_T`📨 <b>${esc(m.ludus)}</b> sends a trade offer for <b>${esc(want.name)}</b> — see the top of any tab.`,'big')}
function offersHTML(){const w=W_();const L=(w.offers||[]).filter(o=>o.until>=w.week);if(!L.length)return '';
  return L.map(o=>{const m=mgrById(o.mid);const g=gById(o.gid);if(!m||!g)return '';const give=(o.give||[]).map(gById).filter(Boolean);
    return `<div class="card2 offerbox"><div class="sect" style="margin-top:0">${_T`📨 A trade offer from ${typeof flagChip==='function'?flagChip(m,18):''} ${esc(m.ludus)}`} <span class="rc-sub">${_T`answer by week ${wkOf(o.until)}`}</span></div>
      <div class="offrow"><div class="offside"><span class="rc-sub">${_T`They want`}</span>${gArt(g,'sm')}<b>${esc(g.name)}</b><span class="rc-sub">${_T`rated ${effOvr(g)} · ${g.contract.wage}/wk`}</span></div><span class="offarrow">⇄</span>
      <div class="offside">${o.kind==='coin'?`<span class="rc-sub">${_T`They pay`}</span><span class="offcoin">💰 ${o.coin}</span>`:`<span class="rc-sub">${_T`You get`}</span>${give.map(x=>`<div class="offg">${gArt(x,'xs')} <b>${esc(x.name)}</b> <span class="rc-sub">${_T`rated ${effOvr(x)} · ${x.contract.wage}/wk`}</span></div>`).join('')}${o.coin?`<span class="offcoin">+ 💰 ${o.coin}</span>`:''}`}</div></div>
      <div class="acts"><button class="btn primary tksm" type="button" data-m47="offyes" data-id="${o.id}">${_T`✔ Accept`}</button><button class="btn tksm" type="button" data-m47="offno" data-id="${o.id}">${_T`✖ Decline`}</button></div></div>`}).join('')}
function offerAccept(o){const w=W_(),pm=me();const m=mgrById(o.mid);const g=gById(o.gid);if(!m||!g||!g.contract||g.contract.mgr!==pm.id)return false;
  if(o.kind==='coin'){if(m.coin<o.coin)return false;m.coin-=o.coin;pm.coin+=o.coin}else{for(const id of o.give){const x=gById(id);if(x&&x.contract&&x.contract.mgr===m.id){x.contract.mgr=pm.id;ghist(x,_T`traded to ${pm.ludus}`)}}if(o.coin){m.coin-=o.coin;pm.coin+=o.coin}}
  g.contract.mgr=m.id;ghist(g,_T`traded to ${m.ludus}`);mlog(m,_T`traded for ${g.name}`);mnews(_T`🔁 <b>${esc(g.name)}</b> moves from ${esc(pm.ludus)} to ${esc(m.ludus)}${o.kind==='coin'?_T` for ${coinAmt87(o.coin)}`:''}.`);return true}

/* ---------------- gladiator loans ---------------- */
const loanFee=g=>Math.max(4,Math.round(effOvr(g)*0.18+(g.fame||0)*0.1));
function loansWeek(w,pm){for(const g of w.glads){const L=g.loanFrom;if(!L||!g.contract)continue;const borrower=mgrById(g.contract.mgr),owner=mgrById(L.mid);
    if(borrower&&owner){const fee=Math.min(L.fee,Math.max(0,borrower.coin));borrower.coin-=fee;owner.coin+=fee;if(owner.isPlayer)tnews(_T`🤝 Loan fee: ${esc(borrower.ludus)} pays ${coinAmt87(fee)} for ${esc(g.name)}.`);if(borrower.isPlayer)tnews(_T`🤝 You pay ${coinAmt87(fee)} to ${esc(owner.ludus)} for ${esc(g.name)}.`)}
    L.weeks--;if(L.weeks<=0||!g.alive){if(g.alive&&owner){g.contract.mgr=owner.id;ghist(g,_T`back home to ${owner.ludus} after a loan`);if(owner.isPlayer||(borrower&&borrower.isPlayer))tnews(_T`🤝 ${esc(g.name)}’s loan ends — back to ${esc(owner.ludus)}.`)}delete g.loanFrom}}
  /* now and then a friendly house asks to borrow one of your benched fighters */
  const bench=depthOf(pm).bench.filter(g=>!g.loanFrom&&!g.inj);if(bench.length&&Math.random()<0.25&&!(w.offers||[]).some(o=>o.kind==='loan')){const houses=w.mgrs.filter(m=>!m.isPlayer&&!isRival(m)&&opinionOf(m).v>=30&&rosterOf(m).length<7);
    if(houses.length){const m=pickOne(houses),g=pickOne(bench);(w.offers=w.offers||[]).push({id:'o'+Date.now().toString(36),kind:'loan',mid:m.id,gid:g.id,fee:loanFee(g)+1+rnd(3),weeks:2+rnd(3),until:w.week+1});tnews(_T`🤝 <b>${esc(m.ludus)}</b> asks to borrow <b>${esc(g.name)}</b> off your bench.`)}}}
function depthOf(m){const ros=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));const n=Math.min(3,ros.length);return {starters:ros.slice(0,n),bench:ros.slice(n)}}
function lendTo(g,m,fee,weeks){const pm=me();if(!g||!m||isRival(m)||g.loanFrom)return false;g.loanFrom={mid:pm.id,fee,weeks};g.contract.mgr=m.id;ghist(g,_T`loaned to ${m.ludus} for ${weeks} weeks at ${fee}/wk`);mlog(m,_T`borrowed ${g.name} from ${pm.ludus}`);tnews(_T`🤝 ${esc(g.name)} goes on loan to ${esc(m.ludus)} — ${weeks} weeks at ${coinAmt87(fee)} a week.`);return true}
function borrowFrom(g,m,fee,weeks){const pm=me();if(!g||!m||isRival(m)||g.loanFrom)return false;g.loanFrom={mid:m.id,fee,weeks};g.contract.mgr=pm.id;ghist(g,_T`loaned to ${pm.ludus} for ${weeks} weeks`);mlog(m,_T`loaned ${g.name} to ${pm.ludus}`);tnews(_T`🤝 ${esc(g.name)} joins you on loan from ${esc(m.ludus)} — ${weeks} weeks at ${coinAmt87(fee)} a week (plus their wage).`);return true}
function depthChartHTML(){const pm=me(),w=W_();const D=depthOf(pm);const lenders=w.mgrs.filter(m=>!m.isPlayer&&!isRival(m)&&opinionOf(m).v>=30);
  const card=(g,bench)=>`<div class="dcard ${bench?'bench':''} ${g.loanFrom?'loan':''}">${gArt(g,'xs')}<div><b>${esc(g.name)}</b><span class="rc-sub">${effOvr(g)} · ${CLASSES[g.cls]?CLASSES[g.cls].name:''}${g.inj?' · ⚕ hurt':''}</span>${g.loanFrom?`<span class="badge ${g.loanFrom.mid===pm.id?'':'gold'}">${_T`${g.loanFrom.mid===pm.id?'':_T('on loan from ')+esc((mgrById(g.loanFrom.mid)||{}).ludus||'')+' · '}${g.loanFrom.weeks} wk left`}</span>`:''}</div>
    ${bench&&!g.loanFrom&&!g.inj&&lenders.length?`<select class="tin dclend" data-m47lend="${g.id}"><option value="">${_T`Lend out…`}</option>${lenders.filter(m=>rosterOf(m).length<9).map(m=>`<option value="${m.id}">${esc(m.ludus)} · ${loanFee(g)}/wk · 3 wk</option>`).join('')}</select>`:''}</div>`;
  const out=w.glads.filter(g=>g.loanFrom&&g.loanFrom.mid===pm.id&&g.contract&&g.contract.mgr!==pm.id);
  return `<div class="card2 depth"><div class="sect" style="margin-top:0">${_T`📋 Depth chart`} <span class="rc-sub">${_T`starters fight the headline bouts; the bench can earn its keep on loan — never to a rival`}</span></div>
   <div class="dgrid"><div><div class="dhd">${_T`⭐ Starters`}</div>${D.starters.map(g=>card(g,false)).join('')||'<p class="rc-sub">—</p>'}</div><div><div class="dhd">${_T`🪑 Bench`}</div>${D.bench.map(g=>card(g,true)).join('')||`<p class="rc-sub">${_T`Nobody on the bench.`}</p>`}</div>
   <div><div class="dhd">${_T`🤝 Out on loan`}</div>${out.map(g=>`<div class="dcard loan">${gArt(g,'xs')}<div><b>${esc(g.name)}</b><span class="rc-sub">${_T`at ${esc((mgrById(g.contract.mgr)||{}).ludus||'')} · ${g.loanFrom.fee}/wk · ${g.loanFrom.weeks} wk left`}</span></div></div>`).join('')||`<p class="rc-sub">${_T`Nobody.`}</p>`}
    <div class="dhd" style="margin-top:8px">${_T`🧲 Borrow a fighter`}</div>${lenders.length?`<select class="tin" data-m47borrow="1"><option value="">${_T`From a friendly house…`}</option>${lenders.flatMap(m=>depthOf(m).bench.filter(g=>!g.loanFrom&&!g.inj).map(g=>`<option value="${m.id}|${g.id}">${esc(m.ludus)} · ${esc(g.name)} (${effOvr(g)}) · ${loanFee(g)+2}/wk · 3 wk</option>`)).join('')}</select>`:`<p class="rc-sub">${_T`No friendly house will lend (opinion 30+, and never a rival).`}</p>`}</div></div></div>`}

{const _bo=buyOfferHTML;buyOfferHTML=function(){const w=W_();if(!w)return '';const t=MGR.tab; /* v0.50: letters and ledgers are read in Your ludus (loan letters also in Recruiting) — never over the Acta */
  if(t==='ludus')return qsCardHTML()+offersHTML()+_bo();
  if(t==='recruit'){const all=w.offers||[];w.offers=all.filter(o=>o.kind==='loan'||o.kind==='loanin');let h='';try{h=offersHTML()}finally{w.offers=all}return h}
  return ''}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-m47]');if(!b||typeof W_!=='function')return;const w=W_();if(!w)return;e.stopPropagation();const a=b.dataset.m47,id=b.dataset.id;
  if(a==='qsseen'&&w.qsLast)w.qsLast.seen=true;
  if(a==='offyes'||a==='offno'){const o=(w.offers||[]).find(x=>x.id===id);if(o){if(a==='offyes'){if(o.kind==='loan'){const g=gById(o.gid),m=mgrById(o.mid);lendTo(g,m,o.fee,o.weeks)}else if(!offerAccept(o))mToast(_T('That deal cannot go through any more.'))}
    w.offers=w.offers.filter(x=>x!==o)}}
  saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||typeof W_!=='function'||!W_())return;
  if(t.dataset.m47lend&&t.value){const g=gById(t.dataset.m47lend),m=mgrById(t.value);if(lendTo(g,m,loanFee(g),3)){saveWorld();MGR_REDRAW&&MGR_REDRAW()}}
  if(t.dataset.m47borrow&&t.value){const [mid,gid]=t.value.split('|');const g=gById(gid),m=mgrById(mid);if(borrowFrom(g,m,loanFee(g)+2,3)){saveWorld();MGR_REDRAW&&MGR_REDRAW()}}},true);
/* the lent fighter's owner still counts them as theirs in the league's eyes: they cannot be traded while away */

/* v1.05 (360-v105mw) · MANAGER — MATCH WEEK, the same information laid out cleaner (his N2 + picks 1–9 + mw1, B35d; tools/plans/v104/NOTES.md "N2",
   approved mock-up https://claude.ai/artifact/8ZvV1U2SAfnTUW557hMy5h). Display + flow only: bout logic, odds, payouts, ticket sales are unchanged.
   • BANNER slim (.mw105ban): city, "Match Week · week N" line, chips (road · omen · Grand Games · the road lock), the day tabs (bt85) in it, Walk the city
     square; "Your week at <city>" box at its upper right (.mw105wk, no treasury): entered · fees · your take · bets · verdicts · fought, the progress line,
     🛣 Set off for <city> (before the house leaves) · Simulate the rest (data-mg simall) · End the week (data-mw105="end"), the reason line.
     Playoffs (pick 8): a chip with your seed + spot in the Superbus; it scrolls to 355/358's bracket tree on the page (B21: no extra bracket buttons there).
   • BOUT CARDS (.mw105list > article.mw105b[data-mw105b=i]) in play order: the head is 296's "This week" row (.a1ev; built the same way when 296 has none,
     e.g. Superbus bouts); click the row / chevron [data-mw105t] to open it. Open + not fought = the old bout card restyled (tiles with a tickets bar, purse
     and the appearance fee only on the row — shown once), the betting table, the actions. Fought = a result card (place, house, CF, fate, your coin, bet slips,
     this bout's verdicts moved in from #pendbox). 17's "🏁 Match Week results" block (#nightRes) is folded into them and removed. The next bout opens itself
     after one ends (pick 2; B53: it folds to its result row, only the next is open, after the last all fold + scroll to top). "What changed" (table place, ratings, weeks out) ONLY in the week's summary once all are fought (pick 3; snapshot w.mw105s).
   • Pick 1: your fighter's HP / fatigue / morale on the bout row + a wound warning. Pick 4: ONE Watch button — the free board view when your fighter is in the
     bout, the stands (Spectate, seat fee) when he is not — REPLACES the separate 🎟 Spectate. Pick 5: ⚔ Rival chip in the betting table. Pick 6: value/trap
     badge on the odds + ★ best value, from yourRead105(g) (361-v105read; null = no badge). Pick 7: greyed buttons show why. Pick 9: phones = one card per fighter.
   • B35d: the stake lives in the Bet button — a small window (−/+, 5·10·25·50, pays, Place bet) — REPLACES the full-width "Your stake" row (.bstake), playoff
     bouts included. The bet still goes through 17's [data-mg="bet"] handler (hidden #mgStake<i>).
   • Betting table: "Your scouts" → "Your read" (cell from yourRead105 when it exists).
   • mw1: SET OFF — away weeks: before the first bout (Fight / Watch / Simulate / Simulate the rest) or 🛣 Set off, a window lists what is undone (108's
     leaveList76 + the Recruiter's hours); confirming sets travel.gone (108-v76 roadLocked76). Once on the road RECRUITING locks too (scouting, courting,
     offers; "Signed" own fighters stay open), with a note + reasons. The End-the-week confirm, on the road, names only the bouts it will simulate (End the week
     with bouts left simulates them first; verdicts still stop it).
   Kill switch localStorage flavius_v105aoff=1 (today's Match Week, no recruiting lock, no set-off window). Test tv105a. */
const MW105={key:null,open:new Set(),doneN:-1,pass:0,pop:null,stake:10,tag:0,scroll:null};
function mw105Off(){try{return localStorage.getItem('flavius_v105aoff')==='1'}catch(e){return false}}
const mw105Seq=n=>typeof any100Seq==='function'?any100Seq(n):n.bouts.map((b,i)=>i);
const mw105Sp=b=>typeof any100Sp==='function'&&any100Sp(b);
function mw105Own(w,b,id,mine){if(mine.has(id))return true;const A=mw105Sp(b)&&b.any100;const m=me();return !!(A&&((A.hire&&A.hire[id]&&A.hire[id].by===m.id)||(A.ed&&A.ed[id]===m.id)))}
function mw105NeedOff(w){w=w||W_();const n=w&&w.night;if(!n||n.bye||n.selfBye||w.tutorial||w.dead||mw105Off())return false;const t=n.travel;
  if(!t||!(t.cost>0)||t.gone||!t.paid)return false;return !n.bouts.every(b=>b.done)}
function mw105RecLocked(w){try{w=w||W_();return !mw105Off()&&!!w&&typeof roadLocked76==='function'&&roadLocked76(w)}catch(e){return false}}
function mw105Leave(w){let L=[];try{L=leaveList76(w)}catch(e){}try{const h=typeof rec99Left==='function'?rec99Left(w):0;if(h>0)L.push(_T`🤝 <b>${h}</b> of the Recruiter's hours unspent`)}catch(e){}return L}
const mw105PoLab=b=>{const p=b&&b.po104||{};return p.r==='fin'?_T('The final'):p.r==='sf'?(p.i?_T('Semifinal II'):_T('Semifinal I')):(p.i?_T('Bout B'):_T('Bout A'))};
const mw105Lab=b=>{if(b.po104)return mw105PoLab(b);let d='';try{d=typeof any100DayShort==='function'?any100DayShort(b):''}catch(e){}return (d+' '+((TIERS[b.tier]||{}).n||'')).trim()};
const mw105City=w=>{const L=LOCATIONS[(w||W_()).night.loc];return L?L.n:''};

/* ---------- the week's snapshot for "what changed" ---------- */
function mw105Pos(w){try{const L=leagueSort(w.mgrs.filter(x=>!x.sica));const i=L.findIndex(x=>x.isPlayer);return i>=0?i+1:0}catch(e){return 0}}
function mw105Snap(w){try{if(!w||!w.night||w.tutorial)return;if(w.mw105s&&w.mw105s.wk===w.week)return;if(w.night.bouts.some(b=>b.done))return;
  const o={};for(const g of rosterOf(me()))o[g.id]=effOvr(g);w.mw105s={wk:w.week,pos:mw105Pos(w),ovr:o}}catch(e){}}
{const base=applyBout;applyBout=function(){try{if(!mw105Off())mw105Snap(W_())}catch(e){}return base.apply(this,arguments)}}

/* ---------- index each bout card while nightHTML runs (296 re-orders the cards) ---------- */
{const base=boutSidesHTML;boutSidesHTML=function(b){const h=base.apply(this,arguments);try{if(MW105.tag){const n=W_().night;const i=n.bouts.indexOf(b);if(i>=0)return (h||'')+`<i class="mw105ix" hidden data-mw105i="${i}"></i>`}}catch(e){}return h}}
{const base=nightHTML;nightHTML=function(){MW105.tag=mw105Off()?0:1;try{return base.apply(this,arguments)}finally{MW105.tag=0}}}

/* ---------- pieces ---------- */
function mw105Cond(g){if(!g)return '';let H=null;try{H=hp90(g)}catch(e){}const f=typeof gFat==='function'?gFat(g):0;const mo=Math.round(g.morale||0);
  let warn='';if(g.inj&&!g.inj.war)warn=_T`🩹 ${esc(g.inj.label)}`;else if((g.severed||[]).length)warn=_T('🩸 A lost limb');else if(f>60)warn=_T('Worn: fights weaker, wounds more easily');
  return `<span class="mw105c">${H?`<span title="${_T('HP')}">❤ ${H.cur}/${H.def}</span>`:''}${typeof fatChip90==='function'?fatChip90(g):''}<span title="${_T('Morale')}">${_T`morale ${mo}`}</span></span>${warn?`<span class="mw105w" role="note">${warn}</span>`:''}`}
function mw105EntHTML(w,b,ids,mine){return `<div class="a1ent">${ids.map(id=>{const g=gById(id);return `<span class="a1ef">${gArt(g,'xs')}<span><b>${esc(g?g.name:'?')}</b><small>${_T('✓ entered')}</small></span></span>`}).join('')}</div>`}
function mw105HeadHTML(w,b,i,mine,tab){const E=EVENTS[b.ev]||{};const T=TIERS[b.tier]||{n:''};
  const dayT=tab?((tab.querySelector('.bt85d')||{}).textContent||'').replace('★','').trim():'';const slotT=tab?((tab.querySelector('b')||{}).textContent||'').trim():'';
  const kind=b.po104?_T('Superbus'):T.n;const ids=b.ents.filter(id=>mw105Own(w,b,id,mine));let size=b.ents.length;try{size=boutSize(b)}catch(e){}
  let seats='';try{seats=any100Seats(b,mine)}catch(e){}
  const act=ids.length?mw105EntHTML(w,b,ids,mine):`<div class="a1note">${_T('None of yours in this bout')}</div>`;
  return `<div class="a1ev mw105syn${ids.length?' mine':''}${b.done?' done':''}" data-a1i="${i}"><span class="a1day">${esc(dayT)}<small>${esc(slotT)}</small></span><span class="a1art">${cardHTML('e:'+b.ev,'sm')}</span>
    <div class="a1tt"><span class="a1tier">${esc(kind)}</span><b class="a1nm">${esc(E.n||'')}</b><div class="a1chips">${E.short?`<span class="a1c">${esc(E.short)}</span>`:''}</div></div>
    <div class="a1st">${seats}<div class="a1sn">${_T`${b.ents.length} of ${size}`}</div></div>
    <div class="a1mon"><div><span>${_T('Purse')}</span><b>${ICO.coin} ${b.purse}</b></div>${b.fee>0?`<div><span>${_T('Fee')}</span><b class="plus">+${b.fee}</b></div>`:''}</div><div class="a1act">${act}</div></div>`}
function mw105ResHTML(w,b){const R=b.res;if(!R)return `<div class="mw105res"><p class="rc-sub">${_T('Called off.')}</p><div class="mw105vd"></div></div>`;
  const h=R.house101;const take=h&&typeof h.tot==='number'?h.tot:null;const sg=v=>(v>=0?'+':'−')+coinAmt87(Math.abs(v));
  const li=[...R.rows].sort((a,c)=>(a.place||9)-(c.place||9)).map(r=>{const g=gById(r.gid);const gm=g&&g.contract?mgrById(g.contract.mgr):null;const mine=!!(gm&&gm.isPlayer);
    let sd=null;try{sd=boutSide(b,b.ents.indexOf(r.gid))}catch(e){}const pl=r.place?(['','🥇','🥈','🥉'][r.place]||_T`${r.place}th`):'—';
    const coin=mine&&h&&h.by&&typeof h.by[r.gid]==='number'?h.by[r.gid]:null;
    return `<li class="${mine?'me':''}${r.won?' won':''}"><span class="mw105pl">${pl}</span><span class="mw105nm"><b>${esc(g?g.name:r.name||'?')}</b>${mine?` <span class="mytag">${_T('YOURS')}</span>`:''}${sd?` <span class="sidetag" style="--sc:${sd.col}">${sd.n}</span>`:''}<small>${gm?esc(gm.ludus):_T('free agent')}</small></span><span class="mw105cf">${cfAmt87(r.f)}</span><span class="mw105ft">${boutFate(r)}${coin!=null?` <em class="h101">${sg(coin)}</em>`:''}</span></li>`}).join('');
  let bnet=0;const bets=(b.bets||[]).map(x=>{const won=R.winners.includes(x.gid);const pay=won?betPay(x.stake,x.odds).net:0;bnet+=pay-x.stake;const nm=esc((gById(x.gid)||{}).name||'?');
    return `<span class="betslip ${won?'won':'lost'}"><i>${won?'✓':'✗'}</i><b>${nm}</b><span>${coinAmt87(x.stake)} @ ${x.odds}×</span><em>${won?'+'+pay:'−'+x.stake}</em></span>`}).join('');
  return `<div class="mw105res"><div class="mw105rl"><span>${_T`${R.turns||'?'} turns`}</span>${R.att?`<span>${_T`🏟 ${houseK(R.att)} in the stands`}</span>`:''}${take!=null?`<span class="h101t">${_T`Your house took <b>${sg(take)}</b>`}</span>`:''}</div>
    <ol class="mw105pod">${li}</ol>${bets?`<div class="betslips"><span class="rc-sub">${_T('💰 Your wagers')}</span>${bets}<span class="betnet ${bnet>=0?'up':'dn'}">${_T`${bnet>=0?'+':'−'}${Math.abs(bnet)} coin`}</span></div>`:''}${R.reason?`<p class="rc-sub mw105rr">${esc(R.reason)}</p>`:''}<div class="mw105vd"></div></div>`}
function mw105ResTag(w,b,vd){const R=b.res;const win=R?R.winners.map(gById).filter(Boolean):[];const h=R&&R.house101;
  const sub=vd?_T('A verdict waits on your fighter'):h&&typeof h.tot==='number'?_T`Fought · your house ${h.tot>=0?'+':'−'}${coinAmt87(Math.abs(h.tot))}`:_T('Fought');
  return `<div class="mw105rt${vd?' vd':''}"><b>${win.length?_T`🏆 Won by ${win.map(g=>esc(g.name)).join(' & ')}`:_T('No winner')}</b><small>${sub}</small></div>`}
/* the read (361-v105read): null or {est, lo, hi, rough, src}; est/lo/hi are a RATING (effOvr scale), not a chance */
function mw105Read(g){try{if(typeof yourRead105!=='function')return undefined;const r=yourRead105(g);if(!r||r.est==null)return null;return r}catch(e){return null}}
const mw105Src=s=>typeof read105Name==='function'?read105Name(s):_T('your read');

/* the bout card's inside (not fought yet) */
function mw105Card(c,w,b,i,myIn){const m=me();
  /* tiles: purse + the appearance/entry fee live on the row */
  const pu=c.querySelector('.bstat.purse');if(pu){const fe=pu.nextElementSibling;if(fe&&fe.classList.contains('bstat'))fe.remove();pu.remove()}
  const tx=c.querySelector('.bstat.tix');if(tx){let S2=null;try{S2=boutSales(b)}catch(e){}if(S2&&S2.cap){const p=Math.max(0,Math.min(100,Math.round(S2.sold/S2.cap*100)));tx.insertAdjacentHTML('beforeend',`<span class="mw105bar" aria-hidden="true"><i style="width:${p}%"></i></span>`)}}
  /* B35d: no stake row; the hidden input keeps 17's bet handler */
  const sk=c.querySelector('.bstake');if(sk)sk.remove();if(!c.querySelector('#mgStake'+i))c.insertAdjacentHTML('beforeend',`<input type="hidden" id="mgStake${i}" value="${Math.min(MW105.stake,Math.max(1,m.coin))}">`);
  /* the betting table */
  const tb=c.querySelector('table.tally');if(tb){const rows=[...tb.querySelectorAll('tr')];const hr=rows.find(r=>r.querySelector('th'));const heads=hr?[...hr.children].map(x=>x.textContent.replace('ⓘ','').trim()):[];
    const rc=heads.findIndex(x=>x===_T('Your scouts')||x===_T('Your read'));if(hr&&rc>=0){const th=hr.children[rc];th.textContent=_T('Your read');th.title=_T('Your read: from walking the sand, your recruiting dossier, or watching him fight. Value: your chance beats the odds. Trap: it falls short.');heads[rc]=_T('Your read')}
    const oc=heads.findIndex(x=>x===_T('Odds'));const bc=heads.findIndex(x=>x===_T('Bet'));const kc=heads.findIndex(x=>x===_T('Book'));const lc=heads.findIndex(x=>x===_T('Ludus'));
    const foe=(()=>{try{return rivalOf(w,m.id)}catch(e){return null}})();let best=null;const R2=[];let PR=null;try{const od=boutOdds(b),inv=od.map(o=>1/o),z=inv.reduce((a,c)=>a+c,0)||1;PR={mine:boutProbs(b,'mine'),imp:inv.map(v=>v/z)}}catch(e){}
    for(const tr of rows){if(tr===hr)continue;[...tr.children].forEach((td,k)=>{if(heads[k])td.dataset.l=heads[k]});
      const bt=tr.querySelector('[data-mg="bet"]');if(!bt)continue;const [,gid,odds]=bt.dataset.id.split('|');const g=gById(gid);if(!g)continue;const gm=g.contract?mgrById(g.contract.mgr):null;
      /* pick 5: rival chip */
      if(gm&&!gm.isPlayer&&lc>=0&&((foe&&foe.id===gm.id)||(gm.rivalry||0)>=35)){const t=tr.children[lc];if(t)t.insertAdjacentHTML('beforeend',` <span class="mw105rv" title="${esc(rivalTier(gm.rivalry||0))}">${_T('⚔ Rival')}</span>`)}
      /* the read + pick 6 */
      const rd=mw105Read(g);if(rd!==undefined&&rc>=0){const td=tr.children[rc];if(td)td.innerHTML=rd?`<span class="mw105rd${rd.rough?' rough':''}" title="${rd.rough&&rd.lo!=null&&rd.hi!=null?`${rd.lo}–${rd.hi} · `:''}${esc(mw105Src(rd.src))}">${rd.rough?'~':''}${Math.round(rd.est)}</span>`:`<span class="rc-sub" title="${_T('Walk the sand at the arena gate, scout him in Recruiting or watch him fight to read him')}">${_T('no read')}</span>`;
        /* value / trap: YOUR chance (boutProbs 'mine', which uses the reads) against the chance the posted odds imply (1/odds, the book's margin taken out) */
        if(rd&&PR){const k=b.ents.indexOf(gid);if(k>=0&&PR.mine[k]!=null&&PR.imp[k]!=null){const edge=PR.mine[k]-PR.imp[k];R2.push({tr,edge,oc});if(edge>=0.05&&(!best||edge>best.edge))best={tr,edge}}}}
      /* bet label: what is already on him */
      const on=(b.bets||[]).filter(x=>x.gid===gid).reduce((a,x)=>a+x.stake,0);if(on){bt.classList.add('mw105on');bt.innerHTML=_T`Bet ${on}`}}
    for(const x of R2){const td=x.tr.children[x.oc];if(!td)continue;if(x.edge>=0.05)td.insertAdjacentHTML('beforeend',` <span class="badge good mw105vb" title="${_T('Your chance beats the odds: they pay too much.')}">${_T('▲ value')}</span>`);
      else if(x.edge<=-0.05)td.insertAdjacentHTML('beforeend',` <span class="badge bad mw105vb" title="${_T('The public flatters him: the odds pay too little.')}">${_T('▼ trap')}</span>`)}
    if(best){best.tr.classList.add('mw105best');const td=best.tr.children[oc];if(td)td.insertAdjacentHTML('beforeend',` <span class="mw105bv">${_T('★ best value')}</span>`)}
    tb.classList.add('mw105tb')}
  /* pick 4: one Watch button */
  const acts=c.querySelector('.acts');if(acts){const wa=acts.querySelector('[data-mg="watch"]'),sp=acts.querySelector('[data-mg="spect"]');
    if(myIn||!sp){if(sp)sp.remove();if(wa)wa.innerHTML=_T('👁 Watch')}
    else{if(wa)wa.remove();const fee=({under:3,feature:6,main:12})[b.tier]||6;sp.innerHTML=_T`👁 Watch<small>${coinAmt87(fee)} · a seat in the stands</small>`}
    const rank=e=>{const a=e.dataset&&e.dataset.mg;return a==='fight'?0:(a==='watch'||a==='spect')?1:a==='sim'?2:3};
    const kids=[...acts.children];kids.sort((x,y)=>rank(x)-rank(y));for(const k of kids)acts.appendChild(k);const sim=acts.querySelector('[data-mg="sim"]');if(sim){sim.classList.remove('primary')}
    const k3=[...acts.children].find(e=>rank(e)===3);if(k3)k3.insertAdjacentHTML('beforebegin','<span class="mw105sp"></span>');acts.classList.add('mw105acts')}}

/* pick 7: a greyed button says why */
function mw105Why(root){for(const bt of root.querySelectorAll('[data-dis]')){const why=bt.dataset.dis;if(!why||bt.querySelector('.mw105y'))continue;
  if(bt.matches('[data-mg="bet"]')){bt.innerHTML=`🔒<small class="mw105y">${_T('fixed')}</small>`;continue}
  for(const s of bt.querySelectorAll('small'))s.remove();bt.insertAdjacentHTML('beforeend',`<small class="mw105y">${esc(why)}</small>`);bt.classList.add('mw105dis')}}

/* the "Your week" box */
function mw105BoxHTML(w,seq,mine){const n=w.night,m=me();const B=n.bouts;const left=seq.filter(i=>!B[i].done);const pend=(w.pend||[]).length;const city=mw105City(w);
  let ent=0,fees=0,take=0,anyTake=false,staked=0,net=0,anyNet=false;
  for(const b of B){const ids=b.ents.filter(id=>mine.has(id));if(ids.length)ent++;if(mw105Sp(b)){const P=b.any100.paid||{};for(const id of Object.keys(P))if(mw105Own(w,b,id,mine))fees-=+P[id]||0}else fees+=(b.fee||0)*ids.length;
    if(b.done&&b.res&&b.res.house101){take+=b.res.house101.tot||0;anyTake=true}
    for(const x of b.bets||[]){if(!b.done)staked+=x.stake;else{anyNet=true;net+=(b.res&&b.res.winners.includes(x.gid)?betPay(x.stake,x.odds).net:0)-x.stake}}}
  const sg=v=>(v>=0?'+':'−')+Math.abs(v);
  const T=[[_T('Entered'),_T`${ent} of ${B.length}`,''],[_T('Fees'),fees?sg(fees):'—',fees>0?'up':fees<0?'dn':''],[_T('Your take'),anyTake?sg(take):'—',anyTake?(take>=0?'up':'dn'):''],
    [_T('Bets'),staked||anyNet?[staked?_T`${staked} on`:'',anyNet?sg(net):''].filter(Boolean).join(' · '):'—',anyNet?(net>=0?'up':'dn'):''],[_T('Verdicts'),pend?_T`${pend} waiting`:B.some(b=>b.done)?_T('none'):'—',pend?'wt':''],
    [_T('Fought'),_T`${B.length-left.length} of ${B.length}`,'']];
  const nx=left[0]!=null?B[left[0]]:null;let nxl='';if(nx){nxl=mw105Lab(nx)}
  const prog=left.length?_T`${B.length-left.length} of ${B.length} fought · next: ${esc(nxl)}`:_T('All fought.');
  const off=mw105NeedOff(w);const simDis=left.length?'':`data-dis="${esc(_T('Every bout is fought.'))}"`;
  const endWhy=pend?_T`Settle ${pend} verdict${pend===1?'':'s'} first.`:'';const endDis=endWhy?`data-dis="${esc(endWhy)}"`:'';
  const note=endWhy?'':left.length?_T`End the week simulates the ${left.length} bout${left.length===1?'':'s'} left.`:roadLocked76(w)?_T('Ready: wages are paid and the house goes home.'):_T('Ready: wages are paid.');
  return `<section class="mw105wk" aria-label="${_T('Your week')}"><div class="mw105wh"><b>${_T`Your week at ${esc(city)}`}</b><span>${prog}</span></div>
    <div class="mw105ti">${T.map(([k,v,c])=>`<div class="${c}"><i>${k}</i><b>${v}</b></div>`).join('')}</div>
    ${off?`<button type="button" class="btn primary mw105off" data-mw105="off">${_T`🛣 Set off for ${esc(city)}`}<small>${_T('the Yard, the Infirmary and Recruiting shut until the week ends')}</small></button>`:''}
    <div class="mw105ba"><button type="button" class="mw105sb" data-mg="simall" ${simDis}>${_T('Simulate the rest')}</button><button type="button" class="btn ${off?'':'primary'}" data-mw105="end" ${endDis}>${_T('End the week')}</button></div>
    <div class="mw105nt${endWhy?' wt':!left.length?' ok':''}">${endWhy||note}</div></section>`}

/* pick 8: the Superbus spot */
function mw105PoChip(w,n){try{if(typeof OFF104==='undefined')return '';const ph=OFF104.phase(w);if(!/^(r1|sf|fin)$/.test(ph))return '';const P=w.po104;if(!P)return '';const m=me();
  const seed=(P.seeds||[]).indexOf('m:'+m.id)+1;const rd={r1:_T('Round 1'),sf:_T('Semifinals'),fin:_T('The final')}[ph];
  const mine=new Set(rosterOf(m).map(g=>g.id));let bi=n.bouts.findIndex(b=>b.po104&&(b.po104.k||[]).includes('m:'+m.id));if(bi<0)bi=n.bouts.findIndex(b=>b.po104&&b.ents.some(id=>mine.has(id)));
  let spot;if(bi>=0)spot=_T`your house in ${mw105PoLab(n.bouts[bi])}`;
  else if(!seed)spot=_T('not seeded');else if(ph==='r1'&&seed<=4)spot=_T('rests this round');else spot=_T('out');
  return `<button type="button" class="mw105chip mw105po" data-mw105="tree" title="${_T('To the bracket')}">${_T`🏛 Superbus · ${rd}`}${seed?_T` · seed #${seed}`:''} · ${spot}</button>`}catch(e){return ''}}

/* ---------- the page ---------- */
function mw105Shape(T,w){const n=w.night,m=me();const C=T.content;const Q=s=>C.querySelector(s),QA=s=>[...C.querySelectorAll(s)];
  const pane=Q('#mgrPane'),hd=Q('.roomhd.b73-night');if(!pane||!hd)return false;const cards=QA('#mgrPane .card2.bout');if(!cards.length)return false;
  const seq=mw105Seq(n);const byI=new Map();cards.forEach((c,k)=>{const x=c.querySelector('[data-mw105i]');const i=x?+x.dataset.mw105i:seq[k];for(const y of c.querySelectorAll('[data-mw105i]'))y.remove();if(n.bouts[i]&&!byI.has(i))byI.set(i,c)});
  const order=seq.filter(i=>byI.has(i));const mine=new Set(rosterOf(m).map(g=>g.id));const B=n.bouts;
  /* which bouts are open: only the next to fight (B53: a finished bout folds to its result row; after the last, all are folded and the page scrolls to the top) */
  const key=w.id+':'+w.week;const doneN=B.filter(b=>b.done).length;
  if(MW105.key!==key){MW105.key=key;MW105.doneN=-1}
  if(MW105.doneN!==doneN){const nx=order.find(i=>!B[i].done);const done=order.filter(i=>B[i].done);const last=done.length?done[done.length-1]:null;
    if(MW105.doneN>=0&&doneN>MW105.doneN&&nx==null)MW105.scroll='top';MW105.open=new Set();if(nx!=null)MW105.open.add(nx);MW105.doneN=doneN}
  /* verdict rows → their bout */
  const pv=new Map();for(const r of QA('#pendbox .lrow')){const t=r.querySelector('[id^="pend"]');const pi=t?+t.id.slice(4):-1;const P=(w.pend||[])[pi];if(!P)continue;
    const bi=[...order].reverse().find(i=>B[i].done&&B[i].ents.includes(P.gid));if(bi==null)continue;if(!pv.has(bi))pv.set(bi,[]);pv.get(bi).push(r)}
  const heads=new Map(QA('#any100wk .a1ev[data-a1i]').map(e=>[+e.dataset.a1i,e]));const tabs=new Map(QA('.roomhd.b73-night [data-bt85]').map(e=>[+e.dataset.bt85,e]));
  const list=document.createElement('div');list.className='mw105list';cards[0].parentNode.insertBefore(list,cards[0]);let spg=false;
  for(const i of order){const b=B[i],c=byI.get(i);const sp=mw105Sp(b);const ids=b.ents.filter(id=>mw105Own(w,b,id,mine));const myIn=ids.length>0;const vd=pv.get(i)||[];
    if(sp&&!spg){spg=true;list.insertAdjacentHTML('beforeend',`<div class="mw105g">${_T('★ Headline specials')}</div>`)}
    const open=MW105.open.has(i)||vd.length>0;const art=document.createElement('article');art.className=`mw105b${myIn?' mine':''}${b.done?' done':''}${sp?' spc':''}${open?' open':''}${vd.length?' vd':''}`;art.dataset.mw105b=i;
    let head=heads.get(i);if(!head){const t=document.createElement('template');t.innerHTML=mw105HeadHTML(w,b,i,mine,tabs.get(i));head=t.content.firstElementChild}
    /* chips from the card into the row */
    const chips=head.querySelector('.a1chips');const tt=c.querySelector('.bouttitle');if(chips&&tt){for(const x of tt.querySelectorAll('.nt91,.eg99'))chips.appendChild(x.cloneNode(true));if(!sp)for(const x of tt.querySelectorAll('.nocf96c'))chips.appendChild(x.cloneNode(true))}
    const act=head.querySelector('.a1act');
    if(b.done){if(act)act.innerHTML=mw105ResTag(w,b,vd.length>0)}
    else if(act){const efs=[...act.querySelectorAll('.a1ef')];efs.forEach((ef,k)=>{const id=ids[k];if(!id||!mine.has(id))return;const sp2=ef.querySelector(':scope > span:last-child')||ef;sp2.insertAdjacentHTML('beforeend',mw105Cond(gById(id)))})}
    art.appendChild(head);art.insertAdjacentHTML('beforeend',`<button type="button" class="mw105tg" data-mw105t="${i}" aria-expanded="${open}" aria-label="${open?_T('Close this bout'):_T('Open this bout')}"><span aria-hidden="true">▾</span></button>`);
    const bd=document.createElement('div');bd.className='mw105bd';
    if(b.done){bd.innerHTML=mw105ResHTML(w,b);const v=bd.querySelector('.mw105vd');for(const r of vd)v.appendChild(r);if(!vd.length)v.remove();c.hidden=true;bd.appendChild(c)}
    else{mw105Card(c,w,b,i,myIn);bd.appendChild(c)}
    if(!open)bd.hidden=true;art.appendChild(bd);list.appendChild(art)}
  /* folded / moved */
  const pb=Q('#pendbox');if(pb&&!pb.querySelector('.lrow'))pb.remove();
  const nr=Q('#nightRes');if(nr)nr.remove();for(const x of QA('#mgrPane .mbtns'))if(x.querySelector('[data-mg="simall"]'))x.remove();
  const wk=Q('#any100wk');if(wk){const ft=wk.querySelector('.a1ft');if(ft){ft.classList.add('mw105ft');list.appendChild(ft)}wk.remove()}
  /* pick 3: what changed — only once the week is fought */
  if(B.every(b=>b.done))list.insertAdjacentHTML('beforeend',mw105SumHTML(w));
  /* banner */
  const L=document.createElement('div');L.className='mw105L';hd.insertBefore(L,hd.firstElementChild&&hd.firstElementChild.tagName==='svg'?hd.firstElementChild.nextSibling:hd.firstChild);
  const ttl=hd.querySelector('.roomttl');if(ttl)L.appendChild(ttl);
  const ch=[];const t=n.travel;const city=mw105City(w);
  if(t&&t.cost>0){if(t.deal){const hh=mgrById(t.deal.mgr);ch.push(_T`🛣 From ${esc(t.from)} · the trip paid by ${esc(hh?hh.ludus:_T('another house'))}`)}else if(t.paid)ch.push(t.gone?_T`🛣 On the road from ${esc(t.from)} · trip ${coinAmt87(t.cost)}`:_T`🛣 Booked for ${esc(city)} from ${esc(t.from)} · trip ${coinAmt87(t.cost)}`)}
  else if(t&&!n.selfBye&&!w.tutorial&&!B.some(b=>b.po104))ch.push(_T('🏠 Home sand'));
  if(n.omen&&n.omen.k!=='clear')ch.push(`${esc(n.omen.n)} · ${n.omen.att>0?_T('attendance and purses up'):n.omen.att<0?_T('attendance and purses down'):_T('the city talks of little else')}`);
  if(n.grand)ch.push(_T('The Grand Games: purses ×1.6'));
  if(roadLocked76(w))ch.push(_T('🔒 Yard, Infirmary and Recruiting shut until the week ends'));
  L.insertAdjacentHTML('beforeend',`<div class="mw105chips">${ch.map(x=>`<span class="mw105chip">${x}</span>`).join('')}${mw105PoChip(w,n)}</div>`);
  {const mi=Q('#mgrPane .travelcard .mi100tr');if(mi){const cc=L.querySelector('.mw105chips');cc.insertBefore(mi,cc.firstChild)}} /* 295's map inset (home → host) rides in the banner */
  const rw=document.createElement('div');rw.className='mw105row';L.appendChild(rw);const st=hd.querySelector('.roomstat');if(st)rw.appendChild(st);const wb=hd.querySelector('.walk96');if(wb)rw.appendChild(wb);
  for(const x of [...hd.children])if(x!==L&&x.tagName!=='svg'&&!x.classList.contains('mw105wk'))L.appendChild(x);
  hd.insertAdjacentHTML('beforeend',mw105BoxHTML(w,order,mine));hd.classList.add('mw105ban');
  /* the road strip: only when it still holds a button (sit out, an unpaid road, a deal) */
  const sp=Q('#mgrPane .travelcard');if(sp&&!sp.querySelector('button,[data-mg],.ask96')){sp.remove()}
  else if(sp&&t&&t.paid){for(const x of sp.querySelectorAll(':scope > .rc-sub,:scope > b,:scope > .mi100tr'))if(!x.querySelector('button,[data-mg]'))x.remove()}
  const wl=Q('#mgrPane p.wkline');if(wl){for(const x of wl.querySelectorAll('input'))pane.appendChild(x);wl.remove()}
  mw105Why(list);pane.classList.add('mw105p');return true}
function mw105SumHTML(w){const m=me();const S=w.mw105s&&w.mw105s.wk===w.week?w.mw105s:null;const L=[];
  const pos=mw105Pos(w);if(S&&S.pos&&pos&&!w.night.bouts.some(b=>b.po104))L.push(S.pos===pos?_T`📊 The table: still ${pos}${['th','st','nd','rd'][pos%10>3||[11,12,13].includes(pos%100)?0:pos%10]}`:_T`📊 The table: ${S.pos} → <b>${pos}</b>`);
  if(S)for(const g of rosterOf(m)){const a=S.ovr[g.id];const b=effOvr(g);if(a!=null&&a!==b)L.push(_T`${b>a?'📈':'📉'} ${esc(g.name)}: rating ${a} → <b>${b}</b>`)}
  for(const g of rosterOf(m))if(g.inj&&!g.inj.war){const wk=Math.max(1,(g.inj.until||w.week)-w.week);L.push(_T`🩹 ${esc(g.name)}: ${esc(g.inj.label)} · out ${wk} week${wk===1?'':'s'}`)}
  return `<section class="mw105sum"><b>${_T`Week ${wkOf(w.week)} · what changed`}</b>${L.length?`<ul>${L.map(x=>`<li>${x}</li>`).join('')}</ul>`:`<p class="rc-sub">${_T('No change in the table, nobody hurt.')}</p>`}</section>`}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{mw105PopClose();if(mw105Off()||typeof h!=='string'||MGR.tab!=='night'||h.indexOf('b73-night')<0)return h;
  const w=W_();if(!w||!w.night||w.night.bye||w.tutorial||(w.special&&!w.special.done)||!w.night.bouts||!w.night.bouts.length)return h;mw105Snap(w);
  const T=document.createElement('template');T.innerHTML=h;if(!mw105Shape(T,w))return h;
  if(MW105.scroll==='top'){MW105.scroll=null;setTimeout(()=>{const rm=typeof reduceMotion==='function'&&reduceMotion();try{window.scrollTo({top:0,behavior:rm?'auto':'smooth'});for(const e of [document.querySelector('#mgrBody'),document.querySelector('#mgrPane')])if(e&&e.scrollTop)e.scrollTo({top:0,behavior:rm?'auto':'smooth'})}catch(e){}if(!rm)setTimeout(()=>{try{if(window.scrollY>4&&document.querySelector('#mgrBody .mw105ban'))window.scrollTo({top:0,behavior:'auto'})}catch(e){}},900)},60)}
  else if(MW105.scroll!=null){const i=MW105.scroll;MW105.scroll=null;setTimeout(()=>{const a=document.querySelector(`#mgrBody [data-mw105b="${i}"]`);if(a)a.scrollIntoView({block:'start'})},60)}
  return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------- clicks ---------- */
function mw105Redraw(){if(typeof MGR_REDRAW==='function')MGR_REDRAW()}
function mw105Toggle(i){if(MW105.open.has(i))MW105.open.delete(i);else MW105.open.add(i);mw105Redraw()}
async function mw105SetOffAsk(w,btn){const city=mw105City(w);const L=mw105Leave(w);
  const v=await ask76(_T`🛣 Set off for ${esc(city)}?`,`${_T`Once the house sets off for <b>${esc(city)}</b>, the Training Yard, the Infirmary and Recruiting are shut until the week ends.`}${L.length?`${_T(' Still undone:')}<ul class="leave76">${L.map(x=>`<li>${x}</li>`).join('')}</ul><span class="rc-sub">${_T('Anything you already booked still runs.')}</span>`:''}`,_T('🛣 Set off'),_T('Stay and finish'));
  return v}
function mw105Go(w){const t=w.night.travel;if(t&&t.paid&&t.cost>0&&!t.gone){t.gone=true;try{tnews(_T`🛣 ${esc(me().ludus)} sets off for ${esc(mw105City(w))}.`)}catch(e){}try{saveWorld()}catch(e){}}}
function mw105Reclick(btn,sel){const nb=btn&&btn.isConnected?btn:document.querySelector(sel);if(!nb)return;MW105.pass=1;try{nb.click()}finally{MW105.pass=0}}
const MW105_START='[data-mg="fight"],[data-mg="watch"],[data-mg="sim"],[data-mg="spect"],[data-mg="simall"],[data-mg="underdog"],[data-mg="city"]';
const REC105='[data-rec98a],[data-rec98p],[data-rec74],[data-mg="visit"],[data-mg="gift2"],[data-mg="pitch"],[data-mg="offer"],[data-mg="poach"],[data-mg="scout"],[data-mg="sign"],[data-m48="cartbuy"],[data-of104x]';
const mw105RecWhy=w=>_T`🛣 On the road to ${esc(mw105City(w))} — Recruiting reopens when the week ends.`;
window.addEventListener('click',e=>{if(MW105.pass||mw105Off())return;const el=e.target.closest&&e.target.closest('button,[data-mw105t],[data-bt85],.mw105b > .a1ev,[role="button"]');if(!el||!el.closest('#mgrBody'))return;
  const w=typeof W_==='function'&&W_();if(!w||!w.night)return;const stop=()=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()};
  /* recruiting shut on the road */
  if(MGR.tab==='recruit'&&el.matches(REC105)&&el.closest('#mgrPane')&&mw105RecLocked(w)){stop();mToast(mw105RecWhy(w));return}
  if(MGR.tab!=='night')return;
  /* the day tabs open their bout */
  const tb=el.closest('.mw105ban [data-bt85]');if(tb){stop();const i=+tb.dataset.bt85;MW105.open.add(i);mw105Redraw();setTimeout(()=>{const a=document.querySelector(`#mgrBody [data-mw105b="${i}"]`);if(a)a.scrollIntoView({block:'start',behavior:typeof reduceMotion==='function'&&reduceMotion()?'auto':'smooth'})},40);return}
  const tg=el.closest('[data-mw105t]');if(tg){stop();mw105Toggle(+tg.dataset.mw105t);return}
  if(el.matches('.mw105b > .a1ev')){if(e.target.closest('button,select,input,a,[data-any100],[data-card],.a1act'))return;stop();mw105Toggle(+el.closest('.mw105b').dataset.mw105b);return}
  if(el.dataset&&el.dataset.dis)return;
  /* B35d: Bet opens the stake window */
  if(el.matches('[data-mg="bet"]')&&el.closest('.mw105b')){stop();mw105Pop(el);return}
  if(el.matches('[data-mw105="tree"]')){stop();const t=document.querySelector('#mgrBody .v104top')||document.querySelector('#mgrBody .po104bk');if(t)t.scrollIntoView({block:'start',behavior:typeof reduceMotion==='function'&&reduceMotion()?'auto':'smooth'});else if(typeof po104Open==='function')po104Open();return}
  /* End the week */
  if(el.matches('[data-mw105="end"]')){stop();const left=w.night.bouts.some(b=>!b.done);if(!left){const r=weekReady();if(!r.ok){mToast(r.why);return}}if((w.pend||[]).length)return;MGR.confirmEnd=true;mw105Redraw();const bx=document.getElementById('mBody');if(bx)bx.scrollTop=0;return}
  /* mw1: setting off (B60: walking the host city's square counts as leaving, so it asks first) */
  const sel=el.matches('[data-mw105="off"]')?'off':el.matches(MW105_START)?'start':null;if(!sel||MGR.busy)return;
  if(!mw105NeedOff(w)){if(sel==='off'){stop();mw105Redraw()}return}
  const L=mw105Leave(w);if((!L.length||!e.isTrusted)&&sel==='start'){mw105Go(w);return}
  stop();const a=el.dataset.mg,id=el.dataset.id;mw105SetOffAsk(w,el).then(v=>{if(!v)return;mw105Go(w);if(sel==='off'){mToast(_T`🛣 The house sets off for <b>${esc(mw105City(w))}</b>.`);mw105Redraw();return}
    mw105Reclick(el,`#mgrBody [data-mg="${a}"]${id!=null?`[data-id="${id}"]`:''}`)})},true);
/* the travel buttons: this window instead of 108's "Before you leave" (Recruiting named too) */
window.addEventListener('click',e=>{if(MW105.pass||mw105Off())return;const b=e.target.closest&&e.target.closest('[data-mg="travelpay"],[data-mg="traveldeal"]');if(!b||b.disabled||!b.closest('#mgrBody')||(typeof LEAVE76!=='undefined'&&LEAVE76.ok))return;
  const w=typeof W_==='function'&&W_();if(!w||w.tutorial||!w.night)return;const t=w.night.travel;if(!t||!(t.cost>0)||t.gone)return;const L=mw105Leave(w);if(!L.length)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const sel=`#mgrBody [data-mg="${b.dataset.mg}"]`;
  mw105SetOffAsk(w,b).then(v=>{if(!v)return;if(typeof LEAVE76!=='undefined')LEAVE76.ok=1;mw105Reclick(b,sel)})},true);
/* End the week with bouts left: simulate them first (verdicts still stop it) */
window.addEventListener('click',async e=>{if(MW105.pass||mw105Off())return;const b=e.target.closest&&e.target.closest('[data-mg="endweek"]');if(!b||!b.closest('#mgrBody'))return;
  const w=typeof W_==='function'&&W_();if(!w||!w.night||w.night.bye||MGR.busy)return;const n=w.night;if(!n.bouts.some(x=>!x.done)||(w.special&&!w.special.done))return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();MGR.busy=true;try{mw105Go(w);for(const i of mw105Seq(n))if(!n.bouts[i].done)await runBoutSim(i)}finally{MGR.busy=false}
  if((w.pend||[]).length||!weekReady().ok){MGR.confirmEnd=false;mw105Redraw();mToast(_T('Verdicts are waiting on Match Week — settle them, then end the week.'));return}
  mw105Reclick(b,'#mgrBody [data-mg="endweek"]')},true);

/* ---------- the stake window (B35d) ---------- */
function mw105PopClose(){const p=MW105.pop;if(!p)return;MW105.pop=null;try{p.el.remove()}catch(e){}document.removeEventListener('keydown',p.key,true);document.removeEventListener('mousedown',p.out,true)}
function mw105Pop(btn){mw105PopClose();const [bi,gid,odds]=btn.dataset.id.split('|');const m=me();const g=gById(gid);const lim=betMaxStake(+odds,m.coin);if(m.coin<1){mToast(_T('The treasury is empty.'));return}
  const el=document.createElement('div');el.className='mw105pop';el.setAttribute('role','dialog');el.setAttribute('aria-label',_T('Your bet'));
  const P={el,bi,gid,odds:+odds,btn,stake:Math.max(1,Math.min(lim,MW105.stake||10))};
  const paint=()=>{const pay=betPay(P.stake,P.odds).net;el.innerHTML=`<div class="mw105ph">${_T`Bet on <b>${esc(g?g.name:'?')}</b> · ${odds}×`}</div>
    <div class="mw105ps"><button type="button" class="btn" data-mw105p="-5" aria-label="${_T('Lower the stake by 5')}">−</button><output aria-live="polite">${P.stake}</output><button type="button" class="btn" data-mw105p="5" aria-label="${_T('Raise the stake by 5')}">+</button></div>
    <div class="mw105pq">${[5,10,25,50].map(v=>`<button type="button" class="btn${v>lim?' off':''}" data-mw105q="${v}" ${v>lim?'disabled':''}>${v}</button>`).join('')}</div>
    <div class="mw105pp">${_T`pays ${coinAmt87(pay)} if he wins`}${lim<m.coin?_T` · at most ${lim} at these odds`:''}</div>
    <div class="mw105pb"><button type="button" class="btn" data-mw105x="1">${_T('Cancel')}</button><button type="button" class="btn primary" data-mw105go="1">${_T('Place bet')}</button></div>`};
  paint();document.body.appendChild(el);
  const place=()=>{const r=btn.getBoundingClientRect();const pw=el.offsetWidth,ph=el.offsetHeight;const vw=window.innerWidth,vh=window.innerHeight;
    if(vw<=600){el.classList.add('sheet');return}let x=Math.min(vw-pw-8,Math.max(8,r.right-pw));let y=r.bottom+6;if(y+ph>vh-8)y=Math.max(8,r.top-ph-6);el.style.left=x+'px';el.style.top=y+'px'};place();
  el.addEventListener('click',ev=>{const t=ev.target.closest('button');if(!t)return;ev.stopPropagation();
    if(t.dataset.mw105p){P.stake=Math.max(1,Math.min(lim,P.stake+(+t.dataset.mw105p)));paint();return}
    if(t.dataset.mw105q){P.stake=Math.max(1,Math.min(lim,+t.dataset.mw105q));paint();return}
    if(t.dataset.mw105x){mw105PopClose();try{btn.focus()}catch(e){}return}
    if(t.dataset.mw105go){const inp=document.getElementById('mgStake'+bi);MW105.stake=P.stake;mw105PopClose();if(inp)inp.value=P.stake;mw105Reclick(btn,`#mgrBody [data-mg="bet"][data-id="${btn.dataset.id}"]`)}});
  P.key=ev=>{if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();mw105PopClose();try{btn.focus()}catch(e){}}};P.out=ev=>{if(!el.contains(ev.target)&&ev.target!==btn)mw105PopClose()};
  document.addEventListener('keydown',P.key,true);document.addEventListener('mousedown',P.out,true);MW105.pop=P;setTimeout(()=>{const go=el.querySelector('[data-mw105go]');if(go)go.focus()},20)}

/* ---------- the End-the-week confirm: on the road it names only the bouts it simulates ---------- */
{const base=endConfirmHTML;endConfirmHTML=function(){let h=base.apply(this,arguments);try{if(mw105Off())return h;const w=W_();const n=w&&w.night;if(!n||n.bye)return h;
  const T=document.createElement('template');T.innerHTML=h;const C=T.content;
  if(roadLocked76(w)){for(const x of C.querySelectorAll('.skiplist'))x.remove();for(const p of C.querySelectorAll('p.rc-sub'))if(/^\s*(⏳|🎓)/.test(p.textContent))p.remove()}
  const left=mw105Seq(n).filter(i=>!n.bouts[i].done);
  if(left.length){const nm=i=>esc(mw105Lab(n.bouts[i]));
    const at=C.querySelector('.acts');const p=document.createElement('p');p.className='mw105sim';p.innerHTML=_T`⚡ Simulated first: ${left.map(nm).join(' · ')}`;if(at)at.parentNode.insertBefore(p,at)}
  return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------- Recruiting on the road ---------- */
{const base=recruitHTML;recruitHTML=function(){const h=base.apply(this,arguments);try{const w=W_();if(!mw105RecLocked(w)||MGR.filter==='mine'||MGR.filter==='signed')return h;
  const T=document.createElement('template');T.innerHTML=h;const why=mw105RecWhy(w).replace(/<[^>]+>/g,'');
  for(const b of T.content.querySelectorAll(REC105)){b.dataset.dis=why;b.classList.add('off');b.setAttribute('aria-disabled','true')}
  return `<div class="card2 lock76 mw105rl">${_T`🛣 <b>On the road to ${esc(mw105City(w))}.</b> Recruiting is shut until the week ends — offers already made still get their answer.`}</div>${T.innerHTML}`}catch(e){console.error(e);return h}}}
if(typeof hr99Sync==='function'){const base=hr99Sync;hr99Sync=function(){const r=base.apply(this,arguments);try{const w=W_();if(mw105RecLocked(w)){const c=document.querySelector('.mtabs [data-mg="tab"][data-id="recruit"] .mcount.hr99');if(c){if(c.textContent!==_T('🛣 Away'))c.textContent=_T('🛣 Away');c.title=mw105RecWhy(w).replace(/<[^>]+>/g,'')}}}catch(e){}return r}}

/* ---------- styles (mock-up: slim banner, cards, tiles) ---------- */
{const st=document.createElement('style');st.textContent=`
#mgrBody .roomhd.mw105ban{height:auto!important;min-height:0;display:flex;flex-wrap:wrap;align-items:flex-start;gap:10px 16px;padding:12px 14px}
#mgrBody .roomhd.mw105ban::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(21,16,11,.85),rgba(21,16,11,.4) 50%,rgba(21,16,11,.75));pointer-events:none}
#mgrBody .mw105L{position:relative;z-index:1;flex:1 1 480px;min-width:0;display:flex;flex-direction:column;gap:7px}
#mgrBody .mw105ban .roomttl,#mgrBody .mw105ban .roomstat,#mgrBody .mw105ban .walk96{position:static!important;transform:none!important;inset:auto!important;max-width:none!important;margin:0!important}
#mgrBody .mw105ban .roomttl{flex-direction:row;flex-wrap:wrap;align-items:baseline;gap:2px 14px}
#mgrBody .mw105ban .roomttl span{display:inline!important}
#mgrBody .mw105ban .roomstat.bt85w{justify-content:flex-start;flex-wrap:nowrap!important;overflow-x:auto;max-width:100%!important;background:none;border:0;box-shadow:none;padding:0;gap:6px}
#mgrBody .mw105ban .walk96{flex-direction:row;gap:10px}
.mw105row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px}#mgrBody .mw105ban .bt85n,#mgrBody .mw105ban .bt85a{display:none}
.mw105chips{display:flex;flex-wrap:wrap;gap:6px}
.mw105chips .mi100tr{margin:0!important;align-self:center}
.mw105chip{background:rgba(21,16,11,.65);border:1px solid #8a6a3a;border-radius:999px;padding:3px 10px;font-size:12.5px;color:#efe4cf;line-height:1.35}
button.mw105chip{cursor:pointer;font:inherit;font-size:12.5px}
.mw105chip.mw105po,button.mw105po{border-color:#e0b45a;background:linear-gradient(#5a1626,#3a0e18);color:#fbe7b5}
.mw105wk{position:relative;z-index:1;flex:0 1 380px;margin-left:auto;background:rgba(21,16,11,.88);border:1px solid #b08a4a;border-radius:10px;padding:8px 10px;display:flex;flex-direction:column;gap:6px;min-width:0}
.mw105wh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}.mw105wh b{font:400 15px var(--display);color:#f1d28a}.mw105wh span{font-size:12.5px;color:#d9cba9}
.mw105ti{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.mw105ti div{background:#1c150e;border:1px solid #4a3a28;border-radius:6px;padding:3px 8px;min-width:0}
.mw105ti i{display:block;font:500 10px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:#b9a98b;font-style:normal}
.mw105ti b{font-size:14px;color:#efe4cf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}.mw105ti .up b{color:#9fd08a}.mw105ti .dn b{color:#f0a080}.mw105ti .wt b{color:#f0c27a}
.mw105ba{display:flex;gap:8px}.mw105ba .btn,.mw105ba .mw105sb{flex:1 1 0;margin:0;min-height:38px;justify-content:center}
.mw105sb{border:1px solid #6b5536;border-radius:8px;background:rgba(28,21,14,.9);color:#efe4cf;font:inherit;font-size:14px;cursor:pointer;padding:4px 10px}.mw105sb:hover{border-color:#b08a4a}.mw105sb[data-dis]{opacity:.55;cursor:default}
.mw105wk .mw105off{margin:0;min-height:40px;width:100%}
.mw105nt{font-size:12px;color:#d9cba9}.mw105nt.ok{color:#9fd08a}.mw105nt.wt{color:#f0c27a}
#mgrPane.mw105p .mw105list{display:flex;flex-direction:column;gap:10px;margin:0 0 12px}
.mw105g{font:500 11.5px var(--mono,monospace);letter-spacing:.16em;text-transform:uppercase;color:#d3a8e8;padding:4px 4px 0}
.mw105b{position:relative;background:#241b13;border:1px solid #4a3a28;border-radius:10px;overflow:visible}
.mw105b.open{border-color:#b08a4a}.mw105b.vd{border-color:#c0533c}.mw105b.spc{border-color:#6a4a78}.mw105b.spc.open{border-color:#a07ab4}
.mw105b>.a1ev{border:0!important;padding-right:42px;cursor:pointer;opacity:1!important;border-radius:10px}
.mw105b>.a1ev.done{opacity:1}.mw105syn .a1day{font-size:10.5px;overflow-wrap:anywhere}
.mw105tg{position:absolute;right:8px;top:10px;width:28px;height:28px;border-radius:6px;border:1px solid #6b5536;background:#1c150e;color:#e3d6bd;cursor:pointer;padding:0;line-height:1}
.mw105tg span{display:inline-block}.mw105b.open .mw105tg span{transform:rotate(180deg)}
.mw105bd{border-top:1px solid #4a3a28;padding:10px 14px 14px}
.mw105bd>.card2.bout{border:0!important;background:none!important;padding:0!important;margin:0!important;box-shadow:none!important}
.mw105bd>.card2.bout .bouthead{display:block;margin:0 0 8px}.mw105bd>.card2.bout .bouthead>.cimg,.mw105bd>.card2.bout .bouttitle{display:none}
.mw105bd .boutstats{display:flex!important;flex-wrap:wrap;gap:8px;width:100%;max-width:none}
.mw105bd .boutstats .bstat{flex:1 1 120px;margin:0;background:#1c150e;border:1px solid #4a3a28;border-radius:8px;padding:5px 10px;min-width:0}
.mw105bd .boutstats .bstat.tix{flex:2 1 220px}
.mw105bar{display:block;height:6px;border-radius:3px;background:#3a2c1d;overflow:hidden;margin-top:4px}.mw105bar i{display:block;height:100%;background:linear-gradient(90deg,#b08a4a,#f1d28a)}
.mw105tb tr.mw105best{box-shadow:inset 3px 0 0 #9fd08a}
.mw105bv{font-size:11px;color:#9fd08a;white-space:nowrap}.mw105vb{font-size:10.5px}
.mw105rv{font-size:11px;border:1px solid #c0533c;color:#f0a080;border-radius:999px;padding:0 6px;white-space:nowrap}
.mw105rd.rough{color:#d9cba9}
.mw105tb .btn[data-mg="bet"]{min-height:32px;padding:3px 12px!important}.mw105tb .btn.mw105on{background:#e0b45a;border-color:#e0b45a;color:#21180f}
.mw105acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px!important}.mw105acts .mw105sp{flex:1 1 auto}
.mw105dis{opacity:.62}.mw105y{display:block;font-size:11px;color:#f0c27a;white-space:normal;line-height:1.25;max-width:24em}
.mw105c{display:flex;flex-wrap:wrap;gap:4px 8px;font-size:11.5px;color:#d9cba9;align-items:center;margin-top:2px}
.mw105w{display:block;font-size:11.5px;color:#f0a080;margin-top:2px}
.mw105rt{display:flex;flex-direction:column;gap:2px;border:1px solid #5f7d3f;background:#1f2a17;border-radius:8px;padding:6px 10px}.mw105rt.vd{border-color:#c0533c;background:#3a1c14}
.mw105rt b{font-size:13.5px}.mw105rt small{font-size:12px;color:#d9cba9}
.mw105res{display:flex;flex-direction:column;gap:8px}
.mw105rl{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13.5px;color:#c9b48e}.mw105rl b{color:#9fd08a}
.mw105pod{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:5px}
.mw105pod li{display:grid;grid-template-columns:44px minmax(0,1fr) 70px minmax(0,1.3fr);gap:10px;align-items:center;padding:6px 10px;border-radius:8px;background:#1c150e;border:1px solid #3a2c1d}
.mw105pod li.me{background:rgba(224,180,90,.12);border-color:#b08a4a}
.mw105pl{font:700 17px var(--display);color:#d9cba9}.mw105nm{min-width:0}.mw105nm small{display:block;font-size:12.5px;color:#d9b98a}.mw105cf{font-size:13.5px}.mw105ft{font-size:13.5px}.mw105ft em{font-style:normal;color:#9fd08a}
.mw105rr{margin:0}
.mw105vd{display:flex;flex-direction:column;gap:6px}.mw105vd .lrow{border:1px solid #c0533c;background:#2e1712;border-radius:8px}
.mw105ft{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:12.5px;color:#a8987b;padding:2px 4px}.mw105ft b{color:#d9cba9}
.mw105sum{background:#2f2416;border:1px solid #e0b45a;border-radius:10px;padding:12px 16px}.mw105sum>b{font:400 17px var(--display);color:#f1d28a}.mw105sum ul{margin:6px 0 0 18px;padding:0;font-size:14px}.mw105sum p{margin:6px 0 0}
.mw105sim{margin:0 0 8px;color:#f1d28a}
.mw105pop{position:fixed;z-index:9000;width:260px;background:#2a2017;border:1px solid #e0b45a;border-radius:10px;padding:10px 12px;box-shadow:0 10px 30px rgba(0,0,0,.6);display:flex;flex-direction:column;gap:8px;color:#efe4cf;font-size:14px}
.mw105pop.sheet{left:0!important;right:0;bottom:0;top:auto!important;width:auto;border-radius:12px 12px 0 0;padding:14px 16px 18px}
.mw105pop .btn{margin:0}.mw105ps{display:flex;align-items:center;gap:6px}.mw105ps .btn{width:40px;height:38px;justify-content:center;padding:0;font-size:17px}
.mw105ps output{flex:1;text-align:center;font-size:21px;font-weight:700;color:#f1d28a}
.mw105pq{display:flex;gap:4px}.mw105pq .btn{flex:1 1 0;min-height:32px;justify-content:center;padding:0}
.mw105pp{font-size:13px;color:#c9b48e}.mw105pb{display:flex;gap:6px}.mw105pb .btn{flex:1 1 0;justify-content:center;min-height:38px}
@media (max-width:900px){.mw105wk{flex:1 1 100%;margin-left:0}}
@media (max-width:600px){
#mgrBody .roomhd.mw105ban{padding:10px}.mw105ti b{font-size:13px}
.mw105bd{padding:8px 10px 12px}
.mw105bd table.mw105tb,.mw105bd table.mw105tb tbody{display:block;width:100%;min-width:0}
.mw105bd table.mw105tb tr:has(th){display:none}
.mw105bd table.mw105tb tr{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px 8px;border:1px solid #3a2c1d;border-radius:8px;padding:8px;margin:0 0 8px;background:#1c150e}
.mw105bd table.mw105tb tr.me{background:rgba(224,180,90,.12);border-color:#b08a4a}
.mw105bd table.mw105tb td{display:block;padding:0!important;border:0!important;min-width:0;background:none!important;box-shadow:none!important}
.mw105bd table.mw105tb td:first-child,.mw105bd table.mw105tb td:nth-child(2),.mw105bd table.mw105tb td:last-child{grid-column:1/-1}
.mw105bd table.mw105tb td:last-child .btn{width:100%;justify-content:center}
#mgrBody .mw105ban .walk96 .btn.walk96b{width:auto;white-space:nowrap}
.mw105bd table.mw105tb td[data-l]:not(:first-child)::before{content:attr(data-l);display:block;font:500 10px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:#b9a98b}
.mw105pod li{grid-template-columns:34px minmax(0,1fr) 54px;}.mw105pod .mw105ft{grid-column:2/-1}
.mw105acts .mw105sp{display:none}}`;document.head.appendChild(st)}

/* =====================================================================
   355-v104fixs · v1.04 beta 1 fixes — THE SUPERBUS, THE OFF-SEASON, PLAY NOW (his notes B22 B21 B23 B24 B4 B3, answers in
   tools/plans/v104/NOTES.md "Beta 1"; builds on 348-v104season). Kill switch localStorage flavius_v104soff=1. Test tools/tests/tv104h.js
   =====================================================================
   B22 (rules bug) — a Superbus bout (tier 'sb104', 348) takes ONLY the houses the bracket put in it, one fighter each, chosen on the
       playoff card ([data-po104pick], 348). Every other entry path now refuses with the reason (sb104Why: "Your house is out of the
       Superbus" · "Your house is not in this round" · "… not in this bout" · "Your house's fighter is chosen on the Superbus card"):
       · 17's classic picker on the bout card: the select + "Enter your fighter" / Withdraw / Fix are taken OFF the sb104 cards and a
         reason line shows instead (348's window guard on [data-mg="enter"|"withdraw"|"rig"] stays behind it; "underdog" joins it);
       · 296's one entry function any100Enter + any100Classic / any100Book / any100Open (the "Enter a fighter ▾" picker) refuse a
         playoff bout (any100Classic no longer pulls your current fighter off first);
       · 350's reserve cover (st95Fill wrapper swapped an outsider's seat for your reserve) and 229's fill: no fill at all in a playoff week;
         so 350's ⋯ bout menu and drag (st95Set → st95Fill) cannot reach a playoff bout either;
       · 319's "rest" (r101OffCard) no longer pulls your playoff fighter off his bout ([data-rest] on him is refused with the reason);
       · eliminated houses: the playoff card's picker only answers for a house that is IN a bout this round (348's po104MyBout) — kept.
   B21 THE BRACKET AS A REAL TREE — po104BracketHTML (348) is REPLACED (one renderer for every place it shows): Round 1 Bout A (5·8·9·12)
       and Bout B (6·7·10·11) → Semi I (1·4 + A's top 2) and Semi II (2·3 + B's top 2) → the Superbus final → the champion's laurel; CSS
       connector lines between the columns; a house box = seed · flag (flagChip) · house · finishing place; gold = through, faded = out,
       your house outlined; before the playoffs (from week 9) the projected seeds in grey. SHOWN OPEN: at the top of Match Week in the
       playoff weeks (the card's and the banner's bracket buttons are removed there), on the off-season page (the finished bracket; its
       button removed) and in a new League "🏛 Superbus" view (this season only; MGR.sb104v; the League banner's button now opens it and
       replaces 348's overlay button there). One overlay button stays where the bracket is not shown: the Match Week banner in weeks 9–11
       (+ the letters). The overlay #po104br draws the same tree. REPLACES the #po104br look (348's three-column lists).
   B23 the off-season page opens FIRST: the End-the-week click that opens the off-season lands on it (not the Flavian Awards / the Acta);
       the off-season header gets "🏆 The Flavian Awards" and "📜 The Acta Diurna" buttons (the awards and the paper follow from there).
   B24 Acta Diurna editions of the frozen playoff weeks (w.week stays 11): each is stored under its own key (season.11.r1 …) instead of
       overwriting week 11's, tagged ph; the masthead + pager read "Superbus · Round 1 / Semifinals / The Final" and "Off-season" (not
       "Week XI"); the ribbon names the next playoff stage.
   B4  League > Standings in Superbus week: a NEW v1.04 career keeps the season's table through the playoffs and the off-season (no reset
       found; the test checks it). The wipe he saw is the OLD calendar: a career begun before v1.04 switches at its next season
       (SAVE_MIGRATIONS '1.04'), so its season 1 still ran 17's old Superbus special in week 1 of season 2 — after the table rolled over.
   B3  Play Now: the 🏛 main-menu button (#mClose.menu101, 321) sits in the "Begin Event" row at its height (desktop).
   Display + Manager rules only; never the dice. No save change (w.acta102 records gain an optional ph).
   ===================================================================== */
const V104S={on:(()=>{try{return localStorage.getItem('flavius_v104soff')!=='1'}catch(e){return true}})(),toOff:0};
if(V104S.on){
/* ---------------- B22 · who may enter a playoff bout ---------------- */
const sb104Is=b=>!!(b&&(b.po104||b.tier==='sb104'));
function sb104Why(w,b){w=w||W_();if(!sb104Is(b))return '';const pm=me();if(!pm)return '';const k='m:'+pm.id;const P=po104P(w);
  const ph=b.po104?b.po104.r:(w.night&&w.night.po104)||'';
  if(b.po104&&b.po104.k.includes(k))return _T('Your house’s fighter for this round is chosen on the Superbus card.');
  const seed=P?P.seeds.indexOf(k)+1:0;if(!seed)return _T('Your house is not in the Superbus playoffs.');
  const inRound=((w.night&&w.night.bouts)||[]).some(x=>x.po104&&x.po104.k.includes(k));
  if(inRound)return _T('Your house is not in this bout.');
  if(ph==='r1'&&seed<=4)return _T('Your house is not in this round — seeds 1–4 rest in Round 1.');
  return _T('Your house is out of the Superbus.')}
const sb104Toast=s=>{try{if(s&&typeof mToast==='function')mToast('⛔ '+s)}catch(e){}};
{const base=any100Why;any100Why=function(w,b){if(sb104Is(b))return sb104Why(w,b);return base.apply(this,arguments)}}
{const base=any100Enter;any100Enter=function(w,bi,gid){const b=w&&w.night&&w.night.bouts[bi];if(sb104Is(b))return {ok:false,why:sb104Why(w,b)};return base.apply(this,arguments)}}
{const base=any100Classic;any100Classic=function(bi){const w=W_();const b=w&&w.night&&w.night.bouts[bi];if(sb104Is(b))return {ok:false,why:sb104Why(w,b)};return base.apply(this,arguments)}}
{const base=any100Book;any100Book=function(bi){const w=W_();const b=w&&w.night&&w.night.bouts[bi];if(sb104Is(b))return {ok:false,why:sb104Why(w,b)};return base.apply(this,arguments)}}
{const base=any100Open;any100Open=function(bi){const w=W_();const b=w&&w.night&&w.night.bouts[bi];if(sb104Is(b)){sb104Toast(sb104Why(w,b));return}return base.apply(this,arguments)}}
/* no weekly fill in a playoff week (350's reserve cover swapped an outsider's seat for your reserve) */
{const base=st95Fill;st95Fill=function(w){try{if(po104Ph(w||W_()))return 0}catch(e){}return base.apply(this,arguments)}}
/* resting a fighter does not pull him off his playoff bout */
if(typeof r101OffCard==='function'){const base=r101OffCard;r101OffCard=function(w,g){try{const n=w&&w.night;if(n&&n.bouts&&g&&n.bouts.some(b=>sb104Is(b)&&!b.done&&b.ents.includes(g.id)))return 0}catch(e){}return base.apply(this,arguments)}}
window.addEventListener('click',e=>{try{const t=e.target;if(!t||!t.closest)return;const w=W_();if(!w||!po104Ph(w)||!w.night)return;
  const rb=t.closest('#mgrBody [data-rest]');if(rb){const g=gById(rb.dataset.rest);const b=g&&w.night.bouts.find(x=>sb104Is(x)&&!x.done&&x.ents.includes(g.id));
    if(b){e.preventDefault();e.stopImmediatePropagation();sb104Toast(_T`${g.name} fights in the Superbus this week — change your pick on the Superbus card first.`)}return}
  const ub=t.closest('[data-mg="underdog"]');if(ub){e.preventDefault();e.stopImmediatePropagation();sb104Toast(_T('Not in the Superbus playoffs.'))}}catch(err){}},true);
/* the sb104 bout cards: no picker / enter / withdraw / fix — the reason instead */
function sb104Cards(R,w){const n=w.night;const cards=[...R.querySelectorAll('.card2.bout.sb104')];
  cards.forEach((c,i)=>{let bi=-1;for(const x of c.querySelectorAll('[data-mg][data-id]')){if(/^\d+(\||$)/.test(x.dataset.id)){bi=parseInt(x.dataset.id,10);break}}if(bi<0)bi=i;
    const b=bi>=0?n.bouts[bi]:null;for(const x of c.querySelectorAll('[data-mg="enter"],[data-mg="withdraw"],[data-mg="rig"],select[id^="ent"]'))x.remove();
    if(b&&!b.done){const acts=c.querySelector('.acts');const p=document.createElement('p');p.className='rc-sub v104sno';p.textContent='🏛 '+sb104Why(w,b);
      if(acts)acts.insertAdjacentElement('beforebegin',p);else c.appendChild(p)}})}

/* ---------------- B21 · the bracket as a tree ---------------- */
const V104S_PL=p=>p?RN(p):'';
function sb104Tree(w,compact){const P0=po104P(w);const proj=!P0||P0.phase==='pre';const P=proj?po104New(w):P0;const pm=me();const mk='m:'+pm.id;
  const seedOf=k=>P.seeds.indexOf(k)+1;
  const top2=o=>o?o.slice(0,2).map(x=>x.k):null;
  const row=(k,o)=>{o=o||{};const s=k?seedOf(k):0;const m=po104M(k);const mine=!!(m&&m.isPlayer);const pl=o.pl&&k?o.pl.find(x=>x.k===k):null;
    const st=o.adv?(o.adv.includes(k)?' adv':' out'):'';const g=pl?gById(pl.gid):null;
    const fl=m&&typeof flagChip==='function'?flagChip(m,16):'<i class="v104nf">⚑</i>';
    const tt=g?_T`${g.name} fought for the house`:'';
    return `<div class="v104e${mine?' me':''}${st}${proj?' pj':''}"${tt?` title="${esc(tt)}"`:''} data-v104k="${esc(k||'')}"><span class="sd">${s||''}</span><span class="fl">${fl}</span><b>${k?esc(po104Name(k)):_T('an invited outsider')}</b><span class="pl">${pl?V104S_PL(pl.place):''}</span></div>`};
  const ph=t=>`<div class="v104e ph"><span class="sd"></span><span class="fl"></span><b>${t}</b><span class="pl"></span></div>`;
  const box=(t,sub,keys,o,phs,cls)=>`<div class="po104b v104b${cls?' '+cls:''}"><div class="v104bt">${t}${sub?`<small>${sub}</small>`:''}</div>${(keys||[]).map(k=>row(k,o)).join('')}${(phs||[]).map(ph).join('')}</div>`;
  const AB=i=>i?'B':'A',SI=i=>i?'II':'I';
  const r1=P.r1.map((x,i)=>{const pl=x.pl||po104Live(w,P,'r1',i);return box(_T`Round 1 · Bout ${AB(i)}`,_T`seeds ${PO104_R1[i].map(j=>j+1).join('·')}`,x.k,{adv:x.adv||top2(pl),pl})});
  const sf=[0,1].map(i=>{if(P.sf){const x=P.sf[i];const pl=x.pl||po104Live(w,P,'sf',i);return box(_T`Semifinal ${SI(i)}`,'',x.k,{adv:x.adv||top2(pl),pl})}
    return box(_T`Semifinal ${SI(i)}`,'',[P.seeds[i?1:0],P.seeds[i?2:3]],{},[_T`Bout ${AB(i)} · 1st`,_T`Bout ${AB(i)} · 2nd`])});
  const fpl=P.fin?(P.fin.pl||po104Live(w,P,'fin',0)):null;
  const fin=P.fin?box(_T('The Superbus final'),_T('Roma'),P.fin.k,{adv:P.champ?[P.champ]:fpl?[fpl[0].k]:null,pl:fpl},null,'fin')
    :box(_T('The Superbus final'),_T('Roma'),null,{},[_T('Semifinal I · top 2'),_T('Semifinal II · top 2')],'fin');
  const lau=typeof lau103==='function'?lau103:()=>'';const cup=typeof trophySVG==='function'?trophySVG(trophyDef('palm_roma')||{},compact?40:52):'';
  const cm=P.champ?po104M(P.champ):null;
  const champ=P.champ?`<div class="v104ch on${cm&&cm.isPlayer?' me':''}"><div class="v104lr">${lau(false)}${cup}${lau(true)}</div><b>${esc(po104Name(P.champ))}</b><small>${esc((w.finale&&w.finale.season===P.s&&w.finale.champ)||'')}</small><span class="v104cl">${_T('Champions')}</span></div>`
    :`<div class="v104ch"><div class="v104lr">${lau(false)}${cup}${lau(true)}</div><b>${_T('The Superbus Cup')}</b><small>${_T`champion: ${coinAmt87('+'+V104A.prize.champ)}`}</small></div>`;
  const lit1=i=>P.r1[i].adv?' lit':'',lit2=P.fin?' lit':'',lit3=P.champ?' lit':'';
  const s=seedOf(mk);
  const head=proj?`<p class="po104pj">${_T`<b>If the season ended today</b> — projected seeds from the league table (week ${wkOf(w.week)} of 12).`} ${s?(s<=4?_T`You: #${s}, a rest week.`:_T`You: #${s}, Round 1.`):_T('You: outside the twelve.')}</p>`
    :`<p class="po104pj">${s?_T`Your house: seed #${s}.`:_T('Your house is not in the playoffs.')} ${_T`Gold goes through · faded is out · the top 2 of each bout go on.`}</p>`;
  const H=(c,t,wk)=>`<div class="v104hd" style="grid-column:${c}">${t}<small>${wk}</small></div>`;
  return `<div class="po104bk v104tr${proj?' proj':''}${compact?' cmp':''}" data-po104proj="${proj?1:0}">${head}<div class="v104sx"><div class="v104g">
    ${H(1,_T('Round 1'),_T('week 12'))}${H(3,_T('Semifinals'),_T('week 13'))}${H(5,_T('The Final'),_T('week 14'))}${H(7,_T('Champion'),'')}
    <div class="v104cell" style="grid-column:1;grid-row:2">${r1[0]}</div><div class="v104k k1${lit1(0)}" style="grid-column:2;grid-row:2"></div><div class="v104cell" style="grid-column:3;grid-row:2">${sf[0]}</div>
    <div class="v104cell" style="grid-column:1;grid-row:3">${r1[1]}</div><div class="v104k k1${lit1(1)}" style="grid-column:2;grid-row:3"></div><div class="v104cell" style="grid-column:3;grid-row:3">${sf[1]}</div>
    <div class="v104k k2${lit2}" style="grid-column:4;grid-row:2/4"></div><div class="v104cell" style="grid-column:5;grid-row:2/4">${fin}</div>
    <div class="v104k k1${lit3}" style="grid-column:6;grid-row:2/4"></div><div class="v104cell" style="grid-column:7;grid-row:2/4">${champ}</div>
  </div></div></div>`}
po104BracketHTML=function(w,compact){try{return sb104Tree(w||W_(),compact)}catch(e){console.error(e);return ''}};
const sb104Has=w=>{try{return !!(w&&!w.dead&&!w.tutorial&&cal104New(w)&&po104BrOK(w))}catch(e){return false}};
/* Match Week (playoff weeks): the bracket open at the top; the off-season page: the finished bracket */
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{const w=W_();const ph=po104Ph(w);if(!ph||typeof h!=='string'||(w.special&&!w.special.done))return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;
  if(ph==='off'){const off=R.querySelector('.po104off');if(off){for(const b of off.querySelectorAll('[data-po104="bracket"]'))b.remove();
      const sec=document.createElement('div');sec.className='po104sec v104sbr';sec.innerHTML=`<div class="sect">${_T`🏛 The Flavius Superbus · season ${w.season}`}</div>${sb104Tree(w,true)}`;
      const at=off.querySelector('.po104pod')||off.querySelector('.po104ptl')||off.querySelector('.po104oh');if(at)at.insertAdjacentElement('afterend',sec);else off.prepend(sec);
      const oh=off.querySelector('.po104oh');if(oh){const A=document.createElement('div');A.className='acts v104soa';
        A.innerHTML=`${w.awardShow&&w.awardShow.season===w.season?`<button type="button" class="btn tksm${w.awardShow.seen?'':' primary'}" data-mg="tab" data-id="awards">${_T('🏆 The Flavian Awards')}</button>`:''}${w.lastPaper?`<button type="button" class="btn tksm" data-mg="paper">${_T('📜 The Acta Diurna')}</button>`:''}`;
        if(A.children.length)oh.appendChild(A)}}}
  else{const card=R.querySelector('.po104card');const bk=card&&card.querySelector('.po104bk');if(card){for(const b of card.querySelectorAll('.po104bb,[data-po104="bracket"]'))b.remove();
      const sec=document.createElement('div');sec.className='card2 v104sbr v104top';sec.innerHTML=`<div class="v104sh">${_T`🏛 The Flavius Superbus · season ${w.season}`}<small>${esc(PO104_PH()[ph]||'')}</small></div>`;
      if(bk)sec.appendChild(bk);else sec.insertAdjacentHTML('beforeend',sb104Tree(w,true));card.insertAdjacentElement('beforebegin',sec)}
    sb104Cards(R,w)}
  return t.innerHTML}catch(e){console.error(e)}return h}}
/* the League "Superbus" view (this season; sb104Post draws it into #mgrPane) */
function sb104LgHTML(w){return `<div class="v104slg card2 v104sbr"><div class="v104sh">${_T`🏛 The Flavius Superbus · season ${w.season}`}<small>${esc(po104Ph(w)?PO104_PH()[po104Ph(w)]:_T('the playoffs: weeks 12–14'))}</small></div>${sb104Tree(w,false)}
    <p class="hint">${_T`The top 12 of the league table after week 11 play for the Superbus: seeds 5–12 in Round 1, seeds 1–4 join in the semifinals. Each house sends one gladiator a round; the top 2 of each bout go on. Playoff bouts score no league points.`}</p></div>`}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;const b=t.closest('[data-v104s]');
  if(b){e.preventDefault();e.stopPropagation();MGR.sb104v=b.dataset.v104s==='sb'?1:0;MGR.tab='league';if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
  if(t.closest('[data-mg="tab"]'))MGR.sb104v=0},true);
/* the banners: one bracket button only where the bracket is not shown */
function sb104Post(h){const w=W_();if(!w||w.dead||w.tutorial||MGR.view||typeof h!=='string'||!cal104New(w))return h;const ph=po104Ph(w);const has=sb104Has(w);
  if(!has&&!MGR.sb104v)return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;
  for(const b of R.querySelectorAll('.roomhd.b73-league .po104bb'))b.remove();
  if(ph)for(const b of R.querySelectorAll('.roomhd.b73-night .po104bb'))b.remove();
  const lb=R.querySelector('.roomhd.b73-league');if(lb&&has){const v=!!MGR.sb104v;const x=document.createElement('button');x.type='button';x.className='wd101sea v104slb';x.dataset.v104s=v?'std':'sb';
    x.textContent=v?_T('◀ Standings'):_T('🏛 Superbus');const sea=lb.querySelector('.wd101sea');if(sea)sea.insertAdjacentElement('afterend',x);else{const k=lb.querySelector('.kick')||lb.querySelector('.roomttl');if(k)k.appendChild(x)}}
  if(has&&MGR.sb104v&&MGR.tab==='league'){const pane=R.querySelector('#mgrPane');if(pane)pane.innerHTML=sb104LgHTML(w)}
  if(!has)MGR.sb104v=0;
  return t.innerHTML}
{const base=mgrHTML;mgrHTML=function(){try{if(V104S.toOff){const w=W_();if(po104Ph(w)==='off'&&(MGR.tab==='awards'||MGR.tab==='paper'))MGR.tab='night';V104S.toOff=0}}catch(e){}
  const h=base.apply(this,arguments);try{return sb104Post(h)}catch(e){console.error(e)}return h}}

/* ---------------- B23 · the off-season page first ---------------- */
{const base=endWeek;endWeek=async function(){let ph0='';try{ph0=po104Ph(W_())}catch(e){}const r=await base.apply(this,arguments);
  try{const w=W_();if(r!==false&&ph0!=='off'&&po104Ph(w)==='off')V104S.toOff=1}catch(e){}return r}}

/* ---------------- B24 · the playoff editions of the Acta Diurna ---------------- */
const V104S_ED=()=>({r1:_T('Superbus · Round 1'),sf:_T('Superbus · Semifinals'),fin:_T('Superbus · The Final'),off:_T('Off-season')});
const V104S_NX={r1:'sf',sf:'fin',fin:'off'};
{const base=composeWeekPaper;composeWeekPaper=function(world,night,season){let ph='';const nt=arguments.length>1&&night!==undefined?night:world&&world.night;
  try{ph=world&&nt&&nt.po104&&cal104New(world)?nt.po104:''}catch(e){}
  if(!ph)return base.apply(this,arguments);
  const A=Array.isArray(world.acta102)?world.acta102:null;const k0=`${season??world.season}.${nt.week}`;const keep=A?A.find(x=>x.key===k0&&!x.ph):null;if(keep)keep.key='__v104s';
  let P;try{P=base.apply(this,arguments)}finally{if(keep)keep.key=k0}
  try{if(P&&typeof P==='object'){P.ph104=ph;if(A&&P._k102){const rec=A.find(x=>x.key===P._k102&&x!==keep);if(rec){rec.ph=ph;rec.key=`${P._k102}.${ph}`;P._k102=rec.key}}}}catch(e){console.error(e)}
  return P}}
{const base=paperHTML;paperHTML=function(){const h=base.apply(this,arguments);try{const w=W_();if(!w||typeof h!=='string')return h;const m=/data-ak102key="([^"]*)"/.exec(h);if(!m)return h;
  const key=m[1].replace(/&amp;/g,'&');const rec=(w.acta102||[]).find(x=>x.key===key);if(!rec)return h;
  const E=V104S_ED();let lbl=rec.ph?E[rec.ph]:'';let nx=rec.ph?V104S_NX[rec.ph]:'';
  if(!rec.ph&&rec.wk===11&&w.po104&&w.po104.s===rec.season&&cal104New(w,rec.season))nx='r1';
  if(!lbl&&!nx)return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;
  if(lbl){const pb=R.querySelector('.ak102pg > div > b');if(pb)pb.textContent=lbl;
    const dk=R.querySelector('.ak102dek');if(dk){const g=dk.querySelector('b');dk.textContent=_T`Season ${rec.season} · ${lbl} · nailed to the forum wall at ${rec.loc||''}`;if(g){dk.append(' · ');dk.appendChild(g)}}
    const pg=R.querySelector('.paper.ak102');if(pg)pg.dataset.v104ed=rec.ph}
  if(nx){const nb=R.querySelector('.ak102nw b');if(nb)nb.textContent=E[nx]}
  return t.innerHTML}catch(e){console.error(e)}return h}}

/* ---------------- styles (B21 tree, B22 reason line, B3 Play Now) ---------------- */
{const st=document.createElement('style');st.textContent=`
.v104sbr{--v104g:#d6ab4c;--v104l:#8a6a2c}
.card2.v104sbr{border:1px solid #6b5236;background:linear-gradient(#241a12,#1d150f);padding:10px 12px;margin:0 0 12px}
.v104sh{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;font:400 19px var(--display,serif);color:var(--gold2,#f0cf7d);margin-bottom:4px}.v104sh small{font:12px var(--sans,system-ui);color:var(--dim,#b9a98c)}
.v104tr .po104pj{margin:0 0 6px;font-size:13px}
.v104sx{overflow-x:auto;overscroll-behavior-x:contain;padding-bottom:4px;max-width:100%}
.v104g{display:grid;grid-template-columns:minmax(170px,1fr) 22px minmax(170px,1fr) 22px minmax(170px,1fr) 22px minmax(118px,.62fr);grid-template-rows:auto 1fr 1fr;min-width:720px;row-gap:0}
.v104hd{grid-row:1;font:400 13px var(--display,serif);letter-spacing:.12em;text-transform:uppercase;color:var(--v104g);padding:0 2px 4px;border-bottom:1px solid rgba(214,171,76,.25);margin-bottom:4px}
.v104hd small{margin-left:6px;font:11px var(--sans,system-ui);letter-spacing:.04em;text-transform:none;color:var(--dim,#b9a98c)}
.v104cell{align-self:center;padding:5px 0;min-width:0}
.v104k{position:relative;align-self:stretch}
.v104k.k1::before{content:'';position:absolute;left:0;right:0;top:50%;border-top:2px solid var(--v104l)}
.v104k.k2::before{content:'';position:absolute;left:0;width:50%;top:25%;bottom:25%;border:2px solid var(--v104l);border-left:0;border-radius:0 6px 6px 0}
.v104k.k2::after{content:'';position:absolute;left:50%;right:0;top:50%;border-top:2px solid var(--v104l)}
.v104k.lit::before,.v104k.lit::after{border-color:var(--v104g)}
.v104b{border:1px solid var(--v104l);border-radius:8px;background:linear-gradient(#2c2016,#1f160f);padding:4px 5px;box-shadow:inset 0 1px 0 rgba(255,230,170,.06)}
.v104b.fin{border-color:var(--v104g);box-shadow:0 0 0 1px rgba(214,171,76,.25),inset 0 1px 0 rgba(255,230,170,.08)}
.v104bt{font:400 13px var(--display,serif);color:#f0cf7d;padding:1px 3px 3px;display:flex;gap:6px;align-items:baseline}.v104bt small{font:10.5px var(--sans,system-ui);color:var(--dim,#b9a98c);margin-left:auto}
.v104e{display:grid;grid-template-columns:20px 20px minmax(0,1fr) auto;align-items:center;gap:4px;padding:2px 4px;margin:1px 0;border-radius:5px;font-size:12.5px;line-height:1.3;color:var(--bone,#efe3cc)}
.v104e .sd{font:600 11px var(--mono,monospace);color:var(--dim,#b9a98c);text-align:right}.v104e .fl{display:flex;align-items:center;justify-content:center;min-height:16px}.v104e .fl img{height:16px!important;width:auto}
.v104e b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600}.v104e .pl{font:400 12px var(--display,serif);color:var(--dim,#b9a98c);min-width:14px;text-align:right}
.v104e.adv{background:linear-gradient(90deg,rgba(214,171,76,.30),rgba(214,171,76,.10));color:#f6dc98}.v104e.adv b{color:#f6dc98}.v104e.adv .pl{color:#f6dc98}
.v104e.out{opacity:.45}.v104e.pj{color:#a99d8a;filter:grayscale(.9)}.v104e.pj b{font-weight:500}
.v104e.me{outline:2px solid var(--v104g);outline-offset:-1px}.v104e.ph{opacity:.55;font-style:italic}.v104e.ph b{font-weight:400}
.v104nf{font-style:normal;opacity:.5;font-size:12px}
.v104ch{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;padding:6px 4px;border:1px dashed var(--v104l);border-radius:10px;opacity:.7}
.v104ch.on{opacity:1;border:1px solid var(--v104g);background:radial-gradient(rgba(214,171,76,.28),transparent 70%)}.v104ch.me{outline:2px solid var(--v104g)}
.v104ch b{color:#f6dc98;font:400 15px var(--display,serif);line-height:1.15}.v104ch small{font-size:11px;color:var(--dim,#b9a98c)}.v104cl{font:11px var(--mono,monospace);letter-spacing:.14em;text-transform:uppercase;color:var(--v104g)}
.v104lr{display:flex;align-items:center;justify-content:center}.v104lr .lau{width:24px;height:24px}
.v104tr.proj .v104k::before,.v104tr.proj .v104k::after{border-style:dashed;opacity:.6}
.po104box .v104tr{color:#f3e3b8}
.v104sno{margin:6px 0 0;color:var(--gold2,#f0cf7d)}
.v104soa{margin-top:6px;gap:6px}
@media (max-width:760px){.card2.v104sbr{padding:8px}.v104sh{font-size:17px}}
.mbox:has(.pn100) > #mClose.menu101{height:46px!important;min-width:46px!important;width:46px!important;margin-top:-4px!important;margin-bottom:-44px!important;font-size:24px;border-radius:9px!important}
@media (max-width:760px){.mbox:has(.pn100) > #mClose.menu101{height:36px!important;min-width:36px!important;width:36px!important;margin-top:-6px!important;margin-bottom:-30px!important;font-size:20px}}
`;document.head.appendChild(st)}
V104S.why=sb104Why;V104S.tree=sb104Tree;
}

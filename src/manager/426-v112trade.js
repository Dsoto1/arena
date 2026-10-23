/* =====================================================================
   426-v112trade — v1.12 TRADES 2 (his T1b T2a T3a T4a T5a T6a, 2026-10-23; tools/plans/v112/NOTES.md, docs/decisions.md). Manager only.
   Kill switch localStorage flavius_v112tradeoff=1 (= the v1.11 rules: 23's tradeVal, 350's c104BunVal with extras clamped to 0). Test tv112t.
   T2a ONE VALUE RULE — your 1-for-1 offers (23 tradego), bundles (350 §5) and their counter-offers are judged with 394's wage-aware
       tr106Val (rating, fame, age, career kind, potential, minus weekly wage ×2). REPLACES 23's tradeVal (v0.47) and the base of 350's
       c104BunVal (v1.04). Coin counts 1:1 against that value, as when a rival house buys one of yours in 394 (val × 0.95–1.2), and a
       house never lets a fighter go for less than 394's coin floor (20): what they ask = max(20, tr106Val) × the same opinion / greed
       factor as before (1.06, +0.18 under 40, −0.06 from 70, greed). 23 and 350 compare "value + coin/6", so tradeVal / c104BunVal /
       c104Need here return tr106 units ÷ 6 (T112.k): coin is 1:1 and the "add N coin" gaps come out in coin with no edit there.
   T3a a bundled fighter valued below zero (overpaid, fading) COUNTS AGAINST the offer: best one in full, each other at 55% (CAP104.bundleK)
       either way — REPLACES "counts as zero". In a 1-for-1 a negative value counts against too (it simply adds).
   T5a the counter-offer letter (c104Counter → sendLetter 'tb104-<id>') carries 394's card line: one WHY (an overpaid / fading fighter in
       the bundle, else the house's 394 motive, else "wants a little more") + the weekly wage change for you, same format as the offer card
       (.tr106 / .tr106why / .tr106wk, "+3/wk for you" · "−12/wk for you" · "same wages"). Still one pending counter, this week only.
   T4a no rival bundle offers · T6a limits unchanged (one bundle a week, envoy once a week, ≥80% → counter, roster cap, deadline 393).
   FIXES: the counter id is 't<week>_<house>' (t112Id; 350 line "v1.12 (426)") instead of Date.now() — an old pending one keeps its id
       and its stored ask. Bundled EXTRAS still settling in (378 set105Left > 0, signed < 4 weeks) can't be ticked: the box is disabled
       with 378's "🆕 settling in · N wk" tag and its reason as the tip (the same rule that guards their side).
   v1.12 (his 3a 4a, 2026-10-23, after the economy re-measure tools/plans/econ111/REPORT.md §5):
   3a RECEIVED BELOW THEIR MEDIAN = HALF — when a house judges your offer, a fighter of yours it would RECEIVE counts at T112.recvK (50%)
       of his tr106Val when his rating (effOvr) is below the median rating of that house's current roster (he would not fight for them);
       a negative value still counts in full. 1-for-1 (tradeVal(g, house)), bundles (c104BunVal(gs, coin, house)) and so the counter's ask.
       The house = the explicit argument, else MGR.trade.mid (both offer paths set it before they value). Stops "weak tiro + coin for a star".
   4a a fighter of yours still settling in (378) can't be the MAIN fighter either: his #trMine option is disabled with 378's tag + reason as
       its tip, the selection moves to the first free one (none free → Send disabled + the reason), and 23 tradego refuses him.
   v1.12 (his 2a, 2026-10-23) ONE TRADE-IN EVERY 4 WEEKS — the player can bring in at most ONE fighter by trade every 4 weeks: a 1-for-1 offer
       (23 tradego), a bundle (350 §5), an accepted counter-offer, or an accepted rival swap offer (394 / 47 offerAccept) that gives a
       fighter. Not counted: gifts, loans, free agents, recruiting, a rival buying one of yours ('coin' offers). w.t112in = the absolute
       week (w.week) of the last trade-in, set when the deal really happens (c104Swap / tradego / offerAccept succeed); w.t112in is
       absent in old saves = free. While blocked: the trade panel's Send button is disabled with "One trade-in every 4 weeks — next in N wk",
       so are the rival offers' Accept buttons that would give a fighter (offersHTML), and t112Block(w) guards the click paths
       (tradego, the bundle and counter clicks in 350 call it, offerAccept refuses with OFFER_FAIL95). The envoy / bundle slot is NOT spent
       by a refused try. Kill switch flavius_v112tradeoff=1 lifts it.
   No save change (w.tb104 / w.tb104Wk / w.offers reused; the letter body holds the new line). Never the dice (no rand()).
   ===================================================================== */
const T112={on:(()=>{try{return localStorage.getItem('flavius_v112tradeoff')!=='1'}catch(e){return true}})(),floor:20,k:6,recvK:0.5,gap:4};
/* the counter-offer id: one bundle a week, so week + house is unique (deterministic; used by 350 §5) */
function t112Id(w,m){return 't'+(w?w.week:0)+'_'+(m?m.id:'')}
const t112Live=()=>T112.on&&typeof tr106Val==='function';
/* his 2a: weeks still to wait for the next trade-in (0 = free); the reason text */
function t112Wait(w){if(!T112.on||!w||w.tutorial||w.t112in==null)return 0;const n=T112.gap-(w.week-w.t112in);return n>0?n:0}
function t112Block(w){w=w||W_();const n=t112Wait(w);return n?_T`One trade-in every 4 weeks — next in ${n} wk`:''}
const t112NoteIn=w=>{if(T112.on&&w&&!w.tutorial)w.t112in=w.week}
/* what a house asks for one of its own fighters (394's coin floor) */
const t112Ask=g=>Math.max(T112.floor,tr106Val(g));
const t112Mult=m=>{const op=opinionOf(m).v;return 1.06+(op<40?.18:0)-(op>=70?.06:0)+(((m.p&&m.p.greed)||50)-50)/400};
const t112Mine=g=>{try{const pm=me();return !!(g&&g.contract&&pm&&g.contract.mgr===pm.id)}catch(e){return false}};
/* 3a: the median rating of a house's roster; what a fighter it RECEIVES is worth to it */
function t112Med(m){const v=(m?rosterOf(m):[]).map(effOvr).sort((a,b)=>a-b);const n=v.length;if(!n)return null;return n%2?v[(n-1)/2]:(v[n/2-1]+v[n/2])/2}
function t112Recv(m,g){const v=tr106Val(g);if(!m||m.isPlayer||!(v>0))return v;const md=t112Med(m);return md!=null&&effOvr(g)<md?v*T112.recvK:v}
/* the house judging the offer: the argument, else the open trade panel's house */
function t112House(m){try{if(m&&m.id)return m;const T=typeof MGR!=='undefined'&&MGR.trade;const h=T&&T.mid?mgrById(T.mid):null;return h&&!h.isPlayer?h:null}catch(e){return null}}
/* a bundle's worth in tr106 units (+ coin 1:1): best in full, each other 55%, negatives count against; house m → 3a */
function t112Bundle(gs,coin,m){const v=gs.map(g=>m?t112Recv(m,g):tr106Val(g)).sort((a,b)=>b-a);const kx=(typeof CAP104!=='undefined'&&CAP104.bundleK)||0.55;return (v[0]||0)+v.slice(1).reduce((a,x)=>a+x*kx,0)+(coin||0)}
const t112Need=(m,gt)=>t112Ask(gt)*t112Mult(m);
const t112Set=g=>{try{return typeof set105Left==='function'?set105Left(g):0}catch(e){return 0}};
/* the counter letter's line: why + your weekly wage change */
function t112Why(w,m,gt,mine){const L=esc(m.ludus);const dud=mine.filter(g=>tr106Val(g)<0).sort((a,b)=>tr106Val(a)-tr106Val(b))[0];
  if(dud)return _T`${esc(dud.name)} costs ${L} more than he is worth to them.`;
  let mot=null;try{mot=tr106Motive(w,m,me())}catch(e){}
  if(mot==='wages')return _T`${L} must cut wages.`;if(mot==='allin')return _T`${L} goes all-in for the Superbus before the deadline.`;
  if(mot==='gap')return _T`${L} needs a fighter now.`;if(mot==='sell')return _T`${L} sells high.`;if(mot==='youth')return _T`${L} is rebuilding.`;
  return _T`${L} wants a little more for ${esc(gt.name)}.`}
function t112Line(w,T){const m=mgrById(T.mid),gt=gById(T.theirs);if(!m||!gt)return '';const mine=(T.mine||[]).map(gById).filter(Boolean);
  const dw=tr106Wage(gt)-mine.reduce((a,g)=>a+tr106Wage(g),0);const wk=dw>0?_T`+${dw}/wk for you`:dw<0?_T`−${-dw}/wk for you`:_T`same wages`;
  return `<div class="tr106 t112c" data-t112="counter"><span class="tr106why">${t112Why(w,m,gt,mine)}</span><span class="tr106wk ${dw>0?'up':dw<0?'dn':''}">${wk}</span></div>`}
if(T112.on){
  /* T2a 1-for-1 (23 tradego): tr106 value, theirs at the floor; ÷k so 23's "+ coin/6" is coin 1:1 */
  {const base=tradeVal;tradeVal=function(g,m){try{if(t112Live()&&g)return (t112Mine(g)?t112Recv(t112House(m),g):t112Ask(g))/T112.k}catch(e){console.error(e)}return base.apply(this,arguments)}}
  /* T2a + T3a bundles (350 §5) */
  if(typeof c104BunVal==='function'){const base=c104BunVal;c104BunVal=function(gs,coin,m){try{if(t112Live())return t112Bundle(gs||[],coin,t112House(m))/T112.k}catch(e){console.error(e)}return base.apply(this,arguments)}}
  if(typeof c104Need==='function'){const base=c104Need;c104Need=function(m,gt){try{if(t112Live()&&m&&gt)return t112Need(m,gt)/T112.k}catch(e){console.error(e)}return base.apply(this,arguments)}}
  /* T5a the counter letter */
  {const base=sendLetter;sendLetter=function(w,o){try{if(t112Live()&&w&&o&&typeof o.key==='string'&&o.key.startsWith('tb104-')&&typeof o.body==='string'&&!o.body.includes('t112c')){
      const T=w.tb104;if(T&&o.key==='tb104-'+T.id){const ln=t112Line(w,T);const i=o.body.indexOf('<div class="acts"');if(ln)o={...o,body:i>=0?o.body.slice(0,i)+ln+o.body.slice(i):o.body+ln}}}}catch(e){console.error(e)}
    return base.call(this,w,o)}}
  /* settling-in extras can't be bundled; the note that overpaid fighters count against */
  {const base=tradeHTML;tradeHTML=function(mgr,trade){let h=base.apply(this,arguments);try{if(typeof h!=='string'||!h.includes('id="trMine"'))return h;
      const t=document.createElement('template');t.innerHTML=h;let ch=false;
      for(const cb of t.content.querySelectorAll('input[data-tb104g]')){const g=gById(cb.dataset.tb104g);const n=g?t112Set(g):0;if(!n)continue;ch=true;
        cb.removeAttribute('checked');cb.setAttribute('disabled','');const lb=cb.closest('label');const why=_T`${g.name} signed only lately — he is settling in for ${n} more weeks; no offers yet.`;
        if(lb){lb.classList.add('t112set');lb.title=why;lb.insertAdjacentHTML('beforeend',` <span class="set105">${_T`🆕 settling in · ${n} wk`}</span>`)}
        if(trade&&Array.isArray(trade.bun))trade.bun=trade.bun.filter(x=>x!==g.id)}
      /* 4a the main fighter: settling-in options disabled, the pick moves to a free one */
      const sel=t.content.querySelector('#trMine');if(sel){let first=null,cur=null;
        for(const o of sel.querySelectorAll('option')){const g=gById(o.value);const n=g?t112Set(g):0;if(!n){if(!first)first=o;if(o.hasAttribute('selected'))cur=o;continue}
          ch=true;o.setAttribute('disabled','');o.removeAttribute('selected');o.title=_T`${g.name} signed only lately — he is settling in for ${n} more weeks; no offers yet.`;
          if(!/settling in/.test(o.textContent))o.textContent+=' · '+_T`🆕 settling in · ${n} wk`}
        const pick=cur||first;if(pick){if(!cur){ch=true;pick.setAttribute('selected','');if(trade)trade.mine=pick.value}}
        else if(sel.querySelector('option')){ch=true;const go=t.content.querySelector('[data-mg="tradego"]');const why=_T('Every fighter of yours is still settling in; no offers yet.');
          if(go){go.setAttribute('disabled','');go.classList.add('off');go.dataset.dis=why;go.title=why;if(!t.content.querySelector('.t112setw'))go.parentNode.insertAdjacentHTML('beforebegin',`<div class="traderes no t112setw">✉ ${esc(why)}</div>`)}}}
      /* his 2a: one trade-in every 4 weeks — Send disabled with the reason */
      {const bl=t112Block(W_());if(bl){const go=t.content.querySelector('[data-mg="tradego"]');if(go){ch=true;go.setAttribute('disabled','');go.classList.add('off');go.dataset.dis=bl;go.title=bl;
        if(!t.content.querySelector('.t112inw'))go.parentNode.insertAdjacentHTML('beforebegin',`<div class="traderes no t112inw">✉ ${esc(bl)}</div>`)}}}
      const box=t.content.querySelector('.tb104');if(box&&!box.querySelector('.t112n')){ch=true;box.insertAdjacentHTML('beforeend',`<span class="rc-sub t112n">${_T('Overpaid or fading fighters lower the offer; one weaker than most of theirs counts half.')}</span>`)}
      if(ch){const d=document.createElement('div');d.appendChild(t.content);h=d.innerHTML}}catch(e){console.error(e)}return h}}
  /* 4a 23 tradego: a settling-in main fighter is refused (the select can't pick him; this guards any other caller) */
  {const base=ludusClick;ludusClick=async function(action,id,btn,ctx){let inGt=null;try{if(action==='tradego'&&T112.on){const bl=t112Block(W_());if(bl){ctx&&ctx.say&&ctx.say(bl);return true}
      const el2=document.querySelector('#trTheirs');inGt=el2?gById(el2.value):null}}catch(e){console.error(e)}
    try{if(action==='tradego'&&t112Live()){const el=document.querySelector('#trMine');const g=el&&gById(el.value);
      if(g&&t112Mine(g)&&t112Set(g)>0){const why=_T`${g.name} signed only lately — he is settling in for ${t112Set(g)} more weeks; no offers yet.`;ctx&&ctx.say&&ctx.say(why);return true}}}catch(e){console.error(e)}
    const r=await base.apply(this,arguments);
    try{if(inGt&&r){const pm=me(),w=W_();if(pm&&inGt.contract&&inGt.contract.mgr===pm.id)t112NoteIn(w)}}catch(e){console.error(e)}
    return r}}
  /* bundles + accepted counters: 350's c104Swap is the one place a deal really happens */
  if(typeof c104Swap==='function'){const base=c104Swap;c104Swap=function(w,pm,m,mine,gt){const r=base.apply(this,arguments);try{if(gt&&pm&&gt.contract&&gt.contract.mgr===pm.id)t112NoteIn(w)}catch(e){console.error(e)}return r}}
  /* rival offers (47 / 394): a swap that gives you a fighter */
  {const base=offerAccept;offerAccept=function(o){const gives=!!(o&&o.kind==='swap'&&(o.give||[]).length);
    if(gives){const bl=t112Block(W_());if(bl){OFFER_FAIL95=bl;return false}}
    const r=base.apply(this,arguments);try{if(gives&&r)t112NoteIn(W_())}catch(e){console.error(e)}return r}}
  {const base=offersHTML;offersHTML=function(){let h=base.apply(this,arguments);try{const w=W_();const bl=t112Block(w);if(!bl||typeof h!=='string'||!h)return h;
      for(const o of w.offers||[]){if(!(o.kind==='swap'&&(o.give||[]).length))continue;const k=`data-m47="offyes" data-id="${o.id}"`;if(!h.includes(k))continue;
        h=h.replace(k,k+` disabled title="${esc(bl)}"`);const i=h.indexOf(k),a=h.indexOf('</div>',i);if(a>0)h=h.slice(0,a)+` <span class="rc-sub t112inw">${esc(bl)}</span>`+h.slice(a)}}catch(e){console.error(e)}return h}}
  (()=>{if(typeof document==='undefined'||document.getElementById('t112css'))return;const st=document.createElement('style');st.id='t112css';
    st.textContent=`.t112c{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;margin:6px 0 2px;font-size:13px}.t112c .tr106why{flex:1 1 220px;font-style:italic}
.t112c .tr106wk{font:12px var(--mono,monospace);white-space:nowrap;border:1px solid #6b5236;border-radius:4px;padding:0 6px}.t112c .tr106wk.up{color:#ffb0a0;border-color:#8a3a2a}.t112c .tr106wk.dn{color:#a8e0a0;border-color:#3a6a3a}
.tb104c.t112set{opacity:.6;cursor:not-allowed}.tb104 .t112n{display:block;margin-top:2px}`;document.head.appendChild(st)})();
}

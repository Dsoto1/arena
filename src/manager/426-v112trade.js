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
   No save change (w.tb104 / w.tb104Wk / w.offers reused; the letter body holds the new line). Never the dice (no rand()).
   ===================================================================== */
const T112={on:(()=>{try{return localStorage.getItem('flavius_v112tradeoff')!=='1'}catch(e){return true}})(),floor:20,k:6};
/* the counter-offer id: one bundle a week, so week + house is unique (deterministic; used by 350 §5) */
function t112Id(w,m){return 't'+(w?w.week:0)+'_'+(m?m.id:'')}
const t112Live=()=>T112.on&&typeof tr106Val==='function';
/* what a house asks for one of its own fighters (394's coin floor) */
const t112Ask=g=>Math.max(T112.floor,tr106Val(g));
const t112Mult=m=>{const op=opinionOf(m).v;return 1.06+(op<40?.18:0)-(op>=70?.06:0)+(((m.p&&m.p.greed)||50)-50)/400};
const t112Mine=g=>{try{const pm=me();return !!(g&&g.contract&&pm&&g.contract.mgr===pm.id)}catch(e){return false}};
/* a bundle's worth in tr106 units (+ coin 1:1): best in full, each other 55%, negatives count against */
function t112Bundle(gs,coin){const v=gs.map(tr106Val).sort((a,b)=>b-a);const kx=(typeof CAP104!=='undefined'&&CAP104.bundleK)||0.55;return (v[0]||0)+v.slice(1).reduce((a,x)=>a+x*kx,0)+(coin||0)}
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
  {const base=tradeVal;tradeVal=function(g){try{if(t112Live()&&g)return (t112Mine(g)?tr106Val(g):t112Ask(g))/T112.k}catch(e){console.error(e)}return base.apply(this,arguments)}}
  /* T2a + T3a bundles (350 §5) */
  if(typeof c104BunVal==='function'){const base=c104BunVal;c104BunVal=function(gs,coin){try{if(t112Live())return t112Bundle(gs||[],coin)/T112.k}catch(e){console.error(e)}return base.apply(this,arguments)}}
  if(typeof c104Need==='function'){const base=c104Need;c104Need=function(m,gt){try{if(t112Live()&&m&&gt)return t112Need(m,gt)/T112.k}catch(e){console.error(e)}return base.apply(this,arguments)}}
  /* T5a the counter letter */
  {const base=sendLetter;sendLetter=function(w,o){try{if(t112Live()&&w&&o&&typeof o.key==='string'&&o.key.startsWith('tb104-')&&typeof o.body==='string'&&!o.body.includes('t112c')){
      const T=w.tb104;if(T&&o.key==='tb104-'+T.id){const ln=t112Line(w,T);const i=o.body.indexOf('<div class="acts"');if(ln)o={...o,body:i>=0?o.body.slice(0,i)+ln+o.body.slice(i):o.body+ln}}}}catch(e){console.error(e)}
    return base.call(this,w,o)}}
  /* settling-in extras can't be bundled; the note that overpaid fighters count against */
  {const base=tradeHTML;tradeHTML=function(mgr,trade){let h=base.apply(this,arguments);try{if(typeof h!=='string'||!h.includes('data-tb104g'))return h;
      const t=document.createElement('template');t.innerHTML=h;let ch=false;
      for(const cb of t.content.querySelectorAll('input[data-tb104g]')){const g=gById(cb.dataset.tb104g);const n=g?t112Set(g):0;if(!n)continue;ch=true;
        cb.removeAttribute('checked');cb.setAttribute('disabled','');const lb=cb.closest('label');const why=_T`${g.name} signed only lately — he is settling in for ${n} more weeks; no offers yet.`;
        if(lb){lb.classList.add('t112set');lb.title=why;lb.insertAdjacentHTML('beforeend',` <span class="set105">${_T`🆕 settling in · ${n} wk`}</span>`)}
        if(trade&&Array.isArray(trade.bun))trade.bun=trade.bun.filter(x=>x!==g.id)}
      const box=t.content.querySelector('.tb104');if(box&&!box.querySelector('.t112n')){ch=true;box.insertAdjacentHTML('beforeend',`<span class="rc-sub t112n">${_T('Overpaid or fading fighters lower the offer.')}</span>`)}
      if(ch){const d=document.createElement('div');d.appendChild(t.content);h=d.innerHTML}}catch(e){console.error(e)}return h}}
  (()=>{if(typeof document==='undefined'||document.getElementById('t112css'))return;const st=document.createElement('style');st.id='t112css';
    st.textContent=`.t112c{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;margin:6px 0 2px;font-size:13px}.t112c .tr106why{flex:1 1 220px;font-style:italic}
.t112c .tr106wk{font:12px var(--mono,monospace);white-space:nowrap;border:1px solid #6b5236;border-radius:4px;padding:0 6px}.t112c .tr106wk.up{color:#ffb0a0;border-color:#8a3a2a}.t112c .tr106wk.dn{color:#a8e0a0;border-color:#3a6a3a}
.tb104c.t112set{opacity:.6;cursor:not-allowed}.tb104 .t112n{display:block;margin-top:2px}`;document.head.appendChild(st)})();
}

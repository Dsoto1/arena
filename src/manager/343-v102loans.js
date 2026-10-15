/* =====================================================================
   343-v102loans · v1.02 workstream L (his answers 2026-10-14) — LOANS: A CAP, A WEEKLY MARKET, THE CLERK'S ADVICE
   =====================================================================
   1 · CAP: a house has at most LOAN102.cap (4) of its own fighters out on loan at once — the player (lendTo; the Lend out… pickers and the
       borrow-offers say why when full) and the rival houses lending to you (borrowFrom, 'loanin' offers; the Borrow picker drops a full
       house's fighters).
   2 · THE MARKET: loan102Fee(w,g,m) = loanFee(g) (47: rating + fame) × loan102Demand(w,m) — the borrowing house's demand this week from a
       hash of world id + absolute week + house id (never the dice RNG), more when its roster is short-handed or hurt, less in a glut (many
       fighters out on loan across the league); clamped LOAN102.dMin..dMax. CEILING: a fee never reaches what the same fighter would earn the
       house fighting as a starter (loan102Starter: the purse of the top tier he fits × LOAN102.winP, the house's typical share), × LOAN102.ceil.
       So a stud's bench loan is real money (the borrower pays his wage; the lender's fee is clear profit), but fighting always pays more.
       Every lend (picker or offer) and every house's ask for your bench uses this week's price; the pickers show it.
   3 · THE CLERK ADVISES (weekChecklist → the desk, 💰 = the Clerk's row) from Clerk level LOAN102.clerkLv (3; his call: higher levels only;
       at the top level REC98.lvMax he also names the best week + house of the next LOAN102.ahead weeks), only in a GOOD market week (demand ≥ LOAN102.good) for the best
       bench fighter who is fit, not on a card, and fee ≥ LOAN102.minFee: "<name> is market-worthy this week — <house> offers N a week" +
       [Lend for 3 weeks] (data-l102lend="gid|mid").
   Display + loans only; no save change (fees live on the loan as before). Kill switch: localStorage flavius_v102loff=1. Test tools/tests/tv102l.js
   ===================================================================== */
const LOAN102={on:true,cap:4,dMin:0.6,dMax:1.6,good:1.35,clerkLv:3,ahead:4,minFee:6,ceil:0.8,winP:0.25,glut:0.04,short:0.18,hurt:0.06,weeks:3};
try{LOAN102.on=localStorage.getItem('flavius_v102loff')!=='1'}catch(e){}
if(LOAN102.on){
const l102Hash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)/4294967296};
/* how many of house m's own fighters are out on loan now */
function loan102Out(w,m){return (w.glads||[]).filter(g=>g.alive&&g.loanFrom&&g.loanFrom.mid===m.id&&g.contract&&g.contract.mgr!==m.id).length}
function loan102Full(w,m){return !!m&&loan102Out(w,m)>=LOAN102.cap}
const loan102FullTxt=()=>_T`Four of your fighters are already out on loan — the most a house lends at once.`;
/* the borrowing house's demand this week */
function loan102Demand(w,m,wk){if(!w||!m)return 1;const h=l102Hash('ln102|'+w.id+'|'+(wk==null?w.week:wk)+'|'+m.id);let d=0.7+0.6*h;
  const fit=rosterOf(m).filter(g=>!g.inj).length;d+=Math.max(0,4-fit)*LOAN102.short;d+=Math.min(3,rosterOf(m).filter(g=>g.inj).length)*LOAN102.hurt;
  const out=(w.glads||[]).filter(g=>g.alive&&g.loanFrom).length;d-=Math.min(0.4,out*LOAN102.glut);
  return Math.max(LOAN102.dMin,Math.min(LOAN102.dMax,+d.toFixed(2)))}
/* what the same fighter would typically earn the house fighting as a starter, a week */
function loan102Starter(g){const r=effOvr(g);const T=r>=TIERS.main.lo?TIERS.main:r>=TIERS.feature.lo?TIERS.feature:TIERS.under;return Math.round(T.purse*LOAN102.winP)}
function loan102Fee(w,g,m,wk){const base=loanFee(g);const f=Math.round(base*loan102Demand(w,m,wk));return Math.max(2,Math.min(f,Math.floor(loan102Starter(g)*LOAN102.ceil)))}
/* the houses that may borrow from the player (47's rule: friendly, never a rival, room on the roster) */
function loan102Houses(w){return (w.mgrs||[]).filter(m=>!m.isPlayer&&!m.dead&&!isRival(m)&&opinionOf(m).v>=30&&rosterOf(m).length<9)}
function loan102Best(w,g){let B=null;for(const m of loan102Houses(w)){const d=loan102Demand(w,m);const fee=loan102Fee(w,g,m);if(!B||fee>B.fee)B={m,fee,d,good:d>=LOAN102.good}}return B}
/* 1 + 2 · lending: the cap and this week's price (an offer keeps the price it was made at) */
{const base=lendTo;lendTo=function(g,m,fee,weeks){try{const w=W_(),pm=me();if(w&&pm&&g&&!g.loanFrom&&loan102Full(w,pm)){if(typeof mToast==='function')mToast(loan102FullTxt());return false}
    if(w&&g&&m&&(fee==null||fee===loanFee(g)))fee=loan102Fee(w,g,m)}catch(e){console.error(e)}return base.call(this,g,m,fee,weeks)}}
{const base=borrowFrom;borrowFrom=function(g,m,fee,weeks){try{const w=W_();if(w&&m&&loan102Full(w,m)){if(typeof mToast==='function')mToast(_T`${esc(m.ludus)} already has four fighters out on loan.`);return false}}catch(e){console.error(e)}return base.apply(this,arguments)}}
/* the houses' asks for your bench (47) and the lend offers in an empty barracks (50): this week's price, none past the cap */
{const base=loansWeek;loansWeek=function(w,pm){const n0=(w.offers||[]).length;const r=base.apply(this,arguments);try{const O=w.offers||[];
    for(let i=O.length-1;i>=n0;i--){const o=O[i];const g=gById(o.gid),m=mgrById(o.mid);if(!g||!m)continue;
      if(o.kind==='loan'){if(loan102Full(w,pm)){O.splice(i,1);continue}o.fee=loan102Fee(w,g,m)+1;o.ln102=1}
      else if(o.kind==='loanin'&&loan102Full(w,m))O.splice(i,1)}}catch(e){console.error(e)}return r}}
/* accepting an ask once the cap is full: refused with the reason (47's handler calls lendTo, which refuses) */
/* 3 · the Clerk's advice */
/* the Clerk's level (council83 advisor levels, 249 adv98Lv): advice from LOAN102.clerkLv; at the top level he also names the best week ahead */
const loan102Clerk=w=>{try{return typeof adv98Lv==='function'?adv98Lv(w,'clerk'):1}catch(e){return 1}};
const loan102Top=()=>(typeof REC98!=='undefined'&&REC98.lvMax)||5;
function loan102Ahead(w,g){let B=null;for(let k=0;k<LOAN102.ahead;k++){const wk=w.week+k;for(const m of loan102Houses(w)){const fee=loan102Fee(w,g,m,wk);if(!B||fee>B.fee)B={wk,m,fee}}}return B}
function loan102Advice(w,pm){if(!w||!pm||loan102Full(w,pm)||loan102Clerk(w)<LOAN102.clerkLv)return null;const n=w.night;const card=new Set(n&&n.bouts?n.bouts.filter(b=>!b.done).flatMap(b=>b.ents||[]):[]);
  let best=null;for(const g of rosterOf(pm)){if(g.loanFrom||g.inj||g.slot95||card.has(g.id)||g.restWk===w.week||(g.contract&&g.contract.mgr!==pm.id))continue;if(typeof r101Block==='function'&&r101Block(g))continue;
    const B=loan102Best(w,g);if(!B||!B.good||B.fee<LOAN102.minFee)continue;if(!best||B.fee>best.fee)best={g,...B}}
  if(best&&loan102Clerk(w)>=loan102Top())best.ahead=loan102Ahead(w,best.g);
  return best}
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_(),pm=me();const A=loan102Advice(w,pm);
  if(A)I.push({done:false,ic:'💰',txt:_T`<b>${esc(A.g.name)}</b> is market-worthy this week — <b>${esc(A.m.ludus)}</b> offers ${coinAmt87(A.fee)} a week${A.ahead?(A.ahead.wk===w.week?_T` · the best price of the next ${LOAN102.ahead} weeks`:_T` · better still: week ${wkOf(A.ahead.wk)}, ${esc(A.ahead.m.ludus)} at ${coinAmt87(A.ahead.fee)}`):''}`,ahead102:A.ahead?1:0,
    btn:`<button class="btn tksm" type="button" data-l102lend="${A.g.id}|${A.m.id}" title="${esc(_T`Three weeks on loan; ${A.m.ludus} pays his wage. He fights for them, not for you.`)}">${_T`Lend for 3 weeks`}</button>`})}catch(e){console.error(e)}return I}}
try{if(typeof ADV101_IC!=='undefined')ADV101_IC['💰']='clerk'}catch(e){}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-l102lend]');if(!b)return;e.preventDefault();e.stopPropagation();
  const [gid,mid]=b.dataset.l102lend.split('|');const w=W_(),g=gById(gid),m=mgrById(mid);if(!w||!g||!m)return;
  if(lendTo(g,m,loan102Fee(w,g,m),LOAN102.weeks)){saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()}},true);
/* the pickers: this week's price on every Lend option; a full house says why instead of offering */
function loan102Pickers(root){const w=W_(),pm=me();if(!w||!pm)return;const full=loan102Full(w,pm);
  for(const s of root.querySelectorAll('select[data-m47lend]')){const g=gById(s.dataset.m47lend);if(!g)continue;
    if(full){const sp=document.createElement('span');sp.className='rc-sub l102full';sp.title=loan102FullTxt();sp.textContent=_T('🤝 4 out on loan');s.replaceWith(sp);continue}
    for(const o of s.querySelectorAll('option[value]')){const m=o.value&&mgrById(o.value);if(!m)continue;o.textContent=_T`${m.ludus} · ${loan102Fee(w,g,m)}/wk · 3 wk`}}
  for(const s of root.querySelectorAll('select[data-m47borrow]'))for(const o of s.querySelectorAll('option[value]')){const mid=(o.value||'').split('|')[0];const m=mid&&mgrById(mid);if(m&&loan102Full(w,m))o.remove()}}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||!/data-m47(lend|borrow)/.test(h))return h;const t=document.createElement('template');t.innerHTML=h;loan102Pickers(t.content);
  const d=document.createElement('div');d.appendChild(t.content);return d.innerHTML}catch(e){console.error(e)}return h}}
}

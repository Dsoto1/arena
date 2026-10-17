/* =====================================================================
   379-v105loan — v1.05 B55 · ACCEPTING A LOAN ASK FROM ITS LETTER (tools/plans/v105/NOTES.md). Manager only.
   Kill switch localStorage flavius_v105loanoff=1. Test tools/tests/tv105p.js.
   ROOT CAUSE: 47's [data-m47="offyes"] handler called lendTo(g,m,fee,weeks) for a kind:'loan' letter, IGNORED its return value and then
     always dropped the letter (w.offers = w.offers.filter(x=>x!==o)). lendTo is refused (returns false, one toast) by wrappers added later:
     343 (four out on loan), 345 (injured), 350 (bout slot this week / their roster at its cap / they cannot pay the lump up front).
     So a refused loan looked accepted: the letter vanished, nothing moved, the fighter stayed on the roster.
   FIX: a window-capture click handler (runs before 47's document one) takes over "Accept" on a loan letter: lendTo is the only way in (same
     path as the roster menu / Lend out… picker); only when the fighter really is lent (g.loanFrom.mid = the player) is the letter answered.
     When refused the letter STAYS, shows the reason (the refusal's own words) above its buttons, and a toast says it too. A letter whose
     fighter is gone, no longer ours or already out is dropped with a note (it can never work again).
   ===================================================================== */
const V105L={on:(()=>{try{return localStorage.getItem('flavius_v105loanoff')!=='1'}catch(e){return true}})()};
function l105Lend(w,o){const pm=me(),g=gById(o.gid),m=mgrById(o.mid);
  if(!g||!m||!pm||!g.alive||!g.contract||g.contract.mgr!==pm.id||g.loanFrom)return {gone:1,why:_T`That deal cannot go through any more.`};
  let why='';const keep=typeof mToast==='function'?mToast:null;
  if(keep)mToast=function(h){why=String(h)};
  let ok=false;try{ok=!!lendTo(g,m,o.fee,o.weeks)}catch(e){console.error(e)}finally{if(keep)mToast=keep}
  ok=ok&&!!g.loanFrom&&g.loanFrom.mid===pm.id&&g.contract.mgr===m.id;
  return ok?{ok:1}:{why:why||_T`🤝 ${esc(m.ludus)} cannot take ${esc(g.name)} on loan right now.`}}
if(V105L.on){
  window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-m47="offyes"]');if(!b||typeof W_!=='function')return;const w=W_();if(!w)return;
    const o=(w.offers||[]).find(x=>x.id===b.dataset.id);if(!o||o.kind!=='loan')return;
    e.stopImmediatePropagation();e.stopPropagation();e.preventDefault();
    const r=l105Lend(w,o);
    if(r.ok||r.gone){w.offers=w.offers.filter(x=>x!==o);if(r.gone&&typeof mToast==='function')mToast(r.why)}
    else{o.why105=r.why;if(typeof mToast==='function')mToast(r.why)}
    saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
  if(typeof loanReq103==='function'){const base=loanReq103;loanReq103=function(o){const h=base.apply(this,arguments);
    try{if(o&&o.why105&&typeof h==='string')return h.replace('<div class="acts"',`<p class="rc-sub l105why" role="alert">${o.why105}</p><div class="acts"`)}catch(e){console.error(e)}return h}}
}

/* =====================================================================
   385-V105DEAD · v1.05 B66 — a fighter KILLED in a bout is never a free agent; he keeps his house until the week ends
   =====================================================================
   ROOT CAUSE: killFighter (17) set alive=false AND contract=null the moment the bout was applied (also settlePending 'let him go' and
   the thumb path, which end in killFighter). A dead man with no contract reads as "unsigned" to everything that tests only
   `!g.contract`: the recruiting detail / scout / pitch / offer buttons, the Recruiter's dossier (rec98), the results rows and Match Week
   cards that look up his house through g.contract.mgr (shown as none), and dead-loan settlement (falls back to the loan's `to`).
   freeAgents() itself already needs g.alive, so the plain pool was safe; the leak was every `!g.contract` test.
   FIX: killFighter is wrapped. The base death runs untouched (history, w.grave entry, deaths, fame), then the dead man KEEPS his
   contract, marked g.fallen105={mgr,s,wk}. rosterOf, wages, caps and the field all need alive, so he costs and fields nothing.
   endWeek is wrapped: after the base week-end every fallen105 contract is cleared (the grave entry exists from the death; one is
   written here if some path skipped it). offerVerdict / recMark / cityFav refuse a dead man. The roster page gets a
   "✝ Fallen this week" strip (r104ListHTML wrapper) with his house.
   Pending verdicts (thumb, blood money, rudis) never touch the contract: a fighter awaiting a verdict stays under contract.
   UNCHANGED: Sotonium clemency (no kill at all), blood money "pay" (buyBack, he lives), "let him go" (killFighter, now with the mark).
   A verdict that FREES him alive (freeFighter: the rudis, bought freedom) is alive=false + freed2 + contract cleared at once, as
   before: he is among the Liberti, not a free agent (freeAgents needs alive).
   Kill switch: localStorage flavius_v105deadoff=1.   Test: tv105v.
   ===================================================================== */
const V105DEAD={on:(()=>{try{return localStorage.getItem('flavius_v105deadoff')!=='1'}catch(e){return true}})()};
/* fallen105 — the fighters of house m killed this week, still under his contract until the week ends. */
function fallen105(m){const w=W_();if(!V105DEAD.on||!w||!m)return [];return (w.glads||[]).filter(g=>g&&g.alive===false&&g.fallen105&&g.contract&&g.contract.mgr===m.id)}
const gone105=g=>!!g&&(g.alive===false||!!g.fallen105);
if(V105DEAD.on){
  {const base=killFighter;killFighter=function(glad,mgr){const had=glad&&glad.contract?glad.contract:null;const r=base.apply(this,arguments);
    try{const w=W_();if(had&&mgr&&glad&&w&&glad.alive===false){glad.contract=had;glad.fallen105={mgr:mgr.id,s:w.season,wk:w.week}}}catch(e){console.error(e)}return r}}
  {const base=endWeek;endWeek=async function(){const r=await base.apply(this,arguments);
    try{const w=W_();if(w)for(const g of w.glads||[]){if(!g||!g.fallen105)continue;const f=g.fallen105;
      if(!(w.grave||[]).some(x=>x.name===g.name&&x.s===f.s&&x.wk===f.wk)){const m=mgrById(f.mgr);w.grave.unshift({...graveExtra(g),name:g.name,cls:g.cls,age:gAge(g),wk:f.wk,s:f.s,fate:_T('killed in the league'),mgr:m?m.name:null,rec:{...g.rec}});w.grave=w.grave.slice(0,40)}
      g.contract=null;g.alive=false;delete g.fallen105}}catch(e){console.error(e)}return r}}
  {const base=offerVerdict;offerVerdict=function(g){if(gone105(g))return {ok:false,why:_T('He has fallen.')};return base.apply(this,arguments)}}
  {const base=recMark;recMark=function(g){if(gone105(g))return;return base.apply(this,arguments)}}
  {const base=cityFav;cityFav=function(gid){const g=gById(gid);if(gone105(g))return;return base.apply(this,arguments)}}
  if(typeof r104ListHTML==='function'){const base=r104ListHTML;r104ListHTML=function(w,pm){const h=base.apply(this,arguments);
    try{const F=fallen105(pm);if(!F.length||typeof h!=='string')return h;
      const strip=`<div class="r104g f105" data-f105="1"><div class="r104gh"><b>${_T('✝ Fallen this week')}</b><span class="r104gn">${F.length}</span></div>${F.map(g=>`<div class="r104e">✝ <b>${esc(g.name)}</b> · ${esc(mgrById(g.contract.mgr).ludus)}</div>`).join('')}</div>`;
      return h.replace(/<\/div>\s*$/,strip+'</div>')}catch(e){console.error(e)}return h}}
}

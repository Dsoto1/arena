/* =====================================================================
   386-V105RENEW · v1.05 B67 — the off-season CONTRACT RENEWALS rows show OVR, W–L and recent form
   =====================================================================
   po104OffHTML (348) is wrapped: every .po104rn[data-po104ren] row gets one compact line after the name:
   the grade chip + OVR (r104Grade / gradeCol / effOvr, the roster's own, 350), the W–L (g.rec, exactly the roster's number)
   and the last 5 results as .fchip dots (g.recent, the League's markup). Nothing is recomputed differently.
   Kill switch: localStorage flavius_v105renewoff=1.
   ===================================================================== */
const V105RENEW_OFF=(()=>{try{return localStorage.getItem('flavius_v105renewoff')==='1'}catch(e){return false}})();
function ren105Line(g){const r=g.rec||{};const wl=`${r.w||0}–${Math.max(0,(r.ev||0)-(r.w||0))}`;const gr=typeof r104Grade==='function'?r104Grade(g):'';
  const form=(g.recent||[]).slice(-5).map(x=>`<span class="fchip ${x.won?'w':x.place===2?'p':''}" title="${esc(`S${x.s} W${x.wk} · ${x.ev||''}`)}">${x.won?'W':x.place||'·'}</span>`).join('')||'<span class="rc-sub">—</span>';
  return `<span class="ren105" data-ren105="${g.id}"><span class="r104t" style="--gc:${gradeCol(gr)}">${gr}</span><b class="ren105o">${effOvr(g)}</b><span class="ren105wl">${wl}</span><span class="ren105f">${form}</span></span>`}
if(!V105RENEW_OFF){
  {const st=document.createElement('style');st.textContent=`.ren105{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;margin:0 6px;max-width:100%}.ren105 .r104t{display:inline-block;min-width:22px;text-align:center;font:700 11px var(--mono);padding:1px 4px;border-radius:3px;border:1px solid var(--gc);color:var(--gc)}.ren105wl{font:600 11px var(--mono);color:var(--muted)}.ren105f{display:inline-flex;gap:0}.po104rn{overflow-wrap:anywhere}`;document.head.appendChild(st)}
  {const base=po104OffHTML;po104OffHTML=function(){const h=base.apply(this,arguments);
    try{const t=document.createElement('template');t.innerHTML=h;for(const row of t.content.querySelectorAll('.po104rn[data-po104ren]')){const g=gById(row.dataset.po104ren);const b=row.querySelector('b');if(g&&b)b.insertAdjacentHTML('afterend',ren105Line(g))}return t.innerHTML}catch(e){console.error(e);return h}}}
}

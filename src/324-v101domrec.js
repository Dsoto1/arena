/* =====================================================================
   324-v101domrec — v1.01 TWO DOMUS RECORDS (the rules: "v1.01 DOMUS RECORDS" at the end of 111-onlcore; docs/backend.md "v1.01 domus records")
   A house shows two lines wherever its record shows (the Domus banner, the visit page, the house card):
     ⚔ Ranked: B bouts · W wins · S survived · F fallen · CF      (the top-level record; from v1.01 Ranked seats only)
     🎭 Unranked: …                                                (D.cu: Custom or any other non-ranked online event)
   The Ranked line carries a small ⓘ "includes earlier Custom matches played before v1.01" when the house already had bouts then (D.pre101 > 0) or
   the server predates the split (no D.split101). Fame stays beside them. Display only; Glory / Domus rank / coin / trophies are not touched.
   ===================================================================== */
function dr101Lines(D){D=D||{};const cu=D.cu||{};const cf=n=>typeof cfAmt87==='function'?cfAmt87(n|0):`${n|0} CF`;
  const old=!D.split101||(D.pre101|0)>0;
  const ln=(ic,nm,b,w,s,f,l,note)=>_T`<span class="dr101l"><b>${ic} ${nm}:</b> ${b} bouts · ${w} wins · ${s} survived · ${f} fallen · ${l}${note}</span>`;
  const note=old?`<i class="dr101i" tabindex="0" title="${esc2(_T('includes earlier Custom matches played before v1.01'))}">ⓘ</i>`:'';
  return `<span class="dr101">${ln('⚔',_T('Ranked'),D.bouts|0,D.wins|0,D.survived|0,D.fallen|0,cf(D.lifeCF),note)}${ln('🎭',_T('Unranked'),cu.bouts|0,cu.wins|0,cu.survived|0,cu.fallen|0,cf(cu.lifeCF),'')}</span>`}
/* swap the record block (a flat container of spans) for the two lines, keeping Fame beside them */
function dr101Swap(h,cls,D,fame){if(typeof h!=='string'||!D)return h;const re=new RegExp('<div class="'+cls+'">[\\s\\S]*?</div>');if(!re.test(h))return h;
  return h.replace(re,()=>`<div class="${cls} dr101w">${dr101Lines(D)}${fame?`<span class="dr101f"><b>✦ ${D.fame|0}</b> ${_T('Fame')}</span>`:''}</div>`)}
if(typeof d89Banner==='function'){const base=d89Banner;d89Banner=function(){const h=base.apply(this,arguments);try{return dr101Swap(h,'db89-rec',ONL.domus||{},true)}catch(e){return h}}}
if(typeof l89VisitHTML==='function'){const base=l89VisitHTML;l89VisitHTML=function(){const h=base.apply(this,arguments);try{const r=V89L.visit;return dr101Swap(h,'db89-rec',r&&r.domus,true)}catch(e){return h}}}
if(typeof hc98HTML==='function'){const base=hc98HTML;hc98HTML=function(r){const h=base.apply(this,arguments);try{return dr101Swap(h,'hc98-rec',r&&r.domus,true)}catch(e){return h}}}
{const st=document.createElement('style');st.id='dr101css';st.textContent=`
.dr101w{display:flex;flex-direction:column;gap:3px;align-items:flex-start;text-align:left}
.dr101{display:flex;flex-direction:column;gap:3px}
.dr101l{display:block;font-size:.92em;line-height:1.35}
.dr101l b:first-child{margin-right:2px}
.dr101i{font-style:normal;cursor:help;margin-left:5px;opacity:.85;border:1px solid currentColor;border-radius:50%;padding:0 4px;font-size:.8em}
.dr101f{font-size:.85em;opacity:.9}
@media(max-width:600px){.dr101l{font-size:.85em}}`;document.head.appendChild(st)}

/* =====================================================================
   87-V67 · v0.67 MANAGER: RECRUITING PORTAL (and the Training Yard's top row)
   =====================================================================
   • Training Yard: the four stat squares (Yard facility, Discipline, Doctores hired, Last week) sit to the right of this
     week's regime on the same row, compact (2 x 2, long notes as hover text).
   ===================================================================== */
/* cut the first balanced <div …>…</div> that starts at index i */
function cutDiv(h,i){let e=h.indexOf('>',i)+1,depth=1;while(depth&&e<h.length){const o=h.indexOf('<div',e),c=h.indexOf('</div>',e);if(c<0)return null;if(o>=0&&o<c){depth++;e=o+4}else{depth--;e=c+6}}return [h.slice(i,e),h.slice(0,i)+h.slice(e)]}
{const base=practiceHTML;practiceHTML=function(){let h=base.apply(this,arguments);try{
  const i=h.indexOf('<div class="roomtiles">');const y=h.indexOf('<div class="yardreg">');if(i<0||y<0)return h;
  const cut=cutDiv(h,i);if(!cut)return h;let [tiles,rest]=cut;
  /* long notes move into the tooltip so the squares stay small */
  tiles=tiles.replace(/<div class="roomtile">([\s\S]*?)<div class="rc-sub">([\s\S]*?)<\/div>/g,(m,a,sub)=>`<div class="roomtile" title="${sub.replace(/<[^>]+>/g,'').replace(/"/g,'&quot;')}">${a}`);
  const y2=rest.indexOf('<div class="yardreg">');const reg=cutDiv(rest,y2);if(!reg)return h;
  const inner=reg[0].replace(/^<div class="yardreg">/,'').replace(/<\/div>$/,'');
  return reg[1].slice(0,y2)+`<div class="yardreg yr2"><div class="yrleft">${inner}</div><div class="yrtiles">${tiles}</div></div>`+reg[1].slice(y2)}catch(e){console.error(e);return h}}}
{const st=document.createElement('style');st.textContent=`
.yardreg.yr2{display:grid;grid-template-columns:minmax(0,auto) minmax(260px,1fr);gap:12px;align-items:end}
.yr2 .yrtiles .roomtiles{grid-template-columns:1fr 1fr;margin:0;gap:6px}
.yr2 .yrtiles .roomtile{padding:5px 8px;gap:6px;cursor:help}.yr2 .yrtiles .rti{font-size:18px}.yr2 .yrtiles .rtv{font-size:15px}.yr2 .yrtiles .rtl{font-size:10px}
@media (max-width:1100px){.yardreg.yr2{grid-template-columns:1fr}}`;document.head.appendChild(st)}

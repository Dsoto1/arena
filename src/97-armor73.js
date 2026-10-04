/* =====================================================================
   97-ARMOR73 · v0.73 — the armor designer's Start from, fixed (Virgilante: "does not make sense and does not load the system
   armors as it should")
   =====================================================================
   • Start from lists "A blank piece" and the printed armor grouped by where it is worn (Head, Chest, Belt, Upper arm,
     Lower arm, Hand, Upper leg, Lower leg). The sculpt templates moved to their own "Base shape" list.
   • Loading a printed piece (Start from or 📜 Copy & edit) brings its rulebook stats AND its look: the printed art (in the
     current art style — Original Drawn or Sculpted) at the exact spot the printed piece is worn (ARM_FIT → equip point and
     placement). "Wear the printed art" can be switched off to sculpt your own; adding sculpt shapes or a base shape does too.
   • A copy that keeps the printed art wears it in matches, on the avatar and in every list (ca.art = the printed key).
   ===================================================================== */
const CA_S_K=1.15; /* TWEAK: sculpt size (% of the 100-unit box) per avatar unit of printed width */
const caArtOn=ca=>!!(ca&&ca.art&&ARM[ca.art]&&!ARM[ca.art].custom&&!ca.noArt&&!(ca.layers||[]).length&&!(ca.baked||[]).length);
function caPlaceFromSystem(d,k){const f=armFit(k)||ARM_FIT[k];if(!f||!f.at||!EQ[f.at])return;d.eq=f.at;
  d.f2={dx:f.dx||0,dy:f.dy||0,s:Math.round((f.w||40)*CA_S_K),r:f.r||0,flip:f.flip?1:0};
  if(f.L)d.f2.L={dx:f.L.dx??f.dx??0,dy:f.L.dy??f.dy??0,s:Math.round((f.L.w||f.w||40)*CA_S_K),r:f.L.r??f.r??0};
  try{caSync(d)}catch(e){}}
{const base=caFromSystem;caFromSystem=function(d,k){const r=base.apply(this,arguments);try{if(ARM[k]){d.art=k;delete d.noArt;d.name=ARM[k].n+' (copy)';caPlaceFromSystem(d,k)}}catch(e){console.error(e)}return r}}
/* the printed part as the designer's equip point */
const caEqOf=k=>{const f=ARM_FIT[k];return f&&f.at?f.at:(ARM[k].slot==='head'?'head':'chest')};
function caStartHTML(d){const sys=Object.keys(ARM).filter(k=>!ARM[k].custom);const groups=CA_EQ_ALL.map(([eq,l])=>[l,sys.filter(k=>caEqOf(k)===eq)]).filter(g=>g[1].length);
  return `<label>${_T`Start from`}<select data-caf="start"><option value="" ${d.base?'':'selected'}>${_T`✦ A blank piece`}</option>${groups.map(([l,ks])=>`<optgroup label="${esc(l)}">${ks.map(k=>`<option value="${k}" ${d.base===k?'selected':''}>${_T`${esc(ARM[k].n)} · ${ARM[k].ap} AP · L${ARM[k].lv}`}</option>`).join('')}</optgroup>`).join('')}</select></label>
   <label>${_T`Base shape`}<select data-caf="shape">${CA_SHAPES.map(([k,l])=>`<option value="${k}" ${d.shape===k?'selected':''}>${l}</option>`).join('')}</select></label>
   ${d.art&&ARM[d.art]?`<label class="caartrow"><input type="checkbox" data-caart ${caArtOn(d)?'checked':''} ${(d.layers||[]).length||(d.baked||[]).length?'disabled':''}> ${_T`Wear the printed art of <b>${esc(ARM[d.art].n)}</b>${(d.layers||[]).length||(d.baked||[]).length?_T(' <span class="rc-sub">(your sculpt replaces it)</span>'):''}`}</label>`:''}`}
{const base=gearAHTML;gearAHTML=function(){let h=base.apply(this,arguments);try{const d=ST.ca;if(!d)return h;
  h=h.replace(/<label>Start from<select data-caf="shape">[\s\S]*?<\/select><\/label>/,caStartHTML(d));
  if(caArtOn(d))h=h.replace(/(<div class="scart[^"]*" id="caPiece"[^>]*>)[\s\S]*?(<\/div>)/,`$1<div class="caartprev">${armArtCell(d.art,200)}</div>$2`)}catch(e){console.error(e)}return h}}
{const base=caPrevRefresh;caPrevRefresh=function(){const d=ST.ca;if(caArtOn(d)){const pv=document.getElementById('caPiece');if(pv)pv.innerHTML=`<div class="caartprev">${armArtCell(d.art,200)}</div>`;return}return base.apply(this,arguments)}}
/* the art of a copy that keeps the printed look: the printed piece's own drawing (graded by level, if any) */
{const base=armSVG;armSVG=function(key,ca){const A=ARM[key]||{};const cu=ca||(A.caId?(CUSTOM.armor||[]).find(c=>c.id===A.caId):null);
  if(cu&&caArtOn(cu)){const s=base.call(this,cu.art);const g=A.grade;return g&&typeof CA_GRADE!=='undefined'&&CA_GRADE[g]?s.replace(/^<svg\b/,`<svg style="filter:${CA_GRADE[g]}"`):s}return base.apply(this,arguments)}}
/* on the body: the printed cut-out at the copy's own placement */
{const base=caOnBodySVG;caOnBodySVG=function(ca,key,mirror){try{if(caArtOn(ca)&&ca.eq&&EQ[ca.eq]){const P=ARM[ca.art];const c=ARM_CROP[P.img];if(c){const f0=caF2(ca);const f=mirror&&ca.f2&&ca.f2.L?{...f0,...ca.f2.L}:f0;
    const p=mirror?(EQ_L[ca.eq]||[150-EQ[ca.eq][0],EQ[ca.eq][1]]):EQ[ca.eq];const w=f.s/CA_S_K;const cx=mirror?p[0]-f.dx:p[0]+f.dx,cy=p[1]+f.dy;
    const B={cx,cy,w,h:w*c[3]/c[2],r:f.r||0,crop:c,side:!!mirror,mirror:!!mirror!==(!!ARM_LEFTART[ca.art]!==!!f.flip),gold:ca.art==='bracers'};
    const g=key&&ARM[key]&&ARM[key].grade;const s=armPieceSVG(B,ca.art,1,null,'ca'+(ca.id||'')+(mirror?'L':'R'));
    return g&&typeof CA_GRADE!=='undefined'&&CA_GRADE[g]?`<g style="filter:${CA_GRADE[g]}">${s}</g>`:s}}}catch(e){console.error(e)}return base.apply(this,arguments)}}
/* cards for a copy that keeps the printed look show the printed card in the Original Drawn style */
{const base=cardHTML;cardHTML=function(ref,...a){try{if(typeof ref==='string'&&ref.startsWith('a:ca_')&&armorStyle()==='scan'){const A=ARM[ref.slice(2)];const cu=A&&A.caId?(CUSTOM.armor||[]).find(c=>c.id===A.caId):null;if(cu&&caArtOn(cu))return base.call(this,'a:'+cu.art,...a)}}catch(e){}return base.call(this,ref,...a)}}
/* the controls */
document.addEventListener('change',e=>{const t=e.target;if(!ST.ca)return;
  if(t.matches('select[data-caf="start"]')){e.stopImmediatePropagation();const v=t.value;if(v){caFromSystem(ST.ca,v)}else{const keep=ST.ca.id;ST.ca=blankCA();ST.ca.id=keep}caRedraw();return}
  if(t.matches('select[data-caf="shape"]')){ST.ca.noArt=1}
  if(t.matches('input[data-caart]')){e.stopImmediatePropagation();if(t.checked)delete ST.ca.noArt;else ST.ca.noArt=1;caRedraw()}},true);
document.addEventListener('click',e=>{if(e.target.closest('[data-scb="add"]')&&ST.ca&&caArtOn(ST.ca))ST.ca.noArt=1},true);
(()=>{const st=document.createElement('style');st.textContent=`
.caartrow{display:flex!important;flex-direction:row!important;gap:6px;align-items:center;grid-column:1/-1;font-size:13px}.caartrow input{width:auto!important}
.caartprev{display:grid;place-items:center;width:100%;height:100%;min-height:200px}.caartprev .cimg,.caartprev img{max-width:220px!important;width:220px}`;document.head.appendChild(st)})();

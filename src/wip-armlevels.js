/* 92-v70 — custom armor in levels (Virgilante, v0.70).
   One design, ticked for Level I, II and/or III: each ticked level becomes its own piece — "Name I/II/III", its own market deck,
   its own colour grade (I iron · II bronze · III gold) and its own stats, bought from that level's budget (CA_BUDGET 3/5/8):
   AP 1 point each above the first (cap 7), bonus AP 2 points each, Stackable 1 point. A pair costs nothing extra.
   ca.levels = {1:{on,ap,bonusAp},2:{…},3:{…}}; shared: bonusLoc, stack, pair, art, equip point. The first ticked level keeps the
   key ca_<id>; the others are ca_<id>_L<n>. Older custom armor (no levels) keeps its single level and name. */
const CA_BUDGET={1:3,2:5,3:8};const CA_NUM={1:'I',2:'II',3:'III'};
const CA_GRADE={1:'grayscale(.6) brightness(.8) contrast(1.15)',2:'sepia(.75) saturate(1.6) hue-rotate(-14deg) brightness(.92)',3:'sepia(1) saturate(2.4) hue-rotate(-8deg) brightness(1.2) contrast(1.05)'};
const CA_GRADE_N={1:'iron',2:'bronze',3:'gold'};
function caLevels(ca){if(ca.levels&&Object.values(ca.levels).some(x=>x&&x.on))return ca.levels;const lv=clamp(+ca.lv||1,1,3);return {[lv]:{on:1,ap:clamp(+ca.ap||2,1,7),bonusAp:ca.bonusLoc?(+ca.bonusAp||0):0}}}
const caOnLv=ca=>[1,2,3].filter(n=>{const L=caLevels(ca)[n];return L&&L.on});
function caCost(ca,n,L){L=L||caLevels(ca)[n]||{};return Math.max(0,(+L.ap||1)-1)+2*(ca.bonusLoc?(+L.bonusAp||0):0)+(ca.stack?1:0)}
const caVarKey=(ca,n,first)=>n===first?'ca_'+ca.id:'ca_'+ca.id+'_L'+n;
/* a level's stats, fitted into its budget (bonus first gives way, then AP) */
function caFitBudget(ca,n){const L=(ca.levels[n]=ca.levels[n]||{on:0,ap:2,bonusAp:0});L.ap=clamp(+L.ap||1,1,7);L.bonusAp=ca.bonusLoc?clamp(+L.bonusAp||0,0,4):0;
  while(caCost(ca,n,L)>CA_BUDGET[n]&&L.bonusAp>0)L.bonusAp--;while(caCost(ca,n,L)>CA_BUDGET[n]&&L.ap>1)L.ap--;return L}
function caLevelsInit(ca){if(ca.levels)return;const lv=clamp(+ca.lv||1,1,3);ca.levels={};for(const n of [1,2,3])ca.levels[n]={on:n===lv?1:0,ap:n===lv?clamp(+ca.ap||2,1,7):[2,3,5][n-1],bonusAp:n===lv&&ca.bonusLoc?(+ca.bonusAp||0):0};
  for(const n of [1,2,3])caFitBudget(ca,n)}
/* the variants join ARM (gearRebuild deletes stale custom keys first, then calls caReg for every design) */
{const base=caReg;caReg=function(ca){const a=base.apply(this,arguments);try{if(!ca.levels)return a;const on=caOnLv(ca);if(!on.length)return a;const first=on[0];
  for(const n of on){const L=caLevels(ca)[n];const k=caVarKey(ca,n,first);const v=n===first?a:{...a};v.n=ca.name+' '+CA_NUM[n];v.lv=n;v.ap=clamp(+L.ap||1,1,7);v.grade=n;
    if(ca.bonusLoc&&+L.bonusAp)v.bonus={[ca.bonusLoc]:+L.bonusAp};else delete v.bonus;ARM[k]=v}}catch(e){console.error(e)}return a}}
{const base=gearRebuild;gearRebuild=function(){const r=base.apply(this,arguments);try{for(const ca of CUSTOM.armor||[]){if(!ca.levels)continue;const on=caOnLv(ca);
  for(const n of on.slice(1)){const k=caVarKey(ca,n,on[0]);const a=ARM[k];if(a&&a.caMarket&&(typeof rosterGate!=='function'||rosterGate('armor',ca,true))&&!MARKET_A[n].includes(k))MARKET_A[n].push(k)}}}catch(e){console.error(e)}return r}}
/* the grade on the art: every armSVG of a levelled piece, and the piece worn on the avatar */
{const base=armSVG;armSVG=function(key){const s=base.apply(this,arguments);const g=ARM[key]&&ARM[key].grade;return g&&CA_GRADE[g]?s.replace(/^<svg\b/,`<svg style="filter:${CA_GRADE[g]}"`):s}}
{const base=caOnBodySVG;caOnBodySVG=function(ca,key){const s=base.apply(this,arguments);const g=key&&ARM[key]&&ARM[key].grade;return g&&CA_GRADE[g]?s.replace(/^<g\b/,`<g style="filter:${CA_GRADE[g]}"`):s}}
/* the designer: a Levels block replaces AP, Market level and Bonus amount */
function caLevelsHTML(d){caLevelsInit(d);const btn=(a,n,v,l,dis)=>`<button class="btn tksm" type="button" data-calv="${a}" data-n="${n}" data-v="${v}" ${dis?'disabled':''}>${l}</button>`;
  const art=armSVG('ca_preview',{...d});
  return `<div class="calevels" style="grid-column:1/-1"><div class="sect" style="margin:4px 0">Levels <span class="rc-sub">tick each level it comes in · each spends its own budget · AP 1 point each above the first · bonus AP 2 · stackable 1</span></div>
   <div class="calvgrid">${[1,2,3].map(n=>{const L=d.levels[n];const used=caCost(d,n),left=CA_BUDGET[n]-used;const on=!!L.on;
     return `<div class="calv ${on?'on':''}"><label class="calvhd"><input type="checkbox" data-calv="on" data-n="${n}" ${on?'checked':''}> <b>Level ${CA_NUM[n]}</b> <span class="rc-sub">${CA_GRADE_N[n]} · ${CA_BUDGET[n]} points</span></label>
      <div class="calvart" style="filter:${CA_GRADE[n]}">${art}</div>
      ${on?`<div class="calvrow">AP ${btn('ap',n,-1,'−',L.ap<=1)}<b>${L.ap}</b>${btn('ap',n,1,'+',L.ap>=7||left<1)}</div>
      ${d.bonusLoc?`<div class="calvrow">Bonus ${btn('bonus',n,-1,'−',!L.bonusAp)}<b>+${L.bonusAp||0}</b>${btn('bonus',n,1,'+',left<2||(L.bonusAp||0)>=4)}</div>`:''}
      <div class="calvleft ${left<0?'bad':''}">${left} point${left===1?'':'s'} left</div><div class="rc-sub">${esc(d.name||'Unnamed')} ${CA_NUM[n]}</div>`:'<div class="rc-sub" style="margin-top:6px">not made</div>'}</div>`}).join('')}</div></div>`}
{const base=gearAHTML;gearAHTML=function(){let h=base.apply(this,arguments);try{const d=ST.ca;if(!d)return h;caLevelsInit(d);
  h=h.replace(/<label>AP<select data-caf="ap">[\s\S]*?<\/select><\/label>/,'').replace(/<label>Market level<select data-caf="lv">[\s\S]*?<\/select><\/label>/,'').replace(/<label>Bonus amount<select data-caf="bonusAp">[\s\S]*?<\/select><\/label>/,'');
  const i=h.indexOf('<div style="grid-column:1/-1" class="rc-sub crnote">');if(i>=0)h=h.slice(0,i)+caLevelsHTML(d)+h.slice(i);
  h=h.replace(/(<div class="rc-sub" style="text-align:center">)[^<]*·\s*\d+ AP(<\/div>)/,`$1${esc(d.name||'Unnamed piece')} · ${caOnLv(d).map(n=>CA_NUM[n]+' '+d.levels[n].ap+' AP').join(' · ')||'no level ticked'}$2`)}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest('button[data-calv]');if(!b||!ST.ca)return;const d=ST.ca;caLevelsInit(d);const n=+b.dataset.n,v=+b.dataset.v,L=d.levels[n];
  if(b.dataset.calv==='ap'){const t={...L,ap:clamp(L.ap+v,1,7)};if(caCost(d,n,t)<=CA_BUDGET[n]||v<0)L.ap=t.ap;else return mToast(`Level ${CA_NUM[n]} has ${CA_BUDGET[n]} points.`)}
  if(b.dataset.calv==='bonus'){const t={...L,bonusAp:clamp((L.bonusAp||0)+v,0,4)};if(caCost(d,n,t)<=CA_BUDGET[n]||v<0)L.bonusAp=t.bonusAp;else return mToast(`Level ${CA_NUM[n]} has ${CA_BUDGET[n]} points.`)}
  caRedraw()});
document.addEventListener('change',e=>{const c=e.target.closest('input[data-calv="on"]');if(c&&ST.ca){const d=ST.ca;caLevelsInit(d);const n=+c.dataset.n;d.levels[n].on=c.checked?1:0;caFitBudget(d,n);caRedraw();return}
  /* stackable or a new bonus location changes every level's cost: refit them */
  const f=e.target.closest('[data-caf="stack"],[data-caf="bonusLoc"]');if(f&&ST.ca){setTimeout(()=>{const d=ST.ca;caLevelsInit(d);for(const n of [1,2,3])caFitBudget(d,n);caRedraw()},0)}});
/* saving: at least one level; the first ticked level is the design's own lv/ap (older code and lists read those) */
document.addEventListener('click',e=>{const sv=e.target.closest('[data-gs="asave"]');if(!sv||!ST.ca)return;const d=ST.ca;caLevelsInit(d);const on=caOnLv(d);
  if(!on.length){e.stopImmediatePropagation();e.preventDefault();mToast('Tick at least one <b>level</b> for this piece.');return}
  for(const n of on)caFitBudget(d,n);const L=d.levels[on[0]];d.lv=on[0];d.ap=Math.max(2,L.ap);d.bonusAp=d.bonusLoc?(L.bonusAp||0):0},true);
{const base=caFromSystem;caFromSystem=function(d){const r=base.apply(this,arguments);try{delete d.levels;caLevelsInit(d)}catch(e){}return r}}
{const base=blankCA;blankCA=function(){const d=base.apply(this,arguments);d.levels={1:{on:0,ap:3,bonusAp:0},2:{on:1,ap:4,bonusAp:0},3:{on:0,ap:6,bonusAp:0}};return d}}
(()=>{const st=document.createElement('style');st.textContent=`
.calvgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.calv{border:1px solid var(--line2);border-radius:8px;padding:6px 8px;background:var(--panel2);display:grid;gap:4px;justify-items:center;opacity:.6}.calv.on{opacity:1;border-color:var(--gold)}
.calvhd{display:flex!important;gap:6px;align-items:center;justify-self:start;color:var(--bone)!important}
.calvart{width:64px;height:64px}.calvart svg{width:100%;height:100%}
.calvrow{display:flex;gap:6px;align-items:center;font-size:13px}.calvrow b{min-width:1.6em;text-align:center;font:600 15px var(--mono);color:var(--gold2)}
.calvleft{font:12px var(--mono);color:var(--muted)}.calvleft.bad{color:var(--blood2)}
@media (max-width:640px){.calvgrid{grid-template-columns:1fr}}`;document.head.appendChild(st)})();

/* =====================================================================
   184-V90YARD · v0.90 part A2 — the Training Yard and the Manager rail (Virgilante's notes, 2026-10-06)
   =====================================================================
   1. PREVIEWS. Every yard choice shows what it does to the fighter THIS WEEK, stat by stat: icon, current value → the new
      value in green with one decimal (e.g. 🏃 67 → 67.4; the gain itself in the tooltip). yd90Week(g,o) runs the week's own
      growth maths on a copy (yd90Grow = statGain's sums without side effects): the drill hours in thPlan (thResolve:
      h × TH_DRILL × GROW_SLOW), sparring pairs (+0.25 Speed and Strength), then the squad regime (weeklyGrowth:
      TRAIN_STAT, Speed 80%, Intelligence 20%; a doctore hired alone adds his private session). Bouts are not counted.
      Shown on: each squad row (ratings → this week), the routine select's other options (the chosen one stays a plain label), the ROUTINE tiles on the fighter's
      card ([data-yr90="gid|routine"], same effect as the row's select), each drill tile (planned value + what one more hour
      gives), each regime tile (for the open fighter; otherwise the raw per-fighter gain) and Study the card (Intelligence
      for your fighters on this week's card). yd90Drills(g,r) = the hours a routine would get (ord87Apply's sums).
   2. LAYOUT. The squad table and the open fighter's card sit side by side (.yd90: table left, .yd90side right); on narrow
      windows they stack. "All cards" still shows every card below, full width.
   3. Squad doctore and Study the card leave the hours strip and become cards in the right column (.yd90doc, .yd90st).
   4. The First / Normal / Last priority select is gone (yard87Row replaced); standing orders run in roster order
      (ord87RunAll replaced). Old saves keep g.ord87.p; nothing reads it.
   5. RAIL WITHOUT A FLASH. Every Manager redraw replaced the whole rail, so the sweep-made ovals, ✓ and to-do borders
      vanished for up to 700 ms. A MutationObserver on #mgrBody (installed by a wireManager wrapper; microtask = before the
      paint) puts the LIVE rail back and morphs it to the fresh one (morph90): the same buttons, only changed classes /
      text touched, the sweep-owned parts (.c73, .c85n, recpend/trpend/infpend/nightpend) kept.
   6. ON THE ROAD = NO TRAINING. While the house is on the road for Match Week (roadLocked76), thLeft is 0; the yard's hours
      strip says "🛣 Away — no training this week". Hours booked before leaving still resolve.
   Test: tv90y.
   ===================================================================== */

/* ---------- 6 · the road takes the hours ---------- */
const yd90Away=w=>{try{return typeof roadLocked76==='function'&&roadLocked76(w||W_())}catch(e){return false}};
{const base=thLeft;thLeft=function(w){if(yd90Away(w))return 0;return base.apply(this,arguments)}}

/* ---------- 1 · the week's growth, on a copy ---------- */
const YD90_K=['spd','str','int','cha'];
/* statGain's sums (66-mgr55) without side effects */
function yd90Grow(st,sx,k,amt){if(!amt||amt<=0||st[k]==null)return;let x=(sx[k]||0)+amt*GROW_SLOW(st[k]);
  while(x>=1&&st[k]<STAT_MAX){st[k]++;x-=1}if(st[k]>=STAT_MAX)x=0;sx[k]=Math.round(x*100)/100}
/* yd90Week — {k:[now (the shown rating), after the week (one decimal), gain]} for o = {drills, pairs, regime, extra:[[k,amt]]} */
function yd90Week(g,o={}){const w=W_(),m=me();const P=thPlan(w);const st0=gStats(g)||{};const sx0=g.sxp||{};const st={...st0},sx={...sx0};
  if(g.alive!==false){const drills=o.drills||P.g[g.id]||{};
    for(const [k,h] of Object.entries(drills)){if(h&&k!=='rehab')yd90Grow(st,sx,k,h*TH_DRILL)}
    for(const p of o.pairs||P.pairs){if(p.k==='spar'&&(p.a===g.id||p.b===g.id)){yd90Grow(st,sx,'spd',0.25);yd90Grow(st,sx,'str',0.25)}}
    for(const [k,a] of o.extra||[])yd90Grow(st,sx,k,a);
    const reg=o.regime!=null?o.regime:(w.train||'off');const R=TRAIN_REGIMES[reg]||TRAIN_REGIMES.off;const tr=TRAIN_STAT[reg]||0;
    let coin=m?m.coin:0;const team=R.c>0&&coin>=R.c;if(team)coin-=R.c;const solo=!team&&!!g.ptrain&&coin>=PTRAIN_COST;
    if((team||solo)&&!g.inj){const s=solo?0.35:0;yd90Grow(st,sx,'str',tr+s);yd90Grow(st,sx,'spd',(tr+s)*0.8);yd90Grow(st,sx,'int',tr*0.2)}}
  const out={};for(const k of YD90_K){const a=(st0[k]||0)+(sx0[k]||0),b=(st[k]||0)+(sx[k]||0);out[k]=[st0[k],Math.round(b*10)/10,Math.round((b-a)*100)/100]}
  return out}
/* the hours a routine would get this week (ord87Apply's sums, nothing written) */
function yd90Drills(g,r){const w=W_(),P=thPlan(w);const cur={...(P.g[g.id]||{})};
  if(g.inj||!r||r==='off'||r==='care'||yd90Away(w))return {drills:cur};
  if(r==='rest')return {drills:{},pairs:P.pairs.filter(p=>p.a!==g.id&&p.b!==g.id)};
  if(g.restWk===w.week&&!(g.ord87&&g.ord87.r==='rest'))return {drills:cur};
  let freed=0;for(const k of YD90_K){freed+=cur[k]||0;delete cur[k]}
  let left=thLeft(w)+freed,used=thOfG(P,g.id)-freed;const plan=r==='bal'?{spd:1,str:1,int:1,cha:1}:{[r]:3};
  for(const [k,n] of Object.entries(plan)){const can=Math.max(0,Math.min(n,left,TH_FIGHTER-used));if(can){cur[k]=can;left-=can;used+=can}}
  return {drills:cur}}
const yd90Ic=k=>(STATS.find(s=>s[0]===k)||[k,k,k])[2];
const yd90Nm=k=>(STATS.find(s=>s[0]===k)||[k,k])[1];
const yd90f=v=>(Math.round(v*10)/10).toFixed(1);
/* green chips for the stats that rise; all=true also lists the flat ones (the squad row's ratings) */
function yd90Chips(res,all){return YD90_K.filter(k=>all||res[k][2]>0.004).map(k=>{const [v,n,d]=res[k];
  return d>0.004?`<span class="pv90" title="${esc(_T`${yd90Nm(k)} +${yd90f(d)} this week`)}"><i>${yd90Ic(k)}</i><span>${v}</span><span class="a90">→</span><b>${yd90f(n)}</b></span>`
    :`<span class="pv90 flat" title="${esc(yd90Nm(k))}"><i>${yd90Ic(k)}</i>${v}</span>`}).join('')}
const yd90Plain=res=>YD90_K.filter(k=>res[k][2]>0.004).map(k=>`${yd90Ic(k)} ${res[k][0]}→${yd90f(res[k][1])}`).join('  ');
const yd90Open=()=>{const id=MGR.yd87;return id&&id!=='all'?gById(id):null};

/* ---------- 4 · no priority: the squad row (ratings → this week, routine, last week) ---------- */
yard87Row=function(g,w){const f=gFat(g);const o=g.ord87||{r:'off'};const N=yard87Need(g,w);const sel=MGR.yk87&&MGR.yk87.includes(g.id);const open=MGR.yd87===g.id;
  const rt=rout87(o.r||'off');const now=yd90Week(g);
  const opt=ROUT87.map(([k,ic,l])=>{let pv='';try{if(k!=='off'&&k!=='care'&&k!==rt[0])pv=yd90Plain(yd90Week(g,yd90Drills(g,k)))}catch(e){}return `<option value="${k}" ${k===rt[0]?'selected':''}>${ic} ${l}${pv?' · '+pv:''}</option>`}).join('');
  return `<div class="yo87r yo90r${N.length?' need':''}${open?' open':''}" data-yo87row="${g.id}" title="${esc(N.map(x=>x[1]).join(' · ')||_T('Click for the full card'))}">
    <label class="yo87ck" title="${_T`Select`}"><input type="checkbox" data-yk87="${g.id}" ${sel?'checked':''}></label>
    <span class="yo87nm">${gArt(g,'xs')}<b>${esc(g.name)}</b>${N.length?`<span class="yo87fl">${N.map(x=>`<i title="${esc(x[1])}">${x[0]}</i>`).join('')}</span>`:''}</span>
    <span class="yo87ft" title="${_T`Fatigue ${f}`}"><i style="width:${f}%;background:${fatCol(f)}"></i><b>${f}</b></span>
    <span class="yo87rt"><select class="tin yo87sel" data-yr87="${g.id}" title="${esc(ROUT87_SUB[rt[0]])}">${opt}</select></span>
    <span class="yo87st yo90pv">${yd90Chips(now,true)}</span>
    <span class="yo87gn" title="${_T`Last week`}">${yard87Gain(g,w)}</span></div>`};
{const base=yard87HTML;yard87HTML=function(){let h=base.apply(this,arguments);try{
  h=h.replace(/<div class="yo87th">[\s\S]*?<\/div>/,`<div class="yo87th yo90th"><span></span><span>${_T`Fighter`}</span><span>${_T`Fatigue`}</span><span>${_T`Routine`}</span></div>`)}catch(e){console.error(e)}return h}}
/* the orders run in roster order */
ord87RunAll=function(w){const m=me();if(!w||!m||w.dead||w.tutorial)return 0;const ros=rosterOf(m).filter(g=>g.ord87&&g.ord87.r&&g.ord87.r!=='off');
  for(const g of ros)ord87Apply(w,g);return ros.length};

/* ---------- 1 · the fighter's card: routine tiles + drill previews ---------- */
function yd90RoutRow(g,w){const o=g.ord87||{r:'off'};
  const tiles=ROUT87.map(([k,ic,l])=>{let pv='';try{if(k!=='off'&&k!=='care'&&!g.inj)pv=yd90Chips(yd90Week(g,yd90Drills(g,k)))}catch(e){}
    const sub=k==='off'?_T('by hand'):ROUT87_SUB[k];
    return `<button type="button" class="yd90rt${(o.r||'off')===k?' on':''}" data-yr90="${g.id}|${k}" title="${esc(sub)}">${ic} <b>${l}</b><small>${sub}</small>${pv?`<span class="pv90s">${pv}</span>`:''}</button>`}).join('');
  return `<div class="yd76row yd90row"><span class="yd76l">${_T`Routine`}</span><div class="yd76bs yd90rts">${tiles}</div></div>`}
{const base=yardCard76;yardCard76=function(g,w){let h=base.apply(this,arguments);try{w=w||W_();if(!g||!w)return h;const P=thPlan(w);const id=String(g.id).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const now=yd90Week(g);const used=thOfG(P,g.id),left=thLeft(w);
  for(const k of YD90_K){const re=new RegExp(`(data-tp="g\\|${id}\\|${k}\\|1"[^>]*>[\\s\\S]*?<b>[^<]*</b>)<span>[^<]*</span>`);
    const [v,n,d]=now[k];let more='';
    if(left>0&&used<TH_FIGHTER&&!g.inj&&g.restWk!==w.week){const dr={...(P.g[g.id]||{})};dr[k]=(dr[k]||0)+1;const x=yd90Week(g,{drills:dr})[k];more=`<small class="pv90m">${_T`+1 h → ${yd90f(x[1])}`}</small>`}
    h=h.replace(re,`$1<span>${d>0.004?`${v} → <b class="pv90g">${yd90f(n)}</b>`:v}</span>${more}`)}
  const i=h.indexOf('<div class="yd76row">');if(i>=0)h=h.slice(0,i)+yd90RoutRow(g,w)+h.slice(i)}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-yr90]');if(!t||!t.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();
  const w=W_();if(!w)return;const [gid,r]=t.dataset.yr90.split('|');const g=gById(gid);if(!g)return;ord87Set(g,r);saveWorld();const R=rout87(r);
  mToast(r==='off'?_T`${esc(g.name)}: no standing routine — set the week by hand.`:_T`📋 ${esc(g.name)}: ${R[1]} ${R[2]} every week (${ROUT87_SUB[R[0]]})${g.ord87.short?_T` — ${g.ord87.short} h short this week`:''}.`);
  if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);

/* ---------- 2 + 3 · table beside the card; doctore and study in the right column ---------- */
function yd90DocHTML(w){const P=thPlan(w);const left=thLeft(w);
  return `<div class="card2 yd90doc"><div class="yd90h">${_T`🧑‍🏫 Squad doctore`}<span class="thc"><button type="button" data-tp="doc|-1" ${P.doc>0?'':'disabled'}>−</button><b>${P.doc}</b><button type="button" data-tp="doc|1" ${left>0&&P.doc<TH_DOC?'':'disabled'}>+</button></span></div>
    <p class="rc-sub">${_T`Each hour lifts the whole squad's regime a quarter level (max ${TH_DOC} h): better odds of +1 rating, a little less injury.`}</p></div>`}
function yd90StudyHTML(w,m){const X=x74(w);const left=thLeft(w);const mine=new Set(rosterOf(m).map(x=>x.id));
  const on=[];for(const bt of w.night&&w.night.bouts||[])for(const id of bt.ents)if(mine.has(id)&&!on.includes(id))on.push(id);
  const pv=X.study?'':on.map(id=>{const g=gById(id);if(!g)return '';return `<div class="yd90sr">${gArt(g,'xs')}<b>${esc(g.name)}</b>${yd90Chips(yd90Week(g,{extra:[['int',0.4]],drills:{},pairs:[],regime:'off'}))}</div>`}).join('');
  return `<div class="card2 yd90st"><div class="yd90h">${_T`📜 Study the card`}<button type="button" class="yd76b ${X.study?'on':''}" data-yj="study" ${X.study||left<1?'disabled':''}>${X.study?_T('Done'):_T('Study · 1 h')}</button></div>
    <p class="rc-sub">${_T`Scout this week's opponents; your fighters on the card gain a little Intelligence at once.`}</p>${pv||(X.study?'':`<p class="rc-sub">${_T`None of your fighters is on this week's card.`}</p>`)}</div>`}
{const base=practiceHTML;practiceHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(!w||w.dead||MGR.view)return h;const m=me();if(!m)return h;
  /* the hours strip: doctore + study out, the road note in */
  const sq=h.indexOf('<span class="yd76sq"');if(sq>=0){const e=h.indexOf('</span></span>',sq);if(e>0)h=h.slice(0,sq)+h.slice(e+'</span></span>'.length)}
  h=h.replace(/<button type="button" class="yd76b[^"]*" data-yj="study"[^>]*>[\s\S]*?<\/small><\/button>/,'');
  if(yd90Away(w))h=h.replace(/(<div class="yd76bank">[\s\S]*?<span class="rc-sub">[^<]*<\/span>)/,`$1<span class="yd90away">${_T`🛣 Away — no training this week`}</span>`);
  /* regime tiles preview */
  const og=yd90Open();
  h=h.replace(/(<button type="button" class="yd76rg[^"]*" data-mg="regime" data-id="([a-z]+)">[\s\S]*?<\/small>)<\/button>/g,(m0,a,k)=>{let pv='';
    try{if(og&&og.alive!==false)pv=yd90Chips(yd90Week(og,{regime:k}));else{const t=TRAIN_STAT[k]||0;if(t)pv=[['str',t],['spd',t*0.8],['int',t*0.2]].map(([s,v])=>`<span class="pv90"><i>${yd90Ic(s)}</i><b>+${(Math.round(v*100)/100)}</b></span>`).join('')}}catch(e){}
    return `${a}${pv?`<span class="pv90s">${pv}</span>`:''}</button>`});
  const i=h.indexOf('<div class="card2 yo87">');if(i<0)return h;const c=cutDiv(h,i);if(!c)return h;const squad=c[0];h=c[1];
  let card='',all='';if(h.startsWith('<div class="yd76grid',i)){const c2=cutDiv(h,i);if(c2){if(MGR.yd87==='all')all=c2[0];else card=c2[0];h=c2[1]}}
  card=card.replace(/<button type="button" class="btn tksm yo87back" data-ycard87="">[^<]*<\/button>/,`<button type="button" class="btn tksm yo87back" data-ycard87="" title="${_T`Close the card`}">${_T`✕ Close`}</button>`);
  const tools=`<div class="yd90tools">${yd90DocHTML(w)}${yd90StudyHTML(w,m)}</div>`;
  const side=`<div class="yd90side">${card?card+tools:tools+(!all?`<div class="card2 yd90hint rc-sub">${_T`👈 Pick a fighter in the squad to open his card here.`}</div>`:'')}</div>`;
  return h.slice(0,i)+`<div class="yd90"><div class="yd90main">${squad}</div>${side}</div>`+all+h.slice(i)}catch(e){console.error(e);return h}}}

/* ---------- 5 · the rail stays put ---------- */
const RAIL90={el:null,obs:null,body:null,swaps:0};
const RAIL90_KEEPC=['recpend','trpend','infpend','nightpend'];
const rail90Own=n=>n.nodeType===1&&n.classList&&(n.classList.contains('c73')||n.classList.contains('c85n'));
/* morph90 — make the live node o look like the fresh node n, touching only what differs */
function morph90(o,n){
  for(const a of [...o.attributes])if(a.name!=='class'&&a.name!=='title'&&!n.hasAttribute(a.name))o.removeAttribute(a.name);
  for(const a of [...n.attributes])if(a.name!=='class'&&o.getAttribute(a.name)!==a.value)o.setAttribute(a.name,a.value);
  const want=new Set(n.classList);for(const k of RAIL90_KEEPC)if(o.classList.contains(k))want.add(k);
  for(const k of [...o.classList])if(!want.has(k))o.classList.remove(k);for(const k of want)if(!o.classList.contains(k))o.classList.add(k);
  const ok=[...o.childNodes].filter(x=>!rail90Own(x)),nk=[...n.childNodes].filter(x=>!rail90Own(x));
  for(const y of [...n.childNodes].filter(rail90Own))if(![...o.children].some(x=>x.className===y.className))o.appendChild(y);
  const same=ok.length===nk.length&&ok.every((x,j)=>x.nodeType===nk[j].nodeType&&x.nodeName===nk[j].nodeName);
  if(same){ok.forEach((x,j)=>{const y=nk[j];if(x.nodeType===1)morph90(x,y);else if(x.nodeValue!==y.nodeValue)x.nodeValue=y.nodeValue})}
  else{const anchor=[...o.childNodes].find(rail90Own)||null;for(const x of ok)x.remove();for(const y of nk)o.insertBefore(y,anchor)}}
function rail90Fix(){const body=RAIL90.body;if(!body||!body.isConnected)return;const fresh=body.querySelector('.railwrap > .tabrow');
  const live=RAIL90.el;
  if(fresh&&live&&live!==fresh&&!live.isConnected&&live.tagName===fresh.tagName){try{morph90(live,fresh);fresh.replaceWith(live);RAIL90.swaps++;return}catch(e){console.error(e)}}
  RAIL90.el=fresh||null}
function rail90Watch(){const body=document.getElementById('mgrBody');if(!body)return;if(RAIL90.body===body&&RAIL90.obs)return;
  if(RAIL90.obs)RAIL90.obs.disconnect();RAIL90.body=body;RAIL90.el=body.querySelector('.railwrap > .tabrow');
  RAIL90.obs=new MutationObserver(rail90Fix);RAIL90.obs.observe(body,{childList:true})}
{const base=wireManager;wireManager=function(){const r=base.apply(this,arguments);try{rail90Watch()}catch(e){console.error(e)}return r}}

(()=>{const st=document.createElement('style');st.textContent=`
.yd90{display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,1.1fr);gap:10px;align-items:start;margin:10px 0}
.yd90main>.yo87{margin:0}.yd90side{display:grid;gap:10px;align-content:start;min-width:0}
.yd90side .yd76grid{margin:0}.yd90side .yo87one{display:grid;gap:6px}.yd90side .yo87back{justify-self:end}
.yd90side .card2{margin:0}.yd90hint{text-align:center;padding:14px 10px}
.yd90h{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:700;font-size:14px;color:var(--gold2)}
.yd90doc p,.yd90st p{margin:4px 0 0}.yd90sr{display:flex;align-items:center;gap:6px;margin-top:5px;font-size:12.5px;flex-wrap:wrap}.yd90sr b{margin-right:4px}
.yo90th,.yo90r{grid-template-columns:22px minmax(0,1fr) 64px minmax(130px,170px)!important;grid-template-areas:"ck nm ft rt" "ck st st gn"}
.yo90th{grid-template-areas:none}.yo90r{row-gap:3px}
.yo90r .yo87ck{grid-area:ck}.yo90r .yo87nm{grid-area:nm}.yo90r .yo87ft{grid-area:ft}.yo90r .yo87rt{grid-area:rt}.yo90r .yo90pv{grid-area:st;flex-wrap:wrap;gap:4px 10px}.yo90r .yo87gn{grid-area:gn;text-align:right;color:var(--muted)}
.pv90{display:inline-flex;align-items:center;gap:3px;font-size:12px;color:var(--bone);white-space:nowrap}.pv90 i{font-style:normal}.pv90 b{color:#8fdc6a;font-weight:700}
.pv90.flat{color:var(--muted)}.pv90s{display:flex;flex-wrap:wrap;gap:2px 8px;margin-top:2px}.pv90g{color:#8fdc6a}
.yd76d .pv90m{display:block;font-size:10.5px;color:var(--muted)}
.yd90rts{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:5px}.yd90rts .yd90rt[data-yr90$="|bal"]{grid-column:span 2}
.yd90tools{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}.yd90tools .card2{margin:0}
@media (min-width:761px){.yd90side .yd76ds{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:5px}.yd90side .yd76ds .yd76d{min-width:0}.yd90side .yd76ds .yd76d b{font-size:12.5px}}
.pv90m{white-space:nowrap}
.yd90rt{display:grid;align-content:start;text-align:left;padding:3px 7px;line-height:1.25;border:1px solid var(--line2);border-radius:7px;background:var(--panel2);color:var(--bone);cursor:pointer;font-size:13px;min-width:0}
.yd90rt small{color:var(--muted);font-size:10.5px}.yd90rt.on{border-color:var(--gold);background:#3a2a18}.yd90rt:hover{border-color:var(--gold)}
.yd76rg .pv90s{font-size:11px}.yd90away{color:#f0cf7d;font-weight:600;margin-left:6px}
@media (max-width:980px){.yd90{grid-template-columns:minmax(0,1fr)}}
@media (max-width:760px){.yo90r{grid-template-columns:22px minmax(0,1fr) 64px!important;grid-template-areas:"ck nm ft" "ck rt rt" "ck st st" "ck gn gn"}.yo90r .yo87gn{text-align:left}}
`;document.head.appendChild(st)})();

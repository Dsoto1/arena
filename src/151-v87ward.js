/* =====================================================================
   151-v87ward — v0.87 Infirmary beds (his "INFIRMARY BEDS STAY")
   • THE BUG: beds took only serious wounds (serious76: surgeon-grade, −4 rating or worse, 3+ weeks). A light Medicus-grade
     wound (a torn shoulder at −3) showed no bed button on the bench, the empty cot said "give it to someone on the bench"
     but was plain text, and bedsClean76 threw any non-serious patient straight back out. Now ANY wounded fighter (not away
     at war) or one with a lost limb may take a bed (bedsClean76 replaced: bedOK87); serious wounds still NEED one.
   • Every bench card has 🛏 Put in bed (data-bed76, the 108 handler); an empty bed is a button (data-bedpick87) that offers
     the bench in a small centred popup (bedPick87, ask76 style — never modal() over the Manager).
   • An occupied bed: the body with the wound marked (injuryAvatar74), the wound, the treatment, the fit week, Take out
     (data-unbed76). Its plan tiles carry data-plan87: the chosen treatment is remembered (inj.plan87) and repeated at the
     start of every week until healed (planRun87 in an endWeek wrapper) — Rest is free and simply waits.
   • One line says what a bed gives vs the bench (BED_RULE87, the real rules: full pace, physicians, the plan; the bench:
     light wounds only, a serious wound mends at half pace without the Medicus, surgeon or Hygeia).
   • All beds taken and someone on the bench → "Beds full — build another" with the Valetudinarium's Build button.
   • Hygeia's Blessing card is left alone (infirmaryHTML keeps whatever 108 picks).
   • ONE CHANCE AT HOME (his pick, 2026-10-05): a fighter of YOUR house who has lost a third limb no longer retires at the
     week's end straight away (17-manager endWeek: severed ≥3 → retired). The first week's end only sets the deadline
     g.maim87 = next week (his week at home: before the house leaves for the road the Infirmary is open — a bed + Hygeia,
     normal coin and bed rules); if he still has 3+ lost limbs at that week's end he retires as before. The base sees at
     most two limbs while it runs, so nothing else in endWeek changes. Ward cards, the gladiator's care card, the weekly
     checklist and the before-you-leave list say "Three limbs lost — regrow one this week or he retires".
     CPU houses are unchanged (they already pay Hygeia when rich, else the maimed retire). The deadline is set only when the
     week really turned (a refused or blocked end changes nothing); regrowing even one limb (down to two) keeps him.
   ===================================================================== */
/* bedOK87 — may this fighter lie in a bed: wounded (not at war) or missing a limb */
const bedOK87=g=>!!(g&&((g.inj&&!g.inj.war)||(g.severed||[]).length));
bedsClean76=function(w){const m=me();if(!m||!w)return [];const ros=new Set(rosterOf(m).map(g=>g.id));
  w.beds76=(w.beds76||[]).filter((id,i,a)=>a.indexOf(id)===i&&ros.has(id)&&bedOK87(gById(id))).slice(0,bedsOf76(m));return w.beds76};
/* the plan names */
const PLAN87={rest:['🛏',_T('Rest')],bath:['🛁',_T('Bathhouse')],medic:['⚕',_T('Medicus')],surgeon:['🔪',_T('Surgeon')],asclepius:['⚡',_T('Asclepius')]};
const planOf87=g=>{const p=g&&g.inj&&g.inj.plan87;return PLAN87[p]?p:'rest'};
const BED_RULE87=()=>_T`🛏 A bed: full-pace healing, the physicians' cures (Medicus, surgeon, Hygeia) and the chosen treatment repeats every week until healed. 🪑 The bench: light wounds only — a serious wound mends at half pace and no physician touches it.`;
/* planRun87 — the week's turn of a bed patient's plan (same costs and effects as tapping the tile) */
function planRun87(g,w,m){const i=g.inj;if(!i||i.war||!inBed76(g))return '';const p=planOf87(g);const left=Math.max(0,repCap()-(w.repair||0));const req=injReq(i);
  if(p==='bath'){if(g.bathWk===w.week||m.coin<5)return '';m.coin-=5;g.bathWk=w.week;i.until=Math.max(w.week,(i.until||w.week)-1);g.morale=clamp(g.morale+4,0,100);
    if(i.until<=w.week&&req!=='surgeon'){delete g.inj;return _T`🛁 ${esc(g.name)}: a bathhouse day — healed.`}return _T`🛁 ${esc(g.name)}: a bathhouse day (5 coin), fit ${wkName(fitWeekOf(g))}.`}
  if(p==='medic'){if(req==='surgeon'||g.medWk===w.week||left<MEDICUS||m.coin<MEDICUS)return '';m.coin-=MEDICUS;w.repair=(w.repair||0)+MEDICUS;g.medWk=w.week;g.morale=clamp(g.morale+12,0,100);delete g.inj;return _T`⚕ ${esc(g.name)}: the Medicus clears the wound.`}
  if(p==='surgeon'){if(req!=='surgeon'||left<SURGEON||m.coin<SURGEON)return '';m.coin-=SURGEON;w.repair=(w.repair||0)+SURGEON;
    if(Math.random()<.1){i.until=w.week+2;i.neglect=0;return _T`🔪 ${esc(g.name)}: the surgeon's knife slips — another week.`}delete g.inj;g.morale=clamp(g.morale+6,0,100);return _T`🔪 ${esc(g.name)}: the surgeon closes the wound.`}
  if(p==='asclepius'){if(m.coin<ASCLEPIUS)return '';m.coin-=ASCLEPIUS;delete g.inj;g.morale=clamp(g.morale+8,0,100);return _T`⚡ ${esc(g.name)}: healed in the temple of Asclepius.`}
  return ''}
{const base=endWeek;endWeek=async function(){const w0=W_();const wk=w0&&w0.week;const r=await base.apply(this,arguments);
  try{const w=W_(),m=me();if(w&&m&&r!==false&&w.week!==wk&&!w.dead){bedsClean76(w);const L=[];for(const id of [...w.beds76]){const g=gById(id);if(!g)continue;const t=planRun87(g,w,m);if(t)L.push(t)}
    if(L.length){bedsClean76(w);for(const t of L)tnews(t);saveWorld()}}}catch(e){console.error(e)}return r}}
/* remember the plan picked on a bed's tiles (capture: runs before the Manager's own click handler) */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-plan87]');if(!b||b.disabled||!b.closest('#mgrBody'))return;const w=W_();if(!w||roadLocked76(w))return;
  const g=gById(b.dataset.id87);if(!g||!g.inj||!inBed76(g))return;g.inj.plan87=b.dataset.plan87;
  if(!b.dataset.mg){e.preventDefault();e.stopPropagation();saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()}},true);
/* bedTiles87 — the plan tiles in a bed: every tile names its plan, Rest is pickable, the chosen one is marked */
function bedTiles87(g){let h=planTiles(g).replace('<div class="rc-sub">🛏 In a bed</div>','');const cur=planOf87(g);
  h=h.replace(/<button type="button" class="plantile ([^"]*)"([^>]*)>(<span class="pi">([^<]*)<\/span>)/g,(m0,cls,attrs,pi,ic)=>{const k=Object.keys(PLAN87).find(k=>PLAN87[k][0]===ic.trim());if(!k)return m0;
    let a=attrs;if(k==='rest')a=a.replace(/\sdisabled/,'');return `<button type="button" class="plantile ${cls}${k===cur?' pick87':''}" data-plan87="${k}" data-id87="${g.id}"${a}>${pi}`});return h}
/* the popup an empty bed opens */
function benchOf87(w){const beds=bedsClean76(w);return rosterOf(me()).filter(g=>bedOK87(g)&&!beds.includes(g.id))}
function bedPick87(){const w=W_();if(!w)return;if(roadLocked76(w)){mToast(_T`🛣 On the road — the Infirmary reopens when the week ends.`);return}
  const L=benchOf87(w);for(const o of document.querySelectorAll('.ask76bg'))o.remove();
  const bg=document.createElement('div');bg.className='veraskbg ask76bg bp87bg';
  bg.innerHTML=`<div class="card2 verask" role="dialog" aria-modal="true">${_T`<b>🛏 Who takes this bed?</b>`}<div class="bp87l">${L.length?L.map(g=>`<button type="button" class="btn bp87" data-bp87="${g.id}"><b>${esc(g.name)}</b><small>${g.inj&&!g.inj.war?esc(g.inj.label):_T`lost ${(g.severed||[]).map(l=>LOCN[l].toLowerCase()).join(', ')}`}${serious76(g)?_T(' · needs a bed'):''}</small></button>`).join(''):`<span class="rc-sub">${_T`Nobody on the bench.`}</span>`}</div><div class="acts"><button type="button" class="btn" data-bp87="">${_T`Cancel`}</button></div></div>`;
  document.body.appendChild(bg);const done=()=>{bg.remove();document.removeEventListener('keydown',key,true)};const key=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();done()}};document.addEventListener('keydown',key,true);
  bg.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-bp87]');if(!b){if(e.target===bg)done();return}done();const g=b.dataset.bp87&&gById(b.dataset.bp87);if(!g)return;
    const w2=W_();bedsClean76(w2);if(!bedFree76(w2)){mToast(_T`🛏 Every bed is taken.`);return}if(!w2.beds76.includes(g.id))w2.beds76.push(g.id);tnews(_T`🛏 ${esc(g.name)} takes a bed in the Infirmary.`);saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-bedpick87]');if(!b||!b.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();bedPick87()},true);
/* the ward, rebuilt around the beds */
wardHTML76=function(){const w=W_(),m=me();const ros=rosterOf(m);const beds=bedsClean76(w);const N=bedsOf76(m);const cap=repCap(),left=Math.max(0,cap-(w.repair||0));const free=N-beds.length;
  const done=d=>d.length?`<div class="yd76res">${d.map(x=>`<span>${x}</span>`).join('')}</div>`:'';
  const hurt=ros.filter(g=>(g.inj||(g.severed||[]).length)&&!beds.includes(g.id));const bench0=hurt.filter(bedOK87);
  const cot=(id,n)=>{if(!id)return bench0.length?`<button type="button" class="wd76cot empty bp87cot" data-bedpick87="${n}"><div class="wd76ct">${_T`🛏 Bed ${n}`}</div><div class="wd76mt">${_T`Empty — tap to put someone from the bench here`}</div></button>`
      :`<div class="wd76cot empty"><div class="wd76ct">${_T`🛏 Bed ${n}`}</div><div class="wd76mt">${_T`Empty — nobody is waiting`}</div></div>`;
    const g=gById(id);const P=wardPatient76(g,w,m);const i=g.inj;const pl=planOf87(g);
    const tr=i&&!i.war?`<div class="wd76w tr87">${_T`Treatment: <b>${PLAN87[pl][0]} ${PLAN87[pl][1]}</b>${pl==='rest'?' · free':_T(' · repeats every week')} · fit <b>${wkName(fitWeekOf(g))}</b>`}</div>`:'';
    const hy=(P.cures.match(/<div class="acts" style="margin-top:4px">[\s\S]*<\/div>$/)||[''])[0];
    return `<div class="wd76cot ${i&&i.neglect?'bad':''}"><div class="wd76ct">${_T`🛏 Bed ${n}`}<button class="btn tksm" type="button" data-unbed76="${g.id}">${_T`Take out`}</button></div>
      <div class="wd76pt"><div class="wd76av">${P.av}</div><div>${P.info}${tr}</div></div>${i&&!i.war?bedTiles87(g):''}${hy}${done(P.done)}</div>`};
  const full=!free&&bench0.length;const vl=facLvl(m,'valet');const built=m.facWk===w.week;
  const build=vl<3?`<button class="btn tksm" type="button" data-mg="build" data-id="valet" ${dis([built,_T`Your builders are already busy this week.`],needCoin(m,FAC_COST[vl]))}>${_T`🏗 Build Valetudinarium ${['I','II','III'][vl]}<small>${FAC_COST[vl]} coin · +1 bed</small>`}</button>`:`<span class="rc-sub">${_T`The Valetudinarium is complete.`}</span>`;
  const bench=hurt.map(g=>{const war=g.inj&&g.inj.war;const ser=!war&&serious76(g);const P=wardPatient76(g,w,m);
    const put=bedOK87(g)?`<div class="wd76w bed87">${ser?`<span class="wd76bad">${_T`🛏 Needs a bed — half-pace mending until then`}</span> `:''}<button class="btn tksm ${free?'primary':''}" type="button" data-bed76="${g.id}" ${free?'':_T`disabled title="Beds full — build another"`}>${_T`🛏 Put in bed`}</button></div>`:'';
    return `<div class="wd76bn ${ser?'ser':''}"><div class="wd76av sm">${P.av}</div><div class="wd76bi">${war?`<b>${esc(g.name)}</b> <span class="rc-sub">${_T`⚔ ${esc(g.inj.label)} · back ${wkName(g.inj.until)}`}</span>`:P.info}
      ${put}${!war?P.cures.replace(/<div class="pw">🛏[^<]*<\/div>/,""):''}${done(P.done)}</div></div>`}).join('');
  const fit=ros.filter(g=>!g.inj);const X=x74(w);const th=thLeft(w);
  const bath=fit.map(g=>{const f=gFat(g);const r=g.restWk===w.week;const rub=X.rub.includes(g.id);
    return `<div class="wd76ba"><b>${esc(g.name)}</b><span class="fatbar"><i style="width:${f}%;background:${fatCol(f)}"></i></span><span class="rc-sub">${f}${f>50?_T(' · at risk'):''}${onCard(g)?_T(' · on the card'):''}</span>
      <button class="yd76b ${rub?'on':''}" type="button" data-bath="${g.id}" ${rub||th<1||!(f>0)?'disabled':''}>${_T`🛁 Rubdown<small>${rub?_T('done'):`1 h · ${f} → ${Math.max(0,f-10)}`}</small>`}</button>
      <button class="yd76b ${r?'on':''}" type="button" data-rest="${g.id}" title="${_T`No drills this week; fatigue −${FAT_REST} at the week's end`}">🛏 ${r?_T('Resting'):_T('Rest week')}<small>${r?_T('tap to cancel'):_T`no drills · → ${Math.max(0,f-FAT_REST)}`}</small></button></div>`}).join('');
  const wait=hurt.filter(g=>serious76(g)&&!(g.inj&&g.inj.war)).length;
  const top=`<div class="card2 wd76top">${_T`${typeof medicHTML76==='function'?medicHTML76():''}<span>🛏 <b>${beds.length} / ${N}</b> beds${wait?_T` · <b class="wd76bad">${wait} waiting</b>`:''}</span>`}
    <span title="${_T`What your Medicus, surgeon and Hygeia's priests can still do this week; the bathhouse and Asclepius are outside help`}">${_T`🧑‍⚕️ Physicians <b>${left}</b> / ${cap} coin left ⓘ`}</span>
    <span class="rc-sub">${_T`🏗 Valetudinarium ${vl}/3 · more beds and budget`}</span></div>`;
  return `${top}<div class="sect">${_T`🛏 The ward`}</div><div class="rule87 rc-sub">${BED_RULE87()}</div><div class="wd76beds">${Array.from({length:N},(_,i)=>cot(beds[i],i+1)).join('')}</div>
    ${bench?`<div class="sect">${_T`🪑 The bench`} <span class="rc-sub">${_T`light wounds only · serious ones mend at half pace`}</span></div>${full?`<div class="card2 full87">${_T`<b>🛏 Beds full — build another</b> ${build}`}</div>`:''}<div class="wd76bench">${bench}</div>`:''}
    ${fit.length?`<div class="sect">${_T`🛁 The bathhouse`} <span class="rc-sub">${_T`fatigue · above 50 a fighter may get hurt`}</span></div><div class="wd76bath">${bath}</div>`:''}
    ${typeof careGuideHTML==='function'?careGuideHTML(null):''}`};
(()=>{const st=document.createElement('style');st.textContent=`
.bp87cot{font:inherit;color:inherit;text-align:left;cursor:pointer;width:100%}.bp87cot:hover{opacity:1;border-color:var(--gold)}.bp87cot .wd76mt{color:var(--gold)}
.rule87{margin:-2px 0 8px;line-height:1.4}.tr87{color:#cfe3b8}.bed87{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.plantile.pick87{outline:2px solid var(--gold);outline-offset:-2px}
.full87{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0;border-color:#c98a2e}
.bp87l{display:grid;gap:6px;margin:8px 0 10px;max-height:50vh;overflow:auto}.bp87{display:grid;text-align:left;gap:2px}.bp87 small{color:var(--muted)}
@media (max-width:600px){.wd76beds{grid-template-columns:1fr}.wd76pt{grid-template-columns:auto minmax(0,1fr)}}`;document.head.appendChild(st)})();
/* ---------- one chance at home for a fighter with three lost limbs ---------- */
const maimed87=g=>!!(g&&g.alive!==false&&(g.severed||[]).length>=3&&!g.sotonium);
/* maimDue87 — the week whose end retires him (next week until the first week's end has set it) */
const maimDue87=(g,w)=>g.maim87&&g.maim87.wk!=null?g.maim87.wk:w.week+1;
function maimLine87(g){const w=W_();if(!w||!maimed87(g))return '';const due=maimDue87(g,w);
  if(g.fem)return due<=w.week?_T`⚠ Three limbs lost — regrow one this week or she retires`:_T`⚠ Three limbs lost — regrow one by next week's end or she retires`;
  return due<=w.week?_T`⚠ Three limbs lost — regrow one this week or he retires`:_T`⚠ Three limbs lost — regrow one by next week's end or he retires`}
{const base=endWeek;endWeek=async function(){const w=W_();const m=w&&me();const hold=[];const wk0=w&&w.week;
  try{if(w&&m&&!w.dead&&!w.tutorial)for(const g of rosterOf(m)){if(!maimed87(g)){delete g.maim87;continue}
    if(maimDue87(g,w)>w.week){hold.push([g,g.severed]);g.severed=g.severed.slice(0,2)}}}catch(e){console.error(e)}
  let r;try{r=await base.apply(this,arguments)}finally{
    for(const [g,sv] of hold){g.severed=sv;
      if(r!==false&&W_()&&W_().week!==wk0&&g.alive!==false&&!g.maim87&&maimed87(g)){g.maim87={wk:W_().week};tnews(g.fem?_T`🦿 <b>${esc(g.name)}</b> has lost three limbs — regrow one this week (a bed + Hygeia) or she retires.`:_T`🦿 <b>${esc(g.name)}</b> has lost three limbs — regrow one this week (a bed + Hygeia) or he retires.`,'bad')}}}
  try{if(r!==false&&hold.length){for(const [g] of hold)if(!maimed87(g))delete g.maim87;saveWorld()}}catch(e){}
  return r}}
{const base=wardPatient76;wardPatient76=function(g){const P=base.apply(this,arguments);try{const t=maimLine87(g);if(t)P.info+=`<div class="wd76w maim87">${t}</div>`}catch(e){}return P}}
{const base=careHTML;careHTML=function(g){const h=base.apply(this,arguments);try{const t=maimLine87(g);if(t)return `<div class="maim87 card2">${t}</div>`+h}catch(e){}return h}}
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{for(const g of rosterOf(me()).filter(maimed87))
  I.unshift({done:false,ic:'🦿',txt:`<b>${esc(g.name)}</b>: ${maimLine87(g).replace(/^⚠ /,'')}`,btn:`<button class="btn tksm" type="button" data-mg="tab" data-id="infirm">${_T`Infirmary`}</button>`})}catch(e){console.error(e)}return I}}
{const base=leaveList76;leaveList76=function(w){const L=base.apply(this,arguments);try{for(const g of rosterOf(me()).filter(maimed87))L.unshift(g.fem?_T`🦿 <b>${esc(g.name)}</b>: three limbs lost — regrow one before you leave or she retires`:_T`🦿 <b>${esc(g.name)}</b>: three limbs lost — regrow one before you leave or he retires`)}catch(e){}return L}}
(()=>{const st=document.createElement('style');st.textContent=`.maim87{color:#e07a6a;font-weight:600}div.maim87.card2{border-color:var(--blood2);margin-bottom:6px}`;document.head.appendChild(st)})();

/* =====================================================================
   81-V63 · v0.63 MANAGER BATCH
   =====================================================================
   • Rail to-do borders: 🤝 Recruiting in the recruiting-hours green while hours remain; ⚕ Infirmary light white while a hurt
     fighter still needs healing; ⚔ Match Week a light purple border (no purple fill); 🏋 Training Yard amber while
     training hours remain. One 700 ms sweep (like 47-mgr47's) keeps them true between redraws.
   • TRAINING HOURS — a second weekly pool beside the recruiting hours: 10 a week, +2 per Yard facility level, +4 in a
     bye week (thMax). Spent in the Training Yard on:
       per fighter (max 4 h each a week): 🏃 Speed or 💪 Strength drills, 📜 Tactics (Intelligence), 🎭 Crowd work
       (Charisma + fame), 🩹 Rehab (2 h takes a week off an injury);
       for the squad: 🧑‍🏫 Doctore hours (each hour = a quarter Yard level on the week's regime: better gains, fewer injuries,
       max 4), 🤝 Bond a pair (2 h: loyalty for both — luck follows), ⚔ Spar in-house (2 h: speed + strength for both, a small
       injury risk), and the practice arena's exhibitions (3 h, moved here from the recruiting hours).
     The plan resolves when the week ends (before the regime), then the pool refills. TWEAK: TH_* below.
   • The Training Yard tab: banner, then the hours plan (left) beside the practice arena (right), then regime and board.
   ===================================================================== */
const TH_BASE=10,TH_YARD=2,TH_BYE=4,TH_FIGHTER=4,TH_DOC=4,TH_DRILL=0.3,TH_FAME=0.5;
function thMax(){const w=W_(),m=me();if(!w||!m)return TH_BASE;const y=typeof facLvl==='function'?facLvl(m,'yard'):0;
  const bye=typeof BYE_WKS!=='undefined'&&typeof wkOf==='function'&&BYE_WKS.includes(wkOf(w.week));return TH_BASE+TH_YARD*y+(bye?TH_BYE:0)}
function thPlan(w){w=w||W_();if(!w.tplan||w.tplan.wk!==w.week)w.tplan={wk:w.week,g:{},doc:0,pairs:[],spent:0};return w.tplan}
const thOfG=(P,id)=>Object.values(P.g[id]||{}).reduce((a,b)=>a+b,0)+P.pairs.filter(x=>x.a===id||x.b===id).length*2;
function thUsed(w){const P=thPlan(w);return Object.keys(P.g).reduce((a,id)=>a+Object.values(P.g[id]).reduce((x,y)=>x+y,0),0)+P.doc+P.pairs.length*2+(P.spent||0)}
function thLeft(w){return Math.max(0,thMax()-thUsed(w||W_()))}
const needTHrs=(w,h)=>[thLeft(w)<h,_T`Needs ${h} training hour${h===1?'':'s'} — ${thLeft(w)} left. Hours refill when the week ends.`];
const TH_KINDS=[['spd','🏃',_T('Speed drill')],['str','💪',_T('Strength drill')],['int','📜',_T('Tactics')],['cha','🎭',_T('Crowd work')],['rehab','🩹',_T('Rehab')]];

/* ---------- the rail: to-do borders ---------- */
{const st=document.createElement('style');st.textContent=`
.mtabs [data-id="recruit"].recpend{border:2px solid #7fae5f!important;color:#b7d59d!important;box-shadow:0 0 9px rgba(127,174,95,.35)}
.mtabs [data-id="practice"].trpend{border:2px solid #d9a441!important;color:#f0cf7d!important;box-shadow:0 0 9px rgba(217,164,65,.3)}
.mtabs [data-id="infirm"].infpend{border:2px solid #e9e5dc!important;color:#f6f3ec!important;box-shadow:0 0 9px rgba(233,229,220,.3)}
.mtabs [data-id="night"].nightpend{background:none!important;border:2px solid #b9a3e3!important;color:#d9ccf4!important;box-shadow:0 0 9px rgba(185,163,227,.35)!important;animation:none!important}
.badge.thrs{border-color:#6b5420;color:#f0cf7d}
.yardtop{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;margin:10px 0 4px}
@media (max-width:820px){.yardtop{grid-template-columns:1fr}}
.yardtop>.card2{margin:0}.throw{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:4px 0}
.thg{display:grid;grid-template-columns:minmax(96px,150px) 1fr auto;gap:6px;align-items:center;margin:3px 0;padding:3px 0;border-top:1px solid var(--line2)}
.thg .thks{display:flex;gap:6px;flex-wrap:wrap}.thg>b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.thc{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--line2);border-radius:9px;padding:1px 4px;font-size:12px}
.thc b{min-width:12px;text-align:center}.thc button{background:none;border:0;color:var(--gold2);cursor:pointer;font-size:14px;padding:0 3px}
.thc button:disabled{color:var(--muted);cursor:default}.thmeter{height:6px;border-radius:3px;background:var(--line2);overflow:hidden;margin:6px 0}
.thmeter i{display:block;height:100%;background:#d9a441}`;document.head.appendChild(st)}
function railPend(){const w=W_(),m=me();if(!w||!m||w.dead)return {};const ros=rosterOf(m);
  return {recruit:(w.hours||0)>0,practice:thLeft(w)>0&&ros.length>0,
    infirm:ros.some(g=>g.inj&&!g.inj.war&&g.medWk!==w.week&&g.bathWk!==w.week)}}
setInterval(()=>{try{if(typeof W_!=='function'||!W_())return;const P=railPend();
  for(const [k,cls] of [['recruit','recpend'],['practice','trpend'],['infirm','infpend']]){const b=document.querySelector(`.mtabs [data-mg="tab"][data-id="${k}"]`);if(b)b.classList.toggle(cls,!!P[k])}
  recFit()}catch(e){}},700);
/* the free-agent list reaches down to the bottom of the fighter's details beside it (was a fixed 62vh box with blank space below) */
function recFit(){const t=document.getElementById('recTable');if(!t)return;const g=t.closest('.mgrid');const col=g&&[...g.children].find(c=>!c.contains(t));
  const floor=Math.round(innerHeight*0.62);const want=col?Math.round(col.getBoundingClientRect().bottom-t.getBoundingClientRect().top):floor;
  const v=Math.max(floor,want)+'px';if(t.style.maxHeight!==v)t.style.maxHeight=v}
/* the header shows the training hours beside the recruiting hours */
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(!w||w.dead||!me())return h;
  h=h.replace(/(Recruiting hours [^<]*<\/span>)/,`$1<span class="badge ${thLeft(w)?'thrs':''}" title="Spend them in the Training Yard">Training hours ${thLeft(w)}/${thMax()}</span>`)}catch(e){}return h}}

/* ---------- the plan: clicks ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-tp]');if(!b||b.disabled)return;e.preventDefault();const w=W_(),m=me();if(!w||!m)return;const P=thPlan(w);
  const [k,a,c,d]=b.dataset.tp.split('|');const left=thLeft(w);
  if(k==='g'){const g=gById(a);if(!g)return;const cur=(P.g[a]||{})[c]||0,dd=+d;
    if(dd>0&&(left<1||thOfG(P,a)>=TH_FIGHTER||c==='rehab'&&(!g.inj||cur>=2)||c!=='rehab'&&g.inj))return;
    const v=Math.max(0,cur+dd);P.g[a]=P.g[a]||{};if(v)P.g[a][c]=v;else delete P.g[a][c]}
  else if(k==='doc'){const v=P.doc+(+a);if(v<0||v>TH_DOC||(+a>0&&left<1))return;P.doc=v}
  else if(k==='pair'){const x=document.getElementById('thPa'),y=document.getElementById('thPb');if(!x||!y||x.value===y.value||left<2)return;
    if(thOfG(P,x.value)+2>TH_FIGHTER||thOfG(P,y.value)+2>TH_FIGHTER){mToast(_T('Each fighter can train 4 hours a week.'));return}P.pairs.push({k:a,a:x.value,b:y.value})}
  else if(k==='unpair')P.pairs.splice(+a,1);
  saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()});

/* ---------- the plan resolves when the week ends (before the regime), then the pool refills ---------- */
function thResolve(w){const P=thPlan(w),m=me();if(P.done)return;P.done=true;const out=[];const nm=id=>{const g=gById(id);return g?esc(g.name):'?'};
  for(const [id,hs] of Object.entries(P.g)){const g=gById(id);if(!g||!g.alive||!rosterOf(m).includes(g))continue;
    for(const [k,h] of Object.entries(hs)){if(!h)continue;
      if(k==='rehab'){if(g.inj&&h>=2){g.inj.until=Math.max(w.week,g.inj.until-1);out.push(_T`${nm(id)}: rehab — back a week sooner`)}continue}
      if(typeof statGain==='function')statGain(g,k,h*TH_DRILL);
      if(k==='cha'){g.fame=clamp((g.fame||0)+Math.floor(h*TH_FAME),0,100)}
      out.push(`${nm(id)}: ${h} h ${TH_KINDS.find(x=>x[0]===k)[2].toLowerCase()}`)}}
  for(const p of P.pairs){const a=gById(p.a),b=gById(p.b);if(!a||!b)continue;
    if(p.k==='bond'){for(const g of [a,b]){g.loyB=Math.min(25,(g.loyB||0)+2);g.morale=clamp((g.morale||50)+3,0,100)}out.push(_T`${nm(p.a)} & ${nm(p.b)}: bonded (+loyalty)`)}
    else{for(const g of [a,b]){if(typeof statGain==='function'){statGain(g,'spd',0.25);statGain(g,'str',0.25)}}
      const hurt=Math.random()<0.04?pickOneUI([a,b]):null;if(hurt&&!hurt.inj){hurt.inj={until:w.week+2,label:_T('a sparring knock'),pen:2};out.push(_T`${nm(hurt.id)} took a sparring knock`)}
      out.push(_T`${nm(p.a)} & ${nm(p.b)}: sparred in-house`)}}
  if(out.length){w.lastPlan=out;if(typeof tnews==='function')tnews(_T`Training hours: ${out.length} session${out.length===1?'':'s'} — ${out.slice(0,3).join('; ')}${out.length>3?'…':''}`)}}
const pickOneUI=a=>a[Math.floor(Math.random()*a.length)]; /* not the dice RNG */
/* doctore hours: the player's yard counts a quarter level higher per hour while the week resolves (facLvl is a const arrow) */
{const base=endWeek;endWeek=async function(){const w=W_(),m=w&&me();const wk=w&&w.week;let lift=0;
  try{if(w&&!w.dead&&m){thResolve(w);lift=(thPlan(w).doc||0)/4;if(lift){m.fac=m.fac||{};m.fac.yard=(m.fac.yard||0)+lift}}}catch(e){console.error(e)}
  try{return await base.apply(this,arguments)}finally{if(lift&&m&&m.fac)m.fac.yard=Math.max(0,(m.fac.yard||0)-lift);try{const w2=W_();if(w2&&w2.week!==wk)thPlan(w2)}catch(e){}}}}

/* ---------- the Training Yard tab: banner, then the hours plan beside the practice arena ---------- */
function thPlanHTML(){const w=W_(),m=me();const P=thPlan(w);const ros=rosterOf(m);const left=thLeft(w),mx=thMax();
  const ctr=(tp,v,canUp,canDn)=>`<span class="thc"><button type="button" data-tp="${tp}|-1" ${canDn?'':'disabled'}>−</button><b>${v}</b><button type="button" data-tp="${tp}|1" ${canUp?'':'disabled'}>+</button></span>`;
  const rows=ros.map(g=>{const hs=P.g[g.id]||{};const used=thOfG(P,g.id);
    const ks=TH_KINDS.filter(([k])=>g.inj?k==='rehab':k!=='rehab');
    return `<div class="thg"><b title="${esc(g.name)}">${g.inj?'⚕ ':''}${esc(g.name)}</b><span class="thks">${ks.map(([k,i,n])=>`<span title="${n}">${i}${ctr(`g|${g.id}|${k}`,hs[k]||0,left>0&&used<TH_FIGHTER&&!(k==='rehab'&&(hs[k]||0)>=2),(hs[k]||0)>0)}</span>`).join('')}</span><span class="rc-sub">${used}/${TH_FIGHTER} h</span></div>`}).join('');
  const opts=ros.filter(g=>!g.inj).map(g=>`<option value="${g.id}">${esc(g.name)}</option>`).join('');
  const pairs=P.pairs.map((p,i)=>`<div class="throw">${p.k==='bond'?'🤝':'⚔'} ${esc((gById(p.a)||{}).name||'?')} & ${esc((gById(p.b)||{}).name||'?')} <span class="rc-sub">2 h</span> <button class="btn tksm" type="button" data-tp="unpair|${i}">✕</button></div>`).join('');
  return `<div class="card2"><div class="sect" style="margin-top:0">${_T`⏳ Training hours`} <span class="rc-sub">${_T`${left} of ${mx} left · spent when the week ends`}</span></div>
    <div class="thmeter"><i style="width:${Math.round((mx-left)/Math.max(1,mx)*100)}%"></i></div>
    <div class="throw">${_T`🧑‍🏫 <b>Doctore</b> ${ctr('doc',P.doc,left>0&&P.doc<TH_DOC,P.doc>0)}`}<span class="rc-sub">${_T`each hour sharpens this week's regime (max ${TH_DOC})`}</span></div>
    ${rows||'<p class="rc-sub">No fighters in the yard.</p>'}
    <p class="rc-sub" style="margin:4px 0">${_T`🏃 Speed · 💪 Strength · 📜 Tactics (Intelligence) · 🎭 Crowd work (Charisma, fame) · 🩹 Rehab (2 h = a week sooner) · max ${TH_FIGHTER} h a fighter`}</p>
    ${ros.filter(g=>!g.inj).length>1?`<div class="throw"><select class="tin" id="thPa" style="width:auto">${opts}</select> & <select class="tin" id="thPb" style="width:auto">${ros.filter(g=>!g.inj).map((g,i)=>`<option value="${g.id}" ${i===1?'selected':''}>${esc(g.name)}</option>`).join('')}</select>
      <button class="btn tksm" type="button" data-tp="pair|bond" ${left<2?'disabled':''}>🤝 Bond · 2 h</button><button class="btn tksm" type="button" data-tp="pair|spar" ${left<2?'disabled':''}>⚔ Spar · 2 h</button></div>`:''}
    ${pairs}${(w.lastPlan||[]).length?`<div class="rc-sub" style="margin-top:6px">${_T`Last week: ${w.lastPlan.slice(0,4).map(x=>x).join(' · ')}`}</div>`:''}</div>`}
{const base=practiceHTML;practiceHTML=function(){const h=base.apply(this,arguments);try{
  const mark='<div class="sect" style="margin-top:14px">⚔ Train with other teams</div>';const i=h.indexOf(mark);if(i<0)return h;
  let yard=h.slice(0,i),arena=h.slice(i+mark.length);
  const j=yard.indexOf('<div class="roomtiles">');const banner=j>0?yard.slice(0,j):'';if(j>0)yard=yard.slice(j);
  return `${banner}<div class="yardtop">${thPlanHTML()}<div class="card2"><div class="sect" style="margin-top:0">${_T`⚔ Train with other teams`}</div>${arena}</div></div>${yard}`}catch(e){console.error(e);return h}}}


/* ---------- the fighter panel: the ratings sit in the header's empty top-right corner, not under the figure's feet ---------- */
{const st=document.createElement('style');st.textContent=`.pb-head>.statrow{margin:0 0 0 auto;align-self:flex-start;justify-content:flex-end;max-width:52%;gap:4px}
.pb-head>.statrow .badge{font-size:12px;padding:1px 6px}
.ratfold{background:none;border:1px solid var(--line2);border-radius:9px;color:var(--muted);cursor:pointer;font-size:11px;padding:1px 6px;order:99}
.pb-head>.statrow.shut>:not(.ratfold){display:none}`;document.head.appendChild(st)}
let RAT_SHUT=(()=>{try{return localStorage.getItem('flavius_ratshut')==='1'}catch(e){return false}})();
function panelStatsUp(){const b=document.getElementById('board');if(!b)return;const r=b.querySelector(':scope>.statrow'),h=b.querySelector(':scope>.pb-head');if(!r||!h)return;
  h.appendChild(r);r.classList.toggle('shut',RAT_SHUT);
  if(!r.querySelector('.ratfold')){const t=document.createElement('button');t.type='button';t.className='ratfold';r.prepend(t)}
  const t=r.querySelector('.ratfold');t.textContent=RAT_SHUT?'📊 ◂':'▸';t.title=RAT_SHUT?_T('Show the ratings'):_T('Fold the ratings away');t.setAttribute('aria-expanded',String(!RAT_SHUT))}
document.addEventListener('click',e=>{const t=e.target.closest('.ratfold');if(!t)return;e.preventDefault();RAT_SHUT=!RAT_SHUT;try{localStorage.setItem('flavius_ratshut',RAT_SHUT?'1':'0')}catch(err){}panelStatsUp()});
{const b0=()=>{const b=document.getElementById('board');if(b)new MutationObserver(panelStatsUp).observe(b,{childList:true});panelStatsUp()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',b0);else b0()}

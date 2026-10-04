/* =====================================================================
   85-V65 · v0.65 TRAINING YARD, RAIL, INFIRMARY
   =====================================================================
   • Training Yard order: banner → this week's regime → hours plan | practice arena → tiles, drill board, last week.
   • The hours planner (thPlanHTML replaced): an hours bank that drains as you plan, then one card per fighter with focus
     tiles (🏃 Speed · 💪 Strength · 📜 Tactics · 🎭 Crowd · 🩹 Rehab when hurt). Tap a tile = +1 hour (max 4 a fighter),
     tap a pip = −1. Each tile previews the rating: its bar with this week's planned gain shaded in and the next band.
   • The rail: hours left ride on the Recruiting and Training Yard tabs; every to-do outline is a thin muted line (no glow,
     no pulse) so it sits inside the rail instead of shouting.
   • Infirmary: treatment plans per patient (each option shows its cost and "fit by week N"), a recovery timeline with a
     warning when a patient is on this week's card, and FATIGUE (g.fat 0-100): bouts +25, regime +3/8/15, drill hours +2
     each, sparring +8, exhibitions +12; −10 a week, −25 with no bout and no drills, −50 with a rest week (Infirmary).
     Above 50, a fighter risks being worn down at the week's end (up to 20%). TWEAK: FAT_*.
   ===================================================================== */
const FAT_BOUT=25,FAT_REG={off:0,light:3,std:8,hard:15},FAT_HOUR=2,FAT_SPAR=8,FAT_EXH=12,FAT_DECAY=10,FAT_IDLE=25,FAT_REST=50;
const gFat=g=>Math.max(0,Math.min(100,Math.round(g&&g.fat||0)));
const fatCol=f=>f>=70?'#c9564a':f>=50?'#d9a441':'#7fae5f';
/* ---------- the Training Yard: regime first ---------- */
{const base=practiceHTML;practiceHTML=function(){let h=base.apply(this,arguments);try{
  const i=h.indexOf('<div class="sect">This week\'s regime');const j=i>=0?h.indexOf('<div class="regcards">',i):-1;
  if(i<0||j<0)return h;
  /* the regime block = its heading + the regcards row (buttons only, so the row ends at the first </div> after its last button) */
  let e=j+'<div class="regcards">'.length,depth=1;while(depth&&e<h.length){const o=h.indexOf('<div',e),c=h.indexOf('</div>',e);if(c<0)break;if(o>=0&&o<c){depth++;e=o+4}else{depth--;e=c+6}}
  const block=h.slice(i,e);h=h.slice(0,i)+h.slice(e);const top=h.indexOf('<div class="yardtop">');if(top<0)return h;
  return h.slice(0,top)+`<div class="yardreg">${block}</div>`+h.slice(top)}catch(err){console.error(err);return h}}}
/* ---------- the hours planner ---------- */
const TH_TILES=[['spd','🏃',_T('Speed')],['str','💪',_T('Strength')],['int','📜',_T('Tactics')],['cha','🎭',_T('Crowd')]];
const bandsOf=k=>k==='int'?[65,76,86,96]:k==='str'?[76,87,96]:[76,96];
function thTile(g,k,ic,lab,P,left){const hs=P.g[g.id]||{};const h=hs[k]||0;const used=thOfG(P,g.id);
  const st=gStats(g),v=st[k]||50,fr=(g.sxp&&g.sxp[k])||0;const gain=h*TH_DRILL*GROW_SLOW(v);const nb=bandsOf(k).find(s=>v<s);
  const lo=Math.floor(v/10)*10,span=10;const cur=Math.min(100,(v+fr-lo)/span*100),add=Math.min(100-cur,gain/span*100);
  const canUp=left>0&&used<TH_FIGHTER&&!g.inj;
  return `<div class="thtile ${h?'on':''}"><button type="button" class="thadd" data-tp="g|${g.id}|${k}|1" ${canUp?'':'disabled'} title="${_T`+1 hour of ${lab.toLowerCase()}`}"><span class="thic">${ic}</span><b>${lab}</b><span class="thv">${v}${gain?` → ~${(v+fr+gain).toFixed(1)}`:''}</span></button>
    <div class="thbar"><i style="width:${cur}%"></i><u style="left:${cur}%;width:${add}%"></u></div>
    <div class="thfoot"><span class="pips">${[0,1,2,3].map(n=>`<button type="button" class="pip ${n<h?'on':''}" ${n<h?_T`data-tp="g|${g.id}|${k}|-1" title="take an hour back"`:'disabled'}></button>`).join('')}</span><span class="rc-sub thnb">${nb?_T`next ${nb}`:"top"}</span></div></div>`}
thPlanHTML=function(){const w=W_(),m=me();const P=thPlan(w);const ros=rosterOf(m);const left=thLeft(w),mx=thMax();
  const bank=`<div class="thbank"><div><span class="thbig">${left}</span><span class="rc-sub"> ${_T`of ${mx} training hours left · spent when the week ends`}</span></div>
    <div class="bankpips">${Array.from({length:mx},(_,i)=>`<i class="${i<mx-left?'used':''}"></i>`).join('')}</div></div>`;
  const doc=`<div class="throw thdoc">${_T`🧑‍🏫 <b>Doctore</b>`}<span class="thc"><button type="button" data-tp="doc|-1" ${P.doc>0?'':'disabled'}>−</button><b>${P.doc}</b><button type="button" data-tp="doc|1" ${left>0&&P.doc<TH_DOC?'':'disabled'}>+</button></span><span class="rc-sub">${_T`each hour sharpens the whole squad's regime`}</span></div>`;
  const cards=ros.map(g=>{const used=thOfG(P,g.id);const f=gFat(g);const reh=(P.g[g.id]||{}).rehab||0;
    return `<div class="thcard ${g.inj?'hurt':''}"><div class="thhd">${mgAvatar(g)}<div><b>${esc(g.name)}</b><div class="rc-sub">${used}/${TH_FIGHTER} h${g.inj?` · ⚕ ${esc(g.inj.label)}`:''}</div></div>
      <span class="fatchip" title="${_T`Fatigue ${f}: bouts and hard work raise it; rest clears it; above 50 a fighter may be worn down`}"><i style="width:${f}%;background:${fatCol(f)}"></i></span></div>
      ${g.inj?`<div class="thtiles one"><div class="thtile ${reh?'on':''}"><button type="button" class="thadd" data-tp="g|${g.id}|rehab|1" ${left>0&&reh<2&&used<TH_FIGHTER?'':'disabled'}><span class="thic">🩹</span>${_T`<b>Rehab</b>`}<span class="thv">${_T`2 h = back a week sooner`}</span></button>
        <div class="thfoot"><span class="pips">${[0,1].map(n=>`<button type="button" class="pip ${n<reh?'on':''}" ${n<reh?`data-tp="g|${g.id}|rehab|-1"`:'disabled'}></button>`).join('')}</span></div></div></div>`
      :`<div class="thtiles">${TH_TILES.map(([k,ic,lab])=>thTile(g,k,ic,lab,P,left)).join('')}</div>`}</div>`}).join('');
  const fit=ros.filter(g=>!g.inj);const opts=fit.map(g=>`<option value="${g.id}">${esc(g.name)}</option>`).join('');
  const pairs=P.pairs.map((p,i)=>`<span class="pairchip">${p.k==='bond'?'🤝':'⚔'} ${esc((gById(p.a)||{}).name||'?')} & ${esc((gById(p.b)||{}).name||'?')} <button type="button" data-tp="unpair|${i}" title="cancel">✕</button></span>`).join('');
  return `<div class="card2 thplan"><div class="sect" style="margin-top:0">${_T`⏳ Training hours`}</div>${bank}${doc}<div class="thcards">${cards||`<p class="rc-sub">${_T`No fighters in the yard.`}</p>`}</div>
    ${fit.length>1?`<div class="sect">${_T`Pairs`} <span class="rc-sub">${_T`2 h each · 🤝 bond = loyalty and luck · ⚔ spar = speed and strength`}</span></div><div class="throw"><select class="tin" id="thPa" style="width:auto">${opts}</select> & <select class="tin" id="thPb" style="width:auto">${fit.map((g,i)=>`<option value="${g.id}" ${i===1?'selected':''}>${esc(g.name)}</option>`).join('')}</select>
      <button class="btn tksm" type="button" data-tp="pair|bond" ${left<2?'disabled':''}>${_T`🤝 Bond`}</button><button class="btn tksm" type="button" data-tp="pair|spar" ${left<2?'disabled':''}>${_T`⚔ Spar`}</button></div><div class="throw">${pairs}</div>`:''}
    ${(w.lastPlan||[]).length?`<div class="rc-sub" style="margin-top:6px">${_T`Last week: ${w.lastPlan.slice(0,4).join(' · ')}`}</div>`:''}</div>`};
/* ---------- the rail: hour counts, softer outlines ---------- */
{const st=document.createElement('style');st.textContent=`
.mtabs [data-id="recruit"].recpend,.mtabs [data-id="practice"].trpend,.mtabs [data-id="infirm"].infpend,.mtabs [data-id="ludus"].ludpend,.mtabs [data-id="night"].nightpend{box-shadow:none!important;animation:none!important;color:inherit!important;background:none!important}
.mtabs [data-id="recruit"].recpend{border:1px solid rgba(127,174,95,.42)!important}.mtabs [data-id="practice"].trpend{border:1px solid rgba(217,164,65,.42)!important}
.mtabs [data-id="infirm"].infpend{border:1px solid rgba(233,229,220,.32)!important}.mtabs [data-id="ludus"].ludpend{border:1px solid rgba(127,192,216,.4)!important}
.mtabs [data-id="night"].nightpend{border:1px solid rgba(185,163,227,.42)!important}
.hrchip{margin-left:auto;font:600 11px var(--mono,monospace);color:var(--muted);border:1px solid var(--line2);border-radius:8px;padding:0 5px}.mtabs button .hrchip{float:right}
.yardreg{margin:10px 0 4px}.thbank{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:2px 0 8px}.thbig{font:400 30px var(--display);color:var(--gold2)}
.bankpips{display:flex;gap:3px;flex-wrap:wrap}.bankpips i{width:10px;height:10px;border-radius:50%;background:#d9a441;display:block}.bankpips i.used{background:var(--line2)}
.thcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;margin-top:6px}.thcard{border:1px solid var(--line2);border-radius:8px;padding:8px}.thcard.hurt{border-color:rgba(201,86,74,.35)}
.thhd{display:flex;gap:8px;align-items:center;margin-bottom:6px}.thhd>div{flex:1;min-width:0}.thhd b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fatchip{width:46px;height:6px;border-radius:3px;background:var(--line2);overflow:hidden;display:block}.fatchip i{display:block;height:100%}
.thtiles{display:grid;grid-template-columns:1fr 1fr;gap:6px}.thtiles.one{grid-template-columns:1fr}.thtile{border:1px solid var(--line2);border-radius:7px;padding:5px 6px}.thtile.on{border-color:rgba(217,164,65,.55);background:rgba(217,164,65,.06)}
.thadd{all:unset;cursor:pointer;display:grid;grid-template-columns:auto 1fr;column-gap:5px;width:100%}.thadd[disabled]{cursor:default;opacity:.55}.thadd .thic{grid-row:span 2;font-size:18px}.thadd .thv{font-size:11px;color:var(--muted)}
.thbar{position:relative;height:5px;border-radius:3px;background:var(--line2);margin:5px 0 3px;overflow:hidden}.thbar i{position:absolute;left:0;top:0;bottom:0;background:#8f8a7e}.thbar u{position:absolute;top:0;bottom:0;background:#d9a441}
.thfoot{display:flex;justify-content:space-between;align-items:center}.thnb{white-space:nowrap;font-size:10px}.pips{display:flex;gap:3px}.pip{all:unset;width:9px;height:9px;border-radius:50%;border:1px solid var(--line2)}.pip.on{background:#d9a441;border-color:#d9a441;cursor:pointer}
.thhd>:first-child{width:38px;height:46px;overflow:hidden;display:block;flex:none}.thhd>:first-child *{max-width:100%;max-height:46px}
.pairchip{display:inline-flex;gap:4px;align-items:center;border:1px solid var(--line2);border-radius:12px;padding:1px 8px;margin:2px}.pairchip button{all:unset;cursor:pointer;color:var(--muted)}`;document.head.appendChild(st)}
setInterval(()=>{try{if(typeof W_!=='function'||!W_()||!me())return;const w=W_();
  for(const [k,v] of [['recruit',w.hours||0],['practice',thLeft(w)]]){const b=document.querySelector(`.mtabs [data-mg="tab"][data-id="${k}"]`);if(!b)continue;let c=b.querySelector('.hrchip');
    if(!c){c=document.createElement('span');c.className='hrchip';b.appendChild(c)}const t=v?`${v} h`:'';if(c.textContent!==t){c.textContent=t;c.title=v?_T`${v} hours left this week`:''}c.hidden=!v}}catch(e){}},700);
/* ---------- fatigue ---------- */
{const base=applyBout;applyBout=function(bi){const w=W_();let ids=[];try{const b=w&&w.night&&w.night.bouts[bi];ids=b?b.ents.slice():[]}catch(e){}const r=base.apply(this,arguments);
  try{const mine=new Set(rosterOf(me()).map(g=>g.id));for(const id of ids)if(mine.has(id)){const g=gById(id);if(g){g.fat=Math.min(100,gFat(g)+FAT_BOUT);g.fatWk=w.week}}}catch(e){}return r}}
if(typeof exhibApply==='function'){const base=exhibApply;exhibApply=function(){const r=base.apply(this,arguments);try{for(const g of rosterOf(me()))if(g.exWk===W_().week&&!g._exF){g.fat=Math.min(100,gFat(g)+FAT_EXH);g._exF=W_().week}}catch(e){}return r}}
{const base=endWeek;endWeek=async function(){const w=W_(),m=w&&me();let before=null;
  try{if(w&&!w.dead&&m){const P=thPlan(w);const reg=FAT_REG[w.train||'off']||0;before={wk:w.week,work:{}};
    for(const g of rosterOf(m)){const hrs=Object.entries(P.g[g.id]||{}).filter(([k])=>k!=='rehab').reduce((a,[,v])=>a+v,0);
      const spar=P.pairs.filter(p=>p.k==='spar'&&(p.a===g.id||p.b===g.id)).length;const resting=g.restWk===w.week;
      const work=(resting?0:reg)+hrs*FAT_HOUR+spar*FAT_SPAR;before.work[g.id]=work;g.fat=Math.min(100,gFat(g)+work)}}}catch(e){console.error(e)}
  const r=await base.apply(this,arguments);
  try{if(before&&W_()){for(const g of Object.keys(before.work).map(id=>gById(id)).filter(Boolean)){ /* everyone who was on the roster when the week began, even if the week took them away */const f=gFat(g);const busy=g.fatWk===before.wk||(before.work[g.id]||0)>0;const rest=g.restWk===before.wk;
      let nf=f-FAT_DECAY-(busy?0:FAT_IDLE-FAT_DECAY)-(rest?FAT_REST:0);g.fat=Math.max(0,nf);
      if(!g.inj&&f>50&&!rest&&Math.random()<Math.min(0.2,(f-50)/250)){g.inj={until:w.week+2,label:pickOneUI([_T('worn down: a strained back'),_T('worn down: shin splints'),_T('worn down: a pulled hamstring')]),pen:2};g.fat=Math.max(0,g.fat-30);
        if(typeof tnews==='function')tnews(_T`${esc(g.name)} is worn down (fatigue ${f}) — ${esc(g.inj.label.replace('worn down: ',''))}.`,'bad')}}}}catch(e){console.error(e)}
  return r}}
/* ---------- the Infirmary: plans, timeline, rest ---------- */
function fitWeekOf(g){const w=W_();return g.inj?Math.max(w.week,g.inj.until||w.week):w.week}
const wkName=abs=>{const w=W_();return abs<=w.week?_T('this week'):abs===w.week+1?_T('next week'):_T`week ${wkOf(abs)}`};
function onCard(g){const w=W_();return !!(w.night&&w.night.bouts&&w.night.bouts.some(b=>!b.done&&b.ents.includes(g.id)))}
function planTiles(g){const w=W_(),m=me();if(!g.inj||g.inj.war)return '';const req=injReq(g.inj);const left=Math.max(0,repCap()-(w.repair||0));const fw=fitWeekOf(g);
  const t=(act,ic,n,cost,fit,ok,why,extra='')=>`<button type="button" class="plantile ${ok?'':'off'}" ${act&&ok?`data-mg="${act}" data-id="${g.id}"`:'disabled'} title="${esc(why||'')}"><span class="pi">${ic}</span><b>${n}</b><span class="pc">${cost}</span><span class="pf">${_T`fit ${fit}`}</span>${extra}</button>`;
  const T=[t(null,'🛏',_T('Rest'),'free',wkName(fw),true,_T('Heals on its own — no action needed'),req==='surgeon'?_T('<span class="pw">festers without the surgeon</span>'):'')];
  if(req==='surgeon')T.push(t('surgeon','🔪',_T('Surgeon'),_T`${SURGEON} coin`,_T('this week'),left>=SURGEON&&m.coin>=SURGEON,_T('The only cure for a festering wound'),_T('<span class="pw">1 in 10 slips: +1 week</span>')));
  else T.push(t('medic','⚕',_T('Medicus'),_T`${MEDICUS} coin`,_T('this week'),g.medWk!==w.week&&left>=MEDICUS&&m.coin>=MEDICUS,_T('Clears it; counts toward the physicians’ weekly budget')));
  T.push(t('bath','🛁',_T('Bathhouse'),'5 coin',wkName(Math.max(w.week,fw-1)),g.bathWk!==w.week&&m.coin>=5,_T('A week faster, +4 morale')));
  T.push(t('asclepius','⚡',_T('Asclepius'),_T`${ASCLEPIUS} coin`,_T('this week'),m.coin>=ASCLEPIUS,_T('Outside help, no cap')));
  const span=Math.max(1,fw-w.week);const warn=onCard(g)&&fw>w.week;
  return `<div class="plantiles">${T.join('')}</div><div class="rtimeline" title="${_T`Weeks until fit`}">${Array.from({length:Math.min(6,span+1)},(_,i)=>`<span class="${i<span?'hurtwk':'fitwk'}">${i===0?'now':wkOf(w.week+i)}</span>`).join('')}</div>${warn?`<div class="pw">${_T`⚠ On this week's card — not fit to fight unless treated`}</div>`:''}`}
{const base=careHTML;careHTML=function(g){const h=base.apply(this,arguments);try{if(!g||!g.inj||g.inj.war)return h;
  /* the plan tiles replace the treatment buttons; Hygeia (severed limbs) and the care guide stay */
  const a=h.indexOf('<div class="acts"');const z=a>=0?h.indexOf('</div>',a):-1;if(a<0||z<0)return h;const acts=h.slice(a,z+6);
  const hy=(acts.match(/<button[^>]*data-mg="heal"[\s\S]*?<\/button>/)||[''])[0];
  return h.slice(0,a)+planTiles(g)+(hy?`<div class="acts" style="margin-top:6px">${hy}</div>`:'')+h.slice(z+6)}catch(e){return h}}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-rest]');if(!b)return;e.preventDefault();const g=gById(b.dataset.rest),w=W_();if(!g||!w)return;
  g.restWk=g.restWk===w.week?null:w.week;const P=thPlan(w);if(g.restWk===w.week){delete P.g[g.id];P.pairs=P.pairs.filter(p=>p.a!==g.id&&p.b!==g.id)}saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()});
{const base=infirmaryHTML;infirmaryHTML=function(){let h=base.apply(this,arguments);try{const w=W_();const fit=rosterOf(me()).filter(g=>!g.inj);if(!fit.length)return h;
  const rows=fit.sort((a,b)=>gFat(b)-gFat(a)).map(g=>{const f=gFat(g);const r=g.restWk===w.week;return `<div class="fatrow">${mgAvatar(g)}<b>${esc(g.name)}</b><span class="fatbar"><i style="width:${f}%;background:${fatCol(f)}"></i></span><span class="rc-sub">${f}${f>50?_T(' · at risk'):''}${onCard(g)?_T(' · on the card'):''}</span>
    <button type="button" class="btn tksm ${r?'on':''}" data-rest="${g.id}" title="${_T`No drills this week; fatigue −${FAT_REST} at the week's end`}">${r?_T('🛏 Resting'):_T('🛏 Rest week')}</button></div>`}).join('');
  const blk=`<div class="sect">${_T`😮‍💨 Fatigue`} <span class="rc-sub">${_T`bouts and hard work wear fighters down · above 50 they may get hurt · a rest week clears it`}</span></div><div class="fatrows">${rows}</div>`;
  const i=h.indexOf('<div class="sect">🗡 Cleared for the sand');return i>=0?h.slice(0,i)+blk+h.slice(i):h+blk}catch(e){console.error(e);return h}}}
{const st=document.createElement('style');st.textContent=`.plantiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:6px;margin-top:6px}
.plantile{all:unset;cursor:pointer;border:1px solid var(--line2);border-radius:7px;padding:6px;display:grid;grid-template-columns:auto 1fr;column-gap:6px;font-size:12px}.plantile:hover{border-color:var(--gold)}
.plantile .pi{grid-row:span 3;font-size:18px}.plantile .pc{color:var(--muted)}.plantile .pf{color:#9cc46e}.plantile.off{opacity:.45;cursor:default}.plantile .pw,.pw{color:#d9a441;font-size:11px;grid-column:1/-1}
.rtimeline{display:flex;gap:2px;margin:6px 0 2px}.rtimeline span{flex:1;text-align:center;font-size:10px;padding:1px 0;border-radius:3px}.rtimeline .hurtwk{background:rgba(201,86,74,.25)}.rtimeline .fitwk{background:rgba(127,174,95,.3)}
.fatrows{display:grid;gap:4px}.fatrow{display:grid;grid-template-columns:auto 140px 1fr auto auto;gap:8px;align-items:center}.fatrow b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fatrow>:first-child{width:30px;height:36px;overflow:hidden;display:block}.fatrow>:first-child *{max-width:100%;max-height:36px}
.fatbar{height:6px;border-radius:3px;background:var(--line2);overflow:hidden}.fatbar i{display:block;height:100%}
@media (max-width:700px){.fatrow{grid-template-columns:auto 1fr auto}.fatrow .fatbar,.fatrow .rc-sub{display:none}}`;document.head.appendChild(st)}
/* a fighter resting this week takes no drill hours */
{const base=thTile;thTile=function(g,k,ic,lab,P,left){return g.restWk===W_().week?base.call(this,g,k,ic,lab,P,0):base.apply(this,arguments)}}

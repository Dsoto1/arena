/* =====================================================================
   183-v90ward — v0.90 A1 · rest weeks, the Infirmary redesign, HP display, fatigue bands (Virgilante 2026-10-06)
   1. A FIGHTER ON 🛏 REST WEEK (g.restWk===w.week) CAN'T FIGHT.
      • Match Week (nightHTML wrapper, template DOM): his option in every "Enter your fighter" select is a locked slot
        ("🔒 Name — resting this week", disabled); a select with nobody left disables its Enter button; a strip above the
        card names the resting fighters with "Undo in the Infirmary" (data-inf90go → selects him there).
      • Capture guards: [data-mg="enter"] refuses a resting (or empty) pick; exhibSetup returns null for a resting fighter
        (the Training Yard's exhibition buttons then do nothing but the toast); a road deal (dealBout85) skips him; the beast
        pen already refuses (penWhy76 "Resting this week").
      • Resting a fighter who is already on this week's card is refused ([data-rest] capture: "withdraw him on Match Week
        first"); a standing 'rest' order (ord87Apply) waits a week for a fighter on the card.
      • sweep90(w): after makeNight and after the week turns (endWeek wrapper, after the standing orders) any resting
        fighter on an unfought bout — any house, also the ones auto-entered (invitationals, rivalry) — is replaced by a
        free agent in the band (the withdraw rule: voidBets refunds wagers on him).
   2. THE INFIRMARY, REDESIGNED (wardHTML76 replaced by ward90HTML; the room banner, Hygeia's card, the medicus/beds/
      physicians strip (.wd76top) and "Cleared for the sand" stay):
      • LEFT .iv90list — the beds strip (patients + empty beds: data-bedpick87 → bedPick87; beds full → Build), then one
        compact line per fighter who needs care (wounded, lost limbs, at war, Tired/Worn, resting): face, name, HP mini-bar,
        fatigue mini-bar, status chip + band chip. The fit and fresh fold below. A line selects (data-inf90 → MGR.inf90).
      • MIDDLE .iv90mid — the two bars (HP: six location segments, green, red where wounded, a lighter segment for HP above
        the default, a tick at the default; FATIGUE: amber → purple by band, ticks at 30/60), then his body
        (injuryAvatar74) with the wound location glowing red, lost limbs glowing violet, a violet aura when Worn.
      • RIGHT .iv90care — what heals him, what it does, cost and where: the wound (location named) with the treatment tiles
        (planTiles / bedTiles87 — every tile now prints what it does), the bed (data-bed76 / data-unbed76, BED_RULE87),
        Hygeia for lost limbs (data-mg="heal"), and THE BATHHOUSE (fatigue): 🛁 Rubdown (data-bath), 🛏 Rest week
        (data-rest), 📋 Care routine (data-care90 → ord87Set care/off). Every old data-* handler is reused — no rule changed.
      • "Which cure should I use?" moves into an ⓘ on the room banner (data-cure90 → a centred popup, careGuideHTML).
      • ≤760 px the three columns stack.
   3. HP RULE (display): defaults head 5, chest 6, arms/legs 5 (BASE_HP); any location may reach 7. hp90(g) reads any
      per-location HP bonus the week's care hands a fighter (boostFor(g).hp — none exists today) and shows it as a lighter
      segment above the default, clamped at 7 (the engine already caps HP at 7: distributeHP).
   4. FATIGUE BANDS ride on the weekly routine: bout +25 (85), regime drills +15/+8/+3 (FAT_REG), Care routine −20
      (FAT_CARE90, endWeek wrapper), Rest week −50 (85). In the bout (seatFor → seat.fat90 → mkPlayer → p.fat90 → mvMax):
      Fresh 0–30 = +1 movement in round 1 only · Tired 31–60 = normal · Worn 61+ = −1 movement all bout (the worn-down
      injury risk at the week's end stays as it was). Deterministic: read from g.fat when the seat is made. Band chips
      (fatChip90) on Match Week bout rows and entry options, the infirmary list and the Training Yard squad rows.
   Test: tv90w.
   ===================================================================== */
const FAT_CARE90=20;
const fatBand90=f=>f<=30?'fresh':f<=60?'tired':'worn';
const FB90_TXT=()=>({fresh:[_T('Fresh'),_T('Fresh (fatigue 0–30): +1 movement in round 1')],tired:[_T('Tired'),_T('Tired (fatigue 31–60): no change on the sand')],
  worn:[_T('Worn'),_T('Worn (fatigue 61+): −1 movement for the whole bout · may be worn down at the week’s end')]});
function fatChip90(g){const f=gFat(g);const b=fatBand90(f);const T=FB90_TXT()[b];return `<span class="fb90 fb90-${b}" title="${esc(T[1])}">${T[0]}</span>`}
const resting90=g=>{try{const w=W_();return !!(g&&w&&g.restWk!=null&&g.restWk===w.week)}catch(e){return false}};

/* ---------- 4 · fatigue in the bout ---------- */
{const base=seatFor;seatFor=function(g){const s=base.apply(this,arguments);try{if(s&&g&&g.id)s.fat90=fatBand90(gFat(g))}catch(e){}return s}}
{const base=mkPlayer;mkPlayer=function(i,s){const p=base.apply(this,arguments);try{if(p&&s&&s.fat90&&s.mgrGid)p.fat90=s.fat90}catch(e){}return p}}
/* mvMax — Fresh +1 in the first round, Worn −1 all bout (still capped 0–7) */
{const base=mvMax;mvMax=function(player){let m=base.apply(this,arguments);try{if(player&&player.fat90&&S){const d=player.fat90==='worn'?-1:player.fat90==='fresh'&&S.ri===0?1:0;if(d)m=clamp(m+d,0,7)}}catch(e){}return m}}
/* the Care routine: −20 fatigue at the week's end; resting fighters swept off unfought bouts */
function sweep90(w){const m=me();if(!w||!w.night||!w.night.bouts||!m)return 0;let n=0;const used=new Set(w.night.bouts.flatMap(b=>b.ents));
  for(const bo of w.night.bouts){if(bo.done)continue;const T=TIERS[bo.tier];if(!T)continue;
    for(const id of [...bo.ents]){const g=gById(id);if(!g||g.restWk!==w.week)continue;
      const rep=freeAgents().find(q=>!used.has(q.id)&&!q.inj&&q.restWk!==w.week&&effOvr(q)>=T.lo-3&&effOvr(q)<=T.hi+3)||genGlad({ovr:T.lo+5});
      if(!rep.debut)rep.debut={s:w.season,wk:w.week};if(!gById(rep.id))w.glads.push(rep);bo.ents[bo.ents.indexOf(id)]=rep.id;used.add(rep.id);if(typeof voidBets==='function')voidBets(bo,id);n++;
      if(g.contract&&g.contract.mgr===m.id&&typeof tnews==='function')tnews(_T`🛏 ${esc(g.name)} rests this week — taken off the ${esc(T.n)}.`)}}
  return n}
{const base=makeNight;makeNight=function(){const r=base.apply(this,arguments);try{sweep90(W_())}catch(e){console.error(e)}return r}}
{const base=endWeek;endWeek=async function(){const w=W_();const wk=w&&w.week;let care=[];
  try{const m=w&&!w.dead?me():null;if(m)care=rosterOf(m).filter(g=>g.ord87&&g.ord87.r==='care'&&!g.inj&&g.restWk!==wk).map(g=>g.id)}catch(e){}
  const r=await base.apply(this,arguments);
  try{const w2=W_();if(w2&&r!==false&&w2.week!==wk&&!w2.dead){for(const id of care){const g=gById(id);if(g)g.fat=Math.max(0,gFat(g)-FAT_CARE90)}if(sweep90(w2)||care.length)saveWorld()}}catch(e){console.error(e)}
  return r}}

/* ---------- 1 · resting fighters can't fight ---------- */
const restMsg90=g=>_T`🛏 ${esc(g.name)} is resting this week — undo the rest in the Infirmary to enter him.`;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mgrBody [data-mg="enter"]');if(!b)return;const s=document.getElementById('ent'+b.dataset.id);if(!s)return;const g=gById(s.value);
  if(!g){e.preventDefault();e.stopImmediatePropagation();mToast(_T('🛏 Nobody free to enter — the fighters left are resting this week.'));return}
  if(resting90(g)){e.preventDefault();e.stopImmediatePropagation();mToast(restMsg90(g))}},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#mgrBody [data-rest]');if(!b)return;const g=gById(b.dataset.rest);const w=W_();if(!g||!w)return;
  if(g.restWk!==w.week&&typeof onCard==='function'&&onCard(g)){e.preventDefault();e.stopImmediatePropagation();mToast(_T`⚔ ${esc(g.name)} is on this week's card — withdraw him on Match Week first.`)}},true);
{const base=exhibSetup;exhibSetup=function(myGid){const g=gById(myGid);if(resting90(g)){mToast(restMsg90(g));return null}return base.apply(this,arguments)}}
if(typeof dealBout85==='function'){const base=dealBout85;dealBout85=function(n,g){if(resting90(g)){try{mToast(restMsg90(g))}catch(e){}return -1}return base.apply(this,arguments)}}
if(typeof ord87Apply==='function'){const base=ord87Apply;ord87Apply=function(w,g){try{if(g&&g.ord87&&g.ord87.r==='rest'&&g.restWk!==w.week&&typeof onCard==='function'&&onCard(g))return}catch(e){}return base.apply(this,arguments)}}
/* Match Week: locked slots, the resting strip, band chips */
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{const w=W_(),m=me();if(typeof h!=='string'||!w||!w.night||!m)return h;
  const T=document.createElement('template');T.innerHTML=h;let hit=false;const mine=new Set(rosterOf(m).map(g=>g.id));
  for(const s of T.content.querySelectorAll('select[id^="ent"]')){let free=0;for(const o of s.querySelectorAll('option')){const g=gById(o.value);if(!g)continue;hit=true;
      if(resting90(g)){o.disabled=true;o.removeAttribute('selected');o.textContent=_T`🔒 ${g.name} — resting this week`}else{free++;o.textContent+=' · '+FB90_TXT()[fatBand90(gFat(g))][0]}}
    if(!free){const bt=s.parentNode&&s.parentNode.querySelector('[data-mg="enter"]');if(bt){bt.disabled=true;bt.title=_T('Everyone free for this bout is resting this week')}}}
  for(const tr of T.content.querySelectorAll('tr.me')){const fv=tr.querySelector('[data-mg="fav"][data-id]');const g=fv&&gById(fv.dataset.id);const nb=tr.querySelector('td b');if(!g||!nb||!mine.has(g.id))continue;hit=true;
    const c=document.createElement('template');c.innerHTML=fatChip90(g);nb.after(c.content)}
  const rest=rosterOf(m).filter(resting90);
  if(rest.length){const first=T.content.querySelector('.card2.bout');if(first){hit=true;const d=document.createElement('div');d.className='card2 rest90';
    d.innerHTML=_T`🛏 <b>Resting this week</b> — kept out of every bout:`+' '+rest.map(g=>`<span class="rest90g">🔒 <b>${esc(g.name)}</b> <button type="button" class="btn tksm" data-mg="tab" data-id="infirm" data-inf90go="${g.id}">${_T`Undo in the Infirmary`}</button></span>`).join(' ');first.before(d)}}
  return hit?T.innerHTML:h}catch(e){console.error(e);return h}}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-inf90go]');if(b)MGR.inf90=b.dataset.inf90go},true);
/* Training Yard squad rows */
if(typeof yard87Row==='function'){const base=yard87Row;yard87Row=function(g){const h=base.apply(this,arguments);try{return h.replace(/(<span class="yo87nm">[\s\S]*?<\/b>)/,`$1${fatChip90(g)}`)}catch(e){return h}}}

/* ---------- 3 · HP for the display ---------- */
const HP_ORDER90=['head','chest','rarm','larm','rleg','lleg'];
const HP_SHORT90=()=>({head:_T('Head'),chest:_T('Chest'),rarm:_T('R arm'),larm:_T('L arm'),rleg:_T('R leg'),lleg:_T('L leg')});
/* hp90 — per location {base, bonus, cur}: lost limbs 0, the wound's location at a third, any care bonus above the default (≤7) */
function hp90(g){let bonus={};try{const b=boostFor(g);if(b&&b.hp&&typeof b.hp==='object')bonus=b.hp}catch(e){}
  const wl=g&&g.inj&&!g.inj.war?injLoc74(g.inj.label):null;const loc={};let cur=0,def=0;
  for(const l of HP_ORDER90){const base=BASE_HP[l];def+=base;let v,bn=0;
    if((g.severed||[]).includes(l))v=0;else if(l===wl)v=Math.max(1,Math.round(base*0.35));else{v=Math.min(7,base+Math.max(0,+bonus[l]||0));bn=v-base}
    loc[l]={base,bonus:bn,cur:v};cur+=v}
  return {loc,cur,def,wl}}
function hpBar90(g){const H=hp90(g);
  return `<div class="iv90bar iv90hp" title="${_T`Health by location — default head 5, chest 6, limbs 5; care can raise any location to 7`}"><div class="iv90bl"><b>❤ HP</b><span>${H.cur} / ${H.def}</span></div><div class="iv90seg">${HP_ORDER90.map(l=>{const x=H.loc[l];const sev=(g.severed||[]).includes(l);
    return `<span class="sg90${sev?' sev':''}${l===H.wl?' wd':''}" title="${esc(LOCN[l])} ${x.cur}/${x.base}${x.bonus?` (+${x.bonus})`:''}"><i style="width:${(x.cur-x.bonus)/7*100}%"></i>${x.bonus?`<u style="left:${(x.cur-x.bonus)/7*100}%;width:${x.bonus/7*100}%"></u>`:''}<em style="left:${x.base/7*100}%"></em></span>`}).join('')}</div>
    <div class="iv90lab">${HP_ORDER90.map(l=>`<span>${HP_SHORT90()[l]}</span>`).join('')}</div></div>`}
function ftBar90(g){const f=gFat(g);const b=fatBand90(f);
  return `<div class="iv90bar iv90ft"><div class="iv90bl"><b>😮‍💨 ${_T`Fatigue`}</b><span>${f} · ${fatChip90(g)}</span></div><div class="iv90fb"><i class="fb90-${b}" style="width:${f}%"></i><em style="left:30%"></em><em style="left:60%"></em></div></div>`}
const miniHP90=g=>{const H=hp90(g);return `<span class="iv90mb hp" title="${_T`HP ${H.cur} / ${H.def}`}"><i style="width:${Math.min(100,H.cur/H.def*100)}%"></i></span>`};
const miniFt90=g=>{const f=gFat(g);return `<span class="iv90mb ft" title="${_T`Fatigue ${f}`}"><i class="fb90-${fatBand90(f)}" style="width:${f}%"></i></span>`};

/* ---------- 2 · the Infirmary ---------- */
const needs90=g=>!!(g.inj||(g.severed||[]).length||gFat(g)>30||resting90(g));
function status90(g){const i=g.inj;if(i&&i.war)return ['war',_T('⚔ At war')];if(i&&inBed76(g))return ['bed',_T('🛏 In bed')];if(i&&serious76(g))return ['bad',_T('🩸 Needs a bed')];if(i)return ['hurt',_T('🩸 Hurt')];
  if((g.severed||[]).length)return [inBed76(g)?'bed':'bad',_T('✂ Limb lost')];if(resting90(g))return ['rest',_T('🛏 Resting')];return ['ok',_T('Fit')]}
function row90(g,sel){const st=status90(g);
  return `<button type="button" class="iv90row${sel?' on':''}" data-inf90="${g.id}"><span class="iv90f">${gArt(g,'xs')}</span><b class="iv90n">${esc(g.name)}</b><span class="iv90bs">${miniHP90(g)}${miniFt90(g)}</span><span class="iv90c st90-${st[0]}">${st[1]}</span>${fatChip90(g)}</button>`}
/* the plan tiles say what they do (their own title text) */
const tileDoes90=h=>String(h||'').replace(/(<button type="button" class="plantile[^"]*"[^>]*title="([^"]*)"[^>]*>[\s\S]*?)(<\/button>)/g,(m0,a,t,z)=>t?`${a}<span class="pd90">${t}</span>${z}`:m0);
function avatar90(g){let sv=typeof injuryAvatar74==='function'?injuryAvatar74(g):'';if(!sv)return mgAvatar(g);
  const glow=[];if(g.inj&&!g.inj.war){const l=injLoc74(g.inj.label);const m=sv.match(new RegExp(`<path d="([^"]*)"[^>]*data-avloc="${l}"`));if(m)glow.push(`<path d="${m[1]}" fill="none" stroke="#ff4a3a" stroke-width="9" stroke-opacity=".7" filter="url(#glow90)" class="glow90" pointer-events="none"/>`)}
  for(const l of g.severed||[]){const m=sv.match(new RegExp(`<path d="([^"]*)"[^>]*data-avloc="${l}"`));if(m)glow.push(`<path d="${m[1]}" fill="#b07ae8" fill-opacity=".25" stroke="#b07ae8" stroke-width="7" stroke-opacity=".75" stroke-dasharray="6 4" filter="url(#glow90)" class="glow90 sev" pointer-events="none"/>`)}
  if(glow.length)sv=sv.replace('</svg>',`<defs><filter id="glow90" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>${glow.join('')}</svg>`);
  return sv}
function needLine90(g){const L=[];if(g.inj&&!g.inj.war)L.push(`<span class="nd90 wd">🩸 ${esc(LOCN[injLoc74(g.inj.label)]||'')}</span>`);for(const l of g.severed||[])L.push(`<span class="nd90 sv">${_T`✂ ${esc(LOCN[l]||l)} lost`}</span>`);
  const f=gFat(g);if(f>60)L.push(`<span class="nd90 ft">${_T`😮‍💨 Worn — needs rest`}</span>`);else if(f>30)L.push(`<span class="nd90 ft">${_T`😮‍💨 Tired`}</span>`);
  return L.length?L.join(''):`<span class="nd90 ok">${_T`✓ Nothing to treat`}</span>`}
function care90HTML(g,w,m){const i=g.inj,war=i&&i.war;const f=gFat(g);const X=x74(w);const th=thLeft(w);const free=bedFree76(w);const req=i&&!war?injReq(i):null;
  const need={rest:_T('rest'),medicus:_T('the Medicus'),surgeon:_T('the surgeon')}[req]||'';const sec=(ic,t,sub,body,cls='')=>`<div class="iv90s ${cls}"><div class="iv90h">${ic} <b>${t}</b>${sub?` <span class="rc-sub">${sub}</span>`:''}</div>${body}</div>`;
  const out=[];const head=`<div class="iv90who"><b>${esc(g.name)}</b> <span class="rc-sub">${_T`${effOvr(g)} · morale ${g.morale}`}</span>${typeof maimLine87==='function'&&maimLine87(g)?`<div class="wd76w maim87">${maimLine87(g)}</div>`:''}</div>`;
  if(war)out.push(sec('⚔',_T('Away at war'),'',`<div class="wd76w">${_T`${esc(i.label)} · back ${wkName(i.until)}`}</div>`));
  if(i&&!war){const loc=LOCN[injLoc74(i.label)]||'';const inb=inBed76(g);
    const tiles=tileDoes90(inb&&typeof bedTiles87==='function'?bedTiles87(g):planTiles(g).replace(/<div class="pw">🛏[^<]*<\/div>/,''));
    out.push(sec('🩸',_T`Wound · ${esc(loc)}`,_T`${esc(i.label)}${i.pen?_T` · −${i.pen} rating`:''} · needs ${need}`,
      `${i.neglect?`<div class="wd76w wd76bad">${_T`Festering ${i.neglect}/3 — only the surgeon closes it`}</div>`:''}${inb&&typeof planOf87==='function'?`<div class="wd76w tr87">${_T`Treatment: <b>${PLAN87[planOf87(g)][0]} ${PLAN87[planOf87(g)][1]}</b>${planOf87(g)==='rest'?' · free':_T(' · repeats every week')} · fit <b>${wkName(fitWeekOf(g))}</b>`}</div>`:''}${tiles}`,'wd'))}
  if(bedOK87(g)){const inb=inBed76(g);const ser=serious76(g);const vl=facLvl(m,'valet');const built=m.facWk===w.week;
    const build=!inb&&!free&&vl<3?`<button class="btn tksm" type="button" data-mg="build" data-id="valet" ${dis([built,_T`Your builders are already busy this week.`],needCoin(m,FAC_COST[vl]))}>${_T`🏗 Build Valetudinarium ${['I','II','III'][vl]}<small>${coinAmt87(FAC_COST[vl])} · +1 bed</small>`}</button>`:'';
    out.push(sec('🛏',inb?_T('In a bed'):_T('A bed'),inb?'':ser?_T('needed — half-pace mending until then'):_T`${free} free`,
      `<div class="rule87 rc-sub">${BED_RULE87()}</div><div class="acts">${inb?`<button class="btn tksm" type="button" data-unbed76="${g.id}">${_T`Take out`}</button>`
        :`<button class="btn tksm ${free?'primary':''}" type="button" data-bed76="${g.id}" ${free?'':_T`disabled title="Beds full — build another"`}>${_T`🛏 Put in bed<small>free · full-pace healing, the physicians</small>`}</button>${build}`}</div>`,'bed'))}
  if((g.severed||[]).length){const left=Math.max(0,repCap()-(w.repair||0));
    out.push(sec('🌿',_T('Hygeia'),_T('the only way to regrow a limb'),`<div class="acts"><button class="btn tksm" type="button" data-mg="heal" data-id="${g.id}" ${!inBed76(g)?_T('disabled title="Needs a bed"'):left<HYGEIA?_T`disabled title="The physicians' budget is spent this week"`:m.coin<HYGEIA?_T('disabled title="Not enough coin"'):''}>${_T`🌿 Regrow ${g.severed.map(l=>esc(LOCN[l]).toLowerCase()).join(', ')}<small>${coinAmt87(HYGEIA)} a limb · needs a bed</small>`}</button></div>`,'sv'))}
  if(!war){const r=resting90(g);const rub=X.rub.includes(g.id);const care=g.ord87&&g.ord87.r==='care';const oc=typeof onCard==='function'&&onCard(g);
    const btns=[`<button class="yd76b ${rub?'on':''}" type="button" data-bath="${g.id}" ${rub||th<1||!(f>0)?'disabled':''}>${_T`🛁 Rubdown<small>${rub?_T('done this week'):_T`1 training hour · fatigue ${f} → ${Math.max(0,f-10)}`}</small>`}</button>`];
    if(!i)btns.push(`<button class="yd76b ${r?'on':''}" type="button" data-rest="${g.id}" ${!r&&oc?_T`disabled title="On this week's card — withdraw him on Match Week first"`:''}>${r?_T`🛏 Resting<small>sits out every bout · tap to undo</small>`:_T`🛏 Rest week<small>sits out every bout · ${f} → ${Math.max(0,f-FAT_REST)} at the week's end</small>`}</button>`);
    if(typeof ord87Set==='function'&&!i)btns.push(`<button class="yd76b ${care?'on':''}" type="button" data-care90="${g.id}">${care?_T`📋 Care routine<small>on · every week −${FAT_CARE90} fatigue · tap to stop</small>`:_T`📋 Care routine<small>every week: morale talk + gear care · −${FAT_CARE90} fatigue</small>`}</button>`);
    out.push(sec('🛁',_T('The bathhouse'),_T`fatigue ${f}`,`<div class="iv90ba">${btns.join('')}</div><div class="rc-sub iv90rate">${_T`Each week: a bout +25 · drills +3 / +8 / +15 (light / normal / hard) · Care −20 · Rest week −50.`}</div>`,'ba'))}
  const done=wardDone76(g,w);if(done.length)out.push(`<div class="yd76res">${done.map(x=>`<span>${x}</span>`).join('')}</div>`);
  return head+out.join('')}
function ward90HTML(){const w=W_(),m=me();const ros=rosterOf(m);const beds=bedsClean76(w);const N=bedsOf76(m);const cap=repCap(),left=Math.max(0,cap-(w.repair||0));const free=N-beds.length;
  const need=ros.filter(needs90).sort((a,b)=>{const k=g=>g.inj&&!g.inj.war?0:(g.severed||[]).length?1:g.inj?3:2;return k(a)-k(b)||gFat(b)-gFat(a)});const fresh=ros.filter(g=>!needs90(g));
  let sel=gById(MGR.inf90);if(!sel||!ros.includes(sel))sel=need[0]||fresh[0]||null;
  const bench0=ros.filter(g=>bedOK87(g)&&!beds.includes(g.id));
  const bedChips=Array.from({length:N},(_,k)=>{const id=beds[k];if(id){const g=gById(id);return `<button type="button" class="bd90 on" data-inf90="${id}">🛏 ${esc(g?g.name:'?')}</button>`}
    return bench0.length?`<button type="button" class="bd90 empty" data-bedpick87="${k+1}">${_T`🛏 Empty bed — put someone in`}</button>`:`<span class="bd90 empty">${_T`🛏 Empty bed`}</span>`}).join('');
  const vl=facLvl(m,'valet');const built=m.facWk===w.week;const full=!free&&bench0.length;
  const build=vl<3?`<button class="btn tksm" type="button" data-mg="build" data-id="valet" ${dis([built,_T`Your builders are already busy this week.`],needCoin(m,FAC_COST[vl]))}>${_T`🏗 Build Valetudinarium ${['I','II','III'][vl]}<small>${coinAmt87(FAC_COST[vl])} · +1 bed</small>`}</button>`:'';
  const wait=ros.filter(g=>serious76(g)&&!(g.inj&&g.inj.war)&&!beds.includes(g.id)).length;
  const top=`<div class="card2 wd76top">${typeof medicHTML76==='function'?medicHTML76():''}<span>${_T`🛏 <b>${beds.length} / ${N}</b> beds`}${wait?_T` · <b class="wd76bad">${wait} waiting</b>`:''}</span>
    <span title="${_T`What your Medicus, surgeon and Hygeia's priests can still do this week; the bathhouse and Asclepius are outside help`}">${_T`🧑‍⚕️ Physicians <b>${left}</b> / ${coinAmt87(cap)} left`}</span>
    <span class="rc-sub">${_T`🏗 Valetudinarium ${vl}/3 · more beds and budget`}</span><button type="button" class="iv90why iv90why2" data-cure90>ⓘ ${_T`Which cure?`}</button></div>`;
  const list=`<div class="iv90list"><div class="iv90beds">${bedChips}</div>${full?`<div class="card2 full87">${_T`<b>🛏 Beds full — build another</b>`} ${build}</div>`:''}
    <div class="iv90lh">${_T`Needs care`} <span class="rc-sub">${need.length}</span></div>${need.length?need.map(g=>row90(g,sel===g)).join(''):`<p class="rc-sub iv90none">${_T`✓ Nobody hurt or tired.`}</p>`}
    ${fresh.length?`<details class="iv90more"${need.length?'':' open'}><summary>${_T`Fit and fresh · ${fresh.length}`}</summary>${fresh.map(g=>row90(g,sel===g)).join('')}</details>`:''}</div>`;
  if(!sel)return top+`<div class="iv90">${list}</div>`;
  const mid=`<div class="iv90mid">${hpBar90(sel)}${ftBar90(sel)}<div class="iv90av${gFat(sel)>60?' worn':''}">${avatar90(sel)}</div><div class="iv90nd">${needLine90(sel)}</div></div>`;
  return top+`<div class="iv90">${list}${mid}<div class="iv90care">${care90HTML(sel,w,m)}</div></div>`}
wardHTML76=ward90HTML;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-inf90]');if(!b||!b.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();MGR.inf90=b.dataset.inf90;if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-care90]');if(!b||b.disabled||!b.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();const w=W_();const g=gById(b.dataset.care90);if(!w||!g)return;
  if(typeof roadLocked76==='function'&&roadLocked76(w)){mToast(_T`🛣 On the road — the Infirmary reopens when the week ends.`);return}
  const on=g.ord87&&g.ord87.r==='care';ord87Set(g,on?'off':'care');if(typeof tnews==='function')tnews(on?_T`📋 ${esc(g.name)}: no standing routine.`:_T`📋 ${esc(g.name)}: Care routine — morale talk + gear care, −${FAT_CARE90} fatigue every week.`);saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* the care guide behind an ⓘ on the room banner */
{const base=infirmaryHTML;infirmaryHTML=function(){const h=base.apply(this,arguments);try{if(typeof h!=='string'||h.includes('data-cure90'))return h;
  return h.replace(/(<div class="roomttl"><b>[^<]*<\/b>)/,`$1<button type="button" class="iv90why" data-cure90 title="${_T`Which cure should I use?`}">ⓘ ${_T`Which cure?`}</button>`)}catch(e){return h}}}
function cure90Pop(){for(const o of document.querySelectorAll('.ask76bg'))o.remove();const bg=document.createElement('div');bg.className='veraskbg ask76bg cg90bg';
  bg.innerHTML=`<div class="card2 verask cg90" role="dialog" aria-modal="true"><b>${_T`ⓘ Which cure should I use?`}</b><div class="cg90b">${careGuideHTML(null).replace('<details class="careguide">','<details class="careguide" open>')}</div><div class="acts"><button type="button" class="btn" data-cg90x>${_T`Close`}</button></div></div>`;
  document.body.appendChild(bg);const done=()=>{bg.remove();document.removeEventListener('keydown',key,true)};const key=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();done()}};document.addEventListener('keydown',key,true);
  bg.addEventListener('click',e=>{e.stopPropagation();if(e.target===bg||e.target.closest('[data-cg90x]'))done()})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-cure90]');if(!b)return;e.preventDefault();e.stopPropagation();cure90Pop()},true);
(()=>{const st=document.createElement('style');st.textContent=`
.fb90{display:inline-block;font:600 10.5px var(--mono,monospace);letter-spacing:.04em;border-radius:8px;padding:0 6px;margin-left:5px;border:1px solid;vertical-align:middle;white-space:nowrap}
.fb90-fresh{color:#f0cf7d;border-color:rgba(240,207,125,.5);background:rgba(240,207,125,.08)}.fb90-tired{color:#d9a441;border-color:rgba(217,164,65,.45)}.fb90-worn{color:#c9a2f2;border-color:rgba(176,122,232,.6);background:rgba(142,92,200,.15)}
i.fb90-fresh{background:#e8c264}i.fb90-tired{background:#d08a3a}i.fb90-worn{background:#8e5cc8}
.rest90{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;margin:0 0 10px;border-color:#7a6aa0}.rest90g{display:inline-flex;gap:6px;align-items:center}
.iv90{display:grid;grid-template-columns:minmax(250px,1fr) minmax(210px,250px) minmax(280px,1.25fr);gap:12px;align-items:start;margin-top:4px}
.iv90list{display:grid;gap:4px;min-width:0}.iv90beds{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px}
.bd90{font:inherit;font-size:12px;color:inherit;border:1px solid #8a6a44;border-radius:12px;padding:2px 9px;background:var(--panel2);cursor:pointer;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bd90.empty{border-style:dashed;color:var(--muted)}button.bd90.empty{color:var(--gold)}.bd90.on{border-color:#c9a46a}
.iv90lh{font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:#c9a46a;margin-top:4px}
.iv90row{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:26px minmax(0,1fr) 64px auto auto;gap:6px;align-items:center;padding:3px 6px;border:1px solid var(--line2);border-radius:7px;background:var(--panel2);font-size:13px;width:100%}
.iv90row:hover{border-color:var(--gold)}.iv90row.on{border-color:var(--gold);box-shadow:inset 3px 0 0 var(--gold)}
.iv90f{width:26px;height:26px;overflow:hidden;display:block;border-radius:50%}.iv90f>*{width:26px!important;height:26px!important;max-width:26px;max-height:26px}.iv90f img,.iv90f svg{width:100%;height:100%}
.iv90n{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.iv90bs{display:grid;gap:2px}
.iv90mb{display:block;height:4px;border-radius:2px;background:var(--line2);overflow:hidden}.iv90mb i{display:block;height:100%}.iv90mb.hp i{background:#6fae5a}
.iv90c{font-size:11px;white-space:nowrap;color:var(--muted)}.st90-bad{color:#e07a6a}.st90-hurt{color:#f2a497}.st90-bed{color:#cfe3b8}.st90-war{color:#d9a441}.st90-rest{color:#b9a3e3}
.iv90row .fb90{margin-left:0}.iv90more summary{cursor:pointer;color:var(--muted);font-size:12px;margin:4px 0}.iv90more .iv90row{margin-top:4px}.iv90none{margin:4px 0}
.iv90mid{display:grid;gap:8px;justify-items:center;border:1px solid var(--line2);border-radius:10px;padding:8px;background:var(--panel2)}
.iv90bar{width:100%}.iv90bl{display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:3px}.iv90bl span{color:var(--muted)}
.iv90seg{display:flex;gap:2px}.sg90{position:relative;flex:1;height:10px;border-radius:2px;background:rgba(255,255,255,.07);overflow:hidden}.sg90 i{position:absolute;left:0;top:0;bottom:0;background:#6fae5a}
.sg90 u{position:absolute;top:0;bottom:0;background:#b9e3a3}.sg90 em{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.55)}.sg90.wd i{background:#c9564a}.sg90.wd{box-shadow:0 0 6px rgba(255,74,58,.7)}
.sg90.sev{background:repeating-linear-gradient(45deg,rgba(176,122,232,.35) 0 3px,transparent 3px 6px)}
.iv90lab{display:flex;gap:2px;margin-top:2px}.iv90lab span{flex:1;font-size:8.5px;color:var(--muted);text-align:center;overflow:hidden;white-space:nowrap;text-overflow:clip}
.iv90fb{position:relative;height:10px;border-radius:5px;background:rgba(255,255,255,.07);overflow:hidden}.iv90fb i{display:block;height:100%}.iv90fb em{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.4)}
.iv90av{width:150px;max-width:100%}.iv90av svg{width:100%;height:auto;display:block}.iv90av.worn svg{filter:drop-shadow(0 0 7px rgba(142,92,200,.85))}
.glow90{animation:glow90 1.8s ease-in-out infinite}@keyframes glow90{50%{stroke-opacity:.25}}body.calm .glow90{animation:none}
.iv90nd{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}.nd90{font-size:11.5px;border-radius:9px;padding:1px 7px;border:1px solid var(--line2)}.nd90.wd{color:#f2a497;border-color:rgba(255,74,58,.5)}.nd90.sv{color:#c9a2f2;border-color:rgba(176,122,232,.5)}.nd90.ft{color:#d9a441}.nd90.ok{color:#9cc46e}
.iv90care{display:grid;gap:8px;min-width:0}.iv90who b{font-size:15px}.iv90s{border:1px solid var(--line2);border-radius:8px;padding:6px 8px;background:var(--panel2)}
.iv90s.wd{border-left:3px solid #c9564a}.iv90s.ba{border-left:3px solid #8e5cc8}.iv90s.bed{border-left:3px solid #8a6a44}.iv90s.sv{border-left:3px solid #b07ae8}
.iv90h{font-size:13px;margin-bottom:4px}.iv90s .acts{margin-top:4px}.iv90s .plantiles{grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}
.pd90{grid-column:1/-1;font-size:11px;color:var(--muted);line-height:1.3;margin-top:2px}
.iv90ba{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}.iv90ba .yd76b{text-align:left}.iv90rate{margin-top:5px;font-size:11.5px}
.iv90why{display:inline-block;width:auto;align-self:flex-start;justify-self:start;font:inherit;font-size:12px;margin-left:10px;padding:1px 8px;border-radius:10px;border:1px solid rgba(240,207,125,.6);background:rgba(0,0,0,.35);color:var(--gold2);cursor:pointer;vertical-align:middle;pointer-events:auto}
.cg90{max-width:min(780px,94vw);width:780px}.cg90b{max-height:65vh;overflow:auto;margin:6px 0}.cg90b table{min-width:560px}
.iv90why2{display:none}
.locked76 [data-inf90],.locked76 [data-cure90]{opacity:1;cursor:pointer}
@media (max-width:1100px){.iv90{grid-template-columns:minmax(230px,1fr) minmax(180px,220px)}.iv90care{grid-column:1/-1}}
@media (max-width:760px){.iv90why2{display:inline-block;margin-left:0}.iv90{grid-template-columns:1fr}.iv90mid{grid-template-columns:1fr}.iv90av{width:130px}.iv90row{grid-template-columns:26px minmax(0,1fr) 54px auto}.iv90row .iv90c{display:none}}`;document.head.appendChild(st)})();

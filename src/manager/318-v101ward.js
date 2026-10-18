/* =====================================================================
   318-v101ward — v1.01 workstream B1 · THE INFIRMARY LOOP (his answer 5a, notes M14 M15 M18 M26 M30 M31)
   1. MEDICUS HOURS (M15/M26). Each week the house has 4 + 3 × Valetudinarium level + 2 × house-medicus skill (w.medicus76)
      Medicus hours (mh101Max). Every treatment costs hours (CARE101.h: Medicus 2 · surgeon 3 · Hygeia 3 a limb · bathhouse 1 ·
      Asclepius 1) + HALF of the old coin price (care101Coin: ceil(price/2)). The hours reset with the week (w.mh101 {wk,u};
      rivals m.mh101). The old physicians' coin cap (repCap / w.repair) no longer limits a treatment — the hours do.
      • ONE executor care101Do (player) + care101Why (the reason it is refused: road, already done, needs a bed, hours, coin);
        a capture click handler takes every [data-mg=medic|surgeon|heal|bath|asclepius] in #mgrBody (17's handler never sees
        them). Refusals: tiles carry data-dis (17's own "say" → note + toast).
      • planTiles replaced (same markup: bedTiles87 / 298 / the lesson's spot keep working; 108's bed rule folded in): cost =
        "N h · coin", the reason on a refused tile, what it does (.pd90), "⏳ Medicus hours: L of M left" under the tiles.
      • planRun87 (a bed's repeating plan at the week's turn) spends hours + half coin the same way.
      • Any other treatment button (the gladiator card's careHTML, the morale Medicus) is rewritten in the final mgrHTML pass:
        its <small> = hours · coin · hours left, the old cap data-dis removed, a new one when refused.
      • careGuideHTML (ⓘ Which cure?) explains the hours.
      • RIVALS: 23-ludus (Medicus / surgeon) and 17-manager endWeek (Hygeia) now call care101Cpu(m,k) — same hours (no house
        medicus) + half coin; -1 = no hours left this week (the wound waits; a rival regrows as many limbs as its hours allow).
   2. BANNER (M15): the Valetudinarium banner shows 🩸 hurt · 🛏 beds used/total · ⏳ hours left/max · coin; the house medicus
      (hired: name, skill, wage, Let go = 108's data-med76="fire"; else 🧑‍⚕️ Hire a Capsarius → a centred popup with this week's
      three candidates) and Hygeia's Blessing (149's .hyg87, data-m48) sit in the banner. The .wd76top strip below is removed.
   3. RECOVERY → THE TRAINING YARD (M31): rub-down (data-bath, 105), Care routine (data-care90, 183) and Rest week (data-rest, 85)
      leave the infirmary and become a "🛁 Recovery" block on the Doctore's side of the yard (for the fighter in the dossier),
      one plain line each (fatigue numbers from FAT_CARE90 / FAT_REST / the rub-down's −10). "Cleared for the sand" is gone.
   4. SUGGESTED ORDER (M26): ord101 = numbered steps per patient (a bed first when needed → Hygeia for a lost limb → the
      surgeon / the Medicus for the wound → fatigue work in the yard); done steps ✓; the first open step is the suggestion —
      its tile wears ★ Suggested (.v101rec).
   5. THE LIST (M18): wider list column (names fit), "Fit and fresh" open by default, 🛏 Take out (data-unbed76) on the patient's
      own row once he is in bed (no longer a care plate).
   6. CARE TILES (M18): every option its own picture (ART101: Rest = the tavern mural, bed = the barracks, Medicus = the council +
      his face, surgeon = the armory, bathhouse = the baths mural, Asclepius = the temple mural, Hygeia = the panorama + glow,
      Valetudinarium = the school), all in ONE row (scrolls sideways), "✓ this week" on what was done, a gold flash on the tile
      just clicked (MGR.v101fx) + the toast.
   7. M14 RAIL FLICKER: 184's morph90 kept only .c73/.c85n as sweep-owned, so the recruiting-hours oval (.mcount.hr99, added by
      272's 600 ms sweep) was removed on every Manager redraw and came back up to 600 ms later. morph90 replaced: .hr99 is
      sweep-owned too (kept, never removed); and the oval is written into a fresh rail at once (rail90Fix wrapper → hr99Sync).
   8. M30: the Valetudinarium upgrade is a care option in the infirmary (FAC_COST, 17's [data-mg="build"][data-id="valet"]).
   No save change (w.mh101 / m.mh101 appear when first used). Kill switch localStorage flavius_v101boff=1 (rivals pay full
   price again, nothing below installs). Test tv101b.
   ===================================================================== */
const V101B={on:(()=>{try{return localStorage.getItem('flavius_v101boff')!=='1'}catch(e){return true}})()};
/* TWEAK: Medicus hours per treatment */
const CARE101={h:{medic:2,surgeon:3,heal:3,bath:1,asclepius:1},base:4,valet:3,medicus:2};
const CARE101_PRICE={medic:()=>MEDICUS,surgeon:()=>SURGEON,heal:()=>HYGEIA,bath:()=>5,asclepius:()=>ASCLEPIUS};
const care101Coin=k=>Math.ceil(CARE101_PRICE[k]()/2);
function mh101Max(m,w){if(!m)return 0;w=w||W_();const M=m.isPlayer&&w&&w.medicus76?(w.medicus76.skill||0):0;return CARE101.base+CARE101.valet*facLvl(m,'valet')+CARE101.medicus*M}
function mh101Rec(w,m){const r=m&&m.isPlayer?w.mh101:m&&m.mh101;return r&&r.wk===w.week?r:null}
function mh101Left(w,m){w=w||W_();m=m||me();if(!w||!m)return 0;const r=mh101Rec(w,m);return Math.max(0,mh101Max(m,w)-(r?r.u:0))}
function mh101Spend(w,m,h){const r=mh101Rec(w,m)||{wk:w.week,u:0};r.u+=h;if(m.isPlayer)w.mh101=r;else m.mh101=r}
/* rivals: coin to pay for one treatment, or -1 when the house has no hours left this week (full price when switched off) */
function care101Cpu(m,k){if(!V101B.on)return CARE101_PRICE[k]();try{const w=W_();const h=CARE101.h[k];if(mh101Left(w,m)<h)return -1;mh101Spend(w,m,h);return care101Coin(k)}catch(e){return CARE101_PRICE[k]()}}

if(V101B.on){
/* ---------- 1 · the rules: why a treatment is refused, and doing it ---------- */
function care101Why(g,k,o={}){const w=W_(),m=me();if(!g||!w||!m)return _T('Nobody to treat.');
  {const j=typeof care102Why==='function'?care102Why(g,k,o):'';if(j)return j} /* v1.02 (341): a booked cure / a fresh serious wound */
  if(!o.auto&&typeof roadLocked76==='function'&&roadLocked76(w))return _T`🛣 On the road — the Infirmary reopens when the week ends.`;
  const i=g.inj;const war=i&&i.war;const sevN=(g.severed||[]).length;const bedNeed=_T('Needs a bed first — put him in one.');
  if(k==='medic'){if(war)return _T`${g.name} is with the legions — no Medicus reaches a marching camp.`;if(g.medWk===w.week)return _T`${g.name} has already seen the Medicus this week.`;
    if(i&&injReq(i)==='surgeon')return _T`The wound is beyond the Medicus — it wants the surgeon.`;if(i&&serious76(g)&&!inBed76(g))return bedNeed}
  else if(k==='surgeon'){if(!i||war||injReq(i)!=='surgeon')return _T('Nothing for the surgeon.');if(serious76(g)&&!inBed76(g))return bedNeed}
  else if(k==='bath'){if(!i||war)return _T('No wound to steam.');if(g.bathWk===w.week)return _T`${g.name} has already been steamed, scraped and oiled this week.`}
  else if(k==='asclepius'){if(!i||war)return _T('No wound for the temple.')}
  else if(k==='heal'){if(!sevN)return _T('No lost limb.');if(g.rg102&&g.rg102.wk===w.week)return _T`One limb a week — ${g.name}'s operation is booked; the limb is back when this week ends.`;if(!inBed76(g))return _T('Hygeia works only on a patient in bed — put him in one first.')}
  else return _T('Unknown treatment.');
  const h=CARE101.h[k],L=mh101Left(w,m),c=care101Coin(k);
  if(L<h)return _T`Needs ${h} Medicus hours — ${L} left this week. They come back when the week ends.`;
  if(m.coin<c)return _T`Needs ${c} coin — your treasury holds ${m.coin}.`;
  return ''}
function care101Do(g,k,o={}){const why=care101Why(g,k,o);if(why)return {ok:false,msg:why};const w=W_(),m=me();const h=CARE101.h[k],c=care101Coin(k);
  {const j=typeof care102Do==='function'?care102Do(g,k,o):null;if(j)return j} /* v1.02 (341): the cure is BOOKED — the wound closes when the week ends */
  if(k==='heal'){/* v1.02 (332 M1): ONE limb a week; it is back when the week ENDS (endWeek wrapper), fatigue +20 after */const n=1;m.coin-=c*n;mh101Spend(w,m,h*n);const was=g.severed.slice(0,n);g.rg102={wk:w.week,l:was[0]};
    ghist(g,_T`booked the Blessings of Hygeia for ${was.map(l=>LOCN[l].toLowerCase()).join(', ')}`);
    return {ok:true,msg:_T`🌿 The priests of Hygeia operate on ${esc(g.name)}'s ${was.map(l=>esc(LOCN[l]).toLowerCase()).join(', ')} (${h*n} h · ${c*n} coin) — the limb is back when the week ends, then fatigue +20.`}}
  m.coin-=c;mh101Spend(w,m,h);const i=g.inj;
  if(k==='medic'){g.medWk=w.week;g.morale=clamp(g.morale+12,0,100);if(i)delete g.inj;
    return {ok:true,msg:i?_T`⚕ The Medicus clears ${esc(g.name)}'s ${esc(i.label)} (${h} h · ${c} coin) — morale ${g.morale}.`:_T`⚕ The Medicus puts ${esc(g.name)} on a Health Elixir regimen (${h} h · ${c} coin) — morale ${g.morale}.`}}
  if(k==='surgeon'){if(Math.random()<.1){i.until=w.week+2;i.neglect=0;ghist(g,_T`the surgeon's knife slipped on ${i.label}`);return {ok:true,msg:_T`🔪 The knife slips. ${esc(g.name)} keeps the ${esc(i.label)} another week (${h} h · ${c} coin).`}}
    ghist(g,_T`under the surgeon's knife: ${i.label}, cleanly mended`);delete g.inj;g.morale=clamp(g.morale+6,0,100);return {ok:true,msg:_T`🔪 Clean work: ${esc(g.name)}'s wound is closed — fit to fight (${h} h · ${c} coin).`}}
  if(k==='bath'){g.bathWk=w.week;i.until=Math.max(w.week,(i.until||w.week)-1);g.morale=clamp(g.morale+4,0,100);
    if(i.until<=w.week&&injReq(i)!=='surgeon'){delete g.inj;return {ok:true,msg:_T`🛁 Steam, oil and a strigil: ${esc(g.name)} walks out HEALED (${h} h · ${c} coin).`}}
    return {ok:true,msg:_T`🛁 A bathhouse day for ${esc(g.name)}: a week off the healing, +4 morale (${h} h · ${c} coin).`}}
  if(k==='asclepius'){delete g.inj;g.morale=clamp(g.morale+8,0,100);ghist(g,_T('healed in the temple of Asclepius'));return {ok:true,msg:_T`⚡ One night in the temple of Asclepius: ${esc(g.name)} wakes with the ${esc(i.label)} gone (${h} h · ${c} coin).`}}
  return {ok:false,msg:''}}
/* the click: every treatment button in the Manager */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg="medic"],[data-mg="surgeon"],[data-mg="heal"],[data-mg="bath"],[data-mg="asclepius"]');
  if(!b||!b.closest('#mgrBody')||b.dataset.dis)return;const w=W_();if(!w||w.dead)return;e.preventDefault();e.stopImmediatePropagation();
  const g=gById(b.dataset.id);const k=b.dataset.mg;const r=care101Do(g,k);MGR.v101fx={id:g&&g.id,k,t:Date.now(),ok:r.ok};
  if(r.ok){if(typeof tnews==='function')tnews(r.msg);saveWorld()}MGR.msg=r.msg;if(typeof MGR_REDRAW==='function')MGR_REDRAW();if(r.msg)mToast(r.msg)},true);
/* a plan picked on a bed's tile also says so (151's capture already stored it) */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-plan87]');if(!b||!b.closest('#mgrBody')||b.dataset.mg)return;const g=gById(b.dataset.id87);if(!g||!g.inj)return;
  const p=b.dataset.plan87;MGR.v101fx={id:g.id,k:p==='rest'?'rest':p,t:Date.now(),ok:true};const P=PLAN87[p];
  setTimeout(()=>mToast(p==='rest'?_T`🛏 ${esc(g.name)} rests in bed — free, healing at full pace.`:_T`${P[0]} Plan for ${esc(g.name)}: ${P[1]} — repeats every week while the hours and coin allow.`+(b.dataset.dis?' '+esc(b.dataset.dis):'')),0)},true);

/* ---------- the tiles ---------- */
const CARE101_DOES=()=>({rest:_T('Heals on its own — no action needed'),medic:_T('Clears the wound now · +12 morale'),surgeon:_T('The only cure for a festering wound · 1 in 10 slips'),
  bath:_T('A week faster · +4 morale'),asclepius:_T('Heals any wound at once · +8 morale'),heal:_T('Regrows a lost limb')});
const mh101Line=()=>{const w=W_(),m=me();const L=mh101Left(w,m),M=mh101Max(m,w);return `<div class="v101hl${L?'':' zero'}" title="${esc(_T('Every treatment takes Medicus hours. 4 a week, +3 a Valetudinarium level, +2 a house-medicus skill level; they come back when the week ends.'))}">⏳ ${_T`Medicus hours: <b>${L}</b> of ${M} left this week`}</div>`};
planTiles=function(g){const w=W_(),m=me();if(!g||!g.inj||g.inj.war)return '';const req=injReq(g.inj);const fw=fitWeekOf(g);const D=CARE101_DOES();
  const t=(k,ic,n,fit,extra='')=>{const why=k?care101Why(g,k):'';const H=k?CARE101.h[k]:0;const cost=k?`${H} h · ${coinAmt87(care101Coin(k))}`:_T('free');
    const done=(k==='medic'&&g.medWk===w.week)||(k==='bath'&&g.bathWk===w.week);
    return `<button type="button" class="plantile ${why||!k?'off':''}${done?' on':''}" ${k?`data-mg="${k}" data-id="${g.id}"`:''}${why||!k?` data-dis="${esc(why||D.rest)}"`:''} data-v101t="${k||'rest'}" title="${esc(why||D[k||'rest'])}"><span class="pi">${ic}</span><b>${n}</b><span class="pc">${cost}</span><span class="pf">${_T`fit ${fit}`}</span><span class="pd90">${esc(D[k||'rest'])}</span>${done?`<span class="v101ok">${_T`✓ this week`}</span>`:''}${extra}</button>`};
  const T=[t(null,'🛏',_T('Rest'),wkName(fw),req==='surgeon'?_T('<span class="pw">festers without the surgeon</span>'):'')];
  if(req==='surgeon')T.push(t('surgeon','🔪',_T('Surgeon'),_T('this week')));else T.push(t('medic','⚕',_T('Medicus'),_T('this week')));
  T.push(t('bath','🛁',_T('Bathhouse'),wkName(Math.max(w.week,fw-1))));
  T.push(t('asclepius','⚡',_T('Asclepius'),_T('this week')));
  const span=Math.max(1,fw-w.week);const warn=onCard(g)&&fw>w.week;
  return `<div class="plantiles">${T.join('')}</div><div class="rtimeline" title="${_T`Weeks until fit`}">${Array.from({length:Math.min(6,span+1)},(_,i)=>`<span class="${i<span?'hurtwk':'fitwk'}">${i===0?'now':wkOf(w.week+i)}</span>`).join('')}</div>${warn?`<div class="pw">${_T`⚠ On this week's card — not fit to fight unless treated`}</div>`:''}${serious76(g)&&!inBed76(g)?`<div class="pw">${_T`🛏 Needs a bed — heals at half pace without one`}</div>`:''}${mh101Line()}`};
/* a bed patient's plan, each week: the same hours and half coin */
planRun87=function(g,w,m){const i=g.inj;if(!i||i.war||!inBed76(g))return '';const p=planOf87(g);if(!CARE101.h[p])return '';const r=care101Do(g,p,{auto:1});return r.ok?r.msg:''};

/* ---------- the care guide ---------- */
careGuideHTML=function(need){const w=W_(),m=me();const L=mh101Left(w,m),M=mh101Max(m,w);const hl=k=>need===k?' class="hl"':'';const row=(k,ic,n,does,when)=>`<tr${hl(k==='medic'?'medicus':k)}><td>${ic} ${n}</td><td>${k?CARE101.h[k]+' h':'—'}</td><td>${k?coinAmt87(care101Coin(k)):_T('free')}</td><td>${does}</td><td>${when}</td></tr>`;
  return `<details class="careguide"><summary>${_T`Which cure should I use?`} <span class="rc-sub">${_T`· ${L} of ${M} Medicus hours left this week`}</span></summary>
    <p class="rc-sub" style="margin:4px 0">${_T`Every cure takes <b>Medicus hours</b> and coin. The house has <b>${M}</b> hours a week: 4, +3 for each Valetudinarium level, +2 for each skill level of a Capsarius. Hours you don't use are lost when the week ends — a poor house can still heal, a rich one cannot buy more time.`}</p>
    <table class="tally compact"><tr><th>${_T`Cure`}</th><th>${_T`Hours`}</th><th>${_T`Cost`}</th><th>${_T`What it does`}</th><th>${_T`Use it when`}</th></tr>
     ${row(null,'💤',_T('Rest'),_T('A light wound heals by itself in a week or two'),_T('the wound is light and he can sit out a bout'))}
     ${row('bath','🛁',_T('Bathhouse'),_T('One week faster on any wound · +4 morale'),_T('cheap help while you wait; stacks with rest'))}
     ${row('medic','⚕',_T('Medicus'),_T('Clears muscle-grade wounds <b>now</b> · +12 morale · once a week each'),_T('the usual fix — back onto the card this week'))}
     ${row('surgeon','🔪',_T('Surgeon'),_T('The only cure for a <b>festering</b> wound · 1 in 10 goes wrong (a week lost)'),_T('it festers — waiting kills (3 strikes)'))}
     ${row('asclepius','⚡',_T('Asclepius'),_T('Heals <b>any</b> wound at once, no mishap · +8 morale'),_T('a star must fight this week and the coin is there'))}
     ${row('heal','🌿',_T('Hygeia'),_T('The <b>only</b> way to regrow a lost limb (a limb each time; needs a bed)'),_T('a lost limb costs 6 rating until it grows back'))}</table></details>`};

/* ---------- 4 · the suggested order ---------- */
function ord101(g){const w=W_(),m=me();const S=[];const i=g.inj;const sev=g.severed||[];const inb=inBed76(g);const f=gFat(g);
  if(i&&i.war)return [{k:'',t:_T`⚔ Away at war — back ${wkName(i.until)}. Nothing to treat until then.`,done:false}];
  const bedStep=()=>{if(!S.some(x=>x.k==='bed'))S.push({k:'bed',t:inb?_T('🛏 In a bed — full-pace healing'):_T('🛏 A bed first — the physicians treat a serious wound or a lost limb only in bed'),done:inb})};
  if(sev.length){bedStep();S.push({k:'heal',t:_T`🌿 Hygeia regrows the ${sev.map(l=>LOCN[l].toLowerCase()).join(', ')} — ${CARE101.h.heal} h + ${care101Coin('heal')} coin a limb`,done:false})}
  if(i){const req=injReq(i);if(serious76(g))bedStep();
    if(req==='surgeon')S.push({k:'surgeon',t:i.neglect?_T`🔪 The surgeon — the wound festers (${i.neglect}/3), waiting kills`:_T('🔪 The surgeon closes the wound — nothing else does'),done:false});
    else{const st={k:'medic',t:_T('⚕ The Medicus clears the wound this week'),done:false};const why=care101Why(g,'medic');
      if(why&&!care101Why(g,'bath')&&!/bed/i.test(why))st.alt='bath';S.push(st)}}
  if(f>60)S.push({k:'yard',t:_T`🛏 Worn (${f}): a Rest week in the Training Yard → Recovery`,done:false});
  else if(f>30)S.push({k:'yard',t:_T`🛁 Tired (${f}): a rub-down or the Care routine in the Training Yard → Recovery`,done:false});
  return S}
function ord101HTML(g){const S=ord101(g);if(!S.length)return `<div class="v101ord"><div class="v101oh">${_T`Suggested order`}</div><div class="v101os ok">${_T`✓ Nothing to treat — fit for the sand.`}</div></div>`;
  const first=S.findIndex(x=>!x.done&&x.k);const rk=first>=0?(S[first].alt||S[first].k):'';
  return `<div class="v101ord" data-v101rk="${rk}"><div class="v101oh">${_T`Suggested order`}</div>${S.map((x,n)=>{const why=x.k&&x.k!=='bed'&&x.k!=='yard'&&!x.done?care101Why(g,x.k):'';
    return `<div class="v101os${x.done?' done':''}${n===first?' rec':''}"><b>${x.done?'✓':n+1}</b><span>${x.t}${n===first&&x.alt?`<small>${_T`Short on hours: the bathhouse (${CARE101.h.bath} h) takes a week off instead.`}</small>`:why&&!x.alt?`<small>${esc(why)}</small>`:''}${x.k==='yard'?` <span class="v101lnk" role="button" tabindex="0" data-v101yd="${g.id}">🏋 ${_T`To the Training Yard`}</span>`:''}</span></div>`}).join('')}</div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-v101yd]');if(!b||!b.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();MGR.tab='practice';MGR.tr92=b.dataset.v101yd;MGR.view=null;if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const b=e.target.closest&&e.target.closest('[data-v101yd]');if(b){e.preventDefault();b.click()}},true);

/* ---------- the care column (183's care90HTML without the bathhouse) ---------- */
care90HTML=function(g,w,m){const i=g.inj,war=i&&i.war;const free=bedFree76(w);const req=i&&!war?injReq(i):null;
  const need={rest:_T('rest'),medicus:_T('the Medicus'),surgeon:_T('the surgeon')}[req]||'';const sec=(ic,t,sub,body,cls='')=>`<div class="iv90s ${cls}"><div class="iv90h">${ic} <b>${t}</b>${sub?` <span class="rc-sub">${sub}</span>`:''}</div>${body}</div>`;
  const out=[];const head=`<div class="iv90who"><b>${esc(g.name)}</b> <span class="rc-sub">${_T`${effOvr(g)} · morale ${g.morale}`}</span>${typeof maimLine87==='function'&&maimLine87(g)?`<div class="wd76w maim87">${maimLine87(g)}</div>`:''}</div>`;
  out.push(ord101HTML(g));
  if(war)out.push(sec('⚔',_T('Away at war'),'',`<div class="wd76w">${_T`${esc(i.label)} · back ${wkName(i.until)}`}</div>`));
  if(i&&!war){const loc=LOCN[injLoc74(i.label)]||'';const inb=inBed76(g);
    const tiles=inb&&typeof bedTiles87==='function'?bedTiles87(g):planTiles(g);
    out.push(sec('🩸',_T`Wound · ${esc(loc)}`,_T`${esc(i.label)}${i.pen?_T` · −${i.pen} rating`:''} · needs ${need}`,
      `${i.neglect?`<div class="wd76w wd76bad">${_T`Festering ${i.neglect}/3 — only the surgeon closes it`}</div>`:''}${inb&&typeof planOf87==='function'?`<div class="wd76w tr87">${_T`Treatment: <b>${PLAN87[planOf87(g)][0]} ${PLAN87[planOf87(g)][1]}</b>${planOf87(g)==='rest'?' · free':_T(' · repeats every week')} · fit <b>${wkName(fitWeekOf(g))}</b>`}</div>`:''}${tiles}`,'wd'))}
  if(bedOK87(g)&&!inBed76(g)){const ser=serious76(g);
    out.push(sec('🛏',_T('A bed'),ser?_T('needed — half-pace mending until then'):_T`${free} free`,
      `<div class="rule87 rc-sub">${BED_RULE87()}</div><div class="acts"><button class="btn tksm plantile ${free?'primary':'off'}" type="button" data-bed76="${g.id}" data-v101t="bed" ${free?'':`data-dis="${esc(_T('Beds full — build the Valetudinarium for another'))}"`}>${_T`🛏 Put in bed<small>free · full-pace healing, the physicians</small>`}</button></div>`,'bed'))}
  if((g.severed||[]).length){const why=care101Why(g,'heal');
    out.push(sec('🌿',_T('Hygeia'),_T('the only way to regrow a limb'),`<div class="acts"><button class="btn tksm plantile${why?' off':''}" type="button" data-mg="heal" data-id="${g.id}" data-v101t="heal" ${why?`data-dis="${esc(why)}"`:''} title="${esc(why||_T('Regrows a lost limb'))}">${_T`🌿 Regrow ${g.severed.map(l=>esc(LOCN[l]).toLowerCase()).join(', ')}<small>${CARE101.h.heal} h + ${coinAmt87(care101Coin('heal'))} a limb · needs a bed</small>`}</button></div>`,'sv'))}
  /* M30: the Valetudinarium is built from here */
  const vl=facLvl(m,'valet');if(vl<3){const built=m.facWk===w.week;
    out.push(sec('🏗',_T('Valetudinarium'),_T`level ${vl}/3`,`<div class="acts"><button class="btn tksm plantile" type="button" data-mg="build" data-id="valet" data-v101t="build" ${dis([built,_T`Your builders are already busy this week.`],needCoin(m,FAC_COST[vl]))}>${_T`🏗 Build Valetudinarium ${['I','II','III'][vl]}<small>${coinAmt87(FAC_COST[vl])} · +1 bed · +${CARE101.valet} Medicus hours a week</small>`}</button></div>`,'bd'))}
  const done=wardDone76(g,w).filter(x=>!/^🛁 Rubdown|^🛏 Resting/.test(x));if(done.length)out.push(`<div class="yd76res">${done.map(x=>`<span>${x}</span>`).join('')}</div>`);
  return head+out.join('')};

/* ---------- 2 · the medicus popup ---------- */
function med101Pop(){const w=W_(),m=me();if(!w||!m)return;for(const o of document.querySelectorAll('.ask76bg'))o.remove();const bg=document.createElement('div');bg.className='veraskbg ask76bg v101mp';
  bg.innerHTML=`<div class="card2 verask" role="dialog" aria-modal="true"><b>${_T`🧑‍⚕️ Hire a Capsarius`}</b><p class="rc-sub" style="margin:4px 0 8px">${_T`A weekly wage. Each skill level heals faster and adds ${CARE101.medicus} Medicus hours a week.`}</p>
    <div class="bp87l">${medCands76(w).map((c,i)=>`<button type="button" class="btn bp87" data-v101mh="${i}" ${m.coin<c.wage?_T`disabled title="${esc(_T('Not enough coin'))}"`:''}><b>${esc(c.name)} · ${_T`skill ${c.skill}`}</b><small>${coinAmt87(c.wage)} ${_T`a week`} · +${CARE101.medicus*c.skill} h · ${MED_SK76[c.skill]}</small></button>`).join('')}</div>
    <div class="acts"><button type="button" class="btn" data-v101mx>${_T`Close`}</button></div></div>`;
  document.body.appendChild(bg);const done=()=>{bg.remove();document.removeEventListener('keydown',key,true)};const key=e=>{if(e.key==='Escape'){e.stopPropagation();e.preventDefault();done()}};document.addEventListener('keydown',key,true);
  bg.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-v101mh]');if(!b){if(e.target===bg||e.target.closest('[data-v101mx]'))done();return}if(b.disabled)return;done();
    const w2=W_();if(typeof roadLocked76==='function'&&roadLocked76(w2)){mToast(_T`🛣 On the road — the Infirmary reopens when the week ends.`);return}const c=medCands76(w2)[+b.dataset.v101mh];if(!c)return;w2.medicus76={...c};
    const t=_T`🧑‍⚕️ <b>${esc(c.name)}</b> joins your house as Capsarius (skill ${c.skill}, ${coinAmt87(c.wage)} a week).`;tnews(t,'big');saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW();mToast(t)})}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-v101med]');if(!b||!b.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();med101Pop()},true);

/* ---------- 6 · the pictures ---------- */
const v101Img=f=>`<span class="rm100pic"><img class="rm100sc" src="${typeof assetURL==='function'?assetURL(f):'assets/'+f}" alt="" draggable="false" decoding="async"></span>`;
const v101Scn=k=>`<span class="rm100pic">${typeof scene100==='function'?scene100(k,'tile','rm100sc'):''}</span>`;
function ART101(k){try{const M=typeof rm100Adv==='function'?rm100Adv('medicus',30):null;
  switch(k){case 'rest':return v101Img('rec100_tavern.webp');case 'bed':return v101Scn('team');case 'medic':return v101Scn('council')+(M?`<span class="rm100rd rm100pface">${M.f}</span>`:'');
    case 'surgeon':return v101Scn('armory');case 'bath':return v101Img('rec100_baths.webp')+'<span class="rm100steam"></span>';case 'asclepius':return v101Img('rec100_temple.webp');
    case 'heal':return v101Img('rec100_pano.webp')+'<span class="rm100glow"></span>';case 'build':return v101Scn('school')}}catch(e){}return ''}
function v101Key(b){const d=b.dataset;if(d.v101t)return d.v101t;if(d.bed76)return 'bed';if(d.mg==='build')return 'build';if(d.mg&&CARE101.h[d.mg])return d.mg;if(d.plan87)return d.plan87;return ''}

/* ---------- the final pass over the Manager page ---------- */
function v101Ward(R,w,pm){const pane=R.querySelector('#mgrPane');if(!pane)return;
  /* the banner */
  const hd=R.querySelector('#mgrPane .roomhd, .railmain>.roomhd')||R.querySelector('.roomhd');
  if(hd){const ros=rosterOf(pm);const hurt=ros.filter(g=>(g.inj&&!g.inj.war)||(g.severed||[]).length).length;const N=bedsOf76(pm),used=bedsClean76(w).length;const L=mh101Left(w,pm),M=mh101Max(pm,w);
    for(const s of hd.querySelectorAll('.roomstat'))s.remove();
    const st=document.createElement('div');st.className='v101st';
    st.innerHTML=`<div class="v101b${hurt?' hot':''}" title="${esc(_T('Wounded or missing a limb'))}"><b>${hurt}</b><span>${_T`🩸 hurt`}</span></div><div class="v101b${used>=N?' hot':''}"><b>${used}/${N}</b><span>${_T`🛏 beds`}</span></div>
      <div class="v101b${L?'':' hot'}" title="${esc(_T('Medicus hours left this week — every treatment takes some'))}"><b>${L}/${M}</b><span>${_T`⏳ hours left`}</span></div><div class="v101b"><b>${coinAmt87(pm.coin)}</b><span>${_T`treasury`}</span></div>`;
    const side=document.createElement('div');side.className='v101bx';const Md=w.medicus76;
    side.innerHTML=Md?`<span class="v101med" title="${esc(MED_SK76[Md.skill]||'')}">${_T`🧑‍⚕️ <b>${esc(Md.name)}</b> · skill ${Md.skill} · ${coinAmt87(Md.wage)}/wk`} <button class="btn tksm" type="button" data-med76="fire">${_T`Let go`}</button></span>`
      :`<button class="btn tksm v101med" type="button" data-v101med title="${esc(_T('A weekly wage · faster healing · more Medicus hours'))}">${_T`🧑‍⚕️ Hire a Capsarius`}</button>`;
    const hy=hd.querySelector('.hyg87');if(hy){hy.classList.add('v101hy');side.appendChild(hy)}
    if(!hd.querySelector('[data-cure90]'))side.insertAdjacentHTML('afterbegin',`<button type="button" class="iv90why v101why" data-cure90 title="${esc(_T('Which cure should I use?'))}">ⓘ ${_T`Which cure?`}</button>`);
    if(hd.classList.contains('rm100ban')){hd.appendChild(st);hd.appendChild(side);hd.classList.add('v101ban')}
    else{const strip=document.createElement('div');strip.className='card2 v101strip';strip.appendChild(st);strip.appendChild(side);hd.after(strip)}}
  for(const x of pane.querySelectorAll('.wd76top'))x.remove();
  /* "Cleared for the sand" goes */
  for(const s of pane.querySelectorAll('.sect'))if(/Cleared for the sand|🗡/.test(s.textContent)&&s.nextElementSibling&&s.nextElementSibling.classList.contains('clearstrip')){s.nextElementSibling.remove();s.remove()}
  for(const c of pane.querySelectorAll('.clearstrip,.iv90list .full87'))c.remove();
  /* the list: fit and fresh open, Take out on the bed patient's row */
  for(const d of pane.querySelectorAll('details.iv90more'))d.setAttribute('open','');
  for(const r of pane.querySelectorAll('.iv90list .iv90row[data-inf90]')){const g=gById(r.dataset.inf90);if(!g||!inBed76(g))continue;
    const wr=document.createElement('div');wr.className='v101row';r.replaceWith(wr);wr.appendChild(r);
    wr.insertAdjacentHTML('beforeend',`<button class="btn tksm v101out" type="button" data-unbed76="${g.id}" title="${esc(_T('Take him out of the bed'))}">${_T`🛏 Take out`}</button>`)}
  const care=pane.querySelector('.iv90care');if(!care)return;
  for(const b of [...care.querySelectorAll('[data-unbed76]')]){const p=b.closest('.iv90s');b.remove();if(p&&!p.querySelector('button'))p.remove()}
  /* the care column: the order on top, the plates in ONE sideways row, the notes under it (all still inside .iv90care) */
  const ord=care.querySelector('.v101ord');const rk=ord&&ord.dataset.v101rk;
  if(care.classList.contains('rm100care')){let notes=care.querySelector('.rm100notes');if(!notes){notes=document.createElement('div');notes.className='rm100notes'}
    for(const n of [...care.querySelectorAll('.v101hl,.pw,.rtimeline,.rule87,.wd76w,.yd76res')])if(!n.closest('button'))notes.appendChild(n);
    const hl=notes.querySelector('.v101hl');if(hl)notes.insertBefore(hl,notes.firstChild);
    const row=document.createElement('div');row.className='v101rowin';for(const n of [...care.childNodes])if(n!==notes&&n!==ord)row.appendChild(n);
    care.textContent='';if(ord)care.appendChild(ord);care.appendChild(row);if(notes.childNodes.length)care.appendChild(notes)}
  const fx=MGR.v101fx&&Date.now()-MGR.v101fx.t<2500?MGR.v101fx:null;
  for(const b of care.querySelectorAll('button')){const k=v101Key(b);if(!k)continue;b.dataset.v101t=k;
    const fr=b.querySelector('.rm100fr');const a=ART101(k);if(fr&&a)fr.innerHTML=a;
    if(k===rk){b.classList.add('v101rec');b.insertAdjacentHTML('beforeend',`<span class="v101star">${_T`★ Suggested`}</span>`)}
    if(b.classList.contains('pick87'))b.classList.add('on');
    if(fx&&fx.k===k&&(!b.dataset.id||b.dataset.id===fx.id||b.dataset.id87===fx.id||k==='build'))b.classList.add('v101fx')}
  care.classList.add('v101row1');
  /* the road back: fatigue work lives in the yard now */
  const rd=pane.querySelector('.rm100road .rm100wax');if(rd){const sel=MGR.inf90;
    for(const r of rd.querySelectorAll('.rm100tr')){const c=r.children;if(c.length<2)continue;const k=c[0].textContent.trim();
      if(k===TX('Hygeia'))c[1].textContent=_T`regrows · ${CARE101.h.heal} h + ${care101Coin('heal')} coin a limb · needs a bed`;
      if(k===TX('Rubdown')||k===TX('Rest week'))c[1].textContent+=' · '+_T('Training Yard')}
    rd.insertAdjacentHTML('beforeend',`<div class="v101rl"><span class="v101lnk" role="button" tabindex="0" data-v101yd="${esc(sel||'')}">🏋 ${_T`Recovery is in the Training Yard`}</span></div>`)}}
function v101Yard(R,w,pm){const pane=R.querySelector('#mgrPane');if(!pane)return;const doc=pane.querySelector('.rm100doc')||pane.querySelector('.y92doc');if(!doc||doc.querySelector('.v101rec2'))return;
  const ros=rosterOf(pm);let g=gById(MGR.tr92);if(!g||!ros.includes(g))g=ros[0];if(!g)return;const f=gFat(g);const X=x74(w);const th=thLeft(w);const rub=X.rub.includes(g.id);const r=g.restWk===w.week;
  const care=g.ord87&&g.ord87.r==='care';const oc=typeof onCard==='function'&&onCard(g);const hurt=g.inj||(g.severed||[]).length;
  const B=[];
  B.push(`<div class="v101rr"><button class="yd76b ${rub?'on':''}" type="button" data-bath="${g.id}" ${rub||th<1||!(f>0)?_T`disabled title="${esc(rub?_T('Done this week'):th<1?_T('No training hours left this week'):_T('Not tired'))}"`:''}>${_T`🛁 Rub-down`}<small>${rub?_T('✓ done this week'):_T`1 training hour`}</small></button><span>${_T`Oil and strong hands: fatigue −10 now (${f} → ${Math.max(0,f-10)}), once a week.`}</span></div>`);
  if(!hurt){B.push(`<div class="v101rr"><button class="yd76b ${care?'on':''}" type="button" data-care90="${g.id}">${_T`📋 Care routine`}<small>${care?_T('✓ on · tap to stop'):_T('a standing order')}</small></button><span>${_T`Every week: a morale talk and gear care, and fatigue −${FAT_CARE90} at the week's end. Repeats until stopped.`}</span></div>`);
    B.push(`<div class="v101rr"><button class="yd76b ${r?'on':''}" type="button" data-rest="${g.id}" ${!r&&oc?_T`disabled title="${esc(_T("On this week's card — withdraw from the bout on Match Week first"))}"`:''}>${_T`🛏 Rest week`}<small>${r?_T('✓ resting · tap to undo'):_T('no drills, no bouts')}</small></button><span>${_T`Sits out every bout and drill this week; fatigue −${FAT_REST} at the week's end (${f} → ${Math.max(0,f-FAT_REST)}).`}</span></div>`)}
  else B.push(`<div class="v101rr"><span class="rc-sub">${_T`Wounded — the Infirmary treats him first.`}</span></div>`);
  doc.insertAdjacentHTML('beforeend',`<div class="v101rec2"><div class="v101oh">${_T`🛁 Recovery`}</div><div class="rc-sub">${esc(g.name)} · ${_T`fatigue ${f}`} ${typeof fatChip90==='function'?fatChip90(g):''}</div>${B.join('')}</div>`)}
/* other treatment buttons (the gladiator card, the morale Medicus): hours + half coin, the refusal reason */
function v101Btns(R){for(const b of R.querySelectorAll('[data-mg="medic"],[data-mg="surgeon"],[data-mg="heal"],[data-mg="bath"],[data-mg="asclepius"]')){if(b.classList.contains('plantile'))continue;
  const k=b.dataset.mg;const g=gById(b.dataset.id);if(!g)continue;const why=care101Why(g,k);b.removeAttribute('disabled');b.removeAttribute('data-dis');b.removeAttribute('title');
  if(why){b.setAttribute('data-dis',why);b.setAttribute('title',why);b.classList.add('v101no')}
  let s=b.querySelector('small');if(!s){s=document.createElement('small');b.appendChild(s)}s.innerHTML=`${CARE101.h[k]} h · ${coinAmt87(care101Coin(k))}${k==='heal'?' '+_T('a limb'):''} · ${_T`${mh101Left()} h left`}`}}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{const w=W_();if(typeof h!=='string'||!w||w.dead||MGR.view)return h;const pm=me();if(!pm)return h;const tab=MGR.tab;
  const btn=/data-mg="(medic|surgeon|heal|bath|asclepius)"/.test(h);if(tab!=='infirm'&&tab!=='practice'&&!btn)return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;
  if(tab==='infirm')v101Ward(R,w,pm);else if(tab==='practice')v101Yard(R,w,pm);
  v101Btns(R);
  return t.innerHTML}catch(e){console.error(e);return h}}}

/* the Infirmary is a to-do only while there are hours for a cure (the old physicians' cap never runs down now) */
if(typeof ludusPending==='function'){const base=ludusPending;ludusPending=function(){const P=base.apply(this,arguments);try{const w=W_(),m=me();if(Array.isArray(P)&&P.includes('infirm')&&w&&m&&mh101Left(w,m)<CARE101.h.bath&&!(typeof hygeiaReady==='function'&&hygeiaReady(m)))return P.filter(x=>x!=='infirm')}catch(e){}return P}}
/* ---------- 7 · M14: the recruiting-hours oval stays on the rail ---------- */
const v101Own=n=>n.nodeType===1&&n.classList&&(n.classList.contains('c73')||n.classList.contains('c85n')||n.classList.contains('hr99')||n.classList.contains('hp105'));
morph90=function(o,n){
  for(const a of [...o.attributes])if(a.name!=='class'&&a.name!=='title'&&!n.hasAttribute(a.name))o.removeAttribute(a.name);
  for(const a of [...n.attributes])if(a.name!=='class'&&o.getAttribute(a.name)!==a.value)o.setAttribute(a.name,a.value);
  const want=new Set(n.classList);for(const k of RAIL90_KEEPC)if(o.classList.contains(k))want.add(k);
  for(const k of [...o.classList])if(!want.has(k))o.classList.remove(k);for(const k of want)if(!o.classList.contains(k))o.classList.add(k);
  const ok=[...o.childNodes].filter(x=>!v101Own(x)),nk=[...n.childNodes].filter(x=>!v101Own(x));
  for(const y of [...n.childNodes].filter(v101Own))if(![...o.children].some(x=>x.className===y.className))o.appendChild(y);
  const same=ok.length===nk.length&&ok.every((x,j)=>x.nodeType===nk[j].nodeType&&x.nodeName===nk[j].nodeName);
  if(same){ok.forEach((x,j)=>{const y=nk[j];if(x.nodeType===1)morph90(x,y);else if(x.nodeValue!==y.nodeValue)x.nodeValue=y.nodeValue})}
  else{const anchor=[...o.childNodes].find(v101Own)||null;for(const x of ok)x.remove();for(const y of nk)o.insertBefore(y,anchor)}};
/* a brand-new rail (first open, a tab the morph could not keep) gets the oval in the same microtask, before the paint */
if(typeof rail90Fix==='function'){const base=rail90Fix;rail90Fix=function(){const r=base.apply(this,arguments);try{if(typeof hr99Sync==='function')hr99Sync()}catch(e){}return r}}

/* ---------- the look ---------- */
(()=>{const st=document.createElement('style');st.id='v101bcss';st.textContent=`
.v101hl{font-size:12px;color:#cfe3b8;margin-top:5px}.v101hl.zero{color:#e07a6a}
.roomhd.v101ban{flex-wrap:wrap}
.roomhd .v101st{display:flex;gap:6px;align-items:stretch;position:relative;z-index:2;margin:0 0 0 auto}
.v101st .v101b{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:62px;padding:3px 8px;border:1px solid #c9a46a88;border-radius:7px;background:#140c07c0;line-height:1.15}
.v101st .v101b b{font:600 17px var(--display,serif);color:#fff3d6;white-space:nowrap}.v101st .v101b span{font-size:10.5px;color:#e8d6b0;white-space:nowrap}
.v101st .v101b.hot{border-color:#e07a6a}.v101st .v101b.hot b{color:#ffb4a6}
.v101strip{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 8px}.v101strip .v101st{display:flex;gap:6px}.v101strip .hyg87{position:relative!important;inset:auto!important;right:auto!important;top:auto!important;transform:none!important}
.v101bx{display:flex;flex-direction:column;gap:4px;align-items:stretch;position:relative;z-index:2}
.v101bx .v101med{font-size:12px;white-space:nowrap;color:#f3e3bd;background:#140c07c0;border:1px solid #c9a46a88;border-radius:7px;padding:3px 8px}
.v101bx .v101med .btn{margin-left:4px}.v101bx .v101why{margin:0;align-self:stretch;text-align:center}
.roomhd .v101bx .hyg87,.roomhd .v101bx .hyg87.v101hy{position:relative!important;inset:auto!important;right:auto!important;left:auto!important;top:auto!important;transform:none!important;flex-direction:column;align-items:stretch;padding:3px 8px;margin:0;gap:3px;max-width:220px}.roomhd .v101bx .hyg87 .btn{white-space:normal}
.rm100.rm100-ward{grid-template-columns:minmax(300px,360px) minmax(0,1fr)}
.rm100-ward .iv90row{grid-template-columns:26px minmax(0,1fr) 56px 96px!important}
.rm100-ward .iv90row .iv90c{overflow:visible!important;text-overflow:clip!important}
.v101row{display:flex;align-items:center;gap:4px}.v101row .iv90row{grid-template-columns:26px minmax(0,1fr) 56px!important}.v101row .iv90row .iv90c{display:none}.v101row>.iv90row{flex:1;min-width:0}.v101row .v101out{flex:none;margin-right:6px;font-size:11.5px;padding:2px 7px;white-space:nowrap}
.v101ord{border:1px solid #6b5236;border-radius:8px;padding:6px 10px;background:#1f1711;margin:6px 0;display:grid;gap:3px}
.v101oh{font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:#c9a46a;margin-bottom:2px}
.v101os{display:grid;grid-template-columns:22px minmax(0,1fr);gap:6px;align-items:start;font-size:13px;padding:2px 4px;border-radius:5px}
.v101os>b{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;border:1px solid #8a6a44;font-size:11px;color:#e8d6b0}
.v101os small{display:block;font-size:11.5px;color:var(--muted)}.v101os.done{opacity:.6}.v101os.done>b{border-color:#7fae5f;color:#9cc46e}
.v101os.rec{background:#3a2a18;box-shadow:inset 3px 0 0 #d6ab4c}.v101os.rec>b{background:#d6ab4c;color:#2a1708;border-color:#d6ab4c}.v101os.ok{grid-template-columns:1fr;color:#9cc46e}
.v101lnk{color:var(--gold2,#f0cf7d);text-decoration:underline;cursor:pointer;white-space:nowrap}
.v101rec{outline:2px solid #d6ab4c;outline-offset:-2px}.v101star{position:absolute;top:4px;left:4px;z-index:3;font:600 10.5px var(--mono,monospace);background:#d6ab4c;color:#2a1708;border-radius:8px;padding:1px 6px;pointer-events:none}
.plantile{position:relative}.plantile .v101star{position:static;grid-column:1/-1;justify-self:start;margin-top:3px}
.rm100care.iv90care .v101star{position:absolute}
.v101ok{grid-column:1/-1;font-size:11px;color:#9cc46e}
.rm100care.iv90care.v101row1 .rm100plt.on,.plantile.on{border-color:#d6ab4c!important;box-shadow:0 0 0 1px #d6ab4c,inset 0 0 0 1px #d6ab4c55}
.v101fx{position:relative}.v101fx::after{content:"";position:absolute;inset:-2px;border-radius:9px;box-shadow:0 0 0 2px #f0cf7d,0 0 14px #f0cf7d;pointer-events:none;animation:v101fx 1.6s ease-out forwards}
@keyframes v101fx{0%{opacity:1}100%{opacity:0}}body.calm .v101fx::after{animation:none;opacity:.7}
.rm100care.iv90care.v101row1{display:block!important}.v101row1>.v101ord{margin-top:0}
.v101rowin{display:flex;flex-wrap:nowrap;overflow-x:auto;gap:7px;padding-bottom:4px;scroll-snap-type:x proximity}
.rm100care.iv90care .v101rowin .rm100plt{flex:0 0 150px!important;width:150px!important;scroll-snap-align:start}.v101rl{padding:4px 0 0;font-size:12.5px}
.rm100care.iv90care .v101rowin .rm100plt.v101no,.rm100care.iv90care .v101rowin .rm100plt.off{opacity:.62}
.v101rec2{margin-top:8px;border-top:1px solid #4a3826;padding-top:6px;display:grid;gap:5px}
.v101rr{display:grid;grid-template-columns:minmax(0,1fr);gap:2px;font-size:12px}.v101rr .yd76b{text-align:left;width:100%}.v101rr>span{color:#e8d6b0;line-height:1.3}
@media (max-width:980px){.rm100.rm100-ward{grid-template-columns:minmax(0,1fr)}}
@media (max-width:600px){.roomhd.v101ban{gap:6px}.roomhd .v101st{flex-wrap:wrap;margin:0}.v101st .v101b{min-width:54px}.v101bx{flex-direction:row;flex-wrap:wrap}.v101rr{grid-template-columns:1fr}}`;document.head.appendChild(st)})();
}

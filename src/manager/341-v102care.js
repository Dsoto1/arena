/* v1.02 (341-v102care) · INJURIES AND CARE TIMING — workstream J (tools/plans/v102/NOTES.md "J", his answers d, 1a, 2 ok).
   Root cause he hit: 318's care101Do cleared a wound AT ONCE, so a fighter hurt in tonight's bout was healed and out of bed the same week.
   • THE WOUND'S WEEK: every wound carries g.inj.wk102 = the week it was taken (j102Stamp: applyBout, endWeek before/after, every Manager
     page). Wounds that exist before this build (first stamp of a world, w.j102) count as last week's. Wounds born at a week's turn belong
     to the week that ended.
   • LIGHT wounds: Medicus / surgeon / Asclepius are BOOKED (g.inj.bk102 {wk,k}; hours + half coin paid now — 318's care101Do calls
     care102Do, a direct 2-line edit in 318 because care101Do/care101Why are block-scoped there) — he stays hurt this week, the wound
     closes when the week ENDS (endWeek wrapper, undone if the week did not turn), fit next week. A surgeon on a light wound: +10 fatigue.
     The bathhouse still takes a week off the healing (never closes the wound on the spot; a wound brought to "now" heals at the week's end).
   • SERIOUS wounds (injReq surgeon, ser76, −4 rating or 3+ weeks from the wound's week): the wound's week = rest / bed only, every cure
     refused with the reason (care102Why); next week the cure is booked and closes at that week's end (the surgeon's 1-in-10 slip is rolled
     then: the wound stays one more week); the week after he is back with RECOVERY FATIGUE +15..+20 (g.rf102 {wk,n}) — the yard's rub-down
     and the Care routine take it down as any fatigue.
   • ASCLEPIUS (1a) and HYGEIA'S BLESSING follow the same rules (no instant miracle): booked, a fresh serious wound waits a week.
   • LOST LIMBS: 332's M1 for the player; rivals the same (17's endWeek limb loop: one a week, +20 fatigue — care102Limb).
   • RIVALS (2): 23-ludus aiLanistaWeek runs at the week's end, so a rival's Medicus/surgeon closing a wound there = closing at the week's
     end; care102CpuWait skips a serious wound in its own week, care102CpuClose adds the same recovery fatigue (applied after endWeek,
     like the player's, so 85's weekly decay does not eat it).
   • UI: cure tiles say "closes when the week ends", a fresh serious wound says "this week: rest only — treatment from next week", a booked
     wound says so, the road-back timeline shows the weeks (care90HTML wrapper); care guide / suggested order texts (_T-swapped in the page).
   • The lesson's sandbox league (w.tutorial) keeps the old instant cure (its next step enters the healed fighter the same week; its text says so).
   No save change (new fields only). Kill switch localStorage flavius_v102joff=1. Test tv102j. */
const J102={on:(()=>{try{return localStorage.getItem('flavius_v102joff')!=='1'}catch(e){return true}})(),pend:[],K:['medic','surgeon','bath','asclepius']};
/* TWEAK: recovery fatigue after a serious wound (min..max), after a surgeon on a light wound, after a regrown limb (rivals; 332 does the player) */
const J102F={ser:[15,20],light:10,limb:20};
function j102Live(){const w=typeof W_==='function'?W_():null;return J102.on&&w&&!w.dead&&!w.tutorial?w:null}
/* the week a wound was taken (unstamped = this week) */
function j102Wk(i){const w=W_();return i&&i.wk102!=null?i.wk102:(w?w.week:0)}
/* stamp every unstamped wound; the first stamp of a world (old saves) counts them as last week's */
function j102Stamp(w,wk){try{w=w||W_();if(!w||!w.glads)return;const first=!w.j102;if(first)w.j102=1;
  for(const g of w.glads){const i=g.inj;if(!i||i.war||i.wk102!=null)continue;i.wk102=first?w.week-1:(wk!=null?wk:w.week);i.s102=j102Ser0(i,w)?1:0}}catch(e){console.error(e)}}
/* serious = the recovery course (no bed rules here — 108 keeps those): 108's test at the moment the wound is first seen (i.s102) */
function j102Ser0(i,w){return !!(i.ser76||injReq(i)==='surgeon'||(i.pen||0)>=4||((i.until||0)-w.week)>=3)}
function j102Ser(g,i){i=i||(g&&g.inj);if(!i||i.war)return false;return !!(i.s102||i.ser76||injReq(i)==='surgeon'||(i.pen||0)>=4||(i.s102==null&&((i.until||0)-W_().week)>=3))}
const j102Fresh=(g,w)=>{w=w||W_();return !!(g&&g.inj&&!g.inj.war&&j102Ser(g)&&j102Wk(g.inj)>=w.week)};
const j102RecN=()=>J102F.ser[0]+Math.floor(Math.random()*(J102F.ser[1]-J102F.ser[0]+1));
const j102Mine=g=>{try{const m=g&&g.contract&&mgrById(g.contract.mgr);return !!(m&&m.isPlayer)}catch(e){return false}};
const J102_KN=()=>({medic:_T('the Medicus'),surgeon:_T('the surgeon'),asclepius:_T('Asclepius'),hygeia:_T("Hygeia's Blessing")});

/* ---------- the rules, read by 318's care101Why / care101Do ---------- */
function care102Why(g,k){const w=j102Live();if(!w||!g||!J102.K.includes(k))return '';const i=g.inj;if(!i||i.war)return '';j102Stamp(w);
  if(i.bk102)return i.bk102.wk>w.week?_T`Booked for next week — ${g.name}'s wound closes when next week ends.`:_T`Booked — ${g.name}'s wound closes when this week ends.`;
  if(j102Fresh(g,w))return _T`This week: rest only — the wound is fresh. Treatment from next week.`;
  return ''}
function care102Do(g,k){const w=j102Live();if(!w||!g||!J102.K.includes(k))return null;const i=g.inj;if(!i||i.war)return null;const m=me();
  const h=CARE101.h[k],c=care101Coin(k);m.coin-=c;mh101Spend(w,m,h);
  if(k==='bath'){g.bathWk=w.week;i.until=Math.max(w.week,(i.until||w.week)-1);g.morale=clamp(g.morale+4,0,100);
    return {ok:true,msg:i.until<=w.week&&injReq(i)!=='surgeon'?_T`🛁 Steam, oil and a strigil for ${esc(g.name)}: the wound closes when the week ends (${h} h · ${c} coin).`:_T`🛁 A bathhouse day for ${esc(g.name)}: a week off the healing, +4 morale (${h} h · ${c} coin).`}}
  i.bk102={wk:w.week,k};
  if(k==='medic'){g.medWk=w.week;g.morale=clamp(g.morale+12,0,100)}else if(k==='surgeon')g.morale=clamp(g.morale+6,0,100);else g.morale=clamp(g.morale+8,0,100);
  ghist(g,_T`booked ${J102_KN()[k]} for ${i.label}`);
  const ser=j102Ser(g);const tail=ser?_T` · then +${J102F.ser[0]}–${J102F.ser[1]} fatigue for the recovery`:k==='surgeon'?_T` · then +${J102F.light} fatigue`:'';
  const ic={medic:'⚕',surgeon:'🔪',asclepius:'⚡'}[k];
  return {ok:true,msg:_T`${ic} ${J102_KN()[k]} booked for ${esc(g.name)}'s ${esc(i.label)} (${h} h · ${c} coin) — the wound closes when the week ends, fit next week${tail}. Morale ${g.morale}.`}}

/* ---------- rivals (23-ludus aiLanistaWeek at the week's end; 17's limb loop) ---------- */
function care102CpuWait(g){return !!(j102Live()&&j102Fresh(g))}
function care102CpuClose(g,k){const w=j102Live();if(!w){g.inj=null;return}const ser=j102Ser(g);g.inj=null;const n=ser?j102RecN():k==='surgeon'?J102F.light:0;if(n)J102.pend.push([g,n,'wound'])}
function care102Limb(g){if(!j102Live())return false;J102.pend.push([g,J102F.limb,'limb']);return true}

/* ---------- the week's end: booked cures close; recovery fatigue the week after ---------- */
if(J102.on){
{const base=applyBout;applyBout=function(){const w=W_();if(w&&!w.tutorial)j102Stamp(w);const r=base.apply(this,arguments);try{const w2=W_();if(w2&&!w2.tutorial)j102Stamp(w2)}catch(e){}return r}}
{const base=endWeek;endWeek=async function(){const w=W_();const live=j102Live();const wk0=w&&w.week;const done=[];J102.pend=[];
  if(live){j102Stamp(w);try{for(const g of w.glads){const i=g.inj;if(!i||i.war||!i.bk102||i.bk102.wk>wk0||g.alive===false)continue;
    const orig=JSON.parse(JSON.stringify(i));const ser=j102Ser(g);const k=i.bk102.k;const slip=k==='surgeon'&&Math.random()<.1;
    if(slip){delete i.bk102;i.until=wk0+2;i.neglect=0}else delete g.inj;done.push({g,orig,ser,k,slip})}}catch(e){console.error(e)}}
  const undo=()=>{for(const d of done)d.g.inj=d.orig;J102.pend=[]};
  let r;try{r=await base.apply(this,arguments)}catch(e){undo();throw e}
  try{const w2=W_();if(!live||!w2)return r;
    if(w2.week===wk0){undo();return r}
    for(const d of done){const g=d.g;const nm=J102_KN()[d.k]||d.k;
      if(d.slip){ghist(g,_T`the surgeon's knife slipped on ${d.orig.label}`);if(j102Mine(g))tnews(_T`🔪 The knife slipped: <b>${esc(g.name)}</b> keeps the ${esc(d.orig.label)} another week.`,'bad');continue}
      const n=d.ser?j102RecN():d.k==='surgeon'?J102F.light:0;
      if(n){g.fat=Math.max(0,Math.min(100,(g.fat||0)+n));g.rf102={wk:w2.week,n}}
      ghist(g,n?_T`${d.orig.label} closed (${nm}) — recovery fatigue +${n}`:_T`${d.orig.label} closed (${nm})`);
      if(j102Mine(g))tnews(n?_T`⚕ <b>${esc(g.name)}</b>'s ${esc(d.orig.label)} has closed — fit to fight, worn from the recovery (+${n} fatigue).`:_T`⚕ <b>${esc(g.name)}</b>'s ${esc(d.orig.label)} has closed — fit to fight.`)}
    for(const [g,n,why] of J102.pend){if(!g||g.alive===false)continue;g.fat=Math.max(0,Math.min(100,(g.fat||0)+n));g.rf102={wk:w2.week,n};if(why==='limb')ghist(g,_T`a limb grew back — fatigue +${n} from the operation`)}
    J102.pend=[];j102Stamp(w2,wk0)}catch(e){console.error(e)}
  return r}}
/* fit week: a booked cure → the week after it */
{const base=fitWeekOf;fitWeekOf=function(g){const r=base.apply(this,arguments);try{if(j102Live()&&g&&g.inj&&!g.inj.war&&g.inj.bk102)return g.inj.bk102.wk+1}catch(e){}return r}}
/* Hygeia's Blessing: the wounds close when the week ends; a fresh serious wound waits a week */
if(typeof hygeiaUse==='function'){const base=hygeiaUse;hygeiaUse=function(m){const w=j102Live();const snap=w&&m?rosterOf(m).filter(g=>g.inj&&!g.inj.war).map(g=>[g,g.inj,j102Ser(g),j102Wk(g.inj)]):[];
  if(w)j102Stamp(w);const r=base.apply(this,arguments);
  try{if(w&&r)for(const [g,i,ser,wk] of snap){if(g.inj)continue;if(!m.isPlayer&&!ser)continue; /* a rival uses it as the week turns: a light wound is already a week old */
      g.inj=i;i.bk102={wk:ser?Math.max(w.week,wk+1):w.week,k:'hygeia'}}
    if(w&&r&&m.isPlayer)tnews(_T`🌿 Hygeia's priests have done their work — the wounds close when the week ends (a fresh serious wound when next week ends).`)}catch(e){console.error(e)}
  return r}}

/* ---------- the care column: a line + the road back in weeks ---------- */
function j102Line(g,w){const i=g.inj;if(!i||i.war)return '';const W=wk=>esc(wkName(wk));
  let line,steps;
  if(i.bk102){const b=i.bk102.wk;line=b>w.week?_T`✓ Booked: ${J102_KN()[i.bk102.k]} next week — the wound closes when next week ends.`:_T`✓ Booked: ${J102_KN()[i.bk102.k]} — the wound closes when the week ends.`;
    steps=[];for(let x=w.week;x<=b;x++)steps.push(['hurtwk',W(x),x===b?_T('treatment'):_T('rest')]);steps.push(['fitwk',W(b+1),j102Ser(g)?_T('back · tired'):_T('fit')])}
  else if(j102Fresh(g,w)){line=_T`This week: rest only — treatment from next week.`;steps=[['hurtwk',W(w.week),_T('rest')],['hurtwk',W(w.week+1),_T('treatment')],['fitwk',W(w.week+2),_T('back · tired')]]}
  else{line=_T`A cure booked now closes the wound when the week ends.`;steps=[['hurtwk',W(w.week),_T('treatment')],['fitwk',W(w.week+1),j102Ser(g)?_T('back · tired'):_T('fit')]]}
  return `<div class="wd76w j102l${i.bk102?' bk':''}">${line}</div><div class="rtimeline j102t" title="${esc(_T('The road back'))}">${steps.map(s=>`<span class="${s[0]}"><b>${s[1]}</b><small>${s[2]}</small></span>`).join('')}</div>`}
{const base=care90HTML;care90HTML=function(g,w,m){const h=base.apply(this,arguments);try{w=j102Live();if(!w||!g||!g.inj||g.inj.war||typeof h!=='string')return h;j102Stamp(w);
  const T=document.createElement('template');T.innerHTML=h;const R=T.content;for(const t of R.querySelectorAll('.rtimeline:not(.j102t)'))t.remove();
  const sec=[...R.querySelectorAll('.iv90s')].find(s=>s.querySelector('.plantile,[data-plan87]'))||R.querySelector('.iv90s');
  const x=document.createElement('div');x.className='j102w';x.innerHTML=j102Line(g,w);if(sec)sec.appendChild(x);else R.appendChild(x);
  const fresh=j102Fresh(g,w),bk=g.inj.bk102;
  for(const b of R.querySelectorAll('.plantile[data-v101t]')){const k=b.dataset.v101t;if(!['medic','surgeon','asclepius'].includes(k))continue;const pf=b.querySelector('.pf');
    if(pf)pf.textContent=bk?_T`fit ${wkName(bk.wk+1)}`:fresh?_T`fit ${wkName(w.week+2)}`:_T`fit ${wkName(w.week+1)}`;
    if(!b.querySelector('.j102c'))b.insertAdjacentHTML('beforeend',`<span class="j102c"> ${fresh&&!bk?_T('this week: rest only — treatment from next week'):_T('closes when the week ends')}</span>`)}
  return T.innerHTML}catch(e){console.error(e);return h}}}
/* the page's own texts that promised an instant cure (swapped through _T, so every language follows) */
const J102_SWAP=()=>[[_T('Clears the wound now · +12 morale'),_T('Closes the wound when the week ends · +12 morale')],[_T('Heals any wound at once · +8 morale'),_T('Closes any wound when the week ends · +8 morale')],
  [_T('Clears muscle-grade wounds <b>now</b> · +12 morale · once a week each'),_T('Closes muscle-grade wounds <b>when the week ends</b> · +12 morale · once a week each')],[_T('the usual fix — back onto the card this week'),_T('the usual fix — fit next week')],
  [_T('Heals <b>any</b> wound at once, no mishap · +8 morale'),_T('Closes <b>any</b> wound when the week ends, no mishap · +8 morale')],[_T('a star must fight this week and the coin is there'),_T('a surgeon wound you cannot risk on the knife')],
  [_T('⚕ The Medicus clears the wound this week'),_T('⚕ Book the Medicus — the wound closes when the week ends')]];
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=j102Live();if(!w||typeof h!=='string')return h;j102Stamp(w);
  if(!/data-mg="(medic|surgeon|asclepius)"|careguide|v101ord/.test(h))return h;for(const [a,b] of J102_SWAP())if(a&&h.indexOf(a)>=0)h=h.split(a).join(b);
  if(/careguide/.test(h)&&h.indexOf('j102g')<0)h=h.replace(/(<details class="careguide"><summary>[\s\S]*?<\/summary>)/,`$1<p class="rc-sub j102g" style="margin:4px 0">${_T`Every cure is <b>booked</b>: the wound closes when the week ends, he is fit next week. A <b>serious</b> wound rests its first week (no treatment), is treated the next, and he comes back tired (+${J102F.ser[0]}–${J102F.ser[1]} fatigue) — a rub-down or the Care routine in the Training Yard takes it down.`}</p>`);
  return h}catch(e){console.error(e);return h}}}
{const st=document.createElement('style');st.textContent=`
.j102w{margin-top:6px}
.j102l{font-size:12.5px;color:#f2d8a8}.j102l.bk{color:#b8e6a0}
.rtimeline.j102t{display:flex;gap:4px;flex-wrap:wrap}.rtimeline.j102t span{display:grid;line-height:1.15;padding:2px 7px;border-radius:6px;font-size:11.5px}
.rtimeline.j102t span small{font-size:10.5px;opacity:.85}
.plantile .j102c{display:block;font-size:10.5px;color:#e8d6b0;opacity:.9}`;document.head.appendChild(st)}
}

/* =====================================================================
   352-V104FIXR · v1.04 beta fixes B1 B2 B6 B19 (his Beta 1 notes 2026-10-16; answers B1a B6a i1a i2a i3a; tools/plans/v104/NOTES.md)
   Kill switch localStorage flavius_v104roff=1 (everything below back to 350/17's roster). Test tools/tests/tv104e.js
   =====================================================================
   B1 · KEEPING HIM = SIX. REPLACES the eight plates of 17-manager's card (meal, word, kintix, bonus, raise, promise + Personal trainer + Medicus):
        data-mg="ptrain" (stays in the Training Yard as "Own doctore") and data-mg="medic" (stays in the Infirmary) are cut from the roster's
        .rm100keep tray; the fold (350's details.r104keep) is OPEN by default (R104.keepOpen starts true; his own fold/unfold is remembered while
        the page lives); the six plates sit in ONE row where the fold is at least 500px wide (v1.09 fix, was 560: a long name widened the list column and wrapped the plates to 3 rows at 1440) (container query on the fold).
   B2 · THE LIST NO LONGER STRETCHES. REPLACES 350's `minmax(0,1fr)` name column (the empty gap between name and tier): the rows become ONE
        grid (.r104rows) whose rows/header/groups are SUBGRIDS, so the name column is `fit-content(210px)` of the longest name (ellipsis beyond) and
        every row lines up; tier/OVR/W-L/wage/fatigue/weeks/menu follow it; the list column is capped (max 540px) so the selected side gets the room.
        Up to 470px (container) the name column is 1fr again, as in 350's narrow layouts.
   B6 · TEAM BUTTONS UNDER THE PORTRAIT GONE (B6a). REPLACES 350's r104TeamCtl (First/Second/Rostered + Bout I-III/Reserve): r104TeamCtl returns ''
        (the menu on each row keeps every one of those moves). A one-line hint sits over the list (350's .r104hint) and while a row is dragged the
        group headers light up as drop targets (body.r104dnd).
   B19 · "INJURED" GROUP (i1a i2a i3a), above Lent out. NEW (nothing replaced; 319's M13 rule stays): inj104(g) = 319's r101Bare is set and he is not
        at war (bed / missing limb / hurt / seriously hurt). inj104Sync (run inside tm104Ensure, i.e. on every Manager draw and week end) moves him by
        himself: his place is remembered on the fighter (g.home104 = {t:'A'|'B', s:slot}), his bout slot goes to the reserve first (g.step104), else
        to the best fit of the Second team (g.cover104), and the First team's seat count is topped up from the Second team. When he is fit again he
        goes back to his old group and slot (the stand-in that took the slot goes back to the reserve seat, the one from the Second team goes back
        down); if the First team is full with no stand-in to send back he goes to the Second team. team104 answers 'I' for him (350's TM104 has the
        'I' entry, 350's list has the group). His row shows the wound and the weeks to fit; he cannot be dragged or moved (tm104Move refuses: the
        sync owns him).
        WORN (gFat > 60, the same line as the Ludus tiles): still fieldable; a "Worn" tag on his row, the full warning "Worn: fights weaker, wounds
        more easily" in the row title, on the selected fighter's panel and in the bout picker (any100PickHTML).
   Save: g.home104 / g.step104 / g.cover104 are additive fields on fighters; no migration.
   ===================================================================== */
const V104R={on:(()=>{try{return localStorage.getItem('flavius_v104roff')!=='1'}catch(e){return true}})()};
const WORN104=()=>_T('Worn: fights weaker, wounds more easily');
function inj104(g){if(!V104R.on||!g||g.alive===false)return false;try{const w=W_();if(!w||w.tutorial)return false;if(g.inj&&g.inj.war)return false;
  return typeof r101Bare==='function'&&!!r101Bare(g)}catch(e){return false}}
const worn104=g=>!!g&&gFat(g)>60&&!inj104(g);
/* the wound + the weeks to fit, for his row */
function inj104Txt(g){const w=W_();let t='';
  try{if(typeof r101Bed==='function'&&r101Bed(g))t=_T('in a bed');else{const sev=(g.severed||[]).filter((l,i,a)=>a.indexOf(l)===i);
    if(sev.length)t=_T`lost ${sev.map(l=>(LOCN[l]||l).toLowerCase()).join(' and ')}`;else if(g.inj&&g.inj.label)t=String(g.inj.label);else t=_T('hurt')}}catch(e){t=_T('hurt')}
  let wk='';if(g.inj&&g.inj.until!=null&&w)wk=' · '+_T`${Math.max(1,g.inj.until-w.week)} wk to fit`;else if((g.severed||[]).length)wk=' · '+_T('only Hygeia regrows a limb');
  return t+wk}

/* ---------- B19 · the sync ---------- */
function inj104Sync(w,pm){if(!V104R.on||!w||!pm||w.dead||w.tutorial||!w.glads)return false;let ch=false;const pool=c104Pool(w,pm);if(!pool.length)return false;
  const by=(a,b)=>effOvr(b)-effOvr(a);const nA=()=>pool.filter(g=>g.tm104==='A').length,nB=()=>pool.filter(g=>g.tm104==='B').length;const fitG=g=>!inj104(g)&&!g.inj;
  const A0=nA();const freed=[];
  /* 1 · out: the ones who cannot fight leave the teams */
  for(const g of pool){if(!inj104(g))continue;
    if(!g.home104){const t=(g.tm104==='A'||g.slot95)?'A':g.tm104==='B'?'B':'';if(t)g.home104={t,s:g.slot95||0}}
    if(g.slot95||g.tm104||g.cover104||g.step104){if(g.slot95)freed.push(g.slot95);delete g.slot95;delete g.tm104;delete g.cover104;delete g.step104;ch=true}}
  /* 2 · in: the reserve takes a freed bout slot, else the best of the Second team; then the First team is topped up from the Second */
  if(freed.length){for(const s of freed.sort()){if(pool.some(x=>x.slot95===s))continue;
      let c=pool.filter(x=>x.tm104==='A'&&!x.slot95&&fitG(x)).sort(by)[0];
      if(c){c.slot95=s;c.step104=s}else{c=pool.filter(x=>x.tm104==='B'&&fitG(x)).sort(by)[0];if(c){c.tm104='A';c.slot95=s;c.cover104={t:'B'};c.step104=s}}}
    while(nA()<A0){const c=pool.filter(x=>x.tm104==='B'&&fitG(x)).sort(by)[0];if(!c)break;c.tm104='A';c.cover104={t:'B'}}ch=true}
  /* 3 · back: fit again, he returns to his old group and slot */
  for(const g of pool){if(!g.home104||inj104(g))continue;const h=g.home104;delete g.home104;ch=true;let to=h.t;
    if(to==='A'){const holder=h.s?pool.find(x=>x.slot95===h.s&&x!==g):null;
      if(nA()>=CAP104.team){const cv=(holder&&holder.cover104)?holder:pool.filter(x=>x.tm104==='A'&&x.cover104&&x!==g).sort((a,b)=>effOvr(a)-effOvr(b))[0];
        if(cv){const back=cv.cover104.t;delete cv.slot95;delete cv.cover104;delete cv.step104;if(back==='B'&&nB()<CAP104.team)cv.tm104='B';else delete cv.tm104}}
      if(nA()<CAP104.team){g.tm104='A';const hd=h.s?pool.find(x=>x.slot95===h.s&&x!==g):null;
        if(h.s&&!hd)g.slot95=h.s;else if(h.s&&hd&&hd.step104===h.s){delete hd.slot95;delete hd.step104;g.slot95=h.s}}
      else to='B'}
    if(to==='B'&&nB()<CAP104.team)g.tm104='B'}
  if(ch){try{st95Ensure(w,pm)}catch(e){console.error(e)}}
  return ch}
{const base=tm104Ensure;tm104Ensure=function(w,pm){const r=base.apply(this,arguments);let c=false;try{c=inj104Sync(w,pm)}catch(e){console.error(e)}return r||c}}
{const base=team104;team104=function(g,pm){const k=base.apply(this,arguments);if(k==='R'&&inj104(g))return 'I';return k}}
/* the injured are not moved by hand; a manual move of a stand-in ends his "cover" mark */
{const base=tm104Move;tm104Move=function(gid,k,slot){try{const g=gById(gid);if(V104R.on&&g){if(inj104(g))return {no:_T('He cannot fight — he waits in the Injured group and goes back by himself when fit.')};
      if(k==='I')return {no:_T('Fighters are placed there by themselves, when they cannot fight.')}}}catch(e){console.error(e)}
  const r=base.apply(this,arguments);try{const g=gById(gid);if(g&&r&&r.ok){delete g.cover104;delete g.step104}}catch(e){}return r}}

/* 351's Match Week warning counted hurt SLOT holders; the injured now leave their slots, so it also warns when a vacated slot found no stand-in */
if(typeof mq104Warn==='function'){const base=mq104Warn;mq104Warn=function(w,pm){const r=base.apply(this,arguments);if(r||!V104R.on)return r;
  try{w=w||W_();pm=pm||me();if(!w||!pm||w.tutorial||!w.night||w.night.bye||w.night.selfBye)return r;const B=(w.night.bouts||[]).filter(b=>!b.done&&!b.any100);if(!B.length)return r;
    const pool=rosterOf(pm).filter(g=>g.alive!==false);if(!pool.some(g=>g.home104))return r;const need=Math.min(3,B.length);
    const ok=pool.filter(g=>[1,2,3].includes(g.slot95)&&!g.inj&&g.restWk!==w.week).length;if(ok>=need)return r;
    const bench=pool.filter(g=>!g.slot95&&!g.inj&&g.restWk!==w.week&&!inj104(g)).length;
    return _T`⚠ Match Week: only ${ok} of your ${need} starters are fit to fight${bench?_T` — ${bench} fit on the bench: promote one on the Roster`:_T(' — and nobody fit on the bench')}.`}catch(e){return r}}}

/* ---------- B6 · no team buttons under the portrait ---------- */
{const base=r104TeamCtl;r104TeamCtl=function(){if(V104R.on)return '';return base.apply(this,arguments)}}

/* ---------- the row: the Injured wound line, the Worn warning, no drag for the injured ---------- */
{const base=r104Row;r104Row=function(g,w,pm,sel,over,grp){const h=base.apply(this,arguments);if(!V104R.on)return h;
  try{const inj=grp==='I',wn=worn104(g);if(!inj&&!wn)return h;const t=document.createElement('template');t.innerHTML=h;const row=t.content.firstElementChild;const n=row&&row.querySelector('.r104n');if(!n)return h;
    const old=n.querySelector('small');
    if(inj){const x=inj104Txt(g);const hm=g.home104?(g.home104.t==='A'?_T('First team'):_T('Second team')):'';row.classList.add('r104inj');row.removeAttribute('draggable');row.removeAttribute('data-r104d');
      const s=document.createElement('small');s.className='rm100one r104injt';s.textContent=x;s.title=x+(hm?' · '+_T`back to the ${hm} when fit`:'');if(old)old.remove();n.appendChild(s)}
    else if(!old){const s=document.createElement('small');s.className='rm100one r104wn';s.textContent='⚠ '+_T('Worn');s.title=WORN104();n.appendChild(s);row.title=(row.title?row.title+' · ':'')+WORN104()}
    return t.innerHTML}catch(e){console.error(e);return h}}}

/* ---------- B1 · Keeping him = six; the fold open; the selected fighter's Worn line ---------- */
if(V104R.on){try{if(typeof R104.keepOpen!=='boolean')R104.keepOpen=true}catch(e){}
  const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);
    try{if(typeof h!=='string'||typeof MGR==='undefined'||MGR.view||MGR.tab!=='roster'||h.indexOf('r104keep')<0)return h;
      const t=document.createElement('template');t.innerHTML=h;const R=t.content;let ch=false;
      for(const b of R.querySelectorAll('.rm100keep [data-mg="ptrain"],.rm100keep [data-mg="medic"]')){b.remove();ch=true}
      const g=gById(MGR.lsel);const pp=R.querySelector('.rm100pp');
      if(pp&&g&&worn104(g)&&!pp.querySelector('.r104wnp')){pp.insertAdjacentHTML('beforeend',`<p class="r104wnp">⚠ ${esc(WORN104())}</p>`);ch=true}
      return ch?t.innerHTML:h}catch(e){console.error(e)}return h}}

/* ---------- B19 · the bout picker warns about a worn fighter ---------- */
if(V104R.on&&typeof any100PickHTML==='function'){const base=any100PickHTML;any100PickHTML=function(){const h=base.apply(this,arguments);
  try{if(typeof h!=='string'||h.indexOf('a1fr')<0)return h;const t=document.createElement('template');t.innerHTML=h;let ch=false;
    for(const r of t.content.querySelectorAll('.a1fr[data-any100^="sel|"]')){const g=gById(r.dataset.any100.slice(4));if(!g||!worn104(g)||r.classList.contains('no'))continue;
      const n=r.querySelector('.a1fn');if(n){n.insertAdjacentHTML('beforeend',`<small class="a1wn">⚠ ${esc(WORN104())}</small>`);ch=true}}
    return ch?t.innerHTML:h}catch(e){console.error(e)}return h}}

/* ---------- drag: the group headers light up; the Injured group takes no drop ---------- */
if(V104R.on){
  document.addEventListener('dragstart',e=>{if(e.target&&e.target.closest&&e.target.closest('[data-r104d]'))document.body.classList.add('r104dnd')},true);
  const off=()=>document.body.classList.remove('r104dnd');document.addEventListener('dragend',off,true);document.addEventListener('drop',()=>setTimeout(off,0),true);
  const noI=e=>{const gz=e.target&&e.target.closest&&e.target.closest('.r104g[data-r104g="I"]');if(gz){e.stopPropagation()}};
  document.addEventListener('dragover',noI,true);document.addEventListener('drop',noI,true)}

/* ---------- the look ---------- */
if(V104R.on){const st=document.createElement('style');st.id='r104rcss';st.textContent=`
.r104hint{font-size:11.5px;color:var(--dim);padding:0 2px 2px;line-height:1.3}
body.r104dnd .r104g:not([data-r104g="I"]):not([data-r104g="L"]) .r104gh{background:#d6ab4c26;box-shadow:inset 0 0 0 1px #d6ab4c99;border-radius:4px}
body.r104dnd .r104g:not([data-r104g="I"]):not([data-r104g="L"]) .r104gh b::after{content:" ⇣";color:#f0cf7d}
.r104g[data-r104g="I"] .r104gh b{color:#ff9a8a}
.r104inj .r104injt{color:#ffb0a0}.r104r.r104inj{cursor:pointer}
.r104wn{color:#f2c14e!important}.r104wnp{margin:6px 0 0;font-size:12px;color:#f2c14e}.a1wn{color:#f2c14e;display:block}
.r104n small{width:0;min-width:100%}
/* B2 · one grid, subgrid rows: the name column is as wide as the longest name */
@media (min-width:981px){.rm100.rm100-roster.r104{grid-template-columns:minmax(440px,min(540px,46%)) minmax(0,1fr)}}
.r104 .r104rows{display:grid;grid-template-columns:22px 24px fit-content(210px) 30px 26px 38px 34px 38px 22px 30px;column-gap:5px;align-content:start}
.r104 .r104rows>.rm100lh.r104h,.r104 .r104rows>.r104g,.r104 .r104g>.rm100lr.r104r{grid-column:1/-1;display:grid;grid-template-columns:subgrid}
.r104 .r104g>.r104gh,.r104 .r104g>.r104e{grid-column:1/-1}
@container r104l (max-width:470px){
  .r104 .r104rows{grid-template-columns:22px 24px minmax(0,1fr) 26px 36px 30px 36px}}
@container r104l (max-width:360px){.r104 .r104rows{grid-template-columns:20px 22px minmax(0,1fr) 24px 34px 36px}}
/* B1 · six plates in one row where there is room */
.r104keep{container:r104k/inline-size}
@container r104k (min-width:500px){
  .r104keep .rm100keep .acts.v101plts{grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
  .r104keep .rm100keep .btn.v101plt{grid-template-columns:minmax(0,1fr);justify-items:center;text-align:center;gap:3px;padding:6px 4px;min-height:0;align-content:start;align-items:start}
  .r104keep .rm100keep .btn.v101plt .v101pi{width:28px;height:28px}
  .r104keep .rm100keep .btn.v101plt .v101pt{display:grid;gap:2px;justify-items:center;min-width:0}
  .r104keep .rm100keep .btn.v101plt b{font-size:11.5px;line-height:1.15}
  .r104keep .rm100keep .btn.v101plt .v101pcs{justify-content:center;font-size:10px;gap:2px}}
`;document.head.appendChild(st)}

/* =====================================================================
   213-V92YARD · v0.92 — the Training Yard redesigned (Virgilante's picks, 2026-10-06)
   =====================================================================
   1. ONE CARD PER FIGHTER (y92Card): a bar per trainable rating — 🏃 Speed, 💪 Strength, 📜 Tactics (int), 🎭 Crowd (cha).
      Each bar = the value inside its decade, the locked gain (darker) and the planned gain (lighter) + "71.0 → 71.6".
      [+] plans one SESSION on that rating, [−] takes back a planned (not yet locked) one. 🍀 Luck is read-only (it grows
      with contract time + loyalty, 66 weeklyGrowth). 😮‍💨 Fatigue shows now → after this week's booked yard work.
   2. CAP + HOURS: at most Y92.CAP (3) sessions per fighter a week; each session = 1 of the house's training hours
      (thMax/thLeft; a thUsed wrapper counts planned + locked sessions and presets, so every other screen sees the same pool).
   3. 🔒 LOCK IN (per card, or Lock all): planned → locked (P.y92[gid] = {L locked, Q planned, pre preset, care}). Unlocked
      plans never resolve (the week's checklist + End-the-week warn). After a lock you may plan more up to the cap and lock
      again. Previews are cumulative (y92Sim): the week's own maths in the week's own order — presets, locked sessions,
      old P.g drills, sparring, the regime — with statGain's sums (yd90Grow), so a preview = what endWeek applies.
      Resolution: a thResolve wrapper (before the old plan) — statGain(k, sessions × TH_DRILL × intensity), Crowd adds
      fame like the old drill; fatigue = sessions × FAT_HOUR × intensity (endWeek wrapper, once per week).
   4. THE DOCTORE (y92DocHTML): his face + name from the council (131), his LEVEL = 1 + Yard level + ½ per doctore hour
      (y92DocLv, max 6), the INTENSITY = the house regime (data-mg="regime": None / Light / Normal / Hard, same costs and
      squad drills as before) which also multiplies session gains and fatigue (Y92_MUL), his hours (data-tp="doc"), Study
      the card, and his PRESETS (Y92_PRE): two ratings in one drill, one session's worth each × (1 + bonus); bonus 10% + 5%
      per level above 1; more presets unlock with his level. A preset needs ≥1 LOCKED session that week, costs Y92.PRE_H
      house hours, does not count toward the cap, one per fighter a week; it locks with the card's Lock in.
   5. ↻ SAME AS LAST WEEK: re-plans every fit fighter's last locked sessions (w.y92last, saved when the week turns; a
      fighter with none falls back to his old standing routine g.ord87.r) — still needs Lock in, respects cap/hours.
   6. CARE = one small button per card (data-y92care): 1 hour = morale talk (+5) + gear care (+1 AP next bout) — the x74
      jobs, with the second hour refunded by the thUsed wrapper. 🤝 Bond and ⚒ Own doctore stay on the card.
   7. ⚔ TRIALS OF THE YARD (y92TrialsHTML): spar, exhibition, beast pen leave the cards for a framed strip with drawn art
      (wooden swords · benches · the cage), each with its cost, fatigue and what it gives, for the fighter picked in the
      strip. The buttons are the old data-yb76 ones and the panel under the strip is cut from yardCard76, so the trials
      behave exactly as before (one a week, boutDone76).
   8. The routine selects / squad table / drill tiles / focus hours are gone (practiceHTML wrapper rebuilds the body; the
      room banner and the road lock stay). Standing drill routines no longer auto-train (ord87Apply wrapper: only care,
      rest and rehab still run); the old g.ord87 is kept and seeds ↻ the first time. No save shape change (P.y92 lives in
      the weekly w.tplan; w.y92last is created lazily).
   9. Hurt / resting / at war (yard92Lock, 210): the card shows locked — 🩹 rehab only (data-tp rehab) / 🛏 resting — no
      sessions; planned sessions of a fighter who gets hurt are dropped.
   10. Phones: one card per row, bars stack, buttons ≥ 32 px.
   Test: tv92y.
   ===================================================================== */
const Y92={CAP:3,PRE_H:2};
const Y92_K=[['spd','🏃',_T('Speed')],['str','💪',_T('Strength')],['int','📜',_T('Tactics')],['cha','🎭',_T('Crowd')]];
const Y92_MUL={off:{g:1,f:1},light:{g:1.1,f:1},std:{g:1.2,f:1.25},hard:{g:1.35,f:1.5}};
const Y92_PRE=[{k:'foot',ic:'👣',n:_T('Footwork'),a:'spd',b:'int',lv:1},{k:'iron',ic:'⚒',n:_T('Iron'),a:'str',b:'spd',lv:1},
  {k:'show',ic:'🎭',n:_T('The Showman'),a:'cha',b:'int',lv:2},{k:'blood',ic:'🩸',n:_T('Blood and Sand'),a:'str',b:'cha',lv:3},
  {k:'vet',ic:'🛡',n:_T('The Veteran'),a:'int',b:'str',lv:4},{k:'parade',ic:'🏇',n:_T('The Parade'),a:'spd',b:'cha',lv:5}];
const y92Sum=o=>Object.values(o||{}).reduce((a,b)=>a+(+b||0),0);
function y92Of(P,id){P.y92=P.y92||{};return P.y92[id]||(P.y92[id]={L:{},Q:{},pre:null,care:0})}
const y92Peek=(P,id)=>(P.y92&&P.y92[id])||{L:{},Q:{},pre:null,care:0};
function y92Mul(w,m){const k=w&&w.train||'off';const R=TRAIN_REGIMES[k]||TRAIN_REGIMES.off;const ok=!R.c||(m&&m.coin>=R.c);return ok?(Y92_MUL[k]||Y92_MUL.off):Y92_MUL.off}
function y92DocLv(w,m){const P=thPlan(w);const y=Math.floor(typeof facLvl==='function'?facLvl(m,'yard'):0);return Math.min(6,1+y+Math.floor((P.doc||0)/2))}
const y92Bonus=lv=>0.10+0.05*Math.max(0,lv-1);
const y92Pre=k=>Y92_PRE.find(x=>x.k===k);
const y92Ic=k=>(Y92_K.find(x=>x[0]===k)||[k,k])[1];
const y92Nm=k=>(Y92_K.find(x=>x[0]===k)||[k,k,k])[2];
const y92f=v=>(Math.round(v*10)/10).toFixed(1);
const y92Out=g=>{try{return typeof yard92Lock==='function'?yard92Lock(g):null}catch(e){return null}};
function y92Lock(g){if(g&&g.inj&&g.inj.war)return ['⚔',_T('Away at war')];return y92Out(g)}
/* the hours: planned + locked sessions and presets count; a card's Care refunds its second hour */
{const base=thUsed;thUsed=function(w){let n=base.apply(this,arguments);try{const P=thPlan(w||W_());for(const y of Object.values(P.y92||{})){n+=y92Sum(y.L)+y92Sum(y.Q)+(y.pre?Y92.PRE_H:0)-(y.care?1:0)}}catch(e){}return n}}

/* ---------- the week's maths on a copy (the same order endWeek uses) ---------- */
/* o = {L: sessions to count, pre: preset or null} → {k:[now, after, gain]} for the four trainable ratings + work (fatigue) */
function y92Sim(g,o){const w=W_(),m=me();const P=thPlan(w);const st0=gStats(g)||{};const sx0=g.sxp||{};const st={...st0},sx={...sx0};const mul=y92Mul(w,m);
  const out=!!y92Lock(g);let work=0;
  if(g.alive!==false){
    if(!out){const pr=o.pre&&y92Pre(o.pre.k);if(pr){const bn=o.pre.bn!=null?o.pre.bn:y92Bonus(y92DocLv(w,m));const a=TH_DRILL*(1+bn)*mul.g;yd90Grow(st,sx,pr.a,a);yd90Grow(st,sx,pr.b,a);work+=Y92.PRE_H*FAT_HOUR*mul.f}
      for(const [k,h] of Object.entries(o.L||{})){if(h>0){yd90Grow(st,sx,k,h*TH_DRILL*mul.g);work+=h*FAT_HOUR*mul.f}}}
    for(const [k,h] of Object.entries(P.g[g.id]||{})){if(h&&k!=='rehab'){yd90Grow(st,sx,k,h*TH_DRILL);work+=h*FAT_HOUR}}
    for(const p of P.pairs){if(p.k==='spar'&&(p.a===g.id||p.b===g.id)){yd90Grow(st,sx,'spd',0.25);yd90Grow(st,sx,'str',0.25);work+=FAT_SPAR}}
    const reg=w.train||'off';const R=TRAIN_REGIMES[reg]||TRAIN_REGIMES.off;const tr=TRAIN_STAT[reg]||0;
    let coin=m?m.coin:0;const team=R.c>0&&coin>=R.c;if(team)coin-=R.c;const solo=!team&&!!g.ptrain&&coin>=PTRAIN_COST;
    if((team||solo)&&!g.inj){const s=solo?0.35:0;yd90Grow(st,sx,'str',tr+s);yd90Grow(st,sx,'spd',(tr+s)*0.8);yd90Grow(st,sx,'int',tr*0.2)}
    if(g.restWk!==w.week)work+=FAT_REG[reg]||0}
  const r={work:Math.round(work)};for(const [k] of Y92_K){const a=(st0[k]||0)+(sx0[k]||0),b=(st[k]||0)+(sx[k]||0);r[k]=[a,b,b-a]}return r}
const y92Add=(a,b)=>{const o={...a};for(const [k,v] of Object.entries(b||{}))o[k]=(o[k]||0)+v;return o};
/* three views: locked only, everything planned, one more session of k */
function y92Views(g){const P=thPlan(W_());const y=y92Peek(P,g.id);const lockPre=y.pre&&y.pre.lock?y.pre:null;
  return {lock:y92Sim(g,{L:y.L,pre:lockPre}),all:y92Sim(g,{L:y92Add(y.L,y.Q),pre:y.pre}),y}}

/* ---------- resolution ---------- */
{const base=thResolve;thResolve=function(w){const P=thPlan(w);if(P.done)return base.apply(this,arguments);const m=me();const mine=[];let n=0;
  try{const mul=y92Mul(w,m);for(const [id,y] of Object.entries(P.y92||{})){const g=gById(id);if(!g||!g.alive||!rosterOf(m).includes(g)||y92Lock(g))continue;const bits=[];
    const pr=y.pre&&y.pre.lock&&y92Pre(y.pre.k);if(pr){const a=TH_DRILL*(1+(y.pre.bn||0))*mul.g;statGain(g,pr.a,a);statGain(g,pr.b,a);bits.push(`${pr.ic} ${pr.n}`)}
    for(const [k,h] of Object.entries(y.L||{})){if(!(h>0))continue;statGain(g,k,h*TH_DRILL*mul.g);if(k==='cha')g.fame=clamp((g.fame||0)+Math.floor(h*TH_FAME),0,100);n+=h;bits.push(`${y92Ic(k)}×${h}`)}
    if(bits.length)mine.push(`${esc(g.name)}: ${bits.join(' ')}`)}}catch(e){console.error(e)}
  const prev=w.lastPlan;w.lastPlan=null;const r=base.apply(this,arguments);const bo=w.lastPlan||[];
  w.lastPlan=mine.length||bo.length?[...mine,...bo]:prev;
  if(mine.length&&typeof tnews==='function')tnews(_T`🏋 The yard: ${n} session${n===1?'':'s'} — ${mine.slice(0,3).join('; ')}${mine.length>3?'…':''}`);
  return r}}
/* fatigue for the locked work (sessions × intensity), once a week; last week's locks are kept for ↻ */
{const base=endWeek;endWeek=async function(){const w=W_();const wk=w&&w.week;let P=null;
  try{const m=w&&!w.dead?me():null;if(m){P=thPlan(w);if(!P.y92f){P.y92f=1;const mul=y92Mul(w,m);
    for(const [id,y] of Object.entries(P.y92||{})){const g=gById(id);if(!g||y92Lock(g))continue;const h=y92Sum(y.L)+(y.pre&&y.pre.lock?Y92.PRE_H:0);if(h>0)g.fat=Math.min(100,gFat(g)+Math.round(h*FAT_HOUR*mul.f))}}}}catch(e){console.error(e)}
  const r=await base.apply(this,arguments);
  try{const w2=W_();if(P&&w2&&w2===w&&w2.week!==wk){const last={};for(const [id,y] of Object.entries(P.y92||{}))if(y92Sum(y.L))last[id]={...y.L};
    if(Object.keys(last).length)w2.y92last=last;else if(w2.y92last&&!P.y92)delete w2.y92last}}catch(e){console.error(e)}
  return r}}
/* standing drill routines no longer auto-train (care, rest and rehab still run) */
const Y92_DRILLR=['spd','str','int','cha','bal'];
{const base=ord87Apply;ord87Apply=function(w,g){try{if(g&&g.ord87&&Y92_DRILLR.includes(g.ord87.r)&&!g.inj){g.ord87.short=0;return}}catch(e){}return base.apply(this,arguments)}}
ord87RunAll=function(w){const m=me();if(!w||!m||w.dead||w.tutorial)return 0;const ros=rosterOf(m).filter(g=>g.ord87&&g.ord87.r&&g.ord87.r!=='off'&&(g.inj||!Y92_DRILLR.includes(g.ord87.r)));
  for(const g of ros)ord87Apply(w,g);return ros.length};

/* ---------- actions ---------- */
function y92Plus(g,k){const w=W_();const P=thPlan(w);const y=y92Of(P,g.id);if(y92Lock(g)||y92Sum(y.L)+y92Sum(y.Q)>=Y92.CAP||thLeft(w)<1)return false;y.Q[k]=(y.Q[k]||0)+1;return true}
function y92Minus(g,k){const P=thPlan(W_());const y=y92Of(P,g.id);if(!(y.Q[k]>0))return false;y.Q[k]--;if(!y.Q[k])delete y.Q[k];return true}
function y92LockIn(g){const w=W_(),m=me();const P=thPlan(w);const y=y92Of(P,g.id);if(y92Lock(g))return false;const q=y92Sum(y.Q);const pre=y.pre&&!y.pre.lock;if(!q&&!pre)return false;
  y.L=y92Add(y.L,y.Q);y.Q={};if(y.pre&&!y.pre.lock){if(y92Sum(y.L)>=1){y.pre.lock=1;y.pre.bn=y92Bonus(y92DocLv(w,m))}else y.pre=null}return true}
function y92Same(){const w=W_(),m=me();const P=thPlan(w);const last=w.y92last||{};let n=0;
  for(const g of rosterOf(m)){if(y92Lock(g))continue;let src=last[g.id];
    if(!src){const r=g.ord87&&g.ord87.r;src=r==='bal'?{spd:1,str:1,int:1}:['spd','str','int','cha'].includes(r)?{[r]:Y92.CAP}:null}if(!src)continue;
    const y=y92Of(P,g.id);y.Q={};for(const [k,v] of Object.entries(src)){let want=Math.max(0,v-(y.L[k]||0));while(want-->0&&y92Plus(g,k))n++}}
  return n}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-y92s],[data-y92lock],[data-y92all],[data-y92same],[data-y92pre],[data-y92care]');if(!t||t.disabled||!t.closest('#mgrBody'))return;
  e.preventDefault();e.stopPropagation();const w=W_(),m=me();if(!w||!m)return;
  if(typeof roadLocked76==='function'&&roadLocked76(w)){mToast(_T`🛣 On the road to <b>${esc(roadCity76(w))}</b> — the Training Yard reopens when the week ends.`);return}
  const P=thPlan(w);let ok=false;
  if(t.dataset.y92s){const [id,k,d]=t.dataset.y92s.split('|');const g=gById(id);if(g)ok=+d>0?y92Plus(g,k):y92Minus(g,k)}
  else if(t.dataset.y92lock){const g=gById(t.dataset.y92lock);if(g&&(ok=y92LockIn(g)))mToast(_T`🔒 ${esc(g.name)}: locked in.`)}
  else if(t.hasAttribute('data-y92all')){let c=0;for(const g of rosterOf(m))if(y92LockIn(g))c++;ok=c>0;if(ok)mToast(_T`🔒 ${c} card${c===1?'':'s'} locked in.`)}
  else if(t.hasAttribute('data-y92same')){const c=y92Same();ok=true;mToast(c?_T`↻ ${c} session${c===1?'':'s'} planned as last week — lock them in.`:_T('↻ Nothing to repeat (or no hours left).'))}
  else if(t.dataset.y92pre!=null){const [id,k]=t.dataset.y92pre.split('|');const g=gById(id);if(!g)return;const y=y92Of(P,id);
    if(!k){if(y.pre&&!y.pre.lock){y.pre=null;ok=true}}
    else{const pr=y92Pre(k);const swap=y.pre&&!y.pre.lock?Y92.PRE_H:0;if(pr&&!y92Lock(g)&&y92Sum(y.L)>=1&&!(y.pre&&y.pre.lock)&&y92DocLv(w,m)>=pr.lv&&thLeft(w)+swap>=Y92.PRE_H){y.pre={k,lock:0};ok=true}}}
  else if(t.dataset.y92care){const g=gById(t.dataset.y92care);const X=x74(w);if(g&&!y92Lock(g)&&!X.morale.includes(g.id)&&!X.gear.includes(g.id)&&thLeft(w)>=1){
    X.morale.push(g.id);X.gear.push(g.id);y92Of(P,g.id).care=1;g.morale=clamp((g.morale||50)+5,0,100);g.gear74=w.season+':'+w.week;ok=true;
    tnews(_T`🗣 ${esc(g.name)}: a word in the yard and the kit buckled tight (+5 morale, +1 AP next bout).`)}}
  if(ok){saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()}},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.matches||!t.matches('[data-tr92]'))return;MGR.tr92=t.value;MGR.yb76=null;if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);

/* ---------- the card ---------- */
function y92Bar(g,k,ic,lab,V,can){const [now,after,gain]=V.all[k];const lk=V.lock[k][1];const lo=Math.floor(now/10)*10;const pc=v=>Math.max(0,Math.min(100,(v-lo)*10));
  const q=V.y.Q[k]||0,l=V.y.L[k]||0;let more='';if(can){try{const nx=y92Sim(g,{L:y92Add(y92Add(V.y.L,V.y.Q),{[k]:1}),pre:V.y.pre});more=_T`+1 session → ${y92f(nx[k][1])}`}catch(e){}}
  return `<div class="y92r" data-y92k="${k}"><span class="y92l">${ic} ${lab}</span>
    <span class="y92m"><i style="width:${pc(now)}%"></i><u style="left:${pc(now)}%;width:${pc(lk)-pc(now)}%"></u><s style="left:${pc(lk)}%;width:${Math.max(0,pc(after)-pc(lk))}%"></s></span>
    <span class="y92v">${gain>0.004?`${y92f(now)} → <b>${y92f(after)}</b>`:y92f(now)}</span>
    <span class="y92pm"><button type="button" class="y92b" data-y92s="${g.id}|${k}|-1" ${q?'':'disabled'} aria-label="−">−</button><span class="y92n" title="${_T`locked ${l} · planned ${q}`}">${l?`<i class="lk">${'●'.repeat(l)}</i>`:''}${q?`<i>${'○'.repeat(q)}</i>`:''}</span><button type="button" class="y92b plus" data-y92s="${g.id}|${k}|1" ${can?'':'disabled'} title="${esc(more)}" aria-label="+">+</button></span></div>`}
function y92Card(g,w,m){const P=thPlan(w);const lk=y92Lock(g);const f=gFat(g);const st=gStats(g)||{};const X=x74(w);const o=effOvr(g);
  if(lk){const y=P.y92&&P.y92[g.id];if(y&&(y92Sum(y.Q)||(y.pre&&!y.pre.lock))){y.Q={};if(y.pre&&!y.pre.lock)y.pre=null}}
  const V=y92Views(g);const y=V.y;const used=y92Sum(y.L)+y92Sum(y.Q);const left=thLeft(w);const can=!lk&&used<Y92.CAP&&left>=1;
  const head=`<div class="y92hd">${gArt(g,'xs')}<div class="y92nm"><b>${esc(g.name)}</b><span class="rc-sub">${_T`rating ${o} · morale ${g.morale}`}${typeof fatChip90==='function'?' '+fatChip90(g):''}</span></div>
    <span class="y92cap" title="${_T`Sessions this week (max ${Y92.CAP})`}">${used}/${Y92.CAP}</span></div>`;
  const luck=`<div class="y92r ro"><span class="y92l">🍀 ${_T`Luck`}</span><span class="y92m"><i style="width:${Math.max(0,Math.min(100,((st.lck||50)+((g.sxp||{}).lck||0)-Math.floor((st.lck||50)/10)*10)*10))}%"></i></span><span class="y92v">${st.lck??'—'}</span><span class="y92note rc-sub">${_T`grows with loyalty`}</span></div>`;
  const fa=Math.min(100,f+V.all.work);
  const fat=`<div class="y92r ro ft"><span class="y92l">😮‍💨 ${_T`Fatigue`}</span><span class="y92m"><i style="width:${f}%;background:${fatCol(f)}"></i><s style="left:${f}%;width:${fa-f}%"></s></span><span class="y92v">${fa>f?`${f} → <b>${fa}</b>`:f}</span><span class="y92note rc-sub">${_T`this week's work`}</span></div>`;
  if(lk){const reh=(P.g[g.id]||{}).rehab||0;const hurt=g.inj&&!g.inj.war;
    const rb=hurt?`<div class="y92rh"><button type="button" class="yd76b ${reh?'on':''}" data-tp="g|${g.id}|rehab|1" ${left>0&&reh<2?'':'disabled'}>${_T`🩹 Rehab<small>${reh>=2?_T('back a week sooner'):_T`${2-reh} h → back a week sooner`}</small>`}</button>${reh?`<button type="button" class="y92b" data-tp="g|${g.id}|rehab|-1" aria-label="−">−</button>`:''}</div>`:'';
    return `<div class="y92c locked" data-y92c="${g.id}">${head}<div class="y92lk"><b>${lk[0]} ${lk[1]}</b>${hurt?'':`<button type="button" class="btn tksm" data-mg="tab" data-id="infirm">${_T`Infirmary`}</button>`}</div>${rb}${luck}${fat}</div>`}
  const bars=Y92_K.map(([k,ic,lab])=>y92Bar(g,k,ic,lab,V,can)).join('');
  /* the doctore's preset */
  const lv=y92DocLv(w,m);let pre='';
  if(y.pre){const pr=y92Pre(y.pre.k);pre=`<div class="y92pre on${y.pre.lock?' lk':''}"><span>${_T`Doctore's drill`}</span><b>${pr.ic} ${pr.n}</b><span class="rc-sub">${y92Ic(pr.a)}+${y92Ic(pr.b)} · ${Y92.PRE_H} h${y.pre.lock?' · 🔒':''}</span>${y.pre.lock?'':`<button type="button" class="y92b" data-y92pre="${g.id}|" aria-label="✕">✕</button>`}</div>`}
  else if(y92Sum(y.L)>=1){const opts=Y92_PRE.filter(p=>p.lv<=lv);pre=`<div class="y92pre"><span>${_T`Doctore's drill`}</span>${opts.map(p=>`<button type="button" class="y92pb" data-y92pre="${g.id}|${p.k}" ${left>=Y92.PRE_H?'':`disabled title="${_T`Needs ${Y92.PRE_H} hours`}"`}>${p.ic} ${p.n}<small>${y92Ic(p.a)}+${y92Ic(p.b)}</small></button>`).join('')}</div>`} /* i18n:skip */
  else pre=`<div class="y92pre off rc-sub">${_T`🧑‍🏫 Lock in a session to unlock the doctore's drill.`}</div>`;
  const q=y92Sum(y.Q)+(y.pre&&!y.pre.lock?1:0);const both=X.morale.includes(g.id)||X.gear.includes(g.id);
  const busy=MGR.yb76&&MGR.yb76.gid===g.id&&MGR.yb76.k==='bond';let panel='';if(busy){try{const h=yardCard76(g,w,m);const i=h.indexOf('<div class="yd76p');if(i>=0){const c=cutDiv(h,i);if(c)panel=c[0]}}catch(e){}}
  const bondOn=P.pairs.some(p=>p.k==='bond'&&(p.a===g.id||p.b===g.id));
  const foot=`<div class="y92ft"><button type="button" class="btn tksm primary y92go" data-y92lock="${g.id}" ${q?'':'disabled'}>${q?_T`🔒 Lock in (${q})`:y92Sum(y.L)?_T('🔒 Locked'):_T('🔒 Lock in')}</button>
    <button type="button" class="yd76b ${both?'on':''}" data-y92care="${g.id}" ${both||left<1?'disabled':''}>${_T`🗣 Care<small>${both?_T('done'):_T('1 h · morale + gear')}</small>`}</button>
    <button type="button" class="yd76b ${bondOn||busy?'on':''}" data-yb76="bond:${g.id}" ${bondOn||left<2?'disabled':''}>${_T`🤝 Bond<small>2 h · loyalty</small>`}</button>
    <button type="button" class="yd76b ${g.ptrain?'on':''}" data-mg="ptrain" data-id="${g.id}">${_T`⚒ Own doctore<small>${coinAmt87(PTRAIN_COST)}${g.ptrain?' ✓':''}</small>`}</button></div>`;
  return `<div class="y92c${q?' pend':''}" data-y92c="${g.id}">${head}<div class="y92bars">${bars}${luck}${fat}</div>${pre}${foot}${panel}</div>`}
/* an Immortalis wears the gold laurel frame here too (157) */
{const base=y92Card;y92Card=function(g){const h=base.apply(this,arguments);try{return typeof imm88Frame==='function'?imm88Frame(h,g):h}catch(e){return h}}}

/* ---------- the doctore ---------- */
const Y92_REG=[['off','💤',_T('None')],['light','🚶',_T('Light')],['std','🏃',_T('Normal')],['hard','🔥',_T('Hard')]];
function y92DocHTML(w,m){const P=thPlan(w),X=x74(w);const left=thLeft(w),mx=thMax();const lv=y92DocLv(w,m);const bn=Math.round(y92Bonus(lv)*100);
  let a=null;try{a=typeof council83==='function'?council83(w).find(x=>x.k==='doctore'):null}catch(e){}
  const face=a&&typeof face83==='function'?face83(a,58):'🧑‍🏫';const cur=w.train||'off';const Y=Math.floor(facLvl(m,'yard'));
  const reg=Y92_REG.map(([k,ic,l])=>{const R=TRAIN_REGIMES[k];const M=Y92_MUL[k];return `<button type="button" class="y92rg${cur===k?' on':''}" data-mg="regime" data-id="${k}">${ic} <b>${l}</b><small>${R.c?coinAmt87(R.c):_T('free')}${k==='off'?'':_T` · gains ×${M.g} · fatigue ×${M.f}`}</small></button>`}).join('');
  const pres=Y92_PRE.map(p=>`<span class="y92pc${p.lv<=lv?'':' off'}">${p.ic} <b>${p.n}</b> ${y92Ic(p.a)}+${y92Ic(p.b)}${p.lv<=lv?'':` <small>${_T`level ${p.lv}`}</small>`}</span>`).join('');
  const pend=rosterOf(m).reduce((s,g)=>{const y=y92Peek(P,g.id);return s+y92Sum(y.Q)+(y.pre&&!y.pre.lock?1:0)},0);
  return `<div class="card2 y92doc"><div class="y92dh"><span class="y92face">${face}</span><div class="y92dn"><b>${a?esc(a.name):_T('Your doctore')}</b><span class="rc-sub">${_T`Doctore · level ${lv}`} <span class="y92st">${'★'.repeat(lv)}${'☆'.repeat(6-lv)}</span></span>
      <span class="rc-sub">${_T`His drills give +${bn}% · Yard ${Y}/3 · hours with him ${P.doc}/${TH_DOC}`}</span></div>
    <div class="y92bank"><span class="thbig">${left}</span><span class="rc-sub">${_T`of ${mx} h left`}</span>
      <div class="y92acts"><button type="button" class="btn tksm" data-y92same>${_T`↻ Same as last week`}</button><button type="button" class="btn tksm primary" data-y92all ${pend?'':'disabled'}>${_T`🔒 Lock all${pend?` (${pend})`:''}`}</button></div></div></div>
    <div class="y92dr"><span class="yd76l">${_T`Intensity`}</span><div class="y92rgs">${reg}</div></div>
    <div class="y92dr"><span class="yd76l">${_T`His drills`}</span><div class="y92pcs">${pres}</div></div>
    <div class="y92dr"><span class="yd76l">${_T`Time`}</span><div class="y92dx"><span class="thc"><button type="button" data-tp="doc|-1" ${P.doc>0?'':'disabled'}>−</button><b>${P.doc}</b><button type="button" data-tp="doc|1" ${left>0&&P.doc<TH_DOC?'':'disabled'}>+</button></span><span class="rc-sub">${_T`hours with the squad: sharper regime, +1 level per 2 h`}</span>
      <button type="button" class="yd76b ${X.study?'on':''}" data-yj="study" ${X.study||left<1?'disabled':''}>${_T`📜 Study the card<small>${X.study?_T('done'):_T('1 h · a little Tactics for your fighters on the card')}</small>`}</button></div></div></div>`}

/* ---------- ⚔ Trials of the Yard ---------- */
const Y92_ART={
  spar:`<svg viewBox="0 0 120 70" aria-hidden="true"><rect x="0" y="54" width="120" height="16" fill="#5a3b1f"/><g stroke="#2a1708" stroke-width="2"><g transform="rotate(-38 60 36)"><rect x="56" y="4" width="8" height="52" rx="2" fill="#a8743f"/><rect x="47" y="50" width="26" height="6" rx="2" fill="#6d4523"/><rect x="57" y="56" width="6" height="12" fill="#4a2c12"/></g><g transform="rotate(38 60 36)"><rect x="56" y="4" width="8" height="52" rx="2" fill="#b98550"/><rect x="47" y="50" width="26" height="6" rx="2" fill="#6d4523"/><rect x="57" y="56" width="6" height="12" fill="#4a2c12"/></g></g><circle cx="60" cy="36" r="4" fill="#e3c27a"/></svg>`,
  exh:`<svg viewBox="0 0 120 70" aria-hidden="true"><rect x="0" y="0" width="120" height="70" fill="#2b1c0f"/><g fill="#7b5531" stroke="#2a1708"><rect x="4" y="28" width="112" height="7"/><rect x="4" y="48" width="112" height="7"/></g><g fill="#d9b48a" stroke="#3a2412" stroke-width="1">${[12,26,40,54,68,82,96,108].map((x,i)=>`<circle cx="${x}" cy="${20-(i%2)*2}" r="5"/>`).join('')}${[18,32,46,60,74,88,102].map((x,i)=>`<circle cx="${x}" cy="${41-(i%2)*2}" r="5"/>`).join('')}</g><g fill="#8a2a1f">${[12,40,68,96].map(x=>`<rect x="${x-4}" y="23" width="8" height="5"/>`).join('')}</g><path d="M30 62 h60" stroke="#e3c27a" stroke-width="2"/></svg>`,
  pen:`<svg viewBox="0 0 120 70" aria-hidden="true"><rect x="0" y="56" width="120" height="14" fill="#6b4a26"/><ellipse cx="60" cy="50" rx="22" ry="10" fill="#3a2614"/><g fill="#e8c890"><circle cx="52" cy="44" r="2.4"/><circle cx="68" cy="44" r="2.4"/></g><g stroke="#6b6f74" stroke-width="4">${[10,24,38,52,66,80,94,108].map(x=>`<line x1="${x}" y1="6" x2="${x}" y2="60"/>`).join('')}</g><g stroke="#3d4144" stroke-width="5"><line x1="4" y1="8" x2="116" y2="8"/><line x1="4" y1="34" x2="116" y2="34"/></g></svg>`};
function y92TrialsHTML(w,m){const ros=rosterOf(m);if(!ros.length)return '';
  if(MGR.yb76&&MGR.yb76.k!=='bond'&&ros.some(g=>g.id===MGR.yb76.gid))MGR.tr92=MGR.yb76.gid;
  if(!ros.some(g=>g.id===MGR.tr92)){const ok=ros.find(g=>!y92Lock(g)&&!boutDone76(g,w));MGR.tr92=(ok||ros[0]).id}
  const g=gById(MGR.tr92);const P=thPlan(w);const left=thLeft(w);const lk=y92Lock(g);const bd=boutDone76(g,w);const busy=MGR.yb76&&MGR.yb76.gid===g.id&&MGR.yb76.k!=='bond'?MGR.yb76.k:null;
  const opps=w.mgrs.filter(x=>!x.isPlayer&&rosterOf(x).length);const why=lk?lk[1]:bd?_T('One trial a week — done'):'';
  const card=(k,art,ttl,cost,fat,give,attr,dis)=>`<div class="y92t${busy===k?' on':''}${dis?' dis':''}"><div class="y92ta">${art}</div><div class="y92tb"><b>${ttl}</b>
      <span class="y92tl">⏳ ${cost}</span><span class="y92tl">😮‍💨 ${fat}</span><span class="y92tl give">${give}</span>
      <button type="button" class="btn tksm ${busy===k?'':'primary'}" ${attr} ${dis?`disabled title="${esc(dis)}"`:''}>${busy===k?_T('Close'):_T('Pick this')}</button></div></div>`; /* i18n:skip */
  const cards=[card('spar',Y92_ART.spar,_T('⚔ Spar'),_T('2 h each · a housemate'),`+${FAT_SPAR}`,_T('🏃 +0.25 · 💪 +0.25 each'),`data-yb76="spar:${g.id}"`,why||(left<2?_T('Needs 2 hours'):'')), /* i18n:skip */
    card('exh',Y92_ART.exh,_T('🏟 Exhibition'),_T`${EXHIB_HOURS} h · ${coinAmt87(EXHIB_COST)}`,`+${FAT_EXH}`,_T`vs a rival · a chance at +1 rating · +1 AP and ${cfAmt87('+2')} this Match Week`,`data-yb76="exh:${g.id}"`,why||(!opps.length?_T('No rival has fighters'):left<EXHIB_HOURS?_T`Needs ${EXHIB_HOURS} hours`:m.coin<EXHIB_COST?_T('Not enough coin'):'')), /* i18n:skip */
    card('pen',Y92_ART.pen,_T('🐾 Beast pen'),_T`${PEN76.hours} h + fee`,_T('a real fight'),_T`kill it: +${PEN76.bonus} to a rating`,`data-yb76="pen:${g.id}"`,why||(left<PEN76.hours?_T`Needs ${PEN76.hours} hours`:''))].join(''); /* i18n:skip */
  let panel='';if(busy){try{const h=yardCard76(g,w,m);const i=h.indexOf('<div class="yd76p');if(i>=0){const c=cutDiv(h,i);if(c)panel=c[0]}}catch(e){console.error(e)}}
  let res=[];try{res=yardRes76(g,w).filter(x=>/⚔|🏟|🐾/.test(x))}catch(e){}
  const sel=`<select class="tin" data-tr92>${ros.map(x=>{const y=y92Lock(x);const d=boutDone76(x,w);return `<option value="${x.id}" ${x.id===g.id?'selected':''}>${esc(x.name)}${y?` — ${y[1]}`:d?_T(' — trial done'):''}</option>`}).join('')}</select>`;
  return `<div class="y92trials"><div class="y92th"><b>${_T`⚔ Trials of the Yard`}</b><span class="rc-sub">${_T`one a week per fighter`}</span><label class="rc-sub">${_T`Fighter`} ${sel}</label></div>
    <div class="y92tg">${cards}</div>${panel}${res.length?`<div class="yd76res">${res.map(x=>`<span>${x}</span>`).join('')}</div>`:''}</div>`}

/* ---------- the tab ---------- */
function yard92HTML(){const w=W_(),m=me();const ros=rosterOf(m);
  const cards=ros.map(g=>y92Card(g,w,m)).join('');const last=(w.lastPlan||[]).slice(0,6);
  const away=typeof yd90Away==='function'&&yd90Away(w)?`<div class="card2 yd90away">${_T`🛣 Away — no training this week`}</div>`:'';
  return `${away}${y92DocHTML(w,m)}<div class="y92grid">${cards||`<p class="rc-sub">${_T`No fighters in the yard.`}</p>`}</div>${y92TrialsHTML(w,m)}
    ${last.length||(w.exlog||[]).length?`<details class="yd76log"><summary class="rc-sub">${_T`📜 Last week in the yard`}</summary>${last.map(x=>`<div class="rc-sub">${x}</div>`).join('')}${(w.exlog||[]).slice(0,4).map(x=>`<div class="rc-sub">S${x.s} W${x.wk} · ${x.txt}</div>`).join('')}</details>`:''}`}
{const base=practiceHTML;practiceHTML=function(){const h=base.apply(this,arguments);try{const w=W_(),m=me();if(!w||w.dead||MGR.view||!m)return h;
  const t=document.createElement('template');t.innerHTML=h;const hd=t.content.querySelector('.roomhd');const body=yard92HTML();const n=typeof lockNote76==='function'?lockNote76(_T('Training Yard')):'';
  return (hd?hd.outerHTML:'')+(n?n+`<div class="locked76">${body}</div>`:body)}catch(e){console.error(e);return h}}}
/* the checklist: planned sessions that are not locked in */
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_(),m=me();const P=thPlan(w);
  const n=rosterOf(m).reduce((s,g)=>{const y=y92Peek(P,g.id);return s+(y92Lock(g)?0:y92Sum(y.Q)+(y.pre&&!y.pre.lock?1:0))},0);
  if(n)I.push({done:false,ic:'🔒',txt:_T`<b>${n}</b> yard session${n===1?'':'s'} planned but not locked in`,btn:`<button class="btn tksm" type="button" data-mg="tab" data-id="practice">${_T`Lock in`}</button>`})}catch(e){console.error(e)}return I}}

(()=>{const st=document.createElement('style');st.textContent=`
.y92doc{margin:10px 0;display:grid;gap:8px;background:linear-gradient(180deg,rgba(90,55,25,.35),rgba(30,20,10,.2));border-color:#6b5420}
.y92dh{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center}
.y92face{width:58px;height:58px;border-radius:50%;overflow:hidden;border:2px solid var(--gold);display:grid;place-items:center;font-size:34px;background:#2b1c0f}.y92face svg{display:block}
.y92dn{display:grid;gap:2px;min-width:0}.y92dn b{font:400 19px var(--display);color:var(--gold2)}.y92st{color:#f0cf7d;letter-spacing:1px}
.y92bank{display:grid;justify-items:end;gap:4px}.y92bank .thbig{font:400 30px var(--display);color:var(--gold2);line-height:1}.y92acts{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.y92dr{display:grid;grid-template-columns:90px minmax(0,1fr);gap:8px;align-items:center;border-top:1px solid var(--line2);padding-top:6px}
.y92rgs,.y92pcs,.y92dx{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.y92rg{display:inline-grid;text-align:left;padding:4px 9px;border:1px solid var(--line2);border-radius:7px;background:var(--panel2);color:var(--bone);cursor:pointer;font-size:13.5px;min-height:34px}
.y92rg small{color:var(--muted);font-size:11px}.y92rg.on{border-color:var(--gold);background:#3a2a18}.y92rg:hover{border-color:var(--gold)}
.y92pc{font-size:12.5px;border:1px solid #6b5420;border-radius:12px;padding:2px 8px;background:rgba(58,42,24,.6)}.y92pc.off{opacity:.45;border-style:dashed}.y92pc small{color:var(--muted)}
.y92grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:10px;margin:10px 0}
.y92c{border:1px solid var(--line2);border-radius:10px;background:var(--panel2);padding:8px 10px;display:grid;gap:6px;min-width:0;align-content:start;align-self:start}.y92c.pend{border-color:#d9a441}
.y92c.locked{opacity:.85;background:repeating-linear-gradient(135deg,var(--panel2) 0 10px,rgba(0,0,0,.12) 10px 20px)}
.y92hd{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:8px;align-items:center}.y92hd .portrait,.y92hd>:first-child{flex:none}
.y92nm{display:grid;min-width:0}.y92nm b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px}
.y92cap{font:600 13px var(--mono,monospace);border:1px solid var(--line2);border-radius:9px;padding:1px 7px;color:var(--gold2)}
.y92bars{display:grid;gap:3px}
.y92r{display:grid;grid-template-columns:92px minmax(50px,1fr) 92px auto;gap:6px;align-items:center;font-size:13px}
.y92l{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.y92v{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.y92v b{color:#8fdc6a}
.y92m{position:relative;height:9px;border-radius:5px;background:var(--line2);overflow:hidden}.y92m i{position:absolute;left:0;top:0;bottom:0;background:#c9a34a}
.y92m u{position:absolute;top:0;bottom:0;background:#6fbf4a}.y92m s{position:absolute;top:0;bottom:0;background:rgba(160,230,120,.55);text-decoration:none}
.y92r.ft .y92m s{background:rgba(217,120,65,.6)}.y92r.ro .y92note{grid-column:4;font-size:11px;white-space:nowrap}
.y92pm{display:inline-flex;align-items:center;gap:3px}.y92n{min-width:30px;text-align:center;font-size:10px;letter-spacing:-1px;color:#8fdc6a}.y92n i{font-style:normal}.y92n i.lk{color:var(--gold2)}
.y92b{min-width:32px;min-height:32px;border:1px solid var(--line2);border-radius:7px;background:#2b1c0f;color:var(--gold2);font:700 17px/1 var(--display,serif);cursor:pointer;padding:0}
.y92b.plus{border-color:#6b5420}.y92b:disabled{opacity:.35;cursor:default}.y92b:hover:not(:disabled){border-color:var(--gold)}
.y92pre{display:flex;flex-wrap:wrap;gap:5px;align-items:center;border-top:1px dashed var(--line2);padding-top:5px;font-size:12.5px}.y92pre>span:first-child{font:600 11px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.y92pre.on b{color:#f0cf7d}.y92pre.lk{opacity:.9}.y92pre.off{border-top:1px dashed var(--line2);padding-top:5px}
.y92pb{display:inline-grid;text-align:left;border:1px solid #6b5420;border-radius:8px;background:#2b1c0f;color:var(--bone);padding:3px 8px;cursor:pointer;font-size:12.5px;min-height:32px}.y92pb small{color:var(--muted);font-size:10.5px}.y92pb:disabled{opacity:.4}
.y92ft{display:flex;flex-wrap:wrap;gap:5px;align-items:stretch}.y92ft .yd76b{min-height:32px;padding:3px 7px;font-size:12.5px}.y92go{min-height:32px}
.y92lk{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;border:1px dashed var(--line2);border-radius:8px}.y92rh{display:flex;gap:6px;align-items:center}
.y92trials{margin:14px 0;padding:10px 12px 12px;border:2px solid #8a6a2a;border-radius:12px;background:linear-gradient(180deg,#3a2614,#22160b);box-shadow:inset 0 0 0 3px #22160b,inset 0 0 0 4px #6b5420,0 4px 14px rgba(0,0,0,.35)}
.y92th{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-bottom:8px}.y92th>b{font:400 21px var(--display);color:var(--gold2);letter-spacing:.04em}.y92th label{margin-left:auto}.y92th select{max-width:220px}
.y92tg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.y92t{display:grid;grid-template-rows:auto 1fr;border:1px solid #c9a34a;border-radius:9px;overflow:hidden;background:#efe2c4;color:#2b1c0f;box-shadow:0 0 0 3px #4a3218,0 0 0 4px #c9a34a}
.y92t.on{box-shadow:0 0 0 3px #4a3218,0 0 0 5px #f0cf7d}.y92t.dis{filter:saturate(.4);opacity:.75}
.y92ta{background:linear-gradient(180deg,#2b1c0f 0 78%,#5a3b1f 78%);border-bottom:2px solid #c9a34a}.y92ta svg{display:block;width:100%;height:84px}.y92tb{display:grid;gap:2px;padding:7px 9px 9px}.y92tb>b{font:400 18px var(--display);color:#5a2a12}
.y92tl{font-size:12.5px}.y92tl.give{color:#3d5a1c}.y92tb .btn{margin-top:4px;justify-self:start;min-height:32px}
.y92trials .yd76p{margin-top:10px;background:var(--panel2)}.y92trials .yd76res{margin-top:8px}
@media (max-width:700px){.y92grid{grid-template-columns:minmax(0,1fr)}.y92tg{grid-template-columns:minmax(0,1fr)}.y92t{grid-template-columns:120px minmax(0,1fr);grid-template-rows:none}.y92ta svg{height:100%}
  .y92dh{grid-template-columns:auto minmax(0,1fr)}.y92bank{grid-column:1/-1;justify-items:start;grid-template-columns:auto auto 1fr;align-items:center}.y92acts{justify-content:flex-start}
  .y92dr{grid-template-columns:minmax(0,1fr)}.y92th label{margin-left:0}
  .y92r{grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"l v pm" "m m m";row-gap:2px}.y92r .y92l{grid-area:l}.y92r .y92v{grid-area:v}.y92r .y92m{grid-area:m}.y92r .y92pm{grid-area:pm;justify-content:flex-end}
  .y92r.ro{grid-template-areas:"l v n" "m m m"}.y92r.ro .y92note{grid-area:n;grid-column:auto}}
`;document.head.appendChild(st)})();

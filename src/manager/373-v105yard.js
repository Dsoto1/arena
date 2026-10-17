/* =====================================================================
   373-V105YARD · v1.05 B44 — THE TRAINING YARD REWORK (his answers t1a t2a t3a y1a, 2026-10-17; the approved mock-up
   tools/plans/v105/NOTES.md "B44 mock-up"). Manager only. Kill switch localStorage flavius_v105yoff=1 (the v1.04 Yard). Test tv105k.
   =====================================================================
   t1a  THE DOCTORE RUNS ONE TEAM DRILL A WEEK. The Doctore row (top of the room): his face + name + level, TIME WITH HIM (− N h +,
        big), the level ladder, Intensity (None / Light / Normal / Hard = data-mg="regime", same costs + Y92_MUL multipliers), ONE drill
        tile cycled with ‹ › (Y92_PRE: Footwork … The Parade) and a chip per fighter: every FIT fighter drills, a tap sits him out
        (P.y105.out). 0 hours = no team drill: the drill tile and Intensity are greyed "Give the Doctore time to run a drill".
        REPLACES 213's per-fighter Doctore drills (y.pre, 2 house hours each) — the plates/tiles are gone.
   t2a  HIS LEVEL COMES FROM THE HOURS: 1 h = Lv 1, +1 level per 2 more hours (3 h Lv 2, 5 h Lv 3 …), capped at
        2 + Yard level (+ the Council Doctore's 294 bonus levels, which also count as free levels), max Lv 5; the + button stops
        at the hours that reach the cap (y105DocMax). Drill bonus = 213's y92Bonus(level) + 5% per Yard level. A drill above his
        level shows what opens it ("3 h with him opens it" / "Needs Yard II"). REPLACES 213's "level = 1 + Yard + hours/2".
        Intensity works only with hours: with 0 h the week runs at None (w.train is held at 'off' while endWeek runs and in the
        week's money/preview; the house's choice itself is kept for the next week with hours).
   y1a  His hours are P.doc — the same weekly training hours (thUsed already counts them). The banner shows ONE big number:
        training hours left of the week's total.
   The fighter's own sessions (213 data-y92s +/−, Y92.CAP 3, y92Sim previews incl. the team drill) are unchanged; Bond and Own
        doctore stay under them. A hurt / resting / away fighter shows why and cannot drill (his chip is greyed).
   ⚔ TRIAL OF THE YARD = ONE tile cycled with ‹ › (spar / exhibition / beast pen) beside the sessions, with a run button for the
        selected fighter: the old data-yb76 button (108's handler opens the yardCard76 panel below it — partner, rival, beast);
        269's one-a-week rules (boutDone76, trialUsedBy99) and the beast pen untouched. The fighter = MGR.tr92 (the squad list
        rows are 269's [data-y99sel]).
   TABULA strip at the bottom: one box per fighter (sessions · drill · trial), ↻ Same as last week (sessions + his hours + drill
        + sit-outs + intensity, w.y105last saved when the week turns) and a big 🔒 LOCK IN ALL: locks sessions (y92LockIn), his hours
        (P.doclk), Intensity (P.reglk), the drill and the sit-outs (P.y105 lv/bn/on, P.lk105). After it NOTHING in the Yard is
        choosable (buttons disabled + a window-capture guard refuses stray clicks). d1a now = the hours lock with Lock in all.
        357's B28 "No drills set" task is done by P.reglk as before. The team drill trains only once locked (like sessions).
   RESOLUTION (thResolve wrapper): every fit, not sat-out fighter: statGain on both ratings × TH_DRILL × (1 + bonus) × Intensity
        gains, fatigue Y92.PRE_H × FAT_HOUR × Intensity fatigue — 213's preset maths, applied to every drilling fighter.
   OLD SAVES: per-fighter drills already LOCKED this week keep their effect (213 resolves them; that fighter skips the team drill);
        unlocked ones are dropped (their 2 h come back) — SAVE_MIGRATIONS '1.05' + the same idempotent clean on every draw/endWeek.
        New field only: the week plan's P.y105 {k, out, on, lv, bn}, P.lk105, w.y105last.
   Rivals: unchanged — AI houses never used the per-fighter drills (88 rivalRegime / weeklyGrowth).
   Lessons: 36-mtutor's yard steps and 308's first-hour tip are re-pointed and re-worded for the team drill + Lock in all.
   Display only, static DOM, no animation, no per-frame cost.
   ===================================================================== */
const V105Y={on:(()=>{try{return localStorage.getItem('flavius_v105yoff')!=='1'}catch(e){return true}})(),ROM:['','I','II','III'],TR:['spar','exh','pen']};
function y105Live(){try{const w=typeof W_==='function'?W_():null;return V105Y.on&&w&&!w.dead?w:null}catch(e){return null}}
if(V105Y.on){
/* ---------- the plan + his level ---------- */
function y105T(P){if(!P.y105||typeof P.y105!=='object')P.y105={k:null,out:[]};if(!Array.isArray(P.y105.out))P.y105.out=[];return P.y105}
function y105Peek(P){return (P&&P.y105)||{k:null,out:[]}}
/* old saves: a per-fighter drill not yet locked can no longer be locked — dropped (its hours come back); idempotent */
function y105Clean(P){let n=0;try{if(P&&P.y92&&!P.lk105)for(const y of Object.values(P.y92))if(y&&y.pre&&!y.pre.lock){y.pre=null;n++}}catch(e){}return n}
function y105Adv(w,m){try{if(!m||!m.isPlayer||!w||w.tutorial||typeof ADV100==='undefined'||typeof adv98Lv!=='function')return 0;return Math.max(0,ADV100.docK(adv98Lv(w,'doctore'))||0)}catch(e){return 0}}
const y105Yard=m=>{try{return Math.max(0,Math.floor(typeof facLvl==='function'?facLvl(m,'yard')||0:0))}catch(e){return 0}};
function y105Cap(w,m){return Math.min(5,2+y105Yard(m)+y105Adv(w,m))}
function y105LvAt(w,m,h){if(!(h>0))return 0;return Math.min(y105Cap(w,m),y105Adv(w,m)+1+Math.floor((h-1)/2))}
function y105Lv(w,m){return y105LvAt(w,m,thPlan(w).doc||0)}
/* the hours with him that reach level L */
function y105HrsFor(w,m,L){const a=y105Adv(w,m);return L<=a+1?1:1+2*(L-a-1)}
function y105DocMax(w,m){return y105HrsFor(w,m,y105Cap(w,m))}
function y105Bonus(w,m,lv){return lv>0?y92Bonus(lv)+0.05*y105Yard(m):0}
function y105K(w){const T=y105Peek(thPlan(w));if(T.k&&y92Pre(T.k))return T.k;const L=w.y105last;return L&&L.k&&y92Pre(L.k)?L.k:Y92_PRE[0].k}
function y105Fit(g){return !!g&&g.alive!==false&&!y92Lock(g)}
function y105OwnPre(P,g){const y=y92Peek(P,g.id);return y.pre&&y.pre.lock?y.pre:null}
function y105Open(w,m){const pr=y92Pre(y105K(w));return !!pr&&(thPlan(w).doc||0)>0&&pr.lv<=y105Lv(w,m)}
function y105Drillers(w,m){const P=thPlan(w);const T=y105Peek(P);if(!y105Open(w,m))return [];return rosterOf(m).filter(g=>y105Fit(g)&&!T.out.includes(g.id)&&!y105OwnPre(P,g))}
/* Intensity works only with his hours: run fn with the week's regime held at None when he has none */
function y105With(w,fn){const P=thPlan(w);const off=!((P.doc||0)>0)&&w.train&&w.train!=='off';const keep=w.train;if(off)w.train='off';try{return fn()}finally{if(off)w.train=keep}}
const y105First=g=>{const p=String(g&&g.name||'').replace(/"/g,'').split(/\s+/);return /^the$/i.test(p[0])&&p[1]?p[0]+' '+p[1]:p[0]};
function y105RivOff(){try{return localStorage.getItem('flavius_v105rivoff')==='1'}catch(e){return false}}
function y105Doc(w){try{return council83(w).find(x=>x.k==='doctore')||null}catch(e){return null}}
function y105TrialOf(g,w){try{const P=thPlan(w);if(P.pairs.some(p=>p.k==='spar'&&(p.a===g.id||p.b===g.id)))return _T('⚔ Spar');if(g.exWk===w.week)return _T('🏟 Exhibition');if(g.pen76Wk===w.week)return _T('🐾 Beast pen')}catch(e){}return ''}

/* ---------- actions ---------- */
function y105LockAll(w,m){const P=thPlan(w);const T=y105T(P);let c=0;for(const g of rosterOf(m))try{if(y92LockIn(g))c++}catch(e){}
  const lv=y105Lv(w,m);const k=y105K(w);const pr=y92Pre(k);T.k=k;T.lv=lv;T.bn=y105Bonus(w,m,lv);T.on=!!((P.doc||0)>0&&pr&&pr.lv<=lv);
  P.doclk=P.doc||0;P.reglk=1;P.lk105=1;MGR.yb76=null;return c}
function y105Same(w,m){const P=thPlan(w);const T=y105T(P);const L=w.y105last;let n=0;
  if(L){const want=Math.min(L.doc||0,y105DocMax(w,m));while((P.doc||0)<want&&thLeft(w)>=1){P.doc=(P.doc||0)+1;n++}
    if(L.k&&y92Pre(L.k))T.k=L.k;const ids=new Set(rosterOf(m).map(g=>g.id));T.out=(L.out||[]).filter(id=>ids.has(id));if(L.train&&TRAIN_REGIMES[L.train])w.train=L.train}
  try{n+=y92Same()}catch(e){console.error(e)}return n}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-y105]');if(!t||!t.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();if(t.disabled)return;
  const w=y105Live(),m=w&&me();if(!w||!m)return;const [a,b]=t.dataset.y105.split('|');const P=thPlan(w);
  if(typeof roadLocked76==='function'&&roadLocked76(w)){mToast(_T`🛣 On the road to <b>${esc(roadCity76(w))}</b> — the Training Yard reopens when the week ends.`);return}
  if(P.lk105){mToast(_T('🔒 The week is locked in — nothing changes until next week.'));return}
  const T=y105T(P);
  if(a==='tr'){const i=Math.max(0,V105Y.TR.indexOf(MGR.tr105));MGR.tr105=V105Y.TR[(i+(+b)+V105Y.TR.length)%V105Y.TR.length];if(MGR.yb76&&MGR.yb76.k!=='bond')MGR.yb76=null}
  else if(a==='doc'){const v=(P.doc||0)+(+b);if(v<0||(+b>0&&(v>y105DocMax(w,m)||thLeft(w)<1)))return;P.doc=v}
  else if(a==='dr'){const i=Math.max(0,Y92_PRE.findIndex(p=>p.k===y105K(w)));T.k=Y92_PRE[(i+(+b)+Y92_PRE.length)%Y92_PRE.length].k}
  else if(a==='out'){const g=gById(b);if(!g||!y105Fit(g)||!y105Open(w,m))return;const i=T.out.indexOf(b);if(i>=0)T.out.splice(i,1);else T.out.push(b)}
  else if(a==='same'){const n=y105Same(w,m);mToast(n?_T('↻ Planned as last week — Lock in all to make it count.'):_T('↻ Nothing to repeat (or no hours left).'))}
  else if(a==='lock'){y105LockAll(w,m);const pr=y92Pre(T.k);const n=T.on?y105Drillers(w,m).length:0;
    mToast(T.on?_T`🔒 Locked in — ${n} fighter${n===1?'':'s'} drill ${pr.ic} ${pr.n} this week.`:_T('🔒 The week\'s plan is locked in.'))}
  else return;
  try{saveWorld()}catch(x){}if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* after Lock in all nothing in the Yard is choosable: stray clicks on the old buttons are refused before any handler */
const Y105_GUARD='[data-y92s],[data-y92lock],[data-y92all],[data-y92same],[data-y92pre],[data-y92care],[data-tp],[data-mg="regime"],[data-mg="ptrain"],[data-yb76],[data-yp76],[data-yj],[data-pen76],[data-mg="exsim"],[data-mg="exlive"],[data-mg="exfight"]';
window.addEventListener('click',e=>{try{const t=e.target&&e.target.closest?e.target.closest(Y105_GUARD):null;if(!t||!t.closest('#mgrPane')||MGR.tab!=='practice')return;const w=y105Live();if(!w||!thPlan(w).lk105)return;
  e.preventDefault();e.stopImmediatePropagation();mToast(_T('🔒 The week is locked in — nothing changes until next week.'))}catch(x){console.error(x)}},true);
/* and no new per-fighter drills (the team drill replaces them) */
window.addEventListener('click',e=>{try{const t=e.target&&e.target.closest?e.target.closest('[data-y92pre]'):null;if(!t||!t.closest('#mgrBody')||!y105Live())return;e.preventDefault();e.stopImmediatePropagation()}catch(x){}},true);

/* ---------- resolution: the team drill on every drilling fighter ---------- */
{const base=thResolve;thResolve=function(w){const P=thPlan(w);if(P.done||!V105Y.on)return base.apply(this,arguments);const m=me();let line='';
  try{const T=P.y105;if(T&&T.on&&P.lk105&&m&&!w.dead){const pr=y92Pre(T.k);if(pr){const mul=y92Mul(w,m);const amt=TH_DRILL*(1+(T.bn||0))*mul.g;const fat=Math.round(Y92.PRE_H*FAT_HOUR*mul.f);const who=[];
    for(const g of rosterOf(m)){if(!y105Fit(g)||(T.out||[]).includes(g.id)||y105OwnPre(P,g))continue;statGain(g,pr.a,amt);statGain(g,pr.b,amt);g.fat=Math.min(100,gFat(g)+fat);g.fatWk=w.week;who.push(g)}
    if(who.length)line=_T`🧑‍🏫 Team drill ${pr.ic} ${pr.n}: ${who.length} fighter${who.length===1?'':'s'} (${y92Ic(pr.a)}+${y92Ic(pr.b)}, +${Math.round((T.bn||0)*100)}%)`}}}catch(e){console.error(e)}
  const prev=w.lastPlan;const r=base.apply(this,arguments);
  if(line){try{w.lastPlan=w.lastPlan&&w.lastPlan!==prev?[line,...w.lastPlan]:[line];if(typeof tnews==='function')tnews(line)}catch(e){console.error(e)}}
  return r}}
/* the week turns: Intensity only with hours, the old 4-hour regime lift kept, last week's plan kept for ↻ */
{const base=endWeek;endWeek=async function(){const w=y105Live();if(!w)return base.apply(this,arguments);const wk=w.week;let P=null,doc=0,keep=w.train,off=false,cl=false,T=null;
  try{P=thPlan(w);y105Clean(P);doc=P.doc||0;T=P.y105?{...P.y105,out:(P.y105.out||[]).slice()}:null;
    if(!(doc>0)&&w.train&&w.train!=='off'){w.train='off';off=true}if(doc>TH_DOC){P.doc=TH_DOC;cl=true}}catch(e){console.error(e)}
  try{return await base.apply(this,arguments)}finally{try{if(off)w.train=keep;if(cl&&P)P.doc=doc;const w2=W_();
    if(w2===w&&w2.week!==wk&&(doc>0||T))w2.y105last={doc,k:T&&T.k||null,out:T?T.out:[],train:keep}}catch(e){console.error(e)}}}}
{const base=weekMoney;weekMoney=function(){const w=y105Live();return w?y105With(w,()=>base.apply(this,arguments)):base.apply(this,arguments)}}
SAVE_MIGRATIONS.push(['1.05',w=>{if(w&&w.tplan)y105Clean(w.tplan)}]);

/* ---------- the room ---------- */
function y105Art(inner){return `<span class="y105art" aria-hidden="true">${typeof rm100Art==='function'?rm100Art(inner):inner}</span>`}
function y105DrillArt(p){try{if(typeof rm100Scn!=='function'||typeof RM100_DRILL==='undefined')return `<span class="y105ic">${p.ic}</span>`;const A=RM100_DRILL[p.k]||['school','50% 50%','soldier'];
  const fig=A[3]?rm100Mini(A[2],'height:62%;left:18%;bottom:4%')+rm100Mini(A[3],'height:62%;left:52%;bottom:4%;transform:scaleX(-1)'):rm100Mini(A[2],'height:66%;left:36%;bottom:4%');return y105Art(rm100Scn(A[0],A[1])+fig)}catch(e){return `<span class="y105ic">${p.ic}</span>`}}
function y105TrialArt(k,g){try{if(typeof rm100Scn!=='function')return `<span class="y105tsv">${Y92_ART[k]||''}</span>`;const mk=typeof rm100MiniK==='function'?rm100MiniK(g):'soldier';
  const A={spar:rm100Scn('school','50% 70%')+rm100Mini(mk,'height:66%;left:26%;bottom:5%')+rm100Mini('soldier','height:68%;left:52%;bottom:5%;transform:scaleX(-1)'),
    exh:rm100Scn('promote','50% 60%')+rm100Mini('royalty','height:60%;left:42%;bottom:6%'),
    pen:rm100Scn('school','70% 80%')+rm100Mini('leo','height:52%;left:20%;bottom:6%')+rm100Mini(mk,'height:62%;left:56%;bottom:5%;transform:scaleX(-1)')+'<span class="rm100cage"></span>'};
  return y105Art(A[k]||'')}catch(e){return ''}}
function y105DocHTML(w,m){const P=thPlan(w);const T=y105Peek(P);const LK=!!P.lk105;const doc=P.doc||0;const lv=y105Lv(w,m);const cap=y105Cap(w,m);const mx=y105DocMax(w,m);const left=thLeft(w);
  const Y=y105Yard(m);const adv=y105Adv(w,m);const a=y105Doc(w);const face=a&&typeof face83==='function'?face83(a,76):'🧑‍🏫';const X=x74(w);
  const lvTxt=lv?_T`Lv ${lv} (cap Lv ${cap})`+(adv>0&&!y105RivOff()?' · '+_T`+${adv} from ${esc(a?a.name:_T('your Doctore'))}`:''):_T('no drill (0 h)');
  const ladder=[1,2,3,4,5].map(L=>{const ok=L<=cap,on=lv>=L;const need=L-2-adv;const hl=adv>0&&!y105RivOff()?(L<=adv?_T`Lv ${L} · free`:(y105HrsFor(w,m,L)-doc>0?_T`Lv ${L} · +${y105HrsFor(w,m,L)-doc} h`:_T`Lv ${L} · ✓`)):_T`Lv ${L} · ${y105HrsFor(w,m,L)} h`;return `<span class="y105lad${on?' on':ok?'':' off'}">${hl}${ok?'':` · ${_T`Yard ${V105Y.ROM[Math.max(1,Math.min(3,need))]}`}`}</span>`}).join('');
  const advName=a?a.name:_T('your Doctore');const advNote=adv>0&&!y105RivOff()?`<div class="y105sub y105advn">${_T`+${adv} from ${esc(advName)} (your Doctore advisor)`}</div>`:'';
  const regs=Y92_REG.map(([k,ic,l])=>{const R=TRAIN_REGIMES[k];const M=Y92_MUL[k];const on=doc>0&&(w.train||'off')===k;
    return `<button type="button" class="y105seg${on?' on':''}" data-mg="regime" data-id="${k}" ${doc>0&&!LK?'':'disabled'}><b>${ic} ${l}</b><small>${doc>0?(R.c?coinAmt87(R.c):_T('free'))+(k==='off'?'':` · ×${M.g}`):_T('needs his time')}</small></button>`}).join('');
  const k=y105K(w);const pr=y92Pre(k);const i=Y92_PRE.indexOf(pr);const open=doc>0&&pr.lv<=lv;const bn=Math.round(y105Bonus(w,m,Math.max(lv,1))*100);
  const need=pr.lv>cap?_T`Needs Yard ${V105Y.ROM[Math.max(1,Math.min(3,pr.lv-2-adv))]}`:_T`${y105HrsFor(w,m,pr.lv)} h with him opens it`;
  const msg=doc<=0?_T('Give the Doctore time to run a drill'):open?(LK?_T('✓ The squad drills this — locked in'):_T('✓ The squad drills this')):`🔒 ${need}`;
  const ros=rosterOf(m);const fit=ros.filter(y105Fit);const drl=y105Drillers(w,m);
  const chips=ros.map(g=>{const lk=y92Lock(g);const own=y105OwnPre(P,g);const out=T.out.includes(g.id);
    if(lk)return `<button type="button" class="y105chip dis" disabled title="${esc(lk[1])}">${lk[0]} ${esc(y105First(g))}</button>`;
    if(own)return `<button type="button" class="y105chip dis" disabled title="${esc(_T('His own drill this week'))}">${esc(y105First(g))} · ${y92Pre(own.k).ic}</button>`;
    return `<button type="button" class="y105chip${out?' out':''}" data-y105="out|${g.id}" ${open&&!LK?'':'disabled'} aria-pressed="${out?'false':'true'}" title="${esc(out?_T('Sits out — tap to drill'):_T('Drills — tap to sit him out'))}">${out?'':'✓ '}${esc(y105First(g))}</button>`}).join('');
  const cnt=doc<=0?_T('No team drill this week.'):open?_T`${drl.length} of ${fit.length} fit fighters drill · ${y92Nm(pr.a)} + ${y92Nm(pr.b)}`:_T('Pick a drill he can run, or give him more time.');
  return `<section class="y105p y105doc${doc>0?'':' idle'}${LK?' lk':''}"><div class="y105dtop">
    <div class="y105who"><span class="y105face">${face}</span><div><div class="y105cap">${_T('The Doctore · this week')}</div><div class="y105nm">${a?esc(a.name):_T('Your doctore')}</div><div class="y105sub">${_T('runs ONE team drill · his level now:')} <b>${lvTxt}</b></div></div></div>
    <div class="y105time"><div class="y105cap">${_T('Time with him')}</div><div class="y105row"><button type="button" class="y105step" data-y105="doc|-1" aria-label="${esc(_T('Less time'))}" ${doc>0&&!LK?'':'disabled'}>−</button><span class="y105dh"><b class="y105big">${doc}</b> h</span><button type="button" class="y105step" data-y105="doc|1" aria-label="${esc(_T('More time'))}" ${!LK&&left>0&&doc<mx?'':'disabled'}>+</button></div>
      <div class="y105lads">${ladder}</div>${advNote}<div class="y105sub">${_T`from the training hours · Yard ${Y}/3 · drills +${bn}%`}</div>
      <button type="button" class="y105mini${X.study?' on':''}" data-yj="study" ${X.study||left<1||LK?'disabled':''}>${X.study?_T('📜 Studied the card'):_T('📜 Study the card · 1 h')}</button></div>
    <div class="y105int"><div class="y105cap">${_T('Intensity · the whole squad')}</div><div class="y105segs">${regs}</div><div class="y105sub">${doc>0?_T('Gains and fatigue of the team drill and every session.'):_T('Give the Doctore time to run a drill')}</div></div></div>
    <div class="y105dbot"><div class="y105drill"><button type="button" class="y105arr" data-y105="dr|-1" aria-label="${esc(_T('Previous drill'))}" ${LK?'disabled':''}>‹</button>
      <div class="y105dt${open?' on':''}" data-y105k="${pr.k}">${y105DrillArt(pr)}<div class="y105dtx"><div class="y105cap">${_T`Team drill · ${i+1} of ${Y92_PRE.length}`}</div><div class="y105nm">${pr.ic} ${pr.n}</div>
        <div class="y105sub">${y92Nm(pr.a)} + ${y92Nm(pr.b)} · ${_T`Lv ${pr.lv}`}${open?` · +${bn}%`:''}</div><div class="y105msg${open?' ok':''}">${msg}</div></div></div>
      <button type="button" class="y105arr" data-y105="dr|1" aria-label="${esc(_T('Next drill'))}" ${LK?'disabled':''}>›</button></div>
    <div class="y105whod"><div class="y105cap">${_T('Who drills · tap to sit a fighter out')}</div><div class="y105chips">${chips}</div><div class="y105sub">${cnt}</div></div></div></section>`}
function y105SquadHTML(w,m,sel){const P=thPlan(w);return `<section class="y105p y105sq"><div class="y105cap">${_T('The squad · own sessions')}</div>${rosterOf(m).map(g=>{const y=y92Peek(P,g.id);const n=Math.min(Y92.CAP,y92Sum(y.L)+y92Sum(y.Q));const lk=y92Lock(g);
  const face=typeof rm100Face==='function'?rm100Face(g):gArt(g,'xs');
  return `<button type="button" class="y105sr${g===sel?' on':''}" data-y99sel="${g.id}"><span class="y105av">${face}</span><b>${esc(g.name)}</b><span class="y105dots">${lk?lk[0]:'●'.repeat(n)+'○'.repeat(Y92.CAP-n)}</span></button>`}).join('')}</section>`}
function y105SesHTML(g,w,m){const P=thPlan(w);const LK=!!P.lk105;const lk=y92Lock(g);const f=gFat(g);const o=effOvr(g);const left=thLeft(w);
  if(lk){const y=P.y92&&P.y92[g.id];if(y&&y92Sum(y.Q))y.Q={}}
  const y=y92Peek(P,g.id);const used=y92Sum(y.L)+y92Sum(y.Q);const own=y105OwnPre(P,g);const on=y105Drillers(w,m).includes(g);const out=y105Peek(P).out.includes(g.id);
  const head=`<div class="y105sh"><div><div class="y105cap">${_T('Own sessions · training hours')}</div><div class="y105nm">${esc(g.name)}</div><div class="y105sub">${_T`rating ${o} · morale ${g.morale}`}${typeof fatChip90==='function'?' '+fatChip90(g):''}</div></div>
    <div class="y105sn"><div class="y105cap">${_T('Sessions')}</div><div class="y105nb">${used} / ${Y92.CAP}</div></div></div>`;
  if(lk){const reh=(P.g[g.id]||{}).rehab||0;const hurt=g.inj&&!g.inj.war;
    const rb=hurt?`<div class="y92rh"><button type="button" class="yd76b ${reh?'on':''}" data-tp="g|${g.id}|rehab|1" ${left>0&&reh<2&&!LK?'':'disabled'}>${_T`🩹 Rehab<small>${reh>=2?_T('back a week sooner'):_T`${2-reh} h → back a week sooner`}</small>`}</button>${reh&&!LK?`<button type="button" class="y92b" data-tp="g|${g.id}|rehab|-1" aria-label="−">−</button>`:''}</div>`:'';
    return `<section class="y105p y105ses out" data-y105g="${g.id}">${head}<div class="y105out"><b>${lk[0]} ${lk[1]}</b><span class="y105sub">${_T('No sessions and no team drill this week.')}</span>${hurt?`<button type="button" class="btn tksm" data-mg="tab" data-id="infirm">${_T('Infirmary')}</button>`:''}</div>${rb}</section>`}
  const team=on?{k:y105K(w),bn:y105Bonus(w,m,y105Lv(w,m)),lock:1}:null;const pre=own||team;
  const can=!LK&&used<Y92.CAP&&left>=1;
  const body=y105With(w,()=>{const V={lock:y92Sim(g,{L:y.L,pre:own||(LK?team:null)}),all:y92Sim(g,{L:y92Add(y.L,y.Q),pre}),y:{...y,pre}};
    const bars=Y92_K.map(([k,ic,lab])=>y92Bar(g,k,ic,lab,V,can)).join('');const fa=Math.min(100,f+V.all.work);
    const fat=`<div class="y92r ro ft"><span class="y92l">😮‍💨 ${_T`Fatigue`}</span><span class="y92m"><i style="width:${f}%;background:${fatCol(f)}"></i><s style="left:${f}%;width:${fa-f}%"></s></span><span class="y92v">${fa>f?`${f} → <b>${fa}</b>`:f}</span><span class="y92note rc-sub">${_T`this week's work`}</span></div>`;
    return `<div class="y92bars y105bars">${bars}${fat}</div>`});
  const pr=pre&&y92Pre(pre.k);
  const line=on?_T`Team drill: ${pr.ic} ${pr.n} (${y92Nm(pr.a)} + ${y92Nm(pr.b)}) on top of his sessions.`:own?_T`His own drill this week: ${pr.ic} ${pr.n} 🔒`:out&&y105Open(w,m)?_T('Sits out the team drill this week.'):_T('No team drill for him this week.');
  const bondOn=P.pairs.some(p=>p.k==='bond'&&(p.a===g.id||p.b===g.id));const busy=MGR.yb76&&MGR.yb76.gid===g.id&&MGR.yb76.k==='bond';
  let panel='';if(busy&&!LK){try{const h=yardCard76(g,w,m);const i=h.indexOf('<div class="yd76p');if(i>=0){const c=cutDiv(h,i);if(c)panel=c[0]}}catch(e){}}
  const foot=`<div class="y105ft"><button type="button" class="yd76b ${bondOn||busy?'on':''}" data-yb76="bond:${g.id}" ${bondOn||left<2||LK?'disabled':''}>${_T`🤝 Bond<small>2 h · loyalty</small>`}</button>
    <button type="button" class="yd76b ${g.ptrain?'on':''}" data-mg="ptrain" data-id="${g.id}" ${LK?'disabled':''}>${_T`⚒ Own doctore<small>${coinAmt87(PTRAIN_COST)}${g.ptrain?' ✓':''}</small>`}</button></div>`;
  const h=`<section class="y105p y105ses" data-y105g="${g.id}">${head}${body}<div class="y105sub y105dl">${line}</div>${foot}${panel}</section>`;
  /* an Immortalis wears 157's gold laurel frame here too */
  try{return typeof imm88Frame==='function'?imm88Frame(h,g):h}catch(e){return h}}
function y105TrialHTML(g,w,m){const P=thPlan(w);const LK=!!P.lk105;const left=thLeft(w);
  if(MGR.yb76&&MGR.yb76.k!=='bond'&&MGR.yb76.gid===g.id&&V105Y.TR.includes(MGR.yb76.k))MGR.tr105=MGR.yb76.k;
  if(!V105Y.TR.includes(MGR.tr105))MGR.tr105='spar';const k=MGR.tr105;
  const lk=y92Lock(g);const bd=boutDone76(g,w);const busy=MGR.yb76&&MGR.yb76.gid===g.id&&MGR.yb76.k===k;
  const opps=w.mgrs.filter(x=>!x.isPlayer&&rosterOf(x).length);
  const D={spar:{n:_T('⚔ Spar'),what:_T('a bout with a housemate · 🏃 +0.25 · 💪 +0.25 each'),cost:_T`⏳ 2 h each · 😮‍💨 +${FAT_SPAR}`,why:left<2?_T('Needs 2 hours'):''},
    exh:{n:_T('🏟 Exhibition'),what:_T`vs a rival · a chance at +1 rating · +1 AP and ${cfAmt87('+2')} this Match Week`,cost:_T`⏳ ${EXHIB_HOURS} h · ${coinAmt87(EXHIB_COST)} · 😮‍💨 +${FAT_EXH}`,why:!opps.length?_T('No rival has fighters'):left<EXHIB_HOURS?_T`Needs ${EXHIB_HOURS} hours`:m.coin<EXHIB_COST?_T('Not enough coin'):''},
    pen:{n:_T('🐾 Beast pen'),what:_T`a real fight · kill it: +${PEN76.bonus} to a rating`,cost:_T`⏳ ${PEN76.hours} h + fee · 😮‍💨 a real fight`,why:left<PEN76.hours?_T`Needs ${PEN76.hours} hours`:''}}; /* i18n:skip */
  const d=D[k];let used='';try{used=typeof trialUsedTxt99==='function'?trialUsedTxt99(k,w):''}catch(e){}
  const why=LK?_T('Locked in for this week'):lk?lk[1]:bd?_T`${y105First(g)} has had his trial this week`:used||d.why;
  let panel='';if(busy&&!LK){try{const h=yardCard76(g,w,m);const i=h.indexOf('<div class="yd76p');if(i>=0){const c=cutDiv(h,i);if(c)panel=c[0]}}catch(e){console.error(e)}}
  let res=[];try{res=yardRes76(g,w).filter(x=>/⚔|🏟|🐾/.test(x))}catch(e){}
  const btn=busy?_T('Close'):bd&&!lk?_T`${y105First(g)} has had his trial this week`:`${d.n} · ${esc(y105First(g))}`;
  return `<section class="y105p y105trial" data-y105t="${k}"><div class="y105cap">${_T('⚔ Trial of the Yard · one a week per fighter')}</div>
    <div class="y105tr"><button type="button" class="y105arr" data-y105="tr|-1" aria-label="${esc(_T('Previous trial'))}" ${LK?'disabled':''}>‹</button>
      <div class="y105tt">${y105TrialArt(k,g)}<div class="y105nm">${d.n}</div><div class="y105sub">${d.what}</div><div class="y105sub y105cost">${d.cost}</div></div>
      <button type="button" class="y105arr" data-y105="tr|1" aria-label="${esc(_T('Next trial'))}" ${LK?'disabled':''}>›</button></div>
    <div class="y105dots2">${V105Y.TR.map(x=>`<i class="${x===k?'on':''}"></i>`).join('')}</div>
    <button type="button" class="btn y105run${busy?'':' primary'}" data-yb76="${k}:${g.id}" ${why&&!busy?`disabled title="${esc(why)}"`:''}>${btn}</button>${why&&!busy?`<div class="y105sub y105why">${why}</div>`:''}
    ${panel}${res.length?`<div class="yd76res">${res.map(x=>`<span>${x}</span>`).join('')}</div>`:''}</section>`}
function y105TabHTML(w,m){const P=thPlan(w);const LK=!!P.lk105;const T=y105Peek(P);const drl=new Set(y105Drillers(w,m).map(g=>g.id));const pr=y92Pre(y105K(w));
  const box=rosterOf(m).map(g=>{const y=y92Peek(P,g.id);const L=y92Sum(y.L),Q=y92Sum(y.Q);const lk=y92Lock(g);const own=y105OwnPre(P,g);const tr=y105TrialOf(g,w);
    const ses=lk?`${lk[0]} ${lk[1]}`:L+Q?_T`Sessions ${L+Q}/${Y92.CAP}`+(Q&&!LK?_T(' · not locked'):''):_T('no sessions');
    const dr=drl.has(g.id)?_T`Drill: ${pr.n}`:own?_T`Drill: ${y92Pre(own.k).n} (own)`:T.out.includes(g.id)&&!lk?_T('Drill: sits out'):_T('Drill: —');
    return `<div class="y105tb${Q&&!LK?' pend':''}"><b>${esc(y105First(g))}</b><span>${ses}</span><span>${dr}</span><span>${tr?_T`Trial: ${tr}`:_T('Trial: —')}</span></div>`}).join('');
  return `<section class="y105p y105tab${LK?' lk':''}"><div class="y105tl"><div class="y105cap">${_T('Tabula · the week\'s plan')}</div><div class="y105tbs">${box}</div></div>
    <div class="y105acts"><button type="button" class="btn y105same" data-y105="same" ${LK?'disabled':''}>${_T('↻ Same as last week')}</button>
      <button type="button" class="y105lock" data-y105="lock" ${LK?'disabled':''}>${LK?_T('🔒 Locked in'):_T('Lock in all')}</button>
      <div class="y105sub">${LK?_T('Nothing changes until next week.'):_T('Locks sessions, the Doctore\'s time, intensity and the drill.')}</div></div></section>`}
function y105HTML(w,m){const ros=rosterOf(m);if(!ros.length)return `<p class="rc-sub">${_T('No fighters in the yard.')}</p>`;
  let g=gById(MGR.tr92);if(!g||!ros.includes(g)){g=ros.find(y105Fit)||ros[0];MGR.tr92=g.id}
  const last=(w.lastPlan||[]).slice(0,6);
  const away=typeof yd90Away==='function'&&yd90Away(w)?`<div class="card2 yd90away">${_T`🛣 Away — no training this week`}</div>`:'';
  return `<div class="y105">${away}${y105DocHTML(w,m)}<div class="y105main">${y105SquadHTML(w,m,g)}${y105SesHTML(g,w,m)}${y105TrialHTML(g,w,m)}</div>${y105TabHTML(w,m)}
    ${last.length||(w.exlog||[]).length?`<details class="yd76log"><summary class="rc-sub">${_T`📜 Last week in the yard`}</summary>${last.map(x=>`<div class="rc-sub">${x}</div>`).join('')}${(w.exlog||[]).slice(0,4).map(x=>`<div class="rc-sub">S${x.s} W${x.wk} · ${x.txt}</div>`).join('')}</details>`:''}</div>`}
/* the old yard body is not built at all: 213's practiceHTML keeps the room head + a slot, filled below */
{const base=yard92HTML;yard92HTML=function(){if(y105Live()&&!MGR.view)return '<div class="y105slot"></div>';return base.apply(this,arguments)}}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{const w=y105Live();if(typeof h!=='string'||!w||MGR.view||MGR.tab!=='practice'||h.indexOf('y105slot')<0)return h;const m=me();if(!m)return h;
  const t=document.createElement('template');t.innerHTML=h;const R=t.content;const slot=R.querySelector('#mgrPane .y105slot');if(!slot)return h;
  y105Clean(thPlan(w));slot.insertAdjacentHTML('afterend',y105HTML(w,m));slot.remove();
  try{if(typeof rm100On==='function'&&rm100On()&&typeof rm100Banner==='function')rm100Banner(R,'practice',null)}catch(e){}
  const hd=R.querySelector('#mgrPane .roomhd');if(hd){for(const x of hd.querySelectorAll('.roomstat,.v104dc'))x.remove();
    hd.insertAdjacentHTML('beforeend',`<div class="y105hrs"><span class="y105cap">${_T('Training hours left')}</span><span><b class="y105big">${thLeft(w)}</b> <span class="y105of">${_T`of ${thMax()} h`}</span></span></div>`)}
  return t.innerHTML}catch(e){console.error(e);return h}}}

/* ---------- the lessons ---------- */
try{if(typeof MTUT_STEPS!=='undefined'){const S=k=>MTUT_STEPS.find(x=>x.k===k);const q=s=>()=>document.querySelector(s);const P0=()=>{try{return thPlan(mtW())}catch(e){return {}}};
  const set=(k,o)=>{const s=S(k);if(!s)return;for(const x of ['spot','spotOnly','say','until','allow','next','enter'])delete s[x];Object.assign(s,o)};
  set('ycard',{spot:q('#mgrPane .y105ses'),spotOnly:1,next:1,say:_T`Pick a fighter in <b>the squad</b>; his <b>own sessions</b> show each rating — 🏃 Speed, 💪 Strength, 📜 Tactics, 🎭 Crowd — and what this week's work adds.`});
  set('yplus',{spot:q('#mgrPane .y105ses .y92bars'),say:()=>_T`Press <b>+</b> on a rating to plan a <b>session</b> for ${mtNm('B')}. Each takes one of the house's training hours; a fighter takes at most <b>${Y92.CAP} a week</b>.`,until:()=>{const y=mtY();return y92Sum(y.Q)+y92Sum(y.L)>=1},allow:['[data-y92s]']});
  set('ylock',{spot:q('#mgrPane .y105time'),say:_T`Give <b>the Doctore</b> time: press <b>+</b>. His hours come from the same training hours — 1 h opens his Lv 1 drills, every 2 more hours one level more; your Yard sets his cap.`,until:()=>(P0().doc||0)>=1,allow:['[data-y105^="doc|"]']});
  set('ydrill',{spot:q('#mgrPane .y105dbot'),say:_T`He runs <b>one team drill</b> for the whole squad — two ratings at once, with his bonus. Pick it with ‹ ›. Every fit fighter does it; tap a fighter's chip to sit him out.`,next:1,allow:['[data-y105^="dr|"]','[data-y105^="out|"]']});
  set('ydlock',{spot:q('#mgrPane [data-y105="lock"]'),say:_T`A plan is only a plan: press <b>🔒 Lock in all</b>. It locks the sessions, his hours, the intensity and the drill — nothing changes until next week.`,until:()=>!!P0().lk105,allow:['[data-y105="lock"]']});
  set('ydoc',{spot:q('#mgrPane .y105doc'),spotOnly:1,next:1,say:_T`<b>Your Doctore.</b> <b>Intensity</b> works only with his hours: more gain, more fatigue for the team drill and every session. <b>↻ Same as last week</b> repeats the whole plan.`});
  set('ytrials',{spot:q('#mgrPane .y105trial'),spotOnly:1,next:1,say:_T`<b>⚔ Trial of the Yard</b>: cycle ‹ › between a spar with a housemate, an exhibition against a rival house and the beast pen — one a week per fighter. Not today: we have a card to fight.`})}}catch(e){console.error(e)}
try{if(typeof FH100_MGR!=='undefined'){const s=FH100_MGR.find(x=>x.k==='g_yard');if(s)s.say=()=>_T`<b>Training Yard.</b> Give the Doctore time for a team drill, press <b>+</b> on a rating for a fighter's own session, then <b>🔒 Lock in all</b> — only a locked plan trains.`}}catch(e){console.error(e)}

/* ---------- the look ---------- */
(()=>{const st=document.createElement('style');st.id='v105ycss';st.textContent=`
.y105{display:flex;flex-direction:column;gap:12px;margin:8px 0;container:y105/inline-size;min-width:0}
.y105p{background:linear-gradient(180deg,#2c1f14,#21170f);border:1px solid #5a4325;border-radius:12px;padding:12px 14px;min-width:0;box-sizing:border-box}
.y105cap{font:700 11px/1.2 var(--mono,monospace);letter-spacing:.12em;text-transform:uppercase;color:#b89c6a}
.y105nm{font:400 22px/1.15 var(--display,serif);color:#ffe2a0;overflow-wrap:anywhere}
.y105sub{font-size:13px;color:#b8a27c}.y105sub b{color:#ffe2a0}
.y105big{font:400 46px/1 var(--display,serif);color:#ffe2a0}
.y105row{display:flex;align-items:center;gap:12px}
.y105hrs{position:relative;z-index:2;margin-left:auto;display:grid;justify-items:end;gap:2px;padding:6px 14px;border:1px solid #c9a46a88;border-radius:10px;background:#140c07d8}
.y105hrs .y105big{font-size:44px}.y105of{font:400 20px var(--display,serif);color:#c9a44a}
.y105doc{border-color:#8a6a2a;display:flex;flex-direction:column;gap:12px}
.y105dtop,.y105dbot{display:flex;flex-wrap:wrap;gap:16px 20px;align-items:stretch}.y105dbot{border-top:1px solid #5a4325;padding-top:12px}
.y105who{display:flex;gap:12px;align-items:center;flex:1 1 240px;min-width:0}
.y105face{flex:none;width:76px;height:76px;border-radius:50%;overflow:hidden;border:3px solid #c9a44a;display:grid;place-items:center;font-size:40px;background:radial-gradient(circle at 40% 35%,#a07850,#4a3018)}.y105face svg{display:block;width:100%;height:100%}
.y105time{flex:1 1 260px;display:flex;flex-direction:column;gap:6px;min-width:0}
.y105dh{min-width:84px;text-align:center;font:400 22px var(--display,serif);color:#c9a44a}
.y105step{width:46px;height:46px;border-radius:50%;font:700 24px/1 sans-serif;color:#2a1a08;background:linear-gradient(180deg,#f0cf7d,#c9a44a);border:1px solid #8a6a2a;cursor:pointer;padding:0}
.y105step:disabled{opacity:.35;cursor:not-allowed}
.y105lads{display:flex;flex-wrap:wrap;gap:5px}.y105lad{font-size:12px;padding:2px 8px;border-radius:999px;border:1px solid #5a4325;color:#c9b088}.y105lad.on{background:#e8c46a;border-color:#e8c46a;color:#2a1a08}.y105lad.off{color:#a8936d;border-style:dashed}
.y105mini{align-self:flex-start;font-size:12.5px;min-height:32px;padding:3px 10px;border-radius:8px;border:1px solid #6b5230;background:#2a1e13;color:#f3e3c0;cursor:pointer}.y105mini:disabled{opacity:.5;cursor:default}.y105mini.on{border-color:#7fae5f}
.y105int{flex:2 1 340px;display:flex;flex-direction:column;gap:6px;min-width:0}
.y105segs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.y105seg{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-height:50px;padding:4px 6px;border-radius:8px;border:1px solid #5a4325;background:#2a1e13;color:#e9d7b0;cursor:pointer;font-size:13.5px;min-width:0}
.y105seg b{font-weight:600;white-space:nowrap}.y105seg small{font-size:11px;color:#b8a27c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.y105seg.on{background:#5a3d16;border-color:#e8c46a;color:#fff1cc}.y105seg:disabled{opacity:.42;cursor:not-allowed}
.y105drill{flex:1 1 420px;display:flex;align-items:center;gap:10px;min-width:0}
.y105arr{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid #8a6a2a;background:#2a1e13;color:#f0cf7d;font:700 22px/1 sans-serif;cursor:pointer;padding:0}.y105arr:disabled{opacity:.35;cursor:not-allowed}
.y105dt{flex:1;display:flex;gap:12px;align-items:center;padding:8px 10px;border-radius:10px;border:2px solid #5a4325;background:#1e150d;min-width:0}.y105dt.on{border-color:#e8c46a}
.y105doc.idle .y105dt,.y105doc.idle .y105segs{opacity:.55}
.y105art{flex:none;display:block;width:120px}.y105art>.rm100fr{height:84px}.y105dtx{min-width:0}
.y105ic{flex:none;width:84px;height:84px;display:grid;place-items:center;font-size:40px;border:1px solid #8a6a2a;border-radius:8px;background:#3a2614}
.y105msg{margin-top:4px;font-weight:700;font-size:14px;color:#e8a46a}.y105msg.ok{color:#9fd88a}
.y105whod{flex:1 1 280px;display:flex;flex-direction:column;gap:8px;min-width:0}
.y105chips{display:flex;flex-wrap:wrap;gap:6px}
.y105chip{font-size:13px;border-radius:999px;padding:5px 12px;min-height:36px;border:1px solid #6b5230;background:#3a2a1a;color:#f3e3c0;cursor:pointer}
.y105chip.out{background:transparent;color:#8d7a5c;text-decoration:line-through}.y105chip:disabled{cursor:not-allowed;opacity:.6}.y105chip.dis{border-style:dashed;opacity:.55}
.y105main{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}
.y105sq{flex:1 1 220px;display:flex;flex-direction:column;gap:4px;padding:10px}
.y105sr{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:8px;align-items:center;width:100%;min-height:44px;padding:0 8px;border-radius:8px;border:1px solid transparent;background:none;color:#f3e3c0;cursor:pointer;text-align:left;font:inherit}
.y105sr b{font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.y105sr.on{border-color:#e8c46a;background:#3a2a1a}.y105sr:hover{border-color:#8a6a2a}
.y105av{width:28px;height:28px;border-radius:50%;overflow:hidden;display:block}.y105av svg{display:block;width:100%;height:100%}.y105dots{font-size:12px;color:#c9a44a;letter-spacing:1px;white-space:nowrap}
.y105ses{flex:2 1 400px;display:flex;flex-direction:column;gap:10px}
.y105sh{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}.y105sn{text-align:right}.y105nb{font:400 28px var(--display,serif);color:#ffe2a0}
.y105bars{gap:6px}.y105bars .y92r{grid-template-columns:96px minmax(40px,1fr) 100px auto}
.y105bars .y92b{min-width:40px;min-height:40px}
.y105dl{color:#d9c49a}.y105ft{display:flex;flex-wrap:wrap;gap:6px}.y105ft .yd76b{min-height:36px;padding:3px 9px;font-size:12.5px}
.y105out{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 10px;border:1px dashed #6b5230;border-radius:8px}
.y105trial{flex:1 1 280px;border-color:#8a6a2a;display:flex;flex-direction:column;gap:10px}
.y105tr{display:flex;align-items:center;gap:8px}.y105tt{flex:1;text-align:center;min-width:0;display:grid;gap:3px;justify-items:center}
.y105tt .y105art{width:100%}.y105tt .y105art>.rm100fr{height:118px}.y105tsv svg{display:block;width:100%;height:110px}.y105cost{color:#e8c46a}
.y105dots2{display:flex;justify-content:center;gap:6px}.y105dots2 i{width:8px;height:8px;border-radius:50%;background:#5a4325}.y105dots2 i.on{background:#e8c46a}
.y105run{min-height:44px;width:100%;font-size:15px}.y105why{text-align:center}
.y105trial .yd76p{background:var(--panel2)}
.y105tab{display:flex;flex-wrap:wrap;gap:14px;align-items:center;border-color:#8a6a2a;background:linear-gradient(180deg,#3a2a18,#2a1c10)}
.y105tl{flex:999 1 520px;min-width:0}.y105tl .y105cap{margin-bottom:8px}
.y105tbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.y105tb{display:grid;gap:1px;background:#1e150d;border:1px solid #5a4325;border-radius:8px;padding:7px 10px;font-size:12.5px;color:#b8a27c;min-width:0}.y105tb b{font-size:14px;color:#ffe2a0}.y105tb.pend{border-color:#d9a441}
.y105tb span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.y105acts{flex:1 1 220px;display:flex;flex-direction:column;gap:8px;align-items:stretch;text-align:center}
.y105same{min-height:44px}
.y105lock{font:400 22px var(--display,serif);color:#2a1a08;background:linear-gradient(180deg,#f6d98c,#cfa54a);border:1px solid #8a6a2a;border-radius:10px;min-height:56px;padding:0 24px;cursor:pointer}
.y105lock:disabled{cursor:default;background:#3a2a1a;color:#e8c46a;border-color:#6b5230}
.y105p button:focus-visible{outline:2px solid #ffe2a0;outline-offset:2px}
@container y105 (max-width:620px){.y105segs{grid-template-columns:repeat(2,minmax(0,1fr))}.y105art{width:84px}.y105art>.rm100fr{height:70px}.y105ic{width:64px;height:64px}
  .y105bars .y92r{grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"l v pm" "m m m";row-gap:2px}.y105bars .y92r .y92l{grid-area:l}.y105bars .y92r .y92v{grid-area:v}.y105bars .y92r .y92m{grid-area:m}.y105bars .y92r .y92pm{grid-area:pm;justify-content:flex-end}
  .y105bars .y92r.ro{grid-template-areas:"l v n" "m m m"}.y105bars .y92r.ro .y92note{grid-area:n;grid-column:auto}
  .y105tbs{grid-template-columns:repeat(2,minmax(0,1fr))}.y105drill{gap:6px}.y105dt{padding:6px;gap:8px}.y105big{font-size:40px}}
@container y105 (max-width:460px){.y105dt .y105art,.y105dt .y105ic{display:none}}
@media (max-width:760px){.roomhd .y105hrs{order:9;flex:1 1 100%;margin-left:0;display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:4px 12px}.y105hrs .y105big{font-size:36px}}
`;document.head.appendChild(st)})();
}

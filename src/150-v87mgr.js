/* =====================================================================
   150-V87MGR · v0.87 — Manager systems (Virgilante's v0.86 notes)
   =====================================================================
   1. THE LANISTA'S HOURS ARE GONE. w.hours becomes a non-enumerable accessor on every world (installed by an MGR.world
      setter: hrs87Install), so it is never saved; every old gate (`w.hours<N`, needHrs) passes (HRS87.big) and every
      `w.hours-=N` is ignored. Recruiting / promote / Match Week actions cost what they cost in coin (pitches, offers, poaching,
      watch / ask around / notes, a private word, raises and promises stay free) and stay limited per fighter per week
      (recGate + the old weekly cool-downs; a wage raise now once a fighter a week). Every action already answers with a result
      line (say / mToast / tnews). Displays removed: the header badge, the banner count, the rail oval, the ✓ on the tab, the
      to-do item, the end-of-week line, the bye-week line + letter, the Promote line, "N h ·" on every recruiting button
      (strip87), the guide line and the lesson's two mentions. Ticket sales still fill as the week goes: boutSales reads a
      clock (HRS87.mode 2 = the old hour cost of the actions taken this week, w.clk87). SAVE_MIGRATIONS '0.87' drops the old
      field and rewrites the old bye letter. Training-yard hours (thPlan / thMax) are untouched.
   2. LANISTA PERKS. The Schooling card becomes a perk tree (perkTree87, on the Lanista tab and in the old panel for the
      lesson): three branches × three ranks (PERK87, cost 1 / 2 / 3 points, rank II needs rank I), each perk one plain effect
      applied by a wrapper — Broker: pitches +3 interest (pitch), recruits sign for 10% less (offerVerdict), gifts and feasts
      +50% (doGiftFighter / doVisit); Showman: +1 fame a win (applyBout), +1 CF in every bout (boostFor), +3 coin each time a
      fighter of yours fights (applyBout); Doctore: +2 training hours (thMax), bout wounds heal a week sooner, bouts tire 25%
      less (applyBout). Each also lifts its trait by 3 (Honor / Showmanship / Discipline). The old "+2 to a trait" stays as a
      row under the tree. Bought perks live in m.perks87. The Your ludus 🎓 tile opens the Lanista tab (except in the lesson);
      the only point count is the tree's.
   3. TRAINING YARD STANDING ORDERS. g.ord87 = {r: routine, p: priority 1-3, short, wk}; ROUT87 routines (drill focus 3 h,
      all-round 4 × 1 h, care = morale talk + gear care, rest). They repeat: an endWeek wrapper applies every order to the new
      week's thPlan, highest priority first, as far as the hours go (short = hours it could not get); hurt fighters get rehab.
      The yard opens on the squad table (yard87HTML, injected by a practiceHTML wrapper): one row per fighter — name, the
      four drill ratings, fatigue, routine + priority, last week's gain (g.gain87 from a weekly ratings snapshot g.st87);
      rows that need you are marked (hurt, worn out >50, a rating band reached, routine short). Tick rows → apply a routine
      to all of them. A row opens that fighter's v0.76 card below (MGR.yd87; "All cards" shows them all).
   4. RECRUITING FIT. recFit replaced: fit87Score = how much the fighter improves YOUR roster (a class you lack, better than
      your weakest, above your average; hurt counts against); ✓ only for the three best affordable free agents (fit87Rank,
      cached), ~ decent, ✗ poor. A thin roster no longer makes everyone ✓. The tooltip says why.
   Test: tv87m.
   ===================================================================== */

/* ---------- 1 · the lanista's hours are gone ---------- */
const HRS87={mode:0,big:99};
/* the old hour cost of each action: only a clock for ticket sales now */
const CLK87={scout:3,trial:3,visit:4,gift2:2,pitch:1,offer:1,poach:2,meal:1,raise:1,promise:1,word:1,feast2:2,criers2:1,scoutarena:2};
const clk87Used=w=>w&&w.clk87&&w.clk87.wk===w.week?w.clk87.n:0;
function hrs87Val(w){if(HRS87.mode===1)return 0;
  if(HRS87.mode===2){let hm=10;try{hm=hoursMax()}catch(e){}return Math.max(0,hm-Math.min(hm,clk87Used(w)))}
  return HRS87.big}
function hrs87Install(w){if(!w||typeof w!=='object')return w;const d=Object.getOwnPropertyDescriptor(w,'hours');if(d&&d.get)return w;
  try{delete w.hours;Object.defineProperty(w,'hours',{configurable:true,enumerable:false,get(){return hrs87Val(this)},set(v){}})}catch(e){}return w}
{let cur=MGR.world;Object.defineProperty(MGR,'world',{configurable:true,enumerable:true,get(){return cur},set(v){cur=hrs87Install(v)}});MGR.world=cur}
function hrs87With(mode,fn,self,args){const p=HRS87.mode;HRS87.mode=mode;try{return fn.apply(self,args)}finally{HRS87.mode=p}}
/* display-only readers see 0 hours (their "hours left" lines vanish) */
{const base=endConfirmHTML;endConfirmHTML=function(){return hrs87With(1,base,this,arguments)}}
{const base=railPend;railPend=function(){return hrs87With(1,base,this,arguments)}}
{const base=ludusTodos;ludusTodos=function(){return hrs87With(1,base,this,arguments)}}
/* ticket sales fill with the week's clock */
{const base=boutSales;boutSales=function(){return hrs87With(2,base,this,arguments)}}
{const base=betRec;betRec=function(slip){try{if(slip&&slip.src==='mgr'&&(slip.dayOff<0||slip.dayOff>24)){const w=W_();let hm=10;try{hm=hoursMax()}catch(e){}slip.dayOff=Math.floor(Math.min(hm,clk87Used(w))/Math.max(1,hm)*24)}}catch(e){}return base.apply(this,arguments)}}
{const base=tabStat73;tabStat73=function(k){if(k==='recruit')return null;return base.apply(this,arguments)}}
{const base=tabDone73;tabDone73=function(k){if(k==='recruit')return false;return base.apply(this,arguments)}}
/* "N h ·" off every recruiting / promote / Match Week button */
function strip87(h){if(typeof h!=='string'||!h)return h;
  return h.replace(/(<small>(?:\s*·)?\s*)\d+\s*h\b\s*(?:·\s*)?/g,'$1').replace(/<small>\s*·?\s*<\/small>/g,'').replace(/\s*\(\d+\s*h\)/g,'')
    .replace(/<p class="prom85">[\s\S]*?<\/p>/g,'')}
const STRIP87_TABS=new Set(['ludus','roster','recruit','night','board','me','exch']);
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(!w||w.dead)return h;
  let mx=10;try{mx=hoursMax()}catch(e){}
  for(const s of [_T`Recruiting hours ${HRS87.big}/${mx}`,_T`Recruiting hours ${HRS87.big}/${mx}`])h=h.replace(new RegExp(`<span class="badge[^"]*"[^>]*>${s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}</span>`),'');
  if(STRIP87_TABS.has(MGR.tab)&&!MGR.view)h=strip87(h)}catch(e){console.error(e)}return h}}
{const base=detailHTML;detailHTML=function(){let h=base.apply(this,arguments);try{h=strip87(h).replace(_T`Recruiting · ${HRS87.big} of the lanista's hours left this week`,_T('Recruiting'))}catch(e){}return h}}
{const base=nextStep;nextStep=function(){return strip87(base.apply(this,arguments))}}
{const base=promoteCardHTML;promoteCardHTML=function(){return strip87(base.apply(this,arguments))}}
{const base=stableCardHTML;stableCardHTML=function(g){let h=strip87(base.apply(this,arguments));try{h=h.replace(_T`Keeping them · ${HRS87.big} of the lanista's hours left this week`,_T('Keeping them'));const w=W_();if(g&&g.raise87===w.week)h=h.replace(/<button class="btn" type="button" data-mg="raise"/,`<button class="btn" type="button" data-mg="raise" disabled title="${_T('One raise a week')}"`)}catch(e){}return h}}
{const base=boardHTML2;boardHTML2=function(){let h=strip87(base.apply(this,arguments));try{h=h.replace(_T`<b>★ Favorites</b> is your chalkboard: the shortlist you are actively working, ranked by how close each is to signing — pin from Recruiting (☆), or let a live-watched bout impress you and they chalk themselves up. Everything you can do from Recruiting works right here. ${HRS87.big} of the lanista's hours left this week. <b>Click</b> any fighter to show their full recruiting card beside the list — scout, gift, pitch, trial bout and offer from right here.`,
  _T('<b>★ Favorites</b> is your chalkboard: the shortlist you are actively working, ranked by how close each is to signing — pin from Recruiting (☆), or let a live-watched bout impress you and they chalk themselves up. <b>Click</b> any fighter to show their full recruiting card beside the list — scout, gift, pitch, trial bout and offer from right here.'))}catch(e){}return h}}
{const base=recPlanHTML;recPlanHTML=function(){return strip87(base.apply(this,arguments))}}
/* the bye week: no extra hours to mention */
{const base=byeHTML;byeHTML=function(){let h=base.apply(this,arguments);try{h=h.replace(/<li>(?:(?!<\/li>)[\s\S])*data-id="recruit"[\s\S]*?<\/li>/,'')}catch(e){}return h}}
{const base=byeSetup;byeSetup=function(){const t0=window.tnews;let swapped=false;
  try{window.tnews=function(text,cls){if(!swapped&&typeof text==='string'&&text.includes('🌿')){swapped=true;text=_T('🌿 <b>Bye week.</b> No bouts anywhere in the league. Vulso’s cart is at your gate and it is market day on your home square.')}return t0.call(this,text,cls)};
    return base.apply(this,arguments)}finally{window.tnews=t0}}}
const BYE87_OLD=()=>[_T`<b>Recruit</b>: you have ${BYE_HOURS} extra lanista's hours — scout, pitch and sign before the others wake up.`,_T`<b>Recruit</b>: you have ${BYE_HOURS} extra lanista's hours — scout, pitch and sign before the others wake up.`];
const bye87Fix=body=>{if(typeof body!=='string')return body;for(const s of BYE87_OLD())body=body.split(s).join(_T('<b>Recruit</b>: scout, pitch and sign before the others wake up.'));return body};
{const base=sendLetter;sendLetter=function(w,o){try{if(o&&o.body)o.body=bye87Fix(o.body)}catch(e){}return base.apply(this,arguments)}}
{const base=guideHTML;guideHTML=function(){let h=base.apply(this,arguments);try{h=h.replace(_T`<b>Work left to right, then End the week.</b> Ludus → Roster → Recruiting → … → Match Week. End the week pays wages and moves the empire; you can't undo it, so spend the lanista's hours first.`,
  _T('<b>Work left to right, then End the week.</b> Ludus → Roster → Recruiting → … → Match Week. End the week pays wages and moves the empire; you can\'t undo it.'))}catch(e){}return h}}
try{if(typeof MTUT_STEPS!=='undefined'){if(MTUT_STEPS[0]&&typeof MTUT_STEPS[0].say==='string')MTUT_STEPS[0].say=_T('Welcome, <b>lanista</b>. This is a sandbox league made for this lesson — nothing is saved. Up top: your <b>treasury</b> (we lent you plenty), <b>fame</b>, ludus grade and record.');
  const st=MTUT_STEPS.find(s=>typeof s.say==='function'&&String(s.say).includes('Keeping them'));if(st)st.say=()=>_T`The card: rating, morale, loyalty, contract. Under <b>Keeping them</b> you spend coin and attention to keep a fighter happy and loyal. Click <b>🍷 Share a meal</b> with ${mtNm('B')}.`}}catch(e){}
/* one wage raise per fighter a week; the clock for ticket sales */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg]');if(!b||b.disabled||!b.closest('#mgrBody'))return;const a=b.dataset.mg;if(!CLK87[a])return;
  const w=typeof W_==='function'&&W_();if(!w||w.dead)return;
  if(a==='raise'){const g=gById(b.dataset.id);if(g&&g.raise87===w.week){e.preventDefault();e.stopImmediatePropagation();mToast(_T`${esc(g.name)} already had a raise this week.`);return}if(g)g.raise87=w.week}
  if(!w.clk87||w.clk87.wk!==w.week)w.clk87={wk:w.week,n:0};w.clk87.n+=CLK87[a]},true);
/* the Recruiting rail oval and the hours colours go */
SAVE_MIGRATIONS.push(['0.87',w=>{try{const d=Object.getOwnPropertyDescriptor(w,'hours');if(d&&!d.get)delete w.hours;for(const L of w.letters||[])if(L&&L.body)L.body=bye87Fix(L.body);for(const L of w.mailLog||[])if(L&&L.body)L.body=bye87Fix(L.body)}catch(e){}}]);

/* ---------- 2 · the lanista's perk tree ---------- */
const PERK87_BR=[['broker','🗣',_T('The Broker'),'honor',_T('Honor')],['show','📣',_T('The Showman'),'show',_T('Showmanship')],['doc','🏋',_T('The Doctore'),'discipline',_T('Discipline')]];
const PERK87=[
  {id:'br1',br:'broker',t:1,c:1,ic:'🗣',lab:_T('Silver tongue'),txt:_T('Every pitch wins +3 more interest')},
  {id:'br2',br:'broker',t:2,c:2,ic:'🤝',lab:_T('Hard bargain'),txt:_T('Recruits sign for 10% less than their ask')},
  {id:'br3',br:'broker',t:3,c:3,ic:'🍷',lab:_T('Open table'),txt:_T('Gifts and feasts win 50% more interest')},
  {id:'sh1',br:'show',t:1,c:1,ic:'📣',lab:_T('Crowd pleaser'),txt:_T('+1 fame for every bout your fighters win')},
  {id:'sh2',br:'show',t:2,c:2,ic:'🌾',lab:_T('Grand entrance'),txt:_T('Your fighters start every bout with +1 CF')},
  {id:'sh3',br:'show',t:3,c:3,ic:'🏟',lab:_T('Packed stands'),txt:_T('+3 coin each time one of your fighters fights a bout')},
  {id:'dc1',br:'doc',t:1,c:1,ic:'⏳',lab:_T('Drillmaster'),txt:_T('+2 training hours a week')},
  {id:'dc2',br:'doc',t:2,c:2,ic:'🩹',lab:_T('Camp medicus'),txt:_T('Wounds from bouts heal a week sooner')},
  {id:'dc3',br:'doc',t:3,c:3,ic:'🫁',lab:_T('Iron lungs'),txt:_T('Bouts tire your fighters 25% less')}];
const PERK87_TRAIT=3;
const pk87=id=>{try{const m=me();return !!(m&&m.perks87&&m.perks87[id])}catch(e){return false}};
const mineP87=g=>{try{const mm=g&&g.contract&&mgrById(g.contract.mgr);return !!(mm&&mm.isPlayer)}catch(e){return false}};
function perk87State(k,m){const own=m.perks87||{};if(own[k.id])return 'own';const prev=PERK87.find(x=>x.br===k.br&&x.t===k.t-1);if(prev&&!own[prev.id])return 'locked';return (m.perkPts||0)>=k.c?'open':'poor'}
function perkTree87(){const m=me(),w=W_();const P=m.perkPts||0;
  const node=k=>{const st=perk87State(k,m);const tip=st==='own'?_T('Yours'):st==='locked'?_T('Take the rank before it first'):st==='poor'?_T`Needs ${k.c} point${k.c===1?'':'s'}`:_T`Take it for ${k.c} point${k.c===1?'':'s'}`;
    return `<button type="button" class="pk87 pk87-${st}" data-pk87="${k.id}" ${st==='open'?'':'disabled'} title="${esc(tip)}"><span class="pk87i">${k.ic}</span><span class="pk87t"><b>${esc(k.lab)}</b><span>${esc(k.txt)}</span></span><span class="pk87c">${st==='own'?'✓':k.c}</span></button>`};
  const cols=PERK87_BR.map(([br,ic,lab,tr,trl])=>`<div class="pk87b"><div class="pk87h"><b>${ic} ${lab}</b><span class="rc-sub">${_T`each rank also +${PERK87_TRAIT} ${trl}`}</span></div>${PERK87.filter(k=>k.br===br).map(node).join('<i class="pk87l"></i>')}</div>`).join('');
  const hone=MGR_KEYS.map(([k,l,d])=>`<button class="btn tksm" type="button" data-mg="perk" data-id="${k}" ${P<1||m.p[k]>=95?'disabled':''} title="${esc(d)}">${l} ${m.p[k]}${m.p[k]<95?' → '+Math.min(95,m.p[k]+2):''}</button>`).join('');
  return `<div class="card2 pk87card${P?' haspts':''}" id="schoolCard"><div class="pk87top"><div class="sect" style="margin:0">${_T`🎓 Lanista perks`}</div><span class="pk87pts${P?' on':''}" title="${_T`Perk points to spend`}">${_T`${P} point${P===1?'':'s'}`}</span></div>
    <p class="rc-sub" style="margin:2px 0 8px">${_T`Points come each week: +1 for the week, +1 per bout won, +1 per kept pledge, +1 when training lifts two or more. This week so far: <b>${m.perkPend||0}</b> (ready next week).`}</p>
    <div class="pk87tree">${cols}</div>
    <div class="pk87hone"><span class="rc-sub">${_T`Or hone a trait recruits grade you on (1 point · +2):`}</span><div class="acts">${hone}</div></div></div>`}
{const base=schoolingCardHTML;schoolingCardHTML=function(){try{return perkTree87()}catch(e){console.error(e);return base.apply(this,arguments)}}}
{const base=meHTML;meHTML=function(){const h=base.apply(this,arguments);try{if(!W_()||W_().dead)return h;return perkTree87()+h}catch(e){console.error(e);return h}}}
/* the Your ludus tile leads to the Lanista tab (the lesson keeps its panel) */
{const base=runDashHTML;runDashHTML=function(){const w=W_();if(w&&!w.tutorial&&MGR.run==='school')MGR.run='promote';let h=base.apply(this,arguments);
  try{if(!w.tutorial)h=h.replace(/(<button type="button" class="rtile2[^"]*"[^>]*data-id="school"[^>]*>[\s\S]*?<span class="rtl"><b>[^<]*<\/b>)<span><span class="ptbox[^"]*">\d+<\/span><\/span>/,`$1<span>${_T('on the Lanista tab')} →</span>`)}catch(e){}return h}}
function perk87Go(){MGR.tab='me';MGR.view=null;if(typeof MGR_REDRAW==='function')MGR_REDRAW();setTimeout(()=>{const el=document.getElementById('schoolCard');if(el){try{el.scrollIntoView({behavior:'smooth',block:'start'})}catch(e){}el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600)}},60)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-mg="toschool"],[data-mg="run"][data-id="school"]');if(!b)return;const w=typeof W_==='function'&&W_();if(!w||w.tutorial)return;
  e.preventDefault();e.stopImmediatePropagation();perk87Go()},true);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pk87]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.disabled)return;
  const w=W_(),m=me();if(!w||!m)return;const k=PERK87.find(x=>x.id===b.dataset.pk87);if(!k||perk87State(k,m)!=='open')return;
  m.perkPts=(m.perkPts||0)-k.c;(m.perks87=m.perks87||{})[k.id]=w.week;const tr=(PERK87_BR.find(x=>x[0]===k.br)||[])[3];if(tr)m.p[tr]=clamp((m.p[tr]||50)+PERK87_TRAIT,1,95);
  if(typeof tnews==='function')tnews(_T`🎓 Perk taken: <b>${esc(k.lab)}</b> — ${esc(k.txt)}.`);saveWorld();MGR.msg=_T`🎓 <b>${esc(k.lab)}</b>: ${esc(k.txt)}.`;mToast(MGR.msg);if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* the perks at work */
{const base=pitch;pitch=function(g){const d=base.apply(this,arguments);try{if(!pk87('br1'))return d;const m=me();const b=interestOf(g,m);g.interest[m.id]=capInterest(g,m,b+3);return d+(g.interest[m.id]-b)}catch(e){return d}}}
{const base=offerVerdict;offerVerdict=function(g,wage){try{if(g&&!g.contract&&pk87('br2')){const a=[...arguments];a[1]=wage/0.9;return base.apply(this,a)}}catch(e){}return base.apply(this,arguments)}}
const br3P87=(g,d)=>{try{if(d==null||d<=0||!pk87('br3'))return d;const m=me();const b=interestOf(g,m);g.interest[m.id]=capInterest(g,m,b+Math.round(d*0.5));return d+(g.interest[m.id]-b)}catch(e){return d}};
{const base=doGiftFighter;doGiftFighter=function(g){return br3P87(g,base.apply(this,arguments))}}
{const base=doVisit;doVisit=function(g){return br3P87(g,base.apply(this,arguments))}}
{const base=boostFor;boostFor=function(g){const b=base.apply(this,arguments);try{if(b&&pk87('sh2')&&mineP87(g))b.cf=(b.cf||0)+1}catch(e){}return b}}
{const base=thMax;thMax=function(){const n=base.apply(this,arguments);try{if(pk87('dc1'))return n+2}catch(e){}return n}}
{const base=applyBout;applyBout=function(){let pm=null,snap=null,wins=0,bouts=0;
  try{const w=W_();pm=w&&!w.tutorial?me():null;if(pm){wins=pm.wins||0;bouts=pm.bouts||0;snap={};for(const g of rosterOf(pm))snap[g.id]={inj:g.inj,fat:g.fat||0}}}catch(e){pm=null}
  const r=base.apply(this,arguments);
  try{if(pm&&snap){const w=W_();
    const dw=(pm.wins||0)-wins;if(dw>0&&pk87('sh1'))pm.fame=clamp((pm.fame||0)+dw,0,100);
    const db=(pm.bouts||0)-bouts;if(db>0&&pk87('sh3'))pm.coin+=3*db;
    for(const [id,s] of Object.entries(snap)){const g=gById(id);if(!g)continue;
      if(pk87('dc2')&&g.inj&&g.inj!==s.inj&&!g.inj.war&&(g.inj.until||0)>w.week+1)g.inj.until-=1;
      if(pk87('dc3')&&(g.fat||0)>s.fat)g.fat=Math.round(s.fat+((g.fat||0)-s.fat)*0.75)}}}catch(e){console.error(e)}
  return r}}

/* ---------- 3 · Training Yard standing orders + the squad table ---------- */
const ROUT87=[['off','—',_T('No routine'),0],['spd','🏃',_T('Speed focus'),3],['str','💪',_T('Strength focus'),3],['int','📜',_T('Tactics focus'),3],['cha','🎭',_T('Crowd focus'),3],['bal','⚖','All-round',4],['care','🗣',_T('Care'),2],['rest','🛏',_T('Rest'),0]];
const ROUT87_SUB={off:_T('set the week by hand'),spd:_T('3 h Speed drill'),str:_T('3 h Strength drill'),int:_T('3 h Tactics'),cha:_T('3 h Crowd work'),bal:_T('1 h of each drill'),care:_T('morale talk + gear care'),rest:_T('a rest week')};
const PRIO87=[[1,_T('▲ First')],[2,_T('Normal')],[3,_T('▼ Last')]];
const rout87=k=>ROUT87.find(x=>x[0]===k)||ROUT87[0];
/* puts one fighter's routine into this week's plan, as far as the hours go */
function ord87Apply(w,g){const o=g.ord87;if(!o||!o.r||o.r==='off'||g.alive===false)return;const P=thPlan(w),X=x74(w);o.short=0;o.wk=w.week;
  const room=()=>Math.max(0,Math.min(thLeft(w),TH_FIGHTER-thOfG(P,g.id)));
  if(g.inj){if(g.inj.war)return;const have=(P.g[g.id]||{}).rehab||0;const want=Math.max(0,2-have);const can=Math.min(want,room());if(can>0){P.g[g.id]=P.g[g.id]||{};P.g[g.id].rehab=have+can}o.short=want-can;return}
  if(o.r==='rest'){if(g.restWk!==w.week){g.restWk=w.week;delete P.g[g.id];P.pairs=P.pairs.filter(p=>p.a!==g.id&&p.b!==g.id)}return}
  if(g.restWk===w.week)return;
  if(o.r==='care'){if(!X.morale.includes(g.id)){if(thLeft(w)>=1){X.morale.push(g.id);g.morale=clamp((g.morale||50)+5,0,100)}else o.short++}
    if(!X.gear.includes(g.id)){if(thLeft(w)>=1){X.gear.push(g.id);g.gear74=w.season+':'+w.week}else o.short++}return}
  const plan=o.r==='bal'?{spd:1,str:1,int:1,cha:1}:{[o.r]:3};P.g[g.id]=P.g[g.id]||{};
  for(const [k,n] of Object.entries(plan)){const have=P.g[g.id][k]||0;const want=Math.max(0,n-have);const can=Math.min(want,room());if(can>0)P.g[g.id][k]=have+can;o.short+=want-can}}
function ord87RunAll(w){const m=me();if(!w||!m||w.dead||w.tutorial)return 0;const ros=rosterOf(m).filter(g=>g.ord87&&g.ord87.r&&g.ord87.r!=='off');
  ros.sort((a,b)=>(a.ord87.p||2)-(b.ord87.p||2));for(const g of ros)ord87Apply(w,g);return ros.length}
function ord87Set(g,r){const w=W_();const prev=g.ord87&&g.ord87.r;g.ord87={p:2,...(g.ord87||{}),r,short:0,wk:w.week};const P=thPlan(w);
  if(prev==='rest'&&r!=='rest'&&g.restWk===w.week)g.restWk=null;
  if(r!=='off'&&r!=='rest'&&r!=='care'&&!g.inj&&P.g[g.id]){for(const k of ['spd','str','int','cha'])delete P.g[g.id][k]}
  if(!(typeof roadLocked76==='function'&&roadLocked76(w)))ord87Apply(w,g)}
/* weekly ratings snapshot → last week's gain; the orders go into the new week */
const st87Snap=g=>{const st=gStats(g)||{};return {spd:st.spd,str:st.str,int:st.int,lck:st.lck,cha:st.cha,ovr:g.ovr}};
{const base=endWeek;endWeek=async function(){const w=W_();const wk=w&&w.week;let m=null;try{m=w&&!w.dead?me():null;if(m)for(const g of rosterOf(m))if(!g.st87||g.st87.wk!==wk)g.st87=g.st87&&g.st87.s?{wk,s:g.st87.s}:{wk,s:st87Snap(g)}}catch(e){}
  const r=await base.apply(this,arguments);
  try{const w2=W_();if(w2&&m&&w2.week!==wk&&!w2.dead){for(const g of rosterOf(m)){const s0=g.st87&&g.st87.s;const now=st87Snap(g);const d={},band=[];
      if(s0)for(const k of Object.keys(now)){const dv=(now[k]||0)-(s0[k]||0);if(dv)d[k]=dv;if(dv>0&&k!=='ovr'&&typeof bandsOf==='function'&&bandsOf(k).some(t=>s0[k]<t&&now[k]>=t))band.push(k)}
      g.gain87={wk:w2.week,d,band};g.st87={wk:w2.week,s:now}}
    const n=ord87RunAll(w2);if(n&&typeof tnews==='function')tnews(_T`📋 Standing orders: ${n} fighter${n===1?'':'s'} set for the week in the Training Yard.`);saveWorld()}}catch(e){console.error(e)}
  return r}}
const STAT87=[['spd','🏃',_T('Spd')],['str','💪',_T('Str')],['int','🧠',_T('Int')],['cha','🎭',_T('Cha')]];
function yard87Need(g,w){const o=g.ord87||{};const f=gFat(g);const N=[];const G=g.gain87&&g.gain87.wk===w.week?g.gain87:null;
  if(g.inj)N.push(['⚕',g.inj.war?_T('Away at war'):_T`Hurt — ${g.inj.label||'wounded'}`]);
  if(!g.inj&&f>50&&g.restWk!==w.week)N.push(['😮‍💨',_T`Worn out (fatigue ${f}) — give a rest`]);
  if(G&&G.band&&G.band.length)N.push(['⭐',_T`New band: ${G.band.map(k=>(STATS.find(s=>s[0]===k)||[k,k])[1]).join(', ')}`]);
  if(o.r&&o.r!=='off'&&o.wk===w.week&&o.short>0)N.push(['⏳',_T`Routine short of ${o.short} h this week`]);
  return N}
function yard87Gain(g,w){const G=g.gain87&&g.gain87.wk===w.week?g.gain87:null;if(!G)return '<span class="rc-sub">—</span>';
  const parts=Object.entries(G.d).filter(([,v])=>v).map(([k,v])=>{const s=STATS.find(x=>x[0]===k);return `<span class="${v>0?'up':'dn'}">${v>0?'+':''}${v} ${k==='ovr'?'rating':s?s[1]:k}</span>`});
  return parts.length?parts.join(' '):_T('<span class="rc-sub">no change</span>')}
function yard87Row(g,w){const st=gStats(g)||{};const f=gFat(g);const o=g.ord87||{r:'off',p:2};const N=yard87Need(g,w);const sel=MGR.yk87&&MGR.yk87.includes(g.id);const open=MGR.yd87===g.id;
  const rt=rout87(o.r||'off');
  return `<div class="yo87r${N.length?' need':''}${open?' open':''}" data-yo87row="${g.id}" title="${esc(N.map(x=>x[1]).join(' · ')||_T('Click for the full card'))}">
    <label class="yo87ck" title="${_T`Select`}"><input type="checkbox" data-yk87="${g.id}" ${sel?'checked':''}></label>
    <span class="yo87nm">${gArt(g,'xs')}<b>${esc(g.name)}</b>${N.length?`<span class="yo87fl">${N.map(x=>`<i title="${esc(x[1])}">${x[0]}</i>`).join('')}</span>`:''}</span>
    <span class="yo87st">${STAT87.map(([k,ic,l])=>`<span title="${esc((STATS.find(s=>s[0]===k)||[k,l])[1])}">${ic}<b>${st[k]??'—'}</b></span>`).join('')}</span>
    <span class="yo87ft" title="${_T`Fatigue ${f}`}"><i style="width:${f}%;background:${fatCol(f)}"></i><b>${f}</b></span>
    <span class="yo87rt"><select class="tin yo87sel" data-yr87="${g.id}" title="${esc(ROUT87_SUB[rt[0]])}">${ROUT87.map(([k,ic,l])=>`<option value="${k}" ${k===rt[0]?'selected':''}>${ic} ${l}</option>`).join('')}</select><select class="tin yo87pr" data-yp87="${g.id}" title="${_T`Priority when the hours run short`}">${PRIO87.map(([v,l])=>`<option value="${v}" ${(o.p||2)===v?'selected':''}>${l}</option>`).join('')}</select></span>
    <span class="yo87gn">${yard87Gain(g,w)}</span></div>`}
function yard87HTML(){const w=W_(),m=me();const ros=rosterOf(m);if(!ros.length)return '';const n=(MGR.yk87||[]).filter(id=>ros.some(g=>g.id===id)).length;
  const need=ros.filter(g=>yard87Need(g,w).length).length;
  return `<div class="card2 yo87"><div class="yo87hd"><div class="sect" style="margin:0">${_T`📋 The squad · standing orders`}</div><span class="rc-sub">${_T`${need?_T`${need} need${need===1?'s':''} you`:_T('all in order')} · routines repeat every week until changed`}</span></div>
    <div class="yo87th">${_T`<span></span><span>Fighter</span><span>Ratings</span><span>Fatigue</span><span>Routine · priority</span><span>Last week</span>`}</div>
    ${ros.map(g=>yard87Row(g,w)).join('')}
    <div class="yo87bulk"><button type="button" class="btn tksm" data-yall87>${n===ros.length?_T('Clear'):_T('Select all')}</button><span class="rc-sub">${_T`${n} selected`}</span>
      <select class="tin" id="yo87bulkR">${ROUT87.map(([k,ic,l])=>`<option value="${k}">${ic} ${l}</option>`).join('')}</select>
      <button type="button" class="btn tksm primary" data-ya87 ${n?'':'disabled'}>${_T`Apply to selected`}</button>
      <button type="button" class="btn tksm" data-ycard87="${MGR.yd87==='all'?'':'all'}">${MGR.yd87==='all'?_T('Hide the cards'):_T('All cards')}</button></div></div>`}
{const base=practiceHTML;practiceHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(!w||w.dead||MGR.view)return h;const m=me();const ros=rosterOf(m);
  for(const g of ros)if(!g.st87)g.st87={wk:w.week,s:st87Snap(g)};
  const i=h.indexOf('<div class="yd76grid">');if(i<0||!ros.length)return h;const c=cutDiv(h,i);if(!c)return h;
  const pick=MGR.yd87==='all'?ros:ros.filter(g=>g.id===MGR.yd87);
  const grid=pick.length?`<div class="yd76grid${pick.length===1?' yo87one':''}">${pick.length===1?`<button type="button" class="btn tksm yo87back" data-ycard87="">${_T`← Back to the squad`}</button>`:''}${pick.map(g=>yardCard76(g,w,m)).join('')}</div>`:'';
  return h.slice(0,i)+yard87HTML()+grid+c[1].slice(i)}catch(e){console.error(e);return h}}}
const yard87Redraw=()=>{if(typeof MGR_REDRAW==='function')MGR_REDRAW()};
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#mgrBody'))return;const w=typeof W_==='function'&&W_();if(!w)return;
  if(t.matches('[data-yr87]')){const g=gById(t.dataset.yr87);if(!g)return;ord87Set(g,t.value);saveWorld();const R=rout87(t.value);
    mToast(t.value==='off'?_T`${esc(g.name)}: no standing routine — set the week by hand.`:_T`📋 ${esc(g.name)}: ${R[1]} ${R[2]} every week (${ROUT87_SUB[R[0]]})${g.ord87.short?_T` — ${g.ord87.short} h short this week`:''}.`);yard87Redraw()}
  else if(t.matches('[data-yp87]')){const g=gById(t.dataset.yp87);if(!g)return;g.ord87={r:'off',...(g.ord87||{}),p:+t.value||2};saveWorld();yard87Redraw()}
  else if(t.matches('[data-yk87]')){const id=t.dataset.yk87;MGR.yk87=(MGR.yk87||[]).filter(x=>x!==id);if(t.checked)MGR.yk87.push(id);yard87Redraw()}},true);
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||!t.closest('#mgrBody'))return;
  const ya=t.closest('[data-ya87]');if(ya){e.preventDefault();if(ya.disabled)return;const r=(document.getElementById('yo87bulkR')||{}).value||'off';const ids=(MGR.yk87||[]);let n=0;
    for(const id of ids){const g=gById(id);if(g&&g.alive!==false){ord87Set(g,r);n++}}saveWorld();const R=rout87(r);mToast(_T`📋 ${R[1]} ${R[2]} for ${n} fighter${n===1?'':'s'}.`);MGR.yk87=[];yard87Redraw();return}
  if(t.closest('[data-yall87]')){e.preventDefault();const ros=rosterOf(me());MGR.yk87=(MGR.yk87||[]).length===ros.length?[]:ros.map(g=>g.id);yard87Redraw();return}
  const yc=t.closest('[data-ycard87]');if(yc){e.preventDefault();MGR.yd87=yc.dataset.ycard87||null;yard87Redraw();return}
  const row=t.closest('[data-yo87row]');if(row&&!t.closest('select,input,label,button')){MGR.yd87=MGR.yd87===row.dataset.yo87row?null:row.dataset.yo87row;yard87Redraw();
    setTimeout(()=>{const c=document.querySelector('.yo87one .yd76c');if(c)try{c.scrollIntoView({behavior:'smooth',block:'nearest'})}catch(err){}},60)}});

/* ---------- 4 · recruiting Fit: ✓ only for the best few ---------- */
let FIT87={key:''};
const FIT87_TOP=3,FIT87_OK=8,FIT87_SO=3;
function fit87Score(g,m){const ros=rosterOf(m).filter(x=>x.alive!==false);const v=estOvr(g).v;const ovs=ros.map(effOvr);
  const weak=ovs.length?Math.min(...ovs):0,avg=ovs.length?Math.round(ovs.reduce((a,b)=>a+b,0)/ovs.length):0;let s=0;const why=[];
  if(!ros.some(x=>x.cls===g.cls)){const c=ros.length?Math.round(10-Math.max(0,weak-3-v)*0.6):10;if(c>=2){s+=c;why.push(_T('a class you lack'))}}
  if(ros.length&&v>weak+2){s+=Math.min(14,Math.round((v-weak)*0.8));why.push(_T`better than your weakest (${weak})`)}
  if(!ros.length){s+=Math.min(12,Math.max(0,Math.round((v-50)*0.6)))}
  else if(v>avg+1){s+=Math.min(12,Math.round((v-avg)*0.7));why.push(_T`lifts your average (${avg})`)}
  if(ros.length<3)s+=2;
  if(g.inj){s-=8;why.push(_T('hurt right now'))}
  return {s,why}}
function fit87Rank(m){const w=W_();const ros=rosterOf(m);const key=[w.season,w.week,m.coin,ros.map(x=>x.id+':'+effOvr(x)+x.cls).join(','),w.glads.length,w.glads.filter(g=>g.scout).length].join('|');
  if(FIT87.key===key)return FIT87;const pool=freeAgents().filter(g=>recAfford(g,m));
  const top=pool.map(g=>({g,s:fit87Score(g,m).s})).filter(x=>x.s>=FIT87_OK).sort((a,b)=>b.s-a.s).slice(0,FIT87_TOP);
  FIT87={key,top:new Set(top.map(x=>x.g.id))};return FIT87}
{const base=recFit;recFit=function(g,m){if(!g||!m||typeof g!=='object')return null;try{const F=fit87Rank(m);const sc=fit87Score(g,m);const aff=recAfford(g,m);
  const best=!g.contract&&aff&&F.top.has(g.id);const mark=best?'✓':sc.s>=FIT87_SO?'~':'✗';
  const why=(best?_T('One of the best few for your roster'):mark==='~'?_T('Would help a little'):_T('Does little for your roster'))+(sc.why.length?': '+sc.why.join(', '):'')+` · ${aff?'affordable':_T`ask ${askWage(g)}/wk is steep for your treasury`}`;
  return {mark,gap:mark==='✗'?'':(sc.why[0]||_T('a useful pair of hands')),aff,why,score:sc.s}}catch(e){console.error(e);return base.apply(this,arguments)}}}
{const base=recruitHTML;recruitHTML=function(){let h=base.apply(this,arguments);try{h=h.replace(/title="✓ fills a roster gap and is affordable · ~ one of the two · ✗ neither"/,`title="${esc(_T('✓ one of the best few for your roster and affordable · ~ would help a little · ✗ does little for your roster'))}"`)}catch(e){}return h}}

/* ---------- styles ---------- */
(()=>{const st=document.createElement('style');st.textContent=`
.mtabs [data-id="recruit"] .mcount.c73{display:none!important}
.mtabs [data-id="recruit"].recpend{border-color:var(--line2)!important;box-shadow:none!important}
.pk87card .pk87top{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.pk87pts{padding:2px 10px;border:1px solid var(--line2);border-radius:999px;font-size:12.5px;color:var(--muted)}
.pk87pts.on{border-color:var(--gold);color:var(--gold2);background:rgba(214,171,76,.12)}
.pk87tree{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.pk87b{display:flex;flex-direction:column;align-items:stretch;gap:0;padding:8px;border:1px solid var(--line2);border-radius:9px;background:rgba(0,0,0,.18)}
.pk87h{display:flex;flex-direction:column;gap:1px;margin-bottom:6px;font-size:14px}.pk87h .rc-sub{font-size:11px}
.pk87l{display:block;width:2px;height:10px;margin:0 auto;background:var(--line2)}
.pk87{display:grid;grid-template-columns:26px 1fr auto;gap:6px;align-items:center;text-align:left;padding:6px 8px;border:1px solid var(--line2);border-radius:8px;background:var(--panel2);color:var(--bone);cursor:pointer;font-size:13px}
.pk87 .pk87i{font-size:18px;text-align:center}.pk87 .pk87t{display:flex;flex-direction:column;min-width:0}.pk87 .pk87t span{font-size:11.5px;color:var(--muted);line-height:1.25}
.pk87 .pk87c{min-width:22px;height:22px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line2);font-size:12px;color:var(--muted)}
.pk87-open{border-color:var(--gold)}.pk87-open:hover{background:#3a2a18}.pk87-open .pk87c{border-color:var(--gold);color:var(--gold2)}
.pk87-own{border-color:#7fae5f;background:rgba(127,174,95,.12);cursor:default}.pk87-own .pk87c{border-color:#7fae5f;color:#b7d59d}.pk87-own .pk87t span{color:var(--bone)}
.pk87-locked,.pk87-poor{opacity:.55;cursor:default}
.pk87hone{margin-top:8px}.pk87hone .acts{margin-top:4px}
@media (max-width:760px){.pk87tree{grid-template-columns:1fr}}
.yo87{margin:10px 0}.yo87hd{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:6px}
.yo87th,.yo87r{display:grid;grid-template-columns:22px minmax(150px,1.6fr) auto 76px minmax(200px,1.3fr) minmax(100px,1fr);gap:8px;align-items:center}
.yo87th{font:600 10.5px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:0 6px 3px}
.yo87r{padding:4px 6px;border:1px solid var(--line2);border-radius:8px;margin:3px 0;cursor:pointer;background:rgba(0,0,0,.12)}
.yo87r:hover{border-color:var(--gold)}.yo87r.open{border-color:var(--gold);background:#2e2215}
.yo87r.need{border-color:#d9a441;box-shadow:inset 3px 0 0 #d9a441}
.yo87nm{display:flex;align-items:center;gap:6px;min-width:0}.yo87nm b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.yo87fl{display:inline-flex;gap:2px;font-style:normal}.yo87fl i{font-style:normal}
.yo87st{display:flex;gap:8px;font-size:12px;color:var(--muted)}.yo87st b{color:var(--bone);font-weight:600;margin-left:1px}
.yo87ft{position:relative;display:block;height:14px;border-radius:7px;background:var(--line2);overflow:hidden}.yo87ft i{display:block;height:100%}
.yo87ft b{position:absolute;inset:0;font-size:10.5px;line-height:14px;text-align:center;color:#fff;text-shadow:0 1px 2px #000}
.yo87rt{display:flex;gap:4px;min-width:0}.yo87rt select{min-width:0;padding:2px 4px;font-size:12.5px}.yo87sel{flex:1 1 auto}.yo87pr{flex:0 0 auto;width:auto}
.yo87gn{font-size:12px}.yo87gn .up{color:#9fd07f}.yo87gn .dn{color:#e08a7a}
.yo87ck{display:flex;justify-content:center}.yo87ck input{margin:0}
.yo87bulk{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px}.yo87bulk select{width:auto}
.yo87one{grid-template-columns:1fr!important}.yo87back{justify-self:start}
@media (max-width:760px){.yo87th{display:none}
  .yo87r{grid-template-columns:22px minmax(0,1fr) 64px;grid-template-areas:"ck nm ft" "ck st st" "ck rt rt" "ck gn gn";row-gap:4px}
  .yo87ck{grid-area:ck}.yo87nm{grid-area:nm}.yo87ft{grid-area:ft}.yo87st{grid-area:st;flex-wrap:wrap}.yo87rt{grid-area:rt}.yo87gn{grid-area:gn}}
`;document.head.appendChild(st)})();

/* =====================================================================
   351-v104ward — v1.04 builder D · RECRUITING, THE INFIRMARY'S TWO WINGS, THE MEDICUS QUEUE, BUILDINGS THAT TAKE WEEKS
   (his notes: tools/plans/v103/NOTES.md N4a N7a N9a N10a; tools/plans/v104/NOTES.md R1 answers 1a 2a 3a 4; plan tools/plans/v104/PLAN.md "D")
   Manager only, offline. The lesson's sandbox league (w.tutorial) keeps the old rules (instant builds, offers, no board cap).
   1. RECRUITING (N4a) — REPLACES 319's Recruiter's-hours bands (24/16/10/6 h) and 333's "the trial after one cheaper look":
      • fewer hours: W104.rec.bands (≤3 fighters 16 h · 4–6 12 · 7–9 9 · 10+ 6) + W104.rec.perLv a Recruiter level (rec98HrsMax wrapper;
        rec101Why's tooltip text follows).
      • rising cost: every action already taken on one recruit this week adds W104.rec.step h to the next (rec98Can / rec98Act / rec98Btn /
        299's rc100ActCard read the bumped REC98.acts[a].h while they run — rec104Bump).
      • the trial bout needs W104.rec.trialPrev (2) earlier actions on him, taken in an EARLIER week (g.sc98.l104 = the weeks of every action).
      • the board holds W104.rec.board (6) + the Recruiter's level: pinning, scouting, courting or offering to someone not on a full board is
        refused with the reason; a board that is already over (old careers) keeps its names, newcomers wait (w.bd104 = the pin order).
      • OFFERS ARE ANSWERED NEXT WEEK: ✍ Offer (data-mg="offer" on a free agent) puts the terms on the table (w.of104[gid]); when the week
        ends he answers — he may sign, turn it down, be SCARED OFF by a lowball (under W104.of.low × his ask: interest −12, no talks for
        2 weeks), or sign with a rival who leans his way. The answer comes as a letter from your recruiter. Withdraw = data-of104x.
      • RIVALS too (cpuLeagueWeek wrapper): a rival's signing of a free agent becomes an offer (w.ro104), answered next week; your own
        better offer on the same fighter is heard first.
   2. THE INFIRMARY — TWO WINGS (R1, his 1a 2a 3a 4) — REPLACES 318's infirmary layout (banner stats, list, patient + statue, the road-back
      tabula, one sideways row of plates), 318's "🛁 Recovery" block in the Training Yard (the yard keeps only training) and 105's separate
      bathhouse block: BANNER = the Medicus's face + ONE week hours bar split wound care / recovery (+ hire / let go, ⓘ Which cure?);
      LEFT the list in two groups 🩸 Wounded (a wound or a lost limb — what the rail counts) / 💤 Weary (healthy, Tired or Worn), Fit and
      fresh folded; rows: HP + fatigue mini-bars, Treated ✓ / Rested ✓; CENTRE the marble statue (298's rm100Statue) + a fatigue gauge
      Fresh/Tired/Worn with next week's band when recovery is booked; RIGHT plate tabs ⚕ Ward (bed, Medicus or surgeon, Hygeia, Asclepius,
      the Valetudinarium) | ♨ Baths (bathhouse, rub-down 1 h, Care routine 1 h a week, Rest week 0 h on the bench), opening on the tab that
      fits the fighter; every plate = hours + coin + effect ("−20 fatigue", "fit week 6 → 5"); BOTTOM the week's tabula: booked care,
      hours used/left, the Medicus's ★ order, the queue button. Every old handler is used as is (data-mg medic/surgeon/heal/bath/asclepius,
      data-bed76/unbed76, data-care90, data-rest, data-inf90, data-v101med, data-med76, data-cure90, data-m48).
      HOURS (2a 3a): rub-down 1 Medicus hour (window capture on [data-bath], w.rb104), Care routine 1 Medicus hour a week while it runs
      (ord87Apply wrapper, w.cr104; an unpaid week gives no −20), Rest week 0 h; Medicus hours +W104.med (3) a week for every house
      (mh101Max wrapper); training hours −W104.th (2) (thMax wrapper). Recovery hours are counted apart (w.rc104) for the split bar.
   3. THE MEDICUS QUEUE (N7a): ⚕ Treat in order ([data-mq104]) books the suggested next step (a bed, Hygeia, the surgeon, the Medicus, or
      the bathhouse when short) for every wounded fighter, festering first, then starters, then by rating, while this week's hours allow.
      MATCH WEEK WARNING: when fewer healthy starters than bouts (mq104Warn) — on the Infirmary tabula, Your ludus and Match Week.
   4. BUILDINGS TAKE WEEKS (N10a) — REPLACES 23's instant build ("one project a week"): level N takes N weeks (m.bp104 {k,l,s,n weeks left,end}), one
      project at a time for every house (facBuild wrapper; m.facWk is kept on the running week so every "builders are busy" check holds);
      it finishes when its last week ends (endWeek wrapper) and every running project finishes in the off-season week (OFF104.on, 348).
      348's FROZEN playoff weeks (OFF104.frozen: w.week stays put) count as weeks too: a week of work comes off, offers are answered, the
      Medicus hours and the recovery week start fresh (w.rc104 / w.mh101 reset, Care routines paid again); rivals' offers count turns (w.t104).
      On the Your-ludus banner, in the Upgrade School popup and on the Valetudinarium plate.
      POPUPS WITH ART (N9a): Upgrade School (333's lu102FacHTML) = a tile per building: the building NOW and its NEXT level from existing
      art (rec100 murals / scene100), richer per level (CSS: plot → sepia → full → gilt), Build only when affordable and the builders are
      free, the weeks it takes; Promote (17's promoteCardHTML) = art tiles per action.
   No save change (new fields only). Kill switch localStorage flavius_v104doff=1. Test tv104d.
   ===================================================================== */
const V104D={on:(()=>{try{return localStorage.getItem('flavius_v104doff')!=='1'}catch(e){return true}})()};
/* TWEAK */
const W104={rec:{bands:[[3,16],[6,12],[9,9],[99,6]],perLv:3,step:1,trialPrev:2,board:6},
  of:{low:.75,scareIv:12,scareWks:2,snatch:.5,pBase:.7,pMin:.35,pMax:.95},
  med:3,th:2,rub:1,care:1,build:true};
function w104Live(){try{const w=typeof W_==='function'?W_():null;return V104D.on&&w&&!w.dead&&!w.tutorial?w:null}catch(e){return null}}
function w104UI(){try{const w=typeof W_==='function'?W_():null;return V104D.on&&w&&!w.dead?w:null}catch(e){return null}}
const w104U=s=>(hashStr(s)%10007)/10006;

if(V104D.on){
/* ============================== 1 · RECRUITING ============================== */
const REC104={bump:0};
function rec104Wk(g,w){const K=rec98K(g);return Object.values(K.a||{}).filter(x=>x===w.week).length}
function rec104Prev(g,w){const K=rec98K(g);const L=(K.l104||[]).filter(x=>x<w.week).length;const A=Object.values(K.a||{}).filter(x=>x!=null&&x<w.week).length;return Math.max(L,A)}
/* every action on one recruit this week makes the next one dearer: the actions' hours are raised while fn runs */
function rec104Bump(g,fn){const w=w104Live();if(!w||!g||g.contract||REC104.bump)return fn();const x=rec104Wk(g,w)*W104.rec.step;if(!x)return fn();
  const A=REC98.acts;const keep={};for(const k in A){keep[k]=A[k].h;A[k].h+=x}REC104.bump++;try{return fn()}finally{REC104.bump--;for(const k in keep)A[k].h=keep[k]}}
function rec104Extra(g){const w=w104Live();return w&&g&&!g.contract?rec104Wk(g,w)*W104.rec.step:0}
/* the board */
function bd104Cap(w){return W104.rec.board+(typeof adv98Lv==='function'?adv98Lv(w,'recruiter'):1)}
function bd104Favs(w){return (w.glads||[]).filter(g=>g&&g.alive!==false&&g.favd&&!g.contract)}
function bd104Full(w){return bd104Favs(w).length>=bd104Cap(w)}
function bd104Why(w){return _T`Your recruiting board is full (${bd104Favs(w).length}/${bd104Cap(w)}) — take someone off it first. A higher Recruiter level holds more.`}
function bd104Sync(w){w=w||w104Live();if(!w)return 0;const cur=bd104Favs(w).map(g=>g.id);if(!Array.isArray(w.bd104)){w.bd104=cur;return 0}
  const set=new Set(cur);const keep=w.bd104.filter(id=>set.has(id));const cap=bd104Cap(w);let cut=0;
  for(const id of cur){if(keep.includes(id))continue;if(keep.length<cap)keep.push(id);else{const g=gById(id);if(g){g.favd=false;cut++}}}
  w.bd104=keep;return cut}
{const base=rec98HrsMax;rec98HrsMax=function(w){const L=w104Live();if(!L)return base.apply(this,arguments);try{const n=typeof rec101Own==='function'?rec101Own(w):rosterOf(me()).length;
  let h=W104.rec.bands[W104.rec.bands.length-1][1];for(const [mx,v] of W104.rec.bands)if(n<=mx){h=v;break}return h+W104.rec.perLv*((typeof adv98Lv==='function'?adv98Lv(w):1)-1)}catch(e){return base.apply(this,arguments)}}}
if(typeof rec101Why==='function'){const base=rec101Why;rec101Why=function(w){if(!w104Live())return base.apply(this,arguments);try{const n=typeof rec101Own==='function'?rec101Own(w):0;const lv=typeof adv98Lv==='function'?adv98Lv(w):1;
  const B=W104.rec.bands;const bonus=W104.rec.perLv*(lv-1);return _T`${n} fighter${n===1?'':'s'} on the roster: ${rec98HrsMax(w)-bonus} h (up to 3 fighters ${B[0][1]} h · 4-6 ${B[1][1]} h · 7-9 ${B[2][1]} h · 10+ ${B[3][1]} h)${bonus?_T` + ${bonus} h from the Recruiter's level`:''} — each extra action on one recruit in a week costs ${W104.rec.step} h more.`}catch(e){return base.apply(this,arguments)}}}
{const base=rec98Can;rec98Can=function(g,a){const args=arguments,self=this;const w=w104Live();if(!w)return base.apply(self,args);
  try{if(a==='trial'&&g&&!g.contract){const n=rec104Prev(g,w);if(n<W104.rec.trialPrev)return [false,sx(g,_T`A trial bout needs ${W104.rec.trialPrev} earlier looks at him, in an earlier week (${n} so far).`,_T`A trial bout needs ${W104.rec.trialPrev} earlier looks at her, in an earlier week (${n} so far).`)]}}catch(e){console.error(e)}
  const r=rec104Bump(g,()=>base.apply(self,args));
  try{if(r&&r[0]&&g&&!g.contract){if(a==='trial'){const n=rec104Prev(g,w);if(n<W104.rec.trialPrev)return [false,sx(g,_T`A trial bout needs ${W104.rec.trialPrev} earlier looks at him, in an earlier week (${n} so far).`,_T`A trial bout needs ${W104.rec.trialPrev} earlier looks at her, in an earlier week (${n} so far).`)]}
    if(!g.favd&&bd104Full(w))return [false,bd104Why(w)]}}catch(e){console.error(e)}
  return r}}
{const base=rec98Act;rec98Act=function(g){const args=arguments,self=this;const w=w104Live();if(!w)return base.apply(self,args);
  const r=rec104Bump(g,()=>base.apply(self,args));try{if(r&&r.ok&&g){const K=rec98K(g);(K.l104=K.l104||[]).push(w.week);if(K.l104.length>40)K.l104=K.l104.slice(-40);if(!g.favd){g.favd=true;bd104Sync(w)}}}catch(e){console.error(e)}return r}}
{const base=rec98Btn;rec98Btn=function(g){const args=arguments,self=this;return rec104Bump(g,()=>base.apply(self,args))}}
if(typeof rc100ActCard==='function'){const base=rc100ActCard;rc100ActCard=function(btn,g){const args=arguments,self=this;return rec104Bump(g,()=>base.apply(self,args))}}
/* pinning / working on someone off a full board */
const BD104_SEL='[data-mg="fav"],[data-favg],[data-mg="pitch"],[data-mg="visit"],[data-mg="gift2"],[data-rec98p],[data-want88]';
window.addEventListener('click',e=>{try{const b=e.target&&e.target.closest&&e.target.closest(BD104_SEL);if(!b||!b.closest('#mgrBody'))return;const w=w104Live();if(!w)return;
  const id=String(b.dataset.favg||b.dataset.id||(b.dataset.want88||'').split('|')[1]||MGR.sel||'').split('|')[0];const g=gById(id);if(!g||g.contract||g.favd)return;
  if(!bd104Full(w))return;e.preventDefault();e.stopImmediatePropagation();mToast('📌 '+esc(bd104Why(w)))}catch(err){console.error(err)}},true);
if(typeof cityFav==='function'){const base=cityFav;cityFav=function(gid){try{const w=w104Live();const g=gById(gid);if(w&&g&&!g.favd&&!g.contract&&bd104Full(w)){mToast('📌 '+esc(bd104Why(w)));return}}catch(e){}return base.apply(this,arguments)}}

/* ---------- offers on the table ---------- */
function of104Of(w,g){return w&&g&&w.of104&&w.of104[g.id]||null}
function of104Room(w){const m=me();const cap=typeof cap104==='function'?cap104(m):typeof MGR_CAP103!=='undefined'?MGR_CAP103:99;const n=typeof cap104N==='function'?cap104N(m):typeof cap103N==='function'?cap103N():rosterOf(m).length;
  return cap-n-Object.keys(w.of104||{}).length}
function of104Scared(w,g){const m=me();const s=g&&g.sc104&&g.sc104[m.id];return s!=null&&s>=w.week?s:null}
function of104Terms(g){try{if(typeof rc100Terms==='function')return rc100Terms(g)}catch(e){}const d=id=>document.getElementById(id);const ask=askWage(g);
  return {wage:+((d('ofWage')||{}).value)||ask,weeks:+((d('ofWeeks')||{}).value)||8,bonus:Math.max(0,+((d('ofBonus')||{}).value)||0),pledge:!!(d('ofPledge')||{}).checked,rudis:!!(d('ofRudis88')||{}).checked}}
function of104Send(w,g,T){const m=me();if(!g||g.contract||g.alive===false)return {ok:false,msg:_T('Nobody to make an offer to.')};
  if(of104Of(w,g))return {ok:false,msg:_T`Your offer to ${esc(g.name)} is already on the table — the answer comes when the week ends.`};
  const sc=of104Scared(w,g);if(sc!=null)return {ok:false,msg:_T`${esc(g.name)} will not hear from your house until ${esc(wkName(sc+1))} — the last offer insulted him.`};
  {const why=typeof cap103Why==='function'?cap103Why():'';if(why)return {ok:false,msg:esc(why)}}
  if(of104Room(w)<=0)return {ok:false,msg:_T`No room on the roster for another signing — your other offers already fill it.`};
  if(!g.favd&&bd104Full(w))return {ok:false,msg:esc(bd104Why(w))};
  const wage=Math.max(1,Math.round(T.wage||askWage(g))),weeks=Math.max(1,Math.round(T.weeks||8)),bonus=Math.max(0,Math.round(T.bonus||0));
  if((m.coin||0)<bonus+wage)return {ok:false,msg:_T('Your treasury cannot cover the bonus and the first week.')};
  (w.of104=w.of104||{})[g.id]={wage,weeks,bonus,pledge:!!T.pledge,rudis:!!T.rudis,wk:w.week};if(!g.favd){g.favd=true;bd104Sync(w)}
  ghist(g,_T`was offered ${wage}/wk for ${weeks} weeks by ${esc(m.ludus)}`);
  const msg=_T`✍ Offer sent to ${esc(g.name)}: ${wage}/wk for ${weeks} weeks${bonus?_T`, ${bonus} bonus`:''}. The answer comes when the week ends.`;tnews(msg);return {ok:true,msg}}
window.addEventListener('click',e=>{try{const b=e.target&&e.target.closest&&e.target.closest('[data-mg="offer"]');if(!b||!b.closest('#mgrBody'))return;const w=w104Live();if(!w)return;
  if(b.dataset.dis||b.disabled)return;const g=gById(String(b.dataset.id||MGR.sel||'').split('|')[0]);if(!g||g.contract)return;
  e.preventDefault();e.stopImmediatePropagation();const r=of104Send(w,g,of104Terms(g));MGR.msg=r.msg;if(r.ok)saveWorld();mToast(r.msg);if(typeof MGR_REDRAW==='function')MGR_REDRAW()}catch(err){console.error(err)}},true);
window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-of104x]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();const w=w104Live();if(!w||!w.of104)return;
  const g=gById(b.dataset.of104x);delete w.of104[b.dataset.of104x];saveWorld();mToast(_T`Offer to ${esc(g?g.name:'')} withdrawn.`);if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
function of104Letter(w,g,seal,title,body){try{sendLetter(w,{key:'of104_'+g.id+'_'+w.week,kind:'letter',from:_T('your recruiter'),adv:'recruiter',seal,title,until:w.week+1,
  body:`<p>${body}</p><div class="acts"><button class="btn tksm" type="button" data-mg="tab" data-id="recruit">${_T`Go to the Recruiting board`}</button></div>`})}catch(e){console.error(e)}}
/* the answers, when the week has turned (wk0 = the week that ended) */
function of104Answer(w,wk0){const m=me();if(!w.of104||!m)return;const P=w.of104;
  for(const [gid,o] of Object.entries(P)){if(o.wk>wk0)continue;delete P[gid];const g=gById(gid);if(!g||g.alive===false)continue;
    if(g.contract){if(g.contract.mgr!==m.id){const R=mgrById(g.contract.mgr);of104Letter(w,g,'🎣',_T`${g.name} signed elsewhere`,_T`Before your offer was answered, <b>${esc(g.name)}</b> signed with <b>${esc(R?R.ludus:'')}</b>. Another house was quicker on the line.`)}continue}
    const ask=askWage(g);const eff=o.wage+o.bonus/Math.max(1,o.weeks);
    if(eff<ask*W104.of.low){(g.sc104=g.sc104||{})[m.id]=w.week+W104.of.scareWks-1;g.interest[m.id]=Math.max(0,interestOf(g,m)-W104.of.scareIv);ghist(g,_T`took ${esc(m.ludus)}'s offer as an insult`);
      of104Letter(w,g,'💢',_T`${g.name} is insulted`,_T`<b>${esc(g.name)}</b> laughed at ${o.wage}/wk — he asks about ${ask}. Interest −${W104.of.scareIv}, and he will not talk to your house for ${W104.of.scareWks} weeks.`);continue}
    const v=offerVerdict(g,o.wage,o.weeks,o.bonus,o.pledge);
    if(!v.ok){const top=suitors(g)[0];const R=top&&top.m&&!top.m.isPlayer&&!top.m.dead?top.m:null;
      if(R&&!v.cap103&&interestOf(g,R)>interestOf(g,m)&&w104U(_T`of104s:${w.id}:${g.id}:${wk0}`)<W104.of.snatch&&rosterOf(R).length<(typeof cap104==='function'?cap104(R):15)){
        g.contract={mgr:R.id,wage:Math.max(ask,Math.round(o.wage*1.05)),weeks:8,since:w.week};g.unsigned=0;ghist(g,_T`signed with ${esc(R.ludus)}`);try{mlog(R,_T`signed ${g.name}, outbidding you`)}catch(e){}
        mnews(_T`${esc(R.ludus)} signs <b>${esc(g.name)}</b> — your offer came second.`);of104Letter(w,g,'🎣',_T`${g.name} chose ${R.ludus}`,_T`<b>${esc(g.name)}</b> took <b>${esc(R.ludus)}</b>'s terms over yours. ${esc(v.why||'')}`);continue}
      of104Letter(w,g,'✉',_T`${g.name} says no`,_T`<b>${esc(g.name)}</b> turns your offer down: ${esc(v.why||'')}`);continue}
    const p=clamp(W104.of.pBase+(eff/Math.max(1,ask)-1)*1.2+(interestOf(g,m)-50)/250,W104.of.pMin,W104.of.pMax);
    if(w104U(`of104:${w.id}:${g.id}:${wk0}`)>=p){g.interest[m.id]=Math.max(0,interestOf(g,m)-3);
      of104Letter(w,g,'✉',_T`${g.name} wants time`,_T`<b>${esc(g.name)}</b> did not bite this week — the terms were close, but he wants a little more (coin, a pledge, a word to his wishes). Try again.`);continue}
    if((m.coin||0)<o.bonus+o.wage){of104Letter(w,g,'✉',_T`${g.name} says yes — but`,_T`<b>${esc(g.name)}</b> would sign, but your treasury cannot cover the bonus and the first week.`);continue}
    signGlad(g,o.wage,o.weeks,o.bonus,o.pledge);if(o.rudis){g.rudis88={mid:m.id,s:w.season,wk:w.week};ghist(g,_T`was promised the rudis path by ${esc(m.ludus)}`)}
    tnews(_T`✍ <b>${esc(g.name)}</b> accepts your offer (${o.wage}/wk, ${o.weeks} weeks).`,'big');
    of104Letter(w,g,'✍',_T`${g.name} signs`,_T`<b>${esc(g.name)}</b> accepts: ${o.wage}/wk for ${o.weeks} weeks${o.bonus?_T`, ${o.bonus} bonus`:''}. Welcome him to the house.`)}}
/* rivals: a signing becomes an offer, answered next week */
{const base=cpuLeagueWeek;cpuLeagueWeek=function(){const w=w104Live();if(!w)return base.apply(this,arguments);const P=w.ro104=w.ro104||{};const m=me();
  try{for(const [gid,o] of Object.entries(P)){if((o.t!=null?o.t:o.wk)>=(o.t!=null?(w.t104||0):w.week))continue;delete P[gid];const g=gById(gid),R=mgrById(o.mid);if(!g||!R||R.dead||g.contract||g.alive===false)continue;
      if(rosterOf(R).length>=(typeof cap104==='function'?cap104(R):15))continue;
      const mine=w.of104&&w.of104[gid];if(mine&&mine.wage+mine.bonus/Math.max(1,mine.weeks)>=o.wage)continue; /* your better offer is heard first */
      if(w104U(`ro104:${w.id}:${gid}:${w.week}`)>.8&&interestOf(g,R)<60){if(g.favd)tnews(_T`🎣 ${esc(g.name)} turned down ${esc(R.ludus)}.`);continue}
      g.contract={mgr:R.id,wage:o.wage,weeks:o.weeks,since:w.week};g.unsigned=0;try{mlog(R,_T`signed ${g.name}`)}catch(e){}mnews(_T`${esc(R.ludus)} signs <b>${esc(g.name)}</b> (${'★'.repeat(starsOf(pubOvr(g)))}).`);
      if(g.favd)tnews(_T`🎣 ${esc(g.name)}, on your board, signs with ${esc(R.ludus)}.`,'bad')}}catch(e){console.error(e)}
  const free=new Map(freeAgents().map(g=>[g.id,g.unsigned]));const top=w.news[0];
  const r=base.apply(this,arguments);
  try{const idx=w.news.indexOf(top);const added=idx>0?w.news.slice(0,idx):[];
    for(const [id,un] of free){const g=gById(id);if(!g||!g.contract||g.contract.since!==w.week)continue;const R=mgrById(g.contract.mgr);if(!R||R.isPlayer)continue;
      P[id]={mid:R.id,wage:g.contract.wage,weeks:g.contract.weeks,wk:w.week,t:w.t104||0};g.contract=null;g.unsigned=un;
      const nm=`<b>${esc(g.name)}</b>`;for(const n of added)if(n.text&&n.text.includes(nm)&&n.text.includes(esc(R.ludus))&&!n.text.includes('—')){const i=w.news.indexOf(n);if(i>=0)w.news.splice(i,1)}
      if(R.log&&R.log[0]&&String(R.log[0].txt||'').includes(g.name))R.log.shift();
      if(g.favd)tnews(_T`⚖ ${esc(R.ludus)} has made <b>${esc(g.name)}</b> an offer — he answers next week. Beat it with yours.`)}}catch(e){console.error(e)}
  return r}}

/* ============================== 2 · THE INFIRMARY: HOURS ============================== */
{const base=mh101Max;mh101Max=function(m){const r=base.apply(this,arguments);try{if(w104Live()&&m)return r+W104.med}catch(e){}return r}}
{const base=thMax;thMax=function(){const r=base.apply(this,arguments);try{if(w104Live())return Math.max(0,r-W104.th)}catch(e){}return r}}
function rc104Rec(w){return w.rc104&&w.rc104.wk===w.week?w.rc104:(w.rc104={wk:w.week,u:0,rub:[],care:[]})}
function rc104Used(w){const r=w.rc104;return r&&r.wk===w.week?r.u:0}
function rc104Rubbed(w,g){const r=w.rc104;return !!(r&&r.wk===w.week&&r.rub.includes(g.id))}
function rc104Cared(w,g){const r=w.rc104;return !!(r&&r.wk===w.week&&r.care.includes(g.id))}
function rc104Spend(w,m,h,g,k){mh101Spend(w,m,h);const r=rc104Rec(w);r.u+=h;if(k&&g&&!r[k].includes(g.id))r[k].push(g.id)}
function rub104Why(w,g){if(!g)return _T('Nobody to rub down.');if(rc104Rubbed(w,g))return _T('Done this week.');if(typeof roadLocked76==='function'&&roadLocked76(w))return _T`🛣 On the road — the Infirmary reopens when the week ends.`;
  if(!(gFat(g)>0))return _T('Not tired.');const L=mh101Left(w,me());if(L<W104.rub)return _T`Needs ${W104.rub} Medicus hour — ${L} left this week.`;return ''}
/* rub-down: 1 Medicus hour (was 1 training hour, 105) */
window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-bath]');if(!b||!b.closest('#mgrBody'))return;const w=w104Live();if(!w)return;e.preventDefault();e.stopImmediatePropagation();
  const g=gById(b.dataset.bath);const why=rub104Why(w,g);if(why){mToast(esc(why));return}const m=me();rc104Spend(w,m,W104.rub,g,'rub');const f0=gFat(g);g.fat=Math.max(0,f0-10);
  MGR.v101fx={id:g.id,k:'rub',t:Date.now(),ok:true};const t=_T`🫒 Oil, steam and strong hands: ${esc(g.name)} sheds some weariness (fatigue ${f0} → ${gFat(g)}, ${W104.rub} Medicus hour).`;tnews(t);saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW();mToast(t)},true);
/* Care routine: refused when turning ON with no Medicus hour left */
window.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-care90]');if(!b||!b.closest('#mgrBody'))return;const w=w104Live();if(!w)return;const g=gById(b.dataset.care90);if(!g)return;
  const on=g.ord87&&g.ord87.r==='care';if(on||rc104Cared(w,g))return;const why=g.inj?_T('Wounded — the Ward first.'):mh101Left(w,me())<W104.care?_T`Needs ${W104.care} Medicus hour — ${mh101Left(w,me())} left this week.`:'';
  if(why){e.preventDefault();e.stopImmediatePropagation();mToast(esc(why))}},true);
{const base=ord87Apply;ord87Apply=function(w,g){try{const L=w104Live();const o=g&&g.ord87;if(L&&w===L&&o&&o.r==='care'&&!g.inj&&g.alive!==false){const m=me();if(!m||!rosterOf(m).includes(g))return base.apply(this,arguments);
      o.short=0;o.wk=w.week;if(g.restWk===w.week||rc104Cared(w,g))return;
      if(mh101Left(w,m)>=W104.care){rc104Spend(w,m,W104.care,g,'care');g.morale=clamp((g.morale||50)+5,0,100);g.gear74=w.season+':'+w.week}else o.short=1;return}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* the week's end: an unpaid Care routine gives no −20 (183's endWeek), the new week's routines are paid; buildings; offers */
{const base=endWeek;endWeek=async function(){const w=W_();const L=w104Live();const wk0=w&&w.week;const off=[];
  if(L){try{const m=me();for(const g of rosterOf(m))if(g.ord87&&g.ord87.r==='care'&&!g.inj&&!rc104Cared(w,g)){off.push([g,g.ord87]);g.ord87={...g.ord87,r:'off'}}}catch(e){console.error(e)}}
  /* 348's frozen playoff weeks: endWeek runs while w.week stays put — still a week of real time (buildings, offers, fresh hours) */
  let fz=false;try{fz=!!(L&&typeof OFF104!=='undefined'&&OFF104.frozen&&OFF104.frozen(w))}catch(e){}
  let r;try{r=await base.apply(this,arguments)}finally{for(const [g,o] of off)g.ord87=o}
  try{const w2=W_();const turned=w2&&w2===w&&(w2.week!==wk0||(fz&&r!==false));if(L&&turned){w2.t104=(w2.t104||0)+1;
    if(w2.week===wk0){w2.rc104=null;w2.mh101=null;for(const g of rosterOf(me()))if(g.ord87&&g.ord87.r==='care'&&!g.inj&&g.alive!==false)ord87Apply(w2,g)}
    else for(const [g] of off)if(g.alive!==false)ord87Apply(w2,g);
    bp104Week(w2);of104Answer(w2,wk0);bd104Sync(w2);saveWorld()}}catch(e){console.error(e)}
  return r}}

/* ============================== 4 · BUILDINGS TAKE WEEKS ============================== */
const BP104_RN=['I','II','III'];
/* b.n = the weeks of work left (one comes off at every week's end — the frozen playoff weeks too); b.end = the week it is ready, from b.n */
function bp104Of(m){const b=m&&m.bp104||null;if(!b)return null;try{const w=W_();if(b.n==null)b.n=Math.max(1,(b.end||w.week)-w.week+1);b.end=w.week+b.n-1}catch(e){}return b}
function bp104Left(m,w){const b=bp104Of(m);return b?Math.max(1,b.n):0}
function bp104Line(m,w){const b=bp104Of(m);if(!b||!FAC[b.k])return '';const n=bp104Left(m,w);return _T`🏗 ${esc(_T(FAC[b.k].n))} ${BP104_RN[b.l-1]} · ready when ${esc(wkName(b.end))} ends${n>1?_T` (${n} weeks)`:''}`}
function bp104Done(m,w,quiet){const b=bp104Of(m);if(!b)return;delete m.bp104;m.fac=m.fac||{};if((m.fac[b.k]||0)<b.l)m.fac[b.k]=b.l;const F=FAC[b.k];if(!F)return;
  try{mlog(m,_T`🏗 finished the ${F.n} ${BP104_RN[b.l-1]} — ${F.fx(b.l)}`)}catch(e){}
  if(m.isPlayer){tnews(_T`🏗 The ${esc(_T(F.n))} ${BP104_RN[b.l-1]} is finished — ${F.fx(b.l)}. Ludus grade ${ludusGrade(m)}.`,'big');mnews(_T`🏗 <b>${esc(m.ludus)}</b> (you) completes the ${esc(_T(F.n))} ${BP104_RN[b.l-1]}. Ludus grade ${ludusGrade(m)}.`)}
  else if(!quiet)mnews(_T`🏗 <b>${esc(m.ludus)}</b> completes the ${esc(_T(F.n))} ${BP104_RN[b.l-1]}. Ludus grade ${ludusGrade(m)}.`)}
function bp104Week(w){for(const m of w.mgrs||[]){const b=m.bp104;if(!b)continue;if(b.n==null)b.n=Math.max(1,(b.end||0)-w.week+2);b.n--;if(b.n<=0)bp104Done(m,w,true);else{m.facWk=w.week;bp104Of(m)}}}
{const base=facBuild;facBuild=function(mgr,facKey,quiet){const w=w104Live();if(!w||!W104.build)return base.apply(this,arguments);if(!mgr)return false;
  if(bp104Of(mgr))return false;const l=facLvl(mgr,facKey);if(l>=3||!FAC[facKey])return false;const cost=FAC_COST[l];if((mgr.coin||0)<cost)return false;
  mgr.coin-=cost;mgr.facWk=w.week;mgr.bp104={k:facKey,l:l+1,s:w.week,n:l+1,end:w.week+l};
  try{mlog(mgr,_T`🏗 began the ${FAC[facKey].n} ${BP104_RN[l]} (${cost} coin, ${l+1} week${l?'s':''})`)}catch(e){}return true}}
{const base=ludusClick;ludusClick=async function(action,id,btn,ctx){const w=w104Live();if(!w||action!=='build'||!W104.build)return base.apply(this,arguments);const pm=me();const {say}=ctx;
  const b=bp104Of(pm);if(b){say(_T`Your builders are on the ${esc(_T(FAC[b.k].n))} ${BP104_RN[b.l-1]} — ready when ${esc(wkName(b.end))} ends. One project at a time.`);return true}
  if(pm.facWk===w.week){say(_T('Your builders are already busy this week.'));return true}
  const l=facLvl(pm,id);if(l>=3||!FAC[id])return true;if(pm.coin<FAC_COST[l]){say(_T`The ${FAC[id].n} ${BP104_RN[l]} costs ${coinAmt87(FAC_COST[l])}.`);return true}
  facBuild(pm,id);const n=l+1;tnews(_T`🏗 Work begins on the ${esc(_T(FAC[id].n))} ${BP104_RN[l]} (${coinAmt87(FAC_COST[l])}) — ready when ${esc(wkName(pm.bp104.end))} ends (${n} week${n===1?'':'s'}).`,'big');saveWorld();
  say(_T`🏗 Work begins on the ${esc(_T(FAC[id].n))} ${BP104_RN[l]} — ${n===1?_T('finished when this week ends'):_T`${n} weeks: ready when ${esc(wkName(pm.bp104.end))} ends`}.`);return true}}
/* the off-season week (348): every project finishes */
try{if(typeof OFF104!=='undefined'&&OFF104&&typeof OFF104.on==='function')OFF104.on(w=>{try{if(!w104Live())return;for(const m of w.mgrs||[])if(bp104Of(m))bp104Done(m,w,true)}catch(e){console.error(e)}})}catch(e){console.error(e)}

/* ---------- Upgrade School with art ---------- */
const BP104_ART={yard:['img','rec100_yard.webp','50% 60%'],stands:['img','rec100_colos.webp','50% 50%'],valet:['img','rec100_baths.webp','40% 40%'],kitchen:['img','rec100_tavern.webp','45% 45%'],
  barracks:['sc','team','50% 50%'],shrine:['img','rec100_temple.webp','40% 50%'],armory:['sc','armory','50% 60%'],stables:['img','rec100_stalls.webp','50% 50%']};
function bp104Pic(k){const A=BP104_ART[k]||['sc','school','50% 50%'];const src=A[0]==='img'?`<img class="bp104im" src="${typeof assetURL==='function'?assetURL(A[1]):'assets/'+A[1]}" alt="" draggable="false" decoding="async" style="object-position:${A[2]}">`
  :(typeof scene100==='function'?scene100(A[1],'tile','bp104im').replace('<img ',`<img style="object-position:${A[2]}" `):'');return src}
function bp104Art(k,l,next){return `<span class="bp104a bp104l${l}${next?' nx':''}">${bp104Pic(k)}${l===0?`<span class="bp104plot">${_T`an empty plot`}</span>`:''}<span class="bp104lv">${l?BP104_RN[l-1]:'—'}</span></span>`}
function bp104Tile(w,pm,fk){const F=FAC[fk];const l=facLvl(pm,fk);const b=bp104Of(pm);const here=b&&b.k===fk;const cost=FAC_COST[l];const busy=!!b||pm.facWk===w.week;const poor=(pm.coin||0)<cost;
  const why=l>=3?'':here?_T`Being built — ready when ${wkName(b.end)} ends.`:b?_T`The builders are on the ${_T(FAC[b.k].n)} — one project at a time.`:busy?_T('Your builders are already busy this week.'):poor?_T`Needs ${cost} coin — your treasury holds ${pm.coin}.`:'';
  const n=l+1;
  return `<div class="lu2r bp104t${!why&&l<3?' can':''}${here?' bld':''}" data-bp104="${fk}"><div class="bp104h"><b>${F.i} ${esc(_T(F.n))}</b><span class="facpips">${[0,1,2].map(i=>`<i class="${i<l?'on':''}"></i>`).join('')}</span></div>
    <div class="bp104pair"><figure>${bp104Art(fk,l)}<figcaption>${_T`Now`} · ${l?esc(F.fx(l)):esc(F.d)}</figcaption></figure>${l<3?`<span class="bp104arr">→</span><figure>${bp104Art(fk,here?b.l:l+1,true)}<figcaption>${here?_T('Being built'):_T`Next`} · ${esc(F.fx(here?b.l:l+1))}</figcaption></figure>`:''}</div>
    <div class="bp104f">${l>=3?`<span class="badge gold">${_T`complete`}</span>`:here?`<span class="bp104bld">${_T`🏗 ${bp104Left(pm,w)===1?_T('ready when this week ends'):_T`ready when ${wkName(b.end)} ends`}`}</span>`
      :`<span class="rc-sub">${_T`${n} week${n===1?'':'s'} to build`}</span><button class="btn tksm${why?'':' primary'}" type="button" data-mg="build" data-id="${fk}" ${why?_T`disabled title="${esc(why)}"`:''}>${_T`Build ${BP104_RN[l]}`}<small>${coinAmt87(cost)}</small></button>`}${why&&!here&&l<3?`<small class="bp104why">${esc(why)}</small>`:''}</div></div>`}
if(typeof lu102FacHTML==='function'){const base=lu102FacHTML;lu102FacHTML=function(w,pm){const h=base.apply(this,arguments);try{if(!w104Live()||typeof h!=='string')return h;
  const C=council83(w);const by={};for(const fk of Object.keys(FAC)){const o=lu2Owner(fk);(by[o]=by[o]||[]).push(fk)}const nm=k=>{const a=C.find(x=>x.k===k);return a?esc(a.name):k};const ro=k=>{const a=C.find(x=>x.k===k);return a?esc(a.role):''};
  const T=document.createElement('template');T.innerHTML=h;const R=T.content;const box=R.querySelector('.lu102fb');const sub=R.querySelector('.lu102fh .rc-sub');
  if(sub)sub.innerHTML=`${bp104Of(pm)?bp104Line(pm,w):_T('one project at a time · a level takes as many weeks as its number')} · ${_T`${facSum(pm)} of ${Object.keys(FAC).length*3} levels`}`;
  if(box){box.classList.add('bp104box');box.innerHTML=Object.entries(by).map(([k,L])=>`<div class="lu2b"><div class="lu2bh">${nm(k)} <span class="rc-sub">${ro(k)}</span></div><div class="bp104g">${L.map(fk=>bp104Tile(w,pm,fk)).join('')}</div></div>`).join('')}
  return T.innerHTML}catch(e){console.error(e);return h}}}
/* the advisor popover's rows (297) say so too */
if(typeof lu2Row==='function'){const base=lu2Row;lu2Row=function(w,pm,fk){const h=base.apply(this,arguments);try{const b=w104Live()&&bp104Of(pm);if(!b||typeof h!=='string')return h;
  if(b.k===fk)return h.replace(/<button[^>]*data-mg="build"[\s\S]*?<\/button>/,`<span class="bp104bld">🏗 ${esc(_T`ready when ${wkName(b.end)} ends`)}</span>`);
  return h.replace('data-mg="build"',_T`data-mg="build" disabled title="${esc(_T`The builders are on the ${_T(FAC[b.k].n)} — one project at a time.`)}"`)}catch(e){return h}}}

/* the Valetudinarium's effect line said "physicians' weekly cap" (23) — since 318 it is beds + Medicus hours */
try{if(FAC.valet)FAC.valet.fx=l=>_T`+${l} bed${l===1?'':'s'} · +${l*CARE101.valet} Medicus hours a week`}catch(e){}
/* ---------- Promote with art ---------- */
const PR104_ART={feast2:['img','rec100_tavern.webp','45% 50%'],sponsor2:['img','rec100_colos.webp','50% 40%'],criers2:['img','rec100_stalls.webp','50% 50%'],pg84:['sc','promote','50% 40%']};
{const base=promoteCardHTML;promoteCardHTML=function(){const h=base.apply(this,arguments);try{if(!w104Live()||typeof h!=='string')return h;const T=document.createElement('template');T.innerHTML=h;const R=T.content;
  const acts=R.querySelector('.acts');if(!acts)return h;acts.classList.add('pr104g');
  for(const b of acts.querySelectorAll(':scope>button')){const k=b.dataset.mg||(b.hasAttribute('data-pg84')?'pg84':'');const A=PR104_ART[k];if(!A)continue;b.classList.add('pr104t');
    const art=A[0]==='img'?`<img class="bp104im" src="${typeof assetURL==='function'?assetURL(A[1]):'assets/'+A[1]}" alt="" draggable="false" decoding="async" style="object-position:${A[2]}">`:(typeof scene100==='function'?scene100(A[1],'tile','bp104im'):'');
    b.insertAdjacentHTML('afterbegin',`<span class="pr104a">${art}</span>`)}
  return T.innerHTML}catch(e){console.error(e);return h}}}

/* ============================== 2 · THE INFIRMARY: THE PAGE ============================== */
const W104_ART={rub:()=>`<span class="rm100pic" style="--op:85% 60%"><img class="rm100sc" src="${typeof assetURL==='function'?assetURL('rec100_baths.webp'):'assets/rec100_baths.webp'}" alt="" draggable="false" decoding="async" style="object-position:90% 70%"></span><span class="rm100steam"></span>`,
  care:()=>`<span class="rm100pic"><img class="rm100sc" src="${typeof assetURL==='function'?assetURL('rec100_yard2.webp'):'assets/rec100_yard2.webp'}" alt="" draggable="false" decoding="async"></span>`,
  rest:()=>(typeof ART101==='function'?ART101('rest'):'')};
function w104Art(k){try{if(W104_ART[k])return W104_ART[k]();return typeof ART101==='function'?ART101(k):''}catch(e){return ''}}
const w104Wounded=g=>!!((g.inj&&!g.inj.war)||(g.severed||[]).length);
const w104Weary=g=>!w104Wounded(g)&&gFat(g)>30;
function w104Treated(g,w){return !!(g.medWk===w.week||g.bathWk===w.week||(g.inj&&g.inj.bk102&&g.inj.bk102.wk===w.week)||(g.rg102&&g.rg102.wk===w.week))}
function w104Rested(g,w){return rc104Rubbed(w,g)||rc104Cared(w,g)||g.restWk===w.week}
/* the next step for a patient (318's ord101 with recovery in the Baths) */
function w104Steps(g){const w=W_();let S=[];try{S=ord101(g).filter(x=>x.k!=='yard')}catch(e){}const f=gFat(g);
  if(!w104Wounded(g)&&f>30){const rest=g.restWk===w.week,rub=rc104Rubbed(w,g),care=rc104Cared(w,g)||(g.ord87&&g.ord87.r==='care');
    if(f>60)S.push({k:'rest',t:_T`🪑 Worn (${f}): a Rest week on the bench — −${FAT_REST} fatigue when the week ends`,done:rest});
    S.push({k:'rub',t:_T`🫒 A rub-down in the oiling room — −10 fatigue now`,done:rub});
    if(f<=60)S.push({k:'care',t:_T`📋 The Care routine — −${FAT_CARE90} fatigue every week while it runs`,done:care})}
  try{const i=g.inj;for(const s of S){if(i&&i.bk102&&['medic','surgeon','asclepius'].includes(s.k))s.done=true;if(s.k==='heal'&&g.rg102&&g.rg102.wk===w.week)s.done=true}}catch(e){}
  return S}
function w104Next(g){const S=w104Steps(g);const x=S.find(s=>!s.done&&s.k);return x?(x.alt||x.k):''}
/* the queue: festering first, then starters, then the best */
function mq104Order(pm){return rosterOf(pm).filter(g=>w104Wounded(g)&&!(g.inj&&g.inj.war)).sort((a,b)=>((b.inj&&b.inj.neglect)?1:0)-((a.inj&&a.inj.neglect)?1:0)||(b.slot95?1:0)-(a.slot95?1:0)||effOvr(b)-effOvr(a))}
function mq104Can(w,g,k){if(k==='bed')return !inBed76(g)&&bedFree76(w)>0;if(['medic','surgeon','heal','bath','asclepius'].includes(k))return !care101Why(g,k);return false}
function mq104Run(){const w=W_(),pm=me();if(!w||!pm)return {n:0,msg:''};const done=[];let prog=true,guard=0;
  while(prog&&guard++<40){prog=false;for(const g of mq104Order(pm)){const S=w104Steps(g).filter(s=>!s.done&&s.k&&s.k!=='rest'&&s.k!=='rub'&&s.k!=='care');const s=S[0];if(!s)continue;let k=s.alt||s.k;
      if(!mq104Can(w,g,k)&&k==='medic'&&mq104Can(w,g,'bath'))k='bath';if(!mq104Can(w,g,k))continue;
      if(k==='bed'){(w.beds76=w.beds76||[]).push(g.id);done.push(_T`🛏 ${esc(g.name)} to bed`);prog=true;continue}
      const r=care101Do(g,k);if(r&&r.ok){done.push(r.msg);prog=true}}}
  return {n:done.length,msg:done.length?_T`⚕ The Medicus works down the list: ${done.length} step${done.length===1?'':'s'} booked.`:_T('⚕ Nothing more the Medicus can do this week — no hours, no coin or nothing waiting.'),done}}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-mq104]');if(!b||!b.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();if(b.disabled)return;
  const w=W_();if(typeof roadLocked76==='function'&&roadLocked76(w)){mToast(_T`🛣 On the road — the Infirmary reopens when the week ends.`);return}
  const r=mq104Run();if(r.n){for(const t of r.done)tnews(t);saveWorld()}MGR.msg=r.msg;if(typeof MGR_REDRAW==='function')MGR_REDRAW();mToast(r.msg)},true);
/* Match Week: can the healthy starters fill the bouts? */
function mq104Warn(w,pm){try{w=w||W_();pm=pm||me();if(!w||!pm||w.tutorial||!w.night||w.night.bye||w.night.selfBye)return '';const B=(w.night.bouts||[]).filter(b=>!b.done&&!b.any100);if(!B.length)return '';
  const pool=rosterOf(pm).filter(g=>g.alive!==false);const fit=g=>!g.inj&&g.restWk!==w.week;const st=pool.filter(g=>[1,2,3].includes(g.slot95));const need=Math.min(3,B.length);const ok=st.filter(fit).length;if(ok>=need||!st.length)return '';
  const bench=pool.filter(g=>!g.slot95&&fit(g)).length;
  return _T`⚠ Match Week: only ${ok} of your ${need} starters are fit to fight${bench?_T` — ${bench} fit on the bench: promote one on the Roster`:_T(' — and nobody fit on the bench')}.`}catch(e){return ''}}
function mq104WarnHTML(w,pm){const t=mq104Warn(w,pm);return t?`<div class="mq104w" role="status">${t} <span class="v101lnk" role="button" tabindex="0" data-mg="tab" data-id="roster">${_T`To the Roster`}</span></div>`:''}

/* the plates */
function w104Plate(o){return `<button type="button" class="v104pl plantile${o.why?' off':''}${o.on?' on':''}${o.rec?' v101rec':''}" ${o.attr} data-v104p="${o.k}" data-v101t="${o.k}"${o.why?` ${o.native?_T`disabled title="${esc(o.why)}"`:`data-dis="${esc(o.why)}" title="${esc(o.why)}"`}`:` title="${esc(o.fx||'')}"`}>
  <span class="rm100fr">${w104Art(o.art||o.k)}</span><span class="v104pb"><b>${o.ic} ${o.n}</b><span class="v104ph">${o.cost}</span><span class="v104fx">${o.fx||''}</span>${o.on?`<span class="v101ok">${o.onTxt||_T('✓ this week')}</span>`:''}${o.why?`<span class="v104why">${esc(o.why)}</span>`:''}</span>${o.rec?`<span class="v101star">${_T`★ Suggested`}</span>`:''}</button>`}
function w104Cost(k){return `${CARE101.h[k]} h · ${coinAmt87(care101Coin(k))}`}
function w104Ward(g,w,pm,rk){const P=[];const i=g.inj&&!g.inj.war?g.inj:null;const sev=g.severed||[];const fw=i?fitWeekOf(g):null;const fitTo=n=>i?_T`fit ${wkName(fw)} → ${wkName(n)}`:'';
  const nextFit=()=>{try{return (typeof j102Fresh==='function'&&j102Fresh(g,w))?w.week+2:w.week+1}catch(e){return w.week+1}};
  if(bedOK87(g)){const inb=inBed76(g);const ser=serious76(g);const free=bedFree76(w);
    P.push(inb?w104Plate({k:'bed',ic:'🛏',n:_T('In bed'),cost:_T('free'),fx:_T('Full-pace healing · the physicians can treat him'),attr:`data-unbed76="${g.id}"`,on:true,onTxt:_T('✓ in bed · tap to take out')})
      :w104Plate({k:'bed',ic:'🛏',n:_T('A bed'),cost:_T`free · ${free} of ${bedsOf76(pm)} free`,fx:ser?_T('Needed: a serious wound or a lost limb mends at half pace without one'):_T('Full-pace healing'),attr:`data-bed76="${g.id}"`,why:free?'':_T('Beds full — build the Valetudinarium for another'),native:1,rec:rk==='bed'}))}
  if(i){const req=injReq(i);const k=req==='surgeon'?'surgeon':'medic';const why=care101Why(g,k);const on=!!(i.bk102&&i.bk102.k===k)||(k==='medic'&&g.medWk===w.week);
    P.push(w104Plate({k,ic:k==='surgeon'?'🔪':'⚕',n:k==='surgeon'?_T('Surgeon'):_T('Medicus'),cost:w104Cost(k),fx:(k==='surgeon'?_T('The only cure for a festering wound · 1 in 10 slips'):_T('Closes the wound when the week ends · +12 morale'))+' · '+fitTo(nextFit()),attr:`data-mg="${k}" data-id="${g.id}"`,why:on?'':why,on,onTxt:_T('✓ booked this week'),rec:rk===k}))}
  if(sev.length){const why=care101Why(g,'heal');const on=!!(g.rg102&&g.rg102.wk===w.week);
    P.push(w104Plate({k:'heal',ic:'🌿',n:_T('Hygeia'),cost:`${CARE101.h.heal} h · ${coinAmt87(care101Coin('heal'))} ${_T('a limb')}`,fx:_T`Regrows the ${sev.map(l=>esc(LOCN[l]).toLowerCase()).join(', ')} · one limb a week · needs a bed`,attr:`data-mg="heal" data-id="${g.id}"`,why:on?'':why,on,onTxt:_T('✓ booked this week'),rec:rk==='heal'}))}
  if(i){const why=care101Why(g,'asclepius');const on=!!(i.bk102&&i.bk102.k==='asclepius');
    P.push(w104Plate({k:'asclepius',ic:'⚡',n:_T('Asclepius'),cost:w104Cost('asclepius'),fx:_T('Closes any wound when the week ends, no mishap · +8 morale')+' · '+fitTo(nextFit()),attr:`data-mg="asclepius" data-id="${g.id}"`,why:on?'':why,on,onTxt:_T('✓ booked this week'),rec:rk==='asclepius'}))}
  const vl=facLvl(pm,'valet');if(vl<3){const b=bp104Of(pm);const here=b&&b.k==='valet';const why=here?_T`Being built — ready when ${wkName(b.end)} ends.`:b?_T`The builders are on the ${_T(FAC[b.k].n)} — one project at a time.`:pm.facWk===w.week?_T('Your builders are already busy this week.'):pm.coin<FAC_COST[vl]?_T`Needs ${FAC_COST[vl]} coin — your treasury holds ${pm.coin}.`:'';
    P.push(w104Plate({k:'build',ic:'🏗',n:_T`Valetudinarium ${BP104_RN[vl]}`,cost:_T`${coinAmt87(FAC_COST[vl])} · ${vl+1} week${vl?'s':''}`,fx:_T`+1 bed · +${CARE101.valet} Medicus hours a week`,attr:`data-mg="build" data-id="valet"`,why,native:1,on:here,onTxt:_T('🏗 being built')}))}
  return P}
function w104Baths(g,w,pm,rk){const P=[];const i=g.inj&&!g.inj.war?g.inj:null;const f=gFat(g);
  if(i){const why=care101Why(g,'bath');const on=g.bathWk===w.week;const fw=fitWeekOf(g);
    P.push(w104Plate({k:'bath',ic:'🛁',n:_T('Bathhouse'),cost:w104Cost('bath'),fx:_T`A week off the healing · fit ${wkName(fw)} → ${wkName(Math.max(w.week,fw-1))} · +4 morale`,attr:`data-mg="bath" data-id="${g.id}"`,why:on?'':why,on,rec:rk==='bath'}))}
  {const why=rub104Why(w,g);const on=rc104Rubbed(w,g);
    P.push(w104Plate({k:'rub',ic:'🫒',n:_T('Rub-down'),cost:_T`${W104.rub} h · free`,fx:_T`−10 fatigue now (${f} → ${Math.max(0,f-10)}) · once a week`,attr:`data-bath="${g.id}"`,why:on?'':why,native:1,on,rec:rk==='rub'}))}
  {const on=!!(g.ord87&&g.ord87.r==='care');const paid=rc104Cared(w,g);const why=i?_T('Wounded — the Ward first.'):'';
    P.push(w104Plate({k:'care',ic:'📋',n:_T('Care routine'),cost:_T`${W104.care} h a week`,fx:_T`A standing order: −${FAT_CARE90} fatigue when each week ends · +5 morale · gear care`,attr:`data-care90="${g.id}"`,why:on?'':why,native:1,on,onTxt:paid?_T('✓ on · paid this week · tap to stop'):_T('on · no hour left this week · tap to stop'),rec:rk==='care'}))}
  {const on=g.restWk===w.week;const why=i?_T('Wounded — the Ward first.'):'';
    P.push(w104Plate({k:'rest',ic:'🪑',n:_T('Rest week'),cost:_T('0 h · on the bench'),fx:_T`No bouts, no drills this week · −${FAT_REST} fatigue when it ends (${f} → ${Math.max(0,f-FAT_REST)})`,attr:`data-rest="${g.id}"`,why:on?'':why,native:1,on,onTxt:_T('✓ resting · tap to undo'),rec:rk==='rest'}))}
  return P}
/* the fatigue gauge */
function w104Gauge(g,w){const f=gFat(g);const care=g.ord87&&g.ord87.r==='care'&&!g.inj;const rest=g.restWk===w.week;const drop=(care&&rc104Cared(w,g)?FAT_CARE90:0)+(rest?FAT_REST:0);const nx=Math.max(0,f-drop);
  const B=FB90_TXT();const band=fatBand90(f),nb=fatBand90(nx);
  return `<div class="w104g" title="${esc(B[band][1])}"><div class="w104gh"><b>😮‍💨 ${_T`Fatigue`} ${f}</b> ${fatChip90(g)}</div><div class="w104gb"><span class="z fresh">${B.fresh[0]}</span><span class="z tired">${B.tired[0]}</span><span class="z worn">${B.worn[0]}</span><i class="now" style="left:${f}%"></i>${drop?`<i class="nx" style="left:${nx}%"></i>`:''}</div>
    ${drop?`<div class="w104gn">${_T`Next week: <b>${nx}</b> · ${B[nb][0]}`}${rest?' · '+_T('Rest week'):''}${care?' · '+_T('Care routine'):''}</div>`:`<div class="w104gn rc-sub">${f>30?_T('No recovery booked — the Baths take it down.'):_T('Fresh enough for the sand.')}</div>`}</div>`}
function w104Row(g,w,sel){const tr=w104Treated(g,w),rs=w104Rested(g,w);const st=status90(g);const inb=inBed76(g)&&bedOK87(g);
  return `<div class="w104r${sel?' on':''}"><button type="button" class="w104row${sel?' on':''}" data-inf90="${g.id}"><span class="iv90f">${gArt(g,'xs')}</span><b class="iv90n">${esc(g.name)}</b><span class="iv90bs">${miniHP90(g)}${miniFt90(g)}</span><span class="iv90c st90-${st[0]}">${st[0]==='ok'?`${fatChip90(g)} <small>${_T`fatigue ${gFat(g)}`}</small>`:st[1]}</span>${tr?`<span class="trt103" title="${esc(_T('Had care this week'))}">${_T`Treated ✓`}</span>`:''}${rs?`<span class="rst104" title="${esc(_T('Recovery booked this week'))}">${_T`Rested ✓`}</span>`:''}</button>${inb?`<button class="btn tksm v101out" type="button" data-unbed76="${g.id}" title="${esc(_T('Take him out of the bed'))}">${_T`🛏 Take out`}</button>`:''}</div>`}
/* the week's tabula */
function w104Booked(w,pm){const L=[];for(const g of rosterOf(pm)){const i=g.inj;const nm=`<b>${esc(g.name)}</b>`;
    if(i&&i.bk102&&i.bk102.wk>=w.week)L.push(`${nm} · ${({medic:'⚕',surgeon:'🔪',asclepius:'⚡',hygeia:'🌿'})[i.bk102.k]||'⚕'} ${esc((typeof J102_KN==='function'?J102_KN()[i.bk102.k]:i.bk102.k)||'')} ${_T`booked`}`);
    else if(g.medWk===w.week)L.push(`${nm} · ⚕ ${_T`the Medicus`}`);
    if(g.rg102&&g.rg102.wk===w.week)L.push(`${nm} · 🌿 ${_T`Hygeia (a limb)`}`);if(g.bathWk===w.week)L.push(`${nm} · 🛁 ${_T`the bathhouse`}`);
    if(rc104Rubbed(w,g))L.push(`${nm} · 🫒 ${_T`rub-down`}`);if(g.ord87&&g.ord87.r==='care'&&!g.inj)L.push(`${nm} · 📋 ${rc104Cared(w,g)?_T`Care routine (1 h)`:_T`Care routine — unpaid, no hour left`}`);
    if(g.restWk===w.week)L.push(`${nm} · 🪑 ${_T`Rest week`}`);if(inBed76(g)&&bedOK87(g))L.push(`${nm} · 🛏 ${_T`in bed`}`)}
  return L}
function w104Tabula(w,pm,sel){const Mx=mh101Max(pm,w),Lf=mh101Left(w,pm);const rec=rc104Used(w);const used=Mx-Lf;const wc=Math.max(0,used-rec);const B=w104Booked(w,pm);
  const Q=mq104Order(pm).map(g=>[g,w104Steps(g).find(s=>!s.done&&s.k&&!['rest','rub','care'].includes(s.k))]).filter(x=>x[1]);
  const can=Q.some(([g,s])=>mq104Can(w,g,s.alt||s.k)||((s.alt||s.k)==='medic'&&mq104Can(w,g,'bath')));
  const S=sel?w104Steps(sel):[];const first=S.findIndex(x=>!x.done&&x.k);
  return `<section class="rm100tab w104tab"><span class="rm100fr rm100tstrip">${typeof rm100Scn==='function'?rm100Scn('council','50% 70%'):''}<span class="rm100tt">${_T`Tabula · this week`}</span></span><div class="rm100wax w104wax">
    ${mq104WarnHTML(w,pm)}
    <div class="w104c"><div class="v101oh">${_T`Medicus hours`}</div><div class="w104hl">${_T`<b>${Lf}</b> of ${Mx} left · wound care ${wc} h · recovery ${rec} h`}</div>
      <div class="v101oh">${_T`Booked this week`}</div>${B.length?`<ul class="w104bk">${B.map(x=>`<li>${x}</li>`).join('')}</ul>`:`<div class="rc-sub">${_T`Nothing booked yet.`}</div>`}</div>
    <div class="w104c"><div class="v101oh">${_T`The Medicus's order`}</div>
      ${Q.length?`<ol class="w104q">${Q.map(([g,s],n)=>`<li class="${n===0?'rec':''}"><b>${n===0?'★ ':''}${esc(g.name)}</b> · ${s.t}</li>`).join('')}</ol>`:`<div class="rc-sub">${_T`✓ Nobody waiting for the physicians.`}</div>`}
      <button type="button" class="btn tksm${can?' primary':''}" data-mq104 ${can?'':_T`disabled title="${esc(_T('Nothing the hours and the treasury can pay for now'))}"`}>${_T`⚕ Treat the wounded in order`}</button>
      ${sel&&S.length?`<div class="v101oh" style="margin-top:6px">${_T`${esc(sel.name)} · step by step`}</div><div class="v101ord w104ord">${S.map((x,n)=>`<div class="v101os${x.done?' done':''}${n===first?' rec':''}"><b>${x.done?'✓':n+1}</b><span>${x.t}</span></div>`).join('')}</div>`:''}</div></div></section>`}
function w104Banner(hd,w,pm){const Mx=mh101Max(pm,w),Lf=mh101Left(w,pm);const rec=rc104Used(w);const wc=Math.max(0,Mx-Lf-rec);const pc=v=>Mx?(v/Mx*100).toFixed(1):0;
  for(const s of hd.querySelectorAll('.v101st,.v101bx,.roomstat'))s.remove();const Md=w.medicus76;
  const bar=document.createElement('div');bar.className='w104hb';
  bar.innerHTML=`<div class="w104hbt"><b>⏳ ${_T`Medicus hours this week`}</b><span>${_T`${Lf} of ${Mx} left`}</span></div><div class="w104bar" role="img" aria-label="${esc(_T`${wc} h wound care, ${rec} h recovery, ${Lf} h left of ${Mx}`)}"><i class="k104wc" style="width:${pc(wc)}%"></i><i class="k104rc" style="width:${pc(rec)}%"></i></div>
    <div class="w104hbl"><span class="k104wc">⚕ ${_T`wound care ${wc} h`}</span><span class="k104rc">♨ ${_T`recovery ${rec} h`}</span><span class="k104lf">${_T`${Lf} h left`}</span></div>`;
  const side=document.createElement('div');side.className='w104bx';
  side.innerHTML=(Md?`<span class="v101med" title="${esc(MED_SK76[Md.skill]||'')}">${_T`🧑‍⚕️ <b>${esc(Md.name)}</b> · skill ${Md.skill} · ${coinAmt87(Md.wage)}/wk`} <button class="btn tksm" type="button" data-med76="fire">${_T`Let go`}</button></span>`
    :`<button class="btn tksm v101med" type="button" data-v101med title="${esc(_T('A weekly wage · faster healing · more Medicus hours'))}">${_T`🧑‍⚕️ Hire a medicus`}</button>`)+`<button type="button" class="iv90why v101why" data-cure90 title="${esc(_T('Which cure should I use?'))}">ⓘ ${_T`Which cure?`}</button>`;
  hd.appendChild(bar);hd.appendChild(side);hd.classList.add('w104ban')}
function w104Page(R,w,pm){const pane=R.querySelector('#mgrPane');if(!pane)return;const hd=pane.querySelector(':scope>.roomhd');const old=pane.querySelector(':scope>.rm100-ward,:scope>.iv90');if(!hd||!old)return;
  const hy=R.querySelector('.hyg87');
  const ros=rosterOf(pm);const wd=ros.filter(w104Wounded),wy=ros.filter(w104Weary),fr=ros.filter(g=>!w104Wounded(g)&&!w104Weary(g));
  let sel=gById(MGR.inf90);if(!sel||!ros.includes(sel))sel=wd[0]||wy[0]||ros[0]||null;if(sel)MGR.inf90=sel.id;
  const fits=sel&&w104Wounded(sel)?'ward':'baths';if(MGR.w104for!==(sel&&sel.id)){MGR.w104for=sel&&sel.id;MGR.w104t=fits}const tab=MGR.w104t||fits;
  w104Banner(hd,w,pm);
  const N=bedsOf76(pm),used=bedsClean76(w).length;
  const list=`<aside class="w104list rm100list"><div class="v102inf w104house"></div><div class="w104lh"><span>🛏 ${_T`beds ${used}/${N}`}</span></div>
    <div class="w104grp wd"><div class="w104gt">🩸 ${_T`Wounded`} <span>${wd.length}</span></div>${wd.length?wd.map(g=>w104Row(g,w,g===sel)).join(''):`<p class="rc-sub w104none">${_T`✓ Nobody wounded.`}</p>`}</div>
    <div class="w104grp wy"><div class="w104gt">💤 ${_T`Weary`} <span>${wy.length}</span></div>${wy.length?wy.map(g=>w104Row(g,w,g===sel)).join(''):`<p class="rc-sub w104none">${_T`✓ Nobody tired.`}</p>`}</div>
    ${fr.length?`<details class="w104grp fr iv90more"${(wd.length||wy.length)&&!fr.includes(sel)?'':' open'}><summary class="w104gt">${_T`Fit and fresh`} <span>${fr.length}</span></summary>${fr.map(g=>w104Row(g,w,g===sel)).join('')}</details>`:''}</aside>`;
  let mid='',plates='';
  if(sel){let sv='';try{sv=avatar90(sel);if(typeof rm100Statue==='function')sv=rm100Statue(sv,sel)}catch(e){}
    const i=sel.inj;const lines=[];if(i&&!i.war)lines.push(`<div class="rm100w1 wd"><b>⚕ ${esc(i.label)}${serious76(sel)?' · '+_T('serious'):''}</b><small>${i.bk102?_T`booked · fit ${wkName(fitWeekOf(sel))}`:_T`fit ${wkName(fitWeekOf(sel))} · needs ${injReq(i)==='rest'?_T('rest'):injReq(i)==='medicus'?_T('the Medicus'):_T('the surgeon')}`}</small></div>`);
    if(i&&i.war)lines.push(`<div class="rm100w1"><b>⚔ ${_T`Away at war`}</b><small>${esc(i.label)} · ${_T`back ${wkName(i.until)}`}</small></div>`);
    for(const l of sel.severed||[])lines.push(`<div class="rm100w1 cut"><b>✂ ${_T`${esc(LOCN[l])} lost`}</b><small>${_T`only Hygeia regrows it`}</small></div>`);
    mid=`<section class="rm100p w104mid"><div class="rm100ph">${esc(sel.name)} · ${status90(sel)[1]}</div><div class="w104who"><span class="rm100fr rm100por">${gArt(sel,'md')}</span><div><div class="rm100pn">${esc(sel.name)}</div><div class="rm100pl">${esc(CLASSES[sel.cls]?CLASSES[sel.cls].name:'')} · ${_T`rating ${effOvr(sel)}`} · ${_T`morale ${sel.morale||0}`}</div>${hpBar90(sel)}</div></div>
      <div class="w104stat"><div class="w104niche rm100niche"><div class="iv90av">${sv}</div></div><div class="w104side">${lines.join('')}${w104Gauge(sel,w)}</div></div></section>`;
    const rk=w104Next(sel);const P=tab==='ward'?w104Ward(sel,w,pm,rk):w104Baths(sel,w,pm,rk);const wkCount=w104Ward(sel,w,pm,'').length,bkCount=w104Baths(sel,w,pm,'').length;
    plates=`<section class="w104pl"><div class="w104tabs" role="tablist"><button type="button" role="tab" class="w104t${tab==='ward'?' on':''}" aria-selected="${tab==='ward'}" data-w104t="ward">⚕ ${_T`Ward`}${fits==='ward'?' <i>•</i>':''}</button><button type="button" role="tab" class="w104t${tab==='baths'?' on':''}" aria-selected="${tab==='baths'}" data-w104t="baths">♨ ${_T`Baths`}${fits==='baths'?' <i>•</i>':''}</button></div>
      <div class="w104sub rc-sub">${tab==='ward'?_T`The Medicus, the surgeon, Hygeia and the beds — for wounds and lost limbs.`:_T`Steam, oil and rest — for weary fighters (and a week off a wound).`}</div>
      <div class="w104plates" role="tabpanel">${P.join('')||`<p class="rc-sub">${tab==='ward'?_T('Nothing for the Ward — he is not wounded.'):_T('Nothing for the Baths.')}</p>`}</div></section>`;
    void wkCount;void bkCount}
  const room=document.createElement('div');room.className='w104 iv90';room.innerHTML=list+(mid||'')+(plates||'')+w104Tabula(w,pm,sel);
  if(hy){hy.classList.add('v101hy');room.querySelector('.w104house').appendChild(hy)}
  if(!room.querySelector('.w104house').childNodes.length)room.querySelector('.w104house').remove();
  old.replaceWith(room);
  const fx=MGR.v101fx&&Date.now()-MGR.v101fx.t<2500?MGR.v101fx:null;if(fx)for(const b of room.querySelectorAll('.v104pl'))if(b.dataset.v104p===fx.k||(fx.k==='rest'&&b.dataset.v104p==='rest'))b.classList.add('v101fx')}
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-w104t]');if(!b||!b.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();MGR.w104t=b.dataset.w104t;if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* the care guide: the hours and the Baths */
if(typeof careGuideHTML==='function'){const base=careGuideHTML;careGuideHTML=function(){const h=base.apply(this,arguments);try{const w=w104Live();if(!w||typeof h!=='string')return h;const pm=me();
  const add=`<p class="rc-sub w104cg" style="margin:4px 0">${_T`<b>${mh101Max(pm,w)}</b> Medicus hours this week: ${CARE101.base+W104.med} a week, +${CARE101.valet} for each Valetudinarium level, +${CARE101.medicus} for each skill level of a house medicus. ♨ THE BATHS take weariness down from the same hours: a rub-down ${W104.rub} h (−10 fatigue now), the Care routine ${W104.care} h a week (−${FAT_CARE90} when each week ends), a Rest week 0 h (no bouts, −${FAT_REST}).`}</p>`;
  return h.replace(/(<\/summary>)/,`$1${add}`)}catch(e){return h}}}
try{if(typeof ROUT87_SUB!=='undefined')ROUT87_SUB.care=_T('1 Medicus hour a week, in the Infirmary’s Baths')}catch(e){}

/* ============================== the final pass over the Manager page ============================== */
function w104Recruit(R,w,pm){if(w.tutorial)return;const box=R.querySelector('.pipeline .sect .rc-sub');const n=bd104Favs(w).length,cap=bd104Cap(w);
  if(box&&!box.querySelector('.bd104')){box.insertAdjacentHTML('afterbegin',`<b class="bd104${n>=cap?' full':''}" title="${esc(_T('Your board holds 6 + the Recruiter’s level'))}">${_T`📌 ${n}/${cap}`}</b> · `)}
  for(const c of R.querySelectorAll('.pipeline .pcard[data-id]')){const g=gById(c.dataset.id);if(of104Of(w,g)&&!c.querySelector('.of104c'))c.insertAdjacentHTML('beforeend',`<span class="of104c" title="${esc(_T('Offer on the table — the answer comes when the week ends'))}">✍</span>`)}
  for(const b of R.querySelectorAll('[data-mg="offer"]')){const g=gById(String(b.dataset.id||MGR.sel||'').split('|')[0]);if(!g||g.contract)continue;const o=of104Of(w,g);const sc=of104Scared(w,g);
    if(o){b.setAttribute('disabled','');b.title=_T('Offer on the table — the answer comes when the week ends');b.classList.add('of104on');
      b.insertAdjacentHTML('afterend',`<div class="of104box">${_T`✍ <b>On the table:</b> ${o.wage}/wk for ${o.weeks} weeks${o.bonus?_T`, ${o.bonus} bonus`:''} — he answers when the week ends.`} <button class="btn tksm" type="button" data-of104x="${g.id}">${_T`Withdraw`}</button></div>`)}
    else if(sc!=null){b.setAttribute('disabled','');b.title=_T`Insulted — no talks until ${wkName(sc+1)}`}
    else if(w104Live()&&!b.querySelector('.of104n'))b.insertAdjacentHTML('beforeend',`<small class="of104n">${_T`answered next week`}</small>`)}}
function w104Ludus(R,w,pm){const b=bp104Of(pm);const ch=R.querySelector('.lu100ban .lst91');if(b&&ch&&!ch.querySelector('.bp104c'))ch.insertAdjacentHTML('afterbegin',`<span class="bp104c" title="${esc(_T('One building project at a time'))}">${bp104Line(pm,w)}</span>`);
  const t=mq104Warn(w,pm);const ban=R.querySelector('.lu100ban');if(t&&ban&&!R.querySelector('.mq104w'))ban.insertAdjacentHTML('afterend',mq104WarnHTML(w,pm))}
function w104Night(R,w,pm){const t=mq104Warn(w,pm);if(!t)return;const pane=R.querySelector('#mgrPane');const hd=pane&&pane.querySelector(':scope>.roomhd');if(hd&&!R.querySelector('.mq104w'))hd.insertAdjacentHTML('afterend',mq104WarnHTML(w,pm))}
{const base=mgrHTML;mgrHTML=function(){const w0=w104Live();if(w0)try{bd104Sync(w0)}catch(e){}const h=base.apply(this,arguments);try{const w=w104UI();if(typeof h!=='string'||!w||MGR.view)return h;const pm=me();if(!pm)return h;const tab=MGR.tab;
  if(!['infirm','practice','recruit','ludus','night'].includes(tab)&&!/data-mg="offer"/.test(h))return h;
  const T=document.createElement('template');T.innerHTML=h;const R=T.content;
  if(tab==='infirm')w104Page(R,w,pm);
  else if(tab==='practice'){for(const x of R.querySelectorAll('.v101rec2'))x.remove()}
  else if(tab==='ludus')w104Ludus(R,w,pm);
  else if(tab==='night')w104Night(R,w,pm);
  w104Recruit(R,w,pm);
  return T.innerHTML}catch(e){console.error(e);return h}}}

/* ---------- the look ---------- */
(()=>{const st=document.createElement('style');st.id='v104dcss';st.textContent=`
.roomhd.w104ban{flex-wrap:wrap;gap:10px}
.w104hb{position:relative;z-index:2;margin-left:auto;min-width:260px;max-width:420px;flex:1 1 260px;background:#140c07f2;border:1px solid #c9a46a88;border-radius:8px;padding:5px 9px;display:grid;gap:3px}
.w104hbt{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#f3e3bd}.w104hbt b{font-weight:600}
.w104bar{height:10px;border-radius:5px;background:#3a2c1e;border:1px solid #6b5236;display:flex;overflow:hidden}.w104bar i{display:block;height:100%}
.w104bar i.k104wc,.w104hbl .k104wc::before{background:#c8553f}.w104bar i.k104rc,.w104hbl .k104rc::before{background:#5fa3a8}
.roomhd .w104hbl{display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:#e8d6b0}.roomhd .w104hbl span{display:inline-flex!important;align-items:center;white-space:nowrap;font-size:11px;position:static}.w104hbl span::before{content:"";display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:4px;vertical-align:0}.w104hbl .k104lf::before{background:#3a2c1e;border:1px solid #6b5236}
.w104bx{position:relative;z-index:2;display:flex;flex-direction:column;gap:4px}.w104bx .v101med{font-size:12px;white-space:nowrap;color:#f3e3bd;background:#140c07c0;border:1px solid #c9a46a88;border-radius:7px;padding:3px 8px}.w104bx .v101why{margin:0}
.w104{display:grid;grid-template-columns:minmax(250px,290px) minmax(280px,340px) minmax(0,1fr);grid-template-areas:"list mid pl" "list tab tab";gap:10px;align-items:start;margin-top:8px}
.w104>.w104list{grid-area:list}.w104>.w104mid{grid-area:mid}.w104>.w104pl{grid-area:pl}.w104>.w104tab{grid-area:tab}
.w104list{display:grid;gap:8px;align-content:start}.w104lh{font-size:12px;color:#e8d6b0}
.w104grp{border:1px solid #4a3826;border-radius:8px;background:#1b130d;padding:4px}.w104gt{font:600 11px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:#c9a46a;padding:4px 6px;display:flex;justify-content:space-between;cursor:default}
.w104grp.wd .w104gt{color:#e8907e}.w104grp.wy .w104gt{color:#8fc3c7}details.w104grp>summary{cursor:pointer;list-style:none}details.w104grp>summary::-webkit-details-marker{display:none}
.w104r{display:flex;align-items:center;gap:4px}.w104r>.v101out{flex:none;font-size:11px;padding:2px 6px;white-space:nowrap}
.w104row{flex:1;min-width:0;display:grid;grid-template-columns:26px minmax(0,1fr) 54px;grid-auto-flow:row;gap:2px 6px;align-items:center;text-align:left;background:none;border:1px solid transparent;border-radius:6px;padding:4px 6px;color:inherit;cursor:pointer;font:inherit}
.w104row:hover{background:#2a1d13}.w104row.on{background:#3a2a18;border-color:#d6ab4c}.w104row .iv90f{grid-row:span 2}.w104row .iv90n{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.w104row .iv90bs{display:grid;gap:2px}.w104row .iv90c{grid-column:2/4;font-size:11px;display:flex;gap:4px;align-items:center}.w104row .iv90c small{font-size:10.5px;opacity:.8}
.w104row .trt103,.w104row .rst104{grid-column:2/4;justify-self:start;font:600 10.5px var(--sans,system-ui);border-radius:9px;padding:0 7px;white-space:nowrap}
.w104row .trt103{color:#bfe3a6;background:rgba(63,110,52,.35);border:1px solid #5d9a4c}.w104row .rst104{color:#bfe6ea;background:rgba(52,96,110,.35);border:1px solid #5d929a}
.w104row .trt103+.rst104{grid-column:auto}
.w104mid{display:grid;gap:8px}.w104who{display:grid;grid-template-columns:64px minmax(0,1fr);gap:8px;align-items:center}.w104who .rm100por{width:64px;height:64px}
.w104stat{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;align-items:start}.w104niche .iv90av svg{max-height:260px}.w104side{display:grid;gap:6px;align-content:start}
.w104g{border:1px solid #4a3826;border-radius:8px;padding:6px 8px;background:#1f1711}.w104gh{font-size:12.5px;display:flex;gap:6px;align-items:center}
.w104gb{position:relative;display:flex;height:16px;margin:6px 0 2px;border-radius:4px;overflow:visible}.w104gb .z{font-size:9.5px;display:grid;place-items:center;color:#1b130d;font-weight:600}
.w104gb .fresh{width:30%;background:#8fbf6a;border-radius:4px 0 0 4px}.w104gb .tired{width:30%;background:#d9b24e}.w104gb .worn{width:40%;background:#c8553f;border-radius:0 4px 4px 0}
.w104gb i{position:absolute;top:-4px;bottom:-4px;width:3px;margin-left:-1px;background:#fff3d6;box-shadow:0 0 3px #000}.w104gb i.nx{background:#5fe0ea;border-radius:2px}
.w104gn{font-size:11.5px;color:#cfe3e6}
.w104pl{display:grid;gap:6px;align-content:start}.w104tabs{display:flex;gap:4px;border-bottom:1px solid #6b5236}
.w104t{font:600 13px var(--sans,system-ui);padding:6px 12px;border:1px solid #6b5236;border-bottom:none;border-radius:8px 8px 0 0;background:#1b130d;color:#e8d6b0;cursor:pointer}.w104t.on{background:#3a2a18;color:#fff3d6;border-color:#d6ab4c}.w104t i{color:#d6ab4c;font-style:normal}
.w104plates{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.w104plates .v104pl{position:relative;display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto 1fr;box-sizing:border-box;padding:0!important;text-align:left;border:1px solid #6b5236;border-radius:8px;background:#21170f;color:inherit;cursor:pointer;overflow:hidden;min-height:0;width:auto!important}
.w104plates .v104pl .rm100fr{display:block;height:74px;position:relative;overflow:hidden}.w104plates .v104pl .rm100pic,.w104plates .v104pl .rm100pic img{width:100%;height:100%;object-fit:cover;display:block}
.v104pb{display:grid;gap:2px;padding:6px 8px 8px;font-size:12px}.v104pb b{font-size:13px;color:#fff3d6}.v104ph{font:600 11.5px var(--mono,monospace);color:#f0cf7d}.v104fx{color:#e8d6b0;line-height:1.3}.v104why{color:#e8a08e;font-size:11px;line-height:1.25}
.w104plates .v101star{position:absolute;top:4px;left:4px;z-index:3}.w104plates .v104pl.off,.w104plates .v104pl[disabled]{opacity:.62;cursor:default}.w104plates .v104pl.on{border-color:#7fae5f!important}
.w104tab .w104wax{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:12px}.w104c{display:grid;gap:4px;align-content:start}
.w104bk,.w104q{margin:0;padding-left:18px;font-size:12.5px;display:grid;gap:2px}.w104q li.rec{color:#f0cf7d}.w104hl{font-size:12.5px}
.mq104w{grid-column:1/-1;margin:6px 0;padding:6px 10px;border:1px solid #e07a6a;border-radius:8px;background:#3a1a12;color:#ffd6c8;font-size:13px}
.of104box{margin:6px 0;padding:6px 8px;border:1px dashed #c9a46a;border-radius:7px;font-size:12.5px}.of104n{display:block;font-size:10.5px;opacity:.85}.of104c{position:absolute;right:4px;bottom:4px;font-size:12px}
.bd104{color:#f0cf7d}.bd104.full{color:#ffb4a6}.bp104c{display:inline-block;margin-right:6px;padding:1px 8px;border:1px solid #d6ab4c;border-radius:9px;background:#2a1a0ecc;font-size:11.5px;color:#f3e3bd}
.bp104g{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;margin-top:4px}
.lu2r.bp104t{display:grid!important;grid-template-columns:1fr!important;gap:6px;border:1px solid #6b5236;border-radius:8px;padding:8px;background:#21170f;align-items:start}
.lu2r.bp104t.can{border-color:#d6ab4c}.lu2r.bp104t.bld{border-color:#7fae5f}.bp104h{display:flex;justify-content:space-between;gap:6px;align-items:center}
.bp104pair{display:grid;grid-template-columns:1fr 18px 1fr;gap:4px;align-items:center}.bp104pair figure{margin:0;display:grid;gap:3px}.bp104pair figcaption{font-size:11px;color:#e8d6b0;line-height:1.25}
.bp104arr{color:#d6ab4c;text-align:center;font-weight:700}
.bp104a{position:relative;display:block;height:78px;border-radius:6px;overflow:hidden;border:1px solid #6b5236}.bp104a img,.bp104a .bp104im{width:100%;height:100%;object-fit:cover;display:block}
.bp104a.nx{border:1px dashed #d6ab4c}.bp104l0 img{filter:grayscale(1) brightness(.45)}.bp104l1 img{filter:sepia(.6) saturate(.65) brightness(.82)}.bp104l2 img{filter:saturate(1)}
.bp104l3 img{filter:saturate(1.25) contrast(1.06)}.bp104l3{box-shadow:inset 0 0 0 2px #f0cf7d,0 0 8px #f0cf7d66}
.bp104plot{position:absolute;inset:auto 0 0 0;text-align:center;font-size:10.5px;color:#e8d6b0;background:#000a;padding:1px 0}
.bp104lv{position:absolute;top:3px;left:3px;font:600 10px var(--mono,monospace);background:#d6ab4c;color:#2a1708;border-radius:6px;padding:0 5px}
.bp104f{display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:space-between}.bp104why{flex-basis:100%;color:#e8a08e;font-size:11px}.bp104bld{font-size:12px;color:#b8e6a0}
.pr104g{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}.pr104t{display:grid!important;grid-template-rows:auto 1fr;padding:0!important;overflow:hidden;text-align:left}
.pr104t .pr104a{display:block;height:70px;overflow:hidden}.pr104t .pr104a img{width:100%;height:100%;object-fit:cover;display:block}.pr104t>small,.pr104t{white-space:normal}
@media (max-width:1180px){.w104{grid-template-columns:minmax(230px,270px) minmax(0,1fr);grid-template-areas:"list mid" "list pl" "tab tab"}}
@media (max-width:760px){.w104{grid-template-columns:minmax(0,1fr);grid-template-areas:"list" "mid" "pl" "tab"}.w104tab .w104wax{grid-template-columns:1fr}
  #mgrBody .roomhd.w104ban{height:auto!important;min-height:0!important;flex-wrap:wrap!important}.roomhd.w104ban .roomttl{flex:1 1 0;min-width:0}.roomhd.w104ban .w104hb{order:5;flex:1 1 100%;margin-left:0;max-width:none;min-width:0}.roomhd.w104ban .w104bx{order:6;flex-direction:row;flex-wrap:wrap}
  .w104stat{grid-template-columns:130px minmax(0,1fr)}.w104niche .iv90av svg{max-height:190px}.w104plates{grid-template-columns:repeat(2,minmax(0,1fr))}.bp104g{grid-template-columns:1fr}}`;document.head.appendChild(st)})();
}

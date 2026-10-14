/* =====================================================================
   249-V98REC · v0.98 part D — RECRUITING III + ADVISOR LEVELS + HOUSE GRADES (Virgilante's notes 2026-10-07/08)
   =====================================================================
   Manager only, offline. UI randomness is hashed (hashStr of world · recruit · stat · week) — never the dice RNG.
   1 · GRADES, NOT NUMBERS. A free agent's five ratings (spd str int lck cha) show as letter-grade blocks (trait96Grade cut-offs
       A+92 A85 B+78 B70 C+62 C54 D44 F) that start "?"; hover = what the grade means + how sure. His overall is the street's word
       ("~B", from the public rating) until all five are graded, then your recruiter's estimate. No rating number before signing:
       estOvr (list, board tablets, card head, letters), ratingsHTML (66/157: replaced for free agents), the compare panel
       (recCmpHTML replaced), the card's "potential", the ludus guide line, Vulso's cart, pay-to-join, the city's sale list.
   2 · THE RECRUITER'S HOURS. REC98.hrs (20) a week at Recruiter level 1, +REC98.perLv (4) a level; ≤ REC98.cap (8) on one recruit
       a week; each action once per recruit a week (w.rh98 = {wk,n}; per recruit g.sc98.h = {wk,n}):
         🍺 Ask around the forum 1 h — one rough grade (a stat not yet graded, hashed pick)
         👁 Watch him train 2 h — Speed + Strength to a fair read
         🍷 Share a cup 2 h — Intelligence + Charisma to a fair read
         📜 Study his bouts 3 h — every grade one step sharper, Luck to a fair read at least
         ⚔ Trial bout 5 h + REC98.acts.trial.coin — everything sure, +6–10 interest, a small (7%) chance he takes a bruise
       Knowledge g.sc98 = {p:{k:0 none|1 rough|2 fair|3 sure}, s:{k:week sharpened}, a:{action:week}, h:{wk,n}}.
       rec98Sync keeps the old g.scout in step: all five graded → g.scout 2 (personality, wants, motives revealed — every older
       reader of g.scout keeps working), all sure → 3; an older path that raises g.scout (a live watch, exhibitions, the old sparring
       Scout, signing) raises every precision to it.
   3 · ESTIMATES. rec98Est(g,k) = the true rating + a hashed normal noise of REC98.sig[p] × REC98.lvK[Recruiter level] — an A may be
       91 or really a B+. Stable until the precision, the level or the week it was sharpened changes. Rivals court with the same
       estimates (rec98Rival: precision from Cunning, level REC98.rivalLv; direct edit in 17-manager cpuLeagueWeek).
   4 · PERSONALITY when all five are graded: temper (persTags73), his wants (157 WANTS88), what he cares about (motives) and — for
       about 6 in 10 — a DEALBREAKER on one house grade (DEAL98: a greedy house, no honor, no training, nobody watching, a gambler).
       A broken dealbreaker makes him ask REC98.deal (×1.25) of his wage before he signs (offerVerdict wrapper), revealed or not.
   5 · COURT = the house grades. The lanista traits ARE the public grades (231 trait96Grade). PITCH98: six pitches, each tied to a
       trait, a want and a motive — 🏋 Show him the Training Yard (Discipline · rudis path · training), 🍷 Dine at the lanista's table
       (Showmanship · a friend · spectacle), ⚔ Promise him the sand (Risk · arena time · playing), ⚕ Tour the infirmary (Honor ·
       honor), 🏆 Meet your champion (Ambition · fame · glory), 💰 Talk terms with the Clerk (Cunning · coin · coin). Gain = REC98.pitch
       by the trait's grade (A+ 9 … F −2), ×2 when it answers one of his wants (counted even unrevealed — the card only promises what
       you know), + motive weight × 10, + the Broker's +3; one pitch per recruit a week and the old PITCH_MAX a week (recMark /
       w.pitchN). Projections: the Yard ("with our Doctore his Strength B could reach B+"), the champion (who he would train beside).
       Rival counter-bids (157 g.court88) unchanged; OFFER (step 3) unchanged.
   6 · THE TRUTH: signing a recruit snapshots what your recruiter believed (signGlad wrapper, g.truth98) — the sign card gets a
       "The truth" block: each rating's scouted grade vs the real grade + number, ▲ / ▼ / ✓.
   7 · THE CARD (detailHTML, last wrapper for free agents): head · the grade strip (always visible) · ① Scout (hours, five actions,
       personality) · ② Court (house grades, pitches, feast/gift, suitors, notes) · ③ Offer (as before). Board tablets' next step =
       the next useful action (nextStep wrapper). The Recruiting banner shows the recruiter's hours (tabStat73 wrapper).
   8 · ADVISOR LEVELS. Every council advisor (w.council83[i].lv, 1–REC98.lvMax 5): a new house 1, an Easy start 2, a taken-over
       house 2 or 3 (3 when its fame was 40+). Rising = hiring for coin (my pick: the smallest clean mechanism — no perk tree
       change): "⬆ Train" on the Recruiter's council card, REC98.up coin a level ([data-c98up]). In v0.98 only the Recruiter's level
       has effects (hours + accuracy); the others show their level.
   9 · SAVE_MIGRATIONS '0.98': levels on old councils (1, or 2–3 for a house taken over from the league), old scouting mapped to
       precisions (g.scout 1/2/3 → rough/fair/sure on all five; "watched" ratings rough). Saved once (w._rec98dirty).
   Test: tools/tests/tv98d.js
   ===================================================================== */
/* TWEAK: hours, noise, costs, pitch weights */
const REC98={hrs:20,perLv:4,cap:8,lvMax:5,
  sig:[0,9,4.5,1.6],lvK:[0,1,.8,.62,.45,.3],
  acts:{ask:{h:1,ic:'🍺'},watch:{h:2,ic:'👁',st:['spd','str']},cup:{h:2,ic:'🍷',st:['int','cha']},study:{h:3,ic:'📜'},trial:{h:5,ic:'⚔',coin:4,inj:.07}},
  order:['ask','watch','cup','study','trial'],
  up:[0,60,120,200,320],coinMax:2,
  pitch:{'A+':9,A:8,'B+':7,B:6,'C+':4,C:3,D:1,F:-2},wantX:2,motX:10,
  deal:1.25,dealP:6,rivalLv:2};
const REC98_ACT_L=g=>({ask:[_T('Ask around the forum'),_T('one rough grade')],watch:[sx(g,_T('Watch him train'),_T('Watch her train')),_T('Speed · Strength')],cup:[_T('Share a cup'),_T('Intelligence · Charisma')],study:[sx(g,_T('Study his bouts'),_T('Study her bouts')),_T('every grade sharper · Luck')],trial:[_T('Trial bout'),_T('everything sure · interest')]});
const REC98_SURE=()=>[_T('not graded yet'),_T('a rough guess — could be a grade or two off'),_T('a fair read — maybe one step off'),_T('sure — your recruiter would bet on it')];
const REC98_MEAN=()=>({'A+':_T('among the very best in the empire'),A:_T('elite'),'B+':_T('very good'),B:_T('good'),'C+':_T('decent'),C:_T('ordinary'),D:_T('weak'),F:_T('poor')});
const rec98G=v=>trait96Grade(v);

/* ---------- advisor levels ---------- */
function adv98Lv(w,k){w=w||W_();if(!w)return 1;const C=council83(w);const a=C.find(x=>x.k===(k||'recruiter'));return clamp((a&&a.lv)||1,1,REC98.lvMax)}
function adv98Start(w,lv){if(!w)return;for(const a of council83(w))if(!a.lv)a.lv=lv}
function adv98StartLv(choice,pm){try{if(choice&&choice.type==='pre'){const t=MGR_PRE.find(x=>x.key===choice.key);return t&&(t.fame||0)>=40?3:2}
  if(choice&&choice.type==='custom')return (choice.mgr&&choice.mgr.diff)==='easy'?2:1}catch(e){}return 1}
{const base=newWorld;newWorld=function(choice){const r=base.apply(this,arguments);try{const w=W_();if(w&&!w.dead){council83Ensure(w);for(const a of council83(w))delete a.lv;adv98Start(w,adv98StartLv(choice));w._rec98dirty=1}}catch(e){console.error(e)}return r}}
function adv98Up(k){const w=W_(),m=me();if(!w||!m)return {ok:false};const a=council83(w).find(x=>x.k===k);if(!a)return {ok:false};const lv=a.lv||1;
  if(lv>=REC98.coinMax)return {ok:false,why:lv>=REC98.lvMax?_T('Already as good as they come.'):_T('Coin teaches up to level 2 — the rest is earned by deeds.')};const c=REC98.up[lv];if((m.coin||0)<c)return {ok:false,why:_T('Not enough coin.')};
  m.coin-=c;a.lv=lv+1;return {ok:true,lv:a.lv,c}}
{const base=council83HTML;council83HTML=function(){let h=base.apply(this,arguments);try{const w=W_(),m=me();if(!h||!w||!m)return h;
  for(const a of council83(w)){const lv=a.lv||1;const up=!w.tutorial&&lv<REC98.coinMax?`<button class="btn tksm c98up" type="button" data-c98up="${a.k}" ${(m.coin||0)<REC98.up[lv]?dis88(_T('Not enough coin.')):''} title="${esc(a.k==='recruiter'?_T`More hours a week and sharper grades (${REC98.hrs+REC98.perLv*lv} h)`:_T('Coin teaches up to level 2'))}">${_T`⬆ Train · ${coinAmt87(REC98.up[lv])}`}</button>`:(typeof adv98EvHTML==='function'?adv98EvHTML(w,a):'');
    h=h.replace(new RegExp(`(<div class="c83p" data-c83="${a.k}">[\\s\\S]*?)(</div>)`),(x,p,e)=>`${p}<span class="c98lv" title="${esc(_T('Advisor level'))}">${_T`Lv ${lv}`}</span>${up}${e}`)}}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-c98up]');if(!b||b.disabled)return;e.preventDefault();e.stopPropagation();
  const r=adv98Up(b.dataset.c98up);if(!r.ok){if(r.why&&typeof mToast==='function')mToast(esc(r.why));return}const a=council83(W_()).find(x=>x.k===b.dataset.c98up);
  tnews(_T`⬆ ${esc(a.name)} (${esc(a.role)}) trains up to level ${r.lv}.`);if(typeof mToast==='function')mToast(_T`⬆ ${esc(a.name)} is now level ${r.lv}.`);saveWorld();MGR_REDRAW()},true);

/* ---------- knowledge, hours, estimates ---------- */
function rec98Mine(g){try{const m=me();return !!(g&&g.contract&&m&&g.contract.mgr===m.id)}catch(e){return false}}
function rec98Sync(g,K){const sc=Math.min(3,g.scout||0);if(sc>(K.sc||0))for(const [k] of STATS)if((K.p[k]||0)<sc){K.p[k]=sc;if(K.s[k]==null)K.s[k]=0} /* an older path raised g.scout */
  const all=STATS.every(([k])=>K.p[k]>=1),sure=STATS.every(([k])=>K.p[k]>=3);const d=sure?3:all?2:0;if(d>(g.scout||0))g.scout=d;K.sc=g.scout||0}
function rec98K(g){if(!g)return null;let K=g.sc98;if(!K||typeof K!=='object'||!K.p)K=g.sc98={p:{},s:{},a:{},h:null};K.s=K.s||{};K.a=K.a||{};
  for(const [k] of STATS)if(K.p[k]==null)K.p[k]=0;rec98Sync(g,K);return K}
function rec98HrsMax(w){return REC98.hrs+REC98.perLv*(adv98Lv(w)-1)}
const rec98Used=w=>w&&w.rh98&&w.rh98.wk===w.week?w.rh98.n:0;
const rec98Left=w=>Math.max(0,rec98HrsMax(w)-rec98Used(w));
function rec98On(g,w){const K=rec98K(g);return K.h&&K.h.wk===w.week?K.h.n:0}
function rec98U(seed){const h=hashStr(seed);const u=i=>((Math.imul((h^Math.imul(i,0x9e3779b9))>>>0,2654435761)>>>0)%10007)/10006;return u}
/* a normal-ish draw, sd 1, bounded ±3 */
function rec98Noise(seed){const u=rec98U(seed);return (u(1)+u(2)+u(3)-1.5)*2}
const rec98Sig=(p,lv)=>p>0?REC98.sig[Math.min(3,p)]*REC98.lvK[clamp(lv,1,REC98.lvMax)]:99;
function rec98Est(g,k){if(!g)return null;const st=gStats(g);if(!st)return null;if(rec98Mine(g))return {v:st[k],p:3,lv:REC98.lvMax,g:rec98G(st[k]),exact:true};
  const K=rec98K(g);const p=K.p[k]||0;if(!p)return null;const w=W_();const lv=adv98Lv(w);
  const v=clamp(Math.round(st[k]+rec98Noise(`rec98:${w&&w.id}:${g.id}:${k}:${p}:${lv}:${K.s[k]||0}`)*rec98Sig(p,lv)),STAT_MIN,STAT_MAX);return {v,p,lv,g:rec98G(v)}}
function rec98Ovr(g){const K=rec98K(g);const minP=Math.min(...STATS.map(([k])=>K.p[k]||0));const w=W_();
  if(minP>=1){const lv=adv98Lv(w);const v=clamp(Math.round(effOvr(g)+rec98Noise(`rec98o:${w&&w.id}:${g.id}:${minP}:${lv}`)*rec98Sig(minP,lv)),25,99);return {v,txt:rec98G(v),p:minP}} /* i18n:skip */
  const v=pubOvr(g);return {v,txt:'~'+rec98G(v),p:0}}
/* the street's word for a fighter nobody has scouted (Vulso's cart, the city, pay-to-join) */
const rec98PubG=g=>rec98G(pubOvr(g));
{const base=estOvr;estOvr=function(g){try{if(g&&!g.contract&&W_()){const o=rec98Ovr(g);return {v:o.v,txt:o.txt}}}catch(e){console.error(e)}return base.apply(this,arguments)}}
/* rivals court with estimates too: their read of a free agent's overall */
function rec98Rival(m,g){try{const w=W_();if(!m||!g||g.contract)return effOvr(g);const p=Math.min(3,(typeof ADV98R!=='undefined'?ADV98R.pBase:1)+((m.p&&m.p.cunning)>=50?1:0)+((m.p&&m.p.cunning)>=80?1:0));
  return clamp(Math.round(effOvr(g)+rec98Noise(`rec98r:${w&&w.id}:${m.id}:${g.id}:${w&&w.week}`)*rec98Sig(p,typeof advLvM==='function'?advLvM(m,'recruiter'):REC98.rivalLv)),25,99)}catch(e){return effOvr(g)}} /* i18n:skip */

/* ---------- the five actions ---------- */
function rec98Gain(g,a){const K=rec98K(g);const P=K.p;const out=[];const add=(k,t)=>{t=Math.min(3,t);if(t>(P[k]||0))out.push([k,P[k]||0,t])};const w=W_();
  if(a==='ask'){const un=STATS.map(x=>x[0]).filter(k=>!P[k]);if(un.length)add(un[hashStr(`rec98a:${w&&w.id}:${g.id}:${w&&w.week}`)%un.length],1)}
  else if(a==='watch'||a==='cup'){for(const k of REC98.acts[a].st)add(k,2)}
  else if(a==='study'){for(const [k] of STATS)add(k,k==='lck'?Math.max(2,(P[k]||0)+1):(P[k]||0)+1)}
  else if(a==='trial'){for(const [k] of STATS)add(k,3)}
  return out}
function rec98Can(g,a){const w=W_(),m=me();const A=REC98.acts[a];if(!A||!g||!w||!m||g.contract||g.alive===false)return [false,''];const K=rec98K(g);
  if(K.a[a]===w.week)return [false,_T('Once a week for each recruit.')];
  if(!rec98Gain(g,a).length)return [false,_T('Nothing more to learn this way.')];
  if(rec98Left(w)<A.h)return [false,_T`Your recruiter has ${rec98Left(w)} h left this week.`];
  if(rec98On(g,w)+A.h>REC98.cap)return [false,_T`At most ${REC98.cap} h of your recruiter's week on one recruit.`];
  if(A.coin&&(m.coin||0)<A.coin)return [false,_T('Not enough coin.')];
  return [true,'']}
function rec98Act(g,a){const [ok,why]=rec98Can(g,a);if(!ok)return {ok:false,why};const w=W_(),m=me();const A=REC98.acts[a];const K=rec98K(g);const before=g.scout||0;
  const gain=rec98Gain(g,a);for(const [k,,t] of gain){K.p[k]=t;K.s[k]=w.week}
  K.a[a]=w.week;K.h={wk:w.week,n:rec98On(g,w)+A.h};w.rh98={wk:w.week,n:rec98Used(w)+A.h};
  try{if(typeof clk87Used==='function')w.clk87={wk:w.week,n:clk87Used(w)+A.h}}catch(e){}
  if(A.coin)m.coin-=A.coin;let bump=0,hurt=false;
  if(a==='trial'){bump=6+hashStr(`rec98t:${w.id}:${g.id}:${w.week}`)%5;const b0=interestOf(g,m);g.interest[m.id]=capInterest(g,m,b0+bump);bump=g.interest[m.id]-b0;
    if(!g.inj&&(hashStr(`rec98i:${w.id}:${g.id}:${w.week}`)%1000)/1000<A.inj){g.inj={until:w.week+1,label:_T('a bruise from the trial bout'),pen:2};hurt=true}
    ghist(g,_T`fought a trial bout on ${esc(m.ludus)}'s sand`)}
  rec98Sync(g,K);return {ok:true,gain,revealed:before<2&&(g.scout||0)>=2,bump,hurt}}
function rec98Say(g,a,r){const L=REC98_ACT_L(g)[a][0];const gs=r.gain.map(([k])=>{const e=rec98Est(g,k);const n=(STATS.find(x=>x[0]===k)||[])[1]||k;return `${n} ${e?e.g:'?'}`}).join(' · ');
  return `${REC98.acts[a].ic} ${esc(L)} — ${esc(g.name)}: ${esc(gs)}${r.bump?_T` · interest +${r.bump}`:''}${r.hurt?sx(g,_T(' · he took a bruise'),_T(' · she took a bruise')):''}${r.revealed?sx(g,_T(' · all five graded: his personality is on the card.'),_T(' · all five graded: her personality is on the card.')):'.'}`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rec98a]');if(!b)return;e.preventDefault();e.stopPropagation();if(b.disabled)return;
  const g=gById(b.dataset.id);const a=b.dataset.rec98a;if(!g)return;const r=rec98Act(g,a);if(!r.ok){if(r.why&&typeof mToast==='function')mToast(esc(r.why));return}
  const msg=rec98Say(g,a,r);tnews(msg);MGR.msg=msg;if(typeof mToast==='function')mToast(msg);saveWorld();MGR_REDRAW()},true);
function rec98Next(g){for(const a of ['watch','cup','study','ask','trial'])if(rec98Can(g,a)[0])return a;return REC98.order.find(a=>rec98Gain(g,a).length)||null}
function rec98Btn(g,a,cls){const [ok,why]=rec98Can(g,a);const A=REC98.acts[a];const [l,sub]=REC98_ACT_L(g)[a];const tiny=/\btksm\b/.test(cls||'');
  return `<button class="btn ${cls||''}" type="button" data-rec98a="${a}" data-id="${g.id}" ${ok?'':dis88(why)} title="${esc(sub)}">${A.ic} ${esc(l)}<small>⏳${A.h} h${A.coin?' · '+coinAmt87(A.coin):''}${tiny?'':' · '+esc(sub)}</small></button>`}

/* ---------- personality + dealbreakers ---------- */
const DEAL98=[{k:'greed',t:'greed',bad:v=>v>=78,txt:()=>_T('Won’t sign with a greedy house (Greed B+ or higher)')},{k:'honor',t:'honor',bad:v=>v<54,txt:()=>_T('Won’t serve a lanista without honor (Honor below C)')},
  {k:'disc',t:'discipline',bad:v=>v<54,txt:()=>_T('Wants a house that trains (Discipline C or better)')},{k:'show',t:'show',bad:v=>v<54,txt:()=>_T('Won’t fight where nobody watches (Showmanship C or better)')},
  {k:'risk',t:'risk',bad:v=>v>=85,txt:()=>_T('Won’t fight for a gambler (Risk A or higher)')}];
function rec98Deal(g){if(!g||!g.id)return null;const h=hashStr('deal98:'+g.id);if(h%10>=REC98.dealP)return null;return DEAL98[(h>>>5)%DEAL98.length]}
function rec98DealHit(g,m){const D=rec98Deal(g);return D&&m&&m.p&&D.bad(m.p[D.t]||0)?D:null}
{const base=offerVerdict;offerVerdict=function(g,wage,weeks,bonus,pledge){const v=base.apply(this,arguments);try{const m=me();if(v&&v.ok&&g&&!g.contract&&m){const D=rec98DealHit(g,m);
  const eff=wage+(bonus||0)/Math.max(1,weeks||1);const need=Math.ceil(askWage(g)*REC98.deal*((typeof pk87==='function'&&pk87('br2'))?0.9:1));
  if(D&&eff<need)return {ok:false,why:(g.scout||0)>=2?sx(g,_T`${g.name} balks: ${D.txt()}. Only about ${need} coin a week would make him overlook it.`,_T`${g.name} balks: ${D.txt()}. Only about ${need} coin a week would make her overlook it.`):sx(g,_T`Something about your house bothers ${g.name}. About ${need} coin a week would settle it — or grade him to learn what.`,_T`Something about your house bothers ${g.name}. About ${need} coin a week would settle it — or grade her to learn what.`)}}}catch(e){console.error(e)}return v}}
function rec98PersHTML(g,m){const K=rec98K(g);const n=STATS.filter(([k])=>K.p[k]>=1).length;
  if((g.scout||0)<2)return `<div class="pe98 lock"><b>${_T`🔒 Personality`}</b><span class="rc-sub">${sx(g,_T`Grade all five ratings to read him — wants, temper, dealbreakers.`,_T`Grade all five ratings to read her — wants, temper, dealbreakers.`)} (${n}/5)</span></div>`;
  const tags=typeof persTags73==='function'?persTags73(g):[];const W=typeof wants88==='function'?wants88(g):[];const D=rec98Deal(g);const hit=D&&rec98DealHit(g,m);
  const wants=W.map(k=>{const [,ic,nm]=want88Def(k);const ok=want88Fits(g,m,k,null);return `<span class="want88 ${ok?'ok':''}" data-w98="${k}" title="${esc(ok?_T('Your house answers this now'):want88How(g,k))}">${ic} ${esc(nm)}${ok?' ✓':''}</span>`}).join(' ');
  const mot=(g.motives||[]).map(([k,wt])=>MOTIVES[k]?`<span class="mo98">${esc(MOTIVES[k][0])} <i>${Math.round(wt*100)}%</i></span>`:'').join(' ');
  return `<div class="pe98"><div class="sect" style="margin-top:4px">${_T`🎭 Personality`}</div>
    <div class="pe98r"><span class="pe98l">${_T`Temper`}</span>${tags.map(t=>`<span class="badge gold">${esc(t)}</span>`).join(' ')||'—'}</div>
    <div class="pe98r"><span class="pe98l">${_T`Wants`}</span>${wants||'—'}</div>
    <div class="pe98r"><span class="pe98l">${_T`Cares about`}</span>${mot||'—'}</div>
    <div class="pe98r"><span class="pe98l">${_T`Dealbreaker`}</span>${D?`<span class="dl98 ${hit?'hit':''}">${hit?'⚠ ':''}${esc(D.txt())}</span>`:`<span class="rc-sub">${_T`none`}</span>`}</div></div>`}

/* ---------- the grade blocks ---------- */
function rec98Block(g,k,n,ic){const e=rec98Est(g,k);const p=e?e.p:0;const S=REC98_SURE();const M=REC98_MEAN();
  const tip=e?_T`${n}: ${e.g} — ${M[e.g]||''}. How sure: ${S[Math.min(3,p)]}.`:sx(g,_T`${n}: ${S[0]} — ask around, watch him train, share a cup or study his bouts.`,_T`${n}: ${S[0]} — ask around, watch her train, share a cup or study her bouts.`);
  return `<div class="gb98 p${p}" data-gb98="${k}" data-p="${p}" title="${esc(tip)}"><b style="${e?`color:${gradeCol(e.g)}`:''}">${e?e.g:'?'}</b><span>${esc(n)}</span><i class="su98">${ic} ${'●'.repeat(p)}${'○'.repeat(3-p)}</i></div>`} /* i18n:skip */
function rec98Strip(g){const o=rec98Ovr(g);const S=REC98_SURE();
  return `<div class="gs98"><div class="gb98 ov98 p${o.p}" data-gb98="ovr" title="${esc(o.p?_T`Overall: ${o.txt} — your recruiter's estimate. How sure: ${S[Math.min(3,o.p)]}.`:_T`Overall: ${o.txt} — the street's word. Grade all five to know better.`)}"><b style="color:${gradeCol(o.txt.replace('~',''))}">${o.txt}</b><span>${_T`Overall`}</span><i class="su98">${'●'.repeat(o.p)}${'○'.repeat(3-o.p)}</i></div>${STATS.map(([k,n,ic])=>rec98Block(g,k,n,ic)).join('')}</div>`}
/* ratingsHTML for free agents: the grade strip (157's ranges and 66's numbers stay for fighters under contract) */
{const base=ratingsHTML;ratingsHTML=function(g){try{if(g&&!g.contract&&W_()&&!rec98Mine(g))return `<div class="sect">${_T`Ratings`} <span class="rc-sub">${_T`as your recruiter grades them`}</span></div>${rec98Strip(g)}`}catch(e){console.error(e)}return base.apply(this,arguments)}}

/* ---------- court: house grades + pitches ---------- */
const PITCH98=[{k:'yard',ic:'🏋',t:'discipline',want:'rudis',mot:'training'},{k:'table',ic:'🍷',t:'show',want:'friend',mot:'spectacle'},{k:'sand',ic:'⚔',t:'risk',want:'arena',mot:'playing'},
  {k:'ward',ic:'⚕',t:'honor',want:null,mot:'honor'},{k:'champ',ic:'🏆',t:'ambition',want:'fame',mot:'glory'},{k:'purse',ic:'💰',t:'cunning',want:'coin',mot:'coin'}];
const PITCH98_L=g=>({yard:sx(g,_T('Show him the Training Yard'),_T('Show her the Training Yard')),table:_T('Dine at the lanista’s table'),sand:sx(g,_T('Promise him the sand'),_T('Promise her the sand')),ward:_T('Tour the infirmary'),champ:_T('Meet your champion'),purse:_T('Talk terms with the Clerk')});
const trait98N=t=>(MGR_KEYS.find(x=>x[0]===t)||[t,t])[1];
function rec98PGain(g,m,P,known){const gr=rec98G((m.p&&m.p[P.t])||0);let n=REC98.pitch[gr]||0;const W=known?(typeof wants88Known==='function'?wants88Known(g):[]):(typeof wants88==='function'?wants88(g):[]);
  const wm=!!(P.want&&W.includes(P.want));if(wm&&n>0)n*=REC98.wantX;const mw=known&&(g.scout||0)<2?0:(((g.motives||[]).find(x=>x[0]===P.mot)||[0,0])[1]||0);n+=Math.round(mw*REC98.motX);
  try{if(typeof pk87==='function'&&pk87('br1'))n+=3}catch(e){}return {n,gr,wm,mw}}
function rec98Proj(g,m,P){try{
  if(P.k==='yard'){const ks=['spd','str'].map(k=>[k,rec98Est(g,k)]).filter(x=>x[1]);const grow=Math.round(2+((m.p&&m.p.discipline)||50)/20+(typeof facLvl==='function'?facLvl(m,'yard'):0)*1.5);
    if(!ks.length)return sx(g,_T('Grade his Speed or Strength to see how far our Doctore could take him.'),_T('Grade her Speed or Strength to see how far our Doctore could take her.'));ks.sort((a,b)=>b[1].v-a[1].v);const [k,e]=ks[0];const n=(STATS.find(x=>x[0]===k)||[])[1];
    const to=rec98G(Math.min(STAT_MAX,e.v+grow));return to!==e.g?sx(g,_T`With our Doctore his ${n} ${e.g} could reach ${to} within a season.`,_T`With our Doctore her ${n} ${e.g} could reach ${to} within a season.`):sx(g,_T`With our Doctore his ${n} ${e.g} would hold firm.`,_T`With our Doctore her ${n} ${e.g} would hold firm.`)}
  if(P.k==='champ'){const best=rosterOf(m).filter(x=>x.alive!==false).sort((a,b)=>effOvr(b)-effOvr(a))[0];return best?sx(g,_T`He would train beside ${esc(best.name)} (${rec98G(effOvr(best))}).`,_T`She would train beside ${esc(best.name)} (${rec98G(effOvr(best))}).`):_T('Your house has no champion yet — this pitch lands soft.')}
  if(P.k==='ward'){const a=council83(W_()).find(x=>x.k==='medicus');return a?sx(g,_T`${esc(a.name)}, your Medicus, shows him the cots and the baths.`,_T`${esc(a.name)}, your Medicus, shows her the cots and the baths.`):''}
  if(P.k==='sand')return sx(g,_T('Bold entries: he would see the sand often.'),_T('Bold entries: she would see the sand often.'));
  if(P.k==='table')return _T('Wine, a full table and the house’s best stories.');
  if(P.k==='purse')return _T('Your Clerk lays out wages, bonuses and the purse.')}catch(e){}return ''}
function rec98HouseHTML(g,m){const W=typeof wants88Known==='function'?wants88Known(g):[];const mot=(g.scout||0)>=2?(g.motives||[]).map(x=>x[0]):[];const D=(g.scout||0)>=2?rec98Deal(g):null;
  const hot=new Set(PITCH98.filter(P=>(P.want&&W.includes(P.want))||mot.includes(P.mot)).map(P=>P.t));
  return `<div class="sect" style="margin-top:0">${_T`🏛 Your house grades`} <span class="rc-sub">${_T`what every recruit sees`}</span></div><div class="hg98">${MGR_KEYS.map(([k,l,d])=>{const gr=rec98G((m.p&&m.p[k])||0);
    return `<span class="hg98c ${hot.has(k)?'hot':''} ${D&&D.t===k?'deal':''}" data-hg98="${k}" title="${esc(d)}${hot.has(k)?' — '+esc(sx(g,_T('he cares about this'),_T('she cares about this'))):''}">${esc(l)} ${gradeChip(gr)}</span>`}).join('')}</div>`}
function rec98PitchHTML(g,m){const w=W_();const sent=(()=>{try{return recGate(g,'pitch')[0]}catch(e){return false}})();const left=pitchesLeft();const L=PITCH98_L(g);
  const why=sent?_T('One pitch per recruit a week.'):left<=0?_T`All ${PITCH_MAX} of this week's pitches are spent.`:'';
  const best=why?null:rec98BestPitch(g,m);const cards=PITCH98.map(P=>{const r=rec98PGain(g,m,P,true);const adv=best&&best.k===P.k;const want=P.want&&typeof want88Def==='function'?want88Def(P.want):null;const known=P.want&&wants88Known(g).includes(P.want);
    return `<button class="btn pc98 ${r.wm?'wm':''}${adv?' adv74':''}" type="button" data-rec98p="${P.k}|${g.id}" ${why?dis88(why):''}><span class="pc98h">${adv?star98(''):''}${P.ic} <b>${esc(L[P.k])}</b><span class="pc98g ${r.n<0?'neg':''}" title="${esc(_T('Interest this pitch wins'))}">${r.n>=0?'+':''}${r.n}${(g.scout||0)<2?'<i>?</i>':''}</span></span>
      <span class="pc98t">${esc(trait98N(P.t))} ${gradeChip(r.gr)}${known?` <span class="want88 ok">🎯 ${want[1]} ${esc(want[2])}</span>`:''}${r.mw?` <span class="mo98">${esc(MOTIVES[P.mot][0])}</span>`:''}</span>
      <small class="pc98p">${esc(rec98Proj(g,m,P).replace(/<[^>]*>/g,''))}</small></button>`}).join('');
  return `<div class="sect">${_T`🗣 Pitch`} <span class="rc-sub">${sx(g,_T`${left} of ${PITCH_MAX} left this week · one per recruit · a pitch on his wish counts double`,_T`${left} of ${PITCH_MAX} left this week · one per recruit · a pitch on her wish counts double`)}</span></div><div class="pg98">${cards}</div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-rec98p]');if(!b)return;e.preventDefault();e.stopPropagation();if(b.disabled)return;
  const [k,id]=b.dataset.rec98p.split('|');const g=gById(id);const w=W_(),m=me();const P=PITCH98.find(x=>x.k===k);if(!g||!P||!w||!m||g.contract)return;
  if(recGate(g,'pitch')[0]||pitchesLeft()<=0)return;recMark(g,'pitch');w.pitchN={wk:w.week,n:(w.pitchN&&w.pitchN.wk===w.week?w.pitchN.n:0)+1};
  try{if(typeof clk87Used==='function')w.clk87={wk:w.week,n:clk87Used(w)+1}}catch(err){}
  const r=rec98PGain(g,m,P,false);const b0=interestOf(g,m);g.interest[m.id]=capInterest(g,m,b0+r.n);const d=g.interest[m.id]-b0;
  const msg=_T`${P.ic} ${esc(PITCH98_L(g)[k])} — ${esc(g.name)}: interest ${d>=0?'+':''}${d}${r.wm?sx(g,_T(' (it answered his wish)'),_T(' (it answered her wish)')):''}.`;tnews(msg);MGR.msg=msg;if(typeof mToast==='function')mToast(msg);saveWorld();MGR_REDRAW()},true);

/* ---------- the card ---------- */
function rec98ScoutPane(g,m){const w=W_();const left=rec98Left(w),mx=rec98HrsMax(w),on=rec98On(g,w);const a=council83(w).find(x=>x.k==='recruiter');
  return `<div class="rpane rs98"><div class="rh98"><b>${_T`🔍 Recruiter's hours`}</b> <span class="rh98n">${_T`${left} of ${mx} left this week`}</span> ${typeof hoursPips73==='function'?hoursPips73(left,mx,'#7fae5f'):''}<span class="rc-sub">${_T`${on} of ${REC98.cap} h on ${esc(g.name)}`}${a?` · ${esc(a.name)} · ${_T`Lv ${a.lv||1}`}`:''}</span></div>
    <div class="ra98">${REC98.order.map(x=>{const nx=x===rec98Next(g);let b=rec98Btn(g,x,nx?'primary adv74':'');if(nx){const why=sx(g,_T('The next thing your recruiter can learn about him.'),_T('The next thing your recruiter can learn about her.'));b=b.replace(/ title="[^"]*">/,` title="${esc(_T`★ Advisor suggests — ${why}`)}" data-adv85="${esc(why)}">`).replace(/(<button [^>]*>)/,'$1'+star98(why))}return b}).join('')}</div>${rec98PersHTML(g,m)}</div>`}
{const base=detailHTML;detailHTML=function(g){try{if(g&&!g.contract&&W_())rec98K(g)}catch(e){}let h=base.apply(this,arguments);try{const w=W_(),m=me();if(!g||g.contract||!w||!m||!h.includes('class="rsteps"'))return h;
  const step=MGR.recStep||recStepNow(g,m);
  /* head: no potential number */
  h=h.replace(/ · potential (\d+)/,(x,n)=>(g.scout||0)>=3?` · ${_T`potential`} ${rec98G(+n)}`:'');
  /* the old rating block (ranges / numbers / "scout to see") → the grade strip above the steps */
  for(const cls of ['<div class="scoutsee rat85 rg88">','<div class="scoutsee rat85">','<div class="scoutsee">']){const i=h.indexOf(cls);if(i>=0){const c=cutDiv(h,i);if(c)h=h.slice(0,i)+h.slice(i+c[0].length)}}
  h=h.replace(/<div class="sect">[^<]*<span class="rc-sub rng88h">[\s\S]*?<\/div><div class="ratgrid">[\s\S]*?<\/div>/,'');
  h=h.replace(/(<div class="want88row"><b>[^<]*<\/b>) <span class="rc-sub">[^<]*<\/span>/,(x,a)=>`${a} <span class="rc-sub">${_T`grade all five to learn`}</span>`);
  h=h.replace('<div class="rsteps">',rec98Strip(g)+'<div class="rsteps">');
  h=h.replace(/(data-recstep="1">)[^<]*/,`$1${(g.scout||0)>=2?'✓':'①'} ${_T`Scout`}`).replace(/(data-recstep="2">)[^<]*/,`$1② ${_T`Court`}`).replace(/(data-recstep="3">)[^<]*/,`$1③ ${_T`Offer`}`);
  const pi=h.indexOf('<div class="rpane">');const pc=pi>=0?cutDiv(h,pi):null;
  if(pc&&step===1)h=h.slice(0,pi)+rec98ScoutPane(g,m)+h.slice(pi+pc[0].length);
  else if(pc&&step===2){let p=pc[0];const k=p.indexOf('<div class="sect">'+_T('Win them over'));
    p=`<div class="rpane rc98">${rec98HouseHTML(g,m)}${rec98PitchHTML(g,m)}${k>=0?p.slice(k):'</div>'}`;
    h=h.slice(0,pi)+p+h.slice(pi+pc[0].length)}
  }catch(e){console.error(e)}return h}}
/* the advisor's ★: the next scouting action (step 1), the strongest pitch (step 2) */
function rec98BestPitch(g,m){let best=null;for(const P of PITCH98){const r=rec98PGain(g,m,P,true);if(!best||r.n>best.n)best={...P,...r}}return best&&best.n>0?best:null}
{const base=recAdvice74;recAdvice74=function(g,m,step){try{if(g&&!g.contract&&m){if(step===1){const a=rec98Next(g);return a?['rec98:'+a,sx(g,_T('The next thing your recruiter can learn about him.'),_T('The next thing your recruiter can learn about her.'))]:null}
  if(step===2){const b=rec98BestPitch(g,m);if(b&&pitchesLeft()>0)return ['rec98p:'+b.k,b.wm?sx(g,_T`It answers his wish, and your ${trait98N(b.t)} grade backs it.`,_T`It answers her wish, and your ${trait98N(b.t)} grade backs it.`):_T`Your ${trait98N(b.t)} grade makes this the strongest pitch.`]}}}catch(e){console.error(e)}return base.apply(this,arguments)}}
const star98=t=>`<i class="star85" title="${esc(t||'')}">${_T`★ advised`}</i>`;
/* the board's next step for a recruit still being graded */
{const base=nextStep;nextStep=function(g,m){try{if(g&&!g.contract&&!(g.scout>=2)){const a=rec98Next(g);if(a)return rec98Btn(g,a,'tksm primary')}}catch(e){console.error(e)}return base.apply(this,arguments)}} /* i18n:skip */
/* the banner: the recruiter's hours */
{const base=tabStat73;tabStat73=function(k){try{const w=W_();if(k==='recruit'&&w&&!w.dead){const l=rec98Left(w),mx=rec98HrsMax(w);return [l+' h',_T`of ${mx} · the recruiter's hours`,hoursPips73(l,mx,'#7fae5f')]}}catch(e){console.error(e)}return base.apply(this,arguments)}}

/* ---------- compare: grades before signing ---------- */
function recCmpHTML(){const m=me();const L=MGR.cmp.map(gById).filter(g=>g&&g.alive!==false);MGR.cmp=L.map(g=>g.id);if(!L.length)return '';
  const col=g=>{const free=!g.contract;const st=gStats(g);const r=STATS.map(([k,n])=>{let v;if(free){const e=rec98Est(g,k);v=e?e.g:'?'}else v=(g.scout||0)>=2||rec98Mine(g)?st[k]:'?';return `<div class="cmpr"><span>${n}</span><b>${v}</b></div>`}).join('');
    const tags=(g.scout||0)>=2&&typeof persTags73==='function'?persTags73(g).join(' · '):_T('scout them');const iv=interestOf(g,m);const rank=suitors(g).findIndex(x=>x.m===m)+1;
    return `<div class="cmpc"><div class="cmph">${mgAvatar(g)}<div><b>${esc(g.name)}</b><div class="rc-sub">${_T`${esc(CLASSES[g.cls]?CLASSES[g.cls].name:g.cls)} · ${g.age||'?'} yrs`}</div></div><button class="btn tksm" type="button" data-reccmp="${g.id}" title="${_T`Take out of the comparison`}">✕</button></div>
      <div class="cmpr">${_T`<span>Rating</span><b>${esc(estOvr(g).txt)}</b>`}</div>${r}<div class="cmpr">${_T`<span>Ask</span><b>${askWage(g)}/wk</b>`}</div><div class="cmpr">${_T`<span>Your interest</span><b>${iv}${rank?` · #${rank}`:''}</b>`}</div>
      <div class="cmpr">${_T`<span>Personality</span><b>${esc(tags)}</b>`}</div></div>`};
  return `<div class="card2 cmpbox"><div class="sect" style="margin-top:0">${_T`⇄ Compare`} <span class="rc-sub">${L.length<2?_T('pick one more with ⇄ on a fighter’s card'):_T('side by side')}</span></div><div class="cmpg">${L.map(col).join('')}</div></div>`}

/* ---------- the truth on signing ---------- */
function rec98Snap(g){if(!g||g.contract)return null;const o={};for(const [k] of STATS){const e=rec98Est(g,k);o[k]=e?e.g:'?'}o.ovr=rec98Ovr(g).txt;return o}
{const base=signGlad;signGlad=function(g){const snap=(()=>{try{return rec98Snap(g)}catch(e){return null}})();const r=base.apply(this,arguments);
  try{const w=W_();if(snap&&g&&rec98Mine(g)){g.truth98={s:snap,wk:w.week,season:w.season};if(!HEADLESS)setTimeout(()=>rec98TruthShow(g),160)}}catch(e){console.error(e)}return r}}
function rec98TruthHTML(g){const T=g&&g.truth98;if(!T)return '';const st=gStats(g);const ord=Object.keys(TRAIT96.reduce((o,x)=>(o[x[1]]=1,o),{}));
  const row=(n,ic,sg,v)=>{const rg=rec98G(v);const a=ord.indexOf(String(sg).replace('~','')),b=ord.indexOf(rg);const vd=sg==='?'?'<i class="tr98v q">?</i>':a===b?'<i class="tr98v ok">✓</i>':b<a?'<i class="tr98v up">▲</i>':'<i class="tr98v dn">▼</i>';
    return `<div class="tr98r"><span>${ic} ${esc(n)}</span><b class="tr98s">${esc(sg)}</b><b class="tr98g" style="color:${gradeCol(rg)}">${rg}</b><b class="tr98n">${v}</b>${vd}</div>`};
  return `<div class="tr98"><div class="tr98h">${_T`🔎 The truth`} <span class="rc-sub">${_T`your recruiter's grades → the real fighter`}</span></div>${row(_T('Overall'),'⭐',T.s.ovr,effOvr(g))}${STATS.map(([k,n,ic])=>row(n,ic,T.s[k],st[k])).join('')}</div>`}
function rec98TruthShow(g){const box=document.querySelector('#signCard .sgbox');const html=rec98TruthHTML(g);if(!html)return;
  if(box){if(box.querySelector('.tr98'))return;const b=box.querySelector('[data-sgclose]');const t=document.createElement('template');t.innerHTML=html;if(b)b.before(t.content);else box.appendChild(t.content);return}
  const d=document.createElement('div');d.id='signCard';d.className='signcard';d.innerHTML=`<div class="sgbox">${html}<button class="btn primary" type="button" data-sgclose>${_T`Welcome to the ludus`}</button></div>`;
  document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-sgclose]'))d.remove()})}

/* ---------- migration ---------- */
function rec98Migrate(w){if(!w||!w.glads)return false;let ch=false;try{council83Ensure(w);const pm=(w.mgrs||[]).find(m=>m.isPlayer);
  if(council83(w).some(a=>!a.lv)){const pre=pm&&MGR_PRE.find(t=>t.key===pm.key);adv98Start(w,pre?((pre.fame||0)>=40?3:2):1);ch=true}
  for(const g of w.glads){if(!g||g.contract&&pm&&g.contract.mgr===pm.id)continue;if(g.sc98)continue;const sc=g.scout||0;const wk=Array.isArray(g.watchK)?g.watchK:[];
    if(!sc&&!wk.length)continue;g.sc98={p:{},s:{},a:{},h:null};for(const [k] of STATS)g.sc98.p[k]=Math.min(3,sc);for(const x of wk){const k=x&&(x.k||(STATS.find(S=>S[1]===x[0]||S[0]===x[0])||[])[0]);if(k&&g.sc98.p[k]!=null&&!g.sc98.p[k])g.sc98.p[k]=1}
    rec98Sync(g,g.sc98);ch=true}}catch(e){console.error(e)}return ch}
SAVE_MIGRATIONS.push(['0.98',w=>{if(rec98Migrate(w))w._rec98dirty=1}]);
{const base=mgrMigrate;mgrMigrate=function(w){const o=base.apply(this,arguments);try{if(o&&o.glads&&rec98Migrate(o))o._rec98dirty=1}catch(e){console.error(e)}return o}}
{const base=mgrHTML;mgrHTML=function(){try{const w=W_();if(w&&w._rec98dirty&&!w.dead){delete w._rec98dirty;saveWorld()}}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=openManager;openManager=async function(){const r=await base.apply(this,arguments);try{const w=W_();if(w&&w._rec98dirty){delete w._rec98dirty;saveWorld()}}catch(e){}return r}}

(()=>{const st=document.createElement('style');st.textContent=`
.gs98{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin:6px 0 8px}
.gb98{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:7px;align-items:center;padding:4px 8px;border:1px solid var(--line2);border-radius:7px;background:linear-gradient(#ffffff0a,#0000);cursor:help;min-width:0}
.gb98 b{grid-row:1/3;font:700 20px Georgia,serif;line-height:1.05;color:var(--dim);min-width:1.4em;text-align:center}.gb98>span{font-size:10.5px;color:var(--muted);line-height:1.15;overflow-wrap:anywhere;min-width:0}
.gb98.p0{border-style:dashed;opacity:.85}.gb98.p3{border-color:#c9a45899}.gb98.ov98{background:linear-gradient(#c9a45822,#0000);border-color:#c9a45866}
.su98{font-style:normal;font-size:8px;letter-spacing:1px;color:#c9a458}
.rs98 .rh98{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12.5px;margin:0 0 6px}.rh98n{color:#b7d59d}
.ra98{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}.ra98 .btn{text-align:left;margin:0}.ra98 .btn small{display:block}
.pe98{margin-top:8px}.pe98.lock{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:6px 8px;border:1px dashed var(--line2);border-radius:7px;font-size:12.5px}
.pe98r{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:12.5px;margin:3px 0}.pe98l{min-width:84px;color:var(--muted);font-size:11.5px;text-transform:uppercase;letter-spacing:.06em}
.mo98{display:inline-block;border:1px solid var(--line2);border-radius:9px;padding:0 6px;font-size:11px}.mo98 i{font-style:normal;color:var(--muted)}
.dl98{font-size:12px;color:#e3c58e}.dl98.hit{color:#ffb3a0}
.hg98{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 6px}.hg98c{display:inline-flex;gap:4px;align-items:center;font-size:11.5px;border:1px solid var(--line2);border-radius:9px;padding:1px 4px 1px 7px}
.hg98c.hot{border-color:#c9a458;box-shadow:0 0 0 1px #c9a45844 inset}.hg98c.deal{border-color:#d07a5a}
.pg98{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px}
.pc98{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;margin:0;padding:6px 8px;white-space:normal}.pc98.wm{border-color:#7fb27a}
.pc98h{display:flex;gap:5px;align-items:baseline;width:100%}.pc98h b{font-weight:600;flex:1}.pc98t{display:flex;gap:4px;align-items:center;flex-wrap:wrap;font-size:11.5px;color:var(--muted)}.pc98p{font-size:11px;color:var(--muted);line-height:1.3}
.pc98g{font:600 12px var(--mono);color:#9fd49a}.pc98g.neg{color:#e08a7a}.pc98g i{font-style:normal;color:var(--muted);margin-left:3px}
.c98lv{font:600 10.5px var(--mono);color:var(--gold2);border:1px solid #c9a45866;border-radius:8px;padding:0 6px;margin-top:3px}.c98up{margin-top:4px;font-size:11px}
.tr98{width:100%;margin:6px 0 2px;text-align:left}.tr98h{font:600 13px Georgia,serif;color:var(--gold2);margin-bottom:3px}.tr98h .rc-sub{font:400 11px var(--ui,inherit)}
.tr98r{display:grid;grid-template-columns:1fr 34px 34px 30px 18px;gap:4px;align-items:center;font-size:12px;padding:1px 0;border-top:1px solid #3a2b1f}
.tr98s{color:var(--muted);text-align:center}.tr98g{text-align:center}.tr98n{font-family:var(--mono);color:var(--bone);text-align:right}.tr98v{font-style:normal;text-align:center}.tr98v.ok{color:#9fd49a}.tr98v.up{color:#9fd49a}.tr98v.dn{color:#e08a7a}.tr98v.q{color:var(--muted)}
@media (max-width:600px){.pg98,.ra98{grid-template-columns:1fr}}
`;document.head.appendChild(st)})();

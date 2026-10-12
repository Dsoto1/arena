/* =====================================================================
   299-V100RECRUIT · v1.0 — RECRUITING AS A DOSSIER + SIGNING DAY (Virgilante's approved mocks, wave 4b)
   =====================================================================
   Mocks: tools/plans/mock100/recruit3.html (+ NOTES-recruit.md "Round 3" / "Revision 2", shots recruit3_*_1440/390) and
   tools/plans/mock100/signing.html (shots signing_{pre,gem,fair,dud,static}). Display only: every rule stays where it was —
   249-v98rec (REC98 hours, g.sc98 grades, PITCH98, the truth g.truth98), 87-v67 (steps, offer meter, offerVerdict), 105-mgr74
   (private notes), 157-v88mgr (wants, rival bids), 144/145 (local card swaps), 295 (home-city map + filter). Nothing here changes
   S, the dice, the world's numbers or a save; UI choices that need variety hash the fighter id (never the dice RNG).
   1 · THE LIST (mgrHTML wrapper, recruit tab): .mgrid gets .rc100g = a narrow list column (≤300 px) | the dossier. The toolbar
       (.rtb85) moves above both columns, the recruiting board (.pipeline) and the compare box below/above them, unchanged. Rows are
       one line ★ · face · name · class · grade · interest (Fit, Ask, stars and the meter stay in the DOM, folded by CSS; the full
       line is the row's hover title).
   2 · THE DOSSIER (last detailHTML wrapper, free agents with .rsteps): the finished card is RE-HOMED, not rewritten — its own
       buttons keep their data-* attributes, classes and disabled reasons, so every handler (data-rec98a, data-rec98p, data-mg,
       data-rec74, data-recstep, data-reccmp, data-want88…) still works. Head row: portrait in a fresco frame + name/record/chips ·
       the Stats Tablet (the .gs98 grade rows, precision dots, "?" until graded) · Personality (or a lock that names the next
       action). Three big step buttons (gold Scout / green Court / red Offer, sticky on phones).
       ① Scout: the recruiter's hours line (gold pips = hours on him), five action cards with murals, "✓ this week" and ★ ADVISED,
          then "What your recruiter learned" + "On the street".
       ② Court: house grades in one row (green outline = he cares), six pitch cards (mural, gain badge, trait grade, his wish/motive,
          a one-line projection), then Win him over (feast/gift) · Suitors (house shields, bars, "Signs at ~N · you are Nth") ·
          Private note (parchment, the three tones with their fit badge).
       ③ Offer: the contract (the old slider/terms/meter/offer button) + Where he stands, and the CONTRACT TABLET: the Clerk's line,
          the parties, wage × weeks, bonus, pledge, end week, his wants met/unmet, the dealbreaker, the ledger (net a week now → after,
          the rival bid) and the two seals. The tablet follows the slider live (input/change listeners, display only).
       Anything of the old card not placed above lands in .rc100x at the end of the pane, so no feature is lost.
       Murals = the mock's plates (painted by the game's own city/arena canvases) as assets/rec100_<k>.webp (tools/art/recruit100/
       make.py), the council's faces (face83), the recruit's portrait (gArt), his minis (assets/mini_<cls>.webp), 294a's scenes.
   3 · SIGNING DAY (signCard73 wrapper, when 249 left g.truth98): the seal → each scouted grade flips to the real grade + number
       (staggered), ▲/▼ grades up/down, then the verdict with the Recruiter's face and line: ✦ A GEM! (laurel, gold burst + sparks, ≤4 s
       then still) · AS SCOUTED · A DUD. (cracked overall, dust, a greyed portrait). gem = overall 2+ grades up (or 1 up with the
       ratings up on average), dud = the mirror, else fair. Terms (wage, weeks, signing bonus), clause line. Skippable: a click on the
       card or any key ends the show at its last frame; Esc / the backdrop / either button closes; nothing waits on it. Reduce motion /
       Animations Off = the static card (both grades side by side, no flips, no burst/dust). Keeps #signCard .sgbox .sgface .tr98
       [data-sgclose] (249's truth block sees .tr98 and stays out). No signing bonus is stored by the game, so the wrapper on signGlad
       remembers the last one in memory (RC100.sig).
   Kill switch localStorage flavius_recruit100off=1 (the v0.99 card, list and small signing card). Test tools/tests/tv100rc.js;
   shots tools/plans/recruit100/ (shot.js).
   ===================================================================== */
const RC100={sig:null,pre:{},ORD:['F','D','C','C+','B','B+','A','A+'],
  /* TWEAK: the verdict — overall grades up for a gem (or 1 up + the ratings' mean ≥ avg) */
  gem:2,avg:1,showMs:4200};
function rc100On(){try{return localStorage.getItem('flavius_recruit100off')!=='1'}catch(e){return true}}
const rc100Calm=()=>{try{return (typeof reduceMotion==='function'&&reduceMotion())||(typeof SETTINGS!=='undefined'&&SETTINGS.anim88==='off')}catch(e){return false}};
const rc100Img=k=>typeof assetURL==='function'?assetURL(k):'assets/'+k;
const rc100Pl=k=>`background-image:url('${rc100Img('rec100_'+k+'.webp')}')`;
const rc100Clip=s=>String(s==null?'':s).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
function rc100MiniK(g){try{const c=CLASSES[g&&g.cls];const r=c&&(c.clsRef||'');const k=String(r).startsWith('cls:')?r.slice(4):g&&g.cls;
  return ['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio'].includes(k)?k:'soldier'}catch(e){return 'soldier'}}
const rc100Mini=(k,css,flip)=>`<img class="rc1mini" src="${rc100Img('mini_'+k+'.webp')}" style="${css}${flip?';transform:scaleX(-1)':''}" alt="" draggable="false" decoding="async">`;
function rc100Adv(k){try{const w=W_();return w?council83(w).find(a=>a.k===k)||null:null}catch(e){return null}}
function rc100Face(a,px,css){if(!a)return '';let f='';try{f=face83(a,px)}catch(e){}return `<span class="rc1rd" style="width:${px}px;height:${px}px;${css||''}" title="${esc(a.name)} · ${esc(a.role)}">${f}</span>`}
function rc100Port(g,css,sz){return `<span class="rc1rd rc1rp" style="${css||''}">${gArt(g,sz||'sm')}</span>`}
function rc100Fr(pic,fg,cls,cap){return `<span class="rc1fr ${cls||''}"><span class="pic" style="${pic||''}">${''}</span>${fg||''}${cap?`<span class="rc1cap">${cap}</span>`:''}</span>`}
function rc100Scene(k){try{return typeof scene100==='function'?scene100(k,'tile','rc1scn'):''}catch(e){return ''}}
/* the murals: the game's own pictures layered (NOTES-recruit "Round 3") */
function rc100Mur(k,g){const m=me();const rec=rc100Adv('recruiter');const mk=rc100MiniK(g);
  switch(k){
  case 'ask':return rc100Fr(rc100Pl('stalls'),rc100Face(rec,34,'right:8px;top:8px'));
  case 'watch':return rc100Fr(rc100Pl('yard')+';background-position:40% 60%',rc100Mini(mk,'height:62%;left:30%;bottom:6px')+rc100Face(rec,34,'right:8px;top:8px'));
  case 'cup':return rc100Fr(rc100Pl('tavern'),rc100Port(g,'width:34px;height:34px;left:10px;bottom:10px')+rc100Face(rec,34,'left:50px;bottom:10px'));
  case 'study':return rc100Fr('',`<span class="pic">${rc100Scene('promote')}</span>`+rc100Face(rec,34,'right:8px;top:8px'));
  case 'trial':return rc100Fr(rc100Pl('arena')+';background-position:center 60%',rc100Mini(mk,'height:56%;left:22%;bottom:6px')+rc100Mini('soldier','height:60%;left:56%;bottom:6px',1));
  case 'yard':return rc100Fr(rc100Pl('yard2')+';background-position:center 62%',rc100Mini('hero','height:74%;left:24%;bottom:4px')+rc100Mini('soldier','height:80%;left:46%;bottom:4px',1)+rc100Face(rc100Adv('doctore'),36,'right:8px;top:8px'));
  case 'table':case 'feast':return rc100Fr('',`<span class="pic">${rc100Scene('council')}</span>`+(k==='feast'?'':['consilium','clerk','barracks'].map((a,i)=>rc100Face(rc100Adv(a),30,`left:${8+i*22}%;bottom:10px`)).join('')+rc100Port(g,'width:30px;height:30px;left:74%;bottom:10px')));
  case 'sand':return rc100Fr(rc100Pl('arenafar'),`<img class="rc1mini" src="${rc100Img('rec100_flavius.webp')}" style="width:40px;left:calc(50% - 20px);top:6px;border-radius:2px" alt="">`+rc100Mini(mk,'height:52%;left:40%;bottom:4px'));
  case 'ward':return rc100Fr(rc100Pl('baths'),rc100Face(rc100Adv('medicus'),40,'left:10px;bottom:10px')+rc100Mini('veteranus','height:56%;right:16px;bottom:6px'));
  case 'champ':{let best=null;try{best=rosterOf(m).filter(x=>x.alive!==false).sort((a,b)=>effOvr(b)-effOvr(a))[0]}catch(e){}
    return rc100Fr(rc100Pl('colos'),best?`<span class="rc1champ">${gArt(best,'sm')}</span>`:'')}
  case 'purse':return rc100Fr(rc100Pl('temple'),rc100Face(rc100Adv('clerk'),40,'left:10px;bottom:10px')+`<span class="rc1coins">${`<img src="${rc100Img('coin.webp')}" alt="">`.repeat(4)}</span>`);
  case 'gift':return rc100Fr(rc100Pl('stalls'),`<img class="rc1mini" src="${rc100Img('coin.webp')}" style="right:8px;bottom:6px;width:18px" alt="">`);
  }return rc100Fr(rc100Pl('stalls'))}

/* ---------- grade rows (the Stats Tablet) — same classes and tips as 249's strip (.gs98 .gb98[data-gb98][data-p] b) ---------- */
function rc100Dots(p){return `<i class="su98">${'●'.repeat(p)}<u>${'○'.repeat(3-p)}</u></i>`}
function rc100Grades(g){const S=REC98_SURE(),M=REC98_MEAN();const o=rec98Ovr(g);
  const ov=`<div class="gb98 ov98 rc1g p${o.p}" data-gb98="ovr" data-po="${o.p}" title="${esc(o.p?_T`Overall: ${o.txt} — your recruiter's estimate. How sure: ${S[Math.min(3,o.p)]}.`:_T`Overall: ${o.txt} — the street's word. Grade all five to know better.`)}"><span class="ic">⚖</span><span class="nm">${_T`Overall`}</span><b style="color:${gradeCol(o.txt.replace('~',''))}">${o.txt}</b>${rc100Dots(o.p)}</div>`;
  return `<div class="gs98 rc1gs">${ov}${STATS.map(([k,n,ic])=>{const e=rec98Est(g,k);const p=e?e.p:0;
    const tip=e?_T`${n}: ${e.g} — ${M[e.g]||''}. How sure: ${S[Math.min(3,p)]}.`:sx(g,_T`${n}: ${S[0]} — ask around, watch him train, share a cup or study his bouts.`,_T`${n}: ${S[0]} — ask around, watch her train, share a cup or study her bouts.`);
    return `<div class="gb98 rc1g p${p}" data-gb98="${k}" data-p="${p}" title="${esc(tip)}"><span class="ic">${ic}</span><span class="nm">${esc(n)}</span><b class="${e?'':'q'}" style="${e?_T`color:${gradeCol(e.g)}`:''}">${e?e.g:'?'}</b>${rc100Dots(p)}</div>`}).join('')}</div>`}
/* ---------- personality (or the lock that names the next action) ---------- */
function rc100Pers(g,m){const K=rec98K(g);const n=STATS.filter(([k])=>K.p[k]>=1).length;
  if((g.scout||0)<2){const a=rec98Next(g);const L=a?REC98_ACT_L(g)[a][0]:'';
    return `<div class="pe98 lock rc1lock" title="${esc(sx(g,_T`Grade all five ratings to read him — wants, temper, dealbreakers.`,_T`Grade all five ratings to read her — wants, temper, dealbreakers.`))}"><div>${sx(g,_T`🔒 <b>Grade all five to read him</b>`,_T`🔒 <b>Grade all five to read her</b>`)} (${n}/5)</div>${a?`<div class="rc-sub">${_T`Next:`} ${REC98.acts[a].ic} ${esc(L)}</div>`:''}</div>`}
  const tags=typeof persTags73==='function'?persTags73(g):[];const W=typeof wants88==='function'?wants88(g):[];const D=rec98Deal(g);const hit=D&&rec98DealHit(g,m);
  const wants=W.map(k=>{const [,ic,nm]=want88Def(k);const ok=want88Fits(g,m,k,null);return `<span class="want88 rc1tg w ${ok?'ok':''}" data-w98="${k}" title="${esc(ok?_T('Your house answers this now'):want88How(g,k))}">${ic} ${esc(nm)}${ok?' ✓':''}</span>`}).join('');
  const mot=(g.motives||[]).filter(([k])=>MOTIVES[k]).map(([k,wt])=>`${esc(MOTIVES[k][0])} <b>${Math.round(wt*100)}</b>`).join(' · ');
  const motT=(g.motives||[]).filter(([k])=>MOTIVES[k]).map(([k,wt])=>`${MOTIVES[k][0]} ${Math.round(wt*100)}%`).join(' · ');
  return `<div class="pe98 rc1pe">
    <div class="pe98r"><span class="pe98l">${_T`Temper`}</span><span class="rc1o">${tags.map(t=>`<span class="badge gold rc1tg t">${esc(t)}</span>`).join('')||'—'}</span></div>
    <div class="pe98r"><span class="pe98l">${_T`Wants`}</span><span class="rc1o">${wants||'—'}</span></div>
    <div class="pe98r" title="${esc(motT)}"><span class="pe98l">${_T`Cares`}</span><span class="rc1o">${mot||'—'}</span></div>
    <div class="pe98r" title="${esc(D?D.txt():'')}"><span class="pe98l">${_T`Dealbreaker`}</span><span class="rc1o">${D?`<span class="dl98 ${hit?'hit':''}">${hit?_T('⚠ broken'):_T('✓ safe')}</span> · ${esc(D.txt())}`:`<span class="rc-sub">${_T`none`}</span>`}</span></div>
    <div class="pe98r"><span class="pe98l">${_T`Asks`}</span><span class="rc1o">${_T`about ${coinAmt87(askWage(g))} a week`}</span></div></div>`}

/* ---------- step 1 · scout ---------- */
function rc100Pips(w,g){const mx=rec98HrsMax(w),used=rec98Used(w),on=rec98On(g,w);const n=Math.min(mx,48);
  return `<span class="rc1pips" aria-hidden="true">${Array.from({length:n},(_,i)=>`<i class="${i<on?'him':i<used?'u':''}"></i>`).join('')}</span>`}
function rc100ActCard(btn,g,w){const a=btn.getAttribute('data-rec98a');const A=REC98.acts[a];if(!A)return;const [l,sub]=REC98_ACT_L(g)[a];const K=rec98K(g);const done=K.a[a]===w.week;
  const adv=btn.classList.contains('adv74');btn.classList.add('rc1act');if(done)btn.classList.add('done');
  if(!btn.getAttribute('title')||!adv)btn.setAttribute('title',`${l} — ${sub}`);
  btn.innerHTML=`${adv?`<i class="star85 rc1adv" title="${esc(btn.getAttribute('data-adv85')||'')}">${_T`★ ADVISED`}</i>`:''}${rc100Mur(a,g)}${done?`<span class="rc1done">${_T`✓ this week`}</span>`:''}<b class="rc1o">${A.ic} ${esc(l)}</b><span class="cost">⏳ ${A.h} h${A.coin?' · '+coinAmt87(A.coin):''}</span><small class="rc1o">${esc(sub)}</small>`}
function rc100Learned(g,w){const K=rec98K(g);const rows=[];const N=k=>(STATS.find(x=>x[0]===k)||[])[1]||k;const SH=[_T('not graded'),_T('rough'),_T('fair'),_T('sure')];
  for(const a of REC98.order){if(K.a[a]!==w.week)continue;const A=REC98.acts[a];const L=REC98_ACT_L(g)[a][0];
    const ks=a==='watch'||a==='cup'?A.st:STATS.map(x=>x[0]).filter(k=>K.s[k]===w.week&&(a!=='ask'||K.p[k]===1));
    const gs=ks.map(k=>{const e=rec98Est(g,k);return e?`${N(k)} ${e.g}`:''}).filter(Boolean).join(', ');const p=ks.length?Math.min(...ks.map(k=>K.p[k]||0)):0;
    rows.push([`${A.ic} ${A.h} h`,`${L}: ${gs||(a==='ask'?_T('one rough grade, since sharpened'):'—')}${p?` (${SH[p]})`:''}`,ks.length===1?`${(rec98Est(g,ks[0])||{}).g||'?'} ${'●'.repeat(p)}`:'●'.repeat(p)])}
  const un=STATS.filter(([k])=>!(K.p[k]>0)).map(([,n])=>n);if(un.length)rows.push([_T('— not yet'),un.length===1?_T`${un[0]} is still unknown`:_T`${un.join(', ')} are still unknown`,'? '.repeat(Math.min(3,un.length)).trim()]);
  const nx=rec98Next(g);if(nx&&rec98Can(g,nx)[0]){const A=REC98.acts[nx];const [l,sub]=REC98_ACT_L(g)[nx];rows.push([_T('★ next'),`${l} → ${sub}${(g.scout||0)<2?sx(g,_T(', then his personality'),_T(', then her personality')):''}`,`${A.h} h`])}
  if(!rows.length)rows.push(['—',_T('Nothing learned this week yet.'),'']);
  return rows.slice(-4).map(([a,b,c])=>`<div class="rc1row"><span>${esc(a)}</span><span class="rc1o" title="${esc(b)}">${esc(b)}</span><span>${esc(c)}</span></div>`).join('')}
function rc100Street(g,w,m){const rows=[];const s=suitors(g).filter(x=>x.m!==m);const L=g.court88?court88Left(g,w):null;const bid=g.court88&&g.court88.bid;
  const R=bid&&bid.mid?mgrById(bid.mid):(typeof court88Rival==='function'?court88Rival(g,m):null);
  if(L!=null&&R)rows.push([_T('Rival bid'),L<=0?_T`${R.ludus} has bid — answer by the week's end`:L===1?_T`${R.ludus} bids in 1 week`:_T`${R.ludus} bids in ${L} weeks`,String(s.find(x=>x.m===R)?s.find(x=>x.m===R).v:'')]);
  else if(s[0])rows.push([_T('Leading'),_T`${s[0].m.ludus} leads the suitors`,String(s[0].v)]);
  const two=s.slice(0,2).map(x=>x.m.ludus.replace(/^(Ludus|House of|The) /,''));if(two.length)rows.push([_T('Rumour'),two.length>1?sx(g,_T`${two[0]} and ${two[1]} are courting him`,_T`${two[0]} and ${two[1]} are courting her`):sx(g,_T`${two[0]} is courting him`,_T`${two[0]} is courting her`),'—']);
  const rf=reqFame(g);rows.push([_T('Fame'),_T`wants a house with fame ${rf}+ · yours is ${m.fame||0}`,(m.fame||0)>=rf?'✓':'✗']);
  rows.push([_T('Ask'),_T`about ${askWage(g)} a week`,coinAmt87(askWage(g))]);
  return rows.slice(0,4).map(([a,b,c])=>`<div class="rc1row"><span>${esc(a)}</span><span class="rc1o" title="${esc(b)}">${esc(b)}</span><span>${/amt87/.test(c)?c:esc(c)}</span></div>`).join('')}
function rc100Scout(T,g,w,m){const old=T.content.querySelector('.rpane.rs98');const pane=document.createElement('div');pane.className='rpane rs98 rc1pane rc1s';
  const left=rec98Left(w),mx=rec98HrsMax(w),on=rec98On(g,w);const rec=rc100Adv('recruiter');
  const acts=old?[...old.querySelectorAll('[data-rec98a]')]:[];for(const b of acts)rc100ActCard(b,g,w);
  pane.innerHTML=`<section class="rc1pnl rc1hrs rh98"><b>${_T`🔍 Recruiter's hours`}</b><span class="rh98n">${_T`${left} of ${mx} left`}</span>${rc100Pips(w,g)}<span class="sub rc1o">${sx(g,_T`${on} of ${REC98.cap} h on him · each action once a week`,_T`${on} of ${REC98.cap} h on her · each action once a week`)}${rec?` · ${esc(rec.name)} · ${_T`Lv ${rec.lv||1}`}`:''}</span></section>
    <div class="ra98 rc1acts"></div>
    <div class="rc1learn"><section class="rc1pnl rc1lg"><div class="rc1phd">${_T`What your recruiter learned · this week`}</div>${rc100Learned(g,w)}</section>
      <section class="rc1pnl rc1lg"><div class="rc1phd">${_T`On the street`}</div>${rc100Street(g,w,m)}</section></div>`;
  const box=pane.querySelector('.rc1acts');for(const b of acts)box.appendChild(b);
  if(old){old.querySelectorAll('.ra98,.rh98,.pe98').forEach(x=>x.remove());const rest=[...old.childNodes].filter(n=>n.nodeType===1||String(n.textContent).trim());if(rest.length){const x=document.createElement('div');x.className='rc100x';rest.forEach(n=>x.appendChild(n));pane.appendChild(x)}old.replaceWith(pane)}
  return pane}

/* ---------- step 2 · court ---------- */
const RC100_PT=g=>({yard:_T('🏋 Training Yard'),table:_T('🍷 The lanista’s table'),sand:_T('⚔ Promise the sand'),ward:_T('⚕ Tour the infirmary'),champ:_T('🏆 Meet your champion'),purse:_T('💰 Terms with the Clerk')});
function rc100PitchCard(btn,g,m){const [k]=String(btn.getAttribute('data-rec98p')||'').split('|');const P=PITCH98.find(x=>x.k===k);if(!P)return;
  const r=rec98PGain(g,m,P,true);const full=PITCH98_L(g)[k];const proj=rc100Clip(rec98Proj(g,m,P));const adv=btn.classList.contains('adv74');
  const known=P.want&&wants88Known(g).includes(P.want);const want=P.want?want88Def(P.want):null;
  const tags=`${known?`<span class="want88 ok rc1tg w">🎯 ${want[1]} ${esc(want[2])} ×2</span>`:''}${r.mw?`<span class="mo98 rc1tg">${esc(MOTIVES[P.mot][0])}</span>`:''}`;
  btn.classList.add('rc1pit');btn.setAttribute('title',`${full} — ${proj}`);
  btn.innerHTML=`${adv?`<i class="star85 rc1adv">${_T`★ ADVISED`}</i>`:''}${rc100Mur(k,g)}<span class="t1"><b>${esc(RC100_PT(g)[k])}</b><span class="pc98g rc1gain ${r.n<8?'lo':''} ${r.n<0?'neg':''}" title="${esc(_T('Interest this pitch wins'))}">${r.n>=0?'+':''}${r.n}${(g.scout||0)<2?'<i>?</i>':''}</span></span><span class="t2 pc98t"><span class="rc1o">${esc(trait98N(P.t))}</span>${gradeChip(r.gr)}<span class="tags">${tags||`<span class="rc-sub">${_T`no wish · no motive`}</span>`}</span></span><small class="rc1o">${esc(proj)}</small>`}
function rc100Win(btn,g,m,w){const k=btn.getAttribute('data-mg');const feast=k==='visit';const c=feast?visitCost(g):giftCost(g);
  btn.classList.add('rc1wo');btn.innerHTML=`${rc100Mur(feast?'feast':'gift',g)}<span class="rc1wt"><b class="rc1o">${feast?_T('🍷 Host a feast'):_T('🎁 Send a gift')}</b><span class="l2"><small class="rc1o">${feast?_T('big swing · every 3 wk'):_T('coin-hungry love it · every 2 wk')}</small><span class="c">${coinAmt87(c)}</span></span></span>`}
function rc100Suit(g,m,n){const s=suitors(g).slice(0,n||5);if(!s.some(x=>x.m===m)){const me1=suitors(g).find(x=>x.m===m);if(me1)s[s.length-1]=me1}
  return s.map(x=>{const mine=x.m===m;const sh=typeof parma100==='function'?parma100(x.m,18):'';
    return `<div class="suit rc1su ${mine?'me':''}" title="${esc(x.m.ludus)}${x.m.name?' — '+esc(x.m.name):''}"><span class="rc1sh">${sh}</span><span class="rc1o">${esc(x.m.ludus)}${mine?' '+_T('(you)'):''}</span><span class="rc1bar"><i style="width:${Math.min(100,x.v)}%;background:${esc(x.m.color||'#9a8f84')}"></i></span><span class="n">${x.v}</span></div>`}).join('')}
function rc100Need(g,m,w){const need=starsOf(effOvr(g))<=2?40:52;const rank=suitors(g).findIndex(x=>x.m===m)+1;const L=g.court88?court88Left(g,w):null;
  const ord=n=>n===1?_T('1st'):n===2?_T('2nd'):n===3?_T('3rd'):_T`${n}th`;
  return `<div class="rc1need rc1o" title="${esc(sx(g,_T('The interest he needs before he signs, your place among the suitors, the rival bid'),_T('The interest she needs before she signs, your place among the suitors, the rival bid')))}">${_T`Signs at ~<b>${need}</b>`} · ${_T`you are <b>${ord(rank)}</b>`}${L!=null?' · '+(L<=0?_T('a rival bid is on the table'):L===1?_T('rival bid in 1 wk'):_T`rival bid in ${L} wk`):''}</div>`}
function rc100Note(btn,g){const t=String(btn.getAttribute('data-rec74')||'').split(':')[1];const T74=typeof TONES74!=='undefined'?TONES74[t]:null;if(!T74)return;
  const sm=btn.querySelector('small');const txt=sm?sm.textContent:'';const fit=/lands well/.test(txt)?'good':/· fair/.test(txt)?'fair':/· weak/.test(txt)?'weak':'';
  const desc=txt.replace(/\s*·\s*(lands well|fair|weak)\s*$/,'');const mots=T74[1].map(k=>MOTIVES[k]?MOTIVES[k][0]:k).join(' · ');
  btn.classList.add('rc1nr');if(fit==='good')btn.classList.add('best');btn.setAttribute('title',`${T74[0]} — ${mots} · ${desc}`);
  btn.innerHTML=`<b>${esc(T74[0])}</b><span class="rc1o">${esc(mots)} · ${esc(desc)}</span>${fit?`<span class="fit ${fit}">${fit==='good'?_T('lands well'):fit==='fair'?_T('fair'):_T('weak')}</span>`:'<span></span>'}`}
function rc100Court(T,g,w,m){const old=T.content.querySelector('.rpane.rc98');if(!old)return null;const pane=document.createElement('div');pane.className='rpane rc98 rc1pane rc1c';
  const hg=old.querySelector('.hg98');const pits=[...old.querySelectorAll('[data-rec98p]')];const wins=[...old.querySelectorAll('[data-mg="visit"],[data-mg="gift2"]')];const notes=[...old.querySelectorAll('[data-rec74^="note:"]')];
  pits.forEach(b=>rc100PitchCard(b,g,m));wins.forEach(b=>rc100Win(b,g,m,w));notes.forEach(b=>rc100Note(b,g));
  const left=pitchesLeft();
  pane.innerHTML=`<section class="rc1pnl rc1hg"><span class="rc1phd" title="${esc(_T('Your house grades — what every recruit sees'))}">${_T`🏛 House grades`}</span></section>
    <div class="rc1pmeta"><span class="rc1o">${_T`🗣 Pitch · ${left} of ${PITCH_MAX} left this week · one per recruit`}</span><span class="rc1o">${sx(g,_T('his wish ×2 · green = he cares'),_T('her wish ×2 · green = she cares'))}</span></div>
    <div class="pg98 rc1pg"></div>
    <div class="rc1low"><section class="rc1pnl rc1won"><div class="rc1phd">${sx(g,_T`Win him over`,_T`Win her over`)}</div></section>
      <section class="rc1pnl rc1suit"><div class="rc1phd">${_T`Suitors`}</div>${rc100Suit(g,m)}${rc100Need(g,m,w)}</section>
      <section class="rc1pnl rc1notes"><div class="rc1phd">${_T`✉ Private note · once a week · tone`}</div></section></div>`;
  if(hg){hg.classList.add('rc1hgg');pane.querySelector('.rc1hg').appendChild(hg)}
  const pg=pane.querySelector('.rc1pg');pits.forEach(b=>pg.appendChild(b));const wo=pane.querySelector('.rc1won');wins.forEach(b=>wo.appendChild(b));const nt=pane.querySelector('.rc1notes');notes.forEach(b=>nt.appendChild(b));
  /* the rest of the old pane (157's want pitches, anything a later wrapper adds) */
  old.querySelectorAll('.pg98,.hg98,.suit').forEach(x=>x.remove());old.querySelectorAll('.acts').forEach(x=>{if(!x.querySelector('button,input,select,label'))x.remove()});
  old.querySelectorAll('.sect').forEach(x=>x.remove());const rest=[...old.childNodes].filter(n=>n.nodeType===1);if(rest.length){const x=document.createElement('div');x.className='rc100x';rest.forEach(n=>x.appendChild(n));pane.appendChild(x)}
  old.replaceWith(pane);return pane}

/* ---------- step 3 · offer + the contract tablet ---------- */
function rc100Terms(g){const d=id=>document.getElementById(id);const ask=askWage(g);
  return {wage:+((d('ofWage')||{}).value)||ask,weeks:+((d('ofWeeks')||{}).value)||8,bonus:Math.max(0,+((d('ofBonus')||{}).value)||0),pledge:!!(d('ofPledge')||{}).checked,rudis:!!(d('ofRudis88')||{}).checked}}
const RC100_CLERK=g=>[sx(g,_T('“He reads every line. Mind the clauses.”'),_T('“She reads every line. Mind the clauses.”')),_T('“A fair wage keeps a fighter honest.”'),sx(g,_T('“Pay him what he is worth — no more.”'),_T('“Pay her what she is worth — no more.”')),_T('“Every coin here is a coin not spent on the yard.”')];
function rc100TabRows(g,T){const w=W_(),m=me();const r=(a,b,c,cls)=>`<div class="rc1tr ${cls||''}"><span>${a}</span><span class="rc1o" title="${esc(rc100Clip(b))}">${b}</span><span>${c}</span></div>`;
  const end=w.week+T.weeks;const ewk=typeof wkOf==='function'?wkOf(end):end;let net=null;try{net=weekMoney().net}catch(e){}
  const W=wants88Known(g);const D=(g.scout||0)>=2?rec98Deal(g):null;const hit=D&&rec98DealHit(g,m);
  const bid=g.court88&&g.court88.bid;const L=g.court88?court88Left(g,w):null;const R=bid&&bid.mid?mgrById(bid.mid):(typeof court88Rival==='function'?court88Rival(g,m):null);
  const sg=n=>(n>0?'+':n<0?'−':'')+Math.abs(n);
  let h=r(_T('Wage'),_T`${T.wage} coin a week × ${T.weeks} weeks`,String(T.wage*T.weeks))+
    r(_T('Bonus'),T.bonus?_T`${T.bonus} coin at signing`:_T('none'),String(T.bonus))+
    r(_T('Pledge'),T.pledge?_T('the main event within 2 weeks'):_T('not pledged'),T.pledge?'★':'—')+
    (W.includes('rudis')?r(_T('Rudis'),T.rudis?_T('the rudis path is promised'):_T('no rudis clause'),T.rudis?'✓':'—'):'')+
    r(_T('Ends'),_T`after ${T.weeks} weeks · week ${ewk} · renew or release`,`W${ewk}`);
  h+=`<div class="rc1tsub">${sx(g,_T`His wants`,_T`Her wants`)}</div>`;
  if(W.length)for(const k of W){const [,ic,nm]=want88Def(k);const ok=want88Fits(g,m,k,T);h+=r(`${ic} ${esc(nm)}`,ok?_T('your terms answer it'):esc(want88How(g,k)),ok?_T('✓ met'):_T('✗ unmet'),ok?'ok':'no')}
  else h+=r('🎯',sx(g,_T('grade all five to learn what he wants'),_T('grade all five to learn what she wants')),'?');
  if(D)h+=r(_T('Dealbreaker'),esc(D.txt()),hit?_T('⚠ broken'):_T('✓ safe'),hit?'no':'ok');
  h+=`<div class="rc1tsub">${_T`On your ledger`}</div>`;
  if(net!=null)h+=r(_T('Net / wk'),_T`${sg(net)} now → ${sg(net-T.wage-Math.round(T.bonus/Math.max(1,T.weeks)))} a week before fees`,sg(net-T.wage));
  if(R&&L!=null)h+=r(_T('Rival bid'),L<=0?_T`${esc(R.ludus)} has bid`:_T`${esc(R.ludus)} may bid ×${REC88.bidX} in ${L} wk`,`~${bid&&bid.wage?bid.wage:Math.ceil(askWage(g)*REC88.bidX)}`);
  return h}
function rc100Tablet(g,m,w){const cl=rc100Adv('clerk');const T=rc100Terms(g);const q=RC100_CLERK(g);const line=q[hashStr('rc100c:'+g.id)%q.length];
  const ini=(typeof ludusInitials==='function'?ludusInitials(m.ludus):'LV').slice(0,2);
  return `<section class="rc1tab" aria-label="${esc(_T('Contract of service'))}">${rc100Fr(rc100Pl('temple')+';background-position:center 45%','',"rc1strip",esc(_T('Tabula · contract of service')))}
    <div class="rc1wax">${cl?`<div class="rc1clerk">${rc100Face(cl,28,'position:relative')}<span class="rc1o"><b>${esc(cl.name)}</b>, ${esc(cl.role)}: ${esc(line)}</span></div>`:''}
      <div class="rc1party rc1o">${_T`<b>${esc(m.ludus)}</b> engages <b>${esc(g.name)}</b>`}</div>
      <div class="rc1rows" data-rc100tab="${g.id}">${rc100TabRows(g,T)}</div>
      <div class="rc1seals"><div class="rc1seal mine"><span>${esc(ini)}</span><small class="rc1o">${_T`your seal · on Offer`}</small></div><div class="rc1seal his"><span>?</span><small class="rc1o">${sx(g,_T`his seal · when he accepts`,_T`her seal · when she accepts`)}</small></div></div></div></section>`}
function rc100TabSync(){try{const box=document.querySelector('[data-rc100tab]');if(!box)return;const g=gById(box.getAttribute('data-rc100tab'));if(!g||g.contract)return;box.innerHTML=rc100TabRows(g,rc100Terms(g))}catch(e){console.error(e)}}
document.addEventListener('input',e=>{const t=e.target;if(t&&['ofWage','ofBonus'].includes(t.id))rc100TabSync()});
document.addEventListener('change',e=>{const t=e.target;if(t&&['ofWeeks','ofPledge','ofRudis88','ofWage','ofBonus'].includes(t.id))rc100TabSync()});
function rc100Offer(T,g,w,m){const old=[...T.content.querySelectorAll('.rpane')].find(p=>p.querySelector('#ofWage'));if(!old)return null;
  const pane=document.createElement('div');pane.className='rpane rc1pane rc1o';
  pane.innerHTML=`<div class="rc1offr"><div class="rc1ocol"><section class="rc1pnl rc1off"><div class="rc1phd">${_T`The contract`}</div></section>
    <section class="rc1pnl rc1stand"><div class="rc1phd">${sx(g,_T`Where he stands`,_T`Where she stands`)}</div>${rc100Suit(g,m,6)}${rc100Need(g,m,w)}</section></div>${rc100Tablet(g,m,w)}</div>`;
  const off=pane.querySelector('.rc1off');[...old.childNodes].forEach(n=>off.appendChild(n));old.replaceWith(pane);return pane}

/* ---------- the dossier: re-home the finished card ---------- */
function rc100Steps(T,g,w,m){const st=T.content.querySelector('.rsteps');if(!st)return;st.classList.add('rc1steps');const K=rec98K(g);const n=STATS.filter(([k])=>K.p[k]>=1).length;
  const sub={1:(g.scout||0)>=2?_T('✓ graded'):_T`${n}/5 graded`,2:_T`${pitchesLeft()} pitches left`,3:_T`ask ${askWage(g)}/wk`};const nm={1:_T('Scout'),2:_T('Court'),3:_T('Offer')};const cls={1:'scout',2:'court',3:'offer'};
  for(const b of st.querySelectorAll('[data-recstep]')){const s=+b.dataset.recstep;b.classList.add('rc1st',cls[s]);b.innerHTML=`<span class="n">${s}</span>${esc(nm[s])} <small class="rc1o">${esc(sub[s])}</small>`;b.setAttribute('aria-pressed',b.classList.contains('cur')?'true':'false')}}
function rc100Card(h,g){const w=W_(),m=me();if(!w||!m)return h;const T=document.createElement('template');T.innerHTML=h;const card=T.content.querySelector('.card2');if(!card||!card.querySelector('.rsteps'))return h;
  const step=MGR.recStep||recStepNow(g,m);
  const top=card.firstElementChild;const info=top&&top.querySelector(':scope > div[style*="flex:1"]');const map=card.querySelector('.mi100rcard');const cmp=card.querySelector('[data-reccmp]');const wr=card.querySelector('.want88row');const bid=card.querySelector('.bid88');
  const gs=card.querySelector('.gs98');if(gs)gs.remove();card.querySelectorAll('.pe98').forEach(x=>{if(!x.closest('.rpane'))x.remove()});
  /* head */
  const head=document.createElement('div');head.className='rc1head';
  head.innerHTML=`<section class="rc1pnl rc1prof"><div class="rc1left">${rc100Fr('','<span class="rc1pp">'+gArt(g,'md')+'</span>','rc1por')}</div><div class="rc1info"></div></section>
    <section class="rc1pnl rc1grades"><div class="rc1phd">${_T`Ratings · recruiter's grades`}</div>${rc100Grades(g)}</section>
    <section class="rc1pnl rc1pers"><div class="rc1phd">${_T`Personality`}</div>${rc100Pers(g,m)}</section>`;
  const inf=head.querySelector('.rc1info');if(info){inf.appendChild(info)}
  const chips=document.createElement('div');chips.className='rc1chips';if(cmp){cmp.removeAttribute('style');cmp.classList.add('rc1ch');chips.appendChild(cmp)}if(wr){wr.classList.add('rc1ch');chips.appendChild(wr)}inf.appendChild(chips);
  if(map){map.classList.add('rc1map');head.querySelector('.rc1left').appendChild(map)}
  if(top&&top!==head)top.replaceWith(head);else card.insertBefore(head,card.firstChild);
  if(bid)head.after(bid);
  /* stray head leftovers before the steps stay where they were */
  rc100Steps(T,g,w,m);
  if(step===1)rc100Scout(T,g,w,m);else if(step===2)rc100Court(T,g,w,m);else rc100Offer(T,g,w,m);
  card.classList.add('rc100','rc1s'+step);card.setAttribute('data-rc100card',g.id);return T.innerHTML}
{const base=detailHTML;detailHTML=function(g){const h=base.apply(this,arguments);try{if(!rc100On()||!g||g.contract||typeof h!=='string'||!h.includes('class="rsteps"')||!W_())return h;return rc100Card(h,g)}catch(e){console.error(e);return h}}}

/* ---------- the list column + the banner (recruit tab) ---------- */
function rc100List(T){const grid=[...T.content.querySelectorAll('.mgrid')].find(x=>x.querySelector('#recTable'));if(!grid)return;grid.classList.add('rc100g');
  const left=grid.firstElementChild;const tb=left&&left.querySelector('.rtb85');if(tb){tb.classList.add('rc1tb');grid.before(tb)}
  const cmp=left&&left.querySelector('.cmpbox');if(cmp)grid.before(cmp);
  const pipe=left&&left.querySelector('.pipeline');if(pipe){pipe.classList.add('rc1board');grid.after(pipe)}
  for(const tr of grid.querySelectorAll('#recTable tr[data-mg="sel"][data-id]')){const g=gById(tr.dataset.id);if(!g)continue;const f=tr.querySelector('.r85f');if(!f||f.querySelector('.rc1cl'))continue;
    const c=CLASSES[g.cls];const s=document.createElement('span');s.className='rc1cl';s.setAttribute('translate','no');s.textContent=c?c.name:g.cls;const n=f.querySelector('.r85n');if(n)n.after(s);else f.appendChild(s);
    const sub=tr.querySelector('.r85s');if(sub&&!tr.title)tr.title=`${g.name} · ${rc100Clip(sub.innerHTML)}`}
  const card=grid.querySelector(':scope > div:nth-child(2) > .card2.rc100');const map=card&&card.querySelector(':scope > .mi100rcard');const prof=card&&card.querySelector('.rc1left');if(map&&prof){map.classList.add('rc1map');prof.appendChild(map)}
  const hd=grid.querySelector('#recTable tr:first-child');if(hd&&!hd.querySelector('[data-mg]'))hd.classList.add('rc1lh')}
{const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{if(!rc100On()||typeof h!=='string'||typeof MGR==='undefined'||MGR.tab!=='recruit'||h.indexOf('recTable')<0)return h;
  const T=document.createElement('template');T.innerHTML=h;rc100List(T);return T.innerHTML}catch(e){console.error(e);return h}}}
{const base=roomScene73;roomScene73=function(k){try{if(k==='recruit'&&rc100On()){const rec=rc100Adv('recruiter');
  return `<img class="lu2ban rc1ban" src="${rc100Img('rec100_pano.webp')}" alt="" draggable="false" decoding="async"><span class="lu2bsh" aria-hidden="true"></span>${rec?`<span class="rc1banf">${rc100Face(rec,48,'position:relative')}</span>`:''}`}}catch(e){console.error(e)}return base.apply(this,arguments)}}

/* =====================================================================
   SIGNING DAY
   ===================================================================== */
{const base=signGlad;signGlad=function(g,wage,weeks,bonus){try{if(g&&g.sc98&&g.sc98.p)RC100.pre[g.id]={...g.sc98.p};RC100.sig={id:g&&g.id,bonus:+bonus||0}}catch(e){}return base.apply(this,arguments)}}
const rc100Ord=s=>RC100.ORD.indexOf(String(s||'').replace('~',''));
function sg100Verdict(g){const T=g.truth98;if(!T)return null;const st=gStats(g);const dOv=rc100Ord(rec98G(effOvr(g)))-rc100Ord(T.s.ovr);
  const ds=STATS.filter(([k])=>T.s[k]&&T.s[k]!=='?').map(([k])=>rc100Ord(rec98G(st[k]))-rc100Ord(T.s[k]));const avg=ds.length?ds.reduce((a,b)=>a+b,0)/ds.length:0;
  const k=dOv>=RC100.gem||(dOv>=1&&avg>=RC100.avg)?'gem':dOv<=-RC100.gem||(dOv<=-1&&avg<=-RC100.avg)?'dud':'fair';return {k,dOv,avg}}
const SG100_LINES=g=>({gem:[sx(g,_T('“I had him two grades low. The forum will be talking about this one by Friday.”'),_T('“I had her two grades low. The forum will be talking about this one by Friday.”')),_T('“The street sold us a cart horse. We bought a charger.”'),sx(g,_T('“Better than I told you — and I told you he was good.”'),_T('“Better than I told you — and I told you she was good.”'))],
  fair:[_T('“What I told you is what you bought. A solid hand for the card.”'),_T('“No surprises. That is the job done right.”'),sx(g,_T('“He is what I said he was. Train him and he will hold.”'),_T('“She is what I said she was. Train her and she will hold.”'))],
  dud:[sx(g,_T('“He looked better in the forum light. We paid for a statue and got the plinth.”'),_T('“She looked better in the forum light. We paid for a statue and got the plinth.”')),_T('“I will hear about this one at every table in town.”'),sx(g,_T('“The Doctore will have work to do with him.”'),_T('“The Doctore will have work to do with her.”'))]});
function sg100Laurel(){const lf=[[28,96,-12],[22,126,-26],[24,156,-40],[32,184,-56],[46,210,-70]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="6" ry="14" transform="rotate(${r} ${x} ${y})"/>`).join('');
  return `<svg class="sg1lau" viewBox="0 0 200 250" aria-hidden="true"><g fill="#e8c35a" stroke="#7a5a1a" stroke-width=".8"><g><path d="M60 236q-52-60-30-150" fill="none" stroke="#c9a03e" stroke-width="3"/>${lf}</g><g transform="translate(200 0) scale(-1 1)"><path d="M60 236q-52-60-30-150" fill="none" stroke="#c9a03e" stroke-width="3"/>${lf}</g></g></svg>`}
function sg100HTML(g,calm){const T=g.truth98;const st=gStats(g);const m=me();const c=g.contract||{};const V=sg100Verdict(g);const pre=RC100.pre[g.id]||{};const rec=rc100Adv('recruiter');
  const L=SG100_LINES(g)[V.k];const line=L[hashStr('sg100:'+g.id)%L.length];const bonus=RC100.sig&&RC100.sig.id===g.id?RC100.sig.bonus:0;
  const dots=p=>p>0?`<span class="sure" title="${esc(REC98_SURE()[Math.min(3,p)])}">${[2,1,0].map(i=>`<i class="${p>i?'on':''}"></i>`).join('')}</span>`:'';
  const row=(lb,sg,p,v,ovr,i)=>{const rg=rec98G(v);const a=rc100Ord(sg),b=rc100Ord(rg);const q=sg==='?'||a<0;const d=b-a;
    const dl=q?`<span class="dl eq">?<em> ${_T`never scouted`}</em></span>`:d>0?`<span class="dl up">▲ ${d}<em> ${d>1?_T('grades up'):_T('grade up')}</em></span>`:d<0?`<span class="dl dn">▼ ${-d}<em> ${-d>1?_T('grades down'):_T('grade down')}</em></span>`:`<span class="dl eq">=<em> ${_T`as scouted`}</em></span>`;
    return `<div class="tr98r sg1rw ${ovr?'ovr':''}" style="--d:${i}"><span class="lb">${lb}</span><div class="sg1t ${q?'ghost':''}"><div class="in"><div class="f ${q?'':'sc'}">${esc(sg)}${q?'':dots(p)}</div></div></div><span class="arr">→</span>
      <div class="sg1t real"><div class="in"><div class="f seal"><i></i></div><div class="b rl">${rg} <small>${v}</small></div></div>${ovr?`<svg class="sg1crack" viewBox="0 0 96 54" preserveAspectRatio="none" aria-hidden="true"><path d="M40 0l6 14-9 9 12 10-5 21M46 14l14-4M37 23l-12 6" stroke="#1a120c" stroke-width="2.4" fill="none"/><path d="M41 0l6 14-9 9 12 10-5 21" stroke="#d9ccb0" stroke-width=".8" fill="none"/></svg>`:''}</div>${dl}</div>`};
  const minP=Math.min(...STATS.map(([k])=>pre[k]||0));
  const rows=STATS.map(([k,n,ic],i)=>row(`<i>${ic}</i>${esc(n)}`,T.s[k]||'?',pre[k]||0,st[k],false,i)).join('')+row(esc(_T('Overall')),T.s.ovr||'?',minP,effOvr(g),true,6);
  const cls=CLASSES[g.cls];const wants=(typeof wants88==='function'?wants88(g):[]).map(k=>want88Def(k)[2]);
  const cl=[c.cl76&&c.cl76.nonaum?_T('no Naumachia'):'',g.rudis88?_T('the rudis path'):'',g.pledge?_T('the main event'):''].filter(Boolean);
  const big={gem:_T('✦ A gem!'),fair:_T('As scouted.'),dud:_T('A dud.')}[V.k];
  return `<div class="sgbox sg1card" role="dialog" aria-modal="true" aria-label="${esc(_T`Signed: ${g.name}`)}">
   <div class="sg1kick">${_T`✍ SIGNED · ${esc(m.ludus)}`}</div>
   <div class="sg1who"><div class="sg1frame"><div class="sgface sg1pic" style="--cc:${esc(cls?cls.color:'#cfc6b4')}">${gArt(g,'lg')}</div>${sg100Laurel()}<i class="sg1dust" style="left:20px;top:150px;--x:-40px"></i><i class="sg1dust" style="left:110px;top:170px;--x:40px"></i></div>
    <div class="sg1nm"><h2>${esc(g.name)}</h2><div class="sub"><span class="cls" style="background:${esc(cls?cls.color:'#cfc6b4')}"></span><span translate="no">${esc(cls?cls.name:g.cls)}</span> · ${_T`${g.age||'?'} yrs`}${g.city?' · '+_T`from ${esc(g.city)}`:''}</div></div>
    <div class="sg1terms"><span><b>${coinAmt87(c.wage||0)}</b>${_T`a week`}</span><span><b>${c.weeks||0}</b>${_T`weeks`}</span><span><b>${coinAmt87(bonus)}</b>${_T`to sign`}</span></div>
    ${cl.length||wants.length?`<div class="sg1clause">${cl.length?_T`Clause: <b>${esc(cl.join(' · '))}</b>`:''}${cl.length&&wants.length?' · ':''}${wants.length?sx(g,_T`he wants <b>${esc(wants.join(' · '))}</b>`,_T`she wants <b>${esc(wants.join(' · '))}</b>`):''}</div>`:''}</div>
   <div class="sg1truth"><h3>${_T`The truth`} <small>${sx(g,_T('what the Recruiter saw · what he really is'),_T('what the Recruiter saw · what she really is'))}</small></h3><div class="tr98 sg1grid">${rows}</div></div>
   <div class="sg1verdict" aria-live="polite"><span class="big">${big}</span><span class="rec">${rec?rc100Face(rec,42,'position:relative'):''}<span><span>${esc(line)}</span><small>${rec?_T`${esc(rec.name)}, your Recruiter · Lv ${rec.lv||1}`:''}</small></span></span></div>
   <div class="sg1acts"><button class="btn primary sg1seal" type="button" data-sg100="seal">${_T`🔓 Break the seal`}</button><button class="btn sg1after" type="button" data-sgclose data-sg100="roster">${sx(g,_T`🛡 See him in the Roster`,_T`🛡 See her in the Roster`)}</button><button class="btn primary sg1after" type="button" data-sgclose>${_T`Welcome to the ludus`}</button></div>
   ${calm?`<div class="sg1rm">${_T`Reduce motion: scouted and real side by side`}</div>`:''}</div>`}
function sg100Show(g){const old=document.getElementById('signCard');if(old)old.remove();const calm=rc100Calm();const V=sg100Verdict(g);
  const d=document.createElement('div');d.id='signCard';d.className='signcard sg100 s-'+V.k+(calm?_T(' rm go'):' pre');d.innerHTML=`<div class="sg1burst" aria-hidden="true"></div><div class="sg1sparks" aria-hidden="true"></div>`+sg100HTML(g,calm);
  if(V.k==='gem'&&!calm){const s=d.querySelector('.sg1sparks');let x='';for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=180+(i%5)*40;x+=`<span style="--x:${Math.round(Math.cos(a)*r)}px;--y:${Math.round(Math.sin(a)*r)}px;animation-delay:${(2.1+(i%4)*.06).toFixed(2)}s"></span>`}s.innerHTML=x}
  document.body.appendChild(d);let t1=0,t2=0;
  const reveal=()=>{if(!d.isConnected||d.classList.contains('go'))return;d.classList.remove('pre');d.classList.add('go');t2=setTimeout(()=>d.classList.add('still'),RC100.showMs)};
  const still=()=>{clearTimeout(t1);clearTimeout(t2);d.classList.remove('pre');d.classList.add('go','still')};
  const close=()=>{clearTimeout(t1);clearTimeout(t2);document.removeEventListener('keydown',key,true);d.remove()};
  const key=e=>{if(!d.isConnected){document.removeEventListener('keydown',key,true);return}if(e.key==='Escape'){e.preventDefault();close();return}if(!d.classList.contains('still')&&!calm&&e.key!=='Tab'){still()}};
  document.addEventListener('keydown',key,true);
  d.addEventListener('click',e=>{const b=e.target.closest('button');
    if(e.target===d){close();return}
    if(b&&b.dataset.sg100==='seal'){e.stopPropagation();if(d.classList.contains('pre'))reveal();else still();return}
    if(b&&b.hasAttribute('data-sgclose')){const ros=b.dataset.sg100==='roster';close();if(ros&&typeof MGR!=='undefined'){MGR.tab='roster';MGR.view=null;if(typeof MGR_REDRAW==='function')MGR_REDRAW()}return}
    if(!calm&&!d.classList.contains('still'))still()});
  if(!calm)t1=setTimeout(reveal,900);
  try{const b=d.querySelector('.sg1after.primary');if(b&&calm)b.focus({preventScroll:true})}catch(e){}
  return d}
{const base=signCard73;signCard73=function(g){try{if(rc100On()&&g&&g.truth98&&g.truth98.s&&typeof rec98Mine==='function'&&rec98Mine(g))return sg100Show(g)}catch(e){console.error(e)}return base.apply(this,arguments)}}

(()=>{const st=document.createElement('style');const parch=rc100Img('parchment.webp');st.textContent=`
/* ===== 299 · recruiting dossier ===== */
/* one-line cells */.rc1o{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
@media (min-width:901px){.mgrid.rc100g:has(#recTable){grid-template-columns:minmax(240px,300px) minmax(0,1fr)}}
.rc1tb{margin-bottom:8px}
.rc1board{margin-top:10px}
.rc100g #recTable table{table-layout:fixed;width:100%}
.rc100g #recTable col.c85f,.rc100g #recTable col.c85a{width:0}.rc100g #recTable col.c85r{width:44px}.rc100g #recTable col.c85i{width:34px}
.rc100g #recTable tr>:nth-child(3),.rc100g #recTable tr>:nth-child(5){display:none}
.rc100g #recTable tr.r85>td{padding-top:3px;padding-bottom:3px;height:34px}
.rc100g #recTable .r85f{display:flex;align-items:center;gap:5px;white-space:nowrap;min-width:0;flex-wrap:nowrap}
.rc100g #recTable .r85f .portrait{width:24px!important;height:24px!important;border-radius:50%;overflow:hidden;flex:none;border:1px solid #6b5236}
.rc100g #recTable .r85f .portrait svg{width:100%;height:140%;margin-top:-2px}
.rc100g #recTable .r85n{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:13.5px}
.rc100g #recTable .r85t{flex:none;max-width:44px;overflow:hidden}
.rc1cl{flex:none;max-width:72px;overflow:hidden;text-overflow:ellipsis;font-size:11.5px;color:var(--muted)}
.rc100g #recTable .r85s{display:none}
.rc100g #recTable .r85r .stars{display:none}.rc100g #recTable .odds{font:400 15px var(--display);color:var(--gold2)}
.rc100g #recTable .r85i .meter{display:none}.rc100g #recTable .r85i small{display:none}.rc100g #recTable .r85i .rc-sub{font:11.5px var(--mono)}
.rc100g #recTable th .l85{display:none}.rc100g #recTable th .s85{display:inline}
.rc100g #recTable tr:first-child th{font:500 9.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
/* frescoes: plaster, Pompeian-red painted border, a soft vignette over the game's own pictures */
.rc1fr{position:relative;display:block;overflow:hidden;border-radius:3px;background:#cbb48a;isolation:isolate}
.rc1fr>.pic{position:absolute;inset:0;background:center/cover no-repeat;filter:sepia(.22) saturate(.9) contrast(1.04) brightness(.98)}
.rc1fr>.pic>img{width:100%;height:100%;object-fit:cover;display:block}
.rc1fr::before{content:"";position:absolute;inset:0;z-index:3;pointer-events:none;background:url('${parch}') center/220px;mix-blend-mode:multiply;opacity:.28}
.rc1fr::after{content:"";position:absolute;inset:0;z-index:4;pointer-events:none;border-radius:3px;box-shadow:inset 0 0 0 2px #e2c88e,inset 0 0 0 4px #8a2a1a,inset 0 0 0 5px #3a1a0c,inset 0 0 22px 6px #2a14068c}
.rc1rd{position:absolute;z-index:2;display:block;border-radius:50%;overflow:hidden;background:#3a2a18;box-shadow:0 0 0 2px #e2c88e,0 0 0 3.5px #8a2a1a,0 3px 8px #000a}
.rc1rd>svg,.rc1rd>img,.rc1rd>span{display:block;width:100%!important;height:100%!important}
.rc1rp .portrait{width:100%!important;height:140%!important;margin-top:-4%}
.rc1mini{position:absolute;z-index:2;filter:drop-shadow(2px 3px 2px #0008);pointer-events:none}
.rc1champ{position:absolute;z-index:2;left:calc(50% - 26px);top:6px;width:52px;height:72px;overflow:hidden;border-radius:4px;box-shadow:0 0 0 2px #e2c88e,0 0 0 3.5px #8a2a1a,0 3px 8px #000a}.rc1champ .portrait{width:100%!important;height:100%!important}
.rc1coins{position:absolute;z-index:2;right:12px;bottom:10px;display:flex;gap:1px}.rc1coins img{width:16px;filter:drop-shadow(1px 1px 1px #000)}
.rc1cap{position:absolute;z-index:5;left:10px;top:8px;font:400 14px var(--display);letter-spacing:.06em;color:#fff3d6;text-shadow:0 1px 3px #000,0 0 8px #000}
/* the banner */
.roomhd.b73>img.rc1ban{object-position:center 62%}
.roomhd.b73:has(.rc1banf) .roomttl{padding-left:62px}
.rc1banf{position:absolute;z-index:3;left:14px;bottom:18px}
.rc1banf .rc1rd{position:relative}
/* the card */
.card2.rc100{display:flex;flex-direction:column;gap:7px;padding:8px}
.rc1pnl{position:relative;border:1px solid #5a4430;border-radius:8px;background:linear-gradient(#251b13,#1c140e);min-width:0}
.rc1phd{display:block;font:500 9.5px var(--mono);letter-spacing:.14em;color:var(--muted);text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:14px;margin-bottom:3px}
.rc1head{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.95fr) minmax(0,1fr);gap:7px}
.rc1prof{display:grid;grid-template-columns:96px minmax(0,1fr);gap:10px;padding:8px}
.rc1por{width:96px;height:134px}.rc1por .rc1pp{position:absolute;inset:0;z-index:1;display:block}.rc1por .rc1pp .portrait{width:100%!important;height:100%!important;display:block}
.rc1info{display:flex;flex-direction:column;gap:2px;min-width:0}
.rc1info>div{min-width:0;flex:none!important}.rc1info>div>div:first-child{font:400 18px/1.15 var(--display)!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rc1info>div>.rc-sub{font-size:12.5px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.rc1chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:3px;align-items:center}
.rc1chips .btn.rc1ch{height:22px;padding:0 8px;border-radius:999px;font-size:12px;margin:0;border:1px solid #8a6a2a;background:#2e2212;color:var(--gold2)}
.rc1chips .want88row{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin:0;font-size:12px}.rc1chips .want88row>b{font-weight:500;color:var(--gold2)}
.rc1chips .want88row .rc-sub{font-size:11.5px}
.rc1left{display:flex;flex-direction:column;gap:5px;min-width:0}
.rc1map{margin:0;align-items:stretch}.rc1map .mi100{--mw:96px;--mh:58px;width:96px}.rc1map small{font-size:10.5px;text-align:center;overflow:hidden;text-overflow:ellipsis}
.rc1grades,.rc1pers{padding:7px 8px}
.gs98.rc1gs{display:flex;flex-direction:column;gap:3px;margin:0}
.gb98.rc1g{display:grid;grid-template-columns:18px minmax(0,1fr) 36px 34px;grid-template-rows:auto;align-items:center;gap:5px;height:22px;padding:0 6px;border-radius:4px;background:#160f0b;border:1px solid #3a2c1e;font-size:12.5px;cursor:help}
.gb98.rc1g.ov98{border-style:dashed;background:linear-gradient(#c9a45818,#160f0b)}.gb98.rc1g.p0{opacity:1;border-style:solid}
.gb98.rc1g>b{grid-row:auto;font:400 16px/1 var(--display);text-align:center;min-width:0}.gb98.rc1g>b.q{color:#8a7660}
.gb98.rc1g .nm{font-size:12.5px;color:var(--bone);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gb98.rc1g .su98{font:10px var(--mono);color:var(--gold2);letter-spacing:1px;text-align:right}.gb98.rc1g .su98 u{text-decoration:none;color:#6b5236}
.pe98.rc1pe{margin:0}.rc1pe .pe98r{display:grid;grid-template-columns:82px minmax(0,1fr);align-items:center;height:26px;margin:0;border-top:1px solid #ffffff0a;gap:6px;flex-wrap:nowrap}.rc1pe .pe98r:first-child{border-top:0}
.rc1pe .pe98l{min-width:0;font:500 9.5px var(--mono);letter-spacing:.1em}
.rc1tg{display:inline-block;border:1px solid #5a4430;border-radius:3px;padding:0 5px;font-size:12px;margin-right:3px;background:#2a1f17;line-height:18px}
.rc1tg.w{border-color:#4a7a2a;background:#1e2a14;color:#cfe8b0}.rc1tg.t{border-color:var(--gold);color:var(--gold2);background:#3a2a18}
.rc1pe b{color:var(--gold2);font-weight:600}
.pe98.rc1lock{height:128px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:6px;border:1px dashed #6b5236;border-radius:6px;margin-top:2px;color:var(--muted);font-size:12.5px;text-align:center;padding:6px}
.rc1lock b{color:var(--bone)}
/* steps */
.rsteps.rc1steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:0}
.rc1steps .rstep.rc1st{display:flex;flex-direction:row!important;align-items:center;justify-content:center;gap:8px;height:36px;border-radius:7px;font:400 16px var(--display);letter-spacing:.06em;border:1px solid #6b5236;background:linear-gradient(#2e2318,#1e160f);color:var(--bone);min-width:0;white-space:nowrap;overflow:hidden;padding:0 8px;margin:0}
.rc1st .n{font:500 10px var(--mono);color:var(--muted);border:1px solid #6b5236;border-radius:50%;width:18px;height:18px;display:grid;place-items:center;flex:none}
.rc1st small{font:11px var(--mono);color:var(--muted);letter-spacing:0}
.rc1st.scout.cur{border-color:#c9a458;background:linear-gradient(#5a4520,#3a2c14);color:#f3e3bd}
.rc1st.court.cur{border-color:#7fae5f;background:linear-gradient(#3e5a2a,#26381a);color:#e3f2d0}
.rc1st.offer.cur{border-color:#d0574a;background:linear-gradient(#7a2a20,#4e1a14);color:#ffe0d6}
.rc1st.cur small{color:inherit;opacity:.8}
.rc1pane{display:flex;flex-direction:column;gap:7px;padding:0;border:0;background:none}
/* scout */
.rc1hrs.rh98{display:flex;flex-wrap:nowrap;align-items:center;gap:10px;min-height:30px;padding:3px 10px;white-space:nowrap;margin:0;font-size:13px}
.rc1hrs>b{font:400 15px var(--display);color:var(--gold2)}.rc1hrs .rh98n{color:#b9e39a;font-size:13px}
.rc1pips{display:flex;gap:2px;flex-wrap:nowrap;overflow:hidden;min-width:0}.rc1pips i{width:9px;height:9px;border-radius:2px;background:#7fae5f;flex:none}.rc1pips i.u{background:#3a3020}.rc1pips i.him{background:#d6ab4c}
.rc1hrs .sub{color:var(--muted);font-size:12.5px;margin-left:auto}
.ra98.rc1acts{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}
.btn.rc1act{position:relative;display:grid;grid-template-rows:120px 20px 18px 16px;gap:2px;text-align:left;border:1px solid #5a4430;border-radius:7px;background:linear-gradient(#2a1f17,#1e160f);padding:5px;margin:0;white-space:normal;min-width:0;color:var(--bone)}
.btn.rc1act .rc1fr{height:120px}.btn.rc1act>b{font-size:13.5px;font-weight:600}.btn.rc1act .cost{font:11.5px var(--mono);color:var(--gold2)}.btn.rc1act>small{font:11px var(--mono);color:var(--muted);display:block}
.btn.rc1act.done{opacity:.62}.btn.rc1act[disabled]{opacity:.55;cursor:not-allowed}.btn.rc1act.done[disabled]{opacity:.62}
.btn.rc1act.adv74,.btn.rc1pit.adv74{border-color:#d6ab4c;box-shadow:0 0 0 1px #d6ab4c,0 0 12px #d6ab4c33}
.rc1done{position:absolute;z-index:6;top:9px;right:9px;font:10px var(--mono);color:#9be86c;background:#1a2a12e0;border-radius:3px;padding:0 5px}
.star85.rc1adv{position:absolute;z-index:7;top:-8px;left:8px;font:600 9px var(--mono);font-style:normal;letter-spacing:.08em;color:#1a1008;background:linear-gradient(#f0cf7d,#c99a3a);border-radius:3px;padding:1px 5px;margin:0;border:0}
.rc1learn{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
.rc1lg{padding:7px 10px}
.rc1row{display:grid;grid-template-columns:76px minmax(0,1fr) 54px;white-space:nowrap;gap:8px;align-items:center;height:24px;border-top:1px solid #ffffff0a;font-size:12.5px}
.rc1row:first-of-type{border-top:0}.rc1row>span:first-child{font:11px var(--mono);color:var(--dim);overflow:hidden;text-overflow:ellipsis}.rc1row>span:last-child{text-align:right;font:11.5px var(--mono);color:var(--gold2)}
/* court */
.rc1hg{display:grid;grid-template-columns:118px minmax(0,1fr);align-items:center;padding:5px 8px;gap:6px}.rc1hg .rc1phd{margin:0}
.hg98.rc1hgg{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;margin:0}
.rc1hgg .hg98c{display:flex;justify-content:space-between;align-items:center;gap:4px;height:24px;border:1px solid #5a4430;background:#160f0b;border-radius:4px;padding:0 3px 0 7px;font-size:12px;min-width:0;white-space:nowrap;overflow:hidden}
.rc1hgg .hg98c.hot{border-color:#7fae5f;box-shadow:0 0 0 1px #7fae5f55}.rc1hgg .hg98c.deal{border-color:#d07a5a}
.rc1pmeta{display:flex;justify-content:space-between;gap:10px;align-items:center;font-size:11.5px;color:var(--dim)}
.pg98.rc1pg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
.btn.rc1pit{position:relative;display:grid;grid-template-rows:80px 20px 20px 16px;gap:2px;text-align:left;border:1px solid #5a4430;border-radius:7px;background:linear-gradient(#2a1f17,#1e160f);padding:5px;margin:0;min-width:0;white-space:normal;color:var(--bone)}
.btn.rc1pit .rc1fr{height:80px}.btn.rc1pit.wm{border-color:#7fb27a}
.rc1pit .t1{display:flex;align-items:center;gap:6px;min-width:0}.rc1pit .t1 b{flex:1;font:400 14.5px var(--display);color:#f3e3bd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rc1gain{flex:none;min-width:36px;text-align:center;font:500 12.5px var(--mono);color:#160f0b;background:linear-gradient(#b9e39a,#7fae5f);border-radius:3px;padding:0 3px}.rc1gain.lo{background:linear-gradient(#e9d9a0,#b9a050)}.rc1gain.neg{background:linear-gradient(#e9a090,#b95040)}
.rc1gain i{font-style:normal;opacity:.7}
.rc1pit .t2{display:grid;grid-template-columns:84px 28px minmax(0,1fr);gap:5px;align-items:center;font-size:12px;color:var(--muted);min-width:0}
.rc1pit .t2 .tags{white-space:nowrap;overflow:hidden}.rc1pit>small{font-size:11.5px;color:var(--muted);display:block}
.rc1low{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.1fr) minmax(0,1.1fr);gap:7px}
.rc1low>.rc1pnl{padding:6px 8px;min-height:134px}
.btn.rc1wo{display:grid;grid-template-columns:70px minmax(0,1fr);gap:8px;align-items:center;height:50px;margin:4px 0 0;padding:2px;width:100%;text-align:left;background:none;border:1px solid transparent;color:var(--bone)}
.btn.rc1wo:hover:not([disabled]){border-color:#6b5236}.btn.rc1wo .rc1fr{height:46px}
.rc1wt{min-width:0;display:block}.rc1wt b{display:block;font-size:13px}.rc1wt .l2{display:flex;justify-content:space-between;gap:6px;white-space:nowrap}.rc1wt small{font-size:11.5px;color:var(--muted)}.rc1wt .c{flex:none;font:11.5px var(--mono);color:var(--gold2)}
.suit.rc1su{display:grid;grid-template-columns:22px minmax(0,1fr) 70px 24px;gap:6px;align-items:center;height:20px;font-size:12.5px;margin:1px 0}
.rc1su .rc1sh{display:grid;place-items:center;width:20px;height:20px}.rc1su .rc1sh img,.rc1su .rc1sh svg{max-width:20px;max-height:20px}
.rc1su .rc1bar{display:block!important;height:6px!important;border-radius:3px;background:#3a2c1e;overflow:hidden;padding:0}.rc1su .rc1bar i{display:block;height:100%}
.rc1su .n{font:11.5px var(--mono);text-align:right}.rc1su.me{color:var(--gold2)}
.rc1stand .rc1su{height:24px}
.rc1need{font-size:11.5px;color:var(--muted);margin-top:3px}.rc1need b{color:var(--gold2)}
.rc1notes{background:linear-gradient(90deg,#c9b083,#e6d6b2 6%,#e6d6b2 94%,#c9b083)!important;color:#3a2616;border-color:#8a6a3a!important}
.rc1notes .rc1phd{color:#6b4a22}
.btn.rc1nr{display:grid;grid-template-columns:78px minmax(0,1fr) 72px;gap:6px;align-items:center;height:32px;width:100%;margin:0;padding:0 4px;border:0;border-top:1px solid #8a6a3a44;border-radius:0;background:none;font-size:12.5px;color:#3a2616;text-align:left}
.rc1notes .btn.rc1nr:first-of-type{border-top:0}.btn.rc1nr b{font:400 14px var(--display);color:#3a1a0c}.btn.rc1nr.best{background:#ffffff40}.btn.rc1nr:hover:not([disabled]){background:#ffffff55}.btn.rc1nr[disabled]{opacity:.6}
.rc1nr .fit{white-space:nowrap;font:600 10px var(--mono);border-radius:3px;padding:1px 5px;text-align:center}
.rc1nr .fit.good{background:#4a7a2a;color:#eaf6d8}.rc1nr .fit.fair{background:#9a7a2a;color:#fff3d0}.rc1nr .fit.weak{background:#8a3a2a;color:#ffe0d6}
.rc100x{border:1px dashed #5a4430;border-radius:8px;padding:6px 8px}
/* offer */
.rc1offr{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:7px}
.rc1ocol{display:flex;flex-direction:column;gap:7px;min-width:0}
.rc1off{padding:10px 12px}.rc1off .ofrow label{font:400 20px var(--display);color:var(--gold2);white-space:nowrap}.rc1off .ofrow{display:flex;align-items:center;gap:12px}.rc1off .ofrow input[type=range]{flex:1;accent-color:#d6ab4c}
.rc1off .acts .btn.primary{width:100%;min-height:42px;border-radius:7px;border:1px solid #d0574a;background:linear-gradient(#b8352a,#8f2219);color:#fff3e6;font:400 17px var(--display);letter-spacing:.06em}
.rc1off .acts .btn.primary small{font:11px var(--body);letter-spacing:0;opacity:.85}
.rc1off{overflow:hidden}.rc1off #ofMeter *{white-space:normal;min-width:0}.rc1off #ofMeter .want88c{display:inline-block}.rc1off #ofMeter{margin-top:6px;border:1px solid #5a4430;border-radius:6px;padding:7px 10px;background:#160f0b}
.rc1stand{padding:6px 8px;flex:1}
.rc1tab{display:flex;flex-direction:column;border-radius:8px;padding:7px;background:linear-gradient(135deg,#7a4e26,#5a3618 40%,#6e4420 70%,#4a2c12);box-shadow:inset 0 0 0 1px #a2703a,inset 0 0 12px #2a1606,0 4px 12px #0008;min-width:0}
.rc1strip{height:40px;flex:none;border-radius:4px 4px 0 0}
.rc1wax{flex:1;margin-top:5px;border-radius:3px;padding:8px 12px 10px;background:radial-gradient(ellipse at 30% 20%,#4a3a24,#2e2414 70%);box-shadow:inset 0 2px 8px #000c,inset 0 0 0 1px #1a1008;color:#e8d6ae;display:flex;flex-direction:column}
.rc1clerk{display:grid;grid-template-columns:30px minmax(0,1fr);gap:8px;align-items:center;min-height:34px;font-size:12.5px;color:#d8c49a;border-bottom:1px dashed #8a6a3a66;margin-bottom:4px}
.rc1clerk b{color:#f0cf7d;font-weight:600}
.rc1party{font:400 14px var(--display);color:#f3e3bd;line-height:22px}.rc1party b{color:#f0cf7d;font-weight:400}
.rc1tsub{font:500 9.5px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:#c4ae8c;line-height:22px;border-top:1px solid #8a6a3a44;margin-top:3px}
.rc1tr{display:grid;grid-template-columns:84px minmax(0,1fr) 66px;gap:8px;align-items:center;height:26px;font-size:13px;font-family:Georgia,serif}
.rc1tr>span:first-child{color:#d6bf93;font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rc1tr>span:last-child{text-align:right;font:12px var(--mono);color:#f0cf7d;white-space:nowrap}
.rc1tr.ok>span:last-child{color:#9be86c}.rc1tr.no>span:last-child{color:#ff9a8a}
.rc1seals{margin-top:auto;padding-top:8px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
.rc1seal{display:flex;align-items:center;gap:8px;min-height:52px;border-top:1px dashed #8a6a3a77;padding-top:6px;min-width:0}
.rc1seal span{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font:400 15px var(--display)}
.rc1seal.mine span{background:radial-gradient(circle at 38% 32%,#d84a3a,#8a1a12 70%);color:#ffd8c8;box-shadow:0 2px 4px #000a,inset 0 0 0 3px #a3281f,inset 0 0 0 5px #6a120c;opacity:.7}
.rc1seal.his span{border:2px dashed #8a6a3a;color:#c4ae8c}.rc1seal small{font-size:11.5px;color:#c4ae8c}
/* tablets / phones */
@media (max-width:1250px){.ra98.rc1acts{grid-template-columns:repeat(3,minmax(0,1fr))}.rc1head{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.rc1prof{grid-column:1/-1}.rc1low{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.rc1notes{grid-column:1/-1}.hg98.rc1hgg{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (max-width:900px){.rc1offr{grid-template-columns:minmax(0,1fr)}.pg98.rc1pg{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:600px){
 .card2.rc100{padding:6px}.rc1head,.rc1low,.rc1learn{grid-template-columns:minmax(0,1fr)}
 .rc1prof{grid-template-columns:76px minmax(0,1fr)}.rc1por{width:76px;height:106px}.rc1map .mi100{--mw:76px;--mh:48px;width:76px}.rc1map small{display:none}
 .rsteps.rc1steps{position:sticky;top:0;z-index:8;background:#1a120d;padding:4px 0}
 .rc1st small{display:none}.rc1steps .rstep.rc1st{font-size:15px;gap:5px}
 .ra98.rc1acts{grid-template-columns:repeat(2,minmax(0,1fr))}.btn.rc1act{grid-template-rows:90px 20px 18px 16px}.btn.rc1act .rc1fr{height:90px}
 .pg98.rc1pg{grid-template-columns:repeat(2,minmax(0,1fr))}.btn.rc1pit{grid-template-rows:84px 20px 20px 16px}.btn.rc1pit .rc1fr{height:84px}
 .rc1pit .t2{grid-template-columns:70px 28px}.rc1pit .t2 .tags{display:none}
 .hg98.rc1hgg{grid-template-columns:repeat(2,minmax(0,1fr))}.rc1hg{grid-template-columns:minmax(0,1fr)}
 .rc1hrs .sub,.rc1pips{display:none}.rc1pmeta span:last-child{display:none}
 .rc1tr{grid-template-columns:74px minmax(0,1fr) 56px}.rc1off .ofrow label{font-size:17px}
 .rc1notes{grid-column:auto}
}
/* ===== signing day ===== */
.signcard.sg100{grid-template-columns:minmax(0,1fr);justify-items:center;background:radial-gradient(ellipse at 50% 45%,rgba(20,12,6,.72),rgba(8,5,3,.94));overflow:auto;padding:16px;align-items:center}
.sg100 .sgbox.sg1card{position:relative;z-index:2;width:min(820px,100%);max-width:100%;box-sizing:border-box;text-align:left;justify-items:stretch;background:linear-gradient(#2a1f17,#1a120c);border:2px solid var(--gold);border-radius:14px;
 box-shadow:0 0 0 1px #000,0 24px 70px rgba(0,0,0,.8),inset 0 0 0 4px rgba(240,207,125,.08);padding:18px 22px 16px;display:grid;grid-template-columns:230px minmax(0,1fr);gap:8px 24px;transition:border-color .6s,box-shadow .6s}
.sg1kick{grid-column:1/-1;display:flex;align-items:center;gap:10px;font:700 12px var(--mono);letter-spacing:3px;color:var(--gold2);text-transform:uppercase}
.sg1kick:before,.sg1kick:after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.sg1who{text-align:center;position:relative}
.sg1frame{position:relative;width:200px;height:250px;margin:4px auto 0}
.sg1pic.sgface{position:absolute;inset:14px 18px 10px;width:auto;height:auto;border-radius:50% 50% 8px 8px/38% 38% 8px 8px;overflow:hidden;border:3px solid var(--cc);box-shadow:0 0 0 2px #1a120c,0 0 22px rgba(240,207,125,.25);transition:filter 1s 2s}
.sg1pic .portrait{width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;display:block}.sg1pic .portrait *{max-height:none!important;max-width:none!important}.sg1pic .portrait svg{width:100%;height:100%;display:block}
.sg1lau{position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .6s 2.2s;pointer-events:none}
.sg1nm h2{margin:6px 0 0;font:400 23px/1.1 var(--display);color:var(--gold2)}
.sg1nm .sub{font-size:13.5px;color:var(--muted);margin-top:3px}.sg1nm .cls{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px}
.sg1terms{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:10px}
.sg1terms span{background:var(--panel2);border:1px solid var(--line2);border-radius:6px;padding:5px 2px;font-size:11.5px;color:var(--muted);text-align:center}
.sg1terms b{display:block;font:700 16px var(--body);color:var(--bone)}
.sg1clause{margin-top:6px;font-size:12.5px;color:var(--muted)}.sg1clause b{color:var(--gold2)}
.sg1truth h3{margin:2px 0;font:400 21px var(--display);color:var(--gold2);display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.sg1truth h3 small{font:13px var(--body);color:var(--muted)}
.tr98.sg1grid{display:grid;gap:5px;margin-top:8px;padding:0;border:0;background:none}
.sg1rw{position:relative;display:grid;grid-template-columns:120px 76px 22px 96px minmax(0,1fr);align-items:center;gap:8px}
.sg1rw .lb{font-size:14px;color:var(--bone)}.sg1rw .lb i{font-style:normal;margin-right:5px}.sg1rw .arr{color:var(--dim);text-align:center}
.sg1t{position:relative;height:44px;perspective:500px}
.sg1t .in{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.3,.7,.3,1.2);transition-delay:calc(var(--d)*.25s)}
.sg1rw.ovr .sg1t .in{transition-delay:1.6s}
.sg1t .f,.sg1t .b{position:absolute;inset:0;backface-visibility:hidden;border-radius:6px;display:flex;align-items:center;justify-content:center;gap:6px}
.sg1t .sc{background:#e9dcbf url('${parch}') center/cover;color:#2a1708;border:1px solid #9c8058;font:700 21px var(--display)}
.sg1t .sure{display:flex;gap:2px;flex-direction:column}.sg1t .sure i{width:4px;height:4px;border-radius:50%;background:#2a1708;opacity:.2}.sg1t .sure i.on{opacity:.85}
.sg1t .rl{background:linear-gradient(#3a2a17,#24190f);border:1px solid var(--gold);color:var(--gold2);font:700 21px var(--display)}.sg1t .rl small{font:700 13px var(--mono);color:var(--bone)}
.sg1t.real .b{transform:rotateY(180deg)}
.sg1t .seal{background:var(--panel2);border:1px dashed var(--line3,#6a5130)}.sg1t .seal i{width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#d24a3a,#7a1a12);box-shadow:0 1px 2px #000}
.sg1t.ghost .f{background:var(--panel2);border:1px dashed var(--line3,#6a5130);color:var(--dim);font:700 17px var(--display)}
.sg100.go .sg1t.real .in{transform:rotateY(180deg)}
.sg1rw .dl{font:700 12.5px var(--mono);opacity:0;transition:opacity .4s;transition-delay:calc(var(--d)*.25s + .6s)}.sg1rw.ovr .dl{transition-delay:2.2s}
.sg1rw .dl em{font-style:italic;font-weight:600}
.sg1rw .dl.up{color:#9fd77e}.sg1rw .dl.dn{color:#ff9a86}.sg1rw .dl.eq{color:var(--dim)}
.sg100.go .sg1rw .dl{opacity:1}
.sg1rw.ovr{margin-top:6px;padding-top:8px;border-top:1px solid var(--line2)}.sg1rw.ovr .lb{font:400 16px var(--display);color:var(--gold2)}
.sg1rw.ovr .sg1t{height:54px}.sg1rw.ovr .sc,.sg1rw.ovr .rl{font-size:27px}
.sg1crack{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .3s 2.2s}
.sg1verdict{grid-column:1/-1;position:relative;margin-top:6px;border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:14px;min-height:74px;opacity:0;transform:translateY(8px);transition:opacity .5s 2.2s,transform .5s 2.2s;border:1px solid var(--line2)}
.sg100.go .sg1verdict{opacity:1;transform:none}
.sg1verdict .big{font:400 30px/1 var(--display);letter-spacing:.04em;white-space:nowrap}
.sg1verdict .rec{display:flex;gap:10px;align-items:center;flex:1;min-width:0;font-size:14px;font-style:italic;color:#e8dcc0}
.sg1verdict .rec .rc1rd{flex:none;box-shadow:0 0 0 2px #b08a3c}
.sg1verdict .rec small{display:block;font-style:normal;font-size:12px;color:var(--muted)}
.sg1acts{grid-column:1/-1;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:4px}.sg1acts .btn{margin:0}
.sg100.pre .sg1after{display:none}.sg100:not(.pre) .sg1seal{display:none}
.sg100.pre .sg1verdict{display:none}
.sg1rm{grid-column:1/-1;font:11px var(--mono);color:var(--dim);text-align:right}
.sg1burst{position:fixed;left:50%;top:50%;width:1400px;height:1400px;margin:-700px 0 0 -700px;pointer-events:none;opacity:0;z-index:1;
 background:repeating-conic-gradient(from 0deg,rgba(240,207,125,.16) 0 6deg,transparent 6deg 18deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 62%);mask:radial-gradient(circle,#000 0,transparent 62%)}
.sg1sparks span{position:fixed;left:50%;top:40%;z-index:3;width:8px;height:8px;border-radius:50%;background:#ffe39a;box-shadow:0 0 8px #f0cf7d;opacity:0;pointer-events:none}
.sg100.go.s-gem .sg1sparks span{animation:sg1fly 1.6s ease-out forwards}
@keyframes sg1fly{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--x),var(--y)) scale(.4)}}
.sg100.go.s-gem .sg1burst{animation:sg1burst 4s ease-out 2s 1 forwards}
@keyframes sg1burst{0%{opacity:0;transform:rotate(0)}25%{opacity:1}100%{opacity:.35;transform:rotate(24deg)}}
.sg100.s-gem .sg1verdict{background:linear-gradient(90deg,rgba(214,171,76,.35),rgba(214,171,76,.08));border-color:var(--gold2);box-shadow:0 0 26px rgba(240,207,125,.35)}
.sg100.s-gem .sg1verdict .big{color:#ffe39a;text-shadow:0 0 14px rgba(240,207,125,.6)}
.sg100.go.s-gem .sg1lau{opacity:1}
.sg100.go.s-gem .sg1card{border-color:#ffe39a;box-shadow:0 0 0 1px #000,0 0 60px rgba(240,207,125,.35),0 24px 70px rgba(0,0,0,.8)}
.sg100.s-dud .sg1t .rl{border-color:#8a7a62;color:#d9ccb0;background:linear-gradient(#3a332b,#26211c)}
.sg100.s-dud .sg1verdict{background:linear-gradient(90deg,rgba(120,100,80,.35),rgba(60,50,40,.15));border-color:#8a7a62}.sg100.s-dud .sg1verdict .big{color:#d9ccb0}
.sg100.go.s-dud .sg1crack{opacity:1}
.sg100.go.s-dud .sg1pic{filter:saturate(.55) brightness(.92)}
.sg1dust{position:absolute;width:60px;height:60px;border-radius:50%;background:radial-gradient(rgba(190,170,140,.55),transparent 70%);filter:blur(2px);opacity:0;pointer-events:none}
.sg100.go.s-dud .sg1dust{animation:sg1dust 2.4s ease-out 2.2s forwards}
@keyframes sg1dust{0%{opacity:0;transform:translate(0,0) scale(.4)}25%{opacity:.9}100%{opacity:0;transform:translate(var(--x),-30px) scale(1.8)}}
.sg100.s-fair .sg1verdict{background:linear-gradient(90deg,rgba(111,174,76,.22),rgba(111,174,76,.05));border-color:#6f9a5a}.sg100.s-fair .sg1verdict .big{color:#cfe8b8}
/* skipped (still) and Reduce motion / Animations Off (rm): the last frame, no motion */
.sg100.still *,.sg100.still{transition-delay:0s!important;transition-duration:0s!important}
.sg100.still .sg1sparks,.sg100.rm .sg1sparks,.sg100.rm .sg1burst,.sg100.rm .sg1dust,.sg100.still .sg1dust{display:none}
.sg100.still.s-gem .sg1burst{animation:none;opacity:.35}
.sg100.rm *{transition:none!important;animation:none!important}
.sg100.rm .sg1t.real .in{transform:none!important}.sg100.rm .sg1t.real .f{display:none}.sg100.rm .sg1t.real .b{transform:none}
@media (max-width:600px){
 .signcard.sg100{place-items:start center;padding:10px}
 .sg100 .sgbox.sg1card{grid-template-columns:minmax(0,1fr);padding:12px;gap:6px}
 .sg1who{display:grid;grid-template-columns:110px minmax(0,1fr);gap:4px 10px;text-align:left;align-items:center}
 .sg1frame{width:110px;height:138px;grid-row:1/3;margin:0}.sg1pic.sgface{inset:8px 10px 6px}
 .sg1nm h2{font-size:19px;margin:0}.sg1terms,.sg1clause{grid-column:1/-1}
 .sg1rw{grid-template-columns:86px 58px 14px 76px minmax(0,1fr);gap:5px}.sg1rw .lb{font-size:13px}
 .sg1t{height:38px}.sg1t .sc,.sg1t .rl{font-size:18px}.sg1t .rl small{font-size:11px}
 .sg1rw.ovr .sg1t{height:46px}.sg1rw.ovr .sc,.sg1rw.ovr .rl{font-size:22px}
 .sg1rw .dl{font-size:11px}.sg1rw .dl em{display:none}
 .sg1verdict{flex-wrap:wrap;gap:8px}.sg1verdict .rec{flex-basis:100%}.sg1verdict .big{font-size:24px}
 .sg1acts .btn{flex:1}
}`;document.head.appendChild(st)})();

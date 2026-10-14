/* =====================================================================
   319-V101RULES · v1.01 workstream B2 — Manager rules (his 2026-10-13 notes + answers 6a 7a 9a)
   =====================================================================
   Wrappers over finished code (nothing is edited in place except the levy filter in 17-manager); every random pick uses a hash (any100Hash-style),
   never the dice RNG. Kill switch: localStorage flavius_rules101off=1 (no wrappers act). Test tv101c.
   M13  A fighter of yours who sits in an infirmary BED, is MISSING ANY LIMB, is seriously hurt, hurt or at war cannot be entered (classic bout
        picker greys him with the reason, specials' picker + any100Why, exhibitions, road deals, starter auto-fill); a bed/limb patient put on a
        card by another path is taken off at the next render. A RESTING fighter is no longer refused: entering him cancels his rest; putting a
        fighter on rest takes him off every unfought bout (specials refund the fee while the card is not full).
   M17  The Armory fold "Spares on the shelf" → "Spares — sell": says it is about selling duplicates, never a second stock to buy.
   M19  The Recruiter's hours scale with the roster (≤3 fighters 24 h, 4-6 16 h, 7-9 10 h, 10+ 6 h) + the Recruiter's level bonus (REC98.perLv);
        the reason is in the hours tooltips (rail oval, tab, card).
   M23  "Bare hands / without armor" checklist items only for healthy fighters who are not in a bed and not missing a limb; the Armory refuses to
        equip a fighter in a bed or hurt (reason shown, the chip says so).
   M24  LOANER KIT: a fighter on loan wears only a gladius + padded leg wraps (pieces flagged ln101). His own gear is left on his home house's shelf
        and comes back on him when the loan ends; loaner pieces that are replaced or when he returns VANISH (never any shelf). The borrower (you)
        may re-equip a borrowed fighter from his own shelf (pieces own101 go home with it).
   M27  A full headline special: the full card keeps a free-agent FILLER seat open (one per side in a team event) so you may still enter on the day by
        bumping a filler for the entry fee; a rival house's fighter is never bumped; the refusal says why.
   M28  A bout's results show the coin each of your fighters brought home (appearance fee + purse share) — the results table, the bout's line and the
        Match Week sheet (b.res.house101).
   M29  Once all of the week's bouts are fought, no armor-repair items (checklist, desk, End the week list) until the next week.
   M32  Match Week: under each unfought bout "Why the others don't fit" lists every fighter of yours that cannot be entered and the reason (rating
        band, hurt, bed, limb, rest, already entered, loan, war, withdrew twice).
   M35  War: the levy never takes a hurt / bedded / limb-less fighter (also when a pending levy comes due); a fighter who goes to war leaves his bed,
        comes off the card, his gear + offerings go to the shelf (inj95Sweep) and he is locked like a loaned one.
   M37  The "asks for a fight" task goes when the week's bouts are all fought; the outcome is applied at the week's end and listed in the
        Week in review ("What it cost / earned", w.review.fx101). rev101Note(w,{ic,txt,coin}) is the hook for other effects.
   M40  One desk row per advisor (answer 7a): the open tasks of one advisor become ONE row that unfolds into its lines; each line keeps its own
        button, handler, ✕ and Decide. Required (tier 1) rows stay alone. localStorage flavius_deskgrp101off=1 = no grouping (tv99k, tv100l, tv100l2 run with it).
   M41  BUG: a limb a fighter regrew mid-bout stayed in glad.severed (applyBout only ever added), so the Armory / the bout saw a leg missing and put
        one leg armor on. applyBout now removes the limbs the row shows regrown; SAVE_MIGRATIONS '1.01' + a render repair normalise severed lists.
   M42  "N unspent training hours" opens the Training Yard (its button is re-pointed; a capture guard puts the tab back if anything redirected).
   ===================================================================== */
const R101={open:new Set(),grpCache:null,inPut:0};
const r101Off=()=>{try{return localStorage.getItem('flavius_rules101off')==='1'}catch(e){return false}};
const r101Mine=g=>{try{const pm=me();return !!(g&&pm&&g.contract&&g.contract.mgr===pm.id)}catch(e){return false}};
const r101Bed=g=>{try{return typeof inBed76==='function'&&inBed76(g)}catch(e){return false}};
const r101Fought=w=>!!(w&&w.night&&w.night.bouts&&w.night.bouts.length&&w.night.bouts.every(b=>b.done));
const r101Plain=s=>String(s==null?'':s).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
/* the reason a fighter of yours cannot be entered ('' = he can). Rest is NOT a block (entering ends it). r101Bare = the phrase without his name. */
function r101Bare(g){if(r101Off()||!g)return '';if(g.alive===false)return _T('is gone from the league');if(!r101Mine(g))return '';
  if(g.inj&&g.inj.war)return _T('is away at war');
  if(r101Bed(g))return _T('is in an infirmary bed');
  const sev=(g.severed||[]).filter((l,i,a)=>a.indexOf(l)===i);
  if(sev.length)return _T`has lost ${sev.map(l=>(LOCN[l]||l).toLowerCase()).join(' and ')} — only Hygeia regrows a limb`;
  if(g.inj)return _T`is hurt (${g.inj.label})`;
  try{if(typeof serious76==='function'&&serious76(g))return _T('is seriously hurt')}catch(e){}
  return ''}
const r101Block=g=>{const b=r101Bare(g);return b?g.name+' '+b+'.':''};
const r101Short=g=>{const a=g.inj&&g.inj.war?_T('at war'):r101Bed(g)?_T('in a bed'):(g.severed||[]).length?_T('lost a limb'):g.inj?_T('hurt'):_T('is seriously hurt');return a};

/* ---------- M13 · who may be entered ---------- */
{const base=any100Why;any100Why=function(w,b,g){let rest=false;try{if(g&&w&&g.restWk===w.week&&r101Mine(g)&&!r101Off()){rest=true;g.restWk=null}}catch(e){}
  try{const why=r101Block(g);if(why)return why;return base.apply(this,arguments)}finally{if(rest)g.restWk=w.week}}}
{const base=any100Short;any100Short=function(w,b,g){try{if(r101Block(g))return r101Short(g);if(g&&w&&g.restWk===w.week&&r101Mine(g))return _T('resting')}catch(e){}return base.apply(this,arguments)}}
/* leaving the rest: entering a resting fighter ends his rest */
function r101Unrest(g,why){const w=W_();if(!g||!w||g.restWk==null||g.restWk!==w.week)return false;g.restWk=null;if(g.ord87&&g.ord87.r==='rest')g.ord87.r='off'; /* a standing rest order would put him straight back */
  try{tnews(_T`🛏 ${esc(g.name)}'s rest week ends — ${why||_T('he is entered')}.`)}catch(e){}return true}
{const base=any100Enter;any100Enter=function(w,bi,gid,o){const g=gById(gid);const resting=!!(g&&r101Mine(g)&&g.restWk!=null&&g.restWk===w.week&&!r101Off());const r=base.apply(this,arguments);
  try{if(r&&r.ok&&resting)r101Unrest(g,_T('entered'))}catch(e){}return r}}
/* the classic picker: (window capture runs before 183's guards) clear the rest of the chosen fighter, refuse the blocked one */
window.addEventListener('click',e=>{if(r101Off())return;const t=e.target;if(!t||!t.closest)return;
  const b=t.closest('#mgrBody [data-mg="enter"]');
  if(b&&!b.disabled){const s=document.getElementById('ent'+b.dataset.id);const g=s?gById(s.value):null;if(!g)return;const why=r101Block(g);
    if(why){e.preventDefault();e.stopImmediatePropagation();try{mToast('⛔ '+why)}catch(err){}return}
    r101Unrest(g,_T('entered'));return}
  const rb=t.closest('#mgrBody [data-rest]');
  if(rb){const g=gById(rb.dataset.rest),w=W_();if(g&&w&&g.restWk!==w.week&&r101Mine(g))r101OffCard(w,g,_T('he rests'))}},true);
/* take a fighter of yours off every unfought bout (a special refunds its fee while the card is not full) */
function r101OffCard(w,g,why){const n=w&&w.night;if(!n||!n.bouts||!g)return 0;const m=me();let k=0;
  for(let bi=0;bi<n.bouts.length;bi++){const b=n.bouts[bi];if(b.done||!b.ents.includes(g.id))continue;
    if(typeof any100Sp==='function'&&any100Sp(b)){const A=b.any100,full=!!(n.any100&&n.any100.full);const back=(A.paid[g.id]||0)+(A.hire[g.id]?A.hire[g.id].c:0);
      delete A.paid[g.id];delete A.hire[g.id];delete A.ed[g.id];if(!full&&back&&m)m.coin+=back;any100Pull(w,g.id);k++;continue}
    const T=TIERS[b.tier];const used=new Set(n.bouts.flatMap(x=>x.ents));
    const rep=freeAgents().find(q=>!used.has(q.id)&&!q.inj&&q.restWk!==w.week&&T&&effOvr(q)>=T.lo-3&&effOvr(q)<=T.hi+3)||genGlad({ovr:(T?T.lo:50)+5});
    if(!rep.debut)rep.debut={s:w.season,wk:w.week};if(!gById(rep.id))w.glads.push(rep);b.ents[b.ents.indexOf(g.id)]=rep.id;if(typeof voidBets==='function')voidBets(b,g.id);k++}
  if(k)try{tnews(_T`📋 ${esc(g.name)} comes off the card — ${why||''}.`)}catch(e){}
  return k}
/* exhibitions and road deals */
{const base=exhibSetup;exhibSetup=function(myGid){const g=gById(myGid);const why=r101Block(g);if(why){try{mToast('⛔ '+why)}catch(e){}return null}if(g&&r101Mine(g))r101Unrest(g,_T('he fights'));return base.apply(this,arguments)}}
{const base=travelClick;travelClick=function(a){if(a==='traveldeal'&&!r101Off()){try{const w=W_(),t=travelState(w);const g=t&&t.offer&&gById(t.offer.gid);const why=r101Block(g);if(why){mToast('⛔ '+why);return}
      if(g&&r101Mine(g))r101Unrest(g,_T('the deal'))}catch(e){console.error(e)}}return base.apply(this,arguments)}}
/* the starters' auto-fill skips whoever cannot fight */
{const base=st95Fill;st95Fill=function(w,pm){const hold=[];try{if(!r101Off())for(const g of st95Pool(w,pm))if(g.slot95&&r101Block(g)){hold.push([g,g.slot95]);g.slot95=0}}catch(e){}
  try{return base.apply(this,arguments)}finally{for(const [g,s] of hold)g.slot95=s}}}
/* a sweep on every render: a bed / limb / war patient never stays on an unfought card */
function r101Sweep(){try{const w=W_();if(!w||w.dead||w.tutorial||r101Off())return 0;if(typeof S!=='undefined'&&S&&!S.over&&(S.mgrCtx||S.exhibCtx||S.pen76))return 0; /* never reshuffle the card under a bout in play */const pm=me();if(!pm)return 0;let n=0;
  for(const g of rosterOf(pm)){if(!r101Block(g)&&!(g.inj&&g.inj.war))continue;if(typeof onCard==='function'&&onCard(g))n+=r101OffCard(w,g,_T('he cannot fight'))}
  /* war leaves the bed */
  for(const g of rosterOf(pm)){if(g.inj&&g.inj.war&&r101Bed(g)){w.beds76=(w.beds76||[]).filter(id=>id!==g.id);n++;try{tnews(_T`⚔ ${esc(g.name)} marches to war and leaves his bed in the Infirmary.`)}catch(e){}}}
  return n}catch(e){console.error(e);return 0}}
{const base=inj95Sweep;inj95Sweep=function(){const r=base.apply(this,arguments);try{r101Sweep()}catch(e){}return r}}
{const base=render;render=function(){try{r101Sweep()}catch(e){}return base.apply(this,arguments)}}

/* ---------- M32 · Match Week: why a fighter does not fit ---------- */
function r101WhyNot(w,b,g){const T=TIERS[b.tier];const n=w.night;
  const blk=r101Bare(g);if(blk)return blk;
  if(g.restWk!=null&&g.restWk===w.week)return _T('is resting — entering him ends the rest');
  if(g.lanista)return _T('fights only in the Gambit');
  const cur=n.bouts.findIndex(x=>x.ents.includes(g.id));if(cur>=0&&n.bouts[cur]!==b)return _T`is already entered in the ${TIERS[n.bouts[cur].tier].n}`;
  if(b.ents.includes(g.id))return _T('is entered here');
  if((b.wd||0)>=2)return _T('cannot enter: this bout is closed to your house after two withdrawals');
  const o=effOvr(g);if(T&&(o<T.lo-6||o>T.hi+6))return _T`is rated ${o}; the ${T.n} takes ${T.lo-6}–${T.hi+6}`;
  if(g.morale!=null&&g.morale<=15)return _T`is too low in spirit (morale ${Math.round(g.morale)})`;
  return ''}
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{if(r101Off()||typeof h!=='string')return h;const w=W_(),pm=me();if(!w||!w.night||w.night.bye||!pm)return h;
  const T=document.createElement('template');T.innerHTML=h;const n=w.night;const mine=rosterOf(pm);let hit=false;
  for(const card of T.content.querySelectorAll('.card2.bout')){const wb=card.querySelector('[data-mg="watch"][data-id]');if(!wb)continue;const bi=+wb.dataset.id;const b=n.bouts[bi];if(!b||b.done)continue;
    /* grey the blocked fighters in the picker, re-enable the resting ones (entering ends the rest) */
    const sel=card.querySelector('select[id^="ent"]');
    if(sel){let free=0;for(const o of sel.querySelectorAll('option')){const g=gById(o.value);if(!g)continue;const why=r101Block(g);
        if(why){o.disabled=true;o.removeAttribute('selected');o.textContent=`🔒 ${g.name} — ${r101Short(g)}`;hit=true}
        else{free++;if(o.disabled&&g.restWk!=null&&g.restWk===w.week){o.disabled=false;o.textContent=`${g.name} (${effOvr(g)}) · ${_T('ends the rest')}`}}}
      const eb=card.querySelector('[data-mg="enter"]');
      if(eb&&free>0&&eb.disabled&&/resting/i.test(eb.title||'')){eb.disabled=false;eb.removeAttribute('title')}
      if(eb&&!free){eb.disabled=true;eb.title=_T('Nobody on your roster can be entered in this bout — see below')}
      {const first=[...sel.options].find(o=>!o.disabled);for(const o of sel.options)o.removeAttribute('selected');if(first)first.setAttribute('selected','')}}
    const myIn=b.ents.some(id=>r101Mine(gById(id)));if(myIn)continue;
    const bad=mine.map(g=>[g,r101WhyNot(w,b,g)]).filter(x=>x[1]);if(!bad.length)continue;
    const none=!sel||![...sel.options].some(o=>!o.disabled);
    const html=`<details class="nofit101"${none?' open':''}><summary>${none?_T`🚫 None of your fighters fits this bout — why`:_T`Why the others don't fit (${bad.length})`}</summary><ul>${bad.map(([g,why])=>`<li><b>${esc(g.name)}</b> <span class="rc-sub">(${effOvr(g)})</span> ${esc(why)}</li>`).join('')}</ul></details>`;
    const acts=card.querySelector('.acts');if(acts){acts.insertAdjacentHTML('afterend',html);hit=true}}
  return hit?T.innerHTML:h}catch(e){console.error(e);return h}}}

/* ---------- M17 · Armory: spares are for SELLING ---------- */
{const base=sell99HTML;sell99HTML=function(){let h=base.apply(this,arguments);try{if(r101Off()||!h)return h;const pm=me(),w=W_();if(!pm||!w)return h;
  const sh=arm94H(pm).sh.filter(P=>P&&!P.iss&&!P.dmg);const left=arm94SellLeft(pm,w);
  h=h.replace(/<summary>[\s\S]*?<\/summary>/,`<summary><b>${_T`💰 Spares — sell`}</b> <span class="rc-sub">${_T`${sh.length} to sell · the stalls buy ${left} more this week (30% of the price)`}</span></summary><p class="rc-sub sp101">${_T`These are pieces you already own and don't wear — the same ones as on the shelf above. Sell the duplicates for coin; nothing here is for sale to you (buy in the City Square).`}</p>`)}catch(e){console.error(e)}return h}}

/* ---------- M19 · Recruiter's hours scale with the roster ---------- */
const REC101={bands:[[3,24],[6,16],[9,10],[99,6]]};
function rec101Own(w){const pm=me();return pm?rosterOf(pm).filter(g=>!g.loanFrom||g.loanFrom.mid===pm.id).length:0}
function rec101Base(n){for(const [mx,h] of REC101.bands)if(n<=mx)return h;return 6}
function rec101Why(w){const n=rec101Own(w);const lv=typeof adv98Lv==='function'?adv98Lv(w):1;const base=rec101Base(n);const bonus=REC98.perLv*(lv-1);
  return _T`${n} fighter${n===1?'':'s'} on the roster: ${base} h (up to 3 fighters 24 h · 4-6 16 h · 7-9 10 h · 10+ 6 h)${bonus?_T` + ${bonus} h from the Recruiter's level`:''} — a full house needs fewer recruits.`}
{const base=rec98HrsMax;rec98HrsMax=function(w){if(r101Off())return base.apply(this,arguments);try{const lv=typeof adv98Lv==='function'?adv98Lv(w):1;return rec101Base(rec101Own(w))+REC98.perLv*(lv-1)}catch(e){return base.apply(this,arguments)}}}
function rec101Tips(){try{if(r101Off())return;const w=W_();if(!w||w.dead)return;r101Fix();const t=rec101Why(w);
  for(const el of document.querySelectorAll('.rh98n,.rc1hrs b,.mcount.hr99,.b73-recruit .roomstat')){if(el.dataset.tip!==t){el.dataset.tip=t;if(el.matches('.mcount'))el.title=t}}}catch(e){}}

/* ---------- M23 · gear nudges only for healthy fighters ---------- */
{const base=arm94Todo;arm94Todo=function(pm){const r=base.apply(this,arguments);try{if(!r101Off()&&r&&r.empty)r.empty=r.empty.filter(g=>!r101Bed(g)&&!(g.severed||[]).length&&!g.inj&&!(g.inj&&g.inj.war))}catch(e){}return r}}
{const base=arm94Fit;arm94Fit=function(g,P,want){try{if(!r101Off()&&g&&r101Mine(g)&&r101Bed(g)&&!g.inj)return {no:sx(g,_T`${esc(g.name)} is in an infirmary bed — equip him after he has healed.`,_T`${esc(g.name)} is in an infirmary bed — equip her after she has healed.`)}}catch(e){}return base.apply(this,arguments)}}
{const base=arm94HTML;arm94HTML=function(){let h=base.apply(this,arguments);try{if(r101Off())return h;const pm=me();const g=arm94Sel(pm);
  if(g&&!g.inj&&r101Bed(g))h=h.replace('<div class="ar94worn">',`<p class="ar94warn">${sx(g,_T`🛏 In an infirmary bed — he cannot be equipped until he has healed.`,_T`🛏 In an infirmary bed — she cannot be equipped until she has healed.`)}</p><div class="ar94worn">`);
  h=h.replace(/(<button type="button" class="ar94g[^"]*" data-ar94g="([^"]+)"[^>]*>[\s\S]*?<small>)/g,(m0,a,id)=>{const x=gById(id);return x&&!x.inj&&r101Bed(x)?a+'🛏 ':a});
  if(g&&g.ln101&&g.ln101.role==='in')h=h.replace(/<p class="rc-sub">🤝 On loan[^<]*<\/p>/,`<p class="rc-sub">${_T('🤝 On loan — he arrives with a loaner kit (a gladius and padded leg wraps). Change it as you like: loaner pieces you replace vanish, your own go back to your shelf when he returns.')}</p>`);
  return h}catch(e){console.error(e);return h}}}

/* ---------- M24 · the loaner kit ---------- */
const LN101={kit:{w:'gladius',a:'legwraps'}};
function ln101Piece(w,t,k){const P=arm94New(w,t,k);P.ln101=1;return P}
function ln101Apply(w,g){if(!g||!g.alive||!g.loanFrom||g.ln101)return false;const pm=me();arm94EnsureG(w,g);const E=g.eq94;if(!E)return false;
  const home=arm94M(w,E.h||g.loanFrom.mid);const sh=home&&!home.dead?arm94H(home).sh:null;const back=[];
  for(const P of [E.R,E.L,...(E.a||[]),...(E.o||[])]){if(!P)continue;if(sh){sh.push(P);back.push(P.id)}}
  E.R=W[LN101.kit.w]?ln101Piece(w,'w',LN101.kit.w):null;E.L=null;E.a=ARM[LN101.kit.a]?[ln101Piece(w,'a',LN101.kit.a)]:[];E.o=[];
  g.ln101={back,role:pm&&g.loanFrom.mid===pm.id?'out':'in'};delete g.re95;return true}
/* the loan is over (or he died): loaner pieces vanish, the borrower's own pieces go home, his own gear goes back on him */
function ln101Clean(w,g){const E=g&&g.eq94;if(!E)return;const keep=P=>{if(!P)return null;if(P.ln101)return null;if(P.own101){const o=arm94M(w,P.own101);if(o&&!o.dead)arm94H(o).sh.push(P);delete P.own101;return null}return P};
  E.R=keep(E.R);E.L=keep(E.L);E.a=(E.a||[]).filter(P=>keep(P));E.o=(E.o||[]).filter(P=>keep(P))}
function ln101Return(w,g){if(!g||!g.ln101||g.loanFrom)return false;const L=g.ln101;delete g.ln101;ln101Clean(w,g);
  if(!g.alive){return true}
  arm94EnsureG(w,g);const E=g.eq94;const home=E&&arm94M(w,E.h);const left=[];
  if(E&&home)for(const id of L.back||[]){const at=arm94Find(home,id);if(!at||at.sh==null)continue;if(at.P.dmg&&at.P.t==='a'){left.push(id);continue}const r=arm94Put(home,id,{g:g.id,z:'auto'});if(!(r&&r.ok))left.push(id)}
  if(left.length)g.re95=left;return true}
function ln101Sync(w){if(!w||r101Off()||w.tutorial)return 0;let n=0;for(const g of w.glads||[]){try{if(g.alive&&g.loanFrom&&!g.ln101){if(ln101Apply(w,g))n++}else if(!g.loanFrom&&g.ln101){if(ln101Return(w,g))n++}else if(g.ln101&&!g.alive){ln101Clean(w,g);delete g.ln101}}catch(e){console.error(e)}}return n}
{const base=seatFor;seatFor=function(g){try{const w=W_();if(w&&g&&(g.loanFrom||g.ln101))ln101Sync(w)}catch(e){}return base.apply(this,arguments)}}
{const base=mgrHTML;mgrHTML=function(){try{const w=W_();if(w&&!w.dead&&ln101Sync(w))saveWorld(true)}catch(e){}return base.apply(this,arguments)}}
{const base=endWeek;endWeek=async function(){const r=await base.apply(this,arguments);try{const w=W_();if(w&&!w.dead&&ln101Sync(w))saveWorld(true)}catch(e){}return r}}
{const base=arm94Strip;arm94Strip=function(w,g){try{if(g&&g.ln101)ln101Clean(w,g)}catch(e){}return base.apply(this,arguments)}}
/* loaner pieces are nobody's property: not counted in the house's pieces (repairs, stats) — except while a piece is being moved */
{const base=arm94All;arm94All=function(m){const L=base.apply(this,arguments);return R101.inPut>0?L:L.filter(x=>!(x.P&&x.P.ln101))}}
/* a borrowed fighter is dressed from the borrower's shelf: the checks that refuse a loaned fighter are lifted for the call */
{const base=arm94Put;arm94Put=function(m,pid,dst){if(r101Off()||!m)return base.apply(this,arguments);const w=W_();
  const bor=(w?w.glads:[]).filter(g=>g.alive&&g.ln101&&g.ln101.role==='in'&&g.eq94&&g.contract&&g.contract.mgr===m.id&&g.loanFrom);
  if(!bor.length)return base.apply(this,arguments);
  const sv=bor.map(g=>[g,g.loanFrom,g.eq94.h]);for(const g of bor){g.eq94.h=m.id;g.loanFrom=undefined}R101.inPut++;
  try{return base.apply(this,arguments)}
  finally{R101.inPut--;for(const [g,lf,h] of sv){g.loanFrom=lf;g.eq94.h=h;const E=g.eq94;for(const P of [E.R,E.L,...E.a,...E.o])if(P&&!P.ln101&&!P.own101)P.own101=m.id}
    const sh=arm94H(m).sh;for(let i=sh.length-1;i>=0;i--)if(sh[i].ln101)sh.splice(i,1)}}}
/* a borrowed fighter's bout settles on the borrower's shelf (loot lands with the house that sent him out) */
{const base=arm94Settle;arm94Settle=function(w,b,res){const sv=[];try{for(const id of b.ents||[]){const g=gById(id);if(g&&g.ln101&&g.ln101.role==='in'&&g.eq94&&g.contract){sv.push([g,g.eq94.h]);g.eq94.h=g.contract.mgr}}}catch(e){}
  try{return base.apply(this,arguments)}finally{for(const [g,h] of sv)if(g.eq94)g.eq94.h=h}}}

/* ---------- M27 · a full special keeps a filler seat ---------- */
{const base=any100Rivals;any100Rivals=function(w,leave){if(r101Off()||leave)return base.apply(this,arguments);
  /* the full-card pass: leave one filler seat (one a side in a team event) so you can still enter on the day — pad the bout with phantom ids while the rivals pick */
  const n=w.night;const pad=[];
  try{for(const b of n.bouts){if(!any100Sp(b)||b.done)continue;const size=boutSize(b);const reserve=any100Team(b)?2:1;const ph=[];
      for(let i=0;i<reserve&&b.ents.length+ph.length<size;i++)ph.push('_r101_'+i);b.ents.push(...ph);pad.push([b,ph])}}catch(e){console.error(e)}
  try{return base.apply(this,arguments)}finally{for(const [b,ph] of pad)b.ents=b.ents.filter(id=>!ph.includes(id))}}}
/* the week card says a full special can still be entered on the day */
{const base=any100Row;any100Row=function(w,b,i,mine){let h=base.apply(this,arguments);try{if(!r101Off()&&typeof h==='string'&&any100Sp(b)&&!b.done){const size=boutSize(b);
    if(b.ents.length>=size&&b.ents.some(id=>{const g=gById(id);return g&&!g.contract})){const was=_T`full · ${b.ents.length} of ${size}`;h=h.replace(was,_T`full · you may still bump a free-agent filler (${b.any100.fee} coin)`)}}}catch(e){}return h}}
{const base=any100Enter;any100Enter=function(w,bi,gid,o){const r=base.apply(this,arguments);try{if(r&&!r.ok&&!r101Off()&&/Every seat is taken/.test(r.why||'')){const b=w.night.bouts[bi];const rivals=b.ents.map(gById).filter(x=>x&&x.contract&&!any100Own(x.id,o&&o.mgr)).length;
    if(rivals)r.why=_T('Every seat is held by a rival house — a rival lanista\'s fighter is never bumped. Only a free-agent filler can be.')}}catch(e){}return r}}

/* ---------- M28 · what each fighter brought home ---------- */
{const base=applyBout;applyBout=function(bi,res,opt){const w=W_();const b=w&&w.night&&w.night.bouts&&w.night.bouts[bi];const pm=me();
  if(r101Off()||!b||b.done||!pm)return base.apply(this,arguments);
  const c0=pm.coin,bn0=pm.betNet||0;const stakes=(b.bets||[]).reduce((a,x)=>a+(x.stake||0),0);const pre={};
  try{for(const id of b.ents){const g=gById(id);if(g&&g.alive&&Array.isArray(g.severed))pre[id]=g.severed.slice()}}catch(e){}
  const r=base.apply(this,arguments);
  try{if(b.done&&b.res){
    /* M41: a limb a fighter regrew mid-bout leaves glad.severed (applyBout only ever added limbs) */
    for(const id of Object.keys(pre)){const g=gById(id);const row=((res&&res.rows)||[]).find(x=>x.mgrId===id);if(!g||!row||!Array.isArray(row.severed))continue;const now=new Set(row.severed);
      g.severed=(g.severed||[]).filter(l=>now.has(l)||!pre[id].includes(l)).filter((l,i,a)=>a.indexOf(l)===i)}
    /* M28 */
    const betD=(pm.betNet||0)-bn0;const pay=betD+stakes; /* what the wagers paid back into the treasury */
    const delta=pm.coin-c0-(b.bets&&b.bets.length?pay:0);const mineIds=b.ents.filter(id=>r101Mine(gById(id)));
    if(mineIds.length&&delta>0){const by={};const fee=b.fee||0;let rest=delta;for(const id of mineIds){by[id]=Math.min(fee,rest);rest-=by[id]}
      const rows=b.res.rows;const win=mineIds.filter(id=>(rows.find(x=>x.gid===id)||{}).won);const pl=mineIds.filter(id=>{const x=rows.find(y=>y.gid===id);return x&&x.place&&x.place<=3&&!x.won});
      const to=win.length?win:pl.length?pl:mineIds;if(rest>0){const part=Math.floor(rest/to.length);to.forEach((id,i)=>{by[id]+=part+(i===0?rest-part*to.length:0)})}
      b.res.house101={tot:delta,by};
      const lines=Object.entries(by).filter(([,v])=>v>0).map(([id,v])=>{const x=rows.find(y=>y.gid===id);const pl=x&&x.place?(['','1st','2nd','3rd'][x.place]||x.place+'th'):'';return `${esc((gById(id)||{}).name||'?')}${pl?' ('+pl+')':''} ${coinAmt87('+'+v)}`});
      if(lines.length)b.res.lines.push(_T`💰 To your house: ${lines.join(' · ')}`)}}}catch(e){console.error(e)}
  return r}}
{const base=nightResultsHTML;nightResultsHTML=function(){const h=base.apply(this,arguments);try{if(r101Off()||typeof h!=='string'||!h)return h;const w=W_(),n=w&&w.night;if(!n)return h;
  const T=document.createElement('template');T.innerHTML=h;const cards=[...T.content.querySelectorAll('.nres')];let hit=false;
  n.bouts.forEach((b,i)=>{const card=cards[i];const H=b.res&&b.res.house101;if(!card||!H)return;
    for(const tr of card.querySelectorAll('tr')){const nm=tr.querySelector('td b');const g=nm&&(b.ents.map(gById).filter(Boolean).find(x=>x.name===nm.textContent));const v=g&&H.by[g.id];
      tr.insertAdjacentHTML('beforeend',`<td class="n h101">${v>0?`<b title="${esc(_T('Coin your house took from this bout: appearance fee + purse share'))}">${coinAmt87('+'+v)}</b>`:''}</td>`);hit=true}
    card.insertAdjacentHTML('beforeend',`<p class="rc-sub h101t">${_T`💰 Your house took <b>${coinAmt87('+'+H.tot)}</b> from this bout (appearance fees and purse).`}</p>`)});
  return hit?T.innerHTML:h}catch(e){console.error(e);return h}}}

/* ---------- M29 · no repair notices once the week's bouts are fought ---------- */
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const w=W_();if(!r101Off()&&w&&!w.dead&&r101Fought(w))return I.filter(x=>x.done||x.ic!=='🩹')}catch(e){console.error(e)}return I}}

/* ---------- M35 · the levy never takes the hurt ---------- */
function levyExempt101(g){try{if(r101Off()||!g)return false;return !!(g.inj||(g.severed||[]).length||r101Bed(g))}catch(e){return false}}

/* ---------- M37 · fight requests end with the week; the report lists the effects ---------- */
function rev101Note(w,o){if(!w||!w.review||!o)return;const R=w.review;(R.fx101=R.fx101||[]).push({ic:o.ic||'•',txt:o.txt||'',coin:o.coin||0,cls:o.cls||''});if(R.fx101.length>14)R.fx101.length=14}
{const base=fightRequests;fightRequests=function(w,pm){const ask=[];try{for(const g of rosterOf(pm))if(g.wantFight&&g.wantFight.week<w.week&&!g.wantFight.bye)ask.push([g,g.morale,g.wantFight.week,g.lastBout===g.wantFight.week])}catch(e){}
  const r=base.apply(this,arguments);try{if(!r101Off())for(const [g,m0,wk,did] of ask){const d=Math.round((g.morale||0)-m0);if(did)rev101Note(w,{ic:'🗣',txt:_T`<b>${esc(g.name)}</b> got the fight they asked for — morale ${d>=0?'+':''}${d}.`,cls:'up'});else rev101Note(w,{ic:'😠',txt:_T`<b>${esc(g.name)}</b> asked to fight and sat out — morale ${d}.`,cls:'dn'})}}catch(e){console.error(e)}return r}}
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(r101Off()||!w||w.dead||MGR.view||MGR.tab!=='ludus'||!w.review||!(w.review.fx101||[]).length)return h;
  const rows=w.review.fx101.map(x=>`<div class="fx101r ${x.cls}"><span>${x.ic}</span><span>${x.txt}</span>${x.coin?`<b>${coinAmt87((x.coin>0?'+':'')+x.coin)}</b>`:''}</div>`).join('');
  const sec=`<div class="fx101"><div class="fx101h">${_T`⚖ What it cost and what it earned`} <span class="rc-sub">${_T`requests and rewards that came due at the week's end`}</span></div>${rows}</div>`;
  const t=document.createElement('template');t.innerHTML=h;const b=t.content.querySelector('details.rev91 .mbody');if(!b)return h;b.insertAdjacentHTML('beforeend',sec);return t.innerHTML}catch(e){console.error(e);return h}}}
/* the open request card (64) and the desk's row go once there is nothing left to enter in (mailLive reads the card stack through mailFromHTML) */
{const base=mailFromHTML;mailFromHTML=function(html,out){try{const w=W_();if(!r101Off()&&w&&r101Fought(w)&&typeof html==='string')html=html.replace(/<div class="card2 fightreq">[\s\S]*?<\/div>/,'')}catch(e){}return base.call(this,html,out)}}

/* ---------- M40 · one desk row per advisor ---------- */
const ADV101={consilium:{ic:'🏛',n:()=>_T('Consilium')},recruiter:{ic:'🤝',n:()=>_T('Recruiter')},doctore:{ic:'🏋',n:()=>_T('Doctore')},medicus:{ic:'⚕',n:()=>_T('Medicus')},clerk:{ic:'💰',n:()=>_T('Clerk')},barracks:{ic:'🛡',n:()=>_T('Barracks master')}};
const ADV101_IC={'🤝':'recruiter','🏋':'doctore','⏳':'doctore','🔒':'doctore','⚕':'medicus','🛏':'medicus','🦿':'medicus','📜':'clerk','⚖':'consilium','🩹':'barracks','🛡':'barracks','🗣':'barracks','⭐':'barracks','🎓':'consilium'};
function adv101Of(r){if(!r)return null;if(r.src==='ck'){if(r.ic==='⚔')return /empty|bare|hands?|fights with/i.test(r101Plain(r.line))?'barracks':'consilium';return ADV101_IC[r.ic]||null}
  const k=String(r.key||'');const from=String(r.from||'').trim().toLowerCase();
  if(ADV_FROM83[from])return ADV_FROM83[from];
  if(/^L:(rec|ps|rec98|rec84)/.test(k)||/recruit|★/i.test(r.title||''))return 'recruiter';
  if(/^L:(med|inf|ward)/.test(k))return 'medicus';if(/^L:(consil|rl76|chal)/.test(k))return 'consilium';
  if(/^L:(contract|clerk|loan|syn|wage|pay)/.test(k))return 'clerk';if(/^L:(grow|doc|yard)/.test(k))return 'doctore';
  return null}
function r101Group(rows){if(r101Off()||!Array.isArray(rows))return rows;try{if(localStorage.getItem('flavius_deskgrp101off')==='1')return rows}catch(e){}if(R101.grpCache&&R101.grpCache.src===rows)return R101.grpCache.out;
  const by={};for(const r of rows){if(r.sec!=='week'||r.done||r.grp||r.req||r.tier===1)continue;const a=adv101Of(r);if(a)(by[a]=by[a]||[]).push(r)} /* required (tier 1) rows stay on their own */
  const take=new Map();for(const [a,L] of Object.entries(by))if(L.length>=2)take.set(a,L);
  if(!take.size)return rows;
  const out=[];const placed=new Set();
  for(const r of rows){let a=null;for(const [k,L] of take)if(L.includes(r)){a=k;break}
    if(!a){out.push(r);continue}if(placed.has(a))continue;placed.add(a);const L=take.get(a);
    const dues=L.map(x=>x.due).filter(Boolean).sort((x,y)=>(x.wk||999)-(y.wk||999));
    out.push({src:'grp',sec:'week',adv:a,grp:L,i:L[0].i,tier:Math.min(...L.map(x=>x.tier||5)),ic:ADV101[a].ic,cls:L[0].cls||'k-plan',key:'grp:'+a,req:L.some(x=>x.req),done:false,skipped:false,due:dues[0]||null,
      line:_T`<b>${ADV101[a].n()}</b> — ${L.length} things`,btn:'',decide:false})}
  out.sort((a,b)=>(a.sec===b.sec?0:a.sec==='week'?-1:1)||(a.sec==='week'?(a.tier-b.tier)||(((a.due&&a.due.wk)||999)-((b.due&&b.due.wk)||999)):0)||a.i-b.i);
  R101.grpCache={src:rows,out};return out}
{const base=deskItems99;deskItems99=function(o){return r101Group(base.apply(this,arguments))}}
{const base=dk99RowHTML;dk99RowHTML=function(r,ix){if(!r||!r.grp)return base.apply(this,arguments);
  const op=R101.open.has(r.adv);const subs=r.grp.map(x=>base(x,0)).join('');const sum=r.grp.map(x=>r101Plain(x.line)).join(' · ');
  return `<div class="dk99row dk101g ${r.cls||'k-plan'}${op?' open':''}${ix>=6?' dk99more':''}" data-dk99="${esc(r.key)}" data-tier="${r.tier}" data-adv101="${r.adv}"><span class="ic">${r.ic}</span><span class="tx"><span class="tl"><b>${ADV101[r.adv].n()}</b> — <b>${r.grp.length}</b> ${_T('things')} <span class="q">${esc(sum)}</span></span>${r.due?`<span class="due99 ${r.due.c}">${r.due.t}</span>`:''}</span>`+
    `<span class="dk99b"><button class="btn tksm dk99dec" type="button" data-dk101g="${r.adv}" aria-expanded="${op}">${op?_T('Close ▴'):_T('Open ▾')}</button></span><span class="dk99x lock" title="${_T`Required`}"></span>`+
    `<div class="dk101lines"${op?'':' hidden'}>${subs}</div></div>`}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-dk101g]');if(!t||!t.closest('#desk99'))return;e.preventDefault();e.stopPropagation();
  const a=t.dataset.dk101g;const row=t.closest('.dk101g');const op=!R101.open.has(a);if(op)R101.open.add(a);else R101.open.delete(a);
  if(row){row.classList.toggle('open',op);const ln=row.querySelector(':scope>.dk101lines');if(ln)ln.hidden=!op}t.textContent=op?_T('Close ▴'):_T('Open ▾');t.setAttribute('aria-expanded',String(op))},true);

/* ---------- M42 · unspent training hours → the Training Yard ---------- */
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{if(!r101Off())for(const x of I)if(x.ic==='⏳'&&typeof x.btn==='string'&&x.btn)x.btn=x.btn.replace(/data-id="[a-z]+"/,'data-id="practice" data-r101="practice"')}catch(e){}return I}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-r101="practice"]');if(!b)return;setTimeout(()=>{try{if(MGR.tab!=='practice'){MGR.tab='practice';if(typeof MGR_REDRAW==='function')MGR_REDRAW()}}catch(err){}},60)},true);

/* ---------- M41 · repair + migration ---------- */
function r101Repair(w){if(!w||!Array.isArray(w.glads))return 0;let n=0;
  for(const g of w.glads){if(!g)continue;if(Array.isArray(g.severed)){const ok=g.severed.filter((l,i,a)=>LOCS.includes(l)&&a.indexOf(l)===i);if(ok.length!==g.severed.length){g.severed=ok;n++}}
    const E=g.eq94;if(E&&Array.isArray(E.a)){const seen=new Set();const keep=E.a.filter(P=>{if(!P||!ARM[P.k])return false;const key=P.id;if(seen.has(key))return false;seen.add(key);return true});if(keep.length!==E.a.length){E.a=keep;n++}
      for(const P of E.a){const A=ARM[P.k];if(A&&A.pair&&P.loc){delete P.loc;n++}}}}
  return n}
SAVE_MIGRATIONS.push(['1.01',w=>{r101Repair(w)}]);
{const base=mgrMigrate;mgrMigrate=function(w){const o=base.apply(this,arguments);try{if(o&&o.glads&&r101Repair(o))o._r101dirty=1}catch(e){console.error(e)}return o}}
{const base=openManager;openManager=async function(){const r=await base.apply(this,arguments);try{const w=W_();if(w&&w._r101dirty){delete w._r101dirty;saveWorld()}}catch(e){}return r}}

/* the rest button of a fighter on the card was disabled by 183; resting now takes him off the card instead */
function r101Fix(){try{if(r101Off())return;for(const b of document.querySelectorAll('#mgrBody [data-rest][disabled]')){const g=gById(b.dataset.rest);if(g&&r101Mine(g)){b.disabled=false;b.removeAttribute('disabled');if(/card/i.test(b.title||''))b.title=_T('Resting takes him off this week\'s card')}}}catch(e){}}

/* ---------- styles + sweeps ---------- */
(()=>{const st=document.createElement('style');st.textContent=`
.nofit101{margin:6px 0 0;border:1px dashed #6b5a44;border-radius:6px;padding:4px 8px;background:rgba(0,0,0,.18)}
.nofit101 summary{cursor:pointer;font-size:12.5px;color:var(--gold2)}
.nofit101 ul{margin:4px 0 2px 16px;padding:0;font-size:12.5px}.nofit101 li{margin:2px 0}
.h101 b{color:var(--gold2);white-space:nowrap}.h101t{margin:4px 0 0}
.sp101{margin:4px 0 6px}
.fx101{margin-top:8px;border-top:1px solid var(--line2);padding-top:6px}.fx101h{font-weight:600;margin-bottom:3px}
.fx101r{display:flex;gap:8px;align-items:baseline;font-size:13px;padding:1px 0}.fx101r.dn b{color:#f2a497}.fx101r.up b{color:#9fd18b}
#desk99 .dk101g>.dk101lines{grid-column:1 / -1;margin:4px 0 6px 18px;display:grid;gap:3px;border-left:2px solid #6a5130;padding-left:8px}
#desk99 .dk101g>.dk101lines[hidden]{display:none}
#desk99 .dk101g .tl .q{opacity:.75;font-weight:400;display:inline-block;max-width:min(60ch,100%);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}
.ar94stage.loan{pointer-events:auto;opacity:1}
`;document.head.appendChild(st)})();
try{if(typeof PERF92_SWEEPS!=='undefined')PERF92_SWEEPS.push(['rec101','rec101Tips()'])}catch(e){}
setInterval(()=>{rec101Tips()},700);

/* =====================================================================
   229-V95MGR · v0.95 part C — MANAGER (his notes 2026-10-07; stabilization release)
   =====================================================================
   1 · TRADE OFFERS: an offer whose fighters are gone is withdrawn — at week start (offersWeek), whenever shown (offersHTML) and on
       Accept (offerAccept refuses with "This offer is no longer on the table."; never hands ours over for nothing). `offerLive95`.
   2 · SPECIAL WEEK END: closing an invitational (sp_close) on a week whose bouts are all fought ends the week the same way as
       ⏭ End the week: wages, the Acta, then the landing (awards → Acta Diurna → Your ludus). `weekEndGo95`.
   3 · SIGNING: the "✍ Signed" card shows the recruit's portrait (was the blank avatar).
   4 · RECRUITING TABLETS: no buttons on the board's tablets — a click selects him, every action lives on the card at the right.
   5 · WEEK IN REVIEW: "From your Doctores" subsection (one row per fighter: portrait, the five ratings old → new with a green gain,
       band-ups with what they give, a fatigue chip; quiet fighters folded into "No change: …"). The separate growth letter is not
       sent any more (growthDigest wrapper + sendLetter guard). Data: w.growth95 {rows, quiet}, w.sup95 (points landed this week).
   6 · TRAINING YARD fighter cards never overflow (container query: ratings rows switch to the narrow layout, Bond panel wraps).
   7 · ARMORY = its own Manager rail tab (`armory`, after Roster). Only HEALTHY fighters can be equipped (arm94Fit refuses);
       when a fighter is hurt his weapons/armor/offerings go to the shelf at once (`inj95Sweep`, g.re95 = his piece ids) and a
       checklist item (with a one-click "Re-equip") reminds you after healing.
   8 · ROSTER: at most THREE STARTERS, each set to one Match Week bout (g.slot95 = 1|2|3 → Bout I Undercard · II Feature · III Main
       event); the bench = every healthy non-starter; the depth chart is slots + bench chips (no columns), Loans = a tab beside it;
       fighter list rows carry ⭐ Promote / 🪑 Bench and Lend; the fighter card moves up beside the list. Match Week is filled from
       the starters by default (once a week; `st95Fill`), still swappable there (its picker lists every fit fighter now).
       Weekly: starters +2 morale +1 loyalty; a healthy benched fighter whose want is arena time −1 morale (ST95 knobs).
       g.bench follows the slot (the old depth-chart code and depthOf keep working). SAVE_MIGRATIONS '0.95' (first 3 of the old
       chart become starters; saved once).
   9 · TROPHY CASE (Annals): built-in trophies are dimmed + locked until earned; each card has its own border colour.
   Test: tv95c.
   ===================================================================== */
var OFFER_FAIL95='';

/* ---------------- 1 · trade offers ---------------- */
function offerLive95(o){const w=W_(),pm=me();if(!o||!w||!pm)return false;if(o.until<w.week)return false;const g=gById(o.gid);if(!g||!g.alive||!g.contract)return false;
  if(o.kind==='loanin')return g.contract.mgr===o.mid;
  if(g.contract.mgr!==pm.id)return false;
  if(o.kind==='swap'){const give=o.give||[];return give.length>0&&give.every(id=>{const x=gById(id);return !!(x&&x.alive&&x.contract&&x.contract.mgr===o.mid)})}
  return true}
function offersPrune95(){try{const w=W_();if(w&&w.offers&&me())w.offers=w.offers.filter(offerLive95)}catch(e){console.error(e)}}
{const base=offersWeek;offersWeek=function(w,pm){offersPrune95();const r=base.apply(this,arguments);offersPrune95();return r}}
{const base=offersHTML;offersHTML=function(){offersPrune95();return base.apply(this,arguments)}}
{const base=offerAccept;offerAccept=function(o){OFFER_FAIL95='';if(!offerLive95(o)){OFFER_FAIL95=_T('This offer is no longer on the table.');return false}return base.apply(this,arguments)}}

/* ---------------- 2 · the week ends the same way every time ---------------- */
async function weekEndGo95(){const w=W_();if(!w||w.dead||MGR.busy)return false;MGR.busy=true;let ok=false;try{ok=await endWeek()}finally{MGR.busy=false}
  if(ok){const w2=W_();MGR.confirmEnd=false;MGR.tab=w2.awardShow&&!w2.awardShow.seen?'awards':'paper';MGR.awI=0;if(typeof MGR_REDRAW==='function')MGR_REDRAW();const b=document.getElementById('mBody');if(b)b.scrollTop=0}
  return ok}
{const base=trophyMgrClick;trophyMgrClick=async function(action,id,btn,ctx){const w0=W_();const fin=!!(w0&&w0.special&&w0.special.D&&w0.special.D.finale);const r=await base.apply(this,arguments);
  try{if(action==='sp_close'&&!fin){const w=W_();if(w&&!w.dead&&!w.special&&w.night&&w.night.bouts.every(b=>b.done)&&!(w.pend||[]).length){if(typeof mToast==='function')mToast(_T('The invitational is settled — the week ends.'));await weekEndGo95()}}}catch(e){console.error(e)}return r}}

/* ---------------- 3 · the signing card shows his face ---------------- */
{const base=signCard73;signCard73=function(g){const r=base.apply(this,arguments);try{const f=document.querySelector('#signCard .sgface');if(f&&g){f.innerHTML=gArt(g,'md');f.classList.add('sgface95')}}catch(e){console.error(e)}return r}}

/* ---------------- 4 · recruiting tablets: no buttons, a click selects ---------------- */
{const base=pipelineHTML;pipelineHTML=function(){const h=base.apply(this,arguments);try{const t=document.createElement('template');t.innerHTML=h;
  t.content.querySelectorAll('.pcard.pt85').forEach(c=>{const nx=c.querySelector('.px85 .pl85b');const sm=c.querySelector('.px85 .pst85 small');const txt=nx?(nx.textContent+(sm?sm.textContent:'')).trim():'';
    const pin=c.querySelector('.pin85');if(pin)pin.remove();const px=c.querySelector('.px85');if(px)px.remove();
    if(txt){const s=document.createElement('span');s.className='nx95';s.textContent=txt;const meter=c.querySelector('.pm85');c.insertBefore(s,meter||null)}c.setAttribute('role','button');c.setAttribute('tabindex','0')});
  return t.innerHTML}catch(e){console.error(e)}return h}}
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const c=e.target&&e.target.closest&&e.target.closest('.pcard.pt85[data-mg="sel"]');if(c&&e.target===c){e.preventDefault();c.click()}});

/* ---------------- 5 · the Doctores' report inside the Week in review ---------------- */
const GROW95={mute:false};
{const base=statGain;statGain=function(g,k,amt){let b0=null;const w=W_();
  try{const m=g&&g.contract?mgrById(g.contract.mgr):null;if(w&&m&&m.isPlayer&&amt>0){const st=gStats(g);if(st)b0=statBonuses({...st})}}catch(e){}
  const up=base.apply(this,arguments);
  try{if(b0&&up){const G=(w.sup95=w.sup95||{});const o=(G[g.id]=G[g.id]||{});o[k]=(o[k]||0)+up;const st=gStats(g);const a=statBonuses(st);
    const perk=k==='int'?(a.tier!=null?(a.tier!==b0.tier?_T`now a ${a.tierName} mind`:''):(a.diff!==b0.diff?_T`now plays ${a.diff==='hard'?_T('Hard'):_T('Normal')}`:'')):(()=>{const f={spd:'mv',str:'dmg',lck:'coin',cha:'cf'}[k];const unit={mv:_T('movement'),dmg:_T('damage per hit'),coin:_T('coin a turn'),cf:_T('CF a turn')}[f];return a[f]>b0[f]?_T`now +${a[f]} ${unit}`:''})();
    if(perk)(o.band=o.band||[]).push({k,v:st[k],t:perk})}}catch(e){console.error(e)}
  return up}}
function growSnap95(w){const pm=w.mgrs.find(m=>m.isPlayer);if(!pm)return;const sg=w.sgain||{},sup=w.sup95||{};const rows=[],quiet=[];
  for(const g of w.glads.filter(x=>x.alive&&x.contract&&x.contract.mgr===pm.id)){const o=sg[g.id]||{},u=sup[g.id]||{};const st=gStats(g);const d=[];
    for(const [k] of STATS){const gain=+o[k]||0,ups=u[k]||0;if(gain>0||ups>0){const to=st[k];d.push({k,from:to-ups,to,gain:Math.round(gain*10)/10})}}
    if(d.length)rows.push({id:g.id,d,band:u.band||[]});else quiet.push(g.id)}
  w.growth95={wk:w.week,s:w.season,rows,quiet};w.sup95={}}
{const base=growthDigest;growthDigest=function(w){try{growSnap95(w)}catch(e){console.error(e)}GROW95.mute=true;try{return base.apply(this,arguments)}finally{GROW95.mute=false}}}
{const base=sendLetter;sendLetter=function(w,o){if(GROW95.mute&&o&&/^grow-/.test(o.key||''))return;return base.apply(this,arguments)}}
function growHTML95(w){const G=w&&w.growth95;if(!G)return '';const icon=k=>(STATS.find(s=>s[0]===k)||[])[2]||'';const nm=k=>(STATS.find(s=>s[0]===k)||[])[1]||k;
  const rows=G.rows.map(r=>{const g=gById(r.id);if(!g)return '';
    return `<div class="gr95r"><span class="gr95p">${gArt(g,'xs')}</span><b class="gr95n">${esc(g.name)}</b>${typeof fatChip90==='function'?fatChip90(g):''}
      <div class="gr95s">${r.d.map(x=>{const bu=r.band.some(b=>b.k===x.k);return `<span class="gr95c${bu?' band':''}" title="${esc(nm(x.k))}"><i>${icon(x.k)}</i><b>${x.from}</b>→<b>${x.to}</b><em>+${x.gain.toFixed(1)}</em></span>`}).join('')}</div>
      ${r.band.map(b=>`<div class="gr95b">⭐ ${esc(nm(b.k))} ${b.v} — ${b.t}</div>`).join('')}</div>`}).join('');
  const quiet=G.quiet.map(gById).filter(Boolean);
  if(!rows&&!quiet.length)return '';
  return `<div class="gr95"><div class="gr95h">${_T`📈 From your Doctores`} <span class="rc-sub">${_T`how the fighters grew this week`}</span></div>${rows||`<p class="rc-sub" style="margin:4px 0">${_T`Nobody moved this week.`}</p>`}
    ${quiet.length?`<div class="gr95q rc-sub">${_T`No change:`} ${quiet.map(g=>esc(g.name)).join(', ')}</div>`:''}</div>`}
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();if(!w||w.dead||MGR.view||MGR.tab!=='ludus'||!w.review||!w.growth95)return h;
  const sec=growHTML95(w);if(!sec)return h;const t=document.createElement('template');t.innerHTML=h;const b=t.content.querySelector('details.rev91 .mbody');if(!b)return h;b.insertAdjacentHTML('beforeend',sec);return t.innerHTML}catch(e){console.error(e)}return h}}

/* ---------------- 7 · the Armory is its own tab; only the healthy wear gear ---------------- */
{const g0=MGR_GROUPS[0][1];if(!g0.includes('armory')){const i=g0.indexOf('roster');g0.splice(i<0?g0.length:i+1,0,'armory')}}
BANNERS73.armory=[_T('🛡 The Armory'),_T('every blade, plate and token your house owns')];
{const base=roomScene73;roomScene73=function(k){return base.call(this,k==='armory'?'roster':k)}}
{const base=railTabs;railTabs=function(tabs,groups,cur,attr,cls){if(groups===MGR_GROUPS&&!tabs.some(t=>t[0]==='armory')){let n=0;try{const pm=me();n=arm94All(pm).filter(x=>x.P.dmg).length}catch(e){}
    const i=tabs.findIndex(t=>t[0]==='roster');tabs=tabs.slice();tabs.splice(i<0?tabs.length:i+1,0,['armory',n?_T`🛡 Armory · ${n}`:_T('🛡 Armory'),_T('Weapons, armor and offerings: who wears what, the shelf, repairs')])}
  return base.call(this,tabs,groups,cur,attr,cls)}}
function armoryTab95(){const pm=me();if(!pm)return '';const hurt=rosterOf(pm).filter(g=>g.inj);
  return `<h4 class="secth" style="margin-top:0">${_T`🛡 Your Armory`} <span class="rc-sub">${_T`only fit fighters can be equipped — a hurt fighter's gear waits on the shelf`}</span></h4>${hurt.length?`<p class="rc-sub ar95hurt">${_T`⚕ Hurt:`} ${hurt.map(g=>esc(g.name)).join(', ')}</p>`:''}${arm94HTML()}`}
{const base=ludusTabHTML;ludusTabHTML=function(){if(MGR.tab==='armory')return armoryTab95();return base.apply(this,arguments)}}
{const base=arm94Fit;arm94Fit=function(g,P,want){try{const pm=me();if(g&&g.inj&&pm&&g.contract&&g.contract.mgr===pm.id){return {no:sx(g,_T`${esc(g.name)} is hurt — equip him after he has healed.`,_T`${esc(g.name)} is hurt — equip her after she has healed.`)}}}catch(e){}return base.apply(this,arguments)}}
{const base=arm94HTML;arm94HTML=function(){let h=base.apply(this,arguments);try{const pm=me();const g=arm94Sel(pm);if(g&&g.inj)h=h.replace('<div class="ar94worn">',`<p class="ar94warn">${sx(g,_T`⚕ Hurt — he cannot be equipped until he has healed; his gear is on the shelf.`,_T`⚕ Hurt — she cannot be equipped until she has healed; her gear is on the shelf.`)}</p><div class="ar94worn">`);
  h=h.replace(/(<button type="button" class="ar94g[^"]*" data-ar94g="([^"]+)"[^>]*>[\s\S]*?<small>)/g,(m0,a,id)=>{const x=gById(id);return x&&x.inj?a+'⚕ ':a});return h}catch(e){console.error(e)}return h}}
/* hurt → the gear goes to the shelf at once */
function inj95Sweep(){try{const w=W_(),pm=me();if(!w||!pm||w.dead)return 0;let n=0;const H=arm94H(pm);
  for(const g of rosterOf(pm)){if(!g.inj||!g.eq94||g.eq94.h!==pm.id)continue;const E=g.eq94;const L=[E.R,E.L,...(E.a||[]),...(E.o||[])].filter(Boolean);if(!L.length)continue;
    for(const P of L)H.sh.push(P);g.re95=L.map(P=>P.id);E.R=null;E.L=null;E.a=[];E.o=[];n++;
    if(typeof tnews==='function')tnews(sx(g,_T`⚕ <b>${esc(g.name)}</b> is hurt — his gear went to the Armory shelf. Equip him again after he has healed.`,_T`⚕ <b>${esc(g.name)}</b> is hurt — her gear went to the Armory shelf. Equip her again after she has healed.`))}
  return n}catch(e){console.error(e);return 0}}
{const base=applyBout;applyBout=function(){const r=base.apply(this,arguments);inj95Sweep();return r}}
function re95Ids(g){const pm=me();const H=arm94H(pm);return (g.re95||[]).filter(id=>H.sh.some(P=>P.id===id))}
function re95Do(g){const pm=me();let n=0;for(const id of re95Ids(g)){const at=arm94Find(pm,id);const P=at&&at.P;let r;
    if(P&&P.dmg&&P.t==='a'&&g.eq94){/* a damaged piece he wore goes back on as it was (arm94Fit refuses damaged pieces from the shelf; bouts skip it until repaired) */arm94Detach(pm,at);if(P.loc==null)delete P.loc;g.eq94.a.push(P);r={ok:1}}
    else r=arm94Put(pm,id,{g:g.id,z:'auto'});if(r&&r.ok)n++}delete g.re95;return n}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-re95]');if(!b)return;e.stopPropagation();e.preventDefault();const g=gById(b.dataset.re95);if(!g)return;const n=re95Do(g);
  if(typeof mToast==='function')mToast(n?_T`🛡 ${esc(g.name)} is equipped again.`:sx(g,_T`Nothing of his is left on the shelf.`,_T`Nothing of hers is left on the shelf.`));saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const pm=me(),w=W_();if(!pm||!w)return I;
    for(const it of I)if(it.btn&&typeof it.btn==='string'&&it.btn.includes('data-id="roster"')&&/Armory/.test(it.btn))it.btn=it.btn.replace('data-id="roster"','data-id="armory"');
    for(const g of rosterOf(pm)){if(!g.re95||g.inj)continue;const E=g.eq94;const bare=!E||!(E.R||E.L||(E.a||[]).length);const left=re95Ids(g);
      if(!bare||!left.length){if(bare&&!left.length)delete g.re95;else if(!bare)delete g.re95;continue}
      I.push({done:false,ic:'🛡',txt:sx(g,_T`<b>${esc(g.name)}</b> has healed — equip him again`,_T`<b>${esc(g.name)}</b> has healed — equip her again`),btn:`<button class="btn tksm" type="button" data-re95="${g.id}">${_T`Re-equip`}</button> <button class="btn tksm" type="button" data-mg="tab" data-id="armory">${_T`🛡 Armory`}</button>`})}
    const st=st95Pool(w,pm);const fit=st.filter(g=>!g.inj).length;const have=st.filter(g=>g.slot95).length;
    if(!w.tutorial&&fit>have&&have<3)I.push({done:false,ic:'⭐',txt:_T`<b>${have} of 3</b> starter slots filled`,btn:`<button class="btn tksm" type="button" data-mg="tab" data-id="roster">${_T`Roster`}</button>`})}catch(e){console.error(e)}return I}}

/* ---------------- 8 · the roster: three starters, one bout each ---------------- */
const ST95={tab:'chart',perk:{morale:2,loy:1,benchMorale:1}};
const ST95_BOUT=[['under',_T('Bout I'),_T('Undercard')],['feature',_T('Bout II'),_T('Feature bout')],['main',_T('Bout III'),_T('Main event')]];
const st95Pool=(w,pm)=>w&&pm?w.glads.filter(g=>g.alive&&g.contract&&g.contract.mgr===pm.id):[];
function st95Free(pool,g){const taken=new Set(pool.filter(x=>x.slot95&&x!==g).map(x=>x.slot95));const o=effOvr(g);const pref=o>=70?3:o>=56?2:1;
  return [pref,...[1,2,3].filter(s=>s!==pref).sort((a,b)=>Math.abs(a-pref)-Math.abs(b-pref))].find(s=>!taken.has(s))||0}
function st95Ensure(w,pm){if(!w||!pm||!w.glads)return false;let ch=false;const pool=st95Pool(w,pm);const ids=new Set(pool.map(g=>g.id));
  for(const g of w.glads)if(g.slot95&&!ids.has(g.id)){delete g.slot95;ch=true}
  if(!w.st95){w.st95=1;ch=true;const by=(a,b)=>effOvr(b)-effOvr(a);for(const g of pool)delete g.slot95;
    let st=pool.filter(g=>!g.bench&&!g.inj).sort(by).slice(0,3);if(!st.length)st=pool.filter(g=>!g.inj).sort(by).slice(0,3);for(const g of st)g.slot95=st95Free(pool,g)}
  const seen=new Set();for(const g of pool){if(!g.slot95)continue;if(![1,2,3].includes(g.slot95)||seen.has(g.slot95)){delete g.slot95;ch=true}else seen.add(g.slot95)}
  for(const g of pool){const b=!g.slot95;if(!!g.bench!==b){g.bench=b;ch=true}}
  return ch}
/* a hurt starter keeps his slot; the bench is the healthy non-starters */
function st95Out(bo,gid){const w=W_(),T=TIERS[bo.tier];const i=bo.ents.indexOf(gid);if(i<0)return;const used=new Set(w.night.bouts.flatMap(x=>x.ents));
  const rep=freeAgents().find(q=>!used.has(q.id)&&!q.inj&&effOvr(q)>=T.lo-3&&effOvr(q)<=T.hi+3)||genGlad({ovr:T.lo+5});if(!rep.debut)rep.debut={s:w.season,wk:w.week};if(!gById(rep.id))w.glads.push(rep);bo.ents[i]=rep.id;voidBets(bo,gid)}
function st95Fill(w,pm,force){if(!w||!pm||!w.night||w.night.bye||w.dead)return 0;let n=0;const nt=w.night;
  for(const g of st95Pool(w,pm).filter(x=>x.slot95).sort((a,b)=>a.slot95-b.slot95)){if(g.inj||g.restWk===w.week)continue;const bo=nt.bouts[g.slot95-1];if(!bo||bo.done||(bo.wd||0)>=2)continue;if(bo.ents.includes(g.id))continue;
    const cur=nt.bouts.find(b=>b.ents.includes(g.id));if(cur&&(cur.done||!force))continue;
    const mineIn=bo.ents.map(gById).find(x=>x&&x.contract&&x.contract.mgr===pm.id);
    if(mineIn&&!(force&&mineIn.slot95!==g.slot95))continue;
    if(cur)st95Out(cur,g.id);
    const out=mineIn||bo.ents.map(gById).filter(x=>x&&!x.contract).sort((x,y)=>effOvr(x)-effOvr(y))[0];if(!out)continue;
    bo.ents[bo.ents.indexOf(out.id)]=g.id;voidBets(bo,out.id);(nt.auto95=nt.auto95||[]).push(g.id);n++}
  return n}
/* sitting a week out (108-v76): entries the plan put there do not count as "on the card"; taking it clears them */
{const base=sbyeOK76;sbyeOK76=function(w){w=w||W_();const n=w&&w.night;const auto=new Set((n&&n.auto95)||[]);if(!n||!auto.size)return base.apply(this,arguments);
  const keep=n.bouts.map(b=>b.ents);try{n.bouts.forEach((b,i)=>{b.ents=keep[i].map(id=>auto.has(id)?'__auto95':id)});return base.apply(this,arguments)}finally{n.bouts.forEach((b,i)=>{b.ents=keep[i]})}}}
{const base=takeSbye76;takeSbye76=async function(){const r=await base.apply(this,arguments);try{const w=W_(),n=w&&w.night;if(n&&n.selfBye&&n.auto95){const m=me();for(const bo of n.bouts)if(!bo.done)for(const id of bo.ents.slice()){const g=gById(id);if(g&&g.contract&&g.contract.mgr===m.id)st95Out(bo,id)}n.auto95=[];saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()}}catch(e){console.error(e)}return r}}
function st95Weekly(w,pm){if(!w||!pm||w.dead||w.tutorial)return;const key=w.season*100+w.week;if(w.fill95===key)return;w.fill95=key;st95Fill(w,pm,false)}
function st95Set(pm,gid,slot){const w=W_();const pool=st95Pool(w,pm);const g=pool.find(x=>x.id===gid);if(!g||g.inj)return {no:_T('Only a fit fighter can start.')};
  if(!slot)slot=st95Free(pool,g);if(!slot)return {no:_T('Three starters already — pick a slot to change, or bench one first.')};
  const prev=pool.find(x=>x.slot95===slot&&x!==g);const old=g.slot95||0;if(prev){if(old)prev.slot95=old;else delete prev.slot95}g.slot95=slot;st95Ensure(w,pm);if(!w.tutorial)st95Fill(w,pm,true);return {ok:1}}
function st95Bench(pm,gid){const w=W_();const g=st95Pool(w,pm).find(x=>x.id===gid);if(!g)return;delete g.slot95;st95Ensure(w,pm)}
function st95Chip(g,pm,w){const C=CLASSES[g.cls];const on=w.night&&w.night.bouts.some(b=>b.ents.includes(g.id)&&!b.done);
  const h=`<span class="st95chip ${g.inj?'hurt':''} ${MGR.lsel===g.id?'me':''}" data-mg="lsel" data-id="${g.id}" role="button" tabindex="0" title="${esc(g.name)}">${gArt(g,'xs')}<b>${esc(g.name)}</b><small>${effOvr(g)}${C?' · '+esc(C.name):''}${g.inj?' · ⚕':''}${on?' · ✓ '+_T('on the card'):''}</small></span>`;
  try{return typeof imm88Frame==='function'?imm88Frame(h,g):h}catch(e){return h}}
function st95ChartHTML(pm,w){const pool=st95Pool(w,pm).sort((a,b)=>effOvr(b)-effOvr(a));const fit=pool.filter(g=>!g.inj);
  const slot=([k,nm,sub],i)=>{const s=i+1;const g=pool.find(x=>x.slot95===s);const bo=w.night&&w.night.bouts[i];const on=g&&bo&&bo.ents.includes(g.id);const T=TIERS[k];
    const opts=fit.filter(x=>x!==g).map(x=>`<option value="${x.id}">${esc(x.name)} · ${effOvr(x)}${x.slot95?' · '+ST95_BOUT[x.slot95-1][1]:''}</option>`).join('');
    return `<div class="st95slot ${g?'full':'empty'}" data-slot95="${s}"><div class="st95sh"><b>${nm}</b><span class="rc-sub">${sub} · ${T.lo?T.lo+'+':'≤ '+T.hi}</span></div>
      ${g?`<div class="st95sp">${st95Chip(g,pm,w)}${on?`<span class="st95on">${_T`✓ entered`}</span>`:''}</div>`:`<div class="st95sp rc-sub">${_T`Empty — promote someone from the list.`}</div>`}
      <div class="st95sa"><select class="tin" data-st95slot="${s}" aria-label="${esc(_T`Who starts in ${nm}`)}"><option value="">${g?_T('Change…'):_T('Choose…')}</option>${opts}</select>${g?`<button type="button" class="btn tksm" data-st95="bench" data-id="${g.id}">${_T`🪑 Bench`}</button>`:''}</div></div>`};
  const bench=fit.filter(g=>!g.slot95),hurt=pool.filter(g=>g.inj);
  return `<div class="st95slots">${ST95_BOUT.map(slot).join('')}</div>
    <div class="st95bench"><div class="dhd">${_T`🪑 Bench`} · ${bench.length}</div><div class="st95chips">${bench.map(g=>st95Chip(g,pm,w)).join('')||`<span class="rc-sub">${_T`Nobody on the bench.`}</span>`}</div>
    ${hurt.length?`<div class="dhd" style="margin-top:6px">${_T`⚕ Hurt`} · ${hurt.length}</div><div class="st95chips">${hurt.map(g=>st95Chip(g,pm,w)).join('')}</div>`:''}</div>`}
function st95DepthHTML(pm,w){const out=w.glads.filter(g=>g.alive&&g.loanFrom&&g.loanFrom.mid===pm.id&&g.contract&&g.contract.mgr!==pm.id);const inn=st95Pool(w,pm).filter(g=>g.loanFrom&&g.loanFrom.mid!==pm.id);const n=out.length+inn.length;
  const lo=typeof loansCardHTML==='function'?loansCardHTML():'';
  return `<div class="card2 depth st95"><div class="st95tabs" role="tablist"><button type="button" role="tab" data-st95tab="chart" class="${ST95.tab==='chart'?'on':''}" aria-selected="${ST95.tab==='chart'}">${_T`📋 Depth chart`}</button><button type="button" role="tab" data-st95tab="loans" class="${ST95.tab==='loans'?'on':''}" aria-selected="${ST95.tab==='loans'}">${_T`🤝 Loans`} · ${n}</button>
    <span class="rc-sub st95hint">${ST95.tab==='chart'?_T`up to three starters, one Match Week bout each — Match Week is filled from them`:_T`fighters you lend out or borrow — never with a rival`}</span></div>
    ${ST95.tab==='chart'?st95ChartHTML(pm,w):(lo||`<p class="rc-sub" style="margin:8px 0 2px">${_T`No fighter is on loan. Lend a benched fighter from the list below.`}</p>`)}</div>`}
{const base=rosterBlockHTML;rosterBlockHTML=function(){const h=base.apply(this,arguments);try{const pm=me(),w=W_();if(!pm||!w)return h;const t=document.createElement('template');t.innerHTML=h;const grid=t.content.querySelector('.mgrid.wide');if(!grid)return h;
  if(st95Ensure(w,pm))w._st95dirty=1;
  const left=grid.children[0],right=grid.children[1];if(!left||!right)return h;
  const tab=left.querySelector('table.tally');
  if(tab){const lenders=w.mgrs.filter(m=>!m.isPlayer&&!isRival(m)&&opinionOf(m).v>=30&&rosterOf(m).length<9);
    const hr=tab.querySelector('tr');if(hr)hr.insertAdjacentHTML('beforeend',`<th>${_T`Squad`}</th>`);
    tab.querySelectorAll('tr[data-mg="lsel"]').forEach(r=>{const g=gById(r.dataset.id);if(!g)return;let c='';
      if(g.slot95)c=`<span class="st95tag">${ST95_BOUT[g.slot95-1][1]}</span><button type="button" class="btn tksm" data-st95="bench" data-id="${g.id}" title="${_T`Send to the bench`}">${_T`🪑 Bench`}</button>`;
      else if(g.inj)c=`<span class="rc-sub">${_T`⚕ hurt`}</span>`;
      else{const full=st95Pool(w,pm).filter(x=>x.slot95).length>=3;c=`<button type="button" class="btn tksm" data-st95="promo" data-id="${g.id}" ${full?`aria-disabled="true" title="${esc(_T('Three starters already — bench one or pick a slot above.'))}"`:`title="${esc(sx(g,_T('Make him a starter'),_T('Make her a starter')))}"`}>${_T`⭐ Promote`}</button>`;
        if(!g.loanFrom&&lenders.length)c+=`<select class="tin dclend" data-m47lend="${g.id}" title="${_T`Lend out for 3 weeks`}"><option value="">${_T`Lend…`}</option>${lenders.map(m=>`<option value="${m.id}">${esc(m.ludus)} · ${loanFee(g)}/wk · 3 wk</option>`).join('')}</select>`}
      r.insertAdjacentHTML('beforeend',`<td class="st95act">${c}</td>`)})}
  return `<div class="st95wrap"><div class="st95left">${st95DepthHTML(pm,w)}<div class="card2 st95list">${left.outerHTML}</div></div><div class="st95right">${right.innerHTML}</div></div>`}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;let x;
  if((x=t.closest('[data-st95tab]'))){e.stopPropagation();ST95.tab=x.dataset.st95tab;if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
  if((x=t.closest('[data-st95]'))){e.stopPropagation();e.preventDefault();const pm=me(),w=W_();if(!pm||!w)return;const id=x.dataset.id;
    if(x.dataset.st95==='promo'){const r=st95Set(pm,id,0);if(r.no){if(typeof mToast==='function')mToast('⛔ '+r.no);return}}else st95Bench(pm,id);
    saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
  if(t.closest('td.st95act'))e.stopPropagation()},true);
document.addEventListener('change',e=>{const s=e.target;if(!s||!s.dataset||!s.dataset.st95slot)return;e.stopPropagation();const pm=me(),w=W_();if(!pm||!w||!s.value)return;const r=st95Set(pm,s.value,+s.dataset.st95slot);
  if(r.no&&typeof mToast==='function')mToast('⛔ '+r.no);saveWorld();if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);
/* the plan is read each render (cheap) + the weekly default fill, once */
{const base=mgrHTML;mgrHTML=function(){try{const w=W_(),pm=w&&!w.dead?me():null;if(w&&pm&&w.glads){if(st95Ensure(w,pm))w._st95dirty=1;inj95Sweep();st95Weekly(w,pm);if(w._st95dirty){delete w._st95dirty;saveWorld()}}}catch(e){console.error(e)}return base.apply(this,arguments)}}
{const base=signGlad;signGlad=function(){const r=base.apply(this,arguments);try{const w=W_(),pm=me();if(w&&pm)st95Ensure(w,pm)}catch(e){}return r}}
/* the weekly perk (after the week turns) */
{const base=endWeek;endWeek=async function(){const w0=W_(),pm0=w0&&!w0.dead?me():null;const wk=w0&&w0.week;let S0=[],B0=[];
  try{if(w0&&pm0&&!w0.tutorial){st95Ensure(w0,pm0);inj95Sweep();const pool=st95Pool(w0,pm0);S0=pool.filter(g=>g.slot95).map(g=>g.id);B0=pool.filter(g=>!g.slot95&&!g.inj&&typeof wants88==='function'&&wants88(g).includes('arena')).map(g=>g.id)}}catch(e){console.error(e)}
  const r=await base.apply(this,arguments);
  try{const w=W_();if(r!==false&&w&&w===w0&&w.week!==wk&&!w.dead&&!w.tutorial){const pm=me();inj95Sweep();
      for(const id of S0){const g=gById(id);if(g&&g.alive&&g.contract&&g.contract.mgr===pm.id){g.morale=clamp((g.morale||0)+ST95.perk.morale,0,100);g.loyB=clamp((g.loyB||0)+ST95.perk.loy,0,25)}}
      const sat=[];for(const id of B0){const g=gById(id);if(g&&g.alive&&g.contract&&g.contract.mgr===pm.id&&!g.slot95){g.morale=clamp((g.morale||0)-ST95.perk.benchMorale,0,100);sat.push(g.name)}}
      if(sat.length&&typeof tnews==='function')tnews(_T`🪑 ${sat.map(esc).join(', ')} want${sat.length===1?'s':''} arena time and sat on the bench: −1 morale.`);
      st95Ensure(w,pm);saveWorld()}}catch(e){console.error(e)}return r}}
/* old saves: the first three of the old chart start (saved once) */
SAVE_MIGRATIONS.push(['0.95',w=>{const pm=(w.mgrs||[]).find(m=>m.isPlayer);if(pm&&st95Ensure(w,pm))w._st95dirty=1}]);
{const base=mgrMigrate;mgrMigrate=function(w){const o=base.apply(this,arguments);try{const pm=o&&o.glads?(o.mgrs||[]).find(m=>m.isPlayer):null;if(pm&&st95Ensure(o,pm))o._st95dirty=1}catch(e){console.error(e)}return o}}
{const base=newWorld;newWorld=function(){const r=base.apply(this,arguments);try{const w=W_(),pm=w?me():null;if(w&&pm){st95Ensure(w,pm)}}catch(e){console.error(e)}return r}}
{const base=openManager;openManager=async function(){const r=await base.apply(this,arguments);try{const w=W_();if(w&&w._st95dirty){delete w._st95dirty;saveWorld()}}catch(e){}return r}}
/* the lesson: the Armory step opens the Armory tab */
try{const a=MTUT_STEPS.find(s=>s.k==='armory');if(a){a.enter=()=>{MGR.tab='armory';if(typeof MGR_REDRAW==='function')MGR_REDRAW()};
    a.say=_T`<b>🛡 The Armory</b> — its own tab. Your fighters own their gear: pick a fighter, then drag a weapon into a hand or armor onto the body. Only fit fighters can be equipped; weapons lost on the sand are gone; armor broken to 0 AP comes home damaged — the armorer in the City Square mends it.`}}catch(e){console.error(e)}

/* ---------------- 9 · the trophy case: built-in silverware locked until earned ---------------- */
{const base=hallTrophiesHTML;hallTrophiesHTML=async function(){const h=await base.apply(this,arguments);try{const L=await Store.list('hallTrophies').catch(()=>[]);const got=new Set(L.map(t=>t.tid).filter(Boolean)),gotN=new Set(L.map(t=>t.name));
  const t=document.createElement('template');t.innerHTML=h;t.content.querySelectorAll('.trlist .trli').forEach(el=>{const nm=(el.querySelector('b')||{}).textContent;const d=TROPHY_LIB.find(x=>x.name===nm);if(!d)return;const ok=got.has(d.id)||gotN.has(d.name);
    el.classList.add('tb95',ok?'earned95':'lock95');el.style.setProperty('--tb',`hsl(${hashStr('trb95:'+d.id)%360} 58% 56%)`);el.title=ok?_T('Earned'):_T('Not earned yet');if(!ok)el.insertAdjacentHTML('afterbegin','<span class="lk95" aria-hidden="true">🔒</span>')});
  return t.innerHTML}catch(e){console.error(e)}return h}}

/* ---------------- styles ---------------- */
{const st=document.createElement('style');st.textContent=`
.sgface.sgface95{width:84px;height:118px;display:grid;place-items:center}.sgface.sgface95 .portrait{width:84px!important;height:118px!important}.sgface.sgface95 .portrait svg{max-height:none}
.pw85 .pcard.pt85{height:auto!important;min-height:52px;grid-template-rows:auto auto auto!important;padding-bottom:6px!important;cursor:pointer}
.pw85 .pcard.pt85 .nx95{grid-column:1/-1;font-size:11px;line-height:1.25;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px}
.pw85 .pcard.pt85:focus-visible{outline:2px solid var(--gold);outline-offset:1px}
.gr95{margin-top:10px;padding-top:8px;border-top:1px solid rgba(90,60,30,.35)}.gr95h{font-weight:700;color:#6b3f12;margin-bottom:4px}.gr95 .fb90{background:rgba(30,20,10,.82);padding:1px 7px;border-radius:9px;justify-self:end}
.gr95r{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:2px 8px;align-items:center;padding:4px 0;border-top:1px solid rgba(90,60,30,.18)}
.gr95r .gr95p{grid-row:1/3;width:28px;height:40px;overflow:hidden;display:grid;place-items:center}.gr95r .gr95p .portrait{width:26px!important;height:36px!important}
.gr95n{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gr95s{grid-column:2/4;display:flex;flex-wrap:wrap;gap:4px}.gr95c{display:inline-flex;align-items:baseline;gap:3px;padding:1px 7px;border-radius:10px;background:rgba(255,255,255,.55);border:1px solid #a98a58;font-size:12px;white-space:nowrap;color:#4a3a28}
.gr95c b{font-family:var(--mono);color:#2a1d10}.gr95c em{font-style:normal;color:#1f7a2a;font-weight:700}.gr95c.band{border:2px solid #b8860b;background:rgba(230,185,58,.38)}.gr95c.band em{color:#6b4a00}
.gr95b{grid-column:2/4;font-size:12px;font-weight:600;color:#7a4a10}.gr95q{margin-top:6px}
.ar95hurt{margin:0 0 6px;color:#f2a497}
.st95wrap{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:12px;align-items:start}.st95left{display:grid;gap:10px;min-width:0}.st95right{min-width:0}
.st95tabs{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px}.st95tabs button{padding:4px 10px;border:1px solid var(--line2);border-radius:6px;background:var(--panel2);color:var(--bone);cursor:pointer}.st95tabs button.on{border-color:var(--gold);color:var(--gold2)}
.st95hint{flex:1 1 200px}
.st95slots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.st95slot{border:1px solid #6b4f2e;border-top:2px solid #c9a24a;border-radius:6px;padding:6px 8px;background:linear-gradient(180deg,rgba(78,55,33,.55),rgba(42,30,19,.7));display:grid;gap:5px;min-width:0;align-content:start}
.st95slot.empty{border-style:dashed;opacity:.9}.st95sh{display:grid;gap:0}.st95sh b{color:var(--gold2)}.st95sp{min-width:0;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.st95on{font-size:11px;color:#8fd18a}.st95sa{display:flex;gap:4px;flex-wrap:wrap;min-width:0}.st95sa select{flex:1 1 90px;min-width:0;font-size:12px}.st95sa .btn{white-space:nowrap}
.st95chips{display:flex;flex-wrap:wrap;gap:5px}
.st95chip{display:inline-grid;grid-template-columns:26px minmax(0,1fr);grid-template-rows:auto auto;gap:0 6px;align-items:center;max-width:100%;min-width:0;padding:3px 7px;border:1px solid #4a3622;border-radius:5px;background:rgba(0,0,0,.25);cursor:pointer}
.st95chip .portrait{grid-row:1/3;width:24px!important;height:34px!important}.st95chip b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px}.st95chip small{color:var(--muted);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st95chip.hurt{border-color:#a3281f}.st95chip.me{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold)}
.st95list .tally td.st95act{white-space:nowrap}.st95list .tally td.st95act .btn{margin-right:4px}.st95list .tally td.st95act select{width:74px;font-size:11px}.st95tag{font:600 11px var(--mono);color:var(--gold2);margin-right:4px}
.st95list{overflow-x:auto}
@media (max-width:1100px){.st95wrap{grid-template-columns:minmax(0,1fr)}}
@media (max-width:700px){.st95slots{grid-template-columns:minmax(0,1fr)}.st95list .tally td.st95act{white-space:normal}}
.y92c{container-type:inline-size;overflow:hidden;min-width:0}.y92c .yd76p{min-width:0;overflow-wrap:anywhere}.y92c .yd76p select{max-width:100%}.y92c .y92r>*{min-width:0}
@container (max-width:430px){.y92r{grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"l v pm" "m m m";row-gap:2px}.y92r .y92l{grid-area:l}.y92r .y92v{grid-area:v}.y92r .y92m{grid-area:m}.y92r .y92pm{grid-area:pm;justify-content:flex-end}
  .y92r.ro{grid-template-areas:"l v n" "m m m"}.y92r.ro .y92note{grid-area:n;grid-column:auto;white-space:normal;text-align:right;font-size:10.5px}}
.trli.tb95{position:relative;border:2px solid var(--tb,#6b4f2e)!important}.trli.lock95{filter:grayscale(.9) brightness(.62);opacity:.72}.trli.lock95 .lk95{position:absolute;right:6px;top:4px;font-size:14px;filter:none}
.trli.earned95{box-shadow:0 0 0 1px var(--tb,#6b4f2e)}`;document.head.appendChild(st)}

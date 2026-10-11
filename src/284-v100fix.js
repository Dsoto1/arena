/* =====================================================================
   284-V100FIX · v1.00 — fixes + changes from his v0.99 test notes (F1-F4, C1-C3). Test: tv100x.
   F1  Main menu: the online server-version chip (196 srv91Chip) never shows over the main menu (edit in 196: #onl must be on screen and
       the menu not on top of it).
   F2  Manager start bonus +AP (training/boost, Temple Mars, gear care +1, sparring, scouting the arena, Armory level, Vulcanalia...) lands
       only on locations that already HAVE armor: 05-flow trainAP100 replaces distributeAP for s.boost.ap (lowest AP first, none = nothing).
       Follow-up: a HUMAN places it again — trainAP100 opens the distribute dialog (199 distModal; 212's body-pick works too) with `DIST100.only` = the armored
       locations, the others disabled with "No armor here"; CPUs / sims / headless auto-place as before; no armor = no dialog.
   F3  A fighter in an Infirmary BED never trains: yard92Lock returns "🛏 In bed" (every y92 session / drill / lock-in / care / trial refuses
       him through y92Lock), thResolve drops his hour plan + sparring pairs before resolving, ord87Apply skips him, the old yard buttons
       (data-yb76 / data-yp76 / ptrain / yj / tp) refuse him with a toast, and the weekly regime (17-manager) lists him as sat out.
   F4  FOCUS! arena card: already a popup pick without a roll (chooseLocation 'card', body-pick UI of 212). New: a declared card is not
       double-spent by the Focus act — doAttack (04-rules) spends no movement and rolls no dice when player.focusNext is set.
   C1  League standings: a Points column + an ⓘ banner tooltip (231 LP100_TIP) saying how points are earned.
   C2  Trials of the Yard: compact card in the right column (art hidden, three one-block tiles with cost + what it does).
   C3  Acta Diurna: "RABBLE-ROUSERS OF THE WEEK" under the Darwinius awards — up to 4 spectators with portrait + one line. Real tallies
       (stones 16-crowd spectStone, offerings, spears survived, wagers won from S.crowdBets) are snapshotted per week into w.rab100 after
       a watched bout (mgrAfterWatch wrapper); unwatched weeks are filled from the regulars (CROWD_CACHE) or generated people by a HASH of
       world + week (never the dice RNG). composeWeekPaper wrapper adds P.rabble; paperHTML wrapper prints it.
   ===================================================================== */

/* ---------- F2b · humans place the start bonus again: the distribute dialog with the bare locations disabled (v1.0 follow-up) ---------- */
const DIST100={only:null};

/* ---------- F3 · bed patients do not train ---------- */
const bed100=g=>{try{return !!(g&&typeof inBed76==='function'&&inBed76(g))}catch(e){return false}};
{const base=yard92Lock;yard92Lock=function(g){if(bed100(g))return ['🛏',_T('In bed — no training')];return base.apply(this,arguments)}}
{const base=thResolve;thResolve=function(w){try{const P=thPlan(w);if(!P.done){
  for(const id of Object.keys(P.g||{})){const g=gById(id);if(bed100(g)){for(const k of Object.keys(P.g[id]))if(k!=='rehab')delete P.g[id][k]}}
  for(const id of Object.keys(P.y92||{}))if(bed100(gById(id)))delete P.y92[id];
  P.pairs=(P.pairs||[]).filter(p=>!(p.k==='spar'&&(bed100(gById(p.a))||bed100(gById(p.b)))))}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
{const base=ord87Apply;ord87Apply=function(w,g){if(bed100(g)&&g.ord87&&g.ord87.r!=='off'){g.ord87.short=0;return}return base.apply(this,arguments)}}
window.addEventListener('click',e=>{const t=e.target&&e.target.closest?e.target.closest('[data-yb76],[data-yp76],[data-mg="ptrain"],[data-yj],[data-tp^="g|"]'):null;if(!t||!t.closest('#mgrBody'))return;
  let id=null;if(t.dataset.yb76)id=t.dataset.yb76.split(':')[1];else if(t.dataset.yp76)id=t.dataset.yp76.split('|')[1];else if(t.dataset.tp){const a=t.dataset.tp.split('|');if(a[2]==='rehab')return;id=a[1]}else id=t.dataset.id;
  const g=id?gById(id):null;if(!bed100(g))return;e.preventDefault();e.stopImmediatePropagation();try{mToast(_T`🛏 ${esc(g.name)} is in bed — no training until he is out.`)}catch(er){}},true);

/* ---------- C2 · Trials of the Yard: a compact card ---------- */
{const st=document.createElement('style');st.textContent=`
.y99side .y92trials{padding:8px 10px}.y99side .y99who{grid-template-columns:auto minmax(0,1fr);gap:8px;padding-bottom:6px;margin-bottom:6px}
.y99side .y99who .portrait{transform-origin:left top;zoom:.62}.y99side .y99wn b{font-size:17px}
.y99side .y99sel .rc-sub:last-child{display:none}.y99side .y99sel{margin-bottom:6px}
.y99side .y92tg{display:grid;gap:6px;grid-template-columns:minmax(0,1fr)}.y99side .y92t{display:block;padding:6px 8px;grid-template-columns:none}
.y99side .y92ta{display:none}.y99side .y92tb{display:grid;gap:1px}.y99side .y92tb b{font-size:14px}.y99side .y92tl{font-size:12px}
.y99side .y92tb .btn{justify-self:start;margin-top:3px}
.y99side .y92tb{display:block}.y99side .y92tl:not(.give){display:inline-block;margin-right:10px}.y99side .y92tl.give{display:block}.y99side .y92tb .btn{margin-top:4px}
@container y99 (max-width:899px){.y99side .y92tg{grid-template-columns:repeat(3,minmax(0,1fr))}}
@container y99 (max-width:599px){.y99side .y92tg{grid-template-columns:minmax(0,1fr)}.y99side .y92t{grid-template-columns:none}}
`;document.head.appendChild(st)}

/* ---------- C3 · Acta Diurna: rabble-rousers of the week ---------- */
const RAB100={max:4,keep:4};
const rab100Score=e=>(e.st||0)*3+(e.off||0)*3+(e.sur||0)*4+Math.round((e.won||0)/8);
function rab100Snap(ctx){try{const w=W_();if(!w||!S||!S.spect||!S.spect.length)return;const wk=ctx&&ctx.week!=null?ctx.week:w.week;
  const wins={};for(const x of (S.crowdBets&&S.crowdBets.winners)||[])wins[x.name]=(wins[x.name]||0)+(x.pay||0);
  w.rab100=w.rab100||{};const cur=w.rab100[wk]=w.rab100[wk]||[];
  for(const s of S.spect){const t=s.t100||{};const won=wins[s.name]||0;if(!(t.st||t.off||t.sur||won))continue;
    let e=cur.find(x=>x.n===s.name);if(!e){e={n:s.name,look:s.look||{},city:s.city||'',st:0,off:0,sur:0,won:0};cur.push(e)}
    e.st+=t.st||0;e.off+=t.off||0;e.sur+=t.sur||0;e.won+=won}
  cur.sort((a,b)=>rab100Score(b)-rab100Score(a));cur.length=Math.min(cur.length,RAB100.max);
  for(const k of Object.keys(w.rab100).sort((a,b)=>b-a).slice(RAB100.keep))delete w.rab100[k]}catch(e){console.error(e)}}
{const base=mgrAfterWatch;mgrAfterWatch=async function(res,ctx){try{rab100Snap(ctx)}catch(e){}return base.apply(this,arguments)}}
/* the line for one entry: its strongest deed */
function rab100Line(e){const n=esc(e.n);const sc={st:(e.st||0)*3,off:(e.off||0)*3,sur:(e.sur||0)*4,won:Math.round((e.won||0)/8)};
  const k=Object.keys(sc).sort((a,b)=>sc[b]-sc[a])[0];
  if(k==='st')return _T`<b>${n}</b> hurled ${e.st} stone${e.st===1?'':'s'} at whoever was winning, and thanked nobody.`;
  if(k==='off')return _T`<b>${n}</b> threw ${e.off} offering${e.off===1?'':'s'} to a favourite and expects to be remembered for it.`;
  if(k==='sur')return _T`<b>${n}</b> had a spear thrown at them ${e.sur} time${e.sur===1?'':'s'} and lived to boast about it.`;
  return _T`<b>${n}</b> collected ${coinAmt87(e.won)} on a wager and is telling everyone it was skill.`}
/* fallback people: the regulars (or generated by hash) with a deed picked by hash — never the dice RNG */
function rab100Fill(world,wk,have){const out=[];const seen=new Set(have.map(x=>x.n));
  let pool=[];try{pool=(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).filter(r=>r&&r.name&&!r.quit&&!r.banned&&!seen.has(r.name))}catch(e){}
  const key=r=>hashStr(`${world.id}|${wk}|${r.id||r.name}`);pool.sort((a,b)=>key(a)-key(b));
  const mk=(r,i)=>{const h=key(r);const t=r.temper;const cat=t==='hothead'||t==='bloodthirsty'?'st':t==='generous'?'off':['st','off','sur','won'][h%4];
    const e={n:r.name,look:r.look||{},city:r.city||'',st:0,off:0,sur:0,won:0};
    if(cat==='st')e.st=2+h%5;else if(cat==='off')e.off=1+h%3;else if(cat==='sur')e.sur=1+h%2;else e.won=24+(h%9)*8;return e};
  for(const r of pool){if(out.length+have.length>=RAB100.max)break;out.push(mk(r))}
  const skins=typeof SKINS!=='undefined'?SKINS:['#e0ac7e'],hairs=typeof HAIRS!=='undefined'?HAIRS:['#2e2019'];
  for(let i=0;out.length+have.length<RAB100.max&&i<12;i++){const h=hashStr(`${world.id}|${wk}|gen${i}`);const f=h%2===0;
    const bank=(typeof NAMEBANK!=='undefined'&&NAMEBANK)||{};const nmA=f?bank.praeF:bank.prae;const trades=typeof SPECT_TRADES!=='undefined'?SPECT_TRADES:['the baker']; /* i18n:skip */
    const n=`${nmA&&nmA.length?nmA[h%nmA.length]:'Gaius'} ${trades[(h>>>5)%trades.length]}`; /* i18n:skip */if(seen.has(n)||out.some(x=>x.n===n))continue;
    const r={id:'g'+i,name:n,look:{skin:skins[(h>>>3)%skins.length],hair:hairs[(h>>>7)%hairs.length],fem:f,beard:!f&&(h>>>11)%2===0,long:f,robe:(typeof ROBES!=='undefined'?ROBES:['#7a2230'])[(h>>>13)%10]},temper:null};out.push(mk(r))}
  return out}
function rab100List(world,wk){const real=((world.rab100||{})[wk]||[]).filter(e=>rab100Score(e)>0).sort((a,b)=>rab100Score(b)-rab100Score(a)).slice(0,RAB100.max);
  const list=real.length>=3?real:[...real,...rab100Fill(world,wk,real)];
  return list.slice(0,RAB100.max).map(e=>({n:e.n,look:e.look||{},city:e.city||'',line:rab100Line(e),real:real.includes(e)?1:0}))}
{const base=composeWeekPaper;composeWeekPaper=function(world,night){const P=base.apply(this,arguments);try{const nt=arguments.length>1&&night!==undefined?night:world.night;const wk=nt?nt.week:world.week;if(P&&typeof P==='object')P.rabble=rab100List(world,wk)}catch(e){console.error(e)}return P}}
{const base=paperHTML;paperHTML=function(){let h=base.apply(this,arguments);try{const P=W_().lastPaper;if(!P||!P.rabble||!P.rabble.length)return h;
  const i=h.indexOf('<div class="prow">🏅');if(i<0)return h;const s0=h.lastIndexOf('<div class="psec">',i);if(s0<0)return h;const c=cutDiv(h,s0);if(!c)return h;const end=s0+c[0].length;
  const face=r=>{try{return typeof face99Spect==='function'?face99Spect(r.look||{},{px:44,city:r.city||undefined}):specFaceSVG(r.look||{},null,r.city)}catch(e){return ''}};
  const sec=`<div class="psec rab100"><div class="ph">${_T`RABBLE-ROUSERS OF THE WEEK`}</div>${P.rabble.map(r=>`<div class="prow rab100r"><span class="rab100f" aria-hidden="true">${face(r)}</span><span>${r.line}</span></div>`).join('')}</div>`;
  h=h.slice(0,end)+sec+h.slice(end)}catch(e){console.error(e)}return h}}
{const st=document.createElement('style');st.textContent=`
.rab100r{display:grid;grid-template-columns:44px minmax(0,1fr);gap:8px;align-items:center}.rab100f{width:44px;height:44px;border-radius:50%;overflow:hidden;display:block;border:1px solid var(--line2);background:#2a2018}
.rab100f svg{width:44px;height:44px;display:block}
`;document.head.appendChild(st)}

SAVE_MIGRATIONS.push(['1.00',w=>{w.rab100=w.rab100||{}}]);

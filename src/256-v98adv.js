/* =====================================================================
   256-V98ADV · v0.98 — ADVISOR LEVELS, EARNED (Virgilante 2026-10-08: "coin teaches, deeds earn") + RIVAL COUNCILS
   1 · Coin raises an advisor only to level 3 (REC98.up: 60 → L2, 120 → L3; every advisor has ⬆ Train). Levels 4 and 5 are
       EARNED by the house's record (adv98Req). Progress shows on the council card ("Level 4: graded signings 3/5 · fame 42/50").
       Checked at the end of each week (and when a career loads); a short letter from the advisor announces it. Never lost.
   2 · The player's counters live in w.adv98 {sgn,bands,healed,calm,clean,top4,won,rich,best,topCoin,morBest,hurt,sea}: signings fully
       graded before signing (signGlad), rating band-ups on your fighters (statGain), wounds healed (hurt set diff), seasons with no
       deaths (sea), top-4 / league wins (qsClose), treasury, morale, weeks without an unhappy departure. Migrated as 0 (SAVE_MIGRATIONS '0.98').
   3 · RIVAL HOUSES have the same council: m.adv98.lv {advisor: level}. Start by fame (55+ → 3, 35+ → 2, else 1; ADV98R.start), spend coin on
       Train up to level 3 when the purse is above ADV98R.floor (hash RNG, priority by personality), and earn 4/5 by fair CPU equivalents of the
       same conditions (adv98RReq). The Recruiter's level (advLvM) sets the precision of a rival's free-agent estimates (rec98Rival, 249).
   TWEAK: ADV98R below.
   ===================================================================== */
const ADV98R={start:[[55,3],[35,2],[0,1]],recBonus:2,pBase:2,floor:80,chance:70,
  pri:{recruiter:p=>20+p.cunning+p.ambition/2,doctore:p=>p.discipline+p.ambition/3,medicus:p=>p.honor,clerk:p=>p.greed,consilium:p=>p.ambition,barracks:p=>p.honor/2+p.discipline/2}};
const ADV98_K=['consilium','recruiter','doctore','medicus','clerk','barracks'];

/* ---------- the player's counters ---------- */
function adv98S(w){if(!w)return {};const S=w.adv98=w.adv98||{};for(const k of ['sgn','bands','healed','calm','clean','top4','won','rich','best','topCoin','morBest'])if(typeof S[k]!=='number')S[k]=0;
  if(!Array.isArray(S.hurt))S.hurt=[];S.lv=S.lv||{};return S}
function adv98Pm(w){return (w.mgrs||[]).find(m=>m.isPlayer)}
SAVE_MIGRATIONS.push(['0.98',w=>{adv98S(w);if(w.mgrs)for(const m of w.mgrs)if(!m.isPlayer)adv98R(m,w)}]);
{const base=mgrMigrate;mgrMigrate=function(w){const o=base.apply(this,arguments);try{if(o&&o.glads){adv98S(o);for(const m of o.mgrs||[])if(!m.isPlayer)adv98R(m,o)}}catch(e){console.error(e)}return o}}
{const base=newWorld;newWorld=function(){const r=base.apply(this,arguments);try{const w=W_();if(w&&!w.dead){adv98S(w);for(const m of w.mgrs||[])if(!m.isPlayer)adv98R(m,w)}}catch(e){console.error(e)}return r}}
/* a signing graded on all five before the contract */
{const base=signGlad;signGlad=function(g){const r=base.apply(this,arguments);try{const w=W_();if(w&&g&&g.truth98&&!g.cnt98&&typeof rec98Mine==='function'&&rec98Mine(g)&&STATS.every(([k])=>g.truth98.s[k]&&g.truth98.s[k]!=='?')){g.cnt98=1;adv98S(w).sgn++}}catch(e){console.error(e)}return r}}
/* rating band-ups on the player's fighters (the thresholds the Doctores report) */
{const base=statGain;statGain=function(g,k,amt){let v0=null;const w=W_();try{const m=g&&g.contract?mgrById(g.contract.mgr):null;if(w&&m&&m.isPlayer&&amt>0)v0=(gStats(g)||{})[k]}catch(e){}
  const up=base.apply(this,arguments);try{if(v0!=null&&up){const v1=(gStats(g)||{})[k];adv98S(w).bands+=bandsOf(k).filter(t=>v0<t&&v1>=t).length}}catch(e){console.error(e)}return up}}
/* healed / deaths / morale / treasury, once a week */
function adv98Hurt(w,pm){const S=adv98S(w);const cur=rosterOf(pm).filter(g=>g.inj).map(g=>g.id);
  S.healed+=S.hurt.filter(id=>{const g=gById(id);return g&&g.alive!==false&&g.contract&&g.contract.mgr===pm.id&&!g.inj}).length;S.hurt=cur}
function adv98Sea(w,pm){const S=adv98S(w);if(!S.sea||S.sea.season!==w.season)S.sea={season:w.season,deaths:0,c0:pm.coin,full:wkOf(w.week)===1};return S.sea}
function adv98Best(w,pm){const S=adv98S(w);for(const g of rosterOf(pm))S.best=Math.max(S.best,effOvr(g))}
{const base=endWeek;endWeek=async function(){const w=W_(),pm=me();let snap=null;
  try{if(w&&pm&&!w.tutorial&&!w.dead){adv98Hurt(w,pm);adv98Sea(w,pm);snap=rosterOf(pm).map(g=>({id:g.id,mo:g.morale}))}}catch(e){console.error(e)}
  const r=await base.apply(this,arguments);
  try{if(r!==false&&snap&&w&&!w.tutorial&&!w.dead){const S=adv98S(w);adv98Hurt(w,pm);let unh=false;
    for(const x of snap){const g=gById(x.id);if(!g)continue;if(g.alive===false){const sea=S.sea;if(sea)sea.deaths++}else if(!(g.contract&&g.contract.mgr===pm.id)&&!g.contract&&x.mo<45)unh=true}
    S.calm=unh?0:S.calm+1;const ros=rosterOf(pm);if(ros.length>=4)S.morBest=Math.max(S.morBest,Math.round(ros.reduce((a,g)=>a+g.morale,0)/ros.length));
    S.topCoin=Math.max(S.topCoin,pm.coin||0);adv98Best(w,pm);adv98Check(w,pm)}}catch(e){console.error(e)}
  try{if(r!==false&&w&&!w.tutorial&&!w.dead)adv98RivalWeek(w)}catch(e){console.error(e)}
  return r}}
/* the season closes: finish, treasury, deaths — for every house */
{const base=qsClose;qsClose=function(w,pm){const was=w&&w.qs&&w.qs.closed;const r=base.apply(this,arguments);
  try{if(w&&pm&&!was&&!w.tutorial){const L=leagueSort(w.mgrs,w.season);const S=adv98S(w);const pos=L.indexOf(pm)+1;if(pos&&pos<=4)S.top4++;if(pos===1)S.won++;
    const sea=S.sea;if(sea&&sea.season===w.season&&sea.full){if(!sea.deaths)S.clean++;if(pm.coin>sea.c0&&pm.coin>=3000)S.rich=1}
    L.forEach((m,i)=>{if(m.isPlayer)return;const R=adv98R(m,w);if(i<4)R.top4=(R.top4||0)+1;if(i===0)R.won=(R.won||0)+1})}}catch(e){console.error(e)}return r}}

/* ---------- the conditions ---------- */
/* [label, now, need] — all must be met; the level is the one being earned */
function adv98Req(w,pm,k,lv){const S=adv98S(w),f=pm.fame||0;
  const fame=n=>[_T('fame'),f,n];
  const titled=(w.specialLog||[]).some(x=>x&&x.mine)||(w.finale&&w.finale.champLudus===pm.ludus)||(w.archives||[]).some(a=>a&&a.finale&&a.finale.champLudus===pm.ludus)||S.won>0;
  const imm=rosterOf(pm).some(g=>mgrImmortalis88(g));
  const R={
    recruiter:{4:[[_T('graded signings'),S.sgn,5],fame(50)],5:[[_T('a signing rated 80'),S.best,80],fame(70)]},
    doctore:{4:[[_T('rating band-ups'),S.bands,10],fame(50)],5:[[_T('a fighter at 85 or Immortalis'),imm?85:S.best,85],fame(70)]},
    medicus:{4:[[_T('wounds healed'),S.healed,8]],5:[[_T('wounds healed'),S.healed,20],[_T('seasons without a death'),S.clean,1]]},
    clerk:{4:[[_T('treasury'),S.topCoin,1500]],5:[[_T('treasury, up on the season'),S.rich?3000:Math.min(2999,pm.coin||0),3000]]},
    consilium:{4:[[_T('seasons in the top four'),S.top4,1]],5:[[_T('a league or invitational title'),titled?1:0,1]]},
    barracks:{4:[[_T('average morale (4+ fighters)'),S.morBest,70]],5:[[_T('weeks without an unhappy exit'),S.calm,12]]}};
  return (R[k]&&R[k][lv])||[]}
const adv98Met=r=>r.length>0&&r.every(x=>x[1]>=x[2]);
const ADV98_LAUREL=()=>({4:_T('fourth'),5:_T('fifth')});
function adv98Check(w,pm){if(!w||w.tutorial||w.dead)return false;pm=pm||adv98Pm(w);if(!pm)return false;let up=false;
  for(const a of council83(w)){let lv=a.lv||1;while(lv>=REC98.coinMax&&lv<REC98.lvMax&&adv98Met(adv98Req(w,pm,a.k,lv+1))){lv++;a.lv=lv;up=true;
      const key='adv98-'+a.k+'-'+lv;const S=adv98S(w);S.lv[a.k+lv]=1;
      sendLetter(w,{key,kind:'letter',from:a.role,adv:a.k,seal:'🏛',title:_T`${a.name} has earned the ${ADV98_LAUREL()[lv]} laurel`,until:w.week+6,
        body:_T`${esc(a.name)}, your ${esc(a.role)}, has applied what the house taught — level ${lv}.${a.k==='recruiter'?_T(' More hours a week and sharper grades.'):''}`});
      tnews(_T`🏛 ${esc(a.name)} (${esc(a.role)}) reaches level ${lv}.`)}}
  if(up)saveWorld();return up}
/* on load */
{const seen=new WeakSet();const base=mgrHTML;mgrHTML=function(){try{const w=W_();if(w&&!w.dead&&!seen.has(w)){seen.add(w);adv98S(w);const pm=adv98Pm(w);if(pm){adv98Best(w,pm);if(adv98Check(w,pm))w._rec98dirty=1}}}catch(e){console.error(e)}return base.apply(this,arguments)}}
function adv98EvHTML(w,a){const pm=adv98Pm(w);const lv=a.lv||1;if(!pm||lv>=REC98.lvMax)return `<span class="rc-sub">${_T`top level`}</span>`;
  const r=adv98Req(w,pm,a.k,lv+1);if(!r.length)return '';
  return `<div class="c98ev" title="${esc(_T('Earned, not bought: the advisor must apply what he learned.'))}"><b>${_T`Level ${lv+1}`}</b> ${r.map(x=>`<span class="${x[1]>=x[2]?'ok':''}">${esc(x[0])} ${Math.min(x[1],x[2])}/${x[2]}</span>`).join(' · ')}</div>`}

/* ---------- rival councils ---------- */
function adv98R(m,w){w=w||W_();if(!m||m.isPlayer)return null;let R=m.adv98;if(!R||!R.lv){const st=(ADV98R.start.find(x=>(m.fame||0)>=x[0])||[0,1])[1];R=m.adv98={lv:{}};for(const k of ADV98_K)R.lv[k]=k==='recruiter'?Math.min(REC98.lvMax,st+ADV98R.recBonus):st}
  for(const k of ADV98_K)if(!R.lv[k])R.lv[k]=1;return R}
function advLvM(m,k){if(!m)return 1;if(m.isPlayer)return adv98Lv(W_(),k);const R=adv98R(m);return R?R.lv[k||'recruiter']||1:1}
/* fair CPU equivalents of the player's deeds (same thresholds where the data exists) */
function adv98RReq(w,m,k,lv){const R=adv98R(m,w),f=m.fame||0,ros=rosterOf(m);const best=ros.reduce((a,g)=>Math.max(a,effOvr(g)),0);const mo=ros.length>=4?Math.round(ros.reduce((a,g)=>a+g.morale,0)/ros.length):0;
  const t={recruiter:{4:[[best,70],[f,50]],5:[[best,80],[f,70]]},doctore:{4:[[m.improved||0,10],[f,50]],5:[[best,85],[f,70]]},medicus:{4:[[m.wins||0,10]],5:[[m.wins||0,25],[f,60]]},
    clerk:{4:[[m.coin||0,1500]],5:[[m.coin||0,3000]]},consilium:{4:[[R.top4||0,1]],5:[[R.won||0,1]]},barracks:{4:[[mo,70]],5:[[mo,80],[ros.length,4]]}};
  return (t[k]&&t[k][lv])||[]}
function adv98RivalWeek(w){for(const m of w.mgrs){if(m.isPlayer||m.dead)continue;const R=adv98R(m,w);const h=hashStr(`adv98:${w.id}:${m.id}:${w.week}`);
    /* earned levels first */
    for(const k of ADV98_K){const lv=R.lv[k];if(lv>=REC98.coinMax&&lv<REC98.lvMax){const q=adv98RReq(w,m,k,lv+1);if(q.length&&q.every(x=>x[0]>=x[1]))R.lv[k]=lv+1}}
    /* coin: one advisor a week, sometimes, only above the floor */
    if(h%100<ADV98R.chance){const p=m.p||{};const cand=ADV98_K.filter(k=>R.lv[k]<REC98.coinMax&&(m.coin||0)-ADV98R.floor>=REC98.up[R.lv[k]]).sort((a,b)=>(ADV98R.pri[b](p)-20*R.lv[b])-(ADV98R.pri[a](p)-20*R.lv[a]))[0];
      if(cand){m.coin-=REC98.up[R.lv[cand]];R.lv[cand]++}}}}

/* ---------- the League scouting card + the team screen: a small line ---------- */
function adv98RLine(m){const R=adv98R(m);if(!R)return '';const names=Object.fromEntries(COUNCIL83.map(a=>[a.k,a.role]));
  return `<div class="rc-sub adv98r" title="${esc(_T('Council levels'))}">${_T`🏛 Council`}: ${ADV98_K.map(k=>`${esc(names[k])} ${R.lv[k]}`).join(' · ')}</div>`}
{const base=lg90HTML;lg90HTML=function(R){let h=base.apply(this,arguments);try{if(R&&!R.isPlayer)h=h.replace(/(<\/div>)(\s*<div class="lg90week")/,'$1'+adv98RLine(R)+'$2')}catch(e){console.error(e)}return h}}
{const base=teamHTML;teamHTML=function(){let h=base.apply(this,arguments);try{const m=mgrById(MGR.teamId);if(m&&!m.isPlayer)h=adv98RLine(m)+h}catch(e){console.error(e)}return h}}
(()=>{const st=document.createElement('style');st.textContent=`.c98ev{font-size:10.5px;color:var(--muted);line-height:1.3;margin-top:4px;max-width:150px}.c98ev b{color:var(--gold2)}.c98ev .ok{color:#9fd49a}.adv98r{margin:4px 0}`;document.head.appendChild(st)})();

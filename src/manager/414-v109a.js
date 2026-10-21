/* =====================================================================
   414-v109a — v1.09a WINTER QUARTERS, THE HOUSE ROOMS (Manager off-season). His "Go" = W9a W10a W11c W12a W13a W14a (+ W5a W6a),
   tools/plans/v109/NOTES.md + MOCKUP.md. Adds rooms 3 Council, 4 Renown, 5 Facilities, 7 Winter market, 8 Winter camp to 413's stepper
   (413's WQ_X / WQ_K hook) and the Consilium's three goals to room 10. Any order (W5a): Begin needs nothing from these rooms.
   Kill switch localStorage flavius_v109aoff=1 (= v1.09: rooms 1 2 6 10 only, the old letters and level-ups). Test tv109a.
   3 · COUNCIL REVIEW (W9a): the six advisors (face, level ★, a one-line report from the house's numbers, 256 adv98Req's next-level record).
     ⬆ Promote: ONE free promotion a winter to an advisor who met his next earned level's record (levels 3–5; coin still buys level 2 with
     ⬆ Train). 349's "one level a season": the winter promotion is that advisor's rise for the coming season (adv104Rose wrapper), so an
     advisor who already rose this season may still be promoted. REPLACES 256 adv98Check's level-up letters in the off-season week (no
     check while it lasts nor at its end) and 349's retired-great letter "could stay with the house" (c104adv-*): the offer is answered
     here with 349's own [data-c104adv] buttons.
   4 · RENOWN & PERKS: 150 perkTree87() as is (363's Renown bar + this season's sources) — a second door, nothing removed.
   5 · FACILITIES (W10a): Your ludus' own Facilities (333 lu102FacHTML with 351's bp104 tiles, same data-mg="build"). ❄ WINTER WORKS: a
     project begun in the off-season week is ready at week 1 (351 bp104 n=1) for every house; one at a time as before (the builders are
     busy for the week). The off-season opens with the builders free (351 finishes every project then). In-season projects unchanged.
   7 · WINTER MARKET (W11c): a FRESH INTAKE of tirones when Winter Quarters opens: 8–12 free agents aged 18–20 (17 genGlad, rookie),
     deterministic from the world id + season (a hash stream stands in for Math.random / the dice RNG / Date.now while they are made —
     the match dice are never touched). Listed with class, age, the Recruiter's grade (249 rec98Ovr), OVR as scouted (estOvr), ask
     (askWage) and the Recruiter's ★ pick; 🔍 Scout / ✍ Offer open his card in Recruiting (steps 1 / 3). Recruiting stays open.
     REPLACES the Recruiter's "A bargain" / "Pick of the week" letter in that week (138 recruiter84 + 378 B51).
   8 · WINTER CAMP (W12a W13a W6a): one focus for the house (Strength & stamina · Weapons · Mend & rest · Bond the house); every fit
     fighter goes (the hurt stay in the ward), no drill injuries, no fatigue. Gains = a week of the Doctore's team drill at Normal
     (TH_DRILL × (1 + y92Bonus(council Doctore level)) × Y92_MUL.std ≈ 0.40–0.47 on two ratings) or morale / loyalty / rest.
     Held once a season (w.wq109a.camp); left unheld, it runs with the chosen focus (default Strength & stamina) when the season begins.
     It always lands AFTER 349's season turn (the turn runs when the off-season opens); the room shows the turn (OVR before → after) and
     then the camp's gains. REPLACES the off-season week's Training Yard team drill (373 thResolve: not run in that week's end).
   10 · CONSILIUM GOALS (W14a): three goals for the coming season, set when Winter Quarters opens from the house's state (finish top N,
     win N bouts, a fighter +4 OVR / a tiro wins a bout), paid in Renown when the next off-season opens (363's new source "Consilium
     goals"; 20 + 15 + 20). Progress: a line on the council card (Your ludus) during the season; the result as news. Milestones untouched.
   SAVES: w.wq109a {s, promo, camp, focus, works, intake, turn} per winter · w.gl109a {s, list, w0, o0, paid} the goals · w.gl109aLast.
     Optional fields, old saves fine (a save made mid-winter gets its intake / goals on first sight); no migration.
   ===================================================================== */
const A109={on:(()=>{try{return localStorage.getItem('flavius_v109aoff')!=='1'}catch(e){return true}})(),end:false};
window.A109=A109;
if(A109.on&&typeof V109WQ!=='undefined'&&V109WQ.on&&typeof WQ_X!=='undefined'){
/* ---------------- the rooms in the stepper ---------------- */
WQ_K.splice(0,WQ_K.length,'over','awards','books','council','renown','fac','staff','market','camp','next');
WQ_X.rooms.council=()=>({k:'council',i:'🏛',n:_T('Council review'),s:_T('Council'),adv:'consilium'});
WQ_X.rooms.renown=()=>({k:'renown',i:'⚜',n:_T('Renown & perks'),s:_T('Renown'),adv:'consilium'});
WQ_X.rooms.fac=()=>({k:'fac',i:'🏗',n:_T('Facilities'),s:_T('Facilities'),adv:'clerk'});
WQ_X.rooms.market=()=>({k:'market',i:'🔭',n:_T('Winter market'),s:_T('Market'),adv:'recruiter'});
WQ_X.rooms.camp=()=>({k:'camp',i:'⛺',n:_T('Winter camp'),s:_T('Camp'),adv:'doctore'});

/* ---------------- state ---------------- */
function a109S(w){let S=w.wq109a;if(!S||S.s!==w.season)S=w.wq109a={s:w.season,promo:null,camp:null,focus:'str',works:null,intake:null,turn:null};return S}
/* the hash stream (mulberry32) — never the dice */
function a109Pr(seed){let s=(seed>>>0)||1;return ()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
/* 7 · the intake: 8–12 tirones aged 18–20, the same for the same world and season */
function a109Gen(w){const s=w.season;const h0=hashStr('wq109a|'+w.id+'|'+s)>>>0;const pr=a109Pr(h0);const n=8+h0%5;const out=[];
  const mr=Math.random,dn=Date.now,R0=RNG,gn=genName;
  /* names taken = the printed heroes + this world's names (not this browser's session or custom lists — the same world, the same names) */
  const tk=new Set();const add=x=>x&&tk.add(String(x).toLowerCase());try{for(const k in CLASSES)add(CLASSES[k].hero);for(const x of BASE_NPCS)add(x.name);for(const g of w.glads||[])add(g.name);for(const m of w.mgrs||[])add(m.name)}catch(e){}
  try{Math.random=pr;RNG={next:pr};genName=function(o){return gn.call(this,{...(o||{}),taken:tk})};for(let i=0;i<n;i++){const at=1600000000000+(h0%1000000)*1000+s*86400+i*7919;Date.now=()=>at;
      const g=genGlad({rookie:true,age:18+Math.floor(pr()*3)});if(w.glads.some(x=>x.id===g.id)||out.some(x=>x.id===g.id))g.id+='w'+i;
      g.debut={s,wk:w.week};g.wq109a=s;out.push(g)}}
  finally{Math.random=mr;Date.now=dn;RNG=R0;genName=gn}
  return out}
/* 10 · the goals for the coming season, from the house's state when Winter Quarters opens */
const A109_GREN={top:20,wins:15,grow:20,tiro:20};
function a109GoalsMake(w,pm){const T=wqTable(w);const pos=T.indexOf(pm)+1||T.length;const sr=w.sr104&&w.sr104.s===w.season?w.sr104:null;
  const lw=sr?Math.max(0,(pm.wins||0)-(sr.wins||0)):((typeof adv98S==='function'&&adv98S(w).seaW)||0);
  const top=Math.max(3,Math.min(12,pos-2));const wins=Math.max(3,Math.min(20,lw+1));const young=rosterOf(pm).some(g=>wqAge(g)<=22);
  return {s:w.season+1,list:[{k:'top',t:top,ren:A109_GREN.top},{k:'wins',t:wins,ren:A109_GREN.wins},young?{k:'grow',t:4,ren:A109_GREN.grow}:{k:'tiro',t:1,ren:A109_GREN.tiro}],w0:null,o0:null,paid:null}}
function a109GoalTxt(x){return x.k==='top'?_T`Finish in the top ${x.t} of the league`:x.k==='wins'?_T`Win ${x.t} bouts`:x.k==='grow'?_T`A fighter of yours gains ${x.t} overall`:_T('A tiro (20 or younger) wins a bout for the house')}
function a109GoalsStart(w,G){const pm=me();if(!G||!pm||G.w0!=null||w.season!==G.s)return;G.w0=pm.wins||0;G.o0={};for(const g of rosterOf(pm))G.o0[g.id]=effOvr(g)}
/* progress: {now, met} — the season's numbers so far */
function a109GoalNow(w,G,x){const pm=me();if(!pm)return {now:0,met:false};
  if(x.k==='top'){const p=leagueSort(w.mgrs.filter(m=>!m.dead&&!m.sica),G.s).indexOf(pm)+1;return {now:p,met:!!p&&p<=x.t,pos:1}}
  if(x.k==='wins'){const n=G.w0==null?0:Math.max(0,(pm.wins||0)-G.w0);return {now:n,met:n>=x.t}}
  if(x.k==='grow'){let n=0;if(G.o0)for(const g of rosterOf(pm))if(G.o0[g.id]!=null)n=Math.max(n,effOvr(g)-G.o0[g.id]);return {now:n,met:n>=x.t}}
  const n=rosterOf(pm).filter(g=>g.ss&&g.ss.s===G.s&&(g.ss.w||0)>=1&&wqAge(g)<=20).length;return {now:n,met:n>=x.t}}
/* paid when the next off-season opens (before its season turn) */
function a109GoalsPay(w){const G=w.gl109a;const pm=me();if(!G||!pm||G.s!==w.season||G.paid)return null;
  const met=G.list.map(x=>a109GoalNow(w,G,x).met);const ren=G.list.reduce((a,x,i)=>a+(met[i]?x.ren:0),0);G.paid={met,ren};
  if(ren&&typeof renown105==='function')renown105(pm,'goal',ren);w.gl109aLast=G;
  const n=met.filter(Boolean).length;try{tnews(_T`🎯 The Consilium's goals: ${n} of ${G.list.length} met${ren?_T` — +${ren} Renown`:''}.`,n?'big':'')}catch(e){}return G.paid}
if(typeof REN105!=='undefined'&&REN105.lab)REN105.lab.goal=_T('Consilium goals');

/* winter opens (and old saves mid-winter): the intake, the goals */
function a109Ensure(w){if(!w||!wqLive(w))return null;const S=a109S(w);const pm=me();if(!pm)return S;
  if(!S.intake){const G=a109Gen(w);for(const g of G)w.glads.push(g);S.intake=G.map(g=>g.id);
    if(G.length)try{mnews(_T`🔭 <b>The winter intake:</b> ${G.length} tirones aged 18–20 come looking for a ludus.`)}catch(e){}}
  if(!w.gl109a||w.gl109a.s!==w.season+1)w.gl109a=a109GoalsMake(w,pm);
  return S}
window.a109Gen=a109Gen;window.a109Ensure=a109Ensure;

/* ---------------- 3 · council ---------------- */
const A109_NS=()=>_T('next season');
function a109Req(w,pm,a){const lv=a.lv||1;if(typeof REC98==='undefined'||lv<REC98.coinMax||lv>=REC98.lvMax)return null;const r=(adv98Req(w,pm,a.k,lv+1)||[]).filter(x=>x[0]!==A109_NS());return r.length?r:null}
function a109Can(w,pm,a){const r=a109Req(w,pm,a);return !!r&&adv98Met(r)}
function a109Promote(w,k){if(!wqLive(w))return null;const S=a109S(w);if(S.promo)return null;const pm=me();const a=council83(w).find(x=>x.k===k);if(!a||!a109Can(w,pm,a))return null;
  a.lv=(a.lv||1)+1;try{adv98S(w).lv[a.k+a.lv]=1}catch(e){}S.promo={k,lv:a.lv};
  try{tnews(_T`🏛 ${esc(a.name)} (${esc(a.role)}) is promoted to level ${a.lv}.`,'big')}catch(e){}try{saveWorld()}catch(e){}return S.promo}
function a109Report(w,a,pm){const sa=adv98S(w);const ros=rosterOf(pm);const T=wqTable(w);const S=a109S(w);
  const avg=ros.length?Math.round(ros.reduce((x,g)=>x+(g.morale||0),0)/ros.length):0;const wages=ros.reduce((x,g)=>x+(g.contract?g.contract.wage||0:0),0);
  return {consilium:()=>_T`Finished #${T.indexOf(pm)+1} of ${T.length} · ${msp(pm,w.season).pts||0} pts`,recruiter:()=>_T`${sa.sgn} graded signings · ${(S.intake||[]).length} tirones this winter`,
    doctore:()=>_T`${sa.bands} rating band-ups · best fighter ${sa.best||0}`,medicus:()=>_T`${sa.healed} wounds healed · ${ros.filter(g=>g.inj).length} in the ward`,
    clerk:()=>_T`Treasury ${pm.coin} · wages ${wages} a week`,barracks:()=>_T`Morale ${avg} · ${wqOpen(w)} contract asks`}[a.k]()}
function a109Council(w){const pm=me();const S=a109S(w);const C=council83(w);let can=0;
  const rows=C.map(a=>{const lv=a.lv||1;const r=a109Req(w,pm,a);const ok=!S.promo&&r&&adv98Met(r);if(ok)can++;
    const prog=lv>=REC98.lvMax?_T('Top level.'):lv<REC98.coinMax?_T('Level 2 is bought: ⬆ Train in Your ludus.'):r?`<b>${_T`Level ${lv+1}`}</b> `+r.map(x=>`<span class="${x[1]>=x[2]?'ok':''}">${esc(x[0])} ${Math.min(x[1],x[2])}/${x[2]}</span>`).join(' · '):'';
    const mine=S.promo&&S.promo.k===a.k;let rep='';try{rep=a109Report(w,a,pm)}catch(e){}
    const btn=mine?`<span class="badge gold">${_T`⬆ level ${S.promo.lv}`}</span>`:ok?`<button type="button" class="btn tksm primary" data-wq109a="promo|${a.k}">${_T`⬆ Promote to ${lv+1}`}</button>`:'';
    return `<div class="wqadv${mine?' up':''}" data-wq109aadv="${a.k}"><span class="wqadvf">${face83(a,50)}</span><div class="wqadvt"><b>${esc(a.name)}</b><span class="rc-sub">${esc(a.role)} · <span class="wqstar" aria-label="${esc(_T`level ${lv}`)}">${'★'.repeat(lv)}${'☆'.repeat(Math.max(0,REC98.lvMax-lv))}</span></span><span class="wqrep">${esc(rep)}</span><span class="c98ev">${prog}</span></div>${btn}</div>`}).join('');
  const offers=Object.entries(w.c104adv||{}).filter(([,G])=>G&&G.s===w.season).map(([gid,G])=>`<div class="wqrow wqgreat"><b>${esc(G.name)}</b><span class="rc-sub">${_T('a great of the sand offers to stay, at level 3 — whoever holds that seat steps aside')}</span><span class="acts"><button class="btn tksm" type="button" data-c104adv="${esc(gid)}|doctore">${_T`As Doctore`} <small>${_T`now level ${adv98Lv(w,'doctore')}`}</small></button><button class="btn tksm" type="button" data-c104adv="${esc(gid)}|barracks">${_T`As Barracks master`} <small>${_T`now level ${adv98Lv(w,'barracks')}`}</small></button></span></div>`).join('');
  const rule=S.promo?_T`One level a season: this promotion is his rise for season ${w.season+1}.`:_T`One free promotion this winter, for an advisor who met his record. It counts as his rise for season ${w.season+1}.`;
  return wqBan('council',_T`Season ${w.season} · your advisors and their records`,wqChip(S.promo?'✓':String(can),S.promo?_T('promoted'):_T('can rise'))+wqChip(String(C.length),_T('advisors')))
    +`<div class="card2 wq109c"><div class="sect">${_T('🏛 The Council')}</div><div class="wqadvs">${rows}</div><p class="rc-sub">${rule}</p>
      ${offers?`<div class="sect">${_T('🏺 A great could stay')}</div>${offers}`:''}
      ${wqSay('consilium',S.promo?_T('The council is stronger for the winter.'):can?_T('One of us has earned it. Choose.'):_T('No one has earned a laurel yet. Next winter.'))}</div>`}

/* ---------------- 4 · renown ---------------- */
function a109Renown(w){const pm=me();let r=null;try{r=typeof renOf105==='function'?renOf105(pm):null}catch(e){}let tree='';try{tree=perkTree87()}catch(e){console.error(e)}
  return wqBan('renown',_T('The lanista’s name: Renown and perks'),(r?wqChip(String(r.lv),_T('Renown')):'')+wqChip(String(pm.perkPts||0),_T('perk points')))+`<div class="wqren">${tree}</div>`}

/* ---------------- 5 · facilities ---------------- */
function a109Fac(w){const pm=me();const S=a109S(w);let fac='';
  try{if(typeof lu102FacHTML==='function'){const t=document.createElement('template');t.innerHTML=lu102FacHTML(w,pm);const box=t.content.querySelector('.lu102fb');if(box)fac=`<div class="wqfac ${esc(box.className.replace(/\blu100pop\b/,''))}">${box.innerHTML}</div>`}}catch(e){console.error(e)}
  if(!fac)try{fac=facilitiesHTML()}catch(e){}
  const b=typeof bp104Of==='function'?bp104Of(pm):null;const F=b&&FAC[b.k];
  const line=F?_T`❄ Winter works: the ${_T(F.n)} ${['I','II','III'][b.l-1]} — ready at week 1 of season ${w.season+1}.`:_T`❄ Winter works: one project this winter, ready at week 1 of season ${w.season+1}.`;
  return wqBan('fac',_T('The buildings — one winter project'),wqChip(`${typeof facSum==='function'?facSum(pm):0}/${Object.keys(FAC).length*3}`,_T('levels'))+wqChip(F?'1':'0',_T('building')))
    +`<div class="card2 wq109c"><p class="wqlead wqworks">${esc(line)}</p>${fac}<p class="rc-sub">${_T('The same buildings as Your ludus. In the season a level takes as many weeks as its number.')}</p></div>`}
/* ❄ winter works: a project begun in the off-season week is ready when it ends (every house) */
{const base=facBuild;facBuild=function(mgr,facKey){let live=false;try{live=wqLive()}catch(e){}const r=base.apply(this,arguments);
  try{if(r&&live&&mgr&&mgr.bp104){const w=W_();mgr.bp104.n=1;mgr.bp104.end=w.week;mgr.bp104.wq=1;if(mgr.isPlayer)a109S(w).works={k:facKey,l:mgr.bp104.l}}}catch(e){console.error(e)}return r}}
{const base=ludusClick;ludusClick=async function(action,id,btn,ctx){let live=false;try{live=action==='build'&&wqLive()&&typeof bp104Of==='function'&&typeof V104D!=='undefined'&&V104D.on}catch(e){}if(!live)return base.apply(this,arguments);
  const w=W_(),pm=me();const tell=s=>{try{mToast(s)}catch(e){}};const b=bp104Of(pm);
  if(b){tell(_T`Your builders are on the ${_T(FAC[b.k].n)} — one project at a time.`);return true}
  if(pm.facWk===w.week){tell(_T('Your builders are already busy this week.'));return true}
  const l=facLvl(pm,id);if(l>=3||!FAC[id])return true;if(pm.coin<FAC_COST[l]){tell(_T`The ${_T(FAC[id].n)} ${['I','II','III'][l]} costs ${FAC_COST[l]} coin.`);return true}
  facBuild(pm,id);try{tnews(_T`❄ Winter works begin on the ${esc(_T(FAC[id].n))} ${['I','II','III'][l]} (${coinAmt87(FAC_COST[l])}) — ready at week 1.`,'big')}catch(e){}saveWorld();
  tell(_T`🏗 The ${_T(FAC[id].n)} ${['I','II','III'][l]} will be ready at week 1.`);if(typeof MGR_REDRAW==='function')MGR_REDRAW();return true}}

/* ---------------- 7 · winter market ---------------- */
function a109Intake(w){const S=a109S(w);return (S.intake||[]).map(gById).filter(Boolean)}
function a109Pick(w){const pm=me();const L=a109Intake(w).filter(g=>g.alive!==false&&!g.contract);const v=g=>{try{return rec98Ovr(g).v}catch(e){return effOvr(g)}};
  const fit=g=>{try{return recFit(g,pm).mark==='✓'}catch(e){return false}};return L.slice().sort((a,b)=>(fit(b)-fit(a))||(v(b)-v(a)))[0]||null}
function a109Market(w){const pm=me();const L=a109Intake(w);const pick=a109Pick(w);const open=L.filter(g=>g.alive!==false&&!g.contract);
  const cn=g=>CLASSES[g.cls]?CLASSES[g.cls].name:g.cls;
  const rows=L.map(g=>{const own=g.contract&&g.contract.mgr===pm.id;const gone=g.contract&&!own;let gr='?',ov='?';try{const o=rec98Ovr(g);gr=o.txt;ov=o.p>=1?String(o.v):'~'+o.v}catch(e){}
    const act=own?`<span class="badge gold">${_T('yours')}</span>`:gone?`<span class="rc-sub">${_T`signed by ${esc((mgrById(g.contract.mgr)||{}).ludus||'')}`}</span>`:g.alive===false?'—'
      :`<span class="acts"><button class="btn tksm" type="button" data-wq109a="rec|${g.id}|1">${_T('🔍 Scout')}</button><button class="btn tksm primary" type="button" data-wq109a="rec|${g.id}|3">${_T('✍ Offer')}</button></span>`;
    return `<tr data-wq109ag="${g.id}" class="${pick===g?'pk':''}"><td class="nm"><span class="wqnm">${pick===g?`<i class="star85" title="${esc(_T('The Recruiter’s pick'))}">★</i>`:''}${wqArt(g)}<b>${esc(g.name)}</b></span></td><td>${esc(cn(g))}</td><td>${wqAge(g)}</td><td>${esc(gr)}</td><td>${esc(ov)}</td><td>${g.contract?'—':askWage(g)}</td><td>${act}</td></tr>`}).join('');
  return wqBan('market',_T('The winter intake — tirones looking for a ludus'),wqChip(String(open.length),_T('tirones'))+wqChip(String(rosterOf(pm).length),_T('on the roster')))
    +`<div class="card2 wq109c"><div class="sect">${_T('🔭 The winter intake')}</div>${rows?`<div class="wqtw"><table class="wqtbl wqmk"><thead><tr><th>${_T('Tiro')}</th><th>${_T('Class')}</th><th>${_T('Age')}</th><th>${_T('Grade')}</th><th>${_T('OVR')}</th><th>${_T('Ask')}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:`<p class="rc-sub">${_T('No intake this winter.')}</p>`}
      <p class="rc-sub">${_T('Grades are your Recruiter’s read. Recruiting stays open for every free agent.')} <button class="btn tksm" type="button" data-mg="tab" data-id="recruit">${_T('🤝 Recruiting')}</button></p>
      ${wqSay('recruiter',pick?_T`My pick: ${pick.name}. Young, and he fits the house.`:_T('Nothing here for us this winter.'))}</div>`}

/* ---------------- 8 · winter camp ---------------- */
const A109_CAMP=()=>[{k:'str',ic:'💪',n:_T('Strength & stamina'),d:_T('Strength and Speed · fatigue cleared'),st:['str','spd'],fat:1},
  {k:'wpn',ic:'⚔',n:_T('Weapons'),d:_T('Strength and Tactics'),st:['str','int']},
  {k:'mend',ic:'⚕',n:_T('Mend & rest'),d:_T('fatigue cleared · +5 morale'),fat:1,mo:5},
  {k:'bond',ic:'🤝',n:_T('Bond the house'),d:_T('+4 morale · +4 loyalty'),mo:4,loy:4}];
function a109Amt(w){try{return Math.round(TH_DRILL*(1+y92Bonus(adv98Lv(w,'doctore')))*(Y92_MUL.std?Y92_MUL.std.g:1.2)*100)/100}catch(e){return 0.4}}
const a109Fit=g=>!!g&&g.alive!==false&&!g.inj;
/* once a season, after 349's turn */
function a109Camp(w,f){if(!wqLive(w))return null;const S=a109S(w);if(S.camp)return null;try{if(typeof c104Live==='function'&&c104Live(w)&&w.c104s!==w.season)return null}catch(e){}
  const C=A109_CAMP().find(x=>x.k===(f||S.focus))||A109_CAMP()[0];const amt=a109Amt(w);const pm=me();const out={f:C.k,amt,g:{},ward:[]};
  for(const g of rosterOf(pm)){if(!a109Fit(g)){out.ward.push(g.id);continue}const G={};
    for(const k of C.st||[]){statGain(g,k,amt);G[k]=amt}
    if(C.fat){G.fat=gFat(g);g.fat=0}
    if(C.mo){g.morale=clamp((g.morale||50)+C.mo,0,100);G.mo=C.mo}
    if(C.loy){g.loyB=clamp((g.loyB||0)+C.loy,0,25);G.loy=C.loy}
    out.g[g.id]=G}
  S.camp=out;S.focus=C.k;try{tnews(_T`⛺ The winter camp: ${C.n}, ${Object.keys(out.g).length} fighters.`)}catch(e){}return out}
function a109CampHTML(w){const pm=me();const S=a109S(w);const C=A109_CAMP();const cur=S.camp?S.camp.f:S.focus;const amt=a109Amt(w);
  const cards=C.map(c=>`<button type="button" class="wqcf${c.k===cur?' on':''}" data-wq109a="focus|${c.k}" ${S.camp?'disabled':''} aria-pressed="${c.k===cur}"><span class="ic">${c.ic}</span><b>${esc(c.n)}</b><small>${esc(c.d)}${c.st?` (+${amt})`:''}</small></button>`).join('');
  const nm={spd:_T('Speed'),str:_T('Strength'),int:_T('Tactics'),cha:_T('Crowd'),lck:_T('Luck')};
  const ros=rosterOf(pm).slice().sort((a,b)=>effOvr(b)-effOvr(a));const T=S.turn||{};
  const rows=ros.map(g=>{const t=T[g.id];let ph='';try{ph={rise:_T('rising'),prime:_T('prime'),fade:_T('fading')}[c104Phase(g).ph]||''}catch(e){}
    const turn=t?`${t[0]} → ${t[1]}${t[1]>t[0]?' ▲':t[1]<t[0]?' ▼':''}`:'—';const G=S.camp&&S.camp.g[g.id];
    const camp=S.camp?(G?[...Object.keys(nm).filter(k=>G[k]).map(k=>`${nm[k]} +${G[k]}`),G.fat!=null?_T('rested'):'',G.mo?_T`morale +${G.mo}`:'',G.loy?_T`loyalty +${G.loy}`:''].filter(Boolean).join(' · '):_T('in the ward')):(a109Fit(g)?_T('goes'):_T('stays in the ward'));
    return `<tr data-wq109acamp="${g.id}" class="${a109Fit(g)?'':'ward'}"><td class="nm"><span class="wqnm">${wqArt(g)}<b>${esc(g.name)}</b></span></td><td>${esc(ph)}</td><td>${turn}</td><td>${esc(camp)}</td></tr>`}).join('');
  const fit=ros.filter(a109Fit).length;
  return wqBan('camp',_T('The house trains through the winter — one focus for everyone'),wqChip(String(fit),_T('go'))+wqChip(String(ros.length-fit),_T('in the ward')))
    +`<div class="card2 wq109c"><div class="sect">${_T('⛺ The focus')}</div><div class="wqcfs">${cards}</div>
      <div class="acts">${S.camp?`<button type="button" class="btn tksm" disabled>${_T('✓ The camp is held')}</button>`:`<button type="button" class="btn primary sd100 sd100p" data-wq109a="campgo">${_T('⛺ Hold the camp')}</button>`}</div>
      <p class="rc-sub">${_T('Every fit fighter goes; the hurt stay in the ward. No drill injuries. Unheld, the camp runs when the season begins.')}</p></div>
    <div class="card2 wq109c"><div class="sect">${_T('📜 The season turn, then the camp')}</div><div class="wqtw"><table class="wqtbl wqcamp"><thead><tr><th>${_T('Fighter')}</th><th>${_T('Career')}</th><th>${_T('Season turn (OVR)')}</th><th>${_T('Camp')}</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${wqSay('doctore',S.camp?_T('Good work. They will feel it in week 1.'):_T('Give me a focus and I will have them ready.'))}</div>`}

/* ---------------- 10 · the goals in Next season ---------------- */
function a109GoalsHTML(w){const G=w.gl109a&&w.gl109a.s===w.season+1?w.gl109a:null;if(!G)return '';const L=w.gl109aLast&&w.gl109aLast.s===w.season&&w.gl109aLast.paid?w.gl109aLast:null;
  const last=L?`<p class="rc-sub">${_T`Season ${w.season}: ${L.paid.met.filter(Boolean).length} of ${L.list.length} goals met · +${L.paid.ren} Renown.`}</p>`:'';
  return `<div class="card2 wq109c wqgoals"><div class="sect">${_T`🎯 The Consilium's goals for season ${w.season+1}`}</div><ul class="wqgl">${G.list.map(x=>`<li data-wq109agoal="${x.k}"><span>${esc(a109GoalTxt(x))}</span><b>${_T`+${x.ren} Renown`}</b></li>`).join('')}</ul>
    <p class="rc-sub">${_T('Paid when the season ends. The Lanista Milestones still count apart.')}</p>${last}</div>`}
{const base=WQ_FN.next;WQ_FN.next=function(w){let h=base.apply(this,arguments);try{h+=a109GoalsHTML(w);const S=a109S(w);if(!S.camp){const c=A109_CAMP().find(x=>x.k===S.focus)||A109_CAMP()[0];h=h.replace('<ul class="wqnotes">',`<ul class="wqnotes"><li>${esc(_T`The winter camp runs: ${c.n}.`)}</li>`)}}catch(e){console.error(e)}return h}}

WQ_FN.council=a109Council;WQ_FN.renown=a109Renown;WQ_FN.fac=a109Fac;WQ_FN.market=a109Market;WQ_FN.camp=a109CampHTML;
WQ_X.sum.council=w=>{const S=a109S(w);if(S.promo){const a=council83(w).find(x=>x.k===S.promo.k);return _T`${a?a.name:''} promoted to level ${S.promo.lv}`}const pm=me();const n=council83(w).filter(a=>a109Can(w,pm,a)).length;return n?_T`${n} advisor${n===1?'':'s'} can rise`:_T('No advisor ready to rise')};
WQ_X.sum.renown=w=>{const pm=me();let r=null;try{r=renOf105(pm)}catch(e){}return _T`Renown ${r?r.lv:0} · ${pm.perkPts||0} perk point${(pm.perkPts||0)===1?'':'s'}`};
WQ_X.sum.fac=w=>{const pm=me();const b=typeof bp104Of==='function'?bp104Of(pm):null;return b&&FAC[b.k]?_T`${_T(FAC[b.k].n)} ready at week 1`:_T('One winter project, ready at week 1')};
WQ_X.sum.market=w=>{const n=a109Intake(w).filter(g=>g.alive!==false&&!g.contract).length;return _T`${n} tirones in the winter intake`};
WQ_X.sum.camp=w=>{const S=a109S(w);const c=A109_CAMP().find(x=>x.k===(S.camp?S.camp.f:S.focus))||A109_CAMP()[0];return S.camp?_T`Held: ${c.n}`:_T`Choose a focus (${c.n})`};
WQ_X.sum.next=w=>_T`Season ${w.season+1}: the schedule and 3 goals`;
/* a room is ✓ */
{const base=wqDone;wqDone=function(w,k){try{const V=wqState(w).v;if(k==='council'){const S=a109S(w);return !!V.council&&(!!S.promo||!council83(w).some(a=>a109Can(w,me(),a)))}
  if(k==='renown'||k==='fac'||k==='market')return !!V[k];if(k==='camp')return !!a109S(w).camp}catch(e){console.error(e)}return base.apply(this,arguments)}}

/* ---------------- the hooks ---------------- */
/* the off-season opens: last season's goals are paid (before the turn); after: the turn's OVR changes, the intake, the goals, the letters */
{const base=po104OffStart;po104OffStart=function(w,P){let o0=null;try{if(w&&!w.tutorial&&!w.dead){a109GoalsPay(w);const pm=me();o0={};for(const g of rosterOf(pm))o0[g.id]=effOvr(g)}}catch(e){console.error(e)}
  const r=base.apply(this,arguments);
  try{if(!w||w.tutorial||w.dead||!wqLive(w))return r;const S=a109S(w);if(o0){S.turn={};for(const id in o0){const g=gById(id);if(g)S.turn[id]=[o0[id],g.alive===false?o0[id]:effOvr(g)]}}
    for(const m of w.mgrs||[])if(m.facWk===w.week&&!m.bp104)m.facWk=-1;
    w.letters=(w.letters||[]).filter(x=>!(x&&typeof x.key==='string'&&(/^c104adv-/.test(x.key)&&x.s===w.season||typeof council84Week==='function'&&x.key==='rec84-'+council84Week(w))));
    a109Ensure(w)}catch(e){console.error(e)}
  return r}}
/* the draw: an old save mid-winter gets its state */
{const base=mgrHTML;mgrHTML=function(){try{const w=W_();if(w&&wqLive(w))a109Ensure(w)}catch(e){console.error(e)}return base.apply(this,arguments)}}
/* the off-season week's end (Begin): the camp if unheld; no level-up letters, no team drill; the goals start counting */
{const base=endWeek;endWeek=async function(){const w=W_();let wq=false;try{wq=wqLive(w)}catch(e){}if(!wq)return base.apply(this,arguments);
  try{a109Ensure(w);a109Camp(w)}catch(e){console.error(e)}const s0=w.season;A109.end=true;let r;try{r=await base.apply(this,arguments)}finally{A109.end=false}
  try{const w2=W_();if(r!==false&&w2===w&&w.season>s0)a109GoalsStart(w,w.gl109a)}catch(e){console.error(e)}return r}}
{const base=adv98Check;adv98Check=function(w){try{if(A109.end||wqLive(w))return false}catch(e){}return base.apply(this,arguments)}}
if(typeof adv104Rose==='function'){const base=adv104Rose;adv104Rose=function(w,k){try{const S=w&&w.wq109a;if(S&&S.promo&&S.promo.k===k&&S.s===w.season-1&&c104Live(w))return true}catch(e){}return base.apply(this,arguments)}}
if(typeof recruiter84==='function'){const base=recruiter84;recruiter84=function(w){try{if(wqLive(w))return null}catch(e){}return base.apply(this,arguments)}}
{const base=thResolve;thResolve=function(w){const P=A109.end&&w?thPlan(w):null;const T=P&&P.y105;const on=T&&T.on;if(on)T.on=false;try{return base.apply(this,arguments)}finally{if(on)T.on=on}}}
/* in the season: the goals on the council card */
{const base=council83HTML;council83HTML=function(){const h=base.apply(this,arguments);try{const w=W_();const G=w&&w.gl109a;if(!h||!G||G.s!==w.season||G.paid||wqLive(w))return h;a109GoalsStart(w,G);
  const li=G.list.map(x=>{const p=a109GoalNow(w,G,x);return `<span class="${p.met?'ok':''}">${esc(a109GoalTxt(x))} — ${p.pos?'#'+p.now:p.now+'/'+x.t}</span>`}).join(' · ');
  return h.replace(/<\/div>\s*$/,`<div class="rc-sub wqgl109" data-wq109agl="1">🎯 ${_T('Consilium goals')}: ${li}</div></div>`)}catch(e){console.error(e)}return h}}

/* clicks */
document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-wq109a]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
  const w=W_();if(!w)return;const [a,v,x]=String(b.dataset.wq109a).split('|');
  if(a==='rec'){MGR.sel=v;MGR.recStep=+x||1;MGR.view=null;MGR.tab='recruit';if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}
  if(!wqLive(w))return;
  if(a==='promo'){const r=a109Promote(w,v);if(!r)try{mToast(_T('Not this one — one promotion a winter, for a met record.'))}catch(x2){}}
  else if(a==='focus'){const S=a109S(w);if(!S.camp&&A109_CAMP().some(c=>c.k===v))S.focus=v}
  else if(a==='campgo'){const r=a109Camp(w);if(r)try{mToast(_T`⛺ The camp is held: ${Object.keys(r.g).length} fighters.`)}catch(x2){}}
  try{saveWorld()}catch(x2){}if(typeof MGR_REDRAW==='function')MGR_REDRAW()},true);

{const st=document.createElement('style');st.textContent=`
.wqadvs{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px}
.wqadv{display:flex;gap:8px;align-items:center;padding:6px;border:1px solid rgba(214,171,76,.35);border-radius:8px;min-width:0}.wqadv.up{outline:2px solid #d6ab4c}
.wqadvf{flex:none;width:52px;height:52px;border-radius:50%;border:2px solid #b8913f;background:radial-gradient(circle at 50% 35%,#f4ead6,#d9c49a);display:flex;align-items:flex-end;justify-content:center;overflow:hidden}
.wqadvt{display:flex;flex-direction:column;min-width:0;flex:1}.wqadvt b{color:#f6dc98}.wqstar{color:#f0cf7d;letter-spacing:1px}.wqrep{font-size:12.5px}.wqadvt .c98ev{max-width:none}
.wqgreat{margin-top:4px}.wqren .card2{margin:0}.wqworks{color:#cfe6ff}.wqfac{margin:6px 0}
.wqnm{display:flex;gap:6px;align-items:center;min-width:150px;white-space:normal}.wqmk td,.wqcamp td{vertical-align:middle}.wqmk tr.pk td{background:rgba(214,171,76,.12)}.wqmk .star85{color:#f0cf7d;font-style:normal;margin-right:2px}.wqmk .acts{display:flex;gap:4px}
.wqcfs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:4px 0 8px}
.wqcf{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;padding:8px;border:1px solid #6b5236;border-radius:8px;background:linear-gradient(160deg,#2a2018,#17110c);color:#f3e3bd;cursor:pointer;min-width:0}
.wqcf.on{border-color:#f0cf7d;box-shadow:0 0 0 2px #d6ab4c inset}.wqcf[disabled]{cursor:default;opacity:.75}.wqcf.on[disabled]{opacity:1}.wqcf .ic{font-size:20px}.wqcf b{font:400 15px var(--display);color:#f6dc98}.wqcf small{font-size:11.5px;color:#cbb593}
.wqcamp tr.ward td{opacity:.65}.wqcamp td{white-space:normal}
.wqgl{list-style:none;margin:4px 0;padding:0}.wqgl li{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px dashed rgba(214,171,76,.3);font-size:13px}.wqgl li b{white-space:nowrap;color:#f0cf7d}
.wqgl109{margin-top:6px}.wqgl109 .ok{color:#9fd49a}
@media (max-width:760px){.wqcfs{grid-template-columns:repeat(2,minmax(0,1fr))}.wqadvs{grid-template-columns:minmax(0,1fr)}}
`;document.head.appendChild(st)}
}

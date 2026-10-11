/* =====================================================================
   294-V100LUDUS · v1.0 — "MY LUDUS" + THE ADVISORS (his mock tools/plans/mock100/ludus.html rounds 1–6, NOTES-ludus.md)
   =====================================================================
   A final mgrHTML wrapper reshapes the finished Your ludus page (every earlier wrapper has run: 202 banner chips, 270 desk, 272 fallen):
   1. BANNER (.roomhd.b73.b73-ludus kept): a laurel medallion with the week in Roman numerals, "Week N · Match Week" (his call: the name
      stays Match Week), the phase line (pre-match · games in <city> / after the games / bye), 202's ledger chips (.lst91) + "N this week",
      and the MATCH WEEK card (data-mg="tab" data-id="night") whose bout chips carry day · bout, the fighter's face, name and a fatigue dot
      (fresh / tired / worn = fatBand90). A bye week shows a stone plate with the next fixture. Art: the host city's scene (cityScene75),
      the school scene on a bye.
   2. WEEKLY TASKS = 270's #desk99, restyled as parchment (no behaviour lost: rows, Decide ▾, 📜, ✕, ↶, the done fold, the phone fold).
      Header: "Weekly tasks", 📬 Letters N (opens the LETTERS DRAWER over the tiles: 270's Letters section, Week in review first, past
      letters, the Acta button), a progress bar done/all. On desktop the parchment is pinned to the tiles' height and the list scrolls
      inside (fade + "▾ N more"); a "Coming up" line (next bye, next games, contracts ending) and a Flavius line close it.
   3. TILES — one weekly job each, art = the richer room scenes (294a scene100): 🛡 Your Team → Roster · 📯 Promote → 23's promote panel ·
      🏛 Upgrade School → 23's facilities panel (pips per building, the next build + price) · ⚒ Armory → the Armory tab ·
      🏛 Advisors (wide) = a BRONZE FRIEZE of the six council heads. The run panels (data-mg="run": promote, fac, consil, ledger, and
      school in the lesson league) open under the tiles (LU100.panel) with ✕; 23-ludus's own click sets MGR.run.
   4. ADVISORS: #council83 (131 + 249/256) becomes the frieze — each .c83p is a head (bronze by CSS filter; an advisor with an unread
      letter LIGHTS UP: colour portrait, gold ring, a slow glow (opacity only; still under Reduce motion), a one-line note).
      Click / Enter → the POPOVER (#lu100pop; phones: a bottom sheet + scrim): face, name, role, level badge + progress to the next level,
      what he does, his level's effect, his latest advice (📜 Read it opens the letter), and the upgrade line — ⬆ Train (249's own
      [data-c98up], coin, levels 1→2) or what earns the next level (256 adv98Req). 249/256's level chips stay inside each head (hidden).
   5. ADVISOR LEVELS — one clear effect each for the five that had none (his pick a, 2026-10-11); the player's house only, levels ≥2,
      at the week's end (endWeek wrapper) unless noted. TWEAK: ADV100.
        Consilium  +2 coin a level above 1 for every bout your fighters fought this week (the editors' terms).
        Doctore    +1 Doctore level in the Training Yard at Lv 2–3, +2 at Lv 4–5 (y92DocLv wrapper, cap 6).
        Medicus    a new wound heals 1 week sooner at Lv 2–3, 2 at Lv 4–5 (never before next week; once per wound, inj.md100).
        Clerk      3% of the week's wages a level above 1 comes back (a ledger line).
        Barracks   +1 morale a week a level above 1 for every fighter below 70 morale.
      (The Recruiter keeps 249's hours + grade accuracy.) No save change: inj.md100 is a flag on an existing object.
   Kill switch localStorage flavius_ludus100off=1 → 270's desk page. Test tv100l; shots tools/plans/ludus100/.
   ===================================================================== */
const LU100={mail:false,panel:null,pop:null,openKey:null,at:0};
function lu100On(){try{return localStorage.getItem('flavius_ludus100off')!=='1'}catch(e){return true}}
/* TWEAK: the advisor level effects */
const ADV100={consilCoin:2,clerkPct:3,barrMor:1,barrBelow:70,docK:lv=>Math.ceil((lv-1)/2),medK:lv=>Math.ceil((lv-1)/2)};
function adv100Lv(k){try{const w=W_();return w&&!w.tutorial?adv98Lv(w,k):1}catch(e){return 1}}
/* the level's effect in one line */
function adv100Fx(k,lv){const n=lv-1;
  if(k==='recruiter'){const sh=Math.round((1-REC98.lvK[lv])*100);return sh>0?_T`${REC98.hrs+REC98.perLv*n} recruiter's hours a week · grades ${sh}% sharper`:_T`${REC98.hrs+REC98.perLv*n} recruiter's hours a week`}
  if(n<1)return _T('no bonus yet — the house teaches him from level 2');
  if(k==='consilium')return _T`+${ADV100.consilCoin*n} coin for every bout your fighters fight`;
  if(k==='doctore')return _T`+${ADV100.docK(lv)} Doctore level in the Training Yard`;
  if(k==='medicus'){const d=ADV100.medK(lv);return d===1?_T('new wounds heal 1 week sooner'):_T`new wounds heal ${d} weeks sooner`}
  if(k==='clerk')return _T`${ADV100.clerkPct*n}% of the wages comes back each week`;
  if(k==='barracks')return _T`+${ADV100.barrMor*n} morale a week for fighters below ${ADV100.barrBelow}`;
  return ''}
/* Doctore: the yard's Doctore level */
{const base=y92DocLv;y92DocLv=function(w,m){const r=base.apply(this,arguments);try{if(m&&m.isPlayer&&w&&!w.tutorial){const a=ADV100.docK(adv98Lv(w,'doctore'));if(a>0)return Math.min(6,r+a)}}catch(e){}return r}}
/* Medicus: new wounds of the player's fighters close sooner */
function med100Apply(w,pm){if(!w||!pm||w.tutorial)return 0;const k=ADV100.medK(adv98Lv(w,'medicus'));if(k<1)return 0;let n=0;
  for(const g of rosterOf(pm)){const I=g.inj;if(!I||I.md100||I.war||typeof I.until!=='number')continue;I.md100=1;const nu=Math.max(w.week+1,I.until-k);if(nu<I.until){I.until=nu;n++}}return n}
{const base=applyBout;applyBout=function(){const r=base.apply(this,arguments);try{const w=W_();if(w&&!w.dead)med100Apply(w,me())}catch(e){console.error(e)}return r}}
{const base=endWeek;endWeek=async function(){const w=W_(),pm=me();let snap=null;
  try{if(w&&pm&&!w.tutorial&&!w.dead){const mine=new Set(rosterOf(pm).map(g=>g.id));const n=w.night;
    snap={bouts:n&&n.bouts?n.bouts.filter(b=>b.done).reduce((a,b)=>a+(b.ents||[]).filter(id=>mine.has(id)).length,0):0,wages:rosterOf(pm).reduce((a,g)=>a+((g.contract&&g.contract.wage)||0),0)}}}catch(e){console.error(e)}
  const r=await base.apply(this,arguments);
  try{if(r!==false&&snap&&w===W_()&&!w.dead){const lv=k=>adv98Lv(w,k);const C=council83(w);const nm=k=>{const a=C.find(x=>x.k===k);return a?esc(a.name):''};
    const c=ADV100.consilCoin*(lv('consilium')-1)*snap.bouts;if(c>0){pm.coin+=c;tnews(_T`🏛 ${nm('consilium')} won better terms from the editors: +${coinAmt87(c)}.`)}
    const k=Math.round(snap.wages*ADV100.clerkPct*(lv('clerk')-1)/100);if(k>0){pm.coin+=k;tnews(_T`🏛 ${nm('clerk')} haggled ${coinAmt87(k)} off the wages.`)}
    const mo=ADV100.barrMor*(lv('barracks')-1);if(mo>0)for(const g of rosterOf(pm))if(g.alive!==false&&g.morale<ADV100.barrBelow)g.morale=Math.min(ADV100.barrBelow,g.morale+mo);
    med100Apply(w,pm);if(c>0||k>0||mo>0)saveWorld()}}catch(e){console.error(e)}
  return r}}

/* ---------- small helpers ---------- */
const lu100Carve=s=>String(s||'').toUpperCase().replace(/U/g,'V');
const lu100Plain=h=>String(h||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
function lu100Tpl(h){const t=document.createElement('template');t.innerHTML=h||'';return t}
/* a fighter's head for a 20 px disc: his portrait, cropped to the face */
function lu100Face(g){try{return gArt(g,'xs').replace('viewBox="0 0 100 140"','viewBox="22 12 56 56"')}catch(e){return ''}}
function lu100Mine(pm){return new Set(rosterOf(pm).map(g=>g.id))}
/* the live letters by advisor: {k:{key,title,unread}} (newest first) */
function lu100Lit(w){const out={};try{const R=new Set(w.mailRead||[]);const items=mailLive('').items.slice();const B=DK99.body;if(B&&B.wk===w.week&&B.s===w.season)for(const x of B.items)if(!items.some(y=>y.key===x.key))items.push(x);
  for(const it of items){if(!it.letter)continue;const a=advisor83(it.letter);if(!a||out[a.k])continue;const sk=dk99Skips(w);if(R.has(it.key)||sk.includes(it.key))continue;out[a.k]={key:it.key,title:String(it.title||'').replace(/^\p{Extended_Pictographic}️?\s*/u,'')}}}catch(e){console.error(e)}return out}
/* his latest advice: the newest letter he signed (live or kept) */
function lu100Advice(w,k){try{for(const L of (w.letters||[])){const a=advisor83(L);if(a&&a.k===k){const live=L.until>=w.week&&!L.read;return {key:'L:'+L.key,title:L.title,txt:lu100Plain(L.body).slice(0,170),live,wk:L.wk}}}}catch(e){}return null}

/* ---------- 1 · the banner ---------- */
const LU100_FAC=()=>({yard:_T('Yard'),barracks:_T('Barracks'),valet:_T('Beds'),kitchen:_T('Kitchen'),shrine:_T('Shrine'),stands:_T('Stands'),armory:_T('Armory'),stables:_T('Stables')});
const LU100_DAY=()=>({under:_T('Fri'),feature:_T('Sat'),main:_T('Sun'),spc100:_T('Sun ★')}); /* spc100 = 296-v100any headline specials */
const LU100_TIER=()=>({under:_T('Undercard'),feature:_T('Feature'),main:_T('Main'),spc100:_T('Special')});
function lu100Bouts(w,pm){const n=w.night;if(!n||n.bye||!n.bouts||!n.bouts.length)return [];const mine=lu100Mine(pm);
  return (typeof any100Seq==='function'?any100Seq(n):n.bouts.map((b,i)=>i)).map(i=>{const b=n.bouts[i];const id=(b.ents||[]).find(x=>mine.has(x));return {b,g:id?gById(id):null}})}
function lu100MatchCard(w,pm){const n=w.night;const L=n&&LOCATIONS[n.loc];
  if(!n||n.bye||!n.bouts||!n.bouts.length){let nx='';try{for(let d=1;d<=3;d++){const wk=w.week+d;if(isByeWk(wk))continue;const f=fixtureFor(w.season,wk);if(f){nx=_T`Next: week ${wkOf(wk)} · ${esc((EVENTS[f.ev]||{}).n||'')} in ${esc((LOCATIONS[f.loc]||{}).n||'')}`;break}}}catch(e){}
    return `<div class="lu100mw stone" role="note"><span class="sw">🌿</span><span class="tx"><b>${_T`No games this week`}</b><small>${nx}</small></span></div>`}
  const B=lu100Bouts(w,pm);const on=B.filter(x=>x.g).length;const D=LU100_DAY(),T=LU100_TIER();
  const chip=({b,g})=>{const band=g?fatBand90(gFat(g)):'';return `<i class="bc${b.done?' done':''}${g?'':' none'}" title="${esc((TIERS[b.tier]||{}).n||'')}${g?' · '+esc(g.name):''}"><em>${b.tier==='spc100'&&typeof any100DayShort==='function'?any100DayShort(b):D[b.tier]||''}<span class="tn"> · ${T[b.tier]||''}</span></em><span>${g?`<u>${lu100Face(g)}</u><span class="gn">${esc(g.name)}</span><s class="fd ${band}" title="${esc(FB90_TXT()[band][1])}"></s>`:`<span class="gn">${_T`— no fighter`}</span>`}${b.done?' <span class="ok">✓</span>':''}</span></i>`};
  return `<button type="button" class="lu100mw" data-mg="tab" data-id="night" title="${esc(_T('Open Match Week'))}"><span class="sw">⚔</span><span class="tx"><b>${_T`Match Week`}</b>
    <small>${esc(L?L.n:'')} · ${_T`${n.bouts.length} bouts`} · ${on===n.bouts.length?_T`your fighters on all ${on}`:_T`your fighters on ${on}`}<span class="lg"> · <s class="fd fresh"></s>${_T`fresh`} <s class="fd tired"></s>${_T`tired`} <s class="fd worn"></s>${_T`worn`}</span></small>
    <span class="days">${B.map(chip).join('')}</span></span></button>`}
function lu100Banner(w,pm,old,todo){const n=w.night;const L=n&&LOCATIONS[n.loc];const wk=wkOf(w.week);const bye=!!(n&&n.bye);const B=lu100Bouts(w,pm);const done=B.length&&B.every(x=>x.b.done);
  const art=bye||!L?scene100('school','banner','lu100art'):((typeof cityScene75==='function'&&cityScene75(L.n))||roomScene73('night'));
  const ph=bye?_T('Bye week · the sand rests'):done?_T`After the games · ${esc(L?L.n:'')}`:_T`Pre-match · the games in ${esc(L?L.n:'')}`;
  const ln=bye?_T('No games: rest the worn, heal the hurt, drill harder.'):done?_T('The games are fought. Settle the verdicts, then end the week.'):_T('Three bouts, Friday to Sunday. Get the house ready, then light the torches.');
  const chips=old?old.querySelector('.lst91'):null;
  return `<div class="roomhd b73 b73-ludus lu100ban"><div class="lu100bg">${art}</div><div class="lu100sh"></div>
    <div class="lu100med" aria-hidden="true"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="37" fill="#2a1a0e" stroke="#d6ab4c" stroke-width="2"/><circle cx="40" cy="40" r="31" fill="none" stroke="#8a6a2c" stroke-width="1"/>${[0,1,2,3,4,5,6].map(i=>{const a=(200+i*20)*Math.PI/180;const b=(340-i*20)*Math.PI/180;return `<ellipse cx="${(40+27*Math.cos(a)).toFixed(1)}" cy="${(40-27*Math.sin(a)).toFixed(1)}" rx="5" ry="2.2" fill="#d6ab4c" transform="rotate(${(-(200+i*20)+90).toFixed(0)} ${(40+27*Math.cos(a)).toFixed(1)} ${(40-27*Math.sin(a)).toFixed(1)})"/><ellipse cx="${(40+27*Math.cos(b)).toFixed(1)}" cy="${(40-27*Math.sin(b)).toFixed(1)}" rx="5" ry="2.2" fill="#d6ab4c" transform="rotate(${(-(340-i*20)+90).toFixed(0)} ${(40+27*Math.cos(b)).toFixed(1)} ${(40-27*Math.sin(b)).toFixed(1)})"/>`}).join('')}</svg><span class="k">${_T`Week`}</span><b>${RN(wk)}</b></div>
    <div class="roomttl lu100tt"><b>${bye?_T`Week ${wk} · Bye week`:_T`Week ${wk} · Match Week`}</b><span class="ph">${ph}</span><span class="ln">${ln}</span>
      <div class="lst91">${chips?chips.innerHTML:''}<span class="lu100n${todo?' on':''}"><b>${todo}</b> ${_T`this week`}</span></div></div>
    ${lu100MatchCard(w,pm)}</div>`}

/* ---------- 2 · the parchment ---------- */
const LU100_Q=()=>[_T('"A great lanista does not just train fighters — he builds a name."'),_T('"The crowd forgets the dead by Sunday. Give them a living name."'),_T('"Coin buys a fighter. Care keeps one."'),_T('"Every wound you tend is a bout you will not lose."')];
function lu100Coming(w,pm){const L=[];const wk=wkOf(w.week);
  try{const by=BYE_WKS.filter(x=>x>wk).sort((a,b)=>a-b)[0];if(by)L.push(_T`week ${by} is a bye`)}catch(e){}
  try{for(let d=1;d<=4;d++){const a=w.week+d;if(wkOf(a)<=wk)break;if(isByeWk(a))continue;const f=fixtureFor(w.season,a);if(f){const home=typeof travelHome==='function'&&travelHome(pm)===f.loc;L.push(home?_T`week ${wkOf(a)}: ${esc((EVENTS[f.ev]||{}).n||'')} at home in ${esc((LOCATIONS[f.loc]||{}).n||'')}`:_T`week ${wkOf(a)}: ${esc((EVENTS[f.ev]||{}).n||'')} in ${esc((LOCATIONS[f.loc]||{}).n||'')}`);break}}}catch(e){}
  try{const ends=rosterOf(pm).filter(g=>g.contract&&g.contract.weeks>1&&g.contract.weeks<=3).sort((a,b)=>a.contract.weeks-b.contract.weeks).slice(0,2);
    for(const g of ends)L.push(_T`${esc(g.name)}'s contract ends in ${g.contract.weeks} weeks`)}catch(e){}
  return L.length?`<div class="lu100up">📅 <b>${_T`Coming up:`}</b> ${L.join(' · ')}</div>`:''}
function lu100Desk(R,w,pm){const D=R.querySelector('#desk99');if(!D)return;D.classList.add('lu100tasks');if(LU100.mail)D.classList.add('lu100open');
  const tw=D.querySelector('.dk99tw');const open=tw?tw.querySelectorAll(':scope>.dk99row').length:0;const fold=D.querySelector('.dk99done summary');
  const doneN=fold?D.querySelectorAll('.dk99done .dl>span').length:0;const all=open+doneN;
  /* the header */
  const hd=D.querySelector('.dk99hd');const acta=hd&&hd.querySelector('.acta99');const sub=hd&&hd.querySelector('.rc-sub');
  const unread=D.querySelectorAll('.dk99lt>details.mail.unread').length+D.querySelectorAll('.dk99lt>details.rev91').length;
  if(hd){hd.innerHTML=`<svg class="lu100wr" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="#5c4326" stroke-width="1.5"/><path d="M12 30q-6-8-3-18M28 30q6-8 3-18" stroke="#5c4326" stroke-width="2" fill="none"/><text x="20" y="25" text-anchor="middle" font-size="13" fill="#5c4326">✦</text></svg>
    <h2>${_T`Weekly tasks`}</h2><span class="sp"></span><button type="button" class="lu100mb" data-lu100mail="1" aria-expanded="${LU100.mail}" title="${esc(_T('All letters'))}">📬 <span>${_T`Letters`}</span>${unread?` <b>${unread}</b>`:''}</button>
    <span class="lu100bar" title="${esc(_T`${all-open} of ${all} done`)}"><i style="width:${all?Math.round((all-open)/all*100):100}%"></i></span><span class="lu100n2">${all-open}/${all}</span>`}
  const sec=D.querySelectorAll(':scope>.dk99sec');if(sec[0])sec[0].remove();
  /* the scroll area: rows + the done fold */
  const sc=document.createElement('div');sc.className='lu100tl';const foot=D.querySelector(':scope>.dk99foot');if(tw){tw.before(sc);sc.appendChild(tw)}if(foot)sc.appendChild(foot);
  if(!open)sc.insertAdjacentHTML('afterbegin',`<div class="lu100clear">✓ ${_T`Nothing waits for you. End the week when you are ready.`}</div>`);
  sc.insertAdjacentHTML('afterend',`<button type="button" class="lu100more" data-lu100more="1" hidden>${_T`▾ more`}</button>`);
  /* the letters drawer */
  const dr=document.createElement('div');dr.className='lu100mail';dr.setAttribute('role','region');dr.setAttribute('aria-label',_T('Letters'));
  dr.innerHTML=`<div class="lu100mh"><b>📬 ${_T`Letters`}</b><span class="rc-sub">${unread?_T`${unread} unread`:_T('all read')}</span><span class="sp"></span><button type="button" class="lu100x" data-lu100mail="0" title="${esc(_T('Close'))}" aria-label="${esc(_T('Close'))}">✕</button></div>`;
  if(acta){dr.querySelector('.lu100mh .sp').after(acta)}
  const lt=D.querySelector(':scope>.dk99lt');if(sec[1])sec[1].remove();if(lt)dr.appendChild(lt);const past=D.querySelector(':scope>.dk99past');if(past)dr.appendChild(past);
  if(sub)sub.remove();
  const q=LU100_Q();const ft=document.createElement('div');ft.className='lu100ft';ft.innerHTML=`${lu100Coming(w,pm)}<div class="lu100qt">🌿 <span>${q[(w.week+w.season)%q.length]}</span><span class="by">${_T`— Flavius`}</span></div>`;
  sc.parentNode.insertBefore(ft,sc.nextSibling.nextSibling);D.appendChild(dr)}

/* ---------- 3 · the tiles ---------- */
function lu100Tile(o){return `<${o.tag||'button'} ${o.tag==='div'?'':'type="button" '}class="lu100t${o.cls?' '+o.cls:''}" ${o.attr||''}><span class="art">${o.art||''}<span class="st">${(o.chips||[]).filter(Boolean).join('')}</span>${o.extra||''}</span>
  <span class="cap"><i class="em">${o.ic}</i><span class="ct"><b>${o.t}${o.cnt?` <i class="cnt">${o.cnt}</i>`:''}</b><span>${o.sub}</span></span>${o.tag==='div'?'':'<i class="chev">›</i>'}</span></${o.tag||'button'}>`}
function lu100Tiles(w,pm,council){const ros=rosterOf(pm);const on=lu100Bouts(w,pm).filter(x=>x.g).length;const hurt=ros.filter(g=>g.inj&&!g.inj.war).length,worn=ros.filter(g=>gFat(g)>60).length;
  const ch=(t,c)=>`<span${c?` class="${c}"`:''}>${t}</span>`;
  const team=lu100Tile({cls:'k-team',attr:'data-mg="tab" data-id="roster"',art:scene100('team'),ic:'🛡',t:_T('Your Team'),sub:_T('The people: roster, ward, yard'),
    chips:[ch(ros.length===1?_T('1 fighter'):_T`${ros.length} fighters`),w.night&&!w.night.bye?ch(_T`${on} on the card`):'',hurt?ch(hurt===1?_T('1 hurt'):_T`${hurt} hurt`,'w'):'',worn?ch(worn===1?_T('1 worn'):_T`${worn} worn`,'w'):'']});
  let prog=0;try{prog=((pm.prog84||[]).filter(p=>!p.done&&(p.until==null||p.until>=w.week))).length}catch(e){}
  const promote=lu100Tile({cls:'k-promote',attr:'data-mg="run" data-id="promote"',art:scene100('promote'),ic:'📯',t:_T('Promote'),sub:_T('Feast, sponsors, criers, programmata'),
    chips:[ch(_T`Fame ${pm.fame||0} · ${mgrTier(pm.fame||0)}`),prog?ch(_T`${prog} programmata up`):'']});
  const KS=['yard','barracks','valet','kitchen','shrine','stands'].filter(k=>FAC[k]);const g=ludusGrade(pm);
  let nx=null;for(const k of Object.keys(FAC)){const l=facLvl(pm,k);if(l<3&&(!nx||l<nx.l))nx={k,l}}
  const busy=pm.facWk===w.week;
  const pips=`<span class="pips">${KS.map(k=>{const l=facLvl(pm,k);return `<span title="${esc(FAC[k].n)} ${l?['I','II','III'][l-1]:'—'}"><em>${esc(LU100_FAC()[k]||FAC[k].n)}</em>${[0,1,2].map(i=>`<i${i<l?' class="on"':''}></i>`).join('')}</span>`}).join('')}</span>`;
  const school=lu100Tile({cls:'k-school',attr:'data-mg="run" data-id="fac"',art:scene100('school'),extra:pips,ic:'🏛',t:_T('Upgrade School'),
    sub:busy?_T('The builders are busy this week'):nx?_T`The buildings · next: ${esc(_T(FAC[nx.k].n))} ${['I','II','III'][nx.l]} · ${coinAmt87(FAC_COST[nx.l])}`:_T('Every building is finished'),chips:[ch(_T`Grade ${g}`)]});
  let sh=0,fix=0;try{const S=(pm.arm94&&pm.arm94.sh)||[];sh=S.length;fix=S.filter(p=>p.dmg||p.st==='damaged').length}catch(e){}
  const armory=lu100Tile({cls:'k-armory',attr:'data-mg="tab" data-id="armory"',art:scene100('armory'),ic:'⚒',t:_T('Armory'),sub:_T('Better gear. Shelf, repairs, the stalls'),
    chips:[ch(_T`${sh} on the shelf`),fix?ch(fix===1?_T('1 to repair'):_T`${fix} to repair`,'w'):'']});
  return `<div class="lu100tiles">${team}${promote}${school}${armory}${council}</div>`}

/* ---------- 4 · the frieze + the popover ---------- */
function lu100Frieze(R,w,pm){const cc=R.querySelector('#council83');if(!cc)return '';const C=council83(w);const lit=lu100Lit(w);const nLit=Object.keys(lit).length;
  const row=cc.querySelector('.c83row');
  for(const p of [...cc.querySelectorAll('.c83p')]){const k=p.dataset.c83;const a=C.find(x=>x.k===k);if(!a)continue;const f=p.querySelector('.c83f');const nm=p.querySelector(':scope>b');const ro=p.querySelector('.c83r');
    const x=document.createElement('div');x.className='c83x';x.hidden=true;for(const c of [...p.children])if(c!==f&&c!==nm&&c!==ro)x.appendChild(c);
    const L=lit[k];p.classList.add('lu100h');if(L)p.classList.add('lit');if(LU100.pop===k)p.classList.add('on');
    p.setAttribute('role','button');p.tabIndex=0;p.dataset.lu100adv=k;p.setAttribute('aria-label',`${a.name}, ${a.role}${L?' — '+_T('has something for you'):''}`);
    if(nm)nm.textContent=lu100Carve(String(a.name).split(' ')[0]);if(ro)ro.textContent=_T('Recruiter')==='Recruiter'?lu100Carve(a.role):a.role;
    if(f)f.insertAdjacentHTML('afterbegin','<span class="glow" aria-hidden="true"></span>');
    if(L)p.insertAdjacentHTML('beforeend',`<em class="note">${esc(L.title)}</em>`);p.appendChild(x)}
  cc.classList.add('lu100fz');cc.classList.remove('card2');const hd=cc.querySelector('.c83hd');if(hd)hd.remove();
  const newest=Object.values(lit)[0];
  const sub=nLit?(nLit===1?_T('1 advisor has something for you: tap the lit face'):_T`${nLit} advisors have something for you: tap a lit face`):_T('Tap a face to hear him, see his level and train him');
  const i=Math.max(0,C.findIndex(a=>a.k===LU100.pop));
  return `<div class="lu100t k-adv wide${LU100.pop?' popon':''}" style="--hx:${((i+.5)/6*100).toFixed(1)}%"><span class="art frieze">${cc.outerHTML}</span>
    <span class="cap"><i class="em">🏛</i><span class="ct"><b>${_T`Advisors`}${nLit?` <i class="cnt">${_T`${nLit} lit`}</i>`:''}</b><span>${sub}</span></span></span>${LU100.pop?lu100PopHTML(w,pm,LU100.pop):''}</div>`}
function lu100PopHTML(w,pm,k){const a=council83(w).find(x=>x.k===k);if(!a)return '';const lv=adv98Lv(w,k);const lit=lu100Lit(w)[k];const adv=lu100Advice(w,k);
  let up='',prog=lv>=REC98.lvMax?100:0;
  if(w.tutorial)up=`<div class="up rc-sub">${_T`Advisors train in your own career.`}</div>`;
  else if(lv>=REC98.lvMax)up=`<div class="up"><span class="earn">${_T`Top level`}</span> ${_T`As good as they come.`}</div>`;
  else if(lv<REC98.coinMax){const c=REC98.up[lv];
    up=`<div class="up"><button type="button" class="btn lu100tr" data-c98up="${k}" ${(pm.coin||0)<c?dis88(_T('Not enough coin.')):''}>${_T`⬆ Train to level ${lv+1} · ${coinAmt87(c)}`}</button><span class="gain">${esc(adv100Fx(k,lv+1))}</span><span class="req">${_T`Levels 3–5 are earned by deeds.`}</span></div>`}
  else{const req=adv98Req(w,pm,k,lv+1);prog=req.length?Math.round(req.reduce((s,x)=>s+Math.min(1,x[2]?x[1]/x[2]:1),0)/req.length*100):0;
    up=`<div class="up"><span class="earn">${_T`⬆ Level ${lv+1} is earned`}</span>${req.map(x=>`<span class="rq${x[1]>=x[2]?' ok':''}">${esc(x[0])} ${Math.min(x[1],x[2])}/${x[2]}${x[1]>=x[2]?' ✓':''}</span>`).join(' · ')}<span class="req">${_T`Level ${lv+1} gives:`} <span class="gain">${esc(adv100Fx(k,lv+1))}</span></span></div>`}
  const say=lit?{title:lit.title,key:lit.key,txt:(adv&&adv.key===lit.key?adv.txt:''),live:true}:adv;
  return `<div class="lu100pop" id="lu100pop" role="dialog" aria-label="${esc(a.name)}"><div class="hd"><span class="pf">${face83(a,64)}</span><b>${esc(a.name)}</b><button type="button" class="x" data-lu100adv="" aria-label="${esc(_T('Close'))}">✕</button>
    <small>${esc(a.role)}</small><span class="lv"><span class="l">${_T`Lv ${lv}`}</span><span class="pb"><i style="width:${prog}%"></i></span></span></div>
    <div class="does">${esc(a.spec)}. <span class="fx">${_T`Now:`} ${esc(adv100Fx(k,lv))}</span></div>
    ${say?`<div class="say"><b>${esc(say.title)}</b>${say.txt?` — “${esc(say.txt)}${say.txt.length>=170?'…':''}”`:''}${say.live?`<small><button type="button" class="lnk" data-lu100read="${esc(say.key)}">${_T`📜 Read it`}</button></small>`:''}</div>`:`<div class="say quiet">${_T`No word from him this week.`}</div>`}
    ${up}</div><div class="lu100scrim" data-lu100adv=""></div>`}

/* ---------- the final mgrHTML wrapper ---------- */
{const base=mgrHTML;mgrHTML=function(){let h=base.apply(this,arguments);try{const w=W_();const on=lu100On()&&typeof desk99On==='function'&&desk99On();if(document.body)document.body.classList.toggle('lu100on',on&&!!w&&MGR.tab==='ludus'&&!MGR.view);
  if(!on||!w||w.dead||MGR.view||MGR.tab!=='ludus'||typeof h!=='string')return h;
  const pm=me();if(!pm)return h;const t=lu100Tpl(h);const R=t.content;const pane=R.querySelector('#mgrPane');if(!pane||!R.querySelector('#desk99'))return h;
  /* the banner */
  const old=R.querySelector('.roomhd.b73-ludus');const todo=typeof ludusTodo73==='function'?ludusTodo73():0;
  const nb=lu100Tpl(lu100Banner(w,pm,old,todo)).content.firstElementChild;if(old)old.replaceWith(nb);else pane.before(nb);
  /* the run panel (only after a run tile was opened) */
  const rp=pane.querySelector(':scope>.runpanel');const dash=pane.querySelector(':scope>.rundash');const dh=dash&&dash.previousElementSibling&&dash.previousElementSibling.matches('h4.secth')?dash.previousElementSibling:null;
  const panel=LU100.panel&&LU100.panel===MGR.run&&rp?rp:null;
  /* the parchment */
  lu100Desk(R,w,pm);const desk=R.querySelector('#desk99');
  const council=lu100Frieze(R,w,pm);const cc=pane.querySelector(':scope>#council83');if(cc)cc.remove();
  const grid=document.createElement('div');grid.className='lu100';grid.innerHTML=`<div class="lu100L"></div>${lu100Tiles(w,pm,council)}`;grid.querySelector('.lu100L').appendChild(desk);
  const links=document.createElement('div');links.className='lu100lk';
  links.innerHTML=[w.tutorial?`<button type="button" class="btn tksm" data-mg="run" data-id="school">🎓 ${_T`Schooling`}</button>`:'',`<button type="button" class="btn tksm" data-mg="run" data-id="consil">🏛 ${_T`The Consilium's counsel`}</button>`,`<button type="button" class="btn tksm" data-mg="run" data-id="ledger">📜 ${_T`Ledger`} <small>${(w.tlog||[]).length}</small></button>`].join('');
  if(dh)dh.remove();if(dash)dash.remove();if(rp)rp.remove();
  const rest=[...pane.childNodes];pane.innerHTML='';pane.appendChild(grid);pane.appendChild(links);
  if(panel){const box=document.createElement('div');box.className='lu100panel';box.innerHTML=`<button type="button" class="lu100x" data-lu100panel="" title="${esc(_T('Close'))}" aria-label="${esc(_T('Close'))}">✕</button>`;box.appendChild(panel);pane.appendChild(box)}
  for(const n of rest)pane.appendChild(n); /* anything else the page held stays, after the grid */
  for(const d of R.querySelectorAll('#desk99 .lu100mail details[open]'))d.dataset.lu100o='1';
  /* a letter to open (the popover's 📜 Read it) */
  if(LU100.openKey){const d=R.querySelector(`#desk99 details.mail[data-mail="${CSS.escape(LU100.openKey)}"]`);if(d){d.open=true;d.classList.add('lu100hl')}}
  LU100.at=Date.now();setTimeout(lu100After,0);return t.innerHTML}catch(e){console.error(e)}return h}}

/* ---------- after each paint: the scroll hint, the popover's place, the letter to show ---------- */
function lu100After(){const D=document.querySelector('#desk99.lu100tasks');if(!D)return;const sc=D.querySelector('.lu100tl');const mb=D.querySelector('.lu100more');
  if(sc&&mb){const upd=()=>{const left=sc.scrollHeight-sc.clientHeight-sc.scrollTop;const rows=[...sc.querySelectorAll('.dk99tw>.dk99row')];const hid=rows.filter(r=>r.offsetTop>=sc.scrollTop+sc.clientHeight-8&&r.getClientRects().length).length;
      mb.hidden=!(left>12&&hid>0);mb.textContent=hid===1?_T('▾ 1 more'):_T`▾ ${hid} more`;sc.classList.toggle('fade',left>12)};
    if(!sc._lu100){sc._lu100=1;sc.addEventListener('scroll',upd,{passive:true})}upd()}
  if(LU100.openKey){const k=LU100.openKey;LU100.openKey=null;const d=D.querySelector(`details.mail[data-mail="${CSS.escape(k)}"]`)||D.querySelector(`.dk99row[data-dk99="${CSS.escape(k)}"]`);if(d)setTimeout(()=>{try{d.scrollIntoView({block:'nearest',behavior:reduceMotionOn()?'auto':'smooth'})}catch(e){}},60)}}
/* ---------- clicks ---------- */
function lu100Redraw(){if(typeof MGR_REDRAW==='function')MGR_REDRAW()}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-lu100mail],[data-lu100adv],[data-lu100read],[data-lu100panel],[data-lu100more]');
  if(!t){if(LU100.pop&&!(e.target.closest&&e.target.closest('#lu100pop'))&&document.getElementById('lu100pop')){LU100.pop=null;const p=document.getElementById('lu100pop');const s=document.querySelector('.lu100scrim');if(p)p.remove();if(s)s.remove();for(const x of document.querySelectorAll('.c83p.on'))x.classList.remove('on')}
    /* a run tile: its panel opens under the tiles (23-ludus's own handler sets MGR.run) */
    const r=e.target.closest&&e.target.closest('#mgrPane [data-mg="run"]');if(r)LU100.panel=r.dataset.id;return}
  if(!t.closest('#mgrBody'))return;e.preventDefault();e.stopPropagation();
  if(t.dataset.lu100more){const sc=t.parentNode.querySelector('.lu100tl');if(sc)sc.scrollBy({top:sc.clientHeight*.8,behavior:reduceMotionOn()?'auto':'smooth'});return}
  if(t.dataset.lu100mail!=null){LU100.mail=t.dataset.lu100mail==='1'?!LU100.mail:false;const D=document.getElementById('desk99');if(D)D.classList.toggle('lu100open',LU100.mail);const b=D&&D.querySelector('.lu100mb');if(b)b.setAttribute('aria-expanded',String(LU100.mail));return}
  if(t.dataset.lu100panel!=null){LU100.panel=null;lu100Redraw();return}
  if(t.dataset.lu100read){const k=t.dataset.lu100read;LU100.pop=null;try{dk99Read(k)}catch(err){}
    const rows=typeof deskItems99==='function'?deskItems99():[];const row=rows.find(x=>x.sec==='week'&&!x.done&&(x.key===k||x.ltr===k));
    if(row){DK99.open.add(row.key||row.ltr);LU100.openKey=row.key||row.ltr}else{LU100.mail=true;LU100.openKey=k}lu100Redraw();return}
  const k=t.dataset.lu100adv;LU100.pop=k&&LU100.pop!==k?k:null;lu100Redraw();
  if(LU100.pop)setTimeout(()=>{const p=document.getElementById('lu100pop');if(p){const b=p.querySelector('.x');if(b)b.focus({preventScroll:true})}},30)},true);
document.addEventListener('keydown',e=>{if(!document.body.classList.contains('lu100on'))return;
  if(e.key==='Escape'&&LU100.pop){e.preventDefault();e.stopPropagation();const k=LU100.pop;LU100.pop=null;lu100Redraw();const h=document.querySelector(`.c83p[data-c83="${k}"]`);if(h)h.focus();return}
  if(e.key==='Escape'&&LU100.mail){e.preventDefault();e.stopPropagation();LU100.mail=false;const D=document.getElementById('desk99');if(D)D.classList.remove('lu100open');return}
  const h=e.target.closest&&e.target.closest('.c83p[data-lu100adv]');if(h&&(e.key==='Enter'||e.key===' ')){e.preventDefault();h.click()}},true);
/* a letter opened by any other path shows the drawer */
document.addEventListener('toggle',e=>{const d=e.target;if(!d||!d.open||d.dataset.lu100o||!d.closest||!d.closest('#desk99 .lu100mail'))return;if(!LU100.mail){LU100.mail=true;const D=document.getElementById('desk99');if(D)D.classList.add('lu100open')}},true);

/* ---------- styles (mock ludus.html rounds 2–6) ---------- */
(()=>{const st=document.createElement('style');st.textContent=`
/* banner */
.wd100ban .pic img.sc100{width:100%;height:100%;object-fit:cover;display:block}
#mgrBody .roomhd.lu100ban{position:relative;height:auto;min-height:118px;display:flex;align-items:center;gap:16px;padding:10px 16px;border:1px solid #dcae42;border-radius:8px;overflow:hidden;background:#1a120c}
#mgrBody .roomhd.lu100ban>.lu100bg{position:absolute;inset:0;z-index:0}
#mgrBody .roomhd.lu100ban>.lu100bg>svg,#mgrBody .roomhd.lu100ban>.lu100bg>img{position:absolute;inset:0;width:100%!important;height:100%!important;object-fit:cover;object-position:50% 70%}
#mgrBody .roomhd.lu100ban>.lu100sh{position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(20,12,6,.9) 0%,rgba(20,12,6,.62) 40%,rgba(20,12,6,.2) 62%,rgba(20,12,6,.6) 100%)}
#mgrBody .roomhd.lu100ban>*:not(.lu100bg):not(.lu100sh){position:relative;z-index:2}
.lu100med{flex:none;width:76px;height:76px;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center}
.lu100med svg{position:absolute;inset:0;width:100%;height:100%}
.lu100med .k,.lu100med b{position:relative;color:#f6dd95;line-height:1}.lu100med .k{font:700 9px var(--mono);letter-spacing:1.5px;text-transform:uppercase}.lu100med b{font:400 22px var(--display);margin-top:2px}
#mgrBody .roomhd.lu100ban .roomttl.lu100tt{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:1px;min-width:0;flex:1;max-width:none;background:none;padding:0;text-align:left}
#mgrBody .lu100tt>b{font:400 26px/1.05 var(--display);color:var(--gold2);letter-spacing:.04em}
#mgrBody .lu100tt>.ph{font:700 11px var(--mono);letter-spacing:2px;color:#f6dd95;text-transform:uppercase;margin:3px 0 2px;font-style:normal}
#mgrBody .lu100tt>.ln{font-size:13.5px;color:#e8dcc0;font-style:italic}
#mgrBody .lu100tt .lst91{margin-top:6px}
#mgrBody .lu100tt .lst91>span.lu100n.on{border-color:#e2b04e;color:#fff1cf}#mgrBody .lu100tt .lst91>span.lu100n b{color:#f0cf7d}
.lu100mw{flex:none;display:flex;align-items:center;gap:12px;padding:9px 16px 9px 12px;border-radius:8px;cursor:pointer;background:linear-gradient(#7a2318,#4a140d);border:2px solid #e2b04e;
 box-shadow:0 0 0 1px #2a0c06,0 4px 14px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,220,160,.35);color:#ffe9c9;text-align:left;font:inherit;max-width:min(600px,56%)}
button.lu100mw:hover{filter:brightness(1.12)}
.lu100mw .sw{font-size:28px;filter:drop-shadow(0 1px 1px #000);flex:none}
.lu100mw .tx{display:flex;flex-direction:column;min-width:0}
.lu100mw b{font:400 22px/1 var(--display);letter-spacing:.06em;color:#fff1cf}
.lu100mw small{font-size:12.5px;color:#f6d0b0;margin-top:3px}
.lu100mw .days{display:flex;gap:6px;margin-top:6px;flex-wrap:nowrap}
.lu100mw .bc{display:flex;flex-direction:column;gap:2px;padding:3px 8px 4px;border-radius:7px;background:rgba(0,0,0,.35);border:1px solid rgba(240,207,125,.45);font-style:normal;flex:1 1 0;min-width:0;max-width:180px}
.lu100mw .bc.done{opacity:.7}.lu100mw .bc.none{border-style:dashed}
.lu100mw .bc em{font:700 9.5px var(--mono);letter-spacing:.6px;font-style:normal;color:#f6dd95;text-transform:uppercase}
.lu100mw .bc>span{display:flex;align-items:center;gap:5px;font:700 13px var(--body,inherit);color:#fff1cf;white-space:nowrap;min-width:0}
.lu100mw .bc .gn{overflow:hidden;text-overflow:ellipsis;min-width:0}.lu100mw .bc.none .gn{font-weight:400;color:#e8c9a8}
.lu100mw .bc u{text-decoration:none;flex:none;width:20px;height:20px;border-radius:50%;overflow:hidden;border:1px solid #f0cf7d;display:block;background:#2a1a0e}
.lu100mw .bc u>*{position:static!important;width:20px!important;height:20px!important;display:block;margin:0!important;border-radius:50%;overflow:hidden}.lu100mw .bc u img,.lu100mw .bc u svg{position:static!important;inset:auto!important;width:20px!important;height:20px!important;object-fit:cover}
.lu100mw .bc .ok{color:#9fd77e}
s.fd{display:inline-block;width:9px;height:9px;border-radius:50%;text-decoration:none;flex:none;margin:0 2px 0 3px;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
s.fd.fresh{background:#7ccf4f}s.fd.tired{background:#e8c23a}s.fd.worn{background:#e0573f}.lu100mw .bc s.fd{margin-left:auto}
.lu100mw.stone{background:linear-gradient(#4a4036,#2c251f);border-color:#8a7a62;color:#d9ccb0;cursor:default}.lu100mw.stone b{color:#e8dcc0}.lu100mw.stone small{color:#bfb29a}
/* grid */
body.lu100on #mgrPane>.lu100{display:grid;grid-template-columns:minmax(0,46fr) minmax(0,54fr);gap:14px;margin-top:2px;position:relative}
.lu100L{position:relative;min-height:420px}
/* the parchment */
#desk99.lu100tasks{position:absolute;inset:0;margin:0;display:flex;flex-direction:column;background:#efe2c2;color:#3a2414;border:1px solid #b39d74;border-radius:8px;
 box-shadow:inset 0 0 0 3px rgba(122,93,42,.25),inset 0 0 40px rgba(110,70,20,.25);padding:12px 14px 10px}
#desk99.lu100tasks .dk99hd{display:flex;align-items:center;gap:10px;margin:0 0 6px;flex-wrap:nowrap}
#desk99.lu100tasks .dk99hd .lu100wr{width:34px;height:34px;flex:none}
#desk99.lu100tasks .dk99hd h2{margin:0;font:400 21px var(--display);letter-spacing:.06em;color:#2a1708;white-space:nowrap}
#desk99.lu100tasks .dk99hd .sp{flex:1}
.lu100mb{display:inline-flex;align-items:center;gap:5px;font:600 13px var(--body,inherit);color:#2a1708;background:#f6ecd4;border:1px solid #9c8058;border-radius:6px;padding:3px 9px;cursor:pointer;white-space:nowrap}
.lu100mb b{font:700 11px var(--mono);background:#a3281f;color:#fff;border-radius:9px;padding:0 6px}
#desk99.lu100open .lu100mb{background:#2a1708;color:#f6dd95}
.lu100bar{width:110px;height:9px;border-radius:5px;background:#c9b58c;box-shadow:inset 0 1px 2px rgba(0,0,0,.35);overflow:hidden;flex:none}.lu100bar i{display:block;height:100%;background:linear-gradient(#4a3420,#2a1a0e)}
.lu100n2{font:700 14px var(--mono);color:#2a1708}
#desk99.lu100tasks .lu100tl{flex:1;min-height:0;overflow:auto;scrollbar-width:thin;padding-bottom:4px}
#desk99.lu100tasks .lu100tl.fade{-webkit-mask:linear-gradient(#000 85%,transparent);mask:linear-gradient(#000 85%,transparent)}
.lu100more{align-self:center;margin:-14px 0 2px;position:relative;z-index:2;font:700 12px var(--body,inherit);color:#2a1708;background:#f0e2be;border:1px solid #9c8058;border-radius:12px;padding:2px 12px;box-shadow:0 2px 4px rgba(60,40,20,.3);cursor:pointer}
.lu100more[hidden]{display:none}
#desk99.lu100tasks .dk99tw{gap:0}
#desk99.lu100tasks .dk99row{grid-template-columns:40px minmax(0,1fr) auto 22px;gap:9px;min-height:50px;background:none;border:0;border-top:1px solid rgba(122,93,42,.3);border-radius:0;padding:6px 4px;border-left:4px solid transparent}
#desk99.lu100tasks .dk99row:hover{background:rgba(255,255,255,.22)}
#desk99.lu100tasks .dk99row>.ic{width:38px;height:38px;border-radius:6px;background:linear-gradient(#efe6d0,#d8c8a4);border:1px solid #9c8058;display:grid;place-items:center;font-size:19px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.4)}
#desk99.lu100tasks .dk99row.k-fight>.ic{box-shadow:inset 0 0 0 2px rgba(255,255,255,.4),0 0 0 2px #c0433a55}
#desk99.lu100tasks .dk99row>.tx{color:#3a2414;font-size:14.5px}
#desk99.lu100tasks .dk99row>.tx b{color:#2a1708}#desk99.lu100tasks .dk99row .q{color:#6a4e30}
#desk99.lu100tasks .dk99row.open{background:rgba(255,248,230,.55);border-left-color:#a8802e}
#desk99.lu100tasks .dk99b .btn{border-color:#7a5d2a;background:linear-gradient(#3a2a17,#2a1f17);color:#f6dd95}
#desk99.lu100tasks .dk99row.k-fight .dk99b .btn{border-color:#8a3a2c;color:#ffd2c4;background:linear-gradient(#6a2017,#3a1210)}
#desk99.lu100tasks .dk99x{color:#6a4e30}#desk99.lu100tasks .dk99x:hover{border-color:#9c8058;color:#2a1708}
#desk99.lu100tasks .dk99l{filter:none}
#desk99.lu100tasks .dk99foot{color:#5c4326;border-top:1px solid rgba(122,93,42,.3);padding:5px 4px 0}
#desk99.lu100tasks .dk99done .dl span{color:#5c4a34}#desk99.lu100tasks .dk99done s{color:#7a6a54}
#desk99.lu100tasks .dk99mt{color:#5c4326}
.lu100clear{padding:14px 6px;color:#2f5a1e;font-weight:600}
.lu100ft{flex:none;border-top:1px dashed rgba(122,93,42,.45);margin-top:4px;padding-top:6px}
.lu100up{font-size:12.5px;color:#5c4326;line-height:1.35}.lu100up b{color:#2a1708}
.lu100qt{display:flex;align-items:center;gap:8px;font-style:italic;color:#5c4326;font-size:13px;margin-top:4px}.lu100qt .by{margin-left:auto;font-size:12px;white-space:nowrap}
/* the letters drawer: over the tiles column */
#desk99.lu100tasks .lu100mail{display:none;position:absolute;z-index:6;top:0;bottom:0;left:calc(100% + 14px);width:calc(100% * 54 / 46);background:linear-gradient(#2a1f17,#1c140e);
 border:1px solid #c9a458;border-radius:8px;box-shadow:-8px 0 30px rgba(0,0,0,.55);padding:10px 12px;overflow:auto;color:var(--bone,#eadfc8);scrollbar-width:thin}
#desk99.lu100tasks.lu100open .lu100mail{display:block}
.lu100mh{display:flex;align-items:center;gap:8px;margin-bottom:8px;position:sticky;top:-10px;background:#2a1f17;padding:4px 0;z-index:1}.lu100mh>b{font:400 19px var(--display);color:var(--gold2)}.lu100mh .sp{flex:1}
.lu100x{width:26px;height:26px;border-radius:50%;border:1px solid var(--line2,#5a4636);background:none;color:var(--bone,#eadfc8);cursor:pointer;flex:none;padding:0;line-height:24px}
.lu100mail .dk99lt{display:grid;gap:4px}.lu100mail details.mail.lu100hl{box-shadow:0 0 0 2px #e2b04e}
/* tiles */
.lu100tiles{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:minmax(150px,auto);gap:12px}
.lu100t{position:relative;border:1px solid #8a6a2c;border-radius:8px;overflow:hidden;background:#1a120c;cursor:pointer;display:flex;flex-direction:column;padding:0;font:inherit;color:inherit;text-align:left;min-width:0}
button.lu100t:hover{border-color:var(--gold2)}button.lu100t:hover .art .sc100{transform:scale(1.04)}
.lu100t .art{position:relative;flex:1;min-height:104px;overflow:hidden;border-bottom:1px solid #6a5130;display:block}
.lu100t .art .sc100{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s}
.lu100t:not(.k-adv) .art:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(20,12,6,.55))}
.lu100t .art .st{position:absolute;left:8px;top:8px;z-index:2;display:flex;gap:4px;flex-wrap:wrap}
.lu100t .art .st span{font:600 11.5px var(--body,inherit);color:#f3e3b8;background:rgba(20,12,6,.72);border:1px solid rgba(201,162,78,.45);border-radius:9px;padding:0 7px;white-space:nowrap}
.lu100t .art .st span.w{border-color:#c0433a;color:#ffc9bb}
.lu100t .pips{position:absolute;left:8px;right:8px;bottom:6px;z-index:2;display:grid;grid-template-columns:repeat(3,1fr);gap:2px 10px;background:rgba(20,12,6,.68);border-radius:6px;padding:3px 8px}
.lu100t .pips span{display:flex;align-items:center;gap:3px;font-size:10.5px;color:#e8dcc0;white-space:nowrap;min-width:0}.lu100t .pips em{font-style:normal;flex:1;overflow:hidden;text-overflow:ellipsis}
.lu100t .pips i{width:7px;height:7px;border-radius:50%;border:1px solid #d6ab4c;flex:none}.lu100t .pips i.on{background:#f0cf7d}
.lu100t .cap{display:flex;align-items:center;gap:10px;padding:8px 10px;background:linear-gradient(#24190f,#170f0a)}
.lu100t .em{font-style:normal;flex:none;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-size:18px;border:1.5px solid #c9a458;background:radial-gradient(#3a2a17,#1a120c);box-shadow:inset 0 0 0 2px #1a120c}
.lu100t .ct{display:flex;flex-direction:column;min-width:0}
.lu100t .cap b{display:block;font:400 17px/1.05 var(--display);letter-spacing:.06em;color:var(--gold2)}
.lu100t .cap .ct>span{display:block;font-size:12.5px;color:var(--muted,#b3a58a);line-height:1.25}
.lu100t .chev{font-style:normal;margin-left:auto;flex:none;width:24px;height:24px;border:1px solid #8a6a2c;border-radius:4px;display:grid;place-items:center;color:var(--gold2);font-size:15px}
.lu100t .cnt{font-style:normal;font:700 10px var(--mono);border-radius:9px;padding:1px 7px;background:#f0cf7d;color:#2a1708;margin-left:6px;vertical-align:2px}
.lu100t.wide{grid-column:1 / -1;cursor:default;overflow:visible}
/* the bronze frieze */
.lu100t.k-adv .art.frieze{min-height:132px;overflow:hidden;border-radius:8px 8px 0 0;background:#1c1712;box-shadow:inset 0 0 0 3px #000,inset 0 0 0 4px #8a6a3a,inset 0 0 40px rgba(0,0,0,.6)}
.lu100t.k-adv .art.frieze:before{content:"";position:absolute;inset:7px;background:radial-gradient(ellipse at 15% 0%,rgba(255,220,170,.12),transparent 60%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.05' numOctaves='3' seed='3'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .3 0 0 0 0 .25 0 0 0 .5 -.1'/%3E%3C/filter%3E%3Crect width='300' height='160' filter='url(%23n)'/%3E%3C/svg%3E");background-size:auto,100% 100%}
#council83.lu100fz{position:absolute;inset:12px 10px 8px;margin:0;padding:0;border:0;background:none;z-index:1}
#council83.lu100fz .c83row{display:flex;justify-content:space-around;align-items:center;height:100%;gap:2px}
#council83.lu100fz .c83p{all:unset;position:relative;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px;padding:2px 4px;border-radius:8px;min-width:0;max-width:16%}
#council83.lu100fz .c83p:focus-visible{outline:2px solid #d6ab4c}
#council83.lu100fz .c83f{position:relative;width:74px;height:74px;margin:0;border-radius:50%;padding:4px;box-sizing:border-box;border:0;background:radial-gradient(circle at 32% 28%,#ffe0a0,#b07a34 50%,#4a2c10);
 box-shadow:2px 4px 7px rgba(0,0,0,.55),inset -2px -2px 3px rgba(80,60,30,.35),inset 2px 2px 3px rgba(255,255,255,.5);display:block;overflow:visible}
#council83.lu100fz .c83f>:not(.glow){width:100%!important;height:100%!important;border-radius:50%;overflow:hidden;display:block;filter:grayscale(1) sepia(1) saturate(2.1) hue-rotate(-14deg) brightness(.78) contrast(1.25)}
#council83.lu100fz .c83f:after{content:"";position:absolute;inset:4px;border-radius:50%;box-shadow:inset 3px 3px 6px rgba(40,25,10,.6),inset -2px -2px 3px rgba(255,220,160,.35);pointer-events:none}
#council83.lu100fz .c83f .glow{position:absolute;inset:-2px;border-radius:50%;opacity:0;pointer-events:none;box-shadow:0 0 0 2px #ffd36a,0 0 18px 6px rgba(255,190,90,.55),0 0 36px 10px rgba(255,160,60,.25)}
#council83.lu100fz .c83p.lit .c83f{background:radial-gradient(circle at 32% 28%,#fff1c4,#e2b04e 50%,#8a5a1a)}
#council83.lu100fz .c83p.lit .c83f>:not(.glow){filter:none}
#council83.lu100fz .c83p.lit .c83f .glow{opacity:1}
@media (prefers-reduced-motion:no-preference){body:not(.calm) #council83.lu100fz .c83p.lit .c83f .glow{animation:lu100lit 3.2s ease-in-out infinite}}
@keyframes lu100lit{50%{opacity:.45}}
#council83.lu100fz .c83p:hover .c83f,#council83.lu100fz .c83p.on .c83f{box-shadow:0 0 0 2px #d6ab4c,2px 4px 7px rgba(0,0,0,.55)}
#council83.lu100fz .c83p>b{font:400 13px/1 "Marcellus SC",Georgia,serif;letter-spacing:2px;color:#e8b860;text-shadow:0 1px 0 #000;margin-top:5px;white-space:nowrap}
#council83.lu100fz .c83p.lit>b{color:#ffe7a8}
#council83.lu100fz .c83r{font:400 9px/1 "Marcellus SC",Georgia,serif;letter-spacing:1.6px;color:#a88a5a;text-transform:none;white-space:nowrap}
#council83.lu100fz .note{font:italic 11px/1.1 var(--body,inherit);color:#ffd99a;text-shadow:0 1px 2px #000;margin-top:2px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
/* the popover */
.lu100pop{position:absolute;z-index:30;top:10px;left:clamp(0px,calc(var(--hx) - 200px),calc(100% - 400px));width:400px;max-width:100%;transform:translateY(-100%);
 background:linear-gradient(#2a1f17,#1c140e);border:1px solid #c9a458;border-radius:10px;box-shadow:0 14px 40px rgba(0,0,0,.7);padding:12px 14px;color:var(--bone,#eadfc8);cursor:auto}
.lu100pop .hd{display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:2px 12px;align-items:center}
.lu100pop .pf{grid-row:1/4;width:64px;height:64px;border-radius:50%;border:2px solid #b08a3c;overflow:hidden;display:block;background:radial-gradient(circle at 50% 35%,#5a4636,#2a2119)}.lu100pop .pf>*{width:100%!important;height:100%!important;display:block}
.lu100pop .hd b{font:400 19px var(--display);color:var(--gold2)}
.lu100pop .hd small{grid-column:2/-1;font:700 10.5px var(--mono);letter-spacing:1.2px;color:var(--dim,#a3907a);text-transform:uppercase}
.lu100pop .x{width:26px;height:26px;border-radius:50%;border:1px solid var(--line2,#5a4636);background:none;display:grid;place-items:center;color:var(--bone,#eadfc8);cursor:pointer;align-self:start;padding:0}
.lu100pop .lv{grid-column:2/-1;display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted,#b3a58a)}
.lu100pop .lv .l{font:700 11px var(--mono);background:#3a2a18;border:1px solid #7a5d2a;color:var(--gold2);border-radius:9px;padding:0 7px}
.lu100pop .lv .pb{flex:1;height:6px;border-radius:3px;background:#140f0b;overflow:hidden}.lu100pop .lv .pb i{display:block;height:100%;background:#d6ab4c}
.lu100pop .does{margin:8px 0 6px;font-size:13.5px}.lu100pop .does .fx{color:#9fd77e}
.lu100pop .say{background:#efe2c2;color:#3a2414;border-radius:6px;border-left:3px solid #c9a458;padding:6px 9px;font-size:13.5px;font-style:italic}
.lu100pop .say b{font-style:normal;color:#2a1708}.lu100pop .say.quiet{background:none;color:var(--muted,#b3a58a);border-left-color:#5a4636}
.lu100pop .say small{display:block;font-style:normal;margin-top:3px}.lu100pop .lnk{background:none;border:0;padding:0;color:#7a2a1e;text-decoration:underline;cursor:pointer;font:600 12px var(--body,inherit)}
.lu100pop .up{margin-top:9px;border-top:1px solid var(--line2,#5a4636);padding-top:8px;font-size:13px;display:flex;flex-wrap:wrap;gap:4px 6px;align-items:center}
.lu100pop .lu100tr{color:#fff1cf;background:linear-gradient(#3a6a2a,#22401a);border:1px solid #8ac46a;border-radius:6px;padding:4px 11px}
.lu100pop .earn{font:700 10.5px var(--mono);letter-spacing:.6px;text-transform:uppercase;background:#3a2a18;border:1px solid #7a5d2a;color:var(--gold2);border-radius:9px;padding:1px 8px}
.lu100pop .rq{color:var(--muted,#b3a58a)}.lu100pop .rq.ok{color:#9fd77e}
.lu100pop .req{display:block;width:100%;color:var(--muted,#b3a58a);font-size:12.5px}.lu100pop .gain{color:#9fd77e}
.lu100scrim{display:none}
/* links + run panel */
.lu100lk{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;margin:8px 0 0}
.lu100lk .btn small{opacity:.7;display:inline;margin-left:3px}
.lu100panel{position:relative;margin-top:8px}.lu100panel>.lu100x{position:absolute;right:-6px;top:-10px;z-index:2;background:#1c140e}
.lu100panel>.runpanel>.card2:first-child{margin-top:0!important}
@media (prefers-reduced-motion:reduce){.lu100t .art .sc100{transition:none}}
body.calm .lu100t .art .sc100{transition:none}
/* narrower: one column, the parchment in the flow */
@media (max-width:900px){
 body.lu100on #mgrPane>.lu100{grid-template-columns:1fr}
 .lu100L{min-height:0}
 #desk99.lu100tasks{position:relative;inset:auto;max-height:none}
 #desk99.lu100tasks .lu100tl{overflow:visible;-webkit-mask:none;mask:none}#desk99.lu100tasks .lu100tl.fade{-webkit-mask:none;mask:none}.lu100more{display:none!important}
 #desk99.lu100tasks .lu100mail{position:fixed;left:0;right:0;bottom:0;top:12%;width:auto;border-radius:14px 14px 0 0;z-index:80}
 #mgrBody .roomhd.lu100ban{flex-wrap:wrap}.lu100mw{max-width:none;width:100%}}
@media (max-width:600px){
 #mgrBody .roomhd.lu100ban{padding:8px 10px;gap:8px}
 .lu100med{width:54px;height:54px}.lu100med b{font-size:17px}
 #mgrBody .lu100tt>b{font-size:20px}#mgrBody .lu100tt>.ln{display:none}
 .lu100mw .lg,.lu100mw .bc .tn,.lu100mw .bc .gn{display:none}.lu100mw .days{flex-wrap:nowrap}.lu100mw .bc{min-width:0;flex:1;padding:3px 5px}
 #desk99.lu100tasks{padding:10px 8px}#desk99.lu100tasks .dk99hd h2{font-size:18px}.lu100bar{width:56px}.lu100mb span{display:none}
 #desk99.lu100tasks .dk99row{grid-template-columns:34px minmax(0,1fr) 32px}#desk99.lu100tasks .dk99row>.ic{width:32px;height:32px;font-size:16px}
 .lu100tiles{grid-auto-rows:minmax(130px,auto);gap:8px}
 .lu100t .art{min-height:72px}.lu100t .cap{padding:6px 7px;gap:7px}.lu100t .em{width:30px;height:30px;font-size:14px}.lu100t .cap b{font-size:14px}.lu100t .cap .ct>span{font-size:11.5px}.lu100t .chev{display:none}
 .lu100t .art .st span{font-size:10.5px}.lu100t .pips{grid-template-columns:repeat(2,1fr);gap:1px 6px;padding:2px 5px}.lu100t .pips span{font-size:9.5px}
 .lu100t.k-adv .art.frieze{min-height:96px}
 #council83.lu100fz{inset:8px 4px 6px}#council83.lu100fz .c83f{width:46px;height:46px;padding:3px}#council83.lu100fz .c83p>b{font-size:9.5px;letter-spacing:1px}#council83.lu100fz .c83r,#council83.lu100fz .note{display:none}
 .lu100pop{position:fixed;left:0!important;right:0;bottom:0;top:auto;transform:none;width:auto;max-width:none;border-radius:14px 14px 0 0;padding:14px 14px 22px;z-index:91;max-height:80vh;overflow:auto}
 .lu100scrim{display:block;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:90}}
`;document.head.appendChild(st)})();

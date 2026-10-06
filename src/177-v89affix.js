/* =====================================================================
   177-V89AFFIX · v0.89 part J (Virgilante 2026-10-05): ONLINE ARMOR BONUSES (permanent only) + the Ranked stone rule + the odds card.
   Rules + rolls live in 111-onlcore ("v0.89 J" block): eight new armor affixes, the weighted draw, the named-armor tiers
   Common 60 / Rare 28 / Epic 10 / Legendary 2, integ / fid in gearAfter; the curve in tools/plans/onl89-affix.md (tools/affixsim.js).
   ENGINE (all deterministic: only the game state and the seeded dice — lockstep-safe), a hurt() wrapper over 139's:
   • RANKED STONE RULE — online Ranked only: a stone from the stands (source.spect) never lands the killing blow: a hit that would
     drop a lethal location (head, chest, the last arm) to 0 HP stops at 1 HP ("the crowd wounds, Flavius kills"). Custom/offline unchanged.
   • lapid: a stone on the location the piece covers deals 0 · venat: −1 from beasts there · miss: −1 from a thrown or shot weapon
     there (thrown, a weapon with ammo, or from 2+ tiles) · firm: a floor spike on that leg deals 0 · spin: a melee hit there that
     lands costs the attacker 1 HP on his striking arm (direct).
   • fort: a finalCF → fateFor wrapper: the wearer's Thumb of Flavius d6 gets +1 (online only; the same die the game rolls).
   • ARM['na_…'] gets the new flags (ONL84.regArmor wrapper; ONLC.cleanNamedA keeps them).
   SCREENS • named armor cards (na84Card → Armory, auction, loot, Storeroom) list each affix by its Latin name + what it does; the Domus
     equipment bar's hover card adds them for named armor. ⓘ ODDS beside the Arena Chest token (landing stage + Domus): hover shows,
     a click pins a card with every chance a gift opening rolls — all computed from the ONLC tables (giftOdds89 / affixOdds89).
   ===================================================================== */
const J89={atk:null,fp:null};
const AFF89T={ap:_T('+1 AP'),ward:_T('the first hit each rotation loses 1 damage'),swift:_T('+1 movement while unhurt'),venat:_T('−1 damage from beasts here'),
  miss:_T('−1 damage from thrown and shot weapons here'),firm:_T('floor spikes deal 0 to this leg'),spin:_T('a melee hit here costs the attacker 1 HP'),
  lapid:_T('stones from the stands deal 0 here'),integ:_T('never comes back Broken'),fid:_T('cannot be looted: if the wearer falls it goes home'),
  fort:_T('+1 on the wearer’s Thumb of Flavius roll'),bonus:_T('+1 AP to another location')};
const AFFW89T={dmg:_T('+1 damage'),rng:_T('+1 range'),use:_T('+1 use'),pierce:_T('armor-piercing 1'),crowd:_T('+1 CF a hit')};
/* one armor affix as a card line: "Lapidarius — stones …" (bonus names its location) */
function aff89Line(k,a){const lat=(ONLC.AFF_LAT89||{})[k]||k;let t=AFF89T[k]||((ONLC.AFFIX_A[k]||{}).n)||k;
  if(k==='bonus'&&a&&a.bonus)t=_T`+1 AP to the ${Object.keys(a.bonus).map(l=>(typeof LOCN84!=='undefined'&&LOCN84[l])||l).join(', ')}`;return `${lat} — ${t}`}
const aff89Div=a=>(a&&a.aff||[]).length?`<div class="nw83-aff">${a.aff.map(k=>`<span>✦ ${esc2(aff89Line(k,a))}</span>`).join('')}</div>`:'';

/* =========================== the engine =========================== */
{const base=ONL84.regArmor;ONL84.regArmor=function(defs){const r=base.apply(this,arguments);
  try{for(const d0 of defs||[]){const d=ONLC.cleanNamedA(d0);if(!d||!ARM[d.key])continue;for(const k of ONLC.NEW_AFF89)if(d[k])ARM[d.key][k]=1}}catch(e){console.error(e)}return r}}
/* who is attacking with what (thrown? which arm?) — read by the hurt wrapper below */
{const base=doAttack;doAttack=async function(player,source,target){const prev=J89.atk;J89.atk={p:player,thr:!!(source&&source.thr),arm:source&&source.arm,w:source&&source.w};
  try{return await base.apply(this,arguments)}finally{J89.atk=prev}}}
const j89Spike=prefix=>!!prefix&&(prefix===_T('Floor spike')||prefix===_T('Pushed onto a floor spike'));
const j89Lethal=(v,l)=>l==='head'||l==='chest'||((l==='rarm'||l==='larm')&&(v.hp[l==='rarm'?'larm':'rarm']|0)<=0);
/* where this location is covered by a named piece with the flag → that piece (its ARM entry) */
const j89On=(v,l,k)=>{const x=typeof na84On==='function'?na84On(v,(A,pc,ll)=>ll===l&&!!A[k]):null;return x&&x.A};
{const base=hurt;hurt=async function(victim,location,damage,source,prefix,opts){
  if(!S||!S.onl||!(victim&&victim.cls&&victim.pieces&&victim.alive)||!(damage>0))return base.apply(this,arguments);
  let d=damage;const notes=[];let thorn=null,att=null;source=source||{};
  try{const A=k=>j89On(victim,location,k);
    if(source.spect){const p=A('lapid');if(p){d=0;notes.push(_T`🪨 ${nm(victim)}'s ${esc2(p.n)} (Lapidarius) shrugs off the stone.`)}}
    if(d>0&&source.type==='npc'){const p=A('venat');if(p){d--;notes.push(_T`${nm(victim)}'s ${esc2(p.n)} (Venatorius) turns 1 damage of the beast aside.`)}}
    if(source.type==='player'&&source.p&&source.p!==victim){att=source.p;const k=J89.atk&&J89.atk.p===att?J89.atk:null;
      const far=Math.max(Math.abs((att.r|0)-(victim.r|0)),Math.abs((att.c|0)-(victim.c|0)))>1;const w=source.w||(k&&k.w)||{};
      const ranged=!!(k&&k.thr)||far||(w.ammo!=null&&!w.punch);
      if(ranged&&d>0){const p=A('miss');if(p){d--;notes.push(_T`${nm(victim)}'s ${esc2(p.n)} (Missilis) turns 1 damage of the missile aside.`)}}
      if(!ranged){const p=A('spin');if(p)thorn={p,arm:k&&k.arm==='L'?'larm':'rarm'}}}
    if(d>0&&j89Spike(prefix)){const p=A('firm');if(p){d=0;notes.push(_T`${nm(victim)}'s ${esc2(p.n)} (Firmus) takes the spike: no damage.`)}}
    /* THE RANKED STONE RULE: the crowd wounds, Flavius kills */
    if(d>0&&source.spect&&S.onl.ranked&&j89Lethal(victim,location)){const ap=opts&&opts.direct?0:(victim.ap[location]|0);const hp=victim.hp[location]|0;
      if(hp-(d-ap)<=0){d=Math.max(0,ap+hp-1);notes.push(_T`🪨 ${nm(victim)} reels at 1 HP — in Ranked the crowd wounds, Flavius kills.`)}}
  }catch(e){console.error(e)}
  for(const t of notes)log(t);
  if(d<=0){log(_T`${prefix||_T('A blow')} → ${nm(victim)} ${LOCN[location]}: no damage.`);return}
  const r=await base.call(this,victim,location,d,source,prefix,opts);
  try{if(thorn&&att&&att.alive&&!att.exited){const l=(att.hp[thorn.arm]|0)>0?thorn.arm:((att.hp.rarm|0)>0?'rarm':(att.hp.larm|0)>0?'larm':'chest');
    await base.call(this,att,l,1,{type:'env'},_T`${nm(victim)}'s ${esc2(thorn.p.n)} (Spinosus) bites back`,{noShield:1,direct:1})}}catch(e){console.error(e)}
  return r}}
/* FORTUNAE: +1 on the wearer's Thumb of Flavius d6 (online). finalCF names the player whose Fate is drawn next (10-meta gameOver rows). */
{const base=finalCF;finalCF=function(player){J89.fp=player||null;return base.apply(this,arguments)}}
{const base=fateFor;fateFor=function(cf){const p=J89.fp;J89.fp=null;
  try{if(S&&S.onl&&p&&p.cls&&p.pieces&&typeof na84On==='function'&&na84On(p,A=>!!A.fort)){const f=fateRow(cf);
    if(f.n==='Thumb of Flavius'){const r=d6();const v=r+1;
      if(v>=4)return Object.assign([_T('Thumb of Flavius · spared'),_T`Flavius rolls ${r}, +1 for Fortunae = ${v}: spared. Fate set to 20 CF and sent to the Ludus Flavius.`],{d6:Math.min(6,v),fort89:r});
      const d=1+rnd(12);const s=fateRow(d);return Object.assign([_T`Thumb of Flavius · ${s.n}`,_T`Flavius rolls ${r}, +1 for Fortunae = ${v}; the d12 shows ${d}: ${s.t}`],{d6:v,d12:d,sub:s,fort89:r})}}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}

/* =========================== the cards =========================== */
{const base=na84Card;na84Card=function(I){const h=base.apply(this,arguments);try{const a=(I&&I.w)||{};return h.replace(/<div class="nw83-aff">[\s\S]*?<\/div>/,aff89Div(a))}catch(e){return h}}}
/* the Domus equipment bar's hover card: named armor lists its affixes + its unique (175 fills #cmp89 first) */
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('#onl .dom89 [data-p89]');const f=document.getElementById('cmp89');if(!t||!f||f.hidden)return;
  try{const x=(typeof V89D!=='undefined'&&V89D.bar||[])[+t.dataset.p89];const I=x&&x.I;if(!I||!I.named||I.kind!=='a')return;const a=I.w||{};const b=f.querySelector('.cmp89-b');if(!b||b.querySelector('.aff89'))return;
    const U=a.uq?ONLC.UNIQUES_A.find(u=>u.k===a.uq):null;const html=aff89Div(a).replace('class="nw83-aff"',_T('class="nw83-aff aff89"'))+(U?`<p class="nw83-uq aff89"><b>${esc2(U.n)}</b> — ${esc2(U.d)}</p>`:'');
    if(html)b.insertAdjacentHTML('beforeend',html)}catch(err){console.error(err)}});

/* =========================== ⓘ THE ODDS CARD =========================== */
/* percentages of one table to one decimal that sum to exactly 100 (largest remainder) */
function pct89(ws){const t=ws.reduce((a,x)=>a+x,0)||1;const raw=ws.map(x=>x/t*1000);const fl=raw.map(Math.floor);let left=1000-fl.reduce((a,x)=>a+x,0);
  raw.map((x,i)=>[x-fl[i],i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{if(left>0){fl[i]++;left--}});return fl.map(x=>x/10)}
const p89=x=>(Math.round(x*1000)/10).toFixed(1)+'%';
const ODDS89_KIND={coin:_T('Coin'),cf:_T('Crowd Favor bonus'),off:_T('An offering token'),l1:_T('Level 1 gear'),l23:_T('Level 2–3 gear'),named:_T('A named piece')};
function odds89HTML(){const G=ONLC.giftOdds89();const cat=onlCatalog();const OA=ONLC.affixOdds89(cat,'a'),OW=ONLC.affixOdds89(cat,'w');
  const gk=pct89(G.kinds.map(x=>x[1]));
  const sub={coin:_T`${G.coin[0]}–${G.coin[1]}× your rank’s survival award`,cf:_T`+${G.cf[0]}–${G.cf[1]} starting CF in your next Ranked match`,
    off:_T`${p89(G.off.cheap[0])} a +2 token · ${p89(G.off.dear[0])} a +3/+4 token`,l23:_T`${p89(G.l23[2])} Level 2 · ${p89(G.l23[3])} Level 3`,
    named:_T`${p89(G.armorShare)} armor · ${p89(1-G.armorShare)} a weapon`};
  const kinds=G.kinds.map(([k],i)=>`<tr><td>${ODDS89_KIND[k]||esc2(k)}${sub[k]?`<small>${sub[k]}</small>`:''}</td><td class="o89n">${gk[i].toFixed(1)}%</td></tr>`).join('');
  const RN={common:_T('Common'),rare:_T('Rare'),epic:_T('Epic'),legendary:_T('Legendary')};
  const tierRow=(tab,lbl)=>{const v=pct89(tab.map(x=>x[1]));return `<tr><td>${lbl}</td>${tab.map((x,i)=>`<td class="o89n" style="color:${(ONL83.rarCol||{})[x[0]]||'inherit'}">${v[i].toFixed(1)}%</td>`).join('')}</tr>`};
  const tiers=`<table class="o89t"><tr><th></th>${OA.tiers.map(x=>`<th>${RN[x[0]]}</th>`).join('')}</tr>${tierRow(OA.tiers,_T('Armor'))}${tierRow(OW.tiers,_T('Weapon'))}</table>`;
  const affRows=(O,keys,lbl)=>keys.map(k=>`<tr><td>${lbl(k)}</td>${['rare','epic','legendary'].map(r=>`<td class="o89n">${O.aff[r][k]?p89(O.aff[r][k]):'—'}</td>`).join('')}</tr>`).join('');
  const aKeys=[...Object.keys(ONLC.AFF_W89),'fort'],wKeys=Object.keys(ONLC.AFFIX);
  const affA=`<table class="o89t o89a" data-o89="affa"><tr><th>${_T`Armor affix`}</th><th>${RN.rare}</th><th>${RN.epic}</th><th>${RN.legendary}</th></tr>${affRows(OA,aKeys,k=>`<b>${esc2(ONLC.AFF_LAT89[k]||k)}</b><small>${AFF89T[k]||k}</small>`)}</table>`;
  const affW=`<table class="o89t o89a" data-o89="affw"><tr><th>${_T`Weapon affix`}</th><th>${RN.rare}</th><th>${RN.epic}</th><th>${RN.legendary}</th></tr>${affRows(OW,wKeys,k=>`<small>${AFFW89T[k]||esc2((ONLC.AFFIX[k]||{}).n||k)}</small>`)}</table>`;
  const uq=(L,t)=>`<p class="o89u"><b>${t}</b> ${L.map(u=>`<span title="${esc2(u.d)}">${esc2(u.n)}</span>`).join(' · ')}</p>`;
  return `<div class="odds89" data-o89="card"><h3 class="pop83h">${_T`🎁 What a Donativum holds`}</h3>
    <p class="rc-sub">${_T`Flavius sends one every new rank and every 5 Ranked bouts survived, one for the weekly challenge — always brand new. Each opening rolls once:`}</p>
    <table class="o89t" data-o89="kinds">${kinds}</table>
    <h4>${_T`A named piece: its tier`}</h4>${tiers}
    <p class="rc-sub">${_T`Common has no affix · Rare 1 · Epic 2 · Legendary 2 + a unique effect. The chance a piece of that tier carries each affix:`}</p>${affA}${affW}
    <p class="rc-sub">${_T`Fortunae comes only on Legendary armor. Lapidarius is twice as likely on a helm.`}</p>
    <h4>${_T`Legendary uniques`}</h4>${uq(ONLC.UNIQUES_A,_T('Armor:'))}${uq(ONLC.UNIQUES,_T('Weapons:'))}
    <p class="rc-sub">${_T`Each unique exists once in the world. Once all are claimed, a Legendary roll becomes Epic.`}</p>
    <p class="rc-sub">${_T`🔨 Auction lots are pieces back in Flavius’s chest from fallen gladiators: no new roll — they keep their own tier, affixes and owners.`}</p></div>`}
function odds89Show(el){let f=document.getElementById('odds89f');if(!f){f=document.createElement('div');f.id='odds89f';f.className='odds89f';document.body.appendChild(f)}
  f.innerHTML=odds89HTML();f.hidden=false;const r=el.getBoundingClientRect();const w=Math.min(440,window.innerWidth-16);f.style.width=w+'px';
  f.style.left=Math.max(8,Math.min(window.innerWidth-w-8,r.left+r.width/2-w/2))+'px';f.style.top=Math.min(window.innerHeight-80,r.bottom+6)+'px';
  const b=f.getBoundingClientRect();if(b.bottom>window.innerHeight-6)f.style.top=Math.max(6,window.innerHeight-6-b.height)+'px'}
const odds89Hide=()=>{const f=document.getElementById('odds89f');if(f)f.hidden=true};
{const base=onl83Chest;onl83Chest=function(sz,where){const h=base.apply(this,arguments);if(!h)return h;
  return `<span class="odds89w ${where||''}">${h}<button type="button" class="odds89i" data-odds89="1" aria-label="${_T`The odds of a Donativum`}" title="${_T`Odds`}">ⓘ</button></span>`}}
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('[data-odds89]');
  if(t&&window.matchMedia&&window.matchMedia('(hover:hover)').matches){try{odds89Show(t)}catch(err){console.error(err)}}else if(!(e.target.closest&&e.target.closest('#odds89f')))odds89Hide()});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-odds89]');if(!t)return;e.preventDefault();e.stopPropagation();odds89Hide();
  try{const bg=onl83Pop('odds89pop',odds89HTML()+`<div class="o89x"><button type="button" class="btn" data-o89close="1">${_T`Close`}</button></div>`);
    bg.querySelector('[data-o89close]').onclick=()=>bg.remove()}catch(err){console.error(err)}},true);

{const st=document.createElement('style');st.id='affix89css';st.textContent=`
.odds89w{position:relative;display:inline-grid;flex:none}.odds89w.stage{position:absolute;top:12px;right:14px;z-index:4}.odds89w.stage>.gift83.stage{position:relative;top:auto;right:auto}
.odds89w.dom{margin-left:auto}.db89-side .odds89w.dom{margin-left:0}.odds89w>.gift83.dom{margin-left:0}
.odds89i{all:unset;cursor:pointer;position:absolute;left:-9px;top:-5px;width:18px;height:18px;border-radius:50%;background:#2a1f12;color:#e8c96a;border:1px solid #c9ad6a;font:700 12px/18px system-ui,sans-serif;text-align:center;z-index:2}
.odds89i:hover,.odds89i:focus-visible{background:#e8c96a;color:#2a1f12}
.odds89f{position:fixed;z-index:9000;max-height:72vh;overflow:auto;background:#1c160f;color:#eadbb8;border:1px solid #c9ad6a;border-radius:10px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.55);box-sizing:border-box}
.odds89 h4{margin:10px 0 4px;font:700 13px system-ui,sans-serif;color:#e8c96a}.odds89 .pop83h{margin:0 0 4px}
.o89t{width:100%;border-collapse:collapse;font:12.5px system-ui,sans-serif;margin:4px 0}.o89t td,.o89t th{padding:3px 4px;border-bottom:1px solid rgba(201,173,106,.18);text-align:left;vertical-align:top}
.o89t th{font-weight:700;color:#c9ad6a;font-size:11.5px}.o89t td small{display:block;opacity:.75;font-size:11px}.o89n{text-align:right!important;white-space:nowrap;font-variant-numeric:tabular-nums}
.o89a td:not(:first-child),.o89a th:not(:first-child){text-align:right}.o89u{font-size:12px;margin:3px 0}.o89u span{white-space:nowrap}.o89x{display:flex;justify-content:flex-end;margin-top:8px}
.odds89pop .pop83box{max-width:min(460px,calc(100vw - 16px));max-height:86vh;overflow:auto;box-sizing:border-box}
@media (max-width:600px){.odds89w.stage{top:8px;right:8px}.o89t{font-size:12px}}`;document.head.appendChild(st)}

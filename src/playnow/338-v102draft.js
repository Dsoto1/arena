/* =====================================================================
   338-V102DRAFT · v1.02 workstream G — a Draft switch for ANY event (his P2, pick 1a)
   =====================================================================
   • PLAY NOW OPTIONS: "Draft the gear" (#oDraft102 → CFG.opts.draft102). CFG.opts rides into startEvent's config, so the switch is in
     S.opts (match saves, the replay's opening snapshot, LAST_CFG / Play again, the hot-seat table config). Events that already draft
     (ev.draft: Ludus, Juggernaut, Naumachia, custom events with a draft) show it ON and locked with "Drafts its gear"; Chariot Racing
     (its own chariot draft) shows it off and locked.
   • THE LOADOUT: with the switch on (and the event not drafting already), the giveLoadout wrapper (outermost) hands the class kit with
     its armor and weapons blanked for that one call (as 112 does online): coin, keys, items, starting CF and every other wrapper's work
     (178 starting cards leave the deck, 310 twists…) stay; the class ability and weakness stay. Orpheus' rudis / Eagle's empty hands
     (the event's own items) stay as the event gives them.
   • THE DRAFT: 05-flow calls draft102Run() where draft events call runDraft(). It runs THE SAME runDraft (122 + 155/179 board look +
     257 custom pieces + CPU picks + fit rules + drafted gear leaving the market) with a draft spec of DR102.picks for everyone: for that
     one synchronous call EVENTS[S.evKey] is a copy carrying `draft` (runDraft reads the event on its first line), then the real entry is
     back. Seeded RNG only where runDraft already uses it → the same seed gives the same draft. HEADLESS sims draft too (CPU picks).
   • NOT ONLINE (S.onl), not in daily challenges (S.daily100), not Chariot Racing. Manager bouts never set the option.
   • EVENT DETAILS: Play Now's rounds table (pn100Rounds wrapper) and the briefing's rule cards (bf100Rules wrapper) say "Drafts its gear".
   • ABILITIES (his follow-up): Options select #oAbil102 → CFG.opts.abil102 = 'own' (default) · 'random' · 'draft', independent of the gear
     switch. A PAIR = one printed class's ability with the weakness that class has; an ability whose class has no weakness comes ALONE
     ("no weakness" — nothing invented or borrowed). Pool (pair102Pool, from CLASSES + CLASS_WEAK): Soldier Iron Fist · Royalty Patron's
     Purse · Hero Crowd Darling · Slave Fleet-footed (alone) · Veteranus Lanista + Old debts · Venatore Eagle Handler (Zora — works on any
     class) + Claustrophobic · Damnatio Stone Gatherer + Hated by the crowd. The Amazonia has no ability (her edge is gear) → not in the
     pool; the tamed-ally ability (custom classes' C.ally) is custom-only → not in the pool. The printed ability is RESTORED as printed (+1
     dmg in round 1 via a statDmgB wrapper, +1 coin / CF / move / Lanista via 05-flow's upkeep) on top of the seat's ratings.
     Random pair = one deck of the 7 pairs shuffled from the event seed (own mulberry32 — never the dice RNG, never Math.random), dealt to
     the seats in order. Draft a pair = AFTER the gear picks (so a slinger can take Stone Gatherer): each seat is offered 3 pairs dealt from
     the same seeded deck and picks one (ask kind 'pairPick102'; CPUs by ABILITIES points − WEAKNESSES points, +3/−3 for Stone Gatherer
     with/without a sling). The weakness is per player: p.wk102 (02-data weak() reads it first), p.abil / p.pair102 — all in S (saves,
     snapshots, replays). Off where the event switches abilities off (Chariot Racing, Orpheus, events that draft by the rulebook).
   • NEVER: online, daily challenges, Manager / exhibitions / pen, missios, the lessons, the first-hour match — a startEvent wrapper strips
     both options from those configs (they spread CFG.opts).
   Kill switch localStorage flavius_v102goff=1 (no options, no wrappers, draft102Run is a no-op).
   ===================================================================== */
const DR102={off:(()=>{try{return localStorage.getItem('flavius_v102goff')==='1'}catch(e){return false}})(),
  picks:5 /* TWEAK: picks per gladiator when the switch drafts an event (Ludus drafts 5) */};
/* dr102Native — the event drafts its gear by the rulebook already (or races chariots) */
function dr102Native(ev){return !!(ev&&ev.draft)}
function dr102NA(ev){return !!ev&&ev.kind==='chariot'}
/* dr102On — this live event drafts because of the switch */
function dr102On(st){const s=st||(typeof S!=='undefined'?S:null);if(DR102.off||!s||!s.opts||!s.opts.draft102)return false;
  if(s.onl||s.daily100)return false;const ev=EVENTS[s.evKey];return !!ev&&!dr102Native(ev)&&!dr102NA(ev)}
/* ---------- ability pairs ---------- */
/* dr102AbilNA — why the abilities option cannot apply to this event ('' = it can) */
function dr102AbilNA(ev){if(!ev)return '';if(ev.kind==='chariot'||ev.kind==='orpheus'||dr102Native(ev))return _T('No class abilities in this event');return ''}
/* dr102Pair — the abilities mode of this live event: 'random' | 'draft' | '' */
function dr102Pair(st){const s=st||(typeof S!=='undefined'?S:null);if(DR102.off||!s||!s.opts)return '';const m=s.opts.abil102;if(m!=='random'&&m!=='draft')return '';
  if(s.onl||s.daily100)return '';return dr102AbilNA(EVENTS[s.evKey])?'':m}
/* pair102Pool — the printed classes' abilities, each with its own class's weakness when it has one (none → the ability comes alone) */
function pair102Pool(){return BASE_CLS.filter(k=>CLASSES[k]&&!CLASSES[k].custom&&CLASSES[k].abil&&ABILITIES[CLASSES[k].abil])
  .map(k=>({k,abil:CLASSES[k].abil,weak:CLASS_WEAK[k]||'none'}))}
const pair102Ab=x=>ABILITIES[x.abil]?ABILITIES[x.abil][0]:x.abil;
const pair102Wk=x=>x.weak!=='none'&&WEAKNESSES[x.weak]?WEAKNESSES[x.weak][0]:_T('no weakness');
/* pair102Deck — the 7 pairs shuffled from the event seed (own generator: the dice stream is untouched) */
function pair102Deck(){const pool=pair102Pool();const g=mulberry32(hashStr('abil102|'+(S.seed>>>0))>>>0);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(g.next()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}return pool}
/* pair102Give — the seat takes the pair (ability as printed, its own weakness or none) */
function pair102Give(p,x){p.abil=x.abil;p.abilVal=1;p.wk102=x.weak;p.pair102=x.k;p.zoraUsed=0;
  if(!S.sim)log(_T`${nm(p)} takes the ${CLASSES[x.k].name} pair: <b>${pair102Ab(x)}</b> (${ABILITIES[x.abil]?ABILITIES[x.abil][1]:''}) · ${x.weak!=='none'?_T`weakness <b>${pair102Wk(x)}</b>`:_T('no weakness')}.`)}
/* pair102Cpu — a CPU's choice: ability points − weakness points, the stones only with a sling */
function pair102Cpu(p,offer){const sling=['R','L'].some(a=>p['w'+a]&&p['w'+a].stones);
  const sc=x=>(ABILITIES[x.abil]?ABILITIES[x.abil][2]:0)-(WEAKNESSES[x.weak]?WEAKNESSES[x.weak][2]:0)+(x.abil==='stone'?(sling?3:-3):0);
  let best=offer[0];for(const x of offer)if(sc(x)>sc(best))best=x;return best}
/* pair102Run — Random pair (dealt) or Draft a pair (3 offered each) */
async function pair102Run(){const m=dr102Pair();if(!m)return;const S0=S;const deck=pair102Deck();const n=deck.length;
  if(m==='random'){if(!S.sim)log(_T('Ability pairs are dealt at random.'),'hd');S.players.forEach((p,i)=>pair102Give(p,deck[i%n]));return}
  if(!S.sim)log(_T('Ability draft: each gladiator chooses one of three ability pairs.'),'hd');
  for(let i=0;i<S.players.length;i++){if(S!==S0||S.over)return;const p=S.players[i];
    const offer=[0,1,2].map(j=>deck[(i*3+j)%n]);let x;
    if(p.cpu)x=pair102Cpu(p,offer);
    else{const v=await askW(p,'pairPick102',_T`Ability draft · ${p.name}`,`<p>${_T`Choose one ability pair. A class's weakness always comes with its ability; some abilities come alone.`}</p>`,
        offer.map(o=>({label:pair102Ab(o),sub:_T`${CLASSES[o.k].name} · ${o.weak!=='none'?_T`weakness: ${pair102Wk(o)}`:_T('no weakness')}`,value:o.k})));
      x=offer.find(o=>o.k===v)||offer[0]}
    if(S!==S0)return;pair102Give(p,x);render()}}
/* draft102Run — the switch's draft: runDraft with a copy of the event that carries a draft spec */
async function draft102Run(){
  if(dr102On())await draft102Gear();
  if(dr102Pair())await pair102Run()}
async function draft102Gear(){
  const k=S.evKey;const d=Object.getOwnPropertyDescriptor(EVENTS,k);if(!d)return;
  const ev=EVENTS[k];const tmp=Object.assign(Object.create(Object.getPrototypeOf(ev)),ev,{draft:{all:DR102.picks},draft102:1});
  let pr;
  try{Object.defineProperty(EVENTS,k,{value:tmp,configurable:true,enumerable:d.enumerable,writable:true})}catch(e){console.error(e);return}
  try{if(!S.sim)log(_T('Draft rules: every gladiator drafts their gear — no class weapons or armor.'),'hd');pr=runDraft()}
  finally{try{Object.defineProperty(EVENTS,k,d)}catch(e){console.error(e)}}
  await pr}
if(!DR102.off){
  /* the loadout without the class armor and weapons */
  {const base=giveLoadout;giveLoadout=function(p){if(!p||!dr102On())return base.apply(this,arguments);
    const C=CLASSES[p.cls];if(!C)return base.apply(this,arguments);
    const keep={armor:C.armor,R:C.R,L:C.L};C.armor=[];C.R=null;C.L=null;
    try{return base.apply(this,arguments)}finally{C.armor=keep.armor;C.R=keep.R;C.L=keep.L;p._dr102=1}}}
  /* the Options box */
  {const base=optionsHTML;optionsHTML=function(evDef,location){const h=base.apply(this,arguments);
    try{if(typeof h!=='string'||typeof CFG==='undefined'||CFG.mode==='online')return h;
      const nat=dr102Native(evDef),na=dr102NA(evDef);const on=nat||(!na&&!!CFG.opts.draft102);
      const why=nat?_T('Drafts its gear'):na?_T('Chariot Racing drafts its chariot'):'';
      const tip=_T('Every gladiator starts with only what they draft (snake draft, levels 1-3) — no class weapons or armor. Coin, keys, CF and items stay.');
      const box=`<label class="dr102o" title="${esc(why||tip)}" ${why?'style="opacity:.6"':''}><input type="checkbox" id="oDraft102" ${on?'checked':''} ${why?'disabled':''}> ${_T`Draft the gear`}${why?` <span style="font-size:12px;color:var(--dim)">(${esc(why)})</span>`:''}</label>`;
      const aw=dr102AbilNA(evDef);const am=aw?'own':(CFG.opts.abil102||'own');
      const sel=`<label class="ab102o" title="${esc(aw||_T("A pair = a printed class's ability with its own weakness (some abilities have none)."))}" ${aw?'style="opacity:.6"':''}>${_T`Abilities`} <select id="oAbil102" ${aw?'disabled':''}>${[['own',_T("Class's own")],['random',_T('Random pair')],['draft',_T('Draft a pair')]].map(([v,l])=>`<option value="${v}" ${am===v?'selected':''}>${l}</option>`).join('')}</select>${aw?` <span style="font-size:12px;color:var(--dim)">(${esc(aw)})</span>`:''}</label>`;
      const at=h.indexOf('<label title=');return at>0?h.slice(0,at)+box+sel+h.slice(at):h.replace('<div class="opts">','<div class="opts">'+box+sel)}catch(e){console.error(e);return h}}}
  document.addEventListener('change',e=>{const t=e.target;if(!t||typeof CFG==='undefined')return;
    if(t.id==='oDraft102')CFG.opts.draft102=!!t.checked;else if(t.id==='oAbil102')CFG.opts.abil102=t.value;else return;
    try{const det=document.querySelector('.pn100det');const ev=EVENTS[CFG.ev];if(det&&ev){const old=det.querySelector('.dr102chips');if(old)old.outerHTML=dr102Chips(ev)}}catch(x){}},true);
  /* the configs that must never carry the options (they spread CFG.opts) */
  {const base=startEvent;startEvent=function(cfg){try{if(cfg&&cfg.opts&&(cfg.opts.draft102||cfg.opts.abil102)&&(cfg.tutorial||cfg.missio||cfg.mgrCtx||cfg.specCtx||cfg.exhibCtx||cfg.pen76||cfg.bestias85||cfg.daily100||cfg.onl||DR102.block))
      cfg.opts={...cfg.opts,draft102:false,abil102:'own'}}catch(e){}return base.apply(this,arguments)}}
  if(typeof fh100Match==='function'){const base=fh100Match;fh100Match=function(){DR102.block=1;try{return base.apply(this,arguments)}finally{DR102.block=0}}}
  /* the fighter panel's class line names the pair he fights with */
  {const base=boardHTML;boardHTML=function(p){const h=base.apply(this,arguments);try{if(p&&p.pair102&&typeof h==='string'){const C=CLASSES[p.cls];const x={k:p.pair102,abil:p.abil,weak:p.wk102||'none'};
      const t=_T`Ability pair (${CLASSES[x.k].name}): ${pair102Ab(x)} · ${pair102Wk(x)}.`;if(C&&C.ab&&h.includes(C.ab))return h.replace(C.ab,esc(t))}}catch(e){}return h}}
  /* a restored printed Iron Fist: +1 damage on every hit in round 1 */
  {const base=statDmgB;statDmgB=function(p){const r=base.apply(this,arguments);try{if(p&&p.pair102&&p.abil==='dmg'&&S&&S.ri===0&&caAllowed())return r+1}catch(e){}return r}}
  /* Play Now's event details */
  if(typeof pn100Rounds==='function'){const base=pn100Rounds;pn100Rounds=function(ev){const h=base.apply(this,arguments);
    try{if(!ev)return h;
      return dr102Chips(ev)+h}catch(e){return h}}}
  /* the briefing's rule cards */
  if(typeof bf100Rules==='function'){const base=bf100Rules;bf100Rules=function(ev){const R=base.apply(this,arguments);
    try{const m=dr102Pair();if(m&&!R.some(x=>x[0]==='🎭'))R.splice(1,0,['🎭',m==='random'?_T('Random ability pairs'):_T('Drafted ability pairs'),_T("Each gladiator fights with a printed class's ability and that class's own weakness — or none, when the class has no weakness."),'ev']);
      if(ev&&(dr102Native(ev)||dr102On())&&!R.some(x=>x[0]==='🛡'))R.splice(1,0,['🛡',_T('Drafts its gear'),dr102On()?_T('No class weapons or armor: every gladiator starts with what they drafted.'):_T('Every gladiator drafts their weapons and armor before the horns.'),'ev']);
      return R.slice(0,6)}catch(e){}
    return R}}
  /* dr102Chips — the event-details chips (gear draft · ability pairs) for the Play Now config */
  function dr102Chips(ev){const c=typeof CFG!=='undefined'?CFG:{opts:{}};const mine=EVENTS[c.ev]===ev;
    const gear=!dr102NA(ev)&&(dr102Native(ev)||mine&&!!(c.opts&&c.opts.draft102));
    const am=mine&&!dr102AbilNA(ev)&&c.opts?c.opts.abil102:'';
    return `<div class="dr102chips"><span class="dr102chip" ${gear?'':'hidden'} title="${esc(_T('Snake draft before the horns: every gladiator takes their weapons and armor from the market, levels 1-3.'))}">${_T`🛡 Drafts its gear`}</span><span class="dr102chip ab" ${am==='random'||am==='draft'?'':'hidden'}>${am==='draft'?_T('🎭 Drafted ability pairs'):_T('🎭 Random ability pairs')}</span></div>`}
  (()=>{const st=document.createElement('style');st.textContent=`.dr102chips{display:flex;flex-wrap:wrap;gap:6px}.dr102chip{display:inline-block;margin:0 0 6px;padding:2px 10px;border-radius:999px;border:1px solid #7a5a24;background:linear-gradient(135deg,#33261a,#251b13);color:var(--gold2,#e8c56a);font-size:13px}
.dr102chip[hidden]{display:none}`;document.head.appendChild(st)})();
}

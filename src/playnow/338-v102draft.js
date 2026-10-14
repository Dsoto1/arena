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
   Kill switch localStorage flavius_v102goff=1 (no option, no wrappers, draft102Run is a no-op).
   ===================================================================== */
const DR102={off:(()=>{try{return localStorage.getItem('flavius_v102goff')==='1'}catch(e){return false}})(),
  picks:5 /* TWEAK: picks per gladiator when the switch drafts an event (Ludus drafts 5) */};
/* dr102Native — the event drafts its gear by the rulebook already (or races chariots) */
function dr102Native(ev){return !!(ev&&ev.draft)}
function dr102NA(ev){return !!ev&&ev.kind==='chariot'}
/* dr102On — this live event drafts because of the switch */
function dr102On(st){const s=st||(typeof S!=='undefined'?S:null);if(DR102.off||!s||!s.opts||!s.opts.draft102)return false;
  if(s.onl||s.daily100)return false;const ev=EVENTS[s.evKey];return !!ev&&!dr102Native(ev)&&!dr102NA(ev)}
/* draft102Run — the switch's draft: runDraft with a copy of the event that carries a draft spec */
async function draft102Run(){
  if(!dr102On())return;
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
      const at=h.indexOf('<label title=');return at>0?h.slice(0,at)+box+h.slice(at):h.replace('<div class="opts">','<div class="opts">'+box)}catch(e){console.error(e);return h}}}
  document.addEventListener('change',e=>{const t=e.target;if(!t||t.id!=='oDraft102'||typeof CFG==='undefined')return;CFG.opts.draft102=!!t.checked;
    try{if(typeof pn100Rounds==='function'){const r=document.querySelector('.pn100det .dr102chip');const ev=EVENTS[CFG.ev];if(r)r.hidden=!(dr102Native(ev)||t.checked&&!dr102NA(ev))}}catch(x){}},true);
  /* Play Now's event details */
  if(typeof pn100Rounds==='function'){const base=pn100Rounds;pn100Rounds=function(ev){const h=base.apply(this,arguments);
    try{if(!ev||dr102NA(ev))return h;const on=dr102Native(ev)||typeof CFG!=='undefined'&&CFG.ev&&EVENTS[CFG.ev]===ev&&!!(CFG.opts&&CFG.opts.draft102);
      return `<div class="dr102chip" ${on?'':'hidden'} title="${esc(_T('Snake draft before the horns: every gladiator takes their weapons and armor from the market, levels 1-3.'))}">${_T`🛡 Drafts its gear`}</div>`+h}catch(e){return h}}}
  /* the briefing's rule cards */
  if(typeof bf100Rules==='function'){const base=bf100Rules;bf100Rules=function(ev){const R=base.apply(this,arguments);
    try{if(ev&&(dr102Native(ev)||dr102On())&&!R.some(x=>x[0]==='🛡')){R.splice(1,0,['🛡',_T('Drafts its gear'),dr102On()?_T('No class weapons or armor: every gladiator starts with what they drafted.'):_T('Every gladiator drafts their weapons and armor before the horns.'),'ev']);return R.slice(0,6)}}catch(e){}
    return R}}
  (()=>{const st=document.createElement('style');st.textContent=`.dr102chip{display:inline-block;margin:0 0 6px;padding:2px 10px;border-radius:999px;border:1px solid #7a5a24;background:linear-gradient(135deg,#33261a,#251b13);color:var(--gold2,#e8c56a);font-size:13px}
.dr102chip[hidden]{display:none}`;document.head.appendChild(st)})();
}

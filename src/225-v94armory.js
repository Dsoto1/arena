/* =====================================================================
   225-v94armory · v0.94 part 2 — THE MANAGER ARMORY (Virgilante's picks 2026-10-07)
   =====================================================================
   1 · OWNED GEAR. Every Manager house keeps an Armory (m.arm94.sh = the shelf) of owned pieces {id,t:'w'|'a'|'o',k,dmg?,loc?}:
       printed weapons (W), armor (ARM), offerings (OFFER) — custom gear only when the career's roster set lets it into the market
       lists (MARKET_W / MARKET_A, rosterGate). A contracted fighter wears his: g.eq94 = {h:house id, R, L, a:[armor], o:[≤2 offerings]}.
       1a: a fighter brings his CLASS LOADOUT as owned pieces the first time he is signed (g.k94 marks it — re-signing never makes
       gear from nothing); old careers get it on load (SAVE_MIGRATIONS '0.94' + the mgrMigrate/newWorld sweep, saved once).
       A pair (wraps, greaves…) is ONE piece worn on both sides. A fighter who leaves the house (released, sold, contract over) or
       dies leaves what he wore on the house shelf; a loaned fighter keeps his owner's gear (locked here).
   2 · BOUTS USE THE EQUIPPED GEAR: seatFor → seat.gear94 (whole pieces only; severed limbs/hands skipped), mkPlayer → p._g94,
       giveLoadout wrapper: the class armor/weapons are swapped for the owned ones (ability, weakness, coin, keys, items, starting
       CF stay with the class); what actually went on is kept in p._g94got. boutCfg wrapper: the ≤2 carried offerings ride in
       (festItems). Exhibitions / spars / the pen use the gear too but never settle it.
   3 · AFTER A BOUT (applyBout wrapper; gameOver snapshots every Manager seat into res.g94, sims via S.sim.done, live via
       mgrAfterWatch): 5a a brought weapon no longer held (broken, thrown, dropped, used up) is LOST; armor whose location went to
       0 AP (stripped) comes back DAMAGED (🩹 — stays on him but is left home from bouts until repaired); held pieces come back;
       gear picked up/looted in the bout is the house's (an empty hand takes it, else the shelf); carried offerings not used come
       home, others found on the sand go to the shelf (class starting tokens excluded). 2a a dead fighter's surviving gear → shelf.
   4 · THE ROSTER ARMORY (rosterBlockHTML wrapper, under the barracks wall): click a plaque (or a chip) → his avatar wearing his
       armor (avatarFor73 + avatarSVG), both hands as weapon cards, the satchel (2 offerings), what he wears; the shelf below
       (⚔ Weapons · 🛡 Armor · 🧪 Offerings). DRAG (pointer events: mouse, pen, touch) a piece onto a hand / the body / the satchel /
       another fighter's chip or plaque / the shelf — or TAP it, then tap where it goes; ＋ wears it at once; ✕ takes it off.
       Fits/replaces follow the engine (armorConflict: one regular + one padded piece per equip point, severed limbs refused,
       two-handed weapons take both hands); every tile says "✓ fits · replaces X" or why not.
   5 · THE CITY SQUARE SHOPS (cbar89StallsHTML replaced; the floating cityShopPanel('arms'/'armor') too): the arms market, the
       armorer and the offerings stall sell INTO the Armory (or straight onto a chosen fighter). STOCK per city and per week from a
       hash of world id + city + week (never the dice RNG): small cities L1–L2, middling ones sometimes one L3, Roma/Capua all
       levels; specialties (CITY94: Capua blades, Pompeii armor, Puteoli/Pola offerings, Leptis Magna/Uthina hunting, Syracusae
       missiles, Thysdrus helmets, Arles shields, Verona heavy, Nemausus armor, Roma imperial L3) — more of them, 15% off.
       🔨 Repairs at the armorer (⅓ of the price); 💰 sell from the shelf (40%, damaged 20%). Home city a quarter off (cityPr). THIS VISIT lists buys/repairs (↶ = 70% back
       while the piece is untouched). 3a: the one-week kits retire — any old g.kit becomes owned offerings on the shelf (no refund,
       so 149's refund finds nothing; 17's seatFor kit line finds nothing).
   6 · MATCH WEEK: "🛡 Gear up in <city>" (opens the square on the Stalls tab) + what needs doing. CHECKLIST nudges: a fighter with
       an empty hand his class would fill / bare hands, pieces that need repair. Manager lesson: one look-only Armory step.
   7 · RIVAL HOUSES (endWeek wrapper, arm94AutoShop): repair, dress from their shelf, buy what their class kits miss with part of
       the purse above a floor (ARM94.rivFloor, at most rivMax a week); deterministic (hash RNG). tools/mgrsim.js calls it for the scripted player too.
   Prices (ARM94): weapons 12/30/60 (L4 150), armor AP × 3/6/10 by level (pairs ×1.5), offerings at the old stall prices.
   ARM94.disabled = true turns bouts back to the class kits (balance studies only).
   UI only uses Math.random never; nothing here touches rand()/pickOne()/rnd(). Test: tools/tests/tv94m.js
   ===================================================================== */
const ARM94={wpn:{1:12,2:30,3:60,4:150},apC:{1:3,2:6,3:10},pairK:1.5,repK:1/3,undoK:0.7,carry:2,specOff:0.85,
  off:{elix2:5,elix4:9,ap2:6,ap3:9,mw1:6,mw2:12,mw3:20,ma1:6,ma2:12,ma3:20,merc1:5,merc2:9},
  rivFloor:40,rivMax:80,sellK:0.4,playerReserve:60};
const OFF94=['elix2','elix4','ap2','ap3','mw1','mw2','mw3','ma1','ma2','ma3','merc1','merc2'];
const CITY94={Roma:{sz:3,sp:'imp'},Capua:{sz:3,sp:'blades'},Pompeii:{sz:2,sp:'armor'},Puteoli:{sz:2,sp:'offer'},Syracusae:{sz:2,sp:'missile'},
  'Leptis Magna':{sz:2,sp:'hunt'},Thysdrus:{sz:2,sp:'helms'},Arles:{sz:2,sp:'shields'},Verona:{sz:1,sp:'heavy'},Nemausus:{sz:1,sp:'armor'},Uthina:{sz:1,sp:'hunt'},Pola:{sz:1,sp:'offer'}};
const SPEC94={imp:{n:_T('Imperial forges — Level 3')},blades:{n:_T('Capuan blades'),w:['gladius','sica','falcata','pugio','scissor','flavgl','knives']},armor:{n:_T('Armorers’ quarter')},
  offer:{n:_T('Harbour imports — offerings')},missile:{n:_T('Missiles'),w:['bow','sling','stones','arcu','pilum','knives']},hunt:{n:_T('Hunting weapons'),w:['hasta','bow','arcu','pilum','jade','trident','sling']},
  helms:{n:_T('Helmets')},shields:{n:_T('Shields'),w:['thracian','scutum']},heavy:{n:_T('Heavy weapons'),w:['mace','axe','flail','charun']}};
const AR94={sel:null,drag:null,tab:'w',who:'',noClick:0};

/* ---------------- prices and names ---------------- */
function arm94Price(t,k){if(t==='w'){const d=W[k];return d?(ARM94.wpn[d.lv]||ARM94.wpn[1]):0}
  if(t==='a'){const d=ARM[k];if(!d)return 0;return Math.max(4,Math.ceil((d.ap||1)*(ARM94.apC[d.lv]||ARM94.apC[1])*(d.pair?ARM94.pairK:1)))}
  return ARM94.off[k]||8}
const arm94Fix=P=>Math.max(2,Math.ceil(arm94Price(P.t,P.k)*ARM94.repK));
function arm94Name(P){if(!P)return '';if(P.t==='w')return (W[P.k]||{}).n||P.k;if(P.t==='a')return (ARM[P.k]||{}).n||P.k;const O=OFFER[P.k]||{};return O.n?`${O.n} (${O.s})`:P.k}
function arm94Meta(P){if(P.t==='w'){const d=W[P.k]||{};return _T`L${d.lv||1} · power ${d.p!=null?d.p:'—'} · range ${d.r!=null?d.r:1}${d.both?_T(' · two hands'):''}${d.shield?_T(' · shield'):''}`}
  if(P.t==='a'){const A=ARM[P.k]||{};const where=A.slot==='head'?LOCN.head:A.slot==='chest'||A.slot==='belt'?LOCN.chest:A.pair?(A.slot==='arm'?_T('both arms'):_T('both legs')):P.loc&&LOCN[P.loc]?LOCN[P.loc]:A.slot==='arm'?_T('one arm'):_T('one leg');
    return _T`L${A.lv||1} · ${A.ap||0} AP · ${where}${A.stack?_T(' · padding'):''}`}
  return esc((OFFER[P.k]||{}).s||'')}
function arm94Art(P,h){try{if(P.t==='w')return `<span class="ar94wc">${cardHTML('w:'+P.k,'xs')}</span>`;if(P.t==='a')return typeof armArtCell==='function'?armArtCell(P.k,h||40):'🛡';
  return typeof rtokHTML==='function'&&rtokHTML(P.k,h||36)||`<b>${esc((OFFER[P.k]||{}).g||'•')}</b>`}catch(e){return ''}}

/* ---------------- the data: houses, fighters, pieces ---------------- */
function arm94New(w,t,k){w.n94=(w.n94||0)+1;return {id:'p94_'+w.n94,t,k}}
function arm94H(m){if(!m.arm94||!Array.isArray(m.arm94.sh))m.arm94={sh:[]};return m.arm94}
const arm94M=(w,id)=>id&&w&&(w.mgrs||[]).find(m=>m.id===id)||null;
const arm94Home=g=>!g?null:g.loanFrom?g.loanFrom.mid:g.contract?g.contract.mgr:null;
/* a class's loadout as pieces: pairs once, single limb pieces keep their side */
function arm94Kit(cls){const C=CLASSES[cls]||CLASSES.soldier||{};const a=[];const seen=new Set();
  for(const [k,l] of C.armor||[]){const A=ARM[k];if(!A)continue;if(A.pair){if(seen.has(k))continue;seen.add(k);a.push({k,loc:'pair'})}else a.push({k,loc:l})}
  return {R:C.R&&W[C.R]?C.R:null,L:C.L&&W[C.L]?C.L:null,a}}
const arm94Slot=l=>l==='head'?'head':l==='chest'?'chest':l==='rarm'||l==='larm'?'arm':'leg';
function arm94DefLoc(A){return A.slot==='arm'?(A.pt==='hand'?'rarm':'larm'):A.slot==='leg'?'rleg':A.slot==='head'?'head':'chest'}
/* the locations a worn armor piece covers */
function arm94Locs(P){const A=ARM[P.k];if(!A)return [];const s=A.slot;if(s==='head')return ['head'];if(s==='chest'||s==='belt')return ['chest'];
  if(A.pair)return s==='arm'?['rarm','larm']:['rleg','lleg'];return [P.loc&&P.loc!=='pair'&&LOCS.includes(P.loc)?P.loc:arm94DefLoc(A)]}
const arm94Gone=(g,l)=>(g.severed||[]).includes(l);
const arm94HandGone=(g,h)=>arm94Gone(g,h==='R'?'rarm':'larm');
/* arm94Strip — a fighter leaves the house (or dies): what he wore goes back on its shelf */
function arm94Strip(w,g){const E=g.eq94;if(!E)return;const m=arm94M(w,E.h);if(m&&!m.dead){const sh=arm94H(m).sh;for(const P of [E.R,E.L,...(E.a||[]),...(E.o||[])])if(P)sh.push(P)}delete g.eq94}
/* arm94EnsureG — one fighter: hand back gear when he left, give the class kit on his first signing, convert an old city kit */
function arm94EnsureG(w,g){if(!g||!w)return false;const h=g.alive?arm94Home(g):null;let ch=false;
  if(g.eq94&&(!h||g.eq94.h!==h)){arm94Strip(w,g);ch=true}
  if(h&&!g.eq94){const m=arm94M(w,h);if(m){const E=g.eq94={h,R:null,L:null,a:[],o:[]};
    if(!g.k94){g.k94=1;const K=arm94Kit(g.cls);if(K.R)E.R=arm94New(w,'w',K.R);if(K.L)E.L=arm94New(w,'w',K.L);for(const x of K.a){const P=arm94New(w,'a',x.k);if(x.loc!=='pair')P.loc=x.loc;E.a.push(P)}}ch=true}}
  if(g.kit!=null||g.kitWk!=null||g.kitPaid87!=null){const m=arm94M(w,h||(g.eq94&&g.eq94.h));
    if(m&&Array.isArray(g.kit))for(const k of g.kit)if(OFFER[k])arm94H(m).sh.push(arm94New(w,'o',k));delete g.kit;delete g.kitWk;delete g.kitPaid87;ch=true}
  return ch}
function arm94Ensure(w){if(!w||!w.glads)return 0;let n=0;for(const m of w.mgrs||[])arm94H(m);for(const g of w.glads)if(arm94EnsureG(w,g))n++;return n}
/* every piece the house owns: shelf + worn by its fighters (where = {sh:i} or {g, z}) */
function arm94All(m){const out=[];const H=arm94H(m);H.sh.forEach((P,i)=>out.push({P,sh:i}));const w=W_();
  for(const g of (w?w.glads:[]))if(g.alive&&g.eq94&&g.eq94.h===m.id){const E=g.eq94;if(E.R)out.push({P:E.R,g,z:'R'});if(E.L)out.push({P:E.L,g,z:'L'});for(const P of E.a)out.push({P,g,z:'a'});for(const P of E.o)out.push({P,g,z:'o'})}
  return out}
const arm94Find=(m,pid)=>arm94All(m).find(x=>x.P.id===pid)||null;
function arm94Detach(m,at){if(!at)return;if(at.sh!=null){const sh=arm94H(m).sh;const i=sh.indexOf(at.P);if(i>=0)sh.splice(i,1);return}const E=at.g.eq94;
  if(at.z==='R'||at.z==='L'){if(E[at.z]===at.P)E[at.z]=null;return}const L=at.z==='a'?E.a:E.o;const i=L.indexOf(at.P);if(i>=0)L.splice(i,1)}
function arm94Stats(w){const o={owned:0,damaged:0,...(w.st94||{})};for(const m of w.mgrs||[]){if(m.dead)continue;for(const x of arm94All(m)){o.owned++;if(x.P.dmg)o.damaged++}}return o}
const arm94St=w=>w.st94=w.st94||{lost:0,dmg:0,loot:0,buy:0,spent:0,fix:0,rivSpent:0};

/* ---------------- fits / replaces (the engine's rules) ---------------- */
function arm94Fit(g,P,want){const E=g&&g.eq94;if(!E)return {no:_T('Not of your house.')};const nm=esc(g.name);
  if(P.t==='o'){if(want&&!['off','auto','body'].includes(want))return {no:_T('Offerings go in the satchel.')};if(E.o.includes(P))return {z:'off',rep:[]};
    if(E.o.length>=ARM94.carry)return {no:_T`${nm} carries two offerings at most.`};return {z:'off',rep:[]}}
  if(P.t==='w'){const d=W[P.k];if(!d)return {no:_T('Unknown weapon.')};if(want==='off')return {no:_T('Weapons go in the hands.')};
    let h=want==='R'||want==='L'?want:null;
    if(d.both)h='R';
    if(!h){const R=E.R&&E.R!==P?E.R:null;const L=E.L&&E.L!==P?E.L:null;const rBoth=R&&(W[R.k]||{}).both;
      h=arm94HandGone(g,'R')?'L':!R?'R':(!L&&!rBoth&&!arm94HandGone(g,'L'))?'L':'R'}
    if(arm94HandGone(g,h))return {no:h==='R'?_T`${nm} has no right arm.`:_T`${nm} has no left arm.`};
    if(d.both&&arm94HandGone(g,'L'))return {no:_T`Two hands needed — ${nm} has one arm.`};
    const o=h==='R'?'L':'R';const rep=[];if(E[h]&&E[h]!==P)rep.push(E[h]);
    if(E[o]&&E[o]!==P&&(d.both||(W[E[o].k]||{}).both))rep.push(E[o]);return {z:h,rep}}
  if(P.t==='a'){const A=ARM[P.k];if(!A)return {no:_T('Unknown armor.')};if(want==='R'||want==='L'||want==='off')return {no:_T('Armor goes on the body.')};
    if(P.dmg&&!E.a.includes(P))return {no:_T('Damaged — repair it at the armorer first.')};
    let loc=null;if(!A.pair&&(A.slot==='arm'||A.slot==='leg')){loc=LOCS.includes(want)&&arm94Slot(want)===A.slot?want:(P.loc&&P.loc!=='pair'?P.loc:arm94DefLoc(A));
      if(arm94Gone(g,loc)){const other={rarm:'larm',larm:'rarm',rleg:'lleg',lleg:'rleg'}[loc];if(!LOCS.includes(want)&&other&&!arm94Gone(g,other))loc=other}}
    const locs=arm94Locs({...P,loc});if(locs.every(l=>arm94Gone(g,l)))return {no:_T`${nm} has no ${(LOCN[locs[0]]||'').toLowerCase()}.`};
    const rep=E.a.filter(x=>x!==P&&ARM[x.k]&&arm94Locs(x).some(l=>locs.includes(l))&&!!ARM[x.k].stack===!!A.stack&&ARM[x.k].pt===A.pt);
    return {z:'body',loc,rep}}
  return {no:'?'}}
/* arm94Put — move a piece (shelf or worn) onto a fighter (z: R|L|body|off|auto|a location) or back to the shelf */
function arm94Put(m,pid,dst){const w=W_();const at=arm94Find(m,pid);if(!at)return {no:_T('That piece is not in your Armory.')};const P=at.P;const H=arm94H(m);
  if(dst.sh){if(at.sh!=null)return {ok:1};arm94Detach(m,at);H.sh.push(P);return {ok:1}}
  const g=gById(dst.g);if(!g||!g.alive||!g.eq94||g.eq94.h!==m.id||(g.loanFrom&&g.loanFrom.mid!==m.id))return {no:_T('Not of your house.')};
  const F=arm94Fit(g,P,dst.z||'auto');if(F.no)return F;
  if(at.g===g&&((F.z==='R'||F.z==='L')?at.z===F.z:F.z==='off'?at.z==='o':(at.z==='a'&&(F.loc||null)===(P.loc&&P.loc!=='pair'?P.loc:null))))return {ok:1,rep:[]};
  arm94Detach(m,at);for(const x of F.rep){arm94Detach(m,arm94Find(m,x.id));H.sh.push(x)}
  const E=g.eq94;if(F.z==='R'||F.z==='L')E[F.z]=P;else if(F.z==='off')E.o.push(P);else{if(F.loc)P.loc=F.loc;else delete P.loc;E.a.push(P)}
  return {ok:1,rep:F.rep}}

/* ---------------- 2 · bouts use the equipped gear ---------------- */
function arm94Seat(g){const E=g.eq94;const okW=P=>P&&W[P.k];const sev=g.severed||[];
  return {R:okW(E.R)&&!sev.includes('rarm')?E.R.k:null,L:okW(E.L)&&!sev.includes('larm')?E.L.k:null,
    a:E.a.filter(P=>!P.dmg&&ARM[P.k]).flatMap(P=>arm94Locs(P).filter(l=>!sev.includes(l)).map(l=>[P.k,l])),o:E.o.map(P=>P.k).filter(k=>OFFER[k]).slice(0,ARM94.carry)}}
{const base=seatFor;seatFor=function(g){const s=base.apply(this,arguments);try{const w=W_();if(s&&g&&w&&g.contract&&!ARM94.disabled){arm94EnsureG(w,g);if(g.eq94)s.gear94=arm94Seat(g)}}catch(e){console.error(e)}return s}}
{const base=boutCfg;boutCfg=function(){const cfg=base.apply(this,arguments);try{for(const s of (cfg&&cfg.seats)||[])if(s&&s.gear94){s.gear94.carry=1;if(s.gear94.o.length)s.festItems=[...(s.festItems||[]),...s.gear94.o]}}catch(e){console.error(e)}return cfg}}
{const base=mkPlayer;mkPlayer=function(i,s){const p=base.apply(this,arguments);try{if(p&&s&&s.gear94&&!s.onl)p._g94={...s.gear94,a:s.gear94.a.map(x=>x.slice()),o:s.gear94.o.slice()}}catch(e){console.error(e)}return p}}
{const base=giveLoadout;giveLoadout=function(p){const G=p&&p._g94;const C=G&&CLASSES[p.cls];if(!C)return base.apply(this,arguments);
  const keep={armor:C.armor,R:C.R,L:C.L};C.armor=[];C.R=null;C.L=null;let r;try{r=base.apply(this,arguments)}finally{C.armor=keep.armor;C.R=keep.R;C.L=keep.L}
  const got={R:null,L:null,a:[]};
  try{for(const [k,l] of G.a){if(ARM[k]&&p.pieces[l]&&equipPiece(p,k,l)){got.a.push([k,l]);try{if(typeof isUniqueArmor==='function'&&isUniqueArmor(k)&&typeof marketPullArmor==='function')marketPullArmor(k)}catch(e){}}}
    for(const h of ['R','L']){const k=G[h];if(!k||!W[k])continue;if(h==='L'&&p.wR&&p.wR.both)continue;p['w'+h]=mkW(k);got[h]=k;try{marketPull(k)}catch(e){}}}catch(e){console.error(e)}
  p._g94got=got;return r}}

/* ---------------- 3 · after the bout ---------------- */
function arm94Snap(){const out={};const live=x=>x&&W[x.key]&&!(x.usesLeft===0||x.ammoLeft===0||x.atkLeft===0)?x.key:null;
  for(const p of S.players||[]){if(!p||!p.mgrGid||!p._g94got)continue;
    out[p.mgrGid]={got:p._g94got,carry:!!(p._g94&&p._g94.carry),cls:p.cls,R:live(p.wR),L:live(p.wL),
      pc:Object.fromEntries(LOCS.map(l=>[l,((p.pieces||{})[l]||[]).map(pc=>pc.key)])),items:(p.items||[]).filter(it=>it&&it.kind==='offer').map(it=>it.key)}}
  return out}
{const base=gameOver;gameOver=async function(){try{if(S&&!S.overShown&&(S.players||[]).some(p=>p&&p._g94got)){const snap=arm94Snap();
    if(S.sim&&typeof S.sim.done==='function'&&!S.sim._g94){const sim=S.sim,d=sim.done;sim._g94=1;sim.done=r=>{try{if(r)r.g94=snap}catch(e){}return d(r)}}else S._g94snap=snap}}catch(e){console.error(e)}
  return base.apply(this,arguments)}}
{const base=mgrAfterWatch;mgrAfterWatch=async function(res){try{if(res&&!res.g94&&S&&S._g94snap)res.g94=S._g94snap}catch(e){}return base.apply(this,arguments)}}
/* arm94Settle — what came back from the sand (see the header, 3) */
function arm94Settle(w,b,res){const st=arm94St(w);const mine=[];
  for(const gid of b.ents||[]){const g=gById(gid);const X=res&&res.g94&&res.g94[gid];if(!g||!g.eq94||!X||!X.got)continue;const E=g.eq94;const m=arm94M(w,E.h);const sh=m?arm94H(m).sh:[];
    const lost=[],dmg=[],loot=[];
    /* weapons: a brought one comes back only if a hand still holds it */
    const held={R:X.R,L:X.L};const used=new Set();
    for(const h of ['R','L']){const P=E[h];if(!P||X.got[h]!==P.k)continue;const o=h==='R'?'L':'R';
      if(held[h]===P.k&&!used.has(h))used.add(h);else if(held[o]===P.k&&!used.has(o)&&!(E[o]&&E[o].k===P.k&&X.got[o]===P.k))used.add(o);else{E[h]=null;lost.push(P);st.lost++}}
    for(const h of ['R','L']){const k=held[h];if(!k||used.has(h))continue;const d=W[k];if(!d||!(d.lv>=1))continue;const P=arm94New(w,'w',k);loot.push(P);st.loot++;
      const rBoth=E.R&&(W[E.R.k]||{}).both;if(!E[h]&&!arm94HandGone(g,h)&&!(h==='L'&&rBoth)&&!(d.both&&(E.L||h==='L')))E[h]=P;else sh.push(P)}
    /* armor: a brought piece missing from any of its locations was stripped at 0 AP → damaged */
    const pc={};for(const l of LOCS)pc[l]=((X.pc||{})[l]||[]).slice();const got=(X.got.a||[]).map(x=>x.slice());
    for(const P of E.a){const want=arm94Locs(P);const br=[];for(const l of want){const i=got.findIndex(x=>x[0]===P.k&&x[1]===l);if(i>=0){got.splice(i,1);br.push(l)}}if(!br.length)continue;
      let whole=true;for(const l of br){const i=pc[l].indexOf(P.k);if(i>=0)pc[l].splice(i,1);else whole=false}
      if(!whole&&!P.dmg){P.dmg=1;dmg.push(P);st.dmg++}}
    for(const l of LOCS)for(const k of pc[l].slice()){const A=ARM[k];if(!A||!(A.lv>=1))continue;const i0=pc[l].indexOf(k);if(i0<0)continue;pc[l].splice(i0,1);const P=arm94New(w,'a',k);
      if(A.pair){const o={rarm:'larm',larm:'rarm',rleg:'lleg',lleg:'rleg'}[l];const j=o?pc[o].indexOf(k):-1;if(j>=0)pc[o].splice(j,1)}else if(A.slot==='arm'||A.slot==='leg')P.loc=l;
      sh.push(P);loot.push(P);st.loot++}
    /* offerings: unused carried ones come home, the rest found on the sand go on the shelf */
    if(X.carry){const items=(X.items||[]).slice();const back=[];for(const P of E.o){const i=items.indexOf(P.k);if(i>=0){items.splice(i,1);back.push(P)}}E.o=back;
      for(const it of ((CLASSES[X.cls]||{}).items||[])){if(String(it).startsWith('c:'))continue;const i=items.indexOf(it);if(i>=0)items.splice(i,1)}
      for(const k of items)if(OFFER[k]&&OFF94.includes(k)){const P=arm94New(w,'o',k);sh.push(P);loot.push(P);st.loot++}}
    if(!g.alive)arm94Strip(w,g);
    if(m&&m.isPlayer&&(lost.length||dmg.length||loot.length))mine.push({g,lost,dmg,loot})}
  if(mine.length&&typeof tnews==='function'){const L=x=>x.map(arm94Name).map(esc).join(', ');
    tnews(_T`🛡 Back from the sand: ${mine.map(x=>`<b>${esc(x.g.name)}</b>${x.g.alive?'':' ✝'} — ${[x.lost.length?_T`lost ${L(x.lost)}`:'',x.dmg.length?_T`🩹 ${L(x.dmg)} damaged (repair at the armorer)`:'',x.loot.length?_T`brought home ${L(x.loot)}`:''].filter(Boolean).join('; ')}`).join(' · ')}`)}
}
{const base=applyBout;applyBout=function(bi,res){const w=W_();const b=w&&w.night&&w.night.bouts&&w.night.bouts[bi];const was=!!(b&&b.done);const r=base.apply(this,arguments);
  try{if(b&&!was&&b.done&&res&&res.g94&&W_()===w)arm94Settle(w,b,res)}catch(e){console.error(e)}return r}}

/* ---------------- 1 · on load, new worlds, the migration (saved once) ---------------- */
SAVE_MIGRATIONS.push(['0.94',w=>{if(arm94Ensure(w))w._arm94dirty=1}]);
{const base=mgrMigrate;mgrMigrate=function(w){const o=base.apply(this,arguments);try{if(o&&o.glads&&arm94Ensure(o))o._arm94dirty=1}catch(e){console.error(e)}return o}}
{const base=newWorld;newWorld=function(){const r=base.apply(this,arguments);try{const w=W_();if(w)arm94Ensure(w)}catch(e){console.error(e)}return r}}
{const base=openManager;openManager=async function(){const r=await base.apply(this,arguments);try{const w=W_();if(w&&w._arm94dirty){delete w._arm94dirty;saveWorld()}}catch(e){}return r}}

/* ---------------- 7 · houses buy gear (rivals each week; the mgrsim player too) ---------------- */
function arm94AutoShop(w,m,o={}){if(!w||!m||m.dead)return 0;const H=arm94H(m);const st=arm94St(w);const R=mulberry32(hashStr('arm94ai|'+w.id+'|'+w.season+'|'+w.week+'|'+m.id));
  /* essentials (repairs, an empty hand, a missing class piece) may dig down to a small floor; extras only from the share above the reserve */
  const budget=o.player?Math.max(0,m.coin-ARM94.playerReserve):Math.max(0,Math.min(ARM94.rivMax,m.coin-ARM94.rivFloor));let spent=0;
  const pay=c=>{if(c>budget-spent||c>m.coin)return false;spent+=c;m.coin-=c;st.spent+=c;if(!m.isPlayer)st.rivSpent+=c;return true};
  const ros=rosterOf(m).filter(g=>!g.loanFrom||g.loanFrom.mid===m.id);for(const g of ros)arm94EnsureG(w,g);
  const n=w.night;const card=new Set(n&&n.bouts?n.bouts.flatMap(b=>b.ents||[]):[]);ros.sort((a,b)=>(card.has(b.id)?1:0)-(card.has(a.id)?1:0)||effOvr(b)-effOvr(a));
  for(const x of arm94All(m))if(x.P.dmg&&pay(arm94Fix(x.P))){delete x.P.dmg;st.fix++}
  const fromShelf=(g,pred,z)=>{const P=H.sh.find(x=>pred(x)&&!arm94Fit(g,x,z).no&&!(arm94Fit(g,x,z).rep||[]).length);if(!P)return false;return !!arm94Put(m,P.id,{g:g.id,z}).ok};
  const buy=(g,t,k,z)=>{const pr=arm94Price(t,k);if(!pr||!pay(pr))return false;const P=arm94New(w,t,k);H.sh.push(P);st.buy++;const r=arm94Put(m,P.id,{g:g.id,z});return !!r.ok};
  for(const g of ros){const E=g.eq94;if(!E)continue;const K=arm94Kit(g.cls);
    for(const h of ['R','L']){if(E[h]||arm94HandGone(g,h))continue;if(h==='L'&&E.R&&(W[E.R.k]||{}).both)continue;const want=K[h];if(h==='L'&&!want)continue;
      if(fromShelf(g,x=>x.t==='w'&&(x.k===want||(!want&&!(W[x.k]||{}).shield)||(want&&!!(W[x.k]||{}).shield===!!(W[want]||{}).shield)),h))continue;
      const k=want||(MARKET_W[1]||['gladius'])[Math.floor(R.next()*(MARKET_W[1]||['gladius']).length)];if(W[k]&&!(W[k].lv>3))buy(g,'w',k,h)}
    for(const x of K.a){const P0={t:'a',k:x.k,loc:x.loc==='pair'?undefined:x.loc};const F=arm94Fit(g,P0,x.loc==='pair'?'body':x.loc);if(F.no||F.rep.length)continue;
      if(fromShelf(g,y=>y.t==='a'&&!y.dmg&&ARM[y.k]&&ARM[y.k].pt===ARM[x.k].pt&&ARM[y.k].slot===ARM[x.k].slot&&!!ARM[y.k].stack===!!ARM[x.k].stack,x.loc==='pair'?'body':x.loc))continue;buy(g,'a',x.k,x.loc==='pair'?'body':x.loc)}
    while(E.o.length<ARM94.carry){const P=H.sh.find(y=>y.t==='o');if(!P||!arm94Put(m,P.id,{g:g.id,z:'off'}).ok)break}}
  return spent}
{const base=endWeek;endWeek=async function(){try{const w=W_();if(w)arm94Ensure(w)}catch(e){console.error(e)}const w0=W_();const r=await base.apply(this,arguments);
  try{const w=W_();if(r!==false&&w&&w===w0&&!w.dead){arm94Ensure(w);for(const m of w.mgrs||[])if(!m.isPlayer&&!m.dead)arm94AutoShop(w,m)}}catch(e){console.error(e)}return r}}

/* ---------------- 5 · the city square: stock per city and week ---------------- */
function arm94City(li){const L=LOCATIONS[li];return CITY94[L&&L.n]||{sz:1,sp:null}}
const ARM94_STK={};
function arm94Stock(w,li){const key=(w.id||'')+'|'+li+'|'+w.season+'|'+w.week+'|'+MARKET_W[1].length+'|'+MARKET_A[1].length;if(ARM94_STK[key])return ARM94_STK[key];
  const C=arm94City(li);const R=mulberry32(hashStr('arm94|'+key));const rr=()=>R.next();const sp=C.sp;const S94=SPEC94[sp]||{};
  const maxLv=C.sz>=3?3:2;const l3=C.sz===2&&rr()<0.5;const uniq=a=>[...new Set(a)];
  const isSpec=(t,k)=>sp==='imp'?((t==='w'?W[k]:ARM[k])||{}).lv===3:sp==='armor'?t==='a':sp==='offer'?t==='o':sp==='helms'?t==='a'&&(ARM[k]||{}).slot==='head':S94.w?t==='w'&&S94.w.includes(k):false;
  const draw=(pool,n,t)=>{const out=[];const P=pool.map(k=>({k,wt:(isSpec(t,k)?3:1)*({1:3,2:2,3:1}[((t==='w'?W[k]:t==='a'?ARM[k]:null)||{}).lv]||2)}));
    while(out.length<n&&P.length){const tot=P.reduce((a,x)=>a+x.wt,0);let v=rr()*tot;let i=0;for(;i<P.length-1;i++){v-=P[i].wt;if(v<=0)break}out.push(P.splice(i,1)[0].k)}return out};
  const lvl=(L,t)=>uniq([1,2,3].filter(l=>l<=maxLv).flatMap(l=>L[l]||[])).filter(k=>t==='w'?W[k]&&W[k].lv>=1&&W[k].lv<=3:ARM[k]&&ARM[k].lv>=1&&ARM[k].lv<=3);
  const wp=lvl(MARKET_W,'w'),ap=lvl(MARKET_A,'a');
  const ws=draw(wp,4+C.sz+(S94.w?1:0),'w');if(l3){const x=draw(uniq(MARKET_W[3]||[]).filter(k=>W[k]&&!ws.includes(k)),1,'w');ws.push(...x)}
  const as=draw(ap,5+C.sz+(sp==='armor'||sp==='helms'?2:0),'a');if(l3){const x=draw(uniq(MARKET_A[3]||[]).filter(k=>ARM[k]&&!as.includes(k)),1,'a');as.push(...x)}
  const os=draw(OFF94.filter(k=>OFFER[k]&&(maxLv>=3||l3||!/3$/.test(k))),3+C.sz+(sp==='offer'?3:0),'o');
  const mk=(t,k)=>{const sp1=isSpec(t,k);const lv=t==='o'?1:((t==='w'?W[k]:ARM[k])||{}).lv||1;return {t,k,sp:sp1,pr:Math.ceil(arm94Price(t,k)*(sp1?ARM94.specOff:1)),q:t==='o'?2:lv===1?2:1}};
  const list=[...ws.map(k=>mk('w',k)),...as.map(k=>mk('a',k)),...os.map(k=>mk('o',k))];ARM94_STK[key]=list;return list}
function arm94Left(w,li,i){const st=arm94Stock(w,li);const it=st[i];if(!it)return 0;const key=li+':'+w.season+':'+w.week;const B=w.stk94&&w.stk94.k===key?w.stk94.b:{};return Math.max(0,it.q-(B[i]|0))}
function arm94Mark(w,li,i,d){const key=li+':'+w.season+':'+w.week;if(!w.stk94||w.stk94.k!==key)w.stk94={k:key,b:{}};w.stk94.b[i]=Math.max(0,(w.stk94.b[i]|0)+d)}
/* arm94Buy — a stall sells into the Armory (or straight onto the chosen fighter) */
function arm94Buy(i,gid){const w=CITY.w||W_(),pm=me();if(!w||!pm||!CITY.mgr)return {no:_T('Lanistae only.')};const li=CITY.li;const it=arm94Stock(w,li)[i];if(!it)return {no:'?'};
  if(arm94Left(w,li,i)<=0)return {no:_T('Sold out this week.')};const pr=cityPr(it.pr);if(pm.coin<pr)return {no:_T('Not enough coin.')};
  pm.coin-=pr;arm94Mark(w,li,i,1);const P=arm94New(w,it.t,it.k);arm94H(pm).sh.push(P);const st=arm94St(w);st.buy++;st.spent+=pr;
  let on=null,msg='';if(gid){const r=arm94Put(pm,P.id,{g:gid,z:'auto'});const g=gById(gid);if(r.ok){on=g;msg=_T` — ${esc(g.name)} wears it`}else msg=_T` — to the shelf (${r.no})`}
  try{cbar89Rec({k:'arm94',gid:on?on.id:null,key:it.k,t:it.t,pid:P.id,i,li,price:pr})}catch(e){}
  log2city(_T`${arm94Name(P)} bought${msg}.`);saveWorld();arm94ShopRefresh();return {ok:1,P}}
function arm94Repair(pid){const pm=me();if(!pm||!CITY.mgr||!CITY.open)return {no:_T('Repairs are done at the armorer in the City Square.')};const at=arm94Find(pm,pid);if(!at||!at.P.dmg)return {no:'?'};
  const pr=cityPr(arm94Fix(at.P));if(pm.coin<pr)return {no:_T('Not enough coin.')};pm.coin-=pr;delete at.P.dmg;const st=arm94St(CITY.w||W_());st.fix++;st.spent+=pr;
  try{cbar89Rec({k:'fix94',gid:at.g?at.g.id:null,key:at.P.k,t:at.P.t,price:pr})}catch(e){}log2city(_T`${arm94Name(at.P)} mended.`);saveWorld();arm94ShopRefresh();return {ok:1}}
function arm94Undo(vi){const v=(CITY.visit89||[])[vi];const pm=me();if(!v||v.k!=='arm94'||v.ret!=null||!pm)return false;const at=arm94Find(pm,v.pid);if(!at||at.P.dmg)return false;
  arm94Detach(pm,at);const back=Math.ceil(v.price*ARM94.undoK);pm.coin+=back;v.ret=back;const w=CITY.w||W_();if(v.li===CITY.li)arm94Mark(w,v.li,v.i,-1);saveWorld();arm94ShopRefresh();return true}
/* arm94Sell — the stall buys back a whole piece from the shelf (ARM94.sellK of its price) */
function arm94Sell(pid){const pm=me();if(!pm||!CITY.mgr||!CITY.open)return {no:_T('Sell at the stalls in the City Square.')};const H=arm94H(pm);const P=H.sh.find(x=>x.id===pid);if(!P)return {no:_T('Only pieces on the shelf can be sold.')};
  const pr=Math.max(1,Math.floor(arm94Price(P.t,P.k)*(P.dmg?ARM94.sellK/2:ARM94.sellK)));H.sh.splice(H.sh.indexOf(P),1);pm.coin+=pr;
  try{cbar89Rec({k:'sell94',gid:null,key:P.k,t:P.t,price:0,ret:pr})}catch(e){}log2city(_T`${arm94Name(P)} sold.`);saveWorld();arm94ShopRefresh();return {ok:1,pr}}
function arm94ShopRefresh(){try{cbar89Refresh(['stalls'])}catch(e){}try{const p=document.querySelector('#cityPanel .ar94shop');if(p)cityPanel(arm94ShopHTML(true))}catch(e){}}
/* the stalls' HTML (sidebar tab, or the floating panel when the sidebar is folded) */
function arm94ShopHTML(floating){const w=CITY.w||W_(),pm=me();const li=CITY.li;const L=LOCATIONS[li]||{n:''};if(!CITY.mgr||!pm)return `<p class="rc-sub">${_T`The smith looks up: "Lanistae only. The arena has its own market for fighters."`}</p>`;
  const st=arm94Stock(w,li);const C=arm94City(li);const ros=rosterOf(pm).filter(g=>!g.loanFrom||g.loanFrom.mid===pm.id).sort((a,b)=>effOvr(b)-effOvr(a));for(const g of ros)arm94EnsureG(w,g);
  const who=ros.find(g=>g.id===AR94.who)||null;if(!who)AR94.who='';
  const ware=(it,i)=>{const pr=cityPr(it.pr);const left=arm94Left(w,li,i);const P={t:it.t,k:it.k};let fit='';if(who){const F=arm94Fit(who,P,'auto');fit=F.no?`<i class="no">⛔ ${F.no}</i>`:`<i class="ok">${F.rep.length?_T`✓ replaces ${esc(F.rep.map(arm94Name).join(', '))}`:_T('✓ fits')}</i>`}
    return `<button class="ar94ware ${it.sp?'sp':''}" type="button" data-arm94buy="${i}" ${pm.coin<pr||!left?'disabled':''}><span class="ar94art">${arm94Art(P,34)}</span><span class="ar94wn"><b>${esc(arm94Name(P))}</b><small>${arm94Meta(P)}</small>${fit}</span><em>${coinAmt87(pr)}${pr<arm94Price(it.t,it.k)?` <s>${arm94Price(it.t,it.k)}</s>`:''}<small>${left?_T`×${left}`:_T('sold out')}</small></em></button>`};
  const sec=(t,sk,h)=>{const L2=st.map((x,i)=>[x,i]).filter(([x])=>x.t===t);return `<div data-cbar89sec="${sk}"><div class="sect">${h}</div><div class="ar94wares">${L2.map(([x,i])=>ware(x,i)).join('')||`<small class="rc-sub">${_T`Nothing today.`}</small>`}</div></div>`};
  const dmg=arm94All(pm).filter(x=>x.P.dmg);
  const fix=dmg.length?dmg.map(x=>{const pr=cityPr(arm94Fix(x.P));return `<button class="ar94ware fix" type="button" data-arm94fix="${x.P.id}" ${pm.coin<pr?'disabled':''}><span class="ar94art">${arm94Art(x.P,34)}</span><span class="ar94wn"><b>🩹 ${esc(arm94Name(x.P))}</b><small>${x.g?esc(x.g.name):_T('on the shelf')}</small></span><em>🔨 ${coinAmt87(pr)}</em></button>`}).join(''):`<small class="rc-sub">${_T`Nothing needs mending.`}</small>`;
  return `<div class="ar94shop">${floating?`<div class="sect" style="margin-top:0">${_T`🛒 The stalls`}</div>`:''}
    <div class="ar94shh"><b>${_T`${esc(L.n)} · ${C.sz>=3?_T('a great market'):C.sz===2?_T('a busy market'):_T('a small market')}`}</b>${SPEC94[C.sp]?`<span class="sp94">★ ${SPEC94[C.sp].n}</span>`:''}
      <small>${_T`Everything goes to your house Armory — dress your fighters here or in the Roster. Stock changes every week.`}</small></div>
    <label class="cbar89who">${_T`For`} <select id="arm94Who" class="tin"><option value="">${_T`🏛 The Armory shelf`}</option>${ros.map(g=>`<option value="${g.id}" ${who&&who.id===g.id?'selected':''}>${esc(g.name)} · ${arm94Hands(g)}</option>`).join('')}</select></label>
    ${cityHome()?`<p class="rc-sub" style="margin:4px 0">${_T`🏠 <b>Home-city prices</b> — a quarter off.`}</p>`:''}
    ${sec('w','arms',_T`⚔️ The arms market`)}${sec('a','armor',_T`🛡 The armorer`)}<div data-cbar89sec="fix"><div class="sect">${_T`🔨 Repairs`} <span class="rc-sub">${_T`⅓ of the price`}</span></div><div class="ar94wares">${fix}</div></div>${sec('o','offer',_T`🧪 The offerings stall`)}
    ${(()=>{const sh=arm94H(pm).sh;if(!sh.length)return '';return `<details class="ar94sell" data-cbar89sec="sell"><summary>${_T`💰 Sell from the shelf · ${sh.length}`}</summary><div class="ar94wares">${sh.map(P=>{const pr=Math.max(1,Math.floor(arm94Price(P.t,P.k)*(P.dmg?ARM94.sellK/2:ARM94.sellK)));return `<button class="ar94ware" type="button" data-arm94sell="${P.id}"><span class="ar94art">${arm94Art(P,34)}</span><span class="ar94wn"><b>${P.dmg?'🩹 ':''}${esc(arm94Name(P))}</b><small>${arm94Meta(P)}</small></span><em>+${coinAmt87(pr)}</em></button>`}).join('')}</div></details>`})()}
    <p class="rc-sub" style="margin:6px 0 0">${_T`A fighter carries two offerings into a bout; unused ones come home.`}</p></div>`}
function arm94Hands(g){const E=g.eq94;if(!E)return '';const n=h=>E[h]?arm94Name(E[h]):'';const a=[n('R'),n('L')].filter(Boolean);return a.length?a.join(' + '):_T('bare hands')}
cbar89StallsHTML=function(){return arm94ShopHTML(false)};
cbar89StallsSync=function(){return false};
{const base=cityShopPanel;cityShopPanel=function(key){if((key==='arms'||key==='armor')&&CITY.mgr){try{if(typeof cbar89Open==='function'&&cbar89Open('stalls',{focus:key}))return}catch(e){}cityPanel(arm94ShopHTML(true));return}return base.apply(this,arguments)}}
/* THIS VISIT: 181's list, plus the Armory's buys (↶ 70% back while untouched) and repairs */
{const base=cbar89Visit;cbar89Visit=function(){base.apply(this,arguments);try{const el=document.getElementById('cbar89Visit');if(!el||!CITY.mgr)return;const V=CITY.visit89||[];const pm=me();
    const rows=[...el.querySelectorAll('.cbar89vi')];let k=0;const order=[];for(const [,L] of cbar89VisitRows())for(const [e,i] of L)order.push([e,i]);
    order.forEach(([e,i],j)=>{const row=rows[j];if(!row||(e.k!=='arm94'&&e.k!=='fix94'&&e.k!=='sell94'))return;const P={t:e.t,k:e.key};
      row.querySelector('.cbar89vico').innerHTML=arm94Art(P,22);if(e.k==='sell94'){row.classList.remove('ret');const c=row.querySelector('.cbar89vc');if(c)c.innerHTML=coinAmt87('+'+e.ret)}row.querySelector('.cbar89vw').innerHTML=e.k==='sell94'?_T`💰 ${esc(arm94Name(P))} <small>sold from the shelf</small>`:e.k==='fix94'?_T`🔨 ${esc(arm94Name(P))} <small>mended</small>`:_T`${esc(arm94Name(P))} <small>${e.t==='o'?_T('offering'):e.t==='w'?_T('weapon'):_T('armor')} · to the Armory</small>`;
      if(e.k==='arm94'&&e.ret==null){const at=pm&&arm94Find(pm,e.pid);if(at&&!at.P.dmg)row.insertAdjacentHTML('beforeend',`<button type="button" class="cbar89undo" data-arm94undo="${i}" title="${_T`Return it to the stall: ${Math.ceil(e.price*ARM94.undoK)} coin back`}">↶</button>`)}})}catch(e){console.error(e)}}}

/* ---------------- 4 · the Roster's Armory ---------------- */
function arm94Issues(g){const E=g.eq94;if(!E)return {empty:[],dmg:0};const K=arm94Kit(g.cls);const empty=[];
  for(const h of ['R','L']){if(E[h]||arm94HandGone(g,h))continue;if(h==='L'&&E.R&&(W[E.R.k]||{}).both)continue;if(K[h]||(h==='R'&&!E.L))empty.push(h)}
  return {empty,dmg:E.a.filter(P=>P.dmg).length}}
function arm94Sel(pm){const ros=rosterOf(pm).sort((a,b)=>effOvr(b)-effOvr(a));let g=ros.find(x=>x.id===MGR.ar94);if(!g){g=ros[0]||null;MGR.ar94=g?g.id:null}return g}
function arm94Tile(g,P,where){const sel=AR94.sel===P.id;let fit='';if(g&&where==='sh'){const F=arm94Fit(g,P,'auto');fit=F.no?`<i class="no">⛔ ${F.no}</i>`:`<i class="ok">${F.rep.length?_T`✓ replaces ${esc(F.rep.map(arm94Name).join(', '))}`:_T`✓ fits ${esc(g.name.split(' ')[0])}`}</i>`}
  const dz=g&&where==='sh'&&!(arm94Fit(g,P,'auto').no);
  return `<div class="ar94t ${P.dmg?'dmg':''} ${sel?'sel':''} ${where==='sh'&&!dz?'dim':''}" data-ar94p="${P.id}" role="button" tabindex="0" aria-label="${esc(arm94Name(P))}"><span class="ar94art">${arm94Art(P,44)}</span><span class="ar94tn"><b>${P.dmg?'🩹 ':''}${esc(arm94Name(P))}</b><small>${arm94Meta(P)}</small>${fit}</span>${where==='sh'&&dz?`<button type="button" class="ar94q" data-ar94wear="${P.id}" title="${_T`Put it on him`}" aria-label="${_T`Put it on him`}">＋</button>`:''}</div>`}
function arm94HandHTML(g,h){const E=g.eq94;const P=E[h];const lbl=h==='R'?_T('Right hand - Primary'):_T('Left hand - Secondary');const gone=arm94HandGone(g,h);
  if(!P)return `<div class="ar94hand empty" data-ar94z="${h}"><div class="ar94hc">${gone?_T('No arm'):_T('Empty hand')}</div><small>${lbl}</small></div>`;
  return `<div class="ar94hand" data-ar94z="${h}"><div class="ar94hc ${AR94.sel===P.id?'sel':''}" data-ar94p="${P.id}" role="button" tabindex="0" title="${_T`Drag it away, or tap it then tap where it goes`}">${cardHTML('w:'+P.k,'md').replace(/ data-card="[^"]*"/g,'')}</div><small>${lbl} · <b>${esc(arm94Name(P))}</b> <button type="button" class="ar94x" data-ar94off="${P.id}" aria-label="${_T`Take it off`}">✕</button></small></div>`}
function arm94HTML(){const pm=me(),w=W_();if(!pm||!w)return '';arm94Ensure(w);const H=arm94H(pm);const g=arm94Sel(pm);const all=arm94All(pm);const nDmg=all.filter(x=>x.P.dmg).length;
  const own=rosterOf(pm).sort((a,b)=>effOvr(b)-effOvr(a));
  const chips=own.map(x=>{const I=arm94Issues(x);const loan=x.loanFrom&&x.loanFrom.mid!==pm.id;return `<button type="button" class="ar94g ${g&&x.id===g.id?'on':''}" data-ar94g="${x.id}" ${loan?`title="${_T`On loan — his gear belongs to his own house`}"`:''}>${gArt(x,'xs')}<span><b>${esc(x.name)}</b><small>${esc(arm94Hands(x))}${I.empty.length?' ⚠':''}${I.dmg?' 🩹':''}${loan?' 🤝':''}</small></span></button>`}).join('');
  let stage='';if(g&&g.eq94){const E=g.eq94;const loan=g.loanFrom&&g.loanFrom.mid!==pm.id;let av='';try{av=avatarSVG(avatarFor73(E.a.filter(P=>ARM[P.k]).flatMap(P=>arm94Locs(P).filter(l=>!arm94Gone(g,l)).map(l=>[P.k,l])),'ar94_'+g.id))}catch(e){console.error(e)}
    const worn=E.a.map(P=>`<span class="ar94wr ${P.dmg?'dmg':''} ${AR94.sel===P.id?'sel':''}" data-ar94p="${P.id}" role="button" tabindex="0">${_T`${arm94Art(P,26)}<b>${P.dmg?'🩹 ':''}${esc(arm94Name(P))}</b><small>${(ARM[P.k]||{}).ap||0} AP</small>`}<button type="button" class="ar94x" data-ar94off="${P.id}" aria-label="${_T`Take it off`}">✕</button></span>`).join('');
    const sat=[0,1].map(i=>{const P=E.o[i];return P?`<span class="ar94so ${AR94.sel===P.id?'sel':''}" data-ar94p="${P.id}" role="button" tabindex="0" title="${esc(arm94Name(P))}">${arm94Art(P,30)}<button type="button" class="ar94x" data-ar94off="${P.id}" aria-label="${_T`Take it off`}">✕</button></span>`:`<span class="ar94so empty">＋</span>`}).join('');
    const I=arm94Issues(g);const warn=[I.empty.length?_T`⚠ ${I.empty.map(h=>h==='R'?_T('right hand'):_T('left hand')).join(_T(' and '))} empty`:'',I.dmg?_T`🩹 ${I.dmg} damaged — left home until repaired at the armorer`:''].filter(Boolean).join(' · ');
    stage=`<div class="ar94stage ${loan?'loan':''}" data-ar94who="${g.id}">
      <div class="ar94hands">${arm94HandHTML(g,'R')}${arm94HandHTML(g,'L')}</div>
      <div class="ar94av" data-ar94z="body" title="${_T`Drop armor here`}">${av}</div>
      <div class="ar94info"><div class="ar94nm">${esc(g.name)} <small>${esc((CLASSES[g.cls]||{}).name||'')} · ${effOvr(g)}</small></div>
        ${loan?`<p class="rc-sub">${_T`🤝 On loan — he fights in his own house's gear.`}</p>`:''}
        <div class="ar94worn">${worn||`<small class="rc-sub">${_T`No armor — drag a piece from the shelf.`}</small>`}</div>
        <div class="ar94sat" data-ar94z="off"><small>${_T`🧪 Satchel · ${E.o.length}/${ARM94.carry} — carried into the bout, unused ones come home`}</small><div>${sat}</div></div>
        ${warn?`<p class="ar94warn">${warn}</p>`:''}
        <p class="rc-sub ar94rule">${_T`He fights with what he wears. Ability, weakness, coin and keys stay with his class.`}</p></div></div>`}
  else stage=`<p class="rc-sub">${_T`No fighters in your ludus.`}</p>`;
  const tab=AR94.tab;const sh=H.sh.filter(P=>P.t===tab);const n=t=>H.sh.filter(P=>P.t===t).length;
  const tb=(k,l)=>`<button type="button" role="tab" data-ar94tab="${k}" class="${tab===k?'on':''}" aria-selected="${tab===k}">${l} <small>${n(k)}</small></button>`;
  const nl=w.night&&!w.night.bye&&LOCATIONS[w.night.loc]?LOCATIONS[w.night.loc].n:'';
  return `<div class="card2 ar94" id="ar94"><div class="sect" style="margin-top:0">${_T`🛡 The Armory`} <span class="rc-sub">${_T`click a plaque · drag a piece onto him, or tap it and tap where it goes`}</span>${nDmg?` <span class="ar94bad">${_T`🩹 ${nDmg} need repair`}</span>`:''}</div>
    <div class="ar94gs">${chips}</div>${stage}
    ${AR94.sel?`<p class="ar94hint">${_T`Tap where it goes: a hand, the body, the satchel, another fighter — or the shelf.`} <button type="button" class="btn tksm" data-ar94cancel="1">${_T`Cancel`}</button></p>`:''}
    <div class="ar94shelf" data-ar94z="shelf"><div class="ar94tabs" role="tablist">${tb('w',_T('⚔ Weapons'))}${tb('a',_T('🛡 Armor'))}${tb('o',_T('🧪 Offerings'))}<small class="rc-sub">${nl?_T`Buy and repair at the stalls of ${esc(nl)}'s City Square.`:_T('Buy and repair in the City Square.')}</small></div>
      <div class="ar94row">${sh.map(P=>arm94Tile(g,P,'sh')).join('')||`<p class="rc-sub">${_T`The shelf is empty — the City Square sells; the fallen leave their gear here.`}</p>`}</div></div></div>`}
{const base=rosterBlockHTML;rosterBlockHTML=function(){const h=base.apply(this,arguments);try{const d=typeof depthChartHTML==='function'?depthChartHTML():'';
    if(d&&h.startsWith(d))return d+arm94HTML()+h.slice(d.length);return arm94HTML()+h}catch(e){console.error(e);return h}}}
function arm94Redraw(){const el=document.querySelector('#mgrPane #ar94');if(!el){if(typeof MGR_REDRAW==='function')MGR_REDRAW();return}const T=document.createElement('template');T.innerHTML=arm94HTML();el.replaceWith(T.content.firstElementChild)}
function arm94Do(dst){const pm=me();const pid=AR94.sel;AR94.sel=null;if(!pid||!pm){arm94Redraw();return}const r=arm94Put(pm,pid,dst);if(r.no&&typeof mToast==='function')mToast('⛔ '+r.no);
  if(r.ok){if(dst.g&&dst.g!==MGR.ar94&&!dst.keep)MGR.ar94=dst.g;saveWorld()}arm94Redraw();return r}
/* clicks: plaques and chips select a fighter (or receive the tapped piece); pieces are tapped; zones receive */
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest)return;if(Date.now()-AR94.noClick<350)return;
  const plaque=t.closest('#mgrPane .dcard[data-gid84]');if(plaque&&!t.closest('button,select')){if(AR94.sel){arm94Do({g:plaque.dataset.gid84,z:'auto',keep:1});return}MGR.ar94=plaque.dataset.gid84;arm94Redraw();const a=document.querySelector('#mgrPane #ar94');if(a)a.scrollIntoView({block:'nearest',behavior:'smooth'});return}
  const root=t.closest('#mgrPane #ar94');if(!root)return;let x;
  if((x=t.closest('[data-ar94tab]'))){AR94.tab=x.dataset.ar94tab;arm94Redraw();return}
  if((x=t.closest('[data-ar94cancel]'))){AR94.sel=null;arm94Redraw();return}
  if((x=t.closest('[data-ar94off]'))){e.preventDefault();e.stopPropagation();AR94.sel=x.dataset.ar94off;arm94Do({sh:1});return}
  if((x=t.closest('[data-ar94wear]'))){e.stopPropagation();AR94.sel=x.dataset.ar94wear;arm94Do({g:MGR.ar94,z:'auto'});return}
  if((x=t.closest('[data-ar94g]'))){if(AR94.sel){arm94Do({g:x.dataset.ar94g,z:'auto',keep:1});return}MGR.ar94=x.dataset.ar94g;arm94Redraw();return}
  if((x=t.closest('[data-ar94p]'))){const pid=x.dataset.ar94p;if(AR94.sel&&AR94.sel!==pid){const z=x.closest('[data-ar94z]');if(z){arm94Zone(z,e);return}}AR94.sel=AR94.sel===pid?null:pid;arm94Redraw();return}
  if((x=t.closest('[data-ar94z]'))&&AR94.sel){arm94Zone(x,e);return}},true);
function arm94Zone(z,e){const k=z.dataset.ar94z;if(k==='shelf')return arm94Do({sh:1});let loc=null;
  if(k==='body'&&e){const el=document.elementFromPoint(e.clientX,e.clientY);const a=el&&el.closest&&el.closest('[data-avloc]');if(a)loc=a.dataset.avloc}
  return arm94Do({g:MGR.ar94,z:k==='body'?(loc||'body'):k})}
document.addEventListener('dblclick',e=>{const x=e.target.closest&&e.target.closest('#mgrPane #ar94 .ar94shelf [data-ar94p]');if(!x)return;AR94.sel=x.dataset.ar94p;arm94Do({g:MGR.ar94,z:'auto'})});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const t=e.target;if(t&&t.matches&&t.matches('#mgrPane #ar94 [data-ar94p][role="button"]')){e.preventDefault();t.click()}});
/* drag and drop (pointer events: mouse, pen and touch) */
document.addEventListener('pointerdown',e=>{if(e.button!==0)return;const t=e.target;if(!t||!t.closest||t.closest('button'))return;const src=t.closest('#mgrPane #ar94 [data-ar94p]');if(!src)return;
  AR94.drag={pid:src.dataset.ar94p,el:src,x0:e.clientX,y0:e.clientY,on:false,id:e.pointerId}},true);
document.addEventListener('pointermove',e=>{const D=AR94.drag;if(!D||e.pointerId!==D.id)return;
  if(!D.on){if(Math.hypot(e.clientX-D.x0,e.clientY-D.y0)<7)return;D.on=true;const g=document.createElement('div');g.className='ar94gh';const art=D.el.querySelector('.ar94art,.ar94hc,.cimg,.rtok')||D.el;g.innerHTML=art.innerHTML||art.outerHTML;document.body.appendChild(g);D.g=g;document.body.classList.add('ar94drag')}
  if(D.g){D.g.style.left=e.clientX+'px';D.g.style.top=e.clientY+'px'}const el=document.elementFromPoint(e.clientX,e.clientY);const z=el&&el.closest&&el.closest('#mgrPane #ar94 [data-ar94z],#mgrPane [data-ar94g],#mgrPane .dcard[data-gid84]');
  for(const y of document.querySelectorAll('#mgrPane .ar94hov'))if(y!==z)y.classList.remove('ar94hov');if(z)z.classList.add('ar94hov');if(e.cancelable)e.preventDefault()},{passive:false});
function arm94DragEnd(e,drop){const D=AR94.drag;if(!D||(e&&e.pointerId!==D.id))return;AR94.drag=null;if(D.g)D.g.remove();document.body.classList.remove('ar94drag');for(const y of document.querySelectorAll('#mgrPane .ar94hov'))y.classList.remove('ar94hov');
  if(!D.on||!drop)return;AR94.noClick=Date.now();const el=document.elementFromPoint(e.clientX,e.clientY);if(!el||!el.closest)return;AR94.sel=D.pid;
  const f=el.closest('#mgrPane [data-ar94g],#mgrPane .dcard[data-gid84]');if(f){arm94Do({g:f.dataset.ar94g||f.dataset.gid84,z:'auto',keep:1});return}
  const z=el.closest('#mgrPane #ar94 [data-ar94z]');if(z){arm94Zone(z,e);return}AR94.sel=null}
document.addEventListener('pointerup',e=>arm94DragEnd(e,true),true);document.addEventListener('pointercancel',e=>arm94DragEnd(e,false),true);

/* ---------------- the square's clicks ---------------- */
document.addEventListener('click',e=>{const t=e.target;if(!t||!t.closest||!CITY.open)return;let x;
  if((x=t.closest('#cityOv [data-arm94buy]'))){const r=arm94Buy(+x.dataset.arm94buy,AR94.who||null);if(r&&r.no&&typeof mToast==='function')mToast('⛔ '+r.no);return}
  if((x=t.closest('#cityOv [data-arm94fix]'))){const r=arm94Repair(x.dataset.arm94fix);if(r&&r.no&&typeof mToast==='function')mToast('⛔ '+r.no);return}
  if((x=t.closest('#cityOv [data-arm94sell]'))){const r=arm94Sell(x.dataset.arm94sell);if(r&&r.no&&typeof mToast==='function')mToast('⛔ '+r.no);return}
  if((x=t.closest('#cityOv [data-arm94undo]'))){arm94Undo(+x.dataset.arm94undo);return}});
document.addEventListener('change',e=>{const s=e.target;if(!s||s.id!=='arm94Who')return;AR94.who=s.value;arm94ShopRefresh()});
/* Match Week: "Gear up in <city>" opens the square on the Stalls */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-arm94sq]');if(b)CITY.side='stalls'},true);
{const base=openCitySquare;openCitySquare=function(){const want=CITY.side==='stalls';const r=base.apply(this,arguments);try{if(want&&CITY.open&&CITY.mgr&&typeof cbar89Open==='function'){CITY.side='stalls';cbar89Open('stalls')}}catch(e){}return r}}
function arm94Todo(pm){const ros=rosterOf(pm).filter(g=>!g.loanFrom||g.loanFrom.mid===pm.id);const w=W_();if(w)for(const g of ros)arm94EnsureG(w,g);
  const empty=ros.filter(g=>!g.inj&&arm94Issues(g).empty.length);const dmg=arm94All(pm).filter(x=>x.P.dmg).length;return {empty,dmg}}
{const base=nightHTML;nightHTML=function(){const h=base.apply(this,arguments);try{const w=W_(),pm=me();if(typeof h!=='string'||!w||!w.night||w.night.bye||!pm)return h;const L=LOCATIONS[w.night.loc];if(!L)return h;
    const T=arm94Todo(pm);const bits=[T.dmg?_T`🩹 ${T.dmg} to repair`:'',T.empty.length?_T`⚠ ${T.empty.slice(0,2).map(g=>esc(g.name)).join(', ')}: empty hand`:''].filter(Boolean).join(' · ');
    const add=`<div class="ar94mw"><button class="btn tksm" type="button" data-mg="city" data-arm94sq="1">${_T`🛡 Gear up in ${esc(L.n)}`}</button><small class="rc-sub">${bits||_T('arms · armor · offerings · repairs — into your Armory')}</small></div>`;
    const i=h.indexOf('class="city90n');if(i>=0){const j=h.indexOf('</div>',i);if(j>=0)return h.slice(0,j+6)+add+h.slice(j+6)}return add+h}catch(e){console.error(e);return h}}}
/* the weekly checklist */
{const base=weekChecklist;weekChecklist=function(){const I=base.apply(this,arguments);try{const pm=me(),w=W_();if(!pm||!w)return I;const T=arm94Todo(pm);
    const go=`<button class="btn tksm" type="button" data-mg="tab" data-id="roster">${_T`🛡 Armory`}</button>`;
    const sq=w.night&&!w.night.bye?`<button class="btn tksm" type="button" data-mg="city" data-arm94sq="1">${_T`🛒 City Square`}</button>`:go;
    for(const g of T.empty.slice(0,2)){const E=arm94Issues(g).empty;const all=!g.eq94.R&&!g.eq94.L;
      I.push({done:false,ic:'⚔',txt:all?_T`<b>${esc(g.name)}</b> fights with bare hands`:E.length===2?_T`<b>${esc(g.name)}</b> fights with both hands empty`:E[0]==='R'?_T`<b>${esc(g.name)}</b> fights with an empty right hand`:_T`<b>${esc(g.name)}</b> fights with an empty left hand`,btn:go})}
    if(T.empty.length>2)I.push({done:false,ic:'⚔',txt:_T`${T.empty.length-2} more fighters have an empty hand`,btn:go});
    if(T.dmg)I.push({done:false,ic:'🩹',txt:T.dmg===1?_T`<b>1 piece</b> needs repair`:_T`<b>${T.dmg} pieces</b> need repair`,btn:sq})}catch(e){console.error(e)}return I}}
/* the Manager lesson: one look at the Armory; the city step names the stalls */
try{const i=MTUT_STEPS.findIndex(s=>s.k==='morale');if(i>=0&&!MTUT_STEPS.some(s=>s.k==='armory'))MTUT_STEPS.splice(i+1,0,{k:'armory',spot:'#mgrPane #ar94',spotOnly:1,say:_T`<b>🛡 The Armory.</b> Your fighters own their gear: click a plaque, then drag a weapon into a hand or armor onto the body. Weapons lost on the sand are gone; armor broken to 0 AP comes home damaged — the armorer in the City Square mends it.`,next:1});
  const c=MTUT_STEPS.find(s=>s.k==='city');if(c)c.say=_T`Each week's games are in one city — and in that week you can walk its <b>city square</b>: the temple, the <b>stalls</b> that sell weapons, armor and offerings into your Armory, the auction — and <b>Walk the Sand</b> at the arena gate. Explore it in your own career. Not in this lesson.`}catch(e){console.error(e)}

(()=>{const st=document.createElement('style');st.textContent=`
.ar94{position:relative}
.ar94 .ar94bad{color:#f2a497;font-size:12px;margin-left:6px}
.ar94gs{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:thin}
.ar94g{display:flex;gap:6px;align-items:center;flex:0 0 auto;max-width:200px;padding:3px 8px 3px 4px;border-radius:6px;border:1px solid #6b4f2e;background:rgba(42,30,19,.9);color:var(--bone,#e8dcc0);cursor:pointer;text-align:left}
.ar94g.on{border-color:#d6ab4c;box-shadow:0 0 0 1px rgba(214,171,76,.4);background:rgba(78,55,33,.95)}
.ar94g .portrait{width:22px!important;height:30px!important}.ar94g span{display:flex;flex-direction:column;min-width:0}.ar94g b{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ar94g small{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ar94stage{display:grid;grid-template-columns:minmax(150px,200px) minmax(140px,200px) minmax(0,1fr);gap:12px;align-items:start;padding:10px;border-radius:8px;border:1px solid #3a2b1f;background:linear-gradient(180deg,rgba(26,19,13,.6),rgba(16,11,8,.75))}
.ar94stage.loan{opacity:.75;pointer-events:none}
.ar94hands{display:flex;flex-direction:column;gap:8px}
.ar94hand{border:1px dashed #6b5a44;border-radius:6px;padding:4px;text-align:center;min-height:70px;display:flex;flex-direction:column;justify-content:center;gap:3px}
.ar94hand small{font-size:11px;color:var(--muted)}.ar94hand.empty .ar94hc{color:var(--muted);font-style:italic;padding:14px 0}
.ar94hc{cursor:grab}.ar94hc .cimg{width:100%!important;max-width:150px;height:auto!important;margin:0 auto;display:block}
.ar94av{border-radius:6px;min-height:200px;display:flex;justify-content:center}.ar94av svg{max-height:300px;width:auto;max-width:100%}
.ar94info{min-width:0;display:flex;flex-direction:column;gap:6px}
.ar94nm{font:400 18px var(--display,serif);color:var(--gold2,#f0cf7d)}.ar94nm small{font:12px var(--body,sans-serif);color:var(--muted)}
.ar94worn{display:flex;flex-wrap:wrap;gap:4px}
.ar94wr{display:inline-flex;align-items:center;gap:4px;padding:2px 4px 2px 3px;border-radius:4px;background:rgba(0,0,0,.3);border:1px solid #4a3622;font-size:12px;cursor:grab;max-width:100%}
.ar94wr b{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}.ar94wr small{color:var(--muted);font-size:11px}
.ar94wr.dmg,.ar94t.dmg{border-color:#a3281f}.ar94wr.dmg b,.ar94t.dmg b{color:#f2a497}
.ar94x{border:0;background:none;color:var(--muted);cursor:pointer;padding:0 2px;font-size:12px;line-height:1}.ar94x:hover{color:#f2a497}
.ar94sat{border:1px dashed #6b5a44;border-radius:6px;padding:4px 6px}.ar94sat small{font-size:11px;color:var(--muted)}.ar94sat>div{display:flex;gap:6px;margin-top:3px}
.ar94so{position:relative;display:inline-flex;width:38px;height:38px;align-items:center;justify-content:center;border-radius:50%;background:rgba(0,0,0,.3);cursor:grab}.ar94so.empty{color:var(--muted);cursor:default;border:1px dashed #5a4a36}
.ar94so .ar94x{position:absolute;top:-4px;right:-6px}
.ar94warn{margin:0;color:#f2c497;font-size:12.5px}.ar94rule{margin:0}
.ar94hint{margin:8px 0 0;padding:5px 8px;border-radius:6px;background:rgba(214,171,76,.15);border:1px solid #8a6a32;font-size:12.5px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.ar94shelf{margin-top:10px;border-top:1px solid #4a3622;padding-top:6px}
.ar94tabs{display:flex;gap:4px;align-items:center;flex-wrap:wrap;margin-bottom:6px}.ar94tabs button{background:#3a2416;border:1px solid #6b4a2a;color:#ecd9b2;border-radius:14px;padding:2px 9px;font-size:12.5px;cursor:pointer}
.ar94tabs button.on{background:linear-gradient(180deg,#c9693c,#9a4424);color:#fff4de;border-color:#e6b95c}.ar94tabs .rc-sub{margin-left:auto;font-size:11.5px}
.ar94row{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:6px}.ar94row>p{grid-column:1/-1;margin:2px 0}
.ar94t{position:relative;display:flex;gap:6px;align-items:center;padding:4px 26px 4px 4px;border-radius:5px;border:1px solid #5a4630;background:rgba(42,30,19,.9);cursor:grab;min-width:0;touch-action:none}
.ar94t .ar94art{flex:0 0 46px;width:46px;height:46px;display:flex;align-items:center;justify-content:center;overflow:hidden}.ar94art .ar94wc .cimg{width:46px!important;height:auto!important}
.ar94tn{display:flex;flex-direction:column;min-width:0}.ar94tn b{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ar94tn small{font-size:11px;color:var(--muted)}
.ar94tn i,.ar94wn i{font-style:normal;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ar94tn i.ok,.ar94wn i.ok{color:#9fd27f}.ar94tn i.no,.ar94wn i.no{color:#e7a08a}
.ar94t.dim{opacity:.6}.ar94t.sel,.ar94hc.sel,.ar94wr.sel,.ar94so.sel{outline:2px solid #e6b95c;outline-offset:1px}
.ar94q{position:absolute;right:3px;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:50%;border:1px solid #8a6a32;background:#3a2416;color:#f0cf7d;cursor:pointer;font-size:12px;line-height:1;padding:0}
.ar94wc{display:inline-block;max-width:100%;line-height:0}.cbar89vico .ar94wc .cimg{width:24px!important;height:auto!important}.cbar89vico .ar94wc{width:24px;overflow:hidden}
.ar94hov{outline:2px dashed #9fd27f!important;outline-offset:2px}
body.ar94drag,body.ar94drag *{cursor:grabbing!important}
.ar94gh{position:fixed;z-index:9999;pointer-events:none;transform:translate(-50%,-50%);width:56px;opacity:.9;filter:drop-shadow(0 4px 8px rgba(0,0,0,.6))}.ar94gh .cimg{width:56px!important;height:auto!important}
.ar94mw{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}
.ar94shop .ar94shh{display:flex;flex-direction:column;gap:2px;margin-bottom:6px}.ar94shop .ar94shh b{color:var(--gold2,#f0cf7d)}.ar94shop .ar94shh small{font-size:11.5px;color:var(--muted)}
.ar94shop .sp94{align-self:flex-start;font-size:11.5px;padding:0 6px;border-radius:8px;background:rgba(214,171,76,.2);border:1px solid #8a6a32;color:#f0cf7d}
.ar94wares{display:flex;flex-direction:column;gap:4px}.ar94sell{margin-top:6px}.ar94sell summary{cursor:pointer;color:#f0cf7d;font-size:12.5px;padding:3px 0}
.ar94ware{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:6px;align-items:center;text-align:left;padding:3px 6px 3px 3px;border-radius:5px;border:1px solid #6b4a2a;background:#2c1e13;color:#ecd9b2;cursor:pointer;min-width:0}
.ar94ware:hover:not([disabled]){border-color:#d6ab4c}.ar94ware[disabled]{opacity:.5;cursor:default}.ar94ware.sp{border-color:#b8913a}
.ar94ware .ar94art{width:40px;height:40px;display:flex;align-items:center;justify-content:center;overflow:hidden}.ar94ware .ar94art .cimg{width:40px!important;height:auto!important}
.ar94wn{display:flex;flex-direction:column;min-width:0}.ar94wn b{font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ar94wn small{font-size:11px;color:#bfae8e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ar94ware em{font-style:normal;font-size:12px;text-align:right;display:flex;flex-direction:column;align-items:flex-end;white-space:nowrap}.ar94ware em small{font-size:10.5px;color:#bfae8e}.ar94ware em s{opacity:.6}
@media (max-width:760px){.ar94stage{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.ar94info{grid-column:1/-1}.ar94hc .cimg{max-width:130px}}
@media (max-width:600px){.ar94stage{grid-template-columns:minmax(0,1fr);padding:6px}.ar94hands{flex-direction:row}.ar94hand{flex:1 1 0;min-width:0}.ar94av{min-height:0}.ar94av svg{max-height:220px}.ar94row{grid-template-columns:minmax(0,1fr)}.ar94tabs .rc-sub{margin-left:0;flex-basis:100%}}
`;document.head.appendChild(st)})();

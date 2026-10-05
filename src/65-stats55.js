/* =====================================================================
   65-STATS55 · v0.55 GLADIATOR RATINGS (the core)
   =====================================================================
   Five ratings, 50–99, now grant the bonuses classes used to print on their cards:
   - Speed        → movement: base 3 (two legs), +1 at 76, +2 at 96
   - Strength     → damage per successful attack: +1 at 76, +2 at 87, +3 at 96
   - Luck         → coin each turn: +1 at 76, +2 at 96
   - Charisma     → CF each turn: +1 at 76, +2 at 96
   - Intelligence → how a CPU plays (v0.62: five minds, see 80-aitiers: Novice <65, Apprentice, Fighter 76, Veteran 86, Master 96)
   Movement, damage, coin and CF pay only in rounds that allow class abilities (caAllowed), and they stack.
   Classes keep their loadout, weakness and special perks (Zora, stones, a tamed ally); the old Fleet-footed,
   Iron Fist, Patron's Purse, Crowd Darling and Lanista abilities are now read off the ratings instead.
   Where ratings come from (seatStats): the seat's own (Manager fighters), a Studio character's sliders, or a
   roll that leans by printed class (STAT_LEAN) — Play Now rolls from the event seed without touching the dice.
   Beasts carry Speed and Strength read off their rulebook movement and attack (npcRatings).
   ===================================================================== */
const STATS=[['spd',_T('Speed'),'🏃','movement'],['str',_T('Strength'),'💪','damage'],['int',_T('Intelligence'),'🧠','tactics'],['lck',_T('Luck'),'🍀','coin'],['cha',_T('Charisma'),'🎭','CF']];
const STAT_KEYS=STATS.map(s=>s[0]);
const STAT_MIN=50,STAT_MAX=99,STAT_BUDGET=375; /* TWEAK: the range and the Studio point pool */
const statFix=v=>clamp(Math.round(+v||STAT_MIN),STAT_MIN,STAT_MAX);
const band2=v=>v>=96?2:v>=76?1:0;
const band3=v=>v>=96?3:v>=87?2:v>=76?1:0;
const bandInt=v=>v>=96?'hard':v>=76?'normal':'easy';
const INT_FOR_DIFF={easy:64,normal:84,hard:97}; /* Play Now's difficulty picker sets a printed CPU's Intelligence */
const STAT_LEAN={slave:['spd'],soldier:['str'],royalty:['lck'],hero:['cha'],veteranus:['lck','cha']}; /* TWEAK */
const ABIL_TO_STAT={mv:['spd'],dmg:['str'],coin:['lck'],cf:['cha'],vet:['lck','cha']};
const STAT_ABILS=new Set(Object.keys(ABIL_TO_STAT));
/* statBonuses — what a set of ratings grants: {mv, dmg, coin, cf, diff}. */
function statBonuses(st){st=st||{};return {mv:band2(st.spd||0),dmg:band3(st.str||0),coin:band2(st.lck||0),cf:band2(st.cha||0),diff:bandInt(st.int||0)}}
/* statPerks — the earned perks as short labels, e.g. ['+1 movement','+2 damage']. */
function statPerks(st){const b=statBonuses(st);const o=[];if(b.mv)o.push(_T`+${b.mv} movement`);if(b.dmg)o.push(_T`+${b.dmg} damage`);if(b.coin)o.push(_T`+${b.coin} coin`);if(b.cf)o.push(_T`+${b.cf} CF`);return o}
/* nextBand — the next threshold above v for a stat, or null at the top. */
function nextBand(k,v){const steps=k==='str'?[76,87,96]:[76,96];return steps.find(s=>v<s)||null}
/* leanOf — which ratings a class leans toward: printed classes by key, custom classes through their printed base. */
function leanOf(cls){if(STAT_LEAN[cls])return STAT_LEAN[cls];const C=CLASSES[cls];const r=C&&C.clsRef;if(r&&String(r).startsWith('cls:'))return STAT_LEAN[String(r).slice(4)]||[];return []}
/* rollStats — fresh ratings around a fighter's overall rating; leaned stats roll 10+ higher. rng: a 0–1 function (never the event dice). TWEAK: the spread. */
function rollStats(lean,ovr,rng){rng=rng||Math.random;lean=lean||[];const base=50+clamp(((ovr??70)-40)*0.45,0,24);const o={};
  for(const k of STAT_KEYS){let v=base-4+rng()*12;if(lean.includes(k))v=Math.max(v,base+10)+rng()*10;o[k]=statFix(v)}
  o.int=statFix(64+((ovr??70)-50)*0.9+rng()*12-6); /* Intelligence follows the overall: most fighters play Normal, the weak Easy, the stars Hard (TWEAK) */
  return o}
/* statsFromAbil — ratings that reproduce an old printed ability (migrating custom characters and classes made before v0.55). */
function statsFromAbil(abil,val){const o={spd:65,str:65,int:70,lck:65,cha:65};val=val||1;
  for(const k of ABIL_TO_STAT[abil]||[])o[k]=k==='str'?[80,90,97][clamp(val,1,3)-1]:val>=2?97:80;return o}
const cleanStats=st=>{const o={};for(const k of STAT_KEYS)o[k]=statFix(st&&st[k]);return o};
const statSum=st=>STAT_KEYS.reduce((a,k)=>a+statFix(st&&st[k]),0);
/* seatStats — the ratings a seat walks out with (see the header). Returns {st, fixed} — fixed when they came from the seat or a Studio character. */
function seatStats(i,s,C){
  if(s.stats)return {st:cleanStats(s.stats),fixed:true};
  if(C&&C.custom&&typeof CUSTOM!=='undefined'){const ch=CUSTOM.chars.find(c=>'cc_'+c.id===s.cls);if(ch)return {st:cleanStats(ch.stats||statsFromAbil(ch.abil,ch.abilVal)),fixed:true}}
  if(s.saved&&s.saved.stats)return {st:cleanStats(s.saved.stats),fixed:true};
  const g9=mulberry32((s.saved&&s.saved.id?hashStr('saved|'+s.saved.id):hashStr((S_SEED_TMP||0)+'|'+i+'|'+(s.name||s.cls)))>>>0),rng=()=>g9.next(); /* a Ludus fighter keeps the same ratings event to event */
  const st=rollStats(leanOf(s.cls),70,rng);
  if(s.cpu)st.int=INT_FOR_DIFF[s.diff||'normal']||84;
  return {st,fixed:false};
}
{const base=mkPlayer;mkPlayer=function(i,s){const p=base.apply(this,arguments);const C=CLASSES[s.cls];
  const r=seatStats(i,s,C);p.st=r.st;
  if(STAT_ABILS.has(p.abil))p.abil=null; /* the ratings pay these now */
  if(C&&C.ally&&p.abil==='zora')p.allyT=C.ally;
  if(p.cpu&&r.fixed)p.diff=s.diffLock||bandInt(p.st.int);
  return p}}
/* statDmgB / statMvB — the Strength / Speed bonus this round (0 when the round bans class abilities). */
function statDmgB(p){return p&&p.st&&S&&caAllowed()?band3(p.st.str):0}
function statMvB(p){return p&&p.st&&S&&caAllowed()?band2(p.st.spd):0}
/* statTurn — phase 3 upkeep, called inside takeChoice's class-ability block: Speed movement, Luck coin, Charisma CF. */
function statTurn(p){if(!p||!p.st)return;const b=statBonuses(p.st);const bits=[];
  if(b.mv&&!p.netted){p.mv=Math.min(7,p.mv+b.mv);bits.push(_T`+${b.mv} movement (Speed)`)}
  if(b.coin){p.coin+=b.coin;coinLog(p,b.coin,_T('Luck'));bits.push(_T`${coinAmt87('+'+(b.coin))} (Luck)`)}
  if(b.cf){cfWhy(_T('Charisma'));p.cf+=b.cf;bits.push(_T`${cfAmt87('+'+(b.cf))} (Charisma)`)}
  if(bits.length&&(b.coin||b.cf))log(`${nm(p)}: ${bits.join(' · ')}.`)}
/* statChips — the five ratings as compact chips; perk bands glow. opt.small for tight panels. */
function statChips(st,opt={}){if(!st)return '';const b=statBonuses(st);
  const perk={spd:b.mv,str:b.dmg,lck:b.coin,cha:b.cf,int:st.int>=76?1:0};
  return `<span class="statchips${opt.small?' sm':''}">${STATS.map(([k,n,ic])=>{const v=statFix(st[k]);const t=k==='int'?_T`${n} ${v}: ${b.tierName||(b.diff==='normal'?_T('Normal'):b.diff==='hard'?_T('Hard'):_T('Easy'))} mind`:`${n} ${v}${perk[k]?`: +${perk[k]} ${STATS.find(x=>x[0]===k)[3]}`:''}`;
    return `<span class="statchip${perk[k]?' up':''}${v>=96?' top':''}" title="${t}">${ic}<b>${v}</b></span>`}).join('')}</span>`}
/* ---- beasts: Speed and Strength read off the rulebook movement and attack ---- */
const NPC_SPD={1:55,2:66,3:73,4:84,5:93,6:97,7:99}; /* TWEAK */
const NPC_STR={1:56,2:68,3:80,4:90,5:97,6:99};
/* npcRatings — {spd,str} for a beast type key (fixed per beast; a small per-type wobble keeps them from reading identical). */
function npcRatings(t){const T=NPCT[t];if(!T)return null;if(T.st)return {spd:statFix(T.st.spd),str:statFix(T.st.str)};
  const mv=T.states?T.states[0][3]:T.mv,ap=T.states?T.states[0][1]:T.ap;const w=(hashStr(t)%5)-2;
  return {spd:statFix((NPC_SPD[clamp(mv,1,7)]||73)+w),str:statFix((NPC_STR[clamp(ap,1,6)]||80)-w)}}
/* mvFromSpd / apFromStr — the inverse, for the Beast designer's sliders. */
const mvFromSpd=v=>{let best=1;for(const [m,s] of Object.entries(NPC_SPD))if(v>=s-4)best=+m;return best};
const apFromStr=v=>{let best=1;for(const [a,s] of Object.entries(NPC_STR))if(v>=s-5)best=+a;return best};
/* a tamed ally (custom classes): the Zora mechanic with another beast type */
{const base=spawnZora;spawnZora=function(player){if(!player||!player.allyT||player.allyT==='zora'||!NPCT[player.allyT])return base.apply(this,arguments);
  const free=adjTiles(player).filter(([r,c])=>!pillarAt(r,c)&&!unitAt(r,c));const T=NPCT[player.allyT];
  if(!free.length){log(_T`There is no room for the ${esc(T.n)} to come out.`);return false}
  const [r,c]=free[0];S.npcs.push(mkNPC(player.allyT,T.n,r,c,{tamedBy:player.id}));
  log(_T`${nm(player)} releases a tamed <b>${esc(T.n)}</b> at ${tl(r,c)}.`,'big');return true}}
const allyName=p=>p&&p.allyT&&NPCT[p.allyT]?NPCT[p.allyT].n:_T('Zora');
/* printed class cards: the ability line now names the ratings the class leans toward */
for(const [k,C] of Object.entries(CLASSES))if(!C.custom&&STAT_ABILS.has(C.abil)&&STAT_LEAN[k]){const rest=String(C.ab||'').replace(/^Ability:[^.]*\.\s*/,'');
  C.ab=_T`Ability: leans ${STAT_LEAN[k].map(x=>STATS.find(s=>s[0]===x)[1]).join(' and ')} (ratings grant ${STAT_LEAN[k].map(x=>STATS.find(s=>s[0]===x)[3]).join(' and ')}).${rest?' '+rest:''}`}

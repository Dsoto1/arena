/* =====================================================================
   80-AITIERS · v0.62
   =====================================================================
   FIVE MINDS — a CPU's Intelligence sets one of five named tiers. Each tier sets how sharply the gladiator plays; their
   personality still sets HOW they play (a reckless Master is still reckless — just good at it).
     Novice 50-64 · Apprentice 65-75 · Fighter 76-85 · Veteran 86-95 · Master 96-99
   • decision noise (how often they misjudge a swing) shrinks tier by tier;
   • the old Easy / Normal / Hard switches (who plays the market, tunnels, truces, Focus…) follow the tier
     (Novice and Apprentice Easy, Fighter Normal, Veteran and Master Hard); the Apprentice already plays cards like a Fighter;
   • Veteran and Master read the attack weights found by the offline tuner (tools/aitune.js) — Veteran halfway, Master
     fully (AIW_TUNED below; AIW_BASE in 06-ai is the hand-set start).
   Nothing learns during play: the dice and replays stay seeded. Play Now's seat picker offers the five tiers (each sets a
   printed CPU's Intelligence); Manager and Studio gladiators get theirs from their rating (a broken spirit drops one tier).
   ===================================================================== */
const AI_TIERS=[
  {k:'novice',n:'Novice',lo:50,int:58,diff:'easy',noise:3.4,blunder:0.45,blend:0,sk:{shop:false},d:'hesitates, skips the market, misjudges often'},
  {k:'apprentice',n:'Apprentice',lo:65,int:70,diff:'easy',noise:3.4,blunder:0.3,blend:0,sk:{shop:true,steady:true},d:'works the market and fights, but wanders into danger'},
  {k:'fighter',n:'Fighter',lo:76,int:80,diff:'normal',noise:3.4,blend:0,blunder:0.15,d:'never shies from a fight, plans routes, trades and truces'},
  {k:'veteran',n:'Veteran',lo:86,int:90,diff:'normal',noise:3.4,blend:0.5,blunder:0.07,sk:{focus:true},d:'rolls Focus on close foes'},
  {k:'master',n:'Master',lo:96,int:97,diff:'hard',noise:3.4,blend:1,blunder:0,sk:{dodge:true,merchant:true,route:true,focusKill:true},d:'hunts the leader, Focuses for the kill, steps to safety after striking'}];
/* AIW_TUNED — the attack weights tools/aitune.js found (Master plays these; Veteran halfway). TWEAK: re-run the tuner after rule changes. */
const AIW_TUNED={...AIW_BASE};
const aiTierOf=int=>{let t=0;for(let i=0;i<AI_TIERS.length;i++)if((int||0)>=AI_TIERS[i].lo)t=i;return t};
const aiTierName=int=>AI_TIERS[aiTierOf(int)].n;
/* a seat's picker value → tier index (the five tier keys, or the old easy / normal / hard) */
const aiTierKey=v=>{const i=AI_TIERS.findIndex(t=>t.k===v);if(i>=0)return i;return v==='easy'?0:v==='hard'?4:v==='normal'?2:-1};
for(const t of AI_TIERS)INT_FOR_DIFF[t.k]=t.int;
function aiTier(p){if(!p)return 2;if(p.tier!=null)return p.tier;return p.st&&p.st.int?aiTierOf(p.st.int):p.diff==='easy'?0:p.diff==='hard'?4:2}
/* the weights a player scores with: the tuner's own (p.aiw), else the tier's blend of hand-set and tuned */
const AIW_CACHE={};
function aiW(p){if(p&&p.aiw)return p.aiw;const t=aiTier(p);const b=AI_TIERS[t].blend;if(!b)return AIW_BASE;if(AIW_CACHE[t])return AIW_CACHE[t];
  const o={};for(const k of Object.keys(AIW_BASE))o[k]=AIW_BASE[k]+((AIW_TUNED[k]??AIW_BASE[k])-AIW_BASE[k])*b;return AIW_CACHE[t]=o}
noise=function(player,scale=1){const T=AI_TIERS[aiTier(player)];const bl=player&&player.aiBlunder!=null?player.aiBlunder:T.blunder||0;
  const d=(player&&player.aiNoise!=null?player.aiNoise:T.noise)*(bl&&rand()<bl?6:1); /* a blunder: now and then the read is badly off */
  return (rand()-.5)*d*scale*(0.6+pers(player).aggression/250+(100-pers(player).survival)/250)};
/* tier set at the seat: the picker value for printed CPUs, else the Intelligence rating; a Manager seat whose lanista's
   fighter is broken (diffLock below the rating's band) drops one tier */
{const base=mkPlayer;mkPlayer=function(i,s){const p=base.apply(this,arguments);try{if(s&&s.aiw)p.aiw=s.aiw;
  let t=p.st&&p.st.int?aiTierOf(p.st.int):aiTierKey(s&&s.diff);if(t<0)t=2;
  if(s&&s.diffLock&&typeof bandInt==='function'&&p.st){const ix={easy:0,normal:1,hard:2};if(ix[s.diffLock]<ix[bandInt(p.st.int)])t=Math.max(0,t-1)}
  p.tier=t;if(p.cpu)p.diff=AI_TIERS[t].diff;if(s&&s.aiNoise!=null)p.aiNoise=s.aiNoise;if(s&&s.aiBlunder!=null)p.aiBlunder=s.aiBlunder;if(s&&s.aiPers)p.aiPers=s.aiPers;if(s&&s.aiSub)p.aiSub=s.aiSub;if(s&&s.aiDz!=null)p.aiDz=s.aiDz;if(s&&s.aiDiff)p.aiDiff=s.aiDiff;if(p.aiDiff&&p.cpu)p.diff=p.aiDiff}catch(e){console.error(e)}return p}}
/* keep the switches in step (a gladiator handed to the CPU mid-bout plays its own tier) */
{const base=beginTurn;beginTurn=async function(){try{const p=S&&cur();if(p&&p.cpu&&p.tier!=null)p.diff=p.aiDiff||AI_TIERS[p.tier].diff}catch(e){}return base.apply(this,arguments)}}
/* statBonuses names the tier too (read by the chips, the ratings card and the growth news) */
{const base=statBonuses;statBonuses=function(st){const b=base.apply(this,arguments);b.tier=aiTierOf((st||{}).int||0);b.tierName=AI_TIERS[b.tier].n;return b}}
function aiTierChip(int){const T=AI_TIERS[aiTierOf(int)];return `<span class="aitier t${aiTierOf(int)}" title="${esc(T.n)} mind: ${esc(T.d)}">🧠 ${esc(T.n)}</span>`}
{const st=document.createElement('style');st.textContent=`.aitier{display:inline-block;font-size:11px;padding:1px 6px;border-radius:9px;border:1px solid var(--line2);color:var(--muted);white-space:nowrap}
.aitier.t2{color:#cfc6b4}.aitier.t3{color:#9cc4e8;border-color:#4f7fc4}.aitier.t4{color:var(--gold2);border-color:var(--gold)}`;document.head.appendChild(st)}
/* the tier rides beside the ratings wherever they show; the glossary and the ratings guide name the five minds */
{const base=statChips;statChips=function(st,opt={}){const h=base.apply(this,arguments);if(!h||!st||!st.int)return h;return h.replace(/<\/span>$/,` ${aiTierChip(statFix(st.int))}</span>`)}}
const AI_TIERS_TXT='Novice below 65, Apprentice 65, Fighter 76, Veteran 86, Master 96';
try{if(typeof GLOSS!=='undefined'&&GLOSS.int)GLOSS.int.d=`How sharply a CPU plays the gladiator — five minds: ${AI_TIERS_TXT}. Personality still decides how they play. Grows by surviving and winning.`}catch(e){}
/* ---------- SKILLS BY SUBSYSTEM: each tier sets the play level (easy / normal / hard) of each part of the CPU separately.
   While a subsystem's function runs, the player's diff is that subsystem's level; nested calls set their own and restore.
   act = the turn itself (hesitation, Focus, escapes, tunnels) · goals = where to walk · choice = the turn's coin/CF/card choice ·
   score = which attack to make · items = cards and tokens · market · tactic = push and topple ·
   social = truces, trades and helping allies · defend = Minerva / Fidelis on incoming blows. TWEAK: the levels in AI_TIERS. */
const AI_SUBS={act:['cpuAct'],goals:['cpuGoals'],choice:['cpuChoice'],score:['cpuScoreAttack'],items:['cpuUseItems','askCard'],market:['cpuMarket','marketRoll'],tactic:['cpuTactic'],social:['cpuDiplomacy','cpuHelpAllies'],defend:['defend']};
function aiSubLevel(p,k){if(!p||!p.cpu)return null;if(p.aiSub&&p.aiSub[k])return p.aiSub[k];const T=AI_TIERS[aiTier(p)];return T.sub&&T.sub[k]||null}
for(const [k,fns] of Object.entries(AI_SUBS))for(const name of fns){try{const base=eval(name);if(typeof base!=='function')continue;
  const isAsync=base.constructor&&base.constructor.name==='AsyncFunction';
  const w=isAsync?async function(p){const lv=aiSubLevel(p,k);if(!lv)return base.apply(this,arguments);const d=p.diff;p.diff=lv;try{return await base.apply(this,arguments)}finally{p.diff=d}}
    :function(p){const lv=aiSubLevel(p,k);if(!lv)return base.apply(this,arguments);const d=p.diff;p.diff=lv;try{return base.apply(this,arguments)}finally{p.diff=d}};
  eval(`${name}=w`)}catch(e){}}
/* ---------- SKILLS ONE BY ONE (inside the turn, 06-ai aiSk): steady (never hesitates to fight a gladiator) · items (uses cards every turn) ·
   shop (works the market) · focus (Focus roll on a close foe) · escape (tunnels out when hurt) · shortcut (tunnels to a far goal) ·
   route (always walks around danger). A tier's `sk` sets them; unset ones follow its Easy/Normal/Hard switches. p.aiSk overrides (experiments). */
aiSk=function(p,k,d){if(!p||!p.cpu)return d;if(p.aiSk&&k in p.aiSk)return p.aiSk[k];const T=AI_TIERS[aiTier(p)];return T.sk&&k in T.sk?T.sk[k]:d};
{const base=mkPlayer;mkPlayer=function(i,s){const p=base.apply(this,arguments);if(s&&s.aiSk)p.aiSk=s.aiSk;return p}}
/* ---------- MASTER'S EYE: lookahead (before walking, weigh every tile it can reach this turn by the best blow it could strike from there,
   less the danger of standing there — and step toward the best) · dodge (steps left over at the end of the turn carry it to safer ground).
   TWEAK: danger 0.6 and distance 0.15 in the lookahead; the dodge needs to shed 1+ danger. Chariot and Naumachia keep their own movement. */
const aiWalkBlk=p=>{const b=playerBlock(p);return (r,c)=>b(r,c)||spikeAt(r,c)};
const aiZoneOK=(r,c)=>RD().zone===1||inZone(r,c);
aiLookahead=async function(p){if(isChariot()||isNaum()||!attackSources(p).length)return false;
  const {dist,prev}=dijkstra(p.r,p.c,aiWalkBlk(p));const dz=dangerMap(p);const nz=noise,r0=p.r,c0=p.c;let best=null;
  noise=()=>0;try{for(let k=0;k<N*N;k++){if(dist[k]<1||dist[k]>p.mv)continue;const r=Math.floor(k/N),c=k%N;if(!aiZoneOK(r,c))continue;p.r=r;p.c=c;let b=0;
    for(const src of attackSources(p))for(const t of targetsFor(p,src)){if(p.hesitant&&t.kind==='player')continue;if(t.kind==='player'&&inTruce(p,t.ref)&&activePlayers().length>2)continue;
      if(S.evKey==='goldenEagle'&&t.kind==='npc'&&cheb(p,t.ref)>1&&t.ref.aggro!==p.id)continue;const sc=cpuScoreAttack(p,src,t);if(sc>b)b=sc}
    if(b<=0)continue;const v=b-dz[k]*0.6-dist[k]*0.15;if(!best||v>best.v)best={v,k}}}finally{p.r=r0;p.c=c0;noise=nz}
  if(!best)return false;const path=pathTo(prev,r0*N+c0,best.k);if(!path||!path.length)return false;const k=path[0];
  if((Math.floor(k/N)!==p.r&&k%N!==p.c?2:1)>p.mv)return false;await movePlayer(p,[k]);await checkEagleScore(p);render();return true};
aiDodge=async function(p){if(isChariot()||isNaum()||p.mv<=0)return;const dz=dangerMap(p);const here=dz[p.r*N+p.c];if(here<1)return;
  const {dist,prev}=dijkstra(p.r,p.c,aiWalkBlk(p));let best=null;
  for(let k=0;k<N*N;k++){if(dist[k]<1||dist[k]>p.mv||!aiZoneOK(Math.floor(k/N),k%N))continue;const v=dz[k]+dist[k]*0.05;if(!best||v<best.v)best={v,k}}
  if(!best||here-dz[best.k]<1)return;const path=pathTo(prev,p.r*N+p.c,best.k)||[];
  for(const k of path){if((Math.floor(k/N)!==p.r&&k%N!==p.c?2:1)>p.mv||!p.alive||S.over)break;await movePlayer(p,[k]);await checkEagleScore(p)}render()};

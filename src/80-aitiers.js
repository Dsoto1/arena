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
  {k:'novice',blunder:0.45,n:'Novice',lo:50,diff:'easy',noise:4.5,blend:0,int:58,d:'misjudges often, plays cards at random'},
  {k:'apprentice',blunder:0.3,n:'Apprentice',lo:65,diff:'easy',noise:3.9,blend:0,int:70,d:'still rash, but plays its cards and the market sensibly'},
  {k:'fighter',blunder:0.15,n:'Fighter',lo:76,diff:'normal',noise:3.4,blend:0,int:80,d:'plans routes around danger, works the market'},
  {k:'veteran',blunder:0.07,n:'Veteran',lo:86,diff:'hard',noise:1.8,blend:0.5,int:90,d:'times truces and tunnels, hunts the leader'},
  {k:'master',blunder:0,n:'Master',lo:96,diff:'hard',noise:0.6,blend:1,int:97,d:'the sharpest reads in the arena'}];
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
  p.tier=t;if(p.cpu)p.diff=AI_TIERS[t].diff;if(s&&s.aiNoise!=null)p.aiNoise=s.aiNoise;if(s&&s.aiBlunder!=null)p.aiBlunder=s.aiBlunder;if(s&&s.aiDiff)p.aiDiff=s.aiDiff;if(p.aiDiff&&p.cpu)p.diff=p.aiDiff}catch(e){console.error(e)}return p}}
/* keep the switches in step (a gladiator handed to the CPU mid-bout plays its own tier) */
{const base=beginTurn;beginTurn=async function(){try{const p=S&&cur();if(p&&p.cpu&&p.tier!=null)p.diff=p.aiDiff||AI_TIERS[p.tier].diff}catch(e){}return base.apply(this,arguments)}}
/* the Apprentice plays its cards like a Fighter */
{const base=cpuUseItems;cpuUseItems=async function(player){if(aiTier(player)!==1)return base.apply(this,arguments);const d=player.diff;player.diff='normal';try{return await base.apply(this,arguments)}finally{player.diff=d}}}
/* …and works the market like one */
{const base=cpuMarket;cpuMarket=async function(player){if(aiTier(player)!==1)return base.apply(this,arguments);const d=player.diff;player.diff='normal';try{return await base.apply(this,arguments)}finally{player.diff=d}}}
/* statBonuses names the tier too (read by the chips, the ratings card and the growth news) */
{const base=statBonuses;statBonuses=function(st){const b=base.apply(this,arguments);b.tier=aiTierOf((st||{}).int||0);b.tierName=AI_TIERS[b.tier].n;return b}}
function aiTierChip(int){const T=AI_TIERS[aiTierOf(int)];return `<span class="aitier t${aiTierOf(int)}" title="${esc(T.n)} mind: ${esc(T.d)}">🧠 ${esc(T.n)}</span>`}
{const st=document.createElement('style');st.textContent=`.aitier{display:inline-block;font-size:11px;padding:1px 6px;border-radius:9px;border:1px solid var(--line2);color:var(--muted);white-space:nowrap}
.aitier.t2{color:#cfc6b4}.aitier.t3{color:#9cc4e8;border-color:#4f7fc4}.aitier.t4{color:var(--gold2);border-color:var(--gold)}`;document.head.appendChild(st)}
/* the tier rides beside the ratings wherever they show; the glossary and the ratings guide name the five minds */
{const base=statChips;statChips=function(st,opt={}){const h=base.apply(this,arguments);if(!h||!st||!st.int)return h;return h.replace(/<\/span>$/,` ${aiTierChip(statFix(st.int))}</span>`)}}
const AI_TIERS_TXT='Novice below 65, Apprentice 65, Fighter 76, Veteran 86, Master 96';
try{if(typeof GLOSS!=='undefined'&&GLOSS.int)GLOSS.int.d=`How sharply a CPU plays the gladiator — five minds: ${AI_TIERS_TXT}. Personality still decides how they play. Grows by surviving and winning.`}catch(e){}

/* 382-v105home — v1.05 B61: a recruit's "home city" want and the home-city interest bonus always name a city WITH AN ARENA.
   · homeArena105(g): a fighter from one of the 12 arena cities (LOCATIONS) keeps it; one from any other town (Alexandria, Ostia, ...) takes the
     NEAREST arena city to his town. Town positions: MI100_XTRA (295-v100maps, the map art's 0..1 coordinates, the same space as LOCATIONS x/y),
     else CITY_XY (17-manager); distance is measured in map pixels (x*MAPW, y*MAPH). A town with no position falls back to a stable hash pick.
     Deterministic; cached as g.homeArena105 (+ g.homeArenaOf105 = the town it was computed for) lazily, so old worlds need no migration.
   · glad.city (birthplace) is untouched: bio, flag, map card, scouting-by-city.
   · WANT 'home' (157): want88Fits / want88How use the arena city; the chip reads "Home: Thysdrus (from Alexandria)" (want88Def's 2nd arg g, 157).
   · baseInterest (17): the +8 home bonus applies when the arena city equals the ludus's city (rivals use the same maths via interestOf).
   Kill switch localStorage flavius_v105homeoff=1 (everything is the old behaviour). Test tv105s. */
const HOME105={off(){try{return localStorage.getItem('flavius_v105homeoff')==='1'}catch(e){return false}}};
const isArena105=c=>!!c&&LOCATIONS.some((L,i)=>i>0&&L&&L.n===c);
function townXY105(c){const X=typeof MI100_XTRA!=='undefined'&&MI100_XTRA[c];if(X)return X;const Y=typeof CITY_XY!=='undefined'&&CITY_XY[c];return Y||null}
function nearestArena105(c){if(isArena105(c))return c;const P=townXY105(c);const ar=LOCATIONS.filter((L,i)=>i>0&&L);
  if(!P)return ar[Math.abs(typeof hashStr==='function'?hashStr('home105:'+c):0)%ar.length].n;
  let best=null,bd=Infinity;for(const L of ar){const d=Math.hypot((L.x-P[0])*MAPW,(L.y-P[1])*MAPH);if(d<bd-1e-9){bd=d;best=L.n}}return best}
function homeArena105(g){if(!g||!g.city)return g?g.city||null:null;if(HOME105.off())return g.city;
  if(g.homeArena105&&g.homeArenaOf105===g.city&&isArena105(g.homeArena105))return g.homeArena105;
  const a=nearestArena105(g.city);try{g.homeArena105=a;g.homeArenaOf105=g.city}catch(e){}return a}
/* the chip text: null = leave the old label */
function home105Label(g){if(HOME105.off()||!g||!g.city)return null;const a=homeArena105(g);if(!a||a===g.city)return null;return _T`Home: ${a} (from ${g.city})`}
{const base=want88Fits;want88Fits=function(g,m,k){if(k==='home'&&!HOME105.off()){try{return !!g.city&&!!m&&m.city===homeArena105(g)}catch(e){}}return base.apply(this,arguments)}}
{const base=want88How;want88How=function(g,k){if(k==='home'&&!HOME105.off()&&g){const a=homeArena105(g);if(a)return _T`a house in ${a}`}return base.apply(this,arguments)}}
{const base=baseInterest;baseInterest=function(mgr,glad){
  if(HOME105.off()||!glad||!mgr||!glad.city)return base.apply(this,arguments);
  const a=homeArena105(glad);if(a===glad.city)return base.apply(this,arguments);
  /* the bonus follows the arena city: recompute with the arena city standing in for the town, so the fame-gate cap stays right */
  const keep=glad.city;glad.city=a;try{return base.apply(this,arguments)}finally{glad.city=keep}}}

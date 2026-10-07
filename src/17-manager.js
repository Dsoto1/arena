
/* =====================================================================
   17-MANAGER · MANAGER MODE (core)
   =====================================================================
   MANAGER MODE: run a ludus as a lanista. Recruit (interest, pitches, visits, offers), scout with sparring
   bouts simulated in the Ludus, enter fighters on match nights, bet on bouts, poach from rival stables.
   Every bout is a real Flavius Rule event, played by the engine off-screen or live on the board.
   - The world: MGR.world (W_()), me() the player's lanista, gById/mgrById, saveWorld (Store mgrCareers);
     the ACTIVE career's treasury bankrolls wagers everywhere (activeMgr / applyActivePurse).
   - Fighters: genGlad, effOvr, askWage, boostFor/seatFor (a fighter as an engine seat); interest and motives.
   - The week: makeNight (3 bouts) → boutCfg / runBoutSim / watchBout → applyBout (+ leagueFate, the printed
     Fate table) → endWeek. cpuLeagueWeek runs the rival houses.
   - UI: openManager / hubHTML and the tabs (Your ludus, Match Week, Recruiting, Infirmary, Practice, League,
     News + the Acta Diurna, Lanista); wireManager handles every [data-mg] action.
   Later modules (47-mgr47 onward) wrap most of these; check them before changing behavior here.
   ===================================================================== */
const MGR={careers:[],world:null,tab:'ludus',sel:null,filter:'free',sort:'stars',busy:false,msg:''};
/* MGR_KEYS — lanista personality traits: [key, name, what it does]. */
const MGR_KEYS=[['ambition',_T('Ambition'),_T('Chases stars and titles, spends big')],['cunning',_T('Cunning'),_T('Better scouting, poaching and betting')],['honor',_T('Honor'),_T('Keeps promises; fighters trust them; poaching costs them')],['greed',_T('Greed'),_T('Takes a bigger cut of every purse; fighters resent it')],['show',_T('Showmanship'),_T('Draws crowds and fame; showmen love them')],['discipline',_T('Discipline'),_T('Trains fighters harder: faster improvement')],['risk',_T('Risk'),_T('Bolder bets and entries')]];
/* MGR_PRESETS — personality presets for a new lanista: key → [name, traits]. TWEAK: the trait values. */
const MGR_PRESETS={balanced:[_T('Balanced'),{ambition:50,cunning:50,honor:50,greed:50,show:50,discipline:50,risk:50}],honorable:[_T('The Honorable'),{ambition:45,cunning:30,honor:92,greed:20,show:40,discipline:70,risk:30}],schemer:[_T('The Schemer'),{ambition:65,cunning:92,honor:15,greed:60,show:45,discipline:40,risk:65}],showman:[_T('The Showman'),{ambition:60,cunning:45,honor:50,greed:40,show:92,discipline:35,risk:55}],drill:[_T('The Drillmaster'),{ambition:50,cunning:45,honor:70,greed:35,show:30,discipline:95,risk:25}],gambler:[_T('The Gambler'),{ambition:55,cunning:65,honor:40,greed:50,show:55,discipline:30,risk:95}],miser:[_T('The Miser'),{ambition:35,cunning:60,honor:45,greed:92,show:30,discipline:55,risk:20}],butcher:[_T('The Butcher'),{ambition:70,cunning:40,honor:20,greed:55,show:85,discipline:50,risk:75}],patrician:[_T('The Patrician'),{ambition:85,cunning:50,honor:60,greed:65,show:55,discipline:45,risk:35}],scholar:[_T('The Scholar'),{ambition:45,cunning:75,honor:65,greed:30,show:30,discipline:85,risk:25}],zealot:[_T('The Zealot'),{ambition:60,cunning:25,honor:90,greed:15,show:75,discipline:70,risk:55}],merchant:[_T('The Merchant'),{ambition:55,cunning:80,honor:40,greed:85,show:45,discipline:40,risk:45}]};
/* MGR_PRE — the league's preset houses: lanista, ludus, city, color, fame, coin, traits, bio, roster size n and rating band tier. TWEAK: fame/coin/tier to make rivals stronger or weaker. */
const MGR_PRE=[
  {key:'crispus',name:'Aulus Vettius Crispus',ludus:_T('Ludus Crispinus'),city:'Capua',color:'#c0433a',fame:62,coin:320,p:{ambition:80,cunning:60,honor:35,greed:70,show:60,discipline:50,risk:55},bio:_T('Old Capuan money. Buys stars, works them hard and pays late.'),n:5,tier:[68,86]},
  {key:'severa',name:'Domitia Severa',ludus:_T('Ludus Severianus'),city:'Roma',color:'#8a5cc0',fame:56,coin:260,p:{ambition:60,cunning:40,honor:88,greed:30,show:45,discipline:88,risk:30},bio:_T('A drillmaster with a spotless name. Her fighters would die for her, and sometimes do.'),n:4,tier:[64,82]},
  {key:'proculus',name:'Old Proculus',ludus:_T('The Pompeian Pit'),city:'Pompeii',color:'#9a8f84',fame:44,coin:140,p:{ambition:30,cunning:58,honor:70,greed:40,show:30,discipline:76,risk:25},bio:_T('Forty years of sand in his sandals. Cheap, patient, and rarely wrong about a fighter.'),n:4,tier:[56,74]},
  {key:'murena',name:'Titus "the Fox" Murena',ludus:_T('Ludus Vulpes'),city:'Puteoli',color:'#dc7a34',fame:34,coin:190,p:{ambition:65,cunning:92,honor:15,greed:65,show:50,discipline:40,risk:70},bio:_T('Poacher, briber, bookmaker\'s friend. If your star goes missing, check his stables.'),n:3,tier:[56,76]},
  {key:'aurelia',name:'Livia Aurelia Magna',ludus:_T('House of Aurelia'),city:'Syracusae',color:'#e07b9a',fame:40,coin:220,p:{ambition:55,cunning:50,honor:55,greed:45,show:92,discipline:40,risk:50},bio:_T('Silk banners, perfumed sand and fighters who play to the gods in the upper tiers.'),n:3,tier:[54,74]},
  {key:'hanno',name:'Hanno the Carthaginian',ludus:_T('Ludus Punicus'),city:'Uthina',color:'#d4b13c',fame:26,coin:160,p:{ambition:60,cunning:66,honor:40,greed:50,show:55,discipline:35,risk:95},bio:_T('Bets the stable on long odds, and wins often enough to keep doing it.'),n:3,tier:[50,70]},
  {key:'servius',name:'Brother Servius',ludus:_T('The Veronese Brotherhood'),city:'Verona',color:'#4f9a57',fame:12,coin:70,p:{ambition:35,cunning:30,honor:95,greed:10,show:30,discipline:72,risk:20},bio:_T('A former priest of Mars who takes in the fighters nobody else wants.'),n:2,tier:[44,60]},
  {key:'nerva',name:'Marcus Nerva the Younger',ludus:_T('Ludus Nervanus'),city:'Arles',color:'#4f7fc4',fame:16,coin:420,p:{ambition:90,cunning:35,honor:50,greed:25,show:66,discipline:30,risk:60},bio:_T('A rich heir with more coin than sense and a burning need to be somebody.'),n:2,tier:[48,66]},
  {key:'thysdrus',name:'Gnaea Sallustia',ludus:_T('Ludus Olearius'),city:'Thysdrus',color:'#b8864b',fame:30,coin:240,p:{ambition:58,cunning:55,honor:48,greed:62,show:70,discipline:45,risk:45},bio:_T('Olive-oil money from the African plains. Builds her amphitheater bigger every year, and her roster with it.'),n:3,tier:[58,76]},
  {key:'nemausus',name:'Sextus Pompeius Rufus',ludus:_T('Schola Nemausensis'),city:'Nemausus',color:'#6fa8a0',fame:22,coin:150,p:{ambition:45,cunning:40,honor:80,greed:30,show:40,discipline:80,risk:30},bio:_T('A veteran of the legions who runs his school like a camp: bread at dawn, drill till dusk, no excuses.'),n:3,tier:[52,70]},
  {key:'leptis',name:'Iddibal the Younger',ludus:_T('House of the Lighthouse'),city:'Leptis Magna',color:'#c07a3a',fame:28,coin:280,p:{ambition:70,cunning:72,honor:30,greed:60,show:58,discipline:38,risk:78},bio:_T('Trade-fleet fortune, bookmaker friends, and a talent for buying fighters the week before they break out.'),n:3,tier:[56,74]},
  {key:'pola',name:'Tertulla of Pola',ludus:_T('The Istrian Pens'),city:'Pola',color:'#7a8fd0',fame:18,coin:110,p:{ambition:40,cunning:48,honor:60,greed:40,show:62,discipline:55,risk:40},bio:_T('Runs the smallest arena in the league and the loudest crowd in it. Recruits fishermen, and they fight like it.'),n:3,tier:[48,66]}
];
// what a fighter reads into each grade, and what a lanista can actually DO about it.
// mgrScore() below computes the letter; these strings tell the player which levers move it.
const MOT_ADVICE={
  coin:_T('Raise it: grow the treasury (win purses, bet well), keep Greed low, and keep your betting net positive. Ambition helps a little.'),
  glory:_T('Raise it: fame and win-rate, nothing else. Enter bouts you can win; every victory compounds.'),
  honor:_T('Raise it: keep your word. Poaching (−9 each) and broken contracts or pledges (−6 each) scar it for good; kept pledges (+3) heal it.'),
  spectacle:_T('Raise it: Showmanship and fame. Showmen love a famous house; win big bouts and let the criers talk.'),
  training:_T('Raise it: Discipline, plus every fighter you have actually improved (+1.5 each). Drillmasters recruit on this.'),
  home:'Raise it: nothing — it is geography. Recruit fighters whose home city lies near yours, or accept the discount.',
  playing:_T('Raise it: keep the stable lean. Past five fighters, each extra one costs a little arena time in a recruit\'s eyes — how much is set by the Arena-time pressure slider (Sandbox).'),
};
/* MOTIVES — what a fighter can want from a ludus: [label, meaning]. */
const MOTIVES={coin:[_T('Coin'),_T('wants to be paid well')],glory:[_T('Glory'),_T('wants a winning, famous ludus')],honor:[_T('Honor'),_T('wants a lanista who keeps their word')],spectacle:[_T('Spectacle'),_T('wants big crowds and showmanship')],training:[_T('Training'),_T('wants to get better')],home:[_T('Home'),_T('wants to fight close to home')],playing:[_T('Arena time'),_T('wants to fight every week')]};
/* CITY_XY — map positions of non-arena cities (for the Home motive's distance). */
const CITY_XY={Carthago:[.44,.70],Alexandria:[1.25,1.05],Corinth:[1.12,.62],Gades:[-.25,.82],Massilia:[.33,.2],Ostia:[.61,.27],Tarentum:[.86,.4],Neapolis:[.71,.32],Brundisium:[.92,.37],Antiochia:[1.55,.8],Cyrene:[1.05,1.02],Londinium:[.05,-.8],Lugdunum:[.26,.03],Emerita:[-.3,.52]};
/* TIERS — the three bouts of a match night: undercard / feature / main event — event, purse, appearance fee, rating band lo–hi, fame gain. TWEAK: purses and fees. */
const TIERS={under:{n:'Undercard',ev:'egidious',purse:30,fee:4,lo:0,hi:62,fame:2},feature:{n:'Feature bout',ev:'democritus',purse:70,fee:8,lo:56,hi:77,fame:4},main:{n:'Main event',ev:'cassian',purse:160,fee:15,lo:70,hi:99,fame:8}};
const HYGEIA=20; // Blessings of Hygeia: regrow a severed limb — the ONLY cure for a lost limb
const ASCLEPIUS=25; // temple incubation: heals any wound at once (not limbs), paid outside the weekly allowance
const MEDICUS=10; // the ludus physician: a Health Elixir regimen that restores a fighter's spirits (+12 morale)
const REPAIR_CAP=50; // the weekly INFIRMARY ALLOWANCE: Medicus + surgeon + Hygeia may spend at most this much treasury coin a week
const BANKRUPT_WEEKS=3; // a treasury in the red for this many consecutive week-ends collapses the ludus — and so does ending a season in debt
const STAR_FAME=[0,0,5,18,36,56]; // a 3-star fighter will not consider a ludus with less than 18 fame
/* mgrTier — a lanista's reputation label from fame (Unknown → Legendary). */
const mgrTier=fame=>fame>=80?_T('Legendary'):fame>=55?_T('Imperial'):fame>=30?_T('Regional'):fame>=10?_T('Local'):_T('Unknown');
/* starsOf — a rating as 1–5 stars. TWEAK: the 55/64/73/82 cut-offs. */
const starsOf=ovr=>ovr>=82?5:ovr>=73?4:ovr>=64?3:ovr>=55?2:1;
/* starHTML — n of 5 stars as HTML. */
const starHTML=stars=>`<span class="stars" aria-label="${_T`${stars} stars`}">${'★'.repeat(stars)}<span class="off">${'★'.repeat(5-stars)}</span></span>`;
// v0.21: fame reads at a glance, like skill — up to five laurel wreaths (fighters and whole stables)
const fameN=fame=>fame>=80?5:fame>=60?4:fame>=40?3:fame>=20?2:fame>=6?1:0;
/* fameHTML — fame as up to five laurel wreaths. */
const fameHTML=fame=>`<span class="fame" title="${_T`Fame ${fame||0}/100 — how widely the empire knows this name`}">${ICO.laurel.repeat(fameN(fame||0))}<span class="off">${ICO.laurel.repeat(5-fameN(fame||0))}</span></span>`;
/* gradeOf — a 0–100 score as a letter grade A–F. */
const gradeOf=score=>score>=80?'A':score>=65?'B':score>=50?'C':score>=35?'D':'F';
/* gradeHTML — the letter grade chip. */
const gradeHTML=score=>`<span class="grade ${gradeOf(score)}">${gradeOf(score)}</span>`;
/* W_ — the open Manager world (MGR.world). */
const W_=()=>MGR.world;
/* me — the player's own lanista in the open world. */
const me=()=>W_()&&W_().mgrs.find(m=>m.id===W_().playerId);
/* mgrById — a lanista of the open world by id. */
const mgrById=id=>W_().mgrs.find(m=>m.id===id);
/* gById — a fighter of the open world by id. */
const gById=id=>W_().glads.find(g=>g.id===id);
/* effOvr — a fighter's effective rating: base −6 per severed limb − injury penalty + rating-growth bonus, 25–99. */
const effOvr=glad=>clamp(Math.round(glad.ovr-6*(glad.severed||[]).length-(glad.inj?glad.inj.pen||0:0)+(typeof statOvr==='function'?statOvr(glad):0)),25,99); /* v0.55: rating growth lifts the overall */ // injuries dent the rating until healed
/* rosterOf — a lanista's living, signed fighters. */
const rosterOf=mgr=>W_().glads.filter(g=>g.alive&&g.contract&&g.contract.mgr===mgr.id);
/* freeAgents — living fighters with no contract (auction lots excluded). */
const freeAgents=()=>W_().glads.filter(g=>g.alive&&!g.contract&&!g.auction); // auction-block lots sell only at the block
/* cityXY — map position of a city (arena cities from LOCATIONS, others from CITY_XY). */
function cityXY(c){const L=LOCATIONS.find(x=>x&&x.n===c);return L?[L.x,L.y]:CITY_XY[c]||[.5,.5]}
/* mnews — adds a league news line (last 90). */
function mnews(text,cls=''){const w=W_();w.news.unshift({wk:w.week,s:w.season,text,cls});w.news=w.news.slice(0,90)}
// the ludus ledger: a private log of everything that touched YOUR stable (signings, poaches, deaths, injuries)
function tnews(text,cls=''){const w=W_();if(!w)return;(w.tlog=w.tlog||[]).unshift({wk:w.week,s:w.season,text,cls});w.tlog=w.tlog.slice(0,50)}
// every fighter's career chronicle: the moments a life on the sand is remembered by
function ghist(glad,txt){const w=W_();if(!w||!glad)return;(glad.hist=glad.hist||[]).unshift({s:w.season,wk:w.week,txt});glad.hist=glad.hist.slice(0,24)}
let mgrSaveT=null;
/* saveWorld — saves the open career to Store mgrCareers (debounced 400 ms unless now); the lesson's sandbox league is never saved. */
function saveWorld(now=false){const w=W_();if(!w||w.tutorial)return; /* v0.44: the lesson's sandbox league is never saved */w.updated=new Date().toISOString().slice(0,16).replace('T',' ');if(ACTIVE.cid===w.id)ACTIVE.world=w;const doit=()=>{const m=me();return Store.put('mgrCareers',w.id,{name:m.name,ludus:m.ludus,week:w.week,season:w.season,custom:!!m.custom,dead:!!w.dead,fame:m.fame,coin:m.coin,wins:m.wins,bouts:m.bouts,betNet:m.betNet||0,deaths:m.deaths||0,updated:w.updated,world:JSON.stringify(w)}).catch(()=>{})};clearTimeout(mgrSaveT);if(now)return doit();mgrSaveT=setTimeout(doit,400)}

/* ---------- the ACTIVE lanista: the career whose treasury bankrolls wagers everywhere ---------- */
const ACTIVE={cid:null,world:null};
/* activeCid — the id of the ACTIVE career (the one whose treasury bankrolls wagers), from Store wallet/active. */
async function activeCid(){const a=await Store.getDoc('wallet','active').catch(()=>null);return a&&a.cid||null}
/* setActiveCareer — makes a career the active wallet. */
async function setActiveCareer(cid){await Store.put('wallet','active',{cid}).catch(()=>{});MGR.activeCid=cid;if(ACTIVE.cid!==cid){ACTIVE.cid=null;ACTIVE.world=null}}
/* activeMgrWorld — the active career's world (the open one, a cached copy, or loaded and migrated). */
async function activeMgrWorld(){
  const cid=await activeCid();if(!cid)return null;
  if(MGR.world&&MGR.world.id===cid)return MGR.world;
  if(ACTIVE.cid===cid&&ACTIVE.world)return ACTIVE.world;
  const d=await Store.getDoc('mgrCareers',cid).catch(()=>null);if(!d||!d.world)return null;
  ACTIVE.cid=cid;ACTIVE.world=mgrMigrate(JSON.parse(d.world));return ACTIVE.world;
}
/* worldMe — the player's lanista in a given world. */
const worldMe=world=>world&&world.mgrs.find(m=>m.id===world.playerId)||null;
/* activeMgr — the active career's lanista (null when none or the house is dead). */
async function activeMgr(){const w=await activeMgrWorld();const m=worldMe(w);return m&&!(w&&w.dead)?m:null}
/* applyActivePurse — writes a wager purse settled outside Manager mode into the active career's treasury and saves it. */
async function applyActivePurse(v){ // a wager settled outside the manager UI writes straight into the active career's treasury
  const w=await activeMgrWorld();const m=worldMe(w);if(!m)return;
  const d=v.coin-m.coin;m.coin=v.coin;if(!v.noBet)m.betNet=(m.betNet||0)+d;m.betWon=v.won||0;m.betLost=v.lost||0;m.betCount=v.bets||0;m.betHistory=(v.history||[]).slice(-40);
  if(MGR.world===w){saveWorld(true);return}
  w.updated=new Date().toISOString().slice(0,16).replace('T',' ');
  await Store.put('mgrCareers',w.id,{name:m.name,ludus:m.ludus,week:w.week,season:w.season,custom:!!m.custom,dead:!!w.dead,fame:m.fame,coin:m.coin,wins:m.wins,bouts:m.bouts,betNet:m.betNet||0,deaths:m.deaths||0,updated:w.updated,world:JSON.stringify(w)}).catch(()=>{});
}

/* ---------- fighters ---------- */
/* motivesFor — a fighter's three motives with weights 0.5 / 0.3 / 0.2, from their personality (home and arena time rolled). */
function motivesFor(pers){
  const w={coin:pers.coin,glory:pers.aggression,honor:pers.loyalty,spectacle:pers.cf,training:pers.survival,home:35+rnd(40),playing:30+rnd(50)};
  const ks=Object.keys(w).sort((a,b)=>w[b]+Math.random()*30-(w[a]+Math.random()*30)).slice(0,3);return [[ks[0],0.5],[ks[1],0.3],[ks[2],0.2]];
}
// class follows age: the young arrive in chains or from the legions; the old re-badge as Veteranus
function ageClass(age){
  if(age<21)return pickOne(['slave','slave','slave','soldier','venatore','damnatio']);
  if(age<30)return pickOne(['soldier','hero','royalty','amazonia','venatore','slave','damnatio','soldier']);
  if(age>=40)return pickOne(['veteranus','veteranus','veteranus','veteranus','veteranus','hero']);
  return pickOne(['veteranus','veteranus','veteranus','hero','soldier','royalty']);
}
/* genGlad — a generated league fighter: age, gender, class by age, personality, rating and potential, record, fame, motives, hidden gem / bust (opts can fix any of it). TWEAK: the age spread, the .10/.05 gem and .08 bust chances. */
function genGlad(opts={}){
  const age=opts.age??(opts.rookie?16+rnd(6):Math.random()<.16?36+Math.floor(Math.random()*Math.random()*45):19+rnd(17)); // 16-21 rookies; 19-35 mostly — and v0.22: the odd grizzled sand-hand of 36 to 80, who fights as a Veteranus
  // gender: roughly one fighter in five is a gladiatrix, and most gladiatrices train as Amazonia
  let fem=opts.fem??(opts.cls==='amazonia'||Math.random()<.2);
  const cls=opts.cls||(fem&&Math.random()<.6?'amazonia':ageClass(age));if(cls==='amazonia')fem=true;
  const pers=rollPersonality(cls);
  let ovr=opts.ovr??Math.round(clamp(42+Math.random()*22+Math.random()*Math.random()*30,38,92));
  if(opts.ovr==null&&age<21)ovr=clamp(ovr-8,36,68); // the young start low — but the old are NOT automatically good; some just lasted
  let pot=clamp(ovr+Math.round(Math.random()*(opts.rookie||age<23?26:age>=32?6:12)),ovr,97);
  // events come with AGE, not skill: an old journeyman has a long mediocre record; wins come from skill × luck
  const ev=opts.rookie?0:rnd(Math.max(1,Math.round((age-16)*1.1)));
  const w=Math.round(ev*clamp(((ovr-40)/90)*(0.4+Math.random()*0.9),0.02,0.75));
  // gems and the overhyped (CFB-style): hidden until scouted twice or taken to a trial bout
  const gem=Math.random()<(opts.rookie?.10:.05),bust=!gem&&Math.random()<.08;
  if(gem)pot=clamp(pot+8+rnd(10),ovr+6,99);if(bust)pot=clamp(ovr+rnd(3),ovr,99);
  const id='g'+Date.now().toString(36)+rnd(46656).toString(36);
  return {id,name:opts.name||genName({female:fem}),fem,cls,src:opts.src||'gen',srcId:opts.srcId||null,city:opts.city||pickOne(HOME_CITIES()),pers,ovr,pot,age,gem:gem?1:0,bust:bust?1:0,look:null,debut:null,pubNoise:Math.round((Math.random()-.5)*2*Math.max(3,12-ev))+(gem?-3:0)+(bust?5:0),
    fame:clamp(Math.round((ovr-40)*1.3+w*3+rnd(8)),0,100),rec:{ev,w,surv:Math.round(ev*0.6),kp:rnd(w+1),kn:rnd(ev+1)},morale:60+rnd(25),contract:null,motives:motivesFor(pers),interest:{},scout:0,report:null,severed:[],unsigned:0,visits:{},alive:true,rookie:!!opts.rookie};
}
// every league fighter has a face (deterministic from their id, like arena saves); amazonia are gladiatrices
function gLook(glad){if(!glad.look){glad.look=gladPortrait(glad.id||glad.name,glad.cls)}if(glad.fem){glad.look.fem=true;glad.look.beard=false}
  const fk=typeof CITY_FLAG!=='undefined'&&glad.city?CITY_FLAG[glad.city]:null; // v0.22: league portraits fly their home city's banner
  if(fk&&(typeof SETTINGS==='undefined'||SETTINGS.banners!==false))return {...glad.look,bg:'flag:'+fk};return glad.look}
/* gSex — ♀ / ♂ marker. */
const gSex=glad=>glad.fem?'<span title="Female — a gladiatrix" style="color:#e07b9a">♀</span>':'<span title="Male" style="color:#7fa6c9">♂</span>';
/* gAge — a fighter's age (24 when unknown). */
const gAge=glad=>glad.age||24;
/* gladFromLudus — a Ludus Flavius record joins the league as a fighter (rating from their record, their face, severed limbs). */
function gladFromLudus(rec){
  const ovr=clamp(Math.round(50+(rec.wins||0)*4+(rec.events||0)*1.5+(rec.kP||0)*2+(rec.kN||0)+(rec.cf||0)/6),45,92);
  const g=genGlad({cls:CLASSES[rec.cls]?rec.cls:'soldier',ovr,name:rec.name,src:'ludus',srcId:rec.id});
  if(rec.pers)g.pers={...rec.pers};g.rec={ev:rec.events||0,w:rec.wins||0,surv:rec.events||0,kp:rec.kP||0,kn:rec.kN||0};g.severed=[...(rec.severed||[])];g.cpuSaved=!!rec.cpu;g.fame=clamp(Math.round(ovr*0.7+(rec.wins||0)*5),0,100);g.pubNoise=Math.round((Math.random()-.5)*6);
  g.age=clamp(21+Math.round((rec.events||0)*0.8),19,36);if(rec.portrait)g.look={...rec.portrait};g.fem=!!(rec.portrait&&rec.portrait.fem)||g.cls==='amazonia'; // arena veterans arrive with their arena face and the years to match
  return g;
}
/* gladFromCustom — a Creator Studio character joins the league (rating from their point cost). */
function gladFromCustom(character){
  const ovr=clamp(Math.round(48+charCost(character)*1.3),45,84);const g=genGlad({cls:'cc_'+character.id,ovr,name:character.name,src:'custom',srcId:character.id,city:character.city});
  g.pers={...character.pers};g.motives=motivesFor(g.pers);g.rec={ev:(character.events||[]).length,w:(character.events||[]).filter(e=>e.won).length,surv:(character.events||[]).length,kp:0,kn:0};return g;
}
/* pubOvr — the public rating: the true one plus the fighter's public noise. */
const pubOvr=glad=>clamp(effOvr(glad)+Math.round(glad.pubNoise||0),30,99);
// what your scouts believe: exact once scouted twice, a narrow range after one scouting, the public rating otherwise
function estOvr(glad){const s=glad.scout||0;if(s>=2||(glad.contract&&glad.contract.mgr===W_().playerId))return {v:effOvr(glad),txt:String(effOvr(glad))};if(s===1){const lo=effOvr(glad)-3,hi=effOvr(glad)+3;return {v:effOvr(glad),txt:`${lo}–${hi}`}}return {v:pubOvr(glad),txt:`~${pubOvr(glad)}`}}
// v0.28: stars know their worth — a 4★ asks a quarter more, a 5★ half again (the blue-chip premium)
const STAR_PREM=[1,1,1,1.08,1.25,1.5];
/* askWage — the weekly wage a fighter asks: rating, fame and the star premium (× WAGE_MUL). TWEAK: the 3 + 0.55 per point over 40. */
const askWage=glad=>Math.max(3,Math.round((3+(effOvr(glad)-40)*0.55+glad.fame*0.05)*STAR_PREM[starsOf(effOvr(glad))]*(typeof WAGE_MUL!=='undefined'?WAGE_MUL:1))); // v0.68: WAGE_MUL (87-v67) scales every ask
/* v0.28 MONEY TALKS (the NIL rule): what you actually PUT ON THE TABLE outweighs everything else.
   Every coin a week over their ask adds interest; pay enough and even the fame gate opens —
   a humble ludus CAN land a blue-chip fighter, if it pays like a palace. */
const coinPull=(glad,offer)=>{const ask=askWage(glad);return clamp(Math.round((offer/ask-1)*90),0,70)};
/* fameBypassX — how many times the ask a lanista below the fame gate must pay to sign this fighter anyway. */
const fameBypassX=(glad,mgr)=>1.35+Math.max(0,reqFame(glad)-(mgr.fame||0))/45; // multiple of the ask that buys past the fame gate
/* v0.22 MORALE ON THE SAND: spirits change how a fighter walks out. 80+ = high spirits (+1 AP, +1 CF, bolder);
   35-79 = steady; under 35 = low (−1 AP, more cautious); under 20 = broken (fights a tier worse). */
const moraleTier=morale=>morale>=80?'high':morale>=35?'steady':morale>=20?'low':'broken';
const MORALE_TXT={high:_T('High spirits: +1 AP and +1 CF when the bout begins, and a bolder fighter'),steady:_T('Steady: no effect on the sand'),low:_T('Low spirits: −1 AP when the bout begins, and a more cautious fighter'),broken:_T('Broken: −1 AP and they fight a whole tier worse (their skill deserts them)')};
/* boostFor — what a fighter brings onto the sand from rating and morale: CPU difficulty, extra AP, coin and CF. TWEAK: the (ovr−62)/6 AP and (ovr−70)/5 coin steps. */
function boostFor(glad){const o=effOvr(glad);const mt=moraleTier(glad.morale??60);const tiers=['easy','normal','hard'];let di=o>=80?2:o>=60?1:0;if(mt==='broken')di=Math.max(0,di-1);
  return {diff:tiers[di],ap:clamp(Math.round((o-62)/6)+(mt==='high'?1:mt==='low'||mt==='broken'?-1:0),0,5),coin:clamp(Math.round((o-70)/5),0,4),cf:(mt==='high'?1:0)+(glad.cfBank||0),mt}}
/* seatFor — an engine seat for a league fighter: class, mind, personality nudged by morale, rating, boosts (armory, scouted arena, city kit) and severed limbs. */
function seatFor(glad,mgrColor,human=false){const b=boostFor(glad);/* v0.30: the city-shop kit rides in */const w9=W_();if(glad.kit&&glad.kit.length&&w9&&glad.kitWk===w9.week){b.festItems=[...(b.festItems||[]),...glad.kit]}
  const w0=W_();if(w0&&w0.night&&w0.night.scouted&&glad.contract&&mgrById(glad.contract.mgr)&&mgrById(glad.contract.mgr).isPlayer){b.coin+=1;b.ap+=1} /* scouted the arena: your fighters arrive knowing the ground (+1 AP, +1 coin) */ const cls=CLASSES[glad.cls]?glad.cls:'soldier';const pers0={...glad.pers};if(b.mt==='high'){pers0.aggression=clamp((pers0.aggression||50)+10,1,100);pers0.survival=clamp((pers0.survival||50)-8,1,100)}else if(b.mt==='low'||b.mt==='broken'){pers0.survival=clamp((pers0.survival||50)+12,1,100);pers0.aggression=clamp((pers0.aggression||50)-10,1,100)}
  const fm=glad.contract?mgrById(glad.contract.mgr):null;const arm=fm&&typeof facLvl==='function'?facLvl(fm,'armory'):0;if(arm)b.ap=Math.min(6,b.ap+arm);
  return {cls,cpu:!human,diff:b.diff,name:glad.name,city:glad.city||null,pers:pers0,rating:effOvr(glad),mgrGid:glad.id,mgrColor,boost:{ap:b.ap,coin:b.coin,cf:b.cf},festItems:b.festItems||undefined,severed:[...(glad.severed||[])]}}

/* ---------- how fighters see a lanista ---------- */
/* winPct — a lanista's win rate (0.25 before any bouts). */
function winPct(mgr){return mgr.bouts?mgr.wins/mgr.bouts:0.25}
/* mgrScore — how a fighter grades a ludus on one motive, 0–100 (coin, glory, honor, spectacle, training, home, arena time). TWEAK: the weights in each case. */
function mgrScore(mgr,mot,glad){
  const P=mgr.p;
  switch(mot){
    case 'coin':return clamp(18+Math.min(55,mgr.coin/7)+P.ambition*0.25-P.greed*0.35+clamp((mgr.betNet||0)/25,-5,10),0,100);
    case 'glory':return clamp(mgr.fame*0.85+winPct(mgr)*40,0,100);
    case 'honor':return clamp(P.honor-(mgr.poached||0)*9-(mgr.broken||0)*6+(mgr.kept||0)*3,0,100);
    case 'spectacle':return clamp(P.show*0.62+mgr.fame*0.4+(typeof facLvl==='function'?facLvl(mgr,'stands')*6:0),0,100);
    case 'training':return clamp(P.discipline*0.85+(mgr.improved||0)*1.5+(typeof facLvl==='function'?facLvl(mgr,'yard')*8:0)+Math.min(20,(mgr.dev||0)/4),0,100); // v0.29: recruits notice a house that invests in its fighters
    case 'home':{if(!glad)return 50;const [a,b]=cityXY(mgr.city),[c,d]=cityXY(glad.city);return clamp(Math.round(100-Math.hypot(a-c,b-d)*110),0,100)}
    case 'playing':{const w2=W_();const n=w2?rosterOf(mgr).length:3;return clamp(100-Math.max(0,n-5)*8*(w2?RL(w2,'arena'):0.6),0,100)} // arena time: the first three places are free; the Sandbox slider sets how hard a big stable weighs
  }
  return 50;
}
/* reqFame — the fame a lanista needs before this fighter will listen (by stars). */
const reqFame=glad=>STAR_FAME[starsOf(effOvr(glad))];
/* baseInterest — a fighter's interest in a ludus: their three motives weighed by its grades, plus record, facilities and home city; capped at 22 below the fame gate. */
function baseInterest(mgr,glad){let v=0;for(const [k,w] of glad.motives)v+=w*mgrScore(mgr,k,glad);v=v*0.55;
  if(mgr.bouts>=4)v+=(mgr.wins/mgr.bouts-0.4)*22; // the ludus record talks: fighters want to sign with proven winners
  if(typeof facSum==='function')v+=facSum(mgr)*1.2; // v0.28: the ludus grade — recruits tour the facilities
  if(glad&&mgr.city&&glad.city===mgr.city)v+=8; // v0.36: a fighter from your ludus's own city leans your way
  if(mgr.fame<reqFame(glad))v=Math.min(v,22);return Math.round(v)}
/* interestOf — a fighter's (cached) interest in a lanista. */
const interestOf=(glad,mgr)=>glad.interest[mgr.id]??(glad.interest[mgr.id]=baseInterest(mgr,glad));
/* capInterest — clamps interest to 0–100 (35 below the fame gate). */
function capInterest(glad,mgr,v){return mgr.fame<reqFame(glad)?Math.min(v,35):clamp(v,0,100)}
/* suitors — every lanista ranked by this fighter's interest. */
function suitors(glad){return W_().mgrs.map(m=>({m,v:interestOf(glad,m)})).sort((a,b)=>b.v-a.v)}
/* loyaltyOf — a signed fighter's loyalty to their lanista: honor, morale, greed and bonds (loyB). TWEAK: the weights. */
function loyaltyOf(glad){if(!glad.contract)return 0;const m=mgrById(glad.contract.mgr);return clamp(Math.round(35+m.p.honor*0.3+glad.morale*0.35-m.p.greed*0.15+(glad.loyB||0)),10,95)} // loyB: bonds earned by your retention actions
/* stageOf — where a fighter stands with you, in words (signed, won't consider you, leaning your way, top 3…). */
function stageOf(glad){const s=suitors(glad);const mine=interestOf(glad,me());const rank=s.findIndex(x=>x.m===me())+1;
  if(glad.contract&&glad.contract.mgr===me().id)return _T('Signed with you');if(me().fame<reqFame(glad))return _T`Won't consider you: wants a ${mgrTier(reqFame(glad))} ludus (fame ${reqFame(glad)}+)`;
  if(glad.contract)return _T`Signed with ${mgrById(glad.contract.mgr).name} · loyalty ${glad.scout?loyaltyOf(glad):'?'}`;
  if(rank===1&&mine>=55)return _T('Leaning your way');if(rank<=3&&mine>=35)return _T`Top 3 (#${rank})`;if(mine>=20)return _T('Listening');return _T('Barely aware of you');}

/* ---------- a new world ---------- */
// old saves: give everyone an age/debut, convert the old numeric training budget to a regime
const RULES_DEF={death:80,blood:100,inj:100,gain:100,rookies:100,rand:100,arena:60,rookmercy:50}; /* v0.21: a gentler default league — 20% baseline clemency, rookies (≤3 bouts) spared half the time */
/* RL — a world's sandbox rule as a multiplier (100 = 1.0). */
const RL=(world,k)=>((world.rules||RULES_DEF)[k]??100)/100;
/* mgrMigrate — upgrades an older saved world in place (rules, ages, debuts, training regime). */
function mgrMigrate(world){if(!world||!world.glads)return world;
  world.rules={...RULES_DEF,...(world.rules||{})};if(!world.festPick)world.festPick='ludi';
  for(const g of world.glads){if(!g.age)g.age=clamp(18+rnd(17)+Math.round(((g.rec&&g.rec.ev)||0)/4),17,38);if(!g.debut)g.debut={s:1,wk:1};if(g.fem==null)g.fem=g.cls==='amazonia'||!!(g.look&&g.look.fem)}
  if(typeof world.train==='number')world.train=world.train<=0?'off':world.train<=10?'light':world.train<=22?'std':'hard';
  return world}
/* newWorld — creates a new career world: the preset houses (yours custom or taken over), old rivalries, the fighter pool (generated, Ludus Flavius, custom characters), rival rosters, a mid-season join, then the first match night. TWEAK: the 58 generated fighters. */
function newWorld(choice){
  const w={id:'c'+Date.now().toString(36),v:1,tutorial:!!choice.tutorial,rules:{...RULES_DEF,...(choice.rules||{})},spectOK:choice.spectOK!==false,festPick:choice.festPick||'ludi',created:new Date().toISOString().slice(0,10),...(()=>{const c=typeof calNow==='function'?calNow():{season:1,week:1};return {week:c.week,season:c.season,startWk:c.week,startSeason:c.season}})(), /* v0.22: a new career joins the empire's calendar where it stands */playerId:null,mgrs:[],glads:[],news:[],night:null,grave:[],hours:0};
  MGR.world=w;
  for(const t of MGR_PRE)w.mgrs.push({id:'m_'+t.key,key:t.key,name:t.name,ludus:t.ludus,city:t.city,color:t.color,p:{...t.p},fame:t.fame,coin:t.coin,wins:0,bouts:0,deaths:0,betNet:0,poached:0,improved:0,bio:t.bio,pre:true,portrait:{skin:pickOne(SKINS),hair:pickOne(HAIRS),helm:pickOne(['none','laurel']),beard:Math.random()<.5,bg:sysBG()}});
  if(choice.type==='custom'){const c=choice.mgr;w.mgrs.push({id:'m_me',name:c.name,ludus:c.ludus,city:c.city,color:c.color,p:{...c.p},fame:0,coin:40+((window.ACH_GOT||{}).veteran?25:0),wins:0,bouts:0,deaths:0,betNet:0,poached:0,improved:0,bio:c.bio||_T('A newcomer with a leaky roof and big dreams.'),custom:true,portrait:c.portrait});w.playerId='m_me'}
  else w.playerId='m_'+choice.key;
  const pm=w.mgrs.find(m=>m.id===w.playerId);pm.isPlayer=true;if(choice.flag)pm.flag=choice.flag;
  if(choice.type==='pre'&&choice.over){const o=choice.over;Object.assign(pm,{name:o.name||pm.name,ludus:o.ludus||pm.ludus,color:o.color||pm.color});if(o.portrait)pm.portrait={...o.portrait};pm.renamedFrom=MGR_PRE.find(t=>t.key===choice.key).ludus}
  // the league did not begin with you: old stables carry old grudges — rival cities, clashing temperaments, stolen fighters
  for(const a of w.mgrs){a.rivals=a.rivals||{};for(const b of w.mgrs){if(a===b)continue;
    const [ax,ay]=cityXY(a.city),[bx,by]=cityXY(b.city);const near=Math.hypot(ax-bx,ay-by)<0.12;
    const clash=Math.abs((a.p.honor||50)-(b.p.honor||50))/100+((a.p.cunning||50)>70&&(b.p.cunning||50)>70?0.3:0);
    const h=Math.round((near?22:0)+clash*40+Math.random()*18-6);if(h>=12)a.rivals[b.id]=clamp(h,12,72)}}
  // a stable you take over brings its feuds with it; a brand-new house is mostly ignored — for now
  for(const m of w.mgrs)if(!m.isPlayer){m.rivalry=choice.type==='pre'?(m.rivals[pm.id]||0):Math.round(Math.random()*8)}
  // the pool: generated fighters, the Ludus Flavius and your custom characters
  for(let i=0;i<58;i++)w.glads.push(genGlad()); // twelve stables need a deeper pool
  if(choice.scattered)for(const g of choice.scattered){if(!w.glads.some(x=>x.name===g.name)){w.glads.push({...g,alive:true});}}
  if(typeof lfPoolOn!=='function'||lfPoolOn())for(const L of LUDUS_CACHE.filter(g=>gladActive(g)&&!isCustomCls(g.cls)))w.glads.push(gladFromLudus(L)); // v0.67: a switch on the start screen
  for(const c of CUSTOM.chars.filter(typeof onRollsR==='function'?onRollsR:onRolls))w.glads.push(gladFromCustom(c)); // only creations on the rolls join the league
  for(let i=0;i<4;i++)w.glads.push(genGlad({rookie:true,ovr:40+rnd(10)}));
  // rival stables fill up from the pool, strongest managers first
  for(const t of MGR_PRE){const m=w.mgrs.find(x=>x.key===t.key);if(m===pm&&choice.type!=='pre')continue;
    for(let k=0;k<t.n;k++){let g=w.glads.filter(g=>!g.contract&&g.src==='gen'&&g.ovr>=t.tier[0]&&g.ovr<=t.tier[1]).sort(()=>Math.random()-.5)[0];if(!g){g=genGlad({ovr:t.tier[0]+rnd(t.tier[1]-t.tier[0])});w.glads.push(g)}
      g.contract={mgr:m.id,wage:askWage(g),weeks:4+rnd(9),since:0};g.morale=55+rnd(30)}}
  if(choice.type==='custom'){const g=genGlad({ovr:44+rnd(7),rookie:true});g.name=genName();g.contract={mgr:pm.id,wage:askWage(g),weeks:8,since:1};g.scout=2;w.glads.push(g);mnews(_T`${esc(pm.name)} opens ${esc(pm.ludus)} in ${esc(pm.city)} with ${coinAmt87(100)} and one raw recruit: ${esc(g.name)}. Nobody in the league has heard of you.`,'big')}
  else mnews(_T`You take the reins of ${esc(pm.ludus)} in ${esc(pm.city)}.`,'big');
  for(const g of w.glads){g.interest={};if(g.contract&&g.contract.mgr===pm.id)g.scout=2;g.debut=g.debut||{s:1,wk:1}} // the founding class all date from S1 W1
  // v0.26 JOINING MID-SEASON: the league did not wait for you. Stables that already existed carry this season's
  // weeks of bouts on their record; a brand-new house starts 0-0 on the empire's current date.
  {const e=((w.week-1)%12);if(e>0){for(const m of w.mgrs){if(m.isPlayer&&choice.type==='custom')continue;const n=rosterOf(m).length;const pw=clamp(.34+(m.fame||0)/260,.3,.72);
      for(let k=0;k<e;k++){const bouts=n>=5?2:1;for(let j=0;j<bouts;j++){m.bouts++;if(Math.random()<pw)m.wins++}}}
    mnews(_T`📅 You join season ${w.season} at week ${e+1}: the league is already ${e} week${e===1?'':'s'} old, and the old stables carry their records into your first match night.`)}}
  w.hours=hoursMax();w.repair=0;makeNight();saveWorld(true);
  if(!choice.tutorial)activeCid().then(c=>{if(!c)setActiveCareer(w.id)}).catch(()=>{}); // the first career becomes the active wallet
  return w;
}
/* hoursMax — recruiting hours a week: 8 + ambition/25. */
const hoursMax=()=>8+Math.round(me().p.ambition/25);
// a lanista in one click, so a wager never has to wait: random gambler, 40 coin, immediately the active wallet
async function quickLanista(){
  await loadCustoms().catch(()=>{});await loadLudus().catch(()=>{});
  const prev=MGR.world;
  const c={name:genName(),ludus:_T('Ludus ')+pickOne(NAMEBANK.cog),city:pickOne(LOCATIONS.slice(1)).n,color:pickOne(['#c0433a','#4f7fc4','#4f9a57','#d4b13c','#dc7a34','#8a5cc0','#5fc7c0','#e07b9a']),p:{...MGR_PRESETS.gambler[1]},portrait:{skin:pickOne(SKINS),hair:pickOne(HAIRS),helm:'laurel',beard:Math.random()<.5,bg:sysBG()}};
  newWorld({type:'custom',mgr:c});const id=MGR.world.id,nm2=me().name,ld=me().ludus;
  await setActiveCareer(id);
  MGR.world=prev||null; // don't hijack whatever career was open in Manager mode
  if(typeof log==='function'&&S)log(_T`A lanista steps up to the bookmaker's table: <b>${esc(nm2)}</b> of ${esc(ld)}, ${coinAmt87(40)} in hand. Shape them any time in Manager mode.`);
  return id;
}

/* ---------- match nights ---------- */
/* makeNight — builds the week's match night from the season fixture: arena (moved if the city is closed), omen and world news on purses, the levy, then rival houses enter fighters (fewest appearances first) and fillNight completes the cards. Wrapped by 59-bye and 63-empire53. */
function makeNight(){
  {const w0=W_(),m0=me();if(w0&&m0)w0.weekStart={coin:m0.coin,fame:m0.fame,wins:m0.wins,bouts:m0.bouts}}
  const w=W_();const grand=false; // v0.28: week 12 is simply the last week of the regular season — the finale is the Flavius Superbus, by invitation
  const FX=fixtureFor(w.season,w.week);const li=FX.loc; // the week's fixture on the shared season schedule
  const omen=rollOmen(); // the week's omen: attendance sways the purses, and the host city's own fighters feel it
  const wkey=`m:${w.id}:${w.season}:${w.week}`;let loc0=li;let wi=typeof worldImpact==='function'?worldImpact(loc0,wkey):{att:0,list:[]}; // the empire's news reaches the gate
  if(wi.closed){ // a war, plague, quake or eruption at the gates: the games move
    /* v0.53: the nearest open arena hosts instead; if none can, the season's one impromptu bye (see 63-empire53) */
    const alt=(typeof nearestOpenCity==='function'?nearestOpenCity(loc0,wkey):null)??([6,4,2,3,7,1,5,8,9,10,11,12].find(li2=>li2!==loc0&&LOCATIONS[li2]&&!worldImpact(li2,wkey).closed)||6);
    if(alt===-1){w.closedBye={week:w.week,from:loc0,why:`${wi.closed.i} ${wi.closed.n}`};loc0=loc0}else{
    mnews(_T`<b>${esc(LOCATIONS[loc0].n)}'s arena is CLOSED</b> — ${wi.closed.i} ${esc(wi.closed.n)}. The editor moves the week's games to ${esc(LOCATIONS[alt].n)}.`,'bad');
    w.moved={week:w.week,from:loc0,to:alt,why:`${wi.closed.i} ${wi.closed.n}`};loc0=alt;wi=worldImpact(loc0,wkey)}}
  const gate=1+(omen.att||0)*0.6+(wi.att||0)*0.6;
  const spec=!/democritus|egidious|cassian/.test(FX.ev);const bouts=['under','feature','main'].map(t=>({tier:t,ev:t==='main'?FX.ev:TIERS[t].ev,purse:Math.max(10,Math.round(TIERS[t].purse*(grand?1.6:1)*(t==='main'?FX.purse:1)*gate)),special:t==='main'&&spec,fee:TIERS[t].fee,ents:[],done:false,res:null,bets:[]}));
  if(typeof calSet==='function'&&typeof calNow==='function'){const c=calNow();const wk12=((w.week-1)%12)+1;if(w.season>c.season||(w.season===c.season&&wk12>=c.week)){calSet(w.season,wk12);try{if(S&&!HEADLESS)render()}catch(e){}}} // the career moves the empire's calendar forward — never back
  w.night={week:w.week,loc:loc0,grand,bouts,omen,fx:FX,world:(wi.list||[]).map(e=>`${e.i} ${e.n} (${e.city})`),wAtt:wi.att||0,wx:typeof weatherAt==='function'&&weatherAt(loc0,wkey)?WEATHER_T[weatherAt(loc0,wkey).t].n:null};
  if((wi.list||[]).length)mnews(_T`World news reaches ${esc(LOCATIONS[loc0].n)}: ${wi.list.map(e=>`${e.i} ${esc(e.n)}`).join('; ')} — attendance ${wi.att>=0?'+':'−'}${Math.abs(Math.round(wi.att*60))}% (purses ${wi.att>=0?_T('up'):_T('down')}).`,Math.abs(wi.att)>=.2?'big':'');
  const L=LOCATIONS[w.night.loc];
  if(omen.k!=='clear')mnews(_T`${omen.n} over ${esc(L.n)}. ${omen.d||''}${omen.att?_T` Attendance ${omen.att>0?'+':'−'}${Math.abs(Math.round(omen.att*60))}%: purses ${omen.att>0?_T('up'):_T('down')} with it.`:''}`,Math.abs(omen.att||0)>=0.25?'big':'');
  for(const g of w.glads.filter(g=>g.alive&&g.city===L.n)){
    const d=(omen.local||0)<0?-4:3;g.morale=clamp(g.morale+d,0,100);
    if(g.contract&&mgrById(g.contract.mgr)&&mgrById(g.contract.mgr).isPlayer)mnews(_T`${esc(g.name)} fights before their home city of ${esc(L.n)} this week${(omen.local||0)<0?_T(' — under a bad omen (morale −4)'):' (morale +3)'}.`)}
  // THE LEVY: a hot war (severity 3) calls men up — soldiers of the sand first
  {const wars=(typeof worldEvents==='function'?worldEvents(wkey):[]).filter(e=>e.war&&e.sev>=3);
   if(wars.length)for(const g of w.glads.filter(g=>g.alive&&!g.inj&&!g.contractHidden)){
     const pSoldier=g.cls==='soldier'?0.05:g.cls==='veteranus'?0.02:0.006;
     if(Math.random()>=pSoldier)continue;const e=pickOne(wars);const m2=g.contract?mgrById(g.contract.mgr):null;
     if(m2&&m2.isPlayer){ // the levy officer calls at YOUR gate — and officers have prices
       const price=Math.round(12+effOvr(g)*0.5+(g.fame||0)*0.25);(w.pend=w.pend||[]).push({t:'levy',gid:g.id,f:0,price,war:{foe:e.war.foe,rome:e.war.rome,city:e.city},until:w.week+2+rnd(3)});
       mnews(_T`⚔️ The levy officer calls at ${esc(m2.ludus)} for <b>${esc(g.name)}</b>: ${esc(e.war.rome)} march against ${esc(e.war.foe)}. He can be persuaded otherwise — for ${coinAmt87(price)}.`,'bad');
       tnews(_T`The levy wants ${esc(g.name)}. Bribe the officer (${coinAmt87(price)}) on Match Week, or watch them march.`,'bad');continue}
     g.inj={until:w.week+2+rnd(3),label:_T`serving with ${e.war.rome} against ${e.war.foe}`,pen:0,war:{foe:e.war.foe,rome:e.war.rome,city:e.city}};
     ghist(g,_T`called up: marched with ${e.war.rome} against ${e.war.foe}`);
     mnews(_T`⚔️ <b>${esc(g.name)}</b>${m2?` (${esc(m2.ludus)})`:''} is called to the standards: ${esc(e.war.rome)} march against ${esc(e.war.foe)} at ${esc(e.city)}.`,m2&&m2.isPlayer?'bad':'');
     if(m2&&m2.isPlayer)tnews(_T`${esc(g.name)} was conscripted — ${esc(e.war.rome)} against ${esc(e.war.foe)}. Pray.`,'bad')}}
  // rival lanistae enter their fighters: one per bout, best fighters in the biggest bout they fit
  const used=new Set();
  /* v0.43 A FAIR SEASON: houses no longer queue in a fixed order. Those with the fewest appearances this season
     choose first (ties shuffled), each house enters ONE fighter per night on the first pass, and only seats still
     open afterwards go to a house's second fighter — so every stable fights and builds a record. */
  const apps=mgr=>((mgr.apps||{})[w.season]||0);
  const houses=w.mgrs.filter(m=>!m.isPlayer&&!m.dead).map(m=>({m,k:apps(m)+Math.random()*0.9})).sort((a,b)=>a.k-b.k).map(x=>x.m);
  const enter=(mgr,b,glad)=>{b.ents.push(glad.id);used.add(glad.id);mgr.apps=mgr.apps||{};mgr.apps[w.season]=(mgr.apps[w.season]||0)+1};
  for(const pass of [1,2])for(const m of houses){if(pass===2&&Math.random()<0.5)continue;const ros=rosterOf(m).filter(g=>g.morale>15&&!g.inj&&!used.has(g.id)).sort((a,b)=>effOvr(b)-effOvr(a));
    for(const b of [...bouts].reverse()){if(b.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===m.id}))continue; // never two of one house in one bout
      const T=TIERS[b.tier];const g=ros.find(g=>!used.has(g.id)&&(!g.starChild||(typeof starChildFights==='function'&&starChildFights(g,b,w)))&&effOvr(g)>=T.lo-4&&effOvr(g)<=T.hi+2);if(g&&b.ents.length<boutSize(b)-1&&Math.random()<0.62+m.p.risk/250){enter(m,b,g);break}}}
  w.night.used=[...used];
  fillNight();
  if(typeof specWeekStart==='function')try{specWeekStart(w)}catch(e){console.error(e)}
}
/* boutSize — how many fighters a bout seats (4, or what a special's rules allow). */
const boutSize=bout=>{const E=EVENTS[bout.ev];if(!E)return 4;return clamp(4,E.min,E.max)}; // specials seat what their rules allow (3 for Triumviratus, 6 for Naumachia…)
/* fillNight — fills empty bout places with free agents in the band, then the nearest-rated, then new fighters. */
function fillNight(){
  const w=W_(),n=w.night;const used=new Set(n.bouts.flatMap(b=>b.ents));
  for(const b of n.bouts){const T=TIERS[b.tier];const need=boutSize(b);
    const pool=freeAgents().filter(g=>!used.has(g.id)&&!g.inj&&effOvr(g)>=T.lo-3&&effOvr(g)<=T.hi+3).sort(()=>Math.random()-.5);
    while(b.ents.length<need&&pool.length){const g=pool.pop();b.ents.push(g.id);used.add(g.id)}
    /* v0.67: the league pool first — the nearest-rated free agents outside the band — and a new fighter only when none is left */
    if(b.ents.length<need){const mid=(T.lo+T.hi)/2;const near=freeAgents().filter(g=>!used.has(g.id)&&!g.inj).sort((x,y)=>Math.abs(effOvr(x)-mid)-Math.abs(effOvr(y)-mid));
      while(b.ents.length<need&&near.length){const g=near.shift();b.ents.push(g.id);used.add(g.id)}}
    while(b.ents.length<need){const g=genGlad({ovr:clamp(T.lo+rnd(Math.min(20,T.hi-T.lo)),40,90)});g.debut={s:w.season,wk:w.week};w.glads.push(g);b.ents.push(g.id);used.add(g.id)}
  }
}
/* A bout result, in plain words. In the league, being ELIMINATED (beaten on the sand) is not death:
   the editor grants missio and the fighter returns to their ludus. Only a thumb-down (Fate 10 CF or
   less, one in three) — or the world outside the arena — actually kills a fighter. */
function boutFate(row){ // a bout result in the game's own words: the Fate each fighter met
  const fn=row.fname?` <span class="rc-sub">${esc(row.fname)}</span>`:'';
  const W=row.won?'<b style="color:var(--gold2)">🏆 won</b> · ':'';
  switch(row.vd){
    case 'ludus':return W+`<span title="${_T`20-49 CF: Survival — back to the Ludus Flavius`}">🛡 survived</span>`;
    case 'spared':return W+`<span style="color:var(--gold2)" title="${_T`17-19 CF: the d6 showed 4-6 — the thumb went up`}">${_T`👍 thumb up — spared`}</span>`;
    case 'clemency':return W+`<span style="color:#e0a060" title="${_T`Condemned by the Fate table, but the editor waved it away (sandbox clemency)`}">🕊 condemned · clemency</span>${fn}`;
    case 'bought':return W+`<span style="color:#e0a060" title="${_T`Condemned by the Fate table, but their lanista paid the editor blood money`}">${_T`💰 condemned · bought back`}</span>${fn}`;
    case 'killed':return W+`<b style="color:var(--blood2)" title="${_T`Condemned by the Fate table and nobody paid: gone from the league for good`}">✝ killed</b>${fn}`;
    case 'freed':return W+`<b style="color:var(--gold2)" title="${_T`50+ CF: took the rudis and left the league a free person`}">${_T`🗡 took the rudis — freed`}</b>`;
    case 'rudis-stay':return W+`<span style="color:var(--gold2)" title="${_T`50+ CF: earned the rudis, chose to keep fighting`}">${_T`🗡 earned the rudis — fights on`}</span>`;
    case 'p-thumb':return W+_T('<b style="color:var(--gold2)">⏳ awaiting the thumb</b>');
    case 'p-blood':return W+_T`<b style="color:#e0a060">⏳ condemned — your call</b>${fn}`;
    case 'p-rudis':return W+_T('<b style="color:var(--gold2)">⏳ the rudis — your call</b>');
  }
  // no verdict recorded (older saves): judge by the printed table, never call a sub-20 fighter a survivor
  const g=gById(row.gid);const W2=row.won?'<b style="color:var(--gold2)">🏆 won</b> · ':'';
  if(g&&!g.alive)return W2+'<b style="color:var(--blood2)">✝ killed</b>';
  const F=fateRow(row.f||0);return W2+(F.g==='Survival'||F.g==='Freedom'?'🛡 survived':`<span title="${_T`Condemned by the Fate table (${esc(F.g)} · ${esc(F.n)}); this bout predates verdict records`}">⚖ ${esc(F.n)}</span>`);
}
/* boutProbs — win chances in a bout from ratings (public for the book, your scouts' for yours). TWEAK: the 6.5 softness. */
function boutProbs(bout,mode){ // mode 'book' uses public ratings, 'mine' your scouts' estimates
  const gs=bout.ents.map(gById);const r=gs.map(g=>mode==='book'?pubOvr(g):estOvr(g).v);
  const mx=Math.max(...r);const ex=r.map(v=>Math.exp((v-mx)/6.5));const z=ex.reduce((a,c)=>a+c,0);return ex.map(e=>e/z);
}
/* boutOdds — the bookmaker's odds for each fighter in a bout (1.1–25×). */
const boutOdds=bout=>boutProbs(bout,'book').map(p=>Math.max(1.1,Math.min(25,Math.round(10/(p*HOUSE))/10)));
/* rigCost — what fixing a bout costs: 60% of the purse + 15. */
const rigCost=bout=>Math.round(bout.purse*0.6+15);
/* voidBets — v0.67: a fighter taken off a card (your entry replaced them, a withdrawal, the Gambit) voids every wager on them:
   the stake returns to the treasury and the slip reads "void" in the betting log */
function voidBets(bout,gid){if(!bout||!bout.bets||!gid)return 0;const m=me();let back=0;
  bout.bets=bout.bets.filter(bt=>{if(bt.gid!==gid)return true;back+=bt.stake;m.coin+=bt.stake;
    try{const r=betlogLoad().find(x=>x.id===bt.bid);if(r){r.status='void';r.pay=bt.stake;r.settled=new Date().toISOString();betlogSave()}}catch(e){}return false});
  if(back)setTimeout(()=>{try{mToast(_T`↩ Your ${back}-coin wager on ${esc((gById(gid)||{}).name||_T('that fighter'))} is void — they are off the card. Stake returned.`)}catch(e){}},60);return back}
/* boutRiggable — a bout can be fixed only with your fighter AND a rival's on the card, and no wager of yours on it. */
function boutRiggable(bout){const m=me();if(bout.done||bout.rig||(bout.bets||[]).length)return false; // v0.29: no fixing a bout you have money on
  const mine=bout.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===m.id});
  const theirs=bout.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr!==m.id});
  return mine&&theirs}
/* v0.22: fight cards name the sides — teams, the Juggernaut, co-op allies */
function boutSide(bout,i){const E=EVENTS[bout.ev]||{};if(E.coop)return {k:'A',n:'Allies',col:'#9bd070'};if(E.teams==='jugg')return i===0?{k:'J',n:'Juggernaut',col:'#ff6a55'}:{k:'T',n:'The team',col:'#6fb0e6'};if(E.teams)return i%2?{k:'B',n:'Team B',col:'#6fb0e6'}:{k:'A',n:'Team A',col:'#e0a33a'};return null}
/* boutSidesHTML — the sides line of a team / Juggernaut / co-op bout. */
function boutSidesHTML(bout){const E=EVENTS[bout.ev]||{};if(!E.teams&&!E.coop)return '';const nm=id=>{const g=gById(id);return g?esc(g.name):'?'};
  if(E.coop)return `<p class="sides">${_T`🤝 <b>Co-op:</b> ${bout.ents.map(nm).join(', ')} fight together against the beasts.`}</p>`;
  if(E.teams==='jugg')return `<p class="sides"><span class="sidetag" style="--sc:#ff6a55">${_T`👑 Juggernaut`}</span> ${_T`<b>${nm(bout.ents[0])}</b> — drafts 7 picks — <i>versus</i>`} <span class="sidetag" style="--sc:#6fb0e6">${_T`The team`}</span> ${bout.ents.slice(1).map(nm).join(', ')}</p>`;
  const A=bout.ents.filter((_,i)=>i%2===0),B=bout.ents.filter((_,i)=>i%2===1);
  return `<p class="sides"><span class="sidetag" style="--sc:#e0a33a">${_T`Team A`}</span> ${_T`${A.map(nm).join(' & ')} <i>versus</i>`} <span class="sidetag" style="--sc:#6fb0e6">${_T`Team B`}</span> ${B.map(nm).join(' & ')}</p>`}
/* v0.34: the lanista himself, as a fighter — an old hand, mediocre-average next to the active
   gladiators (rating ~44-60, nudged by fame). Created only when the Gambit is actually taken. */
/* lanistaGlad — the lanista as a fighter (the Debtor's Gambit): an old Veteranus rated ~44–60. */
function lanistaGlad(world,mgr){
  let g=world.glads.find(x=>x.lanista&&x.contract&&x.contract.mgr===mgr.id&&x.alive);
  if(g)return g;
  g=genGlad({cls:'veteranus',age:42+rnd(12),fem:false,ovr:clamp(44+Math.round(mgr.fame/10)+rnd(8),44,60)});
  g.name=mgr.name;g.city=mgr.city;g.lanista=1;g.pot=g.ovr;g.gem=false;g.bust=false;g.inj=null;
  g.contract={mgr:mgr.id,wage:0,weeks:99,bonus:0};g.morale=55;g.scout=3;g.debut={s:world.season,wk:world.week};
  world.glads.push(g);return g}
/* boutCfg — the startEvent config of a match-night bout (seats, teams, the Gambit truce, options, mgrCtx); fightGid hands one fighter to the human. */
function boutCfg(bout,watch,fightGid=null){ // fightGid: hand that fighter's reins to the human player for a live bout
  const w=W_();const E=EVENTS[bout.ev]||EVENTS.democritus;
  const seats=bout.ents.map((id,i)=>{const g=gById(id);const m=g.contract?mgrById(g.contract.mgr):null;const st=seatFor(g,m?m.color:null,id===fightGid);
    if(E.classes&&!E.classes.includes(st.cls))st.cls=E.classes[i%E.classes.length]; // a special with fixed classes re-badges for the night
    if(E.coop)st.team='A';else if(E.teams==='jugg')st.team=i===0?'J':'T';else if(E.teams)st.team=i%2?'B':'A';
    return st});
  // no two fighters of one class share a color; duplicates are fine in the engine
  // the Debtor's Gambit: the lanista and his chosen fighter enter under one banner — a truce, until the end
  const ts=(()=>{const ud=w.underdog;if(ud&&ud.fighting&&ud.ally&&bout.ents.includes(ud.gid)&&bout.ents.includes(ud.ally))return [bout.ents.indexOf(ud.gid),bout.ents.indexOf(ud.ally)];return null})();
  return {ev:bout.ev,loc:w.night.loc,seats,truceSeats:ts,opts:{mods:true,mandata:true,optOffers:true,eaglePot:true,spect:watch?'auto':0},mgrTier:bout.tier,omen:w.night.omen||null,mgrWorldId:w.id,mgrCtx:{cid:w.id,week:w.week,bout:w.night.bouts.indexOf(bout),name:me().name}};
}
/* runBoutSim — simulates a bout off-screen and applies the result. */
async function runBoutSim(boutIdx){
  const w=W_(),b=w.night.bouts[boutIdx];if(b.done)return;
  const res=await simEvent(boutCfg(b,false));if(res&&!res.error)applyBout(boutIdx,res);else{mnews(_T`The ${TIERS[b.tier].n} was called off (${esc(res&&res.error||_T('no result'))}).`,'bad');b.done=true}
}
/* watchBout — plays a bout live on the board (fight = you control your fighter). */
function watchBout(boutIdx,fight=false){
  const w=W_(),b=w.night.bouts[boutIdx];if(b.done)return;
  // fight=true: you don't watch your fighter — you ARE your fighter, live on the board
  let fightGid=null;
  if(fight){const meId=me().id;
    const ud9=w.underdog&&w.underdog.fighting&&b.ents.includes(w.underdog.gid)?w.underdog.gid:null; // the Gambit: YOU are the lanista, not the ally
    fightGid=ud9||b.ents.find(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===meId})||null}
  saveWorld(true);modalDismiss();
  const cfg=boutCfg(b,true,fightGid);S&&(S.over=true);startEvent(cfg);
}
/* mgrAfterWatch — after a watched bout: everyone in it gets scouted, good free agents go on your board, then the result is applied. */
async function mgrAfterWatch(res,ctx){
  if(!MGR.world||MGR.world.id!==ctx.cid){const d=await Store.getDoc('mgrCareers',ctx.cid);if(!d)return;MGR.world=mgrMigrate(JSON.parse(d.world))}
  const w=W_();if(w.week!==ctx.week||!w.night)return;const b=w.night.bouts[ctx.bout];if(!b||b.done)return;
  // watching from your box beats reading a scout's scroll: everyone in a LIVE bout gets a closer look,
  // and a free agent who fights well is chalked straight onto your recruiting board.
  for(const r of res.rows){const g=gById(r.mgrId);if(!g)continue;
    g.scout=Math.min(3,(g.scout||0)+1);
    if(!g.contract&&(r.won||r.f>=25)&&g.alive){g.favd=true;mnews(_T`<b>${esc(g.name)}</b> impressed from your box seats (${cfAmt87(r.f)}${r.won?_T(', the win'):''}) — chalked onto your recruiting board.`)}}
  // live wagers placed from the Wagers window were already paid out of (and into) the treasury
  applyBout(ctx.bout,res,{live:true});saveWorld(true);
}
/* applyBout — applies a bout result to the league: records, purses and fees, fame, morale, injuries, the Fate table for every fighter, the Debtor's Gambit, rivalries, pledges, bets, rival lanistae's bets, a fixed bout's risk, and the news line. Wrapped by many later modules. */
function applyBout(boutIdx,res,opt={}){
  const w=W_(),b=w.night.bouts[boutIdx],T=TIERS[b.tier];if(b.done)return;b.done=true;const verdict={};
  const byId=Object.fromEntries(res.rows.map(r=>[r.mgrId,r]));const wins=new Set(res.winners.map(i=>res.rows.find(r=>r.id===i)).filter(Boolean).map(r=>r.mgrId));
  const lines=[];
  if(b.rig&&gById(b.rig)&&gById(b.rig).alive!==false){ // the fix is in: whatever the sand said, the judges saw otherwise
    wins.clear();wins.add(b.rig);const rr=byId[b.rig];if(rr){rr.f=Math.max(rr.f,22)} // the crowd is TOLD it was 22 CF worth of fight
    lines.push(_T`<i>the judges' verdict raises eyebrows — ${esc(gById(b.rig).name)} is declared the victor</i>`)};
  for(const gid of b.ents){const g=gById(gid);const r=byId[gid];if(!g||!r)continue;const m=g.contract?mgrById(g.contract.mgr):null;
    g.rec.ev++;g.rec.kp+=r.kp;g.rec.kn+=r.kn;g.rec.dmg=(g.rec.dmg||0)+(r.dmg||0);g.rec.taken=(g.rec.taken||0)+(r.taken||0);g.rec.cfSum=(g.rec.cfSum||0)+(r.f||0);g.rec.best=Math.max(g.rec.best||0,r.f||0);g.rec.coin=(g.rec.coin||0)+(r.coin||0);g.rec.house=(g.rec.house||0)+(typeof houseCount==='function'?houseCount(res.att||0,res.seed,w.night?w.night.loc:null):0);(g.rec.arenas=g.rec.arenas||[]);if(w.night&&!g.rec.arenas.includes(w.night.loc))g.rec.arenas.push(w.night.loc);g.pubNoise=Math.round((g.pubNoise||0)*0.7);g.lastBout=w.week;
    if(m){m.bouts++;m.coin+=b.fee}
    if(wins.has(gid)){g.rec.w++;g.fame=clamp(g.fame+T.fame*2,0,100);g.morale=clamp(g.morale+15,0,100);if(g.ovr<g.pot)g.ovr++;
      ghist(g,_T`won the ${TIERS[b.tier].n} at ${LOCATIONS[w.night.loc].n}${m?_T` for ${esc(m.ludus)}`:''} (${cfAmt87(r.f)})`);if(m){const cut=Math.round(b.purse*(0.5+m.p.greed/300));const share=Math.max(1,Math.round(b.purse*0.1));m.coin+=cut-share;g.purse=(g.purse||0)+share; /* v0.36: a tenth goes into the fighter's own purse */m.wins++;m.fame=clamp(m.fame+Math.round(T.fame*(0.7+m.p.show/140)),0,100);g.morale=clamp(g.morale-Math.round(m.p.greed/12),0,100);lines.push(_T`${esc(g.name)} wins for ${esc(m.ludus)} (${coinAmt87('+'+(cut))} to the lanista)`)}
      else{g.fame=clamp(g.fame+T.fame,0,100);lines.push(_T`${esc(g.name)}, a free agent, wins and raises their price`)}}
    else{g.morale=clamp(g.morale-6,0,100)}
    for(const l of r.severed||[])if(!g.severed.includes(l)){g.severed.push(l);lines.push(_T`${esc(g.name)} loses a ${LOCN[l].toLowerCase()}`)}
    // the sand collects lesser tolls too: a hard bout can leave a fighter hurt for a week or two
    if(!g.inj&&(r.dmg||0)>=8&&Math.random()<.15*RL(w,'inj')){g.inj={until:w.week+1+rnd(2),label:pickOne([_T('a torn shoulder'),_T('a deep thigh cut'),_T('cracked ribs'),_T('a rattled skull'),_T('a mangled hand')]),pen:2+rnd(4)};
      lines.push(_T`${esc(g.name)} leaves the sand hurt (${g.inj.label})`);if(m&&m.isPlayer)tnews(_T`${esc(g.name)} came back from the bout with ${g.inj.label} — benched until it heals or the Medicus clears it.`,'bad')}
    // ---- THE FATE TABLE (p.54-55), exactly as printed — every fighter, win or lose ----
    g.lastCF=r.f;const v=g.lanista?{}:leagueFate(g,r,m,b,boutIdx,opt);verdict[gid]=v;if(v.line)lines.push(v.line); // the editor holds the lanista's fate himself (below)
  }
  // ---- v0.34 THE DEBTOR'S GAMBIT resolves ----
  if(w.underdog&&w.underdog.fighting&&boutIdx===w.underdog.bout){const ud=w.underdog;const gL=gById(ud.gid);const rL=byId[ud.gid];const pm=me();
    w.underdog=null;w.underdogUsed=1;
    if(gL){gL.contract=null;gL.alive=false;gL.retired=true} // win or fall, the lanista hangs up the sword
    if(rL&&!rL.alive){ // fell on the sand: the career ends here, with an epitaph
      lines.push(_T`<b>${esc(pm.name)} falls in the sand — the house dies with its lanista</b>`);
      try{Store.put('hall','annal_'+w.id,{id:'annal_'+w.id,kind:'annal',name:pm.name,ludus:pm.ludus,grade:'✝',score:legacyOf(w,pm).score,tier:_T('Fell as the underdog'),seasons:w.season-(w.startSeason||1),rec:`${pm.wins}-${Math.max(0,pm.bouts-pm.wins)}`,fame:pm.fameBest||pm.fame,trophies:(w.trophies||[]).length,date:new Date().toISOString().slice(0,10),epitaph:_T('When the money ran out, the lanista took the sand himself. The crowd stood. The debt is paid.')}).catch(()=>{})}catch(e){}
      w.dead={why:_T("fell in the arena as the underdog — the Debtor's Gambit"),week:w.week,season:w.season,fame:pm.fame,record:`${pm.wins}-${Math.max(0,pm.bouts-pm.wins)}`,coin:pm.coin,fell:true};
      mnews(_T`✝ <b>${esc(pm.name)} dies on the sand.</b> The Debtor's Gambit is lost. The Annals keep the story — which is more than the creditors ever would have.`,'big');
    }else{ // survived, or won outright: the editor settles the books
      const wonL=wins.has(ud.gid);
      pm.negWeeks=0;if(w.loan){w.loan=null;lines.push(_T('the editor tears up the loan papers, for the theater of it'))}
      pm.coin=Math.max(pm.coin,wonL?60:25);pm.fame=clamp(pm.fame+(wonL?8:4),0,100);
      mnews(_T`💀→🏛 <b>The Debtor's Gambit is ${wonL?'WON':_T('survived')}.</b> ${esc(pm.name)} walks off the sand ${wonL?_T('to the crowd chanting the house name'):_T('bloodied but upright')} — the editor settles the books: treasury ${coinAmt87(pm.coin)}, fame +${wonL?8:4}. The creditors melt away.`,'big');
    }
  }
  // rivalry: beating another lanista's fighter (worse: killing one) is remembered — by EVERY ludus involved.
  // m.rivalry stays the feud aimed at YOU (it drives poaching and spite bets); m.rivals[<mgrId>] is the wider
  // web of grudges between stables, shown in the League's Rivals column.
  {const meId=me().id;const myWin=[...wins].some(gid=>{const g2=gById(gid);return g2&&g2.contract&&g2.contract.mgr===meId});if(myWin)me().perkPend=(me().perkPend||0)+1; // a win teaches the lanista too
   const winMgrs=[...new Set([...wins].map(gid=>{const g=gById(gid);return g&&g.contract?g.contract.mgr:null}).filter(Boolean))].map(mgrById).filter(Boolean);
   for(const mw of winMgrs)for(const gid of b.ents){const g=gById(gid);if(!g||!g.contract||g.contract.mgr===mw.id)continue;const m2=mgrById(g.contract.mgr);if(!m2)continue;
     const heat=(wins.has(gid)?0:5)+(g.alive?0:10);if(!heat)continue;
     if(mw.id===meId&&!m2.isPlayer){if(!wins.has(gid))bumpRival(m2,5);if(!g.alive)bumpRival(m2,10,_T`${esc(g.name)} died against your fighter`)}
     m2.rivals=m2.rivals||{};m2.rivals[mw.id]=clamp(Math.round((m2.rivals[mw.id]||0)+heat),0,100);}}
  // a pledge kept: the promised main event, delivered
  if(b.tier==='main')for(const gid of b.ents){const g=gById(gid);if(g&&g.pledge&&g.contract&&g.contract.mgr===g.pledge.mgr){const m2=mgrById(g.pledge.mgr);g.morale=clamp(g.morale+10,0,100);if(m2){m2.kept=(m2.kept||0)+1;if(m2.isPlayer)m2.perkPend=(m2.perkPend||0)+1}delete g.pledge;mnews(_T`${esc(g.name)} got the main event ${m2&&m2.isPlayer?_T('you'):m2?m2.name:''} promised. Word kept; the barracks notice.`,'big')}}
  // bets placed from the ludus before the bout (v0.67: a wager on a fighter no longer on the card is void — the stake comes back)
  for(const bt of [...b.bets])if(!b.ents.includes(bt.gid))voidBets(b,bt.gid);
  for(const bt of b.bets){const won=wins.has(bt.gid);const P=betPay(bt.stake,bt.odds);const pay=won?P.net:0;betSettle(bt.bid,won,pay);me().coin+=pay;me().betNet=(me().betNet||0)+pay-bt.stake;if(won&&P.tax)me().taxPaid=(me().taxPaid||0)+P.tax;lines.push(_T`Your bet on ${esc(gById(bt.gid)?.name||'?')}: ${won?`<b>+${pay}</b>${P.tax?` <span class="rc-sub">${_T`(${P.tax} to the Emperor's tenth)`}</span>`:''}`:'lost '+bt.stake}`)}
  // rival lanistae gamble too
  for(const m of w.mgrs){if(m.isPlayer||Math.random()>m.p.risk/140)continue;const st=Math.round(5+m.p.risk/8);
    let pk=pickOne(b.ents);
    if((m.rivalry||0)>=45){ // a bitter rival puts coin on whoever fights YOUR man
      const mine=b.ents.filter(id=>{const g2=gById(id);return g2&&g2.contract&&mgrById(g2.contract.mgr)&&mgrById(g2.contract.mgr).isPlayer});
      if(mine.length){const others=b.ents.filter(id=>!mine.includes(id));if(others.length)pk=[...others].sort((x,y)=>effOvr(gById(y))-effOvr(gById(x)))[0]}}
    const o=boutOdds(b)[b.ents.indexOf(pk)];const won=wins.has(pk);m.coin+=won?Math.round(st*o)-st:-st;
    betSettle(betRec({src:'mgr',ev:`m:${w.id}:${w.week}`,season:w.season,week:w.week,dayOff:6+Math.floor(Math.random()*19),min:420+Math.floor(Math.random()*840),city:LOCATIONS[w.night.loc].n,who:`${m.name} (${m.ludus})`,kind:'lanista',on:`${gById(pk)?gById(pk).name:'?'} · ${TIERS[b.tier].n}`,stake:st,odds:o}),won,Math.round(st*o));
    {const gk=gById(pk);const mk=gk&&gk.contract&&mgrById(gk.contract.mgr);if(mk&&mk!==m){const cut=Math.max(1,Math.round(st*0.08));mk.coin+=cut;mk.bookCut=(mk.bookCut||0)+cut;if(mk.isPlayer)tnews(_T`Bookmaker's cut: ${esc(m.name)} wagered ${st} on ${esc(gk.name)} — you take ${cut}.`)}}
    m.betNet=(m.betNet||0)+(won?Math.round(st*o)-st:-st);if(won&&o>3)mnews(_T`${esc(m.name)} wins ${coinAmt87(Math.round(st*o))} on ${esc(gById(pk).name)} at ${o}×.`)}
  // finishing order, as a Classic Elimination is decided: the last one standing, then whoever outlasted whom
  const order=[...res.rows].sort((x,y)=>(wins.has(y.mgrId)-wins.has(x.mgrId))||((y.alive?1:0)-(x.alive?1:0))||((y.elimTurn||9999)-(x.elimTurn||9999))||(y.f-x.f));
  const placeOf=Object.fromEntries(order.map((r,i)=>[r.mgrId,i+1]));
  {let at=0;try{at=typeof houseCount==='function'&&res.att?houseCount(res.att,res.seed,w.night?w.night.loc:null):0;if(!at&&typeof boutSales==='function'){const bs=boutSales(b);at=bs?Math.round(bs.sold*(0.94+Math.random()*0.1)):0}}catch(e){}b._att=at}
  b.res={att:b._att,winners:[...wins],rows:res.rows.map(r=>({gid:r.mgrId,place:placeOf[r.mgrId],elimTurn:r.elimTurn||null,elimBy:r.elimBy||null,f:r.f,won:wins.has(r.mgrId),alive:r.alive,vd:verdict[r.mgrId]?verdict[r.mgrId].vd:null,fname:verdict[r.mgrId]?verdict[r.mgrId].fname:'',fate:r.fate,kp:r.kp,kn:r.kn,dmg:r.dmg})),reason:res.reason,turns:res.turns,lines};
  if(typeof specAfterApply==='function')try{specAfterApply(b,wins,byId)}catch(e){console.error(e)}
  if(typeof leaguePtsAfterBout==='function')try{leaguePtsAfterBout(b)}catch(e){}
  if(b.rig){const pm2=me();const caught=Math.random()<(0.12+(w.rigCount||0)*0.02);
    for(const gid of b.ents){const g2=gById(gid);if(g2&&g2.contract&&g2.contract.mgr===pm2.id)g2.morale=clamp(g2.morale-((w.rigCount||0)>2?6:3),0,100)} // fighters know a bought palm when they hold one
    if((w.rigCount||0)>2)pm2.p.honor=clamp(pm2.p.honor-1,1,100); // do it often and it becomes who you are
    if(caught){pm2.rigStrikes=(pm2.rigStrikes||0)+1;pm2.fame=clamp(pm2.fame-12,0,100);pm2.coin-=40;
      mnews(_T`<b>SCANDAL:</b> Flavius's clerks unpick the ${TIERS[b.tier].n}'s ledgers — ${esc(pm2.ludus)} FIXED the bout. Fame −12, fined ${coinAmt87(40)}.${pm2.rigStrikes>=2?'':_T(' A second offense forfeits the ludus.')}`,'bad');
      tnews(_T`CAUGHT fixing the ${TIERS[b.tier].n}: fame −12, ${coinAmt87(40)} fine. Strike ${pm2.rigStrikes} of 2.`,'bad');
      if(pm2.rigStrikes>=2){collapseLudus(w,pm2,_T('seized by Flavius for fixing bouts — twice'));return}}
    else tnews(_T`The fixed ${TIERS[b.tier].n} pays out quietly. Nobody talks. This time.`)}
  const wn=[...wins].map(gById).filter(Boolean);
  mnews(_T`Week ${wkOf(w.week)} · ${boutDay(b.tier)}'s ${TIERS[b.tier].n} at ${LOCATIONS[w.night.loc].n}: ${wn.length?wn.map(g=>`<b>${esc(g.name)}</b>`).join(' & ')+' wins':_T('no victor')}. ${lines.slice(1).join('; ')}`,wn.some(g=>g.contract&&g.contract.mgr===me().id)?'big':'');
  saveWorld();
}
/* endWeek — ends the week: wages, injuries, training, morale, contracts, deaths of old age and the world, interest drift, pledges, feuds, careers turning, new faces, the loan and bankruptcy, season end and the Superbus, then the next match night. Returns false until every bout and verdict is settled. Wrapped by many later modules. */
async function endWeek(){
  const w=W_();const pm=me();
  for(const b of w.night.bouts)if(!b.done)return false;
  if((w.pend||[]).length)return false; // your thumbs, blood money and rudis choices must be settled first
  try{if(typeof travelWeekEnd==='function')travelWeekEnd(w)}catch(e){} // v0.42: a broken road deal comes due
  if(w.special&&!w.special.done)return false; // v0.27: an invitational pauses the week until it is settled
  // wages, training, morale, contracts
  for(const m of w.mgrs){for(const g of rosterOf(m)){
    m.coin-=g.contract.wage;g.contract.weeks--;
    if(g.ovr<g.pot&&Math.random()<m.p.discipline/130){g.ovr++;m.improved=(m.improved||0)+1}
    const fought=g.lastBout===w.week;g.morale=clamp(g.morale+(fought?2:-4)+(g.contract.wage>=askWage(g)?1:-3)+Math.round((m.p.honor-50)/25),0,100);
    if(g.contract.weeks<=0){const stay=g.morale>=35&&m.coin>=askWage(g)*2&&(m.isPlayer?false:Math.random()<(rosterOf(m).length<=3?.95:.75));
      if(m.isPlayer){g.contract.weeks=0;mnews(_T`${esc(g.name)}'s contract has run out. Re-sign them from Your ludus before next week or they walk.`,'bad');g.contract.expired=(g.contract.expired||0)+1;if(g.contract.expired>1){g.contract=null;g.interest[m.id]=30;mnews(_T`${esc(g.name)} leaves ${esc(m.ludus)} as a free agent.`,'bad');tnews(_T`${esc(g.name)} walked — contract expired unsigned.`,'bad')}else tnews(_T`${esc(g.name)}'s contract expired — re-sign or lose them.`,'bad')}
      else if(stay){g.contract.weeks=6+rnd(7);g.contract.wage=askWage(g)}else{g.contract=null;mnews(_T`${esc(g.name)} leaves ${esc(m.ludus)} and becomes a free agent.`)}}}
    if(m.coin<0){const ros=rosterOf(m).sort((a,b)=>b.contract.wage-a.contract.wage);if(ros[0]){ghist(ros[0],_T`walked out of ${esc(m.ludus)} over unpaid wages`);ros[0].contract=null;m.broken=(m.broken||0)+1;mnews(_T`${esc(m.ludus)} cannot pay its fighters. ${esc(ros[0].name)} walks out.`,'bad');if(m.isPlayer)tnews(_T`${esc(ros[0].name)} walked out — the treasury could not cover wages.`,'bad')}}
  }
  for(const g of w.glads.filter(g=>g.alive&&(g.severed||[]).length)){const m=g.contract?mgrById(g.contract.mgr):null;
    if(m&&!m.isPlayer&&m.coin>60+20*g.severed.length){m.coin-=HYGEIA*g.severed.length;g.severed=[];continue}
    if(!m&&Math.random()<.25){g.severed.pop();continue}
    if(g.severed.length>=2&&!g.sotonium&&!(m&&m.isPlayer&&g.severed.length<3)){g.alive=false;g.retired=true;mnews(_T`${esc(g.name)}, maimed, lays down the sword for good.`,m&&m.isPlayer?'bad':'');if(m)g.contract=null}}
  for(const g of w.glads)if(g.loyB)g.loyB=Math.max(0,g.loyB-1); // bonds fade a little each week unless tended
  // injuries run their course: a week on the bench and the leg holds again — but benched fighters sulk
  for(const g of w.glads){if(!g.inj)continue;
    if(w.week>=g.inj.until){
      if(g.inj.war){ // back from the war — or not
        const W2=g.inj.war;delete g.inj;const m2=g.contract?mgrById(g.contract.mgr):null;
        if(!g.sotonium&&Math.random()<.3){ghist(g,_T`fell in the war against ${W2.foe}`);g.alive=false;if(m2)g.contract=null;
          w.grave.unshift({...graveExtra(g),name:g.name,cls:g.cls,age:gAge(g),wk:w.week,s:w.season,fate:_T`fell with ${W2.rome} against ${W2.foe}`,mgr:m2?m2.name:null,rec:{...g.rec}});w.grave=w.grave.slice(0,40);
          mnews(_T`⚔️ <b>${esc(g.name)}</b> fell with ${esc(W2.rome)} against ${esc(W2.foe)}. The barracks pour one on the sand.`,m2&&m2.isPlayer?'bad':'');
          if(m2&&m2.isPlayer)tnews(_T`${esc(g.name)} fell in the war.`,'bad')}
        else{const up=3+rnd(3);g.ovr=clamp(g.ovr+up,30,99);g.pot=Math.max(g.pot,g.ovr);g.fame=clamp(g.fame+15,0,100);g.morale=clamp(g.morale+10,0,100);
          ghist(g,_T`returned from the war a hero (+${up} rating)`);
          for(const r2 of (typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]))if(!r2.fanOf&&Math.random()<.12){r2.fanOf=g.name} // the empire loves a veteran
          mnews(_T`🦅 <b>${esc(g.name)}</b> returns from the war a HERO: +${up} rating, +15 fame, and half the empire chanting the name.`,'big');
          if(m2&&m2.isPlayer)tnews(_T`${esc(g.name)} came home a war hero: +${up} rating, +15 fame.`)}
        continue}
      if(injReq(g.inj)==='surgeon'){ // a surgeon's wound does not simply pass: it festers
        g.inj.until=w.week+1;g.inj.neglect=(g.inj.neglect||0)+1;const m2=g.contract?mgrById(g.contract.mgr):null;
        if(g.inj.neglect>=3){const roll=Math.random();
          if(roll<.3&&!g.sotonium){ghist(g,_T`died of ${g.inj.label} left untreated`);g.alive=false;if(m2)g.contract=null;
            w.grave.unshift({...graveExtra(g),name:g.name,cls:g.cls,age:gAge(g),wk:w.week,s:w.season,fate:_T`${g.inj.label}, left to fester`,mgr:m2?m2.name:null,rec:{...g.rec}});w.grave=w.grave.slice(0,40);
            mnews(_T`✝ <b>${esc(g.name)}</b> dies of ${esc(g.inj.label)} — three weeks in the infirmary and no surgeon came.`,m2&&m2.isPlayer?'bad':'');
            if(m2&&m2.isPlayer)tnews(_T`${esc(g.name)} died untreated in the infirmary. The barracks saw who didn't pay.`,'bad')}
          else if(roll<.6&&!g.sotonium){ghist(g,_T`fled the infirmary, ${g.inj.label} and all`);g.alive=false;if(m2)g.contract=null;
            mnews(_T`<b>${esc(g.name)}</b> limps out of the infirmary in the night and is gone — ${esc(g.inj.label)}, no surgeon, no goodbye.`,m2&&m2.isPlayer?'bad':'');
            if(m2&&m2.isPlayer)tnews(_T`${esc(g.name)} fled the infirmary untreated.`,'bad')}
          else{const pen=g.inj.pen;delete g.inj;g.ovr=clamp(g.ovr-2,25,99);ghist(g,_T('fought through an untreated wound (−2 rating, for good)'));
            mnews(_T`<b>${esc(g.name)}</b> grits through the pain and walks out of the infirmary — the wound never quite closes (−2 rating).`);
            if(m2&&m2.isPlayer)tnews(_T`${esc(g.name)} fought through the untreated wound: back, but −2 rating for good.`)}
          continue}
        if(m2&&m2.isPlayer&&g.inj.neglect===2)tnews(_T`${esc(g.name)}'s ${esc(g.inj.label)} is FESTERING — a surgeon (Infirmary tab, ${coinAmt87(SURGEON)}) or it ends badly next week.`,'bad');
        continue}
      delete g.inj}
    else if(g.contract&&!g.inj.war)g.morale=clamp(g.morale-2,0,100)}
  // ---- TRAINING WEEK (v0.16): pick a regime for the stable, plus a personal trainer for chosen fighters ----
  // Light = cheap and safe, Brutal = the big gains and the real injuries. A bad local omen makes any yard slicker.
  {const R=TRAIN_REGIMES[w.train]||TRAIN_REGIMES.off;const ros=rosterOf(pm);w.lastTraining=[];
   const omenBad=w.night&&w.night.omen&&(w.night.omen.local||0)<0;
   const teamOn=R.c>0&&ros.length&&pm.coin>=R.c;if(teamOn){pm.coin-=R.c;if(typeof devNote==='function')devNote(pm,R.c)}
   for(const g of ros){
     const solo=g.ptrain&&pm.coin>=PTRAIN_COST?(pm.coin-=PTRAIN_COST,typeof devNote==='function'&&devNote(pm,PTRAIN_COST),true):false;delete g.ptrain;
     if(!teamOn&&!solo)continue;
     if(g.inj){w.lastTraining.push({n:g.name,txt:_T`sat out — ${g.inj.label}`});continue}
     const yl=typeof facLvl==='function'?facLvl(pm,'yard'):0;
     const gain=((teamOn?R.gain:0)+(solo?.24:0)+pm.p.discipline/450+yl*.05)*RL(w,'gain');
     const injc=((teamOn?R.inj:0)+(solo?.035:0))*(omenBad?1.8:1)*RL(w,'inj')*(1-.2*yl);
     if(Math.random()<injc){const [lbl,pen]=pickOne([[_T('a sprained ankle'),3],[_T('a pulled shoulder'),4],[_T('a cracked rib'),5],[_T('fell on their own sword (shallow, but the barracks will not let it go)'),4],[_T('a wrenched knee at the palus'),3]]);
       g.inj={until:w.week+2,label:lbl,pen};g.morale=clamp(g.morale-5,0,100);
       w.lastTraining.push({n:g.name,txt:_T`<b>injured</b> — ${lbl}: −${pen} rating and benched a week (the Medicus or a bathhouse day clears it)${omenBad?_T(' — the omens did warn of a slick yard'):''}`});
       tnews(_T`${esc(g.name)} injured in ${R.n.toLowerCase()} training: ${lbl}.`,'bad');continue}
     if(g.ovr<g.pot&&Math.random()<gain){const dbl=solo&&g.ovr+1<g.pot&&Math.random()<.35;g.ovr+=dbl?2:1;
       w.lastTraining.push({n:g.name,txt:_T`+${dbl?2:1} rating${solo?_T(' (personal trainer)'):''} — ${pickOne([_T('footwork drills'),_T('shield discipline'),_T('long mornings at the palus'),_T('breath and nerve work'),_T('weighted sword work'),_T('sparring the doctors')])}${omenBad?_T(', despite ill omens over the yard'):''}`})}
     else{g.morale=clamp(g.morale+2,0,100);w.lastTraining.push({n:g.name,txt:`+2 morale — ${teamOn?R.n.toLowerCase()+' week':_T('a private session')}${omenBad?_T(' (the omens counselled rest)'):''}${g.ovr>=g.pot?_T('; they have reached their potential'):''}`})}
   }
   if(w.lastTraining.length){const up=w.lastTraining.filter(x=>/\+\d rating/.test(x.txt)).length;
     tnews(_T`Training (${R.n}${w.lastTraining.some(x=>/personal trainer/.test(x.txt))?_T(' + personal trainers'):''}): ${up} improved, ${w.lastTraining.filter(x=>/injured/.test(x.txt)).length} injured.`);
     if(up>=2)pm.perkPend=(pm.perkPend||0)+1}}
  // ---- MORS OMNIBUS: very rarely the world simply takes someone — no bout required ----
  for(const g of w.glads.filter(g=>g.alive&&!g.sotonium)){if(Math.random()>=0.0035*RL(w,'rand'))continue;
    const why=pickOne([_T('a winter fever'),_T('a tavern knife over a bookie\u2019s debt'),_T('an angry spectator with a roof tile'),_T('a practice bout that went a hand too deep'),_T('the levy — marched off to war and never seen again'),_T('bad oysters at a victory feast'),_T('a rival\u2019s hired blade in an alley')]);
    const m2=g.contract?mgrById(g.contract.mgr):null;ghist(g,_T`died: ${why}`);g.alive=false;g.retired=true;if(m2)g.contract=null;
    w.grave.unshift({...graveExtra(g),name:g.name,cls:g.cls,age:gAge(g),wk:w.week,s:w.season,fate:why,mgr:m2?m2.name:null,rec:{...g.rec}});w.grave=w.grave.slice(0,40);
    mnews(_T`<b>${esc(g.name)}</b> (${gAge(g)}) is dead — ${why}. The sand had nothing to do with it.`,m2&&m2.isPlayer?'bad':'');
    if(m2&&m2.isPlayer)tnews(_T`${esc(g.name)} died: ${why}.`,'bad')}
  for(const g of freeAgents()){g.unsigned++;if(g.ovr<g.pot&&Math.random()<.3)g.ovr++;if(g.unsigned>14&&effOvr(g)<52&&Math.random()<.3){g.alive=false;g.retired=true;mnews(_T`${esc(g.name)} gives up the sand and goes home to ${esc(g.city)}.`)}}
  // interest drifts back toward how fighters see each ludus
  for(const g of w.glads.filter(g=>g.alive))for(const m of w.mgrs){const cur=interestOf(g,m);const base=baseInterest(m,g);g.interest[m.id]=capInterest(g,m,Math.round(cur+(base-cur)*0.12))}
  // pledges come due: a fighter promised the main event who never got one stops believing you
  for(const g of w.glads.filter(g=>g.alive&&g.pledge&&w.week>=g.pledge.due)){
    const m2=mgrById(g.pledge.mgr);delete g.pledge;
    if(m2){m2.broken=(m2.broken||0)+1;g.morale=clamp(g.morale-12,0,100);g.interest[m2.id]=Math.max(0,interestOf(g,m2)-15);
      mnews(_T`<b>${esc(m2.isPlayer?_T('You'):m2.name)} broke the pledge</b> to ${esc(g.name)}: no main event came. ${m2.isPlayer?_T('Honor-minded fighters will hear of it.'):''}`,m2.isPlayer?'bad':'')}}
  // feuds simmer down unless fed; the hottest rivals talk to the criers
  for(const m2 of w.mgrs){if(m2.rivals)for(const k of Object.keys(m2.rivals)){m2.rivals[k]=Math.max(0,Math.round(m2.rivals[k]*0.94-0.5));if(!m2.rivals[k])delete m2.rivals[k]}
    if(m2.isPlayer)continue;m2.rivalry=Math.max(0,Math.round((m2.rivalry||0)*0.94-0.5));
    if((m2.rivalry||0)>=60&&Math.random()<.25)mnews(_T`<i>“${pickOne([_T`Tell ${esc(pm.ludus)} the sand is waiting.`,_T('Their fighters die tired, nothing more.'),_T('I will buy their ludus for kindling.'),_T('Every one of their victories is borrowed.')])}”</i> — ${esc(m2.name)}, to anyone who will listen.`)}
  for(const g of w.glads)if(g.kit&&g.kitWk!==w.week+0){} 
  for(const g of w.glads)if(g.kit){delete g.kit;delete g.kitWk} // city kits are for this week's bout only
  cpuLeagueWeek();if(typeof devWeek==='function')devWeek();if(typeof aiLanistaWeek==='function')aiLanistaWeek();if(typeof facWeek==='function')facWeek();
  // ---- AGE AND THE ARC OF A CAREER (v0.15) ----
  // The old hang up the sword: past 34, every year (and low spirits) makes walking away likelier.
  for(const g of w.glads.filter(g=>g.alive&&gAge(g)>=35&&!g.sotonium)){
    if(Math.random()<Math.min(0.45,0.018*(gAge(g)-34))+(g.morale<40?.05:0)){
      const m2=g.contract?mgrById(g.contract.mgr):null;ghist(g,_T`hung up the sword at ${gAge(g)}`);g.alive=false;g.retired=true;if(m2)g.contract=null;
      mnews(_T`<b>${esc(g.name)}</b>, ${gAge(g)}, hangs up the sword after ${g.rec.ev} event${g.rec.ev===1?'':'s'} and ${g.rec.w} win${g.rec.w===1?'':'s'}. The barracks drink to an old sand-hand.`,m2&&m2.isPlayer?'bad':'');
      if(m2&&m2.isPlayer)tnews(_T`${esc(g.name)} retired at ${gAge(g)} — age comes for every sword arm.`,'bad')}}
  // Careers turn: fighters re-badge classes — commonest mid-career; the graying drift toward Veteranus.
  for(const g of w.glads.filter(g=>g.alive&&CLASSES[g.cls]&&!CLASSES[g.cls].custom)){
    const age=gAge(g);let ch=age>=23&&age<=31?0.03:0.01;if(age>=32&&g.cls!=='veteranus')ch+=0.035;
    if(Math.random()>=ch)continue;
    const to=age>=32?pickOne(['veteranus','veteranus','veteranus','hero','soldier']):ageClass(age);
    if(to===g.cls||(to==='amazonia'&&!g.fem))continue; // only gladiatrices train as Amazonia
    const m2=g.contract?mgrById(g.contract.mgr):null;const old=CLASSES[g.cls].name;
    const why=pickOne([m2?_T`at ${m2.isPlayer?_T('your'):esc(m2.ludus)+"'s"} request`:_T('on a doctor’s advice'),_T('after a winter of new drills and tactics'),'on the advice of an omen-reader',_T('by personal choice — the old style stopped feeling right'),_T('to counter the season’s fashion in the arena')]);
    g.cls=to;g.motives=motivesFor(g.pers);ghist(g,_T`re-badged from ${old} to ${CLASSES[to].name} (${why})`);
    mnews(_T`${esc(g.name)} (${age}) re-badges from ${old} to <b>${CLASSES[to].name}</b> ${why}.`);
    if(m2&&m2.isPlayer)tnews(_T`${esc(g.name)} now fights as a ${CLASSES[to].name} (${why}).`)}
  // new faces — and the league keeps its numbers: the fate table empties benches fast
  while(w.glads.filter(g=>g.alive).length<Math.round(50*RL(w,'rookies'))){const g=genGlad({rookie:Math.random()<.6});g.debut={s:w.season,wk:w.week+1};w.glads.push(g)}
  // hard times fill the barracks: famine, war, plague and disaster send the desperate to the sand from THOSE cities
  const hard=(typeof worldEvents==='function'?worldEvents(`m:${w.id}:${w.season}:${w.week}`):[]).filter(e=>e.mood<=-8);
  // v0.29: the free-agent market does not swell forever — the old and the unwanted drift home
  {const fa=w.glads.filter(g=>g.alive&&!g.contract&&!g.favd&&!g.inv).sort((a,b)=>(effOvr(a)-gAge(a)*0.6)-(effOvr(b)-gAge(b)*0.6));let extra=fa.length-55; /* v0.48: 55, the long-run stress test swelled it to 75+ */
   for(const g of fa){if(extra--<=0)break;g.alive=false;g.retired=true;ghist(g,_T('went home — no ludus came calling'))}}
  const deadWk=w.grave.filter(x=>x.s===w.season&&x.wk===w.week).length; // v0.29: a bloody week draws more hopefuls to the ludi
  const influx=2+rnd(2)+Math.min(2,hard.length)+Math.min(4,Math.max(0,deadWk-2));
  if(hard.length)mnews(_T`Hard times swell the recruiting yards: ${hard.map(e=>`${e.i} ${esc(e.city)}`).join(', ')} send their desperate to the sand.`);
  for(let i=0;i<influx;i++){const hc=hard.length&&i>=influx-Math.min(2,hard.length)?hard[i%hard.length].city:null;const g=genGlad({rookie:Math.random()<.7,city:hc||undefined});g.debut={s:w.season,wk:w.week+1};w.glads.push(g);if(effOvr(g)>=70)mnews(_T`A new fighter arrives: <b>${esc(g.name)}</b> of ${esc(g.city)}, ${gAge(g)} years old, rated ${pubOvr(g)} ${'★'.repeat(starsOf(pubOvr(g)))}.`)}
  w.glads=w.glads.filter(g=>g.alive||(w.week-(g.lastBout||0))<3);
  // roguelike stakes: a ludus that cannot pay its way is finished. Three week-ends in the red — or ending a season in debt — and the creditors take everything.
  if(typeof purseWeek==='function')try{purseWeek(w,pm)}catch(e){console.error(e)} // v0.36: fighters' purses, buyout offers, walk-outs
  // v0.30 THE LOAN: interest accrues and the collector calls, every week, before the red is counted
  if(w.loan&&w.loan.amt>0)loanWeek(w,pm); /* v0.55: interest only — the lanista pays by hand (66-mgr55) */
  pm.fameBest=Math.max(pm.fameBest||0,pm.fame);
  if(pm.coin<0&&!w.loan&&!w.loanAsk)w.loanAsk=1; // the first time you sink, someone offers a rope
  if(pm.coin<0){pm.negWeeks=(pm.negWeeks||0)+1;
    if(pm.negWeeks>=BANKRUPT_WEEKS){
      /* v0.34 THE DEBTOR'S GAMBIT: the creditors are at the gate — but once per career, the editor
         offers one last door: the lanista fights next week's main event HIMSELF. Refuse or dawdle a
         week and the collapse lands as it always did. */
      if(w.underdog&&w.underdog.armed){collapseLudus(w,pm,_T`${BANKRUPT_WEEKS} weeks in the red — the Debtor's Gambit went unfought`);return true}
      if(!w.underdogUsed){w.underdog={armed:1,season:w.season,week:w.week+1};
        mnews(_T`💀 <b>The creditors gather at your gate.</b> One door remains open: the editor will pay handsomely to watch a LANISTA bleed. Take the sand yourself in next week's main event — the <b>Debtor's Gambit</b> waits on Match Week. Refuse, and the ludus falls.`,'big')}
      else{collapseLudus(w,pm,_T`${BANKRUPT_WEEKS} weeks in the red`);return true}}
    else mnews(_T`<b>Your treasury is ${coinAmt87(pm.coin)}.</b> ${BANKRUPT_WEEKS-pm.negWeeks} week${BANKRUPT_WEEKS-pm.negWeeks===1?'':'s'} in the red before the creditors close the ludus. Win purses, bet well or release your dearest wages.`,'bad')}
  else pm.negWeeks=0;
  if(w.week%12===0){
    if(pm.coin+(typeof qsPreview==='function'?qsPreview(w,pm):0)<0&&!(w.founded!=null&&w.week-w.founded<12)){collapseLudus(w,pm,_T('ending the season in debt'));return true} /* v0.49: a newcomer's first, partial season is forgiven */
    else if(pm.coin<0&&w.founded!=null&&w.week-w.founded<12)mnews(_T`🏛 The creditors give a new house until the end of its first full season. ${esc(pm.ludus)} starts the next one in debt — and on notice.`,'bad');
    // ---- v0.28 THE FLAVIUS SUPERBUS: the regular season is over; the top four stables are invited to Roma ----
    // The league's leading lanista chooses the festival gift; each of the top four sends ONE fighter. It opens the
    // next week as an invitational (the league pauses for it) — watch it live, or play it out. The awards follow it.
    {const lead=leagueSort(w.mgrs)[0];
      const kind=lead.isPlayer?(w.festPick||'ludi'):(lead.p.greed>60?'saturnalia':lead.p.show>60?'fortuna':lead.p.discipline>60?'vulcanalia':lead.p.honor>60?'asclepieia':'ludi');
      const top4=leagueSort(w.mgrs.filter(m2=>!m2.sica)).slice(0,4).map(m2=>m2.id);
      w.finaleDue={season:w.season,kind,top4,lead:lead.id};
      mnews(_T`🏛 <b>The regular season is over.</b> The Flavius Superbus is set for Roma: ${top4.map(id=>esc(mgrById(id).ludus)).join(', ')} are invited — one fighter each. ${esc(lead.isPlayer?_T('You'):lead.name)} chose the ${esc((FEST_KINDS[kind]||FEST_KINDS.ludi).n)} gift.`,'big');
      if(top4.includes(w.playerId))tnews(_T`🏛 <b>You are invited to the Flavius Superbus!</b> Choose your champion on Match Week when it opens next week.`,'big')}
    const top=leagueSort(w.mgrs)[0];mnews(_T`Season ${w.season} ends. Top of the table: <b>${esc(top.name)}</b> (${esc(top.ludus)}, ${msp(top).pts} points, ${msp(top).w}-${msp(top).b-msp(top).w}).`,'big');w.season++;for(const m of w.mgrs)m.fame=clamp(Math.round(m.fame*0.92),0,100);
    for(const g of w.glads.filter(g=>g.alive))g.age=gAge(g)+1; // birthdays at season's end: the sand ages everyone
    // season's end is when doors open: the rich and famous can BUY their freedom; the old diehards sometimes simply don't see spring
    if(typeof sotoSeason==='function')sotoSeason(w);
    for(const g of w.glads.filter(g=>g.alive&&gAge(g)>=30&&!g.sotonium)){
      const m2=g.contract?mgrById(g.contract.mgr):null;
      if(rudisReady(g)&&((g.fame||0)>=55||g.rec.w>=8)&&Math.random()<.05){
        ghist(g,_T`bought their freedom at ${gAge(g)}`);g.alive=false;g.freed2=true;if(m2)g.contract=null;libertyEntry(g,m2,_T('the Gate of Life'),_T('bought their freedom'));
        mnews(_T`<b>${esc(g.name)}</b>, ${gAge(g)}, counts out a lifetime of purse-cuts and <b>buys their freedom</b> at season's end. They walk out the Gate of Life with the crowd on its feet.`,'big');
        if(m2&&m2.isPlayer)tnews(_T`${esc(g.name)} bought their freedom — you cannot argue with a full purse and a finished story.`)}
      else if(gAge(g)>=36&&Math.random()<(gAge(g)>=60?.14:gAge(g)>=48?.08:.04)){
        const why=pickOne([_T('their heart gave out in the baths'),_T('the old wounds finally collected their debt'),_T('they went to sleep after the feast and did not wake'),_T('one winter too many for a body full of scars')]);
        ghist(g,_T`died at ${gAge(g)}: ${why}`);g.alive=false;g.retired=true;if(m2)g.contract=null;
        w.grave.unshift({...graveExtra(g),name:g.name,cls:g.cls,age:gAge(g),wk:w.week,s:w.season,fate:why,mgr:m2?m2.name:null,rec:{...g.rec}});w.grave=w.grave.slice(0,40);
        mnews(_T`<b>${esc(g.name)}</b>, ${gAge(g)}, fought to the very end — ${why}.`,m2&&m2.isPlayer?'bad':'');
        if(m2&&m2.isPlayer)tnews(_T`${esc(g.name)} died at season's end: ${why}.`,'bad')}}}
  // creations that died or walked free in the league are struck from the Creator Studio rolls too
  for(const g of w.glads)if(g.src==='custom'&&!g.alive&&!g._cSynced&&typeof CUSTOM!=='undefined'){g._cSynced=1;const c=CUSTOM.chars.find(z=>z.id===g.srcId);
    if(c&&(!c.status||c.status==='active')){c.status=g.freed2?'freed':'fallen';c.rolls=false;c.fell={date:new Date().toISOString().slice(0,10),fate:g.freed2?_T('took the rudis'):(w.grave.find(x=>x.name===g.name)||{}).fate||_T('died in the league'),at:w.mgrs.find(x=>x.isPlayer).ludus};Store.put('customChars',c.id,c).catch(()=>{})}}
  // the lanista's own schooling: this week's lessons become next week's perk points
  pm.perkPend=(pm.perkPend||0)+1; // living another week teaches something
  pm.perkPts=(pm.perkPts||0)+pm.perkPend;pm.perkLast=pm.perkPend;pm.perkPend=0;
  const doneNight=w.night,doneSeason=w.season-(w.week%12===0?1:0);
  {const ws=w.weekStart||{coin:pm.coin,fame:pm.fame,wins:pm.wins,bouts:pm.bouts};const res=[];
   for(const b of (doneNight?doneNight.bouts:[]))if(b.res)for(const r of b.res.rows){const g=gById(r.gid);const nm2=g?g.name:r.name;
     const mine=(g&&g.contract&&g.contract.mgr===pm.id)||w.grave.some(x=>x.name===nm2&&x.mgr===pm.name&&x.wk===doneNight.week);if(!mine)continue;
     res.push({name:nm2,tier:TIERS[b.tier].n,ev:EVENTS[b.ev]?EVENTS[b.ev].n:'',place:r.place,won:!!r.won,f:r.f,fate:r.fname||r.vd||''})}
   w.review={wk:doneNight?doneNight.week:w.week,season:doneSeason,coinD:pm.coin-ws.coin,coin:pm.coin,fameD:pm.fame-ws.fame,winsD:pm.wins-ws.wins,boutsD:pm.bouts-ws.bouts,results:res,
     dead:w.grave.filter(x=>x.mgr===pm.name&&doneNight&&x.wk===doneNight.week).map(x=>x.name),training:(w.lastTraining||[]).slice(0,4),seen:false}}
  const seasonJustEnded=w.week%12===0;
  w.week++;w.hours=hoursMax();w.repair=0;makeNight();
  w.lastPaper=composeWeekPaper(w,doneNight,doneSeason); // the gazette: this week's results AND next week's card
  (w.papers=w.papers||[]).push(w.lastPaper);if(w.papers.length>14)w.papers.shift(); // the season's editions, kept for re-reading
  if(seasonJustEnded){ // the season recap edition goes to the Ludus Archives, for good
    const R2={season:doneSeason,ludus:pm.ludus,name:pm.name,date:new Date().toISOString().slice(0,10),
      finale:w.finale&&w.finale.season===doneSeason?w.finale:null,
      champLanista:(()=>{const t=leagueSort(w.mgrs,doneSeason)[0];return {name:t.name,ludus:t.ludus,fame:t.fame,you:!!t.isPlayer}})(),
      you:{fame:pm.fame,coin:pm.coin,rec:`${pm.wins}-${Math.max(0,pm.bouts-pm.wins)}`,deaths:pm.deaths||0,kept:pm.kept||0,broken:pm.broken||0,betNet:pm.betNet||0,rigCaught:pm.rigStrikes||0},
      best:w.glads.filter(g=>g.alive&&g.contract).sort((a,b)=>effOvr(b)-effOvr(a)).slice(0,3).map(g=>({n:g.name,ovr:effOvr(g),ludus:mgrById(g.contract.mgr).ludus})),
      standings:leagueSort(w.mgrs,doneSeason).slice(0,8).map(m2=>({ludus:m2.ludus,me:!!m2.isPlayer,pts:msp(m2,doneSeason).pts,rec:`${msp(m2,doneSeason).w}–${msp(m2,doneSeason).b-msp(m2,doneSeason).w}`})),
      graves:w.grave.filter(x=>x.s===doneSeason).length,
      obits:w.grave.filter(x=>x.s===doneSeason).slice(0,6).map(x=>`${x.name} (${x.fate})`)};
    (w.archives=w.archives||[]).push(R2);
    Store.put('mgrArchives',w.id+'_s'+doneSeason,{career:w.id,ludus:pm.ludus,lanista:pm.name,season:doneSeason,date:R2.date,rec:JSON.stringify(R2)}).catch(()=>{});
    w.papers=[w.lastPaper]; // a fresh season, a fresh stack on the forum wall
  }
  saveWorld(true);return true;
}
// v0.21: a fallen house scatters its fighters. The good ones find new stables (they enter the free-agent
// pool of your NEXT career, too); the rest go where broken houses send people.
const SCATTER=[_T('sold to the silver mines to settle the debts'),_T('taken as a bodyguard by a senator\u2019s son'),_T('enlisted with the legions on the Danube'),_T('slipped away in the night and was never seen again'),'bought by a traveling beast-show',_T('went home to farm, swearing never to hold a sword again'),_T('seized by the creditors and sold at auction')];
/* v0.30 LEGACY & RETIREMENT: manager mode has no forced ending — you play for the LEGACY of the house
   and retire when the story feels finished. The house then enters the Annals with a grade and an epitaph. */
const LEGACY_TIERS=[[0,_T('Unwritten'),'F'],[40,_T('A footnote'),'D'],[90,_T('A respected house'),'C'],[160,_T('A name in the taverns'),'B'],[260,_T('A great house'),'A'],[400,_T('A dynasty'),'A+'],[600,_T('Legend of the sand'),'S']];
/* legacyOf — a house's legacy: points from seasons, wins, cups, the Superbus, silverware, fame, facilities, freed champions, gems, debts and broken pledges → score, tier and grade. TWEAK: the points per item. */
function legacyOf(world,pm){const T=(world.trophies||[]);const cups=T.filter(t=>t.tid==='flavian_cup').length,superb=T.filter(t=>t.tid==='palm_roma').length;
  const parts=[[_T('Seasons completed'),Math.max(0,(world.season-(world.startSeason||1)))*8],[_T('Bouts won'),pm.wins*2],[_T('Flavian Cups'),cups*40],[_T('Superbus crowns'),superb*35],
    [_T('Other silverware'),(T.length-cups-superb)*8],[_T('Peak fame'),Math.round((pm.fameBest||pm.fame)/2)],[_T('Facilities built'),typeof facSum==='function'?facSum(pm)*3:0],
    [_T('Champions freed with the rudis'),(world.rudisFreed||0)*10],[_T('Hidden gems found'),(world.gemsFound||0)*8],[_T('Debts honored'),(world.loanDone||0)*5],[_T('Pledges broken'),-(pm.broken||0)*4]];
  const score=Math.max(0,Math.round(parts.reduce((a,[,v])=>a+v,0)));
  let tier=LEGACY_TIERS[0];for(const t of LEGACY_TIERS)if(score>=t[0])tier=t;
  return {score,parts,tier:tier[1],grade:tier[2],next:LEGACY_TIERS.find(t=>t[0]>score)||null}}
/* legacy milestones: [name, description, test(world)]. */
const LEGACY_GOALS=[[_T('First blood'),_T('Win a bout'),w=>me().wins>=1],[_T('A full barracks'),_T('Five fighters under contract'),w=>rosterOf(me()).length>=5],[_T('Known in the forum'),_T('Reach 40 fame'),w=>me().fame>=40],
  [_T('A house with walls'),_T('Ludus grade B or better'),w=>typeof facSum==='function'&&facSum(me())>=5],[_T('Silverware'),_T('Win any trophy'),w=>(w.trophies||[]).length>=1],[_T('Top of the table'),_T('Win the Flavian Cup'),w=>(w.trophies||[]).some(t=>t.tid==='flavian_cup')],
  [_T('The Superbus'),_T('Win the season finale'),w=>(w.trophies||[]).some(t=>t.tid==='palm_roma')],[_T('The long game'),_T('Complete three seasons'),w=>w.season-(w.startSeason||1)>=3],[_T('A dynasty'),_T('Legacy 260+'),w=>legacyOf(w,me()).score>=260]];
/* legacyCardHTML — the legacy card in Your ludus: score, tier, ledger, milestones, Retire with honors / Shut down. */
function legacyCardHTML(){const w=W_(),m=me();const L9=legacyOf(w,m);
  return `<div class="card2" style="margin-top:8px"><div class="schoolhd"><div class="sect" style="margin:0">${_T`🏛 The legacy of ${esc(m.ludus)}`}</div><div class="gradebox" style="--gc:${gradeCol(L9.grade.replace('+',''))}" title="${_T`${L9.score} legacy — ${esc(L9.tier)}`}">${L9.grade}</div></div>
    <p class="rc-sub" style="margin:0 0 6px">${_T`<b>${L9.score} legacy</b> · ${esc(L9.tier)}${L9.next?_T` · ${L9.next[0]-L9.score} to “${esc(L9.next[1])}”`:_T(' · the highest tier there is')}. Manager mode has no forced ending — the legacy IS the long game. Retire when the story is told, and the house enters the Annals.`}</p>
    <details><summary class="rc-sub">${_T`The ledger of it — every point, and the milestones`}</summary><div style="font-size:12.5px;columns:2;gap:14px;margin-top:4px">${L9.parts.filter(([,v])=>v).map(([n,v])=>`<div style="display:flex;justify-content:space-between"><span>${n}</span><b class="${v<0?'dn':''}">${v>=0?'+':''}${v}</b></div>`).join('')||_T('<span class="rc-sub">Nothing yet — win something.</span>')}</div>
    <div class="sect">${_T`Milestones · ${LEGACY_GOALS.filter(([n,d,fn])=>{try{return fn(w)}catch(e){return false}}).length}/${LEGACY_GOALS.length}`}</div><div style="font-size:12.5px;display:grid;gap:2px">${LEGACY_GOALS.map(([n,d,fn])=>{const ok=(()=>{try{return fn(w)}catch(e){return false}})();return `<div class="${ok?'up':''}">${ok?'✓':'·'} <b>${n}</b> <span class="rc-sub">— ${d}</span></div>`}).join('')}</div></details>
    <div class="acts" style="margin-top:8px">${L9.score>=160?`<button class="btn" type="button" data-mg="retire">${_T`🏺 Retire with honors<small>close the house at its peak — it enters the Annals for good</small>`}</button>`
      :`<button class="btn" type="button" disabled title="${_T`Honors are for houses the taverns talk about: legacy 160 ('A name in the taverns', grade B) or better. ${esc(m.ludus)} stands at ${L9.score}.`}">${_T`🏺 Retire with honors<small>🔒 needs legacy 160+ (grade B) — yours is ${L9.score}</small>`}</button>`}
     <button class="btn" type="button" data-mg="shutdown" style="border-color:#7a2a2a">${_T`🚪 Shut down the ludus<small>always your right — the fighters are turned out, no honors, no annal</small>`}</button></div></div>`}
/* collapseLudus — the house falls: good fighters walk into free agency (and the next career's pool), the rest are scattered; the career is marked dead. */
function collapseLudus(world,pm,why){
  const ros=rosterOf(pm);world.scatter=[];const keep=[];
  for(const g of ros){g.contract=null;
    if(effOvr(g)>=55||Math.random()<.25){ghist(g,_T`walked free when ${esc(pm.ludus)} collapsed — into free agency`);keep.push(g);world.scatter.push({name:g.name,ovr:effOvr(g),to:_T('free agency — rival stables are already asking')})}
    else{const why2=pickOne(SCATTER);ghist(g,_T`${why2} when ${esc(pm.ludus)} collapsed`);g.alive=false;g.retired=true;world.scatter.push({name:g.name,ovr:effOvr(g),to:why2})}}
  // survivors carry into the next career's pool
  Store.put('hall','scattered',{id:'scattered',list:keep.map(g=>({...g,contract:null,interest:{},scout:0,favd:false,pledge:null}))}).catch(()=>{});
  world.dead={why,week:world.week,season:world.season,fame:pm.fame,record:`${pm.wins}-${Math.max(0,pm.bouts-pm.wins)}`,coin:pm.coin};
  mnews(_T`<b>${esc(pm.ludus)} collapses.</b> The creditors seize the sand, the fighters walk free, and ${esc(pm.name)}'s name is struck from the lanistae's rolls (${esc(why)}).`,'bad');
  saveWorld(true);
}
/* cpuLeagueWeek — rival houses act each week: court and sign free agents, poach unhappy fighters (cunning ones), release extras. */
function cpuLeagueWeek(){
  const w=W_();
  for(const m of w.mgrs){if(m.isPlayer)continue;const ros=rosterOf(m);const want=2+Math.round(m.p.ambition/28);
    // recruiting: pitch the best fighter they can afford and who will listen
    if(ros.length<want&&m.coin>30){const cand=freeAgents().filter(g=>(m.fame>=reqFame(g)||m.coin>askWage(g)*fameBypassX(g,m)*10)&&askWage(g)*4<m.coin).sort((a,b)=>(effOvr(b)*(1+m.p.ambition/100)-askWage(b))-(effOvr(a)*(1+m.p.ambition/100)-askWage(a)))[0];
      if(cand){cand.interest[m.id]=capInterest(cand,m,interestOf(cand,m)+8+Math.round(m.p.show/12));
        mlog(m,_T`courted ${cand.name}`);if(cand.scout>=1&&Math.random()<.6)mnews(_T`${esc(m.ludus)} courts <b>${esc(cand.name)}</b> — your scouts say the feast ran late.`);
        const top=suitors(cand)[0];
        const nil=m.fame<reqFame(cand);if((top.m===m&&interestOf(cand,m)>=50)||(nil&&Math.random()<.5)){cand.contract={mgr:m.id,wage:nil?Math.ceil(askWage(cand)*fameBypassX(cand,m)):askWage(cand),weeks:6+rnd(7),since:w.week};cand.unsigned=0;mlog(m,_T`signed ${cand.name}${nil?_T(' — paying far over the odds'):''}`);mnews(_T`${esc(m.ludus)} signs <b>${esc(cand.name)}</b> (${'★'.repeat(starsOf(pubOvr(cand)))}).`)}}}
    // poaching: cunning lanistae prey on unhappy fighters in other stables
    if(m.p.cunning>=55&&m.coin>80&&Math.random()<m.p.cunning/420){const pool=w.glads.filter(g=>g.alive&&!g.noPoach&&g.contract&&g.contract.mgr!==m.id&&!(mgrById(g.contract.mgr).isPlayer&&m.pact&&m.pact>=w.week)&&g.morale<50&&effOvr(g)>=60&&m.fame>=reqFame(g));const prey=pool.sort((a,b)=>((m.rivalry||0)>=45?(mgrById(b.contract.mgr).isPlayer?1:0)-(mgrById(a.contract.mgr).isPlayer?1:0):0)||effOvr(b)-effOvr(a))[0];
      if(prey){const from=mgrById(prey.contract.mgr);const fee=buyout(prey);if(m.coin>fee+40&&Math.random()*100>loyaltyOf(prey)-15){m.coin-=fee;from.coin+=fee;m.poached++;mlog(m,_T`poached ${prey.name} from ${from.ludus} (${fee} coin buyout)`);mlog(from,_T`lost ${prey.name} to ${m.ludus}'s poaching`);ghist(prey,_T`poached from ${esc(from.ludus)} by ${esc(m.ludus)}`);prey.contract={mgr:m.id,wage:Math.round(askWage(prey)*1.15),weeks:8,since:w.week};prey.morale=65;if(from.isPlayer){bumpRival(m,12,_T('the feud is on'));tnews(_T`${esc(m.name)} poached ${esc(prey.name)} from you (${fee}-coin buyout).`,'bad')}mnews(_T`<b>${esc(m.name)} poaches ${esc(prey.name)}</b> from ${esc(from.ludus)} for a ${fee}-coin buyout.`,from.isPlayer?'bad':'big')}}}
    if(ros.length>want+1){const cut=ros.sort((a,b)=>effOvr(a)-effOvr(b))[0];ghist(cut,_T`released by ${esc(m.ludus)}`);cut.contract=null;mlog(m,_T`released ${cut.name}`);mnews(_T`${esc(m.ludus)} releases ${esc(cut.name)}.`)}
  }
}
/* ================= FATES IN THE LEAGUE (v0.18) =================
   Every fighter in a league bout meets the printed Fate table (rulebook p.54-55), exactly as in the
   board game — winners included:
     0-16 CF   Damnatio / Fatal Charades  -> condemned to die
     17-19 CF  Judgement: Thumb of Flavius -> d6: 4-6 spared (to 20 CF); 1-3 a d12 picks the death
     20-49 CF  Survival: Ludus Flavius     -> lives, returns to their stable
     50+ CF    Freedom: Rudis              -> may take freedom and leave the league, or fight on
   League addition, BLOOD MONEY: a lanista may pay the editor to buy back a condemned fighter's life.
   Your fighters' thumbs, blood money and rudis choices wait for YOU on Match Week (the week cannot
   end until they are settled). CPU stables decide by greed, honor and the fighter's value. */
function bloodPrice(glad,fate){return Math.max(5,Math.round(((fate.g==='Damnatio'?30:fate.g==='Fatal Charades'?22:18)+effOvr(glad)*0.35+(glad.fame||0)*0.2)*RL(W_(),'blood')))}
// what an obituary needs beyond the name: rating, last Crowd Favor, fame, and who in the crowd mourns them
function graveExtra(glad){const kin=typeof kinOf==='function'?kinOf(glad).map(r=>`${r.name} (${r.kin.rel})`):[];return {ovr:effOvr(glad),f:glad.lastCF??null,fame:glad.fame||0,kin,fem:!!glad.fem}}
/* killFighter — a fighter dies: history, the grave list, the lanista's deaths and fame. */
function killFighter(glad,mgr,fate,where){const w=W_();
  ghist(glad,_T`died at ${where}: ${fate.g} · ${fate.n}`);glad.alive=false;if(mgr)glad.contract=null;
  w.grave.unshift({...graveExtra(glad),name:glad.name,cls:glad.cls,age:gAge(glad),wk:w.week,s:w.season,fate:`${fate.g} · ${fate.n}`,mgr:mgr?mgr.name:null,rec:{...glad.rec}});w.grave=w.grave.slice(0,40);
  if(mgr){mgr.deaths++;mgr.fame=clamp(mgr.fame-2,0,100);if(mgr.isPlayer)tnews(_T`${esc(glad.name)} died on the sand — ${fate.g} · ${fate.n} — aged ${gAge(glad)}.`,'bad')}}
/* v0.24: every league freedom is written among the Liberti in the Annals */
function libertyEntry(glad,mgr,where,how){if(typeof libertiAdd!=='function')return;const w=W_();const R=glad.rec||{};libertiAdd({career:{events:R.ev||0,wins:R.w||0,kP:R.kp||0,kN:R.kn||0,dmg:R.dmg||0,taken:R.taken||0,cfSum:R.cfSum||0,best:R.best||glad.lastCF||0,coin:R.coin||0,house:R.house||0,arenas:(R.arenas||[]).length,fame:glad.fame||0,fans:typeof fansFor==='function'?fansFor(glad.name):0,age:typeof gAge==='function'?gAge(glad):null,ludus:mgr?mgr.ludus:null,seasons:Math.max(1,(w.season-((glad.debut&&glad.debut.s)||w.season))+1)},name:glad.name,cls:CLASSES[glad.cls]?glad.cls:'soldier',clsName:CLASSES[glad.cls]?CLASSES[glad.cls].name:glad.cls,cf:glad.lastCF||50,event:_T`the league${mgr?' · '+mgr.ludus:''}`,loc:where,date:new Date().toISOString().slice(0,10),kP:glad.rec?glad.rec.kp:0,kN:glad.rec?glad.rec.kn:0,wins:glad.rec?glad.rec.w:0,events:glad.rec?glad.rec.ev:0,coin:0,portrait:gLook(glad),league:how,mine:!!(mgr&&mgr.isPlayer)}).catch(()=>{})}
/* freeFighter — a fighter takes the rudis and leaves the league (written among the Liberti). */
function freeFighter(glad,mgr,where){if(mgr&&mgr.isPlayer){const w9=W_();w9.rudisFreed=(w9.rudisFreed||0)+1}ghist(glad,_T`took the rudis at ${where} — freedom`);glad.alive=false;glad.freed2=true;if(mgr)glad.contract=null;libertyEntry(glad,mgr,where,_T('took the rudis in the league'));
  mnews(_T`<b>${esc(glad.name)}</b> takes the <b>rudis</b> at ${where}: 50+ Crowd Favor buys a lifetime's freedom. The crowd stands.`,'big');
  if(mgr&&mgr.isPlayer)tnews(_T`${esc(glad.name)} took the rudis and walked free.`)}
/* buyBack — the lanista pays blood money for a condemned fighter's life (+loyalty, −morale). */
function buyBack(glad,mgr,fate,price){mgr.coin-=price;glad.boughtBack=(glad.boughtBack||0)+1;glad.rec.surv++;glad.morale=clamp(glad.morale-4,0,100);glad.loyB=clamp((glad.loyB||0)+8,0,25);
  ghist(glad,_T`condemned (${fate.g} · ${fate.n}) — bought back by ${esc(mgr.ludus)} for ${coinAmt87(price)}`);
  if(mgr.isPlayer)tnews(_T`Paid the editor ${coinAmt87(price)} for ${esc(glad.name)}'s life (${fate.n}). They will not forget it.`)}
/* leagueFate — the printed Fate table for one league fighter after a bout: survive, the rudis (if ready), the Thumb, condemned; your fighters' decisions wait on Match Week; rookies and the sandbox may show clemency; CPU houses may pay blood money. */
function leagueFate(glad,row,mgr,bout,boutIdx,opt){
  const w=W_();const where=LOCATIONS[w.night.loc].n;const f=row.f;let F=fateRow(f);const mine=mgr&&mgr.isPlayer;
  // v0.37: a thumbs-down on a truce goes straight to the condemned path, whatever the CF
  const td=/^Thumbs down · /.test(row.fate||'');if(td){const nm9=String(row.fate).split(' · ')[1];F=FATES.find(x=>x.n===nm9)||FATES[0]}
  // 20-49: Survival — the Ludus Flavius
  if(F.g==='Survival'){glad.rec.surv++;return {vd:'ludus',fname:_T('Ludus Flavius')}}
  // 50+: the Rudis
  if(F.g==='Freedom'&&!rudisReady(glad)){glad.rec.surv++;ghist(glad,_T`earned the rudis at ${where} (${cfAmt87(f)}) — but not the record to claim it yet`);
    return {vd:'ludus',fname:_T('Rudis · not yet'),line:_T`${esc(glad.name)} earns the rudis (${cfAmt87(f)}) — but freedom needs a record: ${glad.rec.ev}/${RUDIS_MIN.ev} events and ${glad.rec.w}/${RUDIS_MIN.w} wins. Back to the ludus.`}}
  if(F.g==='Freedom'){glad.rec.surv++;
    if(mine){(w.pend=w.pend||[]).push({t:'rudis',gid:glad.id,bi:boutIdx,f});return {vd:'p-rudis',fname:_T('Rudis'),line:_T`${esc(glad.name)} earns the <b>rudis</b> (${cfAmt87(f)}) — your decision awaits`}}
    const takes=!glad.sotonium&&(gAge(glad)>=28||Math.random()<.35);if(takes){freeFighter(glad,mgr,where);return {vd:'freed',fname:_T('Rudis'),line:_T`${esc(glad.name)} takes the rudis and walks free`}}
    ghist(glad,_T`earned the rudis at ${where} (${cfAmt87(f)}) — and chose to fight on`);return {vd:'rudis-stay',fname:_T('Rudis'),line:_T`${esc(glad.name)} earns the rudis — and chooses to fight on`}}
  // 17-19: Judgement — the Thumb of Flavius
  let cond=F,d6=null,d12=null;
  if(F.n==='Thumb of Flavius'){
    if(mine&&!(opt.live&&row.human)){(w.pend=w.pend||[]).push({t:'thumb',gid:glad.id,bi:boutIdx,f});return {vd:'p-thumb',fname:_T('Thumb of Flavius'),line:_T`${esc(glad.name)} faces the <b>Thumb of Flavius</b> (${cfAmt87(f)}) — you roll the die on Match Week`}}
    if(fateSpared(row.fate)){glad.rec.surv++;return {vd:'spared',fname:_T('Thumb of Flavius · spared'),line:_T`${esc(glad.name)} faces the thumb (${cfAmt87(f)}) — it goes up. Spared.`}}
    const nm2=String(row.fate||'').split(' · ')[1];cond=FATES.find(x=>x.n===nm2)||FATES[0];
  }
  if(glad.sotonium){glad.rec.surv++;ghist(glad,_T`condemned (${cond.n}) — the crowd would not allow it: clemency, as always`);return {vd:'clemency',fname:`${cond.g} · ${cond.n}`,line:_T`${esc(glad.name)} is condemned (${cfAmt87(f)}) — and the whole arena rises for <b>${esc(glad.name)}</b>. The editor has no choice. Clemency.`}}
  if(glad.rec.ev<=3&&Math.random()*100<((w.rules||RULES_DEF).rookmercy||0)){glad.rec.surv++;ghist(glad,_T`condemned as a rookie (${cond.n}) — the editor spared the green one`);return {vd:'clemency',fname:`${cond.g} · ${cond.n}`,line:_T`${esc(glad.name)} is condemned, but the editor spares a rookie`}}
  // 0-16 (or a thumb gone down): condemned — unless someone pays the editor, or the sandbox shows clemency
  if(Math.random()>=RL(w,'death')){glad.rec.surv++;ghist(glad,_T`condemned (${cond.n}) — the editor showed clemency`);
    return {vd:'clemency',fname:`${cond.g} · ${cond.n}`,line:_T`${esc(glad.name)} is condemned (${cond.n}, ${cfAmt87(f)}) — but the editor waves it away. Clemency.`}}
  const price=bloodPrice(glad,cond);
  if(mine){(w.pend=w.pend||[]).push({t:'blood',gid:glad.id,bi:boutIdx,f,fi:FATES.indexOf(cond),price});return {vd:'p-blood',fname:`${cond.g} · ${cond.n}`,line:_T`${esc(glad.name)} is <b>condemned</b> — ${cond.n} (${cfAmt87(f)}). Blood money: ${coinAmt87(price)}, your decision`}}
  if(mgr&&mgr.coin>=price+40&&(effOvr(glad)>=58||(glad.fame||0)>=35)&&Math.random()<.3+(100-mgr.p.greed)/250+mgr.p.honor/400){buyBack(glad,mgr,cond,price);
    return {vd:'bought',fname:`${cond.g} · ${cond.n}`,line:_T`${esc(glad.name)} is condemned (${cond.n}) — ${esc(mgr.ludus)} pays ${coinAmt87(price)} in blood money`}}
  killFighter(glad,mgr,cond,where);return {vd:'killed',fname:`${cond.g} · ${cond.n}`,line:_T`<b>${esc(glad.name)} dies</b> — ${cond.g} · ${cond.n} (${cfAmt87(f)})`};
}
// settle one of YOUR pending verdicts; returns a message
/* v0.46: the rudis is for veterans — a fighter must have fought RUDIS_MIN.ev events and won RUDIS_MIN.w before the
   Freedom Fate can free them. Until then a rich one may ask to BUY their freedom from you with their own purse. */
const RUDIS_MIN={ev:12,w:4};
/* rudisReady — whether a fighter has the record to claim the rudis (RUDIS_MIN). */
const rudisReady=glad=>!!glad&&(glad.rec.ev>=RUDIS_MIN.ev&&glad.rec.w>=RUDIS_MIN.w);
/* freedomPrice — what a fighter pays to buy their freedom from you. */
const freedomPrice=glad=>Math.round(60+effOvr(glad)*1.5+(glad.fame||0));
/* settlePending — settles one of YOUR pending verdicts (thumb, blood money, levy, a freedom request, the rudis) and returns the message. */
function settlePending(pendIdx,choice,extra){
  const w=W_(),m=me();const P=(w.pend||[])[pendIdx];if(!P)return '';const g=gById(P.gid);if(!g){w.pend.splice(pendIdx,1);return ''}
  const where=LOCATIONS[w.night.loc].n;const b=w.night.bouts[P.bi];const row=b&&b.res&&b.res.rows.find(x=>x.gid===g.id);
  const setRow=(vd,fname)=>{if(row){row.vd=vd;if(fname)row.fname=fname}};
  w.pend.splice(pendIdx,1);
  if(P.t==='thumb'){ // the ritual already ran in the UI; extra={d6,d12}
    if(extra.d6>=4){g.rec.surv++;ghist(g,_T`faced the Thumb of Flavius at ${where} — the d6 showed ${extra.d6}: spared`);setRow('spared',_T('Thumb of Flavius · spared'));tnews(_T`${esc(g.name)} faced the thumb and rolled ${extra.d6}: spared.`);return _T`The thumb goes up for ${esc(g.name)}.`}
    const F=fateRow(extra.d12);const price=bloodPrice(g,F);w.pend.splice(pendIdx,0,{t:'blood',gid:g.id,bi:P.bi,f:P.f,fi:FATES.indexOf(F),price,thumb:1});setRow('p-blood',`${F.g} · ${F.n}`);
    return _T`The thumb goes down (${extra.d6}); the d12 names ${F.n}. You may still pay the editor ${coinAmt87(price)}.`}
  if(P.t==='blood'){const F=FATES[P.fi]||FATES[0];
    if(choice==='pay'){if(m.coin<P.price){w.pend.splice(pendIdx,0,P);return _T('Not enough coin for the editor.')}buyBack(g,m,F,P.price);setRow('bought',`${F.g} · ${F.n}`);return _T`${coinAmt87(P.price)} changes hands. ${esc(g.name)} lives — and owes you a life.`}
    killFighter(g,m,F,where);setRow('killed',`${F.g} · ${F.n}`);return _T`The sentence stands. ${esc(g.name)} is gone: ${F.n}.`}
  if(P.t==='levy'){
    if(choice==='bribe'){if(m.coin<P.price){w.pend.splice(pendIdx,0,P);return _T('Not enough coin for the officer.')}
      if(Math.random()<.15){m.coin-=P.price;m.fame=clamp(m.fame-3,0,100);ghist(g,_T`the levy took them despite a bribe — ${P.war.rome} against ${P.war.foe}`);g.inj={until:P.until,label:_T`serving with ${P.war.rome} against ${P.war.foe}`,pen:0,war:P.war};tnews(_T`The officer pocketed ${coinAmt87(P.price)} and took ${esc(g.name)} anyway. Fame −3.`,'bad');return _T`The officer takes your ${coinAmt87(P.price)}, thanks you — and marches ${esc(g.name)} off regardless. Word gets around (fame −3).`}
      m.coin-=P.price;m.p.honor=clamp(m.p.honor-1,1,95);ghist(g,_T`spared the levy — ${esc(m.ludus)} paid the officer ${coinAmt87(P.price)}`);g.loyB=clamp((g.loyB||0)+4,0,25);tnews(_T`Bribed the levy officer ${coinAmt87(P.price)} to keep ${esc(g.name)}.`);return _T`${coinAmt87(P.price)} and ${esc(g.name)}'s name comes off the list. They know who paid (+4 loyalty).`}
    ghist(g,_T`called up: marched with ${P.war.rome} against ${P.war.foe}`);g.inj={until:P.until,label:_T`serving with ${P.war.rome} against ${P.war.foe}`,pen:0,war:P.war};m.p.honor=clamp(m.p.honor+1,1,95);
    tnews(_T`${esc(g.name)} marched with ${esc(P.war.rome)} against ${esc(P.war.foe)}. Pray.`,'bad');return _T`${esc(g.name)} marches. Survive the war and they come home a hero.`}
  if(P.t==='buyfree'){
    if(choice==='sell'){g.purse=Math.max(0,(g.purse||0)-P.price);m.coin+=P.price;ghist(g,_T`bought their freedom from ${esc(m.ludus)} for ${coinAmt87(P.price)}`);g.alive=false;g.freed2=true;g.contract=null;try{libertyEntry(g,m,_T('the Gate of Life'),_T('bought their freedom'))}catch(e){}
      m.p.honor=clamp(m.p.honor+1,1,95);return _T`${esc(g.name)} counts ${coinAmt87(P.price)} onto your table and walks out free. The treasury is richer; the roster is not.`}
    g.freeAsked=w.week;g.morale=clamp(g.morale-12,0,100);g.loyB=clamp((g.loyB||0)-4,-25,25);ghist(g,_T`asked to buy their freedom — and was refused`);return _T`You refuse. ${esc(g.name)} pockets the coin again, jaw set (morale −12, loyalty −4).`}
  if(P.t==='rudis'){
    if(choice==='free'){freeFighter(g,m,where);m.p.honor=clamp(m.p.honor+2,1,95);setRow('freed',_T('Rudis'));return _T`${esc(g.name)} walks out the Gate of Life. Your Honor rises for letting them go.`}
    const stay=Math.random()*100<loyaltyOf(g)+10;
    if(stay){ghist(g,_T`earned the rudis — and stayed with ${esc(m.ludus)}`);g.morale=clamp(g.morale+5,0,100);setRow('rudis-stay',_T('Rudis'));return _T`${esc(g.name)} sets the rudis on your table… and stays. Loyalty like that is rare.`}
    g.morale=clamp(g.morale-10,0,100);freeFighter(g,m,where);setRow('freed',_T('Rudis'));return _T`${esc(g.name)} hears you out, thanks you, and walks free anyway.`}
  return '';
}
/* pendingHTML — Match Week's list of your pending verdicts with their buttons. */
function pendingHTML(){
  const w=W_(),m=me();const P=w.pend||[];if(!P.length)return '';
  return `<div class="card2" id="pendbox" style="border-color:var(--gold);margin-bottom:10px"><div class="sect" style="margin-top:0">${_T`⚖ Verdicts awaiting you — the week cannot end until they are settled`}</div>
    <div class="list2" style="grid-template-columns:minmax(0,1fr)">${P.map((x,pi)=>{const g=gById(x.gid);if(!g)return '';const F=FATES[x.fi]||null;
      return `<div class="lrow" style="--pc:var(--gold)">${gArt(g,'sm')}<div class="t" id="pend${pi}"><b>${esc(g.name)}</b><small>${x.t==='levy'?_T('⚔️ the levy'):x.t==='buyfree'?_T('👛 a freedom purchase'):x.f+' CF · '}${x.t==='levy'||x.t==='buyfree'?'':x.t==='thumb'?_T('the Thumb of Flavius (17-19 CF)'):x.t==='blood'?_T`condemned: ${F?esc(F.g+' · '+F.n):''}`:_T('the Rudis (50+ CF): freedom is theirs to take')}</small>
        ${x.t==='levy'?`<p class="rc-sub" style="margin:4px 0">${_T`${esc(x.war.rome)} march against ${esc(x.war.foe)} at ${esc(x.war.city)}. Soldiers of the sand serve ${x.until-w.week} week${x.until-w.week===1?'':'s'}; many do not return — those who do come home heroes.`}</p><div class="acts"><button class="btn primary" type="button" data-mg="plevy" data-id="${pi}|bribe" ${dis(needCoin(m,x.price))}>${_T`💰 Bribe the officer ${coinAmt87(x.price)}<small>keeps them home · +4 loyalty · −1 Honor · a small chance he takes both</small>`}</button><button class="btn" type="button" data-mg="plevy" data-id="${pi}|march">${_T`Let them march<small>+1 Honor · a hero's return, or a grave</small>`}</button></div>`
         :x.t==='thumb'?`<div class="acts" style="margin-top:6px"><button class="btn primary" type="button" data-mg="pthumb" data-id="${pi}" style="flex:0 1 auto">${_T`🎲 Face the thumb<small>roll the d6 yourself: 4-6 spares them</small>`}</button></div>`
         :x.t==='blood'?`<p class="rc-sub" style="margin:4px 0">${F?esc(F.t):''}</p><div class="acts"><button class="btn primary" type="button" data-mg="pblood" data-id="${pi}|pay" ${dis([m.coin<x.price,_T`Blood money is ${x.price} coin — the treasury holds ${m.coin}. Win it, bet it, or let the sentence stand.`])}>${_T`💰 Pay the editor ${coinAmt87(x.price)}<small>they live, owe you (+8 loyalty), −4 morale</small>`}</button><button class="btn" type="button" data-mg="pblood" data-id="${pi}|let">${_T`Let the sentence stand<small>they die: ${F?esc(F.n):''}</small>`}</button></div>`
         :x.t==='buyfree'?`<p class="rc-sub" style="margin:4px 0">${_T`${esc(g.name)} has saved <b>${coinAmt87(g.purse||0)}</b> of their own and asks to buy their freedom for <b>${x.price}</b> — before the record the rudis asks for (${g.rec.ev}/${RUDIS_MIN.ev} events, ${g.rec.w}/${RUDIS_MIN.w} wins).`}</p><div class="acts"><button class="btn primary" type="button" data-mg="prudis" data-id="${pi}|sell">${_T`💰 Take the coin — let them go<small>${coinAmt87('+'+(x.price))} · +1 Honor</small>`}</button><button class="btn" type="button" data-mg="prudis" data-id="${pi}|keep">${_T`Refuse<small>morale −12 · loyalty −4</small>`}</button></div>`
         :`<div class="acts" style="margin-top:6px"><button class="btn" type="button" data-mg="prudis" data-id="${pi}|free">${_T`🗡 Grant them freedom<small>they leave the league · +2 Honor</small>`}</button><button class="btn primary" type="button" data-mg="prudis" data-id="${pi}|stay">${_T`Ask them to stay<small>loyalty ${loyaltyOf(g)} decides — they may leave anyway</small>`}</button></div>`}
      </div></div>`}).join('')}</div></div>`;
}
// v0.16 training regimes: cost per week for the whole stable; gain = +1 rating chance per fighter; inj = injury chance
const TRAIN_REGIMES={off:{n:'No drills',c:0,gain:0,inj:0},light:{n:'Light drills',c:6,gain:.10,inj:.005},std:{n:'Standard drills',c:15,gain:.22,inj:.03},hard:{n:'Brutal drills',c:30,gain:.38,inj:.10}};
/* PTRAIN_COST — a personal trainer for one fighter, per week. TWEAK: the 8. */
const PTRAIN_COST=8; // a personal trainer (doctore) for one fighter, for one week (re-hired week by week)
/* Every injury names the care it answers to (item: certain injuries need certain hands):
   rest    — heals on its own schedule; a bathhouse day shortens it
   medicus — the Medicus's regimen clears it (rest also works, slowly)
   surgeon — ONLY the surgeon's knife clears it; left untreated it does not heal, it festers */
const INJ_REQ={'a sprained ankle':'rest','a wrenched knee at the palus':'rest','a sparring bruise that will not quit':'rest',
 'a pulled shoulder':'medicus','a torn shoulder':'medicus','a deep thigh cut':'medicus','a mangled hand':'medicus','fell on their own sword (shallow, but the barracks will not let it go)':'medicus',
 'a cracked rib':'surgeon','cracked ribs':'surgeon','a rattled skull':'surgeon'};
/* injReq — what care an injury needs: rest, medicus, surgeon (or war). */
const injReq=injury=>injury.war?'war':(injury.req||INJ_REQ[injury.label]||'medicus');
/* SURGEON — the surgeon's fee. TWEAK: the 18. */
const SURGEON=18; // the surgeon's knife, from the weekly repair budget
/* injLoc — the body location an injury label hurts (for the infirmary avatar). */
const injLoc=label=>/shoulder|hand|sword/.test(label)?'rarm':/thigh|knee|ankle/.test(label)?'rleg':/rib/.test(label)?'chest':/skull/.test(label)?'head':'chest';
/* Rivalry: 0-100 heat each CPU lanista holds toward YOUR house. Poaching, outbidding and beating their
   fighters raises it; time cools it. Hot rivals poach your fighters first, bet against your entries and talk. */
/* rivalTier — a rivalry heat as a word (Cordial / Wary / Bitter / Blood feud). */
const rivalTier=heat=>(heat||0)>=60?_T('Blood feud'):(heat||0)>=35?_T('Bitter'):(heat||0)>=15?_T('Wary'):_T('Cordial');
/* bumpRival — raises (or cools) a rival lanista's heat toward your house and announces a new tier. */
function bumpRival(mgr,heat,why){
  if(!mgr||mgr.isPlayer)return;const before=mgr.rivalry||0;mgr.rivalry=clamp(Math.round(before+heat),0,100);
  const A=rivalTier(before),B=rivalTier(mgr.rivalry);
  if(A!==B&&heat>0)mnews(_T`<b>${esc(mgr.name)}</b> now counts ${esc(me().ludus)} a ${B==='Blood feud'?_T('BLOOD ENEMY'):B.toLowerCase()+' rival'}${why?` — ${why}`:''}.`,B==='Blood feud'?'bad':'');
}
/* buyout — the buyout fee to poach a signed fighter: wage × weeks left × 1.4 + rating. */
const buyout=glad=>glad.contract?Math.round(glad.contract.wage*Math.max(2,glad.contract.weeks)*1.4+effOvr(glad)*0.8):0;

/* ---------- recruiting actions (hours) ---------- */
/* scoutGlad — scouts a fighter with 6 simulated sparring bouts against similar fighters: win/survive rates, CF, damage, style tags. */
async function scoutGlad(glad,onProg){
  const w=W_();const pool=w.glads.filter(x=>x.alive&&x!==glad&&Math.abs(effOvr(x)-effOvr(glad))<=12);
  const cfgs=Array.from({length:6},()=>()=>{const opp=shuffle([...pool]).slice(0,3);while(opp.length<3)opp.push(genGlad({ovr:effOvr(glad)}));
    return {ev:'democritus',loc:3,seats:[seatFor(glad),...opp.map(o=>seatFor(o))],opts:{mods:false,mandata:true,optOffers:true,eaglePot:true,spect:0}}});
  const rs=(await simBatch(cfgs,onProg)).filter(r=>r&&!r.error);
  const mine=rs.map(r=>r.rows.find(x=>x.mgrId===glad.id)).filter(Boolean);const n=mine.length||1;
  const avg=k=>Math.round(mine.reduce((s,x)=>s+(x[k]||0),0)/n*10)/10;
  const rep={n:mine.length,win:mine.filter(x=>x.won).length,surv:mine.filter(x=>x.survives).length,cf:avg('f'),dmg:avg('dmg'),taken:avg('taken'),pots:avg('pots'),kn:avg('kn'),kp:avg('kp'),turns:Math.round(mine.reduce((s,x,i)=>s+(x.elimTurn||rs[i].turns),0)/n),wk:w.week};
  const st=styleOf({cpu:true,pers:glad.pers,diff:'normal',cls:CLASSES[glad.cls]?glad.cls:'soldier',stats:{},trophies:[],coin:0,cf:0});
  rep.tags=PERS_KEYS.map(([k,l])=>[l,st[k]]).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]);
  glad.report=rep;glad.scout=Math.min(3,(glad.scout||0)+(glad.scout>=1?2:2));
  return rep;
}
/* pitch — pitches a fighter on one motive: interest moves by how well you grade on it. */
function pitch(glad,mot){
  const m=me();const sc=mgrScore(m,mot,glad);const wgt=(glad.motives.find(x=>x[0]===mot)||[0,0])[1];
  let d=Math.round(4+wgt*28*(sc/100)+rnd(5)-2);if(!wgt)d=Math.round(1+rnd(3));if(wgt&&sc<35)d=-Math.round(3+rnd(4));
  const before=interestOf(glad,m);glad.interest[m.id]=capInterest(glad,m,before+d);return glad.interest[m.id]-before;
}
/* visitCost — cost of a feast for a fighter (by stars). */
function visitCost(glad){return 8+starsOf(pubOvr(glad))*6}
/* giftCost — cost of a gift for a fighter (by stars). */
const giftCost=glad=>4+starsOf(pubOvr(glad))*3;
// a gift lands hardest on coin-hungry fighters; even the proud take the wine
function doGiftFighter(glad){const m=me();const w=W_();m.coin-=giftCost(glad);(glad.giftWk=glad.giftWk||{})[m.id]=w.week;
  const coinW=(glad.motives.find(x=>x[0]==='coin')||[0,0])[1];
  const d=Math.round(4+coinW*16+rnd(4));const b=interestOf(glad,m);glad.interest[m.id]=capInterest(glad,m,b+d);return glad.interest[m.id]-b}
/* doVisit — hosts a feast for a fighter (once every 3 weeks): a big interest swing. */
function doVisit(glad){const m=me();const w=W_();if(glad.visits[m.id]&&w.week-glad.visits[m.id]<3)return null;m.coin-=visitCost(glad);glad.visits[m.id]=w.week;const sp=(glad.motives.find(x=>x[0]==='spectacle')||[0,0])[1]+(glad.motives.find(x=>x[0]==='coin')||[0,0])[1];const d=Math.round(10+sp*14+m.p.show/12+rnd(5));const b=interestOf(glad,m);glad.interest[m.id]=capInterest(glad,m,b+d);return glad.interest[m.id]-b}
/* offerVerdict — whether a fighter accepts your offer (wage, weeks, bonus, pledge) and why not — no side effects. */
function offerVerdict(glad,wage,weeks,bonus,pledge=false){
  const m=me();const ask=askWage(glad);const eff=wage+bonus/Math.max(1,weeks);const pull=coinPull(glad,eff);
  const iv=interestOf(glad,m)+(pledge?12:0)+pull; // a pledged main event sweetens the table — and so, far more, does coin
  const s=suitors(glad);const top=s[0];
  const need=starsOf(effOvr(glad))<=2?40:52;
  if(m.fame<reqFame(glad)&&eff<ask*fameBypassX(glad,m))return {ok:false,why:_T`${glad.name} won't sign with an ${mgrTier(m.fame)} ludus (fame ${reqFame(glad)}+ expected) — unless the money is extraordinary: about ${Math.ceil(ask*fameBypassX(glad,m))} coin a week would do it.`};
  if(iv<need)return {ok:false,why:_T`${glad.name} is not interested enough yet (${iv}/${need}, of which ${pull} is your money). Raise the wage — every coin over ${ask} a week counts most — or pitch, visit and scout next week.`};
  if(top.m!==m&&top.v>iv+4)return {ok:false,why:_T`${glad.name} is leaning toward ${top.m.ludus} (${top.v} interest vs your ${iv} with the money). Outbid them: a bigger wage or bonus moves this fastest.`};
  const accept=ask*(1.22-Math.min(iv,110)/220)*(1-.04*(typeof facLvl==='function'?facLvl(m,'barracks'):0)); // good barracks: they sign for less
  if(eff<accept)return {ok:false,why:_T`${glad.name} wants about ${Math.ceil(accept)} coin a week${bonus?_T(' (bonus included)'):''}.`};
  if(m.coin<bonus+wage)return {ok:false,why:_T('Your treasury cannot cover the bonus and the first week.')};
  return {ok:true,pull};
}
/* signGlad — signs a fighter to your ludus. */
function signGlad(glad,wage,weeks,bonus,pledge=false){const m=me();m.coin-=bonus;glad.contract={mgr:m.id,wage,weeks,since:W_().week};if(pledge)glad.pledge={mgr:m.id,due:W_().week+2};glad.unsigned=0;glad.morale=clamp(60+Math.round((wage-askWage(glad))*2),30,95);glad.scout=Math.max(glad.scout||0,2);ghist(glad,_T`signed with ${esc(m.ludus)} (${wage}/wk)`);mnews(_T`<b>${esc(glad.name)} signs with ${esc(m.ludus)}</b>: ${coinAmt87(wage)} a week for ${weeks} weeks${bonus?_T`, ${coinAmt87(bonus)} bonus`:''}.`,'big');for(const o of W_().mgrs)if(o!==m){if(interestOf(glad,o)>=55)bumpRival(o,8,_T`outbid for ${esc(glad.name)}`);glad.interest[o.id]=Math.round(interestOf(glad,o)*0.6)}}
/* poachVerdict — whether a signed fighter would leave their house for you, and the buyout. */
function poachVerdict(glad,wage){
  const m=me();const pull=coinPull(glad,wage);const iv=interestOf(glad,m)+pull;const loy=loyaltyOf(glad);const fee=buyout(glad);
  if(glad.noPoach)return {ok:false,why:_T`${glad.name} fights for ${glad.fem?_T('her'):_T('his')} father's house — no purse on earth will move ${glad.fem?_T('her'):_T('him')}.`};
  {const fr=mgrById(glad.contract.mgr);if(fr&&fr.pact&&fr.pact>=W_().week)return {ok:false,why:_T`You have a non-poaching pact with ${fr.ludus} until week ${wkOf(fr.pact)}.`}}
  if(m.fame<reqFame(glad)&&wage<askWage(glad)*fameBypassX(glad,m))return {ok:false,why:_T`${glad.name} won't consider an ${mgrTier(m.fame)} ludus — unless you pay about ${Math.ceil(askWage(glad)*fameBypassX(glad,m))} a week.`};
  if(iv<=loy)return {ok:false,why:_T`${glad.name}'s loyalty to ${mgrById(glad.contract.mgr).ludus} (${loy}) is higher than their interest in you (${iv}, ${pull} of it your money). Pay more, or pitch and visit first; unhappy fighters are easier.`};
  if(wage<askWage(glad))return {ok:false,why:_T`They would want at least ${askWage(glad)} coin a week.`};
  if(m.coin<fee+wage)return {ok:false,why:_T`The buyout is ${fee} coin; your treasury cannot cover it.`};
  return {ok:true,fee};
}
/* doPoach — poaches a fighter: pays the buyout, angers the house, honor-minded fighters cool on you. */
function doPoach(glad,wage,weeks){
  const m=me(),from=mgrById(glad.contract.mgr);const fee=buyout(glad);m.coin-=fee;from.coin+=fee;m.poached=(m.poached||0)+1;from.poachedByMe=(from.poachedByMe||0)+1;if(typeof mlog==='function')mlog(from,_T`lost ${glad.name} to ${m.ludus}'s poaching`);
  ghist(glad,_T`poached from ${esc(from.ludus)} by ${esc(m.ludus)}`);glad.contract={mgr:m.id,wage,weeks,since:W_().week};glad.morale=70;glad.scout=Math.max(glad.scout||0,2);
  mnews(_T`<b>You poach ${esc(glad.name)}</b> from ${esc(from.ludus)} for a ${fee}-coin buyout. ${m.p.honor>=60?_T('Honorable fighters will remember it.'):''}`,'big');
  tnews(_T`Poached ${esc(glad.name)} from ${esc(from.ludus)} (${coinAmt87(fee)} buyout).`);
  // rivals and honor-minded fighters take note
  from.grudge=(from.grudge||0)+1;bumpRival(from,25,_T`you poached ${esc(glad.name)}`);for(const x of W_().glads)if(x.alive&&x.motives.some(t=>t[0]==='honor'))x.interest[m.id]=Math.max(0,interestOf(x,m)-4);
}

/* ---------- wallet hooks for live wagers during a watched bout ---------- */
/* mgrPurse — the open career's treasury as a wager purse. */
function mgrPurse(){const m=me();return m?{coin:m.coin,won:m.betWon||0,lost:m.betLost||0,bets:m.betCount||0,history:m.betHistory||[],name:m.name,ludus:m.ludus}:{coin:0,name:'the lanista'}}
/* mgrPurseSet — writes a wager purse back into the open career's treasury. */
function mgrPurseSet(v){const m=me();if(!m)return;const d=v.coin-m.coin;m.coin=v.coin;if(!v.noBet)m.betNet=(m.betNet||0)+d;m.betWon=v.won||0;m.betLost=v.lost||0;m.betCount=v.bets||0;m.betHistory=(v.history||[]).slice(-40);saveWorld()}

/* ================= UI ================= */
/* mgrPortrait — a lanista's portrait. */
function mgrPortrait(mgr,size='sm'){return portraitHTML({name:mgr.name,portrait:mgr.portrait||{helm:'laurel'},color:mgr.color},size)}
// v0.15: league fighters wear their own generated faces (like the Ludus tiles), not class card art
/* gArt — a league fighter's portrait with their token. */
function gArt(glad,size='xs'){
  if(CLASSES[glad.cls]&&CLASSES[glad.cls].custom)return classArt(glad.cls,size);
  const c=CLASSES[glad.cls];return portraitHTML({name:glad.name,portrait:gLook(glad),color:c?c.color:'#a3281f'},size);
}
/* gTags — a fighter's status badges (hurt, at war, rookie, gem…). */
function gTags(glad){return `${glad.inj&&!glad.inj.war?`<span class="badge bad" title="${_T`In the infirmary: ${esc(glad.inj.label)} — needs ${injReq(glad.inj)==='rest'?_T('rest'):injReq(glad.inj)==='medicus'?_T('the Medicus'):_T('the surgeon')}. Cannot be entered until cleared.`}">⚕ hurt</span>`:''}${glad.inj&&glad.inj.war?_T('<span class="badge bad" title="Away with the legions">⚔️ at war</span>'):''}${(glad.severed||[]).length?`<span class="badge bad" title="${_T`Severed: ${glad.severed.map(l=>LOCN[l]).join(', ')} — the Blessings of Hygeia regrow them`}">🦴 ${glad.severed.length}</span>`:''}${glad.src==='custom'||isCustomCls(glad.cls)?customTag():''}${glad.src==='ludus'?`<span class="badge gold" title="${_T`From the Ludus Flavius`}">${_T`Ludus${glad.cpuSaved?' · CPU':''}`}</span>`:''}${(()=>{const w=W_();return w&&glad.debut&&(w.season-glad.debut.s)*12+(w.week-glad.debut.wk)<=1&&!(glad.debut.s===1&&glad.debut.wk===1&&w.season===1&&w.week>2)?'<span class="badge good" title="Arrived in the league this week or last">🆕 new</span>':''})()}${glad.rookie&&glad.rec.ev<3?'<span class="badge" title="Fewer than 3 bouts on the sand">rookie</span>':''}${glad.rec.ev>=15?'<span class="badge gold" title="15+ bouts survived on the sand">veteran</span>':''}`}
/* openManager — opens Manager mode (career picker or the open career) full screen and wires it. */
async function openManager(tab){
  if(modalBusy())return;
  if(liveEventRunning()){const ow=typeof arenaOwner==='function'?arenaOwner():null;
    const ok=await modal(_T('Leave the arena?'),`<p>${_T`The sand is not empty: <b>${esc(EV().n||_T('an event'))}</b>${ow?` (${ow.i} ${esc(ow.n)})`:''} is still running on the board — there is only one arena, and Manager mode needs it.`}</p><p>${S.mgrCtx?_T('This bout will be abandoned; you can simulate it from Match Week instead.'):_T('The event in progress will be cleanly abandoned — no Fates, nothing recorded.')}</p>`,[{label:_T('Abandon the event'),value:1,primary:1},{label:_T('Stay in the arena'),value:0}]);if(!ok)return}
  if(S&&!S.over){S.over=true;for(let i=0;i<40&&S.busy;i++)await new Promise(r=>setTimeout(r,80))}
  await loadCustoms().catch(()=>{});await loadLudus().catch(()=>{});
  MGR.careers=(await Store.list('mgrCareers')).sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));
  if(MGR.world&&!MGR.world.tutorial&&!MGR.careers.some(c=>c.id===MGR.world.id))MGR.world=null; /* the lesson's sandbox is never in the saved list */
  MGR.activeCid=await activeCid();
  if(!MGR.activeCid&&MGR.careers.some(c=>!c.dead))await setActiveCareer(MGR.careers.find(c=>!c.dead).id); // somebody has to hold the wallet
  if(MGR.pendingLoad){const d0=MGR.careers.find(c=>c.id===MGR.pendingLoad);MGR.pendingLoad=null; // v0.34: "Continue" from the main menu lands straight in that career
    if(d0&&d0.world){MGR.world=mgrMigrate(JSON.parse(d0.world));MGR.tab='ludus';MGR.sel=null}}
  if(tab)MGR.tab=tab;
  const v=await modal(_T('Manager mode'),`<div id="mgrBody">${mgrHTML()}</div>`,[{label:_T('Close'),value:'close'}],{wide:1,xwide:1,full:1,close:'close',onOpen:done=>{mgrCloseLabel();wireManager(done)}});
  if(v==='close'&&MGR.world&&MGR.world.tutorial){if(typeof mtutLeave==='function')mtutLeave();return}
  if(v==='close'){if(MGR.world){try{await saveWorld(true);if(typeof mToast==='function')mToast(_T`💾 Saved — ${esc(me()?me().ludus:_T('your career'))}`)}catch(e){}}
    if(typeof menuShow==='function'&&$('#mainMenu').hidden&&!(S&&!S.over&&S.phase!=='setup')){MM.fromMenu=false;menuShow()}} // v0.43: both lead back to the main menu
  $('#mBody').onclick=null;$('#mBody').onchange=null;$('#mBody').oninput=null;
  if(typeof v==='string'&&v.startsWith('watch:')){watchBout(+v.slice(6))}
  if(typeof v==='string'&&v.startsWith('spwatch:')){specWatch(+v.slice(8),false)}
  if(typeof v==='string'&&v.startsWith('spfight:')){specWatch(+v.slice(8),true)}
  if(typeof v==='string'&&v.startsWith('fight:')){watchBout(+v.slice(6),true)}
}
/* v0.43: with a career loaded the close button saves and quits; on the career picker it simply goes back to the menu */
function mgrCloseLabel(){const x=$('#mClose');if(!x)return;x.classList.add('saveq');if(MGR.world&&MGR.world.tutorial){x.textContent=_T('✖ Leave the lesson');x.title=_T('Leave the Manager lesson (nothing is saved)')}else if(MGR.world&&!MGR.world.dead){x.textContent='💾 Save & quit';x.title=_T('Save this career and go back to the main menu')}else{x.textContent=_T('🏛 Back to Main Menu');x.title=_T('Back to the main menu')}}
/* mgrHTML — the Manager window body: start screen, the hub, or the fallen house. */
function mgrHTML(){return MGR.world?(MGR.world.dead?deadHTML():hubHTML()):startHTML()}
/* deadHTML — the screen of a fallen house. */
function deadHTML(){
  const w=W_(),m=me(),d=w.dead;
  return `<div style="text-align:center;padding:18px 8px">${mgrPortrait(m,'md')}
    <div style="font:400 26px var(--display);color:var(--blood2);margin-top:10px">${_T`${esc(m.ludus)} has collapsed`}</div>
    <p style="max-width:56ch;margin:10px auto">${_T`${esc(d.why[0].toUpperCase()+d.why.slice(1))} finished you in week ${wkOf(d.week)} of season ${d.season}. The creditors seized the sand, your fighters walked free, and <b>${esc(m.name)}</b>'s name was struck from the lanistae's rolls. In this game the sand keeps what it takes: there is no buying your way back in.`}</p>
    ${(w.scatter||[]).length?`<div class="card2" style="max-width:640px;margin:10px auto;text-align:left"><div class="sect" style="margin-top:0">${_T`Where your fighters went`}</div>${w.scatter.map(x=>`<div style="font-size:13px">${x.to.startsWith('free agency')?'🕊':'⛓'} <b>${esc(x.name)}</b> <span class="rc-sub">(${x.ovr})</span> — ${esc(x.to)}</div>`).join('')}<p class="rc-sub" style="margin:6px 0 0">${_T`Those who reached free agency will be in the recruiting pool of your next career.`}</p></div>`:''}
    <div class="badges" style="justify-content:center"><span class="badge">${_T`Final fame ${d.fame} · ${mgrTier(d.fame)}`}</span><span class="badge">${_T`Record ${d.record}`}</span><span class="badge bad">${_T`Treasury ${coinAmt87(d.coin)}`}</span><span class="badge">${_T`Betting ${(m.betNet||0)>=0?'+':''}${m.betNet||0}`}</span><span class="badge">${_T`Deaths ${m.deaths||0}`}</span></div>
    <div class="mbtns" style="justify-content:center;margin-top:14px"><button class="btn primary" type="button" data-mg="quit">${_T`Leave the ruin<small>the career stays in your list as a monument</small>`}</button><button class="btn" type="button" data-mg="delcareer" data-id="${w.id}">${_T`Delete this career`}</button></div></div>`;
}
/* RULE_LIST9 — the sandbox house rules: [key, name, description]. */
const RULE_LIST9=[['death',_T('Lethality'),_T('How often a condemned Fate actually kills. Below 100%, the editor shows clemency the rest of the time.')],['blood',_T('Blood money prices'),_T('What the editor charges to buy back a condemned fighter.')],['inj',_T('Injuries'),_T('Bout and training injury rates.')],['gain',_T('Training gains'),_T('How fast drills improve ratings.')],['rookies',_T('Rookie influx'),_T('How quickly the league refills with new blood.')],['rand',_T('Deaths beyond the sand'),_T('Fevers, bookies, roof tiles.')],['arena',_T('Arena-time pressure'),_T('How much a big roster puts off recruits who want to fight every week (0% = roster size never matters).')],['rookmercy',_T('Rookie mercy'),_T('Chance the editor spares a condemned fighter with fewer than 3 bouts — lets young talent survive long enough to grow.')]];
/* NEWMGR — the new-career form state. */
let NEWMGR=null;
/* RULESBLK9 — the sandbox house-rules block on the new-career form. */
const RULESBLK9=c=>`<details class="card2" style="margin-top:8px" ${Object.keys(c.rules||{}).length?'open':''}><summary>${_T`<b>🏜 House rules (sandbox)</b>`} <span class="rc-sub">${_T`optional — set them NOW or play the printed game; they are baked in for the whole career once the ludus opens`}</span></summary>
      <div class="presets" style="margin-top:6px">${[['easy',_T('🌿 Easy'),_T('A forgiving sand: clemency common, cheap buybacks, fewer fevers, fast training.')],['std',_T('🏛 Standard'),_T('The printed game, as the founding rules read.')],['hard',_T('🔥 Hard'),_T('The iron league: the editor rarely blinks, buybacks gouge, training crawls, fate is cruel.')]].map(([k,n,d])=>`<button type="button" class="preset ${c.rulePre===k?'on':''}" data-mg="nmrulepre" data-id="${k}" title="${d}">${n}${c.rulePre===k?' ✓':''}</button>`).join('')}</div>
      <div style="margin-top:6px">${RULE_LIST9.map(([k,l,d])=>`<div class="slider" title="${d}"><span>${l}</span><input type="range" min="0" max="200" step="10" value="${(c.rules||{})[k]??RULES_DEF[k]??100}" data-nmrule="${k}"><output>${(c.rules||{})[k]??RULES_DEF[k]??100}%</output></div>`).join('')}
      <label style="display:flex;gap:8px;align-items:center;font-size:13px;margin-top:6px">${_T`🎪 Your festival, should you lead the league at season's end:`}<select class="tin" data-nmfest="1" style="width:auto">${Object.entries(FEST_KINDS).map(([k,F])=>`<option value="${k}" ${(c.festPick||'ludi')===k?'selected':''}>${F.n}</option>`).join('')}</select></label>
      <label style="display:flex;gap:8px;align-items:center;font-size:13px;margin-top:6px"><input type="checkbox" data-nmspect="1" ${c.spectOK!==false?'checked':''}> ${_T`🎟 Let me spectate: buy a ticket to watch any bout, special or the Superbus from the stands (helping my own fighters from there costs fame)`}</label></div></details>`;
/* startHTML — the Manager start screen: your careers, found a house or take one over. */
function startHTML(){
  if(MGR.view==='create'){const c=NEWMGR;return `<h4>${c.takeKey?`${_T`Make ${esc(MGR_PRE.find(t=>t.key===c.takeKey).ludus)} yours`} <span class="rc-sub">${_T`rename the house, its lanista and its colors — the fighters, coin, fame and old feuds come with it`}</span>`:c.sale?`${_T`✍ Found your new house`} <span class="rc-sub">${_T`the old one is sold — the sale closes when this one opens, in the same league`}</span>`:_T`Create your lanista ${customTag()}`}</h4><div class="setup-grid" style="grid-template-columns:minmax(0,220px) minmax(0,1fr)"><div id="nmPortrait" style="text-align:center">${portraitHTML({name:c.name,portrait:c.portrait,color:c.color},'lg')}<div class="mbtns"><button class="btn" type="button" data-mg="nmlook">${_T`🎲 Random look`}</button></div></div><div>
    <div class="formgrid"><label>${_T`Name`}<span style="display:flex;gap:4px"><input class="tin" id="nmName" data-nm="name" value="${esc(c.name)}" maxlength="28">${diceBtn('#nmName')}</span></label><label>${_T`Ludus name`}<input class="tin" data-nm="ludus" value="${esc(c.ludus)}" maxlength="32"></label><label title="${_T`Where your ludus stands. Fighters from this city lean your way (+8 interest) and scout at half price; its square sells to you at a quarter off; walking your own sand costs half.`}">${_T`🏠 Home city — where your ludus stands`}<select class="tin" data-nm="city" ${c.takeKey?_T('disabled title="A house you take over keeps its home city"'):''}>${LANISTA_CITIES().map(x=>`<option ${x===c.city?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label>${_T`Color`}<input type="color" class="tin" data-nm="color" value="${c.color}" style="height:34px;padding:2px"></label></div>
    <p class="rc-sub" style="margin:4px 0 0">${_T`🏠 <b>Your home city</b>: its fighters lean your way (+8 interest) and scout at half price; its square sells to you at a quarter off; walking its sand costs half.`}</p>
    ${c.takeKey?'':`<h4>${_T`Personality`}</h4>`}<div class="presets" ${c.takeKey?'hidden':''}>${Object.entries(MGR_PRESETS).map(([k,[n]])=>`<button type="button" class="preset" data-mg="nmpre" data-id="${k}">${n}</button>`).join('')}</div>
    <div class="perswrap" style="margin-top:8px" ${c.takeKey?'hidden':''}>${MGR_KEYS.map(([k,l,d])=>`<label class="slider" title="${d}"><span>${l}</span><input type="range" min="1" max="100" data-nmp="${k}" value="${c.p[k]}"><output>${c.p[k]}</output></label>`).join('')}</div>
    <p class="hint">${c.takeKey?_T('The house keeps its lanista\u2019s temperament — grow it with perk points from the Lanista tab.'):''}</p><p class="hint" ${c.takeKey?'hidden':''}>${_T`You start with ${coinAmt87(40)}, no fame and one raw recruit. Stars will not even talk to an Unknown ludus: scout cheap fighters, win undercards and bet wisely to build a name.`}</p>
    ${c.sale||typeof rosterPickHTML!=='function'?'':rosterPickHTML('nm',c.roster)}
    ${typeof flagPickerHTML==='function'?flagPickerHTML(c.flag,c.flagSeed||1,c.ludus):''}
    ${c.sale?`<p class="rc-sub" style="margin-top:8px">${_T`🏜 The league’s house rules stay as they were founded.`}</p>`:RULESBLK9(c)}
    <div class="mbtns"><button class="btn primary" type="button" data-mg="nmgo">${c.takeKey?_T('Take the reins'):c.sale?_T('✍ Sign the sale and open the new house'):_T('Open the ludus')}</button><button class="btn" type="button" data-mg="back">${_T`Back`}</button></div></div></div>`}
  if(MGR.view==='load'||MGR.view==='manage'){const man=MGR.view==='manage';const L=MGR.careers;
    return `<h4>${man?_T('🗂 Manage your Manager saves'):_T('📂 Load a Manager career')}</h4>${L.length?`<div class="list2">${L.map(c=>`<div class="lrow"><div class="t">${_T`<b>${esc(c.ludus)}</b> ${c.dead?'<span class="badge bad">✝ collapsed</span>':''}<small>${esc(c.name)} · season ${c.season}, week ${wkOf(c.week)}${c.wins!=null?_T` · record <b>${c.wins}-${Math.max(0,(c.bouts||0)-(c.wins||0))}</b>`:''}${c.coin!=null?_T` · treasury <b>${coinAmt87(c.coin)}</b>`:''} · saved ${esc(c.updated||'')}</small>`}</div><div class="a">${man?`<button class="btn" type="button" data-mg="dlcareer" data-id="${c.id}">${_T`⬇ Download`}</button><button class="btn" type="button" data-mg="delcareer" data-id="${c.id}">${_T`🗑 Delete`}</button>`:`<button class="btn primary" type="button" data-mg="load" data-id="${c.id}">${c.dead?_T('Visit the ruin'):_T('▶ Load')}</button>`}</div></div>`).join('')}</div>`:`<p class="rc-sub">${_T`No careers saved yet.`}</p>`}<div class="mbtns"><button class="btn" type="button" data-mg="back">${_T`← All options`}</button></div>`}
  if(MGR.view==='take')return `<h4>${_T`Take control of a ludus`}</h4><div class="list2">${MGR_PRE.map(t=>`<div class="lrow" style="--pc:${t.color}"><div class="t">${_T`<b>${esc(t.name)}</b><small>${esc(t.ludus)} · ${esc(t.city)} · fame ${t.fame} (${mgrTier(t.fame)}) · ${coinAmt87(t.coin)} · ${t.n} fighters</small><small style="color:var(--bone)">${esc(t.bio)}</small><small>${MGR_KEYS.map(([k,l])=>`${l} ${t.p[k]}`).join(' · ')}</small>`}</div><div class="a"><button class="btn primary" type="button" data-mg="take" data-id="${t.key}">${_T`Take over`}</button></div></div>`).join('')}</div><div class="mbtns"><button class="btn" type="button" data-mg="back">${_T`Back`}</button></div>`;
  return `<p>${_T`Run a ludus as its <b>lanista</b>. Recruit fighters the way college coaches recruit: every fighter has an <b>interest</b> level in every ludus, driven by what they want (coin, glory, honor, spectacle, training, home, arena time) and by how your personality and record grade on each. Scout them with sparring bouts simulated in the Ludus, enter them on match nights, bet on the bouts, and poach stars from rival stables. Every bout is a real Flavius Rule event: simulate it instantly or watch it live on the board. And mind the books — three week-ends in the red, or a season ended in debt, and the creditors close the ludus <b>for good</b>.`}</p>
    <div class="mbtns" style="margin:0 0 12px"><button class="btn primary" type="button" data-mg="create">${_T`Create a new lanista<small>start Unknown, with ${coinAmt87(40)} and one raw recruit</small>`}</button><button class="btn" type="button" data-mg="takeview">${_T`Take over an existing ludus<small>${MGR_PRE.length} lanistae, from struggling to Imperial</small>`}</button></div>
    ${MGR.careers.length>1||MGR.careers.some(c=>c.dead)?`<h4>${_T`Career leaderboard`}</h4><div style="overflow-x:auto"><table class="tally"><tr><th>#</th><th>${_T`Lanista`}</th><th>${_T`Status`}</th><th>${_T`Fame`}</th><th>${_T`Record`}</th><th>${_T`Treasury`}</th><th>${_T`Betting`}</th><th>${_T`Deaths`}</th></tr>${[...MGR.careers].sort((a,b)=>(b.fame||0)-(a.fame||0)||(b.wins||0)-(a.wins||0)).map((c,i)=>`<tr><td class="n">${i+1}</td><td><b>${esc(c.name)}</b><br><span class="rc-sub">${esc(c.ludus)}</span></td><td>${c.dead?`<span style="color:var(--blood2)">✝ collapsed</span><br><span class="rc-sub">S${c.season} W${c.week}</span>`:`S${c.season} W${c.week}${MGR.activeCid===c.id?' · ★':''}`}</td><td class="n">${c.fame??'—'}${c.fame!=null?` <span class="rc-sub">${mgrTier(c.fame)}</span>`:''}</td><td class="n">${c.wins!=null?`${c.wins}-${Math.max(0,(c.bouts||0)-(c.wins||0))}`:'—'}</td><td class="n">${c.coin??'—'}</td><td class="n">${c.betNet!=null?((c.betNet>=0?'+':'')+c.betNet):'—'}</td><td class="n">${c.deaths??'—'}</td></tr>`).join('')}</table><p class="hint">${_T`Ranked by fame, then wins. Collapsed ludi stay on the board as monuments — that is the point of a monument.`}</p></div>`:''}
    <h4>${_T`Saved careers`}</h4><p class="rc-sub" style="margin:0 0 6px">${_T`One career is your <b>active wallet</b>: its treasury bankrolls every wager you place outside Manager mode (the Wagers window, watching any event).`}</p>${MGR.careers.length?`<div class="list2">${MGR.careers.map(c=>`<div class="lrow"><div class="t">${_T`<b>${esc(c.name)}</b> ${c.custom?customTag():''}${c.dead?'<span class="badge bad">✝ collapsed</span>':''}${MGR.activeCid===c.id?_T('<span class="badge gold" title="This treasury bankrolls your wagers everywhere">★ active wallet</span>'):''}<small>${esc(c.ludus)} · season ${c.season}, week ${wkOf(c.week)}${c.wins!=null?_T` · record <b>${c.wins}-${Math.max(0,(c.bouts||0)-(c.wins||0))}</b>`:''}${c.coin!=null?_T` · treasury <b>${coinAmt87(c.coin)}</b>`:''} · saved ${esc(c.updated||'')}</small>`}</div><div class="a"><button class="btn primary" type="button" data-mg="load" data-id="${c.id}">${c.dead?_T('Visit the ruin'):_T('Continue')}</button>${!c.dead&&MGR.activeCid!==c.id?`<button class="btn" type="button" data-mg="setactive" data-id="${c.id}">${_T`Use for wagers`}</button>`:''}<button class="btn" type="button" data-mg="delcareer" data-id="${c.id}">${_T`Delete`}</button></div></div>`).join('')}</div>`:`<p style="color:var(--muted)">${_T`No careers yet.`}</p>`}`;
}
/* hubHTML — the Manager hub: rail, header and the current tab. */
function hubHTML(){
  const w=W_(),m=me();const ros=rosterOf(m);const rec=`${m.wins}-${Math.max(0,m.bouts-m.wins)}`;
  const hurtN=rosterOf(m).filter(g=>g.inj||(g.severed||[]).length).length;
  const tabs=[['ludus',_T('🏛 Your ludus')],['roster',_T`🛡 Roster · ${rosterOf(me()).length}`],['recruit',_T('🤝 Recruiting')],['board',_T`★ Favorites${(w.glads.filter(g=>g.alive&&g.favd).length||'')&&' · '+w.glads.filter(g=>g.alive&&g.favd).length}`],['infirm',_T`⚕ Infirmary${hurtN?' · '+hurtN:''}`],['practice',_T('🏋 Training Yard'),_T('Weekly team drills and exhibitions against other stables')],['night',_T`${w.special&&!w.special.done?'⭐ ':''}⚔️ Match Week${w.night.bouts.every(b=>b.done)&&!(w.pend||[]).length?' ✓':(w.pend||[]).length?' ⚖':''}`],['exch',_T('💰 Wagers'),_T('Your bets and the betting exchange — the same Wagers window as on the main bar')],['news',_T('📯 News')],['league',_T('📊 League')],['imp',_T('🌍 Imperium'),_T('The Imperium map: fans, roads, weather, wars and the world\u2019s stories')],['trophy',_T`🏆 Trophies${(w.trophies||[]).length?' · '+w.trophies.length:''}`],['sched',_T('📅 Season')],['me',_T('👤 Lanista'),_T('Lanista: the owner-manager of a gladiator school — you. The trainers who drill your fighters are the doctores.')]];
  return `<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:10px">${mgrPortrait(m,'sm')}${typeof flagChip==='function'?flagChip(m,38,_T('Your house banner — change it on the Lanista tab')):''}<div style="flex:1;min-width:220px"><div style="font:400 22px var(--display);color:var(--gold2)">${esc(m.name)} ${m.custom?customTag():''}</div><div class="rc-sub">${_T`${esc(m.ludus)} · ${esc(m.city)} · season ${w.season}, week ${((w.week-1)%12)+1}${w.night.grand?_T(' · <b style="color:var(--gold2)">the Grand Games</b>'):''}`}</div></div>
    <div class="badges mhead"><span class="badge ${m.coin<0?'bad':'gold'}">${_T`Treasury ${coinAmt87(m.coin)}`}</span>${w.loan&&w.loan.amt>0?`<span class="badge bad" title="${_T`Owed to ${esc(w.loan.name)} — ${Math.round(loanRate(w.loan)*100)}% interest a week`}">${_T`Debt −${w.loan.amt}`}</span><span class="badge ${m.coin-w.loan.amt<0?'bad':''}" title="${_T`Treasury minus debt`}">${_T`Net ${m.coin-w.loan.amt}`}</span>`:''}${(m.negWeeks||0)>0?`<span class="badge bad" title="${_T`Three consecutive week-ends in the red and the creditors close the ludus`}">${_T`☠ in the red ${m.negWeeks}/${BANKRUPT_WEEKS}`}</span>`:''}${MGR.activeCid===w.id?'<span class="badge gold" title="This treasury bankrolls your wagers everywhere">★ wallet</span>':''}<span class="badge fameb" tabindex="0">${_T`${fameHTML(m.fame)} Fame ${m.fame} · ${mgrTier(m.fame)}${typeof fameTipHTML==='function'?fameTipHTML():''}`}</span><span class="badge" title="${_T`Ludus grade — from your facilities; recruits weigh it`}">${_T`Grade ${typeof ludusGrade==='function'?ludusGrade(m):'—'}`}</span><span class="badge">${_T`Record ${rec}`}</span><span class="badge">${_T`${ros.length} fighter${ros.length===1?'':'s'}`}</span><span class="badge ${w.hours?'good':''}">${_T`Recruiting hours ${w.hours}/${hoursMax()}`}</span></div></div>
    ${MGR.msg?`<div class="tiphint" style="margin:0 0 10px">${_T`<b>Note</b>${MGR.msg}${MGR.noteFrom?` <span class="rc-sub notefrom">${_T`(after you pressed <b>${esc(MGR.noteFrom)}</b>)`}</span>`:''}`}</div>`:''}
    <div class="railwrap"><div class="tabrow">${railTabs(tabs,MGR_GROUPS,MGR.tab,k=>`data-mg="tab" data-id="${k}"`,_T('tabs mtabs'))}${(()=>{const r=weekReady();return `<button type="button" class="btn endwk ${r.ok?_T('ready primary'):''}" data-mg="endask" ${r.ok?_T('title="Pay wages, train, print the Acta — and move the empire on a week"'):dis([true,r.why])}>${_T`⏭ End the week`}</button>`})()}</div>
    <div class="railmain">${MGR.confirmEnd?endConfirmHTML():''}
    <div id="mgrPane">${typeof buyOfferHTML==='function'?buyOfferHTML():''}${MGR.tab==='team'&&typeof teamHTML==='function'?teamHTML():MGR.tab==='imp'&&typeof imperiumHTML==='function'?`<div id="standsHubBody">${imperiumHTML()}</div>`:MGR.tab==='trophy'?trophyRoomHTML():MGR.tab==='awards'?awardShowHTML():MGR.tab==='night'?(w.special&&!w.special.done?specialHTML():nightHTML()):MGR.tab==='roster'?`<h4 class="secth" style="margin-top:0">${_T`🛡 Your roster`} <span class="rc-sub">${_T`click a fighter to open their card · re-sign, heal, train and bond from the card`}</span></h4>${rosterBlockHTML()}`:MGR.tab==='recruit'?recruitHTML():MGR.tab==='exch'?exchTabHTML():MGR.tab==='board'?boardHTML2():MGR.tab==='league'?leagueHTML():MGR.tab==='news'?newsHTML():MGR.tab==='paper'?paperHTML():MGR.tab==='practice'?practiceHTML():MGR.tab==='infirm'?infirmaryHTML():MGR.tab==='archive'?archiveHTML():MGR.tab==='sched'?seasonTabHTML():MGR.tab==='me'?meHTML():ludusTabHTML()}</div></div></div>`;
}
/* v0.22 THE LANDING PAGE: last week in review and what to do this week — no scrolling past the roster to run the ludus */
function ludusTodos(){const w=W_(),m=me(),n=w.night;const ros=rosterOf(m);const T=[];const go=(tab,l)=>`<button class="btn" type="button" data-mg="tab" data-id="${tab}" style="padding:2px 8px">${l}</button>`;
  if((w.pend||[]).length)T.push(['⚖',_T`<b>${w.pend.length} verdict${w.pend.length===1?'':'s'}</b> wait for you — thumbs, blood money or the rudis.`,go('night',_T('Match Week'))]);
  if(m.coin<0)T.push(['☠',_T`Your treasury is <b>${m.coin}</b>. Win purses, bet well or trim wages before the creditors come.`,go('roster',_T('Roster'))]);
  const hurt=ros.filter(g=>g.inj&&!g.inj.war);if(hurt.length)T.push(['⚕',_T`${hurt.map(g=>esc(g.name)).join(', ')} ${hurt.length===1?_T('is'):_T('are')} hurt and cannot fight until treated.`,go('infirm',_T('Infirmary'))]);
  if(n&&!n.bouts.every(b=>b.done)){const entered=n.bouts.some(b=>b.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===m.id}));
    if(!entered&&ros.some(g=>!g.inj))T.push(['⚔',_T`None of your fighters is on this week's card at <b>${esc(LOCATIONS[n.loc].n)}</b> — enter one for the purse and the appearance fee.`,go('night',_T('Match Week'))]);
    if(!n.scouted)T.push(['🗺',_T`Walk the sand at ${esc(LOCATIONS[n.loc].n)} before the games — your fighters on this week's card arrive with +1 AP and ${coinAmt87('+1')}.`,go('night',_T('Walk the sand'))])}
  if(w.hours>0)T.push(['⏳',_T`<b>${w.hours}</b> of the lanista's hours left this week — scout free agents, pitch a signing, or run a trial bout.`,go('recruit',_T('Recruiting'))]);
  if(!w.train||w.train==='off')T.push(['🏋',_T`The Training Yard is idle — pick this week's drills; light drills are cheap and safe.`,go('practice',_T('Training Yard'))]);
  const low=ros.filter(g=>g.morale<35);if(low.length)T.push(['😞',_T`${low.map(g=>esc(g.name)).join(', ')} ${low.length===1?_T('is'):_T('are')} in low spirits (−1 AP on the sand). A shared meal, kin tickets or a bonus lifts them.`,'']);
  const exp=ros.filter(g=>g.contract.weeks<=2);if(exp.length)T.push(['📜',_T`Contract${exp.length===1?'':'s'} ending soon: ${exp.map(g=>_T`${esc(g.name)} (${g.contract.weeks} wk)`).join(', ')}.`,'']);
  const prospect=ros.filter(g=>!g.inj&&g.pot-g.ovr>=8).sort((a,b)=>(b.pot-b.ovr)-(a.pot-a.ovr))[0];
  if(prospect&&!prospect.ptrain&&m.coin>=PTRAIN_COST+10)T.push(['⚒',_T`Invest in <b>${esc(prospect.name)}</b> (${prospect.ovr} → potential ${prospect.pot}): a personal trainer — a <i>doctore</i> — (${coinAmt87(PTRAIN_COST)} a week) gives the best odds of growth.`,'']);
  if(ros.length<3)T.push(['🤝',_T`Only ${ros.length} fighter${ros.length===1?'':'s'} signed — a deeper roster covers injuries and the fate table.`,go('recruit',_T('Recruiting'))]);
  if((m.perkPts||0)>0)T.push(['🎓',_T`You have <b>${m.perkPts} perk point${m.perkPts===1?'':'s'}</b> to spend in the lanista's schooling — every point raises a trait recruits grade you on.`,`<button class="btn primary" type="button" data-mg="toschool" style="padding:2px 8px">${_T`Spend`}</button>`]);
  if((m.fame||0)<20)T.push(['📯',_T`Your fame is low (${m.fame||0}). Promote the ludus below to win fans across the empire.`,'']);
  return T}
/* v0.24 THE EMPIRE MOVES ON WITHOUT YOU: a career behind the empire's calendar gets a letter from the capital —
   let the doctores run the ludus through the missing weeks (auto-simulated, sensible verdicts), or keep a private calendar */
function calLag(){const w=W_();if(typeof calNow!=='function')return 0;const c=calNow();const wk12=((w.week-1)%12)+1;return ((c.season-1)*12+c.week)-((w.season-1)*12+wk12)}
/* lagBannerHTML — the letter from the capital when the career is behind the empire's calendar (catch up or keep your own calendar). */
function lagBannerHTML(){const w=W_();const lag=calLag();if(lag<=0||w.ownCal)return '';const c=calNow();
  return `<div class="card2 lagbox">${_T`<b>📜 A letter from the capital</b>`} <span class="rc-sub">${_T`sealed ${esc(empireDate(c.season,c.week).short)}`}</span>
    <p style="margin:4px 0">${_T`While you were away the empire lived <b>${lag} week${lag===1?'':'s'}</b> without you — games were fought, purses paid, rivals grew fat. Your ludus still keeps ${esc(empireDate(w.season,((w.week-1)%12)+1).short)}.`}</p>
    <div class="acts"><button class="btn primary" type="button" data-mg="catchup">${_T`⏩ Let the doctores run the ludus<small>simulate ${Math.min(lag,12)} week${Math.min(lag,12)===1?'':'s'}: bouts, verdicts (blood money for your best, the thumb for the rest, the rudis refused), wages and training</small>`}</button><button class="btn" type="button" data-mg="owncal">${_T`Keep our own calendar<small>this career lives on its own dates; the empire won't wait</small>`}</button></div></div>`}
/* catchUpWeeks — lets the doctores simulate the weeks a career is behind the empire (up to 12). */
async function catchUpWeeks(){const w=W_(),m=me();let n=Math.min(12,calLag());const log0=[];const coin0=m.coin,fame0=m.fame,wins0=m.wins;
  for(let k=0;k<n;k++){if(w.special&&!w.special.done&&typeof specAutoRun==='function')await specAutoRun();for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i);
    let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];const g=gById(P.gid);
      if(P.t==='thumb')settlePending(0,null,{d6:1+Math.floor(Math.random()*6),d12:1+Math.floor(Math.random()*12)});
      else if(P.t==='blood')settlePending(0,g&&effOvr(g)>=58&&m.coin>=P.price+20?'pay':'let');else settlePending(0,'stay')}
    const ok=await endWeek();if(!ok)break;log0.push(w.lastPaper&&w.lastPaper.lead?w.lastPaper.lead.h:'')}
  saveWorld(true);return {weeks:log0.length,coin:m.coin-coin0,fame:m.fame-fame0,wins:m.wins-wins0,heads:log0}}
/* weekReviewHTML — last week in review and this week's to-dos. */
function weekReviewHTML(){const w=W_(),m=me();const R=w.review;const T=ludusTodos();const dt=empireDate(w.season,((w.week-1)%12)+1);
  const sgn=v=>v>0?`+${v}`:`${v}`;
  const rev=R?`<div class="revbox"><div class="sect" style="margin-top:0">${_T`📅 Week ${RN(((R.wk-1)%12)+1)} in review`} <span class="rc-sub">${_T`season ${RN(R.season)}`}</span></div>
    <div class="chron mini"><span class="stat">${_T`<b>${ICO.coin} ${sgn(R.coinD)}</b>treasury (now ${R.coin})`}</span><span class="stat">${_T`<b>${ICO.laurel} ${sgn(R.fameD)}</b>fame`}</span><span class="stat">${_T`<b>${R.winsD}/${R.boutsD}</b>wins / bouts`}</span><span class="stat">${_T`<b>${R.dead.length}</b>fallen`}</span></div>
    ${R.results.length?`<div class="revres">${R.results.map(x=>`<div>${x.won?'🏆':x.dead?'✝':'⚔'} <b>${esc(x.name)}</b> <span class="rc-sub">${_T`${esc(x.tier)} · ${x.place?['','1st','2nd','3rd','4th','5th','6th'][x.place]||x.place+'th':''} · ${cfAmt87(x.f)} · ${esc(String(x.fate).replace(/<[^>]*>/g,''))}`}</span></div>`).join('')}</div>`:`<p class="rc-sub" style="margin:4px 0">${_T`None of your fighters took the sand last week.`}</p>`}
    ${R.dead.length?`<p style="margin:4px 0;color:var(--blood2)">${_T`✝ Lost: ${R.dead.map(esc).join(', ')}`}</p>`:''}
    ${w.lastPaper?`<button class="btn" type="button" data-mg="paper" style="margin-top:4px">${_T`📜 Read the Acta Diurna<small>the week's gazette</small>`}</button>`:''}</div>`
   :`<div class="revbox"><div class="sect" style="margin-top:0">${_T`👋 Welcome to ${esc(m.ludus)}`}</div><p style="margin:4px 0">${_T`This is your ludus — you start every week here. The to-do list on the right shows what still needs doing.`}</p>
   <ol class="welc">
    <li>${_T`<b>Prepare.</b> <b>Roster</b> sets your starters. <b>Recruiting</b> signs free agents (you have 10 hours a week). <b>Training Yard</b> sets drills and spends your 10 training hours. <b>Infirmary</b> heals.`}</li>
    <li>${_T`<b>Fight.</b> <b>Match Week</b> is Flavius's travelling games. It brings three bouts to a city: the Undercard on Friday, the Feature on Saturday and the Main event on Sunday. Enter your starters, then fight, watch or simulate each bout.`}</li>
    <li>${_T`<b>Decide.</b> After the bouts, you rule on thumbs, blood money and the rudis.`}</li>
    <li>${_T`<b>End the week.</b> Wages are paid, fighters train and heal, contracts tick down, and the <b>Acta Diurna</b> prints the week's news.`}</li>
   </ol>
   <p class="rc-sub" style="margin:4px 0">${_T`Win bouts for points: the top four houses after 12 weeks go to the <b>Flavius Superbus</b>. Three week-ends in the red closes the ludus. <b>Rules &amp; strategy → Manager guide</b> has the rest.`}</p></div>`;
  return `${lagBannerHTML()}<div class="landing">${rev}<div class="todobox"><div class="sect" style="margin-top:0">${_T`✅ This week · ${esc(dt.short)}`} <span class="rc-sub">${T.length?T.length+' thing'+(T.length===1?'':'s')+_T(' to see to'):_T('all in order')}</span></div>
    ${T.length?`<div class="todos">${T.map(([i,t,b])=>`<div class="todo"><span class="ti">${i}</span><span class="tt">${t}</span>${b}</div>`).join('')}</div>`:`<p class="rc-sub" style="margin:4px 0">${_T`Nothing pressing. Enjoy the quiet — or go looking for trouble on the Recruiting board.`}</p>`}</div></div>`}
/* v0.22 THE EXCHANGE TAB: the same betting system as the Wagers window, from the lanista's box */
function exchTabHTML(){const w=W_(),m=me(),n=w.night;const L=betlogLoad();const wk=`m:${w.id}:${w.week}`;
  const mine=L.filter(r=>r.kind==='you');const settled=mine.filter(r=>r.status!=='open');const wonN=settled.filter(r=>r.status==='won').length;
  const openMine=mine.filter(r=>r.status==='open');const weekSlips=L.filter(r=>r.ev===wk);const handle=weekSlips.reduce((a,r)=>a+(r.cur==='CF'?0:r.stake),0);
  const big=settled.filter(r=>r.status==='won').sort((a,b)=>(b.pay-b.stake)-(a.pay-a.stake))[0];
  const F=MGR.exF||'all';const flt={all:()=>true,you:r=>r.kind==='you',lanista:r=>r.kind==='lanista',crowd:r=>r.kind==='spectator',glad:r=>r.kind==='gladiator'}[F];
  const tips=n?n.bouts.filter(b=>!b.done).map(b=>{const bi=n.bouts.indexOf(b);const odds=boutOdds(b);const est=boutProbs(b,'mine');const bk=boutProbs(b,'book');
    return b.ents.map((id,i)=>{const g=gById(id);if(!g)return '';const scouted=g.scout||(g.contract&&g.contract.mgr===m.id);const edge=scouted?est[i]-bk[i]:0;
      return `<tr><td><b>${esc(g.name)}</b> <span class="rc-sub">${esc(TIERS[b.tier].n)}</span></td><td class="n">${Math.round(bk[i]*100)}%</td><td class="n">${scouted?Math.round(est[i]*100)+'%':'<span class="rc-sub">?</span>'}</td><td>${edge>=0.07?'<span class="badge good">▲ value</span>':edge<=-0.07?'<span class="badge bad">▼ trap</span>':''}</td><td class="n odds">${odds[i]}×</td><td><button class="btn" type="button" data-mg="bet" data-id="${bi}|${id}|${odds[i]}" style="padding:2px 8px" ${m.coin<1?'disabled':b.rig?dis([true,_T('You fixed this bout — the bookmaker will not take your money on it.')]):''}>${_T`Bet`}</button></td></tr>`}).join('')}).join(''):'';
  const lan=[...w.mgrs].sort((a,b)=>(b.betNet||0)-(a.betNet||0));
  return `<div class="haven"><div class="havenhd">${_T`<span>🏛 THE EXCHANGE</span>`}<span class="rc-sub">${_T`the lanista's box over the bookmakers' arches · the same ledger as the Wagers window`}</span></div>
    <div class="havengrid"><div>${_T`<i>Your betting</i><b>${(m.betNet||0)>=0?'+':''}${m.betNet||0}c</b><span>${wonN} won of ${settled.length} settled</span>`}</div><div>${_T`<i>Open slips</i><b>${openMine.length}</b><span>${coinAmt87(openMine.reduce((a,r)=>a+r.stake,0))} at risk</span>`}</div><div>${_T`<i>Bookmaker's cut</i><b>${coinAmt87(m.bookCut||0)}</b><span>8% of all coin laid on your fighters</span>`}</div><div>${_T`<i>This week's handle</i><b>${coinAmt87(handle)}</b><span>${weekSlips.length} slips at ${n?esc(LOCATIONS[n.loc].n):'—'}</span>`}</div><div>${_T`<i>Best score</i><b>${big?'+'+(big.pay-big.stake)+'c':'—'}</b><span>${big?esc(big.on):_T('no winners yet')}</span>`}</div></div></div>
   <div class="lan2" style="margin-top:10px"><div class="card2"><div class="sect" style="margin-top:0">${_T`🔮 The tipsters' board`} <span class="rc-sub">${_T`this week's card · your scouts against the public line`}</span></div>
     <p class="rc-sub" style="margin:0 0 4px">${_T`Stake`} <input type="number" class="tin" id="mgStake" min="1" max="${m.coin}" value="${Math.min(10,Math.max(1,m.coin))}" style="width:5em;display:inline-block"> ${_T`coin · treasury ${coinAmt87(m.coin)} ·`} <span title="${_T`No slip may pay more than ${BET_MAXPAY} coin, so long odds take small stakes; winnings pay a 10% imperial tax on the profit`}">${_T`house limit ${BET_MAXPAY} a slip · the Emperor's tenth on winnings`}</span></p>
     ${tips?`<table class="tally compact"><tr><th>${_T`Fighter`}</th><th class="n">${_T`Book`}</th><th class="n">${_T`Scouts`}</th><th></th><th class="n">${_T`Odds`}</th><th></th></tr>${tips}</table>`:`<p class="rc-sub">${_T`Every bout this week is decided — the next card posts when the week ends.`}</p>`}</div>
    <div class="card2"><div class="sect" style="margin-top:0">${_T`🎲 The lanistae at the rail`} <span class="rc-sub">${_T`who wins and loses on the book`}</span></div><table class="tally compact"><tr><th>${_T`Lanista`}</th><th class="n">${_T`Net`}</th><th>${_T`Rivalry`}</th></tr>${lan.map(x=>`<tr class="${x.isPlayer?'me':''}"><td><span style="color:${x.color}">■</span> ${esc(x.name)} <span class="rc-sub">${esc(x.ludus)}</span></td><td class="n">${(x.betNet||0)>=0?'+':''}${x.betNet||0}</td><td class="rc-sub">${x.isPlayer?'—':rivalTier(x.rivalry||0)}</td></tr>`).join('')}</table></div></div>
   <div class="card2" style="margin-top:10px"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${_T`<b>📈 The ledger</b>`}<div class="seg">${[['all',_T('All')],['you',_T('Yours')],['lanista',_T('Lanistae')],['crowd',_T('The crowd')],['glad',_T('Gladiators')]].map(([k,l])=>`<button type="button" data-mg="exf" data-id="${k}" class="${F===k?'on':''}">${l}</button>`).join('')}</div><span class="rc-sub">${_T`every wager laid across the empire, newest first`}</span></div>${exchangeHTML(flt,60)}</div>`}
/* v0.24 THE CONSILIUM: four advisors read your ludus every week and each gives one piece of counsel you can act on */
function consiliumHTML(){const w=W_(),m=me(),n=w.night;const ros=rosterOf(m);const wages=ros.reduce((a,g)=>a+g.contract.wage,0);
  const R=w.review;const income=R&&R.boutsD?Math.max(0,R.coinD+wages):0;const runway=wages>0?Math.floor(Math.max(0,m.coin)/wages):99;
  const go=(tab,l)=>`<button class="btn tksm" type="button" data-mg="tab" data-id="${tab}">${l}</button>`;
  // the Quaestor: money
  const q=m.coin<0?_T`The treasury is <b>${m.coin}</b>. Win a purse, bet only on value, or release a wage — the creditors count your week-ends.`:runway<3?_T`Wages of <b>${wages}/wk</b> leave <b>${runway} week${runway===1?'':'s'}</b> of coin. Enter fighters on Match Week — every entry earns the appearance fee.`:_T`Wages ${wages}/wk against ${coinAmt87(m.coin)}: <b>${runway>=99?_T('no wages owed'):runway+' weeks'}</b> of runway.${income?_T` Last week the sand paid about ${income}.`:''} You can afford to invest.`;
  // the Doctore: who to train / rest
  const hurt=ros.filter(g=>g.inj);const prospect=ros.filter(g=>!g.inj).sort((a,b)=>(b.pot-b.ovr)-(a.pot-a.ovr))[0];const tired=ros.filter(g=>g.morale<45).sort((a,b)=>a.morale-b.morale)[0];
  const d=hurt.length?_T`${hurt.map(g=>esc(g.name)).join(', ')} ${hurt.length===1?_T('is'):_T('are')} hurt — heal before Match Week or they sit it out.`:tired?_T`<b>${esc(tired.name)}</b> is low (${tired.morale} morale): a meal or kin tickets before they fight a tier worse.`:prospect?_T`<b>${esc(prospect.name)}</b> has the most room to grow (${prospect.ovr} → ${prospect.pot}). A personal trainer (doctore) this week is money well spent.`:_T('Sign fighters first — the yard is empty.');
  // the Scout: best value on the market you can afford
  const fa=freeAgents().filter(g=>askWage(g)<=Math.max(4,m.coin/4)&&m.fame>=reqFame(g)).sort((a,b)=>(estOvr(b).v/Math.max(1,askWage(b)))-(estOvr(a).v/Math.max(1,askWage(a))))[0];
  const sc=fa?_T`Best value you can afford: <b>${esc(fa.name)}</b> — ~${estOvr(fa).v} for ${askWage(fa)}/wk${fa.scout?'':_T(' (unscouted — could be a gem or a trap)')}.`:_T`No free agent fits your purse and fame right now. Promote the ludus to widen the market.`;
  // the Augur: the next three fixtures
  const fx=[1,2,3].map(k=>{const wk=w.week+k;const f=fixtureFor(w.season+Math.floor((((w.week-1)%12)+k)/12),wk);return f?`${esc(LOCATIONS[f.loc].n)} (${esc((EVENTS[f.ev]||{}).short||'')}${f.purse>1?_T(', rich purse'):''})`:''}).filter(Boolean);
  const au=_T`${n?_T`This week: <b>${esc(LOCATIONS[n.loc].n)}</b>${n.omen&&n.omen.k!=='clear'?_T` under <i>${esc(n.omen.n)}</i>`:''}. `:''}Coming: ${fx.join(' → ')}. Fighters from those cities fight harder at home.`;
  const row=(ic,who,t,b)=>`<div class="cons"><span class="ci">${ic}</span><div><b>${who}</b><div>${t}</div></div>${b||''}</div>`;
  return `<div class="card2 consil"><div class="sect" style="margin-top:0">${_T`🧭 The Consilium`} <span class="rc-sub">${_T`your advisors' counsel this week`}</span></div>
    ${row(ICO.coin,_T('The Quaestor'),q,m.coin<0||runway<3?go('night',_T('Match Week')):'')}${row('🏋',_T('The Doctore'),d,hurt.length?go('infirm',_T('Infirmary')):go('roster',_T('Roster')))}${row('🔭',_T('The Scout'),sc,go('recruit',_T('Recruiting')))}${row('🦅',_T('The Augur'),au,go('sched',_T('Season')))}</div>`}
/* rosterBlockHTML — your roster as cards. */
function rosterBlockHTML(){const m=me(),w=W_();const ros=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));
  if(!(MGR.lsel&&ros.some(g=>g.id===MGR.lsel))&&ros.length)MGR.lsel=ros[0].id;const wk=ros.reduce((s,g)=>s+g.contract.wage,0);const left=Math.max(0,repCap()-(w.repair||0));
  return `   ${ros.length?`<div class="mgrid wide"><div style="overflow-x:auto"><table class="tally"><tr><th></th><th>${_T`Fighter`}</th><th title="${_T`What a rating does on the sand: it sets how well the fighter plays (below 60 like an Easy CPU with loose, noisy decisions; 60-79 Normal; 80+ Hard, near-perfect choices), the armor fitted before the bout (+1 AP per 6 points above 62, up to +5) and coin in the purse (+1 per 5 points above 70, up to +4). Morale shifts it: high morale adds 1 AP and a CF, low morale takes an AP, broken morale drops a skill tier. Injuries and severed limbs lower the rating itself.`}" style="cursor:help">${_T`Rating ⓘ`}</th><th>${_T`Record`}</th><th>${_T`Morale`}</th><th>${_T`Contract`}</th></tr>${ros.map(g=>`<tr class="${MGR.lsel===g.id?'me':''}" data-mg="lsel" data-id="${g.id}" style="cursor:pointer"><td>${gArt(g,'xs')}</td><td><b>${esc(g.name)}</b> ${gTags(g)}<br><span class="rc-sub">${_T`${gSex(g)} ${CLASSES[g.cls]?CLASSES[g.cls].name:'?'} · ${gAge(g)} yrs · ${esc(g.city)} · fame ${g.fame} · first sand S${g.debut?g.debut.s:1} W${g.debut?g.debut.wk:1}`}</span></td><td>${starHTML(starsOf(effOvr(g)))}<br>${fameHTML(g.fame)}<br><span class="odds">${effOvr(g)}</span> <span class="rc-sub">${_T`pot ${g.pot}`}</span></td><td class="n">${g.rec.w}W / ${g.rec.ev} · ⚔${g.rec.kp} 🐾${g.rec.kn}</td><td title="${_T`${MORALE_TXT[moraleTier(g.morale)]} · loyalty ${loyaltyOf(g)} (what a rival must beat to poach them; high loyalty renews contracts)`}"><div class="meter"><i style="width:${g.morale}%"></i></div><span class="rc-sub">${g.morale} · ${moraleTier(g.morale)}</span></td><td>${g.contract.wage}/wk · ${g.contract.weeks>0?g.contract.weeks+_T(' wk left'):'<b style="color:var(--blood2)">expired</b>'}</td>
     </tr>`).join('')}</table><p class="rc-sub" style="margin:6px 0 0">${_T`Wages ${coinAmt87(wk)} a week, paid when the week ends · physicians' weekly cap: ${left}/${repCap()} coin of work left · click a fighter to open their card.`}</p></div><div>${detailHTML(ros.find(g=>g.id===MGR.lsel)||ros[0])}</div></div>`:`<p style="color:var(--muted)">${_T`No fighters yet. Go recruiting.`}</p>`}`}
/* RULES_BOX — "How the league works" fold-out. */
const RULES_BOX=()=>`<details class="card2 rulesbox" style="margin-top:10px"><summary>${_T`<b>📖 How the league works</b>`} <span class="rc-sub">${_T`fates, blood money, the infirmary, money`}</span></summary>
     <p style="margin:8px 0 0">${_T`League rules follow the <b>Fate table</b> (rulebook p.54-55) for every fighter in every bout, win or lose: under ${cfAmt87(17)} they are <b>condemned</b> (Damnatio or a Fatal Charade), 17-19 CF they face the <b>Thumb of Flavius</b> (d6: 4-6 spared, else a d12 picks the death), 20-49 CF they <b>survive</b> to the Ludus Flavius, and 50+ CF earns the <b>rudis</b> — freedom, if they want it. A lanista may pay the editor <b>blood money</b> to buy back a condemned fighter; your own verdicts wait for you on Match Week. Severed limbs persist (−6 rating each) until the priests of Hygeia regrow them; a fighter with two severed limbs retires at the end of the week; the old hang up the sword on their own past 35..`}</p>
     <p style="margin:6px 0 0">${_T`<b>How the grades are reckoned.</b> Coin grades your treasury, generosity and betting; Glory your fame and win rate; Honor your personality minus every poach and broken contract; Spectacle your showmanship and fame; Training your discipline and how many fighters you have improved; Arena time how crowded your stable is. Home depends on each fighter's city.`}</p>
     <p style="margin:6px 0 0">${_T`<b>Morale</b> is how a fighter feels this week, and it walks out onto the sand with them: <b>80+</b> high spirits (+1 AP, ${cfAmt87('+1')} when the bout begins, fights bolder) · <b>35-79</b> steady · <b>under 35</b> low (−1 AP, fights cautiously) · <b>under 20</b> broken (also fights a whole tier worse). It rises with bouts, fair wages, meals, kin tickets and bonuses, and falls with idle weeks, low pay and a greedy lanista. Very low morale also invites early retirement and poachers.
     <b>Loyalty</b> is their bond to your ludus (from your Honor, their morale, minus your Greed, plus the bonds you build). It is the number a rival must beat to poach them, it decides who stays when the legions call, and it keeps contracts renewing.`}</p>
     <p style="margin:6px 0 0">${_T`<b>Money.</b> Everything is paid from your <b>treasury</b>. The Medicus, the surgeon and Hygeia's priests also count against your physicians' <b>weekly cap</b> (how much work they can do) (${coinAmt87(repCap())} a week) — a cap, not a separate purse. Three week-ends in the red, or a season ended in debt, and the creditors close the ludus.`}</p></details>`;
/* v0.30 THE LOAN — when the treasury first runs red, a rope is offered: a cordial rival house if you have one,
   otherwise Sica's syndicate (bookmakers, and worse). 8% a week, ~15% collected weekly; pay it off early on the
   lender's team page (a house) or right here (the syndicate). Debts you cannot service cost fame. */
// what a lender will risk on you: fame is collateral, wins are proof — three rungs from it
function loanSizes(mgr){const cap=clamp(Math.round(60+(mgr.fame||0)*4+(mgr.wins||0)*8),80,800);return [Math.round(cap*0.3/10)*10,Math.round(cap*0.6/10)*10,Math.round(cap/10)*10].filter((v,i,a)=>a.indexOf(v)===i)}
/* loanLender — who offers a loan: a friendly house, else the syndicate. Replaced by 66-mgr55. */
function loanLender(){const w=W_(),pm=me();const friendly=typeof opinionOf==='function'?w.mgrs.filter(m=>!m.isPlayer&&opinionOf(m).v>=60).sort((a,b)=>opinionOf(b).v-opinionOf(a).v)[0]:null;
  return friendly?{mgr:friendly.id,name:friendly.ludus,kind:'house'}:{mgr:null,name:"Sica's syndicate",kind:'synd'}}
/* loanCardHTML — the loan offer / loan status card. Replaced by 66-mgr55. */
function loanCardHTML(){const w=W_(),m=me();
  if(w.loan&&w.loan.amt>0)return `<div class="card2 loanbox"><div class="sect" style="margin-top:0">${_T`💸 Your debt to ${esc(w.loan.name)}`}</div>
    <p class="rc-sub" style="margin:0 0 6px">${_T`<b>${coinAmt87(w.loan.amt)} owed</b> · 8% interest a week · they collect ~15% each week's end. ${w.loan.kind==='synd'?_T('The syndicate\u2019s men are polite. So far.'):_T`Pay early on ${esc(w.loan.name)}\u2019s team page, or here.`}`}</p>
    <div class="acts"><button class="btn primary" type="button" data-mg="loanpay" ${dis(needCoin(m,Math.min(w.loan.amt,50)))}>${_T`Pay 50 now`}</button><button class="btn" type="button" data-mg="loanpayall" ${dis(needCoin(m,w.loan.amt))}>${_T`⚖ Pay it all off · ${w.loan.amt}`}</button></div></div>`;
  if(!w.loanAsk||m.coin>=0)return '';
  const L9=loanLender();const sizes=loanSizes(m);
  return `<div class="card2 loanbox offer"><div class="sect" style="margin-top:0">${_T`💸 A rope, for a price`}</div>
    <p style="margin:0 0 6px">${L9.kind==='house'?_T`<b>${esc(L9.name)}</b> — cordial with your house — offers to carry your debts.`:_T`A man with a boxer's ears introduces himself: <b>Sica's syndicate</b> lends to lanistae the banks won't touch.`}
    <span class="rc-sub">${_T`8% interest a week; about 15% of the balance is collected every week's end. Fall behind and your name suffers.`}</span></p>
    <p class="rc-sub" style="margin:0 0 4px">${_T`They lend against what they can seize: your fame and your record set the ceiling.`}</p>
    <div class="acts">${sizes.map(a=>`<button class="btn" type="button" data-mg="loan" data-id="${a}">${_T`Borrow ${a}`}</button>`).join('')}<button class="btn" type="button" data-mg="loanno">${_T`Refuse — a lanista pays his own way`}</button></div></div>`}
/* ludusTabHTML — the Your ludus tab. Wrapped by many later modules. */
function ludusTabHTML(){
  const m=me(),w=W_();const ros=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));
  if(!(MGR.lsel&&ros.some(g=>g.id===MGR.lsel))&&ros.length)MGR.lsel=ros[0].id; // the selected fighter's card always shows beside the roster
  const wk=ros.reduce((s,g)=>s+g.contract.wage,0);const left=Math.max(0,repCap()-(w.repair||0));
  const mine=w.grave.filter(x=>x.mgr===m.name);
  return `${w.awardShow&&!w.awardShow.seen?`<div class="card2 invbox" style="border-color:var(--gold)">${_T`<b>🎭 The Flavian Awards of season ${w.awardShow.season} are waiting</b> — envelopes sealed, the curtain down.`} <button class="btn primary tksm" type="button" data-mg="tab" data-id="awards">${_T`Take your seat`}</button></div>`:''}${weekReviewHTML()}${loanCardHTML()}${invitesHTML(true)}${m.coin<0?`<div class="card2" style="border-color:var(--blood2);margin-bottom:10px">${_T`<b style="color:var(--blood2)">☠ Your treasury is ${coinAmt87(m.coin)}</b> — ${Math.max(0,BANKRUPT_WEEKS-(m.negWeeks||0))} week-end${BANKRUPT_WEEKS-(m.negWeeks||0)===1?'':'s'} in the red before the creditors close the ludus.`}</div>`:''}
   ${runDashHTML(()=>trainYardCardHTML(),()=>`<div class="lan2 ledgers"><div class="card2"><div class="sect" style="margin-top:0">${_T`📜 Ludus ledger`} <span class="rc-sub">${_T`everything that touched your stable`}</span></div>${(w.tlog||[]).length?(()=>{const row=n=>`<div class="${n.cls||''}"><span class="rc-sub">S${n.s} W${n.wk} · </span>${n.text}</div>`;const L=w.tlog.slice(0,40);return `<div class="news">${L.slice(0,2).map(row).join('')}</div>${L.length>2?`<details class="more"><summary>${_T`Show ${L.length-2} older entr${L.length-2===1?'y':'ies'}`}</summary><div class="news" style="max-height:260px">${L.slice(2).map(row).join('')}</div></details>`:''}`})():`<p class="rc-sub" style="margin:0">${_T`Nothing yet — sign someone.`}</p>`}</div>
     <div class="card2"><div class="sect" style="margin-top:0">${_T`✝ The fallen`} <span class="rc-sub">${_T`${mine.length} of yours · ${w.grave.length} across the league`}</span></div>${w.grave.length?(()=>{const row=x=>`<div class="${x.mgr===m.name?'bad':''}"><b>${esc(x.name)}</b>${x.age?`, ${x.age}`:''} <span class="rc-sub">${CLASSES[x.cls]?CLASSES[x.cls].name:''} · ${esc(x.fate||'')} · ${x.mgr?esc(x.mgr):_T('free agent')} · S${x.s} W${x.wk} · ${x.rec?_T`${x.rec.ev} ev, ${x.rec.w} w`:''}</span></div>`;const L=w.grave.slice(0,40);return `<div class="news">${L.slice(0,2).map(row).join('')}</div>${L.length>2?`<details class="more"><summary>${_T`Show ${L.length-2} more`}</summary><div class="news" style="max-height:260px">${L.slice(2).map(row).join('')}</div></details>`:''}`})():`<p class="rc-sub" style="margin:0">${_T`The sand has taken no one yet.`}</p>`}</div>
</div>`)}
`;
}
/* v0.22 MATCH NIGHT RESULTS: once every bout is decided, the night's full result sheet sits at the top */
/* v0.29 THE WEEKLY LOOP: work the tabs left to right, then End the week (always at the far right of the tabs).
   It asks for confirmation — that click is what advances your career AND the empire's calendar. */
function weekReady(){const w=W_();if(!w||!w.night)return {ok:false,why:_T('No week in progress.')};if(w.special&&!w.special.done)return {ok:false,why:_T`${w.special.D.n} is on — settle it on Match Week first.`};
  if(!w.night.bouts.every(b=>b.done))return {ok:false,why:_T('Match Week is not finished — fight, watch or simulate every bout first.')};
  if((w.pend||[]).length)return {ok:false,why:_T('Verdicts are waiting on Match Week — thumbs, blood money, the rudis or the levy.')};return {ok:true}}
/* weekLoopBtns — the weekly loop buttons (back to Your ludus, End the week). */
function weekLoopBtns(){const r=weekReady();return `<div class="acts wkloop"><button class="btn" type="button" data-mg="tab" data-id="ludus">${_T`🏛 Back to Your ludus<small>finish the week's other work</small>`}</button><button class="btn primary" type="button" data-mg="endask" ${r.ok?'':dis([true,r.why])}>${_T`⏭ End the week<small>${r.ok?_T('wages, training, the Acta — and the empire moves on'):esc(r.why)}</small>`}</button></div>`}
/* endConfirmHTML — the End the week confirmation: wages, drills and anything left undone. */
function endConfirmHTML(){const w=W_(),m=me();const wages=rosterOf(m).reduce((a,g)=>a+g.contract.wage+(g.ptrain?PTRAIN_COST:0),0);const R2=TRAIN_REGIMES[w.train]||TRAIN_REGIMES.off;const cost=wages+(R2.c||0);
  const nx=absSW(w,w.week+1);const dt=empireDate(nx.season,nx.wk);
  return `<div class="endconfirm"><div class="card2"><h4 style="margin-top:0">${_T`⏭ End week ${((w.week-1)%12)+1} of season ${w.season}?`}</h4>
    <ul class="rc-sub" style="margin:0 0 8px 16px;padding:0"><li>${_T`Wages${R2.c?_T(' and drills'):''} are paid: about <b>${coinAmt87(cost)}</b> (treasury ${coinAmt87(m.coin)} → ~${m.coin-cost}).`}</li><li>${_T`Training resolves, injuries heal or fester, contracts tick down, rivals recruit, build and poach.`}</li><li>${_T`The Acta Diurna prints this week's results${w.week%12===0?_T(' — and the <b>season recap</b>; the Flavius Superbus opens next'):''}.`}</li><li>${_T`The empire's calendar moves to <b>${esc(dt.short)}</b>, week ${nx.wk}${nx.season!==w.season?_T` of season ${nx.season}`:''}.`}</li></ul>
    ${w.hours>0?`<p class="rc-sub" style="margin:0 0 6px">${_T`⏳ You still have <b>${w.hours}</b> of the lanista's hours — they do not carry over.`}</p>`:''}${(m.perkPts||0)>0?`<p class="rc-sub" style="margin:0 0 6px">${_T`🎓 <b>${m.perkPts}</b> perk point${m.perkPts===1?'':'s'} unspent (they keep).`}</p>`:''}
    <div class="acts"><button class="btn primary" type="button" data-mg="endweek">${_T`Confirm — end the week`}</button><button class="btn" type="button" data-mg="endcancel">${_T`Not yet`}</button></div></div></div>`}
/* nightResultsHTML — the match night result sheet once every bout is decided. */
function nightResultsHTML(){const w=W_(),n=w.night,m=me();if(!n||!n.bouts.every(b=>b.done))return '';
  const tot={purse:0,mine:0,bets:0};
  const card=b=>{const T=TIERS[b.tier];const E=EVENTS[b.ev]||{};const R=b.res;if(!R)return `<div class="nres">${_T`<b>${T.n}</b> — called off.`}</div>`;
    const win=R.winners.map(gById).filter(Boolean);const wm=win[0]&&win[0].contract?mgrById(win[0].contract.mgr):null;tot.purse+=b.purse;
    const rows=[...R.rows].sort((a,c)=>(a.place||9)-(c.place||9)).map(r=>{const g=gById(r.gid);const gm=g&&g.contract?mgrById(g.contract.mgr):null;const mine=gm&&gm.isPlayer;const sd=boutSide(b,b.ents.indexOf(r.gid));
      return `<tr class="${mine?'me':''}${lentOut(g)?' lent':''}${r.won?' won':''}"><td>${r.place?['','🥇','🥈','🥉'][r.place]||r.place+'th':''}</td><td><b>${esc(g?g.name:r.name||'?')}</b>${mine?' <span class="mytag">YOURS</span>':''}${loanTag(g)}${sd?` <span class="sidetag" style="--sc:${sd.col}">${sd.n}</span>`:''}</td><td class="rc-sub">${gm?esc(gm.ludus):_T('free agent')}</td><td class="n">${cfAmt87(r.f)}</td><td>${boutFate(r)}</td></tr>`}).join('');
    let bnet=0;const bets=b.bets.map(x=>{const won=R.winners.includes(x.gid);const pay=won?betPay(x.stake,x.odds).net:0;tot.bets+=pay-x.stake;bnet+=pay-x.stake; // v0.43: each wager as a slip
      return `<span class="betslip ${won?'won':'lost'}" title="${_T`${x.stake} coin on ${esc(gById(x.gid)?.name||'?')} at ${x.odds}×`}"><i>${won?'✓':'✗'}</i><b>${esc(gById(x.gid)?.name||'?')}</b><span>${coinAmt87(x.stake)} @ ${x.odds}×</span><em>${won?'+'+pay:'−'+x.stake}</em></span>`}).join('');
    return `<div class="nres"><div class="nreshd"><b>${T.n}</b> <span class="rc-sub">${_T`${esc(E.n||'')} · ${R.turns||'?'} turns`}</span><span class="rc-sub" title="${_T`How many came to see it`}">🏟 ${R.att?houseK(R.att)+_T(' spectators in the stands'):_T('attendance not counted')}</span><span class="nwin">${_T`🏆 ${win.length?win.map(g=>esc(g.name)).join(' & '):_T('no winner')}${win.some(g=>g.contract&&mgrById(g.contract.mgr)&&mgrById(g.contract.mgr).isPlayer)?' <span class="mytag">YOURS</span>':''}${wm?` <span class="rc-sub">(${esc(wm.ludus)})</span>`:''} · purse ${ICO.coin} ${b.purse}`}</span></div>
      <table class="tally compact">${rows}</table>${bets?`<div class="betslips"><span class="rc-sub">${_T`💰 Your wagers`}</span>${bets}<span class="betnet ${bnet>=0?'up':'dn'}">${_T`${bnet>=0?'+':'−'}${Math.abs(bnet)} coin`}</span></div>`:''}</div>`};
  const html=n.bouts.map(card).join('');
  return `<details class="card2 nightres" open id="nightRes"><summary>${_T`<b>🏁 Match Week results · ${esc(LOCATIONS[n.loc].n)}</b>`} <span class="rc-sub">${_T`${coinAmt87(tot.purse)} in purses${tot.bets?_T` · your betting ${tot.bets>0?'+':''}${tot.bets}`:''} — settle any verdicts, then end the week`}</span></summary>${html}${weekLoopBtns()}</details>`}
/* nightHTML — the Match Week tab: the three bouts, entries, odds, bets, fixing, watch / fight / simulate. Wrapped by several later modules. */
function nightHTML(){
  const w=W_(),n=w.night,m=me();const L=LOCATIONS[n.loc];
  const mine=rosterOf(m);const entered=new Set(n.bouts.flatMap(b=>b.ents));
  const card=(b,bi)=>{/* v0.30: the card runs in order — undercard, feature, then the main event */const inOrder=n.bouts.slice(0,bi).every(x=>x.done);
    const T=TIERS[b.tier];const odds=boutOdds(b);const est=boutProbs(b,'mine');const bk=boutProbs(b,'book');
    const myIn=b.ents.some(id=>{const g=gById(id);return g&&g.contract&&g.contract.mgr===m.id});
    const avail=mine.filter(g=>!entered.has(g.id)&&!g.inj&&effOvr(g)>=T.lo-6&&effOvr(g)<=T.hi+6); /* v0.95: every fit fighter (the starters are put on the card by default, see 229-v95mgr) */ // the injured sit the week out
    const E=EVENTS[b.ev]||EVENTS.democritus;const sr=E.sr||(b.special?_T('Flavius himself'):_T('the editor'));
    return `<div class="card2 bout ${b.tier}${myIn?' mine':''}${b.done?' done':''}" style="margin-bottom:10px"><div class="bouthead">${cardHTML('e:'+b.ev,'sm')}<div class="bouttitle"><span class="tierlbl"><span class="bday">${boutDay(b.tier)}</span> ${T.n}${b.done?' · ✓ fought':myIn?_T(' · ⚔ your fighter is on the card'):''}${myIn&&w.night.scouted&&!b.done?_T` · 🗺 sand walked: +1 AP ${coinAmt87('+1')}`:''}</span><b>${esc(E.n)}</b>${b.special?_T('<span class="badge gold" title="')+esc(E.blurb||'')+_T('">special · bigger purse, stranger rules</span>'):`<span class="rc-sub">${esc(E.short||'')}</span>`}</div>
      <div class="boutstats">${typeof boutSalesStat==='function'?boutSalesStat(b):''}<span class="bstat purse" title="${_T`Goes to the winner's lanista (less the fighter's cut)`}">${_T`<i>Purse</i><b>${ICO.coin} ${b.purse}</b>`}</span><span class="bstat" title="${_T`The editor hires every fighter on the card: each stable is PAID this appearance fee per fighter it enters, win or lose. Entering never costs you coin.`}">${_T`<i>Appearance fee</i><b>+${b.fee}</b>`}</span><span class="bstat" title="${_T`The official who judges the bout: ${esc(sr)}`}">${_T`<i>Summa rudis</i><b>⚖ ${esc(sr)}</b>`}</span><span class="bstat" title="${_T`Only fighters rated in this band are booked`}">${_T`<i>Ratings</i><b>${T.lo?T.lo+'+':'≤ '+T.hi}</b>`}</span><span class="bstat" title="${_T`Fame earned by the winner's stable`}">${_T`<i>Fame</i><b>${ICO.laurel} +${T.fame}</b>`}</span></div></div>
      ${boutSidesHTML(b)}
      ${!b.done&&!b.rig?`<div class="bstake">${_T`💰 <b>Your stake</b>`} <button type="button" class="btn tksm" data-stk="${bi}|-5">−5</button><input type="number" class="tin" id="mgStake${bi}" min="1" max="${m.coin}" value="${Math.min(10,Math.max(1,m.coin))}"><button type="button" class="btn tksm" data-stk="${bi}|5">+5</button> <span class="rc-sub">${_T`coin — then press <b>Bet</b> beside a fighter · treasury ${coinAmt87(m.coin)}`}</span></div>`:''}
      <table class="tally"><tr><th>${_T`Fighter`}</th><th>${_T`Ludus`}</th><th title="${_T`What a rating does on the sand: it sets how well the fighter plays (below 60 like an Easy CPU with loose, noisy decisions; 60-79 Normal; 80+ Hard, near-perfect choices), the armor fitted before the bout (+1 AP per 6 points above 62, up to +5) and coin in the purse (+1 per 5 points above 70, up to +4). Morale shifts it: high morale adds 1 AP and a CF, low morale takes an AP, broken morale drops a skill tier. Injuries and severed limbs lower the rating itself.`}" style="cursor:help">${_T`Rating ⓘ`}</th><th>${_T`Book`}</th><th title="${_T`Your own scouting reports vs the bookmaker: a scouted fighter whose true chance beats the public odds is a VALUE bet; one the public overrates is a TRAP.`}">${_T`Your scouts`}</th><th>${_T`Odds`}</th><th>${b.done?_T('Result'):_T('Bet')}</th></tr>
      ${b.ents.map((id,i)=>{const g=gById(id);if(!g)return '';const gm=g.contract?mgrById(g.contract.mgr):null;const r=b.res&&b.res.rows.find(x=>x.gid===id);
        return `<tr class="${gm&&gm.isPlayer?'me':''}${lentOut(g)?' lent':''}${r&&r.won?' won':''}"><td>${gm&&typeof flagChip==='function'?flagChip(gm,13,_T('Fights under ')+gm.ludus):''}<button class="btn" type="button" data-mg="fav" data-id="${g.id}" title="${_T`${g.favd?_T('Remove from'):_T('Pin to')} your recruiting board`}" style="padding:1px 4px;border:none;background:none;font-size:14px;color:${g.favd?'var(--gold2)':'var(--dim)'}">${g.favd?'★':'☆'}</button>${gArt(g,'xs')} <b>${esc(g.name)}</b>${gm&&gm.isPlayer?' <span class="mytag">YOURS</span>':''}${g.loanFrom?loanTag(g):''} ${(()=>{const sd=boutSide(b,i);return sd?`<span class="sidetag" style="--sc:${sd.col}">${sd.n}</span> `:''})()}${gTags(g)}${g.inj?_T(' <span title="')+esc(g.inj.label)+'">🩹</span>':''}</td><td>${gm?`<span style="color:${gm.color}">${esc(gm.ludus)}</span>${g.loanFrom&&g.loanFrom.mid!==gm.id&&mgrById(g.loanFrom.mid)?`<span class="rc-sub loanfrom"> ${_T`(on loan from: ${esc(mgrById(g.loanFrom.mid).ludus)})`}</span>`:''}`:_T('<span class="rc-sub">free agent</span>')}</td><td>${starHTML(starsOf(estOvr(g).v))} <span class="odds">${estOvr(g).txt}</span></td><td class="n">${Math.round(bk[i]*100)}%</td><td class="n">${g.scout||(gm&&gm.isPlayer)?`${Math.round(est[i]*100)}%${est[i]-bk[i]>=0.07?' <span class="badge good" title="Your scouts rate them well above the public line — the odds pay too much. Bet.">▲ value</span>':est[i]-bk[i]<=-0.07?' <span class="badge bad" title="The public flatters them — the odds pay too little. Stay away, or bet against.">▼ trap</span>':''}`:_T('<span class="rc-sub" title="Scout them (Recruiting tab, 3h) or run a trial bout to see their true chance here">not scouted</span>')}</td><td class="n odds">${odds[i]}×</td>
          <td>${b.done?(r?_T`${r.place?`<b title="${r.won?_T('Last gladiator standing'):r.elimTurn?_T`Eliminated on turn ${r.elimTurn}${r.elimBy?' by '+esc(r.elimBy):''}`:_T('Standing when the bout ended')}">${['','1st','2nd','3rd','4th','5th','6th'][r.place]||r.place+'th'}</b> · `:''}${boutFate(r)} · ${cfAmt87(r.f)}`:''):`<button class="btn" type="button" data-mg="bet" data-id="${bi}|${id}|${odds[i]}" style="padding:3px 8px" ${m.coin<1?'disabled':b.rig?dis([true,_T('You fixed this bout — the bookmaker will not take your money on it.')]):''}>${_T`Bet`}</button>`}</td></tr>`}).join('')}</table>
      ${b.bets.length?`<p class="rc-sub" style="margin:4px 0 0">${_T`Your bets: ${b.bets.map(x=>_T`${x.stake} on ${esc(gById(x.gid)?.name||'?')} at ${x.odds}×`).join(' · ')}`}</p>`:''}
      ${b.done?`<p class="rc-sub" style="margin:6px 0 0">${_T`${esc(b.res.reason||'')} · ${b.res.turns} turns. ${b.res.lines.join(' · ')}`}</p>`:!inOrder?`<p class="rc-sub" style="margin:6px 0 0">${_T`⏳ Waiting its turn — the card runs in order: ${n.bouts.slice(0,bi).filter(x=>!x.done).map(x=>TIERS[x.tier].n).join(', ')} first.`}</p>`:`<div class="acts" style="margin-top:8px">${!myIn&&(b.wd||0)>=2?`<span class="badge bad">${_T`🔒 Closed to your house this week — two withdrawals`}</span>`:''}${!myIn&&(b.wd||0)<2&&avail.length?`<select class="tin" id="ent${bi}" style="width:auto">${avail.map(g=>`<option value="${g.id}">${esc(g.name)} (${effOvr(g)})</option>`).join('')}</select><button class="btn" type="button" data-mg="enter" data-id="${bi}">${_T`Enter your fighter<small>replaces a free agent</small>`}</button>`:''}${!myIn&&!avail.length&&mine.some(g=>g.bench&&!g.inj&&!entered.has(g.id)&&effOvr(g)>=T.lo-6&&effOvr(g)<=T.hi+6)?`<span class="rc-sub">${_T`🪑 Only benched fighters fit this bout — make them starters on the Roster tab.`}</span>`:''}${myIn?`<button class="btn primary" type="button" data-mg="fight" data-id="${bi}">${_T`Fight it yourself<small>take your fighter's reins, live on the board</small>`}</button><button class="btn" type="button" data-mg="withdraw" data-id="${bi}" title="${_T`Pulling out unsettles the box office; after two withdrawals this bout is closed to your house for the week`}">${_T`Withdraw your fighter<small>${(b.wd||0)>=1?_T('last chance — a second withdrawal closes this card to you'):_T('the box office will notice')}</small>`}</button>${boutRiggable(b)?`<button class="btn" type="button" data-mg="rig" data-id="${bi}" ${dis(needCoin(m,rigCost(b)))} style="border-color:#7a2a52">${_T`🤝 Fix the bout<small>${coinAmt87(rigCost(b))} under the table · your fighter wins · ${Math.round(12+(w.rigCount||0)*2)}% chance Flavius finds out${(m.rigStrikes||0)?_T(' · CAUGHT ONCE ALREADY — twice and the ludus is seized'):''}</small>`}</button>`:b.rig?'<span class="badge bad" title="The other lanistae have taken your coin. Nobody talks. Probably.">🤝 fixed</span>':''}`:''}<button class="btn" type="button" data-mg="watch" data-id="${bi}">${_T`Watch live<small>on the arena board</small>`}</button>${W_().spectOK!==false?`<button class="btn" type="button" data-mg="spect" data-id="${bi}">${_T`🎟 Spectate<small>${coinAmt87(({under:3,feature:6,main:12})[b.tier]||6)} · a seat in the stands</small>`}</button>`:''}<button class="btn primary" type="button" data-mg="sim" data-id="${bi}">${_T`Simulate<small>instant result</small>`}</button></div>`}</div>`};
  const allDone=n.bouts.every(b=>b.done);
  // ARENA SCOUTING (v0.20): send a man ahead to the week's arena — the ground, the sky, the mood, and an edge
  const scoutCard=(()=>{const L2=LOCATIONS[n.loc];const fx=n.fx||{};const E=EVENTS[fx.ev||n.bouts[2].ev]||EVENTS.democritus;
    const cardList=n.bouts.map(b=>`<b>${TIERS[b.tier].n}</b>: ${esc((EVENTS[b.ev]||{}).n||'')}`).join(' · ');
    if(!n.scouted)return `<div class="card2" style="margin-bottom:10px;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><b data-tip="${_T`Your doctores pace the ground at ${esc(L2.n)}: the omen, the sky, the crowd's temper and each bout's rules (${esc(cardList.replace(/<[^>]+>/g,''))}). Scouting fighters is on Roster and Recruiting.`}">${_T`🗺 Walk the sand`} <span class="qi">ⓘ</span></b><span class="rc-sub" style="flex:1;min-width:160px">${_T`your fighters on the card get <b>+1 AP, ${coinAmt87('+1')}</b>`}</span><button class="btn" type="button" data-mg="scoutarena" ${dis(needHrs(w,2),needCoin(m,walkFee()))}>${_T`Walk ${esc(L2.n)}<small>2 h · ${coinAmt87(walkFee())}${walkFee()<6?_T(' · 🏠 home sand'):''}</small>`}</button></div>`;
    const S2=n.scouted;return `<div class="card2" style="margin-bottom:10px;border-color:var(--gold)"><div class="sect" style="margin-top:0">${_T`🗺 Your doctores walked the sand at ${esc(L2.n)}`}</div><p class="rc-sub" style="margin:0 0 4px">${_T`This week's card: ${cardList}`}</p>
      <div class="chron"><span class="stat">${_T`<b>${esc(S2.wx||_T('fair skies'))}</b>the sky`}</span><span class="stat">${_T`<b>${esc(n.omen?n.omen.n:'—')}</b>the omen`}</span><span class="stat">${_T`<b>${S2.att>=0?'+':''}${Math.round(S2.att*100)}%</b>attendance from world news`}</span><span class="stat">${_T`<b>${esc(S2.temper)}</b>the crowd's temper`}</span></div>
      ${S2.world.length?`<p class="rc-sub" style="margin:0 0 4px">${S2.world.map(esc).join(' · ')}</p>`:''}
      ${S2.special?`<p style="margin:0 0 4px">${_T`<b>The main event is a special:</b> ${esc(E.n)} — ${esc(E.blurb||'')}`}</p>`:''}
      <p class="rc-sub" style="margin:0">${_T`${esc(S2.tip)} Your fighters take the sand with <b>+1 AP and ${coinAmt87('+1')}</b>.`}</p></div>`})();
  const dt=empireDate(w.season,w.week);
  const exch=`<details class="card2" style="margin-top:10px"><summary>${_T`<b>📈 The betting exchange</b>`} <span class="rc-sub">${_T`every wager laid across the empire — yours, the rival lanistae's, the crowd's`}</span></summary>${exchangeHTML(null,30)}</details>`;
  const gate=(()=>{const gi=MGR.gatePrompt;if(gi==null||!n.bouts[gi]||n.bouts[gi].done)return '';const b=n.bouts[gi];const myIn=b.ents.some(id=>{const g=gById(id);return g&&g.contract&&mgrById(g.contract.mgr).isPlayer});
    return `<div class="card2 invbox" style="border-color:var(--gold);margin-bottom:10px">${_T`<b>⚔ You take your seat</b> — the tiers fill for the ${esc(TIERS[b.tier].n)}: ${b.ents.map(id=>esc((gById(id)||{}).name||'?')).join(', ')}${myIn?_T(' — <b>one of them fights for your house</b>'):''}.`}
     <div class="acts" style="margin-top:6px"><button class="btn primary" type="button" data-mg="watch" data-id="${gi}">${_T`👁 Watch it live<small>your place in the crowd — bet, cheer, throw things</small>`}</button><button class="btn" type="button" data-mg="sim" data-id="${gi}">${_T`▶ Simulate it`}</button><button class="btn" type="button" data-mg="gatex">${_T`Stay on the board`}</button></div></div>`})();
  const cityLock=n.hornsLock!=null&&n.bouts[n.hornsLock]&&!n.bouts[n.hornsLock].done; // v0.33: horns sounded → the square waits until this bout is fought
  // v0.34 THE DEBTOR'S GAMBIT card — the last door out of the red
  const udCard=(w.underdog&&w.underdog.armed&&n.bouts[2]&&!n.bouts[2].done)?(()=>{const est9=44+Math.round(m.fame/10);
    return `<div class="card2" style="border-color:var(--blood2);margin-bottom:10px">${_T`<b>💀 The Debtor's Gambit</b> — the treasury reads <b>${coinAmt87(m.coin)}</b> and the creditors wait at the gate. The editor's offer stands: take the sand <b>yourself</b> in tonight's ${esc(TIERS[n.bouts[2].tier].n)}. Walk off alive and the purse and the spectacle clear your books; fall, and the Annals write your epitaph — <b>death is real, and the career ends on the sand</b>. As a fighter you rate around <b>${est9}–${est9+8}</b>: an old hand, not a champion.`}
    <div class="acts" style="margin-top:6px"><label style="font-size:13px;display:flex;gap:6px;align-items:center">${_T`Bring one of your own:`} <select class="tin" id="udAlly" style="width:auto"><option value="">${_T`— fight alone —`}</option>${rosterOf(m).filter(g2=>g2.alive&&!g2.inj&&!g2.lanista).map(g2=>`<option value="${g2.id}">${_T`${esc(g2.name)} (${effOvr(g2)}) — under truce`}</option>`).join('')}</select></label>
    <button class="btn primary" type="button" data-mg="underdog" style="border-color:var(--blood2)">${_T`⚔ Take the sand yourself<small>live on the board · death is real</small>`}</button></div>
    <p class="rc-sub" style="margin:4px 0 0">${_T`A truce binds you and your fighter until the end — then Flavius breaks every truce, and one of you must put the other down. Ironic. He knows.`}</p></div>`})():'';
  return `${typeof travelCardHTML==='function'?travelCardHTML():''}${udCard}${gate}${nightResultsHTML()}${pendingHTML()}${scoutCard}<div class="acts" style="margin-bottom:8px"><button class="btn" type="button" data-mg="city" ${cityLock?_T`disabled title="The horns have sounded — the arena gates are shut. The square opens again once the ${esc(TIERS[n.bouts[n.hornsLock].tier].n)} is fought."`:''}>${_T`🏙 Walk the city square<small>${cityLock?_T`🎺 the horns have sounded — fight the ${esc(TIERS[n.bouts[n.hornsLock].tier].n)} first`:esc(L.n)+_T(' — the crowd, the shops, the auction block')}</small>`}</button></div><p class="wkline">${_T`📅 <b>${esc(dt.short)}</b> · week ${RN(wkOf(w.week))} of season ${RN(w.season)} — the games are at <b>${L.n}</b>${n.fx&&!/democritus|egidious|cassian/.test(n.fx.ev)?_T` and the main event is a <b>special</b>: ${esc(EVENTS[n.fx.ev].n)}`:''}${n.grand?_T(' · the Grand Games: purses ×1.6'):''}${n.omen&&n.omen.k!=='clear'?` · <b>${n.omen.n}</b> (${n.omen.att>0?_T('attendance up, purses up'):n.omen.att<0?_T('attendance down, purses down'):_T('the city talks of little else')})`:''}.`}<input type="hidden" id="mgStake" value="${Math.min(10,Math.max(1,m.coin))}"></p>
   ${n.bouts.map(card).join('')}
   ${allDone?'':`<div class="mbtns"><button class="btn simall" type="button" data-mg="simall">${_T`⚡ Simulate Match Week<small>quick-sims every remaining bout in order, then shows the night’s results</small>`}</button></div>`}`;
}
// v0.29: recruit search — filters the whole pool (not just the first 60), keeping the cursor in the box
function recSearch(input){MGR.rq=input.value;clearTimeout(recSearch.t);recSearch.t=setTimeout(()=>{if(typeof MGR_REDRAW==='function'){MGR_REDRAW();const n=document.getElementById('recQ');if(n){n.focus();try{n.setSelectionRange(n.value.length,n.value.length)}catch(e){}}}},220)}
/* recruitHTML — the Recruiting tab: search, sort and the free-agent list. */
function recruitHTML(){
  const w=W_(),m=me();
  let list=MGR.filter==='free'?freeAgents():MGR.filter==='signed'?w.glads.filter(g=>g.alive&&g.contract&&g.contract.mgr!==m.id):MGR.filter==='mine'?rosterOf(m):w.glads.filter(g=>g.alive&&(!g.contract||g.contract.mgr!==m.id)&&interestOf(g,m)>=35);
  const key={stars:glad=>-estOvr(glad).v,interest:glad=>-interestOf(glad,m),ask:glad=>askWage(glad),fame:glad=>-glad.fame}[MGR.sort]||(g=>-estOvr(g).v);
  if(MGR.rq){const q=MGR.rq.toLowerCase();list=list.filter(g=>[g.name,CLASSES[g.cls]?CLASSES[g.cls].name:g.cls,g.city,g.contract&&mgrById(g.contract.mgr)?mgrById(g.contract.mgr).ludus:''].filter(Boolean).join(' ').toLowerCase().includes(q))}
  list=[...list].sort((a,b)=>key(a)-key(b)).slice(0,60);
  if(!(MGR.sel&&list.some(g=>g.id===MGR.sel))&&list.length)MGR.sel=list[0].id; // a card is always showing: click any row to switch
  const sel=MGR.sel&&gById(MGR.sel);
  return `<div class="mgrid"><div>
    <div class="acts" style="margin-bottom:8px"><div class="seg">${[['free',_T('Free agents')],['signed',_T('Signed elsewhere')],['targets',_T('Interested in you')],['mine',_T('Your stable')]].map(([k,l])=>`<button type="button" data-mg="filter" data-id="${k}" class="${MGR.filter===k?'on':''}">${l}</button>`).join('')}</div><div class="seg"><span class="lbl">${_T`Sort`}</span>${[['stars',_T('Rating')],['interest',_T('Interest')],['fame',_T('Fame')],['ask',_T('Cheapest')]].map(([k,l])=>`<button type="button" data-mg="sort" data-id="${k}" class="${MGR.sort===k?'on':''}">${l}</button>`).join('')}</div><input type="search" id="recQ" class="tin recq" placeholder="${_T`🔍 Search name, class, city or ludus`}" value="${esc(MGR.rq||'')}" oninput="recSearch(this)"></div>
    <div style="overflow-x:auto;max-height:62vh"><table class="tally"><tr><th>${_T`Fighter`}</th><th title="${_T`What a rating does on the sand: it sets how well the fighter plays (below 60 like an Easy CPU with loose, noisy decisions; 60-79 Normal; 80+ Hard, near-perfect choices), the armor fitted before the bout (+1 AP per 6 points above 62, up to +5) and coin in the purse (+1 per 5 points above 70, up to +4). Morale shifts it: high morale adds 1 AP and a CF, low morale takes an AP, broken morale drops a skill tier. Injuries and severed limbs lower the rating itself.`}" style="cursor:help">${_T`Rating ⓘ`}</th><th>${_T`Wants`}</th><th>${MGR.filter==='mine'?'Loyalty · morale':_T('Your interest')}</th><th>${MGR.filter==='mine'?_T('Wage'):_T('Ask')}</th></tr>
    ${list.map(g=>{const iv=interestOf(g,m);const s=suitors(g);const rank=s.findIndex(x=>x.m===m)+1;return `<tr class="${MGR.sel===g.id?'me':''}" data-mg="sel" data-id="${g.id}" style="cursor:pointer"><td><button class="btn" type="button" data-mg="fav" data-id="${g.id}" title="${_T`${g.favd?_T('Remove from'):_T('Pin to')} your recruiting board`}" style="padding:1px 6px;border:none;background:none;font-size:15px;color:${g.favd?'var(--gold2)':'var(--dim)'}">${g.favd?'★':'☆'}</button>${gArt(g,'xs')} <b>${esc(g.name)}</b> ${gTags(g)}<br><span class="rc-sub">${_T`${gSex(g)} ${CLASSES[g.cls]?CLASSES[g.cls].name:'?'} · ${gAge(g)} yrs · ${esc(g.city)}${g.contract?` · <span style="color:${mgrById(g.contract.mgr).color}">${esc(mgrById(g.contract.mgr).ludus)}</span>`:''}`}</span></td><td>${starHTML(starsOf(estOvr(g).v))}<br><span class="odds">${estOvr(g).txt}</span></td><td class="rc-sub">${g.scout||MGR.filter==='mine'?g.motives.map(([k])=>MOTIVES[k][0]).join(', '):'? (scout)'}</td>${MGR.filter==='mine'?`<td style="min-width:110px"><div class="meter gold"><i style="width:${loyaltyOf(g)}%"></i></div><span class="rc-sub">${_T`loyalty ${loyaltyOf(g)} · morale ${g.morale}`}</span></td><td class="n">${g.contract.wage}</td>`:`<td style="min-width:110px"><div class="meter"><i style="width:${iv}%"></i></div><span class="rc-sub">${iv} · #${rank}${me().fame<reqFame(g)?' · 🔒':''}</span></td><td class="n">${askWage(g)}</td>`}</tr>`}).join('')||`<tr><td colspan="5" style="color:var(--muted)">${_T`Nobody here right now.`}</td></tr>`}</table></div></div>
    <div>${sel?detailHTML(sel):`<div class="card2"><p style="margin:0">${_T`Pick a fighter to see their recruiting card: what they want, how they grade you, their top suitors, and the actions you can spend hours on.`}</p>${typeof hint==='function'?hint('recruit'):''}</div>`}</div></div>`;
}
/* detailHTML — a recruit's card: scouting, motives, interest and the recruiting actions. Wrapped by several later modules. */
function detailHTML(glad){
  const w=W_(),m=me();const iv=interestOf(glad,m);const s=suitors(glad).slice(0,4);const signed=glad.contract&&glad.contract.mgr!==m.id;const mine=glad.contract&&glad.contract.mgr===m.id;const rep=glad.report;
  const hrs=w.hours;
  return `<div class="card2"><div style="display:flex;gap:10px;align-items:flex-start">${gArt(glad,'sm')}<div style="flex:1"><div style="font:400 19px var(--display);color:var(--gold2)"><button class="btn" type="button" data-mg="fav" data-id="${glad.id}" title="${_T`${glad.favd?_T('Remove from'):_T('Pin to')} your recruiting board`}" style="padding:1px 6px;border:none;background:none;font-size:17px;color:${glad.favd?'var(--gold2)':'var(--dim)'}">${glad.favd?'★':'☆'}</button>${esc(glad.name)} ${typeof famFlagChip==='function'?famFlagChip(glad,16):''}</div><div class="rc-sub">${_T`${gSex(glad)} ${CLASSES[glad.cls]?CLASSES[glad.cls].name:'?'} · ${gAge(glad)} years old · from ${esc(glad.city)} · fame ${glad.fame} · ${glad.rec.w} wins in ${glad.rec.ev} events · first sand S${glad.debut?glad.debut.s:1} W${glad.debut?glad.debut.wk:1}${glad.inj?` · <b style="color:var(--blood2)">🩹 ${esc(glad.inj.label)}</b>`:''}`}</div><div>${starHTML(starsOf(estOvr(glad).v))} <span class="odds">${estOvr(glad).txt}</span> ${fameHTML(glad.fame)}${glad.scout>=2?_T` · potential ${glad.pot}${glad.gem?' <span class="badge gold" title="A gem: your scouts swear the ceiling is far above the public rating">💎 gem</span>':''}${glad.bust?' <span class="badge bad" title="Overhyped: the public rating flatters them — the ceiling is close">🫧 overhyped</span>':''}`:''} ${gTags(glad)}</div></div></div>
    ${(glad.hist||[]).length?`<div class="sect">${_T`Career chronicle`}</div><div class="news" style="max-height:120px;font-size:12px">${glad.hist.slice(0,10).map(h=>`<div><span class="rc-sub">S${h.s} W${h.wk} · </span>${h.txt}</div>`).join('')}</div>`:''}
    ${mine?stableCardHTML(glad)+'</div>':`
    <div class="sect">${esc(stageOf(glad))}</div><div class="meter gold"><i style="width:${iv}%"></i></div>
    <div class="sect">${_T`Top suitors`}</div>${s.map(x=>`<div style="display:grid;grid-template-columns:1fr 90px 26px;gap:6px;align-items:center;font-size:12.5px"><span style="color:${x.m.color}">${esc(x.m.ludus)}${x.m.isPlayer?' (you)':''}</span><div class="meter"><i style="width:${x.v}%"></i></div><span class="n">${x.v}</span></div>`).join('')}
    <div class="sect">${_T`What they want · how they grade you`} <span class="rc-sub">${_T`(hover a grade for how to raise it)`}</span></div>${glad.scout?glad.motives.map(([k,wt])=>`<div style="display:flex;gap:8px;align-items:center;font-size:13px;margin:2px 0" title="${esc(MOT_ADVICE[k]||'')}">${gradeHTML(mgrScore(m,k,glad))}<b>${MOTIVES[k][0]}</b><span class="rc-sub">${Math.round(wt*100)}% · ${MOTIVES[k][1]}</span></div>`).join(''):`<p class="rc-sub" style="margin:0">${_T`Unknown until you scout them.`}</p>`}
    ${rep?`<div class="sect">${_T`Scouting report · ${rep.n} sparring bouts in the Ludus (week ${rep.wk})`}</div><div class="rc-stats">${_T`<span><b>${rep.win}/${rep.n}</b>wins</span><span><b>${rep.surv}/${rep.n}</b>survived</span><span><b>${rep.cf}</b>avg CF</span><span><b>${rep.dmg}</b>dmg dealt</span><span><b>${rep.taken}</b>dmg taken</span><span><b>${rep.pots}</b>pots</span><span><b>${rep.kn}</b>beasts</span>`}</div><p class="rc-sub" style="margin:4px 0 0">${_T`Style: ${rep.tags.join(', ')}. ${rep.win/rep.n>=.4?_T('Wins more than their share.'):rep.surv/rep.n<.4?_T('Dies too often to trust in a big bout.'):_T('Solid, unspectacular.')}`}</p>`:''}
    <div id="mgProg"></div>
    <div class="sect">${_T`Recruiting · ${hrs} of the lanista's hours left this week`}</div>
    <div class="acts"><button class="btn" type="button" data-mg="scout" data-id="${glad.id}" ${MGR.busy?'disabled':dis(recGate(glad,'scout'),needHrs(w,3),needCoin(m,scoutCost(glad)))}>${_T`Scout<small>3 h · ${coinAmt87(scoutCost(glad))} · 6 sparring bouts</small>`}</button><button class="btn" type="button" data-mg="visit" data-id="${glad.id}" ${dis(recGate(glad,'visit'),[glad.visits[m.id]&&w.week-glad.visits[m.id]<3,_T('They feasted with you recently — every 3 weeks.')],needHrs(w,4),needCoin(m,visitCost(glad)))}>${_T`Host a feast<small>4 h · ${coinAmt87(visitCost(glad))} · every 3 weeks</small>`}</button><button class="btn" type="button" data-mg="gift2" data-id="${glad.id}" ${dis(recGate(glad,'gift'),[glad.giftWk&&glad.giftWk[m.id]&&w.week-glad.giftWk[m.id]<2,_T('A gift landed too recently — every 2 weeks.')],needHrs(w,2),needCoin(m,giftCost(glad)))}>${_T`Send a gift<small>2 h · ${coinAmt87(giftCost(glad))} · every 2 weeks</small>`}</button>${!glad.contract?`<button class="btn" type="button" data-mg="trial" data-id="${glad.id}" ${MGR.busy?'disabled':dis(recGate(glad,'trial'),needHrs(w,3),needCoin(m,4))}>${_T`Trial bout<small>3 h · ${coinAmt87(4)} · they fight beside your best — trust + a full scout</small>`}</button>`:''}</div>
    <div class="sect">${_T`Pitch (1 h)`} <span class="rc-sub">${_T`· one pitch per recruit a week · <b>${pitchesLeft()}</b> of ${PITCH_MAX} pitches left this week`}</span></div><div class="acts">${Object.entries(MOTIVES).map(([k,[l]])=>`<button class="btn" type="button" data-mg="pitch" data-id="${glad.id}|${k}" ${hrs<1?'disabled':dis(recGate(glad,'pitch'),[pitchesLeft()<=0,_T`All ${PITCH_MAX} of this week's pitches are spent — spread your recruiting across the week's prospects.`])} style="flex:1 1 30%">${gradeHTML(mgrScore(m,k,glad))} ${l}</button>`).join('')}</div>
    ${signed?`<div class="sect">${_T`Poach from ${esc(mgrById(glad.contract.mgr).ludus)}`}</div><p class="rc-sub" style="margin:0 0 6px">${_T`Buyout ${coinAmt87(buyout(glad))} to their lanista · their loyalty ${glad.scout?loyaltyOf(glad):_T('? (scout first)')} · morale ${glad.scout?glad.morale:'?'}`}</p><div class="bslip"><label>${_T`Wage`} <input type="number" class="tin" id="ofWage" value="${Math.ceil(askWage(glad)*1.1)}" min="1" style="width:5em"></label><label>${_T`Weeks`} <select class="tin" id="ofWeeks" style="width:auto"><option>4</option><option selected>8</option><option>12</option></select></label><button class="btn primary" type="button" data-mg="poach" data-id="${glad.id}" ${hrs<2?'disabled':dis(recGate(glad,'offer'))}>${_T`Poach<small>2 h</small>`}</button></div>`
    :`<div class="sect">${_T`Offer a contract (1 h)`}</div><div class="bslip"><label>${_T`Wage`} <input type="number" class="tin" id="ofWage" value="${askWage(glad)}" min="1" style="width:5em"></label><label>${_T`Weeks`} <select class="tin" id="ofWeeks" style="width:auto"><option>4</option><option selected>8</option><option>12</option></select></label><label>${_T`Bonus`} <input type="number" class="tin" id="ofBonus" value="0" min="0" style="width:5em"></label><button class="btn primary" type="button" data-mg="offer" data-id="${glad.id}" ${hrs<1?'disabled':dis(recGate(glad,'offer'))}>${_T`Offer`}</button></div>
    <label style="display:flex;gap:6px;align-items:center;font-size:13px;margin-top:6px"><input type="checkbox" id="ofPledge"> ${_T`<span><b>Pledge them the main event</b> within 2 weeks of signing — worth +12 interest now; break it and your Honor pays for years.</span>`}</label>
    <p class="rc-sub" style="margin:4px 0 0">${_T`Asks about <b>${coinAmt87(askWage(glad))}</b> a week${STAR_PREM[starsOf(effOvr(glad))]>1?_T` (a ${starsOf(effOvr(glad))}★ premium)`:''}. A signing bonus counts toward the weekly wage (spread over the weeks). <b>💰 Money talks:</b> every coin over the ask adds interest — 1.25× the ask ≈ +22, 1.5× ≈ +45${m.fame<reqFame(glad)?_T`; about <b>${Math.ceil(askWage(glad)*fameBypassX(glad,m))}</b> a week buys past their fame demand`:''}. One offer per recruit a week.`}</p>`}
  </div>`}`;
}
/* walkFee — cost of walking this week's arena (half in your home city). */
const walkFee=()=>{const w9=W_(),m9=me();return w9&&m9&&w9.night&&LOCATIONS[w9.night.loc]&&LOCATIONS[w9.night.loc].n===m9.city?3:6}; // v0.36: walking your own home sand costs half
/* scoutCost — scouting hours for a fighter (by stars, half for your home city). */
const scoutCost=glad=>{const c=2+starsOf(pubOvr(glad))*2;const m9=typeof me==='function'?me():null;return m9&&m9.city&&glad.city===m9.city?Math.ceil(c/2):c}; // v0.36: home-city fighters scout at half price
/* v0.17 — the card for a fighter already in YOUR stable: same layout as a recruit card, but the
   actions are a lanista's retention work. Every action raises morale and/or loyalty (g.loyB), and
   loyalty is exactly what a rival must beat to poach them. */
/* ================= THE PRACTICE ARENA · exhibitions (v0.18) =================
   Ask a rival stable for an exhibition: your fighter against theirs (sparring partners fill the
   Classic Elimination's four places). Nobody dies — when a fighter would fall, the doctors PULL them
   and the bout is eventually CALLED. No paying public: the stands fill with fighters from around the
   league, who can only watch and talk. Rewards: their fighters fully scouted, a training chance for
   yours (better if they last), a perk point, and warmer relations with that lanista. */
/* EXHIB_COST / EXHIB_HOURS — what an exhibition costs: coin and recruiting hours. TWEAK: 5 and 3. */
const EXHIB_COST=5,EXHIB_HOURS=3;
/* exhibSetup — picks the exhibition field: your fighter, two of the rival's closest-rated, sparring partners to make four. */
function exhibSetup(myGid,oppId){
  const w=W_(),m=me();const g=gById(myGid);const opp=mgrById(oppId);if(!g||!opp)return null;
  const theirs=rosterOf(opp).filter(x=>!x.inj).sort((a,b)=>Math.abs(effOvr(a)-effOvr(g))-Math.abs(effOvr(b)-effOvr(g))).slice(0,2);
  const used=new Set([g.id,...theirs.map(x=>x.id)]);
  const partners=freeAgents().filter(x=>!used.has(x.id)&&!x.inj&&Math.abs(effOvr(x)-effOvr(g))<=12).slice(0,4-1-theirs.length);
  while(1+theirs.length+partners.length<4){const x=genGlad({ovr:effOvr(g)});x.debut={s:w.season,wk:w.week};w.glads.push(x);partners.push(x)}
  return {g,opp,theirs,partners};
}
/* exhibCfg — the startEvent config of an exhibition (no Fates, stands of fighters only). */
function exhibCfg(match,live,fight){
  const m=me();
  const seats=[seatFor(match.g,m.color,!!fight),...match.theirs.map(x=>seatFor(x,match.opp.color)),...match.partners.map(x=>seatFor(x,null))];
  const home=LOCATIONS.findIndex(L=>L&&L.n===m.city);
  return {ev:'democritus',loc:home>0?home:3,seats,opts:{mods:false,mandata:true,optOffers:true,eaglePot:true,spect:live?'exhib':0},omen:OMENS[0],
    exhibCtx:{cid:W_().id,week:W_().week,my:match.g.id,opp:match.opp.id,theirs:match.theirs.map(x=>x.id)}};
}
/* exhibApply — applies an exhibition: their fighters fully scouted, a training chance for yours, a perk point, cooler rivalry. */
function exhibApply(res,ctx){
  const w=W_(),m=me();const g=gById(ctx.my);const opp=mgrById(ctx.opp);if(!g||!opp)return '';
  const row=res.rows.find(r=>r.mgrId===g.id)||{};const lasted=row.alive||row.won;
  for(const id of ctx.theirs){const x=gById(id);if(x){x.scout=3;ghist(x,_T`exhibition against ${esc(m.ludus)}'s ${esc(g.name)}`)}}
  const lines=[];
  if(g.ovr<g.pot&&Math.random()<(.3+(lasted?.15:0)+m.p.discipline/500)){g.ovr++;lines.push(_T`${esc(g.name)} learns from it: +1 rating`)}
  g.morale=clamp(g.morale+(lasted?5:1),0,100);m.perkPend=(m.perkPend||0)+1;
  if(Math.random()<.06&&!g.inj){g.inj={until:w.week+1,label:_T('a sparring bruise that will not quit'),pen:2};lines.push(_T`${esc(g.name)} picks up ${g.inj.label}`)}
  opp.rivalry=Math.max(0,(opp.rivalry||0)-4);opp.rivals=opp.rivals||{};if(opp.rivals[m.id])opp.rivals[m.id]=Math.max(0,opp.rivals[m.id]-4);
  ghist(g,_T`exhibition against ${esc(opp.ludus)} — ${row.won?_T('last one standing when it was called'):lasted?_T('still standing when it was called'):_T('pulled by the doctors')}`);
  const txt=_T`Exhibition with ${esc(opp.ludus)}: ${esc(g.name)} ${row.won?_T('is the last one standing'):lasted?_T('is still standing when it is called'):_T('is pulled by the doctors')} (${cfAmt87(row.f||0)}). Their fighters are fully scouted; relations warm (rivalry −4); +1 perk point.${lines.length?' '+lines.join('; ')+'.':''}`;
  (w.exlog=w.exlog||[]).unshift({s:w.season,wk:w.week,txt});w.exlog=w.exlog.slice(0,12);tnews(txt);return txt;
}
/* mgrAfterExhib — after a watched exhibition: loads the career if needed and applies it. */
async function mgrAfterExhib(res,ctx){
  if(!MGR.world||MGR.world.id!==ctx.cid){const d=await Store.getDoc('mgrCareers',ctx.cid);if(!d)return;MGR.world=mgrMigrate(JSON.parse(d.world))}
  exhibApply(res,ctx);saveWorld(true);
}
/* recapHTML — a season recap edition of the Acta Diurna (Archives). */
function recapHTML(recap){
  return `<div class="paper"><div class="pmast"><div class="ptitle">${_T`ACTA DIURNA`}</div><div class="psub">${_T`SEASON ${recap.season} · THE RECAP EDITION · ${esc(recap.ludus)} · kept in the Ludus Archives`}</div></div>
   <div class="pcols"><div>
    <div class="phead">${recap.finale&&recap.finale.champ?_T`${esc(recap.finale.champ).toUpperCase()} TAKES THE ${esc(recap.finale.kind).toUpperCase()}`:_T`SEASON ${recap.season} PASSES INTO THE ARCHIVES`}</div>
    <div class="pbody">${_T`${recap.finale?_T`Roma filled for the season's ${esc(recap.finale.kind)} finale — the top four stables drafting ${recap.finale.names.map(esc).join(', ')}, Cassian presiding as summa rudis. ${recap.finale.champ?_T`<b>${esc(recap.finale.champ)}</b>${recap.finale.champLudus?_T` of ${esc(recap.finale.champLudus)}`:''} took the palm with ${recap.finale.f} Crowd Favor after ${recap.finale.turns} turns.`:_T('No champion was crowned; the sand keeps its own counsel.')}`:_T('No finale was fought; the season closed with ledgers instead of laurels.')} The season's crown: <b>${esc(recap.champLanista.name)}</b> of ${esc(recap.champLanista.ludus)} (fame ${recap.champLanista.fame})${recap.champLanista.you?' — <b>yours</b>':''}.`}</div>
    <div class="psec"><div class="ph">${_T`YOUR SEASON · ${esc(recap.ludus)}`}</div>
      <div class="prow">${_T`Record <b>${recap.you.rec}</b> · fame ${recap.you.fame} · treasury ${coinAmt87(recap.you.coin)} · betting ${recap.you.betNet>=0?'+':''}${recap.you.betNet}`}</div>
      <div class="prow">${_T`Pledges kept ${recap.you.kept} · broken ${recap.you.broken} · fighters lost ${recap.you.deaths}${recap.you.rigCaught?_T` · <b>caught fixing: ${recap.you.rigCaught}</b>`:''}`}</div></div>
   </div><div>
    ${recap.standings?`<div class="psec" style="margin-top:0"><div class="ph">${_T`FINAL LEAGUE TABLE`}</div>${recap.standings.map((m,i)=>`<div class="prow">${ROMAN[i+1]||i+1}. <b>${esc(m.ludus)}</b>${m.me?' <span class="pme">(yours)</span>':''} <span class="rc-sub">${_T`${m.pts} pts · ${m.rec}`}</span></div>`).join('')}</div>`:''}
    <div class="psec"><div class="ph">${_T`THE SAND'S FINEST, AS THE SEASON CLOSED`}</div>${recap.best.map((b,i)=>`<div class="prow">${ROMAN[i+1]}. <b>${esc(b.n)}</b> ${b.ovr} · ${esc(b.ludus)}</div>`).join('')}</div>
    <div class="psec"><div class="ph">${_T`THE SEASON'S DEAD · ${recap.graves}`}</div>${recap.obits.map(t=>`<div class="prow">✝ ${esc(t)}</div>`).join('')||`<div class="prow rc-sub">${_T`The sand went hungry. Remarkable.`}</div>`}</div>
   </div></div>
   <div class="pfoot">${_T`Bound in leather and shelved in the Ludus Archives, ${esc(recap.date)}.`}</div></div>`;
}
/* archiveHTML — the Ludus Archives: this season's papers and every season recap. */
function archiveHTML(){
  const w=W_();const paps=w.papers||[];const arcs=(w.archives||[]).slice().reverse();
  if(MGR.arcSel!=null&&arcs[MGR.arcSel])return `<button class="btn" type="button" data-mg="arcback">${_T`← Back to the Archives`}</button><div style="margin-top:8px">${recapHTML(arcs[MGR.arcSel])}</div>`;
  if(MGR.papSel!=null&&paps[MGR.papSel])return `<button class="btn" type="button" data-mg="arcback">${_T`← Back to the Archives`}</button><div style="margin-top:8px">${(()=>{const keep=w.lastPaper;w.lastPaper=paps[MGR.papSel];const h=paperHTML();w.lastPaper=keep;return h})()}</div>`;
  return `<p>${_T`🏺 <b>The Ludus Archives.</b> Every Acta Diurna of the running season, and a leather-bound recap of every season finished — the finale, the crown, your ledger. Reflect with joy or with grudges; the shelf does not judge. Season recaps also hang in <b>the Annals → Archives</b>.`}</p>
   <h4>${_T`This season's editions`}</h4>${paps.length?`<div class="acts">${paps.map((P,i)=>`<button class="btn" type="button" data-mg="arcpap" data-id="${i}" style="flex:0 1 auto">${_T`Week ${P.wk}<small>${esc(P.lead&&P.lead.h||'')}</small>`}</button>`).join('')}</div>`:`<p class="rc-sub">${_T`Nothing printed yet — end a week.`}</p>`}
   <h4>${_T`Season recaps · the trophy shelf`}</h4>${arcs.length?`<div class="list2">${arcs.map((R,i)=>`<div class="lrow" style="--pc:var(--gold)"><span class="bglyph" style="background:var(--gold)">${R.season}</span><div class="t">${_T`<b>Season ${R.season}</b>${R.champLanista.you?_T(' <span class="badge gold">🏆 your crown</span>'):''}<small>${R.finale&&R.finale.champ?_T`${esc(R.finale.kind)} finale: ${esc(R.finale.champ)} took the palm`:_T('no finale record')} · crown: ${esc(R.champLanista.ludus)} · your record ${R.you.rec}</small>`}</div><div class="a"><button class="btn primary" type="button" data-mg="arcopen" data-id="${i}">${_T`Read the recap`}</button></div></div>`).join('')}</div>`:`<p class="rc-sub">${_T`No season has finished yet. The shelf waits.`}</p>`}`;
}
/* ================= THE INFIRMARY (v0.19) =================
   A full house of healing: the Medicus's regimens, the surgeon's knife, the bathhouse, the priests
   of Hygeia for lost limbs and of Asclepius for everything at once. The player-board avatar shows
   each fighter's wounds. Surgeon-grade wounds FESTER if ignored — three weeks and the story ends. */
/* mgAvatar — the infirmary avatar of a fighter: severed limbs gone, the injured location low. */
function mgAvatar(glad){
  const p={id:'inf'+String(glad.id).slice(-5),name:glad.name,hp:{...BASE_HP},ap:{},pieces:{}};
  for(const l of LOCS){p.ap[l]=0;p.pieces[l]=[]}
  for(const l of glad.severed||[])p.hp[l]=0;
  if(glad.inj&&!glad.inj.war){const l=injLoc(glad.inj.label);if(p.hp[l]>0)p.hp[l]=Math.max(1,Math.round(BASE_HP[l]*0.35))}
  return `<span class="infav">${avatarSVG(p)}</span>`;
}
// the care a hurt fighter can receive — shared by the Infirmary tab and the fighter's card in Your ludus
// v0.28: what a fighter costs you, line by line — all of it paid every week, when the week ends
/* wageBreakHTML — what a fighter costs you each week, line by line. */
function wageBreakHTML(glad){const c=glad.contract;const r=c.raises||0;const base=c.base??(c.wage-2*r);const ask=askWage(glad);const tr=glad.ptrain?PTRAIN_COST:0;const tot=c.wage+tr;const wl=Math.max(0,c.weeks);
  return `<div class="wagebox"><div class="wbrow">${_T`<span>Signed wage</span><b>${base}</b>`}</div>${r?`<div class="wbrow"><span>Raises ×${r} (+2 each)</span><b>+${2*r}</b></div>`:''}${tr?`<div class="wbrow">${_T`<span>Personal trainer (this week)</span><b>+${tr}</b>`}</div>`:''}
    <div class="wbrow tot"><span>${tr?_T('Costs you this week'):_T('Costs you each week')}</span><b>${ICO.coin} ${tot}</b></div>
    <div class="rc-sub">${_T`Paid <b>every week</b>, when you end the week, straight from the treasury. ${wl} week${wl===1?'':'s'} left ≈ ${coinAmt87(c.wage*wl)} still owed. Their asking price today: ${ask}/wk${c.wage<ask?_T` — <b style="color:var(--blood2)">underpaid by ${ask-c.wage}</b> (morale slips each week)`:c.wage>ask?_T(' — paid above their ask (morale holds up)'):''}.`}</div></div>`}
/* careHTML — the care options for a hurt fighter (Medicus, surgeon, Hygeia, Asclepius, rest). */
function careHTML(glad){
  const w=W_(),m=me();const left=Math.max(0,repCap()-(w.repair||0));const req=glad.inj?injReq(glad.inj):null;
  if(!glad.inj&&!(glad.severed||[]).length)return '';
  return `${glad.inj?`<small>${glad.inj.war?_T`⚔️ ${esc(glad.inj.label)} — no medicine reaches a war`:_T`🩹 <b>${esc(glad.inj.label)}</b> (−${glad.inj.pen} rating) · needs <b>${req==='rest'?_T('rest (or a bathhouse day)'):req==='medicus'?_T('the Medicus'):_T('THE SURGEON')}</b>${glad.inj.neglect?_T` · <b style="color:var(--blood2)">festering ${glad.inj.neglect}/3</b>`:''}`}</small>`:''}
    ${(glad.severed||[]).length?_T`<small>🦴 severed: ${glad.severed.map(l=>LOCN[l]).join(', ')} — only the priests of Hygeia regrow flesh (${coinAmt87(HYGEIA)} a limb)</small>`:''}
    <div class="acts" style="margin-top:6px">
      ${glad.inj&&!glad.inj.war&&req!=='surgeon'?`<button class="btn primary" type="button" data-mg="medic" data-id="${glad.id}" ${dis([glad.medWk===w.week,_T('Already seen the Medicus this week.')],[left<MEDICUS,_T`Your physicians have done their ${repCap()} coin of work this week — the cap resets when the week ends. The bathhouse and Asclepius still work.`],needCoin(m,MEDICUS))}>${_T`⚕ Medicus<small>${coinAmt87(MEDICUS)} · counts toward the weekly cap · clears it · +12 morale</small>`}</button>`:''}
      ${glad.inj&&!glad.inj.war&&req==='surgeon'?`<button class="btn primary" type="button" data-mg="surgeon" data-id="${glad.id}" ${dis([left<SURGEON,_T`Your physicians have done their ${repCap()} coin of work this week — the cap resets when the week ends.`],needCoin(m,SURGEON))}>${_T`🔪 The surgeon<small>${coinAmt87(SURGEON)} · counts toward the weekly cap · the only physician cure · 1-in-10 mishap costs a week</small>`}</button>`:''}
      ${glad.inj&&!glad.inj.war?`<button class="btn" type="button" data-mg="bath" data-id="${glad.id}" ${dis([glad.bathWk===w.week,_T('They have already been steamed, scraped and oiled this week.')],needCoin(m,5))}>${_T`🛁 Bathhouse day<small>${coinAmt87(5)} · heals a week faster · +4 morale</small>`}</button>`:''}
      ${glad.inj&&!glad.inj.war?`<button class="btn" type="button" data-mg="asclepius" data-id="${glad.id}" ${dis(needCoin(m,ASCLEPIUS))}>${_T`⚡ Temple of Asclepius<small>${coinAmt87(ASCLEPIUS)} · outside help (no cap) · heals any wound at once · +8 morale</small>`}</button>`:''}
      ${(glad.severed||[]).length?`<button class="btn" type="button" data-mg="heal" data-id="${glad.id}" ${dis([left<HYGEIA,_T`Your physicians have done their ${repCap()} coin of work this week — the cap resets when the week ends.`],needCoin(m,HYGEIA))}>${_T`🌿 Blessings of Hygeia<small>${coinAmt87(HYGEIA)} a limb · counts toward the weekly cap · regrows lost limbs</small>`}</button>`:''}
    </div>${careGuideHTML(req)}`;
}
// v0.28: which cure, and why — the physicians' weekly cap explained in plain words
function careGuideHTML(need){const w=W_();const left=Math.max(0,repCap()-(w.repair||0));const hl=k=>need===k?' class="hl"':'';
  return `<details class="careguide"><summary>${_T`Which cure should I use?`} <span class="rc-sub">${_T`· your physicians can still do <b>${left}</b> of ${coinAmt87(repCap())} of work this week`}</span></summary>
    <p class="rc-sub" style="margin:4px 0">${_T`Your ludus <b>physicians</b> (the Medicus, the surgeon, the priests of Hygeia who call on you) can only do so much work a week: <b>${coinAmt87(repCap())}</b> of treatment in total. That is a <b>cap on their time</b>, not extra money — every cure is still paid from your treasury. The <b>bathhouse</b> and the <b>temple of Asclepius</b> are outside help, so they do not count toward the cap.`}</p>
    <table class="tally compact"><tr><th>${_T`Cure`}</th><th>${_T`Cost`}</th><th>${_T`Cap?`}</th><th>${_T`What it does`}</th><th>${_T`Use it when`}</th></tr>
     <tr${hl('rest')}><td>${_T`💤 Rest`}</td><td>free</td><td>—</td><td>${_T`A bruise-grade wound heals by itself in a week or two`}</td><td>${_T`the wound is light and they can sit out a bout`}</td></tr>
     <tr><td>${_T`🛁 Bathhouse`}</td><td>5</td><td>no</td><td>${_T`One week faster on any wound · +4 morale`}</td><td>${_T`cheap help while you wait; stacks with rest`}</td></tr>
     <tr${hl('medicus')}><td>${_T`⚕ Medicus`}</td><td>${MEDICUS}</td><td>yes</td><td>${_T`Clears muscle-grade wounds <b>now</b> · +12 morale · once a week each`}</td><td>${_T`the usual fix — cheapest way back onto the card`}</td></tr>
     <tr${hl('surgeon')}><td>${_T`🔪 Surgeon`}</td><td>${SURGEON}</td><td>yes</td><td>${_T`The only physician cure for a <b>festering</b> wound · 1 in 10 goes wrong (a week lost)`}</td><td>${_T`it festers — waiting kills (3 strikes)`}</td></tr>
     <tr><td>${_T`⚡ Asclepius`}</td><td>${ASCLEPIUS}</td><td>no</td><td>${_T`Heals <b>any</b> wound at once, no mishap · +8 morale`}</td><td>${_T`the cap is spent, a star must fight tonight, or you won't risk the surgeon's knife — it costs 2.5× the Medicus`}</td></tr>
     <tr><td>${_T`🌿 Hygeia`}</td><td>${HYGEIA}/limb</td><td>yes</td><td>${_T`The <b>only</b> way to regrow a severed limb`}</td><td>${_T`a lost limb costs 6 rating until it grows back`}</td></tr></table></details>`}
/* infirmaryHTML — the Infirmary tab. */
function infirmaryHTML(){
  const w=W_(),m=me();const left=Math.max(0,repCap()-(w.repair||0));
  const hurt=rosterOf(m).filter(g=>g.inj||(g.severed||[]).length);
  return `<div class="card2" style="margin-bottom:10px">${_T`⚕ <b>The infirmary</b> — steam, salves, and men who charge by the scream. <b>Every cure is paid from your treasury.</b> The Medicus, the surgeon and Hygeia's priests also count toward your physicians' <b>weekly cap</b> — they can do at most <b>${coinAmt87(repCap())}</b> of treasury a week (<b>${left}</b> left this week); the bathhouse and the temple of Asclepius are outside help and do not count. <b>Care must match the wound</b>: rest heals bruises, the Medicus mends muscle, only the <b>surgeon's knife</b> stops a festering wound, and only <b>Hygeia</b> regrows a lost limb. Ignore a festering wound for three weeks and your fighter dies, flees, or is never quite whole again.`}</div>
  ${hurt.length?`<div class="list2" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">${hurt.map(g=>`<div class="lrow" style="--pc:${g.inj&&g.inj.neglect?'var(--blood2)':'var(--gold)'}">${mgAvatar(g)}<div class="t"><b>${esc(g.name)}</b> ${gSex(g)} <span class="rc-sub">${_T`${effOvr(g)} · morale ${g.morale}`}</span>${careHTML(g)}</div></div>`).join('')}</div>`
   :`<p class="rc-sub">${_T`The steam room sits empty; the surgeon sharpens his knives on nothing. May it stay that way.`}</p>`}`;
}
/* trainYardCardHTML — the training regime picker. */
function trainYardCardHTML(){const w=W_();return `<div class="card2"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">${_T`<b>🏋 Training yard</b>`}<div class="seg">${Object.entries(TRAIN_REGIMES).map(([k,R])=>`<button type="button" data-mg="regime" data-id="${k}" class="${(w.train||'off')===k?'on':''}" title="${R.c?_T`${R.c} coin/week · ${Math.round(R.gain*100)}% +1-rating odds per fighter · ${Math.round(R.inj*100)}% injury risk`:_T('no team drills this week')}">${R.n}${R.c?` · ${coinAmt87(R.c)}`:''}</button>`).join('')}</div></div>
    <span class="rc-sub">${_T`Resolved when the week ends; the report prints in the Acta Diurna. Lighter drills are cheap and safe; brutal drills bring the big gains — and the injuries (benched and rating-docked until the Medicus or a week of rest). Your Discipline sweetens every regime, and ill omens make any yard slicker. Add a <b>personal trainer (doctore)</b> (⚒ ${coinAmt87(PTRAIN_COST)}, on each fighter\u2019s card) for focused work on one fighter — the best odds of all, a small extra risk.`}</span></div>`}
/* practiceHTML — the Practice (exhibitions) tab. */
function practiceHTML(){
  const w=W_(),m=me();const mine=rosterOf(m).filter(g=>!g.inj);const opps=w.mgrs.filter(x=>!x.isPlayer&&rosterOf(x).length);
  const ready=mine.filter(g=>g.exWk!==w.week);
  /* v0.45: ONE Training Yard — the week's team drills first, then sparring with other stables */
  return `${trainYardCardHTML()}<div class="sect" style="margin-top:14px">${_T`⚔ Train with other teams`}</div><p>${_T`🏟 <b>The practice arena.</b> Request an <b>exhibition</b> from a rival stable: your fighter against theirs, sparring partners filling the Classic Elimination's four places. <b>Nobody dies</b> — the doctors pull a fighter before the killing blow and the bout is called. The stands fill with fighters from around the league, who pay a coin from their own purses to watch. You get their fighters fully scouted, a training chance for yours (better if they last), <b>a Match Week edge</b> this week (+1 AP, ${cfAmt87('+2')}), the gate money, a perk point, and warmer relations with that lanista. ${EXHIB_HOURS} hours and ${coinAmt87(EXHIB_COST)} each; once per fighter per week.`}</p>
   ${ready.length&&opps.length?`<div class="card2"><div class="bslip"><label>${_T`Your fighter`} <select class="tin" id="exMine" style="width:auto">${ready.map(g=>`<option value="${g.id}">${esc(g.name)} (${effOvr(g)})</option>`).join('')}</select></label>
     <label>${_T`Against`} <select class="tin" id="exOpp" style="width:auto">${opps.map(x=>`<option value="${x.id}" ${MGR.pOpp===x.id?'selected':''}>${_T`${esc(x.ludus)} — ${rosterOf(x).length} fighters · ${rivalTier(x.rivalry||0)}`}</option>`).join('')}</select></label></div>
     <div class="acts" style="margin-top:8px"><button class="btn primary" type="button" data-mg="exsim" ${MGR.busy?'disabled':dis(needTHrs(w,EXHIB_HOURS),needCoin(m,EXHIB_COST))}>${_T`Request the exhibition<small>${EXHIB_HOURS} h · ${coinAmt87(EXHIB_COST)} · resolved instantly</small>`}</button><button class="btn" type="button" data-mg="exlive" ${dis(needTHrs(w,EXHIB_HOURS),needCoin(m,EXHIB_COST))}>${_T`Watch it live<small>on the board · fighters in the stands</small>`}</button><button class="btn" type="button" data-mg="exfight" ${dis(needTHrs(w,EXHIB_HOURS),needCoin(m,EXHIB_COST))}>${_T`Fight it yourself<small>take your fighter's reins</small>`}</button></div>
     <div id="mgProg"></div></div>`:`<p class="rc-sub">${!mine.length?_T('You need a healthy fighter on your roster.'):!ready.length?_T('Every healthy fighter has already sparred this week.'):_T('No rival stable has fighters to send.')}</p>`}
   ${(w.exlog||[]).length?`<h4>${_T`Recent exhibitions`}</h4><div class="news" style="max-height:220px">${w.exlog.map(x=>`<div><span class="rc-sub">S${x.s} W${x.wk} · </span>${x.txt}</div>`).join('')}</div>`:''}`;
}
/* dis(): cost-gated buttons stay clickable-looking but explain themselves — hover shows WHY and
   what would enable them; clicking one says it out loud instead of doing nothing. */
/* v0.28 RECRUITING DISCIPLINE: one of each recruiting action per recruit per week, three pitches a week in all.
   Spamming one prospect no longer works — spread the hours, and let COIN do the heavy lifting (see offerVerdict). */
/* PITCH_MAX — pitches a week in all. TWEAK: the 3. */
const PITCH_MAX=3;
/* pitchesLeft — pitches left this week. */
const pitchesLeft=()=>{const w=W_();return PITCH_MAX-(w.pitchN&&w.pitchN.wk===w.week?w.pitchN.n:0)};
/* REC_VERB — past-tense verbs of the recruiting actions. */
const REC_VERB={scout:_T('scouted'),trial:_T('held a trial for'),visit:_T('feasted'),gift:_T('sent a gift to'),pitch:_T('pitched'),offer:_T('made an offer to')};
/* recGate — [blocked?, why] — one of each recruiting action per recruit per week. */
function recGate(glad,action){const w=W_(),m=me();const r=glad.recW&&glad.recW[m.id];return [!!(r&&r.wk===w.week&&r.a[action]),_T`You already ${REC_VERB[action]} ${glad.name} this week — one of each recruiting action per recruit, per week.`]}
/* recMark — marks a recruiting action as done this week. */
function recMark(glad,action){const w=W_(),m=me();glad.recW=glad.recW||{};const r=glad.recW[m.id];if(!r||r.wk!==w.week)glad.recW[m.id]={wk:w.week,a:{}};glad.recW[m.id].a[action]=1}
/* dis — data-dis/title attributes from the first failing [bad, why] check (cost-gated buttons explain themselves). */
function dis(...checks){for(const [bad,why] of checks)if(bad)return `data-dis="${esc(why)}" title="${esc(why)}"`;return ''}
/* needCoin — [too poor?, why] check for dis(). */
const needCoin=(mgr,cost)=>[mgr.coin<cost,_T`Needs ${cost} coin — your treasury holds ${mgr.coin}. Win purses, bet well, or wait for wages to turn.`];
/* needHrs — [too few hours?, why] check for dis(). */
const needHrs=(world,hours)=>[world.hours<hours,_T`Needs ${hours} of the lanista's hours — ${world.hours} left. They refill when the week ends.`];
/* kinOf — the regulars in the stands who are this fighter's kin. */
const kinOf=glad=>(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).filter(r=>r.kin&&String(r.kin.name).toLowerCase()===String(glad.name).toLowerCase());
/* stableCardHTML — the card of a fighter in YOUR stable: record, contract, morale, care and retention actions. */
function stableCardHTML(glad){
  const w=W_(),m=me();const hrs=w.hours;const loy=loyaltyOf(glad);
  const rivals=suitors(glad).filter(x=>x.m!==m).slice(0,3);const threat=rivals.find(x=>x.v>loy);
  const left=Math.max(0,repCap()-(w.repair||0));const bonus=giftCost(glad);
  const cool=(k,n)=>glad[k]!=null&&w.week-glad[k]<n;
  return `<div class="sect">${_T`In your stable`}</div>${typeof purseLine==='function'?purseLine(glad):''}
    <div style="display:grid;grid-template-columns:90px 1fr 34px;gap:6px;align-items:center;font-size:13px">${_T`<span>Morale</span>`}<div class="meter"><i style="width:${glad.morale}%"></i></div><span class="n">${glad.morale}</span>
      <span title="${_T`What a rival's interest must exceed to poach them`}">${_T`Loyalty`}</span><div class="meter gold"><i style="width:${loy}%"></i></div><span class="n">${loy}</span></div>
    ${wageBreakHTML(glad)}<p class="rc-sub" style="margin:4px 0 0">${_T`${Math.max(0,glad.contract.weeks)} week${glad.contract.weeks===1?'':'s'} left on the contract${glad.pledge?_T` · <b>promised the main event</b> by week ${wkOf(glad.pledge.due)}`:''}${glad.inj?` · <b style="color:var(--blood2)">🩹 ${esc(glad.inj.label)}</b>`:''}${(glad.severed||[]).length?_T` · severed: ${glad.severed.map(l=>LOCN[l]).join(', ')}`:''}`}</p>
    ${glad.inj||(glad.severed||[]).length?`<div class="card2 carebox"><div class="sect" style="margin-top:0">${_T`⚕ Needs care`}</div>${careHTML(glad)}</div>`:''}
    <div class="sect">${_T`Keeping them · ${hrs} of the lanista's hours left this week`}</div>
    <div class="acts">
      <button class="btn" type="button" data-mg="meal" data-id="${glad.id}" ${dis([cool('mealWk',1),_T('Already shared a meal this week — once a week keeps it special.')],needHrs(w,1),needCoin(m,3))}>${_T`🍷 Share a meal<small>1 h · ${coinAmt87(3)} · weekly · +6 morale, +2 loyalty</small>`}</button>
      <button class="btn" type="button" data-mg="word" data-id="${glad.id}" ${dis([cool('wordWk',1),_T('You already talked this week — pressing them twice reads as nerves.')],needHrs(w,1))}>${_T`🗣 A private word<small>1 h · weekly · hear what troubles them · +3 morale</small>`}</button>
      <button class="btn" type="button" data-mg="kintix" data-id="${glad.id}" ${dis([cool('kinWk',1),_T('The family already has tickets this week.')],needCoin(m,4))}>${_T`🎟 Tickets for the family<small>${coinAmt87(4)} · weekly · kin seated at the next event · +5 morale, +3 loyalty</small>`}</button>
      <button class="btn" type="button" data-mg="bonus" data-id="${glad.id}" ${dis([cool('bonusWk',2),_T('A bonus lands every 2 weeks at most — coin loses meaning faster than wine.')],needCoin(m,bonus))}>${_T`💰 Pay a bonus<small>${coinAmt87(bonus)} · every 2 weeks · +8 morale, +4 loyalty</small>`}</button>
      <button class="btn" type="button" data-mg="raise" data-id="${glad.id}" ${dis(needHrs(w,1))}>${_T`📈 Raise their wage<small>1 h · ${coinAmt87('+2')} a week for good · +10 morale, +6 loyalty</small>`}</button>
      ${!glad.pledge?`<button class="btn" type="button" data-mg="promise" data-id="${glad.id}" ${dis(needHrs(w,1))}>${_T`🏟 Promise the main event<small>1 h · within 2 weeks · +8 morale now — break it and Honor pays</small>`}</button>`:''}
      <button class="btn ${glad.ptrain?'on':''}" type="button" data-mg="ptrain" data-id="${glad.id}">${_T`⚒ Personal trainer (doctore)${glad.ptrain?' ✓':''}<small>${coinAmt87(PTRAIN_COST)} · this week only (hire again next week) · a doctore drills them alone — best odds to raise their rating</small>`}</button>
      ${glad.morale<80&&!glad.inj?`<button class="btn" type="button" data-mg="medic" data-id="${glad.id}" ${dis([glad.medWk===w.week,_T('Already seen the Medicus this week.')],[left<MEDICUS,_T`The weekly repair budget is spent (${repCap()} coin a week) — it refills when the week ends.`])}>${_T`⚕ Medicus<small>${coinAmt87(MEDICUS)} · +12 morale · clears injuries</small>`}</button>`:''}
      <button class="btn" type="button" data-mg="extend" data-id="${glad.id}">${_T`📜 Extend contract<small>+8 weeks</small>`}</button>
      <button class="btn" type="button" data-mg="release" data-id="${glad.id}">${_T`Release`}</button>
    </div>
    <div class="sect">${_T`Rival lanistae circling`}</div>${rivals.map(x=>`<div style="display:grid;grid-template-columns:1fr 90px 26px;gap:6px;align-items:center;font-size:12.5px"><span style="color:${x.m.color}">${esc(x.m.ludus)}${x.v>loy?_T(' <b style="color:var(--blood2)">⚠ could poach</b>'):''}</span><div class="meter"><i style="width:${x.v}%"></i></div><span class="n">${x.v}</span></div>`).join('')}
    <p class="rc-sub" style="margin:2px 0 0">${threat?_T`${esc(threat.m.ludus)} wants them more than they are bound to you — shore up their loyalty before a rival makes an offer.`:_T('Nobody\u2019s interest beats their loyalty right now. Keep it that way.')}</p>
    <div class="sect">${_T`How they grade you`} <span class="rc-sub">${_T`(hover a grade for how to raise it)`}</span></div>${glad.motives.map(([k,wt])=>`<div style="display:flex;gap:8px;align-items:center;font-size:13px;margin:2px 0" title="${esc(MOT_ADVICE[k]||'')}">${gradeHTML(mgrScore(m,k,glad))}<b>${MOTIVES[k][0]}</b><span class="rc-sub">${Math.round(wt*100)}% · ${MOTIVES[k][1]}</span></div>`).join('')}
    ${glad.report?`<div class="sect">${_T`Last scouting report (week ${glad.report.wk})`}</div><div class="rc-stats">${_T`<span><b>${glad.report.win}/${glad.report.n}</b>wins</span><span><b>${glad.report.surv}/${glad.report.n}</b>survived</span><span><b>${glad.report.cf}</b>avg CF</span><span><b>${glad.report.dmg}</b>dmg dealt</span>`}</div>`:''}
    ${glad.lastWord?`<p class="rc-sub" style="margin:6px 0 0"><i>“${esc(glad.lastWord)}”</i></p>`:''}
    ${kinOf(glad).length?`<p class="rc-sub" style="margin:6px 0 0">${_T`👪 Family in the crowd: ${kinOf(glad).map(r=>`<b>${esc(r.name)}</b> (${esc(r.kin.rel)}${r.ticket?' · 🎟 ticketed':''})`).join(', ')}`}</p>`:''}`;
}
/* The recruiting board: the shortlist a real lanista keeps chalked on the wall.
   Star fighters from the Recruiting tab (or let a live-watched bout impress you); act on them from here. */
/* boardHTML2 — the Favorites recruiting board. */
function boardHTML2(){
  const w=W_(),m=me();const favs=w.glads.filter(g=>g.alive&&g.favd);
  if(!favs.length)return `<p style="color:var(--muted)">${_T`Nothing chalked up. Star (☆) fighters in the Recruiting tab — or watch a bout live and let someone impress you — and they appear here with everything you need to land them.`}</p>`;
  const hrs=w.hours;
  if(!(MGR.bsel&&favs.some(g=>g.id===MGR.bsel)))MGR.bsel=favs[0].id;
  const sel=favs.find(g=>g.id===MGR.bsel);
  return `<p>${_T`<b>★ Favorites</b> is your chalkboard: the shortlist you are actively working, ranked by how close each is to signing — pin from Recruiting (☆), or let a live-watched bout impress you and they chalk themselves up. Everything you can do from Recruiting works right here. ${hrs} of the lanista's hours left this week. <b>Click</b> any fighter to show their full recruiting card beside the list — scout, gift, pitch, trial bout and offer from right here.`}</p>
   <div class="mgrid wide"><div><div class="list2" style="grid-template-columns:minmax(0,1fr)">${favs.sort((a,b)=>interestOf(b,m)-interestOf(a,m)).map(g=>{const iv=interestOf(g,m);const su=suitors(g);const rank=su.findIndex(x=>x.m===m)+1;const signedElse=g.contract&&g.contract.mgr!==m.id;
    return `<div class="lrow ${MGR.bsel===g.id?'selrow':''}" data-mg="sel2" data-id="${g.id}" style="--pc:${(CLASSES[g.cls]||{}).color||'#c9a458'};cursor:pointer">${gArt(g,'sm')}<div class="t">
      <b>${esc(g.name)}</b> ${gTags(g)}${g.scout>=2&&g.gem?' <span class="badge gold" title="A gem: the ceiling is far above the public rating">💎</span>':''}${g.scout>=2&&g.bust?' <span class="badge bad" title="Overhyped: the ceiling is close">🫧</span>':''} <span class="rc-sub">${_T`${starHTML(starsOf(estOvr(g).v))} ${estOvr(g).txt} · asks ${askWage(g)}/wk${signedElse?_T` · signed with ${esc(mgrById(g.contract.mgr).ludus)}`:''}`}</span>
      ${_T`<small>${esc(stageOf(g))} · your interest <b>${iv}</b> (#${rank} suitor)${g.scout?_T` · wants ${g.motives.map(([k])=>MOTIVES[k][0].toLowerCase()).join(', ')}`:' · unscouted'}</small>`}
      <div class="meter gold" style="max-width:260px"><i style="width:${iv}%"></i></div></div>
      <div class="a">${!g.scout?`<button class="btn" type="button" data-mg="scout" data-id="${g.id}" ${hrs<3||m.coin<scoutCost(g)?'disabled':''}>${_T`Scout`}</button>`:''}<button class="btn" type="button" data-mg="gift2" data-id="${g.id}" ${dis([g.giftWk&&g.giftWk[m.id]&&w.week-g.giftWk[m.id]<2,_T('A gift landed too recently — every 2 weeks.')],needHrs(w,2),needCoin(m,giftCost(g)))}>${_T`Gift`}</button><button class="btn" type="button" data-mg="fav" data-id="${g.id}">${_T`Unpin ★`}</button></div></div>`}).join('')}</div></div>
   <div>${detailHTML(sel)}</div></div>`;
}
/* leagueHTML — the League tab: table, rivals, stables. */
function leagueHTML(){
  const ms=leagueSort(W_().mgrs);
  const morale=mgr=>{const r=rosterOf(mgr);return r.length?Math.round(r.reduce((a,g)=>a+g.morale,0)/r.length):null};
  const meId=me().id;
  const rivalsOf=mgr=>{ // top 3 stables this lanista is feuding with (their grudge toward you rides in with the rest)
    const heat={...(mgr.rivals||{})};
    if(!mgr.isPlayer&&(mgr.rivalry||0)>(heat[meId]||0))heat[meId]=mgr.rivalry||0;
    return Object.entries(heat).filter(([id2,v])=>v>=15&&id2!==mgr.id&&mgrById(id2)).sort((a,b)=>b[1]-a[1]).slice(0,3)
      .map(([id2,v])=>{const r2=mgrById(id2);return `<span style="white-space:nowrap"><span style="color:${r2.color}">■</span> ${esc(r2.ludus)} <span class="rc-sub" ${v>=35?'style="color:var(--blood2)"':''}>${rivalTier(v)}</span></span>`}).join('<br>')||'<span class="rc-sub">—</span>'};
  return `<div style="overflow-x:auto"><table class="tally"><tr><th>#</th><th>${_T`Lanista`}</th><th title="${_T`League points this season: a win 3, a runner-up finish 1`}">${_T`Pts`}</th><th title="${_T`This season's bouts: won-lost`}">${_T`Season`}</th><th title="${_T`Average rating of the house's five best fighters`}">${_T`Roster`}</th><th>${_T`Fame`}</th><th>${_T`Treasury`}</th><th>${_T`Morale`}</th><th>${_T`Rivals`}</th><th title="${_T`How this lanista feels about YOUR ludus`}">${_T`Toward you`}</th><th>${_T`Fighters`}</th><th title="${_T`All-time record`}">${_T`Record`}</th><th>${_T`Bets`}</th><th>${_T`Personality`}</th></tr>${ms.map((m,mi)=>{const mo=morale(m);const rv=m.rivalry||0;const sp=msp(m);
    return `<tr class="${m.isPlayer?'me':''} lrowlink" data-mg="team" data-id="${m.id}" title="${_T`Open ${esc(m.ludus)}'s team screen`}"><td class="n">${mi+1}${mi<4?' <span title="Superbus place">🏛</span>':''}</td><td>${typeof flagChip==='function'?flagChip(m,16):`<span style="color:${m.color}">■</span>`} <span style="color:${m.color}">■</span> <b>${esc(m.name)}</b> ${m.custom?customTag():''}<br><span class="rc-sub">${esc(m.ludus)} · ${esc(m.city)}</span></td><td class="n"><b style="font-size:16px;color:var(--gold2)">${sp.pts}</b></td><td class="n">${sp.w}-${sp.b-sp.w}</td><td class="n">${rosterRating(m)||'—'}</td><td class="n">${fameHTML(m.fame)}<br>${m.fame} <span class="rc-sub">${mgrTier(m.fame)}</span></td><td class="n">${m.coin}</td>
    <td>${mo==null?'<span class="rc-sub">—</span>':`<div class="meter" style="min-width:56px"><i style="width:${mo}%"></i></div><span class="rc-sub">${mo}</span>`}</td>
    <td style="font-size:12.5px;line-height:1.5">${rivalsOf(m)}</td>
    <td>${m.isPlayer?'<span class="rc-sub">—</span>':`<div class="meter" style="min-width:56px"><i style="width:${rv}%;background:${rv>=60?'var(--blood2)':rv>=35?'#d97a3a':''}"></i></div><span class="rc-sub" ${rv>=35?'style="color:var(--blood2)"':''}>${rivalTier(rv)}</span>`}</td>
    <td class="rc-sub">${rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a)).map(g=>`${esc(g.name)} ${'★'.repeat(starsOf(pubOvr(g)))}`).join(', ')||'—'}</td><td class="n">${m.wins}-${Math.max(0,m.bouts-m.wins)}</td><td class="n">${(m.betNet||0)>=0?'+':''}${m.betNet||0}</td><td class="rc-sub">${MGR_KEYS.map(([k,l])=>[l,m.p[k]]).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([l,v])=>`${l} ${v}`).join(', ')}${m.poached?_T` · poached ${m.poached}`:''}</td></tr>`}).join('')}</table>
  <p class="hint">${_T`<b>The table:</b> a win is 3 points and a runner-up finish is 1 (this season). Ties go to the better win rate, then fame. The <b>top four</b> (🏛) are invited to the Flavius Superbus when week 12 ends. <b>Fame</b> is reputation: it opens recruits' doors and draws crowds. Click a stable for its team screen.`}</p>
  <p class="hint">${_T`Rivalry heats up when you poach a stable, outbid a suitor, or your fighter beats (or kills) theirs — and cools with quiet weeks. Bitter rivals poach YOUR fighters first and bet against your entries.`}</p></div>`;
}
/* newsHTML — the News tab. */
function newsHTML(){
  return `<div class="acts" style="margin-bottom:8px">${W_().lastPaper?`<button class="btn" type="button" data-mg="paper">${_T`📜 Re-read the latest Acta Diurna<small>the week-end gazette</small>`}</button>`:''}</div><div class="news" style="max-height:60vh">${W_().news.map(n=>`<div class="${n.cls||''}"><span class="rc-sub">S${n.s} W${n.wk} · </span>${n.text}</div>`).join('')}</div><div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">${_T`🏺 The Ludus Archives`} <span class="rc-sub">${_T`every back issue of the Acta and every season recap, bound in leather`}</span></div>${archiveHTML()}</div>`}

/* ================= THE ACTA DIURNA: the week-end gazette =================
   When a week ends, the criers publish a newspaper: one generated lead story
   picked from the week's most dramatic facts, the league's top fives, the
   obituaries, and whatever else sells for two sestertii. */
/* ROMAN — Roman numerals 1–12. */
const ROMAN=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
/* v0.22 OVERHEARD: real crowd chatter from the week's events, plus the empire's own absurdities (a satirical gazette, circa MM) */
function overheardLines(world,wkNews,deaths,empire,mainWin){ // v0.24: quotes from the empire's people — real crowd lines first
  const out=[];let buf=[];try{buf=JSON.parse(localStorage.getItem('flavius_overheard')||'[]')}catch(e){}
  const fresh=buf.slice(-14);for(let i=0;i<3&&fresh.length;i++){const q=fresh.splice(Math.floor(Math.random()*fresh.length),1)[0];out.push(_T`“${esc(q.q)}” — ${esc(q.who)}, in the stands at ${esc(q.at)}`)}
  const G=world.glads.filter(g=>g.alive);const g1=pickOne(G);const E=pickOne(empire.length?empire:[{n:'a quiet week',city:'Roma'}]);const city=pickOne(LOCATIONS.filter(Boolean)).n;
  const who=[_T('a fishmonger'),_T('a senator\u2019s cook'),_T('a retired centurion'),_T('a veiled matron'),_T('two sailors, arguing'),_T('a baker of the Aventine'),_T('a bookmaker\u2019s runner'),_T('an augur, off duty'),_T('a very old gladiator'),_T('a boy selling figs')];
  const pool=[_T`“I told my wife ${g1?g1.name:_T('that one')} would win. She said I should get a job. We are both right.”`,_T`“${esc(E.n)} in ${esc(E.city)}? Good. Maybe now they'll fix the aqueduct.”`,_T`“The sausages at ${esc(city)} are a crime. I would know. I sell them.”`,_T`“Tholo winked at me. I think. It only has the one eye, so it's hard to tell.”`,_T`“Back in my day we fought lions with our bare hands. Then the lions won, mostly.”`,_T`“My cousin's neighbor's ludus is the best in the empire. I have never been.”`,_T`“I bet on the underdog every week. The underdog owes me a house.”`,_T`“The editor looked right at me when the thumb went down. I left early.”`];
  while(out.length<4&&pool.length){const k=Math.floor(Math.random()*pool.length);out.push(`${pool.splice(k,1)[0]} — ${pickOne(who)}`)}
  return out}
/* v0.24 THE DARWINIUS AWARDS: the week's most spectacular exits, and the empire's own absurdities */
function darwiniusLines(world,night,deaths,empire){const out=[];
  for(const b of (night?night.bouts:[]))if(b.res)for(const r of b.res.rows){if(!r.elimTurn)continue;const g=gById(r.gid);const nm2=g?g.name:r.name||_T('a gladiator');
    const by=r.elimBy||'';const BEASTN=new Set([...Object.values(NPCT).map(T=>T.n),...Object.values(CITY_BEASTS).flatMap(T=>Object.entries(T).filter(([k])=>k!=='champ').map(([,v])=>v)),_T('Tholo'),_T('Zora')]);const beast=BEASTN.has(by)||/^(Tholo|Commodus)$/.test(by);
    out.push(beast?_T`<b>${esc(nm2)}</b> tried to make friends with ${esc(by)} on turn ${r.elimTurn}. ${esc(by)} declined, loudly.`:by?_T`<b>${esc(nm2)}</b> walked into ${esc(by)}'s swing on turn ${r.elimTurn} with the confidence of someone who had read half the rulebook.`:_T`<b>${esc(nm2)}</b> was out on turn ${r.elimTurn}, beaten mostly by their own footwork.`)}
  for(const d of deaths.slice(0,3))out.push(_T`<b>${esc(d.name)}</b> met <i>${esc(d.fate||_T('the thumb'))}</i>. The crowd rated the exit ${1+Math.floor(Math.random()*4)}/5 for style${d.ovr!=null?_T`, which is more than they ever gave the fighting (${d.ovr})`:''}.`);
  const E=pickOne(empire.length?empire:[{n:'nothing much',city:'Roma'}]);const M=pickOne(world.mgrs);const city=pickOne(LOCATIONS.filter(Boolean)).n;
  const sat=[_T`Area Man Who Bet His Goats On A 25× Longshot Now Has No Goats, Great Story`,_T`${esc(M.ludus)} Announces Bold New Strategy Of “Not Dying,” Early Results Mixed`,_T`Man Who Shouted “Ad Bestias!” At The Wrong Moment Now Lives With Bestias`,_T`${esc(E.city)} Responds To ${esc(E.n)} With Calm, Measured Rioting`,_T`Commodus Impersonator Arrested For Being Too Convincing`,_T`Senator Attends Games “Purely For The Architecture”`,_T`${esc(city)} Sausage Vendor Unveils Bold New Sausage That Is Also, Somehow, A Sausage`,_T`Snake Handler Insists Glykon “Just Wants A Hug,” Is Being Hugged`];
  while(out.length<5&&sat.length){const k=Math.floor(Math.random()*sat.length);out.push(`<b>${sat.splice(k,1)[0]}</b>`)}
  return out.slice(0,6)}
/* composeWeekPaper — writes the week's Acta Diurna: lead story, top fives, obituaries, Overheard, Darwinius awards, next week. */
function composeWeekPaper(world,night=world.night,season=world.season){
  const pm=me();const wk=night?night.week:world.week;const loc=LOCATIONS[night?night.loc:6]||LOCATIONS[6];
  const wkNews=world.news.filter(n=>n.wk===wk);
  const deaths=world.grave.filter(g=>g.wk===wk);
  const mainB=(night?night.bouts:[]).find(b=>b.tier==='main'&&b.done&&b.res);
  const mainWin=mainB&&mainB.res.winners.length?gById(mainB.res.winners[0]):null;
  const mainRow=mainB&&mainWin?mainB.res.rows.find(r=>r.gid===mainWin.id):null;
  const ludusOf=glad=>glad&&glad.contract&&mgrById(glad.contract.mgr)?mgrById(glad.contract.mgr).ludus:_T('no ludus');
  // ---- pick the lead story BY THE NUMBERS (v0.21): the week's biggest win, death or empire event leads ----
  const cands=[];let lead=null;
  if(wk%12===0){const top=leagueSort(world.mgrs,season)[0];
    cands.push({sc:1e9,h:_T`${top.ludus.toUpperCase()} RULES SEASON ${ROMAN[((world.season-1)%12)+1]||world.season}`,
      body:_T`The season closes and one name is on every tongue: <b>${esc(top.name)}</b> of ${esc(top.ludus)}, fame ${top.fame} (${mgrTier(top.fame)}), record ${top.wins}–${Math.max(0,top.bouts-top.wins)}. ${top.isPlayer?_T('Yes, reader — it is the ludus you have been following in these pages.'):upick([_T('The wine in their barracks is said to flow until dawn.'),_T('Their rivals call it luck. Their fighters call it wages paid on time.'),_T('The editor is reportedly “pleased, within reason.”')])} A new season begins next week, and every reputation is again for rent.`,gids:[]})}
  for(const bt of (night?night.bouts:[])){if(!bt.done||!bt.res||!bt.res.winners.length)continue;const g=gById(bt.res.winners[0]);if(!g)continue;const row=bt.res.rows.find(r=>r.gid===g.id);const T=TIERS[bt.tier];
    cands.push({sc:bt.purse+(row?row.f*2:0)+(bt.tier==='main'?25:0),kind:'win',gids:[g.id],
      h:bt.tier==='main'?_T`${g.name.toUpperCase()} TAKES THE MAIN EVENT`:_T`${g.name.toUpperCase()} WINS THE ${T.n.toUpperCase()}`,
      body:_T`Before ${upick([_T('a roaring house'),_T('a full and quarrelsome crowd'),_T('stands packed to the aqueduct line')])} at ${esc(loc.n)}, <b>${esc(g.name)}</b> (${ludusOf(g)==='no ludus'?_T('a free sword'):esc(ludusOf(g))}) took the palm in the ${esc(EVENTS[bt.ev].n)}${row?_T` with ${row.f} Crowd Favor`:''}${bt.res.turns?_T` after ${bt.res.turns} turns`:''}. The purse of <b>${coinAmt87(bt.purse)}</b> ${g.contract?_T('goes largely to the lanista, as purses do'):_T('stays in the winner’s own fist')}. Fame ${g.fame}, rating ${pubOvr(g)} ${'★'.repeat(starsOf(pubOvr(g)))} — ${upick([_T('the touts already shorten the odds.'),_T('the touts pretend they predicted it.'),_T('recruiting scrolls are being written tonight.')])}`})}
  deaths.forEach((d,k)=>cands.push({sc:(d.fame||0)*2.2+(d.ovr||45)+(k?0:10),kind:'death',gids:[],
    h:_T`${d.name.toUpperCase()} FALLS AT ${loc.n.toUpperCase()}`,
    body:_T`The sand keeps what it is given. <b>${esc(d.name)}</b>, ${CLASSES[d.cls]?CLASSES[d.cls].name:d.cls}${d.mgr?_T` of ${esc(d.mgr)}'s stable`:_T(', a free sword')}${d.ovr!=null?_T`, rated ${d.ovr}`:''}${d.fame?_T` and famous (${d.fame})`:''}, died this week — ${esc(d.fate||_T('the crowd turned its thumb'))}. The record they leave: ${d.rec.ev} event${d.rec.ev===1?'':'s'}, ${d.rec.w} win${d.rec.w===1?'':'s'}, ${d.rec.kp} kill${d.rec.kp===1?'':'s'}. ${upick([_T('The concession stands fell quiet for nearly a minute.'),_T('A spectator was heard to say the thumb was “decided before the fight began.”'),_T('The Liberti say the same thing they always say: it could have been freedom instead.')])}${deaths.length>1?_T` <i>(${deaths.length-1} other fighter${deaths.length===2?'':'s'} also died this week — see the obituaries.)</i>`:''}`}));
  const empire=(typeof worldEvents==='function'?worldEvents(`m:${world.id}:${season}:${wk}`):[]).slice().sort((a,b)=>(b.sev*30+Math.abs(b.mood)*2+Math.abs(b.att)*100)-(a.sev*30+Math.abs(a.mood)*2+Math.abs(a.att)*100));
  if(empire[0]){const e=empire[0];cands.push({sc:e.sev*30+Math.abs(e.mood)*2+Math.abs(e.att)*100,kind:'empire',gids:[],
    h:_T`${e.i} ${e.n.toUpperCase()} AT ${e.city.toUpperCase()}`,
    body:_T`The empire outshouts the arena this week: <b>${esc(e.n)}</b> at ${esc(e.city)}${e.war?_T` — ${esc(e.war.rome)} against ${esc(e.war.foe)}`:''}. ${e.att>0?_T`Attendance at nearby arenas rises (+${Math.round(e.att*100)}%)`:e.att<0?_T`Nearby gates thin (${Math.round(e.att*100)}%)`:_T('The gates hold steady')} and the crowds are ${e.mood>=5?_T('in a giving mood'):e.mood<=-5?_T('sour and hungry for blood'):_T('restless')}. ${upick([_T('The criers have not slept.'),_T('Wagers on the sand are down; wagers on the news are up.'),_T('The editor dispatched two runners. One came back.')])}`})}
  cands.sort((a,b)=>b.sc-a.sc);lead=cands[0]||null;
  if(!lead){const bw=wkNews.find(n=>n.cls==='bad');
    lead=bw?{h:_T('TROUBLE IN THE BARRACKS'),body:`${bw.text} ${upick([_T('The criers add their own embroidery, as criers do.'),_T('Coin, as ever, is at the bottom of it.')])}`,gids:[]}
      :{h:_T('A QUIET WEEK ON THE SAND'),body:_T`No deaths, no scandals — the editors despair. The touts pass the time re-ranking the league${pm?_T`, where ${esc(pm.ludus)} stands with ${coinAmt87(pm.coin)} and a ${pm.wins}–${Math.max(0,pm.bouts-pm.wins)} record`:''}. ${upick([_T('Enjoy it. Quiet weeks are a loan, not a gift.'),_T('The beasts, at least, were fed.'),_T('Even Flavius was seen stifling a yawn.')])}`,gids:[]}}
  const also=cands.slice(1,3).filter(c=>c.sc<1e9).map(c=>({h:c.h,body:c.body.replace(/<[^>]*>/g,'').split('. ').slice(0,2).join('. ')+'.',gids:c.gids}));
  const wins=(night?night.bouts:[]).filter(b=>b.done&&b.res);
  const numbers={purses:wins.reduce((t,b)=>t+b.purse,0),bouts:wins.length,deaths:deaths.length,crowd:night&&night.crowd?night.crowd:null,topCF:Math.max(0,...wins.flatMap(b=>b.res.rows.map(r=>r.f||0))),empire:empire.length};
  // ---- the top fives ----
  const top5m=leagueSort(world.mgrs,season).slice(0,10);
  const top5g=world.glads.filter(g=>g.alive&&g.contract).sort((a,b)=>effOvr(b)-effOvr(a)).slice(0,10);
  const top5f=freeAgents().sort((a,b)=>effOvr(b)-effOvr(a)).slice(0,5);
  const briefs=wkNews.filter(n=>n.text!==lead.body&&!/^Week \d/.test(n.text.replace(/<[^>]*>/g,''))).slice(0,4);
  return {wk,season,locN:loc.n,grand:!!(night&&night.grand),omen:night&&night.omen&&night.omen.n?night.omen.n:null,
    lead,also,numbers,empire:empire.slice(0,5).map(e=>({i:e.i,n:e.n,city:e.city,sev:e.sev,mood:e.mood})),briefs:briefs.map(n=>n.text),
    standings:top5m.map(m=>({name:m.name,ludus:m.ludus,color:m.color,fame:m.fame,pts:msp(m,season).pts,srec:`${msp(m,season).w}–${msp(m,season).b-msp(m,season).w}`,tier:mgrTier(m.fame),rec:`${m.wins}–${Math.max(0,m.bouts-m.wins)}`,me:!!m.isPlayer})),
    best:top5g.map(g=>({gid:g.id,name:g.name,stars:starsOf(pubOvr(g)),ovr:pubOvr(g),ludus:ludusOf(g),me:!!(g.contract&&g.contract.mgr===pm.id)})),
    agents:top5f.map(g=>({gid:g.id,name:g.name,stars:starsOf(pubOvr(g)),ovr:pubOvr(g),wage:askWage(g),city:g.city})),
    obits:deaths.map(d=>`<b>${esc(d.name)}</b>, ${CLASSES[d.cls]?CLASSES[d.cls].name:d.cls}${d.age?_T`, aged ${d.age}`:''}${d.mgr?_T` · ${esc(d.mgr)}'s stable`:_T(' · a free sword')}<br><span class="rc-sub">${_T`${d.ovr!=null?_T`rated ${d.ovr} ${'★'.repeat(starsOf(d.ovr))}`:''}${d.f!=null?_T` · ${cfAmt87(d.f)} in their last bout`:''}${d.fame?_T` · fame ${d.fame}`:''} · ${d.rec.ev} bouts, ${d.rec.w} wins, ${d.rec.kp} kills · <i>${esc(d.fate||'')}</i>${d.kin&&d.kin.length?_T`<br>Survived by ${d.kin.map(esc).join(', ')}, who watched from the stands.`:''}`}</span>`),
    next:paperPreview(world),
    training:(world.lastTraining||[]).map(t=>`<b>${esc(t.n)}</b>: ${t.txt}`),trainLudus:pm.ludus,
    quote:overheardLines(world,wkNews,deaths,empire,mainWin).join('<br>'),darwin:darwiniusLines(world,night,deaths,empire)};
}
// NEXT WEEK, for the back page: where, what weather, what the empire is doing, the card and the purses
function paperPreview(world){const n=world.night;if(!n)return null;const L=LOCATIONS[n.loc];const pm=me();
  const hot=world.mgrs.filter(m=>!m.isPlayer&&(m.rivalry||0)>=35).sort((a,b)=>b.rivalry-a.rivalry).slice(0,2);
  return {wk:n.week,where:L?L.n:'',grand:!!n.grand,omen:n.omen&&n.omen.k!=='clear'?n.omen.n:null,wx:n.wx||null,world:n.world||[],
    bouts:n.bouts.map(b=>({t:TIERS[b.tier].n,ev:EVENTS[b.ev].n,purse:b.purse,names:b.ents.map(gById).filter(Boolean).map(g=>`${g.name}${g.contract&&g.contract.mgr===pm.id?' (yours)':''}`)})),
    rivals:hot.map(m=>`${m.ludus} — ${rivalTier(m.rivalry)}`)}}
/* a gladiator's name in the paper: ☆ to favorite while they live; struck through once dead, freed or gone */
function papName(name,gid){if(gid==null)return `<b>${esc(name)}</b>`;const g=gById(gid);
  if(!g||!g.alive){const why=!g?_T('gone from the league'):g.freed2?_T('freed — took the rudis'):(W_().grave.find(x=>x.name===g.name)?'fallen':'retired');return `<b class="pgone" title="${why}"><s>${esc(name)}</s></b> <span class="rc-sub">(${why.split(' —')[0]})</span>`}
  return `${gArt(g,'xs')}<button class="btn pfav" type="button" data-mg="fav" data-id="${g.id}" title="${_T`${g.favd?_T('Remove from'):_T('Pin to')} your recruiting board (Favorites)`}">${g.favd?'★':'☆'}</button><b>${esc(name)}</b>`}
/* paperHTML — the Acta Diurna as a newspaper page. */
function paperHTML(){
  const P=W_().lastPaper;if(!P)return `<p class="rc-sub">${_T`No edition has been printed yet. End a week first.`}</p>`;
  const N=P.numbers;const lg=P.lead&&P.lead.gids&&P.lead.gids[0]?gById(P.lead.gids[0]):null;
  const leadArt=lg?`<div class="pleadart">${gArt(lg,'md')}<span class="pleadtok">${figureHTML(tokenForCls(CLASSES[lg.cls]?lg.cls:'soldier'),78)}</span></div>`:'';
  const five=(title,rows)=>`<div class="psec"><div class="ph">${title}</div>${rows.length?rows.map((r,i)=>`<div class="prow">${ROMAN[i+1]}. ${r}</div>`).join(''):'<div class="prow rc-sub">— none —</div>'}</div>`;
  return `<div class="paper">
    <div class="pmast"><button class="btn primary pnextwk" type="button" data-mg="tab" data-id="ludus">${_T`Start your next week →`}</button><div class="ptitle">${_T`ACTA DIURNA`}</div><div class="psub">${_T`Season ${P.season} · Week ${P.wk} · printed at ${esc(P.locN)}${P.grand?_T(' · <b>THE GRAND GAMES</b>'):''} · price II sestertii${P.omen?_T` · omen: ${esc(P.omen)}`:''}`}</div></div>
    <div class="plead">${leadArt}<div class="pleadtxt">
        <div class="phead">${esc(P.lead.h)}</div>
        ${P.lead.gids&&P.lead.gids.length?`<div class="prow" style="border:none">${P.lead.gids.map(id=>{const g=gById(id);return papName(g?g.name:'?',id)}).join(' ')}</div>`:''}
        <div class="pbody">${P.lead.body}</div>
        ${N?`<div class="pnums">${_T`<span><b>${N.bouts}</b>bouts</span><span><b>${coinAmt87(N.purses)}</b> in purses</span><span><b>${N.topCF}</b>top CF</span><span><b>${N.deaths}</b>dead</span><span><b>${N.empire}</b>empire events</span>`}</div>`:''}
      </div></div>
    <div class="pgrid2"><div>
        ${P.also&&P.also.length?`<div class="psec"><div class="ph">${_T`ALSO THIS WEEK`}</div>${P.also.map(c=>`<div class="prow"><b>${esc(c.h)}</b> — ${esc(c.body)} ${(c.gids||[]).map(id=>{const g=gById(id);return g?papName(g.name,id):''}).join(' ')}</div>`).join('')}</div>`:''}
        ${P.empire&&P.empire.length?`<div class="psec"><div class="ph">${_T`THE EMPIRE THIS WEEK`}</div>${P.empire.map(e=>`<div class="prow">${e.i} <b>${esc(e.n)}</b> · ${esc(e.city)} <span class="rc-sub">${_T`${'▮'.repeat(e.sev)} · the crowds ${e.mood>=5?_T('cheerful'):e.mood<=-5?_T('sour'):_T('uneasy')}`}</span></div>`).join('')}</div>`:''}
        ${P.briefs.length?`<div class="psec"><div class="ph">${_T`IN BRIEF`}</div>${P.briefs.map(t=>`<div class="prow">• ${t}</div>`).join('')}</div>`:''}
        ${P.obits.length?`<div class="psec"><div class="ph">OBITUARIES</div>${P.obits.map(t=>`<div class="prow">✝ ${t}</div>`).join('')}</div>`:''}
        ${P.darwin&&P.darwin.length?`<div class="psec"><div class="ph">${_T`THE DARWINIUS AWARDS · THIS WEEK`}</div>${P.darwin.map(t=>`<div class="prow">🏅 ${t}</div>`).join('')}</div>`:''}
    </div><div>
        ${five(_T('LUDUS STANDINGS · TOP X'),P.standings.map(m=>`<span style="color:${m.color}">■</span> <b>${esc(m.ludus)}</b>${m.me?' <span class="pme">(yours)</span>':''} <span class="rc-sub">${_T`${m.pts!=null?_T`<b>${m.pts} pts</b> · ${m.srec} · `:''}${esc(m.name)} · fame ${m.fame} ${m.tier}`}</span>`))}
        ${five(_T('THE SAND’S FINEST · TOP X'),P.best.map(g=>`${papName(g.name,g.gid)}${g.me?' <span class="pme">(yours)</span>':''} ${'★'.repeat(g.stars)} <span class="rc-sub">${g.ovr} · ${esc(g.ludus)}</span>`))}
        ${five(_T('SWORDS FOR HIRE · TOP V'),P.agents.map(g=>`${papName(g.name,g.gid)} ${'★'.repeat(g.stars)} <span class="rc-sub">${_T`${g.ovr} · of ${esc(g.city)} · asks ${g.wage}/wk`}</span>`))}
        ${P.training&&P.training.length?`<div class="psec"><div class="ph">${_T`FROM THE TRAINING YARD`}</div><div class="prow rc-sub" style="border-bottom:none">${_T`${esc(P.trainLudus||_T('Your ludus'))} drills, observed over the wall:`}</div>${P.training.map(t=>`<div class="prow">${t}</div>`).join('')}</div>`:''}
        <div class="psec"><div class="ph">OVERHEARD</div><div class="prow"><i>${P.quote}</i></div></div>
    </div></div>
    <div class="pflow1">
        ${P.next?`<div class="psec"><div class="ph">${_T`NEXT WEEK · WEEK ${ROMAN[((P.next.wk-1)%12)+1]||P.next.wk} AT ${esc(P.next.where).toUpperCase()}${P.next.grand?_T(' · THE GRAND GAMES'):''}`}</div>
          <div class="prow">${_T`<b>Forecast:</b> ${esc(P.next.wx||_T('fair skies'))}${P.next.omen?_T` · <b>Omen:</b> ${esc(P.next.omen)}`:''}`}</div>
          ${P.next.world.length?`<div class="prow">${_T`<b>Word from the empire:</b> ${P.next.world.map(esc).join('; ')}`}</div>`:''}
          ${P.next.bouts.map(b=>`<div class="prow">${_T`<b>${esc(b.t)}</b> (${esc(b.ev)}) · purse ${coinAmt87(b.purse)}: ${b.names.map(esc).join(', ')||_T('<i>card to be announced</i>')}`}</div>`).join('')}
          ${P.next.rivals.length?`<div class="prow">${_T`<b>Bad blood:</b> ${P.next.rivals.map(esc).join('; ')}`}</div>`:''}</div>`:''}
    </div>
    <div class="pfoot">${_T`The Acta Diurna is nailed to the forum wall at week's end. Complaints may be addressed to the editor, who does not read them.`}</div>

  </div>`;
}
/* promoteCardHTML — the Promote the ludus card. */
function promoteCardHTML(){const m=me(),w=W_();return `<div class="card2" style="margin-top:8px"><div class="sect" style="margin-top:0">${_T`📯 Promote the ludus`} <span class="rc-sub">${_T`fans won this way appear on the Imperium map`}</span></div>
     <div class="acts">
      <button class="btn" type="button" data-mg="feast2" ${dis([(m.feastWk===w.week),_T('You already fed a city this week.')],needHrs(w,2),needCoin(m,10))}>${_T`🍞 Feast a city<small>2 h · ${coinAmt87(10)} · a random city eats in your name: its regulars turn fans of your best fighter, +1 fame</small>`}</button>
      <button class="btn" type="button" data-mg="sponsor2" ${dis([(m.sponWk===w.week),_T('One sponsorship a week — even Rome has limits.')],needCoin(m,18))}>${_T`🏟 Sponsor the games<small>${coinAmt87(18)} · your name over the arena: +2 fame, rivals seethe a little</small>`}</button>
      <button class="btn" type="button" data-mg="criers2" ${dis([(m.crierWk===w.week),_T('The criers are still hoarse from last time.')],needHrs(w,1),needCoin(m,6))}>${_T`📢 Hire the criers<small>1 h · ${coinAmt87(6)} · every free agent hears your name: +2 interest across the market</small>`}</button>
     </div></div>`}
/* schoolingCardHTML — the lanista's Schooling (perk points) card. */
function schoolingCardHTML(){const m=me(),w=W_();const P=m.perkPts||0;return `<div class="card2 schoolcard${P?' haspts':''}" id="schoolCard" style="margin-top:8px"><div class="schoolhd"><div class="sect" style="margin:0">${_T`🎓 The lanista's schooling · points to spend`}</div><div class="ptbox${P?' on':''}" title="${_T`${P} perk point${P===1?'':'s'} ready to spend`}">${P}</div></div>
     <p class="rc-sub" style="margin:0 0 6px">${_T`Each week teaches: <b>+1</b> for the week itself, <b>+1</b> per bout your fighters win, <b>+1</b> per kept pledge, <b>+1</b> when training improves two or more. Points earned this week (<b>${m.perkPend||0}</b> so far) unlock <b>next</b> week. Available now: <b style="color:var(--gold2)">${m.perkPts||0}</b>${m.perkLast?_T` · last week earned ${m.perkLast}`:''}`}</p>
     <div class="acts">${MGR_KEYS.map(([k,l,d])=>`<button class="btn" type="button" data-mg="perk" data-id="${k}" ${(m.perkPts||0)<1||m.p[k]>=95?'disabled':''} title="${d}" style="flex:1 1 30%">${l} ${m.p[k]}${m.p[k]<95?' → '+Math.min(95,m.p[k]+2):' (max)'}<small>1 pt · +2</small></button>`).join('')}</div>
     <p class="rc-sub" style="margin:6px 0 0">${_T`These are the same traits recruits grade you on — Discipline sharpens training, Honor mends old poaches, Showmanship sells the crowd — so every point spent shifts real interest.`}</p></div>`}
/* meHTML — the Lanista tab. */
function meHTML(){
  const m=me(),w=W_();
  /* v0.36: three real columns, top-aligned and balanced — who you are | what your house is worth | how fighters see you */
  const persona=`${MGR.flagPick&&typeof flagPickerHTML==='function'?`<div class="card2" style="margin-bottom:8px">${flagPickerHTML(mgrFlagOf(m),MGR.flagSeed||1,m.ludus).replace(/data-nmflag/g,'data-mgflag').replace('data-mg="nmflagshuffle"','data-mg="mgflagshuffle"')}</div>`:''}<div class="card2"><div style="display:flex;gap:10px;align-items:center;margin-bottom:6px">${typeof flagChip==='function'?flagChip(m,40):''}<button class="btn tksm" type="button" data-mg="flagpick">🚩 ${MGR.flagPick?_T('Close the banner rack'):_T('Change the house banner')}</button></div><h4 style="margin-top:0">${_T`Personality`}</h4>${MGR_KEYS.map(([k,l,d])=>`<div style="display:grid;grid-template-columns:110px 1fr 30px;gap:6px;align-items:center;font-size:13px" title="${d}"><span>${l}</span><div class="meter gold"><i style="width:${m.p[k]}%"></i></div><span class="n">${m.p[k]}</span></div>`).join('')}
    <p class="rc-sub" style="margin-bottom:0">${esc(m.bio||'')}${m.city?_T` · home city <b>${esc(m.city)}</b>`:''}</p></div>`;
  const record=`<div class="card2"><div class="sect" style="margin-top:0">${_T`Your record`}</div><div class="badges"><span class="badge">${_T`Fighters improved ${m.improved||0}`}</span><span class="badge">${_T`Pledges kept ${m.kept||0} · broken ${m.broken||0}`}</span><span class="badge">${_T`Poached ${m.poached||0}`}</span><span class="badge">${_T`Deaths ${m.deaths||0}`}</span><span class="badge">${_T`Betting ${(m.betNet||0)>=0?'+':''}${m.betNet||0}`}</span></div></div>`;
  const sandbox=`<div class="card2"><div class="sect" style="margin-top:0">${_T`🏜 Sandbox · this career's house rules`}</div>
     <p class="rc-sub" style="margin:0 0 6px">${_T`🔒 <b>Baked in at the founding.</b> Chosen when the career was created, never changed after — every record was earned under the same rules. 100% is the printed game.`}</p>
     <div class="badges">${RULE_LIST9.map(([k,l,d])=>`<span class="badge${((w.rules||RULES_DEF)[k]??100)!==(RULES_DEF[k]??100)?' gold':''}" title="${d}">${l} ${(w.rules||RULES_DEF)[k]??100}%</span>`).join('')}</div>
     <label style="display:flex;gap:8px;align-items:center;font-size:13px;margin-top:6px">${_T`🎪 Your festival, should you lead the league at season's end:`}<select class="tin" data-rule-fest="1" style="width:auto">${Object.entries(FEST_KINDS).map(([k,F])=>`<option value="${k}" ${(w.festPick||'ludi')===k?'selected':''}>${F.n}</option>`).join('')}</select></label>
     <div class="badges" style="margin-top:6px"><span class="badge${w.spectOK===false?' bad':' good'}" title="${_T`Chosen at the founding`}">${_T`🎟 Spectating ${w.spectOK===false?_T('not allowed'):_T('allowed')}`}</span></div></div>`;
  const wallet=`<div class="mbtns" style="margin-top:0">${MGR.activeCid===w.id?`<button class="btn" type="button" disabled>${_T`★ Active wallet<small>this treasury bankrolls your wagers everywhere</small>`}</button>`:`<button class="btn" type="button" data-mg="setactive" data-id="${w.id}">${_T`Use for wagers<small>make this the treasury behind the Wagers window</small>`}</button>`}<button class="btn" type="button" data-mg="quit">${_T`Save and leave this career`}</button></div>`;
  const grades=`<div class="card2"><h4 style="margin-top:0">${_T`How fighters grade you`} <span class="rc-sub">${_T`(hover for how to raise each)`}</span></h4>${Object.entries(MOTIVES).filter(([k])=>k!=='home').map(([k,[l,d]])=>`<div style="display:flex;gap:8px;align-items:center;font-size:13px;margin:3px 0" title="${esc(MOT_ADVICE[k]||'')}">${gradeHTML(mgrScore(m,k,null))}<b>${l}</b><span class="rc-sub">${d}</span></div>`).join('')}</div>`;
  const raising=`<details class="card2"><summary>${_T`<b>Raising your name</b>`} <span class="rc-sub">${_T`— how each grade above is earned`}</span></summary><div style="font-size:12.5px;display:grid;gap:3px;margin-top:6px">${Object.entries(MOT_ADVICE).filter(([k])=>k!=='home').map(([k,a2])=>`<div><b>${MOTIVES[k][0]}</b> — ${a2}</div>`).join('')}</div></details>`;
  const col=h=>`<div class="lancol">${h}</div>`;
  return `<div class="lan3">${col(persona+record)}${col((typeof legacyCardHTML==='function'?legacyCardHTML():'')+sandbox+wallet)}${col(grades+raising)}</div>${RULES_BOX()}`;
}
/* mToast — a toast message that floats over the window for 4 s. */
function mToast(html){
  let t=document.getElementById('mToast');if(!t){t=document.createElement('div');t.id='mToast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');document.body.appendChild(t)}
  t.innerHTML=html;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),4200);
}
/* wireManager — wires every click, input and change in the Manager window (all [data-mg] actions). */
function wireManager(done){
  const box=$('#mBody');const redraw=()=>{const sc=box.scrollTop;$('#mgrBody').innerHTML=mgrHTML();box.scrollTop=sc;mgrCloseLabel()};window.MGR_REDRAW=redraw;
  // feedback you cannot miss: the note stays at the top, AND a toast floats over the window where you are looking
  const say=t=>{MGR.msg=t;redraw();mToast(t)};
  box.oninput=e=>{const t=e.target;if(t.dataset.nmrule&&NEWMGR){(NEWMGR.rules=NEWMGR.rules||{})[t.dataset.nmrule]=+t.value;NEWMGR.rulePre=null;t.nextElementSibling.textContent=t.value+'%';return}if(t.dataset.nmfest&&NEWMGR){NEWMGR.festPick=t.value;return}if(t.dataset.nmspect&&NEWMGR){NEWMGR.spectOK=t.checked;return}if(t.dataset.ruleFest){const w2=W_();if(w2){w2.festPick=t.value;saveWorld()}return}if(NEWMGR&&t.dataset.nm){NEWMGR[t.dataset.nm]=t.value;if(t.dataset.nm==='color'){$('#nmPortrait').firstElementChild.outerHTML=portraitHTML({name:NEWMGR.name,portrait:NEWMGR.portrait,color:NEWMGR.color},'lg')}}if(NEWMGR&&t.dataset.nmp){NEWMGR.p[t.dataset.nmp]=+t.value;t.nextElementSibling.textContent=t.value}};
  box.onchange=box.oninput;
  box.onclick=async e=>{{const nf=e.target.closest('[data-nmflag]');if(nf&&NEWMGR){try{NEWMGR.flag=JSON.parse(nf.dataset.nmflag)}catch(err){}redraw();return}}{const mf=e.target.closest('[data-mgflag]');if(mf){try{me().flag=JSON.parse(mf.dataset.mgflag)}catch(err){}saveWorld();MGR.flagPick=false;redraw();return}}
    const bd=e.target.closest('[data-dis]');if(bd){say(bd.dataset.dis);return}
    const b=e.target.closest('[data-mg]');if(!b||b.disabled||MGR.busy)return;const a=b.dataset.mg,id=b.dataset.id;
    if(a!=='tab'&&a!=='sel')MGR.msg='';
    if(a==='toschool'){MGR.tab='ludus';MGR.run='school';redraw();setTimeout(()=>{const el=document.getElementById('schoolCard');if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600)}},60);return}
    if(typeof trophyMgrClick==='function'&&await trophyMgrClick(a,id,b,{redraw,say,done}))return;
    if(typeof ludusClick==='function'&&await ludusClick(a,id,b,{redraw,say,done}))return;
    if(a==='create'){MGR.view='create';NEWMGR={name:genName(),ludus:_T('Ludus ')+pickOne(NAMEBANK.cog),city:pickOne(LOCATIONS.slice(1)).n,color:pickOne(['#c0433a','#4f7fc4','#4f9a57','#d4b13c','#dc7a34','#8a5cc0','#5fc7c0','#e07b9a']),p:{...MGR_PRESETS.balanced[1]},portrait:{skin:pickOne(SKINS),hair:pickOne(HAIRS),helm:pickOne(['none','laurel']),beard:Math.random()<.5,bg:sysBG()}};redraw();return}
    if(a==='takeview'){MGR.view='take';redraw();return}
    if(a==='back'){if(MGR.sale){MGR.world=MGR.sale.world;MGR.sale=null;NEWMGR=null}MGR.view=null;redraw();return}
    if(a==='nmlook'){NEWMGR.portrait={skin:pickOne(SKINS),hair:pickOne(HAIRS),helm:pickOne(['none','laurel','none']),beard:Math.random()<.5,long:Math.random()<.3,smile:Math.random()<.4,bg:sysBG()};redraw();return}
    if(a==='nmpre'){NEWMGR.p={...MGR_PRESETS[id][1]};redraw();return}
    if(a==='nmrulepre'&&NEWMGR){ // v0.36: moved above the no-career early return — it never fired on the creation screen before. one click sets every house-rule slider — nudge them after if you like
      const P9={easy:{death:50,blood:70,inj:70,gain:130,rookies:120,rand:70,arena:40,rookmercy:80},
        std:{...RULES_DEF},
        hard:{death:130,blood:150,inj:130,gain:80,rookies:80,rand:130,arena:80,rookmercy:20}}[id];
      if(P9){NEWMGR.rules={...P9};NEWMGR.rulePre=id;redraw()}return}
    if(a==='nmflagshuffle'){NEWMGR.flagSeed=(NEWMGR.flagSeed||1)+1;redraw();return}
    if(a==='nmgo'&&MGR.sale&&NEWMGR&&NEWMGR.sale){const w2=MGR.sale.world;if(!w2){MGR.sale=null;return}MGR.world=w2;if(saleComplete(w2,{...NEWMGR,name:NEWMGR.name.trim()||genName()})){MGR.sale=null;MGR.view=null;NEWMGR=null;MGR.tab='ludus';saveWorld(true)}redraw();$('#mBody').scrollTop=0;return}
    if(a==='nmgo'){const sc=await Store.getDoc('hall','scattered').catch(()=>null);NEWMGR.scattered=sc&&sc.list||[];if(NEWMGR.scattered.length)Store.put('hall','scattered',{id:'scattered',list:[]}).catch(()=>{})}
    if(a==='nmgo'&&NEWMGR&&NEWMGR.takeKey){MGR.view=null;newWorld({type:'pre',spectOK:NEWMGR.spectOK,flag:NEWMGR.flag,rules:NEWMGR.rules,festPick:NEWMGR.festPick,scattered:NEWMGR.scattered,key:NEWMGR.takeKey,over:{name:NEWMGR.name.trim(),ludus:NEWMGR.ludus.trim(),color:NEWMGR.color,portrait:NEWMGR.portrait}});MGR.tab='ludus';redraw();return}
    if(a==='nmgo'){MGR.view=null;newWorld({type:'custom',spectOK:NEWMGR.spectOK,flag:NEWMGR.flag,rules:NEWMGR.rules,festPick:NEWMGR.festPick,scattered:NEWMGR.scattered,mgr:{...NEWMGR,name:NEWMGR.name.trim()||genName(),ludus:NEWMGR.ludus.trim()||_T('Ludus Novus')}});MGR.tab='ludus';redraw();return}
    if(a==='take'){const t=MGR_PRE.find(x=>x.key===id);if(!t)return;NEWMGR={takeKey:id,name:t.name,ludus:t.ludus,city:t.city,color:t.color,p:{...t.p},portrait:{skin:pickOne(SKINS),hair:pickOne(HAIRS),helm:pickOne(['none','laurel']),beard:Math.random()<.5,bg:sysBG()}};MGR.view='create';redraw();return}
    if(a==='load'){const d=MGR.careers.find(c=>c.id===id);if(d){MGR.view=null;MGR.world=mgrMigrate(JSON.parse(d.world));MGR.tab='ludus';MGR.sel=null}redraw();return}
    if(a==='dlcareer'){const d=MGR.careers.find(c=>c.id===id);if(d){const a2=document.createElement('a');a2.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'}));a2.download=`flavius-career-${String(d.ludus).replace(/[^\w-]+/g,'-')}.json`;document.body.appendChild(a2);a2.click();a2.remove()}return}
    if(a==='setactive'){await setActiveCareer(id);const c=MGR.careers.find(x=>x.id===id);say(_T`${esc(c?c.name:_T('This lanista'))}'s treasury now bankrolls your wagers everywhere.`);redraw();return}
    if(a==='delcareer'){if(!b.dataset.armed){b.dataset.armed='1';b.textContent=_T('Confirm delete');b.classList.add('primary');return}await Store.del('mgrCareers',id);MGR.careers=MGR.careers.filter(c=>c.id!==id);if(MGR.world&&MGR.world.id===id)MGR.world=null;if(MGR.activeCid===id){const next=MGR.careers.find(c=>!c.dead);await setActiveCareer(next?next.id:null)}redraw();return}
    if(a==='quit'){await saveWorld(true);MGR.world=null;MGR.careers=(await Store.list('mgrCareers')).sort((x,y)=>String(y.updated).localeCompare(String(x.updated)));redraw();return}
    const w=W_();if(!w)return;const m=me();
    if(a==='city'&&w.tutorial){mToast(_T('🎓 The city square waits for your own career — not during the lesson.'));return}
    if(a==='city'&&typeof travelBlock==='function'&&travelBlock(_T('visit the square')))return;
    if(a==='city'){const n9=w.night;if(n9.hornsLock!=null&&n9.bouts[n9.hornsLock]&&!n9.bouts[n9.hornsLock].done){mToast(_T('🎺 The horns have sounded — the gates are shut until the ')+esc(TIERS[n9.bouts[n9.hornsLock].tier].n)+_T(' is fought.'));return}
      openCitySquare(w.night.loc,{prematch:!w.night.bouts.every(b=>b.done)});return}
    if(a==='gatex'){MGR.gatePrompt=null;redraw();return}
    if(a==='buyreject'&&w.buyOffer){const g=gById(w.buyOffer.gid);if(g){g.buyRefused=w.week;g.morale=clamp(g.morale-10,0,100);ghist(g,_T`offered to buy ${esc(m.ludus)} — refused`);tnews(_T`✋ You refuse ${esc(g.name)}. They say nothing, which says a great deal. Morale −10 — and they may not stay.`,'bad')}w.buyOffer=null;saveWorld();redraw();return}
    if(a==='buyaccept'&&w.buyOffer){ // v0.36: straight to founding the new house; the sale closes when you open it
      MGR.sale={cid:w.id,world:w};MGR.view='create';NEWMGR={name:genName(),ludus:_T('Ludus ')+pickOne(NAMEBANK.cog),city:m.city,color:pickOne(['#c0433a','#4f7fc4','#4f9a57','#d4b13c','#dc7a34','#8a5cc0','#5fc7c0','#e07b9a']),p:{...m.p},portrait:{...m.portrait},flagSeed:1,sale:true};
      MGR.world=null;redraw();$('#mBody').scrollTop=0;return}
    if(a==='tab'){MGR.tab=id;MGR.confirmEnd=false;MGR.gatePrompt=null;redraw();$('#mBody').scrollTop=0;return}
    if(a==='endask'){const r=weekReady();if(!r.ok){say(r.why);return}MGR.confirmEnd=true;redraw();$('#mBody').scrollTop=0;return}
    if(a==='endcancel'){MGR.confirmEnd=false;redraw();return}
    if(a==='loan'){const amt=+id;if(!loanSizes(m).includes(amt))return;const L9=loanLender();w.loan={amt:Math.round(amt*1.0),base:amt,name:L9.name,kind:L9.kind,mgr:L9.mgr,wk:w.week};w.loanAsk=0;m.coin+=amt;
      tnews(_T`💸 Borrowed ${coinAmt87(amt)} from ${esc(L9.name)} (8%/week, collected weekly).`,'big');if(L9.mgr&&typeof mlog==='function')mlog(mgrById(L9.mgr),_T`lent ${amt} coin to ${m.ludus}`);saveWorld();redraw();return}
    if(a==='loanno'){w.loanAsk=0;saveWorld();redraw();return}
    if(a==='flagpick'){MGR.flagPick=!MGR.flagPick;redraw();return}
    if(a==='mgflagshuffle'){MGR.flagSeed=(MGR.flagSeed||1)+1;redraw();return}
    if(a==='retire'){if(!b.dataset.armed){b.dataset.armed='1';b.innerHTML=_T('Confirm: retire ')+esc(m.ludus)+_T(' for good');b.classList.add('primary');return}
      const L9=legacyOf(w,m);const ros=rosterOf(m);
      for(const g of ros){g.contract=null;ghist(g,_T`released with a purse when ${esc(m.ludus)} retired in glory`);g.morale=clamp(g.morale+5,0,100)}
      try{await Store.put('hall','annal_'+w.id,{id:'annal_'+w.id,kind:'annal',name:m.name,ludus:m.ludus,grade:L9.grade,score:L9.score,tier:L9.tier,seasons:w.season-(w.startSeason||1),rec:`${m.wins}-${Math.max(0,m.bouts-m.wins)}`,fame:m.fameBest||m.fame,trophies:(w.trophies||[]).length,date:new Date().toISOString().slice(0,10),epitaph:pickOne([_T`They filled the stands at ${m.city} for years.`,_T('Paid every debt, kept every pledge — mostly.'),_T('The sand remembers the house, and so do the bookmakers.'),_T('Retired undefeated by the creditors, which is rarer than any cup.')])})}catch(e){}
      w.dead={why:_T`retired with honors — legacy ${L9.score} (${L9.grade})`,week:w.week,season:w.season,fame:m.fame,record:`${m.wins}-${Math.max(0,m.bouts-m.wins)}`,coin:m.coin,retired:true};
      mnews(_T`🏺 <b>${esc(m.ludus)} retires in glory.</b> Legacy ${L9.score} — ${esc(L9.tier)} (${L9.grade}). The Annals take the name; the fighters walk out paid and free.`,'big');
      saveWorld(true);redraw();return}
    if(a==='shutdown'){ // v0.34: always available, twice-confirmed, and it is exactly what it says
      if(!b.dataset.armed){b.dataset.armed='1';b.innerHTML=_T('⚠ Confirm: shut down ')+esc(m.ludus)+_T(' for good — fighters turned out, no honors');b.classList.add('primary');return}
      for(const g of rosterOf(m)){g.contract=null;ghist(g,_T`turned out when ${esc(m.ludus)} shut its gates`);g.morale=clamp(g.morale-10,0,100)}
      w.dead={why:_T('shut down by its own lanista'),week:w.week,season:w.season,fame:m.fame,record:`${m.wins}-${Math.max(0,m.bouts-m.wins)}`,coin:m.coin,shut:true};
      mnews(_T`🚪 <b>${esc(m.ludus)} shuts its gates.</b> The fighters are turned out into the pool; the bookmakers strike the name from their slates.`,'big');
      saveWorld(true);redraw();return}
    if(a==='loanpay'||a==='loanpayall'){if(!w.loan)return;const pay=Math.min(w.loan.amt,a==='loanpayall'?w.loan.amt:50,m.coin);if(pay<=0)return;m.coin-=pay;w.loan.amt-=pay;w.loan.paid=(w.loan.paid||0)+pay;
      if(w.loan.mgr){const lm=mgrById(w.loan.mgr);if(lm){lm.coin+=pay;lm.relB=(lm.relB||0)+(a==='loanpayall'?4:1)}}
      if(w.loan.amt<=0){tnews(_T`💸 <b>Debt cleared</b> — ${esc(w.loan.name)} drinks to your health.`,'big');w.loanDone=(w.loanDone||0)+1;w.loan=null}saveWorld();redraw();return}
    if(a==='filter'){MGR.filter=id;redraw();return}
    if(a==='sort'){MGR.sort=id;redraw();return}
    if(a==='sel'){MGR.sel=id;redraw();return}
    if(a==='lsel'){MGR.lsel=id;redraw();return}
    if(a==='exf'){MGR.exF=id;redraw();return}
    if(a==='owncal'){w.ownCal=true;saveWorld();redraw();return}
    if(a==='catchup'){MGR.busy=true;let r;try{r=await catchUpWeeks()}finally{MGR.busy=false}MGR.tab='ludus';redraw();if(r)mToast(_T`⏩ Your doctores ran the ludus for <b>${r.weeks} week${r.weeks===1?'':'s'}</b>: ${r.wins} win${r.wins===1?'':'s'}, treasury ${coinAmt87((r.coin>=0?'+':'')+r.coin)}, fame ${r.fame>=0?'+':''}${r.fame}. The Acta Diurna has every week on the Archives shelf.`);return}
    if(a==='fav'){const g2=gById(id);if(g2){g2.favd=!g2.favd;saveWorld()}redraw();return}
    if(a==='sel2'){MGR.bsel=id;redraw();return} // the board shows the chosen card in its own side panel
    const g=id&&gById(id.split('|')[0]);
    {const RA={scout:['scout',3],trial:['trial',3],visit:['visit',4],gift2:['gift',2],pitch:['pitch',1],offer:['offer',1],poach:['offer',2]}[a];
      if(RA&&g&&!(g.contract&&g.contract.mgr===m.id)){const gt=recGate(g,RA[0]);if(gt[0]){say(gt[1]);return}if(a==='pitch'&&pitchesLeft()<=0){say(_T`All ${PITCH_MAX} pitches are spent this week.`);return}
        if(w.hours>=RA[1]){recMark(g,RA[0]);if(a==='pitch')w.pitchN={wk:w.week,n:(w.pitchN&&w.pitchN.wk===w.week?w.pitchN.n:0)+1}}}}
    if(a==='scout'){if(!g||w.hours<3||m.coin<scoutCost(g))return;MGR.busy=true;w.hours-=3;m.coin-=scoutCost(g);const pr=$('#mgProg');if(pr)pr.innerHTML=`<div class="progress"><i style="width:0%"></i></div><p class="rc-sub">${_T`Sparring in the Ludus…`}</p>`;
      try{await scoutGlad(g,(i,n)=>{const bar=pr&&pr.querySelector('i');if(bar)bar.style.width=(i/n*100)+'%'})}finally{MGR.busy=false}saveWorld();say(_T`Scouting report on ${esc(g.name)} is in.${g.gem?_T(' Your scouts lean close: this one is a GEM.'):g.bust?_T(' Quietly: the public rating flatters them.'):''}`);return}
    if(a==='gcard'){MGR.tab='recruit';MGR.filter='mine';MGR.sel=id;MGR.msg='';redraw();return}
    if(a==='arcpap'){MGR.papSel=+id;MGR.arcSel=null;redraw();return}
    if(a==='arcopen'){MGR.arcSel=+id;MGR.papSel=null;redraw();return}
    if(a==='arcback'){MGR.arcSel=null;MGR.papSel=null;redraw();return}
    if(a==='regime'){w.train=id;saveWorld();redraw();return}
    if(a==='exsim'||a==='exlive'||a==='exfight'){const myId=$('#exMine')&&$('#exMine').value,oppId=$('#exOpp')&&$('#exOpp').value;if(!myId||!oppId||thLeft(w)<EXHIB_HOURS||m.coin<EXHIB_COST)return;
      const X=exhibSetup(myId,oppId);if(!X)return;thPlan(w).spent=(thPlan(w).spent||0)+EXHIB_HOURS;m.coin-=EXHIB_COST;X.g.exWk=w.week;
      if(a==='exsim'){MGR.busy=true;let txt='';try{const res=await simEvent(exhibCfg(X,false));if(res&&!res.error)txt=exhibApply(res,exhibCfg(X,false).exhibCtx)}finally{MGR.busy=false}saveWorld(true);say(txt||_T('The exhibition was rained out.'));return}
      saveWorld(true);modalDismiss();S&&(S.over=true);startEvent(exhibCfg(X,true,a==='exfight'));return}
    if(a==='kintix'){if(!g||m.coin<4)return;m.coin-=4;g.kinWk=w.week;
      let fam=kinOf(g);
      if(!fam.length&&typeof CROWD_CACHE!=='undefined'){ // family they never mentioned turns up in town
        const rel=pickOne(['mother','father','sister','brother','cousin','uncle','aunt']);const fem2=/mother|sister|aunt/.test(rel);
        const r={id:'spk'+g.id+Date.now().toString(36),name:`${pickOne(fem2?NAMEBANK.praeF:NAMEBANK.prae)} ${String(g.name).split(' ').slice(-1)[0]}`,taste:'loyalty',temper:'loyal',visits:0,mem:[],quit:null,grudgeName:null,city:g.city,kin:{name:g.name,rel},
          look:{...gLook(g),fem:fem2,beard:!fem2&&Math.random()<.5,robe:pickOne(ROBES)}};
        CROWD_CACHE.push(r);fam=[r]}
      for(const r of fam)await buyTicket(r,_T`from ${esc(m.ludus)}, for ${esc(g.name)}'s family`,true);
      g.morale=clamp(g.morale+5,0,100);g.loyB=clamp((g.loyB||0)+3,0,25);tnews(_T`Bought tickets for ${esc(g.name)}'s family (${fam.map(r=>esc(r.name)).join(', ')}).`);
      saveWorld();say(_T`${fam.map(r=>`<b>${esc(r.name)}</b> (${esc(r.kin.rel)})`).join(', ')} will be in the stands for ${esc(g.name)}. Morale ${g.morale}, loyalty ${loyaltyOf(g)}.`);return}
    if(a==='feast2'){if(w.hours<2||m.coin<10)return;w.hours-=2;m.coin-=10;m.feastWk=w.week;m.fame=clamp(m.fame+1,0,100);
      const star=rosterOf(m).sort((x,y)=>effOvr(y)-effOvr(x))[0];const city=pickOne(LOCATIONS.filter(Boolean)).n;let won=0;
      if(typeof CROWD_CACHE!=='undefined')for(const r of CROWD_CACHE)if(r.city===city&&!r.banned&&Math.random()<.5){r.fanOf=star?star.name:r.fanOf;won++}
      tnews(_T`Fed ${esc(city)} in the ludus's name: ${won}K spectators now cheer ${star?esc(star.name):_T('your colors')}.`);
      mnews(_T`${esc(m.ludus)} feeds ${esc(city)} — bread, wine and ${star?esc(star.name)+"'s":_T('the ludus\u2019s')} name on every loaf.`);
      saveWorld();say(_T`${esc(city)} eats well and remembers: ${won} new fans${star?_T` for ${esc(star.name)}`:''}, +1 fame.`);return}
    if(a==='sponsor2'){if(m.coin<18)return;m.coin-=18;m.sponWk=w.week;m.fame=clamp(m.fame+2,0,100);
      for(const m2 of w.mgrs)if(!m2.isPlayer&&Math.random()<.3)bumpRival(m2,3);
      tnews(_T('Sponsored the games: +2 fame.'));mnews(_T`The week's games run under ${esc(m.ludus)}'s name. Fame +2; several lanistae are heard muttering.`);saveWorld();say(_T('Your name hangs over the arena. Fame +2.'));return}
    if(a==='criers2'){if(w.hours<1||m.coin<6)return;w.hours--;m.coin-=6;m.crierWk=w.week;
      for(const g2 of freeAgents())g2.interest[m.id]=capInterest(g2,m,interestOf(g2,m)+2);
      tnews(_T('Hired the criers: +2 interest with every free agent.'));saveWorld();say(_T('By nightfall every barracks has heard your name: +2 interest across the market.'));return}
    if(a==='meal'){if(!g||w.hours<1||m.coin<3)return;w.hours--;m.coin-=3;g.mealWk=w.week;g.morale=clamp(g.morale+6,0,100);g.loyB=clamp((g.loyB||0)+2,0,25);saveWorld();say(_T`You break bread with ${esc(g.name)}. Morale ${g.morale}, loyalty ${loyaltyOf(g)}.`);return}
    if(a==='bonus'){const c=giftCost(g);if(!g||m.coin<c)return;m.coin-=c;g.bonusWk=w.week;g.morale=clamp(g.morale+8,0,100);g.loyB=clamp((g.loyB||0)+4,0,25);tnews(_T`Paid ${esc(g.name)} a ${c}-coin bonus.`);saveWorld();say(_T`${coinAmt87(c)} changes hands. ${esc(g.name)} will remember who paid: loyalty ${loyaltyOf(g)}.`);return}
    if(a==='raise'){if(!g||w.hours<1)return;w.hours--;g.contract.wage+=2;g.contract.raises=(g.contract.raises||0)+1;g.morale=clamp(g.morale+10,0,100);g.loyB=clamp((g.loyB||0)+6,0,25);tnews(_T`Raised ${esc(g.name)}'s wage to ${g.contract.wage}/wk.`);ghist(g,_T`wage raised to ${g.contract.wage}/wk by ${esc(m.ludus)}`);saveWorld();say(_T`${esc(g.name)} now earns ${g.contract.wage} a week. Morale ${g.morale}, loyalty ${loyaltyOf(g)}.`);return}
    if(a==='promise'){if(!g||w.hours<1||g.pledge)return;w.hours--;g.pledge={mgr:m.id,due:w.week+2};g.morale=clamp(g.morale+8,0,100);tnews(_T`Promised ${esc(g.name)} the main event by week ${wkOf(w.week+2)}.`);saveWorld();say(_T`${esc(g.name)} holds you to it: the main event by week ${wkOf(w.week+2)}.`);return}
    if(a==='word'){if(!g||w.hours<1)return;w.hours--;g.wordWk=w.week;g.morale=clamp(g.morale+3,0,100);
      const worst=[...g.motives].sort((x,y)=>mgrScore(m,x[0],g)-mgrScore(m,y[0],g))[0];
      const say2={coin:_T('The wage keeps me fed. It does not keep me here.'),glory:_T('I did not come to the sand to lose in front of empty seats.'),honor:_T('Men talk about how this ludus treats its word.'),show:_T('The crowd forgets a fighter nobody puts in front of them.'),train:_T('I am not getting better here. I can feel it.'),home:'I miss the smell of home.',play:_T('I sit. I watch. I sit again.')}[worst&&worst[0]]||_T('I have no complaints. Today.');
      g.lastWord=(g.inj?_T`My ${g.inj.label.replace(/^an? /,'')} aches. `:'')+say2+(g.contract.weeks<=2?_T(' And my contract is nearly up.'):'');saveWorld();say(_T`${esc(g.name)} talks. Their weakest grade of you: <b>${worst?MOTIVES[worst[0]][0]:'—'}</b>.`);return}
    if(a==='ptrain'){g.ptrain=!g.ptrain;saveWorld();redraw();return}
    if(a==='perk'){const pts=m.perkPts||0;if(pts<1)return;if((m.p[id]||0)>=95){say(_T('That trait is as honed as it gets (95).'));return}m.perkPts=pts-1;m.p[id]=clamp((m.p[id]||0)+2,1,95);saveWorld();say(_T`${MGR_KEYS.find(x=>x[0]===id)[1]} rises to ${m.p[id]} (you spent a perk point — ${m.perkPts} left in the bank). The fighters notice how you carry yourself.`);redraw();return}
    if(a==='trial'){if(w.hours<3||m.coin<4||g.contract)return;MGR.busy=true;w.hours-=3;m.coin-=4;
      const pr2=$('#mgProg');if(pr2)pr2.innerHTML=`<div class="progress"><i style="width:0%"></i></div><p class="rc-sub">${_T`A trial bout on your own sand…`}</p>`;
      let won=0,best=null;
      try{
        best=rosterOf(m).sort((x,y)=>effOvr(y)-effOvr(x))[0]||null;
        const pool=w.glads.filter(x=>x.alive&&x!==g&&x!==best&&Math.abs(effOvr(x)-effOvr(g))<=14);
        const nOpp=best?2:3;
        const cfgs=Array.from({length:2},()=>()=>{const opp=shuffle([...pool]).slice(0,nOpp);while(opp.length<nOpp)opp.push(genGlad({ovr:effOvr(g)}));
          return {ev:'democritus',loc:3,seats:[seatFor(g),...(best?[seatFor(best,m.color)]:[]),...opp.map(o=>seatFor(o))],opts:{mods:false,mandata:true,optOffers:true,eaglePot:true,spect:0}}});
        const rs=(await simBatch(cfgs,(i,n)=>{const bar=pr2&&pr2.querySelector('i');if(bar)bar.style.width=(i/n*100)+'%'})).filter(r=>r&&!r.error);
        won=rs.filter(r=>r.rows.find(x=>x.mgrId===g.id&&x.won)).length;
      }finally{MGR.busy=false}
      g.scout=3; // fighting on your sand tells you everything a scroll cannot
      const bump=8+rnd(5)+(won?3:0);g.interest[m.id]=capInterest(g,m,interestOf(g,m)+bump);
      ghist(g,_T`fought a trial bout on ${esc(m.ludus)}'s sand${won?_T(' — and took the palm'):''}`);
      saveWorld();say(_T`${esc(g.name)} fights ${best?_T`beside ${esc(best.name)} `:''}on your sand${won?_T(' and wins'):''}: +${bump} interest, fully scouted${g.gem?_T(' — and your doctors swear you have found a GEM 💎'):g.bust?_T(' — and your doctors mutter the stars flatter this one'):''}.`);return}
    if(a==='pitch'){const mot=id.split('|')[1];if(w.hours<1)return;w.hours--;const d=pitch(g,mot);saveWorld();say(_T`You pitch ${MOTIVES[mot][0].toLowerCase()} to ${esc(g.name)}: interest ${d>=0?'+':''}${d}.${d<0?_T(' Your grade there hurt you.'):''}`);return}
    if(a==='visit'){if(w.hours<4)return;const d=doVisit(g);if(d==null)return;w.hours-=4;saveWorld();say(_T`${esc(g.name)} feasts at ${esc(m.ludus)}: interest +${d}.`);return}
    if(a==='offer'){if(w.hours<1)return;w.hours--;const wage=Math.max(1,+$('#ofWage').value||1),weeks=+$('#ofWeeks').value||8,bonus=Math.max(0,+$('#ofBonus').value||0);const pledge=!!($('#ofPledge')&&$('#ofPledge').checked);const v=offerVerdict(g,wage,weeks,bonus,pledge);if(v.ok){signGlad(g,wage,weeks,bonus,pledge);tnews(_T`Signed ${esc(g.name)} (${wage}/wk, ${weeks} weeks${bonus?_T`, ${bonus} bonus`:''}${pledge?_T(', main-event pledge'):''}).`);saveWorld(true);say(_T`${esc(g.name)} signs${pledge?_T(' — and expects the main event within 2 weeks'):''}!`)}else say(esc(v.why));return}
    if(a==='gift2'){if(w.hours<2||m.coin<giftCost(g))return;if(g.giftWk&&g.giftWk[m.id]&&w.week-g.giftWk[m.id]<2){say(_T`${esc(g.name)} received your last gift a little too recently.`);return}w.hours-=2;const d=doGiftFighter(g);saveWorld();say(_T`Amphorae arrive at ${esc(g.name)}'s door: interest +${d}.`);return}
    if(a==='poach'){if(w.hours<2)return;w.hours-=2;const wage=Math.max(1,+$('#ofWage').value||1),weeks=+$('#ofWeeks').value||8;const v=poachVerdict(g,wage);if(v.ok){doPoach(g,wage,weeks);saveWorld(true);say(_T`${esc(g.name)} joins you. ${esc(mgrById(g.contract.mgr).name)}… well, you.`)}else{g.interest[m.id]=Math.max(0,interestOf(g,m)-2);say(esc(v.why))}return}
    if(a==='extend'){const need=askWage(g);const ok=g.morale>=35&&interestOf(g,m)>=25;if(!ok){say(_T`${esc(g.name)} refuses to extend (morale ${g.morale}).`);return}g.contract.weeks=Math.max(0,g.contract.weeks)+8;g.contract.wage=Math.max(g.contract.wage,need);g.contract.expired=0;saveWorld();say(_T`${esc(g.name)} extends for 8 more weeks at ${g.contract.wage} a week.`);return}
    if(a==='release'){if(!b.dataset.armed){b.dataset.armed='1';b.textContent=_T('Confirm');b.classList.add('primary');return}ghist(g,_T`released by ${esc(m.ludus)}`);g.contract=null;g.interest[m.id]=15;m.broken=(m.broken||0)+(g.morale>50?1:0);mnews(_T`${esc(m.ludus)} releases ${esc(g.name)}.`);tnews(_T`Released ${esc(g.name)} from their contract.`);saveWorld();redraw();return}
    if(a==='heal'){const left=Math.max(0,repCap()-(w.repair||0));const limbs=Math.min(g.severed.length,Math.floor(left/HYGEIA));if(!limbs){say(_T`The repair budget is spent for this week (${coinAmt87(repCap())} a week).`);return}const cost=HYGEIA*limbs;if(m.coin<cost){say(_T('Not enough coin for the priests of Hygeia.'));return}m.coin-=cost;w.repair=(w.repair||0)+cost;g.severed=g.severed.slice(limbs);saveWorld();say(_T`The Blessings of Hygeia regrow ${limbs===1?_T('one of '):''}${esc(g.name)}'s limbs${g.severed.length?_T` (${g.severed.length} still severed — the budget ran out)`:''}.`);return}
    if(a==='medic'){if(g.medWk===w.week){say(_T`${esc(g.name)} has already seen the Medicus this week.`);return}const left=Math.max(0,repCap()-(w.repair||0));if(left<MEDICUS){say(_T`The repair budget is spent for this week (${coinAmt87(repCap())} a week).`);return}if(m.coin<MEDICUS){say(_T('Not enough coin for the Medicus.'));return}m.coin-=MEDICUS;w.repair=(w.repair||0)+MEDICUS;g.medWk=w.week;g.morale=clamp(g.morale+12,0,100);if(g.inj&&g.inj.war){say(_T`${esc(g.name)} is with the legions — no Medicus reaches a marching camp.`);return}
      if(g.inj&&injReq(g.inj)==='surgeon'){say(_T`${esc(g.name)}'s ${esc(g.inj.label)} is beyond the Medicus — it wants the surgeon's knife (Infirmary tab).`);m.coin+=MEDICUS;w.repair-=MEDICUS;return}
      const healed=g.inj;if(g.inj)delete g.inj;saveWorld();say(_T`The Medicus puts ${esc(g.name)} on a Health Elixir regimen${healed?_T` and a bathhouse day — the ${esc(healed.label)} is cleared`:''}: morale ${g.morale}.`);return}
    if(a==='surgeon'){if(!g||!g.inj||injReq(g.inj)!=='surgeon')return;const left2=Math.max(0,repCap()-(w.repair||0));if(left2<SURGEON||m.coin<SURGEON)return;
      m.coin-=SURGEON;w.repair=(w.repair||0)+SURGEON;
      if(Math.random()<.1){g.inj.until=w.week+2;g.inj.neglect=0;ghist(g,_T`the surgeon's knife slipped on ${g.inj.label}`);saveWorld();say(_T`The knife slips. ${esc(g.name)} keeps the ${esc(g.inj.label)} another week — the surgeon keeps the coin.`);return}
      ghist(g,_T`under the surgeon's knife: ${g.inj.label}, cleanly mended`);delete g.inj;g.morale=clamp(g.morale+6,0,100);saveWorld();say(_T`Clean work. ${esc(g.name)}'s wound is closed, stitched and salved: fit to fight.`);return}
    if(a==='bath'){if(!g||!g.inj||g.inj.war||m.coin<5)return;m.coin-=5;g.bathWk=w.week;g.inj.until=Math.max(w.week,g.inj.until-1);if(g.inj.neglect)g.inj.neglect=Math.max(0,g.inj.neglect-0);g.morale=clamp(g.morale+4,0,100);
      if(g.inj.until<=w.week&&injReq(g.inj)!=='surgeon'){delete g.inj;saveWorld();say(_T`Steam, oil and a strigil: ${esc(g.name)} walks out loose-shouldered and HEALED.`)}else{saveWorld();say(_T`${esc(g.name)} spends the day in the caldarium: a week off the healing, +4 morale.`)}return}
    if(a==='asclepius'){if(!g||!g.inj||g.inj.war||m.coin<ASCLEPIUS)return;m.coin-=ASCLEPIUS;const had=g.inj.label;
      delete g.inj;g.morale=clamp(g.morale+8,0,100);ghist(g,_T('healed in the temple of Asclepius'));
      tnews(_T`Paid the priests of Asclepius ${coinAmt87(ASCLEPIUS)}: ${esc(g.name)}'s ${esc(had)} is healed.`);saveWorld();say(_T`Incense, serpents, and one long night in the temple: ${esc(g.name)} wakes with the ${esc(had)} gone. (Lost limbs are Hygeia's work, not Asclepius's.)`);return}
    if(a==='bet'){const [bi,gid,odds]=id.split('|');const bo=w.night.bouts[+bi];if(bo&&bo.rig){say(_T('You fixed this bout. No bookmaker in the empire will take a wager on it from you — and betting on your own fix is how lanistae end up in the mines.'));return}const lim=betMaxStake(+odds,m.coin);const st0=Math.floor(+(($('#mgStake'+bi)||$('#mgStake')||{}).value)||0);const st=clamp(st0,0,lim);if(!st||bo.done)return;if(st0>lim)say(_T`The bookmaker takes at most ${coinAmt87(lim)} at ${odds}× — no slip may pay more than ${BET_MAXPAY}.`);m.coin-=st;bo.bets.push({gid,stake:st,odds:+odds,bid:betRec({src:'mgr',ev:`m:${w.id}:${w.week}`,season:w.season,week:w.week,dayOff:Math.floor((1-w.hours/Math.max(1,hoursMax()))*24),min:480+Math.floor(Math.random()*720),city:LOCATIONS[w.night.loc].n,who:m.name,kind:'you',on:`${gById(gid).name} · ${TIERS[bo.tier].n}`,stake:st,odds:+odds})});saveWorld();say(_T`You bet ${st} on ${esc(gById(gid).name)} at ${odds}×.`);return}
    if(a==='underdog'){ // v0.34: the Gambit is taken — the lanista buys the weakest outsider's seat on the main card
      if(!(w.underdog&&w.underdog.armed))return;
      const bo=w.night.bouts[2];
      if(!bo||bo.done){say(_T('The main event is already decided — and the creditors will not wait past the week.'));return}
      if(w.night.bouts.slice(0,2).some(x=>!x.done)){say(_T('The card runs in order — settle the earlier bouts first, then take the sand.'));return}
      const lg=lanistaGlad(w,m);
      const sel9=$('#udAlly');const allyId=sel9&&sel9.value||null;
      const outs=bo.ents.map(gById).filter(x=>x&&(!x.contract||x.contract.mgr!==m.id)).sort((x,y)=>effOvr(x)-effOvr(y));
      if(!outs.length){say(_T('No seat can be bought on this card.'));return}
      if(!bo.ents.includes(lg.id)){bo.ents[bo.ents.indexOf(outs[0].id)]=lg.id;voidBets(bo,outs[0].id)}
      let allyIn=null;
      if(allyId&&!bo.ents.includes(allyId)&&outs[1])bo.ents[bo.ents.indexOf(outs[1].id)]=allyId;
      if(allyId&&bo.ents.includes(allyId))allyIn=allyId;
      w.underdog={armed:0,fighting:1,bout:2,gid:lg.id,ally:allyIn};
      tnews(_T`💀 <b>${esc(m.name)} takes the Debtor's Gambit</b> — the lanista himself on tonight's card${allyIn?_T`, ${esc(gById(allyIn).name)} at his side under truce`:''}. The bookmakers lose their minds.`,'big');
      saveWorld(true);done('fight:2');return}
    if(['travelpay','traveldeal','traveldecline'].includes(a)&&typeof travelClick==='function'){travelClick(a);redraw();return}
    if(a==='enter'){if(typeof travelBlock==='function'&&travelBlock(_T('enter fighters')))return;{const bw=w.night.bouts[+id];if(bw&&(bw.wd||0)>=2){say(_T`🔒 You withdrew from the ${esc(TIERS[bw.tier].n)} twice — the card is closed to your house this week.`);return}}const bo=w.night.bouts[+id];const sel=$('#ent'+id);if(!sel)return;const gid=sel.value;const out=bo.ents.map(gById).filter(x=>!x.contract).sort((x,y)=>effOvr(x)-effOvr(y))[0]||bo.ents.map(gById).filter(x=>!x.contract||x.contract.mgr!==m.id).pop();if(!out)return;bo.ents[bo.ents.indexOf(out.id)]=gid;m.coin+=0;voidBets(bo,out.id);saveWorld();redraw();return}
    if(a==='withdraw'){const bo=w.night.bouts[+id];bo.wd=(bo.wd||0)+1; // v0.43: two withdrawals and the editor stops taking your entries for this bout
      if(bo.wd>=2)setTimeout(()=>mToast(_T`🔒 Two withdrawals from the ${esc(TIERS[bo.tier].n)} — the editor will take no more entries from your house for it this week.`),50);const i=bo.ents.findIndex(x=>{const q=gById(x);return q.contract&&q.contract.mgr===m.id});if(i<0)return;const T=TIERS[bo.tier];const used=new Set(w.night.bouts.flatMap(x=>x.ents));const rep=freeAgents().find(q=>!used.has(q.id)&&!q.inj&&effOvr(q)>=T.lo-3&&effOvr(q)<=T.hi+3)||genGlad({ovr:T.lo+5});if(!rep.debut)rep.debut={s:w.season,wk:w.week};if(!gById(rep.id))w.glads.push(rep);{const gone=bo.ents[i];bo.ents[i]=rep.id;voidBets(bo,gone)}saveWorld();redraw();return}
    if(a==='rig'){const bo=w.night.bouts[+id];if(!bo||!boutRiggable(bo)||m.coin<rigCost(bo))return;
      if(!b.dataset.armed){b.dataset.armed='1';b.innerHTML=_T('CONFIRM · this is a crime<small>Flavius seizes ludi for less. Twice caught in a career and yours is gone.</small>');b.classList.add('primary');return}
      m.coin-=rigCost(bo);const mine2=bo.ents.map(gById).filter(g2=>g2&&g2.contract&&g2.contract.mgr===m.id).sort((x,y)=>effOvr(y)-effOvr(x))[0];
      bo.rig=mine2.id;w.rigCount=(w.rigCount||0)+1;tnews(_T`Fixed the ${TIERS[bo.tier].n}: ${coinAmt87(rigCost(bo))} under the table for ${esc(mine2.name)}'s "win".`,'bad');
      saveWorld();say(_T`Coin moves in dark corners. ${esc(mine2.name)} will win the ${TIERS[bo.tier].n} — as long as nobody talks.`);redraw();return}
    if(a==='sim'){{const bi9=+id;if(w.night.bouts.slice(0,bi9).some(x=>!x.done)){say(_T('The card runs in order — settle the earlier bout first.'));return}}MGR.busy=true;try{await runBoutSim(+id)}finally{MGR.busy=false}redraw();if(w.night.bouts.every(b=>b.done)){const r=$('#nightRes');if(r){r.scrollIntoView({block:'start'});r.classList.add('flash')}}return}
    if(a==='simall'){MGR.busy=true;try{for(let i=0;i<w.night.bouts.length;i++)if(!w.night.bouts[i].done)await runBoutSim(i)}finally{MGR.busy=false}redraw();{const r=$('#nightRes');if(r){r.scrollIntoView({block:'start'});r.classList.add('flash')}}return}
    if((a==='spect'||a==='watch'||a==='fight')&&typeof travelBlock==='function'&&travelBlock(_T('watch from the stands')))return;
    if(a==='spect'){{const bi9=parseInt(id);if(w.night.bouts.slice(0,bi9).some(x=>!x.done)){say(_T('The card runs in order — settle the earlier bout first.'));return}}SPECT.pending=true;done('watch:'+id);return}
    if(a==='watch'){{const bi9=parseInt(id);if(w.night.bouts.slice(0,bi9).some(x=>!x.done)){say(_T('The card runs in order — settle the earlier bout first.'));return}}done('watch:'+id);return}
    if(a==='fight'){{const bi9=parseInt(id);if(w.night.bouts.slice(0,bi9).some(x=>!x.done)){say(_T('The card runs in order — settle the earlier bout first.'));return}}done('fight:'+id);return}
    if(a==='endweek'){MGR.busy=true;let ok2=false;try{ok2=await endWeek()}finally{MGR.busy=false}if(ok2){MGR.confirmEnd=false;MGR.tab=w.awardShow&&!w.awardShow.seen?'awards':'paper';MGR.awI=0;redraw();$('#mBody').scrollTop=0}else{const pend=(w.pend||[]).length;MGR.tab='night';say(w.special&&!w.special.done?_T('An invitational is on this week — settle it on Match Week first.'):pend?_T('Settle the verdicts awaiting you first — thumbs, blood money and rudis choices.'):_T('Finish every bout first.'));
      if(pend){const pb=$('#pendbox');if(pb){pb.scrollIntoView({behavior:'smooth',block:'start'});pb.classList.remove('flash');void pb.offsetWidth;pb.classList.add('flash')}}}return}
    if(a==='pblood'){const [pi,ch]=id.split('|');const msg=settlePending(+pi,ch);saveWorld(true);say(msg);return}
    if(a==='prudis'){const [pi,ch]=id.split('|');const msg=settlePending(+pi,ch);saveWorld(true);say(msg);return}
    if(a==='scoutarena'&&typeof travelBlock==='function'&&travelBlock(_T('walk the sand')))return;
    if(a==='scoutarena'){const sf=walkFee();if(w.hours<2||m.coin<sf||w.night.scouted)return;w.hours-=2;m.coin-=sf;const n=w.night;const L2=LOCATIONS[n.loc];const LC=(typeof LOC_CROWD!=='undefined'&&LOC_CROWD[n.loc])||{n:'an ordinary crowd'};
      const fx=n.fx||{};const special=!/democritus|egidious|cassian/.test(fx.ev||'democritus');
      const tips=[_T('The sand is packed hard on the east side — pillars topple toward the tunnels.'),_T('The upper tiers are nearest the Q1 stands: play to them and the cheers come cheap.'),_T('The ushers here let troublemakers in; expect stones.'),_T('The local beasts are underfed this week — the bears go for the first man they see.'),_T('The editor here rewards a long fight; do not rush the killing.')];
      n.scouted={wx:n.wx,att:n.wAtt||0,world:n.world||[],temper:LC.n||_T('an ordinary crowd'),special,tip:pickOne(tips)};tnews(_T`Scouted ${esc(L2.n)} ahead of the games (2 h, ${coinAmt87(6)}): +1 AP, ${coinAmt87('+1')} for every fighter you enter.`);saveWorld();redraw();return}
    if(a==='plevy'){const [pi,ch]=id.split('|');const msg=settlePending(+pi,ch);saveWorld(true);say(msg);return}
    if(a==='pthumb'){const pi=+id;const P=(w.pend||[])[pi];if(!P)return;const g2=gById(P.gid);const box2=$('#pend'+pi);if(!box2||!g2)return;
      const d6=w.tutorial?4+Math.floor(Math.random()*3):1+Math.floor(Math.random()*6),d12=1+Math.floor(Math.random()*12);MGR.busy=true; /* the lesson's gods are kind */
      try{await thumbRitual(box2,{name:g2.name,f:P.f,d6,d12})}finally{MGR.busy=false}
      await new Promise(r=>setTimeout(r,1400));const msg=settlePending(pi,null,{d6,d12});saveWorld(true);say(msg);return}
    if(a==='paper'){MGR.tab='paper';redraw();$('#mBody').scrollTop=0;return}
  };
}
/* the top-bar Manager button. */
$('#btnManager').onclick=()=>openManager();
/* stake ± buttons on Match Week bet boxes. */
document.addEventListener('click',e=>{const b=e.target.closest('[data-stk]');if(!b)return;const [bi,d]=b.dataset.stk.split('|');const i=document.getElementById('mgStake'+bi);if(!i)return;const mx=+i.max||999;i.value=clamp((+i.value||0)+(+d),1,mx)});
/* v0.45: ☆ on a fighter's card in a Match Week bout (fighting or spectating) puts them on your ★ Favorites board */
document.addEventListener('click',e=>{const f=e.target.closest('[data-favg]');if(!f)return;e.preventDefault();e.stopPropagation();const g=gById(f.dataset.favg);if(!g)return;g.favd=!g.favd;saveWorld();
  if(typeof mToast==='function')mToast(g.favd?_T`★ <b>${esc(g.name)}</b> is on your Favorites board.`:_T`☆ ${esc(g.name)} is off your Favorites board.`);if(typeof render==='function'&&S)render()},true);

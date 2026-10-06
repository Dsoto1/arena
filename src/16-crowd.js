
/* =====================================================================
   16-CROWD · THE STANDS
   =====================================================================
   THE CROWD (rulebook p.34-35): stadium seating, spectators with their own tastes and moods,
   the spectator abilities, and the bookmaker's wagers.
   - SECTIONS / seatSpectators / crowdStart: who sits where, favorites, the omen, famous visitors.
   - crowdReact (every event in the arena moves moods), sectionCheer (CF per Resolve), spears,
     stones, offerings, the Tholo chant (spectatorsAct) and the human spectator's turn.
   - Wagers: betStrength → winProbs → oddsTable, the Wagers window, self-bets, settleWagers.
   - The regulars persist (CROWD_CACHE, Store 'crowd'): memories, grudges, quitting (updateCrowdAfterEvent).
   - Flavius in his box (flavFace / flaviusMood / flaviusReact / the curtain), the arena chronicle,
     the Menagerie + Bestiary, the Imperium stands window and the spectator roster.
   ===================================================================== */
let STANDS=true;try{STANDS=localStorage.getItem('flavius_stands')!=='off'}catch(e){}
/* setStands — shows or hides the stands around the board (localStorage flavius_stands) and redraws. */
function setStands(on){STANDS=on;try{localStorage.setItem('flavius_stands',on?'on':'off')}catch(e){}const b=$('#btnStands');if(b)b.textContent=_T('Stands: ')+(on?'on':'off');draw();renderBubbles()}
/* the old Stands on/off button. */
$('#btnStands').onclick=()=>setStands(!STANDS);
$('#btnStands').textContent=_T('Stands: ')+(STANDS?'on':'off');
/* S toggles the stands (not while typing or with a window open). */
window.addEventListener('keydown',e=>{if((e.key==='s'||e.key==='S')&&!e.ctrlKey&&!e.metaKey&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)&&$('#modal').hidden)setStands(!STANDS)});

/* ---- the seating chart: 8 sections around the board, 2 per quadrant; each section stands for one gladiator ----
   edge: 'top' = row A side, 'right' = column 12 side, 'bottom' = row L side, 'left' = column 1 side. half 0 = the A/1 end.
   Section colors are the rulebook's seating chart: one fixed color per class, never repeated —
   Hero green, Amazonia orange, Royalty blue, Veteranus light gray, Soldier red, Damnatio dark gray, Slave yellow, Venatore purple. */
const SECTIONS=[
  {edge:'top',half:0,q:2,col:'#4f9a57',cn:'green',n:'North-west stand'},{edge:'top',half:1,q:1,col:'#dc7a34',cn:'orange',n:'North-east stand'},
  {edge:'right',half:0,q:1,col:'#4f7fc4',cn:'blue',n:'East stand (upper)'},{edge:'right',half:1,q:4,col:'#cfc6b4',cn:_T('light gray'),n:'East stand (lower)'},
  {edge:'bottom',half:1,q:4,col:'#c0433a',cn:'red',n:'South-east stand'},{edge:'bottom',half:0,q:3,col:'#55504a',cn:_T('dark gray'),n:'South-west stand'},
  {edge:'left',half:1,q:3,col:'#d4b13c',cn:'yellow',n:'West stand (lower)'},{edge:'left',half:0,q:2,col:'#8a5cc0',cn:'purple',n:'West stand (upper)'},
];
/* SEAT_SEC — seat index → the section that cheers for it (each seat sits nearest one colored stand). */
const SEAT_SEC=[3,5,7,1,0,4,6,2]; // player seat i sits closest to this section (starts: L12, L1, A1, A12, top, bottom, left, right)
/* secOf — the section index that belongs to a player (by seat). */
const secOf=player=>player?SEAT_SEC[player.id%8]:null;
/* secPlayer — the player whose section this is, if any. */
const secPlayer=secIdx=>S&&S.players.find(p=>SEAT_SEC[p.id%8]===secIdx)||null;
/* secColor — a section's fixed seating-chart color. */
const secColor=secIdx=>SECTIONS[secIdx].col; // fixed seat colors from the chart: exactly one of each, never a player's color
const SPECT_MAX=96; // v0.25: the stands hold up to 96 named regulars — each one stands for about a thousand Romans
/* ---- the stands log: everything the spectators do, in its own feed ---- */
/* v0.25 THE REAL HOUSE: every named regular in the seats stands for roughly a thousand spectators.
   The exact figure varies by arena (Roma's bowl is vast, a provincial ring is not) and by the day. */
const ARENA_CAP={Roma:1.3,Capua:1.15,Puteoli:1.05,Verona:1.05,Pompeii:0.9,Syracusae:1.0,Arles:0.95,Nemausus:0.95,Thysdrus:1.1,'Leptis Magna':0.9,Uthina:0.8,Pola:0.9};
/* houseCount — the real head count behind N named regulars: ×1000, scaled by the arena's size (ARENA_CAP) and the draw, with a seeded wobble. Replaced by 106-v75 (n × 1000). */
function houseCount(regulars,seed,locIdx){if(!regulars)return 0;const L=LOCATIONS[locIdx!=null?locIdx:(S?S.locIdx:6)];const cap=(ARENA_CAP[L?L.n:'Roma']||1)*(typeof drawMul==='function'?drawMul():1);let h=((seed||1)*2654435761>>>0)%100000;const extra=(h%900)+(regulars*37)%100;return Math.round(regulars*1000*cap*(0.93+((h>>7)%15)/100))+extra}
/* v0.32 THE DRAW: who is on the card decides who is in the tiers. Star ratings, famous fighters and
   famous houses swell attendance up to double; a card of unknowns plays to a thinner house. */
function drawMul(){if(!S||!S.players)return 1;let d=0;
  try{for(const p of S.players){d+=(p.rating?Math.max(0,p.rating-55)/60:0.15);
    const w2=typeof MGR!=='undefined'&&MGR.world;const g=w2&&p.mgrGid?w2.glads.find(x=>x.id===p.mgrGid):null;
    if(g){d+=(g.fame||0)/120;const m=g.contract?mgrById(g.contract.mgr):null;if(m)d+=(m.fame||0)/160}
    if(typeof fansFor==='function')d+=Math.min(0.3,fansFor(p.name)*0.04)}
   if(S.specCtx||S.tourn)d+=0.5; // an invitational or a tournament is an occasion in itself
  }catch(e){}
  return clamp(0.85+d/Math.max(1,S.players.length)*1.6,0.8,2.2)}
/* houseK — a head count as "13K". */
const houseK=count=>count>=1000?(count/1000).toFixed(count>=10000?0:1).replace(/\.0$/,'')+'K':String(count);
/* houseHTML — the attendance chip ("13K") with its tooltip. Replaced by 106-v75. */
function houseHTML(regulars,seed,locIdx){const full=houseCount(regulars,seed,locIdx);return `<span class="house" title="${_T`${regulars} named regular${regulars===1?'':'s'} in the seats — each stands for about a thousand Romans: ${full.toLocaleString()} spectators today`}">${houseK(full)}</span>`}
// v0.27: how many named regulars across the empire follow this gladiator (fan, patron's favorite or kin) — each ≈1,000 Romans
function fansFor(name){if(!name||typeof CROWD_CACHE==='undefined')return 0;const n=String(name).toLowerCase();return CROWD_CACHE.filter(r=>!r.banned&&[r.fanOf,r.patronFav,r.kin&&r.kin.name].some(x=>x&&String(x).toLowerCase()===n)).length}
/* slog — adds a line to the stands log (S.spectLog, last 90); quoted shouts are also kept for the Acta's Overheard column (localStorage flavius_overheard). */
function slog(html,cls=''){if(!S)return;(S.spectLog=S.spectLog||[]).push({r:S.rotation||0,html,cls});if(!S.sim&&!HEADLESS){const m2=/<b>([^<]+)<\/b>[^“]*“([^”]{8,140})”/.exec(html);if(m2){try{const B=JSON.parse(localStorage.getItem('flavius_overheard')||'[]');B.push({who:m2[1],q:m2[2],at:LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:'the arena'});localStorage.setItem('flavius_overheard',JSON.stringify(B.slice(-40)))}catch(e){}}}if(S.spectLog.length>90)S.spectLog.splice(0,S.spectLog.length-90)}

/* ---- the day's omen: weather and city news sway attendance, moods and hometown fighters ---- */
const OMENS=[
  {k:'clear',n:'A clear day',w:26,att:0,mood:0,d:_T('Dry sand, an easy crowd.')},
  {k:'heat',n:'Scorching heat',w:9,att:-0.25,mood:-8,d:_T('The upper tiers empty early and tempers fray.')},
  {k:'rain',n:'Gray rain off the hills',w:8,att:-0.35,mood:-5,d:_T('Only the devoted sit through it.')},
  {k:'festival',n:'Festival of Mars',w:8,att:0.35,mood:10,d:_T('The whole city pours in, garlanded and loud.')},
  {k:'triumph',n:'A triumph was celebrated yesterday',w:5,att:0.25,mood:14,d:_T('The crowd is still drunk on glory (and wine).')},
  {k:'plague',n:'Plague rumors in the harbor district',w:4,att:-0.5,mood:-10,d:_T('Half the benches sit empty.')},
  {k:'dole',n:'Grain dole day',w:7,att:0.2,mood:6,d:_T('Full bellies, generous moods.')},
  {k:'taxes',n:'Tax collectors abroad in the city',w:7,att:-0.15,mood:-8,d:_T('The crowd came to see somebody else suffer for a change.')},
  {k:'hero',n:'Local hero day',w:7,att:0.15,mood:4,local:1,d:_T('The city honors its own.')},
  {k:'omen',n:'An eagle flew widdershins at dawn',w:5,att:-0.1,mood:-6,local:-1,d:_T('The augurs frown; the city is uneasy.')},
];
/* OMEN_ICON — omen key → icon. */
const OMEN_ICON={clear:'☀️',heat:'🔥',rain:'🌧',festival:'🎉',triumph:'🏆',plague:'☠️',dole:'🍞',taxes:'💸',hero:'🦸',omen:'🦅'};
/* omenBadge — an omen's icon with its tooltip. */
const omenBadge=omen=>omen?`<span class="omenico ${omen.mood>0?'good':omen.mood<0?'bad':''}" title="${esc(omen.n)} — ${esc(omen.d)} (${omen.mood>0?_T('a good omen'):omen.mood<0?_T('an ill omen'):_T('a neutral sky')})">${OMEN_ICON[omen.k]||'✦'}</span>`:'—';
/* rollOmen — rolls the day's omen by weight (seeded dice). */
function rollOmen(){const t=OMENS.reduce((a,o)=>a+o.w,0);let r=rand()*t;for(const o of OMENS)if((r-=o.w)<0)return o;return OMENS[0]}
/* omenStart — announces the omen once at the start; local omens give a hometown fighter +2 CF or cost them 1 CF. */
function omenStart(){
  const om=S&&S.omen;if(!om||S.omenDone)return;S.omenDone=1;const L=LOCATIONS[S.locIdx];
  if(om.k!=='clear')log(`<b>${om.n}.</b> ${om.d||''}${om.att?_T` Attendance ${om.att>0?_T('swells'):_T('thins')}.`:''}`,'big');
  if(om.local)for(const p of S.players){if(p.city&&L&&p.city===L.n){
    if(om.local>0){cfWhy(_T('hometown crowd'));p.cf+=2;log(_T`${nm(p)} fights before their home city of ${esc(L.n)}: the stands roar their name (${cfAmt87('+2')}).`,'big')}
    else{p.cf=Math.max(0,p.cf-1);log(_T`The omen hangs over ${nm(p)}, ${esc(L.n)}'s own: the home crowd is silent (${cfAmt87('−1')}).`)}}}
}

/* ---- the regulars: a persistent crowd pool (RCT-style). The same fans come back, remember ~5 events, and can quit. ---- */
let CROWD_CACHE=[];
/* loadCrowd — loads the regulars into CROWD_CACHE (older ones get a home city). */
async function loadCrowd(){CROWD_CACHE=await Store.list('crowd').catch(()=>[]);
  for(const r of CROWD_CACHE)if(!r.city){r.city=pickOne(LOCATIONS.filter(Boolean)).n} // older regulars get a home city
  return CROWD_CACHE}
/* ---- the crowd's personality, tuned by the player and saved in this browser ----
   act: how much the stands interact at all (stones, offerings, moves, chants, emotes).
   t: weights for each temper when NEW faces join the crowd — your regulars keep the tempers you know them by. */
let CROWD={act:100,t:{hothead:100,generous:100,fickle:100,loyal:100,bloodthirsty:100,miser:100}};
try{const c0=JSON.parse(localStorage.getItem('flavius_crowd')||'null');if(c0)CROWD={act:clamp(+c0.act||100,10,200),t:{...CROWD.t,...(c0.t||{})}}}catch(e){}
/* saveCrowdCfg — saves the crowd personality sliders (localStorage flavius_crowd). */
const saveCrowdCfg=()=>{try{localStorage.setItem('flavius_crowd',JSON.stringify(CROWD))}catch(e){}};
/* crowdA — how active the stands are: your Interactivity slider × the arena's local crowd, 0.1–2.5. */
const crowdA=()=>{const lc=typeof locCrowd==='function'?locCrowd():null;return clamp((CROWD.act||100)/100*((lc&&lc.act||100)/100),0.1,2.5)};
/* pickTemper — a temper for a new face, weighted by your temper sliders and the local crowd (seeded dice). */
function pickTemper(){const ks=Object.keys(SPECT_TEMPERS);const lc=typeof locCrowd==='function'?locCrowd():null;const w=ks.map(k=>Math.max(0,(+CROWD.t[k]||0)*((lc&&lc.t&&lc.t[k]||100)/100)));const tot=w.reduce((x,y)=>x+y,0);if(!tot)return pickOne(ks);let r=rand()*tot;for(let i=0;i<ks.length;i++)if((r-=w[i])<0)return ks[i];return ks[ks.length-1]}
/* OFFER_VAL — coin value of each offering, for the "worth ~N coin" line on result cards. TWEAK: the values. */
const OFFER_VAL={elix2:4,elix4:8,ap2:4,ap3:6,ma1:4,ma2:8,ma3:12,mw1:4,mw2:8,mw3:12,merc1:3,merc2:5,cf1:1,cf2:2,eagle:15,key:6,spiders:0,curse:0};
/* SPECT_TRADES — trades that make new spectator names ("Aelia the potter"). */
const SPECT_TRADES=[_T('the baker'),_T('the tanner'),'the fish-seller',_T('the scribe'),_T('the potter'),_T('the midwife'),'the mule-driver',_T('the wine merchant'),_T('the stonecutter'),_T('the weaver'),_T('the barber'),_T('the moneylender'),_T('the cook'),_T('the sailor'),_T('the dyer'),_T('the perfumer'),_T('the widow'),_T('the schoolmaster'),'the flute-girl',_T('the olive presser')];
/* specIdentity — a brand-new spectator: name, taste, temper, look, maybe a troublemaker (12%). Uses the seeded dice. TWEAK: the .12 troublemaker share. */
function specIdentity(taken){
  let name=null,f=rand()<.45;
  const old=SPECT_NAMES.filter(n=>!taken.has(n));
  if(old.length&&rand()<.4){name=pickOne(old);f=/Flavia|Vibia|Cornelia|Aelia|Livia|Tertia|widow/.test(name)}
  for(let i=0;i<30&&(name==null||taken.has(name));i++)name=`${pickOne(f?NAMEBANK.praeF:NAMEBANK.prae)} ${pickOne(SPECT_TRADES)}`;
  taken.add(name);
  const trb=rand()<.12?1:0;
  const robe=trb?pickOne(['#5a4636','#8a3b1c','#3f5a3a']):pickOne(ROBES);
  return {id:'sp'+Date.now().toString(36)+rnd(46656).toString(36)+rnd(36).toString(36),name,taste:pickOne(Object.keys(SPECT_TASTES)),temper:trb?pickOne(['hothead','bloodthirsty','hothead']):pickTemper(),
    trouble:trb, // every neighborhood has a few — the ushers keep a list
    look:{skin:pickOne(SKINS),hair:pickOne(HAIRS),fem:f,beard:!f&&rand()<.45,long:f?rand()<.75:rand()<.25,robe,hat:Math.random()<.22?['pileus','straw','hood','wreath','veil','helm','turban'][Math.floor(Math.random()*7)]:undefined},visits:0,mem:[],quit:null,grudgeName:null,isNew:1};
}
// small generated face for the crowd panel, in the spirit of the character creator
/* v0.18: every spectator wears a robe (palla/toga) in a Roman dye — customizable in the Creator Studio */
const ROBES=['#7a2230','#4b2a5a','#c9b27a','#3f5a3a','#2f4a6b','#a86a2a','#e8dcc0','#5a4636','#8a3b1c','#35606a'];
const ROBE_NAMES=[_T('madder red'),_T('Tyrian purple'),_T('undyed wool'),_T('weld green'),_T('woad blue'),'saffron',_T('bleached white'),_T('walnut brown'),'rust','sea-teal'];
// buy a regular a ticket: seated NOW if an event is on (bumping a neutral stranger), else guaranteed next time.
// `why` (optional) is shown in the stands log — e.g. a lanista treating a fighter's family.
async function buyTicket(reg,why,free=false){
  if(!free){const m=typeof activeMgr==='function'?await activeMgr():null;
    if(!m||m.coin<2){if(S)log(_T`A ticket costs ${coinAmt87(2)} from an active lanista\u2019s treasury — `+(m?_T('yours is too light'):_T('set one in Manager mode or at the Wagers table'))+'.','bad');return false}
    const pr=await getPurse();await setPurse({...pr,coin:pr.coin-2})}
  if(S&&!S.over&&S.spect&&S.spect.length&&!S.spect.some(x=>x.rid===reg.id&&!x.gone)){
    const out=[...S.spect].filter(x=>!x.human&&!x.gone&&x.fav==null&&!x.vip).sort(()=>rand()-.5)[0]||S.spect.find(x=>!x.human&&!x.gone&&!x.vip);
    if(out){Object.assign(out,{rid:reg.id,name:reg.name,taste:reg.taste,temper:reg.temper,look:reg.look,mem:(reg.mem||[]).slice(-5),visits:reg.visits||0,mood:15,fav:null,favCls:null,bet:null});
      const kin=reg.kin&&S.players.find(p=>p.name.toLowerCase()===String(reg.kin.name).toLowerCase());if(kin){out.fav=kin.id;out.favCls=kin.cls}
      slog(_T`<b>${esc(reg.name)}</b> arrives with a ticket${why?' '+why:''} — an usher moves a stranger to the cheap seats.`,'big');render();return true}}
  reg.ticket=1;Store.put('crowd',reg.id,reg).catch(()=>{});if(S)log(_T`A ticket for <b>${esc(reg.name)}</b>${why?' '+why:''}: guaranteed a seat at the next event.`);return true;
}
/* two-part togas (v0.20): the TUNIC underneath is dyed the way their home city dyes wool; the MANTLE over it
   is their allegiance (a fighter's colors) or, when they back nobody, the robe they chose. */
const CITY_TUNIC={Roma:'#efe3cc',Capua:'#e6d2a8',Pompeii:'#b8926a',Verona:'#e8dcc0',Arles:'#d9c9a3',Syracusae:'#e9d7b0',Thysdrus:'#cdb08a',Nemausus:'#e0d4b8',Puteoli:'#d8c39a','Leptis Magna':'#c9a67a',Uthina:'#d4b48c',Pola:'#e4d6bf'};
/* tunicOf — a spectator's tunic color: their own, else their home city's wool. */
const tunicOf=(look,city)=>(look&&look.tunic)||CITY_TUNIC[city]||'#e8dcc0';
/* robeOf — a spectator's robe color: their own, else one picked from their look. */
const robeOf=look=>(look&&look.robe)||ROBES[Math.abs([...String((look&&look.skin||'')+(look&&look.hair||''))].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7))%ROBES.length];
/* v0.21: spectators can wear hats */
/* SPEC_HATS — spectator hat shapes (SVG) by key. */
const SPEC_HATS={pileus:'<path d="M5 9.5C5 3 19 3 19 9.5Z" fill="#d9ccb0" stroke="#8a7a5a" stroke-width=".5"/>',straw:'<ellipse cx="12" cy="7.4" rx="10" ry="2.2" fill="#d8b86a" stroke="#8a6a2a" stroke-width=".5"/><path d="M7.5 7C7.5 3 16.5 3 16.5 7Z" fill="#e0c47a"/>',hood:'<path d="M3.8 16C2.8 3.5 21.2 3.5 20.2 16C19.4 9 16 6.4 12 6.4S4.6 9 3.8 16Z" fill="#5a4a3a"/>',wreath:'<path d="M5.2 8.6Q12 3.4 18.8 8.6" fill="none" stroke="#6f9a3a" stroke-width="1.6" stroke-dasharray="1.4 .8"/>',veil:'<path d="M4.2 17C3 3.5 21 3.5 19.8 17C19 8.5 16 6 12 6S5 8.5 4.2 17Z" fill="#efe6d2" opacity=".95"/>',helm:'<path d="M4.8 10.5C4.8 2.6 19.2 2.6 19.2 10.5L17.4 10.6C17 6.4 7 6.4 6.6 10.6Z" fill="#a9b2ba" stroke="#5d656d" stroke-width=".5"/>',turban:'<path d="M4.6 9.6C4.2 3 19.8 3 19.4 9.6C17 7.6 7 7.6 4.6 9.6Z" fill="#e8e0cc" stroke="#a89a7a" stroke-width=".5"/><circle cx="12" cy="5.6" r="1" fill="#3a6ad0"/>'};
/* specFaceSVG — a spectator's small face-and-shoulders SVG (tunic, mantle, hair, beard, hat). */
function specFaceSVG(look,mantle,city){const l=look||{};const h=l.hair||'#4a2c17';const tun=tunicOf(l,city||l.city);const man=mantle||robeOf(l);return `<svg class="sface" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M0 24c1-5 5-6.5 12-6.5S23 19 24 24Z" fill="${tun}" stroke="rgba(0,0,0,.3)" stroke-width=".5"/><path d="M3.2 19.2L12 24L20.8 19.2L18.4 18.2L12 21.4L5.6 18.2Z" fill="${man}" stroke="rgba(0,0,0,.35)" stroke-width=".4"/><circle cx="12" cy="11.5" r="7.4" fill="${l.skin||'#e6cfa8'}"/><path d="M4.6 11a7.4 7.4 0 0 1 14.8 0c-2-4.6-12.8-4.6-14.8 0Z" fill="${h}"/>${l.long||l.fem?`<path d="M5 11.5v5M19 11.5v5" stroke="${h}" stroke-width="2.8" stroke-linecap="round"/>`:''}${l.beard&&!l.fem?`<path d="M6.8 14.8c1.4 3.2 9 3.2 10.4 0-1.9 1.5-8.5 1.5-10.4 0Z" fill="${h}" stroke="${h}" stroke-width="1.5"/>`:''}<circle cx="9.5" cy="11.2" r="0.9" fill="#1a120c"/><circle cx="14.5" cy="11.2" r="0.9" fill="#1a120c"/>${SPEC_HATS[l.hat]||""}</svg>`}
// the color a spectator wears: their favorite's color, or their favored class, or undyed wool
const allegCol=sp=>sp.fav!=null&&S.players[sp.fav]?S.players[sp.fav].color:sp.favCls&&CLASSES[sp.favCls]?CLASSES[sp.favCls].color:'#8f8474';
/* quadOf — the board quadrant (1–4) a unit stands in, 0 for the center lines. */
function quadOf(unit){for(const [q,z] of Object.entries(QUADS))if(inRect(z,unit))return +q;return 0}
// band of each section in board coordinates (r,c) — outside the rim, past the row/column labels
function secQuad(secIdx,d0=1.35,d1=2.75){
  const s=SECTIONS[secIdx];const a=s.half?6.6:0.25,b=s.half?12.75:6.4;
  switch(s.edge){
    case 'top':return [[-d0,a],[-d0,b],[-d1,b],[-d1,a]];
    case 'bottom':return [[N-1+d0,a],[N-1+d0,b],[N-1+d1,b],[N-1+d1,a]];
    case 'left':return [[a,-d0],[b,-d0],[b,-d1],[a,-d1]];
    default:return [[a,N-1+d0],[b,N-1+d0],[b,N-1+d1],[a,N-1+d1]];
  }
}
/* pt — grid r,c → screen point on the tile's ground (iso y plus half a tile). */
const pt=(r,c)=>{const {x,y}=iso(r,c);return {x,y:y+TH/2}};
// seat positions for spectators inside a section: 4 benches × 6 seats (24 a section, 192 in the house)
function seatPos(secIdx,seatNo){
  const s=SECTIONS[secIdx];const row=seatNo%4,col=Math.floor(seatNo/4)%6;const d=1.55+row*0.38;const along=(s.half?7:0.9)+col*0.95+(row%2?0.45:0);
  const [r,c]=s.edge==='top'?[-d,along]:s.edge==='bottom'?[N-1+d,along]:s.edge==='left'?[along,-d]:[along,N-1+d];
  return pt(r,c);
}
/* drawStands — draws the tiered stands in all 8 sections with their color markers and ambient crowd, then every seated spectator. Wrapped by 55-anim and 127-v82onl. */
function drawStands(){
  const shadeHex=(h,f)=>shade(h,f);
  for(let si=0;si<8;si++){
    const s=SECTIONS[si];const q=secQuad(si);const P=q.map(([r,c])=>pt(r,c));
    // tiered benches: outer tiers higher (lighter), with a raised back wall
    for(let t=0;t<3;t++){const d0=1.35+t*0.47,d1=d0+0.47;const Q=secQuad(si,d0,d1).map(([r,c])=>pt(r,c));
      ctx.beginPath();Q.forEach((p,i)=>i?ctx.lineTo(p.x,p.y-t*TW*0.08):ctx.moveTo(p.x,p.y-t*TW*0.08));ctx.closePath();
      ctx.fillStyle=t%2?(THEME.standA||'#5b4130'):(THEME.standB||'#6d4f38');ctx.fill();if(typeof standsTex81==='function')standsTex81(t,si);ctx.strokeStyle='rgba(20,12,6,.55)';ctx.lineWidth=1;ctx.stroke()}
    // section color: the rulebook's colored seat marker in the middle of each stand
    const mid=secQuad(si,1.9,1.9);const m1=pt(...mid[0]),m2=pt(...mid[1]);const cx=(m1.x+m2.x)/2,cy=(m1.y+m2.y)/2-TW*0.08;
    const col=secColor(si);ctx.fillStyle=col;ctx.globalAlpha=.85;ell(cx,cy,TW*0.24,TW*0.12);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#1a120c';ctx.lineWidth=1.2;ctx.stroke();
    ctx.fillStyle='rgba(245,232,204,.55)';ctx.font=`${Math.round(TW*0.2)}px IBM Plex Mono, monospace`;ctx.textAlign='center';ctx.textBaseline='middle';
    const far=secQuad(si,2.95,2.95);const f=pt(...far[s.half?1:0]);ctx.fillText('Q'+s.q,f.x,f.y);
    // an ambient crowd (not spectators in the rules sense) so the stands never look empty
    ctx.fillStyle='rgba(216,199,166,.26)';for(let k=0;k<9;k++){const p=seatPos(si,(k*5+si)%12);ell(p.x+((k*37+si*11)%7-3)*TW*0.04,p.y-TW*0.2-((k*13)%3)*TW*0.03,TW*0.055,TW*0.055);ctx.fill()}
  }
  // the spectators (the players of the rule): body in section color, face ringed by mood
  if(!S)return;
  const bySec={};
  for(const sp of S.spect){if(sp.gone)continue;const k=(bySec[sp.sec]=(bySec[sp.sec]||0)+1)-1;const p=seatPos(sp.sec,k);sp._x=p.x;sp._y=p.y;
    const lk=sp.look||{};
    const reg=CROWD_CACHE.find(x=>x.id===sp.rid);ctx.fillStyle=tunicOf(lk,reg&&reg.city);ell(p.x,p.y-TW*0.1,TW*0.1,TW*0.13);ctx.fill();ctx.strokeStyle='#1a120c';ctx.lineWidth=1;ctx.stroke(); // the tunic: home-city wool
    ctx.fillStyle=sp.fav!=null||sp.favCls?allegCol(sp):robeOf(lk);{const X=p.x,Y=p.y,U=TW;ctx.beginPath();ctx.moveTo(X-U*0.1,Y-U*0.2);ctx.lineTo(X,Y-U*0.05);ctx.lineTo(X+U*0.1,Y-U*0.2);ctx.lineTo(X+U*0.065,Y-U*0.215);ctx.lineTo(X,Y-U*0.11);ctx.lineTo(X-U*0.065,Y-U*0.215);ctx.closePath();ctx.fill();ctx.lineWidth=0.8;ctx.stroke()} /* v0.24: the mantle worn as a V over the tunic */ // the mantle: their allegiance, or their own robe // the robe over their shoulders; the tunic below wears their allegiance
    ctx.fillStyle=lk.skin||'#e6cfa8';ell(p.x,p.y-TW*0.3,TW*0.085,TW*0.085);ctx.fill();ctx.strokeStyle=moodCol(sp.mood);ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=lk.hair||'#4a2c17';ctx.beginPath();ctx.ellipse(p.x,p.y-TW*0.335,TW*0.075,TW*0.042,0,Math.PI,0);ctx.fill();
    if(lk.long){ell(p.x-TW*0.075,p.y-TW*0.28,TW*0.02,TW*0.05);ctx.fill();ell(p.x+TW*0.075,p.y-TW*0.28,TW*0.02,TW*0.05);ctx.fill()}
    if(lk.beard){ell(p.x,p.y-TW*0.245,TW*0.05,TW*0.028);ctx.fill()}
    if(sp.human){ctx.strokeStyle='#f0cf7d';ctx.lineWidth=2;ell(p.x,p.y-TW*0.18,TW*0.18,TW*0.24);ctx.stroke()}}
  // (emotes are drawn last in draw(), above the board, so the front rows never vanish under the sand)
  // v0.35: the superfans' banners are painted in draw(), AFTER the board, so the sand never hides them
}
/* moodCol — ring color for a spectator's mood (green happy → red furious). */
const moodCol=mood=>mood>=40?'#8fe07a':mood>=10?'#cde07a':mood>-15?'#b39d80':mood>-45?'#f0a25a':'#ff5a44';
/* moodEmo — emoji for a spectator's mood. */
const moodEmo=mood=>mood>=60?'🤩':mood>=30?'😄':mood>=10?'🙂':mood>-15?'😐':mood>-45?'😠':'😡';
/* drawEmotes — draws the spectators' emotes and shout bubbles (drawn last, over the board). */
function drawEmotes(){
  if(!S||!S.emotes||!S.emotes.length)return;const now=performance.now();const life=SPEED==='fast'?1400:SPEED==='slow'?4200:2600;
  S.emotes=S.emotes.filter(e=>now-e.t0<life);
  for(const e of S.emotes){const sp=S.spect.find(x=>x.id===e.sid);if(!sp||sp._x==null)continue;const k=(now-e.t0)/life;
    const y=sp._y-TW*(0.62+k*0.35);ctx.save();ctx.globalAlpha=k>0.75?(1-k)/0.25:1;
    ctx.font=`${Math.round(TW*0.36)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(e.emo,sp._x,y);
    if(e.text){ctx.font=`600 ${Math.round(TW*0.2)}px Alegreya Sans, sans-serif`;const w=ctx.measureText(e.text).width+10;ctx.fillStyle='rgba(245,234,210,.95)';ctx.fillRect(sp._x-w/2,y-TW*0.52,w,TW*0.26);ctx.fillStyle='#241910';ctx.fillText(e.text,sp._x,y-TW*0.39)}
    ctx.restore()}
}
/* emote — a spectator shows an emoji (and maybe a shout) for a moment; one shout at a time. Respects the emote / shout settings. */
function emote(sp,emo,text=''){if(typeof SETTINGS!=='undefined'){if(SETTINGS.emotesSpect===false)return;if(SETTINGS.shoutsSpect===false)text=''}

  if(HEADLESS||!S||!STANDS)return;S.emotes=S.emotes||[];S.emotes=S.emotes.filter(e=>e.sid!==sp.id);if(text)for(const e of S.emotes)e.text=''; // one shout at a time
  S.emotes.push({sid:sp.id,emo,text,t0:performance.now()});sp.lastEmo=emo;if(typeof fxLoop==='function'&&!fxRAF)fxLoop();
}

/* ---- who the spectators are ---- */
const SPECT_TASTES={aggression:[_T('Brawlers'),_T('loves a gladiator who goes for the throat')],hunt:[_T('Beast hunters'),_T('loves trophies from the beasts')],cf:[_T('Showmen'),_T('loves pots, spectacle and crowd-pleasers')],coin:[_T('High rollers'),_T('loves rich gladiators and big market buys')],survival:[_T('Survivors'),_T('loves the patient, careful fighter')],loyalty:[_T('Honor'),_T('loves loyal allies and fair trades')],underdog:[_T('Underdogs'),_T('always cheers for whoever is losing')]};
/* SPECT_TEMPERS — spectator tempers: [name, how it behaves]. */
const SPECT_TEMPERS={hothead:['Hot-headed',_T('throws stones quickly when angry')],generous:[_T('Generous'),_T('showers a favorite with offerings')],fickle:[_T('Fickle'),_T('switches favorites and sections easily')],loyal:[_T('Loyal'),_T('sticks with one gladiator to the end')],bloodthirsty:[_T('Bloodthirsty'),_T('happy at any bloodshed, bored without it')],miser:['Tight-fisted',_T('hoards CF for the big moments')]};
/* SPECT_NAMES — the old named regulars a new face may still be. */
const SPECT_NAMES=[_T('Old Marcus the baker'),_T('Flavia of the fish stalls'),_T('Gaius the tanner'),_T('Vibia and her sister'),_T('Big Sextus'),_T('The widow Cornelia'),_T('Lucius the drunk'),_T('Little Titus'),_T('Aelia the midwife'),_T('Brother Quintus'),_T('Decimus One-Eye'),_T('Livia the gossip'),_T('Rufus the butcher'),_T('Servius the scribe'),_T('Tertia the weaver'),_T('Publius the potter')];
// two anonymous voices in the crowd who narrate disasters like a certain beloved dubbed game show.
const DUO=[
  [_T('He came for glory'),_T('He leaves as luggage')],
  [_T('A bold strategy'),_T('And the sand agrees: no')],
  [_T('You hate to see it'),_T('I absolutely do not hate to see it')],
  [_T('That\u2019s going to hurt in the morning'),_T('That\u2019s going to hurt forever, actually')],
  [_T('He zigged'),_T('History will record that he should not have')],
  [_T('Right you are'),_T('I usually am')],
  [_T('A textbook maneuver'),_T('Wrong textbook, though')],
  [_T('The crowd is on its feet'),_T('Mostly to see better, let\u2019s be honest')],
];
/* duoSay — now and then (30%) the sausage seller and his customer narrate a disaster. */
const duoSay=tag=>{if(Math.random()>.3)return;const [a2,b2]=upick(DUO);slog(_T`\u201c${a2}${tag?', '+tag:''}!\u201d shouts a man selling sausages. \u201c${b2},\u201d agrees his customer.`)};
/* SHOUTS — shout lines by feeling. */
const SHOUTS={happy:[_T('Ave!'),_T('Yes!'),_T('Magnificent!'),_T('Again!')],fav:[_T('My coin is on you!'),_T('That\'s my gladiator!'),_T('Io! Io!')],angry:[_T('Coward!'),_T('Boo!'),_T('Kill him!'),_T('Rubbish!')],sad:[_T('No…'),_T('Get up!'),_T('Not like this')],blood:[_T('More blood!'),_T('Iugula!'),_T('Finish it!')],bored:[_T('Wake up!'),_T('Fight!'),_T('Tholo! Tholo!')]};
/* ---- EMPIRE TURNOUT (v0.17): 'Random — the empire decides' ----
   Instead of a fixed number, the stands fill the way the world would fill them: the city's appetite
   for games (LOC_CROWD), the regulars who live there, every fan/kin/patron who follows someone on
   today's card, the billing (manager main events, festival finals) — and then the omen on top. */
function empireTurnout(config){
  const why=[];const L=LOCATIONS[S.locIdx];const here=L?L.n:'';const LC=LOC_CROWD[S.locIdx]||{act:100};
  let n=6+rnd(9);n=Math.round(n*LC.act/100);why.push(_T`${here||_T('the city')}'s own appetite (${n}K)`);
  const home=CROWD_CACHE.filter(r=>r.city===here&&!r.quit&&!r.banned&&!r.recruited).length;
  if(home){const h=Math.min(8,Math.round(home*.3));if(h){n+=h;why.push(_T`+${h}K hometown spectators`)}}
  const names=new Set(S.players.map(p=>String(p.name).toLowerCase()));
  const follow=CROWD_CACHE.filter(r=>!r.banned&&!r.recruited&&[r.fanOf,r.patronFav,r.kin&&r.kin.name].some(x=>x&&names.has(String(x).toLowerCase()))).length;
  if(follow){const f=Math.min(14,Math.round(follow*1.3));n+=f;why.push(_T`+${f}K following today's fighters`)}
  const saved=config.seats?config.seats.filter(x=>x.saved).length:0;if(saved){n+=saved*2;why.push(_T`+${saved*2}K for returning Ludus names`)}
  {const dm=typeof drawMul==='function'?drawMul():1;if(dm>1.1){const ex=Math.round(n*(dm-1)*0.7);if(ex){n+=ex;why.push(_T`+${ex}K for the draw — famous names on the card`)}}} // v0.32
  if(config.mgrTier){const t={main:12,mid:5}[config.mgrTier]||0;if(t){n+=t;why.push(_T`+${t}K for the ${config.mgrTier==='main'?_T('main event'):_T('billing')}`)}}
  if(config.fest&&config.fest.stage>=2){n+=8;why.push(_T('+8 festival crowds'))}
  {const wi=typeof worldImpact==='function'?worldImpact(S.locIdx):null;if(wi&&wi.att){const d=Math.round(n*wi.att);n+=d;why.push(_T`${d>=0?'+':''}${d}K from world events (${wi.list.map(e=>e.n.toLowerCase()).join('; ')})`)}}
  n+=Math.round((rand()-.5)*6); // and the plain chance of a Roman afternoon
  S.turnoutWhy=why;return clamp(n,3,SPECT_MAX);
}
/* seatSpectators — fills S.spect for a new event: regulars first (home city, favorites and ticket holders before others, ≤2 troublemakers), new faces for the rest; the omen sways the count; the Gauntlet seats at most 12. TWEAK: the 0.75 regulars share. */
function seatSpectators(count,config){
  S.spect=[];S.emotes=[];S.spectLog=[];S.attendance=0;
  const om=S.omen||(S.omen=rollOmen());
  if(count==='exhib')return seatGladiatorStands(config);
  if(count==='auto')count=empireTurnout(config||{});else S.turnoutWhy=null;
  count=Math.min(SPECT_MAX,Math.max(0,Math.round((count||0)*(1+(om.att||0))))); // the omen sways attendance
  if(S.evKey==='gauntlet')count=Math.min(count,12); // a solo gauntlet never draws more than 12 — and they are a mean dozen
  if(!count)return;
  const taken=new Set(CROWD_CACHE.map(r=>r.name));
  const gauntlet=S.evKey==='gauntlet';
  // the regulars come back first (unless they quit); new faces fill the rest of the benches
  let pool=shuffle(CROWD_CACHE.filter(r=>!r.quit&&!r.banned&&!r.recruited));
  // regulars will travel — but they pack the stands of their OWN city first
  {const here=LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:'';pool=pool.filter(r=>!r.city||r.city===here||rand()<.45);
   const fights=r=>r.favG&&S.players.some(p=>p.name===r.favG)?3:0; // v0.41: a regular follows their favorite to any arena
   pool.sort((a,b)=>((b.ticket?2:0)+(b.city===here?1:0)+fights(b))-((a.ticket?2:0)+(a.city===here?1:0)+fights(a)))}
  for(const r of pool.slice(0,Math.round(count*0.75)))if(r.ticket){delete r.ticket;r.ticketed=1;Store.put('crowd',r.id,r).catch(()=>{})} // ticket holders are guaranteed their seats
  {let trb=0;pool=pool.filter(r=>!r.trouble||++trb<=2)} // the ushers let a FEW troublemakers through — it keeps things lively
  const ids=pool.slice(0,Math.round(count*0.75));
  while(ids.length<count)ids.push(specIdentity(taken));
  let seatedTrouble=0;
  for(let i=0;i<count;i++){const r=ids[i];
    const trouble=r.trouble&&++seatedTrouble<=2?1:0; // the ushers admit at most two known troublemakers a day
    let temper=r.temper;if(gauntlet&&rand()<.55)temper=pickOne(['fickle','miser','miser','fickle','hothead']); // fickle and stingy for the solo show
    S.spect.push({id:i,rid:r.id,name:r.name,taste:r.taste,temper:temper,look:r.look||{skin:pickOne(SKINS),hair:pickOne(HAIRS),beard:false,long:false},
      mem:(r.mem||[]).slice(-5),visits:r.visits||0,grudgeName:r.grudgeName||null,isNew:!!r.isNew,
      trouble,cf:0,sec:SEAT_SEC[i%8],fav:null,favCls:null,mood:clamp(rnd(21)-10+(om.mood||0)+(r.treat?15:0),-60,60),grudge:null,bet:null,human:false,gone:false,log:[]});if(r.treat)delete r.treat;}
  if(config&&config.spectHuman&&S.spect.length){const me=S.spect[0];me.human=true;me.name='You';me.rid='you';me.fav=undefined;me.favG=null;me.bet=null;me.trueFan=0}
  seatOffDuty();
  S.attendance=S.spect.length;
}
/* ---- the league in the stands (v0.18) ---- */
const mgrWorldAny=()=>(typeof MGR!=='undefined'&&MGR.world)||(typeof ACTIVE!=='undefined'&&ACTIVE.world)||null;
/* leagueFighterSpect — a Manager-league gladiator seated as a spectator (they only watch and talk). */
function leagueFighterSpect(glad,idx,world){const m=glad.contract&&world.mgrs.find(x=>x.id===glad.contract.mgr);
  return {id:idx,rid:'gx'+glad.id,name:glad.name,taste:pickOne(['aggression','cf','hunt','survival']),temper:'fickle',look:typeof gLook==='function'?gLook(glad):{},mem:[],visits:0,
    trouble:0,cf:0,sec:SEAT_SEC[idx%8],fav:null,favCls:null,mood:rnd(21)-10,grudge:null,bet:null,human:false,gone:false,log:[],glad:{ludus:m?m.ludus:_T('a free sword'),cls:glad.cls}}}
// now and then, off-duty fighters from the Manager-mode league turn up to watch — scouting, heckling, or just resting a sore arm
function seatOffDuty(){
  const w=mgrWorldAny();if(!w||!w.glads||!S.spect.length||S.exhib||rand()>=.3)return;
  const inEvent=new Set(S.players.map(p=>String(p.name).toLowerCase()));
  const pool=shuffle(w.glads.filter(g=>g.alive&&!inEvent.has(String(g.name).toLowerCase()))).slice(0,1+rnd(2));
  for(const g of pool){const i=S.spect.findIndex(x=>!x.human&&x.fav==null&&!x.glad&&!x.ticketed);if(i<0)break;
    const sp=leagueFighterSpect(g,S.spect[i].id,w);sp.sec=S.spect[i].sec;S.spect[i]=sp;
    slog(_T`<b>${esc(g.name)}</b> (${esc(sp.glad.ludus)}), off duty, takes a seat — ${pickOne([_T('scouting the competition'),_T('resting a bruised arm'),_T('here to heckle an old rival'),_T('sizing up next week\u2019s opponents')])}.`,'big')}
}
// exhibition stands: no paying public — just fighters from around the empire, watching and talking
function seatGladiatorStands(config){
  const w=mgrWorldAny();const inEvent=new Set(S.players.map(p=>String(p.name).toLowerCase()));
  const pool=w?shuffle(w.glads.filter(g=>g.alive&&!inEvent.has(String(g.name).toLowerCase()))).slice(0,10+rnd(8)):[];
  pool.forEach((g,i)=>S.spect.push(leagueFighterSpect(g,i,w)));
  S.attendance=S.spect.length;S.turnoutWhy=null;
}
/* PASSIVE_TALK — what the watching-only crowd of a race or sea-fight says (% = the gladiator). */
const PASSIVE_TALK={good:[_T('Go on, %!'),_T('% has the legs for it!'),_T('Look at % fly!'),_T('That is my coin on %, and it is SAFE.'),_T('% — the gods love that one today.'),_T('Faster, %! FASTER!')],bad:[_T('% is going backwards!'),_T('My grandmother steers better than %.'),_T('Sink, %, sink!'),_T('Who taught % to hold the reins?'),_T('% is done. Done!'),_T('I want my two sestertii back from %.')]};
/* EXHIB_TALK — what fighters in the stands say at an exhibition. */
const EXHIB_TALK={good:[_T('Clean footwork. Somebody taught that one properly.'),_T('That is how you use a shield. Take notes.'),_T('I would not want to draw that one on a bad day.'),_T('Quick hands. Very quick.'),_T('The doctors will not need to call THAT one.')],
  bad:[_T('My grandmother parries better.'),_T('Too slow on the left. Every time.'),_T('If that was a real bout, we would be singing dirges.'),_T('They telegraph every swing like a town crier.'),_T('Somebody is wasting their lanista\u2019s coin.')]};

// how strongly a gladiator shows each style: personality (or class) blended with what they have actually done
function styleOf(player){
  const base=player.cpu?pers(player):(CLASSES[player.cls].pers||(PERS_PRESETS[CLASS_PERS[player.cls]]||PERS_PRESETS.balanced).v);const st=player.stats||{};
  const beh={aggression:Math.min(100,(st.kill_player||0)*30+(st.pvpHits||0)*8),hunt:Math.min(100,player.trophies.filter(t=>t.pk!=='player').length*25),cf:Math.min(100,(st.pots||0)*18+player.cf*1.5),coin:Math.min(100,player.coin*4+(st.buy||0)*12),survival:Math.min(100,(st.tunnel||0)*20+(st.dodge||0)*20),loyalty:Math.min(100,(st.gifts||0)*25+(st.truce||0)*20+(st.trade||0)*15)};
  const o={};for(const [k] of PERS_KEYS)o[k]=Math.round((base[k]||50)*0.65+beh[k]*0.35);return o;
}
/* pickFavorite — the gladiator a spectator would back: the one whose style best fits their taste (underdog fans pick the weakest). */
function pickFavorite(sp){
  const act=activePlayers();if(!act.length)return null;
  if(sp.taste==='underdog')return [...act].sort((a,b)=>perfScore(a)-perfScore(b))[0].id;
  return [...act].sort((a,b)=>styleOf(b)[sp.taste]-styleOf(a)[sp.taste]+(rand()-.5)*8)[0].id;
}
/* ================= FAMOUS VISITORS (v0.18) =================
   Rarely (about one event in twelve) a real historical figure attends. Each nudges the crowd and the
   event a little — never enough to decide it. Toggle: Settings → Famous visitors. */
/* FAMOUS — famous visitors: name, who they were, crowd mood change, their effect fx(players) → text, and their entrance line. TWEAK: moods and effects. */
const FAMOUS=[
  {n:'Titus',who:_T('the emperor who opened the Flavian Amphitheater'),mood:15,fx:ps=>{for(const p of ps)p.cf+=2;return _T`every gladiator ${cfAmt87('+2')} from the emperor\u2019s favor`},line:_T('The imperial box fills. The whole arena rises for Titus.')},
  {n:'Nero',who:_T('emperor, singer, arsonist (allegedly)'),mood:0,fx:ps=>{const p=pickOne(ps);p.cf+=5;for(const s of S.spect)s.mood=clamp(s.mood+rnd(41)-20,-100,100);return `Nero picks a favorite: ${esc(p.name)} ${cfAmt87('+5')}; the crowd\u2019s mood lurches`},line:_T('Nero arrives with a lyre and an entourage. Nobody asks him to play. He plays.')},
  {n:'Seneca',who:_T('Stoic philosopher, famously unimpressed by the games'),mood:-10,fx:()=>_T('the stands feel judged (mood −10)'),line:_T('Seneca takes a seat, sighs audibly, and begins writing a very long letter about it.')},
  {n:'Galen',who:_T('physician to the gladiators of Pergamon'),mood:5,fx:ps=>{for(const p of ps)p.items.push(mkOffer('elix2'));return _T('every gladiator receives a Health Elixir (2 HP) from his bag')},line:_T('Galen, physician of Pergamon\u2019s gladiators, sets down a bag of salves by the gate.')},
  {n:'Martial',who:_T('the poet who wrote the Book of Spectacles'),mood:8,fx:ps=>{const p=[...ps].sort((a,b)=>b.cf-a.cf)[0];p.cf+=3;return _T`he promises ${esc(p.name)} an epigram (${cfAmt87('+3')})`},line:_T('Martial the poet is here, stylus ready. Everyone fights a little more quotably.')},
  {n:'Flamma',who:_T('the gladiator who refused the rudis four times'),mood:10,fx:ps=>{const p=[...ps].sort((a,b)=>a.cf-b.cf)[0];p.cf+=4;return _T`he nods at the underdog, ${esc(p.name)} (${cfAmt87('+4')})`},line:_T('Flamma — four times offered freedom, four times refused — watches from the front row.')},
  {n:'Carpophorus',who:_T('the most famous beast-fighter of Rome'),mood:6,fx:ps=>{const v=ps.filter(p=>p.cls==='venatore');for(const p of v)p.cf+=4;return v.length?_T`Venatores ${cfAmt87('+4')} under his eye`:'no beast-hunters on the card to impress him'},line:_T('Carpophorus, slayer of twenty beasts in a day, has come to see the animals work.')},
  {n:'Priscus & Verus',who:_T('the pair whose famous bout ended in a draw — and freedom for both'),mood:12,fx:ps=>{for(const p of ps)p.cf+=1;return _T`a little honor for everyone (${cfAmt87('+1')} each)`},line:_T('Priscus and Verus sit side by side, as they have since the day neither would fall.')},
  {n:'Pliny the Elder',who:_T('naturalist, admiral, compulsive note-taker'),mood:0,fx:ps=>{for(const p of ps)p.coin+=1;return _T('he tips every gladiator a coin for letting him sketch their armor')},line:_T('Pliny the Elder is sketching the beasts. And the sand. And the ushers.')},
];
/* famousVisit — about one event in twelve a famous visitor attends and applies their effect (dice drawn every time so replays line up). TWEAK: the 1/12. */
function famousVisit(){
  const roll=rand(),pick=rnd(FAMOUS.length); // drawn every time so seeded replays line up whether or not anyone famous comes
  if(HEADLESS||S.sim||S.exhib||(typeof SETTINGS!=='undefined'&&SETTINGS.famous===false)||roll>=1/12)return;
  const F=FAMOUS[pick];if(F.gate&&!F.gate())return;const act=S.players.filter(p=>p.alive);cfWhy(_T('a famous visitor'));const eff=F.fx(act);CF_WHY=null;
  for(const s of S.spect||[])s.mood=clamp(s.mood+(F.mood||0),-100,100);
  S.famous={n:F.n,who:F.who,eff};
  log(_T`👑 <b>${esc(F.n)}</b> — ${esc(F.who)} — is in attendance. ${F.line} <i>(${eff}${F.mood?_T`; crowd mood ${F.mood>0?'+':''}${F.mood}`:''})</i>`,'big');
  slog(_T`👑 <b>${esc(F.n)}</b> takes a seat. ${F.line}`,'big');
  try{flaviusMood(F.mood<0?'bored':'smug',3800,.7)}catch(e){}
}
/* crowdStart — at the start: the omen, a famous visitor, world news on moods, then every spectator picks a favorite (memory, kin, bought cheers, taste), takes a section and lays an opening 2 CF wager. */
function crowdStart(){
  omenStart();
  famousVisit();
  {const wi=typeof worldImpact==='function'&&!S.exhib?worldImpact(S.locIdx):null; // the empire's news walks in with the crowd
   if(wi&&wi.mood&&S.spect&&S.spect.length){for(const s2 of S.spect)s2.mood=clamp(s2.mood+wi.mood,-100,100);log(_T`The stands carry the empire's news in with them: ${wi.list.map(e=>`${e.i} ${esc(e.n)} (${esc(e.city)})`).join('; ')} — crowd mood ${wi.mood>0?'+':''}${wi.mood}.`)}}
  if(!S.spect.length)return;
  const present=new Set(S.players.map(p=>p.cls));
  for(const sp of S.spect){if(sp.human)continue;
    // memory first: regulars arrive already loving or hating someone they remember
    const rev=(sp.mem||[]).find(m=>m.kind==='revenge'&&S.players.some(p=>p.name===m.who));
    if(rev||sp.grudgeName){const tgt=S.players.find(p=>p.name===(rev?rev.who:sp.grudgeName));
      if(tgt){sp.grudge=tgt.id;sp.mood=-40;slog(_T`<b>${esc(sp.name)}</b> is back — and remembers ${esc(tgt.name)} spearing ${rev?_T('their friend'):_T('them')} from the stands. Revenge is on the menu.`,'big')}}
    if(!S.sim&&!HEADLESS){const reg=CROWD_CACHE.find(x=>x.id===sp.rid);if(reg){spectFavEnsure(reg);sp.favG=reg.favG||null;const pl=reg.favG&&S.players.find(p=>p.name===reg.favG);
      if(pl){sp.fav=pl.id;sp.favCls=pl.cls;sp.trueFan=1;slog(_T`<b>${esc(sp.name)}</b> came to see <b>${esc(pl.name)}</b> — their favorite gladiator.`)}}}
    const fanmem=sp.fav==null&&(sp.mem||[]).find(m=>m.kind==='fanwin'&&S.players.some(p=>p.name===m.who));
    if(fanmem){const pl=S.players.find(p=>p.name===fanmem.who);if(pl){sp.fav=pl.id;sp.favCls=pl.cls;slog(_T`<b>${esc(sp.name)}</b>, a regular of ${sp.visits} event${sp.visits===1?'':'s'}, is back to cheer ${esc(pl.name)} again.`)}}
    // blood before coin: family in the fight gets their colors, no questions asked
    if(sp.fav==null){const reg=CROWD_CACHE.find(x=>x.id===sp.rid);const kin=reg&&reg.kin;
      if(kin){const pl=S.players.find(p2=>p2.name.toLowerCase()===String(kin.name||'').toLowerCase());
        if(pl){sp.fav=pl.id;sp.favCls=pl.cls;sp.kinOf=pl.id;sp.mood=Math.max(sp.mood||0,12);
          slog(_T`<b>${esc(sp.name)}</b> takes a seat in family colors — ${esc(kin.rel)} of <b>${esc(pl.name)}</b>, who fights today.`,'big')}}}
    // bought cheers are the most reliable kind: a patron's coin outranks taste itself
    if(sp.fav==null){const reg=CROWD_CACHE.find(x=>x.id===sp.rid);const pf=reg&&reg.patronFav;
      if(pf){const pl=S.players.find(p2=>p2.name===pf);if(pl){sp.fav=pl.id;sp.favCls=pl.cls;slog(_T`<b>${esc(sp.name)}</b> arrives already chanting ${esc(pf)}'s name. Money well spent, someone's.`)}}}
    // only some arrive already backing a gladiator (the loyal always do); the rest are won over — or not — by the fighting
    if(sp.fav==null&&(sp.temper==='loyal'||rand()<.5))sp.fav=pickFavorite(sp);
    // the colors they wear: mostly classes actually fighting today; the rare off-color fan turns up anyway
    if(sp.fav!=null)sp.favCls=S.players[sp.fav].cls;
    else{const roll=rand();
      if(roll<.12){const absent=BASE_CLS.filter(c=>!present.has(c));if(absent.length){sp.favCls=pickOne(absent);slog(_T`<b>${esc(sp.name)}</b> turns up in ${CLASSES[sp.favCls].name} ${SECTIONS.find(x=>x.col===CLASSES[sp.favCls].color)?.cn||'colors'} — nobody of that class fights today. They may yet pick a new hero.`)}}
      else if(roll<.85)sp.favCls=pickOne([...present]);}
    // fans sit in the favorite's section, unless it is already packed: then the other stand facing the same quadrant
    if(sp.fav!=null){const want=secOf(S.players[sp.fav]);const full=S.spect.filter(o=>o!==sp&&o.sec===want&&o._seated).length>=Math.max(2,Math.ceil(S.spect.length/10));sp.sec=full?SECTIONS.findIndex((x,i)=>i!==want&&x.q===SECTIONS[want].q):want;sp._seated=1;
      // opening wager: arriving fans back their favorite with 2 CF at the opening line
      const o=(()=>{try{return oddsTable(true).find(x=>x.ps.some(q=>q.id===sp.fav))}catch(e){return null}})();sp.bet={pid:sp.fav,amt:2,odds:o?+o.odds.toFixed(2):2};if(!S.sim&&!HEADLESS)sp.bet.bid=betRec({src:'event',ev:S.seed,dayOff:0,min:660+Math.floor(Math.random()*150),city:LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:'',who:sp.name,kind:'spectator',on:_T`${S.players[sp.fav].name} to win`,stake:2,odds:sp.bet.odds,cur:'CF'})}}
  try{spectWagers()}catch(e){}
  const fans=S.spect.filter(s=>!s.human&&s.fav!=null),neu=S.spect.filter(s=>!s.human&&s.fav==null);
  log(_T`${S.spect.length}K spectators take their seats in the stands: ${fans.length}K arrive as fans, ${neu.length}K still to be won over. Open the crowd panel for every name.`);
  for(const s of S.spect.filter(x=>!x.human))slog(_T`<b>${esc(s.name)}</b> (${SPECT_TASTES[s.taste][0].toLowerCase()}, ${SPECT_TEMPERS[s.temper][0].toLowerCase()}) sits in ${SECTIONS[s.sec].n}${s.fav!=null?_T`, backing <b>${esc(S.players[s.fav].name)}</b> with a ${cfAmt87(2)} wager`:''}.`);
}
/* spectMood — changes a spectator's mood by delta and maybe shows an emote. */
function spectMood(sp,delta,emo,text){
  if(sp.gone)return;sp.mood=clamp(Math.round(sp.mood+delta),-100,100);
  if(emo&&(Math.abs(delta)>=8?Math.random()<.75*clamp(crowdA(),0.3,1.3):Math.random()<.2*crowdA()))emote(sp,emo,text&&Math.random()<.7?text:'') // most reactions come with words now, not just a face;
}
// every reaction the crowd has: some depend on taste and favorite, some are universal
function crowdReact(kind,info={}){
  flaviusReact(kind,info); // the sponsor reacts even when the stands are empty
  if(!S||!S.spect||!S.spect.length)return;
  for(const sp of S.spect){if(sp.gone)continue;const fav=sp.fav!=null?S.players[sp.fav]:null;const T=sp.taste;const blood=sp.temper==='bloodthirsty';
    switch(kind){
      case 'hit':{const {att,def,dmg}=info;if(!dmg)break;
        if(def===fav){spectMood(sp,-5*dmg,dmg>=3?'😱':'😠',pickOne(SHOUTS.sad));if(att&&att.cls&&rand()<.6)sp.grudge=att.id}
        else if(att===fav){spectMood(sp,4*dmg,'🎉',pickOne(SHOUTS.fav))}
        else spectMood(sp,blood?2*dmg:dmg*0.5,blood?'🤩':null,blood?pickOne(SHOUTS.blood):'');
        if(att&&att.cls&&T==='aggression'&&att!==fav)spectMood(sp,2,null);break}
      case 'elim':{const {v,killer}=info;if(sp===S.spect.find(x=>!x.gone))duoSay();
        if(v===fav){spectMood(sp,-45,'😭',pickOne(SHOUTS.sad));if(killer&&killer.cls)sp.grudge=killer.id;sp.fav=null}
        else if(killer===fav)spectMood(sp,30,'🎉',pickOne(SHOUTS.fav));
        else spectMood(sp,blood?25:12,blood?'🤩':'😮',pickOne(SHOUTS.blood)); // blood is always a show
        if(sp.grudge===v.id)spectMood(sp,20,'😈',_T('Good riddance!'));break}
      case 'pot':spectMood(sp,info.p===fav?10:5+(T==='cf'?4:0),info.p===fav?'👏':'🏺','');break;
      case 'topple':spectMood(sp,10,'😮',_T('Timber!'));break;
      case 'beast':spectMood(sp,info.p===fav?14:T==='hunt'?8:5,info.p===fav?'🎉':'👏',T==='hunt'?_T('What a kill!'):'');break;
      case 'boss':spectMood(sp,blood?20:8,'😱',info.n==='Tholo'?_T('Tholo! Tholo!'):_T('The Emperor!'));break;
      case 'truce':spectMood(sp,T==='loyalty'?-3:-12,'😠',_T('Cowards!'));if(!fav||info.a===fav||info.b===fav){}break; // nobody paid to watch friendship
      case 'tunnel':spectMood(sp,T==='survival'?4:-5,T==='survival'?'🙂':'🥱',T==='survival'?'':_T('Come back and fight!'));break;
      case 'nohit':spectMood(sp,blood?-10:-5,'🥱',pickOne(SHOUTS.bored));break;
      case 'mf':spectMood(sp,info.p===fav?10:5,'👏','');break;
      case 'buy':if(T==='coin')spectMood(sp,info.p===fav?8:3,info.p===fav?'🤑':null,'');break;
      case 'gift':if(T==='loyalty')spectMood(sp,6,'🥹','');break;
      case 'spear':if(info.s===sp)break;spectMood(sp,-35,'😡',_T('Murderer!'));sp.grudge=info.p.id;if(fav===info.p&&sp.temper!=='loyal'){sp.fav=null;slog(_T`<b>${esc(sp.name)}</b> wants nothing more to do with ${esc(info.p.name)}.`,'big')}break;
    }
    // allegiance is earned: a big play wins over neutrals whose taste it suits, and cowardice costs fickle fans
    if(!sp.human&&sp.fav==null&&!sp.gone){
      const act=info.att||info.killer||info.p;const TASTE_OF={hit:'aggression',elim:'aggression',pot:'cf',beast:'hunt',topple:'cf',mf:'cf',buy:'coin',gift:'loyalty'};
      if(act&&act.cls&&!act.spect&&act.alive&&(TASTE_OF[kind]===T||(T==='underdog'&&(kind==='hit'||kind==='elim')&&perfScore(act)<=Math.min(...activePlayers().map(perfScore))))&&rand()<.45){
        sp.fav=act.id;sp.favCls=act.cls;spectMood(sp,10,'🎉',pickOne(SHOUTS.fav));slog(_T`<b>${esc(sp.name)}</b> is won over by ${esc(act.name)}${kind==='beast'?_T("'s kill"):kind==='pot'?_T("'s showmanship"):''}.`,'big')}}
    if(!sp.human&&fav&&(kind==='truce'&&(info.a===fav||info.b===fav)||kind==='tunnel'&&info.p===fav)&&sp.temper!=='loyal'&&rand()<(sp.temper==='fickle'?.4:.15)){
      sp.fav=null;slog(_T`<b>${esc(sp.name)}</b> turns their back on ${esc(fav.name)}. Nobody paid to watch ${kind==='truce'?_T('friendship'):_T('hiding')}.`)}
  }
}
// rulebook: every spectator in a gladiator's section is worth 1 CF to that gladiator at the start of their resolve phase
/* CHEER_CAP — most CF one section cheer can pay per Resolve when more than 8 are seated. TWEAK: the 3. */
const CHEER_CAP=3;
/* sectionCheer — Resolve: the spectators in a player's section cheer them for CF — 1 each up to 8 seated, otherwise a share of 8 (fractions carry over), capped at CHEER_CAP. */
function sectionCheer(player){
  if(!S.spect.length||!player.alive||S.exhib||S.passive)return; // exhibition stands earn nobody CF
  const si=secOf(player);const k=S.spect.filter(s=>!s.gone&&s.sec===si).length;
  if(k&&cfAllowed()){
    // Fate ranges assume the rulebook's dozen-or-fewer crowd. A big house cheers LOUDER, not richer:
    // cheer CF is scaled by 8/attendance once more than 8 are seated, so a 48-crowd event still scores like the printed game.
    // v0.26: exact share-of-house scaling (fractions carry over turn to turn, no forced minimum of 1)
    // and a hard ceiling of 3 CF per resolve, so a stand packed with one gladiator's fans can't mint freedom.
    const raw=S.attendance||S.spect.length,att=Math.max(8,raw); // ≤8 seated = the printed rule exactly (1 CF per fan in the section, no cap)
    const A=S.cheerAcc||(S.cheerAcc={});A[player.id]=(A[player.id]||0)+k*8/att;let gain=Math.floor(A[player.id]+1e-9);A[player.id]-=gain;
    if(raw>8&&gain>CHEER_CAP){gain=CHEER_CAP;A[player.id]=0}
    if(!gain){log(_T`${k} spectator${k>1?'s':''} in ${SECTIONS[si].n} cheer for ${nm(player)} — a thin share of a crowd of ${att}; the favor builds (${Math.round(A[player.id]*100)}% of a CF).`);return}
    cfWhy(_T('section cheers'));player.cf+=gain;stat(player,'spectCF',gain);
    log(_T`${k} spectator${k>1?'s':''} in ${SECTIONS[si].n} cheer for ${nm(player)} (${cfAmt87('+'+(gain))}${gain<k?_T`, scaled for a crowd of ${att}${gain===CHEER_CAP?', capped':''}`:''}).`);fx(player.r,player.c,_T`+${gain} CF`,'#f0cf7d')}
}
/* spearTargets — spectators a player may spear (3 CF, once per event, only stands facing their quadrant). */
function spearTargets(player){
  if(S.exhib||S.passive)return []; // nobody spears a colleague at an exhibition
  if(player.spearUsed||!S.spect.length||!cfAllowed()||player.cf<3)return [];const q=quadOf(player);if(!q)return [];
  return S.spect.filter(s=>!s.gone&&SECTIONS[s.sec].q===q);
}
/* doSpear — throws the spear: 2 hit dice, any hit carries the spectator out (and the stands remember). */
async function doSpear(player,spect){
  cfWhy(_T('spearing a spectator'));player.cf-=3;player.spearUsed=true;const h=rollHits(2);
  if(cnt(h)){spect.gone=true;spect.goneBy=player.name;log(_T`${nm(player)} hurls a spear into ${SECTIONS[spect.sec].n} ${diceHtml(h)}: <b>${esc(spect.name)}</b> is carried out of the arena!`,'big');slog(_T`<b>${esc(spect.name)}</b> is speared by ${esc(player.name)} and carried out of the arena. The stands will remember.`,'big');duoSay(_T('front row'));crowdReact('spear',{p:player,s:spect});stat(player,'spear')}
  else{log(_T`${nm(player)} hurls a spear into ${SECTIONS[spect.sec].n} ${diceHtml(h)} and misses ${esc(spect.name)}.`);slog(_T`${esc(player.name)}'s spear misses <b>${esc(spect.name)}</b> by a hand's width.`);crowdReact('spear',{p:player,s:null})}
}
/* humanSpear — the human's spear window: pick a spectator in reach. */
async function humanSpear(player){
  const t=spearTargets(player);if(!t.length)return;
  const i=await modal(_T('Spear a spectator'),`<p>${_T`${cfAmt87(3)}, once per event. Roll 2 hit dice; 1 hit removes the spectator. You can only reach spectators whose section faces your quadrant (Q${quadOf(player)}). Every other spectator will hate you for it.`}</p>`,t.map((s,i)=>({label:`${s.name}${s.human?_T(' (the human spectator)'):''}`,sub:_T`${SECTIONS[s.sec].n} · ${SPECT_TASTES[s.taste][0]} fan · ${cfAmt87(s.cf)} · ${moodEmo(s.mood)}${s.fav!=null?' · backs '+S.players[s.fav].name:''}`,value:i})).concat([{label:_T('Cancel'),value:null}]));
  if(i==null)return;await doSpear(player,t[i]);
}
/* ---- turn rotation upkeep: spectators earn 1 CF, then may spend it (p.35) ---- */
async function spectatorsAct(){
  const sp=S.spect.filter(s=>!s.gone);if(!sp.length)return;
  if(S.exhib){ // exhibition: gladiators in the stands only talk — no stones, no offerings, no CF
    if(rand()<.45){const s2=pickOne(sp);const act=activePlayers();if(act.length){const tgt=pickOne(act);const good=perfScore?perfScore(tgt)>=0.5*Math.max(...act.map(x=>perfScore(x)))||rand()<.4:rand()<.5;
      slog(`<b>${esc(s2.name)}</b> <span class="rc-sub">(${esc(s2.glad?s2.glad.ludus:'')})</span> ${_T`on ${esc(tgt.name)}: “${pickOne(EXHIB_TALK[good?'good':'bad'])}”`}`);spectMood(s2,good?4:-3,good?'👏':'🙄')}}
    return}
  if(S.passive){ // v0.21: the watching crowd of a race or a sea-fight — voices only
    const act=activePlayers();if(act.length&&rand()<.6){const s2=pickOne(sp);const tgt=pickOne(act);const good=rand()<.55;
      const line=pickOne(PASSIVE_TALK[good?'good':'bad']).replace('%',tgt.name);
      slog(_T`<b>${esc(s2.name)}</b> on ${esc(tgt.name)}: “${esc(line)}”`);spectMood(s2,good?8:-8,good?pickOne(['👏','📣','🎉']):pickOne(['🙄','😠','👎']),line)}
    return}
  for(const s of sp)s.cf++;
  // boredom: a rotation without blood sours the stands; favorites are re-judged
  const quiet=S.rotation-(S.lastDmgRot??S.rotation);if(quiet>=2)crowdReact('nohit');
  for(const s of sp){if(s.human)continue;const cur=s.fav!=null?S.players[s.fav]:null;
    if(cur&&(!cur.alive||cur.exited)){s.fav=null;if(s.temper==='loyal')spectMood(s,-8,null)}
    if(s.fav==null){ // the unconvinced watch, and are slowly won over by whoever fights their kind of fight
      const f=pickFavorite(s);const pl=f!=null?S.players[f]:null;
      if(pl&&(s.taste==='underdog'?rand()<.4:styleOf(pl)[s.taste]>=52&&rand()<.35)){const off=s.favCls&&!S.players.some(x=>x.cls===s.favCls);s.fav=f;s.favCls=pl.cls;slog(_T`<b>${esc(s.name)}</b> ${off?_T`sets aside their old colors and`:_T('has seen enough:')} back${off?'':'s'} ${esc(pl.name)} now.`)}}
    else if(s.temper==='fickle'||(s.temper!=='loyal'&&rand()<.15*crowdA())){const f=pickFavorite(s);if(f!=null&&f!==s.fav&&styleOf(S.players[f])[s.taste]>styleOf(S.players[s.fav])[s.taste]+12){slog(_T`<b>${esc(s.name)}</b> switches allegiance from ${esc(S.players[s.fav].name)} to ${esc(S.players[f].name)}.`);s.fav=f;s.favCls=S.players[f].cls;log(_T`${esc(s.name)} switches allegiance to ${nm(S.players[f])}.`,'thought')}}
    s.mood=Math.round(s.mood*0.9);}
  const act=activePlayers();
  if(act.length<=2){if(!S.spectLocked){S.spectLocked=1;log(_T('With two gladiators or fewer left, the spectators can no longer spend their CF.'))}return}
  const G=S;
  // the human spectator acts first
  const me=sp.find(s=>s.human);if(me)await humanSpectatorTurn(me);if(G!==S||S.over)return;
  // chant for Tholo: at least one spectator seated in every quadrant, each paying 3 CF
  if(!bossSpent(_T('Tholo'))&&!EV().noBoss&&!EV().noTholo&&!isChariot()&&!isNaum()){
    const payers={};for(const s of sp)if(!s.human&&s.cf>=3){const q=SECTIONS[s.sec].q;if(!payers[q]||s.cf>payers[q].cf)payers[q]=s}
    const want=sp.reduce((a,s)=>a+(s.temper==='bloodthirsty'?2:0)+(s.mood<-25?1:0),0)/sp.length;
    if(Object.keys(payers).length===4&&rand()<(0.12+want*0.25+(quiet>=2?0.15:0))*crowdA()){
      for(const s of Object.values(payers)){s.cf-=3;emote(s,'📣',_T('Tholo!'))}
      log(_T`Spectators in every quadrant (${Object.values(payers).map(s=>esc(s.name)).join(', ')}) pay ${cfAmt87(3)} each and chant “Tholo! Tholo!”`,'big');slog(_T`<b>${Object.values(payers).map(s=>esc(s.name)).join(', ')}</b> pay ${cfAmt87(3)} each and chant for Tholo.`,'big');spawnNPC('tholo',_T('Tholo'),S.ri<2?[6,6]:null);crowdReact('boss',{n:'Tholo'});return}
  }
  for(const s of shuffle(sp.filter(x=>!x.human))){
    if(G!==S||S.over)return;
    const q=SECTIONS[s.sec].q;const inQ=activePlayers().filter(p=>!p.underground&&quadOf(p)===q);
    const fav=s.fav!=null?S.players[s.fav]:null;const grudge=s.grudge!=null?S.players[s.grudge]:null;
    const thrift=s.temper==='miser'?4:0;
    // offering to a favorite in reach
    if(fav&&inQ.includes(fav)&&s.cf>=8+thrift&&(s.temper==='generous'||s.mood>35)&&rand()<(s.temper==='generous'?.7:.35)*crowdA()){
      s.cf-=8;const off=drawOffer();fav.items.push(mkOffer(off));stat(fav,'spectOffers');stat(fav,'spectVal',OFFER_VAL[off]||4);emote(s,'🎁',_T('For you!'));log(_T`${esc(s.name)} (${SECTIONS[s.sec].n}) throws ${nm(fav)} an offering: <b>${OFFER[off].n}</b> (${OFFER[off].s}).`);slog(_T`<b>${esc(s.name)}</b> pays ${cfAmt87(8)} to throw ${esc(fav.name)} an offering: ${OFFER[off].n}.`,'big');continue}
    // a stone at the one they hate (or at whoever is beating their favorite)
    const tgt=grudge&&inQ.includes(grudge)?grudge:inQ.filter(p=>p!==fav).sort((a,b)=>(s.taste==='underdog'?perfScore(b)-perfScore(a):b.cf-a.cf))[0];
    const anger=s.mood<-20||(grudge&&tgt===grudge);
    if(tgt&&tgt!==fav&&s.cf>=2+thrift&&(anger||s.temper==='hothead'||s.temper==='bloodthirsty'||s.trouble)&&rand()<(s.temper==='hothead'?.7:anger?.5:.25)*crowdA()*(s.trouble?1.6:1)){
      s.cf-=2;await spectStone(s,tgt);continue}
    // move to the section facing their grudge or favorite
    const want=grudge&&grudge.alive&&!grudge.exited?grudge:fav;const wq=want?quadOf(want):0;
    if(want&&wq&&wq!==q&&s.cf>=3+thrift+2&&rand()<(s.temper==='fickle'?.6:s.temper==='hothead'?.4:.2)*crowdA()){
      const opts=SECTIONS.map((x,i)=>i).filter(i=>SECTIONS[i].q===wq);const to=opts.includes(secOf(want))?secOf(want):pickOne(opts);
      s.cf-=3;log(_T`${esc(s.name)} pays ${cfAmt87(3)} to move from ${SECTIONS[s.sec].n} to ${SECTIONS[to].n}${want===grudge?_T`, to get closer to ${nm(want)}`:_T`, to cheer ${nm(want)}`}.`);slog(_T`<b>${esc(s.name)}</b> moves to ${SECTIONS[to].n} (${want===grudge?_T('hunting'):_T('following')} ${esc(want.name)}).`);s.sec=to;emote(s,'🚶','');}
  }
}
/* spectStone — a spectator's stone: 1 hit die, 1 damage to a rolled location; a stone that finishes a gladiator collects all their CF. */
async function spectStone(spect,target){
  S.stonesThrown=(S.stonesThrown||0)+1;
  const h=rollHits(1);const cfBefore=target.cf;emote(spect,'🪨',pickOne(SHOUTS.angry));const who=spect.human?_T('You hurl'):_T`${esc(spect.name)} (${SECTIONS[spect.sec].n}) hurls`;
  if(h[0]){await hurt(target,rollLoc(target),1,{type:'env',spect:spect},_T`${who} a stone at ${target.name} ${diceHtml(h)}`);slog(_T`<b>${esc(spect.name)}</b> pays ${cfAmt87(2)} and hits ${esc(target.name)} with a stone.`);
    if(!target.alive){spect.cf+=Math.max(0,cfBefore);log(_T`${spect.human?_T('Your'):esc(spect.name)+"'s"} stone finishes ${nm(target)}. ${spect.human?_T('You collect'):_T('The spectator collects')} all ${Math.max(0,cfBefore)} of their Crowd Favor.`,'big');slog(_T`<b>${esc(spect.name)}</b>'s stone finishes ${esc(target.name)} — they collect all ${Math.max(0,cfBefore)} of their CF.`,'big')}}
  else{log(_T`${who} a stone at ${nm(target)} ${diceHtml(h)} and misses.`);slog(_T`<b>${esc(spect.name)}</b> hurls a stone at ${esc(target.name)} and misses.`)}
}
/* humanSpectatorTurn — the human spectator's upkeep window: stone, offering, change section, chant for Tholo, or watch. One action per upkeep. */
async function humanSpectatorTurn(me){
  if(S&&S.snap)return;
  if(me.fav===undefined&&typeof spectChooseFav==='function')await spectChooseFav(me);
  for(;;){
    if(!S||S.over)return;
    const q=SECTIONS[me.sec].q;const inQ=activePlayers().filter(p=>!p.underground&&quadOf(p)===q);const foes=inQ.filter(p=>p.id!==me.fav); // v0.41: never at the one you cheer for
    const tholoOK=!bossSpent(_T('Tholo'))&&!EV().noBoss&&!EV().noTholo&&[1,2,3,4].every(k=>S.spect.some(s=>!s.gone&&SECTIONS[s.sec].q===k&&s.cf>=3));
    const opts=[
      ...foes.map(p=>({label:_T`Throw a stone at ${p.name}`,sub:_T`${cfAmt87(2)} · 1 hit die, 1 damage to a rolled location${p.cf>0?_T` · finish them and you take their ${cfAmt87(p.cf)}`:''}`,value:'stone:'+p.id,disabled:me.cf<2})),
      ...inQ.map(p=>({label:_T`Throw an offering to ${p.name}`,sub:_T`${cfAmt87(8)} · a random offering from the Blessings bag`,value:'offer:'+p.id,disabled:me.cf<8})),
      {label:_T('Change section'),sub:_T`${cfAmt87(3)} · move to another stand`,value:'move',disabled:me.cf<3},
      {label:_T('Chant “Tholo!”'),sub:tholoOK?_T`every quadrant has a spectator with ${cfAmt87(3)}: each pays 3`:bossSpent(_T('Tholo'))?_T('Tholo has already entered this event — once per event'):_T`needs a spectator with ${cfAmt87(3)} in every quadrant`,value:'tholo',disabled:!tholoOK},
      {label:_T('Watch this rotation'),value:'pass',primary:1}];
    const v=await modal(_T`Spectator upkeep · you have ${cfAmt87(me.cf)}`,`<p>${_T`${me.fav!=null&&S.players[me.fav]?_T`📣 You cheer for <b>${esc(S.players[me.fav].name)}</b>. `:''}<b>One action per upkeep.</b> You sit in <b>${SECTIONS[me.sec].n}</b> (Q${q}), the section of ${secPlayer(me.sec)?nm(secPlayer(me.sec)):_T('no gladiator')}. You can only reach gladiators standing in Q${q}: ${inQ.length?inQ.map(nm).join(', '):_T('nobody right now')}.`}</p>${hint(_T`Spectators earn ${cfAmt87(1)} per turn rotation. A stone that eliminates a gladiator hands you all of their CF.`)}`,opts);
    if(!v||v==='pass')return;
    if(v.startsWith('stone:')){me.cf-=2;const q9=S.players[+v.slice(6)];if(typeof spectHelpCheck==='function')spectHelpCheck('stone',q9);await spectStone(me,q9);render();return}
    if(v.startsWith('offer:')){me.cf-=8;const p=S.players[+v.slice(6)];if(typeof spectHelpCheck==='function')spectHelpCheck('offer',p);const off=drawOffer();p.items.push(mkOffer(off));stat(p,'spectOffers');stat(p,'spectVal',OFFER_VAL[off]||4);log(_T`You throw ${nm(p)} an offering from the stands: <b>${OFFER[off].n}</b> (${OFFER[off].s}).`);render();return}
    if(v==='move'){const to=typeof seatMapPick==='function'?await seatMapPick(_T`Change section · ${cfAmt87(3)}`,_T`Pick a new stand. Its gladiator earns ${cfAmt87(1)} from you every turn.`,{disabled:i=>i===me.sec}):null;if(to!=null){me.cf-=3;me.sec=to;log(_T`You move to ${SECTIONS[to].n}.`);render();return}continue}
    if(v==='tholo'){const payers={};for(const s of S.spect)if(!s.gone&&s.cf>=3){const k=SECTIONS[s.sec].q;if(!payers[k]||s.human)payers[k]=s}for(const s of Object.values(payers))s.cf-=3;log(_T('The stands take up your chant: “Tholo! Tholo!”'),'big');spawnNPC('tholo',_T('Tholo'),S.ri<2?[6,6]:null);crowdReact('boss',{n:'Tholo'});render();return}
  }
}
/* crowdPanelHTML — the crowd panel: every spectator (face, CF, taste, favorite, grudge, bet) and the stands log, both foldable. */
function crowdPanelHTML(){
  if(!S||!S.spect||!S.spect.length)return '';
  const rows=S.spect.map(s=>{const f=s.fav!=null?S.players[s.fav]:null;const g=s.grudge!=null?S.players[s.grudge]:null;
    return `<div class="crow ${s.human?'you':''} ${s.gone?'dead':''}" title="${esc(`${s.name} · ${SPECT_TASTES[s.taste][1]} · ${SPECT_TEMPERS[s.temper][0]}: ${SPECT_TEMPERS[s.temper][1]}`)}" style="${s.gone?'opacity:.45;text-decoration:line-through':''}"><span class="emo">${s.gone?'✝':moodEmo(s.mood)}</span><span>${specFaceSVG(s.look,(s.fav!=null||s.favCls)?allegCol(s):null,(CROWD_CACHE.find(x=>x.id===s.rid)||{}).city)}<span class="sec" style="--sc:${allegCol(s)}" title="${_T`wearing ${s.fav!=null&&S.players[s.fav]?S.players[s.fav].name+_T("'s colors"):s.favCls&&CLASSES[s.favCls]?CLASSES[s.favCls].name+' colors':_T('undyed wool')}`}"></span>${esc(s.name)}${s.visits?`<span style="color:var(--dim);font-size:10.5px"> · ${s.visits+1}×</span>`:''}</span><span class="odds">${cfAmt87(s.cf)}</span>
      <span class="sub">${s.gone?_T('carried out of the arena'):_T`${SPECT_TASTES[s.taste][0]} fan · ${SPECT_TEMPERS[s.temper][0].toLowerCase()} · Q${SECTIONS[s.sec].q}${f?` · backs <b style="color:${f.color}">${esc(f.name)}</b>`:''}${g&&g.alive?` · hates <b style="color:${g.color}">${esc(g.name)}</b>`:''}${s.bet?_T` · bet ${cfAmt87(s.bet.amt)} on ${esc(S.players[s.bet.pid].name)}`:''}`}</span></div>`}).join('');
  const top=S.over?[]:oddsTable().slice(0,3);
  const feed=(S.spectLog||[]).slice(-32).reverse().map(e=>`<div class="${e.cls||''}"><span style="color:var(--dim)">R${e.r} · </span>${e.html}</div>`).join('');
  /* v0.45: both halves fold away (the bookmaker lives in 💰 Wagers on the top bar now) */
  const sh=k=>collShut(k);
  return `<h3 class="collhd ${sh('stands')?'coll-shut':''}" data-coll="stands" role="button" tabindex="0"><span class="collcar">▾</span> ${_T`The stands · ${S.spect.filter(s=>!s.gone).length}K spectators`}</h3>${sh('stands')?'':`<div class="crowd" style="max-height:230px;overflow-y:auto">${rows}</div>`}${feed?`<div class="sect collhd ${sh('slog')?'coll-shut':''}" data-coll="slog" role="button" tabindex="0"><span class="collcar">▾</span> ${_T`Stands log`}</div>${sh('slog')?'':`<div class="slog">${feed}</div>`}`:''}`;
}
/* v0.45 collapsible panels: the stands, the stands log and the arena log (remembered in this browser) */
let PANEL_COLL={};try{PANEL_COLL=JSON.parse(localStorage.getItem('flavius_coll')||'{}')||{}}catch(e){PANEL_COLL={}}
/* collShut — whether a foldable panel is shut. */
function collShut(key){return !!PANEL_COLL[key]}
/* collApply — applies the fold state to the arena log bar. */
function collApply(){const lb=document.querySelector('.logbar');if(lb){lb.classList.toggle('coll-shut',!!PANEL_COLL.alog);const h=lb.querySelector('[data-coll="alog"]');if(h)h.classList.toggle('coll-shut',!!PANEL_COLL.alog)}}
/* collToggle — folds or unfolds a panel (localStorage flavius_coll) and redraws it. */
function collToggle(key){PANEL_COLL[key]=!PANEL_COLL[key];try{localStorage.setItem('flavius_coll',JSON.stringify(PANEL_COLL))}catch(e){}collApply();if(key!=='alog'&&S){const cp=$('#crowdPanel');if(cp&&typeof crowdPanelHTML==='function')cp.innerHTML=crowdPanelHTML()}}
/* clicking a foldable header toggles it. */
document.addEventListener('click',e=>{const h=e.target.closest('.collhd[data-coll]');if(h){collToggle(h.dataset.coll)}});
/* Enter / Space on a foldable header toggles it. */
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest&&e.target.closest('.collhd[data-coll]')){e.preventDefault();collToggle(e.target.closest('.collhd').dataset.coll)}});
setTimeout(collApply,0);

/* =====================================================================
   WAGERS: the bookmaker's odds, your purse, gladiators betting on themselves and the crowd's bets.
   ===================================================================== */
/* HOUSE — the bookmaker's margin on win odds. TWEAK: the 1.12. */
const HOUSE=1.12;
/* fmtOdds — odds as "2.5×". */
const fmtOdds=o=>(Math.round(o*10)/10).toFixed(1)+'×';
// a quick read of each gladiator's chances from their body, gear, favor and reputation
function betStrength(player){
  if(!player.alive||player.exited)return 0;
  const hp=LOCS.reduce((s,l)=>s+Math.max(0,player.hp[l]),0),ap=LOCS.reduce((s,l)=>s+player.ap[l],0);
  const w=['R','L'].reduce((s,a)=>s+(armAlive(player,a)?wScore(player['w'+a]):0),0);
  const lethal=Math.min(player.hp.head+player.ap.head,player.hp.chest+player.ap.chest);
  return hp*0.9+ap*0.8+w*3.2+lethal*1.2+player.cf*0.25+player.coin*0.15+player.items.length*0.8+(player.diff==='hard'&&player.cpu?4:player.diff==='easy'&&player.cpu?-3:0)+(player.rating?(player.rating-60)*0.25:0);
}
/* winProbs — win chances per gladiator or team: a softmax of betStrength (teams by their summed strength). TWEAK: the temperature T = 11. */
function winProbs(){
  const act=activePlayers();const ev=EV();if(!act.length)return [];
  const groups={};for(const p of act){const k=(ev.teams||ev.coop)?p.team:'p'+p.id;(groups[k]=groups[k]||[]).push(p)}
  const G=Object.entries(groups).map(([k,ps])=>({k,ps,s:ps.reduce((a,p)=>a+betStrength(p),0)/(ev.teams?Math.sqrt(ps.length):1)}));
  const mx=Math.max(...G.map(g=>g.s));const T=11;const ex=G.map(g=>Math.exp((g.s-mx)/T));const z=ex.reduce((a,b)=>a+b,0);
  return G.map((g,i)=>({...g,pr:ex[i]/z}));
}
/* oddsTable — the bookmaker's board: each gladiator/team with its chance and odds (1.05–40×), favorites first. */
function oddsTable(force){
  if(!S||!S.players||(S.phase==='setup'&&!force))return [];
  const ev=EV();
  return winProbs().map(g=>({key:g.k,p:g.ps[0],ps:g.ps,label:(ev.teams||ev.coop)&&g.ps.length>1?_T`Team ${g.ps[0].team} (${g.ps.map(p=>p.name).join(', ')})`:g.ps[0].name,pr:g.pr,odds:Math.max(1.05,Math.min(40,1/(g.pr*HOUSE)))})).sort((a,b)=>a.odds-b.odds);
}
/* wagersOpen — the book is open while 3+ gladiators stand and it is not the last round. */
const wagersOpen=()=>S&&!S.over&&S.phase!=='setup'&&activePlayers().length>2&&!(S.ri>0&&S.ri>=EV().rounds.length-1);
/* Since v0.7 there is no separate purse: every wager is bankrolled by a lanista.
   Watching a bout from Manager mode bets that career's treasury; anywhere else, the ACTIVE lanista's (set in Manager mode). */
async function getPurse(){
  if(S&&S.mgrCtx&&typeof mgrPurse==='function')return mgrPurse();
  const m=typeof activeMgr==='function'?await activeMgr():null;
  if(!m)return null; // no active lanista: the bookmaker won't take your coin
  return {coin:m.coin,won:m.betWon||0,lost:m.betLost||0,bets:m.betCount||0,history:m.betHistory||[],name:m.name,ludus:m.ludus};
}
/* setPurse — writes the purse back to the Manager career that bankrolls it. */
async function setPurse(v){
  if(S&&S.mgrCtx&&typeof mgrPurseSet==='function')return mgrPurseSet(v);
  if(typeof applyActivePurse==='function')await applyActivePurse(v);
}
// pick which lanista's treasury bankrolls your wagers — without leaving the bookmaker's window
async function chooseBanker(){
  const careers=(await Store.list('mgrCareers').catch(()=>[])).filter(c=>!c.dead).sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));
  const cur=typeof activeCid==='function'?await activeCid():null;
  const opts=[
    ...careers.slice(0,5).map(c=>({label:_T`${cur===c.id?'★ ':''}Bank with ${c.name}`,sub:_T`${c.ludus} · season ${c.season}, week ${wkOf(c.week)}${c.coin!=null?_T` · ${coinAmt87(c.coin)}`:''}${cur===c.id?' · current':''}`,value:'use:'+c.id,disabled:cur===c.id})),
    {label:_T('Quick-create a lanista'),sub:_T`a random gambler with ${coinAmt87(40)}, ready to bet now — shape them in Manager mode any time`,value:'quick',primary:!careers.length},
    {label:_T('Open Manager mode'),sub:_T('create or take over a ludus properly'),value:'mgr'},
    {label:_T('Cancel'),value:0}];
  const v=await modal(_T('Who holds the coin?'),`<p>${_T`The bookmaker only deals with a <b>lanista</b>: every wager comes out of a manager career's treasury, and every payout goes back into it — here and in Manager mode.`}</p>`,opts);
  if(!v)return false;
  if(v==='mgr'){openManager();return false}
  if(v==='quick'){await quickLanista();return true}
  if(v.startsWith('use:')){await setActiveCareer(v.slice(4));return true}
  return false;
}
/* v0.21 THE BOOKIE'S HAVEN: a ticker of money moving through the betting network — odds drifting since the book opened,
   the crowd's own wagers, the house's handle. Cosmetic: the crowd's slips never touch the rules. */
function wagerHavenHTML(tbl,purse){
  const mine=betlogLoad().filter(r=>r.ev===S.seed);const open=mine.filter(r=>r.status==='open');
  const heat={};for(const r of open)if(r.cur!=='CF')heat[r.on]=(heat[r.on]||0)+r.stake;const hot=Object.entries(heat).sort((a,b)=>b[1]-a[1])[0];
  const crowd={};for(const r of open)if(r.cur==='CF')crowd[r.on]=(crowd[r.on]||0)+r.stake;const pop=Object.entries(crowd).sort((a,b)=>b[1]-a[1])[0];
  const handle=mine.filter(r=>r.cur!=='CF').reduce((a,r)=>a+r.stake,0);const cfHandle=mine.filter(r=>r.cur==='CF').reduce((a,r)=>a+r.stake,0);
  const fav=tbl.slice().sort((a,b)=>a.odds-b.odds)[0];const long=tbl.slice().sort((a,b)=>b.odds-a.odds)[0];
  return `<div class="haven"><div class="havenhd">${_T`<span>🏛 THE BOOKIE'S HAVEN</span>`}<span class="rc-sub">${_T`under the arches of ${esc(LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:_T('the arena'))} · every slip below was really laid`}</span></div>
    <div class="havengrid"><div>${_T`<i>Favorite</i>`}<b style="color:${fav?fav.p.color:''}">${fav?esc(fav.label):'—'}</b><span>${fav?fmtOdds(fav.odds):''}</span></div><div>${_T`<i>Longshot</i>`}<b style="color:${long?long.p.color:''}">${long?esc(long.label):'—'}</b><span>${long?fmtOdds(long.odds):''}</span></div><div>${_T`<i>Smart money</i><b>${hot?esc(hot[0]):'—'}</b><span>${hot?hot[1]+_T(' coin open'):_T('no coin laid yet')}</span>`}</div><div>${_T`<i>The crowd's pick</i><b>${pop?esc(pop[0]):'—'}</b><span>${pop?pop[1]+_T(' CF of opening slips'):_T('an empty house')}</span>`}</div><div>${_T`<i>Today's handle</i><b>${coinAmt87(handle)}</b><span>+ ${cfAmt87(cfHandle)} from the stands · ${mine.length} slips</span>`}</div></div>
    <div class="sect" style="margin:8px 0 2px;color:#9fe0a8">${_T`📈 The exchange`} <span class="rc-sub">${_T`orders across the empire, newest first`}</span></div>
    ${exchangeHTML(null,24)}</div>`}
/* v0.46: wagering belongs to Manager mode — a lanista's treasury, a lanista's risk. Outside it the bookmaker is closed
   (a gladiator can still wager their own match coin on themselves, from the action bar). */
const bookOpen=()=>!!(S&&(S.mgrCtx||S.specCtx)&&!S.over);
/* openWagers — the Wagers window (Manager bouts only): the Bookie's Haven, win and first-to-fall odds, and your stake. */
async function openWagers(){if(!bookOpen()&&!(typeof MGR!=='undefined'&&MGR.world&&document.getElementById('mgrBody'))){if(typeof mToast==='function')mToast(_T('💰 Wagers live in Manager mode — a lanista bets from the treasury. (In any bout a gladiator can still wager their own coin on themselves.)'));return}
  if(!S||S.phase==='setup'){if(!modalBusy())modal(_T('Wagers'),`<p>${_T`Start an event first. Once the horns sound, the bookmaker posts odds on every gladiator until the final round (or until only two remain).`}</p>`,[{label:_T('Close'),value:1}]);return}
  if(!$('#modal').hidden)return;
  for(;;){
    const purse=await getPurse();
    if(!purse){if(await chooseBanker())continue;return}
    const tbl=oddsTable();const open=wagersOpen();const bank=Math.max(0,purse.coin);
    const firstOut=!(S.elimOrder||[]).length&&activePlayers().length>2;
    const fo=firstOut?activePlayers().map(p=>{const s=betStrength(p);return {p,s}}):[];let foT=[];
    if(fo.length){const mn=Math.min(...fo.map(x=>x.s));const ex=fo.map(x=>Math.exp(-(x.s-mn)/6));const z=ex.reduce((a,b)=>a+b,0);foT=fo.map((x,i)=>({p:x.p,odds:Math.max(1.05,Math.min(30,1/((ex[i]/z)*HOUSE)))})).sort((a,b)=>a.odds-b.odds)}
    const mine=(S.bets||[]);
    const body=wagerHavenHTML(tbl,purse)+`<p>${_T`Wagers come out of <b>${esc(purse.name||(S.mgrCtx&&S.mgrCtx.name)||_T('your lanista'))}'s treasury</b>${purse.ludus?` (${esc(purse.ludus)})`:''} — your active manager career banks every win and loss. Odds are fixed when you bet and paid as stake × odds — less <b>the Emperor's tenth</b> (10% of the profit), and no slip may pay more than ${coinAmt87(500)} (long odds take small stakes). The book closes at the final round or when only two gladiators remain.`}</p>
      <div class="badges"><span class="badge gold">${_T`Treasury ${coinAmt87(purse.coin)}`}</span>${S.mgrCtx?'':`<button class="btn" type="button" data-swapbank style="padding:2px 8px;font-size:12px">${_T`Swap lanista`}</button>`}${purse.bets?`<span class="badge">${_T`Won ${purse.won} · lost ${purse.lost} over ${purse.bets} bets`}</span>`:''}${open?_T('<span class="badge good">Book open</span>'):_T('<span class="badge bad">Book closed</span>')}</div>
      <div class="bslip" style="margin:10px 0"><label class="fl" style="display:flex;gap:6px;align-items:center">${_T`Stake`} <input type="number" id="betStake" min="1" max="${bank}" value="${Math.min(5,Math.max(1,bank))}" class="tin" style="width:6em"></label></div>
      <h4>${_T`Who wins the event`}</h4><table class="tally"><tr><th>${_T`Gladiator`}</th><th>${_T`Chance (bookmaker)`}</th><th>${_T`Odds`}</th><th></th></tr>${tbl.map(o=>`<tr><td><b style="color:${o.p.color}">${esc(o.label)}</b></td><td class="n">${Math.round(o.pr*100)}%</td><td class="n odds">${fmtOdds(o.odds)}</td><td><button class="btn" type="button" data-bet="win|${o.key}|${o.odds.toFixed(2)}" ${open&&bank>0?'':'disabled'}>${_T`Bet`}</button></td></tr>`).join('')}</table>
      ${foT.length?`<h4>${_T`First to fall`}</h4><table class="tally">${foT.map(o=>`<tr><td><b style="color:${o.p.color}">${esc(o.p.name)}</b></td><td class="n odds">${fmtOdds(o.odds)}</td><td><button class="btn" type="button" data-bet="first|${o.p.id}|${o.odds.toFixed(2)}" ${open&&bank>0?'':'disabled'}>${_T`Bet`}</button></td></tr>`).join('')}</table>`:''}
      ${mine.length?`<h4>${_T`Your open wagers`}</h4><div class="items">${mine.map(b=>`<div class="item">${_T`<span>${esc(b.label)}<em>${coinAmt87(b.stake)} at ${fmtOdds(b.odds)} · pays ${betPay(b.stake,b.odds).net} after the tenth</em></span>`}</div>`).join('')}</div>`:''}
      ${S.selfBets&&S.selfBets.length?`<h4>${_T`Gladiators betting on themselves`}</h4><p>${S.selfBets.map(b=>_T`${esc(S.players[b.pid].name)}: ${coinAmt87(b.stake)} at ${fmtOdds(b.odds)}`).join(' · ')}</p>`:''}`;
    const v=await modal(_T('Wagers'),body,[{label:_T('Close'),value:'close'}],{wide:1,xwide:1,onOpen:done=>{$('#mBody').onclick=e=>{const sw=e.target.closest('[data-swapbank]');if(sw){done('swap');return}const b=e.target.closest('[data-bet]');if(!b||b.disabled)return;done('bet|'+b.dataset.bet+'|'+($('#betStake').value||0))}}});
    $('#mBody').onclick=null;
    if(!v||v==='close')return;
    if(v==='swap'){await chooseBanker();continue}
    const [,kind,key,odds,stake0]=v.split('|');const stake=clamp(Math.floor(+stake0||0),0,betMaxStake(+odds,bank));if(!stake)continue;
    const label=kind==='win'?_T`${(tbl.find(o=>o.key===key)||{label:key}).label} wins the event`:_T`${S.players[+key].name} falls first`;
    purse.coin-=stake;await setPurse(purse);const bid=betRec({src:'event',ev:S.seed,dayOff:0,min:840+Math.min(400,(S.turnNo||0)*4)+Math.floor(Math.random()*4),city:LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:'',who:purse.name||_T('You'),kind:'you',on:label,stake,odds:+odds});(S.bets=S.bets||[]).push({kind,key,odds:+odds,stake,label,at:S.turnNo,bid});
    log(_T`You wager ${coinAmt87(stake)} on <b>${esc(label)}</b> at ${fmtOdds(+odds)}.`);render();
  }
}
/* the top-bar Wagers button. */
$('#btnBets').onclick=()=>{if(modalBusy())return;openWagers()};
// gladiators may also slip coin to the bookmaker on themselves; a win pays into their purse (and their Royal Reserve)
const selfWagerRound=()=>!!(S&&(S.mgrCtx||S.specCtx||((S.ri||0)===0&&EV().rounds&&EV().rounds.length>=3))); /* v0.47: in Play Now, only in round one of a three-round event */
const canSelfWager=player=>!player.cpu&&wagersOpen()&&!player.selfBet&&player.coin>=2&&!isChariot()&&selfWagerRound();
/* humanSelfWager — the "Wager on yourself" window: 2/4/6/10 coin at the current odds. */
async function humanSelfWager(player){
  const o=oddsTable().find(x=>x.ps.includes(player));if(!o)return;
  const opts=[2,4,6,10].filter(v=>v<=player.coin).map(v=>({label:coinAmt87(v),sub:_T`pays ${Math.round(v*o.odds)} if ${EV().teams?_T('your team wins'):_T('you win')}`,value:v}));
  const v=await modal(_T('Wager on yourself'),`<p>${_T`The bookmaker offers <b>${fmtOdds(o.odds)}</b> on ${esc(o.label)}. Coin you stake leaves your purse now; if you win the event, the payout is added to your coin (and your Royal Reserve). Once per event.`}</p>`,opts.concat([{label:_T('Cancel'),value:null}]));
  if(!v)return;placeSelfBet(player,v,o.odds);
}
/* placeSelfBet — a gladiator slips coin to the bookmaker on themselves (logged on the exchange). */
function placeSelfBet(player,stake,odds){player.coin-=stake;coinLog(player,-stake,'wagers');player.selfBet={stake,odds};const bid=HEADLESS?null:betRec({src:'event',ev:S.seed,dayOff:0,min:840+Math.min(400,(S.turnNo||0)*4)+Math.floor(Math.random()*4),city:LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:'',who:player.name,kind:'gladiator',on:_T`${player.name} (on themselves)`,stake,odds});(S.selfBets=S.selfBets||[]).push({pid:player.id,stake,odds,bid});log(_T`${nm(player)} slips ${coinAmt87(stake)} to the bookmaker, on ${player.cpu?_T('themselves'):_T('yourself')} at ${fmtOdds(odds)}.`)}
/* cpuSelfWager — a coin-loving CPU with a good chance sometimes bets on itself. TWEAK: pr > 0.34, coin taste > 55, 18%. */
function cpuSelfWager(player){
  if(!player.cpu||player.selfBet||!wagersOpen()||isChariot()||player.coin<6||!selfWagerRound())return;
  const P=pers(player);const o=oddsTable().find(x=>x.ps.includes(player));if(!o)return;
  if(o.pr>0.34&&P.coin>55&&rand()<.18){placeSelfBet(player,Math.min(player.coin-2,2+Math.round(P.coin/25)),o.odds);think(player,_T('My coin is on me.'),'say')}
}
// settle every wager when the event ends (called from gameOver)
async function settleWagers(rows,winnerIds){
  const out=[];
  for(const b of S.selfBets||[]){const p=S.players[b.pid];const won=winnerIds.has(p.id);const pay=won?Math.round(b.stake*b.odds):0;b.won=won;b.paid=pay;if(pay)p.coin+=pay;betSettle(b.bid,won,pay);out.push(_T`${esc(p.name)} bet ${b.stake} on ${p.cpu?_T('themselves'):_T('yourself')}: ${won?_T`<b style="color:var(--gold2)">won ${coinAmt87(pay)}</b>`:_T('lost')}`)}
  if(S.bets&&S.bets.length){const purse=await getPurse();let net=0;
    if(purse){for(const b of S.bets){let won=false;
      if(b.kind==='win'){const ev=EV();won=[...winnerIds].some(id=>{const p=S.players[id];return (ev.teams||ev.coop)?p.team===b.key:'p'+id===b.key})}
      if(b.kind==='first')won=(S.elimOrder||[])[0]&&S.elimOrder[0].id===+b.key;
      const P=betPay(b.stake,b.odds);const pay=won?P.net:0;b.won=won;b.paid=pay;b.tax=P.tax||0;purse.coin+=pay;betSettle(b.bid,won,pay);net+=pay-b.stake;purse.bets=(purse.bets||0)+1;if(won)purse.won=(purse.won||0)+pay-b.stake;else purse.lost=(purse.lost||0)+b.stake;
      purse.history=[...(purse.history||[]).slice(-40),{date:new Date().toISOString().slice(0,10),label:b.label,stake:b.stake,odds:b.odds,pay}];
      out.push(_T`Your wager on ${esc(b.label)} (${b.stake} at ${fmtOdds(b.odds)}): ${won?_T`<b style="color:var(--gold2)">pays ${pay}</b>${P.tax?` <span class="rc-sub">${_T`after the Emperor's tenth (${P.tax})`}</span>`:''}`:_T('lost')}`)}
    await setPurse(purse);S.purseAfter={name:purse.name||'',coin:purse.coin};out.push(_T`<b>Net ${net>=0?'+':''}${net} coin · ${esc(purse.name||'the')} treasury now ${purse.coin}</b>`)}}
  const cb=S.spect.filter(s=>s.bet&&!s.human);
  // the lanista's cut (v0.20): every wager laid on a ROSTERED fighter pays their lanista a small share of the handle — the bookmaker keeps the rest
  {const w0=typeof mgrWorldAny==='function'?mgrWorldAny():null;
   if(w0&&!S.sim){const handle={};for(const s2 of cb)handle[s2.bet.pid]=(handle[s2.bet.pid]||0)+s2.bet.amt;for(const b of S.bets||[])if(b.kind==='win'&&/^p\d+$/.test(b.key))handle[+b.key.slice(1)]=(handle[+b.key.slice(1)]||0)+b.stake;
     const cuts={};for(const [pid,amt] of Object.entries(handle)){const p=S.players[+pid];if(!p||!p.mgrGid)continue;const g=w0.glads.find(x=>x.id===p.mgrGid);const m2=g&&g.contract&&w0.mgrs.find(x=>x.id===g.contract.mgr);if(!m2)continue;
       const cut=Math.max(1,Math.round(amt*0.08));m2.coin+=cut;m2.bookCut=(m2.bookCut||0)+cut;cuts[m2.ludus]=(cuts[m2.ludus]||0)+cut;if(m2.isPlayer&&typeof tnews==='function')tnews(_T`Bookmaker's cut on ${esc(p.name)}: ${coinAmt87('+'+(cut))} (8% of ${amt} wagered).`)}
     if(Object.keys(cuts).length){out.push(_T`The bookmaker pays the lanistae their cut of the handle: ${Object.entries(cuts).map(([l,c])=>`${esc(l)} +${c}`).join(', ')}.`);if(typeof saveWorld==='function'&&typeof MGR!=='undefined'&&MGR.world===w0)saveWorld()}}}
  for(const s2 of cb)betSettle(s2.bet.bid,winnerIds.has(s2.bet.pid),Math.round(s2.bet.amt*s2.bet.odds));
  S.crowdBets={n:cb.length,staked:cb.reduce((a,s)=>a+(s.bet.amt||0),0),winners:cb.filter(s=>winnerIds.has(s.bet.pid)).map(s=>({name:s.name,pay:Math.round(s.bet.amt*s.bet.odds),on:(S.players[s.bet.pid]||{}).name})).sort((a,b)=>b.pay-a.pay),byGlad:S.players.map(p=>({name:p.name,color:p.color,n:cb.filter(s=>s.bet.pid===p.id).length,won:winnerIds.has(p.id)}))};
  if(cb.length){const w=cb.filter(s=>winnerIds.has(s.bet.pid));out.push(_T`The crowd: ${w.length?w.map(s=>_T`${esc(s.name)} collects ${cfAmt87(Math.round(s.bet.amt*s.bet.odds))}`).join(', '):_T('no spectator backed the winner')}${cb.length-w.length?_T`; ${cb.length-w.length} lost their bet`:''}.`)}
  return out;
}

/* ---- after the event: the regulars remember (about 5 events' worth), some quit, some swear revenge ---- */
async function updateCrowdAfterEvent(winnerIds){
  if(!S||!S.spect||!S.spect.length)return;
  const d=new Date().toISOString().slice(0,10),ev=EV().short||EV().n;
  const deaths=(S.elimOrder||[]).length;
  const byId=Object.fromEntries(CROWD_CACHE.map(r=>[r.id,r]));
  const present=new Set();const notes=[];
  // spectators speared today: one or two friends in the pool will remember who threw it
  const speared=S.spect.filter(x=>x.gone&&x.goneBy&&!x.human);
  for(const sp of S.spect){
    if(sp.human||sp.glad)continue; // league fighters in the stands go home to their own ludus
    let r=byId[sp.rid];
    if(!r){r={id:sp.rid,name:sp.name,taste:sp.taste,temper:sp.temper,look:sp.look,visits:0,mem:[],quit:null,grudgeName:null,city:LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:null};CROWD_CACHE.push(r);byId[r.id]=r}
    delete r.isNew;present.add(r.id);r.visits=(r.visits||0)+1;r.mem=(r.mem||[]);
    const fav=sp.fav!=null?S.players[sp.fav]:null;
    if(sp.gone){r.mem.push({d,kind:'speared',who:sp.goneBy||'',note:_T`speared out of the stands by ${sp.goneBy||_T('a gladiator')}`});r.grudgeName=sp.goneBy||r.grudgeName}
    if(fav&&!sp.gone)r.fanOf=fav.name; // their allegiance follows them home — counted across the empire
    if(fav&&winnerIds&&winnerIds.has(fav.id)){r.mem.push({d,kind:'fanwin',who:fav.name,note:_T`saw ${fav.name} win ${ev}`})}
    else if(fav&&!fav.alive){r.mem.push({d,kind:'fanfell',who:fav.name,note:_T`watched ${fav.name} fall`})}
    if(sp.bet&&winnerIds&&winnerIds.has(sp.bet.pid))r.mem.push({d,kind:'betwon',who:'',note:_T('collected a winning bet')});
    // family in the sand: kin watch with different eyes
    if(r.kin){const kp=S.players.find(p2=>p2.name.toLowerCase()===String(r.kin.name||'').toLowerCase());
      if(kp&&!kp.alive&&!kp.exited){r.mem.push({d,kind:'grief',who:kp.name,note:_T`watched their ${r.kin.rel} ${kp.name} die on the sand`});
        if(!r.quit&&!sp.gone){r.quit={reason:_T`mourning their ${r.kin.rel}`,left:3+rnd(4)};notes.push(_T`<b>${esc(r.name)}</b> leaves without a word — their ${esc(r.kin.rel)} died on the sand today`)}}
      else if(kp&&winnerIds&&winnerIds.has(kp.id))r.mem.push({d,kind:'kinwin',who:kp.name,note:_T`their ${r.kin.rel} ${kp.name} took the palm — drinks were bought`})}
    // a friend was speared: they will be back for revenge
    const fr=speared.find(x=>x!==sp);
    if(fr&&!sp.gone&&rand()<(speared.length?0.35:0)){r.mem.push({d,kind:'revenge',who:fr.goneBy,note:_T`their friend ${fr.name} was speared by ${fr.goneBy}`});r.grudgeName=fr.goneBy;notes.push(_T`<b>${esc(r.name)}</b> carries ${esc(fr.name)} out and swears revenge on ${esc(fr.goneBy)}`)}
    // some stop coming: the squeamish over blood, the bloodthirsty over the lack of it
    if(!sp.gone&&!r.quit){
      if(sp.temper!=='bloodthirsty'&&(sp.taste==='survival'||sp.taste==='loyalty')&&deaths>=3&&rand()<.22){r.quit={reason:_T('too much blood'),left:4+rnd(3)};notes.push(_T`<b>${esc(r.name)}</b> goes home pale and won't be back for a while (too much blood)`)}
      else if(sp.temper==='bloodthirsty'&&deaths===0&&rand()<.3){r.quit={reason:_T('not enough blood'),left:2+rnd(3)};notes.push(_T`<b>${esc(r.name)}</b> wants their coin back — no blood at all. They'll skip a few events`)}
    }
    r.mem=r.mem.slice(-5); // memories fade after about five events
    Store.put('crowd',r.id,r).catch(()=>{});
  }
  // regulars who stayed away tick their absence; quitters eventually drift back
  for(const r of CROWD_CACHE){if(present.has(r.id))continue;
    if(r.quit&&--r.quit.left<=0){r.quit=null;r.mem=(r.mem||[]).slice(-4);r.mem.push({d,kind:'return',who:'',note:_T('decided to give the games another chance')});Store.put('crowd',r.id,r).catch(()=>{})}}
  // the pool stays a neighborhood, not a census
  if(CROWD_CACHE.length>160){const cut=[...CROWD_CACHE].sort((a,b)=>(a.visits||0)-(b.visits||0)).slice(0,CROWD_CACHE.length-160); // the empire holds ~160 named regulars
    for(const r of cut){CROWD_CACHE=CROWD_CACHE.filter(x=>x!==r);Store.del('crowd',r.id).catch(()=>{})}}
  if(notes.length)log(_T`The stands empty out. ${notes.join('; ')}.`);
  // ---- the arena's chronicle: this building remembers ----
  try{const A=arenaOf(S.locIdx);const d2=new Date().toISOString().slice(0,10);
    A.events=(A.events||0)+1;A.elims=(A.elims||0)+deaths;A.stones=(A.stones||0)+(S.stonesThrown||0);
    A.omens=A.omens||{};if(S.omen)A.omens[S.omen.k]=(A.omens[S.omen.k]||0)+1;
    const moodAvg=S.spect.length?S.spect.reduce((a,x)=>a+x.mood,0)/S.spect.length:0;
    A.conc=(A.conc||0)+Math.max(0,Math.round(S.spect.length*(1.2+moodAvg/80)+rnd(4))); // happy crowds buy more honeyed wine
    const sp2=S.spect.find(x=>x.gone&&x.goneBy);if(sp2){A.spears=(A.spears||0)+1;A.spearLast={name:sp2.name,by:sp2.goneBy,date:d2}}
    const hotAngry=S.spect.filter(x=>!x.gone&&(x.temper==='hothead'||x.trouble)&&x.mood<-25);
    if(hotAngry.length>=2&&rand()<.4){A.brawls=(A.brawls||0)+1;const [b1,b2]=shuffle(hotAngry);log(_T`A brawl breaks out in the tiers: <b>${esc(b1.name)}</b> and <b>${esc(b2&&b2.name||_T('a stranger'))}</b> are dragged out by the ushers.`);slog(_T`<b>${esc(b1.name)}</b> starts a brawl over a spilled cup. The ushers earn their pay.`,'big')}
    Store.put('arena',A.id,A).catch(()=>{})}catch(e){}
}
/* loads the crowd at start. */
loadCrowd().catch(()=>{});

/* =====================================================================
   FLAVIUS, THE SPONSOR: a small framed window above the A-1 corner where the editor of the games
   reacts to the action in real time — Starfox wingman meets the Doom guy. Toggle in Settings.
   ===================================================================== */
const FLAV={mood:'calm',until:0,line:'',lineUntil:0,t:null};
/* FLAV_PRI — priority of Flavius's moods — a stronger mood is not interrupted by a weaker one. */
const FLAV_PRI={calm:0,bored:1,pleased:1,smug:2,shock:2,facepalm:2,angry:2,laugh:3,cheer:3,weep:3};
/* FLAV_LINES — Flavius's lines by mood (a sponsor can bring their own voice). */
const FLAV_LINES={
  pleased:[_T('Good.'),_T('More of that.'),_T('Acceptable.'),_T('The crowd stirs…')],
  laugh:[_T('HA!'),_T('Delightful!'),_T('Again! Again!'),_T('Ahahaha!')],
  cheer:[_T('MAGNIFICENT!'),_T('Glory to the sand!'),_T('YES!'),_T('A generous applause!')],
  angry:[_T('I did not pay for friendship.'),_T('Fight, curs!'),_T('Boring me is a crime.'),_T('Where is the BLOOD?')],
  facepalm:[_T('Cowardice.'),_T('Sentiment. Ugh.'),_T('Why do I fund this?'),_T('My grandmother hits harder.')],
  shock:[_T('By the gods—!'),_T('My pillars!'),_T('Careful with the masonry!')],
  bored:[_T('Wake me for the blood.'),_T('I have watched paint dry with more nerve.'),_T('Yawn.')],
  smug:[_T('As I arranged.'),_T('Everything in this arena is mine. Including that.'),_T('Predictable. Profitable.')],
  weep:[_T('Magnificent bastard…'),_T('Even I have a heart. Somewhere.'),_T('The sand will remember this one.')],
};
/* flaviusMood — sets Flavius's face for a while and maybe a spoken line (chance say). */
function flaviusMood(mood,dur=2600,say=.4){
  if(HEADLESS||!S||(typeof SETTINGS!=='undefined'&&SETTINGS.flavius===false))return;
  const now=performance.now();
  if(now<FLAV.until&&FLAV_PRI[FLAV.mood]>FLAV_PRI[mood])return;
  FLAV.mood=mood;FLAV.until=now+dur*(SPEED==='fast'?0.6:1);
  if(Math.random()<say){const V=typeof sponsorVoice==='function'?sponsorVoice():FLAV_LINES;FLAV.line=upick(V[mood]||FLAV_LINES[mood]||['…']);FLAV.lineUntil=FLAV.until}else if(FLAV.lineUntil<now)FLAV.line='';
  clearTimeout(FLAV.t);FLAV.t=setTimeout(()=>{try{if(!HEADLESS)draw()}catch(e){}},dur+120);
  try{draw()}catch(e){}
}
/* flaviusReact — how Flavius reacts to each crowd event (hits, eliminations, pots, truces…). Wrapped by 129-v82beasts (a spearing makes him scowl). */
function flaviusReact(kind,info={}){
  if(HEADLESS)return;
  switch(kind){
    case 'hit':if((info.dmg||0)>=4)flaviusMood('cheer',3000,.5);else if((info.dmg||0)>0&&Math.random()<.2)flaviusMood('pleased',1700,.12);break;
    case 'elim':flaviusMood(Math.random()<.5?'laugh':'cheer',4400,.85);break;
    case 'pot':if(Math.random()<.35)flaviusMood(Math.random()<.3?'smug':'pleased',1900,.18);break;
    case 'topple':flaviusMood('shock',2600,.6);break;
    case 'beast':flaviusMood('cheer',3000,.5);break;
    case 'boss':flaviusMood('laugh',4200,.8);break;
    case 'truce':flaviusMood(Math.random()<.3?'smug':'angry',3800,.75);break;
    case 'tunnel':flaviusMood('facepalm',3000,.6);break;
    case 'nohit':flaviusMood(Math.random()<.4?'facepalm':Math.random()<.5?'bored':'angry',3400,.65);break;
    case 'gift':flaviusMood('facepalm',2400,.35);break;
    case 'spear':flaviusMood('laugh',3600,.7);break;
    case 'mf':case 'buy':if(Math.random()<.25)flaviusMood('pleased',1700,.12);break;
  }
}
/* Flavius's portrait, drawable onto ANY 2D context (the arena canvas, or an offscreen one for the
   Thumb of Flavius ritual). mood: calm|bored|pleased|smug|shock|facepalm|angry|laugh|cheer|weep */
function flavFace(c2d,cx,cy,w,h,mood,label=true,sp=null){
  sp=sp||(typeof curSponsor==='function'?curSponsor():null)||{}; // v0.28: the sponsor in the box — Flavius by default
  const E=(x,y,rx,ry)=>{c2d.beginPath();c2d.ellipse(x,y,rx,ry,0,0,Math.PI*2)};
  c2d.save();
  // the box: dark curtain behind a gilt frame
  c2d.fillStyle='#1c1410';c2d.strokeStyle='#c9a458';c2d.lineWidth=2;
  c2d.beginPath();c2d.rect(cx-w/2,cy-h/2,w,h);c2d.fill();c2d.stroke();
  c2d.strokeStyle='rgba(201,164,88,.4)';c2d.lineWidth=1;c2d.strokeRect(cx-w/2+3,cy-h/2+3,w-6,h-6);
  const grd=c2d.createLinearGradient(cx,cy-h/2,cx,cy+h/2);grd.addColorStop(0,sp.bg||'#4a2a52');grd.addColorStop(1,sp.bg2||'#2a1830');
  c2d.fillStyle=grd;c2d.fillRect(cx-w/2+4,cy-h/2+4,w-8,h-8);
  c2d.fillStyle='rgba(245,232,204,.75)';c2d.font=`600 ${Math.max(8,Math.round(TW*0.17))}px IBM Plex Mono, monospace`;c2d.textAlign='center';c2d.textBaseline='middle';
  if(label)c2d.fillText(String(sp.short||sp.name||'FLAVIUS').toUpperCase().slice(0,14),cx,cy+h/2+TW*0.16);
  // the man himself (after the seated-with-sword portrait: laurel, dark beard, purple toga)
  const u=h/11;const fy=cy+u*0.9;
  c2d.fillStyle=sp.robe||'#5a3566';c2d.beginPath();c2d.moveTo(cx-w/2+5,cy+h/2-4);c2d.quadraticCurveTo(cx-u*3.4,fy+u*1.6,cx,fy+u*2.2);c2d.quadraticCurveTo(cx+u*3.4,fy+u*1.6,cx+w/2-5,cy+h/2-4);c2d.closePath();c2d.fill();
  c2d.fillStyle=sp.trim||'#e8dcc0';c2d.beginPath();c2d.moveTo(cx-u*1.4,fy+u*2.4);c2d.quadraticCurveTo(cx,fy+u*1.5,cx+u*1.6,fy+u*2.6);c2d.lineTo(cx+u*1.2,fy+u*3.2);c2d.quadraticCurveTo(cx,fy+u*2.4,cx-u*1.4,fy+u*3);c2d.closePath();c2d.fill(); // toga fold
  const skin=sp.skin||'#e0ac7e',hair=sp.hair||'#2a1c12';
  if(sp.long){c2d.fillStyle=hair;E(cx-u*2.2,fy+u*0.2,u*1.1,u*3);c2d.fill();E(cx+u*2.2,fy+u*0.2,u*1.1,u*3);c2d.fill()} // long hair falls behind
  c2d.fillStyle=skin;E(cx,fy-u*1.2,u*2.5,u*3);c2d.fill(); // head
  c2d.fillStyle=hair;c2d.beginPath();c2d.ellipse(cx,fy-u*3.5,u*2.3,u*1.15,0,Math.PI,0);c2d.fill(); // hair
  {const bd=sp.beard===undefined?'full':sp.beard;if(bd&&bd!=='none'){const bs=bd==='long'?1.6:bd==='short'?0.6:1;c2d.fillStyle=hair;c2d.beginPath();c2d.ellipse(cx,fy+u*0.9,u*1.7*(bd==='short'?0.9:1),u*(mood==='laugh'||mood==='cheer'?1.25:1.05)*bs,0,0,Math.PI);c2d.fill()}} // beard
  // laurel wreath
  {const hg=sp.head||'laurel';
   if(hg==='laurel'||hg==='flowers'){c2d.strokeStyle=hg==='flowers'?'#4f7a3a':'#5f8a3a';c2d.lineWidth=Math.max(1.5,u*0.4);c2d.beginPath();c2d.arc(cx,fy-u*2.2,u*2.6,Math.PI*1.15,Math.PI*1.85);c2d.stroke();
     for(const s of [-1,1]){c2d.fillStyle=hg==='flowers'?(s<0?'#e07b9a':'#f0cf7d'):'#7fae4a';E(cx+s*u*2.5,fy-u*2.9,u*0.55,u*(hg==='flowers'?0.5:0.3));c2d.fill();c2d.fillStyle=hg==='flowers'?'#9aa6ff':'#7fae4a';E(cx+s*u*1.6,fy-u*3.6,u*0.55,u*(hg==='flowers'?0.5:0.3));c2d.fill()}}
   else if(hg==='diadem'){c2d.fillStyle='#e6b93a';c2d.beginPath();c2d.ellipse(cx,fy-u*3.1,u*2.3,u*0.45,0,Math.PI,0);c2d.fill();c2d.fillRect(cx-u*2.3,fy-u*3.15,u*4.6,u*0.45);c2d.fillStyle=sp.gem||'#c0433a';E(cx,fy-u*3.25,u*0.35,u*0.35);c2d.fill()}
   else if(hg==='hood'){c2d.fillStyle=sp.robe||'#5a3566';c2d.beginPath();c2d.ellipse(cx,fy-u*1.6,u*3.1,u*3.6,0,Math.PI*1.02,Math.PI*1.98);c2d.lineTo(cx+u*3.1,fy+u*0.8);c2d.lineTo(cx+u*2.5,fy+u*0.8);c2d.ellipse(cx,fy-u*1.4,u*2.5,u*3,0,0,Math.PI,true);c2d.lineTo(cx-u*3.1,fy+u*0.8);c2d.closePath();c2d.fill()}
   else if(hg==='helm'){c2d.fillStyle='#a9aeb5';c2d.beginPath();c2d.ellipse(cx,fy-u*2.6,u*2.6,u*1.7,0,Math.PI,0);c2d.fill();c2d.fillStyle=sp.gem||'#c0433a';c2d.fillRect(cx-u*0.35,fy-u*5.4,u*0.7,u*1.4);c2d.beginPath();c2d.ellipse(cx,fy-u*5.2,u*1.6,u*0.6,0,Math.PI,0);c2d.fill()}
   else if(hg==='turban'){c2d.fillStyle=sp.gem||'#e8dcc0';c2d.beginPath();c2d.ellipse(cx,fy-u*3.2,u*2.8,u*1.5,0,Math.PI,0);c2d.fill();c2d.strokeStyle='rgba(0,0,0,.2)';c2d.lineWidth=1;for(let i=0;i<3;i++){c2d.beginPath();c2d.ellipse(cx,fy-u*3.1+i*u*0.3,u*2.7,u*1.2,0,Math.PI*1.1,Math.PI*1.9);c2d.stroke()}}}
  // brows + eyes by mood
  c2d.strokeStyle=hair;c2d.lineWidth=Math.max(1.4,u*0.36);c2d.lineCap='round';
  const brow=(s,tilt)=>{c2d.beginPath();c2d.moveTo(cx+s*u*1.7,fy-u*1.9+tilt*s*0);c2d.lineTo(cx+s*u*0.5,fy-u*1.9-tilt*u*0.6);c2d.stroke()};
  if(mood==='angry'){brow(-1,-1);brow(1,-1)}else if(mood==='shock'||mood==='cheer'){brow(-1,1);brow(1,1)}else{c2d.beginPath();c2d.moveTo(cx-u*1.7,fy-u*2);c2d.lineTo(cx-u*0.5,fy-u*2.05);c2d.stroke();c2d.beginPath();c2d.moveTo(cx+u*0.5,fy-u*2.05);c2d.lineTo(cx+u*1.7,fy-u*2);c2d.stroke()}
  c2d.fillStyle='#1a120c';
  if(mood==='laugh'){c2d.strokeStyle='#1a120c';c2d.lineWidth=Math.max(1.3,u*0.32);for(const s of [-1,1]){c2d.beginPath();c2d.arc(cx+s*u*1.1,fy-u*1.1,u*0.55,Math.PI*1.1,Math.PI*1.9);c2d.stroke()}}
  else if(mood==='shock'){for(const s of [-1,1]){c2d.strokeStyle='#1a120c';c2d.lineWidth=1.4;E(cx+s*u*1.1,fy-u*1.1,u*0.6,u*0.7);c2d.stroke();c2d.fillStyle='#1a120c';E(cx+s*u*1.1,fy-u*1.1,u*0.25,u*0.3);c2d.fill()}}
  else for(const s of [-1,1]){E(cx+s*u*1.1,fy-u*1.15,u*(mood==='cheer'?0.42:0.32),u*(mood==='cheer'?0.5:0.38));c2d.fill()}
  // mouth
  c2d.strokeStyle='#5a2a1e';c2d.lineWidth=Math.max(1.5,u*0.4);
  if(mood==='laugh'||mood==='cheer'){c2d.fillStyle='#421c14';c2d.beginPath();c2d.ellipse(cx,fy+u*0.7,u*(mood==='laugh'?0.95:0.8),u*(mood==='laugh'?0.75:0.5),0,0,Math.PI*2);c2d.fill()}
  else if(mood==='pleased'){c2d.beginPath();c2d.arc(cx,fy+u*0.4,u*0.9,Math.PI*0.15,Math.PI*0.85);c2d.stroke()}
  else if(mood==='angry'){c2d.beginPath();c2d.arc(cx,fy+u*1.3,u*0.9,Math.PI*1.15,Math.PI*1.85);c2d.stroke()}
  else{c2d.beginPath();c2d.moveTo(cx-u*0.7,fy+u*0.7);c2d.lineTo(cx+u*0.7,fy+u*0.7);c2d.stroke()}
  // bored: heavy lids and a long-suffering mouth handled above; add the drooping head tilt line
  if(mood==='bored'){c2d.strokeStyle='#1a120c';c2d.lineWidth=Math.max(1.3,u*0.3);for(const sd of [-1,1]){c2d.beginPath();c2d.moveTo(cx+sd*u*1.7,fy-u*1.35);c2d.lineTo(cx+sd*u*0.5,fy-u*1.3);c2d.stroke()}}
  if(mood==='smug'){c2d.strokeStyle='#5a2a1e';c2d.lineWidth=Math.max(1.5,u*0.4);c2d.beginPath();c2d.arc(cx-u*0.3,fy+u*0.55,u*0.7,Math.PI*0.05,Math.PI*0.6);c2d.stroke();c2d.strokeStyle=hair;c2d.lineWidth=Math.max(1.4,u*0.36);c2d.beginPath();c2d.moveTo(cx+u*0.5,fy-u*2.35);c2d.lineTo(cx+u*1.7,fy-u*2.1);c2d.stroke()}
  if(mood==='weep'){c2d.strokeStyle='#7fb0d8';c2d.lineWidth=Math.max(1.2,u*0.3);for(const sd of [-1,1]){c2d.beginPath();c2d.moveTo(cx+sd*u*1.1,fy-u*0.7);c2d.quadraticCurveTo(cx+sd*u*1.2,fy+u*0.3,cx+sd*u*0.9,fy+u*0.9);c2d.stroke()}}
  // the facepalm: a weary imperial hand
  if(mood==='facepalm'){c2d.fillStyle=skin;c2d.save();c2d.translate(cx+u*0.9,fy-u*1);c2d.rotate(-0.5);E(0,0,u*1.5,u*2.1);c2d.fill();c2d.restore();c2d.strokeStyle='rgba(90,42,30,.5)';c2d.lineWidth=1;for(let i=-1;i<=1;i++){c2d.beginPath();c2d.moveTo(cx+u*(0.2+i*0.55),fy-u*2.6);c2d.lineTo(cx+u*(1.2+i*0.55),fy+u*0.2);c2d.stroke()}}
  // the raised goblet on a cheer
  if(mood==='cheer'){const ac=sp.acc||'goblet';if(ac==='goblet'){c2d.fillStyle='#c9a458';c2d.fillRect(cx+w/2-u*2.4,fy-u*3.4,u*0.5,u*1.6);c2d.beginPath();c2d.ellipse(cx+w/2-u*2.15,fy-u*3.6,u*0.9,u*0.5,0,Math.PI,0);c2d.fill()}
    else if(ac==='scroll'){c2d.fillStyle='#e8dcc0';c2d.fillRect(cx+w/2-u*3,fy-u*4,u*1.4,u*2.4);c2d.fillStyle='#a88a5a';c2d.fillRect(cx+w/2-u*3.2,fy-u*4.1,u*1.8,u*0.35);c2d.fillRect(cx+w/2-u*3.2,fy-u*1.7,u*1.8,u*0.35)}
    else if(ac==='fan'){c2d.fillStyle=sp.gem||'#e07b9a';c2d.beginPath();c2d.moveTo(cx+w/2-u*2.2,fy-u*1.4);c2d.arc(cx+w/2-u*2.2,fy-u*1.4,u*2,Math.PI*1.2,Math.PI*1.8);c2d.closePath();c2d.fill()}
    else if(ac==='coins'){c2d.fillStyle='#e6b93a';for(let i=0;i<4;i++){E(cx+w/2-u*2.2+(i%2)*u*0.6,fy-u*3.2-i*u*0.5,u*0.5,u*0.5);c2d.fill()}}}
  c2d.restore();
}
/* FLAV_IMG — cache of Flavius face images by sponsor and mood. */
const FLAV_IMG={};
/* flavFaceURL — a data-URL portrait of Flavius (or a sponsor) in a mood, for HTML windows. */
function flavFaceURL(mood,sp){ // cached data-URL portraits for HTML dialogs (Flavius himself unless a sponsor is passed)
  sp=sp||(typeof SPONSOR_FLAVIUS!=='undefined'?SPONSOR_FLAVIUS:{});const key=(sp.id||'flavius')+':'+mood+':'+(sp.v||0);if(FLAV_IMG[key])return FLAV_IMG[key];
  try{const cv2=document.createElement('canvas');cv2.width=156;cv2.height=124;const c=cv2.getContext('2d');
    flavFace(c,78,62,152,120,mood,false,sp);return (FLAV_IMG[key]=cv2.toDataURL())}catch(e){return ''}
}
/* flavK — Flavius's box scale: smaller on phones (v0.82, his ask) so it doesn't crowd the board. TWEAK: the 0.7. */
function flavK(){return Math.min(innerWidth,innerHeight)<=520?0.7:1}
/* drawFlavius — draws Flavius's box at the top centre of the arena (v0.89: flavXY89 in 168-v89rotate), its curtain and his spoken line. */
function drawFlavius(){
  if(!S||HEADLESS||(typeof SETTINGS!=='undefined'&&SETTINGS.flavius===false))return;
  const now=performance.now();const mood=now<FLAV.until?FLAV.mood:'calm';
  const a=iso(0,0);const w=TW*1.55*flavK(),h=TW*1.2*flavK();
  /* v0.89: always the top centre of the canvas, whichever way the board is turned */
  const {cx,cy}=flavXY89();
  flavFace(ctx,cx,cy,w,h,mood,true);
  drawCurtain(ctx,cx,cy,w,h);
  ctx.save();
  // his word, on a slip of parchment beside the box
  if(FLAV.line&&now<FLAV.lineUntil){
    ctx.font=`600 ${Math.max(9,Math.round(TW*0.2))}px Alegreya Sans, sans-serif`;const tw=ctx.measureText(FLAV.line).width+12;
    const bx=cx+w/2+6,by=cy-h*0.15;
    ctx.fillStyle='rgba(245,234,210,.96)';ctx.fillRect(bx,by-TW*0.14,tw,TW*0.3);
    ctx.strokeStyle='#8a6a3a';ctx.lineWidth=1;ctx.strokeRect(bx,by-TW*0.14,tw,TW*0.3);
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx-5,by+3);ctx.lineTo(bx,by+5);ctx.closePath();ctx.fillStyle='rgba(245,234,210,.96)';ctx.fill();
    ctx.fillStyle='#241910';ctx.textAlign='left';ctx.fillText(FLAV.line,bx+6,by+1);
  }
  ctx.restore();ctx.textAlign='center';
}

/* =====================================================================
   THE STANDS DRAWER & THE ARENA CHRONICLE (v0.12)
   =====================================================================
   A slide-over panel above the arena (no more scrolling to the bottom of the side column):
   - "Beasts & cards": the NPC tracker, the round's Summa Rudis card and the cards seen this event.
   - "The Stands": live spectators, the arena's own chronicle (last spearing, concessions, brawls,
     omens), and the SPECTATOR ROSTER — every living regular in the system, inspectable,
     bannable, treatable, and — if a lanista holds your wallet — signable as a raw gladiator.
   ===================================================================== */
let ARENA_CACHE={};
/* loadArenas — loads every arena's chronicle into ARENA_CACHE. */
async function loadArenas(){try{const L=await Store.list('arena');ARENA_CACHE={};for(const d of L)ARENA_CACHE[d.li]=d}catch(e){}return ARENA_CACHE}
/* arenaOf — the chronicle of an arena location (created empty when new). */
function arenaOf(locIdx){return ARENA_CACHE[locIdx]||(ARENA_CACHE[locIdx]={id:'loc'+locIdx,li:locIdx,events:0,elims:0,conc:0,brawls:0,stones:0,spears:0,spearLast:null,omens:{}})}
// deterministic personal lore for a regular, grown from their id: same face, same story, every visit
function specLore(reg){
  let h=2166136261;for(const ch of String(reg.id||reg.name))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;
  const nx=()=>(h=(Math.imul(h,1103515245)+12345)>>>0);const pick=a=>a[nx()%a.length];
  return {age:17+nx()%54,district:pick([_T('the Subura'),_T('the docks'),_T('the potters’ quarter'),_T('the cattle market'),_T('the hill villas'),_T('the tanneries'),_T('outside the walls'),_T('the old forum')]),
    snack:pick([_T('salted chickpeas'),_T('honeyed wine'),_T('fried smelt'),_T('stuffed dates'),_T('sausage rolls'),_T('sour posca'),_T('olives by the fistful'),_T('flatbread with garum')]),
    superstition:pick([_T('spits twice when Damnatio enters'),_T('won’t sit in a Q3 seat'),_T('wears the same lucky cap'),_T('touches the rail before every bout'),_T('never bets on the first blood'),_T('counts pillars before sitting')]),
    habit:pick([_T('arrives before the gates open'),_T('leaves before the Fates are read'),_T('heckles the bookmaker'),_T('knows every gladiator’s record'),_T('brings the whole family'),_T('naps through the undercard')])};
}
/* DRAWER — the stands drawer state: open tab and selected regular. */
const DRAWER={tab:null,sel:null};
/* openDrawer — opens the arena drawer on a tab. */
function openDrawer(tab){DRAWER.tab=tab;if(tab!=='stands')DRAWER.sel=null;const d=$('#arenaDrawer');if(!d)return;d.hidden=false;renderDrawer()}
/* closeDrawer — closes the arena drawer. */
function closeDrawer(){DRAWER.tab=null;const d=$('#arenaDrawer');if(d)d.hidden=true}
/* renderDrawer — redraws the drawer and the Imperium stands window if they are open. */
function renderDrawer(){
  if(HEADLESS)return;
  const hub=$('#standsHubBody');if(hub)hub.innerHTML=standsHubHTML(); // the Stands window refreshes with every crowd action
  if(!DRAWER.tab)return;const d=$('#arenaDrawer');if(!d||d.hidden)return;
  $('#drawTitle').textContent=DRAWER.tab==='beasts'?_T('Beasts & cards in play'):_T('The Stands');
  $('#drawBody').innerHTML=DRAWER.tab==='beasts'?beastsDrawerHTML():standsDrawerHTML();
}
/* ================= THE STANDS HUB (v0.16) =================
   The spectator world in a full window (Manager-mode style): empire-wide fandom,
   home cities, arena chronicles, and the live roster/inspector from the drawer. */
/* ================= THE MENAGERIE (v0.19) =================
   Beasts & cards, grown into a window of its own: the live beast tracker and cards in play,
   the arena deck, and a BESTIARY — every beast of the rulebook with its lore and its ledger
   (slain across all your events, gladiators it has eaten), kept in this browser. */
let BESTIARY={};
/* loadBestiary — loads the bestiary ledgers (Store hall/bestiary). */
async function loadBestiary(){try{const d=await Store.getDoc('hall','bestiary');BESTIARY=(d&&d.v)||{}}catch(e){BESTIARY={}}return BESTIARY}
/* bestiaryTally — after a counted event: adds each beast's kills, gladiators eaten, tamings and wins to the bestiary and to its named ledger per city. */
function bestiaryTally(){ // called at gameOver: the keepers update the ledgers
  if(!S||S.sim||HEADLESS)return;let dirty=0;
  const city=LOCATIONS[S.locIdx]?LOCATIONS[S.locIdx].n:_T('Roma');BESTIARY.who=BESTIARY.who||{}; // .who: the ledger of every NAMED beast, per city
  const whoOf=n=>{const id=n.t==='tholo'?_T('Tholo'):`${n.name}@${city}`;return BESTIARY.who[id]=BESTIARY.who[id]||{t:n.t,name:n.name,city:n.t==='tholo'?'every arena':city,ev:0,slain:0,ate:0,tamed:0}};
  for(const n of S.npcs||[]){const k=n.t;const B=BESTIARY[k]=BESTIARY[k]||{slain:0,ate:0,tamed:0};const W=whoOf(n);W.ev++;dirty=1;
    if(!n.alive&&n.killedBy){B.slain++;W.slain++}
    if(n.tamedBy!=null){B.tamed++;W.tamed++}}
  /* v0.46: when the sand ends with no gladiator standing, every beast still on it shares the win */
  if(!(S.result&&S.result.winners&&S.result.winners.length))for(const n of (S.npcs||[]).filter(x=>x.alive)){const B=BESTIARY[n.t]=BESTIARY[n.t]||{slain:0,ate:0,tamed:0};B.wins=(B.wins||0)+1;const W=whoOf(n);W.wins=(W.wins||0)+1;dirty=1}
  for(const o of S.elimOrder||[]){const by=String(o.by||'');const n=(S.npcs||[]).find(x=>x.name===by);
    if(n){const B=BESTIARY[n.t]=BESTIARY[n.t]||{slain:0,ate:0,tamed:0};B.ate++;whoOf(n).ate++;dirty=1}}
  if(dirty)Store.put('hall','bestiary',{v:BESTIARY}).catch(()=>{});
}
/* v0.22: the beasts' lore is Virgilante's own "ludus notes" from the rulebook's NPC pages (p.32-33), quoted with their attributions */
const BEAST_LORE={
  snake:_T('<i>Species: Nāgá.</i> “Cherished companions of Flavius, these serpents become formidable contenders, embodying the essence of Asclepius, ensuring a ceaseless crimson cascade upon the arena sands.” <span class="rc-sub">— Virgilante, ludus notes</span>'),
  wolf:_T('<i>Species: Canis lupus.</i> “Valencia and Moechus, masters of the hunt, possess an insatiable appetite within the arena, their natural prowess and docility allowing them to effortlessly track their prey.” <span class="rc-sub">— Cassius Dio, ludus notes</span>'),
  bear:_T('<i>Species: Atlas.</i> “Ursa may hold the upper paw, but do not underestimate the thunderous might of Brutum. Beware, for crossing their paths means daring to challenge their dominion, even at the cost of their cherished treasure.” <span class="rc-sub">— Pomponius Mela, ludus notes</span>'),
  lion:_T('<i>Species: Barbary Lion.</i> “Transported clandestinely across the treacherous Mediterranean during the frigid grip of last winter\u2019s mare clausum, these untamed exotic beasts ignite a frenzy of excitement within the crowd as they unleash their primal fury, tearing limbs asunder and delivering savage face-maulings.” <span class="rc-sub">— Pomponius Mela, ludus notes</span>'),
  tholo:_T('<i>Species: unknown.</i> “With its otherworldly visage and unparalleled brutality, Tholo stands as a living testament to the extraordinary and the unfathomable, seizing the gaze of spectators from across the empire, instilling fear that resonates within their souls.” <span class="rc-sub">— Virgilante, ludus notes</span>'),
  commodus:_T('<i>Species: Human.</i> “Master of deception and self-proclaimed Champion Victorious, Commodus, a consummate fabricator, forges a path devoid of allies, shamelessly usurping the title within the realms of Flavius Rule.” <span class="rc-sub">— Cassius Dio, ludus notes</span>'),
  zora:_T('The golden eagle of the games: too fast to hit, too proud to land, happiest carrying off something a gladiator was about to enjoy.'),
};
/* menagerieHTML — the Menagerie window: the event, beasts on the sand, the deck, cards seen, the city's beasts and the Bestiary with lore and ledgers. */
function menagerieHTML(){
  const rd=S?RD():null;const seen=S?(S.cardsSeen||[]).slice(-12).reverse():[];
  const custom=(typeof CUSTOM!=='undefined'&&CUSTOM.npcs)||[];
  const bestRow=(k,T)=>{const B=BESTIARY[k]||{slain:0,ate:0,tamed:0};const live=S&&(S.npcs||[]).filter(n=>n.t===k&&n.alive).length;
    return `<div class="lrow" style="--pc:${T.col}">${(tokenStyle()==='figure'&&TOKEN_DEF[k])?figureHTML(tokenForNPC({t:k}),54):TYPE_STANDEE[k]&&tokenStyle()==='standee'?standeeHTML(TYPE_STANDEE[k],54):`<span class="bglyph" style="background:${T.col}">${T.g}</span>`}${typeof NPC_TOK!=='undefined'&&NPC_TOK[k]?rtokHTML(NPC_TOK[k][0],44,T.n):''}<div class="t">${_T`<b>${T.n}</b>${live?` <span class="badge gold">${_T`${live} on the sand now`}</span>`:''}${T.tameable?' <span class="badge">tameable</span>':''}
      <small>${BEAST_LORE[k]||_T('A creature of the editor\u2019s menagerie.')}</small>
      <small>HP ${T.hp} · ATK ${T.ap} · MV ${T.mv} · worth ${coinAmt87(T.coin)}, ${cfAmt87(T.cf)}${T.states?_T(' · behavior states'):''}</small>
      <small><b>The ledger:</b> ${B.slain} slain in your events · ${B.ate} gladiator${B.ate===1?'':'s'} eaten · ${B.tamed?B.tamed+' tamed':_T('never tamed')}</small>`}</div></div>`};
  return `<div class="setup-grid">
    <div>${S?`<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px">${cardHTML('e:'+S.evKey,'sm')}<div><b>${esc(EV().n)}</b><div class="rc-sub">${_T`Round ${S.ri+1}: ${esc(rd.n)} · ${rd.pvp?_T('PvP'):_T('no PvP')} · ${rd.pve?_T('PvE'):_T('no PvE')}${S.endgame?_T(' · <b style=\"color:var(--gold2)\">END GAME</b>'):''}`}</div></div></div>
      <div class="sect" style="margin-top:0">${_T`On the sand now`}</div><div id="npcDrawer">${typeof npcTrackerHTML==='function'?npcTrackerHTML():''}</div>
      ${S.deck&&EV().deck?`<div class="sect">${_T`The arena deck`}</div><p class="rc-sub" style="margin:0">${_T`${S.deck.length} card${S.deck.length===1?'':'s'} remain${S.deck.length===1?'s':''}; Flavius Rule waits at the bottom. ${S.round2&&S.round2.length?_T`${S.round2.length} more set aside for round 2.`:''}`}</p>`:''}
      ${seen.length?`<div class="sect">${_T`Cards seen this event`}</div><div class="items">${seen.map(c=>`<div class="item"><span>${cardHTML(c.ref,'xs')}<span>${esc(c.n)}<em>${esc(c.by||'')}</em></span></span></div>`).join('')}</div>`:''}`
     :`<p class="hint">${_T`No event on the sand — but the cages are never empty. The bestiary keeps its ledgers between events.`}</p>`}</div>
    <div>${cityBeastsHTML(S?S.locIdx:(typeof CFG!=='undefined'?CFG.loc:6))}
      <div class="sect" style="margin-top:0">${_T`📖 The Bestiary`} <span class="rc-sub">${_T`its ledgers survive every event`}</span></div>
      <div class="list2" style="grid-template-columns:minmax(0,1fr)">${Object.entries(NPCT).filter(([k])=>!k.startsWith('cn_')).map(([k,T])=>bestRow(k,T)).join('')}
      ${custom.length?custom.map(n=>`<div class="lrow" style="--pc:#8a5cc0"><span class="bglyph" style="background:#8a5cc0">✦</span><div class="t"><b>${esc(n.name)}</b> <span class="cbadge">✦ custom</span>${_T`<small>${esc(n.bio||_T('A beast of your own devising (Creator Studio).'))}</small><small>HP ${n.hp} · ATK ${n.atk||n.ap||'?'} · MV ${n.mv}</small><small><b>The ledger:</b> ${(BESTIARY['cn_'+n.id]||{}).slain||0} slain · ${(BESTIARY['cn_'+n.id]||{}).ate||0} gladiator${(BESTIARY['cn_'+n.id]||{}).ate===1?'':'s'} eaten · ${(BESTIARY['cn_'+n.id]||{}).tamed||0} tamed</small>`}</div></div>`).join(''):''}</div></div>
  </div>`;
}
/* v0.46: every city's beasts in one scrollable list — the chosen city first, and anything on the sand right now
   pinned at the very top, lit. Each named beast keeps its own ledger: events, kills, gladiators taken, tamings, wins. */
/* BEAST_ROLES — the named base beasts of a city and their types (each city names its own). */
const BEAST_ROLES=[[_T('Glykon'),'snake'],[_T('Arenosus'),'snake'],[_T('Valencia'),'wolf'],[_T('Moechus'),'wolf'],[_T('Ursa'),'bear'],[_T('Brutum'),'bear'],[_T('Leo'),'lion'],[_T('Leaena'),'lion'],[_T('Commodus'),'commodus']];
/* beastLedger — a named beast's ledger chips: events, slain, gladiators taken, tamed, wins. */
function beastLedger(ledger){ledger=ledger||{};return `<span class="bst" title="events">🏟 ${ledger.ev||0}</span><span class="bst" title="${_T`slain by gladiators`}">⚔ ${ledger.slain||0}</span><span class="bst" title="${_T`gladiators it eliminated`}">☠ ${ledger.ate||0}</span><span class="bst" title="${_T`times tamed`}">🪢 ${ledger.tamed||0}</span><span class="bst" title="${_T`events it won — no gladiator left standing`}">🏆 ${ledger.wins||0}</span>`}
/* cityBeastsHTML — every city's named beasts with their ledgers, the chosen city first and the beasts on the sand pinned on top. */
function cityBeastsHTML(locIdx,opt={}){const who=BESTIARY.who||{};const L0=LOCATIONS[locIdx]||LOCATIONS[6];
  const tokOf=(nm,t)=>{const rk=BEAST_ROLES.find(r=>r[1]===t&&Object.values(CITY_BEASTS).some(T=>T[r[0]]===nm));return typeof rtokHTML==='function'?(rk?rtokHTML(rk[0].toLowerCase(),34,nm):t==='tholo'?rtokHTML('tholo',34,nm):''):''};
  const row=(nm,t,city,live)=>{const W=who[t==='tholo'?'Tholo':`${nm}@${city}`];const N=NPCT[t]||{col:'#777',g:'?'};return `<div class="brow ${live?'live':''}" style="--pc:${N.col}">${tokOf(nm,t)||`<span class="bglyph" style="background:${N.col}">${N.g}</span>`}<div class="t"><b>${esc(nm)}</b> <span class="rc-sub">${esc(npcKind(t))}${city?' · '+esc(city):''}</span>${live?` <span class="badge gold">${esc(live)}</span>`:''}<div class="bstats">${beastLedger(W)}</div></div></div>`};
  const liveRows=S&&S.phase!=='setup'&&!S.over?(S.npcs||[]).filter(n=>n.alive).map(n=>row(n.name,n.t,n.t==='tholo'?'':L0.n,_T`on the sand · ${Math.max(0,n.hp)} HP`)).join(''):'';
  const cities=opt.only?[L0.n]:[L0.n,...Object.keys(CITY_BEASTS).filter(c=>c!==L0.n)]; /* v0.47: a city's square tells only of its own beasts */
  const blocks=cities.map(c=>{const T=CITY_BEASTS[c];if(!T)return '';return `<div class="bcity ${c===L0.n?'here':''}"><div class="bcityhd">${_T`${c===L0.n?'🏟':'📍'} The beasts of ${esc(c)} ${T.champ?`<span class="rc-sub">${_T`· champion: ${esc(T.champ)}`}</span>`:''}`}</div>${BEAST_ROLES.map(([k,t])=>row(T[k],t,c)).join('')}</div>`}).join('');
  const th=row(_T('Tholo'),'tholo','');
  return `<div class="sect" style="margin-top:0">🐾 ${opt.only?_T`The beasts of ${esc(L0.n)}`:_T('The beasts of the empire')} <span class="rc-sub">${_T`every city names its own — ledger: 🏟 events · ⚔ slain · ☠ gladiators taken · 🪢 tamed · 🏆 wins`}</span></div>
    ${liveRows?`<div class="blive"><div class="bcityhd">${_T`🔥 On the sand now`}</div>${liveRows}</div>`:''}
    <div class="bscroll" style="max-height:${opt.h||420}px">${blocks}<div class="bcity"><div class="bcityhd">${_T`🌑 Every arena`}</div>${th}</div></div>`}
/* openMenagerie — opens the Menagerie window. Replaced by 89-stands (Bestiary only). */
async function openMenagerie(){
  if(typeof modalBusy==='function'&&modalBusy())return;
  await loadBestiary();
  await modal(_T('🐾 Menagerie · beasts, cards & the bestiary'),`<div id="menagBody">${menagerieHTML()}</div>`,[{label:_T('Close'),value:0}],{wide:1,xwide:1});
}
/* openStandsHub — opens the Imperium window. */
async function openStandsHub(){
  if(typeof modalBusy==='function'&&modalBusy())return;
  await modal(_T('🌍 Imperium · the empire and its stands'),`<div id="standsHubBody">${standsHubHTML()}</div>`,[{label:_T('Close'),value:0}],{wide:1,xwide:1});
}
/* standsHubHTML — the Imperium window body. */
function standsHubHTML(){return imperiumHTML()}
/* v0.21 Imperium: the empire's numbers and its most beloved, one compact strip above the map */
function empireStripHTML(){
  const regs=CROWD_CACHE.filter(r=>!r.recruited);const fans={};const addF=(n,w2)=>{if(!n)return;fans[n]=(fans[n]||0)+w2};
  for(const r of regs){addF(r.fanOf,1);addF(r.patronFav,1);if(r.kin)addF(r.kin.name,2)}
  const top=Object.entries(fans).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const arenas=Object.values(ARENA_CACHE||{}).filter(A=>A&&(A.events||0)>0);const sum=k=>arenas.reduce((a,A)=>a+(A[k]||0),0);
  const c=(i,v,l)=>`<span class="estat" title="${l}">${i} <b>${v}</b></span>`;
  return `<div class="empstrip"><span class="eslbl">${_T`The empire`}</span>${c('👥',regs.length+'K','spectators')}${c('🗡',regs.filter(r=>r.exGlad).length,'ex-gladiators in the seats')}${c('👪',regs.filter(r=>r.kin).length,_T('kin of fighters'))}${c('⚠',regs.filter(r=>r.trouble).length,_T('known troublemakers'))}${c('🚫',regs.filter(r=>r.banned).length,'banned')}${c('🏟',sum('events'),_T('events held everywhere'))}${c('✝',sum('elims'),_T('gladiators fallen'))}${c('🍯',sum('conc'),_T('coin of concessions'))}${c('🔱',sum('spears'),_T('spectators speared'))}
    ${top.length?`<span class="eslbl" style="margin-left:auto">${_T`❤ Most beloved`}</span>${top.map(([n,v],i)=>`<span class="estat" title="${_T`fans + bought cheers + family (×2)`}">${['🥇','🥈','🥉'][i]} <b>${esc(n)}</b> ${v}</span>`).join('')}`:''}</div>`}
/* standsRosterViewHTML — the roster view: where the regulars live, family ties and the searchable roster. */
function standsRosterViewHTML(){
  const regs=CROWD_CACHE.filter(r=>!r.recruited);const cities={};for(const r of regs)if(r.city)cities[r.city]=(cities[r.city]||0)+1;
  const topCities=Object.entries(cities).sort((a,b)=>b[1]-a[1]).slice(0,6);const maxC=topCities[0]?topCities[0][1]:1;
  // v0.28: where they live comes first (it explains who fills which stands), then family ties, then the searchable roster
  return `${topCities.length?`<div class="sect" style="margin-top:0">${_T`🏠 Where the regulars live`}</div><p class="rc-sub" style="margin:0 0 4px">${_T`The home cities of your named regulars. They will travel to any arena, but they fill their <b>home city's</b> stands first — so a city with many regulars draws bigger, louder home crowds (and cheers hardest for fighters born there).`}</p>${topCities.map(([n,v])=>`<div style="display:grid;grid-template-columns:1fr 120px 24px;gap:8px;align-items:center;font-size:13px"><span>${esc(n)}</span><div class="meter"><i style="width:${Math.round(v/maxC*100)}%"></i></div><span>${v}</span></div>`).join('')}`:''}
    ${familyTiesHTML()}
    ${standsDrawerHTML({noChron:1})}`}
/* familyTiesHTML — kin in the stands and the gladiators they come to see. */
function familyTiesHTML(){const kinFolk=CROWD_CACHE.filter(r=>!r.recruited&&r.kin);return kinFolk.length?`<div class="sect">${_T`👪 Family ties`} <span class="rc-sub">${_T`kin in the stands, and the gladiators they come to see`}</span></div><div style="font-size:12.5px;display:grid;gap:2px;max-height:160px;overflow:auto">${kinFolk.slice(0,30).map(r=>`<div>${_T`👪 <b>${esc(r.name)}</b> — ${esc(r.kin.rel)} of <b>${esc(r.kin.name)}</b>${r.city?` <span class="rc-sub">${_T`· of ${esc(r.city)}`}</span>`:''}`}</div>`).join('')}</div>`:''}
/* standsHubPanelsHTML — the older Stands hub panels: the empire in numbers, the most beloved, home cities, family ties and the drawer. */
function standsHubPanelsHTML(){ // the old Stands panels: empire fandom, home cities, family ties, arena chronicle, roster
  const regs=CROWD_CACHE.filter(r=>!r.recruited);
  // fandom across the empire: every allegiance a regular carries home
  const fans={};const addF=(n,w2)=>{if(!n)return;fans[n]=(fans[n]||0)+w2};
  for(const r of regs){addF(r.fanOf,1);addF(r.patronFav,1);if(r.kin)addF(r.kin.name,2)}
  const topFans=Object.entries(fans).sort((a,b)=>b[1]-a[1]).slice(0,8);const maxF=topFans[0]?topFans[0][1]:1;
  const cities={};for(const r of regs)if(r.city)cities[r.city]=(cities[r.city]||0)+1;
  const topCities=Object.entries(cities).sort((a,b)=>b[1]-a[1]).slice(0,6);const maxC=topCities[0]?topCities[0][1]:1;
  const kinFolk=regs.filter(r=>r.kin);
  const arenas=Object.values(ARENA_CACHE||{}).filter(A=>A&&(A.events||0)>0);
  const totEv=arenas.reduce((a,A)=>a+(A.events||0),0),totEl=arenas.reduce((a,A)=>a+(A.elims||0),0),totSp=arenas.reduce((a,A)=>a+(A.spears||0),0),totConc=arenas.reduce((a,A)=>a+(A.conc||0),0);
  return `<div class="setup-grid">
   <div>
    <div class="sect" style="margin-top:0">${_T`The empire in numbers`}</div>
    <div class="chron">
      <span class="stat">${_T`<b>${regs.length}</b>named regulars`}</span>
      <span class="stat">${_T`<b>${regs.filter(r=>r.exGlad).length}</b>ex-gladiators in the seats`}</span>
      <span class="stat">${_T`<b>${kinFolk.length}</b>kin of fighters`}</span>
      <span class="stat">${_T`<b>${regs.filter(r=>r.trouble).length}</b>known troublemakers`}</span>
      <span class="stat">${_T`<b>${regs.filter(r=>r.banned).length}</b>banned`}</span>
      <span class="stat">${_T`<b>${totEv}</b>events held everywhere`}</span>
      <span class="stat">${_T`<b>${totEl}</b>gladiators fallen`}</span>
      <span class="stat">${_T`<b>${coinAmt87(totConc)}</b> of concessions`}</span>
      <span class="stat">${_T`<b>${totSp}</b>spectators speared`}</span>
    </div>
    <div class="sect">${_T`Beloved across the empire`} <span class="rc-sub">${_T`fans + bought cheers + family (×2)`}</span></div>
    ${topFans.length?topFans.map(([n,v])=>`<div style="display:grid;grid-template-columns:1fr 120px 24px;gap:8px;align-items:center;font-size:13px"><b>${esc(n)}</b><div class="meter gold"><i style="width:${Math.round(v/maxF*100)}%"></i></div><span class="n rc-sub">${v}</span></div>`).join(''):`<p class="rc-sub">${_T`No allegiances yet — run events with spectators and the empire chooses its darlings.`}</p>`}
    <div class="sect">${_T`Where the regulars live`} <span class="rc-sub">${_T`they attend anywhere, but pack their home stands first`}</span></div>
    ${topCities.length?topCities.map(([n,v])=>`<div style="display:grid;grid-template-columns:1fr 120px 24px;gap:8px;align-items:center;font-size:13px"><span>${esc(n)}</span><div class="meter"><i style="width:${Math.round(v/maxC*100)}%"></i></div><span class="n rc-sub">${v}</span></div>`).join(''):`<p class="rc-sub">${_T`No home cities on record yet.`}</p>`}
    ${kinFolk.length?`<div class="sect">${_T`Family ties`}</div><div style="font-size:12.5px;display:grid;gap:2px">${kinFolk.slice(0,10).map(r=>`<div>${_T`👪 <b>${esc(r.name)}</b> — ${esc(r.kin.rel)} of the gladiator <b>${esc(r.kin.name)}</b>${r.city?` <span class="rc-sub">(${esc(r.city)})</span>`:''}`}</div>`).join('')}</div>`:''}
   </div>
   <div>${standsDrawerHTML()}</div>
  </div>`;
}
/* beastsDrawerHTML — the drawer's Beasts & cards tab: the round, the NPC tracker and the cards seen. */
function beastsDrawerHTML(){
  if(!S)return `<p class="hint">${_T`No event on the sand.`}</p>`;
  const rd=RD();
  const seen=(S.cardsSeen||[]).slice(-10).reverse();
  return `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px">${cardHTML('e:'+S.evKey,'sm')}<div><b>${esc(EV().n)}</b><div class="rc-sub">${_T`Round ${S.ri+1}: ${esc(rd.n)} · ${rd.pvp?_T('PvP'):_T('no PvP')} · ${rd.pve?_T('PvE'):_T('no PvE')}${S.active&&S.active.restless?_T(' · <b style="color:var(--blood2)">crowd restless</b>'):''}${S.endgame?_T(' · <b style="color:var(--gold2)">END GAME</b>'):''}`}</div></div></div>
   <div id="npcDrawer">${typeof npcTrackerHTML==='function'?npcTrackerHTML():''}</div>
   ${seen.length?`<div class="sect">${_T`Cards seen this event`}</div><div class="items">${seen.map(c=>`<div class="item"><span>${cardHTML(c.ref,'xs')}<span>${esc(c.n)}<em>${esc(c.by||'')}</em></span></span></div>`).join('')}</div>`:''}`;
}
/* standsDrawerHTML — the drawer's Stands tab: this arena's chronicle, the live crowd and the spectator roster with its inspector. */
function standsDrawerHTML(opt={}){
  const li=opt.li!=null?opt.li:S?S.locIdx:null;const L=li!=null?LOCATIONS[li]:null;const A=li!=null?arenaOf(li):null;
  let chron='';
  if(A&&L){
    const days=A.spearLast?Math.max(0,Math.round((Date.now()-new Date(A.spearLast.date).getTime())/864e5)):null;
    chron=`<div class="sect" style="margin-top:0">${_T`The arena at ${esc(L.n)}`}</div>
    <div class="chron mini">
      <span class="stat">${_T`<b>${A.events||0}</b>events held`}</span>
      <span class="stat">${_T`<b>${A.elims||0}</b>gladiators fallen`}</span>
      <span class="stat">${_T`<b>${coinAmt87(A.conc||0)}</b> of concessions`}</span>
      <span class="stat">${_T`<b>${A.stones||0}</b>stones thrown`}</span>
      <span class="stat">${_T`<b>${A.brawls||0}</b>brawls in the tiers`}</span>
      <span class="stat" title="${_T`The omen seen most often over this arena — hover the icon`}">${_T`<b>${(()=>{const top=Object.entries(A.omens||{}).sort((a,b)=>b[1]-a[1])[0];return top?omenBadge(OMENS.find(o=>o.k===top[0])):'—'})()}</b>most frequent omen`}</span>
    </div>
    <p class="rc-sub" style="margin:2px 0 8px">${A.spearLast?_T`Last spectator speared here: <b>${esc(A.spearLast.name)}</b>, by ${esc(A.spearLast.by)} (${esc(A.spearLast.date)} — ${days===0?_T('today'):days===1?_T('1 day without a spearing'):_T`${days} days without a spearing`}). The ushers are proud of the streak.`:_T('No spectator has ever been speared in this arena. The front rows sit easy.')}${S&&S.omen?_T` · Today: <b>${esc(S.omen.n)}</b>.`:''}</p>`;
  }
  const live=S&&!S.over&&S.phase!=='setup'&&S.spect&&S.spect.length?($('#crowdPanel')&&!$('#crowdPanel').hidden?$('#crowdPanel').innerHTML:crowdPanelHTML()):''; // v0.32: between events the stands stand empty
  // the roster of every living regular in the system
  const regs=CROWD_CACHE.filter(r=>!r.recruited).sort((a,b)=>(b.visits||0)-(a.visits||0));
  const sel=DRAWER.sel?CROWD_CACHE.find(r=>r.id===DRAWER.sel):null;
  const roster=`<div class="sect">${_T`Spectator roster · ${regs.length}K spectators known to the ushers`}</div>
   <input type="search" class="tin spsearch" placeholder="${_T`🔍 Find a spectator — name, city, or the gladiator they follow`}" value="${esc(window.SPQ||'')}" oninput="spFilter(this)" style="width:100%;margin:0 0 6px">
   ${sel?spectInspectorHTML(sel):''}
   <div style="max-height:${sel?'180px':'320px'};overflow-y:auto">${regs.map(r=>`<div class="sprow" data-spid="${esc(r.id)}" data-q="${esc([r.name,r.city,r.fanOf,r.patronFav,r.kin&&r.kin.name].filter(Boolean).join(' ').toLowerCase())}"${window.SPQ&&![r.name,r.city,r.fanOf,r.patronFav,r.kin&&r.kin.name].filter(Boolean).join(' ').toLowerCase().includes(window.SPQ.toLowerCase())?' hidden':''}>${specFaceSVG(r.look)}<span style="flex:1"><b>${esc(r.name)}</b>${r.custom?' <span class="cbadge">✦</span>':''}${r.kin?` <span style="font-size:11px;color:var(--gold2)" title="${_T`${esc(r.kin.rel)} of the gladiator ${esc(r.kin.name)}`}">👪 ${esc(r.kin.name)}</span>`:''}${r.trouble?' <span class="trb">troublemaker</span>':''}${r.banned?' <span class="trb">BANNED</span>':''}${r.quit?` <span class="rc-sub">${_T`staying away (${esc(r.quit.reason)})`}</span>`:''}<br><span class="rc-sub">${_T`${SPECT_TASTES[r.taste]?SPECT_TASTES[r.taste][0].toLowerCase():''} fan · ${SPECT_TEMPERS[r.temper]?SPECT_TEMPERS[r.temper][0].toLowerCase():''} · ${r.visits||0} visit${(r.visits||0)===1?'':'s'}`}</span></span></div>`).join('')||`<p class="hint">${_T`No regulars yet — run an event with spectators and the neighborhood forms on its own.`}</p>`}</div>`;
  if(opt.chronOnly)return chron;
  return (opt.noChron?'':chron)+(live?`<div class="sect">${_T`In the stands right now`}</div>${live}`:'')+roster;
}
// v0.28: the roster search — filters as you type; the query survives a redraw
function spFilter(input){const q=input.value.trim().toLowerCase();window.SPQ=q;const box=input.parentElement;let n=0;box.querySelectorAll('.sprow').forEach(el=>{const hit=!q||(el.dataset.q||'').includes(q);el.hidden=!hit;if(hit)n++});let m=box.querySelector('.spnone');if(!n&&q){if(!m){m=document.createElement('p');m.className='rc-sub spnone';input.after(m)}m.textContent=_T`Nobody by that name in the stands — the ushers know ${box.querySelectorAll('.sprow').length}K spectators.`}else if(m)m.remove()}
/* spectInspectorHTML — one regular's inspector: lore, memories, ban / ticket / treat / sign / buy cheers buttons. */
function spectInspectorHTML(reg){
  const lore=specLore(reg);const mems=(reg.mem||[]).slice(-5).reverse();
  return `<div class="card2" style="margin-bottom:8px"><div style="display:flex;gap:10px;align-items:flex-start">
    <span style="transform:scale(2.2);transform-origin:top left;display:inline-block;width:44px;height:44px">${specFaceSVG(reg.look,reg.fanOf?gladColorByName(reg.fanOf):reg.kin?gladColorByName(reg.kin.name):null,reg.city)}</span>
    <div style="flex:1"><b style="font:400 17px var(--display);color:var(--gold2)">${esc(reg.name)}</b>${reg.custom?' <span class="cbadge">✦ custom</span>':''}${reg.trouble?_T(' <span class="trb">known troublemaker</span>'):''}
      <div class="rc-sub">${_T`${lore.age} years old · lives by ${lore.district} · always buys ${lore.snack}`}</div>
      ${reg.kin?`<div class="rc-sub">${_T`👪 <b>${esc(reg.kin.rel)}</b> of the gladiator <b>${esc(reg.kin.name)}</b> — family colors when they fight`}</div>`:''}
      ${reg.exGlad?`<div class="rc-sub">${_T`🗡 an ex-gladiator — the stands are cheaper than the sand`}</div>`:''}
      <div class="rc-sub">${SPECT_TASTES[reg.taste]?`<b>${SPECT_TASTES[reg.taste][0]}</b>: ${SPECT_TASTES[reg.taste][1]}`:''}</div>
      <div class="rc-sub">${SPECT_TEMPERS[reg.temper]?`<b>${SPECT_TEMPERS[reg.temper][0]}</b>: ${SPECT_TEMPERS[reg.temper][1]}`:''}</div>
      <div class="rc-sub">${lore.superstition} · ${lore.habit}</div></div></div>
    ${mems.length?`<div class="sect">${_T`What they remember (fades after ~5 events)`}</div><div style="font-size:12px;color:var(--muted);display:grid;gap:2px">${mems.map(m=>`<div>· ${esc(m.note||m.kind)}</div>`).join('')}</div>`:''}
    ${reg.banned?`<p class="rc-sub" style="color:var(--blood2)">${_T`Banned from the arena${reg.banLog?_T` since ${esc(reg.banLog)}`:''}. The ushers know the face.`}</p>`:''}
    ${reg.quit?`<p class="rc-sub">${_T`Currently staying away: ${esc(reg.quit.reason)} (${reg.quit.left} event${reg.quit.left===1?'':'s'} more, unless treated).`}</p>`:''}
    <div class="mbtns" style="margin-top:6px">
      <button class="btn" type="button" data-spact="ban" data-spid="${esc(reg.id)}">${reg.banned?_T('Lift the ban'):_T('Ban from the arena')}<small>${reg.banned?_T('all is forgiven'):reg.trouble?_T('the ushers have been asking for this'):_T('they will not be seated again')}</small></button>
      ${(S&&S.spect&&S.spect.some(x=>x.rid===reg.id&&!x.gone))?`<button class="btn" type="button" disabled>${_T`🎟 In attendance today<small>already in their seat</small>`}</button>`:`<button class="btn" type="button" data-spact="ticket" data-spid="${esc(reg.id)}" ${reg.banned||reg.ticket?'disabled':''}>${reg.ticket?_T('🎟 Ticket bought'):_T('🎟 Buy them a ticket')}<small>${reg.ticket?_T('they will be at the next event'):S&&!S.over?_T`${coinAmt87(2)} · seated right now, over someone else`:_T`${coinAmt87(2)} · guaranteed a seat at the next event`}</small></button>`}
      <button class="btn" type="button" data-spact="treat" data-spid="${esc(reg.id)}" ${reg.banned?'disabled':''}>${_T`Stand them a round<small>goodwill: clears any grudge against the games, +mood next visit</small>`}</button>
      ${typeof hsTable==='function'&&hsTable()?'':`<button class="btn" type="button" data-spact="sign" data-spid="${esc(reg.id)}" ${reg.banned||reg.signAsked||reg.recruited?'disabled':''}>${reg.recruited?_T('✔ YES — signed to your ludus'):reg.signAsked?_T('✖ NO — they refused'):_T('Offer them the sword')}<small>${reg.recruited?_T('they fight for you now: find them on your Roster'):reg.signAsked?_T('refused for good — a Roman is only asked once'):reg.exGlad?_T('one ask, ever — they miss the sand, they will likely say yes'):_T('one ask, ever — yes and they join at once; no is final')}</small></button>`}
      <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:4px">
        <select class="tin" id="spInfl" style="width:auto;min-width:120px">${(()=>{const opts=[];if(S&&S.players)for(const p2 of (typeof hsOrder88==='function'?hsOrder88(S.players):S.players).filter(p2=>p2.alive&&!p2.exited))opts.push(p2.name);const w2=(typeof MGR!=='undefined'&&MGR.world)||(typeof ACTIVE!=='undefined'&&ACTIVE.world);if(w2){const pm=w2.mgrs.find(x=>x.id===w2.playerId);for(const g2 of w2.glads.filter(g2=>g2.alive&&g2.contract&&g2.contract.mgr===pm.id))if(!opts.includes(g2.name))opts.push(g2.name)}return opts.map(n2=>`<option>${esc(n2)}</option>`).join('')||`<option value="">${_T`— nobody to back —`}</option>`})()}</select>
        <button class="btn" type="button" data-spact="infl" data-spid="${esc(reg.id)}" ${reg.banned?'disabled':''}>${_T`Buy their cheers<small>${coinAmt87(5)} from your lanista — they back that name wherever it fights</small>`}</button>
      </div>
      <button class="btn" type="button" data-spact="close">${_T`Close`}</button></div></div>`;
}
// drawer wiring
/* all drawer and roster clicks: open tabs, select a regular, and the roster actions (ban, ticket, treat, buy cheers, offer the sword) — at most three different dealings with one regular a week. */
document.addEventListener('click',async e=>{
  if(e.target.closest('#btnDrawB')){openMenagerie();return}
  if(e.target.closest('#btnDrawS')){openStandsHub();return}
  if(e.target.closest('#drawClose')){closeDrawer();return}
  const row=e.target.closest('.sprow');if(row){DRAWER.sel=row.dataset.spid;if(row.closest('#standsHubBody')&&typeof HUB!=='undefined')HUB.view='roster';renderDrawer();return}
  const act=e.target.closest('[data-spact]');
  if(act){const r=CROWD_CACHE.find(x=>x.id===act.dataset.spid);
    // v0.31 A WEEK HAS LIMITS: at most THREE different dealings with any one regular per week, each once.
    if(r&&act.dataset.spact!=='close'){const wk9=(typeof MGR!=='undefined'&&MGR.world)?`m${MGR.world.id}:${MGR.world.week}`:'d'+Math.floor(Date.now()/6048e5);
      if(!r.wkAct||r.wkAct.k!==wk9)r.wkAct={k:wk9,u:{}};
      const a9=act.dataset.spact;
      if(r.wkAct.u[a9]){if(typeof mToast==='function')mToast(_T`🤚 You have already done that with <b>${esc(r.name)}</b> this week.`);return}
      if(Object.keys(r.wkAct.u).length>=3){if(typeof mToast==='function')mToast(_T`🤚 <b>${esc(r.name)}</b> has had quite enough of your attention this week (three dealings at most).`);return}
      r.wkAct.u[a9]=1;Store.put('crowd',r.id,r).catch(()=>{})}
    // v0.24: every roster action answers back — a toast, and an emote if they are in the stands right now
    const say=(t,emo)=>{if(typeof mToast==='function')mToast(t);if(r&&S&&S.spect){const sp=S.spect.find(x=>x.rid===r.id&&!x.gone);if(sp&&emo)emote(sp,emo,'')}if(typeof sfx==='function')sfx('click')};
    if(r&&act.dataset.spact==='treat')say(_T`🍷 You stand <b>${esc(r.name)}</b> a round of honeyed wine — any grudge against the games is forgiven, and they arrive in a good mood (+15) next time.`,'🍷');
    if(r&&act.dataset.spact==='ban')say(r.banned?_T`✅ <b>${esc(r.name)}</b> is welcome back in the arena.`:_T`🚫 <b>${esc(r.name)}</b> is banned — the ushers memorize the face.`,r.banned?'😊':'😠');
    if(r&&act.dataset.spact==='ticket'&&!r.ticket)say(_T`🎟 A ticket for <b>${esc(r.name)}</b> — ${S&&!S.over?_T('they take a seat right now'):_T('guaranteed a seat at the next event')}.`,'🎟');
    if(act.dataset.spact==='close'){DRAWER.sel=null;renderDrawer();return}
    if(!r)return;
    if(act.dataset.spact==='ban'){r.banned=!r.banned;r.banLog=r.banned?new Date().toISOString().slice(0,10):r.banLog;Store.put('crowd',r.id,r).catch(()=>{});if(S)log(r.banned?_T`<b>${esc(r.name)}</b> is banned from the arena. The ushers memorize the face.`:_T`${esc(r.name)}'s ban is lifted. They swear they have changed.`);renderDrawer();return}
    if(act.dataset.spact==='ticket'){await buyTicket(r,null);renderDrawer();return}
    if(act.dataset.spact==='treat'){r.quit=null;r.treat=1;(r.mem=r.mem||[]).push({d:new Date().toISOString().slice(0,10),kind:'treated',note:_T('the editor stood them a round of honeyed wine')});r.mem=r.mem.slice(-5);Store.put('crowd',r.id,r).catch(()=>{});if(S)log(_T`A round of honeyed wine finds its way to <b>${esc(r.name)}</b>. They will remember it.`);renderDrawer();return}
    if(act.dataset.spact==='infl'){
      const name2=$('#spInfl')&&$('#spInfl').value;if(!name2){renderDrawer();return}
      const m=typeof activeMgr==='function'?await activeMgr():null;
      if(!m||m.coin<5){if(typeof mToast==='function')mToast(_T`Buying cheers takes ${coinAmt87(5)} from an active lanista\u2019s treasury.`);if(S)log(_T`Buying cheers takes ${coinAmt87(5)} from an active lanista\u2019s treasury — and yours is `+(m?_T('too light'):_T('not set'))+'.','bad');renderDrawer();return}
      const pr=await getPurse();await setPurse({...pr,coin:pr.coin-5});
      r.patronFav=name2;(r.mem=r.mem||[]).push({d:new Date().toISOString().slice(0,10),kind:'bought',note:_T`took 5 coin to cheer for ${name2} ("purely on merit," they insist)`});r.mem=r.mem.slice(-5);
      Store.put('crowd',r.id,r).catch(()=>{});
      if(S&&S.spect){const sp=S.spect.find(x=>x.rid===r.id&&!x.gone);const pl=S.players.find(p2=>p2.name===name2&&p2.alive);
        if(sp&&pl){sp.fav=pl.id;sp.favCls=pl.cls;slog(_T`<b>${esc(r.name)}</b> suddenly discovers a deep, lifelong admiration for ${esc(name2)}. Completely unrelated: a heavier purse.`,'big')}}
      if(typeof mToast==='function')mToast(_T`📣 Five coin later, <b>${esc(r.name)}</b> is ${esc(name2)}'s loudest supporter.`);
      if(S)log(_T`Five coin later, <b>${esc(r.name)}</b> is ${esc(name2)}'s loudest supporter. Rome runs on conviction like this.`);
      renderDrawer();return}
    if(act.dataset.spact==='sign'){
      if(r.signAsked){renderDrawer();return}
      r.signAsked=1;
      const m=typeof activeMgr==='function'?await activeMgr():null;
      if(!m){r.signAsked=0;if(typeof mToast==='function')mToast(_T('Signing a spectator needs an active lanista — set one in Manager mode.'));if(S)log(_T('Signing a spectator needs an active lanista — set one in Manager mode (or at the Wagers table).'),'bad');renderDrawer();return}
      // they get exactly one offer — and some of them laugh
      const refuse=r.exGlad?0.05:r.trouble?0.12:r.temper==='loyal'?0.5:0.35;
      if(Math.random()<refuse){Store.put('crowd',r.id,r).catch(()=>{});if(typeof mToast==='function')mToast(_T`✖ <b>NO.</b> <b>${esc(r.name)}</b> looks at the practice sword, then at their snack — and keeps the snack. That answer is final.`);
        if(S)log(_T`<b>${esc(r.name)}</b> looks at the practice sword, looks at their ${specLore(r).snack}, and chooses the snack. ${pickOne([_T('\u201cI\u2019ve SEEN what happens down there,\u201d they explain, gesturing at the sand.'),_T('\u201cMy mother didn\u2019t raise a trophy,\u201d they say, not unkindly.'),_T('They laugh so hard the row behind joins in without knowing why.'),_T('\u201cAsk the sausage guy,\u201d they say. The sausage guy also declines.')])}`,'bad');
        renderDrawer();return}
      const w=await activeMgrWorld();if(!w){r.signAsked=0;if(typeof mToast==='function')mToast(_T('Signing a spectator needs an active lanista — set one in Manager mode.'));renderDrawer();return}
      const g=genGlad({rookie:true,ovr:38+rnd(8),name:r.name});g.city=pickOne(HOME_CITIES());g.scout=2;
      g.contract={mgr:m.id,wage:askWage(g),weeks:8,since:w.week};w.glads.push(g);
      r.recruited=1;Store.put('crowd',r.id,r).catch(()=>{});
      if(MGR.world===w)saveWorld(true);else{const pm=w.mgrs.find(x=>x.id===w.playerId);await Store.put('mgrCareers',w.id,{name:pm.name,ludus:pm.ludus,week:w.week,season:w.season,custom:!!pm.custom,dead:!!w.dead,fame:pm.fame,coin:pm.coin,wins:pm.wins,bouts:pm.bouts,betNet:pm.betNet||0,deaths:pm.deaths||0,updated:new Date().toISOString().slice(0,16).replace('T',' '),world:JSON.stringify(w)}).catch(()=>{})}
      if(typeof mToast==='function')mToast(_T`✔ <b>YES.</b> <b>${esc(r.name)}</b> signs with ${esc(m.ludus)} as a raw recruit (rated ${effOvr(g)}) — on your Roster now.`);
      if(S)log(_T`<b>${esc(r.name)}</b> puts down the ${specLore(r).snack} and picks up a practice sword: signed to ${esc(m.ludus)} as a raw recruit (rated ${effOvr(g)}).`,'big');
      renderDrawer();return}
  }
});
/* B opens the Menagerie, T the Imperium (not while typing or with a window open). */
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)||!$('#modal').hidden)return;
  if(e.key==='b'||e.key==='B'){openMenagerie()}
  if(e.key==='t'||e.key==='T'){openStandsHub()}});
/* loads the arena chronicles at start. */
loadArenas().catch(()=>{});

/* ---- the local crowd: every arena's regulars lean a certain way (multipliers on YOUR sliders) ---- */
const LOC_CROWD={
  1:{n:'sailors and quarrymen — quick tempers, quick coin',act:120,t:{hothead:130,miser:110}},
  2:{n:'old families in good seats — loyal, a little squeamish',act:90,t:{loyal:140,generous:110,bloodthirsty:70}},
  3:{n:'traders of three provinces — tight fists, roving eyes',act:100,t:{miser:130,fickle:120}},
  4:{n:'connoisseurs of the old school — they know good bladework',act:110,t:{loyal:130,bloodthirsty:110}},
  5:{n:'a festival crowd far from Rome — generous and loud',act:130,t:{generous:130,hothead:110}},
  6:{n:'the mob of the capital — fickle and hungry for blood',act:120,t:{fickle:140,bloodthirsty:120}},
  7:{n:'veterans of the legions — loyal, and careful with coin',act:95,t:{loyal:130,miser:120}},
  8:{n:'pleasure-seekers under the mountain — bloodthirsty to a fault',act:125,t:{bloodthirsty:140,hothead:120}},
  9:{n:'merchant princes — offerings rain when they are pleased',act:100,t:{generous:140,miser:80}},
  10:{n:'a hard crowd with long memories',act:105,t:{hothead:130,loyal:110}},
  11:{n:'quiet northerners — hard to stir, harder to lose',act:80,t:{miser:120,loyal:120,hothead:80}},
  12:{n:'dockworkers on payday',act:135,t:{generous:120,hothead:125,fickle:110}},
};
/* locCrowd — the local crowd of the live event's arena (multipliers on your sliders). */
const locCrowd=()=>S&&LOC_CROWD[S.locIdx]||null;

/* ================= v0.41 FAVORITES AND WAGERS =================
   Every regular has a FAVORITE GLADIATOR, chosen by fame and ratings from the fighters of the empire
   (the league when a Manager career is running, your Ludus otherwise, and whoever they have seen fight).
   They follow that fighter to events and arrive backing them. Wagering is its own act: fans put their
   money on their favorite first; some neutrals simply play the odds. */
function spectFavPool(){const out=[];const w=typeof mgrWorldAny==='function'?mgrWorldAny():null;
  if(w&&w.glads)for(const g of w.glads)if(g.alive!==false)out.push({n:g.name,wt:Math.pow((g.fame||0)+5,1.4)*(1+(g.ovr||50)/100)});
  for(const g of (typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE:[]))if(!g.fallen)out.push({n:g.name,wt:Math.pow((g.wins||0)*6+(g.events||0)+5,1.2)});
  if(S&&S.players)for(const p of S.players)if(!out.some(o=>o.n===p.name))out.push({n:p.name,wt:8});
  return out}
/* spectFavEnsure — gives a regular a favorite gladiator from the pool by weight (kept 96% of the time while they still fight). Uses the crowd's own seeded stream (sideRand). */
function spectFavEnsure(reg){if(!reg)return;if(!S._favPool)S._favPool=spectFavPool();const pool=S._favPool;if(!pool.length)return;
  if(reg.favG&&pool.some(o=>o.n===reg.favG)&&sideRand()>0.04)return; // loyalty: a favorite is rarely dropped while they still fight
  const tot=pool.reduce((a,o)=>a+o.wt,0);let x=sideRand()*tot;for(const o of pool){x-=o.wt;if(x<=0){reg.favG=o.n;break}}
  try{Store.put('crowd',reg.id,reg).catch(()=>{})}catch(e){}}
/* the automatic wager: runs once per spectator as they sit — fans back their favorite, some neutrals chase the odds */
function spectWagers(){if(!S||!S.spect||S.sim||HEADLESS)return;let tab=[];try{tab=oddsTable(true)}catch(e){}
  for(const sp of S.spect){if(sp.human||sp.bet||sp.gone)continue;
    let pid=null;if(sp.fav!=null)pid=sp.fav;else if(tab.length&&sideRand()<(sp.temper==='miser'?0.1:0.35)){const pick=sp.taste==='underdog'?tab[tab.length-1]:tab[0];pid=pick&&pick.p?pick.p.id:null}
    if(pid==null)continue;const o=tab.find(x=>x.ps.some(q=>q.id===pid));sp.bet={pid,amt:2,odds:o?+o.odds.toFixed(2):2};
    if(sp.fav==null)slog(_T`<b>${esc(sp.name)}</b> plays the odds: ${cfAmt87(2)} on <b>${esc(S.players[pid].name)}</b>.`)}}

/* ================= v0.42 THE CURTAIN =================
   The editor's box has a velvet curtain. It draws closed when the clean-up crew's show ends (and between
   events), and opens slowly as the next event begins — revealing his face, as the horns sound. */
const CURTAIN={v:1,from:1,to:1,t0:0,dur:2600};
/* curtainTo — animates the editor's curtain open (0) or closed (1). */
function curtainTo(to,dur=2600){if(CURTAIN.to===to)return;CURTAIN.from=curtainV();CURTAIN.to=to;CURTAIN.t0=performance.now();CURTAIN.dur=dur;
  const tick=()=>{try{draw()}catch(e){}if(performance.now()-CURTAIN.t0<CURTAIN.dur+60)requestAnimationFrame(tick)};requestAnimationFrame(tick)}
/* curtainV — how far the curtain is drawn right now (eased). */
function curtainV(){const k=Math.min(1,(performance.now()-CURTAIN.t0)/CURTAIN.dur);const e=k*k*(3-2*k);return CURTAIN.from+(CURTAIN.to-CURTAIN.from)*e}
/* drawCurtain — draws the velvet curtain over Flavius's box. */
function drawCurtain(c2d,cx,cy,w,h){const v=curtainV();if(v<=0.01)return;const x0=cx-w/2+4,y0=cy-h/2+4,iw=w-8,ih=h-8;const half=iw/2*v;
  c2d.save();c2d.beginPath();c2d.rect(x0,y0,iw,ih);c2d.clip();
  for(const side of [0,1]){const L=side?x0+iw-half:x0;const g=c2d.createLinearGradient(L,0,L+half,0);
    for(let i=0;i<=6;i++){const t=i/6;g.addColorStop(t,i%2?'#5e0f14':'#8e1b22')}
    c2d.fillStyle=g;c2d.fillRect(L,y0,half,ih);
    c2d.fillStyle='rgba(0,0,0,.25)';c2d.fillRect(side?L:L+half-2,y0,2,ih)} // the meeting edge
  // the gold valance and a tie-back tassel
  c2d.fillStyle='#c9a458';c2d.fillRect(x0,y0,iw,Math.max(3,ih*0.08));
  c2d.fillStyle='#8a6a2a';for(let i=0;i<8;i++)c2d.fillRect(x0+i*iw/8,y0+Math.max(3,ih*0.08),iw/16,2);
  c2d.restore()}

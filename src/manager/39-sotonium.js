/* =====================================================================
   39-SOTONIUM · THE FAMILY HOUSES (v0.45, reworked v0.46)
   =====================================================================
   One special stable joins a Manager-mode league only when its word is spoken at the version badge
   (see the strategy guide's hidden list); speaking the word again takes the house out of the system.
   The house is run by a father with his famous child on the roster (the table is kept so more houses can be added):
     • Gaius Anatinus Duckio of Puteoli — and his son, SUPDUCUS PRAECLARUS.
   The child:
     • always receives clemency; no Fate, fever, war or maiming takes them; can never be poached;
     • fights only in the MAIN EVENT, and only when the father chooses to send them — more often each season;
     • fights three seasons from the first season kickoff after the house joins (season 1 in a fresh career),
       then takes the rudis and walks free (the Liberti).
   The house starts modest and climbs toward the top of the league while the child fights; once the child
   leaves, it ebbs and flows like any other stable. It never closes while its word stands.
   When a word is spoken again: the house disbands in every career as it loads — the child leaves with the
   father, the other fighters become free agents. */
/* FAMILY_HOUSES — the family house(s): flag (localStorage switch), mgr (the father: name, ludus, city, colour, personality p, portrait parts, bio), child (the star: class, rating ovr/pot, fame, age, history line, out = the retirement news), visitor (the famous spectator entry). */
const FAMILY_HOUSES={
  duckio:{flag:'flavius_house_duckio',mgr:{name:'Gaius Anatinus Duckio',ludus:_T('Ludus Anatinus'),city:'Puteoli',color:'#2f8f7a',
      p:{ambition:70,cunning:55,honor:66,greed:40,show:82,discipline:58,risk:55},portrait:{hair:1,helm:'none',beard:true,bg:7},
      bio:_T('A Puteolan shipowner who made his fortune in the harbour and spends it on the sand. Waddles when he walks, and nobody laughs twice.')},
    child:{name:'Supducus Praeclarus',cls:'hero',fem:false,city:'Puteoli',ovr:92,pot:97,fame:96,age:23,
      hist:_T('fights for his father’s house, the Ludus Anatinus of Puteoli'),
      out:childName=>_T`🗡 <b>${childName}</b> sets down his sword before Gaius Anatinus Duckio and <b>takes the rudis</b>. The harbour of Puteoli rings every bell it has.`},
    visitor:{n:'Gaius Anatinus Duckio',who:_T('shipowner and lanista of Puteoli, father of Supducus Praeclarus'),cls:'hero',line:_T('Gaius Anatinus Duckio waddles to his seat by the harbour gate, trailed by a clerk and a basket of bread for the birds.')}}};
/* houseOn — is this house's word switched on in this browser? */
const houseOn=houseKey=>{try{return localStorage.getItem(FAMILY_HOUSES[houseKey].flag)==='1'}catch(e){return false}};
/* houseToggle — flips the house's switch, syncs the open career at once (not the lesson) and redraws; returns the new state (true = joined). */
function houseToggle(houseKey){const H=FAMILY_HOUSES[houseKey];const on=!houseOn(houseKey);try{if(on)localStorage.setItem(H.flag,'1');else localStorage.removeItem(H.flag)}catch(e){}
  try{const w=typeof MGR!=='undefined'&&MGR.world;if(w&&!w.tutorial){houseSync(w,true);saveWorld(true);if(typeof MGR_REDRAW==='function'&&document.getElementById('mgrBody'))MGR_REDRAW()}}catch(e){}
  return on}
/* houseMgr — the house's lanista in this world (not gone), or undefined. */
const houseMgr=(world,houseKey)=>(world&&world.mgrs||[]).find(m=>m.key===houseKey&&!m.gone);
/* the season the child's three-season clock starts: now, at a fresh season's kickoff, else the next season */
const houseKickoff=world=>((((world.week||1)-1)%12)===0?world.season||1:(world.season||1)+1);
/* houseAdd — adds the house: its lanista (fame 22, 180 coin), the star child (contract 999 weeks, never poached, three-season clock from houseKickoff) and three middling free agents (rating 52-66) signed beside the child; joining → league news. TWEAK: fame/coin, the child's record, 52-66, morale 60-85. */
function houseAdd(world,houseKey,joining){const H=FAMILY_HOUSES[houseKey];if(!world||!world.mgrs||houseMgr(world,houseKey))return;
  const P=H.mgr.portrait;const m={id:'m_'+houseKey,key:houseKey,system:true,family:true,name:H.mgr.name,ludus:H.mgr.ludus,city:H.mgr.city,color:H.mgr.color,p:{...H.mgr.p},
    fame:22,coin:180,wins:0,bouts:0,deaths:0,betNet:0,poached:0,improved:0,bio:H.mgr.bio,pre:true,rivals:{},rivalry:Math.round(Math.random()*6),
    portrait:{skin:SKINS[2]||SKINS[0],hair:HAIRS[P.hair]||HAIRS[0],helm:P.helm,beard:P.beard,long:false,bg:BGS[P.bg]||BGS[0]}};
  world.mgrs.push(m);
  const C=H.child;const start=houseKickoff(world);
  const z=genGlad({cls:C.cls,fem:C.fem,ovr:C.ovr,age:C.age,city:C.city,name:C.name});
  Object.assign(z,{pot:C.pot,fame:C.fame,gem:0,bust:0,pubNoise:0,sotonium:true,starChild:houseKey,noPoach:true,morale:92,scout:2,childStart:start,sotoRetire:start+3,
    rec:{ev:34,w:27,surv:34,kp:22,kn:31},contract:{mgr:m.id,wage:askWage(z),weeks:999,since:world.week||1},debut:{s:world.season||1,wk:world.week||1}});
  world.glads.push(z);ghist(z,C.hist);
  // a modest start: three middling fighters beside the child
  for(let i=0;i<3;i++){let g=world.glads.filter(g=>!g.contract&&g.alive&&g.src==='gen'&&g.ovr>=52&&g.ovr<=66).sort(()=>Math.random()-.5)[0];
    if(!g){g=genGlad({ovr:52+rnd(14)});world.glads.push(g)}g.contract={mgr:m.id,wage:askWage(g),weeks:4+rnd(9),since:world.week||0};g.morale=60+rnd(25)}
  for(const g of world.glads)g.interest=g.interest||{};
  if(joining&&typeof mnews==='function')mnews(_T`🏛 <b>${esc(H.mgr.name)}</b> of ${esc(H.mgr.city)} opens the <b>${esc(H.mgr.ludus)}</b> to the league — with ${C.fem?_T('his daughter'):_T('his son')}, <b>${esc(C.name)}</b>, on the roster (from season ${start}).`,'big')}
/* the word taken back: the house disbands; the child leaves with the father; the rest become free agents */
function houseRemove(world,houseKey){const m=houseMgr(world,houseKey);if(!m)return;const H=FAMILY_HOUSES[houseKey];
  for(const g of world.glads.filter(g=>g.contract&&g.contract.mgr===m.id)){if(g.starChild){g.alive=false;g.retired=true;g.contract=null;ghist(g,_T`left the league with ${H.mgr.name}`)}else{g.contract=null;g.unsigned=0;ghist(g,_T`released when the ${m.ludus} disbanded`)}}
  for(const g of world.glads.filter(g=>g.starChild===houseKey&&g.alive)){g.alive=false;g.retired=true;g.contract=null}
  m.dead=true;m.gone=true;world.mgrs=world.mgrs.filter(x=>x!==m);
  if(n9(world))for(const b of world.night.bouts)if(!b.done)b.ents=b.ents.filter(id=>{const g=gById(id);return g&&g.alive});
  if(typeof mnews==='function')mnews(_T`🏛 The <b>${esc(m.ludus)}</b> closes its gates and leaves the league. Its fighters are free agents now.`,'big');
  try{if(typeof fillNight==='function'&&world.night)fillNight()}catch(e){}}
/* n9 — the world's Match Week bouts, if any. */
const n9=world=>world&&world.night&&world.night.bouts;
/* houseSync — makes the world follow the switches: adds a switched-on house that is missing, removes one switched off (never in the lesson). */
function houseSync(world,loud){if(!world||!world.mgrs||!world.glads||world.tutorial)return;for(const k of Object.keys(FAMILY_HOUSES)){const has=!!houseMgr(world,k);const on=houseOn(k);
  if(on&&!has)houseAdd(world,k,true);else if(!on&&has)houseRemove(world,k)}}
/* does the father send the child out for this main event? more often each season while their clock runs
   starChildFights — true when the child glad is sent into this main event bout (world's season inside the clock). TWEAK: 30% / 55% / 80% by season of the clock. */
function starChildFights(glad,bout,world){if(bout.tier!=='main')return false;const s=world.season||1;if(s<(glad.childStart||1)||s>=(glad.sotoRetire||99))return false;
  const yr=s-(glad.childStart||1);return Math.random()<[0.3,0.55,0.8][Math.min(2,yr)]}
/* season's end: the house climbs while the child fights; three seasons in, the child takes the rudis
   sotoSeason — per house: while the child fights, +16 fame, +220 coin and the best healthy free agent signs; at sotoRetire the child is freed (Liberti entry, news) and the house becomes ordinary. TWEAK: 16, 220, the 10-week contract. */
function sotoSeason(world){for(const k of Object.keys(FAMILY_HOUSES)){const m=houseMgr(world,k);const g=world.glads.find(x=>x.starChild===k&&x.alive);
    if(m&&g&&(world.season||1)>=(g.childStart||1)&&(world.season||1)<(g.sotoRetire||99)){m.fame=clamp((m.fame||0)+16,0,100);m.coin+=220;
      const fa=freeAgents().filter(x=>!x.inj).sort((a,b)=>effOvr(b)-effOvr(a))[0];if(fa){fa.contract={mgr:m.id,wage:askWage(fa),weeks:10,since:world.week};fa.unsigned=0;ghist(fa,_T`signed with the rising ${m.ludus}`)}}
    if(!g||(world.season||1)<(g.sotoRetire||99))continue;
    const m2=g.contract?mgrById(g.contract.mgr):null;ghist(g,_T`took the rudis after three seasons — freedom, with the whole empire on its feet`);
    g.alive=false;g.freed2=true;g.contract=null;try{libertyEntry(g,m2,_T('the Gate of Life'),_T('took the rudis at the height of their fame'))}catch(e){}
    if(m2)m2.family=false; // the house is an ordinary stable now — it ebbs and flows like any other
    if(typeof mnews==='function')mnews(FAMILY_HOUSES[k].child.out(esc(g.name)),'big')}}
/* every career follows the words: houses join or leave as a career loads */
/* wrap mgrMigrate and newWorld: every loaded or new career follows the switches (a new one saves if a house joined). */
/* the retired house (key 'sotonium'): a saved career drops it silently on load — no news; same disbanding as houseRemove. */
function houseDropQuiet(world,key){try{localStorage.removeItem('flavius_house_'+key)}catch(e){}
  const m=world&&world.mgrs&&world.mgrs.find(x=>x.key===key);if(!m)return;
  for(const g of(world.glads||[])){if(g.contract&&g.contract.mgr===m.id){if(g.starChild){g.alive=false;g.retired=true;g.contract=null}else{g.contract=null;g.unsigned=0}}
    else if(g.starChild===key&&g.alive){g.alive=false;g.retired=true;g.contract=null}}
  m.dead=true;m.gone=true;world.mgrs=world.mgrs.filter(x=>x!==m);
  if(n9(world))for(const b of world.night.bouts)if(!b.done)b.ents=b.ents.filter(id=>{const g=gById(id);return g&&g.alive})}
{const _mig=mgrMigrate;mgrMigrate=function(world){world=_mig(world);try{houseDropQuiet(world,'sotonium');houseSync(world)}catch(e){console.error(e)}return world}}
{const _nw=newWorld;newWorld=function(choice){const w=_nw(choice);try{if(!w.tutorial){const n0=w.mgrs.length;houseSync(w);if(w.mgrs.length!==n0)saveWorld(true)}}catch(e){console.error(e)}return w}}
/* the words at the version badge */
if(typeof cheatRegister==='function'){const W2=String.fromCharCode(68,85,67,75,73,79);
  cheatRegister(cheatKey(W2),()=>houseToggle('duckio')?_T`🦆 <b>${W2}.</b> The Ludus Anatinus joins the league — Gaius Anatinus Duckio and Supducus Praeclarus. (Speak it again to remove them.)`:_T`🦆 <b>${W2}.</b> The Ludus Anatinus leaves the league.`,_T('House of Duckio'))}
if(typeof CHEAT_SHOW!=='undefined'){CHEAT_SHOW.push([[75,92,74,82,80,86],_T('🦆 The House of Duckio — Gaius Anatinus Duckio and Supducus Praeclarus join Manager mode (again to remove)')])}
/* the famous visitors — only while their house is in the system */
if(typeof FAMOUS!=='undefined')for(const k of Object.keys(FAMILY_HOUSES)){const V=FAMILY_HOUSES[k].visitor;
  FAMOUS.push({n:V.n,who:V.who,mood:9,gate:()=>houseOn(k),
    fx:players=>{const a=players.filter(p=>p.cls===V.cls);for(const p of a)p.cf+=3;if(!a.length){const p=[...players].sort((x,y)=>y.cf-x.cf)[0];if(p)p.coin+=2;return p?_T`he tips ${esc(p.name)} ${coinAmt87(2)} anyway`:_T('he claps politely')}return _T`he roars for every ${CLASSES[V.cls]?CLASSES[V.cls].name:_T('fighter')}, as he does for his child (${cfAmt87('+3')} each)`},
    line:V.line})}

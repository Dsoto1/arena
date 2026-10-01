/* =====================================================================
   39-SOTONIUM · THE FAMILY HOUSES (v0.45, reworked v0.46)
   =====================================================================
   Two special stables join a Manager-mode league only when their word is spoken at the version badge
   (one word for each house — see the strategy guide's hidden list); speaking the word again takes the
   house out of the system. Each house is run by a father with his famous child on the roster:
     • Richardious Sotonium of Capua (brother of Virgilante Sotonium of Pompeii) — and his daughter,
       THE GREAT ZELDINIUS SOTONIUM of Roma, an Amazonia of immense fame.
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
const FAMILY_HOUSES={
  sotonium:{flag:'flavius_house_sotonium',mgr:{name:'Richardious Sotonium',ludus:'Ludus Sotonium',city:'Capua',color:'#7a2a8a',
      p:{ambition:62,cunning:48,honor:78,greed:35,show:74,discipline:70,risk:42},portrait:{hair:3,helm:'laurel',beard:true,bg:10},
      bio:'Brother of Virgilante Sotonium of Pompeii and father of the Great Zeldinius. A Capuan of the old school: generous with bread, stubborn with his daughter, and never, ever for sale.'},
    child:{name:'The Great Zeldinius Sotonium',cls:'amazonia',fem:true,city:'Roma',ovr:93,pot:98,fame:98,age:24,
      hist:'fights for her father’s house, the Ludus Sotonium of Capua',
      out:c=>`🗡 <b>${c}</b> lays her sword at her father’s feet and <b>takes the rudis</b>. Every arena in the empire stands. Richardious Sotonium weeps openly in the editor’s box.`},
    visitor:{n:'Richardious Sotonium',who:'lanista of Capua, brother of Virgilante Sotonium of Pompeii, father of the Great Zeldinius',cls:'amazonia',line:'Richardious Sotonium of Capua takes his usual seat, a purple cloak over one shoulder and a story about his daughter ready for anyone within earshot.'}},
  duckio:{flag:'flavius_house_duckio',mgr:{name:'Gaius Anatinus Duckio',ludus:'Ludus Anatinus',city:'Puteoli',color:'#2f8f7a',
      p:{ambition:70,cunning:55,honor:66,greed:40,show:82,discipline:58,risk:55},portrait:{hair:1,helm:'none',beard:true,bg:7},
      bio:'A Puteolan shipowner who made his fortune in the harbour and spends it on the sand. Waddles when he walks, and nobody laughs twice.'},
    child:{name:'Supducus Praeclarus',cls:'hero',fem:false,city:'Puteoli',ovr:92,pot:97,fame:96,age:23,
      hist:'fights for his father’s house, the Ludus Anatinus of Puteoli',
      out:c=>`🗡 <b>${c}</b> sets down his sword before Gaius Anatinus Duckio and <b>takes the rudis</b>. The harbour of Puteoli rings every bell it has.`},
    visitor:{n:'Gaius Anatinus Duckio',who:'shipowner and lanista of Puteoli, father of Supducus Praeclarus',cls:'hero',line:'Gaius Anatinus Duckio waddles to his seat by the harbour gate, trailed by a clerk and a basket of bread for the birds.'}}};
const houseOn=k=>{try{return localStorage.getItem(FAMILY_HOUSES[k].flag)==='1'}catch(e){return false}};
function houseToggle(k){const H=FAMILY_HOUSES[k];const on=!houseOn(k);try{if(on)localStorage.setItem(H.flag,'1');else localStorage.removeItem(H.flag)}catch(e){}
  try{const w=typeof MGR!=='undefined'&&MGR.world;if(w&&!w.tutorial){houseSync(w,true);saveWorld(true);if(typeof MGR_REDRAW==='function'&&document.getElementById('mgrBody'))MGR_REDRAW()}}catch(e){}
  return on}
const houseMgr=(w,k)=>(w&&w.mgrs||[]).find(m=>m.key===k&&!m.gone);
/* the season the child's three-season clock starts: now, at a fresh season's kickoff, else the next season */
const houseKickoff=w=>((((w.week||1)-1)%12)===0?w.season||1:(w.season||1)+1);
function houseAdd(w,k,joining){const H=FAMILY_HOUSES[k];if(!w||!w.mgrs||houseMgr(w,k))return;
  const P=H.mgr.portrait;const m={id:'m_'+k,key:k,system:true,family:true,name:H.mgr.name,ludus:H.mgr.ludus,city:H.mgr.city,color:H.mgr.color,p:{...H.mgr.p},
    fame:22,coin:180,wins:0,bouts:0,deaths:0,betNet:0,poached:0,improved:0,bio:H.mgr.bio,pre:true,rivals:{},rivalry:Math.round(Math.random()*6),
    portrait:{skin:SKINS[2]||SKINS[0],hair:HAIRS[P.hair]||HAIRS[0],helm:P.helm,beard:P.beard,long:false,bg:BGS[P.bg]||BGS[0]}};
  w.mgrs.push(m);
  const C=H.child;const start=houseKickoff(w);
  const z=genGlad({cls:C.cls,fem:C.fem,ovr:C.ovr,age:C.age,city:C.city,name:C.name});
  Object.assign(z,{pot:C.pot,fame:C.fame,gem:0,bust:0,pubNoise:0,sotonium:true,starChild:k,noPoach:true,morale:92,scout:2,childStart:start,sotoRetire:start+3,
    rec:{ev:34,w:27,surv:34,kp:22,kn:31},contract:{mgr:m.id,wage:askWage(z),weeks:999,since:w.week||1},debut:{s:w.season||1,wk:w.week||1}});
  w.glads.push(z);ghist(z,C.hist);
  // a modest start: three middling fighters beside the child
  for(let i=0;i<3;i++){let g=w.glads.filter(g=>!g.contract&&g.alive&&g.src==='gen'&&g.ovr>=52&&g.ovr<=66).sort(()=>Math.random()-.5)[0];
    if(!g){g=genGlad({ovr:52+rnd(14)});w.glads.push(g)}g.contract={mgr:m.id,wage:askWage(g),weeks:4+rnd(9),since:w.week||0};g.morale=60+rnd(25)}
  for(const g of w.glads)g.interest=g.interest||{};
  if(joining&&typeof mnews==='function')mnews(`🏛 <b>${esc(H.mgr.name)}</b> of ${esc(H.mgr.city)} opens the <b>${esc(H.mgr.ludus)}</b> to the league — with ${C.fem?'his daughter':'his son'}, <b>${esc(C.name)}</b>, on the roster (from season ${start}).`,'big')}
/* the word taken back: the house disbands; the child leaves with the father; the rest become free agents */
function houseRemove(w,k){const m=houseMgr(w,k);if(!m)return;const H=FAMILY_HOUSES[k];
  for(const g of w.glads.filter(g=>g.contract&&g.contract.mgr===m.id)){if(g.starChild){g.alive=false;g.retired=true;g.contract=null;ghist(g,`left the league with ${H.mgr.name}`)}else{g.contract=null;g.unsigned=0;ghist(g,`released when the ${m.ludus} disbanded`)}}
  for(const g of w.glads.filter(g=>g.starChild===k&&g.alive)){g.alive=false;g.retired=true;g.contract=null}
  m.dead=true;m.gone=true;w.mgrs=w.mgrs.filter(x=>x!==m);
  if(n9(w))for(const b of w.night.bouts)if(!b.done)b.ents=b.ents.filter(id=>{const g=gById(id);return g&&g.alive});
  if(typeof mnews==='function')mnews(`🏛 The <b>${esc(m.ludus)}</b> closes its gates and leaves the league. Its fighters are free agents now.`,'big');
  try{if(typeof fillNight==='function'&&w.night)fillNight()}catch(e){}}
const n9=w=>w&&w.night&&w.night.bouts;
function houseSync(w,loud){if(!w||!w.mgrs||!w.glads||w.tutorial)return;for(const k of Object.keys(FAMILY_HOUSES)){const has=!!houseMgr(w,k);const on=houseOn(k);
  if(on&&!has)houseAdd(w,k,true);else if(!on&&has)houseRemove(w,k)}}
/* does the father send the child out for this main event? more often each season while their clock runs */
function starChildFights(g,b,w){if(b.tier!=='main')return false;const s=w.season||1;if(s<(g.childStart||1)||s>=(g.sotoRetire||99))return false;
  const yr=s-(g.childStart||1);return Math.random()<[0.3,0.55,0.8][Math.min(2,yr)]}
/* season's end: the house climbs while the child fights; three seasons in, the child takes the rudis */
function sotoSeason(w){for(const k of Object.keys(FAMILY_HOUSES)){const m=houseMgr(w,k);const g=w.glads.find(x=>x.starChild===k&&x.alive);
    if(m&&g&&(w.season||1)>=(g.childStart||1)&&(w.season||1)<(g.sotoRetire||99)){m.fame=clamp((m.fame||0)+16,0,100);m.coin+=220;
      const fa=freeAgents().filter(x=>!x.inj).sort((a,b)=>effOvr(b)-effOvr(a))[0];if(fa){fa.contract={mgr:m.id,wage:askWage(fa),weeks:10,since:w.week};fa.unsigned=0;ghist(fa,`signed with the rising ${m.ludus}`)}}
    if(!g||(w.season||1)<(g.sotoRetire||99))continue;
    const m2=g.contract?mgrById(g.contract.mgr):null;ghist(g,`took the rudis after three seasons — freedom, with the whole empire on its feet`);
    g.alive=false;g.freed2=true;g.contract=null;try{libertyEntry(g,m2,'the Gate of Life','took the rudis at the height of their fame')}catch(e){}
    if(m2)m2.family=false; // the house is an ordinary stable now — it ebbs and flows like any other
    if(typeof mnews==='function')mnews(FAMILY_HOUSES[k].child.out(esc(g.name)),'big')}}
/* every career follows the words: houses join or leave as a career loads */
{const _mig=mgrMigrate;mgrMigrate=function(w){w=_mig(w);try{houseSync(w)}catch(e){console.error(e)}return w}}
{const _nw=newWorld;newWorld=function(choice){const w=_nw(choice);try{if(!w.tutorial){const n0=w.mgrs.length;houseSync(w);if(w.mgrs.length!==n0)saveWorld(true)}}catch(e){console.error(e)}return w}}
/* the words at the version badge */
if(typeof cheatRegister==='function'){const W1=String.fromCharCode(67,72,65,82,68),W2=String.fromCharCode(68,85,67,75,73,79);
  cheatRegister(cheatKey(W1),()=>houseToggle('sotonium')?`🏛 <b>${W1}.</b> The Ludus Sotonium joins the league — Richardious and the Great Zeldinius. (Speak it again to remove them.)`:`🏛 <b>${W1}.</b> The Ludus Sotonium leaves the league.`,'House of Sotonium');
  cheatRegister(cheatKey(W2),()=>houseToggle('duckio')?`🦆 <b>${W2}.</b> The Ludus Anatinus joins the league — Gaius Anatinus Duckio and Supducus Praeclarus. (Speak it again to remove them.)`:`🦆 <b>${W2}.</b> The Ludus Anatinus leaves the league.`,'House of Duckio')}
if(typeof CHEAT_SHOW!=='undefined'){CHEAT_SHOW.push([[74,79,72,89,75],'🏛 The House of Sotonium — Richardious and the Great Zeldinius join Manager mode (again to remove)'],[[75,92,74,82,80,86],'🦆 The House of Duckio — Gaius Anatinus Duckio and Supducus Praeclarus join Manager mode (again to remove)'])}
/* the famous visitors — only while their house is in the system */
if(typeof FAMOUS!=='undefined')for(const k of Object.keys(FAMILY_HOUSES)){const V=FAMILY_HOUSES[k].visitor;
  FAMOUS.push({n:V.n,who:V.who,mood:9,gate:()=>houseOn(k),
    fx:ps=>{const a=ps.filter(p=>p.cls===V.cls);for(const p of a)p.cf+=3;if(!a.length){const p=[...ps].sort((x,y)=>y.cf-x.cf)[0];if(p)p.coin+=2;return p?`he tips ${esc(p.name)} 2 coin anyway`:'he claps politely'}return `he roars for every ${CLASSES[V.cls]?CLASSES[V.cls].name:'fighter'}, as he does for his child (+3 CF each)`},
    line:V.line})}

/* =====================================================================
   22-TROPHIES · TROPHY ROOM, THE FLAVIAN AWARDS, THE TROPHY DESIGNER,
   SPECIAL EVENTS (INVITATIONS & TOURNAMENT BRACKETS) AND EARLY BILLING (v0.27)
   =====================================================================
   • trophySVG(def): every trophy is drawn from a small spec — shape, metal, base, topper, gem, inscription.
   • TROPHY_LIB: the built-in silverware (season awards, the three invitationals). CUSTOM.trophies: yours.
   • Manager mode: w.trophies (earned), w.case (12 display slots on three glass shelves — empty until won),
     w.awardShow (the season's envelopes), w.invites / w.special (invitational events that PAUSE the week),
     w.commits (fighters billed early on a future week's card).
   • New event → Tournament: the same bracket engine with your gladiator; winners go to the Annals' trophy case.
   ===================================================================== */

/* ---------------- the drawing ---------------- */
const TR_METALS={gold:['#fff4c2','#e6b93a','#9a6a14'],silver:['#ffffff','#c9ccd3','#6f7580'],bronze:['#ffd9ae','#c27a3a','#6e3b14'],
  iron:['#d8dce0','#8a9097','#40454b'],obsidian:['#77718c','#2a2733','#0b0a10'],marble:['#ffffff','#e6e1d5','#a9a191'],rose:['#ffe0e6','#e7879a','#8e3a4c'],
  /* v0.36: materials, not just metals — woods and stones for the humbler (or odder) prizes */
  electrum:['#fffbe0','#e8d88a','#8f8440'],copper:['#ffd2b8','#c8683e','#6a2d14'],oak:['#d8b27a','#9a6a36','#4e3014'],olive:['#d9c79a','#8f7a48','#4a3c1c'],cedar:['#e6a57a','#a8583a','#5a2a18'],
  ebony:['#6a5a52','#2e2420','#0e0a08'],ivory:['#fffdf2','#ece2c6','#a89c7a'],porphyry:['#c78aa0','#7a2e4a','#3a0f20'],lapis:['#9ab8ff','#2f4ea8','#10204e'],jade:['#c8f0d0','#4f9a6a','#1e4a2e'],terracotta:['#f2b48a','#c0663a','#6a2e16']};
const TR_MAT_LBL={gold:'Gold',silver:'Silver',bronze:'Bronze',iron:'Iron',electrum:'Electrum',copper:'Copper',rose:'Rose gold',obsidian:'Obsidian',marble:'Marble',porphyry:'Imperial porphyry',lapis:'Lapis lazuli',jade:'Jade',ivory:'Ivory',terracotta:'Terracotta',oak:'Oak',olive:'Olive wood',cedar:'Cedar of Lebanon',ebony:'Ebony'};
const TR_MAT_GROUPS=[['Metals',['gold','silver','bronze','iron','electrum','copper','rose']],['Stones',['marble','obsidian','porphyry','lapis','jade','ivory','terracotta']],['Woods',['oak','olive','cedar','ebony']]];
const TR_BASES={wood:['#6b4527','#3a2414'],marble:['#e9e5da','#aaa292'],obsidian:['#3a3645','#121017'],gold:['#e6b93a','#8a5c10'],porphyry:['#7a2e4a','#3a0f20'],bronze:['#c27a3a','#6e3b14'],travertine:['#e8dcc0','#b4a47e'],cedar:['#a8583a','#5a2a18'],lapis:['#2f4ea8','#10204e'],none:null};
const TR_BASE_LBL=[['wood','Walnut'],['cedar','Cedar'],['marble','Marble'],['travertine','Travertine'],['porphyry','Porphyry'],['lapis','Lapis'],['obsidian','Obsidian'],['bronze','Bronze plinth'],['gold','Gilded'],['none','No base']];
const TR_SHAPES=[['cup','Loving cup'],['bowl','The great bowl (Stanley style)'],['shield','Parade shield'],['laurel','Laurel wreath'],['eagle','Eagle on a column'],['helm','Champion’s galea'],
  ['belt','Championship belt'],['obelisk','Obelisk'],['rudis','The rudis (wooden sword)'],['trident','Trident'],['urn','Amphora'],['sandal','A sandal'],['sponge','A sponge on a stick']];
const TR_TOPPERS=[['','None'],['eagle','Eagle'],['laurel','Laurel'],['star','Star'],['flame','Flame'],['figure','Gladiator'],['crown','Mural crown'],['trident','Little trident'],['sun','Sol Invictus'],['moon','Crescent moon'],['owl','Minerva\u2019s owl']];
let TR_UID=0;
function trophySVG(t,w=90){
  t=t||{};const M=TR_METALS[t.metal]||TR_METALS.gold;const B=TR_BASES[t.base===undefined?'wood':t.base];const u='tr'+(++TR_UID);
  const g=`url(#${u}m)`,gd=M[2],gem=t.gem||'#c0433a';
  const defs=`<defs><linearGradient id="${u}m" x1="0" x2="1"><stop offset="0" stop-color="${M[2]}"/><stop offset=".35" stop-color="${M[0]}"/><stop offset=".6" stop-color="${M[1]}"/><stop offset="1" stop-color="${M[2]}"/></linearGradient>
    ${B?`<linearGradient id="${u}b" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${B[0]}"/><stop offset="1" stop-color="${B[1]}"/></linearGradient>`:''}</defs>`;
  const S=`stroke="${gd}" stroke-width="1.2"`;let body='';
  switch(t.shape||'cup'){
    case 'bowl':body=`<path d="M22 24Q50 38 78 24L74 32Q50 44 26 32Z" fill="${g}" ${S}/><rect x="36" y="38" width="28" height="16" fill="${g}" ${S}/><rect x="32" y="54" width="36" height="18" fill="${g}" ${S}/><rect x="28" y="72" width="44" height="26" fill="${g}" ${S}/>
      ${[58,62,66,76,82,88,94].map(y=>`<line x1="${y<72?33:29}" x2="${y<72?67:71}" y1="${y}" y2="${y}" stroke="${gd}" stroke-width=".5" opacity=".6"/>`).join('')}<circle cx="50" cy="46" r="3" fill="${gem}"/>`;break;
    case 'shield':body=`<rect x="46" y="76" width="8" height="24" fill="${g}" ${S}/><circle cx="50" cy="48" r="30" fill="${g}" ${S}/><circle cx="50" cy="48" r="24" fill="none" stroke="${gd}" stroke-width="1.4"/><circle cx="50" cy="48" r="7" fill="${gem}" stroke="${gd}"/>${[0,60,120,180,240,300].map(a=>`<circle cx="${50+Math.cos(a*Math.PI/180)*27}" cy="${48+Math.sin(a*Math.PI/180)*27}" r="1.6" fill="${gd}"/>`).join('')}`;break;
    case 'laurel':body=`<rect x="47" y="70" width="6" height="30" fill="${g}" ${S}/>${Array.from({length:9},(_,i)=>{const a=(200+i*16)*Math.PI/180,b=(-20-i*16)*Math.PI/180;const L=(x,y,r)=>`<ellipse cx="${x}" cy="${y}" rx="7" ry="3" transform="rotate(${r} ${x} ${y})" fill="${g}" ${S}/>`;
      return L(50+Math.cos(a)*26,44+Math.sin(a)*26,a*180/Math.PI+90)+L(50+Math.cos(b)*26,44+Math.sin(b)*26,b*180/Math.PI+90)}).join('')}<circle cx="50" cy="72" r="4" fill="${gem}"/>`;break;
    case 'eagle':body=`<rect x="42" y="56" width="16" height="44" fill="${g}" ${S}/><rect x="38" y="54" width="24" height="5" fill="${g}" ${S}/><path d="M50 52L44 40L20 30L30 42L14 40L28 50L42 50Z M50 52L56 40L80 30L70 42L86 40L72 50L58 50Z" fill="${g}" ${S}/><path d="M46 44Q50 26 54 44Z" fill="${g}" ${S}/><circle cx="50" cy="32" r="4.5" fill="${g}" ${S}/><path d="M53 32L58 34L53 35Z" fill="${gd}"/>`;break;
    case 'helm':body=`<path d="M28 70Q26 30 50 26Q74 30 72 70L64 70L62 58L38 58L36 70Z" fill="${g}" ${S}/><path d="M50 26Q46 12 34 10Q52 4 66 12Q56 14 50 26Z" fill="${gem}" stroke="${gd}"/><rect x="40" y="58" width="20" height="4" fill="${gd}" opacity=".6"/><rect x="44" y="72" width="12" height="26" fill="${g}" ${S}/>`;break;
    case 'belt':body=`<rect x="10" y="62" width="80" height="16" rx="3" fill="#3b2a20" stroke="#1d130d"/><ellipse cx="50" cy="70" rx="20" ry="16" fill="${g}" ${S}/><ellipse cx="50" cy="70" rx="13" ry="10" fill="none" stroke="${gd}"/><circle cx="50" cy="70" r="5" fill="${gem}"/>${[20,28,72,80].map(x=>`<rect x="${x-3}" y="65" width="6" height="10" fill="${g}" ${S}/>`).join('')}<rect x="30" y="86" width="40" height="12" fill="${g}" ${S}/>`;break;
    case 'obelisk':body=`<path d="M40 98L44 24L50 14L56 24L60 98Z" fill="${g}" ${S}/><line x1="50" y1="14" x2="50" y2="98" stroke="${gd}" stroke-width=".6" opacity=".5"/><circle cx="50" cy="40" r="3.5" fill="${gem}"/>${[54,64,74,84].map(y=>`<line x1="${43+ (98-y)/30}" x2="${57-(98-y)/30}" y1="${y}" y2="${y}" stroke="${gd}" stroke-width=".5"/>`).join('')}`;break;
    case 'rudis':body=`<path d="M47 16L53 16L54 70L46 70Z" fill="${g}" ${S}/><path d="M50 8L54 16L46 16Z" fill="${g}" ${S}/><rect x="36" y="70" width="28" height="5" rx="2" fill="${g}" ${S}/><rect x="47" y="75" width="6" height="16" fill="#6b4527"/><circle cx="50" cy="94" r="4" fill="${gem}" stroke="${gd}"/>`;break;
    case 'trident':body=`<rect x="48" y="30" width="4" height="70" fill="${g}" ${S}/><path d="M34 12L36 34Q50 42 64 34L66 12L62 12L60 30Q56 32 52 32L52 8L48 8L48 32Q44 32 40 30L38 12Z" fill="${g}" ${S}/><circle cx="50" cy="48" r="3.5" fill="${gem}"/>`;break;
    case 'urn':body=`<path d="M40 22L60 22L58 30Q76 44 66 76Q60 92 50 92Q40 92 34 76Q24 44 42 30Z" fill="${g}" ${S}/><path d="M42 32Q28 30 32 48" fill="none" stroke="${gd}" stroke-width="3"/><path d="M58 32Q72 30 68 48" fill="none" stroke="${gd}" stroke-width="3"/><circle cx="50" cy="58" r="4" fill="${gem}"/><rect x="44" y="92" width="12" height="8" fill="${g}" ${S}/>`;break;
    case 'sandal':body=`<rect x="46" y="64" width="8" height="36" fill="${g}" ${S}/><path d="M30 60Q26 30 44 24Q60 22 66 40Q72 58 60 64Z" fill="${g}" ${S}/><path d="M34 34L64 42M32 44L66 50M36 54L62 58" stroke="#5a3b22" stroke-width="3"/><circle cx="48" cy="30" r="3" fill="${gem}"/>`;break;
    case 'sponge':body=`<rect x="48" y="40" width="4" height="60" fill="#6b4527"/><path d="M36 22Q34 8 50 10Q68 8 64 24Q70 36 54 40Q38 42 36 30Z" fill="${g}" ${S}/>${[[44,18],[54,16],[58,28],[46,30],[52,24]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.8" fill="${gd}" opacity=".6"/>`).join('')}`;break;
    default: /* cup */ body=`<path d="M30 22L70 22Q72 58 50 66Q28 58 30 22Z" fill="${g}" ${S}/><path d="M30 28Q14 28 18 44Q22 56 36 56" fill="none" stroke="${gd}" stroke-width="4"/><path d="M30 28Q14 28 18 44Q22 56 36 56" fill="none" stroke="${M[1]}" stroke-width="2"/><path d="M70 28Q86 28 82 44Q78 56 64 56" fill="none" stroke="${gd}" stroke-width="4"/><path d="M70 28Q86 28 82 44Q78 56 64 56" fill="none" stroke="${M[1]}" stroke-width="2"/><rect x="46" y="66" width="8" height="20" fill="${g}" ${S}/><ellipse cx="50" cy="90" rx="16" ry="5" fill="${g}" ${S}/><circle cx="50" cy="40" r="4" fill="${gem}" stroke="${gd}"/>`;
  }
  const topY={cup:22,bowl:24,shield:18,laurel:18,eagle:26,helm:10,belt:54,obelisk:14,rudis:8,trident:8,urn:22,sandal:22,sponge:10}[t.shape||'cup']||20;
  let top='';const ty=topY-4;
  if(t.topper==='star')top=`<path d="M50 ${ty-12}L53 ${ty-4}L61 ${ty-4}L55 ${ty+1}L57 ${ty+9}L50 ${ty+4}L43 ${ty+9}L45 ${ty+1}L39 ${ty-4}L47 ${ty-4}Z" fill="${g}" ${S}/>`;
  else if(t.topper==='flame')top=`<path d="M50 ${ty-14}Q58 ${ty-4} 54 ${ty+2}Q52 ${ty-4} 50 ${ty-2}Q48 ${ty+4} 46 ${ty}Q42 ${ty-6} 50 ${ty-14}Z" fill="#ff8a3a" stroke="#c0431a"/>`;
  else if(t.topper==='eagle')top=`<path d="M50 ${ty+2}L40 ${ty-6}L32 ${ty-4}L40 ${ty}L50 ${ty+4}L60 ${ty}L68 ${ty-4}L60 ${ty-6}Z" fill="${g}" ${S}/><circle cx="50" cy="${ty-5}" r="3" fill="${g}" ${S}/>`;
  else if(t.topper==='laurel')top=Array.from({length:5},(_,i)=>`<ellipse cx="${42+i*4}" cy="${ty-2-Math.abs(2-i)*-1}" rx="3.2" ry="1.6" transform="rotate(${-40+i*20} ${42+i*4} ${ty-2})" fill="${g}" ${S}/>`).join('');
  else if(t.topper==='figure')top=`<circle cx="50" cy="${ty-12}" r="3" fill="${g}" ${S}/><path d="M46 ${ty-8}L54 ${ty-8}L55 ${ty+2}L52 ${ty+2}L50 ${ty-2}L48 ${ty+2}L45 ${ty+2}Z" fill="${g}" ${S}/><path d="M54 ${ty-6}L62 ${ty-14}" stroke="${gd}" stroke-width="1.6"/>`;
  else if(t.topper==='crown')top=`<path d="M38 ${ty+2}L38 ${ty-8}L42 ${ty-4}L46 ${ty-10}L50 ${ty-4}L54 ${ty-10}L58 ${ty-4}L62 ${ty-8}L62 ${ty+2}Z" fill="${g}" ${S}/><circle cx="50" cy="${ty-2}" r="1.8" fill="${gem}"/>`;
  else if(t.topper==='trident')top=`<path d="M49 ${ty+2}L49 ${ty-8}L45 ${ty-8}L45 ${ty-14}L47 ${ty-14}L47 ${ty-10}L49 ${ty-10}L49 ${ty-16}L51 ${ty-16}L51 ${ty-10}L53 ${ty-10}L53 ${ty-14}L55 ${ty-14}L55 ${ty-8}L51 ${ty-8}L51 ${ty+2}Z" fill="${g}" ${S}/>`;
  else if(t.topper==='sun')top=`<circle cx="50" cy="${ty-6}" r="5" fill="${g}" ${S}/>${Array.from({length:8},(_,i)=>{const a=i*Math.PI/4;return `<line x1="${50+Math.cos(a)*7}" y1="${ty-6+Math.sin(a)*7}" x2="${50+Math.cos(a)*10}" y2="${ty-6+Math.sin(a)*10}" stroke="${gd}" stroke-width="1.4"/>`}).join('')}`;
  else if(t.topper==='moon')top=`<path d="M54 ${ty-14}A8 8 0 1 0 54 ${ty+2}A6 6 0 1 1 54 ${ty-14}Z" fill="${g}" ${S}/>`;
  else if(t.topper==='owl')top=`<ellipse cx="50" cy="${ty-5}" rx="5.5" ry="7" fill="${g}" ${S}/><circle cx="48" cy="${ty-8}" r="1.6" fill="${gem}"/><circle cx="52" cy="${ty-8}" r="1.6" fill="${gem}"/><path d="M46 ${ty-12}L47 ${ty-15}L49 ${ty-12}M51 ${ty-12}L53 ${ty-15}L54 ${ty-12}" fill="none" stroke="${gd}"/>`;
  const ins=String(t.ins||t.name||'').slice(0,14);
  const base=B?`<rect x="22" y="100" width="56" height="8" rx="1" fill="url(#${u}b)"/><rect x="18" y="108" width="64" height="22" rx="2" fill="url(#${u}b)"/><rect x="30" y="113" width="40" height="11" rx="1" fill="${g}" stroke="${gd}" stroke-width=".6"/><text x="50" y="121" text-anchor="middle" font-size="5.6" font-family="Georgia,serif" fill="#2a1a08">${esc(ins)}</text>`:'';
  const sc=typeof scbLayersSVG==='function'?scbLayersSVG(t):(t.layers||[]).map(L=>typeof shapeSVG==='function'?shapeSVG(L):'').join(''); // v0.36: sculpted details, drawn over the casting
  return `<svg class="trsvg" viewBox="0 0 100 134" width="${w}" height="${Math.round(w*1.34)}" role="img" aria-label="${esc(t.name||'Trophy')}">${defs}${base}${body}${top}${sc}</svg>`;
}

/* ---------------- the silverware ---------------- */
const TROPHY_LIB=[
  {id:'flavian_cup',name:'The Flavian Cup',desc:'Lanista of the Season — top of the league table.',shape:'bowl',metal:'gold',base:'marble',topper:'eagle',gem:'#7a1f1f',ins:'LANISTA',rewards:{coin:100,fame:6},cat:'season'},
  {id:'palm_roma',name:'The Superbus Cup',desc:'Champion of the Flavius Superbus — the great final of the season in Roma.',shape:'bowl',metal:'gold',base:'obsidian',topper:'figure',gem:'#2e6a3a',ins:'SUPERBUS',rewards:{coin:60,fame:5,cf:4},cat:'season'},
  {id:'aureus',name:'The Aureus Gladius',desc:'Gladiator of the Season: most wins on the sand.',shape:'rudis',metal:'gold',base:'wood',topper:'laurel',gem:'#c0433a',ins:'GLADIATOR',rewards:{coin:40,fame:4,cf:3},cat:'season'},
  {id:'tiro',name:'The Tiro Laurel',desc:'Rookie of the Season: the best first season on the sand.',shape:'laurel',metal:'bronze',base:'wood',topper:'',gem:'#4f9a57',ins:'TIRO',rewards:{coin:25,fame:3,cf:2},cat:'season'},
  {id:'iron_thumb',name:'The Iron Thumb',desc:'Most gladiators beaten on the sand this season.',shape:'helm',metal:'iron',base:'obsidian',topper:'',gem:'#c0433a',ins:'EXECUTIONER',rewards:{coin:25,fame:2},cat:'season'},
  {id:'horn',name:'The Bestiarius Horn',desc:'Most beasts brought down this season.',shape:'urn',metal:'bronze',base:'wood',topper:'',gem:'#d6ab4c',ins:'BESTIARIUS',rewards:{coin:25,fame:2},cat:'season'},
  {id:'darling',name:'Darling of the Stands',desc:'The single greatest Fate score of the season.',shape:'shield',metal:'silver',base:'marble',topper:'star',gem:'#e07b9a',ins:'DARLING',rewards:{coin:30,fame:3,cf:3},cat:'season'},
  {id:'vulcan',name:'The Hammer of Vulcan',desc:'Most damage dealt this season.',shape:'cup',metal:'iron',base:'obsidian',topper:'flame',gem:'#ff6a2a',ins:'VULCAN',rewards:{coin:20,fame:2},cat:'season'},
  {id:'aegis',name:'The Aegis of Minerva',desc:'The hardest to kill: most bouts walked away from this season.',shape:'shield',metal:'silver',base:'obsidian',topper:'laurel',gem:'#5fc7c0',ins:'UNBROKEN',rewards:{coin:25,fame:2},cat:'season'},
  {id:'rising',name:'The Rising Star',desc:'The biggest leap in rating this season — the drills paid off.',shape:'obelisk',metal:'gold',base:'wood',topper:'star',gem:'#9aa6ff',ins:'ASCENDANT',rewards:{coin:20,fame:2,cf:2},cat:'season'},
  {id:'vox',name:'Vox Populi',desc:'The people\u2019s choice: the most fans across the empire.',shape:'urn',metal:'gold',base:'marble',topper:'flame',gem:'#e07b9a',ins:'THE PEOPLE',rewards:{coin:20,fame:3},cat:'season'},
  {id:'sponge',name:'The Golden Sponge',desc:'Soaked up more punishment than anyone alive. Somebody hand them the stick.',shape:'sponge',metal:'gold',base:'wood',topper:'',gem:'#f0cf7d',ins:'ABSORBENT',rewards:{coin:5},cat:'fun'},
  {id:'sandal',name:'The Sandal of Shame',desc:'Most bouts fought without a single win. The crowd loves a trier.',shape:'sandal',metal:'bronze',base:'wood',topper:'',gem:'#8a5c3a',ins:'TRIED HARD',rewards:{fame:1},cat:'fun'},
  {id:'giggle',name:'Tholo’s Giggle',desc:'The lowest Fate score of the season. Tholo is still laughing.',shape:'urn',metal:'rose',base:'wood',topper:'flame',gem:'#6a3a8a',ins:'HEE HEE',rewards:{coin:3},cat:'fun'},
  {id:'purse',name:'The Leaky Purse',desc:'The lanista who lost the most at the betting windows.',shape:'cup',metal:'bronze',base:'wood',topper:'',gem:'#3a3a3a',ins:'BET LESS',rewards:{},cat:'fun'},
  {id:'iron_sandal',name:'The Iron Sandal',desc:'Never missed a night: the most bouts fought this season.',shape:'sandal',metal:'iron',base:'obsidian',topper:'star',gem:'#9aa6ff',ins:'EVERY NIGHT',rewards:{coin:15,fame:1},cat:'fun'},
  {id:'colossus',name:'The Colossus Crown',desc:'Champion of the Colossus Invitational — sixteen of the empire’s best, one crown.',shape:'eagle',metal:'gold',base:'obsidian',topper:'laurel',gem:'#c0433a',ins:'COLOSSUS',rewards:{coin:0,fame:12,cf:5},cat:'special'},
  {id:'trident',name:'The Golden Trident',desc:'Won the Golden Trident Challenge at Pompeii against three invited champions.',shape:'trident',metal:'gold',base:'marble',topper:'',gem:'#3a7fd0',ins:'POMPEII',rewards:{coin:0,fame:9,cf:4},cat:'special'},
  {id:'lion_leptis',name:'The Lion of Leptis',desc:'Took the Leptis Magna Cup: two heats, then a duel in the African sun.',shape:'obelisk',metal:'bronze',base:'marble',topper:'star',gem:'#d6ab4c',ins:'LEPTIS',rewards:{coin:0,fame:7,cf:3},cat:'special'}];
const trophyDef=id=>TROPHY_LIB.find(t=>t.id===id)||((typeof CUSTOM!=='undefined'&&CUSTOM.trophies)||[]).find(t=>t.id===id)||null;
const allTrophyDefs=()=>[...TROPHY_LIB,...((typeof CUSTOM!=='undefined'&&CUSTOM.trophies)||[])];
async function loadTrophies(){try{CUSTOM.trophies=(await Store.list('customTrophies')).sort((a,b)=>String(a.name).localeCompare(b.name))}catch(e){CUSTOM.trophies=CUSTOM.trophies||[]}}
setTimeout(()=>{if(typeof CUSTOM!=='undefined')loadTrophies()},700);
const rewardText=r=>{r=r||{};const p=[];if(r.coin)p.push(`${ICO.coin} ${r.coin} coin`);if(r.cf)p.push(`${ICO.wheat} ${r.cf} CF`);if(r.fame)p.push(`★ ${r.fame} fame`);return p.join(' · ')||'glory alone'};

/* ---------------- earning & the glass case (Manager mode) ---------------- */
const CASE_SLOTS=12;
function earnTrophy(w,tid,o={}){
  const d=trophyDef(tid);if(!d)return null;w.trophies=w.trophies||[];w.case=w.case||Array(CASE_SLOTS).fill(null);
  /* v0.45: the same trophy won again stacks on ONE piece of silver — a count on the plaque and a line in its history */
  const g0=o.gid?gById(o.gid):null;const hEntry={season:w.season,week:w.week,who:o.who||null,gid:o.gid||null,gname:g0?g0.name:null,why:o.why||d.desc};
  trMerge(w);let e=w.trophies.find(t=>t.tid===tid);
  if(e){e.count=(e.count||1)+1;(e.hist=e.hist||[]).push(hEntry);e.season=w.season;e.week=w.week;e.who=o.who||e.who;e.why=o.why||e.why}
  else{e={id:'e'+Date.now().toString(36)+Math.floor(Math.random()*1e4),tid,name:d.name,spec:{shape:d.shape,metal:d.metal,base:d.base,topper:d.topper,gem:d.gem,ins:d.ins,name:d.name},
    season:w.season,week:w.week,why:o.why||d.desc,who:o.who||null,cat:d.cat||'custom',count:1,hist:[hEntry]};
  w.trophies.push(e);const free=w.case.indexOf(null);if(free>=0)w.case[free]=e.id}
  // the rewards: coin and fame to the house, CF banked on the fighter for their next bout
  const m=me(),r=d.rewards||{};if(m){if(r.coin)m.coin+=r.coin;if(r.fame)m.fame=clamp((m.fame||0)+r.fame,0,100)}
  if(r.cf&&o.gid){const g=gById(o.gid);if(g)g.cfBank=(g.cfBank||0)+r.cf}
  if(o.gid){const g=gById(o.gid);if(g){(g.trophies2=g.trophies2||[]).push(d.name);ghist(g,`won ${d.name}`)}}
  tnews(`🏆 <b>${esc(d.name)}</b> comes home to the trophy room${o.who?` — ${esc(o.who)}`:''}. ${rewardText(r)}.`,'big');
  return e}
/* v0.41: the season's two great prizes — and any custom trophy given a gilded frame — glow gold wherever they stand */
const trGilt=t=>!!(t&&(t.gilded||t.id==='palm_roma'||t.id==='flavian_cup'||/^(The Superbus Cup|The Flavian Cup)$/.test(t.name||'')));
/* fold older careers' duplicate pieces into one stacked piece each (count + history) */
function trMerge(w){w.trophies=w.trophies||[];w.case=w.case||Array(CASE_SLOTS).fill(null);const keep={};const out=[];let changed=false;
  for(const t of w.trophies){const h=t.hist||[{season:t.season,week:t.week,who:t.who||null,gid:null,gname:null,why:t.why}];
    const k=t.tid||('n:'+t.name);if(!keep[k]){t.hist=h;t.count=t.count||h.length||1;keep[k]=t;out.push(t);continue}
    const K=keep[k];K.count=(K.count||1)+(t.count||1);K.hist=[...(K.hist||[]),...h].sort((a,b)=>(a.season-b.season)||((a.week||0)-(b.week||0)));
    const last=K.hist[K.hist.length-1];K.season=last.season;K.week=last.week;K.who=last.who||K.who;changed=true;
    w.case=w.case.map(id=>id===t.id?(w.case.includes(K.id)?null:K.id):id)}
  if(changed)w.trophies=out;return w}
function trophyRoomHTML(){
  const w=W_();w.trophies=w.trophies||[];w.case=w.case||Array(CASE_SLOTS).fill(null);trMerge(w);
  const byId=Object.fromEntries(w.trophies.map(t=>[t.id,t]));const sel=MGR.tsel;
  const slot=(i)=>{const t=byId[w.case[i]];const on=sel&&sel.slot===i;
    return `<button type="button" class="tslot${t?' full':''}${t&&trGilt(t.spec)?' gilt':''}${on?' on':''}" data-mg="tslot" data-id="${i}" title="${t?esc(`${t.name} · season ${t.season}${t.who?' · '+t.who:''}`):'An empty place on the shelf'}">${t?`<span class="tlight"></span>${trophySVG(t.spec,74)}${(t.count||1)>1?`<span class="tcount" title="Won ${t.count} times">×${t.count}</span>`:''}<span class="tplaq">${esc(t.name)}<i>S${t.season}${t.who?' · '+esc(t.who):''}</i></span>`:''}</button>`};
  const shelves=[0,1,2].map(r=>`<div class="tshelf">${[0,1,2,3].map(c=>slot(r*4+c)).join('')}</div>`).join('');
  const inCase=new Set(w.case.filter(Boolean));const vault=w.trophies.filter(t=>!inCase.has(t.id));
  const cur=sel&&sel.slot!=null?byId[w.case[sel.slot]]:null;
  const counts={};for(const t of w.trophies)counts[t.name]=(counts[t.name]||0)+(t.count||1);
  return `<div class="troomwrap"><div class="troom-hd"><div><h4 class="secth" style="margin:0">🏆 The trophy room <span class="rc-sub">${w.trophies.reduce((a,t)=>a+(t.count||1),0)} won · ${w.trophies.length} pieces · ${inCase.size} on display</span></h4>
    <p class="rc-sub" style="margin:2px 0 0">Silverware from the Flavian Awards, invitationals and your own events. Click a shelf spot, then choose what stands there — swap them whenever you like.</p></div>
    ${Object.keys(counts).length?`<div class="tcounts">${Object.entries(counts).map(([n,c])=>`<span class="badge gold">${esc(n)}${c>1?' ×'+c:''}</span>`).join('')}</div>`:''}</div>
    <div class="tcase"><div class="tcase-top">${esc(me().ludus)} · HALL OF HONOURS</div><div class="tglass">${shelves}</div><div class="tcase-foot"></div></div>
    <details open style="margin-top:10px"><summary class="rc-sub" style="cursor:pointer">The built-in silverware (${TROPHY_LIB.length}) — what the league and the invitationals award</summary><div class="trlist">${TROPHY_LIB.map(x=>`<div class="trli${trGilt(x)?' gilt':''}">${trophySVG(x,46)}<div><b>${esc(x.name)}</b><div class="rc-sub">${esc(x.desc)}</div><div class="rc-sub">${rewardText(x.rewards)}</div></div></div>`).join('')}</div></details>
    ${!w.trophies.length?`<p class="rc-sub" style="text-align:center;margin-top:10px">The shelves are bare. Win an award at season's end, take an invitational, or win one of your own events with a trophy attached — and the first piece of silver goes up here.</p>`:''}
    ${sel&&sel.slot!=null?`<div class="card2" style="margin-top:10px"><b>Shelf spot ${sel.slot+1}</b> — ${cur?`<b>${esc(cur.name)}</b>${(cur.count||1)>1?` <span class="badge gold">won ×${cur.count}</span>`:''} (season ${cur.season}${cur.who?', '+esc(cur.who):''}) · <span class="rc-sub">${esc(cur.why||'')}</span> <button class="btn" type="button" data-mg="tdown" data-id="${sel.slot}" style="padding:2px 8px">Take it down</button>
      <div class="trhist"><div class="sect" style="margin:6px 0 2px">📜 Its history</div>${(cur.hist||[]).slice().reverse().map(h=>`<div>🏆 Season ${h.season}${h.week?', week '+h.week:''}${h.gname?` — <b>${esc(h.gname)}</b>`:h.who?` — ${esc(h.who)}`:''}<span class="rc-sub">${h.why?' · '+esc(h.why):''}</span></div>`).join('')||'<span class="rc-sub">No record kept.</span>'}</div>`:'empty'}
      ${vault.length?`<div class="tvault">${vault.map(t=>`<button type="button" class="tvi" data-mg="tput" data-id="${t.id}" title="${esc(t.why||'')}">${trophySVG(t.spec,46)}<span>${esc(t.name)}${(t.count||1)>1?' ×'+t.count:''}<i>S${t.season}${t.who?' · '+esc(t.who):''}</i></span><b>${cur?'Swap in':'Display'}</b></button>`).join('')}</div>`:'<p class="rc-sub" style="margin:6px 0 0">Nothing in the storeroom to put here.</p>'}</div>`:''}
    ${vault.length&&!(sel&&sel.slot!=null)?`<div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">📦 The storeroom <span class="rc-sub">${vault.length} not on display — pick a shelf spot to put one up</span></div><div class="tvault">${vault.map(t=>`<span class="tvi">${trophySVG(t.spec,46)}<span>${esc(t.name)}${(t.count||1)>1?' ×'+t.count:''}<i>S${t.season}${t.who?' · '+esc(t.who):''}</i></span></span>`).join('')}</div></div>`:''}</div>`}

/* ---------------- season tallies & the Flavian Awards ---------------- */
function ssTally(g,r,w,won){if(!g)return;if(!g.ss||g.ss.s!==w.season)g.ss={s:w.season,ev:0,w:0,kp:0,kn:0,dmg:0,taken:0,best:0,worst:null};const s=g.ss;
  if(s.o0==null)s.o0=g.ovr;s.ev++;if(won)s.w++;if(r.alive!==false&&!r.dead)s.surv=(s.surv||0)+1;s.kp+=r.kp||0;s.kn+=r.kn||0;s.dmg+=r.dmg||0;s.taken+=r.taken||0;s.best=Math.max(s.best,r.f||0);s.worst=s.worst==null?(r.f||0):Math.min(s.worst,r.f||0)}
function seasonAwards(w,season=w.season){
  const pm=me();const G=w.glads.filter(g=>g.ss&&g.ss.s===season&&g.ss.ev>0);const out=[];
  const ludusOf=g=>{const m=g.contract?mgrById(g.contract.mgr):null;return m};
  const top=(arr,key,filter=()=>true,dir=1)=>arr.filter(filter).sort((a,b)=>dir*(key(b)-key(a))||(b.fame||0)-(a.fame||0))[0]||null;
  const add=(tid,g,m,stat)=>{const d=trophyDef(tid);if(!d)return;const mm=m||(g&&ludusOf(g));out.push({tid,name:d.name,cat:d.cat,desc:d.desc,gid:g?g.id:null,gname:g?g.name:null,mid:mm?mm.id:null,mname:mm?mm.name:null,ludus:mm?mm.ludus:(g?'free agent':null),mine:!!(mm&&mm.isPlayer),stat})};
  // lanista of the season: the most fame (the old "Lanista of the season" line, now with a cup)
  {const m=leagueSort(w.mgrs,season)[0];if(m){const P=msp(m,season);add('flavian_cup',null,m,`${P.pts} points · ${P.w}-${P.b-P.w}`)}}
  if(w.finale&&w.finale.season===season&&w.finale.champ){const g=w.glads.find(x=>x.name===w.finale.champ);add('palm_roma',g||null,g?ludusOf(g):null,`the Flavius Superbus · ${w.finale.f} CF`)}
  {const g=top(G,x=>x.ss.w*100+x.ss.best);if(g&&g.ss.w)add('aureus',g,null,`${g.ss.w} win${g.ss.w===1?'':'s'} in ${g.ss.ev}`)}
  {const g=top(G,x=>x.ss.w*100+x.ss.best,x=>x.debut&&x.debut.s===season);if(g)add('tiro',g,null,`${g.ss.w}-${g.ss.ev-g.ss.w} in their first season`)}
  {const g=top(G,x=>x.ss.kp);if(g&&g.ss.kp)add('iron_thumb',g,null,`${g.ss.kp} gladiators beaten`)}
  {const g=top(G,x=>x.ss.kn);if(g&&g.ss.kn)add('horn',g,null,`${g.ss.kn} beasts downed`)}
  {const g=top(G,x=>x.ss.best);if(g)add('darling',g,null,`${g.ss.best} CF in one night`)}
  {const g=top(G,x=>x.ss.dmg);if(g&&g.ss.dmg)add('vulcan',g,null,`${g.ss.dmg} damage dealt`)}
  {const g=top(G,x=>(x.ss.surv||0)*10+x.ss.ev,x=>x.alive);if(g&&(g.ss.surv||0)>=2)add('aegis',g,null,`walked away from ${g.ss.surv} of ${g.ss.ev} bouts`)}
  {const g=top(G,x=>x.ovr-(x.ss.o0??x.ovr),x=>x.alive);if(g&&g.ovr-(g.ss.o0??g.ovr)>0)add('rising',g,null,`+${g.ovr-g.ss.o0} rating (${g.ss.o0} → ${g.ovr})`)}
  {const fansOf=x=>typeof fansFor==='function'?fansFor(x.name):0;const g=top(G,fansOf);if(g&&fansOf(g))add('vox',g,null,`≈${(fansOf(g)*1000).toLocaleString()} fans`)}
  // and now, the ones the crowd actually stays for
  {const g=top(G,x=>x.ss.taken);if(g&&g.ss.taken)add('sponge',g,null,`${g.ss.taken} damage taken — and still here`)}
  {const g=top(G,x=>x.ss.ev,x=>x.ss.w===0);if(g&&g.ss.ev>=2)add('sandal',g,null,`0 wins in ${g.ss.ev} bouts`)}
  {const g=top(G,x=>-(x.ss.worst??99));if(g)add('giggle',g,null,`${g.ss.worst} CF — a personal worst`)}
  {const s0=(w.ssStart&&w.ssStart.s===season&&w.ssStart.bet)||{};const m=[...w.mgrs].sort((a,b)=>((a.betNet||0)-(s0[a.id]||0))-((b.betNet||0)-(s0[b.id]||0)))[0];const d=m?(m.betNet||0)-(s0[m.id]||0):0;if(m&&d<0)add('purse',null,m,`${d} coin at the betting windows`)}
  {const g=top(G,x=>x.ss.ev);if(g&&g.ss.ev>=4)add('iron_sandal',g,null,`${g.ss.ev} bouts`)}
  // the player's silverware goes into the case (the rewards ride with it)
  for(const a of out)if(a.mine&&!(a.tid==='palm_roma'&&w.finale&&w.finale.cupGiven)){const e=earnTrophy(w,a.tid,{why:`${a.desc} (${a.stat})`,who:a.gname||a.mname,gid:a.gid});if(e)a.eid=e.id}
  w.awardShow={season,awards:out,seen:false};MGR.awI=0;
  mnews(`🎭 <b>The Flavian Awards of season ${season}</b>: ${out.filter(a=>a.cat==='season').map(a=>`${esc(a.name)} to ${esc(a.gname||a.mname)}`).join('; ')}.`,'big');
  (w.awardHist=w.awardHist||[]).push({season,awards:out.map(a=>({name:a.name,cat:a.cat,who:a.gname||a.mname,ludus:a.ludus,mine:a.mine,stat:a.stat}))});if(w.awardHist.length>12)w.awardHist.shift();
}
function awardShowHTML(){
  const w=W_();const A=w.awardShow;if(!A)return '<p>No awards tonight.</p>';const n=A.awards.length;const I=clamp(MGR.awI??0,0,n);
  const card=(a,i)=>{const d=trophyDef(a.tid)||{};const open=i<I;const g=a.gid?gById(a.gid):null;const m=a.mid?mgrById(a.mid):null;
    return `<div class="awcard${open?' open':''}${a.mine?' mine':''}${a.cat==='fun'?' fun':''}">${open?`<div class="awtr">${trophySVG(d,76)}</div><div class="awtxt"><span class="awcat">${a.cat==='fun'?'😄 For the laughs':'🏛 The honours'}</span><b>${esc(a.name)}</b>
      <div class="awwin">${g?gArt(g,'xs'):m&&typeof mgrPortrait==='function'?mgrPortrait(m,'xs'):''}<span><b>${esc(a.gname||a.mname||'—')}</b><br><span class="rc-sub">${esc(a.ludus||'')} · ${esc(a.stat||'')}</span></span></div>
      <span class="rc-sub">${esc(a.desc||'')}</span>${a.mine?`<span class="badge gold" style="margin-top:4px">Yours! → the trophy room · ${rewardText(d.rewards)}</span>`:''}</div>`
      :`<div class="awenv">✉<span>${esc(a.cat==='fun'?'For the laughs':'The honours')} · the envelope, please…</span></div>`}</div>`};
  const given=new Set(A.awards.map(a=>a.tid));const AW_ALL=['flavian_cup','palm_roma','aureus','tiro','iron_thumb','horn','darling','vulcan','aegis','rising','vox','sponge','sandal','giggle','purse','iron_sandal'];
  const empty=I>=n?AW_ALL.filter(t=>!given.has(t)).map(t=>{const d=trophyDef(t)||{};return `<div class="awcard open unclaimed${d.cat==='fun'?' fun':''}"><div class="awtr">${trophySVG(d,76)}</div><div class="awtxt"><span class="awcat">${d.cat==='fun'?'😄 For the laughs':'🏛 The honours'}</span><b>${esc(d.name||'')}</b><span class="rc-sub">Not awarded this season — nobody qualified.</span><span class="rc-sub">${esc(d.desc||'')}</span></div></div>`}).join(''):'';
  return `<div class="awshow"><div class="awstage"><div class="awcurt l"></div><div class="awcurt r"></div><div class="awtitle">🎭 The Flavian Awards<small>Season ${A.season} · live from the Theatre of Marcellus · your host, Flavius himself</small></div></div>
    <div class="awgrid">${A.awards.map(card).join('')}${empty}</div>
    <div class="acts" style="justify-content:center;margin-top:10px">${I<n?`<button class="btn primary" type="button" data-mg="aw_next">✉ Open the next envelope <small>${I+1} of ${n}</small></button><button class="btn" type="button" data-mg="aw_all">Open them all</button>`:''}
      <button class="btn ${I>=n?'primary':''}" type="button" data-mg="aw_done">📰 On to the season recap</button></div></div>`}

/* ---------------- special events: the invitationals ---------------- */
const SPECIALS={
  colossus:{n:'The Colossus Invitational',icon:'🏛',loc:6,kind:'bracket',stages:[{ev:'democritus',size:4,heats:4},{ev:'cassian',size:4,heats:1}],slots:2,opp:[68,86],stars:5,purse:600,appear:15,fame:12,trophy:'colossus',
    blurb:'Sixteen of the empire’s best under the Flavian amphitheater. Four heats of four; each heat’s winner goes through to a Cassian final.',rules:['4 heats of 4 → a final of 4','opponents rated 68–86','the Fate table applies, as in any event','Golden Eagle in the Blessings bag']},
  trident:{n:'The Golden Trident Challenge',icon:'🔱',loc:null,locName:'Pompeii',kind:'single',stages:[{ev:'egidious',size:4,heats:1}],slots:1,opp:[76,90],stars:4,purse:400,appear:20,fame:9,trophy:'trident',
    blurb:'One bout, one night, three invited champions and the biggest crowd of the year on the Bay of Naples.',rules:['a single bout of 4 — you against three champions','opponents rated 76–90','a sold-out house: purses and fame run high','the Fate table applies, as in any event']},
  leptis:{n:'The Leptis Magna Cup',icon:'🦁',loc:null,locName:'Leptis Magna',kind:'bracket',stages:[{ev:'egidious',size:4,heats:2},{ev:'orpheus',size:2,heats:1}],slots:1,opp:[64,82],stars:3,purse:300,appear:12,fame:7,trophy:'lion_leptis',
    blurb:'Two heats in the African sun, then the two heat winners duel for the Lion.',rules:['2 heats of 4 → a duel for the cup','opponents rated 64–82','the Fate table applies, as in any event']}};
// v0.28 THE FLAVIUS SUPERBUS — the season's great final: the top four stables, one fighter each, in Roma
function finaleDef(fd){const FK=FEST_KINDS[fd.kind]||FEST_KINDS.ludi;return {n:'The Flavius Superbus',icon:'🏛',loc:6,kind:'single',stages:[{ev:'cassian',size:4,heats:1}],slots:1,opp:[0,0],stars:5,purse:250,appear:25,fame:10,trophy:'palm_roma',finale:true,season:fd.season,fest:fd.kind,
  blurb:`The great final of season ${fd.season}: the top four stables of the league send their best to Roma. Flavius himself presides; the ${FK.n} gift rides in with every entrant.`,rules:['by invitation only: the top 4 of the league table, one fighter each','a Classic Elimination with Cassian as summa rudis',`${FK.n}: ${FK.boon}`,'the Fate table applies, as in any event']}}
function specDef(sid){if(sid==='finale'){const w=W_();return w&&w.special&&w.special.D&&w.special.D.finale?w.special.D:null}if(SPECIALS[sid]){const D={...SPECIALS[sid]};if(D.loc==null)D.loc=Math.max(1,LOCATIONS.findIndex(L=>L&&L.n===D.locName));return D}
  if(String(sid).startsWith('ce:')){const k=sid.slice(3);const E=EVENTS[k];if(!E)return null;const size=clamp(4,E.min,E.max);
    return {n:E.n,icon:'✦',loc:E.loc||6,kind:'single',stages:[{ev:k,size,heats:1}],slots:1,opp:[62,84],stars:4,purse:320,appear:12,fame:8,trophy:E.trophy,custom:true,fates:!E.nofates,blurb:`Your own event, ${E.n}, staged as an invitational — its trophy goes to the winner.`,rules:[`a single bout of ${size}`,'opponents rated 62–84','your event’s own rules','the Fate table applies, as in any event']}}
  return null}
const starsHTML=n=>`<span class="stars" title="Difficulty ${n} of 5">${'★'.repeat(n)}${'☆'.repeat(5-n)}</span>`;
const absSW=(w,abs)=>{const s=w.season+Math.floor((abs-1)/12)-Math.floor((w.week-1)/12);return {season:s,wk:((abs-1)%12)+1}};
const absDate=(w,abs)=>{const {season,wk}=absSW(w,abs);return empireDate(season,wk).short};
function specWeekStart(w){
  const pm=me();if(!pm)return;
  // the season's opening ledger: fame and betting as the season began (for the awards)
  if(!w.ssStart||w.ssStart.s!==w.season)w.ssStart={s:w.season,bet:Object.fromEntries(w.mgrs.map(m=>[m.id,m.betNet||0])),fame:Object.fromEntries(w.mgrs.map(m=>[m.id,m.fame||0]))};
  w.invites=w.invites||[];
  for(const iv of w.invites){if(iv.status==='open'&&iv.wk<=w.week){iv.status='expired';tnews(`The invitation to <b>${esc(iv.n)}</b> lapsed unanswered.`)}}
  // the Flavius Superbus opens the week after the regular season ends
  if(w.finaleDue&&!w.special){const fd=w.finaleDue;delete w.finaleDue;const D=finaleDef(fd);
    const ents=fd.top4.map(id=>{const m=mgrById(id);const g=m&&rosterOf(m).filter(x=>!x.inj).sort((a,b)=>effOvr(b)-effOvr(a))[0];return g?{gid:g.id,mine:!!m.isPlayer,mid:m.id}:null}).filter(Boolean);
    while(ents.length<4){const g=genGlad({ovr:72+rnd(12)});g.inv=true;ents.push({opp:g})}
    w.special={iid:'finale'+fd.season,sid:'finale',D,stage:0,rounds:[[{ents,res:null}]].map(r=>r),champ:null,done:false,log:[]};w.special.rounds=[[{ents,res:null}]];
    mnews(`🏛 <b>The Flavius Superbus</b> opens in Roma — ${ents.map(e=>esc((specEnt(e)||{}).name||'?')).join(', ')}. The league waits on the final.`,'big')}
  // an accepted invitation falls due: the league pauses for it
  for(const iv of w.invites)if(iv.status==='accepted'&&iv.wk===w.week&&w.special){iv.wk++;tnews(`<b>${esc(iv.n)}</b> is pushed back a week — the league has another event on.`)}
  const due=w.invites.find(iv=>iv.status==='accepted'&&iv.wk===w.week);
  if(due&&!w.special){let D=specDef(due.sid);const mine=(due.ents||[]).map(gById).filter(g=>g&&g.alive&&g.contract&&g.contract.mgr===pm.id&&!g.inj);
    if(!D||!mine.length){due.status='forfeit';pm.fame=clamp((pm.fame||0)-3,0,100);tnews(`Nobody fit to send to <b>${esc(due.n)}</b> — the host is insulted (−3 fame).`,'bad')}
    else{due.status='playing';if(due.exhib){D={...D,n:due.n,fates:false,purse:Math.round(D.purse*0.67),fame:Math.max(3,D.fame-3),rules:[...D.rules.filter(r=>!/Fate table applies/.test(r)),'an EXHIBITION: the host pays the editor — no Fates, purse a third smaller']}}w.special=specBuild(D,due,mine);mnews(`⭐ <b>${esc(D.n)}</b> opens at ${esc(LOCATIONS[D.loc].n)} — the league's week waits on the invitational.`,'big')}}
  // new invitations arrive at the gate
  const live=w.invites.filter(iv=>['open','accepted'].includes(iv.status)).length;
  if(live<2&&Math.random()<0.3&&rosterOf(pm).length){
    let wk=w.week+3+rnd(3);if(wk%12===0)wk++;if(!w.invites.some(iv=>iv.wk===wk&&['open','accepted'].includes(iv.status))){
      const pool=Object.keys(SPECIALS);const ce=((typeof CUSTOM!=='undefined'&&CUSTOM.events)||[]).filter(e=>e.trophy&&EVENTS['ce_'+e.id]).map(e=>'ce:ce_'+e.id);
      const sid=typeof specPickSid==='function'?specPickSid():ce.length&&Math.random()<0.4?pickOne(ce):pickOne(pool);const D=specDef(sid);if(D){
        const exhib=Math.random()<0.4; // v0.30: some hosts pay the editor off — a FATE-FREE exhibition edition, for a smaller purse
        const iv={id:'iv'+Date.now().toString(36),sid,n:exhib?D.n+' (exhibition)':D.n,exhib,wk,status:'open',ents:[],sent:w.week};w.invites.push(iv);
        tnews(`📨 <b>An invitation:</b> ${esc(iv.n)} at ${esc(LOCATIONS[D.loc].n)}, ${absDate(w,wk)} (week ${absSW(w,wk).wk}). ${starsHTML(D.stars)}${exhib?' 🕊 <b>Exhibition edition</b>: the host pays the editor — no Fates, and a third off the purse.':''} Open it on Your ludus.`,'big')}}}
  // early billing: a fighter committed weeks ago tops this week's poster
  const cm=(w.commits||{})[w.week];if(cm){delete w.commits[w.week];const g=gById(cm.gid);
    if(g&&g.alive&&!g.inj&&g.contract&&g.contract.mgr===pm.id){const n=w.night;const o=effOvr(g);
      const already=n.bouts.find(b=>b.ents.includes(g.id));
      const b=already||[...n.bouts].reverse().find(b=>{const T=TIERS[b.tier];return o>=T.lo-6&&o<=T.hi+6&&b.ents.some(id=>{const q=gById(id);return q&&!q.contract})});
      if(b){if(!already){const out=b.ents.map(gById).filter(x=>x&&!x.contract).sort((x,y)=>effOvr(x)-effOvr(y))[0];b.ents[b.ents.indexOf(out.id)]=g.id}
        b.billed=g.id;pm.coin+=10;pm.fame=clamp((pm.fame||0)+1,0,100);g.morale=clamp(g.morale+3,0,100);
        tnews(`📌 <b>${esc(g.name)}</b> tops the posters for the ${TIERS[b.tier].n} — billed ${cm.ahead} weeks ahead: +10 coin appearance, +1 fame, and a 15% purse bonus if they win.`)}
      else tnews(`📌 ${esc(g.name)} was billed for this week, but no bout on the card fits their rating — the billing lapses (no penalty).`)}
    else tnews(`📌 This week's early billing lapsed — ${g?esc(g.name)+' is not fit to fight':'the fighter is gone'} (no penalty).`)}
}
function specAfterApply(b,wins,byId){const w=W_();const pm=me();
  for(const gid of b.ents){const g=gById(gid);const r=byId[gid];if(g&&r)ssTally(g,r,w,wins.has(gid));if(g)g.cfBank=0}
  if(b.billed&&wins.has(b.billed)){const bonus=Math.round(b.purse*0.15);pm.coin+=bonus;tnews(`📌 The billing pays: ${esc((gById(b.billed)||{}).name||'')} won as advertised — +${bonus} coin poster bonus.`)}}
// the bracket: entrants chunked into heats; each heat's winner goes through
function specBuild(D,iv,mine){
  const w=W_();const total=D.stages[0].size*D.stages[0].heats;const ents=mine.slice(0,D.slots).map(g=>({gid:g.id,mine:true}));
  // the field: a few stars of the league's other stables, the rest invited outsiders
  const stars=w.glads.filter(g=>g.alive&&!g.inj&&g.contract&&!mgrById(g.contract.mgr).isPlayer&&effOvr(g)>=D.opp[0]).sort((a,b)=>effOvr(b)-effOvr(a)).slice(0,Math.floor((total-ents.length)/2));
  for(const g of stars)ents.push({gid:g.id});
  while(ents.length<total){const g=genGlad({ovr:D.opp[0]+rnd(D.opp[1]-D.opp[0]+1)});g.inv=true;ents.push({opp:g})}
  // your fighters never meet in the first round
  const heats=Array.from({length:D.stages[0].heats},()=>[]);const mineE=ents.filter(e=>e.mine),rest=shuffle(ents.filter(e=>!e.mine));
  mineE.forEach((e,i)=>heats[i%heats.length].push(e));for(const e of rest){const h=heats.filter(x=>x.length<D.stages[0].size).sort((a,b)=>a.length-b.length)[0];h.push(e)}
  return {iid:iv.id,sid:iv.sid,D,stage:0,rounds:[heats.map(h=>({ents:h,res:null}))],champ:null,done:false,log:[]}}
const specEnt=e=>e.gid?gById(e.gid):e.opp;
function specHeatCfg(T,s,h,watch,human){const hh=T.rounds[s][h];const st=T.D.stages[s];
  const seats=hh.ents.map(e=>{const g=specEnt(e);const m=g&&g.contract?mgrById(g.contract.mgr):null;const seat=seatFor(g,m?m.color:null,human&&e.mine&&e.gid===human);
    const E=EVENTS[st.ev]||{};if(E.classes&&!E.classes.includes(seat.cls))seat.cls=E.classes[0];if(T.D.finale){seat.cfStart=0;seat.coinStart=0;(FEST_KINDS[T.D.fest]||FEST_KINDS.ludi).ap(seat)}return seat});
  return {ev:st.ev,loc:T.D.loc,seats,opts:{mods:true,mandata:!!T.D.custom,optOffers:true,eaglePot:true,spect:watch?'auto':0},mgrTier:'main'}}
function specRecord(T,s,h,res){const hh=T.rounds[s][h];if(hh.res)return;
  const rows=res.rows.map((r,i)=>({i,f:r.f,won:res.winners.includes(r.id),kp:r.kp,kn:r.kn,dmg:r.dmg,taken:r.taken}));
  let wi=rows.find(r=>r.won);if(!wi)wi=[...rows].sort((a,b)=>b.f-a.f)[0];
  hh.res={win:wi.i,rows,turns:res.turns};const w=W_(),pm=me();
  // your fighters: appearance money, a line on their record, and the sand's lessons
  hh.ents.forEach((e,i)=>{if(!e.gid)return;const g=gById(e.gid);if(!g)return;const r=rows[i];const won=i===wi.i;
    g.rec.ev++;if(won)g.rec.w++;g.rec.kp+=r.kp||0;g.rec.kn+=r.kn||0;g.rec.dmg=(g.rec.dmg||0)+(r.dmg||0);g.rec.taken=(g.rec.taken||0)+(r.taken||0);g.rec.best=Math.max(g.rec.best||0,r.f||0);ssTally(g,r,w,won);
    if(e.mine){pm.coin+=T.D.appear;g.morale=clamp(g.morale+(won?8:-4),0,100);if(won)g.fame=clamp((g.fame||0)+3,0,100)}});
  // v0.29: the Fate table applies on invitation sand too (unless the event is set Fate-free)
  if(T.D.fates!==false&&typeof leagueFate==='function')hh.ents.forEach((e,i)=>{if(!e.gid)return;const g=gById(e.gid);if(!g||!g.alive)return;const r=res.rows[i]||{};const m=g.contract?mgrById(g.contract.mgr):null;
    try{const v=leagueFate(g,{f:r.f,fate:r.fate,human:r.human},m,null,-1,{live:false});rows[i].vd=v.vd;rows[i].fname=v.fname;if(v.line)T.log.push(v.line)}catch(err){console.error(err)}});
  {const aliveOk=e=>{const g=specEnt(e);return g&&g.alive!==false};if(!aliveOk(hh.ents[wi.i])){const alt=rows.filter(r=>aliveOk(hh.ents[r.i])).sort((a,b)=>b.f-a.f)[0];if(alt){T.log.push(`${esc((specEnt(hh.ents[wi.i])||{}).name||'The winner')} cannot go on — ${esc((specEnt(hh.ents[alt.i])||{}).name||'?')} advances in their place`);wi=alt;hh.res.win=alt.i}}}
  const wg=specEnt(hh.ents[wi.i]);T.log.push(`${T.rounds.length>1&&s===T.D.stages.length-1?'Final':`Round ${s+1} heat ${h+1}`}: ${wg?wg.name:'?'} (${wi.f} CF)`);
  if(T.rounds[s].every(x=>x.res)){ // next round, or the crown
    const winners=T.rounds[s].map(x=>x.ents[x.res.win]);
    if(s+1<T.D.stages.length){const st=T.D.stages[s+1];const heats=Array.from({length:st.heats},()=>[]);winners.forEach((e,i)=>heats[i%st.heats].push(e));T.rounds.push(heats.map(h2=>({ents:h2,res:null})));T.stage=s+1}
    else{T.champ=winners[0];specCrown(T)}}}
function specCrown(T){const w=W_(),pm=me();const e=T.champ;const g=specEnt(e);const D=T.D;const iv=(w.invites||[]).find(x=>x.id===T.iid);
  if(D.finale){const hh=T.rounds[0][0];const wr=hh.res&&hh.res.rows[hh.res.win];const m=g&&g.contract?mgrById(g.contract.mgr):null;
    w.finale={season:D.season,kind:'the Flavius Superbus',names:hh.ents.map(x=>(specEnt(x)||{}).name),champ:g?g.name:null,champLudus:m?m.ludus:null,f:wr?wr.f:0,turns:hh.res?hh.res.turns:0,cupGiven:!!e.mine};
    if(g){g.fame=clamp((g.fame||0)+20,0,100);ghist(g,`won the Flavius Superbus of season ${D.season} in Roma (${w.finale.f} CF)`)}
    if(m&&!m.isPlayer){m.fame=clamp(m.fame+10,0,100);m.coin+=D.purse}
    try{const ar=(w.archives||[]).find(a=>a.season===D.season);if(ar)ar.finale=w.finale}catch(err){}
    mnews(`🏆 <b>${esc(g?g.name:'?')}</b>${m?` of ${esc(m.ludus)}`:''} wins <b>the Flavius Superbus</b> before a roaring Roma (${w.finale.f} CF).`,'big')}
  if(e.mine){pm.coin+=D.purse;pm.fame=clamp((pm.fame||0)+D.fame,0,100);if(g)g.fame=clamp((g.fame||0)+D.fame,0,100);
    if(D.trophy)earnTrophy(w,D.trophy,{why:`Won ${D.n} (season ${w.season})`,who:g?g.name:null,gid:e.gid});
    if(!D.finale)mnews(`⭐ <b>${esc(g?g.name:'?')}</b> of ${esc(pm.ludus)} wins <b>${esc(D.n)}</b>! +${D.purse} coin, +${D.fame} fame.`,'big')}
  else if(!D.finale){const m=g&&g.contract?mgrById(g.contract.mgr):null;mnews(`⭐ <b>${esc(g?g.name:'?')}</b>${m?` of ${esc(m.ludus)}`:' (an invited outsider)'} wins <b>${esc(D.n)}</b>.`,'big');if(m&&!m.isPlayer){m.coin+=D.purse;m.fame=clamp(m.fame+Math.round(D.fame/2),0,100)}}
  if(iv)iv.status=e.mine?'won':'lost';
  if(D.finale&&typeof seasonAwards==='function')try{seasonAwards(w,D.season)}catch(err){console.error(err)}}
async function specRunNext(){const w=W_();const T=w.special;if(!T||T.champ)return false;const s=T.stage;const h=T.rounds[s].findIndex(x=>!x.res);if(h<0)return false;
  const res=await simEvent(specHeatCfg(T,s,h,false));if(res&&!res.error)specRecord(T,s,h,res);else{T.rounds[s][h].res={win:0,rows:[],turns:0};T.log.push('a heat was called off')}return true}
async function specAutoRun(){let g=0;while(W_().special&&!W_().special.champ&&g++<30)await specRunNext();const T=W_().special;if(T&&T.champ){T.done=true;(W_().specialLog=W_().specialLog||[]).push({n:T.D.n,season:T.D.season||W_().season,champ:(specEnt(T.champ)||{}).name,mine:!!T.champ.mine});W_().special=null}}
function specWatch(h,fight){const w=W_();const T=w.special;if(!T)return;const s=T.stage;const hh=T.rounds[s][h];if(!hh||hh.res)return;
  const human=fight?(hh.ents.find(e=>e.mine)||{}).gid:null;saveWorld(true);modalDismiss();const cfg=specHeatCfg(T,s,h,true,human);cfg.specCtx={cid:w.id,iid:T.iid,stage:s,heat:h,nofates:T.D.fates===false};S&&(S.over=true);startEvent(cfg)}
async function specAfterWatch(res,ctx){if(!MGR.world||MGR.world.id!==ctx.cid){const d=await Store.getDoc('mgrCareers',ctx.cid);if(!d)return;MGR.world=mgrMigrate(JSON.parse(d.world))}
  const w=W_();const T=w.special;if(!T||T.iid!==ctx.iid||T.stage!==ctx.stage)return;specRecord(T,ctx.stage,ctx.heat,res);saveWorld(true)}
function specialHTML(){const w=W_();const T=w.special;const D=T.D;const pm=me();const L=LOCATIONS[D.loc];
  const nm=e=>{const g=specEnt(e);if(!g)return '?';const m=g.contract?mgrById(g.contract.mgr):null;return `<span class="${e.mine?'bmine':''}">${esc(g.name)}</span> <span class="rc-sub">${m?esc(m.ludus):'invited'} · rated ${effOvr(g)}</span>`};
  const col=(rd,s)=>`<div class="bcol"><div class="bcolhd">${s===D.stages.length-1&&D.stages.length>1?'The final':D.stages.length===1?'The bout':`Round ${s+1}`} <span class="rc-sub">${esc((EVENTS[D.stages[s].ev]||{}).n||'')}</span></div>${rd.map((hh,h)=>{
      const mineIn=hh.ents.some(e=>e.mine);const next=!hh.res&&s===T.stage&&!T.champ;
      return `<div class="bheat${hh.res?' done':''}${mineIn?' mine':''}"><div class="bheathd">${rd.length>1?`Heat ${h+1}`:''}${hh.res?` · ${hh.res.turns} turns`:''}</div>${hh.ents.map((e,i)=>`<div class="bent${hh.res&&hh.res.win===i?' win':''}">${hh.res&&hh.res.win===i?'🏆 ':''}${nm(e)}${hh.res&&hh.res.rows[i]?` <span class="bcf">${hh.res.rows[i].f} CF</span>`:''}</div>`).join('')}
        ${next?`<div class="acts" style="margin-top:4px"><button class="btn tksm" type="button" data-mg="sp_run" data-id="${h}">▶ Sim ${rd.length>1?'heat':'it'}</button><button class="btn tksm" type="button" data-mg="sp_watch" data-id="${h}">👁 Watch live</button>${W_().spectOK!==false?`<button class="btn tksm" type="button" data-mg="sp_spect" data-id="${h}">🎟 Spectate · ${T.D.finale?20:10}</button>`:''}${mineIn?`<button class="btn tksm" type="button" data-mg="sp_fight" data-id="${h}">⚔ Fight it</button>`:''}</div>${D.finale&&mineIn&&!hh.res?finalePickHTML(hh):''}`:''}</div>`}).join('')}</div>`;
  const future=D.stages.slice(T.rounds.length).map((st,k)=>`<div class="bcol"><div class="bcolhd">${T.rounds.length+k===D.stages.length-1?'The final':'Round '+(T.rounds.length+k+1)} <span class="rc-sub">${esc((EVENTS[st.ev]||{}).n||'')}</span></div>${Array.from({length:st.heats},()=>`<div class="bheat tbd">${Array.from({length:st.size},()=>'<div class="bent">— to be decided —</div>').join('')}</div>`).join('')}</div>`).join('');
  const cg=T.champ?specEnt(T.champ):null;const td=trophyDef(D.trophy);
  return `${typeof pendingHTML==='function'?pendingHTML():''}<div class="card2 specbox"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">${td?trophySVG(td,64):''}<div style="flex:1;min-width:220px"><div class="rc-sub">${D.finale?`🏛 THE SEASON FINALE · season ${D.season} · by invitation only`:'⭐ SPECIAL EVENT · the league\u2019s week is paused'}</div><b style="font:400 22px var(--display);color:var(--gold2)">${D.icon} ${esc(D.n)}</b>
      <div class="rc-sub">📍 ${esc(L?L.n:'')} · ${starsHTML(D.stars)} · purse ${D.purse} · +${D.fame} fame · ${D.appear} coin a heat for each of yours${td?` · trophy: <b>${esc(td.name)}</b>`:''}${D.finale?' · the champion gains +20 fame':''}</div>${D.finale?`<div class="rc-sub">${esc(D.blurb)}</div>`:''}<div class="rc-sub">${D.rules.map(esc).join(' · ')}</div></div></div>
    <div class="bracket">${T.rounds.map(col).join('')}${future}</div>
    ${T.champ?`<div class="bchamp">${cg?gArt(cg,'sm'):''}<div><div class="rc-sub">CHAMPION</div><b style="font:400 22px var(--display);color:var(--gold2)">${esc(cg?cg.name:'?')}</b>${T.champ.mine?`<div class="badge gold">Yours! ${td?esc(td.name)+' → the trophy room · ':''}+${D.purse} coin · +${D.fame} fame</div>`:''}</div></div>
      <div class="acts" style="justify-content:center"><button class="btn primary" type="button" data-mg="sp_close">${D.finale?'🎭 On to the Flavian Awards':'Close the invitational → back to the week'}</button></div>`
    :`<div class="acts"><button class="btn" type="button" data-mg="sp_all">⏩ Sim everything left</button></div>`}
    <p class="rc-sub" style="margin:6px 0 0">The regular card waits until this is settled. ${D.fates===false?'This event is Fate-free: nobody dies, nobody is freed.':'The <b>Fate table applies</b> after every heat, as in any bout — thumbs, blood money and the rudis wait for you below.'}</p></div>`}

function finalePickHTML(hh){const pm=me();const e=hh.ents.find(x=>x.mine);const ros=rosterOf(pm).filter(g=>!g.inj).sort((a,b)=>effOvr(b)-effOvr(a));
  return `<div class="acts" style="margin-top:4px"><span class="rc-sub" style="align-self:center">Your champion:</span><select class="tin" id="spPick" style="max-width:240px">${ros.map(g=>`<option value="${g.id}" ${e&&e.gid===g.id?'selected':''}>${esc(g.name)} · ${effOvr(g)}</option>`).join('')}</select><button class="btn tksm" type="button" data-mg="sp_pick">Send them</button></div>`}
/* ---------------- invitations on Your ludus, and the Season sidebar ---------------- */
function invitesHTML(compact){const w=W_(),pm=me();const L0=(w.invites||[]).filter(iv=>['open','accepted'].includes(iv.status)).sort((a,b)=>a.wk-b.wk);if(!L0.length&&!(w.special&&!w.special.done))return '';
  const ros=rosterOf(pm).filter(g=>!g.inj).sort((a,b)=>effOvr(b)-effOvr(a));
  const one=iv=>{const D=specDef(iv.sid);if(!D)return '';const td=trophyDef(D.trophy);const L=LOCATIONS[D.loc];const wl=iv.wk-w.week;const open=MGR.ivOpen===iv.id;
    const pick=Array.from({length:D.slots},(_,k)=>`<select class="tin ivsel" style="max-width:230px" id="ivs_${iv.id}_${k}" data-iv="${iv.id}" onchange="ivUniq(this)"><option value="">${k?'— optional 2nd fighter —':'— choose a fighter —'}</option>${ros.map(g=>`<option value="${g.id}" ${iv.ents[k]===g.id?'selected':''} ${iv.ents.some((x,j)=>j!==k&&x===g.id)?'disabled':''}>${esc(g.name)} · ${effOvr(g)}</option>`).join('')}</select>`).join(' ');
    return `<div class="invrow ${iv.status}${open?' open':''}"><div class="invline">${td?trophySVG(td,30):''}<div class="invt"><b>${D.icon} ${esc(iv.n||D.n)}</b>${iv.exhib?' <span class="badge" title="No Fates on this sand; the purse is a third smaller">🕊 exhibition</span>':''} <span class="rc-sub">📍 ${esc(L?L.n:'')} · ${absDate(w,iv.wk)} (in ${wl} wk${wl===1?'':'s'})</span> ${starsHTML(D.stars)} <span class="rc-sub">· win ${iv.exhib?Math.round(D.purse*0.67):D.purse} coin${td?` + ${esc(td.name)}`:''}</span></div>
      ${iv.status==='accepted'?`<span class="badge good">✓ ${iv.ents.map(id=>esc((gById(id)||{}).name||'?')).join(' & ')}</span><button class="btn tksm" type="button" data-mg="iv_withdraw" data-id="${iv.id}" title="The host will remember (−2 fame)">Withdraw</button>`
        :`<button class="btn ${open?'':'primary'} tksm" type="button" data-mg="iv_open" data-id="${iv.id}">${open?'Close':'Answer ▸'}</button>`}</div>
      ${open&&iv.status!=='accepted'?`<div class="invbody"><div class="rc-sub">${esc(D.blurb)}</div><div class="rc-sub">${D.rules.map(esc).join(' · ')} · ${D.appear} coin a heat to appear${td?` · ${esc(td.name)}: ${rewardText(td.rewards)}`:''}</div>
        <div class="acts" style="margin-top:4px">${pick}<button class="btn primary tksm" type="button" data-mg="iv_accept" data-id="${iv.id}">Accept</button><button class="btn tksm" type="button" data-mg="iv_decline" data-id="${iv.id}">Decline</button></div></div>`:''}</div>`};
  const live=w.special&&!w.special.done?`<div class="invrow live"><div class="invline"><span style="font-size:20px">⭐</span><div class="invt"><b>${esc(w.special.D.n)}</b> <span class="rc-sub">is on this week — the league's card waits</span></div><button class="btn primary tksm" type="button" data-mg="tab" data-id="night">Go to it ▸</button></div></div>`:'';
  return `<div class="card2 invbox"><div class="sect" style="margin-top:0">⭐ Special events <span class="rc-sub">invitations arrive 3–5 weeks ahead</span></div>${live}${L0.map(one).join('')}</div>`}
// the second fighter must be a different one: picking a name greys it out in the other slot
function ivUniq(sel){const id=sel.dataset.iv;const all=[...document.querySelectorAll(`select[data-iv="${id}"]`)];const chosen=all.map(x=>x.value);all.forEach((x,i)=>[...x.options].forEach(o=>{o.disabled=!!o.value&&chosen.some((c,j)=>j!==i&&c===o.value)}))}
// v0.28 THE SEASON, IN ONE PLACE: the empire's schedule, your early billing on each row, the invitationals and the Superbus
function seasonTabHTML(){const w=W_(),pm=me();w.commits=w.commits||{};const ros=rosterOf(pm).sort((a,b)=>effOvr(b)-effOvr(a));
  const wk0=((w.week-1)%12)+1;const base=w.week-wk0; // absolute week of this season's week 0
  const rank=leagueSort(w.mgrs).findIndex(m=>m.isPlayer)+1;const ptsGap=Math.max(0,msp(leagueSort(w.mgrs)[3]||pm).pts-msp(pm).pts);
  const row=(abs)=>{const {season,wk}=absSW(w,abs);const f=fixtureFor(season,wk);const E=EVENTS[f.ev]||{};const c=w.commits[abs];const ahead=abs-w.week;const past=abs<w.week,now=abs===w.week;
    const iv=(w.invites||[]).find(x=>x.wk===abs&&['open','accepted','playing'].includes(x.status));
    const bill=past?'<span class="rc-sub">—</span>':now?(()=>{const b=w.night&&w.night.bouts.find(x=>x.billed);return b?`<b>${esc((gById(b.billed)||{}).name||'')}</b> <span class="rc-sub">on the posters</span>`:'<span class="rc-sub">enter on Match Week</span>'})()
      :c?`<b>${esc((gById(c.gid)||{}).name||'?')}</b> ${ahead>=3?`<button class="btn tksm" type="button" data-mg="cm_undo" data-id="${abs}">✕</button>`:'<span class="rc-sub">🔒</span>'}`
      :ahead>=3&&ros.length?`<select class="tin" id="cm_${abs}" style="max-width:128px"><option value="">bill a fighter…</option>${ros.map(g=>`<option value="${g.id}">${esc(g.name)} · ${effOvr(g)}</option>`).join('')}</select><button class="btn tksm" type="button" data-mg="cm_set" data-id="${abs}">📌</button>`:'<span class="rc-sub">closed</span>';
    return `<tr class="${now?'me schednow':''}${past?' spast':''}"><td class="n">${now?'▶ ':''}${wk}</td><td class="rc-sub">${esc(empireDate(season,wk).short)}</td><td>📍 ${esc(LOCATIONS[f.loc].n)}</td>
      <td>${esc(E.n||f.ev)}${/democritus|egidious|cassian/.test(f.ev)?'':' <span class="badge gold" title="A special: riskier, and it pays">special</span>'}${wk===12?' <span class="badge" title="The regular season ends here; the top four are invited to the Flavius Superbus">last regular week</span>':''}${iv?` <span class="badge gold" title="An invitational runs this week, before the regular card">⭐ ${esc(iv.n)}</span>`:''}</td><td class="n">×${f.purse}</td><td class="sbill">${bill}</td></tr>`};
  const rows=[];for(let k=1;k<=12;k++)rows.push(row(base+k));
  const sb=(w.specialLog||[]).filter(x=>/Superbus/.test(x.n));
  const fin=`<tr class="sfinale"><td class="n">🏛</td><td class="rc-sub">after week 12</td><td>📍 Roma</td><td colspan="3"><b>The Flavius Superbus</b> <span class="rc-sub">— by invitation: the top 4 of the league table, one fighter each. You are <b>#${rank}</b> of ${w.mgrs.length} right now${rank<=4?' — in the four':''}. No early billing: invitation only.</span></td></tr>`;
  const next=w.week+8>base+12?(()=>{const r2=[];for(let abs=base+13;abs<=Math.min(w.week+8,base+16);abs++)r2.push(row(abs));return r2.length?`<tr><td colspan="6" class="rc-sub" style="padding-top:8px"><b>Season ${w.season+1}</b> — billing opens early</td></tr>${r2.join('')}`:''})():'';
  return `<div class="seasonhd card2"><div><div class="rc-sub">📅 SEASON ${w.season}</div><b style="font:400 24px var(--display);color:var(--gold2)">Week ${wk0} of 12</b> <span class="rc-sub">· ${esc(empireDate(w.season,wk0).short)}</span></div>
      <div class="sprog">${Array.from({length:12},(_,i)=>`<i class="${i+1<wk0?'done':i+1===wk0?'now':''}" title="Week ${i+1}"></i>`).join('')}<b title="The Flavius Superbus">🏛</b></div>
      <div class="rc-sub" style="text-align:right">League table: <b style="color:var(--gold2)">#${rank}</b> of ${w.mgrs.length} · ${msp(pm).pts} pts<br>${rank<=4?'Superbus-bound if it holds':`${ptsGap} point${ptsGap===1?'':'s'} behind the top four`}</div></div>
    <div class="schedlay"><div style="min-width:0"><div style="overflow-x:auto"><table class="tally stable2"><tr><th>Wk</th><th>Date</th><th>Arena</th><th>Games</th><th>Purse</th><th title="Early billing: name a fighter 3+ weeks ahead">📌 Billing</th></tr>${rows.join('')}${fin}${next}</table></div>
      <p class="rc-sub" style="margin:6px 0 0"><b>📌 Early billing</b> — name a fighter for a week at least 3 weeks away. On the night they are entered in the biggest bout that fits their rating: +10 coin appearance, +1 fame, and a 15% purse bonus if they win. Optional; it lapses harmlessly if they are hurt. Invitationals and the Superbus cannot be billed — they are by invitation.</p></div>
    <div>${invitesHTML(true)||'<div class="card2"><div class="sect" style="margin-top:0">⭐ Special events</div><p class="rc-sub" style="margin:0">No invitations right now. Hosts send them 3–5 weeks ahead; they arrive on Your ludus.</p></div>'}
      ${(w.specialLog||[]).length?`<div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">Past invitationals &amp; finals</div>${w.specialLog.slice(-10).reverse().map(x=>`<div class="${x.mine?'up':''}">S${x.season} · ${esc(x.n)} — ${esc(x.champ||'?')}${x.mine?' 🏆':''}</div>`).join('')}</div>`:''}
      <div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">🏛 The Flavius Superbus</div><p class="rc-sub" style="margin:0">The season's great final — Flavius's own games. When week 12 ends, the top four of the league table (points: a win 3, a runner-up finish 1) each send one fighter to Roma; the league pauses while you watch it live or play it out, and then the Flavian Awards are handed out.${sb.length?` Past champions: ${sb.slice(-4).map(x=>`S${x.season} ${esc(x.champ||'?')}`).join(' · ')}.`:''}</p></div></div></div>`}
function commitsHTML(){const w=W_(),pm=me();w.commits=w.commits||{};const ros=rosterOf(pm).sort((a,b)=>effOvr(b)-effOvr(a));const rows=[];
  for(let abs=w.week+1;abs<=w.week+8;abs++){const {season,wk}=absSW(w,abs);const fx=fixtureFor(season,wk);const c=w.commits[abs];const open=abs-w.week>=3;const iv=(w.invites||[]).find(x=>x.wk===abs&&['open','accepted'].includes(x.status));
    rows.push(`<tr class="${c?'me':''}"><td class="n">${wk}${season!==w.season?` <span class="rc-sub">S${season}</span>`:''}</td><td class="rc-sub">${esc(empireDate(season,wk).short)}</td><td>${esc(LOCATIONS[fx.loc].n)} · ${esc((EVENTS[fx.ev]||{}).short||(EVENTS[fx.ev]||{}).n||'')}${iv?` <span class="badge gold" title="An invitational pauses this week first">⭐ ${esc(iv.n)}</span>`:''}</td>
      <td>${c?`<b>${esc((gById(c.gid)||{}).name||'?')}</b> ${open?`<button class="btn tksm" type="button" data-mg="cm_undo" data-id="${abs}">Withdraw</button>`:'<span class="rc-sub">locked in</span>'}`:open?`<select class="tin" id="cm_${abs}"><option value="">—</option>${ros.map(g=>`<option value="${g.id}">${esc(g.name)} · ${effOvr(g)}</option>`).join('')}</select> <button class="btn tksm" type="button" data-mg="cm_set" data-id="${abs}">Bill early</button>`:'<span class="rc-sub">window closed (under 3 weeks)</span>'}</td></tr>`)}
  return `<div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">📌 Early billing <span class="rc-sub">name a fighter for a future week's card — at least 3 weeks ahead</span></div>
    <p class="rc-sub" style="margin:0 0 6px">A billed fighter goes on the posters: on the night they are entered in the biggest bout that fits their rating, earn +10 coin appearance and +1 fame, and a win pays a 15% poster bonus. Entirely optional — you can always enter fighters on Match Week as usual. If they are hurt or gone by then, the billing simply lapses.</p>
    <table class="tally compact"><tr><th>Wk</th><th>Date</th><th>Fixture</th><th>Billed</th></tr>${rows.join('')}</table></div>`}

/* ---------------- Manager hooks: clicks ---------------- */
async function trophyMgrClick(a,id,b,ctx){const w=W_(),pm=me();if(!w||!pm)return false;const {redraw,say,done}=ctx;
  if(a==='tslot'){const i=+id;MGR.tsel=MGR.tsel&&MGR.tsel.slot===i?null:{slot:i};redraw();return true}
  if(a==='tput'){const i=MGR.tsel&&MGR.tsel.slot;if(i==null)return true;w.case=w.case||Array(CASE_SLOTS).fill(null);const k=w.case.indexOf(id);if(k>=0)w.case[k]=null;w.case[i]=id;saveWorld();redraw();return true}
  if(a==='tdown'){w.case[+id]=null;saveWorld();redraw();return true}
  if(a==='aw_next'){MGR.awI=(MGR.awI||0)+1;if(typeof sfx==='function')sfx(MGR.awI>=(w.awardShow||{awards:[]}).awards.length?'fanfare':'cheer');redraw();return true}
  if(a==='aw_all'){MGR.awI=99;if(typeof sfx==='function')sfx('fanfare');redraw();return true}
  if(a==='aw_done'){if(w.awardShow)w.awardShow.seen=true;MGR.awI=0;saveWorld();MGR.tab='paper';redraw();return true}
  if(a==='iv_accept'){const iv=w.invites.find(x=>x.id===id);const D=iv&&specDef(iv.sid);if(!iv||!D)return true;
    const ids=[...new Set(Array.from({length:D.slots},(_,k)=>{const s=document.getElementById(`ivs_${id}_${k}`);return s?s.value:''}).filter(Boolean))];
    if(!ids.length){say('Choose at least one fighter to send.');return true}MGR.ivOpen=null;iv.ents=ids;iv.status='accepted';saveWorld();say(`✓ Accepted: ${esc(D.n)} — ${ids.map(x=>esc(gById(x).name)).join(' & ')} will travel to ${esc(LOCATIONS[D.loc].n)}.`);return true}
  if(a==='iv_open'){MGR.ivOpen=MGR.ivOpen===id?null:id;redraw();return true}
  if(a==='iv_decline'){const iv=w.invites.find(x=>x.id===id);if(iv){iv.status='declined';saveWorld();say(`Declined with thanks: ${esc(iv.n)}.`)}return true}
  if(a==='iv_withdraw'){const iv=w.invites.find(x=>x.id===id);if(iv){iv.status='declined';pm.fame=clamp((pm.fame||0)-2,0,100);saveWorld();say(`Withdrawn from ${esc(iv.n)} — the host will remember (−2 fame).`)}return true}
  if(a==='cm_set'){const abs=+id;const s=document.getElementById('cm_'+abs);const gid=s&&s.value;if(!gid){say('Pick a fighter to bill.');return true}if(abs-w.week<3){say('The billing window has closed for that week.');return true}
    w.commits=w.commits||{};if(Object.values(w.commits).some(c=>c.gid===gid&&false))return true;w.commits[abs]={gid,ahead:abs-w.week,at:w.week};saveWorld();say(`📌 ${esc(gById(gid).name)} is billed for week ${absSW(w,abs).wk} — ${abs-w.week} weeks ahead.`);return true}
  if(a==='cm_undo'){const abs=+id;if(abs-w.week<3){say('Too late — the posters are printed.');return true}delete w.commits[abs];saveWorld();redraw();return true}
  if(a==='sp_run'){MGR.busy=true;try{await specRunNext()}finally{MGR.busy=false}saveWorld();redraw();return true}
  if(a==='sp_all'){MGR.busy=true;try{let g=0;while(w.special&&!w.special.champ&&g++<30)await specRunNext()}finally{MGR.busy=false}saveWorld();redraw();return true}
  if(a==='sp_watch'){done('spwatch:'+id);return true}
  if(a==='sp_spect'){SPECT.pending=true;done('spwatch:'+id);return true}
  if(a==='sp_fight'){done('spfight:'+id);return true}
  if(a==='sp_close'){const T=w.special;if(T&&T.champ){(w.specialLog=w.specialLog||[]).push({n:T.D.n,season:T.D.finale?T.D.season:w.season,champ:(specEnt(T.champ)||{}).name,mine:!!T.champ.mine});w.special=null;saveWorld();MGR.tab=w.awardShow&&!w.awardShow.seen?'awards':'night';MGR.awI=0;redraw()}return true}
  if(a==='sp_pick'){const T=w.special;const hh=T&&T.rounds[T.stage][0];const sel=document.getElementById('spPick');if(hh&&!hh.res&&sel&&sel.value){const e=hh.ents.find(x=>x.mine);if(e){e.gid=sel.value;saveWorld();say(`${esc(gById(sel.value).name)} will fight for ${esc(pm.ludus)} in the Superbus.`)}}return true}
  return false}

/* ---------------- Tournaments outside Manager mode (New event → Tournament) ---------------- */
let TOURN=null;try{TOURN=JSON.parse(localStorage.getItem('flavius_tourn')||'null')}catch(e){TOURN=null}
const tournSave=()=>{try{localStorage.setItem('flavius_tourn',JSON.stringify(TOURN))}catch(e){}};
function tournChoices(){const o=Object.keys(SPECIALS).map(k=>[k,specDef(k)]);for(const e of ((typeof CUSTOM!=='undefined'&&CUSTOM.events)||[]))if(e.trophy&&EVENTS['ce_'+e.id])o.push(['ce:ce_'+e.id,specDef('ce:ce_'+e.id)]);return o.filter(x=>x[1])}
function tournSetupHTML(tabs){CFG.tSid=CFG.tSid||'leptis';const ch=tournChoices();const D=specDef(CFG.tSid)||ch[0][1];const td=trophyDef(D.trophy);const L=LOCATIONS[D.loc];
  const s=CFG.seats[0];const cls=BASE_CLS;
  return tabs+`<div class="setup-grid"><div>
    <div class="evdesc"><b>Tournaments</b> are brackets of heats: every heat's winner goes through, and the last one standing takes the trophy home to the Annals. You fight your own heats; the other heats are played out by the CPU. Harder than a normal night — the invited field is strong. Every heat plays by the Fate table, like any event (unless the event is set Fate-free).</div>
    ${TOURN&&!TOURN.done?`<div class="card2" style="margin:8px 0;border-color:var(--gold)"><b>A tournament is under way:</b> ${esc(TOURN.D.n)} — <button class="btn primary tksm" type="button" data-tourn="resume">Back to the bracket</button> <button class="btn tksm" type="button" data-tourn="abandon">Abandon it</button></div>`:''}
    <h4>Choose the tournament</h4><div class="items">${ch.map(([k,d])=>{const t=trophyDef(d.trophy);return `<label class="item tpick ${CFG.tSid===k?'on':''}"><input type="radio" name="tsid" value="${esc(k)}" ${CFG.tSid===k?'checked':''}>${t?trophySVG(t,40):''}<span><b>${d.icon} ${esc(d.n)}</b> ${starsHTML(d.stars)}<br><em class="rc-sub" style="font-style:normal">📍 ${esc(LOCATIONS[d.loc]?LOCATIONS[d.loc].n:'')} · ${d.stages.map(st=>st.heats>1?`${st.heats} heats of ${st.size}`:`a ${st.size===2?'duel':'bout of '+st.size}`).join(' → ')}${t?' · '+esc(t.name):''}</em></span></label>`}).join('')}</div>
   </div><div>
    <div class="card2"><div style="display:flex;gap:10px;align-items:center">${td?trophySVG(td,70):''}<div><b style="font:400 20px var(--display);color:var(--gold2)">${D.icon} ${esc(D.n)}</b><div class="rc-sub">📍 ${esc(L?L.n:'')} · ${starsHTML(D.stars)}</div><div class="rc-sub">${esc(D.blurb)}</div></div></div>
      <ul class="rc-sub" style="margin:6px 0 0 16px;padding:0">${D.rules.map(r=>`<li>${esc(r)}</li>`).join('')}<li>Champion takes ${td?`<b>${esc(td.name)}</b> — ${rewardText(td.rewards)} — `:''}into the Annals' trophy case</li></ul></div>
    <h4>Your gladiator</h4><div class="seats">${seatRows(null,1,cls)}</div>
    <p id="setupErr" style="color:var(--blood2);margin-top:8px"></p>
    <div class="mbtns"><button class="btn primary" type="button" id="goBtn">Enter the tournament</button><button class="btn" type="button" id="rulesBtn2">Rules in this build</button></div></div></div>`}
function tournStart(seat){const D=specDef(CFG.tSid);if(!D)return;const total=D.stages[0].size*D.stages[0].heats;
  const me0={seat:{...seat,cpu:false},name:seat.name||CLASSES[seat.cls].hero||'You',human:true};const ents=[me0];
  const used=new Set([seat.cls]);
  while(ents.length<total){const cls=pickOne(BASE_CLS);const o=D.opp[0]+rnd(D.opp[1]-D.opp[0]+1);
    ents.push({name:genName(),seat:{cls,cpu:true,diff:o>=76?'hard':'normal',name:genName(),boost:{ap:clamp(Math.round((o-62)/6),0,5),coin:clamp(Math.round((o-70)/5),0,4),cf:0},rating:o},rating:o})}
  ents.forEach(e=>{if(!e.human)e.name=e.seat.name});
  const heats=Array.from({length:D.stages[0].heats},()=>[]);heats[0].push(ents[0]);for(const e of shuffle(ents.slice(1))){const h=heats.filter(x=>x.length<D.stages[0].size).sort((a,b)=>a.length-b.length)[0];h.push(e)}
  TOURN={sid:CFG.tSid,D,stage:0,rounds:[heats.map(h=>({ents:h,res:null}))],champ:null,done:false,out:false,started:new Date().toISOString().slice(0,10)};tournSave();openTourn()}
function tournCfg(s,h,live){const T=TOURN,hh=T.rounds[s][h],st=T.D.stages[s];const E=EVENTS[st.ev]||{};
  return {ev:st.ev,loc:T.D.loc,seats:hh.ents.map(e=>{const x={...e.seat};if(E.classes&&!E.classes.includes(x.cls))x.cls=E.classes[0];if(!live)x.cpu=true;return x}),opts:{mods:true,mandata:!!T.D.custom,optOffers:true,eaglePot:true,spect:live?'auto':0}}}
function tournRecord(s,h,res){const T=TOURN,hh=T.rounds[s][h];if(hh.res)return;const rows=res.rows.map((r,i)=>({i,f:r.f,won:res.winners.includes(r.id)}));let wi=rows.find(r=>r.won);if(!wi)wi=[...rows].sort((a,b)=>b.f-a.f)[0];
  hh.res={win:wi.i,rows,turns:res.turns};if(hh.ents.some(e=>e.human)&&!hh.ents[wi.i].human)T.out=true;
  if(T.rounds[s].every(x=>x.res)){const winners=T.rounds[s].map(x=>x.ents[x.res.win]);
    if(s+1<T.D.stages.length){const st=T.D.stages[s+1];const hs=Array.from({length:st.heats},()=>[]);winners.forEach((e,i)=>hs[i%st.heats].push(e));T.rounds.push(hs.map(x=>({ents:x,res:null})));T.stage=s+1}
    else{T.champ=winners[0];T.done=true;if(T.champ.human)hallTrophy(T.D.trophy,{who:T.champ.name,why:`Won ${T.D.n}`,cls:T.champ.seat.cls,saved:T.champ.seat.saved}).catch(()=>{})}}
  tournSave()}
async function tournAfter(res,ctx){if(!TOURN)return;tournRecord(ctx.stage,ctx.heat,res)}
async function tournSimRest(stopAtHuman=true){let g=0;while(TOURN&&!TOURN.champ&&g++<40){const s=TOURN.stage;const h=TOURN.rounds[s].findIndex(x=>!x.res);if(h<0)break;
  if(stopAtHuman&&!TOURN.out&&TOURN.rounds[s][h].ents.some(e=>e.human))break;const res=await simEvent(tournCfg(s,h,false));if(res&&!res.error)tournRecord(s,h,res);else{TOURN.rounds[s][h].res={win:0,rows:[],turns:0}}}}
async function openTourn(){if(!TOURN)return;if(typeof modalBusy==='function'&&modalBusy())return;
  await tournSimRest(true);const T=TOURN;const D=T.D;const td=trophyDef(D.trophy);
  const s=T.stage;const h=T.rounds[s]?T.rounds[s].findIndex(x=>!x.res):-1;const mineNext=h>=0&&!T.out&&T.rounds[s][h].ents.some(e=>e.human);
  const col=(rd,si)=>`<div class="bcol"><div class="bcolhd">${si===D.stages.length-1&&D.stages.length>1?'The final':D.stages.length===1?'The bout':'Round '+(si+1)} <span class="rc-sub">${esc((EVENTS[D.stages[si].ev]||{}).n||'')}</span></div>${rd.map((hh,hi)=>`<div class="bheat${hh.res?' done':''}${hh.ents.some(e=>e.human)?' mine':''}">${rd.length>1?`<div class="bheathd">Heat ${hi+1}</div>`:''}${hh.ents.map((e,i)=>`<div class="bent${hh.res&&hh.res.win===i?' win':''}">${hh.res&&hh.res.win===i?'🏆 ':''}<span class="${e.human?'bmine':''}">${esc(e.name)}</span> <span class="rc-sub">${esc(CLASSES[e.seat.cls]?CLASSES[e.seat.cls].name:'')}${e.rating?' · rated '+e.rating:''}</span>${hh.res&&hh.res.rows[i]?` <span class="bcf">${hh.res.rows[i].f} CF</span>`:''}</div>`).join('')}</div>`).join('')}</div>`;
  const future=D.stages.slice(T.rounds.length).map((st,k)=>`<div class="bcol"><div class="bcolhd">${T.rounds.length+k===D.stages.length-1?'The final':'Round '+(T.rounds.length+k+1)}</div>${Array.from({length:st.heats},()=>`<div class="bheat tbd">${Array.from({length:st.size},()=>'<div class="bent">— to be decided —</div>').join('')}</div>`).join('')}</div>`).join('');
  const body=`<div style="display:flex;gap:10px;align-items:center">${td?trophySVG(td,60):''}<div><b style="font:400 22px var(--display);color:var(--gold2)">${D.icon} ${esc(D.n)}</b><div class="rc-sub">📍 ${esc(LOCATIONS[D.loc].n)} · ${starsHTML(D.stars)}</div></div></div>
    <div class="bracket">${T.rounds.map(col).join('')}${future}</div>
    ${T.champ?`<div class="bchamp"><div><div class="rc-sub">CHAMPION</div><b style="font:400 22px var(--display);color:var(--gold2)">${esc(T.champ.name)}</b>${T.champ.human&&td?`<div class="badge gold">${esc(td.name)} → the Annals' trophy case · ${rewardText(td.rewards)}</div>`:''}</div></div>`:T.out?'<p class="rc-sub">You are out of the tournament — the rest of the bracket can be played out to crown a champion.</p>':''}`;
  const btns=T.champ?[{label:'Close',value:'close',primary:1}]:mineNext?[{label:'⚔ Fight your heat',value:'fight',primary:1},{label:'Later',value:'close'}]:[{label:'⏩ Play out the bracket',value:'rest',primary:1},{label:'Later',value:'close'}];
  const v=await modal('🏟 Tournament',body,btns,{wide:1});
  if(v==='fight'){const cfg=tournCfg(s,h,true);cfg.tourn={stage:s,heat:h,final:s===D.stages.length-1,nofates:D.fates===false};startEvent(cfg);return}
  if(v==='rest'){await tournSimRest(false);openTourn();return}
  if(T.champ){TOURN=null;tournSave()}}
// trophies won outside Manager mode stand in the Annals
async function hallTrophy(tid,o={}){const d=trophyDef(tid);if(!d)return;const e={tid,name:d.name,spec:{shape:d.shape,metal:d.metal,base:d.base,topper:d.topper,gem:d.gem,ins:d.ins,name:d.name},who:o.who||'',why:o.why||d.desc,date:new Date().toISOString().slice(0,10),rewards:d.rewards||{}};
  await Store.put('hallTrophies','h'+Date.now().toString(36),e);
  // rewards ride home with a Ludus gladiator: coin into their purse, CF into what they carry
  if(o.saved){const rec=LUDUS_CACHE.find(g=>g.id===o.saved)||await Store.getDoc('gladiators',o.saved).catch(()=>null);if(rec){const r=d.rewards||{};rec.coin=(rec.coin||0)+(r.coin||0);rec.carry=Math.min(25,(rec.carry||0)+(r.cf||0));await Store.put('gladiators',rec.id,rec).catch(()=>{});await loadLudus().catch(()=>{})}}
  if(typeof mToast==='function')mToast(`🏆 <b>${esc(d.name)}</b> goes into the Annals' trophy case — ${esc(o.who||'')}`);if(typeof sfx==='function')sfx('fanfare')}
async function hallTrophiesHTML(){const L0=(await Store.list('hallTrophies').catch(()=>[])).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  /* v0.45: the same trophy won twice stands ONCE, with a count and its history (who won it, when) */
  const G={};const L=[];for(const t of L0){const k=t.tid||t.name;if(!G[k]){G[k]={...t,count:0,hist:[]};L.push(G[k])}G[k].count++;G[k].hist.push({who:t.who,date:t.date,why:t.why})}
  const n=Math.max(12,Math.ceil(L.length/4)*4); // v0.41: room for a dozen at least
  return `<p>Trophies won outside Manager mode — tournaments from New event → Tournament, and your own events with a trophy attached. Manager careers keep theirs in their own trophy rooms.</p>
    <div class="tcase"><div class="tcase-top">THE ANNALS · TROPHY CASE</div><div class="tglass">${Array.from({length:n/4},(_,r)=>`<div class="tshelf">${Array.from({length:4},(_,c)=>{const t=L[r*4+c];return `<div class="tslot${t?' full':''}${t&&trGilt(t.spec)?' gilt':''}" title="${t?esc(`${t.name}${t.count>1?' · won '+t.count+' times':''}\n`+t.hist.map(h=>`${h.date} · ${h.who||'—'}`).join('\n')):''}">${t?`<span class="tlight"></span>${trophySVG(t.spec,74)}${t.count>1?`<span class="tcount">×${t.count}</span>`:''}<span class="tplaq">${esc(t.name)}<i>${esc(t.who)} · ${esc(t.date)}</i></span>`:''}</div>`}).join('')}</div>`).join('')}</div><div class="tcase-foot"></div></div>
    ${L.length?`<details style="margin-top:8px"><summary class="rc-sub" style="cursor:pointer">📜 Every trophy's history (${L0.length} won)</summary><div class="trhist" style="max-height:none;margin-top:4px">${L.map(t=>`<div><b>${esc(t.name)}</b>${t.count>1?` <span class="badge gold">×${t.count}</span>`:''}<div class="rc-sub" style="padding-left:12px">${t.hist.map(h=>`${esc(h.date||'')} — ${esc(h.who||'—')}`).join('<br>')}</div></div>`).join('')}</div></details>`:'<p class="rc-sub" style="text-align:center">Empty shelves. Win a tournament, or one of your own events with a trophy attached.</p>'}
    <details open style="margin-top:10px"><summary class="rc-sub" style="cursor:pointer">The built-in silverware (${TROPHY_LIB.length}) — what the league and the invitationals award</summary><div class="trlist">${TROPHY_LIB.map(x=>`<div class="trli${trGilt(x)?' gilt':''}">${trophySVG(x,46)}<div><b>${esc(x.name)}</b><div class="rc-sub">${esc(x.desc)}</div><div class="rc-sub">${rewardText(x.rewards)}</div></div></div>`).join('')}</div></details>`} // v0.36: the same folded list the Creator Studio shows

/* ---------------- Creator Studio → Trophies ---------------- */
function blankTrophy(){return {id:'ct'+Date.now().toString(36),name:'',desc:'',shape:'none',layers:[],baked:[],metal:'gold',base:'wood',topper:'',gem:'#c0433a',ins:'',rewards:{coin:50,cf:0,fame:3},cat:'custom'}}
function trophyStudioHTML(){ST.trd=ST.trd||blankTrophy();const t=ST.trd;const L=(CUSTOM.trophies||[]);
  const sel=(f,opts,v)=>`<select data-trf="${f}">${opts.map(([k,l])=>`<option value="${esc(k)}" ${String(v)===String(k)?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
  const used=id=>(CUSTOM.events||[]).filter(e=>e.trophy===id).map(e=>e.name);
  return `<p>Design trophies for your events. A trophy is <b>shape + material + base + topper + gem + inscription</b> — and anything you <b>sculpt</b> on top, with rewards for whoever wins it. Attach one to a custom event in the <b>Event Designer → Rounds &amp; rules</b>: win that event (or its Manager-mode invitational, or its Tournament) and the trophy is yours.</p>
   <div class="trstudio"><div class="trprev scart" id="trPrev" data-scbprev="t" title="Drag a shape to move it">${trophySVG({...t,name:t.name||'Trophy'},170)}<div class="rc-sub" style="text-align:center">${esc(t.name||'Unnamed trophy')}</div></div>
    <div class="formgrid"><label>Name<input type="text" data-trf="name" value="${esc(t.name)}" maxlength="32" placeholder="e.g. The Cup of Capua"></label><label>Inscription (on the plate)<input type="text" data-trf="ins" value="${esc(t.ins)}" maxlength="14" placeholder="CHAMPION"></label>
     <label style="grid-column:1/-1">Description<input type="text" data-trf="desc" value="${esc(t.desc)}" maxlength="140" placeholder="What it is awarded for"></label>
     <label>Start from${sel('shape',[['none','— Blank canvas —'],...TR_SHAPES],t.shape)}</label><label>Material<select data-trf="metal">${TR_MAT_GROUPS.map(([g9,ks])=>`<optgroup label="${g9}">${ks.map(k=>`<option value="${k}" ${t.metal===k?'selected':''}>${esc(TR_MAT_LBL[k]||k)}</option>`).join('')}</optgroup>`).join('')}</select></label>
     <label>Base${sel('base',TR_BASE_LBL,t.base)}</label><label>Topper${sel('topper',TR_TOPPERS,t.topper)}</label>
     <label>Gem<input type="color" data-trf="gem" value="${esc(t.gem||'#c0433a')}"></label><label style="display:flex;gap:6px;align-items:center" title="Its tile glows gold wherever it stands — the honour the Superbus Cup and the Flavian Cup carry"><input type="checkbox" data-trf="gilded" ${t.gilded?'checked':''}> ✨ Gilded frame <span class="rc-sub">a gold-lit tile</span></label>
     <label>Reward · coin<input type="number" min="0" max="999" data-trf="r.coin" value="${t.rewards.coin||0}"></label><label>Reward · CF<input type="number" min="0" max="30" data-trf="r.cf" value="${t.rewards.cf||0}"></label>
     <label>Reward · fame<input type="number" min="0" max="25" data-trf="r.fame" value="${t.rewards.fame||0}"></label>
     ${scbBenchHTML('t')}</div></div>
   <div class="mbtns"><button class="btn primary" type="button" data-trs="save">Save trophy</button><button class="btn" type="button" data-trs="new">↺ Start a fresh one</button><button class="btn" type="button" data-trs="rand">🎲 Surprise me</button></div>
   <h4>Your trophies · ${L.length}</h4>${L.length?`<div class="trlist">${L.map(x=>`<div class="trli ${ST.trd&&ST.trd.id===x.id?'on':''}${trGilt(x)?' gilt':''}">${trophySVG(x,54)}<div><b>${esc(x.name)}</b><div class="rc-sub">${esc(x.desc||'')}</div><div class="rc-sub">${rewardText(x.rewards)}${used(x.id).length?` · on: ${used(x.id).map(esc).join(', ')}`:' · not attached to an event yet'}</div>
     ${crActs('t',x)}</div></div>`).join('')}</div>`:'<p class="rc-sub">None yet — the built-in silverware (season awards and the three invitationals) is always available too.</p>'}
   <details open style="margin-top:8px"><summary class="rc-sub" style="cursor:pointer">The built-in silverware (${TROPHY_LIB.length})</summary><div class="trlist">${TROPHY_LIB.map(x=>`<div class="trli${trGilt(x)?' gilt':''}">${trophySVG(x,46)}<div><b>${esc(x.name)}</b><div class="rc-sub">${esc(x.desc)}</div><div class="rc-sub">${rewardText(x.rewards)}</div>${typeof sysActs==='function'?sysActs(`data-trsys="${x.id}"`,{rolls:false}):''}</div></div>`).join('')}</div></details>`}
async function trophyStudioClick(b,redraw){const a=b.dataset.trs,id=b.dataset.id;
  if(a==='new'){ST.trd=blankTrophy();redraw();return}
  if(a==='rand'){const t=blankTrophy();t.shape=pickOne(TR_SHAPES)[0];t.metal=pickOne(Object.keys(TR_METALS));t.base=pickOne(TR_BASE_LBL.filter(x=>x[0]!=='none'))[0];t.topper=pickOne(TR_TOPPERS)[0];t.gem='#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');t.name='The '+pickOne(['Cup','Crown','Laurel','Shield','Eagle','Horn','Palm'])+' of '+pickOne(LOCATIONS.filter(Boolean)).n;t.ins=t.name.split(' ').pop().toUpperCase().slice(0,14);ST.trd=t;redraw();return}
  if(a==='edit'){const t=(CUSTOM.trophies||[]).find(x=>x.id===id);if(t)ST.trd=JSON.parse(JSON.stringify(t));redraw();return}
  if(a==='del'){CUSTOM.trophies=(CUSTOM.trophies||[]).filter(x=>x.id!==id);await Store.del('customTrophies',id).catch(()=>{});for(const e of (CUSTOM.events||[]))if(e.trophy===id){e.trophy='';await Store.put('customEvents',e.id,e).catch(()=>{})}redraw();return}
  if(a==='save'){const t=ST.trd;if(!String(t.name).trim())t.name='The '+pickOne(['Cup','Crown','Laurel'])+' of '+pickOne(LOCATIONS.filter(Boolean)).n;t.cat='custom';t.custom=true;if(!nameGuard('trophies',t,'[data-trf="name"]'))return;
    CUSTOM.trophies=[...(CUSTOM.trophies||[]).filter(x=>x.id!==t.id),JSON.parse(JSON.stringify(t))].sort((x,y)=>String(x.name).localeCompare(y.name));await Store.put('customTrophies',t.id,t).catch(()=>{});
    if(typeof mToast==='function')mToast(`🏆 Saved <b>${esc(t.name)}</b> — attach it to an event in the Event Designer`);redraw();return}}
function trophyStudioInput(t){const d=ST.trd;if(!d)return;const f=t.dataset.trf;if(f==='gilded'){d.gilded=t.checked?1:0;return}if(f.startsWith('r.'))d.rewards[f.slice(2)]=Math.max(0,+t.value||0);else d[f]=t.value;
  const pv=document.getElementById('trPrev');if(pv)pv.innerHTML=`${trophySVG({...d,name:d.name||'Trophy'},170)}<div class="rc-sub" style="text-align:center">${esc(d.name||'Unnamed trophy')}</div>`}
function trophyOptions(){return [['','No trophy'],...allTrophyDefs().filter(t=>t.offered!==false).map(t=>[t.id,`${t.custom?'✦ ':''}${t.name}`])]}

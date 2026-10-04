
/* =====================================================================
   12-SETTINGS · TOGGLES & THEMES
   =====================================================================
   SETTINGS (hints, thoughts, fx, Flavius box, location flavors...) persist in localStorage.
   THEME is a bag of CSS variables; THEME_PRESETS fills the Visuals tab, LOC_THEMES gives
   every arena location its own sand/stone palette (layered over USER_THEME at event start,
   never replacing what the player chose). applyTheme(v, save) is the single entry point.
   Also: the empire banners (FLAGS), the Settings window (settingsHTML/openSettings), whole-game
   saves (SAVE_COLS — every Store collection a backup must include — snapshotAll, IndexedDB
   shelf), the share build (shareBuild) and settingsLive (repaint after a change).
   ===================================================================== */
/* ================= SETTINGS: general options, visual themes, presets and saved profiles =================
   Stored per viewer in this browser (localStorage); nothing here affects other players. */
const UI_TOKENS=[['ink','Background'],['panel','Panels'],['panel2','Buttons & cards'],['line2','Borders'],['bone','Text'],['muted','Secondary text'],['gold','Accent'],['gold2','Accent (bright)'],['blood','Primary buttons'],['blood2','Danger'],['hp','Health bars'],['hplow','Low health'],['ap','Armor bars'],['mv','Movement']];
/* BOARD_TOKENS — board color tokens shown as swatches in Settings → Themes. */
const BOARD_TOKENS=[['tileA','Sand tile (light)'],['tileB','Sand tile (dark)'],['rim','Arena wall'],['grid','Tile lines'],['hlMove','Move highlight'],['hlAtk','Attack highlight'],['hlPush','Push / topple highlight'],['ring','Target ring']];
/* FURN_TOKENS — arena furniture color tokens (stands, pillars, pots, spikes, chest, rubble) shown as swatches. */
const FURN_TOKENS=[['standA','Stand benches (dark)'],['standB','Stand benches (light)'],['pillar','Pillars'],['pillarBase','Pillar bases'],['pot','Clay pots'],['spike','Spikes'],['chestWood','Chest (wood)'],['chestGold','Chest (gold)'],['rubble','Toppled rubble']];
/* BASE_THEME — the default palette: UI and board colors plus highlight strength, outside-zone shade and text scale. TWEAK: any color here changes the default look. */
const BASE_THEME={ink:'#140f0b',panel:'#1f1711',panel2:'#2a1f17',line2:'#4a3826',bone:'#efe3cc',muted:'#b39d80',gold:'#d6ab4c',gold2:'#f0cf7d',blood:'#a3281f',blood2:'#d24a3a',hp:'#6fae4c',hplow:'#d24a3a',ap:'#b9c1c9',mv:'#e8862e',
  tileA:'#d3ba8e',tileB:'#c6aa7c',rim:'#3b2a1c',grid:'#5a4028',standA:'#5b4130',standB:'#6d4f38',pillar:'#ece4d4',pillarBase:'#bdb3a0',pot:'#b5582f',spike:'#6d6862',chestWood:'#6a4520',chestGold:'#d6ab4c',rubble:'#bdb3a0',hlMove:'#e8862e',hlAtk:'#d23c2d',hlPush:'#e6be3c',ring:'#ff6a55',hlAlpha:0.5,outZone:0.5,scale:100,classColors:null};
/* OKABE — Okabe–Ito color-blind-safe class colors, used by the red-green safe preset. */
const OKABE={soldier:'#D55E00',royalty:'#0072B2',hero:'#009E73',slave:'#F0E442',veteranus:'#DDDDDD',amazonia:'#E69F00',venatore:'#CC79A7',damnatio:'#56B4E9'};
// every arena location gets its own sand and stone. Applied automatically at event start (Settings → Location flavors),
// and offered below as presets you can pin at will.
const LOC_THEMES={
  1:{n:'Syracusae · Sea Cliff',d:'Greek limestone over a turquoise harbor',v:{tileA:'#dccfa8',tileB:'#cec092',rim:'#274b52',grid:'#4f7a72',panel2:'#1d2a2b',line2:'#39554f'}},
  2:{n:'Verona · Rose Stone',d:'the pink marble of the Veronese arena',v:{tileA:'#e0bfa8',tileB:'#d2ae94',rim:'#4a2530',grid:'#7a4a44',panel2:'#2a1a1c'}},
  3:{n:'Arles · Gallic Gold',d:'honey stone and lavender dusk',v:{tileA:'#e0c894',tileB:'#d2b880',rim:'#3a2c44',grid:'#6e5a3a',panel2:'#251f2e'}},
  4:{n:'Capua · Old Blood',d:'the first great ludus: dark sand, old iron',v:{tileA:'#c9ab7e',tileB:'#b8996c',rim:'#33150f',grid:'#5f3020',blood2:'#e04a34'}},
  5:{n:'Thysdrus · Amber Sands',d:'African amber and burnt sienna',v:{tileA:'#e3bc7e',tileB:'#d5aa68',rim:'#4a2a10',grid:'#8a5a24',mv:'#e8962e'}},
  6:{n:'Roma · Colosseum',d:'travertine, awnings and imperial gold',v:{tileA:'#d9c49a',tileB:'#cbb488',rim:'#2b2118',grid:'#7a5c2c',gold:'#dcae42',gold2:'#f6d47c'}},
  7:{n:'Nemausus · Laurel Green',d:'cool Gallic stone ringed with laurels',v:{tileA:'#cfc79a',tileB:'#c0b888',rim:'#22301e',grid:'#4e6038',hp:'#7cb857'}},
  8:{n:'Pompeii · Ash & Cinnabar',d:'gray ash over cinnabar frescoes',v:{tileA:'#c9bcab',tileB:'#bbaf9c',rim:'#38201a',grid:'#6a4234',blood:'#9e2a1c',blood2:'#d9523a'}},
  9:{n:'Leptis Magna · Desert Marble',d:'white marble blazing over desert sand',v:{tileA:'#e8d8ae',tileB:'#dbca9a',rim:'#4f4433',grid:'#8f7c50',bone:'#f6efe0'}},
  10:{n:'Uthina · Punic Dusk',d:'Carthaginian crimson and dusk violet',v:{tileA:'#d4b088',tileB:'#c5a074',rim:'#341a2e',grid:'#6a3c50',ring:'#ff6a80'}},
  11:{n:'Pola · Adriatic',d:'sea-bleached stone and Adriatic blue',v:{tileA:'#d8cdb2',tileB:'#cabfa2',rim:'#1e2c3a',grid:'#46607a',ap:'#c2ccda'}},
  12:{n:'Puteoli · Sulfur Fields',d:'tuff stone and a whiff of sulfur',v:{tileA:'#d6c488',tileB:'#c8b672',rim:'#3a3313',grid:'#6e6224',hlPush:'#e6d23c'}},
};
/* THEME_PRESETS — named palettes in Settings → Themes (themes, Roman, accessibility; the arena flavors are added below). TWEAK: the colors. */
const THEME_PRESETS={
  arena:{n:'Arena (default)',g:'Themes',v:{}},
  flavius:{n:'Flavius Rule',g:'Themes',d:'Gold, red and carbon black',v:{ink:'#0b0b0b',panel:'#151413',panel2:'#201e1b',line2:'#3b352b',bone:'#f4ecdb',muted:'#bda77e',gold:'#d4a02c',gold2:'#f5cf5e',blood:'#b01e1e',blood2:'#e03a32',hp:'#c9a227',hplow:'#e03a32',ap:'#c9ccd1',mv:'#d4a02c',tileA:'#3a3632',tileB:'#2e2b28',rim:'#0f0f0f',grid:'#8a6d2c',hlMove:'#d4a02c',hlAtk:'#e03a32',hlPush:'#f5cf5e',ring:'#ff4a3a'}},
  imperial:{n:'Imperial Purple',g:'Roman',d:'Tyrian purple and gold leaf',v:{ink:'#140c18',panel:'#1d1224',panel2:'#2a1a33',line2:'#4b3257',bone:'#f1e6f3',muted:'#bba4c4',gold:'#d8b04a',gold2:'#f3d27a',blood:'#6d2a86',blood2:'#c0457a',tileA:'#d9c7a2',tileB:'#cbb68e',rim:'#2b1836',grid:'#6e5230',hlMove:'#d8b04a',hlAtk:'#c0457a',hlPush:'#f3d27a'}},
  fresco:{n:'Pompeii Fresco',g:'Roman',d:'Cinnabar red and ochre',v:{ink:'#1a0d0a',panel:'#261410',panel2:'#341c16',line2:'#5a3226',bone:'#f5e5d2',muted:'#c9a58c',gold:'#d49a3a',gold2:'#f0c06a',blood:'#9e2a1c',blood2:'#d9523a',tileA:'#e2c49a',tileB:'#d4b286',rim:'#5c1f14',grid:'#7a4a2c',hlMove:'#e59a3a',hlAtk:'#c8321f'}},
  marble:{n:'Senate Marble',g:'Roman',d:'Cool marble, slate and laurel',v:{ink:'#101316',panel:'#181d21',panel2:'#222a30',line2:'#3a4750',bone:'#eef1f2',muted:'#a8b5bd',gold:'#9fbf6b',gold2:'#c8e39a',blood:'#8a3a34',blood2:'#d05a4e',hp:'#8fc46a',tileA:'#dcdad3',tileB:'#cfccc3',rim:'#2c343a',grid:'#8c8a82',hlMove:'#9fbf6b',hlAtk:'#d05a4e',hlPush:'#e0c46a'}},
  deut:{n:'Red-green safe',g:'Accessibility',d:'For deuteranopia and protanopia: blue/orange signals, Okabe-Ito class colors',v:{hp:'#3d8fd6',hplow:'#e69f00',ap:'#dcdcdc',mv:'#56b4e9',blood:'#0072b2',blood2:'#e69f00',hlMove:'#56b4e9',hlAtk:'#e69f00',hlPush:'#f0e442',ring:'#e69f00',classColors:OKABE}},
  trit:{n:'Blue-yellow safe',g:'Accessibility',d:'For tritanopia: red/teal signals',v:{hp:'#009e8f',hplow:'#e0315a',ap:'#e6e6e6',mv:'#e0315a',gold:'#e06a8a',gold2:'#ff9fb8',hlMove:'#00b3a4',hlAtk:'#e0315a',hlPush:'#ff9fb8',ring:'#ff2a5a',classColors:{soldier:'#e0315a',royalty:'#008c8c',hero:'#7fdca5',slave:'#ff9fb8',veteranus:'#e6e6e6',amazonia:'#b0303a',venatore:'#9a6ad6',damnatio:'#7a7a7a'}}},
  contrast:{n:'High contrast',g:'Accessibility',d:'Black, white and bright yellow; stronger highlights',v:{ink:'#000000',panel:'#0a0a0a',panel2:'#1a1a1a',line2:'#8a8a8a',bone:'#ffffff',muted:'#e0e0e0',gold:'#ffd400',gold2:'#ffe866',blood:'#c00000',blood2:'#ff5050',hp:'#40e040',hplow:'#ff5050',ap:'#ffffff',mv:'#ffb000',tileA:'#e8d9b8',tileB:'#d2c09a',rim:'#000000',grid:'#000000',hlMove:'#ffb000',hlAtk:'#ff2020',hlPush:'#ffe000',ring:'#ff0000',hlAlpha:0.7}},
  large:{n:'Large text',g:'Accessibility',d:'Default colors at 120% size',v:{scale:120}},
};
for(const [k,t] of Object.entries(LOC_THEMES))THEME_PRESETS['loc'+k]={n:t.n,g:'Roman · Arenas',d:t.d,v:t.v};
/* SETTINGS_DEF — defaults for every general setting (a missing key falls back to these). */
const SETTINGS_DEF={gore:true,hints:true,thoughts:true,fx:true,reveals:true,shake:true,flavius:true,locFlavor:true,famous:true,xray:'auto',standees:true,banners:true,skipMenu:false,turnHints:true,ruleHints:true,turnRecap:true,ctxMenu:true,hintDock:true,rulePops:true,capFeed:false};
let SETTINGS={...SETTINGS_DEF};
let THEME={...BASE_THEME};const TB={};
/* lsGet — reads JSON from localStorage flavius_<key>, or the fallback. */
const lsGet=(key,fallback)=>{try{const v=localStorage.getItem('flavius_'+key);return v?JSON.parse(v):fallback}catch(e){return fallback}};
/* lsSet — writes JSON to localStorage flavius_<key>. */
const lsSet=(key,value)=>{try{localStorage.setItem('flavius_'+key,JSON.stringify(value))}catch(e){}};
/* hexA — "#rrggbb" + alpha → an rgba() string. */
function hexA(hex,alpha){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${alpha})`}
/* v0.21 EMPIRE FLAGS: a city's banner behind the whole page (Settings → Visuals). Painted in CSS, dimmed so text stays readable. */
const flagURI=(bg,fg,txt,shape,extra='')=>{const sh={eagle:`<g fill="${fg}" opacity=".5"><path d="M300 95 c-14 0 -22 12 -20 24 l-10 6 l12 2 c2 10 4 20 8 28 l-16 60 l26 -24 l26 24 l-16 -60 c4 -8 6 -18 8 -28 z"/><path d="M288 150 c-40 -40 -100 -50 -170 -40 c40 10 60 20 70 30 c-30 0 -55 6 -80 20 c40 0 70 4 90 14 c-20 6 -36 16 -48 30 c40 -10 90 -20 138 -30z"/><path d="M312 150 c40 -40 100 -50 170 -40 c-40 10 -60 20 -70 30 c30 0 55 6 80 20 c-40 0 -70 4 -90 14 c20 6 36 16 48 30 c-40 -10 -90 -20 -138 -30z"/></g>`,sun:`<circle cx="300" cy="170" r="70" fill="${fg}" opacity=".45"/>${Array.from({length:12},(_,i)=>`<rect x="296" y="60" width="8" height="40" fill="${fg}" opacity=".4" transform="rotate(${i*30} 300 170)"/>`).join('')}`,tri:`<g fill="${fg}" opacity=".45">${[0,120,240].map(a=>`<path d="M300 170 q40 -60 20 -120 l20 10 q20 70 -30 115z" transform="rotate(${a} 300 170)"/>`).join('')}<circle cx="300" cy="170" r="26"/></g>`,mount:`<path d="M170 250 l90 -130 l30 30 l30 -50 l110 150z" fill="${fg}" opacity=".45"/><path d="M300 100 q-10 -40 10 -70" stroke="${fg}" stroke-width="10" fill="none" opacity=".5"/>`,tower:`<g fill="${fg}" opacity=".45"><rect x="275" y="90" width="50" height="160"/><path d="M265 90 h70 l-35 -40z"/><circle cx="300" cy="40" r="14"/></g>`,wave:`<path d="M140 200 q40 -40 80 0 t80 0 t80 0 t80 0" stroke="${fg}" stroke-width="14" fill="none" opacity=".45"/><path d="M140 240 q40 -40 80 0 t80 0 t80 0 t80 0" stroke="${fg}" stroke-width="14" fill="none" opacity=".35"/>`,olive:`<g fill="${fg}" opacity=".45"><rect x="296" y="80" width="8" height="180"/>${[0,1,2,3,4].map(i=>`<ellipse cx="${i%2?325:275}" cy="${100+i*30}" rx="26" ry="10" transform="rotate(${i%2?-30:30} ${i%2?325:275} ${100+i*30})"/>`).join('')}</g>`,lion:`<g fill="${fg}" opacity=".45"><circle cx="300" cy="150" r="60"/><circle cx="300" cy="150" r="36" fill="${bg}"/><rect x="250" y="200" width="100" height="50" rx="20"/></g>`,croc:`<g fill="${fg}" opacity=".45"><rect x="296" y="60" width="8" height="120"/><path d="M300 60 q-60 -10 -80 30 M300 60 q60 -10 80 30" stroke="${fg}" stroke-width="10" fill="none"/><path d="M170 220 q130 -40 260 0 q-130 30 -260 0z"/></g>`,horse:`<path d="M240 250 l20 -90 q-10 -40 30 -70 l40 -20 l10 20 q30 10 20 40 l-40 -10 l-10 40 l30 90z" fill="${fg}" opacity=".45"/>`,goat:`<g fill="${fg}" opacity=".45"><ellipse cx="300" cy="190" rx="70" ry="40"/><circle cx="360" cy="140" r="22"/><path d="M360 120 q-10 -50 -50 -60" stroke="${fg}" stroke-width="10" fill="none"/></g>`,moon:`<path d="M330 80 a90 90 0 1 0 0 180 a70 70 0 1 1 0 -180z" fill="${fg}" opacity=".45"/>`,
  /* v0.36: more devices for the Banner press */
  wolf:`<g fill="${fg}" opacity=".45"><path d="M220 250 l10 -60 q-10 -50 30 -80 l-6 -40 l30 30 l32 0 l30 -30 l-6 40 q40 30 30 80 l10 60 l-40 -30 l-30 40 l-30 -40z"/></g>`,
  owl:`<g fill="${fg}" opacity=".45"><ellipse cx="300" cy="180" rx="70" ry="90"/><path d="M240 100 l20 30 l-40 -10z M360 100 l-20 30 l40 -10z"/></g><circle cx="272" cy="160" r="20" fill="${bg}"/><circle cx="328" cy="160" r="20" fill="${bg}"/>`,
  trident:`<g fill="${fg}" opacity=".45"><rect x="292" y="120" width="16" height="170"/><path d="M230 60 l14 70 q56 30 112 0 l14 -70 l-18 0 l-10 50 q-18 8 -34 8 l0 -70 l-16 0 l0 70 q-16 0 -34 -8 l-10 -50z"/></g>`,
  laurel:`<g fill="${fg}" opacity=".45">${Array.from({length:9},(_,i)=>{const a=(200+i*17)*Math.PI/180,b=(-20-i*17)*Math.PI/180;const E=(x,y,r)=>`<ellipse cx="${x}" cy="${y}" rx="26" ry="11" transform="rotate(${r} ${x} ${y})"/>`;return E(300+Math.cos(a)*95,175+Math.sin(a)*95,a*180/Math.PI+90)+E(300+Math.cos(b)*95,175+Math.sin(b)*95,b*180/Math.PI+90)}).join('')}</g>`,
  boar:`<g fill="${fg}" opacity=".45"><ellipse cx="300" cy="190" rx="100" ry="55"/><path d="M390 170 l50 -10 l-10 40z"/><path d="M230 150 l-20 -40 l40 25z"/><rect x="240" y="230" width="16" height="40"/><rect x="340" y="230" width="16" height="40"/></g><path d="M420 196 q14 10 4 24" stroke="${bg}" stroke-width="6" fill="none"/>`,
  ship:`<g fill="${fg}" opacity=".45"><path d="M170 220 l260 0 l-40 50 l-180 0z"/><rect x="294" y="80" width="12" height="140"/><path d="M306 90 q90 50 0 120z"/>${[200,240,280,320,360,400].map(x=>`<rect x="${x}" y="270" width="6" height="30" transform="rotate(20 ${x} 270)"/>`).join('')}</g>`,
  thunder:`<path d="M330 60 l-80 130 l50 0 l-40 110 l110 -150 l-56 0 l40 -90z" fill="${fg}" opacity=".45"/>`,
  column:`<g fill="${fg}" opacity=".45"><rect x="260" y="70" width="80" height="20"/><rect x="272" y="90" width="56" height="170"/><rect x="250" y="260" width="100" height="24"/></g>${[284,300,316].map(x=>`<rect x="${x}" y="96" width="4" height="158" fill="${bg}" opacity=".5"/>`).join('')}`}[shape]||'';
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='340' viewBox='0 0 600 340'><rect width='600' height='340' fill='${bg}'/>${sh}${extra}<text x='300' y='318' text-anchor='middle' font-family='Georgia,serif' font-size='34' letter-spacing='10' fill='${fg}' opacity='.55'>${txt}</text></svg>`)}`};
/* flagSVG — a CSS url() of flagURI's banner. */
const flagSVG=(...args)=>`url("${flagURI(...args)}")`;
/* CITY_FLAG — city name → FLAGS key. */
const CITY_FLAG={Roma:'roma',Capua:'capua',Pompeii:'pompeii',Syracusae:'syracusae',Thysdrus:'thysdrus',Nemausus:'nemausus','Leptis Magna':'leptis',Pola:'pola',Verona:'verona',Arles:'arles',Arelate:'arles',Puteoli:'puteoli',Uthina:'uthina',Carthago:'carthago',Alexandria:'aegyptus'};
const FLAG_URI_CACHE={};
/* flagURIk — the banner data-URI for a FLAGS key, or a Creator Studio banner ("c:<id>"); cached. */
const flagURIk=key=>{if(String(key).startsWith('c:')){const f=((typeof CUSTOM!=='undefined'&&CUSTOM.flags)||[]).find(x=>x.id===String(key).slice(2));return f&&typeof houseFlagURI==='function'?houseFlagURI(f):null} /* v0.45: any banner made in the Creator Studio can hang behind a portrait */
  return FLAGS[key]?(FLAG_URI_CACHE[key]||(FLAG_URI_CACHE[key]=flagURI(...FLAGS[key].v[0]))):null};
/* FLAGS — the empire banners: [background, device color, motto, device] plus a page gradient. TWEAK: colors and mottos. */
const FLAGS={
  roma:{n:'Roma',v:[['#6e1414','#e2b64a','S·P·Q·R','eagle'],'linear-gradient(90deg,#6e1414,#8a1c1c 50%,#6e1414)']},
  capua:{n:'Capua',v:[['#1c3566','#e8e0cc','CAPVA','horse'],'linear-gradient(180deg,#1c3566 0 50%,#d9d0bb 50%)']},
  pompeii:{n:'Pompeii',v:[['#2a0f0f','#e0643a','POMPEII','mount'],'linear-gradient(180deg,#2a0f0f,#5c1d10)']},
  syracusae:{n:'Syracusae',v:[['#8a5a0e','#fff0b8','SYRACVSAE','tri'],'linear-gradient(135deg,#b3261e 0 50%,#d9a52b 50%)']},
  thysdrus:{n:'Thysdrus',v:[['#3d4a1e','#e8d9a0','THYSDRVS','olive'],'linear-gradient(180deg,#3d4a1e,#c9a35a)']},
  nemausus:{n:'Nemausus',v:[['#1d4a2a','#e0433a','NEMAVSVS','croc'],'linear-gradient(90deg,#1d4a2a 0 50%,#8c1f1a 50%)']},
  leptis:{n:'Leptis Magna',v:[['#1d3f5c','#e8b26a','LEPCIS','tower'],'linear-gradient(180deg,#e8b26a 0 30%,#1d3f5c 30%)']},
  pola:{n:'Pola',v:[['#1c3b6e','#e9c547','POLA','goat'],'linear-gradient(180deg,#1c3b6e,#2b5596)']},
  verona:{n:'Verona',v:[['#24324a','#d7c29a','VERONA','sun'],'linear-gradient(90deg,#24324a 0 33%,#d7c29a 33% 66%,#24324a 66%)']},
  arles:{n:'Arelate',v:[['#1b2a55','#e6c24a','ARELATE','lion'],'linear-gradient(180deg,#1b2a55,#304a8a)']},
  puteoli:{n:'Puteoli',v:[['#11474a','#e9efe6','PVTEOLI','wave'],'linear-gradient(180deg,#11474a,#1d6e6a)']},
  uthina:{n:'Uthina',v:[['#3d1c4a','#e6c46a','VTHINA','sun'],'linear-gradient(135deg,#3d1c4a,#6a2e6e)']},
  carthago:{n:'Carthago',v:[['#4a1a3d','#e8a34a','CARTHAGO','moon'],'linear-gradient(180deg,#4a1a3d 0 60%,#b36a2a 60%)']},
  aegyptus:{n:'Alexandria',v:[['#0f3a52','#f0cf7d','ALEXANDRIA','tower'],'linear-gradient(180deg,#0f3a52,#c9a14a)']}};
/* flagBG — a city banner as a dimmed full-page CSS background. */
function flagBG(key){const F=FLAGS[key];if(!F)return null;const [a,b]=F.v;return `linear-gradient(rgba(12,8,6,.42),rgba(12,8,6,.62)) fixed,${flagSVG(...a)} center/cover no-repeat fixed,${b} fixed`}
let USER_THEME=null; // the theme the player actually chose, before any per-location tint
/* applyTheme — THE entry point for colors: merges a theme over BASE_THEME, sets the CSS variables and board colors (TB), class colors and seat colors; save=true also stores it as the player's own theme. */
function applyTheme(theme,save=true){
  THEME={...BASE_THEME,...theme};if(save)USER_THEME={...THEME};const root=document.documentElement.style;
  for(const [k] of UI_TOKENS)root.setProperty('--'+k,THEME[k]);
  root.setProperty('--ap2',shade(THEME.ap,-0.25));root.setProperty('--mv2',shade(THEME.mv,0.25));
  {const fb=null; /* v0.22: banners live behind portraits now, never behind the arena */document.body.style.background=fb||THEME.ink;if(fb)document.body.style.backgroundColor=THEME.ink;document.body.classList.toggle('flagged',!!fb)}
  document.documentElement.style.fontSize=(THEME.scale||100)+'%';document.body.style.fontSize=`${15*(THEME.scale||100)/100}px`;
  const wf=(THEME.warm||0)/100; // board brightness rides ON TOP of any palette (incl. per-location tints), so it survives both
  Object.assign(TB,{tileA:wf?shade(THEME.tileA,wf):THEME.tileA,tileB:wf?shade(THEME.tileB,wf):THEME.tileB,rim:THEME.rim,grid:hexA(THEME.grid,.45),hlMove:THEME.hlMove,hlAtk:THEME.hlAtk,hlPush:THEME.hlPush,ring:THEME.ring,hlAlpha:THEME.hlAlpha??0.5,outZone:`rgba(15,8,4,${THEME.outZone??0.5})`});
  // class colors (color-blind presets swap in a safe palette)
  for(const k of Object.keys(CLASSES)){CLASSES[k].color=(THEME.classColors&&THEME.classColors[k])||CLASSES[k].baseColor}
  if(S&&S.players){for(const p of S.players)p.color=CLASSES[p.cls].color;const used=new Set();const ALT=['#e07b9a','#5fc7c0','#b0d45a','#f09a3e','#9aa6ff','#c9a0dc','#7fd1ff','#ffd166'];for(const p of S.players){if(used.has(p.color.toLowerCase()))p.color=ALT.find(c=>!used.has(c))||p.color;used.add(p.color.toLowerCase())}}
  if(save)lsSet('theme',THEME);
  try{if(S)render();else draw()}catch(e){}
}
for(const k of Object.keys(CLASSES))CLASSES[k].baseColor=CLASSES[k].color;
/* applySettings — pushes SETTINGS into the live switches (hints, thoughts, see-through) and saves them. Wrapped by several later modules. */
function applySettings(save=true){
  HINTS=!!SETTINGS.hints;THOUGHTS=!!SETTINGS.thoughts;XRAY=SETTINGS.xray||'auto';
  document.querySelectorAll('[data-hints]').forEach(b=>b.classList.toggle('on',(b.dataset.hints==='on')===HINTS));
  const bx=$('#btnXray');if(bx)bx.textContent='See-through: '+XRAY;
  if(save){lsSet('settings',SETTINGS);lsSet('hints',HINTS?'on':'off')}
}
// load saved state
/* v0.52: hints start OFF for a brand-new player (nothing of ours in this browser yet); a welcome offers the lessons and the hint switches */
if(FIRST_RUN){try{localStorage.setItem('flavius_firstrun','pending');localStorage.setItem('flavius_settings',JSON.stringify({hints:false,hintDock:false,rulePops:false,turnHints:false,ruleHints:false,turnRecap:false}))}catch(e){}}
SETTINGS={...SETTINGS_DEF,...lsGet('settings',{})};
{const h=lsGet('hints',null);if(h==='off')SETTINGS.hints=false}
applySettings(false);applyTheme(lsGet('theme',{}),false);USER_THEME={...THEME};
// keep the older controls in sync with the settings object
/* v0.45: the master switch really is the master — it flips every hint switch below it, and H does the same */
const HINT_SUBS=['hintDock','rulePops','turnHints','ruleHints','turnRecap']; /* v0.51: context menus are a tool, not a hint — their own switch */
function hintsMaster(on,quiet){SETTINGS.hints=!!on;for(const k of HINT_SUBS)SETTINGS[k]=!!on;applySettings();
  try{for(const k of HINT_SUBS)if(typeof settingsLive==='function')settingsLive(k)}catch(e){}
  try{if(S)render()}catch(e){}try{const hd=document.getElementById('hintDock');if(hd&&!on)hd.innerHTML=''}catch(e){}
  try{if(!on&&typeof tipHide==='function')tipHide()}catch(e){}
  if(!quiet){const box=document.getElementById('setBody');if(box&&CUR_MODAL&&box.querySelector('[data-set="hints"]')){box.querySelectorAll('[data-set="hints"],'+HINT_SUBS.map(k=>`[data-set="${k}"]`).join(',')).forEach(i=>i.checked=!!on);const r=box.querySelector('.setrow[style*="padding-left:26px"]');if(r)r.classList.toggle('hintsoff',!on)}}}
const _setHints=setHints;
/* setHints — the old hint switch now routes through hintsMaster. */
setHints=function(on){hintsMaster(on)};

/* settingsHTML — the Settings window body for a tab: General, Themes, Tokens, Editors, Audio, Profiles, Saves. Wrapped by many later modules. */
function settingsHTML(tab){
  const tabs=`<div class="seg" role="tablist" style="margin-bottom:12px">${[['general','General'],['themes','🎨 Themes'],['tokens','🗿 Tokens'],['sponsors','🎭 Editors'],['audio','🔊 Audio'],['profiles','Profiles'],['saves','💾 Saves']].map(([k,l])=>`<button type="button" role="tab" data-stab="${k}" class="${tab===k?'on':''}">${l}</button>`).join('')}</div>`;
  if(tab==='sponsors'&&typeof sponsorSettingsHTML==='function')return tabs+sponsorSettingsHTML();
  if(tab==='general'){
    const tg=(k,l,d)=>`<label class="setrow"><input type="checkbox" data-set="${k}" ${SETTINGS[k]?'checked':''}><span><b>${l}</b><br><span class="hint" style="margin:0">${d}</span></span></label>`;
    return tabs+`<div class="setgrid">
      <div class="setrow"><span><b>CPU speed</b><br><span class="hint" style="margin:0">The same switch as on the arena bar. Pause stops CPU turns at their next step; Step waits for you after each CPU action.</span></span><div class="seg">${['pause','step','slow','normal','fast'].map(v=>`<button type="button" data-sspeed="${v}" class="${SPEED===v?'on':''}" title="${v==='step'?'Step: each CPU action waits for you — Next ▶ or Space — with a caption explaining it':''}">${v==='pause'?'❚❚ Pause':v==='step'?'⏯ Step':v[0].toUpperCase()+v.slice(1)}</button>`).join('')}</div></div>
      <div class="setrow"><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-lessonsmenu="1" ${(SETTINGS.lessonsMenu===true)||(SETTINGS.lessonsMenu!==false&&!(typeof lessonDone==='function'&&lessonDone('classic')&&lessonDone('manager')))?'checked':''}><span><b>🎓 Lesson buttons on the main menu</b><br><span class="hint" style="margin:0">Learn to Play (Classic) and Manager Mode. They hide themselves once both are done; tick to keep them.</span></span></label></div>
      <label class="setrow"><input type="checkbox" data-set="briefing" ${SETTINGS.briefing!==false?'checked':''}><span><b>📋 Event briefing when the horns sound</b><br><span class="hint" style="margin:0">The event, its rounds and what is not allowed in each, how to win and who fights. 📋 Event on the top bar reopens it any time.</span></span></label>
      ${tg('skipMenu','Skip the main menu','Boot straight into the arena the old way. The 🏛 button on the top bar opens the menu either way.')}
      ${tg('hints','💡 Hints — master switch (H)','Every hint at once: the hint panel on the arena screen, rule popups and the switches below. Press H anywhere to toggle.')}
      <div class="setrow ${SETTINGS.hints?'':'hintsoff'}" style="grid-column:1/-1;padding-left:26px;display:grid;gap:4px">
        <label style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" data-set="hintDock" ${SETTINGS.hintDock!==false?'checked':''}><span><b>🧭 Strategy panel</b> <span class="hint" style="margin:0">— the hint box under your actions: what your hand, your position and the sand suggest right now.</span></span></label>
        <label style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" data-set="rulePops" ${SETTINGS.rulePops!==false?'checked':''}><span><b>📖 Rule popups</b> <span class="hint" style="margin:0">— a short window the first time each rule comes up in play.</span></span></label>
        <label style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" data-set="turnHints" ${SETTINGS.turnHints!==false?'checked':''}><span><b>💡 Turn hints</b> <span class="hint" style="margin:0">— each turn, one suggested move: its button glows gold (and its tile, on the board), with a brief spotlight and a line on why.</span></span></label>
        <label style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" data-set="ruleHints" ${SETTINGS.ruleHints!==false?'checked':''}><span><b>📜 Rule hints</b> <span class="hint" style="margin:0">— hovering a tile, a figure or an action button adds a line on what the rules say about it.</span></span></label>
        <label style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" data-set="turnRecap" ${SETTINGS.turnRecap!==false?'checked':''}><span><b>📰 Turn recap</b> <span class="hint" style="margin:0">— at the start of your turn, what the crowd, the beasts and the arena did since your last one.</span></span></label>
      </div>
      <label class="setrow"><input type="checkbox" data-set="ctxMenu" ${SETTINGS.ctxMenu!==false?'checked':''}><span><b>🖱 Context menus</b><br><span class="hint" style="margin:0">Right-click (or long-press) anything on the sand for every action you can take on it. On for every player, hints or not.</span></span></label>
            ${tg('fx','Floating combat numbers','Damage, healing, CF and coin rise from the board when they happen.')}
      ${tg('reveals','Card reveals','Drawn and played cards appear in the corner of the arena.')}
      ${tg('capFeed','Log on the arena','The latest log lines appear in the corner of the arena, edged in the colour of whoever acted. The 📌 button beside Export log does the same.')}
      <h4 style="grid-column:1/-1;margin:6px 0 0">Visuals</h4>
      <label class="setrow"><input type="checkbox" data-set="gore" ${SETTINGS.gore!==false?'checked':''}><span><b>🩸 Blood &amp; severed limbs</b><br><span class="hint" style="margin:0">Figures lose limbs as the bout takes them, blood pools where they fall, the fallen lie where they drop — and the crew rakes it all away after the games. Off hides the red; the limbs still count.</span></span></label>
      <label class="setrow"><input type="checkbox" data-set="banners" ${SETTINGS.banners!==false?'checked':''}><span><b>Home-city banners behind Manager-mode portraits</b><br><span class="hint" style="margin:0">Each lanista's portrait hangs before their city's banner.</span></span></label>
      <h4 style="grid-column:1/-1;margin:6px 0 0">Voices &amp; bubbles <span class="rc-sub" style="font-weight:400">— every talking system, on its own switch</span></h4>
      <label class="setrow"><input type="checkbox" data-set="emotesSpect" ${SETTINGS.emotesSpect!==false?'checked':''}><span><b>Spectator emotes</b><br><span class="hint" style="margin:0">The 😄😡🎁 that pop over the stands as the crowd reacts.</span></span></label>
      <label class="setrow"><input type="checkbox" data-set="shoutsSpect" ${SETTINGS.shoutsSpect!==false?'checked':''}><span><b>Spectator shouts</b><br><span class="hint" style="margin:0">The words in the bubbles — "Bread and blood!", "Murderer!" and the rest.</span></span></label>
      <label class="setrow"><input type="checkbox" data-set="cityChatter" ${SETTINGS.cityChatter!==false?'checked':''}><span><b>City-square chatter</b><br><span class="hint" style="margin:0">Townsfolk gossiping about the empire, the card and the price of wool.</span></span></label>
      ${tg('flavius','The editor in the box','Flavius (or the local editor) reacts to the action from the framed box — cheers, insults, the occasional tear.')}
      ${tg('thoughts','CPU thought bubbles','CPU gladiators speak their minds, react to how you treat them and quote the cards they play.')}
      ${tg('shake','Screen shake on big hits','A short jolt when a hit deals 6+ damage or a gladiator falls. Off if your system asks for reduced motion.')}
            ${tg('famous','Famous visitors','Now and then a real figure from Roman history takes a seat — an emperor, a poet, a physician, a legendary gladiator — nudging the crowd and the event a little. Off to keep every event anonymous.')}
      ${tg('locFlavor','Location flavors','Each arena location tints the sand and stone in its own palette when an event starts there. Your chosen theme still rules everything else.')}
      <div class="setrow"><span><b>See-through</b><br><span class="hint" style="margin:0">Fade pillars and figures in front of what you are looking at. Also on the X key.</span></span><div class="seg">${['auto','on','off'].map(v=>`<button type="button" data-sxray="${v}" class="${XRAY===v?'on':''}">${v}</button>`).join('')}</div></div>
    </div>`;
  }
  if(tab==='tokens'){const st=tokenStyle();
    const cyl=c=>{const col=CLASSES[c].color;return `<svg viewBox="0 0 40 60" width="34" height="52"><ellipse cx="20" cy="52" rx="15" ry="6" fill="rgba(0,0,0,.35)"/><path d="M5 22V50A15 6 0 0 0 35 50V22Z" fill="${shade(col,-0.35)}"/><ellipse cx="20" cy="22" rx="15" ry="6" fill="${shade(col,0.15)}" stroke="#f0cf7d" stroke-width="1.2"/><text x="20" y="26" text-anchor="middle" font-size="10" font-family="Georgia,serif" fill="#1a120c">${CLASSES[c].name[0]}</text></svg>`};
    const lines={figure:BASE_CLS.map(c=>figureHTML(tokenForCls(c),58)).join(''),standee:BASE_CLS.map(c=>standeeHTML(c,58)).join(''),cylinder:BASE_CLS.map(cyl).join('')};
    const opt=(v,l,dsc)=>`<button type="button" class="tokrow ${st===v?'on':''}" data-tokstyle="${v}"><div class="tokrowhd"><b>${l}</b>${st===v?'<span class="badge gold">in use</span>':''}<small>${dsc}</small></div><div class="toklineup">${lines[v]}</div></button>`;
    return tabs+`<h4 style="margin:0 0 4px">🗿 Gladiators &amp; beasts</h4><p class="rc-sub" style="margin:0 0 6px">How gladiators and beasts stand on the board. Your own creations always wear their sculpted figures.</p>
      ${opt('figure','🗿 Figures','sculpted tokens for every class, beast and creation — reshape any of them in Creator Studio → Tokens')}
      ${opt('standee','🏛 Standees','the classic minis from the original <b>Magnus Edition</b> (print &amp; play and the Tabletop Simulator mod) — the eight classes and the default beasts')}
      ${opt('cylinder','⚪ Cylinders','the simple flat tokens from the first digital builds')}
      <h4 style="margin:12px 0 4px">🛡 Armor</h4><p class="rc-sub" style="margin:0 0 6px">How armor pieces are drawn — on the board, the avatar, the market and every card list.</p>
      ${(()=>{const cur=SETTINGS.armorStyle||'drawn';const keys=['galea','crista','murmillo','musculata','lorica','manica','ocrea','greaves'].filter(k=>ARM[k]);
        const sculpt=keys.map(k=>`<span class="armlu" title="${esc(ARM[k].n)}"><img src="${armArtURL(k)}" alt=""></span>`).join('');
        const scan=keys.map(k=>{const r=typeof cardRef==='function'?cardRef('a:'+k):null;return r?`<span class="cimg xs armlu" style="${cardStyle('a:'+k)}" title="${esc(ARM[k].n)}"></span>`:''}).join('');
        const row=(v,l,dsc,lu)=>`<button type="button" class="tokrow ${cur===v?'on':''}" data-sarmor="${v}"><div class="tokrowhd"><b>${l}</b>${cur===v?'<span class="badge gold">in use</span>':''}<small>${dsc}</small></div><div class="toklineup">${lu}</div></button>`;
        return row('drawn','🖋 Sculpted','every printed piece remade as clean sculpted art — the same set the armor creator starts from',sculpt)+row('scan','📜 Original Drawn Armor','the hand-drawn armor from the printed game, as scanned from the rulebook',scan)})()}`}
  if(tab==='audio'){const a=audSet();const tgA=(k,l,d)=>`<label class="setrow"><input type="checkbox" data-aud="${k}" ${a[k]?'checked':''}><span><b>${l}</b><br><span class="hint" style="margin:0">${d}</span></span></label>`;
    return tabs+`<div class="setgrid">${tgA('on','Sound (unmuted)','Music and effects. The 🔊 button (or M) does the same.')}${tgA('music','Arena music','A theme for every arena that grows with the rounds.')}${tgA('sfx','Sound effects','Hits, coin, cards and fanfares.')}${tgA('menu','Music between events','Keep Roma\u2019s theme playing softly while no event is on.')}
      <label class="setrow slider"><span><b>Music volume</b></span><input type="range" min="0" max="100" data-audv="mvol" value="${Math.round(a.mvol*100)}"><output>${Math.round(a.mvol*100)}</output></label>
      <label class="setrow slider"><span><b>Effects volume</b></span><input type="range" min="0" max="100" data-audv="svol" value="${Math.round(a.svol*100)}"><output>${Math.round(a.svol*100)}</output></label>
      <div class="setrow"><span><b>Try it</b><span id="audState" hidden></span></span><div class="seg"><button type="button" data-audtry="hit">Hit</button><button type="button" data-audtry="coin">Coin</button><button type="button" data-audtry="cf">CF</button><button type="button" data-audtry="death">Fall</button><button type="button" data-audtry="fanfare">Victory</button></div></div></div>
      <h4 style="margin:12px 0 4px">🎶 The music — every city's theme</h4><div id="audTracks">${typeof audListHTML==='function'?audListHTML():''}</div>`}
  if(tab==='visuals'){
    const tg=(k,l,d,def=true)=>`<label class="setrow"><input type="checkbox" data-set="${k}" ${SETTINGS[k]!==false===def?(SETTINGS[k]!==false?'checked':''):(SETTINGS[k]?'checked':'')}><span><b>${l}</b><br><span class="hint" style="margin:0">${d}</span></span></label>`;
    return tabs+`<div class="setgrid">
      <label class="setrow"><input type="checkbox" data-set="gore" ${SETTINGS.gore!==false?'checked':''}><span><b>🩸 Blood &amp; severed limbs</b><br><span class="hint" style="margin:0">Figures lose limbs as the bout takes them, blood pools where they fall, stumps drag trails — and the chained clean-up crew rakes it all away after the games. Off hides the red; the limbs still count.</span></span></label>
      <label class="setrow"><input type="checkbox" data-set="banners" ${SETTINGS.banners!==false?'checked':''}><span><b>Home-city banners behind Manager-mode portraits</b><br><span class="hint" style="margin:0">Each lanista's portrait hangs before their city's banner.</span></span></label>
      </div><p class="hint" style="margin-top:8px">Colors, presets and the page banner moved to the <b>🎨 Themes</b> tab.</p>`;
  }
  if(tab==='themes'){
    const groups={};for(const [k,p] of Object.entries(THEME_PRESETS))(groups[p.g]=groups[p.g]||[]).push([k,p]);
    const sw=(k,l)=>`<label class="swatch"><input type="color" data-tk="${k}" value="${THEME[k]}"><span>${l}</span></label>`;
    /* v0.33: the city-banner grid that used to hang here moved to the Creator Studio's Banner press,
       where the empire's banners now sit as presets — this tab is colors and sliders only */
    return tabs+`<p class="hint" style="margin:0 0 6px">Looking for the empire's banners? They fly from the <b>Creator Studio → 🚩 Banners</b> press now — one for the empire, one per city — ready to copy onto your own cloth.</p>`+Object.entries(groups).map(([g,list])=>`<h4>${g}</h4><div class="presets ${/Roman/.test(g)?'scroll':''}">${list.map(([k,p])=>`<button type="button" class="preset" data-preset="${k}" title="${esc(p.d||p.n)}"><span class="pv">${(Object.keys(p.v).length?Object.keys(p.v).slice(0,6):['ink','panel2','gold','blood2','hp','tileA']).map(t=>`<i style="background:${(p.v[t]||BASE_THEME[t])}"></i>`).join('')}</span>${p.n}${p.d?`<small>${esc(p.d)}</small>`:''}</button>`).join('')}</div>`).join('')+
      `<h4>Sliders</h4><div class="opts" style="gap:6px">
        <label class="slider"><span>Text & UI size</span><input type="range" min="85" max="140" step="5" data-tr="scale" value="${THEME.scale}"><output>${THEME.scale}%</output></label>
        <label class="slider"><span>Highlight strength</span><input type="range" min="20" max="90" step="5" data-tr="hlAlpha" value="${Math.round(THEME.hlAlpha*100)}"><output>${Math.round(THEME.hlAlpha*100)}%</output></label>
        <label class="slider"><span>Outside-zone shade</span><input type="range" min="10" max="85" step="5" data-tr="outZone" value="${Math.round(THEME.outZone*100)}"><output>${Math.round(THEME.outZone*100)}%</output></label>
        <label class="slider"><span>Board brightness</span><input type="range" min="-40" max="40" step="5" data-tr="warm" value="${THEME.warm||0}"><output>${THEME.warm||0}</output></label>
      </div>
      <h4>Interface colors</h4><div class="swatches">${UI_TOKENS.map(([k,l])=>sw(k,l)).join('')}</div>
      <h4>Board colors</h4><div class="swatches">${BOARD_TOKENS.map(([k,l])=>sw(k,l)).join('')}</div>
      <h4>Arena furniture</h4><div class="swatches">${FURN_TOKENS.map(([k,l])=>sw(k,l)).join('')}</div>
      <p class="hint" style="margin:4px 0 0">Stands, pillars, pots, spikes, the chest and toppled rubble. Everything here (colors AND sliders) is captured when you save a profile below.</p>
      <div class="mbtns"><button class="btn" type="button" data-sreset="1">Reset to default</button></div>`;
  }
  if(tab==='saves')return tabs+(typeof matchSavesHTML==='function'?matchSavesHTML():'')+`<h4 class="secth">🗄 Game saves</h4><p>A <b>game save</b> is a snapshot of everything this browser remembers: your Manager careers and their worlds, the Ludus and its fallen, missios, every custom character, beast, event and spectator, the crowd's regulars, the arenas' chronicles, the Hall, your settings and themes. Saves are kept in this browser; <b>download</b> one to keep it safe or move it to another device.</p>
    <div class="acts" style="align-items:center"><input type="text" id="saveName" maxlength="40" placeholder="Save name (e.g. Season II, before the finale)" class="tin" style="flex:1"><button class="btn primary" type="button" data-gsave="1">💾 Save the game now</button></div>
    <div class="acts" style="margin-top:6px"><button class="btn" type="button" data-gdl="now">⬇ Download a save file<small>everything, as it is right now</small></button><label class="btn" style="cursor:pointer">⬆ Open a save file<small>.json from a download</small><input type="file" id="saveFile" accept=".json,application/json" hidden></label></div>
    <h4>Saves in this browser</h4><div id="saveList" class="items"><p class="rc-sub">Reading the shelf…</p></div>
    <p class="hint">Loading a save replaces your current progress, then reloads the page. Save first if you want to keep where you are. The shared Infamis board is never overwritten.</p>`;
  const profs=lsGet('profiles',[]);
  return tabs+`<p>Save the current colors, sizes and options as a named profile and switch between them any time. A profile is kept in this browser the moment you press <b>Save profile</b> — no game save needed (game saves include your profiles too).</p>
    <div class="acts" style="align-items:center"><input type="text" id="profName" maxlength="30" placeholder="Profile name" style="flex:1;background:var(--ink);color:var(--bone);border:1px solid var(--line2);border-radius:3px;padding:7px 8px"><button class="btn primary" type="button" data-psave="1">Save current</button></div>
    <div class="items" style="margin-top:10px">${profs.map((p,i)=>`<div class="item"><span><span class="pv">${['ink','panel2','gold','blood2','hp','tileA'].map(t=>`<i style="background:${p.theme[t]||BASE_THEME[t]}"></i>`).join('')}</span><b>${esc(p.name)}</b></span><span><button class="btn" type="button" data-papply="${i}">Apply</button> <button class="btn" type="button" data-pdel="${i}">Delete</button></span></div>`).join('')||'<p class="hint">No saved profiles yet.</p>'}</div>`;
}
/* ================= v0.21 GAME SAVES: snapshot every collection + settings; keep in IndexedDB; download / open files ================= */
const SAVE_COLS=['arena','crowd','customChars','customEvents','customNpcs','customTokens','customTrophies','customSponsors','customWeapons','customArmor','customFlags','gladiators','hall','hallTrophies','mgrArchives','mgrCareers','missios','wallet'];
/* mToastSafe — mToast that never throws. */
const mToastSafe=html=>{try{mToast(html)}catch(e){}};
/* snapshotAll — a whole-game backup: every SAVE_COLS collection plus the flavius_* localStorage keys. */
async function snapshotAll(){const cols={};for(const c of SAVE_COLS){try{cols[c]=await Store.list(c)}catch(e){cols[c]=[]}}
  const ls={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('flavius_')&&!SAVE_COLS.includes(k.slice(8))&&k!=='flavius_infamis')ls[k]=localStorage.getItem(k)}}catch(e){}
  const mw=cols.mgrCareers||[];return {game:'flavius-rule',v:'0.21',id:'sv'+Date.now().toString(36),at:new Date().toISOString(),cols,ls,
    summary:`${mw.length} career${mw.length===1?'':'s'} · ${(cols.gladiators||[]).length} Ludus gladiators · ${(cols.customChars||[]).length} custom characters · ${(cols.crowd||[]).length} regulars`}}
/* savesIDB — the IndexedDB shelf of game saves: op list / get / put / del. */
function savesIDB(op,arg){return new Promise(res=>{try{const rq=indexedDB.open('flavius-saves',1);rq.onupgradeneeded=()=>rq.result.createObjectStore('slots',{keyPath:'id'});
  rq.onerror=()=>res(op==='list'?[]:null);rq.onsuccess=()=>{try{const tx=rq.result.transaction('slots',op==='list'||op==='get'?'readonly':'readwrite');const st=tx.objectStore('slots');
    const r=op==='list'?st.getAll():op==='get'?st.get(arg):op==='put'?st.put(arg):st.delete(arg);r.onsuccess=()=>res(op==='put'||op==='del'?true:r.result);r.onerror=()=>res(op==='list'?[]:null)}catch(e){res(op==='list'?[]:null)}}}catch(e){res(op==='list'?[]:null)}})}
/* refreshSaves — redraws the saves list in Settings → Saves. */
async function refreshSaves(){const el=$('#saveList');if(!el)return;const L=((await savesIDB('list'))||[]).sort((a,b)=>b.at.localeCompare(a.at));
  el.innerHTML=L.length?L.map(sv=>`<div class="item"><span>💾 <b>${esc(sv.name||'Save')}</b><em>${esc(new Date(sv.at).toLocaleString())} · v${esc(sv.v||'?')} · ${esc(sv.summary||'')}</em></span><span style="display:flex;gap:4px;flex-wrap:wrap"><button class="btn" type="button" data-gload="${sv.id}">Load</button><button class="btn" type="button" data-gdl="${sv.id}">⬇</button><button class="btn" type="button" data-gover="${sv.id}" title="Replace this save with the game as it stands right now">✎ Overwrite</button><button class="btn" type="button" data-gdel="${sv.id}">🗑</button></span></div>`).join(''):'<p class="rc-sub">No saves yet. Name one above and press Save.</p>'}
/* downloadSnapshot — downloads a game save as .json (through the host's save dialog when it has one). */
async function downloadSnapshot(snap){const name=`flavius-save-${(snap.name||'game').replace(/[^\w-]+/g,'-').slice(0,40)}-${snap.at.slice(0,10)}.json`;const text=JSON.stringify(snap);
  let dl=null;try{dl=window.claude&&window.claude.use?await withTimeout(window.claude.use('downloads'),4000):null}catch(e){}
  if(dl){try{await dl.save({filename:name,data:text});return}catch(e){if(e&&e.code==='declined')return}}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();a.remove()}catch(e){mToastSafe('Downloads are not available in this view.')}}
/* loadSnapshot — restores a game save over every collection and the local settings, then reloads the page. */
async function loadSnapshot(snap){if(!snap||snap.game!=='flavius-rule'||!snap.cols){mToastSafe('That is not a Flavius Rule save.');return}
  mToastSafe('Restoring the save…');
  for(const c of SAVE_COLS){const want=snap.cols[c]||[];const ids=new Set(want.map(d=>d.id));let cur=[];try{cur=await Store.list(c)}catch(e){}
    for(const d of cur)if(!ids.has(d.id))await Store.del(c,d.id);for(const d of want){const {id,...rest}=d;await Store.put(c,id,rest)}}
  try{for(const [k,v] of Object.entries(snap.ls||{}))localStorage.setItem(k,v)}catch(e){}
  setTimeout(()=>location.reload(),400)}
/* openSettings — opens the Settings window and handles all of its tabs and controls. */
function openSettings(tab='general'){if(tab==='visuals')tab='general'; // v0.35: Visuals folded into General
  if(modalBusy())return;
  modal('Settings',`<div id="setBody">${settingsHTML(tab)}</div>`,[{label:'Close',value:1}],{wide:1,onOpen:()=>{
    const box=$('#setBody');let cur=tab;const redraw=t=>{cur=t||cur;box.innerHTML=settingsHTML(cur);if(cur==='saves')refreshSaves()};if(cur==='saves')refreshSaves();
    box.onchange2=null;box.addEventListener('change',async e=>{if(e.target.id!=='saveFile'||!e.target.files[0])return;let snap=null;try{snap=JSON.parse(await e.target.files[0].text())}catch(err){}e.target.value='';
      if(!snap||snap.game!=='flavius-rule'||!snap.cols){if(snap&&(snap.game==='flavius-match'||typeof snap.world==='string')&&typeof saveUpload==='function'){saveUpload(new File([JSON.stringify(snap)],'save.json'));return}mToastSafe('That file is not a Flavius Rule save.');return}
      /* v0.49: a whole-game restore replaces every save on this page — it asks first */
      const host=e.target.closest('.acts');const bar=document.createElement('div');bar.className='card2 restoreask';bar.innerHTML=`<b>⚠ Restore “${esc(snap.name||'this backup')}”?</b><div class="rc-sub" style="margin:2px 0 6px">It replaces every save — careers, matches, the Annals and your creations — with the file’s. On a shared page that is everyone’s saves. This can’t be undone; download a save first if you want to keep what’s here.</div><div class="acts"><button type="button" class="btn primary" data-restore="yes">Replace everything</button><button type="button" class="btn" data-restore="no">Cancel</button></div>`;
      const old=box.querySelector('.restoreask');if(old)old.remove();(host||box).after(bar);
      bar.addEventListener('click',async ev=>{const b=ev.target.closest('[data-restore]');if(!b)return;bar.remove();if(b.dataset.restore==='yes')await loadSnapshot(snap)})});
    box.onclick=async e=>{const t=e.target;
      const st=t.closest('[data-stab]');if(st){redraw(st.dataset.stab);$('#mBody').scrollTop=0;return}
      {const sb=t.closest('[data-sharebuild]');if(sb){shareBuild(sb).catch(()=>{});return}}
      if(t.closest('[data-gsave]')){const nm=($('#saveName')&&$('#saveName').value.trim())||`Save · ${new Date().toLocaleString()}`;const snap=await snapshotAll();snap.name=nm;const ok=await savesIDB('put',snap);mToastSafe(ok?`💾 Saved “${esc(nm)}”`:'This browser will not keep saves here — use Download instead.');redraw();return}
      const gdl=t.closest('[data-gdl]');if(gdl){const snap=gdl.dataset.gdl==='now'?await snapshotAll():await savesIDB('get',gdl.dataset.gdl);if(snap)await downloadSnapshot(snap);return}
      const gld=t.closest('[data-gload]');if(gld){if(!gld.dataset.armed){gld.dataset.armed=1;gld.innerHTML='Confirm: replace my progress';gld.classList.add('primary');return}const snap=await savesIDB('get',gld.dataset.gload);if(snap)await loadSnapshot(snap);return}
      const gov=t.closest('[data-gover]');if(gov){ // v0.35: overwrite an existing save in place — same slot, same name, today's game
        if(!gov.dataset.armed){gov.dataset.armed=1;gov.innerHTML='Confirm: overwrite';gov.classList.add('primary');return}
        const old9=await savesIDB('get',gov.dataset.gover);const snap=await snapshotAll();snap.id=gov.dataset.gover;snap.name=(old9&&old9.name)||snap.name||'Save';
        const ok=await savesIDB('put',snap);mToastSafe(ok?`✎ Overwrote “${esc(snap.name)}” with the game as it stands.`:'This browser would not write the save.');redraw();return}
      const gdel=t.closest('[data-gdel]');if(gdel){if(!gdel.dataset.armed){gdel.dataset.armed=1;gdel.textContent='Confirm delete';return}await savesIDB('del',gdel.dataset.gdel);redraw();return}
      const sp=t.closest('[data-sspeed]');if(sp){const b=document.querySelector(`[data-speed="${sp.dataset.sspeed}"]`);if(b)b.click();redraw();return}
      const eg=null&&t.closest('[data-egg]');if(eg){const k=eg.dataset.egg;window._eggN=(window._eggN||{});window._eggN[k]=(window._eggN[k]||0)+1;if(window._eggN[k]>=3){if(k==='standee'&&!SETTINGS.eggStandee){SETTINGS.eggStandee=1;applySettings();if(typeof mToast==='function')mToast('🏛 You found the <b>Ludus Flavius standees</b> — the real minis are now a board style.')}if(k==='cyl'&&!SETTINGS.eggCyl){SETTINGS.eggCyl=1;applySettings();if(typeof mToast==='function')mToast('⚪ You found the <b>original cylinders</b> — the flat tokens are back as a board style.')}redraw();return}}
      const at=t.closest('[data-audtry]');if(at){ // v0.32: the full Safari unlock ritual, inside this very click
        if(!audInit()){mToastSafe('This browser offers no Web Audio — no sound is possible here.');return}
        if(!audSet().on){mToastSafe('Sound is muted — press 🔊 on the main bar (or the M key) to hear it.');return}
        if(!audSet().sfx){mToastSafe('Sound effects are switched off above — tick them to hear the preview.');return}
        if(typeof audUnlock==='function')audUnlock();
        try{if(AUD.ctx.state!=='running')await AUD.ctx.resume()}catch(err){}
        const st9=document.getElementById('audState');if(st9)st9.textContent='engine: '+AUD.ctx.state+(AUD.unlocked?' · unlocked':'');
        if(AUD.ctx.state!=='running'){mToastSafe('The browser is still holding audio back (state: '+AUD.ctx.state+'). Tap once anywhere on the page, then Try again.');return}
        sfx(at.dataset.audtry);return}
      const sa=t.closest('[data-sarmor]');if(sa){SETTINGS.armorStyle=sa.dataset.sarmor;applySettings();settingsLive('armorStyle');redraw();return}
      const ts=t.closest('[data-tokstyle]');if(ts){SETTINGS.tokenStyle=ts.dataset.tokstyle;applySettings();settingsLive('tokenStyle');redraw();return}
      const sx=t.closest('[data-sxray]');if(sx){SETTINGS.xray=sx.dataset.sxray;applySettings();draw();redraw();return}
      const pr=t.closest('[data-preset]');if(pr){applyTheme({...THEME_PRESETS[pr.dataset.preset].v});redraw();return}
      if(t.closest('[data-sreset]')){applyTheme({});redraw();return}
      if(t.closest('[data-psave]')){const n=($('#profName').value||'').trim()||`Profile ${lsGet('profiles',[]).length+1}`;const ps=lsGet('profiles',[]).filter(p=>p.name!==n);ps.push({name:n,theme:{...THEME},settings:{...SETTINGS}});lsSet('profiles',ps);redraw();return}
      const pa=t.closest('[data-papply]');if(pa){const p=lsGet('profiles',[])[+pa.dataset.papply];if(p){SETTINGS={...SETTINGS_DEF,...p.settings};applySettings();applyTheme(p.theme)}redraw();return}
      const pd=t.closest('[data-pdel]');if(pd){const ps=lsGet('profiles',[]);ps.splice(+pd.dataset.pdel,1);lsSet('profiles',ps);redraw();return}
    };
    box.onchange=e=>{const t=e.target;if(t.dataset&&t.dataset.lessonsmenu){SETTINGS.lessonsMenu=t.checked;applySettings();try{lessonsMenuVis()}catch(err){}return}if(typeof sponsorSettingsChange==='function'&&sponsorSettingsChange(t)){redraw('sponsors');return}if(t.dataset.aud){SETTINGS.audio={...audSet(),[t.dataset.aud]:t.checked};applySettings();audInit();audApplyVol();if(!audSet().on||!audSet().music)audStop();else audTick();if(typeof audMuteUI==='function')audMuteUI();return}if(t.dataset.set){const k9=t.dataset.set;if(k9==='hints'){hintsMaster(t.checked,true);redraw();return}SETTINGS[k9]=t.checked;if(HINT_SUBS.includes(k9)){SETTINGS.hints=HINT_SUBS.some(k=>SETTINGS[k]!==false);applySettings();settingsLive(k9);redraw();return}applySettings();settingsLive(k9);if(k9==='banners')redraw()}};
    box.oninput=e=>{const t=e.target;
      if(t.dataset.audv){SETTINGS.audio={...audSet(),[t.dataset.audv]:(+t.value)/100};applySettings();audApplyVol();if(t.nextElementSibling)t.nextElementSibling.textContent=t.value;return}
      if(t.dataset.tk){applyTheme({...THEME,[t.dataset.tk]:t.value});return}
      if(t.dataset.tr){const k=t.dataset.tr,v=+t.value;const o=t.nextElementSibling;
        const keep=(key,val)=>{USER_THEME={...(USER_THEME||THEME),[key]:val};lsSet('theme',USER_THEME);applyTheme({...THEME,[key]:val},false)};
        if(k==='scale'){keep('scale',v);o.textContent=v+'%'}
        else if(k==='hlAlpha'||k==='outZone'){keep(k,v/100);o.textContent=v+'%'}
        else if(k==='warm'){USER_THEME={...(USER_THEME||THEME),warm:v};lsSet('theme',USER_THEME);applyTheme({...THEME,warm:v},false);o.textContent=v}}}; // saved to your theme, shown over today's arena tint
  }});
}
/* the top-bar Settings cog. */
$('#btnSettings').onclick=()=>openSettings();

/* ================= v0.34 THE SHARE BUILD =================
   One file to hand a friend: fetches this very page, inlines every image in assets/ as a
   data-URI (both the literal references and, via window.ASSET_DATA, the ones built at
   runtime), and downloads the result. Double-click anywhere, works offline. */
async function shareBuild(btn){
  const stat=t=>{if(btn){btn.disabled=true;btn.textContent=t}};
  const done=t=>{if(btn){btn.disabled=false;btn.textContent=t}};
  try{
    stat('Reading the page…');
    const res=await fetch(location.href,{cache:'no-cache'});
    if(!res.ok)throw new Error('fetch '+res.status);
    let html=await res.text();
    const files=new Set(Object.values(SHEETS).map(s=>s.f));
    for(const f of ['avatar.png','logo.png','map.jpg','locdie.jpg','die-miss.png','die-hit.png','blessing.png','tunnel_open.jpg','tunnel_door.jpg','armor.jpg'])files.add(f);
    for(const m of html.matchAll(/assets\/([A-Za-z0-9_.\-]+)/g))files.add(m[1]);
    const data={};let k=0;
    for(const f of files){k++;stat(`Embedding ${k}/${files.size} — ${f}…`);
      try{const r2=await fetch('assets/'+f);if(!r2.ok)continue;const b=await r2.blob();
        data[f]=await new Promise(r3=>{const fr=new FileReader();fr.onload=()=>r3(fr.result);fr.readAsDataURL(b)})}catch(e){}}
    stat('Binding the volume…');
    /* v0.63: inline only real references (url(…), src="…", quoted) — never the mentions inside comments */
    for(const [f,du] of Object.entries(data)){const fe=f.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');html=html.replace(new RegExp(`(?<=url\\(|src="|['"])assets/${fe}(?=[)"'])`,'g'),()=>du)}
    html=html.replace('<script>','<script>window.ASSET_DATA='+JSON.stringify(data)+';<\/script>\n<script>');
    const blob=new Blob([html],{type:'text/html'});const mb=(blob.size/1048576).toFixed(1);
    // v0.35: inside the published page a plain <a download> is blocked — the host's save dialog hands it over
    let dl=null;try{dl=window.claude&&window.claude.use?await withTimeout(window.claude.use('downloads'),4000):null}catch(e){}
    if(dl){stat('Confirm the save in the dialog…');
      try{await dl.save({filename:'flavius-rule-arena.html',data:blob});done(`✅ Saved — flavius-rule-arena.html (${mb} MB) is in your Downloads folder, ready to send`);return}
      catch(e){if(e&&e.code==='declined'){done('📦 Download the share build');return}}}
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='flavius-rule-arena.html';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>{try{URL.revokeObjectURL(a.href)}catch(e){}},5000);
    done(`✅ Share build downloaded — ${mb} MB, look in your Downloads folder`);
  }catch(e){done('⚠ Could not gather the page here — open the game from its web link (claude.ai) and try again')}
}

/* v0.36 SETTINGS APPLY LIVE: every change repaints what it touches, right away — no reload.
   (The figure cache is keyed by design, so anything that changes how a figure is DRAWN clears it.) */
function settingsLive(key){
  if(key==='gore'||key==='tokenStyle'||key==='armorStyle'){try{if(typeof TOKEN_IMG!=='undefined')for(const x of Object.keys(TOKEN_IMG))delete TOKEN_IMG[x]}catch(e){}
    try{if(typeof ARM_URLS!=='undefined')for(const x of Object.keys(ARM_URLS))delete ARM_URLS[x]}catch(e){}}
  if(key==='locFlavor'){try{const live=S&&!S.over&&S.phase!=='setup';
    if(SETTINGS.locFlavor===false||!live)applyTheme({...(typeof USER_THEME!=='undefined'&&USER_THEME||THEME)},false);
    else if(typeof LOC_THEMES!=='undefined'&&LOC_THEMES[S.locIdx])applyTheme({...(USER_THEME||THEME),...LOC_THEMES[S.locIdx].v},false)}catch(e){}}
  try{if(S)render();else draw()}catch(e){}}

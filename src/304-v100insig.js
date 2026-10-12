/* =====================================================================
   304-V100INSIG · v1.0 — INSIGNIA: ONE HERALDRY SYSTEM, ANCIENT ROMAN (his round 2 + answers; spec tools/plans/mock100/NOTES-banner.md,
   mock banner.html + banner_engine.js — ported here)
   =====================================================================
   ONE house design, six Roman KINDS (shape + frame only), all in flagURI's 600×340 space so today's devices and sculpt layers line up:
     vexillum (cloth from a crossbar on a spear pole) · signum (pole standard: topper, crossbar, laurel, phalerae, clipeus, lunula, tabula)
     flammula (the rank streamer) · velarium (awning for the stands, bold Colosseum stripes — his Q6) · scutum (curved shield) · parma (round shield = THE chip, < 44 px)
     + internal kinds: pannus (the vexillum's cloth alone, 600×340, no frame — what flagURI / houseFlagURI return, so every wide layout,
     portrait backdrop and the sculpt bench keep their place) and wall (the arena's hanging wall cloth, no pole).
   ONE function: insignia100(design, kind, px) → data URI (cached: design hash + kind + px); insignia100.img(...) → a loaded Image | null.
   A DESIGN: {v:2,c1,c2,fg,pat,emb,top,ins,layers,baked,trim:{gilt,tassels,fringe,bar,topbar,fc},wear}. READ-TIME ADAPTER ins100Norm: an old
   {bg,fg,txt,shape} row (customFlags, m.flag, FLAGS, derived rivals/families) maps bg→c1 (and c2), fg→fg, txt→ins, shape→emb, plain pattern,
   gilded edge, wear 0 — nothing in the Store is rewritten on load; v2 is saved only when the player saves (304a). Small sizes (< 44 px): no
   texture, inscription or sculpt; thicker rim + ink line. The emblem is SOLID with an ink line and a soft shadow (his 2a).
   REPLACED (bodies): flagURI (12-settings: the const became flagURI0 + `let flagURI` — a shim → the pannus), houseFlagURI, flagImg
   (pannus), flagChip + famFlagChip (parma), drawFanFlags (a small vexillum held up), 290's parma100 / scutum100, 192's ar91FlagSrc /
   ar91DecoKey / ar91DecoPaint (a velarium of the section's house, cache key = design hashes), ar91Banner / ar91Drape (locked arena system
   cloths; the tile names + FR icon still painted on top, same size), ar91Pennant (Flavius's box = a locked system FLAMMULA), 252's dr98URI
   (8 locked system Flammulae; from Ludus Magnus up the house parma rides the crossbar — his 1a — where the house is known) + rg98Flag
   (7 locked Vexilla), 175's d89Crest (parma) + d89Banner's crest (scutum), 145's roomScene73 pennants (a Signum pair + the house
   vexillum). Rivals' and families' designs stay DERIVED from id + city / family name (27 mgrFlagOf, famFlagOf) — nobody's identity changes.
   STAYS SEPARATE: language flags (190 flag91). Server data DRANKS98 / REGIONS98 untouched.
   KILL SWITCH localStorage flavius_insig100off=1 → every wrapper passes through: today's flags exactly.
   ===================================================================== */
const INS100={off:(()=>{try{return localStorage.getItem('flavius_insig100off')==='1'}catch(e){return false}})(),
  uri:new Map(),img:new Map(),MAX:420 /* TWEAK: cached data URIs / images kept */,LOD:44 /* TWEAK: below this height no texture/inscription/sculpt */,
  dev:null,arenaWait:0,stats:{hit:0,miss:0}};
const ins100On=()=>!INS100.off;

/* ---------------- the catalogue ---------------- */
const INS100_PATS=[['plain',_T('Plain'),'pannus purus'],['clavi',_T('Clavi'),_T('two stripes')],['meander',_T('Meander'),_T('Greek-key border')],['wave',_T('Waves'),_T('running-wave border')],['clipeus',_T('Clipeus'),_T('central roundel')],['laurel',_T('Laurel'),_T('wreath round the emblem')],['halved',_T('Halved'),_T('two colour fields')]]; // i18n:skip
const INS100_PAL=[['#5b1a45','Purpura',_T('Tyrian purple')],['#9b2a1c','Rubia',_T('madder red')],['#b5832e','Ochra',_T('ochre')],['#e2a72e','Crocus',_T('saffron')],['#3f8f7e','Aerugo',_T('verdigris')],['#2c5a8c','Caeruleum',_T('Egyptian blue')],['#e8dcc0','Creta',_T('chalk white')],['#1f1712','Atramentum',_T('lamp black')]]; // i18n:skip
const INS100_KINDS={vexillum:{vb:[220,300],n:'Vexillum',sub:_T('cloth from a crossbar')},signum:{vb:[120,320],n:'Signum',sub:_T('pole standard, phalerae')},
  flammula:{vb:[110,300],n:'Flammula',sub:_T('rank streamer')},velarium:{vb:[460,236],n:'Velarium',sub:_T('awning for the stands')},
  scutum:{vb:[180,270],n:'Scutum',sub:_T('curved shield')},parma:{vb:[160,160],n:'Parma',sub:_T('round shield · chips')},
  pannus:{vb:[600,340],n:'Pannus',sub:''},wall:{vb:[60,150],n:'Vexillum',sub:''}};
const INS100_KS=['vexillum','signum','flammula','velarium','scutum','parma'];
const INS100_TRIM0={gilt:true,tassels:false,fringe:true,bar:true,topbar:false,fc:'gold'};
const INS100_FC={gold:['#f3d27a','#b48a34'],creta:['#efe3c8','#a8987a'],rubia:['#c0473f','#7a1f1a'],purpura:['#8a3a72','#4a1238']};
const INS100_TOPS=['emb','manus','sym:eagle','sym:laurel','palma'];
function ins100Shade(hex,k){const n=parseInt(String(hex).slice(1),16)||0;const r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return '#'+[f(r),f(g),f(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const ins100X=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* the Roman emblems not in the game (600×340 space, centre 300,180) — the mock's set */
const ins100Sword=a=>`<g transform="translate(300 186) rotate(${a})"><path d="M0 -128 L13 -104 L13 34 L-13 34 L-13 -104Z"/><path d="M0 -118 V30" stroke="BG" stroke-width="3" opacity=".5"/><rect x="-34" y="34" width="68" height="13" rx="6"/><rect x="-8" y="47" width="16" height="44" rx="4"/><circle cx="0" cy="98" r="13"/></g>`;
const INS100_R={
  bull:`<g fill="FG"><path d="M170 210 C170 170 200 150 250 150 L360 148 C380 140 400 136 420 140 L428 118 C432 108 446 104 452 110 C444 114 440 122 442 132 L456 140 C470 146 476 160 470 172 L452 176 C444 190 430 196 414 196 L404 200 C400 214 392 224 380 228 L382 280 L364 280 L360 236 L268 236 L264 280 L246 280 L244 232 C226 228 214 220 208 212 L190 252 L186 214 C178 214 172 214 170 210Z"/><path d="M430 128 C422 110 430 96 448 94 C438 104 436 116 440 126Z"/></g><circle cx="446" cy="152" r="4" fill="BG"/>`,
  capricorn:`<g fill="FG"><path d="M372 128 L380 84 L390 120 L404 92 L404 134 C424 142 430 164 420 180 L392 184 C386 202 372 214 352 218 L346 270 L332 270 L334 222 L314 222 L308 268 L294 268 L296 220 C256 218 228 232 206 256 C184 282 146 284 138 262 C130 240 150 224 168 232 C154 236 152 248 160 254 C176 264 196 244 210 226 C240 190 290 178 340 180 C346 154 356 134 372 128Z"/></g><circle cx="404" cy="152" r="4" fill="BG"/>`,
  scorpion:`<g fill="FG"><ellipse cx="300" cy="196" rx="34" ry="46"/><ellipse cx="300" cy="138" rx="26" ry="22"/><path d="M284 126 L244 96 L214 100 L234 110 L214 120 L248 120 L278 142Z"/><path d="M316 126 L356 96 L386 100 L366 110 L386 120 L352 120 L322 142Z"/><circle cx="300" cy="258" r="14"/><circle cx="304" cy="282" r="13"/><circle cx="318" cy="302" r="12"/><circle cx="340" cy="308" r="11"/><circle cx="358" cy="298" r="10"/><path d="M362 286 L386 270 L378 296Z"/></g><g stroke="FG" stroke-width="8" stroke-linecap="round"><path d="M270 176 L222 160 M268 198 L214 204 M272 220 L224 246 M330 176 L378 160 M332 198 L386 204 M328 220 L376 246"/></g>`,
  medusa:`<g stroke="FG" stroke-width="11" fill="none" stroke-linecap="round">${Array.from({length:12},(_,i)=>{const a=(-170+i*(340/11))*Math.PI/180;const c=Math.cos(a),s=Math.sin(a);const x1=300+c*58,y1=184+s*62,x2=300+c*104,y2=184+s*100;return `<path d="M${x1.toFixed(0)} ${y1.toFixed(0)} Q${((x1+x2)/2+s*18).toFixed(1)} ${((y1+y2)/2-c*18).toFixed(1)} ${x2.toFixed(0)} ${y2.toFixed(0)}"/>`}).join('')}</g><g fill="FG"><ellipse cx="300" cy="184" rx="60" ry="66"/><path d="M236 120 L210 92 L250 106Z M364 120 L390 92 L350 106Z"/></g><g fill="BG"><ellipse cx="278" cy="170" rx="10" ry="6"/><ellipse cx="322" cy="170" rx="10" ry="6"/><path d="M296 182 L300 204 L304 182Z"/><path d="M280 220 Q300 234 320 220 Q300 226 280 220Z"/></g>`,
  gladii:`<g fill="FG">${ins100Sword(-34)}${ins100Sword(34)}</g>`,
  rete:`<g stroke="FG" stroke-width="5" fill="none" opacity=".95">${[0,1,2,3,4,5].map(i=>`<path d="M${170+i*24} 100 Q${150+i*24} 200 ${178+i*26} 296"/>`).join('')}${[0,1,2,3,4,5,6].map(i=>`<path d="M160 ${110+i*28} Q230 ${126+i*28} 310 ${110+i*28}"/>`).join('')}</g><g fill="FG" transform="translate(380 186) rotate(14)"><rect x="-7" y="-60" width="14" height="190"/><path d="M-46 -130 L-38 -66 Q0 -42 38 -66 L46 -130 L32 -130 L26 -84 Q14 -78 7 -78 L7 -150 L-7 -150 L-7 -78 Q-14 -78 -26 -84 L-32 -130Z"/><path d="M-52 -138 L-46 -152 L-40 -138Z M52 -138 L46 -152 L40 -138Z M0 -164 L-9 -148 L9 -148Z"/></g>`,
  palma:`<path d="M300 300 Q284 200 318 76" stroke="FG" stroke-width="9" fill="none"/><g fill="FG">${Array.from({length:11},(_,i)=>{const t=i/10,x=300-12*t+20*t*t,y=290-210*t;const L=70-40*t;const a=(x-L*.5).toFixed(0),b=(x+L*.5).toFixed(0),yy=(y-8).toFixed(0);return `<ellipse cx="${a}" cy="${yy}" rx="${(L*.55).toFixed(0)}" ry="7" transform="rotate(-28 ${a} ${yy})"/><ellipse cx="${b}" cy="${yy}" rx="${(L*.55).toFixed(0)}" ry="7" transform="rotate(28 ${b} ${yy})"/>`}).join('')}</g>`,
  murmillo:`<g fill="FG"><path d="M196 252 L226 240 C216 176 248 126 300 120 C352 116 392 146 402 196 L414 240 L446 250 L430 266 L210 266Z"/><path d="M262 126 C280 70 344 58 392 92 C362 92 330 100 304 122Z"/></g><g fill="BG" opacity=".75">${[0,1,2,3].map(r=>[0,1,2,3,4].map(c=>`<circle cx="${330+c*14}" cy="${170+r*14}" r="4"/>`).join('')).join('')}</g>`,
  thraex:`<g fill="FG"><path d="M196 252 L226 240 C216 176 248 126 300 120 C352 116 392 146 402 196 L414 240 L446 250 L430 266 L210 266Z"/><path d="M296 122 C292 64 352 34 404 62 L414 92 L388 80 C362 70 334 82 318 120Z"/><path d="M404 62 L430 70 L414 92Z"/></g><g fill="BG" opacity=".75">${[0,1,2].map(r=>[0,1,2,3].map(c=>`<circle cx="${336+c*14}" cy="${176+r*14}" r="4"/>`).join('')).join('')}</g>`,
  manus:`<g fill="FG"><path d="M246 300 L246 196 C246 184 262 182 264 196 L266 230 L268 110 C268 96 288 96 288 110 L290 200 L292 92 C292 78 312 78 312 92 L314 200 L318 104 C318 90 338 90 338 104 L338 210 L346 134 C348 120 366 122 364 136 L360 240 C358 274 340 300 310 300Z"/></g><rect x="236" y="300" width="128" height="16" rx="5" fill="FG"/>`,
  spqr:`<text x="300" y="214" text-anchor="middle" font-family="Marcellus SC,Georgia,serif" font-size="104" letter-spacing="8" fill="FG">SPQR</text><path d="M180 236 H420" stroke="FG" stroke-width="6"/>`,
  num:`<text x="300" y="232" text-anchor="middle" font-family="Marcellus SC,Georgia,serif" font-size="150" letter-spacing="6" fill="FG">NUMTXT</text>`};
const INS100_GROUPS=[[_T('Beasts'),['wolf','boar','sym:eagle','eagle','bull','lion','capricorn','scorpion','croc','horse','goat','owl']],[_T('Arena'),['gladii','rete','murmillo','thraex','sym:helm','sym:rudis','trident','sym:shield','sym:blades']],
  [_T('Gods & victory'),['thunder','medusa','sym:laurel','palma','sun','moon','manus','olive','tri']],[_T('Letters & city'),['spqr','num','column','tower','ship','wave','mount','sym:amphora','sym:hut']]];
const INS100_N={wolf:'Lupa',boar:'Aper','sym:eagle':'Aquila',eagle:'Aquila (lata)',bull:'Taurus',lion:'Leo',capricorn:'Capricornus',scorpion:'Scorpio',croc:'Crocodilus',horse:'Equus',goat:'Caper',owl:'Noctua', // i18n:skip
  gladii:'Gladii',rete:'Rete & tridens',murmillo:'Galea murmillonis',thraex:'Galea thraecis','sym:helm':'Galea',trident:'Tridens','sym:rudis':'Rudis','sym:shield':'Scutum','sym:blades':'Gladii (lineae)', // i18n:skip
  thunder:'Fulmen',medusa:'Gorgo','sym:laurel':'Laurea',palma:'Palma',sun:'Sol',moon:'Luna',manus:'Manus',olive:'Oliva',tri:'Triskeles',spqr:'S·P·Q·R',num:'Numerus',column:'Columna',tower:'Turris',ship:'Navis',wave:'Unda',mount:'Mons','sym:amphora':'Amphora','sym:hut':'Tugurium',none:'—'}; // i18n:skip
/* the printed devices, read once from today's press (flagURI0) — exactly the shapes every old banner carries */
function ins100Devs(){if(INS100.dev)return INS100.dev;const o={};try{for(const sh of FLAG_SHAPES){const d=decodeURIComponent(flagURI0('#000000','#FFFFFF','',sh).split(',')[1]);const a=d.indexOf("fill='#000000'/>")+16,z=d.lastIndexOf('<text');
  o[sh]=d.slice(a,z).split('#FFFFFF').join('FG').split('#000000').join('BG').replace(/opacity="\.4?5?"/g,'')}}catch(e){}return INS100.dev=o}
function ins100EmbOK(k){if(!k||k==='none')return true;if(String(k).startsWith('sym:'))return typeof DR_SYM98!=='undefined'&&!!DR_SYM98[String(k).slice(4)];return !!INS100_R[k]||(typeof FLAG_SHAPES!=='undefined'&&FLAG_SHAPES.includes(k))}
function ins100Emblem(key,fg,bg,etxt){if(!key||key==='none')return null;let s='',k=1;key=String(key);
  if(key.startsWith('sym:')){s=(typeof DR_SYM98!=='undefined'&&DR_SYM98[key.slice(4)])||'';k=1.75}
  else if(INS100_R[key]){s=INS100_R[key];if(key==='num')s=s.replace('NUMTXT',ins100X(etxt||'XII'))}
  else s=ins100Devs()[key]||'';
  return s?{s:s.replace(/FG/g,fg).replace(/BG/g,bg),k}:null}

/* ---------------- the adapter: any row → the v2 design (read time only) ---------------- */
/* any colour the old press took (#rrggbb, #rgb, rgb()/rgba()) → #rrggbb; anything else → d */
function ins100Hex(v,d){const s=String(v==null?'':v).trim();if(/^#[0-9a-fA-F]{6}$/.test(s))return s.toLowerCase();if(/^#[0-9a-fA-F]{3}$/.test(s))return ('#'+s[1]+s[1]+s[2]+s[2]+s[3]+s[3]).toLowerCase();
  const m=s.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);if(m)return '#'+[m[1],m[2],m[3]].map(x=>Math.max(0,Math.min(255,+x)).toString(16).padStart(2,'0')).join('');return d}
/* Roman square capitals: U→V, J→I, letters/digits/·/space only (≤ n) */
function ins100Caps(s,n){return String(s==null?'':s).toUpperCase().replace(/U/g,'V').replace(/J/g,'I').replace(/[^A-Z0-9·.\- ]/g,'').slice(0,n||12)}
function ins100Norm(f){if(!f||typeof f!=='object')return null;
  if(f.c1!=null){const c1=ins100Hex(f.c1,'#6e1414');const T={...INS100_TRIM0,...(f.trim&&typeof f.trim==='object'?f.trim:{})};if(!INS100_FC[T.fc]&&T.fc!=='c2')T.fc='gold';
    return {v:2,c1,c2:ins100Hex(f.c2,c1),fg:ins100Hex(f.fg,'#e2b64a'),pat:INS100_PATS.some(p=>p[0]===f.pat)?f.pat:'plain',emb:ins100EmbOK(f.emb)?(f.emb||'none'):'none',
      top:INS100_TOPS.includes(f.top)?f.top:'emb',ins:String(f.ins==null?'':f.ins).slice(0,14),trim:T,wear:Math.max(0,Math.min(1,+f.wear||0)),etxt:f.etxt}}
  const c1=ins100Hex(f.bg,'#6e1414');
  return {v:2,c1,c2:c1,fg:ins100Hex(f.fg,'#e2b64a'),pat:'plain',emb:ins100EmbOK(f.shape)?(f.shape||'none'):'none',top:'emb',ins:String(f.txt==null?'':f.txt).slice(0,14),trim:{...INS100_TRIM0},wear:0}}
/* a v2 design → the row the Store keeps (with the old fields too, so an old page / the kill switch still flies something sensible) */
function ins100Row(f){const d=ins100Norm(f);if(!d)return null;const keep={};for(const k of ['id','name','rack','fmt','locked','lockLog','created','layers','baked'])if(f[k]!==undefined)keep[k]=f[k];
  return {...keep,v:2,c1:d.c1,c2:d.c2,fg:d.fg,pat:d.pat,emb:d.emb,top:d.top,ins:d.ins,trim:{...d.trim},wear:Math.round(d.wear*100)/100,
    bg:d.c1,txt:d.ins,shape:typeof FLAG_SHAPES!=='undefined'&&FLAG_SHAPES.includes(d.emb)?d.emb:'none'}}
/* an online Domus look {c1 field, c2 device, crest, + v1.0: c3 second dye, pat, ins, trim, wear, top} → the design */
function ins100FromLook(L,txt){L=L||{};return ins100Norm({c1:L.c1||'#7a2230',c2:L.c3||L.c1||'#7a2230',fg:L.c2||'#d6ab4c',emb:L.crest||'none',pat:L.pat,top:L.top,
  ins:L.ins!=null&&L.ins!==''?L.ins:(txt!=null?txt:''),trim:L.trim,wear:L.wear})}
function ins100Hash(d,extra){const n=ins100Norm(d)||{};const sc=(d&&((d.layers&&d.layers.length)||(d.baked&&d.baked.length)))?hashStr(JSON.stringify([d.layers||[],d.baked||[]])):0;
  return hashStr(JSON.stringify([n.c1,n.c2,n.fg,n.pat,n.emb,n.top,n.ins,n.trim,n.wear,n.etxt||'']))+'.'+sc+(extra?'.'+hashStr(extra):'')}

/* ---------------- the painter (the mock's engine, ported) ---------------- */
function ins100Pattern(d,b,cx,cy,r,ps){const [x,y,w,h]=b;const c1=d.c1,c2=d.c2;let s=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c1}"/>`;const t=Math.min(w,h)*.1;
  switch(d.pat){
  case 'clavi':s+=`<rect x="${x+w*.22}" y="${y}" width="${w*.09}" height="${h}" fill="${c2}"/><rect x="${x+w*.69}" y="${y}" width="${w*.09}" height="${h}" fill="${c2}"/>`;break;
  case 'halved':s+=`<rect x="${x+w/2}" y="${y}" width="${w/2}" height="${h}" fill="${c2}"/>`;break;
  case 'meander':case 'wave':{if(r<0){const R=-r,tt=R*.16,dk=ins100Shade(c1,-.25);s+=`<circle cx="${cx}" cy="${cy}" r="${R-tt/2}" fill="none" stroke="${c2}" stroke-width="${tt}"/><circle cx="${cx}" cy="${cy}" r="${R-tt/2}" fill="none" stroke="${dk}" stroke-width="${tt*.55}" stroke-dasharray="${d.pat==='meander'?`${tt*.7} ${tt*.35}`:`.1 ${tt*.9}`}" stroke-linecap="${d.pat==='meander'?'butt':'round'}"/>`;break}
    const p=d.pat==='meander'?'imk':'iwv';const i=t*.9;
    s+=`<g fill="url(#${p})"><rect x="${x+i}" y="${y+i}" width="${w-2*i}" height="${t}"/><rect x="${x+i}" y="${y+h-i-t}" width="${w-2*i}" height="${t}"/></g><g fill="url(#${p}v)"><rect x="${x+i}" y="${y+i+t}" width="${t}" height="${h-2*i-2*t}"/><rect x="${x+w-i-t}" y="${y+i+t}" width="${t}" height="${h-2*i-2*t}"/></g>`;break}
  case 'clipeus':s+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c2}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#ig)" stroke-width="${Math.max(2,r*.09)}"/><circle cx="${cx}" cy="${cy}" r="${r*.86}" fill="none" stroke="url(#ig)" stroke-width="${Math.max(.8,r*.025)}"/>`;break}
  return s}
function ins100Laurel(cx,cy,r){let s='';for(let i=0;i<9;i++)for(const sd of [-1,1]){const a=(90+sd*(28+i*15))*Math.PI/180;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;const rot=a*180/Math.PI+(sd>0?-60:60)+90;
    s+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(r*.16).toFixed(1)}" ry="${(r*.065).toFixed(1)}" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="url(#ilf)"/>`}
  return s+`<path d="M${cx-r*.25} ${cy+r*.98} Q${cx} ${cy+r*1.08} ${cx+r*.25} ${cy+r*.98}" stroke="#9b2a1c" stroke-width="${r*.05}" fill="none"/>`}
/* the dovetailed plaque (tabula ansata) — bronze, letters cut dark */
function ins100Tabula(x,y,w,h,txt,fs){const a=h*.62;fs=fs||h*.56;return `<path d="M${x} ${y} H${x+w} L${x+w+a} ${y+h/2} L${x+w} ${y+h} H${x} L${x-a} ${y+h/2}Z" fill="url(#ibr)" stroke="#5a3c10" stroke-width="1"/><path d="M${x+2} ${y+2.5} H${x+w-2} V${y+h-2.5} H${x+2}Z" fill="none" stroke="#5a3c10" stroke-opacity=".5" stroke-width=".7"/><circle cx="${x-a*.55}" cy="${y+h/2}" r="${h*.08}" fill="#5a3c10"/><circle cx="${x+w+a*.55}" cy="${y+h/2}" r="${h*.08}" fill="#5a3c10"/><text x="${x+w/2}" y="${y+h*.7}" text-anchor="middle" font-family="Marcellus SC,Georgia,serif" font-size="${fs}" letter-spacing="${fs*.18}" fill="#3a2208">${ins100X(txt)}</text>`}
const ins100Gold=(x,y,fs,txt,ls)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="Marcellus SC,Georgia,serif" font-size="${fs}" letter-spacing="${ls==null?fs*.22:ls}" fill="url(#ig)" stroke="#3a2208" stroke-width="${fs*.045}" paint-order="stroke">${ins100X(txt)}</text>`;
function ins100Defs(d,kind,wear,seed,lod){const shieldK=kind==='scutum'||kind==='parma';const c=d.c1;const ps=kind==='pannus'?1.9:kind==='velarium'||kind==='wall'?1:.75;const dk=ins100Shade(c,-.25);
  const mk=(id,rot)=>`<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="scale(${ps})${rot?' rotate(90)':''}"><rect width="16" height="16" fill="${d.c2}"/><path d="M0 14 H14 V2 H3 V11 H11 V5 H6 V8" fill="none" stroke="${dk}" stroke-width="1.8"/></pattern>`;
  const wv=(id,rot)=>`<pattern id="${id}" width="18" height="16" patternUnits="userSpaceOnUse" patternTransform="scale(${ps})${rot?' rotate(90)':''}"><rect width="18" height="16" fill="${d.c2}"/><path d="M0 12 C4 12 5 4 10 4 C15 4 15 10 12 10 C10 10 10 7 11.5 7 M12 10 C14 13 16 12 18 12" fill="none" stroke="${dk}" stroke-width="1.8"/></pattern>`;
  const wk=kind==='pannus'?7:3;
  return `<defs>${lod?'':`<filter id="in" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${shieldK?'.035':kind==='pannus'?'.5 .4':'1.1 .85'}" numOctaves="${shieldK?3:2}" seed="${4+seed%7}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${shieldK?.55:.5} ${shieldK?-.12:-.05}"/></filter>
  <filter id="in2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="9"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .22 -.04"/></filter>
  <pattern id="iw" width="${wk}" height="${wk}" patternUnits="userSpaceOnUse"><path d="M0 ${wk/2}H${wk}M${wk/2} 0V${wk}" stroke="#000" stroke-opacity=".1" stroke-width="${wk*.2}"/></pattern>
  <filter id="iwr" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="3"/><feDisplacementMap in="SourceGraphic" scale="${(wear*7).toFixed(1)}"/></filter>`}
  ${d.pat==='meander'?mk('imk')+mk('imkv',1):''}${d.pat==='wave'?wv('iwv')+wv('iwvv',1):''}
  <filter id="ish" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${kind==='pannus'?8:4}"/></filter>
  <radialGradient id="ivg" cx=".5" cy=".45" r=".7"><stop offset=".5" stop-color="#3a2810" stop-opacity="0"/><stop offset="1" stop-color="#2a1a08" stop-opacity="${(.12+wear*.55).toFixed(2)}"/></radialGradient>
  <linearGradient id="ig" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f6dc8a"/><stop offset=".45" stop-color="#d8b25a"/><stop offset=".55" stop-color="#b48a34"/><stop offset="1" stop-color="#e9c66a"/></linearGradient>
  <linearGradient id="ibr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e2bd6e"/><stop offset=".5" stop-color="#b5873a"/><stop offset="1" stop-color="#8a6024"/></linearGradient>
  <radialGradient id="ibs" cx=".36" cy=".32" r=".75"><stop offset="0" stop-color="#fff2c0"/><stop offset=".35" stop-color="#d8b25a"/><stop offset=".8" stop-color="#7a5418"/><stop offset="1" stop-color="#4a3008"/></radialGradient>
  <linearGradient id="ilf" x1="0" x2="1"><stop offset="0" stop-color="#e9c66a"/><stop offset="1" stop-color="#9a7a2a"/></linearGradient>
  <linearGradient id="ip" x1="0" x2="1"><stop offset="0" stop-color="#3a2614"/><stop offset=".45" stop-color="#9a7040"/><stop offset="1" stop-color="#2a1a0c"/></linearGradient>
  <linearGradient id="if" x1="0" x2="1">${shieldK?`<stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".18" stop-color="#000" stop-opacity=".12"/><stop offset=".38" stop-color="#fff" stop-opacity=".16"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset=".86" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".6"/>`:`<stop offset="0" stop-color="#000" stop-opacity=".34"/><stop offset=".13" stop-color="#fff" stop-opacity=".1"/><stop offset=".3" stop-color="#000" stop-opacity=".2"/><stop offset=".47" stop-color="#fff" stop-opacity=".09"/><stop offset=".64" stop-color="#000" stop-opacity=".17"/><stop offset=".82" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity=".36"/>`}</linearGradient>
  <radialGradient id="ipf" cx=".38" cy=".34" r=".72"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
  <linearGradient id="iv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".12" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
  </defs>`}
function ins100FCol(d){const k=(d.trim||{}).fc||'gold';if(k==='c2')return [ins100Shade(d.c2,.2),ins100Shade(d.c2,-.35)];return INS100_FC[k]||INS100_FC.gold}
function ins100Fringe(x0,x1,y,len,d){const [a,b]=ins100FCol(d);let s='';for(let x=x0;x<=x1;x+=2.8)s+=`<path d="M${x.toFixed(1)} ${y} l${(((x*7)%5)/5-.5).toFixed(2)} ${len}" stroke="${((x*10|0)%3)?a:b}" stroke-width="1.3"/>`;return s}
function ins100Tassel(x,y,d,sz){sz=sz||1;const [a,b]=ins100FCol(d);return `<g transform="translate(${x} ${y}) scale(${sz})"><path d="M0 0 V6" stroke="${b}" stroke-width="1.2"/><circle cx="0" cy="7" r="3" fill="${a}" stroke="${b}" stroke-width=".6"/><path d="M-3.4 9 L3.4 9 L4.6 22 L-4.6 22Z" fill="${a}"/>${[-3,-1,1,3].map(o=>`<path d="M${o} 11 L${o*1.3} 22" stroke="${b}" stroke-width=".5"/>`).join('')}</g>`}
function ins100ClothFx(VW,VH,lod,wear,shieldK){return `${lod?'':`<rect width="${VW}" height="${VH}" fill="url(#iw)" opacity="${shieldK?0:1}"/><rect width="${VW}" height="${VH}" filter="url(#in)" style="mix-blend-mode:multiply"/>${shieldK?`<rect width="${VW}" height="${VH}" filter="url(#in2)" style="mix-blend-mode:screen" opacity=".6"/>`:''}`}
  <rect width="${VW}" height="${VH}" fill="url(#if)"/>${shieldK?'':`<rect width="${VW}" height="${VH}" fill="url(#iv)"/>`}
  ${wear>0?`<rect width="${VW}" height="${VH}" fill="url(#ivg)"/><rect width="${VW}" height="${VH}" fill="#7a5a2a" opacity="${(wear*.22).toFixed(2)}" style="mix-blend-mode:multiply"/>`:''}`}
/* the emblem group at (cx,cy) scale sc: solid + ink outline + soft shadow (his 2a) */
function ins100EmbG(d,cx,cy,sc,lod,fill){const e=ins100Emblem(d.emb,fill||d.fg,d.c1,d.etxt);if(!e||!e.s)return '';
  const blk=e.s.replace(/fill="(?!none)[^"]*"/g,'fill="#000"').replace(/stroke="(?!none)[^"]*"/g,'stroke="#000"');
  return `<g transform="translate(${cx} ${cy}) scale(${sc*e.k}) translate(-300 -180)"><g transform="translate(5 7)" opacity=".4" filter="url(#ish)">${blk}</g><g stroke="#2a1a0c" stroke-width="${lod?6:3.2}" stroke-linejoin="round" stroke-opacity=".7">${e.s}</g></g>`}
/* ins100SVG — one kind of one design as an SVG document. d = the normalized design; o = {px, sculpt (svg in 600×340 space), extra
   (the old flagURI `extra`, drawn as is), short (flammula: a short pole), ar (wall: cloth width/height), parma (data URI riding the crossbar), aurea} */
function ins100SVG(kind,d,o={}){const K=INS100_KINDS[kind]||INS100_KINDS.vexillum;let [VW,VH]=K.vb;const lod=!!(o.px&&o.px<INS100.LOD);const T=d.trim||INS100_TRIM0;const wear=+d.wear||0;
  const seed=hashStr(d.c1+d.c2+d.emb)%97;const gilt=T.gilt!==false;const shieldK=kind==='scutum'||kind==='parma';let back='',body='',front='',cut='';const ins=String(d.ins||'').trim();
  const sct=(cx,cy,sc)=>o.sculpt&&!lod?`<g transform="translate(${cx} ${cy}) scale(${sc}) translate(-300 -180)">${o.sculpt}</g>`:'';
  const pole=(x,y0,y1,w)=>`<rect x="${x-w/2}" y="${y0}" width="${w}" height="${y1-y0}" rx="${w/2}" fill="url(#ip)"/>`;
  const spear=(x,y)=>`<path d="M${x} ${y-22} L${x+5.5} ${y-4} L${x+2.6} ${y} L${x-2.6} ${y} L${x-5.5} ${y-4}Z" fill="url(#ig)" stroke="#5a3c10" stroke-width=".7"/><rect x="${x-3.6}" y="${y}" width="7.2" height="5" fill="url(#ibr)"/>`;
  const bar=(x0,x1,y)=>`<rect x="${x0}" y="${y-3}" width="${x1-x0}" height="6.5" rx="3" fill="url(#${gilt?'ig':'ip'})"/><circle cx="${x0}" cy="${y+.2}" r="5" fill="url(#ibs)"/><circle cx="${x1}" cy="${y+.2}" r="5" fill="url(#ibs)"/>`;
  const ribbons=(x,y,len)=>`<path d="M${x} ${y} q-3 ${len*.5} 2 ${len}" stroke="${d.c2}" stroke-width="4" fill="none"/><path d="M${x+3} ${y} q4 ${len*.45} -1 ${len*.9}" stroke="${ins100Shade(d.c1,.1)}" stroke-width="3.4" fill="none"/>`;
  const head=(vw,vh)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}" width="${o.px?Math.max(1,Math.round(o.px*vw/vh)):vw}" height="${o.px||vh}">`;
  switch(kind){
  case 'pannus':{cut='M0 0H600V340H0Z';const cx=300,cy=ins?160:170;const sm=d.pat==='clipeus'||d.pat==='laurel';
    body=ins100Pattern(d,[0,0,600,340],cx,cy,108)+(d.pat==='laurel'?ins100Laurel(cx,cy,110):'')+ins100EmbG(d,cx,cy,sm?.62:.92,lod)+(o.sculpt||'')+(o.extra||'')+(ins&&!lod?ins100Gold(300,d.pat==='meander'||d.pat==='wave'?296:318,34,ins,10):'');
    const svg=head(600,340)+ins100Defs(d,kind,wear,seed,lod)+`<g${wear>0.05&&!lod?' filter="url(#iwr)"':''}>${body}${ins100ClothFx(600,340,lod,wear,false)}</g></svg>`;return svg}
  case 'wall':{/* the arena's wall cloth: hangs from its bar, no pole (the tile name is painted on top by 192) */
    cut='M6 8 H54 V138 H6Z';back=bar(3,57,7);body=ins100Pattern(d,[6,8,48,130],30,72,18)+ins100EmbG(d,30,40,.07,true);
    if(T.fringe!==false)front+=ins100Fringe(7,53,138,9,d);if(T.tassels)front+=ins100Tassel(6,138,d,.7)+ins100Tassel(54,138,d,.7);break}
  case 'vexillum':{cut='M40 36 H180 V182 H40Z';const cx=110,cy=ins?96:108;const ifs=Math.min(15,118/Math.max(1,ins.length)*1.05);const sm=d.pat==='clipeus'||d.pat==='laurel';
    back=pole(110,8,300,7)+spear(110,16)+(T.bar!==false?bar(28,192,32):'')+ribbons(28,34,58)+ribbons(189,34,58);
    body=ins100Pattern(d,[40,36,140,146],cx,cy,44)+(d.pat==='laurel'?ins100Laurel(cx,cy,44):'')+ins100EmbG(d,cx,cy,sm?.2:.27,lod)+sct(cx,cy,.27)+(ins&&!lod?ins100Gold(110,d.pat==='meander'||d.pat==='wave'?158:166,ifs,ins):'');
    if(T.fringe!==false&&!lod)front+=ins100Fringe(41,179,182,13,d);if(T.tassels)front+=ins100Tassel(40,182,d)+ins100Tassel(180,182,d);break}
  case 'flammula':{if(o.short)VH=262;cut='M18 34 H92 V244 L55 218 L18 244Z';const cx=55,cy=118;const sm=d.pat==='clipeus'||d.pat==='laurel';
    back=pole(55,6,VH,6)+spear(55,14)+(T.bar!==false?bar(12,98,30):'');
    body=ins100Pattern(d,[18,34,74,210],cx,cy,26)+(d.pat==='laurel'?ins100Laurel(cx,cy,27):'')+ins100EmbG(d,cx,cy,sm?.15:.21,lod)+sct(cx,cy,.21)+(T.topbar?`<rect x="18" y="34" width="74" height="16" fill="#9b2a1c"/><rect x="18" y="50" width="74" height="2" fill="url(#ig)"/>`:'');
    if(T.tassels)front+=ins100Tassel(18,244,d)+ins100Tassel(92,244,d);
    if(o.parma)front+=`<g filter="url(#ish)" opacity=".5"><circle cx="55" cy="33" r="17" fill="#000"/></g><image href="${o.parma}" x="38" y="15" width="34" height="34"/>`;break}
  case 'velarium':{cut='M20 22 Q125 46 230 22 Q335 46 440 22 V198 H20Z';const cx=230,cy=108;const sm=d.pat==='clipeus'||d.pat==='laurel';
    back=`<path d="M20 22 L8 6 M230 22 L230 4 M440 22 L452 6" stroke="#6a5030" stroke-width="2"/>`;
    body=ins100Pattern(d,[20,14,420,190],cx,cy,52)+Array.from({length:10},(_,i)=>`<rect x="${20+i*42}" y="0" width="21" height="236" fill="#000" opacity=".26"/><path d="M${20+i*42+.5} 0V236M${41+i*42-.5} 0V236" stroke="#fff" stroke-opacity=".12" stroke-width="1"/>`).join('')+(d.pat==='laurel'?ins100Laurel(cx,cy,52):'')+ins100EmbG(d,cx,cy,sm?.24:.3,lod)+sct(cx,cy,.3);
    if(ins&&!lod)front+=ins100Tabula(170,166,120,24,ins,14);if(T.fringe!==false&&!lod)front+=ins100Fringe(21,439,198,11,d);if(T.tassels)front+=ins100Tassel(20,22,d)+ins100Tassel(230,22,d)+ins100Tassel(440,22,d);break}
  case 'scutum':{cut='M28 16 Q90 4 152 16 Q160 135 152 254 Q90 266 28 254 Q20 135 28 16Z';const cx=90,cy=84;const sm=d.pat==='clipeus'||d.pat==='laurel';
    body=ins100Pattern(d,[18,4,144,262],cx,cy,46)+(d.pat==='laurel'?ins100Laurel(cx,cy,50):'')+ins100EmbG(d,cx,cy,sm?.22:.34,lod)+sct(cx,cy,.34)
      +(lod?'':`<path d="M90 140 V258" stroke="#000" stroke-opacity=".22" stroke-width="5"/><path d="M89 140 V258" stroke="#fff" stroke-opacity=".12" stroke-width="1.5"/>`);
    front=`<circle cx="90" cy="168" r="${lod?20:17}" fill="url(#ibs)" stroke="#4a3008" stroke-width="1.2"/><circle cx="86" cy="163" r="4" fill="#fff6d0" opacity=".55"/>`;break}
  case 'parma':{cut='M80 10 A70 70 0 1 1 79.9 10Z';const cx=80,cy=80;const sm=d.pat==='clipeus'||d.pat==='laurel';
    body=ins100Pattern(d,[10,10,140,140],cx,cy,(d.pat==='meander'||d.pat==='wave')?-70:36)+(d.pat==='laurel'?ins100Laurel(cx,cy,40):'')+ins100EmbG(d,cx,cy,sm?.17:.24,lod)+sct(cx,cy,.24);
    if(!lod)front=Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return `<circle cx="${(80+Math.cos(a)*64).toFixed(1)}" cy="${(80+Math.sin(a)*64).toFixed(1)}" r="2.2" fill="url(#ibs)"/>`}).join('');break}
  case 'signum':{/* a pole standard: the topper, crossbar + ribbons, wreath, phalerae, the clipeus with the emblem, lunula, tabula */
    back=pole(60,30,320,7)+`<path d="M56 314 L60 320 L64 314Z" fill="#5a3c10"/>`;let s='';
    let top=d.top||'emb';if(top==='sym:eagle'&&!o.aurea)top='emb';const tk=top==='emb'?d.emb:top;
    const te=ins100Emblem(tk,'url(#ig)','#3a2208',d.etxt);if(te&&te.s)s+=`<g transform="translate(60 22) scale(${.12*te.k}) translate(-300 -180)"><g transform="translate(5 7)" opacity=".4" filter="url(#ish)">${te.s.replace(/fill="(?!none)[^"]*"/g,'fill="#000"').replace(/stroke="(?!none)[^"]*"/g,'stroke="#000"')}</g><g stroke="#5a3c10" stroke-width="5" stroke-linejoin="round">${te.s}</g></g>`;
    s+=`<rect x="44" y="42" width="32" height="6" rx="2" fill="url(#ibr)"/>`+bar(20,100,58)+ribbons(20,60,54)+ribbons(97,60,54)+(T.tassels?ins100Tassel(22,112,d,.8)+ins100Tassel(99,112,d,.8):'');
    s+=`<circle cx="60" cy="82" r="13" fill="none" stroke="url(#ilf)" stroke-width="5"/>${lod?'':ins100Laurel(60,82,13)}`;
    for(const y of [108,212,236])s+=`<circle cx="60" cy="${y}" r="10.5" fill="url(#ibs)" stroke="#4a3008" stroke-width=".8"/><circle cx="60" cy="${y}" r="4" fill="${d.c1}" stroke="#4a3008" stroke-width=".6"/>`;
    s+=`<circle cx="60" cy="158" r="31" fill="url(#ibs)" stroke="#4a3008" stroke-width="1"/><circle cx="60" cy="158" r="25" fill="${d.c1}"/>`+(d.pat==='clipeus'?`<circle cx="60" cy="158" r="19" fill="${d.c2}"/>`:'')+ins100EmbG(d,60,158,.075,lod)+(lod?'':`<circle cx="60" cy="158" r="25" fill="url(#ipf)"/>`);
    s+=`<path d="M44 252 Q60 274 76 252 Q60 264 44 252Z" fill="url(#ig)" stroke="#5a3c10" stroke-width=".6"/>`;
    if(ins&&!lod)s+=ins100Tabula(36,276,48,16,ins.slice(0,8),9.5);
    return head(VW,VH)+ins100Defs(d,kind,wear,seed,lod)+back+s+'</svg>'}}
  const edge=gilt?`<path d="${cut}" fill="none" stroke="url(#${shieldK?'ibr':'ig'})" stroke-width="${shieldK?(lod?5:4.5):(lod?3:2.2)}" stroke-linejoin="round"/>`:`<path d="${cut}" fill="none" stroke="${ins100Shade(d.c1,-.45)}" stroke-width="${lod?2.6:1.6}"/>`;
  const shadow=`<g transform="translate(2.5 3.5)" opacity=".35"><path d="${cut}" fill="#000"/></g>`;
  const cloth=`<g clip-path="url(#ic)">${body}${ins100ClothFx(VW,VH,lod,wear,shieldK)}${kind==='parma'?`<rect width="160" height="160" fill="url(#ipf)"/>`:''}</g>`;
  return head(VW,VH)+ins100Defs(d,kind,wear,seed,lod).replace('</defs>',`<clipPath id="ic"><path d="${cut}"/></clipPath></defs>`)+back+`<g${wear>0.05&&!lod?' filter="url(#iwr)"':''}>${shadow}${cloth}${edge}</g>${front}</svg>`}

/* ---------------- THE ONE FUNCTION ---------------- */
function ins100Put(M,k,v){if(M.size>=INS100.MAX){const f=M.keys().next().value;M.delete(f)}M.set(k,v);return v}
/* insignia100 — design (any row: v2, old {bg,fg,txt,shape}, or a look) × kind × px → a data URI (cached). opt: {extra, short, ar, parma, aurea, look:1} */
function insignia100(design,kind='vexillum',px,opt={}){if(!design)return '';const d0=opt.look?ins100FromLook(design,opt.txt):design;const d=ins100Norm(d0);if(!d)return '';
  if(!INS100_KINDS[kind])kind='vexillum';px=px?Math.max(8,Math.round(px)):0;
  const hasSc=!!((d0.layers&&d0.layers.length)||(d0.baked&&d0.baked.length));const lod=px&&px<INS100.LOD;
  const key=kind+'|'+px+'|'+ins100Hash(d0,(opt.extra||'')+(opt.short?'s':'')+(opt.parma||'')+(opt.aurea?'a':''));const hit=INS100.uri.get(key);if(hit){INS100.stats.hit++;return hit}INS100.stats.miss++;
  let sculpt='';if(hasSc&&!lod&&typeof flagSculpt==='function'&&typeof scbLayersSVG==='function'){try{sculpt=flagSculpt(d0)}catch(e){}}
  let svg='';try{svg=ins100SVG(kind,d,{px,sculpt,extra:opt.extra,short:opt.short,parma:opt.parma,aurea:opt.aurea})}catch(e){console.error(e);return ''}
  const uri='data:image/svg+xml,'+encodeURIComponent(svg);
  /* the bench design changes with every drag: never keep its drafts */
  if(hasSc&&typeof ST!=='undefined'&&design===ST.fd)return uri;return ins100Put(INS100.uri,key,uri)}
/* insignia100.img — the same picture as a loaded Image for a canvas (null until it has decoded; onload re-asks the caller) */
insignia100.img=function(design,kind,px,opt={},onload){const u=insignia100(design,kind,px,opt);if(!u)return null;let im=INS100.img.get(u);
  if(!im){im=new Image();im.decoding='async';im.onload=()=>{try{if(onload)onload(im)}catch(e){}};im.src=u;ins100Put(INS100.img,u,im)}return im.complete&&im.naturalWidth?im:null};
/* insignia100.bmp — the picture rasterised ONCE at w×h device pixels on a canvas (per-frame painters draw this, never the SVG) */
INS100.bmp=new Map();
insignia100.bmp=function(design,kind,px,opt,w,h,onload){const im=insignia100.img(design,kind,px,opt,onload);if(!im)return null;w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));const k=im.src.length+'|'+hashStr(im.src.slice(-400))+'|'+w+'x'+h;
  let c=INS100.bmp.get(k);if(!c){c=document.createElement('canvas');c.width=w;c.height=h;try{c.getContext('2d').drawImage(im,0,0,w,h)}catch(e){return im}if(INS100.bmp.size>=120){const f=INS100.bmp.keys().next().value;INS100.bmp.delete(f)}INS100.bmp.set(k,c)}return c};
insignia100.svg=(design,kind,opt={})=>{const d=ins100Norm(opt.look?ins100FromLook(design,opt.txt):design);return d?ins100SVG(kind,d,opt):''};
insignia100.norm=ins100Norm;insignia100.row=ins100Row;insignia100.hash=ins100Hash;insignia100.kinds=INS100_KINDS;

/* ---------------- the LOCKED SYSTEM designs ---------------- */
const INS100_CITYPAT={roma:'laurel',capua:'wave',pompeii:'clavi',syracusae:'halved',thysdrus:'meander',nemausus:'halved',leptis:'clavi',pola:'wave',verona:'meander',arles:'clipeus',puteoli:'wave',uthina:'clavi',carthago:'meander',aegyptus:'clipeus'};
let INS100_SYS=null;
/* ins100Sys — every system design by key: empire, city:<k>, rank:<k>, region:<k>, arena (wall cloth), drape, flavius. {n, kind, d, grp} */
function ins100Sys(){if(INS100_SYS)return INS100_SYS;const S={};const gold='#e2b64a';
  try{S.empire={n:'S·P·Q·R',grp:'empire',kind:'vexillum',d:{c1:'#9b2a1c',c2:gold,fg:gold,pat:'laurel',emb:'eagle',top:'sym:eagle',ins:'S·P·Q·R',trim:{...INS100_TRIM0,tassels:true}}}}catch(e){}
  try{for(const [k,F] of Object.entries(FLAGS)){const [bg,fg,txt,shape]=F.v[0];const pat=INS100_CITYPAT[k]||'plain';S['city:'+k]={n:F.n,grp:'city',kind:'vexillum',d:{c1:bg,c2:pat==='halved'||pat==='clavi'?ins100Shade(bg,.35):fg,fg,pat,emb:shape,ins:txt,trim:{...INS100_TRIM0}}}}}catch(e){}
  try{ONLC.DRANKS98.forEach((R,i)=>{S['rank:'+R.k]={n:R.n,grp:'rank',kind:'flammula',d:{c1:R.bg,c2:R.bg,fg:R.fg,pat:'plain',emb:'sym:'+R.sym,trim:{...INS100_TRIM0,tassels:i>=6,topbar:i>=7,fringe:false}},i}})}catch(e){}
  try{const RP={na:'wave',sa:'clavi',eu:'meander',af:'clipeus',me:'halved',as:'clavi',oc:'wave'};for(const R of ONLC.REGIONS98)S['region:'+R.k]={n:R.n,grp:'region',kind:'vexillum',d:{c1:R.bg,c2:RP[R.k]==='halved'||RP[R.k]==='clavi'?ins100Shade(R.bg,.3):R.fg,fg:R.fg,pat:RP[R.k]||'plain',emb:R.shape,ins:R.w,trim:{...INS100_TRIM0}}}}catch(e){}
  S.arena={n:_T('Arena · wall cloth'),grp:'arena',kind:'wall',d:{c1:'#a8322c',c2:'#c9a24e',fg:'#e8c66a',pat:'meander',emb:'none',ins:'',trim:{...INS100_TRIM0,fc:'gold'}}};
  S.drape={n:_T('Arena · the drape'),grp:'arena',kind:'wall',d:{c1:'#1a1210',c2:'#c9a24e',fg:'#c9a24e',pat:'clavi',emb:'none',ins:'',trim:{...INS100_TRIM0,fc:'gold'}}};
  S.flavius={n:'Flavius',grp:'flavius',kind:'flammula',d:{c1:'#3d1838',c2:'#c9a24e',fg:'#e2b64a',pat:'meander',emb:'sym:laurel',ins:'',trim:{...INS100_TRIM0,tassels:true,fringe:false}}};
  for(const k in S)S[k].d=ins100Norm(S[k].d);return INS100_SYS=S}
/* the Domus-rank streamer; from Ludus Magnus (idx 4) up the house parma rides its crossbar (his 1a) when the house design is known */
function ins100Rank(k,look,px){const S=ins100Sys();const R=S['rank:'+k]||S['rank:tugurium'];if(!R)return '';let parma='';
  if(look&&(R.i|0)>=4){try{parma=insignia100(look,'parma',40,{look:1,txt:''})}catch(e){}}
  return insignia100(R.d,'flammula',px,{short:1,parma,aurea:k==='aurea'})}

/* ======================================================================
   THE REPLACEMENTS (each passes through under the kill switch)
   ====================================================================== */
if(ins100On()){
  /* flagURI — the shim: the old arguments → the house design's cloth (pannus); extra = the old overlay (sculpt, a symbol) */
  flagURI=function(bg,fg,txt,shape,extra=''){return insignia100({bg,fg,txt,shape},'pannus',0,{extra})};
  /* houseFlagURI — a banner (old or v2 row) as its cloth, sculpt layers included */
  houseFlagURI=function(flag){if(!flag)return null;return insignia100(flag,'pannus')};
  /* flagImg — the cloth as a loaded Image (the square's gate pole, the city gate) */
  flagImg=function(flag){if(!flag)return null;return insignia100.img(flag,'pannus',0)};
  /* the chips = the PARMA */
  flagChip=function(mgr,height=20,title){const f=mgrFlagOf(mgr);if(!f)return '';return `<img class="flagchip ins100c" src="${insignia100(f,'parma',height)}" style="height:${height}px;width:${height}px" alt="" title="${esc(title||(_T('The banner of ')+(mgr.ludus||'')))}">`};
  famFlagChip=function(who,height=15){const f=famFlagOf(who);if(!f)return '';return `<img class="flagchip ins100c" src="${insignia100(f,'parma',height)}" style="height:${height}px;width:${height}px" alt="" title="${_T`The banner of the ${esc(f.fam)} family — every fighter is born under one; kin share it`}">`};
  /* a fresh design on the bench is a v2 design */
  {const base=blankFlag;blankFlag=function(){const b=base.apply(this,arguments);return {...b,v:2,c1:'#5b1a45',c2:'#b5832e',fg:'#e2b64a',pat:'meander',emb:'none',top:'emb',ins:'LVDVS',trim:{...INS100_TRIM0,tassels:true},wear:0,bg:'#5b1a45',txt:'LVDVS',shape:'none'}}}
  /* the crowd's superfan holds up a small VEXILLUM (its pole is the stick) */
  drawFanFlags=function(){if(!S||!S.spect||typeof ctx==='undefined')return;const holders={};
    for(const sp of S.spect){if(sp.gone||sp.fav==null||sp._x==null)continue;const p=S.players[sp.fav];if(!p||!p.mgrGid)continue;if(holders[sp.fav]!=null)continue;holders[sp.fav]=sp;
      const w2=(typeof MGR!=='undefined'&&MGR.world);const g=w2&&w2.glads?w2.glads.find(x=>x.id===p.mgrGid):null;const m=g&&g.contract&&typeof mgrById==='function'?mgrById(g.contract.mgr):null;const f=m?mgrFlagOf(m):null;if(!f)continue;
      const cheering=(S.emotes||[]).some(e=>e.sid===sp.id)||sp.mood>=45;const lift=cheering?TW*0.34:0;const wob=cheering?Math.sin(performance.now()/120)*0.1:0;
      const h=TW*0.62,w=h*220/300;const dpr=window.devicePixelRatio||1;const im=insignia100.bmp(f,'vexillum',32,{},Math.ceil(w*dpr/4)*4,Math.ceil(h*dpr/4)*4);const x=sp._x+TW*0.14,y=sp._y-TW*0.5-lift;
      ctx.save();ctx.translate(x,y);ctx.rotate(wob);
      if(im)ctx.drawImage(im,-w/2,-TW*0.3,w,h);else{ctx.strokeStyle='#5a4a34';ctx.lineWidth=Math.max(1.2,TW*0.03);ctx.beginPath();ctx.moveTo(0,TW*0.34);ctx.lineTo(0,-TW*0.26);ctx.stroke();const n=ins100Norm(f);ctx.fillStyle=n.c1;ctx.fillRect(0,-TW*0.26,TW*0.4,TW*0.24)}
      ctx.restore()}};
  /* 290: the Manager world tabs' house parma + scutum */
  if(typeof parma100==='function')parma100=function(m,px=28){if(!m)return '';const f=mgrFlagOf(m);if(!f)return '';return `<span class="wd100par" style="width:${px}px;height:${px}px" title="${esc(m.ludus||'')}"><img class="wd100parma ins100p" src="${insignia100(f,'parma',px)}" alt=""></span>`};
  if(typeof scutum100==='function')scutum100=function(m){const f=mgrFlagOf(m);if(!f)return '';return `<img class="wd100scutum ins100s" src="${insignia100(f,'scutum',120)}" alt="">`};
  /* 252: the 8 Domus-rank streamers and the 7 region vexilla = locked system designs */
  if(typeof dr98URI==='function')dr98URI=function(k,look){return ins100Rank(k,look)};
  if(typeof rg98Flag==='function')rg98Flag=function(k){const R=ONLC.regionByKey98(k);if(!R)return '';const D=ins100Sys()['region:'+k];const u=D?insignia100(D.d,'vexillum',30):'';
    return u?`<img class="rg98 ins100r" src="${u}" alt="${esc2(_T(R.n))}" title="${esc2(_T`Region: ${_T(R.n)}`)}" data-rg98="${esc2(k)}">`:''};
  /* 175: the online Domus — chips = parma; the banner card = scutum */
  if(typeof d89Crest==='function')d89Crest=function(L,txt){try{return insignia100(L,'parma',0,{look:1,txt:txt!=null?txt:ludusInitials(String(((typeof ONL!=='undefined'&&ONL.domus)||{}).name||''))})}catch(e){return ''}};
  if(typeof d89Banner==='function'){const base=d89Banner;d89Banner=function(){let h=base.apply(this,arguments);try{const L=d89Look();
    const u=insignia100(L,'scutum',0,{look:1,txt:ludusInitials(String((ONL.domus||{}).name||''))});h=h.replace(/(<img class="db89-crest)" src="[^"]*"/,`$1 ins100s" src="${u}"`)}catch(e){}return h}}
  /* the house card + a visited house: the full design's parma instead of the bare cloth */
  for(const fn of ['hc98HTML','l89VisitHTML'])if(typeof window[fn]==='function'){const base=window[fn];window[fn]=function(r){let h=base.apply(this,arguments);try{const D=(r&&r.domus)||{};const L=D.look89&&D.look89.crest?D.look89:null;if(L){
      const old=flagURI0(L.c1,L.c2,ludusInitials(String(D.name||'')),L.crest);const neu=flagURI(L.c1,L.c2,ludusInitials(String(D.name||'')),L.crest);const u=insignia100(L,'parma',0,{look:1,txt:ludusInitials(String(D.name||''))});
      h=h.split(old).join(u).split(neu).join(u);
      /* his 1a: the house parma on its rank streamer's crossbar from Ludus Magnus up */
      const dr=D.dr98&&D.dr98.k;if(dr)h=h.split(dr98URI(dr)).join(ins100Rank(dr,L))}}catch(e){}return h}}
  /* my own Domus: the big rank streamer atop the Glory bar carries my parma (his 1a) */
  if(typeof onlRankBar82==='function'){const base=onlRankBar82;onlRankBar82=function(){let h=base.apply(this,arguments);try{if(typeof h==='string'&&h.includes('dr98-big')&&typeof d89Look==='function'){
      h=h.replace(/(<img class="dr98-big") src="([^"]*)"/,(m,a,src)=>{for(const R of ONLC.DRANKS98)if(dr98URI(R.k)===src)return `${a} src="${ins100Rank(R.k,d89Look())}"`;return m})}}catch(e){}return h}} // i18n:skip
  /* 145: Your ludus banner — a SIGNUM pair + the house vexillum instead of the hand-drawn pennants */
  if(typeof roomScene73==='function'){const base=roomScene73;roomScene73=function(k){let h=base.apply(this,arguments);if(k!=='ludus'||typeof h!=='string')return h;try{
      const m=typeof me==='function'&&me();const f=m&&mgrFlagOf(m);if(!f)return h;const sg=insignia100(f,'signum',96);const vx=insignia100(f,'vexillum',64);
      h=h.replace(/<g><rect x="(\d+(?:\.\d+)?)" y="54" width="26" height="3" rx="1" fill="#8a6a3a"\/>[\s\S]*?<\/g>/g,(mm,x)=>`<image class="ins100sg" href="${sg}" x="${(+x)-7}" y="22" width="36" height="96"/>`);
      h=h.replace(/<rect x="276" y="20" width="48" height="2.5" rx="1" fill="#8a6a3a"\/><image href="[^"]*" x="279" y="22" width="42" height="38" preserveAspectRatio="xMidYMin meet"\/>/,`<image class="ins100vx" href="${vx}" x="278" y="4" width="44" height="60" preserveAspectRatio="xMidYMin meet"/>`)}catch(e){console.error(e)}return h}}
  /* 27: the creation picker hands over the WHOLE design of a v2 rack banner */
  if(typeof flagPickerHTML==='function'){const base=flagPickerHTML;flagPickerHTML=function(cur,seed,ludus){let h=base.apply(this,arguments);try{
      for(const f of (CUSTOM.flags||[]))if(f.c1!=null){const old=esc(JSON.stringify({bg:f.bg,fg:f.fg,txt:f.txt,shape:f.shape}));const row=ins100Row(f);delete row.id;delete row.name;delete row.lockLog;delete row.locked;delete row.rack;delete row.created;
        h=h.split(`data-nmflag='${old}'`).join(`data-nmflag='${esc(JSON.stringify(row))}'`)}}catch(e){}return h}}
}

/* ---------------- 192: the arena's cloths ---------------- */
/* a debounced redraw when a cloth decodes (the deco key carries which cloths are ready, so only that layer repaints) */
function ins100ArenaReady(){INS100.decN=(INS100.decN|0)+1;if(INS100.arenaWait)return;INS100.arenaWait=setTimeout(()=>{INS100.arenaWait=0;try{if(typeof HEADLESS!=='undefined'&&!HEADLESS&&typeof S!=='undefined'&&S)draw()}catch(e){}},60)}
function ins100ArenaBump(){if(INS100.arenaBump)return;INS100.arenaBump=setTimeout(()=>{INS100.arenaBump=0;try{if(typeof AR91!=='undefined')AR91.ver++;if(typeof HEADLESS!=='undefined'&&!HEADLESS&&typeof S!=='undefined'&&S)draw()}catch(e){}},60)}
/* ar91Design100 — the design a section's tapestry carries: the Manager house, a custom character's banner, my Domus online, else generated as today */
function ar91Design100(si){const p=typeof secPlayer==='function'?secPlayer(si):null;const col=p&&CLASSES[p.cls]&&CLASSES[p.cls].color||secColor(si);
  try{if(p&&p.mgrGid&&typeof gById==='function'&&typeof MGR!=='undefined'&&MGR.world){const gl=gById(p.mgrGid);const m=gl&&gl.contract&&typeof mgrById==='function'?mgrById(gl.contract.mgr):null;if(m){const f=mgrFlagOf(m);if(f)return f}}}catch(e){}
  try{if(p&&String(p.cls).startsWith('cc_')&&typeof CUSTOM!=='undefined'){const ch=(CUSTOM.chars||[]).find(c=>'cc_'+c.id===p.cls);const k=ch&&ch.banner91;if(k&&String(k).startsWith('flag:')){const key=String(k).slice(5);
    if(key.startsWith('c:')){const f=(CUSTOM.flags||[]).find(x=>x.id===key.slice(2));if(f)return f}else if(FLAGS[key]){const [bg,fg,txt,shape]=FLAGS[key].v[0];const D=ins100Sys()['city:'+key];return D?D.d:{bg,fg,txt,shape}}}}}catch(e){}
  try{if(p&&S.onl&&S.onl.seat===p.id&&typeof d89Look==='function'&&typeof ONL!=='undefined'&&ONL.domus)return ins100FromLook(d89Look(),'')}catch(e){}
  const k=(p?p.name:'s'+si)+'|'+col;const sh=FLAG_SHAPES[Math.abs(hashStr(k))%FLAG_SHAPES.length];return {bg:shade(col,-0.15),fg:'#f3dc9a',txt:'',shape:sh}}
if(ins100On()&&typeof ar91DecoPaint==='function'){
  ar91FlagSrc=function(si){try{return insignia100(ar91Design100(si),'pannus')}catch(e){return null}};
  /* the deco key: the designs' hashes (stable while nothing changes) + which velaria have decoded */
  /* (per frame: a cheap signature of who each section cheers for + how many cloths decoded; the design hashes only when it changes) */
  const DK100={sig:null,key:''};
  ar91DecoKey=function(){if(ar91Lud())return 'lud';let sig=(INS100.decN|0)+'|'+(S&&S.onl?S.onl.seat:'')+'|';for(let si=0;si<8;si++){const p=typeof secPlayer==='function'?secPlayer(si):null;sig+=(p?p.name+'/'+p.cls+'/'+(p.mgrGid||''):'s'+si)+','}
    if(sig===DK100.sig)return DK100.key;let s='i100:';for(let si=0;si<8;si++){const d=ar91Design100(si);const u=insignia100(d,'velarium',30);const im=INS100.img.get(u);s+=ins100Hash(d)+(im&&im.complete&&im.naturalWidth?'+':'-')+','}DK100.sig=sig;return DK100.key=s};
  /* the tapestries: two poles and a velarium of the section's house hung between them (skewed into the iso stands as before) */
  {const base=ar91DecoPaint;ar91DecoPaint=function(g){if(ar91Lud())return;const n=N-1;const mid=pt(n/2,n/2);const T4=ar91Tiers()>3;
    for(let si=0;si<8;si++){const S8=SECTIONS[si];const col=secColor(si);
      const TT=T4?3:2;const Q=secQuad(si,1.35+TT*0.47,1.82+TT*0.47).map(([r,c])=>pt(r,c)).map(p=>({x:p.x,y:p.y-TT*TW*0.08}));
      g.save();g.strokeStyle='rgba(20,12,6,.6)';g.lineWidth=Math.max(3,TW*0.085);g.lineCap='butt';g.beginPath();g.moveTo(Q[2].x,Q[2].y);g.lineTo(Q[3].x,Q[3].y);g.stroke();
      g.strokeStyle=col;g.lineWidth=Math.max(2,TW*0.06);g.beginPath();g.moveTo(Q[2].x,Q[2].y);g.lineTo(Q[3].x,Q[3].y);g.stroke();g.restore();
      const a0=S8.half?6.8:0.45,a1=S8.half?12.55:6.2;const at=(d,a)=>S8.edge==='top'?pt(-d,a):S8.edge==='bottom'?pt(n+d,a):S8.edge==='left'?pt(a,-d):pt(a,n+d);
      if(at(2,(a0+a1)/2).y>mid.y)continue;
      const am=(a0+a1)/2,w=1.25;const dT=T4?3.39:2.92;const pL=at(dT,am-w/2),pR=at(dT,am+w/2);const up=TW*1.05;
      g.save();g.strokeStyle='#4a321c';g.lineWidth=Math.max(1.5,TW*0.035);for(const p of [pL,pR]){g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x,p.y-up);g.stroke();g.fillStyle='#c9a24e';g.beginPath();g.arc(p.x,p.y-up,TW*0.035,0,Math.PI*2);g.fill()}
      const A={x:pL.x+(pR.x-pL.x)*0.02,y:pL.y+(pR.y-pL.y)*0.02-up*0.97},B={x:pL.x+(pR.x-pL.x)*0.98,y:pL.y+(pR.y-pL.y)*0.98-up*0.97};const len=up*0.66;
      g.translate(A.x,A.y);g.transform((B.x-A.x)/100,(B.y-A.y)/100,0,1,0,0);
      const im=insignia100.img(ar91Design100(si),'velarium',30,{},ins100ArenaReady);
      if(im)g.drawImage(im,0,0,100,len);else{g.fillStyle=shade(col,-0.35);g.fillRect(0,0,100,len);g.fillStyle='#c9a24e';g.fillRect(3,3,94,len-6);g.fillStyle=shade(col,-0.1);g.fillRect(7,7,86,len-14)}
      g.restore()}}}
  /* the far walls' tile-name banners + the FR drape: the locked arena cloths; the names / icon painted on top exactly as before */
  {const base=ar91Banner;ar91Banner=function(g,x,y,w,h,txt){const im=insignia100.img(ins100Sys().arena.d,'wall',40,{},ins100ArenaBump);if(!im)return base.apply(this,arguments);
    g.save();g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-w/2+2,y+2,w,h*0.94);g.drawImage(im,x-w/2,y-h*0.03,w,h);
    g.fillStyle='rgba(20,6,4,.5)';g.fillRect(x-w*0.32,y+h*0.42,w*0.64,h*0.3);
    g.fillStyle='#f6e0a0';g.font=`700 ${Math.round(w*(String(txt).length>1?0.5:0.62))}px "Marcellus SC", serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,x,y+h*0.58);g.restore()}}
  {const base=ar91Drape;ar91Drape=function(g,x,y,w,h){const im=insignia100.img(ins100Sys().drape.d,'wall',40,{},ins100ArenaBump);if(!im)return base.apply(this,arguments);
    g.save();g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x-w/2+2,y+2,w,h);g.drawImage(im,x-w/2,y,w,h);
    const ic=ar91Img(ar91Asset('fr_icon.png'));if(ic){const s2=w*0.76,ly=y+w*0.2;g.fillStyle='#0d0907';g.fillRect(x-s2/2-1,ly-1,s2+2,s2+2);g.drawImage(ic,x-s2/2,ly,s2,s2);g.strokeStyle=AR91GOLD;g.lineWidth=Math.max(1.2,w*0.05);g.strokeRect(x-s2/2-w*0.04,ly-w*0.04,s2+w*0.08,s2+w*0.08)}g.restore()}}
  /* Flavius's box pennant: the locked system FLAMMULA behind the box (falls back to the old paint until it decodes) */
  if(typeof ar91Pennant==='function'){const base=ar91Pennant;ar91Pennant=function(F,T1){const T0=T1*(typeof flavK==='function'?flavK():1);const x=F.cx,y=F.cy,w=F.w,h=F.h;
    const px0=x-w/2-T0*0.09,px1=x+w/2+T0*0.09,py0=y-h/2-T0*0.05,py1=y+h/2+T0*0.43,tip=py1+T0*0.32;
    /* the flammula's cloth (x 18..92, y 34..244 of 110×262) stretched over the pennant's box; rasterised once per size */
    const sx=(px1-px0)/74,sy=(tip-py0)/210;const dpr=window.devicePixelRatio||1;const W2=110*sx,H2=262*sy;
    const im=insignia100.bmp(ins100Sys().flavius.d,'flammula',0,{short:1},Math.ceil(W2*dpr/4)*4,Math.ceil(H2*dpr/4)*4);if(!im)return base.apply(this,arguments);
    ctx.save();ctx.drawImage(im,px0-18*sx,py0-34*sy,W2,H2);
    ctx.fillStyle=ar91Mat().cap;ctx.fillRect(px0-T0*0.02,py0-T0*0.05,px1-px0+T0*0.04,T0*0.06);ctx.strokeStyle='rgba(40,30,20,.45)';ctx.lineWidth=1;ctx.strokeRect(px0-T0*0.02,py0-T0*0.05,px1-px0+T0*0.04,T0*0.06);ctx.restore()}}
  /* decode the fixed arena cloths early so the first arena paints them */
  try{if(typeof HEADLESS==='undefined'||!HEADLESS){const S0=ins100Sys();insignia100.img(S0.arena.d,'wall',40);insignia100.img(S0.drape.d,'wall',40);insignia100.img(S0.flavius.d,'flammula',0,{short:1})}}catch(e){}
}

/* ---------------- CSS for the new pictures in old places ---------------- */
(()=>{if(!ins100On())return;const st=document.createElement('style');st.id='ins100css';st.textContent=`
img.flagchip.ins100c{object-fit:contain;border-radius:50%;vertical-align:-3px;filter:drop-shadow(0 1px 1px #0008)}
.wd100par img.ins100p{width:100%;height:100%;display:block}
img.ins100s.db89-crest{width:auto!important;height:96px!important;object-fit:contain;filter:drop-shadow(0 3px 5px #000b)}
#onl .dr98c{height:26px}#onl .dr98-big{width:auto!important;height:96px!important}#onl .rg98.ins100r{height:20px;box-shadow:none;border-radius:0}
.hc98-dr img{width:auto!important;object-fit:contain}
.wd100hc .sc img.ins100s{width:100%;height:auto;max-height:150px;object-fit:contain;filter:drop-shadow(0 3px 5px #000a)}`;document.head.appendChild(st)})();

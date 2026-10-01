/* =====================================================================
   20-TOKENS · v0.23 TOKEN FIGURES AND THE TOKEN CREATOR
   ---------------------------------------------------------------------
   Three looks for pieces on the board (Settings → Board tokens):
     • standee  — David's printed minis for the 8 classes and default beasts
     • figure   — sculpted vector figurines, built from a small spec (below)
     • cylinder — the original flat tokens
   A figure spec is plain data, so it lives on custom characters (c.token),
   custom beasts (n.token) and class/beast overrides (localStorage flavius_tokens).
   figureSVG(spec) draws it for HTML; tokenImg(spec) turns the same SVG into
   an Image for the canvas board, cached by spec.
   ===================================================================== */
const TOKEN_SKINS=['#f1c9a5','#e0ac7e','#c68e5f','#a86b43','#7d4b2c','#5a341e','#c47a52','#8a8f96','#6f9a7a'];
const T_HELMS=[['none','Bare head'],['galea','Galea'],['crested','Crested galea'],['murmillo','Murmillo grill'],['thraex','Thraex griffin'],['hood','Hood'],['horned','Horned helm'],['laurel','Laurel wreath'],['crown','Crown']];
const T_BODIES=[['tunic','Tunic'],['armor','Lorica (armor)'],['scale','Scale mail'],['bare','Bare-chested'],['robe','Robe'],['rags','Rags'],['flavius','Flavius\u2019s gilded armor']];
/* v0.24: Hall of Flavius rewards unlock these token options */
const ACH_LOCK={weapon:{greatclub:'tholo'},emblem:{eagle:'commodus'},extra:{collar:'tamer'},helm:{laurel:'first'},face:{warpaint:'road3'},body:{flavius:'road12'},capeC:{gold:'eightwins'},baseT:{obsidian:'classes'}};
const achLocked=(f,v)=>null; /* v0.47: achievements carry no rewards — every token part is open to everyone */
const T_SHIELDS=[['none','No shield'],['scutum','Scutum (tall)'],['parma','Parma (square)'],['round','Round'],['buckler','Buckler'],['net','Net (rete)']];
const T_WEAPONS=[['none','Empty hand'],['gladius','Gladius'],['spear','Spear'],['trident','Trident'],['bow','Bow'],['axe','Axe'],['club','Club'],['greatclub','Great blunted club'],['mace','Mace'],['sica','Sica'],['hammer','War hammer'],['flail','Flail'],['scythe','Scythe'],['sling','Sling']];
const T_EYES=[['two','Two eyes'],['cyclops','One great eye (cyclops)'],['patch','Eyepatch'],['glow','Glowing eyes'],['visor','Hidden (visor)']];
const T_BEARD=[['','Clean-shaven'],['full','Full beard'],['goatee','Goatee'],['stache','Moustache'],['stubble','Stubble']];
const T_HAIRS=[['','Short'],['long','Long'],['bald','Shaven'],['topknot','Top-knot'],['crest','Mohawk'],['braid','Braid']];
const T_ARMS=[['','Bare arms'],['manica','Manica (sword arm)'],['bracers','Leather bracers'],['pauldron','Shoulder plate'],['both','Manica + shoulder plate']];
const T_LEGS=[['','Bare legs'],['greaves','Greaves'],['wraps','Leg wraps'],['boots','Tall boots']];
const T_NECK=[['','Nothing'],['torc','Gold torc'],['chain','Slave chain'],['beads','Bead necklace'],['sash','Sash across the chest']];
const T_FACE=[['','Nothing'],['warpaint','War paint'],['scar','Scar'],['woad','Woad (blue face)'],['tattoo','Tattoos']];
const T_EMBLEM=[['','Plain'],['eagle','Eagle'],['bolt','Thunderbolt'],['star','Star'],['sun','Sun'],['wolf','Wolf head'],['boss','Bronze boss']];
const T_OFF=[['','Nothing'],['dagger','Pugio (dagger)'],['torch','Torch'],['whip','Whip']];
const T_PATTERN=[['','Plain hide'],['stripes','Stripes'],['spots','Spots'],['plates','Armored plates'],['scales','Scales']];
const T_EXTRA=[['','Nothing'],['collar','Spiked collar'],['chains','Broken chains'],['saddle','War saddle'],['fangs','Great fangs']];
const T_BEASTS=[['quad','Four-legged'],['serpent','Serpent'],['bird','Bird'],['biped','Brute (two legs)'],['blob','Ooze'],['spider','Many-legged']];
const T_TAILS=[['none','No tail'],['long','Long'],['bushy','Bushy'],['spiked','Spiked'],['tuft','Tufted']];
const TOKEN_DEF={
  soldier:{kind:'human',body:'armor',helm:'galea',shield:'scutum',weapon:'gladius',c1:'#a3281f',c2:'#d6ab4c',cape:true},
  hero:{kind:'human',body:'tunic',helm:'crested',shield:'parma',weapon:'gladius',c1:'#3f8f3a',c2:'#d6ab4c',stance:'hunched'},
  slave:{kind:'human',body:'bare',helm:'none',shield:'net',weapon:'trident',c1:'#c9a03a',c2:'#7a5a2a'},
  royalty:{kind:'human',body:'scale',helm:'murmillo',shield:'parma',weapon:'gladius',c1:'#3a5fb0',c2:'#e8c86a',cape:true},
  amazonia:{kind:'human',body:'tunic',helm:'none',shield:'buckler',weapon:'axe',c1:'#b04a3a',c2:'#e0c080',hair:'long'},
  damnatio:{kind:'human',body:'rags',helm:'hood',shield:'none',weapon:'sling',c1:'#6a5a4a',c2:'#3a2a1a'},
  veteranus:{kind:'human',body:'armor',helm:'thraex',shield:'round',weapon:'spear',c1:'#8a9098',c2:'#c9a458'},
  venatore:{kind:'human',body:'tunic',helm:'hood',shield:'none',weapon:'spear',c1:'#6a3a8a',c2:'#c9a458'},
  snake:{kind:'beast',body:'serpent',c1:'#5f8a3a',c2:'#d8c88a',size:0.7,tail:'none'},
  wolf:{kind:'beast',body:'quad',c1:'#6f6a62',c2:'#c8c0b0',size:0.8,tail:'bushy'},
  bear:{kind:'beast',body:'quad',c1:'#6a4424',c2:'#8a6440',size:1.05,tail:'none',bulk:1},
  lion:{kind:'beast',body:'quad',c1:'#c9a050',c2:'#8a5a20',size:1.0,tail:'tuft',mane:true},
  tholo:{kind:'human',body:'bare',helm:'none',hair:'bald',eyeT:'cyclops',beard:'full',hairC:'#4a2a1a',weapon:'greatclub',shield:'none',skin:'#c47a52',c1:'#6a3a22',c2:'#c9a458',legs:'wraps',neck:'torc',scale:1.22,stance:'hunched',base:'#3a2418'},
  commodus:{kind:'human',body:'armor',helm:'crested',shield:'parma',weapon:'gladius',c1:'#c9a03a',c2:'#8a1c1c',cape:true},
  zora:{kind:'beast',body:'bird',c1:'#c9962a',c2:'#f0cf7d',size:0.7,tail:'none'}};
let TOKEN_OVR={};try{TOKEN_OVR=JSON.parse(localStorage.getItem('flavius_tokens')||'{}')||{}}catch(e){}
function saveTokenOvr(){try{localStorage.setItem('flavius_tokens',JSON.stringify(TOKEN_OVR))}catch(e){}}
const tkDark=(h,f=-0.35)=>shade(h,f);

/* ---------- the drawing ---------- */
function figureSVG(sp,opts={}){
  sp={...sp};const c1=sp.c1||'#a3281f',c2=sp.c2||'#d6ab4c',base=sp.baseT==='obsidian'?'#161412':(sp.base||'#3a2e24'),skin=sp.skin||'#e0ac7e';
  let g='';
  const baseSVG=`<ellipse cx="50" cy="160" rx="31" ry="9" fill="${tkDark(base,-0.3)}"/><ellipse cx="50" cy="157" rx="31" ry="9" fill="${base}" stroke="${opts.ring||(sp.baseT==='obsidian'?'#e6b93a':tkDark(base,-0.5))}" stroke-width="${opts.ring?2.6:sp.baseT==='obsidian'?1.6:1}"/><ellipse cx="50" cy="156" rx="24" ry="5.5" fill="${shade(base,0.12)}" opacity=".6"/>`;
  if(sp.kind!=='beast'){
    /* v0.32 BATTLE STATES: sp.sev lists lost limbs ('rarm','larm','rleg','lleg'). The figure loses them
       one by one; with both legs gone it sits on the sand, a crawler. Red stumps only when gore is on. */
    const sev=sp.sev||{};const legless=sev.rleg&&sev.lleg;const gore=typeof SETTINGS==='undefined'||SETTINGS.gore!==false;
    const dy=(sp.stance==='hunched'?8:0)+(legless?26:0);const skinD=tkDark(skin,-0.25);
    const stump=(x,y,w2)=>`<rect x="${x}" y="${y}" width="${w2}" height="6" rx="2.4" fill="${skin}" stroke="${skinD}"/>${gore?`<ellipse cx="${x+w2/2}" cy="${y+6}" rx="${w2/2}" ry="2.4" fill="#8a1c14"/>`:''}`;
    if(sp.cape)g+=`<path d="M34 ${80+dy}Q26 ${120+dy} 30 152L70 152Q74 ${120+dy} 66 ${80+dy}Z" fill="${sp.capeC==='gold'?'#d9a82a':tkDark(c1,-0.25)}"${sp.capeC==='gold'?' stroke="#8a6414"':''}/>`;
    // legs
    const leg=sp.body==='armor'||sp.body==='scale'?c2:skin;
    if(legless){g+=gore?`<ellipse cx="50" cy="150" rx="17" ry="5" fill="#7a1810" opacity=".85"/>`:'';g+=stump(40,138+dy-26,9)+stump(52,138+dy-26,9)}
    else g+=`<rect x="39" y="${120}" width="8" height="33" rx="3" fill="${sp.body==='robe'?c1:leg}" stroke="${tkDark(leg)}" stroke-width=".8" ${sev.lleg?'display="none"':''}/><rect x="53" y="120" width="8" height="33" rx="3" fill="${sp.body==='robe'?c1:leg}" stroke="${tkDark(leg)}" stroke-width=".8" ${sev.rleg?'display="none"':''}/>${sev.lleg?stump(38,122,10):''}${sev.rleg?stump(52,122,10):''}`;
    if(!legless)g+=`${sev.lleg?'':'<rect x="37" y="148" width="11" height="6" rx="2" fill="#4a3220"/>'}${sev.rleg?'':'<rect x="52" y="148" width="11" height="6" rx="2" fill="#4a3220"/>'}`;
    // torso
    const tor={tunic:`<path d="M33 ${84+dy}Q50 ${78+dy} 67 ${84+dy}L66 128L34 128Z" fill="${c1}" stroke="${tkDark(c1)}"/>`,
      armor:`<path d="M33 ${84+dy}Q50 ${78+dy} 67 ${84+dy}L65 122L35 122Z" fill="#b9c1c9" stroke="#5d656d"/><path d="M38 ${96+dy}h24M37 ${104+dy}h26M36 ${112+dy}h28" stroke="#6d757d" stroke-width="1.2"/><path d="M35 122L65 122L63 132L37 132Z" fill="${c1}"/>`,
      scale:`<path d="M33 ${84+dy}Q50 ${78+dy} 67 ${84+dy}L65 124L35 124Z" fill="${c2}" stroke="${tkDark(c2)}"/>${[0,1,2,3,4].map(r=>[0,1,2,3].map(c=>`<path d="M${38+c*6+(r%2)*3} ${90+dy+r*7}q3 4 6 0" fill="none" stroke="${tkDark(c2,-0.45)}" stroke-width=".9"/>`).join('')).join('')}<path d="M35 124L65 124L63 132L37 132Z" fill="${c1}"/>`,
      bare:`<path d="M34 ${84+dy}Q50 ${79+dy} 66 ${84+dy}L64 122L36 122Z" fill="${skin}" stroke="${skinD}"/><path d="M42 ${98+dy}q8 4 16 0M50 ${88+dy}v26" stroke="${skinD}" stroke-width="1" fill="none"/><path d="M35 120L65 120L64 132L36 132Z" fill="${c1}" stroke="${tkDark(c1)}"/>`,
      robe:`<path d="M33 ${84+dy}Q50 ${78+dy} 67 ${84+dy}L70 150L30 150Z" fill="${c1}" stroke="${tkDark(c1)}"/><path d="M50 ${84+dy}L50 150" stroke="${c2}" stroke-width="3"/>`,
      flavius:`<path d="M33 ${84+dy}Q50 ${76+dy} 67 ${84+dy}L65 124L35 124Z" fill="#e6b93a" stroke="#8a6414"/><path d="M40 ${94+dy}q10 6 20 0M40 ${104+dy}q10 6 20 0" stroke="#8a6414" stroke-width="1.2" fill="none"/><circle cx="50" cy="${96+dy}" r="3" fill="#5a2a82"/><path d="M35 124L65 124L63 134L37 134Z" fill="#5a2a82"/>`,
      rags:`<path d="M34 ${84+dy}Q50 ${79+dy} 66 ${84+dy}L66 124L61 130L56 124L50 131L44 124L39 130L34 124Z" fill="${c1}" stroke="${tkDark(c1)}"/>`}[sp.body||'tunic'];
    g+=tor;
    g+=`<path d="M34 ${118+(sp.body==='armor'?0:0)}h32" stroke="${c2}" stroke-width="3"/>`; // belt
    // arms
    g+=`${sev.larm?stump(30,88+dy,9):`<path d="M34 ${86+dy}Q24 ${100+dy} 26 ${114+dy}" stroke="${sp.body==='armor'?'#b9c1c9':skin}" stroke-width="7" stroke-linecap="round" fill="none"/>`}${sev.rarm?stump(61,88+dy,9):sp.raise?`<path d="M66 ${86+dy}Q78 ${76+dy} 78 ${60+dy}" stroke="${skin}" stroke-width="7" stroke-linecap="round" fill="none"/>`:`<path d="M66 ${86+dy}Q76 ${98+dy} 74 ${110+dy}" stroke="${skin}" stroke-width="7" stroke-linecap="round" fill="none"/>`}`; /* v0.41 sp.raise: the sword arm lifted to the sky */
    {const ar=sp.arms||'';if((ar==='manica'||ar==='both')&&!sp.raise)g+=`<path d="M66 ${86+dy}Q76 ${98+dy} 74 ${110+dy}" stroke="#b9c1c9" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M68 ${92+dy}l7 2M70 ${98+dy}l7 1M71 ${104+dy}l6 0" stroke="#5d656d" stroke-width="1"/>`;
     if(ar==='bracers')g+=`<path d="M25 ${108+dy}l4 6M73 ${104+dy}l3 6" stroke="#6a4424" stroke-width="5"/>`;
     if(ar==='pauldron'||ar==='both')g+=`<path d="M26 ${88+dy}Q30 ${78+dy} 40 ${82+dy}L38 ${92+dy}Q30 ${90+dy} 26 ${88+dy}Z" fill="#b9c1c9" stroke="#5d656d"/>`;
     const lg=sp.legs||'';if(lg==='greaves')g+=`<rect x="38.5" y="132" width="9" height="16" rx="3" fill="#c9a458" stroke="#6b4d17" stroke-width=".7"/><rect x="52.5" y="132" width="9" height="16" rx="3" fill="#c9a458" stroke="#6b4d17" stroke-width=".7"/>`;
     else if(lg==='wraps')g+=`<path d="M39 130l8 4M39 136l8 4M39 142l8 4M53 130l8 4M53 136l8 4M53 142l8 4" stroke="#e8dcc0" stroke-width="1.6"/>`;
     else if(lg==='boots')g+=`<rect x="38" y="136" width="10" height="17" rx="2" fill="#4a3220"/><rect x="52" y="136" width="10" height="17" rx="2" fill="#4a3220"/>`;
     const nk=sp.neck||'';if(nk==='torc')g+=`<path d="M43 ${80+dy}Q50 ${86+dy} 57 ${80+dy}" stroke="#e6b93a" stroke-width="2.6" fill="none"/>`;else if(nk==='chain')g+=`<path d="M43 ${81+dy}Q50 ${87+dy} 57 ${81+dy}" stroke="#8a9098" stroke-width="2" fill="none" stroke-dasharray="2 1.2"/><path d="M57 ${81+dy}q6 14 2 26" stroke="#8a9098" stroke-width="1.6" fill="none" stroke-dasharray="2 1.2"/>`;else if(nk==='beads')g+=`<path d="M43 ${81+dy}Q50 ${88+dy} 57 ${81+dy}" stroke="${c2}" stroke-width="2.4" fill="none" stroke-dasharray="1.6 1.6"/>`;else if(nk==='sash')g+=`<path d="M36 ${86+dy}L64 ${118}" stroke="${c2}" stroke-width="5" opacity=".95"/>`}
    // weapon (right hand at ~74,110) — gone with the arm that held it
    const wx=sp.raise?78:74,wy=(sp.raise?60:110)+dy;
    if(!sev.rarm&&String(sp.weapon||'').startsWith('cw_')&&typeof W!=='undefined'&&W[sp.weapon]&&W[sp.weapon].art&&typeof wpnArt==='function'){
      g+=`<g transform="translate(${wx-24} ${wy-62}) scale(0.62)">${wpnArt(W[sp.weapon].art)}</g>`;}
    else
    g+=(sev.rarm?{}:{none:'',
      gladius:`<path d="M${wx} ${wy}L${wx+4} ${wy-34}L${wx+7} ${wy-33}L${wx+3} ${wy}Z" fill="#d8dde2" stroke="#6d757d"/><rect x="${wx-4}" y="${wy-2}" width="11" height="3" fill="${c2}"/>`,
      sica:`<path d="M${wx+1} ${wy}Q${wx+14} ${wy-18} ${wx+4} ${wy-34}Q${wx+10} ${wy-16} ${wx-1} ${wy}Z" fill="#d8dde2" stroke="#6d757d"/>`,
      spear:`<path d="M${wx+1} ${wy+30}L${wx+1} ${wy-58}" stroke="#7a5230" stroke-width="2.6"/><path d="M${wx+1} ${wy-70}L${wx+5} ${wy-56}L${wx-3} ${wy-56}Z" fill="#c9d0d6" stroke="#6d757d"/>`,
      trident:`<path d="M${wx+1} ${wy+30}L${wx+1} ${wy-54}" stroke="#7a5230" stroke-width="2.4"/><path d="M${wx-7} ${wy-66}V${wy-54}H${wx+9}V${wy-66}M${wx+1} ${wy-70}V${wy-54}" stroke="#c9d0d6" stroke-width="2.4" fill="none"/>`,
      bow:`<path d="M${wx+6} ${wy-36}Q${wx+22} ${wy} ${wx+6} ${wy+30}" stroke="#7a5230" stroke-width="2.6" fill="none"/><path d="M${wx+6} ${wy-36}L${wx+6} ${wy+30}" stroke="#e8e0cc" stroke-width=".8"/>`,
      axe:`<path d="M${wx+1} ${wy+8}L${wx+1} ${wy-34}" stroke="#7a5230" stroke-width="3"/><path d="M${wx+1} ${wy-34}Q${wx+16} ${wy-38} ${wx+14} ${wy-20}Q${wx+8} ${wy-24} ${wx+1} ${wy-22}Z" fill="#c9d0d6" stroke="#6d757d"/>`,
      sling:`<path d="M${wx} ${wy}Q${wx+10} ${wy-18} ${wx+4} ${wy-34}" stroke="#8a6a3a" stroke-width="1.6" fill="none"/><path d="M${wx} ${wy}Q${wx+16} ${wy-14} ${wx+12} ${wy-30}" stroke="#8a6a3a" stroke-width="1.6" fill="none"/><path d="M${wx+2} ${wy-36}Q${wx+8} ${wy-40} ${wx+14} ${wy-32}Q${wx+8} ${wy-28} ${wx+2} ${wy-36}Z" fill="#6a4424" stroke="#3a2412" stroke-width=".8"/><circle cx="${wx+8}" cy="${wy-34}" r="2.6" fill="#b8b0a0"/>`,
      club:`<path d="M${wx} ${wy+4}L${wx+8} ${wy-30}" stroke="#6a4424" stroke-width="7" stroke-linecap="round"/><circle cx="${wx+9}" cy="${wy-32}" r="5" fill="#6a4424"/>`,
      greatclub:`<path d="M${wx-2} ${wy+10}L${wx+10} ${wy-42}" stroke="#7a4a24" stroke-width="7" stroke-linecap="round"/><path d="M${wx+4} ${wy-24}L${wx+16} ${wy-56}" stroke="#6a3e1c" stroke-width="13" stroke-linecap="round"/><path d="M${wx+8} ${wy-40}l5 2M${wx+11} ${wy-48}l5 2" stroke="#4a2a12" stroke-width="1.4"/>`,
      hammer:`<path d="M${wx+1} ${wy+8}L${wx+1} ${wy-34}" stroke="#7a5230" stroke-width="3"/><rect x="${wx-7}" y="${wy-42}" width="16" height="9" rx="1.5" fill="#9aa2aa" stroke="#5d656d"/>`,
      flail:`<path d="M${wx+1} ${wy+6}L${wx+1} ${wy-18}" stroke="#7a5230" stroke-width="3"/><path d="M${wx+1} ${wy-18}q6 -6 10 -14" stroke="#8a9098" stroke-width="1.4" fill="none" stroke-dasharray="2 1"/><circle cx="${wx+12}" cy="${wy-34}" r="5" fill="#9aa2aa" stroke="#5d656d"/>`,
      scythe:`<path d="M${wx+1} ${wy+30}L${wx+1} ${wy-52}" stroke="#7a5230" stroke-width="2.6"/><path d="M${wx+1} ${wy-52}Q${wx-18} ${wy-58} ${wx-24} ${wy-40}Q${wx-12} ${wy-50} ${wx+1} ${wy-46}Z" fill="#c9d0d6" stroke="#6d757d"/>`,
      mace:`<path d="M${wx+1} ${wy+6}L${wx+1} ${wy-28}" stroke="#7a5230" stroke-width="3"/><circle cx="${wx+1}" cy="${wy-32}" r="6" fill="#9aa2aa" stroke="#5d656d"/><path d="M${wx-7} ${wy-32}h16M${wx+1} ${wy-40}v16" stroke="#5d656d" stroke-width="1.6"/>`})[sev.rarm?'none':(sp.weapon||'none')]||'';
    // head
    const hy=62+dy;
    g+=`<rect x="46" y="${hy+8}" width="8" height="10" fill="${skin}"/><circle cx="50" cy="${hy}" r="11" fill="${skin}" stroke="${skinD}" stroke-width=".8"/>`;
    const hair=sp.hairC||'#3a2616';
    const bareHd=sp.helm==='none'||sp.helm==='laurel'||sp.helm==='crown'||!sp.helm;
    if(bareHd&&sp.hair==='bald')g+=`<path d="M41 ${hy-6}Q50 ${hy-12} 59 ${hy-6}" stroke="${shade(skin,0.15)}" stroke-width="2" fill="none" opacity=".7"/>`;
    else if(bareHd&&sp.hair==='topknot')g+=`<path d="M39 ${hy-2}Q40 ${hy-14} 50 ${hy-13}Q60 ${hy-14} 61 ${hy-2}Q56 ${hy-8} 50 ${hy-8}Q44 ${hy-8} 39 ${hy-2}Z" fill="${hair}"/><circle cx="50" cy="${hy-15}" r="4.5" fill="${hair}"/>`;
    else if(bareHd&&sp.hair==='crest')g+=`<path d="M46 ${hy-10}Q50 ${hy-22} 54 ${hy-10}Z" fill="${hair}"/><path d="M47 ${hy-11}L50 ${hy-24}L53 ${hy-11}Z" fill="${hair}"/>`;
    else if(bareHd&&sp.hair==='braid')g+=`<path d="M39 ${hy-2}Q40 ${hy-14} 50 ${hy-13}Q60 ${hy-14} 61 ${hy-2}Q56 ${hy-8} 50 ${hy-8}Q44 ${hy-8} 39 ${hy-2}Z" fill="${hair}"/><path d="M60 ${hy-2}q6 8 2 16q5 7 0 14" stroke="${hair}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    else if(bareHd){g+=sp.hair==='long'?`<path d="M38 ${hy}Q38 ${hy-14} 50 ${hy-13}Q62 ${hy-14} 62 ${hy}L63 ${hy+16}L58 ${hy+4}Q50 ${hy-6} 42 ${hy+4}L37 ${hy+16}Z" fill="${hair}"/>`:`<path d="M39 ${hy-2}Q40 ${hy-14} 50 ${hy-13}Q60 ${hy-14} 61 ${hy-2}Q56 ${hy-8} 50 ${hy-8}Q44 ${hy-8} 39 ${hy-2}Z" fill="${hair}"/>`}
    {const et=sp.eyeT||'two';
     if(et==='cyclops')g+=`<ellipse cx="50" cy="${hy}" rx="4.6" ry="3.8" fill="#f4efe0" stroke="#1a120c" stroke-width=".8"/><circle cx="50" cy="${hy}" r="2" fill="#7a2a12"/><circle cx="50" cy="${hy}" r="1" fill="#1a120c"/><path d="M44 ${hy-5}Q50 ${hy-8} 56 ${hy-5}" stroke="${tkDark(skin,-0.4)}" stroke-width="1.6" fill="none"/>`;
     else if(et==='patch')g+=`<circle cx="46" cy="${hy+1}" r="1.3" fill="#1a120c"/><ellipse cx="54" cy="${hy+1}" rx="3" ry="2.6" fill="#1a120c"/><path d="M39 ${hy-4}L61 ${hy+3}" stroke="#1a120c" stroke-width="1"/>`;
     else if(et==='glow')g+=`<circle cx="46" cy="${hy+1}" r="1.8" fill="#ffe36a"/><circle cx="54" cy="${hy+1}" r="1.8" fill="#ffe36a"/><circle cx="46" cy="${hy+1}" r="3.2" fill="#ffe36a" opacity=".3"/><circle cx="54" cy="${hy+1}" r="3.2" fill="#ffe36a" opacity=".3"/>`;
     else if(et!=='visor')g+=`<circle cx="46" cy="${hy+1}" r="1.3" fill="#1a120c"/><circle cx="54" cy="${hy+1}" r="1.3" fill="#1a120c"/>`;
     const face=sp.face||'';if(face==='warpaint')g+=`<path d="M42 ${hy+4}h5M53 ${hy+4}h5" stroke="${c1}" stroke-width="2"/>`;else if(face==='scar')g+=`<path d="M55 ${hy-5}L58 ${hy+6}" stroke="#a3281f" stroke-width="1.3"/>`;else if(face==='woad')g+=`<path d="M40 ${hy-3}Q50 ${hy-6} 60 ${hy-3}L60 ${hy+4}Q50 ${hy+1} 40 ${hy+4}Z" fill="#2f4f8a" opacity=".55"/>`;else if(face==='tattoo')g+=`<path d="M41 ${hy+5}q3 -3 6 0M53 ${hy+5}q3 -3 6 0" stroke="#2f4f6a" stroke-width="1" fill="none"/>`;
     const bd=sp.beard===true?'full':sp.beard||'';if(bd==='full')g+=`<path d="M40 ${hy+2}Q41 ${hy+15} 50 ${hy+16}Q59 ${hy+15} 60 ${hy+2}Q56 ${hy+9} 50 ${hy+9}Q44 ${hy+9} 40 ${hy+2}Z" fill="${hair}"/>`;else if(bd==='goatee')g+=`<path d="M47 ${hy+7}Q50 ${hy+14} 53 ${hy+7}Z" fill="${hair}"/>`;else if(bd==='stache')g+=`<path d="M45 ${hy+6}Q50 ${hy+3} 55 ${hy+6}" stroke="${hair}" stroke-width="1.8" fill="none"/>`;else if(bd==='stubble')g+=`<path d="M41 ${hy+3}Q42 ${hy+13} 50 ${hy+14}Q58 ${hy+13} 59 ${hy+3}" fill="${hair}" opacity=".3"/>`}
    const mt='#b9c1c9',md='#5d656d';
    g+={none:'',galea:`<path d="M38 ${hy+2}Q38 ${hy-14} 50 ${hy-14}Q62 ${hy-14} 62 ${hy+2}L59 ${hy+2}Q58 ${hy-6} 50 ${hy-6}Q42 ${hy-6} 41 ${hy+2}Z" fill="${mt}" stroke="${md}"/><path d="M39 ${hy+1}L40 ${hy+11}L44 ${hy+10}L43 ${hy+1}Z M61 ${hy+1}L60 ${hy+11}L56 ${hy+10}L57 ${hy+1}Z" fill="#9aa2aa" stroke="${md}"/>`,
      crested:`<path d="M40 ${hy-10}Q50 ${hy-30} 60 ${hy-10}Q50 ${hy-18} 40 ${hy-10}Z" fill="${c1}" stroke="${tkDark(c1)}"/><path d="M38 ${hy+2}Q38 ${hy-14} 50 ${hy-14}Q62 ${hy-14} 62 ${hy+2}L59 ${hy+2}Q58 ${hy-6} 50 ${hy-6}Q42 ${hy-6} 41 ${hy+2}Z" fill="${mt}" stroke="${md}"/>`,
      murmillo:`<path d="M37 ${hy+4}Q36 ${hy-16} 50 ${hy-16}Q64 ${hy-16} 63 ${hy+4}Z" fill="${mt}" stroke="${md}"/><path d="M31 ${hy+4}Q50 ${hy-2} 69 ${hy+4}L67 ${hy+7}Q50 ${hy+2} 33 ${hy+7}Z" fill="${c2}"/><rect x="42" y="${hy-6}" width="16" height="13" fill="${md}"/><path d="M45 ${hy-6}v13M50 ${hy-6}v13M55 ${hy-6}v13M42 ${hy}h16" stroke="#c9d0d6" stroke-width=".8"/><path d="M46 ${hy-16}Q50 ${hy-26} 54 ${hy-16}Z" fill="${c1}"/>`,
      thraex:`<path d="M37 ${hy+4}Q36 ${hy-16} 50 ${hy-16}Q64 ${hy-16} 63 ${hy+4}Z" fill="${mt}" stroke="${md}"/><rect x="42" y="${hy-5}" width="16" height="11" fill="${md}"/><path d="M50 ${hy-16}Q58 ${hy-30} 66 ${hy-22}Q58 ${hy-20} 52 ${hy-12}Z" fill="${c1}" stroke="${tkDark(c1)}"/>`,
      hood:`<path d="M36 ${hy+12}Q34 ${hy-16} 50 ${hy-16}Q66 ${hy-16} 64 ${hy+12}Q62 ${hy-4} 50 ${hy-6}Q38 ${hy-4} 36 ${hy+12}Z" fill="${tkDark(c1,-0.2)}"/>`,
      horned:`<path d="M38 ${hy+2}Q38 ${hy-14} 50 ${hy-14}Q62 ${hy-14} 62 ${hy+2}L59 ${hy+2}Q58 ${hy-6} 50 ${hy-6}Q42 ${hy-6} 41 ${hy+2}Z" fill="${mt}" stroke="${md}"/><path d="M40 ${hy-8}Q30 ${hy-12} 30 ${hy-24}Q34 ${hy-14} 43 ${hy-11}Z M60 ${hy-8}Q70 ${hy-12} 70 ${hy-24}Q66 ${hy-14} 57 ${hy-11}Z" fill="#e8dcc0" stroke="#8a7a5a"/>`,
      laurel:`<path d="M39 ${hy-6}Q50 ${hy-14} 61 ${hy-6}" stroke="#5f8a3a" stroke-width="3" fill="none" stroke-dasharray="3 1.5"/>`,
      crown:`<path d="M39 ${hy-7}L39 ${hy-16}L44 ${hy-11}L50 ${hy-18}L56 ${hy-11}L61 ${hy-16}L61 ${hy-7}Z" fill="#e8c86a" stroke="#8a5a1e"/>`}[sp.helm||'none'];
    // shield (left, drawn over the arm)
    const sx=26,sy=108+dy;const noL=sev.larm,noR=sev.rarm;
    g+=noL?'':{none:'',
      scutum:`<rect x="${sx-12}" y="${sy-26}" width="22" height="44" rx="4" fill="${c1}" stroke="${tkDark(c1,-0.5)}" stroke-width="1.4"/><circle cx="${sx-1}" cy="${sy-4}" r="4" fill="${c2}"/><path d="M${sx-8} ${sy-20}h14M${sx-8} ${sy+12}h14" stroke="${c2}" stroke-width="1.6"/>`,
      parma:`<rect x="${sx-11}" y="${sy-16}" width="20" height="24" rx="2" fill="${c1}" stroke="${tkDark(c1,-0.5)}" stroke-width="1.4"/><circle cx="${sx-1}" cy="${sy-4}" r="3.5" fill="${c2}"/>`,
      round:`<circle cx="${sx-1}" cy="${sy-4}" r="14" fill="${c1}" stroke="${tkDark(c1,-0.5)}" stroke-width="1.4"/><circle cx="${sx-1}" cy="${sy-4}" r="10" fill="none" stroke="${c2}" stroke-width="1.5"/><circle cx="${sx-1}" cy="${sy-4}" r="3.5" fill="${c2}"/>`,
      buckler:`<circle cx="${sx-1}" cy="${sy-2}" r="8" fill="${c2}" stroke="${tkDark(c2,-0.5)}" stroke-width="1.2"/><circle cx="${sx-1}" cy="${sy-2}" r="3" fill="${c1}"/>`,
      net:`<path d="M${sx-10} ${sy-10}Q${sx-16} ${sy+14} ${sx+2} ${sy+26}Q${sx+8} ${sy+6} ${sx+2} ${sy-10}Z" fill="rgba(220,210,180,.25)" stroke="#d8cca0" stroke-width="1"/><path d="M${sx-12} ${sy}l12 8M${sx-10} ${sy+10}l12 6M${sx-6} ${sy-8}l-2 30M${sx} ${sy-8}l-2 32" stroke="#d8cca0" stroke-width=".7"/>`}[sp.shield||'none'];
    {const em=sp.emblem||'';const ex=sx-1,ey=sy-4;if(em&&['scutum','parma','round'].includes(sp.shield)){g+={eagle:`<path d="M${ex} ${ey-5}l-7 -3l3 5l-5 1l6 2l-1 5l4 -3l4 3l-1 -5l6 -2l-5 -1l3 -5z" fill="${c2}"/>`,bolt:`<path d="M${ex+2} ${ey-8}L${ex-3} ${ey+1}L${ex+1} ${ey+1}L${ex-2} ${ey+9}L${ex+4} ${ey-1}L${ex} ${ey-1}Z" fill="${c2}"/>`,star:`<path d="M${ex} ${ey-7}l2 5h5l-4 3l2 5l-5 -3l-5 3l2 -5l-4 -3h5z" fill="${c2}"/>`,sun:`<circle cx="${ex}" cy="${ey}" r="3.5" fill="${c2}"/><path d="M${ex} ${ey-8}v3M${ex} ${ey+5}v3M${ex-8} ${ey}h3M${ex+5} ${ey}h3" stroke="${c2}" stroke-width="1.4"/>`,wolf:`<path d="M${ex-5} ${ey-4}l2 -4l2 3h2l2 -3l2 4l-1 6l-4 3l-4 -3z" fill="${c2}"/>`,boss:`<circle cx="${ex}" cy="${ey}" r="5" fill="#c9a458" stroke="#6b4d17"/>`}[em]||''}
     const oh=sp.off||'';if(oh&&(sp.shield==='none'||!sp.shield||sp.shield==='buckler')){g+={dagger:`<path d="M${sx} ${sy+2}L${sx-2} ${sy-16}L${sx+1} ${sy-16}Z" fill="#d8dde2" stroke="#6d757d" stroke-width=".6"/><rect x="${sx-4}" y="${sy+1}" width="7" height="2" fill="${c2}"/>`,torch:`<path d="M${sx} ${sy+6}L${sx-2} ${sy-14}" stroke="#6a4424" stroke-width="3"/><path d="M${sx-2} ${sy-14}q-5 -8 1 -14q2 6 5 3q2 7 -6 11z" fill="#f0843a"/><path d="M${sx-2} ${sy-16}q-2 -4 1 -7q1 4 2 3q0 4 -3 4z" fill="#ffe36a"/>`,whip:`<path d="M${sx} ${sy}q-14 10 -8 26q6 10 18 6" stroke="#5a3a1e" stroke-width="1.6" fill="none"/>`}[oh]||''}}
  }else{
    const b=sp.body||'quad';const eye=sp.eyes||'#f0cf7d';const dc=tkDark(c1);
    if(b==='quad'){const bk=sp.bulk?1.15:1;
      if(sp.wings)g+=`<path d="M44 108L20 70L38 88L34 64L52 96Z" fill="${c2}" stroke="${tkDark(c2)}" opacity=".95"/>`;
      g+=`<rect x="31" y="118" width="8" height="34" rx="3" fill="${dc}"/><rect x="58" y="118" width="8" height="34" rx="3" fill="${dc}"/>`;
      g+={none:'',long:`<path d="M24 112Q10 118 12 140" stroke="${c1}" stroke-width="4" fill="none" stroke-linecap="round"/>`,bushy:`<path d="M26 110Q8 112 10 136Q20 126 28 118Z" fill="${c1}" stroke="${dc}"/><path d="M12 132q4 -6 6 -12" stroke="${c2}" stroke-width="2"/>`,spiked:`<path d="M24 112Q10 118 12 140" stroke="${c1}" stroke-width="4" fill="none"/><path d="M14 124l-6 -2M13 132l-6 2M18 116l-4 -5" stroke="${c2}" stroke-width="2.4"/>`,tuft:`<path d="M24 112Q12 118 14 138" stroke="${c1}" stroke-width="3" fill="none"/><circle cx="14" cy="140" r="4" fill="${c2}"/>`}[sp.tail||'none'];
      g+=`<ellipse cx="48" cy="${112}" rx="${26*bk}" ry="${15*bk}" fill="${c1}" stroke="${dc}" stroke-width="1.2"/><ellipse cx="48" cy="118" rx="${18*bk}" ry="6" fill="${c2}" opacity=".35"/>`;
      g+=`<rect x="38" y="120" width="8" height="33" rx="3" fill="${c1}" stroke="${dc}" stroke-width=".8"/><rect x="63" y="118" width="8" height="35" rx="3" fill="${c1}" stroke="${dc}" stroke-width=".8"/>`;
      if(sp.mane)g+=`<circle cx="74" cy="98" r="17" fill="${c2}" stroke="${tkDark(c2)}"/>`;
      g+=`<circle cx="74" cy="98" r="11.5" fill="${c1}" stroke="${dc}"/><path d="M80 100Q92 102 88 108Q82 110 78 106Z" fill="${shade(c1,0.12)}" stroke="${dc}"/><circle cx="87" cy="103" r="1.6" fill="#1a120c"/><circle cx="76" cy="95" r="2" fill="${eye}" stroke="#1a120c" stroke-width=".6"/><path d="M68 88l-2 -7l6 4M77 87l2 -7l3 7" fill="${c1}" stroke="${dc}"/>`;
      if(sp.horns)g+=`<path d="M70 88Q62 72 70 66Q68 76 74 86Z M80 88Q88 74 84 66Q84 78 78 86Z" fill="#e8dcc0" stroke="#8a7a5a"/>`;
      if(sp.spikes)g+=`<path d="M30 100l4 -10l4 8l4 -11l4 10l4 -11l4 10l4 -9l4 10" fill="none" stroke="${c2}" stroke-width="2.4"/>`;
      {const pt=sp.pattern||'';const bk2=sp.bulk?1.15:1;if(pt==='stripes')g+=[34,42,50,58].map(x=>`<path d="M${x} ${100}q2 12 0 24" stroke="${c2}" stroke-width="2.6" fill="none" opacity=".8"/>`).join('');else if(pt==='spots')g+=[[36,106],[46,102],[56,108],[42,116],[60,116],[30,114]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="${c2}" opacity=".85"/>`).join('');else if(pt==='plates')g+=`<path d="M28 106Q48 88 70 106" stroke="#8a9098" stroke-width="6" fill="none"/><path d="M34 100l0 8M44 96l0 8M54 96l0 8M64 100l0 8" stroke="#5d656d" stroke-width="1.2"/>`;else if(pt==='scales')g+=[0,1,2].map(r=>[0,1,2,3,4].map(c=>`<path d="M${30+c*8+(r%2)*4} ${102+r*6}q4 5 8 0" fill="none" stroke="${c2}" stroke-width="1"/>`).join('')).join('');
       const xt=sp.extra||'';if(xt==='collar')g+=`<path d="M66 106Q74 112 82 104" stroke="#3a2a1a" stroke-width="4" fill="none"/><path d="M68 108l-1 4M74 110l0 4M80 106l1 4" stroke="#c9d0d6" stroke-width="1.6"/>`;else if(xt==='chains')g+=`<path d="M40 122q-2 10 -8 16M60 122q4 10 10 14" stroke="#8a9098" stroke-width="2" stroke-dasharray="2.4 1.4" fill="none"/>`;else if(xt==='saddle')g+=`<path d="M36 100Q48 92 60 100L58 108Q48 104 38 108Z" fill="#8a1c1c" stroke="#4a0c0c"/><path d="M48 102v10" stroke="#e6b93a" stroke-width="1.6"/>`;else if(xt==='fangs')g+=`<path d="M82 106l1 6l2 -6M86 106l1 5l1 -5" fill="#f4efe0" stroke="#8a7a5a" stroke-width=".4"/>`;
       if(sp.eyeT==='cyclops')g+=`<circle cx="77" cy="94" r="3.4" fill="#f4efe0" stroke="#1a120c" stroke-width=".6"/><circle cx="77" cy="94" r="1.6" fill="#7a2a12"/>`}
    }else if(b==='serpent'){
      g+=`<path d="M22 146Q18 128 40 128Q66 128 64 142Q60 154 40 150Q28 146 34 138Q42 132 56 136" fill="none" stroke="${dc}" stroke-width="14" stroke-linecap="round"/><path d="M22 146Q18 128 40 128Q66 128 64 142Q60 154 40 150Q28 146 34 138Q42 132 56 136" fill="none" stroke="${c1}" stroke-width="11" stroke-linecap="round"/><path d="M56 136Q66 120 58 100Q54 88 64 80" fill="none" stroke="${c1}" stroke-width="9" stroke-linecap="round"/><path d="M58 104q4 -2 4 -8M60 118q4 -2 3 -8" stroke="${c2}" stroke-width="2.4" fill="none"/>`;
      g+=`<ellipse cx="68" cy="76" rx="9" ry="6.5" fill="${c1}" stroke="${dc}" transform="rotate(-20 68 76)"/><circle cx="70" cy="73" r="1.8" fill="${eye}" stroke="#1a120c" stroke-width=".6"/><path d="M76 78l6 1l-5 2l5 2l-6 0" stroke="#c0392b" stroke-width="1.1" fill="none"/>`;
      if(sp.horns)g+=`<path d="M64 70Q60 60 66 58Q64 64 68 70Z" fill="#e8dcc0"/>`;
      if(sp.wings)g+=`<path d="M56 108L30 84L44 100L36 78L60 102Z" fill="${c2}" opacity=".9"/>`;
    }else if(b==='bird'){
      g+=`<path d="M50 104L12 76L30 104L14 110L48 116Z" fill="${c2}" stroke="${tkDark(c2)}"/><path d="M50 104L88 76L70 104L86 110L52 116Z" fill="${c2}" stroke="${tkDark(c2)}"/><ellipse cx="50" cy="112" rx="13" ry="18" fill="${c1}" stroke="${dc}"/><circle cx="50" cy="90" r="9" fill="${c1}" stroke="${dc}"/><path d="M50 92L58 96L50 99Z" fill="#e8b23a"/><circle cx="53" cy="88" r="1.6" fill="${eye}"/><path d="M44 128l-3 22M56 128l3 22" stroke="#e8b23a" stroke-width="2.4"/>`;
    }else if(b==='biped'){
      if(sp.wings)g+=`<path d="M40 90L12 60L24 92L10 96L40 104Z M60 90L88 60L76 92L90 96L60 104Z" fill="${c2}" stroke="${tkDark(c2)}"/>`;
      g+=`<rect x="36" y="118" width="11" height="35" rx="4" fill="${dc}"/><rect x="53" y="118" width="11" height="35" rx="4" fill="${dc}"/><path d="M28 84Q50 72 72 84L68 124L32 124Z" fill="${c1}" stroke="${dc}" stroke-width="1.2"/><path d="M28 86Q16 104 20 122M72 86Q84 100 80 116" stroke="${c1}" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M80 116L86 80" stroke="#6a4424" stroke-width="7" stroke-linecap="round"/><circle cx="87" cy="78" r="6" fill="#6a4424"/>`;
      g+=`<circle cx="50" cy="66" r="14" fill="${c1}" stroke="${dc}"/><circle cx="45" cy="64" r="2.4" fill="${eye}" stroke="#1a120c" stroke-width=".6"/><circle cx="55" cy="64" r="2.4" fill="${eye}" stroke="#1a120c" stroke-width=".6"/><path d="M43 72Q50 78 57 72" stroke="#1a120c" stroke-width="1.6" fill="none"/><path d="M42 72l2 4l2 -4l2 4l2 -4l2 4l2 -4l2 4" stroke="#f0ece0" stroke-width="1" fill="none"/>`;
      if(sp.horns)g+=`<path d="M40 58Q30 48 34 38Q36 50 44 55Z M60 58Q70 48 66 38Q64 50 56 55Z" fill="#e8dcc0" stroke="#8a7a5a"/>`;
      if(sp.mane)g+=`<path d="M36 62Q34 48 50 48Q66 48 64 62Q60 54 50 54Q40 54 36 62Z" fill="${c2}"/>`;
    }else if(b==='blob'){
      g+=`<path d="M22 152Q16 118 34 104Q48 86 62 100Q84 112 78 152Z" fill="${c1}" stroke="${dc}" stroke-width="1.4" opacity=".92"/><ellipse cx="42" cy="112" rx="6" ry="4" fill="#fff" opacity=".35"/><circle cx="44" cy="124" r="3" fill="${eye}"/><circle cx="58" cy="122" r="3" fill="${eye}"/><path d="M44 138Q52 144 60 138" stroke="${dc}" stroke-width="2" fill="none"/>`;
      if(sp.spikes)g+=`<path d="M30 110l-6 -6M50 94l0 -8M68 104l6 -6" stroke="${c2}" stroke-width="3"/>`;
    }else if(b==='spider'){
      g+=[-1,1].map(s=>[0,1,2,3].map(i=>`<path d="M50 118Q${50+s*(22+i*4)} ${100+i*6} ${50+s*(30+i*3)} ${150-i*2}" stroke="${dc}" stroke-width="3" fill="none"/>`).join('')).join('');
      g+=`<ellipse cx="50" cy="112" rx="16" ry="13" fill="${c1}" stroke="${dc}"/><circle cx="50" cy="126" r="9" fill="${c1}" stroke="${dc}"/><circle cx="46" cy="124" r="1.6" fill="${eye}"/><circle cx="54" cy="124" r="1.6" fill="${eye}"/><circle cx="48" cy="128" r="1.2" fill="${eye}"/><circle cx="52" cy="128" r="1.2" fill="${eye}"/><path d="M42 104h16M44 110h12" stroke="${c2}" stroke-width="2"/>`;
    }
  }
  /* v0.36 BAKED DETAILS AS THE OUTER LAYER: sculpted shapes ride with the body — they drop when the legs are gone,
     vanish with the limb they sit on, and as limbs are lost the outermost (newest) details are stripped first:
     a figure's extra armor degrades before the body does. */
  const nBaked=(sp.baked||[]).length;const allL=[...(sp.baked||[]),...(sp.layers||[])];
  const sevL=sp.kind!=='beast'?(sp.sev||{}):{};const nSev=['rarm','larm','rleg','lleg'].filter(k=>sevL[k]).length;
  const dyL=sevL.rleg&&sevL.lleg?26:0;
  const onLost=L=>{const x=L.x??50,y=L.y??80;const arm=y>=78&&y<=138,leg=y>138;
    return (sevL.larm&&arm&&x<37)||(sevL.rarm&&arm&&x>63)||(sevL.lleg&&leg&&x<50)||(sevL.rleg&&leg&&x>=50)};
  const strip=nSev?Math.floor(allL.length*Math.min(1,nSev*0.25)):0;
  const liveT=typeof SCB!=='undefined'&&opts.selLayer!=null; /* v0.45: ✂ cut layers carve the figure beneath them */
  const items=allL.map((L,i)=>{const rel=i-nBaked;
      if(nSev&&(onLost(L)||i>=allL.length-strip))return null; // stripped: on a lost limb, or among the outermost details
      return {L,sel:rel>=0&&opts.selLayer===rel,live:liveT&&rel>=0,tf:dyL&&(L.y??80)<=138?`translate(0 ${dyL})`:null}}).filter(Boolean);
  g=typeof scbStack==='function'?scbStack(g,items):g+items.map(it=>shapeSVG(it.L,it.sel)).join('');
  // v0.36: a headless state (Tholo's corpse): everything above the neck is gone
  if(sp.headless&&sp.kind!=='beast'){const dyH=(sp.stance==='hunched'?8:0)+dyL;const cid='hl'+Math.random().toString(36).slice(2,8);
    const goreH=typeof SETTINGS==='undefined'||SETTINGS.gore!==false;
    g=`<clipPath id="${cid}"><rect x="0" y="${76+dyH}" width="100" height="100"/></clipPath><g clip-path="url(#${cid})">${g}</g>${goreH?`<ellipse cx="50" cy="${77+dyH}" rx="9" ry="3.4" fill="#8a1c14"/><ellipse cx="50" cy="${76.5+dyH}" rx="5" ry="1.8" fill="#5a0c08"/>`:''}`}
  const sz=sp.kind==='beast'?(sp.size||1):(sp.scale||1);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 170" width="${opts.w||100}" height="${opts.h||170}">${baseSVG}<g transform="translate(50 157) scale(${sz} ${sz*(sp.squash||1)}) translate(-50 -157)">${g}</g></svg>`;
}
/* v0.24 SHAPES: free layers on top of any token — add, drag, resize, rotate, recolor, then commit (bake) */
const SHAPES=[['circle','● Circle'],['ellipse','⬭ Oval'],['rect','■ Box'],['tri','▲ Triangle'],['diamond','◆ Diamond'],['star','★ Star'],['crescent','☾ Crescent'],['line','╱ Bar'],['spike','➤ Spike'],['ring','◯ Ring']];
function shapeSVG(L,sel){if(L&&L.hid)return ''; /* v0.42: a hidden layer */const w=L.w||12,h=L.h||12,c=L.c||'#e6b93a',o=L.o??1;const st=L.st?` stroke="${L.st}" stroke-width="1"`:'';let el;
  switch(L.t){case 'circle':el=`<circle cx="0" cy="0" r="${w/2}" fill="${c}"${st}/>`;break;case 'ellipse':el=`<ellipse cx="0" cy="0" rx="${w/2}" ry="${h/2}" fill="${c}"${st}/>`;break;
    case 'rect':el=`<rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="${Math.min(w,h)*0.12}" fill="${c}"${st}/>`;break;case 'tri':el=`<path d="M0 ${-h/2}L${w/2} ${h/2}L${-w/2} ${h/2}Z" fill="${c}"${st}/>`;break;
    case 'diamond':el=`<path d="M0 ${-h/2}L${w/2} 0L0 ${h/2}L${-w/2} 0Z" fill="${c}"${st}/>`;break;case 'star':{let d='';for(let i=0;i<10;i++){const r=i%2?w*0.22:w/2,a=-Math.PI/2+i*Math.PI/5;d+=(i?'L':'M')+(Math.cos(a)*r).toFixed(2)+' '+(Math.sin(a)*r*(h/w)).toFixed(2)}el=`<path d="${d}Z" fill="${c}"${st}/>`;break}
    case 'crescent':el=`<path d="M${w*0.1} ${-h/2}A${w/2} ${h/2} 0 1 0 ${w*0.1} ${h/2}A${w*0.36} ${h*0.4} 0 1 1 ${w*0.1} ${-h/2}Z" fill="${c}"${st}/>`;break;
    case 'line':el=`<rect x="${-w/2}" y="${-Math.max(1,h/8)}" width="${w}" height="${Math.max(2,h/4)}" rx="1" fill="${c}"${st}/>`;break;case 'spike':el=`<path d="M${-w/2} ${-h/4}L${w/2} 0L${-w/2} ${h/4}Z" fill="${c}"${st}/>`;break;
    case 'ring':el=`<ellipse cx="0" cy="0" rx="${w/2}" ry="${h/2}" fill="none" stroke="${c}" stroke-width="${Math.max(1.2,w/8)}"/>`;break;default:el=''}
  return `<g transform="translate(${L.x||50} ${L.y||100}) rotate(${L.r||0})" opacity="${o}">${el}${sel?`<rect x="${-w/2-2}" y="${-h/2-2}" width="${w+4}" height="${h+4}" fill="none" stroke="#6fd0ff" stroke-width=".8" stroke-dasharray="2 1.5"/>`:''}</g>`}
const TOKEN_IMG={};
function tokenImg(sp){if(HEADLESS||!sp)return null;const key=JSON.stringify(sp);let im=TOKEN_IMG[key];if(!im){im=new Image();im.onload=()=>{try{draw()}catch(e){}};im.src='data:image/svg+xml,'+encodeURIComponent(figureSVG(sp));TOKEN_IMG[key]=im}return im.complete&&im.naturalWidth?im:null}
const tokenStyle=()=>typeof SETTINGS==='undefined'?'figure':(SETTINGS.tokenStyle||'figure'); // v0.25: figures by default; standees and cylinders one click away in Settings → Tokens

/* which figure a player or beast wears */
const libTok=id=>id&&typeof CUSTOM!=='undefined'&&CUSTOM.tokens?(CUSTOM.tokens.find(t=>t.id===id)||{}).spec:null;
/* v0.28 BEAST KINDS: a menagerie of ready-made animals for the Creator Studio — each with its own figure and
   typical stats. All of them fit on one arena tile (an elephant would need new rules, so the editor keeps them out). */
const L_=(t,x,y,w,h,c,r=0,o=1)=>({t,x,y,w,h,c,r,o});
const BEAST_KINDS={
  crocodile:{n:'Crocodile',st:{hp:12,ap:3,rng:1,mv:1,coin:8,cf:5,beh:'zone'},tok:{kind:'beast',body:'quad',squash:0.62,c1:'#4a6a2a',c2:'#b8c07a',size:0.95,tail:'long',spikes:true,eyes:'#e0d040',baked:[L_('ellipse',88,103,24,9,'#4a6a2a',4),L_('line',90,106,18,5,'#e8e0c8',4),L_('ellipse',48,122,40,8,'#3a5420')]}},
  boar:{n:'Calydonian Boar',st:{hp:15,ap:4,rng:1,mv:3,coin:10,cf:6,beh:'hunt'},tok:{kind:'beast',body:'quad',c1:'#4a3424',c2:'#8a6a4a',size:1.05,tail:'none',bulk:1,spikes:true,eyes:'#e04a2a',baked:[L_('circle',88,104,9,9,'#8a5a4a'),L_('crescent',84,112,8,12,'#f0e8d0',-60),L_('crescent',92,111,8,12,'#f0e8d0',-40)]}},
  eagle:{n:'Golden Eagle',st:{hp:6,ap:2,rng:1,mv:4,coin:6,cf:6,beh:'cf',fly:true},tok:{kind:'beast',body:'bird',c1:'#6a4a1a',c2:'#d6ab4c',size:0.8,eyes:'#f0cf7d'}},
  liger:{n:'Liger',st:{hp:17,ap:5,rng:1,mv:3,coin:12,cf:8,beh:'hunt'},tok:{kind:'beast',body:'quad',c1:'#d8a050',c2:'#b07030',size:1.12,tail:'tuft',mane:true,pattern:'stripes',bulk:1}},
  lion:{n:'Lion',st:{hp:14,ap:5,rng:1,mv:3,coin:10,cf:7,beh:'hunt'},tok:{kind:'beast',body:'quad',c1:'#c9a050',c2:'#8a5a20',size:1.0,tail:'tuft',mane:true}},
  tiger:{n:'Tiger',st:{hp:13,ap:4,rng:1,mv:3,coin:10,cf:7,beh:'hunt'},tok:{kind:'beast',body:'quad',c1:'#e08a2a',c2:'#2a1a10',size:1.05,tail:'long',pattern:'stripes'}},
  leopard:{n:'Leopard',st:{hp:9,ap:3,rng:1,mv:4,coin:7,cf:5,beh:'hunt'},tok:{kind:'beast',body:'quad',c1:'#d8b060',c2:'#3a2a1a',size:0.9,tail:'long',pattern:'spots'}},
  panther:{n:'Black Panther',st:{hp:10,ap:3,rng:1,mv:4,coin:8,cf:6,beh:'cf'},tok:{kind:'beast',body:'quad',c1:'#1f1f24',c2:'#3a3a48',size:0.92,tail:'long',eyes:'#9bd070'}},
  bear:{n:'Bear',st:{hp:14,ap:4,rng:1,mv:2,coin:9,cf:5,beh:'zone'},tok:{kind:'beast',body:'quad',c1:'#6a4424',c2:'#8a6440',size:1.05,tail:'none',bulk:1}},
  wolf:{n:'Wolf',st:{hp:8,ap:3,rng:1,mv:3,coin:6,cf:4,beh:'hunt'},tok:{kind:'beast',body:'quad',c1:'#6f6a62',c2:'#c8c0b0',size:0.8,tail:'bushy'}},
  hyena:{n:'Hyena',st:{hp:8,ap:2,rng:1,mv:3,coin:5,cf:4,beh:'hunt'},tok:{kind:'beast',body:'quad',c1:'#9a8a60',c2:'#4a3a24',size:0.85,tail:'bushy',pattern:'spots'}},
  aurochs:{n:'Aurochs (wild bull)',st:{hp:16,ap:4,rng:1,mv:2,coin:10,cf:6,beh:'zone'},tok:{kind:'beast',body:'quad',c1:'#3a2a20',c2:'#6a5040',size:1.12,tail:'long',horns:true,bulk:1}},
  stag:{n:'Stag',st:{hp:9,ap:3,rng:1,mv:3,coin:6,cf:4,beh:'zone'},tok:{kind:'beast',body:'quad',c1:'#8a5a30',c2:'#d8c0a0',size:0.95,tail:'none',horns:true,baked:[L_('line',70,72,18,6,'#e8dcc0',-40),L_('line',82,72,18,6,'#e8dcc0',40)]}},
  ostrich:{n:'Ostrich',st:{hp:7,ap:2,rng:1,mv:5,coin:5,cf:5,beh:'cf'},tok:{kind:'beast',body:'bird',c1:'#2a2a2a',c2:'#e8e0d0',size:0.92,baked:[L_('line',50,90,4,30,'#d8a07a',90),L_('line',46,142,4,20,'#d8a07a',90),L_('line',54,142,4,20,'#d8a07a',90)]}},
  scorpion:{n:'Giant Scorpion',st:{hp:8,ap:3,rng:1,mv:2,coin:7,cf:5,beh:'zone'},tok:{kind:'beast',body:'spider',c1:'#6a3a1a',c2:'#c9a458',size:0.85,baked:[L_('crescent',50,92,14,26,'#6a3a1a',180),L_('tri',58,80,6,8,'#c9a458',40)]}},
  viper:{n:'Viper',st:{hp:5,ap:3,rng:1,mv:2,coin:5,cf:4,beh:'hunt'},tok:{kind:'beast',body:'serpent',c1:'#5f8a3a',c2:'#d8c88a',size:0.7,tail:'none'}}};
const kindKeyOf=n=>n&&n.kindKey&&BEAST_KINDS[n.kindKey]?n.kindKey:(()=>{const k=String(n&&n.kind||'').toLowerCase();return Object.keys(BEAST_KINDS).find(x=>k===BEAST_KINDS[x].n.toLowerCase())||null})();
// a Board token reference: a library token, a ready-made beast kind (k:), or a default figure (d:)
function refTok(ref){if(!ref)return null;if(String(ref).startsWith('k:'))return BEAST_KINDS[ref.slice(2)]?BEAST_KINDS[ref.slice(2)].tok:null;if(String(ref).startsWith('d:'))return TOKEN_DEF[ref.slice(2)]||null;return libTok(ref)}
const kindTok=n=>{const k=kindKeyOf(n);return k?BEAST_KINDS[k].tok:null};
const tokenOfChar=c=>refTok(c.tokenRef)||c.token||autoTokenForChar(c);const tokenOfNpc=n=>refTok(n.tokenRef)||n.token||(n.face&&typeof faceTok==='function'?faceTok(n):null)||kindTok(n)||autoTokenForNpc(n);
/* v0.31 ONE SPECTATOR, TWO FACES: every regular is generated once (their `look`) and rendered two ways —
   the minimal face-in-the-tiers for the stands, and this FULL FIGURE (same 100x170 language and scale as every
   gladiator token) for walking a city square. The Creator Studio's spectator maker shows both. */
function specFig(look,o={}){const lk=look||{};const robe=lk.robe||'#c9b27a';
  const hat=lk.hat||'';const helm=hat==='hood'||hat==='veil'?'hood':hat==='wreath'?'laurel':hat==='helm'?'galea':'none';
  const baked=[];
  if(hat==='straw')baked.push({t:'ellipse',x:50,y:60,w:38,h:9,c:'#c9a458',st:'#8a6a2a'},{t:'ellipse',x:50,y:56,w:16,h:8,c:'#d8b060'});
  if(hat==='pileus')baked.push({t:'tri',x:50,y:56,w:16,h:14,c:'#a86a2a',st:'#6a4424'});
  if(hat==='turban')baked.push({t:'ellipse',x:50,y:58,w:22,h:11,c:'#e8dcc0',st:'#a89a70'},{t:'circle',x:50,y:54,w:6,h:6,c:'#c0433a'});
  if(o.basket)baked.push({t:'ellipse',x:24,y:104,w:14,h:10,c:'#a87a3a',st:'#6a4a1e'},{t:'line',x:24,y:98,w:12,h:3,c:'#6a4a1e'});
  if(o.amphora)baked.push({t:'ellipse',x:76,y:106,w:10,h:16,c:'#b06a3a',st:'#6a3a1e'},{t:'line',x:76,y:96,w:6,h:3,c:'#6a3a1e'});
  if(o.sash)baked.push({t:'line',x:50,y:100,w:34,h:5,c:o.sash===true?'#e6b93a':o.sash,r:-28,o:0.95});
  return {kind:'human',body:o.body||(Math.abs(hashStr(String(lk.skin)+String(lk.robe)))%3?'robe':'tunic'),helm,hair:lk.long?'long':'',beard:lk.beard?(Math.abs(hashStr(String(lk.hair)))%2?'full':'short'):'',
    hairC:lk.hair||'#4a2c17',skin:lk.skin||'#e6cfa8',fem:!!lk.fem,c1:robe,c2:shade(robe,0.35),weapon:'none',shield:'none',scale:o.scale||0.94,baked}}
function tokenForCls(cls){const C=CLASSES[cls];if(C&&C.custom){const c=(typeof CUSTOM!=='undefined'?CUSTOM.chars:[]).find(x=>'cc_'+x.id===cls);if(c)return tokenOfChar(c)}
  const d=TOKEN_OVR[cls]||TOKEN_DEF[cls];if(!d)return {kind:'human',body:'tunic',helm:'galea',shield:'round',weapon:'gladius',c1:C?C.color:'#a3281f',c2:'#d6ab4c'};return d}
function tokenForNPC(n){const T=NPCT[n.t];if(T&&T.custom){const c=(typeof CUSTOM!=='undefined'?CUSTOM.npcs:[]).find(x=>x.id===T.cid);if(c)return tokenOfNpc(c)}return TOKEN_OVR['npc_'+n.t]||TOKEN_DEF[n.t]||{kind:'beast',body:'quad',c1:T?T.col:'#8a8a8a',c2:'#c8c0b0'}}
const hasCustomToken=cls=>{const C=CLASSES[cls];return !!(C&&C.custom)};
function autoTokenForChar(c){const p=c.portrait||{};const cwWeap=c.R&&String(c.R).startsWith('cw_')?c.R:null;const base=CLASSES[c.base]&&TOKEN_DEF[c.base]?{...TOKEN_DEF[c.base]}:{kind:'human',body:'tunic',helm:'galea',shield:'round',weapon:'gladius'};
  const wmap={gladius:'gladius',sica:'sica',hasta:'spear',trident:'trident',bow:'bow',axe:'axe',mace:'mace',falcata:'sica',rudis:'club',pugio:'gladius'};const w=wmap[c.R]||wmap[c.L];
  const hmap={none:'none',galea:'galea',crested:'crested',murmillo:'murmillo',hood:'hood',laurel:'laurel',horned:'horned',thraex:'thraex',diadem:'crown',provocator:'murmillo',pileus:'none',veil:'hood',pelt:'hood',circlet:'crown',band:'none',knot:'none'};
  return {...base,c1:c.color||base.c1,skin:p.skin||base.skin,hairC:p.hair,hair:p.long||p.fem?'long':'',helm:hmap[p.helm]||base.helm,weapon:cwWeap||w||base.weapon}}
function autoTokenForNpc(n){const k=String(n.kind||'').toLowerCase();const body=/snake|serpent|viper|eel|worm|naga|asp/.test(k)?'serpent':/eagle|bird|hawk|harp|owl|raven|griffin/.test(k)?'bird':/spider|scorpion|crab/.test(k)?'spider':/ooze|slime|blob/.test(k)?'blob':/giant|ogre|cyclop|minotaur|troll|man|titan/.test(k)?'biped':'quad';
  return {kind:'beast',body,c1:n.color||'#5f8a3a',c2:shade(n.color||'#5f8a3a',0.35).replace(/rgb\((\d+),(\d+),(\d+)\)/,(m,r,g,b)=>'#'+[r,g,b].map(v=>(+v).toString(16).padStart(2,'0')).join('')),size:clamp(0.6+(+n.hp||6)/40,0.6,1.25),tail:body==='quad'?'long':'none',horns:/bull|minotaur|ram|goat|dragon/.test(k),wings:/dragon|griffin|harp|wing/.test(k),mane:/lion/.test(k),spikes:/croc|dragon|boar|hedge/.test(k)}}
function figureHTML(sp,h=60,ring,extra={}){return `<span class="tkfig" style="display:inline-block;height:${h}px;width:${Math.round(h*100/170)}px">${figureSVG(sp,{w:'100%',h:'100%',ring,...extra})}</span>`}
/* the same choice for HTML (seats, cards, trackers, the Menagerie) */
function clsPieceHTML(cls,h=40,cl='stnd'){const st=tokenStyle();if(st==='standee'&&typeof STANDEE_SRC!=='undefined'&&STANDEE_SRC[cls])return standeeHTML(cls,h,cl);if(st==='figure'||(hasCustomToken(cls)&&st!=='cylinder'))return figureHTML(tokenForCls(cls),h);return ''}
function npcPieceHTML(n,h=40,cl='stnd'){const st=tokenStyle();const T=NPCT[n.t]||{};const sk=standeeKeyNPC(n);if(st==='standee'&&sk&&!T.custom)return standeeHTML(sk,h,cl);if(st==='figure'||(T.custom&&st!=='cylinder'))return figureHTML(tokenForNPC(n),h);return ''}

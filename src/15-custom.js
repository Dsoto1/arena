
/* =====================================================================
   CREATOR STUDIO: custom characters (rulebook p.60-63), custom beasts and custom events (p.64-67).
   Everything made here is marked ✦ custom and is never eligible for the Infamis, the Hall of Flavius or missios.
   ===================================================================== */
const CUSTOM={chars:[],npcs:[],events:[],tokens:[],loaded:false};
// [name, rulebook description (at value 1), points per value level, effect-per-level shown in the dropdown]
const ABILITIES={none:['None','No class ability.',0,'no ability'],dmg:['Iron Fist','+1 damage to every successful attack in round 1 (Soldier).',3,'+1 damage per hit in round 1'],coin:['Patron\'s Purse','+1 coin each turn, phase 3 (Royalty).',3,'+1 coin each turn'],cf:['Crowd Darling','+1 CF each turn, phase 3 (Hero).',4,'+1 CF each turn'],mv:['Fleet-footed','+1 movement each turn (Slave).',4,'+1 movement each turn'],vet:['Lanista','+1 coin or +1 CF each turn, your choice (Veteranus).',3,'+1 coin OR +1 CF each turn, your choice'],stone:['Stone Gatherer','Gathers 1 stone each turn for a Stone Sling (Damnatio).',2,'+1 sling stone each turn'],zora:['Eagle Handler','Declare Zora the golden eagle once per event (Venatore).',4,'+1 Zora release per event']};
const abilDesc=(k,val=1)=>{const A=ABILITIES[k||'none'];if(k==='none'||!A)return A?A[1]:'';return A[3].replace('+1',`+${val}`)+(val>1?` (value ${val})`:'')};
const CHAR_BUDGET=22;
const SKINS=['#f6dcc0','#f1c9a5','#e8bd93','#e0ac7e','#d29b6e','#c68e5f','#b97f52','#a86b43','#96603b','#7d4b2c','#6b3f24','#5a341e','#4a2a18'];
const SKIN_NAMES=['Alpine fair','Gallic fair','Latin light','Latin olive','Etruscan tan','Iberian bronze','Illyrian bronze','Numidian brown','Syrian brown','Egyptian deep','Kushite deep','Nubian dark','Aethiopian dark'];
const HAIRS=['#1f1510','#2e2019','#4a2c17','#7a4a22','#9a6a30','#b07a3a','#d8c28a','#e8dca8','#8a8a8a','#d8d8d8','#a3281f','#7a3a5a','#2f4f8a','#3a6a3a','#e07a2a','#f2f0e6'];
const HAIR_NAMES=['Raven black','Umbrian dark','Dark brown','Chestnut','Tawny','Auburn','Gallic blond','Germanic flaxen','Iron gray','Silver','Tyrrhenian red','Dyed madder','Woad blue','Druid green','Henna orange','Chalk white'];
const HELMS=[['none','Bare head'],['galea','Galea'],['crested','Crested galea'],['murmillo','Murmillo grill'],['hood','Retiarius hood'],['laurel','Laurel wreath'],['horned','Horned helm'],['circlet','Bronze circlet'],['band','Leather band'],['knot','Suebian knot'],['thraex','Thraex griffin crest'],['provocator','Provocator visor'],['pileus','Pileus (freedman cap)'],['diadem','Royal diadem'],['pelt','Wolf pelt (signifer)'],['veil','Priestly veil']];
const BGS=['#2a1f17','#1d2a33','#2f1b1b','#1f2a1c','#2a2233','#33291a','#403020','#1a2a3a','#332a20','#26331f','#3a1840','#2e2e2e','#3d2230','#4a3a12'];
const BG_NAMES=['Umber','Night harbor','Wine dark','Moss','Plum dusk','Sand','Amphora','Aegean','Colonnade','Laurel grove','Imperial purple','Vesuvian ash','Carthage dusk','Saffron'];
const HAIRSTYLES=[['','Short (default)'],['long','Long'],['crop','Cropped'],['curly','Curly'],['braid','Braided'],['crest','Mohawk crest'],['bald','Shaven']];
const BEARDS=[['','None'],['full','Full beard'],['goatee','Goatee'],['stache','Moustache'],['stubble','Stubble'],['forked','Forked (Gallic)']];
const MARKS=[['','None'],['scar','Scar'],['paint','War paint'],['scarX','Crossed scars'],['brand','Slave brand'],['tattoo','Thracian tattoos'],['woad','Woad face paint'],['patch','Eyepatch'],['blind','Milky eye']];
const EYES=[['#1a120c','Dark'],['#5a3a1e','Brown'],['#3a6a4a','Green'],['#3a5a8a','Blue'],['#8a7a3a','Amber'],['#7a7a7a','Gray']];
const GARBS=[['','Tunic & baldric'],['manica','Manica arm guard'],['fur','Fur mantle'],['toga','Toga praetexta'],['bare','Bare-chested'],['scale','Scale shoulder'],['chain','Chain mail']];
const ITEM_OPTS=[['','None'],['ap3','AP Upgrade token (3 AP)'],['ap2','AP Upgrade token (2 AP)'],['elix4','Health Elixir token (4 HP)'],['elix2','Health Elixir token (2 HP)'],['merc1','Speed of Mercury (+1 MV)'],['key','Arena Key'],['c:ward','Ward of the Evil Eye (card)'],['c:rete','Rete (card)'],['c:lure','Meat Lure (card)'],['c:tame','Tame (card)'],['c:focus','Focus! (card)'],['c:minerva',"Minerva's Push (card)"],['c:hercules1','Herculean Vigor +1 (card)'],['c:forge2','Forge of Vulcan +2 (card)'],['c:omnia1','Omnia Mutantur (card)']];

/* ---------- portraits: a small generated bust instead of a class card ---------- */
function portraitSVG(pt={},color='#c0433a'){
  const skin=pt.skin||SKINS[1],hair=pt.hair||HAIRS[1],bg=pt.bg||BGS[0],acc=color,helm=pt.helm||'none';
  const dk=h=>shade(h,-0.35),mt='#a9b2ba',mtd='#5d656d';
  const fk=String(bg).startsWith('flag:')&&typeof flagURIk==='function'?flagURIk(String(bg).slice(5)):null;
  let s=`<svg viewBox="0 0 100 140" aria-hidden="true"><rect width="100" height="140" fill="${fk?'#1a120c':bg}"/>${fk?`<image href="${fk}" x="-60" y="0" width="220" height="140" preserveAspectRatio="xMidYMid slice" opacity=".85"/><rect width="100" height="140" fill="rgba(10,6,4,.18)"/>`:''}<circle cx="50" cy="62" r="46" fill="${acc}" opacity=".16"/>`;
  if(pt.fem){ // gladiatrix: narrower shoulders, a strophium chest-band, softer jaw
    s+=`<path d="M12 140C14 112 29 101 50 101S86 112 88 140Z" fill="${dk(acc)}"/><path d="M24 140C26 118 36 108 50 108S74 118 76 140Z" fill="${acc}"/>`;
    s+=`<path d="M29 111C36 103 64 103 71 111L71 124C60 131 40 131 29 124Z" fill="${dk(acc)}" stroke="${shade(dk(acc),-0.25)}" stroke-width="1.2"/>`;
    s+=`<path d="M40 121C44 125 48 125 50 122C52 125 56 125 60 121" fill="none" stroke="${shade(dk(acc),-0.35)}" stroke-width="1.6"/><circle cx="50" cy="102.5" r="2.2" fill="#e8c86a"/>`;
    s+=`<rect x="42" y="78" width="16" height="26" rx="6" fill="${skin}"/><ellipse cx="30" cy="62" rx="4.5" ry="7" fill="${skin}"/><ellipse cx="70" cy="62" rx="4.5" ry="7" fill="${skin}"/><ellipse cx="50" cy="58" rx="20" ry="26.5" fill="${skin}"/>`;
  }else{
    s+=`<path d="M6 140C8 110 26 99 50 99S92 110 94 140Z" fill="${dk(acc)}"/><path d="M20 140C22 117 34 107 50 107S78 117 80 140Z" fill="${acc}"/><path d="M28 110L62 140" stroke="#5a3a1e" stroke-width="5"/>`;
    s+=`<rect x="41" y="78" width="18" height="26" rx="6" fill="${skin}"/><ellipse cx="28" cy="62" rx="5" ry="8" fill="${skin}"/><ellipse cx="72" cy="62" rx="5" ry="8" fill="${skin}"/><ellipse cx="50" cy="58" rx="22" ry="27" fill="${skin}"/>`;
  }
  const hs=pt.hs||(pt.long?'long':'');const bareHead=helm==='none'||helm==='laurel'||helm==='diadem';
  // garb over the shoulders
  if(pt.garb==='manica')s+=`<path d="M8 140C9 124 14 114 24 108L30 140Z" fill="${mt}" stroke="${mtd}"/><path d="M11 128h16M13 120h13M17 113h9" stroke="${mtd}" stroke-width="1.4"/>`;
  if(pt.garb==='fur')s+=`<path d="M8 124C18 102 36 100 50 104S82 102 92 124C80 116 66 114 50 116S20 116 8 124Z" fill="#7a5a3a" stroke="#4a3420"/><path d="M14 120l4 6M24 114l3 7M76 114l-3 7M86 120l-4 6" stroke="#4a3420" stroke-width="1.5"/>`;
  if(pt.garb==='toga')s+=`<path d="M20 140C22 117 34 107 50 107L70 140Z" fill="#efe6d2"/><path d="M50 107L72 140" stroke="#8a1c1c" stroke-width="5"/>`;
  if(pt.garb==='bare')s+=`<path d="M20 140C22 117 34 107 50 107S78 117 80 140Z" fill="${skin}"/><path d="M36 124Q43 128 50 124Q57 128 64 124" fill="none" stroke="${dk(skin)}" stroke-width="1.2"/><path d="M50 112v20" stroke="${dk(skin)}" stroke-width="1"/>`;
  if(pt.garb==='scale')s+=`<path d="M64 108C76 110 86 118 90 132L70 132Z" fill="#b8963a" stroke="#6b4d17"/>${[0,1,2].map(r=>[0,1,2].map(c2=>`<path d="M${68+c2*6+r*2} ${114+r*6}q3 4 6 0" fill="none" stroke="#6b4d17" stroke-width="1"/>`).join('')).join('')}`;
  if(pt.garb==='chain')s+=`<path d="M20 140C22 117 34 107 50 107S78 117 80 140Z" fill="#8f979e"/><path d="M22 124h56M24 118h52M22 130h56M21 136h58" stroke="#5d656d" stroke-width="1" stroke-dasharray="2 2"/>`;
  if(pt.ear&&!['hood','veil','murmillo','provocator'].includes(helm))s+=`<circle cx="${pt.fem?30:28}" cy="${pt.fem?71:72}" r="2.4" fill="none" stroke="#e8c86a" stroke-width="1.4"/>`;
  if(bareHead&&hs==='bald')s+=`<path d="M30 46Q50 30 70 46" fill="none" stroke="${shade(skin,0.12)}" stroke-width="3" opacity=".6"/>`;
  else if(bareHead&&hs==='crop')s+=`<path d="M28 52C28 34 72 34 72 52C66 44 34 44 28 52Z" fill="${hair}" opacity=".75"/>`;
  else if(bareHead&&hs==='curly')s+=`<g fill="${hair}">${[28,34,40,46,52,58,64,70].map((x,i)=>`<circle cx="${x+1}" cy="${46-Math.sin(i/7*Math.PI)*12}" r="6.5"/>`).join('')}<circle cx="27" cy="54" r="5"/><circle cx="73" cy="54" r="5"/></g>`;
  else if(bareHead&&hs==='braid')s+=`<path d="M28 54C27 30 73 30 72 54C67 41 33 41 28 54Z" fill="${hair}"/><path d="M71 52q8 12 2 22q8 10 0 22" fill="none" stroke="${hair}" stroke-width="6" stroke-linecap="round"/><path d="M71 60l6 2M72 72l6 2M73 84l6 2" stroke="${dk(hair)}" stroke-width="1.4"/>`;
  else if(bareHead&&hs==='crest')s+=`<path d="M44 20C46 14 54 14 56 20L57 46H43Z" fill="${hair}"/><path d="M30 50C32 42 36 40 40 40M70 50C68 42 64 40 60 40" stroke="${hair}" stroke-width="2" opacity=".5"/>`;
  else if(helm==='none'||helm==='laurel'||helm==='diadem')s+=(hs==='long'||pt.fem)?`<path d="M26 60C22 26 78 26 74 60C74 44 64 36 50 36S26 44 26 60Z M26 58C24 76 28 88 32 92L30 60Z M74 58C76 76 72 88 68 92L70 60Z" fill="${hair}"/>`:`<path d="M28 54C27 30 73 30 72 54C67 41 33 41 28 54Z" fill="${hair}"/>`;
  // v0.25: hair shows under and behind headgear (long hair past the cheek guards, sideburns, a braid, curls at the nape)
  if(!bareHead&&!['hood','veil','pelt'].includes(helm)&&hs!=='bald'){const lng=hs==='long'||(pt.fem&&!['crop','curly','braid','crest'].includes(hs));
    if(lng)s+=`<path d="M26 64C24 82 27 94 33 99L37 72Z M74 64C76 82 73 94 67 99L63 72Z" fill="${hair}"/>`;
    else if(hs==='braid')s+=`<path d="M72 66q8 12 2 22q8 10 0 22" fill="none" stroke="${hair}" stroke-width="6" stroke-linecap="round"/><path d="M73 74l6 2M74 86l6 2M75 98l6 2" stroke="${dk(hair)}" stroke-width="1.4"/>`;
    else if(hs==='curly')s+=`<g fill="${hair}"><circle cx="28" cy="66" r="5"/><circle cx="72" cy="66" r="5"/><circle cx="30" cy="74" r="4"/><circle cx="70" cy="74" r="4"/></g>`;
    else if(hs==='crest')s+=`<path d="M44 ${helm==='murmillo'?14:20}C46 8 54 8 56 ${helm==='murmillo'?14:20}Z" fill="${hair}"/>`;
    else s+=`<path d="M29.5 58v9M70.5 58v9" stroke="${hair}" stroke-width="3" stroke-linecap="round"/>`}
  const eye=pt.eyes||'#1a120c';s+=`<ellipse cx="41" cy="58" rx="3" ry="2.2" fill="${eye}"/><ellipse cx="59" cy="58" rx="3" ry="2.2" fill="${pt.mark==='blind'?'#d8dcd8':eye}"/>${pt.fem?'<path d="M37 55l-3 -2M45 55l3 -2M55 55l-3 -2M63 55l3 -2" stroke="#1a120c" stroke-width="1.2" stroke-linecap="round"/>':''}<path d="M35 52L46 53M54 53L65 52" stroke="${helm==='none'||helm==='laurel'?hair:'#2a1a10'}" stroke-width="2.4" stroke-linecap="round"/>`;
  s+=`<path d="M50 60L47 70L52 70" fill="none" stroke="${dk(skin)}" stroke-width="1.5"/><path d="M44 77Q50 ${pt.smile?82:78} 56 77" fill="none" stroke="${pt.fem?'#a34a52':'#6a3a2a'}" stroke-width="${pt.fem?2.4:1.8}"/>`;
  const bsel=pt.bs&&pt.bs!=='none'?pt.bs:(pt.beard?'full':'');if(bsel&&(pt.bs||!pt.fem)){const bs=bsel==='full'?'':bsel;
    if(bs==='goatee')s+=`<path d="M44 80C44 90 56 90 56 80C54 84 46 84 44 80Z" fill="${hair}"/><path d="M42 75Q50 72 58 75" fill="none" stroke="${hair}" stroke-width="2.4"/>`;
    else if(bs==='stache')s+=`<path d="M40 76Q50 70 60 76Q56 73 50 74Q44 73 40 76Z" fill="${hair}" stroke="${hair}" stroke-width="1.6"/>`;
    else if(bs==='stubble')s+=`<path d="M31 64C32 86 44 91 50 91S68 86 69 64C66 78 60 84 50 84S34 78 31 64Z" fill="${hair}" opacity=".35"/>`;
    else if(bs==='forked')s+=`<path d="M29 62C30 84 40 88 44 100L50 92L56 100C60 88 70 84 71 62C68 77 60 83 50 83S32 77 29 62Z" fill="${hair}"/>`;
    else s+=`<path d="M29 62C30 88 44 93 50 93S70 88 71 62C68 77 60 83 50 83S32 77 29 62Z" fill="${hair}"/>`}
  if(pt.mark==='scarX')s+=`<path d="M56 48L68 68M68 50L57 66" stroke="#a3281f" stroke-width="2"/>`;
  if(pt.mark==='brand')s+=`<path d="M60 66h6v6h-6z M63 66v6" fill="none" stroke="#7a2a1a" stroke-width="1.6"/>`;
  if(pt.mark==='tattoo')s+=`<path d="M33 66q4 -6 8 0q4 6 8 0M36 72q3 -4 6 0" fill="none" stroke="#2f4f6a" stroke-width="1.5"/>`;
  if(pt.mark==='woad')s+=`<path d="M30 50Q50 44 70 50L70 66Q50 60 30 66Z" fill="#2f4f8a" opacity=".55"/>`;
  if(pt.mark==='patch')s+=`<ellipse cx="59" cy="58" rx="5" ry="4.2" fill="#1a120c"/><path d="M28 50L72 64" stroke="#1a120c" stroke-width="1.6"/>`;
  if(pt.paint||pt.mark==='paint')s+=`<path d="M33 63h10M57 63h10" stroke="${acc}" stroke-width="3.2" stroke-linecap="round"/>`;
  if(pt.scar||pt.mark==='scar')s+=`<path d="M58 47L66 70" stroke="#a3281f" stroke-width="2.2"/>`;
  const galea=`<path d="M25 58C25 24 75 24 75 58L70 59C68 40 32 40 30 59Z" fill="${mt}" stroke="${mtd}" stroke-width="1.2"/><path d="M27 57L29 78L38 76L36 57Z M73 57L71 78L62 76L64 57Z" fill="#949da6" stroke="${mtd}"/>`;
  if(helm==='galea')s+=galea;
  if(helm==='crested')s+=`<path d="M30 34C36 4 64 4 70 34C62 22 38 22 30 34Z" fill="${acc}" stroke="${dk(acc)}"/>`+galea;
  if(helm==='horned')s+=galea+`<path d="M28 40C14 34 12 20 18 12C20 26 26 30 32 34Z M72 40C86 34 88 20 82 12C80 26 74 30 68 34Z" fill="#e8dcc0" stroke="#8a7a5a"/>`;
  if(helm==='murmillo')s+=`<path d="M22 60C20 22 80 22 78 60Z" fill="${mt}" stroke="${mtd}"/><path d="M12 62Q50 50 88 62L84 68Q50 58 16 68Z" fill="#c9a458" stroke="#6b4d17"/><path d="M34 60h32v24H34Z" fill="${mtd}" opacity=".9"/><path d="M38 60v24M44 60v24M50 60v24M56 60v24M62 60v24M34 66h32M34 72h32M34 78h32" stroke="#c9d0d6" stroke-width="1"/><path d="M40 18C46 6 54 6 60 18L56 30H44Z" fill="${acc}"/>`;
  if(helm==='hood')s+=`<path d="M22 70C16 26 84 26 78 70C74 50 66 38 50 38S26 50 22 70Z M22 70C24 90 30 98 36 102L34 70Z M78 70C76 90 70 98 64 102L66 70Z" fill="${dk(acc)}"/>`;
  if(helm==='circlet')s+=`<path d="M28 48Q50 38 72 48" fill="none" stroke="#c9a458" stroke-width="3.4"/><circle cx="50" cy="41.5" r="2.6" fill="#e0574f" stroke="#8a5a1e"/>`;
  if(helm==='band')s+=`<path d="M27 50Q50 41 73 50L73 55Q50 46 27 55Z" fill="#6a4520" stroke="#3f2812"/>`;
  if(helm==='knot')s+=`<circle cx="70" cy="36" r="7.5" fill="${hair}"/><path d="M64 40C60 34 64 28 70 29" fill="none" stroke="${dk(hair)}" stroke-width="2"/>`;
  if(helm==='thraex')s+=galea+`<path d="M40 30C44 4 70 4 72 24C64 16 52 18 50 30Z" fill="${acc}" stroke="${dk(acc)}"/><path d="M66 12l8 -6l-2 9z" fill="${acc}"/>`;
  if(helm==='provocator')s+=`<path d="M24 60C22 24 78 24 76 60Z" fill="${mt}" stroke="${mtd}"/><path d="M32 52h36v8H32Z" fill="#1a120c" opacity=".8"/><circle cx="41" cy="56" r="3" fill="#2a2a2a"/><circle cx="59" cy="56" r="3" fill="#2a2a2a"/><path d="M26 60L30 82L40 80L38 62Z M74 60L70 82L60 80L62 62Z" fill="#949da6" stroke="${mtd}"/>`;
  if(helm==='pileus')s+=`<path d="M28 48C28 22 72 22 72 48Z" fill="#d9ccb0" stroke="#8a7a5a"/><path d="M28 48h44" stroke="#8a7a5a" stroke-width="2"/>`;
  if(helm==='diadem')s+=`<path d="M28 46Q50 36 72 46L70 40L64 44L58 36L50 42L42 36L36 44L30 40Z" fill="#e8c86a" stroke="#8a5a1e"/><circle cx="50" cy="40" r="2.2" fill="#3a6ad0"/>`;
  if(helm==='pelt')s+=`<path d="M18 80C14 40 30 20 50 20S86 40 82 80C76 60 66 46 50 46S24 60 18 80Z" fill="#6a5a4a" stroke="#3a3024"/><path d="M34 26l-4 -12l10 8M66 26l4 -12l-10 8" fill="#6a5a4a" stroke="#3a3024"/><ellipse cx="42" cy="36" rx="2" ry="1.4" fill="#e8c86a"/><ellipse cx="58" cy="36" rx="2" ry="1.4" fill="#e8c86a"/>`;
  if(helm==='veil')s+=`<path d="M22 72C16 24 84 24 78 72C74 50 66 38 50 38S26 50 22 72Z M22 72C22 100 28 110 34 116L34 72Z M78 72C78 100 72 110 66 116L66 72Z" fill="#efe6d2" stroke="#b8a88a"/>`;
  if(helm==='laurel')s+=`<path d="M26 46Q50 30 74 46" fill="none" stroke="#5f8a3a" stroke-width="3"/>${[30,38,46,54,62,70].map((x,i)=>`<ellipse cx="${x}" cy="${44-Math.sin(i/5*Math.PI)*6}" rx="4" ry="2.4" fill="#7fae4a" transform="rotate(${i<3?-30:30} ${x} ${44-Math.sin(i/5*Math.PI)*6})"/>`).join('')}`;
  return s+'</svg>';
}
const PORTRAIT_SIZES={xs:[26,36],sm:[54,76],md:[110,154],lg:[170,238],xl:[250,350]};
function portraitHTML(c,size='md'){const [w,h]=PORTRAIT_SIZES[size]||PORTRAIT_SIZES.md;return `<span class="portrait" style="width:${w}px;height:${h}px" role="img" aria-label="${esc(c.name||'Custom gladiator')}">${portraitSVG(c.portrait,c.color)}</span>`}
function classArt(cls,size='md'){const C=CLASSES[cls];if(C&&C.custom){const c=CUSTOM.chars.find(x=>'cc_'+x.id===cls)||{name:C.hero,portrait:C.portrait,color:C.color};return portraitHTML(c,size)}return cardHTML('k:'+cls,size)}
function lockBtn(x){
  const L=x.lockLog||[];const lastUn=[...L].reverse().find(e=>e.a==='unlocked');const lastLk=[...L].reverse().find(e=>e.a==='locked');
  const tip=`${x.locked?'LOCKED':'Unlocked'} — click to ${x.locked?'unlock':'lock'} against edits and deletion.\nCreated ${x.created||'?'}${x.updated?` · last edited ${x.updated}`:''}${lastLk?`\nLast locked ${lastLk.at}`:''}${lastUn?`\nLast unlocked ${lastUn.at} — so people know the truth.`:'\nNever unlocked.'}`;
  return `<button class="btn" type="button" data-st="lock" data-id="${x.id}" title="${esc(tip)}" aria-label="${x.locked?'Unlock':'Lock'}" style="padding:4px 9px;${x.locked?'border-color:var(--gold)':''}">${x.locked?'🔒':'🔓'}</button>`;
}
const customTag=c=>c&&c.sandbox?'<span class="cbadge sbx" title="Sandbox build: made in the Creator Studio outside the loadout budget — not eligible for the Infamis, the Hall of Flavius or missios">✦✦ sandbox</span>':'<span class="cbadge" title="Made in the Creator Studio: not eligible for the Infamis, the Hall of Flavius or missios">✦ custom</span>';

/* ---------- characters ---------- */
function blankChar(){
  const fem=Math.random()<.35;
  const name=genName({female:fem}),city=pickOne(HOME_CITIES());
  return {id:null,name,nickname:genNickname(),city,color:pickOne(['#c0433a','#4f7fc4','#4f9a57','#d4b13c','#dc7a34','#8a5cc0','#5fc7c0','#e07b9a']),abil:'none',abilVal:1,weak:'none',abilText:'',
    R:'gladius',L:null,arm:{head:'galea',chest:'pectorale',belt:false,rarm:{upper:null,lower:null,wraps:true,cestus:false},larm:{upper:null,lower:null,wraps:true,cestus:false},legU:null,legUp:true,legL:null,legLp:false},
    coin:3,keys:1,items:['',''],pers:{...PERS_PRESETS.balanced.v},portrait:{skin:pickOne(SKINS),hair:pickOne(HAIRS),helm:pickOne(HELMS)[0],fem,beard:!fem&&Math.random()<.4,long:fem?Math.random()<.7:Math.random()<.25,scar:Math.random()<.3,paint:false,bg:sysBG()},
    backstory:'',sandbox:false,events:[],trophies:0,rr:0,ff:false,status:'active'};
}
function charFromClass(c,k){
  const C=CLASSES[k];const A={head:null,chest:null,belt:false,rarm:{upper:null,lower:null,wraps:false,cestus:false},larm:{upper:null,lower:null,wraps:false,cestus:false},legU:null,legUp:false,legL:null,legLp:false};
  for(const [key,loc] of C.armor){const a=ARM[key];
    if(a.slot==='head')A.head=key;else if(a.slot==='chest'){if(a.stack)A.belt=true;else A.chest=key}
    else if(a.slot==='arm'){const s=A[loc];if(a.pt==='upper')s.upper=key;else if(a.pt==='hand')s.cestus=true;else if(a.stack)s.wraps=true;else s.lower=key}
    else{if(a.pt==='upper'){if(a.stack)A.legUp=true;else A.legU=key}else{if(a.stack)A.legLp=true;else A.legL=key}}}
  Object.assign(c,{arm:A,R:C.R||null,L:C.L||null,coin:C.coin,keys:C.keys,abil:C.abil||'none',weak:CLASS_WEAK[k]||'none',items:[...C.items.slice(0,2),'',''].slice(0,2),pers:{...(PERS_PRESETS[CLASS_PERS[k]]||PERS_PRESETS.balanced).v},color:C.color});
  return c;
}
function charArmor(c){
  const A=c.arm||{},out=[];
  if(A.head)out.push([A.head,'head']);if(A.chest)out.push([A.chest,'chest']);if(A.belt)out.push(['balteus','chest']);
  for(const s of ['rarm','larm']){const a=A[s]||{};if(a.upper)out.push([a.upper,s]);if(a.lower)out.push([a.lower,s]);if(a.wraps)out.push(['wraps',s]);if(a.cestus)out.push(['cestus',s])}
  for(const s of ['rleg','lleg']){if(A.legU)out.push([A.legU,s]);if(A.legUp)out.push(['legwrapsU',s]);if(A.legL)out.push([A.legL,s]);if(A.legLp)out.push(['legwraps',s])}
  return out;
}
function charCost(c){
  const wc=k=>k&&W[k]?({1:2,2:4,3:7,4:10}[W[k].lv]||2):0;let v=wc(c.R)+wc(c.L);
  const seen=new Set();for(const [k,l] of charArmor(c)){const a=ARM[k];const key=a.pair?k+'|'+a.slot:k+'|'+l;if(seen.has(key))continue;seen.add(key);v+=a.flav?6:({1:1,2:3,3:5}[a.lv]||1)}
  v+=Math.ceil((c.coin||0)/2)+(c.keys||0)+(c.items||[]).filter(Boolean).length*2+ABILITIES[c.abil||'none'][2]*(c.abil&&c.abil!=='none'?(c.abilVal||1):1)-WEAKNESSES[c.weak||'none'][2];
  return v;
}
function charClass(c){
  const it=(c.items||[]).filter(Boolean);
  return {name:c.name,sub:c.nickname||'Custom gladiator',hero:c.name,city:c.city,img:null,color:c.color,baseColor:c.color,armor:charArmor(c),R:c.R||null,L:c.L&&c.L!==c.R?c.L:c.L||null,
    coin:c.coin||0,keys:(c.keys||0)+it.filter(x=>x==='key').length,items:it.filter(x=>x!=='key'),abil:c.abil==='none'?null:c.abil,abilVal:c.abilVal||1,weak:c.weak||'none',
    ab:`Ability: ${c.abilText?esc(c.abilText)+' — ':''}${c.abil&&c.abil!=='none'?abilDesc(c.abil,c.abilVal||1)+'. ':''}${ABILITIES[c.abil||'none'][1]}${c.weak&&c.weak!=='none'?' Weakness: '+WEAKNESSES[c.weak][1]:''}`,pers:c.pers,portrait:c.portrait,custom:true,cid:c.id};
}
/* ---------- beasts ---------- */
function applyNpcBase(n,k){
  const T=NPCT[k];if(!T)return;
  Object.assign(n,{kind:T.n,glyph:T.g,color:T.col,hp:T.hp,ap:T.ap,rng:T.rng||1,mv:T.mv,coin:T.coin,cf:T.cf,fly:!!T.fly,tameable:!!T.tameable,states:!!T.states,beh:T.scan?'hunt':T.huntCF?'cf':'zone'});
}
function blankNpc(){return {id:null,name:genBeastName(),kind:'Crocodile',kindKey:'crocodile',glyph:'K',color:'#5f8a3a',hp:10,ap:3,rng:1,mv:2,coin:8,cf:5,beh:'zone',fly:false,tameable:true,states:true}}
function npcType(n){
  const hp=clamp(+n.hp||1,1,60),ap=clamp(+n.ap||1,1,9),rng=clamp(+n.rng||1,1,5),mv=clamp(+n.mv||1,0,7);
  return {n:n.kind||n.name,g:String(n.glyph||n.name[0]||'?').slice(0,1).toUpperCase(),mv,ap,hp,rng,coin:+n.coin||0,cf:+n.cf||0,col:n.color||'#8a8a8a',tameable:n.tameable?1:0,fly:n.fly?1:0,scan:n.beh==='hunt'?1:0,huntCF:n.beh==='cf'?1:0,
    states:n.states?[[Math.ceil(hp*0.5),ap,rng,mv,'Initial'],[Math.ceil(hp*0.2),ap+1,rng,Math.min(7,mv+1),'Raged'],[0,Math.max(1,ap-1),1,1,'Fazed']]:null,custom:true,cid:n.id};
}
/* ---------- events ---------- */
const END_CONDS=[['alive1','Last gladiator (or team) standing'],['alive2','Two gladiators remain'],['npc4|elim1','Four beasts slain or one gladiator falls'],['elim1','The first gladiator falls'],['npc','N beasts slain this round'],['rot','N turn rotations this round'],['cf','A gladiator reaches N Crowd Favor'],['beasts','Every beast slain or tamed'],['survive','Survive N rotations (everyone standing wins)']];
const SPAWN_NPCS=[['Leo','lion',[6,3]],['Leaena','lion',[6,9]],['Tholo','tholo',[6,6]],['Commodus','commodus',[3,6]],['Zora','zora',[9,6]]];
function classicLayout(){
  return {pillars:PILLARS.map(([r,c])=>({r,c,pot:'?'})),tunnels:TUNNELS.map(x=>[...x]),spikes:[],chest:[6,6],chestW:[...CHEST_W],
    npcs:BASE_NPCS.map(b=>({key:b.name,t:b.t,name:b.name,r:b.home[0],c:b.home[1],beh:'zone'})),items:[],starts:STARTS.map(x=>[...x])};
}
function blankEvent(){
  return {id:null,name:'The '+pickOne(NAMEBANK.title)+' of '+pickOne(NAMEBANK.place),notes:'',min:2,max:4,mode:'ffa',loc:6,
    rounds:[{n:'Bestiarii',zone:1,pve:1,pvp:0,cf:1,ca:1,end:'npc4|elim1',endN:4,reward:{coin:2,cf:2,cards:0}},{n:'Royale',zone:2,pve:1,pvp:1,cf:1,ca:1,end:'alive2',endN:2,reward:{coin:2,cf:2,cards:0}},{n:'Duel',zone:3,pve:1,pvp:1,cf:0,ca:0,end:'alive1',endN:1,reward:{}}],
    win:15,limits:{rot:0,min:0},deck:true,mandata:true,market:true,truce:true,priceMul:100,loadout:'class',draftPicks:3,start:{coin:0,cf:0,keys:0,hp:0,ap:0},
    classes:[...BASE_CLS],allowCustom:true,npcHp:100,npcDmg:0,spect:0,optOffers:true,chariotOffers:0,eaglePot:true,deckSpawns:{Leo:true,Leaena:true,Tholo:true,Commodus:true,Zora:true},layout:classicLayout()};
}
function eventDef(e){
  const rounds=e.rounds.map((r,i)=>({n:r.n||`Round ${i+1}`,zone:+r.zone||1,pve:r.pve?1:0,pvp:r.pvp?1:0,cf:r.cf?1:0,ca:r.ca?1:0,end:r.end,endN:+r.endN||0,reward:{...(r.reward||{})}}));
  rounds[rounds.length-1].reward.win=+e.win||15;
  const noCards=[];const map={Leo:'spawnLeo',Leaena:'spawnLeaena',Tholo:'spawnTholo',Commodus:'spawnCommodus',Zora:'zora'};for(const [k,v] of Object.entries(map))if(!(e.deckSpawns||{})[k])noCards.push(v);
  return {custom:true,cid:e.id,img:null,n:e.name||'Custom event',short:e.name||'Custom event',tag:'Custom',loc:+e.loc||6,min:clamp(+e.min||1,1,8),max:clamp(+e.max||4,+e.min||1,8),
    deck:e.deck?1:0,mandata:e.mandata?1:0,teams:e.mode==='teams'?1:0,coop:e.mode==='coop'?1:0,noTruce:e.truce?0:1,noMarket:!e.market,
    draft:e.loadout==='draft'?{all:clamp(+e.draftPicks||3,1,8)}:null,loadout:e.loadout,classes:[...(e.classes||BASE_CLS),...(e.allowCustom?CUSTOM.chars.filter(c=>typeof onRollsR!=='function'||onRollsR(c)).map(c=>'cc_'+c.id):[])],
    blurb:esc(e.notes||'A custom event from the Creator Studio.'),rounds,layout:e.layout,start:e.start||{},npcHp:+e.npcHp||100,npcDmg:+e.npcDmg||0,priceMul:(+e.priceMul||100)/100,
    spect:+e.spect||0,limits:e.limits||{},chariotOffers:+e.chariotOffers||0,optOffers:e.optOffers!==false,eaglePot:e.eaglePot!==false,noCards,src:e};
}
async function loadCustoms(){
  const [ch,np,ev]=await Promise.all([Store.list('customChars'),Store.list('customNpcs'),Store.list('customEvents')]);
  CUSTOM.chars=ch.sort((a,b)=>String(a.name).localeCompare(b.name));CUSTOM.npcs=np.sort((a,b)=>String(a.name).localeCompare(b.name));CUSTOM.events=ev.sort((a,b)=>String(a.name).localeCompare(b.name));
  try{CUSTOM.tokens=(await Store.list('customTokens')).sort((a,b)=>String(a.name).localeCompare(b.name))}catch(e){CUSTOM.tokens=[]}
  if(typeof loadTrophies==='function')await loadTrophies();
  if(typeof loadSponsors==='function')await loadSponsors();
  if(typeof loadGear==='function')await loadGear();
  if(typeof loadFlags==='function')await loadFlags();
  registerCustoms();CUSTOM.loaded=true;return CUSTOM;
}
// registered entries are only ever added or overwritten, never removed mid-session, so a running event can't lose its class
function registerCustoms(){
  for(const n of CUSTOM.npcs)NPCT['cn_'+n.id]=npcType(n);
  for(const c of CUSTOM.chars){const k='cc_'+c.id;CLASSES[k]=charClass(c)}
  for(const e of CUSTOM.events){EVENTS['ce_'+e.id]=eventDef(e);EVENTS['ce_'+e.id].trophy=e.trophy||null;EVENTS['ce_'+e.id].sponsor=e.sponsor||null;EVENTS['ce_'+e.id].nofates=!!e.nofates} // v0.27: a trophy for the winner
}

/* ---------- engine hooks for custom events ---------- */
function customSeatStarts(cfg,ev){const st=(ev.layout&&ev.layout.starts)||[];cfg.seats.forEach((s,i)=>{if(st[i])s.start=[...st[i]]})}
function zoneAround(t,r,c,name){
  const b=BASE_NPCS.find(x=>x.name===name&&x.home[0]===r&&x.home[1]===c);if(b)return [...b.zone];
  const rad=t==='bear'?1:2;return [Math.max(0,r-rad),Math.min(N-1,r+rad),Math.max(0,c-rad),Math.min(N-1,c+rad)];
}
function customBoard(cfg,ev){
  const L=ev.layout||classicLayout();
  S.npcHpMul=(ev.npcHp||100)/100;S.npcDmg=ev.npcDmg||0;S.priceMul=ev.priceMul||1;S.limits=ev.limits||{};S.rotStart=1;S.killStart=0;S.elimStart=0;
  if(ev.chariotOffers){for(let i=0;i<ev.chariotOffers;i++)S.bag.push(pickOne(Object.keys(CH_OFFERS)));shuffle(S.bag)}
  S.tunnels=(L.tunnels||[]).map(([r,c])=>({r,c}));
  S.spikes=(L.spikes||[]).map(([r,c])=>({r,c}));
  S.chest=L.chest?{r:L.chest[0],c:L.chest[1],weapons:shuffle([...(L.chestW&&L.chestW.length?L.chestW:CHEST_W)]),held:null}:null;
  S.pillars=(L.pillars||[]).map((p,i)=>({id:i,r:p.r,c:p.c,pots:[]}));
  const draw=()=>{if(!S.bag.length)S.bag=buildBag(S.opts);return S.bag.pop()};
  (L.pillars||[]).forEach((p,i)=>{if(p.pot)S.pillars[i].pots.push(p.pot==='?'?draw():p.pot)});
  const rand=(L.pillars||[]).map((p,i)=>p.pot==='?'?i:-1).filter(i=>i>=0);
  if(ev.eaglePot&&cfg.opts.eaglePot!==false&&rand.length&&!S.pillars.some(p=>p.pots.includes('eagle'))){const i=pickOne(rand);S.pillars[i].pots[0]='eagle'}
  S.npcs=(L.npcs||[]).filter(n=>NPCT[n.t]).map(n=>{const T=NPCT[n.t];const beh=n.beh||(T.scan?'hunt':T.huntCF?'cf':'zone');
    return mkNPC(n.t,n.name,n.r,n.c,{home:beh==='zone'?[n.r,n.c]:null,zone:beh==='zone'?zoneAround(n.t,n.r,n.c,n.name):null,base:beh==='zone'&&!T.custom&&['snake','wolf','bear'].includes(n.t),scan:beh==='hunt'&&!T.scan?1:0})});
  for(const it of L.items||[]){
    if(it.kind==='offer')placeFloor('offer',it.key,it.r,it.c);
    else if(it.kind==='key')placeFloor('key','key',it.r,it.c);
    else{let pl=S.piles.find(x=>x.owner<0&&x.r===it.r&&x.c===it.c);if(!pl){pl={id:uid++,owner:-1,color:'#e8dcc0',name:'the arena',r:it.r,c:it.c,corpse:false,weapons:[],armor:[],coin:0,items:[]};S.piles.push(pl)}
      if(it.kind==='weapon'&&W[it.key])pl.weapons.push(mkW(it.key));
      if(it.kind==='armor'&&ARM[it.key])pl.armor.push({key:it.key,n:ARM[it.key].n,ap:ARM[it.key].ap,from:'drop'});
      if(it.kind==='coin')pl.coin+=+it.key||3;}
  }
  // a beast standing on a start tile moves aside
  for(const p of S.players){const n=S.npcs.find(n=>n.r===p.r&&n.c===p.c);if(n){const [r,c]=freeGrid();n.r=r;n.c=c;if(n.home)n.home=[r,c]}}
}
async function customStart(ev){
  const st=ev.start||{};const bits=[];
  for(const p of S.players){if(st.coin)p.coin+=+st.coin;if(st.cf)p.cf+=+st.cf;if(st.keys)p.keys+=+st.keys}
  if(st.coin)bits.push(`+${st.coin} coin`);if(st.cf)bits.push(`+${st.cf} CF`);if(st.keys)bits.push(`+${st.keys} Arena Key${st.keys>1?'s':''}`);
  if(bits.length)log(`Event rules: every gladiator starts with ${bits.join(', ')}.`);
  for(const p of S.players){if(st.hp)await distributeHP(p,+st.hp,`the event's +${st.hp} HP`);if(st.ap)await distributeAP(p,+st.ap,`the event's +${st.ap} AP`)}
  if(ev.noMarket)log('The market is closed for this event.');
  if(ev.limits&&(ev.limits.rot||ev.limits.min))log(`Time limit: ${[ev.limits.rot?ev.limits.rot+' turn rotations':'',ev.limits.min?ev.limits.min+' minutes':''].filter(Boolean).join(' or ')}. When it runs out, the highest Crowd Favor still standing wins.`,'big');
}
function checkEndCustom(ev,rd,act,set,win){
  const last=S.ri>=ev.rounds.length-1;
  const topCF=()=>{const t=[...act].sort((a,b)=>b.cf-a.cf)[0];return !t?[]:(ev.teams||ev.coop)?act.filter(p=>p.team===t.team):[t]};
  const done=(why,ws)=>last?win(ws||topCF(),why+(ws?'':'; the highest Crowd Favor wins')):set({next:1,reason:why.charAt(0).toLowerCase()+why.slice(1)});
  if(!act.length)return win([],'No gladiator survives.');
  if(ev.limits&&ev.limits.rot&&S.rotation>ev.limits.rot)return win(topCF(),`${ev.limits.rot} turn rotations have passed; the highest Crowd Favor wins`);
  const teams=[...new Set(act.map(p=>p.team))];
  if(S.players.length>1&&!ev.coop&&teams.length<=1&&rd.end!=='survive')return win(act,ev.teams?'Last team standing.':'Last gladiator standing.');
  const N=+rd.endN||0,rots=S.rotation-(S.rotStart||1),kills=S.npcKills-(S.killStart||0),elims=S.elims-(S.elimStart||0);
  switch(rd.end){
    case 'alive1':if(S.players.length===1&&S.npcs.length&&S.npcs.every(n=>!n.alive||n.tamedBy!=null))win(act,'Every beast is slain.');break;
    case 'alive2':if(act.length<=2&&S.players.length>2)done('Two gladiators remain',last?act:null);break;
    case 'npc4|elim1':if(kills>=4||elims>=1)done(elims>=1?'A gladiator has fallen':'Four beasts are slain');break;
    case 'elim1':if(elims>=1)done('The first gladiator has fallen');break;
    case 'npc':if(kills>=Math.max(1,N))done(`${N} beasts are slain`);break;
    case 'rot':if(rots>=Math.max(1,N))done(`${N} turn rotations have passed`);break;
    case 'cf':{const p=act.filter(q=>q.cf>=Math.max(1,N)).sort((a,b)=>b.cf-a.cf)[0];if(p)done(`${p.name} reached ${N} Crowd Favor`,(ev.teams||ev.coop)?act.filter(q=>q.team===p.team):[p]);break}
    case 'beasts':if(S.npcs.length&&S.npcs.every(n=>!n.alive||n.tamedBy!=null))done('Every beast is slain or tamed',act);break;
    case 'survive':if(rots>=Math.max(1,N))done(`The gladiators survived ${N} rotations`,act);break;
  }
}
// a custom character's sheet records every event (the paper sheet's Event / CF | Coin rows, trophies, RR, Flavius Fidelis)
/* v0.21: a creation is a DESIGN until you add it to the rolls. Only characters on the rolls can be
   seated in New event or join Manager-mode careers — and a death is final: the character is struck
   from the rolls (status 'fallen'), exactly like a Ludus gladiator. Freedom retires them too. */
const onRolls=c=>!!c&&c.rolls!==false&&(!c.status||c.status==='active');
async function logCustomChars(rows){
  for(const x of rows){const C=CLASSES[x.p.cls];if(!C||!C.custom)continue;const c=CUSTOM.chars.find(z=>z.id===C.cid);if(!c)continue;
    const ev=EV(),L=LOCATIONS[S.locIdx];
    c.events=[...(c.events||[]),{date:new Date().toISOString().slice(0,10),event:ev.short||ev.n,loc:L?L.n:'',cf:x.f,coin:x.p.coin,won:!!x.won,fate:x.fate?x.fate[0]:'',cpu:!!x.p.cpu,custom:!!ev.custom}];
    c.trophies=(c.trophies||0)+x.p.trophies.length;c.rr=(c.rr||0)+x.p.coin;if((x.p.stats.mfRevealed||0)>0)c.ff=true;c.updated=new Date().toISOString().slice(0,10);
    if(!ev.custom&&!S.exhib&&x.fate&&typeof aliveInUniverse==='function'&&!aliveInUniverse(x)){c.status='fallen';c.rolls=false;c.fell={date:c.updated,fate:x.fate[0],at:L?L.n:''};log(`✝ ${esc(c.name)} is struck from the rolls — ${esc(x.fate[0])}. Their design stays in the Creator Studio; copy it to raise a successor.`,'bad')}
    await Store.put('customChars',c.id,c).catch(()=>{});}
}

/* ================= STUDIO UI ================= */
const blankSpec=()=>({id:null,name:genName({female:Math.random()<.45}),taste:pickOne(Object.keys(typeof SPECT_TASTES!=='undefined'?SPECT_TASTES:{cf:1})),temper:'fickle',trouble:0,kin:null,look:{skin:'#e0ac7e',hair:'#4a2c17',fem:false,beard:false,long:false}});
let ST={tab:'chars',view:'list',draft:null,sub:'board',tool:'pillar',opt:{},names:[],spd:null};
const setPath=(o,path,v)=>{if(path==='portrait.bs'&&o.portrait){o.portrait.beard=false}if(path==='portrait.hs'&&o.portrait){o.portrait.long=false}if(path==='portrait.mark'&&o.portrait){o.portrait.scar=false;o.portrait.paint=false}const ks=path.split('.');let t=o;for(let i=0;i<ks.length-1;i++){if(t[ks[i]]==null)t[ks[i]]=/^\d+$/.test(ks[i+1])?[]:{};t=t[ks[i]]}t[ks[ks.length-1]]=v};
const getPath=(o,path)=>path.split('.').reduce((t,k)=>t==null?t:t[k],o);
const fSel=(path,opts,val,attrs='')=>`<select class="tin" data-f="${path}" ${attrs}>${opts.map(([v,l])=>`<option value="${esc(v??'')}" ${String(val??'')===String(v??'')?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
const fNum=(path,val,min,max,step=1)=>`<span class="slider" style="grid-template-columns:1fr 38px"><input type="range" data-f="${path}" data-num="1" min="${min}" max="${max}" step="${step}" value="${val??0}"><output>${val??0}</output></span>`;
const fChk=(path,val,label)=>`<label class="chk"><input type="checkbox" data-f="${path}" ${val?'checked':''}> ${label}</label>`;
const fTxt=(path,val,attrs='')=>`<input type="text" class="tin" data-f="${path}" value="${esc(val??'')}" ${attrs}>`;
/* ---------- v0.23 TOKEN CREATOR: sculpt the board piece for any class, beast or creation ---------- */
function tokTargets(){const T=[];for(const k of BASE_CLS)T.push(['cls:'+k,'Class · '+CLASSES[k].name]);for(const k of ['snake','wolf','bear','lion','tholo','commodus','zora'])T.push(['npc:'+k,'Beast · '+NPCT[k].n]);
  for(const c of CUSTOM.chars)T.push(['cc:'+c.id,'✦ Character · '+c.name]);for(const n of CUSTOM.npcs)T.push(['cn:'+n.id,'✦ Beast · '+n.name]);for(const t of CUSTOM.tokens)T.push(['lib:'+t.id,'📚 Library · '+t.name]);return T}
function tokLoad(tg){const [k,id]=tg.split(':');if(k==='cls')return JSON.parse(JSON.stringify(TOKEN_OVR[id]||TOKEN_DEF[id]));if(k==='npc')return JSON.parse(JSON.stringify(TOKEN_OVR['npc_'+id]||TOKEN_DEF[id]));
  if(k==='lib'){const t=CUSTOM.tokens.find(x=>x.id===id);return JSON.parse(JSON.stringify(t?t.spec:TOKEN_DEF.soldier))}
  if(k==='cc'){const c=CUSTOM.chars.find(x=>x.id===id);const lt=c&&c.tokenRef&&CUSTOM.tokens.find(x=>x.id===c.tokenRef);return JSON.parse(JSON.stringify(lt?lt.spec:c&&c.token||autoTokenForChar(c||{})))}const n=CUSTOM.npcs.find(x=>x.id===id);return JSON.parse(JSON.stringify(n&&n.token||autoTokenForNpc(n||{})))}
function tokRandom(sp){const r=a=>a[Math.floor(Math.random()*a.length)][0];const col=()=>'#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');
  if(sp.kind==='beast')return {...sp,body:sp.body,c1:col(),c2:col(),tail:r(T_TAILS),mane:Math.random()<.3,horns:Math.random()<.3,wings:Math.random()<.2,spikes:Math.random()<.25,eyes:col()};
  return {...sp,body:r(T_BODIES),helm:r(T_HELMS),shield:r(T_SHIELDS),weapon:r(T_WEAPONS),c1:col(),c2:pickOne(['#d6ab4c','#c9d0d6','#e8dcc0','#8a1c1c','#1d2a55']),skin:pickOne(TOKEN_SKINS),cape:Math.random()<.4,stance:Math.random()<.2?'hunched':'',hair:Math.random()<.35?'long':''}}
function tokenStudioHTML(){const tg=ST.tokT||'cls:soldier';if(!ST.tokS||ST.tokSFor!==tg){ST.tokS=tokLoad(tg);ST.tokSFor=tg}const sp=ST.tokS;
  const sel=(f,opts)=>`<select class="tin" data-tkf="${f}">${opts.map(([v,l])=>{const lk=achLocked(f,v);const A=lk&&ACHIEVEMENTS.find(x=>x.k===lk);return `<option value="${v}" ${String(sp[f]||'')===v?'selected':''} ${lk?'disabled':''}>${lk?'🔒 ':''}${l}${lk?` — earn “${A?A.n:lk}”`:''}</option>`}).join('')}</select>`;
  const col=(f,def)=>`<input type="color" data-tkf="${f}" value="${/^#[0-9a-f]{6}$/i.test(sp[f]||'')?sp[f]:def}" style="width:44px;height:28px;border:0;background:none;padding:0">`;
  const chk=(f,l)=>`<label class="chk"><input type="checkbox" data-tkf="${f}" ${sp[f]?'checked':''}> ${l}</label>`;
  const human=sp.kind!=='beast';
  const sld=(f,min,max,step,def)=>`<span class="slider" style="grid-template-columns:1fr 38px"><input type="range" data-tkf="${f}" min="${min}" max="${max}" step="${step}" value="${sp[f]??def}"><output>${sp[f]??def}</output></span>`;
  const ctrls=human?`<div class="formgrid tkgrid"><label>Body${sel('body',T_BODIES)}</label><label>Headgear${sel('helm',T_HELMS)}</label><label>Weapon${sel('weapon',[...T_WEAPONS,...Object.entries(W).filter(([k,w])=>k.startsWith('cw_')&&w.cwLoadout).map(([k,w])=>[k,'✦ '+w.n])])}</label><label>Shield${sel('shield',T_SHIELDS)}</label>
      <label>Shield emblem${sel('emblem',T_EMBLEM)}</label><label>Off hand${sel('off',T_OFF)}</label><label>Arms${sel('arms',T_ARMS)}</label><label>Legs${sel('legs',T_LEGS)}</label>
      <label>Neck${sel('neck',T_NECK)}</label><label>Face${sel('face',T_FACE)}</label><label>Eyes${sel('eyeT',T_EYES)}</label><label>Beard${sel('beard',T_BEARD)}</label>
      <label>Hair${sel('hair',T_HAIRS)}</label><label>Stance${sel('stance',[['','Upright'],['hunched','Hunched']])}</label><label>Skin${sel('skin',TOKEN_SKINS.map((v,i)=>[v,['Fair','Olive','Tan','Bronze','Brown','Deep','Ruddy','Ash-gray','Sea-green'][i]||'Tone '+(i+1)]))}</label><label>Size${sld('scale',0.8,1.3,0.02,1)}</label>
      <label>Main color${col('c1','#a3281f')}</label><label>Trim color${col('c2','#d6ab4c')}</label><label>Hair color${col('hairC','#3a2616')}</label><label>Base color${col('base','#3a2e24')}</label></div>
      <div class="formgrid tkgrid" style="margin-top:4px"><label>Cloak${sel('capeC',[['','House colors'],['gold','Golden cloak']])}</label><label>Base finish${sel('baseT',[['','Chosen color'],['obsidian','Obsidian & gold']])}</label></div><div class="chkgrid" style="margin-top:4px">${chk('cape','Cape')}</div>`
    :`<div class="formgrid tkgrid"><label>Body${sel('body',T_BEASTS)}</label><label>Tail${sel('tail',T_TAILS)}</label><label>Pattern${sel('pattern',T_PATTERN)}</label><label>Gear${sel('extra',T_EXTRA)}</label>
      <label>Eyes${sel('eyeT',[['two','Two'],['cyclops','One great eye']])}</label><label>Size${sld('size',0.5,1.3,0.05,1)}</label>
      <label>Hide${col('c1','#5f8a3a')}</label><label>Markings${col('c2','#d8c88a')}</label><label>Eye color${col('eyes','#f0cf7d')}</label><label>Base color${col('base','#3a2e24')}</label></div>
      <div class="chkgrid" style="margin-top:4px">${chk('mane','Mane')}${chk('horns','Horns')}${chk('wings','Wings')}${chk('spikes','Spikes')}${chk('bulk','Bulky')}</div>`;
  const Ls=sp.layers||[];const li=ST.tokL??-1;const L=Ls[li];
  const shapes=scbBenchHTML('tok',{inGrid:false});
  const [k]=tg.split(':');
  const libAssign=k==='lib'?`<div class="card2" style="margin-top:8px"><b>📚 Library token</b> <span class="rc-sub">free-standing — hand it to any creation</span><div class="acts" style="align-items:center;margin-top:4px"><input class="tin" id="tokName" value="${esc((CUSTOM.tokens.find(x=>'lib:'+x.id===tg)||{}).name||'')}" placeholder="Token name" style="flex:1"><select class="tin" id="tokAssign" style="flex:1"><option value="">Assign to a creation…</option>${CUSTOM.chars.map(c=>`<option value="cc:${c.id}">✦ ${esc(c.name)}${c.tokenRef&&'lib:'+c.tokenRef===tg?' (wearing it)':''}</option>`).join('')}${CUSTOM.npcs.map(n=>`<option value="cn:${n.id}">🐾 ${esc(n.name)}${n.tokenRef&&'lib:'+n.tokenRef===tg?' (wearing it)':''}</option>`).join('')}</select><button class="btn tksm" type="button" data-st="tokassign">Assign</button></div></div>`:'';
  return `<div class="tokhelp"><b>How tokens work.</b> Every class and default beast has a figure. Every <b>custom character</b> gets one automatically from its portrait (Creator Studio → Characters), and every <b>custom beast</b> wears the figure of its kind (a ready-made animal, or one drawn automatically for a custom kind) — pick either in <i>Token for</i> to sculpt it. You can also sculpt <b>free-standing library tokens</b> (📚 below) and hand them to any creation, here or from the character and beast editors. Tokens show on the board when Settings → Tokens is on <b>Figures</b>; your creations always wear theirs. ${customTag()}</div>
   <div class="setup-grid" style="grid-template-columns:minmax(0,220px) minmax(0,1fr)"><div style="text-align:center">
     <label style="display:grid;gap:4px;text-align:left;font-size:13px">Token for<select class="tin" id="tokTarget">${tokTargets().map(([v,l])=>`<option value="${v}" ${v===tg?'selected':''}>${esc(l)}</option>`).join('')}</select></label>
     <div id="tokPrev" class="tokprev" data-scbprev="tok" title="Drag a selected shape here">${figureHTML(sp,230,null,{selLayer:ST.tokL??-1})}</div>
     <div class="rc-sub">${human?'A gladiator':'A beast'} · ${k==='cls'||k==='npc'?'default piece':'your creation'}</div></div>
    <div>${ctrls}${shapes}
     <div class="sect">Battle states <span class="rc-sub">how this figure looks as the sand takes its price (automatic in play)</span></div>
     <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:flex-end">${(ST.tokT==='npc:tholo'||ST.tokS&&ST.tokS.weapon==='greatclub'&&ST.tokS.eyeT==='cyclops'?[['whole',{}],['slain — headless',{},1]]:[['whole',{}],['−1 arm',{rarm:1}],['−1 leg',{rleg:1}],['−arm & leg',{larm:1,rleg:1}],['legless',{rleg:1,lleg:1}],['the last stand',{rleg:1,lleg:1,larm:1}]]).map(([l,sv,hd])=>`<span style="text-align:center">${figureHTML({...ST.tokS,sev:sv,headless:!!hd},64)}<br><span class="rc-sub" style="font-size:10px">${l}</span></span>`).join('')}</div>
     ${libAssign}<div class="mbtns">${k==='cls'||k==='npc'?`<span class="cbadge sys" title="System figures are locked so the defaults are always there">🔒 System figure</span><button class="btn primary" type="button" data-st="toklibnew" title="System figures are locked — your changes are saved as a copy in the token library">⧉ Save as a copy (library token)</button>`:`<button class="btn primary" type="button" data-st="toksave">💾 Save token</button><button class="btn" type="button" data-st="toklibnew">📚 Save as a new library token</button>`}<button class="btn" type="button" data-st="tokrand">🎲 Randomize</button><button class="btn" type="button" data-st="tokreset">↺ ${k==='cc'?'From portrait':k==='cn'?'From the beast':'Default'}</button>${k==='cn'||k==='npc'?`<button class="btn" type="button" data-st="tokkind">⇄ ${human?'Make it a beast':'Make it a humanoid'}</button>`:''}</div>
     <h4>The lineup</h4><div class="toklineup">${BASE_CLS.map(c=>`<button type="button" class="tokthumb ${tg==='cls:'+c?'on':''}" data-st="tokpick" data-v="cls:${c}" title="${CLASSES[c].name}">${figureHTML(tokenForCls(c),64)}<small>${CLASSES[c].name}</small></button>`).join('')}${['snake','wolf','bear','lion','tholo','commodus','zora'].map(t=>`<button type="button" class="tokthumb ${tg==='npc:'+t?'on':''}" data-st="tokpick" data-v="npc:${t}" title="${NPCT[t].n}">${figureHTML(tokenForNPC({t}),64)}<small>${NPCT[t].n}</small></button>`).join('')}${CUSTOM.chars.map(c=>`<button type="button" class="tokthumb ${tg==='cc:'+c.id?'on':''}" data-st="tokpick" data-v="cc:${c.id}">${figureHTML(tokenOfChar(c),64)}<small>✦ ${esc(c.name)}</small></button>`).join('')}${CUSTOM.npcs.map(n=>`<button type="button" class="tokthumb ${tg==='cn:'+n.id?'on':''}" data-st="tokpick" data-v="cn:${n.id}">${figureHTML(tokenOfNpc(n),64)}<small>✦ ${esc(n.name)}</small></button>`).join('')}${CUSTOM.tokens.map(t=>`<button type="button" class="tokthumb ${tg==='lib:'+t.id?'on':''}" data-st="tokpick" data-v="lib:${t.id}">${figureHTML(t.spec,64)}<small>📚 ${esc(t.name)}</small></button>`).join('')}</div></div></div>`}
function stReady(fresh){if(['chars','npcs','events'].includes(ST.tab)){ST.draft=ST.tab==='chars'?blankChar():ST.tab==='npcs'?blankNpc():blankEvent();ST.view='edit'}else{ST.view='list';ST.draft=null}}
function studioHTML(){
  const tabs=railTabs([['all','📋 All creations'],['classes','🎭 Classes'],['chars','🛡 Characters'],['lanistas','🎩 Lanistas'],['npcs','🐾 Beasts'],['cohorts','🤝 Cohorts'],['events','🎪 Event Designer'],['tourneys','🏆 Tournament Designer'],['spect','👥 Spectators'],['tokens','🗿 Tokens'],['gear:w','⚔ Weapons'],['gear:a','🛡 Armor'],['flags','🚩 Banners'],['trophies','🏆 Trophies'],['sponsors','🎭 Editors'],['specials','⭐ Invitationals'],['rosters','📚 Roster sets'],['names','🎲 Names']],ST_GROUPS,ST.tab==='gear'?'gear:'+(ST.gearSub||'w'):ST.tab,k=>`data-st="tab" data-v="${k}"`,'tabs sttabs');
  /* v0.21: like the Spectators tab, every creation tab opens READY TO CREATE, with your saved creations listed beneath */
  if(ST.view==='edit'&&ST.draft&&['chars','npcs','events'].includes(ST.tab)){const ed=ST.tab==='chars'?charEditorHTML():ST.tab==='npcs'?npcEditorHTML():eventEditorHTML();
    const lbl={chars:'characters',npcs:'beasts',events:'events'}[ST.tab];const n=CUSTOM[ST.tab].length;
    const keep=ST.view,kd=ST.draft;ST.view='list';ST.draft=null;const lst=studioHTML().slice(tabs.length).replace(/^<p>[\s\S]*?<\/p>/,'').replace(ST.tab==='chars'?/^\s*<div class="mbtns" style="margin:0 0 10px">[\s\S]*?<\/div>/:/^$/,'');ST.view=keep;ST.draft=kd;
    return tabs+ed+`<div class="stlist"><h4>Your ${lbl} · ${n}</h4>${lst}</div>`}
  if(ST.tab==='classes'&&typeof classStudioHTML==='function')return tabs+classStudioHTML();
  if(ST.tab==='lanistas'&&typeof lanistaStudioHTML==='function')return tabs+lanistaStudioHTML();
  if(ST.tab==='tokens')return tabs+tokenStudioHTML();
  if(ST.tab==='tourneys')return tabs+tourneyStudioHTML();
  if(ST.tab==='cohorts')return tabs+cohortStudioHTML();
  if(ST.tab==='specials')return tabs+specialOnlyHTML();
  if(ST.tab==='rosters')return tabs+rosterStudioHTML();
  if(ST.tab==='gear')return tabs+gearStudioHTML();
  if(ST.tab==='flags')return tabs+flagStudioHTML();
  if(ST.tab==='trophies')return tabs+trophyStudioHTML();
  if(ST.tab==='sponsors')return tabs+sponsorStudioHTML();
  if(ST.tab==='all'){ // v0.22: everything you have made, in one compact table
    const specs=(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).filter(r=>r.custom&&!r.recruited);
    const st=c=>c.status==='fallen'?'✝ Fallen':c.status==='freed'?'🗡 Freed':c.rolls!==false?'📜 On the rolls':'✎ Design only';
    /* v0.37: EVERY designer's work, gathered dynamically — add a designer and its creations appear here */
    const ico=h=>`<span style="display:inline-block;width:30px;text-align:center;vertical-align:middle">${h}</span>`;
    const rows=[...CUSTOM.chars.map(c=>({t:'Character',k:'chars',id:c.id,icon:portraitHTML(c,'xs'),n:c.name,d:`${esc(c.city||'')} · ${ABILITIES[c.abil||'none']?ABILITIES[c.abil||'none'][0]:''} · ${(c.events||[]).length} events`,s:st(c),u:c.updated||c.created||''})),
      ...CUSTOM.npcs.map(n=>{const T=npcType(n);return {t:'Beast',k:'npcs',id:n.id,icon:cnTokHTML(n,24),n:n.name,d:`${esc(T.n)} · ${T.hp} HP · atk ${T.ap} · move ${T.mv}`,s:n.locked?'🔒 locked':'',u:n.updated||n.created||''}}),
      ...CUSTOM.events.map(e=>({t:'Event',k:'events',id:e.id,icon:'<span style="font-size:18px">🏟</span>',n:e.name,d:`${e.min||''}${e.max&&e.max!==e.min?'–'+e.max:''} players · ${(e.rounds||[]).length} round${(e.rounds||[]).length===1?'':'s'}`,s:e.locked?'🔒 locked':'',u:e.updated||e.created||''})),
      ...specs.map(r=>({t:'Spectator',k:'spect',id:r.id,icon:typeof specFaceSVG==='function'?specFaceSVG(r.look):'',n:r.name,d:`${SPECT_TASTES[r.taste]?SPECT_TASTES[r.taste][0]:''} · ${SPECT_TEMPERS[r.temper]?SPECT_TEMPERS[r.temper][0]:''} · ${r.visits||0} visits`,s:r.banned?'🚫 banned':r.kin?'👪 '+esc(r.kin.rel)+' of '+esc(r.kin.name):'',u:''})),
      ...(CUSTOM.tokens||[]).map(t=>({t:'Token',k:'tokens',id:t.id,icon:ico(typeof figureHTML==='function'?figureHTML(t.spec,28):''),n:t.name,d:`${t.spec&&t.spec.kind==='beast'?'beast':'figure'} · in the token library`,s:'',u:t.updated||''})),
      ...(CUSTOM.weapons||[]).map(c=>{const w=typeof cwBuild==='function'?cwBuild(c):{lv:1,p:0,r:0};return {t:'Weapon',k:'weapons',id:c.id,icon:ico(`<img src="${cwCardURL('cw_'+c.id)}" style="width:30px;border-radius:2px" alt="">`),n:c.name,d:`level ${w.lv} · ${w.shield?`absorbs ${w.absorb} × ${w.uses}`:`power ${w.p} · range ${w.r}`}`,s:c.rolls&&(c.rolls.market||c.rolls.loadout)?'📜 On the rolls':'✎ Design only',u:''}}),
      ...(CUSTOM.armor||[]).map(c=>({t:'Armor',k:'armor',id:c.id,icon:ico(typeof armArtURL==='function'&&ARM['ca_'+c.id]?`<img src="${armArtURL('ca_'+c.id)}" style="width:24px" alt="">`:'🛡'),n:c.name,d:`${esc(c.slot||'')} · ${c.ap||0} AP · level ${c.lv||1}`,s:c.rolls&&(c.rolls.market||c.rolls.loadout)?'📜 On the rolls':'✎ Design only',u:''})),
      ...(CUSTOM.flags||[]).map(f=>({t:'Banner',k:'flags',id:f.id,icon:ico(`<img src="${houseFlagURI(f)}" style="width:30px;border-radius:2px" alt="">`),n:f.name,d:`${esc(f.shape)} · “${esc(f.txt||'')}”`,s:'',u:''})),
      ...(CUSTOM.trophies||[]).map(t=>({t:'Trophy',k:'trophies',id:t.id,icon:ico(typeof trophySVG==='function'?trophySVG(t,22):'🏆'),n:t.name,d:esc(t.desc||'')+(typeof rewardText==='function'?' · '+rewardText(t.rewards||{}):''),s:(CUSTOM.events||[]).some(e=>e.trophy===t.id)?'🏟 on an event':'',u:''})),
      ...(CUSTOM.sponsors||[]).map(sp=>({t:'Editor',k:'sponsors',id:sp.id,icon:ico(typeof flavFaceURL==='function'?`<img src="${flavFaceURL('calm',sp)}" style="width:26px;border-radius:3px" alt="">`:'🎭'),n:sp.name,d:esc(sp.title||sp.short||''),s:'',u:''})),...(typeof allRowsExtra==='function'?allRowsExtra():[])];
    const KINDS=[['chars','Characters'],['npcs','Beasts'],['events','Events'],['spect','Spectators'],['tokens','Tokens'],['weapons','Weapons'],['armor','Armor'],['flags','Banners'],['trophies','Trophies'],['sponsors','Editors'],['tourneys','Tournaments'],['specials','Special events'],['pairings','Cohorts'],['rosters','Roster sets']];
    const f=ST.allFilter||'';const q=(ST.allQ||'').toLowerCase();const vis=rows.filter(r=>(!f||r.k===f)&&(!q||String(r.n).toLowerCase().includes(q)));
    return tabs+`<div class="acts" style="align-items:center;margin-bottom:6px"><input class="tin" id="allQ" placeholder="Search by name…" value="${esc(ST.allQ||'')}" style="flex:1"><div class="seg" style="flex-wrap:wrap">${[['','All · '+rows.length],...KINDS.map(([k,l])=>[k,l+' · '+rows.filter(r=>r.k===k).length]).filter(([k,l])=>!/ · 0$/.test(l)||ST.allFilter===k)].map(([k,l])=>`<button type="button" data-st="allf" data-v="${k}" class="${f===k?'on':''}">${l}</button>`).join('')}</div></div>
      <div style="max-height:60vh;overflow:auto"><table class="tally compact"><tr><th></th><th>Name</th><th>Type</th><th>Details</th><th>Status</th><th>Updated</th><th></th></tr>${vis.map(r=>`<tr><td>${r.icon}</td><td><b>${esc(r.n||'')}</b></td><td class="rc-sub">${r.t}</td><td class="rc-sub">${r.d}</td><td class="rc-sub">${r.s}</td><td class="rc-sub">${esc(r.u)}</td><td><button class="btn" type="button" data-st="allopen" data-v="${r.k}|${esc(r.id)}" style="padding:2px 8px">Open</button></td></tr>`).join('')||'<tr><td colspan="7" class="rc-sub">Nothing made yet — every tab to the right starts ready to create.</td></tr>'}</table></div>`}
  if(ST.tab==='spect'){
    const SPD=ST.spd||(ST.spd=blankSpec());
    const customs=(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).filter(r=>r.custom&&!r.recruited);
    return tabs+`<p>Hand-craft a <b>regular</b> for the stands: they join the crowd pool like anyone else — attending events, forming grudges, quitting in disgust — and appear in the Spectator roster (🌍 Imperium window, T key). ${customTag()}</p>
     <div class="setup-grid" style="grid-template-columns:minmax(0,170px) minmax(0,1fr)"><div style="text-align:center"><div class="rc-sub" style="font:600 10px var(--mono);letter-spacing:.1em">IN THE STANDS</div><span style="display:inline-block;transform:scale(3.4);transform-origin:top center;width:24px;height:24px;margin:14px 0 46px">${typeof specFaceSVG==='function'?specFaceSVG(SPD.look):''}</span><div class="rc-sub" style="font:600 10px var(--mono);letter-spacing:.1em;margin-top:4px">IN THE CITY</div>${typeof specFig==='function'?figureHTML(specFig(SPD.look),128):''}<div class="rc-sub" style="font-size:10.5px;margin-top:2px">one person, two renders — the face fills the tiers, the figure walks the squares</div><div class="mbtns" style="justify-content:center"><button class="btn" type="button" data-st="sprand">🎲 Randomize<small>new face, taste and temper</small></button></div></div><div>
      <div class="formgrid"><label>Name<span style="display:flex;gap:4px"><input class="tin" id="spName" data-spf="name" value="${esc(SPD.name)}" maxlength="30">${diceBtn('#spName')}</span></label>
       <label>Taste${fSel('@sptaste',Object.entries(SPECT_TASTES).map(([k,v])=>[k,`${v[0]} — ${v[1]}`]),SPD.taste)}</label>
       <label>Temper${fSel('@sptemper',Object.entries(SPECT_TEMPERS).map(([k,v])=>[k,`${v[0]} — ${v[1]}`]),SPD.temper)}</label>
       <label>Skin${fSel('@spskin',SKINS.map((v,i)=>[v,SKIN_NAMES[i]||'Tone '+(i+1)]),SPD.look.skin)}</label>
       <label>Hair${fSel('@sphair',HAIRS.map((v,i)=>[v,HAIR_NAMES[i]||'Shade '+(i+1)]),SPD.look.hair)}</label>
       <label>Headwear${fSel('@sphat',[['','None'],['pileus','Pileus cap'],['straw','Straw sun-hat'],['hood','Traveler\u2019s hood'],['wreath','Laurel wreath'],['veil','Matron\u2019s veil'],['helm','Old legion helmet'],['turban','Eastern turban']],SPD.look.hat||'')}</label>
       <label>Tunic (under) color<span style="display:flex;gap:6px;align-items:center"><input type="color" data-f="@sptunic" value="${SPD.look.tunic||tunicOf(SPD.look,SPD.city)}" style="width:44px;height:30px;border:0;background:none;padding:0"><span class="rc-sub">default: their city's wool</span></span></label>
       <label>Mantle color<span style="display:flex;gap:6px;align-items:center"><input type="color" data-f="@sprobe" value="${SPD.look.robe||robeOf(SPD.look)}" style="width:44px;height:30px;border:0;background:none;padding:0">${fSel('@sprobep',ROBES.map((v,i)=>[v,ROBE_NAMES[i]]),SPD.look.robe||'')}</span></label></div>
      <div class="chkgrid" style="margin-top:6px">${fChk('@spfem',SPD.look.fem,'Female')}${fChk('@spbeard',SPD.look.beard,'Beard')}${fChk('@splong',SPD.look.long,'Long hair')}${fChk('@sptrouble',SPD.trouble,'Troublemaker (the ushers watch them; quicker to throw stones)')}</div>
      <div class="card2" style="margin-top:8px"><b style="font-size:13px">👪 Family in the arena</b> <span class="rc-sub">(optional) — kin arrive in family colors whenever this gladiator fights, and grieve if they fall</span>
       <div class="formgrid" style="margin-top:6px"><label>Kin of<select data-f="@spkinname"><option value="">— nobody —</option>${(typeof LUDUS_CACHE!=='undefined'?LUDUS_CACHE:[]).map(g=>`<option value="${esc(g.name)}" ${SPD.kin&&SPD.kin.name===g.name?'selected':''}>${esc(g.name)} (${CLASSES[g.cls]?CLASSES[g.cls].name:g.cls})</option>`).join('')}</select></label>
       <label>Relation<select data-f="@spkinrel">${['sibling','parent','child','cousin','spouse','old cellmate'].map(k=>`<option value="${k}" ${SPD.kin&&SPD.kin.rel===k?'selected':''}>${k}</option>`).join('')}</select></label></div>
       ${SPD.kin&&SPD.kin.name?`<div class="rc-sub" style="margin-top:4px">This spectator is the <b>${esc(SPD.kin.rel)}</b> of <b>${esc(SPD.kin.name)}</b>. Their kinfolk in the crowd pool: ${(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE:[]).filter(r=>r.kin&&r.kin.name===SPD.kin.name).map(r=>`${esc(r.name)} (${esc(r.kin.rel)})`).join(', ')||'none yet — a family tree starts somewhere'}.</div>`:''}</div>
      <div class="mbtns"><button class="btn primary" type="button" data-st="spsave">${SPD.id?'Save changes':'Add to the crowd'}</button>${SPD.id?`<button class="btn" type="button" data-st="spnew">New spectator</button>`:''}</div></div></div>
     <h4>Your custom regulars</h4>${customs.length?`<div class="list2">${customs.map(r=>`<div class="lrow">${typeof specFaceSVG==='function'?specFaceSVG(r.look):''}<div class="t"><b>${esc(r.name)}</b> ${customTag()}${r.trouble?' <span style="color:var(--blood2);font-size:11px">troublemaker</span>':''}<small>${SPECT_TASTES[r.taste][0]} · ${SPECT_TEMPERS[r.temper][0]} · ${r.visits||0} visits${r.banned?' · BANNED':''}</small></div><div class="a"><button class="btn" type="button" data-st="spedit" data-id="${esc(r.id)}">Edit</button><button class="btn" type="button" data-st="spdel" data-id="${esc(r.id)}">Delete</button></div></div>`).join('')}</div>`:'<p style="color:var(--muted)">None yet. The organic regulars live in the 🌍 Imperium window.</p>'}`;
  }
  if(ST.tab==='names'){if(!ST.names.length)ST.names=Array.from({length:24},()=>genName());return tabs+nameGenHTML(ST.names)+`<div class="mbtns"><button class="btn primary" type="button" data-st="rollnames">Roll 24 more names</button></div>`}
  if(ST.tab==='chars')return tabs+`<p>Create and track custom characters, as on the character sheet (p.60): portrait, name, home city, nickname, ability, Flavius Fidelis, trophy count, Royal Reserve, favorite weapons, backstory and event history. Loadouts are built from real armor tokens and weapon cards within a ${CHAR_BUDGET}-point budget (the eight classes cost 14 to 24). Custom characters can fight in any event that allows classes. ${customTag()}</p>
    <div class="mbtns" style="margin:0 0 10px"><button class="btn primary" type="button" data-st="new">New character</button><button class="btn" type="button" data-st="random">Generate a random character</button></div>
    ${CUSTOM.chars.length?`<div class="list2">${CUSTOM.chars.map(c=>`<div class="lrow" style="--pc:${c.color}">${portraitHTML(c,'sm')}<div class="t"><b>${esc(c.name)}</b> ${customTag(c)}<small>“${esc(c.nickname||'')}” · ${esc(c.city||'')} · ${ABILITIES[c.abil||'none'][0]}${c.weak&&c.weak!=='none'?' · '+WEAKNESSES[c.weak][0]:''}</small><small>🏆 ${c.trophies||0} trophies · RR ${c.rr||0} · ${(c.events||[]).length} events${c.ff?' · Flavius Fidelis':''}</small><small>${c.status==='fallen'?`<b style="color:var(--blood2)">✝ Fallen</b> — ${esc((c.fell&&c.fell.fate)||'')}${c.fell&&c.fell.at?' at '+esc(c.fell.at):''}. Struck from the rolls; copy the design to raise a successor.`:c.status==='freed'?'<b style="color:var(--gold2)">🗡 Freed</b> — retired with the rudis.':onRolls(c)?'<b style="color:#8fe07a">📜 On the rolls</b> — can be fielded in New event and joins new Manager careers.':'<b style="color:var(--muted)">✎ Design only</b> — not yet on the rolls.'}</small></div><div class="a">${!c.status||c.status==='active'?`<button class="btn ${onRolls(c)?'':'primary'}" type="button" data-st="rolls" data-id="${c.id}">${onRolls(c)?'Remove from the rolls':'📜 Add to the rolls'}</button>`:''}<button class="btn" type="button" data-st="play" data-id="${c.id}" ${onRolls(c)?'':'disabled title="Add them to the rolls first"'}>Play</button>${lockBtn(c)}<button class="btn" type="button" data-st="edit" data-id="${c.id}" ${c.locked?'disabled title="Locked: unlock first"':''}>Edit</button><button class="btn" type="button" data-st="dup" data-id="${c.id}">Copy</button><button class="btn" type="button" data-st="del" data-id="${c.id}" ${c.locked?'disabled title="Locked: unlock first"':''}>Delete</button></div></div>`).join('')}</div>`:'<p style="color:var(--muted)">No custom characters yet.</p>'}`;
  if(ST.tab==='npcs')return tabs+`<p>Design your own beasts for custom events: stats, rewards, behavior (guard a zone, hunt the closest gladiator, or hunt the highest Crowd Favor like Commodus), flight, taming and Initial / Raged / Fazed behavior states. ${customTag()}</p>
    <div class="mbtns" style="margin:0 0 10px"><button class="btn primary" type="button" data-st="new">New beast</button></div>
    ${CUSTOM.npcs.length?`<div class="list2">${CUSTOM.npcs.map(n=>{const T=npcType(n);return `<div class="lrow" style="--pc:${T.col}">${cnTokHTML(n,38)}<div class="t"><b>${esc(n.name)}</b> ${customTag()}<small>${esc(T.n)} · ${T.hp} HP · attack ${T.ap} · range ${T.rng} · move ${T.mv}${T.fly?' · flies':''}${T.tameable?' · tameable':''}</small><small>${{zone:'guards a zone',hunt:'hunts the closest gladiator',cf:'hunts the highest CF'}[n.beh||'zone']} · slain: ${T.coin} coin, ${T.cf} CF</small></div><div class="a">${lockBtn(n)}<button class="btn" type="button" data-st="edit" data-id="${n.id}" ${n.locked?'disabled title="Locked: unlock first"':''}>Edit</button><button class="btn" type="button" data-st="dup" data-id="${n.id}">Copy</button><button class="btn" type="button" data-st="del" data-id="${n.id}" ${n.locked?'disabled title="Locked: unlock first"':''}>Delete</button></div></div>`}).join('')}</div>`:'<p style="color:var(--muted)">No custom beasts yet.</p>'}${beastGalleryHTML()}`;
  return tabs+`<p>Design events like the custom events sheet (p.64): player count, rounds with zone and PvE / PvP / CF / CA flags, end conditions, time limits, offering tokens, allowed classes, NPCs and a full board layout with up to 12 pillars, Blessings pots, spikes, tunnels, the chest, Golden Eagles, beasts, offerings, keys, weapons and armor. ${customTag()}</p>
    <div class="mbtns" style="margin:0 0 10px"><button class="btn primary" type="button" data-st="new">New event</button></div>
    ${CUSTOM.events.length?`<div class="list2">${CUSTOM.events.map(e=>{const d=EVENTS['ce_'+e.id]||eventDef(e);return `<div class="lrow" style="--pc:var(--gold)"><div class="t"><b>${esc(e.name)}</b> ${customTag()}<small>${d.min===d.max?d.min:d.min+'–'+d.max} players · ${{ffa:'free-for-all',teams:'teams',coop:'co-op vs beasts'}[e.mode]} · ${e.rounds.length} round${e.rounds.length>1?'s':''} · ${e.layout.pillars.length} pillars · ${e.layout.npcs.length} beasts</small><small>${d.rounds.map((r,i)=>`R${i+1} ${esc(r.n)}: ${(END_CONDS.find(x=>x[0]===r.end)||['',''])[1].replace(/\bN\b/,r.endN)}`).join(' · ')}</small></div><div class="a"><button class="btn" type="button" data-st="play" data-id="${e.id}">Play</button>${lockBtn(e)}<button class="btn" type="button" data-st="edit" data-id="${e.id}" ${e.locked?'disabled title="Locked: unlock first"':''}>Edit</button><button class="btn" type="button" data-st="dup" data-id="${e.id}">Copy</button><button class="btn" type="button" data-st="del" data-id="${e.id}" ${e.locked?'disabled title="Locked: unlock first"':''}>Delete</button></div></div>`}).join('')}</div>`:'<p style="color:var(--muted)">No custom events yet.</p>'}`;
}
function weaponOpts(maxLv=3,none='None'){return [['',none],...Object.entries(W).filter(([k,w])=>w.lv>=1&&w.lv<=maxLv&&!w.limb&&(!w.custom||w.cwLoadout)).sort((a,b)=>a[1].lv-b[1].lv||a[1].n.localeCompare(b[1].n)).map(([k,w])=>[k,`${w.custom?'✦ ':''}L${w.lv} · ${w.n} (${w.shield&&!w.p?'shield':'P'+w.p+' R'+w.r})${w.custom?' · custom':''}`])]}
function armorOpts(filter){return [['','None'],...Object.entries(ARM).filter(([k,a])=>filter(a)).sort((a,b)=>a[1].lv-b[1].lv||a[1].ap-b[1].ap).map(([k,a])=>[k,`L${a.lv} · ${a.n} · ${a.ap} AP${a.bonus?' +'+Object.values(a.bonus).join('/'):''}`])]}
function charEditorHTML(){
  const c=ST.draft;const cost=charCost(c);const over=cost>CHAR_BUDGET&&!c.sandbox;
  const A=c.arm;
  const armRow=s=>`<div class="card2"><div class="sect" style="margin-top:0">${s==='rarm'?'Right arm':'Left arm'}</div><div class="formgrid" style="grid-template-columns:1fr 1fr">
     <label>Upper${fSel(`arm.${s}.upper`,armorOpts(a=>a.slot==='arm'&&a.pt==='upper'),A[s].upper)}</label><label>Lower${fSel(`arm.${s}.lower`,armorOpts(a=>a.slot==='arm'&&a.pt==='lower'&&!a.stack),A[s].lower)}</label></div>
     <div class="chkgrid" style="margin-top:6px">${fChk(`arm.${s}.wraps`,A[s].wraps,'Padded wraps (stackable)')}${fChk(`arm.${s}.cestus`,A[s].cestus,'Cestus (+1 damage)')}</div></div>`;
  return `<div class="setup-grid" style="grid-template-columns:minmax(0,260px) minmax(0,1fr)">
   <div><div class="mbtns chartop" style="margin:0 0 8px;justify-content:center"><button class="btn primary" type="button" data-st="new">✚ New character</button><button class="btn" type="button" data-st="random">🎲 Randomize character</button></div><div id="stPortrait" style="display:flex;justify-content:center">${portraitHTML(c,'lg')}</div>
    <div class="formgrid" style="grid-template-columns:1fr 1fr;margin-top:8px">
     <label>Skin${fSel('portrait.skin',SKINS.map((v,i)=>[v,SKIN_NAMES[i]||'Tone '+(i+1)]),c.portrait.skin)}</label><label>Hair${fSel('portrait.hair',HAIRS.map((v,i)=>[v,HAIR_NAMES[i]||'Shade '+(i+1)]),c.portrait.hair)}</label>
     <label>Headgear${fSel('portrait.helm',HELMS,c.portrait.helm)}</label><label>Backdrop${fSel('portrait.bg',BGS.map((v,i)=>[v,BG_NAMES[i]||'Backdrop '+(i+1)]).concat(typeof FLAGS!=='undefined'?Object.entries(FLAGS).map(([k,F])=>['flag:'+k,'🏳 City banner · '+F.n]):[]).concat((CUSTOM.flags||[]).map(f=>['flag:c:'+f.id,(f.fmt==='portrait'?'🖼 Portrait banner · ':'✦ Your banner · ')+(f.name||'untitled')])),c.portrait.bg)}</label>
     <label>Hairstyle${fSel('portrait.hs',HAIRSTYLES,c.portrait.hs||(c.portrait.long?'long':''))}</label><label>Beard${fSel('portrait.bs',BEARDS,c.portrait.bs&&c.portrait.bs!=='none'?c.portrait.bs:(c.portrait.beard?'full':''))}</label>
     <label>Eyes${fSel('portrait.eyes',EYES,c.portrait.eyes||EYES[0][0])}</label><label>Marks${fSel('portrait.mark',MARKS,c.portrait.mark||'')}</label>
     <div style="grid-column:1/-1"><div class="rc-sub" style="font-size:11.5px">Backdrop banners · click one to hang it behind the portrait</div><div class="bgflags">${[...(typeof FLAGS!=='undefined'?Object.entries(FLAGS).map(([k,F])=>['flag:'+k,F.n]):[]),...(CUSTOM.flags||[]).map(f=>['flag:c:'+f.id,'✦ '+(f.name||'your banner')])].map(([k,n])=>{const u=flagURIk(k.slice(5));return u?`<button type="button" class="bgflag ${c.portrait.bg===k?'on':''}" data-st="pbg" data-v="${esc(k)}" title="${esc(n)}"><img src="${u}" alt=""></button>`:''}).join('')}</div></div>
     <label style="grid-column:1/-1">Garb${fSel('portrait.garb',GARBS,c.portrait.garb||'')}</label></div>
    <div class="formgrid" style="grid-template-columns:1fr 1fr;margin-top:6px"><label>Build${fSel('portrait.fem',[['','Gladiator'],['1','Gladiatrix']],c.portrait.fem?'1':'')}</label><label>Expression${fSel('portrait.smile',[['','Stern'],['1','Grin']],c.portrait.smile?'1':'')}</label><label>Earring${fSel('portrait.ear',typeof EARRINGS!=='undefined'?EARRINGS:[['','None'],['1','Gold earring']],c.portrait.ear===true?'1':c.portrait.ear||'')}</label>${typeof NECKS!=='undefined'?`<label>Neck${fSel('portrait.neck',NECKS,c.portrait.neck||'')}</label><label>Face${fSel('portrait.face',FACES,c.portrait.face||'')}</label>`:''}</div>
    <div class="mbtns"><button class="btn" type="button" data-st="rlook">🎲 Random look</button>${c.id?`<button class="btn" type="button" data-st="tokfor" data-v="cc:${c.id}">🗿 Board token</button>`:''}</div><div style="display:flex;justify-content:center;margin-top:4px" title="The board token this character wears">${figureHTML(tokenOfChar(c),96)}</div><label style="display:grid;gap:3px;font-size:12.5px">Board token${fSel('tokenRef',[['',c.token?'Sculpted for this character':'Built from the portrait']].concat(CUSTOM.tokens.map(t=>[t.id,'📚 '+t.name])),c.tokenRef||'')}</label>
    <div class="card2" style="margin-top:8px"><div class="sect" style="margin-top:0">Character sheet</div>
     <div style="font-size:13px;display:grid;gap:3px"><span>Trophy count: <b>${c.trophies||0}</b></span><span>Royal Reserve (RR): <b>${c.rr||0}</b> coin</span><span>Flavius Fidelis: <b>${c.ff?'yes':'not yet'}</b></span><span>Favorite weapons: <b>${[c.R,c.L].filter(Boolean).map(k=>W[k].n).join(', ')||'fists'}</b></span></div>
     ${(c.events||[]).length?`<table class="tally" style="font-size:12.5px"><tr><th>Event</th><th>CF</th><th>Coin</th></tr>${c.events.slice(-8).reverse().map(h=>`<tr><td>${h.won?'☑':'☐'} ${esc(h.event)}${h.custom?' ✦':''}</td><td class="n">${h.cf}</td><td class="n">${h.coin}</td></tr>`).join('')}</table>`:'<p class="hint">Event results are logged here automatically.</p>'}</div>
   </div>
   <div>
    ${typeof charClassPickHTML==='function'?charClassPickHTML(c):''}
    <div class="formgrid">
     <label>Name<span style="display:flex;gap:4px">${fTxt('name',c.name,'id="stName" maxlength="26"')}${diceBtn('#stName')}</span></label>
     <label>Nickname<span style="display:flex;gap:4px">${fTxt('nickname',c.nickname,'id="stNick" maxlength="30"')}<button type="button" class="btn" data-st="rnick" style="padding:4px 8px" aria-label="Generate a nickname">🎲</button></span></label>
     <label>Home city${fSel('city',HOME_CITIES().map(x=>[x,x]),c.city)}</label>
     <label>Color<input type="color" class="tin" data-f="color" value="${esc(c.color)}" style="height:34px;padding:2px"></label>
    </div>
    <h4>CPU personality (when a CPU plays this character)</h4><div class="perspre"><span class="rc-sub">Presets:</span>${Object.entries(PERS_PRESETS).map(([k,v])=>{const on=PERS_KEYS.every(([q])=>c.pers[q]===v.v[q]);return `<button type="button" class="btn tksm ${on?'primary':''}" data-st="perspre" data-v="${k}" title="${PERS_KEYS.map(([q,l])=>l+' '+v.v[q]).join(' · ')}">${esc(v.n)}</button>`}).join('')}<button type="button" class="btn tksm" data-st="perspre" data-v="random" title="Every slider rolled at random">🎲 Random</button></div><div class="perswrap">${PERS_KEYS.map(([k,l,d])=>`<label class="slider" title="${d}"><span>${l}</span><input type="range" min="1" max="100" data-f="pers.${k}" data-num="1" value="${c.pers[k]}"><output>${c.pers[k]}</output></label>`).join('')}</div>
    <h4>Backstory</h4><textarea class="tin" data-f="backstory" id="stBack" maxlength="900" placeholder="Where they come from, what they fight for…">${esc(c.backstory||'')}</textarea><div class="mbtns" style="margin-top:4px"><button class="btn" type="button" data-st="rback">🎲 Write a backstory</button></div>
    <div class="mbtns"><button class="btn primary" type="button" data-st="save">Save character</button><button class="btn" type="button" data-st="cancel">↺ Start a fresh one</button></div>
   </div></div>`;
}
function npcEditorHTML(){
  const n=ST.draft;const T=npcType(n);
  return `<div class="setup-grid" style="grid-template-columns:minmax(0,200px) minmax(0,1fr)"><div style="text-align:center"><div id="stNpcPrev" style="width:120px;height:120px;border-radius:50%;margin:10px auto;display:grid;place-items:center;background:${T.col};color:#fff6e6;font:700 58px var(--display);box-shadow:0 8px 20px rgba(0,0,0,.5)">${esc(T.g)}</div>
    <div style="font:400 20px var(--display);color:var(--gold2)">${esc(n.name)}</div><div class="rc-sub">${esc(T.n)}${T.states?`<br>Initial ≥${T.states[0][0]} HP · Raged ≥${T.states[1][0]} HP (+1 attack, +1 move) · Fazed below`:''}</div><div style="margin-top:6px">${figureHTML(tokenOfNpc(n),110)}</div><label style="display:grid;gap:3px;font-size:12.5px;text-align:left">Board token${fSel('tokenRef',[['',n.token?'Sculpted for this beast':kindKeyOf(n)?`The ${BEAST_KINDS[kindKeyOf(n)].n} figure (matches its kind)`:'Drawn automatically from its kind']].concat(Object.entries(BEAST_KINDS).map(([k,K])=>['k:'+k,'🐾 '+K.n])).concat(['snake','wolf','bear','lion','zora'].map(k=>['d:'+k,'🏟 Default '+k])).concat(CUSTOM.tokens.map(t=>[t.id,'📚 '+t.name])),n.tokenRef||'')}<span class="rc-sub">Pick any existing figure, a library token, or sculpt one of its own.</span></label>${n.id?`<button class="btn" type="button" data-st="tokfor" data-v="cn:${n.id}">🗿 Sculpt its token</button>`:'<div class="rc-sub">Save the beast, then sculpt its token.</div>'}</div>
   <div><div class="formgrid">
    <label>Start from an existing beast${fSel('basePick',[['','— fully custom —'],...Object.keys(NPCT).filter(k=>!k.startsWith('cn_')&&k!=='zora').map(k=>[k,`${NPCT[k].n} (HP ${NPCT[k].hp} · ATK ${NPCT[k].ap} · MV ${NPCT[k].mv})`])],'')}</label>
    <label class="hint" style="align-self:end;margin:0">Picking one copies its stats and look; the name stays yours — call it Bill the Beast Boi if you like.</label>
    <label>Name<span style="display:flex;gap:4px">${fTxt('name',n.name,'id="stNpcName" maxlength="20"')}${diceBtn('#stNpcName')}</span></label><label>Kind of beast<span style="display:flex;gap:4px"><select data-f="kindKey">${Object.entries(BEAST_KINDS).map(([k,K])=>`<option value="${k}" ${kindKeyOf(n)===k?'selected':''}>${esc(K.n)}</option>`).join('')}<option value="custom" ${!kindKeyOf(n)?'selected':''}>Custom kind…</option></select><button class="btn tksm" type="button" data-st="kindstats" title="Set HP, AP, range, movement, rewards and behavior to what this kind of animal usually has">Typical stats</button></span>${!kindKeyOf(n)?fTxt('kind',n.kind,'maxlength="20" placeholder="Name your kind — e.g. Hippogriff"'):''}</label>
    <label>Token letter${fTxt('glyph',n.glyph,'maxlength="1"')}</label><label>Color<input type="color" class="tin" data-f="color" value="${esc(n.color)}" style="height:34px;padding:2px"></label>
    <label>Health ${fNum('hp',n.hp,1,40)}</label><label>Attack (damage per hit) ${fNum('ap',n.ap,1,8)}</label><label>Range ${fNum('rng',n.rng,1,4)}</label><label>Movement ${fNum('mv',n.mv,0,7)}</label>
    <label>Coin when slain ${fNum('coin',n.coin,0,15)}</label><label>CF when slain ${fNum('cf',n.cf,0,10)}</label>
    <label>Behavior${fSel('beh',[['zone','Guards a zone around where it is placed'],['hunt','Hunts the closest gladiator'],['cf','Hunts the gladiator with the most CF']],n.beh)}</label></div>
    <div class="chkgrid" style="margin-top:8px">${fChk('fly',n.fly,'Flies over pillars and units')}${fChk('tameable',n.tameable,'Can be tamed (Tame card, Lyre)')}${fChk('states',n.states,'Behavior states (Initial, Raged, Fazed)')}</div>
    <p class="hint">Beasts attack with 2 hit dice against gladiators; each hit deals their attack value. Place them on the board in the Event Designer.</p>
    <div class="mbtns"><button class="btn primary" type="button" data-st="save">Save beast</button><button class="btn" type="button" data-st="cancel">↺ Start a fresh one</button></div></div></div>`;
}
/* ----- event designer ----- */
const ED_TOOLS=[['pillar','Pillar (P)'],['pot','Blessings pot'],['spike','Spike (S)'],['tunnel','Tunnel (T)'],['chest','Chest (C)'],['eagle','Golden Eagle (GE)'],['start','Start tile'],['npc','Beast'],['offer','Offering'],['key','Arena Key'],['weapon','Weapon'],['armor','Armor'],['coin','Coin pile'],['erase','Eraser']];
function edNpcChoices(){
  const L=ST.draft.layout;const opts=[...BASE_NPCS.map(b=>[b.name,`${b.name} (${NPCT[b.t].n})`]),...SPAWN_NPCS.map(([n,t])=>[n,`${n} (${NPCT[t].n})`]),...CUSTOM.npcs.map(n=>['cn:'+n.id,`${n.name} (${n.kind||'custom'}) ✦`])];
  return opts;
}
function edCell(r,c){
  const L=ST.draft.layout;const pl=L.pillars.find(p=>p.r===r&&p.c===c);let cls='edcell',ic='',sub='',title=[tl(r,c)];
  if(pl){cls+=' pl';ic='🏛';title.push('pillar'+(pl.pot?` with a pot (${pl.pot==='?'?'random blessing':OFFER[pl.pot].n})`:''));if(pl.pot)sub=pl.pot==='?'?'🏺':'🏺'}
  if(L.spikes.some(([a,b])=>a===r&&b===c)){cls+=' sp';ic=ic||'▲';title.push('spike')}
  if(L.tunnels.some(([a,b])=>a===r&&b===c)){cls+=' tu';ic=ic||'◙';title.push('tunnel')}
  if(L.chest&&L.chest[0]===r&&L.chest[1]===c){ic='🧰';title.push('Arena Chest')}
  const si=L.starts.findIndex(x=>x&&x[0]===r&&x[1]===c);let sty='';if(si>=0){cls+=' st';sty=`--sc:${PALETTE[si%8]}`;sub=`P${si+1}`;title.push('start tile '+(si+1))}
  const n=L.npcs.find(x=>x.r===r&&x.c===c);if(n&&NPCT[n.t]){const T=NPCT[n.t];ic=`<span style="display:inline-grid;place-items:center;width:78%;aspect-ratio:1;border-radius:50%;background:${T.col};color:#fff">${esc(T.g)}</span>`;title.push(`${n.name} (${T.n}, ${({zone:'guards zone',hunt:'hunts',cf:'hunts top CF'})[n.beh]||''})`)}
  const its=L.items.filter(x=>x.r===r&&x.c===c);if(its.length){if(!ic)ic=its[0].kind==='offer'&&its[0].key==='eagle'?'🦅':its[0].kind==='offer'?'✚':its[0].kind==='key'?'🔑':its[0].kind==='weapon'?'🗡':its[0].kind==='armor'?'🛡':'¢';if(its.length>1&&!sub)sub='×'+its.length;title.push(its.map(x=>x.kind==='offer'?OFFER[x.key].n+(x.key==='eagle'?'':' ('+OFFER[x.key].s+')'):x.kind==='key'?'Arena Key':x.kind==='weapon'?W[x.key].n:x.kind==='armor'?ARM[x.key].n:x.key+' coin').join(', '))}
  return `<button type="button" class="${cls}" style="${sty}" data-cell="${r},${c}" title="${esc(title.join(' · '))}"><span class="ic">${ic}</span>${sub?`<span class="sub">${sub}</span>`:''}</button>`;
}
function edBoardHTML(){
  const L=ST.draft.layout;const pots=L.pillars.filter(p=>p.pot).length;
  const cells=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)cells.push(edCell(r,c));
  const t=ST.tool,o=ST.opt;
  const toolOpt=t==='pot'?`<label class="fl">Pot contents${fSel('@potKey',[['?','Random blessing from the bag'],...Object.entries(OFFER).filter(([k])=>k!=='key').map(([k,v])=>[k,`${v.n} (${v.s})`])],o.potKey||'?')}</label>`
    :t==='npc'?`<label class="fl">Beast${fSel('@npc',edNpcChoices(),o.npc||'Glykon')}</label><label class="fl">Behavior${fSel('@beh',[['auto','Default for this beast'],['zone','Guards a zone'],['hunt','Hunts the closest gladiator'],['cf','Hunts the most CF']],o.beh||'auto')}</label>`
    :t==='offer'?`<label class="fl">Offering${fSel('@offer',Object.entries(OFFER).filter(([k])=>k!=='key'&&k!=='eagle').map(([k,v])=>[k,`${v.n} (${v.s})`]),o.offer||'elix4')}</label>`
    :t==='weapon'?`<label class="fl">Weapon${fSel('@weapon',weaponOpts(4).slice(1),o.weapon||'gladius')}</label>`
    :t==='armor'?`<label class="fl">Armor token${fSel('@armor',armorOpts(()=>true).slice(1),o.armor||'galea')}</label>`
    :t==='coin'?`<label class="fl">Coin in the pile${fSel('@coin',[[3,'3'],[5,'5'],[8,'8'],[12,'12']],o.coin||5)}</label>`
    :t==='start'?`<label class="fl">Seat${fSel('@seat',Array.from({length:8},(_,i)=>[i,'Player '+(i+1)]),o.seat||0)}</label>`
    :t==='chest'?`<div class="fl">Chest holds (level 4)<div class="chkgrid">${['labrys','psykhe','achilles','lyre'].map(k=>`<label class="chk"><input type="checkbox" data-chestw="${k}" ${(L.chestW||[]).includes(k)?'checked':''}> ${W[k].n}</label>`).join('')}</div></div>`:'';
  return `<div class="setup-grid" style="grid-template-columns:minmax(0,1.15fr) minmax(0,1fr)"><div>
     <div class="edgrid" id="edGrid">${cells.join('')}</div>
     <p class="hint">Click a tile to use the tool. Rows A-L run top to bottom and columns 1-12 left to right, as on the arena board; the center row and column are the dividing lines between quadrants.</p></div>
    <div><div class="palette">${ED_TOOLS.map(([k,l])=>`<button type="button" class="btn ${ST.tool===k?'on':''}" data-st="tool" data-v="${k}">${l}</button>`).join('')}</div>
     <div style="display:grid;gap:6px;margin-top:8px">${toolOpt}</div>
     <div class="badges" style="margin-top:10px"><span class="badge ${L.pillars.length>12?'bad':''}">Pillars ${L.pillars.length}/12</span><span class="badge">Blessings pots ${pots}/${L.pillars.length}</span><span class="badge">Spikes ${L.spikes.length}</span><span class="badge">Tunnels ${L.tunnels.length}</span><span class="badge">Beasts ${L.npcs.length}</span><span class="badge">Items ${L.items.length}</span><span class="badge">Start tiles ${L.starts.filter(Boolean).length}</span></div>
     <div class="card2" style="margin-top:10px"><div class="sect" style="margin-top:0">Blessings of the People</div>
      <div class="bslip"><span>Randomize pots on</span><select class="tin" style="width:auto" id="edRandN">${Array.from({length:Math.min(12,L.pillars.length)+1},(_,i)=>`<option ${i===Math.min(12,L.pillars.length)?'selected':''}>${i}</option>`).join('')}</select><span>of ${L.pillars.length} pillars</span><button type="button" class="btn" data-st="randpots" title="Shuffle the blessings in use across the pillars (adding random pots up to the number chosen)">🎲 Randomize blessings</button></div>
      ${L.pillars.length?`<div class="potlist" id="potList">${L.pillars.map((p,i)=>`<label class="potrow"><span>🏛 ${tl(p.r,p.c)}</span><select class="tin" data-potsel="${i}">${[['','— no pot —'],['?','🏺 Random blessing from the bag'],...Object.entries(OFFER).filter(([k])=>k!=='key').map(([k,v])=>[k,`${v.n} (${v.s})`])].map(([k,l])=>`<option value="${k}" ${(p.pot||'')===k?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`).join('')}</div>`:'<p class="rc-sub" style="margin:6px 0 0">Place pillars on the board first — each can carry one Blessings pot.</p>'}
      ${fChk('eaglePot',ST.draft.eaglePot,'Guarantee a Golden Eagle among the random pots')}</div>
     <div class="mbtns"><button type="button" class="btn" data-st="classic">Classic arena layout</button><button type="button" class="btn" data-st="clearboard">Clear the board</button><button type="button" class="btn" data-st="randboard">🎲 Random arena</button></div></div></div>`;
}
function edRulesHTML(){
  const e=ST.draft;
  const round=(r,i)=>`<div class="card2"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-family:var(--display);color:var(--gold2)">Round ${i+1}</b>${e.rounds.length>1?`<button type="button" class="btn" data-st="rmround" data-i="${i}" style="padding:2px 8px">Remove</button>`:''}</div>
    <div class="formgrid" style="margin-top:6px"><label>Name${fTxt(`rounds.${i}.n`,r.n,'maxlength="24"')}</label><label>Zone${fSel(`rounds.${i}.zone`,[[1,'Zone 1 · whole arena 13×13'],[2,'Zone 2 · 9×9'],[3,'Zone 3 · 5×5']],r.zone)}</label>
     <label>End condition${fSel(`rounds.${i}.end`,END_CONDS,r.end)}</label>${['npc','rot','cf','survive'].includes(r.end)?`<label>N = ${fNum(`rounds.${i}.endN`,r.endN||4,1,r.end==='cf'?60:30)}</label>`:''}</div>
    <div class="chkgrid" style="margin-top:6px">${fChk(`rounds.${i}.pve`,r.pve,'PVE')}${fChk(`rounds.${i}.pvp`,r.pvp,'PVP')}${fChk(`rounds.${i}.cf`,r.cf,'CF (crowd favor can be spent)')}${fChk(`rounds.${i}.ca`,r.ca,'CA (class abilities)')}</div>
    ${i<e.rounds.length-1?`<div class="formgrid" style="margin-top:6px"><label>Survivors get coin ${fNum(`rounds.${i}.reward.coin`,(r.reward||{}).coin||0,0,10)}</label><label>…and CF ${fNum(`rounds.${i}.reward.cf`,(r.reward||{}).cf||0,0,10)}</label><label>…and arena cards ${fNum(`rounds.${i}.reward.cards`,(r.reward||{}).cards||0,0,4)}</label></div>`:''}</div>`;
  return `<div class="formgrid"><label>Event name${fTxt('name',e.name,'maxlength="40"')}</label>
    <label>Mode${fSel('mode',[['ffa','Free-for-all'],['teams','Teams (set in setup)'],['coop','Co-op: everyone vs the beasts']],e.mode)}</label>
    <label>Players, fewest ${fNum('min',e.min,1,8)}</label><label>Players, most ${fNum('max',e.max,1,8)}</label>
    <label>Arena location${fSel('loc',LOCATIONS.slice(1).map((L,i)=>[i+1,`${i+1} · ${L.n}`]),e.loc)}</label><label>Win reward (CF) ${fNum('win',e.win,0,40)}</label></div>
   <h4>Rounds</h4><div style="display:grid;gap:8px">${e.rounds.map(round).join('')}</div>${e.rounds.length<3?`<div class="mbtns"><button type="button" class="btn" data-st="addround">Add a round</button></div>`:''}
   <h4>Time constraints</h4><div class="formgrid"><label>Turn rotations (0 = none) ${fNum('limits.rot',e.limits.rot||0,0,60)}</label><label>Minutes (0 = none) ${fNum('limits.min',e.limits.min||0,0,120,5)}</label></div>
   <h4>Arena rules</h4><div class="chkgrid">${fChk('deck',e.deck,'Arena deck (arena cards)')}${fChk('mandata',e.mandata,'Mandati Flavi secret objectives')}${fChk('market',e.market,'Market open')}${fChk('truce',e.truce,'Truces allowed')}${fChk('optOffers',e.optOffers,'Optional offerings in the bag')}</div>
   <div class="formgrid" style="margin-top:8px"><label>Chariot offering tokens added to the bag ${fNum('chariotOffers',e.chariotOffers||0,0,12)}</label><label>Market prices (%) ${fNum('priceMul',e.priceMul,50,200,10)}</label><label>Spectators ${fNum('spect',e.spect||0,0,48)}</label></div>
   <h4>Beasts</h4><div class="formgrid"><label>Beast health (%) ${fNum('npcHp',e.npcHp,50,250,10)}</label><label>Beast damage (±) ${fNum('npcDmg',e.npcDmg||0,-2,3)}</label></div>
   <h4>Starting bonuses for every gladiator</h4><div class="formgrid"><label>Coin ${fNum('start.coin',e.start.coin||0,0,20)}</label><label>Crowd Favor ${fNum('start.cf',e.start.cf||0,0,20)}</label><label>Arena Keys ${fNum('start.keys',e.start.keys||0,0,4)}</label><label>Extra HP to place ${fNum('start.hp',e.start.hp||0,0,8)}</label><label>Extra AP to place ${fNum('start.ap',e.start.ap||0,0,8)}</label></div>
   <h4>Notes</h4><textarea class="tin" data-f="notes" maxlength="600" placeholder="Story, special rules, what the crowd expects…">${esc(e.notes||'')}</textarea>`;
}
function edRosterHTML(){
  const e=ST.draft;const L=e.layout;const has=name=>L.npcs.some(n=>n.name===name);
  return `<h4>Class loadouts (select allowed classes)</h4><div class="chkgrid">${BASE_CLS.map(k=>`<label class="chk"><input type="checkbox" data-cls="${k}" ${e.classes.includes(k)?'checked':''}> ${CLASSES[k].name}</label>`).join('')}${fChk('allowCustom',e.allowCustom,'Custom characters ✦')}</div>
   <div class="formgrid" style="margin-top:8px"><label>Gladiators start with${fSel('loadout',[['class','Their class loadout'],['empty','Nothing (fists and a loincloth)'],['draft','A snake draft of market gear']],e.loadout)}</label>${e.loadout==='draft'?`<label>Draft picks each ${fNum('draftPicks',e.draftPicks,1,8)}</label>`:''}</div>
   <h4>NPCs (select NPCs)</h4><p class="hint" style="margin-top:0">Ticking places the beast on the board at its usual spot; move it with the Beast tool. Untick to remove it.</p>
   <div class="chkgrid">${[...BASE_NPCS.map(b=>b.name),...SPAWN_NPCS.map(x=>x[0])].map(nm=>`<label class="chk"><input type="checkbox" data-npcsel="${nm}" ${has(nm)?'checked':''}> ${nm}</label>`).join('')}${CUSTOM.npcs.map(n=>`<label class="chk"><input type="checkbox" data-npcsel="cn:${n.id}" ${L.npcs.some(x=>x.t==='cn_'+n.id)?'checked':''}> ${esc(n.name)} ✦</label>`).join('')}</div>
   ${e.deck?`<h4>Arena deck spawn cards</h4><div class="chkgrid">${Object.keys(e.deckSpawns).map(k=>fChk('deckSpawns.'+k,e.deckSpawns[k],`${k} card stays in the deck`)).join('')}</div>`:''}`;
}
function eventEditorHTML(){
  const e=ST.draft;const errs=eventErrors(e);
  const sub=`<div class="seg" role="tablist" style="margin-bottom:10px">${[['board','Board layout'],['rules','Rounds & rules'],['roster','Classes & NPCs']].map(([k,l])=>`<button type="button" data-st="sub" data-v="${k}" class="${ST.sub===k?'on':''}">${l}</button>`).join('')}</div>`;
  return `<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:6px"><b style="font:400 20px var(--display);color:var(--gold2)">${esc(e.name||'New event')}</b>${customTag()}</div>${sub}<div id="edPane">${ST.sub==='rules'&&typeof trophyOptions==='function'?`<div class="card2" style="margin-bottom:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">${e.trophy&&trophyDef(e.trophy)?trophySVG(trophyDef(e.trophy),46):'<span style="font-size:30px">🏆</span>'}<label style="flex:1;min-width:220px">Trophy for the winner${fSel('trophy',trophyOptions(),e.trophy||'')}</label>${typeof sponsorOptions==='function'?`<label style="flex:1;min-width:200px">Editor in the box${fSel('sponsor',sponsorOptions(),e.sponsor||'')}</label>`:''}<label style="flex:1 1 100%;display:flex;gap:6px;align-items:center"><input type="checkbox" data-f="nofates" ${e.nofates?'checked':''}> <span><b>Fate-free sand</b> — nobody is condemned, spared or freed after this event (it still counts as a win or loss). Leave unticked to play by the Fate table, as the printed game does — in single events, tournaments and Manager-mode invitationals alike.</span></label><span class="rc-sub" style="flex:2;min-width:220px">${e.trophy&&trophyDef(e.trophy)?`${esc(trophyDef(e.trophy).desc||'')} · rewards: ${rewardText(trophyDef(e.trophy).rewards)}. Win this event and it goes into the Annals' trophy case — and hosts may invite your Manager stable to it.`:'Design one in Creator Studio → 🏆 Trophies, or pick from the built-in silverware.'} <button class="btn tksm" type="button" data-st="tab" data-v="trophies">Trophy designer</button></span></div>`:''}${ST.sub==='board'?edBoardHTML():ST.sub==='rules'?edRulesHTML():edRosterHTML()}</div>
   ${errs.length?`<p style="color:var(--blood2);margin-top:8px">${errs.map(esc).join(' ')}</p>`:''}
   <div class="mbtns"><button class="btn primary" type="button" data-st="save" ${errs.length?'disabled':''}>Save event</button><button class="btn" type="button" data-st="saveplay" ${errs.length?'disabled':''}>Save and play</button><button class="btn" type="button" data-st="cancel">↺ Start a fresh one</button></div>`;
}
function eventErrors(e){
  const out=[];const L=e.layout;
  if(!String(e.name||'').trim())out.push('Name the event.');
  if(L.pillars.length>12)out.push('At most 12 pillars.');
  if(+e.min>+e.max)out.push('The fewest players cannot exceed the most.');
  {const n=L.starts.filter(Boolean).length;if(!n)out.push('Place at least one start tile — an event needs somewhere for a gladiator to stand.');else if(n<+e.max)out.push(`Place ${e.max} start tiles (one per player) with the Start tile tool — ${n} placed.`)}
  if(!e.classes.length&&!(e.allowCustom&&CUSTOM.chars.length))out.push('Allow at least one class.');
  if(e.mode==='coop'&&e.rounds.some(r=>r.end==='alive1'||r.end==='alive2'))out.push('Co-op events need a beast, rotation or CF end condition.');
  return out;
}
function edApplyCell(r,c){
  const e=ST.draft,L=e.layout,t=ST.tool,o=ST.opt;const at=([a,b])=>a===r&&b===c;
  const pl=L.pillars.find(p=>p.r===r&&p.c===c);
  const clearUnits=()=>{L.npcs=L.npcs.filter(n=>!(n.r===r&&n.c===c))};
  if(t==='pillar'){if(pl)L.pillars=L.pillars.filter(p=>p!==pl);else{if(L.pillars.length>=12)return;clearUnits();L.spikes=L.spikes.filter(x=>!at(x));L.pillars.push({r,c,pot:null})}}
  if(t==='pot'){if(!pl){if(typeof mToast==='function')mToast('🏺 A Blessings pot must sit on a <b>pillar</b> — place a pillar there first (Pillar tool).');return}pl.pot=pl.pot?null:(o.potKey||'?')} // v0.44: feedback, never a silent click
  if(t==='spike'){if(L.spikes.some(at))L.spikes=L.spikes.filter(x=>!at(x));else if(!pl)L.spikes.push([r,c])}
  if(t==='tunnel'){if(L.tunnels.some(at))L.tunnels=L.tunnels.filter(x=>!at(x));else L.tunnels.push([r,c])}
  if(t==='chest'){L.chest=L.chest&&at(L.chest)?null:[r,c]}
  if(t==='eagle'){const i=L.items.findIndex(x=>x.r===r&&x.c===c&&x.kind==='offer'&&x.key==='eagle');if(i>=0)L.items.splice(i,1);else L.items.push({kind:'offer',key:'eagle',r,c})}
  if(t==='start'){const s=+(o.seat||0);if(pl)return;L.starts[s]=[r,c];o.seat=(s+1)%8}
  if(t==='npc'){if(pl)return;const ch=o.npc||'Glykon';let def;
    if(ch.startsWith('cn:')){const id=ch.slice(3);const cn=CUSTOM.npcs.find(x=>x.id===id);if(!cn)return;const cnt=L.npcs.filter(x=>x.t==='cn_'+id).length;def={key:'cn_'+id+'_'+cnt,t:'cn_'+id,name:cnt?`${cn.name} ${['II','III','IV','V','VI'][cnt-1]||cnt+1}`:cn.name}}
    else{const b=BASE_NPCS.find(x=>x.name===ch);const sp=SPAWN_NPCS.find(x=>x[0]===ch);def={key:ch,t:b?b.t:sp[1],name:ch};L.npcs=L.npcs.filter(n=>n.name!==ch)}
    clearUnits();L.npcs.push({...def,r,c,beh:o.beh&&o.beh!=='auto'?o.beh:NPCT[def.t].scan?'hunt':NPCT[def.t].huntCF?'cf':'zone'})}
  if(t==='offer')L.items.push({kind:'offer',key:o.offer||'elix4',r,c});
  if(t==='key')L.items.push({kind:'key',key:'key',r,c});
  if(t==='weapon'&&!pl)L.items.push({kind:'weapon',key:o.weapon||'gladius',r,c});
  if(t==='armor'&&!pl)L.items.push({kind:'armor',key:o.armor||'galea',r,c});
  if(t==='coin'&&!pl)L.items.push({kind:'coin',key:+(o.coin||5),r,c});
  if(t==='erase'){L.pillars=L.pillars.filter(p=>p!==pl);L.spikes=L.spikes.filter(x=>!at(x));L.tunnels=L.tunnels.filter(x=>!at(x));if(L.chest&&at(L.chest))L.chest=null;clearUnits();L.items=L.items.filter(x=>!(x.r===r&&x.c===c))}
}
function randomArena(){
  const L={pillars:[],tunnels:[],spikes:[],chest:[6,6],chestW:[...CHEST_W],npcs:[],items:[],starts:STARTS.map(x=>[...x])};
  const free=(r,c)=>!(r===6&&c===6)&&!L.starts.some(s=>s[0]===r&&s[1]===c)&&!L.pillars.some(p=>p.r===r&&p.c===c)&&!L.tunnels.some(t=>t[0]===r&&t[1]===c);
  // mirrored in four quadrants so no start is favored
  const mirror=(r,c)=>[[r,c],[c,12-r],[12-r,12-c],[12-c,r]];
  for(let k=0;k<30&&L.pillars.length<12;k++){const r=rnd(6),c=1+rnd(5);if(mirror(r,c).every(([a,b])=>free(a,b)))for(const [a,b] of mirror(r,c))L.pillars.push({r:a,c:b,pot:'?'})}
  for(let k=0;k<20&&L.tunnels.length<4;k++){const r=1+rnd(5),c=1+rnd(5);if(mirror(r,c).every(([a,b])=>free(a,b)))for(const [a,b] of mirror(r,c))L.tunnels.push([a,b])}
  if(Math.random()<.5)for(const [a,b] of mirror(3,6))if(free(a,b))L.spikes.push([a,b]);
  const beasts=shuffle([...BASE_NPCS]).slice(0,2+rnd(5));for(const b of beasts){let [r,c]=b.home;if(!free(r,c))[r,c]=[5,5];L.npcs.push({key:b.name,t:b.t,name:b.name,r,c,beh:'zone'})}
  if(Math.random()<.4)L.npcs.push({key:'Leo',t:'lion',name:'Leo',r:6,c:3,beh:'hunt'});
  return L;
}
/* v0.36 ONE NAME, ONE CREATION (per kind): no two characters, beasts, events, weapons, armor pieces,
   banners, trophies, editors, tokens or spectators may share a name. A clash blocks the save and fills in
   the next free "Name II" — press Save again to keep it. A character and a weapon may share a name. */
const NAME_KINDS={chars:['character',()=>CUSTOM.chars],npcs:['beast',()=>CUSTOM.npcs],events:['event',()=>CUSTOM.events],weapons:['weapon',()=>CUSTOM.weapons],
  armor:['armor piece',()=>CUSTOM.armor],flags:['banner',()=>CUSTOM.flags],trophies:['trophy',()=>CUSTOM.trophies],sponsors:['editor',()=>CUSTOM.sponsors],
  tokens:['token',()=>CUSTOM.tokens],spect:['spectator',()=>(typeof CROWD_CACHE!=='undefined'?CROWD_CACHE.filter(r=>r.custom):[])]};
const nKey9=s=>String(s||'').trim().toLowerCase().replace(/\s+/g,' ');
function nameClash(kind,name,id){const K=NAME_KINDS[kind];if(!K||!nKey9(name))return null;return (K[1]()||[]).find(x=>x&&x.id!==id&&nKey9(x.name)===nKey9(name))||null}
const ROMN9=['II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
function nameSuggest(kind,name,id){const base=String(name).trim().replace(/\s+(II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/,'');for(const rn of ROMN9){const n=base+' '+rn;if(!nameClash(kind,n,id))return n}return base+' '+Date.now().toString(36).slice(-3)}
// returns true when the name is free; otherwise fills in the suggestion (obj.name + any matching input) and warns
function nameGuard(kind,obj,inputSel){const c=nameClash(kind,obj.name,obj.id);if(!c)return true;const sug=nameSuggest(kind,obj.name,obj.id);
  if(typeof mToast==='function')mToast(`⚠ A ${NAME_KINDS[kind][0]} named <b>${esc(obj.name)}</b> already exists — names are unique. Suggested: <b>${esc(sug)}</b> (filled in). Press Save again to keep it, or type another.`);
  obj.name=sug;for(const el of document.querySelectorAll(inputSel||'[data-f="name"]'))el.value=sug;return false}
// one-time pass: older duplicates (from before v0.36) are renamed "Name II", "Name III"…
async function nameDedupeOnce(){try{if(localStorage.getItem('flavius_nameDedupe36'))return}catch(e){return}
  const cols={chars:'customChars',npcs:'customNpcs',events:'customEvents',weapons:'customWeapons',armor:'customArmor',flags:'customFlags',trophies:'customTrophies',sponsors:'customSponsors'};
  const renamed=[];
  for(const [k,col] of Object.entries(cols)){const L=(NAME_KINDS[k][1]()||[]);const seen={};
    for(const x of L){if(!x||!x.name)continue;const kk=nKey9(x.name);if(!seen[kk]){seen[kk]=1;continue}const old=x.name;x.name=nameSuggest(k,x.name,x.id);renamed.push(`${old} → ${x.name}`);await Store.put(col,x.id,x).catch(()=>{})}}
  try{localStorage.setItem('flavius_nameDedupe36','1')}catch(e){}
  if(renamed.length&&typeof mToast==='function')mToast(`✎ Names are unique now. Renamed ${renamed.length} duplicate${renamed.length===1?'':'s'}: ${esc(renamed.slice(0,4).join(' · '))}${renamed.length>4?' …':''}`)}
function stSaveDraft(){
  const d=ST.draft;const col=ST.tab==='chars'?'customChars':ST.tab==='npcs'?'customNpcs':'customEvents';
  if(!d.id)d.id=`${ST.tab[0]}${Date.now().toString(36)}${rnd(1296).toString(36)}`;
  d.updated=new Date().toISOString().slice(0,10);if(!d.created){d.created=d.updated;if(ST.tab==='chars'){d.rolls=false;d.status='active'}}d.custom=true;
  if(ST.tab==='chars'&&!String(d.name).trim())d.name=genName();
  if(ST.tab==='npcs'&&!String(d.name).trim())d.name='Beast';
  if(!nameGuard(ST.tab==='chars'?'chars':ST.tab==='npcs'?'npcs':'events',d))return Promise.resolve(null);
  const list=CUSTOM[ST.tab==='chars'?'chars':ST.tab==='npcs'?'npcs':'events'];const i=list.findIndex(x=>x.id===d.id);if(i>=0)list[i]=JSON.parse(JSON.stringify(d));else list.push(JSON.parse(JSON.stringify(d)));
  registerCustoms();
  return Store.put(col,d.id,JSON.parse(JSON.stringify(d))).then(()=>d);
}
async function openStudio(tab){
  if(modalBusy())return;
  await loadCustoms();await loadLudus().catch(()=>{});await nameDedupeOnce();
  ST={...ST,tab:tab||'all',view:'list',draft:null,names:[]};if(!ST.spd)ST.spd=blankSpec();stReady();
  const v=await modal(`Creator Studio ${customTag()}`,`<div id="studio">${studioHTML()}</div>`,[{label:'Close',value:'close'}],{wide:1,full:1,close:'close',onOpen:done=>{const x=$('#mClose');if(x){x.textContent='✖ Exit Creator Studio';x.classList.add('saveq')}wireStudio(done)}});
  if(v==='close'&&typeof menuShow==='function'&&$('#mainMenu').hidden&&!(S&&!S.over&&S.phase!=='setup')&&$('#modal').hidden){MM.fromMenu=false;menuShow()} // v0.43: the Studio lives off the main menu
  $('#mBody').onclick=null;$('#mBody').oninput=null;$('#mBody').onchange=null;
  if(typeof v==='string'&&v.startsWith('play:')){
    const [,kind,id]=v.split(':');
    if(kind==='ev'){const k='ce_'+id;const ev=EVENTS[k];CFG.mode='event';CFG.ev=k;CFG.loc=ev.loc;CFG.n=clamp(CFG.n,ev.min,ev.max);CFG.opts.spect=ev.spect||0;openSetup()}
    if(kind==='ch'){const k='cc_'+id;const s=CFG.seats[0];const clash=CFG.seats.find(o=>o!==s&&o.cls===k);if(clash)clash.cls=s.cls;Object.assign(s,{cls:k,cpu:false,name:CLASSES[k].hero,saved:null});CFG.mode='event';if(EVENTS[CFG.ev].classes&&!EVENTS[CFG.ev].custom)CFG.ev='democritus';openSetup()}
  }
}
function wireStudio(done){

  const box=$('#mBody');const root=()=>$('#studio');
  const redraw=()=>{const sc=box.scrollTop;root().innerHTML=studioHTML();box.scrollTop=sc};
  const listOf=()=>CUSTOM[ST.tab==='chars'?'chars':ST.tab==='npcs'?'npcs':'events'];
  try{scbWire(box,redraw);caAvatarWire(box,redraw)}catch(e){console.error(e)} // v0.39: one sculptor, every designer
  // v0.24: drag shapes on the token preview
  if(!box._tkDrag){box._tkDrag=1;let drag=null;const toV=e=>{const pv=$('#tokPrev');const sv=pv&&pv.querySelector('svg');if(!sv)return null;const r=sv.getBoundingClientRect();const vx=(e.clientX-r.left)/r.width*100,vy=(e.clientY-r.top)/r.height*170;const sp=ST.tokS;const sz=sp.kind==='beast'?(sp.size||1):(sp.scale||1);return [50+(vx-50)/sz,157+(vy-157)/sz]};
   box.addEventListener('pointerdown',e=>{if(1||ST.tab!=='tokens'||!e.target.closest('#tokPrev'))return; /* v0.39: superseded by scbWire */const Ls=(ST.tokS&&ST.tokS.layers)||[];if(!Ls.length)return;const v=toV(e);if(!v)return;
     let best=-1,bd=1e9;Ls.forEach((L,i)=>{const d=Math.hypot(L.x-v[0],L.y-v[1]);if(d<bd){bd=d;best=i}});if(bd>Math.max(14,((Ls[best]||{}).w||10)))best=ST.tokL??-1;if(best<0)return;ST.tokL=best;drag={i:best,dx:Ls[best].x-v[0],dy:Ls[best].y-v[1]};e.preventDefault()});
   box.addEventListener('pointermove',e=>{if(!drag)return;const v=toV(e);if(!v)return;const L=ST.tokS.layers[drag.i];if(!L)return;L.x=Math.round((v[0]+drag.dx)*10)/10;L.y=Math.round((v[1]+drag.dy)*10)/10;const pv=$('#tokPrev');if(pv)pv.innerHTML=figureHTML(ST.tokS,230,null,{selLayer:drag.i})});
   window.addEventListener('pointerup',()=>{if(drag){drag=null;const r2=$('#studio');if(r2){const sc=box.scrollTop;r2.innerHTML=studioHTML();box.scrollTop=sc}}})}
  box.onclick=async e=>{
    const ng=e.target.closest('[data-ngpat]');if(ng){const v=ng.dataset.ngpat;if(v[0]==='b'){ST.namePat=null;ST.names=Array.from({length:24},()=>genBeastName({pattern:v.length>1?+v.slice(1):null}))}else{ST.namePat=v===''?null:+v;ST.names=Array.from({length:24},()=>genName({pattern:ST.namePat}))}redraw();return}
    const cell=e.target.closest('[data-cell]');if(cell&&ST.draft){const [r,c]=cell.dataset.cell.split(',').map(Number);edApplyCell(r,c);const sc=box.scrollTop;$('#edPane').innerHTML=edBoardHTML();box.scrollTop=sc;return}
    const fdb=e.target.closest('[data-fda]');if(fdb&&typeof flagStudioClick==='function'){await flagStudioClick(fdb,redraw);return}
    const fdsb=e.target.closest('[data-fds]');if(fdsb){ST.fd.shape=fdsb.dataset.fds;redraw();return}
    const fdp=e.target.closest('[data-fdp]');if(fdp){try{const f=JSON.parse(fdp.dataset.fdp);ST.fd={...(ST.fd||blankFlag()),...f};if(typeof mToast==='function')mToast('🚩 The press copies the cloth — recolor it, change the device, make it yours.')}catch(err){}redraw();return}
    const crb=e.target.closest('[data-cr]');if(crb&&typeof crClick==='function'){await crClick(crb,redraw);return}
    const scbb=e.target.closest('[data-scb]');if(scbb){scbClick(scbb,redraw);return}
    const scb=e.target.closest('[data-sc]');if(scb&&scb.dataset.sc!=='f'&&typeof sculptClick==='function'){sculptClick(scb,redraw);return}
    const gsb=e.target.closest('[data-gs]');if(gsb&&typeof gearStudioClick==='function'){await gearStudioClick(gsb,redraw);return}
    const spb=e.target.closest('[data-sps]');if(spb&&typeof sponsorStudioClick==='function'){await sponsorStudioClick(spb,redraw);return}
    const trb=e.target.closest('[data-trs]');if(trb&&typeof trophyStudioClick==='function'){await trophyStudioClick(trb,redraw);return}
    const clb=e.target.closest('[data-clsa]');if(clb&&typeof classStudioClick==='function'){await classStudioClick(clb,redraw);return}
    const b=e.target.closest('[data-st]');if(!b)return;const a=b.dataset.st,id=b.dataset.id;
    if(a==='tab'){const v9=b.dataset.v;if(v9.startsWith('gear:')){ST.tab='gear';ST.gearSub=v9.slice(5)}else ST.tab=v9;stReady();redraw();box.scrollTop=0;return}
    if(a==='kindstats'&&ST.draft){const k=kindKeyOf(ST.draft);if(k)Object.assign(ST.draft,BEAST_KINDS[k].st);redraw();return}
    if(a==='allf'){ST.allFilter=b.dataset.v;redraw();return}
    if(a==='tokfor'){ST.tab='tokens';ST.view='list';ST.draft=null;ST.tokT=b.dataset.v;redraw();return}
    if(a==='tokpick'){ST.tokT=b.dataset.v;redraw();return}
    if(a==='tkadd'){const sp=ST.tokS;sp.layers=sp.layers||[];sp.layers.push({t:b.dataset.v,x:50,y:90,w:14,h:14,r:0,c:'#e6b93a',o:1});ST.tokL=sp.layers.length-1;redraw();return}
    if(a==='tksel'){ST.tokL=+b.dataset.v;redraw();return}
    if(a==='tknudge'){const L=(ST.tokS.layers||[])[ST.tokL];if(L){const [dx,dy]=b.dataset.v.split(',').map(Number);L.x+=dx;L.y+=dy}redraw();return}
    if(a==='tkorder'){const Ls=ST.tokS.layers||[];const i=ST.tokL,j=i+(+b.dataset.v);if(Ls[i]&&j>=0&&j<Ls.length){[Ls[i],Ls[j]]=[Ls[j],Ls[i]];ST.tokL=j}redraw();return}
    if(a==='tkdup'){const Ls=ST.tokS.layers||[];const L=Ls[ST.tokL];if(L){Ls.push({...L,x:L.x+4,y:L.y+4});ST.tokL=Ls.length-1}redraw();return}
    if(a==='tkdel'){const Ls=ST.tokS.layers||[];Ls.splice(ST.tokL,1);ST.tokL=-1;redraw();return}
    if(a==='tkbake'){const sp=ST.tokS;sp.baked=[...(sp.baked||[]),...(sp.layers||[])];sp.layers=[];ST.tokL=-1;if(typeof mToast==='function')mToast('🔨 Shapes baked into the token — save it to keep it');redraw();return}
    if(a==='tkunbake'){const sp=ST.tokS;sp.layers=[...(sp.layers||[]),...(sp.baked||[])];sp.baked=[];redraw();return}
    if(a==='tokrand'){ST.tokS=tokRandom(ST.tokS);redraw();return}
    if(a==='tokreset'){const [k,id2]=(ST.tokT||'cls:soldier').split(':');if(k==='cls'){delete TOKEN_OVR[id2];saveTokenOvr()}if(k==='npc'){delete TOKEN_OVR['npc_'+id2];saveTokenOvr()}
      if(k==='cc'){const c=CUSTOM.chars.find(x=>x.id===id2);ST.tokS=autoTokenForChar(c)}else if(k==='cn'){const n=CUSTOM.npcs.find(x=>x.id===id2);ST.tokS=autoTokenForNpc(n)}else ST.tokS=tokLoad(ST.tokT);redraw();return}
    if(a==='tokkind'){ST.tokS=ST.tokS.kind==='beast'?{...TOKEN_DEF.commodus,c1:ST.tokS.c1}:{...TOKEN_DEF.wolf,c1:ST.tokS.c1};redraw();return}
    if(a==='toklibnew'){const nm=prompt?null:null;const id2='t'+Date.now().toString(36);const name=(($('#tokName')&&$('#tokName').value.trim())||'')||(ST.tokS.kind==='beast'?'Beast token ':'Gladiator token ')+(CUSTOM.tokens.length+1);const rec={id:id2,name,spec:JSON.parse(JSON.stringify(ST.tokS)),created:new Date().toISOString().slice(0,10)};CUSTOM.tokens.push(rec);await Store.put('customTokens',id2,rec).catch(()=>{});ST.tokT='lib:'+id2;ST.tokSFor=ST.tokT;if(typeof mToast==='function')mToast(`📚 “${esc(name)}” is in your token library — assign it to any creation.`);redraw();return}
    if(a==='tokassign'){const tv=$('#tokAssign')&&$('#tokAssign').value;const lid=(ST.tokT||'').split(':')[1];if(!tv||!lid)return;const [k2,id3]=tv.split(':');const col=k2==='cc'?CUSTOM.chars:CUSTOM.npcs;const x=col.find(z=>z.id===id3);if(!x)return;x.tokenRef=lid;await Store.put(k2==='cc'?'customChars':'customNpcs',x.id,x).catch(()=>{});for(const kk in TOKEN_IMG)delete TOKEN_IMG[kk];if(typeof mToast==='function')mToast(`🗿 ${esc(x.name)} now wears this token.`);redraw();return}
    if(a==='toksave'){const [k,id2]=(ST.tokT||'cls:soldier').split(':');if(k==='cls'||k==='npc')return; /* v0.46: system figures are locked */const sp=JSON.parse(JSON.stringify(ST.tokS));
      if(k==='cls'){TOKEN_OVR[id2]=sp;saveTokenOvr()}else if(k==='npc'){TOKEN_OVR['npc_'+id2]=sp;saveTokenOvr()}
      else if(k==='lib'){const t=CUSTOM.tokens.find(x=>x.id===id2);if(t){t.spec=sp;const nm2=$('#tokName')&&$('#tokName').value.trim();if(nm2)t.name=nm2;await Store.put('customTokens',t.id,t).catch(()=>{})}}
      else if(k==='cc'){const c=CUSTOM.chars.find(x=>x.id===id2);if(c){c.token=sp;c.tokenRef=null;await Store.put('customChars',c.id,c).catch(()=>{})}}
      else{const n=CUSTOM.npcs.find(x=>x.id===id2);if(n){n.token=sp;n.tokenRef=null;await Store.put('customNpcs',n.id,n).catch(()=>{})}}
      for(const kk in TOKEN_IMG)delete TOKEN_IMG[kk];try{if(S)render()}catch(e){}if(typeof mToast==='function')mToast('🗿 Token saved');redraw();return}
    if(a==='allopen'){const [k,id2]=b.dataset.v.split('|');
      {const cp=x=>x?JSON.parse(JSON.stringify(x)):null;const G={weapons:()=>{ST.tab='gear';ST.gearSub='w';ST.cw=cp(CUSTOM.weapons.find(z=>z.id===id2))||ST.cw},armor:()=>{ST.tab='gear';ST.gearSub='a';ST.ca=cp(CUSTOM.armor.find(z=>z.id===id2))||ST.ca},
        flags:()=>{ST.tab='flags';ST.fd=cp(CUSTOM.flags.find(z=>z.id===id2))||ST.fd},trophies:()=>{ST.tab='trophies';ST.trd=cp(CUSTOM.trophies.find(z=>z.id===id2))||ST.trd},
        sponsors:()=>{ST.tab='sponsors';ST.spd2=cp(CUSTOM.sponsors.find(z=>z.id===id2))||ST.spd2},tokens:()=>{ST.tab='tokens';ST.tokT='lib:'+id2},tourneys:()=>{ST.tab='tourneys';ST.tnd=cp(CUSTOM.tourneys.find(z=>z.id===id2))||ST.tnd},specials:()=>{ST.tab='specials';ST.sxd=cp(CUSTOM.specials.find(z=>z.id===id2))||ST.sxd},pairings:()=>{ST.tab='cohorts';ST.pxd=cp(CUSTOM.pairings.find(z=>z.id===id2))||ST.pxd},rosters:()=>{ST.tab='rosters';ST.rsd=cp(CUSTOM.rosters.find(z=>z.id===id2))||ST.rsd}}[k];
        if(G){G();ST.view='list';ST.draft=null;redraw();return}}
      ST.tab=k;if(k==='spect'){const r=(CROWD_CACHE||[]).find(x=>x.id===id2);if(r){ST.spd=JSON.parse(JSON.stringify(r))}ST.view='list';ST.draft=null}else{const x=CUSTOM[k].find(z=>z.id===id2);if(x&&!x.locked){ST.draft=JSON.parse(JSON.stringify(x));ST.view='edit'}else stReady()}redraw();return}
    if(a==='sub'){ST.sub=b.dataset.v;redraw();return}
    if(a==='tool'){ST.tool=b.dataset.v;redraw();return}
    if(a==='rollnames'){ST.names=Array.from({length:24},()=>genName({pattern:ST.namePat}));redraw();return}
    if(a==='perspre'&&ST.draft){const v=b.dataset.v;ST.draft.pers=v==='random'?Object.fromEntries(PERS_KEYS.map(([k])=>[k,1+Math.floor(Math.random()*100)])):{...PERS_PRESETS[v].v};redraw();return}
    if(a==='new'||a==='random'){ST.draft=ST.tab==='chars'?blankChar():ST.tab==='npcs'?blankNpc():blankEvent();if(a==='random'){const c=ST.draft;charFromClass(c,pickOne(BASE_CLS));c.color=pickOne(['#c0433a','#4f7fc4','#4f9a57','#d4b13c','#dc7a34','#8a5cc0','#5fc7c0','#e07b9a']);c.abil=pickOne(Object.keys(ABILITIES));c.backstory=genBackstory(c.name,c.city);c.pers=rollPersonality(pickOne(BASE_CLS));if(charCost(c)>CHAR_BUDGET){c.abil='none'}if(charCost(c)>CHAR_BUDGET){c.items=['','']}}ST.view='edit';ST.sub='board';redraw();return}
    if(a==='spnew'){ST.spd=blankSpec();redraw();return}
    if(a==='sprand'){const d2=ST.spd||(ST.spd=blankSpec());const fem=Math.random()<.45;
      ST.spd={...d2,name:genName({female:fem}),taste:pickOne(Object.keys(SPECT_TASTES)),temper:pickOne(Object.keys(SPECT_TEMPERS)),trouble:Math.random()<.12?1:0,
        look:{skin:pickOne(SKINS),hair:pickOne(HAIRS),fem,beard:!fem&&Math.random()<.5,long:fem?Math.random()<.75:Math.random()<.25,robe:pickOne(ROBES)}};redraw();return}
    if(a==='spedit'){const r=CROWD_CACHE.find(x=>x.id===id);if(r){ST.spd={id:r.id,name:r.name,taste:r.taste,temper:r.temper,trouble:r.trouble||0,look:{...(r.look||{})},kin:r.kin?{...r.kin}:null}}redraw();return}
    if(a==='spdel'){const r=CROWD_CACHE.find(x=>x.id===id);if(!r)return;if(!b.dataset.armed){b.dataset.armed='1';b.textContent='Confirm';b.classList.add('primary');return}CROWD_CACHE=CROWD_CACHE.filter(x=>x!==r);Store.del('crowd',r.id).catch(()=>{});if(ST.spd&&ST.spd.id===r.id)ST.spd=blankSpec();redraw();return}
    if(a==='spsave'){const d2=ST.spd;const nm2=($('#spName')&&$('#spName').value.trim())||d2.name;
      {const tmp={id:d2.id,name:nm2};if(!nameGuard('spect',tmp,'#spName')){d2.name=tmp.name;return}}
      let r=d2.id?CROWD_CACHE.find(x=>x.id===d2.id):null;
      if(!r){r={id:'sp'+Date.now().toString(36)+rnd(46656).toString(36),visits:0,mem:[],quit:null,grudgeName:null,custom:1};CROWD_CACHE.push(r)}
      Object.assign(r,{name:nm2,taste:d2.taste,temper:d2.temper,trouble:d2.trouble?1:0,look:{...d2.look,beard:d2.look.fem?false:d2.look.beard},custom:1,kin:d2.kin&&d2.kin.name?{name:d2.kin.name,rel:d2.kin.rel||'sibling'}:null});
      Store.put('crowd',r.id,r).catch(()=>{});ST.spd=blankSpec();redraw();return}
    if(a==='lock'){const x=listOf().find(z=>z.id===id);if(!x)return;
      const at=new Date().toISOString().slice(0,16).replace('T',' ');
      x.locked=!x.locked;x.lockLog=[...(x.lockLog||[]).slice(-5),{a:x.locked?'locked':'unlocked',at}];
      await Store.put(ST.tab==='chars'?'customChars':ST.tab==='npcs'?'customNpcs':'customEvents',x.id,x).catch(()=>{});redraw();return}
    if(a==='edit'||a==='dup'){const x=listOf().find(z=>z.id===id);if(!x)return;if(a==='edit'&&x.locked)return;ST.draft=JSON.parse(JSON.stringify(x));if(a==='dup'){ST.draft.id=null;delete ST.draft.status;delete ST.draft.fell;delete ST.draft.rolls;delete ST.draft.created;ST.draft.name=ST.tab==='chars'?genName():ST.draft.name+' (copy)';ST.draft.events=[];ST.draft.trophies=0;ST.draft.rr=0;ST.draft.ff=false}ST.view='edit';ST.sub='board';redraw();return}
    if(a==='del'){const x=listOf().find(z=>z.id===id);if(!x||x.locked)return;if(!b.dataset.armed){b.dataset.armed='1';b.textContent='Confirm delete';b.classList.add('primary');setTimeout(()=>{if(b.isConnected){delete b.dataset.armed;b.textContent='Delete';b.classList.remove('primary')}},4000);return}await Store.del(ST.tab==='chars'?'customChars':ST.tab==='npcs'?'customNpcs':'customEvents',id);const L=listOf();L.splice(L.indexOf(x),1);redraw();return}
    if(a==='rolls'){const c=CUSTOM.chars.find(z=>z.id===id);if(!c||(c.status&&c.status!=='active'))return;c.rolls=!onRolls(c);await Store.put('customChars',c.id,c).catch(()=>{});redraw();return}
    if(a==='play'){if(ST.tab==='chars'&&!onRolls(CUSTOM.chars.find(z=>z.id===id)))return;if(ST.tab==='chars'&&typeof rosterEnsure==='function')rosterEnsure('chars',id);done(`play:${ST.tab==='events'?'ev':'ch'}:${id}`);return}
    if(a==='cancel'){stReady(true);redraw();return}
    if(a==='save'||a==='saveplay'){const d=await stSaveDraft();if(!d)return;if(a==='saveplay'){done(`play:${ST.tab==='events'?'ev':'ch'}:${d.id}`);return}stReady(true);redraw();if(typeof mToast==='function')mToast(`✓ Saved <b>${esc(d.name||'')}</b> — the next one is ready`);return}
    const d=ST.draft;if(!d)return;
    if(a==='pbg'){d.portrait.bg=b.dataset.v;redraw();return}
    if(a==='rlook'&&typeof randomPortrait==='function'){d.portrait=randomPortrait(!!(d.portrait&&d.portrait.fem));redraw();return}
    if(a==='rlook'){const fem=!!(d.portrait&&d.portrait.fem);d.portrait={skin:pickOne(SKINS),hair:pickOne(HAIRS),helm:pickOne(HELMS)[0],fem,beard:!fem&&Math.random()<.4,long:fem?Math.random()<.7:Math.random()<.3,scar:Math.random()<.3,paint:Math.random()<.2,smile:Math.random()<.3,bg:sysBG(),hs:pickOne(HAIRSTYLES)[0],bs:fem?'':pickOne(BEARDS)[0],eyes:pickOne(EYES)[0],mark:Math.random()<.35?pickOne(MARKS)[0]:'',garb:Math.random()<.5?pickOne(GARBS)[0]:'',ear:Math.random()<.2};redraw();return}
    if(a==='rnick'){d.nickname=genNickname();redraw();return}
    if(a==='rback'){d.backstory=genBackstory(d.name||'This gladiator',d.city);redraw();return}
    if(a==='tpl'){charFromClass(d,$('#stTpl').value);redraw();return}
    if(a==='addround'){if(d.rounds.length<3)d.rounds.push({n:['Bestiarii','Royale','Duel'][d.rounds.length],zone:Math.min(3,d.rounds.length+1),pve:1,pvp:1,cf:1,ca:1,end:'alive1',endN:1,reward:{coin:2,cf:2,cards:0}});redraw();return}
    if(a==='rmround'){d.rounds.splice(+b.dataset.i,1);redraw();return}
    if(a==='classic'){d.layout=classicLayout();redraw();return}
    if(a==='clearboard'){d.layout={pillars:[],tunnels:[],spikes:[],chest:null,chestW:[...CHEST_W],npcs:[],items:[],starts:[]};if(typeof mToast==='function')mToast('🧹 The sand is bare — start tiles too. Place one per player before you save.');redraw();return} // v0.43: a clear board clears the start tiles as well
    if(a==='randboard'){d.layout=randomArena();redraw();return}
    if(a==='randpots'){const Ls=d.layout.pillars;if(!Ls.length){mToast('🏛 No pillars yet — the Blessings sit on pillars.');return}const n=Math.min(+$('#edRandN').value,Ls.length);
      /* v0.54: one button — the blessings you picked are kept, the rest are filled with different, specific blessings, all shuffled across n pillars */
      const chosen=Ls.map(p=>p.pot).filter(k=>k&&k!=='?');const spare=shuffle(Object.keys(OFFER).filter(k=>k!=='key'&&k!=='eagle'&&!chosen.includes(k)));const used=chosen.slice(0,n);while(used.length<n)used.push(spare.length?spare.pop():'?');const pick=shuffle(used);
      for(const p of Ls)p.pot=null;shuffle([...Ls]).slice(0,pick.length).forEach((p,i)=>{p.pot=pick[i]});
      mToast(`🎲 ${pick.length} blessing${pick.length===1?'':'s'} shuffled across the pillars — each one different — tune any of them below.`);redraw();setTimeout(()=>{const pl=$('#potList');if(pl){pl.classList.remove('flash');void pl.offsetWidth;pl.classList.add('flash')}},30);return}
    if(a==='fillpots'){const Ls=d.layout.pillars;if(!Ls.length){mToast('🏛 No pillars yet — the Blessings sit on pillars.');return}const keys=shuffle(Object.keys(OFFER).filter(k=>k!=='key'&&k!=='eagle'));Ls.forEach((p,i)=>{p.pot=keys[i%keys.length]});
      mToast(`✚ ${Ls.length} different blessings placed — tune each one in the list.`);redraw();return}
  };
  const read=t=>t.type==='checkbox'?t.checked:t.dataset.num||t.type==='range'||t.type==='number'?+t.value:t.value===''&&t.tagName==='SELECT'?null:t.value;
  box.oninput=e=>{const t=e.target;
    if(t.dataset&&t.dataset.trf!=null&&typeof trophyStudioInput==='function'){trophyStudioInput(t);return}
    if(t.dataset&&t.dataset.scbl){scbInput(t);return}
    if(t.dataset&&t.dataset.sc==='f'&&typeof sculptInput==='function'){sculptInput(t);return}
    if(t.dataset&&(t.dataset.cwf!=null||t.dataset.cwt!=null||t.dataset.caf!=null)&&typeof gearStudioInput==='function'){if(gearStudioInput(t)==='redraw')redraw();return}
    if(t.dataset&&t.dataset.fdf!=null&&typeof flagStudioInput==='function'){flagStudioInput(t);return}
    if(t.dataset&&t.dataset.sonf!=null&&typeof sponsorStudioInput==='function'){sponsorStudioInput(t);return}
    if(t.dataset&&t.dataset.potsel!=null&&ST.draft){const p=ST.draft.layout.pillars[+t.dataset.potsel];if(p){p.pot=t.value||null;const sc=box.scrollTop;$('#edPane')&&($('#edPane').innerHTML=edBoardHTML());box.scrollTop=sc}return}
    if(t.id==='tokTarget'){ST.tokT=t.value;redraw();return}
    if(t.dataset.tkl){const L=(ST.tokS.layers||[])[ST.tokL];if(!L)return;const f=t.dataset.tkl;L[f]=['w','h','r','o'].includes(f)?+t.value:t.value;if(t.nextElementSibling&&t.nextElementSibling.tagName==='OUTPUT')t.nextElementSibling.textContent=t.value;const pv=$('#tokPrev');if(pv)pv.innerHTML=figureHTML(ST.tokS,230,null,{selLayer:ST.tokL});return}
    if(t.dataset.tkf){const f=t.dataset.tkf;const sp=ST.tokS;if(t.type==='checkbox')sp[f]=t.checked;else if(f==='size'||f==='scale'){sp[f]=+t.value}else sp[f]=t.value;if(t.nextElementSibling&&t.nextElementSibling.tagName==='OUTPUT')t.nextElementSibling.textContent=t.value;const pv=$('#tokPrev');if(pv)pv.innerHTML=figureHTML(sp,230,null,{selLayer:ST.tokL??-1});return}
    if(t.id==='allQ'){ST.allQ=t.value;const pos=t.selectionStart;redraw();const n2=$('#allQ');if(n2){n2.focus();try{n2.setSelectionRange(pos,pos)}catch(e){}}return}
    if(t.dataset.spf){(ST.spd||(ST.spd=blankSpec()))[t.dataset.spf]=t.value;return}
    if(!ST.draft)return;
    if(t.dataset.f&&!t.dataset.f.startsWith('@')&&t.type!=='checkbox'&&t.tagName!=='SELECT'){setPath(ST.draft,t.dataset.f,read(t));if(t.type==='range'&&t.nextElementSibling)t.nextElementSibling.textContent=t.value;
      if(ST.tab==='chars'){const pv=$('#stPortrait');if(pv)pv.innerHTML=portraitHTML(ST.draft,'lg');const co=$('#stCost');if(co)co.textContent=charCost(ST.draft)}}};
  box.onchange=e=>{const t=e.target;
    if(t.dataset&&t.dataset.f==='kindKey'&&ST.draft){const k=t.value;ST.draft.kindKey=k==='custom'?null:k;if(k!=='custom')ST.draft.kind=BEAST_KINDS[k].n;else if(kindKeyOf(ST.draft))ST.draft.kind='';redraw();return}
    if(t.dataset&&t.dataset.trf!=null&&typeof trophyStudioInput==='function'){trophyStudioInput(t);return}
    if(t.dataset&&t.dataset.sonf!=null&&typeof sponsorStudioInput==='function'){sponsorStudioInput(t);return}
    if(t.dataset.ngpat!==undefined)return;
    // spectator fields first: the Spectators tab has no ST.draft, so this must not sit behind the draft guard
    if(t.dataset.f&&t.dataset.f.startsWith('@sp')){const k=t.dataset.f.slice(3);const d2=ST.spd||(ST.spd=blankSpec());
      if(k==='taste')d2.taste=t.value;else if(k==='temper')d2.temper=t.value;
      else if(k==='skin')d2.look.skin=t.value;else if(k==='hair')d2.look.hair=t.value;else if(k==='hat')d2.look.hat=t.value||undefined;
      else if(k==='fem')d2.look.fem=t.checked;else if(k==='beard')d2.look.beard=t.checked;else if(k==='long')d2.look.long=t.checked;
      else if(k==='trouble')d2.trouble=t.checked?1:0;
      else if(k==='robe'||k==='robep'){if(t.value)d2.look.robe=t.value}
      else if(k==='tunic'){if(t.value)d2.look.tunic=t.value}
      else if(k==='kinname'){d2.kin=t.value?{name:t.value,rel:(d2.kin&&d2.kin.rel)||'sibling'}:null}
      else if(k==='kinrel'){if(d2.kin)d2.kin.rel=t.value;else d2.kin={name:'',rel:t.value}}
      redraw();return}
    if(!ST.draft)return;const d=ST.draft;
    if(t.dataset.f&&t.dataset.f.startsWith('@')){ST.opt[t.dataset.f.slice(1)]=t.value;return}
    if(t.dataset.cls){const k=t.dataset.cls;d.classes=t.checked?[...new Set([...d.classes,k])]:d.classes.filter(x=>x!==k);redraw();return}
    if(t.dataset.chestw){const k=t.dataset.chestw;d.layout.chestW=t.checked?[...new Set([...(d.layout.chestW||[]),k])]:(d.layout.chestW||[]).filter(x=>x!==k);return}
    if(t.dataset.npcsel){const k=t.dataset.npcsel,L=d.layout;
      if(k.startsWith('cn:')){const id=k.slice(3);if(t.checked){const cn=CUSTOM.npcs.find(x=>x.id===id);const [r,c]=[6,6+((L.npcs.length%5)-2)];L.npcs.push({key:'cn_'+id,t:'cn_'+id,name:cn.name,r,c,beh:cn.beh||'zone'})}else L.npcs=L.npcs.filter(n=>n.t!=='cn_'+id)}
      else if(t.checked){const b=BASE_NPCS.find(x=>x.name===k),sp=SPAWN_NPCS.find(x=>x[0]===k);const home=b?b.home:sp[2];L.npcs=L.npcs.filter(n=>!(n.r===home[0]&&n.c===home[1])&&n.name!==k);L.npcs.push({key:k,t:b?b.t:sp[1],name:k,r:home[0],c:home[1],beh:b?'zone':NPCT[sp[1]].scan?'hunt':'zone'})}
      else L.npcs=L.npcs.filter(n=>n.name!==k);
      redraw();return}
    if(t.dataset.f==='basePick'){if(t.value)applyNpcBase(d,t.value);redraw();return}
    if(t.dataset.f){setPath(d,t.dataset.f,read(t));
      if(t.dataset.f==='min'&&d.max<d.min)d.max=d.min;if(t.dataset.f==='max'&&d.min>d.max)d.min=d.max;
      if(t.type==='range'&&t.tagName==='INPUT'&&ST.tab!=='events'){if(t.nextElementSibling)t.nextElementSibling.textContent=t.value;const co=$('#stCost');if(co)co.textContent=charCost(d);return}
      if(t.type==='text'||t.tagName==='TEXTAREA')return;
      redraw()}
  };
}
$('#btnStudio').onclick=()=>openStudio();

/* =====================================================================
   263-V99FACE · ONE FACE, phase 1 (tools/plans/mock99/PORTRAITS.md §4.1–2 + the size tiers / Settings plumbing)
   =====================================================================
   Every human face (Studio character, lanista, Manager house + gladiator, Ludus/Annals/Hall record, online gladiator,
   spectator, council advisor, online patron) is drawn by ONE painter, face99(spec,opt), from ONE spec (FACE1).
   Flavius, the sponsors, the board crowd (193 paint91), beasts and board tokens are NOT faces of this system (unchanged).

   FACE1 — the spec (flat; ≤19 keys, keys ≤16 chars, strings ≤40, ~200–300 B as JSON → fits online cleanLook (≤40 keys,
   ≤3 KB) and, without v/bg/eyes, cleanPatron (≤16 keys, ≤1 KB) — NO server change):
     v:1            spec version
     skin hair eyes colours (#rrggbb; defaults SKINS[1] / HAIRS[1] / #1a120c)
     hs             hairstyle  ('' short · long crop curly braid crest bald bun ponytail topknot wild twinbraid)
     bs             beard      ('' none · full goatee stache stubble forked braided chin mutton longbeard) — only when DRAWN
     fem smile      booleans
     mark           first mark ('' · scar paint scarX brand tattoo woad patch blind freckles mole kohl tears cheek bruise)
     mark2          legacy extra marks a generated face may carry beside `mark` ('scar' | 'paint' | 'scar paint')
     helm           headgear (HELMS keys) + the spectator hats: pileus, straw, hood, veil, turban, laurel (= wreath), galea (= helm)
     garb           ('' tunic & baldric · manica fur toga bare scale chain lorica cape leopard robe pteruges) + 'mantle'
                    (the crowd's dress: the toga cut in `tunic` + `robe` colours)
     tunic robe     mantle colours
     ear neck face  jewellery / face pieces ('' or the 58-looks keys; ear '1' = the gold ring)
     bg             backdrop (#rrggbb or 'flag:<key>')
     color          the accent (class colour / house colour / the mantle colour of the crowd)
   ADAPTERS (pure, deterministic, never the dice RNG, never write saved data — old shapes are read as they are):
     faceNorm99(A)            Studio/lanista/Manager/Ludus/online portrait object (legacy beard/long/scar/paint booleans) → FACE1
     fromSpect99(B,mantle,city) spectator look {skin,hair,long,fem,beard,hat,tunic,robe,city} → FACE1 (a look that is already a
                              portrait object — 16-crowd's gladiator-in-the-stands — goes through faceNorm99 and keeps its bust)
     fromCouncil99(a)         council advisor (w.council83[i]) → FACE1 (its face is a B look)
     fromPatron99(p)          online patron (domus.patron / onlPatronDef82, B + cushion c1/c2) → FACE1
     fromOnlLook99(look,cls)  online char.look {portrait,color} → FACE1
     fromGlad99(g)            Manager gladiator → FACE1 (gLook's face without its lazy write: g.look, else gladPortrait(id,cls))
     fromRecord99(r)          Ludus / Hall / Annals record → FACE1 (r.portrait, else gladPortrait(saved||name, cls))
     fromLanista99(m)         Manager house / Studio lanista → FACE1 (portrait || {helm:'laurel'}, accent = house colour)
     face99Out(spec,'look'|'patron') compact copies for storage (defaults dropped; patron: no v/bg/eyes) — phase 4/5 writers.
   PAINTER face99(spec,{frame,size,color,polish,cls,w,h}) → SVG string:
     frame 'bust' (100×140, every portrait) · 'chip' (crop for ≥40 px heads: patrons, advisors in cards) · 'head' (crop for
     ≤39 px: stands lists, city residents, stalls). The bust geometry IS today's portraitSVG chain (15-custom + 44 + 58),
     captured here as FACE99.geom, so polish off = byte-identical busts. Spectators / advisors / patrons are now a CROP of the
     same bust (his approved visible change); their old 24×24 painter is gone.
     Size tiers face99Tier(px): tiny ≤32 · small ≤80 · full. Phase 1 draws every tier the same; phase 2 (polish) picks per tier.
   ROUTED THROUGH IT: portraitSVG + portraitHTML (so gArt, mgrPortrait, pArt, classArt, gladFace, onl80Face, onlPortraitOf
     previews, the Studio/lanista/Manager designers, Ludus/Hall rcards), specFaceSVG (stands lists, Studio spectators, city
     residents, stalls), face83 (131 const arrow, edited there to call face99Spect), onlPatronFace82 (127).
   CACHE: FACE99.cache = Map (frame|tier|colour|spec JSON) → SVG string, first in first out, ≤900 entries and ≤4 M chars;
     custom banners (bg 'flag:c:…', incl. the Studio's live draft) are never cached. FACE99.stats {hit,miss,skip}.
   SETTINGS.face99 = 'full' | 'light' | 'off' (Settings → Board & pieces → Portrait detail). Phase 1: all three draw today's
     look (Full turns the polish on once phase 2/3 lands). Dev preview of the prototype polish: localStorage flavius_face99polish=1.
   Kill switch: localStorage flavius_face99off=1 → the old painters (portraitSVG / specFaceSVG as they were).
   ===================================================================== */
const FACE99={off:false,geom:portraitSVG,spect0:specFaceSVG,cache:new Map(),chars:0,MAX:900,MAXCH:4e6,stats:{hit:0,miss:0,skip:0},
  polishDev:false,FRAMES:{bust:'0 0 100 140',chip:'6 30 88 88',head:'12 28 76 76'},CHIP_PX:40};
try{FACE99.off=localStorage.getItem('flavius_face99off')==='1';FACE99.polishDev=localStorage.getItem('flavius_face99polish')==='1'}catch(e){}
const N99=new WeakSet(); /* objects faceNorm99 made (already FACE1) */
const FACE99_KEYS=['v','skin','hair','eyes','hs','bs','fem','smile','mark','mark2','helm','garb','tunic','robe','ear','neck','face','bg','color'];
/* the crowd's hats → FACE1 headgear */
const HAT99={pileus:'pileus',straw:'straw',hood:'hood',wreath:'laurel',veil:'veil',helm:'galea',turban:'turban'};
const face99Tier=px=>!px?'full':px<=32?'tiny':px<=80?'small':'full';
const face99Detail=()=>{const v=typeof SETTINGS!=='undefined'&&SETTINGS.face99;return v==='light'||v==='off'?v:'full'};

/* ---------- adapters ---------- */
/* faceNorm99 — any portrait object (legacy or FACE1) → FACE1; idempotent; painting the result = painting the input */
function faceNorm99(p){p=p&&typeof p==='object'?p:{};if(N99.has(p))return p;
  const fem=!!p.fem;
  /* the beard exactly as 15-custom decides it: bs wins unless 'none', else the legacy boolean; a woman only with an explicit bs */
  const bsel=p.bs&&p.bs!=='none'?p.bs:(p.beard?'full':'');const bs=bsel&&(p.bs||!fem)?bsel:'';
  const hs=p.hs||(p.long?'long':'');
  const legacy=[...String(p.mark2||'').split(' '),p.scar?'scar':'',p.paint?'paint':''].filter((x,i,a)=>x&&a.indexOf(x)===i);
  const mark=p.mark||legacy.shift()||'';const mark2=legacy.filter(x=>x!==mark).join(' ');
  const o={v:1,skin:p.skin||'',hair:p.hair||'',eyes:p.eyes||'',hs,bs,fem,smile:!!p.smile,mark,mark2,helm:p.helm||'none',garb:p.garb||'',
    tunic:p.tunic||'',robe:p.robe||'',ear:p.ear===true?'1':(p.ear||''),neck:p.neck||'',face:p.face||'',bg:p.bg||'',color:p.color||''};
  N99.add(o);return o}
/* the object today's bust painter wants, from FACE1 */
function face99Geo(f){const o={skin:f.skin||undefined,hair:f.hair||undefined,eyes:f.eyes||undefined,bg:f.bg||undefined,helm:f.helm||'none',hs:f.hs,bs:f.bs,fem:f.fem,smile:f.smile,
  mark:f.mark,garb:f.garb,ear:f.ear,neck:f.neck,face:f.face,beard:false,long:false};
  const m2=String(f.mark2||'');if(/\bscar\b/.test(m2))o.scar=true;if(/\bpaint\b/.test(m2))o.paint=true;
  for(const k in o)if(o[k]===undefined)delete o[k];return o}
const isPortrait99=l=>!!l&&typeof l==='object'&&!('hat' in l)&&('helm' in l||'hs' in l||'bs' in l||'garb' in l||'bg' in l||l.v===1);
/* fromSpect99 — a spectator look (16-crowd) → FACE1, the same tunic/mantle colours specFaceSVG used */
function fromSpect99(look,mantle,city){const l=look||{};
  if(isPortrait99(l)){const f=faceNorm99(l);return mantle?faceNorm99({...f,color:mantle}):f}
  const tun=typeof tunicOf==='function'?tunicOf(l,city||l.city):(l.tunic||'#e8dcc0');const robe=mantle||(typeof robeOf==='function'?robeOf(l):(l.robe||'#5a4636'));
  const fem=!!l.fem;
  return faceNorm99({skin:l.skin||'#e6cfa8',hair:l.hair||'#4a2c17',eyes:'#1a120c',hs:(l.long||fem)?'long':'',bs:l.beard&&!fem?'full':'',fem,
    helm:HAT99[l.hat]||'none',garb:'mantle',tunic:tun,robe,bg:'#2a1f17',color:robe})}
const fromCouncil99=a=>fromSpect99(a&&a.face||{});
const fromPatron99=p=>fromSpect99(p||{});
function fromOnlLook99(look,cls){const L=look||{};const col=L.color||((typeof CLASSES!=='undefined'&&CLASSES[cls])||{}).color||'#a3281f';return faceNorm99({...(L.portrait||{}),color:col})}
function fromGlad99(g){if(!g)return faceNorm99({});let L=g.look||(typeof gladPortrait==='function'?gladPortrait(g.id||g.name,g.cls):{});if(g.fem)L={...L,fem:true,beard:false};
  const c=typeof CLASSES!=='undefined'&&CLASSES[g.cls];return faceNorm99({...L,color:c?c.color:'#a3281f'})}
function fromRecord99(r){if(!r)return faceNorm99({});const L=r.portrait||(typeof gladPortrait==='function'?gladPortrait(r.saved||r.name||String(r.id||''),r.cls):{});
  const c=typeof CLASSES!=='undefined'&&(CLASSES[r.cls]||CLASSES.soldier);return faceNorm99({...L,color:r.color||(c&&c.color)||'#a3281f'})}
const fromLanista99=m=>faceNorm99({...((m&&m.portrait)||{helm:'laurel'}),color:(m&&m.color)||'#c0433a'});
/* compact copies for storage (phase 4/5 writers): defaults dropped; the patron form fits cleanPatron's 16 keys */
function face99Out(spec,kind){const f=faceNorm99(spec);const o={};for(const k of FACE99_KEYS){const v=f[k];if(v===''||v===false||v==null)continue;if(k==='helm'&&v==='none')continue;o[k]=v}
  if(kind==='patron'){delete o.v;delete o.bg;if(o.eyes==='#1a120c')delete o.eyes}return o}

/* ---------- the painter ---------- */
function face99Key(f,frame,tier,color){return frame+tier+color+'|'+f.skin+'|'+f.hair+'|'+f.eyes+'|'+f.hs+'|'+f.bs+'|'+(f.fem?1:0)+(f.smile?1:0)+'|'+f.mark+'|'+f.mark2+'|'+f.helm+'|'+f.garb+'|'+f.tunic+'|'+f.robe+'|'+f.ear+'|'+f.neck+'|'+f.face+'|'+f.bg}
function face99Paint(f,frame,color,opt){
  const mantle=f.garb==='mantle',straw=f.helm==='straw';const g=face99Geo(f);if(mantle)g.garb='toga';if(straw)g.helm='none';
  let s=FACE99.geom(g,color);
  if(mantle)s=s.replace(/fill="#efe6d2"/,`fill="${f.tunic||'#e8dcc0'}"`).replace(/stroke="#8a1c1c" stroke-width="5"/,`stroke="${f.robe||'#5a4636'}" stroke-width="9"`);
  if(straw)s=s.replace(/<\/svg>$/,'<ellipse cx="50" cy="40" rx="34" ry="7" fill="#d8b866" stroke="#8a6a2a"/><path d="M32 40C32 22 68 22 68 40Z" fill="#e2c477" stroke="#8a6a2a"/><path d="M33 36h34" stroke="#8a4a2a" stroke-width="2.2"/></svg>');
  if(opt.polish===true&&typeof polish99==='function')s=polish99(s,face99Geo(f),{color,grain:(opt.size||0)>=150});
  if(frame!=='bust')s=s.replace('viewBox="0 0 100 140"',`viewBox="${FACE99.FRAMES[frame]||FACE99.FRAMES.chip}"`);
  return s}
/* face99 — THE painter. spec: any face shape (run through faceNorm99). opt.frame bust|chip|head, opt.size px (tier), opt.color
   (else spec.color), opt.cls (an extra svg class), opt.w/h (svg width/height attributes), opt.polish (true = the prototype polish;
   phase 1 only with the dev flag). */
function face99(spec,opt){opt=opt||{};const f=faceNorm99(spec);const frame=opt.frame||'bust';const color=opt.color!==undefined?opt.color:(f.color||'#c0433a');const tier=face99Tier(opt.size);
  const polish=opt.polish===true||(opt.polish==null&&FACE99.polishDev&&face99Detail()==='full'&&tier!=='tiny');
  const bg=String(f.bg||'');const nocache=bg.startsWith('flag:c:');
  const key=nocache?null:face99Key(f,frame,tier,color)+(polish?'P':'');
  let s=key&&FACE99.cache.get(key);
  if(s!=null)FACE99.stats.hit++;
  else{s=face99Paint(f,frame,color,{...opt,polish});
    if(key){FACE99.stats.miss++;FACE99.cache.set(key,s);FACE99.chars+=s.length+key.length;
      while(FACE99.cache.size>FACE99.MAX||FACE99.chars>FACE99.MAXCH){const k0=FACE99.cache.keys().next().value;if(k0==null)break;FACE99.chars-=(FACE99.cache.get(k0)||'').length+k0.length;FACE99.cache.delete(k0)}}
    else FACE99.stats.skip++}
  if(opt.cls)s=s.replace('<svg ',`<svg class="${opt.cls}" `);
  if(opt.w)s=s.replace('<svg ',`<svg width="${opt.w}" height="${opt.h||opt.w}" `);
  return s}
/* face99Spect — a crowd face (spectator / advisor / patron) at px: the bust cropped (chip ≥40 px, head below) */
function face99Spect(look,o){o=o||{};const px=o.px||20;const f=o.spec||fromSpect99(look,o.mantle,o.city);
  return face99(f,{frame:px>=FACE99.CHIP_PX?'chip':'head',size:px,cls:'sface',w:px,color:f.color})}
const face99Clear=()=>{FACE99.cache.clear();FACE99.chars=0};

/* ---------- route every human-face painter through face99 ---------- */
if(!FACE99.off){
  portraitSVG=function(pt,color){return face99(pt,{color:color===undefined?'#c0433a':color,frame:'bust'})};
  portraitHTML=function(who,size){size=size||'md';const [w,h]=PORTRAIT_SIZES[size]||PORTRAIT_SIZES.md;who=who||{};
    return `<span class="portrait" style="width:${w}px;height:${h}px" role="img" aria-label="${esc(who.name||_T('Custom gladiator'))}">${face99(who.portrait,{color:who.color===undefined?'#c0433a':who.color,frame:'bust',size:w})}</span>`};
  specFaceSVG=function(look,mantle,city){return face99Spect(look,{px:20,mantle,city})};
  if(typeof onlPatronFace82==='function')onlPatronFace82=function(p,sz){return face99Spect(p||{},{px:sz||20})};
}

/* ---------- the prototype polish (phase 2 turns it on; here only behind localStorage flavius_face99polish=1) ---------- */
{let U=0;const sh=(c,f)=>{try{return shade(c,f)}catch(e){return c}};
const BARE=new Set(['none','laurel','diadem','flowers','goldwreath','circlet','band','straw']);
const GALEA=new Set(['galea','crested','horned','thraex']),DOME=new Set(['murmillo','provocator']);
const SHUT=new Set(['murmillo','provocator','hood','veil','pelt','lion']);
window.polish99=function(svg,p,opt){p=p||{};opt=opt||{};const u='f99'+(++U);const fem=!!p.fem;const skin=p.skin||SKINS[1],hair=p.hair||HAIRS[1];
  const helm=p.helm||'none',hs=p.hs||(p.long?'long':'');const bare=BARE.has(helm);
  const faceE=fem?'<ellipse cx="50" cy="58" rx="20" ry="26.5"/>':'<ellipse cx="50" cy="58" rx="22" ry="27"/>';
  const ears=fem?'<ellipse cx="30" cy="62" rx="4.5" ry="7"/><ellipse cx="70" cy="62" rx="4.5" ry="7"/>':'<ellipse cx="28" cy="62" rx="5" ry="8"/><ellipse cx="72" cy="62" rx="5" ry="8"/>';
  const neck=fem?'<rect x="42" y="78" width="16" height="26" rx="6"/>':'<rect x="41" y="78" width="18" height="26" rx="6"/>';
  const body=fem?'<path d="M12 140C14 112 29 101 50 101S86 112 88 140Z"/>':'<path d="M6 140C8 110 26 99 50 99S92 110 94 140Z"/>';
  const hairD=(hs==='long'||fem)?'M26 60C22 26 78 26 74 60C74 44 64 36 50 36S26 44 26 60Z M26 58C24 76 28 88 32 92L30 60Z M74 58C76 76 72 88 68 92L70 60Z':'M28 54C27 30 73 30 72 54C67 41 33 41 28 54Z';
  const ink='#1c1008',warm=sh(skin,-0.55);
  const defs=`<defs><radialGradient id="${u}hl" cx=".34" cy=".26" r=".7"><stop offset="0" stop-color="#fff6e6" stop-opacity=".30"/><stop offset=".55" stop-color="#fff6e6" stop-opacity="0"/></radialGradient>`
   +`<linearGradient id="${u}fs" x1=".25" y1=".2" x2="1" y2=".75"><stop offset=".5" stop-color="${warm}" stop-opacity="0"/><stop offset="1" stop-color="${warm}" stop-opacity=".55"/></linearGradient>`
   +`<radialGradient id="${u}ao"><stop offset="0" stop-color="${ink}" stop-opacity=".42"/><stop offset="1" stop-color="${ink}" stop-opacity="0"/></radialGradient>`
   +`<radialGradient id="${u}wm"><stop offset="0" stop-color="#d0583e" stop-opacity=".26"/><stop offset="1" stop-color="#d0583e" stop-opacity="0"/></radialGradient>`
   +`<linearGradient id="${u}nk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ink}" stop-opacity=".55"/><stop offset=".45" stop-color="${ink}" stop-opacity="0"/></linearGradient>`
   +`<linearGradient id="${u}bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2d8" stop-opacity=".20"/><stop offset=".45" stop-color="#fff2d8" stop-opacity="0"/><stop offset=".55" stop-color="${ink}" stop-opacity="0"/><stop offset="1" stop-color="${ink}" stop-opacity=".45"/></linearGradient>`
   +`<linearGradient id="${u}hr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${sh(hair,0.5)}" stop-opacity=".45"/><stop offset=".45" stop-color="${sh(hair,0.5)}" stop-opacity="0"/><stop offset="1" stop-color="${ink}" stop-opacity=".4"/></linearGradient>`
   +`<linearGradient id="${u}mt" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".3" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="${ink}" stop-opacity=".12"/><stop offset="1" stop-color="${ink}" stop-opacity=".45"/></linearGradient>`
   +`<radialGradient id="${u}vg" cx=".42" cy=".38" r=".85"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>`
   +`<clipPath id="${u}cf">${faceE}${ears}</clipPath><clipPath id="${u}cn">${neck}</clipPath><clipPath id="${u}cb">${body}</clipPath><clipPath id="${u}ch"><path d="${hairD}"/></clipPath></defs>`;
  const back=`<ellipse cx="57" cy="70" rx="27" ry="33" fill="url(#${u}ao)" opacity=".75"/>`;
  let o=`<g clip-path="url(#${u}cb)"><rect y="96" width="100" height="44" fill="url(#${u}bd)"/></g>`;
  const neckL=`<g clip-path="url(#${u}cn)"><rect x="38" y="78" width="24" height="26" fill="url(#${u}nk)"/></g>`;
  const faceL=`<g clip-path="url(#${u}cf)"><rect x="20" y="28" width="60" height="60" fill="url(#${u}fs)"/><rect x="20" y="28" width="60" height="60" fill="url(#${u}hl)"/>`
    +`<ellipse cx="41" cy="55" rx="7.5" ry="4.2" fill="url(#${u}ao)" opacity=".55"/><ellipse cx="59" cy="55" rx="7.5" ry="4.2" fill="url(#${u}ao)" opacity=".6"/>`
    +`<ellipse cx="37.5" cy="68" rx="6.5" ry="4.5" fill="url(#${u}wm)"/><ellipse cx="62.5" cy="68" rx="6.5" ry="4.5" fill="url(#${u}wm)"/></g>`;
  if(!SHUT.has(helm))o+=`<circle cx="40" cy="57.2" r=".8" fill="#fff" opacity=".9"/>${p.mark==='patch'||p.mark==='blind'?'':'<circle cx="58" cy="57.2" r=".8" fill="#fff" opacity=".9"/>'}`;
  if(bare&&(hs===''||hs==='long'))o+=`<g clip-path="url(#${u}ch)"><rect x="20" y="26" width="60" height="70" fill="url(#${u}hr)"/></g>`;
  if(GALEA.has(helm))o+=`<path d="M31 48Q35 34 47 31" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/>`;
  if(DOME.has(helm))o+=`<path d="M28 50Q31 34 44 29" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/>`;
  o+=`<rect width="100" height="140" fill="url(#${u}vg)"/>`;
  svg=svg.replace(/(<svg[^>]*>)/,`$1${defs}`);
  svg=svg.replace(/(<rect x="4[12]" y="78" width="1[68]" height="26" rx="6" fill="[^"]+"\/>)/,'$1'+neckL);
  svg=svg.replace(/(<ellipse cx="50" cy="58" rx="2[02]" ry="2[67](?:\.5)?" fill="[^"]+"\/>)/,'$1'+faceL);
  const disc=svg.indexOf('<circle cx="50" cy="62" r="46"');if(disc>0){const end=svg.indexOf('/>',disc)+2;svg=svg.slice(0,end)+back+svg.slice(end)}
  return svg.replace(/<\/svg>$/,o+'</svg>')}}

/* ---------- Settings → Board & pieces → Portrait detail (Full / Light / Off) ---------- */
function face99SetHTML(){const v=face99Detail();const b=(k,l)=>`<button type="button" data-face99="${k}" class="${v===k?'on':''}" aria-pressed="${v===k}">${l}</button>`;
  return `<div class="seg s98-seg">${b('full',_T('Full'))}${b('light',_T('Light'))}${b('off',_T('Off'))}</div>`}
if(typeof set98Pieces==='function'){const base=set98Pieces;set98Pieces=function(){let h=base.apply(this,arguments);try{
  const row=typeof set98Row==='function'?set98Row(_T('Portrait detail'),_T('Light and shade on every face. Light and Off draw them plainer and faster.'),face99SetHTML()):'';
  const card=typeof set98Card==='function'?set98Card('🧑',_T('Portraits'),`<div class="s98-rows">${row}</div>`):'';
  h=h.replace(/<\/div>$/,card+'</div>')}catch(e){console.error(e)}return h}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-face99]');if(!b)return;SETTINGS.face99=b.dataset.face99;face99Clear();
  try{applySettings()}catch(err){}b.parentElement.querySelectorAll('[data-face99]').forEach(x=>{const on=x===b;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on))})});

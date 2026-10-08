/* PROTOTYPE ONLY (v0.99 proposal, not game code) — loaded into the running game page by portraits.js.
   ONE FACE: face99(spec, opt) draws every human face (Studio character, lanista, Manager gladiator, spectator, council advisor, online
   gladiator + patron, Annals/Hall) from ONE spec with ONE painter: today's portraitSVG geometry (so every existing character keeps its exact
   shapes, pose, proportions and palette) + polish99() passes. Small frames (spectator chips, council heads, patrons) are a CROP of the same
   bust, not a second face system. Adapters turn the old formats into the spec: fromSpect99 (spectator / council / patron look).
   Beasts are not people: beastPolish99() gives the beast-face token rounds the same light (upper left), shading and texture.
   Every pass is plain SVG: gradients + clip paths (no filters) except the optional grain (opt.grain, big sizes only). */
(function(){
let U=0;
const sh=(c,f)=>{try{return shade(c,f)}catch(e){return c}};
/* ---------- the spec: today's portrait object (superset) + colour; adapters from the other formats ---------- */
const HAT99={pileus:'pileus',straw:'straw',hood:'hood',wreath:'laurel',veil:'veil',helm:'galea',turban:'turban'};
window.fromSpect99=function(look){const l=look||{};return {skin:l.skin||'#e6cfa8',hair:l.hair||'#4a2c17',hs:(l.long||l.fem)?'long':'',fem:!!l.fem,
  bs:l.beard&&!l.fem?'full':'',helm:HAT99[l.hat]||'none',garb:'mantle',tunic:l.tunic||'#e8dcc0',robe:l.robe||(typeof robeOf==='function'?robeOf(l):'#5a4636'),
  bg:'#2a1f17',eyes:'#1a120c'}};
/* ---------- the painter ---------- */
const FRAMES={bust:'0 0 100 140',chip:'6 30 88 88',head:'12 28 76 76'};
window.face99=function(spec,opt){opt=opt||{};spec=spec||{};const color=opt.color||spec.color||'#c0433a';
  let base={...spec};
  /* the spectators' mantle (a new garb value in the spec): drawn with the toga shape in the look's own tunic + mantle colours */
  const mantle=spec.garb==='mantle';if(mantle)base.garb='toga';
  if(spec.helm==='straw')base.helm='none';
  let s=portraitSVG(base,color);
  if(mantle)s=s.replace(/fill="#efe6d2"/,`fill="${spec.tunic||'#e8dcc0'}"`).replace(/stroke="#8a1c1c" stroke-width="5"/,`stroke="${spec.robe||'#5a4636'}" stroke-width="9"`);
  if(spec.helm==='straw')s=s.replace(/<\/svg>$/,`<ellipse cx="50" cy="40" rx="34" ry="7" fill="#d8b866" stroke="#8a6a2a"/><path d="M32 40C32 22 68 22 68 40Z" fill="#e2c477" stroke="#8a6a2a"/><path d="M33 36h34" stroke="#8a4a2a" stroke-width="2.2"/></svg>`);
  if(opt.polish!==false)s=polish99(s,spec,{...opt,color});
  const vb=FRAMES[opt.frame||'bust'];s=s.replace('viewBox="0 0 100 140"',`viewBox="${vb}"`);
  if(opt.w)s=s.replace('<svg ',`<svg width="${opt.w}" height="${opt.h||opt.w}" `);
  return s};
/* ---------- the polish passes (portrait geometry: face ellipse 50,58 · 22×27 (fem 20×26.5), neck 41–59 × 78–104, shoulders from y 99) ---------- */
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
  let defs=`<defs>
   <radialGradient id="${u}hl" cx=".34" cy=".26" r=".7"><stop offset="0" stop-color="#fff6e6" stop-opacity=".30"/><stop offset=".55" stop-color="#fff6e6" stop-opacity="0"/></radialGradient>
   <linearGradient id="${u}fs" x1=".25" y1=".2" x2="1" y2=".75"><stop offset=".5" stop-color="${warm}" stop-opacity="0"/><stop offset="1" stop-color="${warm}" stop-opacity=".55"/></linearGradient>
   <radialGradient id="${u}ao"><stop offset="0" stop-color="${ink}" stop-opacity=".42"/><stop offset="1" stop-color="${ink}" stop-opacity="0"/></radialGradient>
   <radialGradient id="${u}wm"><stop offset="0" stop-color="#d0583e" stop-opacity=".26"/><stop offset="1" stop-color="#d0583e" stop-opacity="0"/></radialGradient>
   <linearGradient id="${u}nk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ink}" stop-opacity=".55"/><stop offset=".45" stop-color="${ink}" stop-opacity="0"/></linearGradient>
   <linearGradient id="${u}ns" x1="0" y1="0" x2="1" y2="0"><stop offset=".45" stop-color="${warm}" stop-opacity="0"/><stop offset="1" stop-color="${warm}" stop-opacity=".45"/></linearGradient>
   <linearGradient id="${u}bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2d8" stop-opacity=".20"/><stop offset=".45" stop-color="#fff2d8" stop-opacity="0"/><stop offset=".55" stop-color="${ink}" stop-opacity="0"/><stop offset="1" stop-color="${ink}" stop-opacity=".45"/></linearGradient>
   <linearGradient id="${u}hr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${sh(hair,0.5)}" stop-opacity=".45"/><stop offset=".45" stop-color="${sh(hair,0.5)}" stop-opacity="0"/><stop offset="1" stop-color="${ink}" stop-opacity=".4"/></linearGradient>
   <linearGradient id="${u}bdu" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="${ink}" stop-opacity="0"/><stop offset="1" stop-color="${ink}" stop-opacity=".45"/></linearGradient>
   <linearGradient id="${u}mt" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".3" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="${ink}" stop-opacity=".12"/><stop offset="1" stop-color="${ink}" stop-opacity=".45"/></linearGradient>
   <radialGradient id="${u}vg" cx=".42" cy=".38" r=".85"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
   <clipPath id="${u}cf">${faceE}${ears}</clipPath><clipPath id="${u}cn">${neck}</clipPath><clipPath id="${u}cb">${body}</clipPath><clipPath id="${u}ch"><path d="${hairD}"/></clipPath>
   ${opt.grain?`<filter id="${u}gr" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .4  0 0 0 0 .3  0 0 0 .5 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`:''}
  </defs>`;
  /* behind the figure: a soft cast shadow on the backdrop (light from the upper left) */
  const back=`<ellipse cx="57" cy="70" rx="27" ry="33" fill="url(#${u}ao)" opacity=".75"/><path d="M60 140C64 112 82 104 98 108V140Z" fill="url(#${u}ao)" opacity=".6"/>`;
  let o='';
  /* body: light upper left, shade lower right, two cloth folds, a rim of light on the lit shoulder */
  o+=`<g clip-path="url(#${u}cb)"><rect y="96" width="100" height="44" fill="url(#${u}bd)"/><path d="M30 140C32 126 38 116 44 112M70 140C68 128 64 120 58 114" fill="none" stroke="${ink}" stroke-opacity=".12" stroke-width="1.8" stroke-linecap="round"/></g>`;
  o+=`<path d="${fem?'M14 136C16 114 30 103 48 101':'M8 136C11 112 27 101 48 99'}" fill="none"  stroke="#fff3da" stroke-opacity=".2" stroke-width="1.1" stroke-linecap="round"/>`;
  /* neck: the jaw's shadow */
  const neckL=`<g clip-path="url(#${u}cn)"><rect x="38" y="78" width="24" height="26" fill="url(#${u}nk)"/><rect x="38" y="78" width="24" height="26" fill="url(#${u}ns)"/></g>`;
  /* face planes */
  let faceL=`<g clip-path="url(#${u}cf)"><rect x="20" y="28" width="60" height="60" fill="url(#${u}fs)"/><rect x="20" y="28" width="60" height="60" fill="url(#${u}hl)"/>`
    +`<ellipse cx="41" cy="55" rx="7.5" ry="4.2" fill="url(#${u}ao)" opacity=".55"/><ellipse cx="59" cy="55" rx="7.5" ry="4.2" fill="url(#${u}ao)" opacity=".6"/>`
    +`<ellipse cx="37.5" cy="68" rx="6.5" ry="4.5" fill="url(#${u}wm)"/><ellipse cx="62.5" cy="68" rx="6.5" ry="4.5" fill="url(#${u}wm)"/>`
    +`<path d="M50.4 61L52.4 68.6L51 69.6Z" fill="${warm}" opacity=".3"/><path d="M49.3 57L48.3 65.5" stroke="#fff6e6" stroke-opacity=".3" stroke-width=".9" stroke-linecap="round"/>`
    +`<ellipse cx="50.6" cy="71.6" rx="3.6" ry="1.1" fill="${warm}" opacity=".28"/><ellipse cx="50" cy="80.6" rx="3.6" ry="1.2" fill="${warm}" opacity=".16"/><ellipse cx="49" cy="84.2" rx="4.5" ry="1.8" fill="#fff6e6" opacity=".16"/>`
    +`<path d="M27 58c-1 4 0 9 2 12M71 57c2 4 1 10-1 13" fill="none" stroke="${warm}" stroke-opacity=".35" stroke-width="1.4"/></g>`;
  /* the face's edge: a thin warm contour keeps the silhouette crisp */
  faceL+=fem?`<ellipse cx="50" cy="58" rx="20" ry="26.5" fill="none" stroke="${warm}" stroke-opacity=".35" stroke-width=".7"/>`:`<ellipse cx="50" cy="58" rx="22" ry="27" fill="none" stroke="${warm}" stroke-opacity=".35" stroke-width=".7"/>`;
  /* eyes: lids and catchlights (not behind a closed helm / a patch) */
  if(!SHUT.has(helm)){o+=`<path d="M37.6 56.3Q41 54.3 44.4 56.3M55.6 56.3Q59 54.3 62.4 56.3" fill="none" stroke="${ink}" stroke-opacity=".55" stroke-width=".8" stroke-linecap="round"/><circle cx="40" cy="57.2" r=".8" fill="#fff" opacity=".9"/>${p.mark==='patch'||p.mark==='blind'?'':'<circle cx="58" cy="57.2" r=".8" fill="#fff" opacity=".9"/>'}`}
  /* lips: a lit lower lip */
  o+=`<path d="M46 78.6Q50 ${p.smile?81.5:80} 54 78.6" fill="none" stroke="#fff3e6" stroke-opacity=".22" stroke-width=".9"/>`;
  /* hair: a sheen from the upper left + strand groups in the hair's own lights and darks */
  if(bare&&['','long'].includes(hs)||(bare&&fem&&!hs)){const hL=sh(hair,0.38),hD=sh(hair,-0.4);
    o+=`<g clip-path="url(#${u}ch)"><rect x="20" y="26" width="60" height="70" fill="url(#${u}hr)"/>`
      +[[30,52,38,36,48,33],[34,50,41,38,52,35],[40,48,46,37,58,34],[47,46,52,37,64,36],[54,46,60,39,70,44],[60,47,66,42,71,52]].map(([a,b,c,d,e,f],i)=>`<path d="M${a} ${b}Q${c} ${d} ${e} ${f}" fill="none" stroke="${i<3?hL:hD}" stroke-opacity="${i<3?.4:.35}" stroke-width=".6" stroke-linecap="round"/>`).join('')
      +(hs==='long'||fem?`<path d="M27.5 64q-1 12 3 24M72.5 64q1 12-3 24M29 70q0 9 2.5 16" fill="none" stroke="${hD}" stroke-opacity=".5" stroke-width=".9"/>`:'')+`</g>`}
  /* beard: strands + a shaded underside */
  const bsel=p.bs&&p.bs!=='none'?p.bs:(p.beard&&!fem?'full':'');
  if(bsel==='full'){o+=`<clipPath id="${u}cbd"><path d="M29 62C30 88 44 93 50 93S70 88 71 62C68 77 60 83 50 83S32 77 29 62Z"/></clipPath><g clip-path="url(#${u}cbd)"><rect x="28" y="60" width="44" height="34" fill="url(#${u}bdu)"/>${[36,41,46,51,56,61,66].map((x,i)=>`<path d="M${x} ${76+Math.abs(3-i)}q${(i-3)*.6} 7 ${(i-3)*.4} 12" fill="none" stroke="${sh(hair,i%2?-0.4:0.35)}" stroke-opacity=".28" stroke-width=".6"/>`).join('')}</g>`}
  /* metal: a specular streak and a shaded underside on the helm */
  if(GALEA.has(helm)){o+=`<clipPath id="${u}cm"><path d="M25 58C25 24 75 24 75 58L70 59C68 40 32 40 30 59Z M27 57L29 78L38 76L36 57Z M73 57L71 78L62 76L64 57Z"/></clipPath><g clip-path="url(#${u}cm)"><rect x="24" y="24" width="52" height="56" fill="url(#${u}mt)"/></g><path d="M31 48Q35 34 47 31" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/>`}
  if(DOME.has(helm)){o+=`<clipPath id="${u}cm"><path d="M22 60C20 22 80 22 78 60Z"/></clipPath><g clip-path="url(#${u}cm)"><rect x="20" y="20" width="60" height="42" fill="url(#${u}mt)"/></g><path d="M28 50Q31 34 44 29" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/>`}
  /* the whole bust: a vignette and (big sizes) a fine paper grain */
  o+=`<rect width="100" height="140" fill="url(#${u}vg)"/>`;
  if(opt.grain)o+=`<rect width="100" height="140" filter="url(#${u}gr)" opacity=".10"/>`;
  /* insert: defs first, the cast shadow behind the figure (right after the backdrop's colour disc), the rest on top */
  svg=svg.replace(/(<svg[^>]*>)/,`$1${defs}`);
  svg=svg.replace(/(<rect x="4[12]" y="78" width="1[68]" height="26" rx="6" fill="[^"]+"\/>)/,'$1'+neckL);
  svg=svg.replace(/(<ellipse cx="50" cy="58" rx="2[02]" ry="2[67](?:\.5)?" fill="[^"]+"\/>)/,'$1'+faceL);
  const disc=svg.indexOf('<circle cx="50" cy="62" r="46"');if(disc>0){const end=svg.indexOf('/>',disc)+2;svg=svg.slice(0,end)+back+svg.slice(end)}
  return svg.replace(/<\/svg>$/,o+'</svg>')};
/* ---------- beasts: same light on the token round ---------- */
const HEAD99={feline:'<ellipse cx="50" cy="56" rx="27" ry="25"/>',canine:'<path d="M26 50Q26 30 50 30Q74 30 74 50Q74 66 62 76L50 86L38 76Q26 66 26 50Z"/>',ursine:'<ellipse cx="50" cy="56" rx="30" ry="28"/>',
  boar:'<ellipse cx="50" cy="54" rx="31" ry="25"/>',bovine:'<path d="M28 34Q50 26 72 34Q70 60 64 74Q50 86 36 74Q30 60 28 34Z"/>',cervine:'<path d="M34 36Q50 28 66 36Q66 62 56 82Q50 88 44 82Q34 62 34 36Z"/>',
  serpent:'<path d="M50 24Q78 34 76 54Q72 76 50 84Q28 76 24 54Q22 34 50 24Z"/>',avian:'<circle cx="50" cy="50" r="27"/>',reptile:'<ellipse cx="50" cy="60" rx="34" ry="19"/>',arachnid:'<circle cx="50" cy="56" r="28"/>',giant:'<ellipse cx="50" cy="54" rx="25" ry="31"/>'};
window.beastPolish99=function(svg,F,opt){opt=opt||{};const u='b99'+(++U);const sp=(F&&F.species)||'feline';const c1=(F&&F.c1)||'#b8782e';const ink='#140a04';
  const defs=`<defs><radialGradient id="${u}hl" cx=".32" cy=".25" r=".75"><stop offset="0" stop-color="#fff6e0" stop-opacity=".38"/><stop offset=".5" stop-color="#fff6e0" stop-opacity="0"/></radialGradient>
   <linearGradient id="${u}fs" x1=".2" y1=".15" x2=".95" y2=".95"><stop offset=".45" stop-color="${ink}" stop-opacity="0"/><stop offset="1" stop-color="${ink}" stop-opacity=".5"/></linearGradient>
   <radialGradient id="${u}rec" cx=".5" cy=".5" r=".5"><stop offset=".78" stop-color="${ink}" stop-opacity="0"/><stop offset="1" stop-color="${ink}" stop-opacity=".6"/></radialGradient>
   <radialGradient id="${u}ao"><stop offset="0" stop-color="${ink}" stop-opacity=".5"/><stop offset="1" stop-color="${ink}" stop-opacity="0"/></radialGradient>
   <clipPath id="${u}hc">${HEAD99[sp]||HEAD99.feline}</clipPath></defs>`;
  /* inside the face's own 100×100 frame (the nested svg rtokFaceSVG makes): shade the head, fur strands on the lit edge */
  const fur=['feline','canine','ursine','boar','bovine','cervine','giant'].includes(sp)?Array.from({length:12},(_,i)=>{const a=Math.PI*(1.05+i*0.07);const x=50+Math.cos(a)*24,y=54+Math.sin(a)*22;return `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(a)*-3).toFixed(1)} ${(4+Math.sin(a)*-2).toFixed(1)}" stroke="${sh(c1,0.45)}" stroke-opacity=".65" stroke-width="1" stroke-linecap="round"/>`}).join(''):'';
  const head=`<g clip-path="url(#${u}hc)"><rect width="100" height="100" fill="url(#${u}fs)"/><rect width="100" height="100" fill="url(#${u}hl)"/>${fur}<ellipse cx="50" cy="${sp==='reptile'?72:84}" rx="20" ry="6" fill="url(#${u}ao)"/></g>`;
  /* the face group sits inside the nested svg: <g transform=…>…</g></svg> — add the head pass at the end of that group */
  let out=svg.replace(/(<svg[^>]*viewBox="0 0 100 100"[^>]*>)/,`$1${defs}`);
  const nest=out.indexOf('<svg x=');if(nest>0){const close=out.indexOf('</g></svg>',nest);if(close>0)out=out.slice(0,close)+head+out.slice(close);
    /* a contact shadow under the face, on the token's ground */
    out=out.slice(0,nest)+`<ellipse cx="54" cy="76" rx="26" ry="9" fill="url(#${u}ao)"/>`+out.slice(nest)}
  /* the round: a recessed field and a glint on the bronze rim */
  out=out.replace(/<\/svg>$/,`<circle cx="50" cy="50" r="37.5" fill="url(#${u}rec)"/><path d="M14 32A44 44 0 0 1 38 8" fill="none" stroke="#fff6da" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/></svg>`);
  return out};
})();

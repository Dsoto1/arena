/* banner_engine.js — mock100 "One Banner Press": ONE heraldry engine, five KINDS (shape + frame only).
   Mock-up code (static page helper), NOT game code. Devices = the game's FLAG_SHAPES (flagURI's paths) + the Domus-rank symbols
   (DR_SYM98), both read from the built game by banner_today.js into window.BT. Everything lives in flagURI's 600×340 "charge space",
   so the sculpt layers (scbLayersSVG ×6) and every device line up exactly as they do today.
   A design: {c1,c2,div,dev,fg,motto,sculpt,trim:{gold,tassels,fringe,bar},wear,tail}. kind: flag|banner|pennant|tapestry|crest. */
(function(){
let UID=0;
const DIVS=['plain','pale','fess','quarterly','chevron','bordure','saltire'];
/* the kinds: viewBox, the cloth outline, the field box, where the device sits (cx,cy,scale), the motto line */
const KINDS={
  flag:{vb:[340,232],n:'Flag',sub:'rectangle on a pole'},
  banner:{vb:[200,300],n:'Banner',sub:'vertical · swallow-tail or straight'},
  pennant:{vb:[156,262],n:'Pennant',sub:'rank-style (the dr98 cut)'},
  tapestry:{vb:[420,236],n:'Tapestry',sub:'wide · hung in the stands'},
  crest:{vb:[200,250],n:'Crest',sub:'shield shape'}};
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k<0?v*(1+k):v+(255-v)*k)));return '#'+[f(r),f(g),f(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function geom(kind,d){
  switch(kind){
  case 'flag':{/* a waving cloth: wavy top/bottom edges, the fly edge curls */
    const cut='M22 18 C88 6 150 30 214 16 S300 6 322 14 L326 186 C300 178 262 196 214 190 S100 176 22 196 Z';
    return {cut,box:[18,4,312,196],dev:[172,98,.4],motto:[172,178,22],rib:null}}
  case 'banner':{const straight=d.tail==='straight';
    const cut=straight?'M32 22 H168 V262 H32 Z':'M32 22 H168 V272 L100 236 L32 272 Z';
    return {cut,box:[32,22,136,252],dev:[100,112,.34],motto:[100,straight?236:212,17],band:straight?[32,218,136,28]:[32,194,136,28]}}
  case 'pennant':{const cut='M15.6 18.2 H140.4 V223.6 L78 197.6 L15.6 223.6 Z';return {cut,box:[15.6,18.2,124.8,205.4],dev:[78,104,.3],motto:null,inner:'M26 28.6 H130 V208 L78 185 L26 208 Z'}}
  case 'tapestry':{const cut='M18 20 H402 V200 H18 Z';return {cut,box:[18,20,384,180],dev:[210,98,.36],motto:[210,184,19],border:true}}
  case 'crest':{const cut='M24 22 H176 V108 C176 166 140 200 100 222 C60 200 24 166 24 108 Z';return {cut,box:[24,22,152,200],dev:[100,104,.32],motto:[100,236,14],rib:true,inner:'M33 31 H167 V108 C167 160 134 191 100 211 C66 191 33 160 33 108 Z'}}}}
function division(d,b,id){const [x,y,w,h]=b;const c1=d.c1,c2=d.c2;
  switch(d.div){
  case 'pale':return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c1}"/><rect x="${x+w/2}" y="${y}" width="${w/2}" height="${h}" fill="${c2}"/>`;
  case 'fess':return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c1}"/><rect x="${x}" y="${y+h/2}" width="${w}" height="${h/2}" fill="${c2}"/>`;
  case 'quarterly':return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c1}"/><rect x="${x+w/2}" y="${y}" width="${w/2}" height="${h/2}" fill="${c2}"/><rect x="${x}" y="${y+h/2}" width="${w/2}" height="${h/2}" fill="${c2}"/>`;
  case 'chevron':return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c1}"/><path d="M${x} ${y+h*.78} L${x+w/2} ${y+h*.42} L${x+w} ${y+h*.78} V${y+h*.98} L${x+w/2} ${y+h*.62} L${x} ${y+h*.98}Z" fill="${c2}"/>`;
  case 'saltire':{const t=Math.min(w,h)*.12;return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c1}"/><path d="M${x} ${y} L${x+w} ${y+h}" stroke="${c2}" stroke-width="${t}"/><path d="M${x+w} ${y} L${x} ${y+h}" stroke="${c2}" stroke-width="${t}"/>`}
  case 'bordure':{const t=Math.min(w,h)*.085;return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c2}"/><g data-bordure="1"></g>`}
  default:return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c1}"/>`}}
/* the device in charge space (600×340, centre 300,180): printed devices made solid (the game draws them as .45 watermarks) */
function device(d,lod){const BT=window.BT||{};let s='',k=1;
  if(!d.dev||d.dev==='none')return '';
  if(d.dev.startsWith('sym:')){s=(BT.sym||{})[d.dev.slice(4)]||'';k=1.75;s=s.replace(/FG/g,d.fg)}
  else{s=((BT.dev||{})[d.dev]||'').replace(/FG/g,d.fg).replace(/BG/g,d.c1).replace(/opacity="\.4?5?"/g,'').replace(/opacity="\.5"/g,'')}
  return {s,k}}
function svg(kind,d,opt={}){const id='b'+(++UID);const G=geom(kind,d);const [VW,VH]=KINDS[kind].vb;const lod=opt.px&&opt.px<44; /* small chips: no texture, no motto, no sculpt detail */
  const T=d.trim||{};const wear=+d.wear||0;const gold=T.gold!==false;const GOLD='#d8b25a',GOLD2='#f3d27a',GOLDD='#8a6420';
  const [cx,cy,sc]=G.dev;const dv=device(d,lod);
  const devG=dv&&dv.s?`<g transform="translate(${cx} ${cy}) scale(${sc*dv.k}) translate(-300 -180)"><g transform="translate(5 7)" opacity=".38" filter="url(#${id}sh)">${dv.s.replace(/fill="(?!none)[^"]*"/g,'fill="#000"').replace(/stroke="(?!none)[^"]*"/g,'stroke="#000"')}</g><g stroke="${shade(d.fg,-.55)}" stroke-width="${lod?6:3.5}" stroke-linejoin="round" stroke-opacity=".8">${dv.s}</g></g>`:'';
  const scul=d.sculpt&&!lod?`<g transform="translate(${cx} ${cy}) scale(${sc}) translate(-300 -180) scale(6)">${d.sculpt}</g>`:'';
  const [bx,by,bw,bh]=G.box;let field=division(d,G.box,id);
  if(d.div==='bordure'){const t=Math.min(bw,bh)*.085;const inner=G.inner||G.cut;field+=`<g transform="translate(${bx+bw/2} ${by+bh/2}) scale(${1-2*t/bw} ${1-2*t/bh}) translate(${-(bx+bw/2)} ${-(by+bh/2)})"><path d="${G.cut}" fill="${d.c1}"/></g>`}
  /* folds: hanging cloth = vertical folds; the flag = folds following the wave; the crest = a painted board (light from upper left) */
  const folds=kind==='crest'?`<radialGradient id="${id}f" cx=".3" cy=".22" r=".95"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></radialGradient>`
   :`<linearGradient id="${id}f" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".34"/><stop offset=".13" stop-color="#fff" stop-opacity=".1"/><stop offset=".3" stop-color="#000" stop-opacity=".2"/><stop offset=".47" stop-color="#fff" stop-opacity=".09"/><stop offset=".64" stop-color="#000" stop-opacity=".17"/><stop offset=".82" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity=".36"/></linearGradient>`;
  const vfold=kind==='crest'?'':`<linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".12" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>`;
  const defs=`<defs><clipPath id="${id}c"><path d="${G.cut}"/></clipPath>${folds}${vfold}
    <filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${kind==='crest'?'.55':'1.15 .9'}" numOctaves="2" seed="${7+UID%5}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${kind==='crest'?.32:.5} -.05"/></filter>
    <pattern id="${id}w" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 1.5H3M1.5 0V3" stroke="#000" stroke-opacity=".09" stroke-width=".6"/></pattern>
    <filter id="${id}sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="${id}wr" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="3"/><feDisplacementMap in="SourceGraphic" scale="${(wear*7).toFixed(1)}"/></filter>
    <radialGradient id="${id}vg" cx=".5" cy=".45" r=".7"><stop offset=".55" stop-color="#3a2810" stop-opacity="0"/><stop offset="1" stop-color="#2a1a08" stop-opacity="${(.15+wear*.55).toFixed(2)}"/></radialGradient>
    <linearGradient id="${id}g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${GOLD2}"/><stop offset=".5" stop-color="${GOLD}"/><stop offset="1" stop-color="${GOLDD}"/></linearGradient>
    <linearGradient id="${id}p" x1="0" x2="1"><stop offset="0" stop-color="#3a2614"/><stop offset=".4" stop-color="#8a6236"/><stop offset="1" stop-color="#2a1a0c"/></linearGradient>
    <linearGradient id="${id}ph" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9a7040"/><stop offset=".5" stop-color="#5a3c1e"/><stop offset="1" stop-color="#2a1a0c"/></linearGradient></defs>`;
  /* the motto */
  let motto='';if(G.motto&&d.motto&&!lod){const [mx,my,fs]=G.motto;
    if(kind==='crest')motto=`<path d="M22 228 C40 222 56 240 100 240 C144 240 160 222 178 228 L184 244 C162 238 146 252 100 252 C54 252 38 238 16 244Z" fill="#efe1bf" stroke="#6a4a1c" stroke-width="1.2"/><path d="M22 228 L10 236 L16 244Z M178 228 L190 236 L184 244Z" fill="#c9b48a" stroke="#6a4a1c" stroke-width="1"/><text x="${mx}" y="${my+8}" text-anchor="middle" font-family="Marcellus SC,Georgia,serif" font-size="${fs}" letter-spacing="3" fill="#4a2a10">${d.motto}</text>`;
    else{const band=G.band?`<rect x="${G.band[0]}" y="${G.band[1]}" width="${G.band[2]}" height="${G.band[3]}" fill="${shade(d.c1,-.35)}" opacity=".85"/><rect x="${G.band[0]}" y="${G.band[1]}" width="${G.band[2]}" height="1.6" fill="${GOLD}"/><rect x="${G.band[0]}" y="${G.band[1]+G.band[3]-1.6}" width="${G.band[2]}" height="1.6" fill="${GOLD}"/>`:'';
      motto=`${band}<text x="${mx}" y="${my}" text-anchor="middle" font-family="Marcellus SC,Georgia,serif" font-size="${fs}" letter-spacing="${kind==='tapestry'?8:4}" fill="${d.fg}" stroke="#000" stroke-opacity=".35" stroke-width=".6" paint-order="stroke">${d.motto}</text>`}}
  /* the tapestry's woven border (a meander band) */
  const border=G.border?`<g><rect x="${bx+6}" y="${by+6}" width="${bw-12}" height="${bh-12}" fill="none" stroke="${shade(d.c2,-.1)}" stroke-width="10"/><rect x="${bx+6}" y="${by+6}" width="${bw-12}" height="${bh-12}" fill="none" stroke="${GOLD}" stroke-width="10" stroke-dasharray="5 3 2 3" opacity=".75"/><rect x="${bx+12}" y="${by+12}" width="${bw-24}" height="${bh-24}" fill="none" stroke="${GOLD}" stroke-width="1"/></g>`:'';
  const cloth=`<g clip-path="url(#${id}c)">${field}${border}${devG}${scul}${motto&&kind!=='crest'?motto:''}
    ${lod?'':`<rect width="${VW}" height="${VH}" fill="url(#${id}w)"/><rect width="${VW}" height="${VH}" filter="url(#${id}n)" style="mix-blend-mode:multiply"/>`}
    <rect width="${VW}" height="${VH}" fill="url(#${id}f)"/>${vfold?`<rect width="${VW}" height="${VH}" fill="url(#${id}v)"/>`:''}
    ${wear>0?`<rect width="${VW}" height="${VH}" fill="url(#${id}vg)"/><rect width="${VW}" height="${VH}" fill="#7a5a2a" opacity="${(wear*.22).toFixed(2)}" style="mix-blend-mode:multiply"/>`:''}</g>`;
  const edge=gold?`<path d="${G.cut}" fill="none" stroke="url(#${id}g)" stroke-width="${lod?3.2:kind==='crest'?4:2.6}" stroke-linejoin="round"/>${G.inner&&!lod?`<path d="${G.inner}" fill="none" stroke="${d.fg}" stroke-opacity=".38" stroke-width="1"/>`:''}`
    :`<path d="${G.cut}" fill="none" stroke="${shade(d.c1,-.45)}" stroke-width="1.6"/>`;
  /* trim */
  let back='',front='';
  if(kind==='flag'){back=`<rect x="11" y="6" width="8" height="226" rx="3" fill="url(#${id}ph)" transform="rotate(0)"/><rect x="11" y="6" width="8" height="226" rx="3" fill="url(#${id}p)" opacity=".7"/><circle cx="15" cy="7" r="6.5" fill="url(#${id}g)" stroke="${GOLDD}" stroke-width=".8"/>`;
    if(T.tassels)front+=`<path d="M19 22 C14 40 12 52 13 62" stroke="url(#${id}g)" stroke-width="1.6" fill="none"/>${tassel(13,62,id)}`;
    if(T.fringe&&!lod)front+=fringe(326,14,186,'v',id)}
  if(kind==='banner'||kind==='pennant'||kind==='tapestry'){const x0=kind==='tapestry'?8:kind==='banner'?16:5,x1=VW-x0,y=kind==='pennant'?10:12;
    if(T.bar!==false)back=`<rect x="${x0}" y="${y-3}" width="${x1-x0}" height="${kind==='pennant'?9:7}" rx="3.5" fill="url(#${id}${gold?'g':'ph'})"/><circle cx="${x0}" cy="${y+.5}" r="${kind==='pennant'?7:6}" fill="url(#${id}g)" stroke="${GOLDD}" stroke-width=".8"/><circle cx="${x1}" cy="${y+.5}" r="${kind==='pennant'?7:6}" fill="url(#${id}g)" stroke="${GOLDD}" stroke-width=".8"/>`;
    if(kind==='pennant'&&T.topbar)front+=`<rect x="15.6" y="18.2" width="124.8" height="18" fill="#9b2a1c" clip-path="url(#${id}c)"/><rect x="15.6" y="36" width="124.8" height="2" fill="url(#${id}g)"/>`;
    if(T.tassels){const pts=kind==='banner'?(d.tail==='straight'?[[32,262],[168,262]]:[[32,272],[168,272]]):kind==='pennant'?[[15.6,223.6],[140.4,223.6]]:[[18,200],[402,200]];
      front+=pts.map(([x,y2])=>`<path d="M${x} ${y2} l${x<VW/2?-5:5} 12" stroke="url(#${id}g)" stroke-width="1.6"/>`+tassel(x+(x<VW/2?-5:5),y2+12,id)).join('')}
    if(T.fringe&&!lod){if(kind==='tapestry')front+=fringe(200,22,400,'h',id);else if(kind==='banner'&&d.tail==='straight')front+=fringe(262,34,166,'h',id)}}
  if(kind==='crest'&&!lod){front+=motto}
  return `<svg class="b100 k-${kind}" viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg"${opt.px?` width="${Math.round(opt.px*VW/VH)}" height="${opt.px}"`:''} role="img" aria-label="${KINDS[kind].n}">${defs}${back}<g filter="${wear>0.05?`url(#${id}wr)`:''}"><g transform="translate(2.5 3.5)" opacity=".35"><path d="${G.cut}" fill="#000"/></g>${cloth}${edge}</g>${front}</svg>`}
function tassel(x,y,id){return `<path d="M${x-3.4} ${y+2} L${x+3.4} ${y+2} L${x+4.5} ${y+15} L${x-4.5} ${y+15}Z" fill="url(#${id}g)"/>${[-3,-1,1,3].map(o=>`<path d="M${x+o} ${y+4} L${x+o*1.3} ${y+15}" stroke="#7a5418" stroke-width=".5"/>`).join('')}<circle cx="${x}" cy="${y+1.5}" r="3" fill="url(#${id}g)" stroke="#7a5418" stroke-width=".6"/>`}
function fringe(a,b,c,dir,id){let s='';if(dir==='h'){for(let x=b;x<=c;x+=3.2)s+=`<path d="M${x} ${a} l${(x%7)/7-.5} 9" stroke="url(#${id}g)" stroke-width="1.3"/>`}else{for(let y=b;y<=c;y+=3.4)s+=`<path d="M${a} ${y} l8 ${(y%5)/5-.4}" stroke="url(#${id}g)" stroke-width="1.2"/>`}return s}
window.B100={KINDS,DIVS,svg,shade};
})();

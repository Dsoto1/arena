/* PROTOTYPE ONLY (v0.99 proposal, not game code) — the STRONG polish pass. Loaded into the running game page by strong.js after face99.js.
   face99b(spec, opt) draws the SAME bust as face99 / portraitSVG (same geometry, pose, proportions, silhouette, palette) and then repaints it:
   the SVG string is parsed (DOMParser), every shape is classified by its own fill colour (skin, hair, cloth, metal, gold, fur, leather, leaf,
   straw) and gets a material: a volume gradient lit from the UPPER LEFT (warm key) with a red-shifted shadow side, a COOL RIM from behind
   right, reflected light, cast shadows from the shapes above it (offset copies clipped to what they fall on = ambient occlusion where shapes
   meet), and per-material detail: hair/beard/fur strands following a flow from the crown (beard: from the mouth), sheen band + flyaways,
   specular bands + bevel on metal, folds + weave on cloth, stitches on leather, midribs on leaves. The face gets modelled planes (forehead,
   temples, eye sockets, cheekbones + hollows, nose bridge / side plane / tip / nostrils / underside, philtrum, two-tone lips, nasolabial,
   jaw, chin), eyelids + crease, iris + pupil + catchlights, ear helix / concha, neck muscles + the jaw's shadow, skin pores (cached pattern).
   Backdrop: a painterly gradient + brush strokes + canvas grain (cached pattern); the accent halo stays.
   opt.style 'paint' (soft, textured — default) | 'ink' (ink contours, cel steps, hatching on the shadow side).
   Size tiers by opt.w (output px): ≥120 full · 48–119 no textures/flyaways, fewer strands · <48 lite (volumes, rim, one cast shadow, catchlight).
   beast99b(tokenSVG, F, opt) does the same for a beast token round (fur strands, muzzle modelling, eye glint, mane, bronze medallion relief). */
(function(){
let U=0;const NS='http://www.w3.org/2000/svg';
/* ---------- colour ---------- */
function rgb(c){c=String(c||'').trim();if(c[0]==='#'){let h=c.slice(1);if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h.slice(0,6),16);return isNaN(n)?null:[n>>16,n>>8&255,n&255]}
  const m=c.match(/rgba?\(([^)]+)\)/);return m?m[1].split(',').slice(0,3).map(Number):null}
const hex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mix=(a,b,t)=>{const A=rgb(a)||[128,128,128],B=rgb(b)||[128,128,128];return hex(A.map((v,i)=>v+(B[i]-v)*t))};
const mul=(a,k)=>hex((rgb(a)||[128,128,128]).map(v=>v*k));
const lum=a=>{const c=rgb(a)||[0,0,0];return (.299*c[0]+.587*c[1]+.114*c[2])/255};
const same=(a,b)=>{const A=rgb(a),B=rgb(b);return !!(A&&B)&&Math.abs(A[0]-B[0])+Math.abs(A[1]-B[1])+Math.abs(A[2]-B[2])<5};
const KEY='#fff0d4',RIM='#b8d6f6',INK='#1c1008';
const lightOf=(c,m)=>m==='beast'?mix(c,KEY,.36):m==='skin'?mix(c,KEY,.3):m==='cloth'?mix(c,KEY,.2):lum(c)<.16?mix(c,'#d8c8b4',.3):mix(c,KEY,.28);
const shadowOf=(c,m)=>m==='beast'?mix(mul(c,.64),'#1e1834',.14):m==='skin'?mix(mul(c,.6),'#7a1e16',.2):mix(mul(c,.5),'#1e1834',.22);
const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const f1=v=>Math.round(v*10)/10;
/* ---------- cached textures: built ONCE per page (canvas → data URL), referenced by id from every face ---------- */
let TEX=null;
window.tex99b=function(){if(TEX)return TEX;
  const mk=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');fn(x,w,h);return c.toDataURL('image/png')};
  const R=rng(7);
  const pores=mk(64,64,(x,w,h)=>{for(let i=0;i<340;i++){const px=R()*w,py=R()*h,r=.3+R()*.6;x.fillStyle=R()<.62?`rgba(90,34,22,${.08+R()*.12})`:`rgba(255,240,224,${.08+R()*.12})`;x.beginPath();x.arc(px,py,r,0,7);x.fill()}});
  const canv=mk(128,128,(x,w,h)=>{const d=x.createImageData(w,h);for(let i=0;i<w*h;i++){const v=R();const k=i*4;const l=v<.5?0:255;d.data[k]=d.data[k+1]=d.data[k+2]=l;d.data[k+3]=Math.round(Math.abs(v-.5)*46)}x.putImageData(d,0,0);
    for(let i=0;i<40;i++){x.strokeStyle=R()<.5?`rgba(0,0,0,${.02+R()*.04})`:`rgba(255,240,210,${.02+R()*.035})`;x.lineWidth=1+R()*3;x.beginPath();const a=-0.6+R()*.3,px=R()*w,py=R()*h,l=8+R()*26;x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}});
  TEX=`<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<pattern id="t99skin" patternUnits="userSpaceOnUse" width="13" height="13"><image href="${pores}" width="13" height="13"/></pattern>
<pattern id="t99canvas" patternUnits="userSpaceOnUse" width="44" height="44"><image href="${canv}" width="44" height="44"/></pattern>
<pattern id="t99weave" patternUnits="userSpaceOnUse" width="2.4" height="2.4" patternTransform="rotate(8)"><path d="M0 .6h2.4M0 1.8h2.4" stroke="#000" stroke-opacity=".2" stroke-width=".38"/><path d="M.6 0v2.4M1.8 0v2.4" stroke="#fff" stroke-opacity=".13" stroke-width=".32"/></pattern>
<pattern id="t99hatch" patternUnits="userSpaceOnUse" width="1.9" height="1.9" patternTransform="rotate(38)"><path d="M0 .95h1.9" stroke="${INK}" stroke-width=".42"/></pattern>
</defs></svg>`;
  if(typeof document!=='undefined'&&document.body&&!document.getElementById('t99skin')){const d=document.createElement('div');d.innerHTML=TEX;document.body.appendChild(d.firstChild)}
  return TEX};
/* ---------- a minimal path parser for a rough bounding box ---------- */
function pathBB(d){const t=String(d).match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+)(?:e-?\d+)?/g)||[];let i=0,cmd='',x=0,y=0,sx=0,sy=0;const X=[],Y=[];
  while(i<t.length){if(/[a-zA-Z]/.test(t[i]))cmd=t[i++];const rel=cmd===cmd.toLowerCase(),C=cmd.toUpperCase();if(C==='Z'){x=sx;y=sy;continue}
    const n={M:2,L:2,T:2,H:1,V:1,C:6,S:4,Q:4,A:7}[C];if(!n){i++;continue}const a=[];for(let k=0;k<n;k++)a.push(parseFloat(t[i++]));if(a.some(isNaN))break;
    if(C==='H')x=rel?x+a[0]:a[0];else if(C==='V')y=rel?y+a[0]:a[0];else if(C==='A'){x=rel?x+a[5]:a[5];y=rel?y+a[6]:a[6]}
    else{let lx=x,ly=y;for(let k=0;k<n;k+=2){lx=rel?x+a[k]:a[k];ly=rel?y+a[k+1]:a[k+1];X.push(lx);Y.push(ly)}x=lx;y=ly}
    X.push(x);Y.push(y);if(C==='M'){sx=x;sy=y;cmd=cmd==='M'?'L':'l'}}
  return X.length?{x0:Math.min(...X),y0:Math.min(...Y),x1:Math.max(...X),y1:Math.max(...Y)}:null}
function bbOf(el){const g=k=>parseFloat(el.getAttribute(k)||0);const t=el.tagName;let b=null;
  if(t==='ellipse')b={x0:g('cx')-g('rx'),y0:g('cy')-g('ry'),x1:g('cx')+g('rx'),y1:g('cy')+g('ry')};
  else if(t==='circle')b={x0:g('cx')-g('r'),y0:g('cy')-g('r'),x1:g('cx')+g('r'),y1:g('cy')+g('r')};
  else if(t==='rect')b={x0:g('x'),y0:g('y'),x1:g('x')+g('width'),y1:g('y')+g('height')};
  else if(t==='path')b=pathBB(el.getAttribute('d'));
  if(b){b.w=b.x1-b.x0;b.h=b.y1-b.y0;b.cx=(b.x0+b.x1)/2;b.cy=(b.y0+b.y1)/2}return b}
/* ---------- the shared engine: one doc, one id space, material passes ---------- */
function Engine(svg,opt){const fixed=svg.includes('xmlns=')?svg:svg.replace('<svg ',`<svg xmlns="${NS}" `);
  this.doc=new DOMParser().parseFromString(fixed,'image/svg+xml');this.root=this.doc.documentElement;this.u='q'+(++U)+'_';this.n=0;this.G={};
  this.ink=opt.style==='ink';this.px=opt.w||240;this.tier=this.px>=120?3:this.px>=48?2:1;
  this.defs=this.E('defs',{});this.root.insertBefore(this.defs,this.root.firstChild)}
const P=Engine.prototype;
P.id=function(k){return this.u+k+(++this.n)};
P.E=function(tag,a,parent){const e=this.doc.createElementNS(NS,tag);for(const k in a)if(a[k]!=null)e.setAttribute(k,a[k]);if(parent)parent.appendChild(e);return e};
P.after=function(ref,el){ref.parentNode.insertBefore(el,ref.nextSibling);return el};
P.before=function(ref,el){ref.parentNode.insertBefore(el,ref);return el};
P.frag=function(markup){const d=new DOMParser().parseFromString(`<svg xmlns="${NS}">${markup}</svg>`,'image/svg+xml');const g=this.doc.createElementNS(NS,'g');[...d.documentElement.childNodes].forEach(c=>g.appendChild(this.doc.importNode(c,true)));return g};
P.attrUp=function(el,k){let v=el.getAttribute(k);for(let q=el.parentNode;v==null&&q&&q.getAttribute&&q!==this.root;q=q.parentNode)v=q.getAttribute(k);return v};
P.bare=function(el){const c=el.cloneNode(false);['fill','stroke','stroke-width','opacity','stroke-dasharray','stroke-linecap','clip-path','fill-opacity','stroke-opacity'].forEach(k=>c.removeAttribute(k));return c};
P.clip=function(els){const i=this.id('c');const cp=this.E('clipPath',{id:i},this.defs);els.forEach(e=>cp.appendChild(this.bare(e)));return `url(#${i})`};
P.stops=function(g,a){a.forEach(([o,c,op])=>this.E('stop',{offset:o,'stop-color':c,'stop-opacity':op==null?null:op},g))};
P.grad=function(key,make){if(this.G[key])return this.G[key];const i=this.id('g');make(i);return this.G[key]=`url(#${i})`};
/* volume: a radial key light from the upper left; ink = cel steps */
P.vol=function(c,m){return this.grad('v'+m+c,i=>{const L=lightOf(c,m),S=shadowOf(c,m);const g=this.E('radialGradient',{id:i,cx:'.36',cy:'.3',r:'.8'},this.defs);
  this.stops(g,this.ink&&m==='cloth'?[[0,mix(L,c,.4)],[.6,c],[.6,mix(c,S,.7)],[1,S]]:this.ink?[[0,mix(L,'#fff',.25)],[.16,L],[.16,mix(L,c,.5)],[.42,c],[.7,c],[.7,mix(c,S,.75)],[1,S]]:[[0,mix(L,'#fff',.08)],[.26,mix(L,c,.35)],[.52,c],[.76,mix(c,S,.5)],[.93,S],[1,mix(S,'#000',.1)]])})};
P.cyl=function(c,m){return this.grad('y'+m+c,i=>{const L=lightOf(c,m),S=shadowOf(c,m);const g=this.E('linearGradient',{id:i,x1:0,y1:0,x2:1,y2:0},this.defs);
  this.stops(g,this.ink?[[0,mix(L,c,.4)],[.58,c],[.58,mix(c,S,.7)],[1,S]]:[[0,mix(c,L,.5)],[.25,mix(L,c,.3)],[.5,c],[.8,S],[1,mix(S,'#000',.12)]])})};
P.cloth=function(c){if(this.ink)return this.vol(c,'cloth');return this.grad('k'+c,i=>{const L=lightOf(c,'cloth'),S=shadowOf(c,'cloth');const g=this.E('linearGradient',{id:i,x1:'.15',y1:'0',x2:'.6',y2:'1'},this.defs);
  this.stops(g,[[0,L],[.34,c],[.72,mix(c,S,.5)],[1,S]])})};
/* metal / gold: specular bands (sky, horizon, ground) */
P.metal=function(c,gold){return this.grad('m'+gold+c,i=>{const W=gold?'#fff4cc':'#ffffff',D=gold?'#3a2408':'#1a2028';const g=this.E('linearGradient',{id:i,x1:'.15',y1:'0',x2:'.55',y2:'1'},this.defs);
  this.stops(g,this.ink?[[0,mix(c,W,.7)],[.2,mix(c,W,.7)],[.2,c],[.55,c],[.55,mix(c,D,.45)],[.8,mix(c,D,.45)],[.8,mix(c,W,.25)],[1,mix(c,D,.3)]]
    :[[0,mix(c,W,.45)],[.14,mix(c,W,.85)],[.24,mix(c,W,.25)],[.44,c],[.58,mix(c,D,.5)],[.7,mix(c,D,.25)],[.8,mix(c,W,.3)],[.9,mix(c,D,.2)],[1,mix(c,D,.5)]])})};
P.rimG=function(col,op,dir){return this.grad('r'+col+op+dir,i=>{const v=dir==='b'?{x1:0,y1:0,x2:.2,y2:1}:{x1:0,y1:.15,x2:1,y2:.85};const g=this.E('linearGradient',{id:i,...v},this.defs);
  this.stops(g,dir==='b'?[[.72,col,0],[.92,col,op*.6],[1,col,op]]:[[.58,col,0],[.85,col,op*.55],[1,col,op]])})};
/* rim: the shape's own outline, shifted, stroked with a gradient, clipped to the shape → a crescent on the far edge */
P.rim=function(el,o){o=o||{};const w=(o.w||1.4)*.7,dx=o.dx!=null?o.dx:-w,dy=o.dy!=null?o.dy:w*.45;const g=this.E('g',{'clip-path':this.clip([el])});
  const r=this.bare(el);r.setAttribute('transform',`translate(${f1(dx)} ${f1(dy)}) ${el.getAttribute('transform')||''}`.trim());r.setAttribute('fill','none');r.setAttribute('stroke',this.rimG(o.col||RIM,o.op||.6,o.dir||'r'));r.setAttribute('stroke-width',w*2.2);g.appendChild(r);return g};
/* cast shadows: offset copies of the occluders, clipped to the receivers */
P.cast=function(receivers,occluders,o){o=o||{};const g=this.E('g',{'clip-path':this.clip(receivers)});const layers=this.ink||this.tier<2?[[o.dx||1.3,o.dy||2.2,(o.op||.36)*1.25]]:[[(o.dx||1.3)*.7,(o.dy||2.2)*.7,(o.op||.36)*.65],[(o.dx||1.3)*1.6,(o.dy||2.2)*1.6,(o.op||.36)*.45]];
  for(const [dx,dy,op] of layers){const s=this.E('g',{opacity:f1(op*100)/100,transform:`translate(${f1(dx)} ${f1(dy)})`},g);occluders.forEach(e=>{const c=this.bare(e);c.setAttribute('fill',o.col||'#140804');if(e.getAttribute('fill')==='none'||(!e.getAttribute('fill')&&this.attrUp(e,'fill')==='none')){c.setAttribute('fill','none');c.setAttribute('stroke',o.col||'#140804');c.setAttribute('stroke-width',e.getAttribute('stroke-width')||this.attrUp(e,'stroke-width')||1)}s.appendChild(c)})}
  return g};
/* strands in a flow field (hair, beard, fur, mane) */
P.strands=function(el,c,b,o){const R=rng(o.seed||((b.x0*73+b.y0*31+b.w*7)|0));const N=Math.min(o.max||150,Math.round(Math.max(o.min||0,b.w*b.h/(o.area||9))*(this.tier===3?1:.38)));
  const sf=o.soft?.55:1;const dk=lum(c)>.7?mix(c,'#4a3a2a',.42):mix(mul(c,.5),INK,.2),lt=lum(c)<.16?mix(c,'#c9b8a6',.42*sf):mix(c,'#fff8e8',.32*sf),hi=lum(c)<.16?mix(c,'#e6d8c8',.55*sf):mix(c,'#fffaf0',.6*sf);
  const D={d:'',l:'',h:''};const [ox,oy]=o.origin;
  for(let k=0;k<N;k++){const x=b.x0+R()*b.w,y=b.y0+R()*b.h;let vx=x-ox,vy=y-oy;const L0=Math.hypot(vx,vy)||1;vx/=L0;vy/=L0;if(o.down){vy=Math.abs(vy)+.6;const n=Math.hypot(vx,vy);vx/=n;vy/=n}
    const L=(o.len||[3,8])[0]+R()*((o.len||[3,8])[1]-(o.len||[3,8])[0]),cu=(R()-.5)*(o.curl||2.2);const ex=x+vx*L,ey=y+vy*L,mx=(x+ex)/2-vy*cu,my=(y+ey)/2+vx*cu;
    const lit=(x-b.x0)/b.w+(y-b.y0)/b.h<.95;const r=R();const key=lit&&r<.3?'h':r<.58?'d':lit||r<.78?'l':'d';D[key]+=`M${f1(x)} ${f1(y)}Q${f1(mx)} ${f1(my)} ${f1(ex)} ${f1(ey)}`}
  const g=this.E('g',{'clip-path':o.noclip?null:this.clip([el]),fill:'none','stroke-linecap':'round'});const sw=o.sw||.5;
  if(D.d)this.E('path',{d:D.d,stroke:dk,'stroke-opacity':this.ink?.7:.5,'stroke-width':sw*1.1},g);if(D.l)this.E('path',{d:D.l,stroke:lt,'stroke-opacity':.45,'stroke-width':sw},g);if(D.h)this.E('path',{d:D.h,stroke:hi,'stroke-opacity':.62,'stroke-width':sw*.8},g);
  return g};
P.out=function(){return new XMLSerializer().serializeToString(this.root)};
/* ---------- materials ---------- */
const METAL=['#a9b2ba','#949da6','#8f979e','#9aa3ab','#b3bcc4','#5d656d','#c9d0d6','#9aa0a6','#8a8f98','#c9ced4'];
const GOLD=['#e8c86a','#c9a458','#b8963a','#e6b93a','#d8b866'];
const FUR=['#7a5a3a','#6a5a4a','#b8862a','#d9a441','#c9983a'];
const LEAF=['#7fae4a','#5f8a3a'];const LEATHER=['#5a3a1e','#7a4a22','#6a4520','#3f2812'];const STRAW=['#e2c477','#d8b866'];
const CLOTHL=['#efe6d2','#e8dcc0','#d9ccb0','#f2efe6'];
const BARE=new Set(['none','laurel','diadem','flowers','goldwreath','circlet','band','straw']);
/* ---------- the human face ---------- */
window.face99b=function(spec,opt){opt=opt||{};spec=spec||{};const color=opt.color||spec.color||'#c0433a';
  let base={...spec};const mantle=spec.garb==='mantle';if(mantle)base.garb='toga';if(spec.helm==='straw')base.helm='none';
  let s=portraitSVG(base,color);
  if(mantle)s=s.replace(/fill="#efe6d2"/,`fill="${spec.tunic||'#e8dcc0'}"`).replace(/stroke="#8a1c1c" stroke-width="5"/,`stroke="${spec.robe||'#5a4636'}" stroke-width="9"`);
  if(spec.helm==='straw')s=s.replace(/<\/svg>$/,`<ellipse cx="50" cy="40" rx="34" ry="7" fill="#d8b866" stroke="#8a6a2a"/><path d="M32 40C32 22 68 22 68 40Z" fill="#e2c477" stroke="#8a6a2a"/><path d="M33 36h34" stroke="#8a4a2a" stroke-width="2.2"/></svg>`);
  if(opt.polish!==false){tex99b();s=strong99(s,spec,{...opt,color})}
  const FR={bust:'0 0 100 140',chip:'6 30 88 88',head:'12 28 76 76'};s=s.replace('viewBox="0 0 100 140"',`viewBox="${FR[opt.frame||'bust']}"`);
  if(opt.w)s=s.replace('<svg ',`<svg width="${opt.w}" height="${opt.h||opt.w}" `);
  return s};
function strong99(svg,p,opt){const X=new Engine(svg,opt),root=X.root,ink=X.ink,T=X.tier;
  const skin=p.skin||SKINS[1],hair=p.hair||HAIRS[1],acc=opt.color,fem=!!p.fem,helm=p.helm||'none',hs=p.hs||(p.long?'long':'');
  const dkAcc=shade(acc,-0.35),bare=BARE.has(helm);
  const all=[...root.querySelectorAll('path,ellipse,circle,rect')];
  const A=k=>el=>el.getAttribute(k);
  const bg=all.find(e=>e.tagName==='rect'&&A('width')(e)==='100'&&A('height')(e)==='140');
  const disc=all.find(e=>e.tagName==='circle'&&A('r')(e)==='46');
  const dStart=(e,pre)=>e.tagName==='path'&&(e.getAttribute('d')||'').startsWith(pre);
  const bodyO=all.find(e=>dStart(e,'M6 140C8 110')||dStart(e,'M12 140C14 112'));
  const bodyI=all.find(e=>dStart(e,'M20 140C22 117 34 107 50 107S')||dStart(e,'M24 140C26 118'));
  const neck=all.find(e=>e.tagName==='rect'&&A('y')(e)==='78');
  const ears=all.filter(e=>e.tagName==='ellipse'&&A('cy')(e)==='62'&&['28','72','30','70'].includes(A('cx')(e)));
  const face=all.find(e=>e.tagName==='ellipse'&&A('cx')(e)==='50'&&A('cy')(e)==='58');
  const eyes=all.filter(e=>e.tagName==='ellipse'&&A('cy')(e)==='58'&&A('rx')(e)==='3'&&['41','59'].includes(A('cx')(e)));
  const mouth=all.find(e=>dStart(e,'M44 77Q50'));const brows=all.find(e=>dStart(e,'M35 52L46 53'));const nose=all.find(e=>dStart(e,'M50 60L47 70'));
  const fixed=new Set([bg,disc,bodyO,bodyI,neck,face,mouth,brows,nose,...ears,...eyes].filter(Boolean));
  const matOf=c=>{if(!c||c==='none'||c.startsWith('url'))return null;if(same(c,skin))return 'skin';if(same(c,hair))return 'hair';
    if(METAL.some(m=>same(m,c)))return 'metal';if(GOLD.some(m=>same(m,c)))return 'gold';if(STRAW.some(m=>same(m,c)))return 'straw';if(FUR.some(m=>same(m,c)))return 'fur';if(LEAF.some(m=>same(m,c)))return 'leaf';
    if(LEATHER.some(m=>same(m,c)))return 'leather';if(same(c,acc)||same(c,dkAcc)||CLOTHL.some(m=>same(m,c))||(p.tunic&&same(c,p.tunic))||(p.robe&&same(c,p.robe))||same(c,'#8a1c1c'))return 'cloth';return null};
  const faceIdx=all.indexOf(face);
  const items=all.filter(e=>!fixed.has(e)).map(e=>{const f=X.attrUp(e,'fill'),st=X.attrUp(e,'stroke');const filled=f&&f!=='none';const col=filled?f:st;const b=bbOf(e);
    return {e,b,filled,col,mat:matOf(col),sw:parseFloat(X.attrUp(e,'stroke-width')||1),after:all.indexOf(e)>faceIdx}}).filter(o=>o.b&&o.mat);
  const shSkin=shadowOf(skin,'skin'),ltSkin=lightOf(skin,'skin');
  /* ----- backdrop: painterly gradient, brush strokes, canvas grain; the accent halo becomes a soft glow ----- */
  if(bg&&!root.querySelector('image')){const c=bg.getAttribute('fill');bg.setAttribute('fill',X.grad('bg'+c,i=>{const g=X.E('radialGradient',{id:i,cx:'.34',cy:'.28',r:'.95'},X.defs);
      X.stops(g,ink?[[0,mix(c,'#fff2d0',.14)],[.55,c],[1,mul(c,.6)]]:[[0,mix(c,'#ffe6b8',.13)],[.4,mix(c,'#ffe6b8',.03)],[.75,c],[1,mul(c,.55)]])}));
    if(!ink&&T>=2){X.after(bg,X.frag(`<g fill="none" stroke-linecap="round"><path d="M-6 30C20 18 46 22 70 10" stroke="${mix(c,'#ffe2b0',.3)}" stroke-opacity=".1" stroke-width="16"/><path d="M60 128C80 116 96 98 112 92" stroke="${mul(c,.5)}" stroke-opacity=".3" stroke-width="22"/><path d="M-8 96C6 88 14 74 12 60" stroke="${mix(c,acc,.35)}" stroke-opacity=".14" stroke-width="12"/>${T===3?'<rect width="100" height="140" fill="url(#t99canvas)" opacity=".3"/>':''}</g>`))}}
  if(disc){disc.setAttribute('opacity','1');disc.setAttribute('fill',X.grad('disc'+acc,i=>{const g=X.E('radialGradient',{id:i,cx:'.42',cy:'.38',r:'.62'},X.defs);X.stops(g,[[0,mix(acc,'#ffe8c0',.2),.27],[.8,acc,.17],[1,acc,.12]])}));
    /* the figure's soft shadow on the backdrop (light from the upper left) */
    const sh=X.frag(`<g opacity="${ink?.32:.38}" fill="#0c0604"><ellipse cx="57" cy="66" rx="24" ry="30" opacity=".7"/><path d="M66 140C68 116 82 106 100 108V140Z"/></g>`);X.after(disc,sh)}
  /* ----- body and garb ----- */
  const occBody=[neck,face,...items.filter(o=>o.after&&o.filled&&['hair','cloth','metal','gold','fur'].includes(o.mat)&&o.b.y1>92&&o.b.y0<100&&o.b.w<40).map(o=>o.e)].filter(Boolean);
  for(const el of [bodyO,bodyI].filter(Boolean)){const c=el.getAttribute('fill');el.setAttribute('fill',X.cloth(c));let last=el;
    if(T>=2){const fd=el===bodyO?`M14 132Q17 118 27 109M86 132Q83 118 73 109`:fem?`M37 140C38 132 40 124 44 116M63 140C62 132 60 124 56 116`:`M37 140C38 131 40 124 43 119M62 140C62 132 60 126 57 121`;
      const g=X.E('g',{'clip-path':X.clip([el]),fill:'none','stroke-linecap':'round'});X.E('path',{d:fd,stroke:shadowOf(c,'cloth'),'stroke-opacity':ink?.6:.3,'stroke-width':ink?.9:1.5},g);
      if(!ink)X.E('path',{d:fd,stroke:lightOf(c,'cloth'),'stroke-opacity':.22,'stroke-width':1,transform:'translate(-1.2 -.2)'},g);
      if(T===3)X.E('rect',{x:0,y:96,width:100,height:44,fill:'url(#t99canvas)',opacity:ink?.3:.55},g);
      if(el===bodyO)X.E('path',{d:fem?'M15 134C17 114 31 103 48 101':'M9 134C12 112 28 101 48 99.4',stroke:lightOf(c,'cloth'),'stroke-opacity':.22,'stroke-width':2},g);last=X.after(last,g)}
    if(el===bodyO)last=X.after(last,X.rim(el,{w:1.4,op:.4}));
    if(ink&&el===bodyO){el.setAttribute('stroke',INK);el.setAttribute('stroke-width','1.2')}
    if(el===bodyI)X.after(last,X.cast([bodyO,bodyI].filter(Boolean),occBody,{dx:2,dy:3.6,op:.42}))}
  /* ----- neck: a cylinder, the jaw's shadow, the muscles, AO at the collar ----- */
  if(neck){neck.setAttribute('fill',X.cyl(skin,'skin'));let last=neck;
    const occN=[face,...items.filter(o=>o.after&&o.filled&&['hair','metal','cloth','fur'].includes(o.mat)&&o.b.y1>80&&o.b.y0<92).map(o=>o.e)].filter(Boolean);
    last=X.after(last,X.cast([neck],occN,{dx:1.3,dy:3,op:.55,col:mix(shSkin,'#000',.35)}));
    if(T>=2)last=X.after(last,X.frag(`<g clip-path="${X.clip([neck])}" fill="none" stroke-linecap="round"><path d="M${fem?44.5:43.5} 88Q46 96 48 103M${fem?55.5:56.5} 88Q54 96 52 103" stroke="${shSkin}" stroke-opacity=".38" stroke-width=".8"/><path d="M${fem?43.6:42.6} 89Q45 96 47 103" stroke="${ltSkin}" stroke-opacity=".3" stroke-width=".7"/><ellipse cx="50" cy="104" rx="7" ry="2.6" fill="${mix(shSkin,'#000',.3)}" stroke="none" opacity=".45"/>${ink&&T>=2?`<rect x="${fem?54:55}" y="78" width="6" height="26" fill="${shSkin}" opacity=".35"/>`:''}</g>`));
    if(ink){neck.setAttribute('stroke',INK);neck.setAttribute('stroke-width','.9')}}
  /* ----- ears: helix, concha, AO where they meet the head; rim on the far ear ----- */
  if(ears.length===2){ears.forEach(e=>{e.setAttribute('fill',X.vol(skin,'skin'));if(ink){e.setAttribute('stroke',INK);e.setAttribute('stroke-width','.9')}});
    const L=(cx,mir,lit)=>{const s=fem?'scale(.88 .86)':'';const t=`translate(${cx} 62) ${mir?'scale(-1 1)':''} ${s} translate(-28 -62)`;
      return `<g transform="${t}" fill="none" stroke-linecap="round"><path d="M27.6 55.4Q23.3 56.6 23.6 62Q24 67.4 27.6 69.3" stroke="${lit?ltSkin:shSkin}" stroke-opacity="${lit?.55:.4}" stroke-width=".85"/><path d="M28.6 58Q25.9 59.2 26.1 62.4Q26.4 65.6 28.7 66.6" stroke="${shSkin}" stroke-opacity=".6" stroke-width=".8"/><ellipse cx="27.7" cy="62.6" rx="1.5" ry="2.7" fill="${mix(shSkin,'#000',.2)}" stroke="none" opacity="${lit?.38:.5}"/><circle cx="26.4" cy="68.1" r=".7" fill="${ltSkin}" stroke="none" opacity="${lit?.5:.2}"/></g>`};
    const ex=fem?30:28;const g=X.frag(`<g clip-path="${X.clip(ears)}">${T>=2?L(ex,false,true)+L(100-ex,true,false):''}<circle cx="${ex+4.5}" cy="62" r="4.5" fill="#140804" opacity=".32"/><circle cx="${100-ex-4.5}" cy="62" r="4.5" fill="#140804" opacity=".42"/></g>`);
    X.after(ears[1],g);X.after(g,X.rim(ears[1],{w:1.2}))}
  /* ----- the face: volume, modelled planes, lips, texture, cast shadows from hair/headgear, rim + reflected light ----- */
  if(face){face.setAttribute('fill',X.vol(skin,'skin'));if(ink){face.setAttribute('stroke',INK);face.setAttribute('stroke-width','1')}
    const ao=X.grad('ao',i=>{const g=X.E('radialGradient',{id:i},X.defs);X.stops(g,[[0,mix(shSkin,'#000',.25),.9],[1,mix(shSkin,'#000',.25),0]])});
    const li=X.grad('li',i=>{const g=X.E('radialGradient',{id:i},X.defs);X.stops(g,[[0,'#fff6e8',.85],[1,'#fff6e8',0]])});
    const wm=X.grad('wm',i=>{const g=X.E('radialGradient',{id:i},X.defs);X.stops(g,[[0,'#d8503a',.5],[1,'#d8503a',0]])});
    const sm=p.smile?2:0;const k=fem?.6:1;
    const lipU=fem?mix(skin,'#8a2234',.55):mix(skin,'#7a3a2c',.4),lipL=fem?mix(skin,'#c44a5c',.45):mix(skin,'#b0625a',.3);
    let m='';
    if(T>=2){m+=`<ellipse cx="44" cy="42" rx="10" ry="6" fill="${li}" opacity=".55"/><ellipse cx="40" cy="50.4" rx="4.5" ry="1.3" fill="${li}" opacity=".4"/><ellipse cx="70" cy="50" rx="5" ry="9" fill="${ao}" opacity=".45"/>`
      +`<ellipse cx="41" cy="56.6" rx="6.8" ry="4.5" fill="${ao}" opacity=".6"/><ellipse cx="59" cy="56.6" rx="6.8" ry="4.5" fill="${ao}" opacity=".72"/>`
      +`<ellipse cx="36.6" cy="63.4" rx="5.6" ry="2.4" fill="${li}" opacity=".55" transform="rotate(-18 36.6 63.4)"/><ellipse cx="63.6" cy="63.4" rx="4" ry="1.8" fill="${li}" opacity=".22" transform="rotate(18 63.6 63.4)"/>`
      +`<ellipse cx="35.5" cy="70.6" rx="5.5" ry="2.6" fill="${ao}" opacity="${.22*k}"/><ellipse cx="65" cy="70.2" rx="5.5" ry="3" fill="${ao}" opacity="${.36*k}"/>`
      +`<ellipse cx="37" cy="68.6" rx="6" ry="4" fill="${wm}" opacity=".5"/><ellipse cx="63" cy="68.6" rx="5.6" ry="3.8" fill="${wm}" opacity=".4"/><circle cx="50" cy="68.4" r="2.4" fill="${wm}" opacity=".35"/>`
      /* nose: bridge light, side plane, tip, wings, nostrils, the shadow under it */
      +`<path d="M50.7 61Q52 65 52.9 69.3L50.9 69.8Q50.2 65 50.7 61Z" fill="${shSkin}" opacity=".26"/><path d="M52.4 67.1Q54.1 68.6 52.9 70.4" fill="none" stroke="${shSkin}" stroke-opacity=".5" stroke-width=".55"/>`
      +`<path d="M49.4 57.8Q48.7 62.6 48.4 66.4" fill="none" stroke="${ltSkin}" stroke-opacity=".7" stroke-width=".95" stroke-linecap="round"/><circle cx="49.5" cy="68.3" r="1.25" fill="${li}"/>`
      +`<ellipse cx="48.3" cy="70.6" rx=".95" ry=".45" fill="${mix(shSkin,'#000',.45)}" opacity=".55"/><ellipse cx="51.8" cy="70.6" rx=".95" ry=".45" fill="${mix(shSkin,'#000',.45)}" opacity=".5"/><ellipse cx="50.4" cy="71.7" rx="3.7" ry="1.2" fill="${ao}" opacity=".8"/>`
      /* philtrum, nasolabial, lips, chin, jaw */
      +`<path d="M49.2 72.3L49 75.4M51.3 72.3L51.5 75.4" stroke="${shSkin}" stroke-opacity=".14" stroke-width=".5"/><ellipse cx="50.2" cy="74" rx=".8" ry="1.4" fill="${li}" opacity=".35"/>`
      +(fem?'':`<path d="M45.6 70.9Q43.7 73.4 43.9 76.3M54.6 70.9Q56.5 73.4 56.3 76.3" fill="none" stroke="${shSkin}" stroke-opacity=".2" stroke-width=".55"/>`)
      +`<path d="M44.6 77.1Q47.5 ${f1(75.2+sm*.6)} 50 ${f1(76.1+sm*.8)}Q52.5 ${f1(75.2+sm*.6)} 55.4 77.1Q50 ${f1(77.8+sm)} 44.6 77.1Z" fill="${lipU}"/><path d="M45.3 77.4Q50 ${f1(81.6+sm)} 54.7 77.4Q50 ${f1(78.5+sm)} 45.3 77.4Z" fill="${lipL}"/>`
      +`<ellipse cx="49.4" cy="${f1(79.5+sm)}" rx="2.2" ry=".55" fill="#fff4ea" opacity=".45"/><ellipse cx="50" cy="${f1(81.8+sm)}" rx="3.4" ry="1" fill="${ao}" opacity=".75"/><circle cx="44.2" cy="77.1" r=".6" fill="${mix(shSkin,'#000',.4)}" opacity=".5"/><circle cx="55.8" cy="77.1" r=".6" fill="${mix(shSkin,'#000',.4)}" opacity=".5"/>`
      +`<ellipse cx="49" cy="83" rx="3.6" ry="1.7" fill="${li}" opacity=".5"/><path d="M30.6 66Q31.6 76 38 82" fill="none" stroke="${ltSkin}" stroke-opacity=".3" stroke-width="1.4"/><path d="M60 83.6Q66 80.6 70 72" fill="none" stroke="${shSkin}" stroke-opacity=".35" stroke-width="1.6"/>`}
    else m+=`<ellipse cx="59" cy="56.6" rx="6" ry="4" fill="${ao}" opacity=".45"/><path d="M50.6 60.4Q52.3 65 53.5 69.5L50.8 70Z" fill="${shSkin}" opacity=".45"/><ellipse cx="50.4" cy="71.7" rx="3.6" ry="1.2" fill="${ao}" opacity=".6"/><path d="M45 77.4Q50 81 55 77.4Z" fill="${lipL}"/>`;
    if(T===3&&!ink)m+=`<rect x="20" y="28" width="60" height="60" fill="url(#t99skin)" opacity=".7"/>`;
    if(ink&&T>=2){const e=(cx,cy,rx,ry)=>`M${cx-rx} ${cy}a${rx} ${ry} 0 1 0 ${rx*2} 0a${rx} ${ry} 0 1 0 ${-rx*2} 0`;const cr=`${e(50,58,fem?20:22,fem?26.5:27)}${e(46.6,55.2,fem?20:22,fem?26.5:27)}`;m+=`<path d="${cr}" fill-rule="evenodd" fill="${shSkin}" opacity=".38"/><path d="${cr}" fill-rule="evenodd" fill="url(#t99hatch)" opacity=".22"/>`}
    const planes=X.frag(`<g clip-path="${X.clip([face,...ears])}"><g ${fem?'transform="translate(50 58) scale(.92 .98) translate(-50 -58)"':''}>${m}</g></g>`);let last=X.after(face,planes);
    /* hair / headgear cast onto the face and ears */
    const occF=items.filter(o=>o.after&&o.filled&&['hair','metal','gold','cloth','fur','straw','leaf'].includes(o.mat)&&o.b.y0<84&&o.b.w>2.5).map(o=>o.e);
    if(occF.length)last=X.after(last,X.cast([face,...ears],occF,{dx:1.1,dy:1.9,op:.5,col:mix(shSkin,'#000',.45)}));
    last=X.after(last,X.rim(face,{w:1.4,col:mix(RIM,skin,.3),op:.5}));
    if(!ink&&T>=2)last=X.after(last,X.rim(face,{w:1.6,dx:-.6,dy:-1.6,col:mix(acc,'#ffd2a0',.55),op:.2,dir:'b'}))}
  /* ----- eyes: lids, crease, iris, pupil, catchlights ----- */
  eyes.forEach((e,i)=>{const cx=+e.getAttribute('cx'),cy=58;const blind=i===1&&p.mark==='blind',patch=i===1&&p.mark==='patch';if(patch)return;
    const ec=p.eyes||'#1a120c';const irisC=lum(ec)<.12?'#6a4428':mix(ec,'#fff',.12);let m='';
    if(T>=2&&!blind){const ig=X.grad('iris'+irisC,j=>{const g=X.E('radialGradient',{id:j,cx:'.5',cy:'.62',r:'.6'},X.defs);X.stops(g,[[0,mix(irisC,'#fff2c8',.35)],[.6,irisC],[1,mul(irisC,.45)]])});
      m+=`<circle cx="${cx+.2}" cy="${cy+.1}" r="1.85" fill="${ig}"/><circle cx="${cx+.2}" cy="${cy+.1}" r=".85" fill="#0a0604"/>`}
    if(blind)m+=`<ellipse cx="${cx}" cy="${cy}" rx="2.4" ry="1.7" fill="#eef0ee" opacity=".7"/>`;
    m+=`<circle cx="${cx-.75}" cy="${cy-.75}" r="${T>=2?.62:.75}" fill="#fff" opacity=".95"/>`;
    if(T>=2)m+=`<circle cx="${cx+.95}" cy="${cy+.7}" r=".3" fill="#fff" opacity=".55"/><path d="M${cx-3.4} ${cy-.1}Q${cx} ${cy-3.1} ${cx+3.4} ${cy-.1}" fill="none" stroke="${INK}" stroke-opacity=".85" stroke-width="1.05" stroke-linecap="round"/>`
      +`<path d="M${cx-3.1} ${cy-2.1}Q${cx} ${cy-4.7} ${cx+3.4} ${cy-1.9}" fill="none" stroke="${shSkin}" stroke-opacity=".6" stroke-width=".55"/><path d="M${cx-2.6} ${cy+1.95}Q${cx} ${cy+3} ${cx+2.6} ${cy+1.95}" fill="none" stroke="${ltSkin}" stroke-opacity=".7" stroke-width=".5"/>`;
    X.after(e,X.frag(m))});
  if(brows&&T>=2)X.after(brows,X.frag(`<path d="M35.6 51.3L45.6 52.3M54.4 52.3L64.4 51.3" stroke="#fff4e0" stroke-opacity=".28" stroke-width=".7" stroke-linecap="round"/>`));
  /* ----- everything else, by material ----- */
  const crown=[50,24];
  for(const o of items){const {e,b,mat,filled}=o;const c=o.col;
    if(!filled){/* stroked pieces: jewellery, braids, baldric, sashes, scars */
      const w=o.sw;if(w<1&&mat!=='gold')continue;const hl=mat==='metal'||mat==='gold'?mix(c,'#ffffff',.7):mix(c,'#fff4dc',.42);
      const sh=X.bare(e);sh.setAttribute('fill','none');sh.setAttribute('stroke',INK);sh.setAttribute('stroke-opacity',ink?'.55':'.35');sh.setAttribute('stroke-width',w);sh.setAttribute('transform',`translate(.7 1) ${e.getAttribute('transform')||''}`.trim());if(e.getAttribute('stroke-dasharray'))sh.setAttribute('stroke-dasharray',e.getAttribute('stroke-dasharray'));X.before(e,sh);
      if(T>=2||mat==='gold'){const h=X.bare(e);h.setAttribute('fill','none');h.setAttribute('stroke',hl);h.setAttribute('stroke-opacity',mat==='gold'||mat==='metal'?'.9':'.55');h.setAttribute('stroke-width',f1(Math.max(.35,w*.32)));h.setAttribute('transform',`translate(-.35 -.45) ${e.getAttribute('transform')||''}`.trim());
        if(mat==='hair'&&w>=3)h.setAttribute('stroke-dasharray','1.3 1.7');if(e.getAttribute('stroke-dasharray'))h.setAttribute('stroke-dasharray',e.getAttribute('stroke-dasharray'));X.after(e,h);
        if(mat==='leather'&&w>=4&&T===3){const st=X.bare(e);st.setAttribute('fill','none');st.setAttribute('stroke','#e8c890');st.setAttribute('stroke-opacity','.55');st.setAttribute('stroke-width','.32');st.setAttribute('stroke-dasharray','1 1.3');st.setAttribute('transform','translate(.9 -.9)');X.after(h,st)}}
      continue}
    let last=e;
    if(mat==='metal'||mat==='gold'){e.setAttribute('fill',X.metal(c,mat==='gold'));
      if(T>=2){const bv=X.E('g',{'clip-path':X.clip([e])});const b1=X.bare(e);b1.setAttribute('fill','none');b1.setAttribute('stroke','#fff');b1.setAttribute('stroke-opacity','.42');b1.setAttribute('stroke-width','1.3');bv.appendChild(b1);
        const b2=X.bare(e);b2.setAttribute('fill','none');b2.setAttribute('stroke',mat==='gold'?'#3a2408':'#10161c');b2.setAttribute('stroke-opacity','.4');b2.setAttribute('stroke-width','1.4');b2.setAttribute('transform',`translate(.9 1.1) ${e.getAttribute('transform')||''}`.trim());bv.appendChild(b2);last=X.after(last,bv)}
      if(b.w>24&&b.y0<40)last=X.after(last,X.frag(`<g clip-path="${X.clip([e])}"><path d="M${f1(b.x0+b.w*.16)} ${f1(b.y0+b.h*.62)}Q${f1(b.x0+b.w*.2)} ${f1(b.y0+b.h*.2)} ${f1(b.x0+b.w*.44)} ${f1(b.y0+b.h*.1)}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="1.5" stroke-linecap="round"/><circle cx="${f1(b.x0+b.w*.3)}" cy="${f1(b.y0+b.h*.22)}" r="1.3" fill="#fff" opacity=".9"/></g>`));
      else if(b.w<12&&T>=2)last=X.after(last,X.frag(`<circle cx="${f1(b.x0+b.w*.32)}" cy="${f1(b.y0+b.h*.3)}" r="${f1(Math.max(.4,b.w*.12))}" fill="#fff" opacity=".85"/>`));
      if(b.w>24)last=X.after(last,X.rim(e,{w:1.2}));
      if(ink&&b.w>8){e.setAttribute('stroke',INK);e.setAttribute('stroke-width','.9')}continue}
    e.setAttribute('fill',X.vol(c,mat==='hair'?'hair':mat));
    if(mat==='hair'){const beard=b.y0>=61&&b.cx>34&&b.cx<66;const big=b.w*b.h>40;
      if(T>=2&&big){last=X.after(last,X.strands(e,c,b,beard?{origin:[50,58],len:[2,4.5],curl:2.8,area:5,down:true,soft:true}:{origin:crown,len:[4,9],curl:2.2,area:5,min:90,max:200,sw:.4}));
        if(!beard&&b.y0<50){const sb=`M${f1(b.x0+b.w*.12)} ${f1(b.y0+b.h*.66)}Q${f1(b.x0+b.w*.28)} ${f1(b.y0+b.h*.16)} ${f1(b.x0+b.w*.62)} ${f1(b.y0+b.h*.14)}`;
          last=X.after(last,X.frag(`<g clip-path="${X.clip([e])}" fill="none" stroke-linecap="round"><path d="${sb}" stroke="${lum(c)<.16?'#d8c8b8':mix(c,'#fff8e6',.55)}" stroke-opacity="${ink?.55:.3}" stroke-width="${ink?1.4:3}"/>${ink?'':`<path d="${sb}" stroke="#fffaf0" stroke-opacity=".35" stroke-width=".8"/>`}</g>`))}
        const cm=(e.getAttribute('d')||'').match(/^M\s*([-\d.]+)[ ,]([-\d.]+)\s*C\s*([-\d.]+)[ ,]([-\d.]+)[ ,]([-\d.]+)[ ,]([-\d.]+)[ ,]([-\d.]+)[ ,]([-\d.]+)/);
        if(cm&&!beard&&T===3&&!ink&&bare&&b.y0<46&&hs!=='bald'){const q=cm.slice(1).map(Number);const R=rng(b.x0*13|0);let d='';for(let i=0;i<11;i++){const t=.1+i*.08,u=1-t;
            const x=u*u*u*q[0]+3*u*u*t*q[2]+3*u*t*t*q[4]+t*t*t*q[6],y=u*u*u*q[1]+3*u*u*t*q[3]+3*u*t*t*q[5]+t*t*t*q[7];
            let tx=3*u*u*(q[2]-q[0])+6*u*t*(q[4]-q[2])+3*t*t*(q[6]-q[4]),ty=3*u*u*(q[3]-q[1])+6*u*t*(q[5]-q[3])+3*t*t*(q[7]-q[5]);const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;const nx=ty,ny=-tx;const r1=R()-.5,r2=R();
            d+=`M${f1(x-nx*.7)} ${f1(y-ny*.7)}Q${f1(x+nx*1.4+tx*r1*2.4)} ${f1(y+ny*1.4+ty*r1*2.4)} ${f1(x+nx*(1.8+r2*1.6)+tx*r1*3.6)} ${f1(y+ny*(1.8+r2*1.6)+ty*r1*3.6)}`}
          last=X.after(last,X.frag(`<path d="${d}" fill="none" stroke="${mix(c,'#fff4dc',.25)}" stroke-opacity=".55" stroke-width=".38" stroke-linecap="round"/>`))}}
      if(big&&!beard&&b.y0<50&&b.w>16)last=X.after(last,X.rim(e,{w:1.2}));
      if(ink&&b.w*b.h>120){e.setAttribute('stroke',INK);e.setAttribute('stroke-width','.9')}continue}
    if(mat==='fur'&&T>=2&&b.w*b.h>40){last=X.after(last,X.strands(e,c,b,{origin:[b.cx,b.y0-6],len:[2,4],curl:2,area:5,sw:.55}));if(ink){e.setAttribute('stroke',INK);e.setAttribute('stroke-width','.9')}continue}
    if(mat==='cloth'&&b.w>=14&&b.h>=8){const big=b.w>=28;if(T>=2&&big&&b.y0<60){last=X.after(last,X.frag(`<g clip-path="${X.clip([e])}">${T===3?`<rect x="${b.x0}" y="${b.y0}" width="${b.w}" height="${b.h}" fill="url(#t99weave)" opacity=".45"/>`:''}<path d="M${f1(b.x0+b.w*.2)} ${f1(b.y0+b.h*.5)}Q${f1(b.cx)} ${f1(b.y0+b.h*.1)} ${f1(b.x1-b.w*.15)} ${f1(b.y0+b.h*.45)}" fill="none" stroke="#fff8e8" stroke-opacity=".3" stroke-width="1.6" stroke-linecap="round"/></g>`))}
      else if(T>=2&&big){const g=X.E('g',{'clip-path':X.clip([e]),fill:'none','stroke-linecap':'round'});
        const d=[-1,0,1].map(k=>{const xs=b.cx+k*b.w*.12,ys=b.y0+b.h*.14,xe=b.cx+k*b.w*.3,ye=b.y1;return `M${f1(xs)} ${f1(ys)}Q${f1(xs+(xe-xs)*.3+k*2)} ${f1(ys+b.h*.5)} ${f1(xe)} ${f1(ye)}`}).join('');
        X.E('path',{d,stroke:shadowOf(c,'cloth'),'stroke-opacity':ink?.6:.4,'stroke-width':ink?.9:1.6},g);if(!ink)X.E('path',{d,stroke:lightOf(c,'cloth'),'stroke-opacity':.3,'stroke-width':1,transform:'translate(-1.2 -.2)'},g);
        if(T===3)X.E('rect',{x:b.x0,y:b.y0,width:b.w,height:b.h,fill:'url(#t99canvas)',opacity:.5},g);last=X.after(last,g)}
      if(b.y0>=95&&big)last=X.after(last,X.cast([e],occBody,{dx:2,dy:3.6,op:.4}));
      if(big&&b.y0<70)last=X.after(last,X.rim(e,{w:1.1,op:.35}));
      if(ink&&big){e.setAttribute('stroke',INK);e.setAttribute('stroke-width','.9')}continue}
    if(mat==='leaf'&&T>=2&&e.tagName==='ellipse'){const m=X.bare(e);m.setAttribute('ry',f1(+e.getAttribute('ry')*.2));m.setAttribute('fill','#e8f4b0');m.setAttribute('opacity','.55');last=X.after(last,m);continue}
    if(mat==='straw'&&T===3){last=X.after(last,X.frag(`<g clip-path="${X.clip([e])}"><rect x="${b.x0}" y="${b.y0}" width="${b.w}" height="${b.h}" fill="url(#t99weave)" opacity=".9"/></g>`))}
  }
  /* ----- the whole bust: warm key wash, cool fill from the right, vignette, grain ----- */
  const vg=X.grad('vg',i=>{const g=X.E('radialGradient',{id:i,cx:'.44',cy:'.4',r:'.85'},X.defs);X.stops(g,[[.5,'#000',0],[1,'#000',ink?.4:.6]])});
  const kw=X.grad('kw',i=>{const g=X.E('radialGradient',{id:i,cx:'.2',cy:'.14',r:'.7'},X.defs);X.stops(g,[[0,'#ffd8a0',.12],[1,'#ffd8a0',0]])});
  const cf=X.grad('cf',i=>{const g=X.E('linearGradient',{id:i,x1:0,y1:0,x2:1,y2:0},X.defs);X.stops(g,[[.6,'#7aa8e0',0],[1,'#7aa8e0',.14]])});
  root.appendChild(X.frag(`<rect width="100" height="140" fill="${kw}"/><rect width="100" height="140" fill="${cf}"/><rect width="100" height="140" fill="${vg}"/>${T===3&&!ink?'<rect width="100" height="140" fill="url(#t99canvas)" opacity=".16"/>':''}`));
  return X.out()}
/* ---------- beasts: the token round as a bronze medallion with a painted face ---------- */
window.beast99b=function(svg,F,opt){opt=opt||{};tex99b();const X=new Engine(svg,opt),root=X.root,ink=X.ink,T=X.tier;F=F||{};
  const c1=F.c1||'#b8782e',c2=F.c2||'#e8d4a0',ey=F.eyes||'#f0cf7d',dk=shade(c1,-0.35),mane=shade(c2,-0.45),sp=F.species||'feline';
  const nest=root.querySelector('svg');
  /* the ring: specular sweep, bevel, rivet glints; the recess: shadow at the top-left wall, light on the lower-right lip */
  const ringEnd=[...root.children].find(e=>e.tagName==='circle'&&e.getAttribute('r')==='37');
  const arc=(r,a0,a1)=>{const p=a=>[50+Math.cos(a)*r,50+Math.sin(a)*r].map(f1).join(' ');return `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`};
  const ringFx=`<g fill="none" stroke-linecap="round"><path d="${arc(44.5,Math.PI*1.02,Math.PI*1.62)}" stroke="#fff6da" stroke-opacity="${ink?.6:.22}" stroke-width="${ink?1.4:4}"/><path d="${arc(45.5,Math.PI*1.12,Math.PI*1.45)}" stroke="#fff" stroke-opacity=".75" stroke-width="1.1"/><path d="${arc(44,Math.PI*.05,Math.PI*.6)}" stroke="#1a0c02" stroke-opacity=".25" stroke-width="${ink?1.2:2.4}"/><circle cx="50" cy="50" r="49.3" stroke="${INK}" stroke-opacity="${ink?.9:.5}" stroke-width="${ink?1.2:.8}"/></g>`
    +Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;const x=50+Math.cos(a)*42.5,y=50+Math.sin(a)*42.5;return `<circle cx="${f1(x+.7)}" cy="${f1(y+.8)}" r="1.4" fill="#1a0c02" opacity=".35"/><circle cx="${f1(x-.55)}" cy="${f1(y-.55)}" r=".6" fill="#fff" opacity=".8"/>`}).join('');
  if(ringEnd&&T<3)X.after(ringEnd,X.frag(ringFx));
  if(ringEnd&&T===3){const recess=`<path d="${'M13 50a37 37 0 1 0 74 0a37 37 0 1 0 -74 0'}M15.4 52.6a37 37 0 1 0 74 0a37 37 0 1 0 -74 0" fill-rule="evenodd" fill="#0a0502" opacity=".5"/>`;X.after(ringEnd,X.frag(ringFx));
    root.appendChild(X.frag(`<g clip-path="${X.clip([ringEnd])}">${recess}<circle cx="50" cy="50" r="36.4" fill="none" stroke="#fff3d0" stroke-opacity=".0"/><path d="${arc(36.6,Math.PI*.05,Math.PI*.55)}" fill="none" stroke="#ffe6b0" stroke-opacity=".45" stroke-width="1"/></g>`))}
  if(!nest)return X.out();
  const grp=nest.querySelector('g');const parts=grp?[...grp.querySelectorAll('path,ellipse,circle,rect')]:[];
  /* the face's own backdrop */
  const fbg=[...nest.children].find(e=>e.tagName==='rect');if(fbg){const c=fbg.getAttribute('fill');fbg.setAttribute('fill',X.grad('fb'+c,i=>{const g=X.E('radialGradient',{id:i,cx:'.36',cy:'.3',r:'.85'},X.defs);X.stops(g,[[0,mix(c,'#ffe4b0',.24)],[.55,c],[1,mul(c,.4)]])}));
    if(!ink&&T===3)X.after(fbg,X.frag(`<rect width="100" height="100" fill="url(#t99canvas)" opacity=".6"/>`))}
  const info=parts.map(e=>{const f=X.attrUp(e,'fill'),s=X.attrUp(e,'stroke');const filled=f&&f!=='none';return {e,b:bbOf(e),filled,col:filled?f:s,sw:parseFloat(X.attrUp(e,'stroke-width')||1)}}).filter(o=>o.b);
  const is=(o,c)=>same(o.col,c);
  const furs=info.filter(o=>o.filled&&(is(o,c1)||is(o,dk)));const head=furs.slice().sort((a,b)=>b.b.w*b.b.h-a.b.w*a.b.h)[0];
  const H=head?head.b:{cx:50,cy:56,x0:24,y0:30,w:52,h:52,x1:76,y1:82};
  /* the head's shadow on the ground behind it */
  if(grp&&head&&grp.firstChild){const sh=X.E('g',{transform:'translate(2.6 3.4)',opacity:ink?.5:.42});const s0=X.bare(head.e);s0.setAttribute('fill','#0a0402');sh.appendChild(s0);
    const mn=info.find(o=>o.filled&&is(o,mane)&&o.b.w>50);if(mn){const s1=X.bare(mn.e);s1.setAttribute('fill','#0a0402');sh.appendChild(s1)}grp.insertBefore(sh,grp.firstChild)}
  for(const o of info){const {e,b}=o;let last=e;
    if(!o.filled){if(o.sw>=2.4&&T>=2){const h=X.bare(e);h.setAttribute('fill','none');h.setAttribute('stroke',mix(o.col,'#fff8e8',.5));h.setAttribute('stroke-opacity','.6');h.setAttribute('stroke-width',f1(o.sw*.3));h.setAttribute('transform','translate(-.4 -.5)');X.after(e,h)}continue}
    if(is(o,mane)&&b.w>50){e.setAttribute('fill',X.vol(mane,'fur'));if(T>=2)last=X.after(last,X.strands(e,mane,b,{origin:[50,54],len:[5,11],curl:3,area:5,sw:.7,max:220}));
      const occ=[head.e,...info.filter(q=>q.filled&&is(q,c1)&&q!==head&&q.b.y0<45).map(q=>q.e)];last=X.after(last,X.cast([e],occ,{dx:1.6,dy:2.4,op:.55}));if(ink){e.setAttribute('stroke',INK);e.setAttribute('stroke-width','1.1')}continue}
    if(is(o,c1)||is(o,dk)||is(o,shade(c1,0.2))||is(o,shade(c1,-0.25))){const c=o.col;e.setAttribute('fill',X.vol(c,'beast'));
      if(T>=2&&b.w*b.h>30)last=X.after(last,X.strands(e,c,b,{origin:o===head?[H.cx,H.cy+6]:[b.cx,b.y1+4],len:o===head?[2.2,4.6]:[2,4],curl:1.6,area:o===head?3.2:4,sw:.5,max:260}));
      if(o===head){/* muzzle modelling on the head: bridge light, eye sockets, cheeks; the pads cast onto it */
        const ex=info.filter(q=>q.filled&&same(q.col,ey)&&q.e.tagName==='ellipse');const pads=info.filter(q=>q.filled&&is(q,c2)&&q.b.y0>H.y0+H.h*.4);
        let m='';const ao=X.grad('bao',i=>{const g=X.E('radialGradient',{id:i},X.defs);X.stops(g,[[0,'#120602',.75],[1,'#120602',0]])}),li=X.grad('bli',i=>{const g=X.E('radialGradient',{id:i},X.defs);X.stops(g,[[0,'#fff2d8',.8],[1,'#fff2d8',0]])});
        if(T>=2){ex.forEach(q=>{m+=`<ellipse cx="${f1(q.b.cx)}" cy="${f1(q.b.cy-.4)}" rx="${f1(q.b.w*1.05)}" ry="${f1(q.b.h*1.05)}" fill="${ao}" opacity=".7"/>`});
          m+=`<ellipse cx="${f1(H.cx-1)}" cy="${f1(H.y0+H.h*.42)}" rx="3.4" ry="${f1(H.h*.18)}" fill="${li}" opacity=".7"/><ellipse cx="${f1(H.x0+H.w*.28)}" cy="${f1(H.y0+H.h*.3)}" rx="${f1(H.w*.16)}" ry="${f1(H.h*.12)}" fill="${li}" opacity=".55"/><ellipse cx="${f1(H.x1-H.w*.22)}" cy="${f1(H.y0+H.h*.62)}" rx="${f1(H.w*.16)}" ry="${f1(H.h*.2)}" fill="${ao}" opacity=".5"/>`}
        if(ink&&T>=2){const e2=(cx,cy,rx,ry)=>`M${cx-rx} ${cy}a${rx} ${ry} 0 1 0 ${rx*2} 0a${rx} ${ry} 0 1 0 ${-rx*2} 0`;m+=`<path d="${e2(H.cx,H.cy,H.w/2,H.h/2)}${e2(H.cx-5,H.cy-4,H.w/2,H.h/2)}" fill-rule="evenodd" fill="url(#t99hatch)" opacity=".45"/>`}
        if(m)last=X.after(last,X.frag(`<g clip-path="${X.clip([e])}">${m}</g>`));
        if(pads.length)last=X.after(last,X.cast([e],pads.map(q=>q.e),{dx:.9,dy:1.6,op:.5}));
        last=X.after(last,X.rim(e,{w:1.4,col:mix(RIM,c1,.35),op:.4}))}
      if(ink&&b.w*b.h>30){e.setAttribute('stroke',INK);e.setAttribute('stroke-width','1')}continue}
    if(is(o,c2)){e.setAttribute('fill',X.vol(c2,'beast'));if(T>=2&&b.w>8){let m=`<ellipse cx="${f1(b.cx-b.w*.12)}" cy="${f1(b.y0+b.h*.3)}" rx="${f1(b.w*.3)}" ry="${f1(b.h*.2)}" fill="#fffaf0" opacity=".45"/>`;
        if(['feline','canine'].includes(sp)&&b.w<22)for(let r=0;r<3;r++)for(let k=0;k<3;k++)m+=`<circle cx="${f1(b.cx-b.w*.22+k*b.w*.2+(b.cx<50?0:1))}" cy="${f1(b.cy-1+r*1.5)}" r=".38" fill="#2a1408" opacity=".55"/>`;
        last=X.after(last,X.frag(`<g clip-path="${X.clip([e])}">${m}</g>`))}if(T===3&&b.w*b.h>60)last=X.after(last,X.strands(e,c2,b,{origin:[b.cx,b.y0-4],len:[1.6,3],curl:1.2,area:4,sw:.4}));
      if(ink){e.setAttribute('stroke',INK);e.setAttribute('stroke-width','.8')}continue}
    if(same(o.col,ey)&&e.tagName==='ellipse'){const ig=X.grad('bey'+ey,i=>{const g=X.E('radialGradient',{id:i,cx:'.5',cy:'.66',r:'.62'},X.defs);X.stops(g,[[0,mix(ey,'#fffbe0',.55)],[.55,ey],[1,mul(ey,.45)]])});e.setAttribute('fill',ig);
      const cx=b.cx,cy=b.cy,rx=b.w/2,ry=b.h/2;let m=`<path d="M${f1(cx-rx-.6)} ${f1(cy-.2)}Q${f1(cx)} ${f1(cy-ry*2.1)} ${f1(cx+rx+.6)} ${f1(cy-.2)}Q${f1(cx)} ${f1(cy-ry*1.05)} ${f1(cx-rx-.6)} ${f1(cy-.2)}Z" fill="#140802" opacity=".55"/>`;
      /* the glint: inserted after the eye's own catchlight so it sits on top */
      const nx=[e.nextSibling,e.nextSibling&&e.nextSibling.nextSibling].find(q=>q&&q.getAttribute&&q.getAttribute('fill')==='#fff')||e.nextSibling||e;
      X.after(e,X.frag(`<g clip-path="${X.clip([e])}">${m}</g>`));
      X.after(nx,X.frag(`<circle cx="${f1(cx-rx*.32)}" cy="${f1(cy-ry*.38)}" r="${f1(rx*.24)}" fill="#fff"/>${T>=2?`<path d="M${f1(cx-rx*.32)} ${f1(cy-ry*.38-rx*.55)}v${f1(rx*1.1)}M${f1(cx-rx*.32-rx*.55)} ${f1(cy-ry*.38)}h${f1(rx*1.1)}" stroke="#fff" stroke-opacity=".7" stroke-width=".35" stroke-linecap="round"/><circle cx="${f1(cx+rx*.38)}" cy="${f1(cy+ry*.36)}" r="${f1(rx*.1)}" fill="#fff" opacity=".6"/>`:''}`));continue}
    if(['#1a1210','#6a3a30','#3a1a14','#120a06'].some(c=>same(o.col,c))&&b.w>3){e.setAttribute('fill',X.vol(o.col,'fur'));if(T>=2&&b.w>4)X.after(e,X.frag(`<ellipse cx="${f1(b.x0+b.w*.32)}" cy="${f1(b.y0+b.h*.3)}" rx="${f1(b.w*.18)}" ry="${f1(b.h*.14)}" fill="#fff" opacity=".55"/>`));continue}
    if(['#f5efe0','#e8dcc0'].some(c=>same(o.col,c))){e.setAttribute('fill',X.vol(o.col,'ivory'));continue}
    if(['#e6b93a','#c9d0d6','#8a8f98'].some(c=>same(o.col,c))){e.setAttribute('fill',X.metal(o.col,same(o.col,'#e6b93a')));continue}
  }
  /* a domed glaze over the whole disc */
  const gl=X.grad('gl',i=>{const g=X.E('radialGradient',{id:i,cx:'.34',cy:'.26',r:'.7'},X.defs);X.stops(g,[[0,'#fff6e0',ink?.12:.22],[.5,'#fff6e0',0],[.85,'#000',0],[1,'#000',T===3?.35:.12]])});
  if(ringEnd)root.appendChild(X.frag(`<circle cx="50" cy="50" r="37" fill="${gl}"/>`));
  return X.out()};
})();

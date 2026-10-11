/* =====================================================================
   268-V99FACE2 · ONE FACE, phase 2 (tools/plans/mock99/PORTRAITS.md §5 raster cache · §6 the strong PAINTERLY pass · §7 variety parts + §7b)
   =====================================================================
   Virgilante approved (2026-10-08) the strong painterly polish and all twelve face VARIETY parts. This module makes them THE painter:
   face99(spec,opt) (263) is replaced; 263's adapters, frames, Settings row and kill switch stay.
   PAINTER (production port of face99b.js + face99v.js): the bust geometry (263 FACE99.geom chain + mantle/straw) → the variety
     PRE-PASS (face profile, jaw, cheekbones, brows, eyes, eye set, nose, lips, ears, neck, age, lines; beards/earrings/marks follow) →
     the PAINTERLY pass (materials by fill colour, volume light from the upper left, cool rim, cast shadows, face planes, eyes, ears,
     neck, hair/beard strands, metal bands, cloth folds, backdrop). The prototypes parsed with DOMParser; here a small string tree
     (p99 / V99 / ser99: our own markup only — elements, attributes, text) takes its place: no DOM, no serializer, ~0.1 ms parse.
   SIZE TIERS by the BUST-equivalent px (a crop counts its bust width): ≥120 full (pores, weave, flyaways, all strands) · 48–119 no
     textures/flyaways, ⅓ of the strands · 33–47 lite (volumes, one rim, one cast shadow, catchlight) · ≤32 no polish (shapes only).
     Canvas grain only ≥150 px. A size-less call (portraitSVG) paints the 48–119 tier.
   VARIETY KEY fx (FACE1, packed): one base-36 char per part (fs jw ck br ey es ns lp ea nk ag ln, '0' = today's shape) + a 13th char
     kh ('1' = keep the hair colour when old); trailing zeros dropped (≤13 chars). A loose key (editor draft) also counts.
   GENERATED FACES roll every part at DRAW time (§7b, his call: no version gate): a look the GAME generated with gladPortrait (Manager
     fighters + free agents + rivals, Ludus/Hall records, CPU seats; recognised by gladPortrait's own key list skin,hair,helm,beard,long,
     smile,scar,paint,bg — plus fem/color — that survives saves in order) and every crowd look (spectators, regulars, residents, council
     advisors) get fx from a SECOND hash stream fnv('fx:'+its generated fields) — the look's own content IS a function of its id, so the
     same fighter gets the same face on every screen (gArt, pArt, Match Week…) without knowing the id there. Never Math.random / dice.
     Stored / custom faces (Studio characters, lanistas, Manager houses, online looks, patrons) keep today's shapes until fx is set.
     The 🎲 random look (58 randomPortrait: Studio, online creator, new career) now rolls the parts too (UI randomness).
   LOOSE ENDS: the broken nose is softened at ≥120 px (gentler bend, thinner stroke, fainter scar); 'old' greys the hair unless kh;
     helmets/headgear with cheek guards widen with a round/diamond/square face (helmK ≤ ×1.12, metal pieces only).
   RASTER CACHE (§5): portraitHTML, portraitSVG and the crowd faces (specFaceSVG / face83 / patrons) return a tiny
     <svg viewBox=frame><image data-f99=id href=…></svg> whose picture is the painted face drawn ONCE per (spec+fx, frame, tier,
     colour, device px): first a data: URL of the SVG (sync), then in idle time a JPEG data: URL of it (q .92; every frame is opaque) at the shown size × devicePixelRatio (canvas → blob url) swapped
     into every <image data-f99=id> on the page. LRU ≤ R99.MAX entries (faces still on the page are kept); a changed spec = a new key.
     Lists show small images instead of thousands of SVG shapes. Vector stays where a picture can't go: the Summa Rudis card (a data:
     URL), a custom banner backdrop (flag:c:, the live draft) — those paint the 48–119 tier with fresh ids each call.
   SETTINGS.face99: Full = the tiers above · Light = the lite tier at every size · Off = today's flat look (263 phase 1, inline SVG,
     byte-identical to the old painters). Default Full on every device (the cache makes it cheap; the code has no weak-device heuristic).
   DESIGNER (Character + Lanista designers, Studio and Manager new career — only ADDED into 262's Appearance / Portrait tab):
     a "🧬 Features" card: twelve part tabs, the chosen part's options as small face thumbnails, Keep hair colour, 🎲 Random features,
     ↺ Today's shape → the draft portrait's fx. Online: cleanLook / cleanPatron already take any flat key ≤40 chars → fx needs NO server change.
   Kill switch: localStorage flavius_face99off=1 (263) → none of this runs. Debug: localStorage flavius_face99png=0 keeps the SVG pictures (no bitmap step).
   ===================================================================== */
/* ---------- a tiny string tree for our own SVG markup (replaces DOMParser / XMLSerializer) ---------- */
class V99{constructor(tag){this.tagName=tag;this.A=new Map();this.kids=[];this.parentNode=null}
  getAttribute(k){const v=this.A.get(k);return v===undefined?null:v}
  setAttribute(k,v){this.A.set(k,String(v))}
  removeAttribute(k){this.A.delete(k)}
  hasAttribute(k){return this.A.has(k)}
  get children(){return this.kids.filter(k=>k.tagName)}
  get childNodes(){return this.kids}
  get firstChild(){return this.kids[0]||null}
  get nextSibling(){const p=this.parentNode;if(!p)return null;return p.kids[p.kids.indexOf(this)+1]||null}
  appendChild(n){det99(n);n.parentNode=this;this.kids.push(n);return n}
  insertBefore(n,ref){if(!ref)return this.appendChild(n);det99(n);const i=this.kids.indexOf(ref);n.parentNode=this;if(i<0)this.kids.push(n);else this.kids.splice(i,0,n);return n}
  replaceChild(n,old){if(this.kids.indexOf(old)<0)return old;det99(n);const j=this.kids.indexOf(old);this.kids[j]=n;n.parentNode=this;old.parentNode=null;return old}
  cloneNode(deep){const c=new V99(this.tagName);this.A.forEach((v,k)=>c.A.set(k,v));if(deep)this.kids.forEach(k=>c.appendChild(k.cloneNode(true)));return c}
  querySelectorAll(sel){const T=new Set(String(sel).split(',').map(s=>s.trim()));const out=[];const walk=n=>{for(const k of n.kids)if(k.tagName){if(T.has(k.tagName))out.push(k);walk(k)}};walk(this);return out}
  querySelector(sel){return this.querySelectorAll(sel)[0]||null}}
class T99{constructor(t){this.text=t;this.parentNode=null}cloneNode(){return new T99(this.text)}get nextSibling(){const p=this.parentNode;return p?p.kids[p.kids.indexOf(this)+1]||null:null}}
function det99(n){const p=n.parentNode;if(p){const i=p.kids.indexOf(n);if(i>=0)p.kids.splice(i,1);n.parentNode=null}}
const DOC99={createElementNS:(ns,t)=>new V99(t),importNode:n=>n};
/* p99(markup) → a '#frag' node holding the parsed elements (our own markup: double/single-quoted attributes, no comments) */
function p99(str){const root=new V99('#frag');let cur=root;const re=/<(\/?)([a-zA-Z][\w:.-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>|([^<]+)/g;let m;
  while((m=re.exec(str))){if(m[5]!=null){if(m[5].trim())cur.appendChild(new T99(m[5]));continue}
    if(m[1]){cur=cur.parentNode||root;continue}
    const e=new V99(m[2]);const ar=/([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;let a;while((a=ar.exec(m[3])))e.A.set(a[1],a[2]!=null?a[2]:a[3]);cur.appendChild(e);if(!m[4])cur=e}
  return root}
function ser99(n){if(!n.tagName)return n.text;let s='<'+n.tagName;n.A.forEach((v,k)=>{s+=' '+k+'="'+String(v).replace(/"/g,'&quot;')+'"'});
  if(!n.kids.length)return s+'/>';s+='>';for(const k of n.kids)s+=ser99(k);return s+'</'+n.tagName+'>'}
/* ---- the painterly engine (ported from tools/plans/mock99/face99b.js: the mini tree below replaces DOMParser/XMLSerializer) ---- */
const F2B=(()=>{let U=0;const NS='http://www.w3.org/2000/svg';
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
function Engine(svg,opt){this.doc=DOC99;this.root=p99(svg).children[0];this.u=opt.uid||('q'+(++U)+'_');this.n=0;this.G={};
  this.ink=false;this.tier=opt.T||1;this.grain=!!opt.grain;
  this.defs=this.E('defs',{});this.root.insertBefore(this.defs,this.root.firstChild)}
const P=Engine.prototype;
P.id=function(k){return this.u+k+(++this.n)};
P.E=function(tag,a,parent){const e=this.doc.createElementNS(NS,tag);for(const k in a)if(a[k]!=null)e.setAttribute(k,a[k]);if(parent)parent.appendChild(e);return e};
P.after=function(ref,el){ref.parentNode.insertBefore(el,ref.nextSibling);return el};
P.before=function(ref,el){ref.parentNode.insertBefore(el,ref);return el};
P.frag=function(markup){const d=p99(markup);const g=new V99('g');[...d.kids].forEach(c=>g.appendChild(c));return g};
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
P.out=function(){return ser99(this.root)};
/* ---------- materials ---------- */
const METAL=['#a9b2ba','#949da6','#8f979e','#9aa3ab','#b3bcc4','#5d656d','#c9d0d6','#9aa0a6','#8a8f98','#c9ced4'];
const GOLD=['#e8c86a','#c9a458','#b8963a','#e6b93a','#d8b866'];
const FUR=['#7a5a3a','#6a5a4a','#b8862a','#d9a441','#c9983a'];
const LEAF=['#7fae4a','#5f8a3a'];const LEATHER=['#5a3a1e','#7a4a22','#6a4520','#3f2812'];const STRAW=['#e2c477','#d8b866'];
const CLOTHL=['#efe6d2','#e8dcc0','#d9ccb0','#f2efe6'];
const BARE=new Set(['none','laurel','diadem','flowers','goldwreath','circlet','band','straw']);
function strong99(svg,p,opt){const X=new Engine(svg,opt),root=X.root,ink=X.ink,T=X.tier;
  const skin=p.skin||SKINS[1],hair=p.hair||HAIRS[1],acc=opt.color,fem=!!p.fem,helm=p.helm||'none',hs=p.hs||(p.long?'long':'');
  const dkAcc=shade(acc,-0.35),bare=BARE.has(helm);
  const all=[...root.querySelectorAll('path,ellipse,circle,rect')];
  const A=k=>el=>el.getAttribute(k);
  const bg=all.find(e=>e.tagName==='rect'&&A('width')(e)==='100'&&A('height')(e)==='140');
  const disc=all.find(e=>e.tagName==='circle'&&A('r')(e)==='46');
  const dStart=(e,pre)=>e.tagName==='path'&&(e.getAttribute('d')||'').startsWith(pre);
  /* variety (variety.js): opt.geo = shape-aware hooks; the parts it reshaped carry data-v and are found by that tag */
  const G=opt.geo||null;const V=k=>all.filter(e=>e.getAttribute('data-v')===k);
  const bodyO=V('bodyO')[0]||all.find(e=>dStart(e,'M6 140C8 110')||dStart(e,'M12 140C14 112'));
  const bodyI=V('bodyI')[0]||all.find(e=>dStart(e,'M20 140C22 117 34 107 50 107S')||dStart(e,'M24 140C26 118'));
  const neck=V('neck')[0]||all.find(e=>e.tagName==='rect'&&A('y')(e)==='78');
  const ears=G&&V('ear').length?V('ear'):all.filter(e=>e.tagName==='ellipse'&&A('cy')(e)==='62'&&['28','72','30','70'].includes(A('cx')(e)));
  const face=V('face')[0]||all.find(e=>e.tagName==='ellipse'&&A('cx')(e)==='50'&&A('cy')(e)==='58');
  const eyes=G&&V('eye').length?V('eye'):all.filter(e=>e.tagName==='ellipse'&&A('cy')(e)==='58'&&A('rx')(e)==='3'&&['41','59'].includes(A('cx')(e)));
  const mouth=V('mouth')[0]||all.find(e=>dStart(e,'M44 77Q50'));const brows=V('brows')[0]||all.find(e=>dStart(e,'M35 52L46 53'));const nose=V('nose')[0]||all.find(e=>dStart(e,'M50 60L47 70'));
  const fixed=new Set([bg,disc,bodyO,bodyI,neck,face,mouth,brows,nose,...ears,...eyes,...all.filter(e=>e.hasAttribute('data-v'))].filter(Boolean));
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
    if(!ink&&T>=2){X.after(bg,X.frag(`<g fill="none" stroke-linecap="round"><path d="M-6 30C20 18 46 22 70 10" stroke="${mix(c,'#ffe2b0',.3)}" stroke-opacity=".1" stroke-width="16"/><path d="M60 128C80 116 96 98 112 92" stroke="${mul(c,.5)}" stroke-opacity=".3" stroke-width="22"/><path d="M-8 96C6 88 14 74 12 60" stroke="${mix(c,acc,.35)}" stroke-opacity=".14" stroke-width="12"/>${X.grain?'<rect width="100" height="140" fill="url(#t99canvas)" opacity=".3"/>':''}</g>`))}}
  if(disc){disc.setAttribute('opacity','1');disc.setAttribute('fill',X.grad('disc'+acc,i=>{const g=X.E('radialGradient',{id:i,cx:'.42',cy:'.38',r:'.62'},X.defs);X.stops(g,[[0,mix(acc,'#ffe8c0',.2),.27],[.8,acc,.17],[1,acc,.12]])}));
    /* the figure's soft shadow on the backdrop (light from the upper left) */
    const sh=X.frag(`<g opacity="${ink?.32:.38}" fill="#0c0604"><ellipse cx="57" cy="66" rx="24" ry="30" opacity=".7"/><path d="M66 140C68 116 82 106 100 108V140Z"/></g>`);X.after(disc,sh)}
  /* ----- body and garb ----- */
  const occBody=[neck,face,...items.filter(o=>o.after&&o.filled&&['hair','cloth','metal','gold','fur'].includes(o.mat)&&o.b.y1>92&&o.b.y0<100&&o.b.w<40).map(o=>o.e)].filter(Boolean);
  for(const el of [bodyO,bodyI].filter(Boolean)){const c=el.getAttribute('fill');el.setAttribute('fill',X.cloth(c));let last=el;
    if(T>=2){const fd=el===bodyO?`M14 132Q17 118 27 109M86 132Q83 118 73 109`:fem?`M37 140C38 132 40 124 44 116M63 140C62 132 60 124 56 116`:`M37 140C38 131 40 124 43 119M62 140C62 132 60 126 57 121`;
      const g=X.E('g',{'clip-path':X.clip([el]),fill:'none','stroke-linecap':'round'});X.E('path',{d:fd,stroke:shadowOf(c,'cloth'),'stroke-opacity':ink?.6:.3,'stroke-width':ink?.9:1.5},g);
      if(!ink)X.E('path',{d:fd,stroke:lightOf(c,'cloth'),'stroke-opacity':.22,'stroke-width':1,transform:'translate(-1.2 -.2)'},g);
      if(X.grain)X.E('rect',{x:0,y:96,width:100,height:44,fill:'url(#t99canvas)',opacity:ink?.3:.55},g);
      if(el===bodyO)X.E('path',{d:fem?'M15 134C17 114 31 103 48 101':'M9 134C12 112 28 101 48 99.4',stroke:lightOf(c,'cloth'),'stroke-opacity':.22,'stroke-width':2},g);last=X.after(last,g)}
    if(el===bodyO)last=X.after(last,X.rim(el,{w:1.4,op:.4}));
    if(ink&&el===bodyO){el.setAttribute('stroke',INK);el.setAttribute('stroke-width','1.2')}
    if(el===bodyI)X.after(last,X.cast([bodyO,bodyI].filter(Boolean),occBody,{dx:2,dy:3.6,op:.42}))}
  /* ----- neck: a cylinder, the jaw's shadow, the muscles, AO at the collar ----- */
  if(neck){neck.setAttribute('fill',X.cyl(skin,'skin'));let last=neck;
    const occN=[face,...items.filter(o=>o.after&&o.filled&&['hair','metal','cloth','fur'].includes(o.mat)&&o.b.y1>80&&o.b.y0<92).map(o=>o.e)].filter(Boolean);
    last=X.after(last,X.cast([neck],occN,{dx:1.3,dy:3,op:.55,col:mix(shSkin,'#000',.35)}));
    if(T>=2)last=X.after(last,X.frag(G&&G.neckM?G.neckM({clip:X.clip([neck]),shSkin,ltSkin,ink,T,fem,mix}):`<g clip-path="${X.clip([neck])}" fill="none" stroke-linecap="round"><path d="M${fem?44.5:43.5} 88Q46 96 48 103M${fem?55.5:56.5} 88Q54 96 52 103" stroke="${shSkin}" stroke-opacity=".38" stroke-width=".8"/><path d="M${fem?43.6:42.6} 89Q45 96 47 103" stroke="${ltSkin}" stroke-opacity=".3" stroke-width=".7"/><ellipse cx="50" cy="104" rx="7" ry="2.6" fill="${mix(shSkin,'#000',.3)}" stroke="none" opacity=".45"/>${ink&&T>=2?`<rect x="${fem?54:55}" y="78" width="6" height="26" fill="${shSkin}" opacity=".35"/>`:''}</g>`));
    if(ink){neck.setAttribute('stroke',INK);neck.setAttribute('stroke-width','.9')}}
  /* ----- ears: helix, concha, AO where they meet the head; rim on the far ear ----- */
  if(ears.length===2){ears.forEach(e=>{e.setAttribute('fill',X.vol(skin,'skin'));if(ink){e.setAttribute('stroke',INK);e.setAttribute('stroke-width','.9')}});
    const L=(cx,mir,lit)=>{const s=fem?'scale(.88 .86)':'';const t=`translate(${cx} 62) ${mir?'scale(-1 1)':''} ${s} translate(-28 -62)`; // i18n:skip
      return `<g transform="${t}" fill="none" stroke-linecap="round"><path d="M27.6 55.4Q23.3 56.6 23.6 62Q24 67.4 27.6 69.3" stroke="${lit?ltSkin:shSkin}" stroke-opacity="${lit?.55:.4}" stroke-width=".85"/><path d="M28.6 58Q25.9 59.2 26.1 62.4Q26.4 65.6 28.7 66.6" stroke="${shSkin}" stroke-opacity=".6" stroke-width=".8"/><ellipse cx="27.7" cy="62.6" rx="1.5" ry="2.7" fill="${mix(shSkin,'#000',.2)}" stroke="none" opacity="${lit?.38:.5}"/><circle cx="26.4" cy="68.1" r=".7" fill="${ltSkin}" stroke="none" opacity="${lit?.5:.2}"/></g>`};
    const L2=G&&G.ear?(cx,mir,lit)=>G.ear(cx,mir,lit,{ltSkin,shSkin,fem,mix}):L;
    const ex=G&&G.earX?G.earX:fem?30:28;const g=X.frag(`<g clip-path="${X.clip(ears)}">${T>=2?L2(ex,false,true)+L2(100-ex,true,false):''}<circle cx="${ex+4.5}" cy="62" r="4.5" fill="#140804" opacity=".32"/><circle cx="${100-ex-4.5}" cy="62" r="4.5" fill="#140804" opacity=".42"/></g>`);
    X.after(ears[1],g);X.after(g,X.rim(ears[1],{w:1.2}))}
  /* ----- the face: volume, modelled planes, lips, texture, cast shadows from hair/headgear, rim + reflected light ----- */
  if(face){face.setAttribute('fill',X.vol(skin,'skin'));if(ink){face.setAttribute('stroke',INK);face.setAttribute('stroke-width','1')}
    const ao=X.grad('ao',i=>{const g=X.E('radialGradient',{id:i},X.defs);X.stops(g,[[0,mix(shSkin,'#000',.25),.9],[1,mix(shSkin,'#000',.25),0]])});
    const li=X.grad('li',i=>{const g=X.E('radialGradient',{id:i},X.defs);X.stops(g,[[0,'#fff6e8',.85],[1,'#fff6e8',0]])});
    const wm=X.grad('wm',i=>{const g=X.E('radialGradient',{id:i},X.defs);X.stops(g,[[0,'#d8503a',.5],[1,'#d8503a',0]])});
    const sm=p.smile?2:0;const k=fem?.6:1;
    const lipU=fem?mix(skin,'#8a2234',.55):mix(skin,'#7a3a2c',.4),lipL=fem?mix(skin,'#c44a5c',.45):mix(skin,'#b0625a',.3);
    let m='';
    if(G&&G.planes)m=G.planes({li,ao,wm,shSkin,ltSkin,skin,sm,k,fem,lipU,lipL,T,ink,mix});else if(T>=2){m+=`<ellipse cx="44" cy="42" rx="10" ry="6" fill="${li}" opacity=".55"/><ellipse cx="40" cy="50.4" rx="4.5" ry="1.3" fill="${li}" opacity=".4"/><ellipse cx="70" cy="50" rx="5" ry="9" fill="${ao}" opacity=".45"/>`
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
    if(ink&&T>=2){const e=(cx,cy,rx,ry)=>`M${cx-rx} ${cy}a${rx} ${ry} 0 1 0 ${rx*2} 0a${rx} ${ry} 0 1 0 ${-rx*2} 0`;const cr=G&&G.crescent?G.crescent:`${e(50,58,fem?20:22,fem?26.5:27)}${e(46.6,55.2,fem?20:22,fem?26.5:27)}`;m+=`<path d="${cr}" fill-rule="evenodd" fill="${shSkin}" opacity=".38"/><path d="${cr}" fill-rule="evenodd" fill="url(#t99hatch)" opacity=".22"/>`}
    const planes=X.frag(`<g clip-path="${X.clip([face,...ears])}"><g ${fem?'transform="translate(50 58) scale(.92 .98) translate(-50 -58)"':''}>${m}</g></g>`);let last=X.after(face,planes);
    /* hair / headgear cast onto the face and ears */
    const occF=items.filter(o=>o.after&&o.filled&&['hair','metal','gold','cloth','fur','straw','leaf'].includes(o.mat)&&o.b.y0<84&&o.b.w>2.5).map(o=>o.e);
    if(occF.length)last=X.after(last,X.cast([face,...ears],occF,{dx:1.1,dy:1.9,op:.5,col:mix(shSkin,'#000',.45)}));
    last=X.after(last,X.rim(face,{w:1.4,col:mix(RIM,skin,.3),op:.5}));
    if(!ink&&T>=2)last=X.after(last,X.rim(face,{w:1.6,dx:-.6,dy:-1.6,col:mix(acc,'#ffd2a0',.55),op:.2,dir:'b'}))}
  /* ----- eyes: lids, crease, iris, pupil, catchlights ----- */
  eyes.forEach((e,i)=>{if(G&&G.eye){const r=G.eye(e,i,{p,T,ink,X,INK,shSkin,ltSkin,lum,mix,mul});if(r)X.after(e,X.frag(r));return}const cx=+e.getAttribute('cx'),cy=58;const blind=i===1&&p.mark==='blind',patch=i===1&&p.mark==='patch';if(patch)return;
    const ec=p.eyes||'#1a120c';const irisC=lum(ec)<.12?'#6a4428':mix(ec,'#fff',.12);let m='';
    if(T>=2&&!blind){const ig=X.grad('iris'+irisC,j=>{const g=X.E('radialGradient',{id:j,cx:'.5',cy:'.62',r:'.6'},X.defs);X.stops(g,[[0,mix(irisC,'#fff2c8',.35)],[.6,irisC],[1,mul(irisC,.45)]])});
      m+=`<circle cx="${cx+.2}" cy="${cy+.1}" r="1.85" fill="${ig}"/><circle cx="${cx+.2}" cy="${cy+.1}" r=".85" fill="#0a0604"/>`}
    if(blind)m+=`<ellipse cx="${cx}" cy="${cy}" rx="2.4" ry="1.7" fill="#eef0ee" opacity=".7"/>`;
    m+=`<circle cx="${cx-.75}" cy="${cy-.75}" r="${T>=2?.62:.75}" fill="#fff" opacity=".95"/>`;
    if(T>=2)m+=`<circle cx="${cx+.95}" cy="${cy+.7}" r=".3" fill="#fff" opacity=".55"/><path d="M${cx-3.4} ${cy-.1}Q${cx} ${cy-3.1} ${cx+3.4} ${cy-.1}" fill="none" stroke="${INK}" stroke-opacity=".85" stroke-width="1.05" stroke-linecap="round"/>`
      +`<path d="M${cx-3.1} ${cy-2.1}Q${cx} ${cy-4.7} ${cx+3.4} ${cy-1.9}" fill="none" stroke="${shSkin}" stroke-opacity=".6" stroke-width=".55"/><path d="M${cx-2.6} ${cy+1.95}Q${cx} ${cy+3} ${cx+2.6} ${cy+1.95}" fill="none" stroke="${ltSkin}" stroke-opacity=".7" stroke-width=".5"/>`;
    X.after(e,X.frag(m))});
  if(G&&G.browHL){if(T>=2&&brows)X.after(brows,X.frag(G.browHL))}else if(brows&&T>=2)X.after(brows,X.frag(`<path d="M35.6 51.3L45.6 52.3M54.4 52.3L64.4 51.3" stroke="#fff4e0" stroke-opacity=".28" stroke-width=".7" stroke-linecap="round"/>`));
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
        if(X.grain)X.E('rect',{x:b.x0,y:b.y0,width:b.w,height:b.h,fill:'url(#t99canvas)',opacity:.5},g);last=X.after(last,g)}
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
  root.appendChild(X.frag(`<rect width="100" height="140" fill="${kw}"/><rect width="100" height="140" fill="${cf}"/><rect width="100" height="140" fill="${vg}"/>${X.grain&&!ink?'<rect width="100" height="140" fill="url(#t99canvas)" opacity=".16"/>':''}`));
  return X.out()}
return {Engine,strong99,mix,mul,lum,rgb,rng}})();
/* ---- the variety parts (ported from tools/plans/mock99/face99v.js) ---- */
const F2V=(()=>{
const PARTS=[
 ['fs','Face shape',['','sq','rd','lg','ht','dm'],['Oval (today)','Square','Round','Long','Heart','Diamond']], // i18n:skip
 ['jw','Jaw',['','nar','wid','str'],['Today','Narrow','Wide','Strong']], // i18n:skip
 ['ck','Cheekbones',['','hi','flat'],['Today','High','Flat']], // i18n:skip
 ['br','Brows',['','thk','thn','arc','str','scr','uni'],['Today','Thick','Thin','Arched','Straight','Scar-split','Unibrow']], // i18n:skip
 ['ey','Eyes',['','alm','rnd','hod','nar','dep'],['Today','Almond','Round','Hooded','Narrow','Deep-set']], // i18n:skip
 ['es','Eye set',['','wide','close'],['Today','Wide-set','Close-set']], // i18n:skip
 ['ns','Nose',['','rom','brd','btn','lng','brk'],['Today','Roman','Broad','Button','Long straight','Broken']], // i18n:skip
 ['lp','Lips',['','thn','ful','wid','sml','dwn','smk'],['Today','Thin','Full','Wide','Small','Downturned','Smirk']], // i18n:skip
 ['ea','Ears',['','sml','lrg','pro','caul'],['Today','Small','Large','Protruding','Cauliflower']], // i18n:skip
 ['nk','Neck',['','sht','lng','bul'],['Today','Short-thick','Long-slim','Bull']], // i18n:skip
 ['ag','Age',['','yng','wth','old'],['Today','Young','Weathered','Old']], // i18n:skip
 ['ln','Lines',['','f','c','fc'],['None','Forehead','Cheeks','Both']]]; // i18n:skip
const f2=v=>Math.round(v*100)/100;
/* ---------- colour helpers ---------- */
function rgb(c){c=String(c||'');if(c[0]!=='#')return [128,128,128];let h=c.slice(1);if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return [n>>16,n>>8&255,n&255]}
const hex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const mixc=(a,b,t)=>{const A=rgb(a),B=rgb(b);return hex(A.map((v,i)=>v+(B[i]-v)*t))};
/* ---------- face profiles (male units; right half: offsets from x=50) ---------- */
const OVAL={top:31,tw:19.3,cw:21.9,jw:16.4,jy:76,chw:7.2,chy:83.5,bot:85};
const SHAPES={'':OVAL,sq:{top:31,tw:20.2,cw:21.6,jw:20.6,jy:77.5,chw:11.6,chy:84.4,bot:85.6},rd:{top:31.5,tw:20.6,cw:23.4,jw:18.8,jy:74,chw:9.6,chy:81.6,bot:83.4},
  lg:{top:30,tw:18.4,cw:19.8,jw:15.4,jy:79,chw:6.8,chy:87,bot:88.6},ht:{top:31,tw:21.4,cw:21.2,jw:13.6,jy:76.5,chw:4.4,chy:83.9,bot:85.8},
  dm:{top:31.4,tw:16.6,cw:23.2,jw:14.8,jy:76,chw:5,chy:84.2,bot:86}};
function profile(P){const S={...(SHAPES[P.fs]||OVAL)};
  if(P.jw==='nar'){S.jw-=2.6;S.chw=Math.max(3.6,S.chw-1.8)}if(P.jw==='wid'){S.jw+=2.6;S.chw+=1.6}if(P.jw==='str'){S.jw+=1.8;S.chw+=3;S.bot+=.6;S.chy+=.4}
  if(P.ck==='hi'){S.cw+=1.1}if(P.ck==='flat'){S.cw-=.7}
  return S}
const hwAt=(S,y)=>{const pts=[[S.top,0],[S.top+4.5,S.tw*.62],[45,S.tw],[60,S.cw],[S.jy,S.jw],[S.chy,S.chw],[S.bot,0]];
  if(y<=pts[0][0])return 0;for(let i=1;i<pts.length;i++)if(y<=pts[i][0]){const [y0,x0]=pts[i-1],[y1,x1]=pts[i];return x0+(x1-x0)*(y-y0)/(y1-y0)}return 0};
/* closed Catmull-Rom through the profile, mirrored; fem = narrowed like today's 20×26.5 ellipse */
function faceD(S,fem,dx,dy){dx=dx||0;dy=dy||0;const R=[[0,S.top],[S.tw*.62,S.top+4.5],[S.tw,45],[S.cw,60],[S.jw,S.jy],[S.chw,S.chy],[0,S.bot]];
  const loop=[...R.map(([x,y])=>[50+x,y]),...R.slice(1,-1).reverse().map(([x,y])=>[50-x,y])];
  const P=loop.map(([x,y])=>fem?[50+(x-50)*.909+dx,58+(y-58)*.981+dy]:[x+dx,y+dy]);const n=P.length;let d=`M${f2(P[0][0])} ${f2(P[0][1])}`;
  for(let i=0;i<n;i++){const p0=P[(i-1+n)%n],p1=P[i],p2=P[(i+1)%n],p3=P[(i+2)%n];
    d+=`C${f2(p1[0]+(p2[0]-p0[0])/6)} ${f2(p1[1]+(p2[1]-p0[1])/6)} ${f2(p2[0]-(p3[0]-p1[0])/6)} ${f2(p2[1]-(p3[1]-p1[1])/6)} ${f2(p2[0])} ${f2(p2[1])}`}
  return d+'Z'}
/* ---------- an affine path rewriter (x' = ax·x + bx, y' = ay·y + by), abs + rel commands ---------- */
function xformD(d,ax,bx,ay,by){const t=String(d).match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+)(?:e-?\d+)?/g)||[];let i=0,out='',cmd='';
  const N={M:2,L:2,T:2,H:1,V:1,C:6,S:4,Q:4,A:7,Z:0};
  while(i<t.length){if(/[a-zA-Z]/.test(t[i])){cmd=t[i++];out+=cmd;if(cmd.toUpperCase()==='Z')continue}
    const C=cmd.toUpperCase(),rel=cmd!==C,n=N[C];if(!n){i++;continue}const a=[];for(let k=0;k<n;k++)a.push(parseFloat(t[i++]));
    let b;if(C==='H')b=[rel?a[0]*ax:a[0]*ax+bx];else if(C==='V')b=[rel?a[0]*ay:a[0]*ay+by];
    else if(C==='A')b=[a[0]*ax,a[1]*ay,a[2],a[3],a[4],rel?a[5]*ax:a[5]*ax+bx,rel?a[6]*ay:a[6]*ay+by];
    else b=a.map((v,k)=>k%2===0?(rel?v*ax:v*ax+bx):(rel?v*ay:v*ay+by));
    out+=b.map(f2).join(' ')+' ';if(C==='M')cmd=rel?'l':'L'}
  return out.trim()}
function xformEl(e,ax,bx,ay,by){const g=k=>parseFloat(e.getAttribute(k)||0),s=(k,v)=>e.setAttribute(k,f2(v));const t=e.tagName;
  if(t==='path')e.setAttribute('d',xformD(e.getAttribute('d'),ax,bx,ay,by));
  else if(t==='ellipse'){s('cx',g('cx')*ax+bx);s('cy',g('cy')*ay+by);s('rx',g('rx')*ax);s('ry',g('ry')*ay)}
  else if(t==='circle'){s('cx',g('cx')*ax+bx);s('cy',g('cy')*ay+by)}
  else if(t==='rect'){s('x',g('x')*ax+bx);s('y',g('y')*ay+by);s('width',g('width')*ax);s('height',g('height')*ay)}}
function bbox(e){const g=k=>parseFloat(e.getAttribute(k)||0);const t=e.tagName;
  if(t==='ellipse')return {x0:g('cx')-g('rx'),y0:g('cy')-g('ry'),x1:g('cx')+g('rx'),y1:g('cy')+g('ry')};
  if(t==='circle')return {x0:g('cx')-g('r'),y0:g('cy')-g('r'),x1:g('cx')+g('r'),y1:g('cy')+g('r')};
  if(t==='rect')return {x0:g('x'),y0:g('y'),x1:g('x')+g('width'),y1:g('y')+g('height')};
  if(t==='path'){const n=(e.getAttribute('d').match(/-?(?:\d*\.\d+|\d+)/g)||[]).map(Number);const X=[],Y=[];
    /* rough: absolute pairs only (enough to class shapes) */
    const toks=e.getAttribute('d').match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+)/g)||[];let cmd='',k=0,cx=0,cy=0;
    for(let i=0;i<toks.length;i++){const v=toks[i];if(/[a-zA-Z]/.test(v)){cmd=v;k=0;continue}const num=+v;const C=cmd.toUpperCase();const rel=cmd!==C;
      if(C==='H'){cx=rel?cx+num:num;X.push(cx);Y.push(cy);continue}if(C==='V'){cy=rel?cy+num:num;X.push(cx);Y.push(cy);continue}
      if(k%2===0){X.push(rel?cx+num:num)}else{Y.push(rel?cy+num:num)}k++;
      const per={M:2,L:2,T:2,C:6,S:4,Q:4,A:7}[C]||2;if(k%per===0&&X.length&&Y.length){cx=X[X.length-1];cy=Y[Y.length-1]}}
    if(!X.length)return null;return {x0:Math.min(...X),y0:Math.min(...Y),x1:Math.max(...X),y1:Math.max(...Y)}}
  return null}
/* ---------- part geometry (male units) ---------- */
const EYE={'':{rx:3,ry:2.2,rot:0},alm:{rx:3.5,ry:1.7,rot:7},rnd:{rx:2.9,ry:2.75,rot:0},hod:{rx:3.1,ry:2.05,rot:0,hood:1},nar:{rx:3.35,ry:1.3,rot:2},dep:{rx:2.8,ry:2,rot:0,deep:1}};
const LIP={'':{W:5.4,u:1,l:1,cl:0,cr:0},thn:{W:5.1,u:.45,l:.5,cl:0,cr:0},ful:{W:5.9,u:1.45,l:1.45,cl:0,cr:0},wid:{W:7.2,u:.95,l:1,cl:0,cr:0},
  sml:{W:4,u:1.05,l:.95,cl:0,cr:0},dwn:{W:5.4,u:.95,l:1,cl:1.3,cr:1.3},smk:{W:5.5,u:.9,l:.95,cl:.25,cr:-1.6}};
/* nose: base line + its plane parameters (default = today's numbers) */
const NOSE={'':{line:'M50 60L47 70L52 70',side:'M50.7 61Q52 65 52.9 69.3L50.9 69.8Q50.2 65 50.7 61Z',wing:'M52.4 67.1Q54.1 68.6 52.9 70.4',bridge:'M49.4 57.8Q48.7 62.6 48.4 66.4',tip:[49.5,68.3,1.25],nos:[48.3,51.8,70.6,.95],under:[50.4,71.7,3.7]},
  rom:{line:'M50 59.2Q52.4 62.2 50.8 65L47.2 70.3L52.3 70.2',side:'M51.3 60.6Q53.6 63.4 52.4 66L53.2 69.6L51 70Q50.6 66.4 51.3 60.6Z',wing:'M52.6 67.3Q54.4 68.8 53.1 70.5',
    bridge:'M49.6 57.6Q51.6 61.2 50.4 63.4M49.8 64.4L48.3 67',tip:[49.2,68.6,1.2],nos:[48.2,51.8,70.8,.95],under:[50.3,71.9,3.8],bump:[51.4,62.2]},
  brd:{line:'M50 60L48.2 68.6M45.4 70.3Q46.6 69.2 48.4 70.2Q50 71 51.6 70.2Q53.4 69.2 54.6 70.3',side:'M50.8 61Q52.6 65 54 69L51.2 70Q50.3 65 50.8 61Z',wing:'M53.2 66.6Q56.2 68.4 54.6 71',
    bridge:'M49.4 57.8Q48.9 62.6 48.6 66',tip:[49.7,68.2,1.75],nos:[47.4,52.6,70.7,1.25],under:[50.2,72,5],wingL:'M47 66.8Q44.2 68.5 45.6 71'},
  btn:{line:'M50 62.6L48.6 67.6Q50 69.2 51.6 67.8',side:'M50.6 63Q51.8 65.4 52.3 67.4L50.8 68.2Q50.2 65.6 50.6 63Z',wing:'M52 66.2Q53.6 67.4 52.4 69',bridge:'M49.5 58.4Q49.1 62 48.9 64.6',
    tip:[49.8,67.2,1.5],nos:[48.6,51.5,68.9,.8],under:[50.3,70,3.2]},
  lng:{line:'M50 59L47.4 72.2L52.4 72.2',side:'M50.7 61Q52.2 66 53.3 71.4L51.1 71.9Q50.2 66 50.7 61Z',wing:'M52.6 69.2Q54.3 70.7 53.1 72.5',bridge:'M49.4 57.6Q48.5 63.4 48.1 68.2',
    tip:[49.4,70.3,1.3],nos:[48.2,51.9,72.7,.95],under:[50.3,73.8,3.6]},
  brk:{line:'M50 60L51.1 63.4Q49.9 65.8 48.3 67.9L47.5 70.3L52.3 70.1',side:'M52 63.6Q53.6 66.4 53.2 69.4L51.2 70Q50.6 66.6 52 63.6Z',wing:'M52.6 67.2Q54.3 68.7 53.1 70.5',bridge:'M49.6 58Q50.6 60.6 51.2 62.8M50.4 64.4L48.6 67',
    tip:[49.1,68.4,1.2],nos:[48.2,51.9,70.7,.95],under:[50.3,71.8,3.7],bump:[51.6,63.2],scar:1,soft:'M50 60Q51.2 62.2 50.9 63.6Q50 65.6 48.4 67.9L47.5 70.3L52.3 70.1'}};
/* ---------- the reshaping pre-pass (on the bust SVG, before the paint pass) ---------- */
function prePass(svg,G){const root=p99(svg).children[0];
  const all=[...root.querySelectorAll('path,ellipse,circle,rect')];const A=(e,k)=>e.getAttribute(k);const ds=(e,pre)=>e.tagName==='path'&&(A(e,'d')||'').startsWith(pre);
  const fem=G.fem;const E=(tag,a)=>{const e=new V99(tag);for(const k in a)e.setAttribute(k,a[k]);return e};
  const face=all.find(e=>e.tagName==='ellipse'&&A(e,'cx')==='50'&&A(e,'cy')==='58');
  const ears=all.filter(e=>e.tagName==='ellipse'&&A(e,'cy')==='62'&&['28','72','30','70'].includes(A(e,'cx')));
  const eyes=all.filter(e=>e.tagName==='ellipse'&&A(e,'cy')==='58'&&A(e,'rx')==='3'&&['41','59'].includes(A(e,'cx'))&&e.parentNode===root);
  const brows=all.find(e=>ds(e,'M35 52L46 53'));const nose=all.find(e=>ds(e,'M50 60L47 70'));const mouth=all.find(e=>ds(e,'M44 77Q50'));
  const neck=all.find(e=>e.tagName==='rect'&&A(e,'y')==='78');
  const bodyO=all.find(e=>ds(e,'M6 140C8 110')||ds(e,'M12 140C14 112'));const bodyI=all.find(e=>ds(e,'M20 140C22 117 34 107 50 107S')||ds(e,'M24 140C26 118'));
  const hair=G.hair;const skin=G.skin;
  const tag=(e,k)=>e&&e.setAttribute('data-v',k);
  /* torso (shoulders up/down for the neck), scaled about the frame's bottom edge so the frame stays filled */
  if(G.tk!==1){const k=G.tk,by=140*(1-k);
    for(const e of all){if(e===face||ears.includes(e)||e===neck)continue;const b=bbox(e);if(!b)continue;
      if(e===bodyO||e===bodyI||(b.y0>=95.5&&b.y1>100&&e.parentNode===root))xformEl(e,1,0,k,by)}}
  /* beard follows the jaw */
  if(G.bk){const [kx,ky]=G.bk;for(const e of all){if(e===brows)continue;const f=A(e,'fill'),s=A(e,'stroke');const hc=(f&&f.toLowerCase()===hair.toLowerCase())||(s&&s.toLowerCase()===hair.toLowerCase())||(e.parentNode!==root&&(A(e.parentNode,'fill')||'').toLowerCase()===hair.toLowerCase());
    if(!hc)continue;const b=bbox(e);if(!b)continue;const cx=(b.x0+b.x1)/2;if(b.y0>=56&&cx>34&&cx<66&&b.x1-b.x0>5)xformEl(e,kx,50*(1-kx),ky,62*(1-ky))}}
  /* face */
  if(face){tag(face,'face');if(G.faceD){const p=E('path',{d:G.faceD,fill:A(face,'fill'),'data-v':'face'});face.parentNode.replaceChild(p,face)}}
  /* ears */
  const ec=G.earX,eS=G.earS;
  ears.forEach((e,i)=>{const left=+A(e,'cx')<50;const cx=left?ec:100-ec;const rx=+A(e,'rx')*eS[0],ry=+A(e,'ry')*eS[1];
    let n;if(G.caul){const k=left?-1:1;const pts=[[0,-ry],[k*rx*.85,-ry*.62],[k*rx*1.12,-ry*.08],[k*rx*.92,ry*.34],[k*rx*1.06,ry*.62],[k*rx*.5,ry*.98],[-k*rx*.5,ry*.82],[-k*rx*.9,0],[-k*rx*.6,-ry*.8]];
      const P=pts.map(([x,y])=>[cx+x,62+y]);const m=P.length;let d=`M${f2(P[0][0])} ${f2(P[0][1])}`;for(let j=0;j<m;j++){const p0=P[(j-1+m)%m],p1=P[j],p2=P[(j+1)%m],p3=P[(j+2)%m];d+=`C${f2(p1[0]+(p2[0]-p0[0])/6)} ${f2(p1[1]+(p2[1]-p0[1])/6)} ${f2(p2[0]-(p3[0]-p1[0])/6)} ${f2(p2[1]-(p3[1]-p1[1])/6)} ${f2(p2[0])} ${f2(p2[1])}`}
      n=E('path',{d:d+'Z',fill:A(e,'fill'),'data-v':'ear'})}
    else n=E('ellipse',{cx:f2(cx),cy:62,rx:f2(rx),ry:f2(ry),fill:A(e,'fill'),'data-v':'ear',...(G.earRot?{transform:`rotate(${left?-G.earRot:G.earRot} ${f2(cx)} 62)`}:{})});
    e.parentNode.replaceChild(n,e)});
  /* earrings ride with the ear lobe */
  const ex0=fem?30:28;const dEx=ec-ex0,dEy=8*(eS[1]-1)*(fem?7/8:1);
  if(dEx||dEy)for(const e of all){if(!e.parentNode)continue;const f=(A(e,'fill')||'').toLowerCase(),s=(A(e,'stroke')||'').toLowerCase();if(!['#e8c86a','#f2efe6','#b8b0a0'].some(c=>c===f||c===s))continue;
    const b=bbox(e);if(!b||b.x1-b.x0>10)continue;const cx=(b.x0+b.x1)/2,cy=(b.y0+b.y1)/2;if(cy<64||cy>82)continue;
    if(Math.abs(cx-ex0)<5)xformEl(e,1,dEx,1,dEy);else if(Math.abs(cx-(100-ex0))<5)xformEl(e,1,-dEx,1,dEy)}
  /* eyes */
  const eS2=EYE[G.ey]||EYE[''];
  eyes.forEach((e,i)=>{const cx=i===0?G.eL:G.eR;e.setAttribute('cx',f2(cx));e.setAttribute('cy',f2(G.eyY));e.setAttribute('rx',eS2.rx);e.setAttribute('ry',eS2.ry);
    if(eS2.rot)e.setAttribute('transform',`rotate(${i===0?eS2.rot:-eS2.rot} ${f2(cx)} ${f2(G.eyY)})`);tag(e,'eye')});
  /* marks + lashes that sit by the eyes */
  const dl=G.eL-41,dr=G.eR-59;
  for(const e of all){if(!e.parentNode)continue;const d=A(e,'d')||'';
    if(d==='M37 55l-3 -2M45 55l3 -2M55 55l-3 -2M63 55l3 -2'){const y=f2(G.eyY-eS2.ry-.6);e.setAttribute('d',`M${f2(G.eL-4)} ${y}l-3 -2M${f2(G.eL+4)} ${y}l3 -2M${f2(G.eR-4)} ${y}l-3 -2M${f2(G.eR+4)} ${y}l3 -2`)}
    else if(d.startsWith('M37 56.5Q41 54'))e.setAttribute('d',`M${f2(G.eL-4)} 56.5Q${f2(G.eL)} ${f2(57.5-eS2.ry*1.6)} ${f2(G.eL+4)} 56.5L${f2(G.eL+7)} 55M${f2(G.eR-4)} 56.5Q${f2(G.eR)} ${f2(57.5-eS2.ry*1.6)} ${f2(G.eR+4)} 56.5L${f2(G.eR+7)} 55`);
    else if(d==='M40 61v8M60 61v8')e.setAttribute('d',`M${f2(40+dl)} 61v8M${f2(60+dr)} 61v8`);
    else if(e.tagName==='circle'&&A(e,'cy')==='70'&&A(e,'fill')==='#2f4f8a')xformEl(e,1,+A(e,'cx')<50?dl:dr,1,0);
    else if(e.tagName==='ellipse'&&A(e,'cx')==='41'&&A(e,'cy')==='60')xformEl(e,1,dl,1,0);
    else if(e.tagName==='ellipse'&&A(e,'cx')==='59'&&A(e,'cy')==='58'&&A(e,'rx')==='5')xformEl(e,1,dr,1,0);
    else if(e.tagName==='circle'&&A(e,'cx')==='64'&&A(e,'cy')==='52')xformEl(e,1,dr,1,G.bdy)}
  /* brows */
  if(brows){const col=A(brows,'stroke');const g=E('g',{'data-v':'brows'});
    const frag=p99(G.browSVG(col));
    [...frag.kids].forEach(c=>{const n=c;if(n.setAttribute)n.setAttribute('data-v','brows');g.appendChild(n)});
    brows.parentNode.replaceChild(g,brows)}
  /* nose + mouth */
  if(nose){nose.setAttribute('d',G.T>=3&&G.nose.soft?G.nose.soft:G.nose.line);if(G.T>=3&&G.P.ns==='brk'){nose.setAttribute('stroke-width','1.2');nose.setAttribute('stroke-opacity','.72')}tag(nose,'nose')}
  if(mouth){mouth.setAttribute('d',G.mouthD);tag(mouth,'mouth')}
  /* neck */
  if(neck){if(G.neckD){const p=E('path',{d:G.neckD,fill:A(neck,'fill'),'data-v':'neck'});neck.parentNode.replaceChild(p,neck)}
    else{neck.setAttribute('x',f2(50-G.nw));neck.setAttribute('width',f2(G.nw*2));neck.setAttribute('height',f2(G.nh));tag(neck,'neck')}}
  if(G.helmK>1.004){const k=G.helmK,fi=all.indexOf(face);const HM=['#a9b2ba','#949da6','#5d656d','#8f979e','#c9a458','#6b4d17','#2a2a2a'];
    for(const e of all){if(!e.parentNode||all.indexOf(e)<fi||e===nose||e===mouth||e===brows||eyes.includes(e)||e.hasAttribute('data-v'))continue;
      const f=(A(e,'fill')||'').toLowerCase(),s=(A(e,'stroke')||'').toLowerCase();if(!HM.includes(f)&&!(f==='none'&&HM.includes(s))&&!(f===''&&HM.includes(s)))continue;
      const b=bbox(e);if(!b||b.y0>=80||b.y1>104)continue;xformEl(e,k,50*(1-k),1,0)}}
  tag(bodyO,'bodyO');tag(bodyI,'bodyI');
  return ser99(root)}
/* ---------- the geometry + paint hooks ---------- */
function geo(P,spec){const fem=!!spec.fem;const S=profile(P);const shaped=!!(P.fs||P.jw||P.ck);
  const es=P.es==='wide'?1.8:P.es==='close'?-1.6:0;const eS=EYE[P.ey]||EYE[''];
  const G={fem,skin:spec.skin,hair:spec.hair,S,P};
  G.faceD=shaped?faceD(S,fem):null;
  G.crescent=shaped?faceD(S,false)+faceD(S,false,-3.4,-2.8):null;
  /* ears */
  const baseOff=fem?20:22;const off=(hwAt(S,62)-hwAt(OVAL,62))*(fem?.909:1)+baseOff;
  const eSz=P.ea==='sml'?[.8,.8]:P.ea==='lrg'?[1.2,1.22]:P.ea==='pro'?[1.18,1.08]:P.ea==='caul'?[1.12,1.02]:[1,1];
  G.earS=eSz;G.earX=50-off-(P.ea==='pro'?2.4:0);G.earRot=P.ea==='pro'?10:0;G.caul=P.ea==='caul';
  /* eyes */
  G.eL=41-es;G.eR=59+es;G.eyY=58+(eS.deep?.4:0);G.bdy=(eS.deep?1.2:0)+(P.br==='str'?.5:0);
  /* beard: follow jaw width + chin depth */
  const kx=Math.max(.8,Math.min(1.2,(S.jw+S.chw)/(OVAL.jw+OVAL.chw))),ky=(S.bot-62)/(OVAL.bot-62);G.bk=shaped&&(Math.abs(kx-1)>.01||Math.abs(ky-1)>.01)?[kx,ky]:null;
  /* neck: width, length (the shoulders move), bull flare */
  const nw0=fem?8:9;const nk=P.nk;const dyS=nk==='sht'?-3:nk==='lng'?4:nk==='bul'?-2:0;const top=fem?101:99;G.tk=(140-(top+dyS))/(140-top);G.shY=top+dyS;
  G.nw=nk==='sht'?nw0+2.4:nk==='lng'?nw0-1.8:nw0;G.nh=Math.max(26,G.shY-78+6);
  G.neckD=nk==='bul'?`M${50-nw0-2} 79Q${50-nw0-2.4} 90 ${50-nw0-5.5} ${G.shY+2}Q50 ${G.shY+8} ${50+nw0+5.5} ${G.shY+2}Q${50+nw0+2.4} 90 ${50+nw0+2} 79Z`:null;
  /* nose, lips */
  G.nose=NOSE[P.ns]||NOSE[''];if(shaped){let k=1;for(let y=56;y<=78;y+=2){const a=hwAt(S,y)/Math.max(1,hwAt(OVAL,y));if(a>k)k=a}G.helmK=Math.min(1.12,k)}const L={...(LIP[P.lp]||LIP[''])};G.lip=L;
  const sm=spec.smile?4:0;G.mouthD=`M${f2(50-L.W-.6)} ${f2(77+L.cl)}Q50 ${f2(78+sm+(L.cl+L.cr)/2)} ${f2(50+L.W+.6)} ${f2(77+L.cr)}`;
  /* brows: left = outer→inner; right mirrored around the eyes */
  G.browSVG=col=>{const sides=[[G.eL,-1],[G.eR,1]];const by=G.bdy+(P.ag==='old'?.4:0);let s='';
    const pts=(cx,sg)=>{const xo=cx+sg*6,xi=cx-sg*5;return {xo,xi,yo:52+by+(P.ag==='old'?.5:0),yi:53+by}};
    const t=P.br||'';
    if(t==='uni'){const a=pts(G.eL,-1),b=pts(G.eR,1);return `<path d="M${f2(a.xo)} ${a.yo}L${f2(a.xi)} ${a.yi}M${f2(b.xi)} ${b.yi}L${f2(b.xo)} ${b.yo}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/><path d="M${f2(a.xi)} ${a.yi}Q50 ${f2(a.yi+.9)} ${f2(b.xi)} ${b.yi}" fill="none" stroke="${col}" stroke-width="1.7" stroke-linecap="round" opacity=".9"/>`}
    for(const [cx,sg] of sides){const {xo,xi,yo,yi}=pts(cx,sg);const xm=(xo+xi)/2;
      if(t==='thk')s+=`<path d="M${f2(xo)} ${f2(yo+.7)}Q${f2(xm)} ${f2(yo-2.3)} ${f2(xi)} ${f2(yi-1.7)}L${f2(xi+sg*.3)} ${f2(yi+1.5)}Q${f2(xm)} ${f2(yo+.6)} ${f2(xo)} ${f2(yo+.7)}Z" fill="${col}"/>`;
      else if(t==='thn')s+=`<path d="M${f2(xo)} ${f2(yo+.3)}Q${f2(xm)} ${f2(yo-1.4)} ${f2(xi)} ${f2(yi-.2)}" fill="none" stroke="${col}" stroke-width="1.15" stroke-linecap="round"/>`;
      else if(t==='arc')s+=`<path d="M${f2(xo)} ${f2(yo+1)}Q${f2(xm+sg*1.2)} ${f2(yo-4)} ${f2(xi)} ${f2(yi-.4)}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round"/>`;
      else if(t==='str')s+=`<path d="M${f2(xo)} ${f2(yi-1.3)}L${f2(xi)} ${f2(yi-1.3)}L${f2(xi)} ${f2(yi+1.1)}L${f2(xo)} ${f2(yi+.5)}Z" fill="${col}"/>`;
      else if(t==='scr'&&sg===1){const gx=xm+.6;s+=`<path d="M${f2(xi)} ${yi}L${f2(gx-1.4)} ${f2(yi-(yi-yo)*.45)}M${f2(gx+1.4)} ${f2(yi-(yi-yo)*.6)}L${f2(xo)} ${yo}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/><path d="M${f2(gx-.9)} ${f2(yo-3.2)}L${f2(gx+.7)} ${f2(yo+3.4)}" stroke="#c98478" stroke-width=".9" stroke-linecap="round" opacity=".9"/>`}
      else s+=`<path d="M${f2(xo)} ${yo}L${f2(xi)} ${yi}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>`}
    return s};
  G.browHL=(()=>{const by=G.bdy;const t=P.br||'';if(t==='thn')return '';const lift=t==='arc'?1.6:t==='thk'?.9:0;
    return `<path d="M${f2(G.eL-5.4)} ${f2(51.3+by-lift)}L${f2(G.eL+4.6)} ${f2(52.3+by-lift*.4)}M${f2(G.eR-4.6)} ${f2(52.3+by-lift*.4)}L${f2(G.eR+5.4)} ${f2(51.3+by-lift)}" stroke="#fff4e0" stroke-opacity=".28" stroke-width=".7" stroke-linecap="round"/>`})();
  /* ear detail: today's helix/concha drawing, scaled; cauliflower lumps */
  G.ear=(cx,mir,lit,o)=>{const {ltSkin,shSkin}=o;const s=`scale(${f2((fem?.88:1)*eSz[0])} ${f2((fem?.86:1)*eSz[1])})`;const rot=G.earRot?`rotate(${mir?G.earRot:-G.earRot})`:'';const t=`translate(${f2(cx)} 62) ${mir?'scale(-1 1)':''} ${rot} ${s} translate(-28 -62)`; // i18n:skip
    let m=`<g transform="${t}" fill="none" stroke-linecap="round"><path d="M27.6 55.4Q23.3 56.6 23.6 62Q24 67.4 27.6 69.3" stroke="${lit?ltSkin:shSkin}" stroke-opacity="${lit?.55:.4}" stroke-width=".85"/><path d="M28.6 58Q25.9 59.2 26.1 62.4Q26.4 65.6 28.7 66.6" stroke="${shSkin}" stroke-opacity=".6" stroke-width=".8"/><ellipse cx="27.7" cy="62.6" rx="1.5" ry="2.7" fill="${o.mix(shSkin,'#000',.2)}" stroke="none" opacity="${lit?.38:.5}"/><circle cx="26.4" cy="68.1" r=".7" fill="${ltSkin}" stroke="none" opacity="${lit?.5:.2}"/>`;
    if(G.caul)m+=`<g stroke="none"><circle cx="24.6" cy="58.4" r="1.6" fill="${ltSkin}" opacity=".45"/><circle cx="25.4" cy="58.9" r="1.3" fill="${shSkin}" opacity=".35"/><circle cx="24.2" cy="64.2" r="1.8" fill="${ltSkin}" opacity=".4"/><circle cx="25" cy="64.9" r="1.4" fill="${shSkin}" opacity=".4"/><path d="M26.8 57.2Q25.3 60 26.9 61.6M26 63.4Q24.9 65.8 26.5 67.4" fill="none" stroke="${o.mix(shSkin,'#4a1830',.35)}" stroke-opacity=".6" stroke-width=".7"/><circle cx="27" cy="60.6" r="1" fill="#7a3a4a" opacity=".22"/></g>`;
    return m+'</g>'};
  /* neck muscles + collar AO + old-age lines */
  G.neckM=o=>{const {clip,shSkin,ltSkin,ink,T,mix}=o;const hw=nk==='bul'?nw0+1.5:G.nw;const yb=G.shY+4;
    let s=`<g clip-path="${clip}" fill="none" stroke-linecap="round"><path d="M${f2(50-hw+2.5)} 88Q${f2(50-hw+5)} ${f2(yb-8)} 48 ${f2(yb)}M${f2(50+hw-2.5)} 88Q${f2(50+hw-5)} ${f2(yb-8)} 52 ${f2(yb)}" stroke="${shSkin}" stroke-opacity="${nk==='bul'?.5:.38}" stroke-width="${nk==='bul'?1.1:.8}"/><path d="M${f2(50-hw+1.6)} 89Q${f2(50-hw+4)} ${f2(yb-8)} 47 ${f2(yb)}" stroke="${ltSkin}" stroke-opacity=".3" stroke-width=".7"/>`;
    if(nk==='bul')s+=`<path d="M${f2(50-hw-1)} ${f2(G.shY-4)}Q${f2(50-hw-4)} ${f2(G.shY-1)} ${f2(50-hw-7)} ${f2(G.shY+2)}M${f2(50+hw+1)} ${f2(G.shY-4)}Q${f2(50+hw+4)} ${f2(G.shY-1)} ${f2(50+hw+7)} ${f2(G.shY+2)}" stroke="${shSkin}" stroke-opacity=".45" stroke-width="1"/>`;
    if(nk==='lng')s+=`<ellipse cx="51" cy="${f2(G.shY-6)}" rx="1.5" ry="1" fill="${ltSkin}" stroke="none" opacity=".35"/>`;
    if(P.ag==='old')s+=`<path d="M${f2(50-hw+3)} 91Q50 92.4 ${f2(50+hw-3)} 91M${f2(50-hw+3.5)} 94.5Q50 95.6 ${f2(50+hw-3.5)} 94.5" stroke="${shSkin}" stroke-opacity=".4" stroke-width=".55"/>`;
    s+=`<ellipse cx="50" cy="${f2(yb+1)}" rx="${f2(hw*.78)}" ry="2.6" fill="${mix(shSkin,'#000',.3)}" stroke="none" opacity=".45"/>`;
    if(ink&&T>=2)s+=`<rect x="${f2(50+hw-4)}" y="78" width="6" height="${f2(G.nh)}" fill="${shSkin}" opacity=".35"/>`;
    return s+'</g>'};
  /* eyes: iris clipped to the eye, lids by eye type */
  G.eye=(e,i,o)=>{const {p,T,X,INK,shSkin,ltSkin,lum,mix,mul}=o;const cx=+e.getAttribute('cx'),cy=+e.getAttribute('cy');const t=EYE[P.ey]||EYE[''];const rx=t.rx,ry=t.ry;
    const blind=i===1&&p.mark==='blind',patch=i===1&&p.mark==='patch';if(patch)return '';const rot=t.rot?(i===0?t.rot:-t.rot):0;
    const ec=p.eyes||'#1a120c';const irisC=lum(ec)<.12?'#6a4428':mix(ec,'#fff',.12);let m='';
    if(T>=2&&!blind){const ig=X.grad('iris'+irisC,j=>{const g=X.E('radialGradient',{id:j,cx:'.5',cy:'.62',r:'.6'},X.defs);X.stops(g,[[0,mix(irisC,'#fff2c8',.35)],[.6,irisC],[1,mul(irisC,.45)]])});
      const ir=Math.min(1.85,ry*.95+.35);m+=`<g clip-path="${X.clip([e])}"><circle cx="${f2(cx+.2)}" cy="${f2(cy+.1+(t.hood?.3:0))}" r="${f2(ir)}" fill="${ig}"/><circle cx="${f2(cx+.2)}" cy="${f2(cy+.1+(t.hood?.3:0))}" r="${f2(ir*.46)}" fill="#0a0604"/>${ry<1.6?`<rect x="${cx-4}" y="${f2(cy-ry)}" width="8" height="${f2(ry*.7)}" fill="#000" opacity=".25"/>`:''}</g>`}
    if(blind)m+=`<ellipse cx="${cx}" cy="${cy}" rx="${f2(rx*.8)}" ry="${f2(ry*.77)}" fill="#eef0ee" opacity=".7"/>`;
    m+=`<circle cx="${f2(cx-.75)}" cy="${f2(cy-Math.min(.75,ry*.4))}" r="${T>=2?(ry<1.6?.45:.62):.75}" fill="#fff" opacity=".95"/>`;
    if(T>=2){const lw=rx+.4,lp=ry*1.41,cw=rx+.1;
      m+=`<circle cx="${f2(cx+.95)}" cy="${f2(cy+Math.min(.7,ry*.3))}" r=".3" fill="#fff" opacity=".55"/>`;
      let lid=`<path d="M${f2(cx-lw)} ${f2(cy-.1)}Q${f2(cx)} ${f2(cy-lp)} ${f2(cx+lw)} ${f2(cy-.1)}" fill="none" stroke="${INK}" stroke-opacity=".85" stroke-width="${t.hood?1.25:1.05}" stroke-linecap="round"/>`;
      if(P.ey==='alm')lid+=`<path d="M${f2(cx+(i===0?-lw:lw))} ${f2(cy-.1)}l${i===0?-1.3:1.3} -.7" stroke="${INK}" stroke-opacity=".7" stroke-width=".7" stroke-linecap="round"/>`;
      let crease=`<path d="M${f2(cx-cw)} ${f2(cy-ry-.1+(t.deep?.6:0))}Q${f2(cx)} ${f2(cy-ry-2.5)} ${f2(cx+cw+.3)} ${f2(cy-ry+.1)}" fill="none" stroke="${shSkin}" stroke-opacity="${t.deep?.8:.6}" stroke-width="${t.deep?.8:.55}"/>`;
      if(t.hood)crease=`<path d="M${f2(cx-rx-1)} ${f2(cy-ry*.35)}Q${f2(cx)} ${f2(cy-ry-2.4)} ${f2(cx+rx+1.2)} ${f2(cy-ry*.2)}Q${f2(cx)} ${f2(cy-ry*.75)} ${f2(cx-rx-1)} ${f2(cy-ry*.35)}Z" fill="${p.skin||SKINS[1]}"/><path d="M${f2(cx-rx-.6)} ${f2(cy-ry*.38)}Q${f2(cx)} ${f2(cy-ry*.85)} ${f2(cx+rx+.8)} ${f2(cy-ry*.25)}" fill="none" stroke="${mix(shSkin,'#000',.3)}" stroke-opacity=".7" stroke-width=".7"/><path d="M${f2(cx-rx)} ${f2(cy-ry-1.3)}Q${f2(cx)} ${f2(cy-ry-2.1)} ${f2(cx+rx)} ${f2(cy-ry-1)}" fill="none" stroke="${ltSkin}" stroke-opacity=".5" stroke-width=".6"/>`;
      if(t.deep)crease+=`<path d="M${f2(cx-rx-1.2)} ${f2(cy-ry-1.6)}Q${f2(cx)} ${f2(cy-ry-3.6)} ${f2(cx+rx+1.2)} ${f2(cy-ry-1.4)}" fill="none" stroke="${mix(shSkin,'#000',.35)}" stroke-opacity=".45" stroke-width="1.6"/>`;
      m+=lid+crease+`<path d="M${f2(cx-rx+.4)} ${f2(cy+ry-.25)}Q${f2(cx)} ${f2(cy+ry+.8)} ${f2(cx+rx-.4)} ${f2(cy+ry-.25)}" fill="none" stroke="${ltSkin}" stroke-opacity=".7" stroke-width=".5"/>`;
      if(P.ag==='old'||P.ag==='wth')m+=`<path d="M${f2(cx-rx+.6)} ${f2(cy+ry+1.6)}Q${f2(cx)} ${f2(cy+ry+3.1)} ${f2(cx+rx-.2)} ${f2(cy+ry+1.5)}" fill="none" stroke="${shSkin}" stroke-opacity="${P.ag==='old'?.55:.32}" stroke-width=".55"/>`}
    return rot?`<g transform="rotate(${rot} ${f2(cx)} ${f2(cy)})">${m}</g>`:m};
  /* the face planes (today's planes with every position read from the shape) */
  G.planes=o=>{const {li,ao,wm,shSkin,ltSkin,sm,k,fem,lipU,lipL,T,ink,mix}=o;let m='';const N=G.nose,Lp=G.lip,W=Lp.W,eL=G.eL,eR=G.eR,ag=P.ag,ln=P.ln||'';
    const cwx=S.cw*.612,hol=(S.cw+S.jw)/2*.757,holY=S.jy-5.4;
    const ckK=P.ck==='hi'?1.45:P.ck==='flat'?.5:1,ckY=P.ck==='hi'?-1.2:0;
    const holK=(P.ck==='hi'?2:P.ck==='flat'?.55:1)*(P.fs==='dm'?1.4:1)*(ag==='old'?1.6:ag==='yng'?.6:1);
    const sock=EYE[P.ey]&&EYE[P.ey].deep?1.35:1;const yE=G.eyY;
    const cr=(d,op,w)=>`<path d="${d}" fill="none" stroke="${shSkin}" stroke-opacity="${f2(op)}" stroke-width="${w||.55}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${ltSkin}" stroke-opacity="${f2(op*.8)}" stroke-width="${f2((w||.55)*.8)}" stroke-linecap="round" transform="translate(0 .65)"/>`;
    if(T>=2){m+=`<ellipse cx="44" cy="${f2(42-(S.top-31))}" rx="10" ry="6" fill="${li}" opacity=".55"/><ellipse cx="${f2(eL-1)}" cy="${f2(50.4+G.bdy)}" rx="4.5" ry="1.3" fill="${li}" opacity=".4"/><ellipse cx="${f2(50+S.tw+.7)}" cy="50" rx="5" ry="9" fill="${ao}" opacity="${P.fs==='dm'?.6:.45}"/>`
      +`<ellipse cx="${f2(eL)}" cy="${f2(yE-1.4)}" rx="6.8" ry="${f2(4.5*Math.sqrt(sock))}" fill="${ao}" opacity="${f2(.6*sock)}"/><ellipse cx="${f2(eR)}" cy="${f2(yE-1.4)}" rx="6.8" ry="${f2(4.5*Math.sqrt(sock))}" fill="${ao}" opacity="${f2(Math.min(.95,.72*sock))}"/>`
      +`<ellipse cx="${f2(50-cwx)}" cy="${f2(63.4+ckY)}" rx="5.6" ry="2.4" fill="${li}" opacity="${f2(.55*ckK)}" transform="rotate(-18 ${f2(50-cwx)} ${f2(63.4+ckY)})"/><ellipse cx="${f2(50+cwx+.1)}" cy="${f2(63.4+ckY)}" rx="4" ry="1.8" fill="${li}" opacity="${f2(.22*ckK)}" transform="rotate(18 ${f2(50+cwx+.1)} ${f2(63.4+ckY)})"/>`
      +`<ellipse cx="${f2(50-hol)}" cy="${f2(holY+.2)}" rx="5.5" ry="2.6" fill="${ao}" opacity="${f2(Math.min(.8,.22*k*holK))}"/><ellipse cx="${f2(50+hol+.5)}" cy="${f2(holY-.2)}" rx="5.5" ry="3" fill="${ao}" opacity="${f2(Math.min(.9,.36*k*holK))}"/>`
      +`<ellipse cx="${f2(50-cwx*.95)}" cy="68.6" rx="6" ry="4" fill="${wm}" opacity="${ag==='yng'?.62:ag==='old'?.3:.5}"/><ellipse cx="${f2(50+cwx*.95)}" cy="68.6" rx="5.6" ry="3.8" fill="${wm}" opacity="${ag==='yng'?.5:ag==='old'?.24:.4}"/><circle cx="50" cy="${f2(N.tip[1]+.1)}" r="2.4" fill="${wm}" opacity="${P.ag==='wth'?.5:.35}"/>`
      /* nose by type */
      +`<path d="${N.side}" fill="${shSkin}" opacity=".26"/><path d="${N.wing}" fill="none" stroke="${shSkin}" stroke-opacity=".5" stroke-width=".55"/>${N.wingL?`<path d="${N.wingL}" fill="none" stroke="${ltSkin}" stroke-opacity=".45" stroke-width=".5"/>`:''}`
      +`<path d="${N.bridge}" fill="none" stroke="${ltSkin}" stroke-opacity=".7" stroke-width=".95" stroke-linecap="round"/><circle cx="${N.tip[0]}" cy="${N.tip[1]}" r="${N.tip[2]}" fill="${li}"/>`
      +(N.bump?`<ellipse cx="${N.bump[0]}" cy="${N.bump[1]}" rx="1.1" ry="1.5" fill="${li}" opacity=".8"/>`:'')+(N.scar?`<path d="M48.6 62.2L52.4 61.4" stroke="#b86a5e" stroke-opacity="${T>=3?.38:.7}" stroke-width=".55" stroke-linecap="round"/>`:'')
      +`<ellipse cx="${N.nos[0]}" cy="${N.nos[2]}" rx="${N.nos[3]}" ry="${f2(N.nos[3]*.47)}" fill="${mix(shSkin,'#000',.45)}" opacity=".55"/><ellipse cx="${N.nos[1]}" cy="${N.nos[2]}" rx="${N.nos[3]}" ry="${f2(N.nos[3]*.47)}" fill="${mix(shSkin,'#000',.45)}" opacity=".5"/><ellipse cx="${N.under[0]}" cy="${N.under[1]}" rx="${N.under[2]}" ry="1.2" fill="${ao}" opacity=".8"/>`
      /* philtrum, nasolabial, lips */
      +`<path d="M49.2 ${f2(N.under[1]+.6)}L49 75.4M51.3 ${f2(N.under[1]+.6)}L51.5 75.4" stroke="${shSkin}" stroke-opacity=".14" stroke-width=".5"/><ellipse cx="50.2" cy="74" rx=".8" ry="1.4" fill="${li}" opacity=".35"/>`;
      const nlK=ag==='yng'?0:ag==='wth'?1.9:ag==='old'?2.6:/c/.test(ln)?2:1;
      if(nlK&&(!fem||nlK>1)){const a=W*.81+.2,b=W*1.15;m+=`<path d="M${f2(50-a)} 70.9Q${f2(50-b-.4)} 73.4 ${f2(50-b)} 76.3M${f2(50+a)} 70.9Q${f2(50+b+.4)} 73.4 ${f2(50+b)} 76.3" fill="none" stroke="${shSkin}" stroke-opacity="${f2(.2*nlK)}" stroke-width="${nlK>1?.7:.55}"/>`;
        if(nlK>1)m+=`<path d="M${f2(50-a+.6)} 71.6Q${f2(50-b+.3)} 73.6 ${f2(50-b+.5)} 76" fill="none" stroke="${ltSkin}" stroke-opacity=".3" stroke-width=".5"/>`}
      const u=Lp.u,l=Lp.l,cl=Lp.cl,crr=Lp.cr,w2=W*.537;
      m+=`<path d="M${f2(50-W)} ${f2(77.1+cl)}Q${f2(50-w2)} ${f2(77.1-1.9*u+sm*.6)} 50 ${f2(77.1-1*u+sm*.8)}Q${f2(50+w2)} ${f2(77.1-1.9*u+sm*.6)} ${f2(50+W)} ${f2(77.1+crr)}Q50 ${f2(77.8+sm+(cl+crr)/2)} ${f2(50-W)} ${f2(77.1+cl)}Z" fill="${lipU}"/><path d="M${f2(50-W+.7)} ${f2(77.4+cl)}Q50 ${f2(77.4+4.2*l+sm+(cl+crr)/2)} ${f2(50+W-.7)} ${f2(77.4+crr)}Q50 ${f2(78.5+sm+(cl+crr)/2)} ${f2(50-W+.7)} ${f2(77.4+cl)}Z" fill="${lipL}"/>`
        +`<ellipse cx="49.4" cy="${f2(77.4+2.1*l+sm+(cl+crr)/2)}" rx="${f2(2.2*W/5.4)}" ry="${f2(.55*Math.max(.6,l))}" fill="#fff4ea" opacity=".45"/><ellipse cx="50" cy="${f2(77.4+4.4*l+sm+(cl+crr)/2)}" rx="${f2(3.4*W/5.4)}" ry="1" fill="${ao}" opacity=".75"/><circle cx="${f2(50-W-.4)}" cy="${f2(77.1+cl)}" r=".6" fill="${mix(shSkin,'#000',.4)}" opacity=".5"/><circle cx="${f2(50+W+.4)}" cy="${f2(77.1+crr)}" r=".6" fill="${mix(shSkin,'#000',.4)}" opacity=".5"/>`;
      if(P.lp==='smk')m+=`<path d="M${f2(50+W+.8)} ${f2(76.4+crr)}Q${f2(50+W+1.9)} ${f2(77.3+crr)} ${f2(50+W+1.2)} ${f2(78.6+crr)}" fill="none" stroke="${shSkin}" stroke-opacity=".55" stroke-width=".6"/>`;
      if(P.lp==='dwn'||ag==='old')m+=`<path d="M${f2(50-W-.5)} ${f2(78+cl)}Q${f2(50-W-1.2)} 80.6 ${f2(50-W-.6)} 82.6M${f2(50+W+.5)} ${f2(78+crr)}Q${f2(50+W+1.2)} 80.6 ${f2(50+W+.6)} 82.6" fill="none" stroke="${shSkin}" stroke-opacity="${ag==='old'?.42:.3}" stroke-width=".6"/>`;
      /* chin, jaw */
      const sq=P.fs==='sq'||P.jw==='str'||P.jw==='wid';
      m+=`<ellipse cx="49" cy="${f2(S.bot-2)}" rx="${f2(Math.max(2.4,Math.min(5.2,3.6*Math.sqrt(S.chw/OVAL.chw))))}" ry="1.7" fill="${li}" opacity=".5"/><path d="M${f2(50-(S.cw-2.5))} 66Q${f2(50-(S.jw+2))} ${f2(S.jy)} ${f2(50-(S.chw+4.8))} ${f2(S.bot-3)}" fill="none" stroke="${ltSkin}" stroke-opacity=".3" stroke-width="1.4"/><path d="M${f2(50+S.chw+2.8)} ${f2(S.bot-1.4)}Q${f2(50+S.jw-.4)} ${f2(S.jy+4.6)} ${f2(50+S.cw-1.9)} 72" fill="none" stroke="${shSkin}" stroke-opacity=".35" stroke-width="1.6"/>`;
      if(sq)m+=`<path d="M${f2(50+S.jw-2.6)} ${f2(S.jy-3)}Q${f2(50+S.jw-1)} ${f2(S.jy+1.2)} ${f2(50+S.chw+1)} ${f2(S.chy+.4)}" fill="none" stroke="${shSkin}" stroke-opacity=".38" stroke-width="2.2"/><path d="M${f2(50-S.jw+2.2)} ${f2(S.jy-3)}Q${f2(50-S.jw+.6)} ${f2(S.jy+1.4)} ${f2(50-S.chw-1)} ${f2(S.chy+.2)}" fill="none" stroke="${ltSkin}" stroke-opacity=".3" stroke-width="1.2"/>`;
      if(P.jw==='str')m+=`<path d="M50.3 ${f2(S.bot-3.6)}L50.2 ${f2(S.bot-.6)}" stroke="${shSkin}" stroke-opacity=".45" stroke-width=".8" stroke-linecap="round"/>`;
      if(ag==='old')m+=`<path d="M${f2(50-S.jw+.4)} ${f2(S.jy+1)}Q${f2(50-S.jw+2.6)} ${f2(S.jy+5)} ${f2(50-S.chw-2)} ${f2(S.chy)}M${f2(50+S.jw-.4)} ${f2(S.jy+1)}Q${f2(50+S.jw-2.6)} ${f2(S.jy+5)} ${f2(50+S.chw+2)} ${f2(S.chy)}" fill="none" stroke="${shSkin}" stroke-opacity=".3" stroke-width=".8"/>`;
      /* age + lines (painted creases: a dark line with a light line under it) */
      const fh=ag==='old'?3:ag==='wth'||/f/.test(ln)?2:0;const fy=42-(S.top-31)*.5;
      for(let j=0;j<fh;j++){const y=fy+j*2.9-(fh-1)*1.2;const w=10.5-j*1.6;m+=cr(`M${f2(50-w)} ${f2(y+.5)}Q50 ${f2(y-.9)} ${f2(50+w)} ${f2(y+.5)}`,ag==='old'?.42:.32,.55)}
      if(ag==='old'||ag==='wth'){const n=ag==='old'?3:2;for(const [cx,sg] of [[eL,-1],[eR,1]])for(let j=0;j<n;j++){const x=cx+sg*(EYE[P.ey]||EYE['']).rx+sg*1.3,y=yE-1+j*1.4;m+=cr(`M${f2(x)} ${f2(y)}l${f2(sg*2.1)} ${f2(-.6+j*.6)}`,ag==='old'?.42:.3,.45)}}
      if(/c/.test(ln)||ag==='old')m+=cr(`M${f2(50-cwx-1)} 66Q${f2(50-cwx-2.4)} 70 ${f2(50-cwx-1.4)} 73.4`,.28,.5)+cr(`M${f2(50+cwx+1)} 66Q${f2(50+cwx+2.4)} 70 ${f2(50+cwx+1.4)} 73.4`,.32,.5);
      if(ag==='old')m+=`<path d="M${f2(eL-2.4)} ${f2(yE+4.6)}Q${f2(eL)} ${f2(yE+6)} ${f2(eL+2.8)} ${f2(yE+4.4)}M${f2(eR-2.8)} ${f2(yE+4.4)}Q${f2(eR)} ${f2(yE+6)} ${f2(eR+2.4)} ${f2(yE+4.6)}" fill="none" stroke="${shSkin}" stroke-opacity=".35" stroke-width=".6"/><path d="M47.5 ${f2(G.bdy+50.6)}L47.8 ${f2(G.bdy+54)}" stroke="${shSkin}" stroke-opacity=".38" stroke-width=".55"/>`;
      if(ag==='wth')m+=`<rect x="20" y="28" width="60" height="62" fill="#8a4a2a" opacity=".07"/>`;
      if(ag==='yng')m+=`<ellipse cx="${f2(50-cwx)}" cy="67" rx="5" ry="3.4" fill="${li}" opacity=".25"/>`}
    else{m+=`<ellipse cx="${f2(eR)}" cy="${f2(yE-1.4)}" rx="6" ry="4" fill="${ao}" opacity="${f2(.45*sock)}"/><path d="${N.side}" fill="${shSkin}" opacity=".45"/><ellipse cx="${N.under[0]}" cy="${N.under[1]}" rx="${N.under[2]}" ry="1.2" fill="${ao}" opacity=".6"/><path d="M${f2(50-W+.4)} ${f2(77.4+Lp.cl)}Q50 ${f2(77.4+3.6*Lp.l+(Lp.cl+Lp.cr)/2)} ${f2(50+W-.4)} ${f2(77.4+Lp.cr)}Z" fill="${lipL}"/>`;
      if(P.fs||P.jw)m+=`<path d="M${f2(50+S.chw+2.8)} ${f2(S.bot-1.4)}Q${f2(50+S.jw-.4)} ${f2(S.jy+4.6)} ${f2(50+S.cw-1.9)} 72" fill="none" stroke="${shSkin}" stroke-opacity=".35" stroke-width="1.8"/>`;
      if(ag==='old')m+=cr(`M41 ${f2(42-(S.top-31)*.5)}Q50 40.6 59 ${f2(42-(S.top-31)*.5)}`,.45,.8)}
    return m};
  return G}
return {PARTS,geo,prePass,mixc}})();
/* ---------- the variety key fx: pack / unpack / roll ---------- */
const FX99_PARTS=F2V.PARTS.map(p=>[p[0],p[2]]); /* [[key, values]] in the packed order */
const FX99_KEYS=FX99_PARTS.map(p=>p[0]);
function fx99Pack(o){o=o||{};let s='';for(const [k,vals] of FX99_PARTS){const i=Math.max(0,vals.indexOf(o[k]||''));s+=i.toString(36)}s+=o.kh?'1':'0';return s.replace(/0+$/,'')}
function fx99Unpack(s){const o={};s=String(s||'');FX99_PARTS.forEach(([k,vals],i)=>{const n=parseInt(s[i]||'0',36);o[k]=vals[n]||''});o.kh=s[12]==='1';return o}
const fx99Clean=s=>String(s||'').toLowerCase().replace(/[^0-9a-z]/g,'').slice(0,13).replace(/0+$/,'');
/* the parts a face carries: its fx, then any loose key (an editor draft) on top */
function fx99Parts(f){const o=fx99Unpack(f&&f.fx);if(f)for(const k of FX99_KEYS)if(typeof f[k]==='string'&&f[k])o[k]=f[k];return o}
const fx99Any=o=>FX99_KEYS.some(k=>o[k]);
const fnv99=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h};
const rng99=seed=>{let h=seed>>>0;return ()=>(h=(Math.imul(h,1103515245)+12345)>>>0)/4294967296};
const W99=(r,list)=>{const t=list.reduce((a,x)=>a+x[1],0);let v=r()*t;for(const [k,w] of list){if((v-=w)<0)return k}return list[0][0]};
/* fx99Roll(r,{fem,fighter}) — the weights of PORTRAITS.md §7b ('' = today's shape) */
function fx99Roll(r,o){o=o||{};const fem=!!o.fem,fighter=!!o.fighter;return {
  fs:W99(r,[['',28],['sq',16],['rd',14],['lg',14],['ht',13],['dm',15]]),
  jw:W99(r,[['',52],['nar',fem?22:13],['wid',15],['str',fem?4:20]]),
  ck:W99(r,[['',58],['hi',26],['flat',16]]),
  br:W99(r,[['',32],['thk',fem?6:18],['thn',fem?26:7],['arc',fem?18:10],['str',12],['scr',fighter&&!fem?9:3],['uni',6]]),
  ey:W99(r,[['',34],['alm',16],['rnd',12],['hod',14],['nar',12],['dep',12]]),
  es:W99(r,[['',70],['wide',15],['close',15]]),
  ns:W99(r,[['',28],['rom',18],['brd',15],['btn',fem?16:8],['lng',15],['brk',fighter&&!fem?16:4]]),
  lp:W99(r,[['',32],['thn',13],['ful',fem?20:11],['wid',10],['sml',10],['dwn',12],['smk',10]]),
  ea:W99(r,[['',55],['sml',13],['lrg',12],['pro',11],['caul',fighter&&!fem?12:1]]),
  nk:W99(r,[['',50],['sht',16],['lng',fem?24:12],['bul',fem?2:20]]),
  ag:W99(r,o.age||[['',48],['yng',26],['wth',19],['old',7]]),
  ln:W99(r,[['',74],['f',10],['c',10],['fc',6]])}}
/* a look gladPortrait made (Manager fighters, Ludus/Hall records, CPU seats): its own key list, in order, survives every save */
const GEN99='skin,hair,helm,beard,long,smile,scar,paint,bg';
function isGen99(p){if(!p||typeof p!=='object'||p.fx!=null)return false;return Object.keys(p).filter(k=>k!=='fem'&&k!=='color'&&k!=='v').join(',')===GEN99}
const genSeed99=p=>'fx:'+GEN99.split(',').map(k=>String(p[k])).join('|');
const spectSeed99=l=>'fx:sp|'+['skin','hair','long','fem','beard','hat','tunic','robe','city'].map(k=>String(l[k]==null?'':l[k])).join('|');
const fx99Gen=p=>fx99Pack(fx99Roll(rng99(fnv99(genSeed99(p))),{fem:!!p.fem,fighter:true}));
const fx99Crowd=l=>fx99Pack(fx99Roll(rng99(fnv99(spectSeed99(l))),{fem:!!l.fem}));
const FACE2={on:!FACE99.off&&typeof face99==='function',base:typeof face99==='function'?face99:null,noRoll:0,vec:0,stats:{build:0,buildMs:0}};
if(FACE2.on){
  if(!FACE99_KEYS.includes('fx'))FACE99_KEYS.push('fx');
  /* faceNorm99 carries fx: the stored one, a loose-key draft, or the roll of a generated look */
  {const nb=faceNorm99;faceNorm99=function(p){if(p&&typeof p==='object'&&N99.has(p))return p;const o=nb(p);if(!o||typeof o!=='object')return o;const src=p&&typeof p==='object'?p:{};
    let fx=src.fx!=null?fx99Clean(src.fx):'';
    if(src.fx==null){const loose={};let any=false;for(const k of FX99_KEYS)if(typeof src[k]==='string'&&src[k]){loose[k]=src[k];any=true}
      if(any)fx=fx99Pack(loose);else if(!FACE2.noRoll&&isGen99(src))fx=fx99Gen(src)}
    o.fx=fx;return o}}
  /* the crowd (spectators, regulars, residents, advisors) rolls from its look; patrons (their look carries the cushion c1/c2) keep theirs (stored, his §7b) */
  {const bs=fromSpect99;fromSpect99=function(look,mantle,city){const l=look||{};const f=bs.apply(this,arguments);
    if(isPortrait99(l))return f;const want=l.fx!=null?fx99Clean(l.fx):FACE2.noRoll||'c1' in l||'c2' in l?'':fx99Crowd(l);if(f.fx===want)return f;return faceNorm99({...f,fx:want})}}
}
/* ---------- textures for the full tier (built once, inlined into each picture that uses them) ---------- */
let TEX99=null;
function tex99(){if(TEX99)return TEX99;const R=F2B.rng(7);
  const mk=(w,h,fn)=>{try{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');fn(x,w,h);return c.toDataURL('image/png')}catch(e){return ''}};
  const pores=mk(64,64,(x,w,h)=>{for(let i=0;i<340;i++){const px=R()*w,py=R()*h,r=.3+R()*.6;x.fillStyle=R()<.62?`rgba(90,34,22,${.08+R()*.12})`:`rgba(255,240,224,${.08+R()*.12})`;x.beginPath();x.arc(px,py,r,0,7);x.fill()}});
  const canv=mk(128,128,(x,w,h)=>{const d=x.createImageData(w,h);for(let i=0;i<w*h;i++){const v=R();const k=i*4;const l=v<.5?0:255;d.data[k]=d.data[k+1]=d.data[k+2]=l;d.data[k+3]=Math.round(Math.abs(v-.5)*46)}x.putImageData(d,0,0);
    for(let i=0;i<40;i++){x.strokeStyle=R()<.5?`rgba(0,0,0,${.02+R()*.04})`:`rgba(255,240,210,${.02+R()*.035})`;x.lineWidth=1+R()*3;x.beginPath();const a=-0.6+R()*.3,px=R()*w,py=R()*h,l=8+R()*26;x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}});
  return TEX99={t99skin:`<pattern id="t99skin" patternUnits="userSpaceOnUse" width="13" height="13"><image href="${pores}" width="13" height="13"/></pattern>`,
    t99canvas:`<pattern id="t99canvas" patternUnits="userSpaceOnUse" width="44" height="44"><image href="${canv}" width="44" height="44"/></pattern>`,
    t99weave:`<pattern id="t99weave" patternUnits="userSpaceOnUse" width="2.4" height="2.4" patternTransform="rotate(8)"><path d="M0 .6h2.4M0 1.8h2.4" stroke="#000" stroke-opacity=".2" stroke-width=".38"/><path d="M.6 0v2.4M1.8 0v2.4" stroke="#fff" stroke-opacity=".13" stroke-width=".32"/></pattern>`}}
function tex99Inline(s){if(s.indexOf('url(#t99')<0)return s;const T=tex99();let p='';for(const k in T)if(s.indexOf('url(#'+k+')')>=0)p+=T[k];return p?s.replace('<defs>','<defs>'+p):s}
/* ---------- the painter: geometry → variety pre-pass → painterly pass → frame ---------- */
/* face2Build(f FACE1, {frame,color,T,grain,uid}) → the standalone SVG string (viewBox = the frame) */
function face2Build(f,o){const t0=performance.now();const P=fx99Parts(f);const any=fx99Any(P);let s2=f;
  if(any||o.T>0){s2={...f};if(P.ag==='old'&&!P.kh)s2.hair=F2V.mixc(f.hair||HAIRS[1],'#c9c6bf',.58);if(P.ag==='wth')s2.skin=F2V.mixc(f.skin||SKINS[1],'#9a5a40',.07);
    if(!s2.skin)s2.skin=SKINS[1];if(!s2.hair)s2.hair=HAIRS[1]}
  let s=face99Paint(s2,'bust',o.color,{polish:false});let G=null;
  if(any){G=F2V.geo(P,s2);G.T=o.T;s=F2V.prePass(s,G)}
  if(o.T>0){s=F2B.strong99(s,s2,{color:o.color,geo:G,T:o.T,grain:o.grain,uid:o.uid});if(o.T>=3)s=tex99Inline(s)}
  if(o.frame&&o.frame!=='bust')s=s.replace('viewBox="0 0 100 140"',`viewBox="${FACE99.FRAMES[o.frame]||FACE99.FRAMES.chip}"`);
  FACE2.stats.build++;FACE2.stats.buildMs+=performance.now()-t0;return s}
/* tier by the bust-equivalent px */
function face2Tier(px,det){if(det==='light')return 1;if(!px)return 2;return px<=32?0:px<48?1:px<120?2:3}
const FW99={bust:100,chip:88,head:76,face:60};
if(FACE2.on&&!FACE99.FRAMES.face)FACE99.FRAMES.face='20 30 60 60'; /* the designer's feature thumbnails: the face itself, ears and the top of the neck */
function face2Key(f,frame,color,T,grain){let k=frame+'|'+T+(grain?'g':'')+'|'+color;for(const n of FACE99_KEYS)k+='|'+(f[n]===true?1:f[n]===false?0:f[n]==null?'':f[n]);return k}
/* ---------- the raster cache ---------- */
const R99={map:new Map(),n:0,MAX:640,q:[],busy:0,PAR:2,png:true,stats:{hit:0,miss:0,png:0,fail:0,evict:0,ms:0}};
try{R99.png=localStorage.getItem('flavius_face99png')!=='0'}catch(e){}
const r99Can=()=>typeof HEADLESS!=='undefined'&&!HEADLESS&&typeof document!=='undefined'&&typeof encodeURIComponent==='function';
/* the picture is a data: URL — blob: URLs cost a fetch per <image> element on every redraw (measured 2.2 ms a face); a data: URL decodes once */
function r99Get(key,build,W,H){let e=R99.map.get(key);if(e){R99.map.delete(key);R99.map.set(key,e);R99.stats.hit++;return e}
  let svg=build();svg=svg.replace('<svg ',`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" preserveAspectRatio="none" `);
  const url='data:image/svg+xml,'+encodeURIComponent(svg);e={id:'f'+(++R99.n),url,svgUrl:url,W,H,key};R99.map.set(key,e);R99.stats.miss++;
  if(R99.png){R99.q.push(e);r99Pump()}r99Evict();return e}
function r99Evict(){let guard=0;while(R99.map.size>R99.MAX&&guard++<40){const [k,e]=R99.map.entries().next().value;R99.map.delete(k);
    if(document.querySelector(`image[data-f99="${e.id}"]`)){R99.map.set(k,e);continue}R99.stats.evict++;e.dead=true}}
/* background: the SVG picture → a JPEG at the shown size (idle time, 2 at once), swapped into every <image data-f99> on the page */
const r99Later=fn=>typeof requestIdleCallback==='function'?requestIdleCallback(fn,{timeout:400}):setTimeout(fn,16);
function r99Pump(){while(R99.busy<R99.PAR&&R99.q.length){R99.busy++;r99Later(r99Step)}}
function r99Step(){let e=R99.q.shift();while(e&&e.dead)e=R99.q.shift();if(!e){R99.busy--;return}const t0=performance.now();
  const next=()=>{R99.busy--;R99.stats.ms+=performance.now()-t0;if(R99.q.length)r99Pump()};
  const im=new Image();im.decoding='async';
  im.onload=()=>{try{const c=document.createElement('canvas');c.width=e.W;c.height=e.H;c.getContext('2d').drawImage(im,0,0,e.W,e.H);
      c.toBlob(b=>{if(!b||e.dead){if(!b)R99.stats.fail++;next();return}const fr=new FileReader();fr.onload=()=>{if(!e.dead&&typeof fr.result==='string'){e.url=fr.result;e.svgUrl=null;R99.stats.png++;
          document.querySelectorAll(`image[data-f99="${e.id}"]`).forEach(n=>n.setAttribute('href',e.url))}next()};fr.onerror=()=>{R99.stats.fail++;next()};fr.readAsDataURL(b)},'image/jpeg',.92)}
    catch(err){R99.stats.fail++;R99.png=false;R99.q.length=0;next()}};
  im.onerror=()=>{R99.stats.fail++;next()};im.src=e.url}
const r99Dpr=()=>Math.min(2,Math.max(1,(typeof window!=='undefined'&&window.devicePixelRatio)||1));
function r99Wrap(e,frame,opt){const vb=FACE99.FRAMES[frame]||FACE99.FRAMES.bust;const [x,y,w,h]=vb.split(' ');
  return `<svg viewBox="${vb}"${opt.cls?` class="${opt.cls}"`:''}${opt.w?` width="${opt.w}" height="${opt.h||opt.w}"`:''} aria-hidden="true"><image data-f99="${e.id}" href="${e.url}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/></svg>`}
let VEC99=0;
/* ---------- face99 · THE painter, phase 2 ---------- */
if(FACE2.on){
  face99=function(spec,opt){opt=opt||{};const det=face99Detail();
    if(det==='off'||opt.polish===false)return FACE2.base(spec,{...opt,polish:false});
    const f=faceNorm99(spec);const frame=opt.frame||'bust';const color=opt.color!==undefined?opt.color:(f.color||'#c0433a');
    const fw=FW99[frame]||88;const shown=opt.size||0;const T=face2Tier(shown?shown*100/fw:0,det);const grain=det==='full'&&shown*100/fw>=150;
    const live=String(f.bg||'').startsWith('flag:c:');
    if(opt.raster!==false&&!FACE2.vec&&!live&&r99Can()){const key=face2Key(f,frame,color,T,grain);const dpr=r99Dpr();
      const px=shown||110;const W=Math.max(frame==="bust"?40:72,Math.round(px*dpr));const H=Math.round(W*(frame==='bust'?1.4:1));
      const e=r99Get(key+'|'+W,()=>face2Build(f,{frame,color,T,grain,uid:'q'}),W,H);return r99Wrap(e,frame,opt)}
    /* vector: cached with a placeholder id prefix, a fresh prefix per copy (ids stay unique on the page) */
    const T2=Math.min(T,2);const key=live?null:'v2|'+face2Key(f,frame,color,T2,false);let s=key&&FACE99.cache.get(key);
    if(s!=null)FACE99.stats.hit++;else{s=face2Build(f,{frame,color,T:T2,grain:false,uid:'q§_'});if(key){FACE99.stats.miss++;FACE99.cache.set(key,s);FACE99.chars+=s.length+key.length;
        while(FACE99.cache.size>FACE99.MAX||FACE99.chars>FACE99.MAXCH){const k0=FACE99.cache.keys().next().value;if(k0==null)break;FACE99.chars-=(FACE99.cache.get(k0)||'').length+k0.length;FACE99.cache.delete(k0)}}else FACE99.stats.skip++}
    if(s.indexOf('§')>=0)s=s.split('§').join('v'+(++VEC99));
    if(opt.cls)s=s.replace('<svg ',`<svg class="${opt.cls}" `);if(opt.w)s=s.replace('<svg ',`<svg width="${opt.w}" height="${opt.h||opt.w}" `);
    return s};
  portraitSVG=function(pt,color){return face99(pt,{color:color===undefined?'#c0433a':color,frame:'bust'})};
  portraitHTML=function(who,size){size=size||'md';const [w,h]=PORTRAIT_SIZES[size]||PORTRAIT_SIZES.md;who=who||{};
    return `<span class="portrait" style="width:${w}px;height:${h}px" role="img" aria-label="${esc(who.name||_T('Custom gladiator'))}">${face99(who.portrait,{color:who.color===undefined?'#c0433a':who.color,frame:'bust',size:w})}</span>`};
  face99Spect=function(look,o){o=o||{};const px=o.px||20;const f=o.spec||fromSpect99(look,o.mantle,o.city);
    return face99(f,{frame:px>=FACE99.CHIP_PX?'chip':'head',size:Math.max(px,o.raster||0),cls:'sface',w:px,color:f.color})};
  if(typeof onlPatronFace82==='function')onlPatronFace82=function(p,sz){return face99Spect(p||{},{px:sz||20,spec:fromPatron99(p||{})})};
  /* the Summa Rudis card becomes a data: URL picture — its face stays vector */
  if(typeof srCardSVG==='function'){const b=srCardSVG;srCardSVG=function(){FACE2.vec++;try{return b.apply(this,arguments)}finally{FACE2.vec--}}}
  /* 🎲 random looks roll the new parts too (UI randomness, never the dice) */
  if(typeof randomPortrait==='function'){const b=randomPortrait;randomPortrait=function(){const p=b.apply(this,arguments);try{if(p&&typeof p==='object'){const fx=fx99Pack(fx99Roll(Math.random,{fem:!!p.fem,fighter:true}));if(fx)p.fx=fx}}catch(e){}return p}}
}
/* ---------- the designer: "🧬 Features" in the Character / Lanista Appearance tab (262's frame; only added) ---------- */
const FX99_LBL=()=>({fs:[_T('Face'),[_T('Oval'),_T('Square'),_T('Round'),_T('Long'),_T('Heart'),_T('Diamond')]],
  jw:[_T('Jaw'),[_T('Usual'),_T('Narrow'),_T('Wide'),_T('Strong')]],
  ck:[_T('Cheekbones'),[_T('Usual'),_T('High'),_T('Flat')]],
  br:[_T('Brows'),[_T('Usual'),_T('Thick'),_T('Thin'),_T('Arched'),_T('Straight'),_T('Scar-split'),_T('Unibrow')]],
  ey:[_T('Eyes'),[_T('Usual'),_T('Almond'),_T('Round'),_T('Hooded'),_T('Narrow'),_T('Deep-set')]],
  es:[_T('Eye set'),[_T('Usual'),_T('Wide-set'),_T('Close-set')]],
  ns:[_T('Nose'),[_T('Usual'),_T('Roman'),_T('Broad'),_T('Button'),_T('Long'),_T('Broken')]],
  lp:[_T('Lips'),[_T('Usual'),_T('Thin'),_T('Full'),_T('Wide'),_T('Small'),_T('Downturned'),_T('Smirk')]],
  ea:[_T('Ears'),[_T('Usual'),_T('Small'),_T('Large'),_T('Protruding'),_T('Cauliflower')]],
  nk:[_T('Neck'),[_T('Usual'),_T('Short-thick'),_T('Long-slim'),_T('Bull')]],
  ag:[_T('Age'),[_T('Usual'),_T('Young'),_T('Weathered'),_T('Old')]],
  ln:[_T('Lines'),[_T('None'),_T('Forehead'),_T('Cheeks'),_T('Both')]]});
const FX99={part:'fs'};
/* the draft a designer edits: Studio character · Studio lanista · Manager new-career lanista */
function fx99Draft(ctx){try{if(ctx==='char'&&typeof ST!=='undefined'&&ST.draft)return ST.draft;if(ctx==='lanS'&&typeof ST!=='undefined'&&ST.lnd)return ST.lnd;
  if(ctx==='lanM'&&typeof NEWMGR!=='undefined'&&NEWMGR)return NEWMGR}catch(e){}return null}
function fx99BodyHTML(d){const pt=(d&&d.portrait)||{};const P=fx99Parts(pt);const L=FX99_LBL();const part=L[FX99.part]?FX99.part:'fs';const vals=FX99_PARTS.find(p=>p[0]===part)[1];
  const tabs=FX99_KEYS.map(k=>{const i=Math.max(0,FX99_PARTS.find(p=>p[0]===k)[1].indexOf(P[k]||''));return `<button type="button" class="fx99t${k===part?' on':''}${i?' set':''}" data-fx99p="${k}" aria-pressed="${k===part}">${esc(L[k][0])}<small>${esc(L[k][1][i])}</small></button>`}).join('');
  const col=(d&&d.color)||'#c0433a';
  const opts=vals.map((v,i)=>{const on=(P[part]||'')===v;const fx=fx99Pack({...P,[part]:v});const face=face99({...pt,fx},{frame:'face',size:44,w:44,color:col});
    return `<button type="button" class="fx99o${on?' on':''}" data-fx99o="${part}:${v}" aria-pressed="${on}" title="${esc(L[part][1][i])}">${face}<span>${esc(L[part][1][i])}</span></button>`}).join('');
  return `${face99Detail()==="off"?`<p class="rc-sub fx99off">${_T`Portrait detail is Off in Settings — the features show with Light or Full.`}</p>`:""}<div class="fx99tabs" role="group" aria-label="${_T`Feature`}">${tabs}</div><div class="fx99opts">${opts}</div>
    <div class="fx99row"><label class="fx99kh"><input type="checkbox" data-fx99kh="1" ${P.kh?'checked':''}> ${_T`Keep the hair colour when old`}</label><span class="fx99sp"></span><button type="button" class="btn tksm" data-fx99r="1">${_T`🎲 Random features`}</button><button type="button" class="btn tksm" data-fx99z="1">${_T`↺ Usual shape`}</button></div>`}
function fx99CardEl(ctx,d){const card=DF99.card(_T`🧬 Features`,_T`face shape · eyes · nose · age`,'fx99card',[]);card.dataset.fx99ctx=ctx;card.querySelector('.df99in').innerHTML=fx99BodyHTML(d);return card}
function fx99Insert(R,ctx){const d=fx99Draft(ctx);if(!d)return;const pane=R.querySelector('.df99pane[data-df99p="look"]');if(!pane||pane.querySelector('.fx99card'))return;
  const col=pane.querySelector('.df99col');(col||pane).appendChild(fx99CardEl(ctx,d))}
if(FACE2.on&&typeof DF99!=='undefined'&&!DF99.off){
  if(typeof studioHTML==='function'){const base=studioHTML;studioHTML=function(){const h=base.apply(this,arguments);try{if(typeof h==='string'&&h.indexOf('df99pane')>=0){
      if(ST.tab==='chars'&&ST.view==='edit'&&ST.draft)return df99Xform(h,R=>fx99Insert(R,'char'));if(ST.tab==='lanistas'&&ST.lnd)return df99Xform(h,R=>fx99Insert(R,'lanS'))}}catch(e){console.error(e)}return h}}
  if(typeof mgrHTML==='function'){const base=mgrHTML;mgrHTML=function(){const h=base.apply(this,arguments);try{if(typeof h==='string'&&h.indexOf('ln99mgr')>=0&&typeof NEWMGR!=='undefined'&&NEWMGR)return df99Xform(h,R=>fx99Insert(R,'lanM'))}catch(e){console.error(e)}return h}}
}
/* refresh the card + the designer's own preview portrait after a change */
function fx99Refresh(card,ctx,d){const b=card.querySelector('.df99in');if(b)b.innerHTML=fx99BodyHTML(d);
  try{if(ctx==='char'){const pv=document.getElementById('stPortrait');if(pv)pv.innerHTML=portraitHTML(d,'lg')}
    else if(ctx==='lanS'&&typeof lnRefreshFace==='function')lnRefreshFace();else if(ctx==='lanM'&&typeof nmLookRefresh==='function')nmLookRefresh()}catch(e){console.error(e)}}
function fx99Set(d,P){const pt=d.portrait=d.portrait||{};for(const k of FX99_KEYS)delete pt[k];const fx=fx99Pack(P);if(fx)pt.fx=fx;else delete pt.fx}
document.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('.fx99card [data-fx99p],.fx99card [data-fx99o],.fx99card [data-fx99r],.fx99card [data-fx99z]');if(!t)return;
  const card=t.closest('.fx99card');const ctx=card.dataset.fx99ctx;const d=fx99Draft(ctx);if(!d)return;e.preventDefault();e.stopPropagation();
  if(t.dataset.fx99p){FX99.part=t.dataset.fx99p;fx99Refresh(card,ctx,d);return}
  const P=fx99Parts(d.portrait||{});
  if(t.dataset.fx99o){const [k,v]=t.dataset.fx99o.split(':');P[k]=v||''}
  else if(t.dataset.fx99r){const R=fx99Roll(Math.random,{fem:!!(d.portrait&&d.portrait.fem),fighter:ctx==='char'});for(const k of FX99_KEYS)P[k]=R[k]}
  else if(t.dataset.fx99z){for(const k of FX99_KEYS)P[k]=''}
  fx99Set(d,P);fx99Refresh(card,ctx,d)},true);
document.addEventListener('change',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.fx99kh)return;const card=t.closest('.fx99card');if(!card)return;const ctx=card.dataset.fx99ctx;const d=fx99Draft(ctx);if(!d)return;
  e.stopPropagation();const P=fx99Parts(d.portrait||{});P.kh=t.checked;fx99Set(d,P);fx99Refresh(card,ctx,d)},true);
if(FACE2.on&&typeof document!=='undefined'){const st=document.createElement('style');st.id='fx99css';st.textContent=`
.fx99card .fx99tabs{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}
.fx99card .fx99t{display:grid;gap:0;padding:3px 7px;border:1px solid var(--line,#4a3826);border-radius:7px;background:rgba(0,0,0,.18);color:var(--txt,#efe3cc);font:600 11px/1.2 var(--sans,system-ui);cursor:pointer;text-align:left}
.fx99card .fx99t small{font:400 10px/1.2 var(--sans,system-ui);color:var(--dim,#a3907a);white-space:nowrap}
.fx99card .fx99t.set small{color:var(--gold,#d6ab4c)}
.fx99card .fx99t.on{border-color:var(--gold,#d6ab4c);background:rgba(214,171,76,.16)}
.fx99card .fx99opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:5px}
.fx99card .fx99o{display:grid;justify-items:center;gap:2px;padding:4px 2px 3px;border:1px solid var(--line,#4a3826);border-radius:8px;background:rgba(0,0,0,.2);color:var(--txt,#efe3cc);cursor:pointer;font:500 10.5px/1.15 var(--sans,system-ui)}
.fx99card .fx99o svg{width:44px;height:44px;border-radius:50%;display:block}
.fx99card .fx99o.on{border-color:var(--gold,#d6ab4c);box-shadow:0 0 0 1px var(--gold,#d6ab4c) inset;background:rgba(214,171,76,.14)}
.fx99card .fx99o span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.fx99card .fx99row{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:7px}
.fx99card .fx99kh{display:flex;align-items:center;gap:5px;font-size:12px}
.fx99card .fx99sp{flex:1}
@media (max-width:700px){.fx99card .fx99opts{grid-template-columns:repeat(auto-fill,minmax(52px,1fr))}.fx99card .fx99o svg{width:38px;height:38px}}`;(document.head||document.documentElement).appendChild(st)}

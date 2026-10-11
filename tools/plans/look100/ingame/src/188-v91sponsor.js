/* 188-v91sponsor — v0.91 PAINTED SPONSORS (his picks 2026-10-06).
   • The editors of the games (city patrons + Studio-made sponsors) are PAINTED like his Flavius (assets/flavmood_*.webp): ink outlines
     with a heavier shadow side, painterly shading lit from the upper left (warm shadow planes, brush strokes, hatching, grain, a dark
     vignette behind), eye sockets, a modelled nose, cheekbones, shaped hair and beards, lips. Drawn procedurally from the sponsor's
     parts by `sp91Paint`, so every existing and every Studio-made sponsor gets it; deterministic per sponsor (seeded by its look).
   • All 11 moods change BIG at box size: brows, lids, mouth shapes, head tilt; tears (weep), a red flush + a vein (angry), a hand over
     the eyes (facepalm), the open palm held out ('really'), a fist under the chin (bored), the raised fist + accessory (cheer).
   • Cache: `sp91Portrait` keeps one canvas per sponsor look + mood + size (SP91_CACHE, ≤ SP91_MAX). flavFace (wrapped) draws the frame
     in the sponsor's colours and blits the cached portrait; Flavius himself still gets his paintings (167) untouched.
   • NEW PARTS (all optional, old saves fill in defaults via `sp91Look`): hair style `hair2` (short, curls, cropped, receding, bald, long,
     bun, braids — `long` still works), beards + stubble / goatee / moustache, headwear + golden laurel, silver circlet, veil, Phrygian cap,
     age `age` (young/adult/old/elder: wrinkles + grey), eye colour `eye`, jewelry `ear` (hoops/pearls/gems), `torc` (gold/silver),
     `brooch` (gold/silver/none), skin tone swatches (SP91_SKINS). City patrons get a few of the new parts (SP91_CITY).
   • BOX COLOURS: `frame` (gilt frame, default #c9a458) and `curtain` (velvet, default #8e1b22) used when the sponsor sits in the box —
     the frame, the curtain (drawCurtain replaced: sponsor colours) and, when a curtain colour is chosen, tied-back drapes at the box sides.
   • Studio → Editors: the designer is wider (.trstudio.big), a big portrait + a MOOD ROW of all 11 moods (sponPrevHTML replaced), the
     new part selects, skin swatches, Frame / Curtain colours + ↺ default box; 🎲 Surprise me uses Math.random (was the dice RNG).
   • 'really' is in FLAV_PRI / FLAV_LINES / every sponsor voice (167); kept, checked by tv91s. Test: tools/tests/tv91s.js. */

const SP91_MOODS=['calm','pleased','smug','cheer','laugh','shock','angry','bored','weep','facepalm','really'];
/* SP91_DEF — defaults for the new look fields (old sponsors have none). TWEAK: the default frame/curtain = today's box. */
const SP91_DEF={frame:'#c9a458',curtain:'',age:'adult',hair2:'',ear:'none',torc:'none',brooch:'gold',eye:'#4a2c18'};
const SP91_CURTAIN0='#8e1b22';
/* SP91_SKINS — skin tone swatches for the designer. */
const SP91_SKINS=['#f6d7bd','#f0c9a6','#e0ac7e','#d9a07a','#c98e62','#a87450','#9a6a48','#7a4e30','#5e3a22','#46291a'];
/* SP91_CITY — a few of the new parts on the city patrons (only where they set nothing). */
const SP91_CITY={1:{age:'old',hair2:'receding',brooch:'silver'},2:{hair2:'bun',ear:'pearls'},3:{age:'old',torc:'gold'},4:{hair2:'cropped',ear:'none',brooch:'gold'},
  5:{ear:'hoops',torc:'gold'},7:{age:'young',hair2:'curls'},8:{hair2:'curls',ear:'gems'},9:{torc:'gold',hair2:'cropped'},10:{ear:'hoops',beard:'goatee'},
  11:{age:'elder',ear:'pearls'},12:{age:'old',hair2:'bald',brooch:'silver'}};
try{for(const [k,v] of Object.entries(SP91_CITY)){const sp=CITY_SPONSORS[k];if(sp)for(const [f,x] of Object.entries(v))if(sp[f]==null||(f==='beard'&&sp.beard==='short'))sp[f]=x}}catch(e){}

/* ---------- colour + random helpers ---------- */
const SP91_INK='#140b07';
/* sp91RGB — '#hex' → [r,g,b]. */
function sp91RGB(hex){let h=String(hex||'#888').trim();const m=h.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)/);if(m)return [+m[1],+m[2],+m[3]];h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');
  const n=parseInt(h.slice(0,6),16);return isNaN(n)?[136,136,136]:[n>>16&255,n>>8&255,n&255]}
const sp91Str=([r,g,b],a)=>a==null?`rgb(${r|0},${g|0},${b|0})`:`rgba(${r|0},${g|0},${b|0},${a})`;
/* sp91Blend — mixes colour a toward b by k (0..1). */
function sp91Blend(a,b,k,al){const A=sp91RGB(a),B=sp91RGB(b);return sp91Str(A.map((v,i)=>v+(B[i]-v)*k),al)}
/* sp91Lit — toward a warm light (k>0) ; sp91Warm — toward a warm, reddish shadow (the painting's shadow tone). */
const sp91Lit=(c,k,al)=>sp91Blend(c,'#fff4dc',k,al);
const sp91Warm=(c,k,al)=>sp91Blend(c,'#3c140a',k,al);
/* sp91Rng — a seeded generator (mulberry32) so a sponsor always paints the same. */
function sp91Rng(seed){let a=seed>>>0||1;return ()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
function sp91Hash(s){let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h}

/* sp91Look — a sponsor with every look field filled (old saves load as before). */
function sp91Look(sp){sp=sp||{};const L={...sp};for(const [k,v] of Object.entries(SP91_DEF))if(L[k]==null||L[k]==='')L[k]=v;
  L.skin=sp.skin||'#d9a07a';L.hair=sp.hair||'#2a1c12';L.robe=sp.robe||'#5a3566';L.trim=sp.trim||'#e8dcc0';L.gem=sp.gem||'#c0433a';
  L.bg=sp.bg||'#4a2a52';L.bg2=sp.bg2||'#2a1830';L.head=sp.head||'laurel';L.beard=sp.beard===undefined?'full':(sp.beard||'none');L.acc=sp.acc||'goblet';
  L.hairS=sp.hair2||(sp.long?'long':'short');
  const grey={young:0,adult:0,old:.5,elder:.86}[L.age]||0;L.hairC=grey?sp91Blend(L.hair,'#d4d0c8',grey):L.hair;L.browC=grey?sp91Blend(L.hair,'#bdb8ae',grey*.8):L.hair;
  return L}
/* sp91LookKey — the parts that change the painting. */
const SP91_KEYS=['skin','hair','robe','trim','gem','bg','bg2','head','beard','acc','hairS','age','eye','ear','torc','brooch','long'];
const sp91LookKey=L=>SP91_KEYS.map(k=>String(L[k]==null?'':L[k])).join('|');

/* SP91_MO — the moods: head tilt/shift, eyes [left,right], brows [[inner y, outer y, arch] ×2], mouth, flush, hand. */
const SP91_MO={
  calm:{eyes:[{},{}],brows:[[-.62,-.66,.12],[-.62,-.66,.12]],mouth:'flat'},
  pleased:{tilt:-.05,dy:-.05,eyes:[{sq:.55},{sq:.55}],brows:[[-.85,-.88,.24],[-.85,-.88,.24]],mouth:'grin',flush:.22,cheeks:1},
  smug:{tilt:-.07,dy:-.1,eyes:[{lid:.5,lx:.14},{lid:.38,lx:.14}],brows:[[-.48,-.5,.04],[-.95,-1.35,.38]],mouth:'smirk'},
  cheer:{eyes:[{rx:.58,ry:.4},{rx:.58,ry:.4}],brows:[[-1.05,-1.05,.28],[-1.05,-1.05,.28]],mouth:'open',flush:.22,cheeks:1,hand:'raise'},
  laugh:{tilt:-.16,dy:-.15,eyes:[{closed:1,up:1},{closed:1,up:1}],brows:[[-.9,-.82,.22],[-.9,-.82,.22]],mouth:'laugh',flush:.3,cheeks:1},
  shock:{dy:-.2,eyes:[{rx:.58,ry:.55,ir:.12},{rx:.58,ry:.55,ir:.12}],brows:[[-1.3,-1.3,.35],[-1.3,-1.3,.35]],mouth:'O',lines:3,pale:.12},
  angry:{tilt:.05,dy:.18,eyes:[{cut:1,ir:.17},{cut:1,ir:.17}],brows:[[-.18,-1.05,-.1],[-.18,-1.05,-.1]],mouth:'snarl',flush:.55,vein:1},
  bored:{tilt:.2,dy:.1,eyes:[{lid:.68,ly:.06},{lid:.68,ly:.06}],brows:[[-.42,-.4,0],[-.42,-.4,0]],mouth:'droop',hand:'chin'},
  weep:{tilt:.08,eyes:[{wet:1,lid:.18,ly:-.05},{wet:1,lid:.18,ly:-.05}],brows:[[-1.15,-.42,-.05],[-1.15,-.42,-.05]],mouth:'wobble',tears:1,flush:.15,redNose:1,lines:2},
  facepalm:{tilt:.24,dy:.35,eyes:[{closed:1},{closed:1}],brows:[[-.45,-.5,.05],[-.45,-.5,.05]],mouth:'down',hand:'palm'},
  really:{tilt:-.09,eyes:[{lid:.42,lx:-.1},{rx:.56,ry:.42,lx:-.1}],brows:[[-.45,-.5,.04],[-1.15,-1.55,.42]],mouth:'talk',hand:'out',lines:2}};

/* sp91Paint — paints a sponsor (look L) in a mood on a W×H canvas (the box's inside). TWEAK: u = the head's unit (H/9.2). */
function sp91Paint(c,W,H,mood,L,seed){
  const R=sp91Rng(seed),TAU=Math.PI*2,M=SP91_MO[mood]||SP91_MO.calm;
  const u=H/9.2,hy=H*.5;
  const skin=M.pale?sp91Lit(L.skin,M.pale):L.skin,hair=L.hairC,robe=L.robe,trim=L.trim,gem=L.gem;
  const E=(x,y,rx,ry,r=0)=>{c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),r,0,TAU)};
  const ink=(wd,al)=>{c.strokeStyle=SP91_INK;c.globalAlpha=al==null?1:al;c.lineWidth=wd||.15;c.lineJoin='round';c.lineCap='round';c.stroke();c.globalAlpha=1};
  /* paint — fills a path the painted way: light→warm-shadow gradient, brush strokes, hatching on the shadow side, ink line (heavier on the right). */
  const paint=(path,base,bb,o={})=>{const [x0,y0,x1,y1]=bb;
    path();const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,sp91Lit(base,o.hi==null?.22:o.hi));g.addColorStop(.42,base);g.addColorStop(1,sp91Warm(base,o.sh==null?.5:o.sh));c.fillStyle=g;c.fill();
    c.save();path();c.clip();
    const n=o.n==null?10:o.n,sw=Math.max(x1-x0,y1-y0);
    for(let i=0;i<n;i++){const x=x0+(x1-x0)*R(),y=y0+(y1-y0)*R(),lit=x+y<(x0+x1+y0+y1)/2;c.strokeStyle=lit?sp91Lit(base,.12+R()*.16):sp91Warm(base,.18+R()*.25);
      c.globalAlpha=.16+R()*.14;c.lineWidth=sw*(.05+R()*.07);const a=(o.dir==null?-.9:o.dir)+(R()-.5)*.6,l=sw*(.15+R()*.25);
      c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.5+(R()-.5)*.3,y+Math.sin(a)*l*.5+(R()-.5)*.3,x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke()}
    c.globalAlpha=1;
    if(o.hatch!==false){c.beginPath();c.rect(x0+(x1-x0)*(o.hx==null?.6:o.hx),y0-1,x1-x0+2,y1-y0+2);c.clip();c.strokeStyle=SP91_INK;c.globalAlpha=o.ha||.2;c.lineWidth=.05;
      for(let t=x0;t<x1+(y1-y0);t+=.2){c.beginPath();c.moveTo(t,y0);c.lineTo(t-(y1-y0)*.6,y1);c.stroke()}c.globalAlpha=1}
    c.restore();
    if(o.ink!==false){path();ink(o.ink||.15);c.save();c.beginPath();c.rect((x0+x1)/2+(x1-x0)*.1,y0-2,x1-x0+4,y1-y0+4);c.clip();path();ink((o.ink||.15)*1.9,.85);c.restore()}};

  /* ---- the backdrop: the sponsor's colour as a glow in the dark, painted strokes ---- */
  const bg=c.createRadialGradient(W*.36,H*.28,H*.04,W*.5,H*.55,Math.max(W,H)*.78);bg.addColorStop(0,sp91Lit(L.bg,.18));bg.addColorStop(.5,L.bg);bg.addColorStop(1,sp91Blend(L.bg2,'#000',.55));
  c.fillStyle=bg;c.fillRect(0,0,W,H);
  for(let i=0;i<26;i++){c.strokeStyle=R()<.5?sp91Lit(L.bg,.15):sp91Blend(L.bg2,'#000',.3);c.globalAlpha=.1+R()*.1;c.lineWidth=H*(.04+R()*.06);const x=R()*W,y=R()*H;
    c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+H*.2,y-H*.1*R(),x+H*(.2+R()*.4),y-H*(.1+R()*.2));c.stroke()}c.globalAlpha=1;

  c.save();c.translate(W/2,hy);c.scale(u,u);
  const BX=W/2/u,BY=(H-hy)/u;
  /* ---- shoulders + robe ---- */
  const body=()=>{c.beginPath();c.moveTo(-BX-1,BY+1);c.lineTo(-BX-1,4.4);c.bezierCurveTo(-5.2,3.6,-3.2,3.05,-1.25,3.0);c.quadraticCurveTo(0,3.55,1.25,3.0);c.bezierCurveTo(3.2,3.05,5.2,3.6,BX+1,4.4);c.lineTo(BX+1,BY+1);c.closePath()};
  paint(body,robe,[-5.5,2.9,5.5,BY+.5],{n:16,hx:.55,dir:-1.3});
  c.save();body();c.clip();
  c.strokeStyle=sp91Warm(robe,.6);c.lineWidth=.12;for(const [x0,x1] of [[-3.6,-4.4],[-2.4,-2.7],[2.6,3.1],[3.8,4.6]]){c.beginPath();c.moveTo(x0,3.5);c.quadraticCurveTo((x0+x1)/2+.35,4.3,x1,BY+.5);c.stroke()}
  /* the toga's trim falling from the left shoulder */
  const sash=()=>{c.beginPath();c.moveTo(-2.9,3.1);c.quadraticCurveTo(-.5,3.9,1.6,BY+.6);c.lineTo(3.2,BY+.6);c.quadraticCurveTo(.4,3.6,-1.6,2.95);c.closePath()};
  c.restore();paint(sash,trim,[-3,2.9,3.2,BY+.6],{n:6,hx:.7,ink:.12});
  c.save();sash();c.clip();c.strokeStyle=sp91Warm(trim,.35);c.lineWidth=.08;for(const k of [.3,.6]){c.beginPath();c.moveTo(-2.9+k*2,3.1+k*.2);c.quadraticCurveTo(-.3+k*1.2,3.95,1.8+k*1.2,BY+.6);c.stroke()}c.restore();
  if(L.brooch!=='none'){const bc=L.brooch==='silver'?'#c9ccd3':'#d9b45a';E(-2.75,3.45,.42,.42);c.fillStyle=bc;c.fill();ink(.1);E(-2.75,3.45,.2,.2);c.fillStyle=gem;c.fill();E(-2.85,3.35,.07,.07);c.fillStyle='#fff';c.fill()}

  /* ---- the head (tilts per mood around the neck) ---- */
  c.save();const tilt=M.tilt||0;c.translate(M.dx||0,M.dy||0);if(tilt){c.translate(0,3);c.rotate(tilt);c.translate(0,-3)}
  const hg=L.head,hs=L.hairS,bd=L.beard,open=['laugh','cheer','shock','really','angry','weep'].includes(mood);
  const covered=hg==='hood'||hg==='veil'||hg==='helm'||hg==='phrygian'||hg==='turban',veiled=hg==='hood'||hg==='veil',earsOff=veiled||hg==='helm';
  /* behind the head: hood back, long hair, braids, bun */
  if(hg==='hood'||hg==='veil'){const cl=hg==='veil'?trim:sp91Warm(robe,.25);paint(()=>{c.beginPath();c.moveTo(-3.4,4.2);c.bezierCurveTo(-3.8,0,-3.5,-4.4,0,-4.5);c.bezierCurveTo(3.5,-4.4,3.8,0,3.4,4.2);c.closePath()},sp91Warm(cl,.35),[-3.8,-4.5,3.8,4.2],{n:6})}
  if(!veiled&&(hs==='long'||hs==='braids'))paint(()=>{c.beginPath();c.moveTo(-2.4,-2.2);c.bezierCurveTo(-3.7,-1,-3.7,3,-3.2,4.6);c.lineTo(-1.6,3.9);c.lineTo(1.6,3.9);c.lineTo(3.2,4.6);c.bezierCurveTo(3.7,3,3.7,-1,2.4,-2.2);c.closePath()},sp91Warm(hair,.25),[-3.7,-2.2,3.7,4.6],{n:8,dir:1.5});
  if(!covered&&hs==='bun'){E(.3,-3.75,1.15,.85);paint(()=>E(.3,-3.75,1.15,.85),hair,[-.9,-4.6,1.5,-2.9],{n:6});c.strokeStyle=sp91Lit(hair,.3);c.lineWidth=.07;for(const r of [.4,.75]){c.beginPath();c.ellipse(.3,-3.75,r*1.15,r*.85,0,Math.PI*1.1,Math.PI*1.9);c.stroke()}}
  /* neck + the jaw's shadow on it */
  const neck=()=>{c.beginPath();c.moveTo(-1.1,1.8);c.lineTo(-1.25,3.3);c.quadraticCurveTo(0,3.75,1.25,3.3);c.lineTo(1.1,1.8);c.closePath()};
  paint(neck,sp91Warm(skin,.12),[-1.3,1.8,1.3,3.7],{n:4,hx:.4});
  c.save();neck();c.clip();c.fillStyle=sp91Warm(skin,.55,.8);c.beginPath();c.moveTo(-1.3,2);c.quadraticCurveTo(0,3.3,1.3,2);c.lineTo(1.3,2.9);c.quadraticCurveTo(0,3.2,-1.3,2.6);c.closePath();c.fill();c.restore();
  if(L.age==='old'||L.age==='elder'){c.strokeStyle=sp91Warm(skin,.5);c.lineWidth=.06;for(const s of [-1,1]){c.beginPath();c.moveTo(s*.45,2.6);c.lineTo(s*.55,3.4);c.stroke()}}
  if(L.torc!=='none'){const tc=L.torc==='silver'?'#c9ccd3':'#d9b45a';c.beginPath();c.moveTo(-1.35,3.0);c.quadraticCurveTo(0,3.85,1.35,3.0);c.strokeStyle=SP91_INK;c.lineWidth=.42;c.stroke();c.strokeStyle=tc;c.lineWidth=.28;c.stroke();
    c.strokeStyle=sp91Warm(tc,.4);c.lineWidth=.05;for(let i=-5;i<=5;i++){const x=i*.24;const y=3.0+.85*(1-(x/1.35)**2)*.62;c.beginPath();c.moveTo(x-.08,y-.1);c.lineTo(x+.08,y+.1);c.stroke()}
    for(const s of [-1,1]){E(s*.42,3.38,.2,.2);c.fillStyle=tc;c.fill();ink(.07)}}
  /* ears */
  if(!earsOff)for(const s of [-1,1]){const ear=()=>E(s*2.42,.3,.38,.7);paint(ear,s<0?skin:sp91Warm(skin,.2),[s*2.42-.4,-.4,s*2.42+.4,1],{n:2,hatch:false,ink:.12});c.beginPath();c.arc(s*2.42,.3,.2,s<0?Math.PI*.6:-Math.PI*.4,s<0?Math.PI*1.4:Math.PI*.4);c.strokeStyle=sp91Warm(skin,.6);c.lineWidth=.08;c.stroke()}
  /* the face */
  const jd=open?(mood==='laugh'||mood==='shock'?.35:.22):0;const ag=L.age==='elder'?.12:0;
  const face=()=>{c.beginPath();c.moveTo(0,-3);c.bezierCurveTo(1.6,-3,2.45,-2,2.45,-.6);c.bezierCurveTo(2.45,.6,2.15+ag,1.6+jd,1.45,2.3+jd);c.bezierCurveTo(.95,2.8+jd,.45,3+jd,0,3+jd);
    c.bezierCurveTo(-.45,3+jd,-.95,2.8+jd,-1.45,2.3+jd);c.bezierCurveTo(-2.15-ag,1.6+jd,-2.45,.6,-2.45,-.6);c.bezierCurveTo(-2.45,-2,-1.6,-3,0,-3);c.closePath()};
  paint(face,skin,[-2.3,-3,2.5,3.1],{n:16,hi:.25,sh:.42,hx:.68,ha:.16,ink:.001});
  c.save();face();c.clip();
  /* the shadow plane (warm), soft core */
  c.fillStyle=sp91Warm(skin,.42,.9);c.beginPath();c.moveTo(.85,-3.4);c.bezierCurveTo(1.75,-1.6,1.1,.1,1.55,1.05);c.bezierCurveTo(1.75,2,.85,2.9,.15,3.8);c.lineTo(3,3.8);c.lineTo(3,-3.4);c.closePath();c.fill();
  c.fillStyle=sp91Warm(skin,.6,.5);c.beginPath();c.moveTo(1.7,-3.4);c.bezierCurveTo(2.2,-1.5,1.85,.5,2.0,1.4);c.lineTo(3,1.4);c.lineTo(3,-3.4);c.closePath();c.fill();
  /* eye sockets */
  for(const s of [-1,1]){const g=c.createRadialGradient(s*1.0,-.05,.1,s*1.0,-.1,1.0);g.addColorStop(0,sp91Warm(skin,s<0?.35:.55,.75));g.addColorStop(1,sp91Warm(skin,.3,0));c.fillStyle=g;c.fillRect(s*1.0-1.1,-1.2,2.2,2.0)}
  /* lit forehead, cheekbone, nose bridge, chin */
  const hiL=(x,y,rx,ry,r,a)=>{const g=c.createRadialGradient(x,y,0,x,y,Math.max(rx,ry));g.addColorStop(0,sp91Lit(skin,.45,a));g.addColorStop(1,sp91Lit(skin,.45,0));c.fillStyle=g;c.save();c.translate(x,y);c.scale(rx/Math.max(rx,ry),ry/Math.max(rx,ry));c.translate(-x,-y);c.beginPath();c.arc(x,y,Math.max(rx,ry),0,TAU);c.fill();c.restore()};
  hiL(-.55,-2.05,1.3,.6,0,.7);hiL(-1.45,.55+(M.cheeks?-.15:0),.7,.42,0,M.cheeks?.85:.65);hiL(-.15,2.55+jd,.5,.25,0,.5);if(M.cheeks)hiL(1.25,.5,.45,.3,0,.35);
  /* cheekbone hollows */
  c.strokeStyle=sp91Warm(skin,.5);c.globalAlpha=.6;c.lineWidth=.13;for(const s of [-1,1]){c.beginPath();c.moveTo(s*2.15,.45);c.quadraticCurveTo(s*1.85,1.2,s*1.3,1.35);c.stroke()}c.globalAlpha=1;
  /* flush: angry floods red, pleased/laugh/cheer warm the cheeks; weeping reddens the nose */
  if(M.flush){const a=M.flush;for(const s of [-1,1]){const g=c.createRadialGradient(s*1.45,.9,0,s*1.45,.9,1.3);g.addColorStop(0,`rgba(205,35,25,${a})`);g.addColorStop(1,'rgba(205,35,25,0)');c.fillStyle=g;c.fillRect(s*1.45-1.4,-.5,2.8,2.9)}
    if(mood==='angry'){const g=c.createLinearGradient(0,-3,0,1.5);g.addColorStop(0,'rgba(185,25,15,.5)');g.addColorStop(1,'rgba(185,25,15,.12)');c.fillStyle=g;c.fillRect(-2.6,-3.1,5.2,4.6)}}
  if(M.redNose){E(.18,1.05,.42,.32);c.fillStyle='rgba(200,50,50,.35)';c.fill()}
  /* age: forehead lines, crow's feet, folds */
  const AG={young:0,adult:1,old:2,elder:3}[L.age]||1;
  c.strokeStyle=sp91Warm(skin,.55);c.lineWidth=.07;
  const fl=Math.max(AG-1,M.lines||0);for(let i=0;i<fl;i++){const y=-1.55-i*.32;c.globalAlpha=.75;c.beginPath();c.moveTo(-1.05,y+.05);c.quadraticCurveTo(0,y-.18,1.05,y+.05);c.stroke()}c.globalAlpha=1;
  if(AG>=2)for(const s of [-1,1])for(const k of [-.15,0,.15]){c.beginPath();c.moveTo(s*1.6,.05+k);c.lineTo(s*1.95,.05+k*1.6);c.stroke()}
  if(AG>=3){for(const s of [-1,1]){c.beginPath();c.moveTo(s*1.55,2.05);c.quadraticCurveTo(s*1.35,2.6,s*.95,2.75);c.stroke();c.beginPath();c.arc(s*1.0,.38,.42,Math.PI*.2,Math.PI*.8);c.stroke()}}
  if(AG>=1||M.cheeks){c.lineWidth=.08;for(const s of [-1,1]){c.beginPath();c.moveTo(s*.62,1.25);c.quadraticCurveTo(s*(M.cheeks?1.15:.95),1.75,s*(M.cheeks?1.05:.85),2.25);c.globalAlpha=AG>=2||M.cheeks?.85:.45;c.stroke()}c.globalAlpha=1}
  if(M.vein){c.strokeStyle='rgba(120,20,30,.85)';c.lineWidth=.1;c.beginPath();c.moveTo(-1.5,-2.5);c.quadraticCurveTo(-1.25,-2.05,-1.45,-1.65);c.lineTo(-1.2,-1.35);c.stroke()}
  c.restore();
  face();ink(.17);c.save();c.beginPath();c.rect(.3,-4,4,8);c.clip();face();ink(.32,.9);c.restore();
  c.save();c.beginPath();c.rect(-3,1.9,6,3);c.clip();face();ink(.28,.8);c.restore();

  /* beards (stubble = speckle; goatee; moustache only; short/full/long) */
  const mo=open?.12:0;
  const moustache=()=>{c.beginPath();c.moveTo(-1.35,2.0+mo);c.quadraticCurveTo(-.75,1.25,0,1.5);c.quadraticCurveTo(.75,1.25,1.35,2.0+mo);c.quadraticCurveTo(.75,1.72,0,1.82);c.quadraticCurveTo(-.75,1.72,-1.35,2.0+mo);c.closePath()};
  if(bd==='stubble'){c.save();face();c.clip();c.fillStyle=sp91Blend(hair,skin,.35,.45);for(let i=0;i<220;i++){const a=R()*TAU,r=R();const x=Math.cos(a)*2.3*r,y=1.1+Math.abs(Math.sin(a))*2*r;if(y<1.2)continue;c.fillRect(x,y,.07,.07)}c.restore()}
  else if(bd==='full'||bd==='long'||bd==='short'||bd==='goatee'){
    const low=bd==='long'?5.0:bd==='short'?3.25:bd==='goatee'?3.55:3.8,wd=bd==='goatee'?.75:2.42,bt=bd==='short'?.9:bd==='goatee'?2.0:.45;
    const beard=()=>{c.beginPath();if(bd==='goatee'){c.moveTo(-.75,2.25+jd);c.quadraticCurveTo(-.75,low-.3+jd,0,low+jd);c.quadraticCurveTo(.75,low-.3+jd,.75,2.25+jd);c.quadraticCurveTo(0,2.45+jd,-.75,2.25+jd);c.closePath();return}
      c.moveTo(-wd,bt);c.bezierCurveTo(-2.45,1.8,-1.75,low-.4+jd,0,low+jd);c.bezierCurveTo(1.75,low-.4+jd,2.45,1.8,wd,bt);c.bezierCurveTo(2.1,1.0,1.7,1.25,1.2,1.35);c.quadraticCurveTo(0,1.1,-1.2,1.35);c.bezierCurveTo(-1.7,1.25,-2.1,1,-wd,bt);c.closePath()};
    if(bd==='short'){beard();c.globalAlpha=.7;c.fillStyle=hair;c.fill();c.globalAlpha=1;c.save();beard();c.clip();c.fillStyle=sp91Warm(hair,.4,.6);c.fillRect(.6,0,3,6);c.restore();beard();ink(.08,.6)}
    else{paint(beard,hair,[-2.4,1,2.4,low+jd],{n:10,hx:.55,dir:1.5,ink:.14});c.save();beard();c.clip();c.strokeStyle=sp91Lit(hair,.3);c.lineWidth=.08;for(let i=-5;i<=5;i++){const x=i*.4;c.beginPath();c.moveTo(x,1.7+Math.abs(i)*.05);c.quadraticCurveTo(x*1.05+.12,(1.7+low)/2+.2,x*.85,low+jd-.1-Math.abs(i)*.1);c.stroke()}c.restore()}}
  /* nose: lit bridge, shadow plane, nostrils, the shadow under it */
  c.fillStyle=sp91Warm(skin,.5,.85);c.beginPath();c.moveTo(.1,-.25);c.quadraticCurveTo(.42,.7,.55,1.15);c.quadraticCurveTo(.25,1.38,.0,1.25);c.closePath();c.fill();
  c.strokeStyle=sp91Lit(skin,.5);c.lineWidth=.1;c.beginPath();c.moveTo(-.1,-.3);c.quadraticCurveTo(-.05,.4,-.12,.85);c.stroke();
  c.beginPath();c.moveTo(.0,.15);c.quadraticCurveTo(.06,.7,-.28,1.05);c.quadraticCurveTo(-.1,1.38,.25,1.27);c.quadraticCurveTo(.5,1.38,.58,1.12);ink(.11);
  for(const [x,s] of [[-.2,.11],[.36,M.vein?.16:.12]]){E(x,1.2,s,.07);c.fillStyle=SP91_INK;c.fill()}
  if(!(bd==='full'||bd==='long'||bd==='short')){c.fillStyle=sp91Warm(skin,.55,.55);E(.15,1.5,.6,.13);c.fill()}
  /* eyes */
  const eye=(s,o)=>{const x=s*1.0,y=.05+(o.ly||0);const rx=o.rx||.52,ry=o.ry||.28;
    if(o.closed){c.beginPath();if(o.up)c.arc(x,y+.22,rx*.95,Math.PI*1.15,Math.PI*1.85);else c.arc(x,y-.12,rx*.95,Math.PI*.15,Math.PI*.85);ink(.16);
      if(!o.up){c.beginPath();c.arc(x,y-.45,rx*1.05,Math.PI*1.2,Math.PI*1.8);ink(.06,.6)}return}
    c.save();E(x,y,rx,ry);c.fillStyle='#efe3cc';c.fill();c.clip();
    c.fillStyle=sp91Warm(skin,.4,.5);c.fillRect(x-rx,y-ry,rx*2,ry*.55);
    const ir=o.ir||.21,ix=x+(o.lx==null?.06:o.lx),iy=y+.02;E(ix,iy,ir,ir);c.fillStyle=L.eye;c.fill();E(ix,iy,ir*.5,ir*.5);c.fillStyle='#0a0604';c.fill();E(ix-.07,iy-.07,.055,.055);c.fillStyle='#fff';c.fill();
    if(o.lid){c.fillStyle=sp91Warm(skin,.3);c.fillRect(x-rx-.1,y-ry-.1,rx*2+.2,(ry*2+.1)*o.lid)}
    if(o.sq){c.fillStyle=skin;E(x,y+ry*1.45,rx*1.2,ry*(1+o.sq));c.fill()}
    if(o.cut){c.fillStyle=sp91Warm(skin,.35);c.beginPath();c.moveTo(x-s*rx*1.3,y-ry-.2);c.lineTo(x-s*rx*1.3,y+ry*.25);c.lineTo(x+s*rx*1.3,y-ry*.55);c.lineTo(x+s*rx*1.3,y-ry-.2);c.closePath();c.fill()}
    c.restore();
    const ly=o.lid?y-ry+(ry*2+.1)*o.lid:null;
    if(ly!=null){c.beginPath();c.moveTo(x-rx,ly);c.quadraticCurveTo(x,ly-.08,x+rx,ly);ink(.15)}
    else if(o.cut){c.beginPath();c.moveTo(x-s*rx*1.05,y-ry*.2+(s<0?-.05:-.05));c.lineTo(x+s*rx,y-ry*.75);ink(.16)}
    else{c.beginPath();c.ellipse(x,y,rx,ry,0,Math.PI*1.0,Math.PI*2);ink(.15)}
    c.beginPath();c.ellipse(x,y,rx,ry,0,Math.PI*.15,Math.PI*.85);ink(.05,.8);
    if(!o.lid&&!o.cut){c.beginPath();c.ellipse(x,y-.12,rx*1.02,ry*1.35,0,Math.PI*1.15,Math.PI*1.85);c.strokeStyle=sp91Warm(skin,.6);c.lineWidth=.06;c.stroke()}
    if(o.sq){c.beginPath();c.ellipse(x,y+ry*.9,rx*.95,ry*.6,0,Math.PI*1.1,Math.PI*1.9);ink(.07,.8)}
    if(o.wet){c.beginPath();c.ellipse(x,y,rx,ry,0,Math.PI*.05,Math.PI*.95);c.strokeStyle='#9fd2f5';c.lineWidth=.12;c.stroke();E(x+.15,y-.05,.08,.06);c.fillStyle='#fff';c.fill()}};
  eye(-1,M.eyes[0]);eye(1,M.eyes[1]);
  /* brows: thick painted strokes */
  for(const [i,s] of [[0,-1],[1,1]]){const [yi,yo,ar]=M.brows[i];const xi=s*.38,xo=s*1.7,mx=(xi+xo)/2,my=(yi+yo)/2-ar;
    c.beginPath();c.moveTo(xi,yi+.06);c.quadraticCurveTo(mx,my-.12,xo,yo);c.quadraticCurveTo(mx,my+.14,xi,yi+.36);c.closePath();c.fillStyle=L.browC;c.fill();ink(.07,.9);
    c.strokeStyle=sp91Lit(L.browC,.25);c.lineWidth=.05;c.beginPath();c.moveTo(xi+s*.1,yi+.18);c.quadraticCurveTo(mx,my+.02,xo-s*.15,yo+.02);c.stroke()}
  if(mood==='angry'){c.strokeStyle=sp91Warm(skin,.65);c.lineWidth=.1;c.beginPath();c.moveTo(-.12,-.45);c.lineTo(-.2,-.95);c.moveTo(.12,-.45);c.lineTo(.2,-.95);c.stroke()}
  /* mouth */
  const my=1.98,lip=sp91Blend(skin,'#a8443a',.42),dark='#2e0c08';
  const openM=(path,teeth,tongue)=>{path();c.save();c.fillStyle=dark;c.fill();c.clip();
    if(teeth){c.fillStyle='#efe5d0';c.fillRect(-1.2,teeth[0],2.4,teeth[1]);if(teeth[2]){c.fillRect(-1.2,teeth[2],2.4,.4)}c.strokeStyle='#8a7a68';c.lineWidth=.04;for(const xx of [-.5,-.17,.17,.5]){c.beginPath();c.moveTo(xx,teeth[0]);c.lineTo(xx,teeth[0]+teeth[1]);c.stroke()}}
    if(tongue){c.fillStyle='#b8444a';E(tongue[0],tongue[1],tongue[2],tongue[3]);c.fill()}c.restore();path();ink(.13);
    path();c.save();c.clip();c.restore()};
  const lowLip=(x,y,rx,ry)=>{E(x,y,rx,ry||.17);c.fillStyle=lip;c.fill();E(x-.1,y-.03,rx*.4,(ry||.17)*.35);c.fillStyle=sp91Lit(lip,.35,.7);c.fill()};
  const line=(pts,w)=>{c.beginPath();c.moveTo(...pts[0]);c.quadraticCurveTo(...pts[1],...pts[2]);ink(w||.13)};
  switch(M.mouth){
    case 'open':openM(()=>{c.beginPath();c.moveTo(-.85,my-.15);c.quadraticCurveTo(0,my-.35,.85,my-.15);c.quadraticCurveTo(.75,my+1.0,0,my+1.05);c.quadraticCurveTo(-.75,my+1.0,-.85,my-.15);c.closePath()},[my-.4,.3],[0,my+.85,.5,.3]);break;
    case 'laugh':openM(()=>{c.beginPath();c.moveTo(-1.05,my-.35);c.quadraticCurveTo(0,my-.15,1.05,my-.35);c.quadraticCurveTo(.9,my+1.35,0,my+1.35);c.quadraticCurveTo(-.9,my+1.35,-1.05,my-.35);c.closePath()},[my-.4,.32],[0,my+1.1,.6,.38]);break;
    case 'O':openM(()=>E(0,my+.4,.36,.62),null,[0,my+.85,.25,.15]);break;
    case 'snarl':openM(()=>{c.beginPath();c.moveTo(-.95,my+.15);c.quadraticCurveTo(-.5,my-.25,0,my-.2);c.quadraticCurveTo(.5,my-.25,.95,my+.15);c.lineTo(.75,my+.6);c.quadraticCurveTo(0,my+.45,-.75,my+.6);c.closePath()},[my-.3,.38,my+.3],null);
      c.beginPath();c.moveTo(-.95,my+.15);c.lineTo(-1.15,my+.5);c.moveTo(.95,my+.15);c.lineTo(1.15,my+.5);ink(.1);break;
    case 'talk':openM(()=>{c.beginPath();c.ellipse(.15,my+.2,.48,.3,-.12,0,TAU)},[my-.2,.22],null);break;
    case 'wobble':openM(()=>{c.beginPath();c.moveTo(-.75,my+.4);c.quadraticCurveTo(0,my-.25,.75,my+.4);c.quadraticCurveTo(.35,my+.3,.2,my+.42);c.quadraticCurveTo(0,my+.3,-.2,my+.42);c.quadraticCurveTo(-.35,my+.3,-.75,my+.4);c.closePath()},null,null);
      lowLip(0,my+.6,.42,.14);break;
    case 'grin':openM(()=>{c.beginPath();c.moveTo(-1.0,my-.38);c.quadraticCurveTo(0,my-.05,1.0,my-.38);c.quadraticCurveTo(.6,my+.62,0,my+.62);c.quadraticCurveTo(-.6,my+.62,-1.0,my-.38);c.closePath()},[my-.3,.38],null);
      for(const s of [-1,1]){c.beginPath();c.arc(s*1.08,my-.42,.16,s<0?Math.PI*.2:Math.PI*.3,s<0?Math.PI*.9:Math.PI*.8);ink(.08)}break;
    case 'smile':lowLip(0,my+.32,.42,.14);line([[-.92,my-.3],[0,my+.42],[.92,my-.3]],.15);for(const s of [-1,1]){c.beginPath();c.arc(s*.98,my-.32,.14,s<0?Math.PI*.2:Math.PI*.3,s<0?Math.PI*.9:Math.PI*.8);ink(.07)}break;
    case 'smirk':lowLip(.15,my+.25,.36,.13);line([[-.55,my+.08],[.15,my+.15],[.95,my-.42]],.15);c.beginPath();c.moveTo(.98,my-.55);c.quadraticCurveTo(1.12,my-.38,1.02,my-.18);ink(.08);break;
    case 'droop':lowLip(0,my+.26,.36,.14);line([[-.6,my+.08],[.05,my+.02],[.68,my+.25]],.14);break;
    case 'down':lowLip(0,my+.3,.36,.14);line([[-.62,my+.2],[0,my-.05],[.62,my+.2]],.14);break;
    default:lowLip(0,my+.24,.38,.15);line([[-.62,my+.03],[0,my-.06],[.62,my+.05]],.14)}
  if(bd==='full'||bd==='long'||bd==='short'||bd==='goatee'||bd==='moustache'){if(bd==='short'){moustache();c.fillStyle=hair;c.fill();ink(.06,.5)}else paint(moustache,hair,[-1.35,1.25,1.35,2.05],{n:3,hatch:false,ink:.1})}
  /* tears */
  if(M.tears){for(const s of [-1,1]){c.beginPath();c.moveTo(s*.85,.3);c.bezierCurveTo(s*1.15,.9,s*.8,1.4,s*1.0,2.3);c.strokeStyle='rgba(20,40,60,.6)';c.lineWidth=.26;c.stroke();c.strokeStyle='#a9dcfa';c.lineWidth=.17;c.stroke();
    E(s*1.02,2.45,.15,.21);c.fillStyle='#cdeeff';c.fill();ink(.05);E(s*.98,2.4,.05,.06);c.fillStyle='#fff';c.fill()}}
  /* hair on top (by style) */
  if(!covered&&hs!=='bald'){
    const hl=hs==='receding'?.55:hs==='cropped'?.2:0;
    const cap=()=>{c.beginPath();c.moveTo(-2.5,-.4);c.bezierCurveTo(-2.8,-2.3,-2.1,-3.6,0,-3.68);c.bezierCurveTo(2.1,-3.6,2.8,-2.3,2.5,-.4);
      if(hs==='receding'){c.bezierCurveTo(2.35,-1.4,2.15,-2.2,1.7,-2.55);c.quadraticCurveTo(1.0,-2.3,.5,-2.65);c.quadraticCurveTo(0,-2.85,-.5,-2.65);c.quadraticCurveTo(-1.0,-2.3,-1.7,-2.55);c.bezierCurveTo(-2.15,-2.2,-2.35,-1.4,-2.5,-.4)}
      else if(hs==='long'||hs==='bun'||hs==='braids'){c.bezierCurveTo(2.3,-1.4,2.0,-2.0,1.2,-2.2);c.quadraticCurveTo(.4,-2.35,0,-2.75);c.quadraticCurveTo(-.4,-2.35,-1.2,-2.2);c.bezierCurveTo(-2.0,-2.0,-2.3,-1.4,-2.5,-.4)}
      else{c.bezierCurveTo(2.35,-1.0,2.2,-1.5-hl,1.85,-1.75-hl);c.quadraticCurveTo(1.2,-2.05-hl,.6,-2.0-hl);c.quadraticCurveTo(0,-2.3-hl,-.6,-2.0-hl);c.quadraticCurveTo(-1.2,-2.05-hl,-1.85,-1.75-hl);c.bezierCurveTo(-2.2,-1.5-hl,-2.35,-1.0,-2.5,-.4)}c.closePath()};
    paint(cap,hair,[-2.7,-3.7,2.7,-.4],{n:12,hx:.55,dir:-2.2,ink:.15});
    c.save();cap();c.clip();c.strokeStyle=sp91Lit(hair,.35);c.lineWidth=.09;
    if(hs==='cropped'){c.globalAlpha=.6;for(let i=0;i<70;i++){const x=(R()-.5)*5,y=-3.6+R()*3;c.beginPath();c.moveTo(x,y);c.lineTo(x+.12,y-.12);c.stroke()}c.globalAlpha=1}
    else for(const [x0,y0,x1,y1] of [[-1.9,-2.3,-1.0,-3.3],[-1.2,-2.1,-.2,-3.45],[-.4,-2.2,.6,-3.4],[.5,-2.1,1.4,-3.15],[-2.3,-1.2,-1.9,-2.6],[1.3,-2.0,2.1,-2.8]]){c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo((x0+x1)/2-.25,(y0+y1)/2,x1,y1);c.stroke()}
    c.restore();
    if(hs==='curls'){for(let i=0;i<=10;i++){const a=Math.PI*(1.04+i*.092);const x=Math.cos(a)*2.45,y=-.75+Math.sin(a)*2.55;E(x,y,.36,.33);c.fillStyle=i%2?hair:sp91Lit(hair,.12);c.fill();ink(.07);c.beginPath();c.arc(x+.05,y+.02,.15,0,Math.PI*1.4);c.strokeStyle=sp91Lit(hair,.35);c.lineWidth=.06;c.stroke()}
      for(let i=0;i<6;i++){const x=-1.6+i*.64,y=-2.65-Math.sin(i/5*Math.PI)*.75;E(x,y,.36,.3);c.fillStyle=sp91Lit(hair,.06*(i%2));c.fill();ink(.06)}}
    }
  if(!veiled&&hs==='braids')for(const s of [-1,1])for(let i=0;i<6;i++){const x=s*(2.55+i*.08),y=-.1+i*.68;E(x,y,.36,.4,s*.2);c.fillStyle=i%2?hair:sp91Lit(hair,.15);c.fill();ink(.07)}
  if(!covered&&hs==='bald'){for(const s of [-1,1])paint(()=>{c.beginPath();c.moveTo(s*2.5,-.3);c.quadraticCurveTo(s*2.75,-1.6,s*2.2,-2.25);c.quadraticCurveTo(s*2.0,-1.3,s*2.2,-.3);c.closePath()},hair,[s<0?-2.8:2,-2.3,s<0?-2:2.8,-.3],{n:2,hatch:false,ink:.1});
    E(-.8,-2.45,.7,.3,-.35);c.fillStyle=sp91Lit(skin,.6,.55);c.fill()}
  /* earrings (on the lobes) */
  if(!earsOff&&L.ear!=='none')for(const s of [-1,1]){const x=s*2.45,y=.95;
    if(L.ear==='hoops'){c.beginPath();c.arc(x,y+.35,.32,0,TAU);c.strokeStyle=SP91_INK;c.lineWidth=.17;c.stroke();c.strokeStyle='#e0b84a';c.lineWidth=.1;c.stroke()}
    else{const col=L.ear==='pearls'?'#f2efe6':gem;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+.3);c.strokeStyle='#d9b45a';c.lineWidth=.06;c.stroke();E(x,y+.45,.17,.2);c.fillStyle=col;c.fill();ink(.06);E(x-.05,y+.4,.05,.05);c.fillStyle='#fff';c.fill()}}
  /* headwear */
  if(hg==='laurel'||hg==='laurelg'||hg==='flowers'){const gold=hg==='laurelg';c.strokeStyle=gold?'#8a6a20':'#35561f';c.lineWidth=.2;c.beginPath();c.arc(0,-.8,2.75,Math.PI*1.08,Math.PI*1.92);c.stroke();
    for(let i=0;i<=8;i++){const a=Math.PI*(1.1+i*.1);const x=Math.cos(a)*2.75,y=-.8+Math.sin(a)*2.75;
      if(hg==='flowers'&&i%2===0){const col=['#e07b9a','#f0cf7d','#9aa6ff'][i%3];for(let p=0;p<5;p++){const pa=p*TAU/5;E(x+Math.cos(pa)*.2,y+Math.sin(pa)*.2,.17,.17);c.fillStyle=col;c.fill();ink(.03)}E(x,y,.1,.1);c.fillStyle='#f6e27a';c.fill();continue}
      for(const sd of [-1,1]){E(x+Math.cos(a+sd*1.2)*.3,y+Math.sin(a+sd*1.2)*.3,.4,.16,a+sd*.9);c.fillStyle=gold?(sd<0?'#f2d36a':'#b8902e'):(sd<0?'#86b450':'#4f7a2e');c.fill();c.strokeStyle=gold?'#5a4210':'#1a2c0c';c.lineWidth=.06;c.stroke()}}}
  else if(hg==='diadem'||hg==='circlet'){const met=hg==='circlet'?'#cfd3da':'#e6b93a';c.beginPath();c.moveTo(-2.3,-1.75);c.quadraticCurveTo(0,-2.75,2.3,-1.75);c.lineTo(2.25,hg==='circlet'?-1.55:-1.35);c.quadraticCurveTo(0,hg==='circlet'?-2.5:-2.3,-2.25,hg==='circlet'?-1.55:-1.35);c.closePath();paint(()=>{c.beginPath();c.moveTo(-2.3,-1.75);c.quadraticCurveTo(0,-2.75,2.3,-1.75);c.lineTo(2.25,hg==='circlet'?-1.55:-1.35);c.quadraticCurveTo(0,hg==='circlet'?-2.5:-2.3,-2.25,hg==='circlet'?-1.55:-1.35);c.closePath()},met,[-2.3,-2.75,2.3,-1.35],{n:2,hatch:false,ink:.09});
    if(hg==='diadem'){c.beginPath();c.moveTo(-.45,-2.2);c.lineTo(0,-3.05);c.lineTo(.45,-2.2);c.closePath();c.fillStyle=met;c.fill();ink(.08)}
    E(0,-2.28,.24,.24);c.fillStyle=gem;c.fill();ink(.06);E(-.07,-2.35,.07,.07);c.fillStyle='#fff';c.fill()}
  else if(hg==='hood'||hg==='veil'){const cl=hg==='veil'?trim:robe;const hood=()=>{c.beginPath();c.moveTo(-3.4,4.2);c.bezierCurveTo(-3.8,0,-3.5,-4.4,0,-4.5);c.bezierCurveTo(3.5,-4.4,3.8,0,3.4,4.2);c.lineTo(2.55,4.2);c.bezierCurveTo(2.65,1.5,2.95,-3.25,0,-3.3);c.bezierCurveTo(-2.95,-3.25,-2.65,1.5,-2.55,4.2);c.closePath()};
    paint(hood,cl,[-3.8,-4.5,3.8,4.2],{n:10,hx:.6,dir:1.4});c.strokeStyle=sp91Warm(cl,.5);c.lineWidth=.1;c.beginPath();c.moveTo(-3.0,-2.3);c.quadraticCurveTo(-3.3,1,-3.0,4.0);c.moveTo(3.0,-2.3);c.quadraticCurveTo(3.3,1,3.0,4.0);c.stroke();
    if(hg==='veil'){c.strokeStyle=gem;c.lineWidth=.12;c.beginPath();c.moveTo(-2.8,-2.4);c.bezierCurveTo(-2.6,-3.4,2.6,-3.4,2.8,-2.4);c.stroke()}}
  else if(hg==='helm'){const helm=()=>{c.beginPath();c.moveTo(-2.7,-.5);c.bezierCurveTo(-2.95,-3.4,-1.5,-4.1,0,-4.1);c.bezierCurveTo(1.5,-4.1,2.95,-3.4,2.7,-.5);c.lineTo(2.2,-.5);c.quadraticCurveTo(2.0,-1.6,1.6,-1.7);c.lineTo(-1.6,-1.7);c.quadraticCurveTo(-2.0,-1.6,-2.2,-.5);c.closePath()};
    paint(helm,'#a3a9b1',[-2.9,-4.1,2.9,-.5],{n:6,hi:.4,sh:.55});
    for(const s of [-1,1])paint(()=>{c.beginPath();c.moveTo(s*2.2,-.6);c.lineTo(s*2.7,-.5);c.lineTo(s*2.55,1.6);c.quadraticCurveTo(s*2.1,1.7,s*1.95,1.1);c.closePath()},'#9aa0a8',[s*1.95,-.6,s*2.7,1.7],{n:1,hatch:false,ink:.09});
    c.beginPath();c.moveTo(-1.6,-1.7);c.lineTo(1.6,-1.7);c.strokeStyle='#4d535b';c.lineWidth=.22;c.stroke();
    const crest=()=>{c.beginPath();c.moveTo(-2.2,-3.6);c.quadraticCurveTo(0,-5.0,2.2,-3.6);c.quadraticCurveTo(0,-4.2,-2.2,-3.6);c.closePath()};paint(crest,gem,[-2.2,-4.7,2.2,-3.6],{n:4,hatch:false,ink:.1});
    c.save();crest();c.clip();c.strokeStyle=sp91Warm(gem,.45);c.lineWidth=.07;for(let i=-4;i<=4;i++){c.beginPath();c.moveTo(i*.48,-4.6+Math.abs(i)*.15);c.lineTo(i*.52,-3.7);c.stroke()}c.restore()}
  else if(hg==='phrygian'){const cap=()=>{c.beginPath();c.moveTo(-2.6,-.9);c.bezierCurveTo(-2.9,-3.4,-1.2,-4.3,.4,-4.2);c.bezierCurveTo(1.6,-4.15,2.3,-3.2,1.6,-2.6);c.bezierCurveTo(2.4,-2.6,2.8,-1.8,2.6,-.9);c.quadraticCurveTo(0,-2.0,-2.6,-.9);c.closePath()};
    paint(cap,gem,[-2.8,-4.3,2.8,-.9],{n:8});E(1.75,-2.95,.42,.38);c.fillStyle=sp91Warm(gem,.2);c.fill();ink(.1);c.beginPath();c.moveTo(-1.4,-3.5);c.quadraticCurveTo(-.2,-2.6,.9,-2.0);c.strokeStyle=sp91Warm(gem,.5);c.lineWidth=.1;c.stroke();c.beginPath();c.moveTo(-2.6,-.9);c.quadraticCurveTo(0,-2.0,2.6,-.9);c.strokeStyle=trim;c.lineWidth=.28;c.stroke()}
  else if(hg==='turban'){const cl=gem;const tb=()=>{c.beginPath();c.moveTo(-2.65,-1.1);c.bezierCurveTo(-3.05,-3.8,-1.3,-4.4,0,-4.35);c.bezierCurveTo(1.3,-4.4,3.05,-3.8,2.65,-1.1);c.quadraticCurveTo(0,-2.2,-2.65,-1.1);c.closePath()};
    paint(tb,cl,[-3,-4.4,3,-1.1],{n:8});c.save();tb();c.clip();c.strokeStyle=sp91Warm(cl,.45);c.lineWidth=.1;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-2.8,-1.4-i*.65);c.quadraticCurveTo(0,-2.2-i*.75+(i%2?.3:-.2),2.8,-1.9-i*.5);c.stroke()}c.restore();
    E(0,-2.15,.26,.3);c.fillStyle=cl===trim?'#c0433a':trim;c.fill();ink(.07)}
  /* hands in head space: the palm over the eyes (facepalm), the fist under the chin (bored) */
  const fist=(x,y,rot,sc)=>{c.save();c.translate(x,y);c.rotate(rot);c.scale(sc,sc);
    paint(()=>{c.beginPath();c.moveTo(-.55,.5);c.lineTo(.55,.5);c.lineTo(.8,4.5);c.lineTo(-.8,4.5);c.closePath()},robe,[-.8,.5,.8,4.5],{n:3,hatch:false,ink:.12});
    c.beginPath();c.moveTo(-.6,.6);c.lineTo(.6,.6);c.strokeStyle=trim;c.lineWidth=.22;c.stroke();
    paint(()=>{c.beginPath();c.moveTo(-.75,.6);c.quadraticCurveTo(-.95,-.6,-.4,-.8);c.lineTo(.5,-.8);c.quadraticCurveTo(.95,-.6,.75,.6);c.closePath()},skin,[-.9,-.8,.9,.6],{n:3,hatch:false,ink:.12});
    c.strokeStyle=sp91Warm(skin,.6);c.lineWidth=.07;for(const k of [-.35,-.05,.25]){c.beginPath();c.moveTo(-.7,k);c.lineTo(.2,k-.05);c.stroke()}c.restore()};
  const palm=(x,y,rot,sc,up)=>{c.save();c.translate(x,y);c.rotate(rot);c.scale(sc,sc);
    paint(()=>{c.beginPath();c.moveTo(-.55,.4);c.lineTo(.55,.4);c.lineTo(.8,4.6);c.lineTo(-.8,4.6);c.closePath()},sp91Warm(skin,.15),[-.8,.4,.8,4.6],{n:2,hatch:false,ink:.12});
    paint(()=>{c.beginPath();c.moveTo(-1.0,2.2);c.lineTo(1.0,2.2);c.lineTo(1.35,5.2);c.lineTo(-1.35,5.2);c.closePath()},robe,[-1.35,2.2,1.35,5.2],{n:3,hatch:false,ink:.12});c.beginPath();c.moveTo(-1.0,2.2);c.lineTo(1.0,2.2);c.strokeStyle=trim;c.lineWidth=.24;c.stroke();
    const pl=()=>{c.beginPath();c.moveTo(-.8,.55);c.quadraticCurveTo(-1.0,-.5,-.8,-1.05);c.lineTo(.85,-1.05);c.quadraticCurveTo(1.05,-.4,.75,.55);c.closePath()};paint(pl,skin,[-1,-1.05,1.05,.55],{n:3,hatch:false,ink:.12});
    for(const [fx,fy2,ang,len] of [[-.62,-1.0,-.32,1.2],[-.2,-1.05,-.1,1.42],[.22,-1.05,.1,1.36],[.62,-1.0,.32,1.08]]){c.save();c.translate(fx,fy2);c.rotate(ang);c.beginPath();c.moveTo(-.18,0);c.lineTo(-.16,-len+.16);c.quadraticCurveTo(0,-len-.08,.16,-len+.16);c.lineTo(.18,0);c.closePath();c.fillStyle=skin;c.fill();ink(.1);
      c.beginPath();c.moveTo(-.12,-len*.45);c.lineTo(.12,-len*.45);c.strokeStyle=sp91Warm(skin,.6);c.lineWidth=.05;c.stroke();c.restore()}
    c.save();c.translate(up?.85:-.8,-.1);c.rotate(up?1.1:-1.1);c.beginPath();c.moveTo(-.19,0);c.lineTo(-.17,-.9);c.quadraticCurveTo(0,-1.1,.17,-.9);c.lineTo(.19,0);c.closePath();c.fillStyle=skin;c.fill();ink(.1);c.restore();
    if(up){c.strokeStyle=sp91Warm(skin,.6);c.lineWidth=.07;c.beginPath();c.moveTo(-.6,-.25);c.quadraticCurveTo(0,.05,.6,-.55);c.stroke();c.beginPath();c.moveTo(-.5,.2);c.quadraticCurveTo(.1,.25,.55,-.05);c.stroke()}
    c.restore()};
  if(M.hand==='palm')palm(-.75,-.35,.42,1.25,false);
  if(M.hand==='chin')fist(1.15,3.35,-.15,1.0);
  c.restore();
  /* hands in body space: the open palm held out (really), the raised fist with the accessory (cheer) */
  if(M.hand==='out')palm(-4.1,2.0,-.35,1.25,true);
  if(M.hand==='raise'){const ax=Math.min(BX-1.1,4.3),ay=-1.6;fist(ax,ay,.08,1.0);const ac=L.acc;c.save();c.translate(ax,ay-.9);
    if(ac==='goblet'){const gb=()=>{c.beginPath();c.moveTo(-.95,-1.4);c.lineTo(.95,-1.4);c.quadraticCurveTo(.8,-.5,.18,-.35);c.lineTo(.18,.1);c.lineTo(-.18,.1);c.lineTo(-.18,-.35);c.quadraticCurveTo(-.8,-.5,-.95,-1.4);c.closePath()};paint(gb,'#d9b45a',[-.95,-1.4,.95,.1],{n:2,hatch:false,ink:.1});
      E(0,-1.4,.95,.25);c.fillStyle='#6a1520';c.fill();ink(.08)}
    else if(ac==='scroll'){c.fillStyle='#e8dcc0';c.fillRect(-.75,-2.2,1.5,2.2);c.beginPath();c.rect(-.75,-2.2,1.5,2.2);ink(.08);c.fillStyle='#a88a5a';for(const yy of [-2.35,-.15]){c.beginPath();c.rect(-.95,yy,1.9,.35);c.fill();ink(.07)}
      c.strokeStyle='#8a6a3a';c.lineWidth=.07;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-.5,-1.8+i*.4);c.lineTo(.5,-1.8+i*.4);c.stroke()}}
    else if(ac==='fan'){c.beginPath();c.moveTo(0,0);c.arc(0,0,2,Math.PI*1.2,Math.PI*1.8);c.closePath();c.fillStyle=gem;c.fill();ink(.1);c.strokeStyle=sp91Warm(gem,.4);c.lineWidth=.07;for(let i=1;i<6;i++){const a=Math.PI*(1.2+i*.1);c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*2,Math.sin(a)*2);c.stroke()}}
    else if(ac==='coins'){for(let i=0;i<4;i++){E((i%2)*.6-.3,-.2-i*.55,.5,.5);c.fillStyle='#e6b93a';c.fill();ink(.08);E((i%2)*.6-.42,-.32-i*.55,.15,.15);c.fillStyle='#fff3c0';c.fill()}}
    c.restore()}
  c.restore();

  /* ---- the light: warm from the upper left, shadow to the lower right, a dark vignette, canvas grain ---- */
  c.save();c.globalCompositeOperation='multiply';const lg=c.createLinearGradient(0,0,W,H);lg.addColorStop(0,'#ffffff');lg.addColorStop(.5,'#f0e2d2');lg.addColorStop(1,'#6e5040');c.fillStyle=lg;c.fillRect(0,0,W,H);
  c.globalCompositeOperation='screen';const sg=c.createRadialGradient(W*.3,H*.2,0,W*.3,H*.2,H*.75);sg.addColorStop(0,'rgba(255,214,160,.22)');sg.addColorStop(1,'rgba(255,214,160,0)');c.fillStyle=sg;c.fillRect(0,0,W,H);
  c.globalCompositeOperation='source-over';const vg=c.createRadialGradient(W*.47,H*.45,Math.min(W,H)*.32,W*.5,H*.5,Math.max(W,H)*.72);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(8,4,2,.62)');c.fillStyle=vg;c.fillRect(0,0,W,H);
  const gr=Math.max(1,W/160);for(let i=0;i<W*H/(gr*gr*14);i++){c.fillStyle=R()<.5?'rgba(255,240,215,.05)':'rgba(10,5,2,.07)';c.fillRect(R()*W,R()*H,gr,gr)}
  c.restore()}

/* SP91_CACHE — painted portraits by look + mood + size (oldest dropped past SP91_MAX). */
const SP91_CACHE=new Map();const SP91_MAX=260;
/* sp91Portrait — the cached canvas of a sponsor in a mood at iw×ih css px (k = supersampling × device scale). */
function sp91Portrait(L,mood,iw,ih,k){const key=sp91LookKey(L)+'#'+mood+'#'+Math.round(iw)+'x'+Math.round(ih)+'@'+k;
  let cv=SP91_CACHE.get(key);if(cv)return cv;
  cv=document.createElement('canvas');cv.width=Math.max(8,Math.round(iw*k));cv.height=Math.max(8,Math.round(ih*k));const c=cv.getContext('2d');
  try{sp91Paint(c,cv.width,cv.height,mood,L,sp91Hash((L.id||'')+'|'+sp91LookKey(L)))}catch(e){console.error(e)}
  SP91_CACHE.set(key,cv);if(SP91_CACHE.size>SP91_MAX)SP91_CACHE.delete(SP91_CACHE.keys().next().value);return cv}

/* flavFace: sponsors = the painted portrait in their own frame colours; Flavius keeps his paintings (167). */
{const base=flavFace;flavFace=function(c2d,cx,cy,w,h,mood,label=true,sp=null){
  sp=sp||(typeof curSponsor==='function'?curSponsor():null)||{};
  if(flavIsFlavius(sp))return base.call(this,c2d,cx,cy,w,h,mood,label,sp);
  const L=sp91Look(sp);if(!SP91_MO[mood])mood='calm';
  c2d.save();
  c2d.fillStyle=sp91Blend(L.frame,'#000',.82);c2d.strokeStyle=L.frame;c2d.lineWidth=2;
  c2d.beginPath();c2d.rect(cx-w/2,cy-h/2,w,h);c2d.fill();c2d.stroke();
  c2d.strokeStyle=sp91Blend(L.frame,'#000',0,.45);c2d.lineWidth=1;c2d.strokeRect(cx-w/2+3,cy-h/2+3,w-6,h-6);
  const x0=cx-w/2+4,y0=cy-h/2+4,iw=w-8,ih=h-8;
  let ds=1;try{const t=c2d.getTransform();ds=Math.max(1,Math.hypot(t.a,t.b))}catch(e){}
  const k=Math.min(4,Math.max(2,Math.ceil(ds*2)),Math.floor(900/Math.max(1,iw)));
  c2d.imageSmoothingEnabled=true;try{c2d.imageSmoothingQuality='high'}catch(e){}
  c2d.drawImage(sp91Portrait(L,mood,iw,ih,Math.max(1,k)),x0,y0,iw,ih);
  if(sp.curtain){const cc=sp.curtain;for(const s of [-1,1]){const xe=s<0?x0:x0+iw,dw=iw*.13;c2d.beginPath();c2d.moveTo(xe,y0);c2d.lineTo(xe-s*dw,y0);c2d.quadraticCurveTo(xe-s*dw*.35,y0+ih*.55,xe-s*dw*.9,y0+ih);c2d.lineTo(xe,y0+ih);c2d.closePath();
    const g=c2d.createLinearGradient(xe,0,xe-s*dw,0);g.addColorStop(0,sp91Warm(cc,.35));g.addColorStop(.6,cc);g.addColorStop(1,sp91Lit(cc,.15));c2d.fillStyle=g;c2d.fill();c2d.strokeStyle='rgba(0,0,0,.45)';c2d.lineWidth=1;c2d.stroke();
    c2d.fillStyle=L.frame;c2d.fillRect(xe-s*dw*.62-1.5,y0+ih*.5,3,3)}
    c2d.fillStyle=L.frame;c2d.fillRect(x0,y0,iw,Math.max(2,ih*.06))}
  c2d.fillStyle='rgba(245,232,204,.75)';c2d.font=`600 ${Math.max(8,Math.round(TW*0.17))}px IBM Plex Mono, monospace`;c2d.textAlign='center';c2d.textBaseline='middle';
  if(label)c2d.fillText(String(sp.short||sp.name||'FLAVIUS').toUpperCase().slice(0,14),cx,cy+h/2+TW*0.16);
  c2d.restore()}}

/* flavFaceURL: sponsors keyed by their look (edits show at once); Flavius as before. */
{const base=flavFaceURL;flavFaceURL=function(mood,sp){
  if(!sp||flavIsFlavius(sp))return base.apply(this,arguments);
  const key='sp91:'+sp91LookKey(sp91Look(sp))+':'+mood+':'+(sp.frame||'')+(sp.curtain||'');if(FLAV_IMG[key])return FLAV_IMG[key];
  try{const cv2=document.createElement('canvas');cv2.width=156;cv2.height=124;const c=cv2.getContext('2d');flavFace(c,78,62,152,120,mood,false,sp);return (FLAV_IMG[key]=cv2.toDataURL())}catch(e){return ''}}}

/* drawCurtain — the velvet curtain in the seated sponsor's colours (Flavius = today's red + gold). */
drawCurtain=function(c2d,cx,cy,w,h){const v=curtainV();if(v<=0.01)return;const x0=cx-w/2+4,y0=cy-h/2+4,iw=w-8,ih=h-8;const half=iw/2*v;
  let sp=null;try{sp=typeof curSponsor==='function'?curSponsor():null}catch(e){}
  const cc=sp&&!flavIsFlavius(sp)&&sp.curtain||SP91_CURTAIN0,fr=sp&&!flavIsFlavius(sp)&&sp.frame||'#c9a458';
  const c1=cc===SP91_CURTAIN0?'#8e1b22':cc,c0=cc===SP91_CURTAIN0?'#5e0f14':sp91Warm(cc,.38);
  c2d.save();c2d.beginPath();c2d.rect(x0,y0,iw,ih);c2d.clip();
  for(const side of [0,1]){const Lx=side?x0+iw-half:x0;const g=c2d.createLinearGradient(Lx,0,Lx+half,0);
    for(let i=0;i<=6;i++){const t=i/6;g.addColorStop(t,i%2?c0:c1)}
    c2d.fillStyle=g;c2d.fillRect(Lx,y0,half,ih);
    c2d.fillStyle='rgba(0,0,0,.25)';c2d.fillRect(side?Lx:Lx+half-2,y0,2,ih)}
  c2d.fillStyle=fr;c2d.fillRect(x0,y0,iw,Math.max(3,ih*0.08));
  c2d.fillStyle=fr===('#c9a458')?'#8a6a2a':sp91Warm(fr,.4);for(let i=0;i<8;i++)c2d.fillRect(x0+i*iw/8,y0+Math.max(3,ih*0.08),iw/16,2);
  c2d.restore()};

/* ---------------- the designer ---------------- */
/* sponPrevHTML — a big portrait + the MOOD ROW: all 11 moods of the sponsor being edited. */
sponPrevHTML=function(draft){draft.v=(draft.v||0)+1;const d={...draft,id:(draft.id||'cs')+'p'};
  return `<div class="sp91big"><img src="${flavFaceURL('calm',d)}" alt=""></div><div class="rc-sub sp91h">${_T`Moods`}</div>
  <div class="sponmoods sp91row">${SP91_MOODS.map(m=>`<div data-sp91m="${m}"><img src="${flavFaceURL(m,d)}" alt="${m}"><span class="rc-sub">${m}</span></div>`).join('')}</div>
  <div class="rc-sub" style="text-align:center;margin-top:4px">${esc(draft.name||_T('Unnamed sponsor'))}</div>`};

/* SP91_OPTS — the new part lists (value, label). */
function sp91Opts(){return {
  hair2:[['',_T('Short')],['curls',_T('Curls')],['cropped',_T('Cropped')],['receding',_T('Receding')],['bald',_T('Bald')],['long',_T('Long')],['bun',_T('Bun')],['braids',_T('Braids')]],
  beard:[['none',_T('None')],['stubble',_T('Stubble')],['moustache',_T('Moustache')],['goatee',_T('Goatee')],['short',_T('Short')],['full',_T('Full')],['long',_T('Long')]],
  head:[['none',_T('None')],['laurel',_T('Laurel wreath')],['laurelg',_T('Golden laurel')],['flowers',_T('Flower crown')],['diadem',_T('Diadem')],['circlet',_T('Silver circlet')],['hood',_T('Hood')],['veil',_T('Veil')],['helm',_T('Crested helm')],['phrygian',_T('Phrygian cap')],['turban',_T('Turban')]],
  age:[['young',_T('Young')],['adult',_T('Prime of life')],['old',_T('Greying')],['elder',_T('Elder')]],
  ear:[['none',_T('None')],['hoops',_T('Gold hoops')],['pearls',_T('Pearls')],['gems',_T('Gem drops')]],
  torc:[['none',_T('None')],['gold',_T('Gold torc')],['silver',_T('Silver torc')]],
  brooch:[['gold',_T('Gold')],['silver',_T('Silver')],['none',_T('None')]]}}

/* sponsorStudioHTML: wider designer, the new parts, skin swatches, box colours. */
{const base=sponsorStudioHTML;sponsorStudioHTML=function(){let h=base.apply(this,arguments);
  if(!creatorUnlocked()||!ST.spd2)return h;const d=ST.spd2,L=sp91Look(d),O=sp91Opts();
  const sel=(f,v,lbl)=>`<label>${lbl}<select data-sonf="${f}">${O[f].map(([k,l])=>`<option value="${esc(k)}" ${String(v)===String(k)?'selected':''}>${esc(l)}</option>`).join('')}</select></label>`;
  const col=(f,l,v)=>`<label>${l}<input type="color" data-sonf="${f}" value="${esc(v)}"></label>`;
  h=h.replace('<div class="trstudio">','<div class="trstudio big sp91st">');
  h=h.replace(/<label>[^<]*<select data-sonf="long">[\s\S]*?<\/select><\/label>/,'');
  h=h.replace(/<label>[^<]*<select data-sonf="beard">[\s\S]*?<\/select><\/label>/,sel('beard',L.beard,_T('Beard')));
  h=h.replace(/<label>[^<]*<select data-sonf="head">[\s\S]*?<\/select><\/label>/,sel('head',L.head,_T('Headwear')));
  const add=`<div class="formgrid sp91parts"><div class="sp91sect">${_T`Face &amp; hair`}</div>
    ${sel('hair2',d.hair2||(d.long?'long':''),_T('Hair style'))}${sel('age',L.age,_T('Age'))}${col('eye',_T('Eyes'),L.eye)}
    <div class="sp91sk" style="grid-column:1/-1"><span class="rc-sub">${_T`Skin tone`}</span> ${SP91_SKINS.map(s=>`<button type="button" class="sp91sw${String(d.skin).toLowerCase()===s?' on':''}" data-sps="skin91" data-v="${s}" style="background:${s}" title="${s}" aria-label="${s}"></button>`).join('')}</div>
    <div class="sp91sect">${_T`Jewelry`}</div>${sel('ear',L.ear,_T('Earrings'))}${sel('torc',L.torc,_T('Torc'))}${sel('brooch',L.brooch,_T('Brooch'))}
    <div class="sp91sect">${_T`The box`}</div>${col('frame',_T('Frame'),L.frame)}${col('curtain',_T('Curtain'),d.curtain||SP91_CURTAIN0)}
    <div style="align-self:end"><button class="btn tksm" type="button" data-sps="box91">${_T`↺ Default box`}</button></div></div>`;
  const i=h.indexOf('<div class="mbtns">');return i<0?h+add:h.slice(0,i)+add+h.slice(i)}}

/* sponsorStudioInput: hair style keeps the old `long` flag in step. */
{const base=sponsorStudioInput;sponsorStudioInput=function(input){const d=ST.spd2;const f=input&&input.dataset&&input.dataset.sonf;
  if(d&&f==='hair2'){d.hair2=input.value;d.long=input.value==='long'||input.value==='braids';const pv=document.getElementById('spPrev');if(pv)pv.innerHTML=sponPrevHTML(d);return}
  return base.apply(this,arguments)}}

/* sponsorStudioClick: skin swatches, default box, and 🎲 Surprise me with Math.random (never the dice). */
{const base=sponsorStudioClick;sponsorStudioClick=async function(btn,redraw){const a=btn.dataset.sps;
  if(a==='skin91'&&ST.spd2){ST.spd2.skin=btn.dataset.v;redraw();return}
  if(a==='box91'&&ST.spd2){delete ST.spd2.frame;delete ST.spd2.curtain;redraw();return}
  if(a==='rand'){const d=blankSponsor();const pk=A=>A[Math.floor(Math.random()*A.length)];const hex=()=>'#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');const O=sp91Opts();
    Object.assign(d,{skin:pk(SP91_SKINS),hair:pk(['#141010','#3a2a1a','#7a3b1a','#5a4a3a','#bcbcbc','#d8b060','#2a1c12']),beard:pk(O.beard)[0],hair2:pk(O.hair2)[0],head:pk(O.head)[0],age:pk(O.age)[0],
      ear:pk(O.ear)[0],torc:pk(O.torc)[0],brooch:pk(O.brooch)[0],eye:pk(['#4a2c18','#2e4a6a','#3e5a2e','#6a4a20','#2a2a2a']),robe:hex(),trim:pk(['#e8dcc0','#c9a458','#f0d7a0','#d9e2ea']),bg:hex(),gem:hex(),
      acc:pk(['goblet','scroll','fan','coins']),voice:pk(Object.keys(SPONSOR_VOICES)),name:genName()});
    d.bg2=sp91Blend(d.bg,'#000',.55);d.long=d.hair2==='long'||d.hair2==='braids';d.short=d.name.split(' ')[0];ST.spd2=d;redraw();return}
  return base.apply(this,arguments)}}

{const st=document.createElement('style');st.textContent=`.sp91st .trprev{padding:8px}.sp91big img{width:100%;max-width:300px;border-radius:5px;display:block}
.sp91h{align-self:flex-start;margin:6px 0 2px}.sponmoods.sp91row{display:grid;grid-template-columns:repeat(6,1fr);gap:3px;width:100%}.sp91row img{max-width:100%}.sp91row span{font-size:10px}
.sp91parts{margin-top:8px}.sp91sect{grid-column:1/-1;font-weight:600;color:var(--gold,#c9a458);border-bottom:1px solid rgba(201,164,88,.3);margin-top:4px}
.sp91sk{display:flex;flex-wrap:wrap;gap:4px;align-items:center}.sp91sw{width:22px;height:22px;border-radius:50%;border:2px solid rgba(255,255,255,.25);padding:0;cursor:pointer}.sp91sw.on{border-color:var(--gold,#c9a458);box-shadow:0 0 0 2px rgba(201,164,88,.45)}
@media(max-width:520px){.sponmoods.sp91row{grid-template-columns:repeat(4,1fr)}}`;document.head.appendChild(st)}

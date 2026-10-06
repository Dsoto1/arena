/* =====================================================================
   172-v89city · THE CITY CENTER REIMAGINED (v0.89, part F)
   =====================================================================
   The square of 25-city is redrawn as a painted Roman forum (his picks 2026-10-05, CLAUDE.md §8):
   • HYBRID: a painted panorama behind (sky + clouds, the sun's glow, far hills and each arena's character from CV89 —
     harbour sea + ships + cranes, Vesuvius, desert dunes + palms, the Alps, an aqueduct, temples on the hills — a far
     band of roofs and a ring of terracotta-roofed houses with streets around the square) + the walkable iso forum.
   • N89 = 18×18 tiles (was 14); your steps take STEP89 = 100 ms (were 130), walkers glide between tiles.
   • The forum (B89): the ARENA (an elliptical amphitheatre: three arcades + attic, banners, the cavea with its crowd, the
     gate on its front, the editor's balcony), the TEMPLE (podium, steps, columns, pediment → TEMPLE76 offerings via
     [data-god89]), MARKET STALLS with striped scalloped awnings (Arms market / Armorer → the city kits; fruit, pots and
     bread for colour), the AUCTION on a rostra by the forum steps (Vulso stands on it), the TRAINING GROUND beside the
     arena (palus posts, a dummy, a rack, a sparring pair → watch tonight's fighters or go to your Training Yard,
     [data-cw89]), tavern, bathhouse with a dome, lupanar, a fountain with a statue, carts with mules, trees, statues,
     cobbles and travertine slabs, goats / hens / a dog wandering (CITY.anim89, cosmetic Math.random).
   • LIGHT: one sun from the upper left (SUN89) — lit left faces, shaded right faces, soft cast shadows (SH89), contact
     shading, figure shadows. Daylight only (night is on the back burner).
   • BAKED once per city and size (CB89): the ground layer (panorama + paving + shadows), a front layer (front houses +
     vignette) and one sprite per building with a hit mask; a frame = 1 layer + sprites + figures.
   • Replaces cityBlocked / cityBldgAt / citySize / cityDraw; wraps cityPopulate (new spots, animals), cityLoop (faster
     steps, beasts from the east edge), cityAt (clicks on building silhouettes), cityMove (hover), citySelect (temple,
     training ground, the colour stalls). CITY_GATE (a const array) is moved in place to the amphitheatre's gate.
   Layout/variety use hash89 of the city name — never the seeded dice.
   ===================================================================== */
const N89=18,ZK89=0.55,STEP89=100;
const SUN89={r:0.316,c:-0.949};             /* toward the sun on the ground: screen upper left */
const SH89={r:-0.24,c:0.62};                /* cast-shadow offset per unit of height */
const ARENA89={u0:13,v0:8,a:7.5,b:6,H:4.1,tg:1.95}; /* the amphitheatre ellipse in u=c-r, v=c+r units; tg = the gate's angle */
CITY_GATE[0]=2;CITY_GATE[1]=12;
/* B89 — the forum's pieces: key, footprint r0..r1 × c0..c1, height, type t; lab = clickable landmark */
const B89=[
  {k:'temple',r0:0,r1:3,c0:0,c1:4,h:3.6,t:'temple',lab:_T('Temple'),ico:'🏛'},
  {k:'auction',r0:4,r1:5,c0:6,c1:7,h:0.5,t:'rostra',lab:_T('Auction block'),ico:'⚖'},
  {k:'tavern',r0:6,r1:7,c0:0,c1:2,h:1.9,t:'house',lab:_T('Tavern'),ico:'🍷'},
  {k:'bath',r0:10,r1:12,c0:0,c1:2,h:1.5,t:'bath',lab:_T('Bathhouse'),ico:'🛁'},
  {k:'lupanar',r0:14,r1:15,c0:0,c1:1,h:1.9,t:'house',lab:_T('Lupanar'),ico:'🌙'},
  {k:'arms',r0:8,r1:8,c0:5,c1:6,h:1.4,t:'stall',ware:'arms',lab:_T('Arms market'),ico:'⚔️'},
  {k:'goods1',r0:8,r1:8,c0:9,c1:10,h:1.4,t:'stall',ware:'fruit'},
  {k:'armor',r0:11,r1:11,c0:5,c1:6,h:1.4,t:'stall',ware:'armor',lab:_T('Armorer'),ico:'🛡'},
  {k:'goods2',r0:11,r1:11,c0:9,c1:10,h:1.4,t:'stall',ware:'pots'},
  {k:'goods3',r0:14,r1:14,c0:6,c1:7,h:1.4,t:'stall',ware:'bread'},
  {k:'train',r0:4,r1:9,c0:13,c1:17,h:0.5,t:'yard',lab:_T('Training ground'),ico:'🏋'},
  {k:'fountain',r0:13,r1:14,c0:11,c1:12,h:1.8,t:'fountain'},
  {k:'cart1',r0:16,r1:16,c0:3,c1:4,h:0.9,t:'cart'},
  {k:'cart2',r0:12,r1:12,c0:15,c1:16,h:0.9,t:'cart'},
  {k:'statue1',r0:4,r1:4,c0:0,c1:0,h:1.8,t:'statue'},
  {k:'statue2',r0:4,r1:4,c0:4,c1:4,h:1.8,t:'statue'},
  {k:'tree1',r0:16,r1:16,c0:0,c1:0,h:2.4,t:'tree'},
  {k:'tree2',r0:17,r1:17,c0:2,c1:2,h:2.4,t:'tree'},
  {k:'tree3',r0:1,r1:1,c0:5,c1:5,h:2.4,t:'tree'},
  {k:'altar',r0:4,r1:4,c0:2,c1:2,h:0.5,t:'altar'},
  {k:'tree4',r0:17,r1:17,c0:16,c1:16,h:2.4,t:'tree'}];
const B89K={};for(const B of B89)B89K[B.k]=B;
/* CV89 — each arena's character: what the panorama shows, the stone, the trees */
const CV89={
  Syracusae:{f:['sea','hills','ships','crane'],st:'it',tree:'pine'},
  Verona:{f:['alps','hills','river'],st:'it',tree:'cypress'},
  Arles:{f:['hills','river'],st:'gaul',tree:'cypress'},
  Capua:{f:['hills','volcano0'],st:'it',tree:'pine'},
  Thysdrus:{f:['dunes'],st:'afr',tree:'palm'},
  Roma:{f:['hills','aqueduct','hilltemples'],st:'it',tree:'cypress'},
  Nemausus:{f:['hills','aqueduct'],st:'gaul',tree:'cypress'},
  Pompeii:{f:['sea','volcano'],st:'it',tree:'pine'},
  'Leptis Magna':{f:['sea','dunes0','ships'],st:'afr',tree:'palm'},
  Uthina:{f:['dunes','hills0'],st:'afr',tree:'palm'},
  Pola:{f:['sea','hills','ships'],st:'it',tree:'pine'},
  Puteoli:{f:['sea','volcano','ships','crane'],st:'it',tree:'pine'}};
/* ST89 — stone, stucco, roofs and sky per region */
const ST89={
  it:{walls:['#efe0c2','#ead1a6','#f2e6cf','#e7c79c','#eed8b4','#e9c6a8'],roof:'#c4643a',marble:'#f1ebdf',stone:'#d9cbad',pave:'#c9b48f',sky:['#79acd6','#e9e2cc'],haze:'#d9dccf',hill:'#8e9a6e'},
  gaul:{walls:['#e6dece','#ddd3bf','#ece4d2','#e2d2b4','#d8cdb6'],roof:'#b85a36',marble:'#ece7dc',stone:'#d2c8b4',pave:'#bfb49d',sky:['#7ea9cf','#e4e3d6'],haze:'#d6dbd2',hill:'#869570'},
  afr:{walls:['#ebd3a4','#e3c590','#efdcb6','#e6cb98','#dcbd86'],roof:'#c06a3e',marble:'#f2e9d6',stone:'#dcc59a',pave:'#d6bf91',sky:['#8cbfe0','#f3e4c6'],haze:'#efe2c8',hill:'#c9a876'}};
const AWN89=['#b8322a','#2a7fa6','#d9a224','#26907f','#cf5a1c','#7d3f98','#b5285e','#3f6fb0'];

/* ---------------- small helpers ---------------- */
function hash89(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng89(seed){let s=(seed>>>0)||1;return ()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
function rgb89(h){h=String(h).replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]}
function hex89(a){return '#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}
function mix89(a,b,t){const A=rgb89(a),B=rgb89(b);return hex89(A.map((v,i)=>v+(B[i]-v)*t))}
/* sh89 — a colour in light (f>1 brighter) or shade (f<1: darker and a touch cooler, like painted shadows) */
function sh89(c,f){const A=rgb89(c);if(f>=1)return hex89(A.map(v=>v+(255-v)*(f-1)));return hex89([A[0]*f,A[1]*f+(1-f)*4,A[2]*f+(1-f)*22])}
function P89(r,c,z){const T=CITY.TW;return {x:CITY.OX+(c-r)*T/2,y:CITY.OY+(c+r)*T/4-(z||0)*T*ZK89}}
function UV89(u,v,z){const T=CITY.TW;return {x:CITY.OX+u*T/2,y:CITY.OY+v*T/4-(z||0)*T*ZK89}}
function poly89(g,pts,fill,stroke,lw){g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.stroke()}}
const FR89=R=>(s,z)=>P89(R,s,z);   /* the +r face (screen left, in the light): s runs along c */
const FC89=C=>(s,z)=>P89(s,C,z);   /* the +c face (screen right, in shade): s runs along r */
function fp89(g,F,pts,fill,stroke,lw){poly89(g,pts.map(([s,z])=>F(s,z)),fill,stroke,lw)}
function lerp89(a,b,t){return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}}
function hull89(pts){const p=pts.slice().sort((a,b)=>a.x-b.x||a.y-b.y);const cr=(o,a,b)=>(a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);const lo=[],up=[];
  for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}
  for(let i=p.length-1;i>=0;i--){const q=p[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}
  return lo.slice(0,-1).concat(up.slice(0,-1))}
const inArena89=(r,c)=>{const A=ARENA89;const u=c-r,v=c+r;return ((u-A.u0)/A.a)**2+((v-A.v0)/A.b)**2<=1};
/* the tile map: which piece covers each tile */
const GRID89=(()=>{const G=[];for(let r=0;r<N89;r++){G.push([]);for(let c=0;c<N89;c++){let k=inArena89(r,c)?'arena':null;for(const B of B89)if(r>=B.r0&&r<=B.r1&&c>=B.c0&&c<=B.c1)k=B.k;G[r].push(k)}}return G})();
const ACT89=new Set(['arena','temple','auction','tavern','bath','lupanar','arms','armor','goods1','goods2','goods3','train']);

/* ---------------- the square's rules: what blocks, what a tile belongs to, the canvas size ---------------- */
cityBlocked=function(r,c){if(r<0||c<0||r>=N89||c>=N89)return true;return !!GRID89[r][c]};
cityBldgAt=function(r,c){if(r<0||c<0||r>=N89||c>=N89)return undefined;const k=GRID89[r][c];if(!k||!ACT89.has(k))return undefined;
  if(k==='arena')return ['arena',r,r,c,c,ARENA89.H,_T('THE ARENA'),'🏛'];const B=B89K[k];return [k,B.r0,B.r1,B.c0,B.c1,B.h,B.lab||'',B.ico||'']};
citySize=function(){if(!CITY.open||!CITY.cv)return;const cv=CITY.cv;const rect=cv.parentElement.getBoundingClientRect();const W=Math.max(200,Math.round(rect.width)),H=Math.max(150,Math.round(rect.height));
  const dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);CITY.W=W;CITY.H=H;CITY.dpr=dpr;CITY.c2.setTransform(dpr,0,0,dpr,0,0);
  const Hb=H-Math.max(3,H*0.01);const top=H<420?0.1:0.27;const TW=Math.max(14,Math.min(W/(N89+0.3),(Hb-H*top)*4/(2*N89-1)));
  CITY.TW=TW;CITY.OX=W/2-TW*0.35;CITY.OY=Hb-(2*N89-1)*TW/4};

/* ---------------- drawing primitives ---------------- */
/* wall89 — one wall face with a painted light gradient (darker at the foot = contact shading) */
function wall89(g,F,s0,s1,z0,z1,col,f){const b=F((s0+s1)/2,z0),t=F((s0+s1)/2,z1);const gr=g.createLinearGradient(b.x,b.y,t.x,t.y);
  gr.addColorStop(0,sh89(col,f*0.72));gr.addColorStop(Math.min(0.5,0.22/Math.max(0.3,z1-z0)),sh89(col,f*0.97));gr.addColorStop(1,sh89(col,f*1.03));fp89(g,F,[[s0,z0],[s1,z0],[s1,z1],[s0,z1]],gr)}
/* box89 — a lit box: +r face (light), +c face (shade), top */
function box89(g,R0,R1,C0,C1,z0,z1,col,o){o=o||{};
  if(o.left!==false)wall89(g,FR89(R1),C0,C1,z0,z1,col,o.fl||0.93);
  if(o.right!==false)wall89(g,FC89(C1),R1,R0,z0,z1,col,o.fr||0.66);
  if(o.top!==false)poly89(g,[P89(R0,C0,z1),P89(R0,C1,z1),P89(R1,C1,z1),P89(R1,C0,z1)],sh89(col,o.ft||1.05));
  if(o.edge!==false){g.strokeStyle='rgba(255,250,235,.35)';g.lineWidth=1;g.beginPath();const a=P89(R1,C0,z1),b=P89(R1,C1,z1),c=P89(R0,C1,z1);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.lineTo(c.x,c.y);g.stroke();
    g.strokeStyle='rgba(40,25,12,.28)';g.beginPath();const d=P89(R1,C1,z0);g.moveTo(d.x,d.y);g.lineTo(b.x,b.y);g.stroke()}}
/* tiles89 — terracotta roof tiles on a slope quad (eave e0→e1, ridge r0→r1) */
function tiles89(g,e0,e1,r0,r1,col){const T=CITY.TW;g.save();g.beginPath();g.moveTo(e0.x,e0.y);g.lineTo(e1.x,e1.y);g.lineTo(r1.x,r1.y);g.lineTo(r0.x,r0.y);g.closePath();g.clip();
  const n=Math.max(2,Math.round(Math.hypot(e1.x-e0.x,e1.y-e0.y)/(T*0.11)));
  for(let k=0;k<n;k++){const t=(k+0.5)/n;const a=lerp89(e0,e1,t),b=lerp89(r0,r1,t);
    g.strokeStyle=sh89(col,0.62);g.lineWidth=Math.max(1,T*0.05);g.beginPath();g.moveTo(a.x+T*0.012,a.y);g.lineTo(b.x+T*0.012,b.y);g.stroke();
    g.strokeStyle=sh89(col,1.18);g.lineWidth=Math.max(0.8,T*0.022);g.beginPath();g.moveTo(a.x-T*0.01,a.y);g.lineTo(b.x-T*0.01,b.y);g.stroke()}
  const m=Math.max(2,Math.round(Math.hypot(r0.x-e0.x,r0.y-e0.y)/(T*0.1)));g.strokeStyle='rgba(60,20,8,.22)';g.lineWidth=1;
  for(let j=1;j<m;j++){const t=j/m;const a=lerp89(e0,r0,t),b=lerp89(e1,r1,t);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
  g.restore();g.strokeStyle=sh89(col,0.5);g.lineWidth=Math.max(1,T*0.035);g.beginPath();g.moveTo(e0.x,e0.y);g.lineTo(e1.x,e1.y);g.stroke()}
/* roof89 — a roof on a box: 'gable' (axis r: gable on the +r face; axis c: on the +c face), 'hip' or 'flat' */
function roof89(g,R0,R1,C0,C1,z,o){const col=o.col,T=CITY.TW,ov=o.ov==null?0.12:o.ov,tex=o.tex!==false;const a0=R0-ov,a1=R1+ov,b0=C0-ov,b1=C1+ov,ze=z-0.06;
  if(o.type==='flat'){box89(g,R0-0.04,R1+0.04,C0-0.04,C1+0.04,z,z+0.12,o.wall||'#e2cfa8',{edge:true});box89(g,R0+0.06,R1-0.06,C0+0.06,C1-0.06,z+0.04,z+0.06,sh89(o.wall||'#e2cfa8',0.86),{left:false,right:false,edge:false});return}
  if(o.type==='hip'){const alongC=(C1-C0)>=(R1-R0);const zr=z+o.rise;
    if(alongC){const Rm=(R0+R1)/2,d=(R1-R0)/2;const s0=P89(Rm,C0+d,zr),s1=P89(Rm,C1-d,zr);
      const q1=[P89(a0,b0,ze),P89(a0,b1,ze),s1,s0];poly89(g,q1,sh89(col,0.86));if(tex)tiles89(g,q1[0],q1[1],s0,s1,sh89(col,0.86));
      poly89(g,[P89(a0,b0,ze),P89(a1,b0,ze),s0],sh89(col,1.1));poly89(g,[P89(a0,b1,ze),P89(a1,b1,ze),s1],sh89(col,0.7));
      const q2=[P89(a1,b0,ze),P89(a1,b1,ze),s1,s0];poly89(g,q2,sh89(col,1.0));if(tex)tiles89(g,q2[0],q2[1],s0,s1,col)}
    else{const Cm=(C0+C1)/2,d=(C1-C0)/2;const s0=P89(R0+d,Cm,zr),s1=P89(R1-d,Cm,zr);
      poly89(g,[P89(a0,b0,ze),P89(a0,b1,ze),s0],sh89(col,0.86));
      const q1=[P89(a0,b0,ze),P89(a1,b0,ze),s1,s0];poly89(g,q1,sh89(col,1.1));if(tex)tiles89(g,q1[0],q1[1],s0,s1,sh89(col,1.1));
      const q2=[P89(a0,b1,ze),P89(a1,b1,ze),s1,s0];poly89(g,q2,sh89(col,0.7));if(tex)tiles89(g,q2[0],q2[1],s0,s1,sh89(col,0.7));
      poly89(g,[P89(a1,b0,ze),P89(a1,b1,ze),s1],sh89(col,1.0))}
    g.strokeStyle=sh89(col,0.55);g.lineWidth=Math.max(1,T*0.03);return}
  /* gable */
  const zr=z+o.rise,gw=o.gable||o.wall||'#e8d6b4';
  if(o.axis==='r'){const Cm=(C0+C1)/2;fp89(g,FR89(R1),[[C0,z],[C1,z],[Cm,zr]],o.pedi||sh89(gw,0.92));
    const q1=[P89(a0,b0,ze),P89(a1,b0,ze),P89(a1,Cm,zr),P89(a0,Cm,zr)];poly89(g,q1,sh89(col,1.1));if(tex)tiles89(g,q1[1],q1[0],q1[2],q1[3],sh89(col,1.1));
    const q2=[P89(a0,b1,ze),P89(a1,b1,ze),P89(a1,Cm,zr),P89(a0,Cm,zr)];poly89(g,q2,sh89(col,0.7));if(tex)tiles89(g,q2[1],q2[0],q2[2],q2[3],sh89(col,0.7));
    g.strokeStyle=sh89(col,1.25);g.lineWidth=Math.max(1,T*0.04);g.beginPath();const p=P89(a1,b0,ze),q=P89(a1,Cm,zr),w=P89(a1,b1,ze);g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.lineTo(w.x,w.y);g.stroke();
    g.strokeStyle=sh89(col,0.5);g.lineWidth=Math.max(1,T*0.03);g.beginPath();const k1=P89(a0,Cm,zr);g.moveTo(k1.x,k1.y);g.lineTo(q.x,q.y);g.stroke()}
  else{const Rm=(R0+R1)/2;fp89(g,FC89(C1),[[R1,z],[R0,z],[Rm,zr]],o.pedi||sh89(gw,0.66));
    const q1=[P89(a0,b0,ze),P89(a0,b1,ze),P89(Rm,b1,zr),P89(Rm,b0,zr)];poly89(g,q1,sh89(col,0.86));if(tex)tiles89(g,q1[0],q1[1],q1[3],q1[2],sh89(col,0.86));
    const q2=[P89(a1,b0,ze),P89(a1,b1,ze),P89(Rm,b1,zr),P89(Rm,b0,zr)];poly89(g,q2,sh89(col,1.02));if(tex)tiles89(g,q2[0],q2[1],q2[3],q2[2],sh89(col,1.02));
    g.strokeStyle=sh89(col,1.2);g.lineWidth=Math.max(1,T*0.04);g.beginPath();const p=P89(a0,b1,ze),q=P89(Rm,b1,zr),w=P89(a1,b1,ze);g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.lineTo(w.x,w.y);g.stroke();
    g.strokeStyle=sh89(col,0.5);g.lineWidth=Math.max(1,T*0.03);g.beginPath();const k1=P89(Rm,b0,zr);g.moveTo(k1.x,k1.y);g.lineTo(q.x,q.y);g.stroke()}}
/* column89 — a fluted marble column standing at ground point p0 up to height z (screen-space cylinder, lit from the left) */
function column89(g,base,h,w,col){const x=base.x,yb=base.y,yt=base.y-h*CITY.TW*ZK89,hw=w/2;
  const gr=g.createLinearGradient(x-hw,0,x+hw,0);gr.addColorStop(0,sh89(col,0.98));gr.addColorStop(0.3,sh89(col,1.1));gr.addColorStop(0.7,sh89(col,0.76));gr.addColorStop(1,sh89(col,0.56));
  g.fillStyle=gr;g.fillRect(x-hw,yt,w,yb-yt);g.strokeStyle='rgba(90,75,55,.18)';g.lineWidth=0.8;for(const f of [-0.45,0,0.45]){g.beginPath();g.moveTo(x+f*hw,yt+w*0.3);g.lineTo(x+f*hw,yb-w*0.2);g.stroke()}
  g.fillStyle=sh89(col,0.88);g.beginPath();g.ellipse(x,yb,hw*1.45,hw*0.55,0,0,Math.PI*2);g.fill();
  g.fillStyle=gr;g.fillRect(x-hw*1.45,yt-w*0.32,w*1.45,w*0.32);g.fillStyle=sh89(col,1.12);g.fillRect(x-hw*1.5,yt-w*0.42,w*1.5,w*0.12)}
/* window89 / door89 — openings in a face (face space: s along the face, z up) */
function window89(g,F,s,z,w,hh,o){o=o||{};const d=o.dark||'#2a1d14';fp89(g,F,[[s-w/2,z],[s+w/2,z],[s+w/2,z+hh],[s-w/2,z+hh]],d);
  fp89(g,F,[[s-w/2-0.03,z-0.05],[s+w/2+0.03,z-0.05],[s+w/2+0.03,z],[s-w/2-0.03,z]],'rgba(255,248,230,.55)');
  if(o.shut){fp89(g,F,[[s-w/2-w*0.42,z],[s-w/2,z],[s-w/2,z+hh],[s-w/2-w*0.42,z+hh]],o.shut);fp89(g,F,[[s+w/2,z],[s+w/2+w*0.42,z],[s+w/2+w*0.42,z+hh],[s+w/2,z+hh]],sh89(o.shut,0.85))}}
function door89(g,F,s,w,hh,col){const pts=[[s-w/2,0],[s+w/2,0],[s+w/2,hh-w/2]];for(let k=1;k<8;k++){const a=k/8*Math.PI;pts.push([s+Math.cos(a)*w/2,hh-w/2+Math.sin(a)*w/2])}pts.push([s-w/2,hh-w/2]);
  fp89(g,F,pts,col||'#3a2414');fp89(g,F,pts.map(([a,b])=>[s+(a-s)*1.15,b*1.04]),null,'rgba(255,245,225,.45)',1.2)}
/* awning89 — a striped cloth with a scalloped edge over the +r face (or +c face with face='c') */
function awning89(g,face,R,s0,s1,zTop,zLow,depth,cols){const T=CITY.TW;const n=Math.max(4,Math.round((s1-s0)/0.22));
  const pt=(s,t,z)=>face==='c'?P89(s,R+t,z):P89(R+t,s,z);
  for(let i=0;i<n;i++){const a=s0+(s1-s0)*i/n,b=s0+(s1-s0)*(i+1)/n;const c=cols[i%cols.length];
    poly89(g,[pt(a,0,zTop),pt(b,0,zTop),pt(b,depth,zLow),pt(a,depth,zLow)],sh89(c,face==='c'?0.86:1.02))}
  /* the scalloped valance */
  for(let i=0;i<n;i++){const a=s0+(s1-s0)*i/n,b=s0+(s1-s0)*(i+1)/n;const c=cols[i%cols.length];const p1=pt(a,depth,zLow),p2=pt(b,depth,zLow);
    const mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2,dz=T*ZK89*0.16;g.fillStyle=sh89(c,face==='c'?0.7:0.88);g.beginPath();g.moveTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.lineTo(p2.x,p2.y+dz*0.45);g.quadraticCurveTo(mx,my+dz*1.6,p1.x,p1.y+dz*0.45);g.closePath();g.fill()}
  g.strokeStyle='rgba(50,25,10,.35)';g.lineWidth=1;g.beginPath();const e0=pt(s0,depth,zLow),e1=pt(s1,depth,zLow);g.moveTo(e0.x,e0.y);g.lineTo(e1.x,e1.y);g.stroke()}
function pole89(g,p,h,col){const T=CITY.TW;g.strokeStyle=col||'#6b4a2a';g.lineWidth=Math.max(1.2,T*0.035);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x,p.y-h*T*ZK89);g.stroke()}

/* ---------------- the pieces of the forum ---------------- */
function drawTemple89(g,B,S){const R0=B.r0-0.5,R1=B.r1+0.5,C0=B.c0-0.5,C1=B.c1+0.5,Rf=R1-1;const T=CITY.TW;const M=S.marble;
  const zp=0.5,zc=zp+1.85,ze=zc+0.34;
  box89(g,R0,Rf,C0,C1,0,zp,S.stone);
  for(let k=0;k<4;k++)box89(g,Rf-0.02,Rf+(4-k)*0.25,C0+0.2,C1-0.2,zp*k/4,zp*(k+1)/4,M,{fl:0.95,fr:0.7,ft:1.06});
  for(let k=0;k<4;k++){const z=zp*(k+1)/4;const a=P89(Rf+(4-k)*0.25,C0+0.2,z),b=P89(Rf+(4-k)*0.25,C1-0.2,z);g.strokeStyle='rgba(255,255,245,.6)';g.lineWidth=1;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
  const cw=T*0.15;
  /* left colonnade (behind), the cella, right colonnade, the front row */
  for(let r=R0+0.35;r<Rf-0.3;r+=0.78)column89(g,P89(r,C0+0.22,zp),zc-zp,cw,M);
  box89(g,R0+0.3,Rf-0.95,C0+0.62,C1-0.62,zp,zc,M,{fl:0.74,fr:0.55,top:false,edge:false});
  door89(g,(s,z)=>P89(Rf-0.95,s,zp+z),(C0+C1)/2,0.85,1.35,'#4a3218');
  {const F=(s,z)=>P89(Rf-0.95,s,zp+z);fp89(g,F,[[(C0+C1)/2-0.02,0],[(C0+C1)/2+0.02,0],[(C0+C1)/2+0.02,1.0],[(C0+C1)/2-0.02,1.0]],'rgba(0,0,0,.35)')}
  for(let r=R0+0.35;r<Rf-0.3;r+=0.78)column89(g,P89(r,C1-0.22,zp),zc-zp,cw,M);
  const n=6;for(let i=0;i<n;i++){const c=C0+0.22+(C1-C0-0.44)*i/(n-1);column89(g,P89(Rf-0.22,c,zp),zc-zp,cw,M)}
  /* entablature with a frieze */
  box89(g,R0-0.05,Rf+0.02,C0-0.05,C1+0.05,zc,ze,M,{fl:0.96,fr:0.7});
  {const F=FR89(Rf+0.02);for(let s=C0+0.1;s<C1;s+=0.32)fp89(g,F,[[s,zc+0.12],[s+0.07,zc+0.12],[s+0.07,ze-0.06],[s,ze-0.06]],'rgba(90,70,45,.35)');
   fp89(g,F,[[C0-0.05,zc+0.1],[C1+0.05,zc+0.1],[C1+0.05,zc+0.12],[C0-0.05,zc+0.12]],'rgba(90,70,45,.3)')}
  {const F=FC89(C1+0.05);for(let s=R0;s<Rf;s+=0.32)fp89(g,F,[[s,zc+0.12],[s+0.07,zc+0.12],[s+0.07,ze-0.06],[s,ze-0.06]],'rgba(60,50,40,.3)')}
  const rise=(C1-C0)/2*0.4;roof89(g,R0-0.05,Rf+0.02,C0-0.05,C1+0.05,ze,{type:'gable',axis:'r',rise,col:S.roof,wall:M,pedi:sh89(M,0.9),ov:0.14});
  /* tympanum, cornice and acroteria */
  {const F=FR89(Rf+0.03),Cm=(C0+C1)/2;fp89(g,F,[[C0+0.35,ze+0.07],[C1-0.35,ze+0.07],[Cm,ze+rise-0.2]],sh89(M,0.78));
   fp89(g,F,[[Cm-0.28,ze+0.12],[Cm+0.28,ze+0.12],[Cm,ze+0.48]],'rgba(176,138,60,.55)');
   g.strokeStyle=sh89(M,1.12);g.lineWidth=Math.max(1.4,T*0.05);g.beginPath();const a=F(C0-0.1,ze+0.02),b=F(Cm,ze+rise+0.02),c=F(C1+0.1,ze+0.02);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.lineTo(c.x,c.y);g.closePath();g.stroke();
   g.fillStyle='#c9a54a';for(const p of [a,b,c]){g.beginPath();g.arc(p.x,p.y-T*0.06,T*0.05,0,Math.PI*2);g.fill()}}
}
function drawRostra89(g,B,S){const R0=B.r0-0.5,R1=B.r1+0.5,C0=B.c0-0.5,C1=B.c1+0.5;const T=CITY.TW;
  box89(g,R0,R1-0.35,C0,C1,0,B.h,S.stone);for(let k=0;k<2;k++)box89(g,R1-0.35,R1-0.35+(k+1)*0.175,C0+0.55,C1-0.55,0,B.h*(2-k)/3,S.marble,{fl:0.96});
  {const F=FR89(R1-0.35);for(const s of [C0+0.2,C1-0.2])fp89(g,F,[[s-0.06,0.08],[s+0.06,0.08],[s+0.06,B.h-0.08],[s-0.06,B.h-0.08]],'rgba(255,250,235,.35)')}
  /* the wooden block, a sign and rope posts */
  box89(g,R0+0.55,R0+1.15,C0+0.85,C1-0.25,B.h,B.h+0.32,'#8a5a32',{fl:0.92,fr:0.62});
  const sp=P89(R0+0.35,C0+0.3,B.h);pole89(g,sp,1.5,'#5a3a1e');
  {const a=P89(R0+0.35,C0+0.05,B.h+1.45),b=P89(R0+0.35,C0+0.95,B.h+1.45),c=P89(R0+0.35,C0+0.95,B.h+1.1),d=P89(R0+0.35,C0+0.05,B.h+1.1);poly89(g,[a,b,c,d],'#e9dcb8','#5a3a1e',1);
   g.save();g.fillStyle='#7a2230';g.font=`700 ${Math.max(6,Math.round(T*0.11))}px serif`;g.textAlign='center';g.textBaseline='middle';const m=lerp89(lerp89(a,b,.5),lerp89(d,c,.5),.5);g.translate(m.x,m.y);g.transform(1,0.5,0,1,0,0);g.fillText('VENALES',0,0);g.restore()}
  for(const [r,c] of [[R1-0.4,C0+0.12],[R1-0.4,C1-0.12]]){pole89(g,P89(r,c,B.h),0.6,'#c9a458')}
  {const a=P89(R1-0.4,C0+0.12,B.h+0.5),b=P89(R1-0.4,C1-0.12,B.h+0.5);g.strokeStyle='#a8312a';g.lineWidth=Math.max(1,T*0.03);g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2+T*0.12,b.x,b.y);g.stroke()}}
function drawHouse89(g,B,S,h0){const R0=B.r0-0.5,R1=B.r1+0.5,C0=B.c0-0.5,C1=B.c1+0.5;const T=CITY.TW;const rnd=rng89(hash89(B.k+(CITY.L?CITY.L.n:'')));
  const wall=S.walls[Math.floor(rnd()*S.walls.length)];const H=B.h;const lup=B.k==='lupanar';const wallC=lup?'#e7b9a4':wall;
  box89(g,R0,R1,C0,C1,0,H,wallC,{top:false});
  /* plinth and string course */
  fp89(g,FR89(R1),[[C0,0],[C1,0],[C1,0.14],[C0,0.14]],'rgba(80,55,30,.22)');fp89(g,FC89(C1),[[R1,0],[R0,0],[R0,0.14],[R1,0.14]],'rgba(60,40,25,.25)');
  fp89(g,FR89(R1),[[C0,0.98],[C1,0.98],[C1,1.05],[C0,1.05]],'rgba(255,250,235,.45)');fp89(g,FC89(C1),[[R1,0.98],[R0,0.98],[R0,1.05],[R1,1.05]],'rgba(255,250,235,.22)');
  const shut=lup?'#7a2230':rnd()<0.5?'#4f6b3a':'#6b4a2a';
  for(let s=C0+0.45;s<C1-0.2;s+=0.75)window89(g,FR89(R1),s,1.25,0.26,0.4,{shut});
  for(let s=R1-0.45;s>R0+0.2;s-=0.75)window89(g,FC89(C1),s,1.25,0.26,0.4,{shut:sh89(shut,0.8)});
  /* the shop front faces the square: the +c face */
  const F=FC89(C1),mid=(R0+R1)/2;
  if(B.k==='tavern'){fp89(g,F,[[mid+0.75,0.05],[mid-0.75,0.05],[mid-0.75,0.78],[mid+0.75,0.78]],'#3a2616');
    box89(g,R0+0.6,R1-0.6,C1,C1+0.16,0,0.38,'#c7b08a',{fl:0.95,fr:0.75});
    for(let i=0;i<3;i++){const p=P89(mid-0.45+i*0.42,C1+0.08,0.38);g.fillStyle='#a8603a';g.beginPath();g.ellipse(p.x,p.y-T*0.08,T*0.045,T*0.08,0,0,Math.PI*2);g.fill();g.fillStyle='#d48c5a';g.beginPath();g.ellipse(p.x-T*0.015,p.y-T*0.1,T*0.015,T*0.04,0,0,Math.PI*2);g.fill()}
    awning89(g,'c',C1,R1-0.05,R0+0.05,0.95,0.7,0.55,['#7a2230','#efe3c8']);
    pole89(g,P89(R1-0.05,C1+0.55,0),0.7);pole89(g,P89(R0+0.05,C1+0.55,0),0.7);
    {const p=P89(R1-0.15,C1+0.05,1.25);g.strokeStyle='#4a3018';g.lineWidth=1.5;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+T*0.2,p.y+T*0.1);g.stroke();g.fillStyle='#e8d7b0';g.fillRect(p.x+T*0.1,p.y+T*0.1,T*0.2,T*0.14);g.fillStyle='#7a2230';g.beginPath();g.arc(p.x+T*0.2,p.y+T*0.17,T*0.04,0,Math.PI*2);g.fill()}}
  else{door89(g,F,mid,0.5,0.8,'#4a1c20');
    for(const s of [mid-0.55,mid+0.55]){const p=F(s,0.95);g.strokeStyle='#4a3018';g.lineWidth=1;g.beginPath();g.moveTo(p.x,p.y-T*0.06);g.lineTo(p.x,p.y);g.stroke();g.fillStyle='#e0843a';g.beginPath();g.ellipse(p.x,p.y+T*0.03,T*0.04,T*0.05,0,0,Math.PI*2);g.fill()}
    fp89(g,F,[[mid+0.25,0.05],[mid-0.25,0.05],[mid-0.25,0.75],[mid+0.25,0.75]],'rgba(150,30,40,.55)')}
  /* balcony on the +r face */
  box89(g,R1,R1+0.22,C0+0.3,C1-0.3,1.05,1.12,'#7a5432',{fl:0.9,fr:0.6});
  {const F2=FR89(R1+0.22);g.strokeStyle='#5a3a1e';g.lineWidth=1;for(let s=C0+0.35;s<C1-0.3;s+=0.12){const a=F2(s,1.12),b=F2(s,1.4);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
   const a=F2(C0+0.3,1.4),b=F2(C1-0.3,1.4);g.lineWidth=2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
  roof89(g,R0,R1,C0,C1,H,{type:B.k==='tavern'?'gable':'hip',axis:'c',rise:0.55,col:S.roof,wall:wallC})}
function drawBath89(g,B,S){const R0=B.r0-0.5,R1=B.r1+0.5,C0=B.c0-0.5,C1=B.c1+0.5;const T=CITY.TW;const wall=S.walls[2];
  box89(g,R0,R1,C0,C1,0,B.h,wall,{top:false});
  fp89(g,FC89(C1),[[R1,0],[R0,0],[R0,0.14],[R1,0.14]],'rgba(60,40,25,.25)');
  for(let s=R1-0.5;s>R0+0.3;s-=0.75){door89(g,FC89(C1),s,0.42,s===R1-0.5?0.95:0.0001,'#3a2a20');}
  for(let s=R1-0.5;s>R0+0.3;s-=0.75)window89(g,FC89(C1),s,1.0,0.3,0.32,{dark:'#2c3a40'});
  for(let s=C0+0.5;s<C1-0.2;s+=0.75){const F=FR89(R1);const pts=[];const w=0.3;for(let k=0;k<=8;k++){const a=k/8*Math.PI;pts.push([s+Math.cos(a)*w/2,0.95+Math.sin(a)*w/2])}pts.unshift([s+w/2,0.55]);pts.push([s-w/2,0.55]);fp89(g,F,pts,'#2c3a40')}
  roof89(g,R0,R1,C0,C1,B.h,{type:'flat',wall:sh89(wall,0.95)});
  /* the dome on a drum */
  const c=P89((R0+R1)/2,(C0+C1)/2,B.h+0.12),rx=T*0.95,ry=rx*0.5,hd=T*0.85;
  g.fillStyle=sh89(wall,0.8);g.beginPath();g.ellipse(c.x,c.y,rx,ry,0,0,Math.PI*2);g.fill();
  g.fillStyle=sh89(wall,0.88);g.fillRect(c.x-rx,c.y-T*0.22,rx*2,T*0.22);g.beginPath();g.ellipse(c.x,c.y,rx,ry,0,0,Math.PI);g.fill();
  const dg=g.createRadialGradient(c.x-rx*0.4,c.y-T*0.22-hd*0.7,T*0.05,c.x,c.y-T*0.22,rx*1.15);dg.addColorStop(0,'#f4ead6');dg.addColorStop(0.55,sh89(S.stone,0.98));dg.addColorStop(1,sh89(S.stone,0.58));
  g.fillStyle=dg;g.beginPath();g.ellipse(c.x,c.y-T*0.22,rx,ry,0,0,Math.PI);g.ellipse(c.x,c.y-T*0.22,rx,hd,0,Math.PI,0);g.fill();
  g.strokeStyle='rgba(80,60,40,.25)';g.lineWidth=1;for(let k=1;k<6;k++){const a=Math.PI+k/6*Math.PI;g.beginPath();g.moveTo(c.x+Math.cos(a)*rx,c.y-T*0.22);g.quadraticCurveTo(c.x+Math.cos(a)*rx*0.6,c.y-T*0.22-hd*0.9,c.x,c.y-T*0.22-hd);g.stroke()}
  g.fillStyle=sh89(S.marble,1.0);g.beginPath();g.ellipse(c.x,c.y-T*0.22-hd,T*0.13,T*0.06,0,0,Math.PI*2);g.fill()}
const WARES89={arms:['#c9d0d6','#8a5a32','#b8322a'],armor:['#b8b2a2','#c99a3a','#7a2230'],fruit:['#d65a2a','#e8b13a','#6a9a2a','#a8282a'],pots:['#b86a3a','#c98a54','#9a5230'],bread:['#d8a45a','#c08840','#e6c080']};
function drawStall89(g,B,S){const R0=B.r0-0.5,R1=B.r1+0.5,C0=B.c0-0.5,C1=B.c1+0.5;const T=CITY.TW;const rnd=rng89(hash89(B.k+(CITY.L?CITY.L.n:'')));
  const D=CITY_DRESS[CITY.L&&CITY.L.n]||{};const cA=B.k==='arms'?(D.aw||'#7a2230'):B.k==='armor'?'#2a7fa6':AWN89[Math.floor(rnd()*AWN89.length)];
  /* back poles, counter, goods, front poles, the awning */
  pole89(g,P89(R0+0.12,C0+0.1,0),B.h+0.3);pole89(g,P89(R0+0.12,C1-0.1,0),B.h+0.3);
  box89(g,R0+0.25,R1-0.15,C0+0.1,C1-0.1,0,0.42,'#9a6a3c',{fl:0.92,fr:0.62});
  {const F=FR89(R1-0.15);for(let s=C0+0.25;s<C1-0.1;s+=0.25)fp89(g,F,[[s,0.04],[s+0.02,0.04],[s+0.02,0.38],[s,0.38]],'rgba(50,30,15,.35)')}
  const W=WARES89[B.ware]||WARES89.fruit;
  if(B.ware==='arms'){for(let i=0;i<5;i++){const p=P89(R0+0.55,C0+0.3+i*0.32,0.42);g.strokeStyle='#d9dee2';g.lineWidth=Math.max(1,T*0.025);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+T*0.04,p.y-T*0.42);g.stroke();g.strokeStyle='#8a5a32';g.lineWidth=Math.max(1.5,T*0.04);g.beginPath();g.moveTo(p.x-T*0.05,p.y-T*0.02);g.lineTo(p.x+T*0.05,p.y-T*0.04);g.stroke()}
    for(let i=0;i<2;i++){const p=P89(R1-0.3,C0+0.5+i*0.9,0.42);g.fillStyle=i?'#b8322a':'#c9a54a';g.beginPath();g.ellipse(p.x,p.y-T*0.12,T*0.1,T*0.12,0,0,Math.PI*2);g.fill();g.strokeStyle='#e6c56a';g.lineWidth=1;g.stroke()}}
  else if(B.ware==='armor'){for(let i=0;i<4;i++){const p=P89(R0+0.6,C0+0.35+i*0.4,0.42);g.fillStyle=i%2?'#c99a3a':'#b8b2a2';g.beginPath();g.ellipse(p.x,p.y-T*0.08,T*0.08,T*0.09,0,Math.PI,0);g.fill();g.fillRect(p.x-T*0.08,p.y-T*0.08,T*0.16,T*0.05);g.fillStyle='#a8312a';g.fillRect(p.x-T*0.012,p.y-T*0.24,T*0.024,T*0.08)}
    for(let i=0;i<2;i++){const p=P89(R1-0.28,C0+0.55+i*0.85,0.42);g.fillStyle='#7a2230';g.beginPath();g.roundRect(p.x-T*0.09,p.y-T*0.3,T*0.18,T*0.3,T*0.04);g.fill();g.strokeStyle='#e6c56a';g.lineWidth=1;g.stroke()}}
  else if(B.ware==='pots'){for(let i=0;i<6;i++){const p=P89(R0+0.45+(i%2)*0.35,C0+0.3+Math.floor(i/2)*0.55,0.42);const c=W[i%W.length];g.fillStyle=c;g.beginPath();g.ellipse(p.x,p.y-T*0.12,T*0.06,T*0.1,0,0,Math.PI*2);g.fill();g.fillStyle=sh89(c,1.25);g.beginPath();g.ellipse(p.x-T*0.02,p.y-T*0.15,T*0.015,T*0.05,0,0,Math.PI*2);g.fill();g.fillStyle=sh89(c,0.7);g.fillRect(p.x-T*0.02,p.y-T*0.26,T*0.04,T*0.05)}}
  else{for(let i=0;i<14;i++){const p=P89(R0+0.4+rnd()*0.55,C0+0.25+rnd()*(C1-C0-0.5),0.42);const c=W[Math.floor(rnd()*W.length)];g.fillStyle=c;g.beginPath();g.ellipse(p.x,p.y-T*0.04,T*(B.ware==='bread'?0.07:0.045),T*(B.ware==='bread'?0.04:0.04),0,0,Math.PI*2);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(p.x-T*0.015,p.y-T*0.055,T*0.012,0,Math.PI*2);g.fill()}
    for(let i=0;i<2;i++){const p=P89(R1+0.05,C0+0.4+i*1.0,0);g.fillStyle='#8a5a32';g.fillRect(p.x-T*0.1,p.y-T*0.14,T*0.2,T*0.14);g.fillStyle=W[i];g.beginPath();g.ellipse(p.x,p.y-T*0.14,T*0.09,T*0.04,0,0,Math.PI*2);g.fill()}}
  pole89(g,P89(R1+0.05,C0+0.1,0),B.h-0.25);pole89(g,P89(R1+0.05,C1-0.1,0),B.h-0.25);
  awning89(g,'r',R0+0.12,C0-0.05,C1+0.05,B.h+0.3,B.h-0.28,(R1+0.1)-(R0+0.12),[cA,'#f1e6cf'])}
function drawYard89(g,B,S){const R0=B.r0-0.5,R1=B.r1+0.5,C0=B.c0-0.5,C1=B.c1+0.5;const T=CITY.TW;
  /* raked sand */
  {const q=[P89(R0,C0,0),P89(R0,C1,0),P89(R1,C1,0),P89(R1,C0,0)];const m=lerp89(q[0],q[2],0.5);const sg=g.createRadialGradient(m.x-T,m.y-T*0.5,T*0.3,m.x,m.y,T*4);sg.addColorStop(0,'#ecd6a6');sg.addColorStop(1,'#d2b47c');poly89(g,q,sg);
   const rnd=rng89(77);g.fillStyle='rgba(140,105,55,.22)';for(let i=0;i<260;i++){const p=P89(R0+rnd()*(R1-R0),C0+rnd()*(C1-C0),0);g.fillRect(p.x,p.y,1.2,1.2)}
   g.strokeStyle='rgba(160,125,70,.18)';g.lineWidth=1;for(let i=0;i<9;i++){const r=R0+0.6+rnd()*(R1-R0-1.2),c=C0+0.6+rnd()*(C1-C0-1.2);const p=P89(r,c,0);g.beginPath();g.ellipse(p.x,p.y,T*(0.25+rnd()*0.3),T*(0.1+rnd()*0.1),0,Math.PI*0.1,Math.PI*0.9);g.stroke()}
   for(let i=0;i<5;i++){const p=P89(R0+0.8+rnd()*(R1-R0-1.6),C0+0.8+rnd()*(C1-C0-1.6),0);g.fillStyle='rgba(120,90,50,.18)';g.beginPath();g.ellipse(p.x,p.y,T*0.08,T*0.035,0,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(p.x+T*0.12,p.y+T*0.05,T*0.08,T*0.035,0,0,Math.PI*2);g.fill()}}
  /* the far fence (back sides) */
  const fence=(a,b,n)=>{for(let i=0;i<=n;i++){const p=lerp89(a,b,i/n);g.fillStyle='#6b4a2a';g.fillRect(p.x-T*0.025,p.y-T*0.32,T*0.05,T*0.32)}
    for(const h of [0.12,0.26]){g.strokeStyle='#8a6038';g.lineWidth=Math.max(1.2,T*0.035);g.beginPath();g.moveTo(a.x,a.y-T*h);g.lineTo(b.x,b.y-T*h);g.stroke()}};
  fence(P89(R0,C0,0),P89(R0,C1,0),8);fence(P89(R0,C0,0),P89(R1,C0,0),9);
  /* palus posts, a dummy, a weapon rack */
  for(const [r,c] of [[R0+1.0,C0+1.1],[R0+1.0,C0+3.8],[R0+3.2,C0+1.0]]){const p=P89(r,c,0);g.fillStyle='rgba(60,40,20,.25)';g.beginPath();g.ellipse(p.x+T*0.12,p.y,T*0.16,T*0.05,0,0,Math.PI*2);g.fill();
    const gr=g.createLinearGradient(p.x-T*0.06,0,p.x+T*0.06,0);gr.addColorStop(0,'#9a7048');gr.addColorStop(1,'#5a3a1e');g.fillStyle=gr;g.fillRect(p.x-T*0.06,p.y-T*0.72,T*0.12,T*0.72);g.fillStyle='#b88a58';g.beginPath();g.ellipse(p.x,p.y-T*0.72,T*0.06,T*0.025,0,0,Math.PI*2);g.fill()}
  {const p=P89(R0+4.6,C0+3.9,0);g.strokeStyle='#6b4a2a';g.lineWidth=Math.max(1.5,T*0.045);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x,p.y-T*0.8);g.moveTo(p.x-T*0.2,p.y-T*0.58);g.lineTo(p.x+T*0.2,p.y-T*0.58);g.stroke();
   g.fillStyle='#d8c08a';g.beginPath();g.ellipse(p.x,p.y-T*0.55,T*0.1,T*0.2,0,0,Math.PI*2);g.fill();g.beginPath();g.arc(p.x,p.y-T*0.86,T*0.08,0,Math.PI*2);g.fill();g.strokeStyle='rgba(120,90,40,.5)';g.lineWidth=1;g.stroke()}
  {const a=P89(R0+0.35,C0+2.1,0),b=P89(R0+0.35,C0+3.1,0);g.strokeStyle='#6b4a2a';g.lineWidth=Math.max(1.5,T*0.04);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(a.x,a.y-T*0.55);g.lineTo(b.x,b.y-T*0.55);g.lineTo(b.x,b.y);g.stroke();
   for(let i=1;i<6;i++){const p=lerp89(a,b,i/6);g.strokeStyle=i%2?'#c9d0d6':'#8a6038';g.lineWidth=Math.max(1,T*0.025);g.beginPath();g.moveTo(p.x-T*0.04,p.y-T*0.05);g.lineTo(p.x+T*0.02,p.y-T*0.7);g.stroke()}}
  /* a shade cloth in the back corner */
  pole89(g,P89(R0+0.15,C1-0.15,0),1.2);pole89(g,P89(R0+1.4,C1-0.15,0),1.0);pole89(g,P89(R0+0.15,C1-1.4,0),1.0);
  poly89(g,[P89(R0+0.15,C1-0.15,1.2),P89(R0+1.4,C1-0.15,1.0),P89(R0+1.4,C1-1.4,0.9),P89(R0+0.15,C1-1.4,1.0)],'rgba(239,227,200,.92)','rgba(120,90,50,.4)',1)}
function drawYardFront89(g,B){const R0=B.r0-0.5,R1=B.r1+0.5,C0=B.c0-0.5,C1=B.c1+0.5;const T=CITY.TW;
  const fence=(a,b,n,gap)=>{for(let i=0;i<=n;i++){if(gap&&i>=gap[0]&&i<=gap[1])continue;const p=lerp89(a,b,i/n);g.fillStyle='#5a3a1e';g.fillRect(p.x-T*0.025,p.y-T*0.32,T*0.05,T*0.32)}
    for(const h of [0.12,0.26]){g.strokeStyle='#8a6038';g.lineWidth=Math.max(1.2,T*0.035);if(gap){const a2=lerp89(a,b,(gap[0]-1)/n),b2=lerp89(a,b,(gap[1]+1)/n);g.beginPath();g.moveTo(a.x,a.y-T*h);g.lineTo(a2.x,a2.y-T*h);g.moveTo(b2.x,b2.y-T*h);g.lineTo(b.x,b.y-T*h);g.stroke()}else{g.beginPath();g.moveTo(a.x,a.y-T*h);g.lineTo(b.x,b.y-T*h);g.stroke()}}};
  fence(P89(R1,C0,0),P89(R1,C1,0),8,[3,5]);fence(P89(R0,C1,0),P89(R1,C1,0),9)}
function drawFountain89(g,B,S){const T=CITY.TW;const c=P89((B.r0+B.r1)/2,(B.c0+B.c1)/2,0);const rx=T*0.95,ry=rx*0.5,hh=T*0.2;const M=S.marble;
  g.fillStyle=sh89(M,0.62);g.beginPath();g.ellipse(c.x,c.y,rx,ry,0,0,Math.PI);g.lineTo(c.x-rx,c.y-hh);g.ellipse(c.x,c.y-hh,rx,ry,0,Math.PI,0,true);g.closePath();g.fill();
  const sg=g.createLinearGradient(c.x-rx,0,c.x+rx,0);sg.addColorStop(0,sh89(M,0.98));sg.addColorStop(0.5,sh89(M,0.8));sg.addColorStop(1,sh89(M,0.6));g.fillStyle=sg;g.beginPath();g.ellipse(c.x,c.y,rx,ry,0,0,Math.PI);g.lineTo(c.x-rx,c.y-hh);g.lineTo(c.x+rx,c.y-hh);g.closePath();g.fill();
  g.fillStyle=sh89(M,1.05);g.beginPath();g.ellipse(c.x,c.y-hh,rx,ry,0,0,Math.PI*2);g.fill();
  const wg=g.createLinearGradient(0,c.y-hh-ry,0,c.y-hh+ry);wg.addColorStop(0,'#3f7f9e');wg.addColorStop(1,'#78b4c8');g.fillStyle=wg;g.beginPath();g.ellipse(c.x,c.y-hh,rx*0.86,ry*0.84,0,0,Math.PI*2);g.fill();
  g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1;g.beginPath();g.ellipse(c.x-rx*0.2,c.y-hh+ry*0.15,rx*0.45,ry*0.35,0,Math.PI*1.1,Math.PI*1.7);g.stroke();
  /* the pedestal and the statue (a victor with a raised spear) */
  const px=c.x,py=c.y-hh;const pg=g.createLinearGradient(px-T*0.14,0,px+T*0.14,0);pg.addColorStop(0,sh89(M,1.05));pg.addColorStop(1,sh89(M,0.62));g.fillStyle=pg;g.fillRect(px-T*0.14,py-T*0.55,T*0.28,T*0.55);
  g.fillStyle=sh89(M,1.1);g.fillRect(px-T*0.18,py-T*0.62,T*0.36,T*0.08);statue89(g,px,py-T*0.62,T*0.9,'#8a7a5a')}
function statue89(g,x,y,s,col){const lit=sh89(col,1.25),dk=sh89(col,0.6);
  g.fillStyle=dk;g.beginPath();g.moveTo(x-s*0.08,y);g.lineTo(x-s*0.02,y-s*0.4);g.lineTo(x+s*0.06,y);g.closePath();g.fill();
  g.fillStyle=col;g.beginPath();g.moveTo(x-s*0.1,y-s*0.36);g.quadraticCurveTo(x-s*0.12,y-s*0.62,x,y-s*0.7);g.quadraticCurveTo(x+s*0.12,y-s*0.62,x+s*0.09,y-s*0.36);g.closePath();g.fill();
  g.fillStyle=lit;g.beginPath();g.moveTo(x-s*0.1,y-s*0.36);g.quadraticCurveTo(x-s*0.12,y-s*0.62,x-s*0.01,y-s*0.7);g.lineTo(x-s*0.02,y-s*0.38);g.closePath();g.fill();
  g.beginPath();g.arc(x,y-s*0.77,s*0.065,0,Math.PI*2);g.fillStyle=col;g.fill();g.fillStyle=lit;g.beginPath();g.arc(x-s*0.02,y-s*0.785,s*0.04,0,Math.PI*2);g.fill();
  g.strokeStyle=col;g.lineWidth=Math.max(1.5,s*0.045);g.beginPath();g.moveTo(x+s*0.07,y-s*0.64);g.lineTo(x+s*0.18,y-s*0.92);g.stroke();
  g.strokeStyle=dk;g.lineWidth=Math.max(1,s*0.02);g.beginPath();g.moveTo(x+s*0.2,y-s*1.05);g.lineTo(x+s*0.16,y-s*0.2);g.stroke()}
function drawStatue89(g,B,S){const T=CITY.TW;const p=P89(B.r0,B.c0,0);box89(g,B.r0-0.22,B.r0+0.22,B.c0-0.22,B.c0+0.22,0,0.75,S.marble,{fl:0.95});statue89(g,p.x,p.y-0.75*T*ZK89,T*0.95,'#9a8a62')}
function drawCart89(g,B,S){const R0=B.r0-0.5,R1=B.r1+0.5,C0=B.c0-0.5,C1=B.c1+0.5;const T=CITY.TW;
  /* the mule in front (at the +c end) */
  const m=P89((R0+R1)/2,C1-0.15,0);g.fillStyle='rgba(40,25,10,.25)';g.beginPath();g.ellipse(m.x+T*0.1,m.y,T*0.3,T*0.08,0,0,Math.PI*2);g.fill();
  mule89(g,m.x,m.y,T,1,'#7a6450');
  box89(g,R0+0.2,R1-0.2,C0+0.1,C1-0.85,0.32,0.62,'#8a5a32',{fl:0.92,fr:0.6});
  for(let i=0;i<3;i++){const p=P89(R0+0.45+(i%2)*0.2,C0+0.35+i*0.22,0.62);g.fillStyle=i%2?'#d8c49a':'#c9b07a';g.beginPath();g.ellipse(p.x,p.y-T*0.08,T*0.1,T*0.09,0,0,Math.PI*2);g.fill();g.strokeStyle='rgba(90,60,30,.4)';g.lineWidth=1;g.stroke()}
  for(const c of [C0+0.35,C1-1.2]){const F=FR89(R1-0.18);const pts=[];for(let k=0;k<16;k++){const a=k/16*Math.PI*2;pts.push([c+Math.cos(a)*0.28,0.3+Math.sin(a)*0.28])}fp89(g,F,pts,'#5a3a1e','#3a2412',1.5);const h=F(c,0.3);g.fillStyle='#c9a458';g.beginPath();g.arc(h.x,h.y,T*0.03,0,Math.PI*2);g.fill()}
  {const a=P89((R0+R1)/2,C1-0.85,0.45),b=P89((R0+R1)/2,C1-0.3,0.35);g.strokeStyle='#6b4a2a';g.lineWidth=2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}}
function mule89(g,x,y,T,dir,col){g.save();g.translate(x,y);g.scale(dir,1);const lt=sh89(col,1.2);
  g.strokeStyle=sh89(col,0.6);g.lineWidth=Math.max(1.2,T*0.04);for(const lx of [-0.16,-0.1,0.1,0.16]){g.beginPath();g.moveTo(lx*T,-T*0.2);g.lineTo(lx*T,0);g.stroke()}
  g.fillStyle=col;g.beginPath();g.ellipse(0,-T*0.26,T*0.22,T*0.1,0,0,Math.PI*2);g.fill();g.fillStyle=lt;g.beginPath();g.ellipse(-T*0.03,-T*0.31,T*0.15,T*0.04,0,0,Math.PI*2);g.fill();
  g.fillStyle=col;g.beginPath();g.moveTo(T*0.16,-T*0.3);g.lineTo(T*0.27,-T*0.44);g.lineTo(T*0.33,-T*0.4);g.lineTo(T*0.24,-T*0.24);g.closePath();g.fill();
  g.beginPath();g.ellipse(T*0.32,-T*0.4,T*0.06,T*0.035,0.6,0,Math.PI*2);g.fill();g.beginPath();g.moveTo(T*0.25,-T*0.45);g.lineTo(T*0.24,-T*0.56);g.lineTo(T*0.28,-T*0.46);g.fill();
  g.strokeStyle=sh89(col,0.5);g.lineWidth=1;g.beginPath();g.moveTo(-T*0.22,-T*0.27);g.lineTo(-T*0.27,-T*0.15);g.stroke();g.restore()}
function tree89(g,x,y,T,kind,haze){const hz=haze||0;const H=(c)=>hz?mix89(c,'#c8d0c8',hz):c;
  if(kind==='cypress'){const h=T*1.5,w=T*0.2;const gr=g.createLinearGradient(x-w,0,x+w,0);gr.addColorStop(0,H('#4f6b34'));gr.addColorStop(0.5,H('#2f4a24'));gr.addColorStop(1,H('#1e3018'));
    g.fillStyle=gr;g.beginPath();g.moveTo(x,y-h);g.bezierCurveTo(x+w*1.2,y-h*0.6,x+w*1.1,y-h*0.15,x+w*0.4,y);g.lineTo(x-w*0.4,y);g.bezierCurveTo(x-w*1.1,y-h*0.15,x-w*1.2,y-h*0.6,x,y-h);g.fill();
    g.strokeStyle=H('#5f7f40');g.lineWidth=1;for(let k=1;k<6;k++){g.beginPath();g.moveTo(x-w*0.5,y-h*k/6);g.lineTo(x-w*0.1,y-h*k/6-T*0.05);g.stroke()}return}
  if(kind==='palm'){g.strokeStyle=H('#7a5a3a');g.lineWidth=Math.max(1.5,T*0.06);g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+T*0.1,y-T*0.7,x-T*0.05,y-T*1.3);g.stroke();
    const tx=x-T*0.05,ty=y-T*1.3;for(let k=0;k<8;k++){const a=-Math.PI*0.95+k/7*Math.PI*1.9;g.strokeStyle=H(k%2?'#4f7a2a':'#3a6020');g.lineWidth=Math.max(1.5,T*0.05);g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo(tx+Math.cos(a)*T*0.3,ty-T*0.18,tx+Math.cos(a)*T*0.55,ty+Math.abs(Math.sin(a))*T*0.1+T*0.12);g.stroke()}return}
  /* umbrella pine */
  g.strokeStyle=H('#6a4a2e');g.lineWidth=Math.max(1.5,T*0.06);g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x-T*0.12,y-T*0.6,x+T*0.04,y-T*1.05);g.stroke();
  const cx=x+T*0.04,cy=y-T*1.12;for(const [dx,dy,rx,ry,c] of [[0,0.04,0.55,0.16,'#2c4a22'],[-0.18,-0.02,0.32,0.13,'#3e6230'],[0.2,0,0.3,0.12,'#34562a'],[-0.08,-0.08,0.28,0.1,'#557a3a']]){g.fillStyle=H(c);g.beginPath();g.ellipse(cx+dx*T,cy+dy*T,rx*T,ry*T,0,0,Math.PI*2);g.fill()}}
function drawTree89(g,B,S){const T=CITY.TW;const p=P89(B.r0,B.c0,0);const V=CV89[CITY.L.n]||{};tree89(g,p.x,p.y,T,V.tree||'cypress')}
function drawAltar89(g,B,S){box89(g,B.r0-0.22,B.r0+0.22,B.c0-0.28,B.c0+0.28,0,0.45,S.marble,{fl:0.95});box89(g,B.r0-0.26,B.r0+0.26,B.c0-0.32,B.c0+0.32,0.45,0.52,sh89(S.marble,1.02),{fl:0.95});
  {const p=P89(B.r0,B.c0,0.52);const T=CITY.TW;g.fillStyle='#3a2a1a';g.beginPath();g.ellipse(p.x,p.y,T*0.12,T*0.05,0,0,Math.PI*2);g.fill()}}

/* ---------------- the amphitheatre ---------------- */
function drawArena89(g,S){const A=ARENA89,T=CITY.TW;const pt=(t,f,z)=>UV89(A.u0+A.a*f*Math.cos(t),A.v0+A.b*f*Math.sin(t),z);const H=A.H;
  const trav='#dccdaa',D=CITY_DRESS[CITY.L.n]||{};
  const ell=(f,z,fill)=>{const c=UV89(A.u0,A.v0,z);g.fillStyle=fill;g.beginPath();g.ellipse(c.x,c.y,A.a*f*T/2,A.b*f*T/4,0,0,Math.PI*2);g.fill()};
  /* the cavea: rings of seats from the rim down to the sand */
  ell(1.0,H,sh89(trav,1.0));
  const K=11;for(let k=0;k<K;k++){const t=k/K;const f=0.96-t*0.42,z=H-0.12-t*(H-0.75);ell(f,z,sh89(k%2?'#cdbd98':'#bfae88',0.95-t*0.12));
    if(k%4===3){ell(f-0.005,z+0.04,'rgba(120,100,70,.35)')}}
  ell(0.52,0.72,'#8a7458');ell(0.5,0.7,'#d9bf86');
  /* the crowd on the far tiers */
  {const rnd=rng89(hash89('crowd'+CITY.L.n));const cols=['#b8322a','#e9dfc8','#2a7fa6','#d9a224','#6a5a48','#a86a2a','#f2ead8','#7d3f98'];
   for(let i=0;i<900;i++){const t=Math.PI+rnd()*Math.PI;const k=rnd();const f=0.95-k*0.4,z=H-0.15-k*(H-0.8);const p=pt(t,f,z);if(rnd()<0.35)continue;g.fillStyle=cols[Math.floor(rnd()*cols.length)];g.fillRect(p.x,p.y-T*0.035,Math.max(1,T*0.03),Math.max(1,T*0.035))}}
  /* radial aisles */
  g.strokeStyle='rgba(90,70,45,.35)';g.lineWidth=1;for(let i=0;i<10;i++){const t=Math.PI+(i+0.5)/10*Math.PI;const a=pt(t,0.97,H-0.1),b=pt(t,0.56,0.8);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
  /* the far rim and its masts */
  for(let i=0;i<14;i++){const t=Math.PI+(i+0.5)/14*Math.PI;const p=pt(t,1,H);pole89(g,p,0.5,'#7a6a52')}
  /* the outer wall, lit by its facing */
  const n=72;for(let i=0;i<n;i++){const t0=i/n*Math.PI,t1=(i+1)/n*Math.PI;const tm=(t0+t1)/2;
    const nu=Math.cos(tm)/A.a,nv=Math.sin(tm)/A.b;const dc=(nu+nv)/2,dr=(nv-nu)/2;const L=Math.hypot(dc,dr)||1;const lam=(dr*SUN89.r+dc*SUN89.c)/L;const f=0.74+0.3*lam;
    const b0=pt(t0,1,0),b1=pt(t1,1,0),u0=pt(t0,1,H),u1=pt(t1,1,H);const gr=g.createLinearGradient(0,b0.y,0,u0.y);gr.addColorStop(0,sh89(trav,f*0.7));gr.addColorStop(0.12,sh89(trav,f*0.95));gr.addColorStop(1,sh89(trav,f*1.04));
    g.fillStyle=gr;g.beginPath();g.moveTo(b0.x,b0.y);g.lineTo(b1.x+0.4,b1.y);g.lineTo(u1.x+0.4,u1.y);g.lineTo(u0.x,u0.y);g.closePath();g.fill()}
  /* three arcades and the attic */
  const na=44,tiers=[[0,1.0],[1.0,2.0],[2.0,3.0]];
  for(let i=0;i<na;i++){const tm=(i+0.5)/na*Math.PI*2;if(tm<=0.02||tm>=Math.PI-0.02)continue;const dt=Math.PI*2/na;const tl=tm-dt*0.3,tr=tm+dt*0.3;
    const nu=Math.cos(tm)/A.a,nv=Math.sin(tm)/A.b;const dc=(nu+nv)/2,dr=(nv-nu)/2;const lam=(dr*SUN89.r+dc*SUN89.c)/(Math.hypot(dc,dr)||1);
    const gate=Math.abs(tm-A.tg)<dt*0.5;
    tiers.forEach(([z0,z1],ti)=>{const zs=z0+(z1-z0)*(ti?0.5:0.48),zc=z0+(z1-z0)*0.84;const pts=[pt(tl,1,z0+(ti?0.12:0)),pt(tr,1,z0+(ti?0.12:0)),pt(tr,1,zs)];for(let k=1;k<8;k++){const a=k/8;pts.push(pt(tr+(tl-tr)*a,1,zs+(zc-zs)*Math.sin(a*Math.PI)))}pts.push(pt(tl,1,zs));
      const inner=ti===0&&gate?'#1a120c':lam>0?'#5a4632':'#3e3024';poly89(g,pts,inner);
      if(ti>0){const m=pt(tm,1,z0+0.12);const lit=pt(tm,0.94,zs);g.fillStyle='rgba(255,230,180,.08)';g.fillRect(m.x-1,lit.y,2,m.y-lit.y)}
      /* half-columns between arches */
      const pc=pt(tm+dt*0.5,1,z0),pq=pt(tm+dt*0.5,1,z1);g.strokeStyle=sh89(trav,0.78+0.25*lam+0.25);g.lineWidth=Math.max(1,T*0.035);g.beginPath();g.moveTo(pc.x,pc.y);g.lineTo(pq.x,pq.y);g.stroke();
      g.strokeStyle='rgba(60,45,30,.25)';g.lineWidth=1;g.beginPath();g.moveTo(pc.x+T*0.025,pc.y);g.lineTo(pq.x+T*0.025,pq.y);g.stroke()});
    if(i%2===0){const w0=pt(tm-dt*0.18,1,3.35),w1=pt(tm+dt*0.18,1,3.35),w2=pt(tm+dt*0.18,1,3.62),w3=pt(tm-dt*0.18,1,3.62);poly89(g,[w0,w1,w2,w3],lam>0?'#5a4632':'#3e3024')}}
  /* cornices */
  for(const z of [1.0,2.0,3.0,H]){g.lineWidth=Math.max(1.2,T*0.045);g.strokeStyle='rgba(255,248,230,.55)';g.beginPath();for(let k=0;k<=48;k++){const p=pt(k/48*Math.PI,1.006,z);k?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)}g.stroke();
    g.lineWidth=1;g.strokeStyle='rgba(60,45,30,.35)';g.beginPath();for(let k=0;k<=48;k++){const p=pt(k/48*Math.PI,1.006,z-0.06);k?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y)}g.stroke()}
  /* the gate: a deep arch with a gilded frame and a portcullis */
  {const dt=Math.PI*2/na,tl=A.tg-dt*0.42,tr=A.tg+dt*0.42;const pts=[pt(tl,1.01,0),pt(tr,1.01,0),pt(tr,1.01,0.62)];for(let k=1;k<10;k++){const a=k/10;pts.push(pt(tr+(tl-tr)*a,1.01,0.62+0.34*Math.sin(a*Math.PI)))}pts.push(pt(tl,1.01,0.62));
   poly89(g,pts,'#140e09','#d4ae5c',Math.max(1.5,T*0.05));g.strokeStyle='rgba(120,100,80,.6)';g.lineWidth=1;for(let k=1;k<6;k++){const a=pt(tl+(tr-tl)*k/6,1.01,0.02),b=pt(tl+(tr-tl)*k/6,1.01,0.9);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
   for(let z=0.2;z<0.9;z+=0.2){g.beginPath();const a=pt(tl,1.01,z),b=pt(tr,1.01,z);g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}}
  /* the editor's balcony (pulvinar) with a canopy in the city's colours */
  {const tb=A.tg-0.38,dt=0.1;const a=pt(tb-dt,1.06,2.05),b=pt(tb+dt,1.06,2.05);const a2=pt(tb-dt,1.06,2.28),b2=pt(tb+dt,1.06,2.28);poly89(g,[a,b,b2,a2],sh89(trav,0.95),'rgba(60,45,30,.4)',1);
   const c1=pt(tb-dt*1.2,1.08,2.95),c2=pt(tb+dt*1.2,1.08,2.95);
   g.fillStyle=D.aw||'#7a2230';g.beginPath();g.moveTo(c1.x,c1.y);g.lineTo(c2.x,c2.y);g.lineTo(c2.x,c2.y+T*0.12);g.quadraticCurveTo((c1.x+c2.x)/2,(c1.y+c2.y)/2+T*0.28,c1.x,c1.y+T*0.12);g.closePath();g.fill();
   g.strokeStyle='#d4ae5c';g.lineWidth=1;g.stroke();for(const p of [a2,b2]){g.strokeStyle='#d4ae5c';g.lineWidth=1.5;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x,p.y-T*0.35);g.stroke()}
   CITY.balc89={x:(a2.x+b2.x)/2,y:(a2.y+b2.y)/2}}
  /* banners on the rim */
  {const cs=[D.aw||'#7a2230','#d9a224'];for(let i=0;i<9;i++){const t=0.2+i/8*(Math.PI-0.4);const p=pt(t,1,H);pole89(g,p,0.85,'#6a5a42');const q=pt(t,1,H+0.85);g.fillStyle=cs[i%2];g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x+T*0.24,q.y+T*0.05);g.lineTo(q.x,q.y+T*0.14);g.closePath();g.fill()}}
  /* hanging banners between the upper arches */
  {const cs=[D.aw||'#7a2230','#2a7fa6','#d9a224','#26907f'];for(let i=0;i<7;i++){const t=0.35+i/6*(Math.PI-0.7);const a=pt(t,1.01,2.95),b=pt(t,1.01,2.35);const w=T*0.09;g.fillStyle=cs[i%cs.length];g.beginPath();g.moveTo(a.x-w,a.y);g.lineTo(a.x+w,a.y);g.lineTo(b.x+w,b.y);g.lineTo(b.x,b.y+T*0.06);g.lineTo(b.x-w,b.y);g.closePath();g.fill()}}}

/* ---------------- the city around the square ---------------- */
/* outer89 — the ring of houses around the square (blocks between streets), seeded by the city name */
function outer89(seed){const rnd=rng89(seed);const out=[];const N=N89;
  const add=(r0,r1,c0,c1,front)=>{const A=ARENA89;for(const [r,c] of [[r0,c0],[r1,c1],[r0,c1],[r1,c0],[(r0+r1)/2,(c0+c1)/2]]){const u=c-r,v=c+r;if(((u-A.u0)/(A.a+0.6))**2+((v-A.v0)/(A.b+0.6))**2<=1)return}
    const big=rnd()<0.12;out.push({r0,r1,c0,c1,h:big?2.4+rnd()*0.6:1.0+rnd()*1.1,front,kind:big&&rnd()<0.35?'temple':'house',axis:rnd()<0.5?'r':'c',roof:rnd()<0.3?'gable':'hip',wi:Math.floor(rnd()*6),seed:Math.floor(rnd()*1e9)})};
  const block=(r0,r1,c0,c1,front)=>{if(r1-r0>=2&&rnd()<0.55){const m=r0+1+Math.floor(rnd()*(r1-r0-1));add(r0,m-1,c0,c1,front);add(m,r1,c0,c1,front)}else if(c1-c0>=2&&rnd()<0.55){const m=c0+1+Math.floor(rnd()*(c1-c0-1));add(r0,r1,c0,m-1,front);add(r0,r1,m,c1,front)}else add(r0,r1,c0,c1,front)};
  for(const r0 of [-4,-8,-12])for(let c0=-12;c0<N+14;c0+=4)block(r0,r0+2,c0,c0+2,false);
  for(const c0 of [-4,-8,-12])for(let r0=-1;r0<N+14;r0+=4)block(r0,r0+2,c0,c0+2,false);
  /* the front: across a street from the square */
  for(let c0=-3;c0<N+10;c0+=4)block(N+1,N+3,c0,c0+2,true);
  for(let r0=-3;r0<N+1;r0+=4)block(r0,r0+2,N+1,N+3,true);
  return out}
function drawOuterHouse89(g,O,S,haze,yH){const R0=O.r0-0.5,R1=O.r1+0.5,C0=O.c0-0.5,C1=O.c1+0.5;const rnd=rng89(O.seed);
  const H=(c)=>haze>0?mix89(c,S.haze,haze):c;const wall=H(S.walls[O.wi%S.walls.length]);const roofC=H(S.roof);
  if(P89(R1,C1,0).y<yH)return;
  if(O.kind==='temple'){const M=H(S.marble);box89(g,R0,R1,C0,C1,0,0.3,H(S.stone),{edge:false});
    const cw=CITY.TW*0.1;for(let c=C0+0.2;c<=C1-0.15;c+=0.5)column89(g,P89(R1-0.2,c,0.3),O.h-0.6,cw,M);
    box89(g,R0+0.1,R1-0.6,C0+0.25,C1-0.25,0.3,O.h-0.3,M,{fl:0.78,fr:0.6,top:false,edge:false});
    for(let r=R1-0.7;r>R0;r-=0.5)column89(g,P89(r,C1-0.15,0.3),O.h-0.6,cw,M);
    box89(g,R0,R1,C0,C1,O.h-0.3,O.h,M,{edge:false});roof89(g,R0,R1,C0,C1,O.h,{type:'gable',axis:'r',rise:(C1-C0)/2*0.4,col:roofC,wall:M,tex:haze<0.5});return}
  box89(g,R0,R1,C0,C1,0,O.h,wall,{top:false,edge:haze<0.5});
  const floors=Math.max(1,Math.floor(O.h/0.85));const shut=rnd()<0.5?H('#4f6b34'):H('#6b4a2a');
  for(let f=0;f<floors;f++){const z=0.35+f*0.85;if(z+0.35>O.h)break;
    for(let s=C0+0.35;s<C1-0.2;s+=0.6)if(rnd()<0.75)window89(g,FR89(R1),s,z,0.2,0.3,{dark:H('#2e2018'),shut:f&&rnd()<0.4?shut:null});
    for(let s=R1-0.35;s>R0+0.2;s-=0.6)if(rnd()<0.75)window89(g,FC89(C1),s,z,0.2,0.3,{dark:H('#241a12')})}
  if(O.front&&rnd()<0.5)awning89(g,'r',R1,C0+0.2,C1-0.2,0.85,0.6,0.35,[H(AWN89[O.wi%AWN89.length]),H('#efe3c8')]);
  if(S===ST89.afr&&rnd()<0.5)roof89(g,R0,R1,C0,C1,O.h,{type:'flat',wall});else roof89(g,R0,R1,C0,C1,O.h,{type:O.roof,axis:O.axis,rise:0.5+rnd()*0.25,col:roofC,wall,tex:haze<0.55})}

/* ---------------- the panorama: sky, far land, the city's character ---------------- */
function ridge89(g,W,base,amp,seed,col,sharp){const rnd=rng89(seed);const ph=[rnd()*6,rnd()*6,rnd()*6];g.fillStyle=col;g.beginPath();g.moveTo(0,base+400);
  for(let x=0;x<=W;x+=4){let y=Math.sin(x/W*3.1+ph[0])*0.5+Math.sin(x/W*7.3+ph[1])*0.3+Math.sin(x/W*15+ph[2])*0.12;if(sharp)y=Math.abs(Math.sin(x/W*9+ph[0]))*0.8+Math.abs(Math.sin(x/W*21+ph[1]))*0.25;g.lineTo(x,base-amp*(0.5+y*0.6))}g.lineTo(W,base+400);g.closePath();g.fill()}
function drawPanorama89(g,W,H,yH,S,V,seed){const T=CITY.TW;const rnd=rng89(seed);const F=new Set(V.f||[]);
  const sky=g.createLinearGradient(0,0,0,yH+T*0.6);sky.addColorStop(0,S.sky[0]);sky.addColorStop(0.7,mix89(S.sky[0],S.sky[1],0.6));sky.addColorStop(1,S.sky[1]);g.fillStyle=sky;g.fillRect(0,0,W,H);
  const sun=g.createRadialGradient(W*0.08,-H*0.02,0,W*0.08,-H*0.02,W*0.55);sun.addColorStop(0,'rgba(255,246,214,.75)');sun.addColorStop(0.4,'rgba(255,236,190,.25)');sun.addColorStop(1,'rgba(255,236,190,0)');g.fillStyle=sun;g.fillRect(0,0,W,H);
  /* clouds */
  for(let i=0;i<7;i++){const cx=rnd()*W,cy=yH*(0.1+rnd()*0.5),s=T*(0.8+rnd()*1.4);for(let k=0;k<9;k++){const dx=(rnd()-0.5)*s*2.6,dy=(rnd()-0.5)*s*0.35;const rx=s*(0.35+rnd()*0.45),ry=rx*0.45;
      g.fillStyle='rgba(205,208,214,.35)';g.beginPath();g.ellipse(cx+dx+s*0.06,cy+dy+ry*0.35,rx,ry,0,0,Math.PI*2);g.fill();g.fillStyle='rgba(255,253,246,.62)';g.beginPath();g.ellipse(cx+dx,cy+dy,rx,ry,0,0,Math.PI*2);g.fill()}}
  const haze=S.haze;
  if(F.has('alps')){ridge89(g,W,yH-T*0.6,T*2.6,seed+1,mix89('#8d9db4',haze,0.35),true);
    g.save();g.globalCompositeOperation='source-atop';g.restore()}
  if(F.has('volcano')||F.has('volcano0')){const big=F.has('volcano');const vx=W*(big?0.22:0.3),vb=yH+T*0.1,vh=T*(big?2.5:1.3),vw=T*(big?4.2:2.4);
    if(big){for(let k=0;k<14;k++){const t=k/14;g.fillStyle=`rgba(${190-k*3},${186-k*3},${180-k*3},${0.42*(1-t)})`;g.beginPath();g.ellipse(vx+t*T*2.6+Math.sin(k)*T*0.2,vb-vh-T*0.15-t*T*1.6,T*(0.25+t*0.9),T*(0.18+t*0.4),0,0,Math.PI*2);g.fill()}}
    const vg=g.createLinearGradient(vx-vw,0,vx+vw,0);vg.addColorStop(0,mix89('#8a8478',haze,0.25));vg.addColorStop(0.45,mix89('#9a9284',haze,0.3));vg.addColorStop(1,mix89('#6a665e',haze,0.35));g.fillStyle=vg;
    g.beginPath();g.moveTo(vx-vw,vb);g.quadraticCurveTo(vx-vw*0.35,vb-vh*0.55,vx-vw*0.13,vb-vh);g.lineTo(vx+vw*0.1,vb-vh*0.97);g.quadraticCurveTo(vx+vw*0.4,vb-vh*0.5,vx+vw,vb);g.closePath();g.fill();
    g.strokeStyle='rgba(80,70,60,.25)';g.lineWidth=1;for(let k=0;k<6;k++){const x0=vx-vw*0.1+k*vw*0.04;g.beginPath();g.moveTo(x0,vb-vh*0.95);g.quadraticCurveTo(x0+(k-2.5)*vw*0.08,vb-vh*0.5,x0+(k-2.5)*vw*0.22,vb);g.stroke()}}
  if(F.has('hills')||F.has('hills0'))ridge89(g,W,yH-T*0.1,T*(F.has('hills0')?0.9:1.6),seed+2,mix89(S.hill,haze,0.45));
  if(F.has('dunes')||F.has('dunes0')){ridge89(g,W,yH-T*0.05,T*0.9,seed+3,mix89('#e2c48e',haze,0.3));ridge89(g,W,yH+T*0.3,T*0.6,seed+4,mix89('#d8b67a',haze,0.25))}
  if(F.has('sea')){const sy=yH-T*0.5;const sg=g.createLinearGradient(0,sy,0,yH+T*1.5);sg.addColorStop(0,mix89('#5f95b8',haze,0.35));sg.addColorStop(1,'#4b86ab');g.fillStyle=sg;g.fillRect(0,sy,W*0.62,H);
    g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<70;i++){const x=rnd()*W*0.6,y=sy+rnd()*T*2;g.fillRect(x,y,T*(0.08+rnd()*0.2),1)}
    if(F.has('hills'))ridge89(g,W*0.3,sy+T*0.02,T*0.5,seed+9,mix89(S.hill,haze,0.55))}
  if(F.has('river')){g.strokeStyle=mix89('#6a9ab8',haze,0.3);g.lineWidth=T*0.18;g.beginPath();g.moveTo(-10,yH+T*0.1);g.bezierCurveTo(W*0.15,yH-T*0.2,W*0.3,yH+T*0.2,W*0.5,yH);g.stroke()}
  if(F.has('ships')){for(let i=0;i<4;i++){const x=W*(0.05+rnd()*0.45),y=yH-T*0.3+rnd()*T*0.6,s=T*(0.25+rnd()*0.2);g.fillStyle='#5a3a22';g.beginPath();g.moveTo(x-s,y);g.lineTo(x+s,y);g.lineTo(x+s*0.7,y+s*0.25);g.lineTo(x-s*0.7,y+s*0.25);g.closePath();g.fill();
    g.strokeStyle='#4a3020';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-s*1.4);g.stroke();g.fillStyle=i%2?'#efe3c8':'#d9b880';g.beginPath();g.moveTo(x-s*0.6,y-s*1.3);g.lineTo(x+s*0.6,y-s*1.3);g.quadraticCurveTo(x+s*0.7,y-s*0.7,x+s*0.55,y-s*0.35);g.lineTo(x-s*0.55,y-s*0.35);g.quadraticCurveTo(x-s*0.7,y-s*0.7,x-s*0.6,y-s*1.3);g.fill()}}
  if(F.has('crane')){for(const fx of [0.36,0.48]){const x=W*fx,y=yH+T*0.2;g.strokeStyle='#5a4028';g.lineWidth=Math.max(1.5,T*0.05);g.beginPath();g.moveTo(x,y);g.lineTo(x+T*0.5,y-T*1.8);g.lineTo(x+T*1.3,y-T*1.4);g.moveTo(x+T*0.5,y-T*1.8);g.lineTo(x+T*0.7,y);g.stroke();g.lineWidth=1;g.beginPath();g.moveTo(x+T*1.3,y-T*1.4);g.lineTo(x+T*1.3,y-T*0.6);g.stroke();g.beginPath();g.arc(x+T*0.35,y-T*0.25,T*0.25,0,Math.PI*2);g.stroke()}}
  if(F.has('aqueduct')){const y=yH-T*0.15,h=T*1.0;g.fillStyle=mix89('#cdb894',haze,0.4);g.fillRect(0,y-h,W*0.7,T*0.18);for(let x=-T*0.2;x<W*0.7;x+=T*0.46){g.fillRect(x,y-h,T*0.12,h)}
    g.fillStyle=mix89('#bfa880',haze,0.45);for(let x=0;x<W*0.7;x+=T*0.23)g.fillRect(x,y-h-T*0.32,T*0.07,T*0.32);g.fillRect(0,y-h-T*0.4,W*0.7,T*0.1)}
  /* the far city: a band of small roofs, trees and temples */
  const items=[];for(let i=0;i<420;i++){const x=rnd()*W*1.05-T*0.2,y=yH-T*0.2+rnd()*T*1.5;items.push({x,y,w:T*(0.25+rnd()*0.35),h:T*(0.18+rnd()*0.3),k:rnd()})}items.sort((a,b)=>a.y-b.y);
  for(const it of items){const fog=Math.max(0.15,0.55-(it.y-yH)/(T*1.5)*0.35);const wall=mix89(S.walls[Math.floor(it.k*S.walls.length)],haze,fog),roof=mix89(S.roof,haze,fog);
    if(it.k<0.08){g.fillStyle=mix89(V.tree==='palm'?'#5a7a3a':'#3e5a2e',haze,fog);g.beginPath();g.ellipse(it.x,it.y-it.h*0.8,it.w*0.3,it.h*0.9,0,0,Math.PI*2);g.fill();continue}
    g.fillStyle=wall;g.fillRect(it.x,it.y-it.h,it.w,it.h);g.fillStyle=sh89(wall,0.8);g.fillRect(it.x+it.w*0.6,it.y-it.h,it.w*0.4,it.h);
    if(S===ST89.afr&&it.k>0.6){g.fillStyle=sh89(wall,1.05);g.fillRect(it.x-1,it.y-it.h-2,it.w+2,2)}else{g.fillStyle=roof;g.beginPath();g.moveTo(it.x-it.w*0.08,it.y-it.h);g.lineTo(it.x+it.w*0.4,it.y-it.h-it.w*0.28);g.lineTo(it.x+it.w*1.08,it.y-it.h);g.closePath();g.fill()}}
  if(F.has('hilltemples')){for(const fx of [0.12,0.3]){const x=W*fx,y=yH-T*0.55;g.fillStyle=mix89('#efe7d6',haze,0.35);g.fillRect(x-T*0.5,y-T*0.45,T,T*0.45);g.fillStyle=mix89('#9a8a72',haze,0.4);for(let k=0;k<6;k++)g.fillRect(x-T*0.45+k*T*0.18,y-T*0.4,T*0.04,T*0.38);
    g.fillStyle=mix89(S.roof,haze,0.4);g.beginPath();g.moveTo(x-T*0.6,y-T*0.45);g.lineTo(x,y-T*0.75);g.lineTo(x+T*0.6,y-T*0.45);g.closePath();g.fill()}}}

/* ---------------- paving ---------------- */
function pave89(g,r,c,S,tone,slab,rnd){const T=CITY.TW;const base=sh89(S.pave,tone);
  poly89(g,[P89(r-0.5,c-0.5,0),P89(r-0.5,c+0.5,0),P89(r+0.5,c+0.5,0),P89(r+0.5,c-0.5,0)],sh89(base,0.72));
  if(slab){const n=2;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const a=r-0.5+i/n+0.025,b=c-0.5+j/n+0.025,s=1/n-0.05;const col=sh89(mix89(base,'#efe6d2',0.35),0.94+rnd()*0.12);
      poly89(g,[P89(a,b,0),P89(a,b+s,0),P89(a+s,b+s,0),P89(a+s,b,0)],col);g.strokeStyle='rgba(255,252,240,.35)';g.lineWidth=1;g.beginPath();const p=P89(a+s,b,0),q=P89(a,b,0),w=P89(a,b+s,0);g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.lineTo(w.x,w.y);g.stroke()}return}
  const n=T>36?3:2;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const cr=r-0.5+(i+0.5)/n+(rnd()-0.5)*0.06,cc=c-0.5+(j+0.5)/n+(rnd()-0.5)*0.06,hs=0.5/n-0.03;
    const q=[[cr-hs+(rnd()-0.5)*0.05,cc-hs+(rnd()-0.5)*0.05],[cr-hs+(rnd()-0.5)*0.05,cc+hs+(rnd()-0.5)*0.05],[cr+hs+(rnd()-0.5)*0.05,cc+hs+(rnd()-0.5)*0.05],[cr+hs+(rnd()-0.5)*0.05,cc-hs+(rnd()-0.5)*0.05]].map(([a,b])=>P89(a,b,0));
    const v=rnd();const col=v<0.18?sh89(mix89(base,'#a8a6a0',0.5),0.95+rnd()*0.1):sh89(base,0.9+rnd()*0.2);
    g.fillStyle=col;g.beginPath();for(let k=0;k<4;k++){const p=q[k],nq=q[(k+1)%4];const m={x:(p.x+nq.x)/2,y:(p.y+nq.y)/2};k?g.quadraticCurveTo(p.x,p.y,m.x,m.y):(g.moveTo((q[3].x+p.x)/2,(q[3].y+p.y)/2),g.quadraticCurveTo(p.x,p.y,m.x,m.y))}g.closePath();g.fill();
    g.strokeStyle='rgba(255,250,235,.28)';g.lineWidth=1;g.beginPath();g.moveTo((q[3].x+q[0].x)/2,(q[3].y+q[0].y)/2);g.quadraticCurveTo(q[0].x,q[0].y,(q[0].x+q[1].x)/2,(q[0].y+q[1].y)/2);g.stroke()}}
const SLAB89=(r,c)=>(r>=4&&r<=6&&c<=12)||(c>=11&&c<=12&&r>=2)||(r===16||r===15)&&c>=5&&c<=13;

/* ---------------- baking ---------------- */
const CB89={key:null};
function mkCanvas89(w,h){const dpr=CITY.dpr||1;const cv=document.createElement('canvas');cv.width=Math.max(1,Math.ceil(w*dpr));cv.height=Math.max(1,Math.ceil(h*dpr));return cv}
/* sprite89 — bake one piece into its own canvas (absolute screen coordinates inside), with a hit mask for clicks */
function sprite89(x0,y0,x1,y1,fn,mask){const dpr=CITY.dpr||1;const w=x1-x0,h=y1-y0;const cv=mkCanvas89(w,h);const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,-x0*dpr,-y0*dpr);fn(g);
  const S={cv,x:x0,y:y0,w,h};if(mask){try{const d=g.getImageData(0,0,cv.width,cv.height).data;const mw=Math.ceil(w/2),mh=Math.ceil(h/2);const m=new Uint8Array(mw*mh);
    for(let j=0;j<mh;j++)for(let i=0;i<mw;i++){const px=Math.min(cv.width-1,Math.floor(i*2*dpr)),py=Math.min(cv.height-1,Math.floor(j*2*dpr));m[j*mw+i]=d[(py*cv.width+px)*4+3]>70?1:0}S.mask=m;S.mw=mw;S.mh=mh}catch(e){}}
  return S}
function boxBounds89(B,extra){const T=CITY.TW;const R0=B.r0-0.5,R1=B.r1+0.5,C0=B.c0-0.5,C1=B.c1+0.5;const pad=T*0.9;
  return [P89(R1,C0,0).x-pad,P89(R0,C0,B.h+(extra||1.6)).y-pad,P89(R0,C1,0).x+pad,P89(R1,C1,0).y+pad*0.5]}
function drawPiece89(g,B,S){({temple:drawTemple89,rostra:drawRostra89,house:drawHouse89,bath:drawBath89,stall:drawStall89,yard:drawYard89,fountain:drawFountain89,cart:drawCart89,statue:drawStatue89,tree:drawTree89,altar:drawAltar89}[B.t]||(()=>{}))(g,B,S)}
/* shadow89 — a building's soft cast shadow and contact shading on the ground */
function shadow89(g,B){const R0=B.r0-0.5,R1=B.r1+0.5,C0=B.c0-0.5,C1=B.c1+0.5;let h=B.h;
  if(B.t==='tree'){const p=P89(B.r0+SH89.r*1.2,B.c0+SH89.c*1.2,0);g.fillStyle='#2e1e0e';g.beginPath();g.ellipse(p.x,p.y,CITY.TW*0.45,CITY.TW*0.18,0,0,Math.PI*2);g.fill();return}
  if(B.t==='yard')return;if(B.t==='stall')h=B.h*0.9;if(B.t==='fountain'||B.t==='statue'){const p=P89((B.r0+B.r1)/2+SH89.r*0.8,(B.c0+B.c1)/2+SH89.c*0.8,0);g.fillStyle='#2e1e0e';g.beginPath();g.ellipse(p.x,p.y,CITY.TW*(B.t==='fountain'?1.05:0.35),CITY.TW*(B.t==='fountain'?0.5:0.15),0,0,Math.PI*2);g.fill();return}
  if(B.t==='temple')h=B.h+0.6;if(B.t==='house')h=B.h+0.4;if(B.t==='bath')h=B.h+1.0;
  const base=[[R0,C0],[R0,C1],[R1,C1],[R1,C0]];const pts=[];for(const [r,c] of base){pts.push(P89(r,c,0));pts.push(P89(r+SH89.r*h,c+SH89.c*h,0))}
  poly89(g,hull89(pts),'#2e1e0e')}
function contact89(g,B){if(B.t==='tree'||B.t==='yard'||B.t==='fountain'||B.t==='statue')return;const R0=B.r0-0.5,R1=B.r1+0.5,C0=B.c0-0.5,C1=B.c1+0.5;
  poly89(g,[P89(R0-0.06,C0-0.06,0),P89(R0-0.06,C1+0.12,0),P89(R1+0.12,C1+0.12,0),P89(R1+0.12,C0-0.06,0)],'rgba(30,20,8,.28)')}
function bake89(){const t0=performance.now();const W=CITY.W,H=CITY.H,T=CITY.TW,dpr=CITY.dpr||1;const L=CITY.L;const V=CV89[L.n]||{f:['hills'],st:'it',tree:'cypress'};const S=ST89[V.st]||ST89.it;const seed=hash89(L.n);
  const key=[L.n,W,H,dpr,T.toFixed(2)].join('|');if(CB89.key===key)return CB89;
  const yH=CITY.OY-T*1.9;const edgeY=x=>{const u=Math.abs((x-CITY.OX)/(T/2));return CITY.OY+(2*N89-1-u)*T/4};
  const outer=outer89(seed).filter(O=>{if(!O.front)return true;O.h=Math.min(O.h,1.3);const R0=O.r0-0.5,R1=O.r1+0.5,C0=O.c0-0.5,C1=O.c1+0.5;const zt=O.h+0.8;
    return ![P89(R0,C0,zt),P89(R1,C0,zt),P89(R0,C1,zt),P89(R1,C1,zt)].some(q=>q.y<edgeY(q.x)+T*0.15)});
  const yCut=yH+T*0.55;const keep=outer.filter(O=>O.front||P89(O.r1+0.5,O.c1+0.5,0).y>=yCut);
  const under=new Set();for(const O of keep)for(let r=O.r0;r<=O.r1;r++)for(let c=O.c0;c<=O.c1;c++)under.add(r+','+c);
  /* the ground layer */
  const bg=mkCanvas89(W,H);const g=bg.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  drawPanorama89(g,W,H,yH,S,V,seed);
  /* the streets around (paving outside the square, a little darker) */
  {const rnd=rng89(seed+77);const vmin=Math.floor((yH-CITY.OY)*4/T)-2;for(let v=vmin;v<2*N89+16;v++)for(let u=-24;u<=24;u++){if((u+v)%2)continue;const c=(u+v)/2,r=(v-u)/2;if(r>=0&&c>=0&&r<N89&&c<N89)continue;
      const p=P89(r,c,0);if(p.x<-T||p.x>W+T||p.y<yCut||p.y>H+T||r<-13||c<-13)continue;if(under.has(r+','+c))continue;pave89(g,r,c,S,0.88,false,rnd)}}
  /* the houses behind the square, far to near, with their shadows first */
  const back=keep.filter(O=>!O.front).sort((a,b)=>(a.r1+a.c1)-(b.r1+b.c1));
  for(const O of back){const h=O.h+0.5;const pts=[];for(const [r,c] of [[O.r0-0.5,O.c0-0.5],[O.r0-0.5,O.c1+0.5],[O.r1+0.5,O.c1+0.5],[O.r1+0.5,O.c0-0.5]]){pts.push(P89(r,c,0));pts.push(P89(r+SH89.r*h,c+SH89.c*h,0))}poly89(g,hull89(pts),'rgba(46,30,14,.22)')}
  for(const O of back){const v=O.r1+O.c1;const haze=Math.max(0,Math.min(0.7,(-v-2)/16));drawOuterHouse89(g,O,S,haze,-1e9)}
  /* the far trees between the back houses */
  {const rnd=rng89(seed+5);for(let i=0;i<26;i++){const r=-1-rnd()*3,c=-12+rnd()*40;const rr=rnd()<0.5?r:-12+rnd()*30,cc=rr===r?c:-1-rnd()*3;const p=P89(rr,cc,0);if(inArena89(rr,cc)||p.y<yH)continue;tree89(g,p.x,p.y,T*0.95,V.tree,Math.max(0,(-(rr+cc)-2)/20))}}
  /* the square */
  {const rnd=rng89(seed+11);for(let r=0;r<N89;r++)for(let c=0;c<N89;c++)pave89(g,r,c,S,1.0,SLAB89(r,c),rnd)}
  /* a curb along the square's edge */
  g.strokeStyle='rgba(255,248,230,.25)';g.lineWidth=Math.max(1,T*0.05);g.beginPath();{const a=P89(-0.5,-0.5,0),b=P89(N89-0.5,-0.5,0),c=P89(N89-0.5,N89-0.5,0),d=P89(-0.5,N89-0.5,0);g.moveTo(d.x,d.y);g.lineTo(a.x,a.y);g.lineTo(b.x,b.y);g.lineTo(c.x,c.y);g.lineTo(d.x,d.y)}g.stroke();
  /* shadows: the arena, then every piece (soft) */
  {const sg=mkCanvas89(W,H);const s=sg.getContext('2d');s.setTransform(dpr,0,0,dpr,0,0);const A=ARENA89;
    for(let k=0;k<=8;k++){const t=k/8*A.H*0.85;const du=(SH89.c-SH89.r)*t,dv=(SH89.c+SH89.r)*t;const c=UV89(A.u0+du,A.v0+dv,0);s.fillStyle='#2e1e0e';s.beginPath();s.ellipse(c.x,c.y,A.a*T/2,A.b*T/4,0,0,Math.PI*2);s.fill()}
    for(const B of B89)shadow89(s,B);
    g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=0.34;if('filter' in g)g.filter=`blur(${Math.max(1,Math.round(T*0.06*dpr))}px)`;g.drawImage(sg,0,0);g.restore();for(const B of B89)contact89(g,B);
    /* the arena's own floor is under its wall: no shadow over the far streets inside the ellipse matters */}
  /* faint tile seams so the walk reads */
  g.strokeStyle='rgba(60,40,20,.06)';g.lineWidth=1;for(let i=0;i<=N89;i++){const a=P89(i-0.5,-0.5,0),b=P89(i-0.5,N89-0.5,0),c=P89(-0.5,i-0.5,0),d=P89(N89-0.5,i-0.5,0);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.moveTo(c.x,c.y);g.lineTo(d.x,d.y);g.stroke()}
  /* the arena sprite (always behind every walker: no tile lies behind it) */
  const A=ARENA89;const aL=UV89(A.u0-A.a-1,A.v0,0).x,aR=UV89(A.u0+A.a+1,A.v0,0).x,aT=UV89(A.u0,A.v0-A.b,A.H+1.4).y,aB=UV89(A.u0,A.v0+A.b,0).y+T*0.4;
  const arena=sprite89(aL,aT,aR,aB,g2=>drawArena89(g2,S),true);arena.k='arena';
  /* every piece of the forum */
  const sprites={};for(const B of B89){const ex=B.t==='temple'?2.6:B.t==='bath'?2.4:B.t==='tree'?2.2:B.t==='statue'?1.6:B.t==='house'?1.6:1.4;const [x0,y0,x1,y1]=boxBounds89(B,ex);
    sprites[B.k]=sprite89(x0,y0,x1,y1,g2=>drawPiece89(g2,B,S),ACT89.has(B.k));if(B.t==='yard')sprites[B.k+'F']=sprite89(x0,y0,x1,y1,g2=>drawYardFront89(g2,B),false)}
  /* the front layer: houses across the street in front, then a soft vignette */
  const fg=mkCanvas89(W,H);{const f=fg.getContext('2d');f.setTransform(dpr,0,0,dpr,0,0);const front=keep.filter(O=>O.front).sort((a,b)=>(a.r1+a.c1)-(b.r1+b.c1));
    for(const O of front)drawOuterHouse89(f,O,S,0,-1e9);
    /* low shrubs in planters along the curb */
    for(let i=1;i<N89;i+=3)for(const [r,c] of [[N89+0.3,i],[i,N89+0.3]]){const p=P89(r,c,0);f.fillStyle='rgba(40,24,8,.28)';f.beginPath();f.ellipse(p.x+T*0.14,p.y,T*0.3,T*0.1,0,0,Math.PI*2);f.fill();
      const pg=f.createLinearGradient(p.x-T*0.2,0,p.x+T*0.2,0);pg.addColorStop(0,'#c97a4a');pg.addColorStop(0.4,'#b8643a');pg.addColorStop(1,'#7a3a1e');f.fillStyle=pg;f.beginPath();f.moveTo(p.x-T*0.2,p.y-T*0.3);f.lineTo(p.x+T*0.2,p.y-T*0.3);f.lineTo(p.x+T*0.15,p.y);f.quadraticCurveTo(p.x,p.y+T*0.05,p.x-T*0.15,p.y);f.closePath();f.fill();
      f.fillStyle='#d48c5a';f.beginPath();f.ellipse(p.x,p.y-T*0.3,T*0.21,T*0.06,0,0,Math.PI*2);f.fill();
      for(const [dx,dy,rr,col] of [[0,-0.48,0.27,'#2c4a22'],[-0.1,-0.56,0.17,'#4a7034'],[0.12,-0.46,0.15,'#33552a'],[-0.04,-0.64,0.1,'#6a8f48']]){f.fillStyle=col;f.beginPath();f.ellipse(p.x+dx*T,p.y+dy*T,rr*T,rr*T*0.8,0,0,Math.PI*2);f.fill()}}
    const vg=f.createRadialGradient(W*0.5,H*0.45,Math.min(W,H)*0.35,W*0.5,H*0.5,Math.max(W,H)*0.78);vg.addColorStop(0,'rgba(20,12,4,0)');vg.addColorStop(1,'rgba(20,12,4,.32)');f.fillStyle=vg;f.fillRect(0,0,W,H)}
  /* label anchors */
  const labs=[];for(const B of B89)if(B.lab){const top=B.t==='temple'?B.h+1.3:B.t==='bath'?B.h+1.5:B.t==='house'?B.h+0.9:B.t==='yard'?1.4:B.h+0.5;labs.push({k:B.k,lab:B.lab,ico:B.ico,p:P89((B.r0+B.r1)/2,(B.c0+B.c1)/2,top)})}
  Object.assign(CB89,{key,bg,fg,arena,sprites,labs,yH,ms:Math.round(performance.now()-t0)});CITY.bake89ms=CB89.ms;return CB89}
function hitSprite89(S,x,y){if(!S||!S.mask||x<S.x||y<S.y||x>=S.x+S.w||y>=S.y+S.h)return false;const i=Math.floor((x-S.x)/2),j=Math.floor((y-S.y)/2);return !!S.mask[j*S.mw+i]}

/* ---------------- figures, animals, the frame ---------------- */
/* sort89 — painter's order by footprint: A goes first when it lies wholly behind B on an axis */
function sort89(items){const n=items.length;const indeg=new Array(n).fill(0),adj=items.map(()=>[]);
  const behind=(A,B)=>A.r1<=B.r0||A.c1<=B.c0;const dep=A=>A.r0+A.r1+A.c0+A.c1;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const A=items[i],B=items[j];const ab=behind(A,B),ba=behind(B,A);let e=0;
    if(ab&&!ba)e=1;else if(ba&&!ab)e=-1;else if(!ab&&!ba){if(B.on&&B.on===A.k)e=1;else if(A.on&&A.on===B.k)e=-1;else e=dep(A)<=dep(B)?1:-1}
    if(e===1){adj[i].push(j);indeg[j]++}else if(e===-1){adj[j].push(i);indeg[i]++}}
  const out=[],done=new Array(n).fill(false);for(let k=0;k<n;k++){let best=-1;for(let i=0;i<n;i++)if(!done[i]&&indeg[i]===0&&(best<0||dep(items[i])<dep(items[best])))best=i;
    if(best<0){for(let i=0;i<n;i++)if(!done[i]){best=i;break}}done[best]=true;out.push(items[best]);for(const j of adj[best])indeg[j]--}
  return out}
/* glide89 — smooth position between tiles (dur ms per step) */
function glide89(o,now,dur){if(o._tr!==o.r||o._tc!==o.c){o._fr=o._dr==null?o.r:o._dr;o._fc=o._dc==null?o.c:o._dc;o._tr=o.r;o._tc=o.c;o._mt=now}
  const k=Math.min(1,(now-(o._mt||0))/dur);const e=k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2;o._dr=o._fr+(o.r-o._fr)*e;o._dc=o._fc+(o.c-o._fc)*e;if(Math.abs(o._dr-o.r)>3||Math.abs(o._dc-o.c)>3){o._dr=o.r;o._dc=o.c}return [o._dr,o._dc]}
function figShadow89(c2,x,y,T,k){c2.fillStyle='rgba(40,24,8,.28)';c2.beginPath();c2.ellipse(x+T*0.13*k,y+T*0.01,T*0.34*k,T*0.1*k,-0.12,0,Math.PI*2);c2.fill();c2.fillStyle='rgba(30,18,6,.35)';c2.beginPath();c2.ellipse(x,y,T*0.16*k,T*0.06*k,0,0,Math.PI*2);c2.fill()}
function animal89(c2,a,x,y,T,now){const dir=a.dir||1;c2.fillStyle='rgba(40,24,8,.25)';c2.beginPath();c2.ellipse(x+T*0.06,y,T*0.2,T*0.06,0,0,Math.PI*2);c2.fill();
  if(a.kind==='hen'){const bob=Math.sin(now/180+a.ph)*T*0.015;c2.save();c2.translate(x,y);c2.scale(dir,1);c2.fillStyle=a.col;c2.beginPath();c2.ellipse(0,-T*0.1+bob,T*0.08,T*0.06,0,0,Math.PI*2);c2.fill();c2.beginPath();c2.arc(T*0.07,-T*0.16+bob,T*0.035,0,Math.PI*2);c2.fill();
    c2.fillStyle='#c0302a';c2.fillRect(T*0.06,-T*0.21+bob,T*0.03,T*0.025);c2.fillStyle='#d9a224';c2.beginPath();c2.moveTo(T*0.1,-T*0.165+bob);c2.lineTo(T*0.13,-T*0.155+bob);c2.lineTo(T*0.1,-T*0.145+bob);c2.fill();c2.restore();return}
  if(a.kind==='dog'){c2.save();c2.translate(x,y);c2.scale(dir,1);c2.strokeStyle=sh89(a.col,0.6);c2.lineWidth=Math.max(1,T*0.03);for(const lx of [-0.1,0.1]){c2.beginPath();c2.moveTo(lx*T,-T*0.12);c2.lineTo(lx*T,0);c2.stroke()}
    c2.fillStyle=a.col;c2.beginPath();c2.ellipse(0,-T*0.15,T*0.14,T*0.06,0,0,Math.PI*2);c2.fill();c2.beginPath();c2.ellipse(T*0.15,-T*0.21,T*0.06,T*0.045,0,0,Math.PI*2);c2.fill();c2.beginPath();c2.moveTo(-T*0.13,-T*0.17);c2.lineTo(-T*0.22,-T*0.26+Math.sin(now/120)*T*0.03);c2.lineWidth=2;c2.strokeStyle=a.col;c2.stroke();c2.restore();return}
  mule89(c2,x,y,T*0.7,dir,a.col)}
cityDraw=function(){const c2=CITY.c2;if(!c2||!CITY.TW)return;const W=CITY.W||CITY.cv.width,H=CITY.H||CITY.cv.height,T=CITY.TW;const now=performance.now();const spd=CITY.speed||1;
  const K=bake89();c2.drawImage(K.bg,0,0,W,H);
  /* the arena first: no walkable tile lies behind it */
  c2.drawImage(K.arena.cv,K.arena.x,K.arena.y,K.arena.w,K.arena.h);
  if(CITY.sponsorHere&&CITY.balc89&&typeof flavFaceURL==='function'){const im=CITY.imgs['spB']||(()=>{const i2=new Image();i2.src=flavFaceURL('calm',CITY.sponsorHere);CITY.imgs['spB']=i2;return i2})();
    if(im.complete&&im.naturalWidth){const w=T*0.62,h=w*0.8;const bx=CITY.balc89.x-w/2,by=CITY.balc89.y-h*0.92;c2.drawImage(im,bx,by,w,h);CITY.spBox=[bx,by,w,h]}}
  if(CITY.mgr&&typeof flagImg==='function'&&typeof mgrFlagOf==='function'){try{const fl=mgrFlagOf(me());const im=fl?flagImg(fl):null;const p=P89(CITY_GATE[0]-0.2,CITY_GATE[1]+1.0,0);
    c2.strokeStyle='#5a4a34';c2.lineWidth=2;c2.beginPath();c2.moveTo(p.x,p.y);c2.lineTo(p.x,p.y-T*1.5);c2.stroke();const wv=Math.sin(now/500)*T*0.02;if(im&&im.complete)c2.drawImage(im,p.x,p.y-T*1.5+wv,T*0.5,T*0.3)}catch(e){}}
  /* hover tile and your path */
  if(CITY.hov89&&!cityBlocked(CITY.hov89.r,CITY.hov89.c)){const {r,c}=CITY.hov89;
    c2.strokeStyle='rgba(240,207,125,.85)';c2.lineWidth=1.5;c2.beginPath();const q=[P89(r-0.5,c-0.5,0),P89(r-0.5,c+0.5,0),P89(r+0.5,c+0.5,0),P89(r+0.5,c-0.5,0)];q.forEach((p,i)=>i?c2.lineTo(p.x,p.y):c2.moveTo(p.x,p.y));c2.closePath();c2.stroke()}
  if(CITY.path&&CITY.path.length){c2.fillStyle='rgba(240,207,125,.75)';for(const [r,c] of CITY.path){const p=P89(r,c,0);c2.beginPath();c2.ellipse(p.x,p.y,T*0.06,T*0.03,0,0,Math.PI*2);c2.fill()}}
  /* everything that stands on the square, in painter's order */
  const items=[];const say=[];
  for(const B of B89){const S=K.sprites[B.k];if(!S)continue;items.push({k:B.k,r0:B.r0-0.5,r1:B.r1+0.5,c0:B.c0-0.5,c1:B.c1+0.5,draw:()=>{c2.drawImage(S.cv,S.x,S.y,S.w,S.h);if(B.t==='yard')yardLive89(c2,B,now);if(B.t==='altar')templeLive89(c2,B,now);if(B.t==='bath')bathLive89(c2,B,now);if(B.t==='fountain')fountainLive89(c2,B,now);
      if(B.t==='yard'){const F=K.sprites[B.k+'F'];c2.drawImage(F.cv,F.x,F.y,F.w,F.h)}}})}
  for(const n of CITY.npcs){const [r,c]=glide89(n,now,(n.path&&n.path.length||n.leaving?150:380)/spd);const z=n.z89||0;
    items.push({r0:r-0.3,r1:r+0.3,c0:c-0.3,c1:c+0.3,on:n.on89,draw:()=>{const p=P89(r,c,z);
      const tok=n.kind==='beast'?n.tok:n.kind==='glad'?(typeof tokenForCls==='function'&&n.g?tokenForCls(CLASSES[n.g.cls]?n.g.cls:'soldier'):null)
        :n.kind==='soldier'?(n.empire?TOKEN_DEF.soldier:{...TOKEN_DEF.soldier,c1:CITY.guardC||'#3a4a5a',c2:CITY.guardC2||'#c9ccd3',cape:true})
        :typeof specFig==='function'?(n.fig=n.fig||specFig(n.look,{sash:n.kind==='auct',basket:n.kind==='filler'&&(n.id.charCodeAt(1)%5===0),amphora:n.kind==='filler'&&(n.id.charCodeAt(1)%5===1)})):null;
      const svg=tok&&typeof figureSVG==='function'?cityFig89(tok):null;const im=svg?cityImg('fg'+(n.g?n.g.id:n.id),svg):null;
      figShadow89(c2,p.x,p.y,T,1);
      if(CITY.hover===n||n.reg&&n.reg.kin){c2.strokeStyle=CITY.hover===n?'#f0cf7d':'rgba(240,207,125,.45)';c2.lineWidth=2;c2.beginPath();c2.ellipse(p.x,p.y,T*0.32,T*0.13,0,0,Math.PI*2);c2.stroke()}
      if(im)c2.drawImage(im,p.x-T*0.36,p.y-T*1.18,T*0.72,T*1.22);else if(!svg)drawTownsfolk(c2,p.x,p.y,T,n.look||{},{}); /* v0.91: while the lit figure decodes, only its shadow (no old larger stand-in) */
      n._x=p.x;n._y=p.y;if(n.say)say.push([n.say,p])}})}
  for(const a of CITY.anim89||[]){const [r,c]=glide89(a,now,520/spd);items.push({r0:r-0.2,r1:r+0.2,c0:c-0.2,c1:c+0.2,draw:()=>{const p=P89(r,c,0);animal89(c2,a,p.x,p.y,T,now)}})}
  {const P=CITY.player;const [r,c]=glide89(P,now,STEP89*1.05/spd);items.push({r0:r-0.3,r1:r+0.3,c0:c-0.3,c1:c+0.3,draw:()=>{const p=P89(r,c,0);
    const tok=P.fig=P.fig||(typeof specFig==='function'?{...specFig(P.look,{body:'robe',scale:1}),c2:'#e6b93a'}:null);
    figShadow89(c2,p.x,p.y,T,1.05);c2.strokeStyle='#f0cf7d';c2.lineWidth=2;c2.beginPath();c2.ellipse(p.x,p.y,T*0.34,T*0.14,0,0,Math.PI*2);c2.stroke();
    const svg=tok?cityFig89(tok):null;const im=svg?cityImg('me',svg):null;
    if(im)c2.drawImage(im,p.x-T*0.37,p.y-T*1.22,T*0.74,T*1.26);else if(!svg)drawTownsfolk(c2,p.x,p.y,T*1.06,P.look,{ring:'#f0cf7d'});P._x=p.x;P._y=p.y}})}
  for(const it of sort89(items))it.draw();
  c2.drawImage(K.fg,0,0,W,H);
  /* labels: plaques over the landmarks, brighter on hover */
  const fs=Math.max(9,Math.round(T*0.19));c2.font=`600 ${fs}px IBM Plex Mono, monospace`;c2.textAlign='center';c2.textBaseline='middle';
  const keep89=[];/* label boxes the chatter must not cover */
  for(const Lb of K.labs){const t=`${Lb.ico} ${Lb.lab}`;const wd=c2.measureText(t).width+12,hh=fs+7;const hov=CITY.hovB89===Lb.k;keep89.push([Lb.p.x-wd/2,Lb.p.y-hh/2,wd,hh]);
    c2.fillStyle=hov?'rgba(60,36,12,.95)':'rgba(28,18,10,.78)';c2.beginPath();c2.roundRect(Lb.p.x-wd/2,Lb.p.y-hh/2,wd,hh,4);c2.fill();c2.strokeStyle=hov?'#f0cf7d':'rgba(201,164,88,.7)';c2.lineWidth=1;c2.stroke();c2.fillStyle=hov?'#ffe7a8':'#efe2c0';c2.fillText(t,Lb.p.x,Lb.p.y+1)}
  {const gp=P89(CITY_GATE[0],CITY_GATE[1],2.35);const t=_T('⬆ THE ARENA GATE');const wd=c2.measureText(t).width+12,hh=fs+7;keep89.push([gp.x-wd/2,gp.y-hh/2,wd,hh]);const hov=CITY.hovB89==='arena';c2.fillStyle=hov?'rgba(60,36,12,.95)':'rgba(28,18,10,.82)';c2.beginPath();c2.roundRect(gp.x-wd/2,gp.y-hh/2,wd,hh,4);c2.fill();c2.strokeStyle='#d4ae5c';c2.stroke();c2.fillStyle='#f0cf7d';c2.fillText(t,gp.x,gp.y+1)}
  /* you, always findable */
  {const P=CITY.player;if(P._x!=null){c2.font=`600 ${Math.max(9,Math.round(T*0.2))}px IBM Plex Mono, monospace`;c2.fillStyle='#f0cf7d';c2.strokeStyle='rgba(20,12,4,.8)';c2.lineWidth=3;const t=CITY.mgr?_T('YOU · LANISTA'):_T('YOU');const yw=c2.measureText(t).width+8;keep89.push([P._x-yw/2,P._y+T*0.3-T*0.15,yw,T*0.3]);c2.strokeText(t,P._x,P._y+T*0.3);c2.fillText(t,P._x,P._y+T*0.3)}}
  /* chatter bubbles */
  c2.font=`600 ${Math.max(10,Math.round(T*0.22))}px Alegreya Sans, sans-serif`;for(const [s,p] of say){const wd=c2.measureText(s).width+12,bh=T*0.32;const bx=Math.max(4,Math.min(W-wd-4,p.x-wd/2));
    /* v0.89 (his note): a bubble never covers a building label, the gate, YOU or another bubble — it steps up, then down, until clear */
    const hit=y=>keep89.some(([x,yy,w,h])=>bx<x+w+3&&bx+wd>x-3&&y<yy+h+3&&y+bh>yy-3);let by=p.y-T*1.5;
    for(const d of [0,-1,-2,-3,1,2,3,-4,4,-5,5]){const y=p.y-T*1.5+d*bh*1.1;if(y>2&&y+bh<H-2&&!hit(y)){by=y;break}}keep89.push([bx,by,wd,bh]);
    c2.fillStyle='rgba(245,234,210,.95)';c2.beginPath();c2.roundRect(bx,by,wd,bh,4);c2.fill();c2.strokeStyle='rgba(90,60,30,.35)';c2.lineWidth=1;c2.stroke();c2.fillStyle='#241910';c2.fillText(s,bx+wd/2,by+T*0.16)}
  if(CITY.hover&&CITY.hover._x!=null){const n=CITY.hover;c2.font=`600 ${Math.max(10,Math.round(T*0.22))}px Alegreya Sans,sans-serif`;const wd=c2.measureText(n.name).width+10;
    c2.fillStyle='rgba(20,14,8,.9)';c2.beginPath();c2.roundRect(n._x-wd/2,n._y+T*0.12,wd,T*0.3,4);c2.fill();c2.fillStyle='#f0cf7d';c2.fillText(n.name,n._x,n._y+T*0.27)}
  if(CITY.toast&&now<CITY.toast.until){c2.font=`600 ${Math.max(12,Math.round(T*0.26))}px Alegreya Sans,sans-serif`;const wd=c2.measureText(CITY.toast.t).width+18;
    c2.fillStyle='rgba(20,14,8,.85)';c2.beginPath();c2.roundRect(W/2-wd/2,10,wd,Math.max(22,T*0.44),5);c2.fill();c2.fillStyle='#e8dcc0';c2.fillText(CITY.toast.t,W/2,10+Math.max(22,T*0.44)/2)}};
/* live touches: the sparring pair, altar smoke, bath steam, the fountain's jets */
function yardLive89(c2,B,now){const T=CITY.TW;const fig=(cls,r,c,ph)=>{const lunge=Math.max(0,Math.sin(now/260+ph))*0.22;const p=P89(r,c+(ph?-lunge:lunge),0);figShadow89(c2,p.x,p.y,T,0.9);
    const tok=typeof tokenForCls==='function'?tokenForCls(cls):null;const svg=tok&&typeof figureSVG==='function'?cityFig89(tok):null;const im=svg?cityImg('yd'+cls,svg):null;if(im){c2.save();if(ph){c2.translate(p.x*2,0);c2.scale(-1,1)}c2.drawImage(im,p.x-T*0.33,p.y-T*1.1,T*0.66,T*1.12);c2.restore()}};
  fig('hero',6.6,14.6,0);fig('soldier',6.6,15.9,Math.PI);
  {const p=P89(7.9,14.0,0);figShadow89(c2,p.x,p.y,T,0.9);const tok=typeof specFig==='function'?specFig({skin:'#c68e5f',hair:'#2a1c12',robe:'#6a3a22',beard:true},{}):null;const svg=tok&&typeof figureSVG==='function'?cityFig89(tok):null;const im=svg?cityImg('yddoc',svg):null;
   if(im)c2.drawImage(im,p.x-T*0.33,p.y-T*1.1,T*0.66,T*1.12);
   c2.strokeStyle='#4a3018';c2.lineWidth=1.2;c2.beginPath();c2.moveTo(p.x+T*0.2,p.y-T*0.5);c2.quadraticCurveTo(p.x+T*0.45,p.y-T*0.8+Math.sin(now/300)*T*0.1,p.x+T*0.6,p.y-T*0.4);c2.stroke()}}
function templeLive89(c2,B,now){const T=CITY.TW;const p=P89(B.r0,B.c0,0.52);p.y+=T*0.28;
  const fl=0.6+0.4*Math.sin(now/90);c2.fillStyle=`rgba(255,${150+fl*60|0},60,.9)`;c2.beginPath();c2.ellipse(p.x,p.y-T*0.28,T*0.05,T*0.09*fl,0,0,Math.PI*2);c2.fill();
  for(let k=0;k<4;k++){const t=((now/2600)+k/4)%1;c2.fillStyle=`rgba(225,225,230,${0.35*(1-t)})`;c2.beginPath();c2.ellipse(p.x+Math.sin(t*5+k)*T*0.12+t*T*0.3,p.y-T*0.4-t*T*1.4,T*(0.06+t*0.18),T*(0.05+t*0.1),0,0,Math.PI*2);c2.fill()}}
function bathLive89(c2,B,now){const T=CITY.TW;const p=P89((B.r0+B.r1)/2,(B.c0+B.c1)/2,B.h+1.6);for(let k=0;k<4;k++){const t=((now/3000)+k/4)%1;c2.fillStyle=`rgba(240,242,245,${0.3*(1-t)})`;c2.beginPath();c2.ellipse(p.x+t*T*0.4+(k-1.5)*T*0.25,p.y-t*T*1.2,T*(0.12+t*0.2),T*(0.07+t*0.1),0,0,Math.PI*2);c2.fill()}}
function fountainLive89(c2,B,now){const T=CITY.TW;const c=P89((B.r0+B.r1)/2,(B.c0+B.c1)/2,0);const y=c.y-T*0.2;
  c2.strokeStyle='rgba(220,240,255,.75)';c2.lineWidth=1.3;for(let k=0;k<4;k++){const a=k/4*Math.PI*2+0.4;const ex=c.x+Math.cos(a)*T*0.55,ey=y+Math.sin(a)*T*0.24;c2.beginPath();c2.moveTo(c.x+Math.cos(a)*T*0.16,y-T*0.32);c2.quadraticCurveTo((c.x+ex)/2+Math.cos(a)*T*0.1,y-T*0.55,ex,ey);c2.stroke()}
  c2.fillStyle='rgba(255,255,255,.55)';for(let k=0;k<5;k++){const t=((now/700)+k/5)%1;const a=k*1.3;c2.beginPath();c2.ellipse(c.x+Math.cos(a)*T*0.5*t,y+Math.sin(a)*T*0.2*t,T*0.05*(1-t)+1,T*0.02*(1-t)+0.5,0,0,Math.PI*2);c2.fill()}}

/* ---------------- who stands where on the bigger square ---------------- */
function cityPlace89(){const taken=new Set();const P0=[16,9];
  const free=()=>{for(let k=0;k<300;k++){const r=1+Math.floor(Math.random()*(N89-1)),c=Math.floor(Math.random()*N89);const key=r+','+c;if(!cityBlocked(r,c)&&!taken.has(key)&&!(r===CITY_GATE[0]&&c===CITY_GATE[1])&&!(r===P0[0]&&c===P0[1])){taken.add(key);return [r,c]}}return [15,8]};
  const posts=[[6,9],[13,4]];let si=0;
  for(const n of CITY.npcs){delete n._tr;delete n._dr;if(n.kind==='auct'){n.r=5;n.c=7;n.z89=B89K.auction.h;n.on89='auction';n.static=true;continue}
    if(n.kind==='soldier'&&!n.empire&&si<posts.length){[n.r,n.c]=posts[si++];taken.add(n.r+','+n.c);continue}const [r,c]=free();n.r=r;n.c=c}
  if(CITY.player){CITY.player.r=P0[0];CITY.player.c=P0[1];CITY.player.fr=P0[0];CITY.player.fc=P0[1]}
  const kinds=[['hen','#f2ead8'],['hen','#a8612a'],['hen','#e8dcc0'],['dog','#8a6a4a'],['goat','#e9e1d0'],['goat','#7a5a3a']];
  CITY.anim89=kinds.map(([kind,col])=>{const [r,c]=free();return {kind,col,r,c,dir:Math.random()<0.5?1:-1,ph:Math.random()*6,t0:performance.now()+Math.random()*3000}})}
{const base=cityPopulate;cityPopulate=function(){const r=base.apply(this,arguments);try{cityPlace89()}catch(e){console.error(e)}return r}}
/* the loop: quicker steps for you, beasts from the east edge, the animals' wandering */
{const base=cityLoop;cityLoop=function(ts){if(!CITY.open)return base.apply(this,arguments);const now=performance.now();const spd=CITY.speed||1;
  try{
    if(now>CITY.beastT&&CITY.mode!=='filing'&&typeof BEAST_KINDS!=='undefined'){CITY.beastT=now+(22000+Math.random()*20000)/spd;const kinds=Object.values(BEAST_KINDS);const K=kinds[Math.floor(Math.random()*kinds.length)];
      const row=12+Math.floor(Math.random()*5);CITY.npcs.push({id:'b'+now,kind:'beast',name:`${K.n} for the pens`,tok:K.tok,r:row,c:N89-1,static:false,leaving:true,wt:0,t0:now,
        path:cityBFS([row,N89-1],[CITY_GATE[0]+1,CITY_GATE[1]]).concat([[CITY_GATE[0],CITY_GATE[1]]])});
      log2city(_T`A ${K.n.toLowerCase()} is led across the square toward the beast gate.`)}
    const P=CITY.player;if(P&&CITY.path.length&&now-CITY.stepT>STEP89/spd){const [r,c]=CITY.path.shift();P.r=r;P.c=c;CITY.stepT=now;
      if(r===CITY_GATE[0]&&c===CITY_GATE[1]){if(cityGamesHere())cityEnterArena();else{CITY.path=[];P.r=r+1;P.c=c;citySealedPanel()}}}
    for(const a of CITY.anim89||[]){if(now<a.t0)continue;a.t0=now+(1500+Math.random()*3500)/spd;const d=[[0,1],[0,-1],[1,0],[-1,0]][Math.floor(Math.random()*4)];const r=a.r+d[0],c=a.c+d[1];
      if(!cityBlocked(r,c)&&!(r===CITY_GATE[0]&&c===CITY_GATE[1])){a.r=r;a.c=c;if(d[1])a.dir=d[1]>0?1:-1;else a.dir=d[0]>0?-1:1}}
  }catch(e){console.error(e)}
  return base.apply(this,arguments)}}
/* clicks land on what you see: a building's silhouette, front-most first */
{const base=cityAt;cityAt=function(ev){const hit=base.apply(this,arguments);try{if(hit.npc||hit.sponsor||!CB89.sprites)return hit;const rect=CITY.cv.getBoundingClientRect();const x=ev.clientX-rect.left,y=ev.clientY-rect.top;
    const order=B89.filter(B=>ACT89.has(B.k)).sort((a,b)=>(b.r1+b.c1)-(a.r1+a.c1));for(const B of order){if(hitSprite89(CB89.sprites[B.k],x,y))return {r:B.r1,c:B.c0,b89:B.k}}
    if(hit.r!=null&&hit.r>=0&&hit.c>=0&&hit.r<N89&&hit.c<N89&&!GRID89[hit.r][hit.c])return hit;
    if(hitSprite89(CB89.arena,x,y)){for(let c=6;c<N89;c++)if(GRID89[0][c]==='arena')return {r:0,c,b89:'arena'}}}catch(e){}return hit}}
{const base=cityMove;cityMove=function(ev){base.apply(this,arguments);try{const hit=cityAt(ev);CITY.hov89=hit.npc||hit.sponsor||hit.b89?null:hit.r!=null?{r:hit.r,c:hit.c}:null;CITY.hovB89=hit.b89||null}catch(e){}}}

/* ---------------- the new landmarks' panels ---------------- */
const GOODS89={goods1:[_T('🍎 The fruit seller'),_T('Figs, pomegranates and apples from the hills. "For your fighters, lanista — nothing builds a sword-arm like a fig."')],
  goods2:[_T('🏺 The potter'),_T('Amphorae, lamps and cups stacked in towers. Every one of them, he swears, was fired in Arretium.')],
  goods3:[_T('🍞 The baker'),_T('Round loaves stamped with the baker’s name, still warm. The queue never ends on a games day.')]};
function cityTemplePanel89(){const w=CITY.w,mgr=CITY.mgr;let inner='';
  try{if(mgr&&w&&w.night&&w.night.loc===CITY.li&&typeof templeHTML76==='function')inner=templeHTML76().replace(/data-god76=/g,'data-god89=')}catch(e){inner=''}
  cityPanel(`<div class="sect" style="margin-top:0">${_T`🏛 The temple of ${esc(CITY.L.n)}`}</div><div class="card2"><p style="margin:0">${_T`Incense, a smoking altar and a priest who has seen a great many lanistae pray before the games.`}</p></div>
    ${inner||`<p class="rc-sub">${mgr?_T('Offerings for your fighters are made here in the week of your games.'):_T('Lanistae make offerings here in the week of their games.')}</p>`}`)}
function cityTrainPanel89(){const mgr=CITY.mgr;const locals=CITY.npcs.filter(n=>n.kind==='glad');
  cityPanel(`<div class="sect" style="margin-top:0">${_T`🏋 The training ground`}</div><div class="card2"><p style="margin:0">${_T`Palus posts, raked sand and a doctore’s shout. Fighters loosen up here beside the arena wall.`}</p>
    ${locals.length?`<div class="rc-sub" style="margin-top:6px">${_T`Watch them work:`}</div><div class="acts" style="flex-wrap:wrap">${locals.map(n=>`<button class="btn tksm" type="button" data-cw89="${esc(n.id)}">👁 ${esc(n.name)}</button>`).join('')}</div>`:''}
    ${mgr?`<div class="acts" style="margin-top:8px"><button class="btn primary tksm" type="button" data-cw89="yard">${_T`🏋 Your Training Yard<small>drills · spar · exhibitions</small>`}</button></div>`:''}</div>`)}
/* cityToYard89 — leave the square for your Training Yard (spar, exhibitions) */
function cityToYard89(){closeCity(()=>{if(typeof MGR==='undefined')return;MGR.tab='practice';if(!document.getElementById('mgrBody')){if(typeof openManager==='function')openManager('practice')}else if(typeof MGR_REDRAW==='function')MGR_REDRAW();const mb=document.getElementById('mBody');if(mb)mb.scrollTop=0})}
{const base=citySelect;citySelect=function(sel){if(sel&&sel.kind==='bldg'){if(sel.key==='temple'){CITY.sel=sel;return cityTemplePanel89()}if(sel.key==='train'){CITY.sel=sel;return cityTrainPanel89()}
    if(GOODS89[sel.key]){CITY.sel=sel;const [h,t]=GOODS89[sel.key];return cityPanel(`<div class="sect" style="margin-top:0">${h}</div><div class="card2"><p style="margin:0">${t}</p><p class="rc-sub" style="margin:6px 0 0">${_T`The arms market and the armorer sell kit for your fighters.`}</p></div>`)}}
  return base.apply(this,arguments)}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#cityPanel [data-cw89],#cityPanel [data-god89],#citySide [data-cw89],#citySide [data-god89]');if(!b||b.disabled)return;e.preventDefault();e.stopPropagation();
  if(b.dataset.cw89){if(b.dataset.cw89==='yard')return cityToYard89();const n=CITY.npcs.find(x=>x.id===b.dataset.cw89);if(n)citySelect(n);return}
  const k=b.dataset.god89;const w=W_(),m=me();if(!w||!m||!TEMPLE76[k])return;const c=templeCost76(k);if(!w.night||w.night.god76||m.coin<c)return;
  m.coin-=c;w.night.god76=k;tnews(_T`🏛 An offering to ${TEMPLE76[k][1]} (${coinAmt87(c)}): ${TEMPLE76[k][2]}.`);saveWorld();log2city(_T`${TEMPLE76[k][0]} ${TEMPLE76[k][1]} accepts your offering.`);cityTemplePanel89()},true);
/* phones sideways: a one-line bar and no hint row, so the square gets the height */
(()=>{const st=document.createElement('style');st.textContent=`@media (max-height:500px){#cityOv .citybar{padding:3px 8px;gap:8px;font-size:14px;white-space:nowrap;overflow:hidden}#cityOv .citybar b{overflow:hidden;text-overflow:ellipsis;min-width:0}#cityOv #cityLand,#cityOv .cityhint,#cityOv .flagchip{display:none}#cityOv #cityNext{display:none}#cityOv .citybar .btn{padding:2px 8px}}`;document.head.appendChild(st)})();

/* v0.89 (his notes): city figures wear the lit sculpted look (176 sc3dSVG); the exit says "Back to Match Week" in every city
   during a Manager week (the square may be in another city than your home) — it opens the Match Week tab. */
function cityFig89(tok){const s=figureSVG(tok,{});try{return typeof sc3dSVG==='function'&&typeof SC3D!=='undefined'&&SC3D.on?sc3dSVG(s,'s3c'):s}catch(e){return s}}
CITY_EXIT_LBL.night=_T('⏎ Back to Match Week');
{const base=cityExitKind;cityExitKind=function(){const k=base.apply(this,arguments);return k==='ludus'?'night':k}}

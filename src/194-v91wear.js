/* =====================================================================
   194-V91WEAR · v0.91 WEAR AND LIFE (Virgilante's approved polish, 2026-10-06) — DISPLAY ONLY
   =====================================================================
   Never the rules, never the seeded dice (hashes + Math.random only), never the online hash: everything lives in WeakMaps
   keyed by the live state S, the blood splats and the rubble entries (nothing is written into S).
   1. BLOOD RUNS TO THE DRAINS: blood within a tile of the sand's edge leaves a thin dark-red trickle out over the edge to the
      gully, then along it toward the nearest drain grate (ar91Drains() from 192-v91arena when it returns points; otherwise
      straight out over the nearest edge). It fades with its pool (bloodFade84 / bloodCol84, LIFE84 timing). A drain that took
      blood wears a faint dark-red stain on its grate.
   2. RUBBLE WITH A LIFT: a toppled pillar's rubble = drum sections cut from his pillar image (mini_pillar.webp, the fluted
      shaft) lying along the fall line, with a jagged broken face, lit from the upper left (shaded far side, contact shadows),
      small lit marble chips with shaded side faces, and a dust patch. It drops and settles with 138's rubbleSettle84. Over the
      rotations the pieces on the tiles next to the edge drift slowly out toward the gully and some chips end up in it.
   3. THE STUMP: a short jagged stump of the same stone (~0.25 TW, flat broken top, lit and shadowed) on the tile the pillar
      stood on, drawn under every piece and highlight. It goes when the clean-up crew clears that rubble.
   4. SAND WEAR: tiles walked often turn slightly darker and smoother (steps counted from the fighters' and beasts' positions
      as they are drawn — a step of up to 3 tiles is walked tile by tile, a longer jump counts only where it lands), and scuffs mark the tiles where attacks happened (doAttack).
   5. The whole layer is drawn where 07-ui draws rubble (a one-draw iterable stands in for S.rubble), so it sits over the sand
      and under blood, pieces and highlights; it goes through center()/iso, so it turns with 168's ROT89. It is BAKED into one
      offscreen canvas (rebuilt only when the wear, the blood, the rubble, the rotation, the drains or the tile size change;
      a camera pan only moves it). Rubble that is still settling is drawn live. Light board (lite84On) skips the trickles,
      stains and wear; Reduce motion / Animations Off = no settle (138), the drift is per rotation with no tween.
   WEAR91.on = false turns the whole layer off (07-ui's plain rubble returns) — used by tv91w to time draw().
   ===================================================================== */
const WEAR91={on:true,stumpH:0.07,drumD:0.15,clear:0.3,gully:0.32,trickleMax:28,bakeMaxPx:4e6,bakeDpr:2,stats:{},lastBakeMs:0,bakes:0}; /* TWEAK: stumpH = stump height (TW), drumD = fallen drum thickness (TW), clear = how far rubble keeps from a tile's middle (tiles); gully offset (tiles past the edge) when no drains say; the trickle cap; the bake's pixel budget */
/* h91 — a cosmetic hash in [0,1) (never the dice) */
function h91(a,b,c){let h=(Math.imul((a|0)+7919,73856093)^Math.imul((b|0)+104729,19349663)^Math.imul((c|0)+1299709,83492791))>>>0;h=Math.imul(h^(h>>>15),2246822507)>>>0;h=Math.imul(h^(h>>>13),3266489909)>>>0;return ((h^(h>>>16))>>>0)/4294967296}
const WEAR91_S=new WeakMap();   /* S → {cnt,scuff,pos,ver,stain} */
const WEAR91_RB=new WeakMap();  /* rubble entry → {rot,pieces} */
function wear91St(){if(!S)return null;let w=WEAR91_S.get(S);if(!w){w={cnt:new Float32Array(N*N),scuff:new Uint16Array(N*N),pos:new Map(),ver:0};WEAR91_S.set(S,w)}return w}
const wear91Lite=()=>typeof lite84On==='function'&&lite84On();
/* ---------- 4. counting steps and clashes ---------- */
function wear91Step(w,r,c,k){if(r==null||c==null||r<0||c<0||r>=N||c>=N)return;w.cnt[r*N+c]+=k;w.ver++}
function wear91Sample(){const w=wear91St();if(!w||S.sim||S.snap)return;if(typeof isNaum==='function'&&isNaum())return;
  const walk=(id,r,c,k)=>{if(!Number.isFinite(r)||!Number.isFinite(c))return;const o=w.pos.get(id);if(o&&o[0]===r&&o[1]===c)return;w.pos.set(id,[r,c]);
    if(!o||Math.max(Math.abs(o[0]-r),Math.abs(o[1]-c))>3){wear91Step(w,r,c,k);return}   /* a jump (tunnel, knock-back, a load) is not a walk */
   let a=o[0],b=o[1];for(let g=0;g<30&&(a!==r||b!==c);g++){a+=Math.sign(r-a);b+=Math.sign(c-b);wear91Step(w,a,b,k)}};
  for(const p of S.players||[])if(p&&p.alive&&!p.underground&&!p.exited)walk('p'+p.id,p.r,p.c,1);
  for(const n of S.npcs||[])if(n&&n.alive)walk('n'+n.id,n.r,n.c,0.6)}
{const base=doAttack;doAttack=async function(player,source,target){try{if(!HEADLESS&&S&&!S.sim&&player&&target){const w=wear91St();
    if(w){for(const [r,c] of [[player.r,player.c],[target.r,target.c]])if(r>=0&&c>=0&&r<N&&c<N)w.scuff[r*N+c]++;w.ver++}}}catch(e){}
  return base.apply(this,arguments)}}
/* ---------- geometry ---------- */
/* edge91 — the nearest side of the sand for tile (r,c): distance in tiles and the outward step */
function edge91(r,c){const M=N-1;const o=[[r,-1,0],[c,0,-1],[M-r,1,0],[M-c,0,1]];o.sort((a,b)=>a[0]-b[0]);return {d:o[0][0],sr:o[0][1],sc:o[0][2]}}
/* grid91 — screen point → real (unturned) fractional grid index */
function grid91(x,y){const u=(x-OX)/(TW/2),v=(y-TH/2-OY)/(TH/2);const c=(u+v)/2,r=(v-u)/2;const k=typeof ROT89!=='undefined'?ROT89.k:0;
  if(!k||typeof rot89!=='function')return [r,c];return rot89(r,c,4-k)}
function drains91(){try{if(typeof ar91Drains!=='function')return [];const d=ar91Drains();return Array.isArray(d)?d.filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)):[]}catch(e){return []}}
/* gully91 — how far past the sand's edge the gully runs (tiles), from the drains when 192 gives them */
function gully91(dr){if(!dr.length)return WEAR91.gully;let s=0,n=0;for(const p of dr){const [r,c]=grid91(p.x,p.y);const out=-Math.min(r,c,N-1-r,N-1-c)-0.5;if(out>0.05&&out<2){s+=out;n++}}return n?Math.max(0.12,Math.min(1.2,s/n)):WEAR91.gully}
/* ---------- the pillar's stone ---------- */
function stone91(){return typeof miniImg==='function'?miniImg('pillar'):null}
function stoneScale91(){try{return typeof miniScale==='function'&&typeof MINI_A!=='undefined'&&MINI_A.pillar?miniScale('pillar'):TW/120}catch(e){return TW/120}}
const STONE91={x0:21,x1:73,y0:52,y1:208,ax:47.3,ay:239.8,rx:28}; /* the shaft in mini_pillar.webp (95×263), its base centre and shaft half width */
function marble91(){const pc=(typeof THEME!=='undefined'&&THEME.pillar)||'#ece4d4';return {top:pc,lite:shade(pc,0.25),mid:shade(pc,-0.12),side:shade(pc,-0.3),dark:shade(pc,-0.48)}}
/* ---------- 2. rubble pieces (grid positions, fixed per rubble entry) ---------- */
function rub91(rb){let R=WEAR91_RB.get(rb);if(R)return R;const seed=rb.r*31+rb.c*7+(rb.dr+2)*3+(rb.dc+2);const pieces=[];
  const dr=rb.dr||0,dc=rb.dc||0;let i=0;
  for(const k of [0,1,2]){const r0=rb.r+dr*k,c0=rb.c+dc*k;const inb=r0>=0&&c0>=0&&r0<N&&c0<N;
    const add=(t,sz,jit)=>{const q=i++;let jr=(h91(seed,q,1)-0.5)*jit,jc=(h91(seed,q,2)-0.5)*jit;
      if(inb&&WEAR91.clear){const d=Math.hypot(jr,jc),m=t==='drum'?0.34:WEAR91.clear;if(d<m){const an=d>0.01?Math.atan2(jr,jc):h91(seed,q,6)*Math.PI*2;jr=Math.sin(an)*m;jc=Math.cos(an)*m}}   /* off the middle: the tile reads as open sand */
      pieces.push({t,k,i:q,sz,r:r0+jr,c:c0+jc,a:(h91(seed,q,3)-0.5)*0.7,s:h91(seed,q,4),roll:h91(seed,q,5)<0.4,out:!inb})};
    /* v0.92 (his note): the fallen drum SPLITS IN HALF and the halves roll apart, each to the edge of the tile it landed on */
    const half=(sz)=>{let pr=dc,pc=-dr;const L=Math.hypot(pr,pc)||1;if(!dr&&!dc){pr=0;pc=1}else{pr/=L;pc/=L}
      for(const h of [-1,1]){const q=i++;const ed=0.34+h91(seed,q,1)*0.06,al=(h91(seed,q,2)-0.5)*0.1;
        pieces.push({t:'drum',half:h,k,i:q,sz,r:r0+pr*ed*h+dr*al,c:c0+pc*ed*h+dc*al,a:(h91(seed,q,3)-0.5)*0.5,s:h91(seed,q,4),roll:false,out:false})}};
    if(!inb){add('chip',0.8,0.5);add('chip',0.6,0.5);continue}
    if(k===1)half(1);if(k===2)half(0.78);
    const nc=k===0?3:k===1?4:3;for(let j=0;j<nc;j++)add('chip',0.55+h91(seed,j,k+9)*0.6,0.8)}
  R={rot:S?S.rotation|0:0,pieces,seed};WEAR91_RB.set(rb,R);return R}
/* where a piece lies now: the tile's jitter + the slow drift toward the gully (by rotations, no tween) */
function rubPos91(rb,R,p,G){let r=p.r,c=p.c;const age=Math.max(0,(S.rotation|0)-R.rot);
  if(p.out){const e=edge91(Math.max(0,Math.min(N-1,Math.round(r))),Math.max(0,Math.min(N-1,Math.round(c))));   /* off the sand: it lies in the gully */
    if(e.sr)r=e.sr<0?-0.5-G:N-0.5+G;if(e.sc)c=e.sc<0?-0.5-G:N-0.5+G;return [r,c]}
  const e=edge91(Math.round(p.r),Math.round(p.c));if(e.d>1||!age)return [r,c];
  if(p.t==='chip'&&p.roll&&e.d===0){const u=Math.min(1,age/5);const tr=e.sr?(e.sr<0?-0.5-G:N-0.5+G):r,tc=e.sc?(e.sc<0?-0.5-G:N-0.5+G):c;return [r+(tr-r)*u,c+(tc-c)*u]}
  const amt=Math.min(1,age/8)*(p.t==='drum'?0.12:0.28)*(e.d?0.6:1);return [r+e.sr*amt,c+e.sc*amt]}
/* ---------- drawing (g = any 2D context) ---------- */
function ell91(g,x,y,rx,ry,rot){g.beginPath();g.ellipse(x,y,Math.max(0.5,rx),Math.max(0.5,ry),rot||0,0,Math.PI*2)}
function chip91(g,x,y,rad,seed,lift,col){const n=5+Math.floor(h91(seed,1,1)*3),h=rad*(0.35+h91(seed,2,2)*0.3);
  const V=[];for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+h91(seed,i,3)*0.6;const q=rad*(0.65+h91(seed,i,4)*0.5);V.push([x+Math.cos(a)*q,y-lift-h+Math.sin(a)*q*0.55])}
  g.fillStyle='rgba(28,18,10,.32)';ell91(g,x+rad*0.28,y+rad*0.12,rad*1.05,rad*0.45);g.fill();
  for(let i=0;i<n;i++){const A=V[i],B=V[(i+1)%n];const nx=B[1]-A[1],ny=-(B[0]-A[0]);if(ny<=0)continue;   /* a side face facing the viewer */
    g.fillStyle=nx>0?col.dark:col.side;g.beginPath();g.moveTo(A[0],A[1]);g.lineTo(B[0],B[1]);g.lineTo(B[0],B[1]+h);g.lineTo(A[0],A[1]+h);g.closePath();g.fill()}
  const gr=g.createLinearGradient(x-rad,y-lift-h-rad*0.5,x+rad,y-lift-h+rad*0.5);gr.addColorStop(0,col.lite);gr.addColorStop(0.55,col.top);gr.addColorStop(1,col.mid);
  g.fillStyle=gr;g.beginPath();V.forEach((v,i)=>i?g.lineTo(v[0],v[1]):g.moveTo(v[0],v[1]));g.closePath();g.fill();
  g.strokeStyle='rgba(60,50,40,.45)';g.lineWidth=Math.max(0.5,rad*0.07);g.stroke()}
/* drum91 — a fallen shaft section lying along screen angle th, cut from his pillar image */
function drum91(g,x,y,len,dia,th,seed,lift,col){const im=stone91();const phi=th-Math.PI/2,cs=Math.cos(phi),sn=Math.sin(phi);
  g.fillStyle='rgba(28,18,10,.36)';ell91(g,x+dia*0.18,y+dia*0.18,len*0.62,dia*0.42,th*0.5);g.fill();   /* contact shadow, down-right */
  g.save();g.translate(x,y-lift-dia*0.32);g.rotate(phi);
  const jag=(end)=>{const P=[];for(let i=0;i<=6;i++){const u=-dia/2+dia*i/6;P.push([u,end*(len/2)+end*(h91(seed,i,end>0?7:8)-0.5)*dia*0.3])}return end>0?P:P.reverse()};
  const A=jag(1),B=jag(-1);g.beginPath();[...A,...B].forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.save();g.clip();
  if(im){const sh=(STONE91.y1-STONE91.y0)*0.32,sy=STONE91.y0+h91(seed,1,9)*(STONE91.y1-STONE91.y0-sh);g.drawImage(im,STONE91.x0,sy,STONE91.x1-STONE91.x0,sh,-dia/2,-len/2-dia*0.2,dia,len+dia*0.4)}
  else{g.fillStyle=col.top;g.fillRect(-dia/2,-len/2-dia,dia,len+dia*2);g.strokeStyle='rgba(80,70,55,.35)';g.lineWidth=Math.max(0.6,dia*0.03);for(const f of [-0.3,0,0.3]){g.beginPath();g.moveTo(f*dia,-len);g.lineTo(f*dia,len);g.stroke()}}
  /* light: the side facing the upper left is lit, the far side shaded (screen direction of local +x is (cs,sn)) */
  const lit=-(cs+sn)>0?-1:1;const lg=g.createLinearGradient(lit*dia/2,0,-lit*dia/2,0);lg.addColorStop(0,'rgba(255,250,238,.34)');lg.addColorStop(0.45,'rgba(255,250,238,0)');lg.addColorStop(0.62,'rgba(20,14,8,0)');lg.addColorStop(1,'rgba(20,14,8,.5)');
  g.fillStyle=lg;g.fillRect(-dia,-len,dia*2,len*2);g.restore();
  g.strokeStyle='rgba(50,42,34,.55)';g.lineWidth=Math.max(0.6,dia*0.035);g.stroke();
  /* the broken face on the end nearer the viewer */
  const end=cs>=0?1:-1;const ey=end*len/2;const rx=dia/2,ry=dia*0.24;
  g.beginPath();for(let i=0;i<=14;i++){const a=i/14*Math.PI*2;const q=1+(h91(seed,i,11)-0.5)*0.16;const px=Math.cos(a)*rx*q,py=ey+Math.sin(a)*ry*q;i?g.lineTo(px,py):g.moveTo(px,py)}g.closePath();
  const fg=g.createLinearGradient(-rx,ey-ry,rx,ey+ry);fg.addColorStop(0,col.top);fg.addColorStop(0.5,col.mid);fg.addColorStop(1,col.side);g.fillStyle=fg;g.fill();
  g.strokeStyle='rgba(90,80,66,.4)';g.lineWidth=Math.max(0.5,dia*0.025);g.beginPath();g.ellipse(0,ey,rx*0.78,ry*0.78,0,0,Math.PI*2);g.stroke();   /* the flutes' ring */
  g.strokeStyle='rgba(50,42,34,.6)';g.stroke();
  g.strokeStyle='rgba(70,60,48,.45)';g.lineWidth=Math.max(0.5,dia*0.02);g.beginPath();g.moveTo(-rx*0.5,ey-ry*0.2);g.lineTo(rx*0.1,ey+ry*0.15);g.lineTo(rx*0.45,ey-ry*0.3);g.stroke();
  g.restore()}
/* half92 — v0.92 (his pick): the drum SPLIT LENGTHWISE. A half-cylinder lying cut face up: the rough fractured face on top (paler stone,
   jagged long edges, cracks), the fluted curved side showing below its near edge, a half-round cap on the end nearer the viewer. */
function half92(g,x,y,len,dia,th,seed,lift,col){len*=0.72+h91(seed,0,30)*0.38;dia*=0.86+h91(seed,0,31)*0.24;const ax=Math.cos(th),ay=Math.sin(th);let px=-ay,py=ax*0.5;const pl=Math.hypot(px,py)||1;px/=pl;py/=pl;
  if(py<0){px=-px;py=-py}   /* P points toward the viewer (down the screen) */
  const w=dia*0.5,H=dia*0.55,cy=y-lift-H;const P=(u,v,z)=>[x+ax*u+px*v,cy+ay*u+py*v+(z||0)];
  g.fillStyle='rgba(28,18,10,.34)';ell91(g,x+dia*0.14,y+dia*0.12,len*0.6,dia*0.42,th*0.5);g.fill();   /* contact shadow */
  /* jagged long edges: small chatter everywhere, deep bites in a few spots; the broken ends sit at an angle, not square */
  const n=11,J=(i,k)=>{let v=(h91(seed,i,k)-0.5)*dia*0.1;if(i>0&&i<n&&h91(seed,i,k+40)<0.22)v+=dia*(0.07+h91(seed,i,k+50)*0.09);return v};
  const U=(i,k)=>-len/2+len*i/n+((i===0||i===n)?(h91(seed,i,k+60)-0.5)*dia*0.34:(h91(seed,i,k+70)-0.5)*len*0.04);
  const far=[],near=[];for(let i=0;i<=n;i++){far.push(P(U(i,21),-w+J(i,21)));near.push(P(U(i,22),w-J(i,22)))}
  const endJag=(i,k)=>{const a=far[i],b=near[i];const out=[];for(let j=1;j<4;j++){const t=j/4,o=(h91(seed,j+i,k)-0.5)*dia*0.18;out.push([a[0]+(b[0]-a[0])*t+ax*o,a[1]+(b[1]-a[1])*t+ay*o])}return out};
  /* the curved side: from the near edge down to the sand */
  g.beginPath();near.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));for(let i=n;i>=0;i--){const q=P(-len/2+len*i/n,w*0.7,H);g.lineTo(q[0],q[1])}g.closePath();
  const sg=g.createLinearGradient(0,cy,0,cy+H+w*py);sg.addColorStop(0,col.mid);sg.addColorStop(1,col.dark);g.fillStyle=sg;g.fill();const im=stone91();if(im){g.save();g.clip();g.globalAlpha=0.55;g.drawImage(im,STONE91.x0,STONE91.y0+h91(seed,1,9)*(STONE91.y1-STONE91.y0)*0.6,STONE91.x1-STONE91.x0,(STONE91.y1-STONE91.y0)*0.3,x-len*0.6,cy-H,len*1.2,H*2.6);g.restore()}
  g.save();g.clip();g.strokeStyle='rgba(60,50,40,.35)';g.lineWidth=Math.max(0.5,dia*0.03);for(const f of [0.3,0.62]){g.beginPath();const a0=P(-len/2,w*(1-f*0.3),H*f),a1=P(len/2,w*(1-f*0.3),H*f);g.moveTo(a0[0],a0[1]);g.lineTo(a1[0],a1[1]);g.stroke()}g.restore();
  g.strokeStyle='rgba(50,42,34,.55)';g.lineWidth=Math.max(0.6,dia*0.035);g.stroke();
  /* the half-round cap on the near end */
  const e=(ax*px+ay*py)>=0?1:-1,eu=e*len/2;g.beginPath();for(let i=0;i<=10;i++){const a=i/10*Math.PI;const r=1-(i&&i<10?h91(seed,i,33)*0.22:0)-(h91(seed,i,34)<0.2?0.18:0);const q=P(eu+(h91(seed,i,35)-0.5)*dia*0.12,-Math.cos(a)*w*r,Math.sin(a)*H*r);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])}g.closePath();
  g.fillStyle=col.side;g.fill();g.stroke();
  /* the fractured face on top */
  g.beginPath();far.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));for(const q of endJag(n,36))g.lineTo(q[0],q[1]);for(let i=n;i>=0;i--)g.lineTo(near[i][0],near[i][1]);for(const q of endJag(0,37).reverse())g.lineTo(q[0],q[1]);g.closePath();
  const fg=g.createLinearGradient(far[0][0],far[0][1],near[n][0],near[n][1]);fg.addColorStop(0,col.top);fg.addColorStop(0.55,col.mid);fg.addColorStop(1,col.side);g.fillStyle=fg;g.fill();g.fillStyle='rgba(120,100,78,.18)';g.fill();
  g.strokeStyle='rgba(50,42,34,.6)';g.lineWidth=Math.max(0.6,dia*0.035);g.stroke();
  g.strokeStyle='rgba(70,60,48,.5)';g.lineWidth=Math.max(0.5,dia*0.022);for(let k=0,nk=1+Math.floor(h91(seed,0,38)*3);k<nk;k++){const u0=(h91(seed,k,23)-0.5)*len*0.7;g.beginPath();let q=P(u0,-w*0.6);g.moveTo(q[0],q[1]);q=P(u0+len*0.08,(h91(seed,k,24)-0.5)*w*0.4);g.lineTo(q[0],q[1]);q=P(u0+len*0.04,w*0.55);g.lineTo(q[0],q[1]);g.stroke()}
  g.fillStyle='rgba(90,78,62,.35)';for(let k=0;k<5;k++){const q=P((h91(seed,k,25)-0.5)*len*0.8,(h91(seed,k,26)-0.5)*w*1.4);ell91(g,q[0],q[1],dia*0.03,dia*0.02);g.fill()}}
/* stump91 — the broken stump where the pillar stood: his base + the shaft's foot, cut jagged ~0.25 TW above the sand */
function stump91(g,x,y,col){const im=stone91();const s=stoneScale91();const H=TW*WEAR91.stumpH;
  g.fillStyle='rgba(0,0,0,.3)';ell91(g,x+TW*0.03,y+TW*0.025,TW*0.3,TW*0.14);g.fill();
  if(im&&s>0){const rx=STONE91.rx*s,top=y-H,ry=rx*0.42;const seed=Math.round(x*3)^Math.round(y*5);
    g.save();g.beginPath();g.moveTo(x-im.naturalWidth*s,y+TW);g.lineTo(x-rx*1.6,top+ry*0.4);
    for(let i=0;i<=8;i++){const u=-rx+2*rx*i/8;g.lineTo(x+u,top+Math.sin((i/8)*Math.PI)*ry*0.6+(h91(seed,i,3)-0.5)*TW*0.06)}
    g.lineTo(x+rx*1.6,top+ry*0.4);g.lineTo(x+im.naturalWidth*s,y+TW);g.closePath();g.clip();
    g.drawImage(im,x-STONE91.ax*s,y-STONE91.ay*s,im.naturalWidth*s,im.naturalHeight*s);
    const lg=g.createLinearGradient(x-rx,0,x+rx,0);lg.addColorStop(0,'rgba(255,250,238,.22)');lg.addColorStop(0.5,'rgba(0,0,0,0)');lg.addColorStop(1,'rgba(20,14,8,.32)');g.fillStyle=lg;g.fillRect(x-rx,top-ry,rx*2,Math.max(0,y-(STONE91.ay-214)*s-top+ry));g.restore();   /* the shaft only: the plinth keeps its own shading, the sand none */
    /* the broken top face: lit from the upper left, rough edge, a crack */
    g.beginPath();for(let i=0;i<=16;i++){const a=i/16*Math.PI*2;const q=1+(h91(seed,i,5)-0.5)*0.18;const px=x+Math.cos(a)*rx*q,py=top+Math.sin(a)*ry*q+(Math.sin(a)>0?0:(h91(seed,i,6)-0.5)*TW*0.03);i?g.lineTo(px,py):g.moveTo(px,py)}g.closePath();
    const fg=g.createRadialGradient(x-rx*0.4,top-ry*0.4,rx*0.1,x,top,rx*1.2);fg.addColorStop(0,col.top);fg.addColorStop(0.55,col.mid);fg.addColorStop(1,col.side);g.fillStyle=fg;g.fill();
    g.strokeStyle='rgba(50,42,34,.6)';g.lineWidth=Math.max(0.6,TW*0.012);g.stroke();
    g.strokeStyle='rgba(70,60,48,.5)';g.lineWidth=Math.max(0.5,TW*0.008);g.beginPath();g.moveTo(x-rx*0.6,top-ry*0.1);g.lineTo(x-rx*0.05,top+ry*0.25);g.lineTo(x+rx*0.35,top-ry*0.35);g.stroke();
    return}
  /* the image is not loaded yet: a plain marble stump */
  const rx=TW*0.15,ry=rx*0.45,top=y-H;const lg=g.createLinearGradient(x-rx,0,x+rx,0);lg.addColorStop(0,col.mid);lg.addColorStop(0.4,col.top);lg.addColorStop(1,col.dark);
  g.fillStyle=col.side;ell91(g,x,y-TW*0.02,TW*0.24,TW*0.1);g.fill();g.fillStyle=lg;g.fillRect(x-rx,top,rx*2,H-TW*0.03);g.fillStyle=col.lite;ell91(g,x,top,rx,ry);g.fill()}
/* the rubble of one entry: dust, stump, drums and chips sorted back to front */
function rubDraw91(g,rb,G,live){const R=rub91(rb);const col=marble91();const st=WEAR91.stats;const age=Math.max(0,(S.rotation|0)-R.rot);
  const dr=rb.dr||0,dc=rb.dc||0;
  for(const k of [0,1,2]){const r=rb.r+dr*k,c=rb.c+dc*k;if(r<0||c<0||r>=N||c>=N)continue;const m=center(r,c);
    const dg=g.createRadialGradient(m.x,m.y,0,m.x,m.y,TW*0.5);const a=(k===0?0.4:0.3)*Math.max(0.45,1-age/8);dg.addColorStop(0,`rgba(232,220,196,${a})`);dg.addColorStop(1,'rgba(232,220,196,0)');
    g.save();g.translate(m.x,m.y);g.scale(1,0.5);g.translate(-m.x,-m.y);g.fillStyle=dg;g.beginPath();g.arc(m.x,m.y,TW*0.5,0,Math.PI*2);g.fill();g.restore()}
  const L=[];const sm=center(rb.r,rb.c);L.push({y:sm.y,f:()=>{stump91(g,sm.x,sm.y,col);st.stumps=(st.stumps||0)+1}});
  const th0=(()=>{const a=center(rb.r,rb.c),b=center(rb.r+dr,rb.c+dc);return Math.atan2(b.y-a.y,b.x-a.x)})();
  const roll92=(p,r,c)=>{if(!p.half||!live||typeof RUB84==='undefined'||!RUB84.t)return [r,c];const t0=RUB84.t.get(rb);if(t0==null)return [r,c];   /* the halves land together, then roll apart */
    const u=Math.max(0,Math.min(1,(performance.now()-t0-p.k*110-380)/480)),e=1-Math.pow(1-u,3);const r0=rb.r+dr*p.k,c0=rb.c+dc*p.k;return [r0+(r-r0)*e,c0+(c-c0)*e]};
  for(const p of R.pieces){const [r,c]=roll92(p,...rubPos91(rb,R,p,G));const m=center(r,c);const lift=live&&typeof rubbleSettle84==='function'?rubbleSettle84(rb,p.k,p.i):0;
    if(p.t==='drum'&&p.half)L.push({y:m.y,f:()=>{half92(g,m.x,m.y,TW*0.3*p.sz,TW*WEAR91.drumD*p.sz,th0+p.a,R.seed*13+p.i,lift,col);st.drums=(st.drums||0)+1}});
    else if(p.t==='drum')L.push({y:m.y,f:()=>{drum91(g,m.x,m.y,TW*0.3*p.sz,TW*WEAR91.drumD*p.sz,th0+p.a,R.seed*13+p.i,lift,col);st.drums=(st.drums||0)+1}});
    else L.push({y:m.y,f:()=>{chip91(g,m.x,m.y,TW*0.055*p.sz,R.seed*17+p.i,lift,col);st.chips=(st.chips||0)+1;if(p.out||Math.min(r,c,N-1-r,N-1-c)<-0.5)st.gullyChips=(st.gullyChips||0)+1}})}
  L.sort((a,b)=>a.y-b.y);for(const o of L)o.f()}
/* ---------- 4. the worn paths and the scuffs ---------- */
function wearDraw91(g,w){const st=WEAR91.stats;const tile=(typeof TB!=='undefined'&&TB.tileA)||'#d3ba8e';const flat=shade(tile,-0.26);
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){const n=w.cnt[r*N+c];if(n<0.5)continue;if(typeof spikeAt==="function"&&spikeAt(r,c))continue;if((S.tunnels||[]).some(t=>t.r===r&&t.c===c))continue;
    const a=0.3*(1-Math.exp(-n/5));const m=center(r,c);g.save();g.translate(m.x,m.y);g.scale(1,0.5);
    const gr=g.createRadialGradient(0,0,0,0,0,TW*0.62);gr.addColorStop(0,flat);gr.addColorStop(0.5,flat);gr.addColorStop(1,'rgba(0,0,0,0)');
    g.globalAlpha=a;g.fillStyle=gr;g.beginPath();g.arc(0,0,TW*0.62,0,Math.PI*2);g.fill();g.restore();st.wear=(st.wear||0)+1}
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){const n=w.scuff[r*N+c];if(!n)continue;const m=center(r,c);const a=Math.min(0.5,0.2+0.07*n);
    g.save();g.translate(m.x,m.y);g.scale(1,0.5);g.lineCap='round';
    for(let i=0;i<Math.min(5,1+n);i++){const an=h91(r,c,20+i)*Math.PI*2,d=TW*0.22*h91(r,c,30+i),x=Math.cos(an)*d,y=Math.sin(an)*d,L=TW*(0.08+h91(r,c,40+i)*0.1),t=h91(r,c,50+i)*Math.PI;
      g.globalAlpha=a;g.strokeStyle='rgba(78,50,24,1)';g.lineWidth=Math.max(1,TW*0.03);g.beginPath();g.moveTo(x-Math.cos(t)*L,y-Math.sin(t)*L);g.quadraticCurveTo(x+Math.sin(t)*L*0.3,y-Math.cos(t)*L*0.3,x+Math.cos(t)*L,y+Math.sin(t)*L);g.stroke();
      g.globalAlpha=a*0.8;g.strokeStyle='rgba(255,242,212,1)';g.lineWidth=Math.max(0.6,TW*0.012);g.beginPath();g.moveTo(x-Math.cos(t)*L+2,y-Math.sin(t)*L+3);g.lineTo(x+Math.cos(t)*L+2,y+Math.sin(t)*L+3);g.stroke()}
    g.fillStyle='rgba(120,88,52,1)';for(let i=0;i<6;i++){g.globalAlpha=a*0.7;const an=h91(r,c,60+i)*Math.PI*2,d=TW*(0.15+0.25*h91(r,c,70+i));ell91(g,Math.cos(an)*d,Math.sin(an)*d,TW*0.012,TW*0.009);g.fill()}
    g.restore();st.scuffs=(st.scuffs||0)+1}}
/* ---------- 1. the trickles ---------- */
function tricklePlan91(dr,G){const out=[];if(!S.blood||!S.blood.length||SETTINGS.gore===false)return out;if(typeof isNaum==='function'&&isNaum())return out;
  for(let i=S.blood.length-1;i>=0&&out.length<WEAR91.trickleMax;i--){const B=S.blood[i];if(!B||B.r==null)continue;const e=edge91(B.r,B.c);if(e.d>1)continue;
    if(dr.length){const m0=center(B.r,B.c),m1=center(B.r+e.sr,B.c+e.sc);if(m1.y>m0.y)continue} /* v0.91: no gully on the near edges — blood there stays on the sand */
    if(B.kind==='drop'&&(B.seed||0)%3)continue;if((S.tunnels||[]).some(t=>t.r===B.r&&t.c===B.c))continue;
    const sd=B.seed||1;const fa=typeof bloodFade84==='function'?bloodFade84(B):1;
    const jit=(h91(sd,1,1)-0.5)*0.5;const r0=B.r+(e.sc?jit:0),c0=B.c+(e.sr?jit:0);
    const P0=center(B.r+e.sr*0.12+(e.sc?jit*0.4:0),B.c+e.sc*0.12+(e.sr?jit*0.4:0));
    const eg=(x,base,o)=>x?(x<0?-0.5-o:N-0.5+o):base;const E=center(eg(e.sr,r0,0),eg(e.sc,c0,0)),Gp=center(eg(e.sr,r0,G),eg(e.sc,c0,G));
    const pts=[P0,E,Gp];let drain=-1;
    if(dr.length){let bi=-1,bd=1e9;dr.forEach((d,j)=>{const q=Math.hypot(d.x-Gp.x,d.y-Gp.y);if(q<bd){bd=q;bi=j}});
      const maxL=TW*2.6;const D=dr[bi];if(bd<=maxL){pts.push({x:D.x,y:D.y});drain=bi}else pts.push({x:Gp.x+(D.x-Gp.x)/bd*maxL,y:Gp.y+(D.y-Gp.y)/bd*maxL})}
    out.push({B,pts,fa,sd,drain,col:typeof bloodCol84==='function'?bloodCol84('#6e120c',fa):'#6e120c'})}
  return out}
function trickleDraw91(g,T){const st=WEAR91.stats;
  /* densify with a seeded wobble, then taper */
  const P=[];for(let i=0;i<T.pts.length-1;i++){const A=T.pts[i],B=T.pts[i+1];const L=Math.hypot(B.x-A.x,B.y-A.y);const n=Math.max(2,Math.ceil(L/(TW*0.12)));const nx=-(B.y-A.y)/(L||1),ny=(B.x-A.x)/(L||1);
    for(let j=0;j<n;j++){const u=j/n;const w=(h91(T.sd,i*40+j,13)-0.5)*TW*0.035*(j?1:0);P.push({x:A.x+(B.x-A.x)*u+nx*w,y:A.y+(B.y-A.y)*u+ny*w})}}
  P.push(T.pts[T.pts.length-1]);
  g.save();g.lineCap='round';g.lineJoin='round';g.strokeStyle=T.col;
  const n=P.length;for(let i=0;i<n-1;i++){const u=i/(n-1);g.globalAlpha=0.6*T.fa*(1-u*0.55);g.lineWidth=Math.max(0.7,TW*0.026*(1-u*0.6));
    g.beginPath();g.moveTo(P[i].x,P[i].y);g.lineTo(P[i+1].x,P[i+1].y);g.stroke()}
  g.restore();st.trickles=(st.trickles||0)+1}
function stainDraw91(g,dr,plan){const st=WEAR91.stats;const best=new Map();for(const T of plan)if(T.drain>=0)best.set(T.drain,Math.max(best.get(T.drain)||0,T.fa));
  const w=wear91St();if(w){w.stain=w.stain||new Map();for(const [j,f] of best)w.stain.set(j,Math.max(w.stain.get(j)||0,f));for(const [j,f] of w.stain)if(!best.has(j)&&j<dr.length)best.set(j,Math.max(0.22,f*0.7))}
  for(const [j,f] of best){const D=dr[j];if(!D)continue;const gr=g.createRadialGradient(D.x,D.y,0,D.x,D.y,TW*0.16);gr.addColorStop(0,`rgba(96,14,8,${0.42*f})`);gr.addColorStop(1,'rgba(96,14,8,0)');
    g.fillStyle=gr;g.save();g.translate(D.x,D.y);g.scale(1,0.55);g.translate(-D.x,-D.y);g.beginPath();g.arc(D.x,D.y,TW*0.16,0,Math.PI*2);g.fill();g.restore();st.stains=(st.stains||0)+1}}
/* ---------- the layer: baked, or live while rubble settles ---------- */
const WEAR91_C={cv:null,key:'',ox:0,oy:0,bx:0,by:0,bw:0,bh:0};
const WEAR91_SID=new WeakMap();let WEAR91_N=0;
function sid91(){let i=WEAR91_SID.get(S);if(!i){i=++WEAR91_N;WEAR91_SID.set(S,i)}return i}
function settling91(rb){if(typeof RUB84==='undefined')return false;const t0=RUB84.t.get(rb);return t0!=null&&performance.now()-t0<LIFE84.settleMs+700}
function wear91Layer(rubble){if(!WEAR91.on||!S)return;const t0=performance.now();
  const lite=wear91Lite();const w=wear91St();const dr=drains91();const G=gully91(dr);
  const rubs=(rubble||[]).filter(rb=>rb&&rb.r!=null);const live=rubs.filter(settling91),still=rubs.filter(rb=>!live.includes(rb));
  const plan=lite?[]:tricklePlan91(dr,G);
  const anyWear=!lite&&w&&(w.cnt.some(v=>v>=0.5)||w.scuff.some(v=>v>0));
  WEAR91.stats={};const st=WEAR91.stats;st.lite=lite;st.drains=dr.length;st.gully=G;
  if(plan.length||anyWear||still.length||(w&&w.stain&&w.stain.size&&!lite)){
    const dpr=window.devicePixelRatio||1;
    const key=[sid91(),TW,typeof ROT89!=='undefined'?ROT89.k:0,dpr,lite?1:0,SETTINGS.gore===false?0:1,w?w.ver:0,S.rotation|0,(S.blood||[]).length,(S.blood||[]).map(b=>b.seed).slice(-3).join('.'),
      still.map(rb=>rb.r+','+rb.c+','+rb.dr+','+rb.dc).join(';'),dr.map(d=>Math.round(d.x-OX)+'/'+Math.round(d.y-OY)).join(';'),stone91()?1:0,(typeof TB!=='undefined'&&TB.tileA)||'',(typeof THEME!=='undefined'&&THEME.pillar)||''].join('|');
    if(key!==WEAR91_C.key){const tb=performance.now();const a=isoFix(0,0),b=isoFix(0,N),c=isoFix(N,N),d=isoFix(N,0);
      const bx=Math.floor(d.x-TW*1.6),by=Math.floor(a.y-TW*1.2),bw=Math.ceil(b.x+TW*1.6-bx),bh=Math.ceil(c.y+TW*1.3-by);
      const sc=Math.min(dpr,WEAR91.bakeDpr,Math.sqrt(WEAR91.bakeMaxPx/(bw*bh)));
      const cv2=WEAR91_C.cv||(WEAR91_C.cv=document.createElement('canvas'));const pw=Math.max(1,Math.round(bw*sc)),ph=Math.max(1,Math.round(bh*sc));if(cv2.width!==pw||cv2.height!==ph){cv2.width=pw;cv2.height=ph}   /* resizing reallocates: only when the size changes */
      const g=cv2.getContext('2d');g.setTransform(sc,0,0,sc,-bx*sc,-by*sc);g.clearRect(bx,by,bw,bh);
      if(anyWear)wearDraw91(g,w);
      for(const T of plan)trickleDraw91(g,T);
      if(!lite&&SETTINGS.gore!==false&&dr.length)stainDraw91(g,dr,plan);
      for(const rb of still)rubDraw91(g,rb,G,false);
      Object.assign(WEAR91_C,{key,ox:OX,oy:OY,bx,by,bw,bh});WEAR91.bakeStats={...st};WEAR91.lastBakeMs=performance.now()-tb;WEAR91.bakes++}
    else Object.assign(st,WEAR91.bakeStats||{});
    ctx.drawImage(WEAR91_C.cv,WEAR91_C.bx+(OX-WEAR91_C.ox),WEAR91_C.by+(OY-WEAR91_C.oy),WEAR91_C.bw,WEAR91_C.bh);st.cached=true}
  for(const rb of live)rubDraw91(ctx,rb,G,true);
  st.live=live.length;WEAR91.lastMs=performance.now()-t0}
/* the hook: for one draw, S.rubble is an empty list whose iteration draws this layer (07-ui's rubble loop sits right where it belongs) */
{const base=draw;draw=function(){if(HEADLESS||!WEAR91.on||typeof S==='undefined'||!S||S.snap)return base.apply(this,arguments);
  try{wear91Sample()}catch(e){}
  const had=Object.prototype.hasOwnProperty.call(S,'rubble'),real=S.rubble,S0=S;const hook=[];hook[Symbol.iterator]=function*(){try{wear91Layer(real)}catch(e){WEAR91.err=String(e&&e.message||e)}};
  S.rubble=hook;try{return base.apply(this,arguments)}finally{if(S0.rubble===hook){if(had)S0.rubble=real;else delete S0.rubble}}}}

/* RUBBLE IS WALKABLE (his note 2026-10-06): rubble never blocks a move, so it must not look like a wall — the stump is a low broken ring
   at the plinth (WEAR91.stumpH), the fallen drums lie low (drumD), every piece keeps off the middle of its tile (clear), and the hover
   line says so. */
function rubbleOn91(r,c){for(const rb of (S&&S.rubble)||[]){const dr=rb.dr||0,dc=rb.dc||0;for(let k=0;k<3;k++)if(rb.r+dr*k===r&&rb.c+dc*k===c)return true}return false}
{const base=describeTile;describeTile=function(t){let h=base.apply(this,arguments);try{if(t&&S&&typeof h==='string'&&rubbleOn91(t.r,t.c)&&!pillarAt(t.r,t.c))h+=' · '+_T('Rubble — walkable')}catch(e){}return h}}

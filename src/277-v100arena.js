/* =====================================================================
   277-V100ARENA · v1.0 THE ARENA LOOK, ROUND 2 (his picks 2026-10-11: 1a 2b 3b 4a 5a; source tools/plans/look100/NOTES-arena.md
   "Round 2" + the arena2_* prototype; shots tools/plans/arena100/)
   =====================================================================
   DISPLAY ONLY: no rules, no dice (fixed seeds only), never in S or the online hash. Everything new is painted inside 192's BAKED
   layers ('under' / 'top'), so a cached frame only blits them; a re-bake happens on resize, zoom step, turn, theme, night or a
   texture load (192/208 keys: ar91Mat().n names the arena + this look).
   • A STONE FAMILY PER ARENA (A100[k], k = THEME.arena99 → S.locIdx → Roma, like 266): its own tileable WebP
     assets/stone100_<k>_<key>.webp (12 files, ~400 KB in all, ONE loaded on demand through ar91Img — the arena on screen),
     its cap colour, rail style and colours, a dado band. Walls keep 192's screen pattern (pinned to the board middle);
     the FLAT fills (192 passes 'floor': the foundation top, the near floor, the far gully) get an ISO matrix so the slabs
     lie on the floor (150 texture px per tile along one grid axis, 80 along the other → squarer paving than the wall courses).
   • THE RAILING on the near-stand line (the old faint black line), in 'under' — before the tiles, so the sand covers anything
     taller: nothing ever shows over the sand or a piece (tv91r's clarity rule by construction). Families follow the stone (3a):
     travertine/limestone → BRONZE (round bar, knobbed posts every ½ tile, a low second bar), sandstone/tuff → stone BALUSTRADE
     (plinth, vase balusters, coping), marble → PARAPET (veined slab, a joint per tile, bronze rail on stubs). Bronze per
     arena (5a): gilt Roma/Verona/Leptis/Capua, bronze Syracusae/Arles, dark Nemausus, verdigris Pola. CAPUA (3b) = the gilt
     parapet on red stone (a grand arena).
   • CORNERS (1a): each corner tower gets a PLINTH that carries its front face down to the walkway; every rail run ends on a
     stone PIER — against each tower's inner face, both sides of each stair opening, and one (bigger) at the near corner —
     and nowhere else. Geometry from 192's ar91NearGeom (one helper for tower, wall, plinth and rail), found by screen
     position at every bake, so it follows the turned board (ROT89).
   • THE BAND (2b): a dado band with a motif on ALL 12 arenas — on the foundation's side faces and the tower fronts (192's
     ar91Face hook) and low along the foot of the far walls (ar91TopPaint wrapper, kept off the towers).
   • PALETTES (4a): THEMES99 Capua/Thysdrus/Pompeii benches, Leptis buttons/borders/rim/grid (A100PAL) — every text pair
     stays WCAG AA (tv100r); the default Arena theme is untouched. A saved Leptis preset with the old values is refreshed once.
   • Ludus (beast pen / exhibitions) keeps its plaster; the Light board (lite84On) skips rail shadows + baluster gradients;
     night is graded by 189 after the layers (nothing to do).
   • KILL SWITCH localStorage flavius_arena100off=1 (read at load) → every wrapper passes straight through and the palettes stay
     as 266 left them: today's look (tv100r: pixel-identical to the bare 192 functions). A100X.set(on) flips it for tests.
   ===================================================================== */
const A100X={on:true,cnt:{band:0,run:0,pier:0,plinth:0},last:null,asked:{},mat:{},B:{}};
try{if(localStorage.getItem('flavius_arena100off')==='1')A100X.on=false}catch(e){}
/* the metal of a rail: [light, mid, dark] */
const A100BRZ={gilt:['#f6d888','#b8862e','#6a4512'],bronze:['#e6b864','#a8732e','#5e3c14'],dark:['#c89a5a','#7e5426','#3e2610'],verd:['#b4dcc8','#5f9a86','#2e5446']};
/* A100 — the twelve arenas: stone family (n), texture key, cap, rail + its colours, band {c colour, f fillet/motif, m motif} */
const A100={
 1:{key:'syracusae',n:'Greek marble',cap:'#e4eaee',rail:'parapet',slab:['#f8fbfd','#d2dce4'],metal:'bronze',band:{c:'#2c5a88',f:'#f2f6fa',m:'meander'}},
 2:{key:'verona',n:'Rosso Verona marble',cap:'#e8b8aa',rail:'parapet',slab:['#f4cabd','#cf9182'],metal:'gilt',band:{c:'#8e3446',f:'#f4e4d8',m:'dentil'}},
 3:{key:'arles',n:'Gallic limestone',cap:'#e4cb94',rail:'bronze',metal:'bronze',band:{c:'#7c3a1c',f:'#f0d49a',m:'dots'}},
 4:{key:'capua',n:'Campanian red stone',cap:'#86463a',rail:'parapet',slab:['#c98474','#8a4838'],metal:'gilt',band:{c:'#1e1412',f:'#b2443a',m:'plain'}},
 5:{key:'thysdrus',n:'African sandstone',cap:'#dda466',rail:'balus',stone:['#f4cc90','#d39a58','#8a5626'],band:{c:'#24505e',f:'#f6d6a0',m:'chevron'}},
 6:{key:'roma',n:'Travertine',cap:'#e8d6b4',rail:'bronze',metal:'gilt',band:{c:'#7e1e1a',f:'#e8c060',m:'laurel'}},
 7:{key:'nemausus',n:'Gallic limestone + brick',cap:'#cfccb2',rail:'bronze',metal:'dark',band:{c:'#34502e',f:'#e6dfc0',m:'guilloche'}},
 8:{key:'pompeii',n:'Tuff reticulatum',cap:'#a09a92',rail:'balus',stone:['#dcd6cc','#a39d94','#5a5450'],band:{c:'#a3302a',f:'#1c1210',m:'plain'}},
 9:{key:'leptis',n:'Proconnesian marble',cap:'#f2f0ea',rail:'parapet',slab:['#fdfcf8','#dedad0'],metal:'gilt',band:{c:'#4c7a5a',f:'#e8efe6',m:'wave'}},
 10:{key:'uthina',n:'Punic opus africanum',cap:'#d6b8aa',rail:'balus',stone:['#efd4c8','#c8a698','#76585a'],band:{c:'#4c2a52',f:'#f0b478',m:'rosette'}},
 11:{key:'pola',n:'Istrian white stone',cap:'#eae9e2',rail:'bronze',metal:'verd',band:{c:'#1d5652',f:'#e6f2ee',m:'lozenge'}},
 12:{key:'puteoli',n:'Yellow tuff, opus listatum',cap:'#d8c072',rail:'balus',stone:['#f2e2a0','#d2b868','#86702e'],band:{c:'#3c3610',f:'#ead63e',m:'tooth'}}};
/* A100PAL — the four THEMES99 palette changes (4a), only the keys that change */
const A100PAL={4:{board:{standA:'#3a2622',standB:'#4a302a'}},5:{board:{standA:'#5a3416',standB:'#6c4220'}},8:{board:{standA:'#5e2a24',standB:'#70342c'}},
  9:{ui:{blood:'#3f6b4c',line2:'#5f6e58'},board:{rim:'#3f5446',grid:'#9a9c80'}}};
const A100OLD={};
/* a100Pal — put the palette changes into THEMES99 + the arena presets / location flavours (on) or back (off) */
function a100Pal(on){if(typeof THEMES99==='undefined')return;
  for(const [k,ch] of Object.entries(A100PAL)){const P=THEMES99.P[k];if(!P)continue;A100OLD[k]=A100OLD[k]||{ui:{},board:{}};
    for(const part of ['ui','board'])for(const [x,v] of Object.entries(ch[part]||{})){if(!(x in A100OLD[k][part]))A100OLD[k][part][x]=P[part][x];P[part][x]=on?v:A100OLD[k][part][x]}
    if(!THEMES99.on)continue;
    if(LOC_THEMES[k])LOC_THEMES[k].v={...P.board,arena99:+k};
    if(THEME_PRESETS['loc'+k])THEME_PRESETS['loc'+k].v={...P.ui,...P.board,arena99:+k}}}
/* a100K — the arena whose stone the board wears (null: the ludus / the look switched off) */
function a100K(){if(!A100X.on)return null;if(typeof ar91Lud==='function'&&ar91Lud())return null;let k=null;
  try{k=typeof THEME!=='undefined'&&THEME&&THEME.arena99}catch(e){}if(!A100[k]){try{k=S&&S.locIdx}catch(e){k=null}}return A100[k]?+k:6}
const a100A=()=>{const k=a100K();return k?A100[k]:null};
const a100Lite=()=>typeof lite84On==='function'&&lite84On();
A100X.file=k=>'stone100_'+k+'_'+A100[k].key+'.webp';

/* ---------- stone: the mat, the texture, floor vs wall ---------- */
{const B=A100X.B;B.mat=ar91Mat;B.tex=ar91Tex;B.fill=ar91Fill;B.face=ar91Face;B.top=ar91TopPaint;B.under=ar91Under;
ar91Mat=function(){const m=B.mat.apply(this,arguments);const k=a100K();if(!k)return m;const C=A100X.mat[k];if(C&&C.base===m)return C.m;
  const a=A100[k];const r={...m,n:'stone100 '+k+' '+a.n,cap:a.cap,a100:k};A100X.mat[k]={base:m,m:r};return r};
ar91Tex=function(){const k=a100K();if(!k)return B.tex.apply(this,arguments);const f=A100X.file(k);
  if(!A100X.asked[f])A100X.asked[f]=performance.now();const im=ar91Img(ar91Asset(f));if(!im)return null;
  const n=ar91Mat().n;if(!AR91TEX[n])AR91TEX[n]=im /* the key's "texture in" flag (192/208) and tv91r's wait */;return im};
ar91Fill=function(g,scale,kind){if(!AR91PAT||!a100K())return B.fill.apply(this,arguments);
  try{if(kind==='floor'){const o=center(-0.5,-0.5),u0=center(-0.5,0.5),v0=center(0.5,-0.5),ku=150,kv=80;
      AR91PAT.setTransform(new DOMMatrix([(u0.x-o.x)/ku,(u0.y-o.y)/ku,(v0.x-o.x)/kv,(v0.y-o.y)/kv,o.x,o.y]))}
    else{const o=center((N-1)/2,(N-1)/2);AR91PAT.setTransform(new DOMMatrix().translate(o.x,o.y).scale((scale||1)*TW*0.82/170))}}catch(e){}
  g.fillStyle=AR91PAT};}

/* ---------- the dado band: a vertical face with top edge p→q and height h (local x along the edge, y down) ---------- */
function a100Band(g,p,q,h,t0,t1,bd){const L=Math.hypot(q.x-p.x,q.y-p.y);if(L<2||h<2)return;const ux=(q.x-p.x)/L,uy=(q.y-p.y)/L;g.save();g.transform(ux,uy,0,1,p.x,p.y);
  const y0=h*t0,y1=h*t1,bh=y1-y0,fl=Math.max(0.8,bh*0.1);g.fillStyle=bd.c;g.fillRect(0,y0,L,bh);g.fillStyle=bd.f;g.fillRect(0,y0-fl,L,fl);g.fillRect(0,y1,L,fl);
  g.strokeStyle=bd.f;g.fillStyle=bd.f;g.lineWidth=Math.max(0.7,bh*0.09);const a=y0+bh*0.2,b=y1-bh*0.2,hh=b-a,m=(a+b)/2;
  if(bd.m==='meander'&&hh>2.5){const u=hh*1.6;g.beginPath();for(let x=0;x<L;x+=u){g.moveTo(x,b);g.lineTo(x,a);g.lineTo(x+u*0.75,a);g.lineTo(x+u*0.75,b-hh*0.66);g.lineTo(x+u*0.4,b-hh*0.66);g.lineTo(x+u*0.4,b-hh*0.33);g.lineTo(x+u*0.95,b-hh*0.33);g.lineTo(x+u*0.95,b);g.lineTo(x+u,b)}g.stroke()}
  else if(bd.m==='dentil'&&hh>1.5){const u=Math.max(3,hh*1.1);for(let x=0;x<L;x+=u)g.fillRect(x,a,u*0.55,hh)}
  else if(bd.m==='wave'&&hh>2){const u=hh*2;g.beginPath();g.moveTo(0,b);for(let x=0;x<L;x+=u){g.quadraticCurveTo(x+u*0.25,a-hh*0.1,x+u*0.55,a+hh*0.35);g.quadraticCurveTo(x+u*0.6,b-hh*0.2,x+u*0.42,b-hh*0.25);g.moveTo(x+u*0.55,b);g.lineTo(x+u,b)}g.stroke()}
  else if(bd.m==='dots'&&hh>1.2){const u=Math.max(3,hh*1.5),r=Math.max(0.6,hh*0.32);for(let x=u/2;x<L;x+=u){g.beginPath();g.arc(x,m,r,0,Math.PI*2);g.fill()}}
  else if(bd.m==='chevron'&&hh>1.5){const u=Math.max(3,hh*1.4);g.beginPath();g.moveTo(0,b);for(let x=0;x<L;x+=u){g.lineTo(x+u/2,a);g.lineTo(x+u,b)}g.stroke()}
  else if(bd.m==='tooth'&&hh>1.5){const u=Math.max(3,hh*1.2);g.beginPath();for(let x=0;x<L;x+=u){g.moveTo(x,b);g.lineTo(x+u*0.5,a);g.lineTo(x+u,b);g.closePath()}g.fill()}
  else if(bd.m==='lozenge'&&hh>1.5){const u=Math.max(3,hh*1.6);g.beginPath();for(let x=0;x<L;x+=u){g.moveTo(x+u*0.5,a);g.lineTo(x+u*0.85,m);g.lineTo(x+u*0.5,b);g.lineTo(x+u*0.15,m);g.closePath()}g.stroke()}
  else if(bd.m==='guilloche'&&hh>2){const u=hh*2.2;for(const ph of [0,Math.PI]){g.beginPath();for(let x=0;x<=L;x+=Math.max(1,u/8)){const y=m+Math.sin(x/u*Math.PI*2+ph)*hh*0.42;x?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}}
  else if(bd.m==='laurel'&&hh>2){g.beginPath();g.moveTo(0,m);g.lineTo(L,m);g.stroke();const u=Math.max(4,hh*1.3);
    for(let x=0;x<L;x+=u)for(const s of [-1,1]){g.beginPath();g.ellipse(x+u*0.5,m+s*hh*0.26,u*0.32,hh*0.16,s*0.5,0,Math.PI*2);g.fill()}}
  else if(bd.m==='rosette'&&hh>2){const u=Math.max(4,hh*1.8),r=hh*0.42;for(let x=u/2;x<L;x+=u){for(let i=0;i<4;i++){const t=i*Math.PI/2+Math.PI/4;g.beginPath();g.ellipse(x+Math.cos(t)*r*0.5,m+Math.sin(t)*r*0.5,r*0.5,r*0.26,t,0,Math.PI*2);g.fill()}
    g.fillStyle=bd.c;g.beginPath();g.arc(x,m,r*0.18,0,Math.PI*2);g.fill();g.fillStyle=bd.f}}
  g.restore();A100X.cnt.band++}
/* ar91Face: the band on the foundation's side faces and the tower fronts */
ar91Face=function(g,Q,kind,shadeA){const r=A100X.B.face.apply(this,arguments);const a=a100A();if(!a||!a.band||!Q||Q.length!==4)return r;
  try{const top=Q[0].y<Q[3].y;const p=top?Q[0]:Q[3],q=top?Q[1]:Q[2],h=Math.abs(Q[3].y-Q[0].y);a100Band(g,p,q,h,0.34,0.7,a.band);
    if(shadeA){ar91Path(g,Q);g.fillStyle=shadeA;g.globalAlpha=0.45;g.fill();g.globalAlpha=1}}catch(e){}return r};
/* the band low along the foot of the far walls — stopped at the towers' faces */
ar91TopPaint=function(g,out){const r=A100X.B.top.apply(this,arguments);const a=a100A();if(!a||!a.band)return r;
  try{const G=ar91NearGeom();const xs=G.towers.map(T=>[T.x-G.k-G.lip,T.x+G.k+G.lip]);
    for(const w of out.walls){let A0=w.a,B0=w.b;const cut=(P,Q)=>{for(const [x0,x1] of xs)if(P.x>x0-0.5&&P.x<x1+0.5){const x=P.x<Q.x?x1:x0;const t=(x-P.x)/((Q.x-P.x)||1);return {x,y:P.y+(Q.y-P.y)*t}}return P};
      A0=cut(w.a,w.b);B0=cut(w.b,w.a);const hb=w.H*0.14;a100Band(g,{x:A0.x,y:A0.y-hb},{x:B0.x,y:B0.y-hb},hb,0.08,0.92,a.band)}}catch(e){}return r};

/* ---------- the railing + the corners (layer 'under': before the tiles, so the sand covers anything taller) ---------- */
/* a100Geom — the near sides from ar91NearGeom: rail line yAt(x) (the wall's foot, the old faint line), the tower's inner face xt,
   the stair opening (the middle of the side, ±0.42 tile) and the near corner; runs in screen x */
function a100Geom(){const G=ar91NearGeom();const Hc=G.Hc,k=G.k,lip=G.lip,mid=G.mid;const out=[];
  for(const W of G.near){const a=W.a0,b=W.b0,left=W.left;const A0={x:a.x,y:a.y+Hc},B0={x:b.x,y:b.y+Hc};const yAt=x=>A0.y+(B0.y-A0.y)*(x-A0.x)/(B0.x-A0.x);
    const T=left?G.towers[0]:G.towers[1];const xt=left?T.x+k+lip:T.x-k-lip;
    const tile=Math.hypot(b.x-a.x,b.y-a.y)/(N+0.38);const gm=(a.x+b.x)/2,gw=tile*0.42*Math.abs(b.x-a.x)/Math.hypot(b.x-a.x,b.y-a.y);
    const xs=left?[xt,gm-gw,gm+gw,b.x]:[a.x,gm-gw,gm+gw,xt];
    out.push({left,Hc,tile,yAt,T,xt,gm,gw,runs:[[xs[0],xs[1]],[xs[2],xs[3]]],corner:left?b:a,in:{x:mid.x-(a.x+b.x)/2,y:mid.y-(a.y+b.y)/2}})}
  return {edges:out,towers:G.towers,k,lip,Hc}}
const a100In=(R,s)=>{const d=Math.hypot(R.in.x,R.in.y)||1;return {x:R.in.x/d*s,y:R.in.y/d*s*0.5}};
const a100Pt=(R,x)=>({x,y:R.yAt(x)});
function a100Shadow(g,p,q){if(a100Lite())return;g.fillStyle='rgba(30,18,8,.24)';ar91Path(g,[p,q,{x:q.x+TW*0.05,y:q.y+TW*0.035},{x:p.x+TW*0.05,y:p.y+TW*0.035}]);g.fill()}
function a100Grad(g,x0,x1,M){if(a100Lite())return M[1];const gr=g.createLinearGradient(x0,0,x1,0);gr.addColorStop(0,M[0]);gr.addColorStop(.45,M[1]);gr.addColorStop(1,M[2]);return gr}
function a100Bar(g,p,q,rt,M){g.lineCap='butt';g.strokeStyle=M[2];g.lineWidth=rt+1;g.beginPath();g.moveTo(p.x,p.y+0.8);g.lineTo(q.x,q.y+0.8);g.stroke();
  g.strokeStyle=M[1];g.lineWidth=rt;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();g.strokeStyle=M[0];g.lineWidth=Math.max(0.7,rt*0.35);g.beginPath();g.moveTo(p.x,p.y-rt*0.25);g.lineTo(q.x,q.y-rt*0.25);g.stroke()}
function a100Bronze(g,R,p,q,a){const M=A100BRZ[a.metal||'bronze'];const h=R.Hc*0.86,pw=Math.max(1.2,TW*0.028),rt=Math.max(1.4,TW*0.03);a100Shadow(g,p,q);
  const L=Math.hypot(q.x-p.x,q.y-p.y),n=Math.max(1,Math.round(L/(R.tile*0.5)));g.strokeStyle=M[2];g.lineWidth=Math.max(1,rt*0.6);g.beginPath();g.moveTo(p.x,p.y-h*0.35);g.lineTo(q.x,q.y-h*0.35);g.stroke();
  for(let i=1;i<n;i++){const x=p.x+(q.x-p.x)*i/n,y=p.y+(q.y-p.y)*i/n;g.fillStyle=a100Grad(g,x-pw/2,x+pw/2,M);g.fillRect(x-pw/2,y-h,pw,h);g.fillStyle=M[2];g.fillRect(x-pw*0.8,y-Math.max(1,TW*0.012),pw*1.6,Math.max(1,TW*0.012));g.fillStyle=M[0];g.beginPath();g.arc(x,y-h,pw*0.75,0,Math.PI*2);g.fill()}
  a100Bar(g,{x:p.x,y:p.y-h},{x:q.x,y:q.y-h},rt,M)}
function a100Balus(g,R,p,q,a){const S3=a.stone,h=R.Hc*0.98,pl=Math.max(1.6,h*0.2),cp=Math.max(1.8,h*0.2),iv=a100In(R,TW*0.05);a100Shadow(g,p,q);
  g.fillStyle='rgba(36,24,14,.55)';ar91Path(g,[{x:p.x,y:p.y-h},{x:q.x,y:q.y-h},q,p]);g.fill();
  ar91Path(g,[{x:p.x,y:p.y-pl},{x:q.x,y:q.y-pl},q,p]);g.fillStyle=S3[1];g.fill();g.strokeStyle='rgba(40,28,16,.55)';g.lineWidth=0.7;g.stroke();
  const L=Math.hypot(q.x-p.x,q.y-p.y),bw=Math.max(2.6,TW*0.065),n=Math.max(1,Math.floor(L/Math.max(bw*1.55,R.tile*0.13)));
  for(let i=0;i<n;i++){const t=(i+0.5)/n,x=p.x+(q.x-p.x)*t,y=p.y+(q.y-p.y)*t-pl,bh=h-pl-cp;g.fillStyle=a100Grad(g,x-bw/2,x+bw/2,S3);
    g.beginPath();g.moveTo(x-bw*0.4,y);g.lineTo(x+bw*0.4,y);g.quadraticCurveTo(x+bw*0.7,y-bh*0.38,x+bw*0.2,y-bh*0.74);g.lineTo(x+bw*0.34,y-bh);g.lineTo(x-bw*0.34,y-bh);g.lineTo(x-bw*0.2,y-bh*0.74);g.quadraticCurveTo(x-bw*0.7,y-bh*0.38,x-bw*0.4,y);g.closePath();g.fill();g.strokeStyle='rgba(50,36,22,.6)';g.lineWidth=0.6;g.stroke()}
  const T0={x:p.x,y:p.y-h},T1={x:q.x,y:q.y-h};ar91Path(g,[{x:T0.x+iv.x*0.5,y:T0.y+iv.y*0.5},{x:T1.x+iv.x*0.5,y:T1.y+iv.y*0.5},T1,T0]);g.fillStyle=S3[0];g.fill();
  ar91Path(g,[T0,T1,{x:T1.x,y:T1.y+cp},{x:T0.x,y:T0.y+cp}]);g.fillStyle=S3[1];g.fill();g.fillStyle=R.left?'rgba(255,250,236,.12)':'rgba(40,28,16,.18)';g.fill();
  g.strokeStyle='rgba(40,28,16,.6)';g.lineWidth=0.7;g.beginPath();g.moveTo(T0.x,T0.y+cp);g.lineTo(T1.x,T1.y+cp);g.stroke()}
function a100Parapet(g,R,p,q,a){const h=R.Hc*0.96,wall=h*0.62,iv=a100In(R,TW*0.06),M=A100BRZ[a.metal||'bronze'];a100Shadow(g,p,q);const lite=a100Lite();
  const F=[{x:p.x,y:p.y-wall},{x:q.x,y:q.y-wall},q,p];let mg=a.slab[1];if(!lite){mg=g.createLinearGradient(0,Math.min(p.y,q.y)-wall,0,Math.max(p.y,q.y));mg.addColorStop(0,a.slab[0]);mg.addColorStop(1,a.slab[1])}
  g.fillStyle=mg;ar91Path(g,F);g.fill();g.fillStyle=R.left?'rgba(255,255,255,.05)':'rgba(60,50,40,.16)';g.fill();
  const L=Math.hypot(q.x-p.x,q.y-p.y);g.save();ar91Path(g,F);g.clip();
  if(!lite){g.strokeStyle='rgba(110,100,92,.35)';g.lineWidth=0.6;let s=7;const rn=()=>{s=(s*16807)%2147483647;return s/2147483647};
    for(let i=0;i<Math.round(L/TW*3);i++){const t=rn(),x=p.x+(q.x-p.x)*t,y=p.y+(q.y-p.y)*t-wall*rn();g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+TW*0.12,y-wall*0.2,x+TW*0.26,y+wall*0.1);g.stroke()}}
  const n=Math.max(1,Math.round(L/R.tile));g.strokeStyle='rgba(110,100,88,.55)';g.lineWidth=0.8;for(let i=1;i<n;i++){const x=p.x+(q.x-p.x)*i/n,y=p.y+(q.y-p.y)*i/n;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-wall);g.stroke()}g.restore();
  g.strokeStyle='rgba(60,50,40,.55)';g.lineWidth=0.8;ar91Path(g,F);g.stroke();
  ar91Path(g,[{x:p.x+iv.x,y:p.y-wall+iv.y},{x:q.x+iv.x,y:q.y-wall+iv.y},{x:q.x,y:q.y-wall},{x:p.x,y:p.y-wall}]);g.fillStyle=a.slab[0];g.fill();
  const n2=Math.max(1,Math.round(L/(R.tile*0.5))),rh=h-wall,pw=Math.max(1,TW*0.022);for(let i=1;i<n2;i++){const x=p.x+(q.x-p.x)*i/n2+iv.x*0.5,y=p.y+(q.y-p.y)*i/n2-wall+iv.y*0.5;g.fillStyle=a100Grad(g,x-pw/2,x+pw/2,M);g.fillRect(x-pw/2,y-rh,pw,rh)}
  a100Bar(g,{x:p.x+iv.x*0.5,y:p.y-h+iv.y*0.5},{x:q.x+iv.x*0.5,y:q.y-h+iv.y*0.5},Math.max(1.4,TW*0.03),M)}
const A100RUN={bronze:a100Bronze,balus:a100Balus,parapet:a100Parapet};
/* a100Pier — a small stone post with a cap from the arena's own stone (centre x, base on the rail line); a bronze knob on metal rails */
function a100Pier(g,R,x,a,w,hk){const y=R.yAt(x),h=R.Hc*(hk||1.04);const F=[{x:x-w/2,y:y-h},{x:x+w/2,y:y-h},{x:x+w/2,y},{x:x-w/2,y}];
  if(!a100Lite()){g.fillStyle='rgba(30,18,8,.25)';ar91Path(g,[{x:x-w/2,y},{x:x+w/2,y},{x:x+w/2+TW*0.05,y:y+TW*0.035},{x:x-w/2+TW*0.05,y:y+TW*0.035}]);g.fill()}
  ar91Stone(g,F,'rgba(255,248,230,.06)',0.6);
  if(!a100Lite()){const sh=g.createLinearGradient(x-w/2,0,x+w/2,0);sh.addColorStop(0,'rgba(255,250,236,.22)');sh.addColorStop(.5,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(30,20,10,.32)');g.fillStyle=sh;ar91Path(g,F);g.fill()}
  const cw=w*1.25,ch=Math.max(1.6,h*0.16),cy=y-h;g.fillStyle=a.cap;g.fillRect(x-cw/2,cy-ch,cw,ch);g.fillStyle='rgba(255,252,240,.35)';g.fillRect(x-cw/2,cy-ch,cw,Math.max(0.8,ch*0.3));
  g.strokeStyle='rgba(40,28,16,.55)';g.lineWidth=0.7;g.strokeRect(x-cw/2,cy-ch,cw,ch);ar91Path(g,F);g.stroke();
  if(a.rail!=='balus'){const M=A100BRZ[a.metal||'bronze'];g.fillStyle=M[1];g.beginPath();g.arc(x,cy-ch-w*0.18,w*0.22,0,Math.PI*2);g.fill();g.fillStyle=M[0];g.beginPath();g.arc(x-w*0.06,cy-ch-w*0.24,w*0.08,0,Math.PI*2);g.fill()}
  A100X.cnt.pier++;return {x0:x-w/2,x1:x+w/2,x,y,w}}
/* a100Plinth — carries the corner tower's front down to the walkway, so the rail meets stone, not air */
function a100Plinth(g,G,T,R){const x0=T.x-G.k-G.lip,x1=T.x+G.k+G.lip;const yb=Math.max(R.yAt(R.xt),T.yf)+TW*0.015;if(yb-T.yf<1)return null;
  const F=[{x:x0,y:T.yf-1},{x:x1,y:T.yf-1},{x:x1,y:yb},{x:x0,y:yb}];ar91Stone(g,F,'rgba(40,28,16,.2)',0.7);
  g.fillStyle='rgba(30,20,10,.35)';g.fillRect(x0,T.yf-1,x1-x0,Math.max(1,TW*0.012));g.strokeStyle='rgba(40,28,16,.5)';g.lineWidth=0.8;ar91Path(g,F);g.stroke();A100X.cnt.plinth++;return {x0,x1,y0:T.yf-1,y1:yb}}
/* a100Rail — plinths, then the rail runs (tower face → stair opening → near corner), then the piers capping every end.
   A100X.last = what was drawn, in the layer's paint frame (tv100r's geometric check). */
function a100Rail(g){const a=a100A();if(!a)return;const G=a100Geom();const pw=Math.max(3,TW*0.085);const rec={edges:[],k:G.k,lip:G.lip,pw};
  for(const R of G.edges){const E={left:R.left,xt:R.xt,corner:R.corner.x,gap:[R.gm-R.gw,R.gm+R.gw],runs:[],piers:[],plinth:null,tower:[R.T.x-G.k-G.lip,R.T.x+G.k+G.lip]};rec.edges.push(E);
    E.plinth=a100Plinth(g,G,R.T,R);
    for(const [x0,x1] of R.runs){const xa=Math.min(x0,x1),xb=Math.max(x0,x1);const p=a100Pt(R,xa+pw*0.45),q=a100Pt(R,xb-pw*0.45);if(q.x-p.x>2){A100RUN[a.rail](g,R,p,q,a);A100X.cnt.run++;E.runs.push([p.x,q.x,xa,xb])}}}
  /* piers: at both tower faces, both sides of each stair opening, the near corner — drawn after the runs, so they cap them */
  G.edges.forEach((R,i)=>{const E=rec.edges[i];for(const [x0,x1] of R.runs)for(const x of [x0,x1]){if(Math.abs(x-R.corner.x)<1)continue;const atT=Math.abs(x-R.xt)<1;
    const P=a100Pier(g,R,atT?x+(R.left?pw/2:-pw/2):x,a,pw,atT?1.08:1.0);P.kind=atT?'tower':'stair';E.piers.push(P)}});
  const R0=G.edges[0];if(R0){const P=a100Pier(g,R0,R0.corner.x,a,pw*1.15,1.1);P.kind='corner';rec.edges.forEach(E=>E.piers.push(P))}
  A100X.last=rec}
ar91Under=function(g){const r=A100X.B.under.apply(this,arguments);if(a100K())try{a100Rail(g)}catch(e){console.error(e)}return r};

/* ---------- on / off ---------- */
A100X.set=function(on){A100X.on=!!on;a100Pal(A100X.on);AR91.ver++;try{if(typeof S!=='undefined'&&S&&!HEADLESS)draw()}catch(e){}};
try{if(A100X.on){a100Pal(true);
  /* a saved arena preset carrying the old values of the changed keys picks up the new ones (once, at load) */
  const ut=typeof USER_THEME!=='undefined'&&USER_THEME;if(ut&&ut.arena99&&A100PAL[ut.arena99]&&A100OLD[ut.arena99]){const k=ut.arena99,O=A100OLD[k],ch=A100PAL[k],upd={};
    for(const part of ['ui','board'])for(const [x,v] of Object.entries(ch[part]||{}))if(String(ut[x]||'').toLowerCase()===String(O[part][x]).toLowerCase())upd[x]=v;
    if(Object.keys(upd).length)applyTheme({...ut,...upd})}}}catch(e){}

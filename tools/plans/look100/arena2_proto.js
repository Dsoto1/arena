/* arena2_proto.js — round 2 runtime prototype for the v1.0 arena look (look100, prefix arena2_). PICTURES ONLY.
   Injected with page.evaluate(src). One stone family PER ARENA (A2[k], k = THEME.arena99 / S.locIdx) with its own
   tileable WebP (arena2_tex/<k>_<key>.webp), matched railing (travertine/limestone → bronze, sandstone/tuff/dark stone →
   balustrade, marble → parapet), per-arena metal/stone colours, an optional dado band with a motif, and the corner fix:
   the rail stops against a stone PIER at each corner tower (the tower gets a plinth down to the walkway), at the near
   corner and at both sides of each stair opening.
   Overrides (192): ar91Mat, ar91Tex, ar91Fill, ar91Stone, ar91Tower, ar91TopPaint, ar91Under.  A2P.on(true|false) switches. */
(function(){if(window.A2P)return;
const P=window.A2P={on:true,dir:'tools/plans/look100/arena2_tex/',img:{},ms:{}};
const hex=h=>{h=String(h||'#fff').replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]};
const mix=(a,b,t)=>a.map((x,i)=>Math.round(x+(b[i]-x)*t));const rgb=(c,a)=>a==null?`rgb(${c})`:`rgba(${c},${a})`;
const BRZ={gilt:['#f6d888','#b8862e','#6a4512'],bronze:['#e6b864','#a8732e','#5e3c14'],dark:['#c89a5a','#7e5426','#3e2610'],verd:['#b4dcc8','#5f9a86','#2e5446']};
/* the twelve arenas: family, texture, cap, rail, colours, band */
const A2=P.A2={
 1:{key:'syracusae',n:'Greek marble',cap:'#e4eaee',rail:'parapet',slab:['#f8fbfd','#d2dce4'],metal:'bronze',band:{c:'#2c5a88',f:'#f2f6fa',m:'meander'}},
 2:{key:'verona',n:'Rosso Verona marble',cap:'#e8b8aa',rail:'parapet',slab:['#f4cabd','#cf9182'],metal:'gilt',band:{c:'#8e3446',f:'#f4e4d8',m:'dentil'}},
 3:{key:'arles',n:'Gallic limestone (petit appareil)',cap:'#e4cb94',rail:'bronze',metal:'bronze'},
 4:{key:'capua',n:'Campanian red stone (rusticated)',cap:'#86463a',rail:'balus',stone:['#c98474','#91503f','#4a1e16'],band:{c:'#1e1412',f:'#b2443a',m:'plain'}},
 5:{key:'thysdrus',n:'African sandstone',cap:'#dda466',rail:'balus',stone:['#f4cc90','#d39a58','#8a5626']},
 6:{key:'roma',n:'Travertine (Colosseum)',cap:'#e8d6b4',rail:'bronze',metal:'gilt'},
 7:{key:'nemausus',n:'Gallic limestone + brick lacing',cap:'#cfccb2',rail:'bronze',metal:'dark'},
 8:{key:'pompeii',n:'Tuff reticulatum + brick',cap:'#a09a92',rail:'balus',stone:['#dcd6cc','#a39d94','#5a5450'],band:{c:'#a3302a',f:'#1c1210',m:'plain'}},
 9:{key:'leptis',n:'Proconnesian marble + cipollino',cap:'#f2f0ea',rail:'parapet',slab:['#fdfcf8','#dedad0'],metal:'gilt',band:{c:'#4c7a5a',f:'#e8efe6',m:'wave'}},
 10:{key:'uthina',n:'Punic opus africanum',cap:'#d6b8aa',rail:'balus',stone:['#efd4c8','#c8a698','#76585a']},
 11:{key:'pola',n:'Istrian white stone',cap:'#eae9e2',rail:'bronze',metal:'verd'},
 12:{key:'puteoli',n:'Yellow tuff, opus listatum',cap:'#d8c072',rail:'balus',stone:['#f2e2a0','#d2b868','#86702e']}};
P.arena=function(){if(typeof ar91Lud==='function'&&ar91Lud())return null;let k=null;try{k=(THEME&&THEME.arena99)||(S&&S.locIdx)}catch(e){}return A2[k]?k:null};
const A=()=>{const k=P.arena();return k?A2[k]:null};
/* textures: the shipped WebP per arena (decoded once) */
function texImg(k){const a=A2[k];let im=P.img[k];if(!im){const t0=performance.now();im=P.img[k]=new Image();im.onload=()=>{P.ms['decode'+k]=performance.now()-t0;AR91.ver++;try{draw()}catch(e){}};im.src=P.dir+k+'_'+a.key+'.webp'}return im.complete&&im.naturalWidth?im:null}
P.preload=()=>Promise.all(Object.keys(A2).map(k=>new Promise(r=>{const im=texImg(k);if(im)return r();P.img[k].addEventListener('load',r,{once:true});P.img[k].addEventListener('error',r,{once:true})})));
const B={mat:ar91Mat,tex:ar91Tex,fill:ar91Fill,stone:ar91Stone,tower:ar91Tower,top:ar91TopPaint,under:ar91Under};P.B=B;
ar91Mat=function(){const m=B.mat.apply(this,arguments);if(!P.on)return m;const a=A();return a?{...m,n:'A2 '+a.n,cap:a.cap}:m};
ar91Tex=function(){if(!P.on)return B.tex.apply(this,arguments);const k=P.arena();if(!k)return B.tex.apply(this,arguments);return texImg(k)};
/* flat surfaces: an iso pattern (slabs lie on the floor); vertical faces: the wall pattern */
ar91Fill=function(g,scale){if(!P.on||!AR91PAT||!P.arena())return B.fill.apply(this,arguments);
  const m=g.getTransform();const axis=Math.abs(m.b)<1e-6&&Math.abs(m.c)<1e-6;const flat=axis&&(scale===undefined||scale===1)&&!P.vert;
  try{if(flat){const o=center(-0.5,-0.5),u0=center(-0.5,0.5),v0=center(0.5,-0.5),k=150;AR91PAT.setTransform(new DOMMatrix([(u0.x-o.x)/k,(u0.y-o.y)/k,(v0.x-o.x)/k,(v0.y-o.y)/k,o.x,o.y]))}
    else{const o=center((N-1)/2,(N-1)/2);AR91PAT.setTransform(new DOMMatrix().translate(o.x,o.y).scale((scale||1)*TW*0.82/170))}}catch(e){}
  g.fillStyle=AR91PAT};
/* ---------- dado bands with a motif, on a vertical face: top edge p→q, height h (local x along, y down) ---------- */
function band(g,p,q,h,t0,t1,bd){const L=Math.hypot(q.x-p.x,q.y-p.y);if(L<2||h<2)return;const ux=(q.x-p.x)/L,uy=(q.y-p.y)/L;g.save();g.transform(ux,uy,0,1,p.x,p.y);
  const y0=h*t0,y1=h*t1,bh=y1-y0,fl=Math.max(0.8,bh*0.1);g.fillStyle=bd.c;g.fillRect(0,y0,L,bh);g.fillStyle=bd.f;g.fillRect(0,y0-fl,L,fl);g.fillRect(0,y1,L,fl);
  g.strokeStyle=bd.f;g.fillStyle=bd.f;g.lineWidth=Math.max(0.7,bh*0.09);const a=y0+bh*0.2,b=y1-bh*0.2,hh=b-a;
  if(bd.m==='meander'&&hh>2.5){const u=hh*1.6;g.beginPath();for(let x=0;x<L;x+=u){g.moveTo(x,b);g.lineTo(x,a);g.lineTo(x+u*0.75,a);g.lineTo(x+u*0.75,b-hh*0.66);g.lineTo(x+u*0.4,b-hh*0.66);g.lineTo(x+u*0.4,b-hh*0.33);g.lineTo(x+u*0.95,b-hh*0.33);g.lineTo(x+u*0.95,b);g.lineTo(x+u,b)}g.stroke()}
  else if(bd.m==='dentil'&&hh>1.5){const u=Math.max(3,hh*1.1);for(let x=0;x<L;x+=u)g.fillRect(x,a,u*0.55,hh)}
  else if(bd.m==='wave'&&hh>2){const u=hh*2;g.beginPath();g.moveTo(0,b);for(let x=0;x<L;x+=u){g.quadraticCurveTo(x+u*0.25,a-hh*0.1,x+u*0.55,a+hh*0.35);g.quadraticCurveTo(x+u*0.6,b-hh*0.2,x+u*0.42,b-hh*0.25);g.moveTo(x+u*0.55,b);g.lineTo(x+u,b)}g.stroke()}
  g.restore()}
ar91Stone=function(g,Q,shadeA,scale){const r=B.stone.apply(this,arguments);const a=P.on&&A();
  if(a&&a.band&&Q.length===4&&(scale===0.8||(scale===0.7&&P.tw===1))){try{const top=Q[0].y<Q[3].y;const p=top?Q[0]:Q[3],q=top?Q[1]:Q[2],h=Math.abs(Q[3].y-Q[0].y);band(g,p,q,h,0.34,0.7,a.band);
      if(shadeA){ar91Path(g,Q);g.fillStyle=shadeA;g.globalAlpha=0.45;g.fill();g.globalAlpha=1}}catch(e){}}return r};
ar91Tower=function(){P.tw=0;const s=ar91Stone;let n=0;ar91Stone=function(){n++;P.tw=n;return s.apply(this,arguments)};try{return B.tower.apply(this,arguments)}finally{ar91Stone=s;P.tw=0}};
ar91TopPaint=function(g,out){P.vert=false;const r=B.top.apply(this,arguments);const a=P.on&&A();if(a&&a.band)try{for(const w of out.walls){const hb=w.H*0.14;band(g,{x:w.a.x,y:w.a.y-hb},{x:w.b.x,y:w.b.y-hb},hb,0.08,0.92,a.band)}}catch(e){}return r};
/* ---------- the railing + corners (layer 'under': before the tiles, so the sand covers anything taller) ---------- */
function geom(){const mid=ar91Mid(),Hc=TW*0.16,k=TW*0.27,lip=TW*0.04;const R2=ar91Ring(0.19);const Lt=R2.reduce((b,p)=>p.x<b.x?p:b),Rt=R2.reduce((b,p)=>p.x>b.x?p:b);
  const towers=[{x:Lt.x-k*0.92,yf:Lt.y+TW*0.01,side:-1},{x:Rt.x+k*0.92,yf:Rt.y+TW*0.01,side:1}];const out=[];
  for(const E of ar91Edges(0.19).filter(E=>!E.far)){let a=E.a,b=E.b;if(a.x>b.x){const t=a;a=b;b=t}const left=E.mx<mid.x;
    const A0={x:a.x,y:a.y+Hc},B0={x:b.x,y:b.y+Hc};const yAt=x=>A0.y+(B0.y-A0.y)*(x-A0.x)/(B0.x-A0.x);
    const T=left?towers[0]:towers[1];const xt=left?T.x+k+lip:T.x-k-lip; /* the tower's inner face */
    const tile=Math.hypot(b.x-a.x,b.y-a.y)/(N+0.38);const gm=(a.x+b.x)/2,gw=tile*0.42*Math.abs(b.x-a.x)/Math.hypot(b.x-a.x,b.y-a.y);
    /* runs in x: tower face → stair opening → near corner (corner = the end nearest the middle) */
    const xs=left?[xt,gm-gw,gm+gw,b.x]:[a.x,gm-gw,gm+gw,xt];
    out.push({left,Hc,tile,yAt,T,xt,runs:[[xs[0],xs[1]],[xs[2],xs[3]]],corner:left?b:a,in:{x:mid.x-(a.x+b.x)/2,y:mid.y-(a.y+b.y)/2},k,lip})}
  return {edges:out,towers,k,lip,Hc}}
function inV(R,s){const d=Math.hypot(R.in.x,R.in.y)||1;return {x:R.in.x/d*s,y:R.in.y/d*s*0.5}}
const pt2=(R,x)=>({x,y:R.yAt(x)});
function shadowRun(g,p,q){g.fillStyle='rgba(30,18,8,.24)';ar91Path(g,[p,q,{x:q.x+TW*0.05,y:q.y+TW*0.035},{x:p.x+TW*0.05,y:p.y+TW*0.035}]);g.fill()}
function brzGrad(g,x0,x1,M){const gr=g.createLinearGradient(x0,0,x1,0);gr.addColorStop(0,M[0]);gr.addColorStop(.45,M[1]);gr.addColorStop(1,M[2]);return gr}
function bar(g,p,q,rt,M){g.lineCap='butt';g.strokeStyle=M[2];g.lineWidth=rt+1;g.beginPath();g.moveTo(p.x,p.y+0.8);g.lineTo(q.x,q.y+0.8);g.stroke();
  g.strokeStyle=M[1];g.lineWidth=rt;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();g.strokeStyle=M[0];g.lineWidth=Math.max(0.7,rt*0.35);g.beginPath();g.moveTo(p.x,p.y-rt*0.25);g.lineTo(q.x,q.y-rt*0.25);g.stroke()}
function runBronze(g,R,p,q,a){const M=BRZ[a.metal||'bronze'];const h=R.Hc*0.86,pw=Math.max(1.2,TW*0.028),rt=Math.max(1.4,TW*0.03);shadowRun(g,p,q);
  const L=Math.hypot(q.x-p.x,q.y-p.y),n=Math.max(1,Math.round(L/(R.tile*0.5)));g.strokeStyle=M[2];g.lineWidth=Math.max(1,rt*0.6);g.beginPath();g.moveTo(p.x,p.y-h*0.35);g.lineTo(q.x,q.y-h*0.35);g.stroke();
  for(let i=1;i<n;i++){const x=p.x+(q.x-p.x)*i/n,y=p.y+(q.y-p.y)*i/n;g.fillStyle=brzGrad(g,x-pw/2,x+pw/2,M);g.fillRect(x-pw/2,y-h,pw,h);g.fillStyle=M[2];g.fillRect(x-pw*0.8,y-Math.max(1,TW*0.012),pw*1.6,Math.max(1,TW*0.012));g.fillStyle=M[0];g.beginPath();g.arc(x,y-h,pw*0.75,0,Math.PI*2);g.fill()}
  bar(g,{x:p.x,y:p.y-h},{x:q.x,y:q.y-h},rt,M)}
function runBalus(g,R,p,q,a){const S=a.stone,h=R.Hc*0.98,pl=Math.max(1.6,h*0.2),cp=Math.max(1.8,h*0.2),iv=inV(R,TW*0.05);shadowRun(g,p,q);
  g.fillStyle='rgba(36,24,14,.55)';ar91Path(g,[{x:p.x,y:p.y-h},{x:q.x,y:q.y-h},q,p]);g.fill();
  ar91Path(g,[{x:p.x,y:p.y-pl},{x:q.x,y:q.y-pl},q,p]);g.fillStyle=S[1];g.fill();g.strokeStyle='rgba(40,28,16,.55)';g.lineWidth=0.7;g.stroke();
  const L=Math.hypot(q.x-p.x,q.y-p.y),bw=Math.max(2.6,TW*0.065),n=Math.max(1,Math.floor(L/Math.max(bw*1.55,R.tile*0.13)));
  for(let i=0;i<n;i++){const t=(i+0.5)/n,x=p.x+(q.x-p.x)*t,y=p.y+(q.y-p.y)*t-pl,bh=h-pl-cp;const gr=g.createLinearGradient(x-bw/2,0,x+bw/2,0);gr.addColorStop(0,S[0]);gr.addColorStop(.55,S[1]);gr.addColorStop(1,S[2]);
    g.fillStyle=gr;g.beginPath();g.moveTo(x-bw*0.4,y);g.lineTo(x+bw*0.4,y);g.quadraticCurveTo(x+bw*0.7,y-bh*0.38,x+bw*0.2,y-bh*0.74);g.lineTo(x+bw*0.34,y-bh);g.lineTo(x-bw*0.34,y-bh);g.lineTo(x-bw*0.2,y-bh*0.74);g.quadraticCurveTo(x-bw*0.7,y-bh*0.38,x-bw*0.4,y);g.closePath();g.fill();g.strokeStyle='rgba(50,36,22,.6)';g.lineWidth=0.6;g.stroke()}
  const T0={x:p.x,y:p.y-h},T1={x:q.x,y:q.y-h};ar91Path(g,[{x:T0.x+iv.x*0.5,y:T0.y+iv.y*0.5},{x:T1.x+iv.x*0.5,y:T1.y+iv.y*0.5},T1,T0]);g.fillStyle=S[0];g.fill();
  ar91Path(g,[T0,T1,{x:T1.x,y:T1.y+cp},{x:T0.x,y:T0.y+cp}]);g.fillStyle=S[1];g.fill();g.fillStyle=R.left?'rgba(255,250,236,.12)':'rgba(40,28,16,.18)';g.fill();
  g.strokeStyle='rgba(40,28,16,.6)';g.lineWidth=0.7;g.beginPath();g.moveTo(T0.x,T0.y+cp);g.lineTo(T1.x,T1.y+cp);g.stroke()}
function runParapet(g,R,p,q,a){const h=R.Hc*0.96,wall=h*0.62,iv=inV(R,TW*0.06),M=BRZ[a.metal||'bronze'];shadowRun(g,p,q);
  const F=[{x:p.x,y:p.y-wall},{x:q.x,y:q.y-wall},q,p];const mg=g.createLinearGradient(0,Math.min(p.y,q.y)-wall,0,Math.max(p.y,q.y));mg.addColorStop(0,a.slab[0]);mg.addColorStop(1,a.slab[1]);
  g.fillStyle=mg;ar91Path(g,F);g.fill();g.fillStyle=R.left?'rgba(255,255,255,.05)':'rgba(60,50,40,.16)';g.fill();
  const L=Math.hypot(q.x-p.x,q.y-p.y);g.save();ar91Path(g,F);g.clip();g.strokeStyle='rgba(110,100,92,.35)';g.lineWidth=0.6;let s=7;const rn=()=>{s=(s*16807)%2147483647;return s/2147483647};
  for(let i=0;i<Math.round(L/TW*3);i++){const t=rn(),x=p.x+(q.x-p.x)*t,y=p.y+(q.y-p.y)*t-wall*rn();g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+TW*0.12,y-wall*0.2,x+TW*0.26,y+wall*0.1);g.stroke()}
  const n=Math.max(1,Math.round(L/R.tile));g.strokeStyle='rgba(110,100,88,.55)';g.lineWidth=0.8;for(let i=1;i<n;i++){const x=p.x+(q.x-p.x)*i/n,y=p.y+(q.y-p.y)*i/n;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-wall);g.stroke()}g.restore();
  g.strokeStyle='rgba(60,50,40,.55)';g.lineWidth=0.8;ar91Path(g,F);g.stroke();
  ar91Path(g,[{x:p.x+iv.x,y:p.y-wall+iv.y},{x:q.x+iv.x,y:q.y-wall+iv.y},{x:q.x,y:q.y-wall},{x:p.x,y:p.y-wall}]);g.fillStyle=a.slab[0];g.fill();
  const n2=Math.max(1,Math.round(L/(R.tile*0.5))),rh=h-wall,pw=Math.max(1,TW*0.022);for(let i=1;i<n2;i++){const x=p.x+(q.x-p.x)*i/n2+iv.x*0.5,y=p.y+(q.y-p.y)*i/n2-wall+iv.y*0.5;g.fillStyle=brzGrad(g,x-pw/2,x+pw/2,M);g.fillRect(x-pw/2,y-rh,pw,rh)}
  bar(g,{x:p.x+iv.x*0.5,y:p.y-h+iv.y*0.5},{x:q.x+iv.x*0.5,y:q.y-h+iv.y*0.5},Math.max(1.4,TW*0.03),M)}
const RUN={bronze:runBronze,balus:runBalus,parapet:runParapet};
/* the pier: a small stone post with a cap, from the arena's own stone (centre x, base y) */
function pier(g,R,x,a,w,hk){const y=R.yAt(x),h=R.Hc*(hk||1.04),iv=inV(R,TW*0.045);const F=[{x:x-w/2,y:y-h},{x:x+w/2,y:y-h},{x:x+w/2,y},{x:x-w/2,y}];
  g.fillStyle='rgba(30,18,8,.25)';ar91Path(g,[{x:x-w/2,y},{x:x+w/2,y},{x:x+w/2+TW*0.05,y:y+TW*0.035},{x:x-w/2+TW*0.05,y:y+TW*0.035}]);g.fill();
  P.vert=true;try{ar91Stone(g,F,'rgba(255,248,230,.06)',0.6)}finally{P.vert=false}
  const sh=g.createLinearGradient(x-w/2,0,x+w/2,0);sh.addColorStop(0,'rgba(255,250,236,.22)');sh.addColorStop(.5,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(30,20,10,.32)');g.fillStyle=sh;ar91Path(g,F);g.fill();
  const cw=w*1.25,ch=Math.max(1.6,h*0.16),cy=y-h;g.fillStyle=a.cap;g.fillRect(x-cw/2,cy-ch,cw,ch);g.fillStyle='rgba(255,252,240,.35)';g.fillRect(x-cw/2,cy-ch,cw,Math.max(0.8,ch*0.3));
  g.strokeStyle='rgba(40,28,16,.55)';g.lineWidth=0.7;g.strokeRect(x-cw/2,cy-ch,cw,ch);ar91Path(g,F);g.stroke();
  if(a.rail!=='balus'){const M=BRZ[a.metal||'bronze'];g.fillStyle=M[1];g.beginPath();g.arc(x,cy-ch-w*0.18,w*0.22,0,Math.PI*2);g.fill();g.fillStyle=M[0];g.beginPath();g.arc(x-w*0.06,cy-ch-w*0.24,w*0.08,0,Math.PI*2);g.fill()}}
/* the tower's plinth: carries the tower down to the walkway so the rail meets stone, not air */
function plinth(g,G,T,R){const k=G.k,lip=G.lip;const x0=T.x-k-lip,x1=T.x+k+lip;const yb=Math.max(R.yAt(R.xt),T.yf)+TW*0.015;if(yb-T.yf<1)return;
  const F=[{x:x0,y:T.yf-1},{x:x1,y:T.yf-1},{x:x1,y:yb},{x:x0,y:yb}];P.vert=true;try{ar91Stone(g,F,'rgba(40,28,16,.2)',0.7)}finally{P.vert=false}
  g.fillStyle='rgba(30,20,10,.35)';g.fillRect(x0,T.yf-1,x1-x0,Math.max(1,TW*0.012));g.strokeStyle='rgba(40,28,16,.5)';g.lineWidth=0.8;ar91Path(g,F);g.stroke()}
function railAll(g){const a=A();if(!a||ar91Lud())return;const G=geom();const pw=Math.max(3,TW*0.085);P.last=G;
  for(const R of G.edges){plinth(g,G,R.T,R);
    for(const [x0,x1] of R.runs){const xa=Math.min(x0,x1),xb=Math.max(x0,x1);const p=pt2(R,xa+pw*0.45),q=pt2(R,xb-pw*0.45);if(q.x-p.x>2)RUN[a.rail](g,R,p,q,a)}}
  /* piers: at both tower faces, both sides of each stair opening, and the near corner (drawn after the runs so they cap them) */
  for(const R of G.edges){for(const [x0,x1] of R.runs)for(const x of [x0,x1]){const isCorner=Math.abs(x-R.corner.x)<1;if(isCorner)continue;const atT=Math.abs(x-R.xt)<1;pier(g,R,atT?x+(R.left?pw/2:-pw/2):x,a,pw,atT?1.08:1.0)}}
  const R0=G.edges[0];pier(g,R0,R0.corner.x,a,pw*1.15,1.1)}
ar91Under=function(g){const r=B.under.apply(this,arguments);if(P.on)try{railAll(g)}catch(e){console.error(e)}return r};
P.set=function(on){P.on=on;AR91.ver++;for(const k in AR91TEX)delete AR91TEX[k];try{S.bubbles=[];S.emotes=[]}catch(e){}for(const id of ['cardShow','bubbles','wbubs']){const e=document.getElementById(id);if(e)e.innerHTML=''}draw();draw()};
P.cost=function(n=8){const ca=[],re=[];for(let i=0;i<n;i++){draw();let t=performance.now();draw();ca.push(performance.now()-t);AR91.ver++;t=performance.now();draw();re.push(performance.now()-t)}
  const med=a=>{a=a.slice().sort((x,y)=>x-y);return +a[a.length>>1].toFixed(1)};return {cached:med(ca),rebuild:med(re),under:+(AR91.ms[0]||0).toFixed(1),top:+(AR91.ms[1]||0).toFixed(1)}};
})();

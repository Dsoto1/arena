/* arena_proto.js — runtime prototype for the v1.0 arena look test (look100, prefix arena_). PICTURES ONLY — never shipped as is.
   Injected with page.evaluate(src). Overrides 192-v91arena functions at runtime:
     ar91Under  → base + a RAILING on the near walls' foot line (PR100.rail = 'bronze' | 'balus' | 'parapet' | null)
     ar91Tex    → a procedural stone per style (PR100.stone = 'trav' | 'sand' | 'marble' | null = his stone_wall.webp), tinted per arena (mat.cap)
     ar91Fill   → horizontal surfaces get an ISO pattern (slabs lie on the floor), vertical faces the wall pattern
     ar91Stone  → marble: Pompeian-red dado bands on the foundation side faces + tower fronts
     ar91TopPaint → marble: red dado at the foot of the far walls
   PR100.set({rail,stone}) clears the caches and redraws. */
(function(){if(window.PR100)return;
const PR=window.PR100={rail:null,stone:null,phase:'',T:{}};
/* ---------- seeded helpers (display only; never the dice RNG) ---------- */
const RNG=s=>{let q=s>>>0||1;return ()=>{q=(q*1103515245+12345)>>>0;return (q>>>8)/16777216}};
const hex=h=>{h=String(h||'#ffffff').replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]};
const mix=(a,b,t)=>a.map((x,i)=>Math.round(x+(b[i]-x)*t));
const rgb=(c,a)=>a==null?`rgb(${c[0]},${c[1]},${c[2]})`:`rgba(${c[0]},${c[1]},${c[2]},${a})`;
/* ---------- the three stones (512×512, tileable) ---------- */
function noise(g,W,H,n,a,rn,dark){for(let i=0;i<n;i++){g.fillStyle=(rn()<(dark==null?0.5:dark))?`rgba(60,40,20,${(a*rn()).toFixed(3)})`:`rgba(255,250,236,${(a*rn()).toFixed(3)})`;const s=rn()<0.85?1:2;g.fillRect(rn()*W,rn()*H,s,s)}}
/* courses of blocks in running bond: cb(x,y,w,h,i) per block (wrapped so the tile repeats) */
function courses(W,H,ch,lmin,lmax,rn,cb){let row=0;for(let y=0;y<H;y+=ch,row++){let x=-rn()*lmax;const ends=[];while(x<W){const l=lmin+rn()*(lmax-lmin);ends.push([x,l]);x+=l}
  for(const [x0,l] of ends){cb(x0,y,l,ch,row);if(x0<0)cb(x0+W,y,l,ch,row);if(x0+l>W)cb(x0-W,y,l,ch,row)}}}
function stoneTrav(){const W=512,H=512,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const rn=RNG(9101);
  g.fillStyle='#ead9bb';g.fillRect(0,0,W,H);
  courses(W,H,64,120,210,rn,(x,y,w,h)=>{const t=rn();g.fillStyle=rgb(mix([234,217,187],[222,201,166],t));g.fillRect(x,y,w,h);
    /* travertine banding: thin streaks along the bed */
    for(let k=0;k<7;k++){const yy=y+4+rn()*(h-8);g.fillStyle=rn()<0.5?'rgba(180,150,105,.22)':'rgba(255,248,230,.35)';g.fillRect(x+2,yy,w-4,0.8+rn()*1.4)}
    /* the voids: elongated pits with a light lower lip */
    for(let k=0;k<5+rn()*7;k++){const px=x+4+rn()*(w-8),py=y+6+rn()*(h-12),pw=2+rn()*7,ph=0.8+rn()*1.8;g.fillStyle='rgba(120,90,55,.55)';g.beginPath();g.ellipse(px,py,pw,ph,0,0,Math.PI*2);g.fill();
      g.fillStyle='rgba(255,248,232,.55)';g.fillRect(px-pw*0.7,py+ph,pw*1.4,0.8)}
    /* mortar: a pale joint with a shadow under the block above + a light top edge */
    g.fillStyle='#cdbb98';g.fillRect(x,y,w,2.2);g.fillRect(x,y,2.2,h);
    g.fillStyle='rgba(90,66,38,.35)';g.fillRect(x,y+2.2,w,1);g.fillRect(x+2.2,y,1,h);
    g.fillStyle='rgba(255,250,236,.4)';g.fillRect(x+3.2,y+3.2,w-4,1)});
  noise(g,W,H,9000,0.12,rn);return c}
function stoneSand(){const W=512,H=512,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const rn=RNG(4242);
  g.fillStyle='#8a6a40';g.fillRect(0,0,W,H);
  courses(W,H,85.333,150,240,rn,(x,y,w,h)=>{const t=rn()*0.5;const gr=g.createLinearGradient(x,y,x+w*0.3,y+h);
    gr.addColorStop(0,rgb(mix([220,193,150],[201,168,119],t)));gr.addColorStop(.38,rgb(mix([201,168,119],[190,156,108],t)));gr.addColorStop(1,rgb(mix([180,143,92],[168,132,84],t)));
    const b=4,m=2;g.fillStyle=gr;g.fillRect(x+m,y+m,w-2*m,h-2*m);
    /* strata */
    for(let k=0;k<4;k++){const yy=y+8+rn()*(h-16);g.fillStyle=rn()<0.5?'rgba(120,84,40,.14)':'rgba(255,240,206,.18)';g.fillRect(x+m+b,yy,w-2*(m+b),2+rn()*3)}
    /* the carved edge: a chamfer lit from the top-left, shaded bottom-right (the menu slab's inset bevel) */
    g.fillStyle='rgba(255,244,214,.62)';g.beginPath();g.moveTo(x+m,y+m);g.lineTo(x+w-m,y+m);g.lineTo(x+w-m-b,y+m+b);g.lineTo(x+m+b,y+m+b);g.lineTo(x+m+b,y+h-m-b);g.lineTo(x+m,y+h-m);g.closePath();g.fill();
    g.fillStyle='rgba(92,60,28,.55)';g.beginPath();g.moveTo(x+w-m,y+m);g.lineTo(x+w-m,y+h-m);g.lineTo(x+m,y+h-m);g.lineTo(x+m+b,y+h-m-b);g.lineTo(x+w-m-b,y+h-m-b);g.lineTo(x+w-m-b,y+m+b);g.closePath();g.fill();
    /* the inner incised line (.ss98::before) */
    g.strokeStyle='rgba(96,64,30,.38)';g.lineWidth=1;g.strokeRect(x+m+b+4.5,y+m+b+4.5,w-2*(m+b+4.5),h-2*(m+b+4.5));
    g.strokeStyle='rgba(255,238,204,.3)';g.strokeRect(x+m+b+5.5,y+m+b+5.5,w-2*(m+b+4.5),h-2*(m+b+4.5))});
  noise(g,W,H,16000,0.16,rn,0.55);return c}
function stoneMarble(){const W=512,H=512,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const rn=RNG(777);
  g.fillStyle='#f2eee6';g.fillRect(0,0,W,H);
  /* soft clouding */
  for(let i=0;i<40;i++){const x=rn()*W,y=rn()*H,r=30+rn()*90;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,rn()<0.5?'rgba(214,208,198,.35)':'rgba(255,255,252,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;
    for(const dx of [-W,0,W])for(const dy of [-H,0,H])g.fillRect(x+dx-r,y+dy-r,r*2,r*2)}
  /* veins: long drifting grey lines with fine branches, drawn 3×3 so the tile wraps */
  const veins=[];for(let i=0;i<9;i++){let x=rn()*W,y=rn()*H;const pts=[[x,y]];const a0=-0.5+rn()*0.6;for(let k=0;k<14;k++){x+=Math.cos(a0+(rn()-0.5)*1.2)*26;y+=Math.sin(a0+(rn()-0.5)*1.2)*26;pts.push([x,y])}veins.push({pts,w:0.5+rn()*1.6,a:0.18+rn()*0.32})}
  for(const dx of [-W,0,W])for(const dy of [-H,0,H])for(const v of veins){g.strokeStyle=`rgba(118,112,104,${v.a.toFixed(2)})`;g.lineWidth=v.w;g.beginPath();v.pts.forEach(([x,y],i)=>i?g.lineTo(x+dx,y+dy):g.moveTo(x+dx,y+dy));g.stroke()}
  /* slab joints: big polished panels */
  courses(W,H,128,240,300,rn,(x,y,w,h)=>{g.fillStyle='rgba(150,140,128,.55)';g.fillRect(x,y,w,1.4);g.fillRect(x,y,1.4,h);g.fillStyle='rgba(255,255,255,.7)';g.fillRect(x+1.4,y+1.4,w,1);
    const gr=g.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,'rgba(255,255,255,.18)');gr.addColorStop(.5,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(120,110,100,.06)');g.fillStyle=gr;g.fillRect(x,y,w,h)});
  noise(g,W,H,5000,0.07,rn);return c}
const MAKE={trav:stoneTrav,sand:stoneSand,marble:stoneMarble};
/* the arena tint: multiply by the arena's cap colour (marble keeps more white) */
function tinted(style){const M=ar91Mat();const k=style+'|'+M.n;if(PR.T[k])return PR.T[k];const t0=performance.now();
  const base=PR.T['raw|'+style]||(PR.T['raw|'+style]=MAKE[style]());const c=document.createElement('canvas');c.width=base.width;c.height=base.height;const g=c.getContext('2d');
  g.drawImage(base,0,0);const cap=hex(M.cap);const tt=mix(cap,[255,255,255],style==='marble'?0.55:style==='sand'?0.3:0.22);
  /* lud plaster stays plaster-white */
  g.globalCompositeOperation='multiply';g.fillStyle=rgb(tt);g.fillRect(0,0,c.width,c.height);g.globalCompositeOperation='destination-in';g.drawImage(base,0,0);
  PR.T[k]=c;PR.texMs=(PR.texMs||0)+performance.now()-t0;return c}
/* ---------- overrides ---------- */
const B={tex:ar91Tex,fill:ar91Fill,stone:ar91Stone,under:ar91Under,top:ar91TopPaint};PR.B=B;
ar91Tex=function(){if(!PR.stone||ar91Lud())return B.tex.apply(this,arguments);return tinted(PR.stone)};
const TPX={trav:0.95,sand:0.85,marble:0.75}; /* wall texture: how many TW one 170 px of texture covers (base = 0.9) */
ar91Fill=function(g,scale){if(!PR.stone||!AR91PAT||ar91Lud())return B.fill.apply(this,arguments);
  const m=g.getTransform();const axis=Math.abs(m.b)<1e-6&&Math.abs(m.c)<1e-6;const flat=axis&&(scale===undefined||scale===1);
  try{if(flat){const o=center(-0.5,-0.5),u0=center(-0.5,0.5),v0=center(0.5,-0.5);const k=PR.stone==='marble'?256:PR.stone==='sand'?170:128; /* texture px per tile on the floor */
      AR91PAT.setTransform(new DOMMatrix([(u0.x-o.x)/k,(u0.y-o.y)/k,(v0.x-o.x)/k,(v0.y-o.y)/k,o.x,o.y]))}
    else{const o=center((N-1)/2,(N-1)/2);AR91PAT.setTransform(new DOMMatrix().translate(o.x,o.y).scale((scale||1)*TW*TPX[PR.stone]/170))}}catch(e){}
  g.fillStyle=AR91PAT};
const RED=['#a3302a','#8e2620','#6e1a15'];
/* a Pompeian-red dado inside a vertical quad [p,q,q+h,p+h] (or the tower front [bl,br,tr,tl]) */
function dado(g,Q,top){/* Q: 4 points, Q[0]-Q[1] one horizontal edge, Q[3]-Q[2] the other */const up=top?[Q[3],Q[2],Q[1],Q[0]]:[Q[0],Q[1],Q[2],Q[3]];
  const L=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});const band=(t0,t1,fill)=>{g.fillStyle=fill;ar91Path(g,[L(up[0],up[3],t0),L(up[1],up[2],t0),L(up[1],up[2],t1),L(up[0],up[3],t1)]);g.fill()};
  band(0.3,0.78,RED[0]);band(0.3,0.36,'rgba(30,10,6,.55)');band(0.74,0.78,'rgba(30,10,6,.5)');band(0.26,0.3,'rgba(216,178,90,.85)');band(0.78,0.81,'rgba(216,178,90,.7)')}
ar91Stone=function(g,Q,shadeA,scale){const r=B.stone.apply(this,arguments);
  if(PR.stone==='marble'&&!ar91Lud()&&Q.length===4&&(scale===0.8||(scale===0.7&&PR.phase==='tower'&&!PR.tw++))){try{
      const top=Q[0].y<Q[3].y; /* side faces: [p,q,q+h,p+h] */dado(g,Q,!top);if(shadeA){ar91Path(g,Q);g.fillStyle=shadeA;g.globalAlpha=0.5;g.fill();g.globalAlpha=1}}catch(e){}}
  return r};
{const bt=ar91Tower;ar91Tower=function(){PR.phase='tower';PR.tw=0;try{return bt.apply(this,arguments)}finally{PR.phase=''}}}
ar91TopPaint=function(g,out){const r=B.top.apply(this,arguments);if(PR.stone==='marble'&&!ar91Lud()){try{
    for(const w of out.walls){const {a,b,H}=w;const L=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/L,uy=(b.y-a.y)/L;g.save();g.translate(a.x,a.y);g.transform(ux,uy,0,1,0,0);
      const h=H*0.12;g.fillStyle=RED[0];g.fillRect(0,-h,L,h);g.fillStyle='rgba(30,10,6,.5)';g.fillRect(0,-h,L,Math.max(1,h*0.14));g.fillStyle='rgba(216,178,90,.85)';g.fillRect(0,-h-Math.max(1,TW*0.012),L,Math.max(1,TW*0.012));g.restore()}}catch(e){}}return r};
/* ---------- the railing (layer 'under': drawn before the tiles, so the sand always covers anything taller than the near wall) ---------- */
function railEdges(){const mid=ar91Mid();const Hc=TW*0.16;const out=[];for(const E of ar91Edges(0.19).filter(E=>!E.far)){let a=E.a,b=E.b;if(a.x>b.x){const t=a;a=b;b=t}const left=E.mx<mid.x;
    const kx=TW*0.27*0.92,v={x:b.x-a.x,y:b.y-a.y};const a0=a,b0=b;if(v.x>0){const t=kx/v.x;if(left)a={x:a.x-v.x*t,y:a.y-v.y*t};else b={x:b.x+v.x*t,y:b.y+v.y*t}}
    /* the opening in front of the stairway (the side's middle) */
    const gm={x:(a0.x+b0.x)/2,y:(a0.y+b0.y)/2},tile=Math.hypot(b0.x-a0.x,b0.y-a0.y)/(N+0.38);
    out.push({a:{x:a.x,y:a.y+Hc},b:{x:b.x,y:b.y+Hc},left,Hc,gap:{m:gm,w:tile*0.42},tile,in:{x:(mid.x-gm.x),y:(mid.y-gm.y)}})}return out}
function segs(R){/* the rail split at the stair opening: [[p0,p1],…] along the foot line */const {a,b}=R;const L=Math.hypot(b.x-a.x,b.y-a.y),ux=(b.x-a.x)/L,uy=(b.y-a.y)/L;
  const gu=(R.gap.m.x-a.x)*ux+(R.gap.m.y+R.Hc-a.y)*uy;const P=u=>({x:a.x+ux*u,y:a.y+uy*u});return [[P(0),P(gu-R.gap.w)],[P(gu+R.gap.w),P(L)]]}
function bronzeGrad(g,x0,x1){const gr=g.createLinearGradient(x0,0,x1,0);gr.addColorStop(0,'#e6b864');gr.addColorStop(.45,'#a8732e');gr.addColorStop(1,'#5e3c14');return gr}
/* the inward offset (toward the sand) for top faces: a small vector up-screen */
function inV(R,k){const d=Math.hypot(R.in.x,R.in.y)||1;return {x:R.in.x/d*k,y:R.in.y/d*k*0.5}}
function railBronze(g,R){const h=R.Hc*0.86,pw=Math.max(1.2,TW*0.028),rt=Math.max(1.4,TW*0.03);const iv=inV(R,TW*0.025);
  for(const [p,q] of segs(R)){const L=Math.hypot(q.x-p.x,q.y-p.y);const n=Math.max(1,Math.round(L/(R.tile*0.5)));
    /* soft shadow on the walkway in front */
    g.fillStyle='rgba(30,18,8,.22)';ar91Path(g,[p,q,{x:q.x+TW*0.05,y:q.y+TW*0.035},{x:p.x+TW*0.05,y:p.y+TW*0.035}]);g.fill();
    /* the lower rail */
    const lo=h*0.35;g.strokeStyle='#6a4418';g.lineWidth=Math.max(1,rt*0.6);g.beginPath();g.moveTo(p.x,p.y-lo);g.lineTo(q.x,q.y-lo);g.stroke();
    for(let i=0;i<=n;i++){const x=p.x+(q.x-p.x)*i/n,y=p.y+(q.y-p.y)*i/n;
      g.fillStyle=bronzeGrad(g,x-pw/2,x+pw/2);g.fillRect(x-pw/2,y-h,pw,h);g.fillStyle='#4a2e0e';g.fillRect(x-pw*0.8,y-Math.max(1,TW*0.012),pw*1.6,Math.max(1,TW*0.012)); /* foot plate */
      g.fillStyle='#f0cc7a';g.beginPath();g.arc(x,y-h,pw*0.75,0,Math.PI*2);g.fill()} /* knob */
    /* the top rail: a round bar (dark under-line, body, highlight) */
    g.lineCap='round';g.strokeStyle='#4a2e0e';g.lineWidth=rt+1;g.beginPath();g.moveTo(p.x,p.y-h+0.8);g.lineTo(q.x,q.y-h+0.8);g.stroke();
    g.strokeStyle='#b07a32';g.lineWidth=rt;g.beginPath();g.moveTo(p.x,p.y-h);g.lineTo(q.x,q.y-h);g.stroke();
    g.strokeStyle='rgba(255,226,150,.9)';g.lineWidth=Math.max(0.7,rt*0.35);g.beginPath();g.moveTo(p.x+iv.x,p.y-h-rt*0.25+iv.y);g.lineTo(q.x+iv.x,q.y-h-rt*0.25+iv.y);g.stroke();g.lineCap='butt'}}
function railBalus(g,R){const h=R.Hc*0.98,pl=Math.max(1.6,h*0.2),cp=Math.max(1.8,h*0.2);const iv=inV(R,TW*0.05);const capC=hex(ar91Mat().cap),lt=rgb(mix(capC,[255,252,240],0.55)),md=rgb(mix(capC,[236,226,206],0.3)),dk=rgb(mix(capC,[70,52,32],0.55));
  for(const [p,q] of segs(R)){const L=Math.hypot(q.x-p.x,q.y-p.y);
    g.fillStyle='rgba(30,18,8,.28)';ar91Path(g,[p,q,{x:q.x+TW*0.06,y:q.y+TW*0.04},{x:p.x+TW*0.06,y:p.y+TW*0.04}]);g.fill();
    /* the dark void behind the balusters (the near wall in shadow) */
    g.fillStyle='rgba(36,24,14,.55)';ar91Path(g,[{x:p.x,y:p.y-h},{x:q.x,y:q.y-h},q,p]);g.fill();
    /* the plinth: a solid light stone strip */
    ar91Path(g,[{x:p.x,y:p.y-pl},{x:q.x,y:q.y-pl},q,p]);g.fillStyle=md;g.fill();g.strokeStyle='rgba(40,28,16,.55)';g.lineWidth=0.7;g.stroke();
    /* balusters: a vase profile (neck · belly · foot), lit from the left */
    const bw=Math.max(2.6,TW*0.065),step=Math.max(bw*1.55,R.tile*0.13),n=Math.max(2,Math.floor(L/step));
    for(let i=0;i<n;i++){const t=(i+0.5)/n,x=p.x+(q.x-p.x)*t,y=p.y+(q.y-p.y)*t-pl,bh=h-pl-cp;
      const gr=g.createLinearGradient(x-bw/2,0,x+bw/2,0);gr.addColorStop(0,lt);gr.addColorStop(.55,md);gr.addColorStop(1,dk);
      g.fillStyle=gr;g.beginPath();g.moveTo(x-bw*0.4,y);g.lineTo(x+bw*0.4,y);g.quadraticCurveTo(x+bw*0.7,y-bh*0.38,x+bw*0.2,y-bh*0.74);g.lineTo(x+bw*0.34,y-bh);g.lineTo(x-bw*0.34,y-bh);g.lineTo(x-bw*0.2,y-bh*0.74);g.quadraticCurveTo(x-bw*0.7,y-bh*0.38,x-bw*0.4,y);g.closePath();g.fill();
      g.strokeStyle='rgba(50,36,22,.6)';g.lineWidth=0.6;g.stroke()}
    /* the coping (handrail): solid light stone, front face + a lit top edge */
    const T0={x:p.x,y:p.y-h},T1={x:q.x,y:q.y-h};ar91Path(g,[{x:T0.x+iv.x*0.5,y:T0.y+iv.y*0.5},{x:T1.x+iv.x*0.5,y:T1.y+iv.y*0.5},T1,T0]);g.fillStyle=lt;g.fill();
    ar91Path(g,[T0,T1,{x:T1.x,y:T1.y+cp},{x:T0.x,y:T0.y+cp}]);g.fillStyle=md;g.fill();g.fillStyle=R.left?'rgba(255,250,236,.12)':'rgba(40,28,16,.18)';g.fill();
    g.strokeStyle='rgba(40,28,16,.6)';g.lineWidth=0.7;g.beginPath();g.moveTo(T0.x,T0.y+cp);g.lineTo(T1.x,T1.y+cp);g.stroke();
    /* end pedestals */
    for(const E of [p,q]){const pw=bw*0.9;ar91Path(g,[{x:E.x-pw,y:E.y-h-cp*0.5},{x:E.x+pw,y:E.y-h-cp*0.5},{x:E.x+pw,y:E.y},{x:E.x-pw,y:E.y}]);g.fillStyle=md;g.fill();g.strokeStyle='rgba(40,28,16,.55)';g.lineWidth=0.7;g.stroke();
      g.fillStyle=lt;g.fillRect(E.x-pw-0.5,E.y-h-cp*0.5-1,pw*2+1,1.5)}}}
function railParapet(g,R){const h=R.Hc*0.96,wall=h*0.62,iv=inV(R,TW*0.06);
  for(const [p,q] of segs(R)){const L=Math.hypot(q.x-p.x,q.y-p.y);
    g.fillStyle='rgba(30,18,8,.25)';ar91Path(g,[p,q,{x:q.x+TW*0.06,y:q.y+TW*0.04},{x:p.x+TW*0.06,y:p.y+TW*0.04}]);g.fill();
    /* the marble slab wall: white with faint veins, a joint every tile, a darker plinth line */
    const F=[{x:p.x,y:p.y-wall},{x:q.x,y:q.y-wall},q,p];const mg=g.createLinearGradient(0,Math.min(p.y,q.y)-wall,0,Math.max(p.y,q.y));mg.addColorStop(0,'#fbf8f1');mg.addColorStop(1,'#d9d2c4');
    g.fillStyle=mg;ar91Path(g,F);g.fill();g.fillStyle=R.left?'rgba(255,255,255,.05)':'rgba(60,50,40,.16)';g.fill();
    g.save();ar91Path(g,F);g.clip();g.strokeStyle='rgba(120,112,102,.35)';g.lineWidth=0.6;let s=7;const rn=()=>{s=(s*16807)%2147483647;return s/2147483647};
    for(let i=0;i<Math.round(L/TW*3);i++){const t=rn(),x=p.x+(q.x-p.x)*t,y=p.y+(q.y-p.y)*t-wall*rn();g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+TW*0.12,y-wall*0.2,x+TW*0.26,y+wall*0.1);g.stroke()}
    const n=Math.max(1,Math.round(L/R.tile));g.strokeStyle='rgba(110,100,88,.55)';g.lineWidth=0.8;for(let i=1;i<n;i++){const x=p.x+(q.x-p.x)*i/n,y=p.y+(q.y-p.y)*i/n;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-wall);g.stroke()}g.restore();
    g.strokeStyle='rgba(60,50,40,.55)';g.lineWidth=0.8;ar91Path(g,F);g.stroke();
    /* top face of the slab */
    ar91Path(g,[{x:p.x+iv.x,y:p.y-wall+iv.y},{x:q.x+iv.x,y:q.y-wall+iv.y},{x:q.x,y:q.y-wall},{x:p.x,y:p.y-wall}]);g.fillStyle='#fffdf8';g.fill();
    /* the bronze top rail on short stubs */
    const n2=Math.max(1,Math.round(L/(R.tile*0.5)));const rh=h-wall,pw=Math.max(1,TW*0.022);
    for(let i=0;i<=n2;i++){const x=p.x+(q.x-p.x)*i/n2+iv.x*0.5,y=p.y+(q.y-p.y)*i/n2-wall+iv.y*0.5;g.fillStyle=bronzeGrad(g,x-pw/2,x+pw/2);g.fillRect(x-pw/2,y-rh,pw,rh)}
    const rt=Math.max(1.4,TW*0.03);g.lineCap='round';const P0={x:p.x+iv.x*0.5,y:p.y-h+iv.y*0.5},Q0={x:q.x+iv.x*0.5,y:q.y-h+iv.y*0.5};
    g.strokeStyle='#4a2e0e';g.lineWidth=rt+1;g.beginPath();g.moveTo(P0.x,P0.y+0.8);g.lineTo(Q0.x,Q0.y+0.8);g.stroke();
    g.strokeStyle='#b07a32';g.lineWidth=rt;g.beginPath();g.moveTo(P0.x,P0.y);g.lineTo(Q0.x,Q0.y);g.stroke();
    g.strokeStyle='rgba(255,226,150,.9)';g.lineWidth=Math.max(0.7,rt*0.35);g.beginPath();g.moveTo(P0.x,P0.y-rt*0.25);g.lineTo(Q0.x,Q0.y-rt*0.25);g.stroke();g.lineCap='butt'}}
const RAIL={bronze:railBronze,balus:railBalus,parapet:railParapet};
ar91Under=function(g){const r=B.under.apply(this,arguments);if(PR.rail&&!ar91Lud()){try{for(const R of railEdges())RAIL[PR.rail](g,R)}catch(e){console.error(e)}}return r};
/* ---------- switch + measure ---------- */
PR.set=function(o){Object.assign(PR,o);try{S.bubbles=[];S.emotes=[]}catch(e){}for(const id of ['cardShow','bubbles','wbubs','tip']){const e=document.getElementById(id);if(e){if(id==='tip')e.style.display='none';else e.innerHTML=''}}AR91.ver++;for(const k in AR91TEX)delete AR91TEX[k];try{if(typeof Z99!=='undefined'&&Z99&&Z99.cache)Z99.cache=null}catch(e){}draw();draw()};
/* one cached frame vs one rebuild (all static layers re-baked) */
PR.cost=function(n=12){const cachedA=[],rebuildA=[];for(let i=0;i<n;i++){draw();let t=performance.now();draw();cachedA.push(performance.now()-t);AR91.ver++;t=performance.now();draw();rebuildA.push(performance.now()-t)}
  const med=a=>{a=a.slice().sort((x,y)=>x-y);return +a[a.length>>1].toFixed(2)};return {cached:med(cachedA),rebuild:med(rebuildA),under:+(AR91.ms[0]||0).toFixed(2),top:+(AR91.ms[1]||0).toFixed(2),texMs:+(PR.texMs||0).toFixed(1)}};
})();

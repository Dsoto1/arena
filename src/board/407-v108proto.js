/* =====================================================================
   407-v108proto — v1.08 MOCK-UP PROTOTYPE (NOT SHIPPED; tools/plans/v108/MOCKUP.md). OFF unless localStorage flavius_v108proto is set:
   '1' / 'all' = every item, or a comma list of 'torch', 'mat', 'depth'. With the flag unset NOTHING below installs (no wrapper, no
   state read per frame): the board is byte-for-byte today's. DISPLAY ONLY: never S, rand(), the log, a save or the online hash.
   • TORCH (night only, his V3a "torches on the RIM only"): THE POOLS ARE BAKED into 189's grade canvas (night91Bake): round each rim light
     the night grade is thinned (destination-out) and warmed, so the sand's own tone shows through warm at the edges while the middle keeps
     189's moonlit blue (+ a faint cooler lift). Live, per frame: 189's big pool gradients are replaced by small ones that only breathe with
     the flame (night91F; Reduce motion / Animations Off / Light board = still), then 189's own torches + braziers. SHADOWS AWAY FROM THE
     NEAREST TORCHES (Lighting Full only): the two strongest rim lights at each piece re-aim its v1.06 BAKED sun shadow along the ground (an
     affine re-projection about its base: rotate in the ground plane, stretch with distance, weight by the light's falloff) — pillars / jugs /
     chest MERGED into a copy of 399's cached static layer (one layer, 401's chunked blit), figures + beasts per frame (≤ 2 extra drawImage
     each; on a highlighted tile their alpha is cut by 399's hlLift instead of a clip). The moon keeps 399's night shadow (V108K.moonCast .16 = today; .11 tried: clearer torch direction, but the move tile in a pillar's shadow lost highlight contrast).
   • MAT (day + night): baked, zero per-frame cost — sand grain (a seeded speck pattern; raked rings exist behind V108K.rake, off: they read
     as scratches on paving), plank seams, butt joints and a lit nosing on the stands' benches, baked into 192's LIGHT layer by day / 189's
     grade by night (both already blitted once a frame, source-atop); metal sheen on the figure / beast cells (a one-time pixel pass when a
     cell is made, base band skipped — a stand-in for re-baking the sheets with a metal material); a glaze glint on the Blessing jugs.
   • DEPTH (day + night): baked the same way — ambient occlusion along the sand's edges (deeper under the far walls), at the back of
     every bench tread (tread meets riser), a lit top on the far walls' cap, the far stands slightly darker with distance.
   Bench switches: V108.set(on) (re-bakes), V108.ab (per-frame work only), V108.no (Set: 'pools' | 'tl' | 'figs' | 'lowq' — ablation).
   Stats: V108.st. Tools: tools/bench/v108shots.js (pictures), v108ab.js (paired cost), v108same.js (flag off = v1.07), v108all.sh.
   ===================================================================== */
const V108={on:false,ab:true,no:new Set(),it:new Set(),st:{bakeDay:0,bakeNight:0,tl:0,figT:0,metal:0,metalMs:0,pools:0},tl:null,fr:[],spr:{}};
try{const v=localStorage.getItem('flavius_v108proto');if(v){V108.on=true;(v==='1'||v==='all'?['torch','mat','depth']:v.split(',')).forEach(k=>V108.it.add(k.trim()))}}catch(e){}
const v108Has=k=>V108.on&&V108.it.has(k);
/* TWEAK: the look's knobs (his open choices in MOCKUP.md) */
const V108K={pool:0.2,poolR:[1.7,1.5],poolIn:0.3,lit:0.72,litR:[2.9,2.5],warm:0.2,moonCast:0.16,torchCast:0.45,torchR:5.0,torchH:1.4,kMin:0.9,kMax:1.7,
  moonMid:0.05,grain:0.45,rake:0,plank:0.2,metal:0.3,glint:0.32,aoFar:0.3,aoNear:0.15,aoTier:0.3,capLit:0.75,farDark:0.22};
if(V108.on){
/* ---------------- shared helpers ---------------- */
const v108Mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c};
const v108Lerp=(a,b,f)=>({x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f});
function v108Poly(g,P){g.beginPath();P.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath()}
/* a band along the edge a–b fading toward the edge a2–b2 */
function v108Band(g,a,b,a2,b2,col,al){const m=v108Lerp(a,b,0.5),m2=v108Lerp(a2,b2,0.5);const G=g.createLinearGradient(m.x,m.y,m2.x,m2.y);
  G.addColorStop(0,col+al+')');G.addColorStop(1,col+'0)');g.fillStyle=G;v108Poly(g,[a,b,b2,a2]);g.fill()}
/* the seeded sand-grain tile (128 px; cosmetic, never rand()) */
function v108Grain(night){const k='grain'+(night?1:0);if(V108.spr[k])return V108.spr[k];const c=v108Mk(128,128),g=c.getContext('2d');let q=8080+(night?7:0);
  const rn=()=>{q=(q*1103515245+12345)&0x7fffffff;return q/0x7fffffff};
  for(let i=0;i<1500;i++){const x=1+rn()*125,y=1+rn()*125,lt=rn()<0.5,s=rn()<0.85?1:2;g.fillStyle=lt?(night?'rgba(170,190,240,.22)':'rgba(255,250,236,.34)'):(night?'rgba(0,4,20,.26)':'rgba(70,46,22,.26)');g.fillRect(x,y,s,s)}
  for(let i=0;i<24;i++){const x=3+rn()*120,y=3+rn()*120;g.fillStyle=night?'rgba(0,4,20,.12)':'rgba(70,46,22,.12)';g.beginPath();g.ellipse(x,y,1.3,0.8,0,0,Math.PI*2);g.fill();
    g.fillStyle=night?'rgba(170,190,240,.14)':'rgba(255,250,236,.22)';g.fillRect(x-1.4,y-1.6,1.2,0.8)}
  return V108.spr[k]=c}
const v108Spots=typeof night91Spots==='function'?night91Spots:()=>[];   /* 189's rim lights (kept: the night91Sand wrapper hides the global for 189's own call) */
const v108Lud=()=>typeof ar91Lud==='function'&&ar91Lud();

/* ---------------- MAT + DEPTH: baked into 192 LIGHT (day) / 189 grade (night) ---------------- */
function v108Static(g,night){if(!V108.ab)return;const t0=performance.now();const mat=v108Has('mat'),dep=v108Has('depth');if(!mat&&!dep)return;
  const R0=ar91Ring(0);const mid=ar91Mid();const sand=()=>v108Poly(g,R0);
  /* 1 · the sand: grain + raked rings (mat) */
  if(mat){g.save();sand();g.clip();const P=g.createPattern(v108Grain(night),'repeat');const k=Math.max(0.5,TW/56);try{P.setTransform(new DOMMatrix().scale(k))}catch(e){}
    g.globalAlpha=V108K.grain*(night?0.5:1);g.fillStyle=P;g.fillRect(-TW*20,-TW*20,TW*60,TW*40);g.globalAlpha=1;
    /* raked rings round the middle, in ground space (circles on the sand = ellipses on screen): a groove + its lit ridge */
    if(V108K.rake>0){const a=center(0,0),b=center(0,1),d=center(1,0),n=(N-1)/2;g.save();g.transform(b.x-a.x,b.y-a.y,d.x-a.x,d.y-a.y,a.x,a.y);
    g.lineWidth=0.02;for(let r=1.2;r<9.4;r+=0.2){g.strokeStyle=night?`rgba(0,4,20,${V108K.rake})`:`rgba(80,52,24,${V108K.rake})`;g.beginPath();g.arc(n,n,r,0,Math.PI*2);g.stroke();
      g.strokeStyle=night?`rgba(160,185,240,${V108K.rake*0.7})`:`rgba(255,248,230,${V108K.rake*1.1})`;g.beginPath();g.arc(n-0.025,n-0.025,r,0,Math.PI*2);g.stroke()}
    g.restore()}g.restore()}
  /* 2 · AO along the sand's edges: deep under the far walls, light at the low near walls (depth) */
  if(dep){g.save();sand();g.clip();const Ri=ar91Ring(-0.62),Rn=ar91Ring(-0.34);const col=night?'rgba(2,4,16,':'rgba(40,26,12,';
    for(const E of ar91Edges(0)){const RR=E.far?Ri:Rn;v108Band(g,R0[E.ia],R0[E.ib],RR[E.ia],RR[E.ib],col,(E.far?V108K.aoFar:V108K.aoNear)*(night?0.85:1))}g.restore()}
  /* 3 · the stands: plank seams + lit nosing (mat), AO at the back of each tread (depth) */
  if(typeof SECTIONS!=='undefined'&&typeof secQuad==='function'&&!v108Lud()){const tiers=typeof ar91Tiers==='function'?ar91Tiers():3;
    for(let si=0;si<8;si++){const s=SECTIONS[si];for(let t=0;t<tiers;t++){const d0=1.35+t*0.47,d1=d0+0.47;const Q=secQuad(si,d0,d1).map(([r,c])=>{const p=pt(r,c);return {x:p.x,y:p.y-t*TW*0.08}});
      if(dep)v108Band(g,Q[3],Q[2],v108Lerp(Q[3],Q[0],0.42),v108Lerp(Q[2],Q[1],0.42),night?'rgba(2,4,14,':'rgba(24,8,4,',V108K.aoTier*(night?0.8:1));
      if(mat){g.save();v108Poly(g,Q);g.clip();g.lineWidth=Math.max(0.7,TW*0.014);g.strokeStyle=`rgba(28,10,6,${V108K.plank})`;g.beginPath();
        for(const f of [1/3,2/3]){const A=v108Lerp(Q[0],Q[3],f),B=v108Lerp(Q[1],Q[2],f);g.moveTo(A.x,A.y);g.lineTo(B.x,B.y)}
        for(let row=0;row<3;row++){const f0=row/3,f1=(row+1)/3;for(let u=(row%2?0.55:0.15)+((si*3+t)%4)*0.07;u<1;u+=0.24){const A=v108Lerp(v108Lerp(Q[0],Q[1],u),v108Lerp(Q[3],Q[2],u),f0),B=v108Lerp(v108Lerp(Q[0],Q[1],u),v108Lerp(Q[3],Q[2],u),f1);g.moveTo(A.x,A.y);g.lineTo(B.x,B.y)}}
        g.stroke();const A=v108Lerp(Q[0],Q[3],0.05),B=v108Lerp(Q[1],Q[2],0.05);g.strokeStyle=night?'rgba(170,185,235,.16)':'rgba(255,214,180,.26)';g.lineWidth=Math.max(0.8,TW*0.018);g.beginPath();g.moveTo(A.x,A.y);g.lineTo(B.x,B.y);g.stroke();g.restore()}}}}
  /* 4 · the far walls: a lit cap (depth) */
  if(dep&&!v108Lud()){const C2=ar91Ring(0.31),H=TW*0.36,capH=TW*0.032,cY=TW*0.022;
    for(const E of ar91Edges(0.19).filter(E=>E.far)){let a=E.a,b=E.b,a2=C2[E.ia],b2=C2[E.ib];if(a.x>b.x){let q=a;a=b;b=q;q=a2;a2=b2;b2=q}
      const A2=v108Lerp(a,a2,0.35),B2=v108Lerp(b,b2,0.35);g.fillStyle=night?'rgba(180,200,255,.22)':'rgba(255,236,206,.34)';
      v108Poly(g,[{x:a.x,y:a.y-H-cY},{x:b.x,y:b.y-H-cY},{x:B2.x,y:B2.y-H-cY},{x:A2.x,y:A2.y-H-cY}]);g.fill();
      g.strokeStyle=night?'rgba(190,210,255,.4)':`rgba(255,240,214,${V108K.capLit})`;g.lineWidth=Math.max(1,TW*0.016);g.beginPath();g.moveTo(a.x,a.y-H-capH+TW*0.012);g.lineTo(b.x,b.y-H-capH+TW*0.012);g.stroke()}}
  /* 5 · the far stands darker with distance, off the sand and the walls (depth) */
  if(dep){const Ro=ar91Ring(0.95);let yT=1e9;for(let si=0;si<8;si++){for(const [r,c] of secQuad(si,3.4,3.4)){yT=Math.min(yT,pt(r,c).y-TW*0.3)}}
    g.save();g.beginPath();g.rect(-TW*40,-TW*40,TW*120,TW*120);Ro.slice().reverse().forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.clip('evenodd');
    const G=g.createLinearGradient(0,yT,0,mid.y);G.addColorStop(0,(night?'rgba(2,4,14,':'rgba(30,20,12,')+(V108K.farDark*(night?0.7:1))+')');G.addColorStop(1,night?'rgba(2,4,14,0)':'rgba(30,20,12,0)');
    g.fillStyle=G;g.fillRect(-TW*40,yT,TW*120,mid.y-yT);g.restore()}
  V108.st[night?'bakeNight':'bakeDay']=performance.now()-t0}
if((v108Has('mat')||v108Has('depth'))&&typeof ar91LightPaint==='function'){const base=ar91LightPaint;ar91LightPaint=function(g){const r=base.apply(this,arguments);try{v108Static(g,false)}catch(e){console.error(e)}return r}}
/* the night grade (189): baked once per its key; our additions are tagged on the cache object */
if(typeof night91Bake==='function'){const base=night91Bake;night91Bake=function(){const C=base.apply(this,arguments);try{if(C&&!C.v108&&V108.ab){C.v108=1;const g=C.gc.getContext('2d');g.save();
    if(v108Has('torch')){const D=night91Dia(0);const cx=(D[0].x+D[2].x)/2,cy=(D[0].y+D[2].y)/2,R=(D[1].x-D[3].x)/2;g.save();night91Path(g,D);g.clip();g.translate(cx,cy);g.scale(1,0.5);
      const rg=g.createRadialGradient(0,-R*0.05,0,0,0,R*0.62);rg.addColorStop(0,`rgba(130,165,255,${V108K.moonMid})`);rg.addColorStop(1,'rgba(130,165,255,0)');g.fillStyle=rg;g.fillRect(-R,-R,R*2,R*2);g.restore();
      /* the torch pools, BAKED: the night grade thinned round each rim light (the sand's own warm tone shows through) + a warm cast; the live
         sprite on top only breathes with the flame */
      const M=isoFix(N/2,N/2);g.save();night91Path(g,night91Dia(0.75));g.clip();
      for(const sp of v108Spots()){const p=isoFix(sp.r,sp.c);const dx=M.x-p.x,dy=M.y-p.y,L=Math.hypot(dx,dy*2)||1;const x=p.x+dx/L*TW*V108K.poolIn,y=p.y+dy/L*TW*V108K.poolIn;
        const Rr=TW*(sp.k==='b'?V108K.litR[0]:V108K.litR[1]);
        for(const [op,c0,c1,a] of [['destination-out','rgba(0,0,0,','rgba(0,0,0,',V108K.lit],['source-over','rgba(255,138,52,','rgba(255,120,40,',V108K.warm]]){g.save();g.globalCompositeOperation=op;g.translate(x,y);g.scale(1,0.5);
          const G=g.createRadialGradient(0,0,0,0,0,Rr);G.addColorStop(0,c0+a+')');G.addColorStop(.35,c0+(a*0.62).toFixed(3)+')');G.addColorStop(.7,c1+(a*0.18).toFixed(3)+')');G.addColorStop(1,c1+'0)');g.fillStyle=G;g.fillRect(-Rr,-Rr,Rr*2,Rr*2);g.restore()}}
      g.restore()}
    v108Static(g,true);g.restore()}}catch(e){console.error(e)}return C}}

/* ---------------- MAT: metal sheen on the figure / beast cells (one pixel pass when a cell is made) ---------------- */
function v108Metal(c,base){if(!V108.ab||!c||c.v108||!(c.width>2&&c.height>2))return c;c.v108=1;const t0=performance.now();try{
  const g=c.getContext('2d');const W=c.width,H=c.height;const im=g.getImageData(0,0,W,H),d=im.data;const L=new Float32Array(W*H);
  for(let i=0,j=0;j<W*H;i+=4,j++){L[j]=(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11)/255}
  const K=V108K.metal;
  const yMax=Math.floor(H*(base||0.8));for(let y=0;y<Math.min(H-1,yMax);y++)for(let x=0;x<W-1;x++){const j=y*W+x,i=j*4;if(d[i+3]<200)continue;const r=d[i],gg=d[i+1],b=d[i+2],mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),sat=mx?(mx-mn)/mx:0,l=L[j];
    let hue=0;if(mx!==mn){if(mx===r)hue=((gg-b)/(mx-mn))*60;else if(mx===gg)hue=(2+(b-r)/(mx-mn))*60;else hue=(4+(r-gg)/(mx-mn))*60;if(hue<0)hue+=360}
    const steel=sat<0.14&&l>0.28&&l<0.9&&b+6>=r,gold=hue>=38&&hue<=60&&sat>0.42&&l>0.3&&l<0.85;if(!steel&&!gold)continue;
    const lit=l-L[j+W+1];   /* brighter than its lower-right neighbour = turned toward the sun (upper left) */
    let f=1+K*(l-0.5)*1.4;let add=0;if(lit>0.015)add=K*120*Math.min(1,lit*8)*(l>0.55?1:0.4);
    d[i]=Math.max(0,Math.min(255,r*f+add));d[i+1]=Math.max(0,Math.min(255,gg*f+add*(gold?0.92:1)));d[i+2]=Math.max(0,Math.min(255,b*f+add*(gold?0.7:1.05)))}
  g.putImageData(im,0,0)}catch(e){}V108.st.metal++;V108.st.metalMs+=performance.now()-t0;return c}
if(v108Has('mat')){
  if(typeof an100CellCanvas==='function'){const base=an100CellCanvas;an100CellCanvas=function(){return v108Metal(base.apply(this,arguments))}}
  if(typeof bst100CellCanvas==='function'){const base=bst100CellCanvas;bst100CellCanvas=function(){const e=base.apply(this,arguments);if(e&&e.c)v108Metal(e.c,0.6);return e}}
  /* the Blessing jug's glaze glint (192's jug geometry: body widest at y − 0.27 s) */
  if(typeof drawPot==='function'){const base=drawPot;drawPot=function(x,y,s,eagle){const r=base.apply(this,arguments);try{if(V108.ab&&!eagle&&s>4&&!HEADLESS&&!(typeof lite84On==='function'&&lite84On())){
      let sp=V108.spr.glint;if(!sp){sp=V108.spr.glint=v108Mk(64,64);const q=sp.getContext('2d');const G=q.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,'rgba(255,246,236,1)');G.addColorStop(.45,'rgba(255,240,226,.45)');G.addColorStop(1,'rgba(255,240,226,0)');q.fillStyle=G;q.fillRect(0,0,64,64)}
      const nt=typeof night91On==='function'&&night91On();ctx.save();ctx.globalAlpha=V108K.glint*(nt?0.55:1);ctx.drawImage(sp,x-s*0.31,y-s*0.56,s*0.17,s*0.34);ctx.globalAlpha*=0.6;ctx.drawImage(sp,x-s*0.15,y-s*0.86,s*0.1,s*0.06);ctx.restore()}}catch(e){}return r}}}

/* ---------------- TORCH: the live part of the pools (breathing) + the lights ---------------- */
/* the rim lights on screen + their flicker now */
function v108Lights(t){return v108Spots().map((s,i)=>{const p=isoFix(s.r,s.c);return {...s,x:p.x,y:p.y,f:night91F(i,t),i}})}
function v108DrawTorches(){const fl=night91Flick();const t=fl?(performance.now()-NIGHT91.t0)/1000:0;const pts=v108Lights(t);const M=isoFix((N)/2,(N)/2);V108.lastF=pts.map(p=>+p.f.toFixed(4));
  /* the pools: pushed onto the sand edge, warm, additive, clipped to the rim like 189's */
  if(!V108.no.has('pools')){ctx.save();night91Path(ctx,night91Dia(0.75));ctx.clip();ctx.globalCompositeOperation='lighter';
  for(const p of pts){const R=TW*(p.k==='b'?V108K.poolR[0]:V108K.poolR[1])*(0.97+0.03*p.f);const dx=M.x-p.x,dy=M.y-p.y,L=Math.hypot(dx,dy*2)||1;
    const x=p.x+dx/L*TW*V108K.poolIn,y=p.y+dy/L*TW*V108K.poolIn,al=V108K.pool*p.f*(p.k==='b'?1.1:1);ctx.save();ctx.translate(x,y);ctx.scale(1,0.5);const G=ctx.createRadialGradient(0,0,0,0,0,R);
    G.addColorStop(0,'rgba(255,150,60,'+al.toFixed(3)+')');G.addColorStop(.5,'rgba(240,120,40,'+(al*0.35).toFixed(3)+')');G.addColorStop(1,'rgba(200,90,30,0)');ctx.fillStyle=G;ctx.fillRect(-R,-R,R*2,R*2);ctx.restore();V108.st.pools++}
  ctx.restore()}
  /* the lights themselves (189's look, back to front) */
  const boxes=[];
  for(const p of pts.slice().sort((a,b)=>a.y-b.y)){const sway=fl?Math.sin(t*5.1+p.i*2.3)*TW*0.012:0;const x=p.x,y=p.y;
    ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ell(x,y,TW*0.12,TW*0.05);ctx.fill();let top;
    if(p.k==='b'){const bh=TW*0.2,bw=TW*0.14;ctx.strokeStyle='#3a2a18';ctx.lineWidth=Math.max(1,TW*0.022);
      for(const dx of [-0.09,0,0.09]){ctx.beginPath();ctx.moveTo(x+dx*TW,y+(dx?0:TW*0.012));ctx.lineTo(x+dx*TW*0.35,y-bh);ctx.stroke()}
      const bg=ctx.createLinearGradient(x-bw,0,x+bw,0);bg.addColorStop(0,'#5a3c1c');bg.addColorStop(.4,'#b8853e');bg.addColorStop(1,'#4a3016');ctx.fillStyle=bg;
      ctx.beginPath();ctx.moveTo(x-bw,y-bh);ctx.quadraticCurveTo(x,y-bh+TW*0.11,x+bw,y-bh);ctx.closePath();ctx.fill();ctx.fillStyle='#2a1a0c';ell(x,y-bh,bw,TW*0.03);ctx.fill();
      night91Fire(x,y-bh,TW*0.24,TW*0.095,p.f,sway);top=y-bh-TW*0.24*1.06}
    else{const ph=TW*0.28;ctx.fillStyle='#4a3420';ctx.fillRect(x-TW*0.018,y-ph,TW*0.036,ph);ctx.fillStyle='#2a1c10';ctx.beginPath();ctx.moveTo(x-TW*0.045,y-ph);ctx.lineTo(x+TW*0.045,y-ph);ctx.lineTo(x+TW*0.025,y-ph+TW*0.05);ctx.lineTo(x-TW*0.025,y-ph+TW*0.05);ctx.closePath();ctx.fill();
      night91Fire(x,y-ph,TW*0.18,TW*0.06,p.f,sway);top=y-ph-TW*0.18*1.06}
    ctx.globalCompositeOperation='lighter';const hy=(top+y)/2-TW*0.12,hr=TW*0.46*p.f;const hg=ctx.createRadialGradient(x,hy,0,x,hy,hr);hg.addColorStop(0,'rgba(255,170,70,.34)');hg.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=hg;ctx.fillRect(x-hr,hy-hr,hr*2,hr*2);
    ctx.restore();const hw=p.k==='b'?TW*0.14:TW*0.07;boxes.push({k:p.k,x0:x-hw,x1:x+hw,y0:top,y1:y+TW*0.05})}
  NIGHT91.torches=boxes}
if(v108Has('torch')&&typeof night91Sand==='function'){const base=night91Sand;night91Sand=function(){if(!V108.ab||!night91On())return base.apply(this,arguments);
  /* 189 draws its pools + lights from night91Spots: hidden for the call, ours drawn after (same order: grade, sky, figure glow, then lights) */
  const sp=night91Spots;let r;night91Spots=()=>[];try{r=base.apply(this,arguments)}finally{night91Spots=sp}
  try{v108DrawTorches()}catch(e){console.error(e)}return r}}

/* ---------------- TORCH: shadows away from the nearest rim lights (Lighting Full) ---------------- */
/* the two strongest rim lights at a ground point (screen x, y): [{w, phi (ground angle away from the light, rad), k (stretch)}] */
function v108Near(x,y){const out=[];const T=TW/Math.SQRT2;for(const s of v108Spots()){const p=isoFix(s.r,s.c);const dx=x-p.x,dy=(y-p.y)*2,d=Math.hypot(dx,dy)/T;
    const w=Math.pow(Math.max(0,1-d/V108K.torchR),1.6)*(s.k==='b'?1.15:1);if(w<0.06)continue;out.push({w,phi:Math.atan2(dy,dx),k:Math.max(V108K.kMin,Math.min(V108K.kMax,0.6+0.45*d/(V108K.torchH/1.4)))})}
  out.sort((a,b)=>b.w-a.w);return out.slice(0,2)}
/* the ground re-projection of a sun-baked shadow about its base (ax, ay): Sq · R(phi) · stretch(k) · R(−sun) · Sq⁻¹ */
function v108M(ax,ay,phi,k){const sun=LIGHT106.sun.az;return new DOMMatrix().translate(ax,ay).scale(1,0.5).rotate(phi*180/Math.PI).scale(k,1).rotate(-sun).scale(1,2).translate(-ax,-ay)}
function v108Box(M,x,y,w,h){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [px,py] of [[x,y],[x+w,y],[x,y+h],[x+w,y+h]]){const q=M.transformPoint(new DOMPoint(px,py));x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y)}return [x0,y0,x1-x0,y1-y0]}
if(v108Has('torch')&&typeof LIGHT106!=='undefined'){LIGHT106.night.cast=V108K.moonCast;
  /* the figures' poses as 399 picks them this frame (one record per non-null shadow, in the order 399 pushes its ops) */
  if(typeof l106Pass==='function'){const base=l106Pass;l106Pass=function(){V108.fr=[];return base.apply(this,arguments)}}
  if(typeof l106GladSh==='function'){const base=l106GladSh;l106GladSh=function(){const r=base.apply(this,arguments);if(r)V108.fr.push(r);return r}}
  if(typeof l106BeastSh==='function'){const base=l106BeastSh;l106BeastSh=function(){const r=base.apply(this,arguments);if(r)V108.fr.push(r);return r}}
  if(typeof l106DrawFigs==='function'){const base=l106DrawFigs;l106DrawFigs=function(ops,hp,L){const r=base.apply(this,arguments);if(!V108.ab||V108.no.has('figs')||!l106Night()||V108.fr.length!==ops.length)return r;
    const t0=performance.now();try{const T=ctx.getTransform();const items=[];
      for(let i=0;i<ops.length;i++){const op=ops[i],R=V108.fr[i];const ax=op[1]-R.x,ay=op[2]-R.y;for(const n of v108Near(ax,ay)){const M=v108M(ax,ay,n.phi,n.k);items.push({op,M,a:V108K.torchCast*n.w,dev:v108Box(T.multiply(M),op[1],op[2],op[3],op[4])})}}
      const drawAll=sel=>{const ga=ctx.globalAlpha,T2=ctx.getTransform();if(V108.no.has('lowq'))ctx.imageSmoothingQuality='low';for(const it of sel){ctx.setTransform(T2.multiply(it.M));ctx.globalAlpha=ga*it.a;ctx.drawImage(...it.op)}ctx.setTransform(T2);ctx.globalAlpha=ga};
      ctx.save();
      if(hp){const b=hp.b,X=[b[0]*T.a+T.e,b[1]*T.d+T.f,b[2]*T.a+T.e,b[3]*T.d+T.f];for(const it of items){const q=it.dev;if(q[0]<X[2]&&q[0]+q[2]>X[0]&&q[1]<X[3]&&q[1]+q[3]>X[1])it.a*=1-LIGHT106.hlLift}}
      drawAll(items);
      ctx.restore();V108.st.figN=items.length}catch(e){console.error(e)}V108.st.figT+=performance.now()-t0;return r}}
  /* pillars / jugs / chest: one cached layer (the same key as 399's static layer), drawn after it through the same (401) path */
  /* 399's static layer + the torch shadows of pillars / jugs / chest MERGED into one cached canvas (same key): blitted instead of 399's
     (one pass of 401's chunks, no second layer); 399's own layer is kept for the day / Light / A-B */
  function v108TorchLayer(Ly0,ds){const key=Ly0.key+'|v108';if(V108.tl&&V108.tl.key===key&&V108.tl.src===Ly0)return V108.tl;const t0=performance.now();
    const items=[];for(const pl of S.pillars){if(!l106PilOK(pl)||l106PilMoving(pl))continue;const j=l106HasPots(pl);items.push({m:center(pl.r,pl.c),name:j?'pillar':'pillar0',prof:j?LIGHT106.pillar:LIGHT106.pillar.slice(0,3)})}
    if(S.chest&&S.chest.held==null)items.push({m:center(S.chest.r,S.chest.c),name:'chest',prof:LIGHT106.chest});
    const ops=[];for(const it of items){const {s,k}=l106Solid(it.name,it.prof,ds);for(const n of v108Near(it.m.x,it.m.y)){const M=v108M(it.m.x,it.m.y,n.phi,n.k);
      const x=it.m.x+s.x0*k,y=it.m.y+s.y0*k,w=s.c.width*k,h=s.c.height*k;ops.push({c:s.c,x,y,w,h,M,a:V108K.torchCast*n.w,box:v108Box(M,x,y,w,h)})}}
    if(!ops.length||!Ly0.c){V108.tl=Object.assign({},Ly0,{key,src:Ly0});return V108.tl}
    const c0=center(0,0);let x0=c0.x+Ly0.rx*TW,y0=c0.y+Ly0.ry*TW,x1=x0+Ly0.rw*TW,y1=y0+Ly0.rh*TW;const ox=x0,oy=y0;
    for(const o of ops){const [x,y,w,h]=o.box;x0=Math.min(x0,x-2);y0=Math.min(y0,y-2);x1=Math.max(x1,x+w+2);y1=Math.max(y1,y+h+2)}
    const dx=Math.round((ox-x0)*ds),dy=Math.round((oy-y0)*ds);x0=ox-dx/ds;y0=oy-dy/ds;   /* 399's pixels land on whole device pixels */
    const c=v108Mk((x1-x0)*ds,(y1-y0)*ds),g=c.getContext('2d');
    /* the torch casts merged first (no double darkening between them), then laid under 399's layer (its contacts + moon casts on top) */
    const t=v108Mk(c.width,c.height),tg=t.getContext('2d');const B=new DOMMatrix([ds,0,0,ds,-x0*ds,-y0*ds]);
    for(const o of ops){tg.setTransform(B.multiply(o.M));tg.globalAlpha=Math.min(1,o.a/V108K.torchCast);tg.drawImage(o.c,o.x,o.y,o.w,o.h)}
    g.globalAlpha=V108K.torchCast;g.drawImage(t,0,0);g.globalAlpha=1;g.drawImage(Ly0.c,dx,dy);t.width=t.height=0;
    V108.tl={key,src:Ly0,c,rx:(x0-c0.x)/TW,ry:(y0-c0.y)/TW,rw:(x1-x0)/TW,rh:(y1-y0)/TW,ds,casts:Ly0.casts,conts:Ly0.conts,
      rects:Ly0.rects.map(([x,y,w,h])=>[x+dx,y+dy,w,h]).concat(ops.map(o=>{const [x,y,w,h]=o.box;return [(x-x0)*ds,(y-y0)*ds,w*ds,h*ds]}))};
    V108.st.tl++;V108.st.tlMs=performance.now()-t0;return V108.tl}
  if(typeof l106DrawStatic==='function'){const base=l106DrawStatic;l106DrawStatic=function(Ly,hp){
    try{if(V108.ab&&!V108.no.has('tl')&&Ly===L106.layer&&l106Night()&&l106Mode()==='full'){const M=v108TorchLayer(Ly,Ly.ds||l106DS());
      /* 401 re-makes 399's layer once a zoom holds when it was built for another size: keep that working for the merged copy */
      try{const t=ctx.getTransform();if(Math.abs((M.ds||0)-t.a)>1e-6&&!(typeof zoom103Moving==='function'&&zoom103Moving())){L106.layer=null;requestAnimationFrame(()=>{try{if(S&&!HEADLESS)draw()}catch(e){}})}}catch(e){}
      return base.call(this,M,hp)}}catch(e){console.error(e)}return base.apply(this,arguments)}}}
/* bench A/B in one page (tools/bench/v108ab.js): V108.set(false) = today's look again (the baked layers re-made; cells already sheened stay) */
V108.set=function(on){V108.ab=!!on;try{if(v108Has('torch')&&typeof LIGHT106!=='undefined')LIGHT106.night.cast=on?V108K.moonCast:0.16}catch(e){}
  try{AR91.ver++;NIGHT91.key='';NIGHT91.cache=null;L106.layer=null;V108.tl=null}catch(e){}try{if(!HEADLESS)draw()}catch(e){}};
}

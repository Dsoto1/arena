/* =====================================================================
   409-v108light — v1.08 NIGHT TORCHES · SAND GRAIN + BENCH PLANKS + JUG GLINT · WALL / STANDS DEPTH (his answers 1a–8a on the mock-up
   2026-10-20, tools/plans/v108/MOCKUP.md; the prototype 407-v108proto made real and retired). DISPLAY ONLY: never S, rand(), the log, a
   save or the online hash — the flicker is time-based (performance.now), the grain's pattern a fixed seed of its own.
   ON by default. Kill switches (localStorage, each item): flavius_v108torchoff=1 · flavius_v108matoff=1 · flavius_v108depthoff=1.
   Follows Settings → Board & pieces → Lighting (399 l106Pref / l106Mode): Off (or 399's flavius_light106off=1) = none of this, today's board;
   Light (phones start there, and Full after 399's auto-drop) = the pools + flames + the baked look, no torch shadows; Full = everything.
   • TORCH (night only = 189's night91On, the same thing that decides night today): the warm pools are BAKED into 189's night grade
     (night91Bake): round each of the 11 rim lights the grade is thinned (destination-out, 72 %) and warmed (.2), so the sand's own tone
     shows through warm at the edges while the middle keeps 189's moonlit blue (+ a faint cooler lift). Live, a frame: 189's big pool
     gradients are replaced by small ones that only breathe with the flame (night91F), then 189's torches + braziers. Reduce motion /
     Animations Off / the Light board: still (night91Flick, like 189). SHADOWS AWAY FROM THE NEAREST TORCHES (Lighting Full only): the two
     strongest rim lights at each piece re-aim its v1.06 baked sun shadow along the ground (rotate about the base, stretch 0.9–1.7× with
     distance, weight by a 5-tile falloff); the shadows hold still. Pillars / jugs / chest: merged into a copy of 399's static layer (one
     layer, 401's chunked blit); figures + beasts ≤ 2 extra drawImage each a frame. The moon keeps 399's night shadow (.16 = today, 5a).
   • MAT (day + night): a fine seeded sand grain (no raked rings, 6a; not on the Naumachia's water), plank seams + staggered joints + a lit
     nosing on the stands' benches — baked into 192's LIGHT layer by day / 189's grade by night (both blitted once a frame anyway); a glaze
     glint on the Blessing jugs (one cached sprite). The metal sheen is NOT here (7a: a sheet re-bake, its own release v1.08b).
   • DEPTH (day + night, baked the same way): ambient occlusion along the sand's edges (0.6 tile under the far walls, 0.35 at the low near
     walls) and at the back of every bench tread, a lit top on the far walls' cap, the far stands slightly darker with distance.
   COST FIXES (MOCKUP.md "build must also fix"):
     F1 · 189 re-bakes its grade on every frame of a zoom ease / camera slide (its key holds TW, OX, OY). Our additions are NOT re-painted
          then: while the view moves (TW / OX / OY changed within V108K.settleMs) the last sharp grade (189's + ours) is laid in scaled +
          shifted over 189's fresh one (one clipped 'copy' drawImage); V108K.settleMs after the view holds, one sharp re-bake. By day our
          additions are painted straight into 192's LIGHT layer (cheaper than any re-use, see below).
     F2 · the torch shadow layer is not made in one go each time 399 rebuilds its static layer: never while the zoom eases (the last one is
          drawn scaled, it is kept in tile units like 399's), and otherwise built over 2+ frames: the casts into a HALF-resolution scratch
          canvas (soft shadows), then ≤ V108K.tlPx device px of the merge a frame; each frame's part is rasterised in that frame (a 1-px
          createImageBitmap snapshot, no read-back), the previous layer (same pieces, another size) or 399's own shown meanwhile.
   Bench: V108.noKick (no self-scheduled draws), V108.benchSync (rasterise inside the step: true per-step cost), V108.tlLog (step ms).
   Bench: V108.set(on) (re-bakes), V108.ab (per-frame work only, A/B in one page: tools/bench/v108ab.js); V108.st = stats incl. the worst
   single frame of our work (frameMax) and of each part. Tools: tools/bench/v108shots.js, v108ab.js, v108same.js, v108all.sh. Test tv108l.
   ===================================================================== */
const V108={on:true,ab:true,kill:{torch:false,mat:false,depth:false},no:new Set(),sig:'',tl:null,tb:null,fr:[],spr:{},ng:null,
  mv:{k:'',at:-1e9},tlLog:[],settleT:0,fw:0,lastF:null,
  st:{bakeDay:0,bakeNight:0,nightReuse:0,dayMs:0,nightMs:0,dayMax:0,nightMax:0,tl:0,tlMs:0,tlSteps:0,tlStepMax:0,tlMergeMs:0,tlWait:0,
    live:0,liveMax:0,figT:0,figN:0,figSkip:0,figMax:0,pools:0,frames:0,frameMax:0}};
try{for(const k of ['torch','mat','depth'])V108.kill[k]=localStorage.getItem('flavius_v108'+k+'off')==='1'}catch(e){}
/* TWEAK: the look (his picks 1a 3a 5a 6a 8a = the mock-up's values) and the cost guards */
const V108K={pool:0.2,poolR:[1.7,1.5],poolIn:0.3,lit:0.72,litR:[2.9,2.5],warm:0.2,torchCast:0.45,torchR:5.0,torchH:1.4,kMin:0.9,kMax:1.7,
  moonMid:0.05,grain:0.45,plank:0.2,glint:0.32,aoFar:0.3,aoNear:0.15,aoTier:0.3,capLit:0.75,farDark:0.22,
  settleMs:160,   /* the view holds this long → one sharp re-bake of the baked additions (F1) */
  budget:3,       /* ms a frame for building the torch shadow layer (F2) */
  tlRes:0.5,      /* the torch casts' scratch resolution (soft shadows: half is enough) */
  tlPx:700000};   /* device px of the torch layer merged a frame (F2) */
/* ---------------- gates ---------------- */
const v108Pref=()=>{try{return typeof l106Pref==='function'?l106Pref():'full'}catch(e){return 'full'}};
const v108ModeFull=()=>{try{return typeof l106Mode==='function'&&l106Mode()==='full'}catch(e){return false}};
/* an item is up: not killed, not V108.set(false), Lighting not Off */
function v108Item(k){return V108.on&&!V108.kill[k]&&v108Pref()!=='off'}
const v108Night=()=>typeof night91On==='function'&&night91On();
const v108Lud=()=>typeof ar91Lud==='function'&&ar91Lud();
const v108Arena=()=>typeof ar91On==='function'&&ar91On();
const v108Naum=()=>{try{return typeof isNaum==='function'&&isNaum()}catch(e){return false}};
/* our bit of a frame's work (for V108.st.frameMax: the worst single frame of everything this module adds) */
function v108Cost(k,ms){V108.fw+=ms;const s=V108.st;if(ms>(s[k+'Max']||0))s[k+'Max']=ms}
{const base=draw;draw=function(){V108.fw=0;const r=base.apply(this,arguments);if(V108.fw>0){V108.st.frames++;if(V108.fw>V108.st.frameMax)V108.st.frameMax=V108.fw}return r}}
/* the gates' state: a change (setting, V108.set) re-bakes the layers that hold our additions */
function v108Sig(){const s=[v108Item('torch'),v108Item('mat'),v108Item('depth')].map(v=>v?1:0).join('');if(s!==V108.sig){const first=!V108.sig;V108.sig=s;
  if(!first)try{AR91.ver++;NIGHT91.key='';NIGHT91.cache=null;L106.layer=null}catch(e){}V108.tl=null;V108.tb=null;V108.ng=null}return s}
/* the view is moving: TW / OX / OY changed within V108K.settleMs (a zoom ease, the camera sliding) */
function v108Moving(){const k=TW.toFixed(3)+'|'+OX.toFixed(2)+'|'+OY.toFixed(2),now=performance.now();if(k!==V108.mv.k){V108.mv.k=k;V108.mv.at=now}return now-V108.mv.at<V108K.settleMs}
/* one board draw once the view has held (the sharp re-bake) */
function v108Settle(){if(V108.settleT)return;V108.settleT=setTimeout(()=>{V108.settleT=0;try{if(typeof S!=='undefined'&&S&&!HEADLESS)draw()}catch(e){}},V108K.settleMs+40)}
/* what the baked additions depend on besides TW / OX / OY (those are re-mapped while the view moves) */
function v108CKey(w,h){const dpr=window.devicePixelRatio||1;let m='';try{m=ar91Mat().n+'|'+ar91Tiers()}catch(e){}
  return [w,h,dpr,N,typeof STANDS!=='undefined'&&STANDS?1:0,typeof ROT89!=='undefined'?ROT89.k:0,v108Lud()?1:0,v108Arena()?1:0,v108Naum()?1:0,m,V108.sig].join('|')}

/* ---------------- shared helpers ---------------- */
const v108Mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c};
const v108Lerp=(a,b,f)=>({x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f});
function v108Poly(g,P){g.beginPath();P.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath()}
/* a band along the edge a–b fading toward the edge a2–b2 */
function v108Band(g,a,b,a2,b2,col,al){const m=v108Lerp(a,b,0.5),m2=v108Lerp(a2,b2,0.5);const G=g.createLinearGradient(m.x,m.y,m2.x,m2.y);
  G.addColorStop(0,col+al+')');G.addColorStop(1,col+'0)');g.fillStyle=G;v108Poly(g,[a,b,b2,a2]);g.fill()}
/* the seeded sand-grain tile (128 px; cosmetic, its own seed — never rand()) */
function v108Grain(night){const k='grain'+(night?1:0);if(V108.spr[k])return V108.spr[k];const c=v108Mk(128,128),g=c.getContext('2d');let q=8080+(night?7:0);
  const rn=()=>{q=(q*1103515245+12345)&0x7fffffff;return q/0x7fffffff};
  for(let i=0;i<1500;i++){const x=1+rn()*125,y=1+rn()*125,lt=rn()<0.5,s=rn()<0.85?1:2;g.fillStyle=lt?(night?'rgba(170,190,240,.22)':'rgba(255,250,236,.34)'):(night?'rgba(0,4,20,.26)':'rgba(70,46,22,.26)');g.fillRect(x,y,s,s)}
  for(let i=0;i<24;i++){const x=3+rn()*120,y=3+rn()*120;g.fillStyle=night?'rgba(0,4,20,.12)':'rgba(70,46,22,.12)';g.beginPath();g.ellipse(x,y,1.3,0.8,0,0,Math.PI*2);g.fill();
    g.fillStyle=night?'rgba(170,190,240,.14)':'rgba(255,250,236,.22)';g.fillRect(x-1.4,y-1.6,1.2,0.8)}
  return V108.spr[k]=c}
const v108Spots=typeof night91Spots==='function'?night91Spots:()=>[];   /* 189's rim lights (kept: the night91Sand wrapper hides the global for 189's own call) */

/* ---------------- MAT + DEPTH: painted into 192 LIGHT (day) / 189 grade (night) ---------------- */
function v108Static(g,night){const mat=v108Item('mat'),dep=v108Item('depth');if((!mat&&!dep)||!v108Arena())return;
  const R0=ar91Ring(0);const mid=ar91Mid();const sand=()=>v108Poly(g,R0);
  /* 1 · the sand grain (mat; not on water) */
  if(mat&&!v108Naum()){g.save();sand();g.clip();const P=g.createPattern(v108Grain(night),'repeat');const k=Math.max(0.5,TW/56);try{P.setTransform(new DOMMatrix().scale(k))}catch(e){}
    g.globalAlpha=V108K.grain*(night?0.5:1);g.fillStyle=P;g.fillRect(-TW*20,-TW*20,TW*60,TW*40);g.globalAlpha=1;g.restore()}
  /* 2 · AO along the sand's edges: deep under the far walls, light at the low near walls (depth) */
  if(dep){g.save();sand();g.clip();const Ri=ar91Ring(-0.62),Rn=ar91Ring(-0.34);const col=night?'rgba(2,4,16,':'rgba(40,26,12,';
    for(const E of ar91Edges(0)){const RR=E.far?Ri:Rn;v108Band(g,R0[E.ia],R0[E.ib],RR[E.ia],RR[E.ib],col,(E.far?V108K.aoFar:V108K.aoNear)*(night?0.85:1))}g.restore()}
  /* 3 · the stands: plank seams + lit nosing (mat), AO at the back of each tread (depth) */
  if(typeof SECTIONS!=='undefined'&&typeof secQuad==='function'&&!v108Lud()){const tiers=typeof ar91Tiers==='function'?ar91Tiers():3;
    for(let si=0;si<8;si++){for(let t=0;t<tiers;t++){const d0=1.35+t*0.47,d1=d0+0.47;const Q=secQuad(si,d0,d1).map(([r,c])=>{const p=pt(r,c);return {x:p.x,y:p.y-t*TW*0.08}});
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
    g.fillStyle=G;g.fillRect(-TW*40,yT,TW*120,mid.y-yT);g.restore()}}

/* the torch pools baked into the grade + the moon's cooler lift (night, torch) */
function v108Pools(g){const D=night91Dia(0);const cx=(D[0].x+D[2].x)/2,cy=(D[0].y+D[2].y)/2,R=(D[1].x-D[3].x)/2;g.save();night91Path(g,D);g.clip();g.translate(cx,cy);g.scale(1,0.5);
  const rg=g.createRadialGradient(0,-R*0.05,0,0,0,R*0.62);rg.addColorStop(0,`rgba(130,165,255,${V108K.moonMid})`);rg.addColorStop(1,'rgba(130,165,255,0)');g.fillStyle=rg;g.fillRect(-R,-R,R*2,R*2);g.restore();
  const M=isoFix(N/2,N/2);g.save();night91Path(g,night91Dia(0.75));g.clip();
  for(const sp of v108Spots()){const p=isoFix(sp.r,sp.c);const dx=M.x-p.x,dy=M.y-p.y,L=Math.hypot(dx,dy*2)||1;const x=p.x+dx/L*TW*V108K.poolIn,y=p.y+dy/L*TW*V108K.poolIn;
    const Rr=TW*(sp.k==='b'?V108K.litR[0]:V108K.litR[1]);
    for(const [op,c0,c1,a] of [['destination-out','rgba(0,0,0,','rgba(0,0,0,',V108K.lit],['source-over','rgba(255,138,52,','rgba(255,120,40,',V108K.warm]]){g.save();g.globalCompositeOperation=op;g.translate(x,y);g.scale(1,0.5);
      const G=g.createRadialGradient(0,0,0,0,0,Rr);G.addColorStop(0,c0+a+')');G.addColorStop(.35,c0+(a*0.62).toFixed(3)+')');G.addColorStop(.7,c1+(a*0.18).toFixed(3)+')');G.addColorStop(1,c1+'0)');g.fillStyle=G;g.fillRect(-Rr,-Rr,Rr*2,Rr*2);g.restore()}}
  g.restore()}

/* ---- day: painted straight into 192's LIGHT layer (≈0.4–0.8 ms a re-paint, measured cheaper than any re-use: 192 re-paints it only on a
   zoom step / turn / resize — 208 slides it while the camera moves — and a laid-in copy of a screen-sized canvas costs more than this) ---- */
if(typeof ar91LightPaint==='function'){const base=ar91LightPaint;ar91LightPaint=function(g){const r=base.apply(this,arguments);
  try{if(!(v108Item('mat')||v108Item('depth'))||!v108Arena()||!g)return r;const t0=performance.now();v108Static(g,false);V108.st.bakeDay++;
    const ms=performance.now()-t0;V108.st.dayMs=ms;v108Cost('day',ms)}catch(e){console.error(e)}return r}}

/* ---- F1 · night: 189's grade + our additions; while the view moves, the last sharp one laid in scaled ---- */
function v108NightAny(){return v108Item('torch')||((v108Item('mat')||v108Item('depth'))&&v108Arena())}
if(typeof night91Bake==='function'){const base=night91Bake;night91Bake=function(Wd,Hd){let mv=false;
  try{if(v108NightAny()){mv=v108Moving();if(NIGHT91.cache&&NIGHT91.cache.v108s&&!mv)NIGHT91.key=''}}catch(e){}   /* a scaled stand-in: re-bake sharp now the view holds */
  const C=base.apply(this,arguments);
  try{if(C&&!C.v108){C.v108=1;if(!v108NightAny())return C;const t0=performance.now();const dpr=window.devicePixelRatio||1,key=v108CKey(Wd,Hd),P=V108.ng;
    if(mv&&P&&P.key===key&&P.c!==C.gc){const s=TW/P.tw,g=C.gc.getContext('2d');g.save();g.setTransform(s,0,0,s,dpr*(OX-P.ox*s),dpr*(OY-P.oy*s));
      g.beginPath();g.rect(0,0,P.c.width,P.c.height);g.clip();g.globalCompositeOperation='copy';g.drawImage(P.c,0,0);g.restore();C.v108s=1;V108.st.nightReuse++;v108Settle()}
    else{const g=C.gc.getContext('2d');g.save();if(v108Item('torch'))v108Pools(g);v108Static(g,true);g.restore();V108.ng={c:C.gc,key,tw:TW,ox:OX,oy:OY};V108.st.bakeNight++}
    const ms=performance.now()-t0;V108.st.nightMs=ms;v108Cost('night',ms)}}catch(e){console.error(e)}return C}}

/* ---------------- MAT: the Blessing jug's glaze glint (192's jug geometry: body widest at y − 0.27 s) ---------------- */
if(typeof drawPot==='function'){const base=drawPot;drawPot=function(x,y,s,eagle){const r=base.apply(this,arguments);try{if(V108.ab&&!eagle&&s>4&&!HEADLESS&&v108Item('mat')&&!(typeof lite84On==='function'&&lite84On())&&typeof AR91!=='undefined'&&AR91.on){
    let sp=V108.spr.glint;if(!sp){sp=V108.spr.glint=v108Mk(64,64);const q=sp.getContext('2d');const G=q.createRadialGradient(32,32,0,32,32,32);G.addColorStop(0,'rgba(255,246,236,1)');G.addColorStop(.45,'rgba(255,240,226,.45)');G.addColorStop(1,'rgba(255,240,226,0)');q.fillStyle=G;q.fillRect(0,0,64,64)}
    ctx.save();ctx.globalAlpha=V108K.glint*(v108Night()?0.55:1);ctx.drawImage(sp,x-s*0.31,y-s*0.56,s*0.17,s*0.34);ctx.globalAlpha*=0.6;ctx.drawImage(sp,x-s*0.15,y-s*0.86,s*0.1,s*0.06);ctx.restore()}}catch(e){}return r}}

/* ---------------- TORCH: the live part of the pools (breathing) + the lights ---------------- */
function v108Lights(t){return v108Spots().map((s,i)=>{const p=isoFix(s.r,s.c);return {...s,x:p.x,y:p.y,f:night91F(i,t),i}})}
function v108DrawTorches(){const fl=night91Flick();const t=fl?(performance.now()-NIGHT91.t0)/1000:0;const pts=v108Lights(t);const M=isoFix(N/2,N/2);V108.lastF=pts.map(p=>+p.f.toFixed(4));
  /* the pools: pushed onto the sand edge, warm, additive, clipped to the rim like 189's */
  ctx.save();night91Path(ctx,night91Dia(0.75));ctx.clip();ctx.globalCompositeOperation='lighter';
  for(const p of pts){const R=TW*(p.k==='b'?V108K.poolR[0]:V108K.poolR[1])*(0.97+0.03*p.f);const dx=M.x-p.x,dy=M.y-p.y,L=Math.hypot(dx,dy*2)||1;
    const x=p.x+dx/L*TW*V108K.poolIn,y=p.y+dy/L*TW*V108K.poolIn,al=V108K.pool*p.f*(p.k==='b'?1.1:1);ctx.save();ctx.translate(x,y);ctx.scale(1,0.5);const G=ctx.createRadialGradient(0,0,0,0,0,R);
    G.addColorStop(0,'rgba(255,150,60,'+al.toFixed(3)+')');G.addColorStop(.5,'rgba(240,120,40,'+(al*0.35).toFixed(3)+')');G.addColorStop(1,'rgba(200,90,30,0)');ctx.fillStyle=G;ctx.fillRect(-R,-R,R*2,R*2);ctx.restore();V108.st.pools++}
  ctx.restore();
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
if(typeof night91Sand==='function'){const base=night91Sand;night91Sand=function(){try{v108Sig();
  }catch(e){}
  if(!V108.ab||!v108Item('torch')||!v108Night())return base.apply(this,arguments);
  /* 189 draws its pools + lights from night91Spots: hidden for the call, ours drawn after (same order: grade, sky, figure glow, then lights) */
  const sp=night91Spots;let r;night91Spots=()=>[];try{r=base.apply(this,arguments)}finally{night91Spots=sp}
  const t0=performance.now();try{v108DrawTorches()}catch(e){console.error(e)}const ms=performance.now()-t0;V108.st.live+=ms;v108Cost('live',ms);return r}}

/* ---------------- TORCH: shadows away from the nearest rim lights (Lighting Full) ---------------- */
/* the two strongest rim lights at a ground point (screen x, y): [{w, phi (ground angle away from the light, rad), k (stretch)}] */
function v108Near(x,y){const out=[];const T=TW/Math.SQRT2;for(const s of v108Spots()){const p=isoFix(s.r,s.c);const dx=x-p.x,dy=(y-p.y)*2,d=Math.hypot(dx,dy)/T;
    const w=Math.pow(Math.max(0,1-d/V108K.torchR),1.6)*(s.k==='b'?1.15:1);if(w<0.06)continue;out.push({w,phi:Math.atan2(dy,dx),k:Math.max(V108K.kMin,Math.min(V108K.kMax,0.6+0.45*d/(V108K.torchH/1.4)))})}
  out.sort((a,b)=>b.w-a.w);return out.slice(0,2)}
/* the ground re-projection of a sun-baked shadow about its base (ax, ay): Sq · R(phi) · stretch(k) · R(−sun) · Sq⁻¹ */
function v108M(ax,ay,phi,k){const sun=LIGHT106.sun.az;return new DOMMatrix().translate(ax,ay).scale(1,0.5).rotate(phi*180/Math.PI).scale(k,1).rotate(-sun).scale(1,2).translate(-ax,-ay)}
function v108Box(M,x,y,w,h){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [px,py] of [[x,y],[x+w,y],[x,y+h],[x+w,y+h]]){const q=M.transformPoint(new DOMPoint(px,py));x0=Math.min(x0,q.x);y0=Math.min(y0,q.y);x1=Math.max(x1,q.x);y1=Math.max(y1,q.y)}return [x0,y0,x1-x0,y1-y0]}
const v108TorchOn=()=>V108.ab&&v108Item('torch')&&typeof l106Night==='function'&&l106Night()&&v108ModeFull();
if(typeof LIGHT106!=='undefined'){
  /* the figures' poses as 399 picks them this frame (one record per non-null shadow, in the order 399 pushes its ops) */
  if(typeof l106Pass==='function'){const base=l106Pass;l106Pass=function(){V108.fr=[];return base.apply(this,arguments)}}
  if(typeof l106GladSh==='function'){const base=l106GladSh;l106GladSh=function(){const r=base.apply(this,arguments);if(r)V108.fr.push(r);return r}}
  if(typeof l106BeastSh==='function'){const base=l106BeastSh;l106BeastSh=function(){const r=base.apply(this,arguments);if(r)V108.fr.push(r);return r}}
  /* figures + beasts: ≤ 2 extra drawImage each (their alpha cut by 399's lift on a highlighted tile instead of a clip) */
  if(typeof l106DrawFigs==='function'){const base=l106DrawFigs;l106DrawFigs=function(ops,hp,L){const r=base.apply(this,arguments);if(!v108TorchOn())return r;
    const t0=performance.now();try{const T=ctx.getTransform();const items=[];
      /* each op is paired with its pose record BY IDENTITY (the shadow-sheet cell canvas 399 cut for it: l106Cell → l106Mk, flagged _l106), never by
         index — and only a true shadow cell with the record's own size is re-aimed; anything else (a stray op, a canvas that is not 399's cell) is skipped */
      const by=new Map();for(const R of V108.fr)if(R&&R.c&&!by.has(R.c))by.set(R.c,R);let skip=0;
      for(let i=0;i<ops.length;i++){const op=ops[i],R=by.get(op[0]);
        if(!R||op[0]._l106!==1||Math.abs(op[3]-R.w)>0.01||Math.abs(op[4]-R.h)>0.01||!(op[3]>0)||op[3]>TW*4||op[4]>TW*4){skip++;continue}
        const ax=op[1]-R.x,ay=op[2]-R.y;for(const n of v108Near(ax,ay)){const M=v108M(ax,ay,n.phi,n.k);items.push({op,M,a:V108K.torchCast*n.w,dev:v108Box(T.multiply(M),op[1],op[2],op[3],op[4])})}}
      ctx.save();
      if(hp){const b=hp.b,X=[b[0]*T.a+T.e,b[1]*T.d+T.f,b[2]*T.a+T.e,b[3]*T.d+T.f];for(const it of items){const q=it.dev;if(q[0]<X[2]&&q[0]+q[2]>X[0]&&q[1]<X[3]&&q[1]+q[3]>X[1])it.a*=1-LIGHT106.hlLift}}
      const ga=ctx.globalAlpha;for(const it of items){ctx.setTransform(T.multiply(it.M));ctx.globalAlpha=ga*it.a;ctx.drawImage(...it.op)}
      ctx.restore();V108.st.figN=items.length;V108.st.figSkip=skip}catch(e){console.error(e)}const ms=performance.now()-t0;V108.st.figT+=ms;v108Cost('fig',ms);return r}}

  /* ---- F2 · pillars / jugs / chest: 399's static layer + their torch shadows MERGED into one cached copy, built in pieces ---- */
  /* 399's key without its size step (field 2): the same pieces at another zoom */
  const v108Geo=k=>{const a=String(k).split('|');a.splice(2,1);return a.join('|')};
  function v108TLStart(Ly0,ds,key){const items=[];for(const pl of S.pillars){if(!l106PilOK(pl)||l106PilMoving(pl))continue;const j=l106HasPots(pl);items.push({m:center(pl.r,pl.c),name:j?'pillar':'pillar0',prof:j?LIGHT106.pillar:LIGHT106.pillar.slice(0,3)})}
    if(S.chest&&S.chest.held==null)items.push({m:center(S.chest.r,S.chest.c),name:'chest',prof:LIGHT106.chest});
    const ops=[];for(const it of items){const {s,k}=l106Solid(it.name,it.prof,ds);for(const n of v108Near(it.m.x,it.m.y)){const M=v108M(it.m.x,it.m.y,n.phi,n.k);
      const x=it.m.x+s.x0*k,y=it.m.y+s.y0*k,w=s.c.width*k,h=s.c.height*k;ops.push({c:s.c,x,y,w,h,M,a:V108K.torchCast*n.w,box:v108Box(M,x,y,w,h)})}}
    const b={key,src:Ly0,ds,ops,i:0,geo:v108Geo(key),t0:performance.now(),ms:0,steps:0};
    if(!ops.length||!Ly0.c){b.out=Object.assign({},Ly0,{key,src:Ly0,geo:b.geo});return b}
    const c0=center(0,0);let x0=c0.x+Ly0.rx*TW,y0=c0.y+Ly0.ry*TW,x1=x0+Ly0.rw*TW,y1=y0+Ly0.rh*TW;const ox=x0,oy=y0;
    for(const o of ops){const [x,y,w,h]=o.box;x0=Math.min(x0,x-2);y0=Math.min(y0,y-2);x1=Math.max(x1,x+w+2);y1=Math.max(y1,y+h+2)}
    const dx=Math.round((ox-x0)*ds),dy=Math.round((oy-y0)*ds);x0=ox-dx/ds;y0=oy-dy/ds;   /* 399's pixels land on whole device pixels */
    const W=Math.ceil((x1-x0)*ds),H=Math.ceil((y1-y0)*ds),k=V108K.tlRes;
    const rects=Ly0.rects.map(([x,y,w,h])=>[x+dx,y+dy,w,h]).concat(ops.map(o=>{const [x,y,w,h]=o.box;return [(x-x0)*ds,(y-y0)*ds,w*ds,h*ds]}));
    /* the merge's pieces: CS² device px that hold pixels (like 401's chunks; not merged into runs: each one is a bounded step) */
    const CS=256,nx=Math.ceil(W/CS),ny=Math.ceil(H/CS),on=new Uint8Array(nx*ny);for(const [x,y,w,h] of rects){const i0=Math.max(0,Math.floor((x-3)/CS)),i1=Math.min(nx-1,Math.floor((x+w+3)/CS)),j0=Math.max(0,Math.floor((y-3)/CS)),j1=Math.min(ny-1,Math.floor((y+h+3)/CS));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)on[j*nx+i]=1}
    const pieces=[];for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){if(!on[j*nx+i])continue;pieces.push([i*CS,j*CS,Math.min(W,(i+1)*CS)-i*CS,Math.min(H,(j+1)*CS)-j*CS])}
    Object.assign(b,{x0,y0,x1,y1,dx,dy,c0,W,H,k,rects,pieces,pi:0,B:new DOMMatrix([ds*k,0,0,ds*k,-x0*ds*k,-y0*ds*k])});return b}
  /* make the browser rasterise now what was recorded on a canvas (Chrome / WebKit record 2D commands and paint them when the canvas is
     next used: without this the whole build would land in the frame that first shows the layer). A 1-px ImageBitmap of it = a snapshot,
     no read-back (no GPU stall); the build waits for it before drawing on that canvas again (no copy-on-write of a held snapshot). */
  function v108Flush(b,c){try{if(V108.benchSync){c.getContext('2d').getImageData(0,0,1,1);return}   /* bench: rasterise inside the step, so its time is the true cost */
    if(typeof createImageBitmap!=='function')return;b.busy=true;createImageBitmap(c,0,0,1,1).then(bm=>{try{bm.close()}catch(e){}b.busy=false},()=>{b.busy=false})}catch(e){b.busy=false}}
  /* one piece of the build a frame: (1) the torch casts into a half-resolution scratch canvas (merged among themselves: no double darkening;
     soft shadows of a big flame, so half the pixels is enough); (2…) the merge under 399's layer (its contacts + moon casts on top), at most
     V108K.tlPx device px of pieces a frame — the casts scaled up through a pixel-aligned clip (no seams), 399's pixels 1:1. Each frame's part
     is rasterised in that frame (v108Flush); V108K.budget ms caps the recording too. */
  function v108TLStep(b){if(b.out)return true;if(b.busy){V108.st.tlWait++;return false}const t0=performance.now(),over=()=>performance.now()-t0>V108K.budget;b.steps++;
    if(b.i<b.ops.length){if(!b.t){b.t=v108Mk(b.W*b.k,b.H*b.k);b.tg=b.t.getContext('2d');b.tg.imageSmoothingQuality='low'}
      while(b.i<b.ops.length){const o=b.ops[b.i++];b.tg.setTransform(b.B.multiply(o.M));b.tg.globalAlpha=Math.min(1,o.a/V108K.torchCast);b.tg.drawImage(o.c,o.x,o.y,o.w,o.h);if(over())break}
      v108Flush(b,b.t)}
    else{const m0=performance.now();if(!b.c){b.c=v108Mk(b.W,b.H);b.g=b.c.getContext('2d');V108.st.tlSize=[b.W,b.H]}const g=b.g,Ly0=b.src;let px=0;
      while(b.pi<b.pieces.length&&px<V108K.tlPx){const [x,y,w,h]=b.pieces[b.pi++];px+=w*h;
        /* the casts: only the scratch texels this piece samples (+1 round it, so the clip cuts the margin and no seam shows) */
        const T=b.t,fx=b.W/T.width,fy=b.H/T.height,u0=Math.max(0,Math.floor(x/fx)-1),v0=Math.max(0,Math.floor(y/fy)-1),u1=Math.min(T.width,Math.ceil((x+w)/fx)+1),v1=Math.min(T.height,Math.ceil((y+h)/fy)+1);
        if(u1>u0&&v1>v0){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.globalAlpha=V108K.torchCast;g.drawImage(T,u0,v0,u1-u0,v1-v0,u0*fx,v0*fy,(u1-u0)*fx,(v1-v0)*fy);g.restore()}
        const sx=x-b.dx,sy=y-b.dy,x0=Math.max(0,sx),y0=Math.max(0,sy),x1=Math.min(Ly0.c.width,sx+w),y1=Math.min(Ly0.c.height,sy+h);if(x1>x0&&y1>y0)g.drawImage(Ly0.c,x0,y0,x1-x0,y1-y0,x0+b.dx,y0+b.dy,x1-x0,y1-y0);
        if(over())break}
      b.mergeMs=(b.mergeMs||0)+performance.now()-m0;
      if(b.pi>=b.pieces.length){const ds=b.ds;b.t.width=b.t.height=0;b.t=null;b.tg=null;
        b.out={key:b.key,src:Ly0,geo:b.geo,c:b.c,rx:(b.x0-b.c0.x)/TW,ry:(b.y0-b.c0.y)/TW,rw:(b.x1-b.x0)/TW,rh:(b.y1-b.y0)/TW,ds,casts:Ly0.casts,conts:Ly0.conts,rects:b.rects};
        V108.st.tlMergeMs=b.mergeMs}
      else v108Flush(b,b.c)}
    const ms=performance.now()-t0;b.ms+=ms;V108.st.tlSteps++;V108.tlLog.push(+ms.toFixed(2));if(V108.tlLog.length>200)V108.tlLog.shift();if(ms>V108.st.tlStepMax)V108.st.tlStepMax=ms;v108Cost('tl',ms);
    if(b.out){V108.st.tl++;V108.st.tlMs=b.ms;return true}return false}
  /* the layer to draw this frame: the merged one when ready; meanwhile the last merged one with the same pieces (drawn scaled, like 399's
     own layer while the zoom eases) or 399's own */
  function v108TorchLayer(Ly0,ds){const key=Ly0.key+'|v108';const tl=V108.tl;if(tl&&tl.key===key&&tl.src===Ly0)return tl;
    const prev=tl&&tl.geo===v108Geo(key)?tl:null;const moving=(typeof zoom103Moving==='function'&&zoom103Moving())||v108Moving();
    /* 399's layer made for another size (while the zoom eased): 401 has it rebuilt once the zoom holds — for this copy too; no build meanwhile */
    let stale=false;try{const t=ctx.getTransform(),W=Ly0.rw*TW;stale=Math.abs((Ly0.ds||0)-t.a)>1e-6||(Ly0.c&&Math.abs(W*t.a-Ly0.c.width)>1.5)}catch(e){}
    if(stale&&!moving&&L106.layer===Ly0){L106.layer=null;try{requestAnimationFrame(()=>{try{if(S&&!HEADLESS)draw()}catch(e){}})}catch(e){}}
    if(moving||stale){V108.st.tlWait++;v108Settle();return prev||Ly0}
    let b=V108.tb;if(!b||b.key!==key||b.src!==Ly0)b=V108.tb=v108TLStart(Ly0,ds,key);
    if(v108TLStep(b)){V108.tl=b.out;V108.tb=null;return V108.tl}
    if(!V108.noKick)try{requestAnimationFrame(()=>{try{if(V108.tb&&S&&!HEADLESS)draw()}catch(e){}})}catch(e){}   /* the next piece next frame, even on a still board (V108.noKick: benches time every frame themselves) */
    return prev||Ly0}
  if(typeof l106DrawStatic==='function'){const base=l106DrawStatic;l106DrawStatic=function(Ly,hp){
    try{if(v108TorchOn()&&Ly&&Ly===L106.layer&&Ly.c){const M=v108TorchLayer(Ly,Ly.ds||l106DS());if(M&&M!==Ly)return base.call(this,M,hp)}}catch(e){console.error(e)}
    return base.apply(this,arguments)}}}

/* bench A/B in one page (tools/bench/v108ab.js, v108shots.js): V108.set(false) = today's look again (the baked layers re-made) */
V108.set=function(on){V108.on=!!on;try{v108Sig()}catch(e){}try{if(!HEADLESS&&typeof S!=='undefined'&&S)draw()}catch(e){}};

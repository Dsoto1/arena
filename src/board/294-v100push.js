/* =====================================================================
   294-v100push — v1.0 PUSH ANIMATION (his go 2026-10-11; tools/plans/backlog.md "PUSH ANIMATION"). DISPLAY ONLY: rules, dice, S,
   the log's text and order and the online hash are untouched — doPush (05-flow) still does all the work, unchanged.
   Before: doPush moved the shoved piece (gladiator, beast or pillar) one tile and the pusher into the freed tile at once.
   Now a doPush wrapper plays the shove FIRST, while S still holds the old tiles, then calls the real doPush:
     1 LUNGE   — the pusher leans ~0.3 tile toward the target (turned to face it: 130's face82).
     2 SLIDE   — the target slides one tile (ease-out), the pusher follows into the freed tile (the rule's own move), so when the real
                 doPush lands both pieces on their tiles nothing jumps. The spike hit (hurt / hurtNPC inside doPush) therefore shows
                 AFTER the slide.
     3 SETTLE  — a short decaying wobble of the shoved piece (pillars a little less), a dust puff where it lands, scrape marks on the
                 sand from its old tile to the new one (fade over PUSH100.scrapeMs; drawn in the 'decals' layer, under the pieces).
   Drawing: drawPlayer / drawNPC / drawPillar are wrapped (outermost) with a screen-space ctx.translate of the piece's offset, computed
   from center() of both tiles every frame — so ROT89 turns, the camera / zoom (260 Z99) and the night rim (189) just follow; team rings,
   arrows and minis are drawn inside the call and move with it. The pushed piece keeps its facing (its _fr/_fc follow it, 102 miniFace).
   Timing: PUSH100.ms at Normal (×1.5 at Slow / Step, ×0.6 with Animations Quick); the clock stops while paused and finishes at once
   when Sim-to-end ('snap') starts. FAST (his SPEED × ANIMATION pick a): the viewer's OWN gladiator's push still plays in full (push100Own: not a CPU; online = ONLM.me's seat);
   a CPU's (or another online seat's) push: no lunge, dust or scrapes — the slide is ONE paced frame (235's pace96Frame inside a paced
   move, else one animation frame) at the half-way point. OFF PATH (today's instant jump): HEADLESS / sims, Reduce motion / calm,
   Animations Off (animOn), a hidden tab, and the kill switch localStorage flavius_push100off=1.
   ONLINE: every screen replays the same push through the same doPush, so every screen plays the same animation; it only adds a wait
   inside the act, like movePlayer's own step waits.
   HOOK push100Pose(piece, info) — for a future pose sheet (tools/plans/look100 n19 "push"): called while drawing the PUSHER during an
   animation with info = {role:'pusher', k (0–1 progress), phase:'lunge'|'slide', target}; return true when it drew the piece itself
   (the plain token is then skipped). Unset (null) today: the pose is the token leaning into the shove around its base (push100Tilt) plus the lunge.
   Test: tv100p.
   ===================================================================== */
const PUSH100={on:true,ms:340,tilt:0.14,lean:0.3,leanK:0.28,wobMs:300,wobA:0.045,dustMs:620,scrapeMs:9000, /* TWEAK: Normal duration, lean (tiles), share of the time spent leaning, wobble, dust, scrape fade */
  live:new Map(),wob:new Map(),dust:[],scrapes:[],raf:0,anims:0,frames:0,trace:null,lastSlideEnd:0,lastStart:0};
try{if(localStorage.getItem('flavius_push100off')==='1')PUSH100.on=false}catch(e){}
let push100Pose=null; /* see the header: the pose-sheet hook */
/* push100Motion — false = today's instant jump */
function push100Motion(){try{if(!PUSH100.on||HEADLESS||!S||S.sim||S.snap||S.ed94)return false;if(typeof SPEED!=='undefined'&&SPEED==='snap')return false;
  if(typeof animOn==='function'&&!animOn())return false;if(typeof reduceMotion==='function'&&reduceMotion())return false;if(document.hidden)return false;return true}catch(e){return false}}
/* push100Dur — the slide's length for the current speed */
/* push100Own — the viewer's own gladiator (his SPEED × ANIMATION pick a: at Fast YOUR moves still animate, CPU pieces only glide) */
function push100Own(p){try{if(!p||p.cpu)return false;if(S&&S.onl&&typeof ONLM!=='undefined')return S.players.indexOf(p)===ONLM.me;return true}catch(e){return false}}
function push100Dur(){const sp=typeof SPEED!=='undefined'?SPEED:'normal';let k=sp==='slow'||sp==='step'?1.5:1;try{if(typeof ANIM88==='function'&&ANIM88()==='quick')k*=0.6}catch(e){}return PUSH100.ms*k}
const p100Ease=t=>1-Math.pow(1-t,3),p100InOut=t=>t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
/* push100Kick — keeps the board drawing while something of ours moves (one draw a frame; fxLoop draws when it runs) */
function push100Busy(){const now=performance.now();PUSH100.dust=PUSH100.dust.filter(d=>now-d.t0<PUSH100.dustMs);for(const [o,w] of PUSH100.wob)if(now-w.t0>=PUSH100.wobMs)PUSH100.wob.delete(o);
  return PUSH100.live.size||PUSH100.wob.size||PUSH100.dust.length}
function push100Kick(){if(PUSH100.raf||HEADLESS)return;const go=()=>{PUSH100.raf=0;try{if(typeof fxRAF==='undefined'||!fxRAF)draw()}catch(e){console.error(e)}if(push100Busy())push100Kick()};
  PUSH100.raf=requestAnimationFrame(go)}
/* push100Frame — resolves at the next animation frame (a timer stands in when rAF stalls) */
function push100Frame(){return new Promise(res=>{let d=false;const go=()=>{if(!d){d=true;res()}};requestAnimationFrame(go);setTimeout(go,100)})}
/* push100At — the screen offset {dx,dy} for a piece now, or null */
function push100At(o){const a=PUSH100.live.get(o);let dx=0,dy=0,hit=false;
  if(a){const A=center(a.r0,a.c0),B=center(a.r1,a.c1);dx=(B.x-A.x)*a.k;dy=(B.y-A.y)*a.k;hit=true}
  const w=PUSH100.wob.get(o);if(w){const el=performance.now()-w.t0;if(el<PUSH100.wobMs){const u=el/PUSH100.wobMs,amp=TW*PUSH100.wobA*w.a*(1-u);
      dx+=Math.sin(u*Math.PI*3)*amp;dy-=Math.abs(Math.sin(u*Math.PI*2))*amp*0.35;hit=true}}
  return hit?{dx,dy,a}:null}
/* push100Tilt — the push POSE on today's flat tokens/minis: the pusher leans into the shove around its base (rises while it sets and
   drives, eases back as it follows); 0 when the target sits straight up/down the screen. TWEAK: PUSH100.tilt (radians at the peak) */
function push100Tilt(o,a){const A=center(a.r0,a.c0),B=center(a.r1,a.c1),sx=Math.sign(B.x-A.x);if(!sx)return 0;
  const k=a.phase==='lunge'?Math.min(1,a.k/PUSH100.lean):Math.max(0,1-(a.k-PUSH100.lean)/(1-PUSH100.lean)*1.4);return sx*PUSH100.tilt*k}
/* push100Draw — wraps one piece's draw call in its offset */
function push100Draw(base,self,args){const o=args[0];if(!o||(!PUSH100.live.size&&!PUSH100.wob.size))return base.apply(self,args);const off=push100At(o);if(!off)return base.apply(self,args);
  if(PUSH100.trace&&off.a){const m=center(o.r,o.c);PUSH100.trace.push({role:off.a.role,k:+off.a.k.toFixed(3),x:m.x+off.dx,y:m.y+off.dy,t:performance.now()})}
  ctx.save();ctx.translate(off.dx,off.dy);
  try{if(off.a&&off.a.role==='pusher'){if(typeof push100Pose==='function'&&push100Pose(o,{role:'pusher',k:off.a.k,phase:off.a.phase,target:off.a.target}))return;
      const ang=push100Tilt(o,off.a);if(ang){const m=center(o.r,o.c);ctx.translate(m.x,m.y);ctx.rotate(ang);ctx.translate(-m.x,-m.y)}}
    return base.apply(self,args)}
  finally{ctx.restore()}}
{const base=drawPlayer;drawPlayer=function(){return push100Draw(base,this,arguments)}}
{const base=drawNPC;drawNPC=function(){return push100Draw(base,this,arguments)}}
{const base=drawPillar;drawPillar=function(){return push100Draw(base,this,arguments)}}

/* the dust puff (fx layer, like 138's dust84) */
function push100Puff(r,c,dr,dc,big,own){if(!push100Motion()||(typeof SPEED!=='undefined'&&SPEED==='fast'&&!own))return;const parts=Array.from({length:big?9:6},()=>({a:Math.random()*Math.PI*2,d:0.2+Math.random()*0.22,s:0.1+Math.random()*0.09,h:0.04+Math.random()*0.1}));
  PUSH100.dust.push({r,c,dr,dc,t0:performance.now(),parts,S});push100Kick()}
function push100DrawDust(){if(!PUSH100.dust.length||typeof ctx==='undefined')return;const now=performance.now();
  for(const D of PUSH100.dust){if(D.S!==S)continue;const k=(now-D.t0)/PUSH100.dustMs;if(k<0||k>=1)continue;const m=center(D.r,D.c),e=1-Math.pow(1-k,2);
    ctx.save();ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgb(176,146,104)';
    for(const p of D.parts){const d=p.d+e*0.25,x=m.x+Math.cos(p.a)*TW*d*0.6,y=m.y+Math.sin(p.a)*TW*d*0.3-TW*p.h*e,rad=TW*p.s*(0.7+e);
      const al=0.3*(k<0.2?k/0.2:1-(k-0.2)/0.8);if(al<=0)continue;ctx.globalAlpha=al*0.45;ctx.beginPath();ctx.ellipse(x,y,rad,rad*0.55,0,0,Math.PI*2);ctx.fill()}
    ctx.restore()}}
{const base=drawFX;drawFX=function(){try{push100DrawDust()}catch(e){}return base.apply(this,arguments)}}
/* the scrape marks: drag lines on the sand from the old tile to the new one (decals layer, under the pieces) */
function push100DrawScrapes(){if(!PUSH100.scrapes.length)return;const now=performance.now();PUSH100.scrapes=PUSH100.scrapes.filter(s=>s.S===S&&now-s.t0<PUSH100.scrapeMs);
  for(const s of PUSH100.scrapes){const u=(now-s.t0)/PUSH100.scrapeMs,al=0.34*(u<0.6?1:1-(u-0.6)/0.4);if(al<=0)continue;const A=center(s.r0,s.c0),B=center(s.r1,s.c1);
    const vx=B.x-A.x,vy=B.y-A.y,L=Math.hypot(vx,vy)||1,nx=-vy/L,ny=vx/L;ctx.save();ctx.globalAlpha=al;ctx.lineCap='round';
    const lines=s.pl?[-0.12,-0.04,0.05,0.13]:[-0.07,0.07];
    for(let i=0;i<lines.length;i++){const o=lines[i]*TW*0.6,j=s.j[i]||0;const x0=A.x+vx*0.18+nx*o,y0=A.y+vy*0.18+ny*o*0.5,x1=A.x+vx*(0.86+j*0.06)+nx*o,y1=A.y+vy*(0.86+j*0.06)+ny*o*0.5;
      ctx.strokeStyle='rgba(78,52,28,.85)';ctx.lineWidth=Math.max(1,TW*0.022);ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
      ctx.strokeStyle='rgba(236,214,170,.5)';ctx.lineWidth=Math.max(0.6,TW*0.01);ctx.beginPath();ctx.moveTo(x0+nx,y0+ny+1);ctx.lineTo(x1+nx,y1+ny+1);ctx.stroke()}
    ctx.restore()}}
{const base=drawLayers93;drawLayers93=function(layers){
  if(Array.isArray(layers)&&PUSH100.scrapes.length)layers=layers.map(l=>l&&l[0]==='decals'?['decals',()=>{const r=l[1]();try{push100DrawScrapes()}catch(e){console.error(e)}return r}]:l);
  return base.call(this,layers)}}

/* ---------------- the shove ---------------- */
/* push100Play — the animation, run BEFORE the real doPush (S still holds the old tiles) */
async function push100Play(player,target){const piece=target.pl||target.u;if(!piece||!target.to)return;
  const r0=target.r,c0=target.c,[r1,c1]=target.to,pr=player.r,pc=player.c;
  try{if(typeof face82==='function')face82(player,{r:r0,c:c0})}catch(e){}
  const P={role:'pusher',r0:pr,c0:pc,r1:r0,c1:c0,k:0,phase:'lunge',target:piece},T={role:'pushed',r0,c0,r1,c1,k:0,phase:'slide'};
  PUSH100.anims++;PUSH100.lastStart=performance.now();
  const own=push100Own(player);P.own=own;
  if(SPEED==='fast'&&!own){ /* one paced frame at the half-way point: no lunge, no dust, no scrapes */
    P.k=T.k=0.5;PUSH100.live.set(player,P);PUSH100.live.set(piece,T);
    try{if(typeof PACE96!=='undefined'&&PACE96.depth&&typeof pace96Frame==='function'){PACE96.dirty=1;await pace96Frame()}else{draw();await push100Frame()}}
    finally{PUSH100.frames++;PUSH100.live.delete(player);PUSH100.live.delete(piece);PUSH100.lastSlideEnd=performance.now()}
    return}
  PUSH100.live.set(player,P);PUSH100.live.set(piece,T);
  let done=0,last=performance.now();const f1=PUSH100.frames+1;const D=push100Dur(),LK=PUSH100.leanK;
  try{while(done<1){await push100Frame();PUSH100.frames++;const now=performance.now(),sp=typeof SPEED!=='undefined'?SPEED:'normal';
      if(sp==='snap'||!push100Motion()){done=1}else if(PUSH100.frames===f1){/* the first frame carries the set-up's paint: the clock starts here */}else if(sp==='fast'&&!own){done=Math.max(done,0.999)+0.001}else if(sp!=='pause'){done=Math.min(1,done+(now-last)/D)}last=now;
      if(done<LK){const u=p100InOut(done/LK);P.k=PUSH100.lean*u;P.phase='lunge';T.k=0}
      else{const u=(done-LK)/(1-LK);T.k=p100Ease(u);P.phase='slide';P.k=PUSH100.lean+(1-PUSH100.lean)*p100InOut(u)}
      if(!T.puff&&T.k>0.8){T.puff=1;push100Puff(r1,c1,r1-r0,c1-c0,!!target.pl,own)}
      try{if(typeof fxRAF==='undefined'||!fxRAF)draw()}catch(e){console.error(e)}}}
  finally{PUSH100.live.delete(player);PUSH100.live.delete(piece);PUSH100.lastSlideEnd=performance.now()}
  /* settle: the wobble and the marks outlive the move (display only, nothing waits for them) */
  PUSH100.wob.set(piece,{t0:performance.now(),a:target.pl?0.6:1});PUSH100.scrapes.push({r0,c0,r1,c1,pl:!!target.pl,t0:performance.now(),S,j:[Math.random(),Math.random(),Math.random(),Math.random()].map(v=>v-0.5)});
  if(PUSH100.scrapes.length>24)PUSH100.scrapes.shift();push100Kick()}
{const base=doPush;doPush=async function(player,target){
  if(!push100Motion()||!player||!target||!target.to||!(target.pl||target.u))return base.apply(this,arguments);
  const piece=target.pl||target.u;const keepFace=piece._fr!=null;
  try{await push100Play(player,target)}catch(e){console.error(e)}
  /* the real push: same arguments, same order — it lands both pieces where the animation left them */
  const r=await base.apply(this,arguments);
  try{if(keepFace&&piece.r!=null){piece._fr=piece.r;piece._fc=piece.c}}catch(e){} /* the shoved piece keeps facing where it faced */
  return r}}

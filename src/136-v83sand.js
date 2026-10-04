/* =====================================================================
   136-V83SAND · v0.83 (Virgilante) — 1. the clay pots on the pillars in 3D: a lit round belly, shoulder, neck ring, an open lip
   you can see into, two small handles, painted black bands; the Golden Eagle's gold pot keeps its E.
   2. a very subtle sand grain on the arena tiles (fine dark + light specks, a soft shade toward each tile's lower edges) for
   depth — never on Naumachia water/ships. SAND83 = the strengths.
   ===================================================================== */
const SAND83={grain:0.16,shade:0.07}; /* TWEAK: grain and edge-shade opacity (0 turns them off) */
/* ---- 1. pots ---- */
drawPot=function(x,y,s,eagle){
  const potC=THEME.pot||'#b5582f';
  const body=eagle?'#d9b44a':potC,dark=eagle?'#7a5a12':shade(potC,-0.45),lite=eagle?'#fbe7a0':shade(potC,0.42),ink='rgba(28,10,4,.85)';
  ctx.save();
  /* shadow */
  ctx.fillStyle='rgba(0,0,0,.28)';ell(x+s*0.04,y+1,s*0.4,s*0.13);ctx.fill();
  /* belly: an egg, lit from the upper left */
  const bx=x,by=y-s*0.36,rx=s*0.36,ry=s*0.38;
  const g=ctx.createRadialGradient(bx-rx*0.38,by-ry*0.42,rx*0.08,bx,by,rx*1.15);
  g.addColorStop(0,lite);g.addColorStop(.45,body);g.addColorStop(1,dark);
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-s*0.12,y);
  ctx.bezierCurveTo(x-s*0.5,y-s*0.06,x-s*0.5,y-s*0.6,x-s*0.15,y-s*0.7);ctx.lineTo(x+s*0.15,y-s*0.7);
  ctx.bezierCurveTo(x+s*0.5,y-s*0.6,x+s*0.5,y-s*0.06,x+s*0.12,y);ctx.closePath();ctx.fill();
  ctx.strokeStyle=ink;ctx.lineWidth=Math.max(0.8,s*0.03);ctx.stroke();
  /* painted bands round the belly (follow its curve) */
  if(!eagle){ctx.strokeStyle='rgba(20,8,4,.78)';
    for(const [dy,w] of [[-0.46,s*0.05],[-0.3,s*0.025]]){ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(x,y+dy*s,s*0.4*(dy<-0.4?0.92:1),s*0.07,0,0.08*Math.PI,0.92*Math.PI);ctx.stroke()}
    /* a row of little dots between the bands */
    ctx.fillStyle='rgba(20,8,4,.7)';for(let i=-3;i<=3;i++){const a=i*0.36;ell(x+Math.sin(a)*s*0.33,y-s*0.38+Math.cos(a)*s*0.035,s*0.018,s*0.018);ctx.fill()}}
  /* handles */
  ctx.strokeStyle=dark;ctx.lineWidth=Math.max(1,s*0.05);
  for(const sd of [-1,1]){ctx.beginPath();ctx.moveTo(x+sd*s*0.13,y-s*0.86);ctx.quadraticCurveTo(x+sd*s*0.3,y-s*0.84,x+sd*s*0.25,y-s*0.66);ctx.stroke()}
  /* neck */
  const ng=ctx.createLinearGradient(x-s*0.12,0,x+s*0.12,0);ng.addColorStop(0,lite);ng.addColorStop(.6,body);ng.addColorStop(1,dark);
  ctx.fillStyle=ng;ctx.beginPath();ctx.moveTo(x-s*0.15,y-s*0.69);ctx.lineTo(x-s*0.11,y-s*0.9);ctx.lineTo(x+s*0.11,y-s*0.9);ctx.lineTo(x+s*0.15,y-s*0.69);ctx.closePath();ctx.fill();
  ctx.strokeStyle=ink;ctx.lineWidth=Math.max(0.7,s*0.025);ctx.stroke();
  ctx.strokeStyle=dark;ctx.lineWidth=Math.max(0.8,s*0.035);ctx.beginPath();ctx.ellipse(x,y-s*0.74,s*0.14,s*0.03,0,0,Math.PI);ctx.stroke();
  /* lip: a ring you can see into */
  ctx.fillStyle=lite;ell(x,y-s*0.91,s*0.17,s*0.058);ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=Math.max(0.7,s*0.025);ctx.stroke();
  ctx.fillStyle=eagle?'#3a2808':'#2a0e06';ell(x,y-s*0.91,s*0.11,s*0.034);ctx.fill();
  if(eagle){ctx.fillStyle='#5c3f0c';ctx.font=`700 ${Math.round(s*0.3)}px Marcellus SC, serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('E',x,y-s*0.38)}
  ctx.restore()};
/* ---- 2. sand grain on the tiles ---- */
let SAND83_PAT=null;
function sandPat83(){if(SAND83_PAT)return SAND83_PAT;const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');
  let h=83;const rnd=()=>((h=(h*1103515245+12345)&0x7fffffff)/0x7fffffff);   /* cosmetic only: never the dice RNG */
  for(let i=0;i<1400;i++){const x=rnd()*160,y=rnd()*160,r=0.35+rnd()*0.9,d=rnd()<0.62;g.fillStyle=d?`rgba(90,60,30,${0.25+rnd()*0.45})`:`rgba(255,240,205,${0.25+rnd()*0.5})`;g.beginPath();g.ellipse(x,y,r,r*0.7,0,0,Math.PI*2);g.fill()}
  for(let i=0;i<40;i++){const x=rnd()*160,y=rnd()*160;g.fillStyle=`rgba(110,78,44,${0.18+rnd()*0.2})`;g.beginPath();g.ellipse(x,y,1.2+rnd()*1.4,0.8+rnd(),rnd()*3,0,Math.PI*2);g.fill()}
  SAND83_PAT=ctx.createPattern(c,'repeat');return SAND83_PAT}
{const base=typeof drawShipTile==='function'?drawShipTile:null;drawShipTile=function(r,c){if(base)base.apply(this,arguments);
  try{if(!SAND83.grain&&!SAND83.shade)return;if(typeof isNaum==='function'&&isNaum()&&!(S.drained||S.drainLine!=null&&r+c<=S.drainLine))return;
    ctx.save();tilePath(r,c);ctx.clip();
    if(SAND83.grain){ctx.globalAlpha=SAND83.grain;ctx.fillStyle=sandPat83();const m=center(r,c);ctx.fillRect(m.x-TW,m.y-TH,TW*2,TH*2)}
    if(SAND83.shade){const m=center(r,c);const g=ctx.createLinearGradient(m.x,m.y-TH/2,m.x,m.y+TH/2);g.addColorStop(0,'rgba(255,245,220,1)');g.addColorStop(.45,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(60,36,14,1)');
      ctx.globalAlpha=SAND83.shade;ctx.fillStyle=g;ctx.fillRect(m.x-TW/2,m.y-TH/2,TW,TH)}
    ctx.restore();tilePath(r,c)}catch(e){}}}

/* 217-v92laurel — v0.92 SHADED LAURELS AND FLOWERS (his note 2026-10-07: "laurels look like they need shading now too", to sit with the
   shaded arena). The sprigs and flowers the crowd throws (33 drawTosses) and the ones thrown at Commodus (08 mmOverlay) were flat ovals; now:
   a laurel sprig = a curved brown stem, six leaves with a light-to-dark gradient, a midrib and a thin ink edge, two berries; a flower = five
   petals shaded from a light middle to a darker rim around a golden centre. Each sprite is drawn ONCE per kind/colour/size into a small canvas
   (TOSS92 cache) and blitted rotated — no per-frame path work. Arena tosses also cast a soft shadow on the sand that firms up as they land.
   Display only (Math.random never; the toss positions come from 33 as before). */
const TOSS92={};
function toss92Shade(hex,f){try{const n=parseInt(String(hex).replace('#',''),16);let r=n>>16&255,g=n>>8&255,b=n&255;
  const m=v=>Math.max(0,Math.min(255,Math.round(f>0?v+(255-v)*f:v*(1+f))));return `rgb(${m(r)},${m(g)},${m(b)})`}catch(e){return hex}}
function toss92Sprite(kind,col,px){px=Math.max(12,Math.round(px));const key=kind+'|'+(col||'')+'|'+px;if(TOSS92[key])return TOSS92[key];
  const c=document.createElement('canvas');c.width=c.height=px*2;const g=c.getContext('2d');g.translate(px,px);const u=px/16;g.lineJoin='round';
  if(kind==='laurel'){
    /* the stem: a gentle curve from lower left to upper right */
    g.strokeStyle='#5a3a1c';g.lineWidth=1.1*u;g.beginPath();g.moveTo(-12*u,5*u);g.quadraticCurveTo(-1*u,1*u,12*u,-6*u);g.stroke();
    const leaf=(t,side)=>{const x=-12*u+24*u*t,y=5*u-11*u*t+Math.sin(t*Math.PI)*-1.5*u;g.save();g.translate(x,y);g.rotate(-0.42+side*0.9);
      const L=6.2*u,W=2.3*u;const gr=g.createLinearGradient(0,-W,0,W);gr.addColorStop(0,'#9cc96a');gr.addColorStop(.5,'#5c9440');gr.addColorStop(1,'#2c5420');
      g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*0.45,-W*1.25,L,0);g.quadraticCurveTo(L*0.45,W*1.25,0,0);g.fill();
      g.strokeStyle='rgba(20,34,12,.75)';g.lineWidth=0.55*u;g.stroke();
      g.strokeStyle='rgba(225,240,190,.55)';g.lineWidth=0.4*u;g.beginPath();g.moveTo(0.6*u,0);g.lineTo(L*0.85,0);g.stroke();g.restore()};
    for(let i=0;i<6;i++)leaf(0.12+i*0.15,i%2?1:-1);
    for(const [bx,by] of [[-3*u,-0.6*u],[4*u,-3.6*u]]){const rg=g.createRadialGradient(bx-0.4*u,by-0.4*u,0.1*u,bx,by,1.3*u);rg.addColorStop(0,'#e98a6a');rg.addColorStop(1,'#7a2418');
      g.fillStyle=rg;g.beginPath();g.arc(bx,by,1.1*u,0,Math.PI*2);g.fill()}}
  else{const base=col||'#d8506a';
    for(let i=0;i<5;i++){const a=i*1.2566-Math.PI/2;const px2=Math.cos(a)*3.6*u,py2=Math.sin(a)*3.6*u;const rg=g.createRadialGradient(px2*0.4,py2*0.4,0.3*u,px2,py2,3.4*u);
      rg.addColorStop(0,toss92Shade(base,0.45));rg.addColorStop(.7,base);rg.addColorStop(1,toss92Shade(base,-0.35));g.fillStyle=rg;g.beginPath();g.ellipse(px2,py2,3.1*u,2.6*u,a,0,Math.PI*2);g.fill();
      g.strokeStyle=toss92Shade(base,-0.55);g.globalAlpha=.6;g.lineWidth=0.45*u;g.stroke();g.globalAlpha=1}
    const cg=g.createRadialGradient(-0.5*u,-0.5*u,0.2*u,0,0,2*u);cg.addColorStop(0,'#fff0a0');cg.addColorStop(.6,'#e8b830');cg.addColorStop(1,'#8a6214');g.fillStyle=cg;g.beginPath();g.arc(0,0,1.8*u,0,Math.PI*2);g.fill()}
  return (TOSS92[key]=c)}
/* toss92Draw — one toss at the current transform's origin (the caller translates/rotates); s = scale in sprite px per TW/34 */
function toss92Draw(g,q,size){const sp=toss92Sprite(q.kind==='laurel'?'laurel':'flower',q.kind==='laurel'?null:q.col,size*(window.devicePixelRatio||1));const d=size;
  g.drawImage(sp,-d,-d,d*2,d*2)}
drawTosses=function(){if(!S||!S.tosses||!S.tosses.length)return;const now=performance.now();const size=TW*0.36;
  for(const q of S.tosses){if(now<q.t0)continue;const k=Math.min(1,(now-q.t0)/q.dur);const x=q.sx+(q.tx-q.sx)*k,y=q.sy+(q.ty-q.sy)*k-Math.sin(k*Math.PI)*TW*1.6;
    /* the shadow on the sand under the landing point, firmer as it comes down */
    if(k>0.35){ctx.save();ctx.globalAlpha=Math.min(1,(k-0.35)/0.65)*0.35;ctx.fillStyle='#2a1a0c';ctx.beginPath();ctx.ellipse(q.sx+(q.tx-q.sx)*k,q.sy+(q.ty-q.sy)*k+TW*0.04,size*0.8,size*0.3,0,0,Math.PI*2);ctx.fill();ctx.restore()}
    ctx.save();ctx.translate(x,y);ctx.rotate(q.rot+(k<1?k*9:0));toss92Draw(ctx,q,size);ctx.restore()}};

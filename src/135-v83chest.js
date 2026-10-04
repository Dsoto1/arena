/* =====================================================================
   135-V83CHEST · v0.83 — the Arena Chest on the sand looks like the chest on his token (tools/art/medallions/chest.png):
   red wooden body with plank lines, a domed half-round lid, dark iron bands with rivets wrapping body and lid, the gold
   engraved strap over the middle, a bronze lock plate with a ring keyhole on the front. Drawn in the board's own iso
   perspective (one tile = TW): x runs down-right, y down-left, z up. 07-ui's draw calls drawChest83(m) for the chest lying
   on the sand (the carried chest keeps its old look).
   ===================================================================== */
const CHEST83={wood:'#8e2a1a',woodLit:'#b7432a',woodDark:'#5e190f',plank:'rgba(40,8,4,.55)',iron:'#3a3632',ironLit:'#6d6760',ironDark:'#1e1b18',
  gold:'#d6a640',goldLit:'#f2d27a',goldDark:'#8a6420',bronze:'#b07a38',ink:'#0d0a07'}; /* TWEAK: the chest's palette */
function drawChest83(m){if(typeof ctx==='undefined')return;const C=CHEST83;
  const ex=[TW/2,TH/2],ey=[-TW/2,TH/2];
  const L=0.56,Wd=0.36,Hb=TW*0.2,R=Wd/2;             /* body length/width in tiles, body height px, lid radius (tiles) */
  const zR=R*TW*0.62;                                  /* the lid's height in px (a squashed half-round) */
  const P=(x,y,z)=>[m.x+x*ex[0]+y*ey[0],m.y+x*ex[1]+y*ey[1]-z];
  const poly=(pts,fill,stroke,lw)=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||Math.max(1,TW*0.012);ctx.stroke()}};
  const x0=-L/2,x1=L/2,y0=-Wd/2,y1=Wd/2;
  ctx.save();ctx.lineJoin='round';
  /* shadow */
  ctx.fillStyle='rgba(20,12,6,.32)';ell(m.x+TW*0.03,m.y+TH*0.06,TW*0.4,TH*0.26);ctx.fill();
  /* body: the two faces we see (+y front-left, +x front-right) */
  const fL=[P(x0,y1,0),P(x1,y1,0),P(x1,y1,Hb),P(x0,y1,Hb)],fR=[P(x1,y1,0),P(x1,y0,0),P(x1,y0,Hb),P(x1,y1,Hb)];
  poly(fL,C.wood);poly(fR,C.woodDark);
  /* planks */
  ctx.strokeStyle=C.plank;ctx.lineWidth=Math.max(0.7,TW*0.006);
  for(const f of [0.33,0.66]){let a=P(x0,y1,Hb*f),b=P(x1,y1,Hb*f);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();a=P(x1,y1,Hb*f);b=P(x1,y0,Hb*f);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
  /* lid: a half-round along x, drawn back to front in strips, light from the upper left */
  const N=14,pt=(x,t)=>P(x,R*Math.cos(t)*(1)+0,Hb+zR*Math.sin(t));
  for(let i=N-1;i>=0;i--){const t0=Math.PI*i/N,t1=Math.PI*(i+1)/N,tm=(t0+t1)/2;
    const lit=0.5+0.5*Math.sin(tm+0.35);const col=i>N*0.62?C.woodDark:lit>0.8?C.woodLit:C.wood;
    poly([pt(x0,t0),pt(x1,t0),pt(x1,t1),pt(x0,t1)],col)}
  /* the lid's end (a half-ellipse) on the +x side */
  ctx.beginPath();for(let i=0;i<=N;i++){const p=pt(x1,Math.PI*i/N);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])}ctx.closePath();ctx.fillStyle=C.woodDark;ctx.fill();
  /* iron bands at both ends and gold strap in the middle, wrapping body + lid */
  const band=(xa,xb,c,cl,cd)=>{poly([P(xa,y1,0),P(xb,y1,0),P(xb,y1,Hb),P(xa,y1,Hb)],c);
    for(let i=N-1;i>=0;i--){const t0=Math.PI*i/N,t1=Math.PI*(i+1)/N;poly([pt(xa,t0),pt(xb,t0),pt(xb,t1),pt(xa,t1)],i>N*0.62?cd:i<N*0.3?cl:c)}};
  const bw=L*0.09;
  band(x0,x0+bw,C.iron,C.ironLit,C.ironDark);band(x1-bw,x1,C.iron,C.ironLit,C.ironDark);
  band(-L*0.09,L*0.09,C.gold,C.goldLit,C.goldDark);
  /* iron edging on the +x end */
  poly([P(x1,y1,0),P(x1,y0,0),P(x1,y0,Hb*0.16),P(x1,y1,Hb*0.16)],C.ironDark);
  poly([P(x1,y1,Hb*0.84),P(x1,y0,Hb*0.84),P(x1,y0,Hb),P(x1,y1,Hb)],C.ironDark);
  /* engraving on the gold strap */
  ctx.strokeStyle='rgba(90,60,14,.85)';ctx.lineWidth=Math.max(0.6,TW*0.005);
  for(let i=2;i<N-4;i+=2){const a=pt(-L*0.04,Math.PI*i/N),b=pt(L*0.04,Math.PI*(i+1)/N);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}
  /* rivets along the bands */
  ctx.fillStyle=C.ironLit;for(const xb of [x0+bw/2,x1-bw/2])for(const f of [0.2,0.5,0.8]){const p=P(xb,y1,Hb*f);ell(p[0],p[1],TW*0.012,TW*0.009);ctx.fill()}
  /* lock plate with a ring keyhole */
  const lp=P(0,y1,Hb*0.62);ctx.fillStyle=C.bronze;ctx.beginPath();ctx.moveTo(lp[0]-TW*0.045,lp[1]-TW*0.05);ctx.lineTo(lp[0]+TW*0.045,lp[1]-TW*0.035);
  ctx.lineTo(lp[0]+TW*0.04,lp[1]+TW*0.04);ctx.quadraticCurveTo(lp[0],lp[1]+TW*0.075,lp[0]-TW*0.045,lp[1]+TW*0.02);ctx.closePath();ctx.fill();ctx.strokeStyle=C.ink;ctx.lineWidth=Math.max(0.8,TW*0.008);ctx.stroke();
  ctx.strokeStyle=C.goldLit;ctx.lineWidth=Math.max(1,TW*0.012);ell(lp[0],lp[1]+TW*0.012,TW*0.022,TW*0.024);ctx.stroke();
  ctx.fillStyle=C.ink;ell(lp[0],lp[1]+TW*0.006,TW*0.007,TW*0.008);ctx.fill();ctx.fillRect(lp[0]-TW*0.003,lp[1]+TW*0.008,TW*0.006,TW*0.018);
  /* ink outline round the whole chest */
  ctx.strokeStyle=C.ink;ctx.lineWidth=Math.max(1,TW*0.014);
  ctx.beginPath();let a=P(x0,y1,0);ctx.moveTo(a[0],a[1]);for(const p of [P(x1,y1,0),P(x1,y0,0),P(x1,y0,Hb)])ctx.lineTo(p[0],p[1]);
  for(let i=0;i<=N;i++){const p=pt(x1,Math.PI*i/N);ctx.lineTo(p[0],p[1])}
  for(let i=N;i>=0;i--){const p=pt(x0,Math.PI*i/N);if(Math.sin(Math.PI*i/N)>0.25||i===0)ctx.lineTo(p[0],p[1])}
  ctx.lineTo(...P(x0,y1,Hb));ctx.closePath();ctx.stroke();
  ctx.lineWidth=Math.max(0.8,TW*0.008);ctx.beginPath();a=P(x0,y1,Hb);ctx.moveTo(a[0],a[1]);a=P(x1,y1,Hb);ctx.lineTo(a[0],a[1]);a=P(x1,y1,0);ctx.lineTo(a[0],a[1]);ctx.stroke();
  ctx.restore()}
/* the carried chest isn't drawn on the carrier's figure any more (07-ui checks CHEST_INV83): its token sits in their inventory
   until they open it or drop it — "Hand, offerings & objectives" on the fighter board; a beast holding it shows it on its Field row */
const CHEST_INV83=true;
{const base=boardHTML;boardHTML=function(player){let h=base.apply(this,arguments);try{if(player&&player.carrying&&S&&S.chest&&h.indexOf('data-chest83')<0){
  const n=(S.chest.weapons||[]).length;
  const row=`<div class="item chest83" data-chest83="1"><span>${typeof rtokHTML==='function'?rtokHTML('chest',30,'The Arena Chest'):'🧰'}<span><b>The Arena Chest</b><em>Locked · ${n} inside · open it with an Arena Key · −1 movement while held</em></span></span></div>`;
  if(h.indexOf('<div class="items">')>=0)h=h.replace('<div class="items">','<div class="items">'+row);
  else{const at=h.lastIndexOf('</div>');h=h.slice(0,at)+`<div class="sect">Hand, offerings & objectives</div><div class="items">${row}</div>`+h.slice(at)}}}catch(e){}return h}}
{const st=document.createElement('style');st.textContent='.item.chest83{border:1px solid rgba(214,171,76,.55);background:linear-gradient(90deg,rgba(214,171,76,.14),transparent)}.item.chest83 .rtok{margin-right:8px}';document.head.appendChild(st)}

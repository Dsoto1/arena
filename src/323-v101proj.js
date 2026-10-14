/* =====================================================================
   323-v101proj — v1.01 (G13, his note "arrows and other projectiles may need a visual uplift to blend in with the new animations and 3D
   tokens"). DISPLAY ONLY: rules, dice (RNG), S, the log and the online hash are untouched; 55-anim's projectile() queue, its timing and its
   onEnd callbacks are kept — only the PAINT changes.
   • MISSILES (55 drawMissile replaced): lit like the 3D figures (light from the upper left, as 192/276): shafts drawn as a dark body + a
     light top edge, metal heads as a lit leaf with a dark rim, fletching as filled vanes (bolts: short dark-red vanes), stones as a
     shaded sphere, knives / axes with a lit blade. Lodged and dropped pieces (55's STUCK list) use the same paint.
   • IN FLIGHT (55 drawProjectiles replaced, same lifecycle): a soft GROUND SHADOW runs under the missile (it shrinks and fades with the
     height of the arc), a faint motion trail follows arrows / bolts / knives, the arc of arrows and bolts is a little higher (V101P.arc),
     and the missile swells a touch at the top of its arc (closer to the eye).
   • NETS (312's Rete): the thrown net gets the same ground shadow while it flies (a wrapper on 312's bst100NetsPaint, before its paint).
   Kill switch localStorage flavius_proj101off=1 → 55's / 312's drawing exactly. Test tv101f; shots tools/plans/v101/anim/.
   ===================================================================== */
const V101P={on:true,arc:{arrow:0.17,bolt:0.12,knife:0.14,spear:0.3,axe:0.3},stats:{shadows:0,trails:0,missiles:0,netShadows:0}}; /* TWEAK: arc heights (tiles) per kind */
try{if(localStorage.getItem('flavius_proj101off')==='1')V101P.on=false}catch(e){}
if(V101P.on){
/* the lit paint of one missile at (x, y), pointing at ang, scale sc (55's signature) */
const _dm=drawMissile;
drawMissile=function(kind,x,y,ang,sc=1){if(typeof ctx==='undefined')return _dm.apply(this,arguments);V101P.stats.missiles++;
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);const L=TW*0.5*sc,u=TW*sc;ctx.lineCap='round';ctx.lineJoin='round';
  /* which side is "up" on screen after the turn: the light edge goes there */
  const up=Math.cos(ang)>=0?-1:1;
  if(kind==='stone'){const r=u*0.075;const g=ctx.createRadialGradient(-r*0.35,-r*0.4,r*0.1,0,0,r);g.addColorStop(0,'#d6d0c4');g.addColorStop(0.55,'#8f8a80');g.addColorStop(1,'#3e3a34');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(30,26,22,.8)';ctx.lineWidth=Math.max(0.8,u*0.01);ctx.stroke()}
  else if(kind==='knife'){ctx.strokeStyle='#3a2414';ctx.lineWidth=u*0.04;ctx.beginPath();ctx.moveTo(-L*0.36,0);ctx.lineTo(-L*0.1,0);ctx.stroke();
    ctx.strokeStyle='#8a6038';ctx.lineWidth=u*0.014;ctx.beginPath();ctx.moveTo(-L*0.34,up*u*0.008);ctx.lineTo(-L*0.12,up*u*0.008);ctx.stroke();
    v101Blade(-L*0.1,L*0.26,u*0.03,up)}
  else if(kind==='axe'){v101Shaft(-L*0.42,L*0.3,u*0.036,'#4e321a','#a07448',up);
    const g=ctx.createLinearGradient(0,-u*0.11,0,u*0.11);g.addColorStop(0,up<0?'#eef1f4':'#7d848c');g.addColorStop(1,up<0?'#7d848c':'#eef1f4');
    ctx.fillStyle=g;ctx.strokeStyle='#2f3338';ctx.lineWidth=Math.max(0.8,u*0.008);ctx.beginPath();ctx.moveTo(L*0.16,-u*0.105);ctx.quadraticCurveTo(L*0.44,0,L*0.16,u*0.105);ctx.lineTo(L*0.1,u*0.02);ctx.lineTo(L*0.1,-u*0.02);ctx.closePath();ctx.fill();ctx.stroke()}
  else{const spear=kind==='spear',bolt=kind==='bolt';const len=spear?L*1.3:bolt?L*0.6:L*0.8;
    v101Shaft(-len,0,spear?u*0.042:u*0.026,bolt?'#2c1d10':'#5a3a1c',bolt?'#6a4a2c':'#b58a58',up);
    v101Blade(0,u*(spear?0.14:0.095),u*(spear?0.045:0.036),up);
    if(kind==='arrow'||bolt){const vl=u*(bolt?0.06:0.085),vw=u*(bolt?0.04:0.05);const col=bolt?'#7a2018':'#ece3cc',dk=bolt?'#3a0e0a':'#8a7e66';
      for(const s of [-1,1]){ctx.fillStyle=s===up?col:dk;ctx.strokeStyle='rgba(20,14,8,.65)';ctx.lineWidth=Math.max(0.6,u*0.006);
        ctx.beginPath();ctx.moveTo(-len+u*0.012,0);ctx.lineTo(-len-vl*0.2,s*vw);ctx.lineTo(-len-vl,s*vw*0.85);ctx.lineTo(-len-vl*0.7,0);ctx.closePath();ctx.fill();ctx.stroke()}}}
  ctx.restore()};
/* a round shaft: dark body, then a light edge on the lit side */
function v101Shaft(x0,x1,w,dark,light,up){ctx.strokeStyle='rgba(16,10,6,.85)';ctx.lineWidth=w*1.35;ctx.beginPath();ctx.moveTo(x0,0);ctx.lineTo(x1,0);ctx.stroke();
  ctx.strokeStyle=dark;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,0);ctx.lineTo(x1,0);ctx.stroke();
  ctx.strokeStyle=light;ctx.lineWidth=Math.max(0.7,w*0.38);ctx.beginPath();ctx.moveTo(x0,up*w*0.22);ctx.lineTo(x1,up*w*0.22);ctx.stroke()}
/* a lit metal leaf from x0 to the tip x1, half width hw */
function v101Blade(x0,x1,hw,up){const g=ctx.createLinearGradient(0,-hw,0,hw);g.addColorStop(0,up<0?'#f4f6f8':'#6e757d');g.addColorStop(0.5,'#c3c9d0');g.addColorStop(1,up<0?'#6e757d':'#f4f6f8');
  ctx.fillStyle=g;ctx.strokeStyle='#2b2f34';ctx.lineWidth=Math.max(0.7,hw*0.16);ctx.beginPath();ctx.moveTo(x0,-hw*0.55);ctx.quadraticCurveTo((x0+x1)*0.5,-hw*1.05,x1,0);ctx.quadraticCurveTo((x0+x1)*0.5,hw*1.05,x0,hw*0.55);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=Math.max(0.6,hw*0.12);ctx.beginPath();ctx.moveTo(x0+(x1-x0)*0.15,up*hw*0.25);ctx.lineTo(x1-(x1-x0)*0.12,up*hw*0.08);ctx.stroke()}
/* a soft ground shadow at (x, y) for something h tiles up */
function v101Shadow(x,y,h,w){const k=Math.max(0.35,1-h*0.45);ctx.save();ctx.globalAlpha=0.4*k;ctx.fillStyle='#120c06';ctx.beginPath();ctx.ellipse(x,y,TW*w*k,TW*w*0.42*k,0,0,Math.PI*2);ctx.fill();ctx.restore();V101P.stats.shadows++}
/* in flight: the same path as 55 (straight line + a sine arc), with a ground shadow + a trail; the STUCK part is 55's */
const _dp=drawProjectiles;
drawProjectiles=function(){if(typeof ctx==='undefined')return _dp.apply(this,arguments);const now=performance.now();
  for(let i=PROJ.length-1;i>=0;i--){const P=PROJ[i];const k=(now-P.t0)/P.dur;const a=typeof P.from==='function'?P.from():P.from,b=typeof P.to==='function'?P.to():P.to;if(!a||!b){PROJ.splice(i,1);continue}
    if(k>=1){PROJ.splice(i,1);try{P.onEnd&&P.onEnd()}catch(e){}continue}
    const arc=P.arc;const pos=q=>({x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q-Math.sin(Math.PI*q)*arc*TW});const p=pos(k);
    const dx=(b.x-a.x),dy=(b.y-a.y)-Math.cos(Math.PI*k)*Math.PI*arc*TW;const ang=P.kind==='axe'?k*12:Math.atan2(dy,dx);
    /* the ground under it: the launch / landing heights (55 aims at ~0.6 of a tile up) carried down to the sand */
    const hgt=0.6+Math.sin(Math.PI*k)*arc;v101Shadow(p.x,a.y+(b.y-a.y)*k+TW*0.6,hgt,P.kind==='stone'?0.07:P.kind==='spear'?0.2:0.13);
    if(P.kind==='arrow'||P.kind==='bolt'||P.kind==='knife'||P.kind==='spear'){V101P.stats.trails++;ctx.save();ctx.lineCap='round';
      for(let j=1;j<=4;j++){const q=Math.max(0,k-j*0.035);const t=pos(q);ctx.globalAlpha=0.16*(1-j/5);ctx.strokeStyle='#f6ecd2';ctx.lineWidth=Math.max(0.8,TW*0.018*(1-j/6));
        ctx.beginPath();ctx.moveTo(t.x,t.y);ctx.lineTo(p.x,p.y);ctx.stroke()}ctx.restore()}
    drawMissile(P.kind,p.x,p.y,ang,1+0.12*Math.sin(Math.PI*k)*Math.min(1,arc*3))}
  /* lodged / dropped pieces: 55's own loop with an empty flight list */
  const keep=PROJ.splice(0,PROJ.length);try{_dp.apply(this,arguments)}finally{PROJ.push(...keep)}};
/* a little more arc for arrows / bolts / thrown blades (their flight reads as a throw, not a laser) */
{const base=projectile;projectile=function(kind,from,to,o){try{if(o&&V101P.arc[kind]!=null&&(o.arc||0)<V101P.arc[kind])o=Object.assign({},o,{arc:V101P.arc[kind]})}catch(e){}return base.call(this,kind,from,to,o)}}
/* 312's Rete in flight: a shadow under the net (the net paints itself after) */
if(typeof bst100NetsPaint==='function'){const base=bst100NetsPaint;bst100NetsPaint=function(now){try{if(typeof BST100!=='undefined'&&BST100.nets.length&&typeof bst100Mode==='function'&&bst100Mode()!=='off'){
      const N0=BST100.net,k=typeof bst100K==='function'?bst100K():1;
      for(const x of BST100.nets){const el=now-x.t0;if(el<N0.wind*k||el>=(N0.wind+N0.fly)*k||!x.by||!x.u)continue;const u=(el-N0.wind*k)/(N0.fly*k);
        const a=center(x.by.r,x.by.c),b=center(x.u.r,x.u.c);v101Shadow(a.x+(b.x-a.x)*u,a.y+(b.y-a.y)*u,0.9*Math.sin(Math.PI*u)+0.6,0.16+0.2*u);V101P.stats.netShadows++}}}catch(e){}
    return base.apply(this,arguments)}}
}

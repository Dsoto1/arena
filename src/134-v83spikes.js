/* =====================================================================
   134-V83SPIKES · v0.83 — the Floor Spikes medallion (Virgilante: "spears that come out from beneath the tile through small
   slots… about 6 spikes angling out and up with 1 straight up in the middle")
   =====================================================================
   • assets/rtok.webp cell 'spike' = the new medallion (tools/art/spikes83/make.py: his Spiders frame, plaque and scroll; inside a round
     iron sewer cap dusted with sand, seven slots, iron spikes coming up out of them — six angling out and up, one straight up;
     "2 DMG" on the plaque, "FLOOR SPIKE" on the scroll, set from his own lettering).
   • It shows wherever spikes are named: the log (spikes rising, a spike wound), the tile line under the arena, and the Event
     Designer's Spike tool. The board keeps drawing the raised iron spikes (130-v82vis).
   ===================================================================== */
const SPIKE_TOK83=(sz=18)=>typeof rtokHTML==='function'?rtokHTML('spike',sz,'Floor spikes'):'';
/* the log: lines about the floor spikes carry the token */
{const base=log;log=function(h,cls){try{if(typeof h==='string'&&/floor spike/i.test(h)&&h.indexOf('class="rtok"')<0)h=SPIKE_TOK83(18)+' '+h}catch(e){}return base.call(this,h,cls)}}
/* the tile line under the arena */
{const base=describeTile;describeTile=function(t){let h=base.apply(this,arguments);try{if(typeof h==='string'&&h.indexOf('Floor spike (')>=0)h=h.replace('Floor spike (',SPIKE_TOK83(18)+' Floor spike (')}catch(e){}return h}}
/* the Event Designer's Spike tool wears the token */
{const tag=()=>{for(const b of document.querySelectorAll('[data-st="tool"][data-v="spike"]:not([data-tok83])')){b.dataset.tok83='1';b.insertAdjacentHTML('afterbegin',SPIKE_TOK83(18)+' ')}};
 new MutationObserver(()=>{if(document.querySelector('[data-st="tool"][data-v="spike"]:not([data-tok83])'))tag()}).observe(document.documentElement,{childList:true,subtree:true})}
/* ---- the board: each spike tile is a 3D piece — a round iron sewer cap lying on the tile (a thick rim you can see, ribs, bolts,
   sand blown over it) with seven iron spikes standing up out of its slots: six leaning out and up, one straight up in the middle.
   The spikes sink back into the cap during the post-show (sh9 → 0). Replaces 130-v82vis' flat plate. ---- */
function spikeHash83(r,c,i){let h=(r*73856093)^(c*19349663)^(i*83492791);h=(h^(h>>>13))*1274126177;return ((h^(h>>>16))>>>0)/4294967296}
{const base=drawSpikeTile;drawSpikeTile=function(s,sh9){if(!s||typeof ctx==='undefined')return base.apply(this,arguments);
  const m=center(s.r,s.c),up=Math.max(0,Math.min(1,sh9==null?1:sh9)),P=typeof spikePlate82==='function'?spikePlate82():'#3a3129';
  const RX=TW*0.37,RY=RX*0.5,TH=TW*0.05,cx=m.x,cy=m.y+TW*0.01;const Pl=shade(P,0.32); /* the cap reads lighter than the old plate */
  ctx.save();
  /* shadow on the sand */
  ctx.fillStyle='rgba(30,18,8,.32)';ell(cx+TW*0.02,cy+TH+TW*0.02,RX*1.04,RY*1.05);ctx.fill();
  /* the rim's thickness */
  ctx.fillStyle='#17120e';ell(cx,cy+TH,RX,RY);ctx.fill();ctx.fillRect(cx-RX,cy,RX*2,TH);
  ctx.fillStyle=shade(Pl,-0.35);ell(cx,cy+TH*0.55,RX,RY);ctx.fill();
  /* the top face */
  const g=ctx.createLinearGradient(cx-RX,cy-RY,cx+RX,cy+RY);g.addColorStop(0,shade(Pl,0.22));g.addColorStop(.55,Pl);g.addColorStop(1,shade(Pl,-0.18));
  ctx.fillStyle=g;ell(cx,cy,RX,RY);ctx.fill();
  ctx.lineWidth=Math.max(1,TW*0.012);ctx.strokeStyle='#0d0a07';ell(cx,cy,RX,RY);ctx.stroke();
  ctx.strokeStyle='rgba(168,131,77,.85)';ctx.beginPath();ctx.ellipse(cx,cy,RX*0.97,RY*0.97,0,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
  /* inner ring + ribs */
  ctx.strokeStyle='rgba(12,9,6,.75)';ctx.lineWidth=Math.max(1,TW*0.01);ell(cx,cy,RX*0.62,RY*0.62);ctx.stroke();
  for(let k=0;k<12;k++){const a=k*Math.PI/6;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*RX*0.64,cy+Math.sin(a)*RY*0.64);ctx.lineTo(cx+Math.cos(a)*RX*0.9,cy+Math.sin(a)*RY*0.9);ctx.stroke()}
  ctx.fillStyle='#a8834d';for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;ell(cx+Math.cos(a)*RX*0.94,cy+Math.sin(a)*RY*0.94,TW*0.012,TW*0.007);ctx.fill()}
  /* sand blown over it */
  for(let i=0;i<26;i++){const a=spikeHash83(s.r,s.c,i)*Math.PI*2,rr=Math.sqrt(0.25+0.75*spikeHash83(s.r,s.c,i+40)),q=spikeHash83(s.r,s.c,i+80);
    ctx.fillStyle=q<0.5?'rgba(222,194,140,.9)':'rgba(196,164,112,.85)';ell(cx+Math.cos(a)*RX*rr,cy+Math.sin(a)*RY*rr,TW*(0.006+0.01*q),TW*(0.004+0.005*q));ctx.fill()}
  ctx.fillStyle='rgba(214,186,134,.55)';ell(cx-RX*0.55,cy+RY*0.62,RX*0.28,RY*0.14);ctx.fill();ell(cx+RX*0.5,cy+RY*0.66,RX*0.24,RY*0.12);ctx.fill();
  /* seven slots and their spikes, back to front */
  const sl=[{a:null}];for(let k=0;k<6;k++)sl.push({a:-Math.PI/2+k*Math.PI/3});
  for(const o of sl){o.x=o.a==null?cx:cx+Math.cos(o.a)*RX*0.66;o.y=o.a==null?cy:cy+Math.sin(o.a)*RY*0.66}
  sl.sort((p,q)=>p.y-q.y);
  const bw=TW*0.046;
  for(const o of sl){ctx.fillStyle='#0b0806';ell(o.x,o.y,bw*1.25,bw*0.62);ctx.fill();ctx.strokeStyle='rgba(150,118,70,.9)';ctx.lineWidth=Math.max(0.8,TW*0.006);ell(o.x,o.y,bw*1.25,bw*0.62);ctx.stroke()}
  if(up>0.03)for(const o of sl){const L=(o.a==null?TW*0.44:TW*0.34)*up,lean=o.a==null?0:0.42; /* TWEAK: lean in radians (≈24°) */
    const ox=o.a==null?0:Math.cos(o.a),oy=o.a==null?0:Math.sin(o.a)*0.5;
    const tx=o.x+ox*L*Math.sin(lean),ty=o.y+oy*L*Math.sin(lean)-L*Math.cos(lean);
    /* the spike's shadow on the cap */
    ctx.fillStyle='rgba(10,6,3,.28)';ctx.beginPath();ctx.moveTo(o.x-bw*0.6,o.y);ctx.lineTo(o.x+TW*0.1*up+ox*L*0.2,o.y+TW*0.03*up);ctx.lineTo(o.x+bw*0.6,o.y+bw*0.3);ctx.closePath();ctx.fill();
    /* a cone: dark flank, lit flank (light from the upper left), bright tip */
    const dx=tx-o.x,dy=ty-o.y,len=Math.hypot(dx,dy)||1,px=-dy/len*bw,py=dx/len*bw*0.5+0.0;
    ctx.beginPath();ctx.moveTo(o.x-bw,o.y);ctx.lineTo(tx,ty);ctx.lineTo(o.x,o.y+bw*0.45);ctx.closePath();ctx.fillStyle='#b38a4f';ctx.fill();
    ctx.beginPath();ctx.moveTo(o.x+bw,o.y);ctx.lineTo(tx,ty);ctx.lineTo(o.x,o.y+bw*0.45);ctx.closePath();ctx.fillStyle='#2a231d';ctx.fill();
    ctx.beginPath();ctx.moveTo(o.x-bw*0.35+dx*0.62,o.y+dy*0.62);ctx.lineTo(tx,ty);ctx.lineTo(o.x+dx*0.62,o.y+dy*0.62+bw*0.15);ctx.closePath();ctx.fillStyle='#ecd29a';ctx.fill();
    ctx.strokeStyle='#0d0a07';ctx.lineWidth=Math.max(0.8,TW*0.008);ctx.beginPath();ctx.moveTo(o.x-bw,o.y);ctx.lineTo(tx,ty);ctx.lineTo(o.x+bw,o.y);ctx.stroke()}
  ctx.restore()}}

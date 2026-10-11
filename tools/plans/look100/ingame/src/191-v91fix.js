/* =====================================================================
   191-V91FIX · v0.91 fixes (Virgilante's notes 2026-10-06)
   • THE PEN CAMERA, sturdier: a Manager beast-pen fight or exhibition always opens zoomed in (185's camera). A hand zoom kept
     from an earlier match (a pinch on a touch screen sets CAM.z, which 86's duelCam returns before anything else) no longer
     overrides it: CAM.z is cleared when such a bout starts, and S.zoomIn is set again at its first turn.
   ===================================================================== */
{const base=newState;newState=function(config){const r=base.apply(this,arguments);try{if(S&&config&&(config.pen76||config.exhibCtx)&&!config.sim&&typeof CAM!=='undefined')CAM.z=null}catch(e){}return r}}
{const base=beginTurn;beginTurn=function(){try{if(S&&S.zoom90&&!S._zoom91){S._zoom91=1;S.zoomIn=true;if(typeof CAM!=='undefined')CAM.z=null}}catch(e){}return base.apply(this,arguments)}}
/* • A FIGHTER'S FIRST FACING (his ask 2026-10-06): the 3D minis start facing away from the corner they entered by — toward the
     middle of the sand — instead of all facing one way. miniFace (102) turns a mini by its last step; before its first step we
     seed that "last step" as one pace in from its tile, so it already looks inward. Display only. */
{const base=miniFace;miniFace=function(p,k){try{if(p&&p._fr==null&&S&&S.players&&S.players.includes(p)&&Number.isFinite(p.r)){const m=(N-1)/2;const sr=Math.sign(m-p.r),sc=Math.sign(m-p.c);
    if(sr||sc){const r=base.call(this,p,k);p._fr=p.r-sr;p._fc=p.c-sc;return base.call(this,p,k)}}}catch(e){}return base.apply(this,arguments)}}
/* • ONE PILLAR (his call 2026-10-06): his textured stone pillar (the 3D minis' pillar image) is the pillar in every token style —
     the sculpted column (130 drawPillar82) is only the stand-in while the image loads. Pots, Blessing token rounds (186), the
     ×N count and the pillar's shadow come with it (miniDraw draws the shadow).
   • NO CYLINDERS: the ⚪ Cylinders token style leaves Settings → Tokens (a placeholder idea); anyone still on it moves to figures. */
{const base=drawPillar82;drawPillar82=function(pl){try{if(!HEADLESS&&typeof miniImg==='function'&&miniImg('pillar')){const m=center(pl.r,pl.c);const top=miniDraw('pillar',m.x,m.y);
    if(top!=null){let y=top+TW*0.06;(pl.pots||[]).forEach(()=>{drawPot(m.x,y,TW*0.46,false);y-=TW*0.44});
      if(pl.pots&&pl.pots.length>1&&TW>28){ctx.fillStyle='#f0cf7d';ctx.font=`500 ${Math.round(TW*0.18)}px IBM Plex Mono, monospace`;ctx.fillText('×'+pl.pots.length,m.x+TW*0.34,top+TW*0.2)}return}}}catch(e){}
  return base.apply(this,arguments)}}
try{if(SETTINGS.tokenStyle==='cylinder'){SETTINGS.tokenStyle='figure';applySettings()}}catch(e){}
{const base=settingsHTML;settingsHTML=function(){const h=base.apply(this,arguments);return typeof h==='string'?h.replace(/<button type="button" class="tokrow[^"]*" data-tokstyle="cylinder">[\s\S]*?<\/button>/,''):h}}
/* • NO FLAVIUS AT THE LUDUS (his call 2026-10-06): a beast-pen fight or an exhibition is a private training bout, so the emperor's
     box (portrait, mood face, sponsor) is not drawn and Flavius never reacts or speaks there. Display only. */
const lud91=()=>typeof S!=='undefined'&&S&&(S.pen76||S.exhib);
{const base=drawFlavius;drawFlavius=function(){if(lud91())return;return base.apply(this,arguments)}}
{const base=flaviusMood;flaviusMood=function(){if(lud91())return;return base.apply(this,arguments)}}
{const base=flaviusReact;flaviusReact=function(){if(lud91())return;return base.apply(this,arguments)}}
/* • DRY CLAY POTS (his ask 2026-10-06; the chain below was tried and dropped — POT91.chainOn): the Blessing pots read matte — the glossy upper-left highlight is
     knocked back with the pot's own colour, a faint dry-clay speckle over the body — and a thin iron chain wraps the neck
     just under the lip, one end trailing down the back toward the pillar (kept faint: a hint, not a feature). The gold
     Eagle pot keeps its shine. Cosmetic: the speckle comes from the pot's screen position, never the dice. */
const POT91={chainOn:false /* his call 2026-10-06: no chain */,chain:'rgba(70,66,62,.6)',chainHi:'rgba(190,186,178,.35)',matte:.55}; /* TWEAK */
{const base=drawPot;drawPot=function(x,y,s,eagle){const r=base.apply(this,arguments);if(eagle||HEADLESS||!(s>6))return r;try{
  const potC=THEME.pot||'#b5582f';ctx.save();
  /* the body + neck silhouette */
  ctx.beginPath();ctx.moveTo(x-s*0.12,y);ctx.bezierCurveTo(x-s*0.5,y-s*0.06,x-s*0.5,y-s*0.6,x-s*0.15,y-s*0.7);ctx.lineTo(x-s*0.11,y-s*0.9);ctx.lineTo(x+s*0.11,y-s*0.9);
  ctx.lineTo(x+s*0.15,y-s*0.7);ctx.bezierCurveTo(x+s*0.5,y-s*0.6,x+s*0.5,y-s*0.06,x+s*0.12,y);ctx.closePath();ctx.clip();
  /* matte: the highlight spot washed with the body colour */
  const hx=x-s*0.14,hy=y-s*0.52;const g=ctx.createRadialGradient(hx,hy,0,hx,hy,s*0.34);g.addColorStop(0,potC);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalAlpha=POT91.matte;ctx.fillStyle=g;ctx.fillRect(x-s*0.5,y-s,s,s);ctx.globalAlpha=1;
  /* dry clay: a faint speckle (seeded by position) */
  let q=(Math.round(x*7)*73856093^Math.round(y*7)*19349663)>>>0;const rn=()=>{q=(q*1103515245+12345)>>>0;return (q>>>8)/16777216};
  const n=Math.min(140,Math.round(s*2.2)),d=Math.max(0.7,s*0.011);for(let i=0;i<n;i++){const px=x+(rn()-0.5)*s*0.9,py=y-rn()*s*0.92;ctx.fillStyle=rn()<0.5?'rgba(255,236,210,.10)':'rgba(40,18,8,.12)';ctx.fillRect(px,py,d,d)}
  ctx.restore();
  /* the chain under the lip: small links round the front of the neck, a tail down the back */
  if(POT91.chainOn&&s>14){ctx.save();const cy=y-s*0.84,rx=s*0.14,ry=s*0.035,k=7;ctx.lineWidth=Math.max(0.7,s*0.018);
    for(let i=0;i<k;i++){const a=Math.PI*(0.08+0.84*i/(k-1));const lx=x+Math.cos(a)*rx,ly=cy+Math.sin(a)*ry;ctx.strokeStyle=POT91.chain;ctx.beginPath();ctx.ellipse(lx,ly,s*0.022,s*0.014,i%2?0.9:-0.3,0,Math.PI*2);ctx.stroke()}
    ctx.strokeStyle=POT91.chainHi;ctx.lineWidth=Math.max(0.5,s*0.01);ctx.beginPath();ctx.ellipse(x,cy-s*0.004,rx,ry,0,0.2*Math.PI,0.6*Math.PI);ctx.stroke();
    /* the tail: from the right of the neck down behind the belly toward the pillar */
    ctx.strokeStyle=POT91.chain;ctx.lineWidth=Math.max(0.7,s*0.018);for(let i=1;i<=4;i++){const t=i/4;const lx=x+rx+s*0.06*Math.sin(t*2),ly=cy+t*s*0.36;ctx.beginPath();ctx.ellipse(lx+s*0.13*t,ly,s*0.018,s*0.026,i%2?0.4:-0.4,0,Math.PI*2);ctx.stroke()}
    ctx.restore()}}catch(e){}return r}}
/* Flavius' Greaves on the avatar (his note 2026-10-06: "they look inverted" next to their card): his art is a front view lit from one side;
   mirrored onto the left shin the light flipped. Both shins now wear it unmirrored, exactly like the pair on the card (ARM_NOMIRROR91). */
const ARM_NOMIRROR91={greaves:1};
{const base=armBox;armBox=function(key){const B=base.apply(this,arguments);if(B&&ARM_NOMIRROR91[key])B.mirror=false;return B}}

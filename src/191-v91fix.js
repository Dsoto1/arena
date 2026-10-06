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

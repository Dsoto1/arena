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

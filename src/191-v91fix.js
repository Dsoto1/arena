/* =====================================================================
   191-V91FIX · v0.91 fixes (Virgilante's notes 2026-10-06)
   • THE PEN CAMERA, sturdier: a Manager beast-pen fight or exhibition always opens zoomed in (185's camera). A hand zoom kept
     from an earlier match (a pinch on a touch screen sets CAM.z, which 86's duelCam returns before anything else) no longer
     overrides it: CAM.z is cleared when such a bout starts, and S.zoomIn is set again at its first turn.
   ===================================================================== */
{const base=newState;newState=function(config){const r=base.apply(this,arguments);try{if(S&&config&&(config.pen76||config.exhibCtx)&&!config.sim&&typeof CAM!=='undefined')CAM.z=null}catch(e){}return r}}
{const base=beginTurn;beginTurn=function(){try{if(S&&S.zoom90&&!S._zoom91){S._zoom91=1;S.zoomIn=true;if(typeof CAM!=='undefined')CAM.z=null}}catch(e){}return base.apply(this,arguments)}}

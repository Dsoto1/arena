/* =====================================================================
   41-DUEL · THE FINAL DUEL CAMERA (v0.46)
   =====================================================================
   When the zone closes to 5×5 (round 3 of the classics, or any event's third zone) the camera leans
   in on the sand that is left, the edges darken, and the boss theme takes over. A 🔍 button on the
   canvas toolbar pulls back to the normal view (and leans in again). draw() in 07-ui asks duelCam()
   for the zoom each frame. */
const DUEL={z:1,t0:0,on:false,from:1};
function duelZoneOn(){try{return !!(S&&!S.over&&S.phase!=='setup'&&!isChariot()&&!isNaum()&&RD()&&RD().zone===3&&(typeof SETTINGS==='undefined'||SETTINGS.duelZoom!==false))}catch(e){return false}}
function duelCam(){if(HEADLESS)return 1;const want=duelZoneOn()&&!S.zoomOut;
  if(want!==DUEL.on){DUEL.on=want;DUEL.t0=performance.now();DUEL.from=DUEL.z}
  const k=Math.min(1,(performance.now()-DUEL.t0)/1100);const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  DUEL.z=DUEL.from+((DUEL.on?1.75:1)-DUEL.from)*e;
  if(k<1&&!DUEL.raf)DUEL.raf=requestAnimationFrame(()=>{DUEL.raf=0;try{draw()}catch(err){}});
  return DUEL.z}
function duelVignette(Wd,Hd){if(DUEL.z<=1.01)return;const g=ctx.createRadialGradient(Wd/2,Hd/2,Math.min(Wd,Hd)*0.26,Wd/2,Hd/2,Math.max(Wd,Hd)*0.7);
  const a=0.75*Math.min(1,(DUEL.z-1)/0.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(8,3,2,${a})`);ctx.save();ctx.setTransform(window.devicePixelRatio||1,0,0,window.devicePixelRatio||1,0,0);ctx.fillStyle=g;ctx.fillRect(0,0,Wd,Hd);ctx.restore()}
function duelUI(){const b=document.getElementById('btnZoom');if(!b)return;const show=duelZoneOn();b.hidden=!show;if(show){const t=S.zoomOut?'🔍 Lean in':'🔍 Zoom out';if(b.textContent!==t)b.textContent=t;b.title=S.zoomOut?'Back to the duel camera':'Pull the camera back to the normal view'}}
document.addEventListener('click',e=>{if(e.target.closest('#btnZoom')&&S){S.zoomOut=!S.zoomOut;draw()}});

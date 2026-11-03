/* v1.15c WHEEL ZOOM (433-v115czoom): the mouse wheel over the arena canvas (#cv) zooms like the phone pinch (86-v66): wheel up = in,
   down = out, ~10% a notch (deltaY accumulated, ~100 units a step, so a trackpad's many small events stay gentle; line/page modes scaled),
   range 1-CAM_MAX. It sets CAM.z / S.zoomIn exactly as the pinch does and the follow camera (camFocus) keeps centring on the active
   fighter (not the pointer). One draw() per animation frame; the HUD (duelUI) refreshes when the wheel rests. Only while a live board is
   shown (S set, not in setup) and no modal is open: the wheel never scrolls the page over the sand. Ctrl+wheel (Mac trackpad pinch) zooms
   too and is cancelled so the browser does not zoom the page. Other wheel handlers (142, 124, 91, 92, 207) are untouched.
   No animation is added (Reduce motion / Animations Off need no path). Kill switch: localStorage flavius_v115czoomoff=1 = no wheel handling. */
{let off=false;try{off=localStorage.getItem('flavius_v115czoomoff')==='1'}catch(e){}
if(!off&&typeof cv!=='undefined'&&cv&&typeof CAM!=='undefined'&&!HEADLESS){
  const W115={acc:0,raf:0,t:0};
  const live=()=>{try{if(!S||S.phase==='setup')return false;const m=document.getElementById('modal');if(m&&!m.hidden)return false;return true}catch(e){return false}};
  const flush=()=>{W115.raf=0;try{draw()}catch(e){}clearTimeout(W115.t);W115.t=setTimeout(()=>{try{duelUI()}catch(e){}},160)};
  cv.addEventListener('wheel',e=>{
    if(!live())return;
    e.preventDefault();
    if(typeof duelZoneOn==='function'&&duelZoneOn())return;
    let dy=e.deltaY;if(e.deltaMode===1)dy*=33;else if(e.deltaMode===2)dy*=400;
    W115.acc+=dy;const n=Math.trunc(W115.acc/100);if(!n)return;W115.acc-=n*100;
    const z0=CAM.z||(typeof duelCam==='function'?duelCam():1)||1;
    CAM.z=Math.max(1,Math.min(CAM_MAX,z0*Math.pow(1.1,-n)));
    S.zoomIn=CAM.z>1.02;if(CAM.z<1.03)CAM.z=null;
    if(!W115.raf)W115.raf=requestAnimationFrame(flush);
  },{passive:false});
}}

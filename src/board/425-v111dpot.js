/* v1.11d — THE JUG SPECKLES STAY ON THE JUG (owner's decision 2026-10-23; kill switch localStorage flavius_v111dpotoff=1 = v1.11c exactly).
   192's drawPot sprinkled ~140 speckle rects on each Blessing jug, seeded from the jug's ABSOLUTE SCREEN x/y (round(x*7), round(y*7)). Zoomed, the
   camera pans by moving OX/OY, so every jug's seed changed with every pan step: the speckles shimmered, and 420's S2 / 423's Z2 jug pictures
   (keyed on the jug's screen box relative to the camera) could never reuse a picture while the camera moved, because its pixels were never the same.
   Now 192 asks POT111D.seed(x,y) (one marked line, "v1.11d (425)", read only while POT111D.on): the seed is the jug's BOARD position in tile units,
   ((x-OX-jiggle)/TW, (y-OY)/TW) quantised to 1/256 tile and mixed with Math.imul — the same at any zoom, pan, DPR or window size, and unmoved by
   371's side-to-side shake (its dx is taken off). The speckle count, size (s*0.011), colours and the LCG that spreads them are 192's, untouched.
   No game RNG (rand/pickOne/rnd) is used: the dice are unchanged. Stacked jugs differ by their y, so each keeps its own pattern. */
const POT111D={on:true,hits:0};
try{if(localStorage.getItem('flavius_v111dpotoff')==='1')POT111D.on=false}catch(e){}
POT111D.seed=function(x,y){POT111D.hits++;
  const dx=(typeof POT105!=='undefined'&&POT105.dx)||0,tw=(typeof TW==='number'&&TW>0)?TW:1,ox=(typeof OX==='number')?OX:0,oy=(typeof OY==='number')?OY:0;
  const u=Math.round((x-dx-ox)/tw*256),v=Math.round((y-oy)/tw*256);
  return (Math.imul(u,73856093)^Math.imul(v,19349663))>>>0};

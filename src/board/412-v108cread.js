/* =====================================================================
   412-v108cread — v1.08c item 0b (tools/plans/v108c/NOTES.md, his 7a): THE BASES-OFF READ-BACK OFF SAFARI'S MAIN THREAD.
   His Safari recordings (tools/plans/v107/perf/safari-v108b-*.json, bases off): `bs101Off < bs101Proc` getImageData = 28 ms a call
   (29 calls = 821 ms in 10 s). The call is cheap in itself (Chromium: 0.1 ms); on WebKit every 2D canvas lives in the GPU process and a
   read-back is a synchronous round trip that waits behind everything the board has queued that frame (CoreGraphics rasterising the board).
   What 321 needs the pixels for: bases off = a flood fill over the base's own colours, from its outline inward, then its rim — a pure loop
   over the cell's RGBA (bs101Off), made once per cell × anchor × scale (BS101.cache; a new pose, a walk frame, a zoom step = a new cell).
   • WEBKIT ONLY (P107S.webkit, or flavius_rb108force=1): a cell 321 has not processed yet is copied with createImageBitmap (no read-back)
     and handed to a Worker that runs 321's OWN bs101Off (its source text, unchanged) on an OffscreenCanvas; the finished pixels come back
     as an ArrayBuffer and are put into the cell's cache entry (putImageData, no read-back) — the same pixels as 321's sync path (tv108c).
     Until then (1–3 frames) the board shows that figure's previous base-less cell (the last one drawn within 0.35 tile, scaled to this cell's
     px/mm, anchored on the same base point); a figure never drawn base-less before (its first frame) takes 321's sync path as before.
   • Chrome / Firefox, file:// pages (tainted pixels), no Worker / OffscreenCanvas 2D / createImageBitmap, a worker error: 321 unchanged.
   Kill switch localStorage flavius_rb108off=1. Stats RB108.st. Test tv108c.
   ===================================================================== */
const RB108={off:(()=>{try{return localStorage.getItem('flavius_rb108off')==='1'}catch(e){return false}})(),
  force:(()=>{try{return localStorage.getItem('flavius_rb108force')==='1'}catch(e){return false}})(),
  w:null,ok:null,id:0,jobs:new Map(),pend:new WeakMap(),npend:0,maxPend:24 /* TWEAK: cells in flight */,near:0.35 /* TWEAK: tiles */,keepFr:90,
  recent:[],fr:0,raf:0,fails:0,src:typeof bs101Off==='function'?bs101Off.toString():'',
  st:{async:0,done:0,thin:0,interim:0,sync:0,noPrev:0,busy:0,fail:0,late:0,stale:0}};
function rb108On(){if(RB108.off||RB108.ok===false||!RB108.src)return false;try{if(!(RB108.force||(typeof P107S!=='undefined'&&P107S.webkit&&!P107S.off)))return false;
  if(location.protocol==='file:'||typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined'||typeof createImageBitmap!=='function')return false}catch(e){return false}return true}
/* the worker: 321's bs101Off verbatim; sg = the OffscreenCanvas the cell is drawn into, g.putImageData hands the result back */
function rb108Worker(){if(RB108.w)return RB108.w;if(RB108.ok===false)return null;
  try{const src=`const BS101={stats:{off:0}};const bs101Off=${RB108.src};
self.onmessage=e=>{const q=e.data;let ok=false,buf=null,err=0;try{const oc=new OffscreenCanvas(q.W,q.H);const sg=oc.getContext('2d',{willReadFrequently:true});if(!sg)throw new Error('2d');
  sg.drawImage(q.bm,0,0,q.sw,q.sh,0,0,q.sw,q.sh);try{q.bm.close()}catch(x){}let out=null;const g={putImageData(id){out=id}};
  ok=!!bs101Off(sg,oc,null,g,q.W,q.H,q.cx,q.cyT,q.rx,q.ry,q.Tp);if(ok&&out)buf=out.data.buffer}catch(x){err=String(x&&x.message||x)==='2d'?2:1}
  self.postMessage({id:q.id,ok:!!(ok&&buf),err,buf},buf?[buf]:[])};`;
    const u=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));const w=new Worker(u);
    w.onmessage=e=>rb108Done(e.data);w.onerror=()=>{RB108.ok=false;RB108.st.fail++;try{w.terminate()}catch(x){}RB108.w=null;RB108.jobs.clear()};
    RB108.w=w;RB108.ok=true;return w}catch(e){RB108.ok=false;return null}}
/* a job came back: the cell's cache entry (the same key 321 uses), then one board draw */
function rb108Done(m){const J=RB108.jobs.get(m.id);if(!J)return;RB108.jobs.delete(m.id);const P=RB108.pend.get(J.img);if(P&&P.get(J.key)===J){P.delete(J.key);RB108.npend--}
  if(m.err===2){RB108.ok=false;RB108.st.fail++;return}   /* no 2D OffscreenCanvas in a worker: 321's sync path from now on */
  try{let c;const map=BS101.cache.get(J.img)||(BS101.cache.set(J.img,new Map()),BS101.cache.get(J.img));if(map.has(J.key)){RB108.st.late++;return}
    if(m.ok){c=document.createElement('canvas');c.width=J.W;c.height=J.H;c.getContext('2d',{willReadFrequently:true}).putImageData(new ImageData(new Uint8ClampedArray(m.buf),J.W,J.H),0,0);
      c._off=true;BS101.stats.off++;BS101.stats.proc++;RB108.st.done++;map.set(J.key,c);if(map.size>80)map.delete(map.keys().next().value)}
    else{if(m.err)BS101.stats.taint++;   /* 321's sync path: no base found / unreadable → the thin base (its mode 1, the same squeeze) */
      c=J.base.call(null,J.img,J.a[1],J.a[2],J.a[3],J.a[4],J.a[5],J.a[6],J.a[7],J.a[8],1);if(c){map.set(J.key,c);if(map.size>80)map.delete(map.keys().next().value)}RB108.st.thin++}
  }catch(e){RB108.st.fail++}
  if(!RB108.raf)RB108.raf=requestAnimationFrame(()=>{RB108.raf=0;try{if(S&&!HEADLESS)draw()}catch(e){}})}
/* the figure's last base-less cell drawn near this base point (same family), re-anchored + scaled into a W×H cell */
function rb108Interim(f,ax,ay,ppm,W,H,J){if(J&&J.interim)return J.interim;let best=null,bd=1e9;const lim=(typeof TW!=='undefined'?TW:60)*RB108.near;
  for(const e of RB108.recent){if(e.fam!==f.fam||RB108.fr-e.n>RB108.keepFr)continue;const r=ppm/e.ppm;if(!(r>0.8&&r<1.25))continue;
    const d=Math.hypot(e.x-f.x,e.y-f.y);if(d<lim&&(d<bd||(d===bd&&e.n>best.n))){bd=d;best=e}}
  if(!best)return null;const r=ppm/best.ppm;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});
  g.imageSmoothingQuality='high';const X=ax-best.ax*r,Y=ay-best.ay*r;if(Math.abs(r-1)<0.004)g.drawImage(best.c,Math.round(X),Math.round(Y));else g.drawImage(best.c,X,Y,best.c.width*r,best.c.height*r);
  c._off=best.c._off;c._rb108=1;if(J)J.interim=c;return c}
function rb108Keep(c,f,ax,ay,ppm){if(!c||!f)return;const L=RB108.recent;L.push({c,fam:f.fam,x:f.x,y:f.y,ax,ay,ppm,n:RB108.fr});if(L.length>48)L.splice(0,L.length-48)}
if(!RB108.off&&typeof bs101Proc==='function'&&typeof BS101!=='undefined'){const base=bs101Proc;
  bs101Proc=function(img,sx,sy,sw,sh,f,ax,ay,ppm,mode){if(mode!==2||!rb108On())return base.apply(this,arguments);
    let c=null;try{const map=BS101.cache.get(img),key=mode+'|'+sx+'|'+sy+'|'+sw+'|'+sh+'|'+f.fam+'|'+ax.toFixed(1)+'|'+ay.toFixed(1)+'|'+ppm.toFixed(3);
      if(map&&map.has(key)){c=base.apply(this,arguments);rb108Keep(c,f,ax,ay,ppm);return c}
      const W=Math.max(1,Math.ceil(sw)),H=Math.max(1,Math.ceil(sh));let P=RB108.pend.get(img);let J=P&&P.get(key);
      if(J&&performance.now()-J.t0>4000){P.delete(key);RB108.npend--;J=null;RB108.st.stale++}   /* lost: start again */
      const whole=sx===(sx|0)&&sy===(sy|0)&&sw===(sw|0)&&sh===(sh|0)&&sw>0&&sh>0;
      if(!J){if(!whole||RB108.npend>=RB108.maxPend||!rb108Worker()){RB108.st[whole&&RB108.npend>=RB108.maxPend?'busy':'sync']++;c=base.apply(this,arguments);rb108Keep(c,f,ax,ay,ppm);return c}
        const iv=rb108Interim(f,ax,ay,ppm,W,H,null);if(!iv){RB108.st.noPrev++;c=base.apply(this,arguments);rb108Keep(c,f,ax,ay,ppm);return c}
        const G=BS101.FAM[f.fam];J={img,key,W,H,t0:performance.now(),interim:iv,base,a:Array.prototype.slice.call(arguments)};
        if(!P){P=new Map();RB108.pend.set(img,P)}P.set(key,J);RB108.npend++;RB108.st.async++;const id=++RB108.id;RB108.jobs.set(id,J);
        const q={id,sw,sh,W,H,cx:ax,cyT:ay+G.ct*ppm,rx:G.rx*ppm,ry:G.rx*ppm/2,Tp:G.T*ppm};
        createImageBitmap(img,sx,sy,sw,sh).then(bm=>{const w=rb108Worker();if(!w||!RB108.jobs.has(id)){try{bm.close()}catch(x){}return}q.bm=bm;w.postMessage(q,[bm])},
          ()=>{RB108.jobs.delete(id);const P2=RB108.pend.get(img);if(P2&&P2.get(key)===J){P2.delete(key);RB108.npend--}RB108.st.fail++});
        c=iv}
      else c=rb108Interim(f,ax,ay,ppm,W,H,J);
      if(!c){c=base.apply(this,arguments)}else RB108.st.interim++;rb108Keep(c,f,ax,ay,ppm);return c}
    catch(e){return c||base.apply(this,arguments)}};
  if(typeof draw==='function'){const bd=draw;draw=function(){RB108.fr++;return bd.apply(this,arguments)}}}
/* the ⏺ recorder (405 Q3 / 406 W4) report carries 412's counts */
if(typeof rec107Extra==='function'){const base=rec107Extra;rec107Extra=function(){const o=base.apply(this,arguments);try{o.rb108={on:rb108On(),worker:RB108.ok,...RB108.st}}catch(e){}return o}}

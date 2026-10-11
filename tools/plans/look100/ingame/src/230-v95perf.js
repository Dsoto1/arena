/* 230-v95perf — v0.95 PART D · PERFORMANCE (his yes 2026-10-07). Measured before (all-CPU Democritus, 1440×900): Normal 26 fps (p95 frame
   114 ms), Fast 9 fps (p50 80 ms); busy 74–81% while game script was only ~9%. The cost was IMAGE RE-DECODING: every render() rebuilt the
   fighter panel, the Field tab, the status chips and the turn panel with innerHTML, so the avatar, the armor2.webp sheet (4.9 Mpx), weapons.jpg
   (6.7 Mpx), arena.jpg (30 Mpx), rtok.webp, coin and medallions were inserted again (up to ~30 a second) and decoded again — a sprite sheet
   is decoded WHOLE for one 60 px cell, and the big ones never fit Chrome's decode cache. Plus forced layouts (clientWidth / fitReserve
   on every draw). Nothing here touches the rules, the dice, S or the online hash: display only.
   1 · PATCH IN PLACE (p95Patch): render() / renderTurnInd() run exactly as before, but into a fresh empty twin of #board, #npcPanel, #roster,
       #rosterHd, #status and #turnInd (every wrapper and post-processor sees what it always saw); the live panel is then patched to match
       (morph95: unchanged nodes stay — with their decoded images, hover, focus — changed attributes/text are updated, only new nodes go in).
       What the page's observers add to a kept node later (contrast lift, aria names, term spans) stays: only template changes are applied.
   2 · CUT-OUTS (cut95): a sprite-sheet cell shown in a panel (cardStyle, rtokHTML, the armor worn on the avatar) is cut ONCE into its own
       small image in a worker (fetch → createImageBitmap → OffscreenCanvas → blob URL: PNG for small cells, JPEG/WebP q .92 for card-size
       ones; all cells of a sheet in one go, so each sheet is decoded once a session, never on the page's thread).
       Same pixels, same placement. Needs a readable sheet: the site (http/https) and the standalone (data: URIs); a page opened from file://
       cannot read its pixels back (tainted canvas), so it keeps the sheets.
   3 · COALESCED RENDER: while a CPU acts at Fast / Normal (offline, no window open) the panels update at most P95.cpuHz times a second (the
       last call always lands, the canvas still redraws every call); the human's own turn, windows, Slow/Step/Pause and online update at once.
   4 · FAST = FEWER EXTRAS: at Fast no speech or wager bubbles, no cheering waves; dust puffs, rubble settling and floating numbers shorter.
       Slow / Normal look exactly as before.
   5 · LAYOUT ONCE: the arena wrap's / canvas's clientWidth and fitReserve() are kept by ResizeObservers (read when layout is clean) instead
       of forcing a layout inside every draw(); a change redraws at once (before the frame is painted).
   6 · SPEED AT ONCE: 02-data sleep() re-reads SPEED while it waits (Slow → Fast mid-pause finishes at Fast's pace; Pause holds).
   7 · MENU SHOW: the main-menu photo waits (≤1.5 s) until its figures are loaded and decoded, then plays; figures are drawn from a raster
       cache instead of re-rasterising their SVGs every frame.
   Kill switch: localStorage flavius_perf95off=1 (every part here off; 02-data's sleep keeps re-reading SPEED). Debug: flavius_cut95off=1,
   flavius_cut95only=<files,comma>, flavius_fit95off=1. Tools: tools/perf95/ (prof · trace · imgs · compare.sh · pixels · serve). Test tv95p. */
const P95={on:(()=>{try{return localStorage.getItem('flavius_perf95off')!=='1'}catch(e){return true}})(),
  noPatch:false /* tests: plain innerHTML, for the same-result check */,cpuHz:4 /* TWEAK: panel updates a second while a CPU acts */,last:0,tm:0,act:{},n:{render:0,patched:0,deferred:0,kept:0,added:0}};
const P95_IDS=['status','rosterHd','roster','board','npcPanel','turnInd'];

/* ---------------- 1 · patch in place ---------------- */
/* the lit figures' (176) id prefix, new on every draw */
const P95_FIGID=/s3h[0-9a-z]+/g;
/* keys that name WHO a row is: two nodes with different keys are never patched into each other */
const P95_KEYS=['id','data-pid','data-nc82','data-nc82k','data-card','data-bid','data-loc','data-avloc'];
function morph95Same(a,b){if(a.nodeType!==b.nodeType)return false;if(a.nodeType!==1)return true;if(a.tagName!==b.tagName)return false;
  for(const k of P95_KEYS){const x=a.getAttribute(k),y=b.getAttribute(k);if(x!==y&&(k==='id'||(x!=null&&y!=null)))return false}return true}
/* morph95Attrs — the panel itself: exactly the attributes the render left on its twin */
function morph95Attrs(o,n){
  for(const a of Array.from(o.attributes)){if(!n.hasAttributeNS(a.namespaceURI,a.localName))o.removeAttributeNS(a.namespaceURI,a.localName)}
  for(const a of Array.from(n.attributes)){if(o.getAttributeNS(a.namespaceURI,a.localName)!==a.value){if(a.namespaceURI)o.setAttributeNS(a.namespaceURI,a.name,a.value);else o.setAttribute(a.name,a.value)}}}
/* inside a panel each node remembers the attributes its template gave it (_p95). A patch changes only what the TEMPLATE changed, so what
   the page's observers add later stays on kept nodes: 220's contrast lift (style + data-lift93) and aria names, 138's data-en84… */
function p95Tpl(n){const m={};for(const a of n.attributes)m[a.name]=a.value;return m}
function p95Rec(n){if(n.nodeType!==1)return;n._p95=p95Tpl(n);const all=n.getElementsByTagName('*');for(let i=0;i<all.length;i++)all[i]._p95=p95Tpl(all[i])}
function morph95TplAttrs(o,n){const prev=o._p95,cur=p95Tpl(n);
  if(!prev)morph95Attrs(o,n);
  else{for(const k in prev)if(!(k in cur)&&o.hasAttribute(k))o.removeAttribute(k);
    for(const a of n.attributes)if(prev[a.name]!==a.value||!o.hasAttribute(a.name)&&!(a.name in prev)){if(a.namespaceURI)o.setAttributeNS(a.namespaceURI,a.name,a.value);else o.setAttribute(a.name,a.value)}}
  o._p95=cur}
function morph95Node(o,n){if(o.nodeType!==1){if(o.nodeValue!==n.nodeValue)o.nodeValue=n.nodeValue;return}
  if(o.isEqualNode(n)){P95.n.kept++;return}
  /* a lit figure (176) gets a new id prefix each time it is drawn: the same figure under another prefix stays as it is; a changed
     one is swapped whole (never patched inside: its ids and url(#…) references must stay one set) */
  if(o.tagName==='svg'&&n.innerHTML.indexOf('s3h')>=0){if(o.outerHTML.replace(P95_FIGID,'')===n.outerHTML.replace(P95_FIGID,'')){P95.n.kept++;return}
    p95Rec(n);o.parentNode.replaceChild(n,o);P95.n.added++;return}
  morph95TplAttrs(o,n);const tag=o.tagName;const focused=document.activeElement===o;
  if(tag==='INPUT'){if(!focused){const v=n.getAttribute('value');o.value=v==null?'':v;if(o.type==='checkbox'||o.type==='radio')o.checked=n.hasAttribute('checked')}return}
  if(tag==='TEXTAREA'){if(!focused&&o.value!==n.value)o.value=n.value;return}
  if(tag==='CANVAS')return;
  morph95Kids(o,n);
  if(tag==='SELECT'&&!focused){const sel=n.querySelector('option[selected]');if(sel&&o.value!==sel.value)o.value=sel.value}}
function morph95Kids(oldP,newP){const nk=Array.from(newP.childNodes);let o=oldP.firstChild;
  for(let i=0;i<nk.length;i++){const n=nk[i];
    if(!o){p95Rec(n);oldP.appendChild(n);P95.n.added++;continue}
    if(morph95Same(o,n)){const nx=o.nextSibling;morph95Node(o,n);o=nx;continue}
    /* one-step look-ahead: a row left (old next matches) or a row came (new next matches the old one) */
    const on=o.nextSibling,nn=nk[i+1];
    if(on&&morph95Same(on,n)&&!(nn&&morph95Same(o,nn))){oldP.removeChild(o);o=on.nextSibling;morph95Node(on,n);continue}
    if(nn&&morph95Same(o,nn)){p95Rec(n);oldP.insertBefore(n,o);P95.n.added++;continue}
    const next=o.nextSibling;p95Rec(n);oldP.replaceChild(n,o);P95.n.added++;o=next}
  while(o){const next=o.nextSibling;oldP.removeChild(o);o=next}}
/* p95Patch — runs fn with fresh empty twins of the panels in the page, then patches the live panels to match and puts them back */
function p95Patch(ids,fn,self,args){
  if(!P95.on||P95.noPatch||HEADLESS)return fn.apply(self,args);
  const sw=[];const act=document.activeElement;
  for(const id of ids){if(P95.act[id])continue;const live=document.getElementById(id);if(!live||!live.parentNode)continue;
    const fresh=live.cloneNode(false);live.parentNode.replaceChild(fresh,live);P95.act[id]=1;sw.push([id,live,fresh])}
  try{return fn.apply(self,args)}
  finally{
    /* 81's ratings move (a MutationObserver on the live board) would land after the patch: run it on the fresh panel first */
    if(sw.some(x=>x[0]==='board'))try{if(typeof panelStatsUp==='function')panelStatsUp()}catch(e){}
    for(const [id,live,fresh] of sw){delete P95.act[id];
      try{morph95Attrs(live,fresh);morph95Kids(live,fresh)}catch(e){console.error(e);while(live.firstChild)live.removeChild(live.firstChild);while(fresh.firstChild)live.appendChild(fresh.firstChild)}
      if(fresh.parentNode)fresh.parentNode.replaceChild(live,fresh)}
    P95.n.patched++;
    try{if(act&&act!==document.body&&act.isConnected&&document.activeElement!==act&&sw.some(x=>x[1].contains(act)))act.focus({preventScroll:true})}catch(e){}}}

/* ---------------- 3 · coalesced render ---------------- */
/* a click / key in the last 400 ms (inspecting a fighter, the Field tab…) is answered at once even while a CPU acts */
['pointerdown','keydown'].forEach(t=>addEventListener(t,()=>{P95.inp=performance.now()},true));
function p95Defer(){try{if(performance.now()-(P95.inp||-1e9)<400)return false;if(!S||S.over||S.phase==='setup'||S.snap||S.onl||S.tutorial||S.pen76)return false;
  if(SPEED!=='fast'&&SPEED!=='normal')return false;if(typeof CUR_MODAL!=='undefined'&&CUR_MODAL)return false;
  const p=cur();return !!(p&&p.cpu)}catch(e){return false}}
{const base=render;render=function(){if(!P95.on||HEADLESS)return base.apply(this,arguments);P95.n.render++;
  const now=performance.now();
  if(p95Defer()){const gap=1000/P95.cpuHz;if(now-P95.last<gap){P95.n.deferred++;
      if(!P95.tm)P95.tm=setTimeout(()=>{P95.tm=0;try{render()}catch(e){console.error(e)}},Math.max(16,gap-(now-P95.last)));
      try{draw()}catch(e){console.error(e)}return}}
  if(P95.tm){clearTimeout(P95.tm);P95.tm=0}
  P95.last=now;return p95Patch(P95_IDS,base,this,arguments)}}
{const base=renderTurnInd;renderTurnInd=function(){return p95Patch(['turnInd'],base,this,arguments)}}

/* ---------------- 2 · cut-outs ---------------- */
const CUT95={only:(()=>{try{const v=localStorage.getItem('flavius_cut95only');return v?v.split(','):null}catch(e){return null}})(),off:(()=>{try{return localStorage.getItem('flavius_cut95off')==='1'}catch(e){return false}})() /* debug: no cut-outs */,url:{},pend:{},want:{},q:[],busy:false,refresh:0,made:0,fail:0,
  png:200000 /* TWEAK: cells up to this many pixels are kept lossless (PNG); bigger ones (cards) as JPEG / WebP at qual */,qual:0.92};
function cut95Readable(f){if(!P95.on||CUT95.off||HEADLESS||(CUT95.only&&!CUT95.only.includes(f))||typeof createImageBitmap!=='function'||typeof fetch!=='function')return false;
  const u=assetURL(f);if(/^data:/.test(u))return true;return location.protocol==='http:'||location.protocol==='https:'}
/* cut95Cell — the blob URL of cell (col,row) of a cols×rows sheet, or null (then the sheet is used; the cut is queued) */
function cut95Cell(f,cols,rows,col,row){const k=f+'|'+cols+'|'+rows+'|'+col+'|'+row;const u=CUT95.url[k];if(u)return u;if(u===false)return null;
  if(!CUT95.pend[k]){if(!cut95Readable(f)){CUT95.url[k]=false;return null}CUT95.pend[k]=1;CUT95.want[k]=1;CUT95.q.push({k,f,cols,rows,col,row});if(!CUT95.busy)setTimeout(cut95Run,0)}
  return null}
/* THE CUTTER runs in a worker (its own thread: a busy match never starves it, and the page's thread never decodes a sheet): fetch →
   createImageBitmap → one OffscreenCanvas per cell → convertToBlob, each cell posted back as it is ready. No worker (or it fails) → the
   same steps on the page (canvas.toBlob). */
const CUT95_WK=`self.onmessage=async e=>{const {url,cells,png,qual,jpg}=e.data;let bmp=null;
  try{const r=await fetch(url);bmp=await createImageBitmap(await r.blob())}catch(err){self.postMessage({url,err:String(err),done:1});return}
  for(const c of cells){try{const cw=bmp.width/c.cols,ch=bmp.height/c.rows,w=Math.round(cw),h=Math.round(ch);const oc=new OffscreenCanvas(w,h);
      oc.getContext('2d').drawImage(bmp,c.col*cw,c.row*ch,cw,ch,0,0,w,h);const blob=await oc.convertToBlob({type:w*h<=png?'image/png':jpg?'image/jpeg':'image/webp',quality:qual});
      self.postMessage({url,k:c.k,blob})}catch(err){self.postMessage({url,k:c.k,err:String(err)})}}
  try{bmp.close()}catch(e){}self.postMessage({url,done:1})}`;
function cut95Worker(){if(CUT95.wk!==undefined)return CUT95.wk;CUT95.wk=null;
  try{if(typeof Worker!=='function'||typeof OffscreenCanvas!=='function')return null;const u=URL.createObjectURL(new Blob([CUT95_WK],{type:'text/javascript'}));
    const w=new Worker(u);w.onerror=()=>{CUT95.wk=null};CUT95.wk=w}catch(e){CUT95.wk=null}return CUT95.wk}
function cut95Got(k,blob){if(blob){CUT95.url[k]=URL.createObjectURL(blob);CUT95.made++;CUT95.any=true}else{CUT95.url[k]=false;CUT95.fail++}}
/* one sheet in the worker: resolves when every cell came back (false when the worker could not do it) */
function cut95InWorker(f,jobs){const w=cut95Worker();if(!w)return Promise.resolve(false);const url=new URL(assetURL(f),location.href).href;
  return new Promise(res=>{let left=new Set(jobs.map(j=>j.k)),ok=true;const T=setTimeout(()=>fin(false),60000);
    function fin(v){clearTimeout(T);w.removeEventListener('message',on);w.removeEventListener('error',bad);res(v&&ok)}
    function bad(){CUT95.wk=null;fin(false)}
    function on(e){const d=e.data;if(!d||d.url!==url)return;if(d.k){left.delete(d.k);cut95Got(d.k,d.blob||null)}
      if(d.done){if(d.err)ok=false;fin(true)}}
    w.addEventListener('message',on);w.addEventListener('error',bad);try{w.postMessage({url,cells:jobs.map(j=>({k:j.k,cols:j.cols,rows:j.rows,col:j.col,row:j.row})),png:CUT95.png,qual:CUT95.qual,jpg:/\.jpe?g$/i.test(f)})}catch(e){fin(false)}})}
/* the same on the page's thread */
async function cut95OnPage(f,jobs){let bmp=null;try{const res=await fetch(assetURL(f));bmp=await createImageBitmap(await res.blob())}catch(e){for(const j of jobs)cut95Got(j.k,null);return}
  for(const j of jobs){if(CUT95.url[j.k])continue;try{const cw=bmp.width/j.cols,ch=bmp.height/j.rows;const w=Math.round(cw),h=Math.round(ch);
      const cv2=document.createElement('canvas');cv2.width=w;cv2.height=h;cv2.getContext('2d').drawImage(bmp,j.col*cw,j.row*ch,cw,ch,0,0,w,h);
      const ty=w*h<=CUT95.png?'image/png':/\.jpe?g$/i.test(f)?'image/jpeg':'image/webp';const blob=await new Promise(r=>cv2.toBlob(r,ty,CUT95.qual));cut95Got(j.k,blob||null)}
    catch(e){cut95Got(j.k,null)}}
  try{bmp.close()}catch(e){}}
async function cut95Run(){if(CUT95.busy)return;CUT95.busy=true;CUT95.any=false;
  try{while(CUT95.q.length){const f=CUT95.q[0].f;const jobs=CUT95.q.filter(j=>j.f===f);CUT95.q=CUT95.q.filter(j=>j.f!==f);
    /* every cell of the sheet in one go: each sheet is decoded once a session */
    const {cols,rows}=jobs[0];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const k=f+'|'+cols+'|'+rows+'|'+c+'|'+r;if(!CUT95.pend[k]){CUT95.pend[k]=1;jobs.push({k,f,cols,rows,col:c,row:r})}}
    jobs.sort((x,y)=>(CUT95.want[y.k]?1:0)-(CUT95.want[x.k]?1:0)); /* the cells a panel asked for first */
    const done=await cut95InWorker(f,jobs);if(!done)await cut95OnPage(f,jobs.filter(j=>CUT95.url[j.k]===undefined))}}
  finally{CUT95.busy=false}
  /* the panels pick the cut-outs up at the next render; nudge one if nothing else will soon */
  if(CUT95.any&&!CUT95.refresh)CUT95.refresh=setTimeout(()=>{CUT95.refresh=0;try{if(typeof S!=='undefined'&&S&&!HEADLESS&&S.phase!=='setup')render()}catch(e){}},120)}
/* cardStyle / rtokHTML: the cell is known from the ref, so the sheet's style is rebuilt and matched as a whole (no scan of the
   standalone's multi-MB data: URIs); a style a later module changed (art81 files, a filter…) is left alone */
const CUT95_DATA=4096; /* a URL longer than this is a data: URI: matched by length, never read through */
function cut95Head(u,cols,rows,col,row,dec){const px=cols>1?col/(cols-1)*100:0,py=rows>1?row/(rows-1)*100:0;
  return `background-image:url('${u}');background-size:${cols*100}% ${rows*100}%;background-position:${dec==null?px:px.toFixed(dec)}% ${dec==null?py:py.toFixed(dec)}%`}
const cut95New=c=>`background-image:url('${c}');background-size:100% 100%;background-position:0% 0%`;
{const base=cardStyle;cardStyle=function(ref){const s=base.apply(this,arguments);
  try{if(!P95.on||typeof s!=='string'||!s||typeof ref!=='string')return s;const r=cardRef(ref);if(!r||!r.sh||r.i==null)return s;const sh=r.sh,i=r.i;
    const col=i%sh.cols,row=Math.floor(i/sh.cols),u=assetURL(sh.f);const head=cut95Head(u,sh.cols,sh.rows,col,row);const tail=`;aspect-ratio:${sh.ar}`;
    if(u.length>CUT95_DATA?s.length!==head.length+tail.length:!(s.startsWith(head)&&s.slice(head.length)===tail))return s;
    const c=cut95Cell(sh.f,sh.cols,sh.rows,col,row);return c?cut95New(c)+tail:s}catch(e){console.error(e);return s}}}
if(typeof rtokHTML==='function'&&typeof RTOK_NAMES!=='undefined'){const base=rtokHTML;rtokHTML=function(name){const s=base.apply(this,arguments);
  try{if(!P95.on||!s)return s;const i=RTOK_NAMES.indexOf(name);if(i<0)return s;const col=i%RTOK_COLS,row=Math.floor(i/RTOK_COLS);
    const head=cut95Head(assetURL('rtok.webp'),RTOK_COLS,RTOK_ROWS,col,row,3);const at=s.indexOf(head);if(at<0)return s;
    const c=cut95Cell('rtok.webp',RTOK_COLS,RTOK_ROWS,col,row);return c?s.slice(0,at)+cut95New(c)+s.slice(at+head.length):s}catch(e){console.error(e);return s}}}
/* the armor worn on the avatar: the whole sheet scaled and clipped → the piece's own cell, placed on the same pixels */
if(typeof armPieceSVG==='function'&&typeof ARM_SHEET!=='undefined'){const base=armPieceSVG;armPieceSVG=function(B){const s=base.apply(this,arguments);
  try{if(!P95.on||!B||!B.crop)return s;const href=assetURL(ARM_SHEET.f);const i=s.indexOf(_T('<image href="')+href+'"');if(i<0)return s;
    const cols=SHEETS.a.cols,rows=SHEETS.a.rows,cw=ARM_SHEET.w/cols,ch=ARM_SHEET.h/rows;const c=B.crop;const col=Math.floor((c[0]+0.5)/cw),row=Math.floor((c[1]+0.5)/ch);
    if((c[0]+c[2])>(col+1)*cw+0.5||(c[1]+c[3])>(row+1)*ch+0.5)return s; /* a crop across two cells: keep the sheet */
    const u=cut95Cell(ARM_SHEET.f,cols,rows,col,row);if(!u)return s;
    const k=B.w/c[2],x=B.cx-B.w/2,y=B.cy-B.h/2;
    return s.replace(/<image href="[^"]*" x="[^"]*" y="[^"]*" width="[^"]*" height="[^"]*"/,`<image href="${u}" x="${(x-(c[0]-col*cw)*k).toFixed(2)}" y="${(y-(c[1]-row*ch)*k).toFixed(2)}" width="${(cw*k).toFixed(1)}" height="${(ch*k).toFixed(1)}"`)}
  catch(e){console.error(e)}return s}}

/* ---------------- 4 · Fast = fewer extras ---------------- */
const p95Fast=()=>P95.on&&SPEED==='fast'&&typeof S!=='undefined'&&S&&!S.over;
{const base=renderBubbles;renderBubbles=function(){if(p95Fast()&&!HEADLESS){const box=document.getElementById('bubbles');if(box&&box.firstChild)box.textContent='';return}return base.apply(this,arguments)}}
if(typeof wagerBubble==='function'){const base=wagerBubble;wagerBubble=function(){if(p95Fast())return;return base.apply(this,arguments)}}
if(typeof cheer92OK==='function'){const base=cheer92OK;cheer92OK=function(){if(p95Fast())return false;return base.apply(this,arguments)}}
if(typeof LIFE84!=='undefined'){const d0=LIFE84.dustMs,s0=LIFE84.settleMs;
  Object.defineProperty(LIFE84,'dustMs',{configurable:true,get(){return p95Fast()?Math.round(d0/3):d0}});
  Object.defineProperty(LIFE84,'settleMs',{configurable:true,get(){return p95Fast()?Math.round(s0/3):s0}})}
{const base=fx;fx=function(r,c,text,color,opt){const n=typeof FX!=='undefined'?FX.length:0;const out=base.apply(this,arguments);
  try{if(p95Fast()&&!(opt&&opt.dur)&&FX.length>n)FX[FX.length-1].dur=600 /* TWEAK: a floating number at Fast (900 before, 1500 at Normal) */}catch(e){}return out}}

/* ---------------- 5 · layout once ---------------- */
(()=>{try{if(!P95.on||typeof ResizeObserver!=='function'||typeof cv==='undefined'||!cv)return;const wrap=cv.parentElement;if(!wrap)return;
  const d=Object.getOwnPropertyDescriptor(Element.prototype,'clientWidth');const keep={wrap:0,cv:0};
  let rq=0;const redraw=()=>{if(rq)return;rq=requestAnimationFrame(()=>{rq=0;try{if(typeof S!=='undefined'&&S&&!HEADLESS)draw()}catch(e){}})} /* deferred: drawing inside the callback resizes observed elements -> 'ResizeObserver loop' */;
  new ResizeObserver(()=>{const a=Math.round(d.get.call(wrap)),b=Math.round(d.get.call(cv));const ch=(keep.wrap&&a!==keep.wrap)||(keep.cv&&b!==keep.cv);keep.wrap=a;keep.cv=b;if(ch)redraw()}).observe(wrap);
  new ResizeObserver(()=>{const b=Math.round(d.get.call(cv));const ch=keep.cv&&b!==keep.cv;keep.cv=b;if(ch)redraw()}).observe(cv);
  const own=Object.getOwnPropertyDescriptor(wrap,'clientWidth'); /* 160's phone keeper, if any */
  Object.defineProperty(wrap,'clientWidth',{configurable:true,get(){return P95.on&&keep.wrap?keep.wrap:own&&own.get?own.get.call(this):d.get.call(this)}});
  Object.defineProperty(cv,'clientWidth',{configurable:true,get(){return P95.on&&keep.cv?keep.cv:d.get.call(this)}});
  P95.keep=keep}catch(e){console.error(e)}})();
const FIT95={off:(()=>{try{return localStorage.getItem('flavius_fit95off')==='1'}catch(e){return false}})() /* debug */,v:null,key:'',obs:null,seen:new WeakSet()};
function fit95Key(){const b=document.body.classList;return innerWidth+'x'+innerHeight+'|'+(typeof STANDS!=='undefined'?STANDS:'')+'|'+(b.contains('phoneL')?1:0)+(b.contains('phoneP2')?1:0)+(b.contains('phoneP')?1:0)}
function fit95Watch(){if(typeof ResizeObserver!=='function')return;if(!FIT95.obs)FIT95.obs=new ResizeObserver(()=>{if(FIT95.v==null)return;
    try{const was=FIT95.v;FIT95.v=FIT95.base();FIT95.key=fit95Key();if(FIT95.v!==was&&typeof S!=='undefined'&&S&&!HEADLESS)requestAnimationFrame(()=>{try{draw()}catch(e){}})}catch(e){}});
  for(const el of [cv&&cv.parentElement,document.querySelector('.dock'),document.getElementById('actions'),document.getElementById('hover'),document.querySelector('.bar'),document.getElementById('crowdTick')])
    if(el&&!FIT95.seen.has(el)){FIT95.seen.add(el);FIT95.obs.observe(el)}}
if(typeof fitReserve==='function'){const base=fitReserve;FIT95.base=()=>base();fitReserve=function(){if(!P95.on||FIT95.off||typeof ResizeObserver!=='function')return base.apply(this,arguments);
  /* 163's bar keeper (the top bar holds the tallest height it had) measured on every draw; the status chips change only in a render, so it
     measures there (the draw inside render, as before — the bar keeps exactly the height it kept) and never in animation frames */
  if(P95.act.status&&typeof bar88Hold==='function')bar88Hold();
  const key=fit95Key();if(FIT95.v==null||key!==FIT95.key){FIT95.v=base.apply(this,arguments);FIT95.key=key;fit95Watch()}return FIT95.v}
  addEventListener('resize',()=>{FIT95.v=null})}

/* ---------------- 7 · the menu show: decoded figures, drawn from a raster ---------------- */
const MM95={ready:false,ras:new WeakMap()};
function mm95Images(){const out=[];try{const cls9=(typeof BASE_CLS!=='undefined'?BASE_CLS:[]).slice(0,8);
    const specs=cls9.map(k=>tokenForCls(k)).concat(['zora','bear','wolf','snake','lion','tholo','commodus'].map(t=>tokenForNPC({t})));
    try{specs.push({...tokenForNPC({t:'commodus'}),raise:1})}catch(e){}
    for(const sp of specs){if(!sp)continue;tokenImg(sp);const key=JSON.stringify(sp);
      for(const C of [typeof TOKEN_IMG3!=='undefined'?TOKEN_IMG3:null,typeof TOKEN_IMG!=='undefined'?TOKEN_IMG:null])if(C&&C[key])out.push(C[key])}}catch(e){}return out}
if(typeof menuShow==='function'){const base=menuShow;menuShow=function(){const r=base.apply(this,arguments);
  try{if(!P95.on||MM95.ready||HEADLESS)return r;const ims=mm95Images();if(!ims.length){MM95.ready=true;return r}
    if(MM.raf){cancelAnimationFrame(MM.raf);MM.raf=0}
    const one=im=>im.complete&&im.naturalWidth?(im.decode?im.decode().catch(()=>{}):null):new Promise(res=>{im.addEventListener('load',()=>{(im.decode?im.decode():Promise.resolve()).catch(()=>{}).then(res)},{once:true});im.addEventListener('error',res,{once:true})});
    Promise.race([Promise.all(ims.map(one)),new Promise(res=>setTimeout(res,1500))]).then(()=>{MM95.ready=true;const m=document.getElementById('mainMenu');
      if(!m||m.hidden||MM.raf)return;MM.t0=performance.now();MM.raf=requestAnimationFrame(mmLoop)})}catch(e){console.error(e)}return r}}
/* a figure's SVG is rasterised once at the largest size the show asks for, then drawn as a bitmap */
function mm95Raster(im,h){if(!im||!im.naturalWidth||typeof im.getContext==='function')return im;const want=Math.ceil(h*1.1); /* h is in the menu canvas's own pixels */
  let r=MM95.ras.get(im);if(r&&r.height>=want)return r;r=document.createElement('canvas');r.height=Math.max(want,8);r.width=Math.ceil(r.height*100/170);
  try{r.getContext('2d').drawImage(im,0,0,r.width,r.height)}catch(e){return im}MM95.ras.set(im,r);return r}
if(typeof mmFig==='function'){const base=mmFig;mmFig=function(c2,cls,x,y,h,rot,alpha,npc){if(!P95.on)return base.apply(this,arguments);
  const im=typeof tokenImg==='function'&&typeof tokenForCls==='function'?tokenImg(npc?tokenForNPC({t:cls}):tokenForCls(cls)):null;
  c2.save();c2.globalAlpha=alpha;c2.fillStyle='rgba(0,0,0,.3)';c2.beginPath();c2.ellipse(x,y,h*0.2,h*0.07,0,0,Math.PI*2);c2.fill();
  if(im){const w=h*100/170;c2.translate(x,y);if(rot)c2.rotate(rot);c2.drawImage(mm95Raster(im,h),-w/2,-h*(157/170),w,h)}
  c2.restore()}}

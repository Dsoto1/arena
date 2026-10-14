/* tools/node/page.js — THE GAME IN NODE (v1.01 wave 2, Phase D1 of tools/plans/layers100/PLAN.md): the built script in a `vm` context
   behind a stub page (tools/node/dom.js), on a VIRTUAL CLOCK.
     const P = await openGame({page, ls, t0, verbose})   → {G, run, until, ev, errors, close}
       page  the built flavius-arena.html (its <script> is extracted) — or {code, markup} from a bundle (server/verify/rules.js)
       ls    localStorage seed (flavius_* keys), t0 the virtual epoch (ms; default the real now)
     P.G           the page's global (G.S, G.RNG, G.onlHash …); P.ev(src) evaluates in the page (let/const globals included)
     P.until(fn, maxMs)  runs the page's timers in VIRTUAL time until fn() is true (true) or nothing is left / maxMs of page time (false)
   THE CLOCK: setTimeout/setInterval/requestAnimationFrame/requestIdleCallback, Date and performance.now are the page's own: nothing waits
   for real time, the clock jumps to the next timer once every microtask has run. So a 2.5 s settle wait or a Fast frame costs no real time,
   and a run is the same every time (Math.random is a seeded stream here — UI cosmetics only, never the rules' dice). */
'use strict';
const vm=require('vm'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {makeDOM}=require('./dom.js');

/* the page parts of a built flavius-arena.html: the static markup before the main <script>, and that script */
function splitPage(html){const i=html.indexOf('\n<script>\n');if(i<0)throw new Error('no main <script> in the page');
  const j=html.lastIndexOf('</script>');return {markup:html.slice(0,i),code:html.slice(i+'\n<script>\n'.length,j)}}
let SCRIPT_CACHE=new Map();
function compiled(code,file){let s=SCRIPT_CACHE.get(code);if(!s){s=new vm.Script(code,{filename:file||'flavius-arena.js'});SCRIPT_CACHE.clear();SCRIPT_CACHE.set(code,s)}return s}

async function openGame(o={}){
  const pageFile=typeof o.page==='string'?path.resolve(o.page):null;const parts=pageFile?splitPage(fs.readFileSync(pageFile,'utf8')):o.page;
  const dir=pageFile?path.dirname(pageFile):(o.dir||null); /* a bundle (no page file) reads no local files: same run whatever the cwd */
  /* ---------------- the clock ---------------- */
  const T0=o.t0!=null?+o.t0:Date.now();let now=0,seq=0;const Q=[];const errors=[];
  const add=(fn,ms,args,rep)=>{const id=++seq;const t={id,at:now+Math.max(0,+ms||0),fn,args,rep:rep?Math.max(1,+ms||0):0,seq:id};let k=Q.length;while(k>0&&(Q[k-1].at>t.at))k--;Q.splice(k,0,t);return id};
  /* every clock read moves time on by a microsecond: a loop that polls the clock between microtasks (await of a resolved sleep) still ends */
  const read=()=>(now+=0.001);
  const clear=id=>{const k=Q.findIndex(t=>t.id===id);if(k>=0)Q.splice(k,1)};
  /* seeded Math.random for the page (cosmetic only) */
  let ms=(o.mathSeed>>>0)||0x9e3779b9;const mrand=()=>{ms=(ms+0x6D2B79F5)>>>0;let t=ms;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};
  /* ---------------- window ---------------- */
  const win={};const onErr=e=>{errors.push(e);if(o.verbose)console.error('[page]',e&&e.stack||e);try{const ev=new win.Event('error');ev.error=e;ev.message=e&&e.message;win.__wt.dispatchEvent(ev)}catch(x){}};
  win.__onErr=onErr;
  const D=makeDOM(win);const doc=D.doc;win.__wt=new D.Node();
  class Event{constructor(t,i){i=i||{};this.type=t;this.bubbles=!!i.bubbles;this.cancelable=!!i.cancelable;this.defaultPrevented=false;this.isTrusted=false;this.timeStamp=now;Object.assign(this,i)}
    preventDefault(){if(this.cancelable!==false)this.defaultPrevented=true}stopPropagation(){this._stop=true}stopImmediatePropagation(){this._stop=this._stopNow=true}composedPath(){return []}}
  class UIE extends Event{constructor(t,i){super(t,{clientX:0,clientY:0,button:0,buttons:0,key:'',code:'',shiftKey:false,ctrlKey:false,altKey:false,metaKey:false,deltaY:0,pointerId:1,pointerType:'mouse',...(i||{})})}}
  const storage=()=>{const m=new Map();const api={getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>{m.set(String(k),String(v))},removeItem:k=>{m.delete(String(k))},clear:()=>m.clear(),key:i=>[...m.keys()][i]??null,get length(){return m.size}};
    return new Proxy(api,{get:(t,k)=>k in t?t[k]:typeof k==='string'?(m.has(k)?m.get(k):undefined):undefined,set:(t,k,v)=>{m.set(String(k),String(v));return true},
      ownKeys:()=>[...m.keys()],getOwnPropertyDescriptor:(t,k)=>m.has(k)?{enumerable:true,configurable:true,value:m.get(k)}:undefined,has:(t,k)=>k in t||m.has(k),deleteProperty:(t,k)=>{m.delete(k);return true}})};
  const LS=storage(),SS=storage();for(const [k,v] of Object.entries(o.ls||{}))LS.setItem(k,v);
  const BC=new Map();class BroadcastChannel{constructor(n){this.name=n;this.onmessage=null;(BC.get(n)||BC.set(n,new Set()).get(n)).add(this);this._et=new D.Node()}
    postMessage(data){for(const c of BC.get(this.name)||[])if(c!==this)add(()=>{const e=new Event('message');e.data=data;if(c.onmessage)c.onmessage(e);c._et.dispatchEvent(e)},0)}
    close(){const s=BC.get(this.name);if(s)s.delete(this)}addEventListener(t,f,x){this._et.addEventListener(t,f,x)}removeEventListener(t,f,x){this._et.removeEventListener(t,f,x)}}
  const fileOf=u=>{if(!dir)return null;u=String(u||'');if(/^(https?:|data:|blob:)/.test(u)&&!u.startsWith('file:'))return null;u=u.replace(/^file:\/\//,'').split(/[?#]/)[0];const f=path.isAbsolute(u)?u:path.join(dir,u);return f.startsWith(dir)&&fs.existsSync(f)&&fs.statSync(f).isFile()?f:null};
  const resp=(ok,buf)=>({ok,status:ok?200:404,statusText:ok?'OK':'Not Found',headers:{get:()=>null},text:async()=>ok?buf.toString():'',json:async()=>JSON.parse(ok?buf.toString():'null'),arrayBuffer:async()=>ok?buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.length):new ArrayBuffer(0),blob:async()=>new Blob(ok?[buf]:[])});
  const fetchFn=u=>new Promise(res=>{const f=fileOf(typeof u==='string'?u:u&&u.url);add(()=>res(resp(!!f,f?fs.readFileSync(f):Buffer.alloc(0))),1)});
  class Image{constructor(w,h){this._a={};this.width=w||0;this.height=h||0;this.naturalWidth=0;this.naturalHeight=0;this.complete=false;this.onload=null;this.onerror=null;this._et=new D.Node();this.style={}}
    get src(){return this._src||''}set src(v){this._src=String(v);this.complete=false;const ok=/^(data:|blob:)/.test(this._src)||!!fileOf(this._src);
      add(()=>{this.complete=true;if(ok){this.naturalWidth=this.naturalWidth||64;this.naturalHeight=this.naturalHeight||64;if(!this.width)this.width=64;if(!this.height)this.height=64}
        const e=new Event(ok?'load':'error');const h=ok?this.onload:this.onerror;try{if(h)h.call(this,e);this._et.dispatchEvent(e)}catch(x){onErr(x)}},2)}
    decode(){return new Promise(r=>add(r,2))}setAttribute(k,v){this._a[k]=v;if(k==='src')this.src=v}getAttribute(k){return this._a[k]??null}
    addEventListener(t,f,x){this._et.addEventListener(t,f,x)}removeEventListener(t,f,x){this._et.removeEventListener(t,f,x)}}
  const mq=q=>({matches:/max-width:\s*[0-9]{4,}|min-width:\s*[0-9]{1,3}px|pointer:\s*fine|hover:\s*hover|orientation:\s*landscape/.test(q),media:q,onchange:null,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}});
  const nothing=class{constructor(){}observe(){}unobserve(){}disconnect(){}takeRecords(){return []}};
  let blobN=0;const URLc=class extends URL{};URLc.createObjectURL=()=>'blob:node/'+(++blobN);URLc.revokeObjectURL=()=>{};
  const cons=o.console||{log:(...a)=>{if(o.verbose)console.log('[page]',...a)},info:(...a)=>{if(o.verbose)console.log('[page]',...a)},debug(){},trace(){},
    warn:(...a)=>{if(o.verbose)console.warn('[page]',...a)},error:(...a)=>{errors.push(a.map(x=>x&&x.stack||String(x)).join(' '));if(o.verbose)console.error('[page]',...a)},
    group(){},groupCollapsed(){},groupEnd(){},table(){},time(){},timeEnd(){},count(){},assert(){},dir(){}};
  Object.assign(win,{document:doc,console:cons,localStorage:LS,sessionStorage:SS,BroadcastChannel,Image,HTMLImageElement:Image,Event,CustomEvent:Event,MouseEvent:UIE,PointerEvent:UIE,KeyboardEvent:UIE,
    WheelEvent:UIE,TouchEvent:UIE,FocusEvent:UIE,InputEvent:UIE,Node:D.Node,Element:D.Element,HTMLElement:D.Element,HTMLCanvasElement:D.Canvas,Text:D.Text,DocumentFragment:D.Fragment,
    NodeFilter:{FILTER_ACCEPT:1,FILTER_REJECT:2,FILTER_SKIP:3,SHOW_ALL:0xFFFFFFFF,SHOW_ELEMENT:1,SHOW_TEXT:4,SHOW_COMMENT:128},
    MutationObserver:nothing,ResizeObserver:nothing,IntersectionObserver:nothing,PerformanceObserver:class extends nothing{static get supportedEntryTypes(){return []}},
    FileReader:class{constructor(){this.result=null;this.onload=null;this.onerror=null;this.onloadend=null}_done(r){this.result=r;add(()=>{const e=new Event('load');if(this.onload)this.onload(e);if(this.onloadend)this.onloadend(e)},1)}
      readAsDataURL(){this._done('data:application/octet-stream;base64,')}readAsText(){this._done('')}readAsArrayBuffer(){this._done(new ArrayBuffer(0))}abort(){}addEventListener(t,f){if(t==='load')this.onload=f}},
    Blob,File:typeof File!=='undefined'?File:Blob,URL:URLc,URLSearchParams,TextEncoder,TextDecoder,AbortController,Headers:typeof Headers!=='undefined'?Headers:undefined,
    atob,btoa,crypto:crypto.webcrypto,queueMicrotask,structuredClone,fetch:fetchFn,
    navigator:{userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0 Safari/537.36 FlaviusNode',language:'en-US',languages:['en-US','en'],
      webdriver:o.webdriver!==false,onLine:true,hardwareConcurrency:4,deviceMemory:8,maxTouchPoints:0,platform:'Linux x86_64',vendor:'Google Inc.',cookieEnabled:true,
      clipboard:{writeText:()=>Promise.resolve(),readText:()=>Promise.resolve('')},storage:{persist:()=>Promise.resolve(false),persisted:()=>Promise.resolve(false),estimate:()=>Promise.resolve({usage:0,quota:1e9})},
      vibrate:()=>false,sendBeacon:()=>true,getGamepads:()=>[],permissions:{query:()=>Promise.resolve({state:'denied',addEventListener(){}})},userActivation:{isActive:false,hasBeenActive:false}},
    location:{href:pageFile?'file://'+pageFile:'file:///flavius-arena.html',protocol:'file:',host:'',hostname:'',port:'',origin:'null',pathname:pageFile||'/flavius-arena.html',search:'',hash:'',
      reload(){},assign(){},replace(){},toString(){return this.href}},
    history:{length:1,state:null,pushState(){},replaceState(){},back(){},forward(){},go(){}},
    screen:{width:1280,height:720,availWidth:1280,availHeight:720,colorDepth:24,orientation:{type:'landscape-primary',angle:0,addEventListener(){},removeEventListener(){}}},
    innerWidth:1280,innerHeight:720,outerWidth:1280,outerHeight:720,devicePixelRatio:1,scrollX:0,scrollY:0,pageXOffset:0,pageYOffset:0,
    visualViewport:{width:1280,height:720,scale:1,offsetLeft:0,offsetTop:0,addEventListener(){},removeEventListener(){}},
    matchMedia:mq,getComputedStyle:el=>{const s=el&&el.style||{};return new Proxy({},{get:(t,k)=>k==='getPropertyValue'?(p=>s[p]||''):typeof k==='string'?(s[k]||''):undefined})},
    alert(){},confirm:()=>false,prompt:()=>null,open:()=>null,close(){},print(){},focus(){},blur(){},scrollTo(){},scrollBy(){},stop(){},postMessage(){},
    getSelection:()=>doc.getSelection(),
    addEventListener:(t,f,x)=>win.__wt.addEventListener(t,f,x),removeEventListener:(t,f,x)=>win.__wt.removeEventListener(t,f,x),dispatchEvent:e=>win.__wt.dispatchEvent(e),
    setTimeout:(fn,ms,...a)=>typeof fn==='function'?add(fn,ms,a,false):0,setInterval:(fn,ms,...a)=>typeof fn==='function'?add(fn,ms,a,true):0,clearTimeout:clear,clearInterval:clear,
    requestAnimationFrame:fn=>{const f=()=>fn(now);f._src=fn;return add(f,16-(now%16)||16,[],false)},cancelAnimationFrame:clear,
    requestIdleCallback:fn=>add(()=>fn({didTimeout:false,timeRemaining:()=>12}),1,[],false),cancelIdleCallback:clear,setImmediate:fn=>add(fn,0,[],false),
    performance:{now:()=>read(),timeOrigin:T0,mark(){},measure(){},getEntriesByName:()=>[],getEntriesByType:()=>[],clearMarks(){},clearMeasures(){},memory:{usedJSHeapSize:0,totalJSHeapSize:0,jsHeapSizeLimit:1}},
    CSS:{supports:()=>false,escape:s=>String(s).replace(/([^\w-])/g,'\\$1')}});
  const ctx=vm.createContext(win,{name:'flavius'});
  /* the page realm's Date and Math.random follow the virtual clock / the seeded stream */
  vm.runInContext(`(function(T,R){const D0=Date;function D(...a){if(!new.target)return new D0(T()).toString();return a.length?new D0(...a):new D0(T())}
    /* Array.prototype.sort as CHROMIUM sorts: since V8 ~13 an array shorter than 8 is a plain binary insertion sort from index 1; Node 22's
       V8 12 runs TimSort's run detection first. The rules sort with random comparators ((a,b)=>…+rand()) — a different comparison
       sequence draws different dice, so Node must compare in Chromium's order. 8 and longer: the same TimSort in both. */
    {const s0=Array.prototype.sort;const def=(a,b)=>{const x=String(a),y=String(b);return x<y?-1:x>y?1:0};
      const sort=function(cmp){if(cmp!==undefined&&typeof cmp!=='function')return s0.call(this,cmp);const n=this.length>>>0;if(n>=8||n<2)return s0.call(this,cmp);
        const v=[];let und=0;for(let i=0;i<n;i++){if(!(i in this))continue;const x=this[i];if(x===undefined)und++;else v.push(x)}const c=cmp||def;
        for(let st=1;st<v.length;st++){const pv=v[st];let l=0,r=st;while(l<r){const m=l+((r-l)>>1);const o=+c(pv,v[m]);if(o<0)r=m;else l=m+1}for(let p=st;p>l;p--)v[p]=v[p-1];v[l]=pv}
        let k=0;for(const x of v)this[k++]=x;for(let j=0;j<und;j++)this[k++]=undefined;for(;k<n;k++)delete this[k];return this};
      Object.defineProperty(Array.prototype,'sort',{value:sort,writable:true,configurable:true});
      Object.defineProperty(Array.prototype,'toSorted',{value:function(c){return sort.call(Array.from(this),c)},writable:true,configurable:true})}
    D.prototype=D0.prototype;D.now=()=>T();D.UTC=D0.UTC;D.parse=D0.parse;Object.defineProperty(D.prototype,'constructor',{value:D,configurable:true,writable:true});globalThis.Date=D;Math.random=R;
    globalThis.window=globalThis.self=globalThis.top=globalThis.parent=globalThis.globalThis=globalThis;globalThis.frames=globalThis})`,ctx)(()=>T0+read(),mrand);
  const G=vm.runInContext('globalThis',ctx);
  const onRej=(r,p)=>{onErr(r instanceof Error?r:new Error('unhandled rejection: '+(r&&r.message||r)));try{const e=new Event('unhandledrejection');e.reason=r;e.promise=p;win.__wt.dispatchEvent(e)}catch(x){}};
  process.on('unhandledRejection',onRej);
  /* ---------------- run ---------------- */
  const flush=()=>new Promise(r=>setImmediate(r));
  let steps=0;const TRACE=process.env.NODE_TRACE?fs.openSync(process.env.NODE_TRACE,'w'):0;
  async function step(){await flush();const t=Q.shift();if(!t)return false;if(t.at>now)now=t.at;steps++;if(t.rep){t.at=now+t.rep;let k=Q.length;while(k>0&&Q[k-1].at>t.at)k--;Q.splice(k,0,t)}
    if(TRACE)fs.writeSync(TRACE,now+' '+String(t.fn._src||t.fn).slice(0,160).replace(/\s+/g,' ')+'\n');
    try{t.fn.apply(null,t.args||[])}catch(e){onErr(e)}return true}
  async function until(fn,maxMs=600000){const end=now+maxMs;for(;;){await flush();try{if(fn())return true}catch(e){}if(!Q.length||Q[0].at>end){if(Q.length)now=end;return false}await step()}}
  const ev=src=>vm.runInContext(src,ctx);
  /* load: markup, then the script (as the browser runs it: once, top to bottom), then DOMContentLoaded + load */
  D.loadMarkup(parts.markup||'');
  if(o.draw!==true)G.FLAVIUS_NODE=true; /* 07-ui draw() returns at once: the board is never painted in Node */
  if(o.before)o.before(G,ev);
  compiled(parts.code,pageFile?pageFile.replace(/\.html$/,'.js'):'rules.js').runInContext(ctx);
  doc.readyState='interactive';doc.dispatchEvent(new Event('DOMContentLoaded',{bubbles:true}));doc.readyState='complete';
  add(()=>{try{win.__wt.dispatchEvent(new Event('load'))}catch(e){onErr(e)}},0);
  return {G,ev,until,step,errors,now:()=>now,clock:()=>T0+now,queue:()=>Q.length,steps:()=>steps,ctx,
    close(){process.off('unhandledRejection',onRej);Q.length=0}}}
module.exports={openGame,splitPage};

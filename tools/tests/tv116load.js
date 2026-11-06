/* v1.16 C2 (his 3a, 2026-11-06): MEASURES the time to the main menu on a mid-phone profile and prints it. TOOLING ONLY, no game change.
   Profile: Chromium, viewport 390x844, deviceScaleFactor 2, mobile+touch; CDP Emulation.setCPUThrottlingRate x4;
   Network.emulateNetworkConditions = DevTools "Slow 4G": 1.6 Mbit/s down (200000 B/s), 750 kbit/s up (93750 B/s), 150 ms RTT.
   file:// bypasses network throttling, so the repo root is served over http by a tiny Node server inside the test (assets/ resolve).
   The server gzips flavius-arena.html (like CloudFront does; compressed once, cached), so the throttled transfer is the gz size.
   Measures (ms from navigation start, via performance.now() polled every 25 ms in the page): ready = window.FLAVIUS_READY,
   menu = '#mainMenu [data-mm="play"]' (Play Now) visible. Prints ONE line: LOAD390 ready=<ms> menu=<ms> html=<raw bytes> gz=<gzip bytes>.
   NO time gate yet (the number decides a later question): fails only on page errors or when the menu does not appear within 120 s.
   argv[2] = page path (repo's flavius-arena.html); argv[3] = 'nothrottle' for the un-throttled comparison run. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),zlib=require('zlib');
const page=path.resolve(process.argv[2]||path.join(__dirname,'..','..','flavius-arena.html')),ROOT=path.dirname(page),NOTHROT=process.argv[3]==='nothrottle';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.css':'text/css','.woff2':'font/woff2'};
const raw=fs.readFileSync(page),gz=zlib.gzipSync(raw,{level:6}),NAME=path.basename(page);
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/'+NAME;const f=path.join(ROOT,u);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  const h={'Content-Type':MIME[path.extname(f)]||'application/octet-stream'};
  if(f===page){if(/gzip/.test(q.headers['accept-encoding']||'')){h['Content-Encoding']='gzip';h['Content-Length']=gz.length;r.writeHead(200,h);return r.end(gz)}h['Content-Length']=raw.length;r.writeHead(200,h);return r.end(raw)}
  fs.createReadStream(f).pipe(r.writeHead(200,h))});
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const port=srv.address().port;
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
await ctx.addInitScript(()=>{try{Object.defineProperty(navigator,'webdriver',{get:()=>false})}catch(e){}try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}
  const T=window.__T={ready:null,menu:null};const t=setInterval(()=>{const n=performance.now();
    if(T.ready==null&&window.FLAVIUS_READY)T.ready=n;
    if(T.menu==null){const el=document.querySelector('#mainMenu [data-mm="play"]');if(el){const r=el.getBoundingClientRect(),s=getComputedStyle(el);if(r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!el.closest('[hidden]'))T.menu=n}}
    if(T.ready!=null&&T.menu!=null)clearInterval(t)},25)});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
const cdp=await ctx.newCDPSession(pg);
if(!NOTHROT){await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1.6e6/8,uploadThroughput:750e3/8})}
pg.goto('http://127.0.0.1:'+port+'/',{waitUntil:'commit',timeout:120000}).catch(e=>errs.push('goto '+e.message));
let T=null;const t0=Date.now();
while(Date.now()-t0<120000){T=await pg.evaluate(()=>window.__T).catch(()=>null);if(T&&T.ready!=null&&T.menu!=null)break;await new Promise(r=>setTimeout(r,250))}
const ok=T&&T.menu!=null&&T.ready!=null;
if(!ok)errs.push('main menu did not appear within 120 s '+JSON.stringify(T));
console.log('LOAD390'+(NOTHROT?'(nothrottle)':'')+' ready='+(ok?Math.round(T.ready):'NA')+' menu='+(ok?Math.round(T.menu):'NA')+' html='+raw.length+' gz='+gz.length);
console.log('ERRS',JSON.stringify(errs));await b.close();srv.close();process.exit(errs.length?1:0)})().catch(e=>{console.log('ERRS',JSON.stringify([String(e)]));process.exit(1)});

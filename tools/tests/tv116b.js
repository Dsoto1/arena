/* v1.16a boot cover (01-head): (a) English line + cover lifts when ready, (b) the line is in the saved language BEFORE ready (es, ja, zh, fr),
   (c) the cover is still up at 13 s of a stalled load (the old 12 s hide is gone), (d) a script error before ready hides the cover
   (simulated ErrorEvent during a stall + a real syntax error build), (e) kill switch flavius_v116abootoff=1 (no line, old 12 s hide), no page errors.
   The page is served over http; the first 200 KB (head + cover + tiny script) arrive, then the server stalls ?stall=ms before the rest.
   argv[2] = page path. V116B_SHOT=<dir> also saves screenshots of the cover during a stall. */
const {chromium}=require('./_browser'),http=require('http'),fs=require('fs'),path=require('path');
const page=path.resolve(process.argv[2]||path.join(__dirname,'..','..','flavius-arena.html')),ROOT=path.dirname(page),NAME=path.basename(page);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const raw=fs.readFileSync(page);
const bad=Buffer.from(raw.toString('latin1').replace('<script>\n','<script>\n)(;\n'),'latin1');
const socks=new Set();
const srv=http.createServer((q,r)=>{const U=new URL(q.url,'http://x');let u=decodeURIComponent(U.pathname);if(u==='/')u='/'+NAME;
  if(u==='/'+NAME){const st=+U.searchParams.get('stall')||0,buf=U.searchParams.get('syntax')?bad:raw;r.writeHead(200,{'Content-Type':MIME['.html'],'Content-Length':buf.length});
    if(!st)return r.end(buf);r.write(buf.subarray(0,200000));const t=setTimeout(()=>{try{r.end(buf.subarray(200000))}catch(e){}},st);r.on('close',()=>clearTimeout(t));return}
  const f=path.join(ROOT,u);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
srv.on('connection',s=>{socks.add(s);s.on('close',()=>socks.delete(s))});
const errs=[],sleep=ms=>new Promise(r=>setTimeout(r,ms));
const chk=(c,m)=>{if(!c)errs.push(m)};
const cover=pg=>pg.evaluate(()=>{const b=document.getElementById('boot');if(!b)return null;const s=getComputedStyle(b),l=b.querySelector('b');
  return{out:b.classList.contains('out'),op:+s.opacity,vis:s.visibility,line:l?l.textContent:null,lineHidden:l?getComputedStyle(l).display==='none':null}}).catch(()=>null);
const up=c=>c&&!c.out&&c.op===1&&c.vis==='visible';
(async()=>{await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+srv.address().port+'/';
const b=await chromium.launch();
async function open(w,h,lang,off,qs){const ctx=await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(([lang,off])=>{try{Object.defineProperty(navigator,'webdriver',{get:()=>false})}catch(e){}try{localStorage.setItem('flavius_firstrun','shown');if(lang)localStorage.setItem('flavius_lang',lang);if(off)localStorage.setItem('flavius_v116abootoff','1')}catch(e){}},[lang,off]);
  const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>{if(!/syntax=1/.test(qs||'')&&!/boom/.test(e.message))errs.push('pageerror '+e.message)});
  pg.goto(base+qs,{waitUntil:'commit',timeout:60000}).catch(()=>{});return{ctx,pg}}
const shot=process.env.V116B_SHOT;
/* a + b: line text during a stall, then ready and the cover lifts */
const langs=[['','Opening the arena…'],['es','Abriendo la arena…'],['ja','アリーナを開いています…'],['zh','正在打开竞技场…'],['fr','Ouverture de l\'arène…']];
await Promise.all(langs.map(async([lang,txt])=>{const{ctx,pg}=await open(390,844,lang,false,'?stall=2500');
  await sleep(1200);const c=await cover(pg);chk(up(c),'cover not up during stall '+lang);chk(c&&c.line===txt,'line '+(lang||'en')+' = '+(c&&c.line));
  if(shot&&(lang===''||lang==='ja'))await pg.screenshot({path:path.join(shot,'cover390-'+(lang||'en')+'.png')});
  if(!lang){const p2=await open(1440,900,'',false,'?stall=2500');await sleep(1200);if(shot)await p2.pg.screenshot({path:path.join(shot,'cover1440.png')});
    await p2.pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000}).catch(()=>errs.push('no ready 1440'));await p2.ctx.close()}
  await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000}).catch(()=>errs.push('not ready '+lang));
  await pg.waitForFunction(()=>{const e=document.getElementById('boot');return !e||e.classList.contains('out')},null,{timeout:10000}).catch(()=>errs.push('cover did not lift when ready '+lang));
  await ctx.close()}));
/* c + e: 13 s into a 14 s stall */
const [C,E]=await Promise.all([open(390,844,'',false,'?stall=14000'),open(390,844,'',true,'?stall=14000')]);
await sleep(1000);const e0=await cover(E.pg);chk(e0&&e0.lineHidden===true,'kill switch: line should be hidden');
await sleep(12000);
const c13=await cover(C.pg),e13=await cover(E.pg);
chk(up(c13),'(c) cover gone at 13 s of a stalled load '+JSON.stringify(c13));
chk(e13&&e13.out,'(e) kill switch: old 12 s hide missing '+JSON.stringify(e13));
await C.ctx.close();await E.ctx.close();
/* d: an image error does not hide it, a simulated script error does (after 1.5 s), and a real syntax error build */
{const{ctx,pg}=await open(390,844,'',false,'?stall=6000');await sleep(800);
  await pg.evaluate(()=>{const i=document.createElement('img');i.src='/nope.png';document.body.appendChild(i)});await sleep(1500);
  chk(up(await cover(pg)),'(d) an image error must not hide the cover');
  await pg.evaluate(()=>window.dispatchEvent(new ErrorEvent('error',{message:'boom'})));await sleep(700);chk(up(await cover(pg)),'(d) cover hid before 1.5 s');
  await sleep(1300);const c=await cover(pg);chk(c&&c.out,'(d) script error did not hide the cover '+JSON.stringify(c));await ctx.close()}
{const{ctx,pg}=await open(390,844,'',false,'?syntax=1');await sleep(3500);const c=await cover(pg);chk(c&&c.out,'(d) syntax-error build: cover still up '+JSON.stringify(c));await ctx.close()}
console.log('ERRS',JSON.stringify(errs));await b.close();socks.forEach(s=>s.destroy());srv.close();process.exit(errs.length?1:0)})().catch(e=>{console.log('ERRS',JSON.stringify([String(e)]));process.exit(1)});

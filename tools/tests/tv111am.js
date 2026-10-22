/* v1.11 art PREVIEW · THE AMPHITHEATRE (419-v111amph, pass 7: the near façade + the grand stair; tools/plans/v111/AMPH.md). Checks:
   PASS 8 final (his pick 2026-10-22): today's framing in EVERY window — the pass 7 tall-window canvas growth is gone.
   (1) flag OFF (no flavius_amph111): nothing installed (AMPH111.on false), the canvas framing (TW, OX, OY, height) is the formula's own;
   (2) flag ON in a TALL window (1440×1200): every bake layer loads (stone bench cloth fixed fire glow + the front mask) and the framing
       (TW, OX, OY, canvas height) is identical to flag off;
   (3) flag ON in a SHORT window (1440×900) and on a PHONE (390×844): the framing is identical to flag off;
   (4) clicking a tile in the tall flagged view selects that tile (near the corners + the middle: pick() follows the same OX/OY/TW);
   (5) no console errors.
   node tools/tests/tv111am.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const TYPES={'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,400))};
const TALL={viewport:{width:1440,height:1200}},SHORT={viewport:{width:1440,height:900}},PHONE={viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true};
const open=async(ls,view)=>{const c=await b.newContext(view);await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|Failed to load resource/.test(m.text()))errs.push('console: '+m.text().slice(0,200))});
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in o)localStorage.setItem(k,o[k])},ls);
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(250)}try{menuHide()}catch(e){}
    SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
    startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
    for(let i=0;i<80&&!(S&&S.phase&&S.phase!=='setup'&&!CUR_MODAL&&i>6);i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
    SPEED='pause';while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}});
  return {c,pg}};
const frame=pg=>pg.evaluate(()=>{draw();return {TW,OX,OY,H:+(cv.height/(devicePixelRatio||1)).toFixed(0),on:typeof AMPH111!=='undefined'&&AMPH111.on}});
const same=(a,b)=>a.TW===b.TW&&a.OX===b.OX&&a.OY===b.OY&&a.H===b.H;
const F={};
/* (1) flag off: the reference framing in the three windows */
for(const [k,v] of [['tall',TALL],['short',SHORT],['phone',PHONE]]){const {c,pg}=await open({flavius_amph111off:'1'},v);F[k]=await frame(pg);await c.close()}
ok(!F.tall.on&&!F.short.on&&!F.phone.on,'(1) flag off: the module installs nothing '+JSON.stringify(F.tall));
/* (2) flag on, tall window */
{const {c,pg}=await open({},TALL);
  const L=await pg.waitForFunction(()=>{draw();const k=['stone','bench','cloth','fixed','fire','glow','front'];return k.every(n=>AMPH111.img[n]&&AMPH111.img[n].naturalWidth>0)&&k.map(n=>n+':'+AMPH111.img[n].naturalWidth+'x'+AMPH111.img[n].naturalHeight).join(' ')},null,{timeout:60000}).then(h=>h.jsonValue()).catch(()=>null);
  ok(!!L,'(2) every bake layer loads: '+L);
  const f=await frame(pg);
  ok(f.on&&same(f,F.tall),'(2) tall window: framing = flag off (no canvas growth) '+JSON.stringify(f)+' vs '+JSON.stringify(F.tall));
  /* (4) a tile click reaches onTile with that tile (onTile recorded, not run: no game action changes the next click) */
  /* the event's intro card (#evIntro) lies over the canvas for its first seconds and eats the first click: take it away first */
  await pg.evaluate(()=>{const e=document.getElementById('evIntro');if(e)e.remove();window.__T111=[];onTile=function(r,c){__T111.push([r,c])}});
  const T=[[0,0],[0,12],[12,0],[12,12],[6,6],[11,11]];
  for(const [r,cc] of T){const p=await pg.evaluate(([r,c])=>{draw();const m=center(r,c),R=cv.getBoundingClientRect();return {x:R.left+m.x,y:R.top+m.y}},[r,cc]);
    await pg.mouse.move(p.x,p.y);await pg.mouse.click(p.x,p.y)}
  const got=await pg.evaluate(()=>__T111);
  ok(T.length===got.length&&T.every((t,i)=>got[i][0]===t[0]&&got[i][1]===t[1]),'(4) clicks select the right tiles '+JSON.stringify(got));
  await c.close()}
/* (3) no offset: short window, phone */
{const {c,pg}=await open({},SHORT);const f=await frame(pg);ok(f.on&&same(f,F.short),'(3) short window: framing = flag off '+JSON.stringify(f)+' vs '+JSON.stringify(F.short));await c.close()}
{const {c,pg}=await open({},PHONE);const f=await frame(pg);ok(f.on&&same(f,F.phone),'(3) phone: framing = flag off '+JSON.stringify(f)+' vs '+JSON.stringify(F.phone));await c.close()}
ok(!errs.length,'(5) no console errors');
console.log('ERRS',JSON.stringify(errs.slice(0,6)));console.log(miss.length?'FAILED '+miss.length:'ALL OK');await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});

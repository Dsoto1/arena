/* v1.07 beta-2 fixes (403-v107fix): (1) the red aim outline (396) hugs the gladiator it rings: every red pixel of the outline sprite lies
   within ~1.5 CSS px of the figure's visible body (alpha ≥ 128), none on the solid body, at DPR 1 and 2, zoom 1 and 2 (the old ring
   reached 2 CSS px beyond the faintest rim pixel); the tag still sits over the body's top; (2) with REAL scrollbars (headless hides them)
   a window opening in a match keeps the scrollbar's gutter (html.sg107) — the board canvas keeps its size, no ResizeObserver rebuild —
   and the gutter goes when the window closes; (3) kill switch flavius_v107fixoff=1: the old ring and the board resizes come back. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch({ignoreDefaultArgs:['--hide-scrollbars']});const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(dpr,ls)=>{const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:dpr});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}menuHide()});return pg};
/* the human soldier aims at the CPU hero standing next to him (a gladiator target) */
const aim=(pg,z)=>pg.evaluate(async z=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='pause';
  XRAY='off';const pl=[[6,4],[6,5],[11,12],[12,11]];S.players.forEach((p,i)=>{p.r=pl[i][0];p.c=pl[i][1]});
  const away=[[0,0],[12,12],[0,1],[1,0],[12,0],[0,2],[2,0]];S.npcs.forEach((n,i)=>{const a=away[i%away.length];n.r=a[0];n.c=a[1]});try{RD().pvp=true}catch(e){}
  const p=cur();p.attacks=0;p.hitTargets=new Set();p.armUses={R:0,L:0};const src=attackSources(p)[0];S.mode='atk'+src.arm+(src.thr?'T':'');
  if(z>=1.9){CAM.z=z;S.zoomIn=true}render();for(let i=0;i<30;i++){draw();await W8(40)}
  const T=S.players[1];const f=AIM106.figs.find(f=>f.u===T);if(!f)return {err:'no fig',figs:AIM106.figs.length};const R=cv.getBoundingClientRect(),k=cv.width/R.width;
  return {x:R.left+(f.bb.x0+f.bb.x1)/2/k,y:R.top+(f.bb.y0*0.4+f.bb.y1*0.6)/k,name:T.name}},z);
/* the outline sprite vs the body: red pixels off the body, how far they reach (device px), how many sit on the solid body */
const measure=pg=>pg.evaluate(()=>{const s=aim106Shown();const f=s&&AIM106.figs.find(f=>f.u===s.ref);if(!f)return {err:'not shown'};
  const sp=[...AIM106.oc.values()].pop();const w=sp.cv.width,h=sp.cv.height;const o0=f.ops[0].m;const ox=Math.round(o0[4]+sp.ox),oy=Math.round(o0[5]+sp.oy);
  const sil=document.createElement('canvas');sil.width=w;sil.height=h;const g=sil.getContext('2d',{willReadFrequently:true});
  for(const o of f.ops){g.setTransform(o.m[0],o.m[1],o.m[2],o.m[3],o.m[4]-ox,o.m[5]-oy);g.drawImage(o.img,o.sx,o.sy,o.sw,o.sh,o.dx,o.dy,o.dw,o.dh)}
  const A=g.getImageData(0,0,w,h).data,O=sp.cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;
  const body=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(A[(y*w+x)*4+3]>=128)body.push([x,y]);
  /* distance of each red pixel to the nearest body pixel (a coarse search ring: enough for a thin band) */
  const isB=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&A[(y*w+x)*4+3]>=128;let red=0,onSolid=0,far=0,maxD=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const a=O[(y*w+x)*4+3];if(a<60)continue;red++;if(A[(y*w+x)*4+3]>=250){onSolid++;continue}
    let d=99;for(let r=0;r<=8&&d===99;r++)for(let dy=-r;dy<=r&&d===99;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;if(isB(x+dx,y+dy)){d=Math.hypot(dx,dy);break}}
    if(d>maxD)maxD=d;if(d===99)far++}
  return {red,onSolid,far,maxD:+maxD.toFixed(2),body:body.length,dpr:devicePixelRatio,built:F107.st.built,top:f.top!=null&&f.top>=f.bb.y0&&f.top<f.bb.y1,tag:AIM106.tag||''}});
const W=ms=>new Promise(r=>setTimeout(r,ms));
for(const [dpr,z] of [[1,1],[2,1],[1,2],[2,2]]){const pg=await open(dpr);const P=await aim(pg,z);ok(!P.err,'0 aim set up '+JSON.stringify(P));if(P.err){await pg.context().close();continue}
  await pg.mouse.move(P.x,P.y,{steps:3});await W(400);const m=await measure(pg);
  const lim=1.5*dpr+1.6;  /* band 1.5 CSS px + anti-aliasing */
  ok(!m.err&&m.red>20&&m.built>=1,`1a dpr ${dpr} zoom ${z}: the 403 outline is drawn `+JSON.stringify(m));
  ok(m.maxD<=lim&&m.far===0,`1b dpr ${dpr} zoom ${z}: every red pixel within ${lim.toFixed(1)} device px of the visible body `+JSON.stringify(m));
  ok(m.onSolid<=m.red*0.02,`1c dpr ${dpr} zoom ${z}: no red over the solid body `+JSON.stringify(m));
  ok(m.top&&m.tag.startsWith(P.name+' · '),`1d dpr ${dpr} zoom ${z}: the tag sits over the body's top `+JSON.stringify({top:m.top,tag:m.tag}));
  await pg.context().close()}
/* the old ring (kill switch) reaches further: the test above would catch a halo */
{const pg=await open(2,{flavius_v107fixoff:'1'});const P=await aim(pg,2);if(!P.err){await pg.mouse.move(P.x,P.y,{steps:3});await W(400);const m=await measure(pg);
  ok(m.built===0&&m.maxD>1.5*2+1.6,'3a kill switch: 396\'s own ring (wider) '+JSON.stringify(m))}else ok(false,'3a set up '+JSON.stringify(P));await pg.context().close()}
/* 2 · a window in a match on a page with a real scrollbar */
const win=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;
  startEvent({ev:'democritus',loc:6,seed:4242,seats:['soldier','hero','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});await W8(2500);
  for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='pause';await W8(300);
  const html=document.documentElement,sb=innerWidth-html.clientWidth,w0=cv.width;let rs=0;const ro=new ResizeObserver(()=>rs++);ro.observe(cv);await W8(150);rs=0;
  const pr=modal('Raise the shield?','<p>An attack brings 2 damage.</p>',[{label:'Absorb',value:1,primary:true},{label:'Take it',value:0}]);await W8(400);
  const inn={w:cv.width,sg:html.classList.contains('sg107'),open:!!CUR_MODAL,rs};CUR_MODAL.done(0);await pr;await W8(400);
  const out={w:cv.width,sg:html.classList.contains('sg107'),rs};ro.disconnect();return {sb,w0,inn,out,tall:html.scrollHeight>html.clientHeight}});
{const pg=await open(1);const r=await win(pg);
  ok(r.sb>0&&r.tall,'2a the page has a real scrollbar in this run (else nothing to test) '+JSON.stringify(r));
  ok(r.inn.open&&r.inn.sg&&r.inn.w===r.w0&&r.inn.rs===0,'2b a window opens: the gutter stays, the board keeps its size, no resize '+JSON.stringify(r));
  ok(!r.out.sg&&r.out.w===r.w0&&r.out.rs===0,'2c the window closes: no gutter class, same size, still no resize '+JSON.stringify(r));
  await pg.context().close()}
{const pg=await open(1,{flavius_v107fixoff:'1'});const r=await win(pg);
  ok(!r.inn.sg&&(r.sb===0||r.inn.w!==r.w0||r.inn.rs>0),'3b kill switch: no gutter (the old resize) '+JSON.stringify(r));await pg.context().close()}
await b.close();srv.close();
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});

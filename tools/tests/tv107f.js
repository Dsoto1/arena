/* v1.07 beta-2 fixes (403-v107fix): (1) the red aim outline (396) hugs the gladiator it rings: every red pixel of the outline sprite lies
   within ~1.5 CSS px of the figure's visible body (alpha ≥ 128), none on the solid body, at DPR 1 and 2, zoom 1 and 2 (the old ring
   reached 2 CSS px beyond the faintest rim pixel); the tag still sits over the body's top; (2) with REAL scrollbars (headless hides them)
   a window opening in a match keeps the scrollbar's gutter (html.sg107) — the board canvas keeps its size, no ResizeObserver rebuild —
   and the gutter goes when the window closes; (3) kill switch flavius_v107fixoff=1: the old ring and the board resizes come back;
   (4) beta 4, LIVE: at Normal speed, Animations On, bases on AND off (321 draws a base-less cell lower than the call 396 recorded), every
   frame of still / glide / hit-block-attack + flash / push stretches: the ring's bbox lies 0 … band + 2 device px outside the body as
   REALLY drawn that frame (native drawImage, tapped outside every wrapper). */
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
const aim=(pg,z,o)=>pg.evaluate(async([z,o])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;if(o&&o.nb)SETTINGS.bases101=false;
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED=o&&o.live?'normal':'pause';
  XRAY='off';const pl=[[6,4],[6,5],[11,12],[12,11]];S.players.forEach((p,i)=>{p.r=pl[i][0];p.c=pl[i][1]});
  const away=[[0,0],[12,12],[0,1],[1,0],[12,0],[0,2],[2,0]];S.npcs.forEach((n,i)=>{const a=away[i%away.length];n.r=a[0];n.c=a[1]});try{RD().pvp=true}catch(e){}
  const p=cur();p.attacks=0;p.hitTargets=new Set();p.armUses={R:0,L:0};const src=attackSources(p)[0];S.mode='atk'+src.arm+(src.thr?'T':'');
  if(z>=1.9){CAM.z=z;S.zoomIn=true}render();for(let i=0;i<30;i++){draw();await W8(40)}
  const T=S.players[1];const f=AIM106.figs.find(f=>f.u===T);if(!f)return {err:'no fig',figs:AIM106.figs.length};const R=cv.getBoundingClientRect(),k=cv.width/R.width;
  return {x:R.left+(f.bb.x0+f.bb.x1)/2/k,y:R.top+(f.bb.y0*0.4+f.bb.y1*0.6)/k,name:T.name}},[z,o||null]);
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
/* 4 · LIVE (beta 4: the ring floated above the figure, a bit too big — with bases off 321 draws a base-less cell lower than 396 recorded):
   a match at Normal speed, Animations On; every frame of a still stretch, glides (4 steps), hit / block / attack poses (+ the hit flash) and
   a push pose, the target's images as REALLY drawn this frame (native drawImage, tapped outside every wrapper) vs the outline sprite drawn
   that frame: each bbox edge of the red ring lies 0 … band + 2 device px outside the drawn body's (alpha ≥ 128) — bases on and off. */
const live=pg=>pg.evaluate(async scn=>{const out={};const T=S.players[1];const real=CanvasRenderingContext2D.prototype.drawImage,bn=BS101.nat;let on=0,cur=null;const frames=[];
  const tap=function(img){if(on&&this===ctx&&cur){try{const A=arguments;let sx=0,sy=0,sw,sh,dx,dy,dw,dh;if(A.length>=9){[sx,sy,sw,sh,dx,dy,dw,dh]=[...A].slice(1)}else if(A.length>=5){sw=img.width;sh=img.height;[dx,dy,dw,dh]=[...A].slice(1)}else{sw=img.width;sh=img.height;dx=A[1];dy=A[2];dw=sw;dh=sh}
      const m=this.getTransform();const isOut=[...AIM106.oc.values()].some(s=>s.cv===img);(isOut?cur.out:cur.ops).push({img,sx,sy,sw,sh,dx,dy,dw,dh,m:[m.a,m.b,m.c,m.d,m.e,m.f]})}catch(e){}}return real.apply(this,arguments)};
  const keep=window.drawPlayer;
  const abb=(ops,cut)=>{let X0=1e9,Y0=1e9,X1=-1e9,Y1=-1e9;for(const q of ops)for(const [x,y] of [[q.dx,q.dy],[q.dx+q.dw,q.dy],[q.dx,q.dy+q.dh],[q.dx+q.dw,q.dy+q.dh]]){const X=q.m[0]*x+q.m[2]*y+q.m[4],Y=q.m[1]*x+q.m[3]*y+q.m[5];X0=Math.min(X0,X);X1=Math.max(X1,X);Y0=Math.min(Y0,Y);Y1=Math.max(Y1,Y)}
    if(!ops.length)return null;X0=Math.floor(X0)-2;Y0=Math.floor(Y0)-2;const w=Math.ceil(X1)+2-X0,h=Math.ceil(Y1)+2-Y0;if(w<=0||h<=0||w>4096||h>4096)return null;
    const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});
    for(const q of ops){g.setTransform(q.m[0],q.m[1],q.m[2],q.m[3],q.m[4]-X0,q.m[5]-Y0);real.call(g,q.img,q.sx,q.sy,q.sw,q.sh,q.dx,q.dy,q.dw,q.dh)}
    const d=g.getImageData(0,0,w,h).data;let a=1e9,b=1e9,e=-1,f=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>=cut){if(x<a)a=x;if(x>e)e=x;if(y<b)b=y;if(y>f)f=y}
    return e<0?null:{x0:X0+a,y0:Y0+b,x1:X0+e+1,y1:Y0+f+1}};
  const sel=()=>{AIM106.sel={k:T.r*N+T.c,r:T.r,c:T.c,ref:T,body:true};AIM106.t0=performance.now()-5000};
  const go=async ms=>{const t=performance.now();while(performance.now()-t<ms){sel();draw();await new Promise(r=>requestAnimationFrame(r))}};
  const R=Math.max(1.25,F107.w*devicePixelRatio),lim=R+2;
  for(const sc of scn){frames.length=0;BS101.nat=tap;CanvasRenderingContext2D.prototype.drawImage=tap;
    window.drawPlayer=function(p){if(p!==T)return keep.apply(this,arguments);const was=cur;cur={ops:[],out:[]};on++;try{return keep.apply(this,arguments)}finally{on--;frames.push(cur);cur=was}};
    try{if(sc==='still')await go(300);
      else if(sc==='glide'){for(const [dr,dc] of [[-1,0],[1,0],[-1,0],[1,0]]){T.r+=dr;T.c+=dc;render();await go(220)}}
      else if(sc==='hit'){for(const a of ['hit','block','attack']){an100Act(T,a);if(a==='hit')an100St(T).flash=performance.now();await go(600)}}
      else if(sc==='push'){for(let i=0;i<3;i++){an100St(T).push={k:0.5,t:performance.now()};await go(120)}}}
    finally{BS101.nat=bn;CanvasRenderingContext2D.prototype.drawImage=real;window.drawPlayer=keep}
    const res=[];for(const fr of frames){if(!fr.out.length)continue;const body=abb(fr.ops.filter(q=>q.dw*q.m[0]>8),128),o=abb(fr.out,60);if(!body||!o)continue;res.push([body.x0-o.x0,body.y0-o.y0,o.x1-body.x1,o.y1-body.y1])}
    const bad=res.filter(e=>e.some(v=>v<-0.5||v>lim));out[sc]={n:res.length,bad:bad.length,worst:bad[0]||null,lim}}
  return out},['still','glide','hit','push']);
for(const [dpr,z,nb] of [[1,1,true],[2,2,true],[2,1,false],[1,2,false]]){const pg=await open(dpr);const P=await aim(pg,z,{live:true,nb});ok(!P.err,'4 live aim set up '+JSON.stringify(P));if(P.err){await pg.context().close();continue}
  const r=await live(pg);for(const sc in r)ok(r[sc].n>=3&&r[sc].bad===0,`4 live dpr ${dpr} zoom ${z} bases ${nb?'off':'on'} ${sc}: the ring hugs the figure drawn THIS frame `+JSON.stringify(r[sc]));
  await pg.context().close()}
/* 5 · (v1.08b, "zora outline was slightly off") Zora, the biggest cell: 346 sharpens an up-scaled cell in place, a few frames AFTER the first draw
   when the zoom is easing / the budget is spent. The ring cached from the unsharpened alpha stayed (key = canvas). Now the key carries the sharpen
   state: after the zoom settles, the cached ring equals one built from scratch (≤ 0.5 % of its pixels differ) and still hugs the body (≤ band + 2 px). */
const zora=(pg,z)=>pg.evaluate(async z=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;SETTINGS.calm=false;
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='pause';
  XRAY='off';const pl=[[6,4],[11,11],[12,11],[11,12]];S.players.forEach((p,i)=>{p.r=pl[i][0];p.c=pl[i][1]});
  const Z=S.npcs.find(n=>n.t==='zora');if(!Z)return {err:'no zora'};for(const n of S.npcs)if(n!==Z){n.r=0;n.c=0}
  Z.alive=true;Z.out=false;Z.r=6;Z.c=5;Z.hp=99;Z.aggro=null;const p=cur();p.attacks=0;p.hitTargets=new Set();p.armUses={R:0,L:0};const src=attackSources(p)[0];S.mode='atk'+src.arm+(src.thr?'T':'');
  render();for(let i=0;i<10;i++){draw();await W8(40)}
  const sel=()=>{AIM106.sel={k:Z.r*N+Z.c,r:Z.r,c:Z.c,ref:Z,body:true};AIM106.t0=performance.now()-5000};
  const sig=()=>{const sp=[...AIM106.oc.values()].pop();if(!sp)return null;const c=sp.cv;return {w:c.width,h:c.height,d:c.getContext('2d').getImageData(0,0,c.width,c.height).data}};
  const mx=V103C.sharpMax;V103C.sharpMax=0;CAM.z=z*0.8;S.zoomIn=true;AIM106.oc.clear();sel();draw();V103C.sharpMax=mx;await W8(800);for(let i=0;i<10;i++){sel();draw();await W8(30)}
  const settled=sig();AIM106.oc.clear();sel();draw();const fresh=sig();
  if(!settled||!fresh||settled.w!==fresh.w||settled.h!==fresh.h)return {err:'sprites',a:settled&&[settled.w,settled.h],b:fresh&&[fresh.w,fresh.h]};
  let red=0,diff=0;for(let i=3;i<fresh.d.length;i+=4){if(fresh.d[i]>60)red++;if((fresh.d[i]>60)!==(settled.d[i]>60))diff++}
  return {red,diff,dpr:devicePixelRatio}},z);
for(const [dpr,z] of [[1,2],[1.5,2]]){const pg=await open(dpr);const r=await zora(pg,z);
  ok(!r.err&&r.red>100&&r.diff<=r.red*0.005,`5 Zora dpr ${dpr} zoom ${z}: the cached ring = a fresh one (sharpened cell; first built with the sharpen skipped) `+JSON.stringify(r));await pg.context().close()}
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

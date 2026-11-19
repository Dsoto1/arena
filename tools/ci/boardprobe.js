/* Board probe (2026-11-19, for the Safari board bugs in docs/known-issues.md): NO game changes, it only measures.
   Owner's live v1.16a screenshot (Mac Safari, DPR 2, ~1500 px wide, zoomed in, day): beast CORPSES drawn ~3 tiles big and blurry, living figures fine.
   Run on GitHub: webkit.yml dispatch, tests = "../ci/boardprobe" (WebKit there; Chromium locally: node tools/ci/boardprobe.js flavius-arena.html).
   Prints lines starting "BOARDPROBE " (grep them from the log), then MISS ["probe"] / ERRS [] and exits 1 on purpose so the job shows its lines.
   For DPR 2 and DPR 1 (viewport 1500x950, served over http so canvas pixels can be read):
   1 CORPSES  every beast kind (11 sheet keys: glykon arenosus valencia moechus ursa brutum leo leaena tholo commodus zora), zoomed CAM.z 2 like the wheel,
              each measured ALIVE and then DEAD (the game's own 'hit' kill path, same as tv107g): the images each really draws in one frame
              (native drawImage tap) -> drawn cell + visible-pixel body in css px and in tiles (TW at that zoom), source cell, sheet 1x/2x + its size,
              image class (Image / ImageBitmap / canvas), the 404 path that drew it (stats delta d3 / lie / none ...), 404's own size check.
              FLAG when the dead body is > 1.3x the living one or > 1.5 tiles wide.
   2 SHADOWS  a NIGHT event, Lighting Full: 399's / 409's own counters + per figure the mean luminance of a ring under its base against empty tiles.
   3 MEMORY   what 410 / 417 / 406 decided here; Image / createImageBitmap sizes seen (w x h x 4 = decoded-bytes estimate), 1x vs 2x sheets.
   4 screenshots of the zoomed board with the corpses -> /tmp/wkshots/boardprobe-dpr<N>.png (webkit.yml uploads /tmp/wkshots). */
const {chromium,engine}=require('../tests/_browser');const path=require('path'),fs=require('fs'),http=require('http');
const page=path.resolve(process.argv[2]||'flavius-arena.html');const SHOTS='/tmp/wkshots';
const P=(...a)=>console.log('BOARDPROBE',...a);
(async()=>{fs.mkdirSync(SHOTS,{recursive:true});
const root=path.dirname(page);const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));
  if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL='http://127.0.0.1:'+srv.address().port+'/'+path.basename(page);
const b=await chromium.launch();const errs=[];
P('engine',engine,'page',URL);
const mk=async(dpr,extra)=>{const pg=await b.newPage({viewport:{width:1500,height:950},deviceScaleFactor:dpr});
  await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));
  pg.on('console',m=>{const t=m.text();if(/^404:|^406|^410|^417/.test(t))P('console',m.type(),t.slice(0,300))});
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');
    /* memory bookkeeping: every Image that loads and every ImageBitmap made (decoded bytes ~ w x h x 4) */
    window.__MEM={img:[],bm:[]};const I=window.Image;window.Image=function(){const im=new I(...arguments);
      im.addEventListener('load',()=>{try{window.__MEM.img.push([im.currentSrc||im.src,im.naturalWidth,im.naturalHeight])}catch(e){}});return im};window.Image.prototype=I.prototype;
    if(window.createImageBitmap){const c=window.createImageBitmap.bind(window);window.createImageBitmap=function(){const p=c.apply(null,arguments);
      p.then(bm=>{try{window.__MEM.bm.push([bm.width,bm.height])}catch(e){}},()=>{});return p}}});
  await pg.goto(URL,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});return pg};

/* ---------------- 1 corpses ---------------- */
const corpses=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<120&&!(humanTurn()&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  SPEED='normal';XRAY='off';S.npcs=S.npcs.filter(n=>n.alive);S.npcs.forEach(n=>{n.r=0;n.c=12});S.players.forEach((q,i)=>{q.r=i===0?5:12;q.c=i===0?6:i});
  const kinds=[['snake','Glykon'],['snake','Arenosus'],['wolf','Valencia'],['wolf','Moechus'],['bear','Ursa'],['bear','Brutum'],['lion','Leo'],['lion','Leaena'],['tholo','Tholo'],['commodus','Commodus'],['zora','Zora']];
  const slots=[];for(const r of [3,5,7])for(const c of [3,5,7,9])slots.push([r,c]);slots.splice(5,0);   /* (5,5) (5,7) flank the human at (5,6) */
  const ns=kinds.map(([t,k],i)=>{const n=mkNPC(t,k,slots[i][0],slots[i][1]);S.npcs.push(n);return n});
  CAM.z=2;S.zoomIn=true;for(let i=0;i<10;i++){draw();await W8(120)}
  const real=CanvasRenderingContext2D.prototype.drawImage,bn=BS101.nat;
  const rec1=(kind)=>{let cur=null;const rec=new Map();
    const tap=function(img){if(cur&&this===ctx&&!img._l106){try{const A=arguments;let sx=0,sy=0,sw,sh,dx,dy,dw,dh;if(A.length>=9){[sx,sy,sw,sh,dx,dy,dw,dh]=[...A].slice(1)}else if(A.length>=5){sw=img.width;sh=img.height;[dx,dy,dw,dh]=[...A].slice(1)}else{sw=img.width;sh=img.height;dx=A[1];dy=A[2];dw=sw;dh=sh}
        const m=this.getTransform();(rec.get(cur)||rec.set(cur,[]).get(cur)).push({img,sx,sy,sw,sh,dx,dy,dw,dh,m:[m.a,m.b,m.c,m.d,m.e,m.f],ga:this.globalAlpha})}catch(e){}}return real.apply(this,arguments)};
    const dn=drawNPC,dc=drawCorpseFig;const paths=new Map();
    BS101.nat=tap;CanvasRenderingContext2D.prototype.drawImage=tap;
    drawNPC=function(n){const k=cur;cur=n.alive?n:cur;try{return dn.apply(this,arguments)}finally{cur=k}};
    drawCorpseFig=function(m){const k=cur;const hit=ns.find(n=>!n.alive&&!n.gone&&Math.abs(center(n.r,n.c).x-m.x)<0.5&&Math.abs(center(n.r,n.c).y-m.y)<0.5)||null;cur=hit;
      const s0=typeof CV107!=='undefined'?{...CV107.stats}:{};try{return dc.apply(this,arguments)}finally{cur=k;if(hit){const s1=typeof CV107!=='undefined'?CV107.stats:{};const d={};for(const q in s1)if(s1[q]!==s0[q])d[q]=s1[q]-(s0[q]||0);
        paths.set(hit,{d,last:typeof CV107!=='undefined'&&CV107.lastSz?{...CV107.lastSz}:null})}}};
    try{draw()}finally{BS101.nat=bn;CanvasRenderingContext2D.prototype.drawImage=real;drawNPC=dn;drawCorpseFig=dc}
    return {rec,paths}};
  const T=()=>ctx.getTransform();
  const body=(ops,n)=>{ops=(ops||[]).filter(q=>q.ga>0.5);if(!ops.length)return null;let X0=1e9,Y0=1e9,X1=-1e9,Y1=-1e9;
    for(const q of ops)for(const [x,y] of [[q.dx,q.dy],[q.dx+q.dw,q.dy],[q.dx,q.dy+q.dh],[q.dx+q.dw,q.dy+q.dh]]){const X=q.m[0]*x+q.m[2]*y+q.m[4],Y=q.m[1]*x+q.m[3]*y+q.m[5];X0=Math.min(X0,X);X1=Math.max(X1,X);Y0=Math.min(Y0,Y);Y1=Math.max(Y1,Y)}
    const cellW=X1-X0,cellH=Y1-Y0;X0=Math.floor(X0)-1;Y0=Math.floor(Y0)-1;const w=Math.min(4000,Math.ceil(X1)+1-X0),h=Math.min(4000,Math.ceil(Y1)+1-Y0);
    const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});
    for(const q of ops){g.setTransform(q.m[0],q.m[1],q.m[2],q.m[3],q.m[4]-X0,q.m[5]-Y0);try{real.call(g,q.img,q.sx,q.sy,q.sw,q.sh,q.dx,q.dy,q.dw,q.dh)}catch(e){}}
    let vx0=1e9,vx1=-1,vy0=1e9,vy1=-1,vis=true;try{const d=g.getImageData(0,0,w,h).data;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>=128){if(x<vx0)vx0=x;if(x>vx1)vx1=x;if(y<vy0)vy0=y;if(y>vy1)vy1=y}}catch(e){vis=false}
    const big=ops.reduce((p,q)=>q.dw*q.dh>p.dw*p.dh?q:p),im=big.img;
    const src=im.src?String(im.src).split('/').pop():'';const cls=im.constructor&&im.constructor.name;
    return {cellW,cellH,visW:vis&&vx1>=0?vx1-vx0+1:null,visH:vis&&vy1>=0?vy1-vy0+1:null,srcCell:big.sw+'x'+big.sh,srcImg:(im.naturalWidth||im.width)+'x'+(im.naturalHeight||im.height),cls,src,k2:/x2/.test(src),nops:ops.length,
      kpx:big.dw*Math.hypot(big.m[0],big.m[1])}};
  /* ALIVE (same npc, just before it dies) */
  const A=rec1();const alive=ns.map(n=>body(A.rec.get(n),n));
  const Tm=T(),cssK=cv.clientWidth/cv.width,tw=TW*Math.hypot(Tm.a,Tm.b);
  for(const n of ns){n.alive=false;try{BUS.emit('hit',{target:{id:n.id,name:n.name,npc:true},amount:9,after:{hp:0}})}catch(e){}}
  for(let i=0;i<26;i++){draw();await W8(150)}
  const D=rec1();const dead=ns.map(n=>body(D.rec.get(n),n));const paths=ns.map(n=>D.paths.get(n)||null);
  const out=ns.map((n,i)=>({t:n.t,key:n.key,bk:bst100Key(n),A:alive[i],D:dead[i],path:paths[i]}));
  return {out,tw,cssK,cz:CAM.z,dpr:devicePixelRatio,cvw:cv.width,cvcw:cv.clientWidth,stats:typeof CV107!=='undefined'?{...CV107.stats}:null,bad:typeof CV107!=='undefined'?[...CV107.bad]:null,
    x1meta:typeof BST108X1!=='undefined'?Object.keys(BST108X1):null,x108:{on:X108.on,why:X108.why,st:{...X108.st},force:X108.force},w3:typeof W3!=='undefined'?{on:W3.on}:null}});

/* ---------------- 2 shadows (night, Lighting Full) ---------------- */
const shadows=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SETTINGS.quality110='high';SETTINGS.light106='full';try{q110Refresh()}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0,night:true},night:true});
  await W8(1200);SPEED='snap';for(let i=0;i<120&&!(humanTurn()&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  SPEED='pause';CAM.z=1;S.zoomIn=false;for(let i=0;i<16;i++){draw();await W8(120)}
  const info={night:night91On(),mode:l106Mode(),light106:SETTINGS.light106,quality:SETTINGS.quality110,dpr:devicePixelRatio};
  const T=ctx.getTransform(),tw=TW*Math.hypot(T.a,T.b);const px=(r,c)=>{const m=center(r,c);return [T.a*m.x+T.c*m.y+T.e,T.b*m.x+T.d*m.y+T.f]};
  const g=cv.getContext('2d');const W=cv.width,H=cv.height;let data=null;try{data=g.getImageData(0,0,W,H).data}catch(e){return {info,err:'getImageData '+e.message}}
  const ring=(cx,cy)=>{let s=0,n=0;for(let a=0;a<=Math.PI;a+=0.08)for(const k of [0.34,0.42,0.5]){const x=Math.round(cx+Math.cos(a)*tw*k),y=Math.round(cy+Math.sin(a)*tw*k*0.5);if(x<0||y<0||x>=W||y>=H)continue;const i=(y*W+x)*4;s+=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];n++}return n?s/n:null};
  const occ=new Set([...S.players.filter(p=>p.alive).map(p=>p.r+','+p.c),...S.npcs.filter(n=>n.alive).map(n=>n.r+','+n.c)]);
  const ctl=[];for(let r=2;r<11&&ctl.length<12;r++)for(let c=2;c<11&&ctl.length<12;c++){let near=false;for(const o of occ){const [a,b2]=o.split(',').map(Number);if(Math.abs(a-r)<=1&&Math.abs(b2-c)<=1)near=true}if(!near&&(r+c)%3===0){const v=ring(...px(r,c));if(v!=null)ctl.push(v)}}
  const cm=ctl.length?ctl.reduce((a,b2)=>a+b2,0)/ctl.length:null;
  const figs=[...S.players.filter(p=>p.alive).map(p=>({k:'P:'+(p.cls||p.name),r:p.r,c:p.c})),...S.npcs.filter(n=>n.alive).map(n=>({k:'N:'+n.t,r:n.r,c:n.c}))].map(f=>{const v=ring(...px(f.r,f.c));return {...f,ring:v==null?null:+v.toFixed(1),ratio:v!=null&&cm?+(v/cm).toFixed(2):null}});
  const last=L106.last?{md:L106.last.md,night:L106.last.night,static:L106.last.static,figs:(L106.last.figs||[]).length,contacts:L106.last.contacts}:null;
  return {info,ctl:{n:ctl.length,mean:cm&&+cm.toFixed(1)},figs,last,l106st:{...L106.st},v108:{figN:V108.st.figN,figSkip:V108.st.figSkip,pools:V108.st.pools,frames:V108.st.frames},v108no:[...V108.no].slice(0,8)}});

/* ---------------- 3 memory / decisions ---------------- */
const memory=pg=>pg.evaluate(()=>{const M=window.__MEM||{img:[],bm:[]};const sheet=(u,re)=>re.test(u);
  const imgs=M.img.map(([u,w,h])=>({f:String(u).split('/').pop(),w,h,b:w*h*4}));const sum=a=>a.reduce((s,q)=>s+q.b,0);
  const x2=imgs.filter(q=>/x2_/.test(q.f)),x1=imgs.filter(q=>/(anim100|beast100)/.test(q.f)&&!/x2_/.test(q.f));
  const bmB=M.bm.reduce((s,[w,h])=>s+w*h*4,0);
  return {ua:navigator.userAgent.slice(-60),dm:navigator.deviceMemory,dpr:devicePixelRatio,w1Real:typeof w1Real==='function'?w1Real():null,iw:innerWidth,
    x108:{on:X108.on,why:X108.why,force:X108.force,off:X108.off,st:{...X108.st}},
    q110:{mode:Q110.mode,tier:Q110.tier,rung:Q110.rung,why:Q110.why,cap:Q110.cap,x2ok:Q110.x2ok,webkit:Q110.webkit,phone:Q110.phone,run:Q110.run,sheets:Q110.sheets,st:{...Q110.st},steps:Q110.steps.slice(-4)},
    w1:{cap:W1.cap,fixed:W1.fixed,dropped:W1.dropped},p107:typeof P107S!=='undefined'?{webkit:P107S.webkit,off:P107S.off}:null,w3:typeof W3!=='undefined'?{on:W3.on}:null,w3st:typeof P107S!=='undefined'?{...P107S.st}:null,
    sheets2x:x2.length,sheets1x:x1.length,sheets2xMB:+(sum(x2)/1048576).toFixed(0),sheets1xMB:+(sum(x1)/1048576).toFixed(0),bitmapsMade:M.bm.length,bitmapsMB:+(bmB/1048576).toFixed(0),
    totalMB:+((sum(imgs.filter(q=>/(anim100|beast100)/.test(q.f)))+bmB)/1048576).toFixed(0),
    top:imgs.sort((a,b2)=>b2.b-a.b).slice(0,6).map(q=>q.f+' '+q.w+'x'+q.h+' '+(q.b/1048576).toFixed(0)+'MB')}});

for(const dpr of [2,1]){
  const pg=await mk(dpr);
  P('== DPR',dpr,'==');
  let r;try{r=await corpses(pg)}catch(e){P('CORPSE-ERROR',e.message);errs.push(e.message);r=null}
  if(r){
    P('dpr',dpr,'devicePixelRatio',r.dpr,'canvas',r.cvw,'px wide (css',r.cvcw+')','CAM.z',r.cz,'tile at that zoom',r.tw.toFixed(1),'device px =',(r.tw*r.cssK).toFixed(1),'css px');
    P('dpr',dpr,'404 stats',JSON.stringify(r.stats),'bad',JSON.stringify(r.bad),'BST108X1(2x-meta kinds)',JSON.stringify(r.x1meta),'X108',JSON.stringify(r.x108),'W3',JSON.stringify(r.w3));
    const f=(v,tw)=>v==null?'?':v.toFixed(0)+'px/'+(v/tw).toFixed(2)+'t';
    for(const e of r.out){const A=e.A,D=e.D,tag='dpr '+dpr+' '+e.key+'('+e.bk+')';
      if(!A||!D){P(tag,'NOT DRAWN alive',!!A,'dead',!!D,'path',JSON.stringify(e.path));continue}
      const css=r.cssK;const vr=A.visW&&D.visW?D.visW/A.visW:null,cr=D.cellW/A.cellW,tiles=D.visW!=null?D.visW/r.tw:D.cellW/r.tw;
      const flag=(vr!=null&&vr>1.3)||cr>1.3||tiles>1.5;
      P(tag,flag?'FLAG':'ok','| ALIVE cell',f(A.cellW,r.tw),'vis',f(A.visW,r.tw),'src',A.srcCell,'img',A.srcImg,A.cls,A.k2?'2x':'1x',A.src,'| DEAD cell',f(D.cellW,r.tw),'vis',f(D.visW,r.tw),'visH',f(D.visH,r.tw),'(css '+(D.cellW*css).toFixed(0)+'px)','src',D.srcCell,'img',D.srcImg,D.cls,D.k2?'2x':'1x',D.src,'nops',D.nops,'| visRatio',vr&&vr.toFixed(2),'cellRatio',cr.toFixed(2),'| 404 path',JSON.stringify(e.path))}
  }
  const shot=SHOTS+'/boardprobe-dpr'+dpr+'.png';await pg.screenshot({path:shot});P('screenshot',shot,'exists',fs.existsSync(shot));
  /* memory read on the corpse page: it has loaded the most sheets */
  try{const m=await memory(pg);P('dpr',dpr,'MEMORY',JSON.stringify(m))}catch(e){P('MEMORY-ERROR',e.message)}
  await pg.close();
  const pg2=await mk(dpr);
  try{const s=await shadows(pg2);P('dpr',dpr,'SHADOWS info',JSON.stringify(s.info),s.err||'');
    if(!s.err){P('dpr',dpr,'SHADOWS counters L106.last',JSON.stringify(s.last),'L106.st',JSON.stringify(s.l106st),'V108',JSON.stringify(s.v108),'V108.no',JSON.stringify(s.v108no),'control ring luma',JSON.stringify(s.ctl));
      for(const f of s.figs)P('dpr',dpr,'SHADOW fig',f.k,'at',f.r+','+f.c,'ring luma',f.ring,'ratio to empty tiles',f.ratio,f.ratio!=null&&f.ratio<0.7?'DARK-BLOB?':'')}}
  catch(e){P('SHADOWS-ERROR',e.message);errs.push(e.message)}
  await pg2.close()}
srv.close();await b.close();
console.log('MISS',JSON.stringify(['probe']));console.log('ERRS',JSON.stringify(errs));process.exit(1)})().catch(e=>{console.error(e);process.exit(1)});

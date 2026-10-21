/* tv107g — v1.07 beta-2 note 3 (404-v107corpse): the CORPSES on the sand are the 3D figure, never the old token minis tipped over.
   1 with the sheets: slain beasts (bear, wolf, lion, Tholo, snake) lie as the last frame of their 3D die row (312's die4), a gladiator who
     fell with Animations Off (no 311 ghost) as the last frame of his fall row; 07's old corpse picture (tokenImg of the spec) is never asked;
   2 sheets blocked (the standalone download): the lying pose made from the still107 sheets, built once and cached (no rebuild a frame);
   3 a corpse the crew cleared (gone) is not drawn; 4 the kill switch flavius_v107corpseoff=1 = 07's corpse (tokenImg) exactly; no errors. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const mk=async(o={})=>{const pg=await b.newPage({viewport:{width:1280,height:860},deviceScaleFactor:o.dpr||1});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  if(o.block)await pg.route(/anim100_|beast100_/,r=>r.abort());const reqs=[];pg.on('request',r=>reqs.push(r.url()));pg.reqs=reqs;pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o.off)localStorage.setItem('flavius_v107corpseoff','1');for(const k in (o.ls||{}))localStorage.setItem(k,o.ls[k])},{off:!!o.off,ls:o.ls});
  await pg.goto(o.url||'file://'+page,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});return pg};
const play=p=>p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<120&&!(humanTurn()&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  SPEED='normal';S.npcs=S.npcs.filter(n=>n.alive);
  const spots=[[3,3],[3,6],[3,9],[6,3],[6,9]],kinds=[['bear','Ursa'],['wolf','Valencia'],['lion','Leo'],['tholo','Tholo'],['snake','Glykon']];
  const ns=kinds.map(([t,k],i)=>{const n=mkNPC(t,k,spots[i][0],spots[i][1]);S.npcs.push(n);return n});for(let i=0;i<8;i++){draw();await W8(120)}
  for(const n of ns){n.alive=false;try{BUS.emit('hit',{target:{id:n.id,name:n.name,npc:true},amount:9,after:{hp:0}})}catch(e){}}
  /* a gladiator falls with Animations Off → no 311 ghost, no 321 corpse: 404 draws him */
  const keepA=window.animOn;window.animOn=()=>false;const G=S.players[2];G.r=9;G.c=6;try{eliminate(G,{type:'env'})}finally{window.animOn=keepA}
  const ti=window.tokenImg,dc=window.drawCorpseFig;let tiN=0,inC=0;window.tokenImg=function(sp){if(inC&&sp&&typeof sp==='object')tiN++;return ti.apply(this,arguments)};
  window.drawCorpseFig=function(){inC++;try{return dc.apply(this,arguments)}finally{inC--}};
  const st0=typeof CV107!=='undefined'?{...CV107.stats}:null;
  for(let i=0;i<24;i++){draw();await W8(150)}
  const tiA=tiN;const st1=typeof CV107!=='undefined'?{...CV107.stats}:null;
  /* steady state: 10 more draws build nothing new */
  for(let i=0;i<10;i++)draw();const st2=typeof CV107!=='undefined'?{...CV107.stats}:null;
  /* the crew carts them out */
  for(const n of ns)n.gone=true;for(const pl of S.piles)if(pl.corpse)pl.gone=true;const st3a=typeof CV107!=='undefined'?{...CV107.stats}:null;tiN=0;
  for(let i=0;i<4;i++)draw();const st3=typeof CV107!=='undefined'?{...CV107.stats}:null;window.tokenImg=ti;window.drawCorpseFig=dc;
  const d=(a,b2,k)=>a&&b2?b2[k]-a[k]:0;
  return {on:typeof CV107!=='undefined'&&CV107.on,tiA,tiGone:tiN,d3:d(st0,st1,'d3'),g3:d(st0,st1,'g3'),lie:d(st0,st1,'lie'),base:d(st0,st1,'base'),
    built:d(st1,st2,'built'),lie2:d(st1,st2,'lie'),d32:d(st1,st2,'d3'),gone:st3a&&st3?(st3.d3+st3.lie+st3.g3)-(st3a.d3+st3a.lie+st3a.g3):0,
    piles:S.piles.filter(p=>p.corpse).length,c101:CORPSE101.filter(g=>g.S===S).length}});
/* ---- 1 with the sheets ---- */
const p1=await mk();const s1=await play(p1);await p1.close();
ok(s1.on&&s1.d3>=5*10&&s1.g3>=10&&s1.base===0&&s1.tiA===0,'1 3D corpses: beasts die4 + the gladiator fall frame, no old token picture '+JSON.stringify(s1));
ok(s1.built===0&&s1.d32>=50,'1b steady: nothing rebuilt per frame '+JSON.stringify(s1));
ok(s1.gone===0,'3 cleared corpses are not drawn '+JSON.stringify(s1));
/* ---- 2 sheets blocked ---- */
const p2=await mk({block:true});const s2=await play(p2);const noMini=p2.reqs.filter(u=>/minis8_|\/mini_(?!pillar)/.test(u));console.log('mini reqs',noMini);await p2.close();
ok(s2.on&&s2.d3===0&&s2.g3===0&&s2.lie>=6*10&&s2.base===0&&s2.tiA===0&&!noMini.length,'2 sheets blocked: lying stills, never the old minis '+JSON.stringify({...s2,noMini}));
ok(s2.built===0&&s2.lie2>=60,'2b lying canvases cached '+JSON.stringify(s2));
/* ---- 4 kill switch ---- */
const p4=await mk({off:true});const s4=await play(p4);await p4.close();
ok(!s4.on&&s4.tiA>0,'4 kill switch: 07\'s corpse (tokenImg) '+JSON.stringify(s4));
/* ---- 5 beta 4 (his note: a bear corpse 2–3 tiles big): LIVE board (Normal speed, Animations On), every system beast's corpse beside a
   living one of its kind, zoom 1 / 2, DPR 1 / 2, bases on / off, with sheets and blocked: the images each REALLY draws this frame (native
   drawImage, outside every wrapper) — the corpse's px per sheet px = the living beast's ±15 %, its visible body 0.75–1.15 × the living one's
   (a lying body is lower), centred on its own tile (≤ 0.3 tile); a gladiator's fall frame at the living scale ±15 %; 404's own checks quiet
   (CV107.stats.bad / insane 0); then a wrapper that draws the die frame 2.5× → that kind falls back to the lying still. ---- */
const sizes=p=>p.evaluate(async([z,nb,force])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;if(nb)SETTINGS.bases101=false;startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<120&&!(humanTurn()&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  SPEED='normal';XRAY='off';S.npcs=S.npcs.filter(n=>n.alive);S.npcs.forEach(n=>{n.r=0;n.c=12});S.players.forEach((q,i)=>{q.r=12;q.c=i});
  const kinds=[['bear','Ursa'],['wolf','Valencia'],['lion','Leo'],['tholo','Tholo'],['snake','Glykon'],['zora','Zora']];const pairs=[];
  kinds.forEach(([t,k],i)=>{const a=mkNPC(t,k,1+i*2,3),d=mkNPC(t,k,1+i*2,8);S.npcs.push(a,d);pairs.push([a,d])});
  if(z>1.01){CAM.z=z;S.zoomIn=true}for(let i=0;i<8;i++){draw();await W8(120)}
  for(const [a,d] of pairs){d.alive=false;try{BUS.emit('hit',{target:{id:d.id,name:d.name,npc:true},amount:9,after:{hp:0}})}catch(e){}}
  const keepA=window.animOn;window.animOn=()=>false;const G=S.players[2];G.r=11;G.c=6;try{eliminate(G,{type:'env'})}finally{window.animOn=keepA}
  const qs=[];const ck=cv107Check;cv107Check=function(k,sz,exp){if(exp>0&&sz.w>0)qs.push([k,+(sz.w/exp).toFixed(3)]);return ck.apply(this,arguments)};
  for(let i=0;i<24;i++){draw();await W8(150)}
  /* one frame recorded at the native call */
  const real=CanvasRenderingContext2D.prototype.drawImage,bn=BS101.nat;let cur=null;const rec=new Map();
  const tap=function(img){if(cur&&this===ctx&&!img._l106){try{const A=arguments;let sx=0,sy=0,sw,sh,dx,dy,dw,dh;if(A.length>=9){[sx,sy,sw,sh,dx,dy,dw,dh]=[...A].slice(1)}else if(A.length>=5){sw=img.width;sh=img.height;[dx,dy,dw,dh]=[...A].slice(1)}else{sw=img.width;sh=img.height;dx=A[1];dy=A[2];dw=sw;dh=sh}
      const m=this.getTransform();(rec.get(cur)||rec.set(cur,[]).get(cur)).push({img,sx,sy,sw,sh,dx,dy,dw,dh,m:[m.a,m.b,m.c,m.d,m.e,m.f],ga:this.globalAlpha})}catch(e){}}return real.apply(this,arguments)};
  const dn=drawNPC,dc=drawCorpseFig;const dead=S.npcs.filter(n=>!n.alive&&!n.gone);BS101.nat=tap;CanvasRenderingContext2D.prototype.drawImage=tap;
  drawNPC=function(n){const k=cur;cur=n.alive?n:cur;try{return dn.apply(this,arguments)}finally{cur=k}};
  drawCorpseFig=function(m){const k=cur;cur=dead.find(n=>{const c=center(n.r,n.c);return Math.abs(c.x-m.x)<0.5&&Math.abs(c.y-m.y)<0.5})||null;try{return dc.apply(this,arguments)}finally{cur=k}};
  try{draw()}finally{BS101.nat=bn;CanvasRenderingContext2D.prototype.drawImage=real;drawNPC=dn;drawCorpseFig=dc}
  const T=ctx.getTransform(),tw=TW*Math.hypot(T.a,T.b);
  const body=(ops,n)=>{ops=(ops||[]).filter(q=>q.ga>0.5);if(!ops.length)return null;let X0=1e9,Y0=1e9,X1=-1e9,Y1=-1e9;
    for(const q of ops)for(const [x,y] of [[q.dx,q.dy],[q.dx+q.dw,q.dy],[q.dx,q.dy+q.dh],[q.dx+q.dw,q.dy+q.dh]]){const X=q.m[0]*x+q.m[2]*y+q.m[4],Y=q.m[1]*x+q.m[3]*y+q.m[5];X0=Math.min(X0,X);X1=Math.max(X1,X);Y0=Math.min(Y0,Y);Y1=Math.max(Y1,Y)}
    X0=Math.floor(X0)-1;Y0=Math.floor(Y0)-1;const w=Math.ceil(X1)+1-X0,h=Math.ceil(Y1)+1-Y0;const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});
    for(const q of ops){g.setTransform(q.m[0],q.m[1],q.m[2],q.m[3],q.m[4]-X0,q.m[5]-Y0);real.call(g,q.img,q.sx,q.sy,q.sw,q.sh,q.dx,q.dy,q.dw,q.dh)}
    const d=g.getImageData(0,0,w,h).data;let k=0,sx=0,sy=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>=128){k++;sx+=x;sy+=y}
    const big=ops.reduce((p,q)=>q.dw*q.dh>p.dw*p.dh?q:p),M=BEAST100_META[bst100Key(n)];
    const m=center(n.r,n.c),tx=T.a*m.x+T.c*m.y+T.e,ty=T.b*m.x+T.d*m.y+T.f;
    return k?{lin:Math.sqrt(k),kpx:big.dw*Math.hypot(big.m[0],big.m[1])/(n.alive?M.iw[0]:M.aw[0]),offx:(X0+sx/k-tx)/tw,offy:(Y0+sy/k-ty)/tw}:null};
  const out=pairs.map(([a,d])=>{const A=body(rec.get(a),a),D=body(rec.get(d),d);return {t:a.t,A,D}});const st={...CV107.stats};const qs0=qs.slice();
  let forced=null;if(force){const bc=bst100Cell;bst100Cell=function(k,f,po,x,y){if(po&&po.name==='die4'&&k==='ursa'){ctx.save();ctx.translate(x,y);ctx.scale(2.5,2.5);ctx.translate(-x,-y);try{return bc.apply(this,arguments)}finally{ctx.restore()}}return bc.apply(this,arguments)};
    const l0=CV107.stats.lie;for(let i=0;i<4;i++){draw();await W8(60)}bst100Cell=bc;forced={bad:[...CV107.bad],lie:CV107.stats.lie-l0};
    /* v1.08c: a die frame the probe cannot see (nothing measured) is not trusted either; and an absolute size cap (tiles) */
    CV107.bad.delete('ursa');const b0=CV107.stats.blind;bst100Cell=function(k,f,po,x,y){if(po&&po.name==='die4'&&k==='ursa')return y;return bc.apply(this,arguments)};
    for(let i=0;i<3;i++){draw();await W8(60)}bst100Cell=bc;forced.blind=CV107.bad.has('ursa')&&CV107.stats.blind>b0;
    CV107.bad.delete('ursa');const big0=CV107.stats.bad,mt=CV107.maxTiles;CV107.maxTiles=0.3;for(let i=0;i<3;i++){draw();await W8(60)}CV107.maxTiles=mt;forced.cap=CV107.stats.bad>big0}
  cv107Check=ck;return {out,qs:qs0,st,forced}},[p.z,p.nb,!!p.force]);
/* pixels are read back here: served over http (file:// taints the canvas) */
const http=require('http'),fs=require('fs');const root=path.dirname(page);const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL5='http://127.0.0.1:'+srv.address().port+'/'+path.basename(page);
const WK={flavius_v107safariforce:'1'},WK1={flavius_v107safariforce:'1',flavius_v107dpr:'1'},WK2={flavius_v107safariforce:'1',flavius_x2force:'1'};
for(const C of [{dpr:1,z:1},{dpr:2,z:1,nb:true},{dpr:1,z:2},{dpr:2,z:2,force:true},{dpr:2,z:1,block:true},{dpr:2,z:2,ls:WK,wk:'wk'},{dpr:2,z:2,ls:WK1,wk:'wk dpr1'},{dpr:2,z:1,ls:WK2,wk:'wk 2x'}]){const p5=await mk({dpr:C.dpr,block:C.block,url:URL5,ls:C.ls});Object.assign(p5,C);const r=await sizes(p5);await p5.close();
  const tag=`5 dpr ${C.dpr} zoom ${C.z}${C.wk?' '+C.wk:''}${C.nb?' bases off':''}${C.block?' sheets blocked':''}`;
  for(const e of r.out){if(!e.A||!e.D){ok(false,tag+' '+e.t+': drawn '+JSON.stringify(e));continue}
    const k=e.D.kpx/e.A.kpx,l=e.D.lin/e.A.lin;
    if(!C.block)ok(k>0.85&&k<1.15,`${tag} ${e.t}: the corpse at the living scale (${k.toFixed(2)}×)`);
    ok(l>0.75&&l<1.15,`${tag} ${e.t}: the corpse's visible body ${l.toFixed(2)}× the living one's`);
    ok(Math.abs(e.D.offx)<0.3&&Math.abs(e.D.offy)<0.3,`${tag} ${e.t}: the corpse on its own tile `+JSON.stringify(e.D))}
  const g=r.qs.filter(q=>q[0].startsWith('g:'));
  if(!C.block)ok(g.length&&g.every(q=>q[1]>0.85&&q[1]<1.15)&&r.qs.every(q=>q[1]>0.85&&q[1]<1.15),tag+': every drawn die / fall frame at the living scale '+JSON.stringify(r.qs.slice(-8)));
  ok(r.st.bad===0&&r.st.insane===0&&!r.st.blind,tag+': 404\'s checks quiet '+JSON.stringify(r.st));
  if(C.force)ok(r.forced&&r.forced.blind&&r.forced.cap,tag+': an unmeasurable die frame / an over-size body → the lying still '+JSON.stringify(r.forced));
  if(C.force)ok(r.forced&&r.forced.bad.includes('ursa')&&r.forced.lie>0,tag+': a die frame drawn 2.5× → that kind lies as the still '+JSON.stringify(r.forced))}
srv.close();await b.close();
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));process.exit(miss.length||errs.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});

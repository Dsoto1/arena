/* v1.05 B36 · the ACTIVE gladiator on his move is never see-through, every floor mark stays under him, and with bases off no base-sized disc
   (366-v105fixb3). See-through stays at its default 'auto' (tv104i / tv104l ran with it off and never saw B36). Setup: 3D minis, the human's
   move phase (orange move tiles round him), beside a pillar at the arena edge, a wolf in front of him.
   (1) STILL: his figure is drawn at full opacity, his gold ring / seat ring / shadow are painted before his figure and no floor-mark ellipse
       at his cell comes after it; the wolf in front of his tile still fades (see-through kept for the others);
   (2) hovering a move tile behind him: still opaque;  (3) GLIDING (just moved): the same;  (4) zoomed in: the same;
   (5) BASES OFF: over still, gliding and zoom frames every shadow disc of a piece is base-less size (the pass used to repaint it full size),
       every 3D figure cell is base-less (BS101 _off), the active figure stays opaque;
   (6) kill switch flavius_v105b3off=1: the active piece fades again (beta 1) and the pass draws the full-size disc;  (7) draw cost. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async ls=>{const c=await b.newContext({viewport:{width:1440,height:900}});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}menuHide()});return pg};
const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;SETTINGS.calm=false;
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='pause';
  XRAY='auto';const p=cur();p.r=5;p.c=1;const pl=[[3,8],[9,9],[11,4]];S.players.filter(q=>q!==p).forEach((q,i)=>{q.r=pl[i][0];q.c=pl[i][1]});
  for(const n of S.npcs)if(n.alive&&!n.out&&n.r===5&&n.c===1){n.r=9;n.c=6}
  const w=S.npcs.find(n=>n.alive&&!n.out&&n.t!=='zora'&&n.r===6&&n.c===1)||S.npcs.find(n=>n.alive&&!n.out&&n.t==='wolf');if(w){w.r=6;w.c=1}
  S.mode='move';computeHL();render();for(let i=0;i<30;i++){draw();await W8(60)}
  return {human:humanTurn(),on:typeof B3105!=='undefined'&&!B3105.off,move:[...HL.values()].filter(h=>h.t==='move').length,wolf:!!w}});
/* one draw() of the active piece: alpha at his figure images, floor marks at his cell before / after his figure, the wolf's alpha, shadow sizes. mk = code run just before the draw */
const probe=(pg,mk)=>pg.evaluate(async(mk)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));S.mode='move';computeHL();for(let i=0;i<4;i++){draw();await W8(40)}
  if(mk)eval(mk);
  const p=cur(),wolf=S.npcs.find(n=>n.alive&&!n.out&&n.r===6&&n.c===1);const log=[];const P=CanvasRenderingContext2D.prototype,C=ctx;let pth=[],inA=0,inO=0,inPieces=0,dev=0,fa=null,wa=null;
  const dv=(t,x,y)=>({x:t.a*x+t.c*y+t.e,y:t.b*x+t.d*y+t.f});
  const oB=P.beginPath,oE=P.ellipse,oF=P.fill,oS=P.stroke;
  P.beginPath=function(){if(this===C)pth=[];return oB.apply(this,arguments)};
  P.ellipse=function(x,y,rx,ry){if(this===C){const t=this.getTransform(),d=dv(t,x,y);pth.push({x:d.x,y:d.y,rx:rx*t.a})}return oE.apply(this,arguments)};
  P.fill=function(){if(this===C&&inPieces)for(const g of pth)log.push({k:'fill',g,s:String(this.fillStyle),inA,inO});return oF.apply(this,arguments)};
  P.stroke=function(){if(this===C&&inPieces)for(const g of pth)log.push({k:'stroke',g,s:String(this.strokeStyle),inA,inO});return oS.apply(this,arguments)};
  const B1=typeof BS101!=='undefined'&&BS101.nat?BS101:null,oD=B1?B1.nat:P.drawImage;
  const hk=function(im){if(this===C&&inA&&im&&(im.width>20||im.naturalWidth>20)){log.push({k:'img',inA});if(fa==null||this.globalAlpha<fa)fa=this.globalAlpha}return oD.apply(this,arguments)};if(B1)B1.nat=hk;else P.drawImage=hk;
  const o1=floor104;floor104=function(){inPieces=1;dev=TW*ctx.getTransform().a;return o1.apply(this,arguments)};
  const o2=drawPlayer;drawPlayer=function(q){if(q===p)inA++;else inO++;try{return o2.apply(this,arguments)}finally{if(q===p)inA--;else inO--}};
  const o3=drawNPC;drawNPC=function(n){if(n===wolf)wa=ctx.globalAlpha;inO++;try{return o3.apply(this,arguments)}finally{inO--}};
  const o4=drawPillar;drawPillar=function(){inO++;try{return o4.apply(this,arguments)}finally{inO--}};
  const oe=floor104End;floor104End=function(){const r=oe.apply(this,arguments);return r};
  const pr0=bs101Proc;let cells=0,based=0;bs101Proc=function(img,sx,sy,sw,sh,f,ax,ay,ppm,mode){const r=pr0.apply(this,arguments);if(mode===2){cells++;if(!r._off)based++}return r};
  try{draw()}finally{P.beginPath=oB;P.ellipse=oE;P.fill=oF;P.stroke=oS;if(B1)B1.nat=oD;else P.drawImage=oD;floor104=o1;drawPlayer=o2;drawNPC=o3;floor104End=oe;bs101Proc=pr0;drawPillar=o4}
  const gold=log.find(e=>e.k==='stroke'&&e.s==='#f0cf7d'&&!e.inA),c0=gold?gold.g:null;
  const at=e=>c0&&e.k!=='img'&&!e.inO&&Math.abs(e.g.x-c0.x)<dev*0.3&&Math.abs(e.g.y-c0.y)<dev*0.12;
  const fi=log.findIndex(e=>e.k==='img'&&e.inA),li=log.map(e=>e.k==='img'&&e.inA).lastIndexOf(true);
  const before=log.filter((e,i)=>i<fi&&at(e)).length,after=log.filter((e,i)=>i>fi&&at(e)).map(e=>e.k+':'+e.s+(e.inA?'(in)':''));
  const sh=log.filter(e=>e.k==='fill'&&/0, 0, 0, 0\.32/.test(e.s)).map(e=>+(e.g.rx/dev).toFixed(3));
  return {fa,wa,fig:fi>=0,before,after,dev:+dev.toFixed(1),sh,cells,based,mode:S.mode,xray:XRAY}},mk);
const GL="SPEED='normal';{const p=cur();p.c+=1;const s=an100St(p);an100Glide(p);s.gd=4000;s.gt0=an100Now()-1200}";
const UNGL="{const p=cur();const s=an100St(p);s.gd=0;p.c=1;SPEED='pause'}";
const ZOOM=async pg=>{await pg.evaluate(async()=>{document.getElementById('btnZoom').click();const raf=()=>new Promise(r=>requestAnimationFrame(r));const t=performance.now();while(performance.now()-t<2200)await raf()})};

let pg=await open();const st=await start(pg);ok(st.human&&st.on&&st.move>3&&st.wolf,'0 human moves (move tiles shown), module on, wolf in front '+JSON.stringify(st));
/* ---- 1 · still ---- */
const A=await probe(pg);
ok(A.fig&&A.fa===1,'1a active figure drawn at full opacity in See-through auto '+JSON.stringify(A));
ok(A.before>=2&&A.after.length===0,'1b floor marks at his cell before his figure, none after '+JSON.stringify({before:A.before,after:A.after}));
ok(A.wa!=null&&A.wa<1,'1c the wolf in front of his tile still fades '+A.wa);
/* ---- 2 · hover a move tile behind him ---- */
const H=await probe(pg,"hoverTile={r:4,c:1}");await pg.evaluate(()=>{hoverTile=null});
ok(H.fa===1&&H.after.length===0,'2a hovering a tile behind him: still opaque, nothing over him '+JSON.stringify(H));
/* ---- 3 · gliding ---- */
const G=await probe(pg,GL);await pg.evaluate(UNGL);
ok(G.fa===1&&G.after.length===0&&G.before>=2,'3a gliding: opaque, floor marks under '+JSON.stringify(G));
/* ---- 4 · zoomed ---- */
await ZOOM(pg);const Z=await probe(pg);
ok(Z.fa===1&&Z.after.length===0&&Z.before>=2,'4a zoomed: opaque, floor marks under '+JSON.stringify(Z));
await ZOOM(pg);
/* ---- 5 · bases off ---- */
await pg.evaluate(async()=>{SETTINGS.bases101=false;applySettings();XRAY='auto';for(let i=0;i<6;i++){draw();await new Promise(r=>setTimeout(r,60))}});
const BO=[await probe(pg),await probe(pg,GL)];await pg.evaluate(UNGL);await ZOOM(pg);BO.push(await probe(pg));await ZOOM(pg);BO.push(await probe(pg));
for(const [i,R] of BO.entries()){ok(R.sh.length&&R.sh.every(v=>v<=0.38),'5a bases off frame '+i+': every shadow disc is base-less size (≤0.38 TW: ×0.62 of the bases-on 0.44 / 0.605) '+JSON.stringify(R.sh));
  ok(R.based===0,'5b bases off frame '+i+': every 3D cell base-less '+JSON.stringify([R.cells,R.based]));
  ok(R.fa===1&&R.after.length===0,'5c bases off frame '+i+': active opaque, nothing over him '+JSON.stringify({fa:R.fa,after:R.after}))}
await pg.context().close();
/* ---- 6 · switch ---- */
pg=await open({flavius_v105b3off:'1'});const st2=await start(pg);ok(st2.human,'6a switch: start');
const K=await probe(pg);ok(K.fa!=null&&K.fa<1,'6b switch off: the active piece fades on his move again (beta 1) '+JSON.stringify(K));
await pg.evaluate(async()=>{SETTINGS.bases101=false;applySettings();XRAY='auto';for(let i=0;i<6;i++){draw();await new Promise(r=>setTimeout(r,60))}});
const K2=await probe(pg);ok(K2.sh.some(v=>v>0.4),'6c switch off + bases off: the pass draws the full-size disc (B36 bases) '+JSON.stringify(K2.sh));
await pg.context().close();
/* ---- 7 · cost ---- */
pg=await open();await start(pg);
const cost=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<6;i++){draw();await W8(30)}
  const run=()=>{const t=performance.now();for(let i=0;i<60;i++)draw();return (performance.now()-t)/60};B3105.off=false;const on=Math.min(run(),run(),run());B3105.off=true;const off=Math.min(run(),run(),run());B3105.off=false;return {on:+on.toFixed(2),off:+off.toFixed(2)}});
ok(cost.on<=cost.off*1.15+1.5,'7a 366 costs no more than +15%/1.5 ms a frame '+JSON.stringify(cost));
console.log('COST',JSON.stringify(cost));
await b.close();srv.close();
console.log('ERRS',JSON.stringify(errs.slice(0,5)));if(errs.length)miss.push('page errors');
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS');process.exit(miss.length?1:0)})();

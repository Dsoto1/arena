/* v1.04 B31 + B32 · the active ring / white marks never cross a figure (359-v104fixb2). Checks, with 3D minis on, the active gladiator beside a pillar
   at the arena edge: (1) STILL: the gold ring and the seat rim are floor marks (bits 1 + 16) painted before the first figure, no rim arc after it;
   (2) JUST MOVED / GLIDING (the case 356 skipped): the same bits are painted, shifted by the glide offset, no rim arc, the ring stroke comes before the
   figure image; (3) a SHOVED piece (PUSH100) too; (4) an attack-target ring under a piece is painted in the pass (before the figure) and skipped by
   the overlays loop; (6) kill switch flavius_v104b2off=1: the gliding piece draws the rim arc again; (7) Animations Off: order holds; (8) draw cost. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async ls=>{const c=await b.newContext({viewport:{width:1440,height:900}});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_light106','off');/* v1.06a: the flat-disc path = 399 Lighting Off (the light pass: tv106l) */for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}menuHide()});return pg};
const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SETTINGS.briefing=false;SETTINGS.calm=false;
  startEvent({ev:'democritus',loc:6,seed:777,seats:[{cls:'soldier'},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:0}});
  await W8(1200);SPEED='snap';for(let i=0;i<160&&!(humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(200)}while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(150)}SPEED='pause';
  XRAY='off';const pl=[[6,1],[3,8],[9,9],[11,4]];S.players.forEach((p,i)=>{p.r=pl[i][0];p.c=pl[i][1]});
  render();for(let i=0;i<30;i++){draw();await W8(60)}return {human:humanTurn(),on:typeof FL104!=='undefined'&&!FL104.off}});
/* one draw() with the order of: floor pass, piece drawers, figure images, rim arcs, gold / target strokes. (321 patches ctx.drawImage on the instance, so images are counted on BS101.nat.) mk = code run just before the draw */
const probe=(pg,mk)=>pg.evaluate(async(mk)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<4;i++){draw();await W8(40)}
  if(mk)eval(mk);
  const RING=(()=>{const c=document.createElement('canvas').getContext('2d');c.strokeStyle=TB.ring;return String(c.strokeStyle)})();const log=[];const P=CanvasRenderingContext2D.prototype,oE=P.ellipse,oS=P.stroke,B1=typeof BS101!=='undefined'&&BS101.nat?BS101:null,oD=B1?B1.nat:P.drawImage; /* 321 patches ctx.drawImage on the instance and calls BS101.nat */
  P.ellipse=function(x,y,rx,ry,rot,a0,a1){if(a0>0.04&&a0<0.06&&a1>3.0&&a1<3.1)log.push('rimarc');return oE.apply(this,arguments)};
  P.stroke=function(){const s=String(this.strokeStyle);if(s==='#f0cf7d')log.push('gold');else if(s===RING)log.push('atk');return oS.apply(this,arguments)};
  const hk=function(im){if(im&&(im.width>20||im.naturalWidth>20)&&!(im.id==='cv'))log.push('img');return oD.apply(this,arguments)};if(B1)B1.nat=hk;else P.drawImage=hk;
  const o1=floor104;floor104=function(){log.push('floor');return o1.apply(this,arguments)};
  const o2=drawPlayer;drawPlayer=function(){log.push('P');return o2.apply(this,arguments)};
  const o3=drawNPC;drawNPC=function(){log.push('N');return o3.apply(this,arguments)};
  const oe=floor104End;let bits=null;floor104End=function(){try{bits=FL104.done.get(cur())}catch(e){}return oe.apply(this,arguments)};
  try{draw()}finally{P.ellipse=oE;P.stroke=oS;if(B1)B1.nat=oD;else P.drawImage=oD;floor104=o1;drawPlayer=o2;drawNPC=o3;floor104End=oe}
  const fi=log.indexOf('floor'),fp=log.findIndex(x=>x==='P'||x==='N'),lastGold=log.lastIndexOf('gold'),lastAtk=log.lastIndexOf('atk'),lastP=log.lastIndexOf('P');
  return {log:log.join(' ').replace(/(\b\w+\b)( \1)+/g,'$1+').slice(0,300),floorFirst:fi>=0&&fi<fp,arcs:log.filter(x=>x==='rimarc').length,bits,
    goldBeforeFigure:lastGold<0||lastGold<fp,atkBeforeFigure:lastAtk<0?null:lastAtk<fp,atkAfterPieces:lastAtk>lastP&&lastP>=0}},mk);
const GL="SPEED='normal';{const p=cur();p.c+=1;const s=an100St(p);an100Glide(p);s.gd=4000;s.gt0=an100Now()-1200}";

let pg=await open();const st=await start(pg);ok(st.human&&st.on,'0 human acts, module on '+JSON.stringify(st));
const b2on=await pg.evaluate(()=>typeof B2104!=='undefined'&&!B2104.off);ok(b2on,'0b module 359 on');
/* ---- 1 · still ---- */
const A=await probe(pg);
ok(A.floorFirst&&A.arcs===0&&A.bits&&(A.bits&1)&&(A.bits&16),'1a still active: ring + rim are floor marks, no arc after the figure '+JSON.stringify(A));
ok(A.goldBeforeFigure,'1b gold ring stroke before the first figure image '+A.log);
/* ---- 2 · gliding (just moved) ---- */
const G=await probe(pg,GL);
ok(G.floorFirst&&G.arcs===0,'2a gliding active piece: no rim arc after the figure '+JSON.stringify(G));
ok(G.bits&&(G.bits&1)&&(G.bits&16)&&(G.bits&64),'2b gliding: ring (1) + rim (16) + shadow (64) painted by the pass '+JSON.stringify(G.bits));
ok(G.goldBeforeFigure,'2c gliding: gold ring stroke before the first figure image '+G.log);
const off=await pg.evaluate(()=>fl104Offs(cur(),false));ok(off&&Math.abs(off.dx)+Math.abs(off.dy)>1,'2d the pass shifts the marks by the glide offset '+JSON.stringify(off));
/* ---- 3 · shoved ---- */
const Sh=await probe(pg,"{const p=cur();const s=an100St(p);s.gd=0;s.gr=p.r;s.gc=p.c;PUSH100.live.set(p,{r0:p.r,c0:p.c-1,r1:p.r,c1:p.c,k:0.5,role:'pushed'})}");
await pg.evaluate(()=>{PUSH100.live.clear()});
ok(Sh.arcs===0&&Sh.bits&&(Sh.bits&1),'3a shoved piece: marks under it, no arc '+JSON.stringify(Sh));
/* ---- 4 · an attack-target ring under a piece ---- */
await pg.evaluate(()=>{const q=S.players[1];q.r=6;q.c=2});
/* draw() rebuilds HL, so the attack highlight is put in just before the pass runs */
const T=await probe(pg,"{const o=floor104;window.__f0=o;floor104=function(){const q=S.players[1];HL.set(q.r*N+q.c,{t:'atk'});return o.apply(this,arguments)}}");
await pg.evaluate(()=>{floor104=window.__f0});
ok(T.atkBeforeFigure===true&&!T.atkAfterPieces,'4a target ring painted before the figures, not again in overlays '+T.log);
await pg.context().close();
/* ---- 6 · switch ---- */
pg=await open({flavius_v104b2off:'1'});const st2=await start(pg);ok(st2.human,'6a switch: start');
const K=await probe(pg,GL);
ok(K.bits==null&&!K.goldBeforeFigure,'6b switch off: the gliding piece is skipped by the pass and draws inline again (beta 1) '+JSON.stringify(K));
await pg.context().close();
/* ---- 7 · Animations Off + 8 · cost ---- */
pg=await open();await start(pg);
await pg.evaluate(()=>{SETTINGS.anim88='off';SETTINGS.reduceMotion=true;draw()});const O=await probe(pg);
ok(O.floorFirst&&O.arcs===0&&O.goldBeforeFigure,'7a Animations Off: order holds '+O.log);
await pg.evaluate(()=>{delete SETTINGS.anim88;delete SETTINGS.reduceMotion});
const cost=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<6;i++){draw();await W8(30)}
  const run=()=>{const t=performance.now();for(let i=0;i<60;i++)draw();return (performance.now()-t)/60};B2104.off=false;const on=Math.min(run(),run(),run());B2104.off=true;const off=Math.min(run(),run(),run());B2104.off=false;return {on:+on.toFixed(2),off:+off.toFixed(2)}});
ok(cost.on<=cost.off*1.15+1.5,'8a b2 extras cost no more than +15%/1.5 ms a frame '+JSON.stringify(cost));
console.log('COST',JSON.stringify(cost));
await b.close();srv.close();
console.log('ERRS',JSON.stringify(errs.slice(0,5)));if(errs.length)miss.push('page errors');
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS');process.exit(miss.length?1:0)})();

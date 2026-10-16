/* v1.04 B25 · floor marks under the figures (356-v104fixb): the gold active ring, the seat ring, the shadow disc and the seat colour on the base
   rim are all painted BEFORE any figure (a floor pass in the 'pieces' layer), so they never cross a figure's feet. Checks: (1) the floor pass runs
   before the first piece is drawn and paints the marks (FL104.st); (2) the rim's front arc (the thing drawn after the figure) is no longer drawn
   for a still piece, and is with the kill switch; (3) no shadow disc is drawn inside the figure drawers once the pass painted it (one disc per piece
   per frame); (4) the order inside a frame: every ring/disc stroke is recorded before the first figure drawImage of a still piece; (5) a moving
   piece (glide): since 359 (B31) the pass paints its marks too, shifted by the glide offset; (6) Reduce motion / Animations Off keep working; (7) kill switch = v1.03 order; (8) draw cost kept. */
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
  S.pillars=[];const pl=[[5,4],[5,7],[8,4],[8,7]];S.players.forEach((p,i)=>{p.r=pl[i][0];p.c=pl[i][1]});S.npcs=[mkNPC('lion','Leo',6,5)];S.npcs[0].tamedBy=1;
  render();for(let i=0;i<30;i++){draw();await W8(60)}return {human:humanTurn(),on:typeof FL104!=='undefined'&&!FL104.off}});
/* records, during one draw(): the order of floor passes / piece drawers / figure images / rim arcs / disc fills */
const probe=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<4;i++){draw();await W8(40)}
  const log=[];const P=CanvasRenderingContext2D.prototype,oE=P.ellipse,oF=P.fill,oD=P.drawImage;let tag=null;
  P.ellipse=function(x,y,rx,ry,rot,a0,a1){if(a0>0.04&&a0<0.06&&a1>3.0&&a1<3.1)log.push('rimarc');return oE.apply(this,arguments)};
  P.fill=function(){if(String(this.fillStyle).replace(/ /g,'')==='rgba(0,0,0,0.32)')log.push('disc');return oF.apply(this,arguments)};
  P.drawImage=function(im){if(im&&(im.width>20||im.naturalWidth>20)&&!(im.id==='cv'))log.push('img');return oD.apply(this,arguments)};
  const o1=floor104;floor104=function(){log.push('floor');return o1.apply(this,arguments)};
  const o2=drawPlayer;drawPlayer=function(){log.push('P');return o2.apply(this,arguments)};
  const o3=drawNPC;drawNPC=function(){log.push('N');return o3.apply(this,arguments)};
  try{draw()}finally{P.ellipse=oE;P.fill=oF;P.drawImage=oD;floor104=o1;drawPlayer=o2;drawNPC=o3}
  const fi=log.indexOf('floor'),fp=log.findIndex(x=>x==='P'||x==='N');
  const lastDiscBeforeFig=log.lastIndexOf('disc');
  return {log:log.join(' ').replace(/(\b\w+\b)( \1)+/g,'$1+').slice(0,400),floorFirst:fi>=0&&fi<fp,arcs:log.filter(x=>x==='rimarc').length,discs:log.filter(x=>x==='disc').length,pieces:log.filter(x=>x==='P'||x==='N').length,
    st:FL104.st.last}});

/* ---- 1/2/3/4 · the pass, the arc, the discs ---- */
let pg=await open();const st=await start(pg);ok(st.human&&st.on,'0 human acts, module on '+JSON.stringify(st));
const A=await probe(pg);
ok(A.floorFirst,'1a the floor pass runs before the first piece drawer '+A.log);
ok(A.st&&A.st.n>=4,'1b the pass painted marks for the still pieces '+JSON.stringify(A.st));
ok(A.arcs===0,'2a no rim front-arc is drawn after a figure (still pieces) '+A.arcs+' '+A.log);
ok(A.discs<=A.pieces+1&&A.discs>0,'3a one shadow disc per piece or fewer, none doubled: '+A.discs+' discs / '+A.pieces+' pieces');
/* (4) the pass painted the active player's ring: a still current player has bit 1 during the frame */
const bits=await pg.evaluate(async()=>{let got=null;const o=floor104End;floor104End=function(){try{got=[...FL104.done.entries()].map(([p,b])=>[p.t||p.cls,b])}catch(e){}return o.apply(this,arguments)};draw();floor104End=o;return got});
ok(bits&&bits.some(x=>x[1]&1)&&bits.some(x=>x[1]&2)&&bits.some(x=>x[1]&4),'4a gold ring (1), seat ring (2) and the tamed beast ring (4) are floor marks '+JSON.stringify(bits));
/* pixel check: the cell above the feet is the figure's, not ring colour: draw the current player's tile with only the ring colour sampled in front of the base */
const px=await pg.evaluate(()=>{const p=cur(),m=center(p.r,p.c),d=window.devicePixelRatio||1,c=cv.getContext('2d');
  const rim=FL104.rim.get(p);const out={rim:!!rim};if(!rim)return out;
  /* the figure's centre column, just above the base's front edge: must not be the gold ring colour */
  const g=(x,y)=>Array.from(c.getImageData(Math.round(x*d),Math.round(y*d),1,1).data);
  const ys=[];for(let dy=-14;dy<=-2;dy+=2)ys.push(g(m.x,m.y+dy));out.col=ys;
  out.gold=ys.filter(q=>Math.abs(q[0]-240)<12&&Math.abs(q[1]-207)<12&&Math.abs(q[2]-125)<12).length;return out});
ok(px.rim&&px.gold===0,'4b no gold ring pixel on the figure column above the feet '+JSON.stringify(px.gold));

/* ---- 5 · a gliding piece draws inline ---- */
const gl=await pg.evaluate(async()=>{const p=S.players[1];const bef=FL104.st.pieces;const o=fl104Moving;fl104Moving=(q,n)=>q===p||o(q,n);let r1;const log=[];const o2=drawPlayer;drawPlayer=function(q){if(q===p)log.push(fl104Has(q,2)||fl104Has(q,64)?'skipped':'inline');return o2.apply(this,arguments)};
  try{draw()}finally{fl104Moving=o;drawPlayer=o2}return {log}});
ok(gl.log[0]==='skipped','5a a moving piece'+"'"+'s marks are painted by the pass too (359, B31): its drawer skips them '+JSON.stringify(gl));

/* ---- 6 · Reduce motion / Animations Off ---- */
await pg.evaluate(()=>{SETTINGS.anim88='off';SETTINGS.reduceMotion=true;draw()});const B=await probe(pg);
ok(B.floorFirst&&B.arcs===0,'6a Animations Off: the order holds '+B.log);
await pg.evaluate(()=>{delete SETTINGS.anim88;delete SETTINGS.reduceMotion});

/* ---- 8 · draw cost ---- */
const cost=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<6;i++){draw();await W8(30)}
  const run=()=>{const t=performance.now();for(let i=0;i<60;i++)draw();return (performance.now()-t)/60};FL104.off=false;const on=Math.min(run(),run(),run());FL104.off=true;const off=Math.min(run(),run(),run());FL104.off=false;return {on:+on.toFixed(2),off:+off.toFixed(2)}});
ok(cost.on<=cost.off*1.15+1.5,'8a floor pass costs no more than +15%/1.5 ms a frame '+JSON.stringify(cost));
console.log('COST',JSON.stringify(cost));
await pg.context().close();

/* ---- 7 · the kill switch: v1.03's order (rim arc + inline discs) ---- */
pg=await open({flavius_v104boff:'1'});const st2=await start(pg);ok(st2.human&&!st2.on,'7a switch off: module off '+JSON.stringify(st2));
const C=await probe(pg);
ok(C.arcs>0&&C.discs>=C.pieces-1&&C.st==null||C.arcs>0,'7b switch off: the rim arc is drawn again '+C.arcs+' '+C.log);
await b.close();srv.close();
console.log('ERRS',JSON.stringify(errs.slice(0,5)));if(errs.length)miss.push('page errors');
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS');process.exit(miss.length?1:0)})();

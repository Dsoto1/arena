/* v1.0 perf: what a zoomed frame costs to RASTERISE (the canvas flush Chrome does at commit), per board layer.
   A paused board, the camera moved a little each draw; draw() + getImageData(0,0,1,1) (forces the flush) timed; then again with each layer
   switched off (LAYERS93.debugOff) — the drop is that layer's raster + script cost. Median of N draws. node tools/perf95/zoomflush.js <page> [N] */
const {chromium}=require('playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||'flavius-arena.html'),NF=+(process.argv[3]||24);
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());
await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},JSON.parse(process.env.LS||'{}'));
await pg.goto(await require('./serve.js')(PAGE),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const r=await pg.evaluate(async NF=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed:11,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
  for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8)break}
  SPEED='pause';await W8(3000);const raf=()=>new Promise(r=>requestAnimationFrame(r));
  const cf=camFocus;camFocus=function(Wd,Hd){return {r:CAM.fr,c:CAM.fc,x:Wd/2,y:Hd*0.5}};const p=cur();
  const meas=async(z,off)=>{S.zoomIn=z;off.forEach(n=>LAYERS93.dbg.add(n));for(let i=0;i<14;i++){CAM.fr=p.r;CAM.fc=p.c;draw();await W8(100)}
    const D=[],F=[];for(let i=0;i<NF;i++){CAM.fr=p.r+Math.sin(i/4)*0.6;CAM.fc=p.c+Math.cos(i/4)*0.6;const t=performance.now();draw();const t1=performance.now();ctx.getImageData(0,0,1,1);const t2=performance.now();D.push(t1-t);F.push(t2-t1);await raf()}
    off.forEach(n=>LAYERS93.dbg.delete(n));const q=a=>+a.slice().sort((x,y)=>x-y)[a.length>>1].toFixed(1);return {draw:q(D),flush:q(F)}};
  const out={};const names=LAYERS93.defs.map(d=>d[0]);
  for(const z of [false,true]){const k=z?'zoomed':'flat';out[k]={all:await meas(z,[])};for(const n of names)out[k][n]=await meas(z,[n]);out[k].all2=await meas(z,[])}
  camFocus=cf;return out},NF);
for(const k in r){console.log(k+' all '+JSON.stringify(r[k].all)+' '+JSON.stringify(r[k].all2));for(const n in r[k])if(!/^all/.test(n))console.log('  -'+n.padEnd(10)+' draw '+r[k][n].draw+' flush '+r[k][n].flush)}
await b.close()})();

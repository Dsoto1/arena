/* v1.0 perf A/B: a paused zoomed board, the camera panned one step a frame (as the follow camera does), N frames per variant, all in ONE page
   (so machine load hits every variant alike). node tools/perf95/zoomab.js <page> [frames]  → per variant: draw p50/p95/max, frame p50/p95, layer avg. */
const {chromium}=require('playwright');const path=require('path');
const PAGE=path.resolve(process.argv[2]||'flavius-arena.html'),NF=+(process.argv[3]||60);
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());
await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},JSON.parse(process.env.LS||'{}'));
await pg.goto(await require('./serve.js')(PAGE),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const r=await pg.evaluate(async NF=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='pause';startEvent({ev:'democritus',loc:6,seed:11,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
  for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8)break}
  SPEED='pause';await W8(1500);
  const raf=()=>new Promise(r=>requestAnimationFrame(r));
  /* one pass: zoom z, pan the camera along a path (CAM.fr/fc driven directly, like camFocus easing) */
  const pass=async(name,setup,z=true)=>{setup&&setup(true);S.zoomIn=z;const p=cur();const pts=[];{const T=[[1,1],[11,11],[1,11],[11,1],[6,6],[0,12]];let r=6,c=6;for(let i=0;i<NF;i++){const g=T[Math.floor(i*T.length/NF)];r+=(g[0]-r)*0.18;c+=(g[1]-c)*0.18;pts.push([r,c])}} /* turn changes: the follow camera's 18% easing toward each corner */
    const cf=camFocus;camFocus=function(Wd,Hd){if(!S)return null;return {r:CAM.fr,c:CAM.fc,x:Wd/2,y:Hd*0.5}};
    for(let i=0;i<8;i++){CAM.fr=pts[0][0];CAM.fc=pts[0][1];draw();await raf()}
    if(LAYERS93.reset)LAYERS93.reset();const D=[],Fr=[],L=[];if(typeof Z100!=='undefined')for(const k in Z100.stats)Z100.stats[k]=0;let last=performance.now();
    for(let i=0;i<NF;i++){CAM.fr=pts[i][0];CAM.fc=pts[i][1];if(window.__pinch)CAM.z=1.3+0.6*Math.abs(Math.sin(i/12));const a0=AR92.n,z0=Z99.stats.builds,b0=Z99.stats.bitmaps;const t=performance.now();draw();const dd=performance.now()-t;D.push(dd);if(dd>25)L.push(Math.round(dd)+(AR92.n!==a0?'S':'')+(Z99.stats.builds!==z0?'T':''));const ts=await raf();Fr.push(ts-last);last=ts}
    camFocus=cf;setup&&setup(false);CAM.z=null;const s=a=>a.slice().sort((x,y)=>x-y),q=(a,p)=>+s(a)[Math.floor(p*(a.length-1))].toFixed(1);
    const lay=LAYERS93.report().rows.filter(r=>(r.avg||0)>0.4).map(r=>r.name+':'+r.avg.toFixed(1));
    return name+' draw p50 '+q(D,.5)+' p95 '+q(D,.95)+' max '+q(D,1)+' | frame p50 '+q(Fr.slice(1),.5)+' p95 '+q(Fr.slice(1),.95)+' | '+lay.join(' ')+' | long '+L.join(',')+' | '+(typeof Z100!=='undefined'?JSON.stringify(Z100.stats):'')};
  const out=[];
  const Zon=on=>{if(typeof Z100!=='undefined')Z100.on=on};
  for(let k=0;k<(+window.__reps||1);k++){
  out.push(await pass('unzoomed      ',null,false));
  out.push(await pass('zoomed z100off',on=>Zon(!on)));
  out.push(await pass('zoomed z100on ',null));
  out.push(await pass('pinch z100off ',on=>{Zon(!on);window.__pinch=on}));
  out.push(await pass('pinch z100on  ',on=>{window.__pinch=on}));}
  return out},NF);
console.log(r.join('\n'));await b.close()})();

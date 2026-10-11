/* v1.0 perf: frames while the follow camera eases, zoomed or not. node tools/perf95/zoom100.js <page> <normal|fast> <0|1 zoom> [secs]
   In-page rAF frame times + draw() cost per frame + what rebuilt in each long frame (192/208 stone ref, 260 tiles, 235 tiles),
   LAYERS93 per-layer ms. LS='{"flavius_x":"1"}' sets page flags. Prints one JSON line. */
const {chromium}=require('playwright');const path=require('path');
const [PAGE,speed,zoom,secs]=[path.resolve(process.argv[2]||'flavius-arena.html'),process.argv[3]||'normal',process.argv[4]==='1',+(process.argv[5]||8)];
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());
await pg.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},JSON.parse(process.env.LS||'{}'));
await pg.goto(await require('./serve.js')(PAGE),{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const r=await pg.evaluate(async([speed,zoom,secs])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;startEvent({ev:'democritus',loc:6,seed:11,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
  for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8)break}
  SPEED=speed;setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},300);
  if(zoom){S.zoomIn=true;draw()}await W8(2500);
  const n=()=>({a:typeof AR92!=='undefined'?AR92.n:0,z:typeof Z99!=='undefined'?Z99.stats.builds:0,t:typeof TILES96!=='undefined'?TILES96.builds:0});
  const b0=draw;let cf={draws:0,ms:0,max:0,ev:[]};
  draw=function(){const t=performance.now(),a=n();const r=b0.apply(this,arguments);const dt=performance.now()-t,z=n();cf.draws++;cf.ms+=dt;cf.max=Math.max(cf.max,dt);
    if(z.a!==a.a)cf.ev.push('stoneRef');if(z.z!==a.z)cf.ev.push('z99build');if(z.t!==a.t)cf.ev.push('t96build');return r};
  const F=[];let last=performance.now();const t0=last;let lt=0,ln=0;const po=new PerformanceObserver(l=>{for(const e of l.getEntries()){lt+=e.duration;ln++}});try{po.observe({type:'longtask'})}catch(e){}
  if(typeof LAYERS93!=='undefined'&&LAYERS93.reset)LAYERS93.reset();
  await new Promise(res=>{const f=ts=>{F.push({dt:ts-last,...cf});cf={draws:0,ms:0,max:0,ev:[]};last=ts;if(ts-t0<secs*1000)requestAnimationFrame(f);else res()};requestAnimationFrame(f)});
  draw=b0;po.disconnect();const G=F.slice(2);const dts=G.map(f=>f.dt).sort((a,b)=>a-b);const q=p=>+dts[Math.floor(p*(dts.length-1))].toFixed(1);
  const dr=G.filter(f=>f.draws).map(f=>f.max).sort((a,b)=>a-b);const qd=p=>+(dr[Math.floor(p*(dr.length-1))]||0).toFixed(1);
  const long=G.filter(f=>f.dt>50).map(f=>Math.round(f.dt)+'/'+f.draws+'d/'+Math.round(f.max)+'ms'+(f.ev.length?'/'+f.ev.join(','):''));
  const lay=typeof LAYERS93!=='undefined'?LAYERS93.report().rows.filter(r=>(r.avg||0)>0.3||(r.paintMs||0)>1).map(r=>r.name+':'+(r.cached?'h'+r.hits+'m'+r.misses+'p'+r.paintMs.toFixed(1):r.avg.toFixed(1)+'/'+r.max.toFixed(0))):[];
  return {zoomed:typeof z99Zoomed==='function'&&z99Zoomed(),fps:+(F.length/secs).toFixed(1),p50:q(.5),p95:q(.95),max:q(1),over33:dts.filter(d=>d>33.4).length,
    draw50:qd(.5),draw95:qd(.95),drawMax:qd(1),dpf:+(G.reduce((a,f)=>a+f.draws,0)/G.length).toFixed(2),longtask:ln+'/'+Math.round(lt)+'ms',
    rebuilds:G.reduce((o,f)=>{for(const e of f.ev)o[e]=(o[e]||0)+1;return o},{}),long:long.slice(0,20),lay}},[speed,zoom,secs]);
console.log(speed+' zoom='+(zoom?1:0)+' '+JSON.stringify(r));await b.close()})();

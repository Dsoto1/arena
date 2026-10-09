/* v0.99 ONE FACE phase 2 — the same page, modes alternating (machine load hits all alike): node tools/plans/face99/perf3.js flavius-arena.html
   A list of 60 portraits (sm 54 px + md 110 px, Manager-style generated fighters) + 40 stands faces is rebuilt by innerHTML 12× per mode:
   OFF (today's flat inline SVG) · FULL raster (268: cached pictures) · FULL vector (the painterly SVG inline, i.e. no cache).
   Measured: CDP TaskDuration from innerHTML to the second frame (style + layout + paint + raster), p50 / p90. */
const {chromium}=require('playwright');const path=require('path');const metric=(m,k)=>m.find(x=>x.name===k).value;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]),{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const cdp=await pg.context().newCDPSession(pg);await cdp.send('Performance.enable');
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();const d=document.createElement('div');d.id='pf3';d.style.cssText='position:fixed;inset:0;z-index:99999;background:#1a130d;display:flex;flex-wrap:wrap;gap:2px;overflow:hidden';document.body.appendChild(d);
  window.__pf3=mode=>{SETTINGS.face99=mode==='off'?'off':'full';FACE2.vec=mode==='vector'?1:0;let h='';for(let i=0;i<60;i++)h+=portraitHTML({name:'g',portrait:gladPortrait('pf'+i,['hero','soldier','slave','royalty'][i%4]),color:'#4f7fc4'},i%3?'sm':'md');
    for(let i=0;i<40;i++)h+=specFaceSVG({skin:SKINS[i%SKINS.length],hair:HAIRS[i%HAIRS.length],fem:i%3===0,beard:i%2===0,hat:['pileus','hood','straw',''][i%4],tunic:'#e8dcc0',robe:'#7a2230'});
    d.innerHTML='';document.body.offsetHeight;d.innerHTML=h;document.body.offsetHeight;return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}});
/* warm: build every picture once and let the bitmaps land */
for(const m of ['off','full','vector'])await pg.evaluate(m=>window.__pf3(m),m);
await pg.waitForFunction(()=>!R99.q.length&&!R99.busy,null,{timeout:120000});
const res={off:[],full:[],vector:[]};
for(let i=0;i<12;i++)for(const m of ['off','full','vector']){const m0=(await cdp.send('Performance.getMetrics')).metrics;await pg.evaluate(m=>window.__pf3(m),m);await pg.waitForTimeout(60);
  const m1=(await cdp.send('Performance.getMetrics')).metrics;res[m].push((metric(m1,'TaskDuration')-metric(m0,'TaskDuration'))*1000)}
const q=(a,p)=>{a=a.slice().sort((x,y)=>x-y);return +a[Math.floor(p*(a.length-1))].toFixed(1)};
const out={};for(const m in res)out[m]={p50:q(res[m],.5),p90:q(res[m],.9)};
out.dom=await pg.evaluate(()=>{const n={};for(const m of ['off','full']){SETTINGS.face99=m;FACE2.vec=0;window.__pf3(m);n[m]=document.querySelectorAll('#pf3 *').length}SETTINGS.face99='full';return n});
out.stats={...await pg.evaluate(()=>R99.stats),builds:await pg.evaluate(()=>FACE2.stats.build),buildMsAvg:await pg.evaluate(()=>+(FACE2.stats.buildMs/FACE2.stats.build).toFixed(2))};
console.log(JSON.stringify(out));await pg.screenshot({path:__dirname+'/phase2_perf3_list.png'});await b.close()})();

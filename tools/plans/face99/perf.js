/* ONE FACE phase 1 cost: node tools/plans/face99/perf.js <page.html> — build + insert/layout/paint per face, old painters (FACE99.geom /
   FACE99.spect0) vs face99 (cache cold / warm). Prints JSON. */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.route(/fonts\./,r=>r.abort());await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const R=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);const ids=[...Array(200).keys()].map(i=>'g_'+i);
  const time=(fn,n=5)=>{fn();const t=performance.now();for(let i=0;i<n;i++)fn();return (performance.now()-t)/n};
  const paint=async(html,n)=>{const box=document.createElement('div');box.style.cssText='position:fixed;left:0;top:0;width:1400px;display:flex;flex-wrap:wrap;z-index:99999;background:#000';document.body.appendChild(box);
    const runs=[];for(let k=0;k<5;k++){box.innerHTML='';await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const t=performance.now();box.innerHTML=html;box.getBoundingClientRect();
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));runs.push(performance.now()-t)}box.remove();runs.sort((a,b)=>a-b);return runs[2]/n};
  const looks=ids.map(id=>gladPortrait(id,'soldier'));const sp=ids.map((id,i)=>({skin:SKINS[i%13],hair:HAIRS[i%16],beard:i%2===0,hat:['','pileus','straw','hood'][i%4]}));
  const o={};
  o.bustBuildOldMs=time(()=>looks.forEach(l=>FACE99.geom(l,'#c0433a')))/200;face99Clear();
  o.bustBuildColdMs=time(()=>{face99Clear();looks.forEach(l=>portraitSVG(l,'#c0433a'))})/200;o.bustBuildWarmMs=time(()=>looks.forEach(l=>portraitSVG(l,'#c0433a')))/200;
  o.specBuildOldMs=time(()=>sp.forEach(l=>FACE99.spect0(l)))/200;o.specBuildWarmMs=time(()=>sp.forEach(l=>specFaceSVG(l)))/200;
  o.specBytesOld=Math.round(sp.reduce((a,l)=>a+FACE99.spect0(l).length,0)/200);o.specBytesNew=Math.round(sp.reduce((a,l)=>a+specFaceSVG(l).length,0)/200);
  o.bust54Old=await paint(looks.map(l=>FACE99.geom(l,'#c0433a').replace('<svg ','<svg width="54" height="76" ')).join(''),200);
  o.bust54New=await paint(looks.map(l=>portraitSVG(l,'#c0433a').replace('<svg ','<svg width="54" height="76" ')).join(''),200);
  o.spec20Old=await paint(sp.map(l=>FACE99.spect0(l)).join(''),200);o.spec20New=await paint(sp.map(l=>specFaceSVG(l)).join(''),200);
  o.cache={size:FACE99.cache.size,chars:FACE99.chars,...FACE99.stats};
  for(const k in o)if(typeof o[k]==='number')o[k]=Math.round(o[k]*10000)/10000;return o});
console.log(JSON.stringify(R,null,1));await b.close()})();

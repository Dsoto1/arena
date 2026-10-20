/* tools/bench/v108ab.js — v1.08 mock-up: PAIRED A/B draw cost in ONE page (tools/plans/v108/MOCKUP.md). Whole-run medians on this shared box
   swing ±3 ms with the load (other builders), more than the budget being checked (≤ +2 ms), so 407's per-frame work is switched on/off
   (V108.ab) every frame (A B B A …) on the same forged scene (tools/bench/board.js SCENE/SET) and the cost is the median of the per-pair
   differences (frame i vs frame i±1). The BAKED parts (into 192's LIGHT / 189's grade / the torch shadow layer) cost nothing per frame by
   construction (layers blitted anyway); their one-time re-bake cost is reported from V108.st (bakeDay / bakeNight / torchLayer ms).
     node tools/bench/v108ab.js <page> [--variants torch,mat,depth,all,safari] [--only desk,phone,desk2x] [--blocks 8] [--n 30] [--json FILE]
   safari = all three with flavius_v107safariforce=1 (406's WebKit path: DPR cap 1.5, W3/W5) and the extra desk @2 view (desk2x) the cap acts on. */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');const B=require('./board.js');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]||'flavius-arena.html');const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};
const VAR=String(opt('variants','torch,mat,depth,all,safari')).split(','),ONLY=opt('only',''),NB=+opt('blocks',8),NF=+opt('n',30),JSONF=opt('json','');
const NO=String(opt('no','')).split(';');/* v1.08 build (409-v108light, on by default): an item alone = the other two killed */
const LSV={torch:{flavius_v108matoff:'1',flavius_v108depthoff:'1'},mat:{flavius_v108torchoff:'1',flavius_v108depthoff:'1'},depth:{flavius_v108torchoff:'1',flavius_v108matoff:'1'},all:{},safari:{flavius_v107safariforce:'1'}};
const VIEWS={...B.VIEWS,desk2x:{viewport:{width:1440,height:900},deviceScaleFactor:2}};
const MODES=[{name:'day-flat'},{name:'day-zoom',zoom:1},{name:'night-flat',night:1},{name:'night-zoom',night:1,zoom:1}];
const med=a=>{const s=a.slice().sort((x,y)=>x-y),m=s.length>>1;return s.length?(s.length%2?s[m]:(s[m-1]+s[m])/2):null};
const load=()=>+fs.readFileSync('/proc/loadavg','utf8').split(' ')[0];
(async()=>{const serve=require(path.join(__dirname,'..','perf95','serve.js'));const url=await serve(PAGE);const b=await chromium.launch();
  const res={page:path.basename(PAGE),at:new Date().toISOString(),blocks:NB,n:NF,rows:[]};const errs=[];
  for(const v of VAR){const views=(v==='safari'?['desk','phone','desk2x']:['desk','phone']).filter(k=>!ONLY||ONLY.split(',').includes(k));
    for(const vk of views){const cx=await b.newContext(VIEWS[vk]);await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
      await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');localStorage.setItem('flavius_light106auto','0');for(const k in ls)localStorage.setItem(k,ls[k])},LSV[v]);
      const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(v+' '+vk+': '+e.message));await pg.goto(url,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
      const sc=await pg.evaluate(B.SCENE);const info=await pg.evaluate(()=>({dpr:devicePixelRatio,cv:[cv.width,cv.height],has:typeof V108!=='undefined'&&V108.on}));
      for(const m of MODES){await pg.evaluate(B.SET,m);const l0=load();
        for(const flush of [false,true]){
          /* per-frame A/B: V108.ab flips every frame (A B B A …) WITHOUT re-making the baked layers — what is baked costs the same either way
             (it rides in layers that are blitted anyway), so the difference is exactly the per-frame work 407 adds */
          const r=await pg.evaluate(async({n,flush})=>{const raf=()=>new Promise(q=>requestAnimationFrame(q));const g=cv.getContext('2d');const on=[],off=[],d=[];
            for(let i=0;i<12;i++){await raf();BENCH.tick();V108.ab=i%2===0;draw();if(flush)g.getImageData(0,0,1,1)}
            let prev=null;for(let i=0;i<n*2;i++){await raf();BENCH.tick();const isOn=[0,3].includes(i%4);V108.ab=isOn;const t=performance.now();draw();if(flush)g.getImageData(0,0,1,1);const ms=performance.now()-t;
              (isOn?on:off).push(ms);if(i%2===1)d.push(isOn?ms-prev:prev-ms);prev=ms}
            V108.ab=true;const med=a=>{const s=a.slice().sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};
            const q=(a,p)=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(p*(s.length-1)))]};
            return {on:+med(on).toFixed(2),off:+med(off).toFixed(2),on95:+q(on,.95).toFixed(2),off95:+q(off,.95).toFixed(2),delta:+med(d).toFixed(2),dMean:+(d.reduce((a,b)=>a+b,0)/d.length).toFixed(2),n:d.length}},{n:NF*NB/2,flush});
          const st=await pg.evaluate(()=>JSON.parse(JSON.stringify(V108.st)));
          const row={variant:v,view:vk,mode:m.name,pass:flush?'flush':'js',...r,load:[l0,load()],bake:{day:st.dayMs,night:st.nightMs,torchLayer:st.tlMs||0,tlStepMax:st.tlStepMax,frameMax:st.frameMax}};
          res.rows.push(row);console.log(`${v.padEnd(6)} ${vk.padEnd(6)} ${m.name.padEnd(10)} ${row.pass.padEnd(5)} off ${r.off} on ${r.on} (p95 ${r.off95} → ${r.on95}) Δ median ${r.delta} mean ${r.dMean} [${r.n} pairs] load ${row.load.join('→')}`)}}
      res.rows.push({variant:v,view:vk,info,scene:sc});await cx.close()}}
  console.log('ERRS',JSON.stringify(errs));if(JSONF)fs.writeFileSync(JSONF,JSON.stringify(res,null,1));await b.close();process.exit(errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});

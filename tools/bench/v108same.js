/* tools/bench/v108same.js — "flag off = today's board, byte for byte" (v1.08 mock-up, tools/plans/v108/MOCKUP.md).
   Loads two pages (A = a build without 407, B = this build, flag unset) with Math.random seeded from the first script on, forges the
   bench scene (tools/bench/board.js SCENE), freezes the clock and compares the board canvas pixels per view × mode.
     node tools/bench/v108same.js <pageA> <pageB> [--ls k=v,…]   → the source of every function 407 can wrap (identical = nothing installed); --pixels also diffs the frames (the
   page is not pixel-deterministic between loads by itself: flicker clock, image-load order — ref vs ref differs too) */
const {chromium}=require('playwright');const path=require('path');const B=require('./board.js');
const A=process.argv.slice(2);const PA=path.resolve(A[0]),PB=path.resolve(A[1]);const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};
const LS={flavius_light106auto:'0'};const PIX=A.includes('--pixels');for(const kv of String(opt('ls','')).split(',').filter(Boolean)){const i=kv.indexOf('=');LS[kv.slice(0,i)]=kv.slice(i+1)}
const FN=['draw','drawLayers93','ar91LightPaint','night91Bake','night91Sand','night91Spots','l106Pass','l106GladSh','l106BeastSh','l106DrawFigs','l106DrawStatic','an100CellCanvas','bst100CellCanvas','drawPot'];
const MODES=[{name:'day-flat'},{name:'day-zoom',zoom:1},{name:'night-flat',night:1},{name:'night-zoom',night:1,zoom:1}];
(async()=>{const serve=require(path.join(__dirname,'..','perf95','serve.js'));const b=await chromium.launch();let bad=0;
  for(const vk of Object.keys(B.VIEWS)){const px={};
    for(const P of [PA,PB]){const url=await serve(P);const cx=await b.newContext(B.VIEWS[vk]);await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
      await cx.addInitScript(ls=>{let s=777;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff};Object.defineProperty(navigator,'webdriver',{get:()=>false});
        localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in ls)localStorage.setItem(k,ls[k])},LS);
      const pg=await cx.newPage();await pg.goto(url,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
      /* every function 407 may wrap: with the flag unset its source must be the v1.07 one (nothing installed) */
      (px.fn=px.fn||[]).push(await pg.evaluate(names=>names.map(n=>{try{const f=(0,eval)(n);return n+':'+(typeof f==='function'?String(f).length+':'+String(f).slice(0,80):'none')}catch(e){return n+':?'}}),FN));
      await pg.evaluate(B.SCENE);
      if(PIX)for(const m of MODES){await pg.evaluate(B.SET,m);await pg.evaluate(B.FREEZE);px[m.name]=px[m.name]||[];
        px[m.name].push(await pg.evaluate(()=>{draw();draw();const d=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;return Array.from(d)}));await pg.evaluate(B.THAW)}
      await cx.close()}
    {const [fa,fb]=px.fn;const df=fa.filter((x,i)=>x!==fb[i]);console.log(vk,'functions compared',fa.length,'different',df.length,df.join(' | '));if(df.length)bad++}
    if(!PIX)continue;
    for(const m of MODES){const [a,c]=px[m.name];let n=0;for(let i=0;i<a.length;i++)if(a[i]!==c[i])n++;if(n)bad++;console.log(vk,m.name,'bytes differing',n,'of',a.length)}}
  await b.close();process.exit(bad?1:0)})().catch(e=>{console.error(e);process.exit(2)});

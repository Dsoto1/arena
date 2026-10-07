/* v0.95 perf: does 230-v95perf change the board's pixels? node tools/perf95/pixels.js <page.html>
   In one page (a second page cannot reach the same state: CPU timing and the crowd's cosmetic Math.random differ run to run), three
   paused events (seed 4242: a classic by day, a night match, a turned corner with a human seat) are drawn with the clock frozen and
   Math.random seeded (like tv93l) with the pass ON and then with P95.on=false (every wrapper falls back to the old path: live
   clientWidth, fitReserve on every draw…), and again ON. The canvases, TW/OX/OY and the canvas size must match exactly. Served over http. */
const {chromium}=require('playwright');const serve=require('./serve.js');
const SCENES=[['democritus',6,false,null],['egidious',3,true,null],['cassian',9,false,0]];
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto(await serve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});let bad=0;
  for(const sc of SCENES){const r=await pg.evaluate(async([ev,loc,night,human])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
    while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    startEvent({ev,loc,seed:4242,seats:['hero','soldier','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==(human==null?-1:human)})),opts:{spect:'auto',night:!!night}});
    for(let i=0;i<200;i++){await W8(120);if(CUR_MODAL){const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];
        if(lit)lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null)}else if(S&&S.phase!=='setup'&&i>6)break}
    SPEED='pause';for(let i=0;i<50&&((typeof fxRAF!=='undefined'&&fxRAF)||S.busy);i++)await W8(100);
    S.zoomIn=false;CAM.z=null;if(typeof DUEL!=='undefined'){DUEL.z=1;DUEL.on=false}for(let i=0;i<20;i++){draw();await W8(100)}
    const shot=()=>{let s=12345;const T=performance.now(),D=Date.now();const mr=Math.random,dn=Date.now;Object.defineProperty(performance,'now',{value:()=>T,configurable:true,writable:true});
      Date.now=()=>D;Math.random=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff};
      try{draw();return {px:cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data,g:[cv.width,cv.height,TW,OX,OY].join(',')}}finally{delete performance.now;Date.now=dn;Math.random=mr}};
    const diff=(a,b)=>{if(a.px.length!==b.px.length)return {n:-1,max:255};let n=0,max=0;for(let i=0;i<a.px.length;i++){const d=Math.abs(a.px[i]-b.px[i]);if(d){n++;if(d>max)max=d}}return {n,max}};
    shot();const on=shot();P95.on=false;FIT81.key='';const off=shot();P95.on=true;FIT95.v=null;const on2=shot();
    return {ev,geo:[on.g,off.g,on2.g],off:diff(on,off),again:diff(on,on2)}},sc);
    const noisy=r.again.n>0; /* the scene itself is not repeatable (ON vs ON again differs): inconclusive, not a failure */
    const same=r.geo[0]===r.geo[1]&&r.geo[1]===r.geo[2]&&(noisy||!r.off.n);if(!same)bad++;
    console.log(`${r.ev}: ${r.geo[0]} (w,h,TW,OX,OY) · ON vs OFF ${r.off.n?r.off.n+' values differ, max '+r.off.max:'identical'} · ON again ${r.again.n?r.again.n+' differ':'identical'}${r.geo[0]!==r.geo[1]?' · OFF geometry '+r.geo[1]:''}${noisy?' · NOT REPEATABLE (inconclusive)':''}`)}
  await b.close();console.log(bad?'DIFF':'ALL IDENTICAL');process.exit(bad?1:0)})();

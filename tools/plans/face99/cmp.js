/* ONE FACE phase 1 check: node tools/plans/face99/cmp.js <before.html> <after.html>
   Paints the same deterministic portrait samples (600 seeded looks incl. every legacy boolean, generated Manager faces, portraitHTML,
   mgrPortrait) on the page before 263-v99face and after it, and compares the SVG strings (equal strings = identical pixels). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const run=async f=>{const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+f);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const r=await pg.evaluate(()=>{let h=12345;const nx=n=>{h=(Math.imul(h,1103515245)+12345)>>>0;return (h>>>8)%n};const pk=a=>a[nx(a.length)];
  const out=[];for(let i=0;i<600;i++){const p={skin:pk(SKINS),hair:pk(HAIRS),helm:pk(HELMS)[0],fem:nx(3)===0,beard:nx(2)===0,long:nx(4)===0,smile:nx(3)===0,scar:nx(3)===0,paint:nx(5)===0,bg:pk(BGS.concat(['flag:'+Object.keys(FLAGS)[0]]))};
    if(nx(2)){p.hs=pk(HAIRSTYLES)[0];p.bs=pk(BEARDS.concat([['none']]))[0];p.mark=pk(MARKS)[0];p.garb=pk(GARBS)[0];p.ear=pk(EARRINGS.concat([[true]]))[0];p.neck=pk(NECKS)[0];p.face=pk(FACES)[0];p.eyes=pk(EYES)[0]}
    out.push(portraitSVG(p,i%7?pk(Object.values(CLASSES).map(c=>c.color)):undefined))}
  for(const id of ['g_1','g_22','abc','Marcus'])for(const c of Object.keys(CLASSES).slice(0,8))out.push(portraitSVG(gladPortrait(id,c),CLASSES[c].color));
  out.push(portraitHTML({name:'x',portrait:{helm:'galea'},color:'#123456'},'sm'));out.push(mgrPortrait(MGR_PRE[0],'md'));out.push(portraitSVG());
  return out});await pg.close();return {r,errs}};
const A=await run(process.argv[2]),B=await run(process.argv[3]);let d=0;A.r.forEach((s,i)=>{if(s!==B.r[i]){if(d<3)console.log('DIFF',i,'\n',s.slice(0,500),'\n',B.r[i].slice(0,500));d++}});
console.log('samples',A.r.length,'diffs',d,'errs',JSON.stringify(A.errs),JSON.stringify(B.errs));await b.close();process.exit(d?1:0)})();

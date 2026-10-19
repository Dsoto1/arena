/* tools/bench/shots107.js — v1.07 401-v107perf LOOKS THE SAME (tools/plans/v107/PERF.md). In ONE page per view (a second page cannot reach
   the same state), tools/bench/board.js's forged scene (8 gladiators, 6 beasts, 12 pillars, 9 move tiles + 1 attack tile highlighted, the
   soldier mid-slash) is drawn with the clock frozen and Math.random seeded, with 401 ON and then OFF (P107.off — every 401 wrapper falls
   back to the v1.07-beta path), at zoom 1, 1.4 ("Zoom in") and 2 (a pinch), day and night. Per pair: the board canvas pixels compared
   (max channel difference, pixels over 2 / 8 levels, mean) + PNGs: <tag>_<view>_<zoom>_<day|night>_{on,off,diff}.png (diff = |on − off| × 16).
     node tools/bench/shots107.js <page> --out DIR [--views desk,desk2x,phone] [--ls k=v,…]
   desk 1440×900 @1, desk2x the same @2 (devicePixelRatio 2), phone 390×844 @2 (mobile). Lighting Full everywhere (the worst case). */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const A=process.argv.slice(2);const PAGE=path.resolve(A[0]||'flavius-arena.html');const opt=(k,d)=>{const i=A.indexOf('--'+k);return i>=0?A[i+1]:d};
const OUT=path.resolve(opt('out','shots107'));const VIEWS_=String(opt('views','desk,desk2x,phone')).split(',');
const LS={flavius_light106:'full',flavius_light106auto:'0'};for(const kv of String(opt('ls','')).split(',').filter(Boolean)){const i=kv.indexOf('=');LS[kv.slice(0,i)]=kv.slice(i+1)}
const {SCENE,SET,FREEZE,THAW,VIEWS}=require('./board.js');VIEWS.desk2x={viewport:{width:1440,height:900},deviceScaleFactor:2};
const PAIR=async()=>{const read=()=>{const g=cv.getContext('2d');return g.getImageData(0,0,cv.width,cv.height).data};
  const shot=()=>cv.toDataURL('image/png');
  /* the same frozen frame twice per side (a cached piece made on the first draw is used on the second) */
  P107.off=false;BENCH.tick();draw();draw();const on=read(),onP=shot();P107.off=true;BENCH.tick();draw();draw();const off=read(),offP=shot();P107.off=false;draw();
  let mx=0,n2=0,n8=0,sum=0;const W=cv.width,H=cv.height;const dc=document.createElement('canvas');dc.width=W;dc.height=H;const dg=dc.getContext('2d');const di=dg.createImageData(W,H);
  for(let i=0;i<on.length;i+=4){let m=0;for(let k=0;k<3;k++){const d=Math.abs(on[i+k]-off[i+k]);if(d>m)m=d}sum+=m;if(m>mx)mx=m;if(m>2)n2++;if(m>8)n8++;const v=Math.min(255,m*16);di.data[i]=v;di.data[i+1]=v;di.data[i+2]=v;di.data[i+3]=255}
  dg.putImageData(di,0,0);const px=W*H;return {W,H,max:mx,over2:+(100*n2/px).toFixed(3),over8:+(100*n8/px).toFixed(3),mean:+(sum/px).toFixed(4),onP,offP,diffP:dc.toDataURL('image/png'),st:JSON.stringify(P107.st)}};
(async()=>{const serve=require(path.join(__dirname,'..','perf95','serve.js'));const url=await serve(PAGE);const b=await chromium.launch();fs.mkdirSync(OUT,{recursive:true});const errs=[];const rows=[];
  for(const vk of VIEWS_){const cx=await b.newContext(VIEWS[vk]);await cx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
    await cx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');for(const k in ls)localStorage.setItem(k,ls[k])},LS);
    const pg=await cx.newPage();pg.on('pageerror',e=>errs.push(vk+': '+e.message));await pg.goto(url,{timeout:180000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
    await pg.evaluate(SCENE);
    for(const night of [0,1])for(const [zn,m] of [['z1',{}],['z14',{zoom:1}],['z2',{zoom:1,pz:2}]]){await pg.evaluate(SET,{...m,night});await pg.evaluate(FREEZE);const r=await pg.evaluate(PAIR);await pg.evaluate(THAW);
      const tag=`${vk}_${zn}_${night?'night':'day'}`;for(const [k,d] of [['on',r.onP],['off',r.offP],['diff',r.diffP]])fs.writeFileSync(path.join(OUT,`${tag}_${k}.png`),Buffer.from(d.split(',')[1],'base64'));
      rows.push({tag,W:r.W,H:r.H,max:r.max,over2:r.over2,over8:r.over8,mean:r.mean});console.log(tag.padEnd(20),`${r.W}x${r.H} max ${r.max} · >2 levels ${r.over2}% · >8 levels ${r.over8}% · mean ${r.mean}`,r.st)}
    await cx.close()}
  fs.writeFileSync(path.join(OUT,'diff.json'),JSON.stringify(rows,null,1));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(errs.length?1:0)})().catch(e=>{console.error(e);process.exit(2)});

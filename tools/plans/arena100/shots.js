/* arena100/shots.js — v1.0 arena look (277-v100arena) screenshots: all 12 zoomed out (grid_<k>.png → grid.png), corner close-ups at
   2.4× (left tower, right tower, near corner, stair opening) for Roma / Thysdrus / Leptis / Capua, a 390 px phone, a night arena, a turned
   board, and draw costs (cached frame + re-bake, look on vs off) → costs.json.  node tools/plans/arena100/shots.js  (needs a built page) */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'../../..'),D=__dirname+'/';
const KEYS=['','syracusae','verona','arles','capua','thysdrus','roma','nemausus','pompeii','leptis','uthina','pola','puteoli'];
(async()=>{const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/flavius-arena.html';const b=await chromium.launch();const errs=[];
async function open(phone){const ctx=await b.newContext(phone?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(URL0,{waitUntil:'domcontentloaded',timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    window.SH={W8,start:async(loc,night)=>{if(S&&!S.over)S.over=true;startEvent({ev:'democritus',loc,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:'auto',night:!!night}});
      for(let i=0;i<200;i++){await W8(120);if(CUR_MODAL){const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(lit)lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null)}else if(S&&S.phase!=='setup'&&i>6)break}
      SPEED='pause';for(let i=0;i<50&&((typeof fxRAF!=='undefined'&&fxRAF)||S.busy);i++)await W8(100);try{menuHide()}catch(e){}S.zoomIn=false;CAM.z=null;SH.clr();for(let i=0;i<60;i++){draw();if(AR91TEX[ar91Mat().n])break;await W8(100)}await W8(300);draw()},
     clr:()=>{for(const id of ['cardShow','bubbles','wbubs'])(document.getElementById(id)||{}).innerHTML='';try{S.bubbles=[];S.emotes=[]}catch(e){}const t=document.getElementById('tip');if(t)t.style.display='none'},
     /* zoom 2.4× onto a tile, then the screen point of a corner feature from the fresh bake */
     at:async(r,c,z)=>{const p=cur();p.r=r;p.c=c;CAM.z=z>1?z:null;S.zoomIn=z>1;CAM.fr=null;for(let i=0;i<25;i++){draw();await W8(50)}AR91.ver++;draw()},
     spot:tag=>{const G=A100X.last;const L=G.edges.find(e=>e.left),R=G.edges.find(e=>!e.left);const b=cv.getBoundingClientRect();let x,y;
       const yOf=(E,x)=>{const P=E.piers.find(p=>Math.abs(p.x-x)<20)||E.piers[0];return P.y};
       if(tag==='L'){x=L.xt;y=yOf(L,L.xt+G.pw/2)}else if(tag==='R'){x=R.xt;y=yOf(R,R.xt-G.pw/2)}else if(tag==='B'){const P=L.piers.find(p=>p.kind==='corner');x=P.x;y=P.y}else{x=(L.gap[0]+L.gap[1])/2;y=yOf(L,L.gap[0])}
       return {x:b.x+x,y:b.y+y,bx:b.x,by:b.y,bw:b.width,bh:b.height}},
     cost:n=>{const med=a=>a.sort((x,y)=>x-y)[a.length>>1];const ca=[],re=[];for(let i=0;i<n;i++){draw();let t=performance.now();draw();ca.push(performance.now()-t);AR91.ver++;t=performance.now();draw();re.push(performance.now()-t)}return {cached:+med(ca).toFixed(1),rebuild:+med(re).toFixed(1)}}}});
  return {ctx,pg}}
const canvasShot=async(pg,file)=>{const r=await pg.evaluate(()=>{SH.clr();draw();const b=cv.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}});await pg.screenshot({path:file,clip:r})};
const costs={};const {pg}=await open(false);
for(let k=1;k<=12;k++){await pg.evaluate(k=>SH.start(k),k);await canvasShot(pg,D+`grid_${k}_${KEYS[k]}.png`);
  /* zoomed 2.4x onto the left near corner (rail, tower, pier) */
  {const n=await pg.evaluate(()=>N-1);await pg.evaluate(n=>SH.at(n,1,2.4),n);await canvasShot(pg,D+`zoom_${k}_${KEYS[k]}.png`);await pg.evaluate(()=>SH.at(0,0,1))}
  /* costs: interleaved look on/off, 3 rounds, medians */
  if([4,5,6,9].includes(k)){const c=await pg.evaluate(()=>{const on=[],off=[];for(let i=0;i<3;i++){A100X.set(true);on.push(SH.cost(5));A100X.set(false);off.push(SH.cost(5))}A100X.set(true);draw();
      const m=(a,f)=>a.map(x=>x[f]).sort((x,y)=>x-y)[1];return {on:{cached:m(on,'cached'),rebuild:m(on,'rebuild')},off:{cached:m(off,'cached'),rebuild:m(off,'rebuild')}}});costs['desktop_'+k]=c}
  if([6,5,9,4].includes(k)){const n=await pg.evaluate(()=>N-1);for(const [tag,r,c] of [['L',n,0],['R',0,n],['B',n,n],['gap',n,6]]){await pg.evaluate(([r,c])=>SH.at(r,c,2.4),[r,c]);
      const s=await pg.evaluate(t=>SH.spot(t),tag);const w=300,h=190;let x=Math.round(s.x-w/2),y=Math.round(s.y-h*0.62);x=Math.max(s.bx,Math.min(x,s.bx+s.bw-w));y=Math.max(s.by,Math.min(y,s.by+s.bh-h));
      await pg.evaluate(()=>SH.clr());await pg.screenshot({path:D+`close_${KEYS[k]}_${tag}.png`,clip:{x,y,width:w,height:h}})}
    await pg.evaluate(()=>SH.at(0,0,1))}}
/* night + turned */
await pg.evaluate(()=>SH.start(2,true));await canvasShot(pg,D+'night_verona.png');
await pg.evaluate(async()=>{await SH.start(9);ROT89.k=1;for(let i=0;i<10;i++){draw();await SH.W8(40)}});await canvasShot(pg,D+'turned_leptis.png');await pg.evaluate(()=>{ROT89.k=0});
await pg.evaluate(async()=>{await SH.start(7,true);await SH.at(N-1,0,2.4)});await canvasShot(pg,D+'night_nemausus_zoom.png');
/* phone */
const ph=await open(true);for(let k=1;k<=12;k++){await ph.pg.evaluate(k=>SH.start(k),k);await ph.pg.evaluate(()=>SH.clr());await ph.pg.screenshot({path:D+`phone_${KEYS[k]}.png`})}
costs.phone6=await ph.pg.evaluate(()=>{const on=[],off=[];for(let i=0;i<3;i++){A100X.set(true);on.push(SH.cost(3));A100X.set(false);off.push(SH.cost(3))}A100X.set(true);const m=(a,f)=>a.map(x=>x[f]).sort((x,y)=>x-y)[1];return {on:{cached:m(on,'cached'),rebuild:m(on,'rebuild')},off:{cached:m(off,'cached'),rebuild:m(off,'rebuild')}}});
fs.writeFileSync(D+'costs.json',JSON.stringify(costs,null,1));console.log(JSON.stringify(costs));console.log('ERRS',errs.slice(0,5));await b.close();srv.close()})();

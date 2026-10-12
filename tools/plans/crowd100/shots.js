/* tools/plans/crowd100/shots.js — v1.0 3D crowd shots: node tools/plans/crowd100/shots.js flavius-arena.html
   Board fit and zoomed (seated, cheering + standing), today's 193 crowd beside (kill switch), and the Roma forum. → tools/plans/crowd100/*.jpg */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
const OUT=__dirname;(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'}[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
for(const off of [false,true]){const cx=await b.newContext({viewport:{width:1440,height:900}});await cx.route(/fonts\./,r=>r.abort());
  await cx.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_crowd100off','1')},off);
  const pg=await cx.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(100)}try{menuHide()}catch(e){}
    SETTINGS.briefing=false;try{applySettings()}catch(e){}SPEED='pause';
    startEvent({ev:'democritus',loc:6,seats:['royalty','soldier','hero','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:60}});
    for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}SPEED='pause';
    const W=WALKS91.get(S);if(W)W.done=true;CHEER92.on=false;for(let i=0;i<30;i++){draw();await W8(100)}});
  const tag=off?'today':'3d';const shot=async n=>{await pg.evaluate(()=>draw());await pg.screenshot({path:path.join(OUT,n),type:'jpeg',quality:82,clip:{x:16,y:68,width:972,height:612}})};
  await shot(`fit_${tag}.jpg`);
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const now=performance.now();let i=0;for(const sp of S.spect){i++;sp._cu92=now+1e6;sp._cp92=i%3?2:1;if(i%2){sp._sa100=now-1;sp._sb100=now+1e6}}draw()});
  await shot(`fit_cheer_${tag}.jpg`);
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));CAM.z=2.2;S.zoomIn=true;for(let i=0;i<50;i++){draw();await W8(40)}});
  await shot(`zoom_cheer_${tag}.jpg`);
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(const sp of S.spect){sp._cu92=0;sp._sa100=null}for(let i=0;i<10;i++){draw();await W8(40)}});
  await shot(`zoom_${tag}.jpg`);
  if(!off){await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));CAM.z=null;S.zoomIn=false;openCitySquare(6);for(let i=0;i<80&&(!CITY.open||CITY.warm100);i++)await W8(150);await W8(5000)});
    await pg.screenshot({path:path.join(OUT,'forum_3d.jpg'),type:'jpeg',quality:82})}
  await cx.close()}
await b.close();srv.close()})();

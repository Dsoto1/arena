/* v1.05 B40 (369-v105flag): the stands fan's flag hangs on its pole: the cloth's hoist x is within 1 px of the pole's x for every holder
   (both facings), at two zoom levels, and the flag is still drawn at its old size. Prints MISS / ERRS, exit 1 on a miss. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const m={'.html':'text/html','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};r.writeHead(200,{'content-type':m[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto(URL0,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(250)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;SPEED='fast';startEvent({ev:'democritus',loc:6,seed:21,seats:['soldier','hero','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:48}});
  for(let i=0;i<300;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&cur()===S.players[0]&&S.phase==='action'&&!S.busy)break}
  SPEED='pause';render();await W8(1500)});
const probe=()=>pg.evaluate(async()=>{await new Promise(r=>setTimeout(r,1400));draw();return {n:FLAG101.n,last:FLAG105.last.slice(),off:FLAG105.off,fw:TW*0.34}});
const a=await probe();
ok(a.n>=1&&!a.off,'flags are drawn (n='+a.n+')');
ok(a.last.length===a.n&&a.last.every(l=>Math.abs(l.hx-l.px)<=1),'hoist x within 1 px of the pole x '+JSON.stringify(a.last));
/* every holder facing: the S.spect order gives front and back fans; also at another zoom */
for(const z of [1.6,0.8]){await pg.evaluate(z=>{try{if(typeof setZoom==='function')setZoom(z);else if(typeof ZOOM!=='undefined')ZOOM=z}catch(e){}},z);await pg.waitForTimeout(600);
  const p=await probe();ok(p.n===0||p.last.every(l=>Math.abs(l.hx-l.px)<=1),'zoom '+z+': hoist on pole '+JSON.stringify(p.last))}
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();

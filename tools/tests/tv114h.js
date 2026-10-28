/* v1.14 (4a) the Quality "High" key: Settings → Board & pieces → Quality shows the setting's own "High" (key 'High{0}', 417 Q114HI),
   agreeing with Medium / Low (es Alta · Media · Baja, fr Haute · Moyenne · Basse), while the Face designer's cheekbones keep the plain
   'High' (es Altos, fr Hautes). English stays "High" in both places.
   node tools/tests/tv114h.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;
const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,400))};
const open=async lang=>{const c=await b.newContext({viewport:{width:1440,height:900}});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(l=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_first100off','1');localStorage.setItem('flavius_langask86','1');if(l)localStorage.setItem('flavius_lang',l)},lang);
  await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  await pg.waitForFunction(l=>!l||l==='en'||(typeof LANG_DICT!=='undefined'&&LANG_DICT&&Object.keys(LANG_DICT).length>1000),lang,{timeout:60000});
  await pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}try{menuHide()}catch(e){}});return pg};
const READ=()=>{const t=document.createElement('div');t.innerHTML=settingsHTML('pieces');
  const q=Object.fromEntries([...t.querySelectorAll('[data-q110]')].map(x=>[x.dataset.q110,x.textContent.trim()]));
  return {q,name:q110Name('high'),ck:FX99_LBL().ck[1][1]}};
const WANT={en:['High','Medium','Low','High'],es:['Alta','Media','Baja','Altos'],fr:['Haute','Moyenne','Basse','Hautes']};
try{
  for(const l of ['en','es','fr']){const pg=await open(l==='en'?null:l);const d=await pg.evaluate(`(${READ})()`);const w=WANT[l];
    ok(d.q.high===w[0]&&d.q.medium===w[1]&&d.q.low===w[2]&&d.name===w[0],l+' Quality High · Medium · Low = '+w.slice(0,3).join(' · ')+' '+JSON.stringify(d));
    ok(d.ck===w[3],l+' the cheekbones keep "'+w[3]+'" '+JSON.stringify(d.ck));
    await pg.context().close()}
}catch(e){errs.push('THROW '+(e&&e.stack||e))}
console.log('ERRS',JSON.stringify(errs));await b.close();srv.close();process.exit(errs.length||miss.length?1:0)})();

/* themes99 DOM contrast: node tools/plans/themes99/contrast.js flavius-arena.html — tv93a's WCAG scan (CON93, copied from the test at
   run time) over the arena (header bar + layout, mid-game all-CPU Democritus in that arena) and Settings → Themes, for each of the 12
   arena themes, today (flag off) and proposed (flavius_themes99=1). Prints runs below AA per theme. MODES / ONLY as in shot.js. */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const tv=fs.readFileSync(path.join(__dirname,'../../tests/tv93a.js'),'utf8');const m=tv.match(/await pg\.evaluate\(\(\)=>\{window\.CON93=[\s\S]*?return out\}\}\);/);const CON=m[0].replace(/^await pg\.evaluate\(\(\)=>\{/,'').replace(/\}\);$/,'');
const ONLY=(process.env.ONLY||'').split(',').filter(Boolean).map(Number);const MODES=(process.env.MODES||'off,on').split(',');
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const errs=[];const res={};
for(const mode of MODES){res[mode]={};
  const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(m=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(m==='on')localStorage.setItem('flavius_themes99','1')},mode);
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(mode+' '+e.message));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
  await pg.evaluate(CON);
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}});
  for(let k=1;k<=12;k++){if(ONLY.length&&!ONLY.includes(k))continue;
    const r=await pg.evaluate(async k=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
      applyTheme({...THEME_PRESETS['loc'+k].v});
      openSettings('themes');await W8(700);const set=CON93(['#mboxEl']);while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}
      SPEED='fast';startEvent({ev:'democritus',loc:k,seed:9901,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:'auto'}});
      const t0=Date.now();let started=false;
      while(Date.now()-t0<60000){await W8(120);if(CUR_MODAL){const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(lit)lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null);continue}
        if(S&&S.phase!=='setup')started=true;if(started&&(S.turnNo||0)>=9&&!S.busy)break;if(S&&S.over)break}
      SPEED='pause';await W8(800);while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}render();await W8(300);
      const ar=CON93(['header.bar','main.layout']);return {set,ar}},k);
    res[mode][k]=r;console.log(`${mode} loc${k}: arena ${r.ar.fail}/${r.ar.n} below AA ${JSON.stringify(r.ar.worst)} · settings ${r.set.fail}/${r.set.n} ${JSON.stringify(r.set.worst)}`)}
  await ctx.close()}
await b.close();srv.close();console.log('ERRS',JSON.stringify(errs))})();

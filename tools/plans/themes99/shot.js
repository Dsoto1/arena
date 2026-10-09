/* themes99 sheet: node tools/plans/themes99/shot.js flavius-arena.html [outdir] — today (flag off) vs proposed (flavius_themes99=1)
   for the 12 arena themes: Settings swatch, a mid-game all-CPU Democritus board in that arena, the panels (full window).
   ONLY=1,2 limits the arenas. Then sheet.js composes sheet.png. */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);const OUT=process.argv[3]||path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const ONLY=(process.env.ONLY||'').split(',').filter(Boolean).map(Number);const MODES=(process.env.MODES||'off,on').split(',');
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();const errs=[];const res={};
for(const mode of MODES){res[mode]={};
  const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(m=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(m==='on')localStorage.setItem('flavius_themes99','1')},mode);
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(mode+' '+e.message));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}});
  /* the swatches, from the real Settings → Themes page */
  await pg.evaluate(()=>{openSettings('themes')});await pg.waitForSelector('[data-preset="loc1"]',{timeout:8000}).catch(()=>{});await pg.waitForTimeout(500);
  for(let k=1;k<=12;k++){if(ONLY.length&&!ONLY.includes(k))continue;const el=await pg.$(`.s98-swt[data-preset="loc${k}"]`)||await pg.$(`[data-preset="loc${k}"]`);if(el)await el.screenshot({path:`${OUT}/${mode}_sw${k}.png`})}
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(150)}});
  for(let k=1;k<=12;k++){if(ONLY.length&&!ONLY.includes(k))continue;
    const info=await pg.evaluate(async k=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
      applyTheme({...THEME_PRESETS['loc'+k].v});
      SPEED='fast';startEvent({ev:'democritus',loc:k,seed:9901,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:'auto'}});
      const t0=Date.now();let started=false;
      while(Date.now()-t0<60000){await W8(120);if(CUR_MODAL){const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(lit)lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null);continue}
        if(S&&S.phase!=='setup')started=true;if(started&&(S.turnNo||0)>=9&&!S.busy)break;if(S&&S.over)break}
      SPEED='pause';for(let i=0;i<50&&((typeof fxRAF!=='undefined'&&fxRAF)||S.busy||(S.anims&&S.anims.length));i++)await W8(100);
      while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}
      try{menuHide()}catch(e){}S.zoomIn=false;if(typeof CAM!=='undefined')CAM.z=null;if(typeof DUEL!=='undefined'){DUEL.z=1;DUEL.on=false}
      for(const id of ['cardShow','bubbles'])(document.getElementById(id)||{}).innerHTML='';
      for(let i=0;i<40;i++){draw();if(AR91TEX[ar91Mat().n])break;await W8(100)}await W8(500);S.bubbles=[];render();draw();await W8(200);for(const e of document.querySelectorAll('#bs82,#mk88peek,.wbub'))e.remove();for(const id of ['cardShow','bubbles','wbubs'])(document.getElementById(id)||{}).innerHTML='';
      return {turn:S.turnNo,over:!!S.over,mat:ar91Mat().n,tileA:THEME.tileA,ink:THEME.ink}},k);
    res[mode][k]=info;
    await pg.locator('.canvas-wrap').screenshot({path:`${OUT}/${mode}_board${k}.png`});
    await pg.screenshot({path:`${OUT}/${mode}_full${k}.png`});
  }
  await ctx.close()}
await b.close();srv.close();fs.writeFileSync(`${OUT}/info.json`,JSON.stringify({res,errs},null,1));console.log(JSON.stringify({res,errs}).slice(0,3000))})();

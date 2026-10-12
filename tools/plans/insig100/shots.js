/* v1.0 INSIGNIA shots: node tools/plans/insig100/shots.js flavius-arena.html → tools/plans/insig100/sh_<scene>_<w>.png
   scenes: designer · Manager league chips · arena velaria + Flavius's box (crop) · online Domus card; at 1440 and 390. */
const http=require('http'),fs=require('fs'),path=require('path');const {chromium}=require('playwright');
(async()=>{const root=path.dirname(path.resolve(process.argv[2]||'flavius-arena.html')),page=path.basename(process.argv[2]||'flavius-arena.html');const OUT=__dirname;
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
for(const W of [1440,390]){const phone=W<600;
  const open=async ls=>{const ctx=await b.newContext(phone?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
    await ctx.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const [k,v] of Object.entries(ls||{}))localStorage.setItem(k,v)},ls||{});
    const pg=await ctx.newPage();await pg.goto(URL0,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
    await pg.evaluate(async()=>{while(CUR_MODAL){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,120))}try{menuHide()}catch(e){}});return {ctx,pg}};
  {const {ctx,pg}=await open();
    await pg.evaluate(async()=>{openStudio('flags');await new Promise(r=>setTimeout(r,1200));ST.fd=blankFlag();Object.assign(ST.fd,{name:'Domus Valeria',emb:'boar',ins:'DOMVS·VALERIA',pat:'meander'});studioRedraw();await new Promise(r=>setTimeout(r,800));const e=document.getElementById('in100');if(e)e.scrollIntoView()});
    await pg.screenshot({path:path.join(OUT,`sh_designer_${W}.png`)});
    await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));try{closeStudio&&closeStudio()}catch(e){}while(CUR_MODAL){CUR_MODAL.done(null);await W8(120)}openManager();await W8(500);newWorld({type:'pre',key:MGR_PRE[4].key});await W8(300);MGR.tab='league';MGR_REDRAW();await W8(900)});
    await pg.screenshot({path:path.join(OUT,`sh_league_${W}.png`)});
    await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(null);await W8(120)}try{if(typeof closeManager==='function')closeManager()}catch(e){}
      startEvent({ev:'democritus',loc:0,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:'auto'}});
      for(let i=0;i<200;i++){await W8(120);if(CUR_MODAL){const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');if(lit)lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null)}else if(S&&S.phase!=='setup'&&i>6)break}
      SPEED='pause';try{menuHide()}catch(e){}for(let i=0;i<40;i++){draw();await W8(100)}});
    await pg.screenshot({path:path.join(OUT,`sh_arena_${W}.png`)});
    if(!phone){const r=await pg.evaluate(()=>{const c=document.getElementById('cv').getBoundingClientRect();return {x:c.x,y:c.y,w:c.width}});await pg.screenshot({path:path.join(OUT,`sh_flavius_box_${W}.png`),clip:{x:r.x+r.w*0.2,y:r.y,width:r.w*0.6,height:280}})}
    await ctx.close()}
  {const {ctx,pg}=await open({flavius_online77:'1',flavius_onlcd83:'0'});
    await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|report|over|match)/.test(k))localStorage.removeItem(k);
      ONL.acct=await NET.req('auth.signin',{name:'Valerius'});ONL.domus=(await NET.req('domus.create',{name:'Valeria'})).domus;await NET.req('char.create',{name:'Gamma',cls:'hero'});
      const r=await NET.req('domus.look',{c1:'#5b1a45',c2:'#e2b64a',crest:'boar',c3:'#b5832e',pat:'meander',ins:'DOMVS VALERIA',trim:{tassels:true},top:'emb'});ONL.domus=r.domus||ONL.domus;
      onlineOpen('char');for(let i=0;i<60&&!document.getElementById('onl');i++)await W8(150);ONL.tab='char';ONL.newGlad=false;ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});if(typeof V89D!=='undefined')V89D.open.look=true;onlRedraw();await W8(900)});
    await pg.screenshot({path:path.join(OUT,`sh_domus_${W}.png`)});
    await pg.evaluate(()=>{const e=document.querySelector('#onl .lk100');if(e)e.scrollIntoView()});await pg.screenshot({path:path.join(OUT,`sh_domus_look_${W}.png`)});
    await ctx.close()}}
await b.close();srv.close();console.log('shots in',OUT)})();

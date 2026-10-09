/* node tools/plans/desk99/dump.js flavius-arena.html — prints the live mail items + checklist of the setup career */
const {chromium}=require('playwright');const {setup}=require('./setup.js');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
await setup(pg);
const info=await pg.evaluate(()=>{const live=mailLive(ludusTabHTML.length?'':'');return {mail:live.items.map(x=>({key:x.key,kind:x.kind,title:x.title,from:x.from,body:!!x.body,html:x.html.slice(0,+(window.DUMPN||900))})),
  ck:weekChecklist().map(x=>(x.done?'✓':'·')+x.ic+' '+x.txt.replace(/<[^>]+>/g,'')+' || '+(x.btn||'')),letters:(W_().letters||[]).map(l=>l.key+'|'+l.kind+'|'+l.until+'|'+l.title)}});
console.log(JSON.stringify(info,null,1));console.log('ERRS',errs);await b.close()})();

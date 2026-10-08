/* Manager new-lanista mock: node tools/plans/mock99/mock_lan.js flavius-arena.html → mock_lanista_<tab>.png (1440) + mock_lanista_390_<tab>.png
   (loads char99.js for the shared designer-shell CSS, then lan99.js) */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const out=__dirname;
for(const W of [1440,390]){
const pg=await b.newPage({viewport:{width:W,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(1200);
 const c=document.querySelector('[data-mg="create"]');if(c)c.click();await W8(900);NEWMGR.nick='the Iron Purse';MGR_REDRAW();await W8(600)});
await pg.addScriptTag({path:path.join(__dirname,'char99.js')});await pg.addScriptTag({path:path.join(__dirname,'lan99.js')});
console.log(W,await pg.evaluate(()=>lan99Build()));await pg.waitForTimeout(400);
for(const t of ['id','look','house','mind','start']){await pg.evaluate(t=>{lan99Tab(t);document.getElementById('mBody').scrollTop=0},t);await pg.waitForTimeout(300);
  const H=await pg.evaluate(()=>document.getElementById('mBody').scrollHeight);
  if(W===1440){await pg.screenshot({path:out+`/mock_lanista_${t}.png`});console.log(t,'H',H)}
  else if(t==='id'||t==='look'){await pg.setViewportSize({width:W,height:Math.min(H+80,2600)});await pg.waitForTimeout(300);await pg.screenshot({path:out+`/mock_lanista_390_${t}.png`});await pg.setViewportSize({width:W,height:900})}}
console.log('ERRS',JSON.stringify(errs));await pg.close()}
await b.close()})();

/* Character designer mock: node tools/plans/mock99/mock_char.js flavius-arena.html
   → before_char_full.png (today, whole height) + mock_char_<tab>.png at 1440 + mock_char_390_<tab>.png */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const out=__dirname;
for(const W of [1440,390]){
const pg=await b.newPage({viewport:{width:W,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','0')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openStudio();await W8(800);
 ST.tab='chars';ST.draft=blankChar();ST.view='edit';studioRedraw();await W8(500);
 const r=document.querySelector('#studio [data-st="random"]');if(r)r.click();await W8(600);
 ST.draft.name='Marcus Varro';ST.draft.nickname='the Iron Wolf';ST.draft.backstory='Born on the docks of Ostia, Marcus fought for bread before he fought for coin. A debt to a Capuan lanista put him on the sand; a grudge keeps him there.';ST98.jump=Date.now();studioRedraw();await W8(800)});
if(W===1440){const H=await pg.evaluate(()=>document.getElementById('mBody').scrollHeight);await pg.setViewportSize({width:W,height:Math.min(H+120,3000)});await pg.waitForTimeout(400);
  await pg.screenshot({path:out+'/before_char_full.png'});await pg.setViewportSize({width:W,height:900});await pg.waitForTimeout(300)}
await pg.addScriptTag({path:path.join(__dirname,'char99.js')});
console.log(W,await pg.evaluate(()=>char99Build()));await pg.waitForTimeout(500);
for(const t of ['basics','look','fight','mind']){await pg.evaluate(t=>{char99Tab(t);document.getElementById('mBody').scrollTop=0},t);await pg.waitForTimeout(350);
  const H=await pg.evaluate(()=>document.getElementById('mBody').scrollHeight);
  if(W===1440){await pg.screenshot({path:out+`/mock_char_${t}.png`});console.log(t,'H',H)}
  else if(t==='basics'||t==='look'){await pg.setViewportSize({width:W,height:Math.min(H+80,2600)});await pg.waitForTimeout(300);await pg.screenshot({path:out+`/mock_char_390_${t}.png`});await pg.setViewportSize({width:W,height:900})}}
console.log('ERRS',JSON.stringify(errs));await pg.close()}
await b.close()})();

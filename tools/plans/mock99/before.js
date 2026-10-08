/* before shots: node tools/plans/mock99/before.js flavius-arena.html */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const out=__dirname;
for(const W of [1440,390]){
const pg=await b.newPage({viewport:{width:W,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openStudio();await W8(800);
 ST.tab='chars';ST.draft=blankChar();ST.draft.name='Marcus Varro';ST.view='edit';ST98.jump=Date.now();studioRedraw();await W8(800)});
const labels=await pg.evaluate(()=>[...document.querySelectorAll('#studio .st98bar [data-st98t]')].map(x=>x.textContent));
console.log(W,labels);
for(let i=0;i<labels.length;i++){await pg.click(`#studio .st98bar [data-st98t="${i}"]`);await pg.waitForTimeout(500);
 const nm=labels[i].replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'').toLowerCase()||('t'+i);
 if(W===1440)await pg.screenshot({path:out+`/before_char_${i}_${nm}.png`});else if(i<2)await pg.screenshot({path:out+`/before_char_390_${i}_${nm}.png`});
 if(W===1440){const h=await pg.evaluate(()=>document.getElementById('mBody').scrollHeight);console.log(nm,'scrollH',h)}}
console.log('ERRS',JSON.stringify(errs));await pg.close()}
await b.close()})();

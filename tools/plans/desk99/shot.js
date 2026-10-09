/* desk99 shots of the REAL game: node tools/plans/desk99/shot.js flavius-arena.html → tools/plans/desk99/desk99_<W>.png (+ _endweek, _off) */
const {chromium}=require('playwright');const {setup}=require('./setup.js');(async()=>{const b=await chromium.launch();const out=__dirname;
for(const [W,H,tag,off] of [[1440,900,'1440'],[1280,800,'1280'],[390,844,'390'],[1440,900,'off',1]]){
const pg=await b.newPage({viewport:{width:W,height:H}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_desk99off','1')},off||0);
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
await setup(pg);
if(W>500)await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const d=document.querySelector('#desk99 .dk99dec');if(d){d.click();await W8(200)}});
const info=await pg.evaluate(()=>({rows:[...document.querySelectorAll('#desk99 .dk99tw>.dk99row')].map(r=>r.querySelector('.ic').textContent+' '+r.querySelector('.tx').textContent.slice(0,90)+' ['+[...r.querySelectorAll('.dk99b button')].map(x=>x.textContent.trim()).join('|')+']'),
  letters:[...document.querySelectorAll('#desk99 .dk99lt>details')].map(d=>d.querySelector('summary').textContent.trim().slice(0,70)),rail:(document.querySelector('.mtabs [data-id="ludus"]')||{}).textContent,ovf:document.documentElement.scrollWidth>innerWidth}));
console.log(tag,JSON.stringify(info,null,1));
await pg.screenshot({path:out+`/desk99_${tag}.png`,fullPage:W<500});
if(W<500){await pg.evaluate(()=>{const d=document.querySelector('#desk99 .dk99sec');if(d)d.scrollIntoView({block:'start'})});await pg.waitForTimeout(300);await pg.screenshot({path:out+`/desk99_${tag}_b.png`});await pg.evaluate(()=>{const d=document.querySelector('#desk99 .dk99foot');if(d)d.scrollIntoView({block:'start'})});await pg.waitForTimeout(300);await pg.screenshot({path:out+`/desk99_${tag}_c.png`})}
if(W===1440&&!off){const tall=await pg.evaluate(()=>{const e=document.getElementById('mgrBody');return e?e.scrollHeight:0});await pg.setViewportSize({width:1440,height:Math.min(2600,tall+200)});await pg.waitForTimeout(400);await pg.screenshot({path:out+`/desk99_1440_full.png`});
  await pg.setViewportSize({width:1440,height:900});await pg.evaluate(async()=>{MGR.confirmEnd=true;MGR_REDRAW();await new Promise(r=>setTimeout(r,300));const e=document.querySelector('.endconfirm');if(e)e.scrollIntoView()});await pg.screenshot({path:out+`/desk99_endweek.png`})}
console.log(tag,'ERRS',JSON.stringify(errs));await pg.close()}
await b.close()})();

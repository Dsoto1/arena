/* before shots of the Manager new-lanista form + DOM outline: node tools/plans/mock99/before_lan.js flavius-arena.html */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const out=__dirname;
for(const W of [1440,390]){
const pg=await b.newPage({viewport:{width:W,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(1200);
 const c=document.querySelector('[data-mg="create"]');if(c)c.click();await W8(900)});
const H=await pg.evaluate(()=>document.getElementById('mBody').scrollHeight);console.log(W,'scrollH',H);
await pg.screenshot({path:out+`/before_lanista_${W}.png`});
await pg.setViewportSize({width:W,height:Math.min(H+160,4000)});await pg.waitForTimeout(400);
await pg.screenshot({path:out+`/before_lanista_${W}_full.png`});
if(W===1440){const r=await pg.evaluate(()=>{const out=[];const walk=(el,d)=>{if(d>9)return;const id=el.id?'#'+el.id:'';const cl=el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\s+/).join('.'):'';
  const ds=Object.keys(el.dataset||{}).slice(0,3).map(k=>`[${k}=${el.dataset[k]}]`).join('');
  const txt=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').slice(0,50);
  out.push('  '.repeat(d)+el.tagName.toLowerCase()+id+cl+ds+(txt?' "'+txt+'"':''));
  if(['SELECT','svg','OPTION','DATALIST'].includes(el.tagName))return;for(const c of el.children)walk(c,d+1)};
 walk(document.getElementById('mBody'),0);return out.join('\n')});require('fs').writeFileSync(process.env.DOMOUT||'/dev/null',r)}
console.log('ERRS',JSON.stringify(errs));await pg.close()}
await b.close()})();

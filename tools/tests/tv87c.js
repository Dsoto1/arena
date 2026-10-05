/* v0.87 class card rules side (153-v87card): every printed class renders on his template with its name, ability, coin/keys,
   weapons and armor; hovering a class card shows the printed figure side and the rules side together. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\.g/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const r=await pg.evaluate(()=>['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio'].map(k=>{const d=document.createElement('div');d.innerHTML=classBack87(k,240);const c=d.querySelector('.cb87');
  return {k,ok:!!c&&c.querySelector('.ttl b').textContent===CLASSES[k].name&&!!c.querySelector('img.bg[src*="clsback87"]')&&c.querySelectorAll('.body li').length>=2&&/\S/.test(c.querySelector('.ab').textContent)}}));
ok(r.every(x=>x.ok),'every class rules side '+JSON.stringify(r.filter(x=>!x.ok)));
await pg.evaluate(()=>{menuHide();const d=document.createElement('div');d.id='h87';d.style.cssText='position:fixed;left:40px;top:300px;z-index:50';d.innerHTML=cardHTML('k:hero','md');document.body.appendChild(d)});
await pg.hover('#h87 [data-card]');await pg.waitForTimeout(600);
ok(await pg.evaluate(()=>{const t=document.getElementById('tip');return !t.hidden&&!!t.querySelector('.cb87pair .cb87')}),'hover shows both sides');
console.log(JSON.stringify({miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

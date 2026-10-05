const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
// watch: log state every 50ms
await pg.evaluate(()=>{window.__st=[];setInterval(()=>{const s=(!document.getElementById('mainMenu').hidden?'M':'-')+(!document.getElementById('modal').hidden?'W':'-')+(CUR_MODAL?'C':'-');const L=window.__st;if(!L.length||L.at(-1)[1]!==s)L.push([Date.now(),s])},50)});
const modes=['play','manager','studio','annals','rules','settings','load'];const seq=[];let bad=[];
for(let i=0;i<40;i++){const m=modes[i%modes.length];
  const st0=await pg.evaluate(()=>({menu:!document.getElementById('mainMenu').hidden,busy:modalBusy()}));
  if(!st0.menu){await pg.evaluate(()=>menuShow());await pg.waitForTimeout(200)}
  const t0=Date.now();await pg.evaluate(m=>{const b=document.querySelector(`[data-mm="${m}"]`);b&&b.click()},m);
  await pg.waitForTimeout(1500);
  const st=await pg.evaluate(()=>({menu:!document.getElementById('mainMenu').hidden,modal:!document.getElementById('modal').hidden,cur:!!CUR_MODAL,title:document.getElementById('mTitle').textContent.slice(0,30)}));
  seq.push([m,st.menu?'MENU':'',st.modal?'W:'+st.title:'']);
  if(st.menu&&!['rules','settings','load'].includes(m))bad.push([i,m,st]);
  if(!st.modal&&!st.menu)bad.push([i,m,'blank',st]);
  // close: sometimes quickly via X, sometimes Escape
  const d=[50,300,500,900][i%4];await pg.waitForTimeout(d);
  await pg.evaluate(()=>{const x=document.getElementById('mClose');if(x&&!x.hidden)x.click()});
  await pg.waitForTimeout(i%3?200:700);
}
console.log(JSON.stringify(bad.slice(0,10)));console.log(JSON.stringify(seq.slice(0,14)));console.log(errs.slice(0,4));
await b.close()})();

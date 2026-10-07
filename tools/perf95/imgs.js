/* v0.95 perf: images (re)inserted into the DOM in 10 s of an all-CPU match. node tools/perf95/imgs.js <page> */
const {chromium}=require('playwright');
const path=require('path');
const PAGE=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto(await require('./serve.js')(PAGE));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true}))});
  for(let i=0;i<200;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>8)break}
  SPEED='normal';setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)},300);
  const seen={};const mo=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1)continue;const all=[n,...n.querySelectorAll('*')];for(const el of all){
     let u=el.tagName==='IMG'?el.getAttribute('src'):el.tagName==='image'?(el.getAttribute('href')||el.getAttribute('xlink:href')):'';
     const bg=el.style&&el.style.backgroundImage;if(!u&&bg&&bg!=='none')u=bg;if(!u)continue;const k=(u.slice(0,40)+'…'+u.length);const par=(m.target.id||m.target.className||m.target.tagName||'').toString().slice(0,30);seen[k]=seen[k]||{n:0,where:{}};seen[k].n++;seen[k].where[par]=(seen[k].where[par]||0)+1}}});
  mo.observe(document.body,{childList:true,subtree:true});await W8(10000);mo.disconnect();
  return Object.entries(seen).sort((a,b)=>b[1].n-a[1].n).slice(0,25).map(([k,v])=>v.n+' '+k+' '+JSON.stringify(v.where).slice(0,120))});
console.log(r.join('\n'));await b.close()})();

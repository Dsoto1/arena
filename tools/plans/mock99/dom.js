/* dump DOM outline of the char editor: node tools/plans/mock99/dom.js flavius-arena.html [chars|lanista] */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openStudio();await W8(800);
 ST.tab='chars';ST.draft=blankChar();ST.view='edit';studioRedraw();await W8(800);
 const out=[];const walk=(el,d)=>{if(d>7)return;const id=el.id?'#'+el.id:'';const cl=el.className&&typeof el.className==='string'?'.'+el.className.trim().split(/\s+/).join('.'):'';
  const ds=Object.keys(el.dataset||{}).slice(0,3).map(k=>`[${k}=${el.dataset[k]}]`).join('');
  const txt=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').slice(0,40);
  out.push('  '.repeat(d)+el.tagName.toLowerCase()+id+cl+ds+(txt?' "'+txt+'"':''));
  if(['SELECT','SVG','svg','OPTION','DATALIST'].includes(el.tagName))return;for(const c of el.children)walk(c,d+1)};
 walk(document.getElementById('studio'),0);return out.join('\n')});
console.log(r);await b.close()})();

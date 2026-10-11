/* node tools/plans/mock100/brief_faces.js — renders the seat portraits for brief.html from the built game (gladPortrait + portraitHTML) */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1200,height:900},deviceScaleFactor:2});
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(__dirname,'../../../flavius-arena.html'));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const L=[['Varinius Gracchi','royalty'],['Galla "Fatum" Aquila','amazonia'],['The Scourge of Arles','soldier'],['Nonus Messala','damnatio'],
 ['Thraex Murmillo','hero'],['Tigris the Twice-Freed','amazonia'],['Ferrum the Unkillable','veteranus'],['Tertius Audax','venatore']];
await pg.evaluate(L=>{const box=document.createElement('div');box.style.cssText='position:fixed;left:0;top:0;z-index:99999;display:flex;flex-wrap:wrap;gap:8px;background:transparent';
 box.innerHTML=L.map(([n,k],i)=>`<div id="pf${i}" style="width:max-content">${portraitHTML({name:n,portrait:gladPortrait(n,k),color:CLASSES[k].color},'lg')}</div>`).join('');document.body.appendChild(box)},L);
await pg.waitForTimeout(2000);
for(let i=0;i<L.length;i++){const el=await pg.$('#pf'+i+' > *');await el.screenshot({path:path.resolve(__dirname,`img/brief_face${i}.png`),omitBackground:true})}
await b.close()})();

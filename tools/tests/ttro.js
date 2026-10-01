const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{openStudio('trophies')});await pg.waitForTimeout(900);
await pg.evaluate(()=>{ST.trd.metal='cedar';ST.trd.base='porphyry';ST.trd.topper='owl';ST.trd.shape='urn';ST.trd.name='The Cedar Owl';document.querySelector('[data-trs="new"]');
  const s=document.getElementById('studio');});
// add a sculpt shape via the UI
await pg.evaluate(()=>{const redrawBtn=document.querySelector('[data-scb="add"][data-k="t"][data-v="star"]');redrawBtn.click()});await pg.waitForTimeout(400);
// drag it on the preview
const box=await pg.evaluate(()=>{const r=document.querySelector('#trPrev svg').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}});
await pg.mouse.move(box.x+box.w*0.5,box.y+box.h*0.37);await pg.mouse.down();await pg.mouse.move(box.x+box.w*0.72,box.y+box.h*0.3,{steps:6});await pg.mouse.up();
await pg.waitForTimeout(300);
const st=await pg.evaluate(()=>({layers:ST.trd.layers,matOpts:document.querySelectorAll('[data-trf="metal"] option').length,groups:[...document.querySelectorAll('[data-trf="metal"] optgroup')].map(g=>g.label),toppers:document.querySelectorAll('[data-trf="topper"] option').length}));
await pg.screenshot({path:'trophy36.png',clip:{x:0,y:40,width:1400,height:700}});
console.log(JSON.stringify(st),errs.slice(0,3));await b.close()})();

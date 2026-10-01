const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{openStudio('gear')});await pg.waitForTimeout(800);
for(const t of ['circle','rect','star'])await pg.click(`[data-scb="add"][data-k="w"][data-v="${t}"]`);
const before=await pg.evaluate(()=>ST.cw.art.layers.map(L=>[L.x,L.y]));
// drag the FIRST shape (circle) only
const r=await pg.evaluate(()=>{const e=document.querySelector('#cwArt svg').getBoundingClientRect();const L=ST.cw.art.layers[0];return {x:e.left+L.x/100*e.width,y:e.top+L.y/100*e.height,w:e.width}});
await pg.mouse.move(r.x,r.y);await pg.mouse.down();await pg.mouse.move(r.x+60,r.y+50,{steps:6});await pg.mouse.up();await pg.waitForTimeout(300);
const after=await pg.evaluate(()=>ST.cw.art.layers.map(L=>[L.x,L.y]));
// lock the star and try to drag it
await pg.click('[data-scb="lock"][data-k="w"][data-v="2"]');
const r2=await pg.evaluate(()=>{const e=document.querySelector('#cwArt svg').getBoundingClientRect();const L=ST.cw.art.layers[2];return {x:e.left+L.x/100*e.width,y:e.top+L.y/100*e.height}});
await pg.mouse.move(r2.x,r2.y);await pg.mouse.down();await pg.mouse.move(r2.x-50,r2.y+40,{steps:6});await pg.mouse.up();await pg.waitForTimeout(300);
const after2=await pg.evaluate(()=>ST.cw.art.layers.map(L=>[L.x,L.y,!!L.lk]));
await pg.click('[data-scb="hide"][data-k="w"][data-v="1"]');await pg.waitForTimeout(200);
const hid=await pg.evaluate(()=>({hid:ST.cw.art.layers[1].hid,rects:document.querySelectorAll('#cwArt svg rect').length}));
await pg.screenshot({path:'layers.png'});
console.log(JSON.stringify({before,after,after2,hid}),errs.slice(0,3));await b.close()})();

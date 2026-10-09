/* shots of the desk mock: node tools/plans/mock99/desk_shot.js */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
await pg.goto('file://'+__dirname+'/desk.html');await pg.waitForTimeout(1500);
await (await pg.$('#desk1440')).screenshot({path:__dirname+'/desk_1440.png'});
await (await pg.$('#desk390')).screenshot({path:__dirname+'/desk_390.png'});
await (await pg.$('#askEnd')).screenshot({path:__dirname+'/desk_endweek.png'});
await pg.screenshot({path:__dirname+'/desk_page.png',fullPage:true});
const fonts=await pg.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family));console.log('fonts',fonts);
const ov=await pg.evaluate(()=>[...document.querySelectorAll('.tx')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent.slice(0,50)));console.log('clipped',ov);
await b.close()})();

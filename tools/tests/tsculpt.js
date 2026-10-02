const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{openStudio('gear').catch(e=>window.__e=String(e.stack))});await pg.waitForTimeout(300);console.log(await pg.evaluate(()=>window.__e));await pg.waitForTimeout(800);
const tab=async v=>{await pg.evaluate(v=>{const b=document.querySelector(`[data-st="tab"][data-v="${v}"]`);b&&b.click()},v);await pg.waitForTimeout(400)};
const addDrag=async(k,prevSel,to)=>{await pg.click(`[data-scb="add"][data-k="${k}"][data-v="circle"]`);await pg.waitForTimeout(200);
  const r=await pg.evaluate(s=>{const e=document.querySelector(s);const b=e.getBoundingClientRect();return {x:b.left,y:b.top,w:b.width,h:b.height}},prevSel);
  const o=await pg.evaluate(k=>{const D=SCB_KIND[k];const L=D.obj().layers.at(-1);return [L.x,L.y]},k);
  const vb=await pg.evaluate(k=>SCB_KIND[k].vb,k);
  // start on the shape's own spot (for the token, its viewBox mapping is not 1:1 — use a near hit anyway)
  const sx=r.x+o[0]/vb[0]*r.w,sy=r.y+o[1]/vb[1]*r.h;
  await pg.mouse.move(sx,sy);await pg.mouse.down();await pg.mouse.move(sx+r.w*to[0],sy+r.h*to[1],{steps:6});await pg.mouse.up();await pg.waitForTimeout(300);
  return await pg.evaluate(k=>{const o=SCB_KIND[k].obj();return {n:o.layers.length,last:[o.layers.at(-1).x,o.layers.at(-1).y],sel:scbSelGet(k)}},k)};
const res={};
// weapon
await pg.screenshot({path:"sc_0.png"});console.log(await pg.evaluate(()=>({tab:ST.tab,has:!!document.querySelector(".scbench"),adds:[...document.querySelectorAll("[data-scb=add]")].slice(0,3).map(b=>b.outerHTML.slice(0,120))})));
res.wBlank=await pg.evaluate(()=>ST.cw.art.type);
res.w=await addDrag('w','#cwArt svg',[0.2,-0.2]);
res.wCardHasShape=await pg.evaluate(()=>/<circle|<ellipse/.test(document.getElementById('cwPrev').innerHTML));
await pg.click('[data-scb="bake"][data-k="w"]');await pg.waitForTimeout(200);
res.wBaked=await pg.evaluate(()=>[ST.cw.art.layers.length,ST.cw.art.baked.length]);
await pg.screenshot({path:'sc_w.png'});
await pg.click('[data-scb="unbake"][data-k="w"]');await pg.waitForTimeout(200);
res.wUnbaked=await pg.evaluate(()=>[ST.cw.art.layers.length,ST.cw.art.baked.length]);
// armor
await pg.click('[data-st="tab"][data-v="gear:a"]');await pg.waitForTimeout(300);
res.aBlank=await pg.evaluate(()=>ST.ca.shape);
res.a=await addDrag('a','#caPiece svg',[-0.15,0.1]);
/* v0.69: the mock-up sits under the piece; pick an equip point, drag the whole piece, re-slot through the equip point */
await pg.evaluate(()=>{const s=document.querySelector('[data-caeq2]');s.value='chest';s.dispatchEvent(new Event('change',{bubbles:true}))});await pg.waitForTimeout(400);
const r=await pg.evaluate(()=>{const b=document.querySelector('#caAv svg').getBoundingClientRect();const F=caFit(ST.ca);return {x:b.left+F.x/150*b.width,y:b.top+F.y/332*b.height,w:b.width,h:b.height}});
await pg.mouse.move(r.x,r.y);await pg.mouse.down();await pg.mouse.move(r.x+10,r.y-20,{steps:5});await pg.mouse.up();await pg.waitForTimeout(300);
res.aFit=await pg.evaluate(()=>ST.ca.fit);
await pg.evaluate(()=>{const s=document.querySelector('[data-caeq2]');s.value='head';s.dispatchEvent(new Event('change',{bubbles:true}))});await pg.waitForTimeout(400);
res.aSlot=await pg.evaluate(()=>ST.ca.slot);
await pg.screenshot({path:'sc_a.png'});
// trophy
await tab('trophies');res.tBlank=await pg.evaluate(()=>ST.trd.shape);res.t=await addDrag('t','#trPrev svg',[0.1,0.1]);await pg.screenshot({path:'sc_t.png'});
// banner
await tab('flags');res.fBlank=await pg.evaluate(()=>ST.fd.shape);res.f=await addDrag('f','#fdPrev',[0.2,0.05]);
res.fSrcHas=await pg.evaluate(()=>decodeURIComponent(document.getElementById('fdPrev').src).includes("scale(6)"));await pg.screenshot({path:'sc_f.png'});
// token
await tab('tokens');await pg.waitForTimeout(300);res.tok=await addDrag('tok','#tokPrev svg',[0.05,0.05]);
res.tokBench=await pg.evaluate(()=>!!document.querySelector('.scbench [data-k="tok"]'));
await pg.screenshot({path:'sc_tok.png'});
console.log(JSON.stringify(res),errs.slice(0,5));await b.close()})();

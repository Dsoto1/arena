/* v0.75: the ratings fold above the avatar toggles on the press, so a board redraw between press and release no longer
   swallows it; a normal click toggles once; the keyboard still works */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true}],opts:{spect:0}});await W8(2500);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(150)}render();await W8(300)});
const box=async()=>{const r=await pg.locator('#board .ratfold').boundingBox();return r&&{x:r.x+r.width/2,y:r.y+r.height/2}};
const shut=()=>pg.evaluate(()=>RAT_SHUT);
/* press → the board is rebuilt → release */
let s0=await shut();let p=await box();await pg.mouse.move(p.x,p.y);await pg.mouse.down();await pg.evaluate(()=>{render();render()});await pg.mouse.up();await pg.waitForTimeout(200);
o.redraw=(await shut())!==s0;
/* a plain click toggles exactly once */
s0=await shut();p=await box();await pg.mouse.click(p.x,p.y);await pg.waitForTimeout(200);o.once=(await shut())!==s0;
/* the keyboard */
s0=await shut();await pg.focus('#board .ratfold');await pg.keyboard.press('Enter');await pg.waitForTimeout(200);o.key=(await shut())!==s0;
o.view=await pg.evaluate(()=>document.querySelector('#board .statrow').classList.contains('shut')===RAT_SHUT);
ok(o.redraw,'toggles through a redraw');ok(o.once,'one click = one toggle');ok(o.key,'keyboard');ok(o.view,'drawer follows the state');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

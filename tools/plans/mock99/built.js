/* v0.99 built designer shots: node tools/plans/mock99/built.js flavius-arena.html
   → built_char_<tab>.png (1440) + built_char_390_<tab>.png, built_lanista_studio_<tab>.png, built_lanista_manager_<tab>.png (+ _390_) */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const out=__dirname;
const shot=async(pg,W,name,full)=>{if(W===390||full){const H=await pg.evaluate(()=>document.getElementById('mBody').scrollHeight);await pg.setViewportSize({width:W,height:Math.min(H+80,2800)});await pg.waitForTimeout(300)}
  await pg.screenshot({path:out+'/'+name+'.png'});await pg.setViewportSize({width:W,height:900})};
for(const W of [1440,390]){
const pg=await b.newPage({viewport:{width:W,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','0')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
const sfx=W===390?'_390':'';
/* character */
await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openStudio();await W8(800);
 ST.tab='chars';ST.draft=blankChar();ST.view='edit';studioRedraw();await W8(500);
 const r=document.querySelector('#studio [data-st="random"]');if(r)r.click();await W8(600);
 ST.draft.name='Marcus Varro';ST.draft.nickname='the Iron Wolf';ST.draft.backstory='Born on the docks of Ostia, Marcus fought for bread before he fought for coin. A debt to a Capuan lanista put him on the sand; a grudge keeps him there.';DF99.jump=Date.now();studioRedraw();await W8(800)});
for(const t of ['basics','look','fight','mind','list']){if(W===390&&!['basics','look','fight'].includes(t))continue;
  await pg.evaluate(t=>{DF99.tab(document.querySelector('.df99'),t);document.getElementById('mBody').scrollTop=0},t);await pg.waitForTimeout(350);await shot(pg,W,`built_char${sfx}_${t}`)}
/* studio lanista */
await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));document.querySelector('#studio [data-st="tab"][data-v="lanistas"]').click();await W8(600);
 ST.lnd.name='Cinis Bone-Breaker';ST.lnd.nick='the Iron Purse';ST.lnd.ludus='Ludus Vindex';DF99.jump=Date.now();studioRedraw();await W8(600)});
for(const t of ['id','look','house','mind','start']){if(W===390&&!['id','look'].includes(t))continue;
  await pg.evaluate(t=>{DF99.tab(document.querySelector('.df99'),t);document.getElementById('mBody').scrollTop=0},t);await pg.waitForTimeout(300);await shot(pg,W,`built_lanista_studio${sfx}_${t}`)}
/* manager */
await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));CUR_MODAL.done(null);await W8(600);if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();openManager();await W8(1200);
 const c=document.querySelector('[data-mg="create"]');if(c)c.click();await W8(900);NEWMGR.nick='the Iron Purse';DF99.jump=Date.now();MGR_REDRAW();await W8(600)});
for(const t of ['id','look','house','mind','start']){if(W===390&&!['id','look','start'].includes(t))continue;
  await pg.evaluate(t=>{DF99.tab(document.querySelector('.df99'),t);document.getElementById('mBody').scrollTop=0},t);await pg.waitForTimeout(300);await shot(pg,W,`built_lanista_manager${sfx}_${t}`,t==='start')}
console.log(W,'ERRS',JSON.stringify(errs));await pg.close()}
await b.close()})();

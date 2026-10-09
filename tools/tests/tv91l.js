/* v0.91 Your ludus layout (202-v91ludus; v0.99: the Lanista's desk 270 replaces the row): mail + checklist share one row; 📜 Acta in the mail header; Week in review = a letter at the
   top of the mail; its numbers = a thin row in the banner; week 1's welcome = an open letter. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1600,height:1000}});await pg.route(/fonts\.g/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const look=()=>pg.evaluate(()=>{const row=document.querySelector('#mgrBody #desk99');
  return {row:!!row,old:!!document.querySelector('#mgrBody .lrow91,#mgrBody #mailBox,#mgrBody .wkcheck'),
    acta:!!document.querySelector('#desk99 .dk99hd .acta91[data-mg="paper"]'),lst:(document.querySelector('.roomhd.b73-ludus .lst91')||{}).textContent||'',
    first:(document.querySelector('#desk99 .dk99lt > details.rev91:first-child summary')||{}).textContent||'',open:!!document.querySelector('#desk99 details.rev91[open]'),
    oldRev:!!document.querySelector('#mgrBody .revbox'),landing:!!document.querySelector('#mgrBody .landing')}});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(500)});
const A=await look();ok(A.row&&!A.old,'1 the desk replaces the mail + checklist row (v0.99, 270) '+JSON.stringify(A));ok(/Welcome to/.test(A.first)&&A.open,'1 the welcome is an open letter first in the letters');ok(!A.oldRev&&!A.landing,'1 no old review box');
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const g=rosterOf(me())[0];w.review={wk:1,season:1,coinD:-59,coin:361,fameD:2,winsD:0,boutsD:1,dead:[],results:[{name:g.name,tier:'Undercard',place:2,f:18,fate:'spared'}]};w.lastPaper={wk:1};MGR_REDRAW();await W8(400)});
const B=await look();ok(B.acta,'2 Acta button in the desk header');ok(/-59/.test(B.lst)&&/fame/.test(B.lst)&&/0\/1/.test(B.lst)&&/fallen/.test(B.lst),'2 numbers in the banner: '+B.lst);
ok(/Week I in review/.test(B.first)&&!B.open,'2 week in review = the first letter (closed) '+B.first);ok(B.row,'2 desk kept');
const C=await pg.evaluate(async()=>{const d=document.querySelector('#desk99 details.rev91');d.open=true;await new Promise(r=>setTimeout(r,100));return d.textContent});ok(/Undercard/.test(C),'2 the letter holds the results');
console.log(JSON.stringify({A,B}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

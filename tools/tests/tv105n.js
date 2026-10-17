/* v1.05 F2 (377-v105ban): the Your-ludus week banner has no review chips (treasury now / fame / wins-bouts / fallen · in all / N this week);
   the top bar still shows treasury; the Match Week card and the Acta button stay; flavius_v105banoff=1 brings the chips back. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\.g/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';
  const w=W_();const g=rosterOf(me())[0];w.review={wk:1,season:1,coinD:-59,coin:361,fameD:2,winsD:0,boutsD:1,dead:[],results:[{name:g.name,tier:'Undercard',place:2,f:18,fate:'spared'}]};w.lastPaper={wk:1};MGR_REDRAW();await W8(500)});
const look=()=>pg.evaluate(()=>{const ban=document.querySelector('#mgrBody .lu100ban');return {ban:!!ban,txt:ban?ban.textContent:'',row:!!document.querySelector('#mgrBody .lu100ban .lst91'),mw:!!document.querySelector('#mgrBody .lu100ban .lu100mw'),
  head:(document.querySelector('.mhead')||{}).textContent||'',acta:!!document.querySelector('#mgrBody [data-mg="paper"]')}});
const A=await look();ok(A.ban&&A.mw,'banner + Match Week card kept');ok(!A.row,'no chip row in the banner');ok(!/treasury \(now|wins \/ bouts|fallen|in all|this week/.test(A.txt),'no chip text in the banner: '+A.txt);
ok(/\d/.test(A.head),'top bar still shows the treasury: '+A.head.slice(0,160));
ok(A.acta,'Acta Diurna button kept');
await pg.evaluate(()=>{localStorage.setItem('flavius_v105banoff','1');MGR_REDRAW()});await pg.waitForTimeout(400);
const K=await look();ok(K.row&&/fame/.test(K.txt),'kill switch flavius_v105banoff=1 brings the chips back');
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

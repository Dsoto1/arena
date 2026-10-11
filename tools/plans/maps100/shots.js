/* 295-v100maps review shots: node tools/plans/maps100/shots.js [page] → tools/plans/maps100/*.png (desktop 1440 + phone 390). */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');const OUT=__dirname;
(async()=>{const b=await chromium.launch();
for(const [tag,vp] of [['d',{width:1440,height:900}],['p',{width:390,height:844}]]){
  const ctx=await b.newContext({viewport:vp});await ctx.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  const pg=await ctx.newPage();await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
  const ev=s=>pg.evaluate(`(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));${s}})()`);
  const snap=async(sel,name)=>{try{const el=await pg.$(sel);if(!el){console.log('missing',name);return}await el.scrollIntoViewIfNeeded({timeout:4000});await pg.waitForTimeout(250);await el.screenshot({path:path.join(OUT,tag+'_'+name+'.png'),timeout:6000})}catch(e){console.log('skip',tag,name,e.message.split('\n')[0])}};
  await ev(`while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}try{menuHide()}catch(e){}openManager();await W8(400);newWorld({type:'pre',key:MGR_PRE[4].key});
    const w=W_();sendLetter(w,{key:'consil-'+w.week,from:'the Consilium',seal:'🏛',title:'Counsel for Capua: hold our fighters back',body:'<p>Riots in Capua: the crowds turn on the games. Keep our fighters home this week.</p>'});
    MGR.tab='night';MGR_REDRAW();await W8(400)`);
  await snap('#mgrBody .strip96','1_travel');
  await ev(`MGR.tab='ludus';MGR.mailOpen='L:consil-'+W_().week;MGR_REDRAW();await W8(400);const mb=document.querySelector('#mgrBody [data-lu100mail]');if(mb){mb.click();await W8(400)}for(const d of document.querySelectorAll('#mgrBody details.mail'))if(d.querySelector('.mi100let'))d.open=true;const l=document.querySelector('#mgrBody .mi100let');const d=l&&l.closest('details');if(d)d.open=true;await W8(200)`);
  await snap('#mgrBody .mi100let','2_letter_inset');
  await pg.evaluate(()=>{const l=document.querySelector('#mgrBody .mi100let');const p=l&&(l.closest('details')||l.closest('.dk99ex')||l.parentElement);if(p)p.setAttribute('data-shot','1')});await snap('[data-shot]','2_letter');
  await ev(`MGR.tab='recruit';MGR_REDRAW();await W8(300);document.querySelector('#mgrBody tr[data-mg="sel"]').click();await W8(400)`);
  await snap('#mgrBody .mgrid > div:nth-child(2) > .card2','3_recruit_card');await snap('#mgrBody .seg.recflt','3_recruit_filter').catch(()=>{});
  await ev(`MGR.tab='league';MGR_REDRAW();await W8(300);document.querySelector('#mgrBody [data-wd100h]').click();await W8(400)`);
  await snap('#mgrBody .wd100hc','5_house');
  await ev(`MGR.tab='ludus';MGR.pg84={open:true,cities:[4,6],weeks:3,gid:null};MGR.run='promote';LU100.panel='promote';MGR_REDRAW();await W8(400)`);
  await snap('#mgrBody .pg84set','6_programmata');
  if(tag==='d'){await ev(`MGR.tab='sched';MGR_REDRAW();await W8(400)`);const wk=await pg.$('#mgrBody .wd100wk:nth-child(3)');if(wk){await wk.scrollIntoViewIfNeeded();await wk.hover();await pg.waitForTimeout(300);
    const bb=await wk.boundingBox();await pg.screenshot({path:path.join(OUT,tag+'_7_calendar.png'),clip:{x:Math.max(0,bb.x-120),y:Math.max(0,bb.y-160),width:420,height:bb.height+180}})}}
  await ev(`const R={gid:'x',step:4,name:'Leo',cls:'hero'};const box=document.createElement('div');box.id='shotRoad';box.style.cssText='position:fixed;left:8px;top:8px;width:'+Math.min(980,innerWidth-32)+'px;z-index:99999;background:#1f1711;color:#e8dcc0;padding:10px;border-radius:8px';box.innerHTML=roadVisualHTML(R,[],'');document.body.appendChild(box);await W8(500)`);
  await snap('#shotRoad','4_road');await ctx.close()}
await b.close()})();

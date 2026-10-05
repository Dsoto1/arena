/* v0.72: system sets keep their place when the armor art style changes (scan/drawn), shared set cards (Your … / 🔒 System …),
   the fit tool merged into the armor designer (🎯 Fit on a printed card, ✓ Done), weapons get a system section + Copy & edit,
   right/left fitting for custom pairs, baked round-2 fits, and the 3D minis token style (Settings → Tokens, board, pillars) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();const r={};
  r.fits=ARM_FIT.spaulder&&ARM_FIT.spaulder.flip===1&&ARM_FIT.cestus&&ARM_FIT.cestus.L;
  const cnt=()=>document.querySelectorAll('.setgrid.sys > .lrow, .setgrid.sys .lrow').length;
  SETTINGS.armorStyle='scan';ST.gearSub='a';ST.ca=blankCA();openStudio('gear');await W8(900);r.scan=cnt();r.head=[...document.querySelectorAll('#mBody h4')].some(h=>/🔒 System armor · \d+/.test(h.textContent));
  CUR_MODAL&&CUR_MODAL.done(null);await W8(300);SETTINGS.armorStyle='drawn';ST.gearSub='a';openStudio('gear');await W8(900);r.drawn=cnt();
  r.fitBtn=!!document.querySelector('[data-afit3]');localStorage.setItem('flavius_armfit_on','1');caRedraw();await W8(300);
  const f=document.querySelector('[data-afit3]');r.fitBtnOn=!!f;if(f){f.click();await W8(500)}r.fitMode=!!document.querySelector('.afit.fitmode')&&!!document.querySelector('.fitbanner');
  const d=document.querySelector('[data-afdone]');if(d){d.click();await W8(400)}r.done=!document.querySelector('.afit');localStorage.removeItem('flavius_armfit_on');
  CUR_MODAL&&CUR_MODAL.done(null);await W8(300);ST.gearSub='w';openStudio('gear');await W8(900);
  r.wsys=!![...document.querySelectorAll('#mBody h4')].find(h=>/🔒 System weapons · \d+/.test(h.textContent));const cw=document.querySelector('[data-gs="cwsys"]');r.wcopy=!cw; /* v0.76: examples only, no Copy */
  CUR_MODAL&&CUR_MODAL.done(null);await W8(300);return r});
o.b=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};
  openSettings('tokens');await W8(600);const row=document.querySelector('[data-tokstyle="mini3d"]');r.row=!!row&&row.querySelectorAll('img').length===8;
  row.click();await W8(500);r.on=SETTINGS.mini3d===true&&tokenStyle()==='standee'&&STANDEE_SRC.hero==='assets/mini_hero.webp'&&STANDEE_SRC.zoraMini==='assets/mini_zora.webp';
  const row2=document.querySelector('[data-tokstyle="mini3d"]');r.badge=!!row2&&row2.classList.contains('on')&&!document.querySelector('[data-tokstyle="standee"].on');
  CUR_MODAL&&CUR_MODAL.done(null);await W8(300);
  startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:false},{cls:'hero',cpu:true},{cls:'royalty',cpu:true},{cls:'venatore',cpu:true}],opts:{}});
  await W8(2800);for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}await W8(1500);
  r.img=!!MINI_IMG.pillar&&MINI_IMG.pillar.complete&&!!MINI_IMG.soldier&&MINI_IMG.soldier.naturalWidth>0&&!!MINI_IMG.ursa;r.scale=miniScale('ursa')<miniScale('hero');
  S.over=true;openSettings('tokens');await W8(600);document.querySelector('[data-tokstyle="figure"]').click();await W8(400);
  r.off=!SETTINGS.mini3d&&tokenStyle()==='figure'&&STANDEE_SRC.hero!=='assets/mini_hero.webp';CUR_MODAL&&CUR_MODAL.done(null);return r});
const a=o.a,c=o.b;ok(a.fits,'round-2 fits baked');ok(a.scan>=27&&a.scan===a.drawn&&a.head,'system armor in both art styles');ok(!a.fitBtn&&a.fitBtnOn&&a.fitMode&&a.done,'fit tool merged');
ok(a.wsys&&a.wcopy,'system weapons');ok(c.row&&c.on&&c.badge,'3D minis setting');ok(c.img&&c.scale,'3D minis on the board');ok(c.off,'back to figures');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

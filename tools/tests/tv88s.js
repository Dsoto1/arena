/* v0.88 settings pass: General grouped (Gameplay · Hints & help · On the board · Accessibility · Visuals · Voices), Animations
   Full/Quick/Off (animOn off), Follow camera (camFocus off), audio sliders full width, locked themes folded. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const g=await pg.evaluate(async()=>{openSettings('general');await new Promise(r=>setTimeout(r,500));const B=document.getElementById('mBody');
  const hs=[...B.querySelectorAll('.setgrid > h4')].map(h=>h.textContent.trim().split(' ')[0]);
  const grid=[...B.querySelector('.setgrid').children];const idx=sel=>grid.findIndex(e=>e.matches(sel)||e.querySelector(sel));const hi=t=>grid.findIndex(e=>e.tagName==='H4'&&e.textContent.startsWith(t));
  const r={hs,order:hi('Gameplay')<idx('[data-sspeed]')&&idx('[data-sspeed]')<idx('[data-anim88]')&&idx('[data-set="ctxMenu"]')<hi('Hints')&&hi('Hints')<idx('[data-set="hints"]')&&idx('[data-set="hints"]')<hi('On the board')&&hi('On the board')<idx('[data-set="fx"]')&&idx('[data-sxray]')<hi('Accessibility'),
    voices:!!B.querySelector('[data-set="thoughts"]')};
  B.querySelector('[data-anim88="off"]').click();r.off=SETTINGS.anim88==='off';const _S=window.S;window.S={};r.animOff=!animOn();window.S=_S;
  B.querySelector('[data-anim88="full"]').click();
  const cam=B.querySelector('[data-set="cam88"]');cam.click();r.camOff=SETTINGS.cam88===false;cam.click();r.camOn=SETTINGS.cam88!==false;
  CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,400));openSettings('audio');await new Promise(r=>setTimeout(r,500));
  const s=document.querySelectorAll('#mBody .setrow.slider.aud88 input[type=range]');r.sliders=s.length;r.sw=s.length?s[0].getBoundingClientRect().width:0;
  r.fold=!!document.querySelector('#mBody details.lk88');r.rows=document.querySelectorAll('#audTracks .trackrow').length;try{audListRefresh()}catch(e){r.err=e.message}r.rows2=document.querySelectorAll('#audTracks .trackrow').length;
  CUR_MODAL.done(null);return r});
ok(g.hs.join(',').startsWith('Gameplay,Hints,On,Accessibility,Visuals,Voices'),'groups in order '+g.hs);
ok(g.order&&g.voices,'rows sit under their groups '+JSON.stringify(g));
ok(g.off&&g.animOff,'Animations Off → no animations');ok(g.camOff&&g.camOn,'Follow camera switch');
ok(g.sliders===2&&g.sw>150,'volume sliders full width '+g.sw);ok(g.fold&&g.rows===g.rows2&&!g.err,'locked themes folded, refresh keeps rows');
console.log(JSON.stringify({miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

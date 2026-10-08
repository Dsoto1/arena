/* v0.88 settings pass: General grouped (Gameplay · Hints & help · On the board · Accessibility · Visuals · Voices), Animations
   Full/Quick/Off (animOn off), Follow camera (camFocus off), audio sliders full width, locked themes folded. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
/* v0.98 (246-v98ui): the groups are cards on their rail pages — Gameplay on General, Hints & help + On the board on Hints & board, voices there too */
const g=await pg.evaluate(async()=>{openSettings('general');await new Promise(r=>setTimeout(r,500));const B=document.getElementById('mBody');
  const cardOf=sel=>{const e=B.querySelector(sel);const c=e&&e.closest('.s98-card');return c?c.querySelector('h3').textContent.trim():''};
  const gp=['[data-sspeed]','[data-anim88]','[data-set="confirmEnd"]','[data-set="cam88"]','[data-set="briefing"]','[data-set="ctxMenu"]'].map(cardOf);
  B.querySelector('[data-stab="help"]').click();await new Promise(r=>setTimeout(r,300));
  const hp=[cardOf('[data-set="hints"]'),cardOf('[data-set="fx"]'),cardOf('[data-sxray]')];const hs=[gp[0],hp[0],hp[1]];
  const r={hs,order:gp.every(x=>/Gameplay/.test(x))&&/Hints/.test(hp[0])&&/On the board/.test(hp[1])&&/On the board/.test(hp[2]),voices:!!B.querySelector('[data-set="thoughts"]')};
  B.querySelector('[data-stab="general"]').click();await new Promise(r=>setTimeout(r,300));
  B.querySelector('[data-anim88="off"]').click();r.off=SETTINGS.anim88==='off';const _S=window.S;window.S={};r.animOff=!animOn();window.S=_S;
  B.querySelector('[data-anim88="full"]').click();
  const cam=B.querySelector('[data-set="cam88"]');cam.click();r.camOff=SETTINGS.cam88===false;cam.click();r.camOn=SETTINGS.cam88!==false;
  CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,400));openSettings('audio');await new Promise(r=>setTimeout(r,500));
  const s=document.querySelectorAll('#mBody .s98-range input[type=range][data-audv]');r.sliders=s.length;r.sw=s.length?s[0].getBoundingClientRect().width:0;
  r.fold=!!document.querySelector('#mBody details.lk88');r.rows=document.querySelectorAll('#audTracks .trackrow').length;try{audListRefresh()}catch(e){r.err=e.message}r.rows2=document.querySelectorAll('#audTracks .trackrow').length;
  CUR_MODAL.done(null);return r});
ok(/Gameplay/.test(g.hs[0])&&/Hints/.test(g.hs[1])&&/On the board/.test(g.hs[2]),'groups as cards '+g.hs);
ok(g.order&&g.voices,'rows sit under their groups '+JSON.stringify(g));
ok(g.off&&g.animOff,'Animations Off → no animations');ok(g.camOff&&g.camOn,'Follow camera switch');
ok(g.sliders===2&&g.sw>150,'volume sliders full width '+g.sw);ok(g.fold&&g.rows===g.rows2&&!g.err,'locked themes folded, refresh keeps rows');
console.log(JSON.stringify({miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

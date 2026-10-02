/* v0.76 follow-up: deleting a custom creation always asks first (DEL76) — cancel keeps it, confirm deletes it, incl. the old two-click buttons */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();const r={};
  const k=blankClass();k.id='kdel1';k.name='Deletable Class';await Store.put('customClasses','kdel1',k);
  const c=blankChar?blankChar():{};c.id='cdel1';c.name='Deletable Hero';await Store.put('customChars','cdel1',c);await loadCustoms();if(!(CUSTOM.classes||[]).some(x=>x.id==='kdel1'))(CUSTOM.classes=CUSTOM.classes||[]).push(k);
  openStudio('classes');await W8(1200);let d=document.querySelector('[data-cr="del"][data-id="kdel1"]');r.clsBtn=!!d;
  if(d){d.click();await W8(300);r.ask=/Deletable Class/.test((document.querySelector('.ask76bg')||{}).textContent||'');document.querySelector('[data-ask76="0"]').click();await W8(300);r.kept=!!(await Store.getDoc('customClasses','kdel1'));
    d=document.querySelector('[data-cr="del"][data-id="kdel1"]');d.click();await W8(300);document.querySelector('[data-ask76="1"]').click();await W8(600);r.gone=!(await Store.getDoc('customClasses','kdel1'))}
  if(CUR_MODAL)CUR_MODAL.done(null);await W8(400);openStudio('chars');await W8(1200);d=document.querySelector('[data-st="del"][data-id="cdel1"]');r.chBtn=!!d;
  if(d){d.click();await W8(300);r.ask2=!!document.querySelector('.ask76bg');document.querySelector('[data-ask76="1"]').click();await W8(600);r.gone2=!(await Store.getDoc('customChars','cdel1'))}
  return r});
const miss=Object.entries(r).filter(([k,v])=>!v).map(([k])=>k);console.log(JSON.stringify(r));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

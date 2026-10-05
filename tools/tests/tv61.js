/* v0.61: the screen manager — openers register intents that settle to 0; menu ⇄ Annals ⇄ gladiators ⇄ Manager never show the main menu or a bare arena between windows; closing out returns to the menu */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.wrapped=await pg.evaluate(()=>SCREEN_OPENERS.filter(n=>{try{return typeof eval(n)==='function'}catch(e){return false}}).length);ok(o.wrapped>=9,'openers');
await pg.evaluate(async()=>{const g={id:'gscr1',name:'Screenus',cls:'hero',status:'active',roster:true,events:1,wins:1,carry:0,hp:{},portrait:{}};await Store.put('gladiators',g.id,g);await loadLudus();
  window._bad=[];window._iv=setInterval(()=>{const mm=!document.getElementById('mainMenu').hidden,md=!document.getElementById('modal').hidden,tr=document.querySelector('.transit'),c=tr&&tr.classList.contains('on');
    if(!mm&&!md&&!c&&!(S&&!S.over&&S.phase!=='setup'))window._bad.push('blank '+Date.now());window._state=(mm?'M':'')+(md?'W':'')},20)});
const click=async(sel,w=1200)=>{await pg.click(sel);await pg.waitForTimeout(w)};
/* step — click, then wait until the hand-off settles (no pending intent, a window up): fixed sleeps raced the hand-off under parallel load */
const step=async sel=>{await pg.click(sel);await pg.waitForTimeout(300);await pg.waitForFunction(()=>SCREEN.pending===0&&!document.getElementById('modal').hidden,null,{timeout:20000});await pg.waitForTimeout(250)};
await click('[data-mm="annals"]',1500);await step('#hallBody [data-tab="ludus"]');await pg.evaluate(()=>{window._menuMid=0;window._iv2=setInterval(()=>{if(!document.getElementById('mainMenu').hidden)window._menuMid++},20)});
await step('#mClose');await step('#hallBody [data-tab="hall"]');await step('#hallBody [data-tab="ludus"]');await step('#mClose');
o.menuMid=await pg.evaluate(()=>{clearInterval(window._iv2);return window._menuMid});ok(o.menuMid===0,'no menu between windows');
await click('#mClose',1500);o.backToMenu=await pg.evaluate(()=>!document.getElementById('mainMenu').hidden&&document.getElementById('modal').hidden);ok(o.backToMenu,'back to menu');
await click('[data-mm="annals"]',1500);o.again=await pg.evaluate(()=>/Annals/.test(document.getElementById('mTitle').textContent)&&!document.getElementById('modal').hidden);ok(o.again,'Annals again');await click('#mClose',1500);
await click('[data-mm="manager"]',2500);o.mgr=await pg.evaluate(()=>!document.getElementById('modal').hidden);ok(o.mgr,'manager opens');
o.pending=await pg.evaluate(()=>SCREEN.pending);ok(o.pending===0,'intents settle');
o.blank=await pg.evaluate(()=>{clearInterval(window._iv);return window._bad.length});ok(o.blank===0,'never a bare arena');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

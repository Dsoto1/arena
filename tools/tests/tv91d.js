/* v0.91 the Editor picker (203-v91editor): the Event Designer's "Editor in the box" = painted face tiles (default, Flavius, city
   patrons — locked ones greyed —, your own editors, + Make an editor); a click sets the event's editor exactly like the old select. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();openStudio('events')});await pg.waitForTimeout(1200);
const find=()=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<20&&!document.querySelector('select[data-f="sponsor"]');i++){const bs=[...document.querySelectorAll('[data-st="sub"],[data-edstep]')];const r=bs.find(x=>/rules|basics|finish/i.test(x.dataset.v||x.dataset.edstep||''));if(r)r.click();await W8(300)}
  const s=document.querySelector('select[data-f="sponsor"]');const box=s&&s.nextElementSibling;
  return {sel:!!s,hidden:!!s&&s.hidden,tiles:box?box.querySelectorAll('.edp91t').length:0,locked:box?box.querySelectorAll('.edp91t.lock').length:0,fl:!!(box&&box.querySelector('[data-edp91="flavius"]')),mk:!!(box&&box.querySelector('[data-edp91mk]')),on:box?(box.querySelector('.edp91t.on')||{}).dataset:null}});
const A=await find();ok(A.sel&&A.hidden&&A.tiles>=14&&A.fl&&A.mk,'1 the select becomes face tiles (default, Flavius, 11 patrons, + Make) '+JSON.stringify(A));ok(A.locked>=10,'1 locked patrons greyed '+A.locked);
if(process.env.SHOT){await pg.evaluate(()=>{const st=[...document.querySelectorAll('button')].find(b=>/^\s*6\s*Finish/.test(b.textContent));if(st)st.click()});await pg.waitForTimeout(500);await pg.evaluate(()=>{const e=document.querySelector('.edp91');if(e)e.scrollIntoView({block:'center'})});await pg.waitForTimeout(400);await pg.screenshot({path:process.env.SHOT+'/edp91.png'})}
await pg.evaluate(()=>document.querySelector('[data-edp91="flavius"]').click());await pg.waitForTimeout(500);
const B=await pg.evaluate(()=>({draft:ST.draft&&ST.draft.sponsor,on:(document.querySelector('.edp91t.on')||{dataset:{}}).dataset.edp91}));ok(B.draft==='flavius'&&B.on==='flavius','2 a click sets the event editor '+JSON.stringify(B));
console.log(JSON.stringify({A,B}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

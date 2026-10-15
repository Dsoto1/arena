const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1100}});
/* v1.03 S1: Gear designers are tabbed (335 frame) — open the tab holding a control before clicking it */
const _c103=pg.click.bind(pg);pg.click=async(s,o)=>{await pg.evaluate(q=>{try{const e=document.querySelector(q);const p=e&&e.closest('.df99pane');if(p&&p.hidden!==false||p&&getComputedStyle(p).display==='none'){const b=document.querySelector('[data-df99t="'+p.dataset.df99p+'"]');if(b)b.click()}}catch(_){}},s);return _c103(s,o)};
await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{openStudio('gear')});await pg.waitForTimeout(800);
await pg.click('[data-cwt="thr"]');await pg.waitForTimeout(300);
await pg.click('[data-cwf="s.both"]');await pg.waitForTimeout(300);
const r=await pg.evaluate(()=>({st:ST.cw.stats,tiles:[...document.querySelectorAll('.icot.on b')].map(x=>x.textContent),card:[...document.querySelectorAll('#cwPrev title')].map(t=>t.textContent)}));
await pg.evaluate(()=>document.querySelector('.icogrid').scrollIntoView());await pg.waitForTimeout(200);
await pg.screenshot({path:'ico.png'});
console.log(JSON.stringify(r),errs.slice(0,3));await b.close()})();

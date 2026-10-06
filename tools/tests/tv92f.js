/* v0.92 210-v92fix: the Attack tile names why there is no attack (Telemachus / no attacks left). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const R=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'egidious',loc:0,seats:['royalty','soldier','hero','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{}});
  for(let i=0;i<120;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase==='action'&&!cur().cpu)break}
  if(S.phase==='choice'){const c=document.querySelector('[data-act="coin"]');if(c)c.click();for(let i=0;i<40&&S.phase!=='action';i++)await W8(150)}
  const p=cur();const txt=()=>{render();const b=document.querySelector('[data-act="none"]');return b?b.querySelector('small').textContent:null};
  const o={phase:S.phase,cpu:p.cpu};S.active.telemachus=1;o.tel=txt();S.active.telemachus=0;p.attacks=9;o.done=txt();p.attacks=0;o.free=txt();return o});
ok(R.phase==='action'&&!R.cpu,'a human action phase '+JSON.stringify(R));ok(/Telemachus/.test(R.tel||''),'Telemachus named '+R.tel);ok(R.done==='no attacks left','attacks used '+R.done);
console.log(JSON.stringify(R));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

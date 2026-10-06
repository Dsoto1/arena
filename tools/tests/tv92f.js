/* v0.92 210-v92fix: the Attack tile names why there is no attack (Telemachus / no attacks left); sitting the week out walks the home square. */
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
const Q=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));try{if(S)S.over=true}catch(e){}openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});await W8(800);
  const w=W_();const home=travelHome(me());w.night.loc=(home+3)%LOCATIONS.length;w.night.selfBye=true;MGR.tab='night';MGR_REDRAW();await W8(700);
  const b=document.querySelector('#mgrBody [data-mg="city"]');const o={txt:b&&b.textContent,home:LOCATIONS[home].n};if(b){b.click();await W8(1500)}o.li=typeof CITY!=='undefined'?CITY.li:null;o.want=home;return o});
const Y=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();w.night.selfBye=false;const R=rosterOf(me());R[0].inj={until:w.week+2,label:'a cut'};R[1].restWk=w.week;
  MGR.tab='practice';MGR_REDRAW();await W8(700);const lk=[...document.querySelectorAll('#mgrBody .y92c.locked .y92lk')].map(b=>b.textContent.trim()); /* v0.92: the yard cards (213-v92yard) */
  const sel=[...document.querySelectorAll('#mgrBody .y92c:not(.locked)')].filter(c=>c.querySelector('[data-y92s]')).length;R[0].inj=null;R[1].restWk=null;return {lk,sel,n:R.length}});
ok(Y.lk.length===2&&/Infirmary/.test(Y.lk.join())&&/Resting/.test(Y.lk.join()),'yard: hurt + resting rows locked '+JSON.stringify(Y));ok(Y.sel===Y.n-2,'yard: the others keep their session buttons '+JSON.stringify(Y));
ok(Q.txt&&Q.txt.includes(Q.home),'sit-out: the button names the home square '+JSON.stringify(Q));ok(Q.li===Q.want,'sit-out: the home square opens '+JSON.stringify(Q));
ok(R.phase==='action'&&!R.cpu,'a human action phase '+JSON.stringify(R));ok(/Telemachus/.test(R.tel||''),'Telemachus named '+R.tel);ok(R.done==='no attacks left','attacks used '+R.done);
console.log(JSON.stringify(R));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

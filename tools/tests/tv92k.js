/* v0.92 212-v92pick: Focus and Distribute health show the avatar with clickable outlines (gray / green); a click picks. */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT;
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'egidious',loc:0,seats:['royalty','soldier','hero','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{}});
  for(let i=0;i<120;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&!cur().cpu&&i>6)break}SPEED='pause';
  window.__f=chooseLocation(S.players[0],S.players[1],'roll',3)});
await pg.waitForFunction(()=>{const d=document.querySelectorAll('#mBody .focdice2 [data-loc]:not([disabled])');return d.length>=3&&document.querySelector('#mBody .av92 [data-av92]')},null,{timeout:15000});
const F=await pg.evaluate(()=>({n:document.querySelectorAll('#mBody .av92 [data-av92]').length,col:document.querySelector('#mBody .av92 [data-av92] path[stroke-dasharray]').getAttribute('stroke'),dice:[...document.querySelectorAll('#mBody .focdice2 [data-loc]')].map(d=>d.dataset.loc)}));
if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv92k_focus.png')});
const want=await pg.evaluate(()=>document.querySelector('#mBody .av92 [data-av92]').dataset.av92);
await pg.click(`#mBody .av92 [data-av92="${want}"] path`,{force:true});const got=await pg.evaluate(async()=>await window.__f);
ok(F.n>=1&&F.n<=3&&F.dice.includes(want),'focus: outlines = the rolled locations '+JSON.stringify(F));ok(/d0605a|f0cf7d/i.test(F.col),'focus: light maroon (or gold best) '+F.col);ok(got===want,'focus: a click on the body picks '+got+' want '+want);
/* Focus! card */
await pg.evaluate(()=>{window.__c=chooseLocation(S.players[0],S.players[2],'card',2)});
await pg.waitForFunction(()=>document.querySelectorAll('#mBody .av92 [data-av92]').length>=6,null,{timeout:8000});
await pg.click('#mBody .av92 [data-av92="lleg"] path',{force:true});const gotC=await pg.evaluate(async()=>await window.__c);ok(gotC==='lleg','card: any living location by click '+gotC);
/* health */
await pg.evaluate(()=>{const p=S.players[0];p.hp.head=2;p.hp.rarm=1;window.__h=distModal(p,2,'test','hp')});
await pg.waitForFunction(()=>document.querySelectorAll('#mBody .av92[data-kind="hp"] [data-av92]').length>=2,null,{timeout:8000});
const H0=await pg.evaluate(()=>({col:document.querySelector('#mBody .av92 [data-av92] path[stroke-dasharray]').getAttribute('stroke')}));
await pg.hover('#mBody .av92 [data-av92="head"] path[stroke-dasharray]',{force:true});await pg.waitForTimeout(250);
const hov=await pg.evaluate(()=>[...document.querySelectorAll('#mBody .av92 [data-av92] path[stroke-dasharray]')].map(p=>getComputedStyle(p).opacity==='1'?p.parentNode.dataset.av92:null).filter(Boolean));
await pg.click('#mBody .av92 [data-av92="head"] path',{force:true});await pg.waitForTimeout(300);
const lab=await pg.evaluate(()=>{const g=document.querySelector('#mBody .av92 [data-av92="head"] text');return g&&g.textContent});
await pg.hover('#mBody .av92 [data-av92="rarm"] path[stroke-dasharray]',{force:true});await pg.waitForTimeout(250);if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv92k_hp.png')});
await pg.click('#mBody .av92 [data-av92="head"] path',{force:true});await pg.waitForTimeout(300);
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(x=>/Confirm/.test(x.textContent));b.click()});const plan=await pg.evaluate(async()=>await window.__h);
ok(/4fd06a/i.test(H0.col),'hp: green '+H0.col);ok(hov.length===1&&hov[0]==='head','hp: only the hovered part lights '+JSON.stringify(hov));ok(lab==='+1','hp: +1 shows on the head '+lab);ok(plan&&plan.head===2,'hp: two clicks = 2 HP to the head '+JSON.stringify(plan));
/* armor */
await pg.evaluate(()=>{const p=S.players[0];window.__a=distModal(p,1,'test','ap')});
await pg.waitForFunction(()=>document.querySelectorAll('#mBody .av92[data-kind="hp"] [data-av92]').length>=2,null,{timeout:8000});
const A0=await pg.evaluate(()=>document.querySelector('#mBody .av92 [data-av92] path[stroke-dasharray]').getAttribute('stroke'));
await pg.hover('#mBody .av92 [data-av92="chest"] path[stroke-dasharray]',{force:true});await pg.waitForTimeout(250);if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv92k_ap.png')});
await pg.click('#mBody .av92 [data-av92="chest"] path',{force:true});await pg.waitForTimeout(300);
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(x=>/Confirm/.test(x.textContent));b.click()});const planA=await pg.evaluate(async()=>await window.__a);
ok(/7c848c/i.test(A0),'ap: darker gray '+A0);ok(planA&&planA.chest===1,'ap: a click = 1 AP to the chest '+JSON.stringify(planA));
console.log(JSON.stringify({F,want,got,gotC,lab,plan}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

/* v0.92 214-v92tabs: (1) the match Autosave slot belongs to one tab — the second tab's autosave takes it, the first stops autosaving
   and says so, a new event there takes it back; (2) Online: a session.replaced push covers the tab, its requests are refused, Leave closes. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1300,height:850}});await ctx.route(/fonts\./,r=>r.abort());
const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const open=async()=>{const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}});return pg};
const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));startEvent({ev:'egidious',loc:0,seats:['royalty','soldier','hero','venatore'].map(c=>({cls:c,cpu:true})),opts:{}});
  for(let i=0;i<60;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>4)break}SPEED='pause'});
const A=await open(),B=await open();await start(A);await start(B);
const put=(pg,tag)=>pg.evaluate(t=>matchSlotPut('auto',{tag:t}),tag);
const r1=await put(A,'A1');await A.waitForTimeout(300);const r2=await put(B,'B1');await A.waitForTimeout(400);
const r3=await put(A,'A2');const slot=await A.evaluate(()=>JSON.parse(localStorage.getItem(MSAVE_KEY('auto'))||'{}').tag);
const note=await A.evaluate(()=>{const n=document.getElementById('auto92');return n&&!n.hidden?n.textContent:null});
ok(r1===true&&r2===true,'both tabs may write first '+[r1,r2]);ok(r3===false,'the first tab stops after the second took the autosave '+r3);ok(slot==='B1','the slot keeps the second tab’s autosave '+slot);ok(/Autosave moved/.test(note||''),'the first tab says so '+note);
await start(A);const r4=await put(A,'A3');await A.waitForTimeout(400);const r5=await put(B,'B2');
ok(r4===true,'a new event in the first tab takes it back '+r4);ok(r5===false,'…and the second tab stops '+r5);
/* online cover */
const O=await A.evaluate(async()=>{NET.mode='aws';NET.emit('session.replaced',{});await new Promise(r=>setTimeout(r,200));const c=document.getElementById('tab92');const o={shown:!!c&&!c.hidden,txt:c&&c.textContent};
  try{await NET.req('hello',{});o.req='sent'}catch(e){o.req=e.message}document.querySelector('[data-tab92="leave"]').click();await new Promise(r=>setTimeout(r,300));o.after=!!c&&c.hidden;NET.mode='mock';return o});
ok(O.shown&&/another tab/.test(O.txt)&&/Use here/.test(O.txt),'online: the cover with Use here '+JSON.stringify(O));ok(/another tab/.test(O.req),'online: requests refused while covered '+O.req);ok(O.after,'online: Leave closes the cover');
console.log(JSON.stringify({r1,r2,r3,slot,note,r4,r5,O}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

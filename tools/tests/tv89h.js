/* v0.89 hot seat (170-v89hs): "Since your last turn" opens only when something happened (skipped when nothing did; shown — with
   who fell — when something did); 🚪 Abandon and 💾 Save & leave ask every human at the table, one "no" cancels; outside hot seat the
   abandon window asks nobody else. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});const W=ms=>pg.waitForTimeout(ms);
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.click('#mainMenu [data-mm="multi"]');await W(300);await pg.click('#mainMenu [data-mm="hotseat"]');await W(2500);
let ins=await pg.$$('[data-hsn]');await ins[0].fill('Ann');await ins[1].fill('Bo');
for(const i of [2,3])await pg.evaluate(i=>{const s=document.getElementById('cpu'+i);if(s){s.value='1';s.dispatchEvent(new Event('change',{bubbles:true}))}},i);await W(400);
await pg.evaluate(()=>{SPEED='fast'});await pg.click('#goBtn');
/* play on to a human's own action phase */
for(let k=0;k<60;k++){await W(600);const t=await pg.evaluate(()=>{if(S&&S.hotseat&&!CUR_MODAL&&cur()&&!cur().cpu&&S.phase==='action')return 'ok';
  if(CUR_MODAL){const bt=document.querySelector('#mBtns button:not([disabled])');if(bt)bt.click()}else if(S&&S.hotseat&&cur()&&!cur().cpu&&S.phase==='choice'){const bt=[...document.querySelectorAll('#actions button')].find(x=>/^Take/.test(x.textContent.trim()));if(bt)bt.click()}return ''});if(t==='ok')break}
const live=await pg.evaluate(()=>({hot:!!(S&&S.hotseat),humans:hsLiveHumans().length,phase:S.phase}));ok(live.hot&&live.humans===2,'a 2-player table is live '+JSON.stringify(live));
/* 1 · the recap: nothing happened → no window */
const quiet=await pg.evaluate(async()=>{const p=cur();S.hsSnaps=S.hsSnaps||{};const a=hsSnap(p);S.hsSnaps[p.id]=a;S.hs89=S.hs89||{};S.hs89[p.id]=hs89Seen();
  const pr=modal(`🪑 ${hsProf(p.pid).name} — your turn`,`<p class="rc-sub">x</p>${hsAwayHTML(p,a)}`,[{label:'Start my turn',value:1,primary:1}],{close:1});
  await new Promise(r=>setTimeout(r,300));const open=!!CUR_MODAL;if(CUR_MODAL)CUR_MODAL.done(1);return {open,v:await pr}});
ok(!quiet.open&&quiet.v===1,'nothing happened: the recap is skipped '+JSON.stringify(quiet));
/* something happened: a wound → the window, and a fallen beast/gladiator is named */
const loud=await pg.evaluate(async()=>{const p=cur();const a=S.hsSnaps[p.id];const hp=p.hp.chest;p.hp.chest=Math.max(1,hp-1);
  const q=S.players.find(x=>x!==p&&x.alive);if(q){S.hs89[p.id]=hs89Seen();q.alive=false}
  const pr=modal(`🪑 ${hsProf(p.pid).name} — your turn`,`<p class="rc-sub">x</p>${hsAwayHTML(p,a)}`,[{label:'Start my turn',value:1,primary:1}],{close:1});
  await new Promise(r=>setTimeout(r,300));const open=!!CUR_MODAL;const body=document.getElementById('mBody').textContent;if(CUR_MODAL)CUR_MODAL.done(1);await pr;
  p.hp.chest=hp;if(q)q.alive=true;return {open,fell:q?body.includes(q.name)&&/Fallen since/.test(body):true,hp:/HP/.test(body)}});
ok(loud.open&&loud.hp,'a wound: the recap opens '+JSON.stringify(loud));ok(loud.fell,'the recap names who fell');
/* only a fall (no change to me) still opens it */
const fall=await pg.evaluate(async()=>{const p=cur();const a=hsSnap(p);a.log=(S.logLines||[]).length;S.hsSnaps[p.id]=a;S.hs89[p.id]=hs89Seen();const n=S.npcs.find(x=>x.alive);if(!n)return {skip:1};n.alive=false;
  const pr=modal(`🪑 ${hsProf(p.pid).name} — your turn`,`<p class="rc-sub">x</p>${hsAwayHTML(p,a)}`,[{label:'Start my turn',value:1,primary:1}],{close:1});
  await new Promise(r=>setTimeout(r,300));const open=!!CUR_MODAL;if(CUR_MODAL)CUR_MODAL.done(1);await pr;n.alive=true;return {open}});
ok(fall.skip||fall.open,'a beast fell: the recap opens');
/* 2 · Abandon asks the table: Ann agrees, Bo says no → keep */
const askRun=async(pick,answers)=>{await pg.evaluate(()=>{window.__ab=abandonAsk('menu')});await W(400);
  const first=await pg.evaluate(pick=>{const t=document.getElementById('mTitle').textContent;const bt=[...document.querySelectorAll('#mBtns button')].find(x=>x.textContent.includes(pick));if(bt)bt.click();return {t,has:!!bt}},pick);
  const asks=[];for(const a of answers){await W(400);const r=await pg.evaluate(a=>{if(!CUR_MODAL)return null;const t=document.getElementById('mTitle').textContent;const bt=[...document.querySelectorAll('#mBtns button')].find(x=>x.textContent.includes(a));if(bt)bt.click();return t},a);if(r)asks.push(r)}
  await W(500);const more=await pg.evaluate(()=>CUR_MODAL?document.getElementById('mTitle').textContent:'');
  const v=await pg.evaluate(async()=>{const r=await Promise.race([window.__ab,new Promise(r=>setTimeout(()=>r('PENDING'),1500))]);return r});return {first,asks,more,v}};
const ab1=await askRun('Abandon the event',['Agree','Keep playing']);
ok(ab1.first.has&&ab1.asks.length===2&&ab1.asks.every(t=>/Abandon the event\?/.test(t))&&/Ann/.test(ab1.asks[0])&&/Bo/.test(ab1.asks[1]),'abandon asks each human '+JSON.stringify(ab1));
ok(ab1.v==='keep','one no keeps the match');
const still=await pg.evaluate(()=>!!(S&&!S.over&&S.hotseat));ok(still,'the match goes on');
/* Save & leave asks the table too; a "no" cancels before the save window */
const canSave=await pg.evaluate(()=>typeof matchSaveOK==='function'&&matchSaveOK());
if(canSave){const sv=await askRun('Save & leave',['Keep playing']);
  ok(sv.asks.length===1&&/Save & leave\?/.test(sv.asks[0])&&sv.v==='keep'&&!sv.more,'save & leave: the first no cancels, no save window '+JSON.stringify(sv))}
else ok(false,'save & leave offered on my move');
/* both agree → abandon goes through */
const ab2=await askRun('Abandon the event',['Agree','Agree']);ok(ab2.asks.length===2&&ab2.v==='abandon','everyone agrees → abandon '+JSON.stringify(ab2));
/* outside hot seat: nobody else is asked */
const solo=await pg.evaluate(async()=>{const hs=S.hotseat;S.hotseat=null;const pr=abandonAsk('new');await new Promise(r=>setTimeout(r,300));
  const bt=[...document.querySelectorAll('#mBtns button')].find(x=>/Abandon the event/.test(x.textContent));if(bt)bt.click();await new Promise(r=>setTimeout(r,400));const extra=!!CUR_MODAL;if(CUR_MODAL)CUR_MODAL.done(0);
  const v=await pr;S.hotseat=hs;return {v,extra}});
ok(solo.v==='abandon'&&!solo.extra,'outside hot seat: no table ask '+JSON.stringify(solo));
console.log(JSON.stringify({miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

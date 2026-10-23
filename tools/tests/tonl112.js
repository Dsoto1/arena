/* v1.12 RANKED CHECK, the page side (429-v112check; server routes.js "v1.12 RANKED CHECK"). The server holds a Ranked match until its replay is
   checked and answers match.result {pending:true, check112:1}:
   1 · the saved-report path (124 onlRepSend81 'end') → after ~2.5 s the toast is "⏳ The scribes check the result…" — THROUGH _T (a test
       dictionary entry for that key is what shows) — and the old "⏳ Waiting for the other lanistas to confirm the result…" never reaches the
       toast while that match waits; the match.settled push ends it (the old text can show again).
   2 · a plain {pending:true} (another lanista still to report; an older server) → no scribes toast.
   3 · kill switch flavius_check112off=1 → the old toast only.
   The mock server's match.result is stubbed (mockReq). node tools/tests/tonl112.js <ABSOLUTE page path> → ERRS [] and exit 0. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[],miss=[];const ok=(c,n)=>{if(!c)miss.push(n);console.log((c?'ok   ':'FAIL ')+n.slice(0,500))};
const open=async ls=>{const c=await b.newContext({viewport:{width:1300,height:900}});await c.route(/fonts\./,r=>r.abort());const pg=await c.newPage();pg.on('pageerror',e=>errs.push(e.message));
  await c.addInitScript(ls=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in ls)localStorage.setItem(k,ls[k])},ls||{});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});
  /* every text the toast shows (a MutationObserver: a quick second toast never hides the first from the test) + the stubbed server */
  await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(null);window.TOASTS=[];const seen=()=>{const t=document.getElementById('mToast');if(t){const s=t.textContent;if(TOASTS[TOASTS.length-1]!==s)TOASTS.push(s)}};
    new MutationObserver(seen).observe(document.body,{childList:true,subtree:true,characterData:true});
    LANG_DICT={'⏳ The scribes check the result…':'⏳ [t112] the scribes check'};
    window.REPLY112={};const mr=mockReq;mockReq=async function(t,d){if(t==='match.result'&&d&&REPLY112[d.id])return JSON.parse(JSON.stringify(REPLY112[d.id]));return mr.apply(this,arguments)};
    ONL.acct={id:'u112',name:'Tester'}});return pg};
const until=async(pg,fn,arg,ms=8000)=>{const t0=Date.now();let v;while(Date.now()-t0<ms){v=await pg.evaluate(fn,arg).catch(()=>null);if(v)return v;await pg.waitForTimeout(150)}return v};
const WAIT='Waiting for the other lanistas',SCRIBE='[t112] the scribes check';
try{
  {const pg=await open();
    /* 1 · the saved report, the server checking */
    const r1=await pg.evaluate(async()=>{REPLY112.L112a={pending:true,check112:1};onlRepPut81({id:'L112a',acct:'u112',at:Date.now(),payload:{id:'L112a',table:[{seat:0,won:true}],hash:'h1'}});
      await onlRepSend81('end');return {wait:ONL.waitSettle,cur:CHECK112.cur}});
    ok(r1.wait==='L112a'&&r1.cur==='L112a','the report is pending on the check '+JSON.stringify(r1));
    const s1=await until(pg,s=>TOASTS.some(t=>t.includes(s)),SCRIBE);ok(!!s1,'"⏳ The scribes check the result…" shown through _T (the test dictionary text)');
    await pg.waitForTimeout(800);const t1=await pg.evaluate(()=>TOASTS.slice());ok(!t1.some(t=>t.includes('Waiting for the other lanistas')),'the old waiting toast is not shown '+JSON.stringify(t1));
    ok(t1.filter(t=>t.includes(SCRIBE)).length===1,'once');
    const again=await pg.evaluate(()=>{mToast(_T('⏳ Waiting for the other lanistas to confirm the result…'));return document.getElementById('mToast').textContent});
    ok(!again.includes(WAIT),'a late old toast for the same match is held back');
    /* the push settles it: the old text may show again */
    const after=await pg.evaluate(()=>{NET.emit('match.settled',{id:'L112a',out:null});mToast(_T('⏳ Waiting for the other lanistas to confirm the result…'));return {cur:CHECK112.cur,t:document.getElementById('mToast').textContent}});
    ok(after.cur===null&&after.t.includes(WAIT),'match.settled ends the check '+JSON.stringify(after));
    /* 2 · a plain pending: someone still to report → no scribes */
    const n0=await pg.evaluate(async()=>{TOASTS.length=0;REPLY112.L112b={pending:true};onlRepPut81({id:'L112b',acct:'u112',at:Date.now(),payload:{id:'L112b',table:[{seat:0}],hash:'h2'}});await onlRepSend81('end');return CHECK112.cur});
    await pg.waitForTimeout(3200);const t2=await pg.evaluate(()=>TOASTS.slice());
    ok(n0===null&&!t2.some(t=>t.includes(SCRIBE))&&t2.some(t=>t.includes(WAIT)),'a plain pending: the old waiting toast, no scribes '+JSON.stringify(t2))}
  /* 3 · kill switch */
  {const pg=await open({flavius_check112off:'1'});
    await pg.evaluate(async()=>{REPLY112.L112c={pending:true,check112:1};onlRepPut81({id:'L112c',acct:'u112',at:Date.now(),payload:{id:'L112c',table:[{seat:0}],hash:'h3'}});await onlRepSend81('end')});
    await pg.waitForTimeout(3200);const t3=await pg.evaluate(()=>TOASTS.slice());
    ok(!t3.some(t=>t.includes(SCRIBE))&&t3.some(t=>t.includes(WAIT)),'kill switch: the old toast only '+JSON.stringify(t3))}
}catch(e){errs.push(String(e&&e.stack||e).slice(0,400))}
console.log('ERRS',JSON.stringify(errs.slice(0,3)));await b.close();process.exit(miss.length||errs.length?1:0)})();

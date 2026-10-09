/* tv99k — the Lanista's desk (270-v99desk): Your ludus shows ONE card; This-week rows come from the weekly checklist AND the letters that need an
   answer (sendLetter act:{} included), sorted by tier; the trade offer opens INSIDE its row (Decide ▾) and Accept works there; ✕ dismisses for the
   week and ↶ brings it back; required rows (⚖) have no ✕; the rail carries one count = the open rows; End the week lists the rows with due chips;
   phones (390) show 6 rows and fold the rest; letters without an answer sit under Letters; kill switch flavius_desk99off=1 → the old layout. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_desk99off','1')},off?1:0);
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
    const w=W_(),pm=me(),ros=rosterOf(pm);ros[0].inj={until:w.week+2,label:'a gashed thigh',pen:3};pm.perkPts=2;w.train='off';w.pend=[{t:'thumb',gid:ros[2].id,bi:0,f:18}];
    const riv=w.mgrs.find(x=>!x.isPlayer&&rosterOf(x).length);const th=rosterOf(riv)[0];w.offers=[{id:'o99k',kind:'swap',mid:riv.id,gid:ros[1].id,give:[th.id],coin:25,until:w.week+1}];
    sendLetter(w,{key:'t99btn',kind:'letter',from:'the tester',seal:'🧪',title:'Answer me',body:'<p>One button.</p><div class="acts"><button class="btn tksm" type="button" data-mg="tab" data-id="recruit">Go recruit</button></div>',until:w.week});
    sendLetter(w,{key:'t99act',kind:'letter',from:'the tester',seal:'🧭',title:'Chosen by act',body:'<p>No button, but the sender says it needs an answer.</p>',until:w.week,act:{ic:'🧭',line:'<b>Act row</b> chosen by the sender',tier:2}});
    sendLetter(w,{key:'t99news',kind:'letter',from:'the tester',seal:'📰',title:'Just news',body:'<p>Nothing to do.</p>',until:w.week});
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}menuHide();openManager('ludus');await W8(1000);MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(500)});return pg};
/* ---------- desktop ---------- */
const pg=await open(1440,900);
const A=await pg.evaluate(()=>{const rows=[...document.querySelectorAll('#desk99 .dk99tw>.dk99row')];const tiers=rows.map(r=>+r.dataset.tier);
  const lud=document.querySelector('.mtabs [data-mg="tab"][data-id="ludus"]');const vis=[...lud.querySelectorAll('.mcount')].filter(x=>getComputedStyle(x).display!=='none'&&!x.hidden);
  const row=k=>rows.find(r=>r.dataset.dk99===k);const ic=i=>rows.find(r=>r.querySelector('.ic').textContent===i);
  return {one:document.querySelectorAll('#desk99').length===1&&!document.querySelector('#mgrBody #mailBox,#mgrBody .wkcheck,#mgrBody .lrow91'),n:rows.length,todo:ludusTodo73(),
    sorted:tiers.every((t,i)=>!i||t>=tiers[i-1]),tiers,verdict:!!ic('⚖')&&!ic('⚖').querySelector('[data-dk99x]')&&tiers[0]===1,
    hurt:!!ic('⚕'),perk:!!ic('🎓'),offer:!!rows.find(r=>r.querySelector('.dk99dec')&&/wants/.test(r.textContent)),
    btn:!!row('L:t99btn')&&!!row('L:t99btn').querySelector('.dk99b [data-mg="tab"][data-id="recruit"]')&&!!row('L:t99btn').querySelector('.dk99l'),
    act:!!row('L:t99act')&&+row('L:t99act').dataset.tier===2&&/Act row/.test(row('L:t99act').textContent),
    news:!!document.querySelector('#desk99 .dk99lt details.mail[data-mail="L:t99news"]')&&!row('L:t99news'),
    rail:vis.length===1&&+vis[0].textContent===rows.length&&!/✉/.test(lud.textContent),banner:(document.querySelector('.roomhd.b73-ludus')||document.body).textContent.includes(String(rows.length)),
    acta:!!document.querySelector('#desk99 .dk99hd')}});
ok(A.one,'one desk, old mail/checklist gone');ok(A.n>=7&&A.n===A.todo,'rows = ludusTodo73 '+A.n+'/'+A.todo);ok(A.sorted,'urgency order '+A.tiers);ok(A.verdict,'verdict first, no ✕');
ok(A.hurt&&A.perk,'checklist rows');ok(A.offer,'trade offer row with Decide');ok(A.btn,'letter with one button: re-homed + 📜');ok(A.act,'act:{} letter row');ok(A.news,'plain letter under Letters');ok(A.rail,'one rail count');
/* Decide ▾ opens inside the row; Accept there takes the trade */
const D=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const o=w.offers[0];const row=[...document.querySelectorAll('#desk99 .dk99row')].find(r=>r.querySelector('.dk99dec')&&/wants/.test(r.textContent));
  const ex=row.querySelector('.dk99ex');const h0=ex.hidden;const key=row.dataset.dk99;row.querySelector('.dk99dec').click();await W8(150);const row2=document.querySelector(`#desk99 .dk99row[data-dk99="${CSS.escape(key)}"]`);const ex2=row2.querySelector('.dk99ex');const shown=!ex2.hidden&&ex2.offsetHeight>40&&row2.classList.contains('open');const inRow=row2.contains(ex2);
  const g=gById(o.gid),t=gById(o.give[0]);const yes=ex2.querySelector('[data-m47="offyes"]');if(yes)yes.click();await W8(400);
  return {h0,shown,inRow,acc:!!yes&&g.contract.mgr!==me().id&&t.contract.mgr===me().id,gone:![...document.querySelectorAll('#desk99 .dk99row')].some(r=>/wants/.test(r.textContent))}});
ok(D.h0&&D.shown&&D.inRow,'Decide opens inside the row');ok(D.acc&&D.gone,'Accept in the row works '+JSON.stringify(D));
/* ✕ not this week, ↶ back */
const X=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const n0=ludusTodo73();const r=[...document.querySelectorAll('#desk99 .dk99tw>.dk99row')].find(x=>x.querySelector('.ic').textContent==='🎓');const k=r.dataset.dk99;
  r.querySelector('[data-dk99x]').click();await W8(300);const n1=ludusTodo73();const gone=![...document.querySelectorAll('#desk99 .dk99tw>.dk99row')].some(x=>x.dataset.dk99===k);const back=document.querySelector(`#desk99 .dk99done [data-dk99back="${CSS.escape(k)}"]`);
  const skipped=W_().ckSkip.keys.includes(k);const sum=(document.querySelector('#desk99 .dk99done summary')||{}).textContent||'';
  const lud=+((document.querySelector('.mtabs [data-id="ludus"] .mcount.dk99n')||{}).textContent||0);if(back)back.click();await W8(300);
  return {n0,n1,gone,back:!!back,skipped,sum,rail:lud===n1,again:[...document.querySelectorAll('#desk99 .dk99tw>.dk99row')].some(x=>x.dataset.dk99===k),n2:ludusTodo73()}});
ok(X.n1===X.n0-1&&X.gone&&X.skipped&&X.rail,'✕ dismisses for the week '+JSON.stringify(X));ok(X.back&&/not this week/.test(X.sum),'dismissed row in the fold with ↶');ok(X.again&&X.n2===X.n0,'↶ puts it back');
/* a mail row can be dismissed too */
const M=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const n0=ludusTodo73();const r=document.querySelector('#desk99 .dk99row[data-dk99="L:t99btn"]');r.querySelector('[data-dk99x]').click();await W8(300);
  return {ok:ludusTodo73()===n0-1&&!document.querySelector('#desk99 .dk99tw>.dk99row[data-dk99="L:t99btn"]')&&!!document.querySelector('#desk99 [data-dk99back="L:t99btn"]')}});
ok(M.ok,'a letter row dismisses too');
/* End the week: the skip list = the open rows (verdicts excluded), with due chips */
const E=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const riv=w.mgrs.find(x=>!x.isPlayer&&rosterOf(x).length>1);const ros=rosterOf(me());
  w.offers=[{id:'o99k2',kind:'coin',mid:riv.id,gid:ros[3].id,coin:40,until:w.week+1}];MGR.confirmEnd=true;MGR_REDRAW();await W8(300);const sl=document.querySelector('.skiplist.sk99l');
  const open=[...document.querySelectorAll('#desk99 .dk99tw>.dk99row')].filter(r=>r.querySelector('.ic').textContent!=='⚖').length;const n=sl?sl.querySelectorAll('.sk99').length:0;
  const r={sl:!!sl,n,open,chip:sl?/until wk/.test(sl.textContent):false,offer:sl?/offers/.test(sl.textContent):false,noVerdict:sl?!/verdict/.test(sl.textContent):false,news:sl?!/Just news/.test(sl.textContent):false};MGR.confirmEnd=false;MGR_REDRAW();return r});
ok(E.sl&&(E.n===E.open||E.n===7)&&E.chip&&E.offer&&E.noVerdict&&E.news,'end-week skip list from the desk '+JSON.stringify(E));
/* 📜 opens the letter in the row and marks it read */
const L=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r=document.querySelector('#desk99 .dk99row[data-dk99="L:t99act"]');const b=r&&r.querySelector('[data-dk99open]');if(b)b.click();await W8(150);
  return {open:!!r&&!r.querySelector('.dk99ex').hidden&&/sender says/.test(r.querySelector('.dk99ex').textContent),read:(W_().mailRead||[]).includes('L:t99act')}});
ok(L.open&&L.read,'the letter opens in its row and is read');
await pg.close();
/* ---------- phone ---------- */
const pp=await open(390,844);
const P=await pp.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const rows=[...document.querySelectorAll('#desk99 .dk99tw>.dk99row')];const sh=e=>e.getClientRects().length>0;const vis=rows.filter(sh).length;
  const mt=document.querySelector('#desk99 .dk99mt');const mtv=!!mt&&sh(mt);if(mt)mt.click();await W8(150);const all=rows.filter(sh).length;
  const d=document.getElementById('desk99').getBoundingClientRect();const over=rows.some(r=>r.scrollWidth>r.clientWidth+2);return {n:rows.length,vis,mtv,all,fit:d.right<=391,over,doc:document.documentElement.scrollWidth<=390}});
ok(P.n>6&&P.vis===6&&P.mtv&&P.all===P.n,'390: 6 rows, the rest fold '+JSON.stringify(P));ok(P.fit&&!P.over&&P.doc,'390: rows fit');
await pp.close();
/* ---------- kill switch ---------- */
const po=await open(1440,900,true);
const K=await po.evaluate(()=>({desk:!!document.querySelector('#desk99'),mail:!!document.querySelector('#mgrBody #mailBox'),ck:!!document.querySelector('#mgrBody .wkcheck'),env:/✉/.test((document.querySelector('.mtabs [data-id="ludus"]')||{}).textContent||'')}));
ok(!K.desk&&K.mail&&K.ck,'kill switch → old layout '+JSON.stringify(K));
await po.close();
console.log(JSON.stringify({A,D,X,E,P,K}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

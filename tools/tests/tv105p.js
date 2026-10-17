/* v1.05 B55 (379-v105loan): accepting a loan ask from its LETTER lends the fighter exactly like the roster path (moved, "Lent out", the up-front
   coin paid, back after the weeks); a refused loan (injured fighter) shows the reason on the letter and the letter stays. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\.g/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
  const w=W_(),pm=me();w.welc99=1;pm.coin=3000;w.train='off';w.tplan=null;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
  for(let i=0;i<5;i++){const g=genGlad({ovr:40+i*3});if(!gById(g.id))w.glads.push(g);g.alive=true;g.contract={mgr:pm.id,wage:askWage(g),weeks:12,since:w.week}}
  for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.restWk=null;g.severed=[]}
  for(const m of w.mgrs)if(!m.isPlayer){m.relB=60;m.coin=Math.max(m.coin||0,900);m.rivalry=0;m.rivals={}}
  w.offers=[];MGR.tab='ludus';MGR_REDRAW();await W8(400)});
const ask=(inj)=>pg.evaluate(async(inj)=>{const w=W_(),pm=me();const m=loan102Houses(w)[0];const g=rosterOf(pm).filter(x=>!x.loanFrom&&!x.slot95).sort((a,b)=>effOvr(a)-effOvr(b))[0];
  g.inj=inj?{wk:3,name:'Cut'}:null;const wk=c104WeekFee(w,g,m);const o={id:'o_t'+Date.now(),kind:'loan',mid:m.id,gid:g.id,fee:wk,weeks:2,until:w.week+1,c104:1};w.offers=[o];
  window.T={gid:g.id,mid:m.id,oid:o.id,coin:pm.coin,lump:c104Lump(wk,2),mcoin:m.coin};MGR.tab='ludus';MGR_REDRAW();await new Promise(r=>setTimeout(r,500));
  return {has:!!document.querySelector('[data-m47="offyes"][data-id="'+o.id+'"]')}},inj);
let A=await ask(false);ok(A.has,'the loan ask letter is drawn with Accept');
await pg.evaluate(()=>document.querySelector('[data-m47="offyes"]').click());await pg.waitForTimeout(500);
const R=await pg.evaluate(()=>{const w=W_(),pm=me(),g=gById(T.gid);return {lent:!!g.loanFrom&&g.loanFrom.mid===pm.id,mgr:g.contract.mgr===T.mid,gone:!(w.offers||[]).some(o=>o.id===T.oid),paid:pm.coin-T.coin===T.lump,mpaid:T.mcoin-mgrById(T.mid).coin===T.lump,
  team:team104(g,pm),pc:pm.coin-T.coin,lump:T.lump}});
ok(R.lent,'the fighter is lent (loanFrom)');ok(R.mgr,'his contract moved to the borrowing house');ok(R.gone,'the answered letter is gone');ok(R.paid&&R.mpaid,'the up-front coin is paid as agreed '+JSON.stringify(R));ok(R.team==='L','the roster treats him as lent out');
await pg.evaluate(()=>{MGR.tab='roster';MGR_REDRAW()});await pg.waitForTimeout(600);
ok(await pg.evaluate(()=>/Lent out/i.test(document.querySelector('#mgrBody').textContent)),'the roster page shows Lent out');
const B=await pg.evaluate(()=>{const w=W_(),pm=me(),g=gById(T.gid);for(let i=0;i<3&&g.loanFrom;i++)loansWeek(w,pm);return {home:!g.loanFrom&&g.contract.mgr===pm.id}});
ok(B.home,'he is back home after the weeks');
A=await ask(true);ok(A.has,'ask letter for an injured fighter drawn');
await pg.evaluate(()=>document.querySelector('[data-m47="offyes"]').click());await pg.waitForTimeout(500);
const C=await pg.evaluate(()=>{const w=W_(),g=gById(T.gid);return {lent:!!g.loanFrom,stays:(w.offers||[]).some(o=>o.id===T.oid),why:(document.querySelector('.l105why')||{}).textContent||'',onroster:g.contract.mgr===me().id}});
ok(!C.lent&&C.onroster,'the injured fighter is not lent');ok(C.stays,'the letter stays open');ok(/hurt|injur/i.test(C.why),'the letter says why: '+C.why);
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

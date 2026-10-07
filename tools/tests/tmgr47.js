const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1500,height:950}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1200);
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});
const o={};
await pg.evaluate(()=>{openManager()});await pg.waitForTimeout(800);
await pg.click('[data-mg="create"]');await pg.waitForTimeout(300);await pg.click('[data-mg="nmgo"]');await pg.waitForTimeout(900);
o.glow=await pg.evaluate(()=>{const b=document.querySelector('.mtabs [data-id="night"]');return b&&b.classList.contains('nightpend')});
await pg.waitForTimeout(800);o.glow=await pg.evaluate(()=>{const b=document.querySelector('.mtabs [data-id="night"]');return !!b&&b.classList.contains('nightpend')});
o.fame=await pg.evaluate(()=>!!document.querySelector('.fameb .fametip'));
// debt badge
o.debt=await pg.evaluate(()=>{const w=W_();w.loan={amt:120,name:'Test lender',kind:'m'};MGR_REDRAW();const t=document.querySelector('.mhead').textContent;w.loan=null;return /Debt −120/.test(t)&&/Net/.test(t)});
// lanista tab
await pg.click('[data-mg="tab"][data-id="me"]');await pg.waitForTimeout(500);
o.lan=await pg.evaluate(()=>({open:!!document.querySelector('details.card2[open]'),rec:!!document.querySelector('.lanrec')}));
// perk + note
o.note=await pg.evaluate(()=>{const m=me();m.perkPts=2;MGR.tab='ludus';MGR.run='school';MGR_REDRAW();const b=document.querySelector('[data-mg="perk"]');if(!b)return 'noperk';b.click();return 'ok'});await pg.waitForTimeout(500);o.note2=await pg.evaluate(()=>(document.querySelector('.tiphint')||{}).textContent||'');
// team screen trophy case
o.tc=await pg.evaluate(()=>{const w=W_();const m=w.mgrs.find(x=>!x.isPlayer);mTrophy(m,'colossus',{who:'X',why:'test'});MGR.tab='team';MGR.teamId=m.id;MGR_REDRAW();const b=document.querySelector('[data-tcase]');if(!b)return 'nobtn';b.click();const win=document.getElementById('tcaseWin');const r={win:!!win,items:win?win.querySelectorAll('.tcitem').length:0};document.querySelector('[data-tcx]').click();r.closed=!document.getElementById('tcaseWin');return r});
// depth chart, offers, loans
o.depth=await pg.evaluate(()=>{MGR.tab='roster';MGR_REDRAW();return {depth:!!document.querySelector('.depth'),bench:document.querySelectorAll('.st95chip').length}});
o.offer=await pg.evaluate(()=>{const w=W_(),pm=me();for(let i=0;i<3;i++){const g=genGlad({ovr:55});g.contract={mgr:pm.id,wage:5,weeks:8,since:1};w.glads.push(g)}for(const m of w.mgrs)m.rivalry=0;let n=0;for(let i=0;i<40&&!(w.offers||[]).length;i++){offersWeek(w,pm);n++}MGR_REDRAW();const o=(w.offers||[])[0];const html=!!document.querySelector('.offerbox');
  let acc=null;if(o){const gid=o.gid;acc=offerAccept(o);acc=acc&&gById(gid).contract.mgr!==pm.id}return {tries:n,has:!!o,html,acc}});
o.loan=await pg.evaluate(()=>{const w=W_(),pm=me();for(let i=0;i<3;i++){const g=genGlad({ovr:50});g.contract={mgr:pm.id,wage:5,weeks:8,since:1};w.glads.push(g)}rosterOf(pm).slice(-1)[0].bench=true;const D=depthOf(pm);const g=D.bench[0];const m=w.mgrs.find(x=>!x.isPlayer);if(!g)return 'nobench';lendTo(g,m,6,2);const c0=pm.coin;loansWeek(w,pm);const mid=g.contract.mgr;loansWeek(w,pm);return {lentTo:mid===m.id,fee:pm.coin-c0,back:g.contract.mgr===pm.id}});
// quaestor + volunteer
o.q=await pg.evaluate(()=>{const w=W_(),pm=me();qsInit(w,pm);w.qs.wages=300;w.qs.fame=Math.max(0,pm.fame-5);qsClose(w,pm);const c0=pm.coin;const t=quaestorLedger(w,pm);MGR.tab='ludus';MGR_REDRAW();return {t,got:pm.coin-c0,card:!!document.querySelector('.qscard')}});
o.city=await pg.evaluate(()=>cityBeastsHTML(3,{only:true}).match(/class="bcity /g).length);
console.log(JSON.stringify(o,null,1));console.log('ERRS',errs.slice(0,5));await b.close()})();

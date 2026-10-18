/* tv105ac — v1.05 beta-5 A (391-v105b5a): B76 the Armory lists only First team / Second team / Reserves (not lent-out, not injured) ·
   B77 two contracts ending the same week -> each Renew button names its fighter · B78 Save & quit sits in the rail below End the week
   (>= 8 px gap at 1440; at the END of the bottom bar at 390) and still saves + quits · kill switch flavius_v105b5aoff=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:{width:vw||1440,height:vw?800:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105b5aoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();w.welc99=1;MGR.tab='ludus';
    for(let k=0;k<6&&CUR_MODAL&&!document.querySelector('#mgrBody .tabrow');k++){CUR_MODAL.done(null);await W8(250)}
    if(!document.querySelector('#mgrBody .tabrow')){openManager();await W8(800)}
    if(typeof MGR_REDRAW==='function')MGR_REDRAW();await W8(300)});return pg};
const probe=pg=>pg.evaluate(async()=>{const out={};const w=W_(),pm=me();const ros=rosterOf(pm);out.n=ros.length;
  const other=w.mgrs.find(m=>m.id!==pm.id);
  const [a,bb,c,d,e]=ros;for(const g of ros){g.slot95=0;g.tm104='R';g.inj=null}
  a.tm104='A';bb.tm104='B';c.tm104='R';
  d.inj={n:'Sprain',weeks:3,wk:w.week,s:w.season};
  e.loanFrom={mid:pm.id};e.contract.mgr=other.id; /* lent out to another house */
  const ids=()=>{const h=arm94HTML();const t=document.createElement('div');t.innerHTML=h;return [...t.querySelectorAll('[data-ar94g]')].map(x=>x.dataset.ar94g)};
  out.ids=ids();out.want=ros.filter(g=>g!==d&&g!==e).map(g=>g.id).sort();out.hasD=out.ids.includes(d.id);out.hasE=out.ids.includes(e.id);
  MGR.ar94=d.id;out.selOk=ros.filter(g=>g!==d&&g!==e).some(g=>g.id===arm94Sel(pm).id);
  e.contract.mgr=pm.id;e.loanFrom=null;d.inj=null;
  /* B77 */
  a.contract.weeks=1;bb.contract.weeks=1;const k=weekChecklist().find(x=>x.ic==='📜'&&!x.done);out.btn=k?k.btn:'';out.na=a.name;out.nb=bb.name;out.ia=a.id;out.ib=bb.id;
  return out});
{const pg=await open(false);const r=await probe(pg);console.log(JSON.stringify({n:r.n,ids:r.ids.length}));
  ok(r.n>=5,'roster >= 5');ok(JSON.stringify([...r.ids].sort())===JSON.stringify(r.want),'Armory lists exactly A/B/R minus injured/lent '+JSON.stringify(r.ids));
  ok(!r.hasD&&!r.hasE,'injured / lent-out not listed');ok(r.selOk,'selection falls back to a listed fighter');
  const nb=(r.btn.match(/data-mg="extend"/g)||[]).length;ok(nb===2,'two renew buttons '+nb);
  const tx=await pg.evaluate(h=>{const d=document.createElement('div');d.innerHTML=h;return [...d.querySelectorAll('button')].map(x=>x.textContent)},r.btn);
  ok(tx.length===2&&tx.some(t=>t.includes(r.na))&&tx.some(t=>t.includes(r.nb)),'each button names its fighter '+JSON.stringify(tx));
  /* B78 desktop */
  const g=await pg.evaluate(()=>{const m=document.getElementById('mClose'),e=document.querySelector('#mgrBody .tabrow .btn.endwk'),rail=document.querySelector('#mgrBody .tabrow');if(!m||!e||!rail)return null;
    const a=m.getBoundingClientRect(),b2=e.getBoundingClientRect(),rr=rail.getBoundingClientRect();return {inRail:rail.contains(m),gap:a.top-b2.bottom,below:a.top>=b2.bottom,within:a.left>=rr.left-1&&a.right<=rr.right+1,vis:a.width>20&&a.height>16,txt:m.textContent.trim()}});
  console.log(JSON.stringify(g));ok(g&&g.inRail&&g.below&&g.gap>=8&&g.within&&g.vis,'Save & quit in the rail below End the week, gap>=8 '+JSON.stringify(g));ok(g&&/Save & quit/.test(g.txt),'label kept');
  const g2=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR_REDRAW();await W8(200);const m=document.getElementById('mClose');return {n:document.querySelectorAll('#mClose').length,inRail:!!document.querySelector('#mgrBody .tabrow #mClose')&&m.classList.contains('saveq')}});
  ok(g2.n===1&&g2.inRail,'one #mClose after repaint '+JSON.stringify(g2));
  const had=await pg.evaluate(()=>{window.__sv=0;const o=saveWorld;saveWorld=function(){window.__sv++;return o.apply(this,arguments)};return !!CUR_MODAL});
  await pg.click('#mClose');await pg.waitForTimeout(1200);
  const closed=await pg.evaluate(()=>document.getElementById('modal').hidden);
  await pg.evaluate(()=>{openHall()});await pg.waitForTimeout(1200);
  const q=await pg.evaluate(()=>({modal:!document.getElementById('modal').hidden&&!!document.getElementById('mgrBody'),sv:window.__sv,mc:document.getElementById('mClose')&&document.getElementById('mClose').parentNode.id}));
  await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null)});
  console.log(JSON.stringify(q));ok(had&&q.sv>=1&&closed,'click closes the Manager '+JSON.stringify(q));ok(q.mc==='mboxEl','#mClose back home after closing '+JSON.stringify(q));
  await pg.close()}
{const pg=await open(false,390);
  const g=await pg.evaluate(()=>{const m=document.getElementById('mClose'),rail=document.querySelector('#mgrBody .tabrow');if(!m||!rail)return null;const a=m.getBoundingClientRect();
    const kids=[...rail.children];return {inRail:rail.contains(m),last:kids[kids.length-1]===m,vis:a.width>20&&a.height>16,ov:document.documentElement.scrollWidth>innerWidth+1}});
  console.log('390',JSON.stringify(g));ok(g&&g.inRail&&g.last&&g.vis,'phone: Save & quit is the last item of the bottom bar '+JSON.stringify(g));await pg.close()}
{const pg=await open(true);
  const g=await pg.evaluate(()=>{const m=document.getElementById('mClose');return {inRail:!!document.querySelector('#mgrBody .tabrow #mClose'),home:m&&m.parentNode.id}});
  console.log('off',JSON.stringify(g));ok(g&&!g.inRail&&g.home==='mboxEl','kill switch: #mClose stays in the corner '+JSON.stringify(g));
  const r=await probe(pg);ok(r.ids.length>=4,'kill switch: Armory lists everyone ('+r.ids.length+')');await pg.close()}
console.log('ERRS',JSON.stringify(errs));if(miss.length)console.log('MISS',JSON.stringify(miss));await b.close();process.exit(errs.length||miss.length?1:0)})();

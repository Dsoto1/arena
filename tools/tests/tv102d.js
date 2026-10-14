/* v1.02 D (335-v102studio): the Classes, Beasts, Cohorts, Tokens, Tournament, Invitationals, Editors and Spectators designers in the
   DF99 designer frame — header + numbered tabs + cards + live preview + checks/save bar + the "📜 Your …" side tab; their controls still
   work (header follows the name, a select still writes the draft, saves land in CUSTOM), a redraw builds the frame in the same task (no
   second paint) and keeps the tab, 390 px has no sideways scroll, and the kill switch (flavius_v102doff=1) gives the old layout back.
   SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const mk=async(W,H,ls)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','0');localStorage.setItem('flavius_devEditor','1');for(const k in o)localStorage.setItem(k,o[k])},ls||{});
  await pg.goto('file://'+process.argv[2],{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});return pg};
const pg=await mk(1440,900);
const until=async(fn,ms=15000,arg)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}};
const W8=ms=>pg.waitForTimeout(ms);
const go=async t=>{await pg.evaluate(t=>{const b=document.querySelector(`#studio [data-st="tab"][data-v="${t}"]`);if(b)b.click();else{ST.tab=t;studioRedraw()}},t);await until(t=>!!document.querySelector('#studio .df99.d102-'+t),8000,t);await W8(150)};
await pg.evaluate(()=>{try{localStorage.removeItem('flavius_df99tab')}catch(e){}DF99.mem=null;menuHide();openStudio('classes')});
ok(await until(()=>document.querySelector('#studio .df99.d102-classes')),'class designer in the frame');
/* ---- 1 · every tab restyled ---- */
const TABS={classes:{ids:['#clsCard','input[data-f="name"]','[data-clsa="save"]'],save:'[data-clsa="save"]',list:1},npcs:{ids:['#bfPrev','#rtPrev','#stNpcName'],save:'[data-st="save"]',list:1},
  cohorts:{ids:['.pc95','input[data-pxf="name"]'],save:'[data-px="save"]',list:1},tokens:{ids:['#tokPrev','#tokTarget','[data-tkf="body"]'],save:'[data-st="toklibnew"],[data-st="toksave"]',list:0},
  tourneys:{ids:['.sxinv','input[data-tnf="name"]','.theats'],save:'[data-tnx="save"]',list:1},specials:{ids:['.sxinv','input[data-sxf="name"]','select[data-sxf="ev"]'],save:'[data-sx="save"]',list:1},
  sponsors:{ids:['#spPrev','input[data-sonf="name"]','.sp91parts'],save:'[data-sps="save"]',list:1},spect:{ids:['#spName','input[data-f="@sptunic"]'],save:'[data-st="spsave"]',list:1}};
for(const [t,o] of Object.entries(TABS)){await go(t);
  const R=await pg.evaluate(o=>{const r=document.querySelector('#studio .df99.d102');if(!r)return null;const tb=[...r.querySelectorAll(':scope>.df99tabs [data-df99t]:not(.df99side)')];
    return {tabs:tb.map(b=>(b.querySelector('i')||{}).textContent+(b.querySelector('span')||{}).textContent),kick:(r.querySelector('.df99kick')||{}).textContent,name:(r.querySelector('[data-df99h="name"]')||{}).textContent,
      pv:r.querySelector('.df99pv').children.length>1,save:!!r.querySelector('.df99save '+o.save.split(',').join(',.df99save ')),side:!!r.querySelector('.df99tabs .df99side'),st98:!!document.querySelector('#studio .st98bar'),
      ids:o.ids.filter(s=>!r.querySelector(s)),cards:r.querySelectorAll('.df99card').length,loose:[...document.querySelectorAll('#studio > .setup-grid, #studio > .trstudio')].length,
      font:parseFloat(getComputedStyle(tb[0]).fontSize)}},o);
  ok(R&&R.tabs.length>=1&&/^①/.test(R.tabs[0])&&R.kick&&R.name&&R.pv&&R.save&&!R.st98&&!R.ids.length&&R.cards>=2&&!R.loose&&R.font>=15&&(!o.list||R.side),t+': frame '+JSON.stringify(R));
  if(SHOT)await pg.screenshot({path:`${SHOT}/tv102d_${t}.png`})}
/* ---- 2 · controls still work ---- */
await go('classes');
await pg.evaluate(()=>DF99.tab(document.querySelector('#studio .df99'),'id'));
await pg.fill('#studio input[data-f="name"]','Tabula Rasa');await pg.evaluate(()=>document.querySelector('#studio input[data-f="name"]').dispatchEvent(new Event('change',{bubbles:true})));await W8(300);
ok(await pg.evaluate(()=>document.querySelector('#studio .df99head [data-df99h="name"]').textContent==='Tabula Rasa'),'class name → header');
/* a select in another tab writes the draft; the redraw keeps the tab and builds the frame in the same task */
await pg.evaluate(()=>DF99.tab(document.querySelector('#studio .df99'),'kit'));
const sel=await pg.evaluate(()=>{const s=document.querySelector('#studio select[data-f="R"]');const o=[...s.options].find(x=>x.value&&x.value!==s.value);s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));return o.value});await W8(400);
const K=await pg.evaluate(v=>({d:ST.draft.R===v,tab:document.querySelector('#studio .df99').dataset.tab,sync:(()=>{studioRedraw();return !!document.querySelector('#studio .df99.d102-classes')&&!document.querySelector('#studio > .setup-grid')})(),
  chk:document.querySelector('#studio .df99chk').textContent}),sel);
ok(K.d&&K.tab==='kit'&&K.sync&&/Budget \d+\/\d+/.test(K.chk),'weapon select writes the draft, tab kept, frame built in the redraw itself '+JSON.stringify(K));
await pg.evaluate(()=>document.querySelector('#studio .df99save [data-clsa="save"]').click());
ok(await until(()=>(CUSTOM.classes||[]).some(c=>c.name==='Tabula Rasa'),8000),'class saved from the bar');await W8(300);
const L=await pg.evaluate(()=>{const r=document.querySelector('#studio .df99');DF99.tab(r,'list');return {n:(r.querySelector('.df99side')||{}).textContent,row:!!r.querySelector('.df99pane[data-df99p="list"] [data-cr="edit"]')}});
ok(/Your classes · 1/.test(L.n)&&L.row,'the list tab counts it and holds its Edit '+JSON.stringify(L));
await pg.evaluate(()=>document.querySelector('#studio .df99pane[data-df99p="list"] [data-cr="edit"]').click());await W8(400);
ok(await pg.evaluate(()=>document.querySelector('#studio .df99').dataset.tab==='id'),'Edit jumps back to the first tab');
/* beasts */
await go('npcs');await pg.fill('#stNpcName','Grando Magnus');await W8(300);
ok(await pg.evaluate(()=>document.querySelector('#studio .df99head [data-df99h="name"]').textContent==='Grando Magnus'),'beast name → header');
await pg.evaluate(()=>document.querySelector('#studio .df99save [data-st="save"]').click());
ok(await until(()=>(CUSTOM.npcs||[]).some(n=>n.name==='Grando Magnus'),8000),'beast saved');
/* cohorts: checks say what is missing */
await go('cohorts');const C=await pg.evaluate(()=>document.querySelector('#studio .df99chk').textContent);ok(/Members 0\/2/.test(C),'cohort checks '+C);
/* tokens: a body change repaints the preview, which sits in the preview column */
await go('tokens');const T0=await pg.evaluate(()=>document.querySelector('#studio .df99pv #tokPrev').innerHTML);
await pg.evaluate(()=>{const s=document.querySelector('#studio [data-tkf="helm"]');const o=[...s.options].find(x=>x.value!==s.value);s.value=o.value;s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}))});await W8(500);
ok(await pg.evaluate(n=>{const p=document.querySelector('#studio .df99pv #tokPrev');return !!p&&p.innerHTML!==n},T0),'token preview follows the helm');
/* tourneys: the size buttons still work; the chip follows */
await go('tourneys');await pg.evaluate(()=>DF99.tab(document.querySelector('#studio .df99'),'basics'));await pg.click('#studio [data-tnsize="4"]');await W8(400);
const TN=await pg.evaluate(()=>({chip:document.querySelector('#studio [data-df99h="chip"]').textContent,seats:document.querySelectorAll('#studio select[data-tns]').length}));ok(/4/.test(TN.chip)&&TN.seats===4,'bracket size 4 '+JSON.stringify(TN));
/* invitationals + editors + spectators save */
await go('specials');await pg.fill('#studio input[data-sxf="name"]','Ludi Testi');await pg.evaluate(()=>document.querySelector('#studio input[data-sxf="name"]').dispatchEvent(new Event('change',{bubbles:true})));await W8(200);
await pg.evaluate(()=>document.querySelector('#studio .df99save [data-sx="save"]').click());ok(await until(()=>(CUSTOM.specials||[]).some(x=>x.name==='Ludi Testi'),8000),'invitational saved');
await go('sponsors');await pg.fill('#studio input[data-sonf="name"]','Marcia Testa');await pg.evaluate(()=>document.querySelector('#studio input[data-sonf="name"]').dispatchEvent(new Event('change',{bubbles:true})));await W8(300);
ok(await pg.evaluate(()=>document.querySelector('#studio .df99head [data-df99h="name"]').textContent==='Marcia Testa'),'editor name → header');
await pg.evaluate(()=>document.querySelector('#studio .df99save [data-sps="save"]').click());ok(await until(()=>(CUSTOM.sponsors||[]).some(x=>x.name==='Marcia Testa'),8000),'editor saved');
await go('spect');await pg.fill('#spName','Gaius Testus');await pg.evaluate(()=>document.querySelector('#spName').dispatchEvent(new Event('change',{bubbles:true})));await W8(200);
const sp95=await pg.evaluate(()=>!document.querySelector('#studio .sp77h'));ok(sp95,'110 sp77 heads pre-empted (cards titled instead)');
await pg.evaluate(()=>document.querySelector('#studio .df99save [data-st="spsave"]').click());ok(await until(()=>(CROWD_CACHE||[]).some(r=>r.custom&&r.name==='Gaius Testus'),8000),'spectator added to the crowd');
/* the Editors lock card stays as it was while locked */
const lock=await pg.evaluate(()=>{localStorage.removeItem('flavius_devEditor');ST.tab='sponsors';studioRedraw();const r={lock:!!document.querySelector('#studio .lockcard'),frame:!!document.querySelector('#studio .df99')};localStorage.setItem('flavius_devEditor','1');return r});
ok(lock.lock&&!lock.frame,'locked Editors keeps its lock card '+JSON.stringify(lock));
await pg.close();
/* ---- 3 · phones ---- */
const ph=await mk(390,844);await ph.evaluate(()=>{menuHide();openStudio('classes')});await ph.waitForTimeout(800);
for(const t of Object.keys(TABS)){await ph.evaluate(t=>{const b=document.querySelector(`#studio [data-st="tab"][data-v="${t}"]`);if(b)b.click();else{ST.tab=t;studioRedraw()}},t);await ph.waitForTimeout(400);
  const P=await ph.evaluate(()=>{const r=document.querySelector('#studio .df99.d102');const m=document.getElementById('mBody');if(!r)return null;const pv=r.querySelector('.df99pv').getBoundingClientRect(),mn=r.querySelector('.df99main').getBoundingClientRect();
    return {side:m.scrollWidth<=m.clientWidth+1,top:pv.bottom<=mn.top+1,pvH:Math.round(pv.height)}});
  ok(P&&P.side&&P.top&&P.pvH<480,'390 '+t+': preview on top, no sideways scroll '+JSON.stringify(P));if(SHOT)await ph.screenshot({path:`${SHOT}/tv102d_${t}_390.png`})}
await ph.close();
/* ---- 4 · kill switch ---- */
const off=await mk(1440,900,{flavius_v102doff:'1'});await off.evaluate(()=>{menuHide();openStudio('classes')});await off.waitForTimeout(900);
const O=await off.evaluate(()=>({frame:!!document.querySelector('#studio .df99'),grid:!!document.querySelector('#studio > .setup-grid'),st98:!!document.querySelector('#studio .st98bar')}));
ok(!O.frame&&O.grid&&O.st98,'kill switch: the old layout + 247 tabs '+JSON.stringify(O));await off.close();
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

/* v0.99 designer frame (262-v99designer): the Character designer and the Lanista designer (Studio + Manager new career) in the shared
   DF99 frame — numbered tabs, the remembered tab, the live preview following the controls, readiness checks, pronouns, "At the table"
   lines from the sliders, save round-trips (customChars, customLanistas, a Manager career started from the form and from the Studio's
   "Use in a new career"), and phones (390 px: one column, the preview strip on top, no sideways scroll). SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\.g/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','0')});
await pg.goto('file://'+process.argv[2],{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const until=async(fn,ms=20000,arg)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}};
const W8=ms=>pg.waitForTimeout(ms);
const close=()=>pg.evaluate(async()=>{for(let i=0;i<6&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300))}});
/* ---- 1 · Character designer ---- */
await close();await pg.evaluate(()=>{try{localStorage.removeItem('flavius_df99tab')}catch(e){}DF99.mem=null;menuHide();openStudio('chars')});
ok(await until(()=>document.querySelector('#studio .df99.ch99')),'character designer in the frame');
const A=await pg.evaluate(()=>{const r=document.querySelector('#studio .df99.ch99');const t=[...r.querySelectorAll('.df99tabs [data-df99t]')].map(b=>b.dataset.df99t+':'+(b.querySelector('i')||{}).textContent);
  return {t:t.join(','),tab:r.dataset.tab,st98:!!document.querySelector('#studio .st98bar'),pv:!!r.querySelector('.df99pv #stPortrait'),save:!!r.querySelector('.df99save [data-st="save"]'),
    vis:[...r.querySelectorAll('.df99pane')].filter(p=>!p.hidden).map(p=>p.dataset.df99p).join(),name:!!r.querySelector('.df99pane[data-df99p="basics"] #stName'),back:!!r.querySelector('.df99pane[data-df99p="basics"] #stBack'),
    tok:!!r.querySelector('.df99pane[data-df99p="look"] [data-t93card]')&&!!r.querySelector('.df99pane[data-df99p="look"] [data-f="tokenRef"]'),stats:!!r.querySelector('.df99pane[data-df99p="fight"] #st95stats'),
    pers:!!r.querySelector('.df99pane[data-df99p="mind"] .perswrap'),list:!!r.querySelector('.df99pane[data-df99p="list"] .stlist')}});
ok(/^basics:①,look:②,fight:③,mind:④,list:/.test(A.t)&&A.tab==='basics'&&A.vis==='basics','four numbered tabs + the list '+JSON.stringify(A));
ok(!A.st98&&A.pv&&A.save&&A.name&&A.back&&A.tok&&A.stats&&A.pers&&A.list,'controls homed per the mock '+JSON.stringify(A));
await pg.click('#studio .df99 [data-df99t="mind"]');await W8(200);
const B=await pg.evaluate(()=>({tab:document.querySelector('#studio .df99').dataset.tab,vis:[...document.querySelectorAll('#studio .df99pane')].filter(p=>!p.hidden).map(p=>p.dataset.df99p).join(),mem:JSON.parse(localStorage.getItem('flavius_df99tab')||'{}').char}));
ok(B.tab==='mind'&&B.vis==='mind'&&B.mem==='mind','tab switch + remembered '+JSON.stringify(B));
/* the slider line follows its live value */
await pg.evaluate(()=>{const s=document.querySelector('#studio [data-f="pers.aggression"]');s.value='10';s.dispatchEvent(new Event('input',{bubbles:true}))});await W8(200);
const how=await pg.evaluate(()=>(document.querySelector('#studio [data-ch99how="aggression"]')||{}).textContent||'');
ok(/10/.test(how)&&/avoids rivals/.test(how),'At the table line from the live value: '+how);
/* a redraw keeps the tab */
await pg.evaluate(()=>studioRedraw());await W8(200);ok(await pg.evaluate(()=>document.querySelector('#studio .df99').dataset.tab==='mind'),'redraw keeps the tab');
/* name → header + preview, pronouns */
await pg.click('#studio .df99 [data-df99t="basics"]');await W8(150);
await pg.fill('#stName','Tertia Ferox');await W8(250);
const C=await pg.evaluate(()=>({h:document.querySelector('#studio .df99head [data-df99h="name"]').textContent,p:document.querySelector('#studio .df99pv [data-df99v="name"]').textContent}));
ok(C.h==='Tertia Ferox'&&C.p==='Tertia Ferox','name follows into the header and preview '+JSON.stringify(C));
await pg.evaluate(()=>{const s=document.querySelector('#studio [data-f="portrait.fem"]');const o=[...s.options].find(x=>x.value&&x.value!=='0'&&x.value!=='');s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}))});await W8(500);
const her=await pg.evaluate(()=>document.querySelector('#studio .df99pane[data-df99p="basics"]').textContent);
ok(/calls her/.test(her)&&/she comes from/.test(her),'her pronouns with a woman\'s build');
/* checks: ratings over the pool */
const chk=await pg.evaluate(async()=>{const s=document.querySelector('#studio [data-stat="spd"]');const r0=document.querySelector('#studio .df99chk').textContent;s.value='99';s.dispatchEvent(new Event('input',{bubbles:true}));
  const t=document.querySelector('#studio [data-stat="str"]');t.value='99';t.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(r=>setTimeout(r,250));return {r0,r1:document.querySelector('#studio .df99chk').textContent}});
ok(/ready to save/.test(chk.r0),'checks ready '+chk.r0);
/* save round-trip */
await pg.evaluate(()=>{for(const k of ['spd','str']){const s=document.querySelector('#studio [data-stat="'+k+'"]');s.value='60';s.dispatchEvent(new Event('input',{bubbles:true}))}});await W8(200);
await pg.click('#studio .df99save [data-st="save"]');
ok(await until(()=>(CUSTOM.chars||[]).some(c=>c.name==='Tertia Ferox'),8000),'character saved');
const sv=await pg.evaluate(async()=>{const x=CUSTOM.chars.find(c=>c.name==='Tertia Ferox');const s=await Store.getDoc('customChars',x.id).catch(()=>null);return {fem:!!(x.portrait&&x.portrait.fem),agg:x.pers&&x.pers.aggression,store:!!s,frame:!!document.querySelector('#studio .df99.ch99')}});
ok(sv.fem&&sv.agg===10&&sv.store&&sv.frame,'saved look + personality, Store, frame back '+JSON.stringify(sv));
if(SHOT)await pg.screenshot({path:SHOT+'/tv99d_char.png'});
/* ---- 2 · Studio lanista ---- */
await pg.evaluate(()=>document.querySelector('#studio [data-st="tab"][data-v="lanistas"]').click());
ok(await until(()=>document.querySelector('#studio .df99.ln99studio')),'Studio lanista designer in the frame');
const L=await pg.evaluate(()=>[...document.querySelectorAll('#studio .df99 .df99tabs [data-df99t]')].map(b=>b.dataset.df99t).join());
ok(L==='id,look,house,mind,start,list','lanista tabs '+L);
await pg.fill('#studio [data-lnf="name"]','Gaia Aurelia');await pg.click('#studio .df99 [data-df99t="house"]');await W8(150);await pg.fill('#studio [data-lnf="ludus"]','Ludus Aurum');await W8(250);
const LP=await pg.evaluate(()=>({n:document.querySelector('#studio .df99pv [data-df99v="name"]').textContent,l:document.querySelector('#studio .df99pv [data-df99v="ludus"]').textContent,h:document.querySelector('#studio .df99head [data-df99h="nick"]').textContent}));
ok(LP.n==='Gaia Aurelia'&&LP.l==='Ludus Aurum'&&/Ludus Aurum/.test(LP.h),'lanista preview live '+JSON.stringify(LP));
await pg.click('#studio .df99 [data-df99t="mind"]');await W8(150);
await pg.evaluate(()=>{const s=document.querySelector('#studio [data-lnp]');s.value='77';s.dispatchEvent(new Event('input',{bubbles:true}))});
await pg.click('#studio .df99save [data-lna="save"]');
ok(await until(()=>(CUSTOM.lanistas||[]).some(l=>l.name==='Gaia Aurelia'&&l.ludus==='Ludus Aurum'),8000),'Studio lanista saved');
ok(await pg.evaluate(()=>{const x=CUSTOM.lanistas.find(l=>l.name==='Gaia Aurelia');return Object.values(x.p).includes(77)}),'temperament saved');
/* Use in a new career → Manager's form, filled in */
await pg.evaluate(()=>document.querySelector('#studio .df99 [data-df99t="start"]').click());await W8(150);
await pg.evaluate(()=>document.querySelector('#studio [data-ln99="career"]').click());
ok(await until(()=>document.querySelector('#mgrBody .df99.ln99mgr')&&typeof NEWMGR!=='undefined'&&NEWMGR&&NEWMGR.name==='Gaia Aurelia',15000),'Use in a new career opens the Manager form');
const M=await pg.evaluate(()=>({tabs:[...document.querySelectorAll('#mgrBody .df99 .df99tabs [data-df99t]')].map(b=>b.dataset.df99t).join(),tab:document.querySelector('#mgrBody .df99').dataset.tab,
  name:document.querySelector('#mgrBody [data-nm="name"]').value,ludus:NEWMGR.ludus,go:!!document.querySelector('#mgrBody .df99save [data-mg="nmgo"]'),diff:!!document.querySelector('#mgrBody .df99pane[data-df99p="start"] [data-sdiff]'),
  rules:!!document.querySelector('#mgrBody .df99pane[data-df99p="start"] [data-nmrule]'),flags:!!document.querySelector('#mgrBody .df99pane[data-df99p="house"] .flaggrid'),roster:!!document.querySelector('#mgrBody .df99pane[data-df99p="house"] [data-roster]'),
  look:!!document.querySelector('#mgrBody .df99pane[data-df99p="look"] [data-nmpt="skin"]'),pv:!!document.querySelector('#mgrBody .df99pv #nmPortrait .portrait')}));
ok(M.tabs==='id,look,house,mind,start'&&M.tab==='id'&&M.name==='Gaia Aurelia'&&M.ludus==='Ludus Aurum'&&M.go&&M.diff&&M.rules&&M.flags&&M.roster&&M.look&&M.pv,'Manager lanista form '+JSON.stringify(M));
/* edit in the Manager form, pick Hard, open the ludus */
await pg.fill('#mgrBody [data-nm="name"]','Gaia Ferrea');await W8(200);
ok(await pg.evaluate(()=>document.querySelector('#mgrBody .df99pv [data-df99v="name"]').textContent==='Gaia Ferrea'),'Manager preview follows the name');
await pg.evaluate(()=>{DF99.tab(document.querySelector('#mgrBody .df99'),'start');document.querySelector('#mgrBody [data-sdiff="hard"]').click()});await W8(400);
const H=await pg.evaluate(()=>({diff:NEWMGR.diff,tab:document.querySelector('#mgrBody .df99').dataset.tab,chk:document.querySelector('#mgrBody .df99chk').textContent}));
ok(H.diff==='hard'&&H.tab==='start'&&/Hard/.test(H.chk),'difficulty kept, tab kept after the redraw '+JSON.stringify(H));
if(SHOT)await pg.screenshot({path:SHOT+'/tv99d_mgr.png'});
await pg.evaluate(()=>document.querySelector('#mgrBody [data-mg="nmgo"]').click());
ok(await until(()=>MGR.world&&me()&&me().name==='Gaia Ferrea'&&me().ludus==='Ludus Aurum',15000),'career opened from the form');
await close();
/* ---- 3 · phones ---- */
const ph=await b.newPage({viewport:{width:390,height:844}});await ph.route(/fonts\.g/,r=>r.abort());ph.on('pageerror',e=>errs.push('390 '+e.message));
await ph.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','0')});
await ph.goto('file://'+process.argv[2],{timeout:120000});await ph.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await ph.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,250))}menuHide();openStudio('chars')});
await ph.waitForFunction(()=>document.querySelector('#studio .df99.ch99'),null,{timeout:20000});await ph.waitForTimeout(500);
const P=await ph.evaluate(()=>{const r=document.querySelector('#studio .df99');const pv=r.querySelector('.df99pv').getBoundingClientRect(),mn=r.querySelector('.df99main').getBoundingClientRect();const m=document.getElementById('mBody');
  const cards=[...r.querySelectorAll('.df99pane:not([hidden]) .df99card')].map(c=>Math.round(c.getBoundingClientRect().left));return {pvTop:pv.bottom<=mn.top+1,pvW:pv.width,one:new Set(cards).size===1,side:m.scrollWidth<=m.clientWidth+1,tabsScroll:getComputedStyle(r.querySelector('.df99tabs')).overflowX}});
ok(P.pvTop&&P.one&&P.side&&P.tabsScroll==='auto','390: preview strip on top, one column, no sideways scroll '+JSON.stringify(P));
if(SHOT)await ph.screenshot({path:SHOT+'/tv99d_390.png'});
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

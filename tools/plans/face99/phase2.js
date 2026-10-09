/* v0.99 ONE FACE phase 2 shots: node tools/plans/face99/phase2.js flavius-arena.html [LS='{"flavius_face99":..}']
   → tools/plans/face99/phase2_<screen>.png: Manager roster · recruiting card · league · Your ludus (letters + council) · stands list ·
     Studio character Appearance (🧬 Features) · Studio lanista Portrait · Manager new-career Portrait · online Domus · Settings (Portrait detail)
   + phase2_compare.png (one face Off / Light / Full at 26/54/110/170/250 px, generated variety). */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();const out=__dirname;const page=path.resolve(process.argv[2]);
const mk=async(W,H,extra)=>{const pg=await b.newPage({viewport:{width:W,height:H}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.route(/fonts\./,r=>r.abort());
  await pg.addInitScript(x=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_tok93auto','0');for(const k in x)localStorage.setItem(k,x[k])},extra||{});
  await pg.goto('file://'+page,{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});pg.__errs=errs;return pg};
const settle=pg=>pg.waitForFunction(()=>!R99.q.length&&!R99.busy,null,{timeout:60000}).catch(()=>{});
const shot=async(pg,name)=>{await settle(pg);await pg.waitForTimeout(250);await pg.screenshot({path:out+'/phase2_'+name+'.png'});console.log('shot',name)};
/* ---- Manager ---- */
let pg=await mk(1440,900);
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));let sd=95;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;me().coin=3000;MGR.tab='roster';MGR_REDRAW();await W8(600)});
await shot(pg,'mgr_roster');
await pg.evaluate(async()=>{MGR.tab='recruit';MGR_REDRAW();await new Promise(r=>setTimeout(r,500));const t=document.querySelector('#mgrPane .pcard,[data-id].pcard');if(t)t.click();await new Promise(r=>setTimeout(r,500))});
await shot(pg,'mgr_recruit');
await pg.evaluate(async()=>{MGR.tab='league';MGR_REDRAW();await new Promise(r=>setTimeout(r,600))});await shot(pg,'mgr_league');
await pg.evaluate(async()=>{const w=W_();try{const a=w.council83&&w.council83[0];sendLetter(w,{key:'f99a',kind:'letter',from:a?a.name:'Consilium',title:'A word on the week',body:'The crowd in Capua loves a brawler.'});
  sendLetter(w,{key:'f99b',kind:'letter',from:(w.council83&&w.council83[3]||{}).name||'Medicus',title:'The ward',body:'Two men need rest.'})}catch(e){}
  MGR.tab='ludus';MGR_REDRAW();await new Promise(r=>setTimeout(r,600));document.querySelectorAll('details.mail').forEach((d,i)=>{if(i<2)d.open=true});await new Promise(r=>setTimeout(r,300));
  const c=document.querySelector('#council83');if(c)c.scrollIntoView({block:'center'})});
await shot(pg,'mgr_ludus_letters');

/* ---- Manager new career: Portrait & colours with 🧬 Features ---- */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR.world=null;MGR.view=null;MGR_REDRAW();await W8(500);const c=document.querySelector('[data-mg="create"]');if(c)c.click();await W8(900);
  DF99.tab(document.querySelector('.df99'),'look');await W8(300);const t=document.querySelector('.fx99card [data-fx99p="ag"]');if(t)t.click();await W8(300);const o=document.querySelector('.fx99card [data-fx99o="ag:wth"]');if(o)o.click();await W8(400);
  document.getElementById('mBody').scrollTop=0});
await shot(pg,'mgr_newcareer_portrait');console.log('mgr ERRS',JSON.stringify(pg.__errs));await pg.close();
/* ---- Studio: character Appearance + lanista ---- */
for(const W of [1440,390]){pg=await mk(W,900);const sfx=W===390?'_390':'';
await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));let sd=7;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openStudio();await W8(800);
  ST.tab='chars';ST.draft=blankChar();ST.view='edit';studioRedraw();await W8(400);const r=document.querySelector('#studio [data-st="random"]');if(r)r.click();await W8(600);
  ST.draft.name='Marcus Varro';ST.draft.nickname='the Iron Wolf';DF99.jump=Date.now();studioRedraw();await W8(500);DF99.tab(document.querySelector('.df99'),'look');await W8(300);
  const t=document.querySelector('.fx99card [data-fx99p="ns"]');if(t)t.click();await W8(300);const o=document.querySelector('.fx99card [data-fx99o="ns:rom"]');if(o)o.click();await W8(300);
  const c=document.querySelector('.fx99card');if(c)c.scrollIntoView({block:'center'})});
await shot(pg,'studio_char_appearance'+sfx);
if(W===1440){await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));document.querySelector('#studio [data-st="tab"][data-v="lanistas"]').click();await W8(600);ST.lnd.name='Cinis Bone-Breaker';DF99.jump=Date.now();studioRedraw();await W8(500);
  DF99.tab(document.querySelector('.df99'),'look');await W8(300);document.getElementById('mBody').scrollTop=0});await shot(pg,'studio_lanista_portrait');
  await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));ST.tab='chars';ST.view='list';studioRedraw();await W8(600);document.getElementById('mBody').scrollTop=0});await shot(pg,'studio_char_list')}
console.log(W,'studio ERRS',JSON.stringify(pg.__errs));await pg.close()}
/* ---- the stands list (an all-CPU event, Stands tab) ---- */
pg=await mk(1440,900);
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();try{SPEED='fast'}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:8}});
  for(let i=0;i<40;i++){if(CUR_MODAL)CUR_MODAL.done(null);await W8(250);if(S&&S.spect&&S.spect.length&&!CUR_MODAL&&i>8)break}
  SPEED='pause';SIDE.tab='stands';sideApply();await W8(900)});
await shot(pg,'stands_list');console.log('stands ERRS',JSON.stringify(pg.__errs));await pg.close();
/* ---- online Domus (the in-page mock server) ---- */
pg=await mk(1440,900,{flavius_online77:'1',flavius_onlcd83:'0'});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(const k of Object.keys(localStorage))if(/^flavius_onl(mock|match|report|over|rid)/.test(k))localStorage.removeItem(k);
  if(CUR_MODAL)CUR_MODAL.done(null);menuHide();onlineOpen();await W8(1500);ONL.acct=await NET.req('auth.signin',{name:'Faces'});await NET.req('domus.create',{name:'Domus Faciei'});
  const c=await NET.req('char.create',{name:'Varro the Bold',cls:'hero'});await NET.req('char.active',{char:c.id});
  try{await NET.req('char.edit',{char:c.id,look:{portrait:{skin:SKINS[2],hair:HAIRS[3],helm:'none',hs:'curly',bs:'full',eyes:EYES[1][0],fx:fx99Pack({fs:'sq',jw:'str',ns:'rom',ag:'wth'})},color:'#4f9a57'}})}catch(e){console.error(e)}
  ONL.tab='char';ONL.newGlad=false;if(typeof ONL82!=='undefined')ONL82.dgAt=0;await onlRefresh();await NET.req('domus.get',{});onlRedraw();await W8(1500);window.__lk=JSON.stringify((ONL.char||{}).look||{})});
await shot(pg,'online_domus');
await pg.evaluate(async()=>{const b=[...document.querySelectorAll('#onl button,#onl summary')].find(x=>/Patron/.test(x.textContent));if(b)b.click();await new Promise(r=>setTimeout(r,900))});await shot(pg,'online_patron');
console.log('online ERRS',JSON.stringify(pg.__errs));await pg.close();
/* ---- one face at every size: Off · Light · Full ---- */
pg=await mk(1500,900);
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  const faces=[gladPortrait('g_401','soldier'),{...gladPortrait('g_1548','amazonia'),fem:true,beard:false},{skin:SKINS[2],hair:HAIRS[4],helm:'none',hs:'curly',bs:'goatee',eyes:EYES[1][0],fx:fx99Pack({fs:'sq',ns:'brk',ag:'old',ea:'caul'})},
    {skin:SKINS[1],hair:HAIRS[0],helm:'galea',bs:'stubble',fx:fx99Pack({fs:'rd',jw:'wid'})}];
  let h='<div id="cmp" style="position:fixed;inset:0;z-index:99999;background:#1a130d;color:#efe3cc;font:12px system-ui;padding:8px;overflow:auto">';
  for(const det of ['off','light','full']){SETTINGS.face99=det;face99Clear();h+=`<div style="margin:4px 0 2px;color:#d6ab4c">${det.toUpperCase()}</div><div style="display:flex;gap:8px;align-items:end">`;
    for(const p of faces)for(const s of ['xs','sm','md','lg'])h+=portraitHTML({name:'x',portrait:p,color:'#4f7fc4'},s);h+='</div>'}
  SETTINGS.face99='full';h+='</div>';document.body.insertAdjacentHTML('beforeend',h)});
await shot(pg,'compare');console.log('cmp ERRS',JSON.stringify(pg.__errs));await pg.close();
await b.close()})();

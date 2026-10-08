/* tv98dr — v0.98 257-v98draft: a custom class's custom weapon + armor join the draft pool; the custom seat drafts like everyone else.
   Run A: Ludus, custom seat is a CPU (last seat). Run B: custom seat is the human (the draft window lists the custom pieces with art).
   Run C: Juggernaut-free check that the pool dedupes a piece already on the market rolls. Run D: Chariot Racing pools. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const W8=ms=>pg.waitForTimeout(ms);
await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}
  const cw=blankCW();cw.id='t98w';cw.name='Test98 Blade';cw.stats.p=5;cw.stats.r=3;
  const ca=blankCA();ca.id='t98a';ca.name='Test98 Cuirass';ca.slot='chest';ca.pt='chest';ca.ap=7;ca.lv=3;
  CUSTOM.weapons=[...(CUSTOM.weapons||[]),cw];CUSTOM.armor=[...(CUSTOM.armor||[]),ca];gearRebuild();
  const ch=blankChar();ch.id='t98c';ch.name='Test98 Ferox';charFromClass(ch,'hero');ch.R='cw_t98w';ch.arm.chest='ca_t98a';CUSTOM.chars=[...(CUSTOM.chars||[]),ch];CLASSES['cc_t98c']=charClass(ch);
  window.PICKS=[];window.EXTRA=null;
  {const b0=draftPull81;draftPull81=function(x){try{PICKS.push({who:x.by-1,kind:x.kind,k:x.k})}catch(e){}return b0.apply(this,arguments)}}
  {const e0=draftExtra98;draftExtra98=function(){const r=e0.apply(this,arguments);EXTRA=r.map(x=>x.kind+':'+x.k);return r}}});
/* A: custom seat is a CPU, seated last */
const A=await pg.evaluate(async()=>{SPEED='fast';PICKS.length=0;EXTRA=null;
  startEvent({ev:'ludus',loc:3,seats:[{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true},{cls:'cc_t98c',cpu:true}],opts:{spect:0}});
  let last=-1,still=0;for(let i=0;i<300&&still<20;i++){still=PICKS.length===last&&PICKS.length>0?still+1:0;last=PICKS.length;if(CUR_MODAL&&!document.querySelector('#mBody .mk88'))CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100))}
  await new Promise(r=>setTimeout(r,400));
  const pl=S.players;return {extra:EXTRA,n:PICKS.length,bySeat:[0,1,2,3].map(i=>PICKS.filter(x=>x.who===i).length),custom:PICKS.filter(x=>/^c[wa]_t98|^ca_t98|^cw_t98/.test(x.k)),
    held:pl.map(p=>[p.wR&&p.wR.key,p.wL&&p.wL.key]),order:PICKS.slice(0,4).map(x=>x.who),drafted:pl.every(p=>p.drafted)}});
ok(A.extra&&A.extra.includes('w:cw_t98w')&&A.extra.includes('a:ca_t98a'),'pool extras list both custom pieces '+JSON.stringify(A.extra));
ok(A.bySeat.every(n=>n>=3&&n<=5),'every seat (the custom one too) drafted (a seat may end early when its spots are full) '+JSON.stringify(A.bySeat));
ok(A.order.join()==='0,1,2,3','snake order starts 0,1,2,3 '+JSON.stringify(A.order));
ok(A.custom.length>=1,'a CPU drafted a custom piece '+JSON.stringify(A.custom));
ok(A.drafted,'no loadout auto-given (p.drafted)');
/* B: the human sits on the custom class */
await pg.evaluate(()=>{S.over=true;if(CUR_MODAL)CUR_MODAL.done(null)});await W8(300);
await pg.evaluate(()=>{SPEED='normal';PICKS.length=0;EXTRA=null;startEvent({ev:'ludus',loc:3,seats:[{cls:'cc_t98c',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true}],opts:{spect:0}})});
let B=null;for(let i=0;i<120;i++){await W8(200);B=await pg.evaluate(()=>{const m=document.querySelector('#mBody .mk88');if(!m||!CUR_MODAL||!/Draft/.test(document.getElementById('mTitle').textContent))return null;
    const els=[...m.querySelectorAll('[data-k88]')].filter(e=>/cw_t98w|ca_t98a/.test(e.dataset.k88));
    return {n:els.length,lit:els.filter(e=>e.classList.contains('lit')).length,styled:els.every(e=>/background-image/.test(e.getAttribute('style')||'')&&!/url\(['"]?['"]?\)/.test(e.getAttribute('style')||'')),refs:els.map(e=>e.dataset.k88),total:m.querySelectorAll('.lit').length,pool:EXTRA}});
  if(B)break;await pg.evaluate(()=>{if(CUR_MODAL&&!document.querySelector('#mBody .mk88'))CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)})}
ok(B&&B.n===2&&B.lit===2,'human draft window shows both custom pieces, lit '+JSON.stringify(B));
ok(B&&B.styled,'custom tiles carry art (no blank tile) '+JSON.stringify(B));
/* the human takes the custom weapon, the draft runs on */
await pg.evaluate(()=>{const el=document.querySelector('#mBody .mk88 [data-k88="w:cw_t98w"].lit');if(el)el.click()});
const B2=await pg.evaluate(async()=>{for(let i=0;i<300;i++){if(CUR_MODAL&&/Draft/.test(document.getElementById('mTitle').textContent)){const el=document.querySelector('#mBody .mk88 .lit');if(el)el.click()}
    else if(CUR_MODAL&&!document.querySelector('#mBody .mk88'))CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);
    if(PICKS.length>=15)break;await new Promise(r=>setTimeout(r,120))}
  return {n:PICKS.length,mine:PICKS.filter(x=>x.who===0).map(x=>x.k),cw:S.players[0].wR&&S.players[0].wR.key||S.players[0].wL&&S.players[0].wL.key}});
ok(B2.n>=15&&B2.mine.includes('cw_t98w'),'the human took the custom weapon like any piece, all seats picked '+JSON.stringify(B2));
/* C: dedupe — a custom weapon already on the market rolls is not added twice */
const Cc=await pg.evaluate(()=>{const pool=[{kind:'w',k:'cw_t98w'}];return draftExtra98([{cls:'cc_t98c'}],pool).map(x=>x.kind+':'+x.k)});
ok(Cc.length===1&&Cc[0]==='a:ca_t98a','dedupe against the pool '+JSON.stringify(Cc));
/* D: chariot pools */
await pg.evaluate(()=>{S.over=true;if(CUR_MODAL)CUR_MODAL.done(null)});await W8(300);
const D=await pg.evaluate(async()=>{SPEED='fast';window.CHP=[];const m0=modal;
  startEvent({ev:'chariot',loc:6,seats:[{cls:'soldier',cpu:true},{cls:'cc_t98c',cpu:true}],opts:{spect:0}});
  for(let i=0;i<150;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100));if(S.players.every(p=>p.wL))break}
  return {extra:EXTRA,held:S.players.map(p=>[p.wR&&p.wR.key,Object.values(p.pieces||{}).filter(Boolean).length])}});
ok(D.extra&&D.extra.includes('w:cw_t98w')&&D.extra.includes('a:ca_t98a'),'chariot draft sees the custom pieces '+JSON.stringify(D));
console.log(JSON.stringify({miss,A:{extra:A.extra,bySeat:A.bySeat,custom:A.custom}}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

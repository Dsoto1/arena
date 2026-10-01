const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1600,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1500);
await pg.evaluate(()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=true;POPPED.add('firstTurn');
  const seats=[{cls:'slave',cpu:true,diff:'easy',name:'A'},{cls:'soldier',cpu:false,name:'Me'},{cls:'amazonia',cpu:true,diff:'easy',name:'C'}].map(s=>({...s,pers:finalPers(s)}));
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:'auto'}});});
await pg.waitForTimeout(1500);
const o={};o.brief=await pg.evaluate(()=>({t:document.getElementById('mTitle').textContent,turn:S.turnNo,chips:document.querySelectorAll('.rchip.no').length}));
await pg.screenshot({path:'brief.png'});
await pg.click('#mBtns button');await pg.waitForTimeout(1500);o.after=await pg.evaluate(()=>({turn:S.turnNo,rule:[...document.querySelectorAll('.rulechip')].map(x=>x.textContent)}));
await pg.evaluate(()=>{SPEED='fast'});
for(let i=0;i<60;i++){const st=await pg.evaluate(()=>({hum:humanTurn(),ph:S.phase,busy:S.busy,modal:!document.getElementById('modal').hidden}));
 if(st.modal){await pg.evaluate(()=>{const b=document.querySelector('#mBtns button');b&&b.click()})}
 if(st.hum&&st.ph==='choice'&&!st.busy){await pg.evaluate(()=>takeChoice(cur(),'coin'));}
 if(st.hum&&st.ph==='action'&&!st.busy&&!st.modal)break;await pg.waitForTimeout(300)}
await pg.waitForTimeout(500);
o.save=await pg.evaluate(()=>({ok:matchSaveOK(),btn:!document.getElementById('btnMSave').hidden,dis:document.getElementById('btnMSave').disabled,auto:!!matchSlotGet('auto'),mgr:document.getElementById('btnManager').hidden,hd:document.getElementById('rosterHd').textContent}));
// save to slot 2 and reload
await pg.click('#navTog');await pg.waitForTimeout(300);await pg.click('#btnMSave');await pg.waitForTimeout(500);o.dlg=await pg.evaluate(()=>document.getElementById('mTitle').textContent);
await pg.fill('#msName','Test save');await pg.click('#mBtns button:nth-child(2)');await pg.waitForTimeout(400);
const before=await pg.evaluate(()=>({rot:S.rotation,cur:S.cur,hp:JSON.stringify(S.players.map(p=>p.hp)),cf:S.players.map(p=>p.cf),rng:RNG.s,n:matchSlotGet('2').name}));
// play a bit forward: end turn
await pg.evaluate(()=>{document.querySelector('[data-act="end"]')&&document.querySelector('[data-act="end"]').click()});await pg.waitForTimeout(2500);
await pg.evaluate(()=>matchLoad('2'));await pg.waitForTimeout(800);
const after=await pg.evaluate(()=>({rot:S.rotation,cur:S.cur,hp:JSON.stringify(S.players.map(p=>p.hp)),cf:S.players.map(p=>p.cf),rng:RNG.s,hum:humanTurn(),ph:S.phase,truce:S.truces instanceof Set}));
o.same=before.rot===after.rot&&before.cur===after.cur&&before.hp===after.hp&&before.rng===after.rng&&JSON.stringify(before.cf)===JSON.stringify(after.cf);o.after2=after;o.name=before.n;
// can continue: move/end turn
await pg.evaluate(()=>{document.querySelector('[data-act="end"]')&&document.querySelector('[data-act="end"]').click()});await pg.waitForTimeout(3000);
o.cont=await pg.evaluate(()=>({turn:S.turnNo,cur:S.cur}));
// menu prompt
await pg.evaluate(()=>{SPEED='pause'});
await pg.click('#btnMenu');await pg.waitForTimeout(600);o.menu=await pg.evaluate(()=>({t:document.getElementById('mTitle').textContent,btns:[...document.querySelectorAll('#mBtns button')].map(b=>b.textContent.slice(0,30))}));
await pg.screenshot({path:'menuask.png'});
await pg.click('#mBtns button:last-child');await pg.waitForTimeout(1500);o.menuShown=await pg.evaluate(()=>({menu:!document.getElementById('mainMenu').hidden,over:S.over,cont:!!document.querySelector('[data-mm="continue"]')}));
// H key
await pg.evaluate(()=>menuHide());const h1=await pg.evaluate(()=>SETTINGS.hints);await pg.keyboard.press('h');await pg.waitForTimeout(200);const h2=await pg.evaluate(()=>({h:SETTINGS.hints,subs:HINT_SUBS.map(k=>SETTINGS[k])}));await pg.keyboard.press('h');const h3=await pg.evaluate(()=>SETTINGS.hints);o.h=[h1,h2,h3];
console.log(JSON.stringify(o,null,1));console.log('ERRS',errs.slice(0,5));await b.close()})();

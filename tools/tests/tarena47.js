const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1500,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};
await pg.evaluate(()=>{menuHide&&menuHide();const seats=[{cls:'slave',cpu:false,name:'Me'},{cls:'soldier',cpu:true,name:'B'},{cls:'royalty',cpu:true,name:'C'},{cls:'venatore',cpu:true,name:'D'}];startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:'auto'}})});
await pg.waitForTimeout(3500);await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:1)});await pg.waitForTimeout(400);
o.self=await pg.evaluate(()=>({r0:canSelfWager(S.players[0]),r1:(()=>{const k=S.ri;S.ri=1;const v=canSelfWager(S.players[0]);S.ri=k;return v})()}));
// floor tokens
await pg.evaluate(()=>{placeFloor('offer','mw2',7,7);placeFloor('offer','elix2',7,8);placeFloor('offer','spiders',8,7);placeFloor('eagle','eagle',8,8);SETTINGS.tokenStyle='standee';const z=S.npcs.find(n=>n.t==='zora');if(!z){spawnNPC('zora','Zora',[6,5])}draw()});await pg.waitForTimeout(800);
await pg.evaluate(()=>draw());await pg.waitForTimeout(300);
const cv=await pg.$('#cv');await cv.screenshot({path:'ar_floor.png'});
o.heal=await pg.evaluate(()=>{fx(7,7,'+2 HP','#7fe07a');return HITFX.some(h=>h.kind==='heal')});
o.tokz=await pg.evaluate(()=>offerTokHTML('elix2',30).includes('data-tokz'));
// end the event quickly and check results panel + replay + bubbles
await pg.evaluate(()=>{think(S.players[1],'Hello there','say')});
await pg.evaluate(()=>{simToEnd(true)});for(let i=0;i<80;i++){if(await pg.evaluate(()=>!!(S.over&&document.getElementById('mTitle')&&!document.getElementById('modal').hidden)))break;await pg.waitForTimeout(500)}
await pg.waitForTimeout(1200);
o.res=await pg.evaluate(()=>({replay:[...document.querySelectorAll('#mBtns button')].some(b=>/Replay/.test(b.textContent)),wp:!!document.querySelector('.wagerpanel'),bub:document.getElementById('bubbles').children.length}));
await pg.screenshot({path:'ar_res.png'});
const r1=await pg.evaluate(()=>S.players.map(p=>p.name).join(','));
await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(b=>/Replay/.test(b.textContent));b&&b.click()});await pg.waitForTimeout(3500);
o.replay=await pg.evaluate(()=>({over:S.over,names:S.players.map(p=>p.name).join(','),loc:S.locIdx}));o.names0=r1;
// naumachia bars
await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:1);const seats=[{cls:'slave',cpu:true,name:'A'},{cls:'soldier',cpu:true,name:'B'},{cls:'royalty',cpu:true,name:'C'},{cls:'hero',cpu:true,name:'D'}];startEvent({ev:'naumachia',loc:LOCATIONS.findIndex(L=>L&&L.ev==='naumachia')||3,seats,opts:{...CFG.opts,spect:0}})});
await pg.waitForTimeout(3500);await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:1);draw()});await pg.waitForTimeout(500);
o.naum=await pg.evaluate(()=>({naum:isNaum(),ships:(S.ships||[]).length}));await (await pg.$('#cv')).screenshot({path:'ar_naum.png'});
// road
await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:1);S.over=true});
await pg.evaluate(async()=>{await Store.put('gladiators','gr1',{id:'gr1',name:'Road Walker',cls:'soldier',cf:24,carry:12,wins:1,events:2,kP:0,kN:0,coin:0,status:'alive',roster:true,history:[],portrait:{}});await loadLudus();openLudus(LUDUS_CACHE.find(g=>g.roster&&gladActive(g)&&BASE_CLS.includes(g.cls)&&!g.cpu).id,true)});await pg.waitForTimeout(1500);
o.rs=await pg.evaluate(()=>!!document.querySelector('[data-roadsend]'));
await pg.click('[data-roadsend]');await pg.waitForTimeout(2500);
o.road=await pg.evaluate(()=>({svg:!!document.getElementById('roadSvg'),tok:!!document.querySelector('.roadtok'),title:document.getElementById('mTitle').textContent.slice(0,30)}));
await pg.screenshot({path:'ar_road.png'});
o.ach=await pg.evaluate(()=>ACHIEVEMENTS.length);
console.log(JSON.stringify(o,null,1));console.log('ERRS',errs.slice(0,5));await b.close()})();

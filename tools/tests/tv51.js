const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2500);const o={};
o.ver=await pg.evaluate(()=>({btn:(document.querySelector('.mmver')||{}).textContent,edHidden:getComputedStyle(document.querySelector('.brand .ed')).display,GV:GAME_VER}));
await pg.click('.mmver');await pg.waitForTimeout(500);o.cheat=await pg.evaluate(()=>(document.getElementById('mTitle')||{}).textContent);o.pw=await pg.evaluate(()=>!!document.querySelector('#devPass'));
await pg.evaluate(()=>{CUR_MODAL&&CUR_MODAL.done(null)});await pg.waitForTimeout(300);
await pg.hover('#mainMenu [data-mm="play"]');await pg.waitForTimeout(1300);o.tt=await pg.evaluate(()=>{const t=document.querySelector('.tt');return t?{lockVis:getComputedStyle(t.querySelector('.ttlock')).display,after:getComputedStyle(t,'::after').content}:null});
await pg.mouse.move(3,3);await pg.waitForTimeout(400);
o.ctx=await pg.evaluate(()=>{hintsMaster(false);const r={ctx:SETTINGS.ctxMenu,hints:SETTINGS.hints};hintsMaster(true);return r});
o.punch=await pg.evaluate(()=>{menuHide();newState({ev:'democritus',loc:6,seats:[{cls:'slave',cpu:false,diff:'normal'},{cls:'hero',cpu:true,diff:'normal'}],opts:{}});const p=S.players[0];p.wR=null;p.wL=null;p.armUses={R:0,L:0};p.attacks=0;const a=attackSources(p).filter(s=>s.w.punch).length;p.wR={...W.gladius,key:'gladius'};const b=attackSources(p).filter(s=>s.w.punch).length;p.wL={...W.mace,key:'mace'};const c=attackSources(p).filter(s=>s.w.punch).length;S.over=true;return [a,b,c]});
/* save versioning */
o.save=await pg.evaluate(async()=>{const snap=await snapshotAll();const w={id:'wold',mgrs:[{id:'m_me',isPlayer:true}],glads:[{id:'g1'}],week:5,season:1};const mw=migrateWorld(JSON.parse(JSON.stringify(w)));return {snapV:snap.v,ms:matchSnapshot?'fn':'',mig:{ver:mw.ver,founded:mw.founded,purse:mw.glads[0].purse!=null},cmp:[verCmp('0.43','0.51'),verCmp('0.51','0.51'),verCmp('0.9','0.10')]}});
console.log(JSON.stringify(o));console.log('ERRS',errs.slice(0,4));await b.close()})();

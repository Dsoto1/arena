/* v0.80: hot seat stays at the hot-seat table — after visiting Hot seat, a non-hot-seat event (lesson, Manager bout, Online host…)
   keeps its own names, saves no profile and keeps hints; a hot-seat start still names players; the main menu ends hot-seat mode.
   Also: the Gate of Life writes one record under the gladiator's real id (no ghost record, no double count). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2500);const o={};
await pg.click('#mainMenu [data-mm="multi"]');await pg.waitForTimeout(300);await pg.click('#mainMenu [data-mm="hotseat"]');await pg.waitForTimeout(2500);
const ins=await pg.$$('[data-hsn]');await ins[0].fill('Ann');await ins[1].fill('Bo');
/* close the setup without starting: Hot seat mode is still on (CFG.hotseat) — then a non-table event starts (as a lesson / bout would) */
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done('closed')});await pg.waitForTimeout(500);
o.cfgHot=await pg.evaluate(()=>!!CFG.hotseat);o.hints0=await pg.evaluate(()=>HINTS);await pg.evaluate(()=>{CFG.hotseat=true});o.profiles0=await pg.evaluate(()=>HS_PROFILES.length);
await pg.evaluate(()=>startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false,name:'Marcus Bout'},{cls:'slave',cpu:true},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}}));await pg.waitForTimeout(1500);
o.leak=await pg.evaluate(()=>({name:S.players[0].name,hot:!!S.hotseat,profiles:HS_PROFILES.length,hints:HINTS}));
/* the main menu ends hot-seat mode */
await pg.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}S.over=true;menuShow()});await pg.waitForTimeout(400);o.afterMenu=await pg.evaluate(()=>!!CFG.hotseat);
/* a real hot-seat start still names the players */
await pg.evaluate(async()=>{for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,200))}hotSeatOpen()});await pg.waitForTimeout(2500);
const ins2=await pg.$$('[data-hsn]');await ins2[0].fill('Ann');await ins2[1].fill('Bo');
/* v0.88: every player seat needs a name — the other two seats go to the CPU */
await pg.evaluate(()=>{for(const i of [2,3]){const s=document.getElementById('cpu'+i);s.value='1';s.dispatchEvent(new Event('change',{bubbles:true}))}});await pg.waitForTimeout(300);await pg.click('#goBtn');await pg.waitForTimeout(4000);
o.table=await pg.evaluate(()=>({hot:!!S.hotseat,names:S.players.filter(p=>!p.cpu).map(p=>p.pid&&typeof hsProf==='function'&&hsProf(p.pid)?hsProf(p.pid).name:p.name)})); /* v0.88: gladiators keep their names; the players sit beside them */
/* the Gate of Life: a badly hurt human survivor → one infirmary record with an id, written once */
o.gate=await pg.evaluate(async()=>{await Store.del&&Promise.resolve();S.hotseat=null;const p=S.players.find(x=>!x.cpu);p.hp.rarm=0;p.pid=undefined;p.cf=35;
  const before=(await Store.list('gladiators')).length;gameOver([p],'test');for(let i=0;i<60;i++){await new Promise(r=>setTimeout(r,200));if(CUR_MODAL)CUR_MODAL.done(null)}
  const all=await Store.list('gladiators');const mine=all.filter(g=>g.name===p.name);return {added:all.length-before,ids:mine.map(g=>!!g.id),status:mine.map(g=>g.status),events:mine.map(g=>g.events)}});
console.log(JSON.stringify(o));
const ok=o.leak.hints===o.hints0&&o.leak.name==='Marcus Bout'&&!o.leak.hot&&o.leak.profiles===o.profiles0&&o.afterMenu===false&&o.table.hot&&o.table.names.includes('Ann')&&o.gate.added===1&&o.gate.ids.every(Boolean)&&o.gate.status[0]==='infirmary'&&o.gate.events[0]===1;
console.log(ok?'PASS':'FAIL');console.log('ERRS',errs.slice(0,4));await b.close();process.exit(ok?0:1)})();

/* tv99e — v0.99 Event Designer with 8 players: drag start markers 1..8 from the palette, move a placed one, remove one,
   then save and ▶ Test play with all 8 starts; page errors + the 00c log stay empty. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const init=()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}};
const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.addInitScript(init);
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const fails=[];const ok=(c,m)=>{if(!c)fails.push(m)};const o={};
const until=async(fn,arg,ms=15000)=>{try{await pg.waitForFunction(fn,arg,{timeout:ms,polling:100});return true}catch(e){return false}};
const mark=await pg.evaluate(()=>ERR92.n);
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();openStudio('events')});
ok(await until(()=>!!document.getElementById('studio')),'studio');
await pg.evaluate(()=>{document.querySelector('[data-st="new"]').click()});await pg.waitForTimeout(400);
await pg.evaluate(()=>{const s=document.querySelector('input[data-f="max"]');s.value=8;s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}))});await pg.waitForTimeout(400);
ok(await pg.evaluate(()=>ST.draft.max===8),'max 8');
await pg.evaluate(()=>{document.querySelector('.edsteps [data-edstep="1"]').click()});
ok(await until(()=>!!document.getElementById('e94cv')&&!!E94.geo&&E94.cv.isConnected&&E94.cv.width>200),'arena view');
await pg.evaluate(()=>{document.querySelector('[data-st="clearboard"]').click()});await pg.waitForTimeout(300);
await pg.evaluate(()=>{document.querySelector('[data-e94="tab"][data-v="pieces"]').click()});await pg.waitForTimeout(300);
o.btns=await pg.evaluate(()=>document.querySelectorAll('[data-e94tool="start"]').length);ok(o.btns===8,'8 start buttons '+o.btns);
const tileXY=async(r,c)=>pg.evaluate(([r,c])=>{const b=E94.cv.getBoundingClientRect();const m=e94C(r,c);return {x:b.left+m.x,y:b.top+m.y}},[r,c]);
const scrollBoard=async()=>{await pg.evaluate(()=>{E94.cv.scrollIntoView({block:'center'})});await pg.waitForTimeout(150)};
const dragFrom=async(sel,r,c)=>{await scrollBoard();const bb=await pg.locator(sel).first().boundingBox();const t=await tileXY(r,c);await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();
  await pg.mouse.move(bb.x+bb.width/2-20,bb.y+bb.height/2+10,{steps:3});await pg.mouse.move(t.x,t.y,{steps:8});await pg.mouse.up();await pg.waitForTimeout(300)};
const spots=[[0,0],[0,12],[12,12],[12,0],[0,6],[6,12],[12,6],[6,0]];
for(let i=0;i<8;i++){await dragFrom(`[data-e94tool="start"][data-v="${i}"]`,...spots[i]);
  const st=await pg.evaluate(()=>JSON.stringify(ST.draft.layout.starts));ok(JSON.parse(st)[i]&&JSON.parse(st)[i][0]===spots[i][0],'start '+(i+1)+' placed '+st)}
await scrollBoard();{const a=await tileXY(...spots[4]),z=await tileXY(3,3);await pg.mouse.move(a.x,a.y);await pg.mouse.down();await pg.mouse.move(z.x,z.y,{steps:10});await pg.mouse.up();await pg.waitForTimeout(300)}
o.mv=await pg.evaluate(()=>ST.draft.layout.starts[4]);ok(JSON.stringify(o.mv)==='[3,3]','moved '+JSON.stringify(o.mv));
{const z=await tileXY(...spots[7]);await pg.mouse.click(z.x,z.y,{button:'right'});await pg.waitForTimeout(300)}
o.n=await pg.evaluate(()=>ST.draft.layout.starts.filter(Boolean).length);ok(o.n===7,'7 left '+o.n);
await dragFrom('[data-e94tool="start"][data-v="7"]',...spots[7]);
ok(await pg.evaluate(()=>ST.draft.layout.starts.filter(Boolean).length===8),'8 again');
await pg.evaluate(()=>{document.querySelector('[data-e94tool="start"][data-v="6"]').click()});await pg.waitForTimeout(200);
{const z=await tileXY(9,9);await pg.mouse.click(z.x,z.y);await pg.waitForTimeout(300)}
ok(await pg.evaluate(()=>JSON.stringify(ST.draft.layout.starts[6])==='[9,9]'),'stamp 7');
await pg.evaluate(()=>{ST.draft.name='Eight Games 99';studioRedraw()});await pg.waitForTimeout(300);
await pg.evaluate(()=>{setSpeedUI&&setSpeedUI('fast')});
await pg.evaluate(()=>{document.querySelector('[data-e94="test"]').click()});
ok(await until(()=>S&&S.e94test&&S.evKey==='__e94t',null,20000),'test play started');
let ran=false;for(let i=0;i<120&&!ran;i++){await pg.waitForTimeout(250);ran=await pg.evaluate(()=>{if(CUR_MODAL&&!(S&&S.over))try{CUR_MODAL.done(null)}catch(e){}return !!(S&&S.e94test&&(S.turnNo>=3||S.over))})}
o.pl=await pg.evaluate(()=>({n:S.players.length,starts:S.players.map(p=>p.start)}));
ok(ran&&o.pl.n===8,'test play ran with 8 '+JSON.stringify(o.pl));
await pg.evaluate(()=>{document.getElementById('e94back').click()});
ok(await until(()=>!!document.getElementById('e94cv')&&E94.cv.isConnected&&ST.view==='edit',null,20000),'back');
for(let k=0;k<4;k++){await pg.waitForTimeout(700);await pg.evaluate(()=>{const b=document.querySelector('[data-st="save"]');if(b&&!CUSTOM.events.some(x=>x.name==='Eight Games 99'))b.click()});await pg.waitForTimeout(1200);if(await pg.evaluate(()=>CUSTOM.events.some(x=>x.name==='Eight Games 99')))break}
await until(()=>CUSTOM.events.some(x=>x.name==='Eight Games 99'),null,8000);o.saved=await pg.evaluate(()=>{const e=CUSTOM.events.find(x=>x.name==='Eight Games 99');return e?e.layout.starts.length:-1});ok(o.saved===8,'saved 8 starts '+o.saved);
const e92=await pg.evaluate(m=>ERR92.n-m,mark);o.e92=e92;
console.log(JSON.stringify(o));
if(errs.length)fails.push('pageerrors '+errs.slice(0,3).join(' | '));
if(e92>0)fails.push('ERR92 '+(await pg.evaluate(()=>JSON.stringify(ERR92.list?ERR92.list.slice(-3):''))));
console.log(fails.length?'FAIL '+fails.join('; '):'PASS');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(fails.length?1:0)})();

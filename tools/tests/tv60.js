/* v0.60: the Road from the gladiator's record (custom characters too; Walk stage on the walker's record), the Hall's Road box without the dropdown, and the Annals loop (the second trip from the main menu opens the Annals) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2500);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const title=()=>pg.evaluate(()=>(!document.getElementById('mainMenu').hidden?'MENU ':'')+(!document.getElementById('modal').hidden?((document.getElementById('mTitle')||{}).textContent||''):''));
await pg.evaluate(async()=>{CLASSES.cc_test={...CLASSES.hero,name:'Testclass',custom:true};const g={id:'gcust1',name:'Customus',cls:'cc_test',status:'active',roster:true,events:2,wins:1,carry:0,hp:{},portrait:{}};await Store.put('gladiators',g.id,g);await Store.put('hall','road',{gid:'old',name:'Oldus',cls:'hero',step:0,history:[],over:'fell',fell:{step:0,loc:'Arles'}});await loadLudus()});
/* the loop: menu → Annals → Ludus → back → Hall → Ludus → back → menu, twice */
for(let k=0;k<2;k++){await pg.click('[data-mm="annals"]');await pg.waitForTimeout(1500);o['annals'+k]=/Annals/.test(await title());
  await pg.click('#hallBody [data-tab="ludus"]');await pg.waitForTimeout(1200);await pg.click('#mClose');await pg.waitForTimeout(1200);
  await pg.click('#hallBody [data-tab="hall"]');await pg.waitForTimeout(900);await pg.click('#mClose');await pg.waitForTimeout(1500);o['menu'+k]=/^MENU/.test(await title())}
ok(o.annals0&&o.annals1&&o.menu0&&o.menu1,'annals loop');
/* the Hall's Road box: no dropdown, a button to the gladiators */
await pg.click('[data-mm="annals"]');await pg.waitForTimeout(1500);await pg.click('#hallBody [data-tab="hall"]');await pg.waitForTimeout(1000);
o.hall=await pg.evaluate(()=>({select:!!document.getElementById('roadPick'),pick:!!document.querySelector('.roadbox [data-tab="ludus"]')}));
ok(!o.hall.select&&o.hall.pick,'hall box');
await pg.click('.roadbox [data-tab="ludus"]');await pg.waitForTimeout(1300);o.toLudus=/Gladiators/.test(await title());ok(o.toLudus,'hall → gladiators');
await pg.click('[data-glad="gcust1"]');await pg.waitForTimeout(700);
o.send=await pg.evaluate(()=>!!document.querySelector('#gDetail [data-roadsend="gcust1"]'));ok(o.send,'send button (custom character)');
await pg.click('#gDetail [data-roadsend="gcust1"]');await pg.waitForTimeout(2200);
o.after=await pg.evaluate(async()=>{const R=await roadLoad();return {gid:R&&R.gid,step:R&&R.step,inHall:/Annals/.test((document.getElementById('mTitle')||{}).textContent||''),walk:!!document.querySelector('#hallBody [data-road="go"]')}});
ok(o.after.gid==='gcust1'&&o.after.step===0&&o.after.inHall&&o.after.walk,'committed');
await pg.click('#hallBody [data-tab="ludus"]');await pg.waitForTimeout(1300);await pg.click('[data-glad="gcust1"]');await pg.waitForTimeout(700);
o.walkCard=await pg.evaluate(()=>!!document.querySelector('#gDetail [data-road="go"]'));ok(o.walkCard,'walk on the record');
await pg.click('#gDetail [data-road="go"]');await pg.waitForTimeout(3500);
o.setup=await pg.evaluate(()=>({open:!!window.SETUP_OPEN&&!document.getElementById('modal').hidden,road:!!(CFG.road&&CFG.road.gid==='gcust1'),menu:!document.getElementById('mainMenu').hidden}));
ok(o.setup.open&&o.setup.road&&!o.setup.menu,'walk → setup');
await pg.evaluate(async()=>{await Store.put('hall','road',{gid:'old',name:'Oldus',cls:'hero',step:0,history:[],over:'fell',fell:{step:0,loc:'Arles'}})});
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length)process.exit(1)})();

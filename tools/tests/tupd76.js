/* v0.76 follow-up: an older build never writes over what a newer one saved (flavius_newestver / a newer world.ver), and the update bar */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const r=await pg.evaluate(async()=>{const r={};r.stamp=localStorage.getItem('flavius_newestver')===GAME_VERL;
  await Store.put('hall','tu1',{a:1});r.ok=!!(await Store.getDoc('hall','tu1'));
  localStorage.setItem('flavius_newestver','9.99');await Store.put('hall','tu2',{a:1});r.blocked=!(await Store.getDoc('hall','tu2'))&&matchSlotPut('3',{v:GAME_VER})===false;
  const bar=document.getElementById('upd76');r.bar=!!bar&&!bar.hidden&&/9\.99/.test(bar.textContent);
  /* v1.08c letter versions: 1.08 < 1.08a < 1.08b < 1.09 < 1.10; GAME_VER numeric, GAME_VERL with the letter; no update bar for its own version */
  const o=[['1.08','1.08a'],['1.08a','1.08b'],['1.08b','1.09'],['1.09','1.10'],['1.9','1.10'],['0.0','1.08']];
  r.order=o.every(([a,b])=>verCmp(a,b)===-1&&verCmp(b,a)===1)&&verCmp('1.08b','1.08b')===0&&verCmp('1.08','1.08')===0&&verCmp('1.10','1.9')===1;
  r.numeric=/^\d+\.\d+$/.test(GAME_VER)&&GAME_VERL.indexOf(GAME_VER)===0&&/^\d+\.\d+[a-z]?$/.test(GAME_VERL)&&document.querySelector('.brand .ed').textContent.endsWith('v'+GAME_VERL);
  r.self=verOffer76(GAME_VERL)===false&&verOffer76(GAME_VER)===false;
  const nx=GAME_VERL.replace(/^(\d+)\.(\d+)[a-z]?$/,(m,a,b)=>a+'.'+String(+b+1).padStart(2,'0'));
  const nl=GAME_VERL+(/[a-z]$/.test(GAME_VERL)?'':'a'), nl2=/[a-z]$/.test(GAME_VERL)?GAME_VERL.slice(0,-1)+String.fromCharCode(GAME_VERL.charCodeAt(GAME_VERL.length-1)+1):GAME_VERL+'a';
  r.offer=verOffer76(nx)===true&&verOffer76(nl2)===true&&verOffer76('x1.08')===false&&verOffer76('')===false;
  localStorage.setItem('flavius_newestver',GAME_VERL);r.noStale=newerSeen76()===null;
  localStorage.setItem('flavius_newestver',GAME_VERL);await Store.put('hall','tu3',{a:1});r.back=!!(await Store.getDoc('hall','tu3'));return r});
const miss=Object.entries(r).filter(([k,v])=>!v).map(([k])=>k);
console.log(JSON.stringify(r));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

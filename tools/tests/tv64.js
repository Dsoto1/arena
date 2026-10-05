/* v0.64: missios by the rulebook (whole roster in the picker, no sim, elimination ends it at once → Missio failed + fallen,
   no-CF events pass by surviving with no Fate), seeded crowd stream, chariot tokens (ride token, spares, tokens on the card) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
/* the picker: the whole active roster, custom classes greyed, in a scrolling box */
o.pick=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  CLASSES.cc_t64={...CLASSES.hero,name:'Test Class',custom:true};
  for(const [id,cls] of [['g64a','damnatio'],['g64b','hero'],['g64c','cc_t64']])await Store.put('gladiators',id,{id,name:'T'+id,cls,status:'active',roster:true,events:0,wins:0,carry:0,hp:{},portrait:{}});
  await loadLudus();openSetup();
  /* poll (the regression runs 3 tests at once: timers stretch) */const until=async(f,ms=30000)=>{const t0=Date.now();while(Date.now()-t0<ms&&!f())await new Promise(r=>setTimeout(r,100))};
  const sel='[data-tab="missio"],[data-st="missio"],[data-mode="missio"]';await until(()=>document.querySelector(sel));await new Promise(r=>setTimeout(r,300));const t=document.querySelector(sel);t&&t.click();
  await until(()=>{const x=document.querySelector('.missioroll');return x&&x.querySelectorAll('.item').length>=3});
  const box=document.querySelector('.missioroll');return {box:!!box,scroll:box?getComputedStyle(box).overflowY:'',n:box?box.querySelectorAll('.item').length:0,grey:box?[...box.querySelectorAll('.item')].filter(i=>/printed classes/.test(i.textContent)).length:0}});
ok(o.pick.box&&o.pick.scroll==='auto'&&o.pick.n>=3&&o.pick.grey>=1,'missio picker');
/* the missio's dice come from a fixed seed (SEED64): an unseeded race can crash the hero now and then, and this checks a survivor */
const SEED=+(process.env.SEED64||64);
const run=async mode=>pg.evaluate(async([mode,seed])=>{if(CUR_MODAL)CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,300));menuHide();
  RNG=mulberry32(seed);if(!window.__se64){window.__se64=1;const se=startEvent;startEvent=function(c){if(c&&c.seed==null)c.seed=window.__seed64;return se.apply(this,arguments)}}window.__seed64=seed;
  const rec=await missioFromLudus(LUDUS_CACHE.find(x=>x.id==='g64a'));await Store.put('missios',rec.id,rec);startMissio(rec);
  /* the opening windows (briefing, chariot draft) are answered until the board shows the chariot card */
  {const t0=Date.now();let n=0;while(Date.now()-t0<45000){if(CUR_MODAL&&n<30){CUR_MODAL.done(null);n++}else if(!CUR_MODAL&&document.querySelector('#board .chcomp .chtk.horse')&&Date.now()-t0>2500)break;await new Promise(r=>setTimeout(r,150))}}SPEED='snap';
  const r={sim:!document.getElementById('btnSimEnd').hidden};await simToEnd(true);r.refused=!S.over&&!S.players[0].cpu;
  r.comp=!!document.querySelector('#board .chcomp .chtk.horse')&&!!document.querySelector('#board .chcomp .chtk.wheel');r.tok=typeof chRideTok==='function'&&S.floor.some(f=>f.kind==='wheel'&&f.part&&f.part.art);
  if(mode==='kill'){eliminate(S.players[0],{type:'player',ref:S.players[1]});checkEnd();settle();render()}
  else{S.players[0].cpu=true;S.players[0].diff='normal';if(cur()===S.players[0]){S.busy=false;S.pending=null;advanceTurn()}}
  for(let i=0;i<300&&!(S.over&&document.querySelector('#mBody .missiohd'));i++){await new Promise(r2=>setTimeout(r2,1000));if(CUR_MODAL&&!S.over)CUR_MODAL.done(null)}
  r.hd=(document.querySelector('#mBody .missiohd')||{}).textContent||'';r.g=(await Store.getDoc('gladiators','g64a')||{}).status;r.m=(await Store.getDoc('missios',rec.id)||{}).status;
  r.fate=(S.result&&S.result.rows&&S.result.rows[0]||{}).fate;r.seed=S.seed;if(CUR_MODAL)CUR_MODAL.done(null);S.over=true;window.__seed64=null;return r},[mode,SEED]);
o.race=await run('race');
ok(!o.race.sim&&o.race.refused,'no sim in a missio');ok(o.race.comp&&o.race.tok,'chariot tokens');
ok(/Step 1 of 5 complete|Missio failed/.test(o.race.hd)&&o.race.fate==='','no-CF: no Fate, survive passes');ok(o.race.g==='active','survivor stays on the rolls');
await pg.evaluate(async()=>{const g=LUDUS_CACHE.find(x=>x.id==='g64a');for(const m of await Store.list('missios'))await Store.del('missios',m.id);g.status='active';await Store.put('gladiators',g.id,g);await loadLudus()});
o.kill=await run('kill');
ok(o.kill.hd==='Missio failed'&&o.kill.g==='fallen'&&o.kill.m==='fallen','elimination → Missio failed + fallen');
o.side=await pg.evaluate(()=>{const s0=S.seed;const a=(S._sideS=undefined,[sideRand(),sideRand()]);S._sideS=undefined;const b2=[sideRand(),sideRand()];return a.join()===b2.join()&&a[0]!==a[1]});
ok(o.side,'seeded crowd stream');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

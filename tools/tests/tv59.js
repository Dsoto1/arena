/* v0.59: Credits (D.Soto) + Prototype tab, the main-menu mute, Zora's mini, the turn sweep, Naumachia by the rulebook (layout, deck, boarding, water pinwheel), Chariot Racing (snake draft with chariot cards, tokens on the chariot), Rivalry Week (byes 4 & 11, week-11 letter, three-bout card + background rivalries) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.click('#mainMenu [data-proto]');await pg.waitForFunction(()=>!!document.querySelector('#protoBox h2')&&document.querySelectorAll('#protoBox .crl a').length>0,null,{timeout:30000}).catch(()=>{});await pg.waitForTimeout(200);
o.cred=await pg.evaluate(()=>({h:document.querySelector('#protoBox h2').textContent,links:document.querySelectorAll('#protoBox .crl a').length,qr:!!document.querySelector('#protoBox .crqr')}));
await pg.click('[data-crtab="proto"]');await pg.waitForFunction(()=>document.querySelectorAll('#protoBox figure').length>0,null,{timeout:30000}).catch(()=>{});await pg.waitForTimeout(200);o.protoN=await pg.evaluate(()=>document.querySelectorAll('#protoBox figure').length);
await pg.evaluate(()=>{document.getElementById('protoBox').hidden=true});
ok(o.cred.h==='Credits'&&o.cred.links>=6&&o.cred.qr,'credits');ok(o.protoN===5,'proto tab');
/* v0.87: the menu's mute button is gone (Settings → Audio, the M key and the arena's own control remain) */
o.mute=await pg.evaluate(()=>{const m=document.getElementById('mmMute');const a=audSet().on;audToggleMute();const b2=audSet().on;audToggleMute();return {gone:!m,toggled:a!==b2,back:audSet().on===a,chip:!!document.getElementById('audChip')}});
ok(o.mute.gone&&o.mute.toggled&&o.mute.back&&!o.mute.chip,'mute');
o.arena=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  startEvent({ev:'democritus',loc:6,seats:[{cls:'venatore'},{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  /* poll, never a fixed wait (the regression runs 3 tests at once: timers stretch) */
  {const t0=Date.now();let n=0;while(Date.now()-t0<30000){if(CUR_MODAL&&n<10){CUR_MODAL.done(null);n++}else if(!CUR_MODAL&&S.phase&&S.phase!=='setup'&&Date.now()-t0>1200)break;await new Promise(r=>setTimeout(r,80))}}
  const z=spawnZora(S.players[0]);const zm=!!(typeof STANDEE_SRC!=='undefined'&&STANDEE_SRC.zoraMini)&&typeof drawZoraMini==='function';
  cardShow('c:wealth3',cur(),'🂠 Drawn');const old=document.getElementById('cardShow').firstElementChild;const c0=old?1:0;S.busy=false;S.pending=null;const tn=S.turnNo;advanceTurn();for(let i=0;i<600&&S.turnNo===tn;i++)await new Promise(r=>setTimeout(r,50));await new Promise(r=>setTimeout(r,250));
  return {zora:!!z,zm,c0,c1:old&&old.isConnected?1:0}});
ok(o.arena.zora&&o.arena.zm,'zora mini');ok(o.arena.c0>=1&&o.arena.c1===0,'turn sweep');
o.naum=await pg.evaluate(async()=>{S&&(S.over=true);startEvent({ev:'naumachia',loc:6,seats:['soldier','hero','slave','royalty','venatore','amazonia'].map((c,i)=>({cls:c,cpu:true,team:'T'+(i%3)})),opts:{spect:0}});
  await new Promise(r=>setTimeout(r,600));const p=S.players[0];const sv=[p.r,p.c];const oth=S.players.filter(q=>q!==p).map(q=>[q,q.r,q.c]);oth.forEach(([q],i)=>{q.r=12;q.c=8+i});
  p.r=0;p.c=0;let R=reach(p);const corner=[...R.tiles.keys()].filter(k=>shipAt(Math.floor(k/N),k%N)&&R.tiles.get(k)<=2).length;
  p.r=0;p.c=3;R=reach(p);const board=[...R.tiles.keys()].filter(k=>shipAt(Math.floor(k/N),k%N)&&R.tiles.get(k)<=2).length;[p.r,p.c]=sv;oth.forEach(([q,r,c])=>{q.r=r;q.c=c});
  return {tiles:S.ships.map(s=>s.tiles.size),wt:S.waterTok.map(t=>t.r+','+t.c).includes('0,7'),starts:S.players.every(q=>nTerr(q.start[0],q.start[1])==='ship'),corner,board,boxes:S.ships.every(s=>s.box&&s.board)}});
ok(o.naum.tiles.every(n=>n===11)&&o.naum.wt&&o.naum.starts&&o.naum.corner===0&&o.naum.board===3&&o.naum.boxes,'naumachia');
o.ch=await pg.evaluate(async()=>{S&&(S.over=true);startEvent({ev:'chariot',loc:7,seats:['soldier','hero','slave','royalty'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});
  {const t0=Date.now();let n=0;while(Date.now()-t0<45000){if(CUR_MODAL&&n<20){CUR_MODAL.done(null);n++}else if(!CUR_MODAL&&S.players.every(p=>p.ch&&p.ch.art)&&Date.now()-t0>2500)break;await new Promise(r=>setTimeout(r,100))}}
  const arts=S.players.map(p=>p.ch&&p.ch.art);const q=S.players[1];const had=!!q.ch.wheel;chHitPart(q,'wheel',99);
  return {uniq:new Set(arts).size===arts.length,named:S.players.every(p=>p.ch&&CH_CARDS59.some(c=>c[1]===p.ch.name)),drop:had?CH_DROPS.length>0:true,img:typeof chTok==='function'}});
ok(o.ch.uniq&&o.ch.named&&o.ch.drop&&o.ch.img,'chariot');
o.riv=await pg.evaluate(async()=>{S&&(S.over=true);openManager();await new Promise(r=>setTimeout(r,600));newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_();
  w.week=w.week+(11-wkOf(w.week));makeNight();const lock=!!(w.rivalry&&w.rivalry.abs===w.week+1);MGR.tab='ludus';MGR_REDRAW();const btn=document.querySelector('[data-rivcommit]');if(btn)btn.click();
  const commit=(w.rivalry.commit[me().id]||[]).length;w.week++;makeNight();const bouts=w.night.bouts.map(b=>b.ev+':'+b.ents.length+':'+!!b.rivalry);
  for(let i=0;i<w.night.bouts.length;i++)await runBoutSim(i);w.pend=[];await endWeek();
  const bg=(w.news||[]).filter(x=>/Rivalry Week:/.test(x.text)).length,cardWins=(w.news||[]).filter(x=>/wins the rivalry/.test(x.text)).length,news=bg+cardWins;
  return {byes:BYE_WKS.join(','),fx:fixtureFor(1,12).ev,lock,commit,bouts,news,bg,cardWins,pairs:w.rivalry.pairs.length}});
ok(o.riv.byes==='4,11'&&o.riv.fx==='familia'&&o.riv.lock&&o.riv.commit===2&&o.riv.bouts.length===3&&o.riv.bouts.every(x=>x==='familia:4:true')&&o.riv.bg===o.riv.pairs-3&&o.riv.cardWins<=3,'rivalry');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length)process.exit(1)})();

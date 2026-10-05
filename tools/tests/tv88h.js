/* v0.88 hot seat (158-v88hs): a 3-player table + 1 CPU driven by page functions and clicks.
   Junk names blocked at the horns · gladiators keep their names, labels name the player (never 'You') · the whose-move pill ·
   Mandata face down for everyone (yours with a 👁 hold-to-peek) · hints stay off (applySettings, setHints) · owner's purse for
   owner windows · Take control asks who plays · offers addressed by name · the truce decree asks each player · the table slot
   (resume, hot-seat mode back) · ⏭ To the end asks everyone and still counts in every book · Fate-aware books · no owner records ·
   profile delete asks in the centred popup · 390-px landscape: End turn on screen. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:900}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2500);const o={};const W=ms=>pg.waitForTimeout(ms);
const owner=()=>pg.evaluate(async()=>{const cols=['hall','infamis','gladiators','arena','hallTrophies','missios'];const out={};for(const c of cols){const L=await Store.list(c).catch(()=>[]);out[c]=JSON.stringify(L).length+':'+L.length}
  try{const c=calNow();out.cal=c.season+'/'+c.week}catch(e){}return out});
o.own0=await owner();o.hints0=await pg.evaluate(()=>HINTS);
await pg.click('#mainMenu [data-mm="multi"]');await W(300);await pg.click('#mainMenu [data-mm="hotseat"]');await W(2500);
/* junk names: a blank player seat, then the same name twice (case does not matter) */
let ins=await pg.$$('[data-hsn]');await ins[0].fill('Ann');await ins[1].fill('Bo');await ins[2].fill('Cy');await ins[3].fill('');
await pg.click('#goBtn');await W(700);o.blank=await pg.evaluate(()=>({err:(document.getElementById('setupErr')||{}).textContent||'',live:!!(S&&S.hotseat)}));
await ins[3].fill('ann');await pg.click('#goBtn');await W(700);o.dup=await pg.evaluate(()=>({err:(document.getElementById('setupErr')||{}).textContent||'',live:!!(S&&S.hotseat),prof:HS_PROFILES.map(p=>p.name)}));
await pg.evaluate(()=>{const s=document.getElementById('cpu3');s.value='1';s.dispatchEvent(new Event('change',{bubbles:true}))});await W(400);
ins=await pg.$$('[data-hsn]');o.seatUI=await pg.evaluate(()=>({own:document.querySelectorAll('[data-hsown]').length,sav:document.querySelectorAll('#modal select[id^=sav],#modal select[id^=lcp]').length}));
/* Cy fights under her own name; the others keep their gladiators' names */
await pg.evaluate(()=>{const c=document.querySelector('[data-hsown="2"]');c.checked=true;c.dispatchEvent(new Event('change',{bubbles:true}))});
await pg.evaluate(()=>{const i=document.getElementById('nam0');if(i){i.value='Spartacus';i.dispatchEvent(new Event('input',{bubbles:true}))}});
o.clsName=await pg.evaluate(()=>typeof clsSavedName==='function'?clsSavedName(CFG.seats[0].cls)||'':'');
await pg.click('#goBtn');
for(let k=0;k<30;k++){await W(700);const t=await pg.evaluate(()=>{if(S&&S.hotseat&&!CUR_MODAL&&cur()&&!cur().cpu&&(S.phase==='action'||S.phase==='choice'))return 'ok';
  const bt=[...document.querySelectorAll('#mBtns button')].find(x=>/sand|Continue|OK|Start|Begin/i.test(x.textContent));if(bt)bt.click();return ''});if(t==='ok')break}
o.live=await pg.evaluate(()=>({prof:HS_PROFILES.map(p=>p.name).sort(),pl:S.players.map(p=>p.name+'|'+(p.pid?hsProf(p.pid).name:'')+'|'+(p.cpu?1:0)),hints:HINTS,strat:showStrategy()}));
/* the pill, the board header and the Field label name the player */
o.pill=await pg.evaluate(()=>{const p=cur();const el=document.getElementById('hsPill88');return {txt:el&&!el.hidden?el.textContent:'',who:hsProf(p.pid).name,glad:p.name}});
o.labels=await pg.evaluate(()=>{const h=boardHTML(cur(),false);const sub=(h.match(/<div class="pcls">([\s\S]*?)<\/div>/)||[])[1]||'';return {sub:sub.replace(/<[^>]+>/g,''),you:/· You ·/.test(sub)}});
/* Mandata Flavi: every human's card face down, your own with a 👁 hold-to-peek */
o.mf=await pg.evaluate(()=>{S.players.forEach((p,i)=>p.items.push({id:uid++,kind:'mf',idx:i}));const me=cur();const other=S.players.find(p=>!p.cpu&&p!==me);
  const hm=boardHTML(me,true),ho=boardHTML(other,false);return {mineBack:/mfback/.test(hm),minePeek:/data-mfpeek/.test(hm),otherBack:/mfback/.test(ho),otherPeek:/data-mfpeek/.test(ho),otherFace:new RegExp('data-card="m:'+other.items.find(i=>i.kind==='mf').idx+'"').test(ho)}});
await pg.evaluate(()=>{S.boardPid=null;render()});await W(400);
const pk=await pg.$('#board [data-mfpeek]');if(pk){await pk.scrollIntoViewIfNeeded();const bb=await pk.boundingBox();await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();await W(300);
  o.peekOn=await pg.evaluate(()=>{const e=document.getElementById('mfPeek88');return !!(e&&!e.hidden&&e.querySelector('[data-card^="m:"]'))});await pg.mouse.up();await W(200);
  o.peekOff=await pg.evaluate(()=>{const e=document.getElementById('mfPeek88');return !e||e.hidden})}
/* hints stay off when settings are re-applied */
o.hintsAfter=await pg.evaluate(()=>{applySettings(false);const a=HINTS;setHints(true);return [a,HINTS,showStrategy()]});
/* wallets: the table's purse is the acting player's; an owner window (the Ludus) bills the owner */
o.purse=await pg.evaluate(async()=>{const a=(await getPurse()||{}).name;const d=document.createElement('div');d.id='ludusBody';document.body.appendChild(d);d.click();const m=await activeMgr();const owner=!(m&&m.hotseat);d.remove();HS_OWNER_T=0;return {table:a,act:hsProf(cur().pid).name,owner}});
/* offers are addressed to the player who answers */
o.offer=await pg.evaluate(async()=>{const q=S.players.find(p=>!p.cpu&&p!==cur());const pr=hsAsk(q,()=>modal('Test offer','<p>offer</p>',[{label:'Accept',value:1},{label:'Refuse',value:0}]));await new Promise(r=>setTimeout(r,300));
  const t=document.getElementById('mTitle').textContent;const body=document.getElementById('mBody').textContent;CUR_MODAL.done(0);await pr;return {t,named:t.includes(hsProf(q.pid).name),pass:/pass the device/.test(body)}});
/* seat rules: your own gladiator only, on your turn; Take control asks who plays the CPU seat */
o.seats=await pg.evaluate(()=>{const me=cur();const other=S.players.find(p=>!p.cpu&&p!==me);const cpu=S.players.find(p=>p.cpu);return {mine:seatCanToggle(me),other:seatCanToggle(other),cpu:seatCanToggle(cpu)}});
await pg.evaluate(()=>{seatToggle(S.players.find(p=>p.cpu))});await W(500);
o.take=await pg.evaluate(()=>({t:document.getElementById('mTitle').textContent,opts:[...document.querySelectorAll('#mBtns button')].map(b=>b.textContent.trim())}));
await pg.evaluate(()=>{const bt=[...document.querySelectorAll('#mBtns button')].find(x=>/Bo/.test(x.textContent));bt.click()});await W(500);
o.taken=await pg.evaluate(()=>{const p=S.players[3];return {cpu:p.cpu,who:p.pid?hsProf(p.pid).name:'',seatList:S.hotseat.players.length,log:[...document.querySelectorAll('#log > li:not(#slogPin)')].slice(0,3).map(l=>l.textContent).join(' | ')}});
/* the truce decree: each bound player is asked; one "fight" breaks the truces */
o.decree=await pg.evaluate(async()=>{const pr=modal('Decree','<p>bound</p>',[{label:'Fight',value:'fight'},{label:'Thumb',value:'thumb'}],{close:'fight'});const ts=[];
  for(let i=0;i<4;i++){await new Promise(r=>setTimeout(r,250));if(!CUR_MODAL)break;ts.push(document.getElementById('mTitle').textContent);CUR_MODAL.done(i<2?'thumb':'fight')}
  return {v:await pr,ts}});
/* the table slot: names the players and who is to move; loading it is back in hot-seat mode */
o.slot=await pg.evaluate(async()=>{matchSlotPut('table',matchSnapshot(null));const sv=matchSlotGet('table');CFG.hotseat=false;HINTS=true;
  matchLoad('table');await new Promise(r=>setTimeout(r,600));for(let i=0;i<4&&CUR_MODAL;i++){CUR_MODAL.done(1);await new Promise(r=>setTimeout(r,300))}
  return {name:sv.name,sum:sv.summary,hot:!!CFG.hotseat,hints:HINTS,shs:!!S.hotseat,replay:!!(LAST_CFG&&LAST_CFG.hotseat),hub:/Hot-seat table/.test(matchSavesHTML())}});
for(let k=0;k<20;k++){await W(600);const t=await pg.evaluate(()=>{if(!CUR_MODAL&&cur()&&!cur().cpu&&(S.phase==='action'||S.phase==='choice'))return 'ok';if(CUR_MODAL){const bt=document.querySelector('#mBtns button');if(bt)bt.click()}return ''});if(t==='ok')break}
/* phones sideways (844×390): End turn stays on screen */
for(let k=0;k<12;k++){const ph=await pg.evaluate(()=>{if(S.phase==='action'&&!CUR_MODAL&&cur()&&!cur().cpu)return 'action';if(CUR_MODAL){const bt=document.querySelector('#mBtns button');if(bt)bt.click()}else{const bt=[...document.querySelectorAll('#actions button')].find(x=>/^Take/.test(x.textContent.trim()));if(bt)bt.click()}return S.phase});if(ph==='action')break;await W(700)}
await pg.setViewportSize({width:844,height:390});await W(1200);
await pg.evaluate(()=>{const bt=document.querySelector('#plDock [data-pl="act"]');if(bt&&!document.body.classList.contains('pl-act'))bt.click()});await W(800);
o.phone=await pg.evaluate(()=>{const e=document.querySelector('#actions [data-act="end"]');if(!e)return {none:1,body:document.body.className,ph:S.phase};const r=e.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
  return {body:document.body.className,top:Math.round(r.top),bottom:Math.round(r.bottom),vh:innerHeight,hit:!!(hit&&(hit===e||e.contains(hit))),pill:!!document.querySelector('#hsPill88:not([hidden])')}});
await pg.setViewportSize({width:1400,height:900});await W(800);
/* the players' books follow the Fate: a gladiator off the sand but spared (33 CF) lives and goes Into the Ludus */
o.fateBook=await pg.evaluate(async()=>{const p=S.players[0];const P=hsProf(p.pid);const d0=P.deaths,l0=P.ludus;const alive=p.alive;p.alive=false;
  await hsAfterEvent([{p,won:false,f:33,fate:['Survives · Ludus Flavius','x']}]);p.alive=alive;const Q=hsProf(p.pid);return {deaths:Q.deaths-d0,ludus:Q.ludus-l0,honor:!!Q.honors.ludus}});
o.ev0=await pg.evaluate(()=>Object.fromEntries(HS_PROFILES.map(p=>[p.name,p.events])));
/* ⏭ To the end asks every player, and the event still counts in every book */
await pg.evaluate(()=>{simToEnd()});const asks=[];
for(let k=0;k<6;k++){await W(400);const t=await pg.evaluate(()=>{if(!CUR_MODAL)return null;const t=document.getElementById('mTitle').textContent;if(/To the end/.test(t)){const bt=[...document.querySelectorAll('#mBtns button')].find(x=>/Agree/.test(x.textContent));bt.click();return t}return null});if(t)asks.push(t);else if(asks.length>=3)break}
o.asks=asks;
for(let k=0;k<240;k++){await W(1000);const over=await pg.evaluate(()=>!!(S&&S.over&&CUR_MODAL));if(over)break} /* a slow machine sims slowly */
for(let k=0;k<30;k++){await W(500);const n=await pg.evaluate(e0=>HS_PROFILES.filter(p=>p.events>(e0[p.name]||0)).length,o.ev0);if(n>=3)break}
o.over=await pg.evaluate(()=>({over:!!S.over,books:Object.fromEntries(HS_PROFILES.map(p=>[p.name,p.events])),save:!!document.querySelector('#mBody [data-save],#mBody [data-free]'),saveAll:[...document.querySelectorAll('#mBtns button')].some(b=>/Save all/.test(b.textContent)),you:/· You</.test(document.getElementById('mBody').innerHTML)}));
await W(3000);o.own1=await owner();
/* profile delete asks first, in the centred popup naming the profile */
await pg.evaluate(()=>{HS_PROFILES.push({id:'hpzz',name:'Zed',color:'#888',events:0,wins:0,cfTotal:0,cfBest:0,ludus:0,freed:0,deaths:0,coin:50,won:0,lost:0,bets:0,history:[],honors:{},classWins:[],locs:[],road:0});hsPersist();for(let i=0;i<4&&CUR_MODAL;i++)CUR_MODAL.done('close');});
await W(600);await pg.evaluate(()=>{hotSeatOpen()});await W(2500);
await pg.click('[data-hsdel="hpzz"]');await W(400);
o.del1=await pg.evaluate(()=>{const a=document.querySelector('.ask76bg');return {ask:!!a,txt:a?a.textContent:'',still:HS_PROFILES.some(p=>p.id==='hpzz')}});
await pg.click('.ask76bg [data-ask76="0"]');await W(300);o.keep=await pg.evaluate(()=>HS_PROFILES.some(p=>p.id==='hpzz'));
await pg.click('[data-hsdel="hpzz"]');await W(400);await pg.click('.ask76bg [data-ask76="1"]');await W(400);o.gone=await pg.evaluate(()=>!HS_PROFILES.some(p=>p.id==='hpzz')&&!JSON.parse(localStorage.getItem('flavius_hs')).some(p=>p.id==='hpzz'));
o.resumeBtn=await pg.evaluate(()=>!!document.querySelector('[data-hsresume]'));
console.log(JSON.stringify(o));
const chk={
  blank:/Name every player/.test(o.blank.err)&&!o.blank.live, dup:/own name/.test(o.dup.err)&&!o.dup.live&&!o.dup.prof.length,
  seatUI:o.seatUI.own===3&&o.seatUI.sav===0, clsName:o.clsName!=='Spartacus',
  profiles:JSON.stringify(o.live.prof)==='["Ann","Bo","Cy"]', names:o.live.pl[0].startsWith('Spartacus|Ann')&&o.live.pl[2].startsWith('Cy|Cy')&&!o.live.pl[1].startsWith('Bo|'),
  hints:o.live.hints===false&&o.live.strat===false&&o.hintsAfter[0]===false&&o.hintsAfter[1]===false&&o.hintsAfter[2]===false,
  pill:o.pill.txt.includes(o.pill.who)&&o.pill.txt.includes(o.pill.glad), labels:!o.labels.you&&o.labels.sub.includes(o.pill.who),
  mf:o.mf.mineBack&&o.mf.minePeek&&o.mf.otherBack&&!o.mf.otherPeek&&!o.mf.otherFace, peek:o.peekOn===true&&o.peekOff===true,
  purse:o.purse.table===o.purse.act&&o.purse.owner, offer:o.offer.named&&o.offer.pass,
  seats:o.seats.mine&&!o.seats.other&&o.seats.cpu, take:/Who takes/.test(o.take.t)&&o.take.opts.some(x=>/Ann/.test(x))&&!o.taken.cpu&&o.taken.who==='Bo'&&/Bo takes the reins/.test(o.taken.log),
  decree:o.decree.v==='fight'&&o.decree.ts.length===3&&o.decree.ts.every(t=>t.startsWith('🪑')),
  slot:/🪑/.test(o.slot.name)&&/to move/.test(o.slot.sum)&&o.slot.hot&&o.slot.hints===false&&o.slot.shs&&o.slot.replay&&o.slot.hub,
  phone:!o.phone.none&&/phoneL/.test(o.phone.body)&&o.phone.bottom<=o.phone.vh&&o.phone.hit&&o.phone.pill,
  fateBook:o.fateBook.deaths===0&&o.fateBook.ludus===1&&o.fateBook.honor,
  asks:o.asks.length===3, books:o.over.over&&o.over.books.Ann===o.ev0.Ann+1&&o.over.books.Cy===o.ev0.Cy+1&&o.over.books.Bo===o.ev0.Bo+2,
  noLudus:!o.over.save&&!o.over.saveAll&&!o.over.you, owner:JSON.stringify(o.own0)===JSON.stringify(o.own1),
  del:o.del1.ask&&/Zed/.test(o.del1.txt)&&o.del1.still&&o.keep&&o.gone, resume:o.resumeBtn};
const bad=Object.keys(chk).filter(k=>!chk[k]);console.log(bad.length?'FAIL '+bad.join(','):'PASS');console.log('ERRS',errs.slice(0,5));await b.close();process.exit(bad.length||errs.length?1:0)})();

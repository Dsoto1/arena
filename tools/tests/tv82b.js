/* v0.82 beasts: his printed beast cards (front + live info side, Tholo's numbers), generated fronts for the other beasts,
   custom beasts (unique tick, 1 or 3 states, spawn card in the deck through a roster-set slot, grid-dice spawn, a unique card
   leaves the deck), ≤4 beast cards with Tholo, the rulebook deck untouched, Event Designer slots (+ old deckSpawns conversion),
   the spawn show flip, spearing a spectator (scowl, refund float, extra Mandata — none when the Mandata deck is empty).
   SHOTS=dir saves beast_*.png screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:860}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const shots=process.env.SHOTS||'';const shot=async(n,sel)=>{if(!shots)return;try{if(sel){const e=await pg.$(sel);if(e){await e.screenshot({path:shots+'/'+n});return}}await pg.screenshot({path:shots+'/'+n})}catch(e){}};
/* 1. Tholo's card: his front, the info side with his numbers */
o.th=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}nc82Open('tholo','Tholo','Tholo');await new Promise(r=>setTimeout(r,200));const p=document.getElementById('nc82pop');
  const v=c=>[...p.querySelectorAll('.back .'+c)].map(x=>+x.textContent);
  return {front:!!p.querySelector('.face.f img[src*="npccard82_tholo"]'),back:!!p.querySelector('.back img[src*="npcback82_3"]'),ttl:(p.querySelector('.back .ttl')||{}).textContent,
    hp:v('vh'),a:v('va'),r:v('vr'),m:v('vm'),rules:(p.querySelector('.back .rules')||{}).textContent||''}});
ok(o.th.front&&o.th.back&&o.th.ttl==='Tholo','tholo card sides');ok(JSON.stringify(o.th.hp)==='[15,6,0]'&&JSON.stringify(o.th.a)==='[4,5,3]'&&JSON.stringify(o.th.r)==='[1,1,1]'&&JSON.stringify(o.th.m)==='[2,3,1]','tholo rows '+JSON.stringify(o.th));
ok(/arena center/.test(o.th.rules)&&/12 coin/.test(o.th.rules),'tholo rules text');
await pg.evaluate(()=>{const f=document.querySelector('#nc82pop .nc82flip');f.dataset.touched='1';f.classList.remove('flipped')});await pg.waitForTimeout(900);await shot('beast_tholo_front.png','#nc82pop .nc82flip');
await pg.evaluate(()=>document.querySelector('#nc82pop .nc82flip').classList.add('flipped'));await pg.waitForTimeout(900);await shot('beast_tholo_back.png','#nc82pop .nc82flip');
/* 2. a snake: generated front (no eye, its numbers), one-state info side */
o.sn=await pg.evaluate(async()=>{document.getElementById('nc82pop').remove();nc82Open('snake','Glykon','Glykon');const p=document.getElementById('nc82pop');p.querySelector('.nc82flip').dataset.touched='1';
  return {gen:!!p.querySelector('.nc82c.gen img.mini[src*="mini_glykon"]'),noeye:!!p.querySelector('.noeye'),sv:[...p.querySelectorAll('.gen .sv')].map(x=>+x.textContent),one:!!p.querySelector('img[src*="npcback82_1"]'),rows:p.querySelectorAll('.back .vh').length,nm:p.querySelector('.gen .nm').textContent}});
ok(o.sn.gen&&o.sn.noeye&&JSON.stringify(o.sn.sv)==='[1,1,1,3]'&&o.sn.one&&o.sn.rows===1&&o.sn.nm==='GLYKON','snake card '+JSON.stringify(o.sn));
await pg.waitForTimeout(300);await shot('beast_snake_front.png','#nc82pop .nc82flip');
/* 3. custom beasts: a unique 3-state one and a plain 1-state one */
o.cu=await pg.evaluate(async()=>{document.getElementById('nc82pop').remove();
  const a=Object.assign(blankNpc(),{id:'t82a',name:'Hippogriff',kind:'Hippogriff',kindKey:null,hp:14,ap:3,rng:1,mv:3,beh:'hunt',states:true,unique82:true,st82:[[10,3,1,3],[5,5,1,4],[0,2,1,1]]});
  const c=Object.assign(blankNpc(),{id:'t82b',name:'Swamp Rat',hp:4,ap:1,rng:1,mv:2,beh:'zone',states:false});
  await Store.put('customNpcs',a.id,a);await Store.put('customNpcs',c.id,c);CUSTOM.npcs=[...(CUSTOM.npcs||[]).filter(x=>!/^t82/.test(x.id)),a,c];registerCustoms();
  const A=NPCT.cn_t82a,C=NPCT.cn_t82b;
  return {aU:A.unique82,aS:A.states&&A.states.map(s=>s.slice(0,4)),cS:C.states,cU:C.unique82,card:CARDS.spawn_cn_t82a&&CARDS.spawn_cn_t82a.type,uq:UNIQUE_CARD82.cn_t82a,uqB:UNIQUE_CARD82.cn_t82b||null,
    html:/nc82arena/.test(cardHTML('c:spawn_cn_t82a','lg'))}});
ok(o.cu.aU===1&&JSON.stringify(o.cu.aS)==='[[10,3,1,3],[5,5,1,4],[0,2,1,1]]'&&o.cu.cS===null&&o.cu.cU===0,'custom states/unique '+JSON.stringify(o.cu));
ok(o.cu.card==='npc'&&o.cu.uq==='spawn_cn_t82a'&&o.cu.uqB===null&&o.cu.html,'custom spawn cards');
/* 4. the beast designer: unique tick, states select, rows, the card */
o.des=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));openStudio('npcs');await W8(600);ST.tab='npcs';ST.draft=JSON.parse(JSON.stringify(CUSTOM.npcs.find(x=>x.id==='t82a')));ST.view='edit';studioRedraw();await W8(300);
  const x={uq:!!document.querySelector('#studio input[data-st82="unique"]:checked'),sel:(document.querySelector('#studio select[data-st82="n"]')||{}).value,rows:document.querySelectorAll('#studio input[data-st82]').length-1,
    card:!!document.querySelector('#studio .nc82des .nc82pair .nc82c.gen')&&!!document.querySelector('#studio .nc82des .nc82pair .nc82c.back'),old:!!document.querySelector('#studio input[data-f="states"]')};
  const s=document.querySelector('#studio select[data-st82="n"]');s.value='1';s.dispatchEvent(new Event('change',{bubbles:true}));await W8(200);
  x.after=ST.draft.states;x.rows1=document.querySelectorAll('#studio .st82tbl').length;x.oneBack=!!document.querySelector('#studio .nc82des img[src*="npcback82_1"]');
  s.value;const s2=document.querySelector('#studio select[data-st82="n"]');s2.value='3';s2.dispatchEvent(new Event('change',{bubbles:true}));await W8(200);
  const u=document.querySelector('#studio input[data-st82="unique"]');u.click();await W8(150);x.uqOff=ST.draft.unique82;
  return x});
ok(o.des.uq&&o.des.sel==='3'&&o.des.rows===11&&o.des.card&&!o.des.old,'designer block '+JSON.stringify(o.des));ok(o.des.after===false&&o.des.rows1===0&&o.des.oneBack&&o.des.uqOff===false,'designer toggles '+JSON.stringify(o.des));
await pg.evaluate(()=>{document.querySelector('#studio .nc82des').scrollIntoView({block:'center'})});await pg.waitForTimeout(300);await shot('beast_designer.png');
await pg.evaluate(()=>{ST.draft.states=true;ST.draft.st82=[[10,3,1,3],[5,5,1,4],[0,2,1,1]];studioRedraw();document.querySelector('#studio .nc82des').scrollIntoView({block:'center'})});await pg.waitForTimeout(400);await shot('beast_custom_card.png','#studio .nc82des .nc82pair');
/* 5. roster sets: the Arena deck beasts row */
o.rs=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));
  const R={id:'rs82t',name:'Beast set',sel:{npcs:['t82a','t82b']},beasts82:['spawnLeo','spawn_cn_t82a','spawnCommodus']};CUSTOM.rosters=[...(CUSTOM.rosters||[]).filter(x=>x.id!=='rs82t'),R];
  ST.tab='rosters';ST.view='list';ST.rs77='rs82t';ST.rsd=JSON.parse(JSON.stringify(R));studioRedraw();await W8(300);
  const sels=[...document.querySelectorAll('#studio select[data-rs82]')];const x={n:sels.length,v:sels.map(s=>s.value),fix:!!document.querySelector('#studio .rs82 .slot82.fix'),opts:sels[0]?sels[0].options.length:0};
  sels[2].value='spawn_cn_t82b';sels[2].dispatchEvent(new Event('change',{bubbles:true}));await W8(150);x.after=ST.rsd.beasts82.join(',');
  ST.rsd.beasts82=['spawnLeo','spawn_cn_t82a','spawnCommodus'];studioRedraw();await W8(200);document.querySelector('#studio .rs82').scrollIntoView({block:'center'});
  ST.rs77='classic';studioRedraw();await W8(150);x.sysRow=!!document.querySelector('#studio .rs82 select[disabled]');ST.rs77='rs82t';studioRedraw();await W8(150);document.querySelector('#studio .rs82').scrollIntoView({block:'center'});return x});
ok(o.rs.n===3&&o.rs.v.join(',')==='spawnLeo,spawn_cn_t82a,spawnCommodus'&&o.rs.fix&&o.rs.opts===6&&o.rs.after==='spawnLeo,spawn_cn_t82a,spawn_cn_t82b'&&o.rs.sysRow,'roster row '+JSON.stringify(o.rs));
await pg.waitForTimeout(200);await shot('beast_roster_row.png','#studio .rs82');
/* 6. Event Designer: Tholo + 3 slots, a 4th when Tholo is off, old deckSpawns convert */
o.ed=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));ST.tab='events';ST.draft=blankEvent();ST.view='edit';ST.sub='roster';studioRedraw();await W8(300);
  const x={tholo:!!document.querySelector('#studio input[data-ed82="tholo"]:checked'),n:document.querySelectorAll('#studio select[data-ed82]').length,ticks:!!document.querySelector('#studio input[data-f="deckSpawns.Leo"]'),zora:!!document.querySelector('#studio input[data-f="deckSpawns.Zora"]')};
  const t=document.querySelector('#studio input[data-ed82="tholo"]');t.click();await W8(200);x.n4=document.querySelectorAll('#studio select[data-ed82]').length;
  const s3=document.querySelector('#studio select[data-ed82="3"]');s3.value='spawn_cn_t82b';s3.dispatchEvent(new Event('change',{bubbles:true}));await W8(200);
  const d=eventDef(ST.draft);x.pairs=JSON.stringify(d.slots82);x.noC=d.noCards.join(',');
  const old={id:'x',deckSpawns:{Leo:true,Leaena:false,Tholo:true,Commodus:true,Zora:true}};ed82Convert(old);x.conv=JSON.stringify(old.slots82);x.again=ed82Convert(old);
  document.querySelector('#studio .slot82row').scrollIntoView({block:'center'});return x});
ok(o.ed.tholo&&o.ed.n===3&&!o.ed.ticks&&o.ed.zora&&o.ed.n4===4,'designer slots '+JSON.stringify(o.ed));
ok(o.ed.pairs==='[["spawnTholo","spawn_cn_t82b"],["spawnLeo","spawnLeo"],["spawnLeaena","spawnLeaena"],["spawnCommodus","spawnCommodus"]]'&&o.ed.noC==='','designer def '+o.ed.pairs+' '+o.ed.noC);
ok(o.ed.conv==='{"tholo":true,"s":["spawnLeo","","spawnCommodus",""]}'&&o.ed.again===false,'deckSpawns convert '+o.ed.conv);
await pg.waitForTimeout(200);await shot('beast_designer_slots.png','#studio #edPane');
/* 7. decks: the rulebook untouched; a roster set's slot puts the custom beast in a Classic */
const deckOf=async(roster,ev)=>pg.evaluate(async([roster,ev])=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);for(let i=0;i<5&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(80)}
  CFG.roster=roster;S_SEED_TMP=12345;startEvent({ev,loc:6,seats:[{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:1,mandata:true}});await W8(400);SPEED='pause';
  const all=[...S.deck,...(S.round2||[])];return {beasts:deckBeasts82(all).sort(),len:all.length}},[roster,ev]);
o.d0=await deckOf('classic','democritus');o.d1=await deckOf('rs82t','democritus');o.dJ=await deckOf('rs82t','juggernaut');
ok(o.d0.beasts.join(',')==='spawnCommodus,spawnLeaena,spawnLeo,spawnTholo','rulebook deck '+JSON.stringify(o.d0));
ok(o.d1.beasts.join(',')==='spawnCommodus,spawnLeo,spawnTholo,spawn_cn_t82a'&&o.d1.len===o.d0.len,'roster slot deck '+JSON.stringify(o.d1));
ok(!o.dJ.beasts.includes('spawnTholo')&&!o.dJ.beasts.includes('spawnCommodus')&&o.dJ.beasts.includes('spawn_cn_t82a')&&o.dJ.beasts.length<=4,'juggernaut deck '+JSON.stringify(o.dJ));
o.d1=await deckOf('rs82t','democritus');
ok(o.d1.beasts.length<=4&&o.d1.beasts.includes('spawnTholo'),'≤4 with Tholo');
/* 8. the unique custom beast enters by the grid dice; its card leaves the deck; never twice. The plain one comes from a drawn card. */
o.sp=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));S.phase='action';SPEED='normal';if(CUR_MODAL)CUR_MODAL.done(null);
  const st=document.createElement('style');st.id='slow82';st.textContent='.bs82card .nc82flip .in{transition-duration:2.4s!important}';document.head.appendChild(st);
  const g0=gridRoll;let rolls=0;gridRoll=function(){rolls++;return g0.apply(this,arguments)};
  const n=spawnNPC('cn_t82a','Hippogriff',null);gridRoll=g0;
  const x={ok:!!n,rolls,inDeck:S.deck.includes('spawn_cn_t82a'),twice:spawnNPC('cn_t82a','Hippogriff',null)===null,spent:bossSpent('cn_t82a')};
  S.deck.push('spawn_cn_t82b');const before=S.npcs.filter(q=>q.t==='cn_t82b').length;await resolveDrawn(S.players[0],S.deck.pop());x.rat=S.npcs.filter(q=>q.t==='cn_t82b').length-before;
  await W8(1500);x.show=!!document.querySelector('#bs82 .bs82card.in .nc82flip');
  render();const row=document.querySelector('#npcPanel [data-nc82]');x.row=!!row;if(row){row.click();await W8(150);x.pop=!!document.querySelector('#nc82pop .nc82flip');document.getElementById('nc82pop')&&document.getElementById('nc82pop').remove()}
  return x});
ok(o.sp.ok&&o.sp.rolls>=1&&!o.sp.inDeck&&o.sp.twice&&o.sp.spent&&o.sp.rat===1,'custom spawn '+JSON.stringify(o.sp));ok(o.sp.show,'spawn show');ok(o.sp.row&&o.sp.pop,'field row opens the card');
if(shots){await pg.evaluate(()=>{const h=document.getElementById('bs82');if(h)h.innerHTML='';BS82.q=[];BS82.busy=false;SPEED='pause';beastShow82(S.npcs.find(n=>n.t==='cn_t82a'))});
  await pg.waitForFunction(()=>document.querySelector('.bs82card.in'),null,{timeout:8000}).catch(()=>{});await pg.waitForTimeout(600);await shot('beast_spawn_art.png');
  await pg.waitForFunction(()=>document.querySelector('.bs82card .nc82flip.flipped'),null,{timeout:8000}).catch(()=>{});await pg.waitForTimeout(250);await shot('beast_spawn_midflip.png');
  await pg.waitForTimeout(2600);await shot('beast_spawn_info.png');await pg.evaluate(()=>{SPEED='normal'})}await pg.evaluate(()=>{const s=document.getElementById('slow82');if(s)s.remove()});
/* 9. spearing a spectator */
o.spr=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(BS82.q.length)BS82.q.pop();const p=S.players[0];
  if(!S.spect.length)return {none:1};SETTINGS.flavius=true;FLAV.until=0;
  const hit=async()=>{for(let i=0;i<40;i++){const s=S.spect.find(x=>!x.gone);if(!s)return null;p.cf=20;p.spearUsed=false;await doSpear(p,s);if(s.gone)return s}return null};
  const mf=()=>p.items.filter(x=>x.kind==='mf').length;const m0=mf();const s=await hit();
  const x={hit:!!s,mood:FLAV.mood,line:FLAV.line,float:!!document.querySelector('.flref82'),floatTxt:(document.querySelector('.flref82')||{}).textContent,mf:mf()-m0,
    log:[...document.querySelectorAll('#log li')].some(li=>/draws a Mandati Flavi \(Mandate from Flavius\)/.test(li.textContent))};
  S.mfDeck82=[];const m1=mf();await hit();x.mfEmpty=mf()-m1;return x});
ok(o.spr.hit&&o.spr.mood==='angry'&&SPEAR_OK(o.spr.line)&&o.spr.float&&/−3/.test(o.spr.floatTxt)&&o.spr.mf===1&&o.spr.log,'spear '+JSON.stringify(o.spr));
ok(o.spr.mfEmpty===0,'spear with an empty Mandata deck');
function SPEAR_OK(l){return ['My spectators are not targets!','Who pays for that seat now?'].includes(l)}
console.log(JSON.stringify(o).slice(0,1500));
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

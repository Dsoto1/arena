/* v0.77 Studio tidy: roster sets as a deck builder, rail order + counts, All creations first tiles + Play Now set column,
   Names pin/use, Spectators groups, Editors progress bar, Invitational steps, tournament 🎮 You toggle, one-line intros */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openStudio('all')});await pg.waitForTimeout(1500);
const r={};const q=(s,a)=>pg.evaluate(s,a);
r.first=await q(()=>document.querySelectorAll('#studio .st77f').length>=10);
r.railTop=await q(()=>{const g=document.querySelector('#studio .railgrp');return !!g&&!!g.querySelector('[data-v="rosters"]')});
await q(()=>{const c=blankChar();c.id='c77a';c.name='Marcus Ferox';charFromClass(c,'hero');CUSTOM.chars.push(c);const w=blankCW();w.id='w77';w.name='Fang of Nemausus';w.stats.p=3;w.stats.r=2;CUSTOM.weapons=[w];gearRebuild();ST.tab='all';studioRedraw()});await pg.waitForTimeout(300);
r.count=await q(()=>(document.querySelector('#studio [data-st="tab"][data-v="chars"] .st77c')||{}).textContent==='1');
r.col=await q(()=>[...document.querySelectorAll('#studio table.tally th')].some(t=>/Play Now set/.test(t.textContent)));
/* roster sets */
await pg.click('[data-st="tab"][data-v="rosters"]');await pg.waitForTimeout(400);
r.sets=await q(()=>document.querySelectorAll('.rs77set').length>=3&&!!document.querySelector('[data-rs77t="chars|c77a"]'));
await pg.click('[data-rs77t="chars|c77a"]');await pg.waitForTimeout(250);await pg.click('[data-rs77t="weapons|w77"]');await pg.waitForTimeout(250);
r.tile=await q(()=>ST.rsd.sel.chars.includes('c77a')&&ST.rsd.sel.weapons.includes('w77')&&document.querySelector('[data-rs77t="chars|c77a"]').classList.contains('on')&&/1 character, 1 weapon/.test(document.querySelector('.rs77sum').textContent));
await pg.fill('[data-rsf="name"]','Ferox league');await pg.click('[data-rs="save"]');await pg.waitForTimeout(500);
r.saved=await q(()=>(CUSTOM.rosters||[]).some(x=>x.name==='Ferox league'&&x.sel.chars.includes('c77a'))&&[...document.querySelectorAll('.rs77set')].some(x=>/Ferox league/.test(x.textContent)));
const rid=await q(()=>CUSTOM.rosters.find(x=>x.name==='Ferox league').id);await pg.click(`[data-rs="useplay"][data-v="${rid}"]`);await pg.waitForTimeout(300);
r.use=await q(id=>CFG.roster===id&&/Play Now/.test(document.querySelector('.rs77set.on').textContent),rid);
await pg.click('[data-rs77open="classic"]');await pg.waitForTimeout(300);r.ro=await q(()=>!!document.querySelector('.rs77open [data-rs="copy"][data-v="classic"]')&&!document.querySelector('.rs77open [data-rsf]'));
await pg.fill('#rs77q','').catch(()=>{});
/* names */
await q(()=>localStorage.removeItem('flavius_namepins77'));await pg.click('[data-st="tab"][data-v="names"]');await pg.waitForTimeout(400);
const nm=await q(()=>document.querySelector('[data-nm77pin]').dataset.nm77pin);await pg.click('#ngList [data-nm77pin]');await pg.waitForTimeout(300);
r.pin=await q(n=>nm77Pins().includes(n)&&!!document.querySelector('.nm77pins'),nm);
await pg.click('.nm77pins [data-nm77use]');await pg.waitForTimeout(400);r.useName=await q(n=>ST.tab==='chars'&&ST.view==='edit'&&ST.draft&&ST.draft.name===n,nm);
/* spectators, editors, invitationals, tournaments */
await pg.click('[data-st="tab"][data-v="spect"]');await pg.waitForTimeout(400);r.spect=await q(()=>document.querySelectorAll('#studio .sp77h').length===2&&!!document.querySelector('#studio p.intro77 .qi'));
await pg.click('[data-st="tab"][data-v="sponsors"]');await pg.waitForTimeout(400);r.ed=await q(()=>!!document.querySelector('.ed77bar')||typeof creatorUnlocked==='function'&&creatorUnlocked());
await pg.click('[data-st="tab"][data-v="specials"]');await pg.waitForTimeout(400);r.sx=await q(()=>document.querySelectorAll('#studio .sx77h').length>=4&&/① Arena/.test(document.getElementById('studio').textContent));
await pg.click('[data-st="tab"][data-v="tourneys"]');await pg.waitForTimeout(400);r.tn=await q(()=>document.querySelectorAll('.tseat label.tn77you').length>=4&&/You/.test(document.querySelector('.tseat label.tn77you').textContent));
/* phones: the sets stack over the bench */
await pg.setViewportSize({width:420,height:900});await pg.click('[data-st="tab"][data-v="rosters"]').catch(()=>{});await q(()=>{ST.tab='rosters';studioRedraw()});await pg.waitForTimeout(400);
r.phone=await q(()=>{const a=document.querySelector('.rs77sets'),o=document.querySelector('.rs77open');return !!a&&!!o&&o.getBoundingClientRect().top>=a.getBoundingClientRect().bottom-2});
await q(()=>{CUSTOM.rosters=(CUSTOM.rosters||[]).filter(x=>x.name!=='Ferox league');CFG.roster='classic'});
const miss=Object.entries(r).filter(([k,v])=>!v).map(([k])=>k);console.log(JSON.stringify(r));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

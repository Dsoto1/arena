const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false})});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);for(let i=0;i<30;i++){await pg.waitForTimeout(400);if(await pg.evaluate(()=>!!document.getElementById('frhAll')))break}const fails=[];const ok=(c,m)=>{if(!c)fails.push(m)};
/* first run: hints off + welcome */
const fr=await pg.evaluate(()=>({hints:SETTINGS.hints,turn:SETTINGS.turnHints,title:(document.getElementById('mTitle')||{}).textContent,open:!document.getElementById('modal').hidden}));
ok(fr.hints===false&&fr.turn===false,'hints default off '+JSON.stringify(fr));ok(/Welcome/.test(fr.title)&&fr.open,'welcome prompt '+fr.title);
await pg.evaluate(()=>{const a=document.getElementById('frhAll');a.checked=true;a.dispatchEvent(new Event('change',{bubbles:true}))});
const fr2=await pg.evaluate(()=>({hints:SETTINGS.hints,turn:SETTINGS.turnHints}));ok(fr2.hints&&fr2.turn,'welcome toggles hints');
await pg.evaluate(()=>{CUR_MODAL.done('play')});await pg.waitForTimeout(500);
/* rules data */
const rd=await pg.evaluate(()=>({tri:EVENTS.triumviratus.rounds[0],fam:EVENTS.familia.rounds[0].cf,lud:EVENTS.ludus.rounds[0],ch:EVENTS.chariot.rounds[0].cf,na:EVENTS.naumachia.rounds[0].pve}));
ok(rd.tri.end==='elim1'&&rd.tri.cf&&rd.tri.ca,'triumviratus');ok(rd.fam===0,'familia cf');ok(rd.lud.end==='rot10'&&rd.lud.cf===1,'ludus');ok(rd.ch===0,'chariot cf');ok(rd.na===0,'naumachia pve');
/* tooltip placement: beside, pointer-events none */
await pg.hover('#mainMenu [data-mm="play"]');await pg.waitForTimeout(1200);
const tt=await pg.evaluate(()=>{const t=document.querySelector('.tt[role="tooltip"]');const a=document.querySelector('#mainMenu [data-mm="play"]');if(!t)return null;const r=t.getBoundingClientRect(),q=a.getBoundingClientRect();return {pe:t.style.pointerEvents,beside:r.left>=q.right-1||r.right<=q.left+1}});
ok(!tt||tt.beside,'tooltip beside '+JSON.stringify(tt));
await pg.mouse.move(3,3);
/* horns reach the sand */
await pg.click('#mainMenu [data-mm="play"]');await pg.waitForTimeout(900);await pg.evaluate(()=>{[...document.querySelectorAll('#mBody button,#mBtns button')].find(b=>/New event/.test(b.textContent)).click()});await pg.waitForTimeout(1200);
await pg.click('#goBtn');let arena=false;for(let i=0;i<20;i++){await pg.waitForTimeout(300);const st=await pg.evaluate(()=>{if(!document.getElementById('modal').hidden&&!document.getElementById('goBtn')){const b=document.querySelector('#mBtns button.primary')||document.querySelector('#mBtns button');b&&b.click()}return {menu:!document.getElementById('mainMenu').hidden,ph:S&&S.phase}});if(st.ph&&st.ph!=='setup'&&!st.menu){arena=true;break}}
ok(arena,'horns → arena');
/* arena chrome */
const ch=await pg.evaluate(()=>({tray:!!document.querySelector('#speedTray .speedseg'),shown:[...document.querySelectorAll('#speedTray [data-speed]')].filter(b=>getComputedStyle(b).display!=='none').length,menag:!document.getElementById('btnDrawB').hidden&&!!document.querySelector('.navmid #btnDrawB'),save:!!document.querySelector('#navDrawer #btnMSave'),ev:document.getElementById('btnEvInfo').textContent,tools:!document.getElementById('cTools').classList.contains('open'),hintBtn:!!document.getElementById('btnHintsM')}));
ok(ch.tray&&ch.shown===1,'speed tray '+ch.shown);ok(ch.menag,'menagerie in nav');ok(ch.save,'save in drawer');ok(/Event Details/.test(ch.ev),'event details');ok(ch.tools&&ch.hintBtn,'tools drawer');
await pg.click('#ctTog');const op=await pg.evaluate(()=>document.getElementById('cTools').classList.contains('open'));ok(op,'tools open');
await pg.click('#btnHintsM');const hm=await pg.evaluate(()=>SETTINGS.hints);ok(hm===false,'hints master toggled off');
/* keys ⓘ, log tiles */
const kb=await pg.evaluate(()=>{const h=boardHTML(S.players[0],true);return {keys:/Keys ⓘ/.test(h),tro:/Trophies ⓘ/.test(h)&&!/Trophies ▸/.test(h)}});ok(kb.keys&&kb.tro,'stat ⓘ');
const mv=await pg.evaluate(async()=>{const p=S.players[0];const r0=p.r,c0=p.c;const [lg0]=[document.getElementById('log').children.length];placeFloor('offer','elix2',3,3);log('An offering lands.');return document.querySelector('#log > li:not(#slogPin)').textContent});ok(/D-4|\([A-M]-\d+\)/.test(mv),'spawn tile '+mv);
/* stones & Damnatio */
const dm=await pg.evaluate(async()=>{const q=S.players.find(p=>p.alive);q.abil='stone';q.wR={...W.sling,key:'sling',ammoLeft:2};const before=q.wR.ammoLeft;const s={name:'x',sec:0,cf:10,_x:null};const H=hurt;hurt=async()=>{};try{await spectStone(s,q)}finally{hurt=H}return [before,q.wR.ammoLeft]});ok(dm[1]===dm[0]+1,'damnatio stone '+dm);
/* transit bar */
const tb=await pg.evaluate(()=>{transitRun(()=>{},'x');const t=document.querySelector('.transit');return {bar:!!t.querySelector('.tbar i'),q:(t.querySelector('.tquote')||{}).textContent}});ok(tb.bar&&tb.q,'transit bar/quote');
console.log(JSON.stringify({fails}));console.log('ERRS',errs.slice(0,4));await b.close();process.exit(fails.length||errs.length?1:0)})();

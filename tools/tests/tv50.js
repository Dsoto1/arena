const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});const o={};
o.menuTips=await pg.evaluate(()=>[...document.querySelectorAll('#mainMenu .mmbtns [data-mm]')].slice(0,4).map(b=>b.textContent.trim()+'|'+(b.dataset.tip||'').slice(0,20)));
await pg.hover('#mainMenu [data-mm="play"]');await pg.waitForTimeout(600);o.menuTT=await pg.evaluate(()=>(document.querySelector('.tt')||{}).textContent||null);
await pg.mouse.move(5,5);await pg.waitForTimeout(500);
/* zora + ach */
o.zora=await pg.evaluate(async()=>{menuHide();const seats=[{cls:'venatore',cpu:true},{cls:'hero',cpu:true},{cls:'slave',cpu:true},{cls:'soldier',cpu:true}];const r=await simEvent({ev:'democritus',loc:6,seats,opts:{}},{timeoutMs:30000}).catch(e=>null);
  newState({ev:'democritus',loc:6,seats:seats.map(s=>({...s,diff:'normal'})),opts:{}});const v=S.players[0];const a={card:v.items.filter(i=>i.key==='zora').length,deck:(S.deck||[]).filter(k=>k==='zora').length,btn:v.zoraUsed>=v.abilVal};
  newState({ev:'democritus',loc:6,seats:seats.map(s=>({...s,diff:'normal'})),opts:{zoraCard:true}});a.deckOpt=(S.deck||[]).filter(k=>k==='zora').length;S.over=true;return a});
o.ach=await pg.evaluate(async()=>{const A=await achLoad();A.events=24;delete A.got.veteran;await Store.put('hall','ach',A);localStorage.removeItem('flavius_ach_ev');const L=JSON.parse(localStorage.getItem('flavius_ach_got')||'{}');delete L.veteran;localStorage.setItem('flavius_ach_got',JSON.stringify(L));window.ACH_GOT&&delete window.ACH_GOT.veteran;
  S={...S,sim:false,simmed:1,npcs:[],over:true};const hall={killed:[],locs:[]};await achievementsAfterEvent([],hall);const A1=await achLoad();const e1=A1.events;
  S.simmed=0;await achievementsAfterEvent([],hall);const A2=await achLoad();const g1=!!A2.got.veteran;await new Promise(r=>setTimeout(r,1500));
  /* the store answers with a stale copy: veteran must not be granted again */
  const stale={...A2,got:{...A2.got}};delete stale.got.veteran;await Store.put('hall','ach',stale);let again=0;const _t=mToast;mToast=h=>{if(/Sand in the Sandals/.test(h))again++;_t(h)};await achievementsAfterEvent([],hall);await new Promise(r=>setTimeout(r,1200));mToast=_t;return {simmedEv:e1,granted:g1,again}});
/* nav drawer */
o.nav=await pg.evaluate(()=>{const nr=document.getElementById('navRight');const d=document.getElementById('navDrawer');const vis0=getComputedStyle(d).visibility;document.getElementById('navTog').click();return {vis0,open:nr.classList.contains('open'),menuVis:getComputedStyle(document.getElementById('btnMenu')).display}});
await pg.waitForTimeout(400);await pg.screenshot({path:'shot_nav50.png',clip:{x:700,y:0,width:740,height:120}});
await pg.evaluate(()=>{document.getElementById('navTog').click()});
/* letters only in Your ludus */
o.letters=await pg.evaluate(()=>{openManager();return 1});await pg.waitForTimeout(800);await pg.click('[data-mg="create"]');await pg.waitForTimeout(300);await pg.click('[data-mg="nmgo"]');await pg.waitForTimeout(900);
o.letters=await pg.evaluate(()=>{const w=W_(),pm=me();rosterOf(pm).forEach(g=>g.contract=null);const o0=opinionOf;opinionOf=()=>({v:60});emptyBarracksWeek(w,pm);opinionOf=o0;const r={};for(const t of ['ludus','recruit','paper','night','roster']){MGR.tab=t;MGR_REDRAW();const h=document.getElementById('mgrPane').innerHTML;r[t]=[/A letter from/.test(h),/Quaestor/.test(h)]}return r});
console.log(JSON.stringify(o));console.log('ERRS',errs.slice(0,4));await b.close()})();

/* v0.90 part C: Play Now setup tidy (Options under the event card, spectators below, no Rules in this build / Presets, Begin Event in
   the top bar starts the event, 🎲 Random event rolls event + city + class) and the Version history in tabs of ten versions. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const o=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);openSetup(true);await W8(1500);const r={};
  const q=s=>document.querySelector('#mBody '+s);
  r.optUnder=!!q('.pn-bands .pn-big + .pn-optw90 details.optfold #oMandata')&&!!q('.pn-optw90 #oSeed');
  /* v1.0 (300-v100pn): Options are their own panel right under the event panel */
  if(q('.pn100'))r.optUnder=!!q('.pn100ev + .pn100opt .pn100optg #oMandata')&&!!q('.pn100opt #oSeed');
  /* v0.92: the spectator options live in the Stands card beside the seats (205-v92pn), still apart from Options */
  r.spectBelow=!!q('.pn-who .stands92 #oSpectMode')&&!q('.pn-optw90 #oSpectMode')&&!q('.pn-optw90 .spectme')&&!q('.pn100opt #oSpectMode');
  r.noRules=!document.getElementById('rulesBtn2')&&![...document.querySelectorAll('#mBody button')].some(x=>/Rules in this build/.test(x.textContent));
  r.noPre=!q('[data-pnpre]')&&!q('[data-pnquick]')&&![...document.querySelectorAll('#mBody button')].some(x=>/Presets/.test(x.textContent));
  const g=q('.pn-top .pn-acts #goBtn');r.begin=!!g&&/Begin Event/.test(g.textContent)&&!q('.pn-start #goBtn');
  /* the other setup tabs lose Rules in this build too */
  document.querySelector('#mBody [data-mode="festival"]').click();await W8(400);r.festNo=!document.getElementById('rulesBtn2')&&!!document.getElementById('goBtn');
  document.querySelector('#mBody [data-mode="event"]').click();await W8(400);
  /* 🎲 Random event: five rolls */
  const seen=[];for(let i=0;i<5;i++){q('[data-pnrand90]').click();await W8(250);const you=CFG.seats.slice(0,CFG.n).filter(s=>!s.cpu);
    seen.push({ev:CFG.ev,loc:CFG.loc,cls:you.length===1?you[0].cls:null,cpu:CFG.seats.slice(1,CFG.n).every(s=>s.cpu),ok:!!EVENTS[CFG.ev]&&!EVENTS[CFG.ev].custom&&!!LOCATIONS[CFG.loc]&&!!CLASSES[you[0]&&you[0].cls],on:!!q(`.pn-ev.on[data-pnev="${CFG.ev}"]`)})}
  r.rand=seen.every(s=>s.ok&&s.cpu&&s.on)&&new Set(seen.map(s=>s.ev)).size>=3&&new Set(seen.map(s=>s.loc)).size>=3&&seen.slice(1).every((s,i)=>s.ev!==seen[i].ev&&s.loc!==seen[i].loc);r.seen=seen;
  return r});
/* Begin Event starts the chosen event */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const s=document.getElementById('evSel');s.value='democritus';s.dispatchEvent(new Event('change',{bubbles:true}));await W8(400)});
await pg.evaluate(()=>{window.__S0=typeof S!=='undefined'?S:null});await pg.click('#mBody .pn-top #goBtn');
o.started=await pg.waitForFunction(()=>typeof S!=='undefined'&&S&&S.players&&S.players.length>=2&&!S.over&&S.evKey==="democritus"&&S!==window.__S0,null,{timeout:15000}).then(()=>true).catch(()=>false);
/* Version history: tabs of ten, newest first */
o.h=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}S.over=true;
  showRules('hist');await W8(1000);const r={};const box=document.querySelector('#rulTab-hist .h90');const tabs=box?[...box.querySelectorAll('[data-h90]')]:[];
  r.n=tabs.length;r.labels=tabs.map(t=>t.textContent);const NUM=(v=>{const q=String(v).match(/(\d+)\.(\d+)/);return (+q[1])*100+(+q[2])});const top=Math.ceil(NUM(MILESTONES[0].v)/10);r.want=top;r.newest=r.labels[0]===`${(top-1)*10+1}–${top*10>=100?'1.0':top*10}`&&tabs[0].classList.contains('on')&&r.labels[top-1]==='1–10';
  const vis=()=>[...box.querySelectorAll('[data-h90p]')].filter(p=>!p.hidden);r.firstOnly=vis().length===1&&[...vis()[0].querySelectorAll('.msv')].every(x=>{const m=NUM(x.textContent);return m>=(top-1)*10+1&&m<=top*10});
  r.firstHas=vis()[0]&&vis()[0].querySelector('.msv').textContent==='v'+MILESTONES[0].v;
  let each=true;for(const t of tabs){t.click();await W8(80);const v=vis();const k=+t.dataset.h90;if(v.length!==1)each=false;else[...v[0].querySelectorAll('.msv')].forEach(x=>{const m=NUM(x.textContent);if(m<k*10+1||m>k*10+10)each=false});if(!v[0]||!v[0].querySelector('.h90c'))each=false}
  r.each=each;const all=[...box.querySelectorAll('.msv')].length;r.all=all===MILESTONES.length;
  const rng=box.querySelector('[data-hv90="0.6–0.11"]');r.ranged=!!rng&&rng.closest('[data-h90p]').dataset.h90p==='0'&&!!box.querySelector('[data-h90p="2"] [data-hv90="0.30–0.32"]');
  r.short=MILESTONES.filter(m=>/^0\.\d+$/.test(m.v)&&+m.v.split('.')[1]>=52).every(m=>m.hi.length<=4&&(m.fx||[]).length<=1);
  /* What's new opens Version history on the tabs */
  CUR_MODAL&&CUR_MODAL.done(null);await W8(300);verNotes79();await W8(500);r.wn=!!document.querySelector('#modal .mstone.big')&&/0\.89|0\.9/.test((document.querySelector('#modal .mstone.big .msv')||{}).textContent||'');
  const hb=[...document.querySelectorAll('#mBtns button')].find(x=>/Version history/.test(x.textContent));if(hb)hb.click();await W8(900);r.viaNotes=!!document.querySelector('#rulTab-hist:not([hidden]) .h90 [data-h90].on');
  CUR_MODAL&&CUR_MODAL.done(null);return r});
const R=o.h;ok(o.optUnder,'Options under the event card');ok(o.spectBelow,'spectator options stay below');ok(o.noRules&&o.festNo,'no Rules in this build');ok(o.noPre,'no Presets / Quick start');
ok(o.begin,'Begin Event in the top bar');ok(o.started,'Begin Event starts the event');ok(o.rand,'Random event rolls event + city + class');
ok(R.n===R.want&&R.newest,'one tab per ten versions, newest first '+JSON.stringify(R.labels));ok(R.firstOnly&&R.firstHas&&R.each&&R.all,'each tab only its versions');ok(R.ranged,'ranged entry in its first version tab');ok(R.short,'entries cut to 3–4 bullets');ok(R.viaNotes,'What\'s new → Version history');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

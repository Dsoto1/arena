/* v0.98 (250-v98bears): the Ursa / Brutum arena cards name this arena's bears (Syracusae = Ortygia, Roma = Ursa). */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const start=loc=>pg.evaluate(async(loc)=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  SETTINGS.briefing=false;try{applySettings()}catch(e){}
  const seats=['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:i!==0}));
  startEvent({ev:'democritus',loc,seats,opts:{spect:0}});
  for(let i=0;i<150;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase)break}
  SPEED='pause';return !!S},loc);
const probe=()=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};
  cardShow('c:ursa',S.players[0],'Drawn');cardShow('c:brutum',S.players[0],'Drawn');await W8(200);
  o.show=document.querySelector('#cardShow').innerHTML;o.label=cardLabel('c:ursa');o.text=cardText('c:ursa')+' | '+cardText('c:brutum');
  o.n=CARDS.ursa.n+' | '+CARDS.brutum.n;o.d=CARDS.ursa.d;o.hash=JSON.stringify(S).includes('Aggros');return o});
ok(await start(1),'syracusae started');
const s=await probe();
ok(/Ortygia/.test(s.n)&&!/Ursa/.test(s.n),'syracusae title: '+s.n);
ok(/Ortygia/.test(s.text)&&!/Ursa/.test(s.text),'syracusae hover text: '+s.text);
ok(/Ortygia/.test(s.label)&&!/Ursa/.test(s.label)&&!/Ursa|Brutum/.test(s.show),'syracusae card show/label: '+s.label);
ok(await start(6),'roma started');
const r=await probe();
ok(/Ursa Aggros You!/.test(r.n)&&/Brutum Aggros You!/.test(r.n),'roma title: '+r.n);
ok(/Ursa's aggro token/.test(r.d),'roma text: '+r.d);
ok(/Ursa/.test(r.text),'roma hover');
console.log(miss.length?'FAIL '+miss.join(' ; '):'tv98bear OK');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

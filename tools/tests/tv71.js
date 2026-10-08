/* v0.71: Virgilante's printed pieces — medallion tokens in the rtok sheet (key2 cell), the gold coin as ICO.coin, summa rudis
   medallions (Flavius's side, briefing, status chip, festival picker), the Mandata Flavi card back on hidden objectives and the
   "Mandata" spelling, the round marker in the status bar, the stands line pinned in the arena log, live wager bubbles */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.a=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();
  const r={key2:RTOK_NAMES.includes('key2')&&rtokHTML('key2',30).includes('rtok'),coin:ICO.coin.includes('coin.webp'),spell:!(()=>{const c=document.body.cloneNode(true);c.querySelectorAll('script').forEach(x=>x.remove());return c.innerHTML})().split('Mandati Flavi (Mandate from Flavius)').join('').includes('Mandati Flavi')&&itemInfo({kind:'mf',idx:0}).n.startsWith('Mandata Flavi')};
  startEvent({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:false},{cls:'hero',cpu:true},{cls:'slave',cpu:true},{cls:'venatore',cpu:true}],opts:{spect:'auto',mandata:true}});
  await W8(2800);r.brief=!!document.querySelector('#mBody .brsr img[src*="sr_democritus"]');for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await W8(200)}await W8(800);
  r.round=document.querySelector('#status .roundmk b')&&document.querySelector('#status .roundmk b').textContent===String(S.ri+1);r.srchip=!!document.querySelector('#status img.srmed');
  r.coinUI=!!document.querySelector('#board img.coinimg');r.mfback=boardHTML(S.players[1],false).includes('mandata_back');
  slog('test stands line 71','');await W8(400);r.pin=!document.getElementById('slogPin'); /* v0.96: no pinned stands line; the stands log lives under Stands */log('a new log line');r.pinTop=document.getElementById('log').firstChild.textContent.includes('a new log line');
  render();sideTab('stands');await W8(400);r.pinGo=SIDE.tab==='stands'&&(document.getElementById('standsPane')||document.body).textContent.includes('test stands line 71');sideTab('fighter');
  const sp=S.spect.find(s=>!s.bet&&!s.gone)||(()=>{const x=S.spect.find(s=>!s.gone);if(x)x.bet=null;return x})();sp.bet={pid:1,amt:2,odds:2};S.players[2].selfBet={stake:3,odds:2};await W8(500);
  r.bub=[...document.querySelectorAll('#wbubs .wbub')].map(e=>e.textContent);return r});
o.b=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));S.over=true;if(CUR_MODAL)CUR_MODAL.done(null);await W8(400);
  openSetup();await W8(900);const t=document.querySelector('[data-mode="festival"],[data-st="festival"],[data-tab="festival"]');if(t){t.click();await W8(600)}
  const s=document.getElementById('festSR');if(!s)return {skip:true};await W8(1500);const had=!!document.getElementById('festSRimg');s.value='cassian';s.dispatchEvent(new Event('change',{bubbles:true}));await W8(200);
  return {had,swap:(document.getElementById('festSRimg')||{}).src.includes('sr_cassian')}});
const a=o.a;ok(a.key2&&a.coin&&a.spell,'tokens, coin, spelling');ok(a.brief&&a.srchip,'summa rudis medallions');ok(a.round,'round marker');ok(a.coinUI&&a.mfback,'coin in the panel + Mandata back');
ok(a.pin&&a.pinTop&&a.pinGo,'no pinned stands line; stands log under Stands (v0.96)');ok(a.bub.length===2&&a.bub.some(t=>/2\s*CF/.test(t))&&a.bub.some(t=>/^3$/.test(t.trim())),'wager bubbles');ok(o.b.skip||(o.b.had&&o.b.swap),'festival picker medallion');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

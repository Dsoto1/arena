/* v0.58: Naumachia ships are 3x5 with the deck art; the hull bar shows HP and the pillar names the ship; D.Soto opens the prototype; weapon cards come from the scans */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));const miss=[];pg.on('requestfailed',r=>{if(/assets\//.test(r.url()))miss.push(r.url().slice(-30))});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};
o.proto=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);const a=document.querySelector('.mmfoot [data-proto]');if(!a)return 'nolink';a.click();await new Promise(r=>setTimeout(r,600));const box=document.getElementById('protoBox');
  const imgs=[...box.querySelectorAll('img')];const ok=imgs.every(i=>i.complete&&i.naturalWidth>0);box.querySelector('[data-protox]').click();return {open:!!box,n:imgs.length,ok,closed:box.hidden,guide:playGuideHTML().includes('data-proto')}});
o.naum=await pg.evaluate(async()=>{menuHide();startEvent({ev:'naumachia',loc:6,seats:['soldier','hero','slave','royalty'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});await new Promise(r=>setTimeout(r,1500));
  const sh=S.ships;const pil=sh.map(s=>S.pillars.some(p=>p.ship===s.id&&s.tiles.has(p.r*N+p.c)));const starts=S.players.every(p=>nTerr(p.r,p.c)==='ship');
  const hov=describeTile({r:S.ships[0].pillar[0],c:S.ships[0].pillar[1]});draw();await new Promise(r=>setTimeout(r,500));
  return {tiles:sh.map(s=>s.tiles.size),boxes:sh.every(s=>s.box),pil,starts,hov:/Ship of Neptune/.test(hov),img:!!shipImg()}});
o.res=await pg.evaluate(async()=>{simToEnd(true);for(let i=0;i<200&&!S.over;i++)await new Promise(r=>setTimeout(r,200));return {over:!!S.over}});
o.weap=await pg.evaluate(async()=>{const i=new Image();i.src=assetURL('weapons.jpg');await new Promise(r=>{i.onload=r;i.onerror=r});return [i.naturalWidth,i.naturalHeight]});
console.log(JSON.stringify(o));console.log('MISS',miss.slice(0,4));console.log('ERRS',errs.slice(0,4));await b.close()})();

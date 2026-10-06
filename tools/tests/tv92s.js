/* v0.92 Play Now: the 🎟 Stands card beside the seat cards (crowd size, folded Personalities, Play as a spectator → every seat CPU
   and back, the controls still drive CFG/CROWD) and the Play guide's charts on one row (1440 and 1000 wide). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const o={};
async function page(w){const pg=await b.newPage({viewport:{width:w,height:900}});await pg.route(/fonts\./,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});return pg}
const pg=await page(1440);
o.s=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const until=async(f,ms=4000)=>{const t=Date.now();while(Date.now()-t<ms){try{if(f())return true}catch(e){}await W8(50)}return false};
  if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);openSetup(true);await until(()=>document.querySelector('#mBody .pn-who .seats'));
  const ev=document.getElementById('evSel');if(ev&&CFG.ev!=='democritus'){ev.value='democritus';ev.dispatchEvent(new Event('change',{bubbles:true}));await W8(300)}
  const q=s=>document.querySelector('#mBody '+s);const r={};
  const card=q('.pn-who .seats > .seat.stands92');r.card=!!card;r.noOptc=!q('.pn-optc');
  const seats=[...document.querySelectorAll('#mBody .pn-who .seats > .seat:not(.stands92)')];r.nSeats=seats.length;
  r.row=card&&seats.length?Math.abs(card.getBoundingClientRect().top-seats[0].getBoundingClientRect().top)<2:false;
  r.parts=!!q('.stands92 #oSpectMode')&&!!q('.stands92 details.st92pers [data-crowd="act"]')&&!!q('.stands92 #oSpectMe')&&/Personalities/.test(q('.stands92 details.st92pers summary').textContent);
  r.folded=!q('.stands92 details.st92pers').open;
  /* the controls still drive CFG / CROWD */
  const sm=q('#oSpectMode');sm.value='set';sm.dispatchEvent(new Event('change',{bubbles:true}));await until(()=>q('.stands92 #oSpect'));
  r.mode=CFG.opts.spect===16&&!!q('.stands92 #oSpect');
  const n=q('#oSpect');n.value='30';n.dispatchEvent(new Event('change',{bubbles:true}));await W8(200);r.num=CFG.opts.spect===30;
  const d=q('.stands92 details.st92pers');d.open=true;await W8(100);const sl=q('.stands92 [data-crowd="act"]');const a0=CROWD.act;sl.value='150';sl.dispatchEvent(new Event('input',{bubbles:true}));sl.dispatchEvent(new Event('change',{bubbles:true}));await W8(200);
  r.slider=CROWD.act===150;CROWD.act=a0;
  const sm2=q('#oSpectMode');sm2.value='auto';sm2.dispatchEvent(new Event('change',{bubbles:true}));await W8(300);r.auto=CFG.opts.spect==='auto';
  r.foldKept=!!q('.stands92 details.st92pers[open]');
  /* Play as a spectator: every seat CPU, visibly, then back */
  const humans0=CFG.seats.slice(0,CFG.n).map((s,i)=>s.cpu?-1:i).filter(i=>i>=0);r.humans0=humans0;
  const cb=q('#oSpectMe');r.enabled=!cb.disabled;cb.click();await until(()=>CFG.seats.slice(0,CFG.n).every(s=>s.cpu));await W8(200);
  r.allCpu=CFG.seats.slice(0,CFG.n).every(s=>s.cpu)&&CFG.spectHuman===true&&!!q('#oSpectMe').checked&&!!q('.stands92.on92');
  r.cardsCpu=[...document.querySelectorAll('#mBody .pn-who .seats > .seat:not(.stands92)')].every(el=>{const c=el.querySelector('[data-who76$=":1"]');return c&&c.classList.contains('on')});
  r.sumWatch=/watching/.test((q('.pn-sum')||{}).textContent||'');
  q('#oSpectMe').click();await until(()=>CFG.seats.slice(0,CFG.n).some(s=>!s.cpu));await W8(200);
  const humans1=CFG.seats.slice(0,CFG.n).map((s,i)=>s.cpu?-1:i).filter(i=>i>=0);r.back=JSON.stringify(humans1)===JSON.stringify(humans0.length?humans0:[0])&&CFG.spectHuman===false&&!q('#oSpectMe').checked;
  r.youCard=!!q(`.pn-who [data-who76="${humans1[0]}:0"].on`);
  /* spectator on, then a seat back to You: the spectator turns off */
  q('#oSpectMe').click();await until(()=>CFG.spectHuman);q('[data-who76="1:0"]').click();await until(()=>!CFG.seats[1].cpu);await W8(200);
  r.youOff=!CFG.seats[1].cpu&&CFG.spectHuman===false&&!q('#oSpectMe').checked;
  return r});
const S1=o.s;ok(S1.card&&S1.noOptc,'Stands card replaces the spectator section');ok(S1.row&&S1.nSeats>=2,'Stands card in the seat row');ok(S1.parts&&S1.folded,'crowd size + folded Personalities + spectator tick');
ok(S1.mode&&S1.num&&S1.auto,'crowd size drives CFG.opts.spect');ok(S1.slider&&S1.foldKept,'Personalities sliders drive CROWD');
ok(S1.enabled&&S1.allCpu&&S1.cardsCpu&&S1.sumWatch,'spectator tick → every seat CPU');ok(S1.back&&S1.youCard,'untick → the human seats back');ok(S1.youOff,'a seat back to You turns the spectator off');
/* phones: the card wraps under the seats */
await pg.setViewportSize({width:390,height:844});await pg.evaluate(()=>pnRedraw75());await pg.waitForTimeout(300);
o.ph=await pg.evaluate(()=>{const c=document.querySelector('#mBody .stands92');const m=document.getElementById('mBody');const r=c.getBoundingClientRect();return {w:r.width,fits:r.right<=innerWidth+1&&r.left>=-1,noScroll:m.scrollWidth<=m.clientWidth+1}});
ok(o.ph.fits&&o.ph.noScroll&&o.ph.w>200,'phone: the Stands card fits');
await pg.close();
/* the Play guide's charts on one row */
for(const w of [1440,1000]){const p=await page(w);
  o['g'+w]=await p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);showRules('guide');
    const t=Date.now();while(!document.querySelector('#rulTab-guide .ggrid .gvfig')&&Date.now()-t<5000)await W8(50);
    const g=document.querySelector('#rulTab-guide .ggrid');const f=[...g.querySelectorAll(':scope > .gvfig')];const tops=new Set(f.map(x=>Math.round(x.getBoundingClientRect().top)));
    const m=document.getElementById('mBody');return {n:f.length,rows:tops.size,pageScroll:m.scrollWidth>m.clientWidth+1,gridScroll:g.scrollWidth>g.clientWidth+1,minW:Math.min(...f.map(x=>x.getBoundingClientRect().width))}});
  await p.close()}
ok(o.g1440.n>=5&&o.g1440.rows===1&&!o.g1440.pageScroll&&!o.g1440.gridScroll,'charts on one row at 1440');ok(o.g1000.n>=5&&o.g1000.rows===1&&!o.g1000.pageScroll,'charts on one row at 1000 (scrolls inside)');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

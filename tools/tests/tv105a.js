/* tv105a — v1.05 Match Week rework (360-v105mw): N2 layout (slim banner with day tabs + "Your week at <city>" box without the treasury, bout cards that
   turn into result cards, #nightRes folded, fee shown once), B35d stake in the Bet button (window: 5·10·25·50, Place bet → 17's bet), picks 1 (HP/fatigue/
   morale on the row), 2 (the next bout opens itself), 3 (what changed only in the week's summary), 4 (one Watch button), 5 (rival chip), 6 (value/trap + best
   value from yourRead105), 7 (greyed buttons say why), 8 (Superbus spot in the banner), 9 (phone cards); "Your read" column; mw1 (set off = reminders window,
   Recruiting locks on the road, the End-the-week confirm names only the bouts it simulates); kill switch flavius_v105aoff=1; B45 (374-v105mwban) slim banner: height ≤55% of the old, chips centred, no overlap, phone stack, kill switch flavius_v105mwbanoff=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off,vw)=>{const pg=await b.newPage({viewport:vw||{width:1440,height:1000}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105aoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});return pg};
const mgr=async pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=9000;w.train='off';w.tplan=null;w.pend=[];
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    window.W8=W8;window.ENS=async()=>{const el=document.querySelector('#mgrBody');if(!el||!el.offsetParent){menuHide();openManager(MGR.tab||'ludus');await W8(900)}};
    window.NIGHT=async()=>{await ENS();MGR.tab='night';MGR.confirmEnd=false;MGR_REDRAW();await W8(700)};
    window.SIMS=async()=>{const w=W_();for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k)};
    window.PW=async(keep,pre)=>{const w=W_(),pm=me();if(!keep)for(const g of rosterOf(pm)){g.inj=null;g.contract.weeks=Math.max(g.contract.weeks,30)}
      if(w.special&&!w.special.done)await specAutoRun();await SIMS();if(pre)pre();
      let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];try{if(P.t==='thumb')settlePending(0,null,{d6:6,d12:12});else if(P.t==='blood')settlePending(0,'let');else if(P.t==='levy')settlePending(0,'march');else settlePending(0,'stay')}catch(e){w.pend.shift()}}
      const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let rr;try{rr=await endWeek()}finally{clearInterval(hold)}await W8(150);return rr};
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('ludus');await W8(600);MGR.view=null});
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));console.log(JSON.stringify(out,null,1).slice(0,6000));await b.close();process.exit(1)}};

const pg=await open(false);await mgr(pg);
/* an away week with fighters on the card (the road paid, not yet set off) */
out.prep=await ev(pg,async()=>{const w=W_();let g=0;const away=()=>{const t=travelState(w);return t&&t.cost>0&&t.paid&&!t.gone&&!w.night.bye&&!w.night.selfBye&&w.night.bouts.some(b=>b.ents.some(id=>{const x=gById(id);return x&&x.contract&&x.contract.mgr===me().id}))};
  while(!away()&&g++<6)await PW();w.pend=[];await NIGHT();return {away:away(),wk:wkOf(w.week),need:mw105NeedOff(w)}});
ok(out.prep.away&&out.prep.need,'an away week, not set off '+JSON.stringify(out.prep));

/* ---- N2 layout ---- */
out.l=await ev(pg,()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const w=W_();const n=w.night;const ban=q('#mgrBody .roomhd.b73-night.mw105ban');const box=q('.mw105ban .mw105wk');
  const arts=qa('#mgrBody .mw105list > article.mw105b');const open=arts.filter(a=>a.classList.contains('open'));const nx=mw105Seq(n).find(i=>!n.bouts[i].done);
  const ob=open[0]&&open[0].querySelector('.mw105bd');
  return {ban:!!ban,box:!!box,boxTxt:box?box.textContent:'',city:box?box.querySelector('.mw105wh b').textContent:'',tabsIn:qa('.mw105ban [data-bt85]').length,arts:arts.length,bouts:n.bouts.length,
    open:open.map(a=>+a.dataset.mw105b),nx,stake:qa('#mgrBody .bstake').length,res:!!q('#nightRes'),any:!!q('#any100wk'),purseTile:ob?ob.querySelectorAll('.bstat.purse').length:-1,
    feeTiles:ob?[...ob.querySelectorAll('.bstat')].filter(x=>/fee/i.test(x.textContent)).length:-1,read:ob?[...ob.querySelectorAll('th')].map(x=>x.textContent.trim()):[],
    watch:ob?ob.querySelectorAll('[data-mg="watch"],[data-mg="spect"]').length:-1,stakeIn:!!(ob&&ob.querySelector('input[type="hidden"][id^="mgStake"]')),
    cond:qa('.mw105b.mine .a1ev .mw105c').length,mineArts:qa('.mw105b.mine').length,hidden:arts.filter(a=>!a.classList.contains('open')).every(a=>a.querySelector('.mw105bd').hidden),
    banH:ban?ban.getBoundingClientRect().height:0,off:!!q('.mw105wk [data-mw105="off"]'),pageX:document.documentElement.scrollWidth>window.innerWidth+1}});
ok(out.l.ban&&out.l.box&&!/Treasury|treasury/.test(out.l.boxTxt)&&/ at /.test(out.l.city)&&out.l.tabsIn>=3,'N2 banner + Your week box without the treasury, day tabs in the banner '+JSON.stringify(out.l));
ok(out.l.arts===out.l.bouts&&out.l.open.length===1&&out.l.open[0]===out.l.nx&&out.l.hidden,'one card per bout, the next bout open, the rest closed '+JSON.stringify(out.l));
ok(out.l.stake===0&&out.l.stakeIn,'B35d no full-width stake row '+JSON.stringify(out.l));
ok(!out.l.res&&!out.l.any,'#nightRes / #any100wk folded into the cards '+JSON.stringify(out.l));
ok(out.l.purseTile===0&&out.l.feeTiles===0,'purse + fee shown once (on the row) '+JSON.stringify(out.l));
ok(out.l.read.includes('Your read')&&!out.l.read.includes('Your scouts'),'"Your read" column '+JSON.stringify(out.l.read));
ok(out.l.watch===1,'pick 4: one Watch button '+JSON.stringify(out.l));
ok(out.l.mineArts>0&&out.l.cond===out.l.mineArts,'pick 1: HP / fatigue / morale on your rows '+JSON.stringify(out.l));
ok(out.l.off&&!out.l.pageX,'Set off button, no page scroll '+JSON.stringify(out.l));

/* ---- picks 5 + 6: rival chip, the read with value / trap ---- */
out.r=await ev(pg,async()=>{const w=W_(),n=w.night;const i=mw105Seq(n).find(k=>!n.bouts[k].done);const b=n.bouts[i];const m=me();
  const riv=b.ents.map(gById).find(g=>g&&g.contract&&g.contract.mgr!==m.id);const rm=riv&&mgrById(riv.contract.mgr);if(rm)rm.rivalry=60;
  const bk=boutProbs(b,'book');const lo=b.ents.findIndex((id,k)=>bk[k]<0.5);const tid=b.ents[lo];const hid=b.ents.find((id,k)=>k!==lo&&bk[k]>0.15);
  const orig=window.yourRead105;
  window.yourRead105=g=>g.id===tid?{est:effOvr(g)+25,lo:effOvr(g)+23,hi:effOvr(g)+27,rough:true,src:'sand'}:g.id===hid?{est:5,lo:5,hi:5,rough:false,src:'dossier'}:null;await NIGHT();
  const ob=document.querySelector('.mw105b.open .mw105bd');const rd=[...ob.querySelectorAll('.mw105rd')].map(x=>x.textContent);
  const r={rv:ob.querySelectorAll('.mw105rv').length,val:ob.querySelectorAll('.mw105vb.good').length,trap:ob.querySelectorAll('.mw105vb.bad').length,best:ob.querySelectorAll('.mw105bv').length,rd,
    rough:[...ob.querySelectorAll('.mw105rd.rough')].map(x=>x.textContent),none:[...ob.querySelectorAll('td')].filter(x=>x.textContent.trim()==='no read').length,
    badgeRows:[...ob.querySelectorAll('tr')].filter(t=>t.querySelector('.mw105vb,.mw105bv')).every(t=>t.querySelector('.mw105rd'))};
  window.yourRead105=()=>null;await NIGHT();r.after=document.querySelectorAll('.mw105b.open .mw105bv,.mw105b.open .mw105vb').length;
  window.yourRead105=orig;await NIGHT();return r});
ok(out.r.rv>=1,'pick 5: rival chip '+JSON.stringify(out.r));
ok(out.r.val===1&&out.r.trap===1&&out.r.best===1&&out.r.badgeRows&&out.r.rough.length===1&&/^~\d+$/.test(out.r.rough[0])&&out.r.rd.every(x=>!/%/.test(x))&&out.r.none>=1,'pick 6: value / trap / best value only on read fighters, the cell shows a rating (not a %) '+JSON.stringify(out.r));
ok(out.r.after===0,'pick 6: every read null = no value / trap / best-value badge '+JSON.stringify(out.r));

/* ---- B35d: the stake window ---- */
const bet=pg.locator('.mw105b.open tr.me [data-mg="bet"]').first();await bet.click();await pg.waitForTimeout(250);
out.pop=await ev(pg,()=>{const p=document.querySelector('.mw105pop');return p?{q:[...p.querySelectorAll('[data-mw105q]')].map(x=>x.textContent),txt:p.textContent}:null});
ok(out.pop&&out.pop.q.join(',')==='5,10,25,50'&&/pays/.test(out.pop.txt)&&/Place bet/.test(out.pop.txt),'B35d stake window '+JSON.stringify(out.pop));
await pg.click('.mw105pop [data-mw105q="25"]');await pg.click('.mw105pop [data-mw105p="5"]');
out.pv=await ev(pg,()=>document.querySelector('.mw105pop output').textContent);
await pg.click('.mw105pop [data-mw105go]');await pg.waitForTimeout(400);
out.bet=await ev(pg,()=>{const w=W_(),n=w.night;const i=mw105Seq(n).find(k=>!n.bouts[k].done);const bb=n.bouts[i].bets;return {bets:bb.map(x=>x.stake),pop:!!document.querySelector('.mw105pop'),lab:[...document.querySelectorAll('.mw105b.open .mw105on')].map(x=>x.textContent)}});
ok(out.pv==='30'&&out.bet.bets.length===1&&out.bet.bets[0]===30&&!out.bet.pop&&out.bet.lab[0]==='Bet 30','B35d Place bet → 30 on him, the button says so '+JSON.stringify([out.pv,out.bet]));
await bet.click().catch(()=>{});await pg.waitForTimeout(150);await pg.keyboard.press('Escape');out.esc=await ev(pg,()=>!document.querySelector('.mw105pop'));ok(out.esc,'Escape closes the window');

/* ---- B60: an away week, the city square before setting off asks first ---- */
await ev(pg,()=>{window.__c=0;if(!window.__cb){window.__cb=openCitySquare;openCitySquare=function(){window.__c++}}});
await pg.click('#mgrBody [data-mg="city"]');await pg.waitForTimeout(500);
out.c1=await ev(pg,()=>({ask:!!document.querySelector('.ask76bg'),t:(document.querySelector('.ask76bg')||{textContent:''}).textContent,c:window.__c,gone:!!W_().night.travel.gone}));
ok(out.c1.ask&&/Set off/.test(out.c1.t)&&out.c1.c===0&&!out.c1.gone,'B60 city square click before set-off opens the set-off window, no city '+JSON.stringify(out.c1));
await pg.click('.ask76bg [data-ask76="0"]');await pg.waitForTimeout(500);
out.c2=await ev(pg,()=>({ask:!!document.querySelector('.ask76bg'),c:window.__c,gone:!!W_().night.travel.gone}));
ok(!out.c2.ask&&out.c2.c===0&&!out.c2.gone,'B60 Cancel keeps the house home, nothing opens '+JSON.stringify(out.c2));
await pg.click('#mgrBody [data-mg="city"]');await pg.waitForTimeout(500);await pg.click('.ask76bg [data-ask76="1"]');await pg.waitForTimeout(1500);
out.c3=await ev(pg,()=>{const r={c:window.__c,gone:!!W_().night.travel.gone};W_().night.travel.gone=false;MGR_REDRAW();return r});
ok(out.c3.gone&&out.c3.c===1,'B60 confirm sets travel.gone and opens the city '+JSON.stringify(out.c3));
await ev(pg,async()=>{await W8(500)});
out.c4=await ev(pg,async()=>{const t=W_().night.travel,k=t.cost;t.cost=0;window.__c=0;document.querySelector('#mgrBody [data-mg="city"]').click();await W8(400);const r={ask:!!document.querySelector('.ask76bg'),c:window.__c};t.cost=k;return r});
ok(!out.c4.ask&&out.c4.c===1,'B60 a home week: the square opens as before '+JSON.stringify(out.c4));
await ev(pg,()=>{openCitySquare=window.__cb;window.__cb=null;MGR_REDRAW()});

/* ---- mw1: set off from the open bout's Simulate ---- */
await pg.click('.mw105b.open [data-mg="sim"]');await pg.waitForTimeout(400);
out.ask=await ev(pg,()=>{const a=document.querySelector('.ask76bg');return a?{t:a.textContent,li:a.querySelectorAll('li').length}:null});
ok(out.ask&&/Set off/.test(out.ask.t)&&/Recruiting/.test(out.ask.t)&&out.ask.li>=1,'mw1 the set-off window lists what is undone '+JSON.stringify(out.ask));
await pg.click('.ask76bg [data-ask76="1"]');await pg.waitForTimeout(2500);
out.go=await ev(pg,async()=>{await ENS();if(MGR.tab!=='night')await NIGHT();const w=W_(),n=w.night;const S=mw105Seq(n);const done=S.filter(i=>n.bouts[i].done);const nx=S.find(i=>!n.bouts[i].done);
  const open=[...document.querySelectorAll('.mw105b.open')].map(a=>+a.dataset.mw105b);const a0=document.querySelector(`.mw105b[data-mw105b="${done[0]}"]`);
  return {gone:!!n.travel.gone,locked:roadLocked76(w),done,open,nx,res:!!(a0&&a0.querySelector('.mw105res .mw105pod li')),tag:a0?a0.querySelector('.mw105rt')?.textContent:'',chip:[...document.querySelectorAll('.mw105chip')].map(x=>x.textContent).join('|'),sum:!!document.querySelector('.mw105sum')}});
ok(out.go.gone&&out.go.locked&&out.go.done.length===1,'mw1 confirmed: the house set off, the bout ran '+JSON.stringify(out.go));
ok(out.go.res&&/Won by|No winner/.test(out.go.tag)&&(!out.go.open.includes(out.go.done[0])||/verdict/.test(out.go.tag))&&out.go.open.includes(out.go.nx)&&out.go.open.length<=2,'the card turned into its result, the next bout opened itself '+JSON.stringify(out.go));
ok(/Recruiting shut/.test(out.go.chip)&&!out.go.sum,'banner: road lock chip; no "what changed" until all are fought '+JSON.stringify(out.go));

/* ---- mw1: Recruiting locks on the road ---- */
out.rec=await ev(pg,async()=>{const w=W_();MGR.tab='recruit';MGR_REDRAW();await W8(700);const h0=rec99Left(w);const a=document.querySelector('#mgrPane [data-rec98a]');const note=!!document.querySelector('#mgrPane .mw105rl');
  const dis=a?!!a.dataset.dis:false;if(a)a.click();await W8(400);const h1=rec99Left(w);const chip=(document.querySelector('.mtabs [data-id="recruit"] .hr99')||{}).textContent;return {note,dis,h0,h1,chip,has:!!a}});
ok(out.rec.note&&out.rec.has&&out.rec.dis&&out.rec.h0===out.rec.h1,'mw1 Recruiting shut on the road (note, reasons, no hours spent) '+JSON.stringify(out.rec));

/* ---- mw1: End the week with bouts left names them; no ludus reminders ---- */
out.end=await ev(pg,async()=>{await NIGHT();const w=W_();w.pend=[];w.hours=5;MGR_REDRAW();await W8(400);const e=document.querySelector('.mw105wk [data-mw105="end"]');const dis=!!(e&&e.dataset.dis);e.click();await W8(600);
  const c=document.querySelector('.endconfirm');return {dis,c:!!c,sim:c?(c.querySelector('.mw105sim')||{}).textContent:'',skip:c?!!c.querySelector('.skiplist'):null,hrs:c?/You still have/.test(c.textContent):null,wk:w.week}});
ok(!out.end.dis&&out.end.c&&/Simulated first/.test(out.end.sim)&&out.end.skip===false&&out.end.hrs===false,'mw1 the End-the-week confirm names only the bouts it simulates '+JSON.stringify(out.end));
await pg.click('.endconfirm [data-mg="endweek"]');await pg.waitForTimeout(500);
out.end2=await ev(pg,async()=>{const w=W_();for(let i=0;i<60&&(MGR.busy||w.night.bouts.some(b=>!b.done));i++)await W8(250);await W8(800);
  const n=w.night;return {wk:w.week,allDone:n.bouts.every(b=>b.done),pend:(w.pend||[]).length,tab:MGR.tab}});
ok(out.end2.wk>out.end.wk||(out.end2.pend>0&&out.end2.tab!=='paper'),'End the week simulated the rest, then ended (or stopped on a verdict) '+JSON.stringify(out.end2));

/* ---- pick 3 + 7: a fought week ---- */
out.wk=await ev(pg,async()=>{const w=W_();let g=0;const fresh=()=>w.night&&!w.night.bye&&w.night.bouts.length&&!w.night.bouts.some(b=>b.done);while(!fresh()&&g++<4)await PW();
  await NIGHT();window.scrollTo(0,600);await SIMS();await NIGHT();await W8(1600);const b53={open:[...document.querySelectorAll('.mw105b.open:not(.vd)')].length,y:Math.round(window.scrollY),dbg:[...document.querySelectorAll('*')].filter(e=>e.scrollTop>0).map(e=>e.tagName+'#'+e.id+'.'+String(e.className).slice(0,20)+':'+e.scrollTop).slice(0,5),mo:typeof reduceMotion==='function'?reduceMotion():null};const sm=document.querySelector('.mw105sum');const pend=(w.pend||[]).length;const e=document.querySelector('.mw105wk [data-mw105="end"]');
  return {b53,sum:!!sm,sumTxt:sm?sm.textContent:'',arts:document.querySelectorAll('.mw105b.done .mw105res').length,n:w.night.bouts.length,pend,endDis:e?e.dataset.dis||'':'',note:(document.querySelector('.mw105nt')||{}).textContent,
    why:[...document.querySelectorAll('.mw105list [data-dis]')].every(x=>x.querySelector('.mw105y'))}});
ok(out.wk.sum&&/what changed/.test(out.wk.sumTxt)&&out.wk.arts===out.wk.n,'pick 3: what changed once all are fought; every card a result '+JSON.stringify(out.wk));
ok(out.wk.b53.open===0&&out.wk.b53.y<=40,'B53 after the last bout every card is folded and the page is back at the top '+JSON.stringify(out.wk.b53));
ok(!out.wk.pend||(/Settle/.test(out.wk.endDis)&&/Settle/.test(out.wk.note)),'pick 7: End the week says why '+JSON.stringify(out.wk));
ok(out.wk.why,'pick 7: every greyed button in the cards shows its reason '+JSON.stringify(out.wk));

/* ---- pick 9: phone ---- */
out.ph=await ev(pg,async()=>{await PW();await NIGHT();return 1});
await pg.setViewportSize({width:390,height:900});await pg.waitForTimeout(700);
out.ph=await ev(pg,()=>{const tr=[...document.querySelectorAll('.mw105b.open table.mw105tb tr')].filter(x=>!x.querySelector('th'));const box=document.querySelector('.mw105wk');const ban=document.querySelector('.mw105ban');
  return {rows:tr.length,grid:tr.length?getComputedStyle(tr[0]).display:'',lab:tr.length?getComputedStyle(tr[0].children[2],'::before').content:'',boxW:box?box.getBoundingClientRect().width:0,banW:ban?ban.getBoundingClientRect().width:0,pageX:document.documentElement.scrollWidth>window.innerWidth+1}});
ok(out.ph.rows>0&&out.ph.grid==='grid'&&out.ph.lab!=='none'&&!out.ph.pageX&&out.ph.boxW>out.ph.banW*0.8,'pick 9: phone betting cards, box full width, no page scroll '+JSON.stringify(out.ph));
await pg.setViewportSize({width:1440,height:1000});

/* ---- pick 8: a Superbus week (your house seed #1, semifinal) + B35d there ---- */
out.po=await ev(pg,async()=>{const w=W_();let g=0;while(wkOf(w.week)<9&&g++<12)if(!await PW())break;await PW();await PW();await SIMS();msp(me()).pts=9999;await PW();await PW();
  await NIGHT();const c=document.querySelector('.mw105ban .mw105po');return {ph:OFF104.phase(w),chip:c?c.textContent:'',br:c?c.dataset.mw105:'',btns:document.querySelectorAll('#mgrBody [data-po104="bracket"]').length,stake:document.querySelectorAll('#mgrBody .bstake').length,arts:document.querySelectorAll('.mw105b').length,n:w.night.bouts.length,tree:!!document.querySelector('#mgrBody .v104top')}});
ok(out.po.ph==='sf'&&/seed #1/.test(out.po.chip)&&/Semifinal/.test(out.po.chip)&&out.po.br==='tree'&&out.po.btns===0,'pick 8: the Superbus spot in the banner '+JSON.stringify(out.po));
ok(out.po.stake===0&&out.po.arts===out.po.n&&out.po.tree,'B35d playoff bouts: no stake row; cards; the bracket tree stays '+JSON.stringify(out.po));

/* ---- kill switch ---- */
const off=await open(true);await mgr(off);
out.off=await ev(off,async()=>{await NIGHT();return {ban:document.querySelectorAll('.mw105ban').length,stake:document.querySelectorAll('#mgrBody .bstake').length,wk:!!document.querySelector('#any100wk'),need:mw105NeedOff(W_())}});
ok(out.off.ban===0&&out.off.stake>0&&out.off.wk&&!out.off.need,'kill switch flavius_v105aoff=1 '+JSON.stringify(out.off));
ok(!(await pg.evaluate(()=>typeof errNew92==='function'?errNew92(window.RM_MARK||0).length:0)),'no new 00c errors');
/* ---- B45 (374-v105mwban): the slim banner. Measured against the old one (kill switch flavius_v105mwbanoff=1), chips centred, no overlap, phone stack ---- */
{const bp=async(vw,offK)=>{const p=await b.newPage({viewport:vw});await p.route(/fonts\./,r=>r.abort());p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(k=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(k)localStorage.setItem('flavius_v105mwbanoff','1')},offK?1:0);
  await p.goto('file://'+process.argv[2],{timeout:90000});await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});await mgr(p);
  await p.evaluate(async()=>{const w=W_();let g=0;const away=()=>{const t=travelState(w);return t&&t.cost>0&&t.paid&&!t.gone&&!w.night.bye&&!w.night.selfBye&&w.night.bouts.some(b=>b.ents.some(id=>{const x=gById(id);return x&&x.contract&&x.contract.mgr===me().id}))};
    while(!away()&&g++<6)await PW();w.pend=[];await NIGHT();mw105Go(w);MGR_REDRAW();await W8(700)});return p};
  const meas=p=>p.evaluate(()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const hd=q('.roomhd.mw105ban');const R=e=>e.getBoundingClientRect();
    const chips=qa('.mw105ban .mw105chip').map(c=>{const q2=R(c);const rg=document.createRange();rg.selectNodeContents(c);const t=rg.getBoundingClientRect();return {h:q2.height,dc:Math.abs((t.top+t.height/2)-(q2.top+q2.height/2)),l:q2.left,r:q2.right,t:q2.top,b:q2.bottom}});
    const box=R(q('.mw105ban .mw105wk'));const oe=[...qa('.mw105ban .mw105chip'),...qa('.mw105ban [data-bt85]'),...qa('.mw105ban .walk96b'),...qa('.mw105ban .walk96 .city90n'),...qa('.mw105ban .mi100tr'),...qa('.mw105ban .roomttl')];const others=oe.map(R);
    const hitE=oe.filter((e,i)=>{const r=others[i];return r.width>0&&Math.min(r.right,box.right)-Math.max(r.left,box.left)>1&&Math.min(r.bottom,box.bottom)-Math.max(r.top,box.top)>1});const hit=hitE.length;const hitN=hitE.map(e=>e.className+'|'+e.textContent.slice(0,20)).join(';');
    const hb=R(hd),L=R(q('.mw105L'));
    return {h:hb.height,chips,hit,hitN,slim:hd.classList.contains('mw105slim'),boxTop:box.top,boxLeft:box.left,boxRight:box.right,LBottom:L.bottom,hdRight:hb.right,hdLeft:hb.left,pageX:document.documentElement.scrollWidth>innerWidth+1,
      tabs:qa('.mw105ban [data-bt85]').length,walk:!!q('.mw105ban .walk96b'),off:!!q('.mw105wk [data-mw105="off"], .mw105wk [data-mg="simall"]')}});
  const po=await bp({width:1440,height:1000},true);const old=await meas(po);await po.close();
  const p14=await bp({width:1440,height:1000},false);const n14=await meas(p14);await p14.close();
  const p10=await bp({width:1000,height:900},false);const n10=await meas(p10);await p10.close();
  const p39=await bp({width:390,height:844},false);const n39=await meas(p39);await p39.close();
  out.b45={old:old.h,n14:n14.h,n10:n10.h,n39:n39.h};
  ok(!old.slim&&n14.slim,'B45 kill switch flavius_v105mwbanoff=1 keeps the old banner '+JSON.stringify(out.b45));
  ok(n14.h<=old.h*0.55,'B45 banner height at 1440 is at most 55% of the old '+JSON.stringify(out.b45));
  for(const [k,m] of [['1440',n14],['1000',n10]]){
    ok(m.chips.length>=1&&m.chips.every(c=>c.dc<=2&&c.h<=30),'B45 chips ('+k+') single line and text centred in the pill '+JSON.stringify(m.chips));
    ok(m.hit===0,'B45 nothing overlaps the Your week box at '+k+' ('+m.hitN+')');
    ok(!m.pageX&&m.chips.every(c=>c.r<=m.hdRight+1&&c.l>=m.hdLeft-1),'B45 chips stay inside the banner at '+k);
    ok(m.tabs>=3&&m.walk&&m.off,'B45 day tabs, Walk the city square and the box buttons kept at '+k)}
  ok(!n39.pageX&&n39.boxTop>=n39.LBottom-1&&n39.boxRight<=391&&n39.chips.every(c=>c.r<=n39.hdRight+1&&c.dc<=2),'B45 phone (390) stacks: box under the banner text, no sideways scroll '+JSON.stringify({bt:n39.boxTop,lb:n39.LBottom,br:n39.boxRight}))}

console.log('ERRS',JSON.stringify(errs));if(miss.length){console.log('MISS',JSON.stringify(miss,null,1));await b.close();process.exit(1)}
console.log('OK tv105a');await b.close();process.exit(errs.length?1:0)})();

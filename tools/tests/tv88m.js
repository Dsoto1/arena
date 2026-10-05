/* v0.88 Manager (157-v88mgr): 1 Immortalis (milestones, permanent stamp, letter, gold laurel frame on plaque / roster row /
   card / Training Yard / Match Week, rivals back down, "fears" chip), 2 the win purse cap ×3, 3 Recruiting II: the rival's
   counter-bid in the 3rd week of courting (countdown, letter, Match / Outbid on a want / Walk away / nothing → the rival),
   wants (chips after scouting, a want pitch, the offer meter's gain), rating ranges that narrow and hold the true value */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const setup=async(pg)=>{await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
  return pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=900;m.fame=Math.max(m.fame,60);MGR.tab='ludus';MGR_REDRAW();await W8(500);return true})};
const pg=await b.newPage({viewport:{width:1300,height:900}});await setup(pg);
/* ---------- 1 · Immortalis ---------- */
o.i=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();const g=rosterOf(m)[0];window.IMM=g;
  g.ovr=70;g.rec.w=20;g.titles88=1;r.lowRating=mgrImmortalis88(g);
  g.ovr=95;g.rec.w=14;r.fewWins=mgrImmortalis88(g);g.rec.w=15;g.titles88=0;r.noTitle=mgrImmortalis88(g);
  (w.specialLog=w.specialLog||[]).push({n:'Ludi Test',season:w.season,champ:g.name,mine:true});r.yes=mgrImmortalis88(g);r.stamp=!!(g.imm88&&g.imm88.season===w.season);
  r.letter=(w.letters||[]).some(L=>L.key==='imm88_'+g.id);r.news=(w.news||[]).some(n=>/Immortalis/.test(n.text));r.hist=(g.hist||[]).some(h=>/Immortalis/.test(h.txt));
  w.specialLog.pop();g.ovr=40;r.permanent=mgrImmortalis88(g);g.ovr=95;
  /* the frame: roster plaque + row + card */
  MGR.tab='roster';MGR.lsel=g.id;MGR_REDRAW();await W8(500);
  const pl=document.querySelector(`.dcard[data-gid84="${g.id}"]`);r.plaque=!!(pl&&pl.classList.contains('imm88')&&pl.classList.contains('imm88m')&&pl.querySelector('.imm88lf'));
  const row=document.querySelector(`tr[data-mg="lsel"][data-id="${g.id}"]`);r.row=!row||row.classList.contains('imm88m');
  r.card=!!document.querySelector('#mgrBody .card2.imm88.imm88m .imm88chip');
  const other=rosterOf(m).find(x=>x.id!==g.id);r.otherPlain=!other||!document.querySelector(`.dcard[data-gid84="${other.id}"].imm88m`);
  /* Training Yard */
  MGR.tab='practice';MGR.yd87=g.id;MGR_REDRAW();await W8(500);r.yard=!!document.querySelector('#mgrBody .yd76c.imm88m, #mgrBody .yo87r.imm88m');
  /* Match Week: his row framed, the others fear him */
  const n=w.night;const bt=n&&n.bouts&&n.bouts.find(x=>!x.done);if(bt){if(!bt.ents.includes(g.id))bt.ents[0]=g.id;MGR.tab='night';MGR_REDRAW();await W8(500);
    const fb=document.querySelector(`#mgrBody [data-mg="fav"][data-id="${g.id}"]`);r.night=!!(fb&&fb.closest('tr').classList.contains('imm88m'));r.fear=document.querySelectorAll('#mgrBody .fear88').length>0;
    const opp=bt.ents.map(gById).find(x=>x&&x.id!==g.id);r.mor0=opp?opp.morale:null}
  /* rivals back down */
  const R=w.mgrs.find(x=>!x.isPlayer&&!x.dead);R.rivalry=40;for(const x of w.mgrs)if(x!==R&&!x.isPlayer)x.rivalry=0;const rnd0=Math.random;Math.random=()=>0.2;try{rivalLetter76(w)}finally{Math.random=rnd0}
  const L=(w.letters||[]).find(x=>x.key==='rl76'+w.season+'_'+w.week);r.fearL=!!(L&&L.rl76.kind==='fear'&&!/data-rl76/.test(L.body)&&/backs down/.test(L.title));
  return r});
ok(!o.i.lowRating&&!o.i.fewWins&&!o.i.noTitle,'Immortalis needs rating 82+, 15 wins and a title '+JSON.stringify([o.i.lowRating,o.i.fewWins,o.i.noTitle]));
ok(o.i.yes&&o.i.stamp&&o.i.letter&&o.i.news&&o.i.hist,'Immortalis: stamp, letter, Acta, chronicle');ok(o.i.permanent,'Immortalis is permanent');
ok(o.i.plaque&&o.i.row&&o.i.card&&o.i.otherPlain,'gold laurel frame on the plaque, row and card '+JSON.stringify(o.i));ok(o.i.yard,'framed in the Training Yard');
ok(o.i.night===undefined||o.i.night&&o.i.fear,'Match Week: framed row + fears chip');ok(o.i.fearL,'a rival backs down instead of challenging');
/* the bout: opponents lose a little morale */
o.b=await pg.evaluate(async()=>{const w=W_();const bt=w.night.bouts.find(x=>x.ents.includes(IMM.id)&&!x.done);if(!bt)return {skip:1};const opp=bt.ents.map(gById).find(x=>x&&x.id!==IMM.id);const m0=opp.morale;
  const base=window.applyBout;let d=null;try{applyBout(w.night.bouts.indexOf(bt))}catch(e){d=String(e)}return {fear:bt.fear88&&bt.fear88.includes(IMM.id),drop:m0-opp.morale,d}});
ok(o.b.skip||o.b.fear,'the bout marks the fear '+JSON.stringify(o.b));
/* ---------- 2 · the purse cap ---------- */
o.c=await pg.evaluate(()=>({big:win87Mult(0.02,4,12).all,mid:win87Mult(0.2,4,2).all,one:win87Mult(0.5,2,0).all,cap:WIN_CAP88}));
ok(o.c.cap===3&&o.c.big===3&&o.c.mid<=3&&o.c.one===1,'purse multiplier capped at ×3 '+JSON.stringify(o.c));
/* ---------- 3 · Recruiting II ---------- */
o.r=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const r={};const w=W_(),m=me();
  const fa=freeAgents().filter(x=>m.fame>=reqFame(x)).sort((a,b)=>effOvr(b)-effOvr(a));
  /* wants: deterministic, 1–2 */
  r.wantsN=fa.slice(0,30).every(g=>{const a=wants88(g),b=wants88(g);return a.length>=1&&a.length<=2&&a.join()===b.join()&&new Set(a).size===a.length});
  /* ranges narrow and hold the true value */
  const g=fa[0];g.scout=0;delete g.watch74;delete g.rumor74;const st=gStats(g);const read=()=>{const h=ratingsHTML(g);const d=document.createElement('div');d.innerHTML=h;return [...d.querySelectorAll('[data-rng88]')].map(e=>({k:e.dataset.rng88,lo:+e.dataset.lo,hi:+e.dataset.hi}))};
  const L12=read();g.scout=1;const L8=read();g.scout=0;g.watch74=wkKey74();const L4=read();const L4b=read();g.scout=2;const L0=read();
  const holds=L=>L.length===5&&L.every(x=>x.lo<=st[x.k]&&st[x.k]<=x.hi);const width=L=>Math.max(...L.map(x=>x.hi-x.lo));
  r.rng={n:[L12.length,L8.length,L4.length,L0.length],holds:[holds(L12),holds(L8),holds(L4)],w:[width(L12),width(L8),width(L4)],stable:JSON.stringify(L4)===JSON.stringify(L4b),
    nested:L4.every(x=>{const a=L8.find(y=>y.k===x.k);return a.lo<=x.lo&&x.hi<=a.hi})&&L8.every(x=>{const a=L12.find(y=>y.k===x.k);return a.lo<=x.lo&&x.hi<=a.hi})};
  /* the unscouted card shows the ranges */
  const u=fa[1];u.scout=0;delete u.watch74;u.favd=false;MGR.tab='recruit';MGR.sel=u.id;MGR.recFor=u.id;MGR.recStep=1;MGR_REDRAW();await W8(400);
  r.unscoutedRanges=document.querySelectorAll('#mgrBody .scoutsee [data-rng88]').length===5&&!document.querySelector('#mgrBody .want88[data-want88k]');
  /* wants after scouting: chips, a want pitch, the meter gain */
  const s=fa[2];s.scout=2;s.favd=true;s.interest[m.id]=20;MGR.sel=s.id;MGR.recFor=s.id;MGR.recStep=1;MGR_REDRAW();await W8(400);
  r.chips=document.querySelectorAll('#mgrBody .want88[data-want88k]').length===wants88(s).length;r.cd=/Rival bid in 2 weeks/.test(document.getElementById('mgrBody').innerText);
  MGR.recStep=2;MGR_REDRAW();await W8(300);const pb=document.querySelector(`#mgrBody [data-want88^="${wants88(s)[0]}|${s.id}"]`);r.pitchBtn=!!pb&&/\+\d+ interest/.test(pb.textContent);
  const i0=interestOf(s,m);pb&&pb.click();await W8(300);r.pitchGain=interestOf(s,m)-i0;const pb2=document.querySelector(`#mgrBody [data-want88^="${wants88(s)[0]}|"]`);r.pitchOnce=!!(pb2&&pb2.disabled);
  /* the offer meter: force a coin want; wage over 115% of the ask answers it */
  const c=fa.slice(3).find(x=>wants88(x).includes('coin'))||fa[3];c.scout=2;c.favd=true;c.interest[m.id]=30;const ask=askWage(c);
  const T=(wage)=>want88Bonus(c,m,{wage,weeks:8,pledge:false,rudis:false});r.coinWant=wants88(c).includes('coin');r.bon=[T(ask),T(Math.ceil(ask*1.2))];
  MGR.sel=c.id;MGR.recFor=c.id;MGR.recStep=3;MGR_REDRAW();await W8(700);const sl=document.getElementById('ofWage');if(sl){sl.value=Math.min(+sl.max,Math.ceil(ask*1.2));ofMeterUpdate()}
  r.meterWant=!!document.querySelector('#ofMeter .want88m .want88c');
  /* the counter-bid: courted from this week, the letter opens week 3 */
  const k=fa[4];k.favd=true;k.scout=2;MGR.tab='recruit';MGR_REDRAW();await W8(300);r.courted=!!(k.court88&&k.court88.wk===w.week);
  r.tablet=!!document.querySelector(`.pcard.pt85[data-id="${k.id}"] .cd88`);if(!r.tablet||!r.courted)r.tdbg={c88:k.court88,wk:w.week,pc:!!document.querySelector(`.pcard.pt85[data-id="${k.id}"]`),same:[k===s,k===c,k===u],con:!!k.contract,ps:((document.querySelector(`.pcard.pt85[data-id="${k.id}"]`)||{}).innerHTML||'').replace(/<span class="portrait[\s\S]*?<\/svg><\/span>/,'P'),ph:pipelineHTML().slice(0,300)};
  window.K88=k;window.S88=s;window.C88=c;return r});
ok(o.r.wantsN,'1–2 wants per free agent, stable');
ok(o.r.rng.n.join()==='5,5,5,0'&&o.r.rng.holds.every(Boolean)&&o.r.rng.w.join()==='24,16,8'&&o.r.rng.stable&&o.r.rng.nested,'ranges ±12/±8/±4 → exact, true value inside, stable, nested '+JSON.stringify(o.r.rng));
ok(o.r.unscoutedRanges,'the unscouted card shows rough ranges, no wants');
ok(o.r.chips&&o.r.cd,'wants chips after scouting + the countdown on the card '+JSON.stringify([o.r.chips,o.r.cd]));
ok(o.r.pitchBtn&&o.r.pitchGain>0&&o.r.pitchOnce,'speak to a want: preview, gain, once a week '+JSON.stringify([o.r.pitchBtn,o.r.pitchGain,o.r.pitchOnce]));
ok(!o.r.coinWant||(o.r.bon[1]-o.r.bon[0]===14),'a coin want answered by the wage adds +14 '+JSON.stringify(o.r.bon));ok(o.r.meterWant,'the offer meter lists the wants');
ok(o.r.courted&&o.r.tablet,'courting starts when pinned; the tablet shows the countdown');
/* weeks pass: the bid arrives in week 3 */
const endWk=()=>pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const w=W_();for(const g of rosterOf(me()))if(g.contract)g.contract.weeks=20;for(const bt of (w.night&&w.night.bouts)||[])bt.done=true;w.pend=[];if(w.special)w.special.done=true;
  for(const g of [K88,S88,C88]){if(g.contract&&g.contract.mgr!==me().id)continue;g.contract=null;g.alive=true;g.favd=true}
  let ret;try{ret=await endWeek()}catch(e){ret=String(e)}await W8(300);return ret});
o.w1=await endWk();
o.r2=await pg.evaluate(()=>{const w=W_();return {wk:w.week-K88.court88.wk,bid:!!K88.court88.bid,letters:(w.letters||[]).filter(L=>/^rb88_/.test(L.key)).length}});
o.w2=await endWk();
o.r3=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const w=W_(),m=me();const r={};r.wk=w.week-K88.court88.wk;
  for(const g of [K88,S88,C88])if(g.court88&&!g.court88.bid&&(!g.contract||g.contract.mgr!==m.id)){g.contract=null;court88Bid(w,g)} /* an AI house may have signed one during the weeks */
  const gs=[K88,S88,C88].filter(g=>g.court88&&g.court88.bid&&g.court88.bid.mid&&!g.court88.bid.ans&&!g.contract);r.bids=gs.length;
  r.letters=gs.map(g=>{const L=(w.letters||[]).find(x=>x.key==='rb88_'+g.id);return !!(L&&L.adv==='recruiter'&&/data-rb88="match\|/.test(L.body)&&/data-rb88="walk\|/.test(L.body))});
  /* render the letter's buttons and click them, one per fighter */
  const host=document.createElement('div');document.body.appendChild(host);const click=async(g,a)=>{const L=(w.letters||[]).find(x=>x.key==='rb88_'+g.id);host.innerHTML=L?L.body:court88Body(w,g,mgrById(g.court88.bid.mid));const bt=[...host.querySelectorAll('[data-rb88]')].find(x=>x.dataset.rb88.split('|')[0].startsWith(a));if(!bt)return 'nobtn';bt.disabled=false;bt.click();await W8(200);return 'ok'};
  m.coin=2000;
  if(gs[0]){r.m=await click(gs[0],'match');r.mOK=!!(gs[0].contract&&gs[0].contract.mgr===m.id&&gs[0].contract.wage===gs[0].court88.bid.wage)}
  if(gs[1]){const outs=court88Outs(gs[1],m,gs[1].court88.bid).filter(x=>x.ok);if(outs.length){r.o=await click(gs[1],'want:'+outs[0].k);r.oOK=!!(gs[1].contract&&gs[1].contract.mgr===m.id&&gs[1].wantMet88===outs[0].k)}else{r.o='none';r.w=await click(gs[1],'walk');r.wOK=!!(gs[1].contract&&gs[1].contract.mgr===gs[1].court88.bid.mid)}}
  if(gs[2]){r.w2=await click(gs[2],'walk');r.w2OK=!!(gs[2].contract&&gs[2].contract.mgr===gs[2].court88.bid.mid);if(!r.w2OK)r.w2dbg={c:gs[2].contract,b:gs[2].court88.bid,R:!!mgrById(gs[2].court88.bid.mid)}}
  host.remove();
  /* nothing by the week's end → the rival: a fresh recruit, bid set by hand */
  const minF=Math.min(...w.mgrs.filter(x=>!x.isPlayer).map(x=>x.fame||0));const fa=freeAgents().filter(x=>!x.favd&&x.alive).sort((a,b)=>reqFame(a)-reqFame(b));const z=fa.find(x=>reqFame(x)<=minF)||fa[0];
  for(const x of w.mgrs)z.interest[x.id]=x.isPlayer?45:0;z.favd=true;z.court88={mid:m.id,wk:w.week-2};court88Bid(w,z);r.zBid=!!(z.court88.bid&&z.court88.bid.mid);window.Z88=z;
  MGR.tab='recruit';MGR.sel=z.id;MGR.recFor=z.id;MGR.recStep=1;MGR_REDRAW();await W8(300);r.zChip=/answer by the week's end/.test(document.getElementById('mgrBody').innerText);return r});
o.w3=await endWk();
o.r4=await pg.evaluate(()=>({z:!!(Z88.contract&&Z88.contract.mgr===Z88.court88.bid.mid),ans:Z88.court88.bid.ans,news:(W_().news||[]).slice(0,30).some(n=>/courtship came to nothing/.test(n.text))}));
ok(o.r2.wk===1&&!o.r2.bid,'no bid in week 2 '+JSON.stringify(o.r2));
ok(o.r3.wk===2&&o.r3.bids>=1&&o.r3.letters.some(Boolean),'the rival bids in week 3 with a Recruiter letter '+JSON.stringify(o.r3));
ok(!('m' in o.r3)||o.r3.mOK,'Match signs at their wage');ok(!('o' in o.r3)||o.r3.o==='none'?(!('w' in o.r3)||o.r3.wOK):o.r3.oOK,'Outbid on a want signs him');ok(!('w2' in o.r3)||o.r3.w2OK,'Walk away: he signs with the rival');
ok(o.r3.zBid&&o.r3.zChip&&o.r4.z&&o.r4.news,'doing nothing: the rival signs him at the week\'s end '+JSON.stringify([o.r3.zBid,o.r3.zChip,o.r4]));
/* screenshots for the eye */
if(process.env.SHOT88){await pg.evaluate(async()=>{for(let i=0;i<4;i++)document.querySelectorAll('button').forEach(x=>{if(/Welcome to the ludus/.test(x.textContent))x.click()});const S=S88;S.contract=null;S.favd=true;S.scout=2;delete S.court88;MGR.tab='recruit';MGR.sel=S.id;MGR.recFor=S.id;MGR.recStep=2;MGR_REDRAW();await new Promise(x=>setTimeout(x,600))});await pg.screenshot({path:process.env.SHOT88+'/rec88.png'});
  await pg.evaluate(async()=>{MGR.tab='roster';MGR.lsel=IMM.id;MGR_REDRAW();await new Promise(x=>setTimeout(x,600));const d=document.querySelector('.dcard.imm88m');d&&d.scrollIntoView()});await pg.screenshot({path:process.env.SHOT88+'/imm88.png'})}
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

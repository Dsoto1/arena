/* v1.06 SEASON LOCKS (393-v106lock, his d1a d2-1,2,3): the trade + loan deadline at the end of week 8 — from week 9 no new trades, loans or
   loan asks (player, rivals, Sica; a running loan finishes on its terms), the week-7 letter, signing only into an empty spot (fighters out on
   loan keep theirs), the Superbus roster frozen at the deadline, no releases in the playoff weeks (player + rivals), the locked buttons
   ("🔒 Deadline passed"), and the kill switch flavius_v106lockoff=1. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\.g/,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o.off)localStorage.setItem('flavius_v106lockoff','1')},{off:off?1:0});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
    const w=W_(),pm=me();w.welc99=1;pm.coin=3000;w.train='off';w.tplan=null;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.morale=80;g.contract.since=0;delete g.slot95}
    for(const m of w.mgrs)if(!m.isPlayer){m.relB=60;m.coin=Math.max(m.coin||0,900);m.rivalry=0;m.rivals={}}
    w.offers=[];MGR.tab='ludus';MGR_REDRAW();await W8(300);
    /* a fighter of ours we can lend, and the house that would borrow him */
    window.LEND=()=>{const w=W_(),pm=me();const m=loan102Houses(w)[0];const g=rosterOf(pm).filter(x=>!x.loanFrom&&!x.slot95&&!x.inj).sort((a,b)=>effOvr(a)-effOvr(b))[0];return {g,m}}});
  return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));await b.close();process.exit(1)}};
const pg=await open(false);

/* 1 · the week-7 letter */
const L=await ev(pg,async()=>{const w=W_();w.week=7;w.lk106w=null;MGR_REDRAW();await W8(300);const l=(w.letters||[]).find(x=>x.key==='lk106-'+w.season);
  const n1=(w.letters||[]).filter(x=>x.key==='lk106-'+w.season).length;MGR_REDRAW();await W8(200);const n2=(w.letters||[]).filter(x=>x.key==='lk106-'+w.season).length;
  return {has:!!l,title:l?String(l.title):'',once:n1===1&&n2===1,act:l?l.act:null,past7:lk106Past(w)}});
ok(L.has&&/Trade deadline after week 8/.test(L.title),'week 7: the "Trade deadline after week 8" letter '+JSON.stringify(L));ok(L.once,'the letter is sent once');ok(L.act===false,'it is an information letter (act:false)');ok(!L.past7,'week 7 is before the deadline');

/* 2 · week 8: deals still open; a loan made now runs on */
const P8=await ev(pg,async()=>{const w=W_(),pm=me();w.week=8;const {g,m}=LEND();const okL=lendTo(g,m,6,2);window.T={lent:g.id,lm:m.id};return {okL,past:lk106Past(w),loan:!!g.loanFrom}});
ok(!P8.past&&P8.okL&&P8.loan,'week 8: lending still works '+JSON.stringify(P8));

/* 3 · week 9: no new trades, loans or loan asks */
const P9=await ev(pg,async()=>{const w=W_(),pm=me();w.week=9;const r={past:lk106Past(w)};
  const {g,m}=LEND();r.lend=lendTo(g,m,6,2);r.lentAfter=!!g.loanFrom;
  /* borrow from a friendly house */
  const H=loan102Houses(w)[0];const hg=rosterOf(H).filter(x=>!x.loanFrom&&!x.inj)[0];r.borrow=borrowFrom(hg,H,6,2);r.borrowed=!!hg.loanFrom;
  /* open offers lapse at the deadline; accepting one is refused */
  const mine=rosterOf(pm).filter(x=>!x.loanFrom);const their=rosterOf(H).filter(x=>!x.loanFrom);
  const sw={id:'o_sw',kind:'swap',mid:H.id,gid:mine[0].id,give:[their[0].id],coin:0,until:w.week+2};const co={id:'o_co',kind:'coin',mid:H.id,gid:mine[1].id,coin:40,until:w.week+2};
  const la={id:'o_la',kind:'loan',mid:H.id,gid:mine[1].id,fee:5,weeks:2,until:w.week+1};
  r.acc=offerAccept(sw);r.accOwner=gById(mine[0].id).contract.mgr===pm.id;
  w.offers=[sw,co,la];MGR_REDRAW();await W8(300);r.lapsed=(w.offers||[]).length===0;r.offyes=!!document.querySelector('[data-m47="offyes"]:not([disabled])');
  /* the running loan made in week 8 continues and comes home on its terms */
  const lg=gById(T.lent);r.stillLent=!!lg.loanFrom&&lg.contract.mgr===T.lm;loansWeek(w,pm);r.still2=!!lg.loanFrom;for(let i=0;i<4&&lg.loanFrom;i++)loansWeek(w,pm);r.home=!lg.loanFrom&&lg.contract.mgr===pm.id;
  /* the rivals make no new trade offers or loan asks */
  const p0=TR106.p;TR106.p=1;let made=0;for(let i=0;i<6;i++){w.offers=[];offersWeek(w,pm);loansWeek(w,pm);made+=(w.offers||[]).length}TR106.p=p0;r.made=made;
  /* the rivals' poaching and Sica's lure stop */
  const sm=sicaMgr(w);const S0=Object.assign({},SICA);SICA.poach=1;const prey=rosterOf(pm).find(x=>!x.loanFrom);prey.morale=5;const before=sm?sm.poached||0:0;
  for(const x of w.mgrs)if(!x.isPlayer&&!x.sica){x.p.cunning=99;x.coin=5000}
  const own0=w.glads.filter(x=>x.alive&&x.contract).map(x=>x.id+':'+x.contract.mgr);
  for(let i=0;i<25;i++){cpuLeagueWeek();sicaPoach(w)}
  const own1=new Map(w.glads.filter(x=>x.alive&&x.contract).map(x=>[x.id,x.contract.mgr]));
  r.poached=own0.filter(s=>{const [id,mid]=s.split(':');return own1.has(id)&&own1.get(id)!==mid}).length;r.sica=sm?(sm.poached||0)-before:0;
  /* control: Sica lures before the deadline */
  w.week=5;const b5=sm?sm.poached||0:0;sicaPoach(w);r.sica5=sm?(sm.poached||0)-b5:-1;w.week=9;Object.assign(SICA,S0);prey.morale=80;
  /* the player's poach + trade proposals are refused */
  const v=poachVerdict(their[0],99);r.poachWhy=v.ok?'':String(v.why);
  let said='';MGR.trade=null;r.env=await ludusClick('envoy',H.id+'|trade',null,{say:t=>{said=t},redraw:()=>{}});r.envSaid=said;r.trade=MGR.trade;
  said='';r.go=await ludusClick('tradego',H.id,null,{say:t=>{said=t},redraw:()=>{}});r.goSaid=said;
  /* the team page: the trade button is locked */
  MGR.teamId=H.id;MGR.tab='team';MGR_REDRAW();await W8(400);const tb=document.querySelector('[data-mg="envoy"][data-id="'+H.id+'|trade"]');r.tbtn=tb?{dis:tb.disabled,txt:tb.textContent.trim()}:null;
  /* the roster ⋯ menu: lending shows the lock */
  MGR.tab='roster';MGR_REDRAW();await W8(400);const mb=[...document.querySelectorAll('[data-r104m]')].find(x=>{const gg=gById(x.dataset.r104m);return gg&&!gg.loanFrom&&!gg.slot95&&!gg.inj});
  if(mb){mb.click();await W8(300);const it=[...document.querySelectorAll('.r104pop [data-r104lend]')];const lk=[...document.querySelectorAll('.r104pop .lk106mx')];r.menu={n:it.length,lk:lk.length,txt:lk.map(x=>x.textContent.trim())};document.body.click();await W8(100);try{r104Close()}catch(e){}}
  return r});
console.log('WEEK9',JSON.stringify(P9));ok(P9.past,'week 9 is past the deadline');
ok(!P9.lend&&!P9.lentAfter,'week 9: the player cannot lend '+JSON.stringify(P9));ok(!P9.borrow&&!P9.borrowed,'week 9: the player cannot borrow');
ok(!P9.acc&&P9.accOwner,'week 9: a trade offer cannot be accepted');ok(P9.lapsed&&!P9.offyes,'week 9: open trade/loan offers lapse (no Accept button)');
ok(P9.made===0,'week 9: rivals make no trade offers or loan asks ('+P9.made+')');
ok(P9.stillLent&&P9.still2&&P9.home,'a loan made before the deadline runs on and comes home on its terms '+JSON.stringify([P9.stillLent,P9.still2,P9.home]));
ok(P9.poached===0,'week 9: no rival poaching ('+P9.poached+')');ok(P9.sica===0&&P9.sica5===1,'week 9: Sica lures nobody (before the deadline he does: '+P9.sica5+')');
ok(/Deadline passed/.test(P9.poachWhy),'the player\'s poach is refused with the reason: '+P9.poachWhy);
ok(P9.env===true&&!P9.trade&&/Deadline passed/.test(P9.envSaid),'"Propose a trade" is refused '+P9.envSaid);ok(P9.go===true&&/Deadline passed/.test(P9.goSaid),'Send the proposal is refused');
ok(P9.tbtn&&P9.tbtn.dis&&/🔒 Deadline passed/.test(P9.tbtn.txt),'the team page\'s trade button: 🔒 Deadline passed, disabled '+JSON.stringify(P9.tbtn));
ok(P9.menu&&P9.menu.n===0&&P9.menu.lk===1&&/Deadline passed/.test(P9.menu.txt[0]),'the roster ⋯ menu: one "🔒 Deadline passed" line, no lend items '+JSON.stringify(P9.menu));

/* 4 · signing after the deadline: only into an empty spot (fighters out on loan keep theirs) */
const SG=await ev(pg,async()=>{const w=W_(),pm=me();const cap=cap104(pm);const r={cap};
  /* roster on contract = cap-1, one of them lent out → the lent one keeps his place: no empty spot */
  for(const g of w.glads)if(g.loanFrom&&g.loanFrom.mid===pm.id&&g.contract){g.contract.mgr=pm.id;delete g.loanFrom}
  let ros=rosterOf(pm);while(ros.length<cap){const g=genGlad({ovr:50});w.glads.push(g);g.alive=true;g.contract={mgr:pm.id,wage:5,weeks:12,since:0};ros=rosterOf(pm)}
  while(ros.length>cap){ros[ros.length-1].contract=null;ros=rosterOf(pm)}
  const H=loan102Houses(w)[0];const out=ros.find(g=>!g.slot95);w.week=8;out.loanFrom={mid:pm.id,fee:5,weeks:3};out.contract.mgr=H.id;
  w.week=8;r.why8=cap103Why();w.week=9;r.why9=cap103Why();
  /* a free spot (roster + out on loan < cap) → signing allowed */
  rosterOf(pm)[0].contract=null;r.why9free=cap103Why();
  out.contract.mgr=pm.id;delete out.loanFrom;return r});
ok(SG.why8==='','week 8: a free spot (the lent fighter is away) can be signed into '+JSON.stringify(SG));
ok(/empty spot/.test(SG.why9),'week 9: the lent fighter keeps his place — no empty spot, signing refused: '+SG.why9);ok(SG.why9free==='','week 9: an empty spot under the cap can be filled');

/* 5 · the Superbus roster is frozen at the deadline */
const SB=await ev(pg,async()=>{const w=W_(),pm=me();w.week=9;w.lk106=null;const r={};const L=lk106Snap(w);r.snap=!!L&&L.s===w.season&&(L.r[pm.id]||[]).length>0;
  const old=rosterOf(pm).find(g=>!g.inj&&!g.loanFrom);const nw=genGlad({ovr:70});w.glads.push(nw);nw.alive=true;nw.contract={mgr:pm.id,wage:5,weeks:12,since:w.week};
  r.oldFit=po104Fit(w,pm,old);r.newFit=po104Fit(w,pm,nw);
  const H=w.mgrs.find(m=>!m.isPlayer&&!m.sica);const hn=genGlad({ovr:70});w.glads.push(hn);hn.alive=true;hn.contract={mgr:H.id,wage:5,weeks:12,since:w.week};r.aiNew=po104Fit(w,H,hn);
  r.fits=po104Fits(w,pm).map(g=>g.id).includes(nw.id);nw.contract=null;hn.contract=null;return r});
ok(SB.snap,'the deadline roster is recorded (w.lk106) '+JSON.stringify(SB));ok(SB.oldFit&&!SB.newFit&&!SB.fits,'the Superbus takes a fighter on the roster at the deadline, not one signed after');
ok(!SB.aiNew,'a rival\'s signing after the deadline cannot fight the Superbus either');

/* 6 · no releases in the playoff weeks (player + rivals) */
const RL=await ev(pg,async()=>{const w=W_(),pm=me();const r={};w.week=11;w.cal104=w.season;w.po104=Object.assign(w.po104||{},{s:w.season});w.night=w.night||{bouts:[]};const ph0=w.night.po104;w.night.po104='r1';
  r.po=lk106Po(w);MGR.tab='roster';const g=rosterOf(pm).find(x=>!x.loanFrom);MGR.lsel=g.id;MGR_REDRAW();await W8(400);
  let bt=document.querySelector('[data-mg="release"][data-id="'+g.id+'"]')||document.querySelector('[data-mg="release"]');r.found=!!bt;
  if(bt){r.dis=bt.disabled;r.txt=bt.textContent.trim();const gid=bt.dataset.id;bt.disabled=false;bt.click();await W8(80);const b2=document.querySelector('[data-mg="release"][data-id="'+gid+'"]');if(b2&&!b2.disabled){b2.disabled=false;b2.click();await W8(80)}r.kept=!!gById(gid).contract&&gById(gid).contract.mgr===pm.id}
  /* a rival with extras keeps them in the playoff weeks; before the deadline it cuts one */
  const H=w.mgrs.find(m=>!m.isPlayer&&!m.sica);const add=n=>{for(let i=0;i<n;i++){const x=genGlad({ovr:45});w.glads.push(x);x.alive=true;x.contract={mgr:H.id,wage:3,weeks:12,since:0}}};
  while(rosterOf(H).length<7)add(1);const amb=H.p.ambition;H.p.ambition=0;H.coin=0;const n0=rosterOf(H).length;cpuLeagueWeek();r.aiPo=[n0,rosterOf(H).length];
  w.night.po104=ph0;w.week=5;const n1=rosterOf(H).length;cpuLeagueWeek();r.ai5=[n1,rosterOf(H).length];H.p.ambition=amb;w.week=9;return r});
ok(RL.po,'the playoff week is recognised '+JSON.stringify(RL));ok(RL.found&&RL.dis&&/Deadline passed/.test(RL.txt),'the Release button is locked in the playoff weeks '+JSON.stringify(RL));
ok(RL.kept,'clicking Release anyway keeps the fighter');ok(RL.aiPo&&RL.aiPo[0]===RL.aiPo[1],'a rival releases nobody in the playoff weeks '+JSON.stringify(RL.aiPo));ok(RL.ai5&&RL.ai5[1]<RL.ai5[0],'control: before the deadline the rival cuts an extra '+JSON.stringify(RL.ai5));

/* 7 · a new season reopens the market */
const NS=await ev(pg,async()=>{const w=W_();w.week=13;return {past:lk106Past(w)}});ok(!NS.past,'week 1 of the next season: the market is open again');

/* 8 · kill switch */
const pk=await open(true);
const K=await ev(pk,async()=>{const w=W_();w.week=9;const {g,m}=LEND();return {on:LK106.on,past:lk106Past(w),lend:lendTo(g,m,6,2)}});
ok(!K.on&&!K.past&&K.lend,'kill switch flavius_v106lockoff=1: week 9 lending works as before '+JSON.stringify(K));

console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

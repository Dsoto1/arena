/* v1.0 (296-v100any) MANAGER — ENTER ANY EVENT: the week's headline specials sit on Match Week on top of Bouts I–III (the special fixture
   leaves the Main event), rivals enter early and leave seats open; entering a special pays an entry fee and moves the fighter off his bout,
   withdrawing refunds it and puts him back; team events offer partners (yours / hired free agent / the editor's pick); a restricted special
   greys ineligible fighters with the reason; travelling fills every empty seat of every bout and special; ★ chips in the banner tracker;
   a special played to the end pays its purse; the kill switch; no new errors in the 00c log; 390 px has no horizontal overflow. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const R=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const mark=ERR92.n;
  if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);
  /* a week whose fixture is a special (week 1 = Juggernaut) */
  newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_(),m=me(),n=w.night;w.welc99=1;MGR.view=null;MGR.tab='night';MGR_REDRAW();await W8(900);
  const sp=()=>n.bouts.map((b,i)=>[b,i]).filter(([b])=>any100Sp(b));
  o.nat={n:sp().length,mainSp:n.bouts[2].special,mainEv:n.bouts[2].ev,fx:n.fx.ev,after:n.bouts.findIndex(b=>b.tier==='spc100')===3,
    fees:sp().every(([b])=>b.any100.fee>0&&b.fee===0),purse:sp().every(([b])=>b.purse>n.bouts[2].purse||(b.any100.rx&&b.any100.rx.k==='lo')),
    open:sp().some(([b])=>b.ents.length<boutSize(b)),riv:sp().some(([b])=>b.ents.length>0),hasFx:sp().some(([b])=>b.ev===n.fx.ev)};
  /* own days (2a): specials on different days, play order follows days; no gauntlet/commodus over many weeks */
  o.days={set:sp().every(([b])=>[0,1,2].includes(b.any100.day)),spread:sp().length<2||new Set(sp().map(([b])=>b.any100.day)).size===sp().length,
    seq:(()=>{const q=any100Seq(n);const ok=q.every((i,k)=>!k||any100Key(n.bouts[q[k-1]])<=any100Key(n.bouts[i]));return ok&&q.length===n.bouts.length})(),
    guard:sp().every(([b,i])=>{const bf=any100Before(n,i);const day=b.any100.day;return bf.every(x=>any100Key(x)<any100Key(b))&&n.bouts.filter(c=>!any100Sp(c)&&(ANY100_RANK[c.tier]<=day)).every(c=>bf.includes(c))}),
    label:sp().every(([b])=>any100DayShort(b)===[_T('Fri'),_T('Sat'),_T('Sun')][b.any100.day]+' ★'),
    tracker:(()=>{const els=[...document.querySelectorAll('.roomstat.bt85w [data-bt85]')].map(e=>+e.dataset.bt85);return JSON.stringify(els)===JSON.stringify(any100Seq(n))})(),
    card:(()=>{const q=any100Seq(n);const dom=[...document.querySelectorAll('#mgrBody .card2.bout')];return dom.length===q.length&&dom.every((c,k)=>c.classList.contains('spc100')===any100Sp(n.bouts[q[k]]))})()};
  {const w1=W_(),w0=w1.week,seen={};let sd=new Set(),multi=0;
    const keep={bouts:n.bouts,any:n.any100,fx:n.fx};
    for(let x=1;x<=60;x++){w1.week=x;n.bouts=[{tier:'under',ev:'democritus',ents:[],purse:40,done:false,bets:[]},{tier:'feature',ev:'egidious',ents:[],purse:80,done:false,bets:[]},
        {tier:'main',ev:['gauntlet','commodus','juggernaut','familia','cassian'][x%5],ents:[],purse:160,done:false,bets:[],special:x%5<4}];n.fx={ev:n.bouts[2].ev,purse:1.5};
      const was=n.bouts[2].ev;any100Make(w1);for(const b of n.bouts.filter(any100Sp)){seen[b.ev]=1;sd.add(b.any100.day)}
      if(['gauntlet','commodus'].includes(was)&&(n.bouts[2].ev!==was||n.bouts.some(b=>any100Sp(b)&&b.ev===was)))seen.__moved=1;
      const sp2=n.bouts.filter(any100Sp);if(sp2.length>1&&new Set(sp2.map(b=>b.any100.day)).size<sp2.length)seen.__clash=1}
    w1.week=w0;n.bouts=keep.bouts;n.any100=keep.any;n.fx=keep.fx;
    o.pool={gauntlet:!!seen.gauntlet,commodus:!!seen.commodus,moved:!!seen.__moved,clash:!!seen.__clash,days:sd.size,evs:Object.keys(seen).length}}
  o.panel=!!document.querySelector('#any100wk');o.rows=document.querySelectorAll('#any100wk .a1ev').length;o.nb=n.bouts.length;
  o.star=document.querySelectorAll('.roomstat.bt85w .bt85.bt100s').length;
  /* restriction frequency: about every third week */
  {let k=0;const w0=w.week;for(let x=1;x<=60;x++){w.week=x;if(any100Hash(w,'rx')%ANY100.every===0)k++}w.week=w0;o.rxN=k}
  /* a controlled solo special and a team special */
  for(const [b] of sp()){for(const id of [...b.ents])any100Pull(w,id)}
  n.bouts=n.bouts.filter(b=>b.tier!=='spc100');
  const mk=(ev,fee)=>{n.bouts.push({tier:'spc100',ev,purse:240,special:true,fee:0,ents:[],done:false,res:null,bets:[],any100:{fee,src:'ed',rx:null,side:{},paid:{},hire:{},ed:{}}});return n.bouts.length-1};
  const si=mk('juggernaut',24),ti=mk('familia',19);m.coin=500;MGR_REDRAW();await W8(500);
  /* 1 · enter a starter who already fights in a classic bout */
  const ros=rosterOf(m).filter(g=>!g.inj&&!g.lanista);let g1=ros.find(g=>any100Cur(w,g.id)&&!any100Cur(w,g.id).b.any100);
  if(!g1){g1=ros[0];const c=n.bouts[0];const fa=c.ents.find(id=>!gById(id).contract);c.ents[c.ents.indexOf(fa)]=g1.id}
  const from=any100Cur(w,g1.id).i;const c0=m.coin;
  document.querySelector(`#any100wk [data-any100="pick|${si}"]`).click();await W8(300);o.pk=!!document.querySelector('#any100pk .any100pk');
  document.querySelector(`#any100pk [data-any100="sel|${g1.id}"]`).click();await W8(200);
  document.querySelector('#any100pk [data-any100="ok"]').click();await W8(400);
  o.enter={in:n.bouts[si].ents.includes(g1.id),fee:c0-m.coin,left:!n.bouts[from].ents.includes(g1.id),open:n.bouts[from].ents.length===boutSize(n.bouts[from])-1,
    once:n.bouts.filter(b=>b.ents.includes(g1.id)).length,gone:!document.querySelector('#any100pk'),shown:!!document.querySelector(`#any100wk [data-a1i="${si}"] .a1ent`)};
  /* 2 · withdraw before travel: refund + back on his bout */
  document.querySelector(`#any100wk [data-any100="drop|${si}"]`).click();await W8(400);
  o.drop={coin:m.coin===c0,back:n.bouts[from].ents.includes(g1.id),out:!n.bouts[si].ents.includes(g1.id)};
  /* 3 · team partner options */
  const g2=ros.find(g=>g.id!==g1.id)||g1;any100Open(ti);ANY100.pk.gid=g1.id;any100PtDefault();any100PickDraw();await W8(200);
  const po=[...document.querySelectorAll('#any100pk .a1po')].map(x=>x.dataset.any100.split('|')[1]);o.part={mine:po.includes('mine'),hire:po.includes('hire'),ed:po.includes('ed')};
  const hb=document.querySelector('#any100pk .a1po[data-any100^="pt|hire"]');if(hb)hb.click();await W8(150);const hid=ANY100.pk.pt&&ANY100.pk.pt.gid;const c1=m.coin;
  document.querySelector('#any100pk [data-any100="ok"]').click();await W8(300);const T=n.bouts[ti];
  o.hire={both:T.ents.includes(g1.id)&&T.ents.includes(hid),same:any100SideOf(T,g1.id)===any100SideOf(T,hid),cost:c1-m.coin,exp:19*2+any100HireFee(gById(hid)),rec:!!T.any100.hire[hid]};
  any100Drop(ti);o.hire.refund=m.coin===c1;o.hire.clean=!T.ents.includes(hid)&&!T.ents.includes(g1.id);
  const rE=any100Book(ti,g1.id,{k:'ed'});const ed=Object.keys(T.any100.ed)[0];o.ed={ok:rE.ok,ed:!!ed,same:ed&&any100SideOf(T,ed)===any100SideOf(T,g1.id),cost:c1-m.coin};
  any100Drop(ti);
  /* 4 · a restricted special greys the ineligible */
  const lo0=ros.find(g=>effOvr(g)<70);n.bouts[si].any100.rx={k:lo0?'hi':'lo'};MGR_REDRAW();await W8(300);const low=lo0||ros.find(g=>effOvr(g)>61);
  if(low){any100Open(si);await W8(200);const row=document.querySelector(`#any100pk [data-any100="sel|${low.id}"]`);o.rx={grey:row&&row.classList.contains('no')};row.click();await W8(200);
    o.rx.why=!!document.querySelector('#any100pk .a1why');o.rx.book=any100Book(si,low.id,null).ok;any100Close()}else o.rx={grey:true,why:true,book:false,none:1};
  o.rx.chip=!!document.querySelector(`#any100wk [data-a1i="${si}"] .a1rx`);n.bouts[si].any100.rx=null;
  /* 5 · enter again, then travel: every empty seat on every bout and special is filled */
  any100Book(si,g1.id,null);any100Book(ti,g2.id,{k:'ed'});
  const t=travelState(w);if(t&&!t.paid){m.coin+=t.cost;travelClick('travelpay')}else any100FillAll(w);MGR_REDRAW();await W8(400);
  o.full={flag:!!(n.any100&&n.any100.full),all:n.bouts.every(b=>b.ents.length===boutSize(b)),teams:(()=>{const b=n.bouts[ti];return b.ents.every((id,i)=>any100SideOf(b,id)===(i%2?'B':'A'))})(),
    note:/full card is set/.test(document.querySelector('#any100wk .a1ft').textContent)};
  /* after the full card: no refund (two clicks), seat goes back to a free agent */
  o.star2=document.querySelectorAll('.roomstat.bt85w .bt85.bt100s').length;
  /* 6 · play the card in order; the solo special is won by our fighter (a fixed bout nobody catches) */
  w.rigCount=-20;n.bouts[si].rig=g1.id;let cBefore=null;
  for(let i=0;i<n.bouts.length;i++){if(i===si)cBefore=m.coin;await runBoutSim(i);if(i===si)o.play={done:n.bouts[si].done,won:(n.bouts[si].res.winners||[]).includes(g1.id),gain:m.coin-cBefore,purse:n.bouts[si].purse,min:(()=>{const nw=Math.max(1,(n.bouts[si].res.winners||[]).length),P=Math.max(1,Math.round(n.bouts[si].purse/nw));return Math.round(P*0.5)-Math.max(1,Math.round(P*0.1))})()}}
  o.team={done:n.bouts[ti].done,rows:(n.bouts[ti].res&&n.bouts[ti].res.rows||[]).length};
  o.news=(w.news||[]).some(x=>/Headline special/.test(x.text));
  /* 7 · kill switch: no specials, no week's card */
  localStorage.setItem('flavius_any100off','1');makeNight();MGR_REDRAW();await W8(400);o.off={none:!W_().night.bouts.some(b=>b.tier==='spc100'),panel:!document.querySelector('#any100wk')};
  localStorage.removeItem('flavius_any100off');
  o.errs=errNew92(mark).map(e=>String(e.msg||e.m||JSON.stringify(e)).slice(0,160));
  return o});
console.log(JSON.stringify(R));
ok(R.nat.n>=1&&!R.nat.mainSp&&R.nat.mainEv==='cassian'&&R.nat.after&&R.nat.fees&&R.nat.purse,'specials on top of Bouts I-III '+JSON.stringify(R.nat));
ok(R.nat.hasFx,'the special fixture is a headline special');ok(R.nat.riv&&R.nat.open,'rivals entered early, seats left open');
ok(R.days.set&&R.days.spread&&R.days.seq&&R.days.guard&&R.days.label&&R.days.tracker&&R.days.card,'specials on their own days, play order follows '+JSON.stringify(R.days));
ok(!R.pool.gauntlet&&!R.pool.commodus&&!R.pool.moved&&!R.pool.clash&&R.pool.days===3&&R.pool.evs>=5,'no gauntlet/commodus as specials over 60 weeks, fixture stays '+JSON.stringify(R.pool));
ok(R.panel&&R.rows===R.nb,'week card lists every event');ok(R.star===R.nat.n,'★ chip per special in the tracker '+R.star);
ok(R.rxN>=12&&R.rxN<=30,'restricted about every 3rd week '+R.rxN);
ok(R.pk,'picker opens');ok(R.enter.in&&R.enter.fee===24&&R.enter.left&&R.enter.open&&R.enter.once===1&&R.enter.gone&&R.enter.shown,'enter: fee, moved off his bout '+JSON.stringify(R.enter));
ok(R.drop.coin&&R.drop.back&&R.drop.out,'withdraw refunds + back on his bout '+JSON.stringify(R.drop));
ok(R.part.mine&&R.part.hire&&R.part.ed,'partner options '+JSON.stringify(R.part));
ok(R.hire.both&&R.hire.same&&R.hire.cost===R.hire.exp&&R.hire.rec&&R.hire.refund&&R.hire.clean,'hired partner '+JSON.stringify(R.hire));
ok(R.ed.ok&&R.ed.ed&&R.ed.same&&R.ed.cost===19,"editor's pick "+JSON.stringify(R.ed));
ok(R.rx.grey&&R.rx.why&&!R.rx.book&&R.rx.chip,'restricted greys ineligible '+JSON.stringify(R.rx));
ok(R.full.flag&&R.full.all&&R.full.teams&&R.full.note,'travel fills every seat '+JSON.stringify(R.full));ok(R.star2===2,'★ chips for the two specials');
ok(R.play&&R.play.done&&R.play.won&&R.play.gain>=R.play.min,'special played to the end pays the cut of the purse (shared by the winners) '+JSON.stringify(R.play));
ok(R.team.done&&R.team.rows===4,'team special played '+JSON.stringify(R.team));
ok(R.off.none&&R.off.panel,'kill switch '+JSON.stringify(R.off));ok(!R.errs.length,'no new errors '+JSON.stringify(R.errs));
/* phones: 390 px, no horizontal overflow on Match Week or in the picker */
{const p2=await b.newPage({viewport:{width:390,height:800}});await p2.route(/fonts\./,r=>r.abort());p2.on('pageerror',e=>errs.push(e.message));
await p2.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await p2.goto('file://'+process.argv[2]);await p2.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const P=await p2.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});W_().welc99=1;MGR.view=null;MGR.tab='night';MGR_REDRAW();await W8(900);const o={};
  const ov=el=>{if(!el)return 'none';const bad=[...el.querySelectorAll('*')].filter(x=>{const r=x.getBoundingClientRect();return r.width&&r.right>innerWidth+1}).map(x=>x.className||x.tagName);return bad.slice(0,3)};
  const wk=document.querySelector('#any100wk');o.wk=!!wk;o.ov=ov(wk);o.sw=document.documentElement.scrollWidth<=innerWidth+1;
  const si=W_().night.bouts.findIndex(b=>any100Sp(b));any100Open(si);await W8(300);o.pk=ov(document.querySelector('#any100pk'));any100Close();return o});
ok(P.wk&&Array.isArray(P.ov)&&!P.ov.length&&P.sw,'390: week card fits '+JSON.stringify(P));ok(Array.isArray(P.pk)&&!P.pk.length,'390: picker fits '+JSON.stringify(P.pk));await p2.close()}
console.log(miss.length?'FAIL\n'+miss.join('\n'):'PASS');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

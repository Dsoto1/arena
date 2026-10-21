/* tv105o — v1.05 Manager recruiting (378-v105rec): B49 a recruit who signed elsewhere = a plain notice (no deadline badge, no button, no advice, files itself) ·
   B50/P1a a fighter signed in the last 4 weeks takes no offer: no rival poach, no trade ask, no loan ask, no Sica poach (forced AI paths), open again in week 5;
   the player's offer / trade on a rival's new signing is disabled with the reason · the "🆕 settling in · N wk" tag · B51 a bargain letter is not made for a
   recruit already on the Recruiting board and files when he is added · B52 the mail panel hides when empty and returns with a letter · kill switch
   flavius_v105recoff=1 restores the old behaviour · no new errors. Optional argv[3] = a folder for screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SH=process.argv[3]||'';
const open=async(off)=>{console.log('open',Date.now()%100000);const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('console',m=>{if(/^st /.test(m.text()))console.log(m.text())});pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105recoff','1')},off?1:0);
  await require('./_wait').boot(pg,{menu:false,seed:1});await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=5000;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    if(!w.night&&typeof makeNight==='function')makeNight();w.week=6;MGR.tab='ludus';MGR_REDRAW();await W8(600)});return pg};
const shot=async(pg,n)=>{if(SH)try{await pg.screenshot({path:SH+'/'+n+'.png'})}catch(e){}};

{const pg=await open(false);
  /* ---------- B49 ---------- */
  const a=await pg.evaluate(async()=>{const w=W_(),pm=me();const out={};
    const R=w.mgrs.find(m=>!m.isPlayer&&!m.sica);const free=freeAgents();
    /* (1) he signed with another house before the answer: of104Answer's own letter */
    const g1=free[0];g1.contract={mgr:R.id,wage:20,weeks:8,since:w.week};w.of104={[g1.id]:{wage:20,weeks:8,bonus:0,pledge:false,rudis:false,wk:w.week-1}};of104Answer(w,w.week);
    const L1=(w.letters||[]).find(l=>l.key==='of104_'+g1.id+'_'+w.week);out.l1=L1?{title:L1.title,body:L1.body,act:L1.act,until:L1.until,notice:L1.notice105}:null;
    /* (2) he chose a rival's terms: force the snatch branch (interest, roll) by trying weeks */
    let L2=null,g2=free[1];const Rl=R;for(let wk0=w.week;wk0<w.week+80&&!L2;wk0++){g2.contract=null;g2.interest=g2.interest||{};g2.interest[Rl.id]=100;g2.interest[pm.id]=0;
      for(const x of rosterOf(Rl).slice(3))x.contract=null;w.of104={[g2.id]:{wage:askWage(g2),weeks:8,bonus:0,pledge:false,rudis:false,wk:1}};of104Answer(w,wk0);
      if(g2.contract&&g2.contract.mgr===Rl.id)L2=(w.letters||[]).find(l=>l.key==='of104_'+g2.id+'_'+w.week)}
    out.l2=L2?{title:L2.title,body:L2.body,act:L2.act,until:L2.until}:null;out.n2=g2.name;out.n1=g1.name;out.house=R.ludus;
    /* (3) still a free agent: the advice stays */
    let L3=null,g3=null;for(const cand of freeAgents().filter(g=>g!==g1&&g!==g2).slice(0,12)){if(L3)break;cand.interest={[pm.id]:0};w.of104={[cand.id]:{wage:askWage(cand),weeks:8,bonus:0,pledge:false,rudis:false,wk:1}};of104Answer(w,w.week+50);const x=(w.letters||[]).find(l=>l.key==='of104_'+cand.id+'_'+w.week);if(x&&/says no/.test(x.title)){L3=x;g3=cand}}
    out.l3=L3?{title:L3.title,body:L3.body,act:L3.act}:null;
    MGR.tab='ludus';MGR_REDRAW();await W8(500);
    const rows=[...document.querySelectorAll('#desk99 .dk99row')].map(r=>r.textContent);
    out.taskRows=rows.filter(t=>t.includes(g1.name)||t.includes(g2.name));
    const lets=[...document.querySelectorAll('#desk99 .dk99lt>details.mail')].map(d=>({t:d.querySelector('summary').textContent,btn:d.querySelectorAll('.mbody button').length,body:d.querySelector('.mbody')?d.querySelector('.mbody').textContent:''}));
    out.lets=lets.filter(l=>l.t.includes(g1.name)||l.t.includes(g2.name));
    out.badge=/ANSWER BY/i.test(document.querySelector('#desk99').textContent.split('Letters')[0]&&(out.taskRows.join(' ')));
    if(window.openDrawer)window.openDrawer();const mb=document.querySelector('.lu100mb');if(mb)mb.click();await W8(300);
    /* files itself the week after */
    w.week++;MGR_REDRAW();await W8(300);out.filed=[L1,L2].every(l=>!l||l.read===true);w.week--;
    return out});
  await shot(pg,'b49-notice');
  console.log('B49',JSON.stringify(a));
  ok(a.l1&&/signed with/.test(a.l1.title)&&a.l1.act===false&&a.l1.notice&&/their terms beat yours/.test(a.l1.body)&&!/<button/.test(a.l1.body),'signed-elsewhere letter 1 is a plain notice');
  ok(a.l2&&/signed with/.test(a.l2.title)&&a.l2.act===false&&/their terms beat yours/.test(a.l2.body)&&!/<button|interested enough|Raise the wage/.test(a.l2.body),'the "chose" letter is a plain notice with no advice');
  ok(a.l3&&!/signed with/.test(a.l3.title)&&/interested enough yet/.test(a.l3.body),'a free agent who says no keeps the advice (and its link)');
  ok(a.taskRows.length===0,'no weekly-task row (no ANSWER BY badge) for a signed-elsewhere notice: '+a.taskRows.join('|'));
  ok(a.lets.length>=1&&a.lets.every(l=>l.btn===0&&!/answer by/i.test(l.t+l.body)),'the notice in the letters has no button / badge');
  ok(a.filed,'the notice files itself the week after');
  await pg.close()}

{const pg=await open(false);
  /* ---------- B50 / P1a ---------- */
  const r=await pg.evaluate(async()=>{const w=W_(),pm=me();const out={};w.week=3; /* v1.06 (393): the 4 protected weeks + week 5 sit before the week-8 trade deadline */const sM=Math.random;const low=()=>{let c=0;return()=>c++<80?0:sM.call(Math)};const rosterIds=()=>rosterOf(pm).map(g=>g.id);
    const mine=rosterOf(pm).sort((a,b)=>effOvr(b)-effOvr(a));const f=mine[mine.length-1];/* the weakest: the one a trade ask picks with two on the books */
    const rivals=w.mgrs.filter(m=>!m.isPlayer&&!m.sica);const R=rivals[0];
    for(const g of w.glads){g.morale=80;if(g.inj)g.inj=null}
    f.contract.since=w.week;out.left=set105Left(f);out.tag=gTags(f).includes('settling in · 4 wk');
    /* rival poach (17 cpuLeagueWeek): forced */
    const sc=loyaltyOf;
    const force=()=>{for(const m of rivals){m.p.cunning=100;m.coin=99999;m.fame=9999;m.pact=0}f.morale=10;f.ovr=Math.max(f.ovr,75);if(f.pot<f.ovr)f.pot=f.ovr;window.loyaltyOf=()=>0};
    force();Math.random=low();const run1=async()=>{try{cpuLeagueWeek()}catch(e){out.err=String(e)}};
    await run1();out.pPoach=f.contract&&f.contract.mgr===pm.id;
    w.week=f.contract.since+4;out.left5=set105Left(f);force();Math.random=low();await run1();out.openPoach=!(f.contract&&f.contract.mgr===pm.id);
    f.contract.mgr=pm.id;f.contract.since=3;w.week=3;Math.random=sM;window.loyaltyOf=sc;
    console.log('st sica');
    const sm=sicaMgr(w);out.hasSica=!!sm;f.morale=10;Math.random=low();try{sicaPoach(w)}catch(e){out.err=String(e)}Math.random=sM;out.pSica=f.contract.mgr===pm.id;
    w.week=7;f.morale=10;Math.random=low();try{sicaPoach(w)}catch(e){out.err=String(e)}Math.random=sM;out.openSica=f.contract.mgr!==pm.id;f.contract.mgr=pm.id;f.morale=80;f.contract.since=3;w.week=3;
    console.log('st trade');/*: two non-loaned fighters, the protected one is the weaker */
    const others=rosterOf(pm).filter(g=>g!==f);const keep=others.sort((a,b)=>effOvr(b)-effOvr(a))[0];const st=[];for(const g of others)if(g!==keep){st.push([g,g.loanFrom]);g.loanFrom={mid:pm.id,fee:0,weeks:9}}
    for(const m of w.mgrs)if(!m.isPlayer){m.coin=99999;m.relB=60;m.rivalry=0;m.rivals={}}
    const askRun=()=>{w.offers=[];const tr=typeof TR106!=='undefined'?TR106.on:null;if(tr!=null)TR106.on=false; /* v1.06 (394): 47's forced path, not the motive offers */const t0=(w.tlog||[]).length;Math.random=low();try{offersWeek(w,pm)}catch(e){out.err=String(e)}Math.random=sM;if(tr!=null)TR106.on=tr;return (w.offers||[]).filter(o=>o.gid===f.id).length};
    let n=0;for(let i=0;i<12;i++)n+=askRun();out.pAsk=n;
    w.week=7;n=0;for(let i=0;i<12;i++)n+=askRun();out.openAsk=n;w.week=3;
    for(const [g,L] of st){if(L)g.loanFrom=L;else delete g.loanFrom}
    console.log('st loan');/*: the protected fighter is the only bench man */
    const ros=rosterOf(pm).sort((a,b)=>effOvr(b)-effOvr(a));const away=[];while(rosterOf(pm).length>4){const x=rosterOf(pm).sort((a,b)=>effOvr(a)-effOvr(b)).find(g=>g!==f);away.push([x,x.contract.mgr]);x.contract.mgr=R.id}
    for(const g of rosterOf(pm))if(g!==f)g.ovr=Math.max(g.ovr,f.ovr+8);
    const loanRun=()=>{w.offers=[];Math.random=low();try{loansWeek(w,pm)}catch(e){out.err=String(e)}Math.random=sM;return (w.offers||[]).filter(o=>o.gid===f.id).length};
    out.benchF=depthOf(pm).bench.map(g=>g.id).includes(f.id);
    for(const m of w.mgrs)if(!m.isPlayer&&!m.sica){m.relB=40}
    n=0;for(let i=0;i<8;i++)n+=loanRun();out.pLoan=n;w.week=7;n=0;for(let i=0;i<8;i++)n+=loanRun();out.openLoan=n;w.week=3;
    for(const [x,mm] of away)x.contract.mgr=mm;
    console.log('st offer');
    const p=rosterOf(R)[0];p.contract.since=w.week;p.scout=3;
    out.verdict=poachVerdict(p,99);out.why=out.verdict.why||'';window.__p=p;
    MGR.tab='recruit';MGR.view=null;MGR_REDRAW();await W8(400);MGR.filter='signed';MGR.sel=p.id;MGR_REDRAW();await W8(500);
    const pb=document.querySelector('#mgrBody [data-mg="poach"]');out.dbg=[document.querySelectorAll('#mgrBody [data-mg="sel"]').length,!!document.querySelector('#mgrBody [data-mg="sel"][data-id="'+p.id+'"]'),MGR.sel,MGR.filter,pb?pb.outerHTML.slice(0,200):null,[...document.querySelectorAll('#mgrBody .sect')].map(e=>e.textContent).join('|').slice(0,300)];out.poachBtn=!!pb&&pb.hasAttribute('disabled')&&/settling in/.test(pb.dataset.dis||'');
    out.poachWhy=!!document.querySelector('#mgrBody .set105why');out.recTag=!!document.querySelector('#mgrBody .set105');
    MGR.trade={mid:R.id,mine:pm.id,theirs:p.id,coin:0};MGR.teamId=R.id;MGR.tab='team';MGR_REDRAW();await W8(500);
    const tg=document.querySelector('#mgrBody [data-mg="tradego"]');const opt=document.querySelector('#trTheirs option[value="'+p.id+'"]');
    out.tradeBtn=!!tg&&tg.hasAttribute('disabled')&&/settling in/.test(tg.dataset.dis||'');out.tradeOpt=!!opt&&/settling in/.test(opt.textContent);
    w.week=7;out.verdictOpen=poachVerdict(p,99).set105!==1;w.week=3;
    /* the tag on the roster rows */
    MGR.tab='roster';MGR.sel=f.id;MGR.teamId=null;MGR_REDRAW();await W8(600);
    out.rowTag=[...document.querySelectorAll('#mgrBody .r104r')].some(r=>r.dataset.id===f.id&&/settling in · 4 wk/.test(r.textContent));
    out.fid=f.id;return out});
  console.log('B50',JSON.stringify(r));
  await shot(pg,'b50-roster-tag');
  ok(!r.err,'no exception in the forced AI paths: '+r.err);
  ok(r.left===4&&r.tag,'a new signing shows 4 weeks left and the tag');
  ok(r.pPoach&&r.openPoach,'rival poach: none for 4 weeks, possible in week 5 (forced path)');
  ok(r.hasSica&&r.pSica&&r.openSica,'Sica poach: none for 4 weeks, possible in week 5 (forced path)');
  ok(r.pAsk===0&&r.openAsk>0,'trade ask: none for 4 weeks ('+r.pAsk+'), asked in week 5 ('+r.openAsk+')');
  ok(r.benchF&&r.pLoan===0&&r.openLoan>0,'loan ask: none for 4 weeks ('+r.pLoan+'), asked in week 5 ('+r.openLoan+')');
  ok(r.verdict&&r.verdict.ok===false&&/settling in/.test(r.why),'poachVerdict refuses with the reason');
  ok(r.poachBtn&&r.poachWhy,'the Poach button is disabled with the reason');
  ok(r.tradeBtn&&r.tradeOpt,'the trade card disables Send and tags his row');
  ok(r.verdictOpen,'open again in week 5');
  ok(r.rowTag,'the roster row shows the tag');
  await pg.close()}

{const pg=await open(false);
  /* ---------- B51 + B52 ---------- */
  const r=await pg.evaluate(async()=>{const w=W_(),pm=me();const out={};
    for(const g of freeAgents())g.alive=false;
    const mk=(f)=>{const g=genGlad({ovr:60});g.name='Tullus '+f;g.fame=f;g.interest={};g.scout=2;w.glads.push(g);return g};
    const cheap=mk(0);mk(100);mk(100);mk(100);cheap.fame=0;{const have=new Set(rosterOf(pm).map(g=>g.cls));cheap.cls=Object.keys(CLASSES).find(k=>!have.has(k))||cheap.cls}
    w.letters=[];w.rec84={};
    const key0=recruiter84(w);out.made=key0;const L0=(w.letters||[]).find(l=>l.key===key0);const isBargain=L0&&/data-rec84="[^"]+"/.test(L0.body);out.bargainOf=isBargain?/data-rec84="([^"]+)"/.exec(L0.body)[1]:null;
    /* already on the board when the task would be made: not made */
    if(out.bargainOf){const g=gById(out.bargainOf);w.letters=[];w.rec84={};g.favd=true;const k=recruiter84(w);const L=(w.letters||[]).find(l=>l.key===k);out.notMade=!L||!new RegExp('data-rec84="'+g.id+'"').test(L.body);
      /* put there later: the letter goes away */
      g.favd=false;w.letters=[];w.rec84={};const k2=recruiter84(w);const L2=(w.letters||[]).find(l=>l.key===k2);out.again=!!L2&&new RegExp('data-rec84="'+g.id+'"').test(L2.body);
      MGR.tab='ludus';MGR_REDRAW();await W8(400);const shown=()=>[...document.querySelectorAll('#desk99 .dk99lt>details.mail,#desk99 .dk99row')].some(e=>e.textContent.includes(g.name)&&/bargain|Pick of the week/i.test(e.textContent));
      out.shown0=shown();g.favd=true;MGR_REDRAW();await W8(400);out.shown1=shown();out.read=!!(L2&&L2.read)}
    /* B52: the mail panel is empty -> hidden; a letter -> shown */
    w.letters=[];w.mailLog=[];w.review=null;if(w.qsLast)w.qsLast.seen=true;MGR.tab='ludus';MGR_REDRAW();await W8(500);
    const panel=()=>({btn:!!document.querySelector('#desk99 .lu100mb'),drawer:!!document.querySelector('#desk99 .lu100mail'),box:!!document.querySelector('#mailBox')});
    out.empty=panel();out.emptyDesk=!!document.querySelector('#desk99');
    sendLetter(w,{key:'t105',kind:'letter',from:'test',seal:'✉',title:'A word',until:w.week+1,act:false,body:'<p>hi</p>'});MGR_REDRAW();await W8(500);out.full=panel();
    out.fullListed=!!document.querySelector('#desk99 .dk99lt>details.mail');
    return out});
  console.log('B51/52',JSON.stringify(r));
  ok(r.made&&r.bargainOf,'the Recruiter makes a bargain letter with no one on the board');
  ok(r.notMade,'not made when the recruit is already on the board');ok(r.again,'made again once he is off the board');
  ok(r.shown0===true&&r.shown1===false&&r.read,'put on the board later: the letter goes away');
  ok(!r.empty.btn&&!r.empty.drawer&&!r.empty.box,'B52: the empty mail panel is hidden: '+JSON.stringify(r.empty));
  ok(r.full.btn&&r.full.drawer&&r.fullListed,'B52: a letter brings the panel back: '+JSON.stringify(r.full));
  await pg.close()}

{const pg=await open(false);
  /* ---------- B57: "answer by" only for a real decision ---------- */
  const r=await pg.evaluate(async()=>{const w=W_(),pm=me();const out={};w.letters=[];w.mailLog=[];if(w.qsLast)w.qsLast.seen=true;
    w.week=9;try{pj104Send(w)}catch(e){out.pjErr=String(e)}
    let L=(w.letters||[]).find(l=>/^pj104-/.test(l.key));out.real=!!L;
    if(!L){sendLetter(w,{key:'pj104-x',kind:'letter',from:'the Consilium',adv:'consilium',seal:'🏛',title:'The road to the Superbus',until:w.week+2,body:'<p>x</p><div class="acts"><button class="btn tksm" type="button" data-po104="bracket">The bracket</button></div>'});L=w.letters.find(l=>l.key==='pj104-x')}
    out.act=L.act;w.week=8; /* v1.06 (393): loan asks stop at the week-8 deadline */
    /* a real decision: a house asks to borrow a bench fighter */
    const R=w.mgrs.find(m=>!m.isPlayer&&!m.sica);const bench=depthOf(pm).bench[0]||rosterOf(pm)[rosterOf(pm).length-1];
    w.offers=[{id:'o1',kind:'loan',mid:R.id,gid:bench.id,fee:9,weeks:3,until:w.week+1}];
    openManager();await __W.mgrDrawn();MGR.tab='ludus';MGR_REDRAW();await W8(500);
    const rows=[...document.querySelectorAll('#desk99 .dk99row')];
    const dueOf=t=>{const r=rows.find(x=>x.textContent.includes(t));return r?(r.querySelector('.due99')||{}).textContent||'':null};
    out.rowCount=rows.length;out.consDue=dueOf('Superbus');out.loanDue=dueOf(R.ludus);out.rowsTxt=rows.map(r=>r.textContent.slice(0,60));
    out.inLetters=[...document.querySelectorAll('#desk99 .dk99lt>details.mail')].some(d=>/Superbus/.test(d.textContent));
    out.noBadgeText=!/answer by/i.test([...document.querySelectorAll('#desk99 .dk99lt>details.mail')].filter(d=>/Superbus/.test(d.textContent)).map(d=>d.textContent).join(' '));
    return out});
  console.log('B57',JSON.stringify(r));
  ok(r.act===false,'the Consilium race letter is information (act:false)');
  ok(r.consDue===null&&r.inLetters&&r.noBadgeText,'the race letter has no "answer by" badge and sits in the letters: '+r.consDue);
  ok(r.loanDue&&/answer by/i.test(r.loanDue),'a real decision (a loan ask) still has the badge: '+r.loanDue+' '+JSON.stringify(r.rowsTxt));
  await pg.close()}

{const pg=await open(false);
  /* ---------- M1a: tasks hold decisions, mail holds information ---------- */
  const r=await pg.evaluate(async()=>{const w=W_(),pm=me();const out={};w.letters=[];w.mailLog=[];if(w.qsLast)w.qsLast.seen=true;w.week=9;
    const R=w.mgrs.find(m=>!m.isPlayer&&!m.sica);const g1=freeAgents()[0];g1.contract={mgr:R.id,wage:20,weeks:8,since:w.week};w.of104={[g1.id]:{wage:20,weeks:8,bonus:0,pledge:false,rudis:false,wk:w.week-1}};of104Answer(w,w.week); /* signed elsewhere */
    sendLetter(w,{key:'pj104-x',kind:'letter',from:'the Consilium',adv:'consilium',seal:'🏛',title:'The road to the Superbus',until:w.week+2,body:'<p>x</p><div class="acts"><button class="btn tksm" type="button" data-po104="bracket">The bracket</button></div>'});
    w.week=8; /* v1.06 (393): loan asks stop at the week-8 deadline */const bench=depthOf(pm).bench[0]||rosterOf(pm)[rosterOf(pm).length-1];w.offers=[{id:'o1',kind:'loan',mid:R.id,gid:bench.id,fee:9,weeks:3,until:w.week+1}];
    openManager();await __W.mgrDrawn();MGR.tab='ludus';MGR_REDRAW();await W8(500);
    const rows=()=>[...document.querySelectorAll('#desk99 .dk99row')];const mail=()=>[...document.querySelectorAll('#desk99 .dk99lt>details.mail')];
    const info=[g1.name,'Superbus'];
    out.infoInTasks=info.filter(t=>rows().some(r=>r.textContent.includes(t)));
    out.infoMail=info.map(t=>{const d=mail().find(x=>x.textContent.includes(t));return d?{btn:d.querySelectorAll('.mbody button').length,badge:/answer by/i.test(d.textContent)}:null});
    const lr=rows().find(r=>r.textContent.includes(R.ludus));out.loanTask=!!lr&&/answer by/i.test(lr.textContent);out.loanInMail=mail().some(d=>d.textContent.includes(R.ludus)&&/borrow|loan/i.test(d.textContent));
    /* a task clears itself the moment its condition is met: lock the Yard plan */
    const no=()=>rows().some(r=>/No drills set/.test(r.textContent));out.drillsBefore=no();
    thPlan(w).reglk=1;MGR_REDRAW();await W8(400);out.drillsAfter=no();
    return out});
  console.log('M1a',JSON.stringify(r));
  ok(r.infoInTasks.length===0,'information letters are not tasks: '+r.infoInTasks);
  ok(r.infoMail.every(x=>x&&x.btn===0||x&&x.btn===1&&!x.badge)&&r.infoMail.every(x=>x&&!x.badge),'the signed-elsewhere notice and the race letter live in mail with no badge: '+JSON.stringify(r.infoMail));
  ok(r.loanTask&&!r.loanInMail,'a loan ask is a task with its badge, once (not in mail)');
  ok(r.drillsBefore===true&&r.drillsAfter===false,'"No drills set" is a task until the Yard plan is locked, then it clears at once: '+r.drillsBefore+' '+r.drillsAfter);
  await pg.close()}

{const pg=await open(false);
  /* ---------- B59: "asks for a fight" clears when he is entered, returns when withdrawn ---------- */
  const r=await pg.evaluate(async()=>{const w=W_(),pm=me();const out={};if(!w.night||!w.night.bouts||!w.night.bouts.length){makeNight()}w.letters=[];
    const n=w.night;const bo=n.bouts.find(b=>!b.done);const g=rosterOf(pm).find(x=>!x.inj);for(const b2 of n.bouts)b2.ents=b2.ents.filter(x=>x!==g.id);g.wantFight={week:w.week};
    openManager();await __W.mgrDrawn();MGR.tab='ludus';MGR_REDRAW();await W8(500);
    const ask=()=>[...document.querySelectorAll('#desk99 .dk99row')].some(r=>r.textContent.includes(g.name)&&/asks for a fight/.test(r.textContent));
    out.before=ask();
    bo.ents.push(g.id);MGR_REDRAW();await W8(400);out.entered=ask();out.keep=!!g.wantFight;
    bo.ents=bo.ents.filter(x=>x!==g.id);MGR_REDRAW();await W8(400);out.back=ask();
    return out});
  console.log('B59',JSON.stringify(r));
  ok(r.before,'the "asks for a fight" task is there');ok(r.before&&!r.entered&&r.keep,'it clears the moment he is entered in a bout');ok(r.back,'it comes back if he is withdrawn');
  await pg.close()}

{const pg=await open(false);
  /* ---------- B54: Recruiting keeps the options panel in view ---------- */
  for(const vw of [1440,700]){await pg.setViewportSize({width:vw,height:900});
  const r=await pg.evaluate(async()=>{const w=W_();const out={};me().coin=5000;openManager();await __W.mgrDrawn();MGR.tab='recruit';MGR.view=null;MGR_REDRAW();await W8(500);
    const mb=document.getElementById('mBody');const rows=[...document.querySelectorAll('#mgrBody [data-mg="sel"]')];const row=rows[Math.min(rows.length-1,12)];row.scrollIntoView({block:'center'});await W8(200);
    const card=()=>{const b=document.querySelector('#mgrBody [data-rec98a]');return b?b.closest('.card2'):null};
    const inView=()=>{const c=card();if(!c)return null;const r=c.getBoundingClientRect(),b=mb.getBoundingClientRect();return {top:Math.round(r.top-b.top),h:Math.round(r.height),box:Math.round(b.height),ok:r.top>=b.top-2&&(r.height>b.height?r.top<b.top+b.height*.5:r.bottom<=b.bottom+2)}};
    /* v1.08c: 378's B54 scrolls once the page has re-drawn (MutationObserver → rAF → smooth scroll); under load that ends after a
       fixed 900 ms → wait for the panel to come into view (4 s; a panel that never arrives still fails below, with the WAIT line) */
    row.click();await __W.until(()=>{const v=inView();return v&&v.ok&&Math.abs(mb.scrollTop-(mb.__s54??-1))<1?true:(mb.__s54=mb.scrollTop,false)},'B54 options panel in view, scroll settled',4000);
    out.sel=inView();
    const t0=card().getBoundingClientRect().top;const s0=mb.scrollTop;
    const btn=document.querySelector('#mgrBody [data-rec98a="watch"]');btn.click();await W8(900);
    out.act=inView();if(out.act&&out.act.top>=-2)out.act.ok=true;/* B72: an action keeps the panel's top where it was; a result line may push its foot a few px below the box */out.moved=Math.abs(card().getBoundingClientRect().top-t0);out.scroll=[s0,mb.scrollTop];
    return out});
  console.log('B54',vw,JSON.stringify(r));
  ok(r.sel&&r.sel.ok,vw+': selecting a recruit brings the options panel into view '+JSON.stringify(r.sel));
  ok(r.act&&r.act.ok&&r.moved<=40&&r.scroll[1]>0,vw+': after a recruiting action the panel stays put (moved '+r.moved+', scroll '+r.scroll+')')}
  await pg.close()}

{const pg=await open(true);
  /* ---------- kill switch ---------- */
  const r=await pg.evaluate(async()=>{const w=W_(),pm=me();const out={};
    out.noFn=typeof set105Left==='undefined';
    const R=w.mgrs.find(m=>!m.isPlayer&&!m.sica);const p=rosterOf(R)[0];p.contract.since=w.week;p.scout=3;const v=poachVerdict(p,99);out.verdictFree=!v.set105;
    const g1=freeAgents()[0];g1.contract={mgr:R.id,wage:20,weeks:8,since:w.week};w.of104={[g1.id]:{wage:20,weeks:8,bonus:0,pledge:false,rudis:false,wk:w.week-1}};of104Answer(w,w.week);
    const L1=(w.letters||[]).find(l=>l.key==='of104_'+g1.id+'_'+w.week);out.oldLetter=!!L1&&/signed elsewhere/.test(L1.title)&&L1.act!==false&&/button/.test(L1.body);
    w.letters=[];w.mailLog=[];w.review=null;if(w.qsLast)w.qsLast.seen=true;MGR.tab='ludus';MGR_REDRAW();await W8(400);out.panelStays=!!document.querySelector('#desk99 .lu100mb');
    return out});
  console.log('kill',JSON.stringify(r));
  ok(r.noFn,'kill switch: module off');ok(r.verdictFree,'kill switch: a new signing can be approached');ok(r.oldLetter,'kill switch: the old signed-elsewhere letter');ok(r.panelStays,'kill switch: mail panel unchanged');
  await pg.close()}

console.log('ERRS',JSON.stringify(errs));if(miss.length)console.log('MISS',JSON.stringify(miss,null,1));
await b.close();process.exit(errs.length||miss.length?1:0)})();

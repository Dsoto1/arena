/* tv104c — v1.04 builder C (350-v104roster): 1 ROSTER CAP cap104 = 8 + Barracks + Barracks master (≤15), 345's checks follow it, over-cap desk row
   (Release/Lend/Trade) + wages above the cap +25% (weekMoney + endWeek), rivals trimmed to their cap, the Barracks text · 2 FIRST TEAM 4 + SECOND TEAM 4
   (tm104Ensure, moves, full-team refusal, bout slots, the reserve covers a hurt starter's bout, rival depthOf = 4) · 3 THE ROSTER PAGE (one list with group
   headers, sortable columns, ⋯ row menu, drag between groups, right side only the selected fighter with Keeping him inside the tabula, no tablets / Bench &
   loans, lesson spot, 390 px no sideways scroll) · 4 LOAN CONTRACT (lump sum both ways, no weekly fee, First team not lent, old loans keep their weekly fee,
   buy-out offer after 2+ wins both ways) · 5 TRADE BUNDLES (checkboxes on the trade panel, 2-for-1 accepted, once a week, counter-offer letter) · kill switch.
   Screenshots → tools/plans/v104/shots/ (not committed). */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const shots=path.resolve(__dirname,'../plans/v104/shots');try{fs.mkdirSync(shots,{recursive:true})}catch(e){}
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.removeItem('flavius_r104sort');if(o)localStorage.setItem('flavius_v104coff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=3000;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    /* a bigger house: 11 fighters, all fit */
    for(let i=0;i<6;i++){const g=genGlad({ovr:46+i*6});if(!gById(g.id))w.glads.push(g);g.alive=true;g.contract={mgr:pm.id,wage:askWage(g),weeks:8+i,since:w.week}}
    for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.contract.weeks=Math.max(g.contract.weeks,6);g.morale=80}
    for(const m of w.mgrs)if(!m.isPlayer){m.relB=60;m.coin=Math.max(m.coin||0,600);m.rivalry=0;m.rivals={}}
    window.C_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('roster');await W8(900);MGR.view=null});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const go=async(pg,t)=>ev(pg,async t=>{if(!document.querySelector('#mgrBody'))openManager(t);MGR.tab=t;MGR_REDRAW();await new Promise(r=>setTimeout(r,500));return !!document.querySelector('#mgrBody')},t);

const pg=await open(1440,900);
/* ---------------- 1 · the cap ---------------- */
out.cap=await ev(pg,async()=>{const r={};const w=W_(),pm=me();const adv=council83(w).find(a=>a.k==='barracks');const lv0=adv.lv;
  pm.fac=pm.fac||{};pm.fac.barracks=0;adv.lv=1;r.base=cap104(pm)===8;pm.fac.barracks=2;adv.lv=3;r.grow=cap104(pm)===12;pm.fac.barracks=3;adv.lv=5;r.hard=cap104(pm)===15;
  pm.fac.barracks=0;adv.lv=2;r.cap=cap104(pm);r.n=rosterOf(pm).length;
  r.full=!!cap103Why()&&offerVerdict&&(()=>{const fa=freeAgents()[0];try{const v=offerVerdict(fa,10,6,0);return !!(v&&v.cap103)}catch(e){return 'err'}})();
  r.over=rosterOf(pm).length>cap104(pm);r.whyOver=/Over the cap: \d+ \/ 9/.test(cap103Why());
  const desk=weekChecklist().filter(x=>x.ic==='👥');r.desk=desk.length===1&&/Over the cap: \d+ \/ 9/.test(desk[0].txt)&&/data-id="roster"/.test(desk[0].btn)&&/data-id="league"/.test(desk[0].btn);
  const ex=cap104Extra(pm);const over=cap104Over(pm);r.extra=ex>0&&over.length===rosterOf(pm).length-9&&ex===over.reduce((a,g)=>a+Math.round(g.contract.wage*0.25),0);
  const wm=weekMoney();r.money=wm.cap104===ex;
  /* rivals trimmed to their own cap */
  const rv=w.mgrs.find(m=>!m.isPlayer&&!m.sica&&!m.dead);for(let i=0;i<14;i++){const g=genGlad({ovr:40+i});if(!gById(g.id))w.glads.push(g);g.alive=true;g.contract={mgr:rv.id,wage:5,weeks:6,since:w.week}}
  cap103Trim(w);r.rival=rosterOf(rv).length===cap104(rv)&&cap104(rv)<15;
  r.facTxt=/roster place/.test(FAC.barracks.fx(1));r.advTxt=/roster place/.test(adv100Fx('barracks',3));
  return r});
for(const k of ['base','grow','hard','over','whyOver','desk','extra','money','rival','facTxt','advTxt'])ok(out.cap[k],'cap '+k);
/* the page shows it: wages above the cap marked, count box */
await go(pg,'roster');
out.capPage=await ev(pg,()=>({oc:document.querySelectorAll('.r104 .r104wg.oc').length===cap104Over(me()).length,cnt:/\/9/.test((document.querySelector('.rm100cnt .ptbox')||{}).textContent||'')&&!!document.querySelector('.rm100cnt.r104over'),
  hd:/over the cap/i.test((document.querySelector('.r104lhd')||{}).textContent||'')}));
for(const k of ['oc','cnt','hd'])ok(out.capPage[k],'cap page '+k);
/* the week's end charges the 25% */
out.capWeek=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();if(w.special&&!w.special.done)await specAutoRun();
  if(w.night&&!w.night.bye)for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k);w.pend=[];
  const ex=cap104Extra(pm);const wk=w.week;const c0=pm.coin;const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let rr;try{rr=await endWeek()}finally{clearInterval(hold)}await W8(300);
  menuHide();openManager('roster');await W8(900);MGR.view=null;
  return {ok:rr!==false,adv:W_().week!==wk,ex,news:(W_().tlog||[]).some(x=>/Over the cap: the fighters above it cost/.test(x.text))}});
ok(out.capWeek.ok&&out.capWeek.adv&&out.capWeek.ex>0&&out.capWeek.news,'cap week end '+JSON.stringify(out.capWeek));
/* back under the cap for the rest */
await ev(pg,()=>{const w=W_(),pm=me();const adv=council83(w).find(a=>a.k==='barracks');adv.lv=4;pm.fac.barracks=2;for(const g of rosterOf(pm)){g.inj=null;g.restWk=null;g.fat=10;g.severed=[];g.contract.weeks=Math.max(6,g.contract.weeks)}});

/* ---------------- 2 · 4 + 4 ---------------- */
out.team=await ev(pg,async()=>{const r={};const w=W_(),pm=me();st95Ensure(w,pm);tm104Ensure(w,pm);const P=c104Pool(w,pm);
  const cnt=k=>P.filter(g=>team104(g,pm)===k).length;r.limits=cnt('A')<=4&&cnt('B')<=4&&cnt('A')>=3;r.slots=P.filter(g=>g.slot95).every(g=>team104(g,pm)==='A');
  /* fill the First team to 4, then a fifth is refused */
  const R0=P.filter(g=>team104(g,pm)!=='A');while(cnt('A')<4&&R0.length){const g=R0.shift();tm104Move(g.id,'A')}r.four=cnt('A')===4;
  const x=P.find(g=>team104(g,pm)!=='A');r.refuse=!!(tm104Move(x.id,'A')||{}).no;
  /* Second team, Rostered */
  const y=P.find(g=>team104(g,pm)==='R')||P.find(g=>team104(g,pm)==='B');const okB=tm104Move(y.id,'B');r.toB=okB.ok?team104(y,pm)==='B':cnt('B')===4;
  tm104Move(y.id,'R');r.toR=team104(y,pm)==='R';
  /* a bout slot from the menu */
  const A=P.filter(g=>team104(g,pm)==='A');const res=A.find(g=>!g.slot95);r.hasRes=!!res;
  if(res){const prev=P.find(g=>g.slot95===2);tm104Move(res.id,'A',2);r.slot=res.slot95===2&&(!prev||team104(prev,pm)==='A');}
  /* the reserve covers a hurt starter's bout */
  const s1=P.find(g=>g.slot95===1);const rs=P.find(g=>team104(g,pm)==='A'&&!g.slot95);r.cover='skip';
  if(s1&&rs&&w.night&&w.night.bouts&&w.night.bouts[0]&&!w.night.bye){for(const bo of w.night.bouts)for(const id of [s1.id,rs.id])if(bo.ents.includes(id)&&!bo.done)st95Out(bo,id);
    s1.inj={until:w.week+2,label:'a cut',pen:1};const bo=w.night.bouts[0];st95Fill(w,pm,true);r.cover=bo.done||(bo.wd||0)>=2?'skip':bo.ents.includes(rs.id);
    if(r.cover===false)r.coverWhy=JSON.stringify({blk:typeof r101Block==='function'?r101Block(rs):'',rest:rs.restWk,wk:w.week,ents:bo.ents.map(id=>{const x=gById(id);return x?(x.contract?(x.contract.mgr===pm.id?'ME:'+x.id:'c'):'free'):'?'}),rs:rs.id,s1:s1.id});s1.inj=null}
  /* rivals: First team = their best four */
  const rv=w.mgrs.find(m=>!m.isPlayer&&!m.sica&&rosterOf(m).length>=5);r.rivalDepth=!rv||depthOf(rv).starters.length===4;
  return r});
for(const k of ['limits','slots','four','refuse','toB','toR','hasRes','slot','rivalDepth'])ok(out.team[k],'team '+k);
ok(out.team.cover===true||out.team.cover==='skip','team reserve covers '+out.team.cover+' '+(out.team.coverWhy||''));

/* ---------------- 3 · the roster page ---------------- */
await go(pg,'roster');
out.page=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const r={};const w=W_(),pm=me();const ros=rosterOf(pm);
  r.room=!!q('#mgrPane .rm100.rm100-roster.r104');r.groups=['A','B','R'].every(k=>!!q(`.rm100list .r104g[data-r104g="${k}"] .r104gh`));
  r.rows=qa('.rm100list .rm100lr[data-mg="lsel"]').length===ros.length;r.cols=qa('.rm100list .r104h>*').length===10&&qa('.rm100list .r104h [data-r104s]').length>=6;
  r.chips=qa('.r104g[data-r104g="A"] .r104c.s').length===ros.filter(g=>team104(g,pm)==='A').length;
  r.noOld=!q('.rm100stt')&&!q('.rm100bench')&&!q('.st95slot')&&!q('.rm100dos>.rm100keep');
  r.right=!!q('.rm100dos .rm100pp')&&!!q('.rm100dos .rm100rat .ratgrid')&&!!q('.rm100dos .rm100pers')&&!!q('.rm100con .rm100wax .r104keep [data-mg="meal"]')&&!q('.rm100pp .r104tc');/* v1.04 beta B6: the team buttons under the portrait are gone (the ⋯ menu keeps them) */
  /* OVR order inside each group by default */
  const ord=k=>qa(`.r104g[data-r104g="${k}"] .rm100lr[data-id]`).map(e=>effOvr(gById(e.dataset.id)));r.ovrOrder=['A','B','R'].every(k=>{const a=ord(k);return a.every((v,i)=>!i||a[i-1]>=v)});
  /* sort by wage */
  q('[data-r104s="wage"]').click();await W8(400);const wg=k=>qa(`.r104g[data-r104g="${k}"] .rm100lr[data-id]`).map(e=>gById(e.dataset.id).contract.wage);r.sortWage=R104.sort.k==='wage'&&['A','B','R'].every(k=>{const a=wg(k);return a.every((v,i)=>!i||a[i-1]>=v)})&&!!q('[data-r104s="wage"].on');
  q('[data-r104s="wage"]').click();await W8(400);r.sortFlip=R104.sort.d===1;q('[data-r104s="ovr"]').click();await W8(300);
  /* select a fighter: only him on the right */
  const g2=ros.find(x=>x.id!==MGR.lsel);q(`.rm100list [data-mg="lsel"][data-id="${g2.id}"]`).click();await W8(400);r.sel=MGR.lsel===g2.id&&q('.rm100pp .rm100pn').textContent.includes(g2.name)&&!!q(`.rm100list .rm100lr.on[data-id="${g2.id}"]`)&&!!q(`.rm100con [data-mg="extend"][data-id="${g2.id}"]`);
  /* ⋯ menu → Second team */
  const rr=ros.find(g=>team104(g,pm)==='R');r.hasR=!!rr;
  if(rr){q(`[data-r104m="${rr.id}"]`).click();await W8(250);r.menu=!!q('.r104pop')&&!!q(`.r104pop [data-r104a="B|${rr.id}"]`);const full=c104Pool(w,pm).filter(g=>team104(g,pm)==='B').length>=4;
    q(`.r104pop [data-r104a="B|${rr.id}"]`).click();await W8(400);r.menuMove=full?team104(rr,pm)==='R':team104(rr,pm)==='B';r.menuClosed=!q('.r104pop')}
  /* drag a row into Rostered */
  const bb=ros.find(g=>team104(g,pm)==='B');r.hasB=!!bb;
  if(bb){const row=q(`.rm100lr[data-r104d="${bb.id}"]`),zone=q('.r104g[data-r104g="R"]');const dt=new DataTransfer();
    row.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:dt}));zone.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:dt}));zone.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt}));
    await W8(400);r.drag=team104(bb,pm)==='R'}
  /* the team control on the right */
  /* v1.04 beta B6: the control moved into the ⋯ menu — "Rostered" there */
  const sel=gById(MGR.lsel);const mb=q(`[data-r104m="${sel.id}"]`);if(mb){mb.click();await W8(250);const tb=q(`.r104pop [data-r104a="R|${sel.id}"]`);if(tb){tb.click();await W8(400);r.ctl=team104(sel,pm)==='R'}}
  /* Escape closes a menu */
  q('[data-r104m]').click();await W8(200);document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await W8(100);r.esc=!q('.r104pop');
  /* the lesson's spot still finds the row */
  const st=MTUT_STEPS.find(x=>x.k==='lsel');window.MTUT=window.MTUT||{};const keepB=MTUT.B;MTUT.B=ros[1].id;r.lesson=!!(st&&st.spot()&&st.spot().matches('.rm100list [data-mg="lsel"]'));MTUT.B=keepB;
  return r});
for(const k of ['room','groups','rows','cols','chips','noOld','right','ovrOrder','sortWage','sortFlip','sel','hasR','menu','menuMove','menuClosed','hasB','drag','ctl','esc','lesson'])ok(out.page[k],'page '+k);
await pg.screenshot({path:path.join(shots,'c_roster_1440.png')});
await ev(pg,async()=>{document.querySelector('[data-r104m]').click();await new Promise(r=>setTimeout(r,250))});await pg.screenshot({path:path.join(shots,'c_menu_1440.png')});await ev(pg,()=>r104Close());

/* ---------------- 4 · the loan contract ---------------- */
out.loan=await ev(pg,async()=>{const r={};const w=W_(),pm=me();const P=c104Pool(w,pm);const m=w.mgrs.find(x=>!x.isPlayer&&!x.sica&&!x.dead&&!isRival(x));m.coin=800;
  /* a Bout starter is not lent */
  const a=P.find(g=>g.slot95);r.noA=lendTo(a,m,null,3)===false&&!a.loanFrom;
  const g=P.find(g=>team104(g,pm)!=='A'&&!g.loanFrom&&!g.inj);const c0=pm.coin,m0=m.coin;const fee=typeof loan102Fee==='function'?loan102Fee(w,g,m):loanFee(g);
  r.lent=lendTo(g,m,loanFee(g),3)===true&&!!g.loanFrom&&g.loanFrom.c104===1;const L=g.loanFrom||{};r.lump=L.lump===Math.round(fee*3)&&pm.coin===c0+L.lump&&m.coin===m0-L.lump;
  r.offTeam=!g.tm104;r.terms=/paid up front/.test(loanTerms(g));
  /* the week: no weekly fee, one week less */
  const c1=pm.coin,m1=m.coin,wk0=L.weeks;loansWeek(w,pm);r.noFee=pm.coin===c1&&m.coin===m1&&g.loanFrom&&g.loanFrom.weeks===wk0-1;
  /* two wins on loan → their buy-out offer when it ends */
  g.rec=g.rec||{w:0,ev:0};g.rec.w=(g.loanFrom.w0||0)+2;g.loanFrom.weeks=1;m.coin=2000;w.offers=[];loansWeek(w,pm);
  r.home=!g.loanFrom&&g.contract.mgr===pm.id;const o=(w.offers||[]).find(x=>x.bo104&&x.gid===g.id);r.bo=!!o&&o.kind==='coin'&&o.mid===m.id;
  if(o){const h=offersHTML();r.boHTML=/buy-out offer/.test(h)&&h.includes(`data-m47="offyes" data-id="${o.id}"`);const p0=pm.coin;r.sold=offerAccept(o)===true&&g.contract.mgr===m.id&&pm.coin===p0+o.coin}
  /* an old loan (no c104) keeps its weekly fee — X2 */
  const h2=P.find(x=>x!==g&&x.alive&&x.contract&&x.contract.mgr===pm.id&&team104(x,pm)!=='A'&&!x.loanFrom&&!x.inj);
  if(h2){h2.loanFrom={mid:pm.id,fee:7,weeks:3,to:m.id};h2.contract.mgr=m.id;const c2=pm.coin;loansWeek(w,pm);r.oldFee=pm.coin===c2+Math.min(7,Math.max(0,m.coin+7))&&h2.loanFrom&&h2.loanFrom.weeks===2;h2.contract.mgr=pm.id;delete h2.loanFrom}else r.oldFee='skip';
  /* borrowing: you pay the lump; 2+ wins → his house offers him to you */
  const m2=w.mgrs.find(x=>!x.isPlayer&&!x.sica&&!x.dead&&!isRival(x)&&x!==m&&rosterOf(x).length>=2)||m;const bg=rosterOf(m2).filter(x=>!x.inj&&!x.loanFrom)[0];
  if(bg){const adv=council83(w).find(a=>a.k==='barracks');adv.lv=5;pm.fac.barracks=3;const c3=pm.coin;r.borrow=borrowFrom(bg,m2,10,3)===true&&bg.loanFrom&&bg.loanFrom.c104===1&&pm.coin===c3-30;
    bg.rec=bg.rec||{w:0,ev:0};bg.rec.w=(bg.loanFrom.w0||0)+3;bg.loanFrom.weeks=1;w.bi104=[];loansWeek(w,pm);const bi=(w.bi104||[]).find(x=>x.gid===bg.id);r.bi=!!bi&&bg.contract.mgr===m2.id;
    if(bi){MGR.tab='ludus';MGR_REDRAW();await new Promise(r=>setTimeout(r,400));const h=offersHTML();r.biHTML=h.includes(`data-r104bo="yes|${bi.id}"`);
      const btn=document.createElement('button');btn.dataset.r104bo='yes|'+bi.id;document.body.appendChild(btn);const c4=pm.coin;btn.click();btn.remove();r.bought=bg.contract.mgr===pm.id&&pm.coin===c4-bi.coin}}
  else r.borrow=r.bi=r.biHTML=r.bought='skip';
  /* a house's ask in the contract's words */
  const ask={id:'oX',kind:'loan',mid:m.id,gid:P.find(x=>x.contract&&x.contract.mgr===pm.id).id,fee:9,weeks:3,until:w.week+1,c104:1};r.ask=/They pay up front/.test(loanReq103(ask))&&/27/.test(loanReq103(ask));
  return r});
for(const k of ['noA','lent','lump','offTeam','terms','noFee','home','bo','boHTML','sold','ask'])ok(out.loan[k],'loan '+k);
for(const k of ['oldFee','borrow','bi','biHTML','bought'])ok(out.loan[k]===true||out.loan[k]==='skip','loan '+k+' '+out.loan[k]);

/* ---------------- 5 · trade bundles ---------------- */
out.trade=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};const w=W_(),pm=me();
  const m=w.mgrs.find(x=>!x.isPlayer&&!x.sica&&!x.dead&&rosterOf(x).length>=3&&cap104N(x)+1<=cap104(x));m.relB=80;m.envoyWk=-1;w.tb104Wk=-1;m.p.greed=20;
  const gt=rosterOf(m).sort((a,b)=>effOvr(a)-effOvr(b))[0];
  MGR.teamId=m.id;MGR.tab='team';MGR.trade={mid:m.id,mine:null,theirs:gt.id,coin:0};MGR_REDRAW();await W8(500);
  r.panel=!!q('.tb104')&&document.querySelectorAll('input[data-tb104g]').length>=2;
  const mine=rosterOf(pm).filter(g=>!g.loanFrom).sort((a,b)=>effOvr(b)-effOvr(a));
  q('#trMine').value=mine[0].id;q('#trTheirs').value=gt.id;const cb=document.querySelector(`input[data-tb104g="${mine[1].id}"]`);cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));
  const n0=rosterOf(pm).length;q(`[data-mg="tradego"][data-id="${m.id}"]`).click();await W8(500);
  r.done=gt.contract.mgr===pm.id&&mine[0].contract.mgr===m.id&&mine[1].contract.mgr===m.id&&rosterOf(pm).length===n0-1;
  r.once=w.tb104Wk===w.week;if(!r.done)r.why=JSON.stringify({msg:(MGR.trade||{}).msg,tab:MGR.tab,go:!!q(`[data-mg="tradego"]`),cbs:document.querySelectorAll('input[data-tb104g]:checked').length,mine:q('#trMine')&&q('#trMine').value,cap:[cap104N(m),cap104(m)]});
  /* a second bundle this week is refused */
  const m3=w.mgrs.find(x=>!x.isPlayer&&!x.sica&&!x.dead&&x!==m&&rosterOf(x).length>=2&&cap104N(x)+1<=cap104(x));if(m3){m3.envoyWk=-1;MGR.teamId=m3.id;MGR.trade={mid:m3.id,mine:null,theirs:rosterOf(m3)[0].id,coin:0};MGR_REDRAW();await W8(400);
    r.usedTxt=/spent/.test((q('.tb104')||{}).textContent||'');const t0=rosterOf(m3)[0];const ms=rosterOf(pm).filter(g=>!g.loanFrom);
    if(q('#trMine')){q('#trMine').value=ms[0].id;q('#trTheirs').value=t0.id}const x=document.querySelector(`input[data-tb104g="${ms[1].id}"]`);if(x){x.disabled=false;x.checked=true}
    q(`[data-mg="tradego"][data-id="${m3.id}"]`).click();await W8(400);r.refused=t0.contract.mgr===m3.id&&/One bundle offer a week/.test((MGR.trade||{}).msg||'')}else{r.usedTxt=r.refused='skip'}
  /* the counter-offer letter, the week after */
  const m4=m3||m;const t4=rosterOf(m4)[0];const ms4=rosterOf(pm).filter(g=>!g.loanFrom).slice(-2);
  w.tb104={id:'tX',mid:m4.id,mine:ms4.map(g=>g.id),theirs:t4.id,coin:0,ask:12,wk:w.week-1};c104Counter(w);const L=(w.letters||[]).find(x=>x.key==='tb104-tX');r.letter=!!L&&/data-tb104="yes\|tX"/.test(L.body);
  const btn=document.createElement('button');btn.dataset.tb104='yes|tX';document.body.appendChild(btn);const c0=pm.coin;btn.click();btn.remove();
  r.counter=w.tb104.done==='yes'&&t4.contract.mgr===pm.id&&pm.coin===c0-12;
  return r});
for(const k of ['panel','done','once','letter','counter'])ok(out.trade[k],'trade '+k+(k==='done'&&out.trade.why?' '+out.trade.why:''));
for(const k of ['usedTxt','refused'])ok(out.trade[k]===true||out.trade[k]==='skip','trade '+k+' '+out.trade[k]);
out.errs=await ev(pg,()=>typeof errNew92==='function'?errNew92(window.C_MARK).map(e=>e.kind+':'+e.msg):[]);ok(!out.errs.length,'no new 00c errors '+JSON.stringify(out.errs));
await pg.close();

/* ---------------- 390 px: one column, no sideways scroll ---------------- */
const ph=await open(390,844);await go(ph,'roster');
out.ph=await ev(ph,()=>{const L=document.querySelector('.rm100list'),D=document.querySelector('.rm100dos');const sc=[...document.querySelectorAll('#mBody,#mgrBody,#mgrPane,.rm100,.rm100dos,.rm100list')];
  return {room:!!(L&&D&&document.querySelector('.r104')),stack:!!(L&&D)&&L.getBoundingClientRect().bottom<=D.getBoundingClientRect().top+1,side:document.documentElement.scrollWidth<=391&&sc.every(e=>e.scrollWidth<=e.clientWidth+1),
    rowsFit:[...document.querySelectorAll('.r104r')].every(e=>e.getBoundingClientRect().right<=392),menuBtn:[...document.querySelectorAll('.r104m')].every(e=>e.getBoundingClientRect().width>=30)}});
ok(out.ph.room&&out.ph.stack&&out.ph.side&&out.ph.rowsFit&&out.ph.menuBtn,'390 '+JSON.stringify(out.ph));
await ph.screenshot({path:path.join(shots,'c_roster_390.png')});
await ev(ph,async()=>{document.querySelector('[data-r104m]').click();await new Promise(r=>setTimeout(r,250))});
out.phMenu=await ev(ph,()=>{const p=document.querySelector('.r104pop');if(!p)return false;const r=p.getBoundingClientRect();return r.left>=0&&r.right<=390&&r.top>=0&&r.bottom<=844});ok(out.phMenu,'390 menu on screen');
await ph.screenshot({path:path.join(shots,'c_menu_390.png')});await ph.close();

/* ---------------- the kill switch ---------------- */
const pk=await open(1440,900,true);await go(pk,'roster');
out.off=await ev(pk,()=>({page:!document.querySelector('.r104')&&!!document.querySelector('.rm100stt'),cap:cap104(me())===MGR_CAP103}));ok(out.off.page&&out.off.cap,'kill switch '+JSON.stringify(out.off));await pk.close();

console.log(JSON.stringify(out));console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

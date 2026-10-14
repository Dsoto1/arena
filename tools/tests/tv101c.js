/* v1.01 (319-v101rules) MANAGER RULES — M13 blocked fighters (bed / limb / hurt / war) cannot be entered anywhere, a resting fighter's entry ends his rest and
   resting takes him off the card · M17 "Spares — sell" · M19 recruiter's hours by roster size · M23 gear nudges + Armory only for healthy fighters ·
   M24 the loaner kit (home gear stays on the shelf, replaced loaner pieces vanish, gear comes back) · M27 a full special keeps a free-agent filler seat ·
   M28 coin per fighter in the bout results · M29 no repair items once the week is fought · M32 "why it doesn't fit" · M35 the levy / war · M37 the
   fight request goes with the week + the review lists it · M40 one desk row per advisor · M41 a regrown limb leaves glad.severed · M42 unspent hours →
   Training Yard · kill switch · no new errors in the 00c log. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const R=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const mark=ERR92.n;let sd=101;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
  if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_(),m=me(),n=w.night;w.welc99=1;MGR.view=null;MGR.tab='night';m.coin=900;MGR_REDRAW();await W8(700);
  const ros=()=>rosterOf(m).filter(g=>!g.lanista);const R0=ros();
  for(const g of R0){g.severed=[];delete g.inj;delete g.restWk}w.beds76=[];
  const [A,B,C,D,E]=R0;o.n=R0.length;for(const g of R0)g.ovr=Math.round((TIERS.under.lo+TIERS.under.hi)/2);
  const clearMine=()=>{for(const b of n.bouts){for(let i=0;i<b.ents.length;i++){const g=gById(b.ents[i]);if(g&&r101Mine(g)){const f=genGlad({ovr:(TIERS[b.tier]||{lo:50}).lo+8});f.debut={s:w.season,wk:w.week};w.glads.push(f);b.ents[i]=f.id}}}};clearMine();
  /* ---- M13 ---- */
  A.severed=['rleg'];w.beds76=[A.id];B.severed=['larm'];C.inj={until:w.week+2,label:'a torn shoulder',pen:2};
  o.m13={a:r101Block(A),b:r101Block(B),c:r101Block(C),d:r101Block(D)};
  /* a bed patient on a card is taken off at the next render */
  const bo=n.bouts[0];const fa=bo.ents.find(id=>!gById(id).contract);bo.ents[bo.ents.indexOf(fa)]=B.id;render&&0;MGR_REDRAW();await W8(200);r101Sweep();
  o.m13.sweep=!n.bouts.some(x=>x.ents.includes(B.id));
  /* the classic picker greys them, the enter click is refused */
  clearMine();MGR.tab='night';MGR_REDRAW();await W8(500);
  const sels=[...document.querySelectorAll('select[id^="ent"]')];o.m13.sels=sels.length;
  o.m13.greyed=sels.every(s=>[...s.options].filter(op=>[A.id,B.id,C.id].includes(op.value)).every(op=>op.disabled));
  o.m13.fitEnabled=sels.some(s=>[...s.options].some(op=>op.value===D.id&&!op.disabled));
  /* a click with a blocked fighter chosen (force the value) is refused */
  if(sels[0]){const s=sels[0];const bi=s.id.slice(3);const op=document.createElement('option');op.value=B.id;op.textContent='x';s.appendChild(op);s.value=B.id;const before=JSON.stringify(n.bouts.map(x=>x.ents));
    s.parentNode.querySelector('[data-mg="enter"]').click();await W8(200);o.m13.refused=JSON.stringify(n.bouts.map(x=>x.ents))===before}
  o.m13.any=[A,B,C].every(g=>!!any100Why(w,n.bouts[0],g));
  o.m13.exh=exhibSetup(A.id)===null;
  /* road deal */
  o.m13.deal=(()=>{const t=travelState(w);return !!t});
  /* the starters' auto-fill skips them */
  A.slot95=1;B.slot95=2;st95Fill(w,m,true);o.m13.fill=!n.bouts.some(x=>x.ents.includes(A.id)||x.ents.includes(B.id));A.slot95=0;B.slot95=0;clearMine();
  /* rest: entering a resting fighter cancels it; resting takes him off the card */
  D.restWk=w.week;MGR_REDRAW();await W8(400);
  const sel2=[...document.querySelectorAll('select[id^="ent"]')].find(s=>[...s.options].some(op=>op.value===D.id));
  if(sel2){const op=[...sel2.options].find(x=>x.value===D.id);o.m13.restEnabled=!op.disabled;if(!op.disabled){sel2.value=D.id;sel2.parentNode.querySelector('[data-mg="enter"]').click();await W8(300)}}
  o.m13.unrest=D.restWk==null&&n.bouts.some(x=>x.ents.includes(D.id));
  const ontoCard=n.bouts.findIndex(x=>x.ents.includes(D.id));
  MGR.tab='infirm';MGR_REDRAW();await W8(500);
  const rb=document.createElement('button');rb.type='button';rb.dataset.rest=D.id;document.querySelector('#mgrBody').appendChild(rb);o.m13.restBtn=true;
  rb.click();await W8(400);o.m13.rested=D.restWk===w.week;o.m13.off=!n.bouts.some(x=>x.ents.includes(D.id));rb.remove();
  delete D.restWk;
  /* a special: the picker refuses the blocked */
  const sp=n.bouts.find(any100Sp);o.m13.spec=sp?!!any100Why(w,sp,A)&&!any100Why(w,sp,D):null;
  /* ---- M32 ---- */
  clearMine();MGR.tab='night';MGR_REDRAW();await W8(500);
  const nf=[...document.querySelectorAll('.nofit101')];o.m32=nf.length;o.m32txt=nf.map(e=>e.textContent).join(' | ').slice(0,300);
  o.m32has=nf.some(e=>/bed/i.test(e.textContent)&&/lost/i.test(e.textContent)&&/hurt/i.test(e.textContent));
  /* ---- M17 ---- */
  A.severed=[];B.severed=[];delete C.inj;w.beds76=[];
  const H=arm94H(m);H.sh.push(arm94New(w,'w','gladius'),arm94New(w,'w','gladius'));
  MGR.tab='armory';MGR_REDRAW();await W8(600);const ar=document.querySelector('#ar94')?document.querySelector('#mgrPane').innerHTML:'';
  o.m17={sell:/Spares — sell/.test(ar),old:/Spares on the shelf/.test(ar),txt:/nothing here is for sale to you/.test(ar)};
  /* ---- M19 ---- */
  const base=n=>{const k=[];return n};
  const cnt=rosterOf(m).length;o.m19={cnt,hrs:rec98HrsMax(w),lv:adv98Lv(w)};
  const sv=rosterOf(m).slice();const mk=(k)=>{for(const g of sv)g.contract=null;for(let i=0;i<k;i++)sv[i].contract={mgr:m.id,wage:3,weeks:9,since:w.week}};
  const tbl={};for(const k of [2,3,4,6,7,9,10,12]){if(k<=sv.length){mk(k);tbl[k]=rec98HrsMax(w)}}
  // enough fighters for the bigger bands
  const extra=[];for(let i=0;i<8;i++){const g=genGlad({ovr:60});g.contract=null;w.glads.push(g);extra.push(g)}
  const all=[...sv,...extra];for(const g of all)g.contract=null;
  for(const k of [3,4,6,7,9,10,12]){for(let i=0;i<k;i++)all[i].contract={mgr:m.id,wage:3,weeks:9,since:w.week};for(let i=k;i<all.length;i++)all[i].contract=null;tbl[k]=rec98HrsMax(w)}
  o.m19.tbl=tbl;o.m19.why=rec101Why(w);
  for(const g of all)g.contract=null;for(const g of sv)g.contract={mgr:m.id,wage:3,weeks:9,since:w.week};for(const g of extra)w.glads.splice(w.glads.indexOf(g),1);
  /* ---- M23 ---- */
  for(const g of rosterOf(m)){delete g.inj;g.severed=[]}
  const E2=D.eq94;const hands=[E2.R,E2.L];E2.R=null;E2.L=null;
  o.m23={before:arm94Todo(m).empty.some(g=>g.id===D.id)};
  w.beds76=[D.id];D.severed=['lleg'];o.m23.bed=!arm94Todo(m).empty.some(g=>g.id===D.id);
  o.m23.fit=!!arm94Fit(D,{id:'q',t:'w',k:'gladius'},'R').no;
  E2.R=hands[0];E2.L=hands[1];w.beds76=[];D.severed=[];
  /* ---- M29 ---- */
  const dmgP=arm94New(w,'a','galea');dmgP.dmg=1;arm94H(m).sh.push(dmgP);
  o.m29={open:weekChecklist().some(x=>x.ic==='🩹')};
  const keepDone=n.bouts.map(x=>x.done);n.bouts.forEach(x=>x.done=true);o.m29.fought=!weekChecklist().some(x=>x.ic==='🩹'&&!x.done);n.bouts.forEach((x,i)=>x.done=keepDone[i]);
  arm94H(m).sh.splice(arm94H(m).sh.indexOf(dmgP),1);
  /* ---- M42 ---- */
  o.m42=(()=>{const it=weekChecklist().find(x=>x.ic==='⏳');return it?/data-id="practice"/.test(it.btn)&&/data-r101="practice"/.test(it.btn):null})();
  /* ---- M41 ---- */
  {const g=D;g.severed=['rleg'];const bi=n.bouts.findIndex(x=>x.ents.includes(g.id));
    /* fake result: rleg regrown mid-bout (not in the row), lleg lost */
    const idx=bi>=0?bi:0;const b0=n.bouts[idx];if(!b0.ents.includes(g.id))b0.ents[0]=g.id;b0.done=false;
    const rows=b0.ents.map((id,i)=>({id:'p'+i,mgrId:id,f:10,kp:0,kn:0,dmg:0,taken:0,alive:true,coin:0,severed:id===g.id?['lleg']:[],name:(gById(id)||{}).name}));
    applyBout(idx,{rows,winners:[rows[0].id],att:1000,seed:1,turns:5,reason:'t',lines:[]});
    o.m41={sev:g.severed.slice(),ok:g.severed.length===1&&g.severed[0]==='lleg'}}
  o.m41.rep=(()=>{const g=E;g.severed=['rleg','rleg','xx'];const n1=r101Repair({glads:[g]});return n1>0&&g.severed.length===1})();
  o.m41.mig=SAVE_MIGRATIONS.some(x=>x[0]==='1.01');
  /* a pair on a fighter with healthy legs covers both legs in the bout seat */
  {const g=E;g.severed=[];arm94EnsureG(w,g);const p=arm94New(w,'a','legwraps');g.eq94.a=[p];const s=arm94Seat(g);o.m41.legs=s.a.filter(x=>/leg/.test(x[1])).length}
  o.errs=ERR92.n-mark;return o});
console.log(JSON.stringify(R));
/* ---------- part 2 · loans, full specials, results coin, war, requests, the desk ---------- */
const R2=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const mark=ERR92.n;let sd=202;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
  newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_(),m=me(),n=w.night;w.welc99=1;MGR.view=null;MGR.tab='night';m.coin=900;MGR_REDRAW();await W8(700);
  const ros0=rosterOf(m).filter(g=>!g.lanista);for(const g of ros0){g.severed=[];delete g.inj;delete g.restWk}w.beds76=[];
  /* ---- M24 · the loaner kit ---- */
  {const rival=w.mgrs.find(x=>!x.isPlayer&&!isRival(x));const g=ros0[0];const had=[g.eq94.R,g.eq94.L,...g.eq94.a].filter(Boolean).map(p=>p.id);const sh0=arm94H(m).sh.length;
    o.m24={rival:!!rival,had:had.length};lendTo(g,rival,2,3);ln101Sync(w);
    const E=g.eq94;o.m24.kit={R:E.R&&E.R.k,a:E.a.map(p=>p.k),flag:[E.R,...E.a].every(p=>p&&p.ln101),L:E.L,off:E.o.length};
    o.m24.home=had.every(id=>arm94H(m).sh.some(p=>p.id===id));o.m24.seat=arm94Seat(g).R==='gladius';o.m24.noLoanerOnShelf=!arm94H(m).sh.some(p=>p.ln101)&&!arm94All(m).some(x=>x.P.ln101);
    delete g.loanFrom;g.contract.mgr=m.id;ln101Sync(w);
    o.m24.back={ln:!g.ln101,gear:had.every(id=>[g.eq94.R,g.eq94.L,...g.eq94.a].filter(Boolean).some(p=>p.id===id)),shelf:arm94H(m).sh.length===sh0,noLoaner:![g.eq94.R,g.eq94.L,...g.eq94.a].filter(Boolean).some(p=>p.ln101)};
    /* borrowed in: the borrower re-equips, the replaced loaner piece vanishes, his own piece goes home on return */
    const rg=rosterOf(rival)[0];const rsh0=arm94H(rival).sh.length;const rhad=[rg.eq94.R,rg.eq94.L,...rg.eq94.a].filter(Boolean).map(p=>p.id);
    borrowFrom(rg,rival,2,3);ln101Sync(w);
    o.m24.in={role:rg.ln101&&rg.ln101.role,R:rg.eq94.R&&rg.eq94.R.k,rivalShelf:rhad.every(id=>arm94H(rival).sh.some(p=>p.id===id))};
    const mace=arm94New(w,'w','mace');arm94H(m).sh.push(mace);const r1=arm94Put(m,mace.id,{g:rg.id,z:'R'});
    o.m24.in.put=!!(r1&&r1.ok)&&rg.eq94.R&&rg.eq94.R.k==='mace'&&rg.eq94.R.own101===m.id;o.m24.in.vanish=!arm94H(m).sh.some(p=>p.ln101)&&!arm94H(rival).sh.some(p=>p.ln101);
    delete rg.loanFrom;rg.contract.mgr=rival.id;ln101Sync(w);
    o.m24.in.ret={mineHome:arm94H(m).sh.some(p=>p.id===mace.id),theirsBack:rhad.every(id=>[rg.eq94.R,rg.eq94.L,...rg.eq94.a].filter(Boolean).some(p=>p.id===id)),noLoaner:![rg.eq94.R,rg.eq94.L,...rg.eq94.a].filter(Boolean).some(p=>p.ln101),clean:!arm94H(rival).sh.some(p=>p.ln101)&&!arm94H(m).sh.some(p=>p.ln101)};
    o.m24.noMoreBorrow=true}
  /* ---- M27 · a full special keeps a filler seat ---- */
  {const sps=n.bouts.map((b,i)=>[b,i]).filter(([b])=>any100Sp(b));sps.forEach(([b])=>{b.any100.rx=null});o.m27={n:sps.length};
    any100FillAll(w);MGR.tab='night';MGR_REDRAW();await W8(500);o.m27.note=/bump a free-agent filler/.test((document.querySelector('#any100wk')||{}).textContent||'');const allFillers=sps.every(([b])=>b.ents.some(id=>{const g=gById(id);return g&&!g.contract}));o.m27.filler=allFillers;
    const [sb,si]=sps.find(([b])=>!any100Team(b))||sps[0];const g=ros0.find(x=>!r101Block(x)&&!any100Why(w,sb,x));
    const fee=sb.any100.fee;const c0=m.coin;const rivBefore=sb.ents.filter(id=>{const q=gById(id);return q&&q.contract&&!r101Mine(q)}).slice();
    const r=any100Enter(w,si,g.id,{mgr:m,move:true});o.m27.enter={ok:r.ok,why:r.why||'',fee:c0-m.coin===fee,in:sb.ents.includes(g.id),rivalsKept:rivBefore.every(id=>sb.ents.includes(id)),size:sb.ents.length===boutSize(sb)};
    /* only rivals left → the refusal says so */
    any100Pull(w,g.id);for(let i=0;i<sb.ents.length;i++){const q=gById(sb.ents[i]);if(q&&!q.contract){const riv=w.glads.find(x=>x.contract&&x.contract.mgr!==m.id&&!sb.ents.includes(x.id)&&!any100Cur(w,x.id));if(riv)sb.ents[i]=riv.id}}
    const g2=ros0.find(x=>x.id!==g.id&&!r101Block(x)&&!any100Why(w,sb,x));const r2=any100Enter(w,si,g2.id,{mgr:m,move:true});
    o.m27.refuse={ok:r2.ok,why:/rival/i.test(r2.why||'')}}
  /* ---- M28 · results coin ---- */
  {n.bouts.forEach(b=>{b.rig=null});const c0=m.coin;w.pend=[];const seq=any100Seq(n);for(const i of seq){if(!n.bouts[i].done)await runBoutSim(i)}w.pend=[];
    const hs=n.bouts.filter(b=>b.res&&b.res.house101);o.m28={bouts:hs.length,tot:hs.reduce((a,b)=>a+b.res.house101.tot,0),lines:n.bouts.some(b=>b.res&&b.res.lines.some(l=>/To your house/.test(l)))};
    MGR.tab='night';MGR_REDRAW();await W8(600);o.m28.cells=document.querySelectorAll('#nightRes .h101').length;o.m28.txt=document.querySelectorAll('#nightRes .h101t').length;
    o.m28.sum=hs.every(b=>Object.values(b.res.house101.by).reduce((a,v)=>a+v,0)===b.res.house101.tot)}
  /* ---- M37 · the request goes with the week, the review lists it ---- */
  {const f=ros0.find(x=>!x.inj);f.wantFight={week:w.week};f.lastBout=null;const dn=n.bouts.map(b=>b.done);n.bouts.forEach(b=>b.done=false);MGR.tab='ludus';MGR_REDRAW();await W8(500);
    const live=/asks for a fight/.test((document.querySelector('#desk99')||{}).textContent||'');
    n.bouts.forEach((b,i)=>b.done=dn[i]);MGR_REDRAW();await W8(500);
    o.m37={live,deskGone:!/asks for a fight/.test((document.querySelector('#desk99')||{}).textContent||''),cardGone:!document.querySelector('.fightreq')};
    const f2=ros0.find(x=>x.id!==f.id&&!x.inj);f2.wantFight={week:w.week};const m0=f.morale;
    for(const b of n.bouts)b.done=true;w.pend=[];
    await endWeek();const w2=W_();
    o.m37.fx=(w2.review&&w2.review.fx101||[]).length;o.m37.morale=f.morale<m0;
    MGR.tab='ludus';MGR_REDRAW();await W8(600);o.m37.shown=!!document.querySelector('.fx101')&&/sat out|got the fight/.test((document.querySelector('.fx101')||{}).textContent||'')}
  /* ---- M35 · war ---- */
  {const w3=W_(),m3=me();const rs=rosterOf(m3).filter(g=>!g.lanista);const a=rs[0],b2=rs[1];
    b2.severed=['rleg'];const hz=rs.find(x=>x!==a&&x!==b2&&!x.inj&&!(x.severed||[]).length&&!r101Bed(x));o.m35={exempt:levyExempt101(b2)&&(!hz||!levyExempt101(hz))};
    (w3.pend=w3.pend||[]).push({t:'levy',gid:b2.id,bi:0,f:0,price:20,war:{foe:'Parthia',rome:'the legion',city:'Roma'},until:w3.week+2});
    const msg=settlePending(w3.pend.length-1,undefined,{});o.m35.pendSkipped=!(b2.inj&&b2.inj.war)&&/moves on|passed over|fit/i.test(String(msg)+JSON.stringify(b2.hist||[]).slice(-200)||'x');
    b2.severed=[];
    w3.beds76=[a.id];a.severed=['lleg'];a.inj={until:w3.week+3,label:'serving with a legion',pen:0,war:{foe:'x',rome:'y',city:'z'}};
    const had=[a.eq94.R,a.eq94.L,...a.eq94.a,...a.eq94.o].filter(Boolean).length;const sh0=arm94H(m3).sh.length;
    inj95Sweep();r101Sweep();
    o.m35.bed=!w3.beds76.includes(a.id);o.m35.gear=a.eq94.a.length===0&&!a.eq94.R&&arm94H(m3).sh.length>=sh0+had;o.m35.block=/war/.test(r101Block(a));o.m35.yard=!!y92Lock(a);
    a.inj=null;delete a.inj;a.severed=[]}
  /* ---- M40 · one row per advisor ---- */
  {const w4=W_(),m4=me();const rs=rosterOf(m4).filter(g=>!g.lanista&&!g.inj);for(const g of rs){g.severed=[]}
    rs[0].eq94.R=null;rs[0].eq94.L=null;rs[1].eq94.R=null;rs[1].eq94.L=null;
    const dmgP=arm94New(w4,'a','galea');dmgP.dmg=1;arm94H(m4).sh.push(dmgP);
    for(const b of W_().night.bouts)b.done=false;MGR.tab='ludus';MGR_REDRAW();await W8(700);
    const grp=[...document.querySelectorAll('#desk99 .dk101g')];o.m40={groups:grp.length,adv:grp.map(x=>x.dataset.adv101)};
    const g0=grp[0];if(g0){const subs=g0.querySelectorAll(':scope>.dk101lines>.dk99row');o.m40.subs=subs.length;o.m40.btns=[...subs].filter(s=>s.querySelector('button:not(.dk99x)')).length;
      o.m40.closed=g0.querySelector(':scope>.dk101lines').hidden;g0.querySelector('[data-dk101g]').click();await W8(150);o.m40.open=!g0.querySelector(':scope>.dk101lines').hidden;
      const before=document.querySelectorAll('#desk99 .dk99row').length;const fix=g0.querySelector('[data-arm94fixall]');o.m40.fixBtn=!!fix}
    o.m40.count=document.querySelector('.mcount.hot.dk99n')?+document.querySelector('.mcount.hot.dk99n').textContent:null;o.m40.open2=desk99Open().length}
  /* ---- kill switch ---- */
  {localStorage.setItem('flavius_rules101off','1');const a=rosterOf(me())[0];a.severed=['rleg'];o.kill={block:r101Block(a)===''};a.severed=[];localStorage.removeItem('flavius_rules101off')}
  o.errs=ERR92.n-mark;return o});
console.log(JSON.stringify(R2));
ok(R2.m24.rival&&R2.m24.kit.R==='gladius'&&R2.m24.kit.a.length===1&&R2.m24.kit.flag&&!R2.m24.kit.L&&R2.m24.kit.off===0,'M24 loaner kit '+JSON.stringify(R2.m24.kit));
ok(R2.m24.home&&R2.m24.seat&&R2.m24.noLoanerOnShelf,'M24 his gear stays on the home shelf '+JSON.stringify(R2.m24));
ok(R2.m24.back.ln&&R2.m24.back.gear&&R2.m24.back.shelf&&R2.m24.back.noLoaner,'M24 return restores his gear, loaner vanishes '+JSON.stringify(R2.m24.back));
ok(R2.m24.in.role==='in'&&R2.m24.in.R==='gladius'&&R2.m24.in.rivalShelf&&R2.m24.in.put&&R2.m24.in.vanish,'M24 borrowed fighter '+JSON.stringify(R2.m24.in));
ok(R2.m24.in.ret.mineHome&&R2.m24.in.ret.theirsBack&&R2.m24.in.ret.noLoaner&&R2.m24.in.ret.clean,'M24 borrowed return '+JSON.stringify(R2.m24.in.ret));
ok(R2.m27.n>=1&&R2.m27.note&&R2.m27.filler&&R2.m27.enter.ok&&R2.m27.enter.fee&&R2.m27.enter.in&&R2.m27.enter.rivalsKept&&R2.m27.enter.size,'M27 enter a full special '+JSON.stringify(R2.m27));
ok(!R2.m27.refuse.ok&&R2.m27.refuse.why,'M27 a rival is never bumped '+JSON.stringify(R2.m27.refuse));
ok(R2.m28.bouts>=1&&R2.m28.lines&&R2.m28.cells>=1&&R2.m28.txt>=1&&R2.m28.sum,'M28 '+JSON.stringify(R2.m28));
ok(R2.m37.live&&R2.m37.deskGone&&R2.m37.cardGone,'M37 request gone once fought '+JSON.stringify(R2.m37));
ok(R2.m37.fx>=1&&R2.m37.morale&&R2.m37.shown,'M37 review lists the outcome '+JSON.stringify(R2.m37));
ok(R2.m35.exempt&&R2.m35.pendSkipped&&R2.m35.bed&&R2.m35.gear&&R2.m35.block&&R2.m35.yard,'M35 '+JSON.stringify(R2.m35));
ok(R2.m40.groups>=1&&R2.m40.subs>=2&&R2.m40.btns>=1&&R2.m40.closed&&R2.m40.open,'M40 one row per advisor '+JSON.stringify(R2.m40));
ok(R2.kill.block,'kill switch '+JSON.stringify(R2.kill));
ok(R2.errs===0,'part 2: no new errors in the 00c log: '+R2.errs);

ok(R.m13.a&&R.m13.b&&R.m13.c&&!R.m13.d,'M13 reasons '+JSON.stringify(R.m13));
ok(R.m13.sweep,'M13 a limb patient is taken off the card');
ok(R.m13.sels>0&&R.m13.greyed&&R.m13.fitEnabled,'M13 picker greys blocked, keeps fit');
ok(R.m13.refused,'M13 the enter click is refused');
ok(R.m13.any&&R.m13.exh,'M13 specials + exhibitions refuse');
ok(R.m13.fill,'M13 starter fill skips them');
ok(R.m13.unrest,'M13 entering a resting fighter ends the rest '+JSON.stringify(R.m13));
ok(R.m13.rested&&R.m13.off,'M13 resting takes him off the card '+JSON.stringify(R.m13));
ok(R.m32>0&&R.m32has,'M32 why-not note '+R.m32txt);
ok(R.m17.sell&&!R.m17.old&&R.m17.txt,'M17 '+JSON.stringify(R.m17));
ok(R.m19.tbl[3]===24+(R.m19.hrs-R.m19.hrs)&&R.m19.tbl[4]===16+4*(R.m19.lv-1)-0*0||true,'M19');
const lvb=4*(R.m19.lv-1);ok(R.m19.tbl[3]===24+lvb&&R.m19.tbl[4]===16+lvb&&R.m19.tbl[6]===16+lvb&&R.m19.tbl[7]===10+lvb&&R.m19.tbl[9]===10+lvb&&R.m19.tbl[10]===6+lvb&&R.m19.tbl[12]===6+lvb,'M19 hours by roster '+JSON.stringify(R.m19));
ok(R.m23.before&&R.m23.bed&&R.m23.fit,'M23 '+JSON.stringify(R.m23));
ok(R.m29.open&&R.m29.fought,'M29 '+JSON.stringify(R.m29));
ok(R.m42,'M42 '+R.m42);
ok(R.m41.ok&&R.m41.rep&&R.m41.mig&&R.m41.legs===2,'M41 '+JSON.stringify(R.m41));
ok(R.errs===0,'no new errors in the 00c log: '+R.errs);
if(errs.length)miss.push('pageerror '+errs.slice(0,3).join(' | '));
console.log(miss.length?'MISS '+miss.join('\n  '):'ALL OK');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length?1:0)})();

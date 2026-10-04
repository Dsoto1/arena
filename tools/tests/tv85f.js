/* v0.85 FAITH: pagan / Christian fighters (deterministic ~1 in 10), the ✝ chip on the record, no temple boost for
   Christians, the believers' morale bond, the governor's edict letter (Hide / Bribe / Face / Refuse), Hide pulls him
   from his bout, Face → the ad bestias bout runs to its end beside other condemned, Refuse → Ad Flamma + martyr,
   a rival's denunciation, the Studio Faith field + chip. Screenshots go to $SHOTS when set. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
const SH=process.env.SHOTS;const shot=async(n,el)=>{if(!SH)return;try{if(el){const h=await pg.$(el);if(h){await h.screenshot({path:SH+'/'+n+'.png'});return}}await pg.screenshot({path:SH+'/'+n+'.png'})}catch(e){}};
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const o=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';const w=W_(),m=me();const r={};
  /* 1. faith: deterministic, about 1 in 10, every fighter has one, no RNG */
  let n=0;for(let i=0;i<4000;i++)if(faithRoll85('g'+i.toString(36)+'x')==='christian')n++;r.rate=n/4000;
  const rnd0=Math.random;let calls=0;Math.random=()=>{calls++;return rnd0()};const same=faithRoll85('abc')===faithRoll85('abc');Math.random=rnd0;r.det=same&&calls===0;
  r.all=w.glads.every(g=>g.faith==='christian'||g.faith==='pagan');
  const old=JSON.parse(JSON.stringify(w));for(const g of old.glads)delete g.faith;const m1=mgrMigrate(old);r.old=m1.glads.every((g,i)=>g.faith===w.glads[i].faith);
  /* a roster of six */
  while(rosterOf(m).length<6){const g=freeAgents().find(x=>!x.inj)||genGlad({});if(!gById(g.id))w.glads.push(g);g.contract={mgr:m.id,wage:5,weeks:8,since:w.week}}
  const ros=rosterOf(m);for(const g of ros){g.faith='pagan';g.inj=null}const [A,B2,C2,D2,E2,P]=ros;for(const g of [A,B2,C2,D2,E2])g.faith='christian';
  for(const x of w.mgrs)x.rivalry=0;
  /* 2. the chip */
  r.tag=/class="fa85"/.test(gTags(A))&&!/fa85/.test(gTags(P));r.det2=/class="fa85"/.test(detailHTML(A))&&!/fa85/.test(detailHTML(P));
  MGR.tab='roster';MGR.lsel=A.id;MGR_REDRAW();await W8(500);r.chipDom=!!document.querySelector('#mgrBody .fa85');
  /* 3. the temple */
  w.night.god76=null;const a0=boostFor(A).ap,p0=boostFor(P).ap;w.night.god76='mars';const a1=boostFor(A).ap,p1=boostFor(P).ap;r.temple=a1===a0&&(p1===p0+1||p0>=7);
  w.night.god76='nemesis';r.temple2=boostFor(A).cf===(()=>{const k=w.night.god76;w.night.god76=null;const v=boostFor(A).cf;w.night.god76=k;return v})()&&boostFor(P).cf>=2;
  w.night.god76=null;const th=templeHTML76();r.templeTxt=!th||/will not honour the gods/.test(th);r.templeHad=!!th;
  /* 4. the bond */
  FAITH85.edictP=0;const mo=[A,B2].map(g=>g.morale=50);faithWeek85(w);r.bond=A.morale===50+FAITH85.bond&&B2.morale===50+FAITH85.bond&&P.morale===P.morale&&(w.letters||[]).some(l=>l.key==='fa85bond');
  /* 5. the edict letter */
  FAITH85.risk.host=1;FAITH85.maxCases=40;
  const bo=w.night.bouts[0];bo.ents[0]=A.id;
  const E1=newEdict85(w,w.night.loc);r.case=!!E1.cases.find(c=>c.gid===A.id&&c.st==='open');r.letter=(w.letters||[]).some(l=>l.key==='fa85-'+E1.id&&/edict/.test(l.title));
  for(const c of E1.cases)if(c.mgr===m.id&&![A.id,B2.id,C2.id,D2.id,E2.id].includes(c.gid))c.st='bribed';
  MGR.tab='ludus';MGR.mailOpen='L:fa85-'+E1.id;MGR_REDRAW();await W8(900);
  const box=document.querySelector(`[data-fa85box="${E1.id}|${A.id}"]`);r.letterBtns=!!box&&['hide','bribe','face','refuse'].every(a=>box.querySelector(`[data-fa85^="${a}|"]`));
  r.eid=E1.id;r.A=A.id;r.B=B2.id;r.C=C2.id;r.D=D2.id;r.E=E2.id;return r});
await shot('fa85_letter','details.mail[open]');
await pg.evaluate(async({A})=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR.tab='roster';MGR.lsel=A;MGR_REDRAW();await W8(500);const c=document.querySelector('#mgrBody .card2 .fa85');if(c)c.scrollIntoView({block:'center'})},o);
await pg.waitForTimeout(300);await shot('fa85_record');
const o2=await pg.evaluate(async({eid,A,B,C,D})=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const r={};const E=curEdicts85(w).find(x=>x.id===eid);
  MGR.tab='night';MGR_REDRAW();await W8(500);r.card=!!document.querySelector('#mgrBody .fa85card [data-fa85^="hide|"]');
  /* Hide → pulled from his bout, not enterable */
  const hb=document.querySelector(`#mgrBody [data-fa85="hide|${eid}|${A}"]`);r.hb=!!hb&&!hb.disabled;if(hb)hb.click();for(let i=0;i<20&&E.cases.find(c=>c.gid===A).st!=='hid';i++)await W8(250);
  r.hidSt=E.cases.find(c=>c.gid===A).st;r.inBout=w.night.bouts.filter(b=>b.ents.includes(A)).map(b=>b.tier+':'+b.done);r.sameW=w===W_();
  r.hid=r.hidSt==='hid'&&!r.inBout.length;
  r.noEnter=!document.querySelector(`#mgrBody option[value="${A}"]:not([disabled])`);
  /* Face → ad bestias, simulated to the end, with the other condemned */
  const rv=w.mgrs.find(x=>!x.isPlayer&&!x.dead);const rg=rosterOf(rv)[0];rg.faith='christian';E.cases.push({gid:rg.id,n:rg.name,mgr:rv.id,st:'face'});
  for(const c of E.cases)if(c.mgr!==m.id&&c.gid!==rg.id&&c.st==='open')c.st='hid';
  MGR_REDRAW();await W8(300);document.querySelector(`#mgrBody [data-fa85="face|${eid}|${B}"]`).click();await W8(400);
  r.faced=E.cases.find(c=>c.gid===B).st==='face';MGR_REDRAW();await W8(300);r.bstBtns=!!document.querySelector(`#mgrBody [data-fa85="sim|${eid}|${B}"]`)&&!!document.querySelector(`#mgrBody [data-fa85="live|${eid}|${B}"]`);
  let cap=null;const s0=simEvent;simEvent=async function(cfg){const res=await s0.apply(this,arguments);cap={seats:cfg.seats.length,cpu:cfg.seats.filter(s=>s.cpu).length,others:cfg.seats.filter(s=>!s.mgrGid||!(gById(s.mgrGid).contract&&gById(s.mgrGid).contract.mgr===m.id)).length,res};return res};
  /* C and D stay open: one refuses, one is left for the week's end */
  document.querySelector(`#mgrBody [data-fa85="sim|${eid}|${B}"]`).click();for(let i=0;i<300&&!E.done;i++)await W8(250);simEvent=s0;
  r.simmed=!!cap&&cap.seats>=4&&cap.others>=1&&cap.res.rows.length===cap.seats&&!!cap.res&&Array.isArray(cap.res.rows)&&!!cap.res.reason;r.reason=cap&&cap.res&&cap.res.reason;r.seats=cap&&cap.seats;
  const cb=E.cases.find(c=>c.gid===B),cr=E.cases.find(c=>c.gid===rg.id);r.outcome=E.done&&['free','martyr'].includes(cb.st)&&['free','martyr'].includes(cr.st)&&(cb.st==='free')===(gById(B).alive!==false);
  r.bst=cb.st;r.rst=cr.st;const pop=document.querySelector('.fa85note');r.pop=!!pop;if(pop)pop.querySelector('[data-note85]').click();
  return r},o);
Object.assign(o,o2);
/* a martyr of the beasts, if the sand chose so, else a refusal */
const o3=await pg.evaluate(async({eid,C,D,E:E5,A})=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const r={};
  /* a fresh edict for C (the first was carried out) */
  const E=newEdict85(w,w.night.loc,null,[gById(C),gById(D)]);const believers=rosterOf(m).filter(g=>isChr85(g)&&g.id!==C);const mo=Object.fromEntries(believers.map(g=>[g.id,g.morale=40]));
  MGR.tab='night';MGR_REDRAW();await W8(400);r.group=weekChecklist().filter(x=>x.fa85===E.id).length===1&&document.querySelectorAll(`#mgrBody [data-fa85e="${E.id}"] .fa85row`).length===2&&document.querySelectorAll(`#mgrBody [data-fa85e="${E.id}"]`).length===1;document.querySelector(`#mgrBody [data-fa85="refuse|${E.id}|${C}"]`).click();await W8(300);
  const y=document.querySelector('.ask76bg [data-ask76="1"]');r.ask=!!y;if(y)y.click();await W8(500);
  const g=gById(C);r.dead=g.alive===false&&!!g.martyr85&&g.martyr85.how==='Ad Flamma';r.grave=/Martyr/.test(w.grave[0].fate)&&/Ad Flamma/.test(w.grave[0].fate)&&w.grave[0].name===g.name;
  r.note=!!document.querySelector('.fa85note .fa85fate')&&/Ad Flamma/.test(document.querySelector('.fa85note').textContent);
  r.mourn=believers.filter(x=>x.alive!==false).every(x=>x.morale===40+FAITH85.martyrMorale);r.mtag=/Martyr/.test(gTags(g));r.mark=faithMark85(g)==='✝'&&faithMark85({faith:'pagan'})==='D · M';
  r.eid2=E.id;return r},o);
Object.assign(o,o3);
await shot('fa85_martyr','.fa85note');
await pg.evaluate(()=>{const p=document.querySelector('.fa85note [data-note85]');if(p)p.click()});
/* the martyr's record */
await pg.evaluate(async({C})=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));MGR.tab='ludus';MGR.run='ledger';MGR_REDRAW();await W8(400);const el=[...document.querySelectorAll('#mgrBody .card2')].find(x=>/The fallen/.test(x.textContent));if(el)el.scrollIntoView()},o);
await pg.waitForTimeout(300);
o.fallenDom=await pg.evaluate(()=>{const el=[...document.querySelectorAll('#mgrBody .card2')].find(x=>/The fallen/.test(x.textContent));return !!el&&/Martyr/.test(el.textContent)});
await shot('fa85_fallen');
/* the week's end: D is taken (undecided → face) and meets the beasts; then a denunciation */
const o4=await pg.evaluate(async({D})=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),m=me();const r={};
  for(const b of w.night.bouts)if(!b.done){b.done=true;b.res={att:0,winners:[],rows:[],reason:'test',turns:0,lines:[]}}w.pend=[];if(w.special)w.special.done=true;
  const E=curEdicts85(w).find(x=>x.cases.some(c=>c.gid===D));const wk=w.week;FAITH85.edictP=0;
  const rv=w.mgrs.find(x=>!x.isPlayer&&!x.dead);rv.rivalry=90;FAITH85.force='denounce';
  await endWeek();await W8(500);const w2=W_();r.adv=w2.week===wk+1;const cD=E.cases.find(c=>c.gid===D);r.taken=E.done&&['free','martyr'].includes(cD.st);
  const den=(fa85State(w2).edicts||[]).find(x=>x.s===w2.season&&x.wk===w2.week&&x.den);r.den=!!den&&den.den===rv.id&&(w2.letters||[]).some(l=>l.key==='fa85-'+den.id&&l.title.includes(rv.ludus)&&/denounces/.test(l.title));
  r.denCase=!!den&&den.cases.length===1&&den.cases[0].mgr===m.id&&den.cases[0].st==='open';
  /* the live board for the screenshot: you play the denounced fighter */
  if(den){den.cases[0].st='face';bestiasLive85(den.id);await W8(2500);r.live=!!(S&&S.bestias85&&S.players.length>=4&&S.npcs.length===4&&S.players.some(p=>!p.cpu))}
  return r},o);
Object.assign(o,o4);
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<12;i++){await W8(400);const m=document.querySelector('#modal');if(CUR_MODAL&&m){const bs=[...m.querySelectorAll('button.primary,button.btn.primary')];if(bs.length)bs[bs.length-1].click()}}});
await pg.waitForTimeout(1200);await shot('fa85_bestias');
o.noTrade=await pg.evaluate(()=>!!(S&&S.bestias85)&&!document.querySelector('[data-act="trade"]')&&!!document.querySelector('[data-act]'));
o.liveEnd=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(!(S&&S.bestias85))return false;const eid=S.bestias85.eid;gameOver([], 'test end');for(let i=0;i<20&&!CUR_MODAL;i++)await W8(200);
  const w=W_();const E=(fa85State(w).edicts||[]).find(x=>x.id===eid);const okk=!!E&&E.done&&!!CUR_MODAL;if(CUR_MODAL)CUR_MODAL.done('back');await W8(800);return okk});
/* the Studio: Faith field, saved, chip; joins a career with it; the board chip */
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(400);if(S)S.over=true;await loadCustoms();openStudio('chars');await W8(1200)});
const o5=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};const s=document.querySelector('#studio [data-f="faith"],#mBody [data-f="faith"]');r.field=!!s;
  if(s){s.value='christian';s.dispatchEvent(new Event('change',{bubbles:true}));await W8(300)}r.draft=ST.draft&&ST.draft.faith==='christian';const nm=ST.draft&&ST.draft.name;
  const sv=document.querySelector('[data-st="save"]');if(sv)sv.click();await W8(1200);const c=(CUSTOM.chars||[]).find(x=>x.name===nm);r.saved=!!c&&c.faith==='christian';
  r.stored=!!c&&!!(await Store.getDoc('customChars',c.id).catch(()=>null)||{}).faith;
  if(c){r.glad=gladFromCustom(c).faith==='christian';r.pf=pFaith85({cls:'cc_'+c.id})==='christian'||!CLASSES['cc_'+c.id]}
  return r});
Object.assign(o,o5);
await pg.waitForTimeout(400);
o.listChip=await pg.evaluate(()=>{const s=document.querySelector('[data-f="faith"]');if(s)s.scrollIntoView({block:'center'});return [...document.querySelectorAll('.lrow')].some(x=>x.querySelector('.fa85'))});
await shot('fa85_studio');
ok(o.rate>0.07&&o.rate<0.13&&o.det&&o.all&&o.old,'faith ~1 in 10, deterministic, every fighter, old careers');
ok(o.tag&&o.det2&&o.chipDom,'✝ chip on lists and the record');ok(o.temple&&o.temple2&&o.templeTxt,'no temple boost for Christians');ok(o.bond,'morale bond + letter');
ok(o.case&&o.letter&&o.letterBtns&&o.card,'edict letter + Match Week card with Hide/Bribe/Face/Refuse');ok(o.hid&&o.noEnter,'Hide pulls him from his bout');
ok(o.faced&&o.bstBtns&&o.simmed&&o.outcome,'Face → ad bestias runs to the end with other condemned');ok(o.ask&&o.dead&&o.grave&&o.note&&o.mourn&&o.mtag&&o.mark,'refuse → Ad Flamma + martyr');
ok(o.fallenDom,'martyr on the fallen list');ok(o.adv&&o.taken,'undecided case taken at the week end');ok(o.den&&o.denCase,'denounce letter names the house');ok(o.live&&o.liveEnd,'live bestias bout');ok(o.noTrade,'no trade or truce among the condemned');ok(o.group,'one checklist item + one card per edict, a row per fighter');
ok(o.field&&o.draft&&o.saved&&o.stored&&o.glad&&o.pf&&o.listChip,'Studio faith field + chip');
console.log(JSON.stringify(o));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

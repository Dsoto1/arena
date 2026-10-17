/* tv101b — v1.01 B1 THE INFIRMARY LOOP (318-v101ward): Medicus hours (4 + 3/Valetudinarium + 2/medicus skill) + half coin per treatment,
   refusals with a reason, the banner (hurt · beds · hours · coin, medicus hire popup, Hygeia's Blessing), no .wd76top / Cleared for the sand,
   Take out on the list row, Fit and fresh open, the suggested order + ★ tile, distinct tile art in one row, the Valetudinarium build option,
   a bed plan spending hours (planRun87), rivals on the same hours (care101Cpu), Recovery in the Training Yard (rub-down / Care routine /
   Rest week), M14 the recruiting-hours oval survives a care click (no flicker), the kill switch, 390 px, no new 00c errors. Runs with 351-v104ward switched off (flavius_v104doff=1): the v1.04 Infirmary replaces this layout (tv104d). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_v104doff','1') /* v1.04: 351's two wings replace this layout — tv104d covers them */;if(o)localStorage.setItem('flavius_v101boff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    const ros=rosterOf(pm);for(const g of ros){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.contract.weeks=20;g.morale=80;g.ord87=null}
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('infirm');await W8(800);MGR.view=null});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const go=async(pg,t)=>ev(pg,async t=>{if(!document.querySelector('#mgrBody'))openManager(t);MGR.tab=t;MGR.view=null;MGR_REDRAW();await new Promise(r=>setTimeout(r,600));return !!document.querySelector('#mgrBody')},t);

const pg=await open(1440,900);
out.inf=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const qa=s=>[...document.querySelectorAll(s)];const r={};const pm=me(),w=W_();const ros=rosterOf(pm);
  const A=ros[ros.length-1],B=ros[0];A.inj={until:w.week+3,label:'a gashed chest',pen:4,ser76:1};A.severed=['larm'];A.fat=64;B.inj={until:w.week+2,label:'a twisted ankle',pen:1};w.beds76=[];w.medicus76=null;pm.fac=pm.fac||{};pm.fac.valet=0;
  MGR.inf90=A.id;MGR.tab='infirm';MGR_REDRAW();await W8(600);
  /* hours */
  r.max4=mh101Max(pm,w)===4&&mh101Left(w,pm)===4;pm.fac.valet=1;r.max7=mh101Max(pm,w)===7;pm.fac.valet=0;
  /* banner */
  const st=q('#mgrPane .roomhd .v101st');r.banStats=!!st&&st.querySelectorAll('.v101b').length===4&&/4\/4/.test(st.textContent)&&/0\/1/.test(st.textContent)&&/\b2\b/.test(st.querySelector('.v101b b').textContent);
  r.banMed=!!q('.roomhd .v101bx [data-v101med], .v102inf [data-v101med]') /* v1.02 M8: above the patient list */;r.why=!!q('.roomhd .v101bx [data-cure90]')||!!q('.roomhd [data-cure90]');r.banHyg=!!q('.roomhd .v101bx .hyg87 [data-m48="hygeia"], .v102inf .hyg87 [data-m48="hygeia"]');
  r.noTop=!q('#mgrPane .wd76top');r.noClear=!qa('#mgrPane .sect').some(s=>/Cleared for the sand/.test(s.textContent))&&!q('#mgrPane .clearstrip');
  r.freshOpen=!!q('#mgrPane details.iv90more[open]');
  /* no recovery buttons in the infirmary */
  r.noBath=!q('#mgrPane [data-bath]')&&!q('#mgrPane [data-rest]')&&!q('#mgrPane [data-care90]');
  /* order + suggestion */
  r.ord=qa('#mgrPane .v101ord .v101os').length>=3&&!!q('#mgrPane .v101ord .v101os.rec');r.star=!!q('#mgrPane .iv90care .v101rec .v101star');
  r.build=!!q('#mgrPane .iv90care [data-b105]')&&!q('#mgrPane [data-mg="build"]'); /* v1.05 B48: a link to My Ludus, never a build button */
  /* medicus hire popup */
  q('[data-v101med]').click();await W8(300);const mh=q('.v101mp [data-v101mh="1"]');r.medPop=!!mh;if(mh)mh.click();await W8(500);
  r.medHired=!!w.medicus76&&mh101Max(pm,w)===4+2*w.medicus76.skill;const mx=mh101Max(pm,w);
  /* bed → Take out on the row */
  const bed=q(`#mgrPane .iv90care [data-bed76="${A.id}"]`);r.bedBtn=!!bed;if(bed)bed.click();await W8(500);r.inBed=inBed76(A);
  r.takeOut=!!q(`#mgrPane .iv90list .v101row [data-unbed76="${A.id}"]`)&&!q(`#mgrPane .iv90care [data-unbed76]`);
  /* tiles: distinct art, one row */
  const pics={};for(const t of qa('#mgrPane .iv90care [data-v101t]')){const im=t.querySelector('.rm100fr img');pics[t.dataset.v101t]=im?(im.dataset.sc100||im.getAttribute('src')):''}
  const keys=Object.keys(pics);r.keys=keys.join(',');r.distinct=keys.length>=5&&new Set(Object.values(pics)).size===keys.length&&Object.values(pics).every(Boolean);
  const care=q('#mgrPane .iv90care .v101rowin');const plates=qa('#mgrPane .iv90care .rm100plt');r.oneRow=!!care&&getComputedStyle(care).flexWrap==='nowrap'&&plates.length>=5&&new Set(plates.map(p=>p.offsetTop)).size===1;
  r.hoursLine=!!q('#mgrPane .v101hl');
  /* Hygeia in bed: 3 h + 10 coin */
  const c0=pm.coin,h0=mh101Left(w,pm);const hy=q(`#mgrPane [data-mg="heal"][data-id="${A.id}"]`);r.hyBtn=!!hy&&!hy.dataset.dis;if(hy)hy.click();await W8(500);
  r.hyDone=(!A.severed.length||!!A.rg102) /* v1.02 M1: the limb is booked, back when the week ends */&&pm.coin===c0-care101Coin('heal')&&mh101Left(w,pm)===h0-3;r.toast=/Hygeia/.test((q('#mToast')||{}).textContent||'');
  /* B: the Medicus on the bench, half coin + 2 h */
  MGR.inf90=B.id;MGR_REDRAW();await W8(400);const c1=pm.coin,h1=mh101Left(w,pm);const md=q(`#mgrPane [data-mg="medic"][data-id="${B.id}"]`);r.mdBtn=!!md&&!md.dataset.dis;if(md)md.click();await W8(500);
  r.mdDone=(!B.inj||!!B.inj.bk102) /* v1.02 (341): the Medicus is booked — the wound closes when the week ends */&&pm.coin===c1-5&&mh101Left(w,pm)===h1-2&&MGR.v101fx&&MGR.v101fx.k==='medic';
  /* out of hours: refused with a reason, nothing paid */
  const C=ros[1];w.mh101={wk:w.week,u:mx};C.inj={until:w.week+2,label:'a twisted ankle',pen:1};MGR.inf90=C.id;MGR_REDRAW();await W8(400);const c2=pm.coin;const md2=q(`#mgrPane [data-mg="medic"][data-id="${C.id}"]`);
  r.refTile=!!md2&&/Medicus hours/.test(md2.dataset.dis||'');if(md2)md2.click();await W8(500);r.refused=!!C.inj&&pm.coin===c2&&/Medicus hours/.test((q('#mToast')||{}).textContent||'');
  /* a bed plan at the week's turn spends hours */
  w.mh101=null;A.inj={until:w.week+3,label:'a torn shoulder',pen:2,wk102:w.week-1 /* v1.02 (341): last week's wound (a fresh serious one rests its first week) */};A.inj.plan87='medic';const h2=mh101Left(w,pm),c3=pm.coin;const msg=planRun87(A,w,pm);r.plan=!!msg&&(!A.inj||!!A.inj.bk102)&&mh101Left(w,pm)===h2-2&&pm.coin===c3-5;
  /* the care guide speaks hours */
  r.guide=/Medicus hours/.test(careGuideHTML(null));
  /* rivals: same hours (no medicus), half coin, then wait */
  const R=w.mgrs.find(x=>!x.isPlayer);R.fac=R.fac||{};R.fac.valet=0;R.mh101=null;r.cpu=[care101Cpu(R,'medic'),care101Cpu(R,'medic'),care101Cpu(R,'medic')].join(',');
  /* other treatment buttons: hours in the small */
  const t=document.createElement('template');t.innerHTML=mgrHTML();r.errs=typeof errNew92==='function'?errNew92(window.RM_MARK).map(e=>e.kind+':'+e.msg):[];return r});
for(const k of ['max4','max7','banStats','banMed','why','banHyg','noTop','noClear','freshOpen','noBath','ord','star','build','medPop','medHired','bedBtn','inBed','takeOut','distinct','oneRow','hoursLine','hyBtn','hyDone','toast','mdBtn','mdDone','refTile','refused','plan','guide'])ok(out.inf[k],'infirmary '+k+(k==='distinct'?' '+out.inf.keys:''));
ok(out.inf.cpu==='5,5,-1','rivals hours '+out.inf.cpu);

/* the roster card's Medicus button shows hours */
await go(pg,'roster');
out.ro=await ev(pg,()=>{const b=document.querySelector(`#mgrPane [data-mg="medic"]:not(.plantile)`) /* v1.02 (341): a booked wound still shows its care tile */;return b?/ h · /.test((b.querySelector("small")||{}).textContent||"")||b.outerHTML.slice(0,400):"none"});ok(out.ro===true||out.ro==='none','roster medic button hours '+out.ro);

/* TRAINING YARD: Recovery */
await go(pg,'practice');
out.yd=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};const pm=me(),w=W_();const ros=rosterOf(pm);
  const g=ros.find(x=>!x.inj&&!(x.severed||[]).length&&!inBed76(x)&&!onCard(x))||ros.find(x=>!x.inj&&!(x.severed||[]).length);for(const bo of (w.night&&w.night.bouts)||[])if(!bo.done)bo.ents=bo.ents.map(id=>id===g.id?null:id).filter(Boolean);g.fat=50;MGR.tr92=g.id;MGR_REDRAW();await W8(400);
  r.block=!!q('#mgrPane .v101rec2');r.rub=!!q(`#mgrPane .v101rec2 [data-bath="${g.id}"]`);r.care=!!q(`#mgrPane .v101rec2 [data-care90="${g.id}"]`);r.rest=!!q(`#mgrPane .v101rec2 [data-rest="${g.id}"]`);
  r.lines=document.querySelectorAll('#mgrPane .v101rec2 .v101rr>span').length===3;
  const f0=gFat(g);q(`#mgrPane .v101rec2 [data-bath="${g.id}"]`).click();await W8(400);r.rubbed=gFat(g)===f0-10;
  q(`#mgrPane .v101rec2 [data-care90="${g.id}"]`).click();await W8(400);r.cared=!!(g.ord87&&g.ord87.r==='care');
  q(`#mgrPane .v101rec2 [data-rest="${g.id}"]`).click();await W8(400);r.rested=g.restWk===w.week;
  return r});
for(const k of ['block','rub','care','rest','lines','rubbed','cared','rested'])ok(out.yd[k],'yard '+k);

/* M14: the recruiting-hours oval is never removed by a redraw */
out.rail=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const pm=me(),w=W_();MGR.tab='infirm';MGR_REDRAW();await W8(900);
  const ov=document.querySelector('.mtabs [data-id="recruit"] .mcount.hr99');if(!ov)return 'nooval';let gone=0;const mo=new MutationObserver(()=>{if(!ov.isConnected)gone++});mo.observe(document.body,{childList:true,subtree:true});
  const g=rosterOf(pm)[1];g.inj={until:w.week+1,label:'a twisted ankle',pen:1};w.mh101=null;MGR.inf90=g.id;MGR_REDRAW();await W8(50);
  const b=document.querySelector(`#mgrPane [data-mg="bath"][data-id="${g.id}"]`);if(b)b.click();await W8(30);for(let i=0;i<3;i++){MGR_REDRAW();await W8(20)}
  const still=document.querySelector('.mtabs [data-id="recruit"] .mcount.hr99');mo.disconnect();return gone===0&&still===ov&&!!b});
ok(out.rail===true,'M14 recruiting oval kept through redraws '+out.rail);
out.errs=await ev(pg,()=>typeof errNew92==='function'?errNew92(window.RM_MARK).map(e=>e.kind+':'+e.msg):[]);ok(!out.errs.length,'no new 00c errors '+JSON.stringify(out.errs));
await pg.close();

/* kill switch */
const pk=await open(1440,900,true);await go(pk,'infirm');
out.off=await ev(pk,()=>({ban:!document.querySelector('.v101st'),cpu:care101Cpu(W_().mgrs.find(x=>!x.isPlayer),'medic')===MEDICUS,top:!!document.querySelector('#mgrPane .wd76top')}));
ok(out.off.ban&&out.off.cpu&&out.off.top,'kill switch '+JSON.stringify(out.off));await pk.close();

/* 390 px: no sideways scroll on the page */
const ph=await open(390,844);await ev(ph,()=>{const ros=rosterOf(me());const w=W_();const A=ros[ros.length-1];A.inj={until:w.week+3,label:'a gashed chest',pen:3};A.severed=['larm'];w.beds76=[A.id];MGR.inf90=A.id});
for(const t of ['infirm','practice']){await go(ph,t);out['ph_'+t]=await ev(ph,()=>{const sc=[...document.querySelectorAll('#mBody,#mgrBody,#mgrPane')];return sc.every(e=>e.scrollWidth<=e.clientWidth+2)})}
ok(out.ph_infirm&&out.ph_practice,'390 no sideways scroll '+out.ph_infirm+' '+out.ph_practice);await ph.close();

console.log(JSON.stringify(out));
console.log('ERRS',JSON.stringify(errs));if(miss.length)console.log('MISS',JSON.stringify(miss));
await b.close();process.exit(miss.length||errs.length?1:0)})();

/* tv102a — v1.02 A MANAGER FIXES (332-v102mgrfix): M1 one limb a week back at the week's end + fatigue, M2 at most 1 special + 3 classics, M3 Your ludus opens
   on its main view, M4 no billing of specials/invitationals, M7 Care routine cost, M8 medicus + Hygeia above the patient list, M14 Valetudinarium disabled when
   broke, M17 Leather Tasset thumbnail, M18 entry fee gates the picker, M19 bed/rest chips, M20 team special takes a free agent from either side
   (the kill switch flavius_v102aoff=1 must show the old M20 failure). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v102aoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    const ros=rosterOf(pm);for(const g of ros){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.contract.weeks=20;g.morale=80;g.ord87=null}
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('infirm');await W8(800);MGR.view=null});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);

const pg=await open(false);
/* ---- M17 thumbnail ---- */
out.m17=await ev(pg,()=>/armthumb102_legwrapsU/.test(cardStyle('a:legwrapsU'))&&!/armthumb81_legwrapsU/.test(cardStyle('a:legwrapsU')));ok(out.m17,'M17 thumb');

/* ---- M1 + M8 + M14: the infirmary ---- */
out.inf=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const q=s=>document.querySelector(s);const r={};const pm=me(),w=W_();const ros=rosterOf(pm);const A=ros[0];
  A.inj={until:w.week+3,label:'a gashed chest',pen:4,ser76:1};A.severed=['larm','rleg'];w.beds76=[];MGR.inf90=A.id;MGR.tab='infirm';MGR_REDRAW();await W8(600);
  /* M8 */r.m8=!!q('aside.rm100list > .v102inf [data-v101med]')&&!!q('aside.rm100list > .v102inf .hyg87')&&!q('.roomhd [data-v101med]')&&!q('.roomhd .hyg87');
  /* M14 */pm.coin=100;MGR_REDRAW();await W8(500);let bd=q('.iv90care [data-mg="build"][data-id="valet"]');r.m14off=!!bd&&bd.classList.contains('off')&&bd.getAttribute('aria-disabled')==='true'&&!!bd.dataset.dis;
  pm.coin=900;MGR_REDRAW();await W8(500);bd=q('.iv90care [data-mg="build"][data-id="valet"]');r.m14on=!!bd&&!bd.dataset.dis&&!bd.classList.contains('off');
  /* M1: bed, Hygeia once */
  const bed=q(`#mgrPane [data-bed76="${A.id}"]`);if(bed)bed.click();await W8(500);r.bed=inBed76(A);
  let hy=q(`#mgrPane [data-mg="heal"][data-id="${A.id}"]`);r.hyTxt=!!hy&&/one limb a week/.test(hy.textContent)&&!hy.dataset.dis;const c0=pm.coin;if(hy)hy.click();await W8(500);
  r.booked=!!A.rg102&&A.rg102.wk===w.week&&A.severed.length===2&&pm.coin<c0;
  hy=q(`#mgrPane [data-mg="heal"][data-id="${A.id}"]`);r.second=!!hy&&/One limb a week/.test(hy.dataset.dis||'');const c1=pm.coin;if(hy)hy.click();await W8(400);r.noSecond=pm.coin===c1&&A.severed.length===2;
  const l0=A.rg102&&A.rg102.l;const f0=A.fat;const wk0=w.week;for(const bo of w.night.bouts)bo.done=true;w.pend=[];
  const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);try{await endWeek()}catch(e){r.endErr=String(e)}clearInterval(hold);await W8(300);
  const w2=W_();r.turned=w2.week!==wk0;r.regrown=r.turned&&!A.severed.includes(l0)&&A.severed.length===1&&!A.rg102;r.fatUp=r.turned&&(A.fat||0)>=Math.min(100,f0+20)-25;
  return r});
for(const k of ['m8','m14off','m14on','bed','hyTxt','booked','second','noSecond','turned','regrown'])ok(out.inf[k],'inf '+k+(out.inf.endErr?' '+out.inf.endErr:''));

/* ---- M7 Care routine ---- */
await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const ros=rosterOf(me());const g=ros.find(x=>!x.inj&&!(x.severed||[]).length)||ros[1];g.inj=null;MGR.tab='practice';MGR.tr92=g.id;MGR_REDRAW();await W8(700)});
out.m7=await ev(pg,()=>{const bs=[...document.querySelectorAll('#mgrPane [data-care90]')];return bs.length>0&&bs.every(x=>/2 of the Training Yard's hours a week, no drills/.test(x.textContent))});ok(out.m7,'M7 care routine text');

/* ---- M3 ---- */
out.m3=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};MGR.tab='ludus';MGR_REDRAW();await W8(600);
  LU100.mail=true;LU100.pop='doctore';LU100.panel='promote';MGR.run='promote';MGR_REDRAW();await W8(500);
  MGR.tab='roster';MGR_REDRAW();await W8(500);MGR.tab='ludus';MGR_REDRAW();await W8(700);
  r.fl=[LU100.mail,LU100.pop,LU100.panel,MGR.run];r.flags=!LU100.mail&&!LU100.pop&&!LU100.panel;r.dom=!document.querySelector('#lu100pop')&&!document.querySelector('#desk99.lu100open')&&!document.querySelector('.lu100panel');return r});
ok(out.m3.flags&&out.m3.dom,'M3 '+JSON.stringify(out.m3));

/* ---- M2: no week with more than 4 bouts / 1 special ---- */
out.m2=await ev(pg,async()=>{const w=W_();const w0=w.week;const r={max:0,maxSp:0,spWeeks:0,weeks:0};
  for(let k=1;k<=24;k++){if(BYE_WKS.includes(((k-1)%12)+1))continue;w.week=k;w.night=null;try{makeNight()}catch(e){r.err=String(e);continue}const n=w.night;if(!n||!n.bouts)continue;r.weeks++;
    const sp=n.bouts.filter(b=>b.tier==='spc100').length;r.max=Math.max(r.max,n.bouts.length);r.maxSp=Math.max(r.maxSp,sp);if(sp)r.spWeeks++}
  w.week=w0;w.night=null;makeNight();return r});
ok(out.m2.weeks>10&&out.m2.max<=4&&out.m2.maxSp<=1&&out.m2.spWeeks>0,'M2 '+JSON.stringify(out.m2));

/* ---- M4 ---- */
out.m4=await ev(pg,async()=>{const w=W_(),pm=me();const r={};const base=w.week-(((w.week-1)%12));
  const rows=wd100BillRows(w,pm);r.rows=rows.length;let spec=0,bad=0,classic=0,classicOk=0;
  for(let a=w.week+1;a<=w.week+11;a++){const {season,wk}=absSW(w,a);if(BYE_WKS.includes(wk))continue;const f=fixtureFor(season,wk);const special=!/democritus|egidious|cassian/.test(f.ev);const need=special;
    const h=rows.find(x=>new RegExp('WK[^<]*?'+wk+'</span>').test(x)&&(season===w.season?!/>S\d+ · /.test(x):new RegExp('>S'+season+' · ').test(x)));if(!h)continue;
    if(a-w.week<3)continue;const hasSel=/id="cm_/.test(h);if(need){spec++;if(hasSel)bad++}else{classic++;if(hasSel)classicOk++}}
  r.spec=spec;r.bad=bad;r.classic=classic;r.classicOk=classicOk;
  /* an invitation week */
  const iv={id:'ivx',sid:Object.keys(SPECIALS)[0],n:'Test games',wk:w.week+5,status:'open',ents:[],sent:w.week};w.invites=[iv];const rows2=wd100BillRows(w,pm);
  const {wk:ivwk}=absSW(w,iv.wk);const h2=rows2.find(x=>new RegExp('WK[^<]*?'+ivwk+'</span>').test(x));r.ivNoSel=!!h2&&!/id="cm_/.test(h2);
  /* the click is stopped before any later handler */
  const sp=(()=>{for(let a=w.week+3;a<=w.week+11;a++){const {season,wk}=absSW(w,a);const f=fixtureFor(season,wk);if(!BYE_WKS.includes(wk)&&!/democritus|egidious|cassian/.test(f.ev))return a}return null})();r.spAbs=sp;
  if(sp){let late=false;const fn=()=>{late=true};document.addEventListener('click',fn,true);const bt=document.createElement('button');bt.dataset.mg='cm_set';bt.dataset.id=String(sp);document.body.appendChild(bt);bt.click();bt.remove();document.removeEventListener('click',fn,true);r.stopped=!late}
  w.invites=[];return r});
ok(out.m4.rows>0&&out.m4.bad===0&&out.m4.ivNoSel&&(out.m4.spAbs==null||out.m4.stopped),'M4 '+JSON.stringify(out.m4));ok(out.m4.classic===0||out.m4.classicOk>0,'M4 classic weeks still billable '+JSON.stringify(out.m4));

/* ---- M18 + M19: the picker; M20 the team seat ---- */
const prep=`(async()=>{const w=W_(),pm=me();const n=w.night;n.bye=false;const ros=rosterOf(pm);for(const g of ros){g.inj=null;g.severed=[];g.restWk=null;g.fat=10}
  w.beds76=[];n.bouts=n.bouts.filter(b=>b.tier!=='spc100');
  const nb={tier:'spc100',ev:'naumachia',purse:100,special:true,fee:0,ents:[],done:false,res:null,bets:[],any100:{fee:20,src:'ed',day:1,rx:null,side:{},paid:{},hire:{},ed:{}}};n.bouts.push(nb);return n.bouts.length-1})()`;
out.m18=await ev(pg,async(prep)=>{const r={};const bi=await eval(prep);const w=W_(),pm=me(),b=w.night.bouts[bi];const g=rosterOf(pm)[0];
  pm.coin=5;r.poor=any100Why(w,b,g);r.poorShort=any100Short(w,b,g);pm.coin=500;r.rich=any100Why(w,b,g);
  /* M19: bed + rest chips */
  const A=rosterOf(pm)[1],B=rosterOf(pm)[2];A.inj={until:w.week+3,label:'x',pen:4,ser76:1};w.beds76=[A.id];B.restWk=w.week;ANY100.pk={bi,gid:g.id,pt:null,why:null};
  const h=any100PickHTML();const T=document.createElement('template');T.innerHTML=h;const rowOf=x=>T.content.querySelector(`.a1fr[data-any100="sel|${x.id}"]`);
  r.bed=!!rowOf(A)&&/in bed/.test((rowOf(A).querySelector('.a1fw102 .a1st102.bed')||{}).textContent||'')&&!!rowOf(A).querySelector('.a1fw102 .fb90');r.rest=!!rowOf(B)&&/resting/.test((rowOf(B).querySelector('.a1st102')||{}).textContent||'');
  ANY100.pk=null;w.beds76=[];A.inj=null;B.restWk=null;return r},prep);
ok(out.m18.poor&&/entry fee/i.test(out.m18.poor)&&out.m18.poorShort&&!out.m18.rich,'M18 '+JSON.stringify(out.m18));ok(out.m18.bed&&out.m18.rest,'M19 '+JSON.stringify(out.m18));
const teamTest=async(pg)=>pg.evaluate(async(prep)=>{const r={};const bi=await eval(prep);const w=W_(),pm=me(),n=w.night,b=n.bouts[bi];const size=boutSize(b);r.size=size;const cap=size/2;
  const rivals=w.glads.filter(g=>g.alive&&g.contract&&!mgrById(g.contract.mgr).isPlayer&&!g.inj);const fa=freeAgents().filter(g=>!g.inj);const used=new Set(n.bouts.flatMap(x=>x.ents));
  const R=rivals.filter(g=>!used.has(g.id)).slice(0,cap),F=fa.filter(g=>!used.has(g.id)).slice(0,cap);r.have=[R.length,F.length,cap];
  for(const g of R){b.ents.push(g.id);b.any100.side[g.id]='A'}for(const g of F){b.ents.push(g.id);b.any100.side[g.id]='B'}
  pm.coin=900;const mine=rosterOf(pm)[0];const res=any100Book(bi,mine.id,null);r.ok=res.ok;r.why=res.why||'';r.in=b.ents.includes(mine.id);r.side=b.any100.side[mine.id]||null;return r},prep);
out.m20=await teamTest(pg);ok(out.m20.have[0]===out.m20.have[2]&&out.m20.have[1]===out.m20.have[2]&&out.m20.ok&&out.m20.in,'M20 '+JSON.stringify(out.m20));

/* the kill switch shows the old failure (reproduction) */
const pg2=await open(true);out.m20old=await teamTest(pg2);out.m2old=await pg2.evaluate(async()=>{const w=W_();const r={max:0};for(let k=1;k<=24;k++){if(BYE_WKS.includes(((k-1)%12)+1))continue;w.week=k;w.night=null;try{makeNight()}catch(e){continue}if(w.night&&w.night.bouts)r.max=Math.max(r.max,w.night.bouts.length)}return r});ok(out.m2old.max>=5,'M2 old behaviour (kill switch) reaches 5 bouts '+JSON.stringify(out.m2old));ok(out.m20old.have[0]===out.m20old.have[2]&&!out.m20old.ok,'M20 old behaviour (kill switch) '+JSON.stringify(out.m20old));

/* M21 · Armory: starters in gold */
out.m21=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const ros=rosterOf(me()).filter(x=>!x.inj);if(typeof st95Ensure==='function')st95Ensure(me());MGR.tab='armory';MGR_REDRAW();await W8(600);
  const st=new Set(rosterOf(me()).filter(x=>x.slot95>=1&&x.slot95<=3).map(x=>x.id));const tiles=[...document.querySelectorAll('#mgrBody .ar94g[data-ar94g]')];
  const gold=tiles.filter(t=>t.classList.contains('st102')).map(t=>t.dataset.ar94g);const bad=tiles.filter(t=>t.classList.contains('st102')!==st.has(t.dataset.ar94g)).length;
  const glow=gold.length?getComputedStyle(document.querySelector('.ar94g.st102')).boxShadow:'';return {n:tiles.length,starters:st.size,gold:gold.length,bad,glow:/rgb/.test(glow)}});
ok(out.m21.n>0&&out.m21.starters>0&&out.m21.gold===Math.min(out.m21.starters,out.m21.n)&&!out.m21.bad&&out.m21.glow,'M21 armory starters in gold '+JSON.stringify(out.m21));

/* M22 · Armory: loaned fighters in their own list */
out.m22=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const pm=me();const ros=rosterOf(pm);const g=ros[ros.length-1];const keep=g.loanFrom;
  const rv=W_().mgrs.find(m=>m.id!==pm.id);g.loanFrom={mid:rv.id,fee:5,weeks:3};MGR.tab='armory';MGR_REDRAW();await W8(600);
  const tile=!!document.querySelector(`#mgrBody .ar94g[data-ar94g="${g.id}"]`);const card=document.querySelector('#mgrBody #ln102');const inCard=!!card&&card.textContent.includes(g.name);
  const order=card&&document.getElementById('ar96dmg')?!!(card.compareDocumentPosition(document.getElementById('ar96dmg'))&Node.DOCUMENT_POSITION_FOLLOWING):null;
  const others=document.querySelectorAll('#mgrBody .ar94g[data-ar94g]').length;g.loanFrom=keep;MGR_REDRAW();await W8(300);return {tile,inCard,order,others}});
ok(!out.m22.tile&&out.m22.inCard&&out.m22.order!==false&&out.m22.others>0,'M22 loaned fighter off the dress list, in the On loan card above Damaged '+JSON.stringify(out.m22));

for(const p of [pg,pg2])out.errs=(out.errs||[]).concat(await p.evaluate(()=>typeof errNew92==='function'?errNew92(window.RM_MARK).map(e=>e.kind+':'+e.msg):[]));
ok(!out.errs.length,'00c errors '+JSON.stringify(out.errs));
console.log(JSON.stringify(out,null,1).slice(0,3500));console.log('PAGEERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));
await b.close();process.exit(miss.length||errs.length?1:0)})();

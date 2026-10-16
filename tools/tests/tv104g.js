/* tv104g — v1.04 beta fixes B12 B13 B18 B20 (354-v104fixw): the Training Yard has no 🗣 Care on its cards (an old save's booked care still counts);
   the Doctore's face/name/stars/summary sit in the Yard banner and his Intensity + Time are the TOP ROW of the week's plan; his hours LOCK with a
   card's drill (up yes, down no) and with Lock in all (which also locks the Intensity); a locked drill tile says what unlocks it; the hired house
   medicus is the CAPSARIUS: a staff slot in the Infirmary banner (empty / hired, wage + coin, Let go), his hours a gold segment on the hours bar,
   no hire button on the patient list, the three-tile hire popup (portrait, stars, wage, chips, square close); row chips "Receiving treatment" /
   "Resting" (no ✓); the kill switch; 390 px (no sideways scroll); no new errors. SHOT=<dir> saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const SHOT=process.env.SHOT;
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v104woff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.ord87=null;g.morale=80}
    window.RM_MARK=typeof ERR92!=='undefined'?ERR92.n:0;menuHide();openManager('practice');await W8(800);MGR.view=null;
    window.GO=async t=>{MGR.tab=t;MGR.view=null;MGR_REDRAW();await W8(500)}});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const shot=async(pg,n)=>{if(SHOT)await pg.screenshot({path:`${SHOT}/${n}.png`,fullPage:true})};
const pg=await open(1440,900);

/* ---------- B12 + B13: the Training Yard ---------- */
await ev(pg,async()=>{await GO('practice')});
const y1=await ev(pg,async()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const r={};const w=W_(),pm=me();const P=thPlan(w);const ros=rosterOf(pm);
  r.noCare=qa('[data-y92care]').length===0;
  const dc=q('.roomhd .v104dc');r.dc=!!dc&&/drills \+\d+% · Yard \d\/3 · hours with him 0\/4/.test(dc.textContent)&&/★/.test(dc.textContent)&&!!dc.querySelector('b').textContent.trim();
  r.face=!!q('.roomhd .rm100rd svg');
  const wax=q('.rm100plan .rm100wax');r.top=!!wax&&wax.firstElementChild.classList.contains('v104top')&&!!wax.querySelector('.v104top [data-mg="regime"][data-id="std"]')&&!!wax.querySelector('.v104top [data-tp="doc|1"]')&&!!wax.querySelector('.v104top [data-yj="study"]');
  r.noDocCard=!q('.rm100y1 > .rm100doc')&&!q('.y92dh');r.two=!!q('.rm100y1.v104y');
  /* d2a texts (Yard 0, no hours) */
  const t=k=>{const e=q(`.rm100plt[data-rm100pre="${k}"] .v104unl`);return e?e.textContent.trim():''};
  r.u2=t('show');r.u3=t('blood');r.u4=t('vet');r.u5=t('parade');r.keys=qa('.rm100plt').map(e=>e.dataset.rm100pre||e.dataset.y92pre).join(',');
  r.nm=(q('.roomhd .v104dc b')||{}).textContent;
  /* an old save with a care already booked this week renders */
  const g=ros[3];const X=x74(w);X.morale.push(g.id);X.gear.push(g.id);y92Of(P,g.id).care=1;MGR_REDRAW();await W8(400);r.oldCare=!!q('.rm100plan')&&qa('[data-y92care]').length===0;X.morale.pop();X.gear.pop();delete y92Of(P,g.id).care;MGR_REDRAW();await W8(300);
  return r});
console.log('YARD1',JSON.stringify(y1));
ok(y1.noCare,'no 🗣 Care button on the cards');ok(y1.dc&&y1.face,'Doctore in the banner');ok(y1.top,'Intensity + Time = the plan top row');ok(y1.noDocCard&&y1.two,'two columns, no separate Doctore card');
ok(y1.u2==='','Lv 2 tile open (the Doctore advisor gives level 2): '+y1.u2);ok(/^🔒 Lv 3 · 2 more hours with .+, or Yard I$/.test(y1.u3)&&y1.u3.includes(y1.nm),'Lv 3 tile: '+y1.u3);
ok(/^🔒 Lv 4 · 4 more hours with .+, or Yard II$/.test(y1.u4),'Lv 4 tile: '+y1.u4);ok(y1.u5==='🔒 Lv 5 · Yard III','Lv 5 tile: '+y1.u5);ok(y1.oldCare,'old care booked still renders');
await shot(pg,'v104g-yard-1440');

/* d1a: hours lock with a drill; down refused, up allowed */
const y2=await ev(pg,async()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const r={};const w=W_(),pm=me();const P=thPlan(w);const ros=rosterOf(pm);const g=ros[2];MGR.tr92=g.id;MGR_REDRAW();await W8(400);
  q('.v104top [data-tp="doc|1"]').click();await W8(250);q('.v104top [data-tp="doc|1"]').click();await W8(250);r.doc=P.doc;r.up=P.doclk==null;
  q(`[data-y92s="${g.id}|spd|1"]`).click();await W8(250);q(`[data-y92lock="${g.id}"]`).click();await W8(300);
  r.unl=!!q('.rm100plt[data-y92pre$="|blood"]');
  /* a Lv 1 drill does not lock his hours */
  const f=q('.rm100plt[data-y92pre$="|foot"]');r.foot=!!f;
  q('.rm100plt[data-y92pre$="|blood"]').click();await W8(300);q(`[data-y92s="${g.id}|str|1"]`)&&q(`[data-y92s="${g.id}|str|1"]`).click();await W8(200);
  r.pre=!!(y92Peek(P,g.id).pre);const lk=q(`[data-y92lock="${g.id}"]`);if(lk&&!lk.disabled){lk.click();await W8(300)}
  r.lockedAt=P.doclk;r.preLock=!!(y92Peek(P,g.id).pre&&y92Peek(P,g.id).pre.lock);
  const dn=q('.v104top [data-tp="doc|-1"]');r.dnDis=!!dn&&dn.disabled;
  /* a stray programmatic click is refused too */
  window.dispatchEvent&&0;const before=P.doc;const dn2=q('.v104top [data-tp="doc|-1"]');dn2.disabled=false;dn2.click();await W8(250);r.after=thPlan(w).doc===before;
  q('.v104top [data-tp="doc|1"]').click();await W8(250);r.upOk=thPlan(w).doc===before+1;r.hold=!!q('.v104hold');
  return r});
console.log('YARD2',JSON.stringify(y2));
ok(y2.doc===2&&y2.up,'two hours added, nothing locked yet');ok(y2.pre&&y2.preLock,'drill picked + locked');ok(y2.lockedAt===2,'hours locked at 2 with the drill: '+y2.lockedAt);ok(y2.dnDis,'− disabled once locked');ok(y2.after,'down refused');ok(y2.upOk,'up allowed');ok(y2.hold,'held note');
await shot(pg,'v104g-yard-locked');

/* Lock in all locks the Intensity and the hours (new week plan) */
const y3=await ev(pg,async()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const r={};const w=W_();w.tplan=null;const P=thPlan(w);MGR_REDRAW();await W8(400);
  const all=q('[data-y92all]');r.on=!!all&&!all.disabled;r.free=P.reglk==null&&P.doclk==null;
  q('.v104top [data-tp="doc|1"]').click();await W8(200);all.click();await W8(400);
  r.reglk=P.reglk===1;r.doclk=P.doclk===1;r.regDis=qa('.v104top [data-mg="regime"]').every(x=>x.disabled);r.dnDis=q('.v104top [data-tp="doc|-1"]').disabled;
  const t0=w.train;qa('.v104top [data-mg="regime"]')[2].click();await W8(200);r.same=w.train===t0;
  return r});
console.log('YARD3',JSON.stringify(y3));
ok(y3.on&&y3.free,'Lock all on while nothing pending');ok(y3.reglk&&y3.doclk,'Lock all locks hours + intensity');ok(y3.regDis&&y3.dnDis,'controls disabled');ok(y3.same,'intensity unchanged');

/* ---------- B18 + B20: the Infirmary ---------- */
await ev(pg,async()=>{const w=W_(),pm=me();const ros=rosterOf(pm);w.medicus76=null;ros[0].inj={until:w.week+3,label:'a gashed chest',pen:4};ros[0].medWk=w.week;ros[1].fat=50;ros[1].restWk=w.week;await GO('infirm')});
const i1=await ev(pg,async()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const r={};const w=W_(),pm=me();const ros=rosterOf(pm);
  const sl=q('.roomhd .v104cap');r.empty=!!sl&&/Capsarius · empty/.test(sl.textContent)&&/\+2–6 h a week/.test(sl.textContent)&&!!sl.querySelector('[data-v101med]');
  r.noList=qa('.w104list [data-v101med], .w104list .v101med, .v102inf .v101med').length===0&&qa('.roomhd .v101med').length===0;
  r.trt=qa('.w104row .trt103').map(x=>x.textContent.trim());r.rst=qa('.w104row .rst104').map(x=>x.textContent.trim());
  r.noTick=!/✓/.test(qa('.w104row .trt103, .w104row .rst104').map(x=>x.textContent).join(''));
  r.noBar=!q('.w104bar .k104cp');
  sl.querySelector('[data-v101med]').click();await W8(300);
  const pop=q('.v104mp');r.pop=!!pop;r.tiles=qa('.v104mp .v104ct').length;r.face=qa('.v104mp .v104cph svg').length;r.coin=qa('.v104mp .v104ct .ic87c').length;r.stars=qa('.v104mp .v104cs').map(x=>x.textContent);
  r.chips=qa('.v104mp .v104ct').map(t=>[...t.querySelectorAll('.v104chp i')].map(i=>i.textContent).join('|'));r.x=!!q('.v104mp .v104x.lu100x');r.noHouse=!/house medicus/i.test(pop?pop.textContent:'');
  r.xr=(()=>{const e=q('.v104mp .v104x');return e?getComputedStyle(e).borderRadius:''})();
  window.__shot=1;
  return r});
console.log('INF1',JSON.stringify(i1));
ok(i1.empty,'empty staff slot');ok(i1.noList,'no hire button on the list / old banner');ok(i1.trt.length>=1&&i1.trt.every(t=>t==='Receiving treatment')&&i1.rst.every(t=>t==='Resting')&&i1.rst.length>=1,'chips Receiving treatment / Resting');ok(i1.noTick,'no ✓');ok(i1.noBar,'no Capsarius segment when empty');
ok(i1.pop&&i1.tiles===3&&i1.face===3&&i1.coin>=3&&i1.x&&i1.noHouse,'hire popup tiles');ok(i1.chips.every(c=>/\+\d+ h a week/.test(c)&&/may be lured away/.test(c))&&/saves limbs/.test(i1.chips[2])&&!/saves limbs/.test(i1.chips[1]),'chips: '+JSON.stringify(i1.chips));
await shot(pg,'v104g-hire-popup');
const i2=await ev(pg,async()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const r={};const w=W_();const c0=me().coin;
  const mx0=mh101Max(me(),w);q('.v104mp [data-v101mh="1"]').click();await W8(500);const M=w.medicus76;r.hired=!!M&&M.skill===2;r.popGone=!q('.v104mp');
  const sl=q('.roomhd .v104cap.on');r.slot=!!sl&&sl.textContent.includes(M.name)&&!!sl.querySelector('.v104cf svg')&&!!sl.querySelector('.ic87c')&&!!sl.querySelector('[data-med76="fire"]')&&/★★☆/.test(sl.textContent);
  r.bar=!!q('.w104bar .k104cp')&&parseFloat(q('.w104bar .k104cp').style.width)>0&&!!q('.w104hbl .k104cp');r.hours=mh101Max(me(),w)-mx0===4;
  r.news=(w.news||[]).slice(-3).concat(w.tnews||[]).join(' ');
  q('[data-med76="fire"]').click();await W8(500);r.fired=!w.medicus76&&!!q('.roomhd .v104cap [data-v101med]');
  return r});
console.log('INF2',JSON.stringify(i2));
ok(i2.hired&&i2.popGone,'hired from the tile');ok(i2.slot,'hired slot');ok(i2.bar,'gold segment on the bar + legend');ok(i2.hours,'+4 h');ok(i2.fired,'Let go');
/* a Capsarius hired earlier (no stored look) */
const i3=await ev(pg,async()=>{const w=W_();w.medicus76={name:'Celsus',skill:3,wage:11};await GO('infirm');return !!document.querySelector('.roomhd .v104cap.on .v104cf svg')&&/Celsus/.test(document.querySelector('.roomhd .v104cap').textContent)});
ok(i3,'old Capsarius without a look draws one');
await shot(pg,'v104g-infirmary-hired');
await ev(pg,async()=>{W_().medicus76=null});

/* ---------- 390 px ---------- */
await pg.setViewportSize({width:390,height:844});
const ph=await ev(pg,async()=>{const r={};for(const t of ['practice','infirm']){await GO(t);r[t]=document.documentElement.scrollWidth-innerWidth;r[t+'dc']=!!document.querySelector('.roomhd .v104dc,.roomhd .v104cap');window.scrollTo(0,0)}
  W_().medicus76={name:'Soranus',skill:2,wage:7};await GO('infirm');r.hired=document.documentElement.scrollWidth-innerWidth;W_().medicus76=null;await GO('infirm');
  document.querySelector('[data-v101med]').click();await W8(300);r.popW=document.documentElement.scrollWidth-innerWidth;r.card=(()=>{const c=document.querySelector('.v104mc');return c?c.getBoundingClientRect().right<=innerWidth+1:false})();document.querySelector('.v104x').click();return r});
console.log('PHONE',JSON.stringify(ph));
ok(ph.practice<=0&&ph.infirm<=0&&ph.hired<=0&&ph.popW<=0&&ph.card,'390 px: no sideways scroll');
await shot(pg,'v104g-infirmary-390');
await ev(pg,async()=>{await GO('practice')});await shot(pg,'v104g-yard-390');
await pg.setViewportSize({width:1440,height:900});

/* ---------- the kill switch ---------- */
const off=await open(1440,900,true);
const k=await ev(off,async()=>{await GO('practice');const r={};r.care=document.querySelectorAll('[data-y92care]').length>0;r.dc=!!document.querySelector('.v104dc');await GO('infirm');r.cap=!!document.querySelector('.v104cap');return r});
console.log('OFF',JSON.stringify(k));ok(k.care&&!k.dc&&!k.cap,'kill switch flavius_v104woff=1 keeps the old Yard + Infirmary');

const rm=await ev(pg,()=>typeof ERR92!=='undefined'?ERR92.n-window.RM_MARK:0);ok(rm===0,'no new errors logged');
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

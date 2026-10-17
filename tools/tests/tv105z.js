/* tv105z — v1.05 beta-3 B70/B71 (388-v105compact, his Y1a Y2a Y3 Y4a): at 1440x900 the Training Yard's Lock in sits in the page banner and
   is visible without scrolling (and still locks the week through 373's one handler); the Yard, Armory and Recruiting banners are the slim
   Roster/Infirmary banner (height = the Roster banner ±2, never taller than the Infirmary's; face at left, counters as chips; the
   building-project chip .bp104c still in the banner); the Doctore / Time / Intensity blocks share one band; the Team drill card and the
   Who-drills chips share one row (tops ±8); no empty strip under Intensity (band bottom − Intensity bottom ≤ 30); the Armory title does not repeat its 🛡 medallion; once
   locked the banner's Lock in carries the Tabula's note as its title; the Beast pen's "Needs 2 hours" is printed once (no duplicate title tooltip). 390x844: no
   sideways scroll on the three pages, the Armory / Recruiting banners one row (≤70 px), Lock in in the first screen. Kill switch flavius_v105compactoff=1 = the old layout. SHOT=<dir> saves
   screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT;
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105compactoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    const ros=rosterOf(pm);for(const g of ros){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.ord87=null;g.morale=80}ros[1].inj={until:w.week+3,label:'a cut',pen:2};
    const H=arm94H(pm);if(!(H.sh||[]).length)H.sh.push({id:'zz105',t:'w',k:'gladius'});
    window.TAB=async t=>{MGR.view=null;MGR.tab=t;MGR_REDRAW();await W8(500);const mb=document.getElementById('mBody');if(mb)mb.scrollTop=0;await W8(60)};
    window.BOX=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),b:Math.round(r.bottom),r:Math.round(r.right)}};
    window.HSCROLL=()=>{const mb=document.getElementById('mBody');return document.documentElement.scrollWidth>innerWidth+1||(!!mb&&mb.scrollWidth>mb.clientWidth+1)};
    menuHide();openManager('practice');await W8(800);await TAB('practice')});return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,400));await b.close();process.exit(1)}};
const shot=async(pg,n)=>{if(SHOT)await pg.screenshot({path:`${SHOT}/${n}.png`})};
const BAN='#mgrPane .roomhd, .railmain>.roomhd';

/* ---- 1440x900 ---- */
const pg=await open(1440,900);
const y=await ev(pg,async BAN=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const r={};await TAB('practice');
  const hd=q(BAN);r.slim=!!hd&&hd.classList.contains('cp105ban');const lk=q('[data-y105="lock"]');r.lockInBan=!!lk&&!!hd&&hd.contains(lk);r.lockN=qa('[data-y105="lock"]').length;
  const L=BOX('[data-y105="lock"]');r.lock=L;r.lockVis=!!L&&L.t>=0&&L.b<=innerHeight&&L.w>0;r.tabLock=!!q('#mgrPane .y105tab [data-y105="lock"]');r.same=!!q('#mgrPane .y105tab [data-y105="same"]');
  r.hrsChip=!!q('#mgrPane .roomhd .y105hrs .y105big')&&+q('#mgrPane .roomhd .y105hrs .y105big').textContent===thLeft(W_());r.face=!!hd.querySelector('.rm100rd');
  r.yard=BOX(BAN).h;r.who=BOX('#mgrPane .y105who');r.time=BOX('#mgrPane .y105time');r.int=BOX('#mgrPane .y105int');r.dt=BOX('#mgrPane .y105drill');r.band=BOX('#mgrPane .y105dtop');r.whod=BOX('#mgrPane .y105whod');
  r.arrows=qa('#mgrPane .y105drill [data-y105^="dr|"]').length;r.chips=qa('#mgrPane .y105whod .y105chip').length;r.drillCard=!!q('#mgrPane .y105dt[data-y105k]');
  return r},BAN);
console.log('YARD',JSON.stringify(y));
ok(y.slim&&y.face,'Yard banner = the slim banner with the Doctore face');ok(y.lockInBan&&y.lockN===1&&!y.tabLock&&y.same,'Lock in moved into the banner (one button), ↻ Same as last week stays in the Tabula');
ok(y.lockVis,'Lock in visible without scrolling '+JSON.stringify(y.lock));ok(y.hrsChip,'the hours chip (.y105hrs .y105big) shows the hours left');
ok(y.band.b-y.int.b<=30,'no empty strip under Intensity (band bottom '+y.band.b+', Intensity bottom '+y.int.b+')');
const tops=[y.who.t,y.time.t,y.int.t];ok(Math.max(...tops)-Math.min(...tops)<=8&&y.who.l<y.time.l&&y.time.l<y.int.l,'Doctore / Time / Intensity share one band '+JSON.stringify(tops));
ok(Math.abs(y.dt.t-y.whod.t)<=8&&y.dt.r<=y.whod.l+2,'Team drill card + Who-drills chips share one row '+y.dt.t+'/'+y.whod.t);ok(y.arrows===2&&y.chips>=3&&y.drillCard,'drill card keeps ‹ › and the chips');
const bn=await ev(pg,async BAN=>{const q=s=>document.querySelector(s);const r={};
  for(const t of ['infirm','roster','armory','recruit']){await TAB(t);const hd=q(BAN);r[t]={ttl:((hd&&hd.querySelector('.roomttl b'))||{}).textContent||'',h:BOX(BAN).h,slim:!!hd&&hd.classList.contains('cp105ban'),face:!!hd&&!!hd.querySelector('.rm100rd'),stat:((hd&&hd.querySelector('.roomstat'))||{}).textContent||'',old:!!(hd&&hd.querySelector('.rc1banf'))}}
  return r},BAN);
console.log('BANNERS',JSON.stringify(bn));
for(const t of ['armory','recruit'])ok(bn[t].slim&&bn[t].face&&!bn[t].old&&/\d/.test(bn[t].stat),t+': slim banner, face at left, the counter as a chip');
ok(!/\u{1F6E1}/u.test(bn.armory.ttl),'Armory: the 🛡 medallion is not repeated in the title '+bn.armory.ttl);
for(const [t,h] of [['practice',y.yard],['armory',bn.armory.h],['recruit',bn.recruit.h]])ok(Math.abs(h-bn.roster.h)<=2&&h<=bn.infirm.h+2,`${t} banner ${h} px = the Roster banner (${bn.roster.h}) ±2, not taller than the Infirmary's (${bn.infirm.h})`);
await shot(pg,'tv105z-armory');
/* the building-project chip stays in the slim banners */
const bp=await ev(pg,async BAN=>{const q=s=>document.querySelector(s);const pm=me();const r={};const keep=pm.bp104;
  try{for(const [k,t] of [['yard','practice'],['armory','armory']]){pm.bp104={k,l:1,n:2};await TAB(t);const hd=q(BAN);r[t]={chip:!!(hd&&hd.querySelector('.bp104c')),h:BOX(BAN).h,one:document.querySelectorAll('.bp104c').length}}}finally{pm.bp104=keep}
  await TAB('practice');return r},BAN);
console.log('PROJECT',JSON.stringify(bp));
for(const t of ['practice','armory'])ok(bp[t].chip&&bp[t].one===1&&Math.abs(bp[t].h-bn.roster.h)<=2,t+': the project chip (.bp104c) in the slim banner, one chip, same height');
/* Y3: the Beast pen's reason printed once — no duplicate title tooltip */
const pen=await ev(pg,async()=>{const q=s=>document.querySelector(s);const w=W_();const P=thPlan(w);const r={};const keep=P.doc;
  P.doc=Math.max(0,thMax()-1);if(thLeft(w)>=2)P.doc=thMax()-1;MGR.tr105='pen';await TAB('practice');
  const t=q('#mgrPane .y105trial');r.k=t&&t.dataset.y105t;r.why=((t&&t.querySelector('.y105why'))||{}).textContent||'';const run=t&&t.querySelector('.y105run');r.dis=!!run&&run.disabled;r.title=run?run.getAttribute('title'):'-';
  r.dup=t?[...t.querySelectorAll('[title],[data-tip]')].filter(e=>(e.getAttribute('title')||e.dataset.tip||'')===r.why).length:-1;
  P.doc=keep;MGR.tr105='spar';await TAB('practice');return r});
console.log('PEN',JSON.stringify(pen));
ok(pen.k==='pen'&&/2/.test(pen.why)&&pen.dis,'Beast pen: needs 2 hours, printed under the button');ok(pen.title==null&&pen.dup===0,'no duplicate "Needs 2 hours" tooltip');
await shot(pg,'tv105z-yard');
/* Lock in from the banner = the same handler */
const lk=await ev(pg,async()=>{const q=s=>document.querySelector(s);const w=W_();const P=thPlan(w);const r={};q('[data-y105="doc|1"]').click();await W8(300);
  const b=q('#mgrPane .roomhd [data-y105="lock"]');r.title=!!(b&&b.title);b.click();await W8(400);r.lk=!!P.lk105&&P.reglk===1&&P.doclk===P.doc;
  const b2=q('#mgrPane .roomhd [data-y105="lock"]');r.after=!!b2&&b2.disabled&&/Locked in/.test(b2.textContent);r.note=!!b2&&/Nothing changes until next week/.test(b2.title)&&!/Nothing changes until next week/.test((q('#mgrPane .y105tab .y105acts')||{}).textContent||'');return r});
console.log('LOCK',JSON.stringify(lk));ok(lk.title&&lk.lk&&lk.after&&lk.note,'Lock in (banner) locks the week; shows 🔒 Locked in; its note moves with it (title), none left alone in the Tabula');
await pg.close();

/* ---- 390x844 ---- */
const ph=await open(390,844);
const p=await ev(ph,async BAN=>{const r={};for(const t of ['practice','armory','recruit']){await TAB(t);r[t]={hs:HSCROLL(),h:BOX(BAN).h}}
  await TAB('practice');const L=BOX('[data-y105="lock"]');r.lock=L;r.vis=!!L&&L.t>=0&&L.b<=innerHeight&&L.w>0;r.inBan=!!document.querySelector('#mgrPane .roomhd [data-y105="lock"]');return r},BAN);
console.log('PHONE',JSON.stringify(p));
for(const t of ['practice','armory','recruit'])ok(!p[t].hs,'390 px '+t+': no sideways scroll');
for(const t of ['armory','recruit'])ok(p[t].h<=70,'390 px '+t+': the banner stays one row ('+p[t].h+' px)');ok(p.vis&&p.inBan,'390 px: Lock in in the banner, in the first screen '+JSON.stringify(p.lock));
await shot(ph,'tv105z-390');await ph.close();

/* ---- kill switch ---- */
const pk=await open(1440,900,true);
const k=await ev(pk,async BAN=>{const q=s=>document.querySelector(s);const r={};await TAB('practice');
  r.plate=!!q('#mgrPane .roomhd .y105hrs');r.noSlim=!q('.cp105ban')&&!q('#mgrPane .y105.cp105');r.tabLock=!!q('#mgrPane .y105tab [data-y105="lock"]');r.banLock=!!q('#mgrPane .roomhd [data-y105="lock"]');
  await TAB('armory');r.arm=BOX(BAN).h;r.armSlim=!!q('.cp105ban');await TAB('recruit');r.rec=BOX(BAN).h;r.recFace=!!q('.roomhd .rc1banf');return r},BAN);
console.log('OFF',JSON.stringify(k));
ok(k.plate&&k.noSlim&&k.tabLock&&!k.banLock&&!k.armSlim&&k.arm>100&&k.rec>100&&k.recFace,'kill switch: the old layout (Lock in in the Tabula, tall Armory / Recruiting banners)');
await pk.close();
console.log('MISSING',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

/* tv105z — v1.05 beta-3 B70/B71 (388-v105compact, his Y1a Y2a Y3 Y4a): at 1440x900 the Training Yard's Lock in sits in the page banner and
   is visible without scrolling (and still locks the week through 373's one handler); the Yard, Armory and Recruiting banners are the slim
   Roster/Infirmary banner (height = the Roster banner ±2, never taller than the Infirmary's; face at left, counters as chips; the
   building-project chip .bp104c still in the banner); the Doctore / Time / Intensity blocks share one band; the Team drill card and the
   Who-drills chips share one row (tops ±8); no empty strip under Intensity (band bottom − Intensity bottom ≤ 30); the Armory title does not repeat its 🛡 medallion; once
   locked the banner's Lock in carries the Tabula's note as its title; the Beast pen's "Needs 2 hours" is printed once (no duplicate title tooltip). 390x844: no
   sideways scroll on the three pages, the Armory / Recruiting banners one row (≤70 px), Lock in in the first screen. Review round 2: Intensity buttons ≥ 88 px, unclipped; the drill card as wide as its content; no title + data-tip on the counter chips;
   review round 3: the Armory's "Your Armory" heading gone, its hurt count a banner chip (names in the data-tip), the 1440 px Doctore column short (one-line eyebrow), the Study chip one line;
   2000x1150: Intensity starts ≤ 40 px after the Time content; 1280x800: one band (3 columns, or Doctore over Intensity with Time beside); German at 1440;
   390 px: the Armory number keeps its 🛡. Kill switch flavius_v105compactoff=1 = the old layout. SHOT=<dir> saves
   screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT;
const open=async(W,H,off,lang)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o.off)localStorage.setItem('flavius_v105compactoff','1');if(o.lang){localStorage.setItem('flavius_lang',o.lang);localStorage.setItem('flavius_langask86','1')}},{off:off?1:0,lang:lang||''});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    const ros=rosterOf(pm);for(const g of ros){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.ord87=null;g.morale=80}ros[1].inj={until:w.week+3,label:'a cut',pen:2};
    const H=arm94H(pm);if(!(H.sh||[]).length)H.sh.push({id:'zz105',t:'w',k:'gladius'});
    window.TAB=async t=>{MGR.view=null;MGR.tab=t;MGR_REDRAW();await W8(500);const mb=document.getElementById('mBody');if(mb)mb.scrollTop=0;await W8(60)};
    window.BOX=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),b:Math.round(r.bottom),r:Math.round(r.right)}};
    window.TXR=s=>{const e=document.querySelector(s);if(!e)return 0;let R=0;const tw=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let n;while(n=tw.nextNode()){if(!n.nodeValue.trim())continue;const rg=document.createRange();rg.selectNodeContents(n);for(const r of rg.getClientRects())R=Math.max(R,r.right)}
      for(const c of e.querySelectorAll('button,img,.y105lad,.y105face,.y105art'))R=Math.max(R,c.getBoundingClientRect().right);return Math.round(R)};
    window.BAND=()=>{const r={band:BOX('#mgrPane .y105dtop'),who:BOX('#mgrPane .y105who'),time:BOX('#mgrPane .y105time'),int:BOX('#mgrPane .y105int'),tc:TXR('#mgrPane .y105time')};
      r.segs=[...document.querySelectorAll('#mgrPane .y105seg')].map(s=>({w:Math.round(s.getBoundingClientRect().width),h:Math.round(s.getBoundingClientRect().height),ov:[s,...s.querySelectorAll('b,small')].some(x=>getComputedStyle(x).display!=='none'&&x.scrollWidth>x.clientWidth+1)}));return r};
    window.HSCROLL=()=>{const mb=document.getElementById('mBody');return document.documentElement.scrollWidth>innerWidth+1||(!!mb&&mb.scrollWidth>mb.clientWidth+1)};
    menuHide();openManager('practice');await W8(800);await TAB('practice')});return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,400));await b.close();process.exit(1)}};
const shot=async(pg,n)=>{if(SHOT)await pg.screenshot({path:`${SHOT}/${n}.png`})};
const BAN='#mgrPane .roomhd, .railmain>.roomhd';

/* ---- 1440x900 ---- */
const pg=await open(1440,900);
const y=await ev(pg,async BAN=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const r={};await TAB('practice');
  const hd=q(BAN);r.slim=!!hd&&hd.classList.contains('cp105ban');const lk=q('[data-y105="lock"]');r.lockInBan=!!lk&&!!hd&&hd.contains(lk);r.lockN=qa('[data-y105="lock"]').length;
  const L=BOX('[data-y105="lock"]');r.lock=L;r.lockVis=!!L&&L.t>=0&&L.b<=innerHeight&&L.w>0;r.tabLock=!!q('#mgrPane .y105tab [data-y105="lock"]');r.same=!!q('#mgrPane .roomhd [data-y105="same"]');
  r.hrsChip=!!q('#mgrPane .roomhd .hc105 .hc105n')&&parseInt(q('#mgrPane .roomhd .hc105 .hc105n').textContent,10)===thLeft(W_());r.face=!!hd.querySelector('.rm100rd');
  r.yard=BOX(BAN).h;r.who=BOX('#mgrPane .y105who');r.time=BOX('#mgrPane .y105time');r.int=BOX('#mgrPane .y105int');r.dt=BOX('#mgrPane .y105drill');r.band=BOX('#mgrPane .y105dtop');r.whod=BOX('#mgrPane .y105whod');
  r.B=BAND();r.dtEmpty=BOX('#mgrPane .y105dt').r-TXR('#mgrPane .y105dt');
  {const e=q('#mgrPane .y105who .y105cap'),m=q('#mgrPane .cp105ts .y105mini');r.eyeOne=!!e&&e.getBoundingClientRect().height<=18;r.miniOne=!!m&&m.getBoundingClientRect().height<=32}
  r.arrows=qa('#mgrPane .y105drill [data-y105^="dr|"]').length;r.chips=qa('#mgrPane .y105whod .y105chip').length;r.drillCard=!!q('#mgrPane .y105dt[data-y105k]');
  return r},BAN);
console.log('YARD',JSON.stringify(y));
ok(y.slim&&y.face,'Yard banner = the slim banner with the Doctore face');ok(y.lockInBan&&y.lockN===1&&!y.tabLock&&y.same,'Lock in moved into the banner (one button), ↻ Same as last week beside it (392: the Tabula is gone)');
ok(y.lockVis,'Lock in visible without scrolling '+JSON.stringify(y.lock));ok(y.hrsChip,'the hours chip (.hc105 .hc105n, 392) shows the hours left');
ok(y.band.b-y.int.b<=30,'no empty strip under Intensity (band bottom '+y.band.b+', Intensity bottom '+y.int.b+')');
const tops=[y.who.t,y.time.t,y.int.t];ok(Math.max(...tops)-Math.min(...tops)<=8&&y.who.l<y.time.l&&y.time.l<y.int.l,'Doctore / Time / Intensity share one band '+JSON.stringify(tops));
ok(Math.abs(y.dt.t-y.whod.t)<=8&&y.dt.r<=y.whod.l+2,'Team drill card + Who-drills chips share one row '+y.dt.t+'/'+y.whod.t);ok(y.arrows===2&&y.chips>=3&&y.drillCard,'drill card keeps ‹ › and the chips');ok(y.dtEmpty<=30,'Team drill card sized to its content (empty right '+y.dtEmpty+')');
ok(y.who.h<=84&&y.who.w>=226&&y.eyeOne&&y.miniOne,'1440 px: the Doctore column is short (eyebrow one line, '+y.who.w+'x'+y.who.h+'), the Study chip one line');
ok(y.B.segs.length===4&&y.B.segs.every(x=>x.w>=88&&x.h<=46&&!x.ov),'Intensity buttons ≥ 88 px wide, short, labels not clipped '+JSON.stringify(y.B.segs));
const bn=await ev(pg,async BAN=>{const q=s=>document.querySelector(s);const r={};
  await TAB('armory');{const hd=q(BAN),hc=hd&&hd.querySelector('.roomstat.cp105hurt'),pm=me(),hu=rosterOf(pm).filter(g=>g.inj);
    r.arm3={chip:!!hc,n:hc?+hc.querySelector('.ptbox').textContent:-1,hurt:hu.length,names:!!hc&&hu.every(g=>(hc.dataset.tip||'').includes(g.name))&&!hc.title,
      head:[...document.querySelectorAll('#mgrPane h4.secth')].some(e=>/Your Armory/.test(e.textContent)),line:!!document.querySelector('#mgrPane .ar95hurt'),first:((hd.querySelector('.roomstat .ptbox')||{}).parentNode||{}).classList+''}}
  for(const t of ['infirm','roster','armory','recruit']){await TAB(t);const hd=q(BAN);const st=hd&&hd.querySelector('.roomstat');r[t]={two:!!st&&!!st.title&&!!(st.dataset.tip||st.getAttribute('data-tt')),ttl:((hd&&hd.querySelector('.roomttl b'))||{}).textContent||'',h:BOX(BAN).h,slim:!!hd&&hd.classList.contains('cp105ban'),face:!!hd&&!!hd.querySelector('.rm100rd'),stat:((hd&&hd.querySelector('.roomstat, .hc105'))||{}).textContent||'',old:!!(hd&&hd.querySelector('.rc1banf'))}}
  return r},BAN);
console.log('BANNERS',JSON.stringify(bn));
for(const t of ['armory','recruit'])ok(bn[t].slim&&bn[t].face&&!bn[t].old&&/\d/.test(bn[t].stat),t+': slim banner, face at left, the counter as a chip');
ok(bn.arm3.chip&&bn.arm3.n===bn.arm3.hurt&&bn.arm3.n>0&&bn.arm3.names&&!bn.arm3.head&&!bn.arm3.line&&!/cp105hurt/.test(bn.arm3.first),'Armory: no "Your Armory" heading under the banner, the hurt count is a banner chip (after the shelf chip, names in its data-tip) '+JSON.stringify(bn.arm3));
ok(!bn.recruit.two&&!bn.armory.two,'the counter chips do not carry two tooltips (title + data-tip)');ok(!/\u{1F6E1}/u.test(bn.armory.ttl),'Armory: the 🛡 medallion is not repeated in the title '+bn.armory.ttl);
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

/* ---- 2000x1150 (his screen): no gap between Time and Intensity, with and without the Doctore's time ---- */
const pw=await open(2000,1150);
const wd=await ev(pw,async()=>{const r={};await TAB('practice');r.a=BAND();const P=thPlan(W_());const keep=P.doc;P.doc=Math.min(3,thMax());await TAB('practice');r.b=BAND();P.doc=keep;await TAB('practice');return r});
console.log('WIDE',JSON.stringify(wd));
for(const [n,B] of [['0 h',wd.a],['3 h',wd.b]]){ok(B.int.l-B.tc<=40&&B.int.l>B.time.l,'2000 px '+n+': Intensity starts right after the Time content (gap '+(B.int.l-B.tc)+')');
  ok(B.segs.every(x=>x.w>=88&&!x.ov),'2000 px '+n+': Intensity buttons wide, not clipped');ok(B.band.b-B.int.b<=30&&B.band.b-B.who.b<=40,'2000 px '+n+': no empty strip under Intensity / the Doctore')}
await pw.close();

/* ---- 1280x800 (a laptop): still one band, no block left alone ---- */
const pl=await open(1280,800);
const lp=await ev(pl,async()=>{await TAB('practice');return BAND()});
console.log('LAPTOP',JSON.stringify(lp));
{const three=Math.abs(lp.int.t-lp.time.t)<=8&&lp.time.l<lp.int.l,two=lp.int.l<=lp.who.l+2&&lp.int.t>lp.who.t&&lp.time.l>=lp.int.r&&lp.time.t<=lp.who.t+8;
  ok(three||two,'1280 px: Doctore / Time / Intensity in one band (three columns, or Doctore over Intensity with Time beside both)');ok(lp.band.b-lp.int.b<=30&&lp.band.b-lp.time.b<=60,'1280 px: no large empty block in the band '+JSON.stringify([lp.band.b,lp.int.b,lp.time.b]));
  ok(lp.segs.every(x=>x.w>=88&&!x.ov),'1280 px: Intensity buttons wide, not clipped')}
await pl.close();

/* ---- German at 1440: long labels fit, the band stays compact ---- */
const pd=await open(1440,900,false,'de');
const de=await ev(pd,async BAN=>{const r={};const P=thPlan(W_());const keep=P.doc;P.doc=Math.min(3,thMax());await TAB('practice');r.B=BAND();P.doc=keep;await TAB('practice');r.hs=HSCROLL();r.lock=BOX('[data-y105="lock"]');
  for(const t of ['armory','recruit']){await TAB(t);const hd=document.querySelector(BAN),st=hd&&hd.querySelector('.roomstat, .hc105');r[t]=!!st&&st.scrollWidth<=st.clientWidth+1}return r},BAN);
console.log('DE',JSON.stringify(de));
ok(de.B.segs.every(x=>x.w>=88&&!x.ov),'de 1440: Intensity labels not clipped '+JSON.stringify(de.B.segs));ok(de.B.band.b-de.B.int.b<=60,'de 1440 (3 h with him): no large empty strip under Intensity ('+(de.B.band.b-de.B.int.b)+')');
ok(!de.hs&&de.lock&&de.lock.b<=900&&de.armory&&de.recruit,'de 1440: no sideways scroll, Lock in visible, the chips do not overflow');
await pd.close();

/* ---- 390x844 ---- */
const ph=await open(390,844);
const p=await ev(ph,async BAN=>{const r={};for(const t of ['practice','armory','recruit']){await TAB(t);r[t]={hs:HSCROLL(),h:BOX(BAN).h}}
  await TAB('armory');const ah=document.querySelector(BAN),pb=ah&&ah.querySelector('.roomstat .ptbox');r.armUnit=!!pb&&/\u{1F6E1}|1F6E1/u.test(getComputedStyle(pb,'::after').content);
  await TAB('practice');const L=BOX('[data-y105="lock"]');r.lock=L;r.vis=!!L&&L.t>=0&&L.b<=innerHeight&&L.w>0;r.inBan=!!document.querySelector('#mgrPane .roomhd [data-y105="lock"]');return r},BAN);
console.log('PHONE',JSON.stringify(p));
for(const t of ['practice','armory','recruit'])ok(!p[t].hs,'390 px '+t+': no sideways scroll');
for(const t of ['armory','recruit'])ok(p[t].h<=70,'390 px '+t+': the banner stays one row ('+p[t].h+' px)');ok(p.armUnit,'390 px: the Armory number keeps a unit (🛡)');ok(p.vis&&p.inBan,'390 px: Lock in in the banner, in the first screen '+JSON.stringify(p.lock));
await shot(ph,'tv105z-390');await ph.close();

/* ---- kill switch ---- */
const pk=await open(1440,900,true);
const k=await ev(pk,async BAN=>{const q=s=>document.querySelector(s);const r={};await TAB('practice');
  r.plate=!!q('#mgrPane .roomhd .y105hrs');r.noSlim=!q('.cp105ban')&&!q('#mgrPane .y105.cp105');r.tabLock=!!q('#mgrPane .y105tab [data-y105="lock"]');r.banLock=!!q('#mgrPane .roomhd [data-y105="lock"]');
  await TAB('armory');r.arm=BOX(BAN).h;r.armSlim=!!q('.cp105ban');r.armHead=[...document.querySelectorAll('#mgrPane h4.secth')].some(e=>/Your Armory/.test(e.textContent))&&!!q('#mgrPane .ar95hurt')&&!q('.cp105hurt');await TAB('recruit');r.rec=BOX(BAN).h;r.recFace=!!q('.roomhd .rc1banf');return r},BAN);
console.log('OFF',JSON.stringify(k));
ok(k.plate&&k.noSlim&&k.tabLock&&!k.banLock&&!k.armSlim&&k.arm>100&&k.rec>100&&k.recFace&&k.armHead,'kill switch: the old layout (Lock in in the Tabula, tall Armory / Recruiting banners)');
await pk.close();
console.log('MISSING',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

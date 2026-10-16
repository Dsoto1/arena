/* tv105d — v1.05 x1a (363-v105renown): the lanista's perk points come from ONE Renown bar · renown from at least two sources (a win, a kept pledge,
   improving fighters, a Superbus round, a good signing) · a level-up pays 1 perk point at once · the free weekly point is gone (an endWeek with no
   earnings adds no point) · the bar renders on the Lanista perk card with the season's sources · an existing career keeps its points and starts at 0 ·
   kill switch flavius_v105doff=1 restores the old grants (week +1, win +1, no bar) · no new errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105doff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=5000;w.train='off';w.tplan=null;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    window.WK=async()=>{const w=W_();for(const g of rosterOf(me())){g.inj=null;g.contract.weeks=Math.max(g.contract.weeks,30)}
      for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k);
      let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];try{if(P.t==='thumb')settlePending(0,null,{d6:6,d12:12});else if(P.t==='blood')settlePending(0,'let');else settlePending(0,'stay')}catch(e){w.pend.shift()}}
      const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let rr;try{rr=await endWeek()}finally{clearInterval(hold)}await W8(150);return rr}});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);

/* ---------- on: sources, levels, no weekly point, the bar ---------- */
{const pg=await open(false);
  const r=await ev(pg,async()=>{const pm=me(),w=W_();const o={};o.has=typeof renown105==='function'&&!V105D.off;
    pm.perkPts=3;pm.perkPend=0;delete pm.renown;
    o.p0=pm.perkPts;o.l0=renOf105(pm).lv;
    perkGain105(pm,'week');o.weekNone=(pm.perkPend||0)===0&&pm.perkPts===3&&renOf105(pm).xp===0;
    perkGain105(pm,'win');perkGain105(pm,'pledge');o.two=!!(renOf105(pm).src.win&&renOf105(pm).src.pledge);o.xp=renOf105(pm).xp+renOf105(pm).lv*REN105.cost(0);
    o.noPend=(pm.perkPend||0)===0;
    const before=pm.perkPts;const lv=renOf105(pm).lv;const need=REN105.cost(lv)-renOf105(pm).xp;renown105(pm,'train',need);o.lvUp=renOf105(pm).lv===lv+1&&pm.perkPts===before+1;
    o.news=(w.news[0]&&/Renown/.test(w.news[0].text))||false;
    renown105(pm,'sign');renown105(pm,'po');const S=renOf105(pm).src;o.srcs=Object.keys(S).sort().join(',');
    /* a rival's grant is not the player's */
    const riv=w.mgrs.find(m=>!m.isPlayer);const r0=riv.perkPend||0;perkGain105(riv,'win');o.rival=(riv.perkPend||0)===r0+1&&!riv.renown;
    /* the bar */
    MGR.tab='me';MGR.view=null;MGR_REDRAW();await W8(700);const bar=document.querySelector('#ren105');
    o.bar=!!bar;o.barTxt=bar?bar.textContent.replace(/\s+/g,' ').slice(0,200):'';o.prog=!!(bar&&bar.querySelector('[role=progressbar]'));o.noOld=!/Points come each week/.test(document.querySelector('#schoolCard')?document.querySelector('#schoolCard').textContent:'');
    /* the week: no free point */
    pm.perkPts=0;pm.perkPend=0;const xpw=renOf105(pm).xp+renOf105(pm).lv*100;for(const g of rosterOf(pm))g.contract.weeks=30;
    const lvw=renOf105(pm).lv;await WK();o.weekPts=pm.perkPts;o.weekLv=renOf105(pm).lv-lvw;
    return o});
  console.log('ON',JSON.stringify(r));
  ok(r.has,'module on');ok(r.l0===0&&r.p0===3,'new bar starts at 0, points kept');ok(r.weekNone,'week grants nothing');ok(r.two&&r.noPend,'win + pledge become renown, not pend');ok(r.lvUp,'level-up pays 1 point');ok(r.news,'level-up news');
  ok(/pod|po|sign/.test(r.srcs)&&r.srcs.includes('sign')&&r.srcs.includes('po')&&r.srcs.includes('win'),'sources listed: '+r.srcs);ok(r.rival,'rivals keep old grant');
  ok(r.bar&&r.prog&&/Renown/.test(r.barTxt)&&/This season/.test(r.barTxt)&&/Wins/.test(r.barTxt),'the bar renders with sources: '+r.barTxt);ok(r.noOld,'old weekly text replaced');
  ok(r.weekPts===r.weekLv,'no free weekly point (points = renown levels earned that week): '+r.weekPts+' vs '+r.weekLv);await pg.close()}

/* ---------- off: the old grants ---------- */
{const pg=await open(true);
  const r=await ev(pg,async()=>{const pm=me();const o={};o.off=!!V105D.off;pm.perkPts=0;pm.perkPend=0;
    perkGain105(pm,'week');perkGain105(pm,'win');o.pend=pm.perkPend;o.noRen=!pm.renown;
    MGR.tab='me';MGR.view=null;MGR_REDRAW();await W8(700);o.bar=!!document.querySelector('#ren105');o.old=/Points come each week/.test(document.querySelector('#schoolCard')?document.querySelector('#schoolCard').textContent:'');
    pm.perkPend=0;pm.perkPts=0;await WK();o.weekPts=pm.perkPts;return o});
  console.log('OFF',JSON.stringify(r));
  ok(r.off&&r.pend===2&&r.noRen,'kill switch: week + win grant +1 each');ok(!r.bar&&r.old,'kill switch: no bar, old text');ok(r.weekPts>=1,'kill switch: the week pays its point: '+r.weekPts);await pg.close()}

console.log('ERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));await b.close();process.exit(errs.length||miss.length?1:0)})();

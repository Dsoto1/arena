/* tv115b — v1.15b STRONGER SMALL HOUSES (432-v115bstr, his 1a 2a 3a; study F13 = F1 + F3) on a seeded Manager world:
   F1 TIERS.under.hi is 54; rival entries in the Undercard of freshly drawn cards are rated <= 56 (T.hi+2); the player's entry checks
      (319 r101WhyNot, 296 any100Why) take a 60 and refuse a 61; the depth chart's Bout I slot says "≤ 54";
   F3 one real week's end pays the player's patron round(22 + 0.6 × fame) (413 ledger 'patron' + the "Your patron: +N coin" line);
      the rivals' stipend stays 22 + 0.6 × fame (E112.riv, 23 aiLanistaWeek untouched);
   kill switch flavius_v115bstroff=1: 62 and 10 + 0.3 × fame (the player's 61 is accepted again, the label says "≤ 62").
   node tools/tests/tv115b.js <ABSOLUTE page path> -> ERRS [] and exit 0. */
const {chromium}=require('playwright');const T=require('./_wait');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async(ls)=>{const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\.g/,r=>r.abort());
  pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await T.boot(pg,{seed:1,ls:ls||{}});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=3000;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.severed=[];g.contract.since=0;g.contract.weeks=Math.max(g.contract.weeks,6);g.morale=80;delete g.loanFrom}
    menuHide();openManager('roster');await W8(900);MGR.view=null;window.C_MARK=typeof ERR92!=='undefined'?ERR92.n:0;
    window.__WK=async()=>{const w=W_();if(w.special&&!w.special.done&&typeof specAutoRun==='function')await specAutoRun();
      try{const t=typeof travelState==='function'?travelState(w):null;if(t&&!t.paid&&t.cost>0)travelClick('travelpay');const t2=travelState(w);if(t2&&t2.paid){if(typeof mw105Go==='function')mw105Go(w);else w.night.travel.gone=true}}catch(e){console.error(e)}
      if(w.night&&!w.night.bye)for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k);w.pend=[];
      const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let r;try{r=await endWeek()}finally{clearInterval(hold)}await W8(300);return r}});
  return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));await b.close();process.exit(1)}};
/* the shared probe: band, entries, entry checks, label, one week's patron */
const probe=pg=>ev(pg,async()=>{const r={};const w=W_(),pm=me();
  r.hi=TIERS.under.hi;r.featLo=TIERS.feature.lo;r.pat=[E112.pat.base,E112.pat.fame];r.riv=[E112.riv.base,E112.riv.fame];
  r.aiSrc=String(aiLanistaWeek).length+':'+String(aiLanistaWeek).slice(0,400); /* the same wrapper chain on and off = 432 never touches the rivals' week */
  /* the player's entry checks on the Undercard (the card as drawn) */
  const ub=w.night.bouts.find(x=>x.tier==='under');const g=rosterOf(pm).find(x=>!w.night.bouts.some(bb=>bb.ents.includes(x.id)))||rosterOf(pm)[0];
  const cur=w.night.bouts.find(bb=>bb.ents.includes(g.id));if(cur){const nf=genGlad({ovr:50});w.glads.push(nf);cur.ents[cur.ents.indexOf(g.id)]=nf.id}
  const keep={ovr:g.ovr,stats:g.stats?JSON.parse(JSON.stringify(g.stats)):null,inj:g.inj,sev:g.severed,rest:g.restWk,mor:g.morale};g.inj=null;g.severed=[];delete g.restWk;g.morale=80;
  const setR=v=>{for(let i=0;i<40&&effOvr(g)!==v;i++)g.ovr+=v-effOvr(g)};
  setR(60);r.at=effOvr(g);r.why60=r101WhyNot(w,ub,g);r.any60=any100Why(w,ub,g);
  setR(61);r.at2=effOvr(g);r.why61=r101WhyNot(w,ub,g);r.any61=any100Why(w,ub,g);
  Object.assign(g,{ovr:keep.ovr,inj:keep.inj,severed:keep.sev,morale:keep.mor});if(keep.rest!=null)g.restWk=keep.rest;
  /* 229's slot label */
  const h=st95ChartHTML(pm,w);const m1=h.match(/data-slot95="1"[\s\S]*?<span class="rc-sub">([^<]*)<\/span>/);r.label=m1?m1[1]:'';
  /* one real week's end: the patron */
  const L0=(w.led109&&w.led109.c&&w.led109.c.patron)||{i:0};const i0=L0.i||0;let fame=null;
  {const bE=endWeek;endWeek=async function(){fame=me().fame||0;return bE.apply(this,arguments)};try{r.ended=await __WK()}finally{endWeek=bE}}
  r.fame=fame;const P=(w.led109&&w.led109.c&&w.led109.c.patron)||{i:0};r.booked=P.i-i0;
  r.news=(w.tlog||[]).filter(x=>/Your patron/.test(x.text)).map(x=>x.text).slice(-1)[0]||'';
  /* rival entries in the Undercard over freshly drawn cards: lift some rival fighters into 55–62 so the band matters */
  const R=w.mgrs.filter(m=>!m.isPlayer&&!m.dead);let k=0;for(const m of R)for(const q of rosterOf(m)){if(k%3===0){q.ovr=56+(k%7);q.inj=null;q.severed=[];q.morale=80}k++}
  r.rivUnder=[];for(let n=0;n<8;n++){w.pend=[];makeNight();const u=w.night.bouts.find(x=>x.tier==='under');if(!u)continue;
    for(const id of u.ents){const q=gById(id);const m=q&&q.contract?mgrById(q.contract.mgr):null;if(m&&!m.isPlayer)r.rivUnder.push(effOvr(q))}}
  r.errs=typeof errNew92==='function'?errNew92(window.C_MARK).map(e=>e.kind+':'+e.msg):[];return r});

const pg=await open();const o=await probe(pg);out.on=o;
ok(o.hi===54,'undercard hi 54 ('+o.hi+')');ok(o.featLo===56,'feature lo stays 56');
ok(o.at===60&&!o.why60&&!/outside this bout/.test(o.any60||''),'player 60 accepted: '+o.why60+' / '+o.any60);
ok(/takes up to 60$/.test(o.why61)&&!/-\d/.test(o.why61),'refusal reads "takes up to 60" (no negative range): '+o.why61);ok(o.at2===61&&/takes/.test(o.why61)&&/outside this bout/.test(o.any61||''),'player 61 refused: '+o.why61+' / '+o.any61);
ok(o.label.includes('≤ 54')&&!o.label.includes('62'),'slot label ≤ 54: '+o.label);
ok(o.ended!==false&&o.booked===Math.round(22+o.fame*0.6)&&o.booked>0,'patron 22 + 0.6 × fame: '+o.booked+' fame '+o.fame);
ok(o.news.includes('+'+o.booked+' coin'),'ledger line shows the new amount: '+o.news);
ok(o.pat[0]===22&&o.pat[1]===0.6,'E112.pat 22/0.6');ok(o.riv[0]===22&&o.riv[1]===0.6,'rivals floor stipend 22/0.6');
ok(o.rivUnder.length>0&&Math.max(...o.rivUnder)<=56,'rival Undercard entries ≤ 56: '+JSON.stringify(o.rivUnder));
ok(!o.errs.length,'no new 00c errors '+JSON.stringify(o.errs));
await pg.close();

/* the kill switch: v1.15a exactly */
const pk=await open({flavius_v115bstroff:'1'});const f=await probe(pk);out.off=f;
ok(f.hi===62,'off: hi 62');ok(f.at2===61&&!f.why61,'off: 61 accepted');ok(f.label.includes('≤ 62'),'off: label ≤ 62 '+f.label);
ok(f.pat[0]===10&&f.pat[1]===0.3,'off: E112.pat 10/0.3');ok(f.riv[0]===22&&f.riv[1]===0.6&&f.aiSrc===o.aiSrc,'rivals stipend unchanged (same aiLanistaWeek on and off)');
ok(f.ended!==false&&f.booked===Math.round(10+f.fame*0.3),'off: patron 10 + 0.3 × fame: '+f.booked+' fame '+f.fame);
ok(f.rivUnder.length>0&&Math.max(...f.rivUnder)<=64,'off: rival Undercard entries ≤ 64 '+JSON.stringify(f.rivUnder));
await pk.close();
console.log(JSON.stringify(out));console.log(miss.length?'MISS '+JSON.stringify(miss):'ALL OK');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

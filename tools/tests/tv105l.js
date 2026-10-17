/* tv105l — v1.05 375-v105mgr: B46 the Golden Eagle is in AT MOST ONE Match Week bout a week (some weeks none; Manager only), the Match Week card shows the
   chip only on that bout; B48 the Infirmary ward has no build/buy button (the Valetudinarium plate is a "Build it in My Ludus" link that opens My Ludus'
   Upgrade School); kill switch flavius_v105mgroff=1 restores both. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const open=async off=>{const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105mgroff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});return pg};
const mgr=async pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=9000;w.train='off';w.tplan=null;w.pend=[];
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    window.W8=W8;window.ENS=async()=>{const el=document.querySelector('#mgrBody');if(!el||!el.offsetParent){menuHide();openManager(MGR.tab||'ludus');await W8(900)}};
    window.NIGHT=async()=>{await ENS();MGR.tab='night';MGR.confirmEnd=false;MGR_REDRAW();await W8(700)};
    window.SIMS=async()=>{const w=W_();for(let k=0;k<w.night.bouts.length;k++)if(!w.night.bouts[k].done)await runBoutSim(k)};
    window.PW=async()=>{const w=W_(),pm=me();for(const g of rosterOf(pm)){g.inj=null;g.contract.weeks=Math.max(g.contract.weeks,30)}
      if(w.special&&!w.special.done)await specAutoRun();await SIMS();
      let guard=0;while((w.pend||[]).length&&guard++<30){const P=w.pend[0];try{if(P.t==='thumb')settlePending(0,null,{d6:6,d12:12});else if(P.t==='blood')settlePending(0,'let');else if(P.t==='levy')settlePending(0,'march');else settlePending(0,'stay')}catch(e){w.pend.shift()}}
      const hold=setInterval(()=>{if(CUR_MODAL)CUR_MODAL.done(null)},150);let rr;try{rr=await endWeek()}finally{clearInterval(hold)}await W8(150);return rr};
    menuHide();openManager('ludus');await W8(600);MGR.view=null});
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,500));await b.close();process.exit(1)}};

/* ---- B46: 12 weeks ---- */
let pg=await open(false);await mgr(pg);
out.weeks=[];
for(let i=0;i<12;i++){
  const r=await ev(pg,async()=>{const w=W_();const n=w.night;const bouts=n&&n.bouts||[];
    const flags=bouts.map(x=>{const c=boutCfg(x,false);return !!c.opts.eaglePot});
    await NIGHT();const chips=document.querySelectorAll('#mgrBody .bouttitle .eg99').length;
    return {wk:w.week,n:bouts.length,flags,pick:eg105Pick(w),chips}});
  out.weeks.push(r);
  await ev(pg,async()=>{try{await PW()}catch(e){}});
}
const cnt=out.weeks.map(r=>r.flags.filter(Boolean).length);
ok(cnt.every(c=>c<=1),'at most one Eagle bout a week '+JSON.stringify(cnt));
ok(cnt.some(c=>c===0),'some week has none '+JSON.stringify(cnt));
ok(cnt.some(c=>c===1),'some week has one '+JSON.stringify(cnt));
ok(out.weeks.every(r=>r.chips===(r.flags.some(Boolean)?1:0)),'the chip only on the Eagle bout '+JSON.stringify(out.weeks.map(r=>[r.flags,r.chips])));
ok(out.weeks.every(r=>r.flags.every((f,i)=>f===(r.pick===i))),'flags follow eg105Pick');
const det=await ev(pg,()=>{const w=W_();return eg105Pick(w)===eg105Pick(w)&&eg105Pick(w)===eg105Pick(w)});ok(det,'deterministic');

await pg.close();pg=await open(false);await mgr(pg);
/* ---- B48: the ward ---- */
out.ward=await ev(pg,async()=>{const pm=me(),w=W_();const g=rosterOf(pm)[0];await ENS();MGR.tab='infirm';MGR.inf90=g.id;MGR.w104for=g.id;MGR.w104t='ward';MGR_REDRAW();await W8(600);
  const body=document.querySelector('#mgrBody');const q=s=>body.querySelectorAll(s).length;
  const r={build:q('[data-mg="build"]'),link:q('[data-b105]'),valet:facLvl(pm,'valet'),plates:q('.b105pl'),txt:/Build it in My Ludus/.test(body.textContent)};
  const lk=body.querySelector('[data-b105]');if(lk){lk.click();await W8(700);r.after={tab:MGR.tab,fac:LU102.fac,pop:!!document.querySelector('#mgrPane .lu102fac')}}
  return r});
ok(out.ward.build===0,'no build button in the ward '+JSON.stringify(out.ward));
ok(out.ward.link>=1&&out.ward.plates===1&&out.ward.txt,'the link is there');
ok(out.ward.after&&out.ward.after.tab==='ludus'&&out.ward.after.fac&&out.ward.after.pop,'the link opens My Ludus Upgrade School '+JSON.stringify(out.ward.after));
await pg.close();

/* ---- kill switch ---- */
pg=await open(true);await mgr(pg);
out.off=await ev(pg,async()=>{const pm=me(),w=W_();const r={eagle:w.night.bouts.map(x=>!!boutCfg(x,false).opts.eaglePot)};await NIGHT();r.chips=document.querySelectorAll('#mgrBody .bouttitle .eg99').length;
  const g=rosterOf(pm)[0];MGR.tab='infirm';MGR.inf90=g.id;MGR.w104for=g.id;MGR.w104t='ward';MGR_REDRAW();await W8(600);
  r.build=document.querySelectorAll('#mgrBody [data-mg="build"]').length;r.link=document.querySelectorAll('#mgrBody [data-b105]').length;return r});
ok(out.off.chips===out.off.eagle.length&&out.off.eagle.length>0&&out.off.eagle.every(Boolean),'kill switch: Eagle in every bout '+JSON.stringify(out.off));
ok(out.off.build>=1&&out.off.link===0,'kill switch: the ward build button is back '+JSON.stringify(out.off));
await b.close();
console.log(JSON.stringify(out.weeks.map(r=>[r.wk,r.flags.map(Number).join(''),r.chips])),JSON.stringify(out.ward),JSON.stringify(out.off));
console.log('ERRS',JSON.stringify(errs));if(miss.length)console.log('MISS',JSON.stringify(miss));
process.exit(errs.length||miss.length?1:0)})();

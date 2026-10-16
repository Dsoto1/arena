/* v1.04 B (349-v104careers): career kinds from the id (distribution), curves over 25 seasons per kind, arrival ages 18–30,
   the first-turn grace, the Form line (reads: unread / rough / fair / sure; own fighters by the Doctore's level), retirement at the
   season turn (+ the great's council seat), fame scaled by win rate + the losing-season drift, one advisor level a season. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e.message)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const mark=await pg.evaluate(()=>ERR92.n);
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  window.mToast=()=>{};newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();const o={};
  /* 1 · distribution */
  const cnt={};const N=30000;for(let i=0;i<N;i++){const k=c104Kind({id:'tvk'+i}).k;cnt[k]=(cnt[k]||0)+1}for(const k in cnt)cnt[k]=cnt[k]/N;o.dist=cnt;
  o.det=c104Kind({id:'abc'}).k===c104Kind({id:'abc'}).k&&c104Kind({id:'abc'}).ps===c104Kind({id:'abc'}).ps;
  let late=0;for(let i=0;i<4000;i++)if(c104Kind({id:'tvl'+i}).late)late++;o.late=late/4000;
  /* 2 · arrival ages */
  const ages=[];for(let i=0;i<400;i++){const g=genGlad({rookie:i%3===0});ages.push(g.age)}o.ageMin=Math.min(...ages);o.ageMax=Math.max(...ages);
  /* 3 · curves over 25 seasons per kind (no retirement, ages +1 a turn) */
  const keep=w.glads;const ret0=C104.ret.max;C104.ret.max=0;o.curves={};
  for(const kind of ['meteor','blazer','common','steady','ageless']){let i=0,id;do{id='tvc_'+kind+'_'+(i++)}while(c104Kind({id}).k!==kind||c104Kind({id}).late);
    const g=genGlad({age:18,ovr:62});g.id=id;delete g.stats;delete g.st0;gStats(g);g.contract=null;w.glads=[g];const C=c104Kind(g);
    const row=[];c104Turn(w,null); /* first turn: curve only */row.push(effOvr(g));
    for(let s=0;s<25;s++){g.age++;c104Turn(w,null);row.push(effOvr(g))}
    const peak=Math.max(...row);const pi=row.indexOf(peak);o.curves[kind]={row,ps:C.ps,pl:C.pl,peak,start:row[0],end:row[row.length-1],pi}}
  C104.ret.max=ret0;w.glads=keep;
  /* 4 · grace: a fighter first seen is not touched */
  {const g=genGlad({age:40,ovr:60});g.contract=null;const s0=JSON.stringify(gStats(g));w.glads=[g];c104Turn(w,null);o.grace=JSON.stringify(gStats(g))===s0&&g.alive&&!!g.c104;w.glads=keep}
  /* 5 · the Form line */
  {const fa=freeAgents()[0];const K=rec98K(fa);K.p={};let h=detailHTML(fa);o.unread=/data-c104form="unread"/.test(h);
    for(const k of STAT_KEYS)K.p[k]=1;h=detailHTML(fa);o.rough=/data-c104read="1"/.test(h)&&/Form:/.test(h);
    for(const k of STAT_KEYS)K.p[k]=2;h=detailHTML(fa);o.fair=/data-c104read="2"/.test(h);
    for(const k of STAT_KEYS)K.p[k]=3;h=detailHTML(fa);const nm=C104_NAME()[c104Kind(fa).k];o.sure=/data-c104read="3"/.test(h)&&h.includes(nm);
    /* rough read words */
    let met=0;do{met++}while(c104Kind({id:'tvr'+met}).k!=='steady');o.longTxt=c104FormHTML({id:'tvr'+met,age:20},1).includes('long career')&&!c104FormHTML({id:'tvr'+met,age:20},1).includes('Steady');
    let bz=0;do{bz++}while(c104Kind({id:'tvb'+bz}).k!=='blazer');o.brightTxt=c104FormHTML({id:'tvb'+bz,age:20},1).includes('short, bright career');
    const mine=rosterOf(pm)[0];const doc=council83(w).find(a=>a.k==='doctore');doc.lv=1;o.own1=/data-c104read="1"/.test(detailHTML(mine));doc.lv=5;o.own5=/data-c104read="3"/.test(detailHTML(mine));doc.lv=1}
  /* 6 · retirement at the turn: old, faded, low */
  {const olds=[];for(let i=0;i<30;i++){const g=genGlad({age:39,ovr:45});g.contract=null;olds.push(g)}
    const mine=rosterOf(pm)[0];mine.age=40;mine.ovr=60;mine.imm88=1;mine.loanFrom=null;
    w.glads=[...olds,mine];c104Turn(w,null);o.firstRet=olds.filter(g=>!g.alive).length+(mine.alive?0:1);
    for(let t=0;t<4;t++){for(const g of olds)if(g.alive)g.age++;if(mine.alive)mine.age++;c104Turn(w,null)}const rev=w.c104rev;
    o.retired=olds.filter(g=>!g.alive&&g.rt104).length;o.mineRet=!mine.alive&&!!mine.rt104&&!mine.contract;
    o.letter=(w.letters||[]).some(L=>L.key==='c104ret-'+mine.id);const adv=(w.letters||[]).find(L=>L.key==='c104adv-'+mine.id);o.advLetter=!!adv&&/data-c104adv/.test(adv.body);
    o.great=Object.keys(w.c104adv||{}).includes(mine.id);o.news=w.news.some(n=>/retires/.test(n.text));o.revOk=!!rev&&Array.isArray(rev.ret);
    /* take him as Barracks master */
    const a=c104Seat(w,mine.id,'barracks');o.seat=!!a&&a.name===mine.name&&a.lv===3&&adv98Lv(w,'barracks')===3;w.glads=keep}
  /* 7 · fame: gain scaled by win rate, a losing season drifts down */
  {for(const x of w.mgrs){const S0=msp(x);S0.b=10;S0.w=3}const m=w.mgrs.find(x=>!x.isPlayer);const S=msp(m);S.b=10;S.w=0;o.kLow=c104FameK(m);S.w=9;o.kHigh=c104FameK(m);S.w=0;m.fame=50;const g0=w.glads;w.glads=[];c104Turn(w,null);o.drift=50-m.fame;w.glads=g0;
    const m2=w.mgrs.find(x=>!x.isPlayer&&x!==m);const S2=msp(m2);S2.b=10;S2.w=4;m2.fame=40;w.glads=[];c104Turn(w,null);o.noDrift=m2.fame===40;w.glads=g0}
  /* 8 · advisor pace */
  {pm.coin=5000;const rc=council83(w).find(a=>a.k==='clerk');rc.lv=1;delete w.adv104;const u1=adv98Up('clerk');rc.lv=2;
    const req=adv98Req(w,pm,'clerk',3);o.paceReq=req.some(x=>x[1]===0&&x[2]===1);o.up1=u1.ok;
    w.season++;const req2=adv98Req(w,pm,'clerk',3);o.paceNext=!req2.some(x=>x[0]==='next season');w.season--}
  return o});
const d=r.dist;ok(d.meteor>0.006&&d.meteor<0.014,'Meteor ~1/100 '+d.meteor);ok(d.blazer>0.09&&d.blazer<0.11,'Blazer ~1/10 '+d.blazer);ok(d.steady>0.09&&d.steady<0.11,'Steady ~1/10 '+d.steady);
ok(d.ageless>0.003&&d.ageless<0.011,'Ageless ~1/150 '+d.ageless);ok(d.common>0.74&&d.common<0.82,'Common ~3/4 '+d.common);ok(r.det,'deterministic from the id');ok(r.late>0.08&&r.late<0.16,'late bloomers ~1 in 8 '+r.late);
ok(r.ageMin>=18&&r.ageMax<=30,'arrivals 18-30 '+r.ageMin+'-'+r.ageMax);
const C=r.curves;for(const k in C){const c=C[k];ok(c.peak>c.start,k+' rises to a peak '+JSON.stringify(c.row))}
ok(C.meteor.peak>C.common.peak&&C.meteor.row[C.meteor.pi]-C.meteor.row[C.meteor.pi-1]>=6,'Meteor blooms (+~8) above Common '+C.meteor.peak+' vs '+C.common.peak);ok(C.blazer.peak>C.common.peak,'Blazer peaks above Common');
const drop=(c,n)=>c.peak-c.row[Math.min(c.row.length-1,c.pi+n)];ok(drop(C.meteor,6)>drop(C.common,6),'Meteor fades faster than Common '+drop(C.meteor,6)+' vs '+drop(C.common,6));
ok(drop(C.steady,6)<drop(C.common,6)+1,'Steady fades slower');ok(C.ageless.end>=C.ageless.peak-3,'Ageless still near the peak after 25 seasons '+JSON.stringify(C.ageless.row));
ok(C.common.end<C.common.peak-5,'Common has faded after 25 seasons');
ok(r.grace,'first sight = curve only, no fade');
ok(r.unread&&r.rough&&r.fair&&r.sure,'Form reads unread/rough/fair/sure '+JSON.stringify([r.unread,r.rough,r.fair,r.sure]));ok(r.longTxt&&r.brightTxt,'rough read words');ok(r.own1&&r.own5,'own fighters by the Doctore level');
ok(r.firstRet===0,'nobody retires on first sight');ok(r.retired>=22,'old faded fighters retire '+r.retired);ok(r.mineRet&&r.letter&&r.advLetter&&r.great&&r.news&&r.revOk,'my great retires with letters '+JSON.stringify(r));ok(r.seat,'great takes the council seat at level 3');
ok(r.kLow<0.8&&r.kHigh>1.2,'fame factor by win rate '+r.kLow+' '+r.kHigh);ok(r.drift>=4,'losing season drifts down '+r.drift);ok(r.noDrift,'a winning season does not drift');
ok(r.up1&&r.paceReq&&r.paceNext,'one advisor level a season '+JSON.stringify([r.up1,r.paceReq,r.paceNext]));
const ne=await pg.evaluate(m=>ERR92.n-m,mark);ok(ne===0,'no new errors in the log '+ne);
console.log(JSON.stringify(Object.fromEntries(Object.entries(C).map(([k,c])=>[k,c.row.join(',')]))));
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS','ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

/* tv105b — v1.05 workstream B, "Your read" (361-v105read): the Match Week column is "Your read" (not "Your scouts") with a tooltip naming the
   source · yourRead105(g) = null | {est,lo,hi,rough,src} (unknown rival -> null; your own fighters exact; deterministic per week) · walking the sand
   (185 wsand90Walk) reads EVERY fighter on the card (src 'sand'), a recruiting-scouted one keeps its dossier read, a free agent on the card gets ONE
   look in Recruiting (g.sc98.l104, g.scout untouched) · a bout watched live gives the same look (src 'watched', mgrAfterWatch) · a high Recruiter =
   exact · reads age out · an old world without w.read105 works · the kill switch flavius_v105boff=1 · no new errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(off)=>{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105boff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=3000;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    if(!w.night&&typeof makeNight==='function')makeNight();MGR.tab='night';MGR_REDRAW();await W8(600)});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);

{const pg=await open(false);
  const r=await ev(pg,async()=>{const w=W_(),pm=me(),n=w.night;const out={};
    out.hasNight=!!(n&&n.bouts&&n.bouts.length);
    const th=[...document.querySelectorAll('#mgrBody table.tally th')].map(x=>x.textContent.trim());
    out.read=th.includes('Your read');out.old=th.includes('Your scouts');
    const t=[...document.querySelectorAll('#mgrBody table.tally th')].find(x=>x.textContent.trim()==='Your read');out.tip=t?t.title:'';
    const ids=[...new Set(n.bouts.flatMap(b=>b.ents))];const gs=ids.map(gById).filter(Boolean);
    const isMine=g=>g.contract&&g.contract.mgr===pm.id;
    const rival=gs.find(g=>!isMine(g)&&g.contract)||gs.find(g=>!isMine(g));rival.scout=0;
    out.mineExact=(()=>{const mg=rosterOf(pm)[0];const q=yourRead105(mg);return !!q&&q.rough===false&&q.est===effOvr(mg)&&q.lo===q.hi})();
    out.nullBefore=yourRead105(rival)===null;
    window.wsand90Why=()=>'';
    const fa=gs.find(g=>!g.contract&&g!==rival);const dossier=gs.find(g=>g!==fa&&g!==rival&&!isMine(g));
    if(fa){fa.scout=0;fa.sc98=null}
    if(dossier)dossier.scout=2;
    out.walked=wsand90Walk()!==false;
    const reads=gs.map(g=>yourRead105(g));out.all=reads.every(x=>x&&typeof x.est==='number'&&typeof x.lo==='number'&&typeof x.hi==='number'&&typeof x.rough==='boolean'&&['sand','dossier','watched'].includes(x.src));
    const q=yourRead105(rival);out.shape=q;out.sand=!!q&&q.src==='sand'&&q.rough===true&&Math.abs(q.est-effOvr(rival))<=3&&q.lo<=effOvr(rival)&&q.hi>=effOvr(rival);
    out.again=JSON.stringify(yourRead105(rival))===JSON.stringify(q);
    if(dossier){const d=yourRead105(dossier);out.dossier=!!d&&d.src==='dossier'&&d.rough===false}else out.dossier=true;
    if(fa){const K=fa.sc98;out.look=!!K&&(K.l104||[]).includes(w.week);out.noScout=!fa.scout}else{out.look=true;out.noScout=true}
    MGR_REDRAW();await W8(400);
    const tds=[...document.querySelectorAll('#mgrBody table.tally tr')].map(tr=>tr.children[4]?tr.children[4].textContent.trim():'');
    out.cells=tds.filter(x=>/\d+%/.test(x)).length>=gs.length;out.noNot=!tds.some(x=>/not scouted/.test(x));
    /* Recruiting: the gate look counts as an EARLIER look once the week turns */
    if(fa){const n0=rec104Prev(fa,w);w.week++;const n1=rec104Prev(fa,w);w.week--;out.prev=n1===n0+1}else out.prev=true;
    /* aging */
    w.week+=READ105.keep+1;out.aged=yourRead105(rival)===null;w.week-=READ105.keep+1;
    /* an old world without w.read105 */
    delete w.read105;out.old0=yourRead105(rival)===null&&!!yourRead105(rosterOf(pm)[0]);
    /* watched live */
    const bo=n.bouts[0];const was=bo.done;bo.done=true;const ents=bo.ents.map(gById).filter(Boolean);for(const g of ents){if(!isMine(g))g.scout=0}
    await mgrAfterWatch({rows:ents.map(g=>({mgrId:g.id}))},{cid:MGR.world.id,week:w.week,bout:0});bo.done=was;
    const oth=ents.filter(g=>!isMine(g));out.watched=oth.length>0&&oth.every(g=>{const x=yourRead105(g);return !!x&&x.src==='watched'&&x.rough});
    /* a high Recruiter reads exact */
    const C=council83(w);const a=C.find(x=>x.k==='recruiter');if(a){a.lv=5;const g2=oth[0]||rival;const x=yourRead105(g2);out.hi=!!x&&x.rough===false&&x.est===effOvr(g2);a.lv=1}else out.hi=true;
    return out});
  console.log('B1',JSON.stringify(r));
  ok(r.hasNight,'a Match Week card');ok(r.read&&!r.old,'column is "Your read", not "Your scouts"');ok(/walking the sand/.test(r.tip)&&/recruiting dossier/.test(r.tip)&&/watching him/.test(r.tip),'tooltip names the sources: '+r.tip);
  ok(r.mineExact,'your own fighter reads exact');ok(r.nullBefore,'an unknown rival has no read');ok(r.walked,'the walk ran');ok(r.all,'every fighter on the card has a read of the right shape');
  ok(r.sand,'a rival read: src sand, rough, within 3 of the truth');ok(r.again,'deterministic');ok(r.dossier,'a scouted fighter keeps his dossier read');
  ok(r.look&&r.noScout,'a free agent gets one Recruiting look, g.scout untouched');ok(r.prev,'the look counts as an earlier look next week');ok(r.cells&&r.noNot,'the table fills the column');
  ok(r.aged,'reads age out');ok(r.old0,'a world without w.read105 loads');ok(r.watched,'watched live: same rough look, src watched');ok(r.hi,'a high Recruiter reads exact');
  await pg.close()}

{const pg=await open(true);
  const r=await ev(pg,async()=>{const w=W_(),pm=me(),n=w.night;const ids=[...new Set(n.bouts.flatMap(b=>b.ents))];const gs=ids.map(gById).filter(Boolean);
    const rival=gs.find(g=>!(g.contract&&g.contract.mgr===pm.id));rival.scout=0;window.wsand90Why=()=>'';const ok0=wsand90Walk();
    return {walked:ok0!==false,none:!w.read105||Object.keys(w.read105).length===0,rd:yourRead105(rival)}});
  console.log('B2',JSON.stringify(r));ok(r.walked,'kill switch: the walk still works');ok(r.none&&r.rd===null,'kill switch: nothing recorded, no read');await pg.close()}

console.log('ERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));await b.close();process.exit(errs.length||miss.length?1:0)})();

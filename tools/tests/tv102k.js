/* tv102k — v1.02 workstream K, THE ACTA DIURNA RESTYLED (342-v102acta): lead = your house's moment (upset) vs the league/empire on a quiet
   week, the stats strip shows only non-zero numbers, In Memoriam, w.acta102 keeps 12 trimmed editions + ◀ ▶ browse ("As printed then",
   Back to this week), the links (a name → the free agent's dossier, Scout ▸ → Free agents, League ▸), a bye week = "<ludus> did not fight
   this week", no Start-next-week button, phones one column, and the kill switch flavius_v102koff=1. SHOT=dir saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const SHOT=process.env.SHOT||'';
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v102koff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
    const w=W_(),pm=me();w.welc99=1;pm.coin=900;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}menuHide();openManager('ludus');await W8(1000);MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(500);
    /* helpers kept on window for the steps */
    window.__k={night:(o)=>{const w=W_(),pm=me();const mine=rosterOf(pm).slice().sort((a,c)=>pubOvr(a)-pubOvr(c));const others=w.glads.filter(g=>g.alive&&!(g.contract&&g.contract.mgr===pm.id)).sort((a,c)=>pubOvr(c)-pubOvr(a));
        const row=(g,won,place,f)=>({gid:g.id,name:g.name,won,place,f});const wk=o.wk;
        if(o.bye)return {week:wk,loc:4,bye:true,bouts:[]};
        const me1=mine[0],fav=others[0],o2=others[1],o3=others[2],o4=others[3],o5=others[4];
        const main={tier:'main',ev:'cassian',done:true,purse:180,ents:[me1.id,fav.id,o2.id],res:{winners:[o.win?me1.id:fav.id],rows:[row(me1,!!o.win,o.win?1:3,o.win?31:6),row(fav,!o.win,o.win?2:1,o.win?12:22),row(o2,false,3,4)],turns:14,lines:[]}};
        const feat={tier:'feature',ev:'egidious',done:true,purse:96,ents:[o3.id,o4.id],res:{winners:[o3.id],rows:[row(o3,true,1,22),row(o4,false,2,9)],turns:12,lines:[]}};
        const und={tier:'under',ev:'democritus',done:true,purse:48,ents:[o5.id,mine[1].id],res:{winners:[o5.id],rows:[row(o5,true,1,15),row(mine[1],false,2,7)],turns:10,lines:[]}};
        return {week:wk,loc:4,bouts:[main,feat,und].filter(b=>TIERS[b.tier])}}};
  });return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const shot=async(pg,n)=>{if(SHOT)await pg.screenshot({path:`${SHOT}/tv102k_${n}.png`})};
const pg=await open(1440,900);

/* 1 · a big week: your fighter's upset win leads; a rival's death is In Memoriam; the strip shows "fallen" */
const A=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const o={};const n=__k.night({wk:w.week,win:1});
  const me1=gById(n.bouts[0].ents[0]),fav=gById(n.bouts[0].ents[1]);o.diff=pubOvr(fav)-pubOvr(me1);if(o.diff<ACTA102.upset)ACTA102.upset=Math.max(1,o.diff);
  const foe=w.mgrs.find(m=>!m.isPlayer);w.grave.push({name:'Gaius Pellex',wk:n.week,s:w.season,cls:'hero',mgr:foe.name,fate:'Ad Bestias',ovr:61,fame:5,rec:{ev:9,w:4,kp:2}});
  const P=composeWeekPaper(w,n,w.season);w.lastPaper=P;o.kind=P.lead.kind;o.house=!!P.lead.house;o.gid=P.lead.gid===me1.id;o.also=(P.also||[]).length>=1;o.rabble=Array.isArray(P.rabble);
  o.stored=(w.acta102||[]).length;MGR.tab='paper';MGR_REDRAW();await W8(700);const r=document.querySelector('#mgrPane .ak102');o.page=!!r;
  if(r){o.kick=(r.querySelector('.ak102kick')||{}).textContent||'';o.hd=(r.querySelector('.ak102hd')||{}).textContent||'';o.engr=!!r.querySelector('.ak102en .portrait');o.strip=r.querySelector('.ak102strip').textContent;
    o.mem=/Gaius Pellex/.test(r.querySelector('.ak102arena').textContent);o.won=/WON/.test(r.querySelector('.ak102house').textContent);o.next=!!r.querySelector('.pnextwk,[data-mg="tab"][data-id="ludus"]');
    o.rab=!!r.querySelector('.rab100');o.fun=['.ak102dar','.ak102ovr','.ak102brief','.ak102cls'].every(s=>r.querySelector(s));o.rib=/NEXT WEEK/.test((r.querySelector('.ak102rib')||{}).textContent||'');
    const sf=getComputedStyle(r.querySelector('.ak102en .portrait')).filter;o.sepia=/sepia/.test(sf)}
  ACTA102.upset=8;return o});
ok(A.kind==='upset'&&A.house&&A.gid&&A.also&&A.rabble,'1 lead = your upset (old lead kept in also) '+JSON.stringify(A));
ok(A.page&&/your house/i.test(A.kick)&&/FAVOURITE/.test(A.hd)&&A.engr&&A.sepia,'1 page: kicker, headline, sepia engraving '+JSON.stringify(A));
ok(/fallen/.test(A.strip)&&/bouts/.test(A.strip)&&A.mem&&A.won,'1 strip with fallen, In Memoriam, WON row '+JSON.stringify(A));
ok(!A.next&&A.rib&&A.rab&&A.fun,'1 no Start-next-week button, the ribbon, rabble + fun row + Classifieds '+JSON.stringify(A));
await shot(pg,'big');

/* 2 · a quiet week: your fighters only lost → the league/empire leads; no deaths → no "fallen" */
const B=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const o={};const n=__k.night({wk:w.week+1,win:0});
  const P=composeWeekPaper(w,n,w.season);w.lastPaper=P;o.kind=P.lead.kind;o.house=!!P.lead.house;MGR.tab='paper';MGR_REDRAW();await W8(600);const r=document.querySelector('#mgrPane .ak102');
  o.kick=(r.querySelector('.ak102kick')||{}).textContent||'';o.strip=r.querySelector('.ak102strip').textContent;o.lost=/LOST/.test(r.querySelector('.ak102house').textContent);
  o.zero=[...r.querySelectorAll('.ak102strip b')].every(x=>!/^0\b/.test(x.textContent.trim()));o.calm=/No one fell/.test(r.querySelector('.ak102arena').textContent);return o});
ok(!B.house&&B.kind!=='upset'&&!/your house/i.test(B.kick)&&B.lost,'2 quiet week: the league/empire leads '+JSON.stringify(B));
ok(!/fallen/.test(B.strip)&&B.zero&&B.calm,'2 strip: only non-zero numbers '+JSON.stringify(B));
await shot(pg,'quiet');

/* 3 · a bye week: "<ludus> did not fight this week" */
const C=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const n=__k.night({wk:w.week+2,bye:1});const P=composeWeekPaper(w,n,w.season);w.lastPaper=P;
  MGR.tab='paper';MGR_REDRAW();await W8(500);const t=document.querySelector('#mgrPane .ak102house').textContent;return {line:t.includes(pm.ludus+' did not fight this week'),house:!!P.lead.house}});
ok(C.line&&!C.house,'3 bye week line '+JSON.stringify(C));

/* 4 · twelve editions kept, browse ◀ ▶ */
const D=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const o={};let P;for(let k=0;k<14;k++){P=composeWeekPaper(w,__k.night({wk:w.week+3+k,win:k%2}),w.season)}w.lastPaper=P;
  o.n=w.acta102.length;o.size=JSON.stringify(w.acta102).length;MGR.tab='paper';MGR.ak102=null;MGR_REDRAW();await W8(500);const key=()=>document.querySelector('#mgrPane .ak102').dataset.ak102key;
  o.k0=key();o.lastKey=w.acta102[11].key;o.nextDis=document.querySelector('#mgrPane [data-ak102="next"]').disabled;
  document.querySelector('#mgrPane [data-ak102="prev"]').click();await W8(400);o.k1=key();o.old=/AS PRINTED THEN/.test(document.querySelector('#mgrPane .ak102rib').textContent);o.back=!!document.querySelector('#mgrPane [data-ak102="now"]');
  o.pg=(document.querySelector('#mgrPane .ak102pg small')||{}).textContent||'';
  for(let k=0;k<15;k++){const p=document.querySelector('#mgrPane [data-ak102="prev"]');if(p.disabled)break;p.click();await W8(120)}o.first=key()===w.acta102[0].key;
  document.querySelector('#mgrPane [data-ak102="now"]').click();await W8(400);o.k2=key();return o});
ok(D.n===12&&D.size<12*7000,'4 twelve trimmed editions kept '+JSON.stringify(D));
ok(D.k0===D.lastKey&&D.nextDis&&D.k1!==D.k0&&D.old&&D.back&&/of 12 kept/.test(D.pg)&&D.first&&D.k2===D.lastKey,'4 ◀ ▶ browse + back to this week '+JSON.stringify(D));
await shot(pg,'browse');

/* 5 · links: a name → the free agent's dossier, Scout ▸ → Free agents, League ▸ */
const E=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};MGR.tab='paper';MGR.ak102=null;MGR_REDRAW();await W8(400);
  const nm=document.querySelector('#mgrPane .ak102cls [data-ak102^="fa:"]');o.nm=!!nm;if(nm){const id=nm.dataset.ak102.slice(3);nm.click();await W8(500);o.fa=MGR.tab==='recruit'&&String(MGR.sel)===id&&MGR.filter==='free'}
  MGR.tab='paper';MGR_REDRAW();await W8(400);document.querySelector('#mgrPane [data-ak102="scout"]').click();await W8(500);o.scout=MGR.tab==='recruit'&&MGR.filter==='free';
  MGR.tab='paper';MGR_REDRAW();await W8(400);document.querySelector('#mgrPane [data-ak102="league"]').click();await W8(500);o.league=MGR.tab==='league';
  MGR.tab='paper';MGR_REDRAW();await W8(400);return o});
ok(E.nm&&E.fa&&E.scout&&E.league,'5 links '+JSON.stringify(E));

/* 6 · the Ludus Archives still open an old paper (no pager) */
const F=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();w.papers=[w.lastPaper];MGR.tab='archive';MGR.papSel=0;MGR_REDRAW();await W8(400);
  const r=document.querySelector('#mgrPane .paper.ak102');const o={paper:!!r,pager:!!(r&&r.querySelector('[data-ak102="prev"]'))};MGR.papSel=null;MGR.tab='paper';MGR_REDRAW();await W8(300);return o});
ok(F.paper&&!F.pager,'6 archive paper without pager '+JSON.stringify(F));
await pg.close();

/* 7 · phone 390: one column, no sideways scroll */
const pp=await open(390,844);
const G=await ev(pp,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const P=composeWeekPaper(w,__k.night({wk:w.week,win:1}),w.season);w.lastPaper=P;MGR.tab='paper';MGR_REDRAW();await W8(700);
  const r=document.querySelector('#mgrPane .ak102');const sc=r.closest('#mBody')||document.documentElement;
  return {cols:getComputedStyle(r.querySelector('.ak102cols')).gridTemplateColumns.split(' ').length,low:getComputedStyle(r.querySelector('.ak102low')).gridTemplateColumns.split(' ').length,
    wide:r.getBoundingClientRect().right<=392&&document.documentElement.scrollWidth<=392}});
ok(G.cols===1&&G.low===1&&G.wide,'7 phone: one column '+JSON.stringify(G));
if(SHOT){await pp.evaluate(()=>{const b=document.getElementById('mBody');if(b)b.scrollTop=document.querySelector('#mgrPane .ak102').offsetTop})}await shot(pp,'phone');
await pp.close();

/* 8 · kill switch: 17/284's paper exactly */
const pk=await open(1440,900,1);
const H=await ev(pk,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const P=composeWeekPaper(w,__k.night({wk:w.week,win:1}),w.season);w.lastPaper=P;MGR.tab='paper';MGR_REDRAW();await W8(500);
  return {off:ACTA102.on===false,none:!document.querySelector('.ak102'),old:!!document.querySelector('#mgrPane .paper .pmast'),store:w.acta102===undefined,k:P.k102===undefined}});
ok(H.off&&H.none&&H.old&&H.store&&H.k,'8 kill switch '+JSON.stringify(H));
await pk.close();

console.log(miss.length?'FAIL '+JSON.stringify(miss):'PASS');console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close();process.exit(miss.length||errs.length?1:0)})();

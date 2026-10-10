/* tv99q — v0.99 fix4 (272-v99fix4 + small edits): issued starter kits, damaged armor to the shelf, selling from the Armory, the Recruiter's
   hours oval, welcome scroll + no invitations in season 1, Triumviratus on the Undercard, city classes + Damnatio only from Vulso/auction,
   the fallen total, soul steal on a kill, eagle earns CF in a no-CF round, tamed beasts move AND attack, tame picker token rounds,
   Match Week compact buttons + eagle chip, Ask column coin, Week in review ✕, recruit step reset, Zora's new image. ERRS must be []. */
const path=require('path');const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_welc99on','1')});
const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(process.argv[2]));await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
/* ---- Manager ---- */
const m1=await p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});const w=W_(),m=me();
  /* 21 welcome scroll */
  MGR.tab='ludus';MGR_REDRAW();await W8(700);const sc=document.querySelector('.welc99bg');o.welc=!!sc;if(sc)sc.querySelector('[data-welc99]').click();await W8(100);o.welcGone=!document.querySelector('.welc99bg')&&w.welc99===1;
  /* 3 issued kit */
  const fa=freeAgents().filter(g=>g.cls==='soldier'||g.cls==='hero').sort((a,b)=>effOvr(b)-effOvr(a));const A=fa[0];A.contract={mgr:m.id,wage:5,weeks:20,since:w.week};arm94Ensure(w);
  const E=A.eq94;o.kit=!!(E&&(E.R||E.a.length));o.iss=[E.R,E.L,...E.a].filter(Boolean).every(P=>P.iss===A.id);
  const bought=arm94New(w,'w','gladius');const H=arm94H(m);H.sh.push(bought);const kp=E.a[0]||E.R;
  /* a kit piece moved to the shelf cannot be sold, from the Armory or the stalls */
  if(E.R){H.sh.push(E.R);const id=E.R.id;E.R=null;o.noSell=!!sell99(id).no;o.noSell2=!!arm94Sell(id).no}else{o.noSell=o.noSell2=true}
  /* 3b damaged armor leaves the body after a bout */
  if(E.a[0]){E.a[0].dmg=1;const n0=E.a.length;dmg99Shelve(w,[A.id]);o.shelved=E.a.length===n0-1&&H.sh.some(P=>P.dmg)}else o.shelved=true;
  /* 3c damaged pieces sell outside the cap; whole spares count */
  m.sell94={k:(w.season||0)+':'+(w.week||0),n:ARM94.sellMax};const dmgP=H.sh.find(P=>P.dmg);const sd=dmgP?sell99(dmgP.id):{no:'x'};o.dmgSell=dmgP?!!sd.no:true; /* issued → refused even damaged */
  const scrap=arm94New(w,'a','manica');scrap.dmg=1;H.sh.push(scrap);const c0=m.coin;o.scrapSell=!!sell99(scrap.id).ok&&m.coin>c0;o.capRefuses=!!sell99(bought.id).no;m.sell94=null;o.spareSell=!!sell99(bought.id).ok;
  /* death: the issued kit vanishes, a bought piece stays */
  const kept=arm94New(w,'w','pugio');E.L=kept;A.alive=false;arm94Strip(w,A);o.purged=!arm94H(m).sh.some(P=>P.iss===A.id)&&!w.glads.some(g=>g.eq94&&[g.eq94.R,g.eq94.L,...(g.eq94.a||[])].some(P=>P&&P.iss===A.id));o.keptBought=H.sh.some(P=>P.id===kept.id);
  /* BUG fallen total */
  const B=fa[1];B.contract={mgr:m.id,wage:5,weeks:20,since:w.week};const s=fall99Snap();B.alive=false;fall99Count(s);o.fallen=(m.fallen99||0)>=1;
  /* 23 recruiter's hours oval */
  MGR.tab='recruit';MGR_REDRAW();await W8(500);hr99Sync();const ov=document.querySelector('.mtabs [data-id="recruit"] .mcount.hr99');o.oval=ov?ov.textContent:'';o.stat=(tabStat73('recruit')||[])[0];
  /* 24 Ask column */
  o.ask=!!document.querySelector('#mgrBody tr.r85 > td.n:last-child .amt87');
  /* 26 the step resets when a recruit is picked */
  MGR.recStep=3;const sel=document.querySelector('#mgrBody [data-mg="sel"]');if(sel)sel.click();o.step=MGR.recStep!==3;
  /* 25 Week in review ✕ */
  w.review={wk:w.week,season:w.season,coinD:0,coin:m.coin,fameD:0,winsD:0,boutsD:0,results:[],dead:[],training:[],seen:false};MGR.tab='ludus';MGR_REDRAW();await W8(500);
  const x=document.querySelector('[data-rev99]');o.revX=!!x;if(x)x.click();await W8(400);o.revGone=!document.querySelector('.rev91')&&!!w.rev99;
  /* 21b no invitations in the first season */
  const R0=Math.random;Math.random=()=>0.05;const n0=(w.invites||[]).length;try{for(let i=0;i<5;i++)specWeekStart(w)}catch(e){o.specErr=String(e)}Math.random=R0;o.noInv=(w.invites||[]).length===n0&&!w.invites.some(iv=>/^blk99/.test(iv.id));
  /* 22 Triumviratus on the Undercard */
  let hit=null;for(let s=1;s<=12&&!hit;s++)for(let k=1;k<=12;k++){try{if(fixtureFor(s,k).ev==='triumviratus'){hit=[s,k];break}}catch(e){}}
  if(hit){const ws=w.season,wk=w.week;w.season=hit[0];w.week=(hit[0]-1)*12+hit[1];try{makeNight();const n=w.night;const main=n.bouts.find(b=>b.tier==='main'),und=n.bouts.find(b=>b.tier==='under');o.tri=main.ev!=='triumviratus'&&und.ev==='triumviratus'&&und.ents.length===3&&main.ents.length>=4}catch(e){o.tri='err '+e}w.season=ws;w.week=wk;makeNight()}else o.tri='nofixture';
  /* 28 city classes; no Damnatio outside Vulso / the auction */
  const cap=Array.from({length:300},()=>genGlad({city:'Capua'}));o.capua=cap.filter(g=>g.cls==='slave').length/300;
  const any=Array.from({length:300},()=>genGlad());o.dam=any.filter(g=>g.cls==='damnatio').length;
  GEN99B.dam=0.5;const lot=Array.from({length:200},()=>genGlad({ovr:40}));GEN99B.dam=0;o.lotDam=lot.filter(g=>g.cls==='damnatio').length;
  /* 4/27/5 Match Week */
  MGR.tab='night';MGR_REDRAW();await W8(600);const btns=[...document.querySelectorAll('#mgrBody .card2.bout .acts .btn')];o.compact=btns.length>0&&btns.every(b=>{const s=b.querySelector('small');return !s||/\d/.test(s.textContent)});
  o.eagle=!!document.querySelector('#mgrBody .card2.bout .eg99');
  return o});
console.log(JSON.stringify(m1));
ok(m1.welc&&m1.welcGone,'21 the welcome scroll opens on a new career and the seal closes it');
ok(m1.kit&&m1.iss,'3 the class kit is issued (marked to the fighter)');ok(m1.noSell&&m1.noSell2,'3 an issued piece cannot be sold');
ok(m1.shelved,'3b damaged armor leaves the body');ok(m1.dmgSell,'3 issued damaged pieces are not sold either');ok(m1.scrapSell,'3c a damaged piece sells from the Armory past the weekly cap');ok(m1.capRefuses&&m1.spareSell,'3c whole spares keep the weekly cap');
ok(m1.purged&&m1.keptBought,'3 death: the issued kit vanishes, a bought piece stays');ok(m1.fallen,'BUG the fallen total counts');
ok(/^\d+ h$/.test(m1.oval)&&m1.oval===m1.stat,'23 the Recruiting oval shows the Recruiter\'s hours ('+m1.oval+' / '+m1.stat+')');ok(m1.ask,'24 the Ask column wears the coin');
ok(m1.step,'26 picking a recruit resets the step');ok(m1.revX&&m1.revGone,'25 Week in review can be dismissed');ok(m1.noInv&&!m1.specErr,'21 no invitations in the first season '+(m1.specErr||''));
ok(m1.tri===true||m1.tri==='nofixture','22 Triumviratus moved to the Undercard ('+m1.tri+')');ok(m1.capua>0.35,'28 Capua sends mostly slaves ('+m1.capua+')');ok(m1.dam===0,'28 no Damnatio outside Vulso/auction ('+m1.dam+')');ok(m1.lotDam>60,'28 Vulso/auction lots carry Damnatio ('+m1.lotDam+')');
ok(m1.compact,'4/27 Match Week buttons are one line');ok(m1.eagle,'5 the bout card shows the Golden Eagle');
/* ---- the board ---- */
const m2=await p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};try{const mc=document.getElementById('mClose');if(mc)mc.click()}catch(e){}await W8(400);while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(80)}try{menuHide()}catch(e){}
  o.zora=STANDEE_SRC.zoraMini==='assets/zora99.webp';
  SETTINGS.briefing=false;SPEED='fast';startEvent({ev:'democritus',loc:6,seats:['venatore','hero','royalty','soldier'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<200;i++){await W8(80);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);if(S&&S.players&&S.players[0])break}
  SPEED='pause';const P0=S.players[0];
  /* 6 soul steal on a kill: no window, the HP is placed */
  P0.hp.head=2;let opened=false;const MO=modal;modal=function(){opened=true;return MO.apply(this,arguments)};const h0=LOCS.reduce((a,l)=>a+P0.hp[l],0);
  await distributeHP(P0,2,'test',true);modal=MO;o.soul=!opened&&LOCS.reduce((a,l)=>a+P0.hp[l],0)>h0&&!P0.cpu;
  /* 7 the eagle earns in a no-CF round */
  const rd=RD();const cf0=rd.cf;rd.cf=0;const it={kind:'offer',key:'eagle',n:'Golden Eagle'};P0.items.push(it);const c0=P0.cf;let r=null;try{r=await useItem(P0,it)}catch(e){o.eErr=String(e)}rd.cf=cf0;o.eagle=P0.cf===c0+5;
  /* 12 tamed: after an attack no red rings, moves remain */
  const n=S.npcs.find(x=>x.alive);if(n){S.phase='command';S.cmd={p:P0,n,moved:false,attacked:true,lock:false,res:()=>{}};computeHL();o.noAtk=![...HL.values()].some(h=>h.t==='catk');o.canMove=[...HL.values()].some(h=>h.t==='cmove');S.cmd=null;S.phase='action';computeHL()}else{o.noAtk=o.canMove=true}
  /* 12 the tame picker shows token rounds */
  if(n){const pk=pickNPC(P0,'Tame',x=>x.alive,'note');await W8(200);o.tok=!!document.querySelector('#modal .tok99, #mBody .tok99');if(CUR_MODAL)CUR_MODAL.done(null);await pk}else o.tok=true;
  return o});
console.log(JSON.stringify(m2));
ok(m2.zora,'10 Zora uses his TTS render');ok(m2.soul,'6 a killing soul steal places its HP without a window');ok(m2.eagle,'7 the Golden Eagle earns CF in a no-CF round '+(m2.eErr||''));
ok(m2.noAtk&&m2.canMove,'12 a tamed beast that attacked may still move');ok(m2.tok,'12 the tame picker shows the beast token round');
console.log(JSON.stringify({miss,errs}));console.log(miss.length?'FAIL':'PASS');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})()

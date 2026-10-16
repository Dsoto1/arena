/* tv102b — v1.02 workstream B, MANAGER CHANGES (333-v102mgr): M5 podium points (1st 3 · 2nd 2 · 3rd 1, survivors only) + the podium record,
   M6 recruiting balance (cheap scouting ~2 weeks, the trial bout 8 h + 15 coin after a cheaper look, 1 week; ★ only from Recruiter level 3, value pick),
   M9 team purse split by CF among the winning survivors (hired partner → the hirer), M10 The Council (no "counsel", Consilium bottom left,
   no Buildings in his popover, the Upgrade School popup, one "Consilium's report" row + an urgent letter), M12 the recruiting list fits
   (1280 / 1600 / 1920), M13 Compare side by side, M15 File away ✓ on every letter + the Week in review, M16 read letters don't count. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(W,H)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_v104doff','1') /* v1.04: 351-v104ward replaces these rules — tv104d covers them */});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;
    const w=W_(),pm=me();w.welc99=1;pm.coin=900;delete pm.facWk;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}menuHide();openManager('ludus');await W8(1000);MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(500)});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const pg=await open(1440,900);
/* ---- M5 ---- */
const A=await ev(pg,()=>{const w=W_(),pm=me();const o={};const ros=rosterOf(pm);const foe=w.mgrs.find(m=>!m.isPlayer&&rosterOf(m).length>=2);const fr=rosterOf(foe);
  const sp=msp(pm),sf=msp(foe);const p0=sp.pts,f0=sf.pts;const mk=(rows)=>({tier:'under',ev:'democritus',res:{rows,winners:rows.filter(r=>r.won).map(r=>r.gid)}});
  /* solo: mine 1st, foe 2nd, mine 3rd but dead, foe 4th */
  const dead=ros[2];dead.alive=false;
  leaguePtsAfterBout(mk([{gid:ros[0].id,place:1,won:true,alive:true,f:20},{gid:fr[0].id,place:2,won:false,alive:true,f:12},{gid:dead.id,place:3,won:false,alive:false,f:5},{gid:fr[1].id,place:4,won:false,alive:true,f:3}]));
  dead.alive=true;
  o.pts=[sp.pts-p0,sf.pts-f0];o.pods=[sp.p1,sp.p2,sp.p3,sf.p1,sf.p2,sf.p3];
  /* team event: two winners both 1st, the losers 2nd and 3rd; a winner who died scores nothing */
  const p1=sp.pts,f1=sf.pts;
  leaguePtsAfterBout(mk([{gid:ros[0].id,place:1,won:true,alive:true,f:9},{gid:ros[1].id,place:2,won:true,alive:false,f:9},{gid:fr[0].id,place:3,won:false,alive:true,f:4},{gid:fr[1].id,place:4,won:false,alive:true,f:2}]));
  o.team=[sp.pts-p1,sf.pts-f1];
  o.txt=lp102Txt(sp);o.rec=lp102Rec(sp);o.tip=LP100_TIP();o.mig=SAVE_MIGRATIONS.some(x=>x[0]==='1.02');
  const old={spS:{1:{pts:9,w:3,b:5}}};lp102Migrate({mgrs:[old]});o.old=old.spS[1].p1===3&&old.spS[1].p2===0;
  return o});
ok(A.pts[0]===3&&A.pts[1]===2,'M5 solo points 3 / 2 (dead 3rd scores 0) '+JSON.stringify(A));ok(A.pods.join()==='1,0,0,0,1,0','M5 podium counts '+JSON.stringify(A.pods));
ok(A.team[0]===3&&A.team[1]===3,'M5 team: winners 1st, dead winner nothing, losers 2nd+3rd '+JSON.stringify(A.team));
ok(/🥇\d+ 🥈\d+ 🥉\d+ · \d+ bouts/.test(A.txt)&&/pd102/.test(A.rec),'M5 podium record text '+A.txt);ok(/1st place scores 3 points, 2nd 2, 3rd 1/.test(A.tip)&&/survived/.test(A.tip),'M5 LP100_TIP');ok(A.mig&&A.old,'M5 migration');
const A2=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};MGR.tab='league';MGR_REDRAW();await W8(500);const r=document.querySelector('.wd100r .c-rec');o.lg=!!r&&/🥇/.test(r.textContent)&&!/^\d+-\d+$/.test(r.textContent.trim());
  o.hd=[...document.querySelectorAll('.wd100rh .c-rec')].some(x=>/Podiums/.test(x.textContent));o.over=r?r.scrollWidth<=r.clientWidth+1:false;
  const hc=document.querySelector('.wd100hc .ln2');o.hc=!!hc&&/🥇/.test(hc.textContent);
  o.std=typeof lp90StakesHTML==='function'&&/🥇/.test(lp90StakesHTML());MGR.tab='ludus';MGR_REDRAW();await W8(300);return o});
ok(A2.lg&&A2.hd&&A2.over&&A2.hc&&A2.std,'M5 League view + house card + standings show podiums '+JSON.stringify(A2));
/* ---- M6 ---- */
const B=await ev(pg,()=>{const w=W_(),m=me();const o={};const wk0=w.week;
  const fresh=g=>{g.sc98={p:{},s:{},a:{},h:null};g.scout=0;for(const k of Object.keys(g.interest||{}))delete g.interest[k];return rec98K(g)};
  const sure=g=>STATS.every(([k])=>(rec98K(g).p[k]||0)>=3);const fa=freeAgents().filter(g=>!g.inj);
  o.hours=['ask','watch','cup','study','trial'].map(a=>REC98.acts[a].h).join();o.coin=REC98.acts.trial.coin;
  /* cheap route: every cheap action once a week until all five are sure */
  const cheapWeeks=[];const cheapHrs=[];
  for(const g of fa.slice(0,6)){fresh(g);let wk=0,h=0;while(!sure(g)&&wk<8){w.week=wk0+wk;w.rh98=null;for(const a of ['ask','watch','cup','study']){const r=rec98Act(g,a);if(r.ok)h+=REC98.acts[a].h}wk++}cheapWeeks.push(wk);cheapHrs.push(h)}
  /* lazy cheap route: no study */
  const lazy=[];for(const g of fa.slice(6,10)){fresh(g);let wk=0;while(!sure(g)&&wk<8){w.week=wk0+wk;w.rh98=null;for(const a of ['ask','watch','cup']){rec98Act(g,a)}if(wk>=2)rec98Act(g,'study');wk++}lazy.push(wk)}
  /* trial route: a cheaper look first, then the trial in the same week */
  const g=fa[10]||fa[0];fresh(g);w.week=wk0;w.rh98=null;m.coin=500;o.trialFirst=rec98Can(g,'trial');rec98Act(g,'ask');const c0=m.coin;const t=rec98Act(g,'trial');o.trialOk=t.ok;o.trialSure=sure(g);o.trialCost=c0-m.coin;o.trialH=rec98On(g,w);
  /* precision per hour: cheap > trial */
  o.pphCheap=+(15/(cheapHrs.reduce((a,c)=>a+c,0)/cheapHrs.length)).toFixed(2);o.pphTrial=+(15/o.trialH).toFixed(2);
  w.week=wk0;w.rh98=null;for(const x of fa)fresh(x);o.cheapWeeks=cheapWeeks;o.cheapHrs=cheapHrs;o.lazy=lazy;
  /* ★ only from Recruiter level 3 */
  const R=council83(w).find(a=>a.k==='recruiter');const x=fa[0];MGR.sel=x.id;MGR.recStep=1;
  R.lv=2;o.adv2=recAdvice74(x,m,1);o.h2=/star85|adv74|adv85b/.test(detailHTML(x));
  R.lv=3;o.adv3=recAdvice74(x,m,1);o.h3=/star85|adv74/.test(detailHTML(x));o.next=rec98Next(x);o.best=!!rec102Best(w,m);
  return o});
ok(B.hours==='1,1,1,1,8'&&B.coin===15,'M6 hours/coin '+B.hours+' '+B.coin);
ok(B.cheapWeeks.every(n=>n>=2&&n<=3),'M6 cheap scouting takes 2–3 weeks '+JSON.stringify(B.cheapWeeks));ok(B.lazy.every(n=>n>=2&&n<=4),'M6 lazy cheap scouting '+JSON.stringify(B.lazy));
ok(!B.trialFirst[0]&&B.trialOk&&B.trialSure&&B.trialCost===15&&B.trialH===9,'M6 trial: needs a look first, 1 week, 15 coin, 9 h '+JSON.stringify(B));
ok(B.pphCheap>B.pphTrial,'M6 cheap = more precision per hour '+B.pphCheap+' > '+B.pphTrial);
ok(B.adv2===null&&!B.h2&&B.adv3&&B.h3&&['ask','watch','cup','study'].includes(B.next)&&B.best,'M6 ★ only from level 3 '+JSON.stringify([B.adv2,B.h2,B.adv3,B.h3,B.next]));
console.log('M6 numbers',JSON.stringify({cheapWeeks:B.cheapWeeks,cheapHrs:B.cheapHrs,lazyWeeks:B.lazy,trialWeek:1,trialH:B.trialH,trialCoin:B.trialCost,pphCheap:B.pphCheap,pphTrial:B.pphTrial}));
/* ---- M9 ---- */
const C=await ev(pg,()=>{const w=W_(),m=me();const o={};const ev=Object.keys(EVENTS).find(k=>EVENTS[k].teams===1&&EVENTS[k].seats!==2)||Object.keys(EVENTS).find(k=>EVENTS[k].teams===1);
  const ros=rosterOf(m);const foe=w.mgrs.find(x=>!x.isPlayer&&rosterOf(x).length>=2);const fr=rosterOf(foe);const fa=freeAgents()[0];
  const ents=[ros[0].id,fr[0].id,fa.id,fr[1].id];const P=200;
  const bt={tier:'spc100',ev,purse:P,special:true,fee:0,ents,done:false,res:null,bets:[],any100:{fee:5,src:'ed',day:2,side:{},paid:{},hire:{[fa.id]:{by:m.id,c:6}},ed:{}}};
  w.night.bouts.push(bt);const idx=w.night.bouts.length-1;const c0=m.coin,cf=foe.coin;
  const rows=ents.map((id,i)=>({id:'p'+i,mgrId:id,f:[60,0,20,0][i],kp:0,kn:0,dmg:0,taken:0,alive:true,coin:0,severed:[],name:(gById(id)||{}).name}));
  applyBout(idx,{rows,winners:['p0','p2'],att:1000,seed:1,turns:5,reason:'t',lines:[]});
  o.split=bt.any100.split;o.mine=o.split[ros[0].id];o.hired=o.split[fa.id];o.ratio=o.mine/Math.max(1,o.hired);o.gain=m.coin-c0;
  /* a dead winner gets nothing; the survivor takes the whole purse */
  const bt2={...JSON.parse(JSON.stringify(bt)),done:false,res:null,bets:[]};bt2.any100.hire={};w.night.bouts.push(bt2);const i2=w.night.bouts.length-1;
  const rows2=ents.map((id,i)=>({id:'p'+i,mgrId:id,f:[60,0,20,0][i],kp:0,kn:0,dmg:0,taken:0,alive:i!==2,coin:0,severed:[],name:''}));const fa2=gById(fa.id);
  applyBout(i2,{rows:rows2,winners:['p0','p2'],att:1000,seed:2,turns:5,reason:'t',lines:[]});o.split2=bt2.any100.split;
  w.night.bouts.splice(i2,1);w.night.bouts.splice(idx,1);if(fa2)fa2.alive=true;return o});
ok(C.mine&&C.hired&&Math.abs(C.ratio-3)<0.05&&C.mine+C.hired===200,'M9 split by CF (60 : 20) '+JSON.stringify(C));
ok(C.split2&&Object.values(C.split2).filter(v=>v>0).length===1&&Object.values(C.split2).includes(200),'M9 dead winner → the survivor takes the purse '+JSON.stringify(C.split2));
/* ---- M10 ---- */
const D=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const o={};MGR.tab='ludus';LU100.pop=null;pm.coin=900;w.loan=null;MGR_REDRAW();await W8(400);
  const t=document.getElementById('mgrBody').textContent;o.noCounsel=!/counsel/i.test(t)&&!/counsel/i.test(consiliumHTML());
  const cap=document.querySelector('.lu100t.k-adv .cap');o.cons=!!cap&&!!cap.querySelector(':scope>.c83p[data-c83="consilium"]')&&!document.querySelector('.c101top')&&!cap.querySelector('.em');
  o.five=document.querySelectorAll('#council83 .c83row .c83p').length===5;o.title=/The Council/.test(document.querySelector('.lu100t.k-adv .cap').textContent);
  o.quiet=!document.querySelector('.dk99row')||![...document.querySelectorAll('.dk99row')].some(r=>/Consilium's report/.test(r.textContent));
  cap.querySelector('.c83p').click();await W8(400);let p=document.getElementById('lu100pop');o.popNoBuild=!!p&&!p.querySelector('.lu2ov')&&!/The buildings/.test(p.textContent)&&!!p.querySelector('.cn101');
  LU100.pop=null;MGR_REDRAW();await W8(300);
  /* the Upgrade School tile: every building in a popup */
  document.querySelector('.lu100t.k-school').click();await W8(400);const f=document.querySelector('#mgrPane .lu102fac');o.fac=!!f&&f.querySelectorAll('.lu2r [data-mg="build"]').length>=Object.keys(FAC).length-1;
  document.querySelector('[data-lu102fac="0"]').click();await W8(300);o.facShut=!document.querySelector('.lu102fac');
  /* warnings: one row + a letter only when urgent */
  pm.coin=-30;MGR_REDRAW();await W8(400);const rows=[...document.querySelectorAll('.dk99row')].filter(r=>/Consilium's report/.test(r.textContent));o.row=rows.length===1&&/debt/.test(rows[0].textContent);
  o.letter=(w.letters||[]).some(l=>/^consil102-/.test(l.key)&&l.adv==='consilium');o.lit=!!document.querySelector('.c83p.lit[data-c83="consilium"]');
  pm.coin=900;const wages=rosterOf(pm).reduce((a,g)=>a+g.contract.wage,0);pm.coin=wages*2;w.letters=(w.letters||[]).filter(l=>!/^consil102-/.test(l.key));MGR_REDRAW();await W8(300);
  o.runRow=[...document.querySelectorAll('.dk99row')].some(r=>/Consilium's report/.test(r.textContent)&&/wages/.test(r.textContent));o.noLetter=!(w.letters||[]).some(l=>/^consil102-/.test(l.key));
  o.lu2=lu2Counsel(w)===null||!/Counsel/.test(lu2Counsel(w));pm.coin=900;MGR_REDRAW();await W8(300);return o});
ok(D.noCounsel,'M10 no "counsel" anywhere');ok(D.cons&&D.five&&D.title,'M10 Consilium bottom left, five along the strip '+JSON.stringify(D));ok(D.popNoBuild,'M10 his popover has no Buildings');
ok(D.fac&&D.facShut,'M10 Upgrade School popup');ok(D.quiet&&D.row&&D.letter&&D.lit,'M10 debt → one report row + urgent letter '+JSON.stringify(D));ok(D.runRow&&D.noLetter&&D.lu2,'M10 short wages → row, no letter');
/* ---- M15 + M16 ---- */
const E=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();const o={};
  w.letters=(w.letters||[]).filter(l=>!/^t102/.test(l.key));sendLetter(w,{key:'t102a',kind:'letter',from:'the Quaestor',seal:'📊',title:'Standings test',body:'<p>You are 3rd.</p>',until:w.week+1});
  if(!w.review){for(const x of w.night.bouts){x.done=true;x.res=x.res||{att:0,winners:[],rows:[],turns:1,lines:[],reason:''}}w.pend=[];await endWeek();await W8(300);while(CUR_MODAL){CUR_MODAL.done(null);await W8(100)}}
  sendLetter(w,{key:'t102a',kind:'letter',from:'the Quaestor',seal:'📊',title:'Standings test',body:'<p>You are 3rd.</p>',until:w.week+1});
  delete w.rev99;delete w.rev102;MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(500);
  const env=document.querySelector('details.mail[data-mail="L:t102a"]');o.fa=!!env&&!!env.querySelector('.fa102r>button.fa102[data-ltr="t102a"]')&&!env.querySelector('.acts [data-ltr]');
  const rev=document.querySelector('details.rev91');o.revFa=!rev||(!!rev.querySelector('button.fa102[data-rev99]')&&!rev.querySelector('.rev99x'));o.rev=!!rev;
  const cnt=()=>{const b=document.querySelector('#desk99 .lu100mb b');return b?+b.textContent:0};const n0=cnt();
  env.open=true;await W8(300);MGR_REDRAW();await W8(400);const n1=cnt();o.counts=[n0,n1];o.dropRead=n1===n0-1;
  if(rev){const r2=document.querySelector('details.rev91');r2.open=true;await W8(300);MGR_REDRAW();await W8(400);o.revRead=cnt()===n1-1}
  /* a desk row from a read letter does not count on the rail */
  sendLetter(w,{key:'t102b',kind:'letter',from:'the Quaestor',seal:'📊',title:'Act test',body:'<p>x</p><button class="btn tksm" type="button" data-mg="tab" data-id="league">League</button>',until:w.week+1});
  MGR_REDRAW();await W8(400);const t0=ludusTodo73();w.mailRead.push('L:t102b');MGR_REDRAW();await W8(300);const t1=ludusTodo73();o.rail=[t0,t1];o.railDrop=t1===t0-1;
  /* File away ✓ files it */
  document.querySelector('details.mail[data-mail="L:t102a"] button.fa102').click();await W8(400);o.filed=(w.letters.find(l=>l.key==='t102a')||{}).read===true&&!document.querySelector('details.mail[data-mail="L:t102a"]');
  w.letters=w.letters.filter(l=>!/^t102/.test(l.key));MGR_REDRAW();await W8(200);return o});
ok(E.fa&&E.revFa&&E.filed,'M15 File away ✓ on letters + Week in review '+JSON.stringify(E));ok(E.dropRead,'M16 a read letter leaves the Letters count '+JSON.stringify(E.counts));
ok(E.revRead!==false,'M16 the Week in review counts only until opened');ok(E.railDrop,'M16 rail count skips read letter rows '+JSON.stringify(E.rail));
/* ---- M12 + M13 ---- */
for(const W of [1280,1600,1920]){const p2=W===1440?pg:await open(W,1000);
  const F=await ev(p2,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const o={};const fa=freeAgents();MGR.tab='recruit';MGR.cmp=[fa[0].id,fa[1].id];fa[1].scout=2;MGR_REDRAW();await W8(700);
    const t=document.getElementById('recTable');o.fit=!!t&&t.scrollWidth<=t.clientWidth+1;const tb=t&&t.querySelector('table');o.tbl=tb?tb.getBoundingClientRect().width<=t.getBoundingClientRect().width+1:false;
    const c=document.querySelector('.cmp102');o.cmp=!!c&&c.querySelectorAll('.cmp102c').length===2&&c.querySelectorAll('.cmp102c .gb98').length>=12&&!!c.querySelector('.cmp102p')&&!!c.querySelector('.cmp102c .rc1pe,.cmp102c .pe98');
    const cs=c?[...c.querySelectorAll('.cmp102c')].map(x=>x.getBoundingClientRect()):[];o.side=cs.length===2&&Math.abs(cs[0].top-cs[1].top)<2&&cs[1].left>cs[0].right-1;
    o.map=!!(c&&c.querySelector('.cmp102m svg,.cmp102m img'));
    c.querySelector('[data-reccmp]').click();await W8(400);o.out=MGR.cmp.length===1;MGR.cmp=[];return o});
  ok(F.fit&&F.tbl,`M12 list fits at ${W} `+JSON.stringify(F));ok(F.cmp&&F.side&&F.out,`M13 compare side by side at ${W} `+JSON.stringify(F));if(W===1920)ok(F.map,'M13 map inset');
  if(p2!==pg)await p2.close()}
console.log('ERRS',JSON.stringify(errs));if(miss.length){console.log('FAIL',miss.join('\n'));process.exitCode=1}else console.log('tv102b OK');await b.close()})();

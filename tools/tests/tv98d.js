/* v0.98 part D (249-v98rec): RECRUITING III + ADVISOR LEVELS + HOUSE GRADES — advisor levels by start type + training up, no rating
   numbers before signing (card, list, tablets, compare, letters), the recruiter's hours (spend, per-recruit cap, once a week, weekly
   pool, the new week), each action sharpens the right grades, estimates by Recruiter level (noise shrinks with level and precision,
   stable), personality + dealbreaker, house grades + pitches (want ×2, grade-driven, projections, one a week), the truth card,
   rivals' estimates, the 0.98 migration of an old save. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const o={};
/* ---------- 1 · advisor levels by start type ---------- */
o.lv=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  const lv=()=>council83(W_()).map(a=>a.lv);const cm=d=>({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:d}});const r={};
  newWorld(cm('normal'));r.custom=lv();r.hCustom=rec98HrsMax(W_());r.xCustom=rec101Base(rec101Own(W_()))+4*(adv98Lv(W_())-1);
  newWorld(cm('easy'));r.easy=lv();r.hEasy=rec98HrsMax(W_());r.xEasy=rec101Base(rec101Own(W_()))+4*(adv98Lv(W_())-1);
  newWorld({type:'pre',key:'servius'});r.small=lv();
  newWorld({type:'pre',key:'crispus'});r.big=lv();r.hBig=rec98HrsMax(W_());r.xBig=rec101Base(rec101Own(W_()))+4*(adv98Lv(W_())-1);
  newWorld(cm('normal'));const m=me();m.coin=900;const c0=m.coin;const u=adv98Up('recruiter');r.up=[u.ok,u.lv,c0-m.coin,rec98HrsMax(W_())-rec101Base(rec101Own(W_()))+20];const c1=m.coin;const u2=adv98Up('recruiter');r.up2=[u2.ok,u2.lv,c1-m.coin];const u3=u2;r.up3=[u3.ok,m.coin===c1,council83(W_()).find(x=>x.k==='recruiter').lv];const u4=adv98Up('doctore');r.upD=[u4.ok,u4.lv];a_=council83(W_()).find(x=>x.k==='recruiter');a_.lv=1;m.coin=900;r.noBtn2=null;
  MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(500);r.card=document.querySelectorAll('#mgrBody .c98lv').length;r.btn=!!document.querySelector('#mgrBody [data-c98up="recruiter"]');
  const a=council83(W_()).find(x=>x.k==='recruiter');a.lv=2;MGR_REDRAW();await W8(400);r.btn2=!!document.querySelector('#mgrBody [data-c98up="recruiter"]');r.ev2=(document.querySelector('#mgrBody [data-c83="recruiter"] .c98ev')||{}).textContent;a.lv=3;return r});
const all=(a,v)=>Array.isArray(a)&&a.length===6&&a.every(x=>x===v);
ok(all(o.lv.custom,1)&&o.lv.hCustom===o.lv.xCustom,'a new house: level 1, hours = roster band (v1.01) + 4 per level above 1 '+JSON.stringify(o.lv));ok(all(o.lv.easy,2)&&o.lv.hEasy===o.lv.xEasy,'an Easy start: level 2');
ok(all(o.lv.small,2)&&all(o.lv.big,3)&&o.lv.hBig===o.lv.xBig,'a taken-over house: 2, or 3 when established');
ok(o.lv.up[0]&&o.lv.up[1]===2&&o.lv.up[2]===60&&o.lv.up[3]===24,'coin: level 1 → 2 costs 60 and adds hours '+JSON.stringify(o.lv.up));ok(!o.lv.up2[0]&&o.lv.up2[2]===0,'coin: level 2 → 3 is refused');ok(!o.lv.up3[0]&&o.lv.up3[1]&&o.lv.up3[2]===2,'coin stops at level 2 '+JSON.stringify(o.lv.up3));ok(o.lv.upD[0]&&o.lv.upD[1]===2,'every advisor can be trained (Doctore)');ok(!o.lv.btn2&&/Level 3/.test(o.lv.ev2||''),'level 2: no Train button, progress for level 3 '+o.lv.ev2);ok(o.lv.card===6&&o.lv.btn,'council card shows levels + the train button');
/* ---------- 2 · no numbers before signing ---------- */
o.nn=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const w=W_(),m=me();m.fame=Math.max(m.fame,60);
  const fa=freeAgents().filter(x=>m.fame>=reqFame(x)).sort((a,b)=>effOvr(b)-effOvr(a));window.FA=fa;fa.slice(0,4).forEach(g=>g.favd=true);const g=fa[0];
  rec98Act(fa[1],'watch');rec98Act(fa[1],'cup');rec98Act(fa[1],'study');MGR.cmp=[fa[0].id,fa[1].id];
  const r={unq:[],steps:[]};const dig=s=>/\d/.test(String(s||''));MGR.tab='recruit';
  for(const s of [1,2,3]){MGR.sel=g.id;MGR.recFor=g.id;MGR.recStep=s;MGR_REDRAW();await W8(300);
    const card=document.querySelector('#mgrBody .gs98')&&document.querySelector('#mgrBody .gs98').closest('.card2');
    r.steps.push({strip:document.querySelectorAll('#mgrBody .gs98 .gb98').length,q:[...document.querySelectorAll('#mgrBody .gs98 .gb98:not(.ov98) b')].map(e=>e.textContent).join(''),
      odds:card?[...card.querySelectorAll('.odds')].map(e=>e.textContent).join('|'):null,rng:document.querySelectorAll('#mgrBody [data-rng88]').length,pot:card?/potential \d/.test(card.textContent):null})}
  r.list=[...document.querySelectorAll('#recTable tr[data-mg="sel"]')].filter(tr=>{const x=gById(tr.dataset.id);return x&&!x.contract}).map(tr=>(tr.querySelector('.odds')||{}).textContent||'').filter(dig);
  r.tabs=[...document.querySelectorAll('#mgrBody .pt85 .ps85 b')].map(e=>e.textContent).filter(dig);
  r.cmp=[...document.querySelectorAll('#mgrBody .cmpbox .cmpc')].map(c=>[...c.querySelectorAll('.cmpr b')].slice(0,6).map(e=>e.textContent).filter(dig)).flat();
  r.cmpN=document.querySelectorAll('#mgrBody .cmpbox .cmpc').length;
  /* the recruiter's letters */
  for(let i=0;i<3;i++){try{recruiter84(w)}catch(e){}}r.letters=(w.letters||[]).filter(L=>/^rec84/.test(L.key||'')).map(L=>(String(L.body).match(/rating ([^·<]*)/)||[])[1]||'').filter(dig);
  /* the free agent's ratings block anywhere */
  const d=document.createElement('div');d.innerHTML=ratingsHTML(fa[2]);r.rat=dig(d.textContent);
  /* the ludus guide's best-value line, Vulso, pay-to-join: grades */
  r.pub=typeof rec98PubG==='function'&&/^[A-F][+]?$/.test(rec98PubG(fa[3]));MGR.cmp=[];return r});
for(const [i,s] of o.nn.steps.entries())ok(s.strip===6&&s.q==='?????'&&s.odds&&!/\d/.test(s.odds)&&s.rng===0&&s.pot===false,`card step ${i+1}: grade strip, "?" before scouting, no numbers `+JSON.stringify(s));
ok(!o.nn.list.length&&!o.nn.tabs.length,'list + board tablets: grades, no numbers '+JSON.stringify([o.nn.list,o.nn.tabs]));
ok(o.nn.cmpN===2&&!o.nn.cmp.length,'compare: grades, no numbers '+JSON.stringify(o.nn.cmp));ok(!o.nn.letters.length,'recruiter letters: grades '+JSON.stringify(o.nn.letters));
ok(!o.nn.rat&&o.nn.pub,'ratingsHTML of a free agent + the street word: no numbers');
/* ---------- 3 · hours: spend, per-recruit cap, once a week, the weekly pool, a new week ---------- */
o.h=await pg.evaluate(()=>{const w=W_(),m=me();const r={};const g=FA[5];const L0=rec98Left(w);r.max=rec98HrsMax(w);
  r.a=rec98Act(g,'watch').ok;r.l1=L0-rec98Left(w);r.again=rec98Can(g,'watch')[0];r.cup=rec98Act(g,'cup').ok;r.study=rec98Act(g,'study').ok;r.on=rec98On(g,w);
  r.trial=rec98Can(g,'trial');r.l2=L0-rec98Left(w);
  /* drain the pool across other recruits */
  let n=0;for(const x of FA.slice(6)){for(const a of ['trial','study','watch','cup','ask']){if(rec98Act(x,a).ok)n++}if(rec98Left(w)<1)break}
  r.drained=rec98Left(w);r.used=rec98Used(w);r.more=FA.slice(6).some(x=>rec98Can(x,'ask')[0]);
  w.week++;r.newWeek=rec98Left(w)===rec98HrsMax(w)&&rec98On(g,w)===0;w.week--;return r});
ok(o.h.a&&o.h.l1===2&&o.h.again===false,'watch costs 2 h, once a recruit a week '+JSON.stringify(o.h));
ok(o.h.cup&&o.h.study&&o.h.on===7&&o.h.l2===7&&o.h.trial[0]===false&&/8/.test(o.h.trial[1]),'per-recruit cap 8 h stops a 5 h trial after 7 h');
ok(o.h.used<=o.h.max&&o.h.drained<=1&&!o.h.more,'the weekly pool runs dry and never overspends');ok(o.h.newWeek,'a new week: a fresh pool');
/* ---------- 4 · each action sharpens the right grades ---------- */
o.a=await pg.evaluate(()=>{const w=W_(),m=me();w.week+=7;const r={};const P=g=>({...rec98K(g).p});const fresh=FA.slice(20).filter(g=>!g.contract&&!(g.scout>0)&&!g.inj);const [a,b,c,d]=fresh;m.coin=500;
  rec98Act(a,'watch');r.watch=P(a);rec98Act(a,'cup');r.cup=P(a);r.aSc=a.scout;
  rec98Act(b,'ask');r.ask=P(b);rec98Act(c,'study');r.study=P(c);
  const i0=interestOf(d,m),c0=m.coin;const t=rec98Act(d,'trial');r.trial=P(d);r.tri=[t.ok,interestOf(d,m)-i0,c0-m.coin,d.scout];
  window.GA=a;window.GD=d;return r});
const P=(p,v)=>Object.entries(v).every(([k,x])=>p[k]===x);
ok(P(o.a.watch,{spd:2,str:2,int:0,lck:0,cha:0}),'watch: Speed + Strength '+JSON.stringify(o.a.watch));ok(P(o.a.cup,{spd:2,str:2,int:2,lck:0,cha:2})&&!(o.a.aSc>=2),'share a cup: Intelligence + Charisma');
ok(Object.values(o.a.ask).filter(x=>x===1).length===1&&Object.values(o.a.ask).filter(x=>x>0).length===1,'ask around: one rough grade '+JSON.stringify(o.a.ask));
ok(P(o.a.study,{spd:1,str:1,int:1,lck:2,cha:1}),'study: every grade one step, Luck fair '+JSON.stringify(o.a.study));
ok(P(o.a.trial,{spd:3,str:3,int:3,lck:3,cha:3})&&o.a.tri[0]&&o.a.tri[1]>0&&o.a.tri[2]===4&&o.a.tri[3]===3,'trial: everything sure, interest, coin '+JSON.stringify(o.a.tri));
/* ---------- 5 · estimates by Recruiter level ---------- */
o.e=await pg.evaluate(()=>{const w=W_();const a=council83(w).find(x=>x.k==='recruiter');const pool=w.glads.filter(g=>g.alive!==false&&!g.contract).slice(0,80);const keep=pool.map(g=>[g.sc98,g.scout]);
  const err=(lv,p)=>{a.lv=lv;let s=0,n=0,hit=0;for(const g of pool){g.sc98={p:{spd:p,str:p,int:p,lck:p,cha:p},s:{},a:{},h:null,sc:9};const st=gStats(g);for(const [k] of STATS){const e=rec98Est(g,k);s+=Math.abs(e.v-st[k]);n++;if(e.g===trait96Grade(st[k]))hit++}}return {mae:+(s/n).toFixed(2),hit:+(hit/n).toFixed(2)}};
  const r={l1p1:err(1,1),l1p2:err(1,2),l1p3:err(1,3),l3p1:err(3,1),l5p1:err(5,1),l5p3:err(5,3)};
  a.lv=1;const g=pool[0];g.sc98={p:{spd:1,str:1,int:1,lck:1,cha:1},s:{},a:{},h:null,sc:9};const e1=rec98Est(g,'spd').v,e2=rec98Est(g,'spd').v;r.stable=e1===e2;
  /* never the dice RNG: estimates leave Math.random and the seeded stream alone */
  const mr=Math.random;let calls=0;Math.random=()=>{calls++;return mr()};try{for(const x of pool)rec98Est(x,'str')}finally{Math.random=mr}r.rnd=calls;
  pool.forEach((g,i)=>{g.sc98=keep[i][0];g.scout=keep[i][1]});a.lv=3;r.n=pool.length;return r});
ok(o.e.l1p1.mae>o.e.l1p2.mae&&o.e.l1p2.mae>o.e.l1p3.mae,'sharper precision = smaller error '+JSON.stringify(o.e));
ok(o.e.l1p1.mae>o.e.l3p1.mae&&o.e.l3p1.mae>o.e.l5p1.mae&&o.e.l5p3.hit>=0.85&&o.e.l1p1.hit<o.e.l5p3.hit,'a better recruiter = smaller error');ok(o.e.stable&&o.e.rnd===0,'estimates are stable and hashed');
/* ---------- 6 · personality reveal + dealbreaker ---------- */
o.p=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const w=W_(),m=me();const r={};const g=GA;
  MGR.tab='recruit';MGR.sel=g.id;MGR.recFor=g.id;MGR.recStep=1;MGR_REDRAW();await W8(300);r.lock=!!document.querySelector('#mgrBody .pe98.lock');r.wk0=wants88Known(g).length;
  const res=rec98Act(g,'ask');if(!res.ok){w.week++;rec98Act(g,'study')}r.sc=g.scout;MGR_REDRAW();await W8(300);
  const pe=document.querySelector('#mgrBody .pe98:not(.lock)');r.open=!!pe;r.rows=pe?pe.querySelectorAll('.pe98r').length:0;r.wk=wants88Known(g).length===wants88(g).length;
  /* dealbreaker: a recruit with one, triggered on and off */
  const d=freeAgents().find(x=>rec98Deal(x)&&!x.inj);const D=rec98Deal(d);d.interest[m.id]=110;m.fame=100;m.coin=999;const ask=askWage(d);
  const keep=m.p[D.t];m.p[D.t]=D.k==='greed'||D.k==='risk'?95:20;r.hit=!!rec98DealHit(d,m);r.vLow=offerVerdict(d,ask,8,0,false);r.vHigh=offerVerdict(d,Math.ceil(ask*1.3),8,0,false).ok;
  m.p[D.t]=D.k==='greed'||D.k==='risk'?20:95;r.vOff=offerVerdict(d,ask,8,0,false).ok;m.p[D.t]=keep;
  let has=0;for(const x of freeAgents())if(rec98Deal(x))has++;r.share=has/freeAgents().length;return r});
ok(o.p.lock&&o.p.wk0===0,'personality locked before all five are graded');ok(o.p.sc>=2&&o.p.open&&o.p.rows>=4&&o.p.wk /* v1.0 (299): + an Asks row */,'all five graded: temper, wants, cares, dealbreaker '+JSON.stringify(o.p));
ok(o.p.hit&&o.p.vLow&&!o.p.vLow.ok&&o.p.vHigh&&o.p.vOff,'a broken dealbreaker asks more; a fine house signs at the ask '+JSON.stringify(o.p.vLow));ok(o.p.share>0.3&&o.p.share<0.9,'about 6 in 10 have a dealbreaker');
/* ---------- 7 · house grades + pitches ---------- */
o.c=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const w=W_(),m=me();const r={};
  const g=w.glads.filter(x=>x.alive!==false&&!x.contract).find(x=>!x.inj&&x!==GA&&wants88(x).some(k=>PITCH98.some(P=>P.want===k))&&!(x.recW&&x.recW[m.id]&&x.recW[m.id].wk===w.week));
  g.sc98={p:{spd:2,str:2,int:2,lck:2,cha:2},s:{},a:{},h:null,sc:0};g.scout=0;rec98K(g);r.sc=g.scout;
  const P=PITCH98.find(p=>wants88(g).includes(p.want));const trait=P.t;m.p[trait]=80;const G=rec98PGain(g,m,P,false);r.want=[G.wm,G.gr,G.n];
  const mw=((g.motives.find(x=>x[0]===P.mot)||[0,0])[1]);r.expect=REC98.pitch[G.gr]*2+Math.round(mw*10)+(typeof pk87==='function'&&pk87('br1')?3:0);
  m.p[trait]=20;r.low=rec98PGain(g,m,P,false).n;m.p[trait]=95;r.high=rec98PGain(g,m,P,false).n;m.p[trait]=80;
  MGR.tab='recruit';MGR.sel=g.id;MGR.recFor=g.id;MGR.recStep=2;w.pitchN=null;MGR_REDRAW();await W8(300);
  r.hg=document.querySelectorAll('#mgrBody .hg98c').length;r.cards=document.querySelectorAll('#mgrBody .pc98').length;r.hot=!!document.querySelector(`#mgrBody .hg98c.hot[data-hg98="${trait}"]`);
  r.proj=(document.querySelector('#mgrBody [data-rec98p^="yard|"]')||{}).textContent||'';r.champ=(document.querySelector('#mgrBody [data-rec98p^="champ|"]')||{}).textContent||'';
  g.interest[m.id]=10;const i0=interestOf(g,m),p0=pitchesLeft();document.querySelector(`#mgrBody [data-rec98p="${P.k}|${g.id}"]`).click();await W8(300);
  r.got=interestOf(g,m)-i0;r.left=p0-pitchesLeft();const b2=document.querySelector(`#mgrBody [data-rec98p]`);r.again=!!(b2&&b2.disabled);return r});
ok(o.c.sc>=2&&o.c.want[0]&&o.c.want[1]==='B+'&&o.c.want[2]===o.c.expect,'a pitch on his wish counts double + his motive '+JSON.stringify(o.c));
ok(o.c.low<o.c.want[2]-10&&o.c.high>o.c.want[2],'the house grade drives the pitch');ok(o.c.hg===7&&o.c.cards===6&&o.c.hot,'house grades (7) + six pitches, the wanted trait highlighted');
ok(/Doctore/.test(o.c.proj)&&/beside|champion/.test(o.c.champ),'projections on the Yard and champion pitches '+JSON.stringify([o.c.proj,o.c.champ]));
ok(o.c.got===o.c.expect&&o.c.left===1&&o.c.again,'the pitch lands, uses a weekly pitch, one per recruit a week '+JSON.stringify([o.c.got,o.c.left,o.c.again]));
/* ---------- 8 · the truth card + rivals ---------- */
o.t=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));const w=W_(),m=me();const r={};const g=GD;m.coin=999;g.inj=null;
  const before=rec98Snap(g);signGlad(g,askWage(g),8,0,false);await W8(500);r.mine=rec98Mine(g);r.snap=!!(g.truth98&&g.truth98.s&&g.truth98.s.spd===before.spd&&g.truth98.s.ovr);
  r.rows=(()=>{const d=document.createElement('div');d.innerHTML=rec98TruthHTML(g);return d.querySelectorAll('.tr98r').length})();r.shown=!!document.querySelector('#signCard .tr98');
  document.querySelectorAll('[data-sgclose]').forEach(x=>x.click());
  const R=w.mgrs.find(x=>!x.isPlayer&&!x.dead);const f=freeAgents().slice(0,30);const est=f.map(x=>rec98Rival(R,x)-effOvr(x));r.rv=[Math.max(...est.map(Math.abs)),est.some(x=>x!==0),rec98Rival(R,f[0])===rec98Rival(R,f[0])];
  return r});
ok(o.t.mine&&o.t.snap&&o.t.rows===6&&o.t.shown,'the truth card on signing '+JSON.stringify(o.t));ok(o.t.rv[0]<=25&&o.t.rv[1]&&o.t.rv[2],'rivals court with estimates '+JSON.stringify(o.t.rv));
/* ---------- 10 · levels 4 and 5 are earned ---------- */
o.e4=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));newWorld({type:'pre',key:'crispus'});const w=W_(),m=me();const r={};const lv=()=>Object.fromEntries(council83(w).map(a=>[a.k,a.lv]));
  r.start=lv();const S=adv98S(w);m.fame=10;
adv98Check(w,m);r.low=lv();
  /* recruiter L4: 5 graded signings + fame 50 */
  S.sgn=5;m.fame=49;adv98Check(w,m);r.fame49=lv().recruiter;m.fame=50;adv98Check(w,m);r.l4=lv().recruiter;
  const n1=(w.letters||[]).filter(L=>/^adv98-recruiter-4/.test(L.key)).length;adv98Check(w,m);adv98Check(w,m);r.letters=[n1,(w.letters||[]).filter(L=>/^adv98-recruiter-4/.test(L.key)).length];
  S.best=80;m.fame=70;adv98Check(w,m);r.l5=lv().recruiter;
  /* others */
  S.bands=10;m.fame=70;S.healed=8;S.topCoin=1500;S.top4=1;S.morBest=70;adv98Check(w,m);r.o4=lv();
  S.healed=20;S.clean=1;S.rich=1;S.won=1;S.calm=12;S.best=85;adv98Check(w,m);r.o5=lv();
  MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(500);r.ev=[...document.querySelectorAll('#mgrBody .c98ev')].length;
  /* the card shows progress for an advisor below the target */
  council83(w).find(x=>x.k==='clerk').lv=3;S.topCoin=900;MGR_REDRAW();await W8(400);r.prog=(document.querySelector('#mgrBody [data-c83="clerk"] .c98ev')||{}).textContent;
  /* a level bought above 3 by coin is never taken away */
  const w2=JSON.parse(JSON.stringify(w));w2.ver='0.97';delete w2.adv98;council83(w2).find(x=>x.k==='doctore').lv=5;council83(w2).find(x=>x.k==='clerk').lv=4;const prev=MGR.world;MGR.world=w2;try{migrateWorld(w2);adv98Check(w2,w2.mgrs.find(x=>x.isPlayer));r.mig=[council83(w2).find(x=>x.k==='doctore').lv,council83(w2).find(x=>x.k==='clerk').lv,w2.adv98&&w2.adv98.sgn]}finally{MGR.world=prev}
  /* rivals: own council, start by fame, deterministic, trains with coin */
  const rb=ADV98R.recBonus;const R=w.mgrs.filter(x=>!x.isPlayer);const lvs=R.map(x=>advLvM(x,'recruiter'));r.rv=[Math.min(...lvs),Math.max(...lvs)];
  const x=R[0];x.adv98=null;x.fame=60;r.f60b=advLvM(x,'recruiter');ADV98R.recBonus=0;x.adv98=null;x.fame=60;r.f60=advLvM(x,'recruiter');x.adv98=null;x.fame=20;r.f20=advLvM(x,'recruiter');r.bonus=[rb,Math.min(5,3+rb)];
  x.coin=1000;adv98R(x).lv.recruiter=1;let up=0;for(let i=0;i<40;i++){w.week++;adv98RivalWeek(w)}r.rtrain=[adv98R(x).lv.recruiter,adv98R(x).lv.recruiter<=3||x.fame>=50,1000-x.coin>0];
  x.adv98=null;x.fame=20;adv98R(x);x.coin=10;for(let i=0;i<10;i++){w.week++;adv98RivalWeek(w)}r.poor=adv98R(x).lv.recruiter;
  const y=R[1];y.adv98=null;y.fame=20;y.coin=1e5;adv98R(y).lv.consilium=3;y.top4=0;adv98R(y).top4=1;w.week++;adv98RivalWeek(w);r.rearn=adv98R(y).lv.consilium;
  /* level 3 is earned: every advisor at 2 with its lighter condition (forced counters) */
  {const w3=newWorld({type:'custom',mgr:{name:'T',ludus:'L3',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'easy'}});const W3=W_(),m3=me();const S3=adv98S(W3);const l3=()=>Object.fromEntries(council83(W3).map(a=>[a.k,a.lv]));r.l3a=l3();
    S3.sgn=1;S3.bands=3;S3.healed=2;S3.topCoin=799;S3.mor3=59;S3.seaW=5;S3.top8=0;adv98Check(W3,m3);r.l3b=l3();
    S3.sgn=2;adv98Check(W3,m3);r.l3c=l3();S3.bands=4;S3.healed=3;S3.topCoin=800;S3.mor3=60;S3.top8=1;adv98Check(W3,m3);r.l3d=l3();
    r.l3n=[...new Set((W3.letters||[]).map(L=>L.key))].filter(k=>/^adv98-.*-3$/.test(k)).length;adv98Check(W3,m3);r.l3n2=[...new Set((W3.letters||[]).map(L=>L.key))].filter(k=>/^adv98-.*-3$/.test(k)).length;
    r.l3rec=(W3.letters||[]).filter(L=>/^adv98-recruiter-3/.test(L.key)).length;
    /* bouts won in a season alone */
    for(const a of council83(W3))a.lv=2;S3.top8=0;S3.seaW=6;adv98Check(W3,m3);r.l3w=l3().consilium}
  newWorld({type:'pre',key:'crispus'});
  ADV98R.recBonus=rb;r.line=adv98RLine(x).includes('Recruiter');r.dices=typeof Math.random==='function';return r});
ok(o.e4.start.recruiter===3&&o.e4.low.recruiter===3,'a taken-over house at 3 stays 3 without deeds '+JSON.stringify(o.e4.low));
ok(o.e4.fame49===3&&o.e4.l4===4,'Recruiter L4: 5 graded signings + fame 50 '+JSON.stringify([o.e4.fame49,o.e4.l4]));ok(o.e4.letters[0]===1&&o.e4.letters[1]===1,'the level-up letter is sent once');
ok(o.e4.l5===5,'Recruiter L5: a signing at 80 + fame 70');ok(Object.entries(o.e4.o4).every(([k,v])=>v>=4),'every advisor reaches 4 on its conditions '+JSON.stringify(o.e4.o4));ok(Object.values(o.e4.o5).every(v=>v===5),'every advisor reaches 5 '+JSON.stringify(o.e4.o5));
ok(/Level 4/.test(o.e4.prog||'')&&/900\/1500/.test(o.e4.prog||''),'the council card shows progress '+o.e4.prog);
ok(o.e4.mig[0]===5&&o.e4.mig[1]===4&&o.e4.mig[2]===0,'migration keeps coin-bought levels above 3, counters start at 0 '+JSON.stringify(o.e4.mig));
ok(o.e4.rv[0]>=1&&o.e4.rv[1]<=5&&o.e4.f60b===o.e4.bonus[1]&&o.e4.f60===3&&o.e4.f20===1,'rival councils start by fame '+JSON.stringify([o.e4.rv,o.e4.f60,o.e4.f20]));
ok(o.e4.rtrain[0]>=2&&o.e4.rtrain[0]<=3&&o.e4.rtrain[2]&&o.e4.poor===1&&o.e4.rearn>=4&&o.e4.line,'rivals train with spare coin to 2 (3 only by deeds), a poor house cannot, deeds earn 4 '+JSON.stringify([o.e4.rtrain,o.e4.poor,o.e4.rearn]));
ok(Object.values(o.e4.l3a).every(v=>v===2),'easy start: every advisor at 2 '+JSON.stringify(o.e4.l3a));
ok(Object.values(o.e4.l3b).every(v=>v===2),'level 3 waits for its conditions '+JSON.stringify(o.e4.l3b));
ok(o.e4.l3c.recruiter===3&&o.e4.l3c.doctore===2,'Recruiter L3 on 2 graded signings, others still 2 '+JSON.stringify(o.e4.l3c));
ok(Object.values(o.e4.l3d).every(v=>v===3),'every advisor reaches 3 on its conditions (Consilium via a top-8 finish) '+JSON.stringify(o.e4.l3d));
ok(o.e4.l3n===6&&o.e4.l3n2===6&&o.e4.l3rec===1,'the level-3 letter is sent once per advisor');ok(o.e4.l3w===3,'Consilium L3 also on 6 bouts won in a season');
/* ---------- 9 · migration of an old save ---------- */
o.m=await pg.evaluate(()=>{const w0=W_();const w=JSON.parse(JSON.stringify(w0));w.ver='0.97';for(const a of w.council83)delete a.lv;const fa=w.glads.filter(g=>!g.contract&&g.alive!==false);
  for(const g of fa)delete g.sc98;fa[0].scout=1;fa[1].scout=2;fa[2].scout=3;fa[3].scout=0;fa[3].watchK=[[STATS[0][1],60,70]];
  const prev=MGR.world;MGR.world=w;let r={};try{migrateWorld(w);r.lv=w.council83.map(a=>a.lv);r.p=[0,1,2,3].map(i=>fa[i].sc98?fa[i].sc98.p:null);r.sc=[fa[0].scout,fa[1].scout,fa[2].scout,fa[3].scout];r.dirty=!!w._rec98dirty;r.ver=w.ver}finally{MGR.world=prev}return r});
ok(o.m.lv.every(x=>x===3),'migration: the taken-over house keeps level 3 '+JSON.stringify(o.m.lv));
ok(P(o.m.p[0],{spd:1,str:1,int:1,lck:1,cha:1})&&P(o.m.p[1],{spd:2,str:2})&&P(o.m.p[2],{spd:3,cha:3})&&o.m.p[3]&&o.m.p[3].spd===1&&o.m.p[3].str===0,'migration: old scouting → precisions '+JSON.stringify(o.m.p));
ok(o.m.sc[0]===2&&o.m.sc[2]===3&&o.m.dirty,'migration: graded fighters revealed, marked to save once '+JSON.stringify(o.m));
if(process.env.SHOT98){await pg.screenshot({path:process.env.SHOT98+'/tv98d.png'})}
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

/* tv100rc — v1.0 RECRUITING DOSSIER + SIGNING DAY (299-v100recruit): the list column (rows ★ · face · name · class · grade · interest,
   the toolbar above, the board below), the dossier head (portrait fresco, Stats Tablet rows with "?" before scouting, the personality
   lock naming the next action), the three big steps; ① a scout action card spends the recruiter's hours and sharpens the grades,
   ✓ this week, ★ ADVISED; ② house grades + six pitch cards (a pitch lands, one a week), feast/gift and the three private notes keep
   their own buttons, suitors + "Signs at ~N"; ③ the contract (slider) + the contract tablet that follows the slider live, the offer
   signs him; SIGNING DAY: the seal, a gem / as scouted / a dud by the truth, skippable (click → last frame), static under Reduce
   motion, Esc closes; 390 px: no sideways scroll on every step + the signing card; the kill switch flavius_recruit100off=1 (the v0.99
   card and the small signing card); no new 00c errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const open=async(W,H,ls)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');for(const k in o||{})localStorage.setItem(k,o[k])},ls||{});
  await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
    newWorld({type:'custom',mgr:{name:'T',ludus:'Ludus Testi',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});MGR.view=null;
    const w=W_(),m=me();w.welc99=1;m.fame=Math.max(m.fame,60);m.coin=900;window.MARK=ERR92.n;window.FALEN=freeAgents().length;
    window.FA=freeAgents().filter(x=>m.fame>=reqFame(x)&&!x.inj).sort((a,b)=>effOvr(b)-effOvr(a));FA.slice(0,3).forEach(g=>g.favd=true);
    window.SEL=async(g,step)=>{MGR.tab='recruit';MGR.sel=g.id;MGR.recFor=g.id;MGR.recStep=step;MGR_REDRAW();await W8(400)}});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
/* ---------- desktop: list, head, scout ---------- */
const pg=await open(1440,900);
const A=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const g=FA[4];await SEL(g,1);const w=W_();const r={};const q=s=>document.querySelector('#mgrBody '+s);
  const grid=q('.mgrid.rc100g');const list=q('#recTable'),card=q('.card2.rc100');r.grid=!!grid&&!!card&&card.dataset.rc100card===g.id;
  r.cols=list&&card?[Math.round(list.getBoundingClientRect().width),Math.round(card.getBoundingClientRect().width)]:null;r.narrow=!!r.cols&&r.cols[0]<=480&&r.cols[1]>r.cols[0]*1.2; /* v1.01 (317 M5): the list column is wider on big screens */
  r.tb=!!q('.rtb85.rc1tb')&&!grid.contains(q('.rtb85'));r.board=!!q('.pipeline.rc1board')&&!grid.contains(q('.pipeline'));
  const row=q('#recTable tr[data-mg="sel"]');r.row=!!row&&!!row.querySelector('.rc1cl')&&!!row.querySelector('.odds')&&Math.round(row.getBoundingClientRect().height)<=40&&getComputedStyle(row.querySelector('.fitchip')||row).display!==undefined;
  r.rowHidden=row?['td:nth-child(3)','td:nth-child(5)'].every(s=>{const e=row.querySelector(s);return !e||getComputedStyle(e).display!=='none'}):false; /* v1.01 (317 M5): Fit + Ask show at 1251px+ */
  /* head */
  r.por=!!card.querySelector('.rc1prof .rc1por .portrait');r.rows=card.querySelectorAll('.rc1grades .gs98 .gb98').length;r.q=card.querySelectorAll('.gs98 .gb98[data-p="0"]').length;
  r.qText=[...card.querySelectorAll('.gs98 .gb98:not(.ov98) b')].map(e=>e.textContent).join('');r.nodigit=![...card.querySelectorAll('.gs98 .gb98 b')].some(e=>/\d/.test(e.textContent));
  const lk=card.querySelector('.rc1pers .pe98.lock');r.lock=!!lk&&/Next:/.test(lk.textContent);r.steps=[...card.querySelectorAll('.rsteps.rc1steps .rstep.rc1st')].map(b=>b.className.match(/scout|court|offer/)[0]+(b.classList.contains('cur')?'*':''));
  /* scout: an action card */
  const cards=[...card.querySelectorAll('.rc1acts .btn.rc1act[data-rec98a]')];r.acts=cards.length;r.mur=cards.every(c=>!!c.querySelector('.rc1fr'));r.adv=!!card.querySelector('.rc1act.adv74 .star85');
  r.learn=card.querySelectorAll('.rc1learn .rc1lg').length;const l0=rec98Left(w);
  card.querySelector('.rc1act[data-rec98a="watch"]').click();await W8(450);r.spent=l0-rec98Left(w);const K=rec98K(g);r.p=[K.p.spd,K.p.str];
  const c2=q('.card2.rc100');r.done=!!c2.querySelector('.rc1act[data-rec98a="watch"].done .rc1done')&&c2.querySelector('.rc1act[data-rec98a="watch"]').disabled;
  r.gr=[...c2.querySelectorAll('.gs98 .gb98[data-gb98="spd"],.gs98 .gb98[data-gb98="str"]')].map(e=>e.dataset.p+e.querySelector('b').textContent);
  r.hrs=/\d+ of \d+ left/.test((c2.querySelector('.rc1hrs')||{}).textContent||'');r.pips=c2.querySelectorAll('.rc1pips i.him').length===2;
  r.learned=/Speed|Strength/.test((c2.querySelector('.rc1lg')||{}).textContent||'');
  r.ban=!!document.querySelector('.roomhd.b73-recruit img.rc1ban');
  return r});
ok(A.grid&&A.narrow&&A.tb&&A.board,'list column | dossier, toolbar above, board below '+JSON.stringify(A.cols));
ok(A.row&&A.rowHidden,'list rows one line with class + grade, Fit/Ask folded');
ok(A.por&&A.rows===6&&A.q===5&&A.qText==='?????'&&A.nodigit&&A.lock,'head: portrait, six tablet rows, "?" before scouting, lock names the next action '+JSON.stringify(A));
ok(JSON.stringify(A.steps)==='["scout*","court","offer"]','three big steps, Scout current '+JSON.stringify(A.steps));
ok(A.acts===5&&A.mur&&A.adv&&A.learn===2,'five scout cards with murals, ★ ADVISED, learned + street panels');
ok(A.spent===2&&A.p[0]===2&&A.p[1]===2&&A.done&&A.gr.every(x=>/^2[A-F]/.test(x))&&A.hrs&&A.pips&&A.learned,'watch through the card: 2 h, Speed+Strength fair, ✓ this week, pips on him '+JSON.stringify(A));
ok(A.ban,'the Recruiting banner wears the forum mural');
/* ---------- court ---------- */
const C=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const g=FA[5];const m=me();rec98Act(g,'watch');rec98Act(g,'cup');rec98Act(g,'study');await SEL(g,2);const r={};const card=document.querySelector('#mgrBody .card2.rc100');
  r.pers=!!card.querySelector('.rc1pers .pe98:not(.lock) .pe98r');r.hg=card.querySelectorAll('.rc1hg .hg98c').length;r.pits=card.querySelectorAll('.rc1pg .btn.rc1pit[data-rec98p]').length;
  r.wo=card.querySelectorAll('.rc1won .btn.rc1wo[data-mg="visit"],.rc1won .btn.rc1wo[data-mg="gift2"]').length;r.notes=card.querySelectorAll('.rc1notes .btn.rc1nr[data-rec74^="note:"]').length;
  r.suit=card.querySelectorAll('.rc1suit .rc1su').length>=3&&/Signs at/.test(card.querySelector('.rc1need').textContent);r.fit=card.querySelectorAll('.rc1nr .fit').length===3;
  r.court=!!card.querySelector('.rc1st.court.cur');
  g.interest[m.id]=10;const i0=interestOf(g,m),p0=pitchesLeft();const pb=card.querySelector('.rc1pit[data-rec98p]:not([disabled])');r.gainTxt=/[+−-]\d+/.test(pb.querySelector('.rc1gain').textContent);
  pb.click();await W8(400);r.got=interestOf(g,m)-i0;r.left=p0-pitchesLeft();r.again=!!(document.querySelector(`#mgrBody .rc1pit[data-rec98p="${pb.dataset.rec98p}"]`)||{}).disabled;
  const gift=document.querySelector('#mgrBody .rc1wo[data-mg="gift2"]:not([disabled])');const i1=interestOf(g,m),c1=m.coin;if(gift){gift.click();await W8(400)}r.gift=!gift||(interestOf(g,m)>i1&&m.coin<c1);
  return r});
ok(C.court&&C.pers&&C.hg===7&&C.pits===6&&C.wo===2&&C.notes===3&&C.suit&&C.fit,'court: house grades, six pitch cards, feast/gift, three notes with fit, suitors + Signs at '+JSON.stringify(C));
ok(C.gainTxt&&C.got>0&&C.left===1&&C.again&&C.gift,'a pitch card lands (one a week), the gift card still works '+JSON.stringify(C));
/* ---------- offer + tablet + signing ---------- */
const O=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const g=FA[6];const m=me();rec98Act(g,'watch');rec98Act(g,'cup');rec98Act(g,'study');g.interest[m.id]=110;m.coin=900;await SEL(g,3);await W8(400);const r={};
  const card=document.querySelector('#mgrBody .card2.rc100');r.contract=!!card.querySelector('.rc1off #ofWage')&&!!card.querySelector('.rc1off #ofMeter')&&!!card.querySelector('.rc1off [data-mg="offer"]');
  r.tab=!!card.querySelector('.rc1tab .rc1wax [data-rc100tab]')&&card.querySelectorAll('.rc1seal').length===2&&/engages/.test(card.querySelector('.rc1party').textContent);
  const sl=document.getElementById('ofWage');const v=Math.min(+sl.max,Math.ceil(askWage(g)*1.3));sl.value=v;sl.dispatchEvent(new Event('input',{bubbles:true}));await W8(100);
  r.live=new RegExp('(^|\\D)'+v+' coin a week').test(card.querySelector('[data-rc100tab]').textContent);r.v=v;
  document.getElementById('ofWeeks').value='12';document.getElementById('ofWeeks').dispatchEvent(new Event('change',{bubbles:true}));await W8(100);r.live2=/× 12 weeks/.test(card.querySelector('[data-rc100tab]').textContent);
  const ok0=offerVerdict(g,v,12,0,false).ok;r.ok0=ok0;card.querySelector('.rc1off [data-mg="offer"]').click();await W8(900);r.signed=!!(g.contract&&g.contract.mgr===m.id);
  const sc=document.getElementById('signCard');r.sg=!!sc&&sc.classList.contains('sg100')&&!!sc.querySelector('.sgbox .sgface .portrait')&&!!sc.querySelector('.tr98')&&sc.querySelectorAll('.sg1rw').length===6;
  r.kind=sc?(sc.className.match(/s-(gem|fair|dud)/)||[])[1]:null;const V=sg100Verdict(g);r.match=V&&V.k===r.kind;
  r.pre=!!sc&&(sc.classList.contains('pre')||sc.classList.contains('go'));r.realN=sc?[...sc.querySelectorAll('.sg1rw .rl small')].every(e=>/^\d+$/.test(e.textContent)):false;
  /* skip: a click on the card → the last frame */
  sc.querySelector('.sg1card').click();await W8(80);r.still=sc.classList.contains('go')&&sc.classList.contains('still');
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await W8(80);r.esc=!document.getElementById('signCard');
  return r});
ok(O.contract&&O.tab,'offer: the contract panel + the contract tablet (parties, seals) '+JSON.stringify(O));
ok(O.live&&O.live2,'the tablet follows the slider and the weeks live');
ok(O.signed&&O.sg&&O.match&&O.pre&&O.realN,'the offer signs him; Signing Day shows the truth (real grades + numbers) and the verdict by the truth '+JSON.stringify(O));
ok(O.still&&O.esc,'a click skips to the last frame, Esc closes');
/* ---------- gem / fair / dud by the truth, animated + static ---------- */
const V=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const m=me();m.coin=999;const ORD=['F','D','C','C+','B','B+','A','A+'];const out={};const used=new Set();
  for(const [k,d] of [['gem',-2],['fair',0],['dud',2],['up1',-1],['dn1',1]]){const need={gem:[2,7],dud:[0,5],fair:[0,7],up1:[1,7],dn1:[0,6]}[k];const rsv=new Set([0,1,2,3,4,5,6,14,16].map(i=>FA[i].id));const inR=x=>ORD.indexOf(trait96Grade(effOvr(x)))>=need[0]&&ORD.indexOf(trait96Grade(effOvr(x)))<=need[1];const g=freeAgents().find(x=>!x.contract&&!x.inj&&m.fame>=reqFame(x)&&!rsv.has(x.id)&&!used.has(x.id)&&inR(x))||(m.fame=Math.max(m.fame,999),freeAgents().find(x=>!x.contract&&!x.inj&&!used.has(x.id)&&inR(x)));used.add(g.id);rec98Act(g,'watch');rec98Act(g,'cup');g.interest[m.id]=110;signGlad(g,askWage(g),8,0,false);
    const st=gStats(g);const sh=v=>ORD[Math.max(0,Math.min(7,ORD.indexOf(trait96Grade(v))+d))];const s={};for(const [x] of STATS)s[x]=sh(st[x]);s.ovr=sh(effOvr(g));g.truth98.s=s;const dd=ORD.indexOf(trait96Grade(effOvr(g)))-ORD.indexOf(s.ovr);await W8(700);
    const sc=document.getElementById('signCard');out[k]={dd,cls:sc&&(sc.className.match(/s-(gem|fair|dud)/)||[])[1],big:sc&&sc.querySelector('.sg1verdict .big').textContent,
      lau:!!(sc&&sc.querySelector('.sg1lau')),crack:!!(sc&&sc.querySelector('.sg1crack')),seal:!!(sc&&sc.querySelector('[data-sg100="seal"]'))};
    await W8(1500);out[k].go=!!sc&&sc.classList.contains('go');out[k].lit=k!=='gem'||getComputedStyle(sc.querySelector('.sg1verdict')).opacity!=='0';
    if(sc)sc.querySelector('[data-sgclose].primary').click();await W8(60);out[k].closed=!document.getElementById('signCard')}
  return out});
ok(V.gem.cls==='gem'&&/gem/i.test(V.gem.big)&&V.fair.cls==='fair'&&V.dud.cls==='dud'&&/dud/i.test(V.dud.big),'gem / as scouted / dud follow the truth '+JSON.stringify(V));
ok(V.gem.dd>=2&&V.dud.dd<=-2&&V.up1.dd===1&&V.dn1.dd===-1&&V.up1.cls==='fair'&&V.dn1.cls==='fair','C3b: a +1 / −1 ladder step is fair, only a whole grade (two steps) is gem / dud '+JSON.stringify([V.up1,V.dn1]));
ok(['gem','fair','dud','up1','dn1'].every(k=>V[k].go&&V[k].closed&&V[k].seal),'the seal breaks by itself, Welcome closes');
/* ---------- Reduce motion: the static card ---------- */
const R=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const m=me();SETTINGS.calm=true;const g=FA[14];rec98Act(g,'watch');g.interest[m.id]=110;signGlad(g,askWage(g),8,0,false);await W8(300);
  const sc=document.getElementById('signCard');const r={rm:!!sc&&sc.classList.contains('rm')&&sc.classList.contains('go')&&!sc.classList.contains('pre')};
  const inn=sc&&sc.querySelector('.sg1t.real .in');r.flat=!!inn&&getComputedStyle(inn).transform==='none';const f=sc&&sc.querySelector('.sg1t.real .f');r.noSeal=!!f&&getComputedStyle(f).display==='none';
  r.verdict=!!sc&&getComputedStyle(sc.querySelector('.sg1verdict')).opacity==='1';r.anim=sc?[...sc.querySelectorAll('*')].every(e=>{const c=getComputedStyle(e);return c.animationName==='none'||c.animationPlayState==='paused'}):false;
  if(sc)sc.querySelector('[data-sgclose].primary').click();SETTINGS.calm=false;r.errs=errNew92(MARK);return r});
ok(R.rm&&R.flat&&R.noSeal&&R.verdict&&R.anim,'Reduce motion: the static card (no flips, no burst), the verdict at once '+JSON.stringify(R));
ok(!R.errs.length,'no new 00c errors '+JSON.stringify(R.errs));
/* ---------- C2b: the steps are tabs, one section at a time, fits 900 px tall ---------- */
const TB=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const m=me();const g=FA[16];rec98Act(g,'watch');rec98Act(g,'cup');rec98Act(g,'study');g.interest[m.id]=110;m.coin=900;
  const r={sec:[],h:[],tabs:[]};const sel='#mgrBody .card2.rc100';const sections=c=>({scout:!!c.querySelector('.rc1acts'),court:!!c.querySelector('.rc1pg'),offer:!!c.querySelector('#ofWage')});
  MGR.tab='recruit';MGR.sel=g.id;MGR.recFor=g.id;delete MGR.recStep;MGR_REDRAW();await W8(400);let c=document.querySelector(sel);
  r.def=c.querySelector('.rc1st.cur').dataset.recstep+'/'+recStepNow(g,m);r.tl=c.querySelector('.rsteps').getAttribute('role')==='tablist'&&c.querySelectorAll('.rc1st[role=tab]').length===3;
  for(const s of [1,2,3]){c.querySelector('.rc1st[data-recstep="'+s+'"]').click();await W8(350);c=document.querySelector(sel);const S=sections(c);r.sec.push(Object.keys(S).filter(k=>S[k]).join('+'));
    r.tabs.push(c.querySelector('.rc1st.cur').dataset.recstep+'/'+MGR.recStep);
    c.scrollIntoView({block:'start'});await W8(100);const q=c.getBoundingClientRect();r.h.push(Math.round(q.height));r.fit=(r.fit!==false)&&q.height<=innerHeight-10&&q.top>=-1&&q.bottom<=innerHeight;
    MGR_REDRAW();await W8(350);c=document.querySelector(sel);r.keep=(r.keep!==false)&&+c.querySelector('.rc1st.cur').dataset.recstep===s}
  /* offer inputs still live after switching */
  c.querySelector('.rc1st[data-recstep="3"]').click();await W8(350);c=document.querySelector(sel);const sl=document.getElementById('ofWage');const v=Math.min(+sl.max,Math.ceil(askWage(g)*1.2));sl.value=v;sl.dispatchEvent(new Event('input',{bubbles:true}));await W8(100);
  r.live=new RegExp('(^|\\D)'+v+' coin a week').test(c.querySelector('[data-rc100tab]').textContent)&&!!document.getElementById('ofWeeks')&&!!document.getElementById('ofPledge');return r});
ok(TB.def&&TB.def.split('/')[0]===TB.def.split('/')[1]&&TB.tl,'tabs: default = the recruit\'s current step, tablist roles '+JSON.stringify(TB));
ok(JSON.stringify(TB.sec)==='["scout","court","offer"]'&&TB.tabs.every(x=>x.split('/')[0]===x.split('/')[1]),'only the chosen step\'s section shows '+JSON.stringify(TB));
ok(TB.keep&&TB.live,'the tab survives MGR_REDRAW; offer inputs + tablet still live after switching');
ok(TB.fit,'each tab fits one 1440x900 screen (card scrolled to the top, no inner scroll) '+JSON.stringify(TB.h));
await pg.close();
/* ---------- 390 px ---------- */
const pp=await open(390,844);
const P=await ev(pp,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const g=FA[4];const m=me();const r={sx:[]};rec98Act(g,'watch');rec98Act(g,'cup');rec98Act(g,'study');
  for(const s of [1,2,3]){await SEL(g,s);await W8(200);r.sx.push(document.documentElement.scrollWidth-innerWidth);const c=document.querySelector('#mgrBody .card2.rc100');r['w'+s]=c?Math.round(c.getBoundingClientRect().right):999}
  const st=document.querySelector('#mgrBody .rsteps.rc1steps');r.sticky=!!st&&getComputedStyle(st).position==='sticky';
  g.interest[m.id]=110;m.coin=999;signGlad(g,askWage(g),8,0,false);await W8(400);const sc=document.querySelector('#signCard .sg1card');r.sg=sc?Math.round(sc.getBoundingClientRect().right):999;r.sgx=document.documentElement.scrollWidth-innerWidth;
  document.querySelector('#signCard [data-sgclose].primary').click();return r});
ok(P.sx.every(x=>x<=1)&&P.w1<=390&&P.w2<=390&&P.w3<=390&&P.sticky&&P.sg<=392&&P.sgx<=1,'390: every step and the signing card fit, sticky steps '+JSON.stringify(P));
await pp.close();
/* ---------- kill switch ---------- */
const po=await open(1440,900,{flavius_recruit100off:'1'});
const Z=await ev(po,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const g=FA[4];const m=me();await SEL(g,1);const r={};r.card=!document.querySelector('#mgrBody .card2.rc100')&&!!document.querySelector('#mgrBody .gs98 .gb98:not(.rc1g)');
  r.grid=!document.querySelector('#mgrBody .mgrid.rc100g');r.ban=!document.querySelector('img.rc1ban');
  rec98Act(g,'watch');g.interest[m.id]=110;m.coin=999;signGlad(g,askWage(g),8,0,false);await W8(500);const sc=document.getElementById('signCard');r.old=!!sc&&!sc.classList.contains('sg100')&&!!sc.querySelector('.tr98');
  if(sc)sc.remove();return r});
ok(Object.values(Z).every(Boolean),'kill switch → the v0.99 card, list and small signing card '+JSON.stringify(Z));await po.close();
console.log(JSON.stringify({A,C,O,V,R,P,Z}));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

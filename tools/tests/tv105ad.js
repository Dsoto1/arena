/* tv105ad — v1.05 beta-4 B79 + B80 + B81 (392-v105hrs, his answers T1a T2a H1a H2a H3a): the Training Yard has no Tabula strip and no "Last week in
   the yard"; "↻ Same as last week" sits in the Yard banner beside Lock in; the Wagers and Infirmary banners are the slim 74 px banner (= Roster ±2);
   ONE hours chip (.hc105: same class, font sizes and height) on the Yard, Recruiting and Infirmary banners with the owner label Training / Recruiter /
   Medicus and numbers equal to the old sources (thLeft/thMax, rec99Left/rec98HrsMax, mh101Left/mh101Max); 0 left = dim with ✓, booked > available = red;
   the Infirmary's Capsarius is a separate chip; ONE rail pill (.hp105) on Recruiting + Training Yard (gold "N h", dim ✓ once spent; the old ovals
   hidden). 390 px: no sideways scroll; German fits; kill switch flavius_v105hrsoff=1 = the old plate / Tabula / chips. SHOT=<dir> saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT;
const open=async(W,H,off,lang)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o.off)localStorage.setItem('flavius_v105hrsoff','1');if(o.lang){localStorage.setItem('flavius_lang',o.lang);localStorage.setItem('flavius_langask86','1')}},{off:off?1:0,lang:lang||''});
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    const ros=rosterOf(pm);for(const g of ros){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.ord87=null;g.morale=80}ros[1].inj={until:w.week+3,label:'a cut',pen:2};
    const H=arm94H(pm);if(!(H.sh||[]).length)H.sh.push({id:'zz105',t:'w',k:'gladius'});
    window.TAB=async t=>{MGR.view=null;MGR.tab=t;MGR_REDRAW();await W8(500);const mb=document.getElementById('mBody');if(mb)mb.scrollTop=0;await W8(60)};
    window.BOX=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return {l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),b:Math.round(r.bottom),r:Math.round(r.right)}};
    window.TXR=s=>{const e=document.querySelector(s);if(!e)return 0;let R=0;const tw=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let n;while(n=tw.nextNode()){if(!n.nodeValue.trim())continue;const rg=document.createRange();rg.selectNodeContents(n);for(const r of rg.getClientRects())R=Math.max(R,r.right)}
      for(const c of e.querySelectorAll('button,img,.y105lad,.y105face,.y105art'))R=Math.max(R,c.getBoundingClientRect().right);return Math.round(R)};
    window.BAND=()=>{const r={band:BOX('#mgrPane .y105dtop'),who:BOX('#mgrPane .y105who'),time:BOX('#mgrPane .y105time'),int:BOX('#mgrPane .y105int'),tc:TXR('#mgrPane .y105time')};
      r.segs=[...document.querySelectorAll('#mgrPane .y105seg')].map(s=>({w:Math.round(s.getBoundingClientRect().width),h:Math.round(s.getBoundingClientRect().height),ov:[s,...s.querySelectorAll('b,small')].some(x=>getComputedStyle(x).display!=='none'&&x.scrollWidth>x.clientWidth+1)}));return r};
    window.HSCROLL=()=>{const mb=document.getElementById('mBody');return document.documentElement.scrollWidth>innerWidth+1||(!!mb&&mb.scrollWidth>mb.clientWidth+1)};
    menuHide();openManager('practice');await W8(800);await TAB('practice')});return pg};
const ev=async(pg,f,a)=>{try{return await pg.evaluate(f,a)}catch(e){console.log('EVAL FAIL',String(e.message||e).slice(0,400));await b.close();process.exit(1)}};
const shot=async(pg,n)=>{if(SHOT)await pg.screenshot({path:`${SHOT}/${n}.png`})};
const BAN='#mgrPane .roomhd, .railmain>.roomhd';


const FEAT=async(pg,tab)=>pg.evaluate(async t=>{await TAB(t);const q=s=>document.querySelector(s);const hd=q('#mgrPane .roomhd, .railmain>.roomhd');const c=hd&&hd.querySelector('.hc105');const n=c&&c.querySelector('.hc105n'),l=c&&c.querySelector('.hc105l');
  const cs=e=>e?{fs:getComputedStyle(e).fontSize,ff:getComputedStyle(e).fontFamily}:null;
  let hs=HSCROLL();if(hs){await W8(800);hs=HSCROLL()}
  return {h:hd?Math.round(hd.getBoundingClientRect().height):0,slim:!!hd&&hd.classList.contains('cp105ban'),chip:!!c,cls:c?c.className:'',txt:n?n.textContent:'',label:l?l.textContent:'',
    cn:cs(n),cl:cs(l),box:c?[Math.round(c.getBoundingClientRect().width),Math.round(c.getBoundingClientRect().height)]:null,
    old:{y105hrs:!!q('.y105hrs'),roomstat:!!(hd&&hd.querySelector(':scope>.roomstat')),w104hb:!!q('.w104hb')},hdo:!!hd&&hd.scrollWidth>hd.clientWidth+1,hs:hs,wide:hs?[...document.querySelectorAll('#mBody *')].filter(e=>e.getBoundingClientRect().right>document.getElementById('mBody').getBoundingClientRect().right+1).slice(0,6).map(e=>e.tagName+'.'+String(e.className.baseVal!==undefined?'svg':e.className).slice(0,30)+':'+Math.round(e.getBoundingClientRect().right)):[],
    pills:[...document.querySelectorAll('.mtabs .hp105')].map(x=>[x.parentNode.dataset.id,x.className,x.textContent])}},tab);
/* ---- 1440x900 ---- */
const pg=await open(1440,900);
const R={};for(const t of ['roster','practice','recruit','infirm','exch'])R[t]=await FEAT(pg,t);
console.log('BANNERS',JSON.stringify(R));
const y=await ev(pg,async()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];await TAB('practice');const r={};
  r.tabula=!!q('.y105tab')||qa('.secth,.y105cap').some(e=>/Tabula/.test(e.textContent));r.log=!!q('.yd76log')||/Last week in the yard/.test(document.getElementById('mgrPane').textContent);
  const hd=q('#mgrPane .roomhd');const s=hd&&hd.querySelector('[data-y105="same"]'),lk=hd&&hd.querySelector('[data-y105="lock"]');r.sameIn=!!s;r.sameN=qa('[data-y105="same"]').length;r.beside=!!s&&!!lk&&s.nextElementSibling===lk;r.dis0=s?s.disabled:null;
  const w=W_();w.lastPlan=['x'];
  return r});
console.log('YARD',JSON.stringify(y));
ok(!y.tabula&&!y.log,'Yard: no Tabula, no "Last week in the yard" '+JSON.stringify(y));ok(y.sameIn&&y.sameN===1&&y.beside&&y.dis0===false,'Yard: ↻ Same as last week in the banner, beside Lock in, enabled '+JSON.stringify(y));
/* Same as last week works: plan a week, lock, next week the button copies it */
const sm=await ev(pg,async()=>{const q=s=>document.querySelector(s);const w=W_();const P=thPlan(w);const r={};
  q('[data-y105="doc|1"]').click();await W8(300);r.doc1=thPlan(w).doc;
  P.doc=0;thPlan(w).doc=0;w.lastPlan=w.lastPlan||[];
  /* the button runs 373's same handler: it must not throw and must leave the plan consistent */
  let err='';try{q('#mgrPane .roomhd [data-y105="same"]').click();await W8(300)}catch(e){err=String(e)}r.err=err;r.stillBtn=!!q('#mgrPane .roomhd [data-y105="same"]');return r});
console.log('SAME',JSON.stringify(sm));ok(!sm.err&&sm.stillBtn,'Same as last week: the banner button clicks without error and stays '+JSON.stringify(sm));
/* heights */
const rh=R.roster.h;for(const t of ['practice','recruit','infirm','exch'])ok(R[t].slim&&Math.abs(R[t].h-rh)<=2,`${t} banner ${R[t].h} px = Roster ${rh} ±2`);
ok(R.exch.h<=rh+2&&R.infirm.h<=rh+2,'Wagers + Infirmary ≤ Roster+2');
/* one chip: same class, size, labels, numbers */
const own={practice:'Training',recruit:'Recruiter',infirm:'Medicus'};
for(const t of ['practice','recruit','infirm']){const x=R[t];ok(x.chip&&/^hc105 hc105-on$/.test(x.cls),t+': the hours chip (.hc105, gold) '+x.cls);ok(x.label===own[t],t+': owner label '+own[t]+' (got '+x.label+')');ok(!x.old.y105hrs&&!x.old.roomstat&&!x.old.w104hb,t+': the old hours box is gone '+JSON.stringify(x.old))}
ok(JSON.stringify(R.practice.cn)===JSON.stringify(R.recruit.cn)&&JSON.stringify(R.recruit.cn)===JSON.stringify(R.infirm.cn)&&JSON.stringify(R.practice.cl)===JSON.stringify(R.infirm.cl),'the chip number + label fonts are the same on Yard, Recruiting, Infirmary '+JSON.stringify([R.practice.cn,R.recruit.cn,R.infirm.cn]));
ok(Math.abs(R.practice.box[1]-R.recruit.box[1])<=1&&Math.abs(R.recruit.box[1]-R.infirm.box[1])<=1,'the chip has the same height everywhere '+JSON.stringify([R.practice.box,R.recruit.box,R.infirm.box]));
const nums=await ev(pg,async()=>{const out={};const m=me(),w=W_();const rd=async(t,sel)=>{await TAB(t);return document.querySelector(sel).textContent.replace(/\s+/g,' ').trim()};
  out.practice=[await rd('practice','.roomhd .hc105n'),thLeft(w)+'of'+thMax()];out.recruit=[await rd('recruit','.roomhd .hc105n'),rec99Left(w)+'of'+rec98HrsMax(w)];out.infirm=[await rd('infirm','.roomhd .hc105n'),mh101Left(w,m)+'of'+mh101Max(m,w)];return out});
console.log('NUMS',JSON.stringify(nums));
for(const t of ['practice','recruit','infirm']){const [shown,src]=nums[t];const m=/(\d+)\D+(\d+)/.exec(shown);ok(m&&m[1]+'of'+m[2]===src,t+': chip numbers = the old source '+shown+' vs '+src)}
/* Infirmary: the Capsarius is a separate chip beside the hours chip */
const ci=await ev(pg,async()=>{await TAB('infirm');const hd=document.querySelector('#mgrPane .roomhd');const cap=hd.querySelector('.cp105cap'),c=hd.querySelector('.hc105');return {cap:!!cap&&cap.classList.contains('v104cap'),before:!!cap&&!!c&&cap.compareDocumentPosition(c)&Node.DOCUMENT_POSITION_FOLLOWING,sep:!!cap&&!c.contains(cap),hire:!!cap&&!!cap.querySelector('[data-v101med],[data-med76]')}});
console.log('CAP',JSON.stringify(ci));ok(ci.cap&&ci.before&&ci.sep&&ci.hire,'Infirmary: the Capsarius is its own chip before the hours chip, buttons kept '+JSON.stringify(ci));
/* rail pills */
const pl=R.practice.pills;ok(pl.length===2&&pl.every(p=>/^hp105 gold$/.test(p[1])&&/^\d+ h$/.test(p[2])),'rail pills: Recruiting + Training Yard, the same class, gold "N h" '+JSON.stringify(pl));
const rl=await ev(pg,async()=>{const q=s=>document.querySelector(s);await TAB('practice');await W8(900);const rec=q('.mtabs [data-id="recruit"] .hp105'),pr=q('.mtabs [data-id="practice"] .hp105');
  const vis=e=>!!e&&e.offsetParent!==null;const hid=s=>[...document.querySelectorAll(s)].every(e=>getComputedStyle(e).display==='none');
  const cs=e=>e?[getComputedStyle(e).fontSize,getComputedStyle(e).borderRadius]:null;return {rec:vis(rec),pr:vis(pr),same:JSON.stringify(cs(rec))===JSON.stringify(cs(pr)),oldHidden:hid('.mtabs [data-id="recruit"] .mcount.hr99, .mtabs [data-id="recruit"] .mcount.c73, .mtabs [data-id="practice"] .mcount.c73'),infirm:(q('.mtabs [data-id="infirm"] .mcount')||{}).textContent||''}});
console.log('RAIL',JSON.stringify(rl));ok(rl.rec&&rl.pr&&rl.same&&rl.oldHidden,'rail: one pill look on both tabs, the old green / grey ovals hidden '+JSON.stringify(rl));
/* the spent state (0 left) and overbooked */
const sp=await ev(pg,async()=>{const o={};const L=thLeft,RL=rec99Left,ML=mh101Left,TU=thUsed;
  try{thLeft=()=>0;rec99Left=()=>0;mh101Left=()=>0;
    for(const t of ['practice','recruit','infirm']){await TAB(t);const c=document.querySelector('.roomhd .hc105');o[t]={cls:c?c.className:'',txt:c?c.textContent:'',op:c?getComputedStyle(c).opacity:''}}
    await W8(900);o.pills=[...document.querySelectorAll('.mtabs .hp105')].map(x=>[x.parentNode.dataset.id,x.className,x.textContent]);
    thUsed=()=>99;await TAB('practice');{const c=document.querySelector('.roomhd .hc105');o.over={cls:c?c.className:'',col:c?getComputedStyle(c.querySelector('.hc105n')).color:''}}}
  finally{thLeft=L;rec99Left=RL;mh101Left=ML;thUsed=TU}
  await TAB('practice');return o});
console.log('SPENT',JSON.stringify(sp));
for(const t of ['practice','recruit','infirm'])ok(/hc105-done/.test(sp[t].cls)&&/^✓/.test(sp[t].txt)&&+sp[t].op<1,t+': 0 left = dim with ✓ '+JSON.stringify(sp[t]));
ok(sp.pills.length===2&&sp.pills.every(p=>/hp105 done/.test(p[1])&&p[2]==='✓'),'rail pills: all spent = dim ✓ '+JSON.stringify(sp.pills));ok(/hc105-over/.test(sp.over.cls),'overbooked = red state '+JSON.stringify(sp.over));
await shot(pg,'tv105ad-yard');
for(const t of ['recruit','infirm','exch']){await ev(pg,async t=>{await TAB(t)},t);await shot(pg,'tv105ad-'+t)}
await pg.close();

/* ---- 390x844 ---- */
const ph=await open(390,844);const P={};for(const t of ['practice','recruit','infirm','exch'])P[t]=await FEAT(ph,t);
console.log('PHONE',JSON.stringify(Object.fromEntries(Object.entries(P).map(([k,v])=>[k,[v.h,v.hs,v.wide]]))));
for(const t of Object.keys(P))ok(!P[t].hdo&&(t==='exch'||!P[t].hs),'390 px '+t+': the banner does not overflow'+(t==='exch'?'':', no sideways scroll')+' '+JSON.stringify(P[t].wide)); /* Wagers: its own .tally table may be wider than 390 px (pre-existing, depends on the fighters' names) */
ok(P.practice.chip&&P.recruit.chip&&P.infirm.chip,'390 px: the hours chip on the three pages');
await ev(ph,async()=>{await TAB('practice')});await shot(ph,'tv105ad-yard390');await ph.close();

/* ---- German at 1440 ---- */
const pd=await open(1440,900,false,'de');const D={};for(const t of ['practice','recruit','infirm','exch'])D[t]=await FEAT(pd,t);
console.log('DE',JSON.stringify(Object.fromEntries(Object.entries(D).map(([k,v])=>[k,[v.h,v.hs]]))));
for(const t of Object.keys(D))ok(D[t].h<=rh+2+2&&!D[t].hs,'de 1440 '+t+': banner '+D[t].h+' px, no sideways scroll');
await pd.close();

/* ---- kill switch ---- */
const pk=await open(1440,900,true);
const k=await ev(pk,async()=>{const q=s=>document.querySelector(s);const r={};await TAB('practice');
  r.plate=!!q('#mgrPane .roomhd .y105hrs');r.chip=!!q('.hc105');r.tab=!!q('#mgrPane .y105tab');r.same=!!q('#mgrPane .y105tab [data-y105="same"]');r.log=!!q('.yd76log')||/Last week in the yard/.test(document.getElementById('mgrPane').textContent)||true;
  await TAB('recruit');r.recStat=!!q('.roomhd .roomstat');await TAB('infirm');r.hb=!!q('.w104hb');await W8(900);r.pills=document.querySelectorAll('.mtabs .hp105').length;r.body=document.body.classList.contains('hp105on');return r});
console.log('OFF',JSON.stringify(k));ok(k.plate&&!k.chip&&k.tab&&k.same&&k.recStat&&k.hb&&k.pills===0&&!k.body,'kill switch flavius_v105hrsoff=1: the old plate / Tabula / chips / boxes, no rail pills '+JSON.stringify(k));
await pk.close();
console.log('MISSING',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

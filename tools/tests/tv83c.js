/* v0.83: the Manager council — six advisors with faces (w.council83), fixed per career, faces only inside opened advisor
   letters (never on the envelope), the Council card in Your ludus, older careers get theirs once without a Store write */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const o=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';const w=W_();const r={};const q=s=>document.querySelector(s);const C=w.council83||[];
  r.six=C.length===6&&C.map(a=>a.k).join()==='consilium,recruiter,doctore,medicus,clerk,barracks'&&C.every(a=>/^\S+ \S+$/.test(a.name)&&a.role&&a.spec&&a.face&&a.face.skin);
  r.uniq=new Set(C.map(a=>a.name.split(' ')[0])).size===6&&new Set(C.map(a=>a.name.split(' ')[1])).size===6;
  const nl=A=>JSON.stringify(A.map(a=>{const b={...a};delete b.lv;return b}));r.det=nl(council83Make(w.id))===nl(C)&&nl(council83Make(w.id+'z'))!==nl(C);
  const rnd0=Math.random;let calls=0;Math.random=()=>{calls++;return rnd0()};council83Make('abc');Math.random=rnd0;r.noRandom=calls===0;
  /* letters: an advisor's (opened) and a rival's */
  sendLetter(w,{key:'grow-t83',kind:'report',from:'your doctores',seal:'📈',title:'How the fighters grew this week',body:'<ul><li>x</li></ul>'});
  sendLetter(w,{key:'consil-t83',kind:'letter',from:'the Consilium',seal:'🏛',title:'Counsel test',body:'<p>Hold.</p>'});
  sendLetter(w,{key:'sica-t83',kind:'letter',from:'Sica',seal:'🗡',title:'A quiet word',body:'<p>Coin.</p>'});
  MGR.mailOpen='L:grow-t83';MGR_REDRAW();await W8(600);
  const d=q('details.mail[data-mail="L:grow-t83"]'),dc=q('details.mail[data-mail="L:consil-t83"]'),ds=q('details.mail[data-mail="L:sica-t83"]');
  const doc=C.find(a=>a.k==='doctore');
  r.open=!!d&&d.open&&!!d.querySelector('.mbody .adv83 svg.sface')&&d.querySelector('.adv83').textContent.includes(doc.name)&&/Doctore/.test(d.querySelector('.adv83').textContent);
  r.env=[...document.querySelectorAll('details.mail summary')].every(s=>!s.querySelector('.adv83,svg.sface'));
  r.closedSame=!!dc&&!dc.open&&/from the Consilium/.test(dc.querySelector('summary').textContent);
  r.consil=!!dc&&dc.querySelector('.mbody .adv83').textContent.includes(C[0].name);
  r.sica=!!ds&&!ds.querySelector('.adv83');
  /* the Council card */
  const cc=q('#mgrPane #council83');r.card=!!cc&&cc.querySelectorAll('.c83p').length===6&&cc.querySelectorAll('.c83p svg.sface').length===6&&C.every(a=>cc.textContent.includes(a.name))&&/Barracks master/i.test(cc.textContent);
  r.place=!!cc&&(!!cc.closest('.lu100t.k-adv')||(cc.previousElementSibling&&(cc.previousElementSibling.classList.contains('landing')||cc.previousElementSibling.id==='mailBox'||cc.previousElementSibling.id==='desk99'||cc.previousElementSibling.classList.contains('lrow91')))); /* v1.0: the frieze in the Advisors tile (294) */
  /* other tabs: no card */
  MGR.tab='roster';MGR_REDRAW();await W8(300);r.onlyLudus=!q('#council83');MGR.tab='ludus';MGR_REDRAW();await W8(300);
  /* an older career: no council in the save → one on load, the same as rolled, kept, no Store write */
  const old=JSON.parse(JSON.stringify(w));delete old.council83;let puts=0;const p0=Store.put;Store.put=function(){puts++;return p0.apply(this,arguments)};
  const m1=mgrMigrate(old);const c1=m1.council83;const m2=mgrMigrate(m1);Store.put=p0;
  r.old=Array.isArray(c1)&&c1.length===6&&(()=>{const nl=A=>JSON.stringify(A.map(a=>{const b={...a};delete b.lv;return b}));return nl(c1)===nl(council83Make(old.id))})()&&m2.council83===c1&&puts===0;
  const old2=JSON.parse(JSON.stringify(w));delete old2.council83;old2.ver='0.82';migrateWorld(old2);r.mig=Array.isArray(old2.council83)&&old2.council83.length===6;
  /* never re-rolled: a changed council stays */
  w.council83[0].name='Kept Name';council83Ensure(w);r.fixed=w.council83[0].name==='Kept Name';
  return r});
await pg.setViewportSize({width:390,height:900});await pg.waitForTimeout(400);
o.phone=await pg.evaluate(()=>{const cc=document.querySelector('#council83');if(!cc)return false;const r=cc.getBoundingClientRect();return r.width<=390&&document.documentElement.scrollWidth<=392&&(cc.classList.contains('lu100fz')?[...cc.querySelectorAll('.c83p')].every(h=>{const b=h.getBoundingClientRect();return b.width>0&&b.right<=391}):getComputedStyle(cc.querySelector('.c83row')).gridTemplateColumns.split(' ').length===2)}); /* v1.0: six heads in one frieze row */
ok(o.six&&o.uniq,'six advisors with names, roles and faces');ok(o.det&&o.noRandom,'deterministic from the career id, no RNG');
ok(o.open&&o.consil,'opened advisor letter shows the face + name + title');ok(o.env&&o.closedSame,'envelopes untouched');ok(o.sica,'non-advisor letters have no face');
ok(o.card&&o.place&&o.onlyLudus,'Council card in Your ludus');ok(o.old&&o.mig&&o.fixed,'old careers get one council once');ok(o.phone,'card fits phone width');
console.log(JSON.stringify(o));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

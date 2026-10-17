/* tv105k — v1.05 B44 the Training Yard rework (373-v105yard, his t1a t2a t3a y1a): 0 h with the Doctore = no team drill (drill tile +
   Intensity greyed "Give the Doctore time to run a drill"); 1 h opens the Lv 1 drills, 3 h Lv 2, the Yard level raises his cap (+ stops at
   the cap's hours); his hours come from the one weekly pool (thLeft drops, the banner's one big number); the team drill applies to every fit
   fighter except the ones sat out, at the week's end; Lock in all leaves NOTHING choosable (and refuses stray clicks); the ⚔ trial tile cycles
   ‹ › and its run button opens the old panel + books a spar; the per-fighter drill tiles are gone; an old save's unlocked per-fighter drill
   is dropped; the kill switch flavius_v105yoff=1 brings back the v1.04 Yard. 390 px: no sideways scroll. SHOT=<dir> saves screenshots.
   (The test sets the Council Doctore's bonus levels to 0 so the hours alone set his level.) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT;
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v105yoff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=900;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    if(typeof ADV100!=='undefined')ADV100.docK=()=>0;pm.fac=pm.fac||{};pm.fac.yard=0;
    const ros=rosterOf(pm);for(const g of ros){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.ord87=null;g.morale=80}ros[1].inj={until:w.week+3,label:'a cut',pen:2};
    menuHide();openManager('practice');await W8(800);MGR.view=null;MGR.tab='practice';MGR_REDRAW();await W8(500)});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);const shot=async(pg,n)=>{if(SHOT)await pg.screenshot({path:`${SHOT}/${n}.png`,fullPage:true})};
const pg=await open(1440,1400);
/* 0 h: no team drill, Intensity greyed */
const a=await ev(pg,async()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const w=W_(),pm=me();const r={};
  r.room=!!q('#mgrPane .y105 .y105doc')&&!!q('#mgrPane .y105ses')&&!!q('#mgrPane .y105trial')&&!!q('#mgrPane .y105tab');
  r.noOld=!q('#mgrPane .y92doc')&&!q('#mgrPane .rm100drills')&&!q('#mgrPane [data-y92pre]')&&!q('#mgrPane .rm100plt');
  r.regDis=qa('#mgrPane .y105doc [data-mg="regime"]').length===4&&qa('#mgrPane .y105doc [data-mg="regime"]').every(x=>x.disabled);
  r.msg=(q('#mgrPane .y105msg')||{}).textContent;r.tileOff=!q('#mgrPane .y105dt.on')&&!!q('#mgrPane .y105doc.idle');
  r.chipsDis=qa('#mgrPane .y105chip').every(x=>x.disabled);r.drl=y105Drillers(w,pm).length;
  r.big=+(q('#mgrPane .roomhd .y105hrs .y105big')||{}).textContent;r.left=thLeft(w);r.max=thMax();
  return r});
console.log('ZERO',JSON.stringify(a));
ok(a.room,'the new room');ok(a.noOld,'no per-fighter drill tiles / old Doctore card');ok(a.regDis,'Intensity greyed at 0 h');ok(a.msg==='Give the Doctore time to run a drill','drill msg: '+a.msg);
ok(a.tileOff&&a.chipsDis&&a.drl===0,'drill tile greyed, chips off, nobody drills');ok(a.big===a.left&&a.left===a.max,'banner = hours left');
await shot(pg,'tv105k-zero');
/* hours → level, one pool, the Yard cap */
const h=await ev(pg,async()=>{const q=s=>document.querySelector(s);const w=W_(),pm=me();const P=thPlan(w);const r={};const L0=thLeft(w);
  q('[data-y105="doc|1"]').click();await W8(250);r.d1=P.doc;r.lv1=y105Lv(w,pm);r.pool1=L0-thLeft(w);r.big1=+q('#mgrPane .roomhd .y105big').textContent===thLeft(w);
  r.regOn=!q('#mgrPane .y105doc [data-mg="regime"]').disabled;
  /* the drill tile: Footwork (Lv 1) open, The Showman (Lv 2) not yet */
  y105T(P).k='foot';MGR_REDRAW();await W8(200);r.foot=!!q('#mgrPane .y105dt.on[data-y105k="foot"]');
  q('[data-y105="dr|1"]').click();await W8(200);q('[data-y105="dr|1"]').click();await W8(200);r.k2=y105K(w);r.showLk=!q('#mgrPane .y105dt.on')&&/3 h with him opens it/.test(q('#mgrPane .y105msg').textContent);
  q('[data-y105="doc|1"]').click();await W8(200);q('[data-y105="doc|1"]').click();await W8(250);r.d3=P.doc;r.lv3=y105Lv(w,pm);r.showOn=!!q('#mgrPane .y105dt.on[data-y105k="show"]');
  r.plusDis=q('[data-y105="doc|1"]').disabled;r.cap0=y105Cap(w,pm);r.pool3=L0-thLeft(w);
  pm.fac.yard=1;MGR_REDRAW();await W8(250);r.cap1=y105Cap(w,pm);r.plus1=!q('[data-y105="doc|1"]').disabled;r.max1=y105DocMax(w,pm);
  pm.fac.yard=0;MGR_REDRAW();await W8(200);return r});
console.log('HOURS',JSON.stringify(h));
ok(h.d1===1&&h.lv1===1&&h.pool1===1&&h.big1,'1 h = Lv 1 from the one pool');ok(h.regOn,'Intensity on with hours');ok(h.foot,'Footwork open at Lv 1');
ok(h.k2==='show'&&h.showLk,'The Showman needs 3 h');ok(h.d3===3&&h.lv3===2&&h.showOn&&h.pool3===3,'3 h = Lv 2 opens The Showman');
ok(h.cap0===2&&h.plusDis,'Yard 0: cap Lv 2, + stops at 3 h');ok(h.cap1===3&&h.plus1&&h.max1===5,'Yard I: cap Lv 3 (5 h)');
/* the trial tile cycles and runs (before the lock) */
const t=await ev(pg,async()=>{const q=s=>document.querySelector(s);const w=W_(),pm=me();const r={};const ros=rosterOf(pm);MGR.tr92=ros[0].id;MGR_REDRAW();await W8(250);
  r.k0=q('#mgrPane .y105trial').dataset.y105t;q('[data-y105="tr|1"]').click();await W8(200);r.k1=q('#mgrPane .y105trial').dataset.y105t;q('[data-y105="tr|1"]').click();await W8(200);r.k2=q('#mgrPane .y105trial').dataset.y105t;
  r.penBtn=(q('#mgrPane .y105run')||{}).dataset.yb76;q('[data-y105="tr|1"]').click();await W8(200);r.k3=q('#mgrPane .y105trial').dataset.y105t;
  q('#mgrPane .y105run').click();await W8(300);r.panel=!!q('#mgrPane .y105trial .yd76p');const sel=q('#mgrPane .y105trial [data-yp76p]');
  if(sel){const mate=[...sel.options].map(o=>o.value).find(id=>id!==ros[0].id);sel.value=mate;r.mate=mate}
  const go=q('#mgrPane .y105trial [data-yp76]');if(go)go.click();await W8(300);const P=thPlan(w);r.spar=P.pairs.some(p=>p.k==='spar'&&p.a===ros[0].id);
  r.tab=/Trial: ⚔ Spar/.test(q('#mgrPane .y105tab').textContent);return r});
console.log('TRIAL',JSON.stringify(t));
ok(t.k0==='spar'&&t.k1==='exh'&&t.k2==='pen'&&t.k3==='spar','trial tile cycles spar → exh → pen → spar');ok(/^pen:/.test(t.penBtn||''),'the run button is the old data-yb76');
ok(t.panel&&t.spar&&t.tab,'run: the panel opens and the spar is booked (tabula shows it)');
/* sit one out, plan a session, Lock in all → nothing choosable */
const l=await ev(pg,async()=>{const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const w=W_(),pm=me();const P=thPlan(w);const r={};const ros=rosterOf(pm);
  const busy=new Set(P.pairs.flatMap(p=>[p.a,p.b]));const free=ros.filter(g=>y105Fit(g)&&!busy.has(g.id));const D=free[0],O=free[1];window.DO={D:D.id,O:O.id};
  q(`[data-y105="out|${O.id}"]`).click();await W8(250);r.out=y105Peek(P).out.includes(O.id);r.drl=y105Drillers(w,pm).map(g=>g.id);r.oOut=!r.drl.includes(O.id)&&r.drl.includes(D.id);
  r.hurtNot=!r.drl.includes(ros[1].id)&&!!q(`#mgrPane .y105chip.dis`);
  MGR.tr92=D.id;MGR_REDRAW();await W8(250);q(`[data-y92s="${D.id}|spd|1"]`).click();await W8(250);r.q=y92Sum(y92Peek(P,D.id).Q);
  w.train='off';const st=g=>{const s=gStats(g),x=g.sxp||{};return {spd:s.spd+(x.spd||0),str:s.str+(x.str||0),int:s.int+(x.int||0),cha:s.cha+(x.cha||0)}};window.ST0={D:st(D),O:st(O)};
  q('[data-y105="lock"]').click();await W8(350);r.lk=!!P.lk105&&P.reglk===1&&P.doclk===P.doc&&!!P.y105.on;r.L=y92Sum(y92Peek(P,D.id).L);
  const live=qa('#mgrPane .y105 button, #mgrPane .y105 select, #mgrPane .y105 input').filter(x=>!x.disabled&&!x.matches('[data-y99sel],[data-mg="tab"]'));r.live=live.map(x=>x.outerHTML.slice(0,80));
  r.lockTxt=q('[data-y105="lock"]').textContent;
  /* a stray click on a disabled control is refused */
  const doc0=P.doc;const pl=q('[data-y105="doc|1"]');pl.disabled=false;pl.click();await W8(200);const sp=q(`[data-y92s="${D.id}|str|1"]`);if(sp){sp.disabled=false;sp.click()}await W8(200);
  const rg=q('#mgrPane [data-mg="regime"][data-id="hard"]');rg.disabled=false;rg.click();await W8(200);
  r.refused=P.doc===doc0&&!y92Sum(y92Peek(P,D.id).Q)&&w.train==='off';
  /* B28: the week's checklist counts the yard as set */
  try{r.b28=!weekChecklist().some(x=>x&&x.ic==='🏋'&&!x.done)}catch(e){r.b28='err'}
  return r});
console.log('LOCK',JSON.stringify(l));
ok(l.out&&l.oOut&&l.hurtNot,'sit-out + the hurt fighter cannot drill');ok(l.q===1,'a session planned');ok(l.lk&&l.L===1,'Lock in all locks sessions, hours, intensity and the drill');
ok(l.live.length===0,'nothing choosable after Lock in all: '+l.live.join(' | '));ok(/Locked in/.test(l.lockTxt),'button says Locked in');ok(l.refused,'stray clicks refused');ok(l.b28===true,'B28 task done');
await shot(pg,'tv105k-locked');
/* the week ends: the drill trains every drilling fighter, not the one sat out */
const e=await ev(pg,async()=>{const w=W_(),pm=me();const wk=w.week;const P=thPlan(w);const pr=y92Pre(P.y105.k);const r={k:P.y105.k};const D=gById(DO.D),O=gById(DO.O);
  const st=g=>{const s=gStats(g),x=g.sxp||{};return {spd:s.spd+(x.spd||0),str:s.str+(x.str||0),int:s.int+(x.int||0),cha:s.cha+(x.cha||0)}};
  for(const bt of (w.night&&w.night.bouts)||[])bt.done=true;w.pend=[];
  const MR=Math.random;Math.random=()=>0.99;const G=typeof GROW96!=='undefined'?GROW96.chance:null;if(G!=null)GROW96.chance=0;
  try{await endWeek()}finally{Math.random=MR;if(G!=null)GROW96.chance=G}await W8(400);for(let k=0;k<6&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
  const d=st(D),o=st(O);r.dA=d[pr.a]-ST0.D[pr.a];r.dB=d[pr.b]-ST0.D[pr.b];r.oA=o[pr.a]-ST0.O[pr.a];r.oB=o[pr.b]-ST0.O[pr.b];
  r.turned=W_().week!==wk;r.last=W_().y105last;r.news=(W_().lastPlan||[]).join(' ');return r});
console.log('WEEK',JSON.stringify(e));
ok(e.turned,'the week turned');ok(e.dA>e.oA+0.05&&e.dB>e.oB+0.05,`driller gains both ratings, sat-out does not (${e.dA},${e.dB} vs ${e.oA},${e.oB})`);
ok(/Team drill/.test(e.news),'the yard log names the team drill');ok(e.last&&e.last.doc===3&&e.last.k==='show','last week kept for ↻');
/* new week: unlocked, ↻ Same as last week repeats hours + drill; an old save's unlocked per-fighter drill is dropped */
const n=await ev(pg,async()=>{const q=s=>document.querySelector(s);const w=W_(),pm=me();MGR.tab='practice';MGR_REDRAW();await W8(300);const P=thPlan(w);const r={};
  r.fresh=!P.lk105&&!(P.doc>0)&&!q('[data-y105="lock"]').disabled;q('[data-y105="same"]').click();await W8(300);r.doc=P.doc;r.k=y105K(w);r.outKept=y105Peek(P).out.includes(DO.O);
  const g=rosterOf(pm).find(y105Fit);y92Of(P,g.id).pre={k:'iron',lock:0};y92Of(P,g.id).L={spd:1};MGR_REDRAW();await W8(250);r.dropped=!y92Peek(P,g.id).pre;
  y92Of(P,g.id).pre={k:'iron',lock:1,bn:0.1};MGR_REDRAW();await W8(250);r.ownKept=!!y92Peek(P,g.id).pre&&!y105Drillers(w,pm).includes(g);
  y92Of(P,g.id).pre=null;y92Of(P,g.id).L={};MGR_REDRAW();await W8(200);return r});
console.log('NEXT',JSON.stringify(n));
ok(n.fresh,'a new week starts unlocked');ok(n.doc===3&&n.k==='show'&&n.outKept,'↻ Same as last week: hours + drill + sit-outs');ok(n.dropped,'an unlocked per-fighter drill is dropped');ok(n.ownKept,'a locked per-fighter drill keeps its effect (he skips the team drill)');
await pg.close();
/* 390 px */
const ph=await open(390,1600);const p3=await ev(ph,async()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,room:!!document.querySelector('#mgrPane .y105doc')}));
console.log('PHONE',JSON.stringify(p3));ok(p3.room&&p3.sw<=p3.cw+1,'390 px: no sideways scroll');await shot(ph,'tv105k-390');await ph.close();
/* kill switch */
const pk=await open(1440,1000,true);const k=await ev(pk,async()=>({old:!!document.querySelector('#mgrPane .y92doc, #mgrPane .v104top'),drills:!!document.querySelector('#mgrPane .rm100drills, #mgrPane .y92pre'),neu:!!document.querySelector('#mgrPane .y105')}));
console.log('OFF',JSON.stringify(k));ok(k.old&&k.drills&&!k.neu,'kill switch: the v1.04 Yard');await pk.close();
console.log('MISSING',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

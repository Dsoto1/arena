/* tv104j — v1.04 beta-2 fixes B26 B27 B28 B30 B33 (357-v104fixm): B26 the roster list box is as wide as its rows (no empty strip right of the ⋯ column,
   header + groups the same width, the side takes the rest; 390 px no sideways scroll) · B27 pitch / note / gift / feast draw on the RECRUITER's hours
   (rising +1 h per further action on the recruit that week, scouting included; every button shows its hours; disabled with the reason when short;
   a forced click is refused; coin stays) · B28 "No drills set" is done once the yard plan is locked (Lock in all, or every fit fighter locked) ·
   B30 one Hygeia click books one operation (3 h + 10 coin once), Take out is disabled while it is booked, clicking the booked plate cancels
   (refund, bed free) · B33 the Consilium's letter when the projected bracket appears (seed, bye / Round 1, neighbours + points gap, advice, bracket
   button; once a season; none when unseeded) · the kill switch · no new errors. SHOT=<dir> saves screenshots. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const SHOT=process.env.SHOT;
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.removeItem('flavius_r104sort');if(o)localStorage.setItem('flavius_v104moff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));window.W8=W8;if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=3000;w.train='off';w.tplan=null;for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(let i=0;i<6;i++){const g=genGlad({ovr:46+i*6});if(!gById(g.id))w.glads.push(g);g.alive=true;g.contract={mgr:pm.id,wage:askWage(g),weeks:8+i,since:w.week}}
    for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.ord87=null;g.morale=80;g.contract.weeks=Math.max(g.contract.weeks,6)}
    menuHide();openManager('roster');await W8(900);MGR.view=null;
    window.GO=async t=>{MGR.tab=t;MGR.view=null;MGR_REDRAW();await W8(600)};
    window.RSTEP=async n=>{MGR.recStep=null;await GO('recruit');const s=document.querySelector(`[data-recstep="${n}"]`);if(s){s.click();await W8(500)}}});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const shot=async(pg,n)=>{if(SHOT)await pg.screenshot({path:`${SHOT}/${n}.png`,fullPage:true})};

/* ---------- B26 · the roster list box ---------- */
{const pg=await open(1440,900);await ev(pg,async()=>{await GO('roster')});
  const r=await ev(pg,()=>{const q=s=>document.querySelector(s);const list=q('.r104 .rm100list'),rows=q('.r104rows'),room=q('.rm100.rm100-roster.r104');if(!list||!rows||!room)return {none:1};
    const L=list.getBoundingClientRect(),R=rows.getBoundingClientRect();const h=q('.r104rows>.r104h');const gs=[...document.querySelectorAll('.r104rows>.r104g')];
    const menu=[...document.querySelectorAll('.r104m')].map(x=>x.getBoundingClientRect().right);const side=q('.rm100.rm100-roster.r104 > :nth-child(2)');
    return {lw:Math.round(L.width),rw:Math.round(R.width),strip:Math.round(L.right-Math.max(...menu)),hw:h?Math.round(h.getBoundingClientRect().width):0,gw:gs.map(x=>Math.round(x.getBoundingClientRect().width)),
      sideL:side?Math.round(side.getBoundingClientRect().left-L.right):null,sideW:side?Math.round(side.getBoundingClientRect().width):0,sx:document.documentElement.scrollWidth>innerWidth+1}});
  console.log('B26',JSON.stringify(r));
  ok(!r.none,'roster page');ok(r.lw-r.rw<=26,'list box = its rows: '+r.lw+' vs '+r.rw);ok(r.strip<=26,'no empty strip right of the ⋯ column: '+r.strip);
  ok(Math.abs(r.hw-r.rw)<=2&&r.gw.every(x=>Math.abs(x-r.rw)<=2),'header + group rows the same width');ok(r.sideW>r.lw*0.8,'the side takes the rest: '+r.sideW);ok(r.sideL>=0&&r.sideL<=30,'side starts next to the list: '+r.sideL);ok(!r.sx,'no sideways scroll 1440');
  await shot(pg,'v104j-roster-1440');await pg.close()}
{const pg=await open(2000,1000);await ev(pg,async()=>{await GO('roster')});
  const r=await ev(pg,()=>{const list=document.querySelector('.r104 .rm100list'),rows=document.querySelector('.r104rows');return list&&rows?Math.round(list.getBoundingClientRect().width-rows.getBoundingClientRect().width):999});
  ok(r<=26,'2000 px list = rows: '+r);await pg.close()}
{const pg=await open(390,800);await ev(pg,async()=>{await GO('roster')});
  const r=await ev(pg,()=>({sx:document.documentElement.scrollWidth>innerWidth+1,has:!!document.querySelector('.r104rows')}));ok(r.has&&!r.sx,'390 px: roster no sideways scroll '+JSON.stringify(r));await pg.close()}

/* ---------- B27 · wooing = the Recruiter's hours ---------- */
{const pg=await open(1440,900);
  const pick=async()=>ev(pg,async()=>{const w=W_(),pm=me();pm.coin=3000;const g=freeAgents()[0];g.favd=true;w.rh98=null;if(g.sc98){g.sc98.a={};delete g.sc98.wo104}
    g.recW=null;g.note74=null;g.giftWk=null;if(g.visits)delete g.visits[pm.id];w.pitchN=null;MGR.sel=g.id;await RSTEP(2);window.RG=g.id;return g.id});
  const gid=await pick();
  const s1=await ev(pg,()=>{const w=W_(),g=gById(window.RG);const q=s=>[...document.querySelectorAll(s)];const h=s=>q(s).map(x=>(x.querySelector('.m104h')||{}).textContent||'');
    return {pit:h('[data-rec98p]').slice(0,2),gift:h('[data-mg="gift2"]'),feast:h('[data-mg="visit"]'),note:h('[data-rec74^="note:"]'),noteHd:q('.m104hd .m104h').map(x=>x.textContent),chipsAll:q('.m104h').length,btnMulti:q('button').filter(b=>b.querySelectorAll('.m104h').length>1).length,used:rec98Used(w),left:rec98Left(w),max:rec98HrsMax(w)}});
  console.log('B27a',JSON.stringify(s1));
  ok(s1.pit.length&&s1.pit.every(x=>x==='⏳ 1 h'),'pitch shows 1 h '+s1.pit);ok(s1.gift.length&&s1.gift.every(x=>x==='⏳ 2 h'),'gift 2 h '+s1.gift);ok(s1.feast.length&&s1.feast.every(x=>x==='⏳ 4 h'),'feast 4 h '+s1.feast);
  ok(s1.note.length===3&&s1.note.every(x=>x===''),'note rows stay clean (no chip on the tone rows) '+s1.note);ok(s1.noteHd.length===1&&s1.noteHd[0]==='⏳ 1 h','the note hours sit ONCE in the card title line '+s1.noteHd);
  ok(s1.btnMulti===0,'never two hours chips on one button');ok(s1.chipsAll===6+s1.gift.length+s1.feast.length+1,'exactly one hours chip per action: '+s1.chipsAll);ok(s1.used===0,'nothing used yet');
  await shot(pg,'v104j-court');
  /* no hours chip overlaps any text in the wooing cards (the pitch cards, Win him over, the Private note) */
  const ov=await ev(pg,()=>{const bad=[];for(const c of document.querySelectorAll('.m104h')){const cr=c.getBoundingClientRect();if(!cr.width)continue;const wk=document.createTreeWalker(document.querySelector('#mgrBody'),NodeFilter.SHOW_TEXT);let n;
      while(n=wk.nextNode()){if(c.contains(n)||!n.textContent.trim()||!n.parentElement||!n.parentElement.offsetParent)continue;const rg=document.createRange();rg.selectNodeContents(n);
        for(const t of rg.getClientRects())if(t.width>1&&t.height>1&&t.left<cr.right-1&&t.right>cr.left+1&&t.top<cr.bottom-1&&t.bottom>cr.top+1)bad.push(n.textContent.trim().slice(0,24))}}return bad});
  console.log('B43',JSON.stringify(ov));ok(!ov.length,'an hours chip overlaps text: '+JSON.stringify(ov));
  /* a pitch: the Recruiter's hours go down by 1, coin untouched */
  const s2=await ev(pg,async()=>{const w=W_(),pm=me();const c0=pm.coin;const b=document.querySelector('[data-rec98p]:not([disabled])');if(!b)return {nob:1};b.click();await W8(500);
    const g=gById(window.RG);const K=rec98K(g);return {used:rec98Used(w),coin:c0-pm.coin,wo:JSON.stringify(K.wo104),gift:[...document.querySelectorAll('[data-mg="gift2"] .m104h')].map(x=>x.textContent),feast:[...document.querySelectorAll('[data-mg="visit"] .m104h')].map(x=>x.textContent)}});
  console.log('B27b',JSON.stringify(s2));
  ok(!s2.nob,'a pitch button');ok(s2.used===1,'pitch used 1 recruiter hour: '+s2.used);ok(s2.coin===0,'pitch costs no coin');ok(s2.gift.every(x=>x==='⏳ 3 h'),'gift rises to 3 h '+s2.gift);ok(s2.feast.every(x=>x==='⏳ 5 h'),'feast rises to 5 h '+s2.feast);
  /* a gift: 3 h (2 + the rising 1), coin spent */
  const s3=await ev(pg,async()=>{const w=W_(),pm=me();const c0=pm.coin,u0=rec98Used(w);const b=document.querySelector('[data-mg="gift2"]:not([disabled])');if(!b)return {nob:1};b.click();await W8(500);
    return {used:rec98Used(w)-u0,coin:c0-pm.coin,giftCost:giftCost(gById(window.RG))}});
  console.log('B27c',JSON.stringify(s3));ok(!s3.nob,'a gift button');ok(s3.used===3,'gift used 3 h (2 + 1 rising): '+s3.used);ok(s3.coin===s3.giftCost,'gift coin unchanged: '+s3.coin);
  /* a note: its hours follow (1 + 2 earlier actions) */
  const s4=await ev(pg,async()=>{const w=W_();const u0=rec98Used(w);const b=document.querySelector('[data-rec74^="note:"]:not([disabled])');if(!b)return {nob:1};const lbl=(document.querySelector('.m104hd .m104h')||{}).textContent;b.click();await W8(700);
    return {used:rec98Used(w)-u0,lbl}});
  console.log('B27d',JSON.stringify(s4));ok(!s4.nob,'a note button');ok(s4.lbl==='⏳ 3 h'&&s4.used===3,'note used 3 h (1 + 2 rising): '+JSON.stringify(s4));
  /* the scouting buttons rise after the woos too */
  const s5=await ev(pg,async()=>{await RSTEP(1);return [...document.querySelectorAll('[data-rec98a]')].map(b=>({a:b.dataset.rec98a,t:b.textContent.replace(/\s+/g,' ')}))});
  console.log('B27e',JSON.stringify(s5));ok(s5.some(x=>x.a==='watch'&&/⏳ ?4 h/.test(x.t))&&s5.some(x=>x.a==='ask'&&/⏳ ?4 h/.test(x.t)),'scouting rose by 3 h after three woos (watch 1 -> 4): '+JSON.stringify(s5.find(x=>x.a==='watch')));
  /* not enough hours: disabled with the reason; a forced click is refused */
  await ev(pg,async()=>{const w=W_();w.rh98={wk:w.week,n:rec98HrsMax(w)-1};await RSTEP(2)});
  const s6=await ev(pg,async()=>{const w=W_(),pm=me();const g=gById(window.RG);g.giftWk=null;g.visits&&delete g.visits[pm.id];const q=s=>[...document.querySelectorAll(s)];
    const f=q('[data-mg="visit"]')[0],gf=q('[data-mg="gift2"]')[0],nt=q('[data-rec74^="note:"]');const r={feast:!!f&&f.disabled,feastWhy:f?f.title:'',gift:!!gf&&gf.disabled,noteOn:nt.some(x=>!x.disabled)};
    const u0=rec98Used(w),c0=pm.coin;if(f){f.disabled=false;f.click();await W8(400)}r.same=rec98Used(w)===u0&&pm.coin===c0;return r});
  console.log('B27f',JSON.stringify(s6));ok(s6.feast&&/left this week/.test(s6.feastWhy),'feast disabled with the reason: '+s6.feastWhy);ok(s6.gift,'gift disabled');ok(s6.same,'a forced click spends nothing');
  await pg.close()}
/* B43 · the same at 390 px: no overlap, one note chip, no sideways scroll */
{const pg=await open(390,2200);
  const r=await ev(pg,async()=>{const g=freeAgents()[0];g.favd=true;g.note74=null;W_().rh98=null;MGR.sel=g.id;await RSTEP(2);const bad=[];
    for(const c of document.querySelectorAll('.m104h')){const cr=c.getBoundingClientRect();const wk=document.createTreeWalker(document.querySelector('#mgrBody'),NodeFilter.SHOW_TEXT);let n;
      while(n=wk.nextNode()){if(c.contains(n)||!n.textContent.trim()||!n.parentElement||!n.parentElement.offsetParent)continue;const rg=document.createRange();rg.selectNodeContents(n);
        for(const t of rg.getClientRects())if(t.width>1&&t.height>1&&t.left<cr.right-1&&t.right>cr.left+1&&t.top<cr.bottom-1&&t.bottom>cr.top+1)bad.push(n.textContent.trim().slice(0,24))}}
    return {bad,hd:document.querySelectorAll('.m104hd .m104h').length,rows:[...document.querySelectorAll('[data-rec74^="note:"] .m104h')].length,sx:document.documentElement.scrollWidth>innerWidth+1}});
  console.log('B43b',JSON.stringify(r));ok(!r.bad.length,'390 px: chip over text '+JSON.stringify(r.bad));ok(r.hd===1&&r.rows===0,'390 px: one note chip in the title, none on rows');ok(!r.sx,'390 px: no sideways scroll');await pg.close()}
{const pg=await open(1440,900,true);
  const r=await ev(pg,async()=>{const w=W_();const g=freeAgents()[0];g.favd=true;MGR.sel=g.id;await RSTEP(2);return document.querySelectorAll('.m104h').length});
  ok(r===0,'kill switch: no hours chips '+r);await pg.close()}

/* ---------- B28 · the checklist's drills item ---------- */
{const pg=await open(1440,900);
  const r=await ev(pg,async()=>{const w=W_(),pm=me();const it=()=>weekChecklist().find(x=>x.ic==='🏋');const out={};w.train='off';
    await GO('ludus');out.open=it().done===false&&/No drills set/.test(it().txt);out.openDom=/No drills set/.test(document.getElementById('mgrBody').innerText);
    /* an unlocked plan keeps the task */
    await GO('practice');const g=rosterOf(pm)[2];MGR.tr92=g.id;MGR_REDRAW();await W8(400);const s=document.querySelector(`[data-y92s="${g.id}|spd|1"]`);if(s){s.click();await W8(300)}
    out.planned=!!s;out.stillOpen=it().done===false;
    /* Lock in all (Intensity stays None) = a choice */
    const all=document.querySelector('[data-y92all],[data-y105="lock"]') /* v1.05 B44: 373's Lock in all */;if(all&&!all.disabled){all.click();await W8(500)}out.locked=!!thPlan(w).reglk;out.regime=w.train;
    out.done=it().done===true&&/locked in/.test(it().txt);await GO('ludus');out.dom=!/No drills set/.test(document.getElementById('mgrBody').innerText);
    out.leave=!(typeof leaveList76==='function'&&leaveList76(w).some(x=>/No drills set/.test(x)));
    /* every fit fighter locked, without Lock in all */
    const P=thPlan(w);P.reglk=0;for(const f of rosterOf(pm)){const y=y92Of(P,f.id);y.L={spd:1};y.Q={}}out.each=it().done===true;
    const y0=y92Of(P,rosterOf(pm)[0].id);y0.Q={str:1};out.pend=it().done===false;y0.Q={};
    delete P.y92[rosterOf(pm)[1].id];out.one=it().done===false;return out});
  console.log('B28',JSON.stringify(r));ok(r.open&&r.openDom,'task open with no plan');ok(r.planned&&r.stillOpen,'a planned but unlocked yard keeps the task');ok(r.locked&&r.regime==='off','Lock in all with Intensity None');ok(r.done,'done after the lock');ok(r.dom,'gone from the To-do list');ok(r.leave,'gone from the before-you-leave list');
  ok(r.each,'every fit fighter locked = done');ok(r.pend,'a pending session = not done');ok(r.one,'a fighter without a locked card = not done');await pg.close()}

/* ---------- B30 · Hygeia: one booking, Take out held, cancel ---------- */
{const pg=await open(1440,900);
  const r=await ev(pg,async()=>{const w=W_(),pm=me();const g=rosterOf(pm)[0];g.inj=null;g.severed=[Object.keys(LOCN)[0]];w.beds76=[g.id];w.mh101=null;MGR.tab='infirm';MGR.inf90=g.id;MGR.view=null;MGR_REDRAW();await W8(700);
    const out={};const c0=pm.coin,h0=mh101Left(w,pm);const q=s=>document.querySelector(s);const heal=q('[data-mg="heal"]');out.plate=!!heal;
    out.takeOutBefore=!!q('.v101out')&&!q('.v101out').disabled;
    heal.click();await W8(150);heal.click(); /* a double click: books once */ await W8(700);
    out.coin=c0-pm.coin;out.hrs=h0-mh101Left(w,pm);out.booked=!!(g.rg102&&g.rg102.wk===w.week);
    const to=q('.v101out');out.dis=!!to&&to.disabled;out.why=to?to.title:'';out.ok=(q('[data-mg="heal"] .v101ok')||{}).textContent;
    const w0=w.beds76.length;const forced=q('[data-unbed76]');if(forced){forced.disabled=false;forced.click();await W8(400)}out.stay=w.beds76.includes(g.id)&&w.beds76.length===w0;
    /* cancel on its plate */
    await W8(700);const h2=q('[data-mg="heal"]');h2.click();await W8(700);
    out.cancel=!g.rg102&&pm.coin===c0&&mh101Left(w,pm)===h0;const to2=q('.v101out');out.free=!!to2&&!to2.disabled;
    const u=q('[data-unbed76]');u.click();await W8(400);out.out=!w.beds76.includes(g.id);return out});
  console.log('B30',JSON.stringify(r));ok(r.plate&&r.takeOutBefore,'Hygeia plate + Take out before');ok(r.booked&&r.coin===10&&r.hrs===3,'one booking: 3 h + 10 coin once '+r.hrs+'/'+r.coin);ok(r.dis&&/Hygeia's regrowth needs him in bed until the week ends/.test(r.why),'Take out disabled with the reason: '+r.why);
  ok(/cancel/.test(r.ok||''),'the booked plate says cancel: '+r.ok);ok(r.stay,'a forced Take out is refused');ok(r.cancel,'cancel refunds hours + coin');ok(r.free,'Take out works again');ok(r.out,'he can leave the bed');
  await shot(pg,'v104j-infirmary');await pg.close()}

/* ---------- B33 · the Consilium's bracket letter ---------- */
{const pg=await open(1440,900);
  const r=await ev(pg,async()=>{const w=W_(),pm=me();const out={};w.cal104=w.season;w.po104=null;w.week=9;w.letters=[];w.pj104=null;
    const hs=w.mgrs.filter(m=>!m.dead&&!m.sica&&m!==pm);hs.forEach((m,i)=>{msp(m).pts=60-i*4});msp(pm).pts=60-4*5+1; /* seed 6 */
    const P=po104New(w);out.seed=P.seeds.indexOf('m:'+pm.id)+1;
    MGR.tab='ludus';MGR.view=null;MGR_REDRAW();await W8(700);
    const L=(w.letters||[]).find(x=>x.key==='pj104-'+w.season);out.letter=!!L;if(L){out.from=L.from;out.adv=L.adv;out.title=L.title;out.text=L.body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');out.btn=/data-po104="bracket"/.test(L.body)}
    out.flag=w.pj104===w.season;
    w.letters=[];MGR_REDRAW();await W8(500);out.once=!(w.letters||[]).some(x=>x.key==='pj104-'+w.season);
    /* a top-4 house: the rest week */
    w.pj104=null;w.letters=[];msp(pm).pts=200;MGR_REDRAW();await W8(500);const L2=(w.letters||[]).find(x=>x.key==='pj104-'+w.season);out.top=L2?L2.body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' '):'';
    /* a house outside the twelve: no letter */
    w.pj104=null;w.letters=[];pm.sica=true;const P3=po104New(w);out.unseeded=P3.seeds.indexOf('m:'+pm.id)===-1;MGR_REDRAW();await W8(500);out.none=!(w.letters||[]).some(x=>x.key==='pj104-'+w.season);pm.sica=false;
    /* before week 9: nothing */
    w.pj104=null;w.letters=[];msp(pm).pts=60;w.week=8;MGR_REDRAW();await W8(500);out.early=!(w.letters||[]).some(x=>x.key==='pj104-'+w.season);return out});
  console.log('B33',JSON.stringify(r));ok(r.seed===6,'test seed 6 '+r.seed);ok(r.letter&&/Consilium/.test(r.from)&&r.adv==='consilium','letter from the Consilium');ok(/seed #6/.test(r.text||''),'names the seed: '+r.text);ok(/Round 1/.test(r.text||''),'Round 1 path');
  ok(/just above you \(#5\), 3 points ahead/.test(r.text||'')&&/just behind you \(#7\), 1 point back/.test(r.text||''),'neighbours + gaps: '+r.text);ok(r.btn,'bracket button');ok(r.flag&&r.once,'once a season');ok(/rest week/i.test(r.top||''),'a top-4 house: rest week '+r.top);
  ok(r.unseeded&&r.none,'no letter for an unseeded house');ok(r.early,'none before week 9');await pg.close()}
{const pg=await open(1440,900,true);
  const r=await ev(pg,async()=>{const w=W_();w.week=9;w.letters=[];w.pj104=null;MGR.tab='ludus';MGR_REDRAW();await W8(500);return (w.letters||[]).some(x=>/^pj104-/.test(x.key))});
  ok(!r,'kill switch: no bracket letter');await pg.close()}

console.log('ERRS',JSON.stringify(errs));console.log('MISS',JSON.stringify(miss));await b.close();process.exit(errs.length||miss.length?1:0)})();

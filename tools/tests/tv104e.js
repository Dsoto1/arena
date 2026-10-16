/* tv104e — v1.04 beta fixes B1 B2 B6 B19 (352-v104fixr): B1 Keeping him = six plates (no ptrain / medic), the fold open, one row at desktop ·
   B2 the list's name column fits its content (no empty gap), the list column narrower, 1440 / 2000 / 390 px no sideways scroll · B6 no team buttons
   under the portrait, the hint over the list, headers light up while dragging · B19 the Injured group above Lent out (bed / limb / hurt move there by
   themselves, the reserve then the Second team cover, back to the old place when fit, no drop / move by hand), Worn warning (row, panel, picker) · kill switch.
   Screenshots -> tools/plans/v104/shots/ (not committed). */
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
(async()=>{const b=await chromium.launch();const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const out={};
const shots=path.resolve(__dirname,'../plans/v104/shots');try{fs.mkdirSync(shots,{recursive:true})}catch(e){}
const open=async(W,H,off)=>{const pg=await b.newPage({viewport:{width:W,height:H}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
  await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.removeItem('flavius_r104sort');if(o)localStorage.setItem('flavius_v104roff','1')},off?1:0);
  await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();for(let i=0;i<40&&typeof newWorld!=='function';i++)await W8(100);await W8(500);
    newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),pm=me();w.welc99=1;pm.coin=3000;w.train='off';w.tplan=null;
    for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(200)}
    for(let i=0;i<6;i++){const g=genGlad({ovr:46+i*6});if(!gById(g.id))w.glads.push(g);g.alive=true;g.contract={mgr:pm.id,wage:askWage(g),weeks:8+i,since:w.week}}
    for(const g of rosterOf(pm)){g.inj=null;g.fat=10;g.restWk=null;g.severed=[];g.contract.weeks=Math.max(g.contract.weeks,6);g.morale=80}
    menuHide();openManager('roster');await W8(900);MGR.view=null});return pg};
const ev=(pg,f,a)=>pg.evaluate(f,a);
const redraw=pg=>ev(pg,async()=>{MGR_REDRAW();await new Promise(r=>setTimeout(r,500))});

const pg=await open(1440,900);
await redraw(pg);
/* ---- B1 ---- */
out.b1=await ev(pg,()=>{const k=document.querySelector('.r104keep');const bs=[...document.querySelectorAll('.r104keep .rm100keep .acts button[data-mg]')].filter(x=>!['extend','release'].includes(x.dataset.mg));
  const tops=bs.map(x=>Math.round(x.getBoundingClientRect().top));
  return {open:!!k&&k.open,acts:bs.map(x=>x.dataset.mg),oneRow:new Set(tops).size===1,noPt:!document.querySelector('.rm100keep [data-mg="ptrain"],.rm100keep [data-mg="medic"]')}});
ok(out.b1.open,'b1 open '+JSON.stringify(out.b1));ok(out.b1.noPt,'b1 no ptrain/medic');
ok(['meal','word','kintix','bonus','raise','promise'].every(x=>out.b1.acts.includes(x))&&out.b1.acts.length===6,'b1 six '+JSON.stringify(out.b1.acts));
ok(out.b1.oneRow,'b1 one row '+JSON.stringify(out.b1));
await pg.screenshot({path:path.join(shots,'e-1440.png')});
try{await pg.locator('.r104keep').screenshot({path:path.join(shots,'e-keep.png')})}catch(e){}
/* ---- B2 ---- */
const lay=async()=>ev(pg,()=>{const q=s=>document.querySelector(s);const nm=q('.r104 .r104h [data-col="name"]'),tr=q('.r104 .r104h [data-col="tier"]'),list=q('.r104 .rm100list'),room=q('.rm100.rm100-roster'),sel=q('.rm100pp');
  const rows=[...document.querySelectorAll('.r104r')].map(r=>r.querySelector('.r104t'));const lefts=rows.filter(x=>x.offsetParent).map(x=>Math.round(x.getBoundingClientRect().left));
  return {nameW:Math.round(nm.getBoundingClientRect().width),listW:Math.round(list.getBoundingClientRect().width),roomW:Math.round(room.getBoundingClientRect().width),selW:sel?Math.round(sel.getBoundingClientRect().width):0,
    aligned:new Set(lefts).size<=1,gap:tr.offsetParent?Math.round(tr.getBoundingClientRect().left-nm.getBoundingClientRect().right):0,sx:document.documentElement.scrollWidth>window.innerWidth+1}});
out.l1440=await lay();ok(out.l1440.nameW<=215&&out.l1440.aligned&&out.l1440.listW<=545&&out.l1440.gap<=12&&!out.l1440.sx,'b2 1440 '+JSON.stringify(out.l1440));
await pg.setViewportSize({width:2000,height:1000});await redraw(pg);out.l2000=await lay();ok(out.l2000.nameW<=215&&out.l2000.aligned&&out.l2000.listW<=545&&out.l2000.gap<=12&&!out.l2000.sx,'b2 2000 '+JSON.stringify(out.l2000));
await pg.screenshot({path:path.join(shots,'e-2000.png')});
await pg.setViewportSize({width:390,height:800});await redraw(pg);out.l390=await lay();ok(!out.l390.sx&&out.l390.aligned,'b2 390 '+JSON.stringify(out.l390));
await pg.screenshot({path:path.join(shots,'e-390.png')});
await pg.setViewportSize({width:1440,height:900});await redraw(pg);
/* ---- B6 ---- */
out.b6=await ev(pg,()=>{const row=document.querySelector('.r104r[data-r104d]');return {noBtn:!document.querySelector('.r104tb,.r104tc,[data-r104a]'),hint:/drag a row/.test((document.querySelector('.r104hint')||{}).textContent||''),menu:!!row.querySelector('.r104m')}});
ok(out.b6.noBtn&&out.b6.hint&&out.b6.menu,'b6 '+JSON.stringify(out.b6));
out.drag=await ev(pg,()=>{const r=document.querySelector('.r104r[data-r104d]');r.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer:new DataTransfer()}));
  const on=document.body.classList.contains('r104dnd');const hl=getComputedStyle(document.querySelector('.r104g[data-r104g="B"] .r104gh')).boxShadow!=='none';
  r.dispatchEvent(new DragEvent('dragend',{bubbles:true}));return {on,hl,off:!document.body.classList.contains('r104dnd')}});
ok(out.drag.on&&out.drag.hl&&out.drag.off,'drag '+JSON.stringify(out.drag));
out.menu=await ev(pg,async()=>{const pm=me();const g=rosterOf(pm).find(x=>team104(x,pm)==='R')||rosterOf(pm).find(x=>team104(x,pm)==='B');const k0=team104(g,pm);const r=tm104Move(g.id,k0==='B'?'R':'B');return !!(r&&r.ok)});
ok(out.menu,'menu move');
/* ---- B19 ---- */
out.inj=await ev(pg,async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_(),pm=me();const r={};const P=()=>rosterOf(pm);
  st95Ensure(w,pm);tm104Ensure(w,pm);
  const A=()=>P().filter(g=>team104(g,pm)==='A');
  r.A0=A().length;const st=P().filter(g=>g.slot95).sort((a,c)=>a.slot95-c.slot95)[0];const s=st.slot95;
  const home=team104(st,pm);r.homeA=home==='A';
  st.inj={until:w.week+3,label:'a torn shoulder',pen:3};tm104Ensure(w,pm);
  r.isI=team104(st,pm)==='I';r.noSlot=!st.slot95&&!st.tm104;r.A1=A().length;r.slotFilled=P().some(g=>g.slot95===s&&g!==st);
  const filler=P().find(g=>g.slot95===s);r.fillerFit=!!filler&&!filler.inj;
  r.slots3=P().filter(g=>g.slot95).length===3;
  MGR.lsel=st.id;MGR_REDRAW();await W8(500);
  const gs=[...document.querySelectorAll('.r104g')].map(x=>x.dataset.r104g);r.order=gs.join('');r.grpOK=gs.indexOf('I')>=0&&(gs.indexOf('L')<0||gs.indexOf('I')<gs.indexOf('L'))&&gs.indexOf('I')>gs.indexOf('R');
  const row=document.querySelector('.r104g[data-r104g="I"] .r104r');r.rowTxt=row?row.textContent:'';r.wound=/torn shoulder/.test(r.rowTxt)&&/3 wk/.test(r.rowTxt);r.noDrag=!!row&&!row.hasAttribute('draggable');
  r.panelOK=!document.querySelector('.r104tb');
  const mv=tm104Move(st.id,'A');r.refuse=!!(mv&&mv.no);
  st.inj=null;tm104Ensure(w,pm);r.back=team104(st,pm)===home&&st.slot95===s;r.A2=A().length;r.slots3b=P().filter(g=>g.slot95).length===3;
  r.noGhost=!P().some(g=>g.home104||g.cover104||g.step104);
  const g2=P().find(g=>g.slot95&&g!==st);w.beds76=(w.beds76||[]).concat([g2.id]);tm104Ensure(w,pm);r.bed=team104(g2,pm)==='I';
  w.beds76=w.beds76.filter(x=>x!==g2.id);tm104Ensure(w,pm);r.bedBack=team104(g2,pm)!=='I'&&!!g2.slot95;
  g2.severed=['la'];tm104Ensure(w,pm);r.limb=team104(g2,pm)==='I'&&/lost/.test(inj104Txt(g2));g2.severed=[];tm104Ensure(w,pm);r.limbBack=team104(g2,pm)!=='I';
  return r});
ok(out.inj.isI&&out.inj.noSlot&&out.inj.slotFilled&&out.inj.fillerFit&&out.inj.slots3&&out.inj.A1===out.inj.A0,'inj out '+JSON.stringify(out.inj));
ok(out.inj.grpOK&&out.inj.wound&&out.inj.noDrag&&out.inj.refuse&&out.inj.panelOK,'inj ui '+JSON.stringify(out.inj));
ok(out.inj.back&&out.inj.A2===out.inj.A0&&out.inj.slots3b&&out.inj.noGhost,'inj back '+JSON.stringify(out.inj));
ok(out.inj.bed&&out.inj.bedBack&&out.inj.limb&&out.inj.limbBack,'bed/limb '+JSON.stringify(out.inj));
await ev(pg,async()=>{const w=W_(),pm=me();const g=rosterOf(pm).find(x=>x.slot95);g.inj={until:w.week+2,label:'cracked ribs',pen:3};tm104Ensure(w,pm);MGR.lsel=g.id;MGR_REDRAW();await new Promise(r=>setTimeout(r,500))});
await pg.screenshot({path:path.join(shots,'e-injured.png')});
await ev(pg,()=>{const w=W_(),pm=me();for(const g of rosterOf(pm))g.inj=null;tm104Ensure(w,pm)});
/* worn */
out.worn=await ev(pg,async()=>{const w=W_(),pm=me();const g=rosterOf(pm).find(x=>team104(x,pm)==='B')||rosterOf(pm)[0];g.fat=80;MGR.lsel=g.id;MGR_REDRAW();await new Promise(r=>setTimeout(r,500));
  const row=document.querySelector('.r104r[data-id="'+g.id+'"]');const r={tag:!!row&&/Worn/.test(row.textContent),title:!!row&&/fights weaker, wounds more easily/.test(row.title),panel:/fights weaker, wounds more easily/.test((document.querySelector('.r104wnp')||{}).textContent||''),fielded:team104(g,pm)!=='I'&&!r101Block(g)};
  const n=w.night;if(n&&!n.bye&&n.bouts&&n.bouts.length){try{ANY100.pk={bi:0,gid:g.id,pt:null,why:null};const h=any100PickHTML();const i=h.indexOf('sel|'+g.id);r.picker=/Worn: fights weaker/.test(h)||h.slice(Math.max(0,i-80),i+40)}catch(e){r.picker='err '+e.message}}else r.picker='skip';
  g.fat=10;return r});
ok(out.worn.tag&&out.worn.title&&out.worn.panel&&out.worn.fielded&&(out.worn.picker===true||out.worn.picker==='skip'||/a1fr no/.test(String(out.worn.picker))),'worn '+JSON.stringify(out.worn));
await pg.close();
/* ---- kill switch ---- */
const pk=await open(1440,900,true);
out.off=await ev(pk,async()=>{MGR_REDRAW();await new Promise(r=>setTimeout(r,500));const pm=me();const g=rosterOf(pm)[0];g.inj={until:W_().week+2,label:'x',pen:1};tm104Ensure(W_(),pm);
  return {pt:!!document.querySelector('.rm100keep [data-mg="ptrain"]'),tb:!!document.querySelector('.r104tb'),notI:team104(g,pm)!=='I'}});
ok(out.off.pt&&out.off.tb&&out.off.notI,'kill switch '+JSON.stringify(out.off));
await pk.close();
const real=errs.filter(e=>!/ResizeObserver/.test(e));
console.log(JSON.stringify(out));console.log('ERRS',JSON.stringify(real));console.log('MISS',JSON.stringify(miss));
await b.close();process.exit(miss.length||real.length?1:0)})();

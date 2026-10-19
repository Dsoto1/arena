/* v0.90 A1 (183-v90ward): a resting fighter can't fight (Match Week locked slot + enter/exhibition/road deal/pen refuse, no rest
   for a fighter on the card, sweep90), the Infirmary redesign (list + avatar + HP/fatigue bars + care options; a cure, a rubdown,
   a rest week and the Care routine still work; the ⓘ care guide), fatigue bands in a Manager bout (Fresh +1 movement in round 1,
   Worn −1 all bout), the HP display clamps at 7 */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown'),localStorage.setItem('flavius_v105yoff','1');localStorage.setItem('flavius_v104doff','1') /* v1.04: 351-v104ward replaces this layout / these rules — tv104d covers them */});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const o=await pg.evaluate(async()=>{let sd=90;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};
  const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;W_().fill95=W_().season*100+W_().week; /* v0.95: no default fill of the starters (the test enters by hand) */
  const w=W_(),m=me();m.coin=2000;const ros=rosterOf(m);const r={};const q=s=>document.querySelector(s);const go=async t=>{MGR.tab=t;MGR_REDRAW();await W8(400)};
  for(const g of ros){g.age=24;g.morale=90;g.contract.weeks=20;g.faith='pagan';g.bench=false;delete g.inj;g.severed=[];g.fat=0}
  const mine=new Set(ros.map(g=>g.id));for(const bo of w.night.bouts)bo.ents=bo.ents.filter(id=>!mine.has(id));fillNight();
  /* ---- 1 · resting fighter refused ---- */
  const R=ros[0],bi=0;R.ovr-=effOvr(R)-60; /* the card runs in order: only the undercard takes entries now */
  R.restWk=w.week;travelState(w).paid=true;await go('night'); /* the road is paid so the enter click is not what refuses */
  const opt=q(`select#ent${bi} option[value="${R.id}"]`);r.locked=!!opt&&!opt.disabled&&/ends the rest/i.test(opt.textContent) /* v1.01 (319): resting is no block — entering ends the rest */;if(!r.locked)r.dbgL=JSON.stringify({bi,sel:(q('#ent'+bi)||{}).outerHTML,ovr:effOvr(R),tiers:w.night.bouts.map(bo=>[bo.tier,TIERS[bo.tier].lo,TIERS[bo.tier].hi,bo.ents.length,bo.wd])});
  r.strip=!!q(`.rest90 [data-inf90go="${R.id}"]`);
  const s=q('#ent'+bi);if(s){if(!opt){const o2=document.createElement('option');o2.value=R.id;s.appendChild(o2)}s.value=R.id;const bt=s.parentNode.querySelector('[data-mg="enter"]');bt.disabled=false;bt.click();await W8(300)}
  r.notEntered=w.night.bouts.some(bo=>bo.ents.includes(R.id))&&R.restWk!==w.week; /* v1.01: entered, rest ended */
  R.restWk=w.week;
  const opp=w.mgrs.find(x=>!x.isPlayer&&rosterOf(x).length);r.exhib=!r101Block(R);r.pen=/Resting/.test(penWhy76(R,w));r.deal=true;
  /* sweep: a resting fighter auto-entered somewhere comes off the card */
  const bo0=w.night.bouts[bi];const out=bo0.ents.find(id=>!mine.has(id));bo0.ents[bo0.ents.indexOf(out)]=R.id;sweep90(w);r.sweep=bo0.ents.length===boutSize(bo0);
  /* resting a fighter who is on the card is refused */
  const C=ros.find(g=>g!==R);const o3=bo0.ents.find(id=>!mine.has(id));bo0.ents[bo0.ents.indexOf(o3)]=C.id;MGR.tr92=C.id;await go('practice'); /* v1.01: rest lives in the Training Yard's Recovery block (318) */
  const rb=q(`.v101rec2 [data-rest="${C.id}"]`);if(rb){rb.disabled=false;rb.click()}await W8(300);r.noRestOnCard=!!rb&&C.restWk===w.week&&!w.night.bouts.some(x=>x.ents.includes(C.id)); /* v1.01 (319): resting takes him off the card first */
  C.restWk=null;if(bo0.ents.includes(C.id))bo0.ents[bo0.ents.indexOf(C.id)]=o3;
  /* undo the rest from the Infirmary → he may be entered again */
  MGR.tr92=R.id;await go('practice');const ub=q(`.v101rec2 [data-rest="${R.id}"]`);if(ub)ub.click();await W8(300);r.undo=R.restWk!==w.week;await go('night');
  const opt2=q(`select#ent${bi} option[value="${R.id}"]`);r.unlocked=!!opt2&&!opt2.disabled&&/Fresh/.test(opt2.textContent);
  /* ---- 2 · the Infirmary ---- */
  const A=ros[0]===R?ros[1]:ros[0];const B=ros.find(g=>g!==A&&g!==R&&g!==C)||C;
  A.inj={until:w.week+2,label:'a torn shoulder',pen:3};B.fat=74;MGR.inf90=null;await go('infirm');
  r.list=document.querySelectorAll('.iv90list .iv90row').length>=2&&!!q(`.iv90row.on[data-inf90="${A.id}"]`)&&!!q(`.iv90row[data-inf90="${B.id}"] .fb90-worn`)&&!!q('.iv90row .iv90mb.hp')&&!!q('.iv90row .iv90mb.ft');
  r.mid=!!q('.iv90mid .iv90hp .sg90')&&!!q('.iv90mid .iv90ft .iv90fb i')&&!!q('.iv90mid .iv90av svg .glow90')&&!!q('.iv90mid .sg90.wd');
  r.opts=!!q('.iv90care .iv90s.wd .plantile .pd90')&&!!q(`.iv90care [data-bed76="${A.id}"]`)&&!!q('.iv90care .v101ord'); /* v1.01: the bathhouse moved to the yard (318) */
  const med=q(`.iv90care [data-mg="medic"][data-id="${A.id}"]`);const c0=m.coin;if(med)med.click();await W8(400);r.cure=!!med&&(!A.inj||!!A.inj.bk102)&&m.coin<c0;if(A.inj&&A.inj.bk102)delete A.inj; /* v1.02 (341): the cure is booked — it closes when the week ends (simulated here) */
  const row=q(`[data-inf90="${B.id}"]`);if(row)row.click();await W8(400);r.select=MGR.inf90===B.id&&!!q('.iv90av.worn');
  MGR.tr92=B.id;await go('practice');const f0=B.fat;q(`.v101rec2 [data-bath="${B.id}"]`).click();await W8(400);r.rub=B.fat===f0-10;
  q(`.v101rec2 [data-rest="${B.id}"]`).click();await W8(400);r.rest=B.restWk===w.week;
  q(`.v101rec2 [data-care90="${B.id}"]`).click();await W8(400);r.care=B.ord87&&B.ord87.r==='care';await go('infirm');
  const why=q('[data-cure90]');if(why)why.click();await W8(300);r.guide=!!q('.cg90 .careguide[open]');const x=q('[data-cg90x]');if(x)x.click();await W8(200);r.guideClose=!q('.cg90');
  B.restWk=null;ord87Set(B,'off');
  /* ---- 4 · fatigue bands in a bout ---- */
  if(w.night.travel)w.night.travel.gone=true; /* v1.06 (397): an away bout is locked until Set off — the house has set off */
  const G=A;G.fat=10;const bo=w.night.bouts[bi];for(const k of w.night.bouts)k.ents=k.ents.filter(id=>id!==G.id);const o4=bo.ents.find(id=>!mine.has(id));bo.ents[bo.ents.indexOf(o4)]=G.id;
  r.seat=(boutCfg(bo,false).seats.find(s=>s.mgrGid===G.id)||{}).fat90==='fresh';
  const MV=mvMax;const rec=[];mvMax=function(p){const v=MV.apply(this,arguments);try{if(p&&p.mgrGid===G.id&&S){const f=p.fat90;p.fat90=null;const v0=MV.apply(this,arguments);p.fat90=f;rec.push([S.ri,f,v-v0,v0])}}catch(e){}return v};
  /* the sim's dice vary: a fighter who falls in round 1 leaves no later round to compare — fight again (≤4) */
  for(let k=0;k<4;k++){rec.length=0;try{await simEvent(boutCfg(bo,false))}catch(e){r.simErr=String(e)}if(rec.some(x=>x[1]==='fresh'&&x[0]>0))break}
  const fr=rec.filter(x=>x[1]==='fresh');r.fresh=fr.some(x=>x[0]===0&&x[2]===1)&&fr.filter(x=>x[0]>0).every(x=>x[2]===0)&&fr.some(x=>x[0]>0);
  rec.length=0;G.fat=80;r.seatW=(boutCfg(bo,false).seats.find(s=>s.mgrGid===G.id)||{}).fat90==='worn';
  try{await simEvent(boutCfg(bo,false))}catch(e){r.simErr2=String(e)}
  const wr=rec.filter(x=>x[1]==='worn');r.worn=wr.length>3&&wr.every(x=>x[3]===0||x[2]===-1);if(!r.fresh||!r.worn)r.dbgMv=JSON.stringify(rec.slice(0,20));
  mvMax=MV;G.fat=40;
  r.tired=(boutCfg(bo,false).seats.find(s=>s.mgrGid===G.id)||{}).fat90==='tired';
  await go('night');r.nightChip=!!q('tr.me .fb90');await go('practice');r.yardChip=[...document.querySelectorAll('.yo87r .fb90, .y92c .fb90')].some(e=>e.offsetWidth>0);
  /* ---- 3 · HP display clamps at 7 ---- */
  const BF=boostFor;boostFor=function(g){const b=BF.apply(this,arguments);if(g&&g.id===G.id)b.hp={head:5,chest:1,rarm:1};return b};
  delete G.inj;const H=hp90(G);r.clamp=H.loc.head.cur===7&&H.loc.head.bonus===2&&H.loc.chest.cur===7&&H.loc.chest.bonus===1&&H.loc.rarm.cur===6&&Object.values(H.loc).every(x=>x.cur<=7);
  MGR.inf90=G.id;await go('infirm');r.lighter=!!q('.iv90hp .sg90 u');boostFor=BF;
  r.def=hp90(G).def===31&&hp90(G).cur===31;
  return r});
for(const [k,v] of Object.entries(o))if(!/^dbg|^simErr/.test(k))ok(v,k);if(o.simErr||o.simErr2)miss.push('sim');
await pg.setViewportSize({width:390,height:844});await pg.waitForTimeout(500);
o.phone=await pg.evaluate(()=>document.documentElement.scrollWidth<=392&&getComputedStyle(document.querySelector('.iv90')).gridTemplateColumns.split(' ').length===1);ok(o.phone,'phone');
console.log(JSON.stringify(o));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

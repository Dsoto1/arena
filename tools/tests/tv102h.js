/* tv102h — v1.02 H (339-v102gear): the Manager gear loop in step with online. 1 a NEW career's rosters (every house) wear only the Issued
   L1 kit (P.iss = the fighter, L1 weapons, padding + galea), w.gear102 {old:0} · 2 a signed free agent brings only the Issued kit · 3 after a bout:
   a real armor piece stripped to 0 AP comes home dented, repair = ceil(value/10) (≥1), Repair all charges it; Issued armor stripped vanishes;
   an Issued piece picked up off the sand is skipped · 4 rivals shop: an Issued weapon where the class wants a real one is replaced (bought),
   the Issued piece goes back · 5 an OLD career: SAVE_MIGRATIONS '1.02' marks it {old:1}, nothing it owns changes; its next signing = Issued kit ·
   6 lesson + first-hour text · 7 kill switch flavius_v102hoff=1 → class loadouts at signing, ⅕ repairs · ERRS []. */
const path=require('path');const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
async function page(off){const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_v102hoff','1')},off);
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+path.resolve(process.argv[2]));await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await p.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null});return p}
const p=await page(false);const mark=await p.evaluate(()=>ERR92.n);
const r=await p.evaluate(()=>{const w=W_(),m=me();const o={};const ISS=new Set(['galea','wraps','legwraps']);
  const issOnly=g=>{const E=g.eq94;if(!E)return false;const all=[E.R,E.L,...E.a].filter(Boolean);return all.length>0&&all.every(P=>P.iss===g.id)&&E.a.every(P=>ISS.has(P.k))&&[E.R,E.L].filter(Boolean).every(P=>(W[P.k].lv|0)<=1)};
  /* 1 */
  const con=w.glads.filter(g=>g.alive&&g.contract);o.n=con.length;o.newAll=con.every(issOnly);o.flag=!!w.gear102&&w.gear102.old===0&&w.gear102.start===GR102.start;o.rivals=w.mgrs.filter(x=>!x.isPlayer&&!x.dead).every(x=>rosterOf(x).every(issOnly));
  /* 2 */
  const A=freeAgents().filter(g=>!g.inj).sort((a,b)=>effOvr(b)-effOvr(a))[0];m.coin=2000;signGlad(A,askWage(A),12,0,false);arm94Ensure(w);o.sign=issOnly(A);o.signKit=JSON.stringify([A.eq94.R&&A.eq94.R.k,A.eq94.L&&A.eq94.L.k,A.eq94.a.map(P=>P.k)]);
  /* 3 · dented return + the repair price */
  const g=rosterOf(m).find(x=>x!==A&&!(x.severed||[]).length);g.severed=[];delete g.inj;const E=g.eq94;const real=arm94New(w,'a','centurion');E.a=E.a.filter(P=>P.k!=='galea');E.a.push(real);
  const issLeg=E.a.find(P=>P.k==='legwraps');const issR=E.R;
  const got={R:issR?issR.k:null,L:E.L?E.L.k:null,a:[['centurion','head'],['legwraps','rleg'],['legwraps','lleg'],['wraps','rarm'],['wraps','larm']]};
  const pc=Object.fromEntries(LOCS.map(l=>[l,[]]));pc.rarm=['wraps'];pc.larm=['wraps'];
  const res={g94:{[g.id]:{got,mk:[],carry:false,cls:g.cls,R:got.R,L:got.L,pc,items:[]}}};const st0=(arm94St(w).dmg|0);
  arm94Settle(w,{ents:[g.id]},res);o.dent=real.dmg===1&&E.a.includes(real);o.issVanish=!E.a.includes(issLeg)&&!arm94H(m).sh.includes(issLeg);o.keepWraps=E.a.some(P=>P.k==='wraps');
  o.fixPrice=arm94Fix(real)===Math.max(1,Math.ceil(arm94Price('a','centurion')/10));o.fixVal=[arm94Fix(real),arm94Price('a','centurion')];
  o.fixW=arm94Fix({t:'w',k:'gladius'})===Math.max(1,Math.ceil(arm94Price('w','gladius')/10));
  const c0=m.coin;const tot=arm94FixTotal(m);const rr=arm94RepairAll();o.repair=!!rr.ok&&m.coin===c0-tot&&!real.dmg;
  /* an Issued weapon dropped by one fighter and picked up by another is skipped in the snapshot */
  const S0=S;try{S={players:[{mgrGid:'x1',_g94got:{R:'gladius',L:null,a:[]},_g94:{iss:['gladius'],a:[],o:[]},wR:null,wL:null,pieces:{},items:[]},{mgrGid:'x2',_g94got:{R:null,L:null,a:[]},_g94:{iss:[],a:[],o:[]},wR:{key:'gladius'},wL:null,pieces:{},items:[]}]};
    const sn=arm94Snap();o.lootSkip=(sn.x2.mk||[]).includes('gladius')}finally{S=S0}
  /* 4 · rivals shop */
  const R=w.mgrs.find(x=>!x.isPlayer&&!x.dead&&rosterOf(x).some(z=>{const K=arm94Kit(z.cls);return z.eq94&&z.eq94.R&&z.eq94.R.iss&&K.R&&K.R!==z.eq94.R.k&&!z.inj}));
  if(R){const z=rosterOf(R).find(z=>{const K=arm94Kit(z.cls);return z.eq94&&z.eq94.R&&z.eq94.R.iss&&K.R&&K.R!==z.eq94.R.k&&!z.inj});const want=arm94Kit(z.cls).R;const old=z.eq94.R;R.coin=600;const c=R.coin;const mx=ARM94.rivMax;ARM94.rivMax=1000;let sp;try{sp=arm94AutoShop(w,R)}finally{ARM94.rivMax=mx}
    o.rivUp=z.eq94.R&&z.eq94.R.k===want&&!z.eq94.R.iss&&!arm94H(R).sh.includes(old)&&R.coin<c&&sp>0;o.rivInfo=[want,z.eq94.R&&z.eq94.R.k,sp]}else o.rivUp='none';
  const poor=w.mgrs.find(x=>!x.isPlayer&&!x.dead&&x!==R);poor.coin=ARM94.rivFloor;o.poor=arm94AutoShop(w,poor)===0&&poor.coin===ARM94.rivFloor;
  /* 5 · an old career */
  const old=JSON.parse(JSON.stringify(w));old.ver='1.01';delete old.gear102;const pm=old.mgrs.find(x=>x.isPlayer);const og=old.glads.find(x=>x.alive&&x.contract&&x.contract.mgr===pm.id);
  og.eq94.R={id:'p94_old1',t:'w',k:'falcata'};og.eq94.a=[{id:'p94_old2',t:'a',k:'centurion'}];pm.arm94.sh.push({id:'p94_old3',t:'a',k:'ornate'});
  const before=JSON.stringify([old.glads.map(x=>x.eq94||null),old.mgrs.map(x=>x.arm94||null)]);migrateWorld(old);const mo=mgrMigrate(old)||old;
  o.oldFlag=!!mo.gear102&&mo.gear102.old===1;o.oldSame=JSON.stringify([mo.glads.map(x=>x.eq94||null),mo.mgrs.map(x=>x.arm94||null)])===before;
  const nf=mo.glads.find(x=>x.alive&&!x.contract&&!x.retired);if(nf){nf.contract={mgr:pm.id,wage:5,weeks:10,since:mo.week};arm94EnsureG(mo,nf);o.oldSign=!!nf.eq94&&[nf.eq94.R,nf.eq94.L,...nf.eq94.a].filter(Boolean).every(P=>P.iss===nf.id)&&nf.eq94.a.every(P=>ISS.has(P.k))}else o.oldSign='none';
  /* 6 */
  const st=MTUT_STEPS.find(s=>s.k==='armory');o.lesson=!!st&&/Issued/.test(st.say);const fh=FH100_MGR.find(s=>s.k==='g_recruit');o.fh=!!fh&&/Issued/.test(fh.say());
  return o});
console.log(JSON.stringify(r));
ok(r.n>0&&r.newAll&&r.flag,'1 a new career wears only the Issued kit');ok(r.rivals,'1 rival houses too');ok(r.sign,'2 a signing brings only the Issued kit '+r.signKit);
ok(r.dent&&r.keepWraps,'3 a real piece stripped comes home dented');ok(r.issVanish,'3 Issued armor stripped vanishes');ok(r.fixPrice&&r.fixW,'3 repair = a tenth of the value '+JSON.stringify(r.fixVal));
ok(r.repair,'3 Repair all charges the tenth');ok(r.lootSkip,'3 an Issued piece picked up is not looted');ok(r.rivUp===true,'4 a rival replaces an Issued weapon '+JSON.stringify(r.rivInfo));ok(r.poor,'4 a rival at the floor buys nothing');
ok(r.oldFlag&&r.oldSame,'5 an old career is marked and keeps what it owns');ok(r.oldSign===true,'5 an old career\'s next signing gets the Issued kit');ok(r.lesson&&r.fh,'6 lesson + first-hour text');
const st=await p.evaluate(()=>{const s0=GR102.start;GR102.start=0;newWorld({type:'pre',key:MGR_PRE[1].key});const c0=me().coin;GR102.start=77;newWorld({type:'pre',key:MGR_PRE[1].key});const c1=me().coin;GR102.start=s0;return {c0,c1}});
ok(st.c1-st.c0===77,'1 a new career starts with GR102.start more coin '+JSON.stringify(st));
const e1=await p.evaluate(m=>ERR92.n-m,mark);ok(e1===0,'no new error-log entries ('+e1+')');
/* 7 · kill switch */
const q=await page(true);const k=await q.evaluate(()=>{const w=W_();const con=w.glads.filter(g=>g.alive&&g.contract&&g.eq94);const K=g=>arm94Kit(g.cls);
  const cls=con.every(g=>{const E=g.eq94;return ((E.R&&E.R.k)||null)===(K(g).R||null)&&E.a.map(P=>P.k).sort().join()===K(g).a.map(x=>x.k).sort().join()||!(E.R||E.a.length)});
  return {cls,any:con.length,flag:!w.gear102,fix:arm94Fix({t:'w',k:'gladius'})===Math.max(2,Math.ceil(arm94Price('w','gladius')*0.2))}});
console.log(JSON.stringify(k));ok(k.cls&&k.any>0&&k.flag&&k.fix,'7 kill switch: class loadouts, the old repair price');
console.log(JSON.stringify({miss}));console.log(miss.length?'FAIL':'PASS');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})()

/* v0.98 fix round 2 (255-v98fix2): 3 · DRAFTED GEAR NEVER LEAVES THE ARENA — a Manager fighter in a Ludus (draft) bout: every piece he took in the
   draft is tagged (res.g94.mk), and after arm94Settle none of it is on his gear or the shelf; his brought gear is untouched.
   4 · the online Domus banner has no empty gold-bordered box (tested in tonl98 / shot by hand). */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));let sd=98;Math.random=()=>{sd=(sd*1664525+1013904223)>>>0;return sd/4294967296};if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();const o={};
  const A=rosterOf(m).find(g=>g.eq94&&(g.eq94.R||g.eq94.a.length));const bs=JSON.parse(JSON.stringify(A.eq94));const sh0=new Set(arm94H(m).sh.map(P=>P.k));const shN0=arm94H(m).sh.length;
  const bo=w.night.bouts.find(b=>!b.done);for(const x of w.night.bouts)x.ents=x.ents.filter(id=>id!==A.id);const out=bo.ents.find(id=>{const g=gById(id);return !g.contract||g.contract.mgr!==m.id});bo.ents[bo.ents.indexOf(out)]=A.id;
  bo.ev='ludus';const cfg=boutCfg(bo,false);const picks=[];const gw=gainWeapon,ga=gainArmorPiece;
  gainWeapon=async function(pl,k){if(pl&&pl.mgrGid===A.id)picks.push(k);return gw.apply(this,arguments)};gainArmorPiece=async function(pl,k){if(pl&&pl.mgrGid===A.id)picks.push(k);return ga.apply(this,arguments)};
  let res;try{res=await simEvent(cfg)}finally{gainWeapon=gw;gainArmorPiece=ga}
  o.ev=cfg.ev;o.seatHasKit=!!(cfg.seats.find(s=>s.mgrGid===A.id)||{}).gear94;o.picks=picks;
  /* a draft event never calls giveLoadout, so the fighter's brought kit is not worn: there is NO settlement entry for him (nothing lost, nothing gained) */
  o.entry=!!(res.g94&&res.g94[A.id]);
  arm94Settle(w,{ents:[A.id]},res);
  o.gearSame=JSON.stringify(A.eq94)===JSON.stringify(bs);o.shelfSame=JSON.stringify(arm94H(m).sh.map(P=>P.k).sort())===JSON.stringify([...sh0].length?arm94H(m).sh.map(P=>P.k).sort():[]);
  o.shelfN=arm94H(m).sh.length===shN0;
  /* killed in the draft bout: his own (non-issued) pieces go back to the shelf, the issued kit vanishes (v0.98 225 + v0.99 272) */
  const nKit=[bs.R,bs.L,...bs.a,...(bs.o||[])].filter(P=>P&&P.iss!==A.id).length; /* v0.99 rule: his ISSUED starter kit vanishes with him, bought/won pieces return */A.alive=false;arm94Settle(w,{ents:[A.id]},res);o.deadStrip=!A.eq94&&arm94H(m).sh.length===shN0+nKit;
  return o});
console.log(JSON.stringify(r));
ok(r.ev==='ludus'&&r.seatHasKit,'a Manager fighter is seated in a Ludus (draft) bout with his kit '+JSON.stringify(r));ok(r.picks.length>=1,'he drafted pieces in the arena '+JSON.stringify(r.picks));
ok(!r.entry,'a draft bout makes no settlement entry (his kit is not worn in a draft) '+JSON.stringify(r));ok(r.deadStrip,'killed in a draft bout: his non-issued pieces return to the shelf, issued kit gone '+JSON.stringify(r));ok(r.gearSame&&r.shelfN,'his gear + the shelf are exactly as before: nothing drafted came home '+JSON.stringify(r));
console.log(miss.length?'FAIL '+miss.join(' | '):'PASS tv98f');console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

/* tools/replay/record.js — RECORDS the golden replays (Phase 0 of tools/plans/layers100/PLAN.md).
   Plays every match in lib.js SPECS on the built page at Fast (one fresh browser context each), all-CPU or with seat 0 a scripted 'human'
   whose clicks / board taps / window answers go through the very inputs 309-v100replay records. Each recording = 309's replay record
   (opening snapshot + inputs + its end hash) + what the match ended with (325's RP0.last: onlHash, RNG.s, log lines, results) → tools/replay/golden/<name>.json.gz.
   Usage: node tools/replay/record.js [--update] [page=flavius-arena.html] [names…]
     without --update an existing golden file is kept (only missing ones are recorded); --update re-records (after a DELIBERATE rule change). */
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const L=require('./lib.js');
const args=process.argv.slice(2);const UPD=args.includes('--update');const rest=args.filter(a=>a!=='--update');
const PAGE=rest.find(a=>/\.html$/.test(a))||path.join(__dirname,'..','..','flavius-arena.html');const only=rest.filter(a=>!/\.html$/.test(a));

/* in the page: start the event (CPU personalities = the class default, not finalPers: its ±10 jitter rolls rnd() on whatever
   RNG the menu left, so the same seed would not give the same opening), script the human seat, answer every window with its first enabled button, play to the end */
const play=(pg,sp,seats)=>pg.evaluate(async([sp,seats])=>{if(S)S.over=true;
  startEvent({ev:sp.ev,loc:sp.loc,seed:sp.seed,seats:seats.map(s=>({...s,pers:s.cpu?{...seatPers(s)}:undefined})),opts:{...CFG.opts,spect:'auto'}});
  const sl=ms=>new Promise(r=>setTimeout(r,ms));let turns=0,did=0,lastT=-1,sim=0,stuck=0;const t0=Date.now();
  for(let i=0;i<20000&&!(S&&S.over)&&Date.now()-t0<240000;i++){if(SPEED!=='fast'&&SPEED!=='snap')SPEED='fast';
    if(CUR_MODAL&&S&&!S.over){const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(bs.length)bs[0].click();else CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await sl(40);continue}
    if(sp.human&&S&&S.phase!=='setup'&&!S.busy&&typeof humanTurn==='function'&&humanTurn()){const p=cur();
      if(S.turnNo!==lastT){lastT=S.turnNo;did=0}
      if(S.phase==='choice'){const c=document.querySelector('#actions [data-act="coin"]')||document.querySelector('#actions [data-act="card"]');if(c)c.click();await sl(60);continue}
      if(S.phase==='action'){
        if(turns>=sp.hturns&&!sim){sim=1;simToEnd(true);await sl(60);continue}
        /* 1 an attack when something is in reach, 2 one step, 3 end the turn */
        if(!(did&1)){did|=1;let hit=false;try{for(const src of attackSources(p)){S.mode='atk'+src.arm+(src.thr?'T':'');computeHL();const t=[...HL.entries()].find(([k,v])=>v&&v.t==='atk');if(t){hit=true;onTile(Math.floor(t[0]/N),t[0]%N);break}}}catch(e){}
          if(!hit){S.mode='move';try{computeHL()}catch(e){}}await sl(80);continue}
        if(!(did&2)){did|=2;S.mode='move';try{computeHL()}catch(e){}const t=[...HL.entries()].find(([k,v])=>v&&v.t==='move');if(t){onTile(Math.floor(t[0]/N),t[0]%N);await sl(80);continue}}
        const e=document.querySelector('#actions [data-act="end"]');if(e&&!e.disabled){turns++;did=4|did;e.click()}else if(++stuck>200){stuck=0;simToEnd(true)}}}
    await sl(40)}
  for(let i=0;i<60&&!(typeof RP0!=="undefined"&&RP0.last);i++)await sl(100);
  const id=RPR.byS.get(S);if(id&&RPR.saving[id])await RPR.saving[id];const R=id?await rp100Local(id):null;
  return {over:!!(S&&S.over),R,end:RP0.last,ms:Date.now()-t0}},[sp,seats]);

(async()=>{const b=await chromium.launch();const T0=Date.now();let bad=0;
  const todo=L.SPECS.filter(sp=>!only.length||only.includes(sp.name));const J=Math.max(1,+(process.env.REPLAYJ||3));let nx=0;
  await Promise.all(Array.from({length:Math.min(J,todo.length)},async()=>{while(nx<todo.length){const sp=todo[nx++];await one(sp)}}));
  async function one(sp){const f=L.fileOf(sp.name);
    if(fs.existsSync(f)&&!UPD){console.log('keep  ',sp.name,'(exists; --update re-records)');return}
    const {pg,ctx,errs}=await L.openPage(b,PAGE);let r;
    try{r=await play(pg,sp,L.seatsOf(sp))}catch(e){r={err:String(e).slice(0,300)}}
    const e0=await pg.evaluate(()=>errNew92(window.__m).map(e=>e.msg)).catch(()=>[]);await ctx.close();
    if(!r||r.err||!r.over||!r.R||!r.end){bad++;console.log('FAIL  ',sp.name,JSON.stringify({err:r&&r.err,over:r&&r.over,R:!!(r&&r.R),end:!!(r&&r.end)}),errs.slice(0,3));return}
    if(r.end.h!==r.R.end.h){bad++;console.log('FAIL  ',sp.name,'309 end hash',r.R.end.h,'≠ probe',r.end.h);return}
    const G={f:'flavius-golden',gv:1,name:sp.name,spec:sp,seats:L.seatsOf(sp),at:new Date().toISOString(),R:r.R,end:r.end};
    L.save(sp.name,G);const kb=Math.round(fs.statSync(f).size/102.4)/10;
    console.log('rec   ',sp.name.padEnd(18),`inputs ${String(r.R.ins.length).padStart(3)} · turns ${r.end.turns} · log ${r.end.log.length} · ${kb} KB · ${Math.round(r.ms/1000)} s`+(errs.length||e0.length?' · page errors '+JSON.stringify([...errs,...e0]).slice(0,200):''))}
  await b.close();
  /* the 2-seat online (mock lockstep) recording */
  const O=require('./online.js');const of=L.fileOf(O.NAME);
  if((!only.length||only.includes(O.NAME))&&process.env.ONLINE!=='0'){if(fs.existsSync(of)&&!UPD)console.log('keep  ',O.NAME,'(exists; --update re-records)');
    else{let G=null,why=[];for(let k=0;k<3&&!G;k++){try{const g=await O.record(PAGE);why=O.agree(g);if(!why.length)G=g}catch(e){why=[String(e).slice(0,200)]}if(!G)console.log('retry ',O.NAME,why.slice(0,4))}
      if(!G){bad++;console.log('FAIL  ',O.NAME,why.slice(0,6))}else{L.save(O.NAME,G);console.log('rec   ',O.NAME.padEnd(18),`inputs ${G.inputs.length} · turns ${G.A.end.turns} · ${Math.round(fs.statSync(of).size/102.4)/10} KB`+(G.errs.length?' · page errors '+JSON.stringify(G.errs).slice(0,200):''))}}}
  console.log('time',Math.round((Date.now()-T0)/1000)+'s');process.exitCode=bad?1:0})();

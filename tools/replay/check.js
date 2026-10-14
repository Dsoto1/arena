/* tools/replay/check.js — REPLAYS every golden recording (tools/replay/golden/*.json.gz, made by record.js) on the current build and
   compares what the match ends with: onlHash, RNG.s (the dice stream), turns/round/rotation, winners + reason, each seat's result, the
   beasts, and every log line since the opening. Playback = 309's own rp100Play (the opening snapshot + the recorded inputs at the same
   settled points), in a fresh browser context per recording. Prints the first difference (field, log line + turn, which input 309's player
   was at) and exits 1 on any mismatch. Same inputs → same game: the safety net for the layers refactor (tools/plans/layers100/PLAN.md).
   Usage: node tools/replay/check.js [page=flavius-arena.html] [names…]     (ONLINE=0 skips the 2-seat online mock check) */
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const L=require('./lib.js');

async function replay(b,G,PAGE){const {pg,ctx,errs}=await L.openPage(b,PAGE);const t0=Date.now();
  try{await pg.evaluate(async R=>{await rp100Play(R.id,{R,force:true});rp100Speed(4)},G.R);
    await pg.waitForFunction(()=>RPP.end&&typeof RP0!=="undefined"&&RP0.last,null,{timeout:300000,polling:250}).catch(()=>{});
    const o=await pg.evaluate(()=>({end:RP0.last,rp:RPP.end,div:RPP.div,i:RPP.i,n:RPP.ins.length,turn:S&&S.turnNo,phase:S&&S.phase,errs:errNew92(window.__m).map(e=>e.msg)}));
    o.ms=Date.now()-t0;o.perrs=errs;return o}finally{await ctx.close()}}

async function run(PAGE,only=[]){const T0=Date.now();
  const files=fs.existsSync(L.GOLD)?fs.readdirSync(L.GOLD).filter(f=>/\.json\.gz$/.test(f)&&f!=='online-mock.json.gz').sort():[];
  const sel=files.filter(f=>!only.length||only.includes(f.replace(/\.json\.gz$/,'')));
  const onl=process.env.ONLINE!=='0'&&(!only.length||only.includes('online-mock'));
  if(!sel.length&&!onl){console.log('no golden recordings — run node tools/replay/record.js');return 1}
  const b=await chromium.launch();let bad=0;
  /* the online check runs beside the offline ones (its own browser); offline recordings REPLAYJ at a time (default 3), printed in order */
  const onlP=onl?require('./online.js').check(PAGE).catch(e=>{console.log('FAIL   online-mock',String(e).slice(0,300));return false}):null;
  const J=Math.max(1,+(process.env.REPLAYJ||3));const res=new Array(sel.length);let nx=0;
  await Promise.all(Array.from({length:Math.min(J,sel.length)},async()=>{while(nx<sel.length){const k=nx++;const G=L.load(path.join(L.GOLD,sel[k]));let o;
    try{o=await replay(b,G,PAGE)}catch(e){o={err:String(e).slice(0,300)}}res[k]={G,o}}}));
  for(const {G,o} of res){
    if(!o||o.err||!o.end){bad++;console.log('FAIL  ',G.name.padEnd(18),'did not reach its end',JSON.stringify({err:o&&o.err,turn:o&&o.turn,phase:o&&o.phase,input:o&&`${o.i}/${o.n}`,div:o&&o.div}),(o&&o.perrs||[]).slice(0,3));continue}
    const d=L.diff(G.end,o.end);
    if(d){bad++;console.log('FAIL  ',G.name.padEnd(18),`first divergence: ${d.field}${d.field==='turn hash'?' at beginTurn #'+(d.idx+1)+' (S.turnNo '+d.turn+' on entry)':''}${d.line!=null?' · log line '+d.line+(d.field==='log'?' (turn '+d.turn+')':''):''}`+(o.div?` · 309 noticed it at ${o.div.where} (turn ${o.div.turn})`:'')+` · input ${o.i}/${o.n}`);
      console.log('        want:',d.want);console.log('        got: ',d.got);if(d.event)console.log('        first log difference:',d.event.slice(0,400));continue}
    console.log('ok    ',G.name.padEnd(18),`hash ${o.end.h} · rng ${o.end.rng} · ${o.end.turns} turns · ${o.end.log.length} log lines · inputs ${o.i}/${o.n} · ${Math.round(o.ms/1000)} s`+(o.errs.length||o.perrs.length?' · page errors '+JSON.stringify([...o.perrs,...o.errs]).slice(0,200):''))}
  await b.close();
  if(onlP&&!(await onlP))bad++
  console.log('time',Math.round((Date.now()-T0)/1000)+'s');console.log(bad?`REPLAY: ${bad} mismatch(es)`:'REPLAY: all recordings replay to the same game');return bad}
module.exports={run};
if(require.main===module){const args=process.argv.slice(2);const PAGE=args.find(a=>/\.html$/.test(a))||path.join(__dirname,'..','..','flavius-arena.html');
  run(PAGE,args.filter(a=>!/\.html$/.test(a))).then(bad=>{process.exitCode=bad?1:0})}

/* tnode101 — v1.01 wave 2, Phase D1: THE RULES RUN IN NODE (no browser). Plain node, no Playwright.
   1. every golden (tools/replay/golden, recorded in Chromium) replays in Node to the SAME game: rules mode (HEADLESS, what Phase E's
      verifier runs: end hash, RNG.s, results, per-turn hashes, every online input's pre-hash) and screen mode (+ every log line);
   2. a headless simEvent of every printed event runs to its end (times printed);
   3. the bundle (tools/node/mkbundle.js → a temp dir) carries the same build hash and replays + sims from its own copy.
   argv[2] = the page. Prints ERRS [] on pass. Under smartreg (REGCOV) it writes the game script's function coverage like tools/regcov.js. */
const path=require('path'),fs=require('fs'),os=require('os');
const PAGE=path.resolve(process.argv[2]||path.join(__dirname,'..','..','flavius-arena.html'));
const ERRS=[];const T0=Date.now();
/* coverage for smartreg: the same {len, offs} regcov.js writes (offsets into the page's inline script = "\n" + the code) */
let cov=null;if(process.env.REGCOV){const insp=require('inspector');cov=new insp.Session();cov.connect();cov.post('Profiler.enable');cov.post('Profiler.startPreciseCoverage',{callCount:false,detailed:false})}
function covWrite(){return new Promise(res=>{if(!cov)return res();cov.post('Profiler.takePreciseCoverage',(e,r)=>{try{const offs=new Set();let len=0;
  for(const s of (r&&r.result)||[]){if(!/\.(js|html)$/.test(s.url)||/tools[\\/](node|tests|replay)/.test(s.url))continue;const top=s.functions.reduce((m,f)=>Math.max(m,f.ranges[0].endOffset),0);if(top<1e6)continue;len=top+1;
    for(const f of s.functions){const g=f.ranges[0];if(g.count>0&&!(g.startOffset===0&&g.endOffset>=top-2))offs.add(g.startOffset+1)}}
  fs.writeFileSync(process.env.REGCOV,JSON.stringify({len,offs:[...offs]}))}catch(x){}res()})})}
(async()=>{try{
  const RP=require('../node/replay.js'),SIM=require('../node/sim.js'),MB=require('../node/mkbundle.js');
  /* 1 — the goldens, both modes */
  const files=RP.goldens();if(files.length<15)ERRS.push('only '+files.length+' golden recordings (15 expected)');
  for(const f of files){const G=RP.loadG(f);for(const mode of ['rules','screen']){let r;try{r=await RP.replayGolden(G,{page:PAGE,mode})}catch(e){r={ok:false,diff:{field:'crash',got:String(e&&e.stack||e).slice(0,300)},errors:[]}}
    const w=r.want||{},g=r.got||{};console.log((r.ok?'ok    ':'FAIL  ')+G.name.padEnd(18)+mode.padEnd(7)+`browser ${w.h} ${w.rng} ${w.log} · node ${g.h} ${g.rng} ${g.log} · ${r.ms} ms`);
    if(!r.ok)ERRS.push(`${G.name} (${mode}): ${JSON.stringify(r.diff).slice(0,240)}`);if(r.errors&&r.errors.length)ERRS.push(`${G.name} (${mode}) page errors: ${JSON.stringify(r.errors).slice(0,240)}`)}}
  /* 2 — a headless sim of every printed event */
  {const P=await SIM.openSim(PAGE);const times=[];for(const ev of SIM.EVENTS_ALL){const r=await SIM.simIn(P,ev,1);times.push(r.ms);
      console.log((r.ok?'ok    ':'FAIL  ')+'sim '+ev.padEnd(13)+(r.ok?`${r.turns} turns · ${r.h} · ${r.ms} ms`:r.err));if(!r.ok)ERRS.push('sim '+ev+': '+String(r.err).slice(0,200))}
    console.log('sims: avg',Math.round(times.reduce((a,b)=>a+b,0)/times.length),'ms, max',Math.round(Math.max(...times)),'ms');
    if(P.errors.length)ERRS.push('sim page errors: '+JSON.stringify(P.errors.map(String)).slice(0,240));P.close()}
  /* 3 — the bundle: same build hash, replays and sims from its own copy */
  {const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rules101-'));try{const b=MB.bundle(PAGE,dir);const h=MB.buildHash(require('../node/page.js').splitPage(fs.readFileSync(PAGE,'utf8')).code);
      if(b.build!==h)ERRS.push('bundle build hash '+b.build+' ≠ page '+h);console.log(`bundle build ${b.build} v${b.v} · ${(b.bytes/1048576).toFixed(2)} MB`);
      const R=require(b.file);for(const n of ['cassian-human','online-mock']){const G=RP.loadG(RP.goldens([n])[0]);const r=await RP.replayGolden(G,{page:R.page,mode:'rules'});
        console.log((r.ok?'ok    ':'FAIL  ')+'bundle '+n+' '+(r.got&&r.got.h)+' · '+r.ms+' ms');if(!r.ok)ERRS.push('bundle '+n+': '+JSON.stringify(r.diff).slice(0,200))}
      const P=await R.open({ls:{flavius_firstrun:'shown',flavius_first100off:'1'}});await P.until(()=>P.G.FLAVIUS_READY,60000);const s=await SIM.simIn(P,'democritus',3);
      console.log((s.ok?'ok    ':'FAIL  ')+'bundle sim democritus '+(s.h||s.err));if(!s.ok)ERRS.push('bundle sim: '+s.err);P.close()}
    finally{fs.rmSync(dir,{recursive:true,force:true})}}
}catch(e){ERRS.push(String(e&&e.stack||e).slice(0,400))}
  await covWrite();console.log('time',Math.round((Date.now()-T0)/1000)+'s');console.log('ERRS '+JSON.stringify(ERRS));process.exitCode=ERRS.length?1:0;process.exit()})();

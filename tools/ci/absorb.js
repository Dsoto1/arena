/* tools/ci/absorb.js <artifacts dir> <mode> [order file] — v1.08c (his 3a): folds the CI shards' smartreg state back into the
   committed tools/regstate.json + tools/regmap.json.gz, so the next smart plan (here and in every worktree) starts from fresh history
   and coverage instead of a week-old one.

   Each shard artifact reg-N/ holds reg.txt (which tests it ran) + regstate.json + regmap.json.gz written by `smartreg -j 2 <names>`
   on the tested commit. For every test a shard ran: its record (streak, runs, lastAt, deps, flaky…) and its coverage entry replace
   the committed ones (function hashes re-indexed into one table; the shape set it points at is copied). The run counter takes the
   highest. A FULL run with no real failure and every shard finished also stamps lastFull and the build order (from the order file:
   the tested commit's build.sh list, saved before the job moves to the branch's newest commit).
   It works on whatever tools/regstate.json is checked out, so the workflow can re-apply it on top of a newer push (retry loop). */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const [dir,mode,orderFile]=process.argv.slice(2);const R=path.join(__dirname,'..','..');
/* `absorb.js --order` prints the build order of the checked-out build.sh (smartreg's ORDER) — the workflow saves it before moving on */
if(dir==='--order'){process.stdout.write(fs.readFileSync(path.join(R,'build.sh'),'utf8').match(/\bcat (src\/[\w\/.-]+\.js [^;]+);/)[1].trim().split(/\s+/).join(' ')+'\n');process.exit(0)}
const STATE=path.join(R,'tools','regstate.json'),MAP=path.join(R,'tools','regmap.json'),MAPGZ=MAP+'.gz';
const readJ=(f,d)=>{try{return JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){return d}};
const readMap=(gz,js)=>{try{if(fs.existsSync(gz))return JSON.parse(zlib.gunzipSync(fs.readFileSync(gz)).toString('utf8'))}catch(e){}return readJ(js,{fh:[],t:{}})};
const st=readJ(STATE,{run:0,lastFull:0,tests:{}}),M=readMap(MAPGZ,MAP);M.fh=M.fh||[];M.t=M.t||{};
const FHI=new Map(M.fh.map((x,i)=>[x,i]));const idx=x=>{let i=FHI.get(x);if(i==null){i=M.fh.length;M.fh.push(x);FHI.set(x,i)}return i};
let n=0,shards=0,unfinished=0;const fail=new Set(),pass=new Set(),flaky=new Set();
for(const d of fs.existsSync(dir)?fs.readdirSync(dir).sort():[]){const D=path.join(dir,d),txt=path.join(D,'reg.txt');if(!fs.existsSync(txt))continue;shards++;
  const t=fs.readFileSync(txt,'utf8');if(!/ALLDONE/.test(t))unfinished++;
  const ran=[];for(const b of t.split(/^== /m).slice(1)){const name=b.split(' ==')[0].trim();ran.push(name);(/^exit=0$/m.test(b)&&!/ERRS \[[^\]]/.test(b)?pass:fail).add(name)}
  const fl=t.match(/^FLAKY[^:]*:\s*(.+)$/m);if(fl)fl[1].trim().split(/\s+/).forEach(x=>flaky.add(x));
  const s2=readJ(path.join(D,'regstate.json'),null),m2=readMap(path.join(D,'regmap.json.gz'),path.join(D,'regmap.json'));if(!s2){console.log('absorb: '+d+' has no regstate.json — skipped');continue}
  st.run=Math.max(st.run||0,s2.run||0);st.shapeSets=st.shapeSets||{};
  for(const name of new Set(ran)){const rec=s2.tests&&s2.tests[name];if(!rec)continue;st.tests[name]=rec;n++;
    if(rec.sh&&s2.shapeSets&&s2.shapeSets[rec.sh])st.shapeSets[rec.sh]=s2.shapeSets[rec.sh];
    const e=m2.t&&m2.t[name];if(e)M.t[name]={...e,fi:(e.fi||[]).map(i=>idx(m2.fh[i])).filter(i=>i!=null)}}}
const real=[...fail].filter(x=>!pass.has(x)&&!flaky.has(x));
if(mode==='full'&&shards&&!unfinished&&!real.length){st.lastFull=Date.now();
  if(orderFile&&fs.existsSync(orderFile))st.order=fs.readFileSync(orderFile,'utf8').trim()}
{const used=new Set(Object.values(st.tests).map(x=>x.sh));for(const k of Object.keys(st.shapeSets||{}))if(!used.has(k))delete st.shapeSets[k]}
fs.writeFileSync(STATE,JSON.stringify(st,null,1));fs.writeFileSync(MAPGZ,zlib.gzipSync(JSON.stringify(M),{level:9}));try{fs.unlinkSync(MAP)}catch(e){}
console.log(`absorb: ${n} test records from ${shards} shards · mode ${mode} · real failures ${real.length}${unfinished?' · unfinished shards '+unfinished:''} · lastFull ${st.lastFull?new Date(st.lastFull).toISOString():'-'}`);
if(!n)process.exit(3);

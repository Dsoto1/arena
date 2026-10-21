/* tools/ci/report.js <dir> <mode> — merges the shards' reg.txt (artifacts reg-<n>/reg.txt) into one summary (job summary + log),
   prints one CIRESULT line {mode,pass:[...],fail:[...],flaky:[...],missing:[...]} for tools/ci/absorb.js, exits 1 on a real failure
   or a shard that never reported. v1.08c: with a repeated named run (dispatch tests + repeat) a shard's reg.txt holds every
   repetition; REPEAT lines give each test's first-try passes ("tv106d 19/20") and any first-try failure fails the run (his 8a). */
const fs=require('fs'),path=require('path');const [dir,mode]=process.argv.slice(2);
const pass=[],fail=[],flaky=[],shards=[];let bad=0;const cnt={};
for(const d of fs.existsSync(dir)?fs.readdirSync(dir).sort():[]){const f=path.join(dir,d,'reg.txt');if(!fs.existsSync(f)){shards.push(d+' no reg.txt');bad=1;continue}
  const t=fs.readFileSync(f,'utf8');if(!/ALLDONE/.test(t)){shards.push(d+' unfinished');bad=1}
  for(const b of t.split(/^== /m).slice(1)){const name=b.split(' ==')[0].trim(),ok=/^exit=0$/m.test(b)&&!/ERRS \[[^\]]/.test(b);(ok?pass:fail).push(name);const c=cnt[name]||(cnt[name]={p:0,n:0});c.n++;if(ok)c.p++}
  const fl=t.match(/^FLAKY[^:]*:\s*(.+)$/m);if(fl)flaky.push(...fl[1].trim().split(/\s+/))}
const repeated=mode==='named'&&Object.values(cnt).some(c=>c.n>1);
const realFail=repeated?Object.keys(cnt).filter(k=>cnt[k].p<cnt[k].n):fail.filter(x=>!pass.includes(x)&&!flaky.includes(x));
if(repeated)for(const k of Object.keys(cnt).sort())console.log(`REPEAT ${k} ${cnt[k].p}/${cnt[k].n}`);const res={mode,pass:[...new Set(pass)],fail:[...new Set(realFail)],flaky:[...new Set(flaky)],shards};
const line=`regression (${mode}): pass ${res.pass.length} · fail ${res.fail.length} · flaky ${res.flaky.length}${res.fail.length?' · FAILED: '+res.fail.join(' '):''}${res.flaky.length?' · flaky: '+res.flaky.join(' '):''}${shards.length?' · shards: '+shards.join(', '):''}`;
console.log(line);console.log('CIRESULT '+JSON.stringify(res));
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`### ${res.fail.length||bad?'❌':'✅'} ${line}\n`);
process.exit(res.fail.length||bad?1:0);

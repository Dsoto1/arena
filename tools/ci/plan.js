/* tools/ci/plan.js — decides what the GitHub Actions regression runs (see budget.json). Prints GitHub outputs:
   mode=full|smart|skip, matrix={"include":[{shard,tests}]}, why=<text>. Minutes used this billing cycle = the billable
   Linux time of this repo's workflow runs since the cycle started (GET /actions/runs + /timing, GITHUB_TOKEN actions:read). */
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const R=path.join(__dirname,'..','..');const B=JSON.parse(fs.readFileSync(path.join(__dirname,'budget.json'),'utf8'));
const st=JSON.parse(fs.readFileSync(path.join(R,'tools','regstate.json'),'utf8'));
const ALL=[...new Set(fs.readFileSync(path.join(R,'tools','runreg.sh'),'utf8').match(/DEFAULT="([^"]+)"/)[1].trim().split(/\s+/))];
const now=new Date(),day=now.toISOString().slice(0,10);
function cycleStart(){const d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),B.billing_day));if(d>now)d.setUTCMonth(d.getUTCMonth()-1);return d}
function cycleEnd(){const d=cycleStart();d.setUTCMonth(d.getUTCMonth()+1);return d}
async function gh(p){const r=await fetch('https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY+p,{headers:{authorization:'Bearer '+process.env.GITHUB_TOKEN,accept:'application/vnd.github+json'}});if(!r.ok)throw new Error(p+' '+r.status);return r.json()}
async function usedMin(){if(!process.env.GITHUB_TOKEN)return {used:0,today:0};const since=cycleStart().toISOString().slice(0,10);let used=0,today=0;
  for(let page=1;page<=10;page++){const j=await gh(`/actions/runs?per_page=100&page=${page}&created=>=${since}`);for(const run of j.workflow_runs){
    if(String(run.id)===String(process.env.GITHUB_RUN_ID))continue;let ms=0;try{const t=await gh(`/actions/runs/${run.id}/timing`);for(const k in (t.billable||{}))ms+=t.billable[k].total_ms||0}catch(e){}
    const m=Math.ceil(ms/60000);used+=m;if(run.created_at.slice(0,10)===day)today+=m}
    if(j.workflow_runs.length<100)break}
  return {used,today}}
const tm=t=>Math.max(20,((st.tests[t]||{}).time||60));
function shard(tests,n){const s=[...Array(n)].map((_,i)=>({shard:i+1,t:[],load:0}));for(const t of [...tests].sort((a,b)=>tm(b)-tm(a))){const m=s.reduce((a,b)=>a.load<=b.load?a:b);m.t.push(t);m.load+=tm(t)/B.jobs}
  return s.filter(x=>x.t.length).map(x=>({shard:x.shard,tests:x.t.join(' '),est:Math.round(x.load)}))}
function smartPlan(){let out='';try{out=execSync('node tools/smartreg.js --dry',{cwd:R,encoding:'utf8',timeout:120000})}catch(e){out=String(e.stdout||'')}
  const t=[];for(const line of out.split('\n')){const m=line.match(/^\s+(warming|changed|new|flaky|pinned|stale|rotation|full):\s+(.+)$/);if(m)t.push(...m[2].trim().split(/\s+/))}
  if(/· FULL ·|stale/.test(out.split('\n')[0]||''))return ALL;return [...new Set(t)].filter(x=>ALL.includes(x))}
(async()=>{const ev=process.env.EVENT||'push',want=(process.env.INPUT_MODE||'auto'),msg=process.env.COMMIT_MSG||'';
  let chg='';try{chg=execSync('git diff --name-only HEAD~1 HEAD',{cwd:R,encoding:'utf8'})}catch(e){}
  const release=/\[full\]/i.test(msg)||/^version\.json$/m.test(chg);
  const U=await usedMin().catch(e=>({used:0,today:0,err:String(e)}));
  const left=B.month_cap-U.used,daysLeft=Math.max(1,Math.ceil((cycleEnd()-now)/864e5)),allow=Math.max(0,Math.floor((left-B.reserve)/daysLeft));
  let mode,tests,why;const exclusive=day<=B.exclusive_until;
  if(want==='full'||exclusive||release){mode='full';tests=ALL;why=want==='full'?'manual full run':exclusive?`exclusive week (until ${B.exclusive_until})`:'release'}
  else{mode='smart';tests=want==='smart'||want==='auto'?smartPlan():ALL;why='spread: tests this change reaches'}
  let n=mode==='full'?B.shards_full:Math.max(1,Math.min(B.shards_full,Math.ceil(tests.reduce((a,t)=>a+tm(t),0)/B.jobs/B.shard_target_s)));
  const sh=shard(tests,n);const cost=sh.reduce((a,s)=>a+Math.ceil(s.est/60)+B.setup_min,0);
  if(!tests.length){mode='skip';why='nothing this change reaches'}
  else if(cost>left-(mode==='full'&&release?0:B.reserve)){mode='skip';why=`over the cycle budget (left ${left} min, needs ~${cost})`}
  else if(mode==='smart'&&U.today+cost>allow&&!exclusive){mode='skip';why=`over today's allowance (${U.today}+${cost} > ${allow} min/day) — run it locally`}
  const sum=`mode ${mode} · ${why} · ${tests.length} tests in ${sh.length} shards · est ${cost} min · used this cycle ${U.used}/${B.month_cap} (today ${U.today}) · allowance ${allow}/day for ${daysLeft} days${U.err?' · usage unknown: '+U.err:''}`;
  console.log(sum);const o=process.env.GITHUB_OUTPUT;if(o){fs.appendFileSync(o,`mode=${mode}\nmatrix=${JSON.stringify({include:sh.map(s=>({shard:s.shard,tests:s.tests}))})}\nwhy=${sum}\n`)}
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`### Regression plan\n${sum}\n`)})();

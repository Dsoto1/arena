/* perf100: node tools/plans/perf100/cmp.js [before=scenes_before.json] [after=scenes_after.json] — task/script ms per second, paints and commits per second */
const fs=require('fs'),path=require('path');
const rd=f=>Object.fromEntries(JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8')).map(r=>[r.label,r]));
const B=rd(process.argv[2]||'scenes_before.json'),A=rd(process.argv[3]||'scenes_after.json');
const f=r=>`task ${r.cdp.taskMsPerS} script ${r.cdp.scriptMsPerS} layout ${r.cdp.layoutMsPerS}ms paints/s ${r.trace.paint.perS} commits/s ${r.trace.commit.perS} anims ${r.anims.running}`;
for(const k of Object.keys(B)){const a=A[k];console.log(k);console.log('  before',f(B[k]));console.log('  after ',a?f(a):'missing');
  if(a){console.log('  running:',a.anims.by.map(x=>x[0]+(x[1].off?'(off)':'')).join(', '));console.log('  forced-layout sites:',JSON.stringify(a.layoutReads.sites.slice(0,3)))}}

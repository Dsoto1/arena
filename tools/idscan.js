/* idscan.js — release hygiene: no AWS / Google identifiers in the public repo (v1.14a).
   Scans every tracked text file; prints file:line  kind  and exits 1 on any hit. Usage: node tools/idscan.js */
const {execSync}=require('child_process'),fs=require('fs');
const SKIP=new Set(['tools/regmap.json.gz','tools/regstate.json']);
const RULES=[
 ['ARN with account number',/arn:aws[a-z-]*:[a-z0-9-]+:[a-z0-9-]*:[0-9]{12}:/],
 ['Cognito user pool id',/\b(us|eu|ap|ca|sa|me|af)-[a-z]+-[0-9]_[A-Za-z0-9]{9}\b/],
 ['Google OAuth client id',/[0-9]{6,}-[a-z0-9]{20,}\.apps\.googleusercontent\.com/],
 ['CloudFront distribution id',/\bE(?=[A-Z]*[0-9])(?=[0-9]*[A-Z])[A-Z0-9]{12,13}\b/],   /* E + 12–13 upper-case letters AND digits (a word like EXTRAORDINARII is not one) */
];
let n=0;
for(const f of execSync('git ls-files -z',{maxBuffer:1<<28}).toString().split('\0')){
  if(!f||SKIP.has(f)||!fs.existsSync(f))continue;
  let b;try{b=fs.readFileSync(f)}catch(e){continue}
  if(b.subarray(0,8000).includes(0))continue; /* binary */
  b.toString('utf8').split('\n').forEach((l,i)=>{if(l.length>20000)return;
    for(const [k,re] of RULES)if(re.test(l)){console.log(f+':'+(i+1)+'  '+k);n++;break}});
}
if(n){console.log('idscan: '+n+' identifier hit(s) — replace each by where to find it (CLAUDE.md §6)');process.exit(1)}
console.log('idscan: clean');

/* testlist.js — every test file in tools/tests (t*.js) must be in tools/runreg.sh DEFAULT, or CI never runs it.
   (v1.03: six v1.0/v1.01 tests were found that had never run.) Helpers that are not tests go in HELPERS. */
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
const HELPERS=new Set(['tv101s_old','tshare54']);
const m=fs.readFileSync(path.join(root,'tools/runreg.sh'),'utf8').match(/DEFAULT="([^"]*)"/);
if(!m){console.error('testlist: no DEFAULT= in tools/runreg.sh');process.exit(1)}
const listed=new Set(m[1].trim().split(/\s+/));
const files=fs.readdirSync(path.join(root,'tools/tests')).filter(f=>/^t.*\.js$/.test(f)).map(f=>f.slice(0,-3));
const shards=new Set(['t12a','t12b','t12c']);
const missing=files.filter(n=>!listed.has(n)&&!HELPERS.has(n)&&!(n==='t12'&&[...shards].every(s=>listed.has(s))));
const gone=[...listed].filter(n=>!files.includes(n)&&!shards.has(n));
if(missing.length)console.error('testlist: tests NOT in runreg DEFAULT (CI never runs them): '+missing.join(' '));
if(gone.length)console.error('testlist: DEFAULT names with no test file: '+gone.join(' '));
if(missing.length||gone.length)process.exit(1);
console.log('testlist: '+files.length+' test files, all listed');

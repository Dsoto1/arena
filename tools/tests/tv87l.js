/* v0.87 languages: the tv86 screen walk (B/C: menu → Play Now turn → Settings → Rules → Manager tabs → Studio → Online) in Italian,
   Portuguese (Brazil), French and German — each loads only its own assets/lang_<l>.js; no page errors, the language is selected,
   leftover English and cut-off texts stay under the ceilings (LEFT_MAX / CUT_MAX). */
const {spawnSync}=require('child_process'),path=require('path');let bad=0;
for(const L of ['it','pt','fr','de','zh']){const r=spawnSync(process.execPath,[path.join(__dirname,'tv86.js'),process.argv[2]],{env:{...process.env,WALK_LANG:L},encoding:'utf8',timeout:400000});
  const o=(r.stdout||'')+(r.stderr||'');console.log('── '+L+' exit='+r.status);console.log(o.split('\n').filter(x=>/^(ERRS|MISS|\{"c")/.test(x)).map(x=>x.slice(0,600)).join('\n'));if(r.status!==0)bad++}
console.log('ERRS []');process.exit(bad?1:0);

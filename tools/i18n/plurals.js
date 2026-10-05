/* v0.87: lists the _T keys whose placeholder carries an English plural ending (${n>1?'s':''}, ${n===1?'':'s'}, ?'ies':'y',
   ?'are':'is', ?'were':'was' …). In other languages those keys should use the plural form {n|singular|plural} (00-lang):
   the first text when value n is the English singular ('' / 1 / 'is' …), the second otherwise.
   Output: tools/i18n/plurals.json = [{k, idx:[n…], w:'file:line'}]. */
const fs=require('fs'),path=require('path');const SRC=path.join(__dirname,'..','..','src');
const PL=/\?\s*(['"])(s|es|ies|are|were|have|they|them|their)\1\s*:\s*(['"])(|y|is|was|has|he|him|his|it|its)?\3|\?\s*(['"])(|y|is|was|has)\5\s*:\s*(['"])(s|es|ies|are|were|have)\7/;
const out=[];
for(const f of fs.readdirSync(SRC).filter(f=>f.endsWith('.js'))){const s=fs.readFileSync(path.join(SRC,f),'utf8');
  let i=0;while((i=s.indexOf('_T`',i))>=0){let j=i+3,parts=[],cur='',exprs=[],d=0;
    for(;j<s.length;j++){const c=s[j];if(c==='\\'){cur+=s[j]+s[j+1];j++;continue}if(c==='`')break;
      if(c==='$'&&s[j+1]==='{'){let k=j+2,depth=1,e='';for(;k<s.length&&depth;k++){if(s[k]==='{')depth++;else if(s[k]==='}')depth--;if(depth)e+=s[k]}
        parts.push(cur);cur='';exprs.push(e);j=k-1;continue}cur+=c}
    parts.push(cur);const idx=exprs.map((e,n)=>PL.test(e)?n:-1).filter(n=>n>=0);
    if(idx.length){let k=parts[0];for(let n=0;n<exprs.length;n++)k+='{'+n+'}'+parts[n+1];k=k.trim();
      out.push({k,idx,w:f+':'+(s.slice(0,i).split('\n').length)})}
    i=j+1}}
fs.writeFileSync(path.join(__dirname,'plurals.json'),JSON.stringify(out,null,1));console.log(out.length,'keys');

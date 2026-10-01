/* node samecode.js <before> <after> → prints SAME if the code (ignoring comments/whitespace) is identical */
const fs=require('fs');const parser=require('@babel/parser');const generate=require('@babel/generator').default;
const g=f=>generate(parser.parse(fs.readFileSync(f,'utf8'),{sourceType:'script',allowReturnOutsideFunction:true}),{comments:false,compact:true}).code;
const a=g(process.argv[2]),b=g(process.argv[3]);if(a===b){console.log('SAME')}else{let i=0;while(a[i]===b[i])i++;console.log('DIFF at',i,'\nbefore:',a.slice(i-80,i+80),'\nafter: ',b.slice(i-80,i+80));process.exit(1)}

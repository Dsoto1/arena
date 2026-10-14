/* lists every translation key in src/ (the _T('…') calls and _T`…` templates that tools/i18n/wrap.js inserted)
   node tools/i18n/keys.js > keys.json  → {keys:[{k,file,line}], unique:N} */
const fs=require('fs'),path=require('path'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..','..');
const build=fs.readFileSync(path.join(ROOT,'build.sh'),'utf8');
const SP=require('../srcpath');const FILES=(build.match(/src\/[\w.\/-]+\.js/g)||[]).map(f=>path.basename(f));
const out=[];
for(const f of FILES){const src=fs.readFileSync(SP.abs(f),'utf8');
  const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  const line=n=>src.slice(0,n.getStart()).split('\n').length;
  (function v(n){
    if(ts.isTaggedTemplateExpression(n)&&ts.isIdentifier(n.tag)&&n.tag.text==='_T'){const t=n.template;let k;
      if(ts.isNoSubstitutionTemplateLiteral(t))k=t.text;else{k=t.head.text;t.templateSpans.forEach((sp,i)=>{k+='{'+i+'}'+sp.literal.text})}
      k=k.trim();if(k)out.push({k,file:f,line:line(n)})}
    if(ts.isCallExpression(n)&&ts.isIdentifier(n.expression)&&n.expression.text==='_T'&&n.arguments[0]&&ts.isStringLiteral(n.arguments[0])){const k=n.arguments[0].text.trim();if(k)out.push({k,file:f,line:line(n)})}
    ts.forEachChild(n,v)})(sf)}
process.stdout.write(JSON.stringify({unique:new Set(out.map(o=>o.k)).size,keys:out}));

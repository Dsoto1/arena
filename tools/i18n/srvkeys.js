/* keys for text the SERVER (and the shared rules 111-onlcore) sends to players: fail() messages, why strings, QC_TEXT phrases.
   The client translates them on arrival (148-v86lang: NET.req errors via TXP, QC_TEXT at load). Writes tools/i18n/src/part-25.json */
const fs=require('fs'),path=require('path'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..','..');
const files=['server/src/routes.js','server/src/harden93.js','src/111-onlcore.js'];
const seen=new Map();
for(const f of files){const src=fs.readFileSync(path.join(ROOT,f),'utf8');const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  (function v(n){
    let k=null;
    if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))k=n.text;
    else if(ts.isTemplateExpression(n)){k=n.head.text;n.templateSpans.forEach((sp,i)=>{k+='{'+i+'}'+sp.literal.text})}
    if(k!=null){const t=k.trim();
      const visible=t.replace(/\{\d+\}/g,' ');
      if(/[A-Za-z]{2,}[^\n]*\s+[A-Za-z{]/.test(visible)&&!/^[.#\[]/.test(t)&&!/[{};]\s*$/.test(visible)&&!/^[A-Z_#]+$/.test(t)&&!/[a-z]+#/.test(t)&&t.length<300&&!seen.has(t))
        seen.set(t,f+':'+(src.slice(0,n.getStart()).split('\n').length))}
    if(!ts.isTemplateExpression(n))ts.forEachChild(n,v);else n.templateSpans.forEach(sp=>v(sp.expression))})(sf)}
const arr=[...seen].map(([k,w])=>({k,w}));
fs.writeFileSync(path.join(__dirname,'src','part-25.json'),JSON.stringify(arr,null,1));console.log(arr.length,'server keys');

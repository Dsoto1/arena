/* second pass: short English words chosen at runtime INSIDE translated text — `${n>1?'are':'is'}`, `${w?'throws':'throw'}`,
   `${n===1?'y':'ies'}` — get _T('…') so Spanish can swap them too (a plural 's' / '' stays: the translations add an 's' the same way).
   node tools/i18n/frag.js --list | --write   → keys go to tools/i18n/src/part-26.json with the template they sit in as context */
const fs=require('fs'),path=require('path'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..','..');const MODE=process.argv.includes('--write')?'write':'list';
const build=fs.readFileSync(path.join(ROOT,'build.sh'),'utf8');
const SKIP=new Set(['00-lang.js','00-lang-es.js','111-onlcore.js','13-sim.js','14-names.js','148-v86lang.js']);
const FILES=(build.match(/src\/[\w.-]+\.js/g)||[]).map(f=>path.basename(f)).filter(f=>!SKIP.has(f));
const OK=w=>/^[A-Za-z][A-Za-z' ]{0,24}$/.test(w)&&!/^(s|es|y|ies|ies are|y is)$/.test(w)===false||/^[a-z][a-z' ]{1,24}$/.test(w);
const items=new Map();let n=0;
for(const f of FILES){const fp=path.join(ROOT,'src',f);const src=fs.readFileSync(fp,'utf8');
  const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const edits=[];
  const inTagged=node=>{let p=node.parent;while(p){if(ts.isTemplateSpan(p)){const tt=p.parent&&p.parent.parent;return tt&&ts.isTaggedTemplateExpression(tt)&&ts.isIdentifier(tt.tag)&&tt.tag.text==='_T'?tt:null}
      if(ts.isParenthesizedExpression(p)||ts.isConditionalExpression(p)||ts.isBinaryExpression(p)&&[ts.SyntaxKind.BarBarToken,ts.SyntaxKind.AmpersandAmpersandToken,ts.SyntaxKind.QuestionQuestionToken].includes(p.operatorToken.kind)){p=p.parent;continue}
      return null}return null};
  (function v(node){
    if(ts.isStringLiteral(node)&&!(node.parent&&ts.isCallExpression(node.parent)&&ts.isIdentifier(node.parent.expression)&&node.parent.expression.text==='_T')){
      const w=node.text;const isCond=node.parent&&(ts.isConditionalExpression(node.parent)||ts.isParenthesizedExpression(node.parent)&&ts.isConditionalExpression(node.parent.parent));
      if(isCond&&w.trim()&&/^[A-Za-z][A-Za-z’' -]{0,30}$/.test(w.trim())&&!/^(s|es|S|y|ies)$/.test(w.trim())&&(w.trim().length>2||/^(up|it|is)$/.test(w.trim()))&&!/^[A-Z]+$/.test(w.trim())){const tt=inTagged(node);
        if(tt){const ctx=tt.getText().slice(0,160);if(!items.has(w.trim()))items.set(w.trim(),{k:w.trim(),w:f+':'+(src.slice(0,node.getStart()).split('\n').length),ctx});n++;
          edits.push({at:node.end,ins:')'},{at:node.getStart(),ins:'_T('})}}}
    ts.forEachChild(node,v)})(sf);
  if(MODE==='write'&&edits.length){let out=src;for(const e of edits.sort((a,b)=>b.at-a.at))out=out.slice(0,e.at)+e.ins+out.slice(e.at);fs.writeFileSync(fp,out)}}
const arr=[...items.values()];
if(MODE==='write'&&arr.length){fs.writeFileSync(path.join(__dirname,'src','part-26.json'),JSON.stringify(arr,null,1))}
console.log(n,'sites',arr.length,'keys');if(MODE==='list')console.log(arr.map(a=>a.k).join(' | '));

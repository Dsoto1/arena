/* Safe readability pass: rename short function PARAMETERS to descriptive names (scope-aware), then pretty-print.
   Usage: node rename.js <file> [--check]   (writes in place unless --check) */
const fs=require('fs');const parser=require('@babel/parser');const traverse=require('@babel/traverse').default;const generate=require('@babel/generator').default;
const file=process.argv[2];const src=fs.readFileSync(file,'utf8');
const ast=parser.parse(src,{sourceType:'script',allowReturnOutsideFunction:true,errorRecovery:false});
const MAP={p:'player',q:'other',v:'victim',t:'target',src:'source',w:'weapon',dmg:'damage',loc:'location',att:'attacker',st:'stats',pl:'pillar',sh:'ship',ev:'eventDef',rd:'roundDef',cfg:'config',ch:'chariot'};
const NPC_FN=/npc|beast|tame|lion|commodus|tholo|zora|aggro/i;
let renamed=0;const log=[];
function allIdentifiers(path){const s=new Set();path.traverse({Identifier(p){s.add(p.node.name)}});return s}
traverse(ast,{Function(path){
  const fnName=(path.node.id&&path.node.id.name)||(path.parent&&path.parent.type==='VariableDeclarator'&&path.parent.id.name)||(path.parent&&path.parent.type==='AssignmentExpression'&&path.parent.left.name)||'';
  const used=allIdentifiers(path);
  for(const param of path.node.params){let id=param.type==='AssignmentPattern'?param.left:param;if(id.type!=='Identifier')continue;
    let to=MAP[id.name];if(id.name==='n'&&NPC_FN.test(fnName))to='npc';if(!to)continue;
    if(used.has(to)||path.scope.hasBinding(to)||path.scope.hasGlobal&&path.scope.hasGlobal(to))continue;
    /* is `to` referenced as a free (global) name anywhere in the program? */
    if(path.scope.getProgramParent().hasGlobal(to))continue;
    path.scope.rename(id.name,to);renamed++;log.push(`${fnName||'(anon)'}: ${id.name}→${to}`)}}});
const out=generate(ast,{comments:true,retainLines:false,compact:false,jsescOption:{minimal:true}},src).code;
if(process.argv[3]!=='--check')fs.writeFileSync(file,out+'\n');
console.log(file,'renamed',renamed);if(process.argv[3]==='--list')console.log(log.join('\n'));

/* perf100 audit — coupling numbers the layers100 PLAN does not have. node tools/plans/perf100/coupling.js (needs typescript; NODE_PATH=/tmp/ci/node_modules or global)
   (a) wrapper chains: every assignment `NAME = function|arrow|other fn` to a top-level function/let NAME, across ALL modules, in build order →
       chain length per name, modules per name, and REPLACEMENTS (a reassignment whose new body never calls a captured old value of NAME,
       made after earlier wrappers were installed → those wrappers are silently dropped);
   (b) shared globals: top-level names declared in one file and used by the most OTHER files, and how many files WRITE them
       (`X =`, `X.p =`, `X[p] =`, `X.p++`, delete X.p);
   (c) S.* fields written by the most modules. Writes coupling.json. */
const ts=require('typescript'),fs=require('fs'),path=require('path');
const R=path.resolve(__dirname,'..','..','..');
const order=fs.readFileSync(path.join(R,'build.sh'),'utf8').split('\n')[2].match(/src\/[^\s;]+\.js/g);
const files=order.map(f=>({f:f.slice(4),src:fs.readFileSync(path.join(R,f),'utf8')}));
const top=new Map();/* name -> {file, kind} */
const parsed=files.map(F=>({...F,sf:ts.createSourceFile(F.f,F.src,ts.ScriptTarget.Latest,true)}));
for(const F of parsed)for(const st of F.sf.statements){
  if(ts.isFunctionDeclaration(st)&&st.name){if(!top.has(st.name.text))top.set(st.name.text,{file:F.f,kind:'function'})}
  else if(ts.isVariableStatement(st)){const k=st.declarationList.flags&ts.NodeFlags.Const?'const':st.declarationList.flags&ts.NodeFlags.Let?'let':'var';
    for(const d of st.declarationList.declarations)if(ts.isIdentifier(d.name)&&!top.has(d.name.text))top.set(d.name.text,{file:F.f,kind:k,fn:!!(d.initializer&&(ts.isFunctionExpression(d.initializer)||ts.isArrowFunction(d.initializer)))})}}
const isFnName=n=>{const t=top.get(n);return t&&(t.kind==='function'||t.fn)};
/* (a) */
const chain={};/* name -> [{file,line,replace}] */
for(const F of parsed){
  const visit=(node,captured)=>{
    /* const base=NAME / let b=NAME captured in this block */
    if(ts.isVariableDeclaration(node)&&node.initializer&&ts.isIdentifier(node.initializer)&&ts.isIdentifier(node.name)&&isFnName(node.initializer.text))captured.set(node.name.text,node.initializer.text);
    if(ts.isBinaryExpression(node)&&node.operatorToken.kind===ts.SyntaxKind.EqualsToken&&ts.isIdentifier(node.left)&&isFnName(node.left.text)){
      const name=node.left.text,rhs=node.right;
      if(ts.isFunctionExpression(rhs)||ts.isArrowFunction(rhs)||ts.isCallExpression(rhs)||ts.isIdentifier(rhs)){
        const txt=rhs.getText(F.sf);const bases=[...captured].filter(([b,n])=>n===name).map(([b])=>b);
        const callsOld=bases.some(b=>new RegExp('\\b'+b+'\\b').test(txt))||/\b(base|orig|old|prev|_0|b0)\b/.test(txt)&&bases.length>0||ts.isCallExpression(rhs)&&rhs.arguments.some(a=>ts.isIdentifier(a)&&a.text===name);
        (chain[name]=chain[name]||[]).push({file:F.f,line:F.sf.getLineAndCharacterOfPosition(node.getStart(F.sf)).line+1,replace:!callsOld})}}
    const inner=ts.isBlock(node)||ts.isSourceFile(node)||ts.isFunctionLike(node)?new Map(captured):captured;
    ts.forEachChild(node,c=>visit(c,inner))};
  visit(F.sf,new Map())}
const rows=Object.entries(chain).map(([n,a])=>{const mods=new Set(a.map(x=>x.file)).size;
  /* replacements that come after at least one wrapper → wrappers dropped */
  let dropped=0,firstWrap=-1;a.forEach((x,i)=>{if(!x.replace&&firstWrap<0)firstWrap=i;if(x.replace&&firstWrap>=0&&i>firstWrap)dropped+=a.slice(0,i).filter(y=>!y.replace).length});
  return {name:n,decl:top.get(n).file,kind:top.get(n).kind,layers:a.filter(x=>!x.replace).length,assigns:a.length,modules:mods,replacements:a.filter(x=>x.replace).map(x=>x.file+':'+x.line),droppedWrapperSlots:dropped}});
rows.sort((a,b)=>b.layers-a.layers);
/* (b) shared globals */
const used={},written={};
for(const F of parsed){const seen=new Set(),w=new Set();
  const v=node=>{if(ts.isIdentifier(node)&&top.has(node.text)&&top.get(node.text).file!==F.f){const p=node.parent;
      if(!(p&&ts.isPropertyAccessExpression(p)&&p.name===node)&&!(p&&ts.isPropertyAssignment(p)&&p.name===node)){seen.add(node.text);
        /* write? X=…, X.p=…, X[p]=…, X.p++ */let e=node;while(e.parent&&(ts.isPropertyAccessExpression(e.parent)&&e.parent.expression===e||ts.isElementAccessExpression(e.parent)&&e.parent.expression===e))e=e.parent;
        const q=e.parent;if(q&&(ts.isBinaryExpression(q)&&q.left===e&&q.operatorToken.kind>=ts.SyntaxKind.FirstAssignment&&q.operatorToken.kind<=ts.SyntaxKind.LastAssignment||(ts.isPostfixUnaryExpression(q)||ts.isPrefixUnaryExpression(q))&&(q.operator===ts.SyntaxKind.PlusPlusToken||q.operator===ts.SyntaxKind.MinusMinusToken)||ts.isDeleteExpression(q)))w.add(node.text)}}
    ts.forEachChild(node,v)};v(F.sf);for(const n of seen)used[n]=(used[n]||0)+1;for(const n of w)written[n]=(written[n]||0)+1}
const glob=Object.keys(used).filter(n=>!isFnName(n)).map(n=>({name:n,decl:top.get(n).file,kind:top.get(n).kind,files:used[n],writers:written[n]||0})).sort((a,b)=>b.writers-a.writers||b.files-a.files);
const fnUse=Object.keys(used).filter(n=>isFnName(n)).map(n=>({name:n,files:used[n]})).sort((a,b)=>b.files-a.files);
/* (c) S.* writers */
const sw={};for(const F of parsed){const fields=new Set();const re=/\bS\.([A-Za-z_$][\w$]*)\s*(?:=(?!=)|\+\+|--|[+\-*\/|&]=)/g;let m;while((m=re.exec(F.src)))fields.add(m[1]);for(const f of fields)(sw[f]=sw[f]||[]).push(F.f)}
const sRows=Object.entries(sw).map(([k,v])=>({field:k,modules:v.length})).sort((a,b)=>b.modules-a.modules);
const out={files:files.length,topNames:top.size,wrapped:rows.length,top30:rows.slice(0,30),withReplacements:rows.filter(r=>r.droppedWrapperSlots>0).sort((a,b)=>b.droppedWrapperSlots-a.droppedWrapperSlots).slice(0,25),
  globals:glob.slice(0,30),globalsByFiles:[...glob].sort((a,b)=>b.files-a.files).slice(0,15),functionsUsedByMostFiles:fnUse.slice(0,15),sFields:{distinctWritten:sRows.length,top:sRows.slice(0,25)}};
fs.writeFileSync(path.join(__dirname,'coupling.json'),JSON.stringify(out,null,1));
console.log('wrapped names',rows.length);console.log(rows.slice(0,25).map(r=>`${r.name} layers ${r.layers} mods ${r.modules} repl ${r.replacements.length} dropped ${r.droppedWrapperSlots}`).join('\n'));
console.log('--- replacements dropping earlier wrappers');console.log(out.withReplacements.map(r=>`${r.name} (${r.layers} wrappers) replaced at ${r.replacements.join(', ')} dropped ${r.droppedWrapperSlots}`).join('\n'));
console.log('--- globals by writers');console.log(out.globals.slice(0,20).map(g=>`${g.name} [${g.decl}] used by ${g.files} files, written by ${g.writers}`).join('\n'));
console.log('--- S fields');console.log(sRows.slice(0,15).map(r=>r.field+' '+r.modules).join(' · '),'distinct',sRows.length);

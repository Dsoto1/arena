/* v1.17 THE MINIFIED PAGE (tools/minbuild.js) is the same program as the readable one. Needs both pages of ONE build beside each other:
   argv[2] = the tested page (flavius-arena.html or smartreg's snapshot of it), next to flavius-arena.src.html + flavius-arena.mods.json.
   With a real parser (TypeScript), module by module:
     a. the page is minified (BUILD_MIN=1), the module table belongs to it, every module is there in build.sh's order
     b. a module left raw is byte for byte its source; a minified one binds exactly the same top-level names (function / class / var / let /
        const, script level and inside top-level blocks) and holds the same number of functions and classes — nothing renamed, dropped,
        turned into something else (esbuild's rewrite of a function declared in a block must have kept that module raw)
     c. no esbuild helper (__template …) and no "</script" / "<!--" inside the script
     d. no top-level statement runs across a module border, in either page (a module that would continue the one before stays raw)
     e. 00b-perf's timer sweeps (matched on a piece of the callback's SOURCE TEXT) catch the same setInterval callbacks in both pages,
        and the same ones the matcher caught before v1.17 (exact text, no quote folding) in the readable page
   In the browser, both pages: f. ready, BUILD_MIN 1 / 0, the script the browser parsed is the file's text char for char, the same global names exist;
     g. a thrown error is logged with build 'min' / 'readable' and the bug-report text says "build: min". */
const {chromium}=require('./_browser'),fs=require('fs'),path=require('path'),crypto=require('crypto'),ts=require('typescript'),K=ts.SyntaxKind;
const page=path.resolve(process.argv[2]||path.join(__dirname,'..','..','flavius-arena.html')),ROOT=path.resolve(__dirname,'..','..');
const SRCP=path.join(ROOT,'flavius-arena.src.html'),MODS=path.join(ROOT,'flavius-arena.mods.json');
const errs=[],chk=(c,m)=>{if(!c&&errs.length<40)errs.push(m)};
const done=()=>{console.log('ERRS',JSON.stringify(errs));process.exit(errs.length?1:0)};
const scriptOf=h=>{const a=h.indexOf('<script>')+8;return h.slice(a,h.lastIndexOf('</script>'))};
if(!fs.existsSync(SRCP)||!fs.existsSync(MODS)){errs.push('flavius-arena.src.html / flavius-arena.mods.json missing — run sh build.sh');done()}
const M=JSON.parse(fs.readFileSync(MODS,'utf8')),min=scriptOf(fs.readFileSync(page,'utf8')),raw=scriptOf(fs.readFileSync(SRCP,'utf8'));
const ORDER=require('../srcpath').order(),src=ORDER.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8'));
/* a */
chk(M.min===1&&/^\nwindow\.BUILD_MIN=1;\n/.test(min),'the page is NOT minified (esbuild missing, or sh build.sh --readable) — BUILD_MIN is not 1');
chk(M.sha===crypto.createHash('sha1').update(min).digest('hex').slice(0,16),'flavius-arena.mods.json does not belong to the tested page (rebuilt during the run?)');
chk(M.mods.map(m=>m[0]).join(' ')===ORDER.join(' '),'module table order is not build.sh order');
chk(raw==='\nwindow.BUILD_MIN=0;\n'+src.join(''),'flavius-arena.src.html is not the plain concatenation of the sources');
if(errs.length)done();
{let o=M.mods[0][1];for(const m of M.mods){chk(m[1]===o&&m[2]>m[1],'module table has a gap at '+m[0]);o=m[2]}chk(o===min.length,'module table does not end with the script')}
/* b */
const FK=new Set([K.FunctionDeclaration,K.FunctionExpression,K.ArrowFunction,K.MethodDeclaration,K.GetAccessor,K.SetAccessor,K.Constructor,K.ClassStaticBlockDeclaration]);
const parse=t=>ts.createSourceFile('x.js',t,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
function binds(sf){const out=[];let fns=0,cls=0;
  const names=(n,k,d)=>{if(n.kind===K.Identifier)out.push(k+' '+n.text+(d?' (in a block)':''));else if(n.elements)for(const e of n.elements)if(e.name)names(e.name,k,d)};
  (function all(n){if(FK.has(n.kind))fns++;if(n.kind===K.ClassDeclaration||n.kind===K.ClassExpression)cls++;ts.forEachChild(n,all)})(sf);
  (function w(n,d){if(FK.has(n.kind)){if(n.kind===K.FunctionDeclaration&&n.name)out.push('function '+n.name.text+(d?' (in a block)':''));return}
    if(n.kind===K.ClassDeclaration&&n.name){out.push('class '+n.name.text+(d?' (in a block)':''));return}if(n.kind===K.ClassExpression)return;
    if(n.kind===K.VariableDeclarationList){const k=n.flags&ts.NodeFlags.BlockScoped?(n.flags&ts.NodeFlags.Const?'const':'let'):'var';
      if(k==='var'||d===0)for(const v of n.declarations)names(v.name,k,0)}
    const nd=d||(n.kind===K.Block||n.kind===K.ForStatement||n.kind===K.ForOfStatement||n.kind===K.ForInStatement||n.kind===K.CaseBlock||n.kind===K.CatchClause?1:0);
    ts.forEachChild(n,c=>w(c,nd))})(sf,0);
  return {names:out.sort(),fns,cls}}
let nMin=0,nRaw=0;
M.mods.forEach((m,i)=>{const t=min.slice(m[1],m[2]),nm=path.basename(m[0]);
  if(!m[3]){nRaw++;chk(t===src[i],nm+': listed raw but differs from its source');chk(!!M.raw[m[0]],nm+': raw without a reason');return}
  nMin++;const a=binds(parse(src[i])),b=binds(parse(t));
  if(a.names.join('|')!==b.names.join('|')){const A=new Set(a.names),B=new Set(b.names);
    chk(false,nm+': top-level names changed — gone: '+a.names.filter(x=>!B.has(x)).slice(0,4).join(', ')+' | new: '+b.names.filter(x=>!A.has(x)).slice(0,4).join(', '))}
  chk(a.fns===b.fns&&a.cls===b.cls,nm+`: ${a.fns} functions / ${a.cls} classes in the source, ${b.fns} / ${b.cls} minified`);
  /* c */
  chk(!/\b__(template|freeze|defProp)\b/.test(t)||/\b__(template|freeze|defProp)\b/.test(src[i]),nm+': esbuild helper in the minified text');
  chk(!/<\/script|<!--/i.test(t),nm+': "</script" or "<!--" in the minified text')});
chk(nMin>nRaw*5,`only ${nMin} modules minified, ${nRaw} raw`);
chk(!/<\/script/i.test(min),'"</script" inside the script');
/* d */
function borders(text,bounds,label){const sf=parse(text);for(const st of sf.statements){const s=st.getStart(sf),e=st.end;const b=bounds.find(x=>s>=x[0]&&s<x[1]);
  if(b&&e>b[1])chk(false,label+': a statement starting in '+path.basename(b[2])+' runs into the next module: '+text.slice(s,s+60).replace(/\n/g,' '))}}
borders(min,M.mods.map(m=>[m[1],m[2],m[0]]),'minified');
{let o='\nwindow.BUILD_MIN=0;\n'.length;borders(raw,ORDER.map((f,i)=>{const b=[o,o+src[i].length,f];o+=src[i].length;return b}),'readable')}
/* e */
{const sw=[];const m=raw.match(/const PERF92_SWEEPS=\[([\s\S]*?)\n\];/);chk(!!m,'PERF92_SWEEPS not found in 00b-perf');
  if(m){for(const x of m[1].matchAll(/\['(\w+)',("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\]/g))sw.push([x[1],(0,eval)(x[2])]);
    for(const x of raw.matchAll(/PERF92_SWEEPS\.push\(\['(\w+)','([^']+)'\]\)/g))sw.push([x[1],x[2]])}
  chk(sw.length>=30,'only '+sw.length+' sweeps read from the source');
  const q=s=>s.replace(/"/g,"'");
  const scan=(text,fold)=>{const sf=parse(text),decl=Object.create(null),calls=[];const f=fold?q:s=>s;
    (function w(n){if(n.kind===K.FunctionDeclaration&&n.name)(decl[n.name.text]=decl[n.name.text]||[]).push(text.slice(n.getStart(sf),n.end));
      if(n.kind===K.VariableDeclaration&&n.initializer&&(n.initializer.kind===K.ArrowFunction||n.initializer.kind===K.FunctionExpression)&&n.name.kind===K.Identifier)(decl[n.name.text]=decl[n.name.text]||[]).push(text.slice(n.initializer.getStart(sf),n.initializer.end));
      if(n.kind===K.CallExpression){const e=n.expression,nm=e.kind===K.Identifier?e.text:e.kind===K.PropertyAccessExpression?e.name.text:'';if(nm==='setInterval'&&n.arguments.length)calls.push(n)}
      ts.forEachChild(n,w)})(sf);
    return calls.map(c=>{const a=c.arguments[0];const t=a.kind===K.Identifier?(decl[a.text]||[]):[text.slice(a.getStart(sf),a.end)];
      return [...new Set(t.map(x=>{const h=sw.find(s=>f(x).includes(f(s[1])));return h?h[0]:'-'}))].join('|')+' '+text.slice(a.getStart(sf),a.getStart(sf)+50)})};
  const old=scan(raw,false),A=scan(raw,true),B=scan(min,true);
  chk(old.length===B.length&&old.length>=80,`setInterval calls: ${old.length} readable, ${B.length} minified`);
  chk(old.filter(x=>x[0]!=='-').length>=25,'fewer than 25 timers match a sweep');
  for(let i=0;i<old.length;i++){const k=x=>(x||'').split(' ')[0];
    if(k(old[i])!==k(A[i]))chk(false,'sweep match changed by the quote folding (readable page): '+old[i]+' → '+k(A[i]));
    if(k(A[i])!==k(B[i]))chk(false,'sweep match differs in the minified page: '+A[i]+' → '+B[i])}}
if(errs.length)done();
/* f + g */
const fnv=s=>{let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return s.length+':'+(h>>>0)};
(async()=>{const b=await chromium.launch();const out={};
  for(const [key,file,want,label] of [['min',page,1,'min'],['src',SRCP,0,'readable']]){
    const ctx=await b.newContext({viewport:{width:1280,height:800}});
    await ctx.addInitScript(()=>{try{Object.defineProperty(navigator,'webdriver',{get:()=>false})}catch(e){}try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
    const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const pe=[];pg.on('pageerror',e=>pe.push(e.message));
    await pg.goto('file://'+file);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000}).catch(()=>chk(false,key+': not ready'));
    chk(!pe.length,key+': page errors '+pe.slice(0,2).join(' | '));
    const r=await pg.evaluate(async()=>{const st=[...document.scripts].map(s=>s.textContent).sort((a,b)=>b.length-a.length)[0];let fh=2166136261;for(let i=0;i<st.length;i++)fh=Math.imul(fh^st.charCodeAt(i),16777619);const big=st.length+':'+(fh>>>0);
      const mm=document.getElementById('mainMenu');const mark=ERR92.n;
      setTimeout(()=>{throw new Error('tv117min deliberate')},0);await new Promise(r=>setTimeout(r,300));
      const e=errNew92(mark).find(x=>/tv117min deliberate/.test(x.msg));
      return {bm:window.BUILD_MIN,big,menu:!!mm&&!mm.hidden,entry:e||null,text:err92Text().split('\n')[0],
        globals:Object.getOwnPropertyNames(window).filter(k=>!/^(BUILD_MIN|__|on|webkit)/.test(k)&&!/^\d+$/.test(k)).sort()}});
    out[key]=r;
    chk(r.bm===want,key+': BUILD_MIN = '+r.bm);chk(r.menu,key+': the main menu is not up');
    chk(r.big===fnv(key==='min'?min:raw),key+`: the browser's script (${r.big}) is not the file's (${fnv(key==='min'?min:raw)}) — the HTML parser cut or changed it`);
    chk(r.entry&&r.entry.build===label,key+': error log entry build = '+(r.entry&&r.entry.build));
    chk(new RegExp(' · build: '+label+' · ').test(r.text),key+': bug-report header: '+r.text.slice(0,80));
    await ctx.close()}
  if(out.min&&out.src){const A=new Set(out.src.globals),B=new Set(out.min.globals);
    const gone=out.src.globals.filter(x=>!B.has(x)),neu=out.min.globals.filter(x=>!A.has(x));
    chk(!gone.length&&!neu.length,`window globals differ — only readable: ${gone.slice(0,8).join(' ')} | only minified: ${neu.slice(0,8).join(' ')}`);
    chk(out.src.globals.length>3000,'only '+out.src.globals.length+' globals seen')}
  console.log(`minified ${nMin} · raw ${nRaw} · globals ${out.min?out.min.globals.length:0}`);
  await b.close();done()})().catch(e=>{console.log('ERRS',JSON.stringify([String(e)]));process.exit(1)});

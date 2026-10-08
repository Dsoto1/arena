/* v0.86 i18n codemod — marks player-facing text for translation, WITHOUT changing English behaviour.
   Usage:  node tools/i18n/wrap.js --list  > keys.json   (dry: print every key with file:line, edit nothing)
           node tools/i18n/wrap.js --write               (edit src/ in place: insert _T(...) / _T`...` / ${_T`...`})
   What it does (surgical text inserts at AST positions; formatting and comments untouched):
     • 'Plain prose literal'           → T('Plain prose literal')
     • `whole template of prose ${x}`  → T`whole template of prose ${x}`
     • `<div class="a">Some text ${n} <b>more</b></div>` → `<div class="a">${T`Some text ${n} <b>more</b>`}</div>`
       (runs of text between "hard" tags; inline tags b/i/em/strong/small/u/br/sup/sub/span-without-${} stay inside the key)
     • title="…" placeholder="…" aria-label="…" alt="…" data-tip="…" data-avtip="…" attribute values → ${T`…`}
   Skips: names/ids (object keys n/name/id/k/…), comparisons, switch cases, selectors, storage keys, classList, regex,
          console/throw, already-tagged templates, files in SKIP_FILES (111-onlcore is shared with the server).
   _T() is identity in English (00-lang.js), so the English game is byte-for-byte the same text. */
const fs=require('fs'),path=require('path'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..','..');
const MODE=process.argv.includes('--write')?'write':'list';
const ONLY=process.argv.filter(a=>/\.js$/.test(a)&&!/wrap\.js$/.test(a));
const SKIP_FILES=new Set(['00-lang.js','00c-errlog.js','223a-v93srvtext.js','00-lang-es.js','111-onlcore.js','13-sim.js','14-names.js','148-v86lang.js','173-v89cjk.js','wip-armlevels.js']);
const build=fs.readFileSync(path.join(ROOT,'build.sh'),'utf8');
const FILES=(build.match(/src\/[\w.-]+\.js/g)||[]).map(f=>path.basename(f)).filter(f=>!SKIP_FILES.has(f)).filter(f=>!ONLY.length||ONLY.some(o=>o.endsWith(f)));

const KEYSKIP=new Set(['id','k','key','cls','type','kind','img','src','ico','icon','col','color','colour','css','sel','slot','pt','eq','at','mode','tone','seal',
  'font','bg','music','theme','n','name','nm','short','city','loc','ev','cell','file','url','href','tag','code','cls2','clsRef','classRef','pal','fill','stroke',
  'face','hair','skin','eyes','shape','style','look','tok','token','art','thumb','frame','ver','v','fn','lead','mode2','root','prog','zone','end','reward',
  'gender','sex','faith','house','home','lanista','by','owner','kill','killer','emoji','glyph','flag','badge','grade','rank','stat','st','key2','lbl0','sfx']);
const CALLSKIP=new Set(['TX','TXL','TXPRE','TXHEAD','TXK','RXL','HRX','LBLRX','fateSpared','fateThumbsDown','fateIsThumb','querySelector','querySelectorAll','getElementById','getElementsByClassName','getElementsByTagName','closest','matches','contains',
  'setAttribute','getAttribute','removeAttribute','hasAttribute','toggleAttribute','addEventListener','removeEventListener','dispatchEvent','createElement','createElementNS',
  'getItem','setItem','removeItem','includes','indexOf','lastIndexOf','startsWith','endsWith','split','replace','replaceAll','match','matchAll','test','search',
  'RegExp','require','fetch','postMessage','BroadcastChannel','cheatRegister','hashStr','cheatKey','Event','CustomEvent','toggle','getPropertyValue','setProperty',
  'removeProperty','insertAdjacentElement','localeCompare','padStart','padEnd','charCodeAt','codePointAt','at','has','delete','get','put','del','query','list',
  'req','emit','on','off','send','toDataURL','drawImage','loadImg','img','imgOf','asset','cardHTML','cardStyle','cardRef','rtokHTML','rtokStyle','sfx','play','beep',
  'audNote','audPlay','strokeStyle','fillStyle','font','tl','gById','mgrById','storeGet','storePut','matchSlotPut','lsGet','lsSet','ls','setTimeout','setInterval',
  'Function','eval','importScripts','encodeURIComponent','decodeURIComponent','atob','btoa','parse','stringify','Number','parseInt','parseFloat','Symbol',
  'Intl','DateTimeFormat','toLocaleString','toLocaleDateString','toLocaleTimeString','assert','classOf','track','pick','pickOne','rand','rnd','sideRand']);
const ALLARGS=new Set(['getItem','setItem','removeItem','get','put','del','query','list','req','emit','on','off','send','postMessage','fetch','addEventListener','removeEventListener','dispatchEvent','storeGet','storePut','matchSlotPut','lsGet','lsSet','ls','classOf','track','RegExp','Function','eval','parse','stringify','encodeURIComponent','decodeURIComponent','atob','btoa','toggle','has','delete','sfx','play','beep','audNote','audPlay','imgOf','asset','loadImg','img','cardHTML','cardStyle','cardRef','rtokHTML','rtokStyle','querySelector','querySelectorAll','closest','matches','getElementById','createElement','createElementNS','getAttribute','removeAttribute','hasAttribute','toggleAttribute','gById','mgrById','tl','pick','pickOne','rand','rnd','sideRand','hashStr','cheatKey','Intl','DateTimeFormat','Symbol','Number','parseInt','parseFloat','toDataURL','drawImage']);
const CLASSLIST_SKIP=new Set(['add','remove','toggle','contains','replace']);
const SOFT=new Set(['b','i','em','strong','small','u','br','sup','sub','span','wbr']);
const ATTRS=/^(title|placeholder|aria-label|alt|data-tip|data-avtip)$/i;

/* prose test on the visible text of a run (tags removed, ${} replaced by a marker) */
function prose(text){
  const t=text.replace(/<[^>]*>/g,' ').replace(/\u0001/g,' § ').replace(/&[a-z#0-9]+;/gi,' ').trim();
  if(!t)return false;
  if(/^[.#\[@:]/.test(t))return false;                       /* selectors, at-rules */
  if(/[{}]/.test(t)&&/:/.test(t)||/;/.test(t)&&/:/.test(t)&&!/[A-Za-z]{3,}\s+[A-Za-z]{3,}\s+[A-Za-z]{3,}/.test(t))return false; /* css */
  if(/^(https?:|data:|mailto:|\.\/|\/)/.test(t))return false;
  if(/^[\w-]+(\.[\w-]+)+$/.test(t))return false;             /* a.b.c */
  if(/^[a-z][\w-]*$/.test(t))return false;                   /* a lowercase key */
  if(/^[A-Z0-9_]+$/.test(t))return false;                    /* CONSTANT */
  {const ws=t.split(/\s+/);if(ws.every(w=>/^[a-z][a-z0-9_-]*$/.test(w))&&ws.some(w=>/[0-9_-]/.test(w)))return false;} /* class lists */
  if(/^[\w-]+_[\w-]+$/.test(t))return false;                 /* snake_key */
  const words=t.match(/[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ'’]+/g)||[];
  if(!words.length)return false;
  const spaced=/[A-Za-z][A-Za-z'’]*[,;:!?.]?\s+[§(«"'“A-Za-z0-9]/.test(t)||/§\s+[A-Za-z]{2,}|[A-Za-z]{2,}\s+§/.test(t);
  if(spaced)return true;
  if(words.length===1&&/^[A-Z][a-z'’]{2,}[.!?…:]?$/.test(t.replace(/^[^\w]+/,'').replace(/[^\w.!?…:]+$/,'')))return true; /* 'Attack', 'Save' */
  if(/[A-Za-z]{2,}[.!?…]$/.test(t))return true;
  return false}

function calleeName(call){const e=call.expression;if(ts.isIdentifier(e))return e.text;if(ts.isPropertyAccessExpression(e))return e.name.text;return ''}
function calleeObj(call){const e=call.expression;if(ts.isPropertyAccessExpression(e)&&ts.isPropertyAccessExpression(e.expression))return e.expression.name.text;if(ts.isPropertyAccessExpression(e)&&ts.isIdentifier(e.expression))return e.expression.text;return ''}
/* is this literal node in a place where it is data, not display text? */
function skipCtx(node){
  /* a line marked  i18n:skip  (in a comment) is code that uses the text as a key — never wrap it (v0.87) */
  try{const sf=node.getSourceFile();const ln=sf.getLineAndCharacterOfPosition(node.getStart()).line;const L=sf.text.split('\n')[ln]||'';if(/i18n:skip/.test(L))return true}catch(e){}
  let p=node.parent,child=node;
  /* climb through parentheses / conditional branches / || && ?? / commas — they keep the same role */
  while(p&&(ts.isParenthesizedExpression(p)||(ts.isConditionalExpression(p)&&child!==p.condition)||(ts.isBinaryExpression(p)&&[ts.SyntaxKind.BarBarToken,ts.SyntaxKind.AmpersandAmpersandToken,ts.SyntaxKind.QuestionQuestionToken].includes(p.operatorToken.kind))))
    {child=p;p=p.parent}
  if(!p)return true;
  if(ts.isPropertyAssignment(p)){if(p.name===child)return true;const nm=p.name&&(p.name.text||p.name.escapedText||'');if(KEYSKIP.has(String(nm)))return true}
  if(ts.isPropertyAccessExpression(p)||ts.isElementAccessExpression(p)&&p.argumentExpression===child)return true;
  if(ts.isBinaryExpression(p)){const k=p.operatorToken.kind;if([ts.SyntaxKind.EqualsEqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsEqualsToken,ts.SyntaxKind.EqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsToken,ts.SyntaxKind.InKeyword,ts.SyntaxKind.InstanceOfKeyword].includes(k))return true;
    if(k===ts.SyntaxKind.FirstAssignment||k===ts.SyntaxKind.EqualsToken){const L=p.left;if(ts.isPropertyAccessExpression(L)&&/^(id|className|key|src|href|type|name|value|tagName|cssText|dataset|font|fillStyle|strokeStyle|textBaseline|textAlign|globalCompositeOperation|lineCap|lineJoin|filter|cursor|display|background|color|transform|transition|animation|width|height|left|top|right|bottom|position|zIndex|opacity|pointerEvents|visibility|overflow|margin|padding|border)$/.test(L.name.text))return true;
      if(ts.isElementAccessExpression(L))return true}}
  if(ts.isCaseClause(p)&&p.expression===child)return true;
  if(ts.isCallExpression(p)||ts.isNewExpression(p)){
    if(p.expression===child)return true;
    const nm=ts.isCallExpression(p)?calleeName(p):(ts.isIdentifier(p.expression)?p.expression.text:'');
    if(nm==='_T'||nm==='TX')return true;
    if(CALLSKIP.has(nm)){const args=p.arguments||[];const idx=args.indexOf(child);
      if(ALLARGS.has(nm)||idx<=0)return true;
      if(nm==='replace'||nm==='replaceAll'||nm==='setAttribute'||nm==='setProperty'||nm==='cheatRegister'){/* the replacement / attribute value / label is display text */}
      else return true}
    const ob=ts.isCallExpression(p)?calleeObj(p):'';
    if(ob==='classList'&&CLASSLIST_SKIP.has(nm))return true;
    if(['console','localStorage','sessionStorage','Store','JSON','Math','Object','Reflect','NET','NETWS','ctx','cx','g','c2','document','window','navigator','Promise','history','location','performance','crypto','Array','String','URL'].includes(ob)&&nm!=='alert'&&nm!=='confirm'&&nm!=='prompt')return true}
  if(ts.isThrowStatement(p)||ts.isImportDeclaration(p)||ts.isExportDeclaration(p)||ts.isExpressionStatement(p))return true;
  if(ts.isTaggedTemplateExpression(p))return true;
  if(ts.isComputedPropertyName(p))return true;
  if(ts.isTypeOfExpression&&p.kind===ts.SyntaxKind.TypeOfExpression)return true;
  return false}

/* ---------- template tokenizer over absolute offsets ---------- */
function templateSegs(node,src){
  /* returns [{type:'text',a,b,str},{type:'expr',a,b}] covering the template body (between the backticks) */
  const segs=[];
  if(ts.isNoSubstitutionTemplateLiteral(node)){const a=node.getStart()+1,b=node.end-1;segs.push({type:'text',a,b,str:src.slice(a,b)});return segs}
  const h=node.head;let a=h.getStart()+1,b=h.end-2;segs.push({type:'text',a,b,str:src.slice(a,b)});
  for(const sp of node.templateSpans){const lit=sp.literal;const ea=b,eb=lit.getStart()+1;segs.push({type:'expr',a:ea,b:eb,node:sp.expression});
    a=lit.getStart()+1;b=ts.isTemplateTail(lit)?lit.end-1:lit.end-2;segs.push({type:'text',a,b,str:src.slice(a,b)})}
  return segs}
/* split into tokens: TEXT(char range), TAG(range, soft?), EXPR(range, inTag), ATTRVAL boundaries */
function tokens(segs){
  const out=[];let inTag=false,tag=null,quote=null,attr=null,attrStart=-1,attrToks=null;
  const pushText=(a,b)=>{if(b>a)out.push({t:'text',a,b})};
  for(const s of segs){
    if(s.type==='expr'){
      if(inTag){tag.hasExpr=true;if(attrToks)attrToks.push({t:'expr',a:s.a,b:s.b})}
      else out.push({t:'expr',a:s.a,b:s.b});
      continue}
    const str=s.str;let i=0,textStart=0;
    while(i<str.length){const ch=str[i];
      if(!inTag){
        if(ch==='<'&&/[a-zA-Z\/!]/.test(str[i+1]||'')){pushText(s.a+textStart,s.a+i);inTag=true;tag={a:s.a+i,hasExpr:false,name:(str.slice(i+1).match(/^\/?([a-zA-Z0-9-]+)/)||[,''])[1].toLowerCase(),attrs:[]};quote=null;i++;continue}
        i++;continue}
      /* inside a tag */
      if(quote){
        if(ch===quote){if(attrToks){if(i>attrStart)attrToks.push({t:'text',a:s.a+attrStart,b:s.a+i});tag.attrs.push(attrToks)}quote=null;attrToks=null;i++;continue}
        if(attrToks&&attrStart<0)attrStart=i;
        i++;continue}
      if(ch==='"'||ch==="'"){
        const before=str.slice(0,i);const m=before.match(/([a-zA-Z-]+)\s*=\s*$/);
        quote=ch;attrToks=(m&&ATTRS.test(m[1]))?[]:null;attrStart=i+1;i++;continue}
      if(ch==='>'){inTag=false;tag.b=s.a+i+1;tag.soft=SOFT.has(tag.name)&&!tag.hasExpr&&(tag.name!=='span'||!/\s/.test((src_global.slice(tag.a,tag.b).match(/^<\/?span(.*)>$/)||['',''])[1]));out.push({t:'tag',a:tag.a,b:tag.b,soft:tag.soft,attrs:tag.attrs,name:tag.name});tag=null;i++;textStart=i;continue}
      i++}
    if(!inTag)pushText(s.a+textStart,s.b);
    else if(quote&&attrToks){/* attribute value continues across an expression */ if(s.b>s.a+Math.max(attrStart,0))attrToks.push({t:'text',a:s.a+Math.max(attrStart,0),b:s.b});attrStart=0}
  }
  if(inTag&&tag){/* unterminated tag (template is a fragment) — treat what we have as hard */ out.push({t:'tag',a:tag.a,b:segs[segs.length-1].b,soft:false,attrs:[],name:tag.name})}
  return out}
let src_global='';
/* the visible text of a run, with \u0001 for each ${} */
function runText(run,src){return run.map(r=>r.t==='expr'?'\u0001':src.slice(r.a,r.b)).join('')}
function keyOf(run,src){let n=0;return run.map(r=>r.t==='expr'?`{${n++}}`:src.slice(r.a,r.b)).join('')}

const edits=[];const keys=[];
function addRun(run,src,file,line,whole,node){
  /* trim whitespace-only text at the edges */
  while(run.length&&run[0].t==='text'&&!src.slice(run[0].a,run[0].b).trim())run.shift();
  while(run.length&&run[run.length-1].t==='text'&&!src.slice(run[run.length-1].a,run[run.length-1].b).trim())run.pop();
  /* a soft tag at an edge whose partner is outside the run stays outside (no '</span>' dangling in a key) */
  for(let changed=true;changed&&run.length;){changed=false;
    const tagName=r=>{const m=src.slice(r.a,r.b).match(/^<(\/?)([a-zA-Z0-9]+)/);return m?{close:!!m[1],n:m[2].toLowerCase()}:null};
    const isTag=r=>r.t==='text'&&/^<\/?[a-zA-Z]/.test(src.slice(r.a,r.b))&&/>$/.test(src.slice(r.a,r.b));
    const L=run[0],R=run[run.length-1];
    if(isTag(L)){const t=tagName(L);if(t.close||t.n==='br'||!run.slice(1).some(r=>isTag(r)&&tagName(r).close&&tagName(r).n===t.n)){run.shift();changed=true;continue}}
    if(isTag(R)){const t=tagName(R);if(!t.close||!run.slice(0,-1).some(r=>isTag(r)&&!tagName(r).close&&tagName(r).n===t.n)){run.pop();changed=true;continue}}
    while(run.length&&run[0].t==='text'&&!src.slice(run[0].a,run[0].b).trim()){run.shift();changed=true}
    while(run.length&&run[run.length-1].t==='text'&&!src.slice(run[run.length-1].a,run[run.length-1].b).trim()){run.pop();changed=true}}
  if(!run.length)return false;
  const txt=runText(run,src);if(!prose(txt))return false;
  const k=keyOf(run,src).trim();
  keys.push({k,file,line});
  if(whole){edits.push({at:node.getStart(),ins:'_T'});return true}
  /* tighten a/b to the trimmed text */
  let a=run[0].a,b=run[run.length-1].b;
  if(run[0].t==='text'){const s=src.slice(a,b);a+=s.length-s.trimStart().length}
  if(run[run.length-1].t==='text'){const s=src.slice(run[run.length-1].a,b);b-=s.length-s.trimEnd().length}
  edits.push({at:b,ins:'`}'},{at:a,ins:'${_T`'});return true}
function doTemplate(node,src,file){
  if(skipCtx(node))return;
  const line=src.slice(0,node.getStart()).split('\n').length;
  const toks=tokens(templateSegs(node,src));
  const hasHard=toks.some(t=>t.t==='tag'&&!t.soft);
  /* whole template is one run → tag it */
  if(!hasHard&&!toks.some(t=>t.t==='tag'&&t.attrs&&t.attrs.length)){
    const run=toks.filter(t=>t.t!=='tag'||t.soft).map(t=>t.t==='tag'?{t:'text',a:t.a,b:t.b}:t);
    if(addRun(run,src,file,line,true,node))return}
  let run=[];
  const flush=()=>{if(run.length)addRun(run.map(t=>t.t==='tag'?{t:'text',a:t.a,b:t.b}:t),src,file,line,false,node);run=[]};
  for(const t of toks){
    if(t.t==='tag'){
      for(const av of t.attrs||[])if(av.length)addRun(av.slice(),src,file,line,false,node);
      let soft=t.soft&&!(t.attrs&&t.attrs.length);
      if(soft){const m=src.slice(t.a,t.b).match(/^<(\/?)([a-zA-Z0-9]+)/);const nm=m&&m[2].toLowerCase();
        if(m&&m[1]){/* a closing tag is soft only if its opening tag is in this run */
          const opened=run.filter(r=>r.t==='tag'&&new RegExp('^<'+nm+'\\b','i').test(src.slice(r.a,r.b))).length;
          const closed=run.filter(r=>r.t==='tag'&&new RegExp('^</'+nm+'\\b','i').test(src.slice(r.a,r.b))).length;
          if(opened<=closed)soft=false}}
      if(soft)run.push(t);else flush();
      continue}
    run.push(t)}
  flush()}
function doString(node,src,file){
  if(skipCtx(node))return;
  const raw=node.text;if(!prose(raw))return;
  if(/<[a-zA-Z][^>]*>/.test(raw)&&/<(div|p|ul|li|table|tr|td|h\d|button|select|option|label|input|img|svg)\b/i.test(raw)){
    /* an HTML block in a plain string → the same literal as a template, its text runs wrapped */
    const tsrc='x=`'+raw.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$\{/g,'\\${')+'`;';
    const sf2=ts.createSourceFile('t.js',tsrc,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);let tnode=null;
    (function f(n){if(!tnode&&(ts.isNoSubstitutionTemplateLiteral(n)||ts.isTemplateExpression(n)))tnode=n;ts.forEachChild(n,f)})(sf2);
    if(!tnode)return;
    const save=edits.splice(0),k0=keys.length;const sg=src_global;src_global=tsrc;
    doTemplate(tnode,tsrc,file);src_global=sg;
    const mine=edits.splice(0);edits.push(...save);
    const line=src.slice(0,node.getStart()).split('\n').length;for(let i=k0;i<keys.length;i++){keys[i].file=file;keys[i].line=line}
    if(!mine.length)return;
    let t=tsrc;for(const e of mine.sort((a,b)=>b.at-a.at))t=t.slice(0,e.at)+e.ins+t.slice(e.at);
    const lit=t.slice(2,-1);/* drop x= and ; */
    edits.push({at:node.getStart(),del:node.end-node.getStart(),ins:lit});return}
  const line=src.slice(0,node.getStart()).split('\n').length;
  keys.push({k:raw.trim(),file,line});
  edits.push({at:node.end,ins:')'},{at:node.getStart(),ins:'_T('})}

let total=0;const perFile={};
for(const f of FILES){
  const fp=path.join(ROOT,'src',f);const src=fs.readFileSync(fp,'utf8');src_global=src;
  const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  edits.length=0;const k0=keys.length;
  (function visit(n){
    if(ts.isTaggedTemplateExpression(n))return; /* String.raw, T`…` already */
    if(ts.isTemplateExpression(n)||ts.isNoSubstitutionTemplateLiteral(n)){doTemplate(n,src,f)}
    else if(ts.isStringLiteral(n)){doString(n,src,f)}
    ts.forEachChild(n,visit)})(sf);
  perFile[f]=keys.length-k0;total+=keys.length-k0;
  if(MODE==='write'&&edits.length){
    const E=edits.slice().sort((x,y)=>y.at-x.at);let out=src;
    for(const e of E)out=out.slice(0,e.at)+e.ins+out.slice(e.at+(e.del||0));
    fs.writeFileSync(fp,out)}}
if(MODE==='list'){process.stdout.write(JSON.stringify({total,perFile,keys},null,0))}
else console.error('wrapped',total,'sites in',Object.keys(perFile).filter(f=>perFile[f]).length,'files');

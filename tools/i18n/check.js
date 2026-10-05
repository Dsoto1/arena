/* checks a translation part: node tools/i18n/check.js tools/i18n/es/part-07.json  (exit 1 on errors)
   every source key present · same {n} placeholders · same tags (as a multiset) · no new " < > & · names/game terms kept */
const fs=require('fs'),path=require('path');
const names=JSON.parse(fs.readFileSync(path.join(__dirname,'names.json'),'utf8')).filter(n=>n.length>=3&&/[A-Za-z]/.test(n));
const NAME_RE=names.sort((a,b)=>b.length-a.length).map(n=>[n,new RegExp('(?<![\\w’\'])'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\w’])')]);
let bad=0;
/* v0.89: Japanese/Chinese have no plural — a placeholder that only carries an English plural ending ('s'/'', 'y'/'ies', is/are …)
   may be dropped (or written {n||}); known from plurals.json, or glued straight onto a Latin word in the key ("room{1}") */
const PLJ=(()=>{try{const m=new Map();for(const o of JSON.parse(fs.readFileSync(path.join(__dirname,'plurals.json'),'utf8')))m.set(o.k,new Set(o.idx));return m}catch(e){return new Map()}})();
function cjkPlOK(k,v,ph){const want=ph(k).split(',').filter(Boolean),got=new Set(ph(v).split(',').filter(Boolean));
  if([...got].some(x=>!want.includes(x)))return false;
  return want.filter(x=>!got.has(x)).every(x=>{const n=+x.slice(1,-1);return (PLJ.get(k)||new Set()).has(n)||new RegExp('[A-Za-z]\\{'+n+'\\}(?![A-Za-z])').test(k)})}
for(const f of process.argv.slice(2)){
  const out=JSON.parse(fs.readFileSync(f,'utf8'));const CJK=/^(ja|zh)$/.test(path.basename(path.dirname(path.resolve(f))));const srcF=path.join(__dirname,'src',path.basename(f));
  const src=fs.existsSync(srcF)?JSON.parse(fs.readFileSync(srcF,'utf8')).map(o=>o.k):Object.keys(out);
  const errs=[],warns=[];
  for(const k of src){
    if(!(k in out)){errs.push('MISSING '+JSON.stringify(k).slice(0,90));continue}
    const v=out[k];if(typeof v!=='string'){errs.push('NOT A STRING '+k.slice(0,60));continue}
    const ph=s=>[...new Set((s.match(/\{\d+(?:\|[^|{}]*\|[^{}]*)?\}/g)||[]).map(x=>x.replace(/\|.*\}$/,'}')))].sort().join(); /* {n|one|many} counts as {n}; a value may be used several times */
    if(ph(k)!==ph(v)&&!(CJK&&cjkPlOK(k,v,ph)))errs.push('PLACEHOLDERS '+JSON.stringify(k).slice(0,70)+' → '+JSON.stringify(v).slice(0,70));
    const tg=s=>(s.match(/<[^>]+>/g)||[]).sort().join('|');
    if(tg(k)!==tg(v))errs.push('TAGS '+JSON.stringify(k).slice(0,70)+' → '+JSON.stringify(v).slice(0,70));
    const txt=s=>s.replace(/<[^>]+>/g,'');
    for(const ch of ['"','<','>'])if(!txt(k).includes(ch)&&txt(v).includes(ch))errs.push('NEW '+ch+' '+JSON.stringify(v).slice(0,80));
    if(!/&/.test(k)&&/&(?![a-z#0-9]+;)/i.test(v)===false&&/&[a-z#0-9]+;/i.test(v)&&!/&[a-z#0-9]+;/i.test(k))warns.push('ENTITY '+v.slice(0,60));
    for(const [n,re] of NAME_RE)if(re.test(txt(k))&&!txt(v).includes(n)){warns.push('NAME "'+n+'" '+JSON.stringify(v).slice(0,80));break}
  }
  const extra=Object.keys(out).filter(k=>!src.includes(k));
  if(extra.length)warns.push(extra.length+' extra keys (ignored)');
  console.log(path.basename(f),'keys',src.length,'errors',errs.length,'warnings',warns.length);
  errs.slice(0,40).forEach(e=>console.log('  E',e));warns.slice(0,25).forEach(w=>console.log('  w',w));
  if(errs.length)bad++}
process.exit(bad?1:0);

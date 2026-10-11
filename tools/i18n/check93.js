/* check93.js — v0.93 i18n health across EVERY language (tools/i18n/<lang>/part-*.json), for the test suite and the release:
     missing  — keys the page uses (every _T key in src/ via keys.js, the static text of 01-head, the server texts in texts93.json)
                that a language has no entry for (the player sees English there)
     unused   — entries a language keeps for keys nothing uses any more (dead weight in assets/lang_<l>.js)
     broken   — entries whose {n} placeholders differ from the key's ({n|one|many} counts as {n}; ja/zh may drop a plural-only value,
                as check.js allows) — a broken one shows a raw {1} or loses a value
   English (Australia) 'au' holds only its differences: missing/unused are not counted for it, broken is.
   Usage: node tools/i18n/check93.js [--json] [--quiet]     exit 1 when any language is over its ceiling (CEIL below, or env
   I18N_MAX_MISSING / I18N_MAX_UNUSED / I18N_MAX_BROKEN). New English strings raise 'missing' until the next translation pass —
   the ceilings leave room for one batch; lower them after a pass. */
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..','..');
/* v1.0: the v1.0 features are written in English first; the translation pass (prep.sh -> TRANSLATE.md -> finish.sh) closes the gap — 561 new keys untranslated at the v1.0 build, ceiling 600 until then (lower it after the pass) */
const CEIL={missing:+(process.env.I18N_MAX_MISSING||600),unused:+(process.env.I18N_MAX_UNUSED||1200),broken:+(process.env.I18N_MAX_BROKEN||0)};
const args=new Set(process.argv.slice(2));
/* the keys the page uses */
const used=new Map();
const K=JSON.parse(execSync('node '+JSON.stringify(path.join(__dirname,'keys.js')),{maxBuffer:1<<28}).toString());for(const o of K.keys)if(!used.has(o.k))used.set(o.k,o.file+':'+o.line);
const head=fs.readFileSync(path.join(ROOT,'src','01-head.html'),'utf8').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<script[\s\S]*?<\/script>/g,'');
const addS=(t,w)=>{t=t.replace(/\s+/g,' ').trim();if(t.length<2||!/[A-Za-z]{2}/.test(t)||used.has(t))return;if(/^[\w-]+$/.test(t)&&!/^[A-Z][a-z]+$/.test(t))return;used.set(t,w)};
head.replace(/>([^<>]+)</g,(m,t)=>{if(t.trim())addS(t,'01-head.html');return m});head.replace(/\b(title|placeholder|aria-label)="([^"]+)"/g,(m,a,t)=>{addS(t,'01-head.html ['+a+']');return m});
let srv={};try{srv=JSON.parse(fs.readFileSync(path.join(ROOT,'server/src/texts93.json'),'utf8'))}catch(e){}for(const k of Object.values(srv))if(!used.has(k))used.set(k,'server');
/* keys every language may keep although no literal names them: server texts listed for the translators, plural/fragment parts */
const keep=new Set();for(const f of ['src/part-25.json'])try{for(const o of JSON.parse(fs.readFileSync(path.join(__dirname,f),'utf8')))keep.add(o.k)}catch(e){}
const PLJ=(()=>{try{const m=new Map();for(const o of JSON.parse(fs.readFileSync(path.join(__dirname,'plurals.json'),'utf8')))m.set(o.k,new Set(o.idx));return m}catch(e){return new Map()}})();
const ph=s=>[...new Set((s.match(/\{\d+(?:\|[^|{}]*\|[^{}]*)?\}/g)||[]).map(x=>x.replace(/\|.*\}$/,'}')))].sort().join();
function cjkPlOK(k,v){const want=ph(k).split(',').filter(Boolean),got=new Set(ph(v).split(',').filter(Boolean));if([...got].some(x=>!want.includes(x)))return false;
  return want.filter(x=>!got.has(x)).every(x=>{const n=+x.slice(1,-1);return (PLJ.get(k)||new Set()).has(n)||new RegExp('[A-Za-z]\\{'+n+'\\}(?![A-Za-z])').test(k)})}
const langs=fs.readdirSync(__dirname).filter(d=>/^[a-z]{2}$/.test(d)&&fs.statSync(path.join(__dirname,d)).isDirectory()).sort();
const out={keys:used.size,langs:{}};let over=[];
for(const L of langs){const all={};for(const f of fs.readdirSync(path.join(__dirname,L)).filter(f=>/^part-\d+\.json$/.test(f)).sort()){try{Object.assign(all,JSON.parse(fs.readFileSync(path.join(__dirname,L,f),'utf8')))}catch(e){over.push(L+': '+f+' is not JSON')}}
  const CJK=/^(ja|zh)$/.test(L),diffOnly=L==='au';
  const missing=diffOnly?[]:[...used.keys()].filter(k=>!(k in all));
  const unused=diffOnly?[]:Object.keys(all).filter(k=>!used.has(k)&&!keep.has(k));
  const broken=Object.entries(all).filter(([k,v])=>typeof v!=='string'||(ph(k)!==ph(v)&&!(CJK&&cjkPlOK(k,v))));
  out.langs[L]={entries:Object.keys(all).length,missing:missing.length,unused:unused.length,broken:broken.length,
    sample:{missing:missing.slice(0,8).map(k=>k.slice(0,70)+' ← '+used.get(k)),broken:broken.slice(0,5).map(([k,v])=>k.slice(0,60)+' → '+String(v).slice(0,60))}};
  for(const x of ['missing','unused','broken'])if(out.langs[L][x]>CEIL[x])over.push(`${L}: ${x} ${out.langs[L][x]} > ${CEIL[x]}`)}
out.ceil=CEIL;out.over=over;
if(args.has('--json'))process.stdout.write(JSON.stringify(out));
else if(!args.has('--quiet')){console.log(`i18n check: ${out.keys} keys used by the page`);for(const [L,o] of Object.entries(out.langs))console.log(`  ${L}: ${o.entries} entries · missing ${o.missing} · unused ${o.unused} · broken placeholders ${o.broken}`+(o.sample.broken.length?'\n      broken: '+o.sample.broken.join(' ‖ '):''));
  console.log(over.length?'OVER THE CEILING: '+over.join('; '):`all within the ceilings (missing ≤ ${CEIL.missing}, unused ≤ ${CEIL.unused}, broken ≤ ${CEIL.broken})`)}
process.exitCode=over.length?1:0;

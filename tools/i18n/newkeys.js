/* the keys not yet in the Spanish parts: every _T key in src/ (keys.js) + the static text of 01-head.html (text nodes and
   title/placeholder/aria-label, read by 148-v86lang's langStatic86) → tools/i18n/src/part-NN.json (next free NN) */
const fs=require('fs'),path=require('path'),{execSync}=require('child_process');
const ROOT=path.resolve(__dirname,'..','..');
const have=new Set();for(const f of fs.readdirSync(path.join(__dirname,'es')))if(/^part-\d+\.json$/.test(f))for(const k of Object.keys(JSON.parse(fs.readFileSync(path.join(__dirname,'es',f),'utf8'))))have.add(k);
const out=new Map();
const K=JSON.parse(execSync('node '+path.join(__dirname,'keys.js'),{maxBuffer:1<<28}).toString());
for(const o of K.keys)if(!have.has(o.k)&&!out.has(o.k))out.set(o.k,o.file+':'+o.line);
/* 01-head static markup */
const head=fs.readFileSync(require('../srcpath').abs('01-head.html'),'utf8').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<script[\s\S]*?<\/script>/g,'');
const add=(t,w)=>{t=t.replace(/\s+/g,' ').trim();if(t.length<2||!/[A-Za-z]{2}/.test(t)||have.has(t)||out.has(t))return;if(/^[\w-]+$/.test(t)&&!/^[A-Z][a-z]+$/.test(t))return;out.set(t,w)};
head.replace(/>([^<>]+)</g,(m,t)=>{if(t.trim())add(t,'01-head.html');return m});
head.replace(/\b(title|placeholder|aria-label)="([^"]+)"/g,(m,a,t)=>{add(t,'01-head.html ['+a+']');return m});
const used=fs.readdirSync(path.join(__dirname,'src')).map(f=>+((f.match(/part-(\d+)/)||[])[1]||0));const nn=String(Math.max(...used)+1).padStart(2,'0');
const arr=[...out].map(([k,w])=>({k,w}));
if(arr.length){fs.writeFileSync(path.join(__dirname,'src','part-'+nn+'.json'),JSON.stringify(arr,null,1));}
console.log(arr.length,'new keys → part-'+nn);

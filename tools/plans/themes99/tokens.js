/* themes99 token contrast: node tools/plans/themes99/tokens.js — WCAG ratios of every text token over every surface of each proposed
   arena palette (266-v99themes THEMES99.P), plus button text over the primary/danger buttons. Below 4.5 = flagged. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'../../../src/266-v99themes.js'),'utf8');
const ctx={localStorage:{getItem:()=>null},LOC_THEMES:{},THEME_PRESETS:{}};vm.createContext(ctx);vm.runInContext(src+';this.__P=THEMES99.P',ctx);
const P=ctx.__P;const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const lum=h=>{const [r,g,b]=rgb(h).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*r+0.7152*g+0.0722*b};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
const DIM='#a3907a',BASE={ink:'#140f0b',panel:'#1f1711',panel2:'#2a1f17',bone:'#efe3cc',muted:'#b39d80',gold:'#d6ab4c',gold2:'#f0cf7d',blood:'#a3281f',blood2:'#d24a3a',hp:'#6fae4c',mv:'#e8862e'};
const CLS=['#c2412d','#3a6fd6','#3f9a4a','#c9a227','#9a9a9a','#d07a2a','#8b4fb0','#6b5a4a'];
function check(name,t){const out=[];let min=99;
  for(const bg of ['ink','panel','panel2'])for(const fg of ['bone','muted','gold','gold2','blood2','dim','hp','mv']){const f=fg==='dim'?DIM:(t[fg]||BASE[fg]);const r=cr(f,t[bg]);min=Math.min(min,r);if(r<4.5)out.push(`${fg} on ${bg} ${r.toFixed(2)}`)}
  for(const bt of ['blood']){const r=cr(t.bone,t[bt]);if(r<4.5)out.push(`bone on ${bt} button ${r.toFixed(2)}`)}
  return {name,min:+min.toFixed(2),below:out}}
const rows=[check('Arena (default) — today',BASE)];for(const [k,p] of Object.entries(P))rows.push(check('loc'+k,{...BASE,...p.ui}));
for(const r of rows)console.log(`${r.name.padEnd(26)} min ${r.min}  ${r.below.length?'BELOW AA: '+r.below.join('; '):'all ≥ 4.5'}`);

/* Strong polish comparison: node tools/plans/mock99/strong.js flavius-arena.html
   Loads the game, draws sample faces with the REAL painters (ORIGINAL), the first pass (face99.js) and the strong pass (face99b.js, two
   styles: painterly / inked) at 240 px and 64 / 28 px, measures build + insert/layout/paint per face, writes portrait_strong.html,
   portrait_strong.png, portrait_strong_small.png and costs_strong.json. */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');(async()=>{const b=await chromium.launch();const out=__dirname;
const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
await pg.addScriptTag({path:path.join(__dirname,'face99.js')});await pg.addScriptTag({path:path.join(__dirname,'face99b.js')});
const R=await pg.evaluate(async(fast)=>{if(CUR_MODAL)CUR_MODAL.done(null);const TEX=tex99b();
  const lan=[{name:'Aulus Vettius Crispus',spec:{skin:SKINS[1],hair:HAIRS[2],helm:'laurel',bs:'full',bg:BGS[2]},color:'#c0433a'},
    {name:'Domitia Severa',spec:{skin:SKINS[0],hair:HAIRS[0],helm:'diadem',fem:true,hs:'long',ear:'pearl',neck:'pearls',bg:BGS[4]},color:'#8a5cc0'},
    {name:'Old Proculus',spec:{skin:SKINS[5],hair:HAIRS[9],helm:'none',hs:'bald',bs:'longbeard',mark:'scar',garb:'toga',bg:BGS[11]},color:'#9a8f84'},
    {name:'Titus "the Fox" Murena',spec:{skin:SKINS[3],hair:HAIRS[14],helm:'none',hs:'curly',bs:'stache',smile:true,ear:'hoop',neck:'torque',bg:BGS[6]},color:'#dc7a34'}];
  const chars=[{name:'Marcus Varro',spec:{skin:SKINS[4],hair:HAIRS[2],helm:'galea',hs:'',bs:'full',garb:'',eyes:'#5a3a1e'},color:'#c0433a'},
    {name:'Aurelia',spec:{skin:SKINS[1],hair:HAIRS[3],helm:'none',hs:'long',fem:true,garb:'scale',mark:'kohl',ear:'1',neck:'torque',eyes:'#3a6a4a'},color:'#4f7fc4'},
    {name:'Nubian archer',spec:{skin:SKINS[10],hair:HAIRS[0],helm:'murmillo',hs:'',garb:'chain'},color:'#4f9a57'},
    {name:'Old Brutus',spec:{skin:SKINS[6],hair:HAIRS[9],helm:'laurel',hs:'crop',bs:'full',mark:'scar',garb:'fur',eyes:'#3a5a8a'},color:'#d4b13c'}];
  const glads=['g_401','g_77','g_1203','g_9'].map((id,i)=>{const cls=['soldier','hero','amazonia','venatore'][i];return {name:id+' · '+cls,spec:gladPortrait(id,cls),color:CLASSES[cls].color}});
  const spect=[{skin:'#e6cfa8',hair:'#4a2c17',beard:true,hat:'pileus',tunic:'#e8dcc0',robe:'#7a2230'},{skin:'#c68e5f',hair:'#1f1510',fem:true,long:true,hat:'veil',tunic:'#d8c8a8',robe:'#35606a'},
    {skin:'#96603b',hair:'#2e2019',hat:'straw',tunic:'#cdb48a',robe:'#a86a2a'}].map((l,i)=>({name:'Spectator '+(i+1),look:l}));
  const adv=council83Make('demo-career-7').slice(0,3).map(a=>({name:a.name+' · '+a.role,look:a.face}));
  const beasts=[{name:'Leo (lion)',color:'#b8782e',face:{species:'feline',c1:'#c08a3e',c2:'#e8d4a0',eyes:'#f0cf7d',eyeT:'two',mane:true,fangs:true,bg:'#3a2412'}},
    {name:'Lupus (wolf)',color:'#6a6a72',face:{species:'canine',c1:'#7a7a80',c2:'#d8d4cc',eyes:'#e8c050',eyeT:'two',fangs:true,bg:'#1d2a33'}},
    {name:'Ursa (bear)',color:'#5a3a22',face:{species:'ursine',c1:'#6a4428',c2:'#b08a64',eyes:'#e0b040',eyeT:'two',scar:true,bg:'#26331f'}}];
  const tokOf=n=>rtokSVG(typeof rtokSpecOf==='function'?rtokSpecOf(n):rtokBlank(n),n);
  const H=(s,w,h)=>s.replace('<svg ',`<svg width="${w}" height="${h}" `);
  const S=[240,64,28];
  /* each column: (sample, px) → svg */
  const COLS=['original','first','paint','ink'];
  const bustF={original:(x,w)=>H(portraitSVG(x.spec,x.color),w,Math.round(w*1.4)),first:(x,w)=>face99(x.spec,{color:x.color,w,h:Math.round(w*1.4),grain:w>=150}),
    paint:(x,w)=>face99b(x.spec,{color:x.color,w,h:Math.round(w*1.4)}),ink:(x,w)=>face99b(x.spec,{color:x.color,w,h:Math.round(w*1.4),style:'ink'})};
  const fr=w=>w<48?'head':'chip';
  const chipF={original:(x,w)=>specFaceSVG(x.look).replace('width="20" height="20"',`width="${w}" height="${w}"`),first:(x,w)=>{const sp=fromSpect99(x.look);return face99(sp,{frame:fr(w),w,color:sp.robe})},
    paint:(x,w)=>{const sp=fromSpect99(x.look);return face99b(sp,{frame:fr(w),w,color:sp.robe})},ink:(x,w)=>{const sp=fromSpect99(x.look);return face99b(sp,{frame:fr(w),w,color:sp.robe,style:'ink'})}};
  const beastF={original:(n,w)=>H(tokOf(n),w,w),first:(n,w)=>H(beastPolish99(tokOf(n),n.face),w,w),paint:(n,w)=>H(beast99b(tokOf(n),n.face,{w}),w,w),ink:(n,w)=>H(beast99b(tokOf(n),n.face,{w,style:'ink'}),w,w)};
  const rows=[];const row=(kind,x,F)=>{const r={kind,name:x.name,c:{}};for(const c of COLS)r.c[c]=S.map(w=>F[c](x,w));rows.push(r)};
  lan.forEach(x=>row('Lanista',x,bustF));chars.forEach(x=>row('Studio character / online gladiator',x,bustF));glads.forEach(x=>row('Manager gladiator (generated)',x,bustF));
  spect.forEach(x=>row('Spectator / patron (crop)',x,chipF));adv.forEach(x=>row('Council advisor (crop)',x,chipF));beasts.forEach(x=>row('Beast token round',x,beastF));
  /* ---------- costs ---------- */
  const time=(fn,n=60)=>{fn();const t=performance.now();for(let i=0;i<n;i++)fn();return (performance.now()-t)/n};
  const paint=async(html,n)=>{const box=document.createElement('div');box.style.cssText='position:fixed;left:0;top:0;width:1400px;display:flex;flex-wrap:wrap;z-index:99999;background:#000';document.body.appendChild(box);
    const runs=[];for(let k=0;k<5;k++){box.innerHTML='';await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const t=performance.now();box.innerHTML=html.repeat(n);box.getBoundingClientRect();
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));runs.push(performance.now()-t)}box.remove();runs.sort((a,b)=>a-b);return runs[2]/n};
  const C={};const N={240:24,64:120,28:240};
  if(!fast)for(const [kind,x,F] of [['bust',chars[0],bustF],['bust_fem',chars[1],bustF],['chip',spect[0],chipF],['beast',beasts[0],beastF]]){C[kind]={};
    for(const c of COLS){C[kind][c]={};for(const w of S){const s=F[c](x,w);C[kind][c][w]={buildMs:+time(()=>F[c](x,w),c==='paint'||c==='ink'?40:200).toFixed(3),kb:+(s.length/1024).toFixed(1),paintMs:+(await paint(s,N[w])).toFixed(3)}}}}
  return {rows,C,TEX}},!!process.env.FAST);
/* ---------- the static page ---------- */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');const groups=[...new Set(R.rows.map(r=>r.kind))];
const CN={original:'Original',first:'First pass',paint:'Strong · painterly',ink:'Strong · inked'};
const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Strong Portrait Pass</title>
<style>:root{--bg:#140f0b;--p:#1f1711;--l:#4a3826;--g:#d6ab4c;--t:#efe3cc;--d:#a3907a}body{margin:0;background:var(--bg);color:var(--t);font:14px/1.4 system-ui,sans-serif;padding:20px 16px}
h1{font:400 26px Georgia,serif;color:#f0cf7d;margin:0 0 4px}p.s{color:var(--d);margin:0 0 14px;max-width:1180px}
h2{font:600 12px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--g);margin:18px 0 8px;border-bottom:1px solid var(--l);padding-bottom:4px}
.hd,.r{display:grid;grid-template-columns:110px repeat(4,312px);gap:8px;align-items:end}.hd{background:var(--bg);padding:6px 0;font:600 11px ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--d)}
.hd .on{color:var(--g)}.r{background:var(--p);border:1px solid var(--l);border-radius:8px;padding:8px;margin-bottom:8px}.r .n{font-size:12px;color:var(--d);align-self:center}
.cell{display:flex;gap:8px;align-items:flex-end}.sm{display:grid;gap:6px;justify-items:center}
.small{display:grid;grid-template-columns:150px repeat(4,1fr);gap:4px 10px;align-items:center;background:var(--p);border:1px solid var(--l);border-radius:8px;padding:10px}
.small .n{font-size:11px;color:var(--d)}.small .c{display:flex;gap:8px;align-items:flex-end}.small .h{font:600 11px ui-monospace,monospace;color:var(--g);text-transform:uppercase}
table{border-collapse:collapse;margin-top:8px;font:12px ui-monospace,monospace}td,th{border:1px solid var(--l);padding:3px 8px;text-align:right}th{color:var(--g)}td:first-child,td:nth-child(2){text-align:left}
</style></head><body>${R.TEX}
<h1>Portraits — original · first pass · strong pass</h1><p class="s">Same spec, same geometry, same palette. The strong pass repaints each shape by its material: key light from the upper left, red-shifted shadow side, a cool rim from behind right, reflected light, cast shadows from the shapes above (occlusion where shapes meet), modelled face planes, eyelids + iris + catchlights, ear and neck anatomy, lips in two tones, hair/beard strands along the flow with a sheen band and flyaways, metal specular bands + bevel, cloth folds + weave, a painterly backdrop. Two looks: <b>painterly</b> (soft, textured) and <b>inked</b> (contours, cel steps, hatching). Small sizes use tiers (≥120 px full · 48–119 no textures · &lt;48 lite). Prototype: tools/plans/mock99/face99b.js.</p>
<div class="hd"><span></span>${Object.keys(CN).map(k=>`<span class="${k==='paint'||k==='ink'?'on':''}">${CN[k]} · 240 / 64 / 28</span>`).join('')}</div>
${groups.map(g=>`<h2>${esc(g)}</h2>${R.rows.filter(r=>r.kind===g).map(r=>`<div class="r"><div class="n">${esc(r.name)}</div>${Object.keys(CN).map(k=>`<div class="cell">${r.c[k][0]}<div class="sm">${r.c[k][1]}${r.c[k][2]}</div></div>`).join('')}</div>`).join('')}`).join('')}
<h2 id="smallsec">Small sizes (64 and 28 px, as in lists, roster rows, chips)</h2><div class="small" id="small"><span></span>${Object.keys(CN).map(k=>`<span class="h">${CN[k]}</span>`).join('')}
${R.rows.map(r=>`<span class="n">${esc(r.name)}</span>${Object.keys(CN).map(k=>`<span class="c">${r.c[k][1]}${r.c[k][2]}</span>`).join('')}`).join('')}</div>
<h2>Cost per face (headless Chromium, this machine; insert + layout + paint, median of 5)</h2><table><tr><th>sample</th><th>column</th>${[240,64,28].map(w=>`<th>${w}px build ms</th><th>${w}px KB</th><th>${w}px paint ms</th>`).join('')}</tr>
${Object.entries(R.C).map(([k,v])=>Object.entries(v).map(([c,s])=>`<tr><td>${k}</td><td>${CN[c]}</td>${[240,64,28].map(w=>`<td>${s[w].buildMs}</td><td>${s[w].kb}</td><td>${s[w].paintMs}</td>`).join('')}</tr>`).join('')).join('')}</table>
</body></html>`;
fs.writeFileSync(path.join(out,'portrait_strong.html'),html);if(!process.env.FAST)fs.writeFileSync(path.join(out,'costs_strong.json'),JSON.stringify(R.C,null,1));
const p2=await b.newPage({viewport:{width:1440,height:900}});await p2.goto('file://'+path.join(out,'portrait_strong.html'));await p2.waitForTimeout(800);
await p2.screenshot({path:path.join(out,'portrait_strong.png'),fullPage:true});
const sm=await p2.$('#small');await sm.screenshot({path:path.join(out,'portrait_strong_small.png')});
console.log(JSON.stringify(R.C));console.log('ERRS',JSON.stringify(errs.slice(0,10)));await b.close()})();

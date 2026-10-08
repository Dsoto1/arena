/* Portrait polish prototype: node tools/plans/mock99/portraits.js flavius-arena.html
   Loads the game, draws sample faces with the REAL painters (portraitSVG, specFaceSVG, council83Make, gladPortrait, rtokSVG/beastFaceSVG)
   and with the one-face prototype (face99.js), measures cost, writes portraits.html (static) + portrait_before_after.png + costs.json. */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');(async()=>{const b=await chromium.launch();const out=__dirname;
const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
await pg.addScriptTag({path:path.join(__dirname,'face99.js')});
const R=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);
  /* ---------- samples ---------- */
  const lan=MGR_PRE.slice(0,4).map(m=>({name:m.name,spec:{...(m.portrait||{helm:'laurel'})},color:m.color}));
  const chars=[{name:'Marcus Varro',spec:{skin:SKINS[4],hair:HAIRS[2],helm:'galea',hs:'',bs:'full',garb:'',eyes:'#5a3a1e'},color:'#c0433a'},
    {name:'Aurelia',spec:{skin:SKINS[1],hair:HAIRS[3],helm:'none',hs:'long',fem:true,garb:'scale',mark:'kohl',ear:'1',neck:'torque'},color:'#4f7fc4'},
    {name:'Nubian archer',spec:{skin:SKINS[10],hair:HAIRS[0],helm:'murmillo',hs:'',garb:'chain'},color:'#4f9a57'},
    {name:'Old Brutus',spec:{skin:SKINS[6],hair:HAIRS[9],helm:'laurel',hs:'crop',bs:'full',mark:'scar',garb:'fur'},color:'#d4b13c'}];
  const glads=['g_401','g_77','g_1203','g_9'].map((id,i)=>{const cls=['soldier','hero','amazonia','venatore'][i];return {name:id+' · '+cls,spec:gladPortrait(id,cls),color:CLASSES[cls].color}});
  const spect=[{skin:'#e6cfa8',hair:'#4a2c17',beard:true,hat:'pileus',tunic:'#e8dcc0',robe:'#7a2230'},{skin:'#c68e5f',hair:'#1f1510',fem:true,long:true,hat:'veil',tunic:'#d8c8a8',robe:'#35606a'},
    {skin:'#96603b',hair:'#2e2019',hat:'straw',tunic:'#cdb48a',robe:'#a86a2a'},{skin:'#f1c9a5',hair:'#9a6a30',beard:true,hat:'',tunic:'#e8dcc0',robe:'#5a4636'}].map((l,i)=>({name:'Spectator '+(i+1),look:l}));
  const adv=council83Make('demo-career-7').slice(0,4).map(a=>({name:a.name+' · '+a.role,look:a.face}));
  const beasts=[{name:'Leo (lion)',color:'#b8782e',face:{species:'feline',c1:'#c08a3e',c2:'#e8d4a0',eyes:'#f0cf7d',eyeT:'two',mane:true,fangs:true,bg:'#3a2412'}},
    {name:'Lupus (wolf)',color:'#6a6a72',face:{species:'canine',c1:'#7a7a80',c2:'#d8d4cc',eyes:'#e8c050',eyeT:'two',fangs:true,bg:'#1d2a33'}},
    {name:'Ursa (bear)',color:'#5a3a22',face:{species:'ursine',c1:'#6a4428',c2:'#b08a64',eyes:'#e0b040',eyeT:'two',scar:true,bg:'#26331f'}},
    {name:'Aper (boar)',color:'#4a3a2a',face:{species:'boar',c1:'#5a4634',c2:'#a08468',eyes:'#e06030',eyeT:'two',pattern:'spots',bg:'#3a1840'}}];
  const tokOf=n=>{const sp=typeof rtokSpecOf==='function'?rtokSpecOf(n):rtokBlank(n);return rtokSVG(sp,n)};
  /* ---------- rows: [today, one face (no polish), one face + polish] ---------- */
  const H=(s,w,h)=>s.replace('<svg ',`<svg width="${w}" height="${h}" `);
  const rows=[];
  const bust=(x,kind)=>({kind,name:x.name,today:H(portraitSVG(x.spec,x.color),170,238),todaySm:H(portraitSVG(x.spec,x.color),54,76),
     after:face99(x.spec,{color:x.color,w:170,h:238,grain:true}),afterSm:face99(x.spec,{color:x.color,w:54,h:76})});
  lan.forEach(x=>rows.push(bust(x,'Lanista')));chars.forEach(x=>rows.push(bust(x,'Studio character / online gladiator / Annals')));glads.forEach(x=>rows.push(bust(x,'Manager gladiator (generated from id)')));
  const chip=(x,kind)=>{const sp=fromSpect99(x.look);return {kind,name:x.name,today:specFaceSVG(x.look).replace('width="20" height="20"','width="96" height="96"'),todaySm:specFaceSVG(x.look),
     mid:face99(sp,{frame:'chip',w:96,polish:false,color:sp.robe}),after:face99(sp,{frame:'chip',w:96,color:sp.robe}),afterSm:face99(sp,{frame:'head',w:20,color:sp.robe})}};
  spect.forEach(x=>rows.push(chip(x,'Spectator / online patron')));adv.forEach(x=>rows.push(chip(x,'Council advisor')));
  beasts.forEach(n=>{const t=tokOf(n);rows.push({kind:'Beast token round',name:n.name,today:H(t,120,120),todaySm:H(t,28,28),after:H(beastPolish99(t,n.face),120,120),afterSm:H(beastPolish99(t,n.face),28,28)})});
  /* ---------- costs ---------- */
  const time=(fn,n=400)=>{fn();const t=performance.now();for(let i=0;i<n;i++)fn();return (performance.now()-t)/n};
  const paint=async(html,n=60)=>{const box=document.createElement('div');box.style.cssText='position:fixed;left:0;top:0;width:1400px;display:flex;flex-wrap:wrap;z-index:99999;background:#000';document.body.appendChild(box);
    const runs=[];for(let k=0;k<5;k++){box.innerHTML='';await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const t=performance.now();box.innerHTML=html.repeat(n);box.getBoundingClientRect();
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));runs.push(performance.now()-t)}box.remove();runs.sort((a,b)=>a-b);return runs[2]/n};
  const P0=chars[0],S0=spect[0],B0=beasts[0];
  const C={};
  C.bust={paintTodayMs:time(()=>portraitSVG(P0.spec,P0.color)),paintAfterMs:time(()=>face99(P0.spec,{color:P0.color})),paintAfterGrainMs:time(()=>face99(P0.spec,{color:P0.color,grain:true})),
    bytesToday:portraitSVG(P0.spec,P0.color).length,bytesAfter:face99(P0.spec,{color:P0.color}).length,bytesAfterGrain:face99(P0.spec,{color:P0.color,grain:true}).length};
  C.bust.rasterTodayMs170=await paint(H(portraitSVG(P0.spec,P0.color),170,238));C.bust.rasterAfterMs170=await paint(face99(P0.spec,{color:P0.color,w:170,h:238}));C.bust.rasterAfterGrainMs170=await paint(face99(P0.spec,{color:P0.color,w:170,h:238,grain:true}));
  C.bust.rasterTodayMs54=await paint(H(portraitSVG(P0.spec,P0.color),54,76),150);C.bust.rasterAfterMs54=await paint(face99(P0.spec,{color:P0.color,w:54,h:76}),150);
  const s0=fromSpect99(S0.look);
  C.chip={paintTodayMs:time(()=>specFaceSVG(S0.look)),paintAfterMs:time(()=>face99(s0,{frame:'head',color:s0.robe})),bytesToday:specFaceSVG(S0.look).length,bytesAfter:face99(s0,{frame:'head',color:s0.robe}).length};
  C.chip.rasterTodayMs20=await paint(specFaceSVG(S0.look),300);C.chip.rasterAfterMs20=await paint(face99(s0,{frame:'head',w:20,color:s0.robe}),300);C.chip.rasterAfterNoPolishMs20=await paint(face99(s0,{frame:'head',w:20,color:s0.robe,polish:false}),300);
  const t0=tokOf(B0);C.beast={paintTodayMs:time(()=>tokOf(B0)),paintAfterMs:time(()=>beastPolish99(tokOf(B0),B0.face)),bytesToday:t0.length,bytesAfter:beastPolish99(t0,B0.face).length};
  C.beast.rasterTodayMs28=await paint(H(t0,28,28),200);C.beast.rasterAfterMs28=await paint(H(beastPolish99(t0,B0.face),28,28),200);
  for(const k in C)for(const j in C[k])C[k][j]=Math.round(C[k][j]*1000)/1000;
  return {rows,C}});
/* ---------- the static page ---------- */
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const groups=[...new Set(R.rows.map(r=>r.kind))];
const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>One Face Polish</title>
<style>:root{--bg:#140f0b;--p:#1f1711;--l:#4a3826;--g:#d6ab4c;--t:#efe3cc;--d:#a3907a}body{margin:0;background:var(--bg);color:var(--t);font:14px/1.4 system-ui,sans-serif;padding:20px 16px}
h1{font:400 26px Georgia,serif;color:#f0cf7d;margin:0 0 4px}p.s{color:var(--d);margin:0 0 16px;max-width:1100px}
h2{font:600 12px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--g);margin:18px 0 8px;border-bottom:1px solid var(--l);padding-bottom:4px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(440px,1fr));gap:10px}
.pair{background:var(--p);border:1px solid var(--l);border-radius:8px;padding:8px;display:grid;gap:4px}.pair .n{font-size:12px;color:var(--d)}
.cols{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap}.cols figure{margin:0;display:grid;justify-items:center;gap:3px}.cols figcaption{font:10px ui-monospace,monospace;color:var(--d);text-transform:uppercase}
.sm{display:flex;gap:6px;align-items:flex-end}.cols .after figcaption{color:var(--g)}
table{border-collapse:collapse;margin-top:8px;font:12px ui-monospace,monospace}td,th{border:1px solid var(--l);padding:3px 8px;text-align:right}th{color:var(--g)}td:first-child{text-align:left}
@media (max-width:420px){.grid{grid-template-columns:1fr}}</style></head><body>
<h1>One face — before / after the polish</h1><p class="s">Every human face drawn by ONE painter from ONE spec (today's portrait geometry, so each character keeps its exact shapes, pose and palette) + light from the upper left: shaded face planes, soft occlusion under the brows, nose and chin, catchlights, hair and beard strands, metal glints, cloth folds, a cast shadow on the backdrop and a vignette; paper grain only at the large size. Spectators and advisors are a crop of the same bust (no second face system). Beasts keep their own face designer but get the same light on the token round. Prototype: tools/plans/mock99/face99.js.</p>
${groups.map(g=>`<h2>${esc(g)}</h2><div class="grid">${R.rows.filter(r=>r.kind===g).map(r=>`<div class="pair"><div class="n">${esc(r.name)}</div><div class="cols">
<figure>${r.today}<figcaption>today</figcaption></figure>${r.mid?`<figure>${r.mid}<figcaption>one face</figcaption></figure>`:''}<figure class="after">${r.after}<figcaption>polished</figcaption></figure>
<figure><div class="sm">${r.todaySm}${r.afterSm}</div><figcaption>small: today · polished</figcaption></figure></div></div>`).join('')}</div>`).join('')}
<h2>Cost (headless Chromium, this machine)</h2><table><tr><th>kind</th><th>metric</th><th>today</th><th>polished</th></tr>
<tr><td>bust</td><td>build SVG string, ms</td><td>${R.C.bust.paintTodayMs}</td><td>${R.C.bust.paintAfterMs} (grain ${R.C.bust.paintAfterGrainMs})</td></tr>
<tr><td>bust</td><td>SVG size, bytes</td><td>${R.C.bust.bytesToday}</td><td>${R.C.bust.bytesAfter} (grain ${R.C.bust.bytesAfterGrain})</td></tr>
<tr><td>bust 170×238</td><td>insert+layout+paint per face, ms</td><td>${R.C.bust.rasterTodayMs170}</td><td>${R.C.bust.rasterAfterMs170} (grain ${R.C.bust.rasterAfterGrainMs170})</td></tr>
<tr><td>bust 54×76</td><td>insert+layout+paint per face, ms</td><td>${R.C.bust.rasterTodayMs54}</td><td>${R.C.bust.rasterAfterMs54}</td></tr>
<tr><td>spectator chip</td><td>build SVG string, ms</td><td>${R.C.chip.paintTodayMs}</td><td>${R.C.chip.paintAfterMs}</td></tr>
<tr><td>spectator chip</td><td>SVG size, bytes</td><td>${R.C.chip.bytesToday}</td><td>${R.C.chip.bytesAfter}</td></tr>
<tr><td>spectator 20px</td><td>insert+layout+paint per face, ms</td><td>${R.C.chip.rasterTodayMs20}</td><td>${R.C.chip.rasterAfterMs20} (no polish ${R.C.chip.rasterAfterNoPolishMs20})</td></tr>
<tr><td>beast token</td><td>build SVG string, ms</td><td>${R.C.beast.paintTodayMs}</td><td>${R.C.beast.paintAfterMs}</td></tr>
<tr><td>beast token</td><td>SVG size, bytes</td><td>${R.C.beast.bytesToday}</td><td>${R.C.beast.bytesAfter}</td></tr>
<tr><td>beast 28px</td><td>insert+layout+paint per token, ms</td><td>${R.C.beast.rasterTodayMs28}</td><td>${R.C.beast.rasterAfterMs28}</td></tr></table>
</body></html>`;
fs.writeFileSync(path.join(out,'portraits.html'),html);fs.writeFileSync(path.join(out,'costs.json'),JSON.stringify(R.C,null,1));
const p2=await b.newPage({viewport:{width:1440,height:900}});await p2.goto('file://'+path.join(out,'portraits.html'));await p2.waitForTimeout(500);
await p2.screenshot({path:path.join(out,'portrait_before_after.png'),fullPage:true});
await p2.setViewportSize({width:390,height:900});await p2.waitForTimeout(300);await p2.screenshot({path:path.join(out,'portrait_before_after_390.png'),clip:{x:0,y:0,width:390,height:1800}});
console.log(JSON.stringify(R.C,null,1));console.log('ERRS',JSON.stringify(errs));await b.close()})();

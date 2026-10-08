/* Face VARIETY mock: node tools/plans/mock99/variety.js flavius-arena.html
   Loads the game, injects face99b.js (strong painterly painter) + face99v.js (the new parts), writes variety.html and
   variety_parts.png (one base character, every option of every part, 160 px), variety_crowd.png (24 random people with today's parts vs the
   same 24 with the new parts rolled, 96 + 40 px), variety_generated.png (12 Manager-style fighters from an id hash, before/after),
   and prints the identity check (no new parts → byte-identical to face99b) + sizes. */
const {chromium}=require('playwright');const path=require('path');const fs=require('fs');(async()=>{const b=await chromium.launch();const out=__dirname;
const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
await pg.addScriptTag({path:path.join(__dirname,'face99b.js')});await pg.addScriptTag({path:path.join(__dirname,'face99v.js')});
const R=await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);const TEX=tex99b();
  const H=(spec,w,col)=>faceV(spec,{color:col||spec.color||'#c0433a',w,h:Math.round(w*1.4)});
  /* (0) identity: a face without the new parts is face99b's output (ids differ per call: strip them) */
  const strip=s=>s.replace(/q\d+_/g,'q_');const base={skin:SKINS[3],hair:HAIRS[2],helm:'none',hs:'crop',eyes:'#5a3a1e',bg:BGS[1]};
  const ident=strip(faceV(base,{color:'#c0433a',w:160}))===strip(face99b(base,{color:'#c0433a',w:160}));
  /* (1) parts */
  const rows=PARTS99V.map(([k,label,vals,names])=>({k,label,cells:vals.map((v,i)=>({name:names[i],key:v,svg:H({...base,[k]:v},150)}))}));
  /* a woman's row for the parts that read differently on her */
  const baseF={skin:SKINS[1],hair:HAIRS[0],helm:'none',fem:true,hs:'long',eyes:'#3a6a4a',bg:BGS[4]};
  const rowsF=['fs','ey','lp','ns','ag'].map(k=>{const P=PARTS99V.find(p=>p[0]===k);return {k,label:P[1]+' (woman)',cells:P[2].map((v,i)=>({name:P[3][i],key:v,svg:H({...baseF,[k]:v},150,'#4f7fc4')}))}});
  /* seeded rng */
  const fnv=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619)>>>0;return h};
  const rngOf=seed=>{let h=seed>>>0;return ()=>(h=(Math.imul(h,1103515245)+12345)>>>0)/4294967296};
  const W=(r,list)=>{const t=list.reduce((a,x)=>a+x[1],0);let v=r()*t;for(const [k,w] of list){if((v-=w)<0)return k}return list[0][0]};
  /* how a generated face rolls the new parts (weights; '' = today's shape) */
  window.rollParts=function(r,o){o=o||{};const fem=!!o.fem,fighter=!!o.fighter;return {
    fs:W(r,[['',28],['sq',16],['rd',14],['lg',14],['ht',13],['dm',15]]),
    jw:W(r,[['',52],['nar',fem?22:13],['wid',15],['str',fem?4:20]]),
    ck:W(r,[['',58],['hi',26],['flat',16]]),
    br:W(r,[['',32],['thk',fem?6:18],['thn',fem?26:7],['arc',fem?18:10],['str',12],['scr',fighter&&!fem?9:3],['uni',6]]),
    ey:W(r,[['',34],['alm',16],['rnd',12],['hod',14],['nar',12],['dep',12]]),
    es:W(r,[['',70],['wide',15],['close',15]]),
    ns:W(r,[['',28],['rom',18],['brd',15],['btn',fem?16:8],['lng',15],['brk',fighter&&!fem?16:4]]),
    lp:W(r,[['',32],['thn',13],['ful',fem?20:11],['wid',10],['sml',10],['dwn',12],['smk',10]]),
    ea:W(r,[['',55],['sml',13],['lrg',12],['pro',11],['caul',fighter&&!fem?12:1]]),
    nk:W(r,[['',50],['sht',16],['lng',fem?24:12],['bul',fem?2:20]]),
    ag:W(r,o.age||[['',48],['yng',26],['wth',19],['old',7]]),
    ln:W(r,[['',74],['f',10],['c',10],['fc',6]])}};
  /* today's random look (randomPortrait's lists, seeded) */
  const pick=(r,a)=>a[Math.floor(r()*a.length)];
  const today=(seed)=>{const r=rngOf(fnv('crowd'+seed));const fem=r()<.35;return {skin:pick(r,SKINS),hair:pick(r,HAIRS),helm:r()<.62?'none':pick(r,HELMS)[0],fem,smile:r()<.3,bg:pick(r,BGS),hs:pick(r,HAIRSTYLES)[0],
    bs:fem?'':(r()<.6?pick(r,BEARDS)[0]:''),eyes:pick(r,EYES)[0],mark:r()<.25?pick(r,MARKS)[0]:'',garb:r()<.55?pick(r,GARBS)[0]:'',ear:r()<.3?pick(r,EARRINGS.slice(1))[0]:'',neck:r()<.3?pick(r,NECKS.slice(1))[0]:'',
    color:pick(r,['#c0433a','#4f7fc4','#4f9a57','#d4b13c','#8a5cc0','#dc7a34','#9a8f84','#3a8a8a'])}};
  const crowd=[];for(let i=0;i<24;i++){const t=today(i);const v={...t,...rollParts(rngOf(fnv('fx:crowd'+i)),{fem:t.fem})};v.fx=vPack(v);crowd.push({t,v})}
  const cell=(s,w)=>faceV(s,{color:s.color,w,h:Math.round(w*1.4)});
  const crowdHTML={t96:crowd.map(c=>cell(c.t,96)).join(''),v96:crowd.map(c=>cell(c.v,96)).join(''),t40:crowd.map(c=>cell(c.t,40)).join(''),v40:crowd.map(c=>cell(c.v,40)).join('')};
  /* (3) Manager-style generated fighters: gladPortrait(id,cls) + the new parts from a second hash stream of the same id */
  const CLS=['soldier','royalty','hero','slave','veteranus','amazonia','venatore','damnatio'];
  const gens=[];for(let i=0;i<12;i++){const id='g_'+(1000+i*137);const cls=CLS[i%8];const fem=cls==='amazonia'||i===9;let L=gladPortrait(id,cls);if(fem)L={...L,fem:true,beard:false};
    const age=cls==='veteranus'?[['',30],['wth',45],['old',25]]:cls==='slave'||cls==='damnatio'?[['',40],['yng',20],['wth',35],['old',5]]:null;
    const parts=rollParts(rngOf(fnv('fx:'+id)),{fem,fighter:true,age});const after={...L,...parts};const fx=vPack(parts);
    gens.push({id,cls,fx,parts,b96:faceV(L,{color:CLASSES[cls].color,w:96,h:134}),a96:faceV(after,{color:CLASSES[cls].color,w:96,h:134}),b40:faceV(L,{color:CLASSES[cls].color,w:40,h:56}),a40:faceV(after,{color:CLASSES[cls].color,w:40,h:56})})}
  /* sizes: the stored spec */
  const sz=o=>JSON.stringify(o).length;const ex={fs:'sq',jw:'str',br:'scr',ey:'dep',ns:'brk',lp:'dwn',ea:'caul',nk:'bul',ag:'wth',ln:'f'};
  const flat=JSON.stringify(ex).length,packed=JSON.stringify({fx:vPack(ex)}).length,packedMax=JSON.stringify({fx:'zzzzzzzzzzzz'}).length;
  const avgPacked=crowd.reduce((a,c)=>a+JSON.stringify({fx:c.v.fx}).length,0)/crowd.length;
  const avgFlat=crowd.reduce((a,c)=>{const o={};for(const [k] of PARTS99V)if(c.v[k])o[k]=c.v[k];return a+(Object.keys(o).length?JSON.stringify(o).length-2+1:0)},0)/crowd.length;
  /* cost: build + svg size, today vs variety */
  const time=(fn,n=30)=>{fn();const t=performance.now();for(let i=0;i<n;i++)fn();return (performance.now()-t)/n};
  const cv=crowd[3].v,ct=crowd[3].t;
  const cost={build240_today:+time(()=>faceV(ct,{w:240})).toFixed(2),build240_var:+time(()=>faceV(cv,{w:240})).toFixed(2),kb240_today:+(faceV(ct,{w:240}).length/1024).toFixed(1),kb240_var:+(faceV(cv,{w:240}).length/1024).toFixed(1),
    kb64_today:+(faceV(ct,{w:64}).length/1024).toFixed(1),kb64_var:+(faceV(cv,{w:64}).length/1024).toFixed(1),kb28_today:+(faceV(ct,{w:28}).length/1024).toFixed(1),kb28_var:+(faceV(cv,{w:28}).length/1024).toFixed(1)};
  return {TEX,ident,rows,rowsF,crowdHTML,crowd:crowd.map(c=>c.v.fx),gens:gens,bytes:{flat,packed,packedMax,avgPacked:+avgPacked.toFixed(1),avgFlat:+avgFlat.toFixed(1),example:vPack(ex)},cost}});
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Face Variety</title>
<style>:root{--bg:#140f0b;--p:#1f1711;--l:#4a3826;--g:#d6ab4c;--t:#efe3cc;--d:#a3907a}body{margin:0;background:var(--bg);color:var(--t);font:14px/1.4 system-ui,sans-serif;padding:20px 16px}
h1{font:400 26px Georgia,serif;color:#f0cf7d;margin:0 0 4px}p.s{color:var(--d);margin:0 0 14px;max-width:1300px}
h2{font:600 12px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--g);margin:18px 0 8px;border-bottom:1px solid var(--l);padding-bottom:4px}
.sec{background:var(--bg);padding:10px;width:max-content;max-width:1400px}
.prow{display:grid;grid-template-columns:120px repeat(7,160px);gap:6px;align-items:end;background:var(--p);border:1px solid var(--l);border-radius:8px;padding:6px 8px;margin-bottom:6px}
.prow .n{font:600 12px ui-monospace,monospace;color:var(--g);align-self:center}.pc{display:grid;justify-items:center;gap:2px}.pc span{font-size:11px;color:var(--d)}.pc code{font-size:10px;color:#7d6a55}
.two{display:grid;grid-template-columns:max-content max-content;gap:14px}.panel{background:var(--p);border:1px solid var(--l);border-radius:8px;padding:8px}.panel h3{margin:0 0 6px;font:600 12px ui-monospace,monospace;color:var(--g);text-transform:uppercase;letter-spacing:.1em}
.grid96{display:grid;grid-template-columns:repeat(6,96px);gap:4px}.grid40{display:grid;grid-template-columns:repeat(12,40px);gap:4px;margin-top:10px}
.gen{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}.gc{background:var(--p);border:1px solid var(--l);border-radius:8px;padding:6px;display:grid;gap:3px;justify-items:center}
.gc .pair{display:flex;gap:4px;align-items:flex-end}.gc .lbl{font:11px ui-monospace,monospace;color:var(--d)}.gc .b{font-size:10px;color:#8a7a66}.gc .a{font-size:10px;color:var(--g)}
</style></head><body>${R.TEX}
<h1>Face variety — new parts on the painterly face</h1><p class="s">Each new part is one short key with a small value list; the empty value is today's shape, so a face without the new parts is drawn exactly as today (checked: ${R.ident?'identical':'DIFFERENT'}). Shape changes are made on the bust before the paint pass, and the painterly planes (cheekbones, hollows, jaw light/shadow, nose planes, lips, eyelids) are placed from the new shape.</p>
<div class="sec" id="parts"><h2>1 · One base character, every option (painterly, 160 px)</h2>
${[...R.rows,...R.rowsF].map(r=>`<div class="prow"><div class="n">${esc(r.label)}<br><code>${r.k}</code></div>${r.cells.map(c=>`<div class="pc">${c.svg}<span>${esc(c.name)}</span><code>${c.key||"''"}</code></div>`).join('')}</div>`).join('')}</div>
<div class="sec" id="crowd"><h2>2 · A crowd of 24 — today's parts only vs the same 24 with the new parts rolled</h2><div class="two">
<div class="panel"><h3>Today's parts only · 96 px + 40 px</h3><div class="grid96">${R.crowdHTML.t96}</div><div class="grid40">${R.crowdHTML.t40}</div></div>
<div class="panel"><h3>With the new parts · 96 px + 40 px</h3><div class="grid96">${R.crowdHTML.v96}</div><div class="grid40">${R.crowdHTML.v40}</div></div></div></div>
<div class="sec" id="gen"><h2>3 · Manager-style generated fighters (gladPortrait(id, cls) + parts from the same id's hash): before → after</h2><div class="gen">
${R.gens.map(g=>`<div class="gc"><div class="lbl">${g.id} · ${g.cls}</div><div class="b">before · after</div><div class="pair">${g.b96}${g.a96}</div><div class="pair">${g.b40}${g.a40}</div><div class="a">fx "${g.fx}" · ${Object.values(g.parts).filter(Boolean).join(' ')}</div></div>`).join('')}</div></div>
</body></html>`;
fs.writeFileSync(path.join(out,'variety.html'),html);
const p2=await b.newPage({viewport:{width:1440,height:900}});await p2.goto('file://'+path.join(out,'variety.html'));await p2.waitForTimeout(800);
for(const [id,f] of [['parts','variety_parts.png'],['crowd','variety_crowd.png'],['gen','variety_generated.png']]){const el=await p2.$('#'+id);await el.screenshot({path:path.join(out,f)})}
console.log(JSON.stringify({ident:R.ident,bytes:R.bytes,cost:R.cost,gens:R.gens.map(g=>[g.id,g.cls,g.fx])}));console.log('ERRS',JSON.stringify(errs.slice(0,10)));await b.close()})();

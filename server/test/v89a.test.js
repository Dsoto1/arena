/* v0.89 J — ARMOR AFFIXES II + THE NAMED-ARMOR CURVE (contract tools/plans/onl89-affix.md): the rolls are deterministic and capped, the new
   flags survive cleaning, the curve stays inside its bounds (exact odds + a seeded Monte Carlo), Integer never breaks, Fidelis goes home.
   node server/test/v89a.test.js (also run by npm test) */
'use strict';
const assert=require('assert');const catalog=require('../src/catalog.json');const C=require('../src/onlcore.js');
function seeded(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
const NEW=['venat','miss','firm','spin','lapid','integ','fid','fort'];
C.setCatalog(catalog);

/* ── 1. rolls: deterministic, per tier, fits, names, clean ── */
for(let s=1;s<300;s++)for(const r of ['common','rare','epic','legendary']){const a=C.rollNamedArmor(seeded(s),catalog,r,[]),b=C.rollNamedArmor(seeded(s),catalog,r,[]);
  assert.deepStrictEqual(a,b,'the same roll for the same randomness');assert.strictEqual(a.rar,r);assert.strictEqual(a.aff.length,{common:0,rare:1,epic:2,legendary:2}[r],r+' affix count');
  assert.strictEqual(new Set(a.aff).size,a.aff.length,'no affix twice');assert.ok(a.ap>=1&&a.ap<=6,'AP cap');assert.ok(!catalog[a.base].stack,'never padding');
  if(a.aff.includes('fort'))assert.strictEqual(r,'legendary','Fortunae only on Legendary');
  if(a.aff.includes('firm'))assert.strictEqual(a.slot,'leg','Firmus on legs');
  if(a.aff.includes('spin'))assert.ok(['chest','belt','arm'].includes(a.slot),'Spinosus on chest/arm');
  if(a.aff.includes('miss'))assert.ok(['head','chest','belt','arm'].includes(a.slot),'Missilis on chest/arm/helm');
  for(const k of NEW)if(a.aff.includes(k))assert.strictEqual(a[k],1,k+' flag set');
  assert.ok(a.n&&a.n.length<=40&&!/undefined/.test(a.n),a.n);
  const cl=C.cleanNamedA({...a,key:'na_x.1'});for(const k of NEW)assert.strictEqual(!!cl[k],!!a[k],k+' survives cleanNamedA');assert.deepStrictEqual(cl.aff,a.aff,'aff kept')}
assert.strictEqual(C.cleanNamedA({key:'na_1',slot:'head',lapid:1,evil:1}).lapid,1);assert.strictEqual(C.cleanNamedA({key:'na_1',slot:'head',evil:1}).evil,undefined);
/* the Latin names: one adjective form per gender for every affix */
for(const k of [...Object.keys(C.AFF_W89),'fort']){assert.ok(C.AFFIX_A[k]&&C.AFFIX_A[k].n,k+' has a text');assert.strictEqual((C.AFF_ADJ89[k]||[]).length,3,k+' m/f/n')}

/* ── 2. gifts: weapons roll exactly as v0.84 (same draws), armor tiers on RAR_A89 ── */
for(let s=1;s<4000;s++){const g=C.rollGift(seeded(s),catalog,'veteranus');if(g.k==='named'){assert.ok(['a','w'].includes(g.kind));assert.ok(['common','rare','epic','legendary'].includes(g.rar))}}
{const rnd=seeded(7);const N=300000;const t={};let na=0,n=0;for(let i=0;i<N;i++){const g=C.rollGift(rnd,catalog,'tiro');if(g.k!=='named')continue;n++;if(g.kind!=='a')continue;na++;t[g.rar]=(t[g.rar]||0)+1}
  assert.ok(Math.abs(n/N-0.02)<0.002,'2% of openings are named: '+n/N);assert.ok(Math.abs(na/n-C.NAMED_ARMOR_SHARE)<0.03,'armor share '+na/n);
  const want={common:.60,rare:.28,epic:.10,legendary:.02};for(const r in want)assert.ok(Math.abs((t[r]||0)/na-want[r])<Math.max(0.035,want[r]*0.6),r+' tier '+(t[r]||0)/na)}

/* ── 3. the curve: exact odds within the agreed bounds ── */
{const O=C.affixOdds89(catalog,'a');const tw=O.tiers.reduce((a,x)=>a+x[1],0);assert.strictEqual(tw,100);
  assert.deepStrictEqual(O.tiers.map(x=>x[1]),[60,28,10,2],'Common 60 / Rare 28 / Epic 10 / Legendary 2');
  for(const r of ['rare','epic','legendary']){const sum=Object.values(O.aff[r]).reduce((a,x)=>a+x,0);assert.ok(Math.abs(sum-O.n[r])<1e-9,r+' affix chances add up to the affix count: '+sum)}
  const tP=Object.fromEntries(O.tiers.map(([k,w])=>[k,w/100]));const rp=tP.rare+tP.epic+tP.legendary;
  const lap=['rare','epic','legendary'].reduce((a,r)=>a+tP[r]*(O.aff[r].lapid||0),0)/rp;assert.ok(lap>1/14&&lap<1/10.5,'Lapidarius ≈ 1 in 12 Rare-or-better: 1 in '+(1/lap).toFixed(1));
  const helm=['rare','epic','legendary'].reduce((a,r)=>a+tP[r]*O.helmLapid[r],0)/rp;assert.ok(helm>lap*1.2,'helms more likely');
  assert.ok(Math.abs(O.aff.legendary.fort-C.FORT_LEG89)<1e-9&&C.FORT_LEG89>=0.2&&C.FORT_LEG89<=0.3,'Fortunae ≈ 1 in 4 Legendaries');assert.ok(!O.aff.rare.fort&&!O.aff.epic.fort);
  const common=['ap','bonus'],mid=['ward','swift','venat','miss','firm'],rare=['spin','lapid','integ','fid'];
  for(const c of common)for(const m of mid)assert.ok(C.AFF_W89[c]>C.AFF_W89[m],c+' over '+m);for(const m of mid)for(const r of rare)assert.ok(C.AFF_W89[m]>C.AFF_W89[r],m+' over '+r);
  /* a seeded Monte Carlo agrees with the exact numbers */
  const rnd=seeded(11);const M=30000;const x={};for(let i=0;i<M;i++){const a=C.rollNamedArmor(rnd,catalog,'epic',[]);for(const k of a.aff)x[k]=(x[k]||0)+1}
  for(const k of Object.keys(O.aff.epic))assert.ok(Math.abs((x[k]||0)/M-O.aff.epic[k])<0.015,k+' MC '+(x[k]||0)/M+' vs '+O.aff.epic[k])
  const G=C.giftOdds89();assert.ok(Math.abs(G.kinds.reduce((a,x)=>a+x[1],0)-1)<1e-9,'gift kinds sum to 1');assert.ok(Math.abs(G.namedA-0.02*C.NAMED_ARMOR_SHARE)<1e-9)}

/* ── 4. Integer never comes back Broken; Fidelis goes home when its Ranked wearer falls ── */
function armed(flag,id){const ch=C.newChar({name:'Iron Will',cls:'hero'},'o',id,0);ch.glory=600;let def=null;
  for(let s=1;s<4000&&!def;s++){const a=C.rollNamedArmor(seeded(s),catalog,'epic',[]);if(a.aff.includes(flag))def=a}assert.ok(def,'a piece with '+flag);
  const P=C.namedPiece(def,ch);C.putPiece(ch,P,true);C.putPiece(ch,{item:'gladius',pc:null},true);return {ch,P,key:P.pc.w.key}}
{const {ch,P,key}=armed('integ','ig');const kit=C.kitOf(ch);assert.ok(kit.gear.includes(key));assert.ok(kit.named.find(d=>d.key===key).integ,'the kit carries the flag');
  const gx=C.gearAfter(ch,kit,C.cleanRow({survives:true,brk:[key,'gladius']}),true);
  assert.ok(!gx.broken.some(it=>it===P.item),'Integer never breaks');assert.strictEqual(C.isBroken(ch,P.item),false);assert.strictEqual(gx.broken.length,0);assert.deepStrictEqual(gx.gone,[],'v1.0: the printed gladius is no longer used up');assert.deepStrictEqual(gx.dent100.map(x=>x.key),['gladius'],'… it comes home dented')}
{const {ch,P,key}=armed('lapid','pl');const kit=C.kitOf(ch);const gx=C.gearAfter(ch,kit,{survives:true,brk:[key]},true);assert.ok(gx.broken.length===1&&C.isBroken(ch,gx.broken[0]),'a plain named piece breaks as before')}
{const {ch,P}=armed('fid','fd');const kit=C.kitOf(ch);const gx=C.gearAfter(ch,kit,{survives:false},true);
  assert.ok(!gx.carried.some(x=>x.item===P.item),'the killer never sees Fidelis');assert.ok(gx.carried.some(x=>x.item==='gladius'),'the rest is still loot (v1.0: printed pieces nobody takes go home dented)');
  const home=gx.left.find(x=>x.item===P.item);assert.ok(home,'Fidelis goes to the house Storeroom (out.left)');assert.strictEqual(home.pc.hist.slice(-1)[0].how,'home');
  const D={id:'d1',gear:[],pcs:{}};for(const Q of gx.left)C.putPiece(D,Q,false);assert.ok(D.gear.includes(P.item)&&D.pcs[C.itemUid(P.item)].w.fid,'on the house shelf with its def')}
{const {ch,P}=armed('lapid','nf');const gx=C.gearAfter(ch,C.kitOf(ch),{survives:false},true);assert.ok(gx.carried.some(x=>x.item===P.item),'without Fidelis it is loot')}
/* Custom: nothing breaks, nothing moves */
{const {ch,P,key}=armed('integ','cu');const gx=C.gearAfter(ch,C.kitOf(ch),{survives:true,brk:[key]},false);assert.deepStrictEqual(gx.broken,[])}
console.log('server v0.89 J affixes (rolls + fits + names + clean, gift tiers, the curve exact + Monte Carlo, Integer, Fidelis home): all passed');

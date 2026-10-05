/* v0.89 J — the named-armor curve: exact odds (ONLC.affixOdds89 / giftOdds89) checked against a Monte Carlo of gift openings.
   node tools/affixsim.js [openings=400000] [seed=89]     → prints the markdown tables used in tools/plans/onl89-affix.md
   Assumptions: every Legendary unique is still unclaimed (a claimed-out Legendary rolls Epic), and every named piece is freshly rolled
   (gift.open takes a piece back from Flavius's chest pool half the time when the pool holds one — those keep their own rolls). */
'use strict';
const path=require('path');
const C=require(path.join(__dirname,'../src/111-onlcore.js'));const cat=require(path.join(__dirname,'../server/src/catalog.json'));
const N=+process.argv[2]||400000, SEED=+process.argv[3]||89;
function seeded(seed){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
const pct=x=>(x*100).toFixed(x<0.01?3:x<0.1?2:1)+'%';const one=x=>x>0?'1 in '+Math.round(1/x).toLocaleString('en'):'—';
const TIERS=['common','rare','epic','legendary'];
/* ── exact ── */
const OA=C.affixOdds89(cat,'a'),G=C.giftOdds89();
const tw=OA.tiers.reduce((a,x)=>a+x[1],0);const tP=Object.fromEntries(OA.tiers.map(([k,w])=>[k,w/tw]));
const AFF=[...Object.keys(C.AFF_W89),'fort'];
const perPiece=k=>['rare','epic','legendary'].reduce((a,r)=>a+tP[r]*(OA.aff[r][k]||0),0);
const rarePlus=tP.rare+tP.epic+tP.legendary;
const lapRP=['rare','epic','legendary'].reduce((a,r)=>a+tP[r]*(OA.aff[r].lapid||0),0)/rarePlus;
const slotLap=s=>OA.slot[s]*['rare','epic','legendary'].reduce((a,r)=>a+tP[r]*((OA.slotAff[s][r]||{}).lapid||0),0); /* per named armor piece */
const helmLapRP=['rare','epic','legendary'].reduce((a,r)=>a+tP[r]*OA.helmLapid[r],0)/rarePlus;
const otherLapRP=(lapRP*rarePlus-OA.slot.head*helmLapRP*rarePlus)/(1-OA.slot.head)/rarePlus;
/* the full stone-proof set: a Lapidarius piece in each of head · chest (or belt) · arm · leg — coupon collector over the four slots, exact by inclusion–exclusion */
const SETS=['head','chest','arm','leg'];const ps=SETS.map(s=>G.namedA*(slotLap(s)+(s==='chest'?slotLap('belt'):0)));
let Eset=0;for(let m=1;m<16;m++){const S=SETS.map((s,i)=>m>>i&1?ps[i]:0).filter(Boolean);Eset+=(S.length%2?1:-1)/S.reduce((a,x)=>a+x,0)}
const Ehelm=1/(G.namedA*slotLap('head')), Efort=1/(G.namedA*tP.legendary*C.FORT_LEG89);
/* ── Monte Carlo of gift openings ── */
const rnd=seeded(SEED);const mc={open:0,named:0,namedA:0,tier:{},aff:{},rp:0,rpLap:0,helmRP:0,helmLap:0,fort:0,firstHelm:[],kinds:{}};let since=0;
for(let i=0;i<N;i++){const rw=C.rollGift(rnd,cat,'veteranus');mc.open++;{const kk=rw.k==='gear'?(rw.lv===1?'l1':'l23'):rw.k;mc.kinds[kk]=(mc.kinds[kk]||0)+1}since++;if(rw.k!=='named')continue;mc.named++;if(rw.kind!=='a')continue;
  const a=C.rollNamedArmor(rnd,cat,rw.rar,[]);mc.namedA++;mc.tier[a.rar]=(mc.tier[a.rar]||0)+1;for(const k of a.aff)mc.aff[k]=(mc.aff[k]||0)+1;
  if(a.rar!=='common'){mc.rp++;if(a.aff.includes('lapid'))mc.rpLap++;if(a.slot==='head'){mc.helmRP++;if(a.aff.includes('lapid'))mc.helmLap++}}
  if(a.aff.includes('fort'))mc.fort++;if(a.slot==='head'&&a.aff.includes('lapid')){mc.firstHelm.push(since);since=0}}
/* direct rolls per tier (affix shares with tight bounds) */
const D={};for(const r of ['rare','epic','legendary']){const x={};const M=20000;const rr=seeded(SEED+r.length);for(let i=0;i<M;i++){const a=C.rollNamedArmor(rr,cat,r,[]);for(const k of a.aff)x[k]=(x[k]||0)+1}D[r]=Object.fromEntries(Object.entries(x).map(([k,v])=>[k,v/M]))}
/* ── the tables ── */
const out=[];const P=(...a)=>out.push(a.join(''));
P('### 1 · A gift opening (exact, from ONLC.GIFT_W)');P('');P('| Reward | Chance | Monte Carlo ('+N.toLocaleString('en')+' openings) |');P('|---|---|---|');
for(const [k,p] of G.kinds)P(`| ${k} | ${pct(p)} | ${pct((mc.kinds[k]||0)/N)} |`);
P(`| → named ARMOR | ${pct(G.namedA)} | ${pct(mc.namedA/N)} |`);P(`| → named weapon | ${pct(G.namedW)} | ${pct((mc.named-mc.namedA)/N)} |`);P('');
P('### 2 · Named armor tiers (RAR_A89)');P('');P('| Tier | Chance | Monte Carlo | Affixes |');P('|---|---|---|---|');
for(const r of TIERS)P(`| ${C.rarOf(r).n} | ${pct(tP[r])} | ${pct((mc.tier[r]||0)/(mc.namedA||1))} | ${C.rarOf(r).aff}${r==='legendary'?' + a unique':''} |`);P('');
P('### 3 · Each affix: the chance a piece carries it (exact; per tier, then per named armor piece of any tier)');P('');
P('| Affix | Weight | Rare | Epic | Legendary | Any named armor piece | Monte Carlo (direct rolls R/E/L) |');P('|---|---|---|---|---|---|---|');
for(const k of AFF)P(`| ${k} · ${C.AFF_LAT89[k]} | ${k==='fort'?'Legendary only, '+pct(C.FORT_LEG89):C.AFF_W89[k]+(k==='lapid'?' (×'+C.LAPID_HELM89+' on a helm)':'')} | ${pct(OA.aff.rare[k]||0)} | ${pct(OA.aff.epic[k]||0)} | ${pct(OA.aff.legendary[k]||0)} | ${pct(perPiece(k))} | ${['rare','epic','legendary'].map(r=>pct(D[r][k]||0)).join(' / ')} |`);
P('');P('### 4 · Targets');P('');P('| Measure | Exact | Monte Carlo | Target |');P('|---|---|---|---|');
P(`| Lapidarius among Rare-or-better armor | ${one(lapRP)} (${pct(lapRP)}) | ${one(mc.rpLap/(mc.rp||1))} | ≈ 1 in 12 |`);
P(`| … on a Rare-or-better helm | ${one(helmLapRP)} | ${one(mc.helmLap/(mc.helmRP||1))} | twice the others |`);
P(`| … on any other Rare-or-better piece | ${one(otherLapRP)} | | |`);
P(`| Fortunae among Legendary armor | ${pct(C.FORT_LEG89)} | ${pct(mc.fort/((mc.tier.legendary)||1))} | ≈ 1 in 4 |`);
P('');P('### 5 · How long (gift openings; every piece freshly rolled)');P('');P('| Goal | Expected gift openings | Named armor pieces | Monte Carlo |');P('|---|---|---|---|');
const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length).toLocaleString('en'):'—';
P(`| One Lapidarius helm | ${Math.round(Ehelm).toLocaleString('en')} | ${Math.round(1/slotLap('head'))} | ${avg(mc.firstHelm)} (${mc.firstHelm.length} found) |`);
P(`| A full stone-proof set (Lapidarius head · chest · arm · leg) | ${Math.round(Eset).toLocaleString('en')} | ${Math.round(Eset*G.namedA)} | |`);
P(`| One Fortunae piece | ${Math.round(Efort).toLocaleString('en')} | ${Math.round(1/(tP.legendary*C.FORT_LEG89))} | ${mc.fort?Math.round(N/mc.fort).toLocaleString('en'):'—'} |`);
console.log(out.join('\n'));

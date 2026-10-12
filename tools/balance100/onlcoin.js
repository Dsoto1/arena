/* onlcoin.js — v1.0 balance pass, the ONLINE COIN model (pure node, no browser). Rules read from the shared module (server/src/onlcore.js =
   src/111-onlcore.js): AWARD by rank, WIN_BONUS, streak (+10% a survived Ranked bout, ≤ +100%), tableFactor, GLORY (CF + 12 survived + 8 win),
   RANKS by Glory, Flavius's gifts (every rank reached + every GIFT_EVERY survived; coin share of GIFT_W, coin = AWARD×GIFT_COIN89), the weekly
   challenge gift (≤1 a week), PRICE / PRICE_AP, KIT_DISC92, kits92.json, repairCost (damaged = ceil(value × AP lost)), SLOT100, CLASS_FEE89 100.
   Bout outcomes are drawn from tools/balance100/onlgear.js sims of the same class (survives the Fate, won, CF, which brought pieces came back and how dented).
   Policies: ISSUED = fights on the free daily Issued kit only and spends nothing (days to afford = days until the treasury holds the price);
             KEEN = buys his class kit (+ class weapons) as soon as the treasury holds it, then pays every repair and replacement after each bout
             and rebuys the whole kit for the next gladiator after a death (sinks).
   Usage: node tools/balance100/onlcoin.js tools/plans/balance100/raw/onlgear_fighter.json [houses=4000] [days=120] > summary.json  (Markdown on stderr)
   CAVEAT: survival comes from sims with the CLASS loadout on every seat; an Issued-kit gladiator (padding + an L1 weapon) survives less. */
const fs=require('fs');const path=require('path');
const R=path.join(__dirname,'../../server/src/');const C=require(R+'onlcore.js');const CAT=require(R+'catalog.json');const KITS=require(R+'kits92.json');
const raw=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const HOUSES=+(process.argv[3]||4000),DAYS=+(process.argv[4]||120);
const ONLC=C.ONLC||C;
/* what-if overrides (env): SURVT=15 (a Ranked gladiator survives at final CF ≥ SURVT instead of 20; spared Thumbs stay), AWARDK=1.5 (awards ×),
   GLORYK=0.5 (rank Glory thresholds ×), KEEPW=1 (weapons never destroyed: only armor at 0 AP is lost), DENT=1 (armor at 0 AP comes back damaged: repair = price/3 instead of a new piece) */
const GIFTONCE=!!process.env.GIFTONCE; /* GIFTONCE=1: a rank-up gift once per house per rank (not again for every new gladiator) */
const SURVT=+(process.env.SURVT||20),AWARDK=+(process.env.AWARDK||1),GLORYK=+(process.env.GLORYK||1),KEEPW=!!process.env.KEEPW,DENT=!!process.env.DENT,DEADK=process.env.DEADK!=null?+process.env.DEADK:null; /* DEADK=0.33: on a Ranked death the printed kit goes to the house shelf damaged — repair = kit × DEADK instead of buying it again */
const AWARD=Object.fromEntries(Object.entries(ONLC.AWARD).map(([k,v])=>[k,v*AWARDK])),RANKS=ONLC.RANKS.map(r=>({...r,glory:r.glory*GLORYK})),GLORY=ONLC.GLORY,GIFT_W=ONLC.GIFT_W,GIFT_EVERY=ONLC.GIFT_EVERY;
const coinShare=GIFT_W.find(x=>x[0]==='coin')[1]/GIFT_W.reduce((a,x)=>a+x[1],0);const GC=ONLC.GIFT_COIN89||[2,5];
const price=k=>CAT[k]?ONLC.priceOf(CAT[k]):0;
const CW={soldier:['gladius'],royalty:['pugio'],hero:['sica','thracian'],slave:['trident'],veteranus:['rudis'],amazonia:['axe','falcata'],venatore:['hasta'],damnatio:['sling']};
const kitCost=cls=>{const a=(KITS[cls]||[]).reduce((s,k)=>s+price(k),0);return Math.round(a*(1-ONLC.KIT_DISC92))+CW[cls].reduce((s,k)=>s+price(k),0)};
/* outcome pools per class */
const pool={};for(const g of raw.games)for(const s0 of g.s){if(!s0.g)continue;const s={...s0,sv:s0.f>=SURVT||(s0.sv&&s0.f<20)?1:0};(pool[s.c]=pool[s.c]||[]).push(s)}
const all=Object.values(pool).flat();
/* the sink of one bout for a KEEN house: survivors repair dented pieces and replace pieces not held; the dead lose the kit (rebuy) */
function sinkOf(s){if(!s.sv)return null;let rep=0,rpl=0;const seen={};
  for(const [k,l,has,d] of s.g.a){if(!CAT[k])continue;const pair=CAT[k].pair;const key=pair?k:k+'@'+l;if(seen[key])continue;seen[key]=1;
    if(!has){if(DENT)rep+=Math.ceil(price(k)/3);else rpl+=price(k)}else if(d>0)rep+=Math.max(1,Math.ceil(price(k)*d))}
  for(const [k,has] of s.g.w)if(!KEEPW&&!has&&CAT[k])rpl+=price(k);return {rep,rpl}}
const rankOf=g=>{let r=RANKS[0];for(const x of RANKS)if(g>=x.glory)r=x;return r};
let seed=12345;const rnd=()=>((seed=(seed*1103515245+12345)>>>0)/4294967296);
function sim(cls,bpd,humans,policy){const P=cls==='mix'?all:pool[cls];const tf=ONLC.tableFactor(humans);const res={days:{},deaths:0,bouts:0,maxRank:0,treasury:[],sinkRep:0,sinkRpl:0,sinkKit:0,short:0,income:0,gift:0,peakGlory:0};
  const houseRk=new Set();let fallen=0,dr=0,kitDmg=false,owe=0;let T=0,glory=0,streak=0,survived=0,rk=0,kit=policy==='keen'?false:null;const targets={kitL2:null,l3:750,slot2:200,slot3:500,slot4:1000,classFee:100};
  const tKit=kitCost(cls==='mix'?'hero':cls);const reached={};let week=-1,wkGift=false;
  for(let d=0;d<DAYS;d++){const w=Math.floor(d/7);if(w!==week){week=w;wkGift=false}let wkWin=0,wkSurv=0;
    for(let b=0;b<bpd;b++){if(policy==='keen'&&!kit&&kitDmg){if(T>=owe){T-=owe;res.sinkRep+=owe;kit=true;kitDmg=false;owe=0}}
      if(policy==='keen'&&!kit&&!kitDmg&&T>=tKit){T-=tKit;res.sinkKit+=tKit;kit=true}
      const o=P[Math.floor(rnd()*P.length)];res.bouts++;if(kit===true)res.kitBouts=(res.kitBouts||0)+1;const r0=rankOf(glory),rIdx0=RANKS.indexOf(r0);
      glory+=tf*(Math.max(0,o.f)+(o.sv?GLORY.survived:0)+(o.sv&&o.w?GLORY.win:0));
      if(o.sv){const a=Math.round(Math.round((AWARD[r0.k])*(o.w?1+ONLC.WIN_BONUS:1)*(1+Math.min(1,streak*0.1)))*tf);T+=a;res.income+=a;streak++;survived++;
        const r1=rankOf(glory),rIdx1=RANKS.indexOf(r1);let gifts=0;for(let i=Math.max(rIdx0,rk)+1;i<=rIdx1;i++){if(GIFTONCE){if(houseRk.has(i))continue;houseRk.add(i)}gifts++}if(survived%GIFT_EVERY===0)gifts++;rk=Math.max(rk,rIdx1);
        for(let i=0;i<gifts;i++)if(rnd()<coinShare){const g=Math.round(AWARD[r1.k]*(GC[0]+rnd()*(GC[1]-GC[0])));T+=g;res.gift+=g}
        if(o.w)wkWin++;wkSurv++;
        if(policy==='keen'&&kit){const s=sinkOf(o);if(s){const pay=s.rep+s.rpl;if(pay<=T){T-=pay;res.sinkRep+=s.rep;res.sinkRpl+=s.rpl}else{res.short=(res.short||0)+1;kit=false;if(KEEPW&&DENT){kitDmg=true;owe=pay}}}}}
      else{res.deaths++;res.peakGlory=Math.max(res.peakGlory,glory);fallen+=glory;glory=0;streak=0;survived=0;rk=0;if(policy==='keen'){if(kit===true){if(DEADK!=null){kitDmg=true;owe=Math.round(tKit*DEADK)}else{kitDmg=false;owe=0}}kit=false}}
      res.maxRank=Math.max(res.maxRank,RANKS.indexOf(rankOf(glory)));
      if(!wkGift&&wkWin>=1&&wkSurv>=1&&b>=2){wkGift=true;if(rnd()<coinShare){const g=Math.round(AWARD[rankOf(glory).k]*3.5);T+=g;res.gift+=g}}}
    res.peakGlory=Math.max(res.peakGlory,glory);dr=Math.max(dr,glory+0.2*fallen);
    for(const [k,v] of Object.entries({...targets,kitL2:tKit})){const st=ONLC.SLOT100.steps.find(x=>'slot'+x.n===k);if(reached[k]==null&&T>=v&&(!st||dr>=st.glory))reached[k]=d+1}
    for(const st of ONLC.SLOT100.steps)if(reached['g'+st.n]==null&&dr>=st.glory)reached['g'+st.n]=d+1;
    if(d===6||d===29||d===89||d===DAYS-1)res.treasury.push([d+1,T])}
  res.reach=reached;res.dr=dr;res.end=T;res.kit=tKit;return res}
const med=a=>{const s=a.filter(x=>x!=null).sort((x,y)=>x-y);return s.length<a.length/2?null:s[Math.floor(a.length/2)]};
const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
const out={meta:{houses:HOUSES,days:DAYS,coinShare},classes:{},scen:[]};
for(const [c,p] of Object.entries(pool)){const sv=p.filter(x=>x.sv);const sk=sv.map(sinkOf);
  out.classes[c]={n:p.length,surv:+(sv.length/p.length*100).toFixed(1),win:+(p.filter(x=>x.w).length/p.length*100).toFixed(1),cf:+avg(p.map(x=>x.f)).toFixed(1),kit:kitCost(c),
    rep:+avg(sk.map(x=>x.rep)).toFixed(1),rpl:+avg(sk.map(x=>x.rpl)).toFixed(1),lifeBouts:+(1/(1-sv.length/p.length)).toFixed(2)}}
let md='\n### Ranked outcomes per class (onlgear sims)\n\n| Class | Bouts | Survives % | Wins % | CF | Bouts per life | Class kit coin | Repairs / survived bout | Replacements / survived bout |\n|---|---|---|---|---|---|---|---|---|\n';
for(const [c,o] of Object.entries(out.classes))md+=`| ${c} | ${o.n} | ${o.surv} | ${o.win} | ${o.cf} | ${o.lifeBouts} | ${o.kit} | ${o.rep} | ${o.rpl} |\n`;
md+='\n### Days to afford (median over houses; "—" = most houses never get there in '+DAYS+' days) — ISSUED policy (spend nothing)\n\n| Bouts/day | Table | Class | Class kit | L3 piece 750 | Slot 2 (200) | Slot 3 (500) | Slot 4 (1000) | Treasury d7 / d30 / d90 | Deaths per 30 days | Best rank reached |\n|---|---|---|---|---|---|---|---|---|---|---|\n';
for(const bpd of [3,10])for(const hu of [4,2])for(const cls of ['mix','hero','veteranus','damnatio']){
  const R=Array.from({length:HOUSES},()=>sim(cls,bpd,hu,'issued'));const m=k=>{const v=med(R.map(r=>r.reach[k]));return v==null?'—':v};
  const tr=[0,1,2].map(i=>Math.round(avg(R.map(r=>(r.treasury[i]||[0,0])[1]))));
  const rkd={};for(const r of R)rkd[r.maxRank]=(rkd[r.maxRank]||0)+1;const rk=Object.entries(rkd).sort((a,b)=>b[0]-a[0]).map(([k,v])=>RANKS[k].n+' '+Math.round(v/HOUSES*100)+'%').slice(0,3).join(', ');
  const row={bpd,humans:hu,cls,kit:m('kitL2'),l3:m('l3'),slot2:m('slot2'),slot3:m('slot3'),slot4:m('slot4'),tr,deaths30:+(avg(R.map(r=>r.deaths))*30/DAYS).toFixed(1),rk,kitCoin:R[0].kit};
  out.scen.push(row);md+=`| ${bpd} | ${hu} humans | ${cls}${cls==='mix'?' (hero kit)':''} | ${row.kit} (${row.kitCoin}) | ${row.l3} | ${row.slot2} | ${row.slot3} | ${row.slot4} | ${tr.join(' / ')} | ${row.deaths30} | ${rk} |\n`}
md+='\n### KEEN policy (buys the class kit, pays every repair/replacement, rebuys after a death) — flows per house over the whole run (mean)\n\n| Bouts/day | Class | Income (awards) | Gift coin | Kit buys | Repairs | Replacements | Times stripped (could not pay) | Bouts fought in the kit % | Treasury at day '+DAYS+' |\n|---|---|---|---|---|---|---|---|---|---|\n';
out.keen=[];for(const bpd of [3,10])for(const cls of ['hero','soldier','veteranus','amazonia','slave','damnatio']){const R=Array.from({length:Math.round(HOUSES/4)},()=>sim(cls,bpd,4,'keen'));
  const k=x=>Math.round(avg(R.map(r=>r[x])));const row={bpd,cls,income:k('income'),gift:k('gift'),kit:k('sinkKit'),rep:k('sinkRep'),rpl:k('sinkRpl'),end:k('end'),short:k('short'),bouts:k('bouts'),inKit:Math.round(avg(R.map(r=>(r.kitBouts||0)/r.bouts))*100)};out.keen.push(row);
  md+=`| ${bpd} | ${cls} | ${row.income} | ${row.gift} | ${row.kit} | ${row.rep} | ${row.rpl} | ${row.short} | ${row.inKit} | ${row.end} |\n`}
process.stderr.write(md);console.log(JSON.stringify(out));

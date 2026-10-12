/* tweaks.js — v1.0 balance pass: what-if runs for the proposals. The tweak is applied IN THE PAGE at run time (no game code changes),
   then all-CPU Classic sims (Democritus/Egidious/Cassian, 4 seats, Fighter minds) with the TARGET class in one seat (seat drawn per game)
   and three random printed classes in the others. Reports the target's win %, Fate survival % and elimination %, 95% intervals.
   Usage: node tools/balance100/tweaks.js flavius-arena.html <variant[,variant…]> [games=1500] [pages=2] > raw.json
   Variants: dam (Damnatio as is) · dam_pelt2 (pelted only on even rotations = every other Resolve) · dam_helm (Damnatio + Galea + Belt I) · dam_both · dam_nopelt (never pelted) · dam_helmnp (helm + belt, never pelted)
             ama (Amazonia as is) · ama_nofirst (nobody jumps the turn order: seat 1 starts, so Royalty/Amazonia lose "goes first")
             ama_nogreave (Amazonia wears leg wraps instead of her Greaves: no +1 movement)  · roy (Royalty as is) · roy_nofirst */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const page=path.resolve(process.argv[2]);const VARS=process.argv[3].split(',');const N=+(process.argv[4]||1500),NP=+(process.argv[5]||2);
const b=await chromium.launch();const out={};
for(const V of VARS){const pages=[];
  for(let i=0;i<NP;i++){const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());
    await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
    await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
    await pg.evaluate(V=>{while(CUR_MODAL)CUR_MODAL.done(null);menuHide();window.TW={V};
      if(V==='dam_pelt2'||V==='dam_both'||V==='dam_nopelt'||V==='dam_helmnp'){const base=resolvePhase;resolvePhase=async function(p){const skip=p&&weak(p,'pelted')&&!p.drafted&&(/nopelt|helmnp/.test(TW.V)||(S.rotation|0)%2===1);if(skip)p.drafted=true;try{return await base.apply(this,arguments)}finally{if(skip)p.drafted=false}}}
      if(V==='dam_helm'||V==='dam_both'||V==='dam_helmnp')CLASSES.damnatio.armor=[['galea','head'],['balteus1','chest'],...CLASSES.damnatio.armor];
      if(V==='ama_nofalcata')delete CLASSES.amazonia.L;
      if(V==='ama_lorica')CLASSES.amazonia.armor=CLASSES.amazonia.armor.map(([k,l])=>k==='amazon'?['lorica',l]:[k,l]);
      if(V==='ama_nogreave')CLASSES.amazonia.armor=CLASSES.amazonia.armor.filter(([k])=>k!=='greaves');},V);
    pages.push(pg)}
  const tgt={dam:'damnatio',ama:'amazonia',roy:'royalty'}[V.split('_')[0]];const nofirst=/nofirst/.test(V);
  const per=Math.ceil(N/NP);const parts=await Promise.all(pages.map((pg,pi)=>pg.evaluate(async({lo,hi,tgt,nofirst,V})=>{const acc={n:0,w:0,sv:0,a:0,f:0,err:0};
    for(let i=lo;i<hi;i++){let h=(777+i*2654435761)>>>0;const R=()=>((h=(h*1103515245+12345)>>>0)/4294967296);const ev=['democritus','egidious','cassian'][i%3];
      const at=Math.floor(R()*4);const cls=[0,1,2,3].map(j=>j===at?tgt:BASE_CLS[Math.floor(R()*BASE_CLS.length)]);
      const seats=cls.map((c,j)=>({cls:c,cpu:true,diff:'fighter',team:'P'+(j+1)}));
      const cfg={ev,loc:EVENTS[ev].loc,seed:900000+i*7919,seats,opts:{...CFG.opts,spect:0}};if(nofirst)cfg.order=[0,1,2,3];
      let res;try{res=await simEvent(cfg,{timeoutMs:120000})}catch(e){acc.err++;continue}
      const x=res.rows[at];acc.n++;acc.w+=x.won?1:0;acc.sv+=x.survives?1:0;acc.a+=x.alive?1:0;acc.f+=x.f}return acc},{lo:pi*per,hi:Math.min(N,(pi+1)*per),tgt,nofirst,V})));
  const A=parts.reduce((s,x)=>{for(const k in x)s[k]=(s[k]||0)+x[k];return s},{});
  const wil=(k,n)=>{const z=1.96,p=k/n,d=1+z*z/n,c=p+z*z/(2*n),e=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n));return [((c-e)/d*100).toFixed(1),((c+e)/d*100).toFixed(1)]};
  out[V]={n:A.n,err:A.err,win:+(A.w/A.n*100).toFixed(1),winCI:wil(A.w,A.n),fateSurv:+(A.sv/A.n*100).toFixed(1),alive:+(A.a/A.n*100).toFixed(1),cf:+(A.f/A.n).toFixed(1)};
  process.stderr.write(V+' '+JSON.stringify(out[V])+'\n');for(const pg of pages)await pg.close()}
console.log(JSON.stringify(out));await b.close()})();

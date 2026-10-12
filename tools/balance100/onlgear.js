/* onlgear.js — v1.0 balance pass, the Ranked gear wear model. All-CPU Classic sims (Democritus/Egidious/Cassian, 4 seats, one mind) with the
   printed class loadouts; for every seat it records: survives (the Fate), won, CF, and for the pieces it walked in with (armor per location,
   weapons in hand) whether they are still held at the end and how much of each armor piece's location AP is gone (the 197 onl91Dmg rule:
   1 − AP left / AP total on that location). Online Ranked turns "not held" into destroyed (printed) and the AP lost into a repair bill.
   Usage: node tools/balance100/onlgear.js flavius-arena.html [games=1200] [pages=2] [mind=fighter] > raw.json */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const page=path.resolve(process.argv[2]);const N=+(process.argv[3]||1200),NP=+(process.argv[4]||2),MIND=process.argv[5]||'fighter',SEED=+(process.env.SEED||300000);
const b=await chromium.launch();const pages=[];
for(let i=0;i<NP;i++){const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
  await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(null);menuHide();
    const snap=p=>({a:LOCS.flatMap(l=>((p.pieces&&p.pieces[l])||[]).map(pc=>[l,pc.key])),w:[p.wR&&p.wR.key,p.wL&&p.wL.key].filter(Boolean)});
    const bt=beginTurn;beginTurn=function(){try{if(S&&S.sim&&!S._b100){S._b100={};for(const p of S.players)S._b100[p.id]=snap(p)}}catch(e){}return bt.apply(this,arguments)};
    const go=gameOver;gameOver=function(){try{if(S&&S.sim&&S._b100&&!S._e100){S._e100={};for(const p of S.players){const s0=S._b100[p.id]||{a:[],w:[]};const now=snap(p);
        const held=[...now.w];const wk=s0.w.map(k=>{const i=held.indexOf(k);if(i>=0){held.splice(i,1);return [k,1]}return [k,0]});
        const seen={};const ak=s0.a.map(([l,k])=>{const P=(p.pieces&&p.pieces[l])||[];const has=P.some(pc=>pc.key===k);const tot=P.reduce((a,pc)=>a+(pc.ap||0),0);const cur=Math.max(0,(p.ap&&p.ap[l])||0);
          return [k,l,has?1:0,has&&tot?Math.round(Math.max(0,1-Math.min(1,cur/tot))*100)/100:1]});
        S._e100[p.id]={w:wk,a:ak}}window.__e100=S._e100}}catch(e){console.error(e)}return go.apply(this,arguments)}});
  pages.push(pg)}
const out={meta:{N,mind:MIND,seed:SEED},games:[]};const per=Math.ceil(N/NP);let done=0;
await Promise.all(pages.map((pg,pi)=>(async()=>{for(let i=pi*per;i<Math.min(N,(pi+1)*per);i++){
  const r=await pg.evaluate(async({i,MIND,SEED})=>{let h=(SEED+i*2654435761)>>>0;const R=()=>((h=(h*1103515245+12345)>>>0)/4294967296);
    const ev=['democritus','egidious','cassian'][i%3];const cls=[];for(let k=0;k<4;k++)cls.push(BASE_CLS[Math.floor(R()*BASE_CLS.length)]);
    const seats=cls.map((c,j)=>({cls:c,cpu:true,diff:MIND,team:'P'+(j+1)}));let res;window.__e100=null;
    try{res=await simEvent({ev,loc:EVENTS[ev].loc,seed:SEED+i*7919,seats,opts:{...CFG.opts,spect:0}},{timeoutMs:120000})}catch(e){return {err:String(e&&e.message||e)}}
    return {ev,s:res.rows.map((x,j)=>({c:x.cls,j,w:x.won?1:0,sv:x.survives?1:0,f:x.f,g:(window.__e100||{})[x.id]||null}))}},{i,MIND,SEED});
  if(r.err){process.stderr.write('err '+r.err+'\n');continue}
  out.games.push(r);done++;if(done%100===0)process.stderr.write(done+'/'+N+'\n')}})()));
console.log(JSON.stringify(out));await b.close()})();

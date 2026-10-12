/* peltcheck.js — how many times does resolvePhase run, and how often is the Damnatio pelted, per turn of his? (balance pass check)
   Usage: node tools/balance100/peltcheck.js flavius-arena.html [games=20] */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
console.log(JSON.stringify(await pg.evaluate(async N=>{while(CUR_MODAL)CUR_MODAL.done(null);menuHide();const c={rp:0,turns:0,pelts:0};
  const rp=resolvePhase;resolvePhase=async function(p){if(p&&p.cls==='damnatio')c.rp++;return rp.apply(this,arguments)};
  const bt=beginTurn;beginTurn=function(){try{if(S&&S.sim&&cur()&&cur().cls==='damnatio'&&cur().alive)c.turns++}catch(e){}return bt.apply(this,arguments)};
  const lg=log;log=function(h){if(/pelts/.test(String(h)))c.pelts++;return lg.apply(this,arguments)};
  for(let i=0;i<N;i++){await simEvent({ev:'democritus',loc:6,seed:5000+i,seats:['damnatio','soldier','hero','slave'].map((x,j)=>({cls:x,cpu:true,diff:'fighter',team:'P'+(j+1)})),opts:{...CFG.opts,spect:0}},{timeoutMs:60000})}
  return c},+(process.argv[3]||20))));await b.close()})();

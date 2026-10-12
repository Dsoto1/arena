/* dev helper: evaluate an expression on the Recruiting card (step N) — node tools/plans/recruit100/probe.js flavius-arena.html N 'expr' */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>console.log('ERR',e.message));pg.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const r=await pg.evaluate(async([step,expr])=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
 newWorld({type:'custom',mgr:{name:'T',ludus:'LT',city:'Roma',color:'#c0433a',p:{...MGR_PRESETS.balanced[1]},portrait:{},diff:'normal'}});const m=me();m.fame=60;const fa=freeAgents().filter(x=>m.fame>=reqFame(x)).sort((a,b)=>effOvr(b)-effOvr(a));const g=fa[0];window.G=g;
 if(step>1){rec98Act(g,'watch');rec98Act(g,'cup');rec98Act(g,'study');}
 MGR.view=null;MGR.tab='recruit';MGR.sel=g.id;MGR.recFor=g.id;MGR.recStep=step;MGR_REDRAW();await W8(500);
 return eval(expr)},[+process.argv[3],process.argv[4]]);
console.log(JSON.stringify(r,null,1));await b.close()})();

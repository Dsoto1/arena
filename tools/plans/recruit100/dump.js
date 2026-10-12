/* dev helper: dump the Recruiting card HTML of step N (1-3) → tools/plans/recruit100/dumpN.html + curN.png
   node tools/plans/recruit100/dump.js flavius-arena.html N */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const r=await pg.evaluate(async(step)=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
 newWorld({type:'pre',key:'crispus'});const m=me();m.fame=60;const fa=freeAgents().filter(x=>m.fame>=reqFame(x)).sort((a,b)=>effOvr(b)-effOvr(a));const g=fa[0];
 if(step>1){rec98Act(g,'watch');rec98Act(g,'cup');rec98Act(g,'study');}
 MGR.view=null;MGR.tab='recruit';MGR.sel=g.id;MGR.recFor=g.id;MGR.recStep=step;MGR_REDRAW();await W8(500);
 return document.querySelector('#mgrBody').innerHTML},+process.argv[3]);
const dir=__dirname;require('fs').writeFileSync(dir+'/dump'+process.argv[3]+'.html',r);
await pg.screenshot({path:dir+'/cur'+process.argv[3]+'.png'});await b.close()})();

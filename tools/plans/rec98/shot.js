/* Recruiting III screenshots: node tools/plans/rec98/shot.js flavius-arena.html [outdir] → card1-3.png (Scout · Court · Offer), board.png, list.png, truth.png */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];
pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const out=process.argv[3]||__dirname;
await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
  newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;const w=W_(),m=me();m.coin=900;m.fame=Math.max(m.fame,60);
  const fa=freeAgents().filter(x=>m.fame>=reqFame(x)).sort((a,b)=>effOvr(b)-effOvr(a));fa.slice(0,5).forEach(g=>g.favd=true);window.FA=fa;
  if(typeof rec98Act==='function'){rec98Act(fa[0],'watch');rec98Act(fa[0],'cup');rec98Act(fa[1],'ask')}
  MGR.tab='recruit';MGR.sel=fa[0].id;MGR_REDRAW();await W8(600)});
for(const s of [1,2,3]){await pg.evaluate(async s=>{MGR.recFor=FA[0].id;MGR.recStep=s;MGR_REDRAW();await new Promise(x=>setTimeout(x,500))},s);
  const c=await pg.$('#mgrBody .mgrid > div:last-child');if(c)await c.screenshot({path:out+'/card'+s+'.png'});else await pg.screenshot({path:out+'/card'+s+'.png'});}
const el=await pg.$('#mgrBody .pipeline');if(el)await el.screenshot({path:out+'/board.png'});
const ls=await pg.$('#recTable');if(ls)await ls.screenshot({path:out+'/list.png'});
const t=await pg.evaluate(async()=>{if(typeof rec98TruthHTML!=='function')return false;const g=FA[2];rec98Act(g,'watch');rec98Act(g,'study');signGlad(g,askWage(g),8,0,false);MGR_REDRAW();await new Promise(x=>setTimeout(x,700));return true});
if(t){await pg.waitForTimeout(500);const tc=await pg.$('#signCard .sgbox');if(tc)await tc.screenshot({path:out+'/truth.png'})}
console.log('ERRS',JSON.stringify(errs));await b.close()})();

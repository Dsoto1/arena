/* v1.0 ENTER ANY EVENT (296-v100any) screenshots: node tools/plans/any100/shots.js flavius-arena.html → tools/plans/any100/*.png
   week card · team picker · restricted picker (a click shows why) · the full card after travel; 1440 and 390 px. */
const {chromium}=require('playwright');const path=require('path');const OUT=__dirname;
(async()=>{const b=await chromium.launch();
for(const W of [1440,390]){const pg=await b.newPage({viewport:{width:W,height:W>600?1500:1700}});await pg.route(/fonts\./,r=>r.abort());
  await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  await pg.goto('file://'+path.resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
  const step=async(fn,name)=>{await pg.evaluate(fn);await pg.waitForTimeout(700);await pg.screenshot({path:path.join(OUT,`any100_${name}_${W}.png`)})};
  await step(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);await W8(300);menuHide();MM.fromMenu=true;openManager();await W8(800);
    newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_(),n=w.night;w.welc99=1;
    const sp=n.bouts.filter(b=>any100Sp(b));if(!sp.some(b=>any100Team(b))){const b=sp[sp.length-1];for(const id of [...b.ents])any100Pull(w,id);b.ev='familia';any100Rivals(w,2)}
    MGR.view=null;MGR.tab='night';MGR_REDRAW();await W8(600);const el=document.querySelector('#any100wk');if(el)el.scrollIntoView({block:'start'})},'week');
  await step(()=>{const n=W_().night;const i=n.bouts.findIndex(b=>any100Sp(b)&&any100Team(b));n.bouts[i].any100.rx=null;MGR_REDRAW();any100Open(i)},'team');
  await step(()=>{any100Close();const n=W_().night;const i=n.bouts.findIndex(b=>any100Sp(b)&&!any100Team(b));n.bouts[i].any100.rx={k:'hi'};any100Open(i);
    const r=document.querySelector('#any100pk .a1fr.no');if(r)r.click()},'restricted');
  await step(async()=>{any100Close();const w=W_(),m=me();const n=w.night;const i=n.bouts.findIndex(b=>any100Sp(b)&&!any100Team(b));const g=rosterOf(m).find(g=>!any100Why(w,n.bouts[i],g));if(g)any100Book(i,g.id,null);
    const t=travelState(w);if(t&&!t.paid){m.coin+=t.cost;travelClick('travelpay')}else any100FillAll(w);MGR_REDRAW();await new Promise(r=>setTimeout(r,500));const el=document.querySelector('#any100wk');if(el)el.scrollIntoView({block:'start'})},'full');
  await pg.close()}
await b.close()})();

const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1200,height:900}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1000);await pg.click('#mClose');
await pg.evaluate(()=>{openStudio('gear')});await pg.waitForTimeout(700);
const r=await pg.evaluate(()=>{
  sculptClick({dataset:{sc:'add',k:'w',t:'star'}},()=>{});const Ls=ST.cw.art.layers;Ls[0].x=30;Ls[0].y=20;Ls[0].c='#ff5050';
  ST.cw.name='Star Fang';ST.cw.rolls={loadout:true};
  const key='cw_'+ST.cw.id;cwReg(ST.cw);
  const fig=figureSVG({...tokenForCls('soldier'),weapon:key});
  const seg=fig.split('scale(0.62)')[1]||'';
  return {inHand:fig.includes('scale(0.62)'),star:seg.includes('#ff5050'),card:cwCardSVG(ST.cw).includes('#ff5050')}});
await pg.evaluate(()=>{document.querySelector('#studio').innerHTML=studioHTML()});
await pg.waitForTimeout(300);await pg.screenshot({path:'sc_w.png'});
console.log(JSON.stringify(r),errs.slice(0,4));await b.close()})();

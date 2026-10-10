/* node tools/plans/mock100/ludus_shot.js [page#state:width[:waitms]] … — shots of ludus.html + signing.html states
   signing: node ludus_shot.js 'signing.html?still#gem:1440' 'signing.html?still#dud:1440' 'signing.html?still#fair:1440' 'signing.html#pre:1440' 'signing.html#static:1440' 'signing.html#gem:1440:1500' 'signing.html?still#gem:390' */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();
const shots=process.argv.slice(2).length?process.argv.slice(2):['ludus.html#week:1440','ludus.html#bye:1440','ludus.html#mail:1440','ludus.html#week:390','ludus.html#bye:390'];
for(const s of shots){const [pg0,w,wt]=s.split(':');const W=+w;const pg=await b.newPage({viewport:{width:W,height:W<600?844:900},deviceScaleFactor:W<600?2:1});
 const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+path.resolve(__dirname,pg0.split('#')[0])+'#'+(pg0.split('#')[1]||''));await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(+(wt||500));
 const name=pg0.replace('.html','').replace('?still','').replace('#','_')+'_'+W+(wt?'_t'+wt:'')+'.png';await pg.screenshot({path:path.join(__dirname,name)});
 if(W<600)await pg.screenshot({path:path.join(__dirname,name.replace('.png','_full.png')),fullPage:true});
 console.log(name,errs);await pg.close()}
await b.close()})();

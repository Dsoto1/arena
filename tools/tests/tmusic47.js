const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext();const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1200);
const r=await pg.evaluate(()=>{const out={};const hl=HEADLESS;try{window.HEADLESS=false}catch(e){}audInit();if(!AUD.ctx)return 'noctx';
  for(const n of ['Roma','Capua','Finale','Manager','Annals','Superbus','Special']){const th=audTheme(n);let err=null;try{for(let s=0;s<260;s+=1)audStep(th,AUD.ctx.currentTime+s*0.01,s,s%3)}catch(e){err=e.message}out[n]=err||('ok br '+th.brProg.join(''))}
  out.list=(audListHTML().match(/trackrow/g)||[]).length;out.extra=AUD_EXTRA.length;return out});
console.log(JSON.stringify(r,null,1));console.log(errs.slice(0,3));await b.close()})();

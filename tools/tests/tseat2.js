const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1400,height:950},deviceScaleFactor:2});const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(async()=>{await quickLanista();$('#modal').hidden=true});
await pg.evaluate(()=>{startEvent({ev:'democritus',loc:6,seats:['soldier','hero','slave','royalty'].map(c=>({cls:c,cpu:true})),opts:{spect:'auto'}});SPEED='pause'});await pg.waitForTimeout(2500);
await pg.evaluate(()=>{buyTicket()});await pg.waitForTimeout(1200);await pg.screenshot({path:'seat2.png'});
console.log(errs.slice(0,3));await b.close()})();

const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const pg=await b.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
await pg.evaluate(()=>{startEvent({ev:'democritus',loc:6,seats:['soldier','hero','slave','royalty'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});SPEED='pause';audUnlock();audTick()});
await pg.waitForTimeout(2500);const a=await pg.evaluate(()=>({loc:AUD.loc,fin:audFinalOn(),state:AUD.ctx&&AUD.ctx.state}));
await pg.evaluate(()=>{S.ri=EV().rounds.length-1});await pg.waitForTimeout(3500);
const b2=await pg.evaluate(()=>({dbg:[S.evKey,S.ri,EV().rounds.length,audLive(),S.phase,S.over],loc:AUD.loc,fin:audFinalOn(),step:AUD.step,playing:AUD.playing}));await pg.waitForTimeout(3000);const b3=await pg.evaluate(()=>AUD.step);
console.log(JSON.stringify({a,b2,b3}),errs.slice(0,3));await b.close()})();

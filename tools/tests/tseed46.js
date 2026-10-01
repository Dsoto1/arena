const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:900}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1500);
const run=async(opts)=>{await pg.evaluate((o)=>{if(CUR_MODAL)CUR_MODAL.done(null);SPEED='fast';
  const seats=[{cls:'slave',cpu:true,diff:'normal',name:'A'},{cls:'soldier',cpu:true,diff:'normal',name:'B'},{cls:'royalty',cpu:true,diff:'hard',name:'C'},{cls:'hero',cpu:true,diff:'easy',name:'D'}];
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:o.spect},seed:o.seed})},opts);
  await pg.waitForTimeout(1500);await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:1)});
  await pg.evaluate(()=>simToEnd(true));for(let i=0;i<120;i++){if(await pg.evaluate(()=>!!(S.over&&S.result)))break;await pg.waitForTimeout(500)}
  const r=await pg.evaluate(()=>({seed:S.seed,turns:S.turnNo,rot:S.rotation,win:(S.result&&S.result.winners||[]).map(w=>S.players[w]?S.players[w].name:w),cf:S.players.map(p=>p.cf),hp:S.players.map(p=>Object.values(p.hp).join('')),alive:S.players.map(p=>p.alive),log:(S.logLines||[]).filter(x=>x.turn>0).map(x=>x.text)}));
  await pg.evaluate(()=>{while(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:'close')});await pg.waitForTimeout(800);return r};
const a=await run({spect:0,seed:12345}),b2=await run({spect:0,seed:12345});
const c=await run({spect:'auto',seed:777}),d=await run({spect:'auto',seed:777});
console.log('spect',await pg.evaluate(()=>S.spect.length));
{const L1=a.log,L2=b2.log;let i=0;while(i<L1.length&&L1[i]===L2[i])i++;console.log('NC diverge at',i,L1.length,'\nA:',L1.slice(Math.max(0,i-2),i+3).join('\n   '),'\nB:',L2.slice(Math.max(0,i-2),i+3).join('\n   '));}
const L1=c.log,L2=d.log;let i=0;while(i<L1.length&&L1[i]===L2[i])i++;console.log('diverge at',i,'\nA:',L1.slice(Math.max(0,i-3),i+2).join('\n   '),'\nB:',L2.slice(Math.max(0,i-3),i+2).join('\n   '));console.log('with crowd same:',JSON.stringify(c)===JSON.stringify(d));
console.log(errs.slice(0,3));await b.close()})();


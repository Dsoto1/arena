const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:900}});const pg=await ctx.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1500);
const o={};
// 1: pairStart via cfg.pairs in a classic event (Androcles: slave + lion, handler)
await pg.evaluate(()=>{const seats=[{cls:'slave',cpu:true,diff:'normal',name:'A'},{cls:'soldier',cpu:true,diff:'normal',name:'B'},{cls:'royalty',cpu:true,diff:'normal',name:'C'},{cls:'hero',cpu:true,diff:'normal',name:'D'}];
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:0},pairs:['sys_androcles','sys_dioscuri']})});
await pg.waitForTimeout(4000);
o.start=await pg.evaluate(()=>({lions:S.npcs.filter(n=>n.t==='lion').map(n=>({name:n.name,tamedBy:n.tamedBy})),log:(S.log||[]).map(x=>x.t||x.msg||x).filter(x=>String(x).includes('🤝')).map(x=>String(x).slice(0,160))}));
// 2: the card: register a custom pairing (pack of 2 wolves) and play it
o.card=await pg.evaluate(async()=>{CUSTOM.pairings=[{id:'pxT',name:'Test Pack',type:'pack',members:['npc:wolf','npc:bear'],deck:true}];pairRegister();CFG.roster='rolls';ROSTER_ACTIVE=null;const n0=S.npcs.length;
  const p=S.players[1];await pairCardPlay(p,'pair_pxT');return {added:S.npcs.length-n0,deck:pairDeckCards({}),html:cardHTML('c:pair_pxT','sm').includes('data:image')}});
// 3: manager special with pairs builds heats with pairing characters
o.spec=await pg.evaluate(()=>{CUSTOM.specials=[{...sxBlank(),id:'sxT',pairs:['sys_dioscuri'],format:'bracket2'}];const D=specDef('cs:sxT');return {stages:D.stages,pairs:D.pairs,pick:Array.from({length:30},()=>specPickSid()).filter(x=>x.startsWith('cs:')).length}});
console.log(JSON.stringify(o,null,1));console.log('ERRS',errs.slice(0,5));await b.close()})();

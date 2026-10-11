/* v1.0 tame bonds: the Meat Lure breaks a bond (not on Commodus / custom humanoids), the Ursa/Brutum card breaks a tamed bear's bond (not a lion's); log line; seeded replay stable. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const run=()=>pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();SPEED='fast';
  startEvent({ev:'democritus',loc:6,seats:[{cls:'venatore',cpu:true},{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  await new Promise(r=>setTimeout(r,800));for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,80))}
  const x={};const P=S.players;const me=P[0],o=P[1];
  const add=(t,name,r,c)=>{const n=mkNPC(t,name,r,c);S.npcs.push(n);return n};
  const lion=add('lion','TestLion',2,2),bear=S.npcs.find(n=>n.key==='Ursa')||add('bear','Ursa',2,4),bear2=S.npcs.find(n=>n.key==='Brutum')||add('bear','Brutum',2,6),com=add('commodus','Commodus',4,2);
  CUSTOM.npcs.push({id:'h100',name:'Giantus',kind:'Giant',kindKey:'giant',glyph:'G',color:'#888',hp:10,ap:3,rng:1,mv:2,coin:5,cf:3,beh:'zone',tameable:true,states:true});
  NPCT.cn_h100=npcType(CUSTOM.npcs[CUSTOM.npcs.length-1]);const hum=add('cn_h100','Giantus',4,4);
  lion.tamedBy=o.id;x.okLion=lureOK100(lion);x.okCom=lureOK100(com);x.okHum=lureOK100(hum);x.okZora=lureOK100({alive:true,t:'zora'});x.okTholo=lureOK100({alive:true,t:'tholo'});
  me.cpu=true;me.r=3;me.c=3;P[2].r=3;P[2].c=4;
  me.items.push({kind:'card',key:'lure',id:'lure100'});
  await useItem(me,me.items.find(i=>i.key==='lure'));
  x.lureBreaks=lion.tamedBy==null&&lion.aggro!=null;
  bear.tamedBy=o.id;lion.tamedBy=o.id;lion.aggro=null;
  S.deck.push('ursa');await drawArena(me);
  x.bearBroken=bear.tamedBy==null&&bear.aggro===me.id;x.lionKept=lion.tamedBy===o.id;
  S.deck.push('brutum');await drawArena(me);x.lionKeptB=lion.tamedBy===o.id&&bear2.aggro===me.id;
  x.logLine=/breaks free of/.test(document.getElementById('log').innerText);
  return x});
const a=await run();const c=await run();
ok(a.okLion,'lure ok lion');ok(!a.okCom,'lure refused Commodus');ok(!a.okHum,'lure refused custom humanoid');ok(!a.okZora,'zora');ok(a.okTholo,'tholo kept');
ok(a.lureBreaks,'lure breaks bond');ok(a.bearBroken,'ursa breaks bear bond');ok(a.lionKept&&a.lionKeptB,'lion keeps bond');ok(a.logLine,'log line');
ok(JSON.stringify(a)===JSON.stringify(c),'replay stable (same run twice)');
console.log(JSON.stringify(a));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

/* v0.60 (2): the Tame card shows the Lyre face; tamed beasts carry no aggro and draw no instant counter (a wild one aggros the owner; a tamed one waits for its owner); a CF offering from a toppled pillar lands 3 tiles out and pays on pickup; truce offers name the class; truced tokens are marked */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1800);
const o={};const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
o.r=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();SPEED='fast';
  startEvent({ev:'democritus',loc:6,seats:[{cls:'venatore'},{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  await new Promise(r=>setTimeout(r,1500));for(let i=0;i<10&&CUR_MODAL;i++){CUR_MODAL.done(null);await new Promise(r=>setTimeout(r,80))}
  const x={};const P=S.players;x.tameArt=!!cardRef('c:tame')&&CARDS.tame.img===CARDS.lyre.img&&/cimg/.test(cardHTML('c:tame','xs'));
  /* two beasts side by side: one tamed by P0, one wild; one tamed by P1 */
  const [a,w,t]=S.npcs.filter(n=>n.alive&&tameable(n)).slice(0,3);if(!a||!w||!t)return {err:'no beasts'};
  a.tamedBy=P[0].id;a.aggro=P[2].id;t.tamedBy=P[1].id;w.aggro=null;
  a.r=5;a.c=5;w.r=5;w.c=6;t.r=6;t.c=5;
  const ahp=a.hp;await tamedAttack(a,P[0],{kind:'npc',ref:w});x.wildAggro=w.alive?w.aggro===P[0].id:true;x.noCounter=a.hp===ahp;
  const ahp2=a.hp;await tamedAttack(a,P[0],{kind:'npc',ref:t});x.tamedNoCounter=a.hp===ahp2;x.hitBy=!t.alive||!!(t.hitBy&&t.hitBy.npc===a.id);
  setAggro(a,P[3],'push');x.tamedNoAggro=a.aggro===P[2].id||a.aggro==null;
  /* CF offering from a toppled pillar */
  const pl=S.pillars.find(q=>q.pots.length);const p=P[0];if(pl){pl.pots=['cf2'];p.r=pl.r;p.c=pl.c-1;const land=[pl.r,pl.c+3];S.players.forEach(q=>{if(q!==p&&q.r===land[0]&&q.c===land[1])q.r=0});
    const cf0=p.cf;await breakPot(pl,p,land,true);x.cfLanded=S.floor.some(f=>f.kind==='offer'&&f.key==='cf2'&&f.r===land[0]&&f.c===land[1]);x.cfNotYet=p.cf===cf0+1;
    p.r=land[0];p.c=land[1];await pickupAt(land[0],land[1]);x.cfPaid=p.cf===cf0+3}
  x.trWho=/trcls/.test(truceWho(P[1]))&&truceWho(P[1]).includes(CLASSES.hero.name);
  S.truces.add(truceKey(P[0].id,P[1].id));S.cur=0;draw();x.drawOk=true;
  return x});
const r=o.r;ok(r.tameArt,'tame art');ok(r.wildAggro&&r.noCounter,'tamed vs wild');ok(r.tamedNoCounter&&r.hitBy,'tamed vs tamed');ok(r.tamedNoAggro,'tamed no aggro');
ok(r.cfLanded&&r.cfNotYet&&r.cfPaid,'CF falls');ok(r.trWho&&r.drawOk,'truce');
console.log(JSON.stringify(o));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

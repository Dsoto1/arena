/* v0.91 take the chest from Zora (201-v91zora): your Zora carrying the Arena Chest next to you → the button appears, the chest passes to
   you (carried, −1 movement), Open Arena Chest is offered with a key; not offered for someone else's Zora or when he is two tiles away. */
const {chromium}=require('playwright');const path=require('path');const page=path.resolve(process.argv[2]||'flavius-arena.html');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:90000});
const r=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
  for(let i=0;i<120;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&cur()===S.players[0]&&S.phase==='choice'&&!S.busy){const c=document.querySelector('[data-act="coin"]');if(c)c.click()}else if(S&&S.phase==='action'&&cur()===S.players[0]&&!S.busy)break}
  SPEED='pause';const p=S.players[0];const o={phase:S.phase,cur:cur()===p};
  let z=S.npcs.find(n=>n.t==='zora'&&n.tamedBy===p.id);if(!z){spawnZora(p);z=S.npcs.find(n=>n.t==='zora'&&n.tamedBy===p.id)}
  const adj=adjTiles(p).find(([r,c])=>!pillarAt(r,c)&&!unitAt(r,c));z.r=adj[0];z.c=adj[1];S.chest.held=z.id;z.carry={kind:'chest',label:'the Arena Chest'};p.keys=Math.max(1,p.keys);const mv0=p.mv;
  render();await W8(100);o.btn=!!document.querySelector('[data-act91="zorachest"]');o.dbg={busy:S.busy,ph:S.phase,acts:!!document.querySelector('#actions .acts'),z:zoraChest91(p)?1:0,cheb:cheb(z,p),cpu:p.cpu,onl:!!S.onl};if(!o.btn)return o;
  document.querySelector('[data-act91="zorachest"]').click();await W8(400);render();await W8(100);
  o.carrying=p.carrying===true&&S.chest.held==='p'+p.id&&!z.carry;o.mv=p.mv===Math.max(0,mv0-1);o.open=!!document.querySelector('[data-act="chest"]');
  /* not when he is two tiles away */
  p.carrying=false;S.chest.held=z.id;z.carry={kind:'chest',label:'the Arena Chest'};const far=S.players[0];z.r=-99;z.c=-99;render();await W8(100);o.farNo=!document.querySelector('[data-act91="zorachest"]');
  return o});
console.log(JSON.stringify(r));
ok(r.btn,'1 the button appears next to your Zora');ok(r.carrying,'2 the chest passes to you');ok(r.mv,'3 −1 movement while held');ok(r.open,'4 Open Arena Chest is offered');ok(r.farNo,'5 not offered when he is not next to you');
console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

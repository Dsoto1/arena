/* v0.87 beasts in the Field tab: clicking a row opens THAT beast (also after one is slain and moves to the bottom);
   a beast drawn from the arena deck keeps its card in the top row while it lives (gone when slain);
   a starting beast has no card: token face left, stats right. SHOTS=dir saves npc87_*.png. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};const shots=process.env.SHOTS||'';
const o=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:true},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});await W8(500);SPEED='pause';
  const r={};const alive=()=>S.npcs.filter(n=>n.alive);r.n0=alive().length;
  /* slay the first beast: it moves to the Slain list at the bottom */
  const first=S.npcs.find(n=>n.alive);first.alive=false;first.hp=0;
  /* Leo from the arena deck */
  const shut=async t=>{for(let i=0;i<t/100;i++){if(CUR_MODAL)CUR_MODAL.done(null);document.querySelectorAll('#bs82pop,.bs82').forEach(x=>x.remove());await W8(100)}};
  await shut(600);S.phase='action';const pr=resolveDrawn(S.players[0],'spawnLeo');await Promise.race([pr,shut(4000)]);await shut(300);
  const leo=S.npcs.find(n=>n.name==='Leo');r.leo=!!leo;r.card=leo&&leo.card87;
  try{SIDE.tab='field'}catch(e){}render();try{sideApply()}catch(e){}await W8(200);
  const P=document.getElementById('npcPanel');
  /* every row: its id → the beast it names */
  r.rows=[...P.querySelectorAll('.npcrow[data-nc82]')].map(el=>{const n=S.npcs.find(x=>String(x.id)===el.dataset.nc82);return !!n&&el.textContent.includes(n.name)});
  /* click the row right under the top: its card is that beast */
  const rows=[...P.querySelectorAll('.npcrow[data-nc82]')];const pick=rows[1]||rows[0];const want=S.npcs.find(x=>String(x.id)===pick.dataset.nc82);
  pick.click();await W8(300);const pop=document.getElementById('nc82pop');r.pop=!!pop;r.popName=pop?pop.textContent.toUpperCase().includes(want.name.toUpperCase()):false;if(pop)pop.remove();
  r.top=!!P.querySelector('.actcards .ac87[data-nc82="'+(leo&&leo.id)+'"]');
  const ac=P.querySelector('.actcards .ac87');if(ac){ac.click();await W8(300);const p2=document.getElementById('nc82pop');r.acPop=!!p2&&!!p2.querySelector('img[src*="npccard82_leo"]');if(p2)p2.remove()}
  /* back of a starting beast: token round */
  const st=S.npcs.find(n=>n.alive&&n.name!=='Leo');nc82Open(st.t,st.key,st.name);await W8(300);const p3=document.getElementById('nc82pop');
  r.tok=!!(p3&&p3.querySelector('.ns87 .ns87tok .rtok')&&p3.querySelector('.ns87 .ns87t'));r.noFront=!!p3&&!p3.querySelector('.nc82c');
  return r});
ok(o.leo&&o.card==='spawnLeo','Leo marked with his card '+JSON.stringify(o));
ok(o.rows.length&&o.rows.every(Boolean),'every row names its beast '+JSON.stringify(o.rows));
ok(o.pop&&o.popName,'clicked row opens that beast');
ok(o.top&&o.acPop,'Leo card in the top row, opens Leo');
ok(o.tok&&o.noFront,'starting beast: token + stats popup, no card');
if(shots){await pg.waitForTimeout(900);const e=await pg.$('#nc82pop .ns87');if(e)await e.screenshot({path:shots+'/npc87_back.png'});
  await pg.evaluate(()=>{const p=document.getElementById('nc82pop');if(p)p.remove()});const f=await pg.$('#npcPanel');if(f)await f.screenshot({path:shots+'/npc87_field.png'})}
/* Leo slain → his card leaves the top row */
const gone=await pg.evaluate(async()=>{const leo=S.npcs.find(n=>n.name==='Leo');leo.alive=false;leo.hp=0;render();await new Promise(r=>setTimeout(r,200));return !document.querySelector('#npcPanel .ac87')});
ok(gone,'card leaves when its beast is slain');
console.log(JSON.stringify({miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

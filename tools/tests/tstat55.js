/* v0.55 Studio: rating sliders share a 375 pool; a saved character walks out with its ratings; classes pick allies, not stat abilities */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:1000}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2500);
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);await loadCustoms();openStudio('chars')});await pg.waitForTimeout(1200);
const o={};
o.sliders=await pg.evaluate(()=>document.querySelectorAll('[data-stat]').length);
o.pool=await pg.evaluate(async()=>{const c=ST.draft;c.sandbox=false;c.stats={spd:70,str:70,int:70,lck:70,cha:70};
  const s=document.querySelector('[data-stat="spd"]');s.value=99;s.dispatchEvent(new Event('input',{bubbles:true}));const st={...c.stats};
  return {spd:st.spd,sum:statSum(st),sumTxt:document.getElementById('stStatSum').textContent.slice(0,12)}});
o.save=await pg.evaluate(async()=>{const c=ST.draft;c.name='Rated Test';c.stats={spd:96,str:76,int:60,lck:68,cha:75};const d=await stSaveDraft();return d?{id:d.id,st:d.stats}:'nosave'});
o.walk=await pg.evaluate(()=>{const c=CUSTOM.chars.find(x=>x.name==='Rated Test');if(!c)return 'nochar';if(CUR_MODAL)CUR_MODAL.done(null);
  startEvent({ev:'democritus',loc:6,seats:[{cls:'cc_'+c.id,cpu:true},{cls:'hero',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});const p=S.players[0];S.over=true;return {st:p.st,diff:p.diff,ab:CLASSES['cc_'+c.id].ab}});
o.cls=await pg.evaluate(async()=>{openStudio('classes');await new Promise(r=>setTimeout(r,800));const opts=[...document.querySelectorAll('select[data-f="abil"] option')].map(x=>x.value);
  ST.draft.abil='zora';ST.draft.ally='wolf';return {opts,noStat:!opts.some(v=>['mv','dmg','coin','cf','vet'].includes(v)),ally:allyOpts().some(([k])=>k==='wolf')}});
o.ally=await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);CLASSES.slave.ally=undefined;const C=CLASSES.venatore;C.ally='wolf';startEvent({ev:'democritus',loc:6,seats:[{cls:'venatore',cpu:false},{cls:'hero',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  const p=S.players[0];p.r=6;p.c=6;const n0=S.npcs.length;const ok=spawnZora(p);const z=S.npcs[S.npcs.length-1];delete C.ally;S.over=true;return {allyT:p.allyT,ok,t:z&&z.t,tamed:z&&z.tamedBy===p.id,added:S.npcs.length-n0}});
await pg.screenshot({path:'stat55.png'});
console.log(JSON.stringify(o));console.log('ERRS',errs.slice(0,4));await b.close()})();

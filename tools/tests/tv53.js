const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:950}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});const fails=[];const ok=(c,m)=>{if(!c)fails.push(m)};
await pg.evaluate(()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=false;POPPED.add('firstTurn');SPEED='fast';
  const seats=[{cls:'slave',cpu:true,diff:'easy',name:'A'},{cls:'soldier',cpu:false,name:'Me'},{cls:'amazonia',cpu:true,diff:'easy',name:'C'}].map(s=>({...s,pers:finalPers(s)}));
  startEvent({ev:'democritus',loc:6,seats,opts:{...CFG.opts,spect:'auto'}});});
for(let i=0;i<60;i++){const st=await pg.evaluate(()=>({hum:humanTurn(),ph:S.phase,busy:S.busy,modal:!document.getElementById('modal').hidden}));
 if(st.modal){await pg.evaluate(()=>{const b=document.querySelector('#mBtns button');b&&b.click()})}
 if(st.hum&&st.ph==='choice'&&!st.busy){await pg.evaluate(()=>takeChoice(cur(),'coin'));}
 if(st.hum&&st.ph==='action'&&!st.busy&&!st.modal)break;await pg.waitForTimeout(300)}
const a=await pg.evaluate(()=>{const me=S.players.find(p=>!p.cpu);const o={};
  o.speed=document.querySelector('#speedTray .lbl').textContent;o.cap=SETTINGS.capFeed;o.ti=!!document.querySelector('#turnInd.slim .phtag')&&!!document.querySelector('#turnInd .qi');
  o.zoom=!document.getElementById('btnZoom').hidden;o.tog=document.getElementById('ctTog').textContent;
  /* unique armor: nothing worn is in the market */
  const worn=new Set();for(const p of S.players)for(const l of LOCS)for(const pc of p.pieces[l])if(ARM[pc.key]&&!ARM[pc.key].stack)worn.add(pc.key);
  const mk=[1,2,3].flatMap(lv=>[...S.market.a[lv].slots,...S.market.a[lv].deck]).filter(Boolean);o.clash=[...worn].filter(k=>mk.includes(k));
  const all=[];for(const p of S.players)for(const l of LOCS)for(const pc of p.pieces[l])if(ARM[pc.key]&&!ARM[pc.key].stack)all.push(p.id+':'+pc.key);
  const keys=all.map(x=>x.split(':')[1]);o.dupWorn=keys.filter((k,i)=>keys.indexOf(k)!==i&&all[keys.indexOf(k)].split(':')[0]!==all[i].split(':')[0]);
  /* attack disabled with no targets */
  const far=[0,0];me.r=0;me.c=12;render();o.atkDisabled=[...document.querySelectorAll('#actions [data-act^="m-atk"]')].every(b=>b.disabled||b.classList.contains('on'));
  o.focusDis=(document.querySelector('#actions [data-act="focus"]')||{disabled:true}).disabled;
  return o});
ok(a.speed==='Speed','speed label');ok(a.cap===false,'capFeed off');ok(a.ti,'turn ind slim');ok(a.zoom,'zoom visible');ok(a.tog==='‹','drawer handle');ok(!a.clash.length,'worn in market '+a.clash);ok(!a.dupWorn.length,'dup worn '+a.dupWorn);ok(a.atkDisabled,'attack disabled');ok(a.focusDis,'focus disabled');
/* focus dice modal */
const f=await pg.evaluate(async()=>{const me=S.players.find(p=>!p.cpu),q=S.players.find(p=>p.cpu);const pr=chooseLocation(me,q,'roll',3);await new Promise(r=>setTimeout(r,300));const rolling=document.querySelectorAll('.focdie2.rolling').length;
  await new Promise(r=>setTimeout(r,1700));const d=document.querySelector('.focdie2:not(.rolling)');d.click();const loc=await pr;return {rolling,loc}});
ok(f.rolling===3&&LOCS_OK(f.loc),'focus dice '+JSON.stringify(f));
function LOCS_OK(l){return ['head','chest','larm','rarm','rleg','lleg'].includes(l)}
const s=await pg.evaluate(()=>{const q={hp:{head:5,chest:6,larm:5,rarm:0,rleg:5,lleg:5},ap:{head:4,chest:2,larm:0,rarm:0,rleg:0,lleg:0}};return [bestLocation(q,['head','larm','rleg'],3),bestLocation(q,['rleg','lleg','head'],3),locationScore({hp:{head:5,chest:6,larm:5,rarm:5,rleg:5,lleg:5},ap:{head:0,chest:0,larm:0,rarm:0,rleg:0,lleg:0}},'rleg',3)>30]});
ok(s[0]==='larm'&&s[1]==='head'&&s[2],'focus best '+s);
const k=await pg.evaluate(()=>{const l=classLoadout('ccp:murmillo');return {R:l.R,n:CLASS_PRESETS.length,gl:typeof glossaryHTML==='function'&&glossaryHTML().length>500}});ok(k.R==='mace'&&k.n===8&&k.gl,'presets/glossary');
console.log(JSON.stringify({fails,a}));console.log('ERRS',errs.slice(0,4));await b.close();process.exit(fails.length||errs.length?1:0)})();

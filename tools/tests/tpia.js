const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:500}});await pg.route(/fonts\./,r=>r.abort());
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(3500);
await pg.evaluate(async()=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);const keys=['damnatio'].map(piaKeyFor);CLASSES.cc_t={...CLASSES.soldier,custom:true,name:'Sir Longname Maximus',color:'#26dfa4',clsRef:'ccl:zz'};CUSTOM.classes=[{id:'zz',name:'Bestiarius Maximus',color:'#26dfa4'}];keys.push(piaKeyFor('ccl_zz'));
 const d=document.createElement('div');d.style.cssText='position:fixed;left:0;top:0;z-index:9999;background:#222;padding:10px;display:flex;gap:8px';d.innerHTML=keys.map(k=>cardHTML('c:'+k,'lg')).join('')+cardHTML('c:pia_royalty','lg');document.body.appendChild(d)});
await pg.waitForTimeout(500);await pg.screenshot({path:'pia2.png'});
const o=await pg.evaluate(()=>{newState({ev:'democritus',loc:6,seats:[{cls:'soldier',cpu:true},{cls:'damnatio',cpu:true},{cls:'hero',cpu:true},{cls:'slave',cpu:true}],opts:{}});return S.deck.filter(k=>CARDS[k]&&CARDS[k].cls)});console.log(JSON.stringify(o));await b.close()})();

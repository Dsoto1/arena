const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2200);
await pg.evaluate(()=>{menuHide();startEvent({ev:'democritus',loc:6,seats:[{cls:'slave',cpu:false,diff:'normal'},{cls:'soldier',cpu:true,diff:'normal'},{cls:'venatore',cpu:true,diff:'normal'},{cls:'hero',cpu:true,diff:'normal'}],opts:{spect:24}})});
for(let k=0;k<8;k++){await pg.waitForTimeout(600);await pg.evaluate(()=>{const b=[...document.querySelectorAll('#mBtns button')].find(x=>/To the sand|Got it/.test(x.textContent));if(b)b.click()})}
await pg.evaluate(()=>{SPEED='pause'});
const o={};o.sp=await pg.evaluate(()=>S.spect.length);
await pg.evaluate(async()=>{const p=S.players[0];const n=S.npcs.find(x=>x.alive);STUCK.push({kind:'arrow',ref:n,loc:'chest',ang:0.4,t0:performance.now(),life:30000});STUCK.push({kind:'spear',ref:S.players[1],loc:'rarm',ang:-0.6,t0:performance.now(),life:30000});STUCK.push({kind:'bolt',r:6,c:6,dx:0,dy:-0.08,ang:1.4,t0:performance.now(),life:30000});
  projectile('spear',()=>scr(p,0.6),()=>scr(n,0.45),{arc:0.3,dur:3000});const s=S.spect.find(x=>!x.gone&&x._x!=null);if(s){s._x=s._x;const q=quadOf(p);await doSpear(p,s)}const s2=S.spect.find(x=>!x.gone&&x._x!=null);if(s2)spectStone(s2,S.players[2])});
await pg.waitForTimeout(700);await pg.screenshot({path:'shot_anim1.png',clip:{x:0,y:90,width:1000,height:680}});
await pg.waitForTimeout(3600);await pg.screenshot({path:'shot_anim2.png',clip:{x:0,y:90,width:1000,height:680}});
o.c=await pg.evaluate(()=>({corpses:CORPSES.length,crew:!!(CORPSES[0]&&CORPSES[0].crew),stuck:STUCK.length}));
await pg.waitForTimeout(6000);o.c2=await pg.evaluate(()=>({corpses:CORPSES.length}));
console.log(JSON.stringify(o));console.log('ERRS',errs.slice(0,4));await b.close()})();

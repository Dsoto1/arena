const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:950}});await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n').slice(1,3).join(' ')));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(2500);
const o={};o.menu=await pg.evaluate(()=>!!document.querySelector('#mainMenu [data-mm="multi"]'));
await pg.click('#mainMenu [data-mm="multi"]');await pg.waitForTimeout(300);
o.sub=await pg.evaluate(()=>[...document.querySelectorAll('#mmMulti button')].map(b=>b.textContent.slice(0,14)+(b.disabled?'(off)':'')));
await pg.screenshot({path:'shot_mm49.png'});
await pg.click('#mainMenu [data-mm="hotseat"]');await pg.waitForTimeout(2500);
o.setup=await pg.evaluate(()=>({banner:!!document.querySelector('.hsbanner'),names:document.querySelectorAll('[data-hsn]').length,player:[...document.querySelectorAll('select[id^=cpu] option:checked')].map(x=>x.textContent).join(','),ev:CFG.ev,loc:CFG.loc}));
const ins=await pg.$$('[data-hsn]');const nm=['Marcus','Livia','Tiro'];for(let i=0;i<3;i++){await ins[i].fill(nm[i])}
await pg.evaluate(()=>{const s=document.getElementById('cpu3');s.value='1';s.dispatchEvent(new Event('change',{bubbles:true}))});await pg.waitForTimeout(300);
await pg.screenshot({path:'shot_hs49.png'});
await pg.click("#goBtn");for(let k=0;k<30;k++){await pg.evaluate(()=>{const b=[...document.querySelectorAll("#mBtns button")].find(x=>/To the sand|Continue|OK/.test(x.textContent));if(b)b.click()});await pg.waitForTimeout(1000);const bn=await pg.evaluate(()=>{const e=document.getElementById("hsTurn");return e?e.textContent:null});if(bn)break}
o.live=await pg.evaluate(()=>({hs:S.hotseat&&S.hotseat.players.map(p=>p.name),pl:S.players.map(p=>p.name+(p.cpu?'(cpu)':'')+(p.pid?'*':'')),prof:HS_PROFILES.map(p=>p.name)}));
o.purse=await pg.evaluate(async()=>{const p=await getPurse();await setPurse({...p,coin:p.coin-5});const a=hsActive();return {name:p.name,coin:p.coin,after:a.coin}});
o.banner=await pg.evaluate(()=>{const e=document.getElementById('hsTurn');return e?e.textContent:null});
await pg.screenshot({path:'shot_hslive49.png'});
o.after=await pg.evaluate(async()=>{const rows=S.players.map((p,i)=>({p,won:i===0,f:i===0?35:12}));await hsAfterEvent(rows);return HS_PROFILES.map(p=>p.name+':'+p.events+'/'+p.wins+'/'+p.coin+'/'+Object.keys(p.honors).join('+'))});
console.log(JSON.stringify(o,null,0));console.log('ERRS',errs.slice(0,5));await b.close()})();

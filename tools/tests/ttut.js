const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1400,height:950}});
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});try{localStorage.setItem('flavius_firstrun','shown')}catch(e){}});
const pg=await ctx.newPage();await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(1500);
await pg.click('[data-mm82="tut"]');await pg.waitForTimeout(200);await pg.click('[data-mm="learn"]');
// wait for the human's choice phase
for(let i=0;i<60;i++){const ok=await pg.evaluate(()=>S&&S.phase==='choice'&&humanTurn());if(ok)break;await pg.waitForTimeout(500)}
await pg.waitForTimeout(800);
const a=await pg.evaluate(()=>({tut:TUT.on,step:TUT.step,coach:!!document.getElementById('tutCoach'),glow:[...document.querySelectorAll('.sugglow')].map(x=>x.dataset.act),npcs:S.npcs.map(n=>n.t),n:S.players.length,phase:S.phase}));
await pg.screenshot({path:'tut_a.png'});
// click Next on hello
console.log(JSON.stringify(a));await pg.evaluate(()=>{const b=document.querySelector('[data-tut="next"]');b&&b.click()});await pg.waitForTimeout(300);
console.log(await pg.evaluate(()=>({S:!!S,phase:S&&S.phase,cur:S&&cur()&&cur().name,cpu:S&&cur()&&cur().cpu,modal:!document.getElementById("modal").hidden,mt:document.getElementById("mTitle")&&document.getElementById("mTitle").textContent,acts:[...document.querySelectorAll("#actions [data-act]")].map(x=>x.dataset.act)})));
await pg.click('#actions [data-act="coin"]');await pg.waitForTimeout(1500);
const b1=await pg.evaluate(()=>({step:TUT.step,glow:[...document.querySelectorAll('.sugglow')].map(x=>x.dataset.act),sug:S.sugTile,mode:S.mode,phase:S.phase}));
await pg.screenshot({path:'tut_b.png'});
// context menu on the suggested tile
const box=await pg.evaluate(()=>{const t=S.sugTile;if(!t)return null;const r=cv.getBoundingClientRect();const m=center(t.r,t.c);const sx=r.width/cv.width;return {x:r.left+m.x*sx,y:r.top+m.y*(r.height/cv.height)}});
let cm=null;if(box){await pg.mouse.click(box.x,box.y,{button:'right'});await pg.waitForTimeout(300);cm=await pg.evaluate(()=>{const m=document.getElementById('ctxMenu');return m?[...m.querySelectorAll('button')].map(b=>b.textContent):null});await pg.screenshot({path:'tut_c.png'});
  await pg.evaluate(()=>{const b=[...document.querySelectorAll('#ctxMenu button')].find(b=>/Move here/.test(b.textContent));b&&b.click()});await pg.waitForTimeout(2500)}
const c=await pg.evaluate(()=>({step:TUT.step,pos:[TUT.p.r,TUT.p.c],glow:[...document.querySelectorAll('.sugglow')].map(x=>x.dataset.act),sug:S.sugTile,dock:(document.getElementById('hintDock')||{}).textContent?.slice(0,160)}));
await pg.screenshot({path:'tut_d.png'});
console.log(JSON.stringify({a,b1,cm,c}),errs.slice(0,5));
await b.close()})();

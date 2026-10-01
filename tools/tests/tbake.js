const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:700}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
// a new character, sculpted through the studio's own token designer, then baked
await pg.evaluate(()=>{openStudio('tokens')});await pg.waitForTimeout(900);
const html=await pg.evaluate(async()=>{
  const base={...tokenForCls('soldier'),c1:'#3f6fb4'};
  // what the designer's commit produces: shapes moved into sp.baked
  base.baked=[{t:'star',x:50,y:44,w:16,h:16,c:'#f0cf7d'}, /* a crest on the helm (head area) */
              {t:'ellipse',x:70,y:92,w:12,h:8,c:'#c0433a'}, /* a pauldron on the right arm */
              {t:'rect',x:43,y:140,w:8,h:10,c:'#e6b93a'}]; /* a greave on the left leg */
  const st=[['whole',{}],['−1 arm (right)',{rarm:1}],['legless',{rleg:1,lleg:1}],['the last stand',{rleg:1,lleg:1,larm:1}]];
  const tholo=tokenForNPC({t:'tholo'});
  return st.map(([l,sv])=>`<div style="display:inline-block;text-align:center;margin:0 10px;color:#eee;font:14px sans-serif">${figureHTML({...base,sev:sv},300)}<br>${l}</div>`).join('')
    +`<div style="display:inline-block;text-align:center;margin:0 10px;color:#eee;font:14px sans-serif">${figureHTML({...tholo,headless:true},300)}<br>Tholo · slain</div>`});
await pg.evaluate(h=>{document.body.innerHTML=`<div id="x" style="background:#2a2018;padding:16px;white-space:nowrap">${h}</div>`},html);
await pg.waitForTimeout(400);await pg.screenshot({path:'bake_states.png',clip:{x:0,y:0,width:1500,height:360}});
console.log('ERRS',errs.slice(0,3));await b.close()})();

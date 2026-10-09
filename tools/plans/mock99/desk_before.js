/* before shots of Your ludus: node tools/plans/mock99/desk_before.js flavius-arena.html */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const out=__dirname;
for(const W of [1440,390]){
const pg=await b.newPage({viewport:{width:W,height:W>500?900:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route(/fonts\./,r=>r.abort());
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
const info=await pg.evaluate(async()=>{const W8=ms=>new Promise(x=>setTimeout(x,ms));if(CUR_MODAL)CUR_MODAL.done(null);menuHide();openManager();await W8(800);
 newWorld({type:'pre',key:MGR_PRE[0].key});MGR.view=null;MGR.tab='ludus';
 const w=W_(),m=me();
 for(let i=0;i<2;i++){try{w.night&&w.night.bouts.forEach(x=>x.done=true);await endWeek();await W8(300)}catch(e){console.log('ew',e)}}
 const W2=W_(),ros=rosterOf(me());const A=ros[0];A.inj={until:W2.week+2,label:'a gashed thigh',pen:3};
 me().perkPts=2;
 const riv=W2.mgrs.find(x=>!x.isPlayer&&rosterOf(x).length);const th=rosterOf(riv)[0];
 W2.offers=[{id:'oMock',kind:'swap',mid:riv.id,gid:ros[1].id,give:[th.id],coin:25,until:W2.week+1}];
 try{recruiter84(W2)}catch(e){console.log('rec',e)}try{medicus84(W2)}catch(e){}
 if(W2.night){W2.night.bye=false;W2.night.bouts.forEach(x=>{x.done=false;x.ents=x.ents.filter(id=>!ros.some(g=>g.id===id))})}
 for(let k=0;k<5&&CUR_MODAL;k++){CUR_MODAL.done(null);await W8(300)}menuHide();openManager('ludus');await W8(1200);MGR.view=null;MGR.tab='ludus';MGR_REDRAW();await W8(800);
 return {wk:W2.week,letters:(W2.letters||[]).map(l=>l.kind+'|'+l.from+'|'+l.title),ck:weekChecklist().map(x=>(x.done?'✓':'·')+x.ic+' '+x.txt.replace(/<[^>]+>/g,'')),ludus:me().ludus,ros:ros.map(g=>g.name+' '+g.cls),mail:[...document.querySelectorAll('#mailBox details.mail')].map(d=>d.querySelector('summary').textContent.trim().slice(0,100)+' >> '+d.querySelector('.mbody').textContent.replace(/\s+/g,' ').slice(0,420)),ros2:rosterOf(me()).map(g=>g.name+' · '+g.cls+' · ovr '+Math.round(effOvr(g))+(g.inj?' · INJ '+g.inj.label:'')),night:W_().night&&W_().night.bouts.map(b=>b.tier+' '+(b.done?'done':'open')+' ents '+b.ents.length),city:W_().night&&W_().night.city}});
if(W===1440)console.log(JSON.stringify(info,null,1));
await pg.screenshot({path:out+`/desk_before_${W}.png`,fullPage:W<500});
const tall=await pg.evaluate(()=>{const e=document.getElementById('mgrBody');return e?e.scrollHeight:0});
if(W>500){await pg.setViewportSize({width:1440,height:Math.min(2400,tall+200)});await pg.waitForTimeout(400);await pg.screenshot({path:out+`/desk_before_${W}_full.png`})}
console.log(W,'ERRS',JSON.stringify(errs));await pg.close()}
await b.close()})();

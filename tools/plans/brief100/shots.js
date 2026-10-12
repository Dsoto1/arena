/* node tools/plans/brief100/shots.js [page] — the v1.0 briefing (301-v100brief): classic / special / reopen at 1440×900 and 390×844 → tools/plans/brief100/*.png */
const {chromium}=require('playwright');const path=require('path');(async()=>{const b=await chromium.launch();
const PAGE=path.resolve(process.argv[2]||path.resolve(__dirname,'../../../flavius-arena.html'));const out=f=>path.resolve(__dirname,f);
const errs=[];
for(const [w,h,suf] of [[1440,900,''],[390,844,'_390']]){
 const pg=await b.newPage({viewport:{width:w,height:h}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(()=>{localStorage.setItem('flavius_firstrun','shown')});
 await pg.goto('file://'+PAGE);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
 const go=async(ev,seats,loc)=>{await pg.evaluate(([ev,seats,loc])=>{menuHide();if(CUR_MODAL)CUR_MODAL.done(null);SETTINGS.briefing=true;POPPED.add('firstTurn');
   startEvent({ev,loc,seats:seats.map(s=>({...s,pers:finalPers(s)})),opts:{...CFG.opts,spect:'auto'}})},[ev,seats,loc]);
   await pg.waitForFunction(()=>CUR_MODAL&&document.querySelector('#modal.bf100'),null,{timeout:20000});await pg.waitForTimeout(1200)};
 await go('democritus',[{cls:'royalty',cpu:false,name:'Varinius Gracchi'},{cls:'amazonia',cpu:true,diff:'hard',name:'Galla "Fatum" Aquila'},{cls:'soldier',cpu:true,diff:'normal',name:'The Scourge of Arles'},{cls:'damnatio',cpu:true,diff:'easy',name:'Nonus Messala'}],6);
 await pg.screenshot({path:out('brief_classic'+suf+'.png')});if(suf){console.log('390 widths',JSON.stringify(await pg.evaluate(()=>{const m=document.getElementById('mboxEl');m.scrollTop=1e5;return {doc:document.documentElement.scrollWidth,box:m.scrollWidth,boxc:m.clientWidth}})));
   await pg.waitForTimeout(300);await pg.screenshot({path:out('brief_classic_390_bottom.png')});await pg.evaluate(()=>{document.getElementById('mboxEl').scrollTop=0})}
 /* reopen mid-event: round II, one fallen */
 await pg.evaluate(()=>{SPEED='pause';CUR_MODAL.done(1)});await pg.waitForTimeout(800);
 await pg.evaluate(async()=>{for(let i=0;i<30&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100))}
   S.ri=1;eliminate(S.players[3],{type:'retire'});await new Promise(r=>setTimeout(r,300));for(let i=0;i<30&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await new Promise(r=>setTimeout(r,100))}
   eventBriefing(false)});
 await pg.waitForFunction(()=>document.querySelector('#modal.bf100'),null,{timeout:10000});await pg.waitForTimeout(800);
 await pg.screenshot({path:out('brief_reopen'+suf+'.png')});
 await pg.evaluate(()=>{CUR_MODAL&&CUR_MODAL.done(1);S.over=true});await pg.waitForTimeout(500);
 await go('goldenEagle',[{cls:'hero',cpu:false,name:'Thraex Murmillo',team:'A'},{cls:'amazonia',cpu:true,diff:'hard',name:'Tigris the Twice-Freed',team:'A'},{cls:'veteranus',cpu:true,diff:'normal',name:'Ferrum the Unkillable',team:'B'},{cls:'venatore',cpu:true,diff:'easy',name:'Tertius Audax',team:'B'}],9);
 await pg.screenshot({path:out('brief_special'+suf+'.png')});
 await pg.close()}
console.log('ERRS',errs.slice(0,5));await b.close()})();

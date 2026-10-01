const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:950}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');
// dev key
await pg.evaluate(()=>{cheatPrompt()});
await pg.waitForTimeout(400);const prompt=await pg.evaluate(()=>$('#mTitle').textContent);
await pg.fill('#devPass','spqr');await pg.click('#mBtns [data-mi="0"]');await pg.waitForTimeout(400);
const dev=await pg.evaluate(()=>({key:DEV_KEY(),creator:creatorUnlocked(),city3:cityUnlocked(3)}));
// names: two characters named the same
await pg.evaluate(()=>{openStudio('chars')});await pg.waitForTimeout(900);
const nm=await pg.evaluate(async()=>{ST.tab='chars';ST.draft=blankChar?blankChar():{name:'Test'};ST.draft.name='Marcus Ferrum';ST.draft.id=null;const a=await stSaveDraft();
  ST.draft={...JSON.parse(JSON.stringify(a)),id:null,created:null};ST.draft.name='Marcus Ferrum';const b2=await stSaveDraft();const sug=ST.draft.name;const c=await stSaveDraft();
  const w1={id:'w1',name:'Oath of Roma'};CUSTOM.weapons=[w1];const w2={id:'w2',name:'oath of  roma'};const ok=nameGuard('weapons',w2);
  return {first:!!a,blocked:b2===null,suggested:sug,savedSecond:c&&c.name,weaponBlocked:!ok,wsug:w2.name,crossKindOK:!nameClash('weapons','Marcus Ferrum',null)}});
console.log(JSON.stringify({prompt,dev,nm}),errs.slice(0,4));await b.close()})();

const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load/.test(m.text()))errs.push('c:'+m.text())});
await pg.goto('file://'+process.argv[2]);await pg.waitForTimeout(900);await pg.click('#mClose');const out={};
out.mgr=await pg.evaluate(async()=>{newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_(),m=me();m.coin=500;
  const ros=rosterOf(m).sort((a,b)=>effOvr(b)-effOvr(a));
  // run this week's bouts to build season tallies
  for(let i=0;i<w.night.bouts.length;i++)await runBoutSim(i);
  const ss=w.glads.filter(g=>g.ss).length;
  // an accepted invitation next week + an early billing
  w.invites=[{id:'ivT',sid:'colossus',n:'The Colossus Invitational',wk:w.week+1,status:'accepted',ents:ros.slice(0,2).map(g=>g.id),sent:w.week}];
  w.commits={[w.week+1]:{gid:ros[2]?ros[2].id:ros[0].id,ahead:3,at:w.week-2}};
  w.pend=[];const ok=await endWeek();
  const sp=!!w.special;const billed=w.night.bouts.some(b=>b.billed);
  const spHtml=specialHTML().length;const blocked=!(await endWeek());
  await specAutoRun();const champ=w.specialLog&&w.specialLog[0];
  // silverware
  earnTrophy(w,'aureus',{who:ros[0].name,gid:ros[0].id});earnTrophy(w,'sponge',{who:ros[1].name});earnTrophy(w,'trident',{who:ros[0].name});
  seasonAwards(w);
  return {ss,ok,sp,billed,spHtml,blocked,champ,tro:w.trophies.length,caseN:w.case.filter(Boolean).length,awards:w.awardShow.awards.map(a=>a.name+':'+(a.gname||a.mname)).slice(0,14),room:trophyRoomHTML().length,show:awardShowHTML().length}});
// screenshots through the real UI
await pg.evaluate(()=>{MGR.tab='awards';MGR.awI=99;openManager()});await pg.waitForTimeout(700);await pg.screenshot({path:'shot_awards.png'});
await pg.evaluate(()=>{MGR.tab='trophy';$('#mgrBody').innerHTML=mgrHTML()});await pg.waitForTimeout(300);await pg.screenshot({path:'shot_troom.png'});
await pg.click('.tslot[data-id="5"]');await pg.waitForTimeout(300);await pg.screenshot({path:'shot_troom2.png'});
out.swap=await pg.evaluate(()=>{const b=document.querySelector('[data-mg="tput"]');if(b)b.click();return !!b});await pg.waitForTimeout(300);
out.caseAfter=await pg.evaluate(()=>W_().case.filter(Boolean).length);
// invitation on the ludus page & schedule
await pg.evaluate(()=>{const w=W_();w.invites.push({id:'iv2',sid:'trident',n:'The Golden Trident Challenge',wk:w.week+4,status:'open',ents:[],sent:w.week});MGR.tab='ludus';$('#mgrBody').innerHTML=mgrHTML()});await pg.waitForTimeout(300);await pg.screenshot({path:'shot_invite.png'});
await pg.evaluate(()=>{MGR.tab='sched';$('#mgrBody').innerHTML=mgrHTML()});await pg.waitForTimeout(300);await pg.screenshot({path:'shot_sched.png'});
// a live special bracket view
await pg.evaluate(()=>{const w=W_();const ros=rosterOf(me());w.special=specBuild(specDef('leptis'),{id:'ivx'},ros.slice(0,1));MGR.tab='night';$('#mgrBody').innerHTML=mgrHTML()});await pg.waitForTimeout(300);await pg.screenshot({path:'shot_bracket.png'});
out.spRun=await pg.evaluate(async()=>{await specRunNext();await specRunNext();$('#mgrBody').innerHTML=mgrHTML();return W_().special.rounds.length});await pg.waitForTimeout(200);await pg.screenshot({path:'shot_bracket2.png'});
await pg.evaluate(()=>{MGR.tab='news';MGR.newsMap=true;$('#mgrBody').innerHTML=mgrHTML()});await pg.waitForTimeout(300);await pg.screenshot({path:'shot_newsmap.png'});
// tournament outside manager
out.tourn=await pg.evaluate(async()=>{$('#modal').hidden=true;CFG.tSid='leptis';tournStart({cls:'hero',cpu:false,name:'Testus'});await new Promise(r=>setTimeout(r,600));
  const T=TOURN;const h=T.rounds[0].findIndex(x=>x.ents.some(e=>e.human));const r0=T.rounds[0].filter(x=>x.res).length;
  // play "your" heat as CPU, then the rest
  const cfg=tournCfg(0,h,false);const res=await simEvent(cfg);tournRecord(0,h,res);await tournSimRest(false);
  const hs=await Store.list('hallTrophies');return {simmedBefore:r0,champ:T.champ&&T.champ.name,human:!!(T.champ&&T.champ.human),out:T.out,hall:hs.length}});
await pg.evaluate(()=>{$('#modal').hidden=true;document.querySelector('#mBody')&&0});
await pg.evaluate(async()=>{await Store.put('hallTrophies','hX',{tid:'colossus',name:'The Colossus Crown',spec:trophyDef('colossus'),who:'Testus',date:'2026-09-27'});});
await pg.evaluate(()=>{$('#modal').hidden=true;openHall('trophies')});await pg.waitForTimeout(800);await pg.screenshot({path:'shot_hallt.png'});
await pg.evaluate(()=>{$('#modal').hidden=true;window.SETUP_OPEN=false});await pg.keyboard.press('Escape');await pg.waitForTimeout(300);
await pg.evaluate(()=>{$('#modal').hidden=true;CFG.mode='tourn';openSetup()});await pg.waitForTimeout(800);await pg.screenshot({path:'shot_tsetup.png'});
await pg.evaluate(()=>{$('#modal').hidden=true;openStudio('trophies')});await pg.waitForTimeout(800);await pg.screenshot({path:'shot_tstudio.png'});
console.log(JSON.stringify(out,null,1));console.log(JSON.stringify(errs.slice(0,6)));await b.close()})();

/* v0.89 Flavius's mood faces (167-v89moods): the 11 painted moods load; flavFaceURL gives a different portrait per mood (a data URL,
   or on a tainted file:// canvas the painting itself); every sponsor face draws in every mood incl. 'really' (data URLs, all different);
   the 'really' mood + lines exist; flaviusMood('really') and flaviusReact('spare') work in a live event; the Studio preview shows 11 moods.
   SHOT=<png> also saves the arena with Flavius's box. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900}});await pg.route(/fonts\.g/,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.waitForFunction(()=>typeof FLAVM89!=='undefined'&&Object.keys(FLAVM89_SRC).every(m=>flavM89Ready(m)),null,{timeout:15000}).catch(()=>{});
const o=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const r={};
  const M=['calm','pleased','smug','cheer','laugh','shock','angry','bored','weep','facepalm','really'];
  r.n=M.filter(m=>flavM89Ready(m)&&FLAVM89.img[m].naturalWidth>=200).length;
  const fu=M.map(m=>flavFaceURL(m));r.fOk=fu.every((u,i)=>/^data:image/.test(u)||u.endsWith('flavmood_'+M[i]+'.webp'));r.fDistinct=new Set(fu).size===M.length;r.fReally=fu[10];
  /* a painted canvas differs from the old drawn face */
  const sps=[CITY_SPONSORS[1],CITY_SPONSORS[2],CITY_SPONSORS[3],CITY_SPONSORS[5],CITY_SPONSORS[10],{...blankSponsor(),id:'csTest',beard:'long',head:'flowers',long:true}];
  r.sp=sps.map(sp=>{const u=M.map(m=>flavFaceURL(m,sp));return u.every(x=>/^data:image\/png/.test(x)&&x.length>2000)&&new Set(u).size===M.length});
  r.pri=FLAV_PRI.really===2;r.lines=(FLAV_LINES.really||[]).length>=3;r.voices=Object.values(SPONSOR_VOICES).every(v=>(v.really||[]).length>=1);
  r.prev=(sponPrevHTML({...blankSponsor(),id:'csPrev'}).match(/<img /g)||[]).length===11;
  if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}
  startEvent({ev:'democritus',loc:6,seats:[{cls:'hero',cpu:false},{cls:'soldier',cpu:true},{cls:'slave',cpu:true},{cls:'royalty',cpu:true}],opts:{spect:0}});
  for(let i=0;i<30;i++){if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(100)}SPEED='pause';
  S.sponsorId='flavius';FLAV.until=0;flaviusMood('really',5000,1);r.live=FLAV.mood==='really'&&!!FLAV.line;
  try{draw()}catch(e){r.drawErr=e.message}
  FLAV.until=0;flaviusMood('calm',10,0);await W8(30);flaviusReact('spare');r.spare=FLAV.mood==='really';
  /* a city sponsor in the box draws in every mood */
  S.sponsorId='city:9';let bad=0;for(const m of M){FLAV.until=0;flaviusMood(m,4000,0);try{draw()}catch(e){bad++}}r.spDraw=bad===0;
  S.sponsorId='flavius';FLAV.until=0;flaviusMood('really',8000,1);try{draw()}catch(e){}
  return r});
ok(o.n===11,'11 painted moods loaded: '+o.n);ok(o.fOk&&o.fDistinct,'flavFaceURL painted + distinct per mood');
ok(o.sp.every(Boolean),'sponsor faces in every mood '+JSON.stringify(o.sp));ok(o.pri&&o.lines&&o.voices,'really: priority, lines, voices');
ok(o.prev,'Studio preview shows 11 moods');ok(o.live&&!o.drawErr,'flaviusMood(really) in a live event '+o.drawErr);ok(o.spare,'spare → really');ok(o.spDraw,'sponsor box draws every mood');
if(process.env.SHOT){await pg.waitForTimeout(200);await pg.screenshot({path:process.env.SHOT})}
console.log(JSON.stringify({miss}));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

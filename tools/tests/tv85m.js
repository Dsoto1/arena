/* v0.85 music: the five-letter word unlocks every theme (the old one is retired); Ave Arena plays while Online is open and renders cleanly */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900}});await pg.route(/fonts\./,r=>r.abort());const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1')});
await pg.goto('file://'+process.argv[2],{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const r=await pg.evaluate(async()=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();const W=String.fromCharCode(77,85,83,73,67);const old=String.fromCharCode(77,85,83,73,67,65,49,54);
  const before=musicUnlocked('Online');const oldGone=!CHEATS[cheatKey(old)];const msg=CHEATS[cheatKey(W)]?CHEATS[cheatKey(W)].run():'';
  const all=[...AUD_TRACKS.map(x=>x[0]),...AUD_EXTRA.map(x=>x[0])].every(k=>musicUnlocked(k));localStorage.removeItem('flavius_musica');
  onlineOpen('play');await new Promise(x=>setTimeout(x,1200));const want=audWant();
  /* render a few bars of the theme offline */
  const oc=new OfflineAudioContext(2,44100*2,44100);const keep={ctx:AUD.ctx,music:AUD.music};AUD.ctx=oc;AUD.music=oc.destination;let err=null;
  try{const th=audTheme('Online');for(let s=0;s<256;s++)audStep(th,0.05+s*0.01,s,1)}catch(e){err=String(e)}AUD.ctx=keep.ctx;AUD.music=keep.music;
  return {before,oldGone,msg:!!msg,all,want,err,listed:AUD_EXTRA.some(x=>x[0]==='Online')}});
ok(r.oldGone,'the old word is retired');ok(r.msg&&r.all,'the new word unlocks every theme');ok(r.listed,'Ave Arena is listed');ok(r.want==='Online','Online plays Ave Arena');ok(!r.err,'the theme renders: '+r.err);
console.log(JSON.stringify(r));console.log('MISS',miss);console.log('ERRS',errs.slice(0,4));await b.close();if(miss.length||errs.length)process.exit(1)})();

/* sound100 measure — renders every sound effect (and a few seconds of music) through the game's OWN audio graph on an
   OfflineAudioContext and prints peak / loudest-100 ms RMS (dBFS at the master, default sliders).
   node tools/plans/sound100/measure.js flavius-arena.html [off]   (off = localStorage flavius_sound100off=1, today's sounds) */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage();
const off=process.argv[3]==='off';
await pg.addInitScript(o=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');if(o)localStorage.setItem('flavius_sound100off','1')},off);
await pg.route(/fonts\./,r=>r.abort());
await pg.goto('file://'+require('path').resolve(process.argv[2]),{timeout:90000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
const rows=await pg.evaluate(async()=>{const W=ms=>new Promise(r=>setTimeout(r,ms));const SR=44100;
  const render=async(play,secs)=>{const keep={...AUD};const AC0=window.AudioContext;let oc=null;
    window.AudioContext=function(){oc=new OfflineAudioContext(2,Math.ceil(SR*secs),SR);Object.defineProperty(oc,'state',{get:()=>'running'});return oc};
    try{for(const k of Object.keys(AUD))AUD[k]=null;AUD.step=0;AUD.next=0;AUD.playing=false;AUD.paused=true;audInit();await play(oc);await W(120);const buf=await oc.startRendering();
      let pk=0,best=0;const L=buf.getChannelData(0),R=buf.getChannelData(1),win=Math.round(SR*0.1);let acc=0;const sq=new Float32Array(L.length);
      for(let i=0;i<L.length;i++){const v=Math.max(Math.abs(L[i]),Math.abs(R[i]));if(v>pk)pk=v;sq[i]=(L[i]*L[i]+R[i]*R[i])/2}
      for(let i=0;i<sq.length;i++){acc+=sq[i];if(i>=win)acc-=sq[i-win];if(i>=win-1&&acc>best)best=acc}
      const db=x=>x>0?Math.round(200*Math.log10(x))/10:-99;return {peak:db(pk),rms:db(Math.sqrt(best/win))}}
    finally{window.AudioContext=AC0;for(const k of Object.keys(keep))AUD[k]=keep[k]}};
  const out=[];const base=['hit','bighit','block','whoosh','coin','cf','card','death','cheer','fanfare','click','horn'];
  const extra=typeof SND100_K!=='undefined'&&SND100.on?Object.keys(SND100_K):[];
  for(const k of [...base,...extra]){const o=k==='growl'||k==='bark'?{t:'lion'}:k==='medal'?{m:'gold'}:{};
    if(typeof SND100!=="undefined")SND100.lastFam=0;out.push({k,...await render(async()=>{sfx(k,o)},k==='horn'?3:2.5)})}
  if(extra.includes('growl'))for(const t of ['bear','wolf','snake','zora','tholo','commodus'])for(const k of ['growl','bark'])out.push({k:k+':'+t,...await render(async()=>{sfx(k,{t})},2.5)});
  if(typeof tt100Tick==='function')out.push({k:'tt100Tick',...await render(async()=>{tt100Tick()},1)});
  for(const [nm,fn] of [['music Roma',()=>audTheme('Roma')],['music Finale',()=>audTheme('Finale')]])
    out.push({k:nm,...await render(async oc=>{audFadeTo(1,0.001);const th=fn();const spb=60/th.bpm/2;let t=0.05,st=64;while(t<6){audStep(th,t,st++,1);t+=spb}},6.5)});
  return out});
console.log((off?'BEFORE':'AFTER')+' (dBFS at the master, default sliders: music 32%, effects 55%)');console.log('kind'.padEnd(18),'peak','  rms100ms');
for(const r of rows)console.log(r.k.padEnd(18),String(r.peak).padStart(6),String(r.rms).padStart(8));
await b.close()})();

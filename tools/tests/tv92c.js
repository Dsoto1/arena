/* v0.92 cheer bursts (209-v92cheer): a delighted crowd no longer holds its arms up all event — short bursts, a share of the stands at any
   moment; a big moment (crowdReact 'elim') sends a wave; Reduce motion stops the bursts. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'egidious',loc:0,seats:['royalty','soldier','hero','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:48}});
  for(let i=0;i<80;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>6)break}SPEED='pause';for(const sp of S.spect)sp.mood=80});
const R=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const n=S.spect.length;const share=[];const seen=new Set();
  for(let i=0;i<14;i++){await W8(500);const now=performance.now();const up=S.spect.filter(sp=>cheer92Pose(sp,now)>0);up.forEach(sp=>seen.add(sp.id));share.push(up.length/n)}
  const o={n,max:Math.max(...share),min:Math.min(...share),seen:seen.size/n};
  /* a wave */for(const sp of S.spect)sp._cu92=0;crowdReact('elim',{v:S.players[1],killer:S.players[0]});const now=performance.now();o.wave=S.spect.filter(sp=>cheer92Pose(sp,now)>0).length/n;
  /* reduce motion: no new bursts */for(const sp of S.spect)sp._cu92=0;SETTINGS.calm=true;await W8(2200);const n2=performance.now();o.calm=S.spect.filter(sp=>cheer92Pose(sp,n2)>0).length;SETTINGS.calm=false;
  return o});
ok(R.n>10,'a crowd '+R.n);ok(R.max<0.6,'never the whole delighted crowd at once '+JSON.stringify(R));ok(R.max>0,'some bursts '+JSON.stringify(R));ok(R.seen>0.3,'many different spectators cheer over 7 s '+R.seen);
ok(R.wave>0.2,'a kill sends a wave '+R.wave);ok(R.calm===0,'Reduce motion: no bursts '+R.calm);
console.log(JSON.stringify(R));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

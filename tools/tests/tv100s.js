/* v1.0 the crowd stands up (283-v100stand): an elimination makes some spectators rise and sit again within ~3 s; Reduce motion / the kill
   switch: none; standing sprites are a cached variant (draw cost held); nothing stands over the sand; no errors. */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.route(/fonts\./,r=>r.abort());
const errs=[];pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
await pg.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
await pg.goto('file://'+process.argv[2]);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:60000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  startEvent({ev:'egidious',loc:0,seats:['royalty','soldier','hero','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:48}});
  for(let i=0;i<80;i++){await W8(150);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>6)break}SPEED="pause";for(const sp of S.spect)sp.mood=80;STAND100.burst=0});
const R=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const n=S.spect.length;const o={n};const cnt=()=>{const t=performance.now();return S.spect.filter(sp=>stand100Is(sp,t)).length};
  const drawMs=()=>{const t=performance.now();for(let i=0;i<20;i++)draw();return (performance.now()-t)/20};
  for(const sp of S.spect){sp._sa100=null;sp._cu92=0}await W8(800);o.before=cnt();draw();drawMs();o.msSeated=drawMs();
  /* 1 an elimination: some rise, all sit again */
  crowdReact('elim',{v:S.players[1],killer:S.players[0]});await W8(900);o.peak=cnt();draw();drawMs();o.msStand=drawMs();o.rise=S.spect.some(sp=>stand100Is(sp,performance.now())&&look91(sp,false).st===1);
  /* nothing over the sand: the standing figure's crown (106 units up) stays outside every tile diamond */
  {const t=performance.now();const u=TW*SIZE91/100;o.over=0;o.seatedOver=0;for(const sp of S.spect){if(sp._x==null)continue;const st=stand100Is(sp,t);
    for(let r=0;r<N;r++)for(let c=0;c<N;c++){const m=center(r,c);const inD=(px,py)=>Math.abs(px-m.x)/(TW/2)+Math.abs(py-m.y)/(TH/2)<=0.98;
      if(inD(sp._x,sp._y-86*u))o.seatedOver++;if(st&&inD(sp._x,sp._y-106*u))o.over++}}}
  await W8(3200);o.after=cnt();
  for(const sp of S.spect){sp._sa100=null}
  /* 3 Reduce motion: nobody rises */
  SETTINGS.calm=true;crowdReact('elim',{v:S.players[1],killer:S.players[0]});await W8(900);o.calm=cnt();SETTINGS.calm=false;
  /* 4 the kill switch */
  STAND100.on=false;crowdReact('elim',{v:S.players[1],killer:S.players[0]});await W8(700);o.off=cnt();STAND100.on=true;
  /* 5 the sprite is cached: further draws paint no new sprite */
  for(const sp of S.spect)sp._sa100=null;crowdReact('elim',{v:S.players[1],killer:S.players[0]});await W8(500);draw();const m0=CR91.miss;for(let i=0;i<5;i++)draw();o.newSprites=CR91.miss-m0;
  return o});
ok(R.n>10,'a crowd '+R.n);ok(R.before===0,'seated at rest '+R.before);ok(R.peak>=3,'an elimination makes some stand '+R.peak);ok(R.rise,'the standing look carries st');
ok(R.after===0,'they sit down again '+R.after);ok(R.calm===0,'Reduce motion: none stand '+R.calm);ok(R.off===0,'kill switch: none stand '+R.off);
ok(R.over<=R.seatedOver,'nothing stands over the sand '+R.over+' vs seated '+R.seatedOver);ok(R.msStand<R.msSeated+6,`draw cost held ${R.msStand.toFixed(1)} vs ${R.msSeated.toFixed(1)} ms`);ok(R.newSprites===0,'cached sprites '+R.newSprites);
console.log(JSON.stringify(R));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));await b.close();process.exit(miss.length||errs.length?1:0)})();

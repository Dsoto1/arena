/* tv111gl — v1.11 WebGL board SPIKE (419-v111gl). (1) flag off: no GL canvas, no hook installed (the 2D drawImage untouched), the sand
   painted on #cv as before. (2) flag on (flavius_gl111=1): the plane + sprite canvases exist, a WebGL context draws without errors (planes
   lit, sprites routed), the sand is no longer on #cv (it is a GL plane) while the 2D overlay still paints the move highlights on #cv.
   (3) GL111.set(false): GL canvases gone, the sand back on #cv. A human soldier + 3 CPU, Democritus, so move highlights stand. */
const {chromium}=require('playwright');const T=require('./_wait');
(async()=>{const URL=await require('../perf95/serve.js')(process.argv[2]);const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const errs=[];const miss=[];const ok=(c,n)=>{if(!c)miss.push(n)};
const START=async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const close=()=>{if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)};
  while(CUR_MODAL){close();await W8(120)}try{menuHide()}catch(e){}SETTINGS.briefing=false;try{POPPED.add('firstTurn');POPPED.add('mandata')}catch(e){}
  startEvent({ev:'democritus',loc:6,seed:4242,seats:[{cls:'soldier'},...['hero','royalty','venatore'].map(c=>({cls:c,cpu:true}))],opts:{spect:0}});
  SPEED='snap';for(let i=0;i<300&&!(S&&humanTurn()&&(S.phase==='action'||S.phase==='choice')&&!CUR_MODAL);i++){await W8(150);close()}
  if(S.phase==='choice'){await takeChoice(cur(),'coin');await W8(300)}while(CUR_MODAL){close();await W8(150)}
  draw();await W8(300);return {phase:S.phase,human:humanTurn(),hl:HL.size}};
/* the board's own pixels: alpha on #cv at highlighted tiles and at empty, plain sand tiles */
const PROBE=()=>{draw();const g=cv.getContext('2d');const d=window.devicePixelRatio||1;const at=(r,c)=>{const m=center(r,c);return g.getImageData(Math.round(m.x*d),Math.round(m.y*d),1,1).data[3]};
  const occ=(r,c)=>[...S.players,...S.npcs].some(x=>x&&x.alive!==false&&!x.out&&Math.abs(x.r-r)<=1&&Math.abs(x.c-c)<=1);
  const hl=[],sand=[];for(let r=1;r<N-1;r++)for(let c=1;c<N-1;c++){const k=r*N+c;if(occ(r,c))continue;if(HL.has(k)){if(hl.length<6)hl.push(at(r,c))}else if(sand.length<10&&!S.pillars?.some?.(p=>p.r===r&&p.c===c))sand.push(at(r,c))}
  return {hl,sand,glp:!!document.getElementById('gl111p'),gls:!!document.getElementById('gl111s'),cls:cv.classList.contains('gl111on'),
    on:GL111.on,hooks:GL111.hooks,ctx:GL111.type,err:GL111.err,lit:GL111.lit,glErr:GL111.glErr,st:{...GL111.st},hlRan:(LAYERS93.stats.highlights||{}).n||0}};
for(const on of [false,true]){
  const ctx=await b.newContext({viewport:{width:1280,height:860}});const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());
  pg.on('pageerror',e=>errs.push(on+':'+String(e)));
  await T.boot(pg,{seed:1,ls:on?{flavius_gl111:'1',flavius_light106auto:'0'}:{flavius_light106auto:'0'}});
  await pg.goto(URL,{timeout:180000,waitUntil:'domcontentloaded'});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:180000});
  const s=await pg.evaluate(START);ok(s.human&&s.hl>0,on+' human turn with highlights '+JSON.stringify(s));
  if(!on){const a=await pg.evaluate(PROBE);
    const proto=await pg.evaluate(()=>GL111.proto0===null&&!GL111.on&&!document.querySelector('canvas[id^="gl111"]'));
    ok(proto&&!a.glp&&!a.gls&&!a.cls&&!a.hooks&&a.st.draws===0,'off: nothing installed '+JSON.stringify(a));
    ok(a.sand.length>=5&&a.sand.every(v=>v===255),'off: sand on #cv '+JSON.stringify(a.sand));
    ok(a.hl.length&&a.hl.every(v=>v===255),'off: highlights on #cv '+JSON.stringify(a.hl))}
  else{await pg.evaluate(()=>{GL111.dbgRead=true;GL111.sig=''});const a=await pg.evaluate(PROBE);
    ok(a.on&&a.glp&&a.gls&&a.cls&&/^webgl[12]$/.test(a.ctx||'')&&!a.err,'on: GL canvases + context '+JSON.stringify(a));
    ok(a.lit>=10&&a.glErr===0,'on: planes drawn, no GL error '+JSON.stringify({lit:a.lit,glErr:a.glErr}));
    ok(a.st.draws>0&&a.st.planes>0&&a.st.sprites>0&&a.st.uploads>0,'on: routed '+JSON.stringify(a.st));
    ok(a.sand.filter(v=>v<255).length>=Math.ceil(a.sand.length*0.6),'on: sand is a GL plane (not on #cv) '+JSON.stringify(a.sand));
    ok(a.hl.length&&a.hl.every(v=>v>0)&&a.hlRan>0,'on: 2D overlay highlights on #cv '+JSON.stringify(a.hl));
    /* a few CPU turns with GL on: still no errors */
    await pg.evaluate(async()=>{SPEED='normal';const p=cur();try{endTurn&&endTurn()}catch(e){}await new Promise(r=>setTimeout(r,2500))});
    const c=await pg.evaluate(()=>({on:GL111.on,err:GL111.err,draws:GL111.st.draws}));ok(c.on&&!c.err&&c.draws>a.st.draws,'on: keeps drawing '+JSON.stringify(c));
    const o=await pg.evaluate(()=>{GL111.set(false);return null});const z=await pg.evaluate(PROBE);
    ok(!z.on&&!z.glp&&!z.gls&&!z.cls,'toggle off: GL canvases gone '+JSON.stringify({on:z.on,glp:z.glp,gls:z.gls,cls:z.cls}));
    ok(z.sand.length>=5&&z.sand.every(v=>v===255),'toggle off: sand back on #cv '+JSON.stringify(z.sand))}
  await ctx.close()}
const bad=errs.filter(e=>!/ResizeObserver/.test(e));
console.log(miss.length||bad.length?'FAIL '+JSON.stringify(miss):'OK');console.log('ERRS',JSON.stringify(bad));await b.close();process.exit(miss.length||bad.length?1:0)})();

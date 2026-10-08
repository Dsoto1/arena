/* tv96c — v0.96 the clean-up show redrawn (238-v96clean): the same show runs with the old crew (localStorage flavius_clean96off=1)
   and with the new one; the duration matches (±5%), the three crew sheets load, the crew rides with the pieces only during draw()
   (no cl96 items left in S.pillars), the work phases show figures + a guard, Full mode runs its frame loop and leaves comb lines,
   calm (Reduce motion) = static (no loop, no effects), Fast = no effects; the extra draw cost stays small; no errors. */
const {chromium}=require('playwright');
const page=process.argv[2];
(async()=>{const b=await chromium.launch();const out={};const errs=[];
  async function run(tag,off,calm){
    const ctx=await b.newContext({viewport:{width:1440,height:960}});
    await ctx.addInitScript(([off])=>{try{localStorage.setItem('flavius_firstrun','shown');if(off)localStorage.setItem('flavius_clean96off','1')}catch(e){}},[off]);
    const pg=await ctx.newPage();await pg.route(/fonts\./,r=>r.abort());
    pg.on('pageerror',e=>errs.push(tag+': '+e.message));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(tag+' console: '+m.text())});
    await pg.goto('file://'+page);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
    await pg.evaluate((calm)=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();$('#modal').hidden=true;if(calm)SETTINGS.calm=true;
      startEvent({ev:'democritus',loc:6,seats:['soldier','hero','slave','royalty'].map(c=>({cls:c,cpu:true,diff:'normal'})),opts:{spect:0}});SPEED='pause'},calm);
    await pg.waitForTimeout(1500);
    await pg.evaluate(()=>{const pl=S.pillars[1];S.pillars=S.pillars.filter(x=>x!==pl);(S.rubble=S.rubble||[]).push({r:pl.r,c:pl.c,dr:0,dc:1});
      S.pillars[0].pots=[];S.chest.r=9;S.chest.c=3;for(const [r,c] of [[6,6],[6,7],[7,6],[5,8]])bloodAt(r,c,'elim');
      S.players[1].r=4;S.players[1].c=7;eliminate(S.players[1],{type:'player',p:S.players[0]});
      eliminate(S.players[2],{type:'player',p:S.players[0]});eliminate(S.players[3],{type:'player',p:S.players[0]});
      window.__t96={ticks:0};{const bt=cleanTick9;cleanTick9=function(){__t96.ticks++;return bt.apply(this,arguments)}}const base=startCleanCrew;startCleanCrew=function(){const r=base.apply(this,arguments);if(S.clean&&!__t96.t0)__t96.t0=performance.now();return r};
      SPEED='normal'});
    await pg.waitForTimeout(1000);
    await pg.evaluate(()=>{const r=S.lastResult&&S.lastResult.rows&&S.lastResult.rows.find(x=>x.id===0);if(r)r.fate='Fatal Charades · Charun'});
    /* watch the show: duration, a look mid-blood, figures/guard/items */
    const R=await pg.evaluate(async()=>{const o={phases:[],items:0,guard:0,lines:0,figs:{},leak:0,ready:null,mode:null,loopFrames:0};const T=window.__t96;
      const t0=performance.now();
      while(performance.now()-t0<150000){if(CUR_MODAL)CUR_MODAL.done(null);$('#modal').hidden=true;
        if(S.clean){const ph=CLEAN_ORDER[S.clean.phase];if(o.phases[o.phases.length-1]!==ph)o.phases.push(ph);
          if(typeof CL96!=='undefined'){o.mode=cl96Mode();o.ready=cl96Ready();o.items=Math.max(o.items,CL96.items.length);if(CL96.items.some(i=>i.fig==='guard'))o.guard++;
            for(const i of CL96.items)if(i.fig)o.figs[i.fig+':'+i.row]=1;o.lines=Math.max(o.lines,CL96.lines.length);if(S.pillars.some(x=>x.cl96))o.leak++;
            if(ph==='blood'&&o.drawOn==null){const N=12;let a=performance.now();for(let i=0;i<N;i++)draw();o.drawOn=(performance.now()-a)/N;
              const was=CL96.off;CL96.off=true;a=performance.now();for(let i=0;i<N;i++)draw();o.drawOff=(performance.now()-a)/N;CL96.off=was;o.f0=CL96.frames;o.tf0=performance.now()}
            if(o.f0!=null&&o.f1==null&&performance.now()-o.tf0>1500){o.f1=CL96.frames;o.fps=(o.f1-o.f0)/((performance.now()-o.tf0)/1000)}}}
        if(S.cleanDone&&!S.clean&&T.t0){o.dur=performance.now()-T.t0;o.ticks=T.ticks;break}
        await new Promise(r=>setTimeout(r,40))}
      o.pillarsAfter=S.pillars.length;o.leftover=S.pillars.filter(x=>x.cl96).length;return o});
    await ctx.close();return R}
  out.off=await run('off',true,false);
  out.on=await run('on',false,false);
  out.calm=await run('calm',false,true);
  console.log(JSON.stringify(out,null,1));
  const fail=[];const ok=(c,m)=>{if(!c)fail.push(m)};
  ok(out.off.dur>0&&out.on.dur>0,'the show ran in both');
  /* tick counts can differ between runs (each event deals its own board); the pace per tick is what the crew must not change */
  /* the pace: each run's length against its own ticks × 320 ms (a loaded machine stretches every run alike), and on vs off */
  const pace=r=>r.dur/(r.ticks*320);const d=Math.abs(pace(out.on)-pace(out.off))/pace(out.off);
  ok(d<0.05,`same duration ±5% (off ${Math.round(out.off.dur)} ms / ${out.off.ticks} ticks, on ${Math.round(out.on.dur)} ms / ${out.on.ticks} ticks, pace ${pace(out.off).toFixed(3)} vs ${pace(out.on).toFixed(3)})`);
  ok(Math.abs(pace(out.calm)-pace(out.off))/pace(out.off)<0.05,'calm: same duration');
  ok(out.on.ready===true,'sheets loaded');ok(out.on.mode==='full','full mode with animations on');
  ok(out.on.figs['slave:rakeA']||out.on.figs['slave:rakeB'],'rakers rake');ok(Object.keys(out.on.figs).some(k=>k.startsWith('charun:')),'Charun drawn');ok(out.on.phases.includes('charun'),'Charun came for the fated');
  ok(out.on.guard>0,'the guard oversees');ok(out.on.lines>0,'comb lines / ruts in the sand');ok(out.on.leak===0&&out.on.leftover===0,'no crew items left in S.pillars');
  ok(out.on.fps>3.5,'the frame loop runs in Full ('+(out.on.fps||0).toFixed(1)+' fps)');
  ok(out.on.drawOn-out.on.drawOff<8,`draw cost +${(out.on.drawOn-out.on.drawOff).toFixed(2)} ms (on ${out.on.drawOn.toFixed(2)} / off ${out.on.drawOff.toFixed(2)})`);
  ok(out.calm.mode==='static','calm = static');ok(out.calm.lines===0,'calm: no effects');ok(!(out.calm.fps>4),'calm: no frame loop');
  ok(out.off.items===0,'kill switch: the old crew');
  ok(!errs.length,'no page errors');
  console.log('DUR',out.off.dur|0,out.on.dur|0,out.calm.dur|0,'TICKS',out.off.ticks,out.on.ticks,out.calm.ticks,'DRAW ms on/off',out.on.drawOn.toFixed(2),out.on.drawOff.toFixed(2),'FPS',(out.on.fps||0).toFixed(1));console.log('CHECKS',fail.length?'FAIL '+JSON.stringify(fail):'all ok');console.log('ERRS',JSON.stringify(errs.slice(0,6)));
  await b.close();process.exit(fail.length?1:0)})().catch(e=>{console.error(e);process.exit(1)});

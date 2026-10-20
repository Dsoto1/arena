/* tsfx108 — v1.08a RECORDED SOUND EFFECTS (408-v108sfx): 1 after the audio unlock the 25 mp3s fetch + decode (served over http: file:// cannot
   fetch), nothing is fetched before audio is on; 2 sfx('hit') plays the SAMPLE through 314's routing (trims, fold window, gate stay), the
   kinds map to their files (growl / bark per beast voice, custom beast → beast, Zora → eagle, Tholo → grunt, bark = a short slice), levels
   are finite; 3 an Axe THROWN plays 'axe' once, other throws / the axe in melee do not; 4 kill switch flavius_sfx108off=1 → the synth,
   no fetch; 5 a missing file → that kind keeps its synth, the rest still load, no errors; no console errors. */
const {chromium}=require('playwright');const path=require('path');const http=require('http');const fs=require('fs');
const root=path.resolve(path.dirname(path.resolve(process.argv[2]||'flavius-arena.html')));const pageName=path.basename(process.argv[2]||'flavius-arena.html');
const MIME={'.html':'text/html','.js':'text/javascript','.mp3':'audio/mpeg','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.css':'text/css'};
(async()=>{const srv=http.createServer((rq,rs)=>{const f=path.join(root,decodeURIComponent(rq.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){rs.writeHead(404);rs.end();return}
    rs.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(rs)});
  await new Promise(r=>srv.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+srv.address().port+'/'+pageName;
  const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[],miss=[];const ok=(c,m)=>{if(!c)miss.push(m)};
  const open=async(o={})=>{const cx=await b.newContext({viewport:{width:1440,height:900}});const pg=await cx.newPage();const reqs=[];pg.reqs=reqs;pg.on('request',r=>reqs.push(r.url()));
    pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR/.test(m.text()))errs.push('console: '+m.text())});
    await pg.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());if(o.missing)await pg.route('**/sfx108_'+o.missing+'.mp3',r=>r.fulfill({status:404,body:'no'}));
    await pg.addInitScript(o=>{if(sessionStorage.getItem('tsfx108'))return;sessionStorage.setItem('tsfx108','1');Object.defineProperty(navigator,'webdriver',{get:()=>false});
      localStorage.setItem('flavius_firstrun','shown');if(o.off)localStorage.setItem('flavius_sfx108off','1');else localStorage.removeItem('flavius_sfx108off');
      window.__starts=[];const st=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(t,off,dur){window.__starts.push({d:this.buffer&&this.buffer.duration,dur:dur});return st.apply(this,arguments)}},o);
    await pg.goto(base,{timeout:120000});await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:120000});return {pg,cx}};
  const unlock=async pg=>{await pg.keyboard.press('Shift');await pg.waitForFunction(()=>AUD.ctx&&AUD.ctx.state==='running',null,{timeout:20000}).catch(()=>{})};
  const start=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
    SETTINGS.briefing=false;try{applySettings()}catch(e){}SPEED='pause';
    startEvent({ev:'democritus',loc:6,seats:['venatore','soldier','royalty','hero'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{},seed:4242});
    for(let i=0;i<120;i++){await W8(100);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>5)break}return !!S});

  /* ---------------- ON ---------------- */
  const A=await open();
  ok(await A.pg.evaluate(()=>SFX108.on&&SFX108.buf.size===0&&!SFX108.started),'1a before audio is unlocked nothing is loaded');
  ok(!A.pg.reqs.some(u=>/sfx108_/.test(u)),'1b no sfx request before the unlock');
  await unlock(A.pg);
  ok(await A.pg.waitForFunction(()=>SFX108.done,null,{timeout:30000}).then(()=>true).catch(()=>false),'1c the loader finishes');
  const L=await A.pg.evaluate(()=>({n:SFX108.buf.size,fail:[...SFX108.fail],keys:[...SFX108.buf.keys()].sort(),all:SFX108_KEYS.length}));
  console.log(JSON.stringify(L));
  ok(L.n===25&&L.all===25&&!L.fail.length,'1d all 25 buffers decoded '+JSON.stringify(L));
  ok(await start(A.pg),'event started');
  const R=await A.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const out={};const clear=()=>{SND100.log.length=0;SFX108.log.length=0;SND100.lastFam=0;SND100.lastImp=0;SND100.lastBark.clear()};SPEED='pause';S.turnNo=Math.max(1,S.turnNo);SPEED='pause';const only=(L,ks)=>L.filter(x=>ks.includes(x.k));
    /* the gains: finite, in range */
    out.gains=[];for(const k of SFX108_KEYS){const kind=SFX108_VFILES.includes(k)?'growl':k;const e=SFX108.buf.get(k);const t=({lion:'lion',bear:'bear',wolf:'wolf',snake:'snake',eagle:'zora',grunt:'tholo',beast:'x'})[k];
      const K=sfx108Key(kind,{t});const g=20*Math.log10(sfx108Gain(kind,e,K));out.gains.push(isFinite(g)&&g>=-30&&g<=24)}
    /* hit uses the sample, once per fold window */
    clear();const s0=SFX108.stats.sample;sfx('hit');await W8(80);out.hit=only(SFX108.log,['hit']).map(x=>x.k+':'+x.f);out.hitN=SFX108.stats.sample-s0;out.hitLog=only(SND100.log,['hit']).map(x=>x.k);
    /* a hit + a block together fold into one (314), the sample is the strongest's */
    clear();sfx('block');sfx('hit');await W8(80);out.fold=only(SFX108.log,['hit','block']).map(x=>x.f);
    /* the kinds → files */
    clear();for(const t of ['lion','bear','wolf','snake','zora','tholo','commodus','whatever'])sfx('growl',{t,own:true});await W8(60);out.growl=only(SFX108.log,['growl']).map(x=>x.f);
    clear();window.__starts.length=0;sfx('growl',{t:'wolf',own:true});await W8(40);sfx('bark',{t:'wolf',own:true});await W8(40);out.gb=window.__starts.filter(x=>x.d>2);out.bark=SFX108.log.filter(x=>x.k==='growl'||x.k==='bark').map(x=>x.k+':'+x.f);
    clear();for(const k of ['bighit','block','whoosh','death','net','netwrap','scrape','crash','step','rise','titulus','medal','spear','cheer','horn']){sfx(k,{own:true});await W8(70)}
    const RK=['bighit','block','whoosh','death','net','netwrap','scrape','crash','step','rise','titulus','medal','spear','cheer','horn'];const rl=only(SFX108.log,RK);out.rest=rl.map(x=>x.k===x.f);out.restN=rl.length;
    clear();SND100.lastFam=0;sfx('fanfare');await W8(40);out.fan=only(SFX108.log,['fanfare']).map(x=>x.f);
    /* fold: an immediate second fanfare is dropped (314), the synth/sample choice is below that */
    /* Fast: a CPU's step is silent (314), your own plays the sample */
    clear();SPEED='fast';sfx('step',{own:false});sfx('step',{own:true});await W8(40);out.fast=only(SFX108.log,['step']).length;SPEED='pause';
    /* mute: nothing */
    clear();audToggleMute();sfx('growl',{t:'bear'});await W8(60);out.muted=SFX108.log.length;audToggleMute();
    /* To the end + sims: silent */
    clear();S.snap=true;sfx('hit');sfx('axe',{own:true});await W8(80);out.snap=only(SFX108.log,['hit','axe']).length;S.snap=false;clear();S.sim=true;sfx('axe');await W8(60);S.sim=false;out.sim=only(SFX108.log,['axe']).length;
    /* the axe: thrown plays 'axe' once; a hasta thrown / the axe in melee do not */
    const P=S.players,p=P[0],q=P[1];const tgt=()=>({kind:'player',ref:q,key:'p'+q.id,r:q.r,c:q.c});
    const run=async(src)=>{clear();q.alive=true;p.r=6;p.c=3;q.r=6;q.c=5;q.hp&&Object.keys(q.hp).forEach(k=>q.hp[k]=Math.max(q.hp[k],9));p.attacks=0;p.armUses={R:0,L:0,B:0,...p.armUses};p.armUses[src.arm]=0;
      try{await Promise.race([doAttack(p,src,tgt()),W8(5000)])}catch(e){out.err=String(e)}
      for(let i=0;i<30&&CUR_MODAL;i++){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(100)}await W8(80);return SND100.log.filter(x=>x.k==='axe').length};
    out.axeThrow=await run({arm:'R',w:mkW('axe'),thr:1});out.axeFile=SFX108.log.filter(x=>x.k==='axe').map(x=>x.f);
    out.hastaThrow=await run({arm:'R',w:mkW('hasta'),thr:1});out.axeMelee=await run({arm:'R',w:mkW('axe')});
    SPEED='pause';return out});
  console.log(JSON.stringify(R));
  ok(R.gains.every(Boolean),'2a levels are finite and in range '+R.gains);
  ok(R.hitN===1&&R.hit.length===1&&R.hit[0]==='hit:hit'&&R.hitLog.join()==='hit','2b sfx(hit) plays the hit sample once through 314 '+JSON.stringify([R.hitN,R.hit,R.hitLog]));
  ok(R.fold.length===1&&R.fold[0]==='hit','2c a block + hit fold into one sound, the strongest '+JSON.stringify(R.fold));
  ok(R.growl.join()==='lion,bear,wolf,snake,eagle,grunt,grunt,beast','2d growl by voice '+R.growl);
  ok(R.gb.length===2&&R.gb[1].dur<R.gb[0].d*0.6&&R.gb[1].dur>0.15&&R.gb[0].dur>=R.gb[0].d-0.01&&R.bark.join()==='growl:wolf,bark:wolf','2e a bark is the shorter slice of the same file '+JSON.stringify([R.gb,R.bark]));
  ok(R.restN>=14&&R.rest.every(Boolean),'2f the other kinds play their own file '+R.restN+' '+R.rest);
  ok(R.fan.join()==='fanfare','2g fanfare '+R.fan);
  ok(R.fast===1,'2h Fast: only your own step '+R.fast);ok(R.muted===0,'2i mute is silent '+R.muted);ok(R.snap===0&&R.sim===0,'2j To the end / sims are silent '+[R.snap,R.sim]);
  ok(R.axeThrow===1&&R.axeFile.join()==='axe','3a an Axe thrown plays axe once (its file) '+[R.axeThrow,R.axeFile,R.err]);
  ok(R.hastaThrow===0&&R.axeMelee===0,'3b another throw / the axe in melee: no axe sound '+[R.hastaThrow,R.axeMelee]);
  await A.cx.close();

  /* ---------------- kill switch ---------------- */
  const K=await open({off:true});await unlock(K.pg);await K.pg.waitForTimeout(1200);
  const RK=await K.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SND100.log.length=0;sfx('hit');sfx('growl',{t:'lion'});await W8(120);return {on:SFX108.on,n:SFX108.buf.size,started:SFX108.started,s:SFX108.stats.sample,log:SND100.log.map(x=>x.k),krep:SND100_K.hit===undefined}});
  console.log(JSON.stringify(RK));
  ok(!RK.on&&RK.n===0&&!RK.started&&RK.s===0&&RK.krep,'4a kill switch: no sample, nothing installed '+JSON.stringify(RK));ok(RK.log.slice().sort().join()==='growl,hit','4b the synth still plays '+RK.log);
  ok(!K.pg.reqs.some(u=>/sfx108_/.test(u)),'4c kill switch: no sfx request');await K.cx.close();

  /* ---------------- a missing file ---------------- */
  const M=await open({missing:'wolf'});await unlock(M.pg);await M.pg.waitForFunction(()=>SFX108.done,null,{timeout:30000}).catch(()=>{});
  const RM=await M.pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));SFX108.log.length=0;SND100.log.length=0;sfx('growl',{t:'wolf',own:true});sfx('growl',{t:'lion',own:true});await W8(80);
    return {n:SFX108.buf.size,fail:[...SFX108.fail],log:SFX108.log.map(x=>x.k+':'+x.f),played:SND100.log.map(x=>x.k)}});
  console.log(JSON.stringify(RM));
  ok(RM.n===24&&RM.fail.join()==='wolf','5a one file missing: 24 load '+JSON.stringify(RM));ok(RM.log.join()==='growl:,growl:lion'&&RM.played.length===2,'5b the wolf falls back to its synth, the lion plays its sample '+JSON.stringify(RM));
  await M.cx.close();

  ok(!errs.length,'no errors '+JSON.stringify(errs.slice(0,3)));
  await b.close();srv.close();console.log('ERRS',JSON.stringify(errs));if(miss.length){console.log('MISSING',miss);process.exit(1)}console.log('tsfx108 OK');process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});

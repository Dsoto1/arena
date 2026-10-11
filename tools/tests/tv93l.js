/* tv93l — v0.93 THE LAYER MANAGER (219-v93layers) + THE EVENT BUS (00d-bus, 218-v93bus).
   LAYERS: seven scenes (a classic event by day, zoomed with the camera mid-ease, a night match, Naumachia, Chariot Racing, rubble +
   blood + a corpse, a turned corner) are drawn with the manager ON and with the kill switch OFF (the plain loop that
   localStorage flavius_layers93off=1 gives) — clock frozen and Math.random seeded around each draw, the camera ease reset before
   each — and the canvas pixels must be IDENTICAL (max channel diff printed). The ordered list runs in order (orderErr 0, no
   unknown layer), the cached sub-layers report hits, the debug Off really removes a layer and its return restores the pixels,
   and a page loaded with flavius_layers93off=1 runs the plain loop.
   BUS: on/once/off; one event per action (log, render, hit, elim, save, window.open/close, market.buy) with sane payloads; a
   throwing handler never breaks the caller or the next handler and lands in the error log; a short all-CPU event emits
   event.start once, turn.begin once per turn, phases, round.end, event.over once; emits nobody hears cost next to nothing, and
   sims with every event listened to give the same results as without. SHOT=dir saves screenshots. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const out={};const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';
const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}try{menuHide()}catch(e){}
  window.TL93={W8,s:1,
    start:async(ev,loc,night,human)=>{startEvent({ev,loc,seed:4242,seats:['hero','soldier','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==(human==null?-1:human)})),opts:{spect:'auto',night:!!night}});
      for(let i=0;i<200;i++){await W8(120);if(CUR_MODAL){const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];
          if(lit)lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null)}else if(S&&S.phase!=='setup'&&i>6)break}
      SPEED='pause';for(let i=0;i<50&&((typeof fxRAF!=='undefined'&&fxRAF)||S.busy||(S.anims&&S.anims.length));i++)await W8(100);try{menuHide()}catch(e){}
      if(typeof Z100!=='undefined')Z100.force=false;S.zoomIn=false;CAM.z=null;if(typeof DUEL!=='undefined'){DUEL.z=1;DUEL.on=false}for(const id of ['cardShow','bubbles'])(document.getElementById(id)||{}).innerHTML='';
      for(let i=0;i<30;i++){draw();await W8(100)} /* the stone texture, flags, art */},
    /* one draw with the clock frozen and Math.random seeded: the same frame every time */
    shot(prep){TL93.s=12345;if(prep)prep();draw();const c=cv.getContext('2d');return c.getImageData(0,0,cv.width,cv.height).data},
    frozen(fn){const T=performance.now(),D=Date.now();const mr=Math.random,dn=Date.now;Object.defineProperty(performance,'now',{value:()=>T,configurable:true,writable:true});
      Date.now=()=>D;Math.random=()=>{TL93.s=(TL93.s*1103515245+12345)&0x7fffffff;return TL93.s/0x7fffffff};
      try{return fn()}finally{delete performance.now;Date.now=dn;Math.random=mr}},
    diff(a,b){if(a.length!==b.length)return {max:255,n:-1};let max=0,n=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d){n++;if(d>max)max=d}}return {max,n}},
    /* ON (warm) → ON → OFF → ON again; plus the debug Off of one layer */
    compare(prep,dbg){return TL93.frozen(()=>{LAYERS93.reset();LAYERS93.on=true;TL93.shot(prep);const a=TL93.shot(prep);LAYERS93.on=false;const f0=LAYERS93.frames;const b=TL93.shot(prep);const plain=LAYERS93.frames===f0;
      LAYERS93.on=true;const c=TL93.shot(prep);const r={off:TL93.diff(a,b),again:TL93.diff(a,c),plain,frames:LAYERS93.frames,orderErr:LAYERS93.orderErr,unknown:LAYERS93.unknown,w:cv.width,h:cv.height};
      if(dbg){LAYERS93.dbg.add(dbg);const d=TL93.shot(prep);LAYERS93.dbg.delete(dbg);const e=TL93.shot(prep);r.dbg={name:dbg,removed:TL93.diff(a,d).n,back:TL93.diff(a,e)}}
      return r})}}});
const scene=async(name,startArgs,prepSrc,dbg)=>{if(startArgs)await pg.evaluate(a=>TL93.start(...a),startArgs);
  const r=await pg.evaluate(([src,dbg])=>{const prep=src?eval(src):null;return TL93.compare(prep,dbg)},[prepSrc,dbg||null]);out[name]=r;
  ok(r.off.max===0,name+': manager ON vs OFF pixels differ '+JSON.stringify(r.off));ok(r.again.max===0,name+': ON twice differ '+JSON.stringify(r.again));
  ok(r.plain,name+': OFF still ran the manager');ok(r.orderErr===0&&r.unknown===0,name+': order '+r.orderErr+'/'+r.unknown);
  if(dbg){ok(r.dbg.removed>0,name+': debug Off of '+dbg+' changed nothing');ok(r.dbg.back.max===0,name+': debug Off did not come back')}
  if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv93l_'+name+'.png')})};
/* ---------------- LAYERS ---------------- */
await scene('day',['democritus',6,false],null,'pieces');
out.report=await pg.evaluate(()=>{LAYERS93.reset();for(let i=0;i<20;i++)draw();return LAYERS93.report()});
{const R=out.report;ok(R.on&&R.frames>=20,'report frames');const names=R.rows.filter(x=>!x.cached).map(x=>x.name);
  ok(names.join()==='rim,stands,tiles,walls,floor,decals,highlights,pieces,overlays,crowdtop,flavius,fx,duel','layer list '+names);
  const sub=R.rows.filter(x=>x.cached).map(x=>x.name);ok(['stands/under','stands/deco','walls/top','walls/light','walls/sky'].every(n=>sub.includes(n)),'cached sub-layers '+sub);
  ok(R.rows.filter(x=>x.cached&&/walls\/top|stands\/under/.test(x.name)).every(x=>x.hits>=15),'cached layers reused '+JSON.stringify(R.rows.filter(x=>x.cached)));
  ok(R.rows.find(x=>x.name==='pieces').n>=20,'pieces timed')}
await scene('deco_off',null,null,'deco');
await scene('zoom',null,`(()=>{if(typeof Z100!=='undefined')Z100.force=true /* v1.0 294: a zoom that is still moving draws the last crisp layers scaled; force = the settled (crisp) frame this test compares */;const p=cur();CAM.z=2;CAM.fr=p.r-1.6;CAM.fc=p.c+1.2;CAM.raf=1})`);
await pg.evaluate(()=>{CAM.z=null;CAM.raf=0;CAM.fr=null;draw()});
await scene('wear',null,`(()=>{if(!S._t93){S._t93=1;S.rubble=(S.rubble||[]).concat([{r:5,c:4,dr:0,dc:1},{r:8,c:8,dr:1,dc:0}]);S.blood=(S.blood||[]).concat([{r:6,c:6,kind:'elim',seed:7},{r:3,c:9,kind:'limb',seed:9},{r:7,c:2,kind:'drop',seed:3}]);
  const p=S.players[3];S.piles.push({r:9,c:3,corpse:true,cls:p.cls,color:p.color,owner:p.id,items:[],weapons:[],armor:[]})}})`,'wear');
await scene('night',['egidious',2,true],null,'walls');
await scene('naumachia',['naumachia',8,false],null,'tiles');
await scene('chariot',['chariot',3,false],null,'floor');
await scene('rotated',['cassian',5,false,2],null,'decals');
out.rot=await pg.evaluate(()=>ROT89.k);ok(out.rot!==0,'the corner did not turn '+out.rot);
/* ---------------- BUS ---------------- */
out.bus=await pg.evaluate(async()=>{const W8=TL93.W8;const r={};const got={};const offs=[];const rec=n=>offs.push(BUS.on(n,d=>{(got[n]=got[n]||[]).push(d)}));
  /* on / once / off */
  let a=0,c=0;const offA=BUS.on('t93',()=>a++);BUS.once('t93',()=>c++);BUS.emit('t93');BUS.emit('t93');offA();BUS.emit('t93');r.api=[a,c,BUS.has('t93')];
  /* a throwing handler */
  const mark=ERR92.n;let after=0;const o1=BUS.on('log',()=>{throw new Error('boom93')}),o2=BUS.on('log',()=>after++);let threw=false;try{log('t93 throw test')}catch(e){threw=true}
  o1();o2();r.thrown={threw,after,logged:errNew92(mark).some(e=>/bus log: boom93/.test(e.msg))};
  /* one event per action */
  for(const n of ['log','render','hit','elim','save','window.open','window.close','market.buy','chest.open','spear'])rec(n);
  log('t93 one line','thought');render();
  const P=S.players.find(p=>p.alive);const hp0=P.hp.chest;await hurt(P,'chest',1,{type:'player',p:S.players.find(q=>q!==P)},'',{noShield:true,noCards:true});
  const N0=S.npcs.find(n=>n.alive);if(N0)hurtNPC(N0,1,P,'');
  const V=S.players.find(p=>p.alive&&p!==P);eliminate(V,{type:'player',p:P});eliminate(V,{type:'player',p:P}) /* already out: no second event */;
  matchSlotPut('t93',{name:'t93'});try{localStorage.removeItem(MSAVE_KEY('t93'))}catch(e){}
  const mp=modal('TL93 window','<p>x</p>',[{label:'OK',value:7}]);await W8(50);CUR_MODAL.done(7);await mp;await W8(20);
  const Q=S.players.find(p=>p.alive);Q.coin=99;const mb=marketBuy75(Q,1,{free:true});for(let i=0;i<30&&CUR_MODAL;i++){const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');if(lit)lit.click();else CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(80)}
  for(let i=0;i<40;i++){await W8(100);if(CUR_MODAL){const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');if(lit)lit.click();else CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}if(got['market.buy'])break}
  await mb.catch(()=>{});
  r.counts=Object.fromEntries(Object.entries(got).map(([k,v])=>[k,v.length]));
  r.log=got.log&&got.log.filter(x=>x.html==='t93 one line').length;
  r.hit=(got.hit||[]).map(h=>({t:h.target&&h.target.name,npc:h.target&&h.target.npc,by:h.by&&h.by.name,loc:h.loc,amount:h.amount,before:h.before,after:h.after}));r.hp0=hp0;
  r.elim=(got.elim||[]).map(e=>({v:e.victim&&e.victim.name,by:e.by&&e.by.name,type:e.type}));r.vName=V.name;r.pName=P.name;
  r.save=got.save;r.win=[(got['window.open']||[]).filter(x=>x.title==='TL93 window').length,(got['window.close']||[]).filter(x=>x.title==='TL93 window').map(x=>x.value)];
  r.mkt=got['market.buy'];
  offs.forEach(f=>f());
  /* cost while nobody listens */
  let t0=performance.now();for(let i=0;i<1e6;i++)BUS.emit('nobody93',i);r.emitNs=Math.round((performance.now()-t0)*1e6/1e6);
  return r});
{const B=out.bus;ok(B.api.join()==='2,1,false','on/once/off '+B.api);ok(!B.thrown.threw&&B.thrown.after===1&&B.thrown.logged,'throwing handler '+JSON.stringify(B.thrown));
  ok(B.log===1,'log once '+B.log);ok(B.counts.render===1,'render once '+B.counts.render);
  const hp=B.hit.find(h=>!h.npc);ok(hp&&hp.t===B.pName&&hp.loc==='chest'&&hp.amount===1&&hp.before&&hp.after&&hp.before.hp+hp.before.ap-1===hp.after.hp+hp.after.ap,'hit payload '+JSON.stringify(B.hit));
  ok(B.hit.filter(h=>h.npc).length<=1&&B.hit.filter(h=>!h.npc).length===1,'one hit per hurt '+B.hit.length);
  ok(B.elim.length===1&&B.elim[0].v===B.vName&&B.elim[0].by===B.pName&&B.elim[0].type==='player','elim once '+JSON.stringify(B.elim));
  ok(B.save&&B.save.length===1&&B.save[0].kind==='match'&&B.save[0].slot==='t93'&&B.save[0].ok===true,'save '+JSON.stringify(B.save));
  ok(B.win[0]===1&&B.win[1].length===1&&B.win[1][0]===7,'window open/close '+JSON.stringify(B.win));
  ok(B.mkt&&B.mkt.length===1&&B.mkt[0].lv===1&&B.mkt[0].free===true,'market.buy '+JSON.stringify(B.mkt));
  ok(B.emitNs<200,'an emit nobody hears costs '+B.emitNs+' ns')}
/* a whole all-CPU event: start once, a turn.begin per turn, phases, rounds, over once */
out.flow=await pg.evaluate(async()=>{const W8=TL93.W8;const got={};const offs=['event.start','turn.begin','phase','round.end','event.over','hit','elim'].map(n=>BUS.on(n,d=>{(got[n]=got[n]||[]).push(d)}));
  startEvent({ev:'triumviratus',loc:4,seed:777,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true})),opts:{spect:0}});SPEED='fast';
  for(let i=0;i<900;i++){await W8(100);if(CUR_MODAL){const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(bs.length)bs[0].click();else CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null)}if(S.over&&got['event.over'])break}
  SPEED='pause';offs.forEach(f=>f());const tb=got['turn.begin']||[];const nums=tb.map(t=>t.turnNo);
  return {start:(got['event.start']||[]).map(e=>({ev:e.evKey,seed:e.seed,n:e.players.length,sim:e.sim})),turns:tb.length,uniq:new Set(nums).size,lastTurn:S.turnNo,mono:nums.every((n,i)=>!i||n>nums[i-1]),
    phases:[...new Set((got.phase||[]).map(p=>p.to))],phaseN:(got.phase||[]).length,rounds:(got['round.end']||[]).map(x=>x.ri),over:(got['event.over']||[]).map(x=>({ev:x.evKey,w:x.winners.length,sim:x.sim})),
    hits:(got.hit||[]).length,hitOK:(got.hit||[]).every(h=>h.target&&typeof h.amount==='number'),elims:(got.elim||[]).length,elimU:new Set((got.elim||[]).map(e=>e.victim.id)).size,isOver:!!S.over}});
{const F=out.flow;ok(F.start.length===1&&F.start[0].ev==='triumviratus'&&F.start[0].seed===777&&F.start[0].n===4&&!F.start[0].sim,'event.start '+JSON.stringify(F.start));
  ok(F.isOver&&F.over.length===1&&F.over[0].ev==='triumviratus','event.over once '+JSON.stringify(F.over));
  ok(F.turns>5&&F.turns===F.uniq&&F.mono&&F.lastTurn===F.turns,'turn.begin once per turn '+JSON.stringify([F.turns,F.uniq,F.lastTurn,F.mono]));
  ok(['resolve','action'].every(p=>F.phases.includes(p))&&F.phases.includes('over'),'phases '+F.phases);
  ok(F.hitOK&&F.elims===F.elimU,'hits/elims '+[F.hits,F.elims,F.elimU])}
/* neutrality: sims give the same results with every event listened to */
out.sims=await pg.evaluate(async()=>{const run=async()=>{const res=[];for(let i=0;i<3;i++){const r=await simEvent({ev:['democritus','egidious','cassian'][i],loc:2+i,seed:900+i,seats:['hero','soldier','royalty','venatore'].map(c=>({cls:c,cpu:true,stats:{spd:70,str:70,int:70,lck:70,cha:70}})),opts:{...CFG.opts,spect:0}},{timeoutMs:60000});
    res.push(r.turns+':'+r.rows.map(x=>x.f+'/'+(x.won?1:0)+'/'+x.fate).join(','))}return res.join('|')};
  const t0=performance.now();const plain=await run();const t1=performance.now();let n=0;
  const offs=['hit','elim','turn.begin','phase','log','round.end','event.start','event.over','market.buy','render','window.open','window.close','draw.after'].map(k=>BUS.on(k,()=>n++));
  const heard=await run();const t2=performance.now();offs.forEach(f=>f());return {same:plain===heard,events:n,plainMs:Math.round(t1-t0),heardMs:Math.round(t2-t1)}});
ok(out.sims.same&&out.sims.events>100,'sims differ with listeners '+JSON.stringify(out.sims));
/* the kill switch at load */
{const p2=await ctx.newPage();await p2.addInitScript(()=>localStorage.setItem('flavius_layers93off','1'));p2.on('pageerror',e=>errs.push('off page: '+e.message));await p2.goto(URL0);await p2.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:30000});
  out.killSwitch=await p2.evaluate(async()=>{draw();return {on:LAYERS93.on,frames:LAYERS93.frames}});ok(out.killSwitch.on===false&&out.killSwitch.frames===0,'kill switch '+JSON.stringify(out.killSwitch));
  await p2.evaluate(()=>localStorage.removeItem('flavius_layers93off'));await p2.close()}
const R=out.report;out.report=R.rows.map(x=>x.cached?`${x.name} hit ${x.hits} miss ${x.misses} paint ${x.paintMs} blit ${x.blitMs}`:`${x.name} avg ${x.avg} max ${x.max}`);
for(const k of ['day','deco_off','zoom','wear','night','naumachia','chariot','rotated'])if(out[k]){const r=out[k];console.log(`${k}: ${r.w}x${r.h} ON vs OFF max diff ${r.off.max} (${r.off.n} values) · ON again ${r.again.max}`+(r.dbg?` · debug Off ${r.dbg.name}: ${r.dbg.removed} values changed, back ${r.dbg.back.max}`:''));delete out[k]}
console.log('layers: '+out.report.join(' · '));delete out.report;
console.log(JSON.stringify(out));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs));
await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();

/* v0.91 THE NIGHT MATCH (189-v91night): Play Now Options → 🌙 Night starts a night event (S.night); the sand's middle is darker
   and bluer than by day while a piece keeps its own pixels and contrast; the 11 lights stand outside the sand diamond; Reduce
   motion stops the flicker (two frames identical) and without it the flames move; Manager: Match Week's 2nd bout is the night
   match (boutCfg → night, 🌙 tag on its card only), the city square is at dusk before it and in daylight otherwise; Online: the
   host's Day/Night choice (lobby.set night) reaches the other lanista's room and both screens' matches (mock, two windows).
   SHOT=dir saves screenshots. */
const http=require('http'),fs=require('fs'),path=require('path');
const {chromium}=require('playwright');(async()=>{const root=path.dirname(path.resolve(process.argv[2])),page=path.basename(process.argv[2]);
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));const URL0='http://127.0.0.1:'+srv.address().port+'/'+page;const b=await chromium.launch();
const errs=[];const miss=[];const out={};const ok=(c,n)=>{if(!c)miss.push(n)};const SHOT=process.env.SHOT||'';

/* SETTLED: the board is still while the page decodes images / eases the camera / finishes the start-up windows; under load that takes seconds and a frame sampled
   earlier differs from the next (the piece's contrast, the 'identical frames' checks). Waits until no window is up and the whole canvas (flame-free: Reduce
   motion on) is the same on three frames in a row, ≤40 s; returns whether it settled. */
const settle=pg=>pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const g=cv.getContext('2d');const calm0=SETTINGS.calm;
  const sig=()=>{draw();const d=g.getImageData(0,0,cv.width,cv.height).data;let h=0;for(let i=0;i<d.length;i+=37)h=(h*31+d[i]+d[i+1]*7+d[i+2]*13)>>>0;return h};
  let last=-1,n=0;try{SETTINGS.calm=true;for(let t0=Date.now();Date.now()-t0<40000;){await W8(250);if(CUR_MODAL){n=0;continue}const h=sig();if(h===last){if(++n>=3)return true}else{n=0;last=h}}return {m:!!CUR_MODAL,b:!!S.busy,n,ph:S.phase,sp:SPEED,last}}finally{SETTINGS.calm=calm0}});
/* ======== 1. Play Now: the Night option, the look, the lights, the flicker ======== */
{const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
  /* the option in the setup, then Begin Event */
  const o=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));while(CUR_MODAL){CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);await W8(120)}
    openSetup(true);for(let i=0;i<40&&!document.getElementById('oNight91');i++)await W8(100);const sel=document.getElementById('oNight91');const r={sel:!!sel,inOpts:!!(sel&&sel.closest('.optfold,.pn100opt'))};
    if(!sel)return r;sel.value='night';sel.dispatchEvent(new Event('change',{bubbles:true}));r.cfg=!!CFG.opts.night;
    CFG.seats.slice(0,4).forEach((s,i)=>{s.cpu=i!==0});CFG.seats[0].cls='soldier'; /* Play Now deals the seats' classes at random (165-v89seats): the contrast check below measures THIS piece's pixels vs the sand, which depends on the class colour (Slave / Veteranus read ~1 at night) — pinned so the run is the same every time */document.getElementById('goBtn').click();
    for(let i=0;i<80;i++){await W8(150);if(CUR_MODAL){const t=(document.getElementById('mTitle')||{}).textContent||'';const lit=document.querySelector('#mBody [data-mi]:not(.dim):not([disabled])');
        const bs=[...document.querySelectorAll('#mBtns button:not([disabled])')];if(lit&&/raft/.test(t))lit.click();else if(bs.length)bs[0].click();else CUR_MODAL.done(null)}
      else if(S&&S.phase!=='setup'&&i>8)break}
    SPEED='pause';r.night=!!(S&&S.night);r.on=night91On();return r});
  out.option=o;ok(o.sel,'1 the Night option is in the setup');ok(o.inOpts,'1 inside ⚙ Options');ok(o.cfg,'1 CFG.opts.night set');ok(o.night&&o.on,'1 the event starts at night');
  {const st=await settle(pg);ok(st===true,'2 the board settles before it is sampled '+JSON.stringify(st))}
  /* day vs night on the same board: the sand's middle, a piece */
  const L=await pg.evaluate(()=>{SPEED='pause';const g=cv.getContext('2d');const dpr=window.devicePixelRatio||1;
    const grab=(x0,y0,w,h)=>g.getImageData(Math.round(x0*dpr),Math.round(y0*dpr),Math.max(1,Math.round(w*dpr)),Math.max(1,Math.round(h*dpr))).data;
    const stat=d=>{let r=0,gg=0,bb=0,n=0,l=[];for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];bb+=d[i+2];n++;l.push(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2])}const m=l.reduce((a,x)=>a+x,0)/n;
      return {r:r/n,g:gg/n,b:bb/n,lum:m,sd:Math.sqrt(l.reduce((a,x)=>a+(x-m)*(x-m),0)/n)}};
    const occ=new Set();for(const p of S.pillars)occ.add(p.r*N+p.c);for(const n of S.npcs)if(n.alive)occ.add(n.r*N+n.c);for(const p of S.players)if(p.alive)occ.add(p.r*N+p.c);
    /* empty middle tiles (and the tile behind each, so nothing tall stands over them) */
    const mids=[];for(let r=4;r<=8;r++)for(let c=4;c<=8;c++)if(!occ.has(r*N+c)&&!occ.has((r+1)*N+c)&&!occ.has(r*N+c+1)&&!occ.has((r+1)*N+c+1))mids.push([r,c]);
    const p=S.players.find(q=>q.alive&&!q.cpu)||S.players.find(q=>q.alive);
    const shot=()=>{draw();const m=mids.map(([r,c])=>{const x=center(r,c);return stat(grab(x.x-TW*0.15,x.y-TW*0.06,TW*0.3,TW*0.12))});
      const avg=k=>m.reduce((a,s)=>a+s[k],0)/Math.max(1,m.length);const pc=center(p.r,p.c);const box=[pc.x-TW*0.2,pc.y-TW*0.85,TW*0.4,TW*0.8];return {mid:{r:avg('r'),g:avg('g'),b:avg('b'),lum:avg('lum')},piece:stat(grab(...box)),raw:Array.from(grab(...box))}};
    /* both shots in the same still state (idle bobbing / flame flicker are clock-driven: a piece a pixel apart between the two draws is no longer 'the pixels night left alone') */
    const calm0=SETTINGS.calm,an0=SETTINGS.anim88;SETTINGS.calm=true;SETTINGS.anim88='off';
    S.night=false;const D=shot();S.night=true;const Nn=shot();SETTINGS.calm=calm0;SETTINGS.anim88=an0;let same=0;
    /* the piece = pixels that night left alone; the ground behind = the rest: their difference in brightness is the piece's contrast */
    const lum=(d,i)=>0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];let pc=0,pn=0,bd=0,bn=0,nb=0;
    for(let i=0;i<D.raw.length;i+=4){if(D.raw[i]===Nn.raw[i]&&D.raw[i+1]===Nn.raw[i+1]&&D.raw[i+2]===Nn.raw[i+2]){same++;pc+=lum(D.raw,i);pn++}else{bd+=lum(D.raw,i);bn+=lum(Nn.raw,i);nb++}}
    const pm=pc/Math.max(1,pn),cDay=Math.abs(pm-bd/Math.max(1,nb)),cNight=Math.abs(pm-bn/Math.max(1,nb));
    /* v1.0: 311's stand-ins are many-coloured (a dark belt, bright skin, a steel helm): their MEAN brightness can sit near the night sand's
       while every part stands well off it — so also measure how far the piece's pixels stand from the ground on average (RMS) */
    const bgD=bd/Math.max(1,nb),bgN=bn/Math.max(1,nb);let qd=0,qn=0;for(let i=0;i<D.raw.length;i+=4)if(D.raw[i]===Nn.raw[i]&&D.raw[i+1]===Nn.raw[i+1]&&D.raw[i+2]===Nn.raw[i+2]){const v=lum(D.raw,i);qd+=(v-bgD)*(v-bgD);qn+=(v-bgN)*(v-bgN)}
    const rDay=Math.sqrt(qd/Math.max(1,pn)),rNight=Math.sqrt(qn/Math.max(1,pn));
    return {pcls:p.cls,pr:p.r,pc:p.c,tiles:mids.length,day:D.mid,night:Nn.mid,pieceDay:{lum:D.piece.lum,sd:D.piece.sd,c:cDay,rms:rDay},pieceNight:{lum:Nn.piece.lum,sd:Nn.piece.sd,c:cNight,rms:rNight},same:same/(D.raw.length/4)}});
  out.look=L;ok(L.tiles>=2,'2 empty middle tiles to sample');
  ok(L.night.lum<L.day.lum*0.85,`2 the middle is darker at night (${L.night.lum.toFixed(1)} vs ${L.day.lum.toFixed(1)})`);
  ok(L.night.b/Math.max(1,L.night.r)>L.day.b/Math.max(1,L.day.r)+0.05,'2 the middle is bluer at night');
  ok((L.pieceNight.c>=20||L.pieceNight.rms>=40)&&L.pieceNight.rms>=L.pieceDay.rms*0.8,`2 the piece stands out from the sand (contrast ${L.pieceNight.c.toFixed(1)} vs ${L.pieceDay.c.toFixed(1)} by day, RMS ${L.pieceNight.rms.toFixed(1)} vs ${L.pieceDay.rms.toFixed(1)}; ${L.pcls} at ${L.pr},${L.pc})`);
  ok(L.same>=0.2,'2 the piece keeps its own pixels '+L.same.toFixed(2));
  /* the lights: 12, every one outside the sand diamond (all four turns of the view) */
  const T=await pg.evaluate(()=>{const inside=(P,x,y)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)c=!c}return c};
    const res=[];const k0=ROT89.k;const want=rot89Want;
    for(let k=0;k<4;k++){rot89Want=()=>k;draw();const D=[isoFix(0,0),isoFix(0,N),isoFix(N,N),isoFix(N,0)];const B=NIGHT91.torches;
      res.push({k:ROT89.k,n:B.length,bad:B.filter(t=>[[t.x0,t.y0],[t.x1,t.y0],[t.x0,t.y1],[t.x1,t.y1],[(t.x0+t.x1)/2,t.y0]].some(([x,y])=>inside(D,x,y))).length})}
    rot89Want=want;draw();return {res,k0}});
  out.torches=T;ok(T.res.every(r=>r.n===((typeof T.ar==='undefined'||T.ar)?9:11)),'3 the rim lights: 9 with the arena look (its towers light the side corners), 11 without '+JSON.stringify(T.res.map(r=>r.n)));ok(T.res.every(r=>r.bad===0),'3 no light inside the sand '+JSON.stringify(T.res));
  if(SHOT){await pg.evaluate(()=>{try{menuHide()}catch(e){}draw()});await pg.screenshot({path:path.join(SHOT,'tv91n_night.png')})}
  /* the flicker: moves by default, holds still with Reduce motion */
  await settle(pg);
  const F=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const g=cv.getContext('2d');const dpr=window.devicePixelRatio||1;
    const sig=()=>{draw();let h=0;for(const t of NIGHT91.torches){const d=g.getImageData(Math.round(t.x0*dpr),Math.round(t.y0*dpr),Math.max(1,Math.round((t.x1-t.x0)*dpr)),Math.max(1,Math.round((t.y1-t.y0)*dpr))).data;for(let i=0;i<d.length;i+=4)h=(h*31+d[i]+d[i+1]*7+d[i+2]*13)>>>0}return h};
    const calm0=SETTINGS.calm;SETTINGS.calm=false;const a=sig();await W8(260);const b2=sig();
    SETTINGS.calm=true;const c=sig();await W8(260);const d=sig();SETTINGS.calm=calm0;
    const an0=SETTINGS.anim88;SETTINGS.anim88='off';const e=sig();await W8(260);const f=sig();SETTINGS.anim88=an0;
    return {moving:a!==b2,calm:c===d,off:e===f}});
  out.flicker=F;ok(F.moving,'4 the flames flicker');ok(F.calm,'4 Reduce motion: two frames identical');ok(F.off,'4 Animations Off: two frames identical');
  /* a day event stays day */
  const day=await pg.evaluate(async()=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));CFG.opts.night=false;startEvent({ev:'democritus',loc:6,seats:['hero','soldier','royalty','venatore'].map((c,i)=>({cls:c,cpu:i!==0})),opts:{spect:0}});
    for(let i=0;i<30;i++){await W8(120);if(CUR_MODAL)CUR_MODAL.done(CUR_MODAL.closeB?CUR_MODAL.closeB.value:null);else if(S&&S.phase!=='setup'&&i>4)break}return {night:!!S.night,on:night91On()}});
  out.day=day;ok(!day.night&&!day.on,'1 a day event stays day');
  await ctx.close()}

/* ======== 2. Manager: the second bout, Match Week, the square at dusk ======== */
{const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown')});
  const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));await pg.goto(URL0);await pg.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:20000});
  const M=await pg.evaluate(()=>{if(CUR_MODAL)CUR_MODAL.done(null);try{menuHide()}catch(e){}window.travelOK=()=>true;window.travelBlock=()=>false;
    newWorld({type:'pre',key:MGR_PRE[0].key});const w=W_();me().coin=300;w.night.travel={cost:0,paid:true};w.night.god76=null;
    const n=w.night.bouts.filter(b=>b.tier!=='spc100').map(b=>!!boutCfg(b,true).night);/* v1.0: the week's specials sit on top of Bouts I-III */const d=document.createElement('div');d.innerHTML=nightHTML();const cards=[...d.querySelectorAll('.card2.bout:not(.spc100)')].slice(0,3);
    return {n,cards:cards.map(c=>!!c.querySelector('.nt91')),tag:(d.querySelector('.nt91')||{}).textContent||''}});
  out.mgr=M;ok(M.n.length===3&&!M.n[0]&&M.n[1]&&!M.n[2],'5 only the 2nd bout is at night '+M.n);
  ok(M.cards.length===3&&!M.cards[0]&&M.cards[1]&&!M.cards[2],'5 the 🌙 tag on the 2nd card only '+M.cards);ok(/🌙/.test(M.tag),'5 tag reads 🌙 '+M.tag);
  const city=async done0=>pg.evaluate(async d0=>{const W8=ms=>new Promise(r=>setTimeout(r,ms));const w=W_();w.night.bouts[0].done=d0;w.night.bouts[1].done=false;w.night.hornsLock=null;
    if(CITY.open)closeCity(()=>{});await W8(300);openCitySquare(w.night.loc,{prematch:true});await W8(2200);
    const g=CITY.c2,c=CITY.cv;const d=g.getImageData(0,0,c.width,Math.round(c.height*0.6)).data;let l=0,bl=0,r=0,n=0;for(let i=0;i<d.length;i+=16){l+=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];r+=d[i];bl+=d[i+2];n++}
    return {dusk:!!CB89.dusk91,lum:l/n,br:bl/Math.max(1,r)}},done0);
  const day=await city(false);if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv91n_city_day.png')});
  const dusk=await city(true);if(SHOT)await pg.screenshot({path:path.join(SHOT,'tv91n_city_dusk.png')});
  out.city={day,dusk};ok(!day.dusk,'6 daylight before the first bout');ok(dusk.dusk,'6 dusk before the night bout');ok(dusk.lum<day.lum*0.9,`6 the dusk square is darker (${dusk.lum.toFixed(1)} vs ${day.lum.toFixed(1)})`);
  await pg.evaluate(()=>{if(CITY.open)closeCity(()=>{})});
  await ctx.close()}

/* ======== 3. Online: the host's Day/Night reaches both screens (mock, two windows) ======== */
{const ctx=await b.newContext({viewport:{width:1300,height:900}});await ctx.route(/fonts\./,r=>r.abort());
  await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});localStorage.setItem('flavius_firstrun','shown');localStorage.setItem('flavius_online77','1');localStorage.setItem('flavius_tally102off','1');localStorage.setItem('flavius_onlcd83','0');localStorage.removeItem('flavius_onltest89')});
  const open=async(n,first)=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(n+':'+e.message+' '+(e.stack||'').split('\n')[1]));await p.goto(URL0);if(first)await p.evaluate(()=>localStorage.removeItem('flavius_onlmock'));await p.waitForFunction(()=>window.FLAVIUS_READY,null,{timeout:15000});return p};
  const setup=async(p,name,cls)=>p.evaluate(async([name,cls])=>{if(CUR_MODAL)CUR_MODAL.done(null);menuHide();ONL.acct=await NET.req('auth.signin',{name});await NET.req('domus.create',{name:'Domus '+name});ONL.char=await NET.req('char.create',{name:name+' the Bold',cls});return ONL.acct.id},[name,cls]);
  const until=async(p,fn,arg,ms=20000)=>{for(let t0=Date.now();Date.now()-t0<ms;){if(await p.evaluate(fn,arg))return true;await p.waitForTimeout(150)}return false};
  const A=await open('A',true),B=await open('B');await setup(A,'Alpha','hero');await setup(B,'Beta','soldier');
  const L=await A.evaluate(async()=>await NET.req('lobby.create',{ev:'democritus',loc:6,seats:4,ranked:false,abandon:'cpu',cry:false}));
  out.default=!!L.night;ok(!L.night,'7 a new room is by day');
  for(let k=0;k<8;k++){const j=await B.evaluate(async id=>{try{await NET.req('lobby.join',{id})}catch(e){}await new Promise(r=>setTimeout(r,300));return (await NET.req('lobby.list')).some(L=>L.id===id&&(L.members||[]).some(x=>x.id===ONL.acct.id))},L.id);if(j)break;await B.waitForTimeout(400)}
  /* the host's room screen offers the choice; the guest's does not */
  for(const p of [A,B]){await p.evaluate(()=>{onlineOpen('lobby')});await p.waitForSelector('#onl #onlRoom80',{timeout:15000}).catch(()=>{})}
  out.sel=[await A.evaluate(()=>!!document.querySelector('#onl [data-onlrs="night"]')),await B.evaluate(()=>!!document.querySelector('#onl [data-onlrs="night"]'))];
  ok(out.sel[0]&&!out.sel[1],'7 the host picks Day/Night '+out.sel);
  /* the host picks Night through the room's select */
  await A.evaluate(()=>{const s=document.querySelector('#onl [data-onlrs="night"]');if(s){s.value='1';s.dispatchEvent(new Event('change',{bubbles:true}))}});
  out.hostSet=await until(A,id=>!!(mockLoad().lobbies[id]||{}).night,L.id,10000);ok(out.hostSet,'7 lobby.set night lands in the room');
  out.guestSees=await until(B,id=>{const R=(ONL.lobbies||[]).find(x=>x.id===id);return !!(R&&R.night)&&/🌙/.test((document.querySelector('#onl .r80-rules')||{}).textContent||'')},L.id,40000);
  ok(out.guestSees,'7 the other lanista sees 🌙 Night in the room');
  /* the match: both screens at night */
  await until(A,id=>ONLC.humansOf(mockLoad().lobbies[id]||{}).length>=2,L.id);
  const L2=await A.evaluate(async id=>{const L=await NET.req('lobby.start',{id});onlEnter(L);return L},L.id);await B.evaluate(L=>onlEnter(L),L2);
  const both=[A,B];
  const drive=async p=>{await p.evaluate(()=>{if(CUR_MODAL&&(!ONLM.on||onlmMine()||ONLM.info>0||(onlmOwner()===ONLM.me&&!ONLM.pend))){const b=document.querySelector('#modal .mbtns .primary')||document.querySelector('#modal .mbtns button');if(b)b.click()}}).catch(()=>{})};
  let live=false;for(let t0=Date.now();Date.now()-t0<60000;){const r=await Promise.all(both.map(p=>p.evaluate(id=>!!(S&&S.onl&&S.onl.lobby===id&&typeof ONLM!=='undefined'&&ONLM.on),L.id)));if(r.every(Boolean)){live=true;break}for(const p of both)await drive(p);await A.waitForTimeout(200)}
  out.live=live;ok(live,'8 both screens in the match');
  out.nightOn=await Promise.all(both.map(p=>p.evaluate(()=>({S:!!S.night,on:night91On(),hashSame:typeof onlHash==='function'?(()=>{const h1=onlHash();const n0=S.night;S.night=!n0;const h2=onlHash();S.night=n0;return h1===h2})():true}))));
  ok(out.nightOn.every(x=>x.on),'8 night on both screens '+JSON.stringify(out.nightOn));ok(out.nightOn.every(x=>x.hashSame),'8 night is never in the lockstep hash');
  if(SHOT){await A.screenshot({path:path.join(SHOT,'tv91n_onlA.png')});await B.screenshot({path:path.join(SHOT,'tv91n_onlB.png')})}
  await ctx.close()}
console.log(JSON.stringify(out));console.log('MISS',JSON.stringify(miss));console.log('ERRS',JSON.stringify(errs.slice(0,6)));await b.close();srv.close();process.exit(miss.length||errs.length?1:0)})();
